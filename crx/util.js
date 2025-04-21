const GUIUtil = {
    createPopupBox: function(elem, w, h){
        let box = document.createElement('div');
        box.className = 'p-box';
        box.style.width = w + 'px';
        box.style.height = h + 'px';
        let close = document.createElement('div');
        close.className = 'p-close';
        close.innerHTML = '×';
        close.onclick = () => document.body.removeChild(box);
        box.appendChild(close);
        box.appendChild(elem);
        document.body.appendChild(box);
        return box;
    },
    createInfoBox: function(){
        let div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.padding = '10px';
        div.style.zIndex = '1';
        document.body.appendChild(div);
        return div;
    }
}
const $ = (i) => document.getElementById.bind(document)(i);
const $$ = (i) => document.querySelector.bind(document)(i);
const $_ = (i) => document.querySelectorAll.bind(document)(i);
function setStroke(element, text){
    if(element){
        element.setAttribute('stroke', text);
    }
}
function setVisibility(element, visible){
    if(element){
        element.style.display = visible ? '' : 'none';
    }
}
async function writeClipboard(content){
    let clip = navigator.clipboard;
    if(clip){
        await clip.writeText(content);
    }
}
async function readClipboard(){
    let clip = navigator.clipboard;
    if(clip){
        return await clip.readText();
    }
    return null;
}

