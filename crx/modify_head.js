var head = document.getElementsByTagName('head')[0];
var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.runtime.getURL('style.css');
head.appendChild(style);
var script = document.createElement('script');
script.type ='module';
script.src = chrome.runtime.getURL('util.js');
head.appendChild(script);
var meta = document.createElement('meta');
meta.httpEquiv = 'Content-Security-Policy';
meta.content = 'upgrade-insecure-requests';
//head.appendChild(meta);