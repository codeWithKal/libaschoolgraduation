#!/bin/bash

DIR="./public/images/welcome_day"
OUTPUT="./data/welcome_day.json"

mkdir -p "$(dirname "$OUTPUT")"

echo "[" > "$OUTPUT"

# Collect and sort files by numeric part (welcome123)
all_files=$(ls "$DIR" | grep -E 'welcome[0-9]+' | sort -V)

# Separate images and videos
images=()
videos=()

for file in $all_files; do
    ext="${file##*.}"
    
    if [[ "$ext" == "jpg" || "$ext" == "jpeg" || "$ext" == "png" || "$ext" == "webp" ]]; then
        images+=("$file")
    elif [[ "$ext" == "mp4" || "$ext" == "mov" || "$ext" == "webm" ]]; then
        videos+=("$file")
    fi
done

# Combine: images first, then videos
sorted_files=("${images[@]}" "${videos[@]}")

id=1
first=1

for file in "${sorted_files[@]}"; do
    ext="${file##*.}"
    name="${file%.*}"

    number=$(echo "$file" | grep -oE '[0-9]+' | head -1)

    type=""
    if [[ "$ext" == "jpg" || "$ext" == "jpeg" || "$ext" == "png" || "$ext" == "webp" ]]; then
        type="image"
    elif [[ "$ext" == "mp4" || "$ext" == "mov" || "$ext" == "webm" ]]; then
        type="video"
    else
        continue
    fi

    # comma handling
    if [ $first -eq 0 ]; then
        echo "," >> "$OUTPUT"
    fi
    first=0

    cat >> "$OUTPUT" <<EOF
  {
    "id": $id,
    "type": "$type",
    "url": "/images/welcome_day/$file",
    "caption": "welcome Day $type $number",
    "studentId": $number
  }
EOF

    id=$((id + 1))
done

echo "" >> "$OUTPUT"
echo "]" >> "$OUTPUT"

echo "✅ JSON generated at $OUTPUT"