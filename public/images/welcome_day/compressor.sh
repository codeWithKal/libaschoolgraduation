#!/bin/bash

mkdir -p compressed

echo "Starting ULTRA compression..."

# ======================
# 🖼️ IMAGES (very small web size)
# ======================
for img in *.{jpg,jpeg,png}; do
  [ -e "$img" ] || continue

  name="${img%.*}"

  convert "$img" \
    -strip \
    -resize 1280x1280\> \
    -interlace Plane \
    -sampling-factor 4:2:0 \
    -quality 60 \
    -define jpeg:extent=300kb \
    "compressed/${name}.jpg"

  echo "Compressed image: $img"
done


# ======================
# 🎥 VIDEOS (strong compression)
# ======================
for vid in *.{mp4,mov,mkv}; do
  [ -e "$vid" ] || continue

  name="${vid%.*}"

  ffmpeg -i "$vid" \
    -vf "scale='min(1280,iw)':-2" \
    -vcodec libx264 \
    -crf 32 \
    -preset veryfast \
    -b:v 800k \
    -maxrate 800k \
    -bufsize 1600k \
    -acodec aac \
    -b:a 96k \
    -movflags +faststart \
    "compressed/${name}.mp4"

  echo "Compressed video: $vid"
done

echo "DONE ✔ Ultra compressed files are in /compressed"
