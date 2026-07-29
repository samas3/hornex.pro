function sendRequest(url, method, data, callback) {
    GM_xmlhttpRequest({
        method: method,
        url: url,
        data: data,
        onload: function(response) {
            callback(response.responseText);
        }
    });
}
sendRequest('http://zcxjames.top/write', 'POST', {'key': '123456', 'json': {}}, function(response) {
    console.log(response);
});
sendRequest('http://zcxjames.top/read', 'POST', {'key': '123456'}, function(response) {
    console.log(response);
});