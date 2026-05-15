#!/bin/bash

DIR="./public/images/welcome_day"
OUTPUT="./public/data/welcome_day.json"

mkdir -p "$(dirname "$OUTPUT")"

echo "[" > "$OUTPUT"

# Collect and sort files by numeric part (welcome123)
files=$(ls "$DIR" | grep -E 'welcome[0-9]+' | sort -V)

id=1
first=1

for file in $files; do
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
