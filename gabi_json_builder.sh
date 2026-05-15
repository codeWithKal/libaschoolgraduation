#!/bin/bash

DIR="./public/images/gabi_day"
OUTPUT="./public/data/gabi_gallery.json"

mkdir -p "$(dirname "$OUTPUT")"

echo "[" > "$OUTPUT"

# Collect and sort files by numeric part (gabi123)
files=$(ls "$DIR" | grep -E 'gabi[0-9]+' | sort -V)

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
    "url": "/images/gabi_day/$file",
    "caption": "Gabi Day $type $number",
    "studentId": $number
  }
EOF

    id=$((id + 1))
done

echo "" >> "$OUTPUT"
echo "]" >> "$OUTPUT"

echo "✅ JSON generated at $OUTPUT"
