/**
 * Dockside emblem logo — heraldic crossed-rods design.
 *
 *  ViewBox: 0 0 160 150
 *  Oval:    <ellipse> cx=80 cy=90 rx=70 ry=27  (140×54 units, ~140×60px at default size)
 *  Left rod: butt (16,146) → tip (104,0)   — cross at (80,40), above oval top y=63
 *  Right rod: butt (144,146) → tip (56,0)
 *
 *  Rod angle: atan2(-146,88) ≈ -59° from horizontal.
 *  Reels rotated to sit on the rod:
 *    Left  → rotate(-59)
 *    Right → rotate(59) scale(-1,1)   [mirrors the design so it's symmetric]
 *
 *  Mask: hides all rod/reel/ring content inside the oval so text is never covered.
 */
export default function DocksideLogo({ size = 160 }: { size?: number }) {
  const gold = "#E8A838";

  return (
    <svg
      width={size}
      height={Math.round(size * 150 / 160)}
      viewBox="0 0 160 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="dockside-rod-mask">
          <rect width="160" height="150" fill="white"/>
          <ellipse cx="80" cy="90" rx="70" ry="27" fill="black"/>
        </mask>
      </defs>

      {/* ── ROD GROUP (everything behind the oval) ──────────────────────── */}
      <g mask="url(#dockside-rod-mask)" opacity="0.85">

        {/* ── LEFT ROD  butt (16,146) → tip (104,0) ── */}
        {/* 5 overlapping layers: 3px at butt tapering to 0.9px at tip */}
        <line x1="16"  y1="146" x2="104" y2="0"  stroke={gold} strokeWidth="3"   strokeLinecap="round"/>
        <line x1="49"  y1="91"  x2="104" y2="0"  stroke={gold} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="66"  y1="63"  x2="104" y2="0"  stroke={gold} strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="80"  y1="39"  x2="104" y2="0"  stroke={gold} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="93"  y1="18"  x2="104" y2="0"  stroke={gold} strokeWidth="0.9" strokeLinecap="round"/>

        {/* ── RIGHT ROD  butt (144,146) → tip (56,0) ── */}
        <line x1="144" y1="146" x2="56"  y2="0"  stroke={gold} strokeWidth="3"   strokeLinecap="round"/>
        <line x1="111" y1="91"  x2="56"  y2="0"  stroke={gold} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="94"  y1="63"  x2="56"  y2="0"  stroke={gold} strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="80"  y1="39"  x2="56"  y2="0"  stroke={gold} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="67"  y1="18"  x2="56"  y2="0"  stroke={gold} strokeWidth="0.9" strokeLinecap="round"/>

        {/* ── LEFT REEL  at butt-end ~(25,131), rotated -59° to sit on the rod ──
              Local coords (before transform): long axis = x, short axis = y
              Spool body: 14w × 10h rect centered at origin
              Bail arm:   arc from (−6,−5) peaking at (0,−11) to (6,−5) — arcs over the spool
              Handle:     line drops from bottom center to knob
        ── */}
        <g transform="translate(25,131) rotate(-59)">
          {/* Outer spool body */}
          <rect x="-7" y="-5" width="14" height="10" rx="2"
            stroke={gold} strokeWidth="1.1" fill="none"/>
          {/* Inner spool sleeve */}
          <rect x="-4.5" y="-3" width="9" height="6" rx="1"
            stroke={gold} strokeWidth="0.7" fill="none"/>
          {/* Bail arm — curves over the front of the spool */}
          <path d="M -6 -5 C -6 -11, 6 -11, 6 -5"
            stroke={gold} strokeWidth="0.9" fill="none"/>
          {/* Handle shaft + knob */}
          <line x1="0" y1="5" x2="0" y2="12"
            stroke={gold} strokeWidth="1" strokeLinecap="round"/>
          <circle cx="0" cy="12" r="1.8"
            stroke={gold} strokeWidth="0.9" fill="none"/>
        </g>

        {/* ── RIGHT REEL  at ~(135,131)
              Same template as left, mirrored with scale(-1,1) so handle/bail
              are on the correct side for the opposing rod angle.
        ── */}
        <g transform="translate(135,131) rotate(59) scale(-1,1)">
          <rect x="-7" y="-5" width="14" height="10" rx="2"
            stroke={gold} strokeWidth="1.1" fill="none"/>
          <rect x="-4.5" y="-3" width="9" height="6" rx="1"
            stroke={gold} strokeWidth="0.7" fill="none"/>
          <path d="M -6 -5 C -6 -11, 6 -11, 6 -5"
            stroke={gold} strokeWidth="0.9" fill="none"/>
          <line x1="0" y1="5" x2="0" y2="12"
            stroke={gold} strokeWidth="1" strokeLinecap="round"/>
          <circle cx="0" cy="12" r="1.8"
            stroke={gold} strokeWidth="0.9" fill="none"/>
        </g>

        {/* ── GUIDE RINGS — left rod  (t ≈ 0.63, 0.78, 0.92 from butt) ──
              All three are above the oval (y < 63) so they're always visible.
              Each is an open circle with a small filled center dot.
        ── */}
        <circle cx="71" cy="54" r="2.5" stroke={gold} strokeWidth="0.9"/>
        <circle cx="71" cy="54" r="0.8" fill={gold}/>

        <circle cx="85" cy="32" r="2.5" stroke={gold} strokeWidth="0.9"/>
        <circle cx="85" cy="32" r="0.8" fill={gold}/>

        <circle cx="97" cy="12" r="2.5" stroke={gold} strokeWidth="0.9"/>
        <circle cx="97" cy="12" r="0.8" fill={gold}/>

        {/* ── GUIDE RINGS — right rod  (symmetric about x=80) ── */}
        <circle cx="89" cy="54" r="2.5" stroke={gold} strokeWidth="0.9"/>
        <circle cx="89" cy="54" r="0.8" fill={gold}/>

        <circle cx="75" cy="32" r="2.5" stroke={gold} strokeWidth="0.9"/>
        <circle cx="75" cy="32" r="0.8" fill={gold}/>

        <circle cx="63" cy="12" r="2.5" stroke={gold} strokeWidth="0.9"/>
        <circle cx="63" cy="12" r="0.8" fill={gold}/>

        {/* ── FISHING LINES from rod tips — drop outward, 0.8px at 60% opacity ──
              Left tip (104,0): curves out to the right and down toward oval top
              Right tip (56,0): mirrors to the left
              Both stay above y=63 (oval top) so they are never clipped by the mask.
        ── */}
        <path d="M 104 0 C 116 22, 120 44, 116 62"
          stroke={gold} strokeWidth="0.8" opacity="0.6" strokeLinecap="round" fill="none"/>
        <path d="M 56 0 C 44 22, 40 44, 44 62"
          stroke={gold} strokeWidth="0.8" opacity="0.6" strokeLinecap="round" fill="none"/>

      </g>{/* end mask group */}

      {/* ── OVAL FRAME ──────────────────────────────────────────────────── */}
      <ellipse cx="80" cy="90" rx="70" ry="27" stroke={gold} strokeWidth="1.3"/>

      {/* ── HORIZONTAL RULES inside oval ────────────────────────────────── */}
      <line x1="25" y1="80"  x2="135" y2="80"  stroke={gold} strokeWidth="0.9"/>
      <line x1="25" y1="100" x2="135" y2="100" stroke={gold} strokeWidth="0.9"/>

      {/* ── DOCKSIDE TEXT — top z-order, never obscured ──────────────────── */}
      <text
        x="80" y="90"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={gold}
        fontSize="12"
        fontWeight="bold"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="4"
      >
        DOCKSIDE
      </text>
    </svg>
  );
}