class ZcxJamesWaveTable{
    constructor(hack){
        this.scriptVersion = '3.0s';
        this.regions = ['as1', 'as2', 'eu1', 'eu2', 'us1', 'us2'];
        this.previousServer = '';
        this.previousZone = '';
        this.previousProgress = '';
        this.currentServer = '';
        this.currentZone = '';
        this.progress = '';
        this.showZone = [JSON.parse(localStorage.getItem('showUltra')) ?? false,
            JSON.parse(localStorage.getItem('showSuper')) ?? true,
            JSON.parse(localStorage.getItem('showHyper')) ?? true]
        this.servers = {
            'eu1': 'rgb(166, 56, 237)', 'eu2': 'rgb(81, 121, 251)', 'as1': 'rgb(237, 61, 234)', 'us1': 'rgb(219, 130, 41)', 'us2': 'rgb(237, 236, 61)', 'as2': 'rgb(61, 179, 203)'
        };
        this.zones = {
            Ultra: 'rgb(255, 43, 117)', Super: 'rgb(43, 255, 163)', Hyper: 'rgb(92, 116, 176)', Waveroom: 'rgb(126, 239, 109)'
        };
        this.modalOverlay = null;
        this.table = null;
        this.hack = hack;
    }
    createModalOverlay() {
        if($('modalOverlay')) return;
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'modalOverlay';
        const modalContent = document.createElement('div');
        modalContent.id ='modalContent';
        const infoSidebar = document.createElement('div');
        infoSidebar.id = 'infoSidebar';
        infoSidebar.innerHTML = `
            <h3>settings</h3>
            <label><input type="checkbox" id="showUltra" ${this.showZone[0] ? 'checked' : ''}> Ultra</label><br>
            <label><input type="checkbox" id="showSuper" ${this.showZone[1] ? 'checked' : ''}> Super</label><br>
            <label><input type="checkbox" id="showHyper" ${this.showZone[2] ? 'checked' : ''}> Hyper</label><br>
            <hr>
            <h3>information</h3>
            <button id="loadInfo">show full introduction</button>
            <div id="infoContent" style="margin-top: 10px;"></div>
        `;
        modalContent.appendChild(infoSidebar);
        const infoArea = document.createElement('div');
        infoArea.id = 'infoArea';
        infoArea.classList = 'infoArea1';
        infoArea.innerHTML = `
            <h2>About ZcxJames' hornex wave script</h2>
            <p id="info">author:ZcxJames<br>
            version: ${this.scriptVersion}<br>
            Script homepage: <a href="https://zcxjames.top/zcxjames_hornex_wave_script/" target="_blank">zcxjames.top/zcxjames_hornex_wave_script/</a></p>
            <button id="closeModalBtn">close</button>
        `;
        modalContent.appendChild(infoArea);
        modalOverlay.appendChild(modalContent);
        this.showinfo1 = () => this.loadScriptInfo();
        this.showinfo2 = () => {
            $('info').innerHTML = `author:ZcxJames<br>
            version: ${this.scriptVersion}<br>
            Script homepage: <a href="https://zcxjames.top/zcxjames_hornex_wave_script/" target="_blank">zcxjames.top/zcxjames_hornex_wave_script/</a>`;
            $('loadInfo').innerHTML = 'show full introduction';
            infoArea.classList = 'infoArea1';
            $('loadInfo').removeEventListener('click', this.showinfo2);
            $('loadInfo').addEventListener('click', this.showinfo1);
        }
        this.onchangeU = (event) => {
            this.showZone[0] = event.target.checked;
            localStorage.setItem('showUltra', JSON.stringify(this.showZone[0]));
            this.fetchAndUpdateTable();
        };
        this.onchangeS = (event) => {
            this.showZone[1] = event.target.checked;
            localStorage.setItem('showSuper', JSON.stringify(this.showZone[1]));
            this.fetchAndUpdateTable();
        };
        this.onchangeH = (event) => {
            this.showZone[2] = event.target.checked;
            localStorage.setItem('showHyper', JSON.stringify(this.showZone[2]));
            this.fetchAndUpdateTable();
        };
        this.onclose = () => {
            $('loadInfo').removeEventListener('click', this.showinfo1);
            $('showUltra').removeEventListener('change', this.onchangeU);
            $('showSuper').removeEventListener('change', this.onchangeS);
            $('showHyper').removeEventListener('change', this.onchangeH);
            $('closeModalBtn').removeEventListener('click', this.onclose);
            modalOverlay.remove();
        };
        this.modalOverlay = modalOverlay;
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
        table.addEventListener('click', () => this.showModal());
        document.body.appendChild(table);
        this.table = table;
    }
    start(){
        this.createModalOverlay();
        this.createTable();
        setVisibility(this.table, this.hack.configManager.get('showWaveTable').get());
        setInterval(() => {
            this.fetchAndUpdateTable();
            this.sendPost();
            this.updateData();
            setVisibility(this.table, this.hack.configManager.get('showWaveTable').get());
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
        const columnCount = this.showZone.reduce((cnt, i) => cnt + i, 0);
        const tableWidth = columnCount * 75 + 50;
        this.table.style.width = `${tableWidth}px`;
        $('thUltra').style.display = this.showZone[0] ? 'table-cell' : 'none';
        $('thSuper').style.display = this.showZone[1] ? 'table-cell' : 'none';
        $('thHyper').style.display = this.showZone[2] ? 'table-cell' : 'none';
        Object.entries(jsonData).forEach(([region, data]) => {
            this.updateCell(region, data);
        })
    }
    updateCell(key, data) {
        const timeValue = data.status;
        const progress = data.progress || 'N/A';
        let cell = $(key);
        if(!this.showZone[0] && key.includes('Ultra') || !this.showZone[1] && key.includes('Super') || !this.showZone[2] && key.includes('Hyper')){
            cell.style.display = 'none';
            return;
        }
        if(this.showZone[0] && key.includes('Ultra') || this.showZone[1] && key.includes('Super') || this.showZone[2] && key.includes('Hyper')){
            cell.style.display = 'table-cell';
        }
        cell.innerHTML = progress;
        cell.style.color = timeValue ? 'orange' : 'black';
    }
    showModal() {
        if ($('modalOverlay')) return;
        document.body.appendChild(this.modalOverlay);
        $('loadInfo').addEventListener('click', this.showinfo1);
        $('showUltra').addEventListener('change', this.onchangeU);
        $('showSuper').addEventListener('change', this.onchangeS);
        $('showHyper').addEventListener('change', this.onchangeH);
        $('closeModalBtn').addEventListener('click', this.onclose);
    }
    loadScriptInfo() {
        this.xmlhttpRequest({
            method: 'GET',
            url: 'https://zcxjames.top/script_info.txt',
            onload: response => {
                $('infoArea').classList = 'infoArea2';
                $('info').innerHTML = response.responseText;
                $('loadInfo').innerHTML = 'show brief introduction';
                $('loadInfo').removeEventListener('click', this.showinfo1);
                $('loadInfo').addEventListener('click', this.showinfo2);
            }
        });
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
    updateData() {
        this.currentServer = Object.keys(this.servers).find(server =>
            $$(`div.btn.active[style="background-color: ${this.servers[server]};"]`)) || '';
        this.currentZone = Object.keys(this.zones).find(zone =>
            $$(`div.zone-name[stroke="${zone}"]`)) || '';
        if ($$('div.zone-name[stroke="Waveroom"]')) this.currentZone = 'waveroom';
        const waveSpan = $$('body > div.hud > div.zone > div.progress > span[stroke]');
        const waveText = waveSpan ? waveSpan.getAttribute('stroke') : '';
        const waveMatch = waveText.match(/Wave (\d+)/i);
        this.progress = waveMatch ? 'Wave ' + waveMatch[1] : '0%';
        $_('div.bar').forEach(bar => {
            const matches = bar.style.transform.match(/translate\(calc\(-(\d+(\.\d+)?)% \+ \d+(\.\d+)?em\), 0px\)/);
            if (matches && matches[1]) {
                const tempProgress = (100 - parseFloat(matches[1])).toFixed(4);
                if (parseFloat(tempProgress) > parseFloat(this.progress)) this.progress = tempProgress + '%';
            }
        });
    }
    sendPost() {
        if (document.hidden) return;
        const waveEndingSpan = $$('span[stroke="Wave Ending..."]');
        if (waveEndingSpan) return;
        if (this.currentServer !== this.previousServer || this.currentZone !== this.previousZone || this.progress !== this.previousProgress) {
            this.previousServer = this.currentServer;
            this.previousZone = this.currentZone;
            this.previousProgress = this.progress;
            return;
        }
        const data = { server: this.currentServer, zone: this.currentZone, progress: this.progress, type: 'wave', profile: this.hack.player.name };
        if(this.currentZone && ['Ultra', 'Super', 'Hyper'].includes(this.currentZone)) {
            this.xmlhttpRequest({
                method: "POST",
                url: "https://zcxjames.top:5001",
                data: data,
                headers: { "Content-Type": "application/json" },
            });
        }
        this.previousProgress = this.progress;
    }
}
class BaseConfig{
    constructor(name, value){
        this.name = name;
        this.value = value;
        this.type = 'base';
    }
    get(){
        return this.value;
    }
    set(value){
        this.value = value;
    }
}
class BooleanConfig extends BaseConfig{
    constructor(name, value){
        super(name, value);
        this.type = 'boolean';
    }
    toggle(){
        this.value = !this.value;
    }
    createElement(){
        let switchLabel = document.createElement('label');
        switchLabel.className = 'switch';
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.get();
        checkbox.onclick = () => this.toggle();
        let slider = document.createElement('span');
        slider.className = 'slider';
        switchLabel.appendChild(checkbox);
        switchLabel.appendChild(slider);
        return switchLabel;
    }
}
class IntegerConfig extends BaseConfig{
    constructor(name, value){
        super(name, value);
        this.type = 'integer';
    }
    createElement(){
        let inputField = document.createElement('div');
        inputField.className = 'input-field';
        let input = document.createElement('input');
        input.className = 'input-element';
        input.type = 'number';
        input.value = this.get();
        input.onchange = () => this.set(parseInt(input.value));
        inputField.appendChild(input);
        return inputField;
    }
}
class ConfigManager{
    constructor(hack){
        this.configs = {};
        this.load();
        this.hack = hack;
    }
    add(name, value){
        switch(typeof value){
            case 'boolean':
                this.configs[name] = new BooleanConfig(name, value);
                break;
            case 'number':
                this.configs[name] = new IntegerConfig(name, value);
                break;
            default:
                this.configs[name] = new BaseConfig(name, value);
        }
    }
    get(name){
        return this.configs[name] || new BaseConfig(name, null);
    }
    set(name, value){
        this.get(name).set(value);
    }
    list(){
        return Object.keys(this.configs);
    }
    save(){
        let config = {};
        this.list().forEach(name => {
            config[name] = this.configs[name].get();
        });
        localStorage.setItem('hhConfig', JSON.stringify(config));
    }
    load(){
        let config = localStorage.getItem('hhConfig');
        this.loadDefault();
        if(config){
            config = JSON.parse(config);
            Object.keys(config).forEach(name => {
                if(this.get(name)){
                    this.get(name).set(config[name]);
                }else{
                    this.add(name, config[name]);
                }
            });
        }
        this.save();
    }
    loadDefault(){
        const configs = {
            damageDisplay: true, // 伤害显示修改
            DDenableNumber: true, // 显示伤害数值而不是百分比（若可用）
            healthDisplay: true, // 血量显示
            disableChatCheck: true, // 是否禁用聊天内容检查
            autoRespawn: true, // 自动重生
            //colorText: false, // 公告彩字
            numberNoSuffix: true, // 取消数字单位显示
            lockBuildChange: false, // 禁止更改Build
            //forceLoadScript: false, // 在脚本报错后自动刷新
            autoClickPlay: true, // 重生后自动点击Play
            allowInvalidCommand: false, // 允许聊天输入无效指令
            shinyAlert: true, // 显示shiny警报
            showRealTimePickup: true, // 显示实时拾取掉落物
            showWaveTable: true, // 是否显示wave表格
            extendedZoom: true, // 无限缩放
            showTrackUI: true, // 显示跟踪UI
            testInteger: 123
        };
        Object.entries(configs).forEach((key) => {
            this.add(...key);
        });
    }
    openGUI(){
        let main = document.createElement('div');
        let header = document.createElement('div');
        header.className = 'p-header';
        header.innerHTML = `
            <div class="p-title">Settings</div>
        `;
        main.appendChild(header);
        this.list().forEach(item => {
            let itemDiv = document.createElement('div');
            itemDiv.className = 'config-item';
            let label = document.createElement('span');
            label.className = 'config-label';
            label.innerHTML = item;
            let statusBadge = this.hack.createBadge(item);
            label.appendChild(statusBadge);
            itemDiv.appendChild(label);
            itemDiv.appendChild(this.get(item).createElement());
            main.appendChild(itemDiv);
        });
        this.hack.bindsManager.listTriggers().forEach(item => {
            let itemDiv = document.createElement('div');
            itemDiv.className = 'config-item';
            let label = document.createElement('span');
            label.className = 'config-label';
            label.textContent = item;
            let statusBadge = this.hack.createBadge(item);
            label.appendChild(statusBadge);
            itemDiv.appendChild(label);
            main.appendChild(itemDiv);
        });
        const itemHeight = 48;
        const headerHeight = 54;
        const totalHeight = headerHeight + (this.list().length + this.hack.bindsManager.list().length) * itemHeight;
        return GUIUtil.createPopupBox(main, 400, totalHeight);
    }
}
class BindsManager{
    constructor(hack){
        this.binds = {};
        this.hack = hack;
        this.triggers = {
            'openGUI': () => this.hack.configManager.openGUI(),
            'sendCoords': () => {
                let coords = this.hack.getPos();
                if(this.hack.speak) this.hack.speak(`Current coords: ${coords.join(', ')}`);
                else{
                    this.hack.addChat('You need to send something into chat to enable this!', '#ff7f50');
                }
            },
            'changeServer': () => this.hack.changeGUI(),
        };
        this.load();
    }
    add(name, value){
        this.binds[name] = value;
    }
    get(name){
        return this.binds[name];
    }
    set(name, value){
        this.binds[name] = value;
        this.save();
    }
    list(){
        return Object.keys(this.binds);
    }
    listTriggers(){
        return Object.keys(this.triggers);
    }
    save(){
        localStorage.setItem('hhKeys', JSON.stringify(this.binds));
    }
    load(){
        if(localStorage.getItem('hhKeys')){
            this.binds = JSON.parse(localStorage.getItem('hhKeys'));
        }else{
            this.loadDefault();
        }
        this.save();
    }
    trigger(name){
        if(this.get(name)){
            this.triggers[name]();
        }
    }
    loadDefault(){
        Object.entries(this.triggers).forEach((key) => {
            this.add(key[0], null);
        });
        this.hack.configManager.list().forEach((key) => {
            if(this.hack.configManager.get(key).type === 'boolean') this.add(key, null);
        });
    }
}
export { GUIUtil, $, $$, $_, ZcxJamesWaveTable, ConfigManager, setStroke, setVisibility, writeClipboard, readClipboard, BindsManager }