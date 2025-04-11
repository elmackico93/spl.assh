#!/bin/bash

TARGET="index.html"
TMP="index.tmp"

echo "⚙️ Applying final layout fix to $TARGET..."

# Step 1: Wrap the sidebar and content into a unified layout
awk '
BEGIN { inserted = 0 }
/<section[^>]*id="getting-started"/ && inserted == 0 {
  print "<div class=\"m-container m-py-5\">"
  print "  <div class=\"docs-layout\">"
  inserted = 1
}
{ print }
/<!-- END: last section -->/ && inserted == 1 {
  print "  </div> <!-- .docs-layout -->"
  print "</div> <!-- .m-container -->"
  inserted = 2
}
' "$TARGET" > "$TMP" && mv "$TMP" "$TARGET"

# Step 2: Remove broken flex/grid structures inside content
sed -i 's/class="m-container m-py-5"/class="docs-section"/g' "$TARGET"
sed -i 's/class="m-py-5"/class="docs-section"/g' "$TARGET"
sed -i '/<div class=".*grid.*">/,/<\/div>/d' "$TARGET"

echo "✅ Layout realigned: sidebar left, content vertical. Done!"