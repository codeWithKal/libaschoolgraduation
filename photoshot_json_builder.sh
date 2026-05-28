#!/bin/bash

DIR="./public/images/photoshot_day"
OUTPUT="./data/photoshot_day.json"

mkdir -p "$(dirname "$OUTPUT")"

echo "[" > "$OUTPUT"

# Collect all supported files
all_files=$(find "$DIR" -maxdepth 1 -type f | xargs -n1 basename | sort -V)

# Arrays
images=()
videos=()

for file in $all_files; do
    ext=$(echo "${file##*.}" | tr '[:upper:]' '[:lower:]')

    case "$ext" in
        jpg|jpeg|png|webp)
            images+=("$file")
            ;;
        mp4|mov|webm)
            videos+=("$file")
            ;;
    esac
done

# Images first, then videos
sorted_files=("${images[@]}" "${videos[@]}")

id=1
first=1

for file in "${sorted_files[@]}"; do
    ext=$(echo "${file##*.}" | tr '[:upper:]' '[:lower:]')

    if [[ "$ext" =~ ^(jpg|jpeg|png|webp)$ ]]; then
        type="image"
    else
        type="video"
    fi

    # Extract first number from filename
    number=$(echo "$file" | grep -oE '[0-9]+' | head -1)

    # fallback if no number exists
    if [ -z "$number" ]; then
        number=$id
    fi

    # Add comma except first item
    if [ $first -eq 0 ]; then
        echo "," >> "$OUTPUT"
    fi
    first=0

    cat >> "$OUTPUT" <<EOF
  {
    "id": $id,
    "type": "$type",
    "url": "/images/photoshot_day/$file",
    "caption": "Photoshot Day $type $number"
  }
EOF

    id=$((id + 1))
done

echo "" >> "$OUTPUT"
echo "]" >> "$OUTPUT"

echo "✅ JSON generated at $OUTPUT"