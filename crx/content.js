const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'SCRIPT' && node.src.match(/^https:\/\/hornex\.pro\/[0-9a-f]{32}\.js/)) {
                    node.src = chrome.runtime.getURL('211a1f0e0915221053191d707b952119.js');
                    observer.disconnect();
                }
                if(node.style && node.style.backgroundImage.includes('ytimg')) {
                    node.style.backgroundImage = '';
                }
                if(node.classList && (node.classList.contains('collected-petals') || node.classList.contains('collected-rarities') || node.classList.contains('collected'))) {
                    node.remove();
                }
            });
        }
    });
});
observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
});