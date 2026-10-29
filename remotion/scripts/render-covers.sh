#!/usr/bin/env bash
# সাইটের কভার ভিডিওগুলো পুনর্নির্মাণ করে renders/site-videos/ ফোল্ডারে
set -e
cd "$(dirname "$0")/.."
mkdir -p renders/site-videos
SLUGS=(ecommerce mobileapp dashboard devblog portfolio-site)
for slug in "${SLUGS[@]}"; do
  echo "▶ Rendering CoverShowcase: $slug"
  npx remotion render src/index.ts CoverShowcase "renders/site-videos/$slug.mp4" \
    --props "{\"slug\":\"$slug\"}" --codec=h264 --crf=20
done
echo "▶ Rendering BrandIdent (avatar.mp4)"
npx remotion render src/index.ts BrandIdent renders/site-videos/avatar.mp4 --codec=h264 --crf=20
echo "✓ Done → renders/site-videos/"
