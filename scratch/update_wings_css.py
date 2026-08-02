import re

with open('/Users/vivekdutta/websites/bottomzup-website/css/wings-forge.css', 'r') as f:
    css = f.read()

# 1. Main background
css = css.replace('background: #111010;', 'background: #fbf5e8;')

# 2. Glow opacity (0.15 -> 0.06 for subtlety on light bg)
css = css.replace('opacity: 0.15;', 'opacity: 0.06;')

# 3. Text colors (Title, desc)
css = css.replace('color: #fffdf9;', 'color: #111010;')
css = css.replace('color: rgba(255, 253, 249, 0.6);', 'color: rgba(17, 16, 16, 0.7);')
css = css.replace('color: rgba(255, 253, 249, 0.7);', 'color: rgba(17, 16, 16, 0.7);')

# 4. SVG Text (.sauce-label)
css = css.replace('fill: #fffdf9 !important;', 'fill: #111010 !important;')
css = css.replace('drop-shadow(0 0 15px rgba(255,255,255,0.3))', 'drop-shadow(0 0 15px rgba(0,0,0,0.1))')

# 5. Details Card (.wm-card)
css = css.replace('background: rgba(255, 253, 249, 0.03);', 'background: #ffffff;')
css = css.replace('border: 1px solid rgba(255, 253, 249, 0.08);', 'border: 1px solid rgba(0,0,0,0.05);')
css = css.replace('box-shadow: 0 10px 40px rgba(0,0,0,0.2);', 'box-shadow: 0 12px 30px rgba(0,0,0,0.08);')

# 6. Beer Pairing box
css = css.replace('background: rgba(0, 0, 0, 0.2);', 'background: rgba(0, 0, 0, 0.03);')

with open('/Users/vivekdutta/websites/bottomzup-website/css/wings-forge.css', 'w') as f:
    f.write(css)

print("CSS updated successfully!")
