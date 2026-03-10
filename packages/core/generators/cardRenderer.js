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
        title: titleColor = "#58a6ff"
    } = colors;

    return `
  <g transform="translate(${x}, ${y})">
  
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
      font-size="17"
      font-weight="600">
      ${title}
    </text>
  
    <g transform="translate(0,0)">
      ${content}
    </g>
  
  </g>
  `;
}

module.exports = { renderCard };