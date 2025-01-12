const $ = (i) => document.getElementById(i);
const $_ = (i) => document.querySelector.bind(document)(i);
const $$_ = (i) => document.querySelectorAll.bind(document)(i);
const GUIUtil = {
    createPopupBox: function(elem, w, h, bg='#fff'){
        let box = document.createElement('div');
        box.className = 'p-box';
        box.style.backgroundColor = bg;
        box.style.width = w + 'px';
        box.style.height = h + 'px';
        box.appendChild(elem);
        let close = document.createElement('div');
        close.className = 'p-close';
        close.innerHTML = 'X';
        close.onclick = function(){
            document.body.removeChild(box);
        };
        box.appendChild(close);
        document.body.appendChild(box);
        box.close = () => document.body.removeChild(box);
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
class ZcxJamesWaveTable{
    constructor(){
        this.scriptVersion = '3.0';
        this.regions = ['as1', 'as2', 'eu1', 'eu2', 'us1', 'us2'];
        this.tableVisible = true;
        this.previousServer = '';
        this.previousZone = '';
        this.currentServer = '';
        this.currentZone = '';
        this.progress = '';
        this.showUltra = JSON.parse(localStorage.getItem('showUltra')) ?? false;
        this.showSuper = JSON.parse(localStorage.getItem('showSuper')) ?? true;
        this.showHyper = JSON.parse(localStorage.getItem('showHyper')) ?? true;
        this.servers = {
            'eu1': 'rgb(166, 56, 237)', 'eu2': 'rgb(81, 121, 251)', 'as1': 'rgb(237, 61, 234)', 'us1': 'rgb(219, 130, 41)', 'us2': 'rgb(237, 236, 61)', 'as2': 'rgb(61, 179, 203)'
        };
        this.zones = {
            'Ultra': 'rgb(255, 43, 117)', 'Super': 'rgb(43, 255, 163)', 'Hyper': 'rgb(92, 116, 176)', 'Waveroom': 'rgb(126, 239, 109)'
        };
    }
    start(){
        document.addEventListener('keydown', (evt) => this.toggleTableVisibility(evt));
        setInterval(() => this.fetchAndUpdateTable(), 1000);
        setInterval(() => this.sendPost(), 5000);
        setInterval(() => this.updateData(), 1000);
    }
    xmlhttpRequest(options){
        var xhr = new XMLHttpRequest();
        xhr.open(options.method, options.url, true);
        if (options.headers) { 
            for (var header in options.headers) { 
                if (options.headers.hasOwnProperty(header)) { 
                    xhr.setRequestHeader(header, options.headers[header]); 
                } 
            } 
        } 
        xhr.onreadystatechange = function () { 
            if (xhr.readyState === 4) { 
                if (xhr.status >= 200 && xhr.status < 300) { 
                    if (options.onload) {
                         options.onload(xhr); 
                    } 
                } else { 
                    if (options.onerror) {
                            options.onerror(xhr);
                    }
                }
            }
        };
        xhr.send(options.data || null);
    }
    createTable(jsonData) {
        const existingTable = document.getElementById('jsonDataTable');
        if (existingTable) existingTable.remove();
        const columnCount = (this.showUltra ? 1 : 0) + (this.showSuper ? 1 : 0) + (this.showHyper ? 1 : 0);
        if (columnCount === 0) {
            this.tableVisible = false;
            return;
        }
        const tableWidth = columnCount * 75 + 50;
        const table = document.createElement('table');
        table.id = 'jsonDataTable';
        table.style.cssText = `
            position: fixed; top: 50%; right: 0; transform: translateY(-50%);
            border: 1px solid black; background-color: transparent;
            z-index: 1000; width: ${tableWidth}px; border-collapse: collapse; font-weight: lighter;
            cursor: pointer;
        `;
        table.innerHTML = `
            <thead>
                <tr><th style="border: 1px solid black;">&nbsp;</th>
                    ${this.showUltra ? '<th style="border: 1px solid black;">Ultra</th>' : ''}
                    ${this.showSuper ? '<th style="border: 1px solid black;">Super</th>' : ''}
                    ${this.showHyper ? '<th style="border: 1px solid black;">Hyper</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${this.regions.map(region => `
                    <tr>
                        <td style="border: 1px solid black;">${region}</td>
                        ${this.showUltra ? this.generateCell(region, 'Ultra', jsonData) : ''}
                        ${this.showSuper ? this.generateCell(region, 'Super', jsonData) : ''}
                        ${this.showHyper ? this.generateCell(region, 'Hyper', jsonData) : ''}
                    </tr>`).join('')}
            </tbody>`;
        table.addEventListener('click', () => this.showModal());
        document.body.appendChild(table);
        table.style.display = this.tableVisible ? 'table' : 'none';
    }
    generateCell(region, type, jsonData) {
        const key = `${region}_${type}`;
        const data = jsonData[key] || {};
        const timeValue = data.time;
        const progress = data.progress || 'N/A';
        return `<td style="border: 1px solid black; color: ${timeValue ? 'orange' : 'black'};">${progress}</td>`;
    }
    showModal() {
        if (document.getElementById('modalOverlay')) return;
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'modalOverlay';
        modalOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.5); z-index: 10000; display: flex; justify-content: center; align-items: center;
        `;
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white; padding: 20px; border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); text-align: center; max-width: 600px;
            display: flex; flex-direction: row;
        `;
        const infoSidebar = document.createElement('div');
        infoSidebar.style.cssText = `
            flex: 1; background: #f0f0f0; padding: 10px; border-right: 1px solid #ddd;
        `;
        infoSidebar.innerHTML = `
            <h3>settings</h3>
            <label><input type="checkbox" id="showUltra" ${this.showUltra ? 'checked' : ''}> Ultra</label><br>
            <label><input type="checkbox" id="showSuper" ${this.showSuper ? 'checked' : ''}> Super</label><br>
            <label><input type="checkbox" id="showHyper" ${this.showHyper ? 'checked' : ''}> Hyper</label><br>
            <hr>
            <h3>information</h3>
            <button id="loadInfo">load script's info</button>
            <div id="infoContent" style="margin-top: 10px;"></div>
        `;
        modalContent.appendChild(infoSidebar);
        const infoArea = document.createElement('div');
        infoArea.id = 'infoArea';
        infoArea.style.cssText = `
            flex: 2; padding: 20px; display: flex; flex-direction: column;
        `;
        infoArea.innerHTML = `
            <h2>About ZcxJames's hornex wave script</h2>
            <p>author:ZcxJames</p>
            <p>version: ${this.scriptVersion}</p>
            <p>Script homepage: <a href="https://zcxjames.top/zcxjames_hornex_wave_script/" target="_blank">zcxjames.top/zcxjames_hornex_wave_script/</a></p>
            <button id="closeModalBtn">close</button>
        `;
        modalContent.appendChild(infoArea);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            modalOverlay.remove();
        });
        document.getElementById('loadInfo').addEventListener('click', () => {
            this.loadScriptInfo();
        });
        document.getElementById('showUltra').addEventListener('change', (event) => {
            this.showUltra = event.target.checked;
            localStorage.setItem('showUltra', JSON.stringify(showUltra));
            this.fetchAndUpdateTable();
        });
        document.getElementById('showSuper').addEventListener('change', (event) => {
            this.showSuper = event.target.checked;
            localStorage.setItem('showSuper', JSON.stringify(showSuper));
            this.fetchAndUpdateTable();
        });
        document.getElementById('showHyper').addEventListener('change', (event) => {
            this.showHyper = event.target.checked;
            localStorage.setItem('showHyper', JSON.stringify(showHyper));
            this.fetchAndUpdateTable();
        });
    }
    loadScriptInfo() {
        document.getElementById('loadInfo').addEventListener('click', () => {
            this.xmlhttpRequest({
                method: 'GET',
                url: 'https://zcxjames.top/script_info.txt',
                onload: response => {
                    document.getElementById('infoArea').style.cssText = `
                        height: 400px;
                        overflow-y: auto;
                        padding: 10px;
                        border: 1px solid #ccc;
                        background-color: #f9f9f9;
                        word-wrap: break-word;
                    `;
                    document.getElementById('infoArea').innerHTML = `
                        <h2>about ZcxJames's hornex wave script</h2>
                        <p>${response.responseText}</p>
                        <button id="closeModalBtn">close</button>
                    `;
                    document.getElementById('closeModalBtn').addEventListener('click', () => {
                        modalOverlay.remove();
                    });
                }
            });
        });
    }
    fetchAndUpdateTable() {
        this.xmlhttpRequest({
            method: 'GET',
            url: 'https://zcxjames.top/hzzpro.json',
            onload: response => {
                this.createTable(JSON.parse(response.responseText));
            }
        });
    }
    toggleTableVisibility(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            if (!this.showUltra && !this.showSuper && !this.showHyper) {
                this.showUltra = false;
                this.showSuper = true;
                this.showHyper = true;
                localStorage.setItem('showUltra', JSON.stringify(this.showUltra));
                localStorage.setItem('showSuper', JSON.stringify(this.showSuper));
                localStorage.setItem('showHyper', JSON.stringify(this.showHyper));
                this.fetchAndUpdateTable();
                this.tableVisible = true;
            } else {
                this.tableVisible = !this.tableVisible;
            }
            const table = document.getElementById('jsonDataTable');
            if (table) table.style.display = this.tableVisible ? 'table' : 'none';
        }
    }
    updateData() {
        this.currentServer = Object.keys(this.servers).find(server =>
            document.querySelector(`div.btn.active[style="background-color: ${this.servers[server]};"]`)) || '';
        this.currentZone = Object.keys(this.zones).find(zone =>
            document.querySelector(`div.zone-name[stroke="${zone}"]`)) || '';
        if (document.querySelector('div.zone-name[stroke="Waveroom"]')) this.currentZone = 'waveroom';
        const waveSpan = document.querySelector('body > div.hud > div.zone > div.progress > span[stroke]');
        const waveText = waveSpan ? waveSpan.getAttribute('stroke') : '';
        const waveMatch = waveText.match(/Wave (\d+)/i);
        this.progress = waveMatch ? 'Wave ' + waveMatch[1] : '0%';
        document.querySelectorAll('div.bar').forEach(bar => {
            const matches = bar.style.transform.match(/translate\(calc\(-(\d+(\.\d+)?)% \+ \d+(\.\d+)?em\), 0px\)/);
            if (matches && matches[1]) {
                const tempProgress = (100 - parseFloat(matches[1])).toFixed(4);
                if (parseFloat(tempProgress) > parseFloat(this.progress)) this.progress = tempProgress + '%';
            }
        });
    }
    sendPost() {
        if (document.hidden) return;
        const waveEndingSpan = document.querySelector('span[stroke="Wave Ending..."]');
        if (waveEndingSpan) return;
        if (this.currentServer !== this.previousServer || this.currentZone !== this.previousZone) {
            this.previousServer = this.currentServer;
            this.previousZone = this.currentZone;
            return;
        }
        const data = { server: this.currentServer, zone: this.currentZone, progress: this.progress };
        if(this.currentZone && ['Ultra', 'Super', 'Hyper'].includes(this.currentZone)) {
            this.xmlhttpRequest({
                method: "POST",
                url: "https://zcxjames.top:5000",
                data: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            });
        }
    }
}
class HornexHack{
    constructor(){
        this.version = '3.0';
        this.config = {};
        this.default = {
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
            zcxJamesScript: true, // ZcxJames脚本适配
        };
        this.configKeys = Object.keys(this.default);
        this.chatFunc = null;
        this.toastFunc = null;
        this.numFunc = null;
        this.mobFunc = null;
        this.moblst = null;
        this.rarityColor = [
            '#7eef6d',
            '#ffe65d',
            '#4d52e3',
            '#861fde',
            '#de1f1f',
            '#1fdbde',
            '#ff2b75',
            '#2bffa3',
            '#5c74b0'
        ];
        this.status = '';
        this.name = `Hornex Hack v${this.version} by samas3`;
        this.commands = {
            '/profile <user>': '<internal> show user\'s profile',
            '/dlMob <mob>': '<internal> downloas an image of a specific mob',
            '/dlPetal <petal>': '<internal> download an image of a specific petal',
            '/toggle <module>': 'toggle a specific module',
            '/list': 'lists all the modules and configs',
            '/help': 'show this help',
            '/bind <module> <key>': 'bind a module to the specific key',
            '/bind <module> clear': 'clear a module\'s keybind',
            '/open': 'open the config gui',
            '/delBuild <id>': 'delete a build',
            '/viewPetal <id>': 'view a petal(add it into Build #49)',
            '/viewMob <id>': 'view a mob(add it to zone mobs)',
            '/track <id/"stop">': 'track a mob',
            //'/change <server>': 'change server(0=eu1 1=eu2 2=as1 3=us1 4=us2 5=as2, need autoRespawn enabled)',
        };
        this.hp = 0;
        this.ingame = false;
        this.player = {
            name: "",
            entity: null
        };
        this.tracking = null;
        this.petalCount = [0, 0, 0, 0, 0, 0, 0, 0];
        this.isSuicide = false;
        this.statusAbove = '';
        this.bindKeys = {};
        this.triggers = {
            'openGUI': () => this.openGUI(),
            'sendCoords': () => {
                let coords = this.getPos();
                if(this.speak) this.speak(`Current coords: ${coords.join(', ')}`);
                else{
                    this.addChat('You need to send something into chat to enable this!', '#ff7f50');
                }
            },
            'toggleTrack': () => {
                if(this.trackUI.style.display == 'none'){
                    this.trackUI.style.display = '';
                }else{
                    this.trackUI.style.display = 'none';
                }
            },
            'changeServer': () => this.changeGUI(),
        };
        this.triggerKeys = Object.keys(this.triggers);
        this.table = new ZcxJamesWaveTable();
    }
    // ----- Notice -----
    addChat(text, color='#ff00ff'){
        this.chatFunc(text, color);
    }
    addError(text){
        this.addChat(text, '#ff7f50');
    }
    moveElement(arr) {
        return arr.slice(-1).concat(arr.slice(0, -1))
    }
    loadStatus(){
        let div = GUIUtil.createInfoBox();
        div.style.bottom = '20%';
        div.style.right = '0';
        let span = document.createElement('span');
        span.style.fontSize = '15px';
        let colors = ['red', 'yellow', 'lime', 'cyan', 'blue', 'magenta'];
        //span.style.background = `linear-gradient(to right, ${colors.join(',')},${colors[0]})`
        div.style.textAlign = 'right';
        div.appendChild(span);
        setInterval(() => {
            //span.innerHTML = `<a href="https://github.com/samas3" target="_blank" class="status">${this.status}</a>`
            span.innerHTML = this.status;
            if(this.isEnabled('colorText')){
                //colors = this.moveElement(colors);
                //span.style.background = `linear-gradient(to right, ${colors.join(',')}, ${colors[0]})`
                //span.style.backgroundClip = 'text';
                //span.style.webkitTextFillColor = 'transparent';
            }
        }, 100);
    }
    setStatus(content){
        this.status = `${this.statusAbove}<br>${this.name}<br>${content}`;
    }
    loadTrack(){
        let div = GUIUtil.createInfoBox();
        div.style.left = '50%';
        div.style.top = '150px';
        div.style.transform = 'translate(-50%, 0)';
        div.style.alignSelf = 'center';
        div.style.fontSize = '25px';
        div.style.textAlign = 'center';
        div.style.padding = '10px';
        div.style.display = 'none';
        div.innerHTML = "Not Tracking";
        this.trackUI = div;
    }
    // ----- Module -----
    hasModule(module){
        return this.configKeys.includes(module);
    }
    isEnabled(module){
        return this.hasModule(module) && this.config[module];
    }
    setEnabled(module, status){
        if(this.hasModule(module)){
            this.config[module] = status;
        }else{
            this.addChat(`Module or config not found: ${module}`, '#ff7f50');
        }
    }
    toggle(module){
        if(this.hasModule(module)){
            this.config[module] = !this.isEnabled(module);
            this.addChat(`Toggled module ${module} to ${this.config[module]}`);
        }else{
            this.addChat(`Module or config not found: ${module}`, '#ff7f50');
        }
        this.saveModule();
    }
    listModule(){
        for(const item of this.configKeys){
            this.addChat(`${item}: ${this.isEnabled(item)} (defaults to ${this.default[item]})`, '#ffffff');
        }
    }
    openGUI(){
        let main = document.createElement('div');
        for(const item of this.configKeys){
            let idx = document.createElement('div');
            let txt = document.createElement('span');
            txt.innerHTML = item + (Object.keys(this.bindKeys).includes(item) ? ` (Binded to ${this.bindKeys[item]})` : ' (Not bounded)');
            txt.style.margin = '10px';
            idx.appendChild(txt);
            let cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = this.isEnabled(item);
            let that = this;
            cb.onclick = () => {
                that.toggle(item);
            };
            cb.style.float = 'right';
            idx.appendChild(cb);
            main.appendChild(idx);
        }
        for(const item of this.triggerKeys){
            let idx = document.createElement('div');
            let txt = document.createElement('span');
            txt.innerHTML = item + (Object.keys(this.bindKeys).includes(item) ? ` (Binded to ${this.bindKeys[item]})` : ' (Not bounded)');
            txt.style.margin = '10px';
            idx.appendChild(txt);
            main.appendChild(idx);
        }
        GUIUtil.createPopupBox(main, 370, (this.configKeys.length + this.triggerKeys.length) * 30);
    }
    bindKey(module, key){
        if(key == 'clear'){
            delete this.bindKeys[module];
            this.addChat(`Cleared keybind of ${module}`);
            return;
        }
        this.bindKeys[module] = key;
        this.addChat(`Set keybind of ${module} to ${key}`);
    }
    LS_set(key, value){
        localStorage.setItem(key, value);
    }
    LS_get(key){
        try{
            return JSON.parse(localStorage.getItem(key));
        }catch(e){
            return localStorage.getItem(key);
        }
    }
    saveModule(){
        this.LS_set('hhConfig', JSON.stringify(this.config));
        this.LS_set('hhKeys', JSON.stringify(this.bindKeys));
    }
    loadModule(){
        let cfg = this.LS_get('hhConfig');
        let keys = this.LS_get('hhKeys') || {};
        if(!cfg){
            this.config = this.default;
            this.saveModule();
            return;
        }
        for(const item of this.configKeys){
            if(!Object.keys(cfg).includes(item)){
                this.config[item] = this.default[item];
                this.setEnabled(item, this.default[item]);
            }else{
                this.setEnabled(item, cfg[item]);
            }
        }
        this.bindKeys = keys;
    }
    // ----- Command -----
    preload(){
        this.loadStatus();
        this.setStatus('');
        this.loadModule();
        if(this.isEnabled('zcxJamesScript')){
            this.table.start();
        }
    }
    onload(){
        this.addChat(`${this.name} enabled!`);
        this.addChat('Type /help in chat box to get help');
        this.register();
        this.loadTrack();
        this.ingame = true;
        $_('.player-list-btn').style.display = '';
        this.petalCount = [0, 0, 0, 0, 0, 0, 0, 0];
        this.updatePetal();
        // console.log(this.LS_get('player_id'));
    }
    notCommand(cmd){
        return cmd[0] == '/' && !Object.keys(this.commands).map(x => (x.split(' ')[0])).includes(cmd);
    }
    getHelp(){
        this.addChat('List of commands:');
        for(let [i, j] of Object.entries(this.commands)){
            this.addChat(`${i} : ${j}`, '#ffffff');
        }
    }
    getServer(){
        let server = this.LS_get('server');
        return `${server.substring(0, 2).toUpperCase()}${server[server.length - 1]}`;
    }
    getColor(r){
        return this.rarityColor[r['tier']];
    }
    convertID(id){
        return id.toString(36);
    }
    getWave(){
        let name = $_('body > div.hud > div.zone > div.zone-name').getAttribute('stroke');
        let status = $_('body > div.hud > div.zone > div.progress > span').getAttribute('stroke');
        let prog = $_('body > div.hud > div.zone > div.progress > div').style.transform;
        let start = prog.indexOf('calc(') + 5;
        prog = prog.substr(start, prog.indexOf('%') - start);
        if(!status || !prog) return 'Not ingame';
        switch(name){
            case 'Ultra':
            case 'Super':
            case 'Hyper':
            case 'Waveroom':
                if(!status.includes('Kills Needed')){
                    return `${name} Wave: ${status}`;
                }else{
                    return `${name} Wave: ${Math.round((100 + parseFloat(prog)) * 100) / 100}%`;
                }
            default:
                return 'Not in valid zone';
        }
    }
    getHP(mob) {
        let tier = mob['tier'], type = mob['type'];
        let lst = this.moblst;
        if(mob.isCentiBody) type--;
        if (!lst[tier] || tier >= lst.length) return;
        for (const i of lst[tier]) {
            if (type == i['type']) return i['health'];
        }
    }
    onKey(module){
        if(!this.triggerKeys.includes(module)) this.toggle(module);
        else this.triggers[module]();
    }
    getPos(entity=this.player.entity.targetPlayer){
        let x = entity.nx;
        let y = entity.ny;
        return [Math.floor(x / 500), Math.floor(y / 500)];
    }
    delBuild(id){
        let builds = this.LS_get('saved_builds');
        delete builds[id];
        this.LS_set('saved_builds', JSON.stringify(builds));
        this.addChat('Deleted Build #' + id + ', refresh to view changes');
    }
    viewPetal(id){
        let builds = this.LS_get('saved_builds');
        builds['49'] = [id]
        this.LS_set('saved_builds', JSON.stringify(builds));
        this.addChat('Set Build #49 to petal ' + id + ', refresh to view changes');
    }
    viewMob(mobName){
        let mobs = document.querySelector('.zone-mobs'), id;
        let [name, rarityNum] = this.parseRarity(mobName);
        for(const i of this.moblst[rarityNum]){
            if(i['name'].replaceAll(' ', '') == name) id = i;
        }
        if(!id){
            this.addChat(`Mob not found: ${name}`, '#ff7f50');
            return;
        }
        let mob = this.mobFunc(id, true);
        mob.tooltipDown = true;
        mob.canShowDrops = true;
        mobs.appendChild(mob);
        this.addChat(`Added ${name} to zone mobs`);
    }
    onTrack(id){
        this.tracking = null;
        this.trackingType = null;
        this.clearDots();
        if(id == 'stop'){
            this.addChat('Stopped tracking');
        }else{
            this.trackingType = id;
            this.addChat(`Now tracking ${id}`);
        }
    }
    clickPlay(time){
        setTimeout(() => {$_('.play-btn').click()}, 1000 * time);
    }
    changeServer(server){
        $$_('.btn')[13 + parseInt(server)].click();
        this.clickPlay(3);
        this.addChat(`Changed server to ${this.getServer()}`);
    }
    changeGUI(){
        let main = document.createElement('div');
        let servers = ['EU1', 'EU2', 'AS1', 'US1', 'US2', 'AS2'];
        let userCount = [];
        for(let i = 2; i <= 7; i++){
            let elem = $_(`body > div.menu > div.server-area > div:nth-child(${i}) > span.small`);
            userCount.push(elem.getAttribute('stroke').slice(0, -6));
        }
        let current = this.getServer();
        for(const item of servers){
            let idx = document.createElement('div');
            let txt = document.createElement('span');
            txt.innerHTML = item + ' ' + (userCount[servers.indexOf(item)] || 'UK');
            txt.style.margin = '10px';
            txt.style.fontSize = '20px';
            idx.appendChild(txt);
            let cb = document.createElement('input');
            cb.type = 'button';
            if(item == current){
                cb.disabled = true;
                cb.value = 'Current';
            }else{
                cb.value = 'Change to';
            }
            cb.setAttribute('id', servers.indexOf(item));
            let that = this;
            cb.onclick = () => {
                that.changeServer(cb.getAttribute('id'));
                that.change_gui.close();
            };
            cb.style.float = 'right';
            idx.appendChild(cb);
            main.appendChild(idx);
        }
        this.change_gui = GUIUtil.createPopupBox(main, 250, 250);
    }
    clearDots(){
        this.trackUI.innerHTML = `Not Tracking`;
        let minimap = $_('.minimap');
        minimap.childNodes.forEach(item => {
            if(item.classList && item.classList.contains('minimap-dot') && item.childNodes.length == 0){
                minimap.removeChild(item);
            }
        });
        this.tracking = null;
    }
    parseRarity(str){
        return str.includes('_') ? str.split('_').map(x => parseInt(x) || x) : [str, 0];
    }
    commandMultiArg(func, num, args){
        args = args.split(' ');
        if(args.length != num){
            this.addError(`Args num not correct (!=${num})`);
            return true;
        }else{
            this[func](...args.slice(1));
            return false;
        }
    }
    // ----- Event -----
    registerDie(){
        let div = $_('body > div.score-overlay');
        let that = this;
        this.dieObserver = new this.MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type == 'attributes') {
                    let style = mutation.target.style;
                    if(style.display != 'none'){
                        that.ingame = false;
                        that.updatePetal();
                        if(that.isEnabled('autoRespawn') && !that.isSuicide){
                            that.respawn();
                        }
                        that.isSuicide = false;
                    }
                }
            });
        });
        this.dieObserver.observe(div, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
    respawn(){
        let quitBtn = $_('body > div.score-overlay > div.score-area > div.btn.continue-btn');
        let deathReason = $_('body > div.score-overlay > div.score-area > span.killer').getAttribute('stroke');
        let maxScore = $_('\span.max-score').getAttribute('stroke');
        let totalKills = $_('\span.total-kills').getAttribute('stroke');
        let timeAlive = $_('\span.time-alive').getAttribute('stroke');
        this.addChat(`You died @ ${this.getPos().join(', ')} because of ${deathReason}`, '#0ff')
        let box = GUIUtil.createPopupBox(document.createElement('div'), 300, 150);
        box.appendChild(document.createTextNode('Petals collected: ' + this.petalCount.join('/')))
        box.appendChild(document.createElement('br'));
        box.appendChild(document.createTextNode('Score: ' + maxScore));
        box.appendChild(document.createElement('br'));
        box.appendChild(document.createTextNode('Total Kills: ' + totalKills));
        box.appendChild(document.createElement('br'));
        box.appendChild(document.createTextNode('Time Alive: ' + timeAlive));
        if(!quitBtn.classList.contains('red')){
            quitBtn.onclick();
            if(this.isEnabled('autoClickPlay')){
                this.clickPlay(1);
            }
        }else{
            //this.addChat('Not respawning, you are in Waveroom', '#0ff');
        }
    }
    registerMain(){
        this.mainInterval = setInterval(async () => {
            let status;
            try{
                status = this.getWave();
            }catch{
                if(this.isEnabled('forceLoadScript')) location.reload();
            }
            let server = this.getServer();
            this.setStatus(`${server}: ${status}`);
            let btn = document.getElementsByClassName('btn build-save-btn');
            for(let i = 0; i < btn.length; i++){
                btn[i].style.display = this.isEnabled('lockBuildChange') ? 'none' : '';
            }
            if(!this.ingame) this.trackUI.style.display = 'none';
            this.clearDots();
        }, 1000);
    }
    registerChat(){
        let div = $_('body > div.common > div.chat > div');
        this.chatObserver = new this.MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if(mutation.type == 'childList'){
                    let chat = mutation.addedNodes[0];
                    if(chat){
                        let childs = chat.childNodes;
                        let name = "", content = "";
                        for(let i = 0; i < childs.length; i++){
                            let item = childs[i];
                            if(item.className == 'chat-name') name = item.getAttribute('stroke');
                            if(item.className == 'chat-text'){
                                if(item.hasAttribute('stroke')){
                                    content = item.getAttribute('stroke');
                                }else{
                                    let c = item.childNodes;
                                    for(let j = 0; j < c.length - 1; j += 2){
                                        name += c[j].getAttribute('stroke') + ' ';
                                    }
                                }
                            }
                        }
                        //console.log(name + ' ' + content);
                    }
                }
            });
        });
        this.chatObserver.observe(div, {
            childList: true
        });
    }
    registerKey(){
        let chatbox = $_('body > div.common > div.chat > input');
        this.keyFunc = evt => {
            if(document.activeElement.classList == chatbox.classList || !this.ingame) return;
            for(let i = 0; i < Object.keys(this.bindKeys).length; i++){
                let item = Object.keys(this.bindKeys)[i];
                if(evt.key == this.bindKeys[item]) this.onKey(item);
            }
        };
        window.addEventListener('keyup', this.keyFunc);
    }
    updatePlayer(player){
        if(player.id == -1){
            this.player.name = player.username;
            this.player.entity = player;
        }
    }
    updateMob(mob){
        let tier = mob['tierStr'], type = this.moblst, cur;
        for(const i of type[mob['tier']]){
            if(i['type'] == mob['type']) cur = i;
        }
        if(!cur) return;
        let name = cur['uiName'];
        if(mob['isShiny'] && !mob['shinyFlag'] && this.isEnabled('shinyAlert')){
            for(let i = 0; i < 1; i++) this.toastFunc(`A shiny ${tier} ${name} spawned at ${this.getPos(mob).join(', ')}`);
            mob['shinyFlag'] = 1;
        }
        if(this.trackingType){
            let minimap = $_('.minimap');
            if(name.replaceAll(' ', '').includes(this.trackingType)){
                let dot = document.createElement('div');
                dot.classList = ['minimap-dot'];
                dot.style.left = `${mob['nx'] / 500 / 60 * 100}%`;
                dot.style.top = `${mob['ny'] / 500 / 60 * 100}%`;
                minimap.appendChild(dot);
                if(this.trackUI && this.convertID(mob['id']) == this.tracking && !mob['isDead']){
                    let info = `Tracking ID: ${this.tracking}`;
                    info += `<br>Type: ${tier} ${name}`;
                    info += `<br>Health: ${Math.round(mob['health'] * 100)}%`;
                    info += `<br>Pos: ${this.getPos(mob).join(', ')}`;
                    this.trackUI.innerHTML = info;
                }else{
                    this.tracking = this.convertID(mob['id']);
                }
            }
        }else{
            this.tracking = null;
            this.trackUI.innerHTML = `Not Tracking`;
        }
    }
    onPickup(petal){
        if(petal.picked) return;
        petal.picked = true;
        let [name, rarity] = this.parseRarity(petal.petal.name);
        this.petalCount[rarity]++;
        this.updatePetal();
    }
    updatePetal(){
        let info = 'Petals: ';
        for(let i = 0; i < 8; i++){
            info += `<span style="color:${this.rarityColor[i]}">${this.petalCount[i]}</span>/`;
        }
        info = info.slice(0, -1);
        if(this.isEnabled('showRealTimePickup')) this.statusAbove = info;
    }
    register(){
        this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        if(!this.mainInterval) this.registerMain();
        if(!this.keyFunc) this.registerKey();
        if(!this.chatObserver) this.registerChat();
        if(!this.dieObserver) this.registerDie();
    }
}
var hack = new HornexHack();
function b(c, d) {
  const e = a();
  return (
    (b = function (f, g) {
      f = f - 0x105;
      let h = e[f];
      return h;
    }),
    b(c, d)
  );
}
(function (c, d) {
  const uw = b,
    e = c();
  while (!![]) {
    try {
      const f =
        (parseInt(uw(0xdd6)) / 0x1) * (-parseInt(uw(0xd94)) / 0x2) +
        parseInt(uw(0xd4b)) / 0x3 +
        -parseInt(uw(0x8a2)) / 0x4 +
        -parseInt(uw(0x275)) / 0x5 +
        (-parseInt(uw(0xe45)) / 0x6) * (parseInt(uw(0x3b3)) / 0x7) +
        -parseInt(uw(0x276)) / 0x8 +
        parseInt(uw(0x15d)) / 0x9;
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0x38f8a),
  (() => {
    const ux = b;
    var cF = 0x2710,
      cG = 0x1e - 0x1,
      cH = { ...cU(ux(0xcf3)), ...cU(ux(0x61b)) },
      cI = 0x93b,
      cJ = 0x10,
      cK = 0x3c,
      cL = 0x10,
      cM = 0x3,
      cN = /^[a-zA-Z0-9_]+$/,
      cO = /[^a-zA-Z0-9_]/g,
      cP = cU(ux(0xc1c)),
      cQ = cU(ux(0x226)),
      cR = cU(ux(0xa0f)),
      cS = cU(ux(0xac0)),
      cT = cU(ux(0xc95));
    function cU(r8) {
      const uy = ux,
        r9 = r8[uy(0x2a6)]("\x20"),
        ra = {};
      for (let rb = 0x0; rb < r9[uy(0xc2f)]; rb++) {
        ra[r9[rb]] = rb;
      }
      return ra;
    }
    var cV = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cW = {};
    (cW[ux(0x72f)] = 0x0), (cW[ux(0x649)] = 0x1), (cW[ux(0xb56)] = 0x2);
    var cX = cW,
      cY = [
        [0x0, 0x0],
        [0x1, 0xa - 0x1],
        [0x2, 0x23 - 0x1],
        [0x5, 0x41 - 0x1],
        [0x4, 0x64 - 0x1],
        [0x3, 0xc8 - 0x1],
      ],
      cZ = 0x7d0,
      d0 = 0x3e8;
    function d1(r8) {
      const uz = ux;
      return 0x14 * Math[uz(0xa6f)](r8 * 1.05 ** (r8 - 0x1));
    }
    var d2 = [
      0x1, 0x5, 0x32, 0x1f4, 0x2710, 0x7a120, 0x2faf080, 0x12a05f200,
      0xe8d4a51000,
    ];
    function d3(r8) {
      let r9 = 0x0,
        ra = 0x0;
      while (!![]) {
        const rb = d1(r9 + 0x1);
        if (r8 < ra + rb) break;
        (ra += rb), r9++;
      }
      return [r9, ra];
    }
    function d4(r8) {
      const uA = ux;
      let r9 = 0x5,
        ra = 0x5;
      while (r8 >= ra) {
        r9++, (ra += Math[uA(0x585)](0x1e, ra));
      }
      return r9;
    }
    function d5(r8) {
      const uB = ux;
      return Math[uB(0x3ce)](0xf3, Math[uB(0x585)](r8, 0xc7) / 0xc8);
    }
    function d6() {
      return d7(0x100);
    }
    function d7(r8) {
      const r9 = Array(r8);
      while (r8--) r9[r8] = r8;
      return r9;
    }
    var d8 = cU(ux(0x5be)),
      d9 = Object[ux(0x572)](d8),
      da = d9[ux(0xc2f)] - 0x1,
      db = da;
    function dc(r8) {
      const uC = ux,
        r9 = [];
      for (let ra = 0x1; ra <= db; ra++) {
        r9[uC(0x9db)](r8(ra));
      }
      return r9;
    }
    const dd = {};
    (dd[ux(0xdee)] = 0x0),
      (dd[ux(0x853)] = 0x1),
      (dd[ux(0x499)] = 0x2),
      (dd[ux(0xd51)] = 0x3),
      (dd[ux(0x301)] = 0x4),
      (dd[ux(0x2b9)] = 0x5),
      (dd[ux(0x5c0)] = 0x6),
      (dd[ux(0xbc1)] = 0x7),
      (dd[ux(0x95f)] = 0x8);
    var de = dd;
    function df(r8, r9) {
      const uD = ux;
      return Math[uD(0x3ce)](0x3, r8) * r9;
    }
    const dg = {};
    (dg[ux(0x171)] = cR[ux(0x613)]),
      (dg[ux(0xc0c)] = ux(0xb9b)),
      (dg[ux(0x911)] = 0xa),
      (dg[ux(0x5b6)] = 0x0),
      (dg[ux(0xdfe)] = 0x1),
      (dg[ux(0xd79)] = 0x1),
      (dg[ux(0x751)] = 0x3e8),
      (dg[ux(0x458)] = 0x0),
      (dg[ux(0x678)] = ![]),
      (dg[ux(0x10f)] = 0x1),
      (dg[ux(0x6aa)] = ![]),
      (dg[ux(0x13e)] = 0x0),
      (dg[ux(0xa8d)] = 0x0),
      (dg[ux(0x4a2)] = ![]),
      (dg[ux(0x817)] = 0x0),
      (dg[ux(0x4d7)] = 0x0),
      (dg[ux(0x2db)] = 0x0),
      (dg[ux(0x530)] = 0x0),
      (dg[ux(0x442)] = 0x0),
      (dg[ux(0x199)] = 0x0),
      (dg[ux(0x1db)] = 0x1),
      (dg[ux(0xb76)] = 0xc),
      (dg[ux(0x125)] = 0x0),
      (dg[ux(0xc1e)] = ![]),
      (dg[ux(0xb8d)] = void 0x0),
      (dg[ux(0x425)] = ![]),
      (dg[ux(0x8ac)] = 0x0),
      (dg[ux(0xabf)] = ![]),
      (dg[ux(0xd96)] = 0x0),
      (dg[ux(0x31e)] = 0x0),
      (dg[ux(0xe4f)] = ![]),
      (dg[ux(0x2ff)] = 0x0),
      (dg[ux(0x5db)] = 0x0),
      (dg[ux(0xddf)] = 0x0),
      (dg[ux(0x6d1)] = ![]),
      (dg[ux(0x2cf)] = 0x0),
      (dg[ux(0x220)] = ![]),
      (dg[ux(0xd70)] = ![]),
      (dg[ux(0x8c6)] = 0x0),
      (dg[ux(0x48b)] = 0x0),
      (dg[ux(0xd3e)] = 0x0),
      (dg[ux(0x83f)] = ![]),
      (dg[ux(0x52e)] = 0x1),
      (dg[ux(0xca5)] = 0x0),
      (dg[ux(0x87f)] = 0x0),
      (dg[ux(0xa5d)] = 0x0),
      (dg[ux(0xcd5)] = 0x0),
      (dg[ux(0x4c0)] = 0x0),
      (dg[ux(0x2d3)] = 0x0),
      (dg[ux(0xe0c)] = 0x0),
      (dg[ux(0xbd4)] = 0x0),
      (dg[ux(0x1ce)] = 0x0),
      (dg[ux(0x5fd)] = 0x0),
      (dg[ux(0xb35)] = 0x0),
      (dg[ux(0xd90)] = 0x0),
      (dg[ux(0xdb2)] = 0x0),
      (dg[ux(0x7d2)] = 0x0),
      (dg[ux(0xe72)] = ![]),
      (dg[ux(0x1c6)] = 0x0),
      (dg[ux(0xbf6)] = 0x0),
      (dg[ux(0x327)] = 0x0);
    var dh = dg;
    const di = {};
    (di[ux(0x358)] = ux(0x9f8)),
      (di[ux(0xc0c)] = ux(0xdc1)),
      (di[ux(0x171)] = cR[ux(0x613)]),
      (di[ux(0x911)] = 0x9),
      (di[ux(0xdfe)] = 0xa),
      (di[ux(0xd79)] = 0xa),
      (di[ux(0x751)] = 0x9c4);
    const dj = {};
    (dj[ux(0x358)] = ux(0x770)),
      (dj[ux(0xc0c)] = ux(0xe61)),
      (dj[ux(0x171)] = cR[ux(0x5ce)]),
      (dj[ux(0x911)] = 0xd / 1.1),
      (dj[ux(0xdfe)] = 0x2),
      (dj[ux(0xd79)] = 0x37),
      (dj[ux(0x751)] = 0x9c4),
      (dj[ux(0x458)] = 0x1f4),
      (dj[ux(0x6aa)] = !![]),
      (dj[ux(0x609)] = 0x28),
      (dj[ux(0xa8d)] = Math["PI"] / 0x4);
    const dk = {};
    (dk[ux(0x358)] = ux(0x347)),
      (dk[ux(0xc0c)] = ux(0x2b7)),
      (dk[ux(0x171)] = cR[ux(0xe58)]),
      (dk[ux(0x911)] = 0x8),
      (dk[ux(0xdfe)] = 0x5),
      (dk[ux(0xd79)] = 0x5),
      (dk[ux(0x751)] = 0xdac),
      (dk[ux(0x458)] = 0x3e8),
      (dk[ux(0x13e)] = 0xb),
      (dk[ux(0x6d1)] = !![]);
    const dl = {};
    (dl[ux(0x358)] = ux(0xd63)),
      (dl[ux(0xc0c)] = ux(0x61e)),
      (dl[ux(0x171)] = cR[ux(0xa70)]),
      (dl[ux(0x911)] = 0x6),
      (dl[ux(0xdfe)] = 0x5),
      (dl[ux(0xd79)] = 0x5),
      (dl[ux(0x751)] = 0xfa0),
      (dl[ux(0x678)] = !![]),
      (dl[ux(0x10f)] = 0x32);
    const dm = {};
    (dm[ux(0x358)] = ux(0x633)),
      (dm[ux(0xc0c)] = ux(0x648)),
      (dm[ux(0x171)] = cR[ux(0x2b1)]),
      (dm[ux(0x911)] = 0xb),
      (dm[ux(0xdfe)] = 0xc8),
      (dm[ux(0xd79)] = 0x1e),
      (dm[ux(0x751)] = 0x1388);
    const dn = {};
    (dn[ux(0x358)] = ux(0x44f)),
      (dn[ux(0xc0c)] = ux(0x799)),
      (dn[ux(0x171)] = cR[ux(0x75a)]),
      (dn[ux(0x911)] = 0x8),
      (dn[ux(0xdfe)] = 0x2),
      (dn[ux(0xd79)] = 0xa0),
      (dn[ux(0x751)] = 0x2710),
      (dn[ux(0xb76)] = 0xb),
      (dn[ux(0x125)] = Math["PI"]),
      (dn[ux(0x5fc)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dp = {};
    (dp[ux(0x358)] = ux(0x36a)),
      (dp[ux(0xc0c)] = ux(0x4d9)),
      (dp[ux(0xb8d)] = de[ux(0xdee)]),
      (dp[ux(0x199)] = 0x1e),
      (dp[ux(0xccb)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dq = {};
    (dq[ux(0x358)] = ux(0xa44)),
      (dq[ux(0xc0c)] = ux(0x7e2)),
      (dq[ux(0xb8d)] = de[ux(0x853)]);
    const dr = {};
    (dr[ux(0x358)] = ux(0x1a1)),
      (dr[ux(0xc0c)] = ux(0x9aa)),
      (dr[ux(0x171)] = cR[ux(0x324)]),
      (dr[ux(0x911)] = 0xb),
      (dr[ux(0x751)] = 0x9c4),
      (dr[ux(0xdfe)] = 0x14),
      (dr[ux(0xd79)] = 0x8),
      (dr[ux(0x4a2)] = !![]),
      (dr[ux(0x817)] = 0x2),
      (dr[ux(0xe66)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (dr[ux(0x4d7)] = 0x14);
    const ds = {};
    (ds[ux(0x358)] = ux(0x5e7)),
      (ds[ux(0xc0c)] = ux(0xe42)),
      (ds[ux(0x171)] = cR[ux(0x848)]),
      (ds[ux(0x911)] = 0xb),
      (ds[ux(0xdfe)] = 0x14),
      (ds[ux(0xd79)] = 0x14),
      (ds[ux(0x751)] = 0x5dc),
      (ds[ux(0x530)] = 0x64),
      (ds[ux(0xcfe)] = 0x1);
    const du = {};
    (du[ux(0x358)] = ux(0x4a4)),
      (du[ux(0xc0c)] = ux(0xb24)),
      (du[ux(0x171)] = cR[ux(0x94b)]),
      (du[ux(0x911)] = 0x7),
      (du[ux(0xdfe)] = 0x5),
      (du[ux(0xd79)] = 0xa),
      (du[ux(0x751)] = 0x258),
      (du[ux(0x1db)] = 0x1),
      (du[ux(0xc1e)] = !![]),
      (du[ux(0x5fc)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dv = {};
    (dv[ux(0x358)] = ux(0xd53)),
      (dv[ux(0xc0c)] = ux(0x617)),
      (dv[ux(0x171)] = cR[ux(0xce4)]),
      (dv[ux(0x911)] = 0xb),
      (dv[ux(0xdfe)] = 0xf),
      (dv[ux(0xd79)] = 0x1),
      (dv[ux(0x751)] = 0x3e8),
      (dv[ux(0x425)] = !![]),
      (dv[ux(0x6d1)] = !![]);
    const dw = {};
    (dw[ux(0x358)] = ux(0x6f7)),
      (dw[ux(0xc0c)] = ux(0x4f5)),
      (dw[ux(0x171)] = cR[ux(0x87d)]),
      (dw[ux(0x911)] = 0xb),
      (dw[ux(0xdfe)] = 0xf),
      (dw[ux(0xd79)] = 0x5),
      (dw[ux(0x751)] = 0x5dc),
      (dw[ux(0x8ac)] = 0x32),
      (dw[ux(0x81e)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dx = {};
    (dx[ux(0x358)] = ux(0x7b1)),
      (dx[ux(0xc0c)] = ux(0x6c7)),
      (dx[ux(0x171)] = cR[ux(0x239)]),
      (dx[ux(0x911)] = 0x7),
      (dx[ux(0xdfe)] = 0x19),
      (dx[ux(0xd79)] = 0x19),
      (dx[ux(0x1db)] = 0x4),
      (dx[ux(0x751)] = 0x3e8),
      (dx[ux(0x458)] = 0x1f4),
      (dx[ux(0xb76)] = 0x9),
      (dx[ux(0xa8d)] = Math["PI"] / 0x8),
      (dx[ux(0x6aa)] = !![]),
      (dx[ux(0x609)] = 0x28);
    const dy = {};
    (dy[ux(0x358)] = ux(0x415)),
      (dy[ux(0xc0c)] = ux(0x1c0)),
      (dy[ux(0x171)] = cR[ux(0xbcb)]),
      (dy[ux(0x911)] = 0x10),
      (dy[ux(0xdfe)] = 0x0),
      (dy[ux(0x11f)] = 0x1),
      (dy[ux(0xd79)] = 0x0),
      (dy[ux(0x751)] = 0x157c),
      (dy[ux(0x458)] = 0x1f4),
      (dy[ux(0xaf3)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dy[ux(0x694)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dy[ux(0xd96)] = 0x3c),
      (dy[ux(0xabf)] = !![]),
      (dy[ux(0x6d1)] = !![]);
    const dz = {};
    (dz[ux(0x358)] = ux(0xb2c)),
      (dz[ux(0xc0c)] = ux(0xe41)),
      (dz[ux(0x171)] = cR[ux(0x3a8)]),
      (dz[ux(0x751)] = 0x5dc),
      (dz[ux(0xe4f)] = !![]),
      (dz[ux(0xdfe)] = 0xa),
      (dz[ux(0xd79)] = 0x14),
      (dz[ux(0x911)] = 0xd);
    const dA = {};
    (dA[ux(0x358)] = ux(0x166)),
      (dA[ux(0xc0c)] = ux(0x5f9)),
      (dA[ux(0x171)] = cR[ux(0xe18)]),
      (dA[ux(0x751)] = 0xdac),
      (dA[ux(0x458)] = 0x1f4),
      (dA[ux(0xdfe)] = 0x5),
      (dA[ux(0xd79)] = 0x5),
      (dA[ux(0x911)] = 0xa),
      (dA[ux(0x2ff)] = 0x46),
      (dA[ux(0x7bc)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
    var dB = [
      di,
      dj,
      dk,
      dl,
      dm,
      dn,
      dp,
      dq,
      dr,
      ds,
      du,
      dv,
      dw,
      dx,
      dy,
      {
        name: ux(0x22e),
        desc: ux(0x7ae),
        ability: de[ux(0x499)],
        orbitRange: 0x32,
        orbitRangeTiers: dc((r8) => 0x32 + r8 * 0x46),
      },
      {
        name: ux(0x247),
        desc: ux(0xccc),
        ability: de[ux(0xd51)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dz,
      dA,
      {
        name: ux(0x3ca),
        desc: ux(0x418),
        type: cR[ux(0xd06)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][ux(0xe56)](
          (r8) => r8 * 0.8
        ),
      },
      {
        name: ux(0xbb0),
        desc: ux(0x3e2),
        type: cR[ux(0xa70)],
        size: 0x6,
        healthF: 0x14,
        damageF: 0x3,
        count: 0x4,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        uiCountGap: 0x7,
        uiAngle: Math["PI"] / 0x8,
        isProj: !![],
        projSpeed: 0x28,
        isPoison: !![],
        poisonDamageF: 0x28,
      },
      {
        name: ux(0x24d),
        desc: ux(0x26f),
        type: cR[ux(0x4aa)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
        orbitSpeedFactor: 0.95,
        orbitSpeedFactorTiers: [0.94, 0.93, 0.92, 0.91, 0.9, 0.8, 0.7, 0.1],
      },
      {
        name: ux(0x653),
        desc: ux(0xa42),
        type: cR[ux(0x289)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][ux(0xe56)](
          (r8) => r8 - 0.2
        ),
      },
      {
        name: ux(0x70f),
        desc: ux(0xdfc),
        type: cR[ux(0xa85)],
        size: 0x7,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x3e8,
        useTime: 0x1f4,
        lieOnGroundTime: 0x1388,
        count: 0x1,
        countTiers: [0x1, 0x2, 0x3, 0x3, 0x3, 0x3, 0x3, 0x4],
        occupySlot: !![],
      },
      {
        name: ux(0x1d3),
        desc: ux(0xad3),
        type: cR[ux(0x3f8)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: ux(0x834),
        desc: ux(0x830),
        type: cR[ux(0x206)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: ux(0x241),
        desc: ux(0xd25),
        type: cR[ux(0xcb5)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: ux(0xcc6),
        desc: ux(0x52a),
        type: cR[ux(0x4d0)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dC(![]),
      dC(!![]),
      {
        name: ux(0x53b),
        desc: ux(0x944),
        type: cR[ux(0x51e)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: ux(0x9c8),
        desc: ux(0xc7d),
        type: cR[ux(0x83e)],
        size: 0xa,
        healthF: 0xf,
        damageF: 0x14,
        respawnTime: 0x5dc,
        extraSpeed: 0x2,
        extraSpeedTiers: [0x4, 0x6, 0x8, 0xa, 0xc, 0xe, 0x10, 0x18],
        turbulence: 0x14,
        turbulenceTiers: dc((r8) => 0x14 + r8 * 0x50),
      },
      {
        name: ux(0xbe1),
        desc: ux(0x9fb),
        type: cR[ux(0xe58)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x5dc,
        useTime: 0x3e8,
        regenF: 0x5,
        dontExpand: !![],
        count: 0x3,
        uiCountGap: 0xb,
      },
      {
        name: ux(0x367),
        desc: ux(0xbea),
        type: cR[ux(0xc30)],
        size: 0x12,
        healthF: 0x19,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x3a98,
        useTimeTiers: [
          0x4b00, 0x5bcc, 0x7d00, 0x708, 0x1ce8, 0x4204, 0x64, 0x190,
        ],
        fixAngle: !![],
        dontExpand: !![],
        spawn: ux(0xce0),
        spawnTiers: [
          ux(0xa33),
          ux(0x8ef),
          ux(0xdd3),
          ux(0xdd3),
          ux(0x306),
          ux(0x316),
          ux(0x316),
          ux(0x295),
        ],
      },
      {
        name: ux(0xa19),
        desc: ux(0x400),
        type: cR[ux(0x81a)],
        count: 0x4,
        size: 0xd,
        healthF: 0x19,
        damageF: 0x0,
        respawnTime: 0x3e8,
        occupySlot: !![],
        useTime: 0x7530,
        useTimeTiers: [
          0x9470, 0x960, 0xce4, 0x13ec, 0x3db8, 0x8340, 0x7d0, 0x3e8,
        ],
        fixAngle: !![],
        dontExpand: !![],
        spawn: ux(0x693),
        spawnTiers: [
          ux(0x89c),
          ux(0x89c),
          ux(0x778),
          ux(0x3d2),
          ux(0x9a5),
          ux(0xaaa),
          ux(0xaaa),
          ux(0x732),
        ],
      },
      {
        name: ux(0xd21),
        desc: ux(0x638),
        type: cR[ux(0xc30)],
        occupySlot: !![],
        count: 0x2,
        size: 0x10,
        healthF: 0x19,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x7d00,
        useTimeTiers: [
          0xa028, 0xe74, 0x125c, 0x12c0, 0x4074, 0x8dcc, 0x514, 0x320,
        ],
        fixAngle: !![],
        dontExpand: !![],
        spawn: ux(0xa75),
        spawnTiers: [
          ux(0xc5c),
          ux(0xc5c),
          ux(0x5dc),
          ux(0xb59),
          ux(0x172),
          ux(0xb62),
          ux(0xb62),
          ux(0xd64),
        ],
      },
      {
        name: ux(0x308),
        desc: ux(0x2c3),
        type: cR[ux(0xdaf)],
        size: 0x12,
        healthF: 0x19,
        damageF: 0x0,
        respawnTime: 0x3e8,
        fixAngle: !![],
        dontExpand: !![],
        useTime: 0xb266,
        useTimeTiers: [
          0xe56, 0x109a, 0x123e, 0x2210, 0x37e6, 0x67c0, 0x6e0, 0x2c88,
        ],
        spawn: ux(0xb6b),
        spawnTiers: [
          ux(0xb6b),
          ux(0x942),
          ux(0xc35),
          ux(0xc5a),
          ux(0x972),
          ux(0xe26),
          ux(0xe26),
          ux(0x7e4),
        ],
      },
      {
        name: ux(0xbe2),
        desc: ux(0xe04),
        type: cR[ux(0x3ea)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: ux(0xac9),
        spawnTiers: [
          ux(0x793),
          ux(0x581),
          ux(0x581),
          ux(0x209),
          ux(0x28e),
          ux(0x9af),
          ux(0x9af),
          ux(0x58d),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: ux(0x56f),
        desc: ux(0x7c8),
        type: cR[ux(0x745)],
        size: 0x14,
        sizeTiers: [0x28, 0x3c, 0x50, 0x64, 0x78, 0x8c, 0xa0, 0x118],
        healthF: 0x12c,
        damageF: 0xa,
        isLightsaber: !![],
        uiAngle: -Math["PI"] / 0x6,
        useTime: 0x5dc,
        respawnTime: 0x7d0,
        uiX: 0x8,
        uiY: -0x5,
      },
      {
        name: ux(0x3a0),
        desc: ux(0x6e4),
        type: cR[ux(0xb2a)],
        size: 0xe,
        fixAngle: !![],
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x9c4,
        agroRangeDec: 0x5,
        agroRangeDecTiers: [
          0xa, 0x14, 0x1e, 0x28, 0x32, 0x3c, 0x46, 0x50, 0x5f,
        ],
      },
      {
        name: ux(0x49d),
        desc: ux(0x5b7),
        type: cR[ux(0xa2c)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: ux(0x8da),
        desc: ux(0xd66),
        type: cR[ux(0x914)],
        size: 0xc,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x3e8,
        count: 0x1,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x2, 0x3, 0x3, 0x5],
        occupySlot: !![],
        affectHeal: !![],
        affectHealDur: 0x2,
        affectHealDurTiers: [0x4, 0x8, 0xc, 0x10, 0x14, 0x18, 0x1c, 0x20],
        useTime: 0x1f4,
        isProj: !![],
        projSpeed: 0x28,
        uiAngle: (-Math["PI"] * 0x3) / 0x4,
      },
      {
        name: ux(0x549),
        desc: ux(0x824),
        type: cR[ux(0x8a8)],
        size: 0xd,
        healthF: 0x19,
        damageF: 0x5,
        dontExpand: !![],
        respawnTime: 0xdac,
        useTime: 0x3e8,
        shield: 0xc,
        shieldTiers: [0x24, 0x6c, 0x144, 0x3cc, 0xb64, 0x222c, 0x6684, 0x1338c],
      },
      {
        name: ux(0x7fa),
        desc: ux(0x26e),
        type: cR[ux(0x7b7)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: ux(0x2f4),
        desc: ux(0xcec),
        type: cR[ux(0x8d8)],
        size: 0xc,
        healthF: 0x5,
        damageF: 0x6,
        respawnTime: 0x5dc,
        isPoison: !![],
        poisonDamageF: 0x14,
        slowDuration: 0x3e8,
        slowDurationTiers: [
          0x44c, 0x4b0, 0x514, 0x578, 0x5dc, 0x640, 0x6a4, 0x708,
        ],
      },
      {
        name: ux(0xa92),
        desc: ux(0xc9a),
        ability: de[ux(0x301)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: ux(0x4f3),
        desc: ux(0x8a3),
        type: cR[ux(0x33e)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: ux(0x1df),
        desc: ux(0x96c),
        type: cR[ux(0x494)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: ux(0xdce),
        desc: ux(0x801),
        ability: de[ux(0x2b9)],
        petHealF: 0x28,
      },
      {
        name: ux(0x261),
        desc: ux(0x7b9),
        ability: de[ux(0x5c0)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: ux(0x4d3),
        type: cR[ux(0x9dd)],
        desc: ux(0x75f),
        size: 0x1e,
        healthF: 0x1f4,
        damageF: 0x5,
        isLightsaber: !![],
        uiAngle: -Math["PI"] / 0x6,
        respawnTime: 0x7d0,
        uiX: -6.3,
        uiY: 0x3,
        lockOnTarget: !![],
      },
      {
        name: ux(0x1c3),
        desc: ux(0x851),
        type: cR[ux(0x79b)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: ux(0x96d),
        spawnTiers: [
          ux(0xb8f),
          ux(0x9c0),
          ux(0x9c0),
          ux(0xc5d),
          ux(0x39d),
          ux(0x893),
          ux(0x893),
          ux(0xd2f),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: ux(0x622),
        desc: ux(0xa47),
        type: cR[ux(0x117)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          ux(0xe56)
        ]((r8) => r8 / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: ux(0x17d),
        desc: ux(0x2ea),
        type: cR[ux(0x329)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: ux(0xde1),
        desc: ux(0x27b),
        type: cR[ux(0x384)],
        size: 0x14,
        sizeTiers: [0x28, 0x3c, 0x50, 0x64, 0x78, 0x8c, 0xa0, 0x118],
        healthF: 0x78,
        damageF: 0x14,
        isLightsaber: !![],
        isFire: !![],
        uiAngle: -Math["PI"] / 0x6,
        useTime: 0x5dc,
        respawnTime: 0x7d0,
      },
      {
        name: ux(0x8f2),
        desc: ux(0x1d7),
        type: cR[ux(0x46f)],
        healthF: 0xc8,
        damageF: 0.5,
        isPoison: !![],
        poisonDamageF: 0x28,
        size: 0x14,
        sizeTiers: [0x28, 0x3c, 0x50, 0x64, 0x78, 0x8c, 0xa0, 0x118],
        isLightsaber: !![],
        isFire: !![],
        uiAngle: -Math["PI"] / 0x6,
        useTime: 0x7d0,
        respawnTime: 0x7d0,
      },
      {
        name: ux(0x85f),
        desc: ux(0x819),
        type: cR[ux(0xcfd)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: ux(0x54a),
        desc: ux(0x6e0),
        type: cR[ux(0x7c0)],
        healthF: 0x96,
        damage: 0x0,
        damageF: 0x0,
        entRot: 0.1,
        entRotTiers: [0.13, 0.18, 0.24, 0.3, 0.4, 0.55, 0.7, 0x1],
        size: 0x37,
        sizeTiers: [0x41, 0x4b, 0x50, 0x64, 0x78, 0x8c, 0x320, 0x7d0],
        isLightsaber: !![],
        isFire: !![],
        uiAngle: -Math["PI"] / 0x6,
        useTime: 0x1f4,
        respawnTime: 0x3e8,
      },
      {
        name: ux(0xb19),
        desc: ux(0xd39),
        type: cR[ux(0xb72)],
        size: 0xf,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x9c4,
        useTime: 0x3e8,
        regenF: 0xa,
        dontExpand: !![],
        uiAngle: -Math["PI"] / 0x4,
        consumeProj: !![],
        consumeProjSpeed: 0x28,
        consumeProjType: cR[ux(0xb2a)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: ux(0x65f),
        desc: ux(0x6fc),
        type: cR[ux(0x64e)],
        size: 0xf,
        healthF: 0x190,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0x9c4,
        regenF: 0x8,
        lockOnTarget: !![],
        fixAngle: !![],
        count: 0x1,
        countTiers: [0x1, 0x2, 0x2, 0x3, 0x3, 0x4, 0x4, 0x6],
      },
      {
        name: ux(0x29c),
        desc: ux(0xa57),
        type: cR[ux(0xc69)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: ux(0x7ba),
        spawnTiers: [
          ux(0xb64),
          ux(0x1d1),
          ux(0x1d1),
          ux(0x556),
          ux(0x4d1),
          ux(0x286),
          ux(0x566),
          ux(0x9ef),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: ux(0x529), desc: ux(0x548), ability: de[ux(0xbc1)] },
      {
        name: ux(0xdf6),
        desc: ux(0x76f),
        type: cR[ux(0xd7a)],
        size: 0xc,
        healthF: 0x14,
        damageF: 0xa,
        respawnTime: 0x7d0,
        isHoney: !![],
        honeyRange: 0x46,
        honeyRangeTiers: [0x64, 0x82, 0xa0, 0xb4, 0xfa, 0x12c, 0x17c, 0x2bc],
        honeyDmgF: 0.33,
      },
      {
        name: ux(0x4f1),
        desc: ux(0x8c5),
        type: cR[ux(0x5b2)],
        healthF: 0.05,
        damage: 0x0,
        damageF: 0x0,
        dontElongate: !![],
        passiveBoost: 0.1,
        respawnTime: 0x1f4,
        useTime: 0x157c,
        useTimeTiers: [0x1388, 0x1194, 0xfa0, 0xdac, 0xbb8, 0x9c4, 0x3e8, 0x64],
        size: 0x14,
        sizeTiers: [0x19, 0x1e, 0x23, 0x28, 0x2d, 0x32, 0x4b, 0x64],
        isLightsaber: !![],
        isFire: !![],
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: ux(0xc5f),
        desc: ux(0x773),
        type: cR[ux(0x342)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: ux(0xbf7),
        desc: ux(0x28b),
        type: cR[ux(0x8bd)],
        healthF: 0x5,
        damageF: 0x2,
        size: 0xc,
        respawnTime: 0x1f4,
        elongation: 0x5,
        elongationTiers: [0x8, 0xb, 0xe, 0x11, 0x14, 0x17, 0x1a, 0x1e],
        shlong: 0x28,
        shlongTiers: [0x50, 0x78, 0xa0, 0xc8, 0xf0, 0x118, 0x140, 0x168],
        fixAngle: !![],
      },
      {
        name: ux(0x5b0),
        desc: ux(0xe35),
        type: cR[ux(0x17f)],
        size: 0x10,
        healthF: 0x640,
        damageF: 0.1,
        respawnTime: 0x5dc,
        bounce: !![],
        useTime: 0x1f4,
        isProj: !![],
        projSpeed: 0x10,
        projGrowth: 0x46,
      },
      {
        name: ux(0xdf7),
        desc: ux(0xc59),
        type: cR[ux(0x9ae)],
        count: 0x3,
        size: 0xa,
        healthF: 0x19,
        damageF: 0x0,
        respawnTime: 0x3e8,
        occupySlot: !![],
        uiCountGap: 0x9,
        fixAngle: !![],
        dontExpand: !![],
        useTime: 0x3714,
        useTimeTiers: [
          0x45ec, 0x558c, 0x640, 0x640, 0x1af4, 0x3db8, 0x64, 0x578,
        ],
        spawn: ux(0xa6b),
        spawnTiers: [
          ux(0x1e5),
          ux(0xb78),
          ux(0xb78),
          ux(0xc8b),
          ux(0x259),
          ux(0x23a),
          ux(0x23a),
          ux(0x60b),
        ],
      },
      {
        name: ux(0x7d1),
        desc: ux(0xa2b),
        type: cR[ux(0x906)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: ux(0xd5d),
        desc: ux(0x161),
        type: cR[ux(0xd22)],
        size: 0xf,
        healthF: 0x0,
        health: 0x1,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x7d0,
        retardDuration: 0x3e8,
        retardDurationTiers: [
          0x578, 0x708, 0x960, 0xbb8, 0xe10, 0x1388, 0x1d4c, 0x2710,
        ],
        makeRetard: !![],
        fixAngle: !![],
      },
      {
        name: ux(0x936),
        desc: ux(0x33c),
        type: cR[ux(0x35b)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 2.5,
      },
      {
        name: ux(0x6d0),
        desc: ux(0x6dc),
        type: cR[ux(0x958)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dc((r8) => 0xa + r8 * 0x28),
      },
      {
        name: ux(0x8a6),
        desc: ux(0x46c),
        type: cR[ux(0x1fc)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: ux(0x8e4),
        desc: ux(0x550),
        type: cR[ux(0x860)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dc((r8) => 0x2 + Math[ux(0x22b)](1.7 ** r8)),
      },
      {
        name: ux(0x9cd),
        desc: ux(0x5bb),
        type: cR[ux(0xb51)],
        size: 0x1e,
        healthF: 0x5,
        damageF: 0x15,
        isLightsaber: !![],
        uiAngle: -Math["PI"] / 0x6,
        respawnTime: 0x3e8,
        uiX: 0x8,
        uiY: -0x5,
      },
      {
        name: ux(0xd8c),
        desc: ux(0x591),
        type: cR[ux(0x813)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dc((r8) => 0.02 + r8 * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: ux(0x947),
        desc: ux(0x69b),
        type: cR[ux(0x410)],
        size: 0x12,
        healthF: 0x19,
        damageF: 0x0,
        respawnTime: 0x3e8,
        fixAngle: !![],
        dontExpand: !![],
        useTime: 0x3e80,
        useTimeTiers: [
          0x30d4, 0x2a30, 0x3138, 0x3b60, 0x5fb4, 0x30d4, 0x17d4, 0x2580,
        ],
        spawn: ux(0x633),
        spawnTiers: [
          ux(0x633),
          ux(0x89a),
          ux(0x560),
          ux(0x2a3),
          ux(0x467),
          ux(0xdda),
          ux(0xdda),
          ux(0x6a1),
        ],
      },
      { name: ux(0x273), desc: ux(0x4a8), ability: de[ux(0x95f)] },
      {
        name: ux(0x5a2),
        desc: ux(0xd16),
        type: cR[ux(0x1f7)],
        size: 0x10,
        healthF: 0x14,
        damageF: 0xa,
        fixAngle: !![],
        isDice: !![],
        respawnTime: 0x640,
      },
    ];
    function dC(r8) {
      const uE = ux,
        r9 = r8 ? 0x1 : -0x1,
        ra = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][uE(0xe56)](
          (rb) => rb * r9
        );
      return {
        name: r8 ? uE(0xe22) : uE(0xc19),
        desc:
          (r8 ? uE(0x52c) : uE(0xa63)) +
          uE(0xe3d) +
          (r8 ? uE(0x797) : "") +
          uE(0x78d),
        type: cR[r8 ? uE(0xa1a) : uE(0xe43)],
        size: 0x10,
        healthF: r8 ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: ra[0x0],
        mobSizeChangeTiers: ra[uE(0x320)](0x1),
      };
    }
    var dD = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dE = {},
      dF = dB[ux(0xc2f)],
      dG = d9[ux(0xc2f)],
      dH = eO();
    for (let r8 = 0x0, r9 = dB[ux(0xc2f)]; r8 < r9; r8++) {
      const ra = dB[r8];
      (ra[ux(0xcbd)] = !![]), (ra["id"] = r8);
      if (!ra[ux(0x5ee)]) ra[ux(0x5ee)] = ra[ux(0x358)];
      dJ(ra), (ra[ux(0xb47)] = 0x0), (ra[ux(0x737)] = r8);
      let rb = ra;
      for (let rc = 0x1; rc < dG; rc++) {
        const rd = dN(ra);
        (rd[ux(0x5b6)] = ra[ux(0x5b6)] + rc),
          (rd[ux(0x358)] = ra[ux(0x358)] + "_" + rd[ux(0x5b6)]),
          (rd[ux(0xb47)] = rc),
          (rb[ux(0x368)] = rd),
          (rb = rd),
          dI(ra, rd),
          dJ(rd),
          (rd["id"] = dB[ux(0xc2f)]),
          (dB[rd["id"]] = rd);
      }
    }
    function dI(re, rf) {
      const uF = ux,
        rg = rf[uF(0x5b6)] - re[uF(0x5b6)] - 0x1;
      for (let rh in re) {
        const ri = re[rh + uF(0x248)];
        Array[uF(0x742)](ri) && (rf[rh] = ri[rg]);
      }
    }
    function dJ(re) {
      const uG = ux;
      dE[re[uG(0x358)]] = re;
      for (let rf in dh) {
        re[rf] === void 0x0 && (re[rf] = dh[rf]);
      }
      re[uG(0xb8d)] === de[uG(0x853)] &&
        (re[uG(0x442)] = cV[re[uG(0x5b6)] + 0x1] / 0x64),
        (re[uG(0x11f)] =
          re[uG(0xdfe)] > 0x0
            ? df(re[uG(0x5b6)], re[uG(0xdfe)])
            : re[uG(0x11f)]),
        (re[uG(0xbf6)] =
          re[uG(0xd79)] > 0x0
            ? df(re[uG(0x5b6)], re[uG(0xd79)])
            : re[uG(0xbf6)]),
        (re[uG(0x8c6)] = df(re[uG(0x5b6)], re[uG(0x1ce)])),
        (re[uG(0xb35)] = df(re[uG(0x5b6)], re[uG(0x5fd)])),
        (re[uG(0x9cc)] = df(re[uG(0x5b6)], re[uG(0xd90)])),
        (re[uG(0xe0c)] = df(re[uG(0x5b6)], re[uG(0xbd4)])),
        (re[uG(0x1b6)] = df(re[uG(0x5b6)], re[uG(0x327)])),
        (re[uG(0xc09)] = df(re[uG(0x5b6)], re[uG(0x4c1)])),
        (re[uG(0xcd5)] = df(re[uG(0x5b6)], re[uG(0xa5d)])),
        (re[uG(0x4c0)] = df(re[uG(0x5b6)], re[uG(0x2d3)])),
        re[uG(0xb95)] &&
          ((re[uG(0x85a)] = df(re[uG(0x5b6)], re[uG(0xccd)])),
          (re[uG(0xc98)] = df(re[uG(0x5b6)], re[uG(0x757)]))),
        re[uG(0x13e)] > 0x0
          ? (re[uG(0x420)] = df(re[uG(0x5b6)], re[uG(0x13e)]))
          : (re[uG(0x420)] = 0x0),
        (re[uG(0x7c6)] = re[uG(0x678)]
          ? df(re[uG(0x5b6)], re[uG(0x10f)])
          : 0x0),
        (re[uG(0x904)] = re[uG(0x4a2)]
          ? df(re[uG(0x5b6)], re[uG(0x4d7)])
          : 0x0),
        (re[uG(0x5d5)] = df(re[uG(0x5b6)], re[uG(0x530)])),
        dH[re[uG(0x5b6)]][uG(0x9db)](re);
    }
    var dK = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dL = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dM = cU(ux(0xd83));
    function dN(re) {
      const uH = ux;
      return JSON[uH(0x96e)](JSON[uH(0xe67)](re));
    }
    const dO = {};
    (dO[ux(0x358)] = ux(0xcef)),
      (dO[ux(0xc0c)] = ux(0x2e1)),
      (dO[ux(0x171)] = ux(0x70e)),
      (dO[ux(0x5b6)] = 0x0),
      (dO[ux(0xdfe)] = 0x64),
      (dO[ux(0xd79)] = 0x1e),
      (dO[ux(0x3d7)] = 0x32),
      (dO[ux(0x3e1)] = dM[ux(0x299)]),
      (dO[ux(0x46a)] = ![]),
      (dO[ux(0x525)] = !![]),
      (dO[ux(0x678)] = ![]),
      (dO[ux(0x10f)] = 0x0),
      (dO[ux(0x7c6)] = 0x0),
      (dO[ux(0x7f3)] = ![]),
      (dO[ux(0x727)] = ![]),
      (dO[ux(0x610)] = 0x1),
      (dO[ux(0x65b)] = cR[ux(0x613)]),
      (dO[ux(0x5f1)] = 0x0),
      (dO[ux(0xc9f)] = 0x0),
      (dO[ux(0x4e5)] = 0.5),
      (dO[ux(0x2df)] = 0x0),
      (dO[ux(0x609)] = 0x1e),
      (dO[ux(0x279)] = 0x0),
      (dO[ux(0x18b)] = ![]),
      (dO[ux(0x4d7)] = 0x0),
      (dO[ux(0x817)] = 0x0),
      (dO[ux(0xe5d)] = 11.5),
      (dO[ux(0x4ed)] = 0x4),
      (dO[ux(0x7bd)] = !![]),
      (dO[ux(0xca5)] = 0x0),
      (dO[ux(0x87f)] = 0x0),
      (dO[ux(0xb7d)] = 0x1),
      (dO[ux(0x7ef)] = 0x0),
      (dO[ux(0x966)] = 0x0),
      (dO[ux(0x5e5)] = 0x0),
      (dO[ux(0x68e)] = 0x0),
      (dO[ux(0x656)] = 0x1);
    var dP = dO;
    const dQ = {};
    (dQ[ux(0x358)] = ux(0xcf0)),
      (dQ[ux(0xc0c)] = ux(0xd95)),
      (dQ[ux(0x171)] = ux(0xdb0)),
      (dQ[ux(0xdfe)] = 0x2ee),
      (dQ[ux(0xd79)] = 0xa),
      (dQ[ux(0x3d7)] = 0x32),
      (dQ[ux(0x7f3)] = !![]),
      (dQ[ux(0x727)] = !![]),
      (dQ[ux(0x610)] = 0.05),
      (dQ[ux(0xe5d)] = 0x5),
      (dQ[ux(0x4b2)] = !![]),
      (dQ[ux(0x62f)] = [[ux(0x693), 0x3]]),
      (dQ[ux(0xb10)] = [
        [ux(0x58f), 0x1],
        [ux(0x693), 0x2],
        [ux(0x2d7), 0x2],
        [ux(0xb7b), 0x1],
      ]),
      (dQ[ux(0xd1b)] = [[ux(0x5e7), "f"]]);
    const dR = {};
    (dR[ux(0x358)] = ux(0x58f)),
      (dR[ux(0xc0c)] = ux(0xe40)),
      (dR[ux(0x171)] = ux(0x9e6)),
      (dR[ux(0xdfe)] = 0x1f4),
      (dR[ux(0xd79)] = 0xa),
      (dR[ux(0x3d7)] = 0x28),
      (dR[ux(0x4b2)] = !![]),
      (dR[ux(0x46a)] = !![]),
      (dR[ux(0xd1b)] = [
        [ux(0x1d3), "E"],
        [ux(0xe22), "G"],
        [ux(0xa19), "A"],
      ]);
    const dS = {};
    (dS[ux(0x358)] = ux(0x693)),
      (dS[ux(0xc0c)] = ux(0x478)),
      (dS[ux(0x171)] = ux(0xb17)),
      (dS[ux(0xdfe)] = 0x64),
      (dS[ux(0xd79)] = 0xa),
      (dS[ux(0x3d7)] = 0x1c),
      (dS[ux(0x46a)] = !![]),
      (dS[ux(0xd1b)] = [[ux(0x1d3), "I"]]);
    const dT = {};
    (dT[ux(0x358)] = ux(0x2d7)),
      (dT[ux(0xc0c)] = ux(0x9f1)),
      (dT[ux(0x171)] = ux(0x50d)),
      (dT[ux(0xdfe)] = 62.5),
      (dT[ux(0xd79)] = 0xa),
      (dT[ux(0x3d7)] = 0x1c),
      (dT[ux(0xd1b)] = [[ux(0xcc6), "H"]]);
    const dU = {};
    (dU[ux(0x358)] = ux(0xb7b)),
      (dU[ux(0xc0c)] = ux(0xce2)),
      (dU[ux(0x171)] = ux(0x8d6)),
      (dU[ux(0xdfe)] = 0x19),
      (dU[ux(0xd79)] = 0xa),
      (dU[ux(0x3d7)] = 0x19),
      (dU[ux(0x46a)] = ![]),
      (dU[ux(0x525)] = ![]),
      (dU[ux(0xd1b)] = [
        [ux(0x4a4), "F"],
        [ux(0xcc6), "F"],
        [ux(0xc19), "G"],
        [ux(0x7fa), "F"],
      ]);
    var dV = [dQ, dR, dS, dT, dU];
    function dW() {
      const uI = ux,
        re = dN(dV);
      for (let rf = 0x0; rf < re[uI(0xc2f)]; rf++) {
        const rg = re[rf];
        (rg[uI(0x171)] += uI(0xde1)),
          rg[uI(0x358)] === uI(0xcf0) &&
            (rg[uI(0xd1b)] = [
              [uI(0x6f7), "D"],
              [uI(0x56f), "E"],
            ]),
          (rg[uI(0x358)] = dX(rg[uI(0x358)])),
          (rg[uI(0xc0c)] = dX(rg[uI(0xc0c)])),
          (rg[uI(0xd79)] *= 0x2),
          rg[uI(0x62f)] &&
            rg[uI(0x62f)][uI(0xa40)]((rh) => {
              return (rh[0x0] = dX(rh[0x0])), rh;
            }),
          rg[uI(0xb10)] &&
            rg[uI(0xb10)][uI(0xa40)]((rh) => {
              return (rh[0x0] = dX(rh[0x0])), rh;
            });
      }
      return re;
    }
    function dX(re) {
      const uJ = ux;
      return re[uJ(0xbb7)](/Ant/g, uJ(0x68c))[uJ(0xbb7)](/ant/g, uJ(0x31f));
    }
    const dY = {};
    (dY[ux(0x358)] = ux(0x7ee)),
      (dY[ux(0xc0c)] = ux(0x23b)),
      (dY[ux(0x171)] = ux(0x106)),
      (dY[ux(0xdfe)] = 37.5),
      (dY[ux(0xd79)] = 0x32),
      (dY[ux(0x3d7)] = 0x28),
      (dY[ux(0xd1b)] = [
        [ux(0x44f), "F"],
        [ux(0x70f), "I"],
      ]),
      (dY[ux(0xca5)] = 0x4),
      (dY[ux(0x87f)] = 0x4);
    const dZ = {};
    (dZ[ux(0x358)] = ux(0x241)),
      (dZ[ux(0xc0c)] = ux(0x491)),
      (dZ[ux(0x171)] = ux(0x3df)),
      (dZ[ux(0xdfe)] = 0x5e),
      (dZ[ux(0xd79)] = 0x5),
      (dZ[ux(0x610)] = 0.05),
      (dZ[ux(0x3d7)] = 0x3c),
      (dZ[ux(0x7f3)] = !![]),
      (dZ[ux(0xd1b)] = [[ux(0x241), "h"]]);
    const e0 = {};
    (e0[ux(0x358)] = ux(0x633)),
      (e0[ux(0xc0c)] = ux(0x12c)),
      (e0[ux(0x171)] = ux(0x95e)),
      (e0[ux(0xdfe)] = 0x4b),
      (e0[ux(0xd79)] = 0xa),
      (e0[ux(0x610)] = 0.05),
      (e0[ux(0x7f3)] = !![]),
      (e0[ux(0xc1a)] = 1.25),
      (e0[ux(0xd1b)] = [
        [ux(0x633), "h"],
        [ux(0x24d), "J"],
        [ux(0x947), "K"],
      ]);
    const e1 = {};
    (e1[ux(0x358)] = ux(0xa75)),
      (e1[ux(0xc0c)] = ux(0xa0b)),
      (e1[ux(0x171)] = ux(0xd3a)),
      (e1[ux(0xdfe)] = 62.5),
      (e1[ux(0xd79)] = 0x32),
      (e1[ux(0x46a)] = !![]),
      (e1[ux(0x3d7)] = 0x28),
      (e1[ux(0xd1b)] = [
        [ux(0x770), "f"],
        [ux(0xa44), "I"],
        [ux(0xd21), "K"],
      ]),
      (e1[ux(0x65b)] = cR[ux(0x5ce)]),
      (e1[ux(0xc9f)] = 0xa),
      (e1[ux(0x5f1)] = 0x5),
      (e1[ux(0x609)] = 0x26),
      (e1[ux(0x4e5)] = 0.375 / 1.1),
      (e1[ux(0x2df)] = 0.75),
      (e1[ux(0x3e1)] = dM[ux(0xd3a)]);
    const e2 = {};
    (e2[ux(0x358)] = ux(0xab5)),
      (e2[ux(0xc0c)] = ux(0x577)),
      (e2[ux(0x171)] = ux(0x19a)),
      (e2[ux(0xdfe)] = 87.5),
      (e2[ux(0xd79)] = 0xa),
      (e2[ux(0xd1b)] = [
        [ux(0x4a4), "f"],
        [ux(0x347), "f"],
      ]),
      (e2[ux(0xca5)] = 0x5),
      (e2[ux(0x87f)] = 0x5);
    const e3 = {};
    (e3[ux(0x358)] = ux(0xce0)),
      (e3[ux(0xc0c)] = ux(0x6bd)),
      (e3[ux(0x171)] = ux(0x70e)),
      (e3[ux(0xdfe)] = 0x64),
      (e3[ux(0xd79)] = 0x1e),
      (e3[ux(0x46a)] = !![]),
      (e3[ux(0xd1b)] = [[ux(0x367), "F"]]),
      (e3[ux(0xca5)] = 0x5),
      (e3[ux(0x87f)] = 0x5);
    const e4 = {};
    (e4[ux(0x358)] = ux(0xa6b)),
      (e4[ux(0xc0c)] = ux(0x80d)),
      (e4[ux(0x171)] = ux(0x21c)),
      (e4[ux(0xdfe)] = 62.5),
      (e4[ux(0xd79)] = 0xf),
      (e4[ux(0x678)] = !![]),
      (e4[ux(0x10f)] = 0xf),
      (e4[ux(0x3d7)] = 0x23),
      (e4[ux(0x46a)] = !![]),
      (e4[ux(0xd1b)] = [
        [ux(0x653), "F"],
        [ux(0x166), "F"],
        [ux(0x36a), "L"],
        [ux(0xa92), "G"],
      ]);
    const e5 = {};
    (e5[ux(0x358)] = ux(0xb21)),
      (e5[ux(0xc0c)] = ux(0x2f6)),
      (e5[ux(0x171)] = ux(0x3d6)),
      (e5[ux(0xdfe)] = 0x64),
      (e5[ux(0xd79)] = 0xf),
      (e5[ux(0x678)] = !![]),
      (e5[ux(0x10f)] = 0xa),
      (e5[ux(0x3d7)] = 0x2f),
      (e5[ux(0x46a)] = !![]),
      (e5[ux(0xd1b)] = [
        [ux(0xd63), "F"],
        [ux(0x2f4), "F"],
      ]),
      (e5[ux(0x65b)] = cR[ux(0x75a)]),
      (e5[ux(0xc9f)] = 0x3),
      (e5[ux(0x5f1)] = 0x5),
      (e5[ux(0x279)] = 0x7),
      (e5[ux(0x609)] = 0x2b),
      (e5[ux(0x4e5)] = 0.21),
      (e5[ux(0x2df)] = -0.31),
      (e5[ux(0x3e1)] = dM[ux(0x97a)]);
    const e6 = {};
    (e6[ux(0x358)] = ux(0xb6b)),
      (e6[ux(0xc0c)] = ux(0x6fb)),
      (e6[ux(0x171)] = ux(0xd17)),
      (e6[ux(0xdfe)] = 0x15e),
      (e6[ux(0xd79)] = 0x28),
      (e6[ux(0x3d7)] = 0x2d),
      (e6[ux(0x46a)] = !![]),
      (e6[ux(0x4b2)] = !![]),
      (e6[ux(0xd1b)] = [
        [ux(0x247), "F"],
        [ux(0x22e), "G"],
        [ux(0x834), "H"],
        [ux(0x308), "J"],
      ]);
    const e7 = {};
    (e7[ux(0x358)] = ux(0x6ca)),
      (e7[ux(0xc0c)] = ux(0xbe5)),
      (e7[ux(0x171)] = ux(0x513)),
      (e7[ux(0xdfe)] = 0x7d),
      (e7[ux(0xd79)] = 0x19),
      (e7[ux(0x46a)] = !![]),
      (e7[ux(0x18b)] = !![]),
      (e7[ux(0x4d7)] = 0x5),
      (e7[ux(0x817)] = 0x2),
      (e7[ux(0xe66)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e7[ux(0x4ed)] = 0x4),
      (e7[ux(0xe5d)] = 0x6),
      (e7[ux(0xd1b)] = [[ux(0x1a1), "F"]]);
    const e8 = {};
    (e8[ux(0x358)] = ux(0x415)),
      (e8[ux(0xc0c)] = ux(0x4c7)),
      (e8[ux(0x171)] = ux(0xaa7)),
      (e8[ux(0xdfe)] = 0.5),
      (e8[ux(0xd79)] = 0x5),
      (e8[ux(0x46a)] = ![]),
      (e8[ux(0x525)] = ![]),
      (e8[ux(0x4ed)] = 0x1),
      (e8[ux(0xd1b)] = [[ux(0x415), "F"]]);
    const e9 = {};
    (e9[ux(0x358)] = ux(0x752)),
      (e9[ux(0xc0c)] = ux(0x680)),
      (e9[ux(0x171)] = ux(0x459)),
      (e9[ux(0xdfe)] = 0x19),
      (e9[ux(0xd79)] = 0xa),
      (e9[ux(0x3d7)] = 0x28),
      (e9[ux(0x265)] = cR[ux(0xca2)]),
      (e9[ux(0xd1b)] = [
        [ux(0xcc6), "J"],
        [ux(0x7b1), "J"],
      ]);
    const ea = {};
    (ea[ux(0x358)] = ux(0x679)),
      (ea[ux(0xc0c)] = ux(0x98c)),
      (ea[ux(0x171)] = ux(0x404)),
      (ea[ux(0xdfe)] = 0x19),
      (ea[ux(0xd79)] = 0xa),
      (ea[ux(0x3d7)] = 0x28),
      (ea[ux(0x265)] = cR[ux(0x449)]),
      (ea[ux(0x46a)] = !![]),
      (ea[ux(0xd1b)] = [
        [ux(0xd63), "J"],
        [ux(0xbb0), "J"],
      ]);
    const eb = {};
    (eb[ux(0x358)] = ux(0x41d)),
      (eb[ux(0xc0c)] = ux(0xdec)),
      (eb[ux(0x171)] = ux(0xd84)),
      (eb[ux(0xdfe)] = 0x19),
      (eb[ux(0xd79)] = 0xa),
      (eb[ux(0x3d7)] = 0x28),
      (eb[ux(0x265)] = cR[ux(0x232)]),
      (eb[ux(0x525)] = ![]),
      (eb[ux(0xd1b)] = [
        [ux(0x53b), "J"],
        [ux(0x3ca), "H"],
        [ux(0x9c8), "J"],
      ]),
      (eb[ux(0x4ed)] = 0x17),
      (eb[ux(0xe5d)] = 0x17 * 0.75);
    const ec = {};
    (ec[ux(0x358)] = ux(0x4be)),
      (ec[ux(0xc0c)] = ux(0x197)),
      (ec[ux(0x171)] = ux(0xe2a)),
      (ec[ux(0xdfe)] = 87.5),
      (ec[ux(0xd79)] = 0xa),
      (ec[ux(0xd1b)] = [
        [ux(0xbe1), "F"],
        [ux(0xb2c), "I"],
      ]),
      (ec[ux(0xca5)] = 0x5),
      (ec[ux(0x87f)] = 0x5);
    const ed = {};
    (ed[ux(0x358)] = ux(0x4b8)),
      (ed[ux(0xc0c)] = ux(0xdc2)),
      (ed[ux(0x171)] = ux(0x6ff)),
      (ed[ux(0xdfe)] = 87.5),
      (ed[ux(0xd79)] = 0xa),
      (ed[ux(0xd1b)] = [
        [ux(0x347), "A"],
        [ux(0xbe1), "A"],
      ]),
      (ed[ux(0xca5)] = 0x5),
      (ed[ux(0x87f)] = 0x5);
    const ee = {};
    (ee[ux(0x358)] = ux(0xe28)),
      (ee[ux(0xc0c)] = ux(0x3ab)),
      (ee[ux(0x171)] = ux(0x392)),
      (ee[ux(0xdfe)] = 0x32),
      (ee[ux(0xd79)] = 0xa),
      (ee[ux(0x610)] = 0.05),
      (ee[ux(0x3d7)] = 0x3c),
      (ee[ux(0x7f3)] = !![]),
      (ee[ux(0xd1b)] = [
        [ux(0xd53), "E"],
        [ux(0x622), "F"],
        [ux(0x65f), "F"],
      ]);
    const ef = {};
    (ef[ux(0x358)] = ux(0xac9)),
      (ef[ux(0xc0c)] = ux(0xc4b)),
      (ef[ux(0x171)] = ux(0x3f0)),
      (ef[ux(0xdfe)] = 0x7d),
      (ef[ux(0xd79)] = 0x28),
      (ef[ux(0x3d7)] = 0x32),
      (ef[ux(0x46a)] = ![]),
      (ef[ux(0x525)] = ![]),
      (ef[ux(0x3e1)] = dM[ux(0x3f0)]),
      (ef[ux(0x4ed)] = 0xe),
      (ef[ux(0xe5d)] = 0xb),
      (ef[ux(0xb7d)] = 2.2),
      (ef[ux(0xd1b)] = [
        [ux(0xbe2), "J"],
        [ux(0x53b), "H"],
      ]);
    const eg = {};
    (eg[ux(0x358)] = ux(0x157)),
      (eg[ux(0xc0c)] = ux(0x889)),
      (eg[ux(0x171)] = ux(0x2e5)),
      (eg[ux(0xdfe)] = 0x7d),
      (eg[ux(0xd79)] = 0x28),
      (eg[ux(0x3d7)] = null),
      (eg[ux(0x46a)] = !![]),
      (eg[ux(0x2b8)] = !![]),
      (eg[ux(0xd1b)] = [
        [ux(0x9f8), "D"],
        [ux(0x3a0), "E"],
        [ux(0xb19), "E"],
      ]),
      (eg[ux(0x3d7)] = 0x32),
      (eg[ux(0x911)] = 0x32),
      (eg[ux(0x56e)] = !![]),
      (eg[ux(0x7ef)] = -Math["PI"] / 0x2),
      (eg[ux(0x65b)] = cR[ux(0xb2a)]),
      (eg[ux(0xc9f)] = 0x3),
      (eg[ux(0x5f1)] = 0x3),
      (eg[ux(0x609)] = 0x21),
      (eg[ux(0x4e5)] = 0.32),
      (eg[ux(0x2df)] = 0.4),
      (eg[ux(0x3e1)] = dM[ux(0xd3a)]);
    const eh = {};
    (eh[ux(0x358)] = ux(0x49d)),
      (eh[ux(0xc0c)] = ux(0x193)),
      (eh[ux(0x171)] = ux(0x53c)),
      (eh[ux(0xdfe)] = 0x96),
      (eh[ux(0xd79)] = 0x14),
      (eh[ux(0x46a)] = !![]),
      (eh[ux(0x966)] = 0.5),
      (eh[ux(0xd1b)] = [
        [ux(0x49d), "D"],
        [ux(0x3ca), "J"],
        [ux(0x53b), "J"],
      ]);
    const ei = {};
    (ei[ux(0x358)] = ux(0x8da)),
      (ei[ux(0xc0c)] = ux(0x47b)),
      (ei[ux(0x171)] = ux(0x705)),
      (ei[ux(0xdfe)] = 0x19),
      (ei[ux(0xd79)] = 0xf),
      (ei[ux(0x610)] = 0.05),
      (ei[ux(0x3d7)] = 0x37),
      (ei[ux(0x7f3)] = !![]),
      (ei[ux(0xd1b)] = [[ux(0x8da), "h"]]),
      (ei[ux(0x65b)] = cR[ux(0x914)]),
      (ei[ux(0x5e5)] = 0x9),
      (ei[ux(0x609)] = 0x28),
      (ei[ux(0xc9f)] = 0xf),
      (ei[ux(0x5f1)] = 2.5),
      (ei[ux(0x609)] = 0x21),
      (ei[ux(0x4e5)] = 0.32),
      (ei[ux(0x2df)] = 1.8),
      (ei[ux(0x68e)] = 0x14);
    const ej = {};
    (ej[ux(0x358)] = ux(0x549)),
      (ej[ux(0xc0c)] = ux(0xcc7)),
      (ej[ux(0x171)] = ux(0x3f7)),
      (ej[ux(0xdfe)] = 0xe1),
      (ej[ux(0xd79)] = 0xa),
      (ej[ux(0x3d7)] = 0x32),
      (ej[ux(0xd1b)] = [
        [ux(0x549), "H"],
        [ux(0x6f7), "L"],
      ]),
      (ej[ux(0x2b8)] = !![]),
      (ej[ux(0x5a9)] = !![]),
      (ej[ux(0xe5d)] = 0x23);
    const ek = {};
    (ek[ux(0x358)] = ux(0x1aa)),
      (ek[ux(0xc0c)] = ux(0x865)),
      (ek[ux(0x171)] = ux(0xb1f)),
      (ek[ux(0xdfe)] = 0x96),
      (ek[ux(0xd79)] = 0x19),
      (ek[ux(0x3d7)] = 0x2f),
      (ek[ux(0x46a)] = !![]),
      (ek[ux(0xd1b)] = [[ux(0x53b), "J"]]),
      (ek[ux(0x65b)] = null),
      (ek[ux(0x3e1)] = dM[ux(0x97a)]);
    const em = {};
    (em[ux(0x358)] = ux(0x870)),
      (em[ux(0xc0c)] = ux(0xbe6)),
      (em[ux(0x171)] = ux(0x800)),
      (em[ux(0xdfe)] = 0x64),
      (em[ux(0xd79)] = 0x1e),
      (em[ux(0x3d7)] = 0x1e),
      (em[ux(0x46a)] = !![]),
      (em[ux(0x84b)] = ux(0x56f)),
      (em[ux(0xd1b)] = [
        [ux(0x56f), "F"],
        [ux(0xa92), "E"],
        [ux(0x4d3), "D"],
        [ux(0x273), "E"],
      ]);
    const en = {};
    (en[ux(0x358)] = ux(0x4f3)),
      (en[ux(0xc0c)] = ux(0x764)),
      (en[ux(0x171)] = ux(0x19d)),
      (en[ux(0xdfe)] = 0x64),
      (en[ux(0xd79)] = 0xa),
      (en[ux(0x3d7)] = 0x3c),
      (en[ux(0x7f3)] = !![]),
      (en[ux(0x610)] = 0.05),
      (en[ux(0xd1b)] = [[ux(0x4f3), "D"]]);
    const eo = {};
    (eo[ux(0x358)] = ux(0x697)),
      (eo[ux(0xc0c)] = ux(0xe1f)),
      (eo[ux(0x171)] = ux(0x238)),
      (eo[ux(0xdfe)] = 0x64),
      (eo[ux(0xd79)] = 0x23),
      (eo[ux(0x46a)] = !![]),
      (eo[ux(0xd1b)] = [
        [ux(0x1df), "E"],
        [ux(0xbf7), "D"],
      ]);
    const ep = {};
    (ep[ux(0x358)] = ux(0x6df)),
      (ep[ux(0xc0c)] = ux(0xa96)),
      (ep[ux(0x171)] = ux(0x3cb)),
      (ep[ux(0xdfe)] = 0xc8),
      (ep[ux(0xd79)] = 0x23),
      (ep[ux(0x3d7)] = 0x23),
      (ep[ux(0x46a)] = !![]),
      (ep[ux(0x87f)] = 0x5),
      (ep[ux(0xd1b)] = [
        [ux(0xdce), "F"],
        [ux(0x261), "D"],
        [ux(0xc5f), "E"],
      ]);
    const eq = {};
    (eq[ux(0x358)] = ux(0x96d)),
      (eq[ux(0xc0c)] = ux(0x6f3)),
      (eq[ux(0x171)] = ux(0x1cb)),
      (eq[ux(0xdfe)] = 0xc8),
      (eq[ux(0xd79)] = 0x14),
      (eq[ux(0x3d7)] = 0x28),
      (eq[ux(0x46a)] = !![]),
      (eq[ux(0xd1b)] = [
        [ux(0x1c3), "E"],
        [ux(0x17d), "D"],
        [ux(0xde1), "F"],
        [ux(0x8f2), "F"],
      ]),
      (eq[ux(0x435)] = !![]),
      (eq[ux(0xb55)] = 0xbb8),
      (eq[ux(0x9bf)] = 0.3);
    const er = {};
    (er[ux(0x358)] = ux(0x85f)),
      (er[ux(0xc0c)] = ux(0xe69)),
      (er[ux(0x171)] = ux(0x5aa)),
      (er[ux(0xdfe)] = 0x78),
      (er[ux(0xd79)] = 0x1e),
      (er[ux(0x5a9)] = !![]),
      (er[ux(0xe5d)] = 0xf),
      (er[ux(0x4ed)] = 0x5),
      (er[ux(0xd1b)] = [
        [ux(0x85f), "F"],
        [ux(0x54a), "E"],
        [ux(0x4f1), "D"],
      ]),
      (er[ux(0x87f)] = 0x3);
    const es = {};
    (es[ux(0x358)] = ux(0x29c)),
      (es[ux(0xc0c)] = ux(0xc06)),
      (es[ux(0x171)] = ux(0xd18)),
      (es[ux(0xdfe)] = 0x78),
      (es[ux(0xd79)] = 0x23),
      (es[ux(0x3d7)] = 0x32),
      (es[ux(0x46a)] = !![]),
      (es[ux(0x37e)] = !![]),
      (es[ux(0xd1b)] = [
        [ux(0x29c), "E"],
        [ux(0x65f), "F"],
      ]),
      (es[ux(0x62f)] = [[ux(0x7ba), 0x1]]),
      (es[ux(0xb10)] = [[ux(0x7ba), 0x2]]),
      (es[ux(0x885)] = !![]);
    const et = {};
    (et[ux(0x358)] = ux(0x7ba)),
      (et[ux(0xc0c)] = ux(0x9f5)),
      (et[ux(0x171)] = ux(0x5b4)),
      (et[ux(0xdfe)] = 0x96),
      (et[ux(0xd79)] = 0.1),
      (et[ux(0x3d7)] = 0x28),
      (et[ux(0x4ed)] = 0xe),
      (et[ux(0xe5d)] = 11.6),
      (et[ux(0x46a)] = !![]),
      (et[ux(0x37e)] = !![]),
      (et[ux(0xbbf)] = !![]),
      (et[ux(0x3e1)] = dM[ux(0x3f0)]),
      (et[ux(0x43a)] = 0xa),
      (et[ux(0xd1b)] = [[ux(0x529), "G"]]),
      (et[ux(0x656)] = 0.5);
    const eu = {};
    (eu[ux(0x358)] = ux(0x36e)),
      (eu[ux(0xc0c)] = ux(0x913)),
      (eu[ux(0x171)] = ux(0xa25)),
      (eu[ux(0xdfe)] = 0x1f4),
      (eu[ux(0xd79)] = 0x28),
      (eu[ux(0x610)] = 0.05),
      (eu[ux(0x3d7)] = 0x32),
      (eu[ux(0x7f3)] = !![]),
      (eu[ux(0xe5d)] = 0x5),
      (eu[ux(0x727)] = !![]),
      (eu[ux(0x4b2)] = !![]),
      (eu[ux(0xd1b)] = [
        [ux(0xdf6), "F"],
        [ux(0xd21), "C"],
      ]),
      (eu[ux(0x62f)] = [
        [ux(0x7ee), 0x2],
        [ux(0xa75), 0x1],
      ]),
      (eu[ux(0xb10)] = [
        [ux(0x7ee), 0x4],
        [ux(0xa75), 0x2],
      ]);
    const ev = {};
    (ev[ux(0x358)] = ux(0x5b0)),
      (ev[ux(0xc0c)] = ux(0x769)),
      (ev[ux(0x171)] = ux(0xa36)),
      (ev[ux(0xdfe)] = 0x50),
      (ev[ux(0xd79)] = 0x28),
      (ev[ux(0x4ed)] = 0x2),
      (ev[ux(0xe5d)] = 0x6),
      (ev[ux(0x2b8)] = !![]),
      (ev[ux(0xd1b)] = [[ux(0x5b0), "F"]]);
    const ew = {};
    (ew[ux(0x358)] = ux(0x16b)),
      (ew[ux(0xc0c)] = ux(0x3a2)),
      (ew[ux(0x171)] = ux(0x603)),
      (ew[ux(0xdfe)] = 0x1f4),
      (ew[ux(0xd79)] = 0x28),
      (ew[ux(0x610)] = 0.05),
      (ew[ux(0x3d7)] = 0x46),
      (ew[ux(0xe5d)] = 0x5),
      (ew[ux(0x7f3)] = !![]),
      (ew[ux(0x727)] = !![]),
      (ew[ux(0x4b2)] = !![]),
      (ew[ux(0xd1b)] = [
        [ux(0xdf7), "A"],
        [ux(0x166), "E"],
      ]),
      (ew[ux(0x62f)] = [[ux(0xa6b), 0x2]]),
      (ew[ux(0xb10)] = [
        [ux(0xa6b), 0x3],
        [ux(0x870), 0x2],
      ]);
    const ex = {};
    (ex[ux(0x358)] = ux(0x9dc)),
      (ex[ux(0xc0c)] = ux(0xca4)),
      (ex[ux(0x171)] = ux(0x2fd)),
      (ex[ux(0x3d7)] = 0x28),
      (ex[ux(0xdfe)] = 0x64),
      (ex[ux(0xd79)] = 0xa),
      (ex[ux(0x610)] = 0.05),
      (ex[ux(0x7f3)] = !![]),
      (ex[ux(0xca5)] = 0x1),
      (ex[ux(0x87f)] = 0x1),
      (ex[ux(0xd1b)] = [
        [ux(0x261), "G"],
        [ux(0x3ca), "F"],
        [ux(0x7d1), "F"],
      ]);
    const ey = {};
    (ey[ux(0x358)] = ux(0xad5)),
      (ey[ux(0xc0c)] = ux(0xb34)),
      (ey[ux(0x171)] = ux(0xbae)),
      (ey[ux(0xdfe)] = 0x3c),
      (ey[ux(0xd79)] = 0x28),
      (ey[ux(0x3d7)] = 0x32),
      (ey[ux(0x46a)] = ![]),
      (ey[ux(0x525)] = ![]),
      (ey[ux(0x3e1)] = dM[ux(0x3f0)]),
      (ey[ux(0x4ed)] = 0xe),
      (ey[ux(0xe5d)] = 0xb),
      (ey[ux(0xb7d)] = 2.2),
      (ey[ux(0xd1b)] = [
        [ux(0xbf7), "E"],
        [ux(0x53b), "J"],
      ]);
    const ez = {};
    (ez[ux(0x358)] = ux(0xdb9)),
      (ez[ux(0xc0c)] = ux(0xd07)),
      (ez[ux(0x171)] = ux(0xdf0)),
      (ez[ux(0xdfe)] = 0x258),
      (ez[ux(0xd79)] = 0x32),
      (ez[ux(0x610)] = 0.05),
      (ez[ux(0x3d7)] = 0x3c),
      (ez[ux(0xe5d)] = 0x7),
      (ez[ux(0x4b2)] = !![]),
      (ez[ux(0x7f3)] = !![]),
      (ez[ux(0x727)] = !![]),
      (ez[ux(0xd1b)] = [
        [ux(0x1c3), "A"],
        [ux(0xbe2), "G"],
      ]),
      (ez[ux(0x62f)] = [[ux(0x96d), 0x1]]),
      (ez[ux(0xb10)] = [[ux(0x96d), 0x1]]);
    const eA = {};
    (eA[ux(0x358)] = ux(0xe20)),
      (eA[ux(0xc0c)] = ux(0x492)),
      (eA[ux(0x171)] = ux(0x4b1)),
      (eA[ux(0xdfe)] = 0xc8),
      (eA[ux(0xd79)] = 0x1e),
      (eA[ux(0x3d7)] = 0x2d),
      (eA[ux(0x46a)] = !![]),
      (eA[ux(0xd1b)] = [
        [ux(0x247), "G"],
        [ux(0x22e), "H"],
        [ux(0x4f1), "E"],
      ]);
    const eB = {};
    (eB[ux(0x358)] = ux(0x6d8)),
      (eB[ux(0xc0c)] = ux(0xdb5)),
      (eB[ux(0x171)] = ux(0x9c9)),
      (eB[ux(0xdfe)] = 0x3c),
      (eB[ux(0xd79)] = 0x64),
      (eB[ux(0x3d7)] = 0x28),
      (eB[ux(0x108)] = !![]),
      (eB[ux(0x7bd)] = ![]),
      (eB[ux(0x46a)] = !![]),
      (eB[ux(0xd1b)] = [
        [ux(0x17d), "F"],
        [ux(0xcc6), "D"],
        [ux(0xd5d), "G"],
      ]);
    const eC = {};
    (eC[ux(0x358)] = ux(0x936)),
      (eC[ux(0xc0c)] = ux(0x3e6)),
      (eC[ux(0x171)] = ux(0xa1e)),
      (eC[ux(0x3d7)] = 0x28),
      (eC[ux(0xdfe)] = 0x5a),
      (eC[ux(0xd79)] = 0x5),
      (eC[ux(0x610)] = 0.05),
      (eC[ux(0x7f3)] = !![]),
      (eC[ux(0xd1b)] = [[ux(0x936), "h"]]);
    const eD = {};
    (eD[ux(0x358)] = ux(0x6d0)),
      (eD[ux(0xc0c)] = ux(0x666)),
      (eD[ux(0x171)] = ux(0x38c)),
      (eD[ux(0xdfe)] = 0x32),
      (eD[ux(0xd79)] = 0x14),
      (eD[ux(0x3d7)] = 0x28),
      (eD[ux(0x2b8)] = !![]),
      (eD[ux(0xd1b)] = [[ux(0x6d0), "F"]]);
    const eE = {};
    (eE[ux(0x358)] = ux(0x8a6)),
      (eE[ux(0xc0c)] = ux(0x557)),
      (eE[ux(0x171)] = ux(0x725)),
      (eE[ux(0xdfe)] = 0x32),
      (eE[ux(0xd79)] = 0x14),
      (eE[ux(0x610)] = 0.05),
      (eE[ux(0x7f3)] = !![]),
      (eE[ux(0xd1b)] = [[ux(0x8a6), "J"]]);
    const eF = {};
    (eF[ux(0x358)] = ux(0x2a7)),
      (eF[ux(0xc0c)] = ux(0x763)),
      (eF[ux(0x171)] = ux(0xcd0)),
      (eF[ux(0xdfe)] = 0x64),
      (eF[ux(0xd79)] = 0x1e),
      (eF[ux(0x610)] = 0.05),
      (eF[ux(0x3d7)] = 0x32),
      (eF[ux(0x7f3)] = !![]),
      (eF[ux(0xd1b)] = [
        [ux(0x17d), "D"],
        [ux(0x8e4), "E"],
      ]);
    const eG = {};
    (eG[ux(0x358)] = ux(0x85b)),
      (eG[ux(0xc0c)] = ux(0xdf9)),
      (eG[ux(0x171)] = ux(0xba7)),
      (eG[ux(0xdfe)] = 0x96),
      (eG[ux(0xd79)] = 0x14),
      (eG[ux(0x3d7)] = 0x28),
      (eG[ux(0xd1b)] = [
        [ux(0x9cd), "D"],
        [ux(0x54a), "F"],
      ]),
      (eG[ux(0xb10)] = [[ux(0xb7b), 0x1, 0.3]]);
    const eH = {};
    (eH[ux(0x358)] = ux(0xd8c)),
      (eH[ux(0xc0c)] = ux(0x4e4)),
      (eH[ux(0x171)] = ux(0xc99)),
      (eH[ux(0xdfe)] = 0x32),
      (eH[ux(0xd79)] = 0x5),
      (eH[ux(0x610)] = 0.05),
      (eH[ux(0x7f3)] = !![]),
      (eH[ux(0xd1b)] = [
        [ux(0xd8c), "h"],
        [ux(0xcc6), "J"],
      ]);
    const eI = {};
    (eI[ux(0x358)] = ux(0x5a2)),
      (eI[ux(0xc0c)] = ux(0x75c)),
      (eI[ux(0x171)] = ux(0xe32)),
      (eI[ux(0xdfe)] = 0x64),
      (eI[ux(0xd79)] = 0x5),
      (eI[ux(0x610)] = 0.05),
      (eI[ux(0x7f3)] = !![]),
      (eI[ux(0xd1b)] = [[ux(0x5a2), "h"]]);
    var eJ = [
        dY,
        dZ,
        e0,
        e1,
        e2,
        ...dV,
        ...dW(),
        e3,
        e4,
        e5,
        e6,
        e7,
        e8,
        e9,
        ea,
        eb,
        ec,
        ed,
        ee,
        ef,
        eg,
        eh,
        ei,
        ej,
        ek,
        em,
        en,
        eo,
        ep,
        eq,
        er,
        es,
        et,
        eu,
        ev,
        ew,
        ex,
        ey,
        ez,
        eA,
        eB,
        eC,
        eD,
        eE,
        eF,
        eG,
        eH,
        eI,
      ],
      eK = eJ[ux(0xc2f)],
      eL = {},
      eM = [],
      eN = eO();
    function eO() {
      const re = [];
      for (let rf = 0x0; rf < dG; rf++) {
        re[rf] = [];
      }
      return re;
    }
    for (let re = 0x0; re < eK; re++) {
      const rf = eJ[re];
      for (let rg in dP) {
        rf[rg] === void 0x0 && (rf[rg] = dP[rg]);
      }
      (eM[re] = [rf]), (rf[ux(0x171)] = cR[rf[ux(0x171)]]), eQ(rf);
      rf[ux(0xd1b)] &&
        rf[ux(0xd1b)][ux(0xa40)]((rh) => {
          const uK = ux;
          rh[0x1] = rh[0x1][uK(0x3fc)]()[uK(0x39e)](0x0) - 0x41;
        });
      (rf["id"] = re), (rf[ux(0x737)] = re);
      if (!rf[ux(0x5ee)]) rf[ux(0x5ee)] = rf[ux(0x358)];
      for (let rh = 0x1; rh <= da; rh++) {
        const ri = JSON[ux(0x96e)](JSON[ux(0xe67)](rf));
        (ri[ux(0x358)] = rf[ux(0x358)] + "_" + rh),
          (ri[ux(0x5b6)] = rh),
          (eM[re][rh] = ri),
          dI(rf, ri),
          eQ(ri),
          (ri["id"] = eJ[ux(0xc2f)]),
          eJ[ux(0x9db)](ri);
      }
    }
    for (let rj = 0x0; rj < eJ[ux(0xc2f)]; rj++) {
      const rk = eJ[rj];
      rk[ux(0x62f)] && eP(rk, rk[ux(0x62f)]),
        rk[ux(0xb10)] && eP(rk, rk[ux(0xb10)]);
    }
    function eP(rl, rm) {
      const uL = ux;
      rm[uL(0xa40)]((rn) => {
        const uM = uL,
          ro = rn[0x0] + (rl[uM(0x5b6)] > 0x0 ? "_" + rl[uM(0x5b6)] : "");
        rn[0x0] = eL[ro];
      });
    }
    function eQ(rl) {
      const uN = ux;
      (rl[uN(0x11f)] = df(rl[uN(0x5b6)], rl[uN(0xdfe)]) * dK[rl[uN(0x5b6)]]),
        (rl[uN(0xbf6)] = df(rl[uN(0x5b6)], rl[uN(0xd79)])),
        rl[uN(0x56e)]
          ? (rl[uN(0x911)] = rl[uN(0x3d7)])
          : (rl[uN(0x911)] = rl[uN(0x3d7)] * dL[rl[uN(0x5b6)]]),
        (rl[uN(0x7c6)] = df(rl[uN(0x5b6)], rl[uN(0x10f)])),
        (rl[uN(0x3c9)] = df(rl[uN(0x5b6)], rl[uN(0xc9f)])),
        (rl[uN(0x8c9)] = df(rl[uN(0x5b6)], rl[uN(0x5f1)]) * dK[rl[uN(0x5b6)]]),
        (rl[uN(0x989)] = df(rl[uN(0x5b6)], rl[uN(0x279)])),
        rl[uN(0x9bf)] && (rl[uN(0xd89)] = df(rl[uN(0x5b6)], rl[uN(0x9bf)])),
        (rl[uN(0x904)] = df(rl[uN(0x5b6)], rl[uN(0x4d7)])),
        (eL[rl[uN(0x358)]] = rl),
        eN[rl[uN(0x5b6)]][uN(0x9db)](rl);
    }
    function eR(rl) {
      return (rl / 0xff) * Math["PI"] * 0x2;
    }
    var eS = Math["PI"] * 0x2;
    function eT(rl) {
      const uO = ux;
      return (
        (rl %= eS), rl < 0x0 && (rl += eS), Math[uO(0x22b)]((rl / eS) * 0xff)
      );
    }
    function eU(rl) {
      const uP = ux;
      if (!rl || rl[uP(0xc2f)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        uP(0xe5b)
      ](rl);
    }
    function eV(rl, rm) {
      return dE[rl + (rm > 0x0 ? "_" + rm : "")];
    }
    var eW = d9[ux(0xe56)]((rl) => rl[ux(0x49a)]() + ux(0x47a)),
      eX = d9[ux(0xe56)]((rl) => ux(0x547) + rl + ux(0xe6d)),
      eY = {};
    eW[ux(0xa40)]((rl) => {
      eY[rl] = 0x0;
    });
    var eZ = {};
    eX[ux(0xa40)]((rl) => {
      eZ[rl] = 0x0;
    });
    var f0 = 0x1 / 0x3e8 / 0x3c / 0x3c;
    function f1() {
      const uQ = ux;
      return {
        timePlayed: 0x0,
        gamesPlayed: 0x0,
        maxTimeAlive: 0x0,
        maxScore: 0x0,
        maxKills: 0x0,
        maxPetalsPicked: 0x0,
        totalKills: 0x0,
        totalPetals: 0x0,
        petalsPicked: 0x0,
        petalsAbsorbed: 0x0,
        petalsCrafted: 0x0,
        petalsDestroyed: 0x0,
        craftAttempts: 0x0,
        maxWave: 0x0,
        chatSent: 0x0,
        timeJoined: Date[uQ(0xa4a)]() * f0,
      };
    }
    var f2 = ux(0x978)[ux(0x2a6)]("\x20");
    function f3(rl) {
      const rm = {};
      for (let rn in rl) {
        rm[rl[rn]] = rn;
      }
      return rm;
    }
    var f4 = [
      [
        [
          [0x10, 0x0],
          [0x54, 0x1],
        ],
        [
          [0.07, 0x0],
          [99.9, 0x1],
        ],
        [
          [2.8, 0x1],
          [97.2, 0x2],
        ],
        [
          [0.6, 0x2],
          [99.4, 0x3],
        ],
        [
          [18.9, 0x3],
          [81.1, 0x4],
        ],
        [
          [97.5, 0x4],
          [2.5, 0x5],
        ],
        [
          [77.3, 0x4],
          [21.9, 0x5],
          [0.8, 0x6],
        ],
        [
          [43.5, 0x5],
          [56.5, 0x6],
        ],
      ],
      [
        [
          [22.1, 0x0],
          [77.9, 0x1],
        ],
        [
          [0.2, 0x0],
          [99.8, 0x1],
        ],
        [
          [4.8, 0x1],
          [95.2, 0x2],
        ],
        [
          [1.3, 0x2],
          [98.7, 0x3],
        ],
        [
          [24.3, 0x3],
          [75.7, 0x4],
        ],
        [
          [97.8, 0x4],
          [2.2, 0x5],
        ],
        [
          [80.3, 0x4],
          [0x13, 0x5],
          [0.7, 0x6],
        ],
        [
          [49.3, 0x5],
          [50.7, 0x6],
        ],
      ],
      [
        [
          [27.1, 0x0],
          [72.9, 0x1],
        ],
        [
          [0.5, 0x0],
          [99.5, 0x1],
        ],
        [
          [6.9, 0x1],
          [93.1, 0x2],
        ],
        [
          [2.2, 0x2],
          [97.8, 0x3],
        ],
        [
          [28.7, 0x3],
          [71.3, 0x4],
        ],
        [
          [98.1, 0x4],
          [1.9, 0x5],
        ],
        [
          [82.4, 0x4],
          [0x11, 0x5],
          [0.6, 0x6],
        ],
        [
          [53.6, 0x5],
          [46.4, 0x6],
        ],
      ],
      [
        [
          [43.5, 0x0],
          [56.5, 0x1],
        ],
        [
          [3.6, 0x0],
          [96.4, 0x1],
        ],
        [
          [16.9, 0x1],
          [83.1, 0x2],
        ],
        [
          [7.9, 0x2],
          [92.1, 0x3],
        ],
        [
          [43.5, 0x3],
          [56.5, 0x4],
        ],
        [
          [98.7, 0x4],
          [1.3, 0x5],
        ],
        [
          [87.9, 0x4],
          [11.7, 0x5],
          [0.4, 0x6],
        ],
        [
          [0x42, 0x5],
          [0x22, 0x6],
        ],
      ],
      [
        [
          [44.9, 0x0],
          [38.3, 0x1],
        ],
        [
          [14.4, 0x0],
          [85.5, 0x1],
        ],
        [
          [34.5, 0x1],
          [65.5, 0x2],
        ],
        [
          [21.8, 0x2],
          [78.2, 0x3],
        ],
        [
          [60.1, 0x3],
          [39.9, 0x4],
        ],
        [
          [99.2, 0x4],
          [0.8, 0x5],
        ],
        [
          [92.6, 0x4],
          [7.2, 0x5],
          [0.2, 0x6],
        ],
        [
          [0.04, 0x4],
          [77.9, 0x5],
          [22.1, 0x6],
        ],
      ],
      [
        [
          [43.4, 0x0],
          [32.9, 0x1],
        ],
        [
          [0x14, 0x0],
          [79.7, 0x1],
        ],
        [
          [41.2, 0x1],
          [58.8, 0x2],
        ],
        [
          [28.1, 0x2],
          [71.9, 0x3],
        ],
        [
          [0x42, 0x3],
          [0x22, 0x4],
        ],
        [
          [99.4, 0x4],
          [0.6, 0x5],
        ],
        [
          [93.8, 0x4],
          [0x6, 0x5],
          [0.2, 0x6],
        ],
        [
          [0.2, 0x4],
          [81.1, 0x5],
          [18.8, 0x6],
        ],
      ],
      [
        [
          [40.1, 0x0],
          [27.1, 0x1],
        ],
        [
          [0x1b, 0x0],
          [71.8, 0x1],
        ],
        [
          [49.3, 0x1],
          [50.7, 0x2],
        ],
        [
          [36.2, 0x2],
          [63.8, 0x3],
        ],
        [
          [71.7, 0x3],
          [28.3, 0x4],
        ],
        [
          [99.5, 0x4],
          [0.5, 0x5],
        ],
        [
          [0x5f, 0x4],
          [4.9, 0x5],
          [0.2, 0x6],
        ],
        [
          [0.6, 0x4],
          [84.1, 0x5],
          [15.3, 0x6],
        ],
      ],
      [
        [
          [34.6, 0x0],
          [0x15, 0x1],
        ],
        [
          [35.1, 0x0],
          [0x3d, 0x1],
        ],
        [
          [0.4, 0x0],
          [58.5, 0x1],
          [41.2, 0x2],
        ],
        [
          [46.7, 0x2],
          [53.3, 0x3],
        ],
        [
          [77.9, 0x3],
          [22.1, 0x4],
        ],
        [
          [99.6, 0x4],
          [0.4, 0x5],
        ],
        [
          [96.2, 0x4],
          [3.7, 0x5],
          [0.1, 0x6],
        ],
        [
          [2.1, 0x4],
          [86.2, 0x5],
          [11.7, 0x6],
        ],
      ],
      [
        [
          [26.5, 0x0],
          [14.4, 0x1],
        ],
        [
          [41.5, 0x0],
          [46.4, 0x1],
        ],
        [
          [2.4, 0x0],
          [67.8, 0x1],
          [29.8, 0x2],
        ],
        [
          [0.01, 0x1],
          [60.2, 0x2],
          [39.8, 0x3],
        ],
        [
          [84.7, 0x3],
          [15.3, 0x4],
        ],
        [
          [0.2, 0x3],
          [99.7, 0x4],
          [0.3, 0x5],
        ],
        [
          [97.5, 0x4],
          [2.5, 0x5],
          [0.08, 0x6],
        ],
        [
          [7.6, 0x4],
          [84.4, 0x5],
          [0x8, 0x6],
        ],
      ],
      [
        [
          [15.2, 0x0],
          [7.4, 0x1],
        ],
        [
          [37.6, 0x0],
          [26.6, 0x1],
        ],
        [
          [15.4, 0x0],
          [68.2, 0x1],
          [16.2, 0x2],
        ],
        [
          [1.2, 0x1],
          [76.4, 0x2],
          [22.4, 0x3],
        ],
        [
          [0.6, 0x2],
          [91.4, 0x3],
          [0x8, 0x4],
        ],
        [
          [1.6, 0x3],
          [98.3, 0x4],
          [0.1, 0x5],
        ],
        [
          [98.7, 0x4],
          [1.2, 0x5],
          [0.04, 0x6],
        ],
        [
          [27.5, 0x4],
          [68.4, 0x5],
          [4.1, 0x6],
        ],
      ],
      [
        [
          [6.6, 0x0],
          [0x3, 0x1],
        ],
        [
          [21.7, 0x0],
          [11.6, 0x1],
        ],
        [
          [38.9, 0x0],
          [45.4, 0x1],
          [6.8, 0x2],
        ],
        [
          [17.1, 0x1],
          [73.2, 0x2],
          [9.7, 0x3],
        ],
        [
          [13.1, 0x2],
          [83.6, 0x3],
          [3.3, 0x4],
        ],
        [
          [18.9, 0x3],
          [0x51, 0x4],
          [0.05, 0x5],
        ],
        [
          [99.5, 0x4],
          [0.5, 0x5],
          [0.02, 0x6],
        ],
        [
          [59.7, 0x4],
          [38.6, 0x5],
          [1.7, 0x6],
        ],
      ],
      [
        [
          [3.4, 0x0],
          [1.5, 0x1],
        ],
        [
          [12.3, 0x0],
          [0x6, 0x1],
        ],
        [
          [39.2, 0x0],
          [27.4, 0x1],
          [3.5, 0x2],
        ],
        [
          [41.4, 0x1],
          [53.7, 0x2],
          [4.9, 0x3],
        ],
        [
          [36.2, 0x2],
          [62.1, 0x3],
          [1.7, 0x4],
        ],
        [
          [43.5, 0x3],
          [56.5, 0x4],
          [0.03, 0x5],
        ],
        [
          [99.7, 0x4],
          [0.2, 0x5],
          [0.008, 0x6],
        ],
        [
          [77.3, 0x4],
          [21.9, 0x5],
          [0.8, 0x6],
        ],
      ],
    ];
    for (let rl = 0x0; rl < f4[ux(0xc2f)]; rl++) {
      const rm = f4[rl],
        rn = rm[rm[ux(0xc2f)] - 0x1],
        ro = dN(rn);
      for (let rp = 0x0; rp < ro[ux(0xc2f)]; rp++) {
        const rq = ro[rp];
        if (rq[0x0] < 0x1e) {
          let rr = rq[0x0];
          (rr *= 1.5),
            rr < 1.5 && (rr *= 0xa),
            (rr = parseFloat(rr[ux(0xbca)](0x3))),
            (rq[0x0] = rr);
        }
        rq[0x1] = d8[ux(0xde5)];
      }
      ro[ux(0x9db)]([0.01, d8[ux(0x766)]]), rm[ux(0x9db)](ro);
    }
    var f5 = [
      null,
      [
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0],
        [0x0, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1, 0x0],
        [0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x1, 0x0],
        [0x0, 0x1, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0],
        [0x0, 0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x0],
        [0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
      ],
      [
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x1, 0x1, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x1, 0x1, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1],
        [0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x0, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
      ],
      [
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0],
      ],
      [
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
      ],
      [
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x1, 0x1, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x1, 0x1, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
      ],
      [
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1],
        [0x1, 0x0, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x0, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x1, 0x1, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x1],
        [0x0, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x0],
        [0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0],
        [0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0],
        [0x0, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x0, 0x0],
        [0x1, 0x0, 0x0, 0x1, 0x1, 0x1, 0x1, 0x0, 0x0, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x1, 0x1, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1],
      ],
      [
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x0, 0x1, 0x1, 0x0, 0x1, 0x1, 0x1],
        [0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1, 0x1],
      ],
      [
        [0x0, 0x0, 0x0, 0x1, 0x0, 0x1, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x1, 0x1, 0x1, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1],
        [0x0, 0x1, 0x0, 0x1, 0x0, 0x1, 0x0, 0x1, 0x0],
        [0x1, 0x1, 0x0, 0x1, 0x1, 0x1, 0x0, 0x1, 0x1],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x1, 0x1, 0x1, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x1, 0x0, 0x1, 0x0, 0x0, 0x0],
      ],
    ];
    function f6(rs, rt) {
      var ru = Math["PI"] * 0x2,
        rv = (rt - rs) % ru;
      return ((0x2 * rv) % ru) - rv;
    }
    function f7(rs, rt, ru) {
      return rs + f6(rs, rt) * ru;
    }
    var f8 = {
      instagram: ux(0xbfe),
      discord: ux(0xa2a),
      paw: ux(0x446),
      gear: ux(0x40c),
      scroll: ux(0xa1d),
      bag: ux(0xd67),
      food: ux(0x6bc),
      graph: ux(0x56c),
      resize: ux(0x6e7),
      users: ux(0x74d),
      trophy: ux(0x398),
      shop: ux(0x99d),
      dice: ux(0x701),
      data: ux(0x3da),
      poopPath: new Path2D(ux(0xcc9)),
    };
    function f9(rs) {
      const uR = ux;
      return rs[uR(0xbb7)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fa(rs) {
      const uS = ux;
      if(hack.isEnabled('disableChatCheck')) return rs;
      return (
        (rs = f9(rs)),
        (rs = rs[uS(0xbb7)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uS(0xbb7)](/(.)\1{2,}/gi, "$1")
          [uS(0xbb7)](/\u200B|\u200C|\u200D/g, "")
          [uS(0x6da)]()),
        !rs && (rs = uS(0x8d4)),
        rs
      );
    }
    var fb = 0x114;
    function fc(rs) {
      const uT = ux,
        rt = rs[uT(0x2a6)]("\x0a")[uT(0x4ff)](
          (ru) => ru[uT(0x6da)]()[uT(0xc2f)] > 0x0
        );
      return { title: rt[uT(0x7aa)](), content: rt };
    }
    const fd = {};
    (fd[ux(0x10b)] = ux(0x1c1)),
      (fd[ux(0x994)] = [
        ux(0x6ad),
        ux(0x92c),
        ux(0x712),
        ux(0xd38),
        ux(0x3d9),
        ux(0x87c),
        ux(0xde3),
        ux(0x589),
      ]);
    const fe = {};
    (fe[ux(0x10b)] = ux(0x950)), (fe[ux(0x994)] = [ux(0xe73)]);
    const ff = {};
    (ff[ux(0x10b)] = ux(0x49c)),
      (ff[ux(0x994)] = [ux(0xc42), ux(0xd12), ux(0x3d0), ux(0xa6e)]);
    const fg = {};
    (fg[ux(0x10b)] = ux(0x225)),
      (fg[ux(0x994)] = [
        ux(0x827),
        ux(0x4e1),
        ux(0x16e),
        ux(0x6a8),
        ux(0x517),
        ux(0x3cd),
        ux(0x391),
        ux(0xd3b),
        ux(0xd45),
      ]);
    const fh = {};
    (fh[ux(0x10b)] = ux(0x69d)),
      (fh[ux(0x994)] = [ux(0x720), ux(0xc17), ux(0x86a), ux(0x65a)]);
    const fi = {};
    (fi[ux(0x10b)] = ux(0x595)), (fi[ux(0x994)] = [ux(0xb1c)]);
    const fj = {};
    (fj[ux(0x10b)] = ux(0x54f)), (fj[ux(0x994)] = [ux(0xbaa), ux(0xa0c)]);
    const fk = {};
    (fk[ux(0x10b)] = ux(0x698)),
      (fk[ux(0x994)] = [
        ux(0x90c),
        ux(0xd72),
        ux(0x66b),
        ux(0x522),
        ux(0x2fe),
        ux(0x1d5),
        ux(0x5c9),
        ux(0xe68),
      ]);
    const fl = {};
    (fl[ux(0x10b)] = ux(0xb37)),
      (fl[ux(0x994)] = [
        ux(0xc9b),
        ux(0xd8e),
        ux(0x616),
        ux(0x9a8),
        ux(0xbd6),
        ux(0x5ed),
        ux(0xd57),
        ux(0xbf3),
      ]);
    const fm = {};
    (fm[ux(0x10b)] = ux(0x169)), (fm[ux(0x994)] = [ux(0xc92)]);
    const fn = {};
    (fn[ux(0x10b)] = ux(0xc4d)),
      (fn[ux(0x994)] = [
        ux(0x555),
        ux(0x886),
        ux(0x64b),
        ux(0x707),
        ux(0x21f),
        ux(0x9a3),
        ux(0xe76),
      ]);
    const fo = {};
    (fo[ux(0x10b)] = ux(0xd44)), (fo[ux(0x994)] = [ux(0xb4b)]);
    const fp = {};
    (fp[ux(0x10b)] = ux(0x6ed)),
      (fp[ux(0x994)] = [ux(0xcf2), ux(0x7e6), ux(0x926), ux(0x7a3)]);
    const fq = {};
    (fq[ux(0x10b)] = ux(0x772)), (fq[ux(0x994)] = [ux(0x14c), ux(0x4b7)]);
    const fr = {};
    (fr[ux(0x10b)] = ux(0x8a5)),
      (fr[ux(0x994)] = [ux(0x154), ux(0x379), ux(0xd6b), ux(0x7c4)]);
    const fs = {};
    (fs[ux(0x10b)] = ux(0xe23)),
      (fs[ux(0x994)] = [ux(0x822), ux(0x3e3), ux(0xc9c), ux(0x30d)]);
    const ft = {};
    (ft[ux(0x10b)] = ux(0xddd)),
      (ft[ux(0x994)] = [
        ux(0x6a6),
        ux(0xe52),
        ux(0x345),
        ux(0x920),
        ux(0x710),
        ux(0x2d9),
      ]);
    const fu = {};
    (fu[ux(0x10b)] = ux(0x850)), (fu[ux(0x994)] = [ux(0x93e)]);
    const fv = {};
    (fv[ux(0x10b)] = ux(0xe53)), (fv[ux(0x994)] = [ux(0x411), ux(0x714)]);
    const fw = {};
    (fw[ux(0x10b)] = ux(0xcdb)),
      (fw[ux(0x994)] = [ux(0x3ff), ux(0xaeb), ux(0x9f3)]);
    const fx = {};
    (fx[ux(0x10b)] = ux(0xc21)),
      (fx[ux(0x994)] = [ux(0x637), ux(0x4d8), ux(0x5e1), ux(0x41e), ux(0x264)]);
    const fy = {};
    (fy[ux(0x10b)] = ux(0x9c3)), (fy[ux(0x994)] = [ux(0x997), ux(0x1ca)]);
    const fz = {};
    (fz[ux(0x10b)] = ux(0x1a9)),
      (fz[ux(0x994)] = [ux(0x8f6), ux(0xca6), ux(0x884)]);
    const fA = {};
    (fA[ux(0x10b)] = ux(0x51f)), (fA[ux(0x994)] = [ux(0x2e9)]);
    const fB = {};
    (fB[ux(0x10b)] = ux(0xb2b)), (fB[ux(0x994)] = [ux(0x203)]);
    const fC = {};
    (fC[ux(0x10b)] = ux(0xa89)), (fC[ux(0x994)] = [ux(0xd80)]);
    const fD = {};
    (fD[ux(0x10b)] = ux(0xe01)),
      (fD[ux(0x994)] = [ux(0x305), ux(0x377), ux(0x1fa)]);
    const fE = {};
    (fE[ux(0x10b)] = ux(0x882)),
      (fE[ux(0x994)] = [
        ux(0x901),
        ux(0x6b4),
        ux(0x217),
        ux(0xbd0),
        ux(0x39b),
        ux(0x749),
        ux(0x798),
        ux(0x902),
        ux(0xc28),
        ux(0xb07),
        ux(0x18e),
        ux(0x563),
        ux(0x869),
        ux(0x63e),
      ]);
    const fF = {};
    (fF[ux(0x10b)] = ux(0x61c)),
      (fF[ux(0x994)] = [
        ux(0xaf9),
        ux(0xb65),
        ux(0x6d3),
        ux(0x322),
        ux(0xc52),
        ux(0x7de),
        ux(0xaa3),
        ux(0xac2),
      ]);
    const fG = {};
    (fG[ux(0x10b)] = ux(0x94d)),
      (fG[ux(0x994)] = [
        ux(0x856),
        ux(0xc05),
        ux(0xabc),
        ux(0x90e),
        ux(0xcc2),
        ux(0x5d4),
        ux(0x3c2),
        ux(0x759),
        ux(0x8ff),
        ux(0x16d),
        ux(0x7a8),
        ux(0x211),
        ux(0xb57),
        ux(0x874),
      ]);
    const fH = {};
    (fH[ux(0x10b)] = ux(0x516)),
      (fH[ux(0x994)] = [
        ux(0x73f),
        ux(0xdb7),
        ux(0x6f9),
        ux(0xdbb),
        ux(0x44d),
        ux(0x8c8),
        ux(0xc07),
      ]);
    const fI = {};
    (fI[ux(0x10b)] = ux(0x711)),
      (fI[ux(0x994)] = [
        ux(0x37b),
        ux(0x7e7),
        ux(0x1b3),
        ux(0xb00),
        ux(0xdad),
        ux(0x9a1),
        ux(0x45f),
        ux(0xc1f),
        ux(0xe07),
        ux(0xc63),
        ux(0x88c),
        ux(0x3fe),
        ux(0x527),
        ux(0x16c),
      ]);
    const fJ = {};
    (fJ[ux(0x10b)] = ux(0x78b)),
      (fJ[ux(0x994)] = [
        ux(0x87b),
        ux(0xaec),
        ux(0x93a),
        ux(0xa28),
        ux(0x79a),
        ux(0xb30),
        ux(0x472),
        ux(0x111),
        ux(0x14d),
        ux(0x386),
        ux(0x506),
        ux(0xe55),
        ux(0xa5c),
        ux(0x58b),
        ux(0x58c),
      ]);
    const fK = {};
    (fK[ux(0x10b)] = ux(0xa10)),
      (fK[ux(0x994)] = [
        ux(0x8c0),
        ux(0xc8c),
        ux(0xe50),
        ux(0x34c),
        ux(0x7f4),
        ux(0x27f),
        ux(0x75d),
        ux(0x662),
        ux(0x42f),
        ux(0xe3e),
        ux(0x959),
        ux(0x7cd),
        ux(0x11c),
      ]);
    const fL = {};
    (fL[ux(0x10b)] = ux(0xc82)),
      (fL[ux(0x994)] = [
        ux(0x977),
        ux(0x95d),
        ux(0xd02),
        ux(0xae7),
        ux(0x5c5),
        ux(0x1b4),
      ]);
    const fM = {};
    (fM[ux(0x10b)] = ux(0xa55)),
      (fM[ux(0x994)] = [
        ux(0xc8d),
        ux(0x148),
        ux(0x14a),
        ux(0x995),
        ux(0x6e8),
        ux(0xdeb),
        ux(0x5a8),
        ux(0xbed),
        ux(0xc75),
      ]);
    const fN = {};
    (fN[ux(0x10b)] = ux(0xa55)),
      (fN[ux(0x994)] = [
        ux(0x650),
        ux(0xafc),
        ux(0x98a),
        ux(0xa0e),
        ux(0x315),
        ux(0x2bf),
        ux(0x6f6),
        ux(0x187),
        ux(0x147),
        ux(0x69a),
        ux(0xdba),
        ux(0x5d9),
        ux(0x6b2),
        ux(0x8e3),
        ux(0x580),
        ux(0xa34),
        ux(0x96b),
      ]);
    const fO = {};
    (fO[ux(0x10b)] = ux(0xcde)), (fO[ux(0x994)] = [ux(0xd85), ux(0x8fc)]);
    const fP = {};
    (fP[ux(0x10b)] = ux(0x9fa)),
      (fP[ux(0x994)] = [ux(0x7bb), ux(0x3aa), ux(0xab4)]);
    const fQ = {};
    (fQ[ux(0x10b)] = ux(0xb0c)),
      (fQ[ux(0x994)] = [ux(0xcf5), ux(0xd3c), ux(0xa73), ux(0xbfa)]);
    const fR = {};
    (fR[ux(0x10b)] = ux(0x4b3)),
      (fR[ux(0x994)] = [
        ux(0x272),
        ux(0x34e),
        ux(0x9de),
        ux(0xb12),
        ux(0x6c3),
        ux(0xa5a),
      ]);
    const fS = {};
    (fS[ux(0x10b)] = ux(0x99e)), (fS[ux(0x994)] = [ux(0x9b5)]);
    const fT = {};
    (fT[ux(0x10b)] = ux(0x821)),
      (fT[ux(0x994)] = [
        ux(0x9d5),
        ux(0x87a),
        ux(0x7a4),
        ux(0x8ee),
        ux(0xbfd),
        ux(0x2ad),
        ux(0x677),
        ux(0xcaf),
      ]);
    const fU = {};
    (fU[ux(0x10b)] = ux(0xcd8)), (fU[ux(0x994)] = [ux(0xd76), ux(0x826)]);
    const fV = {};
    (fV[ux(0x10b)] = ux(0xdc3)),
      (fV[ux(0x994)] = [ux(0x97c), ux(0xadf), ux(0x729), ux(0x597), ux(0x22a)]);
    const fW = {};
    (fW[ux(0x10b)] = ux(0x1a2)),
      (fW[ux(0x994)] = [
        ux(0x455),
        ux(0xe00),
        ux(0x820),
        ux(0x222),
        ux(0x28c),
        ux(0x194),
        ux(0x25a),
        ux(0xb25),
        ux(0xab0),
      ]);
    const fX = {};
    (fX[ux(0x10b)] = ux(0x8bf)),
      (fX[ux(0x994)] = [
        ux(0x11a),
        ux(0x7cf),
        ux(0x283),
        ux(0x502),
        ux(0x507),
        ux(0x510),
        ux(0x963),
        ux(0x3c7),
      ]);
    const fY = {};
    (fY[ux(0x10b)] = ux(0x665)),
      (fY[ux(0x994)] = [
        ux(0xdcb),
        ux(0xd59),
        ux(0x730),
        ux(0x443),
        ux(0x9a4),
        ux(0x561),
        ux(0x9bd),
        ux(0x229),
        ux(0x447),
      ]);
    const fZ = {};
    (fZ[ux(0x10b)] = ux(0x586)),
      (fZ[ux(0x994)] = [
        ux(0xa8c),
        ux(0xa84),
        ux(0xbfc),
        ux(0x561),
        ux(0x806),
        ux(0x9e3),
        ux(0x96f),
        ux(0xd4f),
        ux(0x82f),
        ux(0xa3a),
        ux(0xc8f),
      ]);
    const g0 = {};
    (g0[ux(0x10b)] = ux(0x586)),
      (g0[ux(0x994)] = [ux(0x351), ux(0xc24), ux(0x145), ux(0x3b5), ux(0xdbd)]);
    const g1 = {};
    (g1[ux(0x10b)] = ux(0xc77)), (g1[ux(0x994)] = [ux(0xb14), ux(0x933)]);
    const g2 = {};
    (g2[ux(0x10b)] = ux(0x2c1)), (g2[ux(0x994)] = [ux(0x1f0)]);
    const g3 = {};
    (g3[ux(0x10b)] = ux(0xabe)),
      (g3[ux(0x994)] = [ux(0xcc8), ux(0x149), ux(0x9c6), ux(0x8bb)]);
    const g4 = {};
    (g4[ux(0x10b)] = ux(0xc31)),
      (g4[ux(0x994)] = [ux(0xe08), ux(0xc40), ux(0x837), ux(0x5d7)]);
    const g5 = {};
    (g5[ux(0x10b)] = ux(0xc31)),
      (g5[ux(0x994)] = [
        ux(0xe2e),
        ux(0x472),
        ux(0x73e),
        ux(0x488),
        ux(0xd55),
        ux(0xaba),
        ux(0x1c8),
        ux(0x237),
        ux(0xa68),
        ux(0x29f),
        ux(0xd32),
        ux(0x534),
        ux(0x184),
        ux(0x190),
        ux(0x8aa),
        ux(0x35d),
        ux(0x82a),
        ux(0x53a),
        ux(0x153),
        ux(0x985),
      ]);
    const g6 = {};
    (g6[ux(0x10b)] = ux(0x6ea)),
      (g6[ux(0x994)] = [ux(0x4b9), ux(0x670), ux(0x89b), ux(0x9a6)]);
    const g7 = {};
    (g7[ux(0x10b)] = ux(0x954)),
      (g7[ux(0x994)] = [ux(0x761), ux(0xda5), ux(0x6cb)]);
    const g8 = {};
    (g8[ux(0x10b)] = ux(0x48e)),
      (g8[ux(0x994)] = [
        ux(0xa51),
        ux(0x330),
        ux(0xc47),
        ux(0x3b1),
        ux(0xafe),
        ux(0x61d),
        ux(0x32c),
        ux(0xdff),
        ux(0xda6),
        ux(0xcd2),
        ux(0xd58),
        ux(0xd56),
        ux(0xb5e),
        ux(0x44b),
        ux(0x62c),
      ]);
    const g9 = {};
    (g9[ux(0x10b)] = ux(0xba1)), (g9[ux(0x994)] = [ux(0x268), ux(0x28d)]);
    const ga = {};
    (ga[ux(0x10b)] = ux(0x25c)),
      (ga[ux(0x994)] = [ux(0x5b3), ux(0x42d), ux(0x542)]);
    const gb = {};
    (gb[ux(0x10b)] = ux(0x337)),
      (gb[ux(0x994)] = [ux(0x98f), ux(0x6d2), ux(0xbb3)]);
    const gc = {};
    (gc[ux(0x10b)] = ux(0x631)),
      (gc[ux(0x994)] = [ux(0xb8c), ux(0x356), ux(0x128), ux(0xde6)]);
    const gd = {};
    (gd[ux(0x10b)] = ux(0xb79)),
      (gd[ux(0x994)] = [ux(0x24b), ux(0x9b2), ux(0x98e)]);
    const ge = {};
    (ge[ux(0x10b)] = ux(0xbf5)),
      (ge[ux(0x994)] = [
        ux(0x472),
        ux(0xb28),
        ux(0xb4e),
        ux(0x1bb),
        ux(0xafb),
        ux(0x5b5),
        ux(0xca3),
        ux(0x6ab),
        ux(0xc20),
        ux(0x9b4),
        ux(0x4a5),
        ux(0x5f3),
        ux(0x18d),
        ux(0x53f),
        ux(0xa64),
        ux(0x13f),
        ux(0x571),
        ux(0x2a2),
        ux(0xc70),
        ux(0x558),
        ux(0x20d),
        ux(0x6cd),
        ux(0xd04),
        ux(0x230),
      ]);
    const gf = {};
    (gf[ux(0x10b)] = ux(0x7a2)),
      (gf[ux(0x994)] = [ux(0x639), ux(0x4ca), ux(0xa94), ux(0x64d)]);
    const gg = {};
    (gg[ux(0x10b)] = ux(0x10a)),
      (gg[ux(0x994)] = [
        ux(0x6b1),
        ux(0x168),
        ux(0xa74),
        ux(0x472),
        ux(0x760),
        ux(0x9e9),
        ux(0x297),
        ux(0xad0),
      ]);
    const gh = {};
    (gh[ux(0x10b)] = ux(0x4a7)),
      (gh[ux(0x994)] = [
        ux(0xc37),
        ux(0x456),
        ux(0x3b1),
        ux(0xb09),
        ux(0x1a3),
        ux(0x7f2),
        ux(0x8c7),
        ux(0x726),
        ux(0x632),
        ux(0x207),
        ux(0xbdc),
        ux(0x986),
        ux(0x503),
        ux(0xda2),
        ux(0xc39),
        ux(0x429),
        ux(0x469),
      ]);
    const gi = {};
    (gi[ux(0x10b)] = ux(0xb1a)),
      (gi[ux(0x994)] = [
        ux(0xcd1),
        ux(0x2a0),
        ux(0xb48),
        ux(0x514),
        ux(0x12e),
        ux(0x6d7),
        ux(0xdb1),
        ux(0x1a8),
        ux(0x49b),
        ux(0x2b3),
        ux(0x1bf),
      ]);
    const gj = {};
    (gj[ux(0x10b)] = ux(0x635)),
      (gj[ux(0x994)] = [
        ux(0x359),
        ux(0x2ee),
        ux(0x3cc),
        ux(0x105),
        ux(0xb54),
        ux(0xd3f),
        ux(0x4c8),
        ux(0x1b9),
        ux(0xe74),
        ux(0x33f),
      ]);
    const gk = {};
    (gk[ux(0x10b)] = ux(0x635)),
      (gk[ux(0x994)] = [
        ux(0xaf6),
        ux(0x6a3),
        ux(0xb53),
        ux(0xcdc),
        ux(0xa71),
        ux(0x2ab),
        ux(0x86d),
        ux(0xa16),
        ux(0xaab),
        ux(0x3c1),
      ]);
    const gl = {};
    (gl[ux(0x10b)] = ux(0xd20)),
      (gl[ux(0x994)] = [
        ux(0x83a),
        ux(0x6e3),
        ux(0x808),
        ux(0xdcc),
        ux(0x931),
        ux(0x9f6),
        ux(0x855),
        ux(0xcb9),
        ux(0x57a),
        ux(0x495),
      ]);
    const gm = {};
    (gm[ux(0x10b)] = ux(0xd20)),
      (gm[ux(0x994)] = [
        ux(0x351),
        ux(0x109),
        ux(0xe12),
        ux(0x747),
        ux(0xdbf),
        ux(0x52b),
        ux(0x15b),
        ux(0x7b6),
        ux(0x450),
        ux(0xdfb),
        ux(0x6b8),
      ]);
    const gn = {};
    (gn[ux(0x10b)] = ux(0x277)),
      (gn[ux(0x994)] = [ux(0xb8e), ux(0x7bf), ux(0xba0)]);
    const go = {};
    (go[ux(0x10b)] = ux(0x277)),
      (go[ux(0x994)] = [
        ux(0xe71),
        ux(0x1c7),
        ux(0x63d),
        ux(0x953),
        ux(0xcb8),
        ux(0xe2d),
        ux(0xaf1),
        ux(0xe78),
      ]);
    const gp = {};
    (gp[ux(0x10b)] = ux(0x25f)),
      (gp[ux(0x994)] = [ux(0x498), ux(0x139), ux(0xc4e)]);
    const gq = {};
    (gq[ux(0x10b)] = ux(0x25f)),
      (gq[ux(0x994)] = [
        ux(0x59b),
        ux(0xc75),
        ux(0x460),
        ux(0x5c3),
        ux(0x311),
        ux(0x3e5),
      ]);
    const gr = {};
    (gr[ux(0x10b)] = ux(0x25f)),
      (gr[ux(0x994)] = [ux(0x7f6), ux(0x2c9), ux(0x946), ux(0x861)]);
    const gs = {};
    (gs[ux(0x10b)] = ux(0x25f)),
      (gs[ux(0x994)] = [
        ux(0xc83),
        ux(0x9fd),
        ux(0x9e2),
        ux(0x313),
        ux(0x394),
        ux(0x334),
        ux(0xd0b),
        ux(0x375),
        ux(0x657),
        ux(0xc13),
        ux(0x816),
      ]);
    const gt = {};
    (gt[ux(0x10b)] = ux(0x144)),
      (gt[ux(0x994)] = [ux(0xb83), ux(0x932), ux(0x4fc)]);
    const gu = {};
    (gu[ux(0x10b)] = ux(0xa04)),
      (gu[ux(0x994)] = [
        ux(0xbbd),
        ux(0x97f),
        ux(0xc75),
        ux(0x3e7),
        ux(0x2eb),
        ux(0x407),
        ux(0x6c9),
        ux(0xbb6),
        ux(0xb90),
        ux(0x6a2),
        ux(0x789),
        ux(0x80a),
        ux(0x3b1),
        ux(0x836),
        ux(0xc08),
        ux(0x357),
        ux(0xc7c),
        ux(0x180),
        ux(0xd93),
        ux(0x63a),
        ux(0x787),
        ux(0x7ca),
        ux(0xb9f),
        ux(0xe1a),
        ux(0x72d),
        ux(0x158),
        ux(0xda8),
        ux(0xc91),
        ux(0xcab),
        ux(0x27c),
        ux(0xc18),
        ux(0x7f8),
        ux(0xc2d),
        ux(0x326),
      ]);
    const gv = {};
    (gv[ux(0x10b)] = ux(0x39a)), (gv[ux(0x994)] = [ux(0x69c)]);
    const gw = {};
    (gw[ux(0x10b)] = ux(0xc36)),
      (gw[ux(0x994)] = [
        ux(0x90a),
        ux(0x910),
        ux(0xc14),
        ux(0x135),
        ux(0x733),
        ux(0x85c),
        ux(0x83d),
        ux(0x3b1),
        ux(0x9d4),
        ux(0xaa9),
        ux(0x99c),
        ux(0x13b),
        ux(0xbf4),
        ux(0x57d),
        ux(0x6f0),
        ux(0x928),
        ux(0x90f),
        ux(0x8e9),
        ux(0xdef),
        ux(0x20c),
        ux(0xb27),
        ux(0x700),
        ux(0xce8),
        ux(0x81b),
        ux(0xacb),
        ux(0x741),
        ux(0x841),
        ux(0x642),
        ux(0x72e),
        ux(0xcc0),
        ux(0x7f8),
        ux(0x969),
        ux(0xb03),
        ux(0x706),
        ux(0xe4a),
      ]);
    const gx = {};
    (gx[ux(0x10b)] = ux(0xd6c)),
      (gx[ux(0x994)] = [
        ux(0x3c3),
        ux(0xcc1),
        ux(0x493),
        ux(0x94c),
        ux(0x9ff),
        ux(0x132),
        ux(0x3b1),
        ux(0xd24),
        ux(0x254),
        ux(0x1ef),
        ux(0xc12),
        ux(0x94e),
        ux(0x8ad),
        ux(0xb5c),
        ux(0x27a),
        ux(0x983),
        ux(0x960),
        ux(0x244),
        ux(0xcf8),
        ux(0x9e7),
        ux(0x4c6),
        ux(0x90f),
        ux(0x9c5),
        ux(0xd36),
        ux(0xb02),
        ux(0x84e),
        ux(0x9ad),
        ux(0xdf2),
        ux(0x3d1),
        ux(0x1a7),
        ux(0x6c4),
        ux(0x927),
        ux(0xad1),
        ux(0x6ef),
        ux(0x7f8),
        ux(0x15a),
        ux(0xdd2),
        ux(0x7e0),
        ux(0x1d4),
      ]);
    const gy = {};
    (gy[ux(0x10b)] = ux(0x355)),
      (gy[ux(0x994)] = [
        ux(0xae8),
        ux(0x2b5),
        ux(0x7f8),
        ux(0xd87),
        ux(0x935),
        ux(0xb58),
        ux(0x18c),
        ux(0x68d),
        ux(0x3e4),
        ux(0x3b1),
        ux(0x87e),
        ux(0xb63),
        ux(0x5da),
        ux(0x84f),
      ]);
    const gz = {};
    (gz[ux(0x10b)] = ux(0x414)),
      (gz[ux(0x994)] = [ux(0x567), ux(0x389), ux(0x984), ux(0xe37), ux(0xd65)]);
    const gA = {};
    (gA[ux(0x10b)] = ux(0x8ba)),
      (gA[ux(0x994)] = [ux(0x71d), ux(0xb98), ux(0x1af), ux(0xb5b)]);
    const gB = {};
    (gB[ux(0x10b)] = ux(0x8ba)),
      (gB[ux(0x994)] = [ux(0xc75), ux(0xc54), ux(0x27e)]);
    const gC = {};
    (gC[ux(0x10b)] = ux(0x779)),
      (gC[ux(0x994)] = [ux(0x30c), ux(0x575), ux(0x3d8), ux(0xa00), ux(0xc86)]);
    const gD = {};
    (gD[ux(0x10b)] = ux(0x779)),
      (gD[ux(0x994)] = [ux(0xc3e), ux(0xa2e), ux(0x5fb), ux(0x7b3)]);
    const gE = {};
    (gE[ux(0x10b)] = ux(0x779)), (gE[ux(0x994)] = [ux(0x672), ux(0x47f)]);
    const gF = {};
    (gF[ux(0x10b)] = ux(0x952)),
      (gF[ux(0x994)] = [
        ux(0xd0c),
        ux(0xcce),
        ux(0x57e),
        ux(0x5a1),
        ux(0x24f),
        ux(0x266),
        ux(0x4c9),
        ux(0x364),
        ux(0x6be),
      ]);
    const gG = {};
    (gG[ux(0x10b)] = ux(0xb23)),
      (gG[ux(0x994)] = [
        ux(0xbfb),
        ux(0xc57),
        ux(0x30a),
        ux(0x468),
        ux(0x1fb),
        ux(0xb93),
        ux(0x1e0),
      ]);
    const gH = {};
    (gH[ux(0x10b)] = ux(0x36b)),
      (gH[ux(0x994)] = [
        ux(0x77b),
        ux(0xbb5),
        ux(0x328),
        ux(0x3fa),
        ux(0xbbb),
        ux(0x2f0),
        ux(0xd42),
        ux(0x687),
        ux(0x2d2),
        ux(0x9b1),
        ux(0x287),
        ux(0x5f5),
      ]);
    const gI = {};
    (gI[ux(0x10b)] = ux(0xd74)),
      (gI[ux(0x994)] = [
        ux(0x45d),
        ux(0x5ba),
        ux(0x625),
        ux(0x66a),
        ux(0xd8d),
        ux(0x934),
        ux(0x75e),
        ux(0xc84),
        ux(0x481),
        ux(0x544),
      ]);
    const gJ = {};
    (gJ[ux(0x10b)] = ux(0xd74)),
      (gJ[ux(0x994)] = [
        ux(0xbb9),
        ux(0xa7e),
        ux(0x62e),
        ux(0xda0),
        ux(0x395),
        ux(0x7c7),
      ]);
    const gK = {};
    (gK[ux(0x10b)] = ux(0x7da)),
      (gK[ux(0x994)] = [ux(0x453), ux(0x15f), ux(0x9ab)]);
    const gL = {};
    (gL[ux(0x10b)] = ux(0x7da)),
      (gL[ux(0x994)] = [ux(0xc75), ux(0x588), ux(0xe6f), ux(0x51c), ux(0xa9a)]);
    const gM = {};
    (gM[ux(0x10b)] = ux(0x9ac)),
      (gM[ux(0x994)] = [
        ux(0xb7e),
        ux(0x82e),
        ux(0x59a),
        ux(0x825),
        ux(0xa56),
        ux(0xb0e),
        ux(0x7f8),
        ux(0xb29),
        ux(0x3dc),
        ux(0x992),
        ux(0x780),
        ux(0x30b),
        ux(0x3b1),
        ux(0x412),
        ux(0x871),
        ux(0x93c),
        ux(0x805),
        ux(0x8f0),
        ux(0x269),
      ]);
    const gN = {};
    (gN[ux(0x10b)] = ux(0x210)),
      (gN[ux(0x994)] = [
        ux(0xad2),
        ux(0x79f),
        ux(0x876),
        ux(0x67e),
        ux(0x387),
        ux(0x64f),
        ux(0x6c8),
        ux(0x263),
      ]);
    const gO = {};
    (gO[ux(0x10b)] = ux(0x210)), (gO[ux(0x994)] = [ux(0x7d3), ux(0x463)]);
    const gP = {};
    (gP[ux(0x10b)] = ux(0x6ac)), (gP[ux(0x994)] = [ux(0xc6b), ux(0x6c1)]);
    const gQ = {};
    (gQ[ux(0x10b)] = ux(0x6ac)),
      (gQ[ux(0x994)] = [
        ux(0x4bc),
        ux(0xe17),
        ux(0x24c),
        ux(0x352),
        ux(0xbdd),
        ux(0x768),
        ux(0x73c),
        ux(0x46b),
        ux(0x385),
      ]);
    const gR = {};
    (gR[ux(0x10b)] = ux(0x50e)), (gR[ux(0x994)] = [ux(0x78a), ux(0x31c)]);
    const gS = {};
    (gS[ux(0x10b)] = ux(0x50e)),
      (gS[ux(0x994)] = [
        ux(0x2c8),
        ux(0x339),
        ux(0xc38),
        ux(0x574),
        ux(0x907),
        ux(0x40e),
        ux(0xc56),
        ux(0xc75),
        ux(0x240),
      ]);
    const gT = {};
    (gT[ux(0x10b)] = ux(0x606)), (gT[ux(0x994)] = [ux(0x3ba)]);
    const gU = {};
    (gU[ux(0x10b)] = ux(0x606)),
      (gU[ux(0x994)] = [
        ux(0x1e1),
        ux(0xd99),
        ux(0x413),
        ux(0x1fd),
        ux(0xc75),
        ux(0x62b),
        ux(0x485),
      ]);
    const gV = {};
    (gV[ux(0x10b)] = ux(0x606)),
      (gV[ux(0x994)] = [ux(0xc2b), ux(0x1f6), ux(0xd4c)]);
    const gW = {};
    (gW[ux(0x10b)] = ux(0x4db)),
      (gW[ux(0x994)] = [ux(0x240), ux(0xd2e), ux(0x2c0), ux(0xaa6)]);
    const gX = {};
    (gX[ux(0x10b)] = ux(0x4db)), (gX[ux(0x994)] = [ux(0x8ab)]);
    const gY = {};
    (gY[ux(0x10b)] = ux(0x4db)),
      (gY[ux(0x994)] = [ux(0x8fe), ux(0xb96), ux(0x17a), ux(0xa3b), ux(0xceb)]);
    const gZ = {};
    (gZ[ux(0x10b)] = ux(0x4a9)),
      (gZ[ux(0x994)] = [ux(0x182), ux(0x73b), ux(0xc2a)]);
    const h0 = {};
    (h0[ux(0x10b)] = ux(0x43b)), (h0[ux(0x994)] = [ux(0xd4a), ux(0xa83)]);
    const h1 = {};
    (h1[ux(0x10b)] = ux(0x964)), (h1[ux(0x994)] = [ux(0x7e3), ux(0x34f)]);
    const h2 = {};
    (h2[ux(0x10b)] = ux(0xc81)), (h2[ux(0x994)] = [ux(0xe06)]);
    var h3 = [
      fc(ux(0x7ea)),
      fc(ux(0x5fa)),
      fc(ux(0x875)),
      fc(ux(0x224)),
      fc(ux(0x7c9)),
      fc(ux(0xb4d)),
      fc(ux(0x1ff)),
      fc(ux(0x4ce)),
      fc(ux(0x393)),
      fc(ux(0x569)),
      fc(ux(0xa9c)),
      fc(ux(0x753)),
      fd,
      fe,
      ff,
      fg,
      fh,
      fi,
      fj,
      fk,
      fl,
      fm,
      fn,
      fo,
      fp,
      fq,
      fr,
      fs,
      ft,
      fu,
      fv,
      fw,
      fx,
      fy,
      fz,
      fA,
      fB,
      fC,
      fD,
      fE,
      fF,
      fG,
      fH,
      fI,
      fJ,
      fK,
      fL,
      fM,
      fN,
      fO,
      fP,
      fQ,
      fR,
      fS,
      fT,
      fU,
      fV,
      fW,
      fX,
      fY,
      fZ,
      g0,
      g1,
      g2,
      g3,
      g4,
      g5,
      g6,
      g7,
      g8,
      g9,
      ga,
      gb,
      gc,
      gd,
      ge,
      gf,
      gg,
      gh,
      gi,
      gj,
      gk,
      gl,
      gm,
      gn,
      go,
      gp,
      gq,
      gr,
      gs,
      gt,
      gu,
      gv,
      gw,
      gx,
      gy,
      gz,
      gA,
      gB,
      gC,
      gD,
      gE,
      gF,
      gG,
      gH,
      gI,
      gJ,
      gK,
      gL,
      gM,
      gN,
      gO,
      gP,
      gQ,
      gR,
      gS,
      gT,
      gU,
      gV,
      gW,
      gX,
      gY,
      gZ,
      h0,
      h1,
      h2,
    ];
    console[ux(0x8b7)](ux(0xcb1));
    var h4 = Date[ux(0xa4a)]() < 0x18e9c4b6482,
      h5 = Math[ux(0xa6f)](Math[ux(0xe0d)]() * 0xa);
    function h6(rs) {
      const uU = ux,
        rt = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let ru = "";
      for (const rv of rs) {
        rv === "\x20"
          ? (ru += "\x20")
          : (ru += rt[(h5 + rv[uU(0x39e)](0x0)) % rt[uU(0xc2f)]]);
      }
      return ru;
    }
    h4 &&
      document[ux(0x546)](ux(0x858))[ux(0x3b6)](
        ux(0x8ae),
        h6(ux(0xb06)) + ux(0x587)
      );
    function h7(rs, rt, ru) {
      const uV = ux,
        rv = rt - rs;
      if (Math[uV(0x372)](rv) < 0.01) return rt;
      return rs + rv * (0x1 - Math[uV(0xb61)](-ru * pS));
    }
    var h8 = [],
      h9 = 0x0;
    function ha(rs, rt = 0x1388) {
      const uW = ux,
        ru = nR(uW(0x97d) + jx(rs) + uW(0x979));
      kI[uW(0xcee)](ru);
      let rv = 0x0;
      rw();
      function rw() {
        const uX = uW;
        (ru[uX(0x5c6)][uX(0x14b)] = uX(0x79d) + h9 + uX(0x4fe)),
          (ru[uX(0x5c6)][uX(0x482)] = rv);
      }
      (this[uW(0xe6a)] = ![]),
        (this[uW(0x72c)] = () => {
          const uY = uW;
          rt -= pR;
          const rx = rt > 0x0 ? 0x1 : 0x0;
          (rv = h7(rv, rx, 0.3)),
            rw(),
            rt < 0x0 &&
              rv <= 0x0 &&
              (ru[uY(0xae0)](), (this[uY(0xe6a)] = !![])),
            (h9 += rv * (ru[uY(0xb2d)] + 0x5));
        }),
        h8[uW(0x9db)](this);
    }
    function hb(rs) {
      new ha(rs, 0x1388);
    }
    function hc() {
      const uZ = ux;
      h9 = 0x0;
      for (let rs = h8[uZ(0xc2f)] - 0x1; rs >= 0x0; rs--) {
        const rt = h8[rs];
        rt[uZ(0x72c)](), rt[uZ(0xe6a)] && h8[uZ(0x8ea)](rs, 0x1);
      }
    }
    var hd = !![],
      he = document[ux(0x546)](ux(0xd5c));
          (he[b(0x5c6)][b(0x50f)] = b(0x5a4)), (hd = ![])
    var hf = document[ux(0x546)](ux(0x2ef)),
      hg = Date[ux(0xa4a)]();
    function hh() {
      const v2 = ux;
      console[v2(0x8b7)](v2(0xce5)),
        (hg = Date[v2(0xa4a)]()),
        (hf[v2(0x5c6)][v2(0x50f)] = "");
      try {
        aiptag[v2(0xb33)][v2(0x50f)][v2(0x9db)](function () {
          const v3 = v2;
          aipDisplayTag[v3(0x50f)](v3(0x898));
        }),
          aiptag[v2(0xb33)][v2(0x50f)][v2(0x9db)](function () {
            const v4 = v2;
            aipDisplayTag[v4(0x50f)](v4(0x5ec));
          });
      } catch (rs) {
        console[v2(0x8b7)](v2(0xa52));
      }
    }
    setInterval(function () {
      const v5 = ux;
      hf[v5(0x5c6)][v5(0x50f)] === "" &&
        Date[v5(0xa4a)]() - hg > 0x7530 &&
        hh();
    }, 0x2710);
    var hi = null,
      hj = 0x0;
    function hk() {
      const v6 = ux;
      console[v6(0x8b7)](v6(0x19b)),
        typeof aiptag[v6(0x9ee)] !== v6(0x982)
          ? ((hi = 0x45),
            (hj = Date[v6(0xa4a)]()),
            aiptag[v6(0xb33)][v6(0xd62)][v6(0x9db)](function () {
              const v7 = v6;
              aiptag[v7(0x9ee)][v7(0x46e)]();
            }))
          : window[v6(0x76d)](v6(0x25b));
    }
    window[ux(0x76d)] = function (rs) {
      const v8 = ux;
      console[v8(0x8b7)](v8(0x376) + rs);
      if (rs === v8(0x868) || rs[v8(0x78f)](v8(0x828)) > -0x1) {
        if (hi !== null && Date[v8(0xa4a)]() - hj > 0xbb8) {
          console[v8(0x8b7)](v8(0xbcd));
          if (hX) {
            const rt = {};
            (rt[v8(0x10b)] = v8(0xe2f)),
              (rt[v8(0xbd8)] = ![]),
              kJ(
                v8(0xb99),
                (ru) => {
                  const v9 = v8;
                  ru &&
                    hX &&
                    (im(new Uint8Array([cH[v9(0xe59)]])), hJ(v9(0x6a4)));
                },
                rt
              );
          }
        } else hJ(v8(0x709));
      } else alert(v8(0x1b8) + rs);
      hl[v8(0x292)][v8(0xae0)](v8(0x50b)), (hi = null);
    };
    var hl = document[ux(0x546)](ux(0x1b2));
    (hl[ux(0x8cd)] = function () {
      const va = ux;
      hl[va(0x292)][va(0x1ee)](va(0x50b)), hk();
    }),
      (hl[ux(0x7e1)] = function () {
        const vb = ux;
        return nR(
          vb(0x20f) + hO[vb(0xde5)] + vb(0xae2) + hO[vb(0x65e)] + vb(0xdc9)
        );
      }),
      (hl[ux(0x471)] = !![]);
    var hm = [
        ux(0x67d),
        ux(0x5bd),
        ux(0xa01),
        ux(0xbcf),
        ux(0xc61),
        ux(0xbbe),
        ux(0x623),
        ux(0x8b1),
        ux(0x52d),
        ux(0xe6c),
        ux(0x3a7),
        ux(0xde4),
      ],
      hn = document[ux(0x546)](ux(0xaf5)),
      ho =
        Date[ux(0xa4a)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[ux(0xa6f)](Math[ux(0xe0d)]() * hm[ux(0xc2f)]);
    hq();
    function hp(rs) {
      const vc = ux;
      (ho += rs),
        ho < 0x0 ? (ho = hm[vc(0xc2f)] - 0x1) : (ho %= hm[vc(0xc2f)]),
        hq();
    }
    function hq() {
      const vd = ux,
        rs = hm[ho];
      (hn[vd(0x5c6)][vd(0x76c)] = ''),
        (hn[vd(0x8cd)] = function () {
          const ve = vd;
          window[ve(0x258)](rs, ve(0x501)), hp(0x1);
        });
    }
    (document[ux(0x546)](ux(0x895))[ux(0x8cd)] = function () {
      hp(-0x1);
    }),
      (document[ux(0x546)](ux(0x4f0))[ux(0x8cd)] = function () {
        hp(0x1);
      });
    var hr = document[ux(0x546)](ux(0xe1c));
    hr[ux(0x7e1)] = function () {
      const vf = ux;
      return nR(
        vf(0x20f) + hO[vf(0xde5)] + vf(0x990) + hO[vf(0x7cc)] + vf(0x293)
      );
    };
    var hs = document[ux(0x546)](ux(0x8f4)),
      ht = document[ux(0x546)](ux(0x562)),
      hu = ![];
    function hv() {
      const vg = ux;
      let rs = "";
      for (let ru = 0x0; ru < h3[vg(0xc2f)]; ru++) {
        const { title: rv, content: rw } = h3[ru];
        (rs += vg(0x8de) + rv + vg(0x366)),
          rw[vg(0xa40)]((rx, ry) => {
            const vh = vg;
            let rz = "-\x20";
            if (rx[0x0] === "*") {
              const rA = rx[ry + 0x1];
              if (rA && rA[0x0] === "*") rz = vh(0x2a4);
              else rz = vh(0x4fa);
              rx = rx[vh(0x320)](0x1);
            }
            (rx = rz + rx), (rs += vh(0x24a) + rx + vh(0x59c));
          }),
          (rs += vg(0x7df));
      }
      const rt = hC[vg(0x9fc)];
      (hu = rt !== void 0x0 && parseInt(rt) < fb), (hs[vg(0x90b)] = rs);
    }
    CanvasRenderingContext2D[ux(0x338)][ux(0xa60)] = function (rs) {
      const vi = ux;
      this[vi(0x18a)](rs, rs);
    };
    var hw = ![];
    hw &&
      (OffscreenCanvasRenderingContext2D[ux(0x338)][ux(0xa60)] = function (rs) {
        const vj = ux;
        this[vj(0x18a)](rs, rs);
      });
    function hx(rs, rt, ru) {
      const rv = 0x1 - ru;
      return [
        rs[0x0] * ru + rt[0x0] * rv,
        rs[0x1] * ru + rt[0x1] * rv,
        rs[0x2] * ru + rt[0x2] * rv,
      ];
    }
    var hy = {};
    function hz(rs) {
      const vk = ux;
      return (
        !hy[rs] &&
          (hy[rs] = [
            parseInt(rs[vk(0x320)](0x1, 0x3), 0x10),
            parseInt(rs[vk(0x320)](0x3, 0x5), 0x10),
            parseInt(rs[vk(0x320)](0x5, 0x7), 0x10),
          ]),
        hy[rs]
      );
    }
    var hA = document[ux(0x916)](ux(0xd7b)),
      hB = document[ux(0xa26)](ux(0x6e9));
    for (let rs = 0x0; rs < hB[ux(0xc2f)]; rs++) {
      const rt = hB[rs],
        ru = f8[rt[ux(0x7a1)](ux(0x474))];
      ru && rt[ux(0x1c4)](nR(ru), rt[ux(0x476)][0x0]);
    }
    var hC;
    try {
      hC = localStorage;
    } catch (rv) {
      console[ux(0x683)](ux(0xca9), rv), (hC = {});
    }
    var hD = document[ux(0x546)](ux(0xe16)),
      hE = document[ux(0x546)](ux(0xd7f)),
      hF = document[ux(0x546)](ux(0xe6b));
    (hD[ux(0x7e1)] = function () {
      const vl = ux;
      return nR(
        vl(0x84d) + hO[vl(0x4c5)] + vl(0x47c) + cM + vl(0xc3f) + cL + vl(0x198)
      );
    }),
      (hE[ux(0xd27)] = cL),
      (hE[ux(0x872)] = function () {
        const vm = ux;
        !cN[vm(0xe5b)](this[vm(0x1d6)]) &&
          (this[vm(0x1d6)] = this[vm(0x1d6)][vm(0xbb7)](cO, ""));
      });
    var hG,
      hH = document[ux(0x546)](ux(0x7fc));
    function hI(rw) {
      const vn = ux;
      rw ? k9(hH, rw + vn(0x129)) : k9(hH, vn(0x873)),
        (hD[vn(0x5c6)][vn(0x50f)] =
          rw && rw[vn(0x78f)]("\x20") === -0x1 ? vn(0x5a4) : "");
    }
    hF[ux(0x8cd)] = nw(function () {
      const vo = ux;
      if (!hX || jz) return;
      const rw = hE[vo(0x1d6)],
        rx = rw[vo(0xc2f)];
      if (rx < cM) hb(vo(0x838));
      else {
        if (rx > cL) hb(vo(0x37f));
        else {
          if (!cN[vo(0xe5b)](rw)) hb(vo(0x1e2));
          else {
            hb(vo(0x3c6), hO[vo(0x7cc)]), (hG = rw);
            const ry = new Uint8Array([
              cH[vo(0x5fe)],
              ...new TextEncoder()[vo(0x3bc)](rw),
            ]);
            im(ry);
          }
        }
      }
    });
    function hJ(rw, rx = nj[ux(0x1be)]) {
      nm(-0x1, null, rw, rx);
    }
    hv();
    var hK = f3(cQ),
      hL = f3(cR),
      hM = f3(d8);
    const hN = {};
    (hN[ux(0x4c5)] = ux(0x7d9)),
      (hN[ux(0x7cc)] = ux(0x894)),
      (hN[ux(0x298)] = ux(0xe02)),
      (hN[ux(0x9ce)] = ux(0x12f)),
      (hN[ux(0x2e6)] = ux(0x583)),
      (hN[ux(0x65e)] = ux(0xdfd)),
      (hN[ux(0xde5)] = ux(0x8a4)),
      (hN[ux(0x766)] = ux(0x957)),
      (hN[ux(0x402)] = ux(0x810));
    var hO = hN,
      hP = Object[ux(0xbe9)](hO),
      hQ = [];
    for (let rw = 0x0; rw < hP[ux(0xc2f)]; rw++) {
      const rx = hP[rw],
        ry = rx[ux(0x320)](0x4, rx[ux(0x78f)](")"))
          [ux(0x2a6)](",\x20")
          [ux(0xe56)]((rz) => parseInt(rz) * 0.8);
      hQ[ux(0x9db)](q2(ry));
    }
    var hR = ux(0x405),
      hS = ux(0x512);
    (document[ux(0x546)](ux(0x762))[ux(0x8cd)] = function () {
      const vp = ux,
        rz = nR(vp(0x4eb));
      km[vp(0xcee)](rz),
        (rz[vp(0x546)](vp(0xe44))[vp(0x8cd)] = function () {
          const vq = vp;
          window[vq(0x258)](hS, vq(0x501));
        }),
        (rz[vp(0x546)](vp(0x1f1))[vp(0x8cd)] = function () {
          const vr = vp;
          window[vr(0x258)](hR, vr(0x501));
        }),
        (rz[vp(0x546)](vp(0xc0b))[vp(0x8cd)] = function () {
          const vs = vp;
          rz[vs(0xae0)]();
        });
    }),
      hT(ux(0x2c7), ux(0x3db)),
      hT(ux(0x6a7), ux(0xa4c)),
      hT(ux(0xb80), ux(0xc3d)),
      hT(ux(0x38b), ux(0xc46)),
      hT(ux(0x521), ux(0x3a4)),
      hT(ux(0x159), ux(0x925));
    function hT(rz, rA) {
      const vt = ux;
      document[vt(0x546)](rz)[vt(0x8cd)] = function () {
        const vu = vt;
        window[vu(0x258)](rA, vu(0x501));
      };
    }
    setInterval(function () {
      const vv = ux;
      hX && im(new Uint8Array([cH[vv(0x4af)]]));
    }, 0x3e8);
    function hU() {
      const vw = ux;
      (pO = [pV]),
        (j7[vw(0xba9)] = !![]),
        (j7 = {}),
        (jH = 0x0),
        (jI[vw(0xc2f)] = 0x0),
        (ix = []),
        (iH[vw(0xc2f)] = 0x0),
        (iD[vw(0x90b)] = ""),
        (iw = {}),
        (iI = ![]),
        (iz = null),
        (iy = null),
        (pE = 0x0),
        (hX = ![]),
        (mF = 0x0),
        (mE = 0x0),
        (mp = ![]),
        (ml[vw(0x5c6)][vw(0x50f)] = vw(0x5a4)),
        (q6[vw(0x5c6)][vw(0x50f)] = q5[vw(0x5c6)][vw(0x50f)] = vw(0x5a4)),
        (pC = 0x0),
        (pD = 0x0);
    }
    var hV;
    function hW(rz) {
      const vx = ux;
      (ji[vx(0x5c6)][vx(0x50f)] = vx(0x5a4)),
        (pj[vx(0x5c6)][vx(0x50f)] = vx(0x5a4)),
        i0(),
        kB[vx(0x292)][vx(0x1ee)](vx(0x695)),
        kC[vx(0x292)][vx(0xae0)](vx(0x695)),
        hU(),
        console[vx(0x8b7)](vx(0xa8f) + rz + vx(0xbf2)),
        iv(),
        (hV = new WebSocket(rz)),
        (hV[vx(0x4e9)] = vx(0x4dd)),
        (hV[vx(0xcac)] = hY),
        (hV[vx(0x8df)] = k2),
        (hV[vx(0xd6a)] = kh);
    }
    crypto[ux(0xd01)] =
      crypto[ux(0xd01)] ||
      function rz() {
        const vy = ux;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vy(0xbb7)
        ](/[018]/g, (rA) =>
          (rA ^
            (crypto[vy(0x9c4)](new Uint8Array(0x1))[0x0] &
              (0xf >> (rA / 0x4))))[vy(0x3de)](0x10)
        );
      };
    var hX = ![];
    function hY() {
      const vz = ux;
      console[vz(0x8b7)](vz(0x900)), ig();
      hack.chatFunc = hJ;
      hack.numFunc = iK;
      hack.preload();
    }
    var hZ = document[ux(0x546)](ux(0x9a9));
    function i0() {
      const vA = ux;
      hZ[vA(0x5c6)][vA(0x50f)] = vA(0x5a4);
    }
    var i1 = document[ux(0x546)](ux(0xb3b)),
      i2 = document[ux(0x546)](ux(0x3cf)),
      i3 = document[ux(0x546)](ux(0x948)),
      i4 = document[ux(0x546)](ux(0x51d));
    i4[ux(0x8cd)] = function () {
      const vB = ux;
      !i7 &&
        (window[vB(0xae9)][vB(0xa50)] =
          vB(0xa30) +
          encodeURIComponent(!window[vB(0xb20)] ? vB(0x918) : vB(0x5f0)) +
          vB(0x74e) +
          encodeURIComponent(btoa(i6)));
    };
    var i5 = document[ux(0x546)](ux(0x25d));
    (i5[ux(0x8cd)] = function () {
      const vC = ux;
      i6 == hC[vC(0x57b)] && delete hC[vC(0x57b)];
      delete hC[vC(0x590)];
      if (hV)
        try {
          hV[vC(0x5f6)]();
        } catch (rA) {}
    }),
      i0();
    var i6, i7;
    function i8(rA) {
      const vE = ux;
      try {
        let rC = function (rD) {
          const vD = b;
          return rD[vD(0xbb7)](/([.*+?\^$(){}|\[\]\/\\])/g, vD(0x119));
        };
        var rB = document[vE(0xe1e)][vE(0xe03)](
          RegExp(vE(0x7b8) + rC(rA) + vE(0x2fb))
        );
        return rB ? rB[0x1] : null;
      } catch (rD) {
        return "";
      }
    }
    var i9 = !window[ux(0xb20)];
    function ia(rA) {
      const vF = ux;
      try {
        document[vF(0xe1e)] = rA + vF(0xad4) + (i9 ? vF(0x50c) : "");
      } catch (rB) {}
    }
    var ib = 0x0,
      ic;
    function ie() {
      const vG = ux;
      (ib = 0x0), (hX = ![]);
      !eU(hC[vG(0x57b)]) && (hC[vG(0x57b)] = crypto[vG(0xd01)]());
      (i6 = hC[vG(0x57b)]), (i7 = hC[vG(0x590)]);
      !i7 &&
        ((i7 = i8(vG(0x590))),
        i7 && (i7 = decodeURIComponent(i7)),
        ia(vG(0x590)));
      if (i7)
        try {
          const rA = i7;
          i7 = JSON[vG(0x96e)](decodeURIComponent(escape(atob(rA))));
          if (eU(i7[vG(0x903)]))
            (i6 = i7[vG(0x903)]),
              i2[vG(0x3b6)](vG(0x8ae), i7[vG(0x358)]),
              i7[vG(0x2f7)] &&
                (i3[vG(0x5c6)][vG(0x76c)] = vG(0x233) + i7[vG(0x2f7)] + ")"),
              (hC[vG(0x590)] = rA);
          else throw new Error(vG(0x28f));
        } catch (rB) {
          (i7 = null), delete hC[vG(0x590)], console[vG(0x1be)](vG(0x64a) + rB);
        }
      ic = hC[vG(0x69f)] || "";
    }
    function ig() {
      ie(), ij();
    }
    function ih() {
      const vH = ux,
        rA = [
          vH(0x300),
          vH(0xb7c),
          vH(0x4cb),
          vH(0xa12),
          vH(0x2cc),
          vH(0xdc8),
          vH(0xb08),
          vH(0x196),
          vH(0xaf8),
          vH(0xdea),
          vH(0x91e),
          vH(0x236),
          vH(0x8b3),
          vH(0x93b),
          vH(0xbb2),
          vH(0x3b0),
          vH(0x3f9),
          vH(0x60c),
          vH(0xc7f),
          vH(0xe34),
          vH(0x20e),
          vH(0x416),
          vH(0x43f),
          vH(0x7f7),
          vH(0xb16),
          vH(0x940),
          vH(0x532),
          vH(0xb8b),
          vH(0x11e),
          vH(0xd97),
          vH(0xa6c),
          vH(0xa3c),
          vH(0x61a),
          vH(0x473),
          vH(0x6f1),
          vH(0x5d1),
          vH(0x32d),
          vH(0x2ac),
          vH(0xe3c),
          vH(0x786),
          vH(0x7dc),
          vH(0x505),
          vH(0xe1b),
          vH(0x835),
          vH(0xe39),
          vH(0x576),
          vH(0xb9d),
          vH(0x9c7),
          vH(0x81c),
          vH(0xb69),
          vH(0xa76),
          vH(0x9e4),
          vH(0x2d0),
          vH(0xc89),
          vH(0x21d),
          vH(0xcb0),
          vH(0x28a),
          vH(0xa99),
          vH(0x7a5),
          vH(0x8a9),
          vH(0xa54),
          vH(0x304),
          vH(0xdd9),
          vH(0x811),
        ];
      return (
        (ih = function () {
          return rA;
        }),
        ih()
      );
    }
    function ii(rA, rB) {
      const rC = ih();
      return (
        (ii = function (rD, rE) {
          const vI = b;
          rD = rD - (0x67c * -0x1 + -0x2 * -0xbdd + -0x5 * 0x35b);
          let rF = rC[rD];
          if (ii[vI(0x2f1)] === void 0x0) {
            var rG = function (rL) {
              const vJ = vI,
                rM = vJ(0xbbc);
              let rN = "",
                rO = "";
              for (
                let rP = 0xc6a + -0x161c + -0x22 * -0x49,
                  rQ,
                  rR,
                  rS = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rR = rL[vJ(0xdac)](rS++));
                ~rR &&
                ((rQ =
                  rP % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? rQ * (0x2422 + -0x5 * 0x38b + -0x122b) + rR
                    : rR),
                rP++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rN += String[vJ(0xaa1)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (rQ >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rP) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rR = rM[vJ(0x78f)](rR);
              }
              for (
                let rT = 0x23d0 + 0x13 * -0xdf + -0x1343, rU = rN[vJ(0xc2f)];
                rT < rU;
                rT++
              ) {
                rO +=
                  "%" +
                  ("00" +
                    rN[vJ(0x39e)](rT)[vJ(0x3de)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vJ(0x320)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
              }
              return decodeURIComponent(rO);
            };
            const rK = function (rL, rM) {
              const vK = vI;
              let rN = [],
                rO = -0x3 * 0x542 + -0x7d7 * 0x3 + 0x274b,
                rP,
                rQ = "";
              rL = rG(rL);
              let rR;
              for (
                rR = 0x2205 + 0x3ac + -0x1 * 0x25b1;
                rR < 0x1e33 + 0x1 * -0x181 + -0x5 * 0x58a;
                rR++
              ) {
                rN[rR] = rR;
              }
              for (
                rR = 0x91f * 0x4 + -0x554 + -0x1 * 0x1f28;
                rR < 0x2e * 0x43 + 0x12 * 0xc5 + -0x84c * 0x3;
                rR++
              ) {
                (rO =
                  (rO + rN[rR] + rM[vK(0x39e)](rR % rM[vK(0xc2f)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rP = rN[rR]),
                  (rN[rR] = rN[rO]),
                  (rN[rO] = rP);
              }
              (rR = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rO = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rS = -0x1d30 + -0x23c8 + 0x40f8;
                rS < rL[vK(0xc2f)];
                rS++
              ) {
                (rR =
                  (rR + (0x2309 * -0x1 + 0x5 * -0x8b + -0x1 * -0x25c1)) %
                  (0xc5 * -0x1d + -0x1f03 + 0x3654)),
                  (rO =
                    (rO + rN[rR]) %
                    (-0x5 * -0x256 + 0x1cf * 0x2 + -0x1e * 0x7a)),
                  (rP = rN[rR]),
                  (rN[rR] = rN[rO]),
                  (rN[rO] = rP),
                  (rQ += String[vK(0xaa1)](
                    rL[vK(0x39e)](rS) ^
                      rN[(rN[rR] + rN[rO]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return rQ;
            };
            (ii[vI(0x833)] = rK), (rA = arguments), (ii[vI(0x2f1)] = !![]);
          }
          const rH = rC[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rI = rD + rH,
            rJ = rA[rI];
          return (
            !rJ
              ? (ii[vI(0x991)] === void 0x0 && (ii[vI(0x991)] = !![]),
                (rF = ii[vI(0x833)](rF, rE)),
                (rA[rI] = rF))
              : (rF = rJ),
            rF
          );
        }),
        ii(rA, rB)
      );
    }
    (function (rA, rB) {
      const vL = ux;
      function rC(rI, rJ, rK, rL, rM) {
        return ii(rL - 0x124, rM);
      }
      function rD(rI, rJ, rK, rL, rM) {
        return ii(rJ - -0x245, rI);
      }
      function rE(rI, rJ, rK, rL, rM) {
        return ii(rM - -0x1b4, rL);
      }
      function rF(rI, rJ, rK, rL, rM) {
        return ii(rI - 0x13, rL);
      }
      const rG = rA();
      function rH(rI, rJ, rK, rL, rM) {
        return ii(rK - -0x2b3, rM);
      }
      while (!![]) {
        try {
          const rI =
            (parseInt(rC(0x1a1, 0x1b2, 0x1a9, 0x1b7, vL(0xd5e))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rE(-0x105, -0x12e, -0x131, vL(0xd5e), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(rC(0x1b5, 0x1c9, 0x1b1, 0x1cb, vL(0xa88))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rE(-0x128, -0x132, -0x134, vL(0x6d4), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rE(-0x131, -0x155, -0x130, vL(0x179), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rF(0x9a, 0xb1, 0xb2, vL(0xa88), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(rC(0x1b5, 0x1d3, 0x1bc, 0x1d1, vL(0x66d))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rF(0xb2, 0xbe, 0xb9, vL(0x57f), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(rC(0x183, 0x1ae, 0x197, 0x19e, vL(0x309))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rH(-0x244, -0x216, -0x232, -0x217, vL(0xbe3))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rE(-0x126, -0x10f, -0x13a, vL(0x7d8), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rH(-0x203, -0x209, -0x200, -0x1e1, vL(0x756))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rI === rB) break;
          else rG[vL(0x9db)](rG[vL(0x7aa)]());
        } catch (rJ) {
          rG[vL(0x9db)](rG[vL(0x7aa)]());
        }
      }
    })(ih, 0xc30df * 0x1 + 0x10f * -0x697 + 0x11613);
    function ij() {
      const vM = ux,
        rA = {
          dEyIJ: function (rM, rN) {
            return rM === rN;
          },
          HMRdl:
            rD(vM(0x6d4), -0x130, -0x106, -0x11f, -0x11d) +
            rD(vM(0x4dc), -0x11a, -0x142, -0x138, -0x135),
          MCQcr: function (rM, rN) {
            return rM(rN);
          },
          OVQiZ: function (rM, rN) {
            return rM + rN;
          },
          UJCyl: function (rM, rN) {
            return rM % rN;
          },
          RniHC: function (rM, rN) {
            return rM * rN;
          },
          pKOiA: function (rM, rN) {
            return rM < rN;
          },
          ksKNr: function (rM, rN) {
            return rM ^ rN;
          },
          pZcMn: function (rM, rN) {
            return rM - rN;
          },
          GNeTf: function (rM, rN) {
            return rM - rN;
          },
          igRib: function (rM, rN) {
            return rM ^ rN;
          },
          GUXBF: function (rM, rN) {
            return rM + rN;
          },
          NcAdQ: function (rM, rN) {
            return rM % rN;
          },
          hlnUf: function (rM, rN) {
            return rM * rN;
          },
          pJhNJ: function (rM, rN) {
            return rM(rN);
          },
        };
      if (
        rA[rC(-0x27e, -0x274, -0x265, vM(0x5e4), -0x274)](
          typeof window,
          rA[rE(vM(0x215), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        rA[rG(-0x17d, -0x171, -0x181, vM(0x4e6), -0x16a)](
          typeof kj,
          rA[rC(-0x25a, -0x263, -0x26c, vM(0x4dc), -0x270)]
        )
      )
        return;
      const rB = i6;
      function rC(rM, rN, rO, rP, rQ) {
        return ii(rM - -0x30c, rP);
      }
      function rD(rM, rN, rO, rP, rQ) {
        return ii(rQ - -0x1cb, rM);
      }
      function rE(rM, rN, rO, rP, rQ) {
        return ii(rQ - 0x14c, rM);
      }
      const rF = rB[rE(vM(0x57f), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function rG(rM, rN, rO, rP, rQ) {
        return ii(rM - -0x20a, rP);
      }
      const rH = rA[rJ(0x43a, vM(0x208), 0x40e, 0x428, 0x430)](
        ik,
        rA[rC(-0x28e, -0x27f, -0x272, vM(0x4e6), -0x281)](
          rA[rD(vM(0x621), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rF
          ),
          ic[rD(vM(0xbd2), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rI = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rH[
        rD(vM(0x21e), -0x11e, -0x149, -0x131, -0x13c) +
          rG(-0x172, -0x16e, -0x175, vM(0x215), -0x166)
      ](rI++, cH[rG(-0x18e, -0x16e, -0x17a, vM(0x6d4), -0x1a6)]),
        rH[
          rJ(0x415, vM(0x17e), 0x44c, 0x433, 0x422) +
            rE(vM(0xa95), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rI, cI),
        (rI += -0x3dd + -0x6b5 + 0xa94);
      function rJ(rM, rN, rO, rP, rQ) {
        return ii(rP - 0x3a2, rN);
      }
      const rK = rA[rJ(0x43c, vM(0xbef), 0x43b, 0x446, 0x459)](
        rA[rC(-0x283, -0x272, -0x298, vM(0x4e0), -0x26e)](
          cI,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let rM = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        rA[rE(vM(0x8ce), 0x200, 0x1fc, 0x1fc, 0x1e5)](rM, rF);
        rM++
      ) {
        rH[
          rC(-0x287, -0x273, -0x27d, vM(0x215), -0x27c) +
            rE(vM(0xd00), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rI++,
          rA[rE(vM(0xe19), 0x201, 0x215, 0x21c, 0x1fc)](
            rB[
              rD(vM(0x462), -0x11c, -0x130, -0x128, -0x13b) +
                rC(-0x289, -0x29c, -0x26a, vM(0xbd2), -0x290)
            ](
              rA[rD(vM(0x97b), -0x13a, -0x124, -0x111, -0x120)](
                rA[rD(vM(0x5e4), -0x10d, -0x119, -0x108, -0x128)](rF, rM),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rK
          )
        );
      }
      if (ic) {
        const rN = ic[rE(vM(0x4e6), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rO = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          rA[rE(vM(0x86f), 0x21f, 0x216, 0x204, 0x200)](rO, rN);
          rO++
        ) {
          rH[
            rE(vM(0xa95), 0x207, 0x20e, 0x209, 0x202) +
              rE(vM(0x462), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rI++,
            rA[rC(-0x25b, -0x256, -0x24f, vM(0x736), -0x261)](
              ic[
                rC(-0x267, -0x256, -0x25e, vM(0x3fb), -0x271) +
                  rJ(0x412, vM(0x462), 0x411, 0x421, 0x425)
              ](
                rA[rJ(0x435, vM(0xd5e), 0x427, 0x434, 0x41a)](
                  rA[rD(vM(0x45e), -0x143, -0x134, -0x133, -0x137)](rN, rO),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rK
            )
          );
        }
      }
      const rL = rH[
        rJ(0x423, vM(0x6d4), 0x44b, 0x440, 0x45a) +
          rC(-0x280, -0x27d, -0x26e, vM(0xa95), -0x288)
      ](
        rA[rG(-0x162, -0x164, -0x161, vM(0x4dc), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          rA[rJ(0x429, vM(0x170), 0x43d, 0x437, 0x44b)](
            rA[rD(vM(0x309), -0x10d, -0x127, -0x124, -0x116)](
              cI,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rF
          )
        )
      );
      rA[rJ(0x435, vM(0x131), 0x43b, 0x42a, 0x448)](im, rH), (ib = rL);
    }
    function ik(rA) {
      return new DataView(new ArrayBuffer(rA));
    }
    function il() {
      const vN = ux;
      return hV && hV[vN(0x256)] === WebSocket[vN(0x81f)];
    }
    function im(rA) {
      const vO = ux;
      if (il()) {
        pF += rA[vO(0x86e)];
        if (hX) {
          const rB = new Uint8Array(rA[vO(0x61f)]);
          for (let rE = 0x0; rE < rB[vO(0xc2f)]; rE++) {
            rB[rE] ^= ib;
          }
          const rC = cI % rB[vO(0xc2f)],
            rD = rB[0x0];
          (rB[0x0] = rB[rC]), (rB[rC] = rD);
        }
        hV[vO(0x33b)](rA);
      }
    }
    function io(rA, rB = 0x1) {
      const vP = ux;
      let rC = eT(rA);
      const rD = new Uint8Array([
        cH[vP(0x627)],
        rC,
        Math[vP(0x22b)](rB * 0xff),
      ]);
      im(rD);
    }
    function ip(rA, rB) {
      const rC = iq();
      return (
        (ip = function (rD, rE) {
          rD = rD - (-0x25b2 + 0x10 * 0x211 + 0x5b2);
          let rF = rC[rD];
          return rF;
        }),
        ip(rA, rB)
      );
    }
    function iq() {
      const vQ = ux,
        rA = [
          vQ(0x5cf),
          vQ(0xaad),
          vQ(0x608),
          vQ(0x4ae),
          vQ(0xe0e),
          vQ(0xaa8),
          vQ(0x8dc),
          vQ(0xc5b),
          vQ(0xa6f),
          vQ(0xe31),
          vQ(0x788),
          vQ(0x3a9),
          vQ(0x974),
          vQ(0x719),
          vQ(0xe47),
          vQ(0x5e6),
          vQ(0x887),
          vQ(0x728),
          vQ(0x408),
          vQ(0xd7c),
        ];
      return (
        (iq = function () {
          return rA;
        }),
        iq()
      );
    }
    (function (rA, rB) {
      const vR = ux;
      function rC(rI, rJ, rK, rL, rM) {
        return ip(rJ - -0x22a, rM);
      }
      const rD = rA();
      function rE(rI, rJ, rK, rL, rM) {
        return ip(rL - -0x178, rJ);
      }
      function rF(rI, rJ, rK, rL, rM) {
        return ip(rL - 0xba, rI);
      }
      function rG(rI, rJ, rK, rL, rM) {
        return ip(rI - -0x119, rK);
      }
      function rH(rI, rJ, rK, rL, rM) {
        return ip(rK - -0x53, rI);
      }
      while (!![]) {
        try {
          const rI =
            (-parseInt(rG(0x9, -0x1, 0xe, 0x10, 0x0)) /
              (-0x242b + -0x3 * -0x421 + 0x17c9)) *
              (-parseInt(rH(0xc4, 0xb9, 0xc1, 0xb8, 0xc5)) /
                (0xe5b + 0x551 * 0x2 + -0x18fb)) +
            -parseInt(rG(-0x1, -0x5, -0x4, -0x4, 0x2)) /
              (0x49 * -0xb + 0x6 * 0x373 + 0x1 * -0x118c) +
            -parseInt(rE(-0x52, -0x53, -0x4d, -0x55, -0x54)) /
              (-0x10e7 + -0x14a9 + 0x2594) +
            -parseInt(rH(0xcd, 0xc0, 0xc8, 0xc6, 0xcd)) /
              (0x159 + 0x18e * 0x2 + -0x470) +
            (-parseInt(rG(0x6, -0x2, 0x10, 0x2, 0xc)) /
              (-0x1872 * -0x1 + 0x1d62 + -0x35ce)) *
              (-parseInt(rE(-0x65, -0x5d, -0x54, -0x5e, -0x66)) /
                (-0x11c + -0x682 + 0x7a5 * 0x1)) +
            -parseInt(rC(-0x112, -0x11a, -0x115, -0x122, -0x11b)) /
              (-0x2312 + -0x1 * -0x2659 + -0x33f) +
            (-parseInt(rF(0x1dc, 0x1d0, 0x1dd, 0x1d7, 0x1de)) /
              (-0x5 * 0x61f + -0x8b * 0x3e + -0x2027 * -0x2)) *
              (-parseInt(rF(0x1d8, 0x1cf, 0x1d5, 0x1cf, 0x1d5)) /
                (-0x292 * -0xb + 0x13d * -0x13 + -0x4b5));
          if (rI === rB) break;
          else rD[vR(0x9db)](rD[vR(0x7aa)]());
        } catch (rJ) {
          rD[vR(0x9db)](rD[vR(0x7aa)]());
        }
      }
    })(iq, -0x1 * -0x304f9 + 0x1cdb2 + -0x2848f);
    function ir(rA) {
      function rB(rI, rJ, rK, rL, rM) {
        return ip(rI - 0x3df, rL);
      }
      function rC(rI, rJ, rK, rL, rM) {
        return ip(rI - 0x12f, rJ);
      }
      function rD(rI, rJ, rK, rL, rM) {
        return ip(rL - 0x263, rK);
      }
      const rE = {
          xgMol: function (rI) {
            return rI();
          },
          NSlTg: function (rI) {
            return rI();
          },
          BrnPE: function (rI) {
            return rI();
          },
          oiynC: function (rI, rJ) {
            return rI(rJ);
          },
        },
        rF = new Uint8Array([
          cH[
            rG(0x44e, 0x446, 0x44f, 0x456, 0x44f) +
              rG(0x440, 0x43c, 0x440, 0x448, 0x43d)
          ],
          rE[rD(0x387, 0x37e, 0x37e, 0x381, 0x38b)](is),
          oS,
          rE[rH(0x4a2, 0x4a9, 0x4a0, 0x4a8, 0x49f)](is),
          rE[rC(0x245, 0x243, 0x241, 0x249, 0x24d)](is),
          ...rE[rD(0x381, 0x389, 0x38e, 0x384, 0x37e)](it, rA),
        ]);
      function rG(rI, rJ, rK, rL, rM) {
        return ip(rI - 0x32e, rJ);
      }
      function rH(rI, rJ, rK, rL, rM) {
        return ip(rM - 0x38e, rK);
      }
      rE[rC(0x250, 0x24e, 0x250, 0x246, 0x24a)](im, rF);
    }
    function is() {
      function rA(rG, rH, rI, rJ, rK) {
        return ip(rH - 0xd5, rJ);
      }
      function rB(rG, rH, rI, rJ, rK) {
        return ip(rK - 0x379, rG);
      }
      const rC = {};
      function rD(rG, rH, rI, rJ, rK) {
        return ip(rK - 0x107, rI);
      }
      rC[rF(-0x1b1, -0x1b7, -0x1bb, -0x1ad, -0x1af)] = function (rG, rH) {
        return rG * rH;
      };
      const rE = rC;
      function rF(rG, rH, rI, rJ, rK) {
        return ip(rG - -0x2ca, rI);
      }
      return Math[rA(0x1f0, 0x1ec, 0x1f4, 0x1e4, 0x1ea)](
        rE[rF(-0x1b1, -0x1ab, -0x1b8, -0x1b0, -0x1b4)](
          Math[rF(-0x1b7, -0x1bb, -0x1bd, -0x1b7, -0x1b2) + "m"](),
          -0x2573 + -0xe * 0x11e + 0x3616
        )
      );
    }
    function it(rA) {
      function rB(rC, rD, rE, rF, rG) {
        return ip(rG - 0x117, rD);
      }
      return new TextEncoder()[rB(0x22e, 0x22d, 0x237, 0x22b, 0x233) + "e"](rA);
    }
    function iu(rA, rB, rC = 0x3c) {
      const vS = ux;
      iv(),
        (kl[vS(0x90b)] = vS(0xb52) + rA + vS(0x7e8) + rB + vS(0x1e6)),
        kl[vS(0xcee)](hZ),
        (hZ[vS(0x5c6)][vS(0x50f)] = ""),
        (i4[vS(0x5c6)][vS(0x50f)] = vS(0x5a4)),
        (i1[vS(0x5c6)][vS(0x50f)] = vS(0x5a4)),
        (hZ[vS(0x546)](vS(0x3dd))[vS(0x5c6)][vS(0x332)] = "0"),
        document[vS(0x99b)][vS(0x292)][vS(0xae0)](vS(0x50a)),
        (kl[vS(0x5c6)][vS(0x50f)] = ""),
        (km[vS(0x5c6)][vS(0x50f)] =
          ko[vS(0x5c6)][vS(0x50f)] =
          kn[vS(0x5c6)][vS(0x50f)] =
          kD[vS(0x5c6)][vS(0x50f)] =
            vS(0x5a4));
      const rD = document[vS(0x546)](vS(0x8b9));
      document[vS(0x546)](vS(0x8b4))[vS(0x8cd)] = function () {
        rG();
      };
      let rE = rC;
      k9(rD, vS(0x8a1) + rE + vS(0xc50));
      const rF = setInterval(() => {
        const vT = vS;
        rE--, rE <= 0x0 ? rG() : k9(rD, vT(0x8a1) + rE + vT(0xc50));
      }, 0x3e8);
      function rG() {
        const vU = vS;
        clearInterval(rF), k9(rD, vU(0x949)), location[vU(0xc72)]();
      }
    }
    function iv() {
      const vV = ux;
      if (hV) {
        hV[vV(0xcac)] = hV[vV(0x8df)] = hV[vV(0xd6a)] = null;
        try {
          hV[vV(0x5f6)]();
        } catch (rA) {}
        hV = null;
      }
    }
    var iw = {},
      ix = [],
      iy,
      iz,
      iA = [],
      iB = ux(0xa6a);
    function iC() {
      const vW = ux;
      iB = getComputedStyle(document[vW(0x99b)])[vW(0x7dd)];
    }
    var iD = document[ux(0x546)](ux(0x55a)),
      iE = document[ux(0x546)](ux(0x673)),
      iF = document[ux(0x546)](ux(0xda1)),
      iG = [],
      iH = [],
      iI = ![],
      iJ = 0x0;
    function iK(rA) {
      const vX = ux;
      if(hack.isEnabled('numberNoSuffix')) return Math.round(rA);
      if (rA < 0.01) return "0";
      rA = Math[vX(0x22b)](rA);
      if (rA >= 0x3b9aca00)
        return parseFloat((rA / 0x3b9aca00)[vX(0xbca)](0x2)) + "b";
      else {
        if (rA >= 0xf4240)
          return parseFloat((rA / 0xf4240)[vX(0xbca)](0x2)) + "m";
        else {
          if (rA >= 0x3e8)
            return parseFloat((rA / 0x3e8)[vX(0xbca)](0x1)) + "k";
        }
      }
      return rA;
    }
    function iL(rA, rB) {
      const vY = ux,
        rC = document[vY(0x916)](vY(0xd7b));
      rC[vY(0x11d)] = vY(0x686);
      const rD = document[vY(0x916)](vY(0xd7b));
      (rD[vY(0x11d)] = vY(0x77d)), rC[vY(0xcee)](rD);
      const rE = document[vY(0x916)](vY(0xb2f));
      rC[vY(0xcee)](rE), iD[vY(0xcee)](rC);
      const rF = {};
      (rF[vY(0x5ef)] = rA),
        (rF[vY(0x644)] = rB),
        (rF[vY(0x6f5)] = 0x0),
        (rF[vY(0xac8)] = 0x0),
        (rF[vY(0x1f4)] = 0x0),
        (rF["el"] = rC),
        (rF[vY(0x6cf)] = rD),
        (rF[vY(0x9d8)] = rE);
      const rG = rF;
      (rG[vY(0x6d6)] = iH[vY(0xc2f)]),
        (rG[vY(0x72c)] = function () {
          const vZ = vY;
          (this[vZ(0x6f5)] = px(this[vZ(0x6f5)], this[vZ(0x644)], 0x64)),
            (this[vZ(0x1f4)] = px(this[vZ(0x1f4)], this[vZ(0xac8)], 0x64)),
            this[vZ(0x9d8)][vZ(0x3b6)](
              vZ(0x8ae),
              (this[vZ(0x5ef)] ? this[vZ(0x5ef)] + vZ(0x30f) : "") +
                iK(this[vZ(0x6f5)])
            ),
            (this[vZ(0x6cf)][vZ(0x5c6)][vZ(0xb3d)] = this[vZ(0x1f4)] + "%");
        }),
        rG[vY(0x72c)](),
        iH[vY(0x9db)](rG);
    }
    function iM(rA) {
      const w0 = ux;
      if (iH[w0(0xc2f)] === 0x0) return;
      const rB = iH[0x0];
      rB[w0(0xac8)] = rB[w0(0x1f4)] = 0x64;
      for (let rC = 0x1; rC < iH[w0(0xc2f)]; rC++) {
        const rD = iH[rC];
        (rD[w0(0xac8)] =
          Math[w0(0x585)](
            0x1,
            rB[w0(0x644)] === 0x0 ? 0x1 : rD[w0(0x644)] / rB[w0(0x644)]
          ) * 0x64),
          rA && (rD[w0(0x1f4)] = rD[w0(0xac8)]),
          iD[w0(0xcee)](rD["el"]);
      }
    }
    function iN(rA) {
      const w1 = ux,
        rB = new Path2D();
      rB[w1(0x4a6)](...rA[w1(0x457)][0x0]);
      for (let rC = 0x0; rC < rA[w1(0x457)][w1(0xc2f)] - 0x1; rC++) {
        const rD = rA[w1(0x457)][rC],
          rE = rA[w1(0x457)][rC + 0x1];
        let rF = 0x0;
        const rG = rE[0x0] - rD[0x0],
          rH = rE[0x1] - rD[0x1],
          rI = Math[w1(0xc3c)](rG, rH);
        while (rF < rI) {
          rB[w1(0xa7c)](
            rD[0x0] + (rF / rI) * rG + (Math[w1(0xe0d)]() * 0x2 - 0x1) * 0x32,
            rD[0x1] + (rF / rI) * rH + (Math[w1(0xe0d)]() * 0x2 - 0x1) * 0x32
          ),
            (rF += Math[w1(0xe0d)]() * 0x28 + 0x1e);
        }
        rB[w1(0xa7c)](...rE);
      }
      rA[w1(0xe70)] = rB;
    }
    var iO = 0x0,
      iP = 0x0,
      iQ = [],
      iR = {},
      iS = [],
      iT = {};
    function iU(rA, rB) {
      const w2 = ux;
      if (!pc[w2(0xb67)]) return;
      let baseHP = hack.getHP(rA);
      let decDmg = rA['nHealth'] - rB;
      let dmg = Math.round(decDmg * 10000) / 100 + '%';
      if(baseHP && hack.isEnabled('DDenableNumber')) dmg = Math.round(decDmg * baseHP);
      if(isNaN(dmg)) dmg = '';
      let rC;
      const rD = rB === void 0x0;
      !rD && (rC = Math[w2(0xa5e)]((rA[w2(0x890)] - rB) * 0x64) || 0x1),
        iA[w2(0x9db)]({
          text: hack.isEnabled('damageDisplay') ? dmg : rC,
          x: rA["x"] + (Math[w2(0xe0d)]() * 0x2 - 0x1) * rA[w2(0x911)] * 0.6,
          y: rA["y"] + (Math[w2(0xe0d)]() * 0x2 - 0x1) * rA[w2(0x911)] * 0.6,
          vx: (Math[w2(0xe0d)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[w2(0xe0d)]() * 0x3,
          angle: (Math[w2(0xe0d)]() * 0x2 - 0x1) * (rD ? 0x1 : 0.1),
          size: Math[w2(0x9da)](0x1, (rA[w2(0x911)] * 0.2) / 0x14),
        }),
        rA === iz && (pw = 0x1);
    }
    var iV = 0x0,
      iW = 0x0,
      iX = 0x0,
      iY = 0x0;
    function iZ(rA) {
      const w3 = ux,
        rB = iw[rA];
      if (rB) {
        rB[w3(0xe6a)] = !![];
        if (
          Math[w3(0x372)](rB["nx"] - iV) > iX + rB[w3(0xa6d)] ||
          Math[w3(0x372)](rB["ny"] - iW) > iY + rB[w3(0xa6d)]
        )
          rB[w3(0x839)] = 0xa;
        else !rB[w3(0xcbd)] && iU(rB, 0x0);
        delete iw[rA];
      }
    }
    var j0 = [
      ux(0x257),
      ux(0xc9d),
      ux(0x8ca),
      ux(0xd31),
      ux(0x163),
      ux(0x71b),
      ux(0x281),
      ux(0x2a9),
      ux(0xb0d),
      ux(0x242),
      ux(0x3d3),
      ux(0xadb),
      ux(0x483),
    ];
    function j1(rA, rB = iz) {
      const w4 = ux;
      (rA[w4(0x257)] = rB[w4(0x257)]),
        (rA[w4(0xc9d)] = rB[w4(0xc9d)]),
        (rA[w4(0x8ca)] = rB[w4(0x8ca)]),
        (rA[w4(0xd31)] = rB[w4(0xd31)]),
        (rA[w4(0x163)] = rB[w4(0x163)]),
        (rA[w4(0x71b)] = rB[w4(0x71b)]),
        (rA[w4(0x281)] = rB[w4(0x281)]),
        (rA[w4(0x2a9)] = rB[w4(0x2a9)]),
        (rA[w4(0xb0d)] = rB[w4(0xb0d)]),
        (rA[w4(0x242)] = rB[w4(0x242)]),
        (rA[w4(0x167)] = rB[w4(0x167)]),
        (rA[w4(0x3d3)] = rB[w4(0x3d3)]),
        (rA[w4(0xb60)] = rB[w4(0xb60)]),
        (rA[w4(0xadb)] = rB[w4(0xadb)]),
        (rA[w4(0x483)] = rB[w4(0x483)]);
    }
    function j2() {
      (p0 = null), p8(null), (p4 = null), (p2 = ![]), (p3 = 0x0), om && pN();
    }
    var j3 = 0x64,
      j4 = 0x1,
      j5 = 0x64,
      j6 = 0x1,
      j7 = {},
      j8 = [...Object[ux(0x572)](d8)],
      j9 = [...hP];
    jb(j8),
      jb(j9),
      j8[ux(0x9db)](ux(0x754)),
      j9[ux(0x9db)](hO[ux(0x4c5)] || ux(0x1ad)),
      j8[ux(0x9db)](ux(0xd75)),
      j9[ux(0x9db)](ux(0x74c));
    var ja = [];
    for (let rA = 0x0; rA < j8[ux(0xc2f)]; rA++) {
      const rB = d8[j8[rA]] || 0x0;
      ja[rA] = 0x78 + (rB - d8[ux(0xde5)]) * 0x3c - 0x1 + 0x1;
    }
    function jb(rC) {
      const rD = rC[0x3];
      (rC[0x3] = rC[0x5]), (rC[0x5] = rD);
    }
    var jc = [],
      jd = [];
    function je(rC) {
      const w5 = ux,
        rD = j9[rC],
        rE = nR(
          w5(0xdd4) + j8[rC] + w5(0x743) + rD + w5(0x88e) + rD + w5(0xa03)
        ),
        rF = rE[w5(0x546)](w5(0x354));
      (j7 = {
        id: rC,
        el: rE,
        state: cS[w5(0x5a4)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rE[w5(0x546)](w5(0x857)),
        progressEl: rF,
        barEl: rF[w5(0x546)](w5(0xd9b)),
        textEl: rF[w5(0x546)](w5(0xb2f)),
        nameEl: rE[w5(0x546)](w5(0x7a7)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const w6 = w5,
            rG = Math[w6(0x585)](0x1, (pQ - this[w6(0x40a)]) / 0x64);
          this[w6(0xe2c)] =
            this[w6(0xbe0)] + (this[w6(0x285)] - this[w6(0xbe0)]) * rG;
          const rH = this[w6(0xe2c)] - 0x1;
          this[w6(0x6cf)][w6(0x5c6)][w6(0x14b)] =
            w6(0x29a) + rH * 0x64 + w6(0xc94) + rH + w6(0x667);
        },
        update() {
          const w7 = w5,
            rG = jf(this["t"]),
            rH = 0x1 - rG;
          (this["el"][w7(0x5c6)][w7(0x332)] = -0xc8 * rH + "px"),
            (this["el"][w7(0x5c6)][w7(0x14b)] = w7(0xe60) + -0x64 * rH + "%)");
        },
        remove() {
          const w8 = w5;
          rE[w8(0xae0)]();
        },
      }),
        (j7[w5(0xc88)][w5(0x5c6)][w5(0x50f)] = w5(0x5a4)),
        jd[w5(0x9db)](j7),
        j7[w5(0x72c)](),
        jc[w5(0x9db)](j7),
        kn[w5(0x1c4)](rE, q3);
    }
    function jf(rC) {
      return 0x1 - (0x1 - rC) * (0x1 - rC);
    }
    function jg(rC) {
      const w9 = ux;
      return rC < 0.5
        ? (0x1 - Math[w9(0xc51)](0x1 - Math[w9(0x3ce)](0x2 * rC, 0x2))) / 0x2
        : (Math[w9(0xc51)](0x1 - Math[w9(0x3ce)](-0x2 * rC + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jh() {
      const wa = ux;
      (oB[wa(0x90b)] = ""), (oD = {});
    }
    var ji = document[ux(0x546)](ux(0x4e8));
    ji[ux(0x5c6)][ux(0x50f)] = ux(0x5a4);
    var jj = document[ux(0x546)](ux(0xe49)),
      jk = [],
      jl = document[ux(0x546)](ux(0x53e));
    jl[ux(0x23d)] = function () {
      jm();
    };
    function jm() {
      const wb = ux;
      for (let rC = 0x0; rC < jk[wb(0xc2f)]; rC++) {
        const rD = jk[rC];
        k9(rD[wb(0x476)][0x0], jl[wb(0x7f0)] ? wb(0x937) : rD[wb(0xc11)]);
      }
    }
    function jn(rC) {
      const wc = ux;
      (ji[wc(0x5c6)][wc(0x50f)] = ""), (jj[wc(0x90b)] = wc(0x63c));
      const rD = rC[wc(0xc2f)];
      jk = [];
      for (let rE = 0x0; rE < rD; rE++) {
        const rF = rC[rE];
        jj[wc(0xcee)](nR(wc(0x6b9) + (rE + 0x1) + wc(0xa3d))), jo(rF);
      }
      m3[wc(0x519)][wc(0x695)]();
    }
    function jo(rC) {
      const wd = ux;
      for (let rD = 0x0; rD < rC[wd(0xc2f)]; rD++) {
        const rE = rC[rD],
          rF = nR(wd(0x8fb) + rE + wd(0x888));
        (rF[wd(0xc11)] = rE),
          rD > 0x0 && jk[wd(0x9db)](rF),
          (rF[wd(0x8cd)] = function () {
            jq(rE);
          }),
          jj[wd(0xcee)](rF);
      }
      jm();
    }
    function jp(rC) {
      const we = ux;
      var rD = document[we(0x916)](we(0xdbe));
      (rD[we(0x1d6)] = rC),
        (rD[we(0x5c6)][we(0xc0d)] = "0"),
        (rD[we(0x5c6)][we(0x5c2)] = "0"),
        (rD[we(0x5c6)][we(0x8d5)] = we(0xace)),
        document[we(0x99b)][we(0xcee)](rD),
        rD[we(0xb6e)](),
        rD[we(0x3b8)]();
      try {
        var rE = document[we(0x785)](we(0x343)),
          rF = rE ? we(0x260) : we(0xa4e);
      } catch (rG) {}
      document[we(0x99b)][we(0x602)](rD);
    }
    function jq(rC) {
      const wf = ux;
      if (!navigator[wf(0x999)]) {
        jp(rC);
        return;
      }
      navigator[wf(0x999)][wf(0xc6f)](rC)[wf(0xc15)](
        function () {},
        function (rD) {}
      );
    }
    var jr = [
        ux(0x9a7),
        ux(0xcf1),
        ux(0xa58),
        ux(0x8ec),
        ux(0x4fd),
        ux(0x67a),
        ux(0x731),
        ux(0x19c),
        ux(0xe57),
        ux(0x5f2),
        ux(0x20b),
      ],
      js = [ux(0xbc3), ux(0x6a9), ux(0x604)];
    function jt(rC) {
      const wg = ux,
        rD = rC ? js : jr;
      return rD[Math[wg(0xa6f)](Math[wg(0xe0d)]() * rD[wg(0xc2f)])];
    }
    function ju(rC) {
      const wh = ux;
      return rC[wh(0xe03)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var jv = document[ux(0x546)](ux(0x42b));
    jv[ux(0x8cd)] = nw(function (rC) {
      hack.isSuicide = true;
      const wi = ux;
      iz && im(new Uint8Array([cH[wi(0xb5d)]]));
    });
    var jw = "";
    function jx(rC) {
      const wj = ux;
      return rC[wj(0xbb7)](/"/g, wj(0x93d));
    }
    function jy(rC) {
      const wk = ux;
      let rD = "";
      for (let rE = 0x0; rE < rC[wk(0xc2f)]; rE++) {
        const [rF, rG, rH] = rC[rE];
        rD +=
          wk(0x56a) +
          rF +
          "\x22\x20" +
          (rH ? wk(0x905) : "") +
          wk(0x77e) +
          jx(rG) +
          wk(0xc6d);
      }
      return wk(0x611) + rD + wk(0x475);
    }
    var jz = ![];
    function jA() {
      const wl = ux;
      return nR(wl(0x20f) + hO[wl(0xde5)] + wl(0x929));
    }
    var jB = document[ux(0x546)](ux(0xd08));
    function jC() {
      const wm = ux;
      (oT[wm(0x5c6)][wm(0x50f)] = q3[wm(0x5c6)][wm(0x50f)] =
        jz ? wm(0x5a4) : ""),
        (jB[wm(0x5c6)][wm(0x50f)] = kz[wm(0x5c6)][wm(0x50f)] =
          jz ? "" : wm(0x5a4));
      jz
        ? (kA[wm(0x292)][wm(0x1ee)](wm(0x5df)),
          k9(kA[wm(0x476)][0x0], wm(0x98d)))
        : (kA[wm(0x292)][wm(0xae0)](wm(0x5df)),
          k9(kA[wm(0x476)][0x0], wm(0x79c)));
      const rC = [hF, mn];
      for (let rD = 0x0; rD < rC[wm(0xc2f)]; rD++) {
        const rE = rC[rD];
        rE[wm(0x292)][jz ? wm(0x1ee) : wm(0xae0)](wm(0x652)),
          (rE[wm(0x7e1)] = jz ? jA : null),
          (rE[wm(0x471)] = !![]);
      }
      jD[wm(0x5c6)][wm(0x50f)] = o0[wm(0x5c6)][wm(0x50f)] = jz ? wm(0x5a4) : "";
    }
    var jD = document[ux(0x546)](ux(0x8ed)),
      jE = document[ux(0x546)](ux(0xc87)),
      jF = 0x0,
      jG = 0x3e8 / 0x14,
      jH = 0x0,
      jI = [],
      jJ = 0x0,
      jK = ![],
      jL,
      jM = [],
      jN = {};
    setInterval(() => {
      (jN = {}), (jM = []);
    }, 0x7530);
    function jO(rC, rD) {
      const wn = ux;
      jN[rD] = (jN[rD] || 0x0) + 0x1;
      if (jN[rD] > 0x8) return ![];
      let rE = 0x0;
      for (let rF = jM[wn(0xc2f)] - 0x1; rF >= 0x0; rF--) {
        const rG = jM[rF];
        if (ny(rC, rG) > 0.7) {
          rE++;
          if (rE >= 0x5) return ![];
        }
      }
      return jM[wn(0x9db)](rC), !![];
    }
    var jP = document[ux(0x546)](ux(0xe05)),
      jQ = document[ux(0x546)](ux(0x691)),
      jR = document[ux(0x546)](ux(0x5bf)),
      jS = document[ux(0x546)](ux(0x137)),
      jT;
    k9(jR, "-"),
      (jR[ux(0x8cd)] = function () {
        if (jT) mA(jT);
      });
    var jU = 0x0,
      jV = document[ux(0x546)](ux(0xe4d));
    setInterval(() => {
      const wo = ux;
      jU--;
      if (jU < 0x0) {
        jV[wo(0x292)][wo(0x427)](wo(0x695)) &&
          hX &&
          im(new Uint8Array([cH[wo(0x9bc)]]));
        return;
      }
      jW();
    }, 0x3e8);
    function jW() {
      k9(jS, kb(jU * 0x3e8));
    }
    function jX() {
      const wp = ux,
        rC = document[wp(0x546)](wp(0x2f5))[wp(0x476)],
        rD = document[wp(0x546)](wp(0xb92))[wp(0x476)];
      for (let rE = 0x0; rE < rC[wp(0xc2f)]; rE++) {
        const rF = rC[rE],
          rG = rD[rE];
        rF[wp(0x8cd)] = function () {
          const wq = wp;
          for (let rH = 0x0; rH < rD[wq(0xc2f)]; rH++) {
            const rI = rE === rH;
            (rD[rH][wq(0x5c6)][wq(0x50f)] = rI ? "" : wq(0x5a4)),
              rC[rH][wq(0x292)][rI ? wq(0x1ee) : wq(0xae0)](wq(0x487));
          }
        };
      }
      rC[0x0][wp(0x8cd)]();
    }
    jX();
    var jY = [];
    function jZ(rC) {
      const wr = ux;
      rC[wr(0x292)][wr(0x1ee)](wr(0x212)), jY[wr(0x9db)](rC);
    }
    var k0,
      k1 = document[ux(0x546)](ux(0xcd9));
    function k2(rC, rD = !![]) {
      const ws = ux;
      if (rD) {
        if (pQ < jH) {
          jI[ws(0x9db)](rC);
          return;
        } else {
          if (jI[ws(0xc2f)] > 0x0)
            while (jI[ws(0xc2f)] > 0x0) {
              k2(jI[ws(0x7aa)](), ![]);
            }
        }
      }
      function rE() {
        const wt = ws,
          rQ = rN[wt(0x66e)](rO++),
          rR = new Uint8Array(rQ);
        for (let rS = 0x0; rS < rQ; rS++) {
          rR[rS] = rN[wt(0x66e)](rO++);
        }
        return new TextDecoder()[wt(0x3f1)](rR);
      }
      function rF() {
        const wu = ws;
        return rN[wu(0x66e)](rO++) / 0xff;
      }
      function rG(rQ) {
        const wv = ws,
          rR = rN[wv(0x7d4)](rO);
        (rO += 0x2),
          (rQ[wv(0x678)] = rR & 0x1),
          (rQ[wv(0x257)] = rR & 0x2),
          (rQ[wv(0xc9d)] = rR & 0x4),
          (rQ[wv(0x8ca)] = rR & 0x8),
          (rQ[wv(0xd31)] = rR & 0x10),
          (rQ[wv(0x163)] = rR & 0x20),
          (rQ[wv(0x71b)] = rR & 0x40),
          (rQ[wv(0x281)] = rR & 0x80),
          (rQ[wv(0x2a9)] = rR & 0x100),
          (rQ[wv(0xb0d)] = rR & (0x1 << 0x9)),
          (rQ[wv(0x242)] = rR & (0x1 << 0xa)),
          (rQ[wv(0x167)] = rR & (0x1 << 0xb)),
          (rQ[wv(0x3d3)] = rR & (0x1 << 0xc)),
          (rQ[wv(0xb60)] = rR & (0x1 << 0xd)),
          (rQ[wv(0xadb)] = rR & (0x1 << 0xe)),
          (rQ[wv(0x483)] = rR & (0x1 << 0xf));
      }
      function rH() {
        const ww = ws,
          rQ = rN[ww(0x6d5)](rO);
        rO += 0x4;
        const rR = rE();
        iL(rR, rQ);
      }
      function rI() {
        const wx = ws,
          rQ = rN[wx(0x7d4)](rO) - cF;
        return (rO += 0x2), rQ;
      }
      function rJ() {
        const wy = ws,
          rQ = {};
        for (let s1 in mr) {
          (rQ[s1] = rN[wy(0x6d5)](rO)), (rO += 0x4);
        }
        const rR = rE(),
          rS = Number(rN[wy(0x3a3)](rO));
        rO += 0x8;
        const rT = d4(d3(rS)[0x0]),
          rU = rT * 0x2,
          rV = Array(rU);
        for (let s2 = 0x0; s2 < rU; s2++) {
          const s3 = rN[wy(0x7d4)](rO) - 0x1;
          rO += 0x2;
          if (s3 < 0x0) continue;
          rV[s2] = dB[s3];
        }
        const rW = [],
          rX = rN[wy(0x7d4)](rO);
        rO += 0x2;
        for (let s4 = 0x0; s4 < rX; s4++) {
          const s5 = rN[wy(0x7d4)](rO);
          rO += 0x2;
          const s6 = rN[wy(0x6d5)](rO);
          (rO += 0x4), rW[wy(0x9db)]([dB[s5], s6]);
        }
        const rY = [],
          rZ = rN[wy(0x7d4)](rO);
        rO += 0x2;
        for (let s7 = 0x0; s7 < rZ; s7++) {
          const s8 = rN[wy(0x7d4)](rO);
          (rO += 0x2), !eJ[s8] && console[wy(0x8b7)](s8), rY[wy(0x9db)](eJ[s8]);
        }
        const s0 = rN[wy(0x66e)](rO++);
        mw(rR, rQ, rW, rY, rS, rV, s0);
      }
      function rK() {
        const wz = ws,
          rQ = Number(rN[wz(0x3a3)](rO));
        return (rO += 0x8), rQ;
      }
      function rL() {
        const wA = ws,
          rQ = rN[wA(0x6d5)](rO);
        rO += 0x4;
        const rR = rN[wA(0x66e)](rO++),
          rS = {};
        (rS[wA(0xcd4)] = rQ), (rS[wA(0x95b)] = {});
        const rT = rS;
        f2[wA(0xa40)]((rV, rW) => {
          const wB = wA;
          rT[wB(0x95b)][rV] = [];
          for (let rX = 0x0; rX < rR; rX++) {
            const rY = rE();
            let rZ;
            rV === "xp" ? (rZ = rK()) : ((rZ = rN[wB(0x6d5)](rO)), (rO += 0x4)),
              rT[wB(0x95b)][rV][wB(0x9db)]([rY, rZ]);
          }
        }),
          k9(jE, ka(rT[wA(0xcd4)]) + wA(0x68a)),
          (mD[wA(0x90b)] = "");
        let rU = 0x0;
        for (let rV in rT[wA(0x95b)]) {
          const rW = ke(rV),
            rX = rT[wA(0x95b)][rV],
            rY = nR(wA(0xcc5) + rU + wA(0xa9d) + rW + wA(0x15c)),
            rZ = rY[wA(0x546)](wA(0x21b));
          for (let s0 = 0x0; s0 < rX[wA(0xc2f)]; s0++) {
            const [s1, s2] = rX[s0];
            let s3 = mq(rV, s2);
            rV === "xp" && (s3 += wA(0xbf8) + (d3(s2)[0x0] + 0x1) + ")");
            const s4 = nR(
              wA(0xb89) + (s0 + 0x1) + ".\x20" + s1 + wA(0xd2b) + s3 + wA(0x451)
            );
            (s4[wA(0x8cd)] = function () {
              mA(s1);
            }),
              rZ[wA(0x607)](s4);
          }
          mD[wA(0x607)](rY), rU++;
        }
      }
      function rM() {
        const wC = ws;
        (jT = rE()), k9(jR, jT || "-");
        const rQ = Number(rN[wC(0x3a3)](rO));
        (rO += 0x8),
          (jU = Math[wC(0x22b)]((rQ - Date[wC(0xa4a)]()) / 0x3e8)),
          jW();
        const rR = rN[wC(0x7d4)](rO);
        rO += 0x2;
        if (rR === 0x0) jQ[wC(0x90b)] = wC(0x164);
        else {
          jQ[wC(0x90b)] = "";
          for (let rT = 0x0; rT < rR; rT++) {
            const rU = rE(),
              rV = rN[wC(0x509)](rO);
            rO += 0x4;
            const rW = rV * 0x64,
              rX = rW >= 0x1 ? rW[wC(0xbca)](0x2) : rW[wC(0xbca)](0x5),
              rY = nR(
                wC(0x37c) +
                  (rT + 0x1) +
                  ".\x20" +
                  rU +
                  wC(0xd30) +
                  rX +
                  wC(0x1ea)
              );
            rU === jw && rY[wC(0x292)][wC(0x1ee)]("me"),
              (rY[wC(0x8cd)] = function () {
                mA(rU);
              }),
              jQ[wC(0xcee)](rY);
          }
        }
        k1[wC(0x90b)] = "";
        const rS = rN[wC(0x7d4)](rO);
        (rO += 0x2), (k0 = {});
        if (rS === 0x0)
          (jP[wC(0x90b)] = wC(0xb4f)), (k1[wC(0x5c6)][wC(0x50f)] = wC(0x5a4));
        else {
          const rZ = {};
          jP[wC(0x90b)] = "";
          for (let s0 = 0x0; s0 < rS; s0++) {
            const s1 = rN[wC(0x7d4)](rO);
            rO += 0x2;
            const s2 = rN[wC(0x6d5)](rO);
            (rO += 0x4), (k0[s1] = s2);
            const s3 = dB[s1],
              s4 = nR(
                wC(0x47e) +
                  s3[wC(0x5b6)] +
                  wC(0x5ad) +
                  qB(s3) +
                  wC(0x22f) +
                  s2 +
                  wC(0xb2e)
              );
            (s4[wC(0x951)] = jV),
              jZ(s4),
              (s4[wC(0x7e1)] = s3),
              jP[wC(0xcee)](s4),
              (rZ[s3[wC(0x5b6)]] = (rZ[s3[wC(0x5b6)]] || 0x0) + s2);
          }
          oe(jP), (k1[wC(0x5c6)][wC(0x50f)] = ""), oF(k1, rZ);
        }
      }
      const rN = new DataView(rC[ws(0xe4b)]);
      pF += rN[ws(0x86e)];
      let rO = 0x0;
      const rP = rN[ws(0x66e)](rO++);
      switch (rP) {
        case cH[ws(0x818)]:
          {
            const sb = rN[ws(0x7d4)](rO);
            rO += 0x2;
            for (let sc = 0x0; sc < sb; sc++) {
              const sd = rN[ws(0x7d4)](rO);
              rO += 0x2;
              const se = rN[ws(0x6d5)](rO);
              (rO += 0x4), n6(sd, se);
            }
          }
          break;
        case cH[ws(0xa77)]:
          rM();
          break;
        case cH[ws(0xe54)]:
          kD[ws(0x292)][ws(0x1ee)](ws(0x695)), hU(), (jH = pQ + 0x1f4);
          break;
        case cH[ws(0xe0f)]:
          (ml[ws(0x90b)] = ws(0x9fe)), ml[ws(0xcee)](mo), (mp = ![]);
          break;
        case cH[ws(0xd2d)]: {
          const sf = dB[rN[ws(0x7d4)](rO)];
          rO += 0x2;
          const sg = rN[ws(0x6d5)](rO);
          (rO += 0x4),
            (ml[ws(0x90b)] =
              ws(0x74a) +
              sf[ws(0x5b6)] +
              "\x22\x20" +
              qB(sf) +
              ws(0x22f) +
              ka(sg) +
              ws(0x537));
          const sh = ml[ws(0x546)](ws(0x47d));
          (sh[ws(0x7e1)] = sf),
            (sh[ws(0x8cd)] = function () {
              const wD = ws;
              n6(sf["id"], sg), (this[wD(0x8cd)] = null), mo[wD(0x8cd)]();
            }),
            (mp = ![]);
          break;
        }
        case cH[ws(0xdd0)]: {
          const si = rN[ws(0x66e)](rO++),
            sj = rN[ws(0x6d5)](rO);
          rO += 0x4;
          const sk = rE();
          (ml[ws(0x90b)] =
            ws(0x9cf) +
            sk +
            ws(0x743) +
            hO[ws(0x7cc)] +
            ws(0xbf1) +
            ka(sj) +
            "\x20" +
            hM[si] +
            ws(0x743) +
            hP[si] +
            ws(0xe5f)),
            (ml[ws(0x546)](ws(0x231))[ws(0x8cd)] = function () {
              mA(sk);
            }),
            ml[ws(0xcee)](mo),
            (mp = ![]);
          break;
        }
        case cH[ws(0xaa5)]:
          (ml[ws(0x90b)] = ws(0xcaa)), ml[ws(0xcee)](mo), (mp = ![]);
          break;
        case cH[ws(0x72a)]:
          hJ(ws(0xde8));
          break;
        case cH[ws(0x5c1)]:
          rL();
          break;
        case cH[ws(0x9ca)]:
          hJ(ws(0xd37)), hb(ws(0xd37));
          break;
        case cH[ws(0x8f8)]:
          hJ(ws(0xd86)), hb(ws(0x461));
          break;
        case cH[ws(0x4ee)]:
          hJ(ws(0xcd7));
          break;
        case cH[ws(0x4f4)]:
          rJ();
          break;
        case cH[ws(0x3c5)]:
          hb(ws(0x2fc));
          break;
        case cH[ws(0xae4)]:
          hb(ws(0x4da), hO[ws(0x4c5)]), hI(hG);
          break;
        case cH[ws(0x519)]:
          const rQ = rN[ws(0x7d4)](rO);
          rO += 0x2;
          const rR = [];
          for (let sl = 0x0; sl < rQ; sl++) {
            const sm = rN[ws(0x6d5)](rO);
            rO += 0x4;
            const sn = rE(),
              so = rE(),
              sp = rE();
            rR[ws(0x9db)]([sn || ws(0x551) + sm, so, sp]);
          }
          jn(rR);
          break;
        case cH[ws(0xa81)]:
          for (let sq in mr) {
            const sr = rN[ws(0x6d5)](rO);
            (rO += 0x4), ms[sq][ws(0xb91)](sr);
          }
          break;
        case cH[ws(0xca8)]:
          const rS = rN[ws(0x66e)](rO++),
            rT = rN[ws(0x6d5)](rO++),
            rU = {};
          (rU[ws(0xc67)] = rS), (rU[ws(0x852)] = rT), (p4 = rU);
          break;
        case cH[ws(0x89d)]:
          (i1[ws(0x5c6)][ws(0x50f)] = i7 ? "" : ws(0x5a4)),
            (i4[ws(0x5c6)][ws(0x50f)] = !i7 ? "" : ws(0x5a4)),
            (hZ[ws(0x5c6)][ws(0x50f)] = ""),
            (ko[ws(0x5c6)][ws(0x50f)] = ws(0x5a4)),
            (hX = !![]),
            kC[ws(0x292)][ws(0x1ee)](ws(0x695)),
            kB[ws(0x292)][ws(0xae0)](ws(0x695)),
            j2(),
            m2(![]),
            (iy = rN[ws(0x6d5)](rO)),
            (rO += 0x4),
            (jw = rE()),
            hI(jw),
            (jz = rN[ws(0x66e)](rO++)),
            jC(),
            (j3 = rN[ws(0x7d4)](rO)),
            (rO += 0x2),
            (j6 = rN[ws(0x66e)](rO++)),
            (j5 = j3 / j6),
            (j4 = j3 / 0x3),
            (oH = rK()),
            oR(),
            oU(),
            (iO = d4(oI)),
            (iP = iO * 0x2),
            (iQ = Array(iP)),
            (iR = {}),
            (iS = d6());
          for (let ss = 0x0; ss < iP; ss++) {
            const st = rN[ws(0x7d4)](rO) - 0x1;
            rO += 0x2;
            if (st < 0x0) continue;
            iQ[ss] = dB[st];
          }
          nM(), nU();
          const rV = rN[ws(0x7d4)](rO);
          rO += 0x2;
          for (let su = 0x0; su < rV; su++) {
            const sv = rN[ws(0x7d4)](rO);
            rO += 0x2;
            const sw = nW(eJ[sv]);
            sw[ws(0x951)] = m4;
          }
          iT = {};
          while (rO < rN[ws(0x86e)]) {
            const sx = rN[ws(0x7d4)](rO);
            rO += 0x2;
            const sy = rN[ws(0x6d5)](rO);
            (rO += 0x4), (iT[sx] = sy);
          }
          oc(), n7();
          break;
        case cH[ws(0x676)]:
          const rW = rN[ws(0x66e)](rO++),
            rX = hK[rW] || ws(0x9d1);
          console[ws(0x8b7)](ws(0x195) + rX + ")"),
            (kg = rW === cQ[ws(0xe0b)] || rW === cQ[ws(0xdc6)]);
          !kg &&
            iu(ws(0x655), ws(0x75b) + rX, rW === cQ[ws(0x1c9)] ? 0xa : 0x3c);
          break;
        case cH[ws(0xe48)]:
          (hf[ws(0x5c6)][ws(0x50f)] = ko[ws(0x5c6)][ws(0x50f)] = ws(0x5a4)),
            kH(!![]),
            jv[ws(0x292)][ws(0x1ee)](ws(0x695)),
            jh(),
            (pj[ws(0x5c6)][ws(0x50f)] = "");
          for (let sz in iR) {
            iR[sz][ws(0x2ba)] = 0x0;
          }
          (jJ = pQ),
            (no = {}),
            (ng = 0x1),
            (nh = 0x1),
            (ne = 0x0),
            (nf = 0x0),
            mH(),
            (nb = cX[ws(0x72f)]),
            (jF = pQ);
          break;
        case cH[ws(0x72c)]:
          (pE = pQ - jF), (jF = pQ), qa[ws(0xb91)](rF()), qc[ws(0xb91)](rF());
          if (jz) {
            const sA = rN[ws(0x66e)](rO++);
            (jK = sA & 0x80), (jL = f5[sA & 0x7f]);
          } else (jK = ![]), (jL = null), qd[ws(0xb91)](rF());
          (pL = 0x1 + cV[rN[ws(0x66e)](rO++)] / 0x64),
            (iX = (cZ / 0x2) * pL),
            (iY = (d0 / 0x2) * pL);
          const rY = rN[ws(0x7d4)](rO);
          rO += 0x2;
          for (let sB = 0x0; sB < rY; sB++) {
            const sC = rN[ws(0x6d5)](rO);
            rO += 0x4;
            let sD = iw[sC];
            if (sD) {
              if (sD[ws(0xab3)]) {
                sD[ws(0x5d0)] = rN[ws(0x66e)](rO++) - 0x1;
                continue;
              }
              const sE = rN[ws(0x66e)](rO++);
              sE & 0x1 &&
                ((sD["nx"] = rI()), (sD["ny"] = rI()), (sD[ws(0x4ec)] = 0x0));
              sE & 0x2 &&
                ((sD[ws(0x767)] = eR(rN[ws(0x66e)](rO++))),
                (sD[ws(0x4ec)] = 0x0));
              if (sE & 0x4) {
                const sF = rF();
                if (sF < sD[ws(0x890)]) iU(sD, sF), (sD[ws(0x565)] = 0x1);
                else sF > sD[ws(0x890)] && (sD[ws(0x565)] = 0x0);
                (sD[ws(0x890)] = sF), (sD[ws(0x4ec)] = 0x0);
              }
              sE & 0x8 &&
                ((sD[ws(0x671)] = 0x1),
                (sD[ws(0x4ec)] = 0x0),
                sD === iz && (pw = 0x1));
              sE & 0x10 && ((sD[ws(0xa6d)] = rN[ws(0x7d4)](rO)), (rO += 0x2));
              sE & 0x20 && (sD[ws(0x2c4)] = rN[ws(0x66e)](rO++));
              sE & 0x40 && rG(sD);
              if (sE & 0x80) {
                if (sD[ws(0x980)])
                  (sD[ws(0x921)] = rN[ws(0x7d4)](rO)), (rO += 0x2);
                else {
                  const sG = rF();
                  sG > sD[ws(0xa7f)] && iU(sD), (sD[ws(0xa7f)] = sG);
                }
              }
              sD[ws(0x980)] && sE & 0x4 && (sD[ws(0x444)] = rF()),
                (sD["ox"] = sD["x"]),
                (sD["oy"] = sD["y"]),
                (sD[ws(0x945)] = sD[ws(0xa8e)]),
                (sD[ws(0x922)] = sD[ws(0x11f)]),
                (sD[ws(0x32a)] = sD[ws(0x911)]),
                (sD[ws(0x223)] = 0x0);
            } else {
              const sH = rN[ws(0x66e)](rO++);
              if (sH === cR[ws(0x323)]) {
                let sM = rN[ws(0x66e)](rO++);
                const sN = {};
                (sN[ws(0x457)] = []), (sN["a"] = 0x1);
                const sO = sN;
                while (sM--) {
                  const sP = rI(),
                    sQ = rI();
                  sO[ws(0x457)][ws(0x9db)]([sP, sQ]);
                }
                iN(sO), (pw = 0x1), iG[ws(0x9db)](sO);
                continue;
              }
              const sI = hL[sH],
                sJ = rI(),
                sK = rI(),
                sL = sH === cR[ws(0x434)];
              if (sH === cR[ws(0xbe7)] || sH === cR[ws(0x80b)] || sL) {
                const sR = rN[ws(0x7d4)](rO);
                (rO += 0x2),
                  (sD = new lL(sH, sC, sJ, sK, sR)),
                  sL &&
                    ((sD[ws(0xab3)] = !![]),
                    (sD[ws(0x5d0)] = rN[ws(0x66e)](rO++) - 0x1));
              } else {
                if (sH === cR[ws(0x524)]) {
                  const sS = rN[ws(0x7d4)](rO);
                  (rO += 0x2), (sD = new lO(sC, sJ, sK, sS));
                } else {
                  const sT = eR(rN[ws(0x66e)](rO++)),
                    sU = rN[ws(0x7d4)](rO);
                  rO += 0x2;
                  if (sH === cR[ws(0xd62)]) {
                    const sV = rF(),
                      sW = rN[ws(0x66e)](rO++);
                    (sD = new lU(sC, sJ, sK, sT, sV, sW, sU)),
                      rG(sD),
                      (sD[ws(0x921)] = rN[ws(0x7d4)](rO)),
                      (rO += 0x2),
                      (sD[ws(0x5ef)] = rE()),
                      (sD[ws(0x5a6)] = rE()),
                      (sD[ws(0x444)] = rF());
                    if (iy === sC) iz = sD;
                    else {
                      if (jz) {
                        const sX = pW();
                        (sX[ws(0xcc4)] = sD), pO[ws(0x9db)](sX);
                      }
                    }
                  } else {
                    if (sI[ws(0xdb3)](ws(0x7e1)))
                      sD = new lH(sC, sH, sJ, sK, sT, sU);
                    else {
                      const sY = rF(),
                        sZ = rN[ws(0x66e)](rO++),
                        t0 = sZ >> 0x4,
                        t1 = sZ & 0x1,
                        t2 = sZ & 0x2,
                        t3 = rF();
                      (sD = new lH(sC, sH, sJ, sK, sT, sU, sY)),
                        (sD[ws(0x5b6)] = t0),
                        (sD[ws(0x160)] = t1),
                        (sD[ws(0xadb)] = t2),
                        (sD[ws(0xa7f)] = t3),
                        (sD[ws(0xcb6)] = hM[t0]);
                    }
                  }
                }
              }
              (iw[sC] = sD), ix[ws(0x9db)](sD);
            }
          }
          iz &&
            ((iV = iz["nx"]),
            (iW = iz["ny"]),
            (q5[ws(0x5c6)][ws(0x50f)] = ""),
            q7(q5, iz["nx"], iz["ny"]));
          const rZ = rN[ws(0x7d4)](rO);
          rO += 0x2;
          for (let t4 = 0x0; t4 < rZ; t4++) {
            const t5 = rN[ws(0x6d5)](rO);
            (rO += 0x4), iZ(t5);
          }
          const s0 = rN[ws(0x66e)](rO++);
          for (let t6 = 0x0; t6 < s0; t6++) {
            const t7 = rN[ws(0x6d5)](rO);
            rO += 0x4;
            const t8 = iw[t7];
            if (t8) {
              (t8[ws(0x812)] = iz), n6(t8[ws(0x7e1)]["id"], 0x1), iZ(t7);
              if (!oD[t8[ws(0x7e1)]["id"]]) oD[t8[ws(0x7e1)]["id"]] = 0x0;
              oD[t8[ws(0x7e1)]["id"]]++;
            }
          }
          const s1 = rN[ws(0x66e)](rO++);
          for (let t9 = 0x0; t9 < s1; t9++) {
            const ta = rN[ws(0x66e)](rO++),
              tb = rF(),
              tc = iR[ta];
            (tc[ws(0x73d)] = tb), tb === 0x0 && (tc[ws(0x2ba)] = 0x0);
          }
          (iJ = rN[ws(0x7d4)](rO)), (rO += 0x2);
          const s2 = rN[ws(0x7d4)](rO);
          (rO += 0x2),
            iF[ws(0x3b6)](
              ws(0x8ae),
              ki(iJ, ws(0x4cd)) + ",\x20" + ki(s2, ws(0x331))
            );
          const s3 = Math[ws(0x585)](0xa, iJ);
          if (iI) {
            const td = rN[ws(0x66e)](rO++),
              te = td >> 0x4,
              tf = td & 0xf,
              tg = rN[ws(0x66e)](rO++);
            for (let ti = 0x0; ti < tf; ti++) {
              const tj = rN[ws(0x66e)](rO++);
              (iH[tj][ws(0x644)] = rN[ws(0x6d5)](rO)), (rO += 0x4);
            }
            const th = [];
            for (let tk = 0x0; tk < tg; tk++) {
              th[ws(0x9db)](rN[ws(0x66e)](rO++));
            }
            th[ws(0xcad)](function (tl, tm) {
              return tm - tl;
            });
            for (let tl = 0x0; tl < tg; tl++) {
              const tm = th[tl];
              iH[tm]["el"][ws(0xae0)](), iH[ws(0x8ea)](tm, 0x1);
            }
            for (let tn = 0x0; tn < te; tn++) {
              rH();
            }
            iH[ws(0xcad)](function (to, tp) {
              const wE = ws;
              return tp[wE(0x644)] - to[wE(0x644)];
            });
          } else {
            iH[ws(0xc2f)] = 0x0;
            for (let to = 0x0; to < s3; to++) {
              rH();
            }
            iI = !![];
          }
          iM();
          const s4 = rN[ws(0x66e)](rO++);
          for (let tp = 0x0; tp < s4; tp++) {
            const tq = rN[ws(0x7d4)](rO);
            (rO += 0x2), nW(eJ[tq]);
          }
          const s5 = rN[ws(0x7d4)](rO);
          rO += 0x2;
          for (let tr = 0x0; tr < s5; tr++) {
            const ts = rN[ws(0x66e)](rO++),
              tt = ts >> 0x7,
              tu = ts & 0x7f;
            if (tu === cP[ws(0x2f8)]) {
              const ty = rN[ws(0x66e)](rO++),
                tz = rN[ws(0x66e)](rO++) - 0x1;
              let tA = null,
                tB = 0x0;
              if (tt) {
                const tD = rN[ws(0x6d5)](rO);
                rO += 0x4;
                const tE = rE();
                (tA = tE || ws(0x551) + tD), (tB = rN[ws(0x66e)](rO++));
              }
              const tC = j9[ty];
              nm(
                ws(0x2f8),
                null,
                "⚡\x20" +
                  j8[ty] +
                  ws(0x7a0) +
                  (tz < 0x0
                    ? ws(0x2a5)
                    : tz === 0x0
                    ? ws(0x6eb)
                    : ws(0x807) + (tz + 0x1) + "!"),
                tC
              );
              tA &&
                nl(ws(0x2f8), [
                  [ws(0x624), "🏆"],
                  [tC, tA + ws(0x987)],
                  [hO[ws(0xde5)], tB + ws(0xb05)],
                  [tC, ws(0xdde)],
                ]);
              continue;
            }
            const tv = rN[ws(0x6d5)](rO);
            rO += 0x4;
            const tw = rE(),
              tx = tw || ws(0x551) + tv;
            if (tu === cP[ws(0x688)]) {
              let tF = rE();
              pc[ws(0x62a)] && (tF = fa(tF));
              if (jO(tF, tv)) nm(tv, tx, tF, tv === iy ? nj["me"] : void 0x0);
              else tv === iy && nm(-0x1, null, ws(0x253), nj[ws(0x1be)]);
            } else {
              if (tu === cP[ws(0xca8)]) {
                const tG = rN[ws(0x7d4)](rO);
                rO += 0x2;
                const tH = rN[ws(0x6d5)](rO);
                rO += 0x4;
                const tI = rN[ws(0x6d5)](rO);
                rO += 0x4;
                const tJ = dB[tG],
                  tK = hM[tJ[ws(0x5b6)]],
                  tL = hM[tJ[ws(0x368)][ws(0x5b6)]],
                  tM = tI === 0x0;
                if (tM)
                  nl(ws(0xca8), [
                    [nj[ws(0x235)], tx, !![]],
                    [nj[ws(0x235)], ws(0x629)],
                    [
                      hP[tJ[ws(0x5b6)]],
                      ka(tH) + "\x20" + tK + "\x20" + tJ[ws(0x5ee)],
                    ],
                  ]);
                else {
                  const tN = hP[tJ[ws(0x368)][ws(0x5b6)]];
                  nl(ws(0xca8), [
                    [tN, "⭐"],
                    [tN, tx, !![]],
                    [tN, ws(0xadd)],
                    [
                      tN,
                      ka(tI) +
                        "\x20" +
                        tL +
                        "\x20" +
                        tJ[ws(0x5ee)] +
                        ws(0xb0a) +
                        ka(tH) +
                        "\x20" +
                        tK +
                        "\x20" +
                        tJ[ws(0x5ee)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tO = rN[ws(0x7d4)](rO);
                rO += 0x2;
                const tP = eJ[tO],
                  tQ = hM[tP[ws(0x5b6)]],
                  tR = tu === cP[ws(0x48f)],
                  tS = hP[tP[ws(0x5b6)]];
                nl(ws(0xa90), [
                  [
                    tS,
                    "" +
                      (tR ? ws(0x2f3) : "") +
                      ju(tQ) +
                      "\x20" +
                      tQ +
                      "\x20" +
                      tP[ws(0x5ee)] +
                      ws(0x724) +
                      jt(tR) +
                      ws(0xc43),
                  ],
                  [tS, tx + "!", !![]],
                ]);
              }
            }
          }
          const s6 = rN[ws(0x66e)](rO++),
            s7 = s6 & 0xf,
            s8 = s6 >> 0x4;
          let s9 = ![];
          s7 !== j7["id"] &&
            (j7 && (j7[ws(0xba9)] = !![]),
            (s9 = !![]),
            je(s7),
            k9(qb, ws(0xbe8) + ja[s7] + ws(0xdab)));
          const sa = rN[ws(0x66e)](rO++);
          if (sa > 0x0) {
            let tT = ![];
            for (let tU = 0x0; tU < sa; tU++) {
              const tV = rN[ws(0x7d4)](rO);
              rO += 0x2;
              const tW = rN[ws(0x7d4)](rO);
              (rO += 0x2), (j7[tV] = tW);
              if (tW > 0x0) {
                if (!j7[ws(0x2e8)][tV]) {
                  tT = !![];
                  const tX = nW(eJ[tV], !![]);
                  (tX[ws(0x471)] = !![]),
                    (tX[ws(0x53d)] = ![]),
                    tX[ws(0x292)][ws(0xae0)](ws(0x77a)),
                    (tX[ws(0xa4f)] = nR(ws(0x54e))),
                    tX[ws(0xcee)](tX[ws(0xa4f)]),
                    (tX[ws(0xbcc)] = tV);
                  let tY = -0x1;
                  (tX["t"] = s9 ? 0x1 : 0x0),
                    (tX[ws(0xba9)] = ![]),
                    (tX[ws(0xcca)] = 0x3e8),
                    (tX[ws(0x72c)] = function () {
                      const wF = ws,
                        tZ = tX["t"];
                      if (tZ === tY) return;
                      tY = tZ;
                      const u0 = jg(Math[wF(0x585)](0x1, tZ / 0.5)),
                        u1 = jg(
                          Math[wF(0x9da)](
                            0x0,
                            Math[wF(0x585)]((tZ - 0.5) / 0.5)
                          )
                        );
                      (tX[wF(0x5c6)][wF(0x14b)] =
                        wF(0x431) + -0x168 * (0x1 - u1) + wF(0x4df) + u1 + ")"),
                        (tX[wF(0x5c6)][wF(0xcd6)] = -1.12 * (0x1 - u0) + "em");
                    }),
                    jc[ws(0x9db)](tX),
                    j7[ws(0x3bb)][ws(0xcee)](tX),
                    (j7[ws(0x2e8)][tV] = tX);
                }
                p6(j7[ws(0x2e8)][tV][ws(0xa4f)], tW);
              } else {
                const tZ = j7[ws(0x2e8)][tV];
                tZ && ((tZ[ws(0xba9)] = !![]), delete j7[ws(0x2e8)][tV]),
                  delete j7[tV];
              }
            }
            tT &&
              [...j7[ws(0x3bb)][ws(0x476)]]
                [ws(0xcad)]((u0, u1) => {
                  const wG = ws;
                  return -of(eJ[u0[wG(0xbcc)]], eJ[u1[wG(0xbcc)]]);
                })
                [ws(0xa40)]((u0) => {
                  const wH = ws;
                  j7[wH(0x3bb)][wH(0xcee)](u0);
                });
          }
          (j7[ws(0x40a)] = pQ), (j7[ws(0x9d7)] = s8);
          if (s8 !== cS[ws(0x5a4)]) {
            (j7[ws(0xc88)][ws(0x5c6)][ws(0x50f)] = ""),
              (j7[ws(0xbe0)] = j7[ws(0xe2c)]),
              (j7[ws(0x285)] = rF());
            if (j7[ws(0x55c)] !== jK) {
              const u0 = jK ? ws(0x1ee) : ws(0xae0);
              j7[ws(0x6cf)][ws(0x292)][u0](ws(0x4cc)),
                j7[ws(0x6cf)][ws(0x292)][u0](ws(0xa18)),
                j7[ws(0x9d8)][ws(0x292)][u0](ws(0xb22)),
                (j7[ws(0x55c)] = jK);
            }
            switch (s8) {
              case cS[ws(0xced)]:
                k9(j7[ws(0x4f7)], ws(0xc7b));
                break;
              case cS[ws(0x2f8)]:
                const u1 = rN[ws(0x66e)](rO++) + 0x1;
                k9(j7[ws(0x4f7)], ws(0x930) + u1);
                break;
              case cS[ws(0xe63)]:
                k9(j7[ws(0x4f7)], ws(0x251));
                break;
              case cS[ws(0xbd9)]:
                k9(j7[ws(0x4f7)], ws(0x600));
                break;
              case cS[ws(0xa7d)]:
                k9(j7[ws(0x4f7)], ws(0x17b));
                break;
            }
          } else j7[ws(0xc88)][ws(0x5c6)][ws(0x50f)] = ws(0x5a4);
          if (rN[ws(0x86e)] - rO > 0x0) {
            iz &&
              (j1(qu),
              (qu[ws(0x167)] = ![]),
              (q6[ws(0x5c6)][ws(0x50f)] = ""),
              (q5[ws(0x5c6)][ws(0x50f)] = ws(0x5a4)),
              q7(q6, iz["nx"], iz["ny"]));
            qv[ws(0x7ec)](), (iz = null), jv[ws(0x292)][ws(0xae0)](ws(0x695));
            const u2 = rN[ws(0x7d4)](rO) - 0x1;
            rO += 0x2;
            const u3 = rN[ws(0x6d5)](rO);
            rO += 0x4;
            const u4 = rN[ws(0x6d5)](rO);
            rO += 0x4;
            const u5 = rN[ws(0x6d5)](rO);
            rO += 0x4;
            const u6 = rN[ws(0x6d5)](rO);
            (rO += 0x4),
              k9(k4, kb(u4)),
              k9(k3, ka(u3)),
              k9(k5, ka(u5)),
              k9(k7, ka(u6));
            let u7 = null;
            rN[ws(0x86e)] - rO > 0x0 && ((u7 = rN[ws(0x6d5)](rO)), (rO += 0x4));
            u7 !== null
              ? (k9(k8, ka(u7)), (k8[ws(0xe38)][ws(0x5c6)][ws(0x50f)] = ""))
              : (k8[ws(0xe38)][ws(0x5c6)][ws(0x50f)] = ws(0x5a4));
            if (u2 === -0x1) k9(k6, ws(0x723));
            else {
              const u8 = eJ[u2];
              k9(k6, hM[u8[ws(0x5b6)]] + "\x20" + u8[ws(0x5ee)]);
            }
            oE(), (oD = {}), (ko[ws(0x5c6)][ws(0x50f)] = ""), hh();
          }
          break;
        default:
          console[ws(0x8b7)](ws(0xb82) + rP);
      }
    }
    var k3 = document[ux(0x546)](ux(0x91d)),
      k4 = document[ux(0x546)](ux(0xa67)),
      k5 = document[ux(0x546)](ux(0x86c)),
      k6 = document[ux(0x546)](ux(0xb45)),
      k7 = document[ux(0x546)](ux(0x99a)),
      k8 = document[ux(0x546)](ux(0x312));
    function k9(rC, rD) {
      const wI = ux;
      rC[wI(0x3b6)](wI(0x8ae), rD);
    }
    function ka(rC) {
      const wJ = ux;
      return rC[wJ(0x4bf)](wJ(0xb71));
    }
    function kb(rC, rD) {
      const wK = ux,
        rE = [
          Math[wK(0xa6f)](rC / (0x3e8 * 0x3c * 0x3c)),
          Math[wK(0xa6f)]((rC % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wK(0xa6f)]((rC % (0x3e8 * 0x3c)) / 0x3e8),
        ],
        rF = ["h", "m", "s"];
      let rG = "";
      const rH = rD ? 0x1 : 0x2;
      for (let rI = 0x0; rI <= rH; rI++) {
        const rJ = rE[rI];
        (rJ > 0x0 || rI == rH) && (rG += rJ + rF[rI] + "\x20");
      }
      return rG;
    }
    const kc = {
      [cR[ux(0xba7)]]: ux(0x85b),
      [cR[ux(0x459)]]: ux(0x752),
      [cR[ux(0xca2)]]: ux(0x752),
      [cR[ux(0x404)]]: ux(0x679),
      [cR[ux(0x449)]]: ux(0x679),
      [cR[ux(0xd84)]]: ux(0x41d),
      [cR[ux(0x232)]]: ux(0x41d),
      [cR[ux(0x500)]]: ux(0x6ee),
      [cR[ux(0x2e5)]]: ux(0x157),
    };
    kc["0"] = ux(0x723);
    var kd = kc;
    for (let rC in cR) {
      const rD = cR[rC];
      if (kd[rD]) continue;
      const rE = ke(rC);
      kd[rD] = rE[ux(0xbb7)](ux(0xda7), ux(0x68c));
    }
    function ke(rF) {
      const wL = ux,
        rG = rF[wL(0xbb7)](/([A-Z])/g, wL(0x708)),
        rH = rG[wL(0xdac)](0x0)[wL(0x3fc)]() + rG[wL(0x320)](0x1);
      return rH;
    }
    var kf = null,
      kg = !![];
    function kh() {
      const wM = ux;
      console[wM(0x8b7)](wM(0x520)),
        hU(),
        jv[wM(0x292)][wM(0xae0)](wM(0x695)),
        kg &&
          (kl[wM(0x5c6)][wM(0x50f)] === wM(0x5a4)
            ? (clearTimeout(kf),
              kD[wM(0x292)][wM(0x1ee)](wM(0x695)),
              (kf = setTimeout(function () {
                const wN = wM;
                kD[wN(0x292)][wN(0xae0)](wN(0x695)),
                  (kl[wN(0x5c6)][wN(0x50f)] = ""),
                  kC[wN(0x409)](kp),
                  (ko[wN(0x5c6)][wN(0x50f)] = kn[wN(0x5c6)][wN(0x50f)] =
                    wN(0x5a4)),
                  hh(),
                  hW(hV[wN(0x112)]);
              }, 0x1f4)))
            : (kD[wM(0x292)][wM(0xae0)](wM(0x695)), hW(hV[wM(0x112)])));
    }
    function ki(rF, rG) {
      return rF + "\x20" + rG + (rF === 0x1 ? "" : "s");
    }
    var kj = document[ux(0xd8f)](ux(0xca1)),
      kk = kj[ux(0x3b7)]("2d"),
      kl = document[ux(0x546)](ux(0xe3b)),
      km = document[ux(0x546)](ux(0x42a)),
      kn = document[ux(0x546)](ux(0x923));
    kn[ux(0x5c6)][ux(0x50f)] = ux(0x5a4);
    var ko = document[ux(0x546)](ux(0xc2c));
    ko[ux(0x5c6)][ux(0x50f)] = ux(0x5a4);
    var kp = document[ux(0x546)](ux(0x5e0)),
      kq = document[ux(0x546)](ux(0x23c)),
      kr = document[ux(0x546)](ux(0xd7d));
    function ks() {
      const wO = ux;
      kr[wO(0x90b)] = "";
      for (let rF = 0x0; rF < 0x32; rF++) {
        const rG = kt[rF],
          rH = nR(wO(0x5c4) + rF + wO(0x40f)),
          rI = rH[wO(0x546)](wO(0xa17));
        if (rG)
          for (let rJ = 0x0; rJ < rG[wO(0xc2f)]; rJ++) {
            const rK = rG[rJ],
              rL = dE[rK];
            if (!rL) rI[wO(0xcee)](nR(wO(0xaef)));
            else {
              const rM = nR(
                wO(0x47e) + rL[wO(0x5b6)] + "\x22\x20" + qB(rL) + wO(0xbb4)
              );
              (rM[wO(0x7e1)] = rL),
                (rM[wO(0x951)] = kq),
                jZ(rM),
                rI[wO(0xcee)](rM);
            }
          }
        else rI[wO(0x90b)] = wO(0xaef)[wO(0xa08)](0x5);
        (rH[wO(0x546)](wO(0x661))[wO(0x8cd)] = function () {
          kv(rF);
        }),
          (rH[wO(0x546)](wO(0x6ce))[wO(0x8cd)] = function () {
            ky(rF);
          }),
          kr[wO(0xcee)](rH);
      }
    }
    var kt = ku();
    function ku() {
      const wP = ux;
      try {
        const rF = JSON[wP(0x96e)](hC[wP(0x44a)]);
        for (const rG in rF) {
          !Array[wP(0x742)](rF[rG]) && delete rF[rG];
        }
        return rF;
      } catch {
        return {};
      }
    }
    function kv(rF) {
      const wQ = ux,
        rG = [],
        rH = nA[wQ(0xa26)](wQ(0xcbc));
      for (let rI = 0x0; rI < rH[wQ(0xc2f)]; rI++) {
        const rJ = rH[rI],
          rK = rJ[wQ(0x476)][0x0];
        !rK ? (rG[rI] = null) : (rG[rI] = rK[wQ(0x7e1)][wQ(0x358)]);
      }
      (kt[rF] = rG),
        (hC[wQ(0x44a)] = JSON[wQ(0xe67)](kt)),
        ks(),
        hb(wQ(0x1c2) + rF + "!");
    }
    function kw() {
      const wR = ux;
      return nA[wR(0xa26)](wR(0xcbc));
    }
    document[ux(0x546)](ux(0x775))[ux(0x8cd)] = function () {
      kx();
    };
    function kx() {
      const wS = ux,
        rF = kw();
      for (const rG of rF) {
        const rH = rG[wS(0x476)][0x0];
        if (!rH) continue;
        rH[wS(0xae0)](),
          iS[wS(0x9db)](rH[wS(0x13d)]),
          n6(rH[wS(0x7e1)]["id"], 0x1),
          im(new Uint8Array([cH[wS(0x559)], rG[wS(0x6d6)]]));
      }
    }
    function ky(rF) {
      const wT = ux;
      if (mL || mK[wT(0xc2f)] > 0x0) return;
      const rG = kt[rF];
      if (!rG) return;
      kx();
      const rH = kw(),
        rI = Math[wT(0x585)](rH[wT(0xc2f)], rG[wT(0xc2f)]);
      for (let rJ = 0x0; rJ < rI; rJ++) {
        const rK = rG[rJ],
          rL = dE[rK];
        if (!rL || !iT[rL["id"]]) continue;
        const rM = nR(
          wT(0x47e) + rL[wT(0x5b6)] + "\x22\x20" + qB(rL) + wT(0xbb4)
        );
        (rM[wT(0x7e1)] = rL),
          (rM[wT(0xbc8)] = !![]),
          (rM[wT(0x13d)] = iS[wT(0x526)]()),
          nQ(rM, rL),
          (iR[rM[wT(0x13d)]] = rM),
          rH[rJ][wT(0xcee)](rM),
          n6(rM[wT(0x7e1)]["id"], -0x1);
        const rN = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rN[wT(0xe51)](0x0, cH[wT(0x1b0)]),
          rN[wT(0x80f)](0x1, rM[wT(0x7e1)]["id"]),
          rN[wT(0xe51)](0x3, rJ),
          im(rN);
      }
      hb(wT(0x192) + rF + "!");
    }
    var kz = document[ux(0x546)](ux(0xc00)),
      kA = document[ux(0x546)](ux(0xa8b));
    kA[ux(0x8cd)] = function () {
      const wU = ux;
      kD[wU(0x292)][wU(0x1ee)](wU(0x695)),
        jz
          ? (kf = setTimeout(function () {
              const wV = wU;
              im(new Uint8Array([cH[wV(0xb5d)]]));
            }, 0x1f4))
          : (kf = setTimeout(function () {
              const wW = wU;
              kD[wW(0x292)][wW(0xae0)](wW(0x695)),
                (kn[wW(0x5c6)][wW(0x50f)] = ko[wW(0x5c6)][wW(0x50f)] =
                  wW(0x5a4)),
                (kl[wW(0x5c6)][wW(0x50f)] = ""),
                kC[wW(0x409)](kp),
                kC[wW(0x292)][wW(0x1ee)](wW(0x695)),
                jh();
            }, 0x1f4));
    };
    var kB = document[ux(0x546)](ux(0x83b)),
      kC = document[ux(0x546)](ux(0x9eb));
    kC[ux(0x292)][ux(0x1ee)](ux(0x695));
    var kD = document[ux(0x546)](ux(0x123)),
      kE = document[ux(0x546)](ux(0x63f)),
      kF = document[ux(0x546)](ux(0x38e));
    (kF[ux(0x1d6)] = hC[ux(0xe13)] || ""),
      (kF[ux(0xd27)] = cJ),
      (kF[ux(0x872)] = function () {
        const wX = ux;
        hC[wX(0xe13)] = this[wX(0x1d6)];
      });
    var kG;
    kE[ux(0x8cd)] = function () {
      if (!hX) return;
      kH();
    };
    function kH(rF = ![]) {
      const wY = ux;
      hack.toastFunc = hb;
      if(rF) hack.onload();
      hack.mobFunc = nW;
      hack.moblst = eN;
      if (kl[wY(0x5c6)][wY(0x50f)] === wY(0x5a4)) {
        kD[wY(0x292)][wY(0xae0)](wY(0x695));
        return;
      }
      clearTimeout(kG),
        kC[wY(0x292)][wY(0xae0)](wY(0x695)),
        (kG = setTimeout(() => {
          const wZ = wY;
          kD[wZ(0x292)][wZ(0x1ee)](wZ(0x695)),
            (kG = setTimeout(() => {
              const x0 = wZ;
              rF && kD[x0(0x292)][x0(0xae0)](x0(0x695)),
                (kl[x0(0x5c6)][x0(0x50f)] = x0(0x5a4)),
                (hf[x0(0x5c6)][x0(0x50f)] = x0(0x5a4)),
                (kn[x0(0x5c6)][x0(0x50f)] = ""),
                kn[x0(0xcee)](kp),
                ir(kF[x0(0x1d6)][x0(0x320)](0x0, cJ));
            }, 0x1f4));
        }, 0x64));
    }
    var kI = document[ux(0x546)](ux(0x3bf));
    function kJ(rF, rG, rH) {
      const x1 = ux,
        rI = {};
      (rI[x1(0x10b)] = x1(0x66f)), (rI[x1(0xbd8)] = !![]), (rH = rH || rI);
      const rJ = nR(
        x1(0x847) +
          rH[x1(0x10b)] +
          x1(0xb42) +
          rF +
          x1(0x95c) +
          (rH[x1(0xbd8)] ? x1(0xcb7) : "") +
          x1(0xbc7)
      );
      return (
        (rJ[x1(0x546)](x1(0x5ac))[x1(0x8cd)] = function () {
          const x2 = x1;
          rG(!![]), rJ[x2(0xae0)]();
        }),
        (rJ[x1(0x546)](x1(0xe3a))[x1(0x8cd)] = function () {
          const x3 = x1;
          rJ[x3(0xae0)](), rG(![]);
        }),
        kI[x1(0xcee)](rJ),
        rJ
      );
    }
    function kK() {
      function rF(rN, rO, rP, rQ, rR) {
        return rI(rQ - 0x20c, rP);
      }
      function rG() {
        const x4 = b,
          rN = [
            x4(0xa50),
            x4(0x515),
            x4(0xdd5),
            x4(0x120),
            x4(0xb36),
            x4(0x783),
            x4(0x45c),
            x4(0x84a),
            x4(0x2de),
            x4(0x803),
            x4(0xe3f),
            x4(0xbdf),
            x4(0xca0),
            x4(0x2e0),
            x4(0x965),
            x4(0x46d),
            x4(0xcfa),
            x4(0x151),
            x4(0x271),
            x4(0x7ad),
            x4(0xbb1),
            x4(0x7b5),
            x4(0x664),
            x4(0x134),
            x4(0xada),
            x4(0x7e1),
            x4(0x335),
            x4(0x840),
            x4(0xc4a),
            x4(0x45a),
            x4(0x897),
            x4(0x10d),
            x4(0x4ad),
            x4(0xd09),
            x4(0xdfa),
            x4(0x89f),
            x4(0x1ac),
            x4(0x479),
            x4(0x6b0),
            x4(0x5cc),
            x4(0x90d),
            x4(0xce1),
            x4(0xc10),
            x4(0x7ed),
            x4(0x52f),
            x4(0x740),
            x4(0x303),
            x4(0x255),
            x4(0x438),
            x4(0x2b6),
            x4(0xcbe),
            x4(0xb7a),
            x4(0x65d),
            x4(0xd5b),
            x4(0x1e7),
            x4(0x2ed),
            x4(0x765),
            x4(0xa02),
            x4(0x3c0),
            x4(0xc96),
            x4(0xd60),
            x4(0xc74),
            x4(0x37d),
            x4(0xbf9),
            x4(0x3d5),
            x4(0x227),
            x4(0x27d),
            x4(0xd2a),
            x4(0x84c),
            x4(0x282),
            x4(0x349),
            x4(0x3f6),
            x4(0x92e),
            x4(0x867),
            x4(0xac6),
            x4(0x8b2),
            x4(0x496),
            x4(0x39c),
            x4(0xa4b),
            x4(0x8f5),
            x4(0xcd3),
            x4(0x690),
            x4(0x91a),
            x4(0xc45),
            x4(0x1e8),
            x4(0xde2),
            x4(0x6c2),
            x4(0x5cd),
            x4(0x3e9),
          ];
        return (
          (rG = function () {
            return rN;
          }),
          rG()
        );
      }
      function rH(rN, rO, rP, rQ, rR) {
        return rI(rO - 0x322, rP);
      }
      function rI(rN, rO) {
        const rP = rG();
        return (
          (rI = function (rQ, rR) {
            rQ = rQ - (0x12b9 * 0x1 + 0x2f5 * 0xb + -0x3263);
            let rS = rP[rQ];
            return rS;
          }),
          rI(rN, rO)
        );
      }
      function rJ(rN, rO, rP, rQ, rR) {
        return rI(rP - 0x398, rO);
      }
      (function (rN, rO) {
        const x5 = b;
        function rP(rV, rW, rX, rY, rZ) {
          return rI(rV - -0x202, rW);
        }
        function rQ(rV, rW, rX, rY, rZ) {
          return rI(rW - -0x361, rY);
        }
        const rR = rN();
        function rS(rV, rW, rX, rY, rZ) {
          return rI(rW - -0x1c0, rY);
        }
        function rT(rV, rW, rX, rY, rZ) {
          return rI(rY - 0x1f1, rZ);
        }
        function rU(rV, rW, rX, rY, rZ) {
          return rI(rZ - 0x352, rY);
        }
        while (!![]) {
          try {
            const rV =
              -parseInt(rP(-0xfd, -0x103, -0xdd, -0xfe, -0x10a)) /
                (-0x14de + 0x14ac + -0x33 * -0x1) +
              (parseInt(rP(-0xf2, -0x102, -0x107, -0x110, -0x114)) /
                (-0xe4b * -0x1 + 0x2 * 0x1039 + -0x2ebb)) *
                (parseInt(rU(0x413, 0x428, 0x42c, 0x416, 0x43b)) /
                  (-0x1ec7 * 0x1 + -0x19f * -0x14 + -0x1a2)) +
              parseInt(rT(0x300, 0x307, 0x2f6, 0x30d, 0x2fd)) /
                (-0x1 * 0x17bf + 0xbba * 0x1 + -0x27 * -0x4f) +
              parseInt(rQ(-0x260, -0x274, -0x280, -0x248, -0x27f)) /
                (-0x2706 + -0x17b5 + 0x20 * 0x1f6) +
              (parseInt(rU(0x45e, 0x496, 0x48c, 0x49d, 0x47d)) /
                (0x260f * -0x1 + 0x1 * -0x20a1 + 0x46b6)) *
                (parseInt(rQ(-0x23e, -0x25f, -0x278, -0x280, -0x256)) /
                  (-0xca9 + -0xbd5 + 0x1885)) +
              -parseInt(rU(0x452, 0x456, 0x44a, 0x433, 0x44e)) /
                (-0xcce + -0x2482 + 0x4 * 0xc56) +
              (-parseInt(rS(-0xec, -0xc2, -0xe4, -0xe7, -0xc6)) /
                (-0x2 * -0x183 + 0x887 * -0x2 + 0x115 * 0xd)) *
                (parseInt(rP(-0x122, -0x12f, -0x129, -0x120, -0x12a)) /
                  (-0x750 + 0x4 * 0x29f + 0x1 * -0x322));
            if (rV === rO) break;
            else rR[x5(0x9db)](rR[x5(0x7aa)]());
          } catch (rW) {
            rR[x5(0x9db)](rR[x5(0x7aa)]());
          }
        }
      })(rG, -0x51c14 * -0x1 + -0x87309 + 0x92db * 0x13);
      const rK = [
        rL(0x22c, 0x242, 0x249, 0x246, 0x242) +
          rJ(0x4bd, 0x4b8, 0x4ab, 0x481, 0x4c9) +
          rJ(0x4b0, 0x49e, 0x4bb, 0x4c5, 0x4c8) +
          rM(-0x128, -0x11a, -0x135, -0x121, -0x144),
        rJ(0x491, 0x482, 0x49e, 0x4ba, 0x48b) +
          rL(0x234, 0x22e, 0x229, 0x255, 0x244),
        rM(-0x14e, -0x170, -0x171, -0x14b, -0x136) +
          rL(0x265, 0x275, 0x23c, 0x287, 0x241),
      ];
      function rL(rN, rO, rP, rQ, rR) {
        return rI(rN - 0x140, rR);
      }
      function rM(rN, rO, rP, rQ, rR) {
        return rI(rQ - -0x23b, rO);
      }
      !rK[
        rL(0x23f, 0x225, 0x23c, 0x231, 0x269) +
          rM(-0x147, -0x157, -0x129, -0x12c, -0x154)
      ](
        window[
          rM(-0x11a, -0x12c, -0x15c, -0x144, -0x128) +
            rH(0x44e, 0x42f, 0x445, 0x45a, 0x404)
        ][
          rJ(0x4d2, 0x4b9, 0x4ad, 0x4ca, 0x4a0) +
            rM(-0x15e, -0x112, -0x150, -0x13b, -0x147)
        ][
          rF(0x331, 0x314, 0x315, 0x31d, 0x31c) +
            rM(-0xed, -0xf8, -0xe4, -0x109, -0xfb) +
            "e"
        ]()
      ) &&
        (alert(
          rL(0x228, 0x1fd, 0x211, 0x21d, 0x21f) +
            rF(0x322, 0x354, 0x32c, 0x327, 0x321) +
            rF(0x316, 0x333, 0x2f3, 0x30f, 0x32b) +
            rH(0x471, 0x448, 0x42a, 0x421, 0x44c) +
            rL(0x249, 0x26b, 0x26f, 0x225, 0x276) +
            rM(-0x15f, -0x11d, -0x133, -0x137, -0x116) +
            rH(0x3fb, 0x411, 0x42e, 0x42e, 0x404) +
            rJ(0x484, 0x454, 0x475, 0x44f, 0x452) +
            rM(-0x11b, -0x13a, -0x133, -0x11d, -0x132) +
            rM(-0xf4, -0xfc, -0xf7, -0x10a, -0xff) +
            rJ(0x4ba, 0x4e9, 0x4cd, 0x4ef, 0x4c5) +
            rJ(0x461, 0x492, 0x47f, 0x493, 0x49f) +
            rM(-0x156, -0x130, -0x120, -0x14a, -0x123) +
            rL(0x21e, 0x236, 0x241, 0x246, 0x215) +
            rH(0x44f, 0x444, 0x44b, 0x46c, 0x43d) +
            rH(0x441, 0x44f, 0x47b, 0x428, 0x470) +
            rM(-0x170, -0x13c, -0x14a, -0x145, -0x131) +
            rL(0x238, 0x243, 0x25f, 0x25c, 0x246) +
            rJ(0x49e, 0x486, 0x4af, 0x4c8, 0x495) +
            rF(0x2e9, 0x2fe, 0x2f3, 0x301, 0x325) +
            rL(0x226, 0x208, 0x20b, 0x23b, 0x1ff) +
            rH(0x464, 0x43d, 0x464, 0x448, 0x414) +
            rF(0x330, 0x306, 0x342, 0x324, 0x324) +
            rH(0x43f, 0x43f, 0x42d, 0x43f, 0x414) +
            rF(0x2cb, 0x318, 0x2ca, 0x2ef, 0x2e0) +
            rM(-0x108, -0x10e, -0x12f, -0x10d, -0xf7) +
            rF(0x341, 0x31a, 0x310, 0x333, 0x350) +
            rJ(0x4b1, 0x49c, 0x4c4, 0x4b8, 0x4d7) +
            rF(0x354, 0x350, 0x365, 0x33f, 0x347) +
            rJ(0x4b5, 0x4d3, 0x4c8, 0x4e0, 0x4bf) +
            rL(0x252, 0x24c, 0x26c, 0x230, 0x273)
        ),
        kJ(
          rF(0x325, 0x318, 0x30f, 0x325, 0x328) +
            rM(-0x127, -0x15e, -0x162, -0x13e, -0x13f) +
            rL(0x21f, 0x23c, 0x245, 0x21b, 0x248) +
            rH(0x411, 0x414, 0x43b, 0x43e, 0x423) +
            rF(0x31d, 0x369, 0x349, 0x340, 0x34d) +
            rL(0x26a, 0x273, 0x255, 0x295, 0x261) +
            rJ(0x4b3, 0x48a, 0x48b, 0x466, 0x46c) +
            rL(0x268, 0x278, 0x28c, 0x25c, 0x259) +
            rL(0x24b, 0x224, 0x277, 0x26c, 0x232) +
            rM(-0x10d, -0x153, -0x124, -0x134, -0x14c) +
            rJ(0x477, 0x4a5, 0x47d, 0x45c, 0x45a) +
            rL(0x224, 0x215, 0x21a, 0x24d, 0x24e) +
            rL(0x239, 0x252, 0x21c, 0x236, 0x20d) +
            rM(-0x179, -0x15f, -0x12f, -0x159, -0x142) +
            rF(0x307, 0x300, 0x2fa, 0x322, 0x315) +
            rH(0x458, 0x44b, 0x441, 0x42e, 0x43f) +
            rM(-0x117, -0x144, -0xf0, -0x117, -0x13b) +
            rL(0x23a, 0x224, 0x252, 0x226, 0x250) +
            rL(0x254, 0x247, 0x22b, 0x248, 0x26d) +
            rL(0x22b, 0x20c, 0x200, 0x246, 0x23b) +
            rM(-0x175, -0x175, -0x174, -0x15d, -0x13f) +
            rF(0x2d5, 0x2fa, 0x2d1, 0x2ed, 0x2f5) +
            rF(0x310, 0x312, 0x304, 0x2f6, 0x308) +
            rL(0x24c, 0x22b, 0x249, 0x24e, 0x23b) +
            rL(0x260, 0x27b, 0x28c, 0x28c, 0x235) +
            rM(-0x135, -0x141, -0x126, -0x140, -0x154) +
            rH(0x461, 0x441, 0x442, 0x428, 0x466) +
            rF(0x2e2, 0x326, 0x2f5, 0x2fa, 0x2f3) +
            "v>",
          (rN) => {
            const rO = {};
            rO[rR(-0x281, -0x2a8, -0x288, -0x28b, -0x282)] =
              rR(-0x28e, -0x297, -0x26e, -0x292, -0x28b) +
              rR(-0x285, -0x2ab, -0x289, -0x2b0, -0x2a7) +
              rU(0x3f2, 0x3f5, 0x3e1, 0x3e1, 0x3e3) +
              rT(0x146, 0x141, 0x11f, 0x14b, 0x15a);
            function rP(rV, rW, rX, rY, rZ) {
              return rF(rV - 0x10e, rW - 0xae, rY, rW - 0xdd, rZ - 0x14d);
            }
            const rQ = rO;
            function rR(rV, rW, rX, rY, rZ) {
              return rH(rV - 0x13a, rV - -0x6b1, rW, rY - 0x11b, rZ - 0x1a6);
            }
            function rS(rV, rW, rX, rY, rZ) {
              return rM(rV - 0x193, rZ, rX - 0x13d, rX - 0x423, rZ - 0x15b);
            }
            function rT(rV, rW, rX, rY, rZ) {
              return rL(rY - -0x124, rW - 0xf8, rX - 0x15a, rY - 0x16e, rX);
            }
            function rU(rV, rW, rX, rY, rZ) {
              return rL(rW - 0x1ad, rW - 0x30, rX - 0x170, rY - 0x1d5, rV);
            }
            !rN &&
              (window[
                rT(0xea, 0x112, 0x108, 0x113, 0x129) +
                  rS(0x2dc, 0x2ec, 0x2f5, 0x2e3, 0x2e2)
              ][rS(0x334, 0x305, 0x309, 0x31b, 0x2fd)] =
                rQ[rS(0x2d4, 0x319, 0x2f6, 0x2e2, 0x31b)]);
          }
        ));
    }
    kK();
    var kL = document[ux(0x546)](ux(0x8f1)),
      kM = (function () {
        const x7 = ux;
        let rF = ![];
        return (
          (function (rG) {
            const x6 = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                x6(0xe5b)
              ](rG) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                x6(0xe5b)
              ](rG[x6(0x3a1)](0x0, 0x4))
            )
              rF = !![];
          })(navigator[x7(0x1dc)] || navigator[x7(0x846)] || window[x7(0x6fd)]),
          rF
        );
      })(),
      kN =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          ux(0xe5b)
        ](navigator[ux(0x1dc)][ux(0x49a)]()),
      kO = 0x514,
      kP = 0x28a,
      kQ = 0x1,
      kR = [kn, kl, ko, km, kI, hf],
      kS = 0x1,
      kT = 0x1;
    function kU() {
      const x8 = ux;
      (kT = Math[x8(0x9da)](kj[x8(0xb3d)] / cZ, kj[x8(0x2a1)] / d0)),
        (kS =
          Math[pc[x8(0xd35)] ? x8(0x585) : x8(0x9da)](kV() / kO, kW() / kP) *
          (kM && !kN ? 1.1 : 0x1)),
        (kS *= kQ);
      for (let rF = 0x0; rF < kR[x8(0xc2f)]; rF++) {
        const rG = kR[rF];
        let rH = kS * (rG[x8(0x59f)] || 0x1);
        (rG[x8(0x5c6)][x8(0x14b)] = x8(0x60a) + rH + ")"),
          (rG[x8(0x5c6)][x8(0x3ed)] = x8(0x82c)),
          (rG[x8(0x5c6)][x8(0xb3d)] = kV() / rH + "px"),
          (rG[x8(0x5c6)][x8(0x2a1)] = kW() / rH + "px");
      }
    }
    function kV() {
      const x9 = ux;
      return document[x9(0xb1d)][x9(0x1b7)];
    }
    function kW() {
      const xa = ux;
      return document[xa(0xb1d)][xa(0x88f)];
    }
    var kX = 0x1;
    function kY() {
      const xb = ux;
      (kX = pc[xb(0xe4c)] ? 0.65 : window[xb(0x630)]),
        (kj[xb(0xb3d)] = kV() * kX),
        (kj[xb(0x2a1)] = kW() * kX),
        kU();
      for (let rF = 0x0; rF < mK[xb(0xc2f)]; rF++) {
        mK[rF][xb(0x4d2)]();
      }
    }
    window[ux(0xcdf)] = function () {
      kY(), qJ();
    };
    var kZ = (function () {
        const xc = ux,
          rF = 0x23,
          rG = rF / 0x2,
          rH = document[xc(0x916)](xc(0xca1));
        rH[xc(0xb3d)] = rH[xc(0x2a1)] = rF;
        const rI = rH[xc(0x3b7)]("2d");
        return (
          (rI[xc(0x669)] = xc(0x5f8)),
          rI[xc(0xc0e)](),
          rI[xc(0x4a6)](0x0, rG),
          rI[xc(0xa7c)](rF, rG),
          rI[xc(0x4a6)](rG, 0x0),
          rI[xc(0xa7c)](rG, rF),
          rI[xc(0x8ae)](),
          rI[xc(0x314)](rH, xc(0xa08))
        );
      })(),
      l0 = 0x19,
      l1 = Math["PI"] * 0x2,
      l2 = [];
    l3((Math["PI"] / 0xb4) * 0x1e, 0x1),
      l3((Math["PI"] / 0xb4) * 0x3c, 0x1, 0x6),
      l3((Math["PI"] / 0xb4) * 0x5a, -0x1, 0x6),
      l3((Math["PI"] / 0xb4) * 0x78, -0x1),
      l3((-Math["PI"] / 0xb4) * 0x1e, -0x1),
      l3((-Math["PI"] / 0xb4) * 0x3c, -0x1, 0x6),
      l3((-Math["PI"] / 0xb4) * 0x5a, 0x1, 0x6),
      l3((-Math["PI"] / 0xb4) * 0x78, 0x1);
    function l3(rF, rG, rH = 0x8) {
      const xd = ux;
      rG *= -0x1;
      const rI = Math[xd(0x65c)](rF),
        rJ = Math[xd(0x12d)](rF),
        rK = rI * 0x28,
        rL = rJ * 0x28;
      l2[xd(0x9db)]({
        dir: rG,
        start: [rK, rL],
        curve: [
          rK + rI * 0x17 + -rJ * rG * rH,
          rL + rJ * 0x17 + rI * rG * rH,
          rK + rI * 0x2e,
          rL + rJ * 0x2e,
        ],
        side: Math[xd(0x5e2)](rF),
      });
    }
    var l4 = l5();
    function l5() {
      const xe = ux,
        rF = new Path2D(),
        rG = Math["PI"] / 0x5;
      return (
        rF[xe(0x878)](0x0, 0x0, 0x28, rG, l1 - rG),
        rF[xe(0xa39)](
          0x12,
          0x0,
          Math[xe(0x65c)](rG) * 0x28,
          Math[xe(0x12d)](rG) * 0x28
        ),
        rF[xe(0x1d2)](),
        rF
      );
    }
    var l6 = l7();
    function l7() {
      const xf = ux,
        rF = new Path2D();
      return (
        rF[xf(0x4a6)](-0x28, 0x5),
        rF[xf(0x4c4)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rF[xf(0xa7c)](0x28, -0x5),
        rF[xf(0x4c4)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rF[xf(0x1d2)](),
        rF
      );
    }
    function l8(rF, rG = 0x1, rH = 0x0) {
      const xg = ux,
        rI = new Path2D();
      for (let rJ = 0x0; rJ < rF; rJ++) {
        const rK = (Math["PI"] * 0x2 * rJ) / rF + rH;
        rI[xg(0xa7c)](
          Math[xg(0x65c)](rK) - Math[xg(0x12d)](rK) * 0.1 * rG,
          Math[xg(0x12d)](rK)
        );
      }
      return rI[xg(0x1d2)](), rI;
    }
    var l9 = {
      petalRock: l8(0x5),
      petalSoil: l8(0xa),
      petalSalt: l8(0x7),
      petalLightning: (function () {
        const xh = ux,
          rF = new Path2D();
        for (let rG = 0x0; rG < 0x14; rG++) {
          const rH = (rG / 0x14) * Math["PI"] * 0x2,
            rI = rG % 0x2 === 0x0 ? 0x1 : 0.55;
          rF[xh(0xa7c)](Math[xh(0x65c)](rH) * rI, Math[xh(0x12d)](rH) * rI);
        }
        return rF[xh(0x1d2)](), rF;
      })(),
      petalCotton: lb(0x9, 0x1, 0.5, 1.6),
      petalWeb: lb(0x5, 0x1, 0.5, 0.7),
      petalCactus: lb(0x8, 0x1, 0.5, 0.7),
      petalSand: l8(0x6, 0x0, 0.2),
    };
    function la(rF, rG, rH, rI, rJ) {
      const xi = ux;
      (rF[xi(0x669)] = rJ),
        (rF[xi(0x71e)] = rH),
        rF[xi(0xa2f)](),
        (rG *= 0.45),
        rF[xi(0xa60)](rG),
        rF[xi(0x30e)](-0x14, 0x0),
        rF[xi(0xc0e)](),
        rF[xi(0x4a6)](0x0, 0x26),
        rF[xi(0xa7c)](0x50, 0x7),
        rF[xi(0xa7c)](0x50, -0x7),
        rF[xi(0xa7c)](0x0, -0x26),
        rF[xi(0xa7c)](-0x14, -0x1e),
        rF[xi(0xa7c)](-0x14, 0x1e),
        rF[xi(0x1d2)](),
        (rH = rH / rG),
        (rF[xi(0x71e)] = 0x64 + rH),
        (rF[xi(0x669)] = rJ),
        rF[xi(0x8ae)](),
        (rF[xi(0x669)] = rF[xi(0x681)] = rI),
        (rF[xi(0x71e)] -= rH * 0x2),
        rF[xi(0x8ae)](),
        rF[xi(0x615)](),
        rF[xi(0xbec)]();
    }
    function lb(rF, rG, rH, rI) {
      const xj = ux,
        rJ = new Path2D();
      return lc(rJ, rF, rG, rH, rI), rJ[xj(0x1d2)](), rJ;
    }
    function lc(rF, rG, rH, rI, rJ) {
      const xk = ux;
      rF[xk(0x4a6)](rH, 0x0);
      for (let rK = 0x1; rK <= rG; rK++) {
        const rL = (Math["PI"] * 0x2 * (rK - rI)) / rG,
          rM = (Math["PI"] * 0x2 * rK) / rG;
        rF[xk(0xa39)](
          Math[xk(0x65c)](rL) * rH * rJ,
          Math[xk(0x12d)](rL) * rH * rJ,
          Math[xk(0x65c)](rM) * rH,
          Math[xk(0x12d)](rM) * rH
        );
      }
    }
    var ld = (function () {
        const xl = ux,
          rF = new Path2D();
        rF[xl(0x4a6)](0x3c, 0x0);
        const rG = 0x6;
        for (let rH = 0x0; rH < rG; rH++) {
          const rI = ((rH + 0.5) / rG) * Math["PI"] * 0x2,
            rJ = ((rH + 0x1) / rG) * Math["PI"] * 0x2;
          rF[xl(0xa39)](
            Math[xl(0x65c)](rI) * 0x78,
            Math[xl(0x12d)](rI) * 0x78,
            Math[xl(0x65c)](rJ) * 0x3c,
            Math[xl(0x12d)](rJ) * 0x3c
          );
        }
        return rF[xl(0x1d2)](), rF;
      })(),
      le = (function () {
        const xm = ux,
          rF = new Path2D(),
          rG = 0x6;
        for (let rH = 0x0; rH < rG; rH++) {
          const rI = ((rH + 0.5) / rG) * Math["PI"] * 0x2;
          rF[xm(0x4a6)](0x0, 0x0), rF[xm(0xa7c)](...lf(0x37, 0x0, rI));
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            const rK = (rJ / 0x2) * 0x1e + 0x14,
              rL = 0xa - rJ * 0x2;
            rF[xm(0x4a6)](...lf(rK + rL, -rL, rI)),
              rF[xm(0xa7c)](...lf(rK, 0x0, rI)),
              rF[xm(0xa7c)](...lf(rK + rL, rL, rI));
          }
        }
        return rF;
      })();
    function lf(rF, rG, rH) {
      const xn = ux,
        rI = Math[xn(0x12d)](rH),
        rJ = Math[xn(0x65c)](rH);
      return [rF * rJ + rG * rI, rG * rJ - rF * rI];
    }
    function lg(rF, rG, rH) {
      (rF /= 0x168), (rG /= 0x64), (rH /= 0x64);
      let rI, rJ, rK;
      if (rG === 0x0) rI = rJ = rK = rH;
      else {
        const rM = (rP, rQ, rR) => {
            if (rR < 0x0) rR += 0x1;
            if (rR > 0x1) rR -= 0x1;
            if (rR < 0x1 / 0x6) return rP + (rQ - rP) * 0x6 * rR;
            if (rR < 0x1 / 0x2) return rQ;
            if (rR < 0x2 / 0x3) return rP + (rQ - rP) * (0x2 / 0x3 - rR) * 0x6;
            return rP;
          },
          rN = rH < 0.5 ? rH * (0x1 + rG) : rH + rG - rH * rG,
          rO = 0x2 * rH - rN;
        (rI = rM(rO, rN, rF + 0x1 / 0x3)),
          (rJ = rM(rO, rN, rF)),
          (rK = rM(rO, rN, rF - 0x1 / 0x3));
      }
      const rL = (rP) => {
        const xo = b,
          rQ = Math[xo(0x22b)](rP * 0xff)[xo(0x3de)](0x10);
        return rQ[xo(0xc2f)] === 0x1 ? "0" + rQ : rQ;
      };
      return "#" + rL(rI) + rL(rJ) + rL(rK);
    }
    var lh = [];
    for (let rF = 0x0; rF < 0xa; rF++) {
      const rG = 0x1 - rF / 0xa;
      lh[ux(0x9db)](lg(0x28 + rG * 0xc8, 0x50, 0x3c * rG));
    }
    var li = [ux(0x8bc), ux(0x36d)],
      lj = li[0x0],
      lk = [ux(0x76a), ux(0x70d), ux(0x7f9), ux(0x2ae)];
    function ll(rH = ux(0xab2)) {
      const xp = ux,
        rI = [];
      for (let rJ = 0x0; rJ < 0x5; rJ++) {
        rI[xp(0x9db)](q0(rH, 0.8 - (rJ / 0x5) * 0.25));
      }
      return rI;
    }
    var lm = {
        pet: {
          body: lj,
          wing: q0(lj, 0.7),
          tail_outline: q0(lj, 0.4),
          bone_outline: q0(lj, 0.4),
          bone: q0(lj, 0.6),
          tail: ll(q0(lj, 0.8)),
        },
        main: {
          body: ux(0xab2),
          wing: ux(0x10c),
          tail_outline: ux(0xc23),
          bone_outline: ux(0x1ec),
          bone: ux(0xc23),
          tail: ll(),
        },
      },
      ln = new Path2D(ux(0xd91)),
      lo = new Path2D(ux(0x43c)),
      lp = [];
    for (let rH = 0x0; rH < 0x3; rH++) {
      lp[ux(0x9db)](q0(li[0x0], 0x1 - (rH / 0x3) * 0.2));
    }
    function lq(rI = Math[ux(0xe0d)]()) {
      return function () {
        return (rI = (rI * 0x2455 + 0xc091) % 0x38f40), rI / 0x38f40;
      };
    }
    const lr = {
      [cR[ux(0xdaf)]]: [ux(0x29b), ux(0x67b)],
      [cR[ux(0x79b)]]: [ux(0xab2), ux(0xc04)],
      [cR[ux(0x410)]]: [ux(0x38f), ux(0xb40)],
    };
    var ls = lr;
    const lt = {};
    (lt[ux(0xe58)] = !![]),
      (lt[ux(0x117)] = !![]),
      (lt[ux(0xb72)] = !![]),
      (lt[ux(0x64e)] = !![]),
      (lt[ux(0x342)] = !![]),
      (lt[ux(0x8bd)] = !![]),
      (lt[ux(0x8a8)] = !![]);
    var lu = lt;
    const lv = {};
    (lv[ux(0x745)] = !![]),
      (lv[ux(0x9dd)] = !![]),
      (lv[ux(0x384)] = !![]),
      (lv[ux(0x46f)] = !![]),
      (lv[ux(0x7c0)] = !![]),
      (lv[ux(0x5b2)] = !![]),
      (lv[ux(0xb51)] = !![]);
    var lw = lv;
    const lx = {};
    (lx[ux(0x384)] = !![]),
      (lx[ux(0x46f)] = !![]),
      (lx[ux(0x7c0)] = !![]),
      (lx[ux(0x5b2)] = !![]);
    var ly = lx;
    const lz = {};
    (lz[ux(0x9dd)] = !![]), (lz[ux(0x75a)] = !![]), (lz[ux(0x64e)] = !![]);
    var lA = lz;
    const lB = {};
    (lB[ux(0xa36)] = !![]), (lB[ux(0x2e5)] = !![]), (lB[ux(0x38c)] = !![]);
    var lC = lB;
    const lD = {};
    (lD[ux(0xdb0)] = !![]),
      (lD[ux(0x500)] = !![]),
      (lD[ux(0x603)] = !![]),
      (lD[ux(0xa25)] = !![]),
      (lD[ux(0xdf0)] = !![]);
    var lE = lD;
    function lF(rI, rJ) {
      const xq = ux;
      rI[xq(0xc0e)](), rI[xq(0x4a6)](rJ, 0x0);
      for (let rK = 0x0; rK < 0x6; rK++) {
        const rL = (rK / 0x6) * Math["PI"] * 0x2;
        rI[xq(0xa7c)](Math[xq(0x65c)](rL) * rJ, Math[xq(0x12d)](rL) * rJ);
      }
      rI[xq(0x1d2)]();
    }
    function lG(rI, rJ, rK, rL, rM) {
      const xr = ux;
      rI[xr(0xc0e)](),
        rI[xr(0x4a6)](0x9, -0x5),
        rI[xr(0x4c4)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rI[xr(0xa39)](0xd, 0x0, 0x9, -0x5),
        rI[xr(0x1d2)](),
        (rI[xr(0x9ed)] = rI[xr(0xb0f)] = xr(0x22b)),
        (rI[xr(0x669)] = rL),
        (rI[xr(0x71e)] = rJ),
        rI[xr(0x8ae)](),
        (rI[xr(0x71e)] -= rM),
        (rI[xr(0x681)] = rI[xr(0x669)] = rK),
        rI[xr(0x615)](),
        rI[xr(0x8ae)]();
    }
    var lH = class {
        constructor(rI = -0x1, rJ, rK, rL, rM, rN = 0x7, rO = -0x1) {
          const xs = ux;
          (this["id"] = rI),
            (this[xs(0x171)] = rJ),
            (this[xs(0x5c8)] = hL[rJ]),
            (this[xs(0xcbd)] = this[xs(0x5c8)][xs(0xdb3)](xs(0x7e1))),
            (this["x"] = this["nx"] = this["ox"] = rK),
            (this["y"] = this["ny"] = this["oy"] = rL),
            (this[xs(0xa8e)] = this[xs(0x767)] = this[xs(0x945)] = rM),
            (this[xs(0xd33)] =
              this[xs(0x11f)] =
              this[xs(0x890)] =
              this[xs(0x922)] =
                rO),
            (this[xs(0x565)] = 0x0),
            (this[xs(0x911)] = this[xs(0xa6d)] = this[xs(0x32a)] = rN),
            (this[xs(0x223)] = 0x0),
            (this[xs(0xe6a)] = ![]),
            (this[xs(0x839)] = 0x0),
            (this[xs(0x671)] = 0x0),
            (this[xs(0x2dd)] = this[xs(0x5c8)][xs(0x78f)](xs(0x76e)) > -0x1),
            (this[xs(0x35e)] = this[xs(0x2dd)] ? this[xs(0x11f)] < 0x1 : 0x1),
            (this[xs(0x160)] = ![]),
            (this[xs(0xa7f)] = 0x0),
            (this[xs(0xbaf)] = 0x0),
            (this[xs(0x891)] = 0x0),
            (this[xs(0x842)] = 0x1),
            (this[xs(0x35a)] = 0x0),
            (this[xs(0x228)] = [cR[xs(0x800)], cR[xs(0xd17)], cR[xs(0xd62)]][
              xs(0x584)
            ](this[xs(0x171)])),
            (this[xs(0x7e9)] = lw[this[xs(0x5c8)]]),
            (this[xs(0x54b)] = ly[this[xs(0x5c8)]] ? 0x32 / 0xc8 : 0x0),
            (this[xs(0xd6f)] = lu[this[xs(0x5c8)]]),
            (this[xs(0xe7a)] = 0x0),
            (this[xs(0xa80)] = 0x0),
            (this[xs(0x678)] = ![]),
            (this[xs(0x291)] = 0x0),
            (this[xs(0x523)] = !![]),
            (this[xs(0x4ec)] = 0x2),
            (this[xs(0x849)] = 0x0),
            (this[xs(0x970)] = lE[this[xs(0x5c8)]]),
            (this[xs(0xa29)] = lA[this[xs(0x5c8)]]),
            (this[xs(0xca7)] = lC[this[xs(0x5c8)]]);
        }
        [ux(0x72c)]() {
          const xt = ux;
          this[xt(0xe6a)] && (this[xt(0x839)] += pR / 0xc8);
          (this[xt(0xa80)] += ((this[xt(0x678)] ? 0x1 : -0x1) * pR) / 0xc8),
            (this[xt(0xa80)] = Math[xt(0x585)](
              0x1,
              Math[xt(0x9da)](0x0, this[xt(0xa80)])
            )),
            (this[xt(0x891)] = px(
              this[xt(0x891)],
              this[xt(0xbaf)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[xt(0xbaf)] = px(this[xt(0xbaf)], this[xt(0xa7f)], 0x64));
          this[xt(0x671)] > 0x0 &&
            ((this[xt(0x671)] -= pR / 0x96),
            this[xt(0x671)] < 0x0 && (this[xt(0x671)] = 0x0));
          (this[xt(0x223)] += pR / 0x64),
            (this["t"] = Math[xt(0x585)](0x1, this[xt(0x223)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[xt(0x11f)] =
              this[xt(0x922)] +
              (this[xt(0x890)] - this[xt(0x922)]) * this["t"]),
            (this[xt(0x911)] =
              this[xt(0x32a)] +
              (this[xt(0xa6d)] - this[xt(0x32a)]) * this["t"]);
          if (this[xt(0x228)]) {
            const rI = Math[xt(0x585)](0x1, pR / 0x64);
            (this[xt(0x842)] +=
              (Math[xt(0x65c)](this[xt(0x767)]) - this[xt(0x842)]) * rI),
              (this[xt(0x35a)] +=
                (Math[xt(0x12d)](this[xt(0x767)]) - this[xt(0x35a)]) * rI);
          }
          (this[xt(0xa8e)] = f7(this[xt(0x945)], this[xt(0x767)], this["t"])),
            (this[xt(0x291)] +=
              ((Math[xt(0xc3c)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pR) /
              0x12),
            this[xt(0x565)] > 0x0 &&
              ((this[xt(0x565)] -= pR / 0x258),
              this[xt(0x565)] < 0x0 && (this[xt(0x565)] = 0x0)),
            this[xt(0xca7)] &&
              ((this[xt(0x4ec)] += pR / 0x5dc),
              this[xt(0x4ec)] > 0x1 && (this[xt(0x4ec)] = 0x1),
              (this[xt(0x523)] = this[xt(0x4ec)] < 0x1)),
            this[xt(0x11f)] < 0x1 &&
              (this[xt(0x35e)] = px(this[xt(0x35e)], 0x1, 0xc8)),
            this[xt(0x565)] === 0x0 &&
              (this[xt(0xd33)] +=
                (this[xt(0x11f)] - this[xt(0xd33)]) *
                Math[xt(0x585)](0x1, pR / 0xc8));
        }
        [ux(0xe5a)](rI, rJ = ![]) {
          const xu = ux,
            rK = this[xu(0x911)] / 0x19;
          rI[xu(0xa60)](rK),
            rI[xu(0x30e)](0x5, 0x0),
            (rI[xu(0x71e)] = 0x5),
            (rI[xu(0xb0f)] = rI[xu(0x9ed)] = xu(0x22b)),
            (rI[xu(0x669)] = rI[xu(0x681)] = this[xu(0xa38)](xu(0x72b)));
          rJ &&
            (rI[xu(0xa2f)](),
            rI[xu(0x30e)](0x3, 0x0),
            rI[xu(0xc0e)](),
            rI[xu(0x4a6)](-0xa, 0x0),
            rI[xu(0xa7c)](-0x28, -0xf),
            rI[xu(0xa39)](-0x21, 0x0, -0x28, 0xf),
            rI[xu(0x1d2)](),
            rI[xu(0xbec)](),
            rI[xu(0x8ae)](),
            rI[xu(0x615)]());
          rI[xu(0xc0e)](), rI[xu(0x4a6)](0x0, 0x1e);
          const rL = 0x1c,
            rM = 0x24,
            rN = 0x5;
          rI[xu(0x4a6)](0x0, rL);
          for (let rO = 0x0; rO < rN; rO++) {
            const rP = ((((rO + 0.5) / rN) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              rQ = ((((rO + 0x1) / rN) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rI[xu(0xa39)](
              Math[xu(0x65c)](rP) * rM * 0.85,
              -Math[xu(0x12d)](rP) * rM,
              Math[xu(0x65c)](rQ) * rL * 0.7,
              -Math[xu(0x12d)](rQ) * rL
            );
          }
          rI[xu(0xa7c)](-0x1c, -0x9),
            rI[xu(0xa39)](-0x26, 0x0, -0x1c, 0x9),
            rI[xu(0xa7c)](0x0, rL),
            rI[xu(0x1d2)](),
            (rI[xu(0x681)] = this[xu(0xa38)](xu(0x6ae))),
            rI[xu(0x615)](),
            rI[xu(0x8ae)](),
            rI[xu(0xc0e)]();
          for (let rR = 0x0; rR < 0x4; rR++) {
            const rS = (((rR / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rT = -0x1e + Math[xu(0x65c)](rS) * 0xd,
              rU = Math[xu(0x12d)](rS) * 0xb;
            rI[xu(0x4a6)](rT, rU),
              rI[xu(0xa7c)](
                rT + Math[xu(0x65c)](rS) * 0x1b,
                rU + Math[xu(0x12d)](rS) * 0x1b
              );
          }
          (rI[xu(0x71e)] = 0x4), rI[xu(0x8ae)]();
        }
        [ux(0x832)](rI, rJ = ux(0x614), rK = 0x0) {
          const xv = ux;
          for (let rL = 0x0; rL < l2[xv(0xc2f)]; rL++) {
            const rM = l2[rL];
            rI[xv(0xa2f)](),
              rI[xv(0x568)](
                rM[xv(0xb31)] * Math[xv(0x12d)](this[xv(0x291)] + rL) * 0.15 +
                  rK * rM[xv(0xde0)]
              ),
              rI[xv(0xc0e)](),
              rI[xv(0x4a6)](...rM[xv(0xdf5)]),
              rI[xv(0xa39)](...rM[xv(0x699)]),
              (rI[xv(0x669)] = this[xv(0xa38)](rJ)),
              (rI[xv(0x71e)] = 0x8),
              (rI[xv(0xb0f)] = xv(0x22b)),
              rI[xv(0x8ae)](),
              rI[xv(0xbec)]();
          }
        }
        [ux(0x380)](rI) {
          const xw = ux;
          rI[xw(0xc0e)]();
          let rJ = 0x0,
            rK = 0x0,
            rL,
            rM;
          const rN = 0x14;
          for (let rO = 0x0; rO < rN; rO++) {
            const rP = (rO / rN) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              rQ = ((rO + 0x1) / rN) * 0x28;
            (rL = Math[xw(0x65c)](rP) * rQ), (rM = Math[xw(0x12d)](rP) * rQ);
            const rR = rJ + rL,
              rS = rK + rM;
            rI[xw(0xa39)](
              (rJ + rR) * 0.5 + rM * 0.15,
              (rK + rS) * 0.5 - rL * 0.15,
              rR,
              rS
            ),
              (rJ = rR),
              (rK = rS);
          }
          rI[xw(0xa39)](
            rJ - rM * 0.42 + rL * 0.4,
            rK + rL * 0.42 + rM * 0.4,
            rJ - rM * 0.84,
            rK + rL * 0.84
          ),
            (rI[xw(0x681)] = this[xw(0xa38)](xw(0x967))),
            rI[xw(0x615)](),
            (rI[xw(0x71e)] = 0x8),
            (rI[xw(0x669)] = this[xw(0xa38)](xw(0x2af))),
            rI[xw(0x8ae)]();
        }
        [ux(0x64e)](rI) {
          const xx = ux;
          rI[xx(0xa60)](this[xx(0x911)] / 0xd),
            rI[xx(0x568)](-Math["PI"] / 0x6),
            (rI[xx(0xb0f)] = rI[xx(0x9ed)] = xx(0x22b)),
            rI[xx(0xc0e)](),
            rI[xx(0x4a6)](0x0, -0xe),
            rI[xx(0xa7c)](0x6, -0x14),
            (rI[xx(0x681)] = rI[xx(0x669)] = this[xx(0xa38)](xx(0xad8))),
            (rI[xx(0x71e)] = 0x7),
            rI[xx(0x8ae)](),
            (rI[xx(0x681)] = rI[xx(0x669)] = this[xx(0xa38)](xx(0x976))),
            (rI[xx(0x71e)] = 0x2),
            rI[xx(0x8ae)](),
            rI[xx(0xc0e)](),
            rI[xx(0x4a6)](0x0, -0xc),
            rI[xx(0xa39)](-0x6, 0x0, 0x4, 0xe),
            rI[xx(0x4c4)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rI[xx(0x71e)] = 0xc),
            (rI[xx(0x681)] = rI[xx(0x669)] = this[xx(0xa38)](xx(0xcda))),
            rI[xx(0x615)](),
            rI[xx(0x8ae)](),
            (rI[xx(0x71e)] = 0x6),
            (rI[xx(0x681)] = rI[xx(0x669)] = this[xx(0xa38)](xx(0xd68))),
            rI[xx(0x8ae)](),
            rI[xx(0x615)]();
        }
        [ux(0xb72)](rI) {
          const xy = ux;
          rI[xy(0xa60)](this[xy(0x911)] / 0x2d),
            rI[xy(0x30e)](-0x14, 0x0),
            (rI[xy(0xb0f)] = rI[xy(0x9ed)] = xy(0x22b)),
            rI[xy(0xc0e)]();
          const rJ = 0x6,
            rK = Math["PI"] * 0.45,
            rL = 0x3c,
            rM = 0x46;
          rI[xy(0x4a6)](0x0, 0x0);
          for (let rN = 0x0; rN < rJ; rN++) {
            const rO = ((rN / rJ) * 0x2 - 0x1) * rK,
              rP = (((rN + 0x1) / rJ) * 0x2 - 0x1) * rK;
            rN === 0x0 &&
              rI[xy(0xa39)](
                -0xa,
                -0x32,
                Math[xy(0x65c)](rO) * rL,
                Math[xy(0x12d)](rO) * rL
              );
            const rQ = (rO + rP) / 0x2;
            rI[xy(0xa39)](
              Math[xy(0x65c)](rQ) * rM,
              Math[xy(0x12d)](rQ) * rM,
              Math[xy(0x65c)](rP) * rL,
              Math[xy(0x12d)](rP) * rL
            );
          }
          rI[xy(0xa39)](-0xa, 0x32, 0x0, 0x0),
            (rI[xy(0x681)] = this[xy(0xa38)](xy(0x2aa))),
            (rI[xy(0x669)] = this[xy(0xa38)](xy(0x7f1))),
            (rI[xy(0x71e)] = 0xa),
            rI[xy(0x8ae)](),
            rI[xy(0x615)](),
            rI[xy(0xc0e)](),
            rI[xy(0x878)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rI[xy(0x1d2)](),
            (rI[xy(0x669)] = this[xy(0xa38)](xy(0x7c5))),
            (rI[xy(0x71e)] = 0x1e),
            rI[xy(0x8ae)](),
            (rI[xy(0x71e)] = 0xa),
            (rI[xy(0x669)] = rI[xy(0x681)] = this[xy(0xa38)](xy(0x5cb))),
            rI[xy(0x615)](),
            rI[xy(0x8ae)]();
        }
        [ux(0xd18)](rI, rJ = ![]) {
          const xz = ux;
          rI[xz(0xa60)](this[xz(0x911)] / 0x64);
          let rK = this[xz(0x7af)]
            ? 0.75
            : Math[xz(0x12d)](Date[xz(0xa4a)]() / 0x96 + this[xz(0x291)]);
          (rK = rK * 0.5 + 0.5),
            (rK *= 0.7),
            rI[xz(0xc0e)](),
            rI[xz(0x4a6)](0x0, 0x0),
            rI[xz(0x878)](0x0, 0x0, 0x64, rK, Math["PI"] * 0x2 - rK),
            rI[xz(0x1d2)](),
            (rI[xz(0x681)] = this[xz(0xa38)](xz(0xda9))),
            rI[xz(0x615)](),
            rI[xz(0x173)](),
            (rI[xz(0x669)] = xz(0xaf4)),
            (rI[xz(0x71e)] = rJ ? 0x28 : 0x1e),
            (rI[xz(0x9ed)] = xz(0x22b)),
            rI[xz(0x8ae)](),
            !rJ &&
              (rI[xz(0xc0e)](),
              rI[xz(0x878)](
                0x0 - rK * 0x8,
                -0x32 - rK * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rI[xz(0x681)] = xz(0x3ee)),
              rI[xz(0x615)]());
        }
        [ux(0x5b4)](rI) {
          const xA = ux;
          rI[xA(0xa60)](this[xA(0x911)] / 0x50),
            rI[xA(0x568)](-this[xA(0xa8e)]),
            rI[xA(0x30e)](0x0, 0x50);
          const rJ = Date[xA(0xa4a)]() / 0x12c + this[xA(0x291)];
          rI[xA(0xc0e)]();
          const rK = 0x3;
          let rL;
          for (let rO = 0x0; rO < rK; rO++) {
            const rP = ((rO / rK) * 0x2 - 0x1) * 0x64,
              rQ = (((rO + 0x1) / rK) * 0x2 - 0x1) * 0x64;
            (rL =
              0x14 +
              (Math[xA(0x12d)]((rO / rK) * Math["PI"] * 0x8 + rJ) * 0.5 + 0.5) *
                0x1e),
              rO === 0x0 && rI[xA(0x4a6)](rP, -rL),
              rI[xA(0x4c4)](rP, rL, rQ, rL, rQ, -rL);
          }
          rI[xA(0x4c4)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rL),
            rI[xA(0x1d2)](),
            (rI[xA(0xae3)] *= 0.7);
          const rM = this[xA(0x160)]
            ? li[0x0]
            : this["id"] < 0x0
            ? lk[0x0]
            : lk[this["id"] % lk[xA(0xc2f)]];
          (rI[xA(0x681)] = this[xA(0xa38)](rM)),
            rI[xA(0x615)](),
            rI[xA(0x173)](),
            (rI[xA(0x9ed)] = xA(0x22b)),
            (rI[xA(0x669)] = xA(0xaf4)),
            xA(0xc8a),
            (rI[xA(0x71e)] = 0x1e),
            rI[xA(0x8ae)]();
          let rN = Math[xA(0x12d)](rJ * 0x1);
          (rN = rN * 0.5 + 0.5),
            (rN *= 0x3),
            rI[xA(0xc0e)](),
            rI[xA(0xb04)](
              0x0,
              -0x82 - rN * 0x2,
              0x28 - rN,
              0x14 - rN * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rI[xA(0x681)] = rI[xA(0x669)]),
            rI[xA(0x615)]();
        }
        [ux(0xaa7)](rI, rJ) {
          const xB = ux;
          rI[xB(0xa60)](this[xB(0x911)] / 0x14);
          const rK = rI[xB(0xae3)];
          (rI[xB(0x669)] = rI[xB(0x681)] = this[xB(0xa38)](xB(0x62d))),
            (rI[xB(0xae3)] = 0.4 * rK),
            rI[xB(0xa2f)](),
            rI[xB(0xc0e)](),
            rI[xB(0x568)](Math["PI"] * 0.16),
            rI[xB(0x30e)](rJ ? -0x6 : -0x9, 0x0),
            rI[xB(0x4a6)](0x0, -0x4),
            rI[xB(0xa39)](-0x2, 0x0, 0x0, 0x4),
            (rI[xB(0x71e)] = 0x8),
            (rI[xB(0x9ed)] = rI[xB(0xb0f)] = xB(0x22b)),
            rI[xB(0x8ae)](),
            rI[xB(0xbec)](),
            rI[xB(0xc0e)](),
            rI[xB(0x878)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rI[xB(0x615)](),
            rI[xB(0x173)](),
            (rI[xB(0xae3)] = 0.5 * rK),
            (rI[xB(0x71e)] = rJ ? 0x8 : 0x3),
            rI[xB(0x8ae)]();
        }
        [ux(0xa25)](rI) {
          const xC = ux;
          rI[xC(0xa60)](this[xC(0x911)] / 0x64);
          const rJ = this[xC(0xa38)](xC(0x96a)),
            rK = this[xC(0xa38)](xC(0x340)),
            rL = 0x4;
          rI[xC(0x9ed)] = rI[xC(0xb0f)] = xC(0x22b);
          const rM = 0x64 - rI[xC(0x71e)] * 0.5;
          for (let rN = 0x0; rN <= rL; rN++) {
            const rO = (0x1 - rN / rL) * rM;
            lF(rI, rO),
              (rI[xC(0x71e)] =
                0x1e +
                rN *
                  (Math[xC(0x12d)](Date[xC(0xa4a)]() / 0x320 + rN) * 0.5 +
                    0.5) *
                  0x5),
              (rI[xC(0x681)] = rI[xC(0x669)] = rN % 0x2 === 0x0 ? rJ : rK),
              rN === rL - 0x1 && rI[xC(0x615)](),
              rI[xC(0x8ae)]();
          }
        }
        [ux(0xb3e)](rI, rJ) {
          const xD = ux;
          rI[xD(0xc0e)](),
            rI[xD(0x878)](0x0, 0x0, this[xD(0x911)], 0x0, l1),
            (rI[xD(0x681)] = this[xD(0xa38)](rJ)),
            rI[xD(0x615)](),
            (rI[xD(0x681)] = xD(0x3ee));
          for (let rK = 0x1; rK < 0x4; rK++) {
            rI[xD(0xc0e)](),
              rI[xD(0x878)](
                0x0,
                0x0,
                this[xD(0x911)] * (0x1 - rK / 0x4),
                0x0,
                l1
              ),
              rI[xD(0x615)]();
          }
        }
        [ux(0x213)](rI, rJ) {
          const xE = ux;
          rI[xE(0x30e)](-this[xE(0x911)], 0x0), (rI[xE(0x1cc)] = xE(0x432));
          const rK = 0x32;
          let rL = ![];
          !this[xE(0x82b)] && ((rL = !![]), (this[xE(0x82b)] = []));
          while (this[xE(0x82b)][xE(0xc2f)] < rK) {
            this[xE(0x82b)][xE(0x9db)]({
              x: rL ? Math[xE(0xe0d)]() : 0x0,
              y: Math[xE(0xe0d)]() * 0x2 - 0x1,
              vx: Math[xE(0xe0d)]() * 0.03 + 0.02,
              size: Math[xE(0xe0d)]() * 0.2 + 0.2,
            });
          }
          const rM = this[xE(0x911)] * 0x2,
            rN = Math[xE(0x9da)](this[xE(0x911)] * 0.1, 0x4),
            rO = rI[xE(0xae3)];
          (rI[xE(0x681)] = rJ), rI[xE(0xc0e)]();
          for (let rP = rK - 0x1; rP >= 0x0; rP--) {
            const rQ = this[xE(0x82b)][rP];
            rQ["x"] += rQ["vx"];
            const rR = rQ["x"] * rM,
              rS = this[xE(0x54b)] * rR,
              rT = rQ["y"] * rS,
              rU =
                Math[xE(0x3ce)](0x1 - Math[xE(0x372)](rT) / rS, 0.2) *
                Math[xE(0x3ce)](0x1 - rR / rM, 0.2);
            if (rQ["x"] >= 0x1 || rU < 0.001) {
              this[xE(0x82b)][xE(0x8ea)](rP, 0x1);
              continue;
            }
            (rI[xE(0xae3)] = rU * rO * 0.5),
              rI[xE(0xc0e)](),
              rI[xE(0x878)](
                rR,
                rT,
                rQ[xE(0x911)] * rS + rN,
                0x0,
                Math["PI"] * 0x2
              ),
              rI[xE(0x615)]();
          }
        }
        [ux(0xba7)](rI) {
          const xF = ux;
          rI[xF(0xa60)](this[xF(0x911)] / 0x46),
            rI[xF(0x568)](-Math["PI"] / 0x2);
          const rJ = pQ / 0xc8;
          (rI[xF(0x71e)] = 0x14),
            (rI[xF(0x669)] = xF(0x5f8)),
            (rI[xF(0xb0f)] = rI[xF(0x9ed)] = xF(0x22b)),
            (rI[xF(0x681)] = this[xF(0xa38)](xF(0x361)));
          if (!![]) {
            this[xF(0x6ba)](rI);
            return;
          }
          const rK = 0x2;
          for (let rL = 0x1; rL <= rK; rL++) {
            rI[xF(0xa2f)]();
            let rM = 0x1 - rL / rK;
            (rM *= 0x1 + Math[xF(0x12d)](rJ + rL) * 0.5),
              (rM = 0x1 + rM * 0.5),
              (rI[xF(0xae3)] *= Math[xF(0x3ce)](rL / rK, 0x2)),
              rI[xF(0x18a)](rM, rM),
              rL !== rK &&
                ((rI[xF(0xae3)] *= 0.7),
                (rI[xF(0x1cc)] = xF(0x432)),
                (rI[xF(0x4ff)] = xF(0x645))),
              this[xF(0x6ba)](rI),
              rI[xF(0xbec)]();
          }
        }
        [ux(0x51b)](rI, rJ = 0xbe) {
          const xG = ux;
          rI[xG(0xa2f)](),
            rI[xG(0xc0e)](),
            rI[xG(0x4a6)](0x0, -0x46 + rJ + 0x1e),
            rI[xG(0xa7c)](0x1a, -0x46 + rJ),
            rI[xG(0xa7c)](0xd, -0x46),
            rI[xG(0xa7c)](-0xd, -0x46),
            rI[xG(0xa7c)](-0x1a, -0x46 + rJ),
            rI[xG(0xa7c)](0x0, -0x46 + rJ + 0x1e),
            rI[xG(0x173)](),
            rI[xG(0x615)](),
            rI[xG(0x8ae)](),
            rI[xG(0xbec)](),
            rI[xG(0xa2f)](),
            rI[xG(0xc0e)](),
            rI[xG(0x4a6)](-0x12, -0x46),
            rI[xG(0xa39)](-0x5, -0x50, -0xa, -0x69),
            rI[xG(0x4c4)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rI[xG(0xa39)](0x5, -0x50, 0x12, -0x46),
            rI[xG(0xa39)](0x0, -0x3c, -0x12, -0x46),
            rI[xG(0x1d2)](),
            this[xG(0xcbd)]
              ? ((rI[xG(0x681)] = this[xG(0xa38)](xG(0xa09))),
                (rI[xG(0x669)] = this[xG(0xa38)](xG(0xaae))))
              : (rI[xG(0x669)] = this[xG(0xa38)](xG(0x80e))),
            rI[xG(0x615)](),
            (rI[xG(0x71e)] = 0xa),
            rI[xG(0x8ae)](),
            rI[xG(0xbec)]();
        }
        [ux(0x6ba)](rI) {
          const xH = ux;
          rI[xH(0xa2f)](), rI[xH(0xc0e)]();
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            rI[xH(0x4a6)](0x14, -0x1e),
              rI[xH(0xa39)](0x5a, -0xa, 0x32, -0x32),
              rI[xH(0xa7c)](0xa0, -0x32),
              rI[xH(0xa39)](0x8c, 0x3c, 0x14, 0x0),
              rI[xH(0x18a)](-0x1, 0x1);
          }
          rI[xH(0x173)](),
            rI[xH(0x615)](),
            rI[xH(0x8ae)](),
            rI[xH(0xbec)](),
            this[xH(0x51b)](rI),
            rI[xH(0xa2f)](),
            rI[xH(0xc0e)](),
            rI[xH(0x878)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rI[xH(0xa7c)](-0x32, 0x1e),
            rI[xH(0xa7c)](-0x1e, 0x1e),
            rI[xH(0xa7c)](-0x1f, 0x32),
            rI[xH(0xa7c)](0x1f, 0x32),
            rI[xH(0xa7c)](0x1e, 0x1e),
            rI[xH(0xa7c)](0x32, 0x1e),
            rI[xH(0xa7c)](0x32, 0x0),
            rI[xH(0x615)](),
            rI[xH(0x173)](),
            rI[xH(0x8ae)](),
            rI[xH(0xc0e)](),
            rI[xH(0xb04)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rI[xH(0xb04)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rI[xH(0x681)] = rI[xH(0x669)]),
            rI[xH(0x615)](),
            rI[xH(0xbec)]();
        }
        [ux(0xa36)](rI) {
          const xI = ux;
          rI[xI(0xa60)](this[xI(0x911)] / 0x64), (rI[xI(0x669)] = xI(0x3ee));
          const rJ = this[xI(0xa38)](xI(0x4f2)),
            rK = this[xI(0xa38)](xI(0x95a));
          (this[xI(0x849)] += (pR / 0x12c) * (this[xI(0x523)] ? 0x1 : -0x1)),
            (this[xI(0x849)] = Math[xI(0x585)](
              0x1,
              Math[xI(0x9da)](0x0, this[xI(0x849)])
            ));
          const rL = this[xI(0x7af)] ? 0x1 : this[xI(0x849)],
            rM = 0x1 - rL;
          rI[xI(0xa2f)](),
            rI[xI(0xc0e)](),
            rI[xI(0x30e)](
              (0x30 +
                (Math[xI(0x12d)](this[xI(0x291)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rL +
                (0x1 - rL) * -0x14,
              0x0
            ),
            rI[xI(0x18a)](1.1, 1.1),
            rI[xI(0x4a6)](0x0, -0xa),
            rI[xI(0x4c4)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rI[xI(0x681)] = rK),
            rI[xI(0x615)](),
            (rI[xI(0x9ed)] = xI(0x22b)),
            (rI[xI(0x71e)] = 0x1c),
            rI[xI(0x173)](),
            rI[xI(0x8ae)](),
            rI[xI(0xbec)]();
          for (let rN = 0x0; rN < 0x2; rN++) {
            const rO = Math[xI(0x12d)](this[xI(0x291)] * 0x1);
            rI[xI(0xa2f)]();
            const rP = rN * 0x2 - 0x1;
            rI[xI(0x18a)](0x1, rP),
              rI[xI(0x30e)](0x32 * rL - rM * 0xa, 0x50 * rL),
              rI[xI(0x568)](rO * 0.2 + 0.3 - rM * 0x1),
              rI[xI(0xc0e)](),
              rI[xI(0x4a6)](0xa, -0xa),
              rI[xI(0xa39)](0x1e, 0x28, -0x14, 0x50),
              rI[xI(0xa39)](0xa, 0x1e, -0xf, 0x0),
              (rI[xI(0x669)] = rJ),
              (rI[xI(0x71e)] = 0x2c),
              (rI[xI(0xb0f)] = rI[xI(0x9ed)] = xI(0x22b)),
              rI[xI(0x8ae)](),
              (rI[xI(0x71e)] -= 0x1c),
              (rI[xI(0x681)] = rI[xI(0x669)] = rK),
              rI[xI(0x615)](),
              rI[xI(0x8ae)](),
              rI[xI(0xbec)]();
          }
          for (let rQ = 0x0; rQ < 0x2; rQ++) {
            const rR = Math[xI(0x12d)](this[xI(0x291)] * 0x1 + 0x1);
            rI[xI(0xa2f)]();
            const rS = rQ * 0x2 - 0x1;
            rI[xI(0x18a)](0x1, rS),
              rI[xI(0x30e)](-0x41 * rL, 0x32 * rL),
              rI[xI(0x568)](rR * 0.3 + 1.3),
              rI[xI(0xc0e)](),
              rI[xI(0x4a6)](0xc, -0x5),
              rI[xI(0xa39)](0x28, 0x1e, 0x0, 0x3c),
              rI[xI(0xa39)](0x14, 0x1e, 0x0, 0x0),
              (rI[xI(0x669)] = rJ),
              (rI[xI(0x71e)] = 0x2c),
              (rI[xI(0xb0f)] = rI[xI(0x9ed)] = xI(0x22b)),
              rI[xI(0x8ae)](),
              (rI[xI(0x71e)] -= 0x1c),
              (rI[xI(0x681)] = rI[xI(0x669)] = rK),
              rI[xI(0x8ae)](),
              rI[xI(0x615)](),
              rI[xI(0xbec)]();
          }
          this[xI(0x270)](rI);
        }
        [ux(0x270)](rI, rJ = 0x1) {
          const xJ = ux;
          rI[xJ(0xc0e)](),
            rI[xJ(0x878)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rI[xJ(0x669)] = xJ(0x3ee)),
            (rI[xJ(0x681)] = this[xJ(0xa38)](xJ(0x971))),
            rI[xJ(0x615)](),
            (rI[xJ(0x71e)] = 0x1e * rJ),
            rI[xJ(0xa2f)](),
            rI[xJ(0x173)](),
            rI[xJ(0x8ae)](),
            rI[xJ(0xbec)](),
            rI[xJ(0xa2f)](),
            rI[xJ(0xc0e)](),
            rI[xJ(0x878)](
              0x0,
              0x0,
              0x64 - rI[xJ(0x71e)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rI[xJ(0x173)](),
            rI[xJ(0xc0e)]();
          for (let rK = 0x0; rK < 0x6; rK++) {
            const rL = (rK / 0x6) * Math["PI"] * 0x2;
            rI[xJ(0xa7c)](
              Math[xJ(0x65c)](rL) * 0x28,
              Math[xJ(0x12d)](rL) * 0x28
            );
          }
          rI[xJ(0x1d2)]();
          for (let rM = 0x0; rM < 0x6; rM++) {
            const rN = (rM / 0x6) * Math["PI"] * 0x2,
              rO = Math[xJ(0x65c)](rN) * 0x28,
              rP = Math[xJ(0x12d)](rN) * 0x28;
            rI[xJ(0x4a6)](rO, rP), rI[xJ(0xa7c)](rO * 0x3, rP * 0x3);
          }
          (rI[xJ(0x71e)] = 0x10 * rJ),
            (rI[xJ(0xb0f)] = rI[xJ(0x9ed)] = xJ(0x22b)),
            rI[xJ(0x8ae)](),
            rI[xJ(0xbec)]();
        }
        [ux(0xbae)](rI) {
          const xK = ux;
          rI[xK(0xa60)](this[xK(0x911)] / 0x82);
          let rJ, rK;
          const rL = 0x2d,
            rM = lq(
              this[xK(0x470)] ||
                (this[xK(0x470)] = this[xK(0x7af)]
                  ? 0x28
                  : Math[xK(0xe0d)]() * 0x3e8)
            );
          let rN = rM() * 6.28;
          const rO = Date[xK(0xa4a)]() / 0xc8,
            rP = [xK(0xb66), xK(0xa11)][xK(0xe56)]((rQ) => this[xK(0xa38)](rQ));
          for (let rQ = 0x0; rQ <= rL; rQ++) {
            (rQ % 0x5 === 0x0 || rQ === rL) &&
              (rQ > 0x0 &&
                ((rI[xK(0x71e)] = 0x19),
                (rI[xK(0x9ed)] = rI[xK(0xb0f)] = xK(0x22b)),
                (rI[xK(0x669)] = rP[0x1]),
                rI[xK(0x8ae)](),
                (rI[xK(0x71e)] = 0xc),
                (rI[xK(0x669)] = rP[0x0]),
                rI[xK(0x8ae)]()),
              rQ !== rL && (rI[xK(0xc0e)](), rI[xK(0x4a6)](rJ, rK)));
            let rR = rQ / 0x32;
            (rR *= rR), (rN += (0.3 + rM() * 0.8) * 0x3);
            const rS = 0x14 + Math[xK(0x12d)](rR * 3.14) * 0x6e,
              rT = Math[xK(0x12d)](rQ + rO) * 0.5,
              rU = Math[xK(0x65c)](rN + rT) * rS,
              rV = Math[xK(0x12d)](rN + rT) * rS,
              rW = rU - rJ,
              rX = rV - rK;
            rI[xK(0xa39)]((rJ + rU) / 0x2 + rX, (rK + rV) / 0x2 - rW, rU, rV),
              (rJ = rU),
              (rK = rV);
          }
        }
        [ux(0xdf0)](rI) {
          const xL = ux;
          rI[xL(0xa60)](this[xL(0x911)] / 0x6e),
            (rI[xL(0x669)] = xL(0x3ee)),
            (rI[xL(0x71e)] = 0x1c),
            rI[xL(0xc0e)](),
            rI[xL(0x878)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rI[xL(0x681)] = this[xL(0xa38)](xL(0x83c))),
            rI[xL(0x615)](),
            rI[xL(0xa2f)](),
            rI[xL(0x173)](),
            rI[xL(0x8ae)](),
            rI[xL(0xbec)](),
            rI[xL(0xc0e)](),
            rI[xL(0x878)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rI[xL(0x681)] = xL(0xaed)),
            rI[xL(0x615)](),
            rI[xL(0xa2f)](),
            rI[xL(0x173)](),
            rI[xL(0x8ae)](),
            rI[xL(0xbec)]();
          const rJ = lq(
              this[xL(0xd48)] ||
                (this[xL(0xd48)] = this[xL(0x7af)]
                  ? 0x1e
                  : Math[xL(0xe0d)]() * 0x3e8)
            ),
            rK = this[xL(0xa38)](xL(0x5e3)),
            rL = this[xL(0xa38)](xL(0xda4));
          for (let rO = 0x0; rO < 0x3; rO++) {
            rI[xL(0xc0e)]();
            const rP = 0xc;
            for (let rQ = 0x0; rQ < rP; rQ++) {
              const rR = (Math["PI"] * 0x2 * rQ) / rP;
              rI[xL(0xa2f)](),
                rI[xL(0x568)](rR + rJ() * 0.4),
                rI[xL(0x30e)](0x3c + rJ() * 0xa, 0x0),
                rI[xL(0x4a6)](rJ() * 0x5, rJ() * 0x5),
                rI[xL(0x4c4)](
                  0x14 + rJ() * 0xa,
                  rJ() * 0x14,
                  0x28 + rJ() * 0x14,
                  rJ() * 0x1e + 0xa,
                  0x3c + rJ() * 0xa,
                  rJ() * 0xa + 0xa
                ),
                rI[xL(0xbec)]();
            }
            (rI[xL(0xb0f)] = rI[xL(0x9ed)] = xL(0x22b)),
              (rI[xL(0x71e)] = 0x12 - rO * 0x2),
              (rI[xL(0x669)] = rK),
              rI[xL(0x8ae)](),
              (rI[xL(0x71e)] -= 0x8),
              (rI[xL(0x669)] = rL),
              rI[xL(0x8ae)]();
          }
          const rM = 0x28;
          rI[xL(0x568)](-this[xL(0xa8e)]),
            (rI[xL(0x681)] = this[xL(0xa38)](xL(0x16f))),
            (rI[xL(0x669)] = this[xL(0xa38)](xL(0x2ca))),
            (rI[xL(0x71e)] = 0x9);
          const rN = this[xL(0x11f)] * 0x6;
          for (let rS = 0x0; rS < rN; rS++) {
            const rT = ((rS - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rI[xL(0xc0e)](),
              rI[xL(0xb04)](
                Math[xL(0x65c)](rT) * rM,
                Math[xL(0x12d)](rT) * rM * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rI[xL(0x615)](),
              rI[xL(0x8ae)]();
          }
        }
        [ux(0x26a)](rI) {
          const xM = ux;
          rI[xM(0x568)](-this[xM(0xa8e)]),
            rI[xM(0xa60)](this[xM(0x911)] / 0x3c),
            (rI[xM(0xb0f)] = rI[xM(0x9ed)] = xM(0x22b));
          let rJ =
            Math[xM(0x12d)](Date[xM(0xa4a)]() / 0x12c + this[xM(0x291)] * 0.5) *
              0.5 +
            0.5;
          (rJ *= 1.5),
            rI[xM(0xc0e)](),
            rI[xM(0x4a6)](-0x32, -0x32 - rJ * 0x3),
            rI[xM(0xa39)](0x0, -0x3c, 0x32, -0x32 - rJ * 0x3),
            rI[xM(0xa39)](0x50 - rJ * 0x3, -0xa, 0x50, 0x32),
            rI[xM(0xa39)](0x46, 0x4b, 0x28, 0x4e + rJ * 0x5),
            rI[xM(0xa7c)](0x1e, 0x3c + rJ * 0x5),
            rI[xM(0xa39)](0x2d, 0x37, 0x32, 0x2d),
            rI[xM(0xa39)](0x0, 0x41, -0x32, 0x32),
            rI[xM(0xa39)](-0x2d, 0x37, -0x1e, 0x3c + rJ * 0x3),
            rI[xM(0xa7c)](-0x28, 0x4e + rJ * 0x5),
            rI[xM(0xa39)](-0x46, 0x4b, -0x50, 0x32),
            rI[xM(0xa39)](-0x50 + rJ * 0x3, -0xa, -0x32, -0x32 - rJ * 0x3),
            (rI[xM(0x681)] = this[xM(0xa38)](xM(0x1b1))),
            rI[xM(0x615)](),
            (rI[xM(0x669)] = xM(0x3ee)),
            rI[xM(0xa2f)](),
            rI[xM(0x173)](),
            (rI[xM(0x71e)] = 0xe),
            rI[xM(0x8ae)](),
            rI[xM(0xbec)]();
          for (let rK = 0x0; rK < 0x2; rK++) {
            rI[xM(0xa2f)](),
              rI[xM(0x18a)](rK * 0x2 - 0x1, 0x1),
              rI[xM(0x30e)](-0x22, -0x18 - rJ * 0x3),
              rI[xM(0x568)](-0.6),
              rI[xM(0x18a)](1.3, 1.3),
              rI[xM(0xc0e)](),
              rI[xM(0x4a6)](-0x14, 0x0),
              rI[xM(0xa39)](-0x14, -0x19, 0x0, -0x28),
              rI[xM(0xa39)](0x14, -0x19, 0x14, 0x0),
              rI[xM(0x615)](),
              rI[xM(0x173)](),
              (rI[xM(0x71e)] = 0xd),
              rI[xM(0x8ae)](),
              rI[xM(0xbec)]();
          }
          rI[xM(0xa2f)](),
            rI[xM(0xc0e)](),
            rI[xM(0xb04)](
              0x0,
              0x1e,
              0x24 - rJ * 0x2,
              0x8 - rJ,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rI[xM(0x681)] = this[xM(0xa38)](xM(0x396))),
            (rI[xM(0xae3)] *= 0.2),
            rI[xM(0x615)](),
            rI[xM(0xbec)](),
            (rI[xM(0x681)] = rI[xM(0x669)] = this[xM(0xa38)](xM(0xd82)));
          for (let rL = 0x0; rL < 0x2; rL++) {
            rI[xM(0xa2f)](),
              rI[xM(0x18a)](rL * 0x2 - 0x1, 0x1),
              rI[xM(0x30e)](0x19 - rJ * 0x1, 0xf - rJ * 0x3),
              rI[xM(0x568)](-0.3),
              rI[xM(0xc0e)](),
              rI[xM(0x878)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rI[xM(0x615)](),
              rI[xM(0xbec)]();
          }
          rI[xM(0xa2f)](),
            (rI[xM(0x71e)] = 0x5),
            rI[xM(0x30e)](0x0, 0x21 - rJ * 0x1),
            rI[xM(0xc0e)](),
            rI[xM(0x4a6)](-0xc, 0x0),
            rI[xM(0x4c4)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rI[xM(0x4c4)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rI[xM(0x8ae)](),
            rI[xM(0xbec)]();
        }
        [ux(0x71f)](rI) {
          const xN = ux;
          rI[xN(0xa60)](this[xN(0x911)] / 0x3c),
            rI[xN(0x568)](-Math["PI"] / 0x2),
            rI[xN(0xc0e)](),
            rI[xN(0x4a6)](0x32, 0x50),
            rI[xN(0xa39)](0x1e, 0x1e, 0x32, -0x14),
            rI[xN(0xa39)](0x5a, -0x64, 0x0, -0x64),
            rI[xN(0xa39)](-0x5a, -0x64, -0x32, -0x14),
            rI[xN(0xa39)](-0x1e, 0x1e, -0x32, 0x50),
            (rI[xN(0x681)] = this[xN(0xa38)](xN(0xdf3))),
            rI[xN(0x615)](),
            (rI[xN(0x9ed)] = rI[xN(0xb0f)] = xN(0x22b)),
            (rI[xN(0x71e)] = 0x14),
            rI[xN(0x173)](),
            (rI[xN(0x669)] = xN(0x3ee)),
            rI[xN(0x8ae)](),
            (rI[xN(0x681)] = this[xN(0xa38)](xN(0xb13)));
          const rJ = 0x6;
          rI[xN(0xc0e)](), rI[xN(0x4a6)](-0x32, 0x50);
          for (let rK = 0x0; rK < rJ; rK++) {
            const rL = (((rK + 0.5) / rJ) * 0x2 - 0x1) * 0x32,
              rM = (((rK + 0x1) / rJ) * 0x2 - 0x1) * 0x32;
            rI[xN(0xa39)](rL, 0x1e, rM, 0x50);
          }
          (rI[xN(0x71e)] = 0x8),
            rI[xN(0x615)](),
            rI[xN(0x8ae)](),
            (rI[xN(0x669)] = rI[xN(0x681)] = xN(0x3ee)),
            rI[xN(0xa2f)](),
            rI[xN(0x30e)](0x0, -0x5),
            rI[xN(0xc0e)](),
            rI[xN(0x4a6)](0x0, 0x0),
            rI[xN(0x4c4)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rI[xN(0x8ae)](),
            rI[xN(0xbec)]();
          for (let rN = 0x0; rN < 0x2; rN++) {
            rI[xN(0xa2f)](),
              rI[xN(0x18a)](rN * 0x2 - 0x1, 0x1),
              rI[xN(0x30e)](0x19, -0x38),
              rI[xN(0xc0e)](),
              rI[xN(0x878)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rI[xN(0x173)](),
              (rI[xN(0x71e)] = 0xf),
              rI[xN(0x8ae)](),
              rI[xN(0x615)](),
              rI[xN(0xbec)]();
          }
        }
        [ux(0xa1e)](rI) {
          const xO = ux;
          rI[xO(0xa60)](this[xO(0x911)] / 0x32),
            (rI[xO(0x669)] = xO(0x3ee)),
            (rI[xO(0x71e)] = 0x10);
          const rJ = 0x7;
          rI[xO(0xc0e)]();
          const rK = 0x12;
          rI[xO(0x681)] = this[xO(0xa38)](xO(0x399));
          const rL = Math[xO(0x12d)](pQ / 0x258);
          for (let rM = 0x0; rM < 0x2; rM++) {
            const rN = 1.2 - rM * 0.2;
            for (let rO = 0x0; rO < rJ; rO++) {
              rI[xO(0xa2f)](),
                rI[xO(0x568)](
                  (rO / rJ) * Math["PI"] * 0x2 + (rM / rJ) * Math["PI"]
                ),
                rI[xO(0x30e)](0x2e, 0x0),
                rI[xO(0x18a)](rN, rN);
              const rP = Math[xO(0x12d)](rL + rO * 0.05 * (0x1 - rM * 0.5));
              rI[xO(0xc0e)](),
                rI[xO(0x4a6)](0x0, rK),
                rI[xO(0xa39)](0x14, rK, 0x28 + rP, 0x0 + rP * 0x5),
                rI[xO(0xa39)](0x14, -rK, 0x0, -rK),
                rI[xO(0x615)](),
                rI[xO(0x173)](),
                rI[xO(0x8ae)](),
                rI[xO(0xbec)]();
            }
          }
          rI[xO(0xc0e)](),
            rI[xO(0x878)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rI[xO(0x681)] = this[xO(0xa38)](xO(0xd6e))),
            rI[xO(0x615)](),
            rI[xO(0x173)](),
            (rI[xO(0x71e)] = 0x19),
            rI[xO(0x8ae)]();
        }
        [ux(0x38c)](rI) {
          const xP = ux;
          rI[xP(0xa60)](this[xP(0x911)] / 0x28);
          let rJ = this[xP(0x291)];
          const rK = this[xP(0x7af)] ? 0x0 : Math[xP(0x12d)](pQ / 0x64) * 0xf;
          (rI[xP(0xb0f)] = rI[xP(0x9ed)] = xP(0x22b)),
            rI[xP(0xc0e)](),
            rI[xP(0xa2f)]();
          const rL = 0x3;
          for (let rM = 0x0; rM < 0x2; rM++) {
            const rN = rM === 0x0 ? 0x1 : -0x1;
            for (let rO = 0x0; rO <= rL; rO++) {
              rI[xP(0xa2f)](), rI[xP(0x4a6)](0x0, 0x0);
              const rP = Math[xP(0x12d)](rJ + rO + rM);
              rI[xP(0x568)](((rO / rL) * 0x2 - 0x1) * 0.6 + 1.4 + rP * 0.15),
                rI[xP(0xa7c)](0x2d + rN * rK, 0x0),
                rI[xP(0x568)](0.2 + (rP * 0.5 + 0.5) * 0.1),
                rI[xP(0xa7c)](0x4b, 0x0),
                rI[xP(0xbec)]();
            }
            rI[xP(0x18a)](0x1, -0x1);
          }
          rI[xP(0xbec)](),
            (rI[xP(0x71e)] = 0x8),
            (rI[xP(0x669)] = this[xP(0xa38)](xP(0x4f6))),
            rI[xP(0x8ae)](),
            rI[xP(0xa2f)](),
            rI[xP(0x30e)](0x0, rK),
            this[xP(0x45b)](rI),
            rI[xP(0xbec)]();
        }
        [ux(0x45b)](rI, rJ = ![]) {
          const xQ = ux;
          (rI[xQ(0xb0f)] = rI[xQ(0x9ed)] = xQ(0x22b)),
            rI[xQ(0x568)](-0.15),
            rI[xQ(0xc0e)](),
            rI[xQ(0x4a6)](-0x32, 0x0),
            rI[xQ(0xa7c)](0x28, 0x0),
            rI[xQ(0x4a6)](0xf, 0x0),
            rI[xQ(0xa7c)](-0x5, 0x19),
            rI[xQ(0x4a6)](-0x3, 0x0),
            rI[xQ(0xa7c)](0xc, -0x14),
            rI[xQ(0x4a6)](-0xe, -0x5),
            rI[xQ(0xa7c)](-0x2e, -0x17),
            (rI[xQ(0x71e)] = 0x1c),
            (rI[xQ(0x669)] = this[xQ(0xa38)](xQ(0x782))),
            rI[xQ(0x8ae)](),
            (rI[xQ(0x669)] = this[xQ(0xa38)](xQ(0x809))),
            (rI[xQ(0x71e)] -= rJ ? 0xf : 0xa),
            rI[xQ(0x8ae)]();
        }
        [ux(0x725)](rI) {
          const xR = ux;
          rI[xR(0xa60)](this[xR(0x911)] / 0x64),
            rI[xR(0xc0e)](),
            rI[xR(0x878)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rI[xR(0x681)] = this[xR(0xa38)](xR(0x553))),
            rI[xR(0x615)](),
            rI[xR(0x173)](),
            (rI[xR(0x71e)] = this[xR(0xcbd)] ? 0x32 : 0x1e),
            (rI[xR(0x669)] = xR(0x3ee)),
            rI[xR(0x8ae)]();
          if (!this[xR(0x4d5)]) {
            const rJ = new Path2D(),
              rK = this[xR(0xcbd)] ? 0x2 : 0x3;
            for (let rL = 0x0; rL <= rK; rL++) {
              for (let rM = 0x0; rM <= rK; rM++) {
                const rN =
                    ((rM / rK + Math[xR(0xe0d)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rL % 0x2 === 0x0 ? -0x14 : 0x0),
                  rO = ((rL / rK + Math[xR(0xe0d)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rP = Math[xR(0xe0d)]() * 0xd + (this[xR(0xcbd)] ? 0xe : 0x7);
                rJ[xR(0x4a6)](rN, rO),
                  rJ[xR(0x878)](rN, rO, rP, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xR(0x4d5)] = rJ;
          }
          rI[xR(0xc0e)](),
            rI[xR(0x878)](
              0x0,
              0x0,
              0x64 - rI[xR(0x71e)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rI[xR(0x173)](),
            (rI[xR(0x681)] = xR(0x26d)),
            rI[xR(0x615)](this[xR(0x4d5)]);
        }
        [ux(0xcd0)](rI) {
          const xS = ux;
          rI[xS(0xa60)](this[xS(0x911)] / 0x64),
            rI[xS(0xa2f)](),
            rI[xS(0x30e)](-0xf5, -0xdc),
            (rI[xS(0x669)] = this[xS(0xa38)](xS(0xac4))),
            (rI[xS(0x681)] = this[xS(0xa38)](xS(0x54c))),
            (rI[xS(0x71e)] = 0xf),
            (rI[xS(0x9ed)] = rI[xS(0xb0f)] = xS(0x22b));
          const rJ = !this[xS(0xcbd)];
          if (rJ) {
            rI[xS(0xa2f)](),
              rI[xS(0x30e)](0x10e, 0xde),
              rI[xS(0xa2f)](),
              rI[xS(0x568)](-0.1);
            for (let rK = 0x0; rK < 0x3; rK++) {
              rI[xS(0xc0e)](),
                rI[xS(0x4a6)](-0x5, 0x0),
                rI[xS(0xa39)](0x0, 0x28, 0x5, 0x0),
                rI[xS(0x8ae)](),
                rI[xS(0x615)](),
                rI[xS(0x30e)](0x28, 0x0);
            }
            rI[xS(0xbec)](), rI[xS(0x30e)](0x17, 0x32), rI[xS(0x568)](0.05);
            for (let rL = 0x0; rL < 0x2; rL++) {
              rI[xS(0xc0e)](),
                rI[xS(0x4a6)](-0x5, 0x0),
                rI[xS(0xa39)](0x0, -0x28, 0x5, 0x0),
                rI[xS(0x8ae)](),
                rI[xS(0x615)](),
                rI[xS(0x30e)](0x28, 0x0);
            }
            rI[xS(0xbec)]();
          }
          rI[xS(0x615)](ln),
            rI[xS(0x8ae)](ln),
            rI[xS(0x615)](lo),
            rI[xS(0x8ae)](lo),
            rI[xS(0xbec)](),
            rJ &&
              (rI[xS(0xc0e)](),
              rI[xS(0x878)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rI[xS(0x878)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rI[xS(0x681)] = xS(0x3ee)),
              rI[xS(0x615)]());
        }
        [ux(0xc99)](rI) {
          const xT = ux;
          rI[xT(0xa60)](this[xT(0x911)] / 0x46), rI[xT(0xa2f)]();
          !this[xT(0xcbd)] && rI[xT(0x568)](Math["PI"] / 0x2);
          rI[xT(0x30e)](0x0, 0x2d),
            rI[xT(0xc0e)](),
            rI[xT(0x4a6)](0x0, -0x64),
            rI[xT(0x4c4)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rI[xT(0x4c4)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rI[xT(0xb0f)] = rI[xT(0x9ed)] = xT(0x22b)),
            (rI[xT(0x71e)] = 0x3c),
            (rI[xT(0x669)] = this[xT(0xa38)](xT(0xbad))),
            rI[xT(0x8ae)](),
            (rI[xT(0x71e)] -= this[xT(0xcbd)] ? 0x23 : 0x14),
            (rI[xT(0x681)] = rI[xT(0x669)] = this[xT(0xa38)](xT(0x1c5))),
            rI[xT(0x8ae)](),
            (rI[xT(0x71e)] -= this[xT(0xcbd)] ? 0x16 : 0xf),
            (rI[xT(0x681)] = rI[xT(0x669)] = this[xT(0xa38)](xT(0xae6))),
            rI[xT(0x8ae)](),
            rI[xT(0x615)](),
            rI[xT(0x30e)](0x0, -0x24);
          if (this[xT(0xcbd)]) rI[xT(0xa60)](0.9);
          rI[xT(0xc0e)](),
            rI[xT(0xb04)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rI[xT(0x681)] = this[xT(0xa38)](xT(0xd34))),
            rI[xT(0x615)](),
            rI[xT(0x173)](),
            (rI[xT(0x71e)] = 0xd),
            (rI[xT(0x669)] = xT(0x3ee)),
            rI[xT(0x8ae)](),
            rI[xT(0xc0e)](),
            rI[xT(0xb04)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rI[xT(0x681)] = xT(0xdf4)),
            rI[xT(0x615)](),
            rI[xT(0xbec)]();
        }
        [ux(0xe32)](rI) {
          const xU = ux;
          rI[xU(0xa60)](this[xU(0x911)] / 0x19);
          !this[xU(0x7af)] &&
            this[xU(0xcbd)] &&
            rI[xU(0x568)](Math[xU(0x12d)](pQ / 0x64 + this["id"]) * 0.15);
          rI[xU(0xc0e)](),
            rI[xU(0x8b6)](-0x16, -0x16, 0x2c, 0x2c),
            (rI[xU(0x681)] = this[xU(0xa38)](xU(0x62d))),
            rI[xU(0x615)](),
            (rI[xU(0x71e)] = 0x6),
            (rI[xU(0x9ed)] = xU(0x22b)),
            (rI[xU(0x669)] = this[xU(0xa38)](xU(0x54c))),
            rI[xU(0x8ae)](),
            rI[xU(0xc0e)]();
          const rJ = this[xU(0x7af)] ? 0x1 : 0x1 - Math[xU(0x12d)](pQ / 0x1f4),
            rK = rO(0x0, 0.25),
            rL = 0x1 - rO(0.25, 0.25),
            rM = rO(0.5, 0.25),
            rN = rO(0.75, 0.25);
          function rO(rP, rQ) {
            const xV = xU;
            return Math[xV(0x585)](0x1, Math[xV(0x9da)](0x0, (rJ - rP) / rQ));
          }
          rI[xU(0x568)]((rL * Math["PI"]) / 0x4);
          for (let rP = 0x0; rP < 0x2; rP++) {
            const rQ = (rP * 0x2 - 0x1) * 0x7 * rN;
            for (let rR = 0x0; rR < 0x3; rR++) {
              let rS = rK * (-0xb + rR * 0xb);
              rI[xU(0x4a6)](rS, rQ),
                rI[xU(0x878)](rS, rQ, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rI[xU(0x681)] = this[xU(0xa38)](xU(0xb86))), rI[xU(0x615)]();
        }
        [ux(0xaff)](rI) {
          const xW = ux;
          rI[xW(0xa2f)](),
            rI[xW(0x30e)](this["x"], this["y"]),
            this[xW(0x76b)](rI),
            rI[xW(0x568)](this[xW(0xa8e)]),
            (rI[xW(0x71e)] = 0x8);
          const rJ = (rO, rP) => {
              const xX = xW;
              (rL = this[xX(0x911)] / 0x14),
                rI[xX(0x18a)](rL, rL),
                rI[xX(0xc0e)](),
                rI[xX(0x878)](0x0, 0x0, 0x14, 0x0, l1),
                (rI[xX(0x681)] = this[xX(0xa38)](rO)),
                rI[xX(0x615)](),
                (rI[xX(0x669)] = this[xX(0xa38)](rP)),
                rI[xX(0x8ae)]();
            },
            rK = (rO, rP, rQ) => {
              const xY = xW;
              (rO = l9[rO]),
                rI[xY(0x18a)](this[xY(0x911)], this[xY(0x911)]),
                (rI[xY(0x71e)] /= this[xY(0x911)]),
                (rI[xY(0x669)] = this[xY(0xa38)](rQ)),
                rI[xY(0x8ae)](rO),
                (rI[xY(0x681)] = this[xY(0xa38)](rP)),
                rI[xY(0x615)](rO);
            };
          let rL, rM, rN;
          switch (this[xW(0x171)]) {
            case cR[xW(0xe32)]:
            case cR[xW(0x1f7)]:
              this[xW(0xe32)](rI);
              break;
            case cR[xW(0xc99)]:
            case cR[xW(0x813)]:
              this[xW(0xc99)](rI);
              break;
            case cR[xW(0xb51)]:
              (rI[xW(0x669)] = xW(0x3ee)),
                (rI[xW(0x71e)] = 0x14),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x361))),
                rI[xW(0x30e)](-this[xW(0x911)], 0x0),
                rI[xW(0x568)](-Math["PI"] / 0x2),
                rI[xW(0xa60)](0.5),
                rI[xW(0x30e)](0x0, 0x46),
                this[xW(0x51b)](rI, this[xW(0x911)] * 0x4);
              break;
            case cR[xW(0xba7)]:
              this[xW(0xba7)](rI);
              break;
            case cR[xW(0x860)]:
              this[xW(0xcd0)](rI);
              break;
            case cR[xW(0xcd0)]:
              this[xW(0xcd0)](rI);
              break;
            case cR[xW(0x725)]:
            case cR[xW(0x1fc)]:
              this[xW(0x725)](rI);
              break;
            case cR[xW(0x958)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x1e), this[xW(0x45b)](rI, !![]);
              break;
            case cR[xW(0x38c)]:
              this[xW(0x38c)](rI);
              break;
            case cR[xW(0x35b)]:
              (rI[xW(0x71e)] *= 0.7),
                rK(xW(0xcb5), xW(0x399), xW(0x40b)),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0.6, 0x0, l1),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0xd6e))),
                rI[xW(0x615)](),
                rI[xW(0x173)](),
                (rI[xW(0x669)] = xW(0xe46)),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0xa1e)]:
              this[xW(0xa1e)](rI);
              break;
            case cR[xW(0xd22)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x16),
                rI[xW(0x568)](Math["PI"] / 0x2),
                rI[xW(0xc0e)]();
              for (let sA = 0x0; sA < 0x2; sA++) {
                rI[xW(0x4a6)](-0xa, -0x1e),
                  rI[xW(0x4c4)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rI[xW(0x18a)](0x1, -0x1);
              }
              (rI[xW(0x71e)] = 0x10),
                (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x177))),
                rI[xW(0x8ae)](),
                (rI[xW(0x71e)] -= 0x7),
                (rI[xW(0x669)] = xW(0xe2b)),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x9c9)]:
              this[xW(0x71f)](rI);
              break;
            case cR[xW(0x4b1)]:
              this[xW(0x26a)](rI);
              break;
            case cR[xW(0xdf0)]:
              this[xW(0xdf0)](rI);
              break;
            case cR[xW(0xbae)]:
              this[xW(0xbae)](rI);
              break;
            case cR[xW(0x2fd)]:
              !this[xW(0x22d)] &&
                ((this[xW(0x22d)] = new lU(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cX[xW(0x72f)],
                  0x19
                )),
                (this[xW(0x22d)][xW(0xe6a)] = !![]),
                (this[xW(0x22d)][xW(0x5f4)] = !![]),
                (this[xW(0x22d)][xW(0x4fb)] = 0x1),
                (this[xW(0x22d)][xW(0x242)] = !![]),
                (this[xW(0x22d)][xW(0x5ef)] = xW(0xacf)),
                (this[xW(0x22d)][xW(0xadb)] = this[xW(0xadb)]));
              rI[xW(0x568)](Math["PI"] / 0x2),
                (this[xW(0x22d)][xW(0x671)] = this[xW(0x671)]),
                (this[xW(0x22d)][xW(0x911)] = this[xW(0x911)]),
                this[xW(0x22d)][xW(0xaff)](rI);
              break;
            case cR[xW(0xa36)]:
              this[xW(0xa36)](rI);
              break;
            case cR[xW(0x17f)]:
              rI[xW(0xa2f)](),
                rI[xW(0xa60)](this[xW(0x911)] / 0x64),
                rI[xW(0x568)]((Date[xW(0xa4a)]() / 0x190) % 6.28),
                this[xW(0x270)](rI, 1.5),
                rI[xW(0xbec)]();
              break;
            case cR[xW(0x8bd)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x14),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x0, -0x5),
                rI[xW(0xa7c)](-0x8, 0x0),
                rI[xW(0xa7c)](0x0, 0x5),
                rI[xW(0xa7c)](0x8, 0x0),
                rI[xW(0x1d2)](),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x20),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x9ea))),
                rI[xW(0x8ae)](),
                (rI[xW(0x71e)] = 0x14),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x18f))),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x342)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x14),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x5, -0x5),
                rI[xW(0xa7c)](-0x5, 0x5),
                rI[xW(0xa7c)](0x5, 0x0),
                rI[xW(0x1d2)](),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x20),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xb87))),
                rI[xW(0x8ae)](),
                (rI[xW(0x71e)] = 0x14),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xc6e))),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x384)]:
              this[xW(0x213)](rI, xW(0x988));
              break;
            case cR[xW(0x46f)]:
              this[xW(0x213)](rI, xW(0xc80));
              break;
            case cR[xW(0x5b2)]:
              this[xW(0x213)](rI, xW(0x909));
              break;
            case cR[xW(0xa25)]:
              this[xW(0xa25)](rI);
              break;
            case cR[xW(0x5b4)]:
              this[xW(0x5b4)](rI);
              break;
            case cR[xW(0xd18)]:
              this[xW(0xd18)](rI);
              break;
            case cR[xW(0xc69)]:
              this[xW(0xd18)](rI, !![]);
              break;
            case cR[xW(0x64e)]:
              this[xW(0x64e)](rI);
              break;
            case cR[xW(0xb72)]:
              this[xW(0xb72)](rI);
              break;
            case cR[xW(0xd7a)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x19),
                lF(rI, 0x19),
                (rI[xW(0x9ed)] = xW(0x22b)),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x975))),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x831))),
                rI[xW(0x615)](),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x7c0)]:
              rI[xW(0x30e)](-this[xW(0x911)], 0x0);
              const rO = Date[xW(0xa4a)]() / 0x32,
                rP = this[xW(0x911)] * 0x2;
              rI[xW(0xc0e)]();
              const rQ = 0x32;
              for (let sB = 0x0; sB < rQ; sB++) {
                const sC = sB / rQ,
                  sD = sC * Math["PI"] * (this[xW(0x7af)] ? 7.75 : 0xa) - rO,
                  sE = sC * rP,
                  sF = sE * this[xW(0x54b)];
                rI[xW(0xa7c)](sE, Math[xW(0x12d)](sD) * sF);
              }
              (rI[xW(0x669)] = xW(0x624)),
                (rI[xW(0x9ed)] = rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x4),
                (rI[xW(0x9b6)] = xW(0xc49)),
                (rI[xW(0x636)] = this[xW(0x7af)] ? 0xa : 0x14),
                rI[xW(0x8ae)](),
                rI[xW(0x8ae)](),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0xcfd)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x37), this[xW(0x380)](rI);
              break;
            case cR[xW(0x329)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x14), rI[xW(0xc0e)]();
              for (let sG = 0x0; sG < 0x2; sG++) {
                rI[xW(0x4a6)](-0x17, -0x5),
                  rI[xW(0xa39)](0x0, 5.5, 0x17, -0x5),
                  rI[xW(0x18a)](0x1, -0x1);
              }
              (rI[xW(0x71e)] = 0xf),
                (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x54c))),
                rI[xW(0x8ae)](),
                (rI[xW(0x71e)] -= 0x6),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x62d))),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x117)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x23),
                rI[xW(0xc0e)](),
                rI[xW(0xb04)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x6e6))),
                rI[xW(0x615)](),
                rI[xW(0x173)](),
                (rI[xW(0x669)] = xW(0xaed)),
                (rI[xW(0x71e)] = 0x12),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x1e, 0x0),
                rI[xW(0x4c4)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rI[xW(0x4c4)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rI[xW(0x71e)] = 0x3),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                (rI[xW(0x669)] = rI[xW(0x681)] = xW(0x174)),
                rI[xW(0x615)](),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x95e)]:
              if (this[xW(0x60d)] !== this[xW(0xa6d)]) {
                this[xW(0x60d)] = this[xW(0xa6d)];
                const sH = new Path2D(),
                  sI = Math[xW(0x22b)](
                    this[xW(0xa6d)] * (this[xW(0xa6d)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sJ = (Math["PI"] * 0x2) / sI,
                  sK = this[xW(0xa6d)] < 0x64 ? 0.3 : 0.1;
                for (let sL = 0x0; sL < sI; sL++) {
                  const sM = sL * sJ,
                    sN = sM + Math[xW(0xe0d)]() * sJ,
                    sO = 0x1 - Math[xW(0xe0d)]() * sK;
                  sH[xW(0xa7c)](
                    Math[xW(0x65c)](sN) * this[xW(0xa6d)] * sO,
                    Math[xW(0x12d)](sN) * this[xW(0xa6d)] * sO
                  );
                }
                sH[xW(0x1d2)](), (this[xW(0xe70)] = sH);
              }
              (rL = this[xW(0x911)] / this[xW(0xa6d)]), rI[xW(0x18a)](rL, rL);
              const rR = this[xW(0x160)] ? li : [xW(0x38f), xW(0xb40)];
              (rI[xW(0x669)] = this[xW(0xa38)](rR[0x1])),
                rI[xW(0x8ae)](this[xW(0xe70)]),
                (rI[xW(0x681)] = this[xW(0xa38)](rR[0x0])),
                rI[xW(0x615)](this[xW(0xe70)]);
              break;
            case cR[xW(0x3df)]:
              if (this[xW(0x60d)] !== this[xW(0xa6d)]) {
                this[xW(0x60d)] = this[xW(0xa6d)];
                const sP = Math[xW(0x22b)](
                    this[xW(0xa6d)] > 0xc8
                      ? this[xW(0xa6d)] * 0.18
                      : this[xW(0xa6d)] * 0.25
                  ),
                  sQ = 0.5,
                  sR = 0.85;
                this[xW(0xe70)] = lb(sP, this[xW(0xa6d)], sQ, sR);
                if (this[xW(0xa6d)] < 0x12c) {
                  const sS = new Path2D(),
                    sT = sP * 0x2;
                  for (let sU = 0x0; sU < sT; sU++) {
                    const sV = ((sU + 0x1) / sT) * Math["PI"] * 0x2;
                    let sW = (sU % 0x2 === 0x0 ? 0.7 : 1.2) * this[xW(0xa6d)];
                    sS[xW(0xa7c)](
                      Math[xW(0x65c)](sV) * sW,
                      Math[xW(0x12d)](sV) * sW
                    );
                  }
                  sS[xW(0x1d2)](), (this[xW(0x8e8)] = sS);
                } else this[xW(0x8e8)] = null;
              }
              (rL = this[xW(0x911)] / this[xW(0xa6d)]), rI[xW(0x18a)](rL, rL);
              this[xW(0x8e8)] &&
                ((rI[xW(0x681)] = this[xW(0xa38)](xW(0xab6))),
                rI[xW(0x615)](this[xW(0x8e8)]));
              (rI[xW(0x669)] = this[xW(0xa38)](xW(0x941))),
                rI[xW(0x8ae)](this[xW(0xe70)]),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x592))),
                rI[xW(0x615)](this[xW(0xe70)]);
              break;
            case cR[xW(0x70e)]:
              rI[xW(0xa2f)](),
                (rL = this[xW(0x911)] / 0x28),
                rI[xW(0x18a)](rL, rL),
                (rI[xW(0x681)] = rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b));
              for (let sX = 0x0; sX < 0x2; sX++) {
                const sY = sX === 0x0 ? 0x1 : -0x1;
                rI[xW(0xa2f)](),
                  rI[xW(0x30e)](0x1c, sY * 0xd),
                  rI[xW(0x568)](
                    Math[xW(0x12d)](this[xW(0x291)] * 1.24) * 0.1 * sY
                  ),
                  rI[xW(0xc0e)](),
                  rI[xW(0x4a6)](0x0, sY * 0x6),
                  rI[xW(0xa7c)](0x14, sY * 0xb),
                  rI[xW(0xa7c)](0x28, 0x0),
                  rI[xW(0xa39)](0x14, sY * 0x5, 0x0, 0x0),
                  rI[xW(0x1d2)](),
                  rI[xW(0x615)](),
                  rI[xW(0x8ae)](),
                  rI[xW(0xbec)]();
              }
              (rM = this[xW(0x160)] ? li : [xW(0xbc2), xW(0xbb8)]),
                (rI[xW(0x681)] = this[xW(0xa38)](rM[0x0])),
                rI[xW(0x615)](l6),
                (rI[xW(0x71e)] = 0x6),
                (rI[xW(0x681)] = rI[xW(0x669)] = this[xW(0xa38)](rM[0x1])),
                rI[xW(0x8ae)](l6),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x15, 0x0),
                rI[xW(0xa39)](0x0, -0x3, 0x15, 0x0),
                (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x7),
                rI[xW(0x8ae)]();
              const rS = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rI[xW(0xc0e)]();
              for (let sZ = 0x0; sZ < 0x2; sZ++) {
                const t0 = sZ === 0x1 ? 0x1 : -0x1;
                for (let t1 = 0x0; t1 < rS[xW(0xc2f)]; t1++) {
                  let [t2, t3] = rS[t1];
                  (t3 *= t0),
                    rI[xW(0x4a6)](t2, t3),
                    rI[xW(0x878)](t2, t3, 0x5, 0x0, l1);
                }
              }
              rI[xW(0x615)](), rI[xW(0x615)](), rI[xW(0xbec)]();
              break;
            case cR[xW(0xd3a)]:
            case cR[xW(0x106)]:
              rI[xW(0xa2f)](),
                (rL = this[xW(0x911)] / 0x28),
                rI[xW(0x18a)](rL, rL);
              const rT = this[xW(0x171)] === cR[xW(0xd3a)];
              rT &&
                (rI[xW(0xa2f)](),
                rI[xW(0x30e)](-0x2d, 0x0),
                rI[xW(0x568)](Math["PI"]),
                this[xW(0xa97)](rI, 0xf / 1.1),
                rI[xW(0xbec)]());
              (rM = this[xW(0x160)]
                ? li
                : rT
                ? [xW(0x7be), xW(0x1a5)]
                : [xW(0x81d), xW(0x378)]),
                rI[xW(0xc0e)](),
                rI[xW(0xb04)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, l1),
                (rI[xW(0x71e)] = 0xa),
                (rI[xW(0x669)] = this[xW(0xa38)](rM[0x1])),
                rI[xW(0x8ae)](),
                (rI[xW(0x681)] = this[xW(0xa38)](rM[0x0])),
                rI[xW(0x615)](),
                rI[xW(0xa2f)](),
                rI[xW(0x173)](),
                rI[xW(0xc0e)]();
              const rU = [-0x1e, -0x5, 0x16];
              for (let t4 = 0x0; t4 < rU[xW(0xc2f)]; t4++) {
                const t5 = rU[t4];
                rI[xW(0x4a6)](t5, -0x32),
                  rI[xW(0xa39)](t5 - 0x14, 0x0, t5, 0x32);
              }
              (rI[xW(0x71e)] = 0xe),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                rI[xW(0x8ae)](),
                rI[xW(0xbec)]();
              rT ? this[xW(0x55d)](rI) : this[xW(0x2ce)](rI);
              rI[xW(0xbec)]();
              break;
            case cR[xW(0x3d6)]:
              (rL = this[xW(0x911)] / 0x32), rI[xW(0x18a)](rL, rL);
              const rV = 0x2f;
              rI[xW(0xc0e)]();
              for (let t6 = 0x0; t6 < 0x8; t6++) {
                let t7 =
                  (0.25 + ((t6 % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xW(0x12d)](t6 + this[xW(0x291)] * 1.3) * 0.2;
                t6 >= 0x4 && (t7 *= -0x1),
                  rI[xW(0x4a6)](0x0, 0x0),
                  rI[xW(0xa7c)](
                    Math[xW(0x65c)](t7) * rV,
                    Math[xW(0x12d)](t7) * rV
                  );
              }
              (rI[xW(0x71e)] = 0x7),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                (rI[xW(0xb0f)] = xW(0x22b)),
                rI[xW(0x8ae)](),
                (rI[xW(0x681)] = rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x6);
              for (let t8 = 0x0; t8 < 0x2; t8++) {
                const t9 = t8 === 0x0 ? 0x1 : -0x1;
                rI[xW(0xa2f)](),
                  rI[xW(0x30e)](0x16, t9 * 0xa),
                  rI[xW(0x568)](
                    -(Math[xW(0x12d)](this[xW(0x291)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      t9
                  ),
                  rI[xW(0xc0e)](),
                  rI[xW(0x4a6)](0x0, t9 * 0x6),
                  rI[xW(0xa39)](0x14, t9 * 0xf, 0x28, 0x0),
                  rI[xW(0xa39)](0x14, t9 * 0x5, 0x0, 0x0),
                  rI[xW(0x1d2)](),
                  rI[xW(0x615)](),
                  rI[xW(0x8ae)](),
                  rI[xW(0xbec)]();
              }
              (rI[xW(0x71e)] = 0x8),
                la(
                  rI,
                  0x1,
                  0x8,
                  this[xW(0xa38)](xW(0xab2)),
                  this[xW(0xa38)](xW(0x93f))
                );
              let rW;
              (rW = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rI[xW(0xc0e)]();
              for (let ta = 0x0; ta < rW[xW(0xc2f)]; ta++) {
                const [tb, tc] = rW[ta];
                rI[xW(0x4a6)](tb, -tc),
                  rI[xW(0xa39)](tb + Math[xW(0x5e2)](tb) * 4.2, 0x0, tb, tc);
              }
              (rI[xW(0xb0f)] = xW(0x22b)),
                rI[xW(0x8ae)](),
                rI[xW(0x30e)](-0x21, 0x0),
                la(
                  rI,
                  0.45,
                  0x8,
                  this[xW(0xa38)](xW(0xad6)),
                  this[xW(0xa38)](xW(0xc03))
                ),
                rI[xW(0xc0e)](),
                (rW = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let td = 0x0; td < rW[xW(0xc2f)]; td++) {
                const [te, tf] = rW[td];
                rI[xW(0x4a6)](te, -tf), rI[xW(0xa39)](te - 0x3, 0x0, te, tf);
              }
              (rI[xW(0x71e)] = 0x5),
                (rI[xW(0xb0f)] = xW(0x22b)),
                rI[xW(0x8ae)](),
                rI[xW(0x30e)](0x11, 0x0),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x0, -0x9),
                rI[xW(0xa7c)](0x0, 0x9),
                rI[xW(0xa7c)](0xb, 0x0),
                rI[xW(0x1d2)](),
                (rI[xW(0x9ed)] = rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x6),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0xa31))),
                rI[xW(0x615)](),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x19a)]:
              this[xW(0x54d)](rI, xW(0xb50), xW(0x3e0), xW(0x601));
              break;
            case cR[xW(0xe2a)]:
              this[xW(0x54d)](rI, xW(0x421), xW(0xd54), xW(0x4de));
              break;
            case cR[xW(0x6ff)]:
              this[xW(0x54d)](rI, xW(0x6dd), xW(0xd46), xW(0x601));
              break;
            case cR[xW(0x392)]:
              (rL = this[xW(0x911)] / 0x46),
                rI[xW(0xa60)](rL),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x8e5))),
                rI[xW(0x615)](ld),
                rI[xW(0x173)](ld),
                (rI[xW(0x71e)] = 0xf),
                (rI[xW(0x669)] = xW(0xb0b)),
                rI[xW(0x8ae)](ld),
                (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x7),
                (rI[xW(0x669)] = xW(0xb44)),
                rI[xW(0x8ae)](le);
              break;
            case cR[xW(0x33e)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x28),
                this[xW(0xe0a)](rI, 0x32, 0x1e, 0x7);
              break;
            case cR[xW(0x19d)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x64),
                this[xW(0xe0a)](rI),
                (rI[xW(0x681)] = rI[xW(0x669)]);
              const rX = 0x6,
                rY = 0x3;
              rI[xW(0xc0e)]();
              for (let tg = 0x0; tg < rX; tg++) {
                const th = (tg / rX) * Math["PI"] * 0x2;
                rI[xW(0xa2f)](), rI[xW(0x568)](th);
                for (let ti = 0x0; ti < rY; ti++) {
                  const tj = ti / rY,
                    tk = 0x12 + tj * 0x44,
                    tl = 0x7 + tj * 0x6;
                  rI[xW(0x4a6)](tk, 0x0),
                    rI[xW(0x878)](tk, 0x0, tl, 0x0, Math["PI"] * 0x2);
                }
                rI[xW(0xbec)]();
              }
              rI[xW(0x615)]();
              break;
            case cR[xW(0xb1f)]:
              (rL = this[xW(0x911)] / 0x31),
                rI[xW(0xa60)](rL),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                (rN = this[xW(0x291)] * 0x15e);
              const rZ = (Math[xW(0x12d)](rN * 0.01) * 0.5 + 0.5) * 0.1;
              (rI[xW(0x669)] = rI[xW(0x681)] = this[xW(0xa38)](xW(0xab6))),
                (rI[xW(0x71e)] = 0x3);
              for (let tm = 0x0; tm < 0x2; tm++) {
                rI[xW(0xa2f)]();
                const tn = tm * 0x2 - 0x1;
                rI[xW(0x18a)](0x1, tn),
                  rI[xW(0x30e)](0x1c, -0x27),
                  rI[xW(0x18a)](1.5, 1.5),
                  rI[xW(0x568)](rZ),
                  rI[xW(0xc0e)](),
                  rI[xW(0x4a6)](0x0, 0x0),
                  rI[xW(0xa39)](0xc, -0x8, 0x14, 0x3),
                  rI[xW(0xa7c)](0xb, 0x1),
                  rI[xW(0xa7c)](0x11, 0x9),
                  rI[xW(0xa39)](0xc, 0x5, 0x0, 0x6),
                  rI[xW(0x1d2)](),
                  rI[xW(0x8ae)](),
                  rI[xW(0x615)](),
                  rI[xW(0xbec)]();
              }
              rI[xW(0xc0e)]();
              for (let to = 0x0; to < 0x2; to++) {
                for (let tp = 0x0; tp < 0x4; tp++) {
                  const tq = to * 0x2 - 0x1,
                    tr =
                      (Math[xW(0x12d)](rN * 0.005 + to + tp * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rI[xW(0xa2f)](),
                    rI[xW(0x18a)](0x1, tq),
                    rI[xW(0x30e)]((tp / 0x3) * 0x1e - 0xf, 0x28);
                  const ts = tp < 0x2 ? 0x1 : -0x1;
                  rI[xW(0x568)](tr * ts),
                    rI[xW(0x4a6)](0x0, 0x0),
                    rI[xW(0x30e)](0x0, 0x19),
                    rI[xW(0xa7c)](0x0, 0x0),
                    rI[xW(0x568)](ts * 0.7 * (tr + 0.3)),
                    rI[xW(0xa7c)](0x0, 0xa),
                    rI[xW(0xbec)]();
                }
              }
              (rI[xW(0x71e)] = 0xa),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x2, 0x17),
                rI[xW(0xa39)](0x17, 0x0, 0x2, -0x17),
                rI[xW(0xa7c)](-0xa, -0xf),
                rI[xW(0xa7c)](-0xa, 0xf),
                rI[xW(0x1d2)](),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xa49))),
                (rI[xW(0x71e)] = 0x44),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                rI[xW(0x8ae)](),
                (rI[xW(0x71e)] -= 0x12),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x5eb))),
                rI[xW(0x8ae)](),
                (rI[xW(0x669)] = xW(0x3ee)),
                rI[xW(0xc0e)]();
              const s0 = 0x12;
              for (let tu = 0x0; tu < 0x2; tu++) {
                rI[xW(0x4a6)](-0x12, s0),
                  rI[xW(0xa39)](0x0, -0x7 + s0, 0x12, s0),
                  rI[xW(0x18a)](0x1, -0x1);
              }
              (rI[xW(0x71e)] = 0x9), rI[xW(0x8ae)]();
              break;
            case cR[xW(0x53c)]:
              (rL = this[xW(0x911)] / 0x50),
                rI[xW(0xa60)](rL),
                rI[xW(0x568)](
                  ((Date[xW(0xa4a)]() / 0x7d0) % l1) + this[xW(0x291)] * 0.4
                );
              const s1 = 0x5;
              !this[xW(0xd13)] &&
                (this[xW(0xd13)] = Array(s1)[xW(0x615)](0x64));
              const s3 = this[xW(0xd13)],
                s4 = this[xW(0xe6a)]
                  ? 0x0
                  : Math[xW(0xa6f)](this[xW(0x890)] * (s1 - 0x1));
              rI[xW(0xc0e)]();
              for (let tv = 0x0; tv < s1; tv++) {
                const tw = ((tv + 0.5) / s1) * Math["PI"] * 0x2,
                  tx = ((tv + 0x1) / s1) * Math["PI"] * 0x2;
                s3[tv] += ((tv < s4 ? 0x64 : 0x3c) - s3[tv]) * 0.2;
                const ty = s3[tv];
                if (tv === 0x0) rI[xW(0x4a6)](ty, 0x0);
                rI[xW(0xa39)](
                  Math[xW(0x65c)](tw) * 0x5,
                  Math[xW(0x12d)](tw) * 0x5,
                  Math[xW(0x65c)](tx) * ty,
                  Math[xW(0x12d)](tx) * ty
                );
              }
              rI[xW(0x1d2)](),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x1c + 0xa),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x51a))),
                rI[xW(0x8ae)](),
                (rI[xW(0x71e)] = 0x10 + 0xa),
                (rI[xW(0x669)] = rI[xW(0x681)] = this[xW(0xa38)](xW(0x110))),
                rI[xW(0x615)](),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)]();
              for (let tz = 0x0; tz < s1; tz++) {
                const tA = (tz / s1) * Math["PI"] * 0x2;
                rI[xW(0xa2f)](), rI[xW(0x568)](tA);
                const tB = s3[tz] / 0x64;
                let tC = 0x1a;
                const tD = 0x4;
                for (let tE = 0x0; tE < tD; tE++) {
                  const tF = (0x1 - (tE / tD) * 0.7) * 0xc * tB;
                  rI[xW(0x4a6)](tC, 0x0),
                    rI[xW(0x878)](tC, 0x0, tF, 0x0, Math["PI"] * 0x2),
                    (tC += tF * 0x2 + 3.5 * tB);
                }
                rI[xW(0xbec)]();
              }
              (rI[xW(0x681)] = xW(0x150)), rI[xW(0x615)]();
              break;
            case cR[xW(0xa2c)]:
              (rL = this[xW(0x911)] / 0x1e),
                rI[xW(0xa60)](rL),
                rI[xW(0x30e)](-0x22, 0x0),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x0, -0x8),
                rI[xW(0xa39)](0x9b, 0x0, 0x0, 0x8),
                rI[xW(0x1d2)](),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x1a),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x51a))),
                rI[xW(0x8ae)](),
                (rI[xW(0x71e)] = 0x10),
                (rI[xW(0x669)] = rI[xW(0x681)] = this[xW(0xa38)](xW(0x110))),
                rI[xW(0x615)](),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)]();
              let s5 = 0xd;
              for (let tG = 0x0; tG < 0x4; tG++) {
                const tH = (0x1 - (tG / 0x4) * 0.7) * 0xa;
                rI[xW(0x4a6)](s5, 0x0),
                  rI[xW(0x878)](s5, 0x0, tH, 0x0, Math["PI"] * 0x2),
                  (s5 += tH * 0x2 + 0x4);
              }
              (rI[xW(0x681)] = xW(0x150)), rI[xW(0x615)]();
              break;
            case cR[xW(0x3f0)]:
              (rL = this[xW(0x911)] / 0x64),
                rI[xW(0x18a)](rL, rL),
                (rI[xW(0x9ed)] = rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x669)] = xW(0x64c)),
                (rI[xW(0x71e)] = 0x14);
              const s6 = [0x1, 0.63, 0.28],
                s7 = this[xW(0x160)] ? lp : [xW(0x528), xW(0xc01), xW(0x146)],
                s8 = (pQ * 0.005) % l1;
              for (let tI = 0x0; tI < 0x3; tI++) {
                const tJ = s6[tI],
                  tK = s7[tI];
                rI[xW(0xa2f)](),
                  rI[xW(0x568)](s8 * (tI % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rI[xW(0xc0e)]();
                const tL = 0x7 - tI;
                for (let tM = 0x0; tM < tL; tM++) {
                  const tN = (Math["PI"] * 0x2 * tM) / tL;
                  rI[xW(0xa7c)](
                    Math[xW(0x65c)](tN) * tJ * 0x64,
                    Math[xW(0x12d)](tN) * tJ * 0x64
                  );
                }
                rI[xW(0x1d2)](),
                  (rI[xW(0x669)] = rI[xW(0x681)] = this[xW(0xa38)](tK)),
                  rI[xW(0x615)](),
                  rI[xW(0x8ae)](),
                  rI[xW(0xbec)]();
              }
              break;
            case cR[xW(0x2e5)]:
              (rL = this[xW(0x911)] / 0x41),
                rI[xW(0x18a)](rL, rL),
                (rN = this[xW(0x291)] * 0x2),
                rI[xW(0x568)](Math["PI"] / 0x2);
              if (this[xW(0x523)]) {
                const tO = 0x3;
                rI[xW(0xc0e)]();
                for (let tS = 0x0; tS < 0x2; tS++) {
                  for (let tT = 0x0; tT <= tO; tT++) {
                    const tU = (tT / tO) * 0x50 - 0x28;
                    rI[xW(0xa2f)]();
                    const tV = tS * 0x2 - 0x1;
                    rI[xW(0x30e)](tV * -0x2d, tU);
                    const tW =
                      1.1 + Math[xW(0x12d)]((tT / tO) * Math["PI"]) * 0.5;
                    rI[xW(0x18a)](tW * tV, tW),
                      rI[xW(0x568)](Math[xW(0x12d)](rN + tT + tV) * 0.3 + 0.3),
                      rI[xW(0x4a6)](0x0, 0x0),
                      rI[xW(0xa39)](-0xf, -0x5, -0x14, 0xa),
                      rI[xW(0xbec)]();
                  }
                }
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                  (rI[xW(0x71e)] = 0x8),
                  (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                  rI[xW(0x8ae)](),
                  (rI[xW(0x71e)] = 0xc);
                const tP = Date[xW(0xa4a)]() * 0.01,
                  tQ = Math[xW(0x12d)](tP * 0.5) * 0.5 + 0.5,
                  tR = tQ * 0.1 + 0x1;
                rI[xW(0xc0e)](),
                  rI[xW(0x878)](-0xf * tR, 0x2b - tQ, 0x10, 0x0, Math["PI"]),
                  rI[xW(0x878)](0xf * tR, 0x2b - tQ, 0x10, 0x0, Math["PI"]),
                  rI[xW(0x4a6)](-0x16, -0x2b),
                  rI[xW(0x878)](0x0, -0x2b - tQ, 0x16, 0x0, Math["PI"], !![]),
                  (rI[xW(0x669)] = this[xW(0xa38)](xW(0x956))),
                  rI[xW(0x8ae)](),
                  (rI[xW(0x681)] = this[xW(0xa38)](xW(0xbc2))),
                  rI[xW(0x615)](),
                  rI[xW(0xa2f)](),
                  rI[xW(0x568)]((Math["PI"] * 0x3) / 0x2),
                  this[xW(0x2ce)](rI, 0x1a - tQ, 0x0),
                  rI[xW(0xbec)]();
              }
              if (!this[xW(0xab8)]) {
                const tX = dH[d8[xW(0xde5)]],
                  tY = Math[xW(0x9da)](this["id"] % tX[xW(0xc2f)], 0x0),
                  tZ = new lO(-0x1, 0x0, 0x0, tX[tY]["id"]);
                (tZ[xW(0x9d0)] = 0x1),
                  (tZ[xW(0xa8e)] = 0x0),
                  (this[xW(0xab8)] = tZ);
              }
              rI[xW(0xa60)](1.3), this[xW(0xab8)][xW(0xaff)](rI);
              break;
            case cR[xW(0x3ea)]:
              (rL = this[xW(0x911)] / 0x14),
                rI[xW(0x18a)](rL, rL),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x11, 0x0),
                rI[xW(0xa7c)](0x0, 0x0),
                rI[xW(0xa7c)](0x11, 0x6),
                rI[xW(0x4a6)](0x0, 0x0),
                rI[xW(0xa7c)](0xb, -0x7),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xa91))),
                (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0xc),
                rI[xW(0x8ae)](),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x80c))),
                (rI[xW(0x71e)] = 0x6),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0xb2a)]:
              (rL = this[xW(0x911)] / 0x80),
                rI[xW(0xa60)](rL),
                rI[xW(0x30e)](-0x80, -0x78),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0xd77))),
                rI[xW(0x615)](f8[xW(0x5a3)]),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x1f8))),
                (rI[xW(0x71e)] = 0x14),
                rI[xW(0x8ae)](f8[xW(0x5a3)]);
              break;
            case cR[xW(0x914)]:
              (rL = this[xW(0x911)] / 0x19),
                rI[xW(0x18a)](rL, rL),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x19, 0x0),
                rI[xW(0xa7c)](-0x2d, 0x0),
                (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x14),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x62d))),
                rI[xW(0x615)](),
                (rI[xW(0x71e)] = 0x7),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xa5f))),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x3cb)]:
              rI[xW(0x568)](-this[xW(0xa8e)]),
                rI[xW(0xa60)](this[xW(0x911)] / 0x14),
                this[xW(0x9f4)](rI),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x62d))),
                rI[xW(0x615)](),
                rI[xW(0x173)](),
                (rI[xW(0x71e)] = 0xc),
                (rI[xW(0x669)] = xW(0x3ee)),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x1cb)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x64), this[xW(0x9d6)](rI);
              break;
            case cR[xW(0x3f7)]:
              this[xW(0xe5a)](rI, !![]);
              break;
            case cR[xW(0x8a8)]:
              this[xW(0xe5a)](rI, ![]);
              break;
            case cR[xW(0x7b7)]:
              (rL = this[xW(0x911)] / 0xa),
                rI[xW(0xa60)](rL),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x0, 0x8),
                rI[xW(0xa39)](2.5, 0x0, 0x0, -0x8),
                (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0xa),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xa5f))),
                rI[xW(0x8ae)](),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x62d))),
                (rI[xW(0x71e)] = 0x6),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x8d8)]:
              (rL = this[xW(0x911)] / 0xa),
                rI[xW(0xa60)](rL),
                rI[xW(0x30e)](0x7, 0x0),
                (rI[xW(0xb0f)] = xW(0x22b)),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x5, -0x5),
                rI[xW(0x4c4)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rI[xW(0x4c4)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0xab6))),
                rI[xW(0x615)](),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x915))),
                (rI[xW(0x71e)] = 0x3),
                (rI[xW(0x9ed)] = xW(0x22b)),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x705)]:
              (rL = this[xW(0x911)] / 0x32), rI[xW(0xa60)](rL), rI[xW(0xc0e)]();
              for (let u0 = 0x0; u0 < 0x9; u0++) {
                const u1 = (u0 / 0x9) * Math["PI"] * 0x2,
                  u2 =
                    0x3c *
                    (0x1 +
                      Math[xW(0x65c)]((u0 / 0x9) * Math["PI"] * 3.5) * 0.07);
                rI[xW(0x4a6)](0x0, 0x0),
                  rI[xW(0xa7c)](
                    Math[xW(0x65c)](u1) * u2,
                    Math[xW(0x12d)](u1) * u2
                  );
              }
              (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x10),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x62d))),
                rI[xW(0x615)](),
                (rI[xW(0x71e)] = 0x6),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xa5f))),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x21c)]:
              rI[xW(0xa2f)](),
                (rL = this[xW(0x911)] / 0x28),
                rI[xW(0x18a)](rL, rL),
                this[xW(0x832)](rI),
                (rI[xW(0x681)] = this[xW(0xa38)](
                  this[xW(0x160)] ? li[0x0] : xW(0x497)
                )),
                (rI[xW(0x669)] = xW(0xaf4)),
                (rI[xW(0x71e)] = 0x10),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rI[xW(0x615)](),
                rI[xW(0xa2f)](),
                rI[xW(0x173)](),
                rI[xW(0x8ae)](),
                rI[xW(0xbec)](),
                rI[xW(0xbec)]();
              break;
            case cR[xW(0xb17)]:
            case cR[xW(0x50d)]:
            case cR[xW(0x8d6)]:
            case cR[xW(0xaac)]:
            case cR[xW(0xb18)]:
            case cR[xW(0x181)]:
            case cR[xW(0x9e6)]:
            case cR[xW(0x564)]:
              (rL = this[xW(0x911)] / 0x14), rI[xW(0x18a)](rL, rL);
              const s9 = Math[xW(0x12d)](this[xW(0x291)] * 1.6),
                sa = this[xW(0x5c8)][xW(0xdb3)](xW(0xb17)),
                sb = this[xW(0x5c8)][xW(0xdb3)](xW(0xb85)),
                sc = this[xW(0x5c8)][xW(0xdb3)](xW(0x8d6)),
                sd = this[xW(0x5c8)][xW(0xdb3)](xW(0x8d6)) ? -0x4 : 0x0;
              (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x6);
              sb && rI[xW(0x30e)](0x8, 0x0);
              for (let u3 = 0x0; u3 < 0x2; u3++) {
                const u4 = u3 === 0x0 ? -0x1 : 0x1;
                rI[xW(0xa2f)](), rI[xW(0x568)](u4 * (s9 * 0.5 + 0.6) * 0.08);
                const u5 = u4 * 0x4;
                rI[xW(0xc0e)](),
                  rI[xW(0x4a6)](0x0, u5),
                  rI[xW(0xa39)](0xc, 0x6 * u4 + u5, 0x18, u5),
                  rI[xW(0x8ae)](),
                  rI[xW(0xbec)]();
              }
              if (this[xW(0x160)])
                (rI[xW(0x681)] = this[xW(0xa38)](li[0x0])),
                  (rI[xW(0x669)] = this[xW(0xa38)](li[0x1]));
              else
                this[xW(0x5c8)][xW(0x7fb)](xW(0xde1))
                  ? ((rI[xW(0x681)] = this[xW(0xa38)](xW(0xc1d))),
                    (rI[xW(0x669)] = this[xW(0xa38)](xW(0x6b3))))
                  : ((rI[xW(0x681)] = this[xW(0xa38)](xW(0xa72))),
                    (rI[xW(0x669)] = this[xW(0xa38)](xW(0x16a))));
              rI[xW(0x71e)] = sb ? 0x9 : 0xc;
              sb &&
                (rI[xW(0xa2f)](),
                rI[xW(0x30e)](-0x18, 0x0),
                rI[xW(0x18a)](-0x1, 0x1),
                lG(rI, 0x15, rI[xW(0x681)], rI[xW(0x669)], rI[xW(0x71e)]),
                rI[xW(0xbec)]());
              !sc &&
                (rI[xW(0xa2f)](),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](-0xa, 0x0, sb ? 0x12 : 0xc, 0x0, l1),
                rI[xW(0x615)](),
                rI[xW(0x173)](),
                rI[xW(0x8ae)](),
                rI[xW(0xbec)]());
              if (sa || sb) {
                rI[xW(0xa2f)](),
                  (rI[xW(0x681)] = this[xW(0xa38)](xW(0x361))),
                  (rI[xW(0xae3)] *= 0.5);
                const u6 = (Math["PI"] / 0x7) * (sb ? 0.85 : 0x1) + s9 * 0.08;
                for (let u7 = 0x0; u7 < 0x2; u7++) {
                  const u8 = u7 === 0x0 ? -0x1 : 0x1;
                  rI[xW(0xa2f)](),
                    rI[xW(0x568)](u8 * u6),
                    rI[xW(0x30e)](
                      sb ? -0x13 : -0x9,
                      u8 * -0x3 * (sb ? 1.3 : 0x1)
                    ),
                    rI[xW(0xc0e)](),
                    rI[xW(0xb04)](
                      0x0,
                      0x0,
                      sb ? 0x14 : 0xe,
                      sb ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      l1
                    ),
                    rI[xW(0x615)](),
                    rI[xW(0xbec)]();
                }
                rI[xW(0xbec)]();
              }
              rI[xW(0xa2f)](),
                rI[xW(0x30e)](0x4 + sd, 0x0),
                lG(
                  rI,
                  sc ? 0x14 : 12.1,
                  rI[xW(0x681)],
                  rI[xW(0x669)],
                  rI[xW(0x71e)]
                ),
                rI[xW(0xbec)]();
              break;
            case cR[xW(0xdb0)]:
              this[xW(0xb3e)](rI, xW(0xb1e));
              break;
            case cR[xW(0x500)]:
              this[xW(0xb3e)](rI, xW(0xe79));
              break;
            case cR[xW(0x603)]:
              this[xW(0xb3e)](rI, xW(0xa31)),
                (rI[xW(0xae3)] *= 0.2),
                lK(rI, this[xW(0x911)] * 1.3, 0x4);
              break;
            case cR[xW(0xca2)]:
            case cR[xW(0x459)]:
            case cR[xW(0x404)]:
            case cR[xW(0x449)]:
            case cR[xW(0x232)]:
            case cR[xW(0xd84)]:
              rI[xW(0xa2f)](),
                (rL = this[xW(0x911)] / 0x28),
                rI[xW(0x18a)](rL, rL),
                rI[xW(0xc0e)]();
              for (let u9 = 0x0; u9 < 0x2; u9++) {
                rI[xW(0xa2f)](),
                  rI[xW(0x18a)](0x1, u9 * 0x2 - 0x1),
                  rI[xW(0x30e)](0x0, 0x23),
                  rI[xW(0x4a6)](0x9, 0x0),
                  rI[xW(0xa7c)](0x5, 0xa),
                  rI[xW(0xa7c)](-0x5, 0xa),
                  rI[xW(0xa7c)](-0x9, 0x0),
                  rI[xW(0xa7c)](0x9, 0x0),
                  rI[xW(0xbec)]();
              }
              (rI[xW(0x71e)] = 0x12),
                (rI[xW(0x9ed)] = rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x669)] = rI[xW(0x681)] = this[xW(0xa38)](xW(0xa07))),
                rI[xW(0x615)](),
                rI[xW(0x8ae)]();
              let se;
              if (this[xW(0x5c8)][xW(0x78f)](xW(0xc0a)) > -0x1)
                se = [xW(0x796), xW(0xd28)];
              else
                this[xW(0x5c8)][xW(0x78f)](xW(0x433)) > -0x1
                  ? (se = [xW(0xbc2), xW(0x8dd)])
                  : (se = [xW(0x619), xW(0x1a6)]);
              rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0x28, 0x0, l1),
                (rI[xW(0x681)] = this[xW(0xa38)](se[0x0])),
                rI[xW(0x615)](),
                (rI[xW(0x71e)] = 0x8),
                (rI[xW(0x669)] = this[xW(0xa38)](se[0x1])),
                rI[xW(0x8ae)]();
              this[xW(0x5c8)][xW(0x78f)](xW(0xd6d)) > -0x1 &&
                this[xW(0x2ce)](rI, -0xf, 0x0, 1.25, 0x4);
              rI[xW(0xbec)]();
              break;
            case cR[xW(0xd17)]:
            case cR[xW(0x800)]:
              (rN =
                Math[xW(0x12d)](
                  Date[xW(0xa4a)]() / 0x3e8 + this[xW(0x291)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rL = this[xW(0x911)] / 0x50),
                rI[xW(0x18a)](rL, rL);
              const sf = this[xW(0x171)] === cR[xW(0x800)];
              sf &&
                (rI[xW(0xa2f)](),
                rI[xW(0x18a)](0x2, 0x2),
                this[xW(0x832)](rI),
                rI[xW(0xbec)]());
              rI[xW(0x568)](-this[xW(0xa8e)]),
                (rI[xW(0x71e)] = 0xa),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (rM = this[xW(0x160)]
                  ? li
                  : sf
                  ? [xW(0xbba), xW(0x436)]
                  : [xW(0x29b), xW(0x67b)]),
                (rI[xW(0x681)] = this[xW(0xa38)](rM[0x0])),
                rI[xW(0x615)](),
                rI[xW(0x173)](),
                (rI[xW(0x669)] = this[xW(0xa38)](rM[0x1])),
                rI[xW(0x8ae)]();
              const sg = this[xW(0xa38)](xW(0x62d)),
                sh = this[xW(0xa38)](xW(0x601)),
                si = (ua = 0x1) => {
                  const xZ = xW;
                  rI[xZ(0xa2f)](),
                    rI[xZ(0x18a)](ua, 0x1),
                    rI[xZ(0x30e)](0x13 - rN * 0x4, -0x1d + rN * 0x5),
                    rI[xZ(0xc0e)](),
                    rI[xZ(0x4a6)](0x0, 0x0),
                    rI[xZ(0x4c4)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rI[xZ(0xa39)](0x19, 0x5 + rN * 0x2, 0x0, 0x0),
                    rI[xZ(0x1d2)](),
                    (rI[xZ(0x71e)] = 0x3),
                    rI[xZ(0x8ae)](),
                    (rI[xZ(0x681)] = sg),
                    rI[xZ(0x615)](),
                    rI[xZ(0x173)](),
                    rI[xZ(0xc0e)](),
                    rI[xZ(0x878)](
                      0x16 + ua * this[xZ(0x842)] * 0x10,
                      -0x4 + this[xZ(0x35a)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rI[xZ(0x681)] = sh),
                    rI[xZ(0x615)](),
                    rI[xZ(0xbec)]();
                };
              si(0x1),
                si(-0x1),
                rI[xW(0xa2f)](),
                rI[xW(0x30e)](0x0, 0xa),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x28 + rN * 0xa, -0xe + rN * 0x5),
                rI[xW(0xa39)](0x0, +rN * 0x5, 0x2c - rN * 0xf, -0xe + rN * 0x5),
                rI[xW(0x4c4)](
                  0x14,
                  0x28 - rN * 0x14,
                  -0x14,
                  0x28 - rN * 0x14,
                  -0x28 + rN * 0xa,
                  -0xe + rN * 0x5
                ),
                rI[xW(0x1d2)](),
                (rI[xW(0x71e)] = 0x5),
                rI[xW(0x8ae)](),
                (rI[xW(0x681)] = sh),
                rI[xW(0x615)](),
                rI[xW(0x173)]();
              const sj = rN * 0x2,
                sk = rN * -0xa;
              rI[xW(0xa2f)](),
                rI[xW(0x30e)](0x0, sk),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x37, -0x8),
                rI[xW(0x4c4)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rI[xW(0x669)] = sg),
                (rI[xW(0x71e)] = 0xd),
                rI[xW(0x8ae)](),
                (rI[xW(0x71e)] = 0x4),
                (rI[xW(0x669)] = sh),
                rI[xW(0xc0e)]();
              for (let ua = 0x0; ua < 0x6; ua++) {
                const ub = (((ua + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rI[xW(0x4a6)](ub, 0xa), rI[xW(0xa7c)](ub, 0x46);
              }
              rI[xW(0x8ae)](),
                rI[xW(0xbec)](),
                rI[xW(0xa2f)](),
                rI[xW(0x30e)](0x0, sj),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x32, -0x14),
                rI[xW(0xa39)](0x0, 0x8, 0x32, -0x12),
                (rI[xW(0x669)] = sg),
                (rI[xW(0x71e)] = 0xd),
                rI[xW(0x8ae)](),
                (rI[xW(0x71e)] = 0x5),
                (rI[xW(0x669)] = sh),
                rI[xW(0xc0e)]();
              for (let uc = 0x0; uc < 0x6; uc++) {
                let ud = (((uc + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rI[xW(0x4a6)](ud, -0x14), rI[xW(0xa7c)](ud, 0x2);
              }
              rI[xW(0x8ae)](), rI[xW(0xbec)](), rI[xW(0xbec)]();
              const sl = 0x1 - rN;
              (rI[xW(0xae3)] *= Math[xW(0x9da)](0x0, (sl - 0.3) / 0.7)),
                rI[xW(0xc0e)]();
              for (let ue = 0x0; ue < 0x2; ue++) {
                rI[xW(0xa2f)](),
                  ue === 0x1 && rI[xW(0x18a)](-0x1, 0x1),
                  rI[xW(0x30e)](
                    -0x33 + rN * (0xa + ue * 3.4) - ue * 3.4,
                    -0xf + rN * (0x5 - ue * 0x1)
                  ),
                  rI[xW(0x4a6)](0xa, 0x0),
                  rI[xW(0x878)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rI[xW(0xbec)]();
              }
              rI[xW(0x30e)](0x0, 0x28),
                rI[xW(0x4a6)](0x28 - rN * 0xa, -0xe + rN * 0x5),
                rI[xW(0x4c4)](
                  0x14,
                  0x14 - rN * 0xa,
                  -0x14,
                  0x14 - rN * 0xa,
                  -0x28 + rN * 0xa,
                  -0xe + rN * 0x5
                ),
                (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x2),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x513)]:
              (rL = this[xW(0x911)] / 0x14), rI[xW(0x18a)](rL, rL);
              const sm = rI[xW(0xae3)];
              (rI[xW(0x669)] = rI[xW(0x681)] = this[xW(0xa38)](xW(0x62d))),
                (rI[xW(0xae3)] = 0.6 * sm),
                rI[xW(0xc0e)]();
              for (let uf = 0x0; uf < 0xa; uf++) {
                const ug = (uf / 0xa) * Math["PI"] * 0x2;
                rI[xW(0xa2f)](),
                  rI[xW(0x568)](ug),
                  rI[xW(0x30e)](17.5, 0x0),
                  rI[xW(0x4a6)](0x0, 0x0);
                const uh = Math[xW(0x12d)](ug + Date[xW(0xa4a)]() / 0x1f4);
                rI[xW(0x568)](uh * 0.5),
                  rI[xW(0xa39)](0x4, -0x2 * uh, 0xe, 0x0),
                  rI[xW(0xbec)]();
              }
              (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 2.3),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rI[xW(0xae3)] = 0.5 * sm),
                rI[xW(0x615)](),
                rI[xW(0x173)](),
                (rI[xW(0x71e)] = 0x3),
                rI[xW(0x8ae)](),
                (rI[xW(0x71e)] = 1.2),
                (rI[xW(0xae3)] = 0.6 * sm),
                rI[xW(0xc0e)](),
                (rI[xW(0xb0f)] = xW(0x22b));
              for (let ui = 0x0; ui < 0x4; ui++) {
                rI[xW(0xa2f)](),
                  rI[xW(0x568)]((ui / 0x4) * Math["PI"] * 0x2),
                  rI[xW(0x30e)](0x4, 0x0),
                  rI[xW(0x4a6)](0x0, -0x2),
                  rI[xW(0x4c4)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rI[xW(0xbec)]();
              }
              rI[xW(0x8ae)]();
              break;
            case cR[xW(0xaa7)]:
              this[xW(0xaa7)](rI);
              break;
            case cR[xW(0xbcb)]:
              this[xW(0xaa7)](rI, !![]);
              break;
            case cR[xW(0x238)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x32),
                (rI[xW(0x71e)] = 0x19),
                (rI[xW(0x9ed)] = xW(0x22b));
              const sn = this[xW(0x7af)]
                ? 0.6
                : (Date[xW(0xa4a)]() / 0x4b0) % 6.28;
              for (let uj = 0x0; uj < 0xa; uj++) {
                const uk = 0x1 - uj / 0xa,
                  ul =
                    uk *
                    0x50 *
                    (0x1 +
                      (Math[xW(0x12d)](sn * 0x3 + uj * 0.5 + this[xW(0x291)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rI[xW(0x568)](sn),
                  (rI[xW(0x669)] = this[xW(0xa38)](lh[uj])),
                  rI[xW(0xd1d)](-ul / 0x2, -ul / 0x2, ul, ul);
              }
              break;
            case cR[xW(0x494)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x12),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x19, -0xa),
                rI[xW(0xa39)](0x0, -0x2, 0x19, -0xa),
                rI[xW(0xa39)](0x1e, 0x0, 0x19, 0xa),
                rI[xW(0xa39)](0x0, 0x2, -0x19, 0xa),
                rI[xW(0xa39)](-0x1e, 0x0, -0x19, -0xa),
                rI[xW(0x1d2)](),
                (rI[xW(0x9ed)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0x4),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x91b))),
                rI[xW(0x8ae)](),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x6bf))),
                rI[xW(0x615)](),
                rI[xW(0x173)](),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x19, -0xa),
                rI[xW(0xa39)](0x14, 0x0, 0x19, 0xa),
                rI[xW(0xa7c)](0x28, 0xa),
                rI[xW(0xa7c)](0x28, -0xa),
                (rI[xW(0x681)] = xW(0xaf4)),
                rI[xW(0x615)](),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x0, -0xa),
                rI[xW(0xa39)](-0x5, 0x0, 0x0, 0xa),
                (rI[xW(0x71e)] = 0xa),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xc33))),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x4d0)]:
              (rL = this[xW(0x911)] / 0xc),
                rI[xW(0x18a)](rL, rL),
                rI[xW(0x568)](-Math["PI"] / 0x6),
                rI[xW(0x30e)](-0xc, 0x0),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x5, 0x0),
                rI[xW(0xa7c)](0x0, 0x0),
                (rI[xW(0x71e)] = 0x4),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x1cd))),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x0, 0x0),
                rI[xW(0xa39)](0xa, -0x14, 0x1e, 0x0),
                rI[xW(0xa39)](0xa, 0x14, 0x0, 0x0),
                (rI[xW(0x71e)] = 0x6),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0xb6f))),
                rI[xW(0x8ae)](),
                rI[xW(0x615)](),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x6, 0x0),
                rI[xW(0xa39)](0xe, -0x2, 0x16, 0x0),
                (rI[xW(0x71e)] = 3.5),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x2b1)]:
              rK(xW(0x2b1), xW(0x38f), xW(0xb40));
              break;
            case cR[xW(0x848)]:
              rK(xW(0x848), xW(0x938), xW(0x49e));
              break;
            case cR[xW(0xe18)]:
              rK(xW(0xe18), xW(0x62d), xW(0xa5f));
              break;
            case cR[xW(0xd06)]:
              rK(xW(0xd06), xW(0x62d), xW(0xa5f));
              break;
            case cR[xW(0x906)]:
              rK(xW(0xd06), xW(0xd98), xW(0xb9a));
              break;
            case cR[xW(0x9dd)]:
              const so = this[xW(0x7af)] ? 0x3c : this[xW(0x911)] * 0x2;
              rI[xW(0x30e)](-this[xW(0x911)] - 0xa, 0x0),
                (rI[xW(0x9ed)] = rI[xW(0xb0f)] = xW(0x22b)),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x0, 0x0),
                rI[xW(0xa7c)](so, 0x0),
                (rI[xW(0x71e)] = 0x6),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x915))),
                rI[xW(0x615)](),
                rI[xW(0x30e)](so, 0x0),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0xd, 0x0),
                rI[xW(0xa7c)](0x0, -3.5),
                rI[xW(0xa7c)](0x0, 3.5),
                rI[xW(0x1d2)](),
                (rI[xW(0x669)] = rI[xW(0x681)]),
                rI[xW(0x615)](),
                (rI[xW(0x71e)] = 0x3),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x745)]:
              const sp = this[xW(0x911)] * 0x2,
                sq = 0xa;
              rI[xW(0x30e)](-this[xW(0x911)], 0x0),
                (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x9b6)] = xW(0xc49)),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x0, 0x0),
                rI[xW(0xa7c)](-sq * 1.8, 0x0),
                (rI[xW(0x669)] = xW(0x738)),
                (rI[xW(0x71e)] = sq * 1.4),
                rI[xW(0x8ae)](),
                (rI[xW(0x669)] = xW(0x596)),
                (rI[xW(0x71e)] *= 0.7),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x0, 0x0),
                rI[xW(0xa7c)](-sq * 0.45, 0x0),
                (rI[xW(0x669)] = xW(0x738)),
                (rI[xW(0x71e)] = sq * 0x2 + 3.5),
                rI[xW(0x8ae)](),
                (rI[xW(0x669)] = xW(0x466)),
                (rI[xW(0x71e)] = sq * 0x2),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, sq, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x681)] = xW(0xe62)),
                rI[xW(0x615)](),
                (rI[xW(0x669)] = xW(0x624)),
                rI[xW(0xc0e)]();
              const sr = (Date[xW(0xa4a)]() * 0.001) % 0x1,
                ss = sr * sp,
                st = sp * 0.2;
              rI[xW(0x4a6)](Math[xW(0x9da)](ss - st, 0x0), 0x0),
                rI[xW(0xa7c)](Math[xW(0x585)](ss + st, sp), 0x0);
              const su = Math[xW(0x12d)](sr * Math["PI"]);
              (rI[xW(0x636)] = sq * 0x3 * su),
                (rI[xW(0x71e)] = sq),
                rI[xW(0x8ae)](),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x0, 0x0),
                rI[xW(0xa7c)](sp, 0x0),
                (rI[xW(0x71e)] = sq),
                (rI[xW(0x636)] = sq),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0xc30)]:
            case cR[xW(0x81a)]:
            case cR[xW(0xdaf)]:
            case cR[xW(0x79b)]:
            case cR[xW(0x9ae)]:
            case cR[xW(0x410)]:
              (rL = this[xW(0x911)] / 0x23), rI[xW(0xa60)](rL), rI[xW(0xc0e)]();
              this[xW(0x171)] !== cR[xW(0x81a)] &&
              this[xW(0x171)] !== cR[xW(0x9ae)]
                ? rI[xW(0xb04)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, l1)
                : rI[xW(0x878)](0x0, 0x0, 0x23, 0x0, l1);
              (rM = ls[this[xW(0x171)]] || [xW(0x16f), xW(0x2ca)]),
                (rI[xW(0x681)] = this[xW(0xa38)](rM[0x0])),
                rI[xW(0x615)](),
                (rI[xW(0x669)] = this[xW(0xa38)](rM[0x1])),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x324)]:
              (rI[xW(0x71e)] = 0x4),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x88b)),
                rK(xW(0x324), xW(0x626), xW(0xa35));
              break;
            case cR[xW(0xce4)]:
              rK(xW(0xce4), xW(0x62d), xW(0xa5f));
              break;
            case cR[xW(0x3f8)]:
              (rL = this[xW(0x911)] / 0x14), rI[xW(0x18a)](rL, rL);
              !this[xW(0x7af)] && rI[xW(0x568)]((pQ / 0x64) % 6.28);
              rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rI[xW(0xa39)](0x0, 0xc, 0x14, 0x0),
                rI[xW(0x1d2)](),
                (rI[xW(0x9ed)] = rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] *= 0.7),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x62d))),
                rI[xW(0x615)](),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xa5f))),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0xcb5)]:
              (rI[xW(0x71e)] *= 0.7),
                rK(xW(0xcb5), xW(0x552), xW(0xbee)),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0.6, 0x0, l1),
                (rI[xW(0x681)] = xW(0xcbf)),
                rI[xW(0x615)]();
              break;
            case cR[xW(0x51e)]:
              (rI[xW(0x71e)] *= 0.8), rK(xW(0x51e), xW(0xc01), xW(0x477));
              break;
            case cR[xW(0x83e)]:
              (rL = this[xW(0x911)] / 0xa), rI[xW(0x18a)](rL, rL);
              if (!this[xW(0x1b5)] || pQ - this[xW(0x545)] > 0x14) {
                this[xW(0x545)] = pQ;
                const um = new Path2D();
                for (let un = 0x0; un < 0xa; un++) {
                  const uo = (Math[xW(0xe0d)]() * 0x2 - 0x1) * 0x7,
                    up = (Math[xW(0xe0d)]() * 0x2 - 0x1) * 0x7;
                  um[xW(0x4a6)](uo, up), um[xW(0x878)](uo, up, 0x5, 0x0, l1);
                }
                this[xW(0x1b5)] = um;
              }
              (rI[xW(0x681)] = this[xW(0xa38)](xW(0x361))),
                rI[xW(0x615)](this[xW(0x1b5)]);
              break;
            case cR[xW(0xe43)]:
            case cR[xW(0xa1a)]:
              (rL = this[xW(0x911)] / 0x1e),
                rI[xW(0x18a)](rL, rL),
                rI[xW(0xc0e)]();
              const sv = 0x1 / 0x3;
              for (let uq = 0x0; uq < 0x3; uq++) {
                const ur = (uq / 0x3) * Math["PI"] * 0x2;
                rI[xW(0x4a6)](0x0, 0x0),
                  rI[xW(0x878)](0x0, 0x0, 0x1e, ur, ur + Math["PI"] / 0x3);
              }
              (rI[xW(0xb0f)] = xW(0x22b)),
                (rI[xW(0x71e)] = 0xa),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x681)] = this[xW(0xa38)](
                  this[xW(0x171)] === cR[xW(0xe43)] ? xW(0x973) : xW(0x722)
                )),
                rI[xW(0x615)](),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0xa85)]:
              rJ(xW(0x81d), xW(0x6fe));
              break;
            case cR[xW(0x289)]:
              rJ(xW(0xcae), xW(0x140));
              break;
            case cR[xW(0x613)]:
            case cR[xW(0x94b)]:
              rJ(xW(0x62d), xW(0xa5f));
              break;
            case cR[xW(0x206)]:
              (rL = this[xW(0x911)] / 0x14),
                rI[xW(0x18a)](rL, rL),
                rI[xW(0x568)](-Math["PI"] / 0x4);
              const sw = rI[xW(0x71e)];
              (rI[xW(0x71e)] *= 1.5),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x14, -0x14 - sw),
                rI[xW(0xa7c)](-0x14, 0x0),
                rI[xW(0xa7c)](0x14, 0x0),
                rI[xW(0xa7c)](0x14, 0x14 + sw),
                rI[xW(0x568)](Math["PI"] / 0x2),
                rI[xW(0x4a6)](-0x14, -0x14 - sw),
                rI[xW(0xa7c)](-0x14, 0x0),
                rI[xW(0xa7c)](0x14, 0x0),
                rI[xW(0xa7c)](0x14, 0x14 + sw),
                (rI[xW(0xb0f)] = rI[xW(0xb0f)] = xW(0x88b)),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0xa70)]:
              rJ(xW(0x439), xW(0x4bb));
              break;
            case cR[xW(0xe58)]:
              rJ(xW(0x121), xW(0x541));
              break;
            case cR[xW(0x239)]:
              rJ(xW(0x55f), xW(0xba4));
              break;
            case cR[xW(0x4aa)]:
              (rL = this[xW(0x911)] / 0x14),
                rI[xW(0x18a)](rL, rL),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0x14, 0x0, l1),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0xab6))),
                rI[xW(0x615)](),
                rI[xW(0x173)](),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x915))),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0x54c))),
                rI[xW(0x615)]();
              break;
            case cR[xW(0x3a8)]:
              (rL = this[xW(0x911)] / 0x14), rI[xW(0x18a)](rL, rL);
              const sx = (us, ut, uu = ![]) => {
                  const y0 = xW;
                  (rI[y0(0xb0f)] = y0(0x22b)),
                    (rI[y0(0x669)] = this[y0(0xa38)](ut)),
                    (rI[y0(0x681)] = this[y0(0xa38)](us)),
                    rI[y0(0xc0e)](),
                    rI[y0(0x878)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rI[y0(0x8ae)](),
                    rI[y0(0x615)]();
                },
                sy = (us, ut) => {
                  const y1 = xW;
                  rI[y1(0xa2f)](),
                    rI[y1(0x173)](),
                    (rI[y1(0xb0f)] = y1(0x22b)),
                    (rI[y1(0x681)] = this[y1(0xa38)](us)),
                    (rI[y1(0x669)] = this[y1(0xa38)](ut)),
                    rI[y1(0x615)](),
                    rI[y1(0x8ae)](),
                    rI[y1(0xbec)]();
                };
              (rI[xW(0xb0f)] = xW(0x22b)),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                sy(xW(0xab6), xW(0x915)),
                rI[xW(0x568)](Math["PI"]),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rI[xW(0x878)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rI[xW(0x878)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                sy(xW(0x62d), xW(0xa5f)),
                rI[xW(0x568)](-Math["PI"]),
                rI[xW(0xc0e)](),
                rI[xW(0x878)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                sy(xW(0xab6), xW(0x915));
              break;
            case cR[xW(0x5ce)]:
              this[xW(0xa97)](rI, this[xW(0x911)]);
              break;
            case cR[xW(0x75a)]:
              (rL = this[xW(0x911)] / 0x28),
                rI[xW(0x18a)](rL, rL),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](-0x1e, -0x1e),
                rI[xW(0xa7c)](0x14, 0x0),
                rI[xW(0xa7c)](-0x1e, 0x1e),
                rI[xW(0x1d2)](),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0xab6))),
                (rI[xW(0x681)] = this[xW(0xa38)](xW(0xa31))),
                rI[xW(0x615)](),
                (rI[xW(0x71e)] = 0x16),
                (rI[xW(0xb0f)] = rI[xW(0x9ed)] = xW(0x22b)),
                rI[xW(0x8ae)]();
              break;
            case cR[xW(0x5aa)]:
              rI[xW(0xa60)](this[xW(0x911)] / 0x41),
                rI[xW(0x30e)](-0xa, 0xa),
                (rI[xW(0x9ed)] = rI[xW(0xb0f)] = xW(0x22b)),
                rI[xW(0xa2f)](),
                rI[xW(0xc0e)](),
                rI[xW(0x4a6)](0x1e, 0x0),
                rI[xW(0x30e)](
                  0x46 -
                    (Math[xW(0x12d)](
                      Date[xW(0xa4a)]() / 0x190 + 0.8 * this[xW(0x291)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rI[xW(0xa7c)](0x0, 0x0),
                (rI[xW(0x71e)] = 0x2a),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x34a))),
                rI[xW(0x8ae)](),
                (rI[xW(0x669)] = this[xW(0xa38)](xW(0x454))),
                (rI[xW(0x71e)] -= 0xc),
                rI[xW(0x8ae)](),
                rI[xW(0xc0e)]();
              for (let us = 0x0; us < 0x2; us++) {
                rI[xW(0x4a6)](0x9, 0x7),
                  rI[xW(0xa7c)](0x28, 0x14),
                  rI[xW(0xa7c)](0x7, 0x9),
                  rI[xW(0xa7c)](0x9, 0x7),
                  rI[xW(0x18a)](0x1, -0x1);
              }
              (rI[xW(0x71e)] = 0x3),
                (rI[xW(0x681)] = rI[xW(0x669)] = xW(0xb9e)),
                rI[xW(0x8ae)](),
                rI[xW(0x615)](),
                rI[xW(0xbec)](),
                this[xW(0x380)](rI);
              break;
            case cR[xW(0x87d)]:
              (rL = this[xW(0x911)] / 0x14), rI[xW(0x18a)](rL, rL);
              const sz = (ut = 0x1, uu, uv) => {
                const y2 = xW;
                rI[y2(0xa2f)](),
                  rI[y2(0x18a)](0x1, ut),
                  rI[y2(0xc0e)](),
                  rI[y2(0x8b6)](-0x64, 0x0, 0x12c, -0x12c),
                  rI[y2(0x173)](),
                  rI[y2(0xc0e)](),
                  rI[y2(0x4a6)](-0x14, 0x0),
                  rI[y2(0xa39)](-0x12, -0x19, 0x11, -0xf),
                  (rI[y2(0xb0f)] = y2(0x22b)),
                  (rI[y2(0x71e)] = 0x16),
                  (rI[y2(0x669)] = this[y2(0xa38)](uv)),
                  rI[y2(0x8ae)](),
                  (rI[y2(0x71e)] = 0xe),
                  (rI[y2(0x669)] = this[y2(0xa38)](uu)),
                  rI[y2(0x8ae)](),
                  rI[y2(0xbec)]();
              };
              sz(0x1, xW(0x518), xW(0x605)), sz(-0x1, xW(0x29d), xW(0xa3e));
              break;
            default:
              rI[xW(0xc0e)](),
                rI[xW(0x878)](0x0, 0x0, this[xW(0x911)], 0x0, Math["PI"] * 0x2),
                (rI[xW(0x681)] = xW(0x5df)),
                rI[xW(0x615)](),
                pK(rI, this[xW(0x5c8)], 0x14, xW(0x624), 0x3);
          }
          rI[xW(0xbec)](), (this[xW(0xcfb)] = null);
        }
        [ux(0x9f4)](rI, rJ) {
          const y3 = ux;
          rJ = rJ || pQ / 0x12c + this[y3(0x291)] * 0.3;
          const rK = Math[y3(0x12d)](rJ) * 0.5 + 0.5;
          rI[y3(0xb0f)] = y3(0x22b);
          const rL = 0x4;
          for (let rM = 0x0; rM < 0x2; rM++) {
            rI[y3(0xa2f)]();
            if (rM === 0x0) rI[y3(0xc0e)]();
            for (let rN = 0x0; rN < 0x2; rN++) {
              for (let rO = 0x0; rO < rL; rO++) {
                rI[y3(0xa2f)](), rM > 0x0 && rI[y3(0xc0e)]();
                const rP = -0.19 - (rO / rL) * Math["PI"] * 0.25;
                rI[y3(0x568)](rP + rK * 0.05), rI[y3(0x4a6)](0x0, 0x0);
                const rQ = Math[y3(0x12d)](rJ + rO);
                rI[y3(0x30e)](0x1c - (rQ * 0.5 + 0.5), 0x0),
                  rI[y3(0x568)](rQ * 0.08),
                  rI[y3(0xa7c)](0x0, 0x0),
                  rI[y3(0xa39)](0x0, 0x7, 5.5, 0xe),
                  rM > 0x0 &&
                    ((rI[y3(0x71e)] = 6.5),
                    (rI[y3(0x669)] =
                      y3(0x39f) + (0x2f + (rO / rL) * 0x14) + "%)"),
                    rI[y3(0x8ae)]()),
                  rI[y3(0xbec)]();
              }
              rI[y3(0x18a)](-0x1, 0x1);
            }
            rM === 0x0 &&
              ((rI[y3(0x71e)] = 0x9),
              (rI[y3(0x669)] = y3(0x1ab)),
              rI[y3(0x8ae)]()),
              rI[y3(0xbec)]();
          }
          rI[y3(0xc0e)](),
            rI[y3(0xb04)](
              0x0,
              -0x1e + Math[y3(0x12d)](rJ * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rI[y3(0x669)] = y3(0x1ab)),
            (rI[y3(0x71e)] = 5.5),
            rI[y3(0x8ae)](),
            (rI[y3(0x636)] = 0x5 + rK * 0x8),
            (rI[y3(0x9b6)] = y3(0x9b8)),
            (rI[y3(0x669)] = rI[y3(0x9b6)]),
            (rI[y3(0x71e)] = 3.5),
            rI[y3(0x8ae)](),
            (rI[y3(0x636)] = 0x0);
        }
        [ux(0x9d6)](rI) {
          const y4 = ux,
            rJ = this[y4(0x160)] ? lm[y4(0xabd)] : lm[y4(0x401)],
            rK = Date[y4(0xa4a)]() / 0x1f4 + this[y4(0x291)],
            rL = Math[y4(0x12d)](rK) - 0.5;
          rI[y4(0xb0f)] = rI[y4(0x9ed)] = y4(0x22b);
          const rM = 0x46;
          rI[y4(0xa2f)](), rI[y4(0xc0e)]();
          for (let rN = 0x0; rN < 0x2; rN++) {
            rI[y4(0xa2f)]();
            const rO = rN * 0x2 - 0x1;
            rI[y4(0x18a)](0x1, rO),
              rI[y4(0x30e)](0x14, rM),
              rI[y4(0x568)](rL * 0.1),
              rI[y4(0x4a6)](0x0, 0x0),
              rI[y4(0xa7c)](-0xa, 0x32),
              rI[y4(0xa39)](0x32, 0x32, 0x64, 0x1e),
              rI[y4(0xa39)](0x32, 0x32, 0x64, 0x1e),
              rI[y4(0xa39)](0x1e, 0x8c, -0x50, 0x78 - rL * 0x14),
              rI[y4(0xa39)](
                -0xa + rL * 0xf,
                0x6e - rL * 0xa,
                -0x28,
                0x50 - rL * 0xa
              ),
              rI[y4(0xa39)](
                -0xa + rL * 0xa,
                0x3c + rL * 0x5,
                -0x3c,
                0x32 - Math[y4(0x9da)](0x0, rL) * 0xa
              ),
              rI[y4(0xa39)](-0xa, 0x14 - rL * 0xa, -0x46, rL * 0xa),
              rI[y4(0xbec)]();
          }
          (rI[y4(0x681)] = this[y4(0xa38)](rJ[y4(0x6c6)])),
            rI[y4(0x615)](),
            (rI[y4(0x71e)] = 0x12),
            (rI[y4(0x669)] = y4(0x3ee)),
            rI[y4(0x173)](),
            rI[y4(0x8ae)](),
            rI[y4(0xbec)](),
            rI[y4(0xa2f)](),
            rI[y4(0x30e)](0x50, 0x0),
            rI[y4(0x18a)](0x2, 0x2),
            rI[y4(0xc0e)]();
          for (let rP = 0x0; rP < 0x2; rP++) {
            rI[y4(0x18a)](0x1, -0x1),
              rI[y4(0xa2f)](),
              rI[y4(0x30e)](0x0, 0xf),
              rI[y4(0x568)]((Math[y4(0x12d)](rK * 0x2) * 0.5 + 0.5) * 0.08),
              rI[y4(0x4a6)](0x0, -0x4),
              rI[y4(0xa39)](0xa, 0x0, 0x14, -0x6),
              rI[y4(0xa39)](0xf, 0x3, 0x0, 0x5),
              rI[y4(0xbec)]();
          }
          (rI[y4(0x681)] = rI[y4(0x669)] = y4(0xb9e)),
            rI[y4(0x615)](),
            (rI[y4(0x71e)] = 0x6),
            rI[y4(0x8ae)](),
            rI[y4(0xbec)]();
          for (let rQ = 0x0; rQ < 0x2; rQ++) {
            const rR = rQ === 0x0;
            rR && rI[y4(0xc0e)]();
            for (let rS = 0x4; rS >= 0x0; rS--) {
              const rT = rS / 0x5,
                rU = 0x32 - 0x2d * rT;
              !rR && rI[y4(0xc0e)](),
                rI[y4(0x8b6)](
                  -0x50 - rT * 0x50 - rU / 0x2,
                  -rU / 0x2 +
                    Math[y4(0x12d)](rT * Math["PI"] * 0x2 + rK * 0x3) *
                      0x8 *
                      rT,
                  rU,
                  rU
                ),
                !rR &&
                  ((rI[y4(0x71e)] = 0x14),
                  (rI[y4(0x681)] = rI[y4(0x669)] =
                    this[y4(0xa38)](rJ[y4(0x784)][rS])),
                  rI[y4(0x8ae)](),
                  rI[y4(0x615)]());
            }
            rR &&
              ((rI[y4(0x71e)] = 0x22),
              (rI[y4(0x669)] = this[y4(0xa38)](rJ[y4(0x183)])),
              rI[y4(0x8ae)]());
          }
          rI[y4(0xc0e)](),
            rI[y4(0x878)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rI[y4(0x681)] = this[y4(0xa38)](rJ[y4(0x99b)])),
            rI[y4(0x615)](),
            (rI[y4(0x71e)] = 0x24),
            (rI[y4(0x669)] = y4(0xaed)),
            rI[y4(0xa2f)](),
            rI[y4(0x173)](),
            rI[y4(0x8ae)](),
            rI[y4(0xbec)](),
            rI[y4(0xa2f)]();
          for (let rV = 0x0; rV < 0x2; rV++) {
            rI[y4(0xc0e)]();
            for (let rW = 0x0; rW < 0x2; rW++) {
              rI[y4(0xa2f)]();
              const rX = rW * 0x2 - 0x1;
              rI[y4(0x18a)](0x1, rX),
                rI[y4(0x30e)](0x14, rM),
                rI[y4(0x568)](rL * 0.1),
                rI[y4(0x4a6)](0x0, 0xa),
                rI[y4(0xa7c)](-0xa, 0x32),
                rI[y4(0xa39)](0x32, 0x32, 0x64, 0x1e),
                rI[y4(0xa39)](0x32, 0x32, 0x64, 0x1e),
                rI[y4(0xa39)](0x1e, 0x8c, -0x50, 0x78 - rL * 0x14),
                rI[y4(0x4a6)](0x64, 0x1e),
                rI[y4(0xa39)](0x23, 0x5a, -0x28, 0x50 - rL * 0xa),
                rI[y4(0x4a6)](-0xa, 0x32),
                rI[y4(0xa39)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[y4(0x9da)](0x0, rL) * 0xa
                ),
                rI[y4(0xbec)]();
            }
            rV === 0x0
              ? ((rI[y4(0x71e)] = 0x10),
                (rI[y4(0x669)] = this[y4(0xa38)](rJ[y4(0x1dd)])))
              : ((rI[y4(0x71e)] = 0xa),
                (rI[y4(0x669)] = this[y4(0xa38)](rJ[y4(0x71c)]))),
              rI[y4(0x8ae)]();
          }
          rI[y4(0xbec)]();
        }
        [ux(0x54d)](rI, rJ, rK, rL) {
          const y5 = ux;
          rI[y5(0xa2f)]();
          const rM = this[y5(0x911)] / 0x28;
          rI[y5(0x18a)](rM, rM),
            (rJ = this[y5(0xa38)](rJ)),
            (rK = this[y5(0xa38)](rK)),
            (rL = this[y5(0xa38)](rL));
          const rN = Math["PI"] / 0x5;
          rI[y5(0xb0f)] = rI[y5(0x9ed)] = y5(0x22b);
          const rO = Math[y5(0x12d)](
              Date[y5(0xa4a)]() / 0x12c + this[y5(0x291)] * 0.2
            ),
            rP = rO * 0.3 + 0.7;
          rI[y5(0xc0e)](),
            rI[y5(0x878)](0x16, 0x0, 0x17, 0x0, l1),
            rI[y5(0x4a6)](0x0, 0x0),
            rI[y5(0x878)](-0x5, 0x0, 0x21, 0x0, l1),
            (rI[y5(0x681)] = this[y5(0xa38)](y5(0x601))),
            rI[y5(0x615)](),
            rI[y5(0xa2f)](),
            rI[y5(0x30e)](0x12, 0x0);
          for (let rS = 0x0; rS < 0x2; rS++) {
            rI[y5(0xa2f)](),
              rI[y5(0x18a)](0x1, rS * 0x2 - 0x1),
              rI[y5(0x568)](Math["PI"] * 0.08 * rP),
              rI[y5(0x30e)](-0x12, 0x0),
              rI[y5(0xc0e)](),
              rI[y5(0x878)](0x0, 0x0, 0x28, Math["PI"], -rN),
              rI[y5(0xa39)](0x14 - rP * 0x3, -0xf, 0x14, 0x0),
              rI[y5(0x1d2)](),
              (rI[y5(0x681)] = rJ),
              rI[y5(0x615)]();
            const rT = y5(0xb01) + rS;
            if (!this[rT]) {
              const rU = new Path2D();
              for (let rV = 0x0; rV < 0x2; rV++) {
                const rW = (Math[y5(0xe0d)]() * 0x2 - 0x1) * 0x28,
                  rX = Math[y5(0xe0d)]() * -0x28,
                  rY = Math[y5(0xe0d)]() * 0x9 + 0x8;
                rU[y5(0x4a6)](rW, rX), rU[y5(0x878)](rW, rX, rY, 0x0, l1);
              }
              this[rT] = rU;
            }
            rI[y5(0x173)](),
              (rI[y5(0x681)] = rL),
              rI[y5(0x615)](this[rT]),
              rI[y5(0xbec)](),
              (rI[y5(0x71e)] = 0x7),
              (rI[y5(0x669)] = rK),
              rI[y5(0x8ae)]();
          }
          rI[y5(0xbec)](), rI[y5(0xa2f)]();
          let rQ = 0x9;
          rI[y5(0x30e)](0x2a, 0x0);
          const rR = Math["PI"] * 0x3 - rO;
          rI[y5(0xc0e)]();
          for (let rZ = 0x0; rZ < 0x2; rZ++) {
            let s0 = 0x0,
              s1 = 0x8;
            rI[y5(0x4a6)](s0, s1);
            for (let s2 = 0x0; s2 < rQ; s2++) {
              const s3 = s2 / rQ,
                s4 = s3 * rR,
                s5 = 0xf * (0x1 - s3),
                s6 = Math[y5(0x65c)](s4) * s5,
                s7 = Math[y5(0x12d)](s4) * s5,
                s8 = s0 + s6,
                s9 = s1 + s7;
              rI[y5(0xa39)](
                s0 + s6 * 0.5 + s7 * 0.25,
                s1 + s7 * 0.5 - s6 * 0.25,
                s8,
                s9
              ),
                (s0 = s8),
                (s1 = s9);
            }
            rI[y5(0x18a)](0x1, -0x1);
          }
          (rI[y5(0xb0f)] = rI[y5(0x9ed)] = y5(0x22b)),
            (rI[y5(0x71e)] = 0x2),
            (rI[y5(0x669)] = rI[y5(0x681)]),
            rI[y5(0x8ae)](),
            rI[y5(0xbec)](),
            rI[y5(0xbec)]();
        }
        [ux(0xe0a)](rI, rJ = 0x64, rK = 0x50, rL = 0x12, rM = 0x8) {
          const y6 = ux;
          rI[y6(0xc0e)]();
          const rN = (0x1 / rL) * Math["PI"] * 0x2;
          rI[y6(0x4a6)](rK, 0x0);
          for (let rO = 0x0; rO < rL; rO++) {
            const rP = rO * rN,
              rQ = (rO + 0x1) * rN;
            rI[y6(0x4c4)](
              Math[y6(0x65c)](rP) * rJ,
              Math[y6(0x12d)](rP) * rJ,
              Math[y6(0x65c)](rQ) * rJ,
              Math[y6(0x12d)](rQ) * rJ,
              Math[y6(0x65c)](rQ) * rK,
              Math[y6(0x12d)](rQ) * rK
            );
          }
          (rI[y6(0x681)] = this[y6(0xa38)](y6(0x382))),
            rI[y6(0x615)](),
            (rI[y6(0x71e)] = rM),
            (rI[y6(0xb0f)] = rI[y6(0x9ed)] = y6(0x22b)),
            (rI[y6(0x669)] = this[y6(0xa38)](y6(0xde7))),
            rI[y6(0x8ae)]();
        }
        [ux(0xa38)](rI) {
          const y7 = ux,
            rJ = 0x1 - this[y7(0x671)];
          if (
            rJ >= 0x1 &&
            this[y7(0xa80)] === 0x0 &&
            !this[y7(0x167)] &&
            !this[y7(0xadb)]
          )
            return rI;
          rI = hz(rI);
          this[y7(0x167)] &&
            (rI = hx(
              rI,
              [0xff, 0xff, 0xff],
              0.85 + Math[y7(0x12d)](pQ / 0x32) * 0.15
            ));
          this[y7(0xa80)] > 0x0 &&
            (rI = hx(rI, [0x8f, 0x5d, 0xb0], 0x1 - this[y7(0xa80)] * 0.75));
          rI = hx(rI, [0xff, 0x0, 0x0], rJ * 0.25 + 0.75);
          if (this[y7(0xadb)]) {
            if (!this[y7(0xcfb)]) {
              let rK = pQ / 0x4;
              if (!isNaN(this["id"])) rK += this["id"];
              this[y7(0xcfb)] = lI(rK % 0x168, 0x64, 0x32);
            }
            rI = hx(rI, this[y7(0xcfb)], 0.75);
          }
          return q2(rI);
        }
        [ux(0x76b)](rI) {
          const y8 = ux;
          this[y8(0xcfb)] = null;
          if (this[y8(0xe6a)]) {
            const rJ = Math[y8(0x12d)]((this[y8(0x839)] * Math["PI"]) / 0x2);
            if (!this[y8(0x54b)]) {
              const rK = 0x1 + rJ * 0x1;
              rI[y8(0x18a)](rK, rK);
            }
            rI[y8(0xae3)] *= 0x1 - rJ;
          }
        }
        [ux(0x55d)](rI, rJ = !![], rK = 0x1) {
          const y9 = ux;
          rI[y9(0xc0e)](),
            (rK = 0x8 * rK),
            rI[y9(0x4a6)](0x23, -rK),
            rI[y9(0xa39)](0x33, -0x2 - rK, 0x3c, -0xc - rK),
            rI[y9(0xa7c)](0x23, -rK),
            rI[y9(0x4a6)](0x23, rK),
            rI[y9(0xa39)](0x33, 0x2 + rK, 0x3c, 0xc + rK),
            rI[y9(0xa7c)](0x23, rK);
          const rL = y9(0xab6);
          (rI[y9(0x681)] = rI[y9(0x669)] =
            rJ ? this[y9(0xa38)](rL) : y9(0xab6)),
            rI[y9(0x615)](),
            (rI[y9(0xb0f)] = rI[y9(0x9ed)] = y9(0x22b)),
            (rI[y9(0x71e)] = 0x4),
            rI[y9(0x8ae)]();
        }
        [ux(0xa97)](rI, rJ, rK = 0x1) {
          const ya = ux,
            rL = (rJ / 0x1e) * 1.1;
          rI[ya(0x18a)](rL, rL),
            rI[ya(0xc0e)](),
            rI[ya(0x4a6)](-0x1e, -0x11),
            rI[ya(0xa7c)](0x1e, 0x0),
            rI[ya(0xa7c)](-0x1e, 0x11),
            rI[ya(0x1d2)](),
            (rI[ya(0x681)] = rI[ya(0x669)] = this[ya(0xa38)](ya(0xab6))),
            rI[ya(0x615)](),
            (rI[ya(0x71e)] = 0x14 * rK),
            (rI[ya(0xb0f)] = rI[ya(0x9ed)] = ya(0x22b)),
            rI[ya(0x8ae)]();
        }
        [ux(0x2ce)](rI, rJ = 0x0, rK = 0x0, rL = 0x1, rM = 0x5) {
          const yb = ux;
          rI[yb(0xa2f)](),
            rI[yb(0x30e)](rJ, rK),
            rI[yb(0x18a)](rL, rL),
            rI[yb(0xc0e)](),
            rI[yb(0x4a6)](0x23, -0x8),
            rI[yb(0xa39)](0x34, -5.5, 0x3c, -0x14),
            rI[yb(0x4a6)](0x23, 0x8),
            rI[yb(0xa39)](0x34, 5.5, 0x3c, 0x14),
            (rI[yb(0x681)] = rI[yb(0x669)] = this[yb(0xa38)](yb(0xab6))),
            (rI[yb(0xb0f)] = rI[yb(0x9ed)] = yb(0x22b)),
            (rI[yb(0x71e)] = rM),
            rI[yb(0x8ae)](),
            rI[yb(0xc0e)]();
          const rN = Math["PI"] * 0.165;
          rI[yb(0xb04)](0x3c, -0x14, 0x7, 0x9, rN, 0x0, l1),
            rI[yb(0xb04)](0x3c, 0x14, 0x7, 0x9, -rN, 0x0, l1),
            rI[yb(0x615)](),
            rI[yb(0xbec)]();
        }
      },
      lI = (rI, rJ, rK) => {
        const yc = ux;
        (rJ /= 0x64), (rK /= 0x64);
        const rL = (rO) => (rO + rI / 0x1e) % 0xc,
          rM = rJ * Math[yc(0x585)](rK, 0x1 - rK),
          rN = (rO) =>
            rK -
            rM *
              Math[yc(0x9da)](
                -0x1,
                Math[yc(0x585)](
                  rL(rO) - 0x3,
                  Math[yc(0x585)](0x9 - rL(rO), 0x1)
                )
              );
        return [0xff * rN(0x0), 0xff * rN(0x8), 0xff * rN(0x4)];
      };
    function lJ(rI) {
      const yd = ux;
      return -(Math[yd(0x65c)](Math["PI"] * rI) - 0x1) / 0x2;
    }
    function lK(rI, rJ, rK = 0x6, rL = ux(0x624)) {
      const ye = ux,
        rM = rJ / 0x64;
      rI[ye(0x18a)](rM, rM), rI[ye(0xc0e)]();
      for (let rN = 0x0; rN < 0xc; rN++) {
        rI[ye(0x4a6)](0x0, 0x0);
        const rO = (rN / 0xc) * Math["PI"] * 0x2;
        rI[ye(0xa7c)](Math[ye(0x65c)](rO) * 0x64, Math[ye(0x12d)](rO) * 0x64);
      }
      (rI[ye(0x71e)] = rK),
        (rI[ye(0x681)] = rI[ye(0x669)] = rL),
        (rI[ye(0xb0f)] = rI[ye(0x9ed)] = ye(0x22b));
      for (let rP = 0x0; rP < 0x5; rP++) {
        const rQ = (rP / 0x5) * 0x64 + 0xa;
        lc(rI, 0xc, rQ, 0.5, 0.85);
      }
      rI[ye(0x8ae)]();
    }
    var lL = class {
        constructor(rI, rJ, rK, rL, rM) {
          const yf = ux;
          (this[yf(0x171)] = rI),
            (this["id"] = rJ),
            (this["x"] = rK),
            (this["y"] = rL),
            (this[yf(0x911)] = rM),
            (this[yf(0xa8e)] = Math[yf(0xe0d)]() * l1),
            (this[yf(0x5d0)] = -0x1),
            (this[yf(0xe6a)] = ![]),
            (this[yf(0x9d0)] = 0x0),
            (this[yf(0x839)] = 0x0),
            (this[yf(0x970)] = !![]),
            (this[yf(0xcea)] = 0x0),
            (this[yf(0xcbd)] = !![]);
        }
        [ux(0x72c)]() {
          const yg = ux;
          if (this[yg(0x9d0)] < 0x1) {
            this[yg(0x9d0)] += pR / 0xc8;
            if (this[yg(0x9d0)] > 0x1) this[yg(0x9d0)] = 0x1;
          }
          this[yg(0xe6a)] && (this[yg(0x839)] += pR / 0xc8);
        }
        [ux(0xaff)](rI) {
          const yh = ux;
          rI[yh(0xa2f)](), rI[yh(0x30e)](this["x"], this["y"]);
          if (this[yh(0x171)] === cR[yh(0xbe7)]) {
            rI[yh(0x568)](this[yh(0xa8e)]);
            const rJ = this[yh(0x911)],
              rK = pH(
                rI,
                yh(0x2f2) + this[yh(0x911)],
                rJ * 2.2,
                rJ * 2.2,
                (rM) => {
                  const yi = yh;
                  rM[yi(0x30e)](rJ * 1.1, rJ * 1.1), lK(rM, rJ);
                },
                !![]
              ),
              rL = this[yh(0x9d0)] + this[yh(0x839)] * 0.5;
            (rI[yh(0xae3)] = (0x1 - this[yh(0x839)]) * 0.3),
              rI[yh(0x18a)](rL, rL),
              rI[yh(0x99f)](
                rK,
                -rK[yh(0xa59)] / 0x2,
                -rK[yh(0x48c)] / 0x2,
                rK[yh(0xa59)],
                rK[yh(0x48c)]
              );
          } else {
            if (this[yh(0x171)] === cR[yh(0x80b)]) {
              let rM = this[yh(0x9d0)] + this[yh(0x839)] * 0.5;
              (rI[yh(0xae3)] = 0x1 - this[yh(0x839)]), (rI[yh(0xae3)] *= 0.9);
              const rN =
                0.93 +
                0.07 *
                  (Math[yh(0x12d)](
                    Date[yh(0xa4a)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              rM *= rN;
              const rO = this[yh(0x911)],
                rP = pH(
                  rI,
                  yh(0x36c) + this[yh(0x911)],
                  rO * 2.2,
                  rO * 2.2,
                  (rQ) => {
                    const yj = yh;
                    rQ[yj(0x30e)](rO * 1.1, rO * 1.1);
                    const rR = rO / 0x64;
                    rQ[yj(0x18a)](rR, rR),
                      lF(rQ, 0x5c),
                      (rQ[yj(0x9ed)] = rQ[yj(0xb0f)] = yj(0x22b)),
                      (rQ[yj(0x71e)] = 0x28),
                      (rQ[yj(0x669)] = yj(0x5f8)),
                      rQ[yj(0x8ae)](),
                      (rQ[yj(0x681)] = yj(0x96a)),
                      (rQ[yj(0x669)] = yj(0x340)),
                      (rQ[yj(0x71e)] = 0xe),
                      rQ[yj(0x615)](),
                      rQ[yj(0x8ae)]();
                  },
                  !![]
                );
              rI[yh(0x18a)](rM, rM),
                rI[yh(0x99f)](
                  rP,
                  -rP[yh(0xa59)] / 0x2,
                  -rP[yh(0x48c)] / 0x2,
                  rP[yh(0xa59)],
                  rP[yh(0x48c)]
                );
            } else {
              if (this[yh(0x171)] === cR[yh(0x434)]) {
                rI[yh(0xa60)](this[yh(0x911)] / 0x32),
                  (rI[yh(0x9ed)] = yh(0x22b)),
                  rI[yh(0xa2f)](),
                  (this[yh(0xcea)] +=
                    ((this[yh(0x5d0)] >= 0x0 ? 0x1 : -0x1) * pR) / 0x12c),
                  (this[yh(0xcea)] = Math[yh(0x585)](
                    0x1,
                    Math[yh(0x9da)](0x0, this[yh(0xcea)])
                  ));
                if (this[yh(0xcea)] > 0x0) {
                  rI[yh(0xa60)](this[yh(0xcea)]),
                    (rI[yh(0xae3)] *= this[yh(0xcea)]),
                    (rI[yh(0x71e)] = 0.1),
                    (rI[yh(0x669)] = rI[yh(0x681)] = yh(0xe2b)),
                    (rI[yh(0xb46)] = yh(0x63b)),
                    (rI[yh(0x341)] = yh(0x8b5) + iB);
                  const rR = yh(0xc7a) + (this[yh(0x5d0)] + 0x1);
                  lS(
                    rI,
                    rR,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rR[yh(0xc2f)] * 0.09),
                    !![]
                  );
                }
                rI[yh(0xbec)]();
                const rQ = this[yh(0x7af)]
                  ? 0.6
                  : ((this["id"] + Date[yh(0xa4a)]()) / 0x4b0) % 6.28;
                rI[yh(0xa2f)]();
                for (let rS = 0x0; rS < 0x8; rS++) {
                  const rT = 0x1 - rS / 0x8,
                    rU = rT * 0x50;
                  rI[yh(0x568)](rQ),
                    (rI[yh(0x669)] = yh(0xc8a)),
                    rI[yh(0xc0e)](),
                    rI[yh(0x8b6)](-rU / 0x2, -rU / 0x2, rU, rU),
                    rI[yh(0x1d2)](),
                    (rI[yh(0x71e)] = 0x28),
                    rI[yh(0x8ae)](),
                    (rI[yh(0x71e)] = 0x14),
                    rI[yh(0x8ae)]();
                }
                rI[yh(0xbec)]();
                if (!this[yh(0x59d)]) {
                  this[yh(0x59d)] = [];
                  for (let rV = 0x0; rV < 0x1e; rV++) {
                    this[yh(0x59d)][yh(0x9db)]({
                      x: Math[yh(0xe0d)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rW = 0x0; rW < this[yh(0x59d)][yh(0xc2f)]; rW++) {
                  const rX = this[yh(0x59d)][rW];
                  (rX["x"] += rX["v"]),
                    rX["x"] > 0x1 &&
                      ((rX["x"] %= 0x1),
                      (rX[yh(0xa8e)] = Math[yh(0xe0d)]() * 6.28),
                      (rX["v"] = Math[yh(0xe0d)]() * 0.005 + 0.008),
                      (rX["s"] = Math[yh(0xe0d)]() * 0.025 + 0.008)),
                    rI[yh(0xa2f)](),
                    (rI[yh(0xae3)] =
                      rX["x"] < 0.2
                        ? rX["x"] / 0.2
                        : rX["x"] > 0.8
                        ? 0x1 - (rX["x"] - 0.8) / 0.2
                        : 0x1),
                    rI[yh(0x18a)](0x5a, 0x5a),
                    rI[yh(0x568)](rX[yh(0xa8e)]),
                    rI[yh(0x30e)](rX["x"], 0x0),
                    rI[yh(0xc0e)](),
                    rI[yh(0x878)](0x0, 0x0, rX["s"], 0x0, Math["PI"] * 0x2),
                    (rI[yh(0x681)] = yh(0xe2b)),
                    rI[yh(0x615)](),
                    rI[yh(0xbec)]();
                }
              }
            }
          }
          rI[yh(0xbec)]();
        }
      },
      lM = 0x0,
      lN = 0x0,
      lO = class extends lL {
        constructor(rI, rJ, rK, rL) {
          const yk = ux;
          super(cR[yk(0x524)], rI, rJ, rK, 0x46),
            (this[yk(0xa8e)] = (Math[yk(0xe0d)]() * 0x2 - 0x1) * 0.2),
            (this[yk(0x7e1)] = dB[rL]);
        }
        [ux(0x72c)]() {
          const yl = ux;
          if (this[yl(0x9d0)] < 0x2 || pQ - lM < 0x9c4) {
            this[yl(0x9d0)] += pR / 0x12c;
            return;
          }
          this[yl(0xe6a)] && (this[yl(0x839)] += pR / 0xc8),
            this[yl(0x812)] &&
              ((this["x"] = px(this["x"], this[yl(0x812)]["x"], 0xc8)),
              (this["y"] = px(this["y"], this[yl(0x812)]["y"], 0xc8)), hack.onPickup(this));
        }
        [ux(0xaff)](rI) {
          const ym = ux;
          if (this[ym(0x9d0)] === 0x0) return;
          rI[ym(0xa2f)](), rI[ym(0x30e)](this["x"], this["y"]);
          const rJ = ym(0x152) + this[ym(0x7e1)]["id"];
          let rK =
            (this[ym(0x9b9)] || lN < 0x3) &&
            pH(
              rI,
              rJ,
              0x78,
              0x78,
              (rN) => {
                const yn = ym;
                (this[yn(0x9b9)] = !![]),
                  lN++,
                  rN[yn(0x30e)](0x3c, 0x3c),
                  (rN[yn(0xb0f)] = rN[yn(0x9ed)] = yn(0x22b)),
                  rN[yn(0xc0e)](),
                  rN[yn(0x8b6)](-0x32, -0x32, 0x64, 0x64),
                  (rN[yn(0x71e)] = 0x12),
                  (rN[yn(0x669)] = yn(0x406)),
                  rN[yn(0x8ae)](),
                  (rN[yn(0x71e)] = 0x8),
                  (rN[yn(0x681)] = hP[this[yn(0x7e1)][yn(0x5b6)]]),
                  rN[yn(0x615)](),
                  (rN[yn(0x669)] = hQ[this[yn(0x7e1)][yn(0x5b6)]]),
                  rN[yn(0x8ae)]();
                const rO = pK(
                  rN,
                  this[yn(0x7e1)][yn(0x5ee)],
                  0x12,
                  yn(0x624),
                  0x3,
                  !![]
                );
                rN[yn(0x99f)](
                  rO,
                  -rO[yn(0xa59)] / 0x2,
                  0x32 - 0xd / 0x2 - rO[yn(0x48c)],
                  rO[yn(0xa59)],
                  rO[yn(0x48c)]
                ),
                  rN[yn(0xa2f)](),
                  rN[yn(0x30e)](
                    0x0 + this[yn(0x7e1)][yn(0xca5)],
                    -0x5 + this[yn(0x7e1)][yn(0x87f)]
                  ),
                  this[yn(0x7e1)][yn(0x114)](rN),
                  rN[yn(0xbec)]();
              },
              !![]
            );
          if (!rK) rK = pG[rJ];
          rI[ym(0x568)](this[ym(0xa8e)]);
          const rL = Math[ym(0x585)](this[ym(0x9d0)], 0x1),
            rM =
              (this[ym(0x911)] / 0x64) *
              (0x1 +
                Math[ym(0x12d)](Date[ym(0xa4a)]() / 0xfa + this["id"]) * 0.05) *
              rL *
              (0x1 - this[ym(0x839)]);
          rI[ym(0x18a)](rM, rM),
            rI[ym(0x568)](Math["PI"] * lJ(0x1 - rL)),
            rK
              ? rI[ym(0x99f)](
                  rK,
                  -rK[ym(0xa59)] / 0x2,
                  -rK[ym(0x48c)] / 0x2,
                  rK[ym(0xa59)],
                  rK[ym(0x48c)]
                )
              : (rI[ym(0xc0e)](),
                rI[ym(0x8b6)](-0x3c, -0x3c, 0x78, 0x78),
                (rI[ym(0x681)] = hP[this[ym(0x7e1)][ym(0x5b6)]]),
                rI[ym(0x615)]()),
            rI[ym(0xbec)]();
        }
      };
    function lP(rI) {
      const yo = ux;
      rI[yo(0xc0e)](),
        rI[yo(0x4a6)](0x0, 4.5),
        rI[yo(0xa39)](3.75, 0x0, 0x0, -4.5),
        rI[yo(0xa39)](-3.75, 0x0, 0x0, 4.5),
        rI[yo(0x1d2)](),
        (rI[yo(0xb0f)] = rI[yo(0x9ed)] = yo(0x22b)),
        (rI[yo(0x681)] = rI[yo(0x669)] = yo(0xb9e)),
        (rI[yo(0x71e)] = 0x1),
        rI[yo(0x8ae)](),
        rI[yo(0x615)](),
        rI[yo(0x173)](),
        rI[yo(0xc0e)](),
        rI[yo(0x878)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, l1),
        (rI[yo(0x681)] = yo(0xe62)),
        rI[yo(0x615)]();
    }
    function lQ(rI, rJ = ![]) {
      const yp = ux;
      lR(rI, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lR(rI, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rJ) {
        const rK = Math["PI"] / 0x7;
        rI[yp(0xc0e)](),
          rI[yp(0x878)](0x0, 0x0, 23.5, Math["PI"] + rK, Math["PI"] * 0x2 - rK),
          (rI[yp(0x669)] = yp(0x64c)),
          (rI[yp(0x71e)] = 0x4),
          (rI[yp(0xb0f)] = yp(0x22b)),
          rI[yp(0x8ae)]();
      }
    }
    function lR(rI, rJ, rK) {
      const yq = ux;
      rI[yq(0xa2f)](),
        rI[yq(0x568)](rJ),
        rI[yq(0x30e)](0x0, -23.6),
        rI[yq(0x568)](rK),
        rI[yq(0xc0e)](),
        rI[yq(0x4a6)](-6.5, 0x1),
        rI[yq(0xa7c)](0x0, -0xf),
        rI[yq(0xa7c)](6.5, 0x1),
        (rI[yq(0x681)] = yq(0x829)),
        (rI[yq(0x71e)] = 3.5),
        rI[yq(0x615)](),
        (rI[yq(0x9ed)] = yq(0x22b)),
        (rI[yq(0x669)] = yq(0x64c)),
        rI[yq(0x8ae)](),
        rI[yq(0xbec)]();
    }
    function lS(rI, rJ, rK, rL, rM, rN, rO = ![]) {
      const yr = ux;
      var rP = rJ[yr(0xc2f)],
        rQ;
      rI[yr(0xa2f)](),
        rI[yr(0x30e)](rK, rL),
        rI[yr(0x568)]((0x1 * rN) / 0x2),
        rI[yr(0x568)]((0x1 * (rN / rP)) / 0x2),
        (rI[yr(0x290)] = yr(0xc0d));
      for (var rR = 0x0; rR < rP; rR++) {
        rI[yr(0x568)](-rN / rP),
          rI[yr(0xa2f)](),
          rI[yr(0x30e)](0x0, rM),
          (rQ = rJ[rR]),
          rO && rI[yr(0xaee)](rQ, 0x0, 0x0),
          rI[yr(0xc76)](rQ, 0x0, 0x0),
          rI[yr(0xbec)]();
      }
      rI[yr(0xbec)]();
    }
    function lT(rI, rJ = 0x1) {
      const ys = ux,
        rK = 0xf;
      rI[ys(0xc0e)]();
      const rL = 0x6;
      for (let rQ = 0x0; rQ < rL; rQ++) {
        const rR = (rQ / rL) * Math["PI"] * 0x2;
        rI[ys(0xa7c)](Math[ys(0x65c)](rR) * rK, Math[ys(0x12d)](rR) * rK);
      }
      rI[ys(0x1d2)](),
        (rI[ys(0x71e)] = 0x4),
        (rI[ys(0x669)] = ys(0x7f5)),
        rI[ys(0x8ae)](),
        (rI[ys(0x681)] = ys(0xcf9)),
        rI[ys(0x615)]();
      const rM = (Math["PI"] * 0x2) / rL,
        rN = Math[ys(0x65c)](rM) * rK,
        rO = Math[ys(0x12d)](rM) * rK;
      for (let rS = 0x0; rS < rL; rS++) {
        rI[ys(0xc0e)](),
          rI[ys(0x4a6)](0x0, 0x0),
          rI[ys(0xa7c)](rK, 0x0),
          rI[ys(0xa7c)](rN, rO),
          rI[ys(0x1d2)](),
          (rI[ys(0x681)] =
            ys(0xc41) + (0.2 + (((rS + 0x4) % rL) / rL) * 0.35) + ")"),
          rI[ys(0x615)](),
          rI[ys(0x568)](rM);
      }
      rI[ys(0xc0e)]();
      const rP = rK * 0.65;
      for (let rT = 0x0; rT < rL; rT++) {
        const rU = (rT / rL) * Math["PI"] * 0x2;
        rI[ys(0xa7c)](Math[ys(0x65c)](rU) * rP, Math[ys(0x12d)](rU) * rP);
      }
      (rI[ys(0x636)] = 0x23 + rJ * 0xf),
        (rI[ys(0x9b6)] = rI[ys(0x681)] = ys(0x388)),
        rI[ys(0x615)](),
        rI[ys(0x615)](),
        rI[ys(0x615)]();
    }
    var lU = class extends lH {
        constructor(rI, rJ, rK, rL, rM, rN, rO) {
          const yt = ux;
          super(rI, cR[yt(0xd62)], rJ, rK, rL, rO, rM),
            (this[yt(0x2c4)] = rN),
            (this[yt(0xa8a)] = 0x0),
            (this[yt(0x4fb)] = 0x0),
            (this[yt(0x842)] = 0x0),
            (this[yt(0x35a)] = 0x0),
            (this[yt(0x5ef)] = ""),
            (this[yt(0x921)] = 0x0),
            (this[yt(0x228)] = !![]),
            (this[yt(0x678)] = ![]),
            (this[yt(0x257)] = ![]),
            (this[yt(0xc9d)] = ![]),
            (this[yt(0x8ca)] = ![]),
            (this[yt(0xd31)] = ![]),
            (this[yt(0x980)] = !![]),
            (this[yt(0x8be)] = 0x0),
            (this[yt(0x444)] = 0x0);
        }
        [ux(0x72c)]() {
          const yu = ux;
          super[yu(0x72c)]();
          if (this[yu(0xe6a)]) (this[yu(0x4fb)] = 0x1), (this[yu(0xa8a)] = 0x0);
          else {
            const rI = pR / 0xc8;
            let rJ = this[yu(0x2c4)];
            if (this[yu(0x678)] && rJ === cX[yu(0x72f)]) rJ = cX[yu(0x649)];
            (this[yu(0xa8a)] = Math[yu(0x585)](
              0x1,
              Math[yu(0x9da)](
                0x0,
                this[yu(0xa8a)] + (rJ === cX[yu(0xb56)] ? rI : -rI)
              )
            )),
              (this[yu(0x4fb)] = Math[yu(0x585)](
                0x1,
                Math[yu(0x9da)](
                  0x0,
                  this[yu(0x4fb)] + (rJ === cX[yu(0x649)] ? rI : -rI)
                )
              )),
              (this[yu(0x8be)] = px(this[yu(0x8be)], this[yu(0x444)], 0x64));
          }
        }
        [ux(0xaff)](rI) {
          const yv = ux;
          rI[yv(0xa2f)](), rI[yv(0x30e)](this["x"], this["y"]);
          let rJ = this[yv(0x911)] / l0;
          this[yv(0xe6a)] &&
            rI[yv(0x568)]((this[yv(0x839)] * Math["PI"]) / 0x4);
          rI[yv(0x18a)](rJ, rJ), this[yv(0x76b)](rI);
          this[yv(0x2a9)] &&
            (rI[yv(0xa2f)](),
            rI[yv(0x568)](this[yv(0xa8e)]),
            rI[yv(0xa60)](this[yv(0x911)] / 0x28 / rJ),
            this[yv(0x832)](rI),
            rI[yv(0xbec)]());
          this[yv(0xb0d)] &&
            (rI[yv(0xa2f)](),
            rI[yv(0xa60)](l0 / 0x12),
            this[yv(0x9f4)](rI, pQ / 0x12c),
            rI[yv(0xbec)]());
          const rK = yv(0x64c);
          if (this[yv(0x483)]) {
            const rW = Date[yv(0xa4a)](),
              rX = (Math[yv(0x12d)](rW / 0x12c) * 0.5 + 0.5) * 0x2;
            rI[yv(0xc0e)](),
              rI[yv(0x4a6)](0x5, -0x22),
              rI[yv(0x4c4)](0x2f, -0x19, 0x14, 0x5, 0x2b - rX, 0x19),
              rI[yv(0xa39)](0x0, 0x28 + rX * 0.6, -0x2b + rX, 0x19),
              rI[yv(0x4c4)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rI[yv(0xa39)](0x0, -0x23, 0x5, -0x22),
              (rI[yv(0x681)] = rK),
              rI[yv(0x615)]();
          }
          this[yv(0xd31)] && lQ(rI);
          const rL = {};
          rL[yv(0x7c3)] = [yv(0x48d), yv(0x360)];
          const rM = rL,
            rN = this[yv(0x8ca)]
              ? [yv(0x601), yv(0xab6)]
              : this[yv(0x5f4)]
              ? [yv(0x968), yv(0xbd5)]
              : rM[this[yv(0x5a6)]] || [yv(0x81d), yv(0x6fe)];
          (rN[0x0] = this[yv(0xa38)](rN[0x0])),
            (rN[0x1] = this[yv(0xa38)](rN[0x1]));
          let rO = 2.75;
          !this[yv(0x5f4)] && (rO /= rJ);
          (rI[yv(0x681)] = rN[0x0]),
            (rI[yv(0x71e)] = rO),
            (rI[yv(0x669)] = rN[0x1]);
          this[yv(0x5f4)] &&
            (rI[yv(0xc0e)](),
            rI[yv(0x4a6)](0x0, 0x0),
            rI[yv(0xa39)](-0x1e, 0xf, -0x1e, 0x1e),
            rI[yv(0xa39)](0x0, 0x37, 0x1e, 0x1e),
            rI[yv(0xa39)](0x1e, 0xf, 0x0, 0x0),
            rI[yv(0x615)](),
            rI[yv(0x8ae)](),
            rI[yv(0xa2f)](),
            (rI[yv(0x681)] = rI[yv(0x669)]),
            (rI[yv(0xb46)] = yv(0x63b)),
            (rI[yv(0x341)] = yv(0x1f9) + iB),
            lS(rI, yv(0x579), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rI[yv(0xbec)]());
          rI[yv(0xc0e)]();
          this[yv(0x3d3)]
            ? !this[yv(0x483)]
              ? rI[yv(0x8b6)](-0x19, -0x19, 0x32, 0x32)
              : (rI[yv(0x4a6)](0x19, 0x19),
                rI[yv(0xa7c)](-0x19, 0x19),
                rI[yv(0xa7c)](-0x19, -0xa),
                rI[yv(0xa7c)](-0xa, -0x19),
                rI[yv(0xa7c)](0xa, -0x19),
                rI[yv(0xa7c)](0x19, -0xa),
                rI[yv(0x1d2)]())
            : rI[yv(0x878)](0x0, 0x0, l0, 0x0, l1);
          rI[yv(0x615)](), rI[yv(0x8ae)]();
          this[yv(0x71b)] &&
            (rI[yv(0xa2f)](),
            rI[yv(0x173)](),
            rI[yv(0xc0e)](),
            !this[yv(0x483)] &&
              (rI[yv(0x4a6)](-0x8, -0x1e),
              rI[yv(0xa7c)](0xf, -0x7),
              rI[yv(0xa7c)](0x1e, -0x14),
              rI[yv(0xa7c)](0x1e, -0x32)),
            rI[yv(0x30e)](
              0x0,
              0x2 * (0x1 - (this[yv(0x4fb)] + this[yv(0xa8a)]))
            ),
            rI[yv(0x4a6)](-0x2, 0x0),
            rI[yv(0xa7c)](-0x3, 4.5),
            rI[yv(0xa7c)](0x3, 4.5),
            rI[yv(0xa7c)](0x2, 0x0),
            (rI[yv(0x681)] = yv(0xb9e)),
            rI[yv(0x615)](),
            rI[yv(0xbec)]());
          this[yv(0x483)] &&
            (rI[yv(0xc0e)](),
            rI[yv(0x4a6)](0x0, -0x17),
            rI[yv(0xa39)](0x4, -0xd, 0x1b, -0x8),
            rI[yv(0xa7c)](0x14, -0x1c),
            rI[yv(0xa7c)](-0x14, -0x1c),
            rI[yv(0xa7c)](-0x1b, -0x8),
            rI[yv(0xa39)](-0x4, -0xd, 0x0, -0x17),
            (rI[yv(0x681)] = rK),
            rI[yv(0x615)]());
          if (this[yv(0x163)]) {
            (rI[yv(0x669)] = yv(0x955)),
              (rI[yv(0x71e)] = 1.4),
              rI[yv(0xc0e)](),
              (rI[yv(0xb0f)] = yv(0x22b));
            const rY = 4.5;
            for (let rZ = 0x0; rZ < 0x2; rZ++) {
              const s0 = -0x12 + rZ * 0x1d;
              for (let s1 = 0x0; s1 < 0x3; s1++) {
                const s2 = s0 + s1 * 0x3;
                rI[yv(0x4a6)](s2, rY + -1.5), rI[yv(0xa7c)](s2 + 1.6, rY + 1.6);
              }
            }
            rI[yv(0x8ae)]();
          }
          if (this[yv(0x281)]) {
            rI[yv(0xc0e)](),
              rI[yv(0x878)](0x0, 2.5, 3.3, 0x0, l1),
              (rI[yv(0x681)] = yv(0xc65)),
              rI[yv(0x615)](),
              rI[yv(0xc0e)](),
              rI[yv(0x878)](0xd, 2.8, 5.5, 0x0, l1),
              rI[yv(0x878)](-0xd, 2.8, 5.5, 0x0, l1),
              (rI[yv(0x681)] = yv(0xabb)),
              rI[yv(0x615)](),
              rI[yv(0xa2f)](),
              rI[yv(0x568)](-Math["PI"] / 0x4),
              rI[yv(0xc0e)]();
            const s3 = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[yv(0x3d3)] &&
              s3[yv(0xa40)]((s4) => {
                (s4[0x0] *= 1.1), (s4[0x1] *= 1.1);
              });
            for (let s4 = 0x0; s4 < 0x2; s4++) {
              for (let s5 = 0x0; s5 < s3[yv(0xc2f)]; s5++) {
                const s6 = s3[s5];
                rI[yv(0x4a6)](s6[0x0], s6[0x1]), rI[yv(0x878)](...s6, 0x0, l1);
              }
              rI[yv(0x568)](-Math["PI"] / 0x2);
            }
            (rI[yv(0x681)] = yv(0x4ef)), rI[yv(0x615)](), rI[yv(0xbec)]();
          }
          const rP = this[yv(0xa8a)],
            rQ = this[yv(0x4fb)],
            rR = 0x6 * rP,
            rS = 0x4 * rQ;
          function rT(s7, s8) {
            const yw = yv;
            rI[yw(0xc0e)]();
            const s9 = 3.25;
            rI[yw(0x4a6)](s7 - s9, s8 - s9),
              rI[yw(0xa7c)](s7 + s9, s8 + s9),
              rI[yw(0x4a6)](s7 + s9, s8 - s9),
              rI[yw(0xa7c)](s7 - s9, s8 + s9),
              (rI[yw(0x71e)] = 0x2),
              (rI[yw(0xb0f)] = yw(0x22b)),
              (rI[yw(0x669)] = yw(0xb9e)),
              rI[yw(0x8ae)](),
              rI[yw(0x1d2)]();
          }
          function rU(s7, s8) {
            const yx = yv;
            rI[yx(0xa2f)](),
              rI[yx(0x30e)](s7, s8),
              rI[yx(0xc0e)](),
              rI[yx(0x4a6)](-0x4, 0x0),
              rI[yx(0xa39)](0x0, 0x6, 0x4, 0x0),
              (rI[yx(0x71e)] = 0x2),
              (rI[yx(0xb0f)] = yx(0x22b)),
              (rI[yx(0x669)] = yx(0xb9e)),
              rI[yx(0x8ae)](),
              rI[yx(0xbec)]();
          }
          if (this[yv(0xe6a)]) rT(0x7, -0x5), rT(-0x7, -0x5);
          else {
            if (this[yv(0xb60)]) rU(0x7, -0x5), rU(-0x7, -0x5);
            else {
              let s7 = function (s9, sa, sb, sc, se = 0x0) {
                  const yy = yv,
                    sf = se ^ 0x1;
                  rI[yy(0x4a6)](s9 - sb, sa - sc + se * rR + sf * rS),
                    rI[yy(0xa7c)](s9 + sb, sa - sc + sf * rR + se * rS),
                    rI[yy(0xa7c)](s9 + sb, sa + sc),
                    rI[yy(0xa7c)](s9 - sb, sa + sc),
                    rI[yy(0xa7c)](s9 - sb, sa - sc);
                },
                s8 = function (s9 = 0x0) {
                  const yz = yv;
                  rI[yz(0xc0e)](),
                    rI[yz(0xb04)](0x7, -0x5, 2.5 + s9, 0x6 + s9, 0x0, 0x0, l1),
                    rI[yz(0x4a6)](-0x7, -0x5),
                    rI[yz(0xb04)](-0x7, -0x5, 2.5 + s9, 0x6 + s9, 0x0, 0x0, l1),
                    (rI[yz(0x669)] = rI[yz(0x681)] = yz(0xb9e)),
                    rI[yz(0x615)]();
                };
              rI[yv(0xa2f)](),
                rI[yv(0xc0e)](),
                s7(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                s7(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rI[yv(0x173)](),
                s8(0.7),
                s8(0x0),
                rI[yv(0x173)](),
                rI[yv(0xc0e)](),
                rI[yv(0x878)](
                  0x7 + this[yv(0x842)] * 0x2,
                  -0x5 + this[yv(0x35a)] * 3.5,
                  3.1,
                  0x0,
                  l1
                ),
                rI[yv(0x4a6)](-0x7, -0x5),
                rI[yv(0x878)](
                  -0x7 + this[yv(0x842)] * 0x2,
                  -0x5 + this[yv(0x35a)] * 3.5,
                  3.1,
                  0x0,
                  l1
                ),
                (rI[yv(0x681)] = yv(0xe62)),
                rI[yv(0x615)](),
                rI[yv(0xbec)]();
            }
          }
          if (this[yv(0xc9d)]) {
            rI[yv(0xa2f)](), rI[yv(0x30e)](0x0, -0xc);
            if (this[yv(0xe6a)]) rI[yv(0x18a)](0.7, 0.7), rT(0x0, -0x3);
            else
              this[yv(0xb60)]
                ? (rI[yv(0x18a)](0.7, 0.7), rU(0x0, -0x3))
                : lP(rI);
            rI[yv(0xbec)]();
          }
          this[yv(0x257)] &&
            (rI[yv(0xa2f)](),
            rI[yv(0x30e)](0x0, 0xa),
            rI[yv(0x568)](-Math["PI"] / 0x2),
            rI[yv(0x18a)](0.82, 0.82),
            this[yv(0x55d)](rI, ![], 0.85),
            rI[yv(0xbec)]());
          const rV = rP * (-0x5 - 5.5) + rQ * (-0x5 - 0x4);
          rI[yv(0xa2f)](),
            rI[yv(0xc0e)](),
            rI[yv(0x30e)](0x0, 9.5),
            rI[yv(0x4a6)](-5.6, 0x0),
            rI[yv(0xa39)](0x0, 0x5 + rV, 5.6, 0x0),
            (rI[yv(0xb0f)] = yv(0x22b));
          this[yv(0x281)]
            ? ((rI[yv(0x71e)] = 0x7),
              (rI[yv(0x669)] = yv(0xc65)),
              rI[yv(0x8ae)](),
              (rI[yv(0x669)] = yv(0x490)))
            : (rI[yv(0x669)] = yv(0xb9e));
          (rI[yv(0x71e)] = 1.75), rI[yv(0x8ae)](), rI[yv(0xbec)]();
          if (this[yv(0x242)]) {
            const s9 = this[yv(0xa8a)],
              sa = 0x28,
              sb = Date[yv(0xa4a)]() / 0x12c,
              sc = this[yv(0x5f4)] ? 0x0 : Math[yv(0x12d)](sb) * 0.5 + 0.5,
              se = sc * 0x4,
              sf = 0x28 - sc * 0x4,
              sg = sf - (this[yv(0x5f4)] ? 0x1 : jg(s9)) * 0x50,
              sh = this[yv(0x71b)];
            (rI[yv(0x71e)] = 0x9 + rO * 0x2),
              (rI[yv(0x9ed)] = yv(0x22b)),
              (rI[yv(0xb0f)] = yv(0x22b));
            for (let si = 0x0; si < 0x2; si++) {
              rI[yv(0xc0e)](), rI[yv(0xa2f)]();
              for (let sj = 0x0; sj < 0x2; sj++) {
                rI[yv(0x4a6)](0x19, 0x0);
                let sk = sg;
                sh && sj === 0x0 && (sk = sf),
                  rI[yv(0xa39)](0x2d + se, sk * 0.5, 0xb, sk),
                  rI[yv(0x18a)](-0x1, 0x1);
              }
              rI[yv(0xbec)](),
                (rI[yv(0x669)] = rN[0x1 - si]),
                rI[yv(0x8ae)](),
                (rI[yv(0x71e)] = 0x9);
            }
            rI[yv(0xa2f)](),
              rI[yv(0x30e)](0x0, sg),
              lT(rI, sc),
              rI[yv(0xbec)]();
          }
          rI[yv(0xbec)]();
        }
        [ux(0x2da)](rI, rJ) {}
        [ux(0x4a3)](rI, rJ = 0x1) {
          const yA = ux,
            rK = nk[this["id"]];
          if (!rK) return;
          for (let rL = 0x0; rL < rK[yA(0xc2f)]; rL++) {
            const rM = rK[rL];
            if (rM["t"] > lW + lX) continue;
            !rM["x"] &&
              ((rM["x"] = this["x"]),
              (rM["y"] = this["y"] - this[yA(0x911)] - 0x44),
              (rM[yA(0xd4e)] = this["x"]),
              (rM[yA(0xd49)] = this["y"]));
            const rN = rM["t"] > lW ? 0x1 - (rM["t"] - lW) / lX : 0x1,
              rO = rN * rN * rN;
            (rM["x"] += (this["x"] - rM[yA(0xd4e)]) * rO),
              (rM["y"] += (this["y"] - rM[yA(0xd49)]) * rO),
              (rM[yA(0xd4e)] = this["x"]),
              (rM[yA(0xd49)] = this["y"]);
            const rP = Math[yA(0x585)](0x1, rM["t"] / 0x64);
            rI[yA(0xa2f)](),
              (rI[yA(0xae3)] = (rN < 0.7 ? rN / 0.7 : 0x1) * rP * 0.9),
              rI[yA(0x30e)](rM["x"], rM["y"] - (rM["t"] / lW) * 0x14),
              rI[yA(0xa60)](rJ);
            const rQ = pK(rI, rM[yA(0xa37)], 0x10, yA(0xd3d), 0x0, !![], ![]);
            rI[yA(0xa60)](rP), rI[yA(0xc0e)]();
            const rR = rQ[yA(0xa59)] + 0xa,
              rS = rQ[yA(0x48c)] + 0xf;
            rI[yA(0xdc5)]
              ? rI[yA(0xdc5)](-rR / 0x2, -rS / 0x2, rR, rS, 0x5)
              : rI[yA(0x8b6)](-rR / 0x2, -rS / 0x2, rR, rS),
              (rI[yA(0x681)] = rM[yA(0xe14)]),
              rI[yA(0x615)](),
              (rI[yA(0x669)] = yA(0xd3d)),
              (rI[yA(0x71e)] = 1.5),
              rI[yA(0x8ae)](),
              rI[yA(0x99f)](
                rQ,
                -rQ[yA(0xa59)] / 0x2,
                -rQ[yA(0x48c)] / 0x2,
                rQ[yA(0xa59)],
                rQ[yA(0x48c)]
              ),
              rI[yA(0xbec)]();
          }
        }
      },
      lV = 0x4e20,
      lW = 0xfa0,
      lX = 0xbb8,
      lY = lW + lX;
    function lZ(rI, rJ, rK = 0x1) {
      const yB = ux;
      if (rI[yB(0xe6a)]) return;
      rJ[yB(0xa2f)](),
        rJ[yB(0x30e)](rI["x"], rI["y"]),
        m0(rI, rJ, void 0x0, rK),
        rJ[yB(0x30e)](0x0, -rI[yB(0x911)] - 0x19),
        rJ[yB(0xa2f)](),
        rJ[yB(0xa60)](rK),
        rI[yB(0x5a6)] &&
          (pK(rJ, "@" + rI[yB(0x5a6)], 0xb, yB(0x814), 0x3),
          rJ[yB(0x30e)](0x0, -0x10)),
        rI[yB(0x5ef)] &&
          (pK(rJ, rI[yB(0x5ef)], 0x12, yB(0x624), 0x3),
          rJ[yB(0x30e)](0x0, -0x5)),
        rJ[yB(0xbec)](),
        !rI[yB(0x980)] &&
          rI[yB(0x891)] > 0.001 &&
          ((rJ[yB(0xae3)] = rI[yB(0x891)]),
          rJ[yB(0x18a)](rI[yB(0x891)] * 0x3, rI[yB(0x891)] * 0x3),
          rJ[yB(0xc0e)](),
          rJ[yB(0x878)](0x0, 0x0, 0x14, 0x0, l1),
          (rJ[yB(0x681)] = yB(0xb9e)),
          rJ[yB(0x615)](),
          nC(rJ, 0.8),
          rJ[yB(0xc0e)](),
          rJ[yB(0x878)](0x0, 0x0, 0x14, 0x0, l1),
          (rJ[yB(0x681)] = yB(0xaf2)),
          rJ[yB(0x615)](),
          rJ[yB(0xc0e)](),
          rJ[yB(0x4a6)](0x0, 0x0),
          rJ[yB(0x878)](0x0, 0x0, 0x10, 0x0, l1 * rI[yB(0xbaf)]),
          rJ[yB(0xa7c)](0x0, 0x0),
          rJ[yB(0x173)](),
          nC(rJ, 0.8)),
        rJ[yB(0xbec)]();
    }
    function m0(rI, rJ, rK = ![], rL = 0x1) {
      const yC = ux;
      if (rI[yC(0x35e)] <= 0x0) return;
      rJ[yC(0xa2f)](),
        (rJ[yC(0xae3)] = rI[yC(0x35e)]),
        (rJ[yC(0x669)] = yC(0x64c)),
        rJ[yC(0xc0e)]();
      const rM = rK ? 0x8c : rI[yC(0x980)] ? 0x4b : 0x64;
      let rN = rK ? 0x1a : 0x9;
      const rO = !rK && pc[yC(0xa41)];
      rO && (rN += 0x14);
      if (rK) rJ[yC(0x30e)](rI[yC(0x911)] + 0x11, 0x0);
      else {
        if (rI[yC(0x980)] ? pc[yC(0x8d9)] : pc[yC(0x19f)])
          rJ[yC(0x30e)](0x0, rI[yC(0x911)]),
            rJ[yC(0xa60)](rL),
            rJ[yC(0x30e)](-rM / 0x2, rN / 0x2 + 0x14);
        else {
          const rQ = Math[yC(0x9da)](0x1, rI[yC(0x911)] / 0x64);
          rJ[yC(0x18a)](rQ, rQ),
            rJ[yC(0x30e)](-rM / 0x2, rI[yC(0x911)] / rQ + 0x1b);
        }
      }
      rJ[yC(0xc0e)](),
        rJ[yC(0x4a6)](rK ? -0x14 : 0x0, 0x0),
        rJ[yC(0xa7c)](rM, 0x0),
        (rJ[yC(0xb0f)] = yC(0x22b)),
        (rJ[yC(0x71e)] = rN),
        (rJ[yC(0x669)] = yC(0x64c)),
        rJ[yC(0x8ae)]();
      function rP(rR) {
        const yD = yC;
        rJ[yD(0xae3)] = rR < 0.05 ? rR / 0.05 : 0x1;
      }
      rI[yC(0xd33)] > 0x0 &&
        (rP(rI[yC(0xd33)]),
        rJ[yC(0xc0e)](),
        rJ[yC(0x4a6)](0x0, 0x0),
        rJ[yC(0xa7c)](rI[yC(0xd33)] * rM, 0x0),
        (rJ[yC(0x71e)] = rN * (rK ? 0.55 : 0.44)),
        (rJ[yC(0x669)] = yC(0x7ab)),
        rJ[yC(0x8ae)]());
      rI[yC(0x11f)] > 0x0 &&
        (rP(rI[yC(0x11f)]),
        rJ[yC(0xc0e)](),
        rJ[yC(0x4a6)](0x0, 0x0),
        rJ[yC(0xa7c)](rI[yC(0x11f)] * rM, 0x0),
        (rJ[yC(0x71e)] = rN * (rK ? 0.7 : 0.66)),
        (rJ[yC(0x669)] = yC(0x702)),
        rJ[yC(0x8ae)]());
      rI[yC(0x8be)] &&
        (rP(rI[yC(0x8be)]),
        rJ[yC(0xc0e)](),
        rJ[yC(0x4a6)](0x0, 0x0),
        rJ[yC(0xa7c)](rI[yC(0x8be)] * rM, 0x0),
        (rJ[yC(0x71e)] = rN * (rK ? 0.45 : 0.35)),
        (rJ[yC(0x669)] = yC(0x62d)),
        rJ[yC(0x8ae)]());
      if (rI[yC(0x980)]) {
        rJ[yC(0xae3)] = 0x1;
        hack.updatePlayer(rI);
        var hp = Math.round(rI.health * hack.hp);
        var shield = Math.round(rI.shield * hack.hp);
        const rR = pK(
          rJ,
          (rI.username == hack.player.name ? `HP ${hp}${shield ? " + " + shield : ""} ` : '')+yC(0x216) + (rI[yC(0x921)] + 0x1),
          rK ? 0xc : 0xe,
          yC(0x624),
          0x3,
          !![]
        );
        rJ[yC(0x99f)](
          rR,
          rM + rN / 0x2 - rR[yC(0xa59)],
          rN / 0x2,
          rR[yC(0xa59)],
          rR[yC(0x48c)]
        );
        if (rK) {
          const rS = pK(rJ, "@" + rI[yC(0x5a6)], 0xc, yC(0x814), 0x3, !![]);
          rJ[yC(0x99f)](
            rS,
            -rN / 0x2,
            -rN / 0x2 - rS[yC(0x48c)],
            rS[yC(0xa59)],
            rS[yC(0x48c)]
          );
        }
      } else {
        rJ[yC(0xae3)] = 0x1;
        const rT = kd[rI[yC(0x171)]],
          rU = pK(rJ, rT, 0xe, yC(0x624), 0x3, !![], rI[yC(0xcb6)]);
        rJ[yC(0xa2f)](), rJ[yC(0x30e)](0x0, -rN / 0x2 - rU[yC(0x48c)]);
        rU[yC(0xa59)] > rM + rN
          ? rJ[yC(0x99f)](
              rU,
              rM / 0x2 - rU[yC(0xa59)] / 0x2,
              0x0,
              rU[yC(0xa59)],
              rU[yC(0x48c)]
            )
          : rJ[yC(0x99f)](rU, -rN / 0x2, 0x0, rU[yC(0xa59)], rU[yC(0x48c)]);
        rJ[yC(0xbec)]();
        const rV = pK(rJ, rI[yC(0xcb6)], 0xe, hO[rI[yC(0xcb6)]], 0x3, !![]);
        rJ[yC(0x99f)](
          rV,
          rM + rN / 0x2 - rV[yC(0xa59)],
          rN / 0x2,
          rV[yC(0xa59)],
          rV[yC(0x48c)]
        );
        let genCanvas = pK;
        let mob = rI, ctx = rJ;
        hack.updateMob(mob);
        const health = genCanvas(
          rJ,
          `${Math.round(mob['health'] * hack.getHP(mob))} (${Math.round(mob['health'] * 100)}%)`,
          30,
          hack.getColor(mob),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) ctx.drawImage(
          health,
          -60,
          -150,
          health.worldW,
          health.worldH
        );
        const health2 = genCanvas(
          ctx,
          `/ ${hack.getHP(mob)} `,
          30,
          hack.getColor(mob),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) ctx.drawImage(
          health2,
          -60,
          -120,
          health2.worldW,
          health2.worldH
        );
      }
      if (rO) {
        let rW = m1(rI[yC(0x11f)]);
        rI[yC(0x8be)] > 0x0 && (rW += yC(0x658) + m1(rI[yC(0x8be)])),
          rJ[yC(0xa2f)](),
          rJ[yC(0x30e)](rM / 0x2, 0x0),
          pK(
            rJ,
            rW,
            0xe,
            yC(0x624),
            0x3,
            void 0x0,
            (rI[yC(0x980)] ? 0x1 : 0x0) +
              "_" +
              Math[yC(0xa6f)](rI[yC(0x911)] / 0x64)
          ),
          rJ[yC(0xbec)]();
      }
      rK &&
        rI[yC(0x5ef)] &&
        ((rJ[yC(0xae3)] = 0x1),
        rJ[yC(0x30e)](rM / 0x2, 0x0),
        pK(rJ, rI[yC(0x5ef)], 0x11, yC(0x624), 0x3)),
        rJ[yC(0xbec)]();
    }
    function m1(rI) {
      const yE = ux,
        rJ = {};
      return (rJ[yE(0x1e9)] = 0x2), (rI * 0x64)[yE(0x4bf)](yE(0xb71), rJ) + "%";
    }
    function m2(rI) {
      const yF = ux;
      for (let rJ in oG) {
        oG[rJ][yF(0x1de)](rI);
      }
      oZ();
    }
    var m3 = {},
      m4 = document[ux(0x546)](ux(0xab7));
    mJ(ux(0x7ac), ux(0x23c), ux(0xb3a)),
      mJ(ux(0xd2c), ux(0xab7), ux(0x97e)),
      mJ(ux(0x562), ux(0xc0f), ux(0x9fc), () => {
        const yG = ux;
        (hu = ![]), (hC[yG(0x9fc)] = fb);
      }),
      mJ(ux(0xa53), ux(0xc3a), ux(0xdb4)),
      mJ(ux(0xc9e), ux(0x219), ux(0x3ad)),
      mJ(ux(0x325), ux(0xd92), ux(0x317)),
      mJ(ux(0xded), ux(0xc93), ux(0xc4f)),
      mJ(ux(0x35f), ux(0x267), ux(0xd8a)),
      mJ(ux(0x4e8), ux(0xa27), ux(0x519)),
      mJ(ux(0x9be), ux(0x23f), "lb"),
      mJ(ux(0xac1), ux(0x4c3), ux(0x77c)),
      mJ(ux(0xc3b), ux(0x2b4), ux(0x908), () => {
        const yH = ux;
        (mk[yH(0x5c6)][yH(0x50f)] = yH(0x5a4)), (hC[yH(0x908)] = mj);
      }),
      mJ(ux(0x8ed), ux(0xe4d), ux(0x55b), () => {
        const yI = ux;
        if (!hX) return;
        im(new Uint8Array([cH[yI(0x9bc)]]));
      });
    var m5 = document[ux(0x546)](ux(0x7e5)),
      m6 = ![],
      m7 = null,
      m8 = nR(ux(0xaa4));
    setInterval(() => {
      m7 && m9();
    }, 0x3e8);
    function m9() {
      const yJ = ux;
      k9(m8, yJ(0x79e) + kb(Date[yJ(0xa4a)]() - m7[yJ(0x3f3)]) + yJ(0x4e2));
    }
    function ma(rI) {
      const yK = ux;
      document[yK(0x99b)][yK(0x292)][yK(0x1ee)](yK(0x50a));
      const rJ = nR(
        yK(0x2b2) +
          rI[yK(0x10b)] +
          yK(0x743) +
          rI[yK(0x981)] +
          yK(0x8e6) +
          (rI[yK(0xc0c)]
            ? yK(0x643) +
              rI[yK(0xc0c)] +
              "\x22\x20" +
              (rI[yK(0x3a6)] ? yK(0x98b) + rI[yK(0x3a6)] + "\x22" : "") +
              yK(0xbb4)
            : "") +
          yK(0x44e)
      );
      (r6 = rJ),
        (rJ[yK(0x1de)] = function () {
          const yL = yK;
          document[yL(0x99b)][yL(0x292)][yL(0xae0)](yL(0x50a)),
            rJ[yL(0xae0)](),
            (r6 = null);
        }),
        (rJ[yK(0x546)](yK(0xc0b))[yK(0x8cd)] = rJ[yK(0x1de)]);
      const rK = rJ[yK(0x546)](yK(0x21b)),
        rL = 0x14;
      rM(0x0);
      if (rI[yK(0x6fa)][yK(0xc2f)] > rL) {
        const rN = nR(yK(0xb68));
        rJ[yK(0xcee)](rN);
        const rO = rN[yK(0x546)](yK(0x3b8)),
          rP = Math[yK(0xa5e)](rI[yK(0x6fa)][yK(0xc2f)] / rL);
        for (let rS = 0x0; rS < rP; rS++) {
          const rT = nR(yK(0x6a5) + rS + yK(0x35c) + (rS + 0x1) + yK(0x8e2));
          rO[yK(0xcee)](rT);
        }
        rO[yK(0x872)] = function () {
          const yM = yK;
          rM(this[yM(0x1d6)]);
        };
        const rQ = rJ[yK(0x546)](yK(0x41c)),
          rR = rJ[yK(0x546)](yK(0x628));
        rR[yK(0x872)] = function () {
          const yN = yK,
            rU = this[yN(0x1d6)][yN(0x6da)]();
          (rQ[yN(0x90b)] = ""), (rQ[yN(0x5c6)][yN(0x50f)] = yN(0x5a4));
          if (!rU) return;
          const rV = new RegExp(rU, "i");
          let rW = 0x0;
          for (let rX = 0x0; rX < rI[yN(0x6fa)][yN(0xc2f)]; rX++) {
            const rY = rI[yN(0x6fa)][rX];
            if (rV[yN(0xe5b)](rY[yN(0x734)])) {
              const rZ = nR(
                yN(0x6af) +
                  (rX + 0x1) +
                  yN(0xcf7) +
                  rY[yN(0x734)] +
                  yN(0xe15) +
                  ka(rY[yN(0xb5f)]) +
                  yN(0x696)
              );
              rQ[yN(0xcee)](rZ),
                (rZ[yN(0x546)](yN(0x8a0))[yN(0x8cd)] = function () {
                  const yO = yN;
                  mA(rY[yO(0x734)]);
                }),
                (rZ[yN(0x8cd)] = function (s0) {
                  const yP = yN;
                  if (s0[yP(0x812)] === this) {
                    const s1 = Math[yP(0xa6f)](rX / rL);
                    rM(s1), (rO[yP(0x1d6)] = s1);
                  }
                }),
                rW++;
              if (rW >= 0x8) break;
            }
          }
          rW > 0x0 && (rQ[yN(0x5c6)][yN(0x50f)] = "");
        };
      }
      function rM(rU = 0x0) {
        const yQ = yK,
          rV = rU * rL,
          rW = Math[yQ(0x585)](rI[yQ(0x6fa)][yQ(0xc2f)], rV + rL);
        rK[yQ(0x90b)] = "";
        for (let rX = rV; rX < rW; rX++) {
          const rY = rI[yQ(0x6fa)][rX];
          rK[yQ(0xcee)](rI[yQ(0x791)](rY, rX));
          const rZ = nR(yQ(0x58a));
          for (let s0 = 0x0; s0 < rY[yQ(0x20a)][yQ(0xc2f)]; s0++) {
            const [s1, s2] = rY[yQ(0x20a)][s0],
              s3 = dE[s1],
              s4 = nR(
                yQ(0x47e) + s3[yQ(0x5b6)] + "\x22\x20" + qB(s3) + yQ(0xbb4)
              );
            jZ(s4);
            const s5 = "x" + ka(s2),
              s6 = nR(yQ(0xaea) + s5 + yQ(0x59c));
            s5[yQ(0xc2f)] > 0x6 && s6[yQ(0x292)][yQ(0x1ee)](yQ(0x363)),
              s4[yQ(0xcee)](s6),
              (s4[yQ(0x7e1)] = s3),
              rZ[yQ(0xcee)](s4);
          }
          rK[yQ(0xcee)](rZ);
        }
      }
      km[yK(0xcee)](rJ);
    }
    function mb(rI, rJ = ![]) {
      const yR = ux;
      let rK = [],
        rL = 0x0;
      for (const rN in rI) {
        const rO = rI[rN];
        let rP = 0x0,
          rQ = [];
        for (const rS in rO) {
          const rT = rO[rS];
          rQ[yR(0x9db)]([rS, rT]), (rP += rT), (rL += rT);
        }
        rQ = rQ[yR(0xcad)]((rU, rV) => rV[0x1] - rU[0x1]);
        const rR = {};
        (rR[yR(0x734)] = rN),
          (rR[yR(0x20a)] = rQ),
          (rR[yR(0xb5f)] = rP),
          rK[yR(0x9db)](rR);
      }
      if (rJ) rK = rK[yR(0xcad)]((rU, rV) => rV[yR(0xb5f)] - rU[yR(0xb5f)]);
      const rM = {};
      return (rM[yR(0xb5f)] = rL), (rM[yR(0x6fa)] = rK), rM;
    }
    function mc() {
      return md(new Date());
    }
    function md(rI) {
      const yS = ux,
        rJ = {};
      rJ[yS(0x8c3)] = yS(0x4b5);
      const rK = rI[yS(0xc78)]("en", rJ),
        rL = {};
      rL[yS(0xc7e)] = yS(0x646);
      const rM = rI[yS(0xc78)]("en", rL),
        rN = {};
      rN[yS(0x452)] = yS(0x4b5);
      const rO = rI[yS(0xc78)]("en", rN);
      return "" + rK + me(rK) + "\x20" + rM + "\x20" + rO;
    }
    function me(rI) {
      if (rI >= 0xb && rI <= 0xd) return "th";
      switch (rI % 0xa) {
        case 0x1:
          return "st";
        case 0x2:
          return "nd";
        case 0x3:
          return "rd";
        default:
          return "th";
      }
    }
    function mf(rI, rJ) {
      const yT = ux,
        rK = nR(
          yT(0xaaf) +
            (rJ + 0x1) +
            yT(0x191) +
            rI[yT(0x734)] +
            yT(0x634) +
            ka(rI[yT(0xb5f)]) +
            yT(0x250) +
            (rI[yT(0xb5f)] == 0x1 ? "" : "s") +
            yT(0xbd1)
        );
      return (
        (rK[yT(0x546)](yT(0x8a0))[yT(0x8cd)] = function () {
          const yU = yT;
          mA(rI[yU(0x734)]);
        }),
        rK
      );
    }
    var mg = {
      ultraPlayers: {
        title: ux(0xe21),
        parse(rI) {
          const yV = ux,
            rJ = rI[yV(0xd4d)];
          if (rJ[yV(0x9b3)] !== 0x1) throw new Error(yV(0xb6a) + rJ[yV(0x9b3)]);
          const rK = {},
            rL = rJ[yV(0xa9e)][yV(0x2a6)]("+");
          for (const rN in rJ[yV(0x7fd)]) {
            const rO = rJ[yV(0x7fd)][rN][yV(0x2a6)]("\x20"),
              rP = {};
            for (let rQ = 0x0; rQ < rO[yV(0xc2f)] - 0x1; rQ++) {
              let [rR, rS] = rO[rQ][yV(0x2a6)](",");
              rP[rL[rR]] = parseInt(rS);
            }
            rK[rN] = rP;
          }
          const rM = mb(rK, !![]);
          return {
            title: this[yV(0x10b)],
            titleColor: hO[yV(0xde5)],
            desc:
              mc() +
              yV(0x543) +
              ka(rM[yV(0x6fa)][yV(0xc2f)]) +
              yV(0x321) +
              ka(rM[yV(0xb5f)]) +
              yV(0xd15),
            getTitleEl: mf,
            groups: rM[yV(0x6fa)],
          };
        },
      },
      superPlayers: {
        title: ux(0x844),
        parse(rI) {
          const yW = ux,
            rJ = mb(rI[yW(0x582)], !![]);
          return {
            title: this[yW(0x10b)],
            titleColor: hO[yW(0x766)],
            desc:
              mc() +
              yW(0x543) +
              ka(rJ[yW(0x6fa)][yW(0xc2f)]) +
              yW(0x321) +
              ka(rJ[yW(0xb5f)]) +
              yW(0xd15),
            getTitleEl: mf,
            groups: rJ[yW(0x6fa)],
          };
        },
      },
      hyperPlayers: {
        title: ux(0x19e),
        parse(rI) {
          const yX = ux,
            rJ = mb(rI[yX(0x288)], !![]);
          return {
            title: this[yX(0x10b)],
            titleColor: hO[yX(0x402)],
            desc:
              mc() +
              yX(0x543) +
              ka(rJ[yX(0x6fa)][yX(0xc2f)]) +
              yX(0x321) +
              ka(rJ[yX(0xb5f)]) +
              yX(0xd15),
            getTitleEl: mf,
            groups: rJ[yX(0x6fa)],
          };
        },
      },
      petals: {
        title: ux(0xba2),
        parse(rI) {
          const yY = ux,
            rJ = mb(rI[yY(0x20a)], ![]),
            rK = rJ[yY(0x6fa)][yY(0xcad)](
              (rL, rM) => rM[yY(0x734)] - rL[yY(0x734)]
            );
          return {
            title: this[yY(0x10b)],
            titleColor: hO[yY(0x4c5)],
            desc: mc() + yY(0x543) + ka(rJ[yY(0xb5f)]) + yY(0xd15),
            getTitleEl(rL, rM) {
              const yZ = yY;
              return nR(
                yZ(0x24a) +
                  hM[rL[yZ(0x734)]] +
                  yZ(0x543) +
                  ka(rL[yZ(0xb5f)]) +
                  yZ(0xe75)
              );
            },
            groups: rK,
          };
        },
      },
    };
    function mh(rI) {
      const z0 = ux,
        rJ = 0xea60,
        rK = rJ * 0x3c,
        rL = rK * 0x18,
        rM = rL * 0x16d;
      let rN = Math[z0(0xa6f)](rI / rM);
      rI %= rM;
      let rO = Math[z0(0xa6f)](rI / rL);
      rI %= rL;
      let rP = Math[z0(0xa6f)](rI / rK);
      rI %= rK;
      let rQ = Math[z0(0xa6f)](rI / rJ),
        rR = [];
      if (rN > 0x0) rR[z0(0x9db)](rN + "y");
      if (rO > 0x0) rR[z0(0x9db)](rO + "d");
      if (rP > 0x0) rR[z0(0x9db)](rP + "h");
      if (rQ > 0x0) rR[z0(0x9db)](rQ + "m");
      return rR[z0(0xbc0)]("\x20");
    }
    function mi() {
      const z1 = ux;
      if (m6) return;
      if (m7 && Date[z1(0xa4a)]() - m7[z1(0x3f3)] < 0x3c * 0xea60) return;
      (m6 = !![]),
        fetch((i9 ? z1(0x5a0) : z1(0x9c1)) + z1(0x539))
          [z1(0xc15)]((rI) => rI[z1(0xac7)]())
          [z1(0xc15)]((rI) => {
            const z2 = z1;
            (m6 = ![]), (m7 = rI), m9(), (m5[z2(0x90b)] = "");
            const rJ = {};
            (rJ[z2(0xd19)] = !![]),
              (rJ[z2(0x774)] = !![]),
              (rJ[z2(0x654)] = !![]),
              (rJ[z2(0x66c)] = !![]),
              (rJ[z2(0x86b)] = !![]);
            const rK = rJ,
              rL = nR(z2(0x176));
            m5[z2(0xcee)](rL);
            for (const rM in rK) {
              if (rM in rI) {
                const rN = rI[rM],
                  rO = nR(
                    z2(0x246) +
                      ke(rM) +
                      z2(0x943) +
                      (rM == z2(0xd19) ? mh(rN * 0x3e8 * 0x3c) : ka(rN)) +
                      z2(0xb2e)
                  );
                rL[z2(0xcee)](rO);
              }
            }
            for (const rP in mg) {
              if (!(rP in rI)) continue;
              const rQ = mg[rP],
                rR = nR(z2(0x8eb) + rQ[z2(0x10b)] + z2(0xb94));
              (rR[z2(0x8cd)] = function () {
                const z3 = z2;
                ma(rQ[z3(0x96e)](rI));
              }),
                m5[z2(0xcee)](rR);
            }
            m5[z2(0xcee)](m8);
          })
          [z1(0xd5f)]((rI) => {
            const z4 = z1;
            (m6 = ![]),
              hb(z4(0x717)),
              console[z4(0x1be)](z4(0xcfc), rI),
              setTimeout(mi, 0x1388);
          });
    }
    mJ(ux(0x70b), ux(0x371), ux(0x417), mi);
    var mj = 0xb,
      mk = document[ux(0x546)](ux(0x26c));
    hC[ux(0x908)] == mj && (mk[ux(0x5c6)][ux(0x50f)] = ux(0x5a4));
    var ml = document[ux(0x546)](ux(0x113));
    ml[ux(0x5c6)][ux(0x50f)] = ux(0x5a4);
    var mm = document[ux(0x546)](ux(0x4cf)),
      mn = document[ux(0x546)](ux(0x464)),
      mo = document[ux(0x546)](ux(0xd9a));
    mo[ux(0x8cd)] = function () {
      const z5 = ux;
      ml[z5(0x5c6)][z5(0x50f)] = z5(0x5a4);
    };
    var mp = ![];
    mn[ux(0x8cd)] = nw(function (rI) {
      const z6 = ux;
      if (!hX || mp || jz) return;
      const rJ = mm[z6(0x1d6)][z6(0x6da)]();
      if (!rJ || !eU(rJ)) {
        mm[z6(0x292)][z6(0xae0)](z6(0x36f)),
          void mm[z6(0xbab)],
          mm[z6(0x292)][z6(0x1ee)](z6(0x36f));
        return;
      }
      (ml[z6(0x5c6)][z6(0x50f)] = ""),
        (ml[z6(0x90b)] = z6(0x78c)),
        im(
          new Uint8Array([cH[z6(0xbd7)], ...new TextEncoder()[z6(0x3bc)](rJ)])
        ),
        (mp = !![]);
    });
    function mq(rI, rJ) {
      const z7 = ux;
      if (rI === z7(0xc44)) {
        const rK = {};
        (rK[z7(0x452)] = z7(0x4b5)),
          (rK[z7(0x8c3)] = z7(0xd9f)),
          (rK[z7(0xc7e)] = z7(0xd9f)),
          (rJ = new Date(
            rJ === 0x0 ? Date[z7(0xa4a)]() : rJ * 0x3e8 * 0x3c * 0x3c
          )[z7(0xc78)]("en", rK));
      } else
        rI === z7(0xb6d) || rI === z7(0x8d2)
          ? (rJ = kb(rJ * 0x3e8 * 0x3c, !![]))
          : (rJ = ka(rJ));
      return rJ;
    }
    var mr = f1(),
      ms = {},
      mt = document[ux(0x546)](ux(0x5d2));
    mt[ux(0x90b)] = "";
    for (let rI in mr) {
      const rJ = mu(rI);
      rJ[ux(0xb91)](0x0), mt[ux(0xcee)](rJ), (ms[rI] = rJ);
    }
    function mu(rK) {
      const z8 = ux,
        rL = nR(z8(0xdaa) + ke(rK) + z8(0x89e)),
        rM = rL[z8(0x546)](z8(0x755));
      return (
        (rL[z8(0xb91)] = function (rN) {
          k9(rM, mq(rK, rN));
        }),
        rL
      );
    }
    var mv;
    function mw(rK, rL, rM, rN, rO, rP, rQ) {
      const z9 = ux;
      mv && (mv[z9(0x302)](), (mv = null));
      const rR = rP[z9(0xc2f)] / 0x2,
        rS = z9(0xaef)[z9(0xa08)](rR),
        rT = nR(
          z9(0x739) +
            rK +
            z9(0xc22) +
            rS +
            z9(0xcf6) +
            rS +
            z9(0x6b5) +
            z9(0x2bb)[z9(0xa08)](eK * dG) +
            z9(0xa1f) +
            (rM[z9(0xc2f)] === 0x0 ? z9(0x750) : "") +
            z9(0xb3f)
        );
      rQ && rT[z9(0xcee)](nR(z9(0x12a)));
      mv = rT;
      const rU = rT[z9(0x546)](z9(0x82d)),
        rV = rT[z9(0x546)](z9(0x74f));
      for (let s7 = 0x0; s7 < rP[z9(0xc2f)]; s7++) {
        const s8 = rP[s7];
        if (!s8) continue;
        const s9 = og(s8);
        s9[z9(0x292)][z9(0xae0)](z9(0x77a)),
          (s9[z9(0x4a1)] = !![]),
          s9[z9(0xa4f)][z9(0xae0)](),
          (s9[z9(0xa4f)] = null),
          s7 < rR
            ? rU[z9(0x476)][s7][z9(0xcee)](s9)
            : rV[z9(0x476)][s7 - rR][z9(0xcee)](s9);
      }
      (rT[z9(0x302)] = function () {
        const za = z9;
        (rT[za(0x5c6)][za(0xdc0)] = za(0xa18)),
          (rT[za(0x5c6)][za(0x50f)] = za(0x5a4)),
          void rT[za(0xbab)],
          (rT[za(0x5c6)][za(0x50f)] = ""),
          setTimeout(function () {
            const zb = za;
            rT[zb(0xae0)]();
          }, 0x3e8);
      }),
        (rT[z9(0x546)](z9(0xc0b))[z9(0x8cd)] = function () {
          const zc = z9;
          rT[zc(0x302)]();
        });
      const rW = d3(rO),
        rX = rW[0x0],
        rY = rW[0x1],
        rZ = d1(rX + 0x1),
        s0 = rO - rY,
        s1 = rT[z9(0x546)](z9(0x68f));
      k9(
        s1,
        z9(0x403) + (rX + 0x1) + z9(0x30f) + iK(s0) + "/" + iK(rZ) + z9(0xa61)
      );
      const s2 = Math[z9(0x585)](0x1, s0 / rZ),
        s3 = rT[z9(0x546)](z9(0xb15));
      s3[z9(0x5c6)][z9(0xb3d)] = s2 * 0x64 + "%";
      const s4 = rT[z9(0x546)](z9(0x5d2));
      for (let sa in mr) {
        const sb = mu(sa);
        sb[z9(0xb91)](rL[sa]), s4[z9(0xcee)](sb);
      }
      const s5 = rT[z9(0x546)](z9(0xe65));
      rM[z9(0xcad)]((sc, sd) => of(sc[0x0], sd[0x0]));
      for (let sc = 0x0; sc < rM[z9(0xc2f)]; sc++) {
        const [sd, se] = rM[sc],
          sf = og(sd);
        jZ(sf),
          sf[z9(0x292)][z9(0xae0)](z9(0x77a)),
          (sf[z9(0x4a1)] = !![]),
          p6(sf[z9(0xa4f)], se),
          s5[z9(0xcee)](sf);
      }
      if (rM[z9(0xc2f)] > 0x0) {
        const sg = nR(z9(0x3af)),
          sh = {};
        for (let si = 0x0; si < rM[z9(0xc2f)]; si++) {
          const [sj, sk] = rM[si];
          sh[sj[z9(0x5b6)]] = (sh[sj[z9(0x5b6)]] || 0x0) + sk;
        }
        oF(sg, sh), rT[z9(0x546)](z9(0xd92))[z9(0xcee)](sg);
      }
      const s6 = rT[z9(0x546)](z9(0xa0d));
      for (let sl = 0x0; sl < rN[z9(0xc2f)]; sl++) {
        const sm = rN[sl],
          sn = nW(sm, !![]);
        sn[z9(0x292)][z9(0xae0)](z9(0x77a)), (sn[z9(0x4a1)] = !![]);
        const so = s6[z9(0x476)][sm[z9(0x737)] * dG + sm[z9(0x5b6)]];
        s6[z9(0x1c4)](sn, so), so[z9(0xae0)]();
      }
      rT[z9(0x292)][z9(0x1ee)](z9(0x859)),
        setTimeout(function () {
          const zd = z9;
          rT[zd(0x292)][zd(0xae0)](zd(0x859));
        }, 0x0),
        km[z9(0xcee)](rT);
    }
    var mz = document[ux(0x546)](ux(0x6de));
    document[ux(0x546)](ux(0x594))[ux(0x8cd)] = nw(function (rK) {
      const ze = ux,
        rL = mz[ze(0x1d6)][ze(0x6da)]();
      nv(rL);
    });
    function mA(rK) {
      const zf = ux,
        rL = new Uint8Array([
          cH[zf(0x60f)],
          ...new TextEncoder()[zf(0x3bc)](rK),
        ]);
      im(rL);
    }
    var mB = document[ux(0x546)](ux(0x267)),
      mC = document[ux(0x546)](ux(0x23f)),
      mD = mC[ux(0x546)](ux(0x21b)),
      mE = 0x0,
      mF = 0x0;
    setInterval(function () {
      const zg = ux;
      hX &&
        (pQ - mF > 0x7530 &&
          mB[zg(0x292)][zg(0x427)](zg(0x695)) &&
          (im(new Uint8Array([cH[zg(0xc64)]])), (mF = pQ)),
        pQ - mE > 0xea60 &&
          mC[zg(0x292)][zg(0x427)](zg(0x695)) &&
          (im(new Uint8Array([cH[zg(0xcb4)]])), (mE = pQ)));
    }, 0x3e8);
    var mG = ![];
    function mH(rK) {
      const zh = ux;
      for (let rL in m3) {
        if (rK === rL) continue;
        m3[rL][zh(0x302)]();
      }
      mG = ![];
    }
    window[ux(0x8cd)] = function (rK) {
      const zi = ux;
      if ([kl, ko, kj][zi(0x584)](rK[zi(0x812)])) mH();
    };
    function mI() {
      const zj = ux;
      iz && !pc[zj(0x22c)] && io(0x0, 0x0);
    }
    function mJ(rK, rL, rM, rN) {
      const zk = ux,
        rO = document[zk(0x546)](rL),
        rP = rO[zk(0x546)](zk(0x21b)),
        rQ = document[zk(0x546)](rK);
      let rR = null,
        rS = rO[zk(0x546)](zk(0xa24));
      rS &&
        (rS[zk(0x8cd)] = function () {
          const zl = zk;
          rO[zl(0x292)][zl(0x37a)](zl(0xd78));
        });
      (rP[zk(0x5c6)][zk(0x50f)] = zk(0x5a4)),
        rO[zk(0x292)][zk(0xae0)](zk(0x695)),
        (rQ[zk(0x8cd)] = function () {
          const zm = zk;
          rT[zm(0x37a)]();
        }),
        (rO[zk(0x546)](zk(0xc0b))[zk(0x8cd)] = function () {
          mH();
        });
      const rT = [rQ, rO];
      (rT[zk(0x302)] = function () {
        const zn = zk;
        rQ[zn(0x292)][zn(0xae0)](zn(0x487)),
          rO[zn(0x292)][zn(0xae0)](zn(0x695)),
          !rR &&
            (rR = setTimeout(function () {
              const zo = zn;
              (rP[zo(0x5c6)][zo(0x50f)] = zo(0x5a4)), (rR = null);
            }, 0x3e8));
      }),
        (rT[zk(0x37a)] = function () {
          const zp = zk;
          mH(rM),
            rO[zp(0x292)][zp(0x427)](zp(0x695))
              ? rT[zp(0x302)]()
              : rT[zp(0x695)]();
        }),
        (rT[zk(0x695)] = function () {
          const zq = zk;
          rN && rN(),
            clearTimeout(rR),
            (rR = null),
            (rP[zq(0x5c6)][zq(0x50f)] = ""),
            rQ[zq(0x292)][zq(0x1ee)](zq(0x487)),
            rO[zq(0x292)][zq(0x1ee)](zq(0x695)),
            (mG = !![]),
            mI();
        }),
        (m3[rM] = rT);
    }
    var mK = [],
      mL,
      mM = 0x0,
      mN = ![],
      mO = document[ux(0x546)](ux(0x325)),
      mP = {
        tagName: ux(0x9bb),
        getBoundingClientRect() {
          const zr = ux,
            rK = mO[zr(0xd0e)](),
            rL = {};
          return (
            (rL["x"] = rK["x"] + rK[zr(0xb3d)] / 0x2),
            (rL["y"] = rK["y"] + rK[zr(0x2a1)] / 0x2),
            rL
          );
        },
        appendChild(rK) {
          const zs = ux;
          rK[zs(0xae0)]();
        },
      };
    function mQ(rK) {
      const zt = ux;
      if (!hX) return;
      const rL = rK[zt(0x812)];
      if (rL[zt(0xbc8)]) mL = na(rL, rK);
      else {
        if (rL[zt(0xd9c)]) {
          mH();
          const rM = rL[zt(0x771)]();
          (rM[zt(0x7e1)] = rL[zt(0x7e1)]),
            nQ(rM, rL[zt(0x7e1)]),
            (rM[zt(0x2ba)] = 0x1),
            (rM[zt(0xd9c)] = !![]),
            (rM[zt(0xdca)] = mP),
            rM[zt(0x292)][zt(0x1ee)](zt(0x234));
          const rN = rL[zt(0xd0e)]();
          (rM[zt(0x5c6)][zt(0x5c2)] = rN["x"] / kS + "px"),
            (rM[zt(0x5c6)][zt(0xc0d)] = rN["y"] / kS + "px"),
            kI[zt(0xcee)](rM),
            (mL = na(rM, rK)),
            (mM = 0x0),
            (mG = !![]);
        } else return ![];
      }
      return (mM = Date[zt(0xa4a)]()), (mN = !![]), !![];
    }
    function mR(rK) {
      const zu = ux;
      for (let rL = 0x0; rL < rK[zu(0x476)][zu(0xc2f)]; rL++) {
        const rM = rK[zu(0x476)][rL];
        if (rM[zu(0x292)][zu(0x427)](zu(0x7e1)) && !n9(rM)) return rM;
      }
    }
    function mS() {
      const zv = ux;
      if (mL) {
        if (mN && Date[zv(0xa4a)]() - mM < 0x1f4) {
          if (mL[zv(0xbc8)]) {
            const rK = mL[zv(0x2bc)][zv(0x6d6)];
            mL[zv(0x5ff)](
              rK >= iO ? nA[zv(0x476)][rK - iO + 0x1] : nB[zv(0x476)][rK]
            );
          } else {
            if (mL[zv(0xd9c)]) {
              let rL = mR(nA) || mR(nB);
              rL && mL[zv(0x5ff)](rL);
            }
          }
        }
        mL[zv(0x682)]();
        if (mL[zv(0xd9c)]) {
          (mL[zv(0xd9c)] = ![]),
            (mL[zv(0xbc8)] = !![]),
            m3[zv(0x317)][zv(0x695)]();
          if (mL[zv(0xdca)] !== mP) {
            const rM = mL[zv(0x6db)];
            rM
              ? ((mL[zv(0x13d)] = rM[zv(0x13d)]), n6(rM[zv(0x7e1)]["id"], 0x1))
              : (mL[zv(0x13d)] = iS[zv(0x526)]());
            (iR[mL[zv(0x13d)]] = mL), n6(mL[zv(0x7e1)]["id"], -0x1);
            const rN = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rN[zv(0xe51)](0x0, cH[zv(0x1b0)]),
              rN[zv(0x80f)](0x1, mL[zv(0x7e1)]["id"]),
              rN[zv(0xe51)](0x3, mL[zv(0xdca)][zv(0x6d6)]),
              im(rN);
          }
        } else
          mL[zv(0xdca)] === mP
            ? (iS[zv(0x9db)](mL[zv(0x13d)]),
              n6(mL[zv(0x7e1)]["id"], 0x1),
              im(new Uint8Array([cH[zv(0x559)], mL[zv(0x2bc)][zv(0x6d6)]])))
            : n8(mL[zv(0x2bc)][zv(0x6d6)], mL[zv(0xdca)][zv(0x6d6)]);
        mL = null;
      }
    }
    function mT(rK) {
      const zw = ux;
      mL && (mL[zw(0xae5)](rK), (mN = ![]));
    }
    var mU = document[ux(0x546)](ux(0x2c2));
    function mV() {
      const zx = ux;
      mU[zx(0x5c6)][zx(0x50f)] = zx(0x5a4);
      const rK = mU[zx(0x546)](zx(0xd0f));
      let rL,
        rM,
        rN = null;
      (mU[zx(0xc71)] = function (rP) {
        const zy = zx;
        rN === null &&
          ((rK[zy(0x5c6)][zy(0xb3d)] = rK[zy(0x5c6)][zy(0x14b)] = "0"),
          (mU[zy(0x5c6)][zy(0x50f)] = ""),
          ([rL, rM] = mW(rP)),
          rO(),
          (rN = rP[zy(0xd29)]));
      }),
        (mU[zx(0x1d0)] = function (rP) {
          const zz = zx;
          if (rP[zz(0xd29)] === rN) {
            const [rQ, rR] = mW(rP),
              rS = rQ - rL,
              rT = rR - rM,
              rU = mU[zz(0xd0e)]();
            let rV = Math[zz(0xc3c)](rS, rT);
            const rW = rU[zz(0xb3d)] / 0x2 / kS;
            rV > rW && (rV = rW);
            const rX = Math[zz(0x448)](rT, rS);
            return (
              (rK[zz(0x5c6)][zz(0x14b)] = zz(0x431) + rX + zz(0xa78)),
              (rK[zz(0x5c6)][zz(0xb3d)] = rV + "px"),
              io(rX, rV / rW),
              !![]
            );
          }
        }),
        (mU[zx(0x32f)] = function (rP) {
          const zA = zx;
          rP[zA(0xd29)] === rN &&
            ((mU[zA(0x5c6)][zA(0x50f)] = zA(0x5a4)), (rN = null), io(0x0, 0x0));
        });
      function rO() {
        const zB = zx;
        (mU[zB(0x5c6)][zB(0x5c2)] = rL + "px"),
          (mU[zB(0x5c6)][zB(0xc0d)] = rM + "px");
      }
    }
    mV();
    function mW(rK) {
      const zC = ux;
      return [rK[zC(0x143)] / kS, rK[zC(0x346)] / kS];
    }
    var mX = document[ux(0x546)](ux(0x6c0)),
      mY = document[ux(0x546)](ux(0x74b)),
      mZ = document[ux(0x546)](ux(0x9e0)),
      n0 = {},
      n1 = {};
    if (kM) {
      document[ux(0x99b)][ux(0x292)][ux(0x1ee)](ux(0x4ba)),
        (window[ux(0xce7)] = function (rL) {
          const zD = ux;
          for (let rM = 0x0; rM < rL[zD(0x15e)][zD(0xc2f)]; rM++) {
            const rN = rL[zD(0x15e)][rM],
              rO = rN[zD(0x812)];
            if (rO === kj) {
              mU[zD(0xc71)](rN);
              continue;
            } else {
              if (rO === mY)
                pr(zD(0xb32), !![]),
                  (n0[rN[zD(0xd29)]] = function () {
                    const zE = zD;
                    pr(zE(0xb32), ![]);
                  });
              else {
                if (rO === mX)
                  pr(zD(0xc8e), !![]),
                    (n0[rN[zD(0xd29)]] = function () {
                      const zF = zD;
                      pr(zF(0xc8e), ![]);
                    });
                else
                  rO === mZ &&
                    (pr(zD(0xd43), !![]),
                    (n0[rN[zD(0xd29)]] = function () {
                      const zG = zD;
                      pr(zG(0xd43), ![]);
                    }));
              }
            }
            if (mL) continue;
            if (rO[zD(0x7e1)]) {
              const rP = n4(rO);
              mQ(rN),
                mL && (n1[rN[zD(0xd29)]] = mT),
                (n0[rN[zD(0xd29)]] = function () {
                  const zH = zD;
                  mL && mS(), (rP[zH(0x127)] = ![]);
                });
            }
          }
        });
      const rK = {};
      (rK[ux(0x9d9)] = ![]),
        document[ux(0x185)](
          ux(0x365),
          function (rL) {
            const zI = ux;
            for (let rM = 0x0; rM < rL[zI(0x15e)][zI(0xc2f)]; rM++) {
              const rN = rL[zI(0x15e)][rM];
              mU[zI(0x1d0)](rN) && rL[zI(0xbc6)]();
              if (n1[rN[zI(0xd29)]]) n1[rN[zI(0xd29)]](rN), rL[zI(0xbc6)]();
              else mL && rL[zI(0xbc6)]();
            }
          },
          rK
        ),
        (window[ux(0xdbc)] = function (rL) {
          const zJ = ux;
          for (let rM = 0x0; rM < rL[zJ(0x15e)][zJ(0xc2f)]; rM++) {
            const rN = rL[zJ(0x15e)][rM];
            mU[zJ(0x32f)](rN),
              n0[rN[zJ(0xd29)]] &&
                (n0[rN[zJ(0xd29)]](),
                delete n0[rN[zJ(0xd29)]],
                delete n1[rN[zJ(0xd29)]]);
          }
        });
    } else {
      document[ux(0x99b)][ux(0x292)][ux(0x1ee)](ux(0x5b8));
      let rL = ![];
      (window[ux(0xc6a)] = function (rM) {
        const zK = ux;
        rM[zK(0x7b2)] === 0x0 && ((rL = !![]), mQ(rM));
      }),
        (document[ux(0x961)] = function (rM) {
          const zL = ux;
          mT(rM);
          const rN = rM[zL(0x812)];
          if (rN[zL(0x7e1)] && !rL) {
            const rO = n4(rN);
            rN[zL(0x6e1)] = rN[zL(0xc6a)] = function () {
              const zM = zL;
              rO[zM(0x127)] = ![];
            };
          }
        }),
        (document[ux(0xade)] = function (rM) {
          const zN = ux;
          rM[zN(0x7b2)] === 0x0 && ((rL = ![]), mS());
        }),
        (kn[ux(0x961)] = kj[ux(0x961)] =
          function (rM) {
            const zO = ux;
            (ne = rM[zO(0x143)] - kV() / 0x2),
              (nf = rM[zO(0x346)] - kW() / 0x2);
            if (!pc[zO(0x22c)] && iz && !mG) {
              const rN = Math[zO(0xc3c)](ne, nf),
                rO = Math[zO(0x448)](nf, ne);
              io(rO, rN < 0x32 ? rN / 0x64 : 0x1);
            }
          });
    }
    function n2(rM, rN, rO) {
      const zP = ux;
      return Math[zP(0x9da)](rN, Math[zP(0x585)](rM, rO));
    }
    var n3 = [];
    function n4(rM) {
      const zQ = ux;
      let rN = n3[zQ(0xa32)]((rO) => rO["el"] === rM);
      if (rN) return (rN[zQ(0x127)] = !![]), rN;
      (rN =
        typeof rM[zQ(0x7e1)] === zQ(0xb7f)
          ? rM[zQ(0x7e1)]()
          : nL(rM[zQ(0x7e1)], rM[zQ(0x53d)])),
        (rN[zQ(0x127)] = !![]),
        (rN[zQ(0x373)] = 0x0),
        (rN[zQ(0x5c6)][zQ(0x8d5)] = zQ(0xace)),
        (rN[zQ(0x5c6)][zQ(0x14b)] = zQ(0x5a4)),
        kI[zQ(0xcee)](rN);
      if (kM)
        (rN[zQ(0x5c6)][zQ(0x8e0)] = zQ(0xa98)),
          (rN[zQ(0x5c6)][zQ(0xc0d)] = zQ(0xa98)),
          (rN[zQ(0x5c6)][zQ(0xc97)] = zQ(0xd52)),
          (rN[zQ(0x5c6)][zQ(0x5c2)] = zQ(0xd52));
      else {
        const rO = rM[zQ(0xd0e)](),
          rP = rN[zQ(0xd0e)]();
        (rN[zQ(0x5c6)][zQ(0xc0d)] =
          n2(
            rM[zQ(0x471)]
              ? (rO[zQ(0xc0d)] + rO[zQ(0x2a1)]) / kS + 0xa
              : (rO[zQ(0xc0d)] - rP[zQ(0x2a1)]) / kS - 0xa,
            0xa,
            window[zQ(0xc32)] / kS - 0xa
          ) + "px"),
          (rN[zQ(0x5c6)][zQ(0x5c2)] =
            n2(
              (rO[zQ(0x5c2)] + rO[zQ(0xb3d)] / 0x2 - rP[zQ(0xb3d)] / 0x2) / kS,
              0xa,
              window[zQ(0xacc)] / kS - 0xa - rP[zQ(0xb3d)] / kS
            ) + "px"),
          (rN[zQ(0x5c6)][zQ(0xc97)] = zQ(0xd52)),
          (rN[zQ(0x5c6)][zQ(0x8e0)] = zQ(0xd52));
      }
      return (
        (rN[zQ(0x5c6)][zQ(0xbde)] = zQ(0x5a4)),
        (rN[zQ(0x5c6)][zQ(0x482)] = 0x0),
        (rN["el"] = rM),
        n3[zQ(0x9db)](rN),
        rN
      );
    }
    var n5 = document[ux(0x546)](ux(0x3fd));
    function n6(rM, rN = 0x1) {
      const zR = ux;
      !iT[rM] && ((iT[rM] = 0x0), pb(rM), od()),
        (iT[rM] += rN),
        ob[rM][zR(0x88d)](iT[rM]),
        iT[rM] <= 0x0 && (delete iT[rM], ob[rM][zR(0x1de)](), od()),
        n7();
    }
    function n7() {
      const zS = ux;
      n5[zS(0x90b)] = "";
      Object[zS(0x572)](iT)[zS(0xc2f)] === 0x0
        ? (n5[zS(0x5c6)][zS(0x50f)] = zS(0x5a4))
        : (n5[zS(0x5c6)][zS(0x50f)] = "");
      const rM = {};
      for (const rN in iT) {
        const rO = dB[rN],
          rP = iT[rN];
        rM[rO[zS(0x5b6)]] = (rM[rO[zS(0x5b6)]] || 0x0) + rP;
      }
      oF(n5, rM);
      for (const rQ in or) {
        const rR = or[rQ];
        rR[zS(0x292)][rM[rQ] ? zS(0xae0) : zS(0x1ee)](zS(0x26b));
      }
    }
    function n8(rM, rN) {
      const zT = ux;
      if (rM === rN) return;
      im(new Uint8Array([cH[zT(0x162)], rM, rN]));
    }
    function n9(rM) {
      const zU = ux;
      return rM[zU(0x647)] || rM[zU(0x546)](zU(0x47d));
    }
    function na(rM, rN, rO = !![]) {
      const zV = ux,
        rP = mK[zV(0xa32)]((rZ) => rZ === rM);
      if (rP) return rP[zV(0x428)](rN), rP;
      let rQ,
        rR,
        rS,
        rT,
        rU = 0x0,
        rV = 0x0,
        rW = 0x0,
        rX;
      (rM[zV(0x428)] = function (rZ, s0) {
        const zW = zV;
        (rX = rM[zW(0xdca)] || rM[zW(0xe38)]),
          (rX[zW(0x647)] = rM),
          (rM[zW(0x2bc)] = rX),
          (rM[zW(0x9ec)] = ![]),
          (rM[zW(0xcff)] = ![]);
        const s1 = rM[zW(0xd0e)]();
        rZ[zW(0xa4d)] === void 0x0
          ? ((rU = rZ[zW(0x143)] - s1["x"]),
            (rV = rZ[zW(0x346)] - s1["y"]),
            rM[zW(0xae5)](rZ),
            (rQ = rS),
            (rR = rT))
          : ((rQ = s1["x"]),
            (rR = s1["y"]),
            rM[zW(0x5ff)](rZ),
            rM[zW(0x682)](s0)),
          rY();
      }),
        (rM[zV(0x682)] = function (rZ = !![]) {
          const zX = zV;
          rM[zX(0xcff)] = !![];
          rX[zX(0x647)] === rM && (rX[zX(0x647)] = null);
          if (!rM[zX(0xdca)])
            rM[zX(0x5ff)](rX),
              Math[zX(0xc3c)](rS - rQ, rT - rR) > 0x32 * kS &&
                rM[zX(0x5ff)](mP);
          else {
            if (rZ) {
              const s0 = n9(rM[zX(0xdca)]);
              (rM[zX(0x6db)] = s0), s0 && na(s0, rX, ![]);
            }
          }
          rM[zX(0xdca)] !== rX && (rM[zX(0x2ba)] = 0x0),
            (rM[zX(0xdca)][zX(0x647)] = rM);
        }),
        (rM[zV(0x5ff)] = function (rZ) {
          const zY = zV;
          rM[zY(0xdca)] = rZ;
          const s0 = rZ[zY(0xd0e)]();
          (rS = s0["x"]),
            (rT = s0["y"]),
            (rM[zY(0x5c6)][zY(0x85e)] =
              rZ === mP ? zY(0x536) : getComputedStyle(rZ)[zY(0x85e)]);
        }),
        (rM[zV(0xae5)] = function (rZ) {
          const zZ = zV;
          (rS = rZ[zZ(0x143)] - rU),
            (rT = rZ[zZ(0x346)] - rV),
            (rM[zZ(0xdca)] = null);
          let s0 = Infinity,
            s1 = null;
          const s2 = kp[zZ(0xa26)](zZ(0xc55));
          for (let s3 = 0x0; s3 < s2[zZ(0xc2f)]; s3++) {
            const s4 = s2[s3],
              s5 = s4[zZ(0xd0e)](),
              s6 = Math[zZ(0xc3c)](
                s5["x"] + s5[zZ(0xb3d)] / 0x2 - rZ[zZ(0x143)],
                s5["y"] + s5[zZ(0x2a1)] / 0x2 - rZ[zZ(0x346)]
              );
            s6 < 0x1e * kS && s6 < s0 && ((s1 = s4), (s0 = s6));
          }
          s1 && s1 !== rX && rM[zZ(0x5ff)](s1);
        }),
        rM[zV(0x428)](rN, rO),
        rM[zV(0x292)][zV(0x1ee)](zV(0x234)),
        kI[zV(0xcee)](rM);
      function rY() {
        const A0 = zV;
        (rM[A0(0x5c6)][A0(0x5c2)] = rQ / kS + "px"),
          (rM[A0(0x5c6)][A0(0xc0d)] = rR / kS + "px");
      }
      return (
        (rM[zV(0x4d2)] = function () {
          const A1 = zV;
          rM[A1(0xdca)] && rM[A1(0x5ff)](rM[A1(0xdca)]);
        }),
        (rM[zV(0x72c)] = function () {
          const A2 = zV;
          (rQ = px(rQ, rS, 0x64)), (rR = px(rR, rT, 0x64)), rY();
          let rZ = 0x0,
            s0 = Infinity;
          rM[A2(0xdca)]
            ? ((s0 = Math[A2(0xc3c)](rS - rQ, rT - rR)),
              (rZ = s0 > 0x5 ? 0x1 : 0x0))
            : (rZ = 0x1),
            (rW = px(rW, rZ, 0x64)),
            (rM[A2(0x5c6)][A2(0x14b)] =
              A2(0x60a) +
              (0x1 + 0.3 * rW) +
              A2(0x5b9) +
              rW * Math[A2(0x12d)](Date[A2(0xa4a)]() / 0x96) * 0xa +
              A2(0xa1b)),
            rM[A2(0xcff)] &&
              rW < 0.05 &&
              s0 < 0x5 &&
              (rM[A2(0x292)][A2(0xae0)](A2(0x234)),
              (rM[A2(0x5c6)][A2(0x5c2)] =
                rM[A2(0x5c6)][A2(0xc0d)] =
                rM[A2(0x5c6)][A2(0x14b)] =
                rM[A2(0x5c6)][A2(0x85e)] =
                rM[A2(0x5c6)][A2(0x3ed)] =
                  ""),
              (rM[A2(0x9ec)] = !![]),
              rM[A2(0xdca)][A2(0xcee)](rM),
              (rM[A2(0xdca)][A2(0x647)] = null),
              (rM[A2(0xdca)] = null));
        }),
        mK[zV(0x9db)](rM),
        rM
      );
    }
    var nb = cX[ux(0x72f)];
    document[ux(0x1e4)] = function () {
      return ![];
    };
    var nc = 0x0,
      nd = 0x0,
      ne = 0x0,
      nf = 0x0,
      ng = 0x1,
      nh = 0x1;
    document[ux(0x9d3)] = function (rM) {
      const A3 = ux;
      rM[A3(0x812)] === kj &&
        ((ng *= rM[A3(0x912)] < 0x0 ? 1.1 : 0.9),
        (ng = Math[A3(0x585)](0x3, Math[A3(0x9da)](0x1, ng))));
    };
    const ni = {};
    (ni[ux(0x235)] = ux(0x202)),
      (ni["me"] = ux(0xa87)),
      (ni[ux(0x1be)] = ux(0xd0a));
    var nj = ni,
      nk = {};
    function nl(rM, rN) {
      nm(rM, null, null, null, jy(rN));
    }
    function nm(rM, rN, rO, rP = nj[ux(0x235)], rQ) {
      const A4 = ux,
        rR = nR(A4(0x7a6));
      if (!rQ) {
        if (rN) {
          const rT = nR(A4(0x383));
          k9(rT, rN + ":"), rR[A4(0xcee)](rT);
        }
        const rS = nR(A4(0x2e2));
        k9(rS, rO),
          rR[A4(0xcee)](rS),
          (rR[A4(0x476)][0x0][A4(0x5c6)][A4(0x422)] = rP),
          rN && rR[A4(0x409)](nR(A4(0x1da)));
      } else rR[A4(0x90b)] = rQ;
      pk[A4(0xcee)](rR);
      while (pk[A4(0x476)][A4(0xc2f)] > 0x3c) {
        pk[A4(0x476)][0x0][A4(0xae0)]();
      }
      return (
        (pk[A4(0x122)] = pk[A4(0x107)]),
        (rR[A4(0xa37)] = rO),
        (rR[A4(0xe14)] = rP),
        nn(rM, rR),
        rR
      );
    }
    function nn(rM, rN) {
      const A5 = ux;
      (rN["t"] = 0x0), (rN[A5(0x9d0)] = 0x0);
      if (!nk[rM]) nk[rM] = [];
      nk[rM][A5(0x9db)](rN);
    }
    var no = {};
    kj[ux(0xc6a)] = window[ux(0xade)] = nw(function (rM) {
      const A6 = ux,
        rN = A6(0x43d) + rM[A6(0x7b2)];
      pr(rN, rM[A6(0x171)] === A6(0xa69));
    });
    var np = 0x0;
    function nq(rM) {
      const A7 = ux,
        rN = 0x200,
        rO = rN / 0x64,
        rP = document[A7(0x916)](A7(0xca1));
      rP[A7(0xb3d)] = rP[A7(0x2a1)] = rN;
      const rQ = rP[A7(0x3b7)]("2d");
      rQ[A7(0x30e)](rN / 0x2, rN / 0x2), rQ[A7(0xa60)](rO), rM[A7(0x114)](rQ);
      const rR = (rM[A7(0xcbd)] ? A7(0xdb8) : A7(0x13a)) + rM[A7(0x5ee)];
      nr(rP, rR);
    }
    function nr(rM, rN) {
      const A8 = ux,
        rO = document[A8(0x916)]("a");
      (rO[A8(0x204)] = rN),
        (rO[A8(0xa50)] = typeof rM === A8(0x533) ? rM : rM[A8(0x7db)]()),
        rO[A8(0xd81)](),
        hJ(rN + A8(0x214), hO[A8(0x4c5)]);
    }
    var ns = 0x0;
    setInterval(function () {
      ns = 0x0;
    }, 0x1770),
      setInterval(function () {
        const A9 = ux;
        nx[A9(0xc2f)] = 0x0;
      }, 0x2710);
    var nt = ![],
      nu = ![];
    function nv(rM) {
      const Aa = ux;
      rM = rM[Aa(0x6da)]();
      if (!rM) hJ(Aa(0x21a)), hb(Aa(0x21a));
      else
        rM[Aa(0xc2f)] < cM || rM[Aa(0xc2f)] > cL
          ? (hJ(Aa(0x924)), hb(Aa(0x924)))
          : (hJ(Aa(0x2d5) + rM + Aa(0x8d0), hO[Aa(0x7cc)]),
            hb(Aa(0x2d5) + rM + Aa(0x8d0)),
            mA(rM));
    }
    document[ux(0x480)] = document[ux(0x5e9)] = nw(function (rM) {
      const Ab = ux;
      rM[Ab(0x4d6)] && rM[Ab(0xbc6)]();
      (nt = rM[Ab(0x4d6)]), (nu = rM[Ab(0x3c8)]);
      if (rM[Ab(0xd0d)] === 0x9) {
        rM[Ab(0xbc6)]();
        return;
      }
      if (document[Ab(0xdcd)] && document[Ab(0xdcd)][Ab(0xa4d)] === Ab(0x56d)) {
        if (rM[Ab(0x171)] === Ab(0xa45) && rM[Ab(0xd0d)] === 0xd) {
          if (document[Ab(0xdcd)] === hE) hF[Ab(0xd81)]();
          else {
            if (document[Ab(0xdcd)] === pj) {
              let rN = pj[Ab(0x1d6)][Ab(0x6da)]()[Ab(0x320)](0x0, cK);
              if (rN && hX) {
                if (pQ - np > 0x3e8) {
                  const rO = rN[Ab(0xdb3)](Ab(0x381));
                  if (rO || rN[Ab(0xdb3)](Ab(0xb8a))) {
                    const rP = rN[Ab(0x320)](rO ? 0x7 : 0x9);
                    if (!rP) hJ(Ab(0xbeb));
                    else {
                      if (rO) {
                        const rQ = eL[rP];
                        !rQ ? hJ(Ab(0x2f9) + rP + "!") : nq(rQ);
                      } else {
                        const rR = dE[rP];
                        !rR ? hJ(Ab(0xb3c) + rP + "!") : nq(rR);
                      }
                    }
                  } else {
                    if (rN[Ab(0xdb3)](Ab(0x8e1))) nr(qy, Ab(0x570));
                    else {
                        let inputChat = rN;
                        if(inputChat.startsWith('/toggle')){
                            hack.commandMultiArg('toggle', 2, inputChat);
                        }else if(inputChat.startsWith('/list')){
                            hack.addChat('List of module and configs:');
                            hack.listModule();
                        }else if(inputChat.startsWith('/help')){
                            hack.getHelp();
                        }else if(inputChat.startsWith('/open')){
                            hack.openGUI();
                        }else if(inputChat.startsWith('/bind')){
                            hack.commandMultiArg('bindKey', 3, inputChat);
                            hack.saveModule();
                        }else if(inputChat.startsWith('/delBuild')){
                            hack.commandMultiArg('delBuild', 2, inputChat);
                        }else if(inputChat.startsWith('/viewPetal')){
                            hack.commandMultiArg('viewPetal', 2, inputChat);
                        }else if(inputChat.startsWith('/viewMob')){
                            hack.commandMultiArg('viewMob', 2, inputChat);
                        }else if(inputChat.startsWith('/track')){
                            hack.commandMultiArg('onTrack', 2, inputChat);
                        }else if(!hack.isEnabled('allowInvalidCommand') && hack.notCommand(inputChat.split(' ')[0])){
                            hack.addError('Invalid command!');
                        }else
                      if (rN[Ab(0xdb3)](Ab(0xe09))) {
                        const rS = rN[Ab(0x320)](0x9);
                        nv(rS);
                      } else {
                        hack.speak = (txt) => {
                            rN = txt;
                        let rT = 0x0;
                        for (let rU = 0x0; rU < nx[Ab(0xc2f)]; rU++) {
                          ny(rN, nx[rU]) > 0.95 && rT++;
                        }
                        rT >= 0x3 && (ns += 0xa);
                        ns++;
                        if (ns > 0x3) hJ(Ab(0xa2d)), (np = pQ + 0xea60);
                        else {
                          nx[Ab(0x9db)](rN);
                          if (nx[Ab(0xc2f)] > 0xa) nx[Ab(0x7aa)]();
                          (rN = decodeURIComponent(
                            encodeURIComponent(rN)
                              [Ab(0xbb7)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                              [Ab(0xbb7)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                          )),
                            im(
                              new Uint8Array([
                                cH[Ab(0x3b9)],
                                ...new TextEncoder()[Ab(0x3bc)](rN),
                              ])
                            ),
                            (np = pQ);
                        }
                      };
                      hack.speak(inputChat);};
                    }
                  }
                } else nm(-0x1, null, Ab(0x6f8), nj[Ab(0x1be)]);
              }
              (pj[Ab(0x1d6)] = ""), pj[Ab(0xad7)]();
            }
          }
        }
        return;
      }
      pr(rM[Ab(0x883)], rM[Ab(0x171)] === Ab(0x9ba));
    });
    function nw(rM) {
      return function (rN) {
        const Ac = b;
        rN instanceof Event && rN[Ac(0x218)] && !rN[Ac(0xa08)] && rM(rN);
      };
    }
    var nx = [];
    function ny(rM, rN) {
      const Ad = ux;
      var rO = rM,
        rP = rN;
      rM[Ad(0xc2f)] < rN[Ad(0xc2f)] && ((rO = rN), (rP = rM));
      var rQ = rO[Ad(0xc2f)];
      if (rQ == 0x0) return 0x1;
      return (rQ - nz(rO, rP)) / parseFloat(rQ);
    }
    function nz(rM, rN) {
      const Ae = ux;
      (rM = rM[Ae(0x49a)]()), (rN = rN[Ae(0x49a)]());
      var rO = new Array();
      for (var rP = 0x0; rP <= rM[Ae(0xc2f)]; rP++) {
        var rQ = rP;
        for (var rR = 0x0; rR <= rN[Ae(0xc2f)]; rR++) {
          if (rP == 0x0) rO[rR] = rR;
          else {
            if (rR > 0x0) {
              var rS = rO[rR - 0x1];
              if (rM[Ae(0xdac)](rP - 0x1) != rN[Ae(0xdac)](rR - 0x1))
                rS = Math[Ae(0x585)](Math[Ae(0x585)](rS, rQ), rO[rR]) + 0x1;
              (rO[rR - 0x1] = rQ), (rQ = rS);
            }
          }
        }
        if (rP > 0x0) rO[rN[Ae(0xc2f)]] = rQ;
      }
      return rO[rN[Ae(0xc2f)]];
    }
    var nA = document[ux(0x546)](ux(0x82d)),
      nB = document[ux(0x546)](ux(0x74f));
    function nC(rM, rN = 0x1) {
      const Af = ux;
      rM[Af(0xa2f)](),
        rM[Af(0x18a)](0.25 * rN, 0.25 * rN),
        rM[Af(0x30e)](-0x4b, -0x4b),
        rM[Af(0xc0e)](),
        rM[Af(0x4a6)](0x4b, 0x28),
        rM[Af(0x4c4)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        rM[Af(0x4c4)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        rM[Af(0x4c4)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        rM[Af(0x4c4)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        rM[Af(0x4c4)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        rM[Af(0x4c4)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (rM[Af(0x681)] = Af(0x955)),
        rM[Af(0x615)](),
        (rM[Af(0x9ed)] = rM[Af(0xb0f)] = Af(0x22b)),
        (rM[Af(0x669)] = Af(0x41a)),
        (rM[Af(0x71e)] = 0xc),
        rM[Af(0x8ae)](),
        rM[Af(0xbec)]();
    }
    for (let rM = 0x0; rM < dB[ux(0xc2f)]; rM++) {
      const rN = dB[rM];
      if (rN[ux(0xb8d)] !== void 0x0)
        switch (rN[ux(0xb8d)]) {
          case de[ux(0xdee)]:
            rN[ux(0x114)] = function (rO) {
              const Ag = ux;
              rO[Ag(0x18a)](2.5, 2.5), lP(rO);
            };
            break;
          case de[ux(0x95f)]:
            rN[ux(0x114)] = function (rO) {
              const Ah = ux;
              rO[Ah(0xa60)](0.9);
              const rP = pW();
              (rP[Ah(0x483)] = !![]), rP[Ah(0xaff)](rO);
            };
            break;
          case de[ux(0x853)]:
            rN[ux(0x114)] = function (rO) {
              const Ai = ux;
              rO[Ai(0x568)](-Math["PI"] / 0x2),
                rO[Ai(0x30e)](-0x30, 0x0),
                pV[Ai(0x55d)](rO, ![]);
            };
            break;
          case de[ux(0x499)]:
            rN[ux(0x114)] = function (rO) {
              const Aj = ux;
              rO[Aj(0x568)](Math["PI"] / 0xa),
                rO[Aj(0x30e)](0x3, 0x15),
                lQ(rO, !![]);
            };
            break;
          case de[ux(0xd51)]:
            rN[ux(0x114)] = function (rO) {
              nC(rO);
            };
            break;
          case de[ux(0x301)]:
            rN[ux(0x114)] = function (rO) {
              const Ak = ux;
              rO[Ak(0x30e)](0x0, 0x3),
                rO[Ak(0x568)](-Math["PI"] / 0x4),
                rO[Ak(0xa60)](0.4),
                pV[Ak(0x832)](rO),
                rO[Ak(0xc0e)](),
                rO[Ak(0x878)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rO[Ak(0x71e)] = 0x8),
                (rO[Ak(0x669)] = Ak(0xb9e)),
                rO[Ak(0x8ae)]();
            };
            break;
          case de[ux(0x2b9)]:
            rN[ux(0x114)] = function (rO) {
              const Al = ux;
              rO[Al(0x30e)](0x0, 0x7),
                rO[Al(0xa60)](0.8),
                pV[Al(0x9f4)](rO, 0.5);
            };
            break;
          case de[ux(0x5c0)]:
            rN[ux(0x114)] = function (rO) {
              const Am = ux;
              rO[Am(0xa60)](1.3), lT(rO);
            };
            break;
          default:
            rN[ux(0x114)] = function (rO) {};
        }
      else {
        const rO = new lH(
          -0x1,
          rN[ux(0x171)],
          0x0,
          0x0,
          rN[ux(0xa8d)],
          rN[ux(0xcbb)] ? 0x10 : rN[ux(0x911)] * 1.1,
          0x0
        );
        (rO[ux(0x7af)] = !![]),
          rN[ux(0x1db)] === 0x1
            ? (rN[ux(0x114)] = function (rP) {
                const An = ux;
                rO[An(0xaff)](rP);
              })
            : (rN[ux(0x114)] = function (rP) {
                const Ao = ux;
                for (let rQ = 0x0; rQ < rN[Ao(0x1db)]; rQ++) {
                  rP[Ao(0xa2f)]();
                  const rR = (rQ / rN[Ao(0x1db)]) * Math["PI"] * 0x2;
                  rN[Ao(0x83f)]
                    ? rP[Ao(0x30e)](...lf(rN[Ao(0xb76)], 0x0, rR))
                    : (rP[Ao(0x568)](rR), rP[Ao(0x30e)](rN[Ao(0xb76)], 0x0)),
                    rP[Ao(0x568)](rN[Ao(0x125)]),
                    rO[Ao(0xaff)](rP),
                    rP[Ao(0xbec)]();
                }
              });
      }
    }
    const nD = {};
    (nD[ux(0x5df)] = ux(0xa20)),
      (nD[ux(0x3ae)] = ux(0x7c1)),
      (nD[ux(0x2e3)] = ux(0xc26)),
      (nD[ux(0x6cc)] = ux(0xc16)),
      (nD[ux(0xaca)] = ux(0x310)),
      (nD[ux(0xd14)] = ux(0x8c4)),
      (nD[ux(0x758)] = ux(0x2b0));
    var nE = nD;
    function nF() {
      const Ap = ux,
        rP = document[Ap(0x546)](Ap(0x998));
      let rQ = Ap(0xdd8);
      for (let rR = 0x0; rR < 0xc8; rR++) {
        const rS = d5(rR),
          rT = 0xc8 * rS,
          rU = 0x19 * rS,
          rV = d4(rR);
        rQ +=
          Ap(0xe77) +
          (rR + 0x1) +
          Ap(0x8f3) +
          ka(Math[Ap(0x22b)](rT)) +
          Ap(0x8f3) +
          ka(Math[Ap(0x22b)](rU)) +
          Ap(0x8f3) +
          rV +
          Ap(0x888);
      }
      (rQ += Ap(0x484)), (rQ += Ap(0xddc)), (rP[Ap(0x90b)] = rQ);
    }
    nF();
    function nG(rP, rQ) {
      const Aq = ux,
        rR = eL[rP],
        rS = rR[Aq(0x5ee)],
        rT = rR[Aq(0x5b6)];
      return (
        "x" +
        rQ[Aq(0x1db)] * rQ[Aq(0x52e)] +
        ("\x20" + rS + Aq(0x6ec) + hP[rT] + Aq(0x704) + hM[rT] + ")")
      );
    }
    function nH(rP) {
      const Ar = ux;
      return rP[Ar(0xbca)](0x2)[Ar(0xbb7)](/\.?0+$/, "");
    }
    function nI(rP) {
      const As = ux,
        rQ = rP[As(0x675)];
      return Math[As(0x22b)]((rQ * rQ) / (0x32 * 0x32));
    }
    var nJ = [
        [ux(0xbf6), ux(0x4b0), nE[ux(0x5df)]],
        [ux(0x11f), ux(0x88a), nE[ux(0x3ae)]],
        [ux(0x420), ux(0x2ec), nE[ux(0x2e3)]],
        [ux(0x7c6), ux(0x433), nE[ux(0x6cc)]],
        [ux(0xd41), ux(0x896), nE[ux(0xd14)]],
        [ux(0x904), ux(0x1a1), nE[ux(0xaca)]],
        [ux(0x817), ux(0x792), nE[ux(0x758)]],
        [ux(0x5d5), ux(0x877), nE[ux(0x758)], (rP) => "+" + ka(rP)],
        [ux(0x8ac), ux(0x38d), nE[ux(0x758)], (rP) => "+" + ka(rP)],
        [ux(0x2ff), ux(0xe24), nE[ux(0x758)]],
        [
          ux(0x5db),
          ux(0xddb),
          nE[ux(0x758)],
          (rP) => Math[ux(0x22b)](rP * 0x64) + "%",
        ],
        [ux(0xddf), ux(0xb75), nE[ux(0x758)], (rP) => "+" + nH(rP) + ux(0x353)],
        [ux(0x8c6), ux(0xa86), nE[ux(0x2e3)], (rP) => ka(rP) + "/s"],
        [ux(0x9cc), ux(0xa86), nE[ux(0x2e3)], (rP) => ka(rP) + ux(0xc1b)],
        [
          ux(0x48b),
          ux(0xaa0),
          nE[ux(0x758)],
          (rP) => (rP > 0x0 ? "+" : "") + rP,
        ],
        [ux(0xd3e), ux(0x2be), nE[ux(0xaca)], (rP) => "+" + rP + "%"],
        [
          ux(0x9e5),
          ux(0x116),
          nE[ux(0xaca)],
          (rP) => "+" + parseInt(rP * 0x64) + "%",
        ],
        [ux(0xab9), ux(0x370), nE[ux(0x758)], (rP) => "-" + rP + "%"],
        [ux(0x14e), ux(0x362), nE[ux(0x758)], nG],
        [ux(0x1c6), ux(0x465), nE[ux(0xaca)], (rP) => rP / 0x3e8 + "s"],
        [ux(0x91f), ux(0x6e2), nE[ux(0xaca)], (rP) => rP + "s"],
        [ux(0x8be), ux(0xa0a), nE[ux(0xaca)], (rP) => ka(rP) + ux(0x6f2)],
        [ux(0x57c), ux(0x573), nE[ux(0xaca)], (rP) => rP + "s"],
        [ux(0x4c2), ux(0x5d3), nE[ux(0xaca)], (rP) => rP / 0x3e8 + "s"],
        [ux(0x1b6), ux(0x68b), nE[ux(0xaca)]],
        [ux(0xcd5), ux(0xc68), nE[ux(0xaca)]],
        [ux(0x1e3), ux(0x640), nE[ux(0xaca)], (rP) => rP + ux(0x4e7)],
        [ux(0xde9), ux(0x641), nE[ux(0xaca)], (rP) => rP + ux(0x4e7)],
        [ux(0xc98), ux(0x201), nE[ux(0xaca)]],
        [ux(0x85a), ux(0x1ed), nE[ux(0x758)]],
        [ux(0x6a0), ux(0x58e), nE[ux(0xaca)], (rP) => rP / 0x3e8 + "s"],
        [ux(0xb35), ux(0xe5c), nE[ux(0x2e3)], (rP) => ka(rP) + "/s"],
        [
          ux(0xc09),
          ux(0xdb6),
          nE[ux(0xaca)],
          (rP, rQ) => ka(rP) + ux(0xd10) + ka(nI(rQ) * rP * 0x14) + ux(0x962),
        ],
        [
          ux(0x675),
          ux(0x441),
          nE[ux(0x758)],
          (rP, rQ) => ka(rP) + "\x20(" + nI(rQ) + ux(0x32e),
        ],
        [
          ux(0xc53),
          ux(0x205),
          nE[ux(0xaca)],
          (rP, rQ) => nH(rP * rQ[ux(0x911)]),
        ],
        [ux(0x350), ux(0x445), nE[ux(0xaca)]],
        [ux(0x70a), ux(0xac3), nE[ux(0x758)]],
        [ux(0x142), ux(0x3bd), nE[ux(0xaca)]],
        [ux(0x14f), ux(0x3ac), nE[ux(0xaca)]],
        [ux(0x4c0), ux(0x92d), nE[ux(0xaca)]],
        [
          ux(0x5ab),
          ux(0x660),
          nE[ux(0xaca)],
          (rP) => "+" + nH(rP * 0x64) + "%",
        ],
        [ux(0x3c9), ux(0x1d8), nE[ux(0xd14)]],
        [ux(0x8c9), ux(0xbdb), nE[ux(0xaca)]],
        [ux(0x989), ux(0x9b7), nE[ux(0x2e3)]],
        [ux(0x68e), ux(0x6e2), nE[ux(0xaca)], (rP) => rP + "s"],
        [ux(0xd89), ux(0x4b4), nE[ux(0xaca)]],
        [ux(0xb55), ux(0x776), nE[ux(0x758)], (rP) => rP / 0x3e8 + "s"],
      ],
      nK = [
        [ux(0xaa2), ux(0x32b), nE[ux(0xaca)]],
        [ux(0x442), ux(0x8cf), nE[ux(0x758)], (rP) => ka(rP * 0x64) + "%"],
        [ux(0x199), ux(0x879), nE[ux(0x758)]],
        [ux(0x31e), ux(0x899), nE[ux(0xaca)]],
        [ux(0x703), ux(0x6f4), nE[ux(0x758)]],
        [ux(0xd3e), ux(0x2be), nE[ux(0xaca)], (rP) => "+" + rP + "%"],
        [ux(0xe0c), ux(0x863), nE[ux(0xaca)], (rP) => ka(rP) + "/s"],
        [ux(0x794), ux(0x175), nE[ux(0x5df)], (rP) => rP * 0x64 + ux(0x178)],
        [ux(0xce9), ux(0x60e), nE[ux(0xaca)], (rP) => rP + "s"],
        [
          ux(0x845),
          ux(0xacd),
          nE[ux(0x758)],
          (rP) => "-" + parseInt((0x1 - rP) * 0x64) + "%",
        ],
      ];
    function nL(rP, rQ = !![]) {
      const At = ux;
      let rR = "",
        rS = "",
        rT;
      rP[At(0xb8d)] === void 0x0
        ? ((rT = nJ),
          rP[At(0x751)] &&
            (rS =
              At(0xa66) +
              (rP[At(0x751)] / 0x3e8 +
                "s" +
                (rP[At(0x458)] > 0x0
                  ? At(0x658) + rP[At(0x458)] / 0x3e8 + "s"
                  : "")) +
              At(0x91c)))
        : (rT = nK);
      for (let rV = 0x0; rV < rT[At(0xc2f)]; rV++) {
        const [rW, rX, rY, rZ] = rT[rV],
          s0 = rP[rW];
        s0 &&
          s0 !== 0x0 &&
          (rR +=
            At(0xc73) +
            rY +
            At(0x8fa) +
            rX +
            At(0xb49) +
            (rZ ? rZ(s0, rP) : ka(s0)) +
            At(0x5ca));
      }
      const rU = nR(
        At(0x278) +
          rP[At(0x5ee)] +
          At(0x71a) +
          hM[rP[At(0x5b6)]] +
          At(0x743) +
          hP[rP[At(0x5b6)]] +
          At(0xa82) +
          rS +
          At(0xc79) +
          rP[At(0xc0c)] +
          At(0xa82) +
          rR +
          At(0x2cb)
      );
      if (rP[At(0xd1b)] && rQ) {
        rU[At(0x11b)][At(0x5c6)][At(0x67f)] = At(0xa98);
        for (let s1 = 0x0; s1 < rP[At(0xd1b)][At(0xc2f)]; s1++) {
          const [s2, s3] = rP[At(0xd1b)][s1],
            s4 = nR(At(0xbce));
          rU[At(0xcee)](s4);
          const s5 = f4[s3][rP[At(0x5b6)]];
          for (let s6 = 0x0; s6 < s5[At(0xc2f)]; s6++) {
            const [s7, s8] = s5[s6],
              s9 = eV(s2, s8),
              sa = nR(
                At(0x2c5) +
                  s9[At(0x5b6)] +
                  "\x22\x20" +
                  qB(s9) +
                  At(0xc58) +
                  s7 +
                  At(0x1ea)
              );
            s4[At(0xcee)](sa);
          }
        }
      }
      return rU;
    }
    function nM() {
      const Au = ux;
      mL && (mL[Au(0xae0)](), (mL = null));
      const rP = kp[Au(0xa26)](Au(0x47d));
      for (let rQ = 0x0; rQ < rP[Au(0xc2f)]; rQ++) {
        const rR = rP[rQ];
        rR[Au(0xae0)]();
      }
      for (let rS = 0x0; rS < iP; rS++) {
        const rT = nR(Au(0xaef));
        rT[Au(0x6d6)] = rS;
        const rU = iQ[rS];
        if (rU) {
          const rV = nR(
            Au(0x47e) + rU[Au(0x5b6)] + "\x22\x20" + qB(rU) + Au(0xbb4)
          );
          (rV[Au(0x7e1)] = rU),
            (rV[Au(0xbc8)] = !![]),
            (rV[Au(0x13d)] = iS[Au(0x526)]()),
            nQ(rV, rU),
            rT[Au(0xcee)](rV),
            (iR[rV[Au(0x13d)]] = rV);
        }
        rS >= iO
          ? (rT[Au(0xcee)](nR(Au(0x815) + ((rS - iO + 0x1) % 0xa) + Au(0x41f))),
            nB[Au(0xcee)](rT))
          : nA[Au(0xcee)](rT);
      }
    }
    function nN(rP) {
      const Av = ux;
      return rP < 0.5
        ? 0x4 * rP * rP * rP
        : 0x1 - Math[Av(0x3ce)](-0x2 * rP + 0x2, 0x3) / 0x2;
    }
    var nO = [];
    function nP(rP, rQ) {
      const Aw = ux;
      (rP[Aw(0x2ba)] = 0x0), (rP[Aw(0x73d)] = 0x1);
      let rR = 0x1,
        rS = 0x0,
        rT = -0x1;
      rP[Aw(0x292)][Aw(0x1ee)](Aw(0x212)), rP[Aw(0x3b6)](Aw(0x5c6), "");
      const rU = nR(Aw(0x9f2));
      rP[Aw(0xcee)](rU), nO[Aw(0x9db)](rU);
      const rV = qt;
      rU[Aw(0xb3d)] = rU[Aw(0x2a1)] = rV;
      const rW = rU[Aw(0x3b7)]("2d");
      (rU[Aw(0x7ec)] = function () {
        const Ax = Aw;
        rW[Ax(0x2d4)](0x0, 0x0, rV, rV);
        rS < 0.99 &&
          ((rW[Ax(0xae3)] = 0x1 - rS),
          (rW[Ax(0x681)] = Ax(0x3ee)),
          rW[Ax(0xa46)](0x0, 0x0, rV, (0x1 - rR) * rV));
        if (rS < 0.01) return;
        (rW[Ax(0xae3)] = rS),
          rW[Ax(0xa2f)](),
          rW[Ax(0xa60)](rV / 0x64),
          rW[Ax(0x30e)](0x32, 0x2d);
        let rX = rP[Ax(0x2ba)];
        rX = nN(rX);
        const rY = Math["PI"] * 0x2 * rX;
        rW[Ax(0x568)](rY * 0x4),
          rW[Ax(0xc0e)](),
          rW[Ax(0x4a6)](0x0, 0x0),
          rW[Ax(0x878)](0x0, 0x0, 0x64, 0x0, rY),
          rW[Ax(0x4a6)](0x0, 0x0),
          rW[Ax(0x878)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rW[Ax(0x681)] = Ax(0x843)),
          rW[Ax(0x615)](Ax(0x188)),
          rW[Ax(0xbec)]();
      }),
        (rU[Aw(0x72c)] = function () {
          const Ay = Aw;
          rP[Ay(0x2ba)] += pR / (rQ[Ay(0x751)] + 0xc8);
          let rX = 0x1,
            rY = rP[Ay(0x73d)];
          rP[Ay(0x2ba)] >= 0x1 && (rX = 0x0);
          const rZ = rP[Ay(0xdca)] || rP[Ay(0xe38)];
          ((rZ && rZ[Ay(0xe38)] === nB) || !iz) && ((rY = 0x1), (rX = 0x0));
          (rS = px(rS, rX, 0x64)), (rR = px(rR, rY, 0x64));
          const s0 = Math[Ay(0x22b)]((0x1 - rR) * 0x64),
            s1 = Math[Ay(0x22b)](rS * 0x64) / 0x64;
          s1 == 0x0 && s0 <= 0x0
            ? ((rU[Ay(0xdcf)] = ![]), (rU[Ay(0x5c6)][Ay(0x50f)] = Ay(0x5a4)))
            : ((rU[Ay(0xdcf)] = !![]), (rU[Ay(0x5c6)][Ay(0x50f)] = "")),
            (rT = s0);
        }),
        rP[Aw(0xcee)](nR(Aw(0x31b) + qB(rQ) + Aw(0xbb4)));
    }
    function nQ(rP, rQ, rR = !![]) {
      const Az = ux;
      rR && rQ[Az(0xb8d)] === void 0x0 && nP(rP, rQ);
    }
    function nR(rP) {
      const AA = ux;
      return (hA[AA(0x90b)] = rP), hA[AA(0x476)][0x0];
    }
    var nS = document[ux(0x546)](ux(0xa0d)),
      nT = [];
    function nU() {
      const AB = ux;
      (nS[AB(0x90b)] = AB(0x2bb)[AB(0xa08)](eK * dG)),
        (nT = Array[AB(0x4ab)](nS[AB(0x476)]));
    }
    nU();
    var nV = {};
    for (let rP = 0x0; rP < eJ[ux(0xc2f)]; rP++) {
      const rQ = eJ[rP];
      !nV[rQ[ux(0x171)]] &&
        ((nV[rQ[ux(0x171)]] = new lH(
          -0x1,
          rQ[ux(0x171)],
          0x0,
          0x0,
          rQ[ux(0x37e)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          rQ[ux(0x3d7)],
          0x1
        )),
        (nV[rQ[ux(0x171)]][ux(0x7af)] = !![]));
      const rR = nV[rQ[ux(0x171)]];
      let rS = null;
      rQ[ux(0x265)] !== void 0x0 &&
        (rS = new lH(-0x1, rQ[ux(0x265)], 0x0, 0x0, 0x0, rQ[ux(0x3d7)], 0x1)),
        (rQ[ux(0x114)] = function (rT) {
          const AC = ux;
          rT[AC(0x18a)](0.5, 0.5),
            rR[AC(0xaff)](rT),
            rS &&
              (rT[AC(0x568)](rR[AC(0xa8e)]),
              rT[AC(0x30e)](-rQ[AC(0x3d7)] * 0x2, 0x0),
              rS[AC(0xaff)](rT));
        });
    }
    function nW(rT, rU = ![]) {
      const AD = ux,
        rV = nR(AD(0x47e) + rT[AD(0x5b6)] + "\x22\x20" + qB(rT) + AD(0xbb4));
      jZ(rV), (rV[AD(0x7e1)] = rT);
      if (rU) return rV;
      const rW = dG * rT[AD(0x737)] + rT[AD(0x5b6)],
        rX = nT[rW];
      return nS[AD(0x1c4)](rV, rX), rX[AD(0xae0)](), (nT[rW] = rV), rV;
    }
    var nX = document[ux(0x546)](ux(0xb38)),
      nY = document[ux(0x546)](ux(0xa1c)),
      nZ = document[ux(0x546)](ux(0x651)),
      o0 = document[ux(0x546)](ux(0x4f8)),
      o1 = document[ux(0x546)](ux(0xcc3)),
      o2 = o1[ux(0x546)](ux(0xb15)),
      o3 = o1[ux(0x546)](ux(0x7cb)),
      o4 = document[ux(0x546)](ux(0xb6c)),
      o5 = document[ux(0x546)](ux(0x68f)),
      o6 = ![],
      o7 = 0x0,
      o8 = ![];
    (nY[ux(0x8cd)] = function () {
      (o6 = !![]), (o7 = 0x0), (o8 = ![]);
    }),
      (o0[ux(0x8cd)] = function () {
        const AE = ux;
        if (this[AE(0x292)][AE(0x427)](AE(0x652)) || jz) return;
        kJ(AE(0x115), (rT) => {
          rT && ((o6 = !![]), (o7 = 0x0), (o8 = !![]));
        });
      }),
      (nX[ux(0x90b)] = ux(0x2bb)[ux(0xa08)](dF * dG));
    var o9 = Array[ux(0x4ab)](nX[ux(0x476)]),
      oa = document[ux(0x546)](ux(0xae1)),
      ob = {};
    function oc() {
      const AF = ux;
      for (let rT in ob) {
        ob[rT][AF(0x1de)]();
      }
      ob = {};
      for (let rU in iT) {
        pb(rU);
      }
      od();
    }
    function od() {
      oe(oa);
    }
    function oe(rT) {
      const AG = ux,
        rU = Array[AG(0x4ab)](rT[AG(0xa26)](AG(0x47d)));
      rU[AG(0xcad)]((rV, rW) => {
        const AH = AG,
          rX = rW[AH(0x7e1)][AH(0x5b6)] - rV[AH(0x7e1)][AH(0x5b6)];
        return rX === 0x0 ? rW[AH(0x7e1)]["id"] - rV[AH(0x7e1)]["id"] : rX;
      });
      for (let rV = 0x0; rV < rU[AG(0xc2f)]; rV++) {
        const rW = rU[rV];
        rT[AG(0xcee)](rW);
      }
    }
    function of(rT, rU) {
      const AI = ux,
        rV = rU[AI(0x5b6)] - rT[AI(0x5b6)];
      return rV === 0x0 ? rU["id"] - rT["id"] : rV;
    }
    function og(rT, rU = !![]) {
      const AJ = ux,
        rV = nR(AJ(0xce3) + rT[AJ(0x5b6)] + "\x22\x20" + qB(rT) + AJ(0xb5a));
      setTimeout(function () {
        const AK = AJ;
        rV[AK(0x292)][AK(0xae0)](AK(0x77a));
      }, 0x1f4),
        (rV[AJ(0x7e1)] = rT);
      if (rU) {
      }
      return (rV[AJ(0xa4f)] = rV[AJ(0x546)](AJ(0x67c))), rV;
    }
    var oh = nR(ux(0x262)),
      oi = oh[ux(0x546)](ux(0x8c1)),
      oj = oh[ux(0x546)](ux(0x1eb)),
      ok = oh[ux(0x546)](ux(0x8d1)),
      ol = [];
    for (let rT = 0x0; rT < 0x5; rT++) {
      const rU = nR(ux(0x2bb));
      (rU[ux(0xb4a)] = function (rV = 0x0) {
        const AL = ux,
          rW =
            (rT / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rV * Math["PI"] * 0x6,
          rX =
            0x32 +
            (rV > 0x0
              ? Math[AL(0x372)](Math[AL(0x12d)](rV * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[AL(0x5c6)][AL(0x5c2)] = Math[AL(0x65c)](rW) * rX + 0x32 + "%"),
          (this[AL(0x5c6)][AL(0xc0d)] = Math[AL(0x12d)](rW) * rX + 0x32 + "%");
      }),
        rU[ux(0xb4a)](),
        (rU[ux(0x1db)] = 0x0),
        (rU["el"] = null),
        (rU[ux(0x428)] = function () {
          const AM = ux;
          (rU[AM(0x1db)] = 0x0), (rU["el"] = null), (rU[AM(0x90b)] = "");
        }),
        (rU[ux(0xa14)] = function (rV) {
          const AN = ux;
          if (!rU["el"]) {
            const rW = og(p0, ![]);
            (rW[AN(0x8cd)] = function () {
              if (p2 || p4) return;
              p8(null);
            }),
              rU[AN(0xcee)](rW),
              (rU["el"] = rW);
          }
          (rU[AN(0x1db)] += rV), p6(rU["el"][AN(0xa4f)], rU[AN(0x1db)]);
        }),
        oi[ux(0xcee)](rU),
        ol[ux(0x9db)](rU);
    }
    var om,
      on = document[ux(0x546)](ux(0xc93)),
      oo = document[ux(0x546)](ux(0xc66)),
      op = document[ux(0x546)](ux(0xd69)),
      oq = document[ux(0x546)](ux(0xa48)),
      or = {};
    function os() {
      const AO = ux,
        rV = document[AO(0x546)](AO(0x5d8));
      for (let rW = 0x0; rW < dG; rW++) {
        const rX = nR(AO(0xc90) + rW + AO(0x2e7));
        (rX[AO(0x8cd)] = function () {
          const AP = AO;
          let rY = pq;
          pq = !![];
          for (const rZ in ob) {
            const s0 = dB[rZ];
            if (s0[AP(0x5b6)] !== rW) continue;
            const s1 = ob[rZ];
            s1[AP(0xa79)][AP(0xd81)]();
          }
          pq = rY;
        }),
          (or[rW] = rX),
          rV[AO(0xcee)](rX);
      }
    }
    os();
    var ot = ![],
      ou = document[ux(0x546)](ux(0x6d9));
    ou[ux(0x8cd)] = function () {
      const AQ = ux;
      document[AQ(0x99b)][AQ(0x292)][AQ(0x37a)](AQ(0x200)),
        (ot = document[AQ(0x99b)][AQ(0x292)][AQ(0x427)](AQ(0x200)));
      const rV = ot ? AQ(0x25e) : AQ(0x13c);
      k9(oo, rV),
        k9(oq, rV),
        ot
          ? (on[AQ(0xcee)](oh), oh[AQ(0xcee)](nX), op[AQ(0xae0)]())
          : (on[AQ(0xcee)](op),
            op[AQ(0x1c4)](nX, op[AQ(0x11b)]),
            oh[AQ(0xae0)]());
    };
    var ov = document[ux(0x546)](ux(0xac5)),
      ow = oz(ux(0x877), nE[ux(0x3ae)]),
      ox = oz(ux(0x5b1), nE[ux(0x5df)]),
      oy = oz(ux(0xba3), nE[ux(0xd14)]);
    function oz(rV, rW) {
      const AR = ux,
        rX = nR(AR(0x5f7) + rW + AR(0x24e) + rV + AR(0x41b));
      return (
        (rX[AR(0xb91)] = function (rY) {
          const AS = AR;
          k9(rX[AS(0x476)][0x1], ka(Math[AS(0x22b)](rY)));
        }),
        ov[AR(0xcee)](rX),
        rX
      );
    }
    var oA = document[ux(0x546)](ux(0x9df)),
      oB = document[ux(0x546)](ux(0x38a));
    oB[ux(0x90b)] = "";
    var oC = document[ux(0x546)](ux(0xbc9)),
      oD = {};
    function oE() {
      const AT = ux;
      (oB[AT(0x90b)] = ""), (oC[AT(0x90b)] = "");
      const rV = {},
        rW = [];
      for (let rX in oD) {
        const rY = dB[rX],
          rZ = oD[rX];
        (rV[rY[AT(0x5b6)]] = (rV[rY[AT(0x5b6)]] || 0x0) + rZ),
          rW[AT(0x9db)]([rY, rZ]);
      }
      if (rW[AT(0xc2f)] === 0x0) {
        oA[AT(0x5c6)][AT(0x50f)] = AT(0x5a4);
        return;
      }
      (oA[AT(0x5c6)][AT(0x50f)] = ""),
        rW[AT(0xcad)]((s0, s1) => {
          return of(s0[0x0], s1[0x0]);
        })[AT(0xa40)](([s0, s1]) => {
          const AU = AT,
            s2 = og(s0);
          jZ(s2), p6(s2[AU(0xa4f)], s1), oB[AU(0xcee)](s2);
        }),
        oF(oC, rV);
    }
    function oF(rV, rW) {
      const AV = ux;
      let rX = 0x0;
      for (let rY in d8) {
        const rZ = rW[d8[rY]];
        if (rZ !== void 0x0) {
          rX++;
          const s0 = nR(
            AV(0x24a) + ka(rZ) + "\x20" + rY + AV(0x743) + hO[rY] + AV(0x59c)
          );
          rV[AV(0x409)](s0);
        }
      }
      rX % 0x2 === 0x1 &&
        (rV[AV(0x476)][0x0][AV(0x5c6)][AV(0xd11)] = AV(0x721));
    }
    var oG = {},
      oH = 0x0,
      oI,
      oJ,
      oK,
      oL,
      oM = 0x0,
      oN = 0x0,
      oO = 0x0,
      oP = 0x0,
      oQ = 0x0;
    function oR() {
      const AW = ux,
        rV = d3(oH);
      (oI = rV[0x0]),
        (oJ = rV[0x1]),
        (oL = d1(oI + 0x1)),
        (oK = oH - oJ),
        k9(
          o5,
          AW(0x403) + (oI + 0x1) + AW(0x30f) + iK(oK) + "/" + iK(oL) + AW(0xa61)
        );
      const rW = d5(oI);
      ow[AW(0xb91)](0xc8 * rW),
        ox[AW(0xb91)](0x19 * rW),
        oy[AW(0xb91)](d4(oI)),
        hack.hp = 0xc8 * rW,
        (oN = Math[AW(0x585)](0x1, oK / oL)),
        (oP = 0x0),
        (o0[AW(0x546)](AW(0xe11))[AW(0x90b)] =
          oI >= cG ? AW(0xe4e) : AW(0x578) + (cG + 0x1) + AW(0xbc5));
    }
    var oS = 0x0,
      oT = document[ux(0x546)](ux(0xaf0));
    for (let rV = 0x0; rV < cY[ux(0xc2f)]; rV++) {
      const [rW, rX] = cY[rV],
        rY = j8[rW],
        rZ = nR(
          ux(0x802) +
            hO[rY] +
            ux(0x12b) +
            rY +
            ux(0x538) +
            (rX + 0x1) +
            ux(0x1d9)
        );
      (rZ[ux(0x8cd)] = function () {
        const AX = ux;
        if (oI >= rX) {
          const s0 = oT[AX(0x546)](AX(0x245));
          s0 && s0[AX(0x292)][AX(0xae0)](AX(0x487)),
            (oS = rV),
            (hC[AX(0x7b4)] = rV),
            this[AX(0x292)][AX(0x1ee)](AX(0x487));
        }
      }),
        (cY[rV][ux(0x94f)] = rZ),
        oT[ux(0xcee)](rZ);
    }
    function oU() {
      const AY = ux,
        s0 = parseInt(hC[AY(0x7b4)]) || 0x0;
      cY[0x0][AY(0x94f)][AY(0xd81)](),
        cY[AY(0xa40)]((s1, s2) => {
          const AZ = AY,
            s3 = s1[0x1];
          if (oI >= s3) {
            s1[AZ(0x94f)][AZ(0x292)][AZ(0xae0)](AZ(0x652));
            if (s0 === s2) s1[AZ(0x94f)][AZ(0xd81)]();
          } else s1[AZ(0x94f)][AZ(0x292)][AZ(0x1ee)](AZ(0x652));
        });
    }
    var oV = document[ux(0x546)](ux(0xcb2));
    setInterval(() => {
      const B0 = ux;
      if (!on[B0(0x292)][B0(0x427)](B0(0x695))) return;
      oW();
    }, 0x3e8);
    function oW() {
      const B1 = ux;
      if (k0) {
        let s0 = 0x0;
        for (const s2 in k0) {
          s0 += oX(s2, k0[s2]);
        }
        let s1 = 0x0;
        for (const s3 in oG) {
          const s4 = oX(s3, oG[s3][B1(0x1db)]);
          (s1 += s4), (s0 += s4);
        }
        if (s1 > 0x0) {
          const s5 = Math[B1(0x585)](0x19, (s1 / s0) * 0x64),
            s6 = s5 > 0x1 ? s5[B1(0xbca)](0x2) : s5[B1(0xbca)](0x5);
          k9(oV, "+" + s6 + "%");
        }
      }
    }
    function oX(s0, s1) {
      const B2 = ux,
        s2 = dB[s0];
      if (!s2) return 0x0;
      const s3 = s2[B2(0x5b6)];
      return Math[B2(0x3ce)](s3 * 0xa, s3) * s1;
    }
    var oY = document[ux(0x546)](ux(0x684));
    (oY[ux(0x8cd)] = function () {
      const B3 = ux;
      for (const s0 in oG) {
        const s1 = oG[s0];
        s1[B3(0x1de)]();
      }
      oZ();
    }),
      oZ(),
      oR();
    function oZ() {
      const B4 = ux,
        s0 = Object[B4(0xbe9)](oG);
      nZ[B4(0x292)][B4(0xae0)](B4(0xd78));
      const s1 = s0[B4(0xc2f)] === 0x0;
      (oY[B4(0x5c6)][B4(0x50f)] = s1 ? B4(0x5a4) : ""), (oQ = 0x0);
      let s2 = 0x0;
      const s3 = s0[B4(0xc2f)] > 0x1 ? 0x32 : 0x0;
      for (let s5 = 0x0, s6 = s0[B4(0xc2f)]; s5 < s6; s5++) {
        const s7 = s0[s5],
          s8 = (s5 / s6) * Math["PI"] * 0x2;
        s7[B4(0x1fe)](
          Math[B4(0x65c)](s8) * s3 + 0x32,
          Math[B4(0x12d)](s8) * s3 + 0x32
        ),
          (oQ += d2[s7["el"][B4(0x7e1)][B4(0x5b6)]] * s7[B4(0x1db)]);
      }
      nZ[B4(0x292)][s3 ? B4(0x1ee) : B4(0xae0)](B4(0xd78)),
        nY[B4(0x292)][s0[B4(0xc2f)] > 0x0 ? B4(0xae0) : B4(0x1ee)](B4(0x26b));
      const s4 = oI >= cG;
      o0[B4(0x292)][s0[B4(0xc2f)] > 0x0 && s4 ? B4(0xae0) : B4(0x1ee)](
        B4(0x652)
      ),
        oW(),
        (nZ[B4(0x5c6)][B4(0x14b)] = ""),
        (o6 = ![]),
        (o8 = ![]),
        (o7 = 0x0),
        (oM = Math[B4(0x585)](0x1, (oK + oQ) / oL) || 0x0),
        k9(o4, oQ > 0x0 ? "+" + iK(oQ) + B4(0xa61) : "");
    }
    var p0,
      p1 = 0x0,
      p2 = ![],
      p3 = 0x0,
      p4 = null;
    function p5() {
      const B5 = ux;
      oj[B5(0x292)][p1 < 0x5 ? B5(0x1ee) : B5(0xae0)](B5(0x26b));
    }
    oj[ux(0x8cd)] = function () {
      const B6 = ux;
      if (p2 || !p0 || p1 < 0x5 || !il() || p4) return;
      (p2 = !![]), (p3 = 0x0), (p4 = null), oj[B6(0x292)][B6(0x1ee)](B6(0x26b));
      const s0 = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      s0[B6(0xe51)](0x0, cH[B6(0x7c2)]),
        s0[B6(0x80f)](0x1, p0["id"]),
        s0[B6(0x397)](0x3, p1),
        im(s0);
    };
    function p6(s0, s1) {
      k9(s0, "x" + iK(s1));
    }
    function p7(s0) {
      const B7 = ux;
      typeof s0 === B7(0xcb3) && (s0 = nH(s0)), k9(ok, s0 + B7(0xaf7));
    }
    function p8(s0) {
      const B8 = ux;
      p0 && n6(p0["id"], p1);
      om && om[B8(0xd81)]();
      (p0 = s0), (p1 = 0x0), p5();
      for (let s1 = 0x0; s1 < ol[B8(0xc2f)]; s1++) {
        ol[s1][B8(0x428)]();
      }
      p0
        ? (p7(dD[p0[B8(0x5b6)]] * (jz ? 0x2 : 0x1) * (hd ? 0.9 : 0x1)),
          (oj[B8(0x5c6)][B8(0x31a)] = hP[p0[B8(0x5b6)] + 0x1]))
        : p7("?");
    }
    var p9 = 0x0,
      pa = 0x1;
    function pb(s0) {
      const B9 = ux,
        s1 = dB[s0],
        s2 = og(s1);
      (s2[B9(0x951)] = pt), jZ(s2), (s2[B9(0xd9c)] = !![]), oa[B9(0xcee)](s2);
      const s3 = og(s1);
      jZ(s3), (s3[B9(0x951)] = on);
      s1[B9(0x5b6)] >= db && s3[B9(0x292)][B9(0x1ee)](B9(0x3c4));
      s3[B9(0x8cd)] = function () {
        const Ba = B9;
        pQ - p9 < 0x1f4 ? pa++ : (pa = 0x1);
        p9 = pQ;
        if (ot) {
          if (p2 || s1[Ba(0x5b6)] >= db) return;
          const s7 = iT[s1["id"]];
          if (!s7) return;
          p0 !== s1 && p8(s1);
          const s8 = ol[Ba(0xc2f)];
          let s9 = pq ? s7 : Math[Ba(0x585)](s8 * pa, s7);
          n6(s1["id"], -s9), (p1 += s9), p5();
          let sa = s9 % s8,
            sb = (s9 - sa) / s8;
          const sc = [...ol][Ba(0xcad)](
            (se, sf) => se[Ba(0x1db)] - sf[Ba(0x1db)]
          );
          sb > 0x0 && sc[Ba(0xa40)]((se) => se[Ba(0xa14)](sb));
          let sd = 0x0;
          while (sa--) {
            const se = sc[sd];
            (sd = (sd + 0x1) % s8), se[Ba(0xa14)](0x1);
          }
          return;
        }
        if (!oG[s1["id"]]) {
          const sf = og(s1, ![]);
          k9(sf[Ba(0xa4f)], "x1"),
            (sf[Ba(0x8cd)] = function (sh) {
              const Bb = Ba;
              sg[Bb(0x1de)](), oZ();
            }),
            nZ[Ba(0xcee)](sf);
          const sg = {
            petal: s1,
            count: 0x0,
            el: sf,
            setPos(sh, si) {
              const Bc = Ba;
              (sf[Bc(0x5c6)][Bc(0x5c2)] = sh + "%"),
                (sf[Bc(0x5c6)][Bc(0xc0d)] = si + "%"),
                (sf[Bc(0x5c6)][Bc(0x8d5)] = Bc(0x252));
            },
            dispose(sh = !![]) {
              const Bd = Ba;
              sf[Bd(0xae0)](),
                sh && n6(s1["id"], this[Bd(0x1db)]),
                delete oG[s1["id"]];
            },
          };
          (oG[s1["id"]] = sg), oZ();
        }
        const s6 = oG[s1["id"]];
        if (iT[s1["id"]]) {
          const sh = iT[s1["id"]],
            si = pq ? sh : Math[Ba(0x585)](0x1 * pa, sh);
          (s6[Ba(0x1db)] += si),
            n6(s1["id"], -si),
            p6(s6["el"][Ba(0xa4f)], s6[Ba(0x1db)]);
        }
        oZ();
      };
      const s4 = dG * s1[B9(0x737)] + s1[B9(0xb47)],
        s5 = o9[s4];
      return (
        nX[B9(0x1c4)](s3, s5),
        s5[B9(0xae0)](),
        (o9[s4] = s3),
        (s2[B9(0x88d)] = function (s6) {
          const Be = B9;
          p6(s2[Be(0xa4f)], s6), p6(s3[Be(0xa4f)], s6);
        }),
        (s2[B9(0xa79)] = s3),
        (ob[s0] = s2),
        (s2[B9(0x1de)] = function () {
          const Bf = B9;
          s2[Bf(0xae0)](), delete ob[s0];
          const s6 = nR(Bf(0x2bb));
          (o9[s4] = s6), nX[Bf(0x1c4)](s6, s3), s3[Bf(0xae0)]();
        }),
        s2[B9(0x88d)](iT[s0]),
        s2
      );
    }
    var pc = {},
      pd = {};
    function pe(s0, s1, s2, s3) {
      const Bg = ux,
        s4 = document[Bg(0x546)](s2);
      (s4[Bg(0x23d)] = function () {
        const Bh = Bg;
        (pc[s0] = this[Bh(0x7f0)]),
          (hC[s0] = this[Bh(0x7f0)] ? "1" : "0"),
          s3 && s3(this[Bh(0x7f0)]);
      }),
        (pd[s0] = function () {
          const Bi = Bg;
          s4[Bi(0xd81)]();
        }),
        (s4[Bg(0x7f0)] = hC[s0] === void 0x0 ? s1 : hC[s0] === "1"),
        s4[Bg(0x23d)]();
    }
    var pf = document[ux(0x546)](ux(0x318));
    (pf[ux(0x7e1)] = function () {
      const Bj = ux;
      return nR(
        Bj(0x540) + hO[Bj(0x4c5)] + Bj(0xa7a) + hO[Bj(0x7cc)] + Bj(0xa9f)
      );
    }),
      pe(ux(0x22c), ![], ux(0x715), mI),
      pe(ux(0x489), !![], ux(0xdf8)),
      pe(ux(0xb67), !![], ux(0x508)),
      pe(
        ux(0x430),
        !![],
        ux(0xa05),
        (s0) => (kL[ux(0x5c6)][ux(0x50f)] = s0 ? "" : ux(0x5a4))
      ),
      pe(ux(0xd8b), ![], ux(0x1cf)),
      pe(ux(0xab1), ![], ux(0x598)),
      pe(ux(0xbda), ![], ux(0x5a5)),
      pe(ux(0xc85), !![], ux(0xd71)),
      pe(
        ux(0x2d1),
        !![],
        ux(0x85d),
        (s0) => (pf[ux(0x5c6)][ux(0x50f)] = s0 ? "" : ux(0x5a4))
      ),
      pe(ux(0xd35), ![], ux(0xe5e), kU),
      pe(ux(0xe4c), ![], ux(0x864), kY),
      pe(ux(0x2d8), ![], ux(0x274), (s0) => pg(kp, ux(0x8e0), s0)),
      pe(ux(0x2a8), !![], ux(0x9c2), (s0) =>
        pg(document[ux(0x99b)], ux(0xb81), !s0)
      ),
      pe(ux(0x535), !![], ux(0x618), (s0) =>
        pg(document[ux(0x99b)], ux(0x126), !s0)
      ),
      pe(ux(0xd5a), !![], ux(0x43e)),
      pe(ux(0xa41), ![], ux(0x1bc)),
      pe(ux(0x19f), ![], ux(0xc27)),
      pe(ux(0x8d9), ![], ux(0x531)),
      pe(ux(0x221), ![], ux(0x5dd), (s0) => {
        const Bk = ux;
        pg(document[Bk(0x99b)], Bk(0xba5), s0), iC();
      });
    function pg(s0, s1, s2) {
      const Bl = ux;
      s0[Bl(0x292)][s2 ? Bl(0x1ee) : Bl(0xae0)](s1);
    }
    function ph() {
      const Bm = ux,
        s0 = document[Bm(0x546)](Bm(0x130)),
        s1 = [];
      for (let s3 = 0x0; s3 <= 0xa; s3++) {
        s1[Bm(0x9db)](0x1 - s3 * 0.05);
      }
      for (const s4 of s1) {
        const s5 = nR(Bm(0x6a5) + s4 + "\x22>" + nH(s4 * 0x64) + Bm(0x8b0));
        s0[Bm(0xcee)](s5);
      }
      let s2 = parseFloat(hC[Bm(0xc02)]);
      (isNaN(s2) || !s1[Bm(0x584)](s2)) && (s2 = s1[0x0]),
        (s0[Bm(0x1d6)] = s2),
        (kQ = s2),
        (s0[Bm(0x23d)] = function () {
          const Bn = Bm;
          (kQ = parseFloat(this[Bn(0x1d6)])),
            (hC[Bn(0xc02)] = this[Bn(0x1d6)]),
            kY();
        });
    }
    ph();
    var pi = document[ux(0x546)](ux(0x866)),
      pj = document[ux(0x546)](ux(0xd23));
    pj[ux(0xd27)] = cK;
    var pk = document[ux(0x546)](ux(0x4ea));
    function pl(s0) {
      const Bo = ux,
        s1 = nR(Bo(0x3a5));
      km[Bo(0xcee)](s1);
      const s2 = s1[Bo(0x546)](Bo(0xda3));
      s2[Bo(0x1d6)] = s0;
      const s3 = s1[Bo(0x546)](Bo(0x423));
      (s3[Bo(0x23d)] = function () {
        const Bp = Bo;
        s2[Bp(0x171)] = this[Bp(0x7f0)] ? Bp(0xa37) : Bp(0x92f);
      }),
        (s1[Bo(0x546)](Bo(0x336))[Bo(0x8cd)] = function () {
          const Bq = Bo;
          jq(s0), hb(Bq(0xc60));
        }),
        (s1[Bo(0x546)](Bo(0x3ef))[Bo(0x8cd)] = function () {
          const Br = Bo,
            s4 = {};
          s4[Br(0x171)] = Br(0x5e8);
          const s5 = new Blob([s0], s4),
            s6 = document[Br(0x916)]("a");
          (s6[Br(0xa50)] = URL[Br(0xb11)](s5)),
            (s6[Br(0x204)] = (jw ? jw : Br(0x689)) + Br(0x29e)),
            s6[Br(0xd81)](),
            hb(Br(0x424));
        }),
        (s1[Bo(0x546)](Bo(0xc0b))[Bo(0x8cd)] = function () {
          const Bs = Bo;
          s1[Bs(0xae0)]();
        });
    }
    function pm() {
      const Bt = ux,
        s0 = nR(Bt(0xafd));
      km[Bt(0xcee)](s0);
      const s1 = s0[Bt(0x546)](Bt(0xda3)),
        s2 = s0[Bt(0x546)](Bt(0x423));
      (s2[Bt(0x23d)] = function () {
        const Bu = Bt;
        s1[Bu(0x171)] = this[Bu(0x7f0)] ? Bu(0xa37) : Bu(0x92f);
      }),
        (s0[Bt(0x546)](Bt(0xc0b))[Bt(0x8cd)] = function () {
          const Bv = Bt;
          s0[Bv(0xae0)]();
        }),
        (s0[Bt(0x546)](Bt(0x464))[Bt(0x8cd)] = function () {
          const Bw = Bt,
            s3 = s1[Bw(0x1d6)][Bw(0x6da)]();
          if (eU(s3)) {
            delete hC[Bw(0x590)], (hC[Bw(0x57b)] = s3);
            if (hV)
              try {
                hV[Bw(0x5f6)]();
              } catch (s4) {}
            hb(Bw(0x6b7));
          } else hb(Bw(0x993));
        });
    }
    (document[ux(0x546)](ux(0x141))[ux(0x8cd)] = function () {
      const Bx = ux;
      if (i6) {
        pl(i6);
        return;
        const s0 = prompt(Bx(0xdc7), i6);
        if (s0 !== null) {
          const s1 = {};
          s1[Bx(0x171)] = Bx(0x5e8);
          const s2 = new Blob([i6], s1),
            s3 = document[Bx(0x916)]("a");
          (s3[Bx(0xa50)] = URL[Bx(0xb11)](s2)),
            (s3[Bx(0x204)] = jw + Bx(0xad9)),
            s3[Bx(0xd81)](),
            alert(Bx(0x390));
        }
      }
    }),
      (document[ux(0x546)](ux(0x189))[ux(0x8cd)] = function () {
        const By = ux;
        pm();
        return;
        const s0 = prompt(By(0xa9b));
        if (s0 !== null) {
          if (eU(s0)) {
            let s1 = By(0x8cb);
            i7 && (s1 += By(0xd7e));
            if (confirm(s1)) {
              delete hC[By(0x590)], (hC[By(0x57b)] = s0);
              if (hV)
                try {
                  hV[By(0x5f6)]();
                } catch (s2) {}
            }
          } else alert(By(0x993));
        }
      }),
      pe(ux(0x4bd), ![], ux(0x307), (s0) =>
        pj[ux(0x292)][s0 ? ux(0x1ee) : ux(0xae0)](ux(0xa22))
      ),
      pe(ux(0x62a), !![], ux(0x319));
    var pn = 0x0,
      po = 0x0,
      pp = 0x0,
      pq = ![];
    function pr(s0, s1) {
      const Bz = ux;
      (s0 === Bz(0x7d6) || s0 === Bz(0xd1a)) && (pq = s1);
      if (s1) {
        switch (s0) {
          case Bz(0xc62):
            m3[Bz(0x97e)][Bz(0x37a)]();
            break;
          case Bz(0x939):
            m3[Bz(0xc4f)][Bz(0x37a)]();
            break;
          case Bz(0x9b0):
            m3[Bz(0x317)][Bz(0x37a)]();
            break;
          case Bz(0x42c):
            q3[Bz(0x292)][Bz(0x37a)](Bz(0x487));
            break;
          case Bz(0x795):
            pd[Bz(0x22c)](), hb(Bz(0x8c2) + (pc[Bz(0x22c)] ? "ON" : Bz(0xb73)));
            break;
          case Bz(0xa5b):
            pd[Bz(0xa41)](), hb(Bz(0x674) + (pc[Bz(0xa41)] ? "ON" : Bz(0xb73)));
            break;
          case Bz(0xb74):
            pd[Bz(0xd8b)](), hb(Bz(0x17c) + (pc[Bz(0xd8b)] ? "ON" : Bz(0xb73)));
            break;
          case Bz(0x1ba):
            pd[Bz(0xab1)](), hb(Bz(0x511) + (pc[Bz(0xab1)] ? "ON" : Bz(0xb73)));
            break;
          case Bz(0x7d7):
            pd[Bz(0x430)](), hb(Bz(0x59e) + (pc[Bz(0x430)] ? "ON" : Bz(0xb73)));
            break;
          case Bz(0xb77):
            pd[Bz(0xbda)](), hb(Bz(0xb9c) + (pc[Bz(0xbda)] ? "ON" : Bz(0xb73)));
            break;
          case Bz(0xd43):
            if (!mL && hX) {
              const s2 = nA[Bz(0xa26)](Bz(0xcbc)),
                s3 = nB[Bz(0xa26)](Bz(0xcbc));
              for (let s4 = 0x0; s4 < s2[Bz(0xc2f)]; s4++) {
                const s5 = s2[s4],
                  s6 = s3[s4],
                  s7 = n9(s5),
                  s8 = n9(s6);
                if (s7) na(s7, s6);
                else s8 && na(s8, s5);
              }
              im(new Uint8Array([cH[Bz(0x4d4)]]));
            }
            break;
          default:
            if (
              !mL &&
              hX &&
              (s0[Bz(0xdb3)](Bz(0xe64)) || s0[Bz(0xdb3)](Bz(0x294)))
            )
              sg: {
                let s9 = parseInt(
                  s0[Bz(0x320)](s0[Bz(0xdb3)](Bz(0xe64)) ? 0x5 : 0x6)
                );
                if (no[Bz(0x7d7)]) {
                  pq ? kv(s9) : ky(s9);
                  break sg;
                }
                s9 === 0x0 && (s9 = 0xa);
                iO > 0xa && pq && (s9 += 0xa);
                s9--;
                if (s9 >= 0x0) {
                  const sa = nA[Bz(0xa26)](Bz(0xcbc))[s9],
                    sb = nB[Bz(0xa26)](Bz(0xcbc))[s9];
                  if (sa && sb) {
                    const sc = n9(sa),
                      sd = n9(sb);
                    if (sc) na(sc, sb);
                    else sd && na(sd, sa);
                  }
                }
                n8(s9, s9 + iO);
              }
        }
        no[s0] = !![];
      } else
        s0 === Bz(0x2dc) &&
          (kl[Bz(0x5c6)][Bz(0x50f)] === "" &&
          pj[Bz(0x5c6)][Bz(0x50f)] === Bz(0x5a4)
            ? kE[Bz(0xd81)]()
            : pj[Bz(0xb6e)]()),
          delete no[s0];
      if (iz) {
        if (pc[Bz(0x22c)]) {
          let se = 0x0,
            sf = 0x0;
          if (no[Bz(0x5d6)] || no[Bz(0x284)]) sf = -0x1;
          else (no[Bz(0xa23)] || no[Bz(0x9a0)]) && (sf = 0x1);
          if (no[Bz(0x124)] || no[Bz(0x620)]) se = -0x1;
          else (no[Bz(0xe25)] || no[Bz(0x3f4)]) && (se = 0x1);
          if (se !== 0x0 || sf !== 0x0)
            (pn = Math[Bz(0x448)](sf, se)), io(pn, 0x1);
          else (po !== 0x0 || pp !== 0x0) && io(pn, 0x0);
          (po = se), (pp = sf);
        }
        ps();
      }
    }
    function ps() {
      const BA = ux,
        s0 = no[BA(0xb32)] || no[BA(0xd1a)] || no[BA(0x7d6)],
        s1 = no[BA(0xc8e)] || no[BA(0x8e7)],
        s2 = (s0 << 0x1) | s1;
      nb !== s2 && ((nb = s2), im(new Uint8Array([cH[BA(0x8db)], s2])));
    }
    var pt = document[ux(0x546)](ux(0xd92)),
      pu = 0x0,
      pv = 0x0,
      pw = 0x0;
    function px(s0, s1, s2) {
      const BB = ux;
      return s0 + (s1 - s0) * Math[BB(0x585)](0x1, pR / s2);
    }
    var py = 0x1,
      pz = [];
    for (let s0 in cR) {
      if (
        [ux(0xd62), ux(0x323), ux(0x524), ux(0xbe7), ux(0x80b), ux(0x434)][
          ux(0x584)
        ](s0)
      )
        continue;
      pz[ux(0x9db)](cR[s0]);
    }
    var pA = [];
    for (let s1 = 0x0; s1 < 0x1e; s1++) {
      pB();
    }
    function pB(s2 = !![]) {
      const BC = ux,
        s3 = new lH(
          -0x1,
          pz[Math[BC(0xa6f)](Math[BC(0xe0d)]() * pz[BC(0xc2f)])],
          0x0,
          Math[BC(0xe0d)]() * d0,
          Math[BC(0xe0d)]() * 6.28
        );
      if (!s3[BC(0xcbd)] && Math[BC(0xe0d)]() < 0.01) s3[BC(0xadb)] = !![];
      s3[BC(0xcbd)]
        ? (s3[BC(0xa6d)] = s3[BC(0x911)] = Math[BC(0xe0d)]() * 0x8 + 0xc)
        : (s3[BC(0xa6d)] = s3[BC(0x911)] = Math[BC(0xe0d)]() * 0x1e + 0x19),
        s2
          ? (s3["x"] = Math[BC(0xe0d)]() * cZ)
          : (s3["x"] = -s3[BC(0x911)] * 0x2),
        (s3[BC(0x4ed)] =
          (Math[BC(0xe0d)]() * 0x3 + 0x4) * s3[BC(0xa6d)] * 0.02),
        (s3[BC(0x3b4)] = (Math[BC(0xe0d)]() * 0x2 - 0x1) * 0.05),
        pA[BC(0x9db)](s3);
    }
    var pC = 0x0,
      pD = 0x0,
      pE = 0x0,
      pF = 0x0;
    setInterval(function () {
      const BD = ux,
        s2 = [kj, qv, ...Object[BD(0xbe9)](pG), ...nO],
        s3 = s2[BD(0xc2f)];
      let s4 = 0x0;
      for (let s5 = 0x0; s5 < s3; s5++) {
        const s6 = s2[s5];
        s4 += s6[BD(0xb3d)] * s6[BD(0x2a1)];
      }
      kL[BD(0x3b6)](
        BD(0x8ae),
        Math[BD(0x22b)](0x3e8 / pR) +
          BD(0x374) +
          ix[BD(0xc2f)] +
          BD(0xa62) +
          s3 +
          BD(0x4a0) +
          iK(s4) +
          BD(0x692) +
          (pF / 0x3e8)[BD(0xbca)](0x2) +
          BD(0x2bd)
      ),
        (pF = 0x0);
    }, 0x3e8);
    var pG = {};
    function pH(s2, s3, s4, s5, s6, s7 = ![]) {
      const BE = ux;
      if (!pG[s3]) {
        const sa = hw
          ? new OffscreenCanvas(0x1, 0x1)
          : document[BE(0x916)](BE(0xca1));
        (sa[BE(0xd88)] = sa[BE(0x3b7)]("2d")),
          (sa[BE(0xd1f)] = 0x0),
          (sa[BE(0xa59)] = s4),
          (sa[BE(0x48c)] = s5),
          (pG[s3] = sa);
      }
      const s8 = pG[s3],
        s9 = s8[BE(0xd88)];
      if (pQ - s8[BE(0xd1f)] > 0x1f4) {
        s8[BE(0xd1f)] = pQ;
        const sb = s2[BE(0x69e)](),
          sc = Math[BE(0xc3c)](sb["a"], sb["b"]) * 1.5,
          sd = kX * sc,
          se = Math[BE(0xa5e)](s8[BE(0xa59)] * sd) || 0x1;
        se !== s8["w"] &&
          ((s8["w"] = se),
          (s8[BE(0xb3d)] = se),
          (s8[BE(0x2a1)] = Math[BE(0xa5e)](s8[BE(0x48c)] * sd) || 0x1),
          s9[BE(0xa2f)](),
          s9[BE(0x18a)](sd, sd),
          s6(s9),
          s9[BE(0xbec)]());
      }
      s8[BE(0x3ec)] = !![];
      if (s7) return s8;
      s2[BE(0x99f)](
        s8,
        -s8[BE(0xa59)] / 0x2,
        -s8[BE(0x48c)] / 0x2,
        s8[BE(0xa59)],
        s8[BE(0x48c)]
      );
    }
    var pI = /^((?!chrome|android).)*safari/i[ux(0xe5b)](navigator[ux(0x1dc)]),
      pJ = pI ? 0.25 : 0x0;
    function pK(s2, s3, s4 = 0x14, s5 = ux(0x624), s6 = 0x4, s7, s8 = "") {
      const BF = ux,
        s9 = BF(0x437) + s4 + BF(0x823) + iB;
      let sa, sb;
      const sc = s3 + "_" + s9 + "_" + s5 + "_" + s6 + "_" + s8,
        sd = pG[sc];
      if (!sd) {
        s2[BF(0x341)] = s9;
        const se = s2[BF(0xdf1)](s3);
        (sa = se[BF(0xb3d)] + s6), (sb = s4 + s6);
      } else (sa = sd[BF(0xa59)]), (sb = sd[BF(0x48c)]);
      return pH(
        s2,
        sc,
        sa,
        sb,
        function (sf) {
          const BG = BF;
          sf[BG(0x30e)](s6 / 0x2, s6 / 0x2 - sb * pJ),
            (sf[BG(0x341)] = s9),
            (sf[BG(0x290)] = BG(0xc0d)),
            (sf[BG(0xb46)] = BG(0x5c2)),
            (sf[BG(0x71e)] = s6),
            (sf[BG(0x669)] = BG(0x64c)),
            (sf[BG(0x681)] = s5),
            s6 > 0x0 && sf[BG(0xaee)](s3, 0x0, 0x0),
            sf[BG(0xc76)](s3, 0x0, 0x0);
        },
        s7
      );
    }
    var pL = 0x1;
    function pM(s2 = cH[ux(0x186)]) {
      const BH = ux,
        s3 = Object[BH(0xbe9)](oG),
        s4 = new DataView(
          new ArrayBuffer(0x1 + 0x2 + s3[BH(0xc2f)] * (0x2 + 0x4))
        );
      let s5 = 0x0;
      s4[BH(0xe51)](s5++, s2), s4[BH(0x80f)](s5, s3[BH(0xc2f)]), (s5 += 0x2);
      for (let s6 = 0x0; s6 < s3[BH(0xc2f)]; s6++) {
        const s7 = s3[s6];
        s4[BH(0x80f)](s5, s7[BH(0x7e1)]["id"]),
          (s5 += 0x2),
          s4[BH(0x397)](s5, s7[BH(0x1db)]),
          (s5 += 0x4);
      }
      im(s4);
    }
    function pN() {
      const BI = ux;
      om[BI(0xae0)](), oi[BI(0x292)][BI(0xae0)](BI(0xa43)), (om = null);
    }
    var pO = [];
    function pP() {
      const BJ = ux;
      for (let s2 = 0x0; s2 < pO[BJ(0xc2f)]; s2++) {
        const s3 = pO[s2],
          s4 = s3[BJ(0xcc4)],
          s5 = s4 && !s4[BJ(0xe6a)];
        s5
          ? ((s3[BJ(0xe6a)] = ![]),
            (s3[BJ(0xa8a)] = s4[BJ(0xa8a)]),
            (s3[BJ(0x4fb)] = s4[BJ(0x4fb)]),
            (s3[BJ(0x678)] = s4[BJ(0x678)]),
            (s3[BJ(0xa80)] = s4[BJ(0xa80)]),
            (s3[BJ(0x671)] = s4[BJ(0x671)]),
            (s3[BJ(0x11f)] = s4[BJ(0x11f)]),
            (s3[BJ(0xd33)] = s4[BJ(0xd33)]),
            (s3[BJ(0x5ef)] = s4[BJ(0x5ef)]),
            (s3[BJ(0x5a6)] = s4[BJ(0x5a6)]),
            (s3[BJ(0x842)] = s4[BJ(0x842)]),
            (s3[BJ(0x35a)] = s4[BJ(0x35a)]),
            (s3[BJ(0x921)] = s4[BJ(0x921)]),
            (s3[BJ(0x291)] = s4[BJ(0x291)]),
            (s3[BJ(0xa8e)] = s4[BJ(0xa8e)]),
            (s3[BJ(0x8be)] = s4[BJ(0x8be)]),
            j1(s3, s4))
          : ((s3[BJ(0xe6a)] = !![]),
            (s3[BJ(0x839)] = 0x0),
            (s3[BJ(0x4fb)] = 0x1),
            (s3[BJ(0xa8a)] = 0x0),
            (s3[BJ(0x678)] = ![]),
            (s3[BJ(0xa80)] = 0x0),
            (s3[BJ(0x671)] = 0x0),
            (s3[BJ(0xd33)] = px(s3[BJ(0xd33)], 0x0, 0xc8)),
            (s3[BJ(0x11f)] = px(s3[BJ(0x11f)], 0x0, 0xc8)),
            (s3[BJ(0x8be)] = px(s3[BJ(0x8be)], 0x0, 0xc8)));
        if (s2 > 0x0) {
          if (s4) {
            const s6 = Math[BJ(0x448)](s4["y"] - pv, s4["x"] - pu);
            s3[BJ(0x156)] === void 0x0
              ? (s3[BJ(0x156)] = s6)
              : (s3[BJ(0x156)] = f7(s3[BJ(0x156)], s6, 0.1));
          }
          s3[BJ(0x8f9)] += ((s5 ? -0x1 : 0x1) * pR) / 0x320;
          if (s3[BJ(0x8f9)] < 0x0) s3[BJ(0x8f9)] = 0x0;
          s3[BJ(0x8f9)] > 0x1 && pO[BJ(0x8ea)](s2, 0x1);
        }
      }
    }
    var pQ = Date[ux(0xa4a)](),
      pR = 0x0,
      pS = 0x0,
      pT = pQ;
    function pU() {
      const BK = ux;
      (pQ = Date[BK(0xa4a)]()),
        (pR = pQ - pT),
        (pT = pQ),
        (pS = pR / 0x21),
        hc();
      let s2 = 0x0;
      for (let s4 = 0x0; s4 < jY[BK(0xc2f)]; s4++) {
        const s5 = jY[s4];
        if (!s5[BK(0x744)]) jY[BK(0x8ea)](s4, 0x1), s4--;
        else {
          if (
            (s5[BK(0x951)] &&
              !s5[BK(0x951)][BK(0x292)][BK(0x427)](BK(0x695))) ||
            s5[BK(0xe38)][BK(0x5c6)][BK(0x50f)] === BK(0x5a4)
          )
            continue;
          else {
            jY[BK(0x8ea)](s4, 0x1),
              s4--,
              s5[BK(0x292)][BK(0xae0)](BK(0x212)),
              s2++;
            if (s2 >= 0x14) break;
          }
        }
      }
      (pV[BK(0xcc4)] = iz), pP();
      kD[BK(0x292)][BK(0x427)](BK(0x695)) && (lM = pQ);
      if (hu) {
        const s6 = pQ / 0x50,
          s7 = Math[BK(0x12d)](s6) * 0x7,
          s8 = Math[BK(0x372)](Math[BK(0x12d)](s6 / 0x4)) * 0.15 + 0.85;
        ht[BK(0x5c6)][BK(0x14b)] = BK(0x431) + s7 + BK(0x4df) + s8 + ")";
      } else ht[BK(0x5c6)][BK(0x14b)] = BK(0x5a4);
      for (let s9 = jd[BK(0xc2f)] - 0x1; s9 >= 0x0; s9--) {
        const sa = jd[s9];
        if (sa[BK(0xba9)]) {
          jd[BK(0x8ea)](s9, 0x1);
          continue;
        }
        sa[BK(0x138)]();
      }
      for (let sb = nO[BK(0xc2f)] - 0x1; sb >= 0x0; sb--) {
        const sc = nO[sb];
        if (!sc[BK(0x744)]) {
          nO[BK(0x8ea)](sb, 0x1);
          continue;
        }
        sc[BK(0x72c)]();
      }
      for (let sd = jc[BK(0xc2f)] - 0x1; sd >= 0x0; sd--) {
        const se = jc[sd];
        se[BK(0xba9)] &&
          se["t"] <= 0x0 &&
          (se[BK(0xae0)](), jc[BK(0x8ea)](sd, 0x1)),
          (se["t"] += ((se[BK(0xba9)] ? -0x1 : 0x1) * pR) / se[BK(0xcca)]),
          (se["t"] = Math[BK(0x585)](0x1, Math[BK(0x9da)](0x0, se["t"]))),
          se[BK(0x72c)]();
      }
      for (let sf = n3[BK(0xc2f)] - 0x1; sf >= 0x0; sf--) {
        const sg = n3[sf];
        if (!sg["el"][BK(0x744)]) sg[BK(0x127)] = ![];
        (sg[BK(0x373)] += ((sg[BK(0x127)] ? 0x1 : -0x1) * pR) / 0xc8),
          (sg[BK(0x373)] = Math[BK(0x585)](
            0x1,
            Math[BK(0x9da)](sg[BK(0x373)])
          ));
        if (!sg[BK(0x127)] && sg[BK(0x373)] <= 0x0) {
          n3[BK(0x8ea)](sf, 0x1), sg[BK(0xae0)]();
          continue;
        }
        sg[BK(0x5c6)][BK(0x482)] = sg[BK(0x373)];
      }
      if (p2) {
        p3 += pR / 0x7d0;
        if (p3 > 0x1) {
          p3 = 0x0;
          if (p4) {
            p2 = ![];
            const sh = p0[BK(0x368)],
              si = p4[BK(0xc67)];
            if (p4[BK(0x852)] > 0x0)
              ol[BK(0xa40)]((sj) => sj[BK(0x428)]()),
                n6(p0["id"], si),
                (p1 = 0x0),
                p7("?"),
                oi[BK(0x292)][BK(0x1ee)](BK(0xa43)),
                (om = og(sh)),
                oi[BK(0xcee)](om),
                p6(om[BK(0xa4f)], p4[BK(0x852)]),
                (om[BK(0x8cd)] = function () {
                  const BL = BK;
                  n6(sh["id"], p4[BL(0x852)]), pN(), (p4 = null);
                });
            else {
              p1 = si;
              const sj = [...ol][BK(0xcad)](() => Math[BK(0xe0d)]() - 0.5);
              for (let sk = 0x0, sl = sj[BK(0xc2f)]; sk < sl; sk++) {
                const sm = sj[sk];
                sk >= si ? sm[BK(0x428)]() : sm[BK(0xa14)](0x1 - sm[BK(0x1db)]);
              }
              p4 = null;
            }
            p5();
          }
        }
      }
      for (let sn = 0x0; sn < ol[BK(0xc2f)]; sn++) {
        ol[sn][BK(0xb4a)](p3);
      }
      for (let so in nk) {
        const sp = nk[so];
        if (!sp) {
          delete nk[so];
          continue;
        }
        for (let sq = sp[BK(0xc2f)] - 0x1; sq >= 0x0; sq--) {
          const sr = sp[sq];
          sr["t"] += pR;
          if (sr[BK(0x94a)]) sr["t"] > lY && sp[BK(0x8ea)](sq, 0x1);
          else {
            if (sr["t"] > lV) {
              const ss = 0x1 - Math[BK(0x585)](0x1, (sr["t"] - lV) / 0x7d0);
              (sr[BK(0x5c6)][BK(0x482)] = ss),
                ss <= 0x0 && sp[BK(0x8ea)](sq, 0x1);
            }
          }
        }
        sp[BK(0xc2f)] === 0x0 && delete nk[so];
      }
      if (o6)
        sM: {
          if (il()) {
            (o7 += pR),
              (nZ[BK(0x5c6)][BK(0x14b)] =
                BK(0x60a) +
                (Math[BK(0x12d)](Date[BK(0xa4a)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (o7 > 0x3e8) {
              if (o8) {
                pM(cH[BK(0x7d5)]), m2(![]);
                break sM;
              }
              (o6 = ![]),
                (o8 = ![]),
                (o7 = 0x0),
                pM(),
                (oH += oQ),
                oR(),
                oU(),
                m2(![]);
              const st = d4(oI);
              if (st !== iO) {
                const su = st - iO;
                for (let sw = 0x0; sw < iO; sw++) {
                  const sx = nB[BK(0x476)][sw];
                  sx[BK(0x6d6)] += su;
                }
                const sv = nB[BK(0x11b)][BK(0x6d6)] + 0x1;
                for (let sy = 0x0; sy < su; sy++) {
                  const sz = nR(BK(0xaef));
                  (sz[BK(0x6d6)] = iO + sy), nA[BK(0xcee)](sz);
                  const sA = nR(BK(0xaef));
                  (sA[BK(0x6d6)] = sv + sy),
                    sA[BK(0xcee)](
                      nR(BK(0x815) + ((sz[BK(0x6d6)] + 0x1) % 0xa) + BK(0x41f))
                    ),
                    nB[BK(0xcee)](sA);
                }
                (iO = st), (iP = iO * 0x2);
              }
            }
          } else (o6 = ![]), (o8 = ![]), (o7 = 0x0);
        }
      (oP = px(oP, oN, 0x64)),
        (oO = px(oO, oM, 0x64)),
        (o2[BK(0x5c6)][BK(0xb3d)] = oP * 0x64 + "%"),
        (o3[BK(0x5c6)][BK(0xb3d)] = oO * 0x64 + "%");
      for (let sB in pG) {
        !pG[sB][BK(0x3ec)] ? delete pG[sB] : (pG[sB][BK(0x3ec)] = ![]);
      }
      (nc = px(nc, ne, 0x32)), (nd = px(nd, nf, 0x32));
      const s3 = Math[BK(0x585)](0x64, pR) / 0x3c;
      pX -= 0x3 * s3;
      for (let sC = pA[BK(0xc2f)] - 0x1; sC >= 0x0; sC--) {
        const sD = pA[sC];
        (sD["x"] += sD[BK(0x4ed)] * s3),
          (sD["y"] += Math[BK(0x12d)](sD[BK(0xa8e)] * 0x2) * 0.8 * s3),
          (sD[BK(0xa8e)] += sD[BK(0x3b4)] * s3),
          (sD[BK(0x291)] += 0.002 * pR),
          (sD[BK(0x523)] = !![]);
        const sE = sD[BK(0x911)] * 0x2;
        (sD["x"] >= cZ + sE || sD["y"] < -sE || sD["y"] >= d0 + sE) &&
          (pA[BK(0x8ea)](sC, 0x1), pB(![]));
      }
      for (let sF = 0x0; sF < iH[BK(0xc2f)]; sF++) {
        iH[sF][BK(0x72c)]();
      }
      pw = Math[BK(0x9da)](0x0, pw - pR / 0x12c);
      if (pc[BK(0x489)] && pw > 0x0) {
        const sG = Math[BK(0xe0d)]() * 0x2 * Math["PI"],
          sH = pw * 0x3;
        (qL = Math[BK(0x65c)](sG) * sH), (qM = Math[BK(0x12d)](sG) * sH);
      } else (qL = 0x0), (qM = 0x0);
      (py = px(py, pL, 0xc8)), (nh = px(nh, ng, 0x64));
      for (let sI = mK[BK(0xc2f)] - 0x1; sI >= 0x0; sI--) {
        const sJ = mK[sI];
        sJ[BK(0x72c)](), sJ[BK(0x9ec)] && mK[BK(0x8ea)](sI, 0x1);
      }
      for (let sK = ix[BK(0xc2f)] - 0x1; sK >= 0x0; sK--) {
        const sL = ix[sK];
        sL[BK(0x72c)](),
          sL[BK(0xe6a)] && sL[BK(0x839)] > 0x1 && ix[BK(0x8ea)](sK, 0x1);
      }
      iz && ((pu = iz["x"]), (pv = iz["y"])), qJ(), window[BK(0x746)](pU);
    }
    var pV = pW();
    function pW() {
      const BM = ux,
        s2 = new lU(-0x1, 0x0, 0x0, 0x0, 0x1, cX[BM(0x72f)], 0x19);
      return (s2[BM(0x8f9)] = 0x1), s2;
    }
    var pX = 0x0,
      pY = [ux(0x716), ux(0x296), ux(0xd9e)],
      pZ = [];
    for (let s2 = 0x0; s2 < 0x3; s2++) {
      for (let s3 = 0x0; s3 < 0x3; s3++) {
        const s4 = q0(pY[s2], 0x1 - 0.05 * s3);
        pZ[ux(0x9db)](s4);
      }
    }
    function q0(s5, s6) {
      const BN = ux;
      return q1(hz(s5)[BN(0xe56)]((s7) => s7 * s6));
    }
    function q1(s5) {
      const BO = ux;
      return s5[BO(0xe1d)](
        (s6, s7) => s6 + parseInt(s7)[BO(0x3de)](0x10)[BO(0x8a7)](0x2, "0"),
        "#"
      );
    }
    function q2(s5) {
      const BP = ux;
      return BP(0x7eb) + s5[BP(0xbc0)](",") + ")";
    }
    var q3 = document[ux(0x546)](ux(0xa3f));
    function q4() {
      const BQ = ux,
        s5 = document[BQ(0x916)](BQ(0xca1));
      s5[BQ(0xb3d)] = s5[BQ(0x2a1)] = 0x3;
      const s6 = s5[BQ(0x3b7)]("2d");
      for (let s7 = 0x0; s7 < pZ[BQ(0xc2f)]; s7++) {
        const s8 = s7 % 0x3,
          s9 = (s7 - s8) / 0x3;
        (s6[BQ(0x681)] = pZ[s7]), s6[BQ(0xa46)](s8, s9, 0x1, 0x1);
        const sa = j8[s7],
          sb = j9[s7],
          sc = nR(
            BQ(0x56a) +
              sb +
              BQ(0xb39) +
              ((s9 + 0.5) / 0x3) * 0x64 +
              BQ(0xb97) +
              ((s8 + 0.5) / 0x3) * 0x64 +
              BQ(0x1f5) +
              sa +
              BQ(0xbc5)
          );
        q3[BQ(0x1c4)](sc, q3[BQ(0x476)][0x0]);
      }
      q3[BQ(0x5c6)][BQ(0x76c)] = BQ(0x233) + s5[BQ(0x7db)]() + ")";
    }
    q4();
    var q5 = document[ux(0x546)](ux(0x133)),
      q6 = document[ux(0x546)](ux(0xafa));
    function q7(s5, s6, s7) {
      const BR = ux;
      (s5[BR(0x5c6)][BR(0x5c2)] = (s6 / j3) * 0x64 + "%"),
        (s5[BR(0x5c6)][BR(0xc0d)] = (s7 / j3) * 0x64 + "%");
    }
    function q8() {
      const BS = ux,
        s5 = qO(),
        s6 = cZ / 0x2 / s5,
        s7 = d0 / 0x2 / s5,
        s8 = j5,
        s9 = Math[BS(0x9da)](0x0, Math[BS(0xa6f)]((pu - s6) / s8) - 0x1),
        sa = Math[BS(0x9da)](0x0, Math[BS(0xa6f)]((pv - s7) / s8) - 0x1),
        sb = Math[BS(0x585)](j6 - 0x1, Math[BS(0xa5e)]((pu + s6) / s8)),
        sc = Math[BS(0x585)](j6 - 0x1, Math[BS(0xa5e)]((pv + s7) / s8));
      kk[BS(0xa2f)](), kk[BS(0x18a)](s8, s8), kk[BS(0xc0e)]();
      for (let sd = s9; sd <= sb + 0x1; sd++) {
        kk[BS(0x4a6)](sd, sa), kk[BS(0xa7c)](sd, sc + 0x1);
      }
      for (let se = sa; se <= sc + 0x1; se++) {
        kk[BS(0x4a6)](s9, se), kk[BS(0xa7c)](sb + 0x1, se);
      }
      kk[BS(0xbec)]();
      for (let sf = s9; sf <= sb; sf++) {
        for (let sg = sa; sg <= sc; sg++) {
          kk[BS(0xa2f)](),
            kk[BS(0x30e)]((sf + 0.5) * s8, (sg + 0.5) * s8),
            pK(kk, sf + "," + sg, 0x28, BS(0x624), 0x6),
            kk[BS(0xbec)]();
        }
      }
      (kk[BS(0x669)] = BS(0x3ee)),
        (kk[BS(0x71e)] = 0xa),
        (kk[BS(0xb0f)] = BS(0x22b)),
        kk[BS(0x8ae)]();
    }
    function q9(s5, s6) {
      const BT = ux,
        s7 = nR(BT(0x23e) + s5 + BT(0xcf4) + s6 + BT(0x10e)),
        s8 = s7[BT(0x546)](BT(0x735));
      return (
        kn[BT(0xcee)](s7),
        (s7[BT(0xb91)] = function (s9) {
          const BU = BT;
          s9 > 0x0 && s9 !== 0x1
            ? (s8[BU(0x3b6)](BU(0x5c6), BU(0x554) + s9 * 0x168 + BU(0x33a)),
              s7[BU(0x292)][BU(0x1ee)](BU(0x695)))
            : s7[BU(0x292)][BU(0xae0)](BU(0x695));
        }),
        kn[BT(0x1c4)](s7, q3),
        s7
      );
    }
    var qa = q9(ux(0xcba), ux(0x1a0));
    qa[ux(0x292)][ux(0x1ee)](ux(0xc0d));
    var qb = nR(ux(0x92a) + hO[ux(0x65e)] + ux(0x2c6));
    qa[ux(0x476)][0x0][ux(0xcee)](qb);
    var qc = q9(ux(0x781), ux(0x5ae)),
      qd = q9(ux(0xa13), ux(0x599));
    qd[ux(0x292)][ux(0x1ee)](ux(0x63b));
    var qe = ux(0xaf4),
      qf = 0x2bc,
      qg = new lU("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cX[ux(0x72f)], 0x19);
    qg[ux(0xa8a)] = 0x0;
    var qh = [
      [ux(0xd50), ux(0x8fd)],
      [ux(0x78e), ux(0xd1e)],
      [ux(0xe30), ux(0xb1b)],
      [ux(0xa7b), ux(0x405), ux(0xb70)],
      [ux(0x668), ux(0x7d0)],
      [ux(0x8af), ux(0x9e8)],
      [ux(0x9f9), ux(0x243)],
    ];
    function qi() {
      const BV = ux;
      let s5 = "";
      const s6 = qh[BV(0xc2f)] - 0x1;
      for (let s7 = 0x0; s7 < s6; s7++) {
        const s8 = qh[s7][0x0];
        (s5 += s8),
          s7 === s6 - 0x1
            ? (s5 += BV(0x804) + qh[s7 + 0x1][0x0] + ".")
            : (s5 += ",\x20");
      }
      return s5;
    }
    var qj = qi(),
      qk = document[ux(0x546)](ux(0xba8));
    (qk[ux(0x7e1)] = function () {
      const BW = ux;
      return nR(
        BW(0x20f) +
          hO[BW(0xde5)] +
          BW(0x593) +
          hO[BW(0x7cc)] +
          BW(0xb84) +
          hO[BW(0x4c5)] +
          BW(0xb43) +
          qj +
          BW(0x979)
      );
    }),
      (qk[ux(0x471)] = !![]);
    var ql =
      Date[ux(0xa4a)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[ux(0xa6f)](Math[ux(0xe0d)]() * qh[ux(0xc2f)]);
    function qm() {
      const BX = ux,
        s5 = qh[ql];
      (qg[BX(0x5ef)] = s5[0x0]), (qg[BX(0x112)] = s5[0x1]);
      for (let s6 of j0) {
        qg[s6] = Math[BX(0xe0d)]() > 0.5;
      }
      ql = (ql + 0x1) % qh[BX(0xc2f)];
    }
    qm(),
      (qk[ux(0x8cd)] = function () {
        const BY = ux;
        window[BY(0x258)](qg[BY(0x112)], BY(0x501)), qm();
      });
    var qn = new lU(ux(0x34d), 0x0, -0x19, 0x0, 0x1, cX[ux(0x72f)], 0x19);
    (qn[ux(0xa8a)] = 0x0), (qn[ux(0x281)] = !![]);
    var qo = [
        ux(0xa93),
        ux(0xb4c),
        ux(0xd26),
        ux(0x3e8),
        ux(0x3f5),
        ux(0x854),
        ux(0xc4c),
      ],
      qp = [
        ux(0xcdd),
        ux(0xbff),
        ux(0x4b6),
        ux(0x659),
        ux(0xbd3),
        ux(0xb88),
        ux(0x136),
        ux(0x9f0),
      ],
      qq = 0x0;
    function qr() {
      const BZ = ux,
        s5 = {};
      (s5[BZ(0xa37)] = qo[qq % qo[BZ(0xc2f)]]),
        (s5[BZ(0x94a)] = !![]),
        (s5[BZ(0xe14)] = nj["me"]),
        nn(BZ(0x34d), s5),
        nn("yt", {
          text: qp[qq % qp[BZ(0xc2f)]][BZ(0xbb7)](
            BZ(0xc6c),
            kF[BZ(0x1d6)][BZ(0x6da)]() || BZ(0x348)
          ),
          isFakeChat: !![],
          col: nj["me"],
        }),
        qq++;
    }
    qr(), setInterval(qr, 0xfa0);
    var qs = 0x0,
      qt = Math[ux(0xa5e)](
        (Math[ux(0x9da)](screen[ux(0xb3d)], screen[ux(0x2a1)], kV(), kW()) *
          window[ux(0x630)]) /
          0xc
      ),
      qu = new lU(-0x1, 0x0, 0x0, 0x0, 0x1, cX[ux(0x649)], 0x19);
    (qu[ux(0xe6a)] = !![]), (qu[ux(0x4fb)] = 0x1), (qu[ux(0x18a)] = 0.6);
    var qv = (function () {
        const C0 = ux,
          s5 = document[C0(0x916)](C0(0xca1)),
          s6 = qt * 0x2;
        (s5[C0(0xb3d)] = s5[C0(0x2a1)] = s6),
          (s5[C0(0x5c6)][C0(0xb3d)] = s5[C0(0x5c6)][C0(0x2a1)] = C0(0xba6));
        const s7 = document[C0(0x546)](C0(0xc29));
        s7[C0(0xcee)](s5);
        const s8 = s5[C0(0x3b7)]("2d");
        return (
          (s5[C0(0x7ec)] = function () {
            const C1 = C0;
            (qu[C1(0xadb)] = ![]),
              s8[C1(0x2d4)](0x0, 0x0, s6, s6),
              s8[C1(0xa2f)](),
              s8[C1(0xa60)](s6 / 0x64),
              s8[C1(0x30e)](0x32, 0x32),
              s8[C1(0xa60)](0.8),
              s8[C1(0x568)](-Math["PI"] / 0x8),
              qu[C1(0xaff)](s8),
              s8[C1(0xbec)]();
          }),
          s5
        );
      })(),
      qw,
      qx,
      qy,
      qz = ![];
    function qA() {
      const C2 = ux;
      if (qz) return;
      (qz = !![]), iC();
      const s5 = qE(qt);
      qy = s5[C2(0x7db)](C2(0x92b));
      const s6 = qw * 0x64 + "%\x20" + qx * 0x64 + C2(0x862),
        s7 = nR(
          C2(0xa21) +
            hP[C2(0xe56)](
              (s8, s9) => C2(0x1a4) + s9 + C2(0x1f3) + s8 + C2(0x7ce)
            )[C2(0xbc0)]("\x0a") +
            C2(0x1ae) +
            nE[C2(0x3ae)] +
            C2(0x44c) +
            nE[C2(0x5df)] +
            C2(0xc34) +
            nE[C2(0xd14)] +
            C2(0x9e1) +
            dG +
            C2(0x73a) +
            qy +
            C2(0x5ea) +
            s6 +
            C2(0x777) +
            s6 +
            C2(0xe33) +
            s6 +
            C2(0x7ff) +
            s6 +
            C2(0xd40)
        );
      document[C2(0x99b)][C2(0xcee)](s7);
    }
    function qB(s5) {
      const C3 = ux,
        s6 =
          -s5[C3(0xd1c)]["x"] * 0x64 +
          "%\x20" +
          -s5[C3(0xd1c)]["y"] * 0x64 +
          "%";
      return (
        C3(0x9d2) +
        s6 +
        C3(0x748) +
        s6 +
        C3(0x49f) +
        s6 +
        C3(0x996) +
        s6 +
        ";\x22"
      );
    }
    if (document[ux(0x40d)] && document[ux(0x40d)][ux(0x5bc)]) {
      const s5 = setTimeout(qA, 0x1f40);
      document[ux(0x40d)][ux(0x5bc)][ux(0xc15)](() => {
        const C4 = ux;
        console[C4(0x8b7)](C4(0x2d6)), clearTimeout(s5), qA();
      });
    } else qA();
    var qC = [];
    qD();
    function qD() {
      const C5 = ux,
        s6 = {};
      (qw = 0xf), (qC = []);
      let s7 = 0x0;
      for (let s9 = 0x0; s9 < dB[C5(0xc2f)]; s9++) {
        const sa = dB[s9],
          sb = C5(0x344) + sa[C5(0x5ee)] + "_" + (sa[C5(0x1db)] || 0x1),
          sc = s6[sb];
        if (sc === void 0x0) (sa[C5(0xd1c)] = s6[sb] = s8()), qC[C5(0x9db)](sa);
        else {
          sa[C5(0xd1c)] = sc;
          continue;
        }
      }
      for (let sd = 0x0; sd < eJ[C5(0xc2f)]; sd++) {
        const se = eJ[sd],
          sf = C5(0x3f2) + se[C5(0x5ee)],
          sg = s6[sf];
        if (sg === void 0x0) se[C5(0xd1c)] = s6[sf] = s8();
        else {
          se[C5(0xd1c)] = sg;
          continue;
        }
      }
      function s8() {
        const C6 = C5;
        return { x: s7 % qw, y: Math[C6(0xa6f)](s7 / qw), index: s7++ };
      }
    }
    function qE(s6) {
      const C7 = ux,
        s7 = qC[C7(0xc2f)] + eK;
      qx = Math[C7(0xa5e)](s7 / qw);
      const s8 = document[C7(0x916)](C7(0xca1));
      (s8[C7(0xb3d)] = s6 * qw), (s8[C7(0x2a1)] = s6 * qx);
      const s9 = s8[C7(0x3b7)]("2d"),
        sa = 0x5a,
        sb = sa / 0x2,
        sc = s6 / sa;
      s9[C7(0x18a)](sc, sc), s9[C7(0x30e)](sb, sb);
      for (let sd = 0x0; sd < qC[C7(0xc2f)]; sd++) {
        const se = qC[sd];
        s9[C7(0xa2f)](),
          s9[C7(0x30e)](se[C7(0xd1c)]["x"] * sa, se[C7(0xd1c)]["y"] * sa),
          s9[C7(0xa2f)](),
          s9[C7(0x30e)](0x0 + se[C7(0xca5)], -0x5 + se[C7(0x87f)]),
          se[C7(0x114)](s9),
          s9[C7(0xbec)](),
          (s9[C7(0x681)] = C7(0x624)),
          (s9[C7(0xb46)] = C7(0x63b)),
          (s9[C7(0x290)] = C7(0xc97)),
          (s9[C7(0x341)] = C7(0x9f7) + iB),
          (s9[C7(0x71e)] = h4 ? 0x5 : 0x3),
          (s9[C7(0x669)] = C7(0x8d7)),
          (s9[C7(0xb0f)] = s9[C7(0x9ed)] = C7(0x22b)),
          s9[C7(0x30e)](0x0, sb - 0x8 - s9[C7(0x71e)]);
        let sf = se[C7(0x5ee)];
        h4 && (sf = h6(sf));
        const sg = s9[C7(0xdf1)](sf)[C7(0xb3d)] + s9[C7(0x71e)],
          sh = Math[C7(0x585)](0x4c / sg, 0x1);
        s9[C7(0x18a)](sh, sh),
          s9[C7(0xaee)](sf, 0x0, 0x0),
          s9[C7(0xc76)](sf, 0x0, 0x0),
          s9[C7(0xbec)]();
      }
      for (let si = 0x0; si < eK; si++) {
        const sj = eJ[si];
        s9[C7(0xa2f)](),
          s9[C7(0x30e)](sj[C7(0xd1c)]["x"] * sa, sj[C7(0xd1c)]["y"] * sa),
          sj[C7(0x265)] !== void 0x0 &&
            (s9[C7(0xc0e)](), s9[C7(0x8b6)](-sb, -sb, sa, sa), s9[C7(0x173)]()),
          s9[C7(0x30e)](sj[C7(0xca5)], sj[C7(0x87f)]),
          sj[C7(0x114)](s9),
          s9[C7(0xbec)]();
      }
      return s8;
    }
    var qF = new lH(-0x1, cR[ux(0x238)], 0x0, 0x0, Math[ux(0xe0d)]() * 6.28);
    qF[ux(0x911)] = 0x32;
    function qG() {
      const C8 = ux;
      kk[C8(0x878)](j3 / 0x2, j3 / 0x2, j3 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qH(s6) {
      const C9 = ux,
        s7 = s6[C9(0xc2f)],
        s8 = document[C9(0x916)](C9(0xca1));
      s8[C9(0xb3d)] = s8[C9(0x2a1)] = s7;
      const s9 = s8[C9(0x3b7)]("2d"),
        sa = s9[C9(0xe36)](s7, s7);
      for (let sb = 0x0; sb < s7; sb++) {
        for (let sc = 0x0; sc < s7; sc++) {
          const sd = s6[sb][sc];
          if (!sd) continue;
          const se = (sb * s7 + sc) * 0x4;
          sa[C9(0xe4b)][se + 0x3] = 0xff;
        }
      }
      return s9[C9(0xb26)](sa, 0x0, 0x0), s8;
    }
    function qI() {
      const Ca = ux;
      if (!jL) return;
      kk[Ca(0xa2f)](),
        kk[Ca(0xc0e)](),
        qG(),
        kk[Ca(0x173)](),
        !jL[Ca(0xca1)] && (jL[Ca(0xca1)] = qH(jL)),
        (kk[Ca(0x70c)] = ![]),
        (kk[Ca(0xae3)] = 0.08),
        kk[Ca(0x99f)](jL[Ca(0xca1)], 0x0, 0x0, j3, j3),
        kk[Ca(0xbec)]();
    }
    function qJ() {
      const Cb = ux;
      lN = 0x0;
      const s6 = kS * kX;
      qs = 0x0;
      for (let sb = 0x0; sb < nO[Cb(0xc2f)]; sb++) {
        const sc = nO[sb];
        sc[Cb(0xdcf)] && sc[Cb(0x7ec)]();
      }
      if (
        kl[Cb(0x5c6)][Cb(0x50f)] === "" ||
        document[Cb(0x99b)][Cb(0x292)][Cb(0x427)](Cb(0x50a))
      ) {
        (kk[Cb(0x681)] = Cb(0x716)),
          kk[Cb(0xa46)](0x0, 0x0, kj[Cb(0xb3d)], kj[Cb(0x2a1)]),
          kk[Cb(0xa2f)]();
        let sd = Math[Cb(0x9da)](kj[Cb(0xb3d)] / cZ, kj[Cb(0x2a1)] / d0);
        kk[Cb(0x18a)](sd, sd),
          kk[Cb(0x8b6)](0x0, 0x0, cZ, d0),
          kk[Cb(0xa2f)](),
          kk[Cb(0x30e)](pX, -pX),
          kk[Cb(0x18a)](1.25, 1.25),
          (kk[Cb(0x681)] = kZ),
          kk[Cb(0x615)](),
          kk[Cb(0xbec)]();
        for (let se = 0x0; se < pA[Cb(0xc2f)]; se++) {
          pA[se][Cb(0xaff)](kk);
        }
        kk[Cb(0xbec)]();
        if (pc[Cb(0x2d1)] && pf[Cb(0xbab)] > 0x0) {
          const sf = pf[Cb(0xd0e)]();
          kk[Cb(0xa2f)]();
          let sg = kX;
          kk[Cb(0x18a)](sg, sg),
            kk[Cb(0x30e)](
              sf["x"] + sf[Cb(0xb3d)] / 0x2,
              sf["y"] + sf[Cb(0x2a1)]
            ),
            kk[Cb(0xa60)](kS * 0.8),
            qn[Cb(0xaff)](kk),
            kk[Cb(0x18a)](0.7, 0.7),
            qn[Cb(0x4a3)](kk),
            kk[Cb(0xbec)]();
        }
        if (qk[Cb(0xbab)] > 0x0) {
          const sh = qk[Cb(0xd0e)]();
          kk[Cb(0xa2f)]();
          let si = kX;
          kk[Cb(0x18a)](si, si),
            kk[Cb(0x30e)](
              sh["x"] + sh[Cb(0xb3d)] / 0x2,
              sh["y"] + sh[Cb(0x2a1)] * 0.6
            ),
            kk[Cb(0xa60)](kS * 0.8),
            qg[Cb(0xaff)](kk),
            kk[Cb(0xa60)](0.7),
            kk[Cb(0xa2f)](),
            kk[Cb(0x30e)](0x0, -qg[Cb(0x911)] - 0x23),
            pK(kk, qg[Cb(0x5ef)], 0x12, Cb(0x624), 0x3),
            kk[Cb(0xbec)](),
            qg[Cb(0x4a3)](kk),
            kk[Cb(0xbec)]();
        }
        if (hl[Cb(0xbab)] > 0x0) {
          const sj = hl[Cb(0xd0e)]();
          kk[Cb(0xa2f)]();
          let sk = kX;
          kk[Cb(0x18a)](sk, sk),
            kk[Cb(0x30e)](
              sj["x"] + sj[Cb(0xb3d)] / 0x2,
              sj["y"] + sj[Cb(0x2a1)] * 0.5
            ),
            kk[Cb(0xa60)](kS),
            qF[Cb(0xaff)](kk),
            kk[Cb(0xbec)]();
        }
        return;
      }
      if (jz)
        (kk[Cb(0x681)] = pZ[0x0]),
          kk[Cb(0xa46)](0x0, 0x0, kj[Cb(0xb3d)], kj[Cb(0x2a1)]);
      else {
        kk[Cb(0xa2f)](), qN();
        for (let sl = -0x1; sl < 0x4; sl++) {
          for (let sm = -0x1; sm < 0x4; sm++) {
            const sn = Math[Cb(0x9da)](0x0, Math[Cb(0x585)](sm, 0x2)),
              so = Math[Cb(0x9da)](0x0, Math[Cb(0x585)](sl, 0x2));
            (kk[Cb(0x681)] = pZ[so * 0x3 + sn]),
              kk[Cb(0xa46)](sm * j4, sl * j4, j4, j4);
          }
        }
        kk[Cb(0xc0e)](),
          kk[Cb(0x8b6)](0x0, 0x0, j3, j3),
          kk[Cb(0x173)](),
          kk[Cb(0xc0e)](),
          kk[Cb(0x4a6)](-0xa, j4),
          kk[Cb(0xa7c)](j4 * 0x2, j4),
          kk[Cb(0x4a6)](j4 * 0x2, j4 * 0.5),
          kk[Cb(0xa7c)](j4 * 0x2, j4 * 1.5),
          kk[Cb(0x4a6)](j4 * 0x1, j4 * 0x2),
          kk[Cb(0xa7c)](j3 + 0xa, j4 * 0x2),
          kk[Cb(0x4a6)](j4, j4 * 1.5),
          kk[Cb(0xa7c)](j4, j4 * 2.5),
          (kk[Cb(0x71e)] = qf * 0x2),
          (kk[Cb(0xb0f)] = Cb(0x22b)),
          (kk[Cb(0x669)] = qe),
          kk[Cb(0x8ae)](),
          kk[Cb(0xbec)]();
      }
      kk[Cb(0xa2f)](),
        kk[Cb(0xc0e)](),
        kk[Cb(0x8b6)](0x0, 0x0, kj[Cb(0xb3d)], kj[Cb(0x2a1)]),
        qN();
      pc[Cb(0xd5a)] && ((kk[Cb(0x681)] = kZ), kk[Cb(0x615)]());
      kk[Cb(0xc0e)]();
      jz ? qG() : kk[Cb(0x8b6)](0x0, 0x0, j3, j3);
      kk[Cb(0xbec)](),
        kk[Cb(0x8b6)](0x0, 0x0, kj[Cb(0xb3d)], kj[Cb(0x2a1)]),
        (kk[Cb(0x681)] = qe),
        kk[Cb(0x615)](Cb(0x188)),
        kk[Cb(0xa2f)](),
        qN();
      pc[Cb(0xab1)] && q8();
      qI();
      const s7 = [];
      let s8 = [];
      for (let sp = 0x0; sp < ix[Cb(0xc2f)]; sp++) {
        const sq = ix[sp];
        if (sq[Cb(0xd6f)]) {
          if (iz) {
            if (
              pQ - sq[Cb(0xe7a)] < 0x3e8 ||
              Math[Cb(0xc3c)](sq["nx"] - iz["x"], sq["ny"] - iz["y"]) <
                Math[Cb(0xc3c)](sq["ox"] - iz["x"], sq["oy"] - iz["y"])
            ) {
              s7[Cb(0x9db)](sq), (sq[Cb(0xe7a)] = pQ);
              continue;
            }
          }
        }
        sq !== iz && s8[Cb(0x9db)](sq);
      }
      (s8 = qK(s8, (sr) => sr[Cb(0x171)] === cR[Cb(0x80b)])),
        (s8 = qK(s8, (sr) => sr[Cb(0x171)] === cR[Cb(0xbe7)])),
        (s8 = qK(s8, (sr) => sr[Cb(0x171)] === cR[Cb(0x434)])),
        (s8 = qK(s8, (sr) => sr[Cb(0x970)])),
        (s8 = qK(s8, (sr) => sr[Cb(0x160)])),
        (s8 = qK(s8, (sr) => sr[Cb(0xcbd)] && !sr[Cb(0xa29)])),
        (s8 = qK(s8, (sr) => !sr[Cb(0xa29)])),
        qK(s8, (sr) => !![]);
      iz && iz[Cb(0xaff)](kk);
      for (let sr = 0x0; sr < s7[Cb(0xc2f)]; sr++) {
        s7[sr][Cb(0xaff)](kk);
      }
      if (pc[Cb(0xd8b)]) {
        kk[Cb(0xc0e)]();
        for (let ss = 0x0; ss < ix[Cb(0xc2f)]; ss++) {
          const st = ix[ss];
          if (st[Cb(0xe6a)]) continue;
          if (st[Cb(0x7e9)]) {
            kk[Cb(0xa2f)](),
              kk[Cb(0x30e)](st["x"], st["y"]),
              kk[Cb(0x568)](st[Cb(0xa8e)]);
            if (!st[Cb(0x54b)])
              kk[Cb(0x8b6)](-st[Cb(0x911)], -0xa, st[Cb(0x911)] * 0x2, 0x14);
            else {
              kk[Cb(0x4a6)](-st[Cb(0x911)], -0xa),
                kk[Cb(0xa7c)](-st[Cb(0x911)], 0xa);
              const su = 0xa + st[Cb(0x54b)] * st[Cb(0x911)] * 0x2;
              kk[Cb(0xa7c)](st[Cb(0x911)], su),
                kk[Cb(0xa7c)](st[Cb(0x911)], -su),
                kk[Cb(0xa7c)](-st[Cb(0x911)], -0xa);
            }
            kk[Cb(0xbec)]();
          } else
            kk[Cb(0x4a6)](st["x"] + st[Cb(0x911)], st["y"]),
              kk[Cb(0x878)](st["x"], st["y"], st[Cb(0x911)], 0x0, l1);
        }
        (kk[Cb(0x71e)] = 0x2), (kk[Cb(0x669)] = Cb(0xd14)), kk[Cb(0x8ae)]();
      }
      const s9 = pc[Cb(0xbda)] ? 0x1 / qP() : 0x1;
      for (let sv = 0x0; sv < ix[Cb(0xc2f)]; sv++) {
        const sw = ix[sv];
        !sw[Cb(0xcbd)] && sw[Cb(0x523)] && lZ(sw, kk, s9);
      }
      for (let sx = 0x0; sx < ix[Cb(0xc2f)]; sx++) {
        const sy = ix[sx];
        sy[Cb(0x980)] && sy[Cb(0x4a3)](kk, s9);
      }
      const sa = pR / 0x12;
      kk[Cb(0xa2f)](),
        (kk[Cb(0x71e)] = 0x7),
        (kk[Cb(0x669)] = Cb(0x624)),
        (kk[Cb(0xb0f)] = kk[Cb(0x9ed)] = Cb(0x88b));
      for (let sz = iG[Cb(0xc2f)] - 0x1; sz >= 0x0; sz--) {
        const sA = iG[sz];
        sA["a"] -= pR / 0x1f4;
        if (sA["a"] <= 0x0) {
          iG[Cb(0x8ea)](sz, 0x1);
          continue;
        }
        (kk[Cb(0xae3)] = sA["a"]), kk[Cb(0x8ae)](sA[Cb(0xe70)]);
      }
      kk[Cb(0xbec)]();
      if (pc[Cb(0xb67)])
        for (let sB = iA[Cb(0xc2f)] - 0x1; sB >= 0x0; sB--) {
          const sC = iA[sB];
          (sC["x"] += sC["vx"] * sa),
            (sC["y"] += sC["vy"] * sa),
            (sC["vy"] += 0.35 * sa);
          if (sC["vy"] > 0xa) {
            iA[Cb(0x8ea)](sB, 0x1);
            continue;
          }
          kk[Cb(0xa2f)](),
            kk[Cb(0x30e)](sC["x"], sC["y"]),
            (kk[Cb(0xae3)] = 0x1 - Math[Cb(0x9da)](0x0, sC["vy"] / 0xa)),
            kk[Cb(0x18a)](sC[Cb(0x911)], sC[Cb(0x911)]),
            sC[Cb(0xa37)] !== void 0x0
              ? pK(kk, sC[Cb(0xa37)], 0x15, Cb(0xd73), 0x2, ![], sC[Cb(0x911)])
              : (kk[Cb(0x568)](sC[Cb(0xa8e)]),
                pH(kk, Cb(0x5af) + sC[Cb(0x911)], 0x1e, 0x1e, function (sD) {
                  const Cc = Cb;
                  sD[Cc(0x30e)](0xf, 0xf), nC(sD);
                })),
            kk[Cb(0xbec)]();
        }
      kk[Cb(0xbec)]();
      if (iz && pc[Cb(0xc85)] && !pc[Cb(0x22c)]) {
        kk[Cb(0xa2f)](),
          kk[Cb(0x30e)](kj[Cb(0xb3d)] / 0x2, kj[Cb(0x2a1)] / 0x2),
          kk[Cb(0x568)](Math[Cb(0x448)](nd, nc)),
          kk[Cb(0x18a)](s6, s6);
        const sD = 0x28;
        let sE = Math[Cb(0xc3c)](nc, nd) / kS;
        kk[Cb(0xc0e)](),
          kk[Cb(0x4a6)](sD, 0x0),
          kk[Cb(0xa7c)](sE, 0x0),
          kk[Cb(0xa7c)](sE + -0x14, -0x14),
          kk[Cb(0x4a6)](sE, 0x0),
          kk[Cb(0xa7c)](sE + -0x14, 0x14),
          (kk[Cb(0x71e)] = 0xc),
          (kk[Cb(0xb0f)] = Cb(0x22b)),
          (kk[Cb(0x9ed)] = Cb(0x22b)),
          (kk[Cb(0xae3)] =
            sE < 0x64 ? Math[Cb(0x9da)](sE - 0x32, 0x0) / 0x32 : 0x1),
          (kk[Cb(0x669)] = Cb(0x3ee)),
          kk[Cb(0x8ae)](),
          kk[Cb(0xbec)]();
      }
      kk[Cb(0xa2f)](),
        kk[Cb(0x18a)](s6, s6),
        kk[Cb(0x30e)](0x28, 0x1e + 0x32),
        kk[Cb(0xa60)](0.85);
      for (let sF = 0x0; sF < pO[Cb(0xc2f)]; sF++) {
        const sG = pO[sF];
        if (sF > 0x0) {
          const sH = lJ(Math[Cb(0x9da)](sG[Cb(0x8f9)] - 0.5, 0x0) / 0.5);
          kk[Cb(0x30e)](0x0, (sF === 0x0 ? 0x46 : 0x41) * (0x1 - sH));
        }
        kk[Cb(0xa2f)](),
          sF > 0x0 &&
            (kk[Cb(0x30e)](lJ(sG[Cb(0x8f9)]) * -0x190, 0x0),
            kk[Cb(0xa60)](0.85)),
          kk[Cb(0xa2f)](),
          m0(sG, kk, !![]),
          (sG["id"] = (sG[Cb(0xcc4)] && sG[Cb(0xcc4)]["id"]) || -0x1),
          sG[Cb(0xaff)](kk),
          (sG["id"] = -0x1),
          kk[Cb(0xbec)](),
          sG[Cb(0x156)] !== void 0x0 &&
            (kk[Cb(0xa2f)](),
            kk[Cb(0x568)](sG[Cb(0x156)]),
            kk[Cb(0x30e)](0x20, 0x0),
            kk[Cb(0xc0e)](),
            kk[Cb(0x4a6)](0x0, 0x6),
            kk[Cb(0xa7c)](0x0, -0x6),
            kk[Cb(0xa7c)](0x6, 0x0),
            kk[Cb(0x1d2)](),
            (kk[Cb(0x71e)] = 0x4),
            (kk[Cb(0xb0f)] = kk[Cb(0x9ed)] = Cb(0x22b)),
            (kk[Cb(0x669)] = Cb(0xb9e)),
            kk[Cb(0x8ae)](),
            (kk[Cb(0x681)] = Cb(0x624)),
            kk[Cb(0x615)](),
            kk[Cb(0xbec)]()),
          kk[Cb(0xbec)]();
      }
      kk[Cb(0xbec)]();
    }
    function qK(s6, s7) {
      const Cd = ux,
        s8 = [];
      for (let s9 = 0x0; s9 < s6[Cd(0xc2f)]; s9++) {
        const sa = s6[s9];
        if (s7[Cd(0x358)] !== void 0x0 ? s7(sa) : sa[s7]) sa[Cd(0xaff)](kk);
        else s8[Cd(0x9db)](sa);
      }
      return s8;
    }
    var qL = 0x0,
      qM = 0x0;
    function qN() {
      const Ce = ux;
      kk[Ce(0x30e)](kj[Ce(0xb3d)] / 0x2, kj[Ce(0x2a1)] / 0x2);
      let s6 = qO();
      kk[Ce(0x18a)](s6, s6),
        kk[Ce(0x30e)](-pu, -pv),
        pc[Ce(0x489)] && kk[Ce(0x30e)](qL, qM);
    }
    function qO() {
      const Cf = ux;
      return Math[Cf(0x9da)](kj[Cf(0xb3d)] / cZ, kj[Cf(0x2a1)] / d0) * qP();
    }
    function qP() {
      return nh / py;
    }
    kY(), pU();
    const qQ = {};
    (qQ[ux(0x358)] = ux(0xd47)),
      (qQ[ux(0x112)] = ux(0x7a9)),
      (qQ[ux(0x422)] = ux(0x280));
    const qR = {};
    (qR[ux(0x358)] = ux(0x8b8)),
      (qR[ux(0x112)] = ux(0xd03)),
      (qR[ux(0x422)] = ux(0x56b));
    const qS = {};
    (qS[ux(0x358)] = ux(0x118)),
      (qS[ux(0x112)] = ux(0xc2e)),
      (qS[ux(0x422)] = ux(0x77f));
    const qT = {};
    (qT[ux(0x358)] = ux(0xd61)),
      (qT[ux(0x112)] = ux(0x440)),
      (qT[ux(0x422)] = ux(0x9a2));
    const qU = {};
    (qU[ux(0x358)] = ux(0x6bb)),
      (qU[ux(0x112)] = ux(0xdd7)),
      (qU[ux(0x422)] = ux(0x3d4));
    const qV = {};
    (qV[ux(0x358)] = ux(0x612)),
      (qV[ux(0x112)] = ux(0x4ac)),
      (qV[ux(0x422)] = ux(0x48a));
    var qW = {
      eu_ffa1: qQ,
      eu_ffa2: qR,
      as_ffa1: qS,
      us_ffa1: qT,
      us_ffa2: qU,
      as_ffa2: qV,
      euSandbox: {
        name: ux(0xd75),
        color: ux(0xccf),
        onClick() {
          const Cg = ux;
          window[Cg(0x258)](Cg(0x3eb), Cg(0x501));
        },
      },
    };
    if (window[ux(0xae9)][ux(0x369)] !== ux(0x333))
      for (let s6 in qW) {
        const s7 = qW[s6];
        if (!s7[ux(0x112)]) continue;
        s7[ux(0x112)] = s7[ux(0x112)]
          [ux(0xbb7)](ux(0x333), ux(0x426))
          [ux(0xbb7)](ux(0x3b2), ux(0xdae));
      }
    var qX = document[ux(0x546)](ux(0xe27)),
      qY = document[ux(0x546)](ux(0xb41)),
      qZ = 0x0;
    for (let s8 in qW) {
      const s9 = qW[s8],
        sa = document[ux(0x916)](ux(0xd7b));
      sa[ux(0x11d)] = ux(0x94f);
      const sb = document[ux(0x916)](ux(0xb2f));
      sb[ux(0x3b6)](ux(0x8ae), s9[ux(0x358)]), sa[ux(0xcee)](sb);
      const sc = document[ux(0x916)](ux(0xb2f));
      (sc[ux(0x11d)] = ux(0x363)),
        (s9[ux(0x7fe)] = 0x0),
        (s9[ux(0xbf0)] = function (sd) {
          const Ch = ux;
          (qZ -= s9[Ch(0x7fe)]),
            (s9[Ch(0x7fe)] = sd),
            (qZ += sd),
            k9(sc, ki(sd, Ch(0x331))),
            sa[Ch(0xcee)](sc);
          const se = Ch(0x486) + ki(qZ, Ch(0x331)) + Ch(0xc5e);
          k9(r2, se), k9(qY, se);
        }),
        (s9[ux(0x919)] = function () {
          const Ci = ux;
          s9[Ci(0xbf0)](0x0), sc[Ci(0xae0)]();
        }),
        (sa[ux(0x5c6)][ux(0xc48)] = s9[ux(0x422)]),
        qX[ux(0xcee)](sa),
        (sa[ux(0x8cd)] =
          s9[ux(0xa65)] ||
          function () {
            const Cj = ux,
              sd = qX[Cj(0x546)](Cj(0x245));
            if (sd === sa) return;
            sd && sd[Cj(0x292)][Cj(0xae0)](Cj(0x487)),
              this[Cj(0x292)][Cj(0x1ee)](Cj(0x487)),
              r5(s9[Cj(0x112)]),
              (hC[Cj(0xc25)] = s8);
          }),
        (s9["el"] = sa);
    }
    var r0 = nR(ux(0x713));
    (r0[ux(0x8cd)] = function () {
      const Ck = ux;
      window[Ck(0x258)](Ck(0xe29), Ck(0x501));
    }),
      qX[ux(0xcee)](r0);
    var r1 = qW[ux(0x8cc)]["el"];
    r1[ux(0x292)][ux(0x1ee)](ux(0x663)),
      (r1[ux(0x7e1)] = function () {
        const Cl = ux;
        return nR(Cl(0x20f) + hO[Cl(0xde5)] + Cl(0xa06));
      }),
      (r1[ux(0x471)] = !![]);
    var r2 = document[ux(0x916)](ux(0xb2f));
    (r2[ux(0x11d)] = ux(0x6b6)), qX[ux(0xcee)](r2);
    if (!![]) {
      r3();
      let sd = Date[ux(0xa4a)]();
      setInterval(function () {
        pQ - sd > 0x2710 && (r3(), (sd = pQ));
      }, 0x3e8);
    }
    function r3() {
      const Cm = ux;
      fetch(Cm(0x1bd))
        [Cm(0xc15)]((se) => se[Cm(0xac7)]())
        [Cm(0xc15)]((se) => {
          const Cn = Cm;
          for (let sf in se) {
            const sg = qW[sf];
            sg && sg[Cn(0xbf0)](se[sf]);
          }
        })
        [Cm(0xd5f)]((se) => {
          const Co = Cm;
          console[Co(0x1be)](Co(0x249), se);
        });
    }
    var r4 = window[ux(0xb20)] || window[ux(0xae9)][ux(0xd9d)] === ux(0x5c7);
    if (r4) hW(window[ux(0xae9)][ux(0xce6)][ux(0xbb7)](ux(0x6e5), "ws"));
    else {
      const se = qW[hC[ux(0xc25)]];
      if (se) se["el"][ux(0xd81)]();
      else {
        let sf = "EU";
        fetch(ux(0x504))
          [ux(0xc15)]((sg) => sg[ux(0xac7)]())
          [ux(0xc15)]((sg) => {
            const Cp = ux;
            if (["NA", "SA"][Cp(0x584)](sg[Cp(0xadc)])) sf = "US";
            else ["AS", "OC"][Cp(0x584)](sg[Cp(0xadc)]) && (sf = "AS");
          })
          [ux(0xd5f)]((sg) => {
            const Cq = ux;
            console[Cq(0x8b7)](Cq(0x881));
          })
          [ux(0x5a7)](function () {
            const Cr = ux,
              sg = [];
            for (let si in qW) {
              const sj = qW[si];
              sj[Cr(0x358)][Cr(0xdb3)](sf) && sg[Cr(0x9db)](sj);
            }
            const sh =
              sg[Math[Cr(0xa6f)](Math[Cr(0xe0d)]() * sg[Cr(0xc2f)])] ||
              qW[Cr(0xdc4)];
            console[Cr(0x8b7)](Cr(0x1f2) + sf + Cr(0x790) + sh[Cr(0x358)]),
              sh["el"][Cr(0xd81)]();
          });
      }
    }
    (document[ux(0x546)](ux(0xd05))[ux(0x5c6)][ux(0x50f)] = ux(0x5a4)),
      kB[ux(0x292)][ux(0x1ee)](ux(0x695)),
      kC[ux(0x292)][ux(0xae0)](ux(0x695)),
      (window[ux(0x2fa)] = function () {
        im(new Uint8Array([0xff]));
      });
    function r5(sg) {
      const Cs = ux;
      clearTimeout(kG), iv();
      const sh = {};
      (sh[Cs(0x112)] = sg), (hV = sh), kh(!![]);
    }
    window[ux(0xbc4)] = r5;
    var r6 = null;
    function r7(sg) {
      const Ct = ux;
      if (!sg || typeof sg !== Ct(0x3be)) {
        console[Ct(0x8b7)](Ct(0xa15));
        return;
      }
      if (r6) r6[Ct(0x1de)]();
      const sh = sg[Ct(0x2e4)] || {},
        si = {};
      (si[Ct(0x10b)] = Ct(0x55e)),
        (si[Ct(0x981)] = Ct(0x766)),
        (si[Ct(0xc0c)] = Ct(0x7b0)),
        (si[Ct(0x3a6)] = Ct(0x7cc)),
        (si[Ct(0x31d)] = !![]),
        (si[Ct(0x917)] = !![]),
        (si[Ct(0xbe4)] = ""),
        (si[Ct(0x8d3)] = ""),
        (si[Ct(0xe6e)] = !![]),
        (si[Ct(0x2cd)] = !![]);
      const sj = si;
      for (let sp in sj) {
        (sh[sp] === void 0x0 || sh[sp] === null) && (sh[sp] = sj[sp]);
      }
      const sk = [];
      for (let sq in sh) {
        sj[sq] === void 0x0 && sk[Ct(0x9db)](sq);
      }
      sk[Ct(0xc2f)] > 0x0 &&
        console[Ct(0x8b7)](Ct(0x880) + sk[Ct(0xbc0)](",\x20"));
      sh[Ct(0xbe4)] === "" && sh[Ct(0x8d3)] === "" && (sh[Ct(0xbe4)] = "x");
      (sh[Ct(0x981)] = hO[sh[Ct(0x981)]] || sh[Ct(0x981)]),
        (sh[Ct(0x3a6)] = hO[sh[Ct(0x3a6)]] || sh[Ct(0x3a6)]);
      const sl = nR(
        Ct(0x2b2) +
          sh[Ct(0x10b)] +
          Ct(0x743) +
          sh[Ct(0x981)] +
          Ct(0x8e6) +
          (sh[Ct(0xc0c)]
            ? Ct(0x643) +
              sh[Ct(0xc0c)] +
              "\x22\x20" +
              (sh[Ct(0x3a6)] ? Ct(0x98b) + sh[Ct(0x3a6)] + "\x22" : "") +
              Ct(0xbb4)
            : "") +
          Ct(0x44e)
      );
      (r6 = sl),
        (sl[Ct(0x1de)] = function () {
          const Cu = Ct;
          document[Cu(0x99b)][Cu(0x292)][Cu(0xae0)](Cu(0x50a)),
            sl[Cu(0xae0)](),
            (r6 = null);
        }),
        (sl[Ct(0x546)](Ct(0xc0b))[Ct(0x8cd)] = sl[Ct(0x1de)]);
      const sm = sl[Ct(0x546)](Ct(0x21b)),
        sn = [],
        so = [];
      for (let sr in sg) {
        if (sr === Ct(0x2e4)) continue;
        const ss = sg[sr];
        let st = [];
        const su = Array[Ct(0x742)](ss);
        let sv = 0x0;
        if (su)
          for (let sw = 0x0; sw < ss[Ct(0xc2f)]; sw++) {
            const sx = ss[sw],
              sy = dE[sx];
            if (!sy) {
              sn[Ct(0x9db)](sx);
              continue;
            }
            sv++, st[Ct(0x9db)]([sx, void 0x0]);
          }
        else
          for (let sz in ss) {
            const sA = dE[sz];
            if (!sA) {
              sn[Ct(0x9db)](sz);
              continue;
            }
            const sB = ss[sz];
            (sv += sB), st[Ct(0x9db)]([sz, sB]);
          }
        if (st[Ct(0xc2f)] === 0x0) continue;
        so[Ct(0x9db)]([sv, sr, st, su]);
      }
      sh[Ct(0x2cd)] && so[Ct(0xcad)]((sC, sD) => sD[0x0] - sC[0x0]);
      for (let sC = 0x0; sC < so[Ct(0xc2f)]; sC++) {
        const [sD, sE, sF, sG] = so[sC];
        sh[Ct(0xe6e)] && !sG && sF[Ct(0xcad)]((sK, sL) => sL[0x1] - sK[0x1]);
        let sH = "";
        sh[Ct(0x31d)] && (sH += sC + 0x1 + ".\x20");
        sH += sE;
        const sI = nR(Ct(0x24a) + sH + Ct(0x59c));
        sm[Ct(0xcee)](sI);
        const sJ = nR(Ct(0x58a));
        for (let sK = 0x0; sK < sF[Ct(0xc2f)]; sK++) {
          const [sL, sM] = sF[sK],
            sN = dE[sL],
            sO = nR(
              Ct(0x47e) + sN[Ct(0x5b6)] + "\x22\x20" + qB(sN) + Ct(0xbb4)
            );
          if (!sG && sh[Ct(0x917)]) {
            const sP = sh[Ct(0xbe4)] + ka(sM) + sh[Ct(0x8d3)],
              sQ = nR(Ct(0xaea) + sP + Ct(0x59c));
            sP[Ct(0xc2f)] > 0x6 && sQ[Ct(0x292)][Ct(0x1ee)](Ct(0x363)),
              sO[Ct(0xcee)](sQ);
          }
          (sO[Ct(0x7e1)] = sN), sJ[Ct(0xcee)](sO);
        }
        sm[Ct(0xcee)](sJ);
      }
      km[Ct(0xcee)](sl),
        sn[Ct(0xc2f)] > 0x0 &&
          console[Ct(0x8b7)](Ct(0x892) + sn[Ct(0xbc0)](",\x20")),
        document[Ct(0x99b)][Ct(0x292)][Ct(0x1ee)](Ct(0x50a));
    }
    (window[ux(0x34b)] = r7),
      (document[ux(0x99b)][ux(0xbac)] = function (sg) {
        const Cv = ux;
        sg[Cv(0xbc6)]();
        const sh = sg[Cv(0x5de)][Cv(0x9cb)][0x0];
        if (sh && sh[Cv(0x171)] === Cv(0xe10)) {
          console[Cv(0x8b7)](Cv(0x42e) + sh[Cv(0x358)] + Cv(0xbf2));
          const si = new FileReader();
          (si[Cv(0x4f9)] = function (sj) {
            const Cw = Cv,
              sk = sj[Cw(0x812)][Cw(0x155)];
            try {
              const sl = JSON[Cw(0x96e)](sk);
              r7(sl);
            } catch (sm) {
              console[Cw(0x1be)](Cw(0x718), sm);
            }
          }),
            si[Cv(0x33d)](sh);
        }
      }),
      (document[ux(0x99b)][ux(0x8f7)] = function (sg) {
        const Cx = ux;
        sg[Cx(0xbc6)]();
      }),
      Object[ux(0x6c5)](window, ux(0x685), {
        get() {
          return {
            serialize() {},
            deserialize() {},
            encode() {
              return new Uint8Array(0x1);
            },
            decode() {
              return [];
            },
          };
        },
        set() {},
      }),
      ks();
  })();
function a() {
  const Cy = [
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "s.\x20Yo",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    "rgb(31,\x20219,\x20222)",
    "healthF",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "16th\x20September\x202023",
    "rgb(77,\x2082,\x20227)",
    "match",
    "Summons\x20the\x20power\x20of\x20wind.",
    ".lottery\x20.inventory-petals",
    "Created\x20changelog.",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    "/profile",
    "makeSponge",
    "connectionIdle",
    "petHeal",
    "random",
    "rando",
    "keyInvalid",
    "application/json",
    ".tooltip",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "nickname",
    "col",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    ".username-area",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    "petalWeb",
    "%!Ew",
    "*Peas\x20damage:\x2010\x20→\x2012",
    "WRGBrCo9W6y",
    ".video",
    "reduce",
    "cookie",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    "Furry",
    "Ultra\x20Players\x20(200+)",
    "Expander",
    "20th\x20January\x202024",
    "Web\x20Radius",
    "KeyD",
    "Yoba_5",
    ".server-area",
    "Bush",
    "https://triep.io",
    "darkLadybug",
    "hsla(0,0%,100%,0.4)",
    "prog",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    "Added\x20Shop.",
    "Congratulations!",
    "Neowm",
    "135249DkEsVO",
    "dice",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    "nSkOW4GRtW",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    "createImageData",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    "parentNode",
    "WPfQmmoXFW",
    ".no-btn",
    ".menu",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "12OVuKwi",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "petalShrinker",
    ".hornexcord-btn",
    "30EEDMjO",
    "rgba(0,0,0,0.2",
    "9iYdxUh",
    "joinedGame",
    ".player-list\x20.dialog-content",
    "*Yoba\x20health:\x20500\x20→\x20350",
    "data",
    "low_quality",
    ".lottery",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    "flipDir",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "setUint8",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "28th\x20December\x202023",
    "changeLobby",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "map",
    "deleted",
    "petalRose",
    "iWatchAd",
    "drawShell",
    "test",
    "Passive\x20Shield",
    "runSpeed",
    ".scale-cb",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "translate(-50%,",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "#eee",
    "waveEnding",
    "Digit",
    ".inventory-petals",
    "lightningBouncesTiers",
    "stringify",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    "Extremely\x20slow\x20sussy\x20mob.",
    "isDead",
    ".claim-btn",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    "Petals",
    "sortGroupItems",
    "Buffed\x20Gem.",
    "path",
    "Re-added\x20Waves.",
    "affectMobHeal",
    "𐐿𐐘𐐫𐑀𐐃",
    "*Super:\x205-15",
    "\x20petals\x22></div>",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    "#b52d00",
    "consumeTime",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "bee",
    "scrollHeight",
    "isRetard",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "16th\x20July\x202023",
    "title",
    "#97782b",
    "can\x20s",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    "poisonDamageF",
    "#d9511f",
    "*Turtle\x20health:\x20600\x20→\x20900",
    "url",
    ".shop-overlay",
    "drawIcon",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    "Temporary\x20Extra\x20Speed",
    "petalCoffee",
    "AS\x20#1",
    "\x5c$1",
    "New\x20mob:\x20Furry.",
    "lastElementChild",
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "className",
    "W7/cOmkwW4lcU3dcHKS",
    "health",
    "ount\x20",
    "#ff94c9",
    "scrollTop",
    ".circle",
    "KeyA",
    "countAngleOffset",
    "hide-scoreboard",
    "doShow",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    "\x27s\x20Profile",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "sin",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    "rgb(134,\x2031,\x20222)",
    ".ui-scale\x20select",
    "VLa2",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    ".minimap-dot",
    "e=\x22Yo",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "no\x20sub,\x20no\x20gg",
    ".lottery-timer",
    "updateProg",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    "Mob\x20",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "Absorb",
    "localId",
    "regenF",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "#cecfa3",
    ".export-btn",
    "orbitDance",
    "clientX",
    "9th\x20July\x202023",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    "#d6b936",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "transform",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "*Heavy\x20health:\x20500\x20→\x20600",
    "spawn",
    "weight",
    "hsla(0,0%,100%,0.25)",
    "erCas",
    "petalDrop_",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    "result",
    "posAngle",
    "Petaler",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    ".ultra-buy",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    "11014848PLOKlA",
    "changedTouches",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    "isPet",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    "iSwapPetal",
    "hasHearts",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "/weborama.js",
    "Web",
    "hasSpawnImmunity",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    "26th\x20January\x202024",
    "#454545",
    "Spider\x20Cave",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "#fff0b8",
    "cuYF",
    "type",
    "Hornet_4",
    "clip",
    "#3f1803",
    "Health\x20Depletion",
    "<div\x20style=\x22width:100%;\x20text-align:center;\x22></div>",
    "#bb3bc2",
    "%/s",
    "XCN6",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "Lobby\x20Closing...",
    "[F]\x20Show\x20Hitbox:\x20",
    "Bone",
    "[2tB",
    "petalTurtle",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "babyAntFire",
    "Added\x20Global\x20Leaderboard.",
    "tail_outline",
    "*Cotton\x20health:\x2012\x20→\x2015",
    "addEventListener",
    "iAbsorb",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    "evenodd",
    ".import-btn",
    "scale",
    "shootLightning",
    "*Snail\x20Health:\x20180\x20→\x20120",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    "#6265eb",
    "*Arrow\x20damage:\x204\x20→\x205",
    ".\x22>\x20<span\x20class=\x22username-link\x22\x20stroke=\x22",
    "Loaded\x20Build\x20#",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "Kicked!\x20(reason:\x20",
    "abeQW7FdIW",
    "Nigerian\x20Ladybug.",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    "extraRange",
    "ladybug",
    "Loading\x20video\x20ad...",
    "beaten\x20to\x20death",
    "sponge",
    "Hyper\x20Players",
    "fixed_mob_health_size",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "Lightning",
    "7th\x20August\x202023",
    "*Peas\x20damage:\x2012\x20→\x2015",
    ".tier-",
    "#d3ad46",
    "#709e45",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "*Super:\x20150+",
    "6th\x20October\x202023",
    "Crab",
    "hsl(60,60%,30%)",
    "flors",
    "#f009e5",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "iWithdrawPetal",
    "#b0c0ff",
    ".watch-ad",
    "Added\x20Shiny\x20mobs:",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "powderPath",
    "armor",
    "clientWidth",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "*Ultra:\x201-5",
    "KeyG",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    ".show-health-cb",
    "https://stats.hornex.pro/api/userCount",
    "error",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "4th\x20April\x202024",
    "Saved\x20Build\x20#",
    "Dragon\x20Egg",
    "insertBefore",
    "#9fab2d",
    "slowDuration",
    "*Reduced\x20mob\x20count.",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "outdatedVersion",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    "dragon",
    "globalCompositeOperation",
    "#2e933c",
    "hpRegenPerSecF",
    ".hitbox-cb",
    "onMove",
    "Ghost_2",
    "closePath",
    "Wing",
    "*Rose\x20heal:\x2013\x20→\x2011",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "value",
    "Poisonous\x20gas.",
    "Missile\x20Damage",
    "\x22></span></div>\x0a\x09</div>",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "count",
    "userAgent",
    "bone_outline",
    "dispose",
    "DMCA",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    "New\x20mob:\x20M28.",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    "twirl",
    "oncontextmenu",
    "Spider_1",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "15584076IAHWRs",
    "1998256OxsvrH",
    "maximumFractionDigits",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    ".craft-btn",
    "#493911",
    "Poop\x20Health",
    "add",
    "*Banana\x20damage:\x201\x20→\x202",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    ".zertcord-btn",
    "Region:\x20",
    "{background-color:",
    "iPercent",
    "%;\x22\x20stroke=\x22",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    "petalDice",
    "#503402",
    "bolder\x2012px\x20",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    "Nerfed\x20Ant\x20Holes:",
    "petalMushroom",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "setPos",
    "\x0a17th\x20May\x202024\x0aMore\x20game\x20stats\x20are\x20shown\x20now:\x0a*Total\x20Time\x20Played\x0a*Total\x20Games\x20Played\x0a*Total\x20Kills\x0a*Total\x20Chat\x20Sent\x0a*Total\x20Accounts\x0aNumpad\x20keys\x20can\x20also\x20be\x20used\x20to\x20swap\x20petals\x20now.\x0aPress\x20K\x20to\x20toggle\x20keyboard\x20controls.\x0a",
    "switched",
    "Poop\x20Damage",
    "#b9baba",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "download",
    "Nitro\x20Boost",
    "petalSwastika",
    "*Cotton\x20health:\x209\x20→\x2010",
    "3WRI",
    "Sandstorm_3",
    "petals",
    "assassinated",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "W6rnWPrGWPfdbxmAWOHa",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "24th\x20June\x202023",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "no-icon",
    "makeFire",
    "\x20downloaded!",
    "TC0B",
    "Lvl\x20",
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    "isTrusted",
    ".credits",
    "No\x20username\x20provided.",
    ".dialog-content",
    "spider",
    "WQxdVSkKW5VcJq",
    "4oL8",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "isBoomerang",
    "change_font",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "updateT",
    "\x0a14th\x20August\x202024\x0aNew\x20Discord\x20server\x20link:\x20Hornexcord.\x0aA\x20lot\x20of\x20updates\x20done\x20to\x20Sandbox.\x20Go\x20try\x20it\x20out.\x0a",
    "27th\x20February\x202024",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "g\x20on\x20",
    "doLerpEye",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "Added\x20banner\x20ads.",
    "round",
    "enable_kb_movement",
    "statuePlayer",
    "Ears",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    ".claimer",
    "centipedeBodyDesert",
    "url(",
    "picked",
    "other",
    "e8oQW7VdPKa",
    "*Iris\x20poison:\x2045\x20→\x2050",
    "m28",
    "petalPea",
    "Spider_5",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    ".builds",
    "onchange",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    ".lb",
    "Added\x201\x20more\x20EU\x20lobby.",
    "Cactus",
    "hasGem",
    "https://www.youtube.com/@gowcaw97",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    ".active",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "Heart",
    "Tiers",
    "Failed\x20to\x20get\x20userCount!",
    "<div\x20stroke=\x22",
    "Ants\x20redesign.",
    "Added\x20Leave\x20Game\x20button.",
    "Heavy",
    ";\x22\x20stroke=\x22",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    "\x20petal",
    "Wave\x20Ending...",
    "absolute",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "locat",
    "readyState",
    "hasAntenna",
    "open",
    "Spider_4",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "adplayer-not-found",
    "23rd\x20July\x202023",
    ".logout-btn",
    "Craft",
    "10th\x20July\x202023",
    "successful",
    "Gem",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "Lightning\x20damage:\x2012\x20→\x208",
    "chain",
    "Client-side\x20performance\x20improvements.",
    ".stats",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "uwu",
    "disabled",
    ".shop-info",
    "hsla(0,0%,100%,0.5)",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    "Much\x20heavier\x20than\x20your\x20mom.",
    "drawTurtleShell",
    "our\x20o",
    "New\x20mob:\x20Mushroom.",
    "Wig",
    ".right-align-petals-cb",
    "2306845vjbPLc",
    "2477344PsXEsq",
    "11th\x20July\x202023",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "projPoisonDamageF",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    "It\x20burns.",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    "://ho",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "rgb(166\x2056\x20237)",
    "isClown",
    "ion",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    "ArrowUp",
    "nProg",
    "Ghost_5",
    "*Legendary:\x20125\x20→\x20100",
    "hyperPlayers",
    "petalFaster",
    "kWicW5FdMW",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "Sandstorm_4",
    "invalid\x20uuid",
    "textBaseline",
    "moveCounter",
    "classList",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    "Numpad",
    "Beetle_6",
    "#af6656",
    "*Rock\x20health:\x2060\x20→\x20120",
    "Rare",
    "static",
    "translate(calc(",
    "#7af54c",
    "Pacman",
    "#4343a4",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    "*Bone\x20armor:\x209\x20→\x2010",
    "Fixed\x20another\x20crafting\x20exploit.",
    "height",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "Rock_3",
    "├─\x20",
    "has\x20ended.",
    "split",
    "Fossil",
    "show_population",
    "hasSpiderLeg",
    "#4eae26",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "CCofC2RcTG",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "#fc5c5c",
    "#69371d",
    "#ceea33",
    "petalRock",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    ".shop",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "s\x20can",
    "Regenerates\x20health\x20when\x20consumed.",
    "stayIdle",
    "halo",
    "reloadT",
    "<div\x20class=\x22slot\x22></div>",
    "startEl",
    "kbps",
    "Extra\x20Speed",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    "2nd\x20August\x202023",
    ".joystick",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    "mood",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    ".privacy-btn",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    "Reduced\x20Wave\x20duration.",
    "#cfc295",
    "\x0a\x09</div>",
    "n8oKoxnarXHzeIzdmW",
    "sortGroups",
    "makeBallAntenna",
    "lieOnGroundTime",
    "W6RcRmo0WR/cQSo1W4PifG",
    "show_clown",
    "*Rare:\x2050\x20→\x2035",
    "curePoisonF",
    "clearRect",
    "Getting\x20",
    "Fonts\x20loaded!",
    "Worker\x20Ant",
    "right_align_petals",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    "drawArmAndGem",
    "sizeIncreaseF",
    "Enter",
    "isCentiBody",
    "r\x20acc",
    "projD",
    "d.\x20Pr",
    "asdfadsf",
    "<div\x20class=\x22chat-text\x22></div>",
    "pink",
    "metaData",
    "mobPetaler",
    "Legendary",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "els",
    "New\x20settings:\x20Low\x20quality.",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "Heal",
    "inclu",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    ".ads",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "vFKOVD",
    "web_",
    "📜\x20",
    "Pincer",
    ".tabs",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "avatar",
    "wave",
    "Invalid\x20mob\x20name:\x20",
    "sendBadMsg",
    "=([^;]*)",
    "Username\x20is\x20already\x20taken.",
    "statue",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    "webSize",
    "pZWkWOJdLW",
    "spiderLeg",
    "hide",
    "d\x20abs",
    "z8kgrX3dSq",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    "Beetle_4",
    ".hide-chat-cb",
    "Yoba\x20Egg",
    "3L$0",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "translate",
    "\x20-\x20",
    "#38ecd9",
    "Removed\x20Centipedes\x20from\x20waves.",
    ".max-wave",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "createPattern",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "Beetle_5",
    "inventory",
    ".clown",
    ".anti-spam-cb",
    "background",
    "<div\x20class=\x22petal-icon\x22\x20",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    "addGroupNumbers",
    "breedPower",
    "fire\x20ant",
    "slice",
    "\x20players\x20•\x20",
    "Increased\x20shiny\x20mob\x20size.",
    "lightning",
    "petalLightning",
    ".inventory-btn",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "armorF",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    "petalBone",
    "oSize",
    "Range",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "zmkhtdVdSq",
    "\x20tiles)",
    "onEnd",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    "user",
    "marginTop",
    "hornex.pro",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "\x20stea",
    ".copy-btn",
    "22nd\x20July\x202023",
    "prototype",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "deg",
    "send",
    "Passively\x20regenerates\x20shield.",
    "readAsText",
    "petalSponge",
    "*Hyper:\x2015-25",
    "#fbb257",
    "font",
    "petalAntidote",
    "copy",
    "petal_",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "clientY",
    "Rose",
    "unnamed",
    "Hnphe",
    "#cf7030",
    "displayData",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "nerd",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    "elongation",
    "Wave\x20changes:",
    "Nerfed\x20Spider\x20Yoba.",
    "\x20rad/s",
    ".progress",
    "4th\x20July\x202023",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "name",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "eyeY",
    "petalSunflower",
    "\x22>Page\x20#",
    "*Powder\x20health:\x2010\x20→\x2015",
    "hpAlpha",
    ".stats-btn",
    "#a5d141",
    "#eeeeee",
    "Spawns",
    "small",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    "touchmove",
    "\x22></div><div\x20class=\x22log-content\x22>",
    "Beetle\x20Egg",
    "next",
    "hostname",
    "Third\x20Eye",
    "28th\x20June\x202023",
    "tile_",
    "#d0bb55",
    "Beehive",
    "invalid",
    "Mob\x20Agro\x20Range",
    ".game-stats",
    "abs",
    "alpha",
    "\x20FPS\x20/\x20",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    "Preroll\x20state:\x20",
    "Increased\x20Ultra\x20key\x20price.",
    "#d3bd46",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    "toggle",
    "New\x20mob:\x20Fossil.",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "horne",
    "dontUiRotate",
    "Username\x20too\x20big!",
    "drawSnailShell",
    "/dlMob",
    "#efc99b",
    "<div\x20class=\x22chat-name\x22></div>",
    "petalFire",
    "Stick\x20does\x20not\x20expand\x20now.",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    "hsl(110,100%,60%)",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    ".collected-petals",
    ".hyper-buy",
    "stickbug",
    "Extra\x20Pickup\x20Range",
    ".nickname",
    "#735d5f",
    "Password\x20downloaded!",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    "bush",
    "\x0a13th\x20May\x202024\x0aFixed\x20a\x20bug\x20that\x20didn\x27t\x20let\x20flowers\x20enter\x20portals.\x0aBalances:\x0a*Sword\x20damage:\x2017\x20→\x2021\x0a*Yin\x20yang\x20damage:\x2010\x20→\x2020\x0a*Yin\x20yang\x20reload:\x202s\x20→\x201.5s\x0a",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "#eb4755",
    "setUint32",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    "#ffd800",
    "7th\x20July\x202023",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    "hostn",
    "Dragon_4",
    "charCodeAt",
    "hsl(60,60%,",
    "Poo",
    "substr",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    "getBigUint64",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "descColor",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    "petalYinYang",
    "14dafFDX",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "Cotton\x20bush.",
    "Petal\x20Weight",
    "credits",
    "green",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    "sq8Ig3e",
    "Buffs:",
    "wss://",
    "532861peVSVX",
    "angleSpeed",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    "setAttribute",
    "getContext",
    "select",
    "iChat",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "mobsEl",
    "encode",
    "Orbit\x20Dance",
    "object",
    ".tooltips",
    "2772301LQYLdH",
    "Increased\x20map\x20size\x20by\x2030%.",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "New\x20mob:\x20Beehive.",
    "craft-disable",
    "usernameTaken",
    "Checking\x20username\x20availability...",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "shiftKey",
    "projDamage",
    "Salt",
    "guardian",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    "pow",
    ".discord-user",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "Soldier\x20Ant_3",
    "isSupporter",
    "rgb(237\x20236\x2061)",
    "rnex.",
    "scorpion",
    "baseSize",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2048\x2048\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x20\x20<title>data-source-solid</title>\x0a\x20\x20<g\x20id=\x22Layer_2\x22\x20data-name=\x22Layer\x202\x22>\x0a\x20\x20\x20\x20<g\x20id=\x22invisible_box\x22\x20data-name=\x22invisible\x20box\x22>\x0a\x20\x20\x20\x20\x20\x20<rect\x20width=\x2248\x22\x20height=\x2248\x22\x20fill=\x22none\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20\x20\x20<g\x20id=\x22icons_Q2\x22\x20data-name=\x22icons\x20Q2\x22>\x0a\x20\x20\x20\x20\x20\x20<path\x20d=\x22M46,9c0-6.8-19.8-7-22-7S2,2.2,2,9v7c0,.3,1.1,1.8,5.2,3.4h.3a40.3,40.3,0,0,0,8.6,2A65.6,65.6,0,0,0,24,22a65.6,65.6,0,0,0,7.9-.5,40.3,40.3,0,0,0,8.6-2h.3C44.9,17.8,46,16.3,46,16V9.3h0ZM2,31.3V39c0,6.8,19.8,7,22,7s22-.2,22-7V31.3C41.4,34.1,33.3,36,24,36S6.6,34.1,2,31.3Zm43.7-9.8a22.5,22.5,0,0,1-4.9,2.1A54.8,54.8,0,0,1,24,26,54.8,54.8,0,0,1,7.2,23.6a22.5,22.5,0,0,1-4.9-2.1L2,21.3V26c0,.3,1.2,1.9,5.5,3.5A50.2,50.2,0,0,0,24,32a50.2,50.2,0,0,0,16.5-2.5C44.8,27.9,46,26.3,46,26V21.3Z\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20</g>\x0a</svg>",
    "privacy.txt",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    ".id-group",
    "toString",
    "cactus",
    "#b53229",
    "motionKind",
    "4\x20yummy\x20poisonous\x20balls.",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    "Ancester\x20of\x20flowers.",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    "dmca\x20it\x20m28!",
    "e\x20bee",
    "petalStick",
    "https://sandbox.hornex.pro",
    "wasDrawn",
    "transformOrigin",
    "rgba(0,0,0,0.2)",
    ".download-btn",
    "sandstorm",
    "decode",
    "mob_",
    "createdAt",
    "ArrowRight",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    "des",
    "shell",
    "petalWing",
    "WRbjb8oX",
    "Fixed\x20number\x20rounding\x20issue.",
    "0@x9",
    "toUpperCase",
    ".inventory-rarities",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    "Changes\x20to\x20anti-lag\x20system:",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    "main",
    "Hyper",
    "Level\x20",
    "centipedeHeadPoison",
    "https://discord.gg/zZsUUg8rbu",
    "rgba(0,0,0,0.08)",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "oiynC",
    "prepend",
    "updateTime",
    "#ccad00",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "fonts",
    "Minor\x20physics\x20change.",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    "petalRockEgg",
    "Fixed\x20Gem\x20glitch.",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "3rd\x20July\x202023",
    "Bubble",
    "WOpcHSkuCtriW7/dJG",
    "gameStats",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "url(https://i.ytimg.com/vi/",
    "#d43a47",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    ".data-search-result",
    "Desert\x20Centipede",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    "]\x22></div>",
    "hpRegen",
    "#962921",
    "color",
    ".checkbox",
    "Downloaded!",
    "absorbDamage",
    "zert.pro",
    "contains",
    "reset",
    "*Rock\x20health:\x2050\x20→\x2060",
    ".common",
    ".leave-btn",
    "KeyM",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    "Importing\x20data\x20file:\x20",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "show_debug_info",
    "rotate(",
    "lighter",
    "Poison",
    "portal",
    "fire",
    "#cb37bf",
    "bolder\x20",
    "orb\x20a",
    "#ce76db",
    "petDamageFactor",
    "17th\x20June\x202023",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "mouse",
    ".show-bg-grid-cb",
    "qmklWO4",
    "wss://us1.hornex.pro",
    "Honey\x20Range",
    "fovFactor",
    "*Hyper:\x20240",
    "nShield",
    "Elongation",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "atan2",
    "centipedeBodyPoison",
    "saved_builds",
    "*Rock\x20health:\x20120\x20→\x20150",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    "Stinger",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "year",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    "#f7904b",
    "New\x20mob:\x20Nigersaurus.",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "points",
    "useTime",
    "centipedeHead",
    "nt.\x20H",
    "stickbugBody",
    "oceed",
    "New\x20mob:\x20Snail.",
    "hoq5",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "User\x20not\x20found!",
    "3YHM",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    ".submit-btn",
    "Slowness\x20Duration",
    "#999",
    "Rock_4",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    "isAggressive",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    "Makes\x20you\x20poisonous.",
    "wn\x20ri",
    "startPreRoll",
    "petalGas",
    "weedSeed",
    "tooltipDown",
    "Balancing:",
    "WP4hW755jCokWRdcKchdT3ui",
    "data-icon",
    "<div>",
    "children",
    "#b5a24b",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    "3336680ZmjFAG",
    "Kills",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    ".petal",
    "<div\x20class=\x22petal\x20tier-",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    "onkeydown",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "opacity",
    "isBae",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "(total\x20",
    "active",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    "enable_shake",
    "#3db3cb",
    "mobSizeChange",
    "worldH",
    "#bff14c",
    "25th\x20July\x202023",
    "mobDespawned",
    "#400",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "Sussy\x20Discord\x20uwu",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "petalDmca",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    "bsorb",
    "#4f412e",
    "Removed\x20Waves.",
    "ears",
    "toLowerCase",
    "*Hyper:\x20175+",
    "2nd\x20March\x202024",
    "Starfish",
    "#554213",
    ";-moz-background-position:\x20",
    "\x20ctxs\x20(",
    "canSkipRen",
    "isLightning",
    "drawChats",
    "Light",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "moveTo",
    "15th\x20July\x202023",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "19th\x20June\x202023",
    "petalHeavy",
    "from",
    "wss://as2.hornex.pro",
    "STOP!",
    "Game",
    "iPing",
    "Damage",
    "furry",
    "isTanky",
    "12th\x20August\x202023",
    "Fire\x20Damage",
    "numeric",
    "i\x20need\x20999\x20billion\x20subs",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    "Yellow\x20Ladybug",
    "New\x20mob:\x20Dragon\x20Nest.",
    "mobile",
    "#a760b1",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "hide_chat",
    "Dark\x20Ladybug",
    "toLocaleString",
    "curePoison",
    "honeyDmgF",
    "despawnTime",
    ".rewards",
    "bezierCurveTo",
    "Common",
    "*Snail\x20damage:\x2010\x20→\x2015",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "WP/dQbddHH0",
    "bg-rainbow",
    "flower",
    "\x0a16th\x20May\x202024\x0aAdded\x20Game\x20Statistics:\x0a*Super\x20Players\x0a*Hyper\x20Players\x0a*Ultra\x20Players\x20(with\x20more\x20than\x20200\x20ultra\x20petals)\x0a*All\x20Petals\x0a*Data\x20is\x20updated\x20every\x20hour.\x0a*You\x20can\x20search\x20game\x20stats\x20by\x20username.\x0a",
    ".key-input",
    "petalLeaf",
    "Ghost_4",
    "resize",
    "Arrow",
    "iSwapPetalRow",
    "mushroomPath",
    "altKey",
    "lightningDmgF",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    "Username\x20claimed!",
    "20th\x20June\x202023",
    "p41E",
    "arraybuffer",
    "#be342a",
    "deg)\x20scale(",
    "KGw#",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    "\x20ago",
    "/hqdefault.jpg)",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "projSize",
    "GBip",
    "\x20radians",
    ".player-list-btn",
    "binaryType",
    ".chat-content",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22\x20style=\x22width:\x20200px;\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Join\x20Discord!\x22></div>\x0a\x09\x09\x0a\x09\x09\x09<div\x20stroke=\x22Hornexcord\x20is\x20the\x20new\x20main\x20server\x20now.\x22></div>\x0a\x0a\x09\x09\x09<div\x20style=\x22display:\x20flex;\x0a\x20\x20\x20\x20grid-gap:\x205px;\x0a\x20\x20\x20\x20margin-top:\x207px;\x0a\x20\x20\x20\x20flex-direction:\x20column;\x0a\x20\x20\x20\x20align-items:\x20center;\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20hornexcord-btn\x20rainbow-bg\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Hornexcord\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20zertcord-btn\x22\x20style=\x22font-size:\x2010px;\x0a\x20\x20\x20\x20padding:\x205px;background:\x20#7722c3\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Zertcord\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "hideTimer",
    "moveSpeed",
    "reqFailed",
    "#bb1a34",
    ".tv-next",
    "Nitro",
    "#82b11e",
    "Sponge",
    "userProfile",
    "Increases\x20petal\x20pickup\x20range.",
    "#5b4d3c",
    "textEl",
    ".gamble-petals-btn",
    "onload",
    "└─\x20",
    "sadT",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "murdered",
    "px)",
    "filter",
    "antHoleFire",
    "_blank",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "https://ipapi.co/json/",
    "dSk+d0afnmo5WODJW6zQxW",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    ".damage-cb",
    "getFloat32",
    "hide-all",
    "loading",
    "\x20domain=.hornex.pro",
    "workerAnt",
    "22nd\x20June\x202023",
    "display",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    "[G]\x20Show\x20Grid:\x20",
    "https://discord.gg/SX8jmVHHGT",
    "jellyfish",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    "accou",
    "4th\x20September\x202023",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    "#a44343",
    "playerList",
    "#a33b15",
    "sword",
    "*Reduced\x20Shield\x20regen\x20time.",
    ".login-btn",
    "petalSand",
    "2nd\x20October\x202023",
    "Disconnected.",
    ".super-buy",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    "visible",
    "petalDrop",
    "isPassiveAggressive",
    "pop",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    "#ebda8d",
    "Air",
    "Passively\x20regenerates\x20your\x20health.",
    "*Reduced\x20drops\x20by\x2050%.",
    "Increases",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    "petCount",
    "x.pro",
    "healthIncreaseF",
    ".fixed-player-health-cb",
    "WPJcKmoVc8o/",
    "string",
    "*Peas\x20health:\x2020\x20→\x2025",
    "show_scoreboard",
    "1px",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    "gameStats.json",
    "*Cement\x20health:\x2080\x20→\x20100",
    "Sand",
    "starfish",
    "canShowDrops",
    ".censor-cb",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    "#ce79a2",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "\x20•\x20",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "powderTime",
    "querySelector",
    "total",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    "Shell",
    "Wave",
    "rectAscend",
    "#cccccc",
    "makeLadybug",
    "<div\x20class=\x22petal-count\x22></div>",
    "3rd\x20February\x202024",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    "Flower\x20#",
    "#38c75f",
    "#d54324",
    "--angle:",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "Ghost_3",
    "Has\x20fungal\x20infection\x20gg",
    "*Bone\x20armor:\x207\x20→\x208",
    "iDepositPetal",
    ".scores",
    "lottery",
    "isSpecialWave",
    "makeAntenna",
    "Some\x20Data",
    "#8ac255",
    "Rock_2",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    ".changelog-btn",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    "queenAntFire",
    "redHealthTimer",
    "Ghost_6",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "rotate",
    "\x0a5th\x20May\x202024\x0aHeavy\x20now\x20slows\x20down\x20your\x20petal\x20orbit\x20speed.\x20More\x20slowness\x20for\x20higher\x20rarity.\x20\x0aCotton\x20doesn\x27t\x20expand\x20like\x20Rose\x20when\x20you\x20are\x20angry.\x0aPowder\x20now\x20adds\x20turbulence\x20to\x20your\x20petals\x20when\x20you\x20are\x20angry.\x0aFixed\x20more\x20player\x20dupe\x20bugs.\x0a",
    "<span\x20style=\x22color:",
    "rgb(81\x20121\x20251)",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    "INPUT",
    "fixedSize",
    "Lightsaber",
    "Sprite",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    "keys",
    "Soak\x20Duration",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "W5OTW6uDWPScW5eZ",
    "Red\x20ball.",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "Ruined",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    "player_id",
    "soakTime",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "1Jge",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    "Sandstorm_2",
    "superPlayers",
    "rgb(222,\x2031,\x2031)",
    "includes",
    "min",
    "4th\x20August\x202023",
    ".pro",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "<div\x20class=\x22petal-container\x22></div>",
    "*Fire\x20health:\x2080\x20→\x20120",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    "Sandstorm_6",
    "Retardation\x20Duration",
    "Queen\x20Ant",
    "discord_data",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "#32a852",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    ".find-user-btn",
    "7th\x20February\x202024",
    "#888",
    "Removed\x20disclaimer\x20from\x20menu.",
    ".grid-cb",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "Added\x20another\x20AS\x20lobby.",
    "\x22></div>",
    "portalPoints",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "uiScale",
    "https://stats.hornex.pro/",
    "*2%\x20craft\x20success\x20rate.",
    "Dice",
    "poopPath",
    "none",
    ".fixed-name-cb",
    "username",
    "finally",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "stepPerSecMotion",
    "snail",
    "petSizeIncrease",
    ".yes-btn",
    "\x20no-icon\x22\x20",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    "particle_heart_",
    "Turtle",
    "Flower\x20Damage",
    "petalNitro",
    "New\x20mob:\x20Spider\x20Cave.",
    "ghost",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "tier",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    "desktop",
    ")\x20rotate(",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "ready",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    ".lottery-winner",
    "gem",
    "glbData",
    "left",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "style",
    "?dev",
    "typeStr",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "#e6a44d",
    "OFFIC",
    "ned.\x22",
    "petalMissile",
    "101636gyvtEF",
    "waveNumber",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    ".stats\x20.dialog-content",
    "Take\x20Down\x20Time",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "healthIncrease",
    "KeyW",
    "Fixed\x20another\x20craft\x20exploit.",
    ".absorb-rarity-btns",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "reflect",
    "Hornet_2",
    ".change-font-cb",
    "dataTransfer",
    "red",
    ".petal-rows",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    "sign",
    "#543d37",
    "^F[@",
    "outlineCount",
    "xgMol",
    "Soil",
    "text/plain;charset=utf-8;",
    "onkeyup",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    "#dc704b",
    "hornex-pro_300x600",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    "uiName",
    "nick",
    "http://localhost:8001/discord",
    "projHealthF",
    "assualted",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "isStatue",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    "close",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "rgba(0,0,0,0.1)",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "\x0a26th\x20August\x202024\x0aPlay\x20our\x20new\x20game:\x20Triep.IO\x0a",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "countTiers",
    "shieldRegenPerSecF",
    "iClaimUsername",
    "setTargetEl",
    "Wave\x20Starting...",
    "#000000",
    "removeChild",
    "spiderCave",
    "arrested\x20for\x20plagerism",
    "#853636",
    "21st\x20June\x202023",
    "append",
    "NSlTg",
    "projSpeed",
    "scale(",
    "Spider_6",
    "cmk+c0aoqSoLWQrQW6Tx",
    "pathSize",
    "Shield\x20Reuse\x20Cooldown",
    "iReqUserProfile",
    "moveFactor",
    "<div\x20class=\x22chat-text\x22>",
    "AS\x20#2",
    "petalBasic",
    "#323032",
    "fill",
    "New\x20setting:\x20UI\x20Scale.",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    ".show-scoreboard-cb",
    "#8ac355",
    "gcldSq",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "6th\x20September\x202023",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "buffer",
    "ArrowLeft",
    "c)H[",
    "Coffee",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    "#fff",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "#29f2e5",
    "iAngle",
    ".data-search",
    "crafted\x20nothing\x20from",
    "anti_spam",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    "#ffffff",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    "spawnOnHurt",
    "devicePixelRatio",
    "21st\x20July\x202023",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "Rock",
    "\x22></span>\x20<span\x20stroke=\x22•\x20",
    "13th\x20July\x202023",
    "shadowBlur",
    "Some\x20anti\x20lag\x20measures:",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    "New\x20mob:\x20Turtle",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "center",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    ".play-btn",
    "Orbit\x20Twirl",
    "Mob\x20Rotation",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    "score",
    "blur(10px)",
    "long",
    "pickedEl",
    "Heavier\x20than\x20your\x20mom.",
    "sad",
    "discord\x20err:",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "#222",
    "Pill\x20affects\x20Arrow\x20now.",
    "petalBanana",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "Added\x20Waveroom:",
    ".box",
    "off",
    "Faster",
    "totalChatSent",
    "KICKED!",
    "petSizeChangeFactor",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "\x20+\x20",
    "subscribe\x20for\x20999\x20super\x20petals",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "projType",
    "cos",
    "1841224gIAuLW",
    "Mythic",
    "Banana",
    "Pet\x20Size\x20Increase",
    ".build-save-btn",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "sandbox-btn",
    "your\x20",
    "5th\x20August\x202023",
    "It\x20likes\x20to\x20dance.",
    "),0)",
    "LavaWater",
    "strokeStyle",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "totalKills",
    "Q2mA",
    "getUint8",
    "WARNING!",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    "hurtT",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    ".scoreboard-title",
    "[Y]\x20Show\x20Health:\x20",
    "honeyRange",
    "kicked",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "isPoison",
    "Evil\x20Centipede",
    "wrecked",
    "#5ec13a",
    ".petal-count",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "marginBottom",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "fillStyle",
    "release",
    "warn",
    ".absorb-clear-btn",
    "msgpack",
    "progress",
    "*Unsual:\x2025\x20→\x2010",
    "userChat",
    "User",
    "\x20accounts",
    "Armor",
    "Fire\x20Ant",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "projAffectHealDur",
    ".level",
    "<div\x20",
    ".lottery-users",
    "\x20pxls)\x20/\x20",
    "Soldier\x20Ant",
    "useTimeTiers",
    "show",
    "\x20petals\x22></div>\x0a\x09\x09\x09\x09\x09</div>",
    "M28",
    "1st\x20February\x202024",
    "curve",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    "Scorpion\x20redesign.",
    "13th\x20February\x202024",
    "getTransform",
    "admin_pass",
    "retardDuration",
    "Rock_6",
    "Craft\x20rate\x20change:",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "Claiming\x20secret\x20skin...",
    "<option\x20value=\x22",
    "Added\x20Lottery.",
    ".terms-btn",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "copyright\x20striked",
    "isProj",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "23rd\x20June\x202023",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "#fcdd86",
    "<div\x20class=\x22data-search-item\x22>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22#",
    "></di",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "#882200",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "small\x20full",
    "Account\x20imported!",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    "<div><span\x20stroke=\x22",
    "pedoxMain",
    "US\x20#2",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    "Ugly\x20&\x20stinky.",
    "Removed\x20EU\x20#3.",
    "#f2b971",
    ".angry-btn",
    "Fixed\x20players\x20pushing\x20eachother.",
    "lient",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "defineProperty",
    "wing",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "Press\x20G\x20to\x20toggle\x20grid.",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    "Jellyfish",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "purple",
    "*Snail\x20health:\x2045\x20→\x2050",
    ".build-load-btn",
    "barEl",
    "Stickbug",
    "dontExpand",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "B4@J",
    "getUint32",
    "index",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "Nigersaurus",
    ".switch-btn",
    "trim",
    "swapped",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    "#ebeb34",
    ".find-user-input",
    "Guardian",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "onmouseleave",
    "Heal\x20Affect\x20Duration",
    "*Removed\x20Ultra\x20wave.",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    "http",
    "#924614",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    "[data-icon]",
    "27th\x20July\x202023",
    "started!",
    "\x22></div>\x20<div\x20style=\x22color:",
    "23rd\x20January\x202024",
    "Fire\x20Ant\x20Hole",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "*Cotton\x20health:\x207\x20→\x208",
    "WP5YoSoxvq",
    "\x20HP",
    "Breaths\x20fire.",
    "Breed\x20Range",
    "iScore",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "Magnet",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    "groups",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "opera",
    "#cfbb50",
    "yellowLadybug",
    "*Gas\x20health:\x20140\x20→\x20250",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    "#75dd34",
    "breedRange",
    "\x22\x20stroke=\x22(",
    "dandelion",
    "*Rice\x20damage:\x205\x20→\x204",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "\x20$1",
    "Could\x20not\x20claim\x20secret\x20skin.",
    "shlong",
    ".game-stats-btn",
    "imageSmoothingEnabled",
    "#bc0000",
    "beetle",
    "Pollen",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    "28th\x20August\x202023",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "<div\x20class=\x22btn\x20triep-btn\x22>\x0a\x09<span\x20stroke=\x22Triep.IO\x22></span>\x0a\x09<span\x20class=\x22small\x22\x20stroke=\x22Play\x20now!\x22></span>\x0a</div>",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    ".keyboard-cb",
    "#1ea761",
    "Failed\x20to\x20get\x20game\x20stats.\x20Retrying\x20in\x205s...",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    "encod",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    "hasSwastika",
    "bone",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "lineWidth",
    "nig",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    "span\x202",
    "#7777ff",
    "Yourself",
    "\x20was\x20",
    "mushroom",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    "dontPushTeam",
    "iJoin",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    "cantChat",
    "#c9b46e",
    "update",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "neutral",
    "*Super:\x20180",
    "executed",
    "Soldier\x20Ant_6",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "key",
    ".timer",
    "krBw",
    "uniqueIndex",
    "#555",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x20no-hide\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "uiHealth",
    "*Turtle\x20health\x20500\x20→\x20600",
    "New\x20mob:\x20Pedox",
    "ur\x20pe",
    "*Taco\x20healing:\x208\x20→\x209",
    "isArray",
    "\x22\x20style=\x22color:",
    "isConnected",
    "petalLightsaber",
    "requestAnimationFrame",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
    ";-webkit-background-position:\x20",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    ".sad-btn",
    "#406150",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "&response_type=code&scope=identify&state=",
    ".petals.small",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    "respawnTime",
    "Centipede",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "Waveroom",
    ".stat-value",
    "(81*",
    "consumeProjDamageF",
    "yellow",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "petalStinger",
    "reason:\x20",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "*Damage:\x204\x20→\x206",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "New\x20mob:\x20Tumbleweed.",
    ".discord-btn",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "Favourite\x20object\x20of\x20a\x20woman.",
    "ame",
    "Super",
    "nAngle",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    "#fc9840",
    "deadPreDraw",
    "backgroundImage",
    "aip_complete",
    "Body",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "Missile",
    "cloneNode",
    "22nd\x20January\x202024",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "totalGamesPlayed",
    ".clear-build-btn",
    "Fire\x20Duration",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    "Soldier\x20Ant_2",
    "1st\x20July\x202023",
    "spin",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "rewards",
    "bar",
    "\x20stroke=\x22",
    "rgb(237\x2061\x20234)",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    "MOVE\x20AWAY!!",
    "#775d3e",
    "layin",
    "tail",
    "execCommand",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    "*Bone\x20armor:\x205\x20→\x206",
    "KCsdZ",
    "*Hyper:\x202%\x20→\x201%",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    "26th\x20August\x202023",
    "<div\x20class=\x22spinner\x22></div>",
    "\x20Pym\x20Particle.",
    "2357",
    "indexOf",
    "\x0aServer:\x20",
    "getTitleEl",
    "Bounces",
    "Sandstorm_1",
    "shieldHpLosePerSec",
    "KeyK",
    "#d3c66d",
    "\x20Blue",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "petalDragonEgg",
    "Continue",
    "translate(-50%,\x20",
    "Last\x20Updated:\x20",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    "\x20Wave\x20",
    "getAttribute",
    "18th\x20July\x202023",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "WRS8bSkQW4RcSLDU",
    "<div\x20class=\x22chat-item\x22></div>",
    ".zone-name",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    "wss://eu1.hornex.pro",
    "shift",
    "#f22",
    ".builds-btn",
    "\x20play",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "isIcon",
    "Very\x20sussy\x20data!",
    "Peas",
    "button",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "spawn_zone",
    "IAL\x20c",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "petalRice",
    "(?:^|;\x5cs*)",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    "Ghost",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "webSizeTiers",
    "stopWhileMoving",
    "#ffd363",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "petalWave",
    "#5ef64f",
    "iCraft",
    "YOBA",
    "*Opening\x20Lottery",
    "#bb771e",
    "poisonDamage",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    "\x0a1st\x20June\x202024\x0aAdded\x20Hornex\x20Sandbox\x20link.\x0a",
    "*Snail\x20damage:\x2020\x20→\x2025",
    ".prediction",
    "Unusual",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    "\x20!important;}",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "https://www.youtube.com/@IAmLavaWater",
    "Cement",
    "affectMobHealDur",
    "Fixed\x20duplicate\x20drops.",
    "getUint16",
    "iGamble",
    "ShiftLeft",
    "KeyL",
    "8URl",
    "rgb(126,\x20239,\x20109)",
    "26th\x20June\x202023",
    "toDataURL",
    "WRZdV8kNW5FcHq",
    "fontFamily",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "</div><div\x20class=\x22log-line\x22></div>",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    "petal",
    "Increases\x20your\x20vision.",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "Yoba_6",
    ".game-stats\x20.dialog-content",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "isRectHitbox",
    "\x0a25th\x20December\x202024\x0aFixed\x20a\x20pet\x20lag\x20exploit.\x0a",
    "rgb(",
    "render",
    "n\x20an\x20",
    "Bee",
    "projAngle",
    "checked",
    "#368316",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "isStatic",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    "hsl(110,100%,10%)",
    "Increased\x20Wave\x20mob\x20count.",
    "W77cISkNWONdQa",
    "Nerfs:",
    "#4040fc",
    "Rice",
    "endsWith",
    ".stats\x20.dialog-header\x20span",
    "users",
    "userCount",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    "spiderYoba",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "ing\x20o",
    "\x20&\x20",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "advanced\x20to\x20number\x20",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "#a07f53",
    "*Super:\x201%\x20→\x201.5%",
    "honeyTile",
    "#7d5b1f",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "#dddddd",
    "setUint16",
    "rgb(92,\x20116,\x20176)",
    "WQpcUmojoSo6",
    "target",
    "petalAvacado",
    "#8ecc51",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    "lightningBounces",
    "addToInventory",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "petalAntEgg",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "gblcVXldOG",
    "#ffe763",
    "pickupRangeTiers",
    "OPEN",
    "New\x20mob:\x20Sunflower.",
    "10th\x20August\x202023",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "px\x20",
    "Gives\x20you\x20a\x20shield.",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    "Added\x20video\x20ad.",
    "New\x20mob:\x20Dice.",
    "complete",
    "#fe98a2",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "parts",
    "0\x200",
    ".petals",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "#c8a826",
    "makeSpiderLegs",
    "rkJNdF",
    "Swastika",
    "WP10rSoRnG",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "Username\x20too\x20short!",
    "deadT",
    "More\x20wave\x20changes:",
    ".connecting",
    "#a58368",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "petalPowder",
    "fixAngle",
    "warne",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    "eyeX",
    "rgba(0,0,0,0.35)",
    "Super\x20Players",
    "misReflectDmgFactor",
    "vendor",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "petalSoil",
    "turtleF",
    "UNOFF",
    "attachPetal",
    "u\x20hav",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "5th\x20January\x202024",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "successCount",
    "antennae",
    "goofy\x20ahh\x20insect\x20robbery",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    ".zone-mobs",
    ".grid\x20.title",
    "hide-icons",
    "consumeProjHealth",
    "PedoX",
    "Redesigned\x20some\x20mobs.",
    ".clown-cb",
    "fontSize",
    "Snail",
    "petalSkull",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    "%\x20!important",
    "Pet\x20Heal",
    ".low-quality-cb",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    ".chat",
    "toLow",
    "video-ad-skipped",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "totalAccounts",
    ".total-kills",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    "byteLength",
    "OQM)",
    "Spider\x20Yoba",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    "oninput",
    "Your\x20Profile",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "\x0a15th\x20August\x202024\x0aLottery\x20participants\x20&\x20winners\x20are\x20now\x20logged\x20in\x20Discord\x20server.\x20Join\x20now!\x0a",
    "Added\x20level\x20up\x20reward\x20table.",
    "Flower\x20Health",
    "arc",
    "Extra\x20Range",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    "petalMagnet",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "uiY",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "Failed\x20to\x20find\x20region.",
    "13th\x20September\x202023",
    "code",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    "dontResolveCol",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "719574lHbJUW",
    "\x22></span></div>",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "Health",
    "miter",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    "setCount",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    "clientHeight",
    "nHealth",
    "breedTimerAlpha",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "Dragon_5",
    "rgb(255,\x20230,\x2093)",
    ".tv-prev",
    "Duration",
    "tals.",
    "hornex-pro_970x250",
    "Breed\x20Strength",
    "Rock_1",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "Soldier\x20Ant_1",
    "loggedIn",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "\x20all\x20",
    ".username-link",
    "(auto\x20reloading\x20in\x20",
    "255164lGKtfN",
    "Soaks\x20damage\x20over\x20time.",
    "rgb(255,\x2043,\x20117)",
    "21st\x20January\x202024",
    "Mushroom",
    "padStart",
    "petalShell",
    "W5T8c2BdUs/cJHBcR8o4uG",
    "*Rock\x20health:\x20150\x20→\x20200",
    "Game\x20released\x20to\x20public!",
    "pickupRange",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    "stroke",
    "Fussy\x20Sucker",
    "%</option>",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "hit.p",
    "FSoixsnA",
    ".reload-btn",
    "bolder\x2025px\x20",
    "rect",
    "log",
    "EU\x20#2",
    ".reload-timer",
    "2nd\x20July\x202023",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "#ffe667",
    "petalSuspill",
    "shield",
    "6th\x20August\x202023",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    ".container",
    "[K]\x20Keyboard\x20Controls:\x20",
    "day",
    "#5849f5",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    "hpRegenPerSec",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    "projHealth",
    "hasAbsorbers",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    "euSandbox",
    "onclick",
    "3m^(",
    "Extra\x20Vision",
    "\x27s\x20profile...",
    ".craft-rate",
    "maxTimeAlive",
    "labelSuffix",
    "[censored]",
    "position",
    "babyAnt",
    "#000",
    "petalPincer",
    "fixed_player_health_size",
    "Dandelion",
    "iMood",
    "1167390UrVkfV",
    "#764b90",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    "onmessage",
    "right",
    "/dlSprite",
    "</option>",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    "Skull",
    "#33a853",
    "\x22></div>\x0a\x09\x09\x09",
    "Space",
    "spikePath",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    "splice",
    "<div\x20class=\x22btn\x22>\x0a\x09\x09\x09\x09<span\x20stroke=\x22",
    "choked",
    ".lottery-btn",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "Beetle_2",
    "*Arrow\x20health:\x20180\x20→\x20220",
    ".debug-info",
    "Gas",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    ".changelog\x20.dialog-content",
    "ll\x20yo",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "ondragover",
    "accountNotFound",
    "removeT",
    "\x22\x20stroke=\x22",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "https://www.youtube.com/@KePiKgamer",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Connected!",
    "Added\x20maze\x20in\x20Waveroom:",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    "accountId",
    "lightningDmg",
    "class=\x22chat-cap\x22",
    "petalCement",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "shop",
    "#15cee5",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    "innerHTML",
    "New\x20petal:\x20Wig.",
    "local",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Peas\x20damage:\x208\x20→\x2010",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    "size",
    "deltaY",
    "Honey\x20factory.",
    "petalDandelion",
    "#222222",
    "createElement",
    "showItemLabel",
    "https://auth.hornex.pro/discord",
    "hideUserCount",
    "dev",
    "#a17c4c",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    ".max-score",
    "tCkxW5FcNmkQ",
    "affectHealDur",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    "level",
    "oHealth",
    ".hud",
    "Invalid\x20username.",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    "*Fire\x20damage:\x209\x20→\x2015",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    "<div\x20style=\x22color:\x20",
    "image/png",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    "Poison\x20Reduction",
    "210ZoZRjI",
    "password",
    "Wave\x20",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "Buffed\x20Lightsaber:",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "Sunflower",
    "***",
    "#695118",
    "KeyC",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    "d8k3BqDKF8o0WPu",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "&quot;",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "#9e7d24",
    "WRyiwZv5x3eIdtzgdgC",
    "#288842",
    "Yoba_1",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x22",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    "oAngle",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    "Rock\x20Egg",
    ".discord-avatar",
    "(reloading...)",
    "isFakeChat",
    "petalLight",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "5th\x20September\x202023",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    "btn",
    "1st\x20April\x202024",
    "containerDialog",
    "30th\x20June\x202023",
    "*Increased\x20drop\x20rates.",
    "26th\x20July\x202023",
    "#ff7380",
    "#7d5098",
    "rgb(43,\x20255,\x20163)",
    "petalStickbug",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "#a2dd26",
    "leaders",
    "\x0a\x0a\x09\x09\x09",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "rock",
    "wig",
    "*Rice\x20damage:\x204\x20→\x205",
    "onmousemove",
    "/s\x20for\x20all\x20tiles)",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "16th\x20June\x202023",
    "pro",
    "regenAfterHp",
    "#8b533f",
    "#5ab6ab",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "#fdda40",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "Dragon",
    "parse",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "renderBelowEverything",
    "#8f5f34",
    "Yoba_4",
    "#ff3333",
    "3220DFvaar",
    "#ffd941",
    "#7dad0c",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    "\x22></div>\x0a\x09</div>",
    "scorp",
    "j[zf",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "mobGallery",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "isPlayer",
    "titleColor",
    "undefined",
    "*Halo\x20now\x20stacks.",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "\x20won\x20and\x20got\x20extra",
    "rgb(222,111,44)",
    "projPoisonDamage",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "style=\x22color:",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    "Leave",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "NHkBqi",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    "Invalid\x20account!",
    "content",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    ";\x20-o-background-position:",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    ".rewards\x20.dialog-content",
    "clipboard",
    ".petals-picked",
    "body",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    "11th\x20August\x202023",
    "drawImage",
    "ArrowDown",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "rgb(219\x20130\x2041)",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    "Soldier\x20Ant_4",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    "killed",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    ".dc-group",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "25th\x20June\x202023",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "petalSpiderEgg",
    "Sandstorm_5",
    "KeyX",
    "*Epic:\x2075\x20→\x2065",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "version",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "shadowColor",
    "Missile\x20Poison",
    "hsl(60,60%,60%)",
    "cacheRendered",
    "keydown",
    "fake",
    "iReqGambleList",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    ".lb-btn",
    "fireDamageF",
    "Dragon_2",
    "http://localhost:6767/",
    ".show-population-cb",
    "7th\x20October\x202023",
    "getRandomValues",
    "*Bone\x20armor:\x204\x20→\x205",
    "Reduced\x20mobile\x20UI\x20scale.",
    "WRRdT8kPWO7cMG",
    "Powder",
    "nigersaurus",
    "cantPerformAction",
    "files",
    "hpRegen75PerSec",
    "Sword",
    "Epic",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "spawnT",
    "unknown",
    "style=\x22background-position:\x20",
    "onwheel",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    "drawDragon",
    "state",
    "nameEl",
    "passive",
    "max",
    "push",
    "Statue",
    "petalArrow",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    ".collected",
    ".swap-btn",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    "nLrqsbisiv0SrmoD",
    "extraSpeedTemp",
    "queenAnt",
    "*Gas\x20poison:\x2030\x20→\x2040",
    "https://www.youtube.com/@FussySucker",
    "*Fire\x20health:\x2070\x20→\x2080",
    "#393cb3",
    ".grid",
    "canRemove",
    "lineJoin",
    "adplayer",
    "Ghost_7",
    "ignore\x20if\x20u\x20already\x20subbed",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    "drawWingAndHalo",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    "bolder\x2017px\x20",
    "Basic",
    "Fleepoint",
    "14th\x20August\x202023",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    "changelog",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "https",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    "8th\x20July\x202023",
    ".debug-cb",
    "\x22\x20stroke=\x22Hornex\x20Sandbox:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Singleplayer\x20Hornex\x20with\x20admin\x20commands\x20and\x20access\x20to\x20unlimited\x20petals.\x20Might\x20be\x20fun\x20for\x20testing\x20random\x20stuff.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x2030+\x20dev\x20commands\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Access\x20to\x20all\x20rarity\x20petals!\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Craft\x20billions\x20of\x20petals!\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Sussy\x20Map\x20Editor\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Some\x20new\x20mobs\x20&\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Go\x20check\x20it\x20out!\x22></div>\x0a\x09</div>",
    "#353331",
    "repeat",
    "#ab5705",
    "Shield",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    ".mob-gallery\x20.dialog-content",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "25th\x20August\x202023",
    "#724c2a",
    "W5bKgSkSW78",
    "ENTERING!!",
    "addCount",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    ".build-petals",
    "reverse",
    "Ant\x20Egg",
    "petalExpander",
    "deg)",
    ".absorb-petals-btn",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "sunflower",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "#e05748",
    "<style>\x0a\x09\x09",
    "hide-chat",
    "KeyS",
    ".expand-btn",
    "beehive",
    "querySelectorAll",
    ".player-list",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    "renderOverEverything",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    "petalStarfish",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "save",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    "#444444",
    "find",
    "Beetle_1",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    "#21c4b9",
    "turtle",
    "text",
    "getHurtColor",
    "quadraticCurveTo",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    "W43cOSoOW4lcKG",
    ".\x22></span></div>",
    "#363685",
    ".minimap",
    "forEach",
    "show_health",
    "Increases\x20petal\x20spin\x20speed.",
    "show-petal",
    "Antennae",
    "keyup",
    "fillRect",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    ".absorb-btn\x20.tooltip\x20span",
    "#b05a3c",
    "now",
    "l\x20you",
    "terms.txt",
    "tagName",
    "unsuccessful",
    "countEl",
    "href",
    "New\x20mob:\x20Statue.",
    "Error\x20refreshing\x20ad.",
    ".settings-btn",
    "cmk/auqmq8o8WOngW79c",
    "23rd\x20August\x202023",
    "New\x20score\x20formula.",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    "slayed",
    "worldW",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    "KeyY",
    "*Gas\x20health:\x20250\x20→\x20200",
    "flowerPoisonF",
    "ceil",
    "#cfcfcf",
    "scale2",
    "\x20XP",
    "\x20in\x20view\x20/\x20",
    "Decreases",
    "*Peas\x20damage:\x2015\x20→\x2020",
    "onClick",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    ".time-alive",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "mousedown",
    "arial",
    "Spider",
    "WPPnavtdUq",
    "nSize",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    "floor",
    "petalIris",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "#555555",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    "Hornet",
    "W7dcP8k2W7ZcLxtcHv0",
    "gambleList",
    "rad)",
    "absorbPetalEl",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "Zert",
    "lineTo",
    "lobbyClosing",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "breedTimer",
    "poisonT",
    "accountData",
    "\x22></div>\x0a\x09\x09",
    "New\x20petal:\x20Sponge",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "petalPollen",
    "Passive\x20Heal",
    "#fbdf26",
    "cEca",
    "18th\x20September\x202023",
    "angryT",
    ".continue-btn",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    "uiAngle",
    "angle",
    "Connecting\x20to\x20",
    "mobKilled",
    "#654a19",
    "Spider\x20Legs",
    "they\x20copied\x20florr\x20code\x20omg!!",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "GsP9",
    "Comes\x20to\x20avenge\x20mobs.",
    "makeMissile",
    "10px",
    "qCkBW5pcR8kD",
    "*Reduced\x20HP\x20depletion.",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    "\x0a4th\x20May\x202024\x0aFixed\x20a\x20player\x20dupe\x20bug.\x20\x0aBalances:\x0a*Taco\x20healing:\x209\x20→\x2010\x0a*Sunflower\x20shield:\x201\x20→\x202.5\x0a*Shell\x20shield:\x208\x20→\x2012\x0a*Buffed\x20Yoba\x20Egg\x20by\x2050%\x0a",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "petalStr",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "Mob\x20Size\x20Change",
    "fromCharCode",
    "orbitRange",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    "<div\x20stroke=\x22Last\x20Updated:\x2010s\x20ago\x22></div>",
    "keyCheckFailed",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    "bubble",
    "253906KWTZJW",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    "Soldier\x20Ant_5",
    "Server-side\x20optimizations.",
    "soldierAntFire",
    "2090768fiNzSa",
    "#854608",
    "<div>\x0a\x09\x09<span\x20stroke=\x22",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "show_grid",
    "#c69a2c",
    "isPortal",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    "Ladybug",
    "#333333",
    ".mob-gallery",
    "petalerDrop",
    "agroRangeDec",
    "*Pincer\x20damage:\x205\x20→\x206",
    "#ff7892",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "pet",
    "1st\x20August\x202023",
    "isBooster",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    ".rewards-btn",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "Orbit\x20Shlongation",
    "#aaaaaa",
    ".flower-stats",
    "sk.",
    "json",
    "percent",
    "Sandstorm",
    "lightblue",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "innerWidth",
    "Reflected\x20Missile\x20Damage",
    "fixed",
    "RuinedLiberty",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    "Boomerang.",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    "Tumbleweed",
    "#dbab2e",
    "blur",
    "#347918",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "10QIdaPR",
    "isShiny",
    "continent_code",
    "crafted",
    "onmouseup",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    "remove",
    ".inventory\x20.inventory-petals",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "globalAlpha",
    "usernameClaimed",
    "setTargetByEvent",
    "#d3d14f",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "location",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    "rgba(0,0,0,0.3)",
    "strokeText",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    ".spawn-zones",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "rgba(0,0,0,0.4)",
    "respawnTimeTiers",
    "rgba(0,0,0,0.15)",
    ".screen",
    "Even\x20more\x20wave\x20changes:",
    "%\x20success\x20rate",
    "WP3dRYddTJC",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    ".minimap-cross",
    "*Light\x20damage:\x2012\x20→\x2010",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "draw",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "spotPath_",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    "ellipse",
    "\x20Ultra",
    "hornex",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    "bqpdSW",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    "\x20from\x20",
    "rgba(0,\x200,\x200,\x200.2)",
    "13th\x20August\x202023",
    "hasHalo",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "lineCap",
    "spawnOnDie",
    "createObjectURL",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "#cdbb48",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    ".main",
    "WQ7dTmk3W6FcIG",
    "soldierAnt",
    "workerAntFire",
    "Taco",
    "14th\x20July\x202023",
    "https://www.youtube.com/@NeowmHornex",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    "documentElement",
    "#b58500",
    "crab",
    "isDevelopmentMode",
    "Scorpion",
    "rainbow-text",
    "29th\x20June\x202023",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "putImageData",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "*Yoba\x20Egg\x20buff.",
    "*Light\x20damage:\x2013\x20→\x2012",
    "petalPoo",
    "26th\x20September\x202023",
    "Yin\x20Yang",
    "offsetHeight",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "span",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    "dir",
    "mouse2",
    "cmd",
    "Goofy\x20little\x20wanderer.",
    "shieldRegenPerSec",
    "host",
    "29th\x20January\x202024",
    ".absorb-petals",
    ";position:absolute;top:",
    "builds",
    ".discord-area",
    "Invalid\x20petal\x20name:\x20",
    "width",
    "makeHole",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    "#4e3f40",
    ".global-user-count",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    "rgba(0,\x200,\x200,\x200.15)",
    ".killer",
    "textAlign",
    "childIndex",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "updatePos",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "nice\x20stolen\x20florr\x20assets",
    "\x0a22nd\x20May\x202024\x0aNew\x20setting:\x20Show\x20Health.\x20Press\x20Y\x20to\x20toggle.\x0aNew\x20setting:\x20Fixed\x20Flower\x20Health\x20Bar\x20Size.\x0aNew\x20setting:\x20Fixed\x20Mob\x20Health\x20Bar\x20Size.\x0aNew\x20setting:\x20Change\x20Font.\x0aHoney\x20now\x20also\x20shows\x20tile\x20count\x20&\x20total\x20damage\x20casted\x20by\x20all\x20tiles\x20in\x201\x20second.\x20Do\x20note\x20the\x20numbers\x20are\x20for\x20most\x20ideal\x20case.\x20Most\x20of\x20the\x20time\x20you\x20won\x27t\x20get\x20that\x20much\x20damage.\x0a",
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "#e94034",
    "petalSword",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    "fireTime",
    "angry",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "Hornet_3",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "iLeaveGame",
    "*Swastika\x20health:\x2030\x20→\x2035",
    "totalPetals",
    "isSleeping",
    "exp",
    "Hornet_5",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "Ghost_1",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "#ab7544",
    "show_damage",
    "<div\x20class=\x22data-top-area\x22>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Current\x20Page:\x22></span>\x0a\x09\x09\x09\x09<select\x20tabindex=\x22-1\x22></select>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Search:\x22></span>\x0a\x09\x09\x09\x09<input\x20class=\x22textbox\x20data-search\x22\x20type=\x22text\x22\x20placeholder=\x22Enter\x20value...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<div\x20class=\x22data-search-result\x22\x20style=\x22display:none;\x22></div>\x0a\x09\x09</div>",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "compression\x20version\x20not\x20supported:\x20",
    "Yoba",
    ".xp",
    "timePlayed",
    "focus",
    "#39b54a",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    "en-US",
    "petalTaco",
    "OFF",
    "KeyF",
    "Extra\x20Spin\x20Speed",
    "uiCountGap",
    "KeyU",
    "Spider_2",
    "20th\x20July\x202023",
    "n\x20war",
    "Baby\x20Ant",
    "WP4dWPa7qCklWPtcLq",
    "petRoamFactor",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    "function",
    ".insta-btn",
    "hide-zone-mobs",
    "Unknown\x20message\x20id:\x20",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    "queen",
    "#bbbbbb",
    "#76ad45",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "/dlPetal",
    "ANKUAsHKW5LZmq",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "ability",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    "Dragon_1",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    "setValue",
    ".lottery\x20.dialog-content",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "\x22></span>\x0a\x09\x09\x09</div>",
    "consumeProj",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    "%;left:",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "#A8A7A4",
    "insert\x20something\x20here...",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "WOziW7b9bq",
    "#333",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    "24th\x20July\x202023",
    "All\x20Petals",
    "Petal\x20Slots",
    "#709d45",
    "change-font",
    "100%",
    "pedox",
    ".featured",
    "doRemove",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "offsetWidth",
    "ondrop",
    "#416d1e",
    "tumbleweed",
    "iBreedTimer",
    "Grapes",
    "kers\x20",
    "WRzmW4bPaa",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    "></div>",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    "replace",
    "#754a8f",
    "Added\x201\x20AS\x20lobby.",
    "#f54ce7",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "sameTypeColResolveOnly",
    "join",
    "air",
    "#8f5db0",
    "DMCA-ed",
    "connect",
    "\x22></span>",
    "preventDefault",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "isHudPetal",
    ".collected-rarities",
    "toFixed",
    "petalBubble",
    "mobId",
    "Video\x20AD\x20success!",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "\x22></span>\x0a\x09</div>",
    "zvNu",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "petHealF",
    "#328379",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "iCheckKey",
    "finalMsg",
    "waveStarting",
    "fixed_name_size",
    "Missile\x20Health",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "Server\x20side\x20performance\x20improvements.",
    "transition",
    "\x20at\x20y",
    "oProg",
    "Dahlia",
    "Stick",
    "&#Uz",
    "labelPrefix",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "Former\x20student\x20of\x20Yoda.",
    "web",
    "Need\x20to\x20be\x20Lvl\x20",
    "values",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "Provide\x20a\x20name\x20dummy.",
    "restore",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "#2da14d",
    "%zY4",
    "setUserCount",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "...",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "*Heavy\x20damage:\x209\x20→\x2010",
    "19th\x20July\x202023",
    "damage",
    "Pill",
    "\x20(Lvl\x20",
    "\x20clie",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    ".death-info",
    "#e0c85c",
    "ui_scale",
    "#b28b29",
    "#8a6b1f",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "*Rock\x20health:\x2045\x20→\x2050",
    "honeyDmg",
    "Desert",
    ".close-btn",
    "desc",
    "top",
    "beginPath",
    ".changelog",
    "u\x20are",
    "val",
    "*Banana\x20health:\x20170\x20→\x20400",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "then",
    "#c76cd1",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    "Shrinker",
    "petHealthFactor",
    "/s\x20if\x20H<50%",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    "#a82a00",
    "occupySlot",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "6th\x20November\x202023",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    "#6f5514",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "server",
    "#ff63eb",
    ".fixed-mob-health-cb",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    ".my-player",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    ".score-overlay",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    "wss://as1.hornex.pro",
    "length",
    "petalEgg",
    "31st\x20July\x202023",
    "innerHeight",
    "#b0473b",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "Yoba_2",
    "6th\x20July\x202023",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    ".settings",
    ".shop-btn",
    "hypot",
    "https://www.instagram.com/zertalious",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    "\x20and\x20",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "rgba(0,0,0,",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    "\x20by",
    "timeJoined",
    "\x20You\x20",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    "backgroundColor",
    "#34f6ff",
    "acker",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    "25th\x20January\x202024",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    "absorb",
    "s...)",
    "sqrt",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    "passiveBoost",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    ".petal.empty",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "Yoba_3",
    "BrnPE",
    "Hornet_1",
    "Dragon_3",
    "\x20online)",
    "Antidote",
    "Copied!",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "KeyV",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    "iReqAccountData",
    "#db4437",
    ".absorb\x20.dialog-header\x20span",
    "petalsLeft",
    "Flower\x20Poison",
    "petalPacman",
    "onmousedown",
    "Fixed\x20Rice.",
    "%nick%",
    "\x22></span>\x20",
    "#a2eb62",
    "writeText",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    "onStart",
    "reload",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    "55078DZMiSD",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    "fillText",
    "3rd\x20August\x202023",
    "toLocaleDateString",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    "WAVE",
    "Kills\x20Needed",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "month",
    "WR7cQCkf",
    "#38c125",
    "15th\x20June\x202023",
    "24th\x20August\x202023",
    "Added\x20Waves.",
    "*Health:\x20100\x20→\x20120",
    "show_helper",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    ".total-accounts",
    "progressEl",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    "hsla(0,0%,100%,0.15)",
    "Spider_3",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    "mouse0",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    "<div\x20class=\x22btn\x20tier-",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    ".absorb",
    "%\x20-\x200.8em*",
    "ffa\x20sandbox",
    "are\x20p",
    "bottom",
    "consumeProjDamage",
    "avacado",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    "hasEye",
    ".credits-btn",
    "projDamageF",
    "nt\x20an",
    "canvas",
    "centipedeBody",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "Statue\x20of\x20RuinedLiberty.",
    "uiX",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "hideAfterInactivity",
    "craftResult",
    "localStorage\x20denied.",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    "*Swastika\x20health:\x2020\x20→\x2025",
    "onopen",
    "sort",
    "#feffc9",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    "W6HBdwO0",
    "running...",
    ".gamble-prediction",
    "number",
    "iReqGlb",
    "petalCactus",
    "tierStr",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    "*Recuded\x20mob\x20count.",
    "LEAVE\x20ZONE!!",
    "isLightsaber",
    ":scope\x20>\x20.petal",
    "isPetal",
    "and\x20a",
    "hsla(0,0%,100%,0.3)",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    ".level-progress",
    "targetPlayer",
    "<div\x20class=\x22dialog\x20tier-",
    "Leaf",
    "It\x20has\x20sussy\x20movement.",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    "dur",
    "extraRangeTiers",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    "consumeProjHealthF",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    "#82c92f",
    "fossil",
    "Crab\x20redesign.",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "have\x20",
    "numAccounts",
    "flowerPoison",
    "marginLeft",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    "9th\x20August\x202023",
    ".lottery-rarities",
    "#c1ab00",
    "12th\x20November\x202023",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "i\x20make\x20cool\x20videos",
    "15th\x20August\x202023",
    "onresize",
    "Beetle",
    "teal\x20",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "petalCotton",
    "ad\x20refresh",
    "origin",
    "ontouchstart",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    "shieldReload",
    "waveShowTimer",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "killsNeeded",
    "appendChild",
    "bruh",
    "Ant\x20Hole",
    "destroyed",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20class=\x22username-link\x22\x20stroke=\x22",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "hsl(110,100%,50%)",
    ".\x20Hac",
    "shinyCol",
    "Failed\x20to\x20load\x20game\x20stats!",
    "petalSnail",
    "sizeIncrease",
    "released",
    "6fCH",
    "randomUUID",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    "wss://eu2.hornex.pro",
    "*Powder\x20damage:\x2015\x20→\x2020",
    ".loader",
    "petalSalt",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    ".waveroom-info",
    "15807WcQReK",
    "#ff4f4f",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "New\x20rarity:\x20Hyper.",
    "keyCode",
    "getBoundingClientRect",
    ".joystick-knob",
    "/tile\x20(",
    "gridColumn",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    "legD",
    "blue",
    "\x20petals",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    "yoba",
    "pacman",
    "totalTimePlayed",
    "ShiftRight",
    "drops",
    "sprite",
    "strokeRect",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "lastResizeTime",
    "12th\x20July\x202023",
    "Hornet\x20Egg",
    "petalChromosome",
    ".chat-input",
    "*Arrow\x20damage:\x201\x20→\x203",
    "Increases\x20flower\x27s\x20health\x20power.",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "maxLength",
    "#ada25b",
    "identifier",
    "ICIAL",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    ".mobs-btn",
    "keyClaimed",
    "Added\x202\x20US\x20lobbies.",
    "Dragon_6",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "hasEars",
    "*Missile\x20damage:\x2050\x20→\x2055",
    "redHealth",
    "#634418",
    "enable_min_scaling",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "Can\x27t\x20perform\x20that\x20action.",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    "hornet",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "#111",
    "extraSpeed",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "duration",
    "Spawn\x20zone\x20changes:",
    "KeyR",
    "24th\x20January\x202024",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "#bebe2a",
    "EU\x20#1",
    "seed",
    "oPlayerY",
    "New\x20mob:\x20Sponge",
    "700224yofVZu",
    "Added\x20Discord\x20login.",
    "ultraPlayers",
    "oPlayerX",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "KePiKgamer",
    "heart",
    "unset",
    "Cotton",
    "#79211b",
    "*Heavy\x20health:\x20450\x20→\x20500",
    "*Cotton\x20health:\x2010\x20→\x2012",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    "*Bone\x20armor:\x208\x20→\x209",
    "*Ultra:\x20120",
    "show_bg_grid",
    "strok",
    ".ad-blocker",
    "Chromosome",
    "cDHZ",
    "catch",
    "an\x20UN",
    "US\x20#1",
    "player",
    "Iris",
    "Hornet_6",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    "#ffe200",
    ".absorb\x20.dialog-content",
    "onclose",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "5th\x20July\x202023",
    "Head",
    "#a52a2a",
    "isConsumable",
    "isSwastika",
    ".helper-cb",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "#f55",
    "27th\x20June\x202023",
    "Sandbox",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "#634002",
    "expand",
    "damageF",
    "petalHoney",
    "div",
    "1rrAouN",
    ".builds\x20.dialog-content",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    ".username-input",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    "click",
    "#8d9acc",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    "centipedeHeadDesert",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    "User\x20not\x20found.",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    "ctx",
    "fireDamage",
    "stats",
    "show_hitbox",
    "Avacado",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    "getElementById",
    "hpRegen75PerSecF",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    ".inventory",
    "*Cotton\x20health:\x208\x20→\x209",
    "34Kcvljw",
    "Luxurious\x20mansion\x20of\x20ants.",
    "boostStrength",
    "WR7dPdZdQXS",
    "#D2D1CD",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    ".dismiss-btn",
    ".bar",
    "isInventoryPetal",
    "search",
    "#4d5e56",
    "2-digit",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    ".player-count",
    "*Snail\x20health:\x2040\x20→\x2045",
    ".textbox",
    "#735b49",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    "Ant\x20Fire",
    "*Arrow\x20damage:\x203\x20→\x204",
    "#fcfe04",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "\x20at\x20least!",
    "charAt",
    "*They\x20give\x2010x\x20score.",
    "wss://hornex-",
    "petalYobaEgg",
    "antHole",
    "*Ultra:\x20125+",
    "angleOffset",
    "startsWith",
    "settings",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    "Honey\x20Damage",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "Petal\x20",
    "Dragon\x20Nest",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    "ontouchend",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "textarea",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "animationDirection",
    "A\x20default\x20petal.",
    "Poop\x20colored\x20Ladybug.",
    "8th\x20August\x202023",
    "eu_ffa",
    "roundRect",
    "loginFailed",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    "bqpdUNe",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    "targetEl",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    "activeElement",
    "Halo",
    "canRender",
    "keyAlreadyUsed",
    "?v=",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    "Beetle_3",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "ages.",
    "499zmauGz",
    "wss://us2.hornex.pro",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    "cde9W5NdTq",
    "Rock_5",
    "Damage\x20Reflection",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "19th\x20January\x202024",
    "petals!",
    "spinSpeed",
    "side",
    "Fire",
    "been\x20",
    "Account\x20import/export\x20UI\x20redesigned.",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    "Ultra",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "#c1a37d",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "entRot",
    "icBdNmoEta",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    ".absorb-btn",
    "thirdEye",
    "*Snail\x20damage:\x2015\x20→\x2020",
    "dragonNest",
    "measureText",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    "#7d893e",
    "hsla(0,0%,100%,0.1)",
    "start",
    "Honey",
    "Spider\x20Egg",
    ".shake-cb",
  ];
  a = function () {
    return Cy;
  };
  return a();
}