const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

const SVG_TEMPLATES = {
    hero_bg_lavender: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF7FC"/>
      <stop offset="40%" stop-color="#EFE7F8"/>
      <stop offset="80%" stop-color="#E3D7F3"/>
      <stop offset="100%" stop-color="#D5C4EC"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/>
      <stop offset="60%" stop-color="#EAE0F5" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#D8C8EE" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="80%" stop-color="#2D1F3D" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#1F132C" stop-opacity="0.5"/>
    </radialGradient>
    <filter id="paperNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0"/>
      <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
    </filter>
  </defs>

  <!-- Background Base Gradient -->
  <rect width="1920" height="1080" fill="url(#bgGrad)"/>
  <rect width="1920" height="1080" fill="url(#sunGlow)"/>

  <!-- Soft Watercolor Splashes -->
  <g opacity="0.45" filter="blur(40px)">
    <circle cx="200" cy="180" r="320" fill="#9B82C3"/>
    <circle cx="1720" cy="220" r="380" fill="#B6A6D6"/>
    <circle cx="350" cy="900" r="400" fill="#A892D0"/>
    <circle cx="1600" cy="850" r="350" fill="#9279B9"/>
  </g>

  <!-- Decorative French Lavender Stems & Botanical Silhouettes -->
  <g opacity="0.18" fill="#352C42">
    <!-- Left Botanical Sprigs -->
    <path d="M 60 1080 Q 120 700 180 350 M 180 350 Q 190 320 200 280 M 180 350 Q 160 380 140 420 M 175 450 Q 145 470 120 500" stroke="#352C42" stroke-width="4" fill="none"/>
    <ellipse cx="200" cy="280" rx="14" ry="24" transform="rotate(-15 200 280)"/>
    <ellipse cx="190" cy="310" rx="12" ry="20" transform="rotate(-10 190 310)"/>
    <ellipse cx="180" cy="340" rx="13" ry="22" transform="rotate(-20 180 340)"/>
    <ellipse cx="170" cy="370" rx="11" ry="18"/>
    
    <path d="M 160 1080 Q 240 650 320 200" stroke="#352C42" stroke-width="3.5" fill="none"/>
    <ellipse cx="320" cy="200" rx="12" ry="22" transform="rotate(15 320 200)"/>
    <ellipse cx="310" cy="230" rx="11" ry="19" transform="rotate(10 310 230)"/>
    <ellipse cx="300" cy="260" rx="13" ry="21" transform="rotate(20 300 260)"/>

    <!-- Right Botanical Sprigs -->
    <path d="M 1860 1080 Q 1800 700 1740 350" stroke="#352C42" stroke-width="4" fill="none"/>
    <ellipse cx="1740" cy="350" rx="14" ry="24" transform="rotate(15 1740 350)"/>
    <ellipse cx="1750" cy="380" rx="12" ry="20" transform="rotate(10 1750 380)"/>
    
    <path d="M 1760 1080 Q 1680 650 1600 220" stroke="#352C42" stroke-width="3.5" fill="none"/>
    <ellipse cx="1600" cy="220" rx="12" ry="22" transform="rotate(-15 1600 220)"/>
  </g>

  <!-- Paper Texture Overlay & Dark Vignette -->
  <rect width="1920" height="1080" fill="url(#vignette)"/>
  <rect width="1920" height="1080" fill="#000" opacity="0.02" filter="url(#paperNoise)"/>
</svg>
`,
    hero_bg_cherry_blossom: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCF6FA"/>
      <stop offset="35%" stop-color="#FCE5F0"/>
      <stop offset="75%" stop-color="#F7C8DD"/>
      <stop offset="100%" stop-color="#EEAEC9"/>
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#F9DAE7" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#ECA6C4" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="85%" stop-color="#3D1927" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#280C17" stop-opacity="0.55"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bgGrad)"/>
  <rect width="1920" height="1080" fill="url(#centerGlow)"/>

  <!-- Soft Pink Watercolor Splashes -->
  <g opacity="0.5" filter="blur(45px)">
    <circle cx="250" cy="150" r="350" fill="#E085A8"/>
    <circle cx="1700" cy="180" r="400" fill="#F4C2D7"/>
    <circle cx="1600" cy="900" r="380" fill="#D96B94"/>
    <circle cx="280" cy="850" r="320" fill="#E89DBE"/>
  </g>

  <!-- Sakura Branch & Blossom Outlines -->
  <g opacity="0.2" fill="#4A2535">
    <path d="M -50 0 Q 300 120 550 80 Q 750 50 900 140" stroke="#4A2535" stroke-width="6" fill="none"/>
    <path d="M 300 120 Q 380 240 450 320" stroke="#4A2535" stroke-width="4" fill="none"/>
    
    <path d="M 1970 0 Q 1620 150 1370 100 Q 1170 60 1020 160" stroke="#4A2535" stroke-width="6" fill="none"/>

    <!-- Sakura Petal Clusters -->
    <circle cx="450" cy="320" r="18"/>
    <circle cx="470" cy="310" r="15"/>
    <circle cx="430" cy="335" r="16"/>

    <circle cx="1370" cy="100" r="22"/>
    <circle cx="1395" cy="120" r="18"/>
    <circle cx="1345" cy="85" r="17"/>
  </g>

  <rect width="1920" height="1080" fill="url(#vignette)"/>
</svg>
`,
    hero_bg_tulip: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF6F2"/>
      <stop offset="40%" stop-color="#FCEADF"/>
      <stop offset="75%" stop-color="#F8CBB7"/>
      <stop offset="100%" stop-color="#EFA88D"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="65%" stop-color="#FBE3D3" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#E87059" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="85%" stop-color="#2D130C" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#1A0A06" stop-opacity="0.55"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bgGrad)"/>
  <rect width="1920" height="1080" fill="url(#sunGlow)"/>

  <!-- Warm Coral Watercolor Splashes -->
  <g opacity="0.45" filter="blur(45px)">
    <circle cx="200" cy="200" r="360" fill="#E87059"/>
    <circle cx="1750" cy="250" r="380" fill="#E09B43"/>
    <circle cx="1650" cy="900" r="400" fill="#E47E68"/>
    <circle cx="300" cy="850" r="340" fill="#F2A285"/>
  </g>

  <!-- Tulip Flower Silhouettes -->
  <g opacity="0.18" fill="#1B4434">
    <path d="M 120 1080 Q 180 750 220 500 C 180 450 170 380 220 350 C 270 380 260 450 220 500 Z"/>
    <path d="M 1800 1080 Q 1740 750 1700 500 C 1660 450 1650 380 1700 350 C 1750 380 1740 450 1700 500 Z"/>
  </g>

  <rect width="1920" height="1080" fill="url(#vignette)"/>
</svg>
`,
    hero_bg_orchid: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF5FA"/>
      <stop offset="35%" stop-color="#F3E2F7"/>
      <stop offset="75%" stop-color="#DCB3E4"/>
      <stop offset="100%" stop-color="#BF7DC8"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="65%" stop-color="#EED5F5" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#BA7AC6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="85%" stop-color="#2D1136" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#1F0A26" stop-opacity="0.58"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bgGrad)"/>
  <rect width="1920" height="1080" fill="url(#sunGlow)"/>

  <!-- Orchid Purple Watercolor Splashes -->
  <g opacity="0.48" filter="blur(45px)">
    <circle cx="220" cy="180" r="350" fill="#BA7AC6"/>
    <circle cx="1700" cy="220" r="390" fill="#9650A5"/>
    <circle cx="1600" cy="880" r="410" fill="#AA61BA"/>
    <circle cx="320" cy="850" r="330" fill="#C88CD4"/>
  </g>

  <!-- Royal Orchid Stem Silhouettes -->
  <g opacity="0.18" fill="#33153B">
    <path d="M 80 1080 Q 200 600 350 250" stroke="#33153B" stroke-width="4.5" fill="none"/>
    <circle cx="350" cy="250" r="28"/>
    <circle cx="280" cy="380" r="24"/>
    <circle cx="210" cy="520" r="22"/>

    <path d="M 1840 1080 Q 1720 600 1570 250" stroke="#33153B" stroke-width="4.5" fill="none"/>
    <circle cx="1570" cy="250" r="28"/>
    <circle cx="1640" cy="380" r="24"/>
  </g>

  <rect width="1920" height="1080" fill="url(#vignette)"/>
</svg>
`,
    hero_bg_lotus: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3F8F7"/>
      <stop offset="35%" stop-color="#E2F2EE"/>
      <stop offset="75%" stop-color="#F4D3E0"/>
      <stop offset="100%" stop-color="#EEB4C8"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="65%" stop-color="#DFF0EB" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#88BDB6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="85%" stop-color="#0F2D2B" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0A1E1D" stop-opacity="0.55"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bgGrad)"/>
  <rect width="1920" height="1080" fill="url(#sunGlow)"/>

  <!-- Water & Lotus Pink Watercolor Splashes -->
  <g opacity="0.45" filter="blur(45px)">
    <circle cx="220" cy="180" r="360" fill="#EEB4C8"/>
    <circle cx="1700" cy="220" r="400" fill="#88BDB6"/>
    <circle cx="1600" cy="880" r="390" fill="#EEB4C8"/>
    <circle cx="300" cy="850" r="350" fill="#88BDB6"/>
  </g>

  <!-- Lotus Water Lily Silhouettes -->
  <g opacity="0.18" fill="#1D4A47">
    <ellipse cx="250" cy="850" rx="180" ry="60"/>
    <ellipse cx="1670" cy="880" rx="200" ry="65"/>
  </g>

  <rect width="1920" height="1080" fill="url(#vignette)"/>
</svg>
`,
    hero_bg_peony: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF4F6"/>
      <stop offset="35%" stop-color="#F9E2EB"/>
      <stop offset="75%" stop-color="#ECC0D0"/>
      <stop offset="100%" stop-color="#DC96AE"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="65%" stop-color="#F8E1EA" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#DC96AE" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="85%" stop-color="#2D131C" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#1F0B13" stop-opacity="0.55"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bgGrad)"/>
  <rect width="1920" height="1080" fill="url(#sunGlow)"/>

  <!-- Blushing Peony Pink Watercolor Splashes -->
  <g opacity="0.48" filter="blur(45px)">
    <circle cx="220" cy="180" r="370" fill="#DC96AE"/>
    <circle cx="1700" cy="220" r="410" fill="#C87895"/>
    <circle cx="1600" cy="880" r="390" fill="#E2A6BC"/>
    <circle cx="300" cy="850" r="340" fill="#DC96AE"/>
  </g>

  <!-- Peony Petal Scalloped Outlines -->
  <g opacity="0.18" fill="#203B2B">
    <circle cx="220" cy="250" r="140"/>
    <circle cx="1700" cy="280" r="160"/>
  </g>

  <rect width="1920" height="1080" fill="url(#vignette)"/>
</svg>
`,
    hero_bg_hydrangea: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F4F7FB"/>
      <stop offset="35%" stop-color="#E1E9F5"/>
      <stop offset="75%" stop-color="#B7CDF0"/>
      <stop offset="100%" stop-color="#8AAAE5"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="65%" stop-color="#DEE7F6" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#8AAAE5" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="85%" stop-color="#0F1B2B" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0A111C" stop-opacity="0.55"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bgGrad)"/>
  <rect width="1920" height="1080" fill="url(#sunGlow)"/>

  <!-- Coastal Hydrangea Blue & Periwinkle Watercolor Splashes -->
  <g opacity="0.48" filter="blur(45px)">
    <circle cx="220" cy="180" r="370" fill="#8AAAE5"/>
    <circle cx="1700" cy="220" r="410" fill="#6B90D6"/>
    <circle cx="1600" cy="880" r="390" fill="#A5C0F0"/>
    <circle cx="300" cy="850" r="340" fill="#8AAAE5"/>
  </g>

  <!-- Hydrangea Cluster Motifs -->
  <g opacity="0.18" fill="#1C2D42">
    <circle cx="250" cy="280" r="130"/>
    <circle cx="1670" cy="300" r="150"/>
  </g>

  <rect width="1920" height="1080" fill="url(#vignette)"/>
</svg>
`,
    hero_bg_wildflower: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF8F3"/>
      <stop offset="35%" stop-color="#F7EFC5"/>
      <stop offset="75%" stop-color="#E8D196"/>
      <stop offset="100%" stop-color="#C67D33"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="65%" stop-color="#F5EBBE" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#C67D33" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="85%" stop-color="#2D1C0F" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#1F1208" stop-opacity="0.55"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bgGrad)"/>
  <rect width="1920" height="1080" fill="url(#sunGlow)"/>

  <!-- Meadow Ochre & Coral Watercolor Splashes -->
  <g opacity="0.48" filter="blur(45px)">
    <circle cx="220" cy="180" r="370" fill="#C67D33"/>
    <circle cx="1700" cy="220" r="410" fill="#A3B18A"/>
    <circle cx="1600" cy="880" r="390" fill="#E67850"/>
    <circle cx="300" cy="850" r="340" fill="#F7EFC5"/>
  </g>

  <!-- Wildflower Stem Outlines -->
  <g opacity="0.2" fill="#3A402D">
    <path d="M 100 1080 Q 200 700 300 300 M 300 300 L 320 280 M 300 300 L 280 280" stroke="#3A402D" stroke-width="4" fill="none"/>
    <path d="M 1820 1080 Q 1720 700 1620 300" stroke="#3A402D" stroke-width="4" fill="none"/>
  </g>

  <rect width="1920" height="1080" fill="url(#vignette)"/>
</svg>
`
};

Object.keys(SVG_TEMPLATES).forEach(fileName => {
    const filePath = path.join(assetsDir, `${fileName}.svg`);
    fs.writeFileSync(filePath, SVG_TEMPLATES[fileName].trim(), 'utf8');
    console.log(`Created ${fileName}.svg successfully!`);
});
