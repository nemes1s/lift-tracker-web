#!/bin/bash
# Create placeholder PWA icons using ImageMagick or simple PNGs
# For production, replace with actual app icons

# Create a simple SVG and convert to PNGs
cat > icon.svg << 'SVGEOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563eb" rx="80"/>
  <path d="M180 180 L180 332 L220 332 L220 180 Z M260 180 L260 332 L300 332 L300 180 Z M140 280 L340 280 L340 240 L140 240 Z" fill="white" stroke="white" stroke-width="4"/>
</svg>
SVGEOF

# Check if we have tools to convert
if command -v convert &> /dev/null; then
    convert -background none icon.svg -resize 192x192 icon-192.png
    convert -background none icon.svg -resize 512x512 icon-512.png
    echo "Icons created successfully"
elif command -v magick &> /dev/null; then
    magick -background none icon.svg -resize 192x192 icon-192.png
    magick -background none icon.svg -resize 512x512 icon-512.png
    echo "Icons created successfully"
else
    echo "ImageMagick not found. Creating placeholder files..."
    # Create tiny placeholder files
    echo "PNG placeholder" > icon-192.png
    echo "PNG placeholder" > icon-512.png
    echo "Note: Replace icon-192.png and icon-512.png with actual icons"
fi
