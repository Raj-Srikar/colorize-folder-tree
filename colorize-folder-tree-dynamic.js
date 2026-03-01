/*
 * Colorize Folder Tree — Dynamic Rainbow Borders
 *
 * This script runs inside VS Code's workbench.
 * It watches for .indent-guide elements in the Explorer and
 * applies border colors based on their nth-child position,
 * cycling through the palette infinitely.
 *
 * ── EDIT THE PALETTE BELOW TO CHANGE COLORS ──
 */
(function () {
    const PALETTE = [
        '#e5c07b', // Gold
        '#c678dd', // Magenta
        '#61afef', // Blue
        '#98c379', // Green
        '#d19a66', // Orange
        '#56b6c2', // Cyan
    ];

    function colorizeIndentGuides(root) {
        const guides = root.querySelectorAll('.indent-guide');
        guides.forEach(function (guide) {
            // Determine which child this guide is (1-based index)
            const parent = guide.parentElement;
            if (!parent) return;

            const children = Array.from(parent.children);
            const index = children.indexOf(guide);
            if (index < 0) return;

            // Cycle through the palette
            const color = PALETTE[index % PALETTE.length];
            guide.style.borderLeftColor = color;
        });
    }

    // Initial pass
    colorizeIndentGuides(document);

    // Watch for DOM changes (folders expanding, scrolling, etc.)
    const observer = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
            // If new nodes were added, colorize them
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && node.classList.contains('indent-guide')) {
                        const parent = node.parentElement;
                        if (parent) colorizeIndentGuides(parent);
                    } else {
                        colorizeIndentGuides(node);
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();
