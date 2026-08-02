import re

with open('/Users/vivekdutta/websites/bottomzup-website/index.html', 'r') as f:
    content = f.read()

# Replace the fbx-plate div and its SVG contents
# We will use regex to find `<div class="fbx-plate"` and its closing tag, but it contains a massive SVG.
# A simpler way is to find the exact markers: 
# `<!-- Wave plate — orange + cream only (no black) · animated brand gradient -->`
# and `<!-- Ingredient deco (FreshBox sides) -->`

start_marker = '<!-- Wave plate — orange + cream only (no black) · animated brand gradient -->'
end_marker = '<!-- Ingredient deco (FreshBox sides) -->'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    replacement = '''<!-- Header Background Image -->
        <img src="./assets/BG_Header.svg" alt="" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none;" />
        
        '''
    
    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open('/Users/vivekdutta/websites/bottomzup-website/index.html', 'w') as f:
        f.write(new_content)
    print("Replaced hero background SVG with BG_Header.svg")
else:
    print("Markers not found!")
