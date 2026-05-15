#!/bin/bash

# Rename images to image1.jpg, image2.jpg, ...
img_count=1
for img in *.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}; do
    [ -e "$img" ] || continue

    new_name="welcome${img_count}.jpg"

    while [ -e "$new_name" ]; do
        ((img_count++))
        new_name="welcome${img_count}.jpg"
    done

    mv "$img" "$new_name"
    echo "Renamed $img -> $new_name"

    ((img_count++))
done

# Rename videos to video1.mp4, video2.mp4, ...
vid_count=1
for vid in *.{mp4,mkv,avi,mov,webm,MP4,MKV,AVI,MOV,WEBM}; do
    [ -e "$vid" ] || continue

    new_name="welcome${vid_count}.mp4"

    while [ -e "$new_name" ]; do
        ((vid_count++))
        new_name="welcome${vid_count}.mp4"
    done

    mv "$vid" "$new_name"
    echo "Renamed $vid -> $new_name"

    ((vid_count++))
done

echo "Done renaming files."
