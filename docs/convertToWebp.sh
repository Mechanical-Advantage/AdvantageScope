#!/bin/bash

TARGET_DIR="static/img"

if [[ ! -d "$TARGET_DIR" ]]; then
    echo "Error: Directory '$TARGET_DIR' not found."
    exit 1
fi

echo "Starting conversion..."

find "$TARGET_DIR" -type f -iname "*.png" -print0 | while IFS= read -r -d '' png_file; do
    webp_file="${png_file%.*}.webp"
    
    echo "Converting: $png_file"
    
    if cwebp -q 80 "$png_file" -o "$webp_file" -quiet; then
        rm "$png_file"
    else
        echo "Error converting $png_file."
    fi
done

echo "Conversion complete!"