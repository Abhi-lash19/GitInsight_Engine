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

    // Internal index used to track card placement order
    let col = 0;
    let rowY = startY;
    let rowHeight = 0;

    return {

        place(height = 120) {

            const x = startX + col * (cardWidth + columnGap);
            const y = rowY;

            rowHeight = Math.max(rowHeight, height);

            col++;

            if (col >= columns) {
                col = 0;
                rowY += rowHeight + rowGap;
                rowHeight = 0;
            }

            return {
                x,
                y,
                width: cardWidth,
                height
            };
        }

    };
}

module.exports = { createDashboardLayout };