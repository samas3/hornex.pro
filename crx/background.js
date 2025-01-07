chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (newURL(tabs[0].url).href.includes('https://hornex.pro')) {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["content.js"]
            });
            chrome.action.setPopup({ tabId: tab.id, popup: "popup.html" });
        } else {
          chrome.action.setPopup({ tabId: tab.id, popup: "" });
        }
    });
});