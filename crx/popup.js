const $ = (i) => document.getElementById(i);
class ZcxJamesWaveTable{
    constructor(){
        this.regions = ['as1', 'as2', 'eu1', 'eu2', 'us1', 'us2'];
        this.table = null;
    }
    createTable(){
        if($('jsonDataTable')) return;
        const table = document.createElement('table');
        table.id = 'jsonDataTable';
        table.innerHTML = `
            <thead>
                <tr><th class="jsonTableCell"></th>
                    <th class="jsonTableCell" id="thUltra">Ultra</th>
                    <th class="jsonTableCell" id="thSuper">Super</th>
                    <th class="jsonTableCell" id="thHyper">Hyper</th>
                </tr>
            </thead>
            <tbody>
                ${this.regions.map(region => `
                    <tr id="tr${region}">
                        <td class="jsonTableCell">${region}</td>
                        <td class="jsonTableCell" id="${region}_Ultra">N/A</td>
                        <td class="jsonTableCell" id="${region}_Super">N/A</td>
                        <td class="jsonTableCell" id="${region}_Hyper">N/A</td>
                    </tr>`).join('')}
            </tbody>`;
        $('message').appendChild(table);
        this.table = table;
    }
    start(){
        this.createTable();
        setInterval(() => {
            this.fetchAndUpdateTable();
        }, 1000);
    }
    xmlhttpRequest(options){
        var fetchOptions = {
            method: options.method,
            headers: options.headers || {},
            body: options.data ? JSON.stringify(options.data) : null
        };
        fetch(options.url, fetchOptions)
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
            })
            .then(data => {
                if (options.onload) {
                    options.onload({ responseText: data });
                }
            })
            .catch(error => {
                if (options.onerror) {
                    options.onerror({ statusText: error.message });
                }
            });
    }
    updateTable(jsonData) {
        if(!this.table) return;
        $('thUltra').style.display = 'table-cell';
        $('thSuper').style.display = 'table-cell';
        $('thHyper').style.display = 'table-cell';
        Object.entries(jsonData).forEach(([region, data]) => {
            this.updateCell(region, data);
        })
    }
    updateCell(key, data) {
        const timeValue = data.status;
        const progress = data.progress || 'N/A';
        let cell = $(key);
        cell.innerHTML = progress;
        cell.style.color = timeValue ? 'orange' : 'black';
    }
    fetchAndUpdateTable() {
        this.xmlhttpRequest({
            method: 'GET',
            url: 'https://zcxjames.top/asdjkla.json',
            onload: response => {
                this.updateTable(JSON.parse(response.responseText));
            },
            onerror: error => {
                console.log(error)
            }
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const messageDiv = document.getElementById("message");
    fetch("https://stats.hornex.pro/api/userCount")
       .then(response => response.json())
       .then(data => {
            [$('eu1').innerHTML, $('eu2').innerHTML, $('us1').innerHTML, $('us2').innerHTML, $('as1').innerHTML, $('as2').innerHTML, $('sb').innerHTML] = Object.values(data);
       })
       .catch(error => {
            messageDiv.innerHTML = "Error getting user count: " + error;
       });
    new ZcxJamesWaveTable().start();
});