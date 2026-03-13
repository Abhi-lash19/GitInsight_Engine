/**
 * SVG Card Renderer
 *
 * Renders a reusable card container and translates
 * all inner content so it uses local coordinates.
 */

function renderCard({
  x = 0,
  y = 0,
  width = 400,
  height = 120,
  title = "",
  content = "",
  colors = {}
}) {

  const {
    cardBg = "#0d1117",
    border = "#30363d",
    title: titleColor = "#58a6ff",
    // Allow callers to override title font size while defaulting
    // to the original value to avoid changing existing SVG output.
    titleFontSize = 17
  } = colors;

  /**
   * create unique clip id per card
   * This prevents SVG overflow (bars / graphs escaping card boundaries)
   */
  const clipId = `clip-${x}-${y}`;

  return `
<g transform="translate(${x}, ${y})">

  <defs>
    <clipPath id="${clipId}">
      <rect width="${width}" height="${height}" rx="14"/>
    </clipPath>
  </defs>

  <rect
    width="${width}"
    height="${height}"
    rx="14"
    fill="${cardBg}"
    stroke="${border}"
  />

  <text
    x="20"
    y="30"
    fill="${titleColor}"
    font-size="${titleFontSize}"
    font-weight="600">
    ${title}
  </text>

  <!--clip content so nothing overflows card -->
  <g transform="translate(0,0)" clip-path="url(#${clipId})">
    ${content}
  </g>

</g>
`;
}

module.exports = { renderCard };