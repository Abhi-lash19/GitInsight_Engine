/**
 * Dashboard Layout Engine
 *
 * Automatically calculates card positions in a grid layout.
 * This prevents manual Y-position errors and card overlapping.
 */

function createDashboardLayout({
    startX = 0,
    startY = 0,
    cardWidth = 400,
    columnGap = 30,
    rowGap = 30,
    columns = 2
} = {}) {

    // Internal indices used to track card placement order
    let currentColumn = 0;
    let currentRowY = startY;
    let maxRowHeight = 0;
    let maxY = startY;

    return {

        /**
         * Place the next card in the grid.
         *
         * @param {number} height - Desired card height (used for row sizing).
         * @param {number} span - How many columns this card should span.
         * @returns {{x:number,y:number,width:number,height:number}}
         */
        place(height = 120, span = 1) {

            // Clamp span so it never exceeds available columns.
            const effectiveSpan = Math.max(1, Math.min(span, columns));

            // If this card would overflow the current row, move to the next row first.
            if (currentColumn + effectiveSpan > columns) {
                currentColumn = 0;
                currentRowY += maxRowHeight + rowGap;
                maxRowHeight = 0;
            }

            const x = startX + currentColumn * (cardWidth + columnGap);
            const y = currentRowY;

            maxRowHeight = Math.max(maxRowHeight, height);
            maxY = Math.max(maxY, y + height);

            currentColumn += effectiveSpan;

            if (currentColumn >= columns) {
                currentColumn = 0;
                currentRowY += maxRowHeight + rowGap;
                maxRowHeight = 0;
            }

            return {
                x,
                y,
                width: cardWidth * effectiveSpan + columnGap * (effectiveSpan - 1),
                height
            };
        },

        /**
         * Get the maximum Y coordinate reached by any placed card.
         * This can be used by the dashboard container to compute
         * a dynamic overall SVG height.
         *
         * @returns {number}
         */
        getHeight() {
            return maxY;
        },

        /**
         * Expose the configured card width so callers can calculate
         * full-width spans (e.g. span=2 cards) without duplicating
         * layout constants.
         */
        cardWidth

    };
}

module.exports = { createDashboardLayout };