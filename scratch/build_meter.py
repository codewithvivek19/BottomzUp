import re
import json

# 1. Read the clean SVG
with open("/tmp/sauce_meter_clean.svg", "r") as f:
    svg = f.read()

# 2. Make the SVG responsive and interactive
svg = svg.replace('viewBox="0 0 776.98 756.62"', 'viewBox="0 0 776.98 756.62" class="sauce-meter-svg"')

# We will extract the tspans and replace them with HTML overlay or interactive SVG text
# Actually, we can wrap each tspan in an <a> or <g> but tspan doesn't support click events well in all browsers.
# Let's replace the whole <text> block with foreignObject or individual text elements that are clickable.

# Extract tspans
tspan_regex = r'<tspan\s+x="([^"]+)"\s+y="([^"]+)">([^<]+)</tspan>'
tspans = re.findall(tspan_regex, svg)

print("Found sauces:", [t[2].strip() for t in tspans])

# Remove original text block
svg = re.sub(r'<text.*?</text>', '', svg, flags=re.DOTALL)

# Rebuild interactive text blocks
interactive_texts = []
sauces_data = []

for i, (x, y, text) in enumerate(tspans):
    name = text.strip()
    id_name = name.lower().replace(' ', '-').replace('xtra', 'extra')
    
    # Calculate a rough heat level (0 to 10)
    heat_idx = i
    
    sauces_data.append({
        'id': id_name,
        'name': name,
        'index': i
    })
    
    # SVG text element that is clickable
    interactive_texts.append(f'''
    <g class="meter-sauce-btn" data-sauce="{id_name}" data-index="{i}" transform="translate(373.2, 45.5)">
      <!-- Hitbox -->
      <rect x="-400" y="{float(y) - 30}" width="700" height="60" fill="transparent" cursor="pointer" />
      <text class="st22 sauce-label" x="{x}" y="{y}" pointer-events="none">{name}</text>
    </g>
    ''')

# Insert the interactive texts before the closing </svg>
svg = svg.replace('</svg>', '\n'.join(interactive_texts) + '\n</svg>')

# 3. Build the new HTML section
html_section = f'''    <!-- ==================== WINGS + BEER — METER ==================== -->
    <section class="wings-meter-section" id="drinks" aria-label="Wings and Beer Sauce Meter">
      <div class="container">
        
        <div class="wm-header reveal">
          <p class="wm-eyebrow">The Sauce Meter</p>
          <h2 class="wm-title">Dial your heat.</h2>
          <p class="wm-desc">Click the meter to select your sauce. From mild BBQ to Xtra Hot Buffalo.</p>
        </div>

        <div class="wm-grid">
          
          <!-- Left: The Interactive SVG Meter -->
          <div class="wm-meter-col reveal">
            {svg}
          </div>

          <!-- Right: Details panel -->
          <div class="wm-details-col reveal" style="--reveal-delay: 100ms">
            
            <div class="wm-card">
              <div class="wm-card-inner" id="wmDetailsTarget">
                <span class="wm-heat-badge" id="wmHeatBadge">Select a Sauce</span>
                <h3 class="wm-sauce-name" id="wmSauceName">Interactive Sauce Meter</h3>
                <p class="wm-sauce-desc" id="wmSauceDesc">Choose your flavor profile on the left to see beer pairings and heat details.</p>
                
                <div class="wm-pairing">
                  <span class="wm-pairing-icon">🍺</span>
                  <div class="wm-pairing-text">
                    <strong id="wmPairingBeer">Perfect Pairing</strong>
                    <span id="wmPairingNote">Select a sauce to get our expert beer recommendation.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Wing Sizes -->
            <div class="wm-sizes">
              <h4 class="wm-sizes-title">Portions</h4>
              <div class="wm-size-grid">
                <div class="wm-size-box">
                  <span class="wm-size-name">Small</span>
                  <span class="wm-size-qty">6 pc</span>
                  <span class="wm-size-price">$10</span>
                </div>
                <div class="wm-size-box is-active">
                  <span class="wm-size-name">Medium</span>
                  <span class="wm-size-qty">12 pc</span>
                  <span class="wm-size-price">$16</span>
                </div>
                <div class="wm-size-box">
                  <span class="wm-size-name">Large</span>
                  <span class="wm-size-qty">24 pc</span>
                  <span class="wm-size-price">$29</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
'''

# 4. Patch index.html
with open('/Users/vivekdutta/websites/bottomzup-website/index.html', 'r') as f:
    content = f.read()

start_marker = '<!-- ==================== WINGS + BEER — FORGE ===================='
end_marker = '<!-- ==================== VISIT / LOCATION ===================='

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + html_section + '    ' + content[end_idx:]
    with open('/Users/vivekdutta/websites/bottomzup-website/index.html', 'w') as f:
        f.write(new_content)
    print("Patched index.html with new meter section")
else:
    print("Markers not found in index.html")
