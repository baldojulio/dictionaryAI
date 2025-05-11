let rafID = 0;
let lastRect = null;
document.addEventListener("selectionchange", () => {
    if (rafID) return;

    rafID = requestAnimationFrame(() => {
        rafID = 0;
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            lastRect = selection.getRangeAt(0).getBoundingClientRect();
        }
    });
    
});

chrome.runtime.onMessage.addListener(({ type, text }) => {
    if (type !== "SHOW_MODAL" || !text) return;
    if (!lastRect) return;

    showToolTip(text, lastRect);
});

function showToolTip(text, rect) {
    const id = "define-tooltip";
    let tip = document.getElementById(id);
    if (!tip) {
        tip = document.createElement('div');
        tip.id = id;
        document.body.appendChild(tip);
    }

    tip.textContent = text;
    tip.style.left = `${rect.left + window.scrollX}px`;
    // nudge upward so it sits just above the highlight
    tip.style.top = `${rect.top + window.scrollY - tip.offsetHeight - 6}px`;


    // Click anywhere to dismiss
    function onClickOutSide(e) {
        if (!tip.contains(e.target)) {
            tip.remove();
            document.removeEventListener("mousedown", onClickOutSide)
        }
    }
    document.addEventListener("mousedown", onClickOutSide);
};