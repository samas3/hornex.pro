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
    },
    createInfoBox: function(){
        let div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.padding = '10px';
        div.style.zIndex = '10000';
        document.body.appendChild(div);
        return div;
    }
}
class HornexHack{
    constructor(){
        this.version = '2.4';
        this.config = {};
        this.default = {
            damageDisplay: true, // 伤害显示修改
            DDenableNumber: true, // 显示伤害数值而不是百分比（若可用）
            healthDisplay: true, // 血量显示
            disableChatCheck: true, // 是否禁用聊天内容检查
            autoRespawn: true, // 自动重生
            colorText: false, // 公告彩字
            numberNoSuffix: true, // 取消数字单位显示
            lockBuildChange: false, // 禁止更改Build
            forceLoadScript: false, // 在脚本报错后自动刷新
            autoClickPlay: true, // 重生后自动点击Play
            allowInvalidCommand: false, // 允许聊天输入无效指令
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
        this.status = document.createElement('span');
        this.name = `Hornex.PRO Hack v${this.version} by samas3`;
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
            '/change <server>': 'change server(0=eu1 1=eu2 2=as1 3=us1 4=us2 5=as2, need autoRespawn enabled)',
        };
        this.hp = 0;
        this.ingame = false;
        this.player = {
            name: "",
            entity: null
        };
        this.tracking = null;
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
            }
        };
        this.triggerKeys = Object.keys(this.triggers);
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
        div.style.bottom = '60px';
        div.style.right = '0';
        this.status.style.fontSize = '15px';
        let colors = ['red', 'yellow', 'lime', 'cyan', 'blue', 'magenta'];
        this.status.style.background = `linear-gradient(to right, ${colors.join(',')},${colors[0]})`
        this.status.style.backgroundClip = 'text';
        this.status.style.webkitTextFillColor = 'transparent';
        div.style.textAlign = 'right';
        this.status.innerHTML = this.name;
        div.appendChild(this.status);
        setInterval(() => {
            if(this.isEnabled('colorText')){
                colors = this.moveElement(colors);
                this.status.style.background = `linear-gradient(to right, ${colors.join(',')}, ${colors[0]})`
                this.status.style.backgroundClip = 'text';
            }
        }, 100);
    }
    setStatus(content){
        this.status.innerHTML = this.name + '<br>' + content;
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
    saveModule(){
        localStorage.setItem('hhConfig', JSON.stringify(this.config));
        localStorage.setItem('hhKeys', JSON.stringify(this.bindKeys));
    }
    loadModule(){
        let cfg = JSON.parse(localStorage.getItem('hhConfig'));
        let keys = JSON.parse(localStorage.getItem('hhKeys')) || {};
        if(!cfg){
            this.config = this.default;
            this.saveModule();
            return;
        }
        for(const item of this.configKeys){
            if(!cfg[item]){
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
        this.loadModule();
    }
    onload(){
        this.addChat(`${this.name} enabled!`);
        this.addChat('Type /help in chat box to get help');
        this.register();
        this.loadTrack();
        this.ingame = true;
        $_('.player-list-btn').style.display = '';
    }
    notCommand(cmd){
        return cmd[0] == '/' && !Object.keys(this.commands).map(x => (x.split(' ')[0])).includes(cmd);
    }
    getHelp(){
        this.addChat('List of commands:');
        for(const [i, j] of Object.entries(this.commands)){
            this.addChat(`${i} : ${j}`, '#ffffff');
        }
    }
    getServer(){
        let server = localStorage.getItem('server');
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
                return 'Not in Ultra/Super/Hyper zone';
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
        let builds = JSON.parse(localStorage.getItem('saved_builds'));
        delete builds[id];
        localStorage.setItem('saved_builds', JSON.stringify(builds));
        this.addChat('Deleted Build #' + id + ', refresh to view changes');
    }
    viewPetal(id){
        let builds = JSON.parse(localStorage.getItem('saved_builds'));
        builds['49'] = [id]
        localStorage.setItem('saved_builds', JSON.stringify(builds));
        this.addChat('Set Build #49 to petal ' + id + ', refresh to view changes');
    }
    viewMob(name){
        let mobs = document.querySelector('.zone-mobs');
        let id, rarityNum = parseInt(name[name.length - 1]);
        if(name.includes('_0')) name = name.substring(0, name.length - 2);
        for(const i of this.moblst[rarityNum]){
            if(i['name'].replaceAll(' ', '') == name) id = i;
        }
        if(!id){
            this.addChat(`Mob not found: ${name}`, '#ff7f50');
            return;
        }
        let mob = this.mobFunc(id, true);
        mob.tooltipDown = true;
        mobs.canShowDrops = true;
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
                        if(that.isEnabled('autoRespawn')) that.respawn();
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
        this.addChat(`You died @ ${this.getPos().join(', ')}`, '#0ff')
        if(!quitBtn.classList.contains('red')){
            //this.addChat('Respawning', '#0ff');
            quitBtn.onclick();
            if(this.isEnabled('autoClickPlay')){
                this.clickPlay(1);
            }
        }else{
            //this.addChat('Not respawning, you are in Waveroom', '#0ff');
        }
    }
    registerMain(){
        this.mainInterval = setInterval(() => {
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
        if(mob['isShiny'] && !mob['shinyFlag']){
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
      f = f - 0x1ca;
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
        parseInt(uw(0xb90)) / 0x1 +
        (-parseInt(uw(0xc56)) / 0x2) * (-parseInt(uw(0x52b)) / 0x3) +
        parseInt(uw(0x6ac)) / 0x4 +
        -parseInt(uw(0xb60)) / 0x5 +
        -parseInt(uw(0x2ae)) / 0x6 +
        -parseInt(uw(0x8ce)) / 0x7 +
        (-parseInt(uw(0x31f)) / 0x8) * (-parseInt(uw(0xed6)) / 0x9);
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0x3641a),
  (() => {
    const ux = b;
    var cF = 0x2710,
      cG = 0x1e - 0x1,
      cH = { ...cU(ux(0xc1b)), ...cU(ux(0x5e4)) },
      cI = 0x93b,
      cJ = 0x10,
      cK = 0x3c,
      cL = 0x10,
      cM = 0x3,
      cN = /^[a-zA-Z0-9_]+$/,
      cO = /[^a-zA-Z0-9_]/g,
      cP = cU(ux(0x518)),
      cQ = cU(ux(0xcee)),
      cR = cU(ux(0x7be)),
      cS = cU(ux(0x5a3)),
      cT = cU(ux(0x2cb));
    function cU(r8) {
      const uy = ux,
        r9 = r8[uy(0xb3d)]("\x20"),
        ra = {};
      for (let rb = 0x0; rb < r9[uy(0xf30)]; rb++) {
        ra[r9[rb]] = rb;
      }
      return ra;
    }
    var cV = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cW = {};
    (cW[ux(0xd25)] = 0x0), (cW[ux(0xcc1)] = 0x1), (cW[ux(0x9d3)] = 0x2);
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
      return 0x14 * Math[uz(0xe3c)](r8 * 1.05 ** (r8 - 0x1));
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
        r9++, (ra += Math[uA(0xeeb)](0x1e, ra));
      }
      return r9;
    }
    function d5(r8) {
      const uB = ux;
      return Math[uB(0x8df)](0xf3, Math[uB(0xeeb)](r8, 0xc7) / 0xc8);
    }
    function d6() {
      return d7(0x100);
    }
    function d7(r8) {
      const r9 = Array(r8);
      while (r8--) r9[r8] = r8;
      return r9;
    }
    var d8 = cU(ux(0xacc)),
      d9 = Object[ux(0x24e)](d8),
      da = d9[ux(0xf30)] - 0x1,
      db = da;
    function dc(r8) {
      const uC = ux,
        r9 = [];
      for (let ra = 0x1; ra <= db; ra++) {
        r9[uC(0xf33)](r8(ra));
      }
      return r9;
    }
    const dd = {};
    (dd[ux(0x386)] = 0x0),
      (dd[ux(0xa3a)] = 0x1),
      (dd[ux(0x6ed)] = 0x2),
      (dd[ux(0x45c)] = 0x3),
      (dd[ux(0xcd9)] = 0x4),
      (dd[ux(0xc83)] = 0x5),
      (dd[ux(0xb9d)] = 0x6),
      (dd[ux(0x77a)] = 0x7),
      (dd[ux(0x4c5)] = 0x8);
    var de = dd;
    function df(r8, r9) {
      const uD = ux;
      return Math[uD(0x8df)](0x3, r8) * r9;
    }
    const dg = {};
    (dg[ux(0x307)] = cR[ux(0x563)]),
      (dg[ux(0x493)] = ux(0x651)),
      (dg[ux(0x445)] = 0xa),
      (dg[ux(0x257)] = 0x0),
      (dg[ux(0x405)] = 0x1),
      (dg[ux(0x44e)] = 0x1),
      (dg[ux(0xc39)] = 0x3e8),
      (dg[ux(0x61c)] = 0x0),
      (dg[ux(0x999)] = ![]),
      (dg[ux(0x2b2)] = 0x1),
      (dg[ux(0x923)] = ![]),
      (dg[ux(0xa2a)] = 0x0),
      (dg[ux(0x509)] = 0x0),
      (dg[ux(0x4b9)] = ![]),
      (dg[ux(0xc63)] = 0x0),
      (dg[ux(0x93f)] = 0x0),
      (dg[ux(0x74b)] = 0x0),
      (dg[ux(0xdcf)] = 0x0),
      (dg[ux(0x76d)] = 0x0),
      (dg[ux(0x6f0)] = 0x0),
      (dg[ux(0xe2a)] = 0x1),
      (dg[ux(0x9c2)] = 0xc),
      (dg[ux(0x5ee)] = 0x0),
      (dg[ux(0x295)] = ![]),
      (dg[ux(0x920)] = void 0x0),
      (dg[ux(0x9b3)] = ![]),
      (dg[ux(0x59f)] = 0x0),
      (dg[ux(0xbf5)] = ![]),
      (dg[ux(0x968)] = 0x0),
      (dg[ux(0x90a)] = 0x0),
      (dg[ux(0x9ea)] = ![]),
      (dg[ux(0xd17)] = 0x0),
      (dg[ux(0x5b8)] = 0x0),
      (dg[ux(0x951)] = 0x0),
      (dg[ux(0x66a)] = ![]),
      (dg[ux(0xbe7)] = 0x0),
      (dg[ux(0xb63)] = ![]),
      (dg[ux(0x901)] = ![]),
      (dg[ux(0x521)] = 0x0),
      (dg[ux(0x4f5)] = 0x0),
      (dg[ux(0x5c1)] = 0x0),
      (dg[ux(0xddf)] = ![]),
      (dg[ux(0xbfd)] = 0x1),
      (dg[ux(0x592)] = 0x0),
      (dg[ux(0xbfa)] = 0x0),
      (dg[ux(0x358)] = 0x0),
      (dg[ux(0xaa6)] = 0x0),
      (dg[ux(0x6dc)] = 0x0),
      (dg[ux(0x468)] = 0x0),
      (dg[ux(0x5eb)] = 0x0),
      (dg[ux(0xe3f)] = 0x0),
      (dg[ux(0x453)] = 0x0),
      (dg[ux(0x8ed)] = 0x0),
      (dg[ux(0xe2f)] = 0x0),
      (dg[ux(0x367)] = 0x0),
      (dg[ux(0x9e5)] = 0x0),
      (dg[ux(0x8cf)] = 0x0),
      (dg[ux(0x1f8)] = ![]),
      (dg[ux(0xefd)] = 0x0),
      (dg[ux(0x4ab)] = 0x0),
      (dg[ux(0x42a)] = 0x0);
    var dh = dg;
    const di = {};
    (di[ux(0xc49)] = ux(0xc50)),
      (di[ux(0x493)] = ux(0x625)),
      (di[ux(0x307)] = cR[ux(0x563)]),
      (di[ux(0x445)] = 0x9),
      (di[ux(0x405)] = 0xa),
      (di[ux(0x44e)] = 0xa),
      (di[ux(0xc39)] = 0x9c4);
    const dj = {};
    (dj[ux(0xc49)] = ux(0xc5f)),
      (dj[ux(0x493)] = ux(0xe46)),
      (dj[ux(0x307)] = cR[ux(0xc31)]),
      (dj[ux(0x445)] = 0xd / 1.1),
      (dj[ux(0x405)] = 0x2),
      (dj[ux(0x44e)] = 0x37),
      (dj[ux(0xc39)] = 0x9c4),
      (dj[ux(0x61c)] = 0x1f4),
      (dj[ux(0x923)] = !![]),
      (dj[ux(0xa51)] = 0x28),
      (dj[ux(0x509)] = Math["PI"] / 0x4);
    const dk = {};
    (dk[ux(0xc49)] = ux(0x64d)),
      (dk[ux(0x493)] = ux(0x9d4)),
      (dk[ux(0x307)] = cR[ux(0xb98)]),
      (dk[ux(0x445)] = 0x8),
      (dk[ux(0x405)] = 0x5),
      (dk[ux(0x44e)] = 0x5),
      (dk[ux(0xc39)] = 0xdac),
      (dk[ux(0x61c)] = 0x3e8),
      (dk[ux(0xa2a)] = 0xb),
      (dk[ux(0x66a)] = !![]);
    const dl = {};
    (dl[ux(0xc49)] = ux(0x45b)),
      (dl[ux(0x493)] = ux(0xafb)),
      (dl[ux(0x307)] = cR[ux(0xcb5)]),
      (dl[ux(0x445)] = 0x6),
      (dl[ux(0x405)] = 0x5),
      (dl[ux(0x44e)] = 0x5),
      (dl[ux(0xc39)] = 0xfa0),
      (dl[ux(0x999)] = !![]),
      (dl[ux(0x2b2)] = 0x32);
    const dm = {};
    (dm[ux(0xc49)] = ux(0x5c7)),
      (dm[ux(0x493)] = ux(0x449)),
      (dm[ux(0x307)] = cR[ux(0x9a1)]),
      (dm[ux(0x445)] = 0xb),
      (dm[ux(0x405)] = 0xc8),
      (dm[ux(0x44e)] = 0x1e),
      (dm[ux(0xc39)] = 0x1388);
    const dn = {};
    (dn[ux(0xc49)] = ux(0xd7e)),
      (dn[ux(0x493)] = ux(0xe54)),
      (dn[ux(0x307)] = cR[ux(0x3b5)]),
      (dn[ux(0x445)] = 0x8),
      (dn[ux(0x405)] = 0x2),
      (dn[ux(0x44e)] = 0xa0),
      (dn[ux(0xc39)] = 0x2710),
      (dn[ux(0x9c2)] = 0xb),
      (dn[ux(0x5ee)] = Math["PI"]),
      (dn[ux(0xb04)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dp = {};
    (dp[ux(0xc49)] = ux(0x8d0)),
      (dp[ux(0x493)] = ux(0xbaa)),
      (dp[ux(0x920)] = de[ux(0x386)]),
      (dp[ux(0x6f0)] = 0x1e),
      (dp[ux(0xbf3)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dq = {};
    (dq[ux(0xc49)] = ux(0xdef)),
      (dq[ux(0x493)] = ux(0x58a)),
      (dq[ux(0x920)] = de[ux(0xa3a)]);
    const dr = {};
    (dr[ux(0xc49)] = ux(0xedb)),
      (dr[ux(0x493)] = ux(0x378)),
      (dr[ux(0x307)] = cR[ux(0x254)]),
      (dr[ux(0x445)] = 0xb),
      (dr[ux(0xc39)] = 0x9c4),
      (dr[ux(0x405)] = 0x14),
      (dr[ux(0x44e)] = 0x8),
      (dr[ux(0x4b9)] = !![]),
      (dr[ux(0xc63)] = 0x2),
      (dr[ux(0x6b3)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (dr[ux(0x93f)] = 0x14);
    const ds = {};
    (ds[ux(0xc49)] = ux(0xcef)),
      (ds[ux(0x493)] = ux(0xbc3)),
      (ds[ux(0x307)] = cR[ux(0xc53)]),
      (ds[ux(0x445)] = 0xb),
      (ds[ux(0x405)] = 0x14),
      (ds[ux(0x44e)] = 0x14),
      (ds[ux(0xc39)] = 0x5dc),
      (ds[ux(0xdcf)] = 0x64),
      (ds[ux(0x566)] = 0x1);
    const du = {};
    (du[ux(0xc49)] = ux(0x716)),
      (du[ux(0x493)] = ux(0xf11)),
      (du[ux(0x307)] = cR[ux(0xc38)]),
      (du[ux(0x445)] = 0x7),
      (du[ux(0x405)] = 0x5),
      (du[ux(0x44e)] = 0xa),
      (du[ux(0xc39)] = 0x258),
      (du[ux(0xe2a)] = 0x1),
      (du[ux(0x295)] = !![]),
      (du[ux(0xb04)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dv = {};
    (dv[ux(0xc49)] = ux(0x72d)),
      (dv[ux(0x493)] = ux(0xd0d)),
      (dv[ux(0x307)] = cR[ux(0xb3a)]),
      (dv[ux(0x445)] = 0xb),
      (dv[ux(0x405)] = 0xf),
      (dv[ux(0x44e)] = 0x1),
      (dv[ux(0xc39)] = 0x3e8),
      (dv[ux(0x9b3)] = !![]),
      (dv[ux(0x66a)] = !![]);
    const dw = {};
    (dw[ux(0xc49)] = ux(0xacb)),
      (dw[ux(0x493)] = ux(0xea4)),
      (dw[ux(0x307)] = cR[ux(0x41e)]),
      (dw[ux(0x445)] = 0xb),
      (dw[ux(0x405)] = 0xf),
      (dw[ux(0x44e)] = 0x5),
      (dw[ux(0xc39)] = 0x5dc),
      (dw[ux(0x59f)] = 0x32),
      (dw[ux(0xce1)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dx = {};
    (dx[ux(0xc49)] = ux(0x421)),
      (dx[ux(0x493)] = ux(0x997)),
      (dx[ux(0x307)] = cR[ux(0xc27)]),
      (dx[ux(0x445)] = 0x7),
      (dx[ux(0x405)] = 0x19),
      (dx[ux(0x44e)] = 0x19),
      (dx[ux(0xe2a)] = 0x4),
      (dx[ux(0xc39)] = 0x3e8),
      (dx[ux(0x61c)] = 0x1f4),
      (dx[ux(0x9c2)] = 0x9),
      (dx[ux(0x509)] = Math["PI"] / 0x8),
      (dx[ux(0x923)] = !![]),
      (dx[ux(0xa51)] = 0x28);
    const dy = {};
    (dy[ux(0xc49)] = ux(0x32f)),
      (dy[ux(0x493)] = ux(0x247)),
      (dy[ux(0x307)] = cR[ux(0xdab)]),
      (dy[ux(0x445)] = 0x10),
      (dy[ux(0x405)] = 0x0),
      (dy[ux(0x2fa)] = 0x1),
      (dy[ux(0x44e)] = 0x0),
      (dy[ux(0xc39)] = 0x157c),
      (dy[ux(0x61c)] = 0x1f4),
      (dy[ux(0x9a5)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dy[ux(0xe96)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dy[ux(0x968)] = 0x3c),
      (dy[ux(0xbf5)] = !![]),
      (dy[ux(0x66a)] = !![]);
    const dz = {};
    (dz[ux(0xc49)] = ux(0xa95)),
      (dz[ux(0x493)] = ux(0xf09)),
      (dz[ux(0x307)] = cR[ux(0xba5)]),
      (dz[ux(0xc39)] = 0x5dc),
      (dz[ux(0x9ea)] = !![]),
      (dz[ux(0x405)] = 0xa),
      (dz[ux(0x44e)] = 0x14),
      (dz[ux(0x445)] = 0xd);
    const dA = {};
    (dA[ux(0xc49)] = ux(0x44c)),
      (dA[ux(0x493)] = ux(0x8de)),
      (dA[ux(0x307)] = cR[ux(0x3ba)]),
      (dA[ux(0xc39)] = 0xdac),
      (dA[ux(0x61c)] = 0x1f4),
      (dA[ux(0x405)] = 0x5),
      (dA[ux(0x44e)] = 0x5),
      (dA[ux(0x445)] = 0xa),
      (dA[ux(0xd17)] = 0x46),
      (dA[ux(0xb79)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
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
        name: ux(0xa04),
        desc: ux(0x70c),
        ability: de[ux(0x6ed)],
        orbitRange: 0x32,
        orbitRangeTiers: dc((r8) => 0x32 + r8 * 0x46),
      },
      {
        name: ux(0xd52),
        desc: ux(0x7c0),
        ability: de[ux(0x45c)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dz,
      dA,
      {
        name: ux(0x285),
        desc: ux(0xe39),
        type: cR[ux(0x4ba)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][ux(0x696)](
          (r8) => r8 * 0.8
        ),
      },
      {
        name: ux(0xe4b),
        desc: ux(0x97d),
        type: cR[ux(0xcb5)],
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
        name: ux(0x4e3),
        desc: ux(0x92f),
        type: cR[ux(0x49f)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
        orbitSpeedFactor: 0.95,
        orbitSpeedFactorTiers: [0.94, 0.93, 0.92, 0.91, 0.9, 0.8, 0.7, 0.1],
      },
      {
        name: ux(0xe60),
        desc: ux(0xa78),
        type: cR[ux(0x77f)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][ux(0x696)](
          (r8) => r8 - 0.2
        ),
      },
      {
        name: ux(0x273),
        desc: ux(0x4e1),
        type: cR[ux(0x817)],
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
        name: ux(0xeed),
        desc: ux(0xa09),
        type: cR[ux(0xb4f)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: ux(0x560),
        desc: ux(0x8a0),
        type: cR[ux(0xdb6)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: ux(0xf0a),
        desc: ux(0x8d2),
        type: cR[ux(0xb25)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: ux(0xc4e),
        desc: ux(0x4e8),
        type: cR[ux(0x2ff)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dC(![]),
      dC(!![]),
      {
        name: ux(0x9cc),
        desc: ux(0x5f6),
        type: cR[ux(0x99d)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: ux(0xa96),
        desc: ux(0x9c1),
        type: cR[ux(0x1fa)],
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
        name: ux(0x5e8),
        desc: ux(0x48b),
        type: cR[ux(0xb98)],
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
        name: ux(0xb5d),
        desc: ux(0x671),
        type: cR[ux(0x62e)],
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
        spawn: ux(0x2fb),
        spawnTiers: [
          ux(0xa60),
          ux(0xb0c),
          ux(0x6af),
          ux(0x6af),
          ux(0x37f),
          ux(0x6b9),
          ux(0x6b9),
          ux(0x221),
        ],
      },
      {
        name: ux(0x77d),
        desc: ux(0xce3),
        type: cR[ux(0xd35)],
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
        spawn: ux(0xaf9),
        spawnTiers: [
          ux(0x4c0),
          ux(0x4c0),
          ux(0x47a),
          ux(0xdc7),
          ux(0x6ce),
          ux(0xa17),
          ux(0xa17),
          ux(0x9fa),
        ],
      },
      {
        name: ux(0x5fc),
        desc: ux(0x4aa),
        type: cR[ux(0x62e)],
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
        spawn: ux(0x832),
        spawnTiers: [
          ux(0xa10),
          ux(0xa10),
          ux(0x36e),
          ux(0x547),
          ux(0x9c3),
          ux(0xb7a),
          ux(0xb7a),
          ux(0x7cc),
        ],
      },
      {
        name: ux(0xa30),
        desc: ux(0x6e1),
        type: cR[ux(0x551)],
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
        spawn: ux(0xae1),
        spawnTiers: [
          ux(0xae1),
          ux(0x928),
          ux(0x799),
          ux(0xb02),
          ux(0xcf2),
          ux(0xdd1),
          ux(0xdd1),
          ux(0xd6a),
        ],
      },
      {
        name: ux(0x354),
        desc: ux(0xc43),
        type: cR[ux(0xa26)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: ux(0x723),
        spawnTiers: [
          ux(0x599),
          ux(0xbb1),
          ux(0xbb1),
          ux(0x2f5),
          ux(0x867),
          ux(0x8fb),
          ux(0x8fb),
          ux(0xd31),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: ux(0xb89),
        desc: ux(0xd32),
        type: cR[ux(0x280)],
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
        name: ux(0xc3b),
        desc: ux(0x8b8),
        type: cR[ux(0xc47)],
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
        name: ux(0xecd),
        desc: ux(0xc21),
        type: cR[ux(0xe77)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: ux(0x6fb),
        desc: ux(0x37b),
        type: cR[ux(0xe04)],
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
        name: ux(0x422),
        desc: ux(0x3dc),
        type: cR[ux(0x7df)],
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
        name: ux(0x81a),
        desc: ux(0xeb8),
        type: cR[ux(0x6aa)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: ux(0x46e),
        desc: ux(0xd30),
        type: cR[ux(0x28d)],
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
        name: ux(0x4c1),
        desc: ux(0xda9),
        ability: de[ux(0xcd9)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: ux(0x68a),
        desc: ux(0x94d),
        type: cR[ux(0x6b4)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: ux(0x3cf),
        desc: ux(0x1d0),
        type: cR[ux(0x6da)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: ux(0xd21),
        desc: ux(0x65c),
        ability: de[ux(0xc83)],
        petHealF: 0x28,
      },
      {
        name: ux(0x44b),
        desc: ux(0x8ec),
        ability: de[ux(0xb9d)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: ux(0x8d7),
        type: cR[ux(0xbb7)],
        desc: ux(0xb47),
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
        name: ux(0x24f),
        desc: ux(0xb05),
        type: cR[ux(0xeba)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: ux(0x6ca),
        spawnTiers: [
          ux(0x343),
          ux(0x537),
          ux(0x537),
          ux(0x827),
          ux(0x200),
          ux(0x414),
          ux(0x414),
          ux(0x9d9),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: ux(0x5d0),
        desc: ux(0xd9b),
        type: cR[ux(0xdca)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          ux(0x696)
        ]((r8) => r8 / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: ux(0xe58),
        desc: ux(0xcba),
        type: cR[ux(0xc70)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: ux(0x5c2),
        desc: ux(0x9b6),
        type: cR[ux(0x870)],
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
        name: ux(0xd04),
        desc: ux(0x327),
        type: cR[ux(0x27e)],
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
        name: ux(0xccb),
        desc: ux(0x952),
        type: cR[ux(0xcc3)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: ux(0xc7e),
        desc: ux(0x796),
        type: cR[ux(0xa44)],
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
        name: ux(0xa36),
        desc: ux(0xd47),
        type: cR[ux(0x660)],
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
        consumeProjType: cR[ux(0xc47)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: ux(0x916),
        desc: ux(0xb33),
        type: cR[ux(0x223)],
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
        name: ux(0x506),
        desc: ux(0x74d),
        type: cR[ux(0x5b1)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: ux(0x691),
        spawnTiers: [
          ux(0x890),
          ux(0x9a3),
          ux(0x9a3),
          ux(0xcc5),
          ux(0x2cf),
          ux(0x238),
          ux(0x9b2),
          ux(0xc9a),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: ux(0x242), desc: ux(0xe44), ability: de[ux(0x77a)] },
      {
        name: ux(0xf20),
        desc: ux(0xc1e),
        type: cR[ux(0x712)],
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
        name: ux(0x670),
        desc: ux(0x900),
        type: cR[ux(0x341)],
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
        name: ux(0xbae),
        desc: ux(0x8da),
        type: cR[ux(0xae0)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: ux(0xd0f),
        desc: ux(0x5f7),
        type: cR[ux(0xe93)],
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
        name: ux(0x8f9),
        desc: ux(0x8e6),
        type: cR[ux(0x672)],
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
        name: ux(0x579),
        desc: ux(0x301),
        type: cR[ux(0x375)],
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
        spawn: ux(0xe82),
        spawnTiers: [
          ux(0x7c4),
          ux(0xc2c),
          ux(0xc2c),
          ux(0x3ad),
          ux(0xb45),
          ux(0x7e1),
          ux(0x7e1),
          ux(0x33f),
        ],
      },
      {
        name: ux(0x99c),
        desc: ux(0xad5),
        type: cR[ux(0xe0e)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: ux(0x6c2),
        desc: ux(0xadd),
        type: cR[ux(0x8f7)],
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
        name: ux(0x94e),
        desc: ux(0xe74),
        type: cR[ux(0x1d2)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 2.5,
      },
      {
        name: ux(0x22b),
        desc: ux(0xcaa),
        type: cR[ux(0x25f)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dc((r8) => 0xa + r8 * 0x28),
      },
      {
        name: ux(0x617),
        desc: ux(0x7e9),
        type: cR[ux(0xd02)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: ux(0x632),
        desc: ux(0xeb6),
        type: cR[ux(0xace)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dc((r8) => 0x2 + Math[ux(0xcec)](1.7 ** r8)),
      },
      {
        name: ux(0x227),
        desc: ux(0x929),
        type: cR[ux(0xae5)],
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
        name: ux(0x1fd),
        desc: ux(0x79b),
        type: cR[ux(0xdde)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dc((r8) => 0.02 + r8 * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: ux(0x3b2),
        desc: ux(0x34c),
        type: cR[ux(0xd82)],
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
        spawn: ux(0x5c7),
        spawnTiers: [
          ux(0x5c7),
          ux(0x7a8),
          ux(0x7c7),
          ux(0x21d),
          ux(0xc4f),
          ux(0xad8),
          ux(0xad8),
          ux(0x811),
        ],
      },
      { name: ux(0xe33), desc: ux(0x5de), ability: de[ux(0x4c5)] },
      {
        name: ux(0xa41),
        desc: ux(0x7a3),
        type: cR[ux(0xd91)],
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
        ra = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][uE(0x696)](
          (rb) => rb * r9
        );
      return {
        name: r8 ? uE(0x893) : uE(0xce7),
        desc:
          (r8 ? uE(0x3f5) : uE(0x6c6)) +
          uE(0x734) +
          (r8 ? uE(0x2d6) : "") +
          uE(0xb57),
        type: cR[r8 ? uE(0x511) : uE(0x5df)],
        size: 0x10,
        healthF: r8 ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: ra[0x0],
        mobSizeChangeTiers: ra[uE(0x607)](0x1),
      };
    }
    var dD = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dE = {},
      dF = dB[ux(0xf30)],
      dG = d9[ux(0xf30)],
      dH = eO();
    for (let r8 = 0x0, r9 = dB[ux(0xf30)]; r8 < r9; r8++) {
      const ra = dB[r8];
      (ra[ux(0x7d1)] = !![]), (ra["id"] = r8);
      if (!ra[ux(0x82f)]) ra[ux(0x82f)] = ra[ux(0xc49)];
      dJ(ra), (ra[ux(0x75b)] = 0x0), (ra[ux(0xb85)] = r8);
      let rb = ra;
      for (let rc = 0x1; rc < dG; rc++) {
        const rd = dN(ra);
        (rd[ux(0x257)] = ra[ux(0x257)] + rc),
          (rd[ux(0xc49)] = ra[ux(0xc49)] + "_" + rd[ux(0x257)]),
          (rd[ux(0x75b)] = rc),
          (rb[ux(0x260)] = rd),
          (rb = rd),
          dI(ra, rd),
          dJ(rd),
          (rd["id"] = dB[ux(0xf30)]),
          (dB[rd["id"]] = rd);
      }
    }
    function dI(re, rf) {
      const uF = ux,
        rg = rf[uF(0x257)] - re[uF(0x257)] - 0x1;
      for (let rh in re) {
        const ri = re[rh + uF(0xbe2)];
        Array[uF(0x6c0)](ri) && (rf[rh] = ri[rg]);
      }
    }
    function dJ(re) {
      const uG = ux;
      dE[re[uG(0xc49)]] = re;
      for (let rf in dh) {
        re[rf] === void 0x0 && (re[rf] = dh[rf]);
      }
      re[uG(0x920)] === de[uG(0xa3a)] &&
        (re[uG(0x76d)] = cV[re[uG(0x257)] + 0x1] / 0x64),
        (re[uG(0x2fa)] =
          re[uG(0x405)] > 0x0
            ? df(re[uG(0x257)], re[uG(0x405)])
            : re[uG(0x2fa)]),
        (re[uG(0x4ab)] =
          re[uG(0x44e)] > 0x0
            ? df(re[uG(0x257)], re[uG(0x44e)])
            : re[uG(0x4ab)]),
        (re[uG(0x521)] = df(re[uG(0x257)], re[uG(0x453)])),
        (re[uG(0xe2f)] = df(re[uG(0x257)], re[uG(0x8ed)])),
        (re[uG(0x6e5)] = df(re[uG(0x257)], re[uG(0x367)])),
        (re[uG(0x5eb)] = df(re[uG(0x257)], re[uG(0xe3f)])),
        (re[uG(0x7b8)] = df(re[uG(0x257)], re[uG(0x42a)])),
        (re[uG(0x91e)] = df(re[uG(0x257)], re[uG(0xb03)])),
        (re[uG(0xaa6)] = df(re[uG(0x257)], re[uG(0x358)])),
        (re[uG(0x6dc)] = df(re[uG(0x257)], re[uG(0x468)])),
        re[uG(0x835)] &&
          ((re[uG(0x8a9)] = df(re[uG(0x257)], re[uG(0xd2a)])),
          (re[uG(0xa18)] = df(re[uG(0x257)], re[uG(0x463)]))),
        re[uG(0xa2a)] > 0x0
          ? (re[uG(0x792)] = df(re[uG(0x257)], re[uG(0xa2a)]))
          : (re[uG(0x792)] = 0x0),
        (re[uG(0x6e7)] = re[uG(0x999)]
          ? df(re[uG(0x257)], re[uG(0x2b2)])
          : 0x0),
        (re[uG(0x575)] = re[uG(0x4b9)]
          ? df(re[uG(0x257)], re[uG(0x93f)])
          : 0x0),
        (re[uG(0x9b1)] = df(re[uG(0x257)], re[uG(0xdcf)])),
        dH[re[uG(0x257)]][uG(0xf33)](re);
    }
    var dK = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dL = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dM = cU(ux(0x2d1));
    function dN(re) {
      const uH = ux;
      return JSON[uH(0x76c)](JSON[uH(0xf23)](re));
    }
    const dO = {};
    (dO[ux(0xc49)] = ux(0xdaf)),
      (dO[ux(0x493)] = ux(0xee0)),
      (dO[ux(0x307)] = ux(0x558)),
      (dO[ux(0x257)] = 0x0),
      (dO[ux(0x405)] = 0x64),
      (dO[ux(0x44e)] = 0x1e),
      (dO[ux(0xb1d)] = 0x32),
      (dO[ux(0x75a)] = dM[ux(0xc93)]),
      (dO[ux(0xaf2)] = ![]),
      (dO[ux(0xd3b)] = !![]),
      (dO[ux(0x999)] = ![]),
      (dO[ux(0x2b2)] = 0x0),
      (dO[ux(0x6e7)] = 0x0),
      (dO[ux(0x688)] = ![]),
      (dO[ux(0x722)] = ![]),
      (dO[ux(0xede)] = 0x1),
      (dO[ux(0xa83)] = cR[ux(0x563)]),
      (dO[ux(0xf19)] = 0x0),
      (dO[ux(0xcd7)] = 0x0),
      (dO[ux(0x96f)] = 0.5),
      (dO[ux(0x4c8)] = 0x0),
      (dO[ux(0xa51)] = 0x1e),
      (dO[ux(0x6d2)] = 0x0),
      (dO[ux(0xa11)] = ![]),
      (dO[ux(0x93f)] = 0x0),
      (dO[ux(0xc63)] = 0x0),
      (dO[ux(0xe80)] = 11.5),
      (dO[ux(0xbf9)] = 0x4),
      (dO[ux(0x7f2)] = !![]),
      (dO[ux(0x592)] = 0x0),
      (dO[ux(0xbfa)] = 0x0),
      (dO[ux(0x6b2)] = 0x1),
      (dO[ux(0x3da)] = 0x0),
      (dO[ux(0xca6)] = 0x0),
      (dO[ux(0xddb)] = 0x0),
      (dO[ux(0x4e2)] = 0x0),
      (dO[ux(0x2c8)] = 0x1);
    var dP = dO;
    const dQ = {};
    (dQ[ux(0xc49)] = ux(0x841)),
      (dQ[ux(0x493)] = ux(0xdec)),
      (dQ[ux(0x307)] = ux(0xe23)),
      (dQ[ux(0x405)] = 0x2ee),
      (dQ[ux(0x44e)] = 0xa),
      (dQ[ux(0xb1d)] = 0x32),
      (dQ[ux(0x688)] = !![]),
      (dQ[ux(0x722)] = !![]),
      (dQ[ux(0xede)] = 0.05),
      (dQ[ux(0xe80)] = 0x5),
      (dQ[ux(0x7e5)] = !![]),
      (dQ[ux(0x31a)] = [[ux(0xaf9), 0x3]]),
      (dQ[ux(0xb56)] = [
        [ux(0xabd), 0x1],
        [ux(0xaf9), 0x2],
        [ux(0x938), 0x2],
        [ux(0x78c), 0x1],
      ]),
      (dQ[ux(0xce5)] = [[ux(0xcef), "f"]]);
    const dR = {};
    (dR[ux(0xc49)] = ux(0xabd)),
      (dR[ux(0x493)] = ux(0x334)),
      (dR[ux(0x307)] = ux(0x425)),
      (dR[ux(0x405)] = 0x1f4),
      (dR[ux(0x44e)] = 0xa),
      (dR[ux(0xb1d)] = 0x28),
      (dR[ux(0x7e5)] = !![]),
      (dR[ux(0xaf2)] = !![]),
      (dR[ux(0xce5)] = [
        [ux(0xeed), "E"],
        [ux(0x893), "G"],
        [ux(0x77d), "A"],
      ]);
    const dS = {};
    (dS[ux(0xc49)] = ux(0xaf9)),
      (dS[ux(0x493)] = ux(0xee4)),
      (dS[ux(0x307)] = ux(0xed9)),
      (dS[ux(0x405)] = 0x64),
      (dS[ux(0x44e)] = 0xa),
      (dS[ux(0xb1d)] = 0x1c),
      (dS[ux(0xaf2)] = !![]),
      (dS[ux(0xce5)] = [[ux(0xeed), "I"]]);
    const dT = {};
    (dT[ux(0xc49)] = ux(0x938)),
      (dT[ux(0x493)] = ux(0xdce)),
      (dT[ux(0x307)] = ux(0x61d)),
      (dT[ux(0x405)] = 62.5),
      (dT[ux(0x44e)] = 0xa),
      (dT[ux(0xb1d)] = 0x1c),
      (dT[ux(0xce5)] = [[ux(0xc4e), "H"]]);
    const dU = {};
    (dU[ux(0xc49)] = ux(0x78c)),
      (dU[ux(0x493)] = ux(0xdbc)),
      (dU[ux(0x307)] = ux(0xd09)),
      (dU[ux(0x405)] = 0x19),
      (dU[ux(0x44e)] = 0xa),
      (dU[ux(0xb1d)] = 0x19),
      (dU[ux(0xaf2)] = ![]),
      (dU[ux(0xd3b)] = ![]),
      (dU[ux(0xce5)] = [
        [ux(0x716), "F"],
        [ux(0xc4e), "F"],
        [ux(0xce7), "G"],
        [ux(0x81a), "F"],
      ]);
    var dV = [dQ, dR, dS, dT, dU];
    function dW() {
      const uI = ux,
        re = dN(dV);
      for (let rf = 0x0; rf < re[uI(0xf30)]; rf++) {
        const rg = re[rf];
        (rg[uI(0x307)] += uI(0x5c2)),
          rg[uI(0xc49)] === uI(0x841) &&
            (rg[uI(0xce5)] = [
              [uI(0xacb), "D"],
              [uI(0xb89), "E"],
            ]),
          (rg[uI(0xc49)] = dX(rg[uI(0xc49)])),
          (rg[uI(0x493)] = dX(rg[uI(0x493)])),
          (rg[uI(0x44e)] *= 0x2),
          rg[uI(0x31a)] &&
            rg[uI(0x31a)][uI(0x45f)]((rh) => {
              return (rh[0x0] = dX(rh[0x0])), rh;
            }),
          rg[uI(0xb56)] &&
            rg[uI(0xb56)][uI(0x45f)]((rh) => {
              return (rh[0x0] = dX(rh[0x0])), rh;
            });
      }
      return re;
    }
    function dX(re) {
      const uJ = ux;
      return re[uJ(0x51a)](/Ant/g, uJ(0x6fa))[uJ(0x51a)](/ant/g, uJ(0x2e7));
    }
    const dY = {};
    (dY[ux(0xc49)] = ux(0x39b)),
      (dY[ux(0x493)] = ux(0x94f)),
      (dY[ux(0x307)] = ux(0x439)),
      (dY[ux(0x405)] = 37.5),
      (dY[ux(0x44e)] = 0x32),
      (dY[ux(0xb1d)] = 0x28),
      (dY[ux(0xce5)] = [
        [ux(0xd7e), "F"],
        [ux(0x273), "I"],
      ]),
      (dY[ux(0x592)] = 0x4),
      (dY[ux(0xbfa)] = 0x4);
    const dZ = {};
    (dZ[ux(0xc49)] = ux(0xf0a)),
      (dZ[ux(0x493)] = ux(0xbca)),
      (dZ[ux(0x307)] = ux(0x464)),
      (dZ[ux(0x405)] = 0x5e),
      (dZ[ux(0x44e)] = 0x5),
      (dZ[ux(0xede)] = 0.05),
      (dZ[ux(0xb1d)] = 0x3c),
      (dZ[ux(0x688)] = !![]),
      (dZ[ux(0xce5)] = [[ux(0xf0a), "h"]]);
    const e0 = {};
    (e0[ux(0xc49)] = ux(0x5c7)),
      (e0[ux(0x493)] = ux(0x92e)),
      (e0[ux(0x307)] = ux(0x8af)),
      (e0[ux(0x405)] = 0x4b),
      (e0[ux(0x44e)] = 0xa),
      (e0[ux(0xede)] = 0.05),
      (e0[ux(0x688)] = !![]),
      (e0[ux(0x1ec)] = 1.25),
      (e0[ux(0xce5)] = [
        [ux(0x5c7), "h"],
        [ux(0x4e3), "J"],
        [ux(0x3b2), "K"],
      ]);
    const e1 = {};
    (e1[ux(0xc49)] = ux(0x832)),
      (e1[ux(0x493)] = ux(0x886)),
      (e1[ux(0x307)] = ux(0xd16)),
      (e1[ux(0x405)] = 62.5),
      (e1[ux(0x44e)] = 0x32),
      (e1[ux(0xaf2)] = !![]),
      (e1[ux(0xb1d)] = 0x28),
      (e1[ux(0xce5)] = [
        [ux(0xc5f), "f"],
        [ux(0xdef), "I"],
        [ux(0x5fc), "K"],
      ]),
      (e1[ux(0xa83)] = cR[ux(0xc31)]),
      (e1[ux(0xcd7)] = 0xa),
      (e1[ux(0xf19)] = 0x5),
      (e1[ux(0xa51)] = 0x26),
      (e1[ux(0x96f)] = 0.375 / 1.1),
      (e1[ux(0x4c8)] = 0.75),
      (e1[ux(0x75a)] = dM[ux(0xd16)]);
    const e2 = {};
    (e2[ux(0xc49)] = ux(0xaa8)),
      (e2[ux(0x493)] = ux(0x57e)),
      (e2[ux(0x307)] = ux(0x38e)),
      (e2[ux(0x405)] = 87.5),
      (e2[ux(0x44e)] = 0xa),
      (e2[ux(0xce5)] = [
        [ux(0x716), "f"],
        [ux(0x64d), "f"],
      ]),
      (e2[ux(0x592)] = 0x5),
      (e2[ux(0xbfa)] = 0x5);
    const e3 = {};
    (e3[ux(0xc49)] = ux(0x2fb)),
      (e3[ux(0x493)] = ux(0x1e5)),
      (e3[ux(0x307)] = ux(0x558)),
      (e3[ux(0x405)] = 0x64),
      (e3[ux(0x44e)] = 0x1e),
      (e3[ux(0xaf2)] = !![]),
      (e3[ux(0xce5)] = [[ux(0xb5d), "F"]]),
      (e3[ux(0x592)] = 0x5),
      (e3[ux(0xbfa)] = 0x5);
    const e4 = {};
    (e4[ux(0xc49)] = ux(0xe82)),
      (e4[ux(0x493)] = ux(0x5a4)),
      (e4[ux(0x307)] = ux(0xb73)),
      (e4[ux(0x405)] = 62.5),
      (e4[ux(0x44e)] = 0xf),
      (e4[ux(0x999)] = !![]),
      (e4[ux(0x2b2)] = 0xf),
      (e4[ux(0xb1d)] = 0x23),
      (e4[ux(0xaf2)] = !![]),
      (e4[ux(0xce5)] = [
        [ux(0xe60), "F"],
        [ux(0x44c), "F"],
        [ux(0x8d0), "L"],
        [ux(0x4c1), "G"],
      ]);
    const e5 = {};
    (e5[ux(0xc49)] = ux(0xb80)),
      (e5[ux(0x493)] = ux(0xaa5)),
      (e5[ux(0x307)] = ux(0xe19)),
      (e5[ux(0x405)] = 0x64),
      (e5[ux(0x44e)] = 0xf),
      (e5[ux(0x999)] = !![]),
      (e5[ux(0x2b2)] = 0xa),
      (e5[ux(0xb1d)] = 0x2f),
      (e5[ux(0xaf2)] = !![]),
      (e5[ux(0xce5)] = [
        [ux(0x45b), "F"],
        [ux(0x46e), "F"],
      ]),
      (e5[ux(0xa83)] = cR[ux(0x3b5)]),
      (e5[ux(0xcd7)] = 0x3),
      (e5[ux(0xf19)] = 0x5),
      (e5[ux(0x6d2)] = 0x7),
      (e5[ux(0xa51)] = 0x2b),
      (e5[ux(0x96f)] = 0.21),
      (e5[ux(0x4c8)] = -0.31),
      (e5[ux(0x75a)] = dM[ux(0x833)]);
    const e6 = {};
    (e6[ux(0xc49)] = ux(0xae1)),
      (e6[ux(0x493)] = ux(0xf29)),
      (e6[ux(0x307)] = ux(0xae7)),
      (e6[ux(0x405)] = 0x15e),
      (e6[ux(0x44e)] = 0x28),
      (e6[ux(0xb1d)] = 0x2d),
      (e6[ux(0xaf2)] = !![]),
      (e6[ux(0x7e5)] = !![]),
      (e6[ux(0xce5)] = [
        [ux(0xd52), "F"],
        [ux(0xa04), "G"],
        [ux(0x560), "H"],
        [ux(0xa30), "J"],
      ]);
    const e7 = {};
    (e7[ux(0xc49)] = ux(0x1f6)),
      (e7[ux(0x493)] = ux(0x8a8)),
      (e7[ux(0x307)] = ux(0xa2d)),
      (e7[ux(0x405)] = 0x7d),
      (e7[ux(0x44e)] = 0x19),
      (e7[ux(0xaf2)] = !![]),
      (e7[ux(0xa11)] = !![]),
      (e7[ux(0x93f)] = 0x5),
      (e7[ux(0xc63)] = 0x2),
      (e7[ux(0x6b3)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e7[ux(0xbf9)] = 0x4),
      (e7[ux(0xe80)] = 0x6),
      (e7[ux(0xce5)] = [[ux(0xedb), "F"]]);
    const e8 = {};
    (e8[ux(0xc49)] = ux(0x32f)),
      (e8[ux(0x493)] = ux(0x74e)),
      (e8[ux(0x307)] = ux(0xe6a)),
      (e8[ux(0x405)] = 0.5),
      (e8[ux(0x44e)] = 0x5),
      (e8[ux(0xaf2)] = ![]),
      (e8[ux(0xd3b)] = ![]),
      (e8[ux(0xbf9)] = 0x1),
      (e8[ux(0xce5)] = [[ux(0x32f), "F"]]);
    const e9 = {};
    (e9[ux(0xc49)] = ux(0xa7f)),
      (e9[ux(0x493)] = ux(0xd54)),
      (e9[ux(0x307)] = ux(0x5c3)),
      (e9[ux(0x405)] = 0x19),
      (e9[ux(0x44e)] = 0xa),
      (e9[ux(0xb1d)] = 0x28),
      (e9[ux(0x78e)] = cR[ux(0xb43)]),
      (e9[ux(0xce5)] = [
        [ux(0xc4e), "J"],
        [ux(0x421), "J"],
      ]);
    const ea = {};
    (ea[ux(0xc49)] = ux(0x7fe)),
      (ea[ux(0x493)] = ux(0x83d)),
      (ea[ux(0x307)] = ux(0x869)),
      (ea[ux(0x405)] = 0x19),
      (ea[ux(0x44e)] = 0xa),
      (ea[ux(0xb1d)] = 0x28),
      (ea[ux(0x78e)] = cR[ux(0xe36)]),
      (ea[ux(0xaf2)] = !![]),
      (ea[ux(0xce5)] = [
        [ux(0x45b), "J"],
        [ux(0xe4b), "J"],
      ]);
    const eb = {};
    (eb[ux(0xc49)] = ux(0x302)),
      (eb[ux(0x493)] = ux(0xec1)),
      (eb[ux(0x307)] = ux(0xeb2)),
      (eb[ux(0x405)] = 0x19),
      (eb[ux(0x44e)] = 0xa),
      (eb[ux(0xb1d)] = 0x28),
      (eb[ux(0x78e)] = cR[ux(0xded)]),
      (eb[ux(0xd3b)] = ![]),
      (eb[ux(0xce5)] = [
        [ux(0x9cc), "J"],
        [ux(0x285), "H"],
        [ux(0xa96), "J"],
      ]),
      (eb[ux(0xbf9)] = 0x17),
      (eb[ux(0xe80)] = 0x17 * 0.75);
    const ec = {};
    (ec[ux(0xc49)] = ux(0xa8e)),
      (ec[ux(0x493)] = ux(0x434)),
      (ec[ux(0x307)] = ux(0x270)),
      (ec[ux(0x405)] = 87.5),
      (ec[ux(0x44e)] = 0xa),
      (ec[ux(0xce5)] = [
        [ux(0x5e8), "F"],
        [ux(0xa95), "I"],
      ]),
      (ec[ux(0x592)] = 0x5),
      (ec[ux(0xbfa)] = 0x5);
    const ed = {};
    (ed[ux(0xc49)] = ux(0x733)),
      (ed[ux(0x493)] = ux(0x980)),
      (ed[ux(0x307)] = ux(0xab8)),
      (ed[ux(0x405)] = 87.5),
      (ed[ux(0x44e)] = 0xa),
      (ed[ux(0xce5)] = [
        [ux(0x64d), "A"],
        [ux(0x5e8), "A"],
      ]),
      (ed[ux(0x592)] = 0x5),
      (ed[ux(0xbfa)] = 0x5);
    const ee = {};
    (ee[ux(0xc49)] = ux(0x41b)),
      (ee[ux(0x493)] = ux(0x65d)),
      (ee[ux(0x307)] = ux(0x3e1)),
      (ee[ux(0x405)] = 0x32),
      (ee[ux(0x44e)] = 0xa),
      (ee[ux(0xede)] = 0.05),
      (ee[ux(0xb1d)] = 0x3c),
      (ee[ux(0x688)] = !![]),
      (ee[ux(0xce5)] = [
        [ux(0x72d), "E"],
        [ux(0x5d0), "F"],
        [ux(0x916), "F"],
      ]);
    const ef = {};
    (ef[ux(0xc49)] = ux(0x723)),
      (ef[ux(0x493)] = ux(0x4bb)),
      (ef[ux(0x307)] = ux(0x621)),
      (ef[ux(0x405)] = 0x7d),
      (ef[ux(0x44e)] = 0x28),
      (ef[ux(0xb1d)] = 0x32),
      (ef[ux(0xaf2)] = ![]),
      (ef[ux(0xd3b)] = ![]),
      (ef[ux(0x75a)] = dM[ux(0x621)]),
      (ef[ux(0xbf9)] = 0xe),
      (ef[ux(0xe80)] = 0xb),
      (ef[ux(0x6b2)] = 2.2),
      (ef[ux(0xce5)] = [
        [ux(0x354), "J"],
        [ux(0x9cc), "H"],
      ]);
    const eg = {};
    (eg[ux(0xc49)] = ux(0xd78)),
      (eg[ux(0x493)] = ux(0x481)),
      (eg[ux(0x307)] = ux(0xa88)),
      (eg[ux(0x405)] = 0x7d),
      (eg[ux(0x44e)] = 0x28),
      (eg[ux(0xb1d)] = null),
      (eg[ux(0xaf2)] = !![]),
      (eg[ux(0x700)] = !![]),
      (eg[ux(0xce5)] = [
        [ux(0xc50), "D"],
        [ux(0xc3b), "E"],
        [ux(0xa36), "E"],
      ]),
      (eg[ux(0xb1d)] = 0x32),
      (eg[ux(0x445)] = 0x32),
      (eg[ux(0x8f2)] = !![]),
      (eg[ux(0x3da)] = -Math["PI"] / 0x2),
      (eg[ux(0xa83)] = cR[ux(0xc47)]),
      (eg[ux(0xcd7)] = 0x3),
      (eg[ux(0xf19)] = 0x3),
      (eg[ux(0xa51)] = 0x21),
      (eg[ux(0x96f)] = 0.32),
      (eg[ux(0x4c8)] = 0.4),
      (eg[ux(0x75a)] = dM[ux(0xd16)]);
    const eh = {};
    (eh[ux(0xc49)] = ux(0xecd)),
      (eh[ux(0x493)] = ux(0x204)),
      (eh[ux(0x307)] = ux(0x1cf)),
      (eh[ux(0x405)] = 0x96),
      (eh[ux(0x44e)] = 0x14),
      (eh[ux(0xaf2)] = !![]),
      (eh[ux(0xca6)] = 0.5),
      (eh[ux(0xce5)] = [
        [ux(0xecd), "D"],
        [ux(0x285), "J"],
        [ux(0x9cc), "J"],
      ]);
    const ei = {};
    (ei[ux(0xc49)] = ux(0x6fb)),
      (ei[ux(0x493)] = ux(0x79e)),
      (ei[ux(0x307)] = ux(0xd8b)),
      (ei[ux(0x405)] = 0x19),
      (ei[ux(0x44e)] = 0xf),
      (ei[ux(0xede)] = 0.05),
      (ei[ux(0xb1d)] = 0x37),
      (ei[ux(0x688)] = !![]),
      (ei[ux(0xce5)] = [[ux(0x6fb), "h"]]),
      (ei[ux(0xa83)] = cR[ux(0xe04)]),
      (ei[ux(0xddb)] = 0x9),
      (ei[ux(0xa51)] = 0x28),
      (ei[ux(0xcd7)] = 0xf),
      (ei[ux(0xf19)] = 2.5),
      (ei[ux(0xa51)] = 0x21),
      (ei[ux(0x96f)] = 0.32),
      (ei[ux(0x4c8)] = 1.8),
      (ei[ux(0x4e2)] = 0x14);
    const ej = {};
    (ej[ux(0xc49)] = ux(0x422)),
      (ej[ux(0x493)] = ux(0x48a)),
      (ej[ux(0x307)] = ux(0xdba)),
      (ej[ux(0x405)] = 0xe1),
      (ej[ux(0x44e)] = 0xa),
      (ej[ux(0xb1d)] = 0x32),
      (ej[ux(0xce5)] = [
        [ux(0x422), "H"],
        [ux(0xacb), "L"],
      ]),
      (ej[ux(0x700)] = !![]),
      (ej[ux(0x1f2)] = !![]),
      (ej[ux(0xe80)] = 0x23);
    const ek = {};
    (ek[ux(0xc49)] = ux(0x635)),
      (ek[ux(0x493)] = ux(0x26e)),
      (ek[ux(0x307)] = ux(0x68f)),
      (ek[ux(0x405)] = 0x96),
      (ek[ux(0x44e)] = 0x19),
      (ek[ux(0xb1d)] = 0x2f),
      (ek[ux(0xaf2)] = !![]),
      (ek[ux(0xce5)] = [[ux(0x9cc), "J"]]),
      (ek[ux(0xa83)] = null),
      (ek[ux(0x75a)] = dM[ux(0x833)]);
    const em = {};
    (em[ux(0xc49)] = ux(0xd37)),
      (em[ux(0x493)] = ux(0xa69)),
      (em[ux(0x307)] = ux(0xcb0)),
      (em[ux(0x405)] = 0x64),
      (em[ux(0x44e)] = 0x1e),
      (em[ux(0xb1d)] = 0x1e),
      (em[ux(0xaf2)] = !![]),
      (em[ux(0x913)] = ux(0xb89)),
      (em[ux(0xce5)] = [
        [ux(0xb89), "F"],
        [ux(0x4c1), "E"],
        [ux(0x8d7), "D"],
        [ux(0xe33), "E"],
      ]);
    const en = {};
    (en[ux(0xc49)] = ux(0x68a)),
      (en[ux(0x493)] = ux(0x89f)),
      (en[ux(0x307)] = ux(0x78a)),
      (en[ux(0x405)] = 0x64),
      (en[ux(0x44e)] = 0xa),
      (en[ux(0xb1d)] = 0x3c),
      (en[ux(0x688)] = !![]),
      (en[ux(0xede)] = 0.05),
      (en[ux(0xce5)] = [[ux(0x68a), "D"]]);
    const eo = {};
    (eo[ux(0xc49)] = ux(0xf17)),
      (eo[ux(0x493)] = ux(0xb8a)),
      (eo[ux(0x307)] = ux(0x321)),
      (eo[ux(0x405)] = 0x64),
      (eo[ux(0x44e)] = 0x23),
      (eo[ux(0xaf2)] = !![]),
      (eo[ux(0xce5)] = [
        [ux(0x3cf), "E"],
        [ux(0xd0f), "D"],
      ]);
    const ep = {};
    (ep[ux(0xc49)] = ux(0x1fc)),
      (ep[ux(0x493)] = ux(0xf32)),
      (ep[ux(0x307)] = ux(0x51d)),
      (ep[ux(0x405)] = 0xc8),
      (ep[ux(0x44e)] = 0x23),
      (ep[ux(0xb1d)] = 0x23),
      (ep[ux(0xaf2)] = !![]),
      (ep[ux(0xbfa)] = 0x5),
      (ep[ux(0xce5)] = [
        [ux(0xd21), "F"],
        [ux(0x44b), "D"],
        [ux(0xbae), "E"],
      ]);
    const eq = {};
    (eq[ux(0xc49)] = ux(0x6ca)),
      (eq[ux(0x493)] = ux(0xc00)),
      (eq[ux(0x307)] = ux(0xaac)),
      (eq[ux(0x405)] = 0xc8),
      (eq[ux(0x44e)] = 0x14),
      (eq[ux(0xb1d)] = 0x28),
      (eq[ux(0xaf2)] = !![]),
      (eq[ux(0xce5)] = [
        [ux(0x24f), "E"],
        [ux(0xe58), "D"],
        [ux(0x5c2), "F"],
        [ux(0xd04), "F"],
      ]),
      (eq[ux(0x455)] = !![]),
      (eq[ux(0xd9e)] = 0xbb8),
      (eq[ux(0x4e5)] = 0.3);
    const er = {};
    (er[ux(0xc49)] = ux(0xccb)),
      (er[ux(0x493)] = ux(0x203)),
      (er[ux(0x307)] = ux(0x3ca)),
      (er[ux(0x405)] = 0x78),
      (er[ux(0x44e)] = 0x1e),
      (er[ux(0x1f2)] = !![]),
      (er[ux(0xe80)] = 0xf),
      (er[ux(0xbf9)] = 0x5),
      (er[ux(0xce5)] = [
        [ux(0xccb), "F"],
        [ux(0xc7e), "E"],
        [ux(0x670), "D"],
      ]),
      (er[ux(0xbfa)] = 0x3);
    const es = {};
    (es[ux(0xc49)] = ux(0x506)),
      (es[ux(0x493)] = ux(0xc30)),
      (es[ux(0x307)] = ux(0x29a)),
      (es[ux(0x405)] = 0x78),
      (es[ux(0x44e)] = 0x23),
      (es[ux(0xb1d)] = 0x32),
      (es[ux(0xaf2)] = !![]),
      (es[ux(0x2c2)] = !![]),
      (es[ux(0xce5)] = [
        [ux(0x506), "E"],
        [ux(0x916), "F"],
      ]),
      (es[ux(0x31a)] = [[ux(0x691), 0x1]]),
      (es[ux(0xb56)] = [[ux(0x691), 0x2]]),
      (es[ux(0x62d)] = !![]);
    const et = {};
    (et[ux(0xc49)] = ux(0x691)),
      (et[ux(0x493)] = ux(0x34a)),
      (et[ux(0x307)] = ux(0x4fc)),
      (et[ux(0x405)] = 0x96),
      (et[ux(0x44e)] = 0.1),
      (et[ux(0xb1d)] = 0x28),
      (et[ux(0xbf9)] = 0xe),
      (et[ux(0xe80)] = 11.6),
      (et[ux(0xaf2)] = !![]),
      (et[ux(0x2c2)] = !![]),
      (et[ux(0x4fa)] = !![]),
      (et[ux(0x75a)] = dM[ux(0x621)]),
      (et[ux(0xbfb)] = 0xa),
      (et[ux(0xce5)] = [[ux(0x242), "G"]]),
      (et[ux(0x2c8)] = 0.5);
    const eu = {};
    (eu[ux(0xc49)] = ux(0x752)),
      (eu[ux(0x493)] = ux(0x7e2)),
      (eu[ux(0x307)] = ux(0x649)),
      (eu[ux(0x405)] = 0x1f4),
      (eu[ux(0x44e)] = 0x28),
      (eu[ux(0xede)] = 0.05),
      (eu[ux(0xb1d)] = 0x32),
      (eu[ux(0x688)] = !![]),
      (eu[ux(0xe80)] = 0x5),
      (eu[ux(0x722)] = !![]),
      (eu[ux(0x7e5)] = !![]),
      (eu[ux(0xce5)] = [
        [ux(0xf20), "F"],
        [ux(0x5fc), "C"],
      ]),
      (eu[ux(0x31a)] = [
        [ux(0x39b), 0x2],
        [ux(0x832), 0x1],
      ]),
      (eu[ux(0xb56)] = [
        [ux(0x39b), 0x4],
        [ux(0x832), 0x2],
      ]);
    const ev = {};
    (ev[ux(0xc49)] = ux(0x8f9)),
      (ev[ux(0x493)] = ux(0x45e)),
      (ev[ux(0x307)] = ux(0x7d6)),
      (ev[ux(0x405)] = 0x50),
      (ev[ux(0x44e)] = 0x28),
      (ev[ux(0xbf9)] = 0x2),
      (ev[ux(0xe80)] = 0x6),
      (ev[ux(0x700)] = !![]),
      (ev[ux(0xce5)] = [[ux(0x8f9), "F"]]);
    const ew = {};
    (ew[ux(0xc49)] = ux(0xa89)),
      (ew[ux(0x493)] = ux(0x454)),
      (ew[ux(0x307)] = ux(0x214)),
      (ew[ux(0x405)] = 0x1f4),
      (ew[ux(0x44e)] = 0x28),
      (ew[ux(0xede)] = 0.05),
      (ew[ux(0xb1d)] = 0x46),
      (ew[ux(0xe80)] = 0x5),
      (ew[ux(0x688)] = !![]),
      (ew[ux(0x722)] = !![]),
      (ew[ux(0x7e5)] = !![]),
      (ew[ux(0xce5)] = [
        [ux(0x579), "A"],
        [ux(0x44c), "E"],
      ]),
      (ew[ux(0x31a)] = [[ux(0xe82), 0x2]]),
      (ew[ux(0xb56)] = [
        [ux(0xe82), 0x3],
        [ux(0xd37), 0x2],
      ]);
    const ex = {};
    (ex[ux(0xc49)] = ux(0xe30)),
      (ex[ux(0x493)] = ux(0xeee)),
      (ex[ux(0x307)] = ux(0x3c6)),
      (ex[ux(0xb1d)] = 0x28),
      (ex[ux(0x405)] = 0x64),
      (ex[ux(0x44e)] = 0xa),
      (ex[ux(0xede)] = 0.05),
      (ex[ux(0x688)] = !![]),
      (ex[ux(0x592)] = 0x1),
      (ex[ux(0xbfa)] = 0x1),
      (ex[ux(0xce5)] = [
        [ux(0x44b), "G"],
        [ux(0x285), "F"],
        [ux(0x99c), "F"],
      ]);
    const ey = {};
    (ey[ux(0xc49)] = ux(0xe37)),
      (ey[ux(0x493)] = ux(0x494)),
      (ey[ux(0x307)] = ux(0x3e0)),
      (ey[ux(0x405)] = 0x3c),
      (ey[ux(0x44e)] = 0x28),
      (ey[ux(0xb1d)] = 0x32),
      (ey[ux(0xaf2)] = ![]),
      (ey[ux(0xd3b)] = ![]),
      (ey[ux(0x75a)] = dM[ux(0x621)]),
      (ey[ux(0xbf9)] = 0xe),
      (ey[ux(0xe80)] = 0xb),
      (ey[ux(0x6b2)] = 2.2),
      (ey[ux(0xce5)] = [
        [ux(0xd0f), "E"],
        [ux(0x9cc), "J"],
      ]);
    const ez = {};
    (ez[ux(0xc49)] = ux(0xd1b)),
      (ez[ux(0x493)] = ux(0xa29)),
      (ez[ux(0x307)] = ux(0x609)),
      (ez[ux(0x405)] = 0x258),
      (ez[ux(0x44e)] = 0x32),
      (ez[ux(0xede)] = 0.05),
      (ez[ux(0xb1d)] = 0x3c),
      (ez[ux(0xe80)] = 0x7),
      (ez[ux(0x7e5)] = !![]),
      (ez[ux(0x688)] = !![]),
      (ez[ux(0x722)] = !![]),
      (ez[ux(0xce5)] = [
        [ux(0x24f), "A"],
        [ux(0x354), "G"],
      ]),
      (ez[ux(0x31a)] = [[ux(0x6ca), 0x1]]),
      (ez[ux(0xb56)] = [[ux(0x6ca), 0x1]]);
    const eA = {};
    (eA[ux(0xc49)] = ux(0x5ff)),
      (eA[ux(0x493)] = ux(0x912)),
      (eA[ux(0x307)] = ux(0x63c)),
      (eA[ux(0x405)] = 0xc8),
      (eA[ux(0x44e)] = 0x1e),
      (eA[ux(0xb1d)] = 0x2d),
      (eA[ux(0xaf2)] = !![]),
      (eA[ux(0xce5)] = [
        [ux(0xd52), "G"],
        [ux(0xa04), "H"],
        [ux(0x670), "E"],
      ]);
    const eB = {};
    (eB[ux(0xc49)] = ux(0x9f9)),
      (eB[ux(0x493)] = ux(0x1fe)),
      (eB[ux(0x307)] = ux(0x59c)),
      (eB[ux(0x405)] = 0x3c),
      (eB[ux(0x44e)] = 0x64),
      (eB[ux(0xb1d)] = 0x28),
      (eB[ux(0x89a)] = !![]),
      (eB[ux(0x7f2)] = ![]),
      (eB[ux(0xaf2)] = !![]),
      (eB[ux(0xce5)] = [
        [ux(0xe58), "F"],
        [ux(0xc4e), "D"],
        [ux(0x6c2), "G"],
      ]);
    const eC = {};
    (eC[ux(0xc49)] = ux(0x94e)),
      (eC[ux(0x493)] = ux(0x4e9)),
      (eC[ux(0x307)] = ux(0x479)),
      (eC[ux(0xb1d)] = 0x28),
      (eC[ux(0x405)] = 0x5a),
      (eC[ux(0x44e)] = 0x5),
      (eC[ux(0xede)] = 0.05),
      (eC[ux(0x688)] = !![]),
      (eC[ux(0xce5)] = [[ux(0x94e), "h"]]);
    const eD = {};
    (eD[ux(0xc49)] = ux(0x22b)),
      (eD[ux(0x493)] = ux(0x622)),
      (eD[ux(0x307)] = ux(0xb5e)),
      (eD[ux(0x405)] = 0x32),
      (eD[ux(0x44e)] = 0x14),
      (eD[ux(0xb1d)] = 0x28),
      (eD[ux(0x700)] = !![]),
      (eD[ux(0xce5)] = [[ux(0x22b), "F"]]);
    const eE = {};
    (eE[ux(0xc49)] = ux(0x617)),
      (eE[ux(0x493)] = ux(0xa6b)),
      (eE[ux(0x307)] = ux(0x96b)),
      (eE[ux(0x405)] = 0x32),
      (eE[ux(0x44e)] = 0x14),
      (eE[ux(0xede)] = 0.05),
      (eE[ux(0x688)] = !![]),
      (eE[ux(0xce5)] = [[ux(0x617), "J"]]);
    const eF = {};
    (eF[ux(0xc49)] = ux(0xaa4)),
      (eF[ux(0x493)] = ux(0xa58)),
      (eF[ux(0x307)] = ux(0x54d)),
      (eF[ux(0x405)] = 0x64),
      (eF[ux(0x44e)] = 0x1e),
      (eF[ux(0xede)] = 0.05),
      (eF[ux(0xb1d)] = 0x32),
      (eF[ux(0x688)] = !![]),
      (eF[ux(0xce5)] = [
        [ux(0xe58), "D"],
        [ux(0x632), "E"],
      ]);
    const eG = {};
    (eG[ux(0xc49)] = ux(0x64c)),
      (eG[ux(0x493)] = ux(0x751)),
      (eG[ux(0x307)] = ux(0x416)),
      (eG[ux(0x405)] = 0x96),
      (eG[ux(0x44e)] = 0x14),
      (eG[ux(0xb1d)] = 0x28),
      (eG[ux(0xce5)] = [
        [ux(0x227), "D"],
        [ux(0xc7e), "F"],
      ]),
      (eG[ux(0xb56)] = [[ux(0x78c), 0x1, 0.3]]);
    const eH = {};
    (eH[ux(0xc49)] = ux(0x1fd)),
      (eH[ux(0x493)] = ux(0x6e8)),
      (eH[ux(0x307)] = ux(0x8e0)),
      (eH[ux(0x405)] = 0x32),
      (eH[ux(0x44e)] = 0x5),
      (eH[ux(0xede)] = 0.05),
      (eH[ux(0x688)] = !![]),
      (eH[ux(0xce5)] = [
        [ux(0x1fd), "h"],
        [ux(0xc4e), "J"],
      ]);
    const eI = {};
    (eI[ux(0xc49)] = ux(0xa41)),
      (eI[ux(0x493)] = ux(0x820)),
      (eI[ux(0x307)] = ux(0xf1d)),
      (eI[ux(0x405)] = 0x64),
      (eI[ux(0x44e)] = 0x5),
      (eI[ux(0xede)] = 0.05),
      (eI[ux(0x688)] = !![]),
      (eI[ux(0xce5)] = [[ux(0xa41), "h"]]);
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
      eK = eJ[ux(0xf30)],
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
      (eM[re] = [rf]), (rf[ux(0x307)] = cR[rf[ux(0x307)]]), eQ(rf);
      rf[ux(0xce5)] &&
        rf[ux(0xce5)][ux(0x45f)]((rh) => {
          const uK = ux;
          rh[0x1] = rh[0x1][uK(0xe7c)]()[uK(0x7b7)](0x0) - 0x41;
        });
      (rf["id"] = re), (rf[ux(0xb85)] = re);
      if (!rf[ux(0x82f)]) rf[ux(0x82f)] = rf[ux(0xc49)];
      for (let rh = 0x1; rh <= da; rh++) {
        const ri = JSON[ux(0x76c)](JSON[ux(0xf23)](rf));
        (ri[ux(0xc49)] = rf[ux(0xc49)] + "_" + rh),
          (ri[ux(0x257)] = rh),
          (eM[re][rh] = ri),
          dI(rf, ri),
          eQ(ri),
          (ri["id"] = eJ[ux(0xf30)]),
          eJ[ux(0xf33)](ri);
      }
    }
    for (let rj = 0x0; rj < eJ[ux(0xf30)]; rj++) {
      const rk = eJ[rj];
      rk[ux(0x31a)] && eP(rk, rk[ux(0x31a)]),
        rk[ux(0xb56)] && eP(rk, rk[ux(0xb56)]);
    }
    function eP(rl, rm) {
      const uL = ux;
      rm[uL(0x45f)]((rn) => {
        const uM = uL,
          ro = rn[0x0] + (rl[uM(0x257)] > 0x0 ? "_" + rl[uM(0x257)] : "");
        rn[0x0] = eL[ro];
      });
    }
    function eQ(rl) {
      const uN = ux;
      (rl[uN(0x2fa)] = df(rl[uN(0x257)], rl[uN(0x405)]) * dK[rl[uN(0x257)]]),
        (rl[uN(0x4ab)] = df(rl[uN(0x257)], rl[uN(0x44e)])),
        rl[uN(0x8f2)]
          ? (rl[uN(0x445)] = rl[uN(0xb1d)])
          : (rl[uN(0x445)] = rl[uN(0xb1d)] * dL[rl[uN(0x257)]]),
        (rl[uN(0x6e7)] = df(rl[uN(0x257)], rl[uN(0x2b2)])),
        (rl[uN(0xd6d)] = df(rl[uN(0x257)], rl[uN(0xcd7)])),
        (rl[uN(0xf03)] = df(rl[uN(0x257)], rl[uN(0xf19)]) * dK[rl[uN(0x257)]]),
        (rl[uN(0x6ec)] = df(rl[uN(0x257)], rl[uN(0x6d2)])),
        rl[uN(0x4e5)] && (rl[uN(0xa7d)] = df(rl[uN(0x257)], rl[uN(0x4e5)])),
        (rl[uN(0x575)] = df(rl[uN(0x257)], rl[uN(0x93f)])),
        (eL[rl[uN(0xc49)]] = rl),
        eN[rl[uN(0x257)]][uN(0xf33)](rl);
    }
    function eR(rl) {
      return (rl / 0xff) * Math["PI"] * 0x2;
    }
    var eS = Math["PI"] * 0x2;
    function eT(rl) {
      const uO = ux;
      return (
        (rl %= eS), rl < 0x0 && (rl += eS), Math[uO(0xcec)]((rl / eS) * 0xff)
      );
    }
    function eU(rl) {
      const uP = ux;
      if (!rl || rl[uP(0xf30)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        uP(0x6b1)
      ](rl);
    }
    function eV(rl, rm) {
      return dE[rl + (rm > 0x0 ? "_" + rm : "")];
    }
    var eW = d9[ux(0x696)]((rl) => rl[ux(0xe12)]() + ux(0x47b)),
      eX = d9[ux(0x696)]((rl) => ux(0x9ed) + rl + ux(0x699)),
      eY = {};
    eW[ux(0x45f)]((rl) => {
      eY[rl] = 0x0;
    });
    var eZ = {};
    eX[ux(0x45f)]((rl) => {
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
        timeJoined: Date[uQ(0x296)]() * f0,
      };
    }
    var f2 = ux(0x6cd)[ux(0xb3d)]("\x20");
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
    for (let rl = 0x0; rl < f4[ux(0xf30)]; rl++) {
      const rm = f4[rl],
        rn = rm[rm[ux(0xf30)] - 0x1],
        ro = dN(rn);
      for (let rp = 0x0; rp < ro[ux(0xf30)]; rp++) {
        const rq = ro[rp];
        if (rq[0x0] < 0x1e) {
          let rr = rq[0x0];
          (rr *= 1.5),
            rr < 1.5 && (rr *= 0xa),
            (rr = parseFloat(rr[ux(0x278)](0x3))),
            (rq[0x0] = rr);
        }
        rq[0x1] = d8[ux(0xefb)];
      }
      ro[ux(0xf33)]([0.01, d8[ux(0xc60)]]), rm[ux(0xf33)](ro);
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
      instagram: ux(0x57a),
      discord: ux(0xa6c),
      paw: ux(0x516),
      gear: ux(0xac7),
      scroll: ux(0xe1b),
      bag: ux(0x8ca),
      food: ux(0xdb1),
      graph: ux(0x4e6),
      resize: ux(0x85a),
      users: ux(0x326),
      trophy: ux(0x3dd),
      shop: ux(0xe86),
      dice: ux(0x7ec),
      data: ux(0xd11),
      poopPath: new Path2D(ux(0xc8c)),
    };
    function f9(rs) {
      const uR = ux;
      return rs[uR(0x51a)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fa(rs) {
      const uS = ux;
      if(hack.isEnabled('disableChatCheck')) return rs;
      return (
        (rs = f9(rs)),
        (rs = rs[uS(0x51a)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uS(0x51a)](/(.)\1{2,}/gi, "$1")
          [uS(0x51a)](/\u200B|\u200C|\u200D/g, "")
          [uS(0x77b)]()),
        !rs && (rs = uS(0xb99)),
        rs
      );
    }
    var fb = 0x113;
    function fc(rs) {
      const uT = ux,
        rt = rs[uT(0xb3d)]("\x0a")[uT(0xe63)](
          (ru) => ru[uT(0x77b)]()[uT(0xf30)] > 0x0
        );
      return { title: rt[uT(0xd1e)](), content: rt };
    }
    const fd = {};
    (fd[ux(0x9c7)] = ux(0x8d8)),
      (fd[ux(0x834)] = [
        ux(0x7b6),
        ux(0xa9d),
        ux(0xc89),
        ux(0xa1a),
        ux(0x485),
        ux(0x37c),
        ux(0xcc0),
        ux(0x984),
      ]);
    const fe = {};
    (fe[ux(0x9c7)] = ux(0xe08)), (fe[ux(0x834)] = [ux(0x3a7)]);
    const ff = {};
    (ff[ux(0x9c7)] = ux(0xa79)),
      (ff[ux(0x834)] = [ux(0x6d4), ux(0xc1c), ux(0x613), ux(0x90e)]);
    const fg = {};
    (fg[ux(0x9c7)] = ux(0x4d3)),
      (fg[ux(0x834)] = [
        ux(0xa6d),
        ux(0xa6f),
        ux(0xe35),
        ux(0x2c0),
        ux(0x473),
        ux(0x718),
        ux(0x74f),
        ux(0x38b),
        ux(0x973),
      ]);
    const fh = {};
    (fh[ux(0x9c7)] = ux(0x357)),
      (fh[ux(0x834)] = [ux(0xd01), ux(0x568), ux(0x4c4), ux(0xc14)]);
    const fi = {};
    (fi[ux(0x9c7)] = ux(0x99f)), (fi[ux(0x834)] = [ux(0x4d6)]);
    const fj = {};
    (fj[ux(0x9c7)] = ux(0xc03)), (fj[ux(0x834)] = [ux(0x844), ux(0x8f3)]);
    const fk = {};
    (fk[ux(0x9c7)] = ux(0x9ec)),
      (fk[ux(0x834)] = [
        ux(0x588),
        ux(0x33a),
        ux(0xbbf),
        ux(0x896),
        ux(0xde4),
        ux(0x28b),
        ux(0xb41),
        ux(0x7fa),
      ]);
    const fl = {};
    (fl[ux(0x9c7)] = ux(0x54e)),
      (fl[ux(0x834)] = [
        ux(0xaed),
        ux(0xa90),
        ux(0x728),
        ux(0x788),
        ux(0x652),
        ux(0x4b3),
        ux(0x856),
        ux(0xdb9),
      ]);
    const fm = {};
    (fm[ux(0x9c7)] = ux(0x7ed)), (fm[ux(0x834)] = [ux(0x655)]);
    const fn = {};
    (fn[ux(0x9c7)] = ux(0x3e6)),
      (fn[ux(0x834)] = [
        ux(0x53d),
        ux(0x9e8),
        ux(0x7ac),
        ux(0xb0b),
        ux(0x851),
        ux(0x400),
        ux(0xed1),
      ]);
    const fo = {};
    (fo[ux(0x9c7)] = ux(0x2a1)), (fo[ux(0x834)] = [ux(0x804)]);
    const fp = {};
    (fp[ux(0x9c7)] = ux(0xa31)),
      (fp[ux(0x834)] = [ux(0x5a0), ux(0x732), ux(0x8c1), ux(0xec3)]);
    const fq = {};
    (fq[ux(0x9c7)] = ux(0x2ba)), (fq[ux(0x834)] = [ux(0xcd6), ux(0x6ea)]);
    const fr = {};
    (fr[ux(0x9c7)] = ux(0x25c)),
      (fr[ux(0x834)] = [ux(0x2d0), ux(0xa47), ux(0x6cb), ux(0x790)]);
    const fs = {};
    (fs[ux(0x9c7)] = ux(0x7cf)),
      (fs[ux(0x834)] = [ux(0xa22), ux(0xc9d), ux(0x4cd), ux(0x986)]);
    const ft = {};
    (ft[ux(0x9c7)] = ux(0xbdc)),
      (ft[ux(0x834)] = [
        ux(0x251),
        ux(0xec7),
        ux(0x3b0),
        ux(0x3e8),
        ux(0x4dc),
        ux(0x23b),
      ]);
    const fu = {};
    (fu[ux(0x9c7)] = ux(0x322)), (fu[ux(0x834)] = [ux(0x308)]);
    const fv = {};
    (fv[ux(0x9c7)] = ux(0x3aa)), (fv[ux(0x834)] = [ux(0xa3c), ux(0x715)]);
    const fw = {};
    (fw[ux(0x9c7)] = ux(0x9c0)),
      (fw[ux(0x834)] = [ux(0xd61), ux(0xc0a), ux(0x1d5)]);
    const fx = {};
    (fx[ux(0x9c7)] = ux(0xac4)),
      (fx[ux(0x834)] = [ux(0x5a2), ux(0xbad), ux(0x661), ux(0x946), ux(0xe73)]);
    const fy = {};
    (fy[ux(0x9c7)] = ux(0x61b)), (fy[ux(0x834)] = [ux(0x208), ux(0x855)]);
    const fz = {};
    (fz[ux(0x9c7)] = ux(0xc4d)),
      (fz[ux(0x834)] = [ux(0x482), ux(0xc1d), ux(0x5ab)]);
    const fA = {};
    (fA[ux(0x9c7)] = ux(0x598)), (fA[ux(0x834)] = [ux(0x664)]);
    const fB = {};
    (fB[ux(0x9c7)] = ux(0xcfe)), (fB[ux(0x834)] = [ux(0x40b)]);
    const fC = {};
    (fC[ux(0x9c7)] = ux(0x6c1)), (fC[ux(0x834)] = [ux(0xc26)]);
    const fD = {};
    (fD[ux(0x9c7)] = ux(0x3cc)),
      (fD[ux(0x834)] = [ux(0x945), ux(0x47d), ux(0xe20)]);
    const fE = {};
    (fE[ux(0x9c7)] = ux(0x86d)),
      (fE[ux(0x834)] = [
        ux(0x6b6),
        ux(0xb6e),
        ux(0xb21),
        ux(0x4c9),
        ux(0x7b9),
        ux(0x71c),
        ux(0xe94),
        ux(0xeb5),
        ux(0xa4b),
        ux(0x2a5),
        ux(0xdfe),
        ux(0xd8d),
        ux(0x370),
        ux(0x57c),
      ]);
    const fF = {};
    (fF[ux(0x9c7)] = ux(0x4af)),
      (fF[ux(0x834)] = [
        ux(0xd58),
        ux(0xd07),
        ux(0x587),
        ux(0x292),
        ux(0xd89),
        ux(0xf14),
        ux(0x65b),
        ux(0x4a3),
      ]);
    const fG = {};
    (fG[ux(0x9c7)] = ux(0xd22)),
      (fG[ux(0x834)] = [
        ux(0x2e3),
        ux(0xb6d),
        ux(0xe3e),
        ux(0xee8),
        ux(0xcbe),
        ux(0xcf1),
        ux(0x66e),
        ux(0x784),
        ux(0x7d7),
        ux(0x2b7),
        ux(0xd85),
        ux(0x57f),
        ux(0xe24),
        ux(0xcbf),
      ]);
    const fH = {};
    (fH[ux(0x9c7)] = ux(0x95b)),
      (fH[ux(0x834)] = [
        ux(0x41d),
        ux(0x7ea),
        ux(0xe8d),
        ux(0x915),
        ux(0x630),
        ux(0xa5a),
        ux(0x75f),
      ]);
    const fI = {};
    (fI[ux(0x9c7)] = ux(0x3d1)),
      (fI[ux(0x834)] = [
        ux(0xec9),
        ux(0xe38),
        ux(0x6fc),
        ux(0x51c),
        ux(0x25b),
        ux(0x4bf),
        ux(0x465),
        ux(0xabb),
        ux(0x29f),
        ux(0x437),
        ux(0xa3b),
        ux(0x2e9),
        ux(0xd75),
        ux(0xb10),
      ]);
    const fJ = {};
    (fJ[ux(0x9c7)] = ux(0x470)),
      (fJ[ux(0x834)] = [
        ux(0x5d6),
        ux(0xd60),
        ux(0x638),
        ux(0x93c),
        ux(0xbdf),
        ux(0x6ad),
        ux(0xd4b),
        ux(0xbab),
        ux(0x927),
        ux(0xa72),
        ux(0x5b7),
        ux(0xca0),
        ux(0xad0),
        ux(0x1ce),
        ux(0xa00),
      ]);
    const fK = {};
    (fK[ux(0x9c7)] = ux(0x4b0)),
      (fK[ux(0x834)] = [
        ux(0xca2),
        ux(0xc8a),
        ux(0x252),
        ux(0x75e),
        ux(0x57d),
        ux(0x432),
        ux(0x8eb),
        ux(0x21a),
        ux(0xcb1),
        ux(0xd59),
        ux(0x3cb),
        ux(0x346),
        ux(0x243),
      ]);
    const fL = {};
    (fL[ux(0x9c7)] = ux(0x768)),
      (fL[ux(0x834)] = [
        ux(0x3de),
        ux(0x9cb),
        ux(0xeca),
        ux(0xa68),
        ux(0x27f),
        ux(0x48c),
      ]);
    const fM = {};
    (fM[ux(0x9c7)] = ux(0x735)),
      (fM[ux(0x834)] = [
        ux(0x767),
        ux(0x69d),
        ux(0x74a),
        ux(0x91d),
        ux(0x4ae),
        ux(0x502),
        ux(0xef4),
        ux(0xa7e),
        ux(0x6d3),
      ]);
    const fN = {};
    (fN[ux(0x9c7)] = ux(0x735)),
      (fN[ux(0x834)] = [
        ux(0x2ca),
        ux(0xc52),
        ux(0xeb4),
        ux(0xae3),
        ux(0x9f1),
        ux(0x515),
        ux(0xac5),
        ux(0xe84),
        ux(0x8fa),
        ux(0xc45),
        ux(0x4d4),
        ux(0xb34),
        ux(0x6fd),
        ux(0x2f9),
        ux(0x4a0),
        ux(0xbe0),
        ux(0x4cc),
      ]);
    const fO = {};
    (fO[ux(0x9c7)] = ux(0x2f3)), (fO[ux(0x834)] = [ux(0x91c), ux(0xbac)]);
    const fP = {};
    (fP[ux(0x9c7)] = ux(0x4dd)),
      (fP[ux(0x834)] = [ux(0xe66), ux(0x9fc), ux(0x7c8)]);
    const fQ = {};
    (fQ[ux(0x9c7)] = ux(0x71b)),
      (fQ[ux(0x834)] = [ux(0x3a5), ux(0x495), ux(0x798), ux(0xb29)]);
    const fR = {};
    (fR[ux(0x9c7)] = ux(0x7f7)),
      (fR[ux(0x834)] = [
        ux(0x620),
        ux(0x1d6),
        ux(0xc3a),
        ux(0x5bd),
        ux(0x9da),
        ux(0x51e),
      ]);
    const fS = {};
    (fS[ux(0x9c7)] = ux(0xec8)), (fS[ux(0x834)] = [ux(0x3b6)]);
    const fT = {};
    (fT[ux(0x9c7)] = ux(0x456)),
      (fT[ux(0x834)] = [
        ux(0x8ac),
        ux(0xea1),
        ux(0xdfd),
        ux(0xd1f),
        ux(0x267),
        ux(0x35b),
        ux(0x9ee),
        ux(0x4cb),
      ]);
    const fU = {};
    (fU[ux(0x9c7)] = ux(0xdb0)), (fU[ux(0x834)] = [ux(0xe43), ux(0xa8c)]);
    const fV = {};
    (fV[ux(0x9c7)] = ux(0x3c4)),
      (fV[ux(0x834)] = [ux(0x2ee), ux(0xe2e), ux(0xa20), ux(0xda8), ux(0xaa9)]);
    const fW = {};
    (fW[ux(0x9c7)] = ux(0x88b)),
      (fW[ux(0x834)] = [
        ux(0x333),
        ux(0x82c),
        ux(0x85e),
        ux(0x868),
        ux(0x663),
        ux(0x8d1),
        ux(0xb8f),
        ux(0xb8d),
        ux(0xd48),
      ]);
    const fX = {};
    (fX[ux(0x9c7)] = ux(0xa64)),
      (fX[ux(0x834)] = [
        ux(0x73b),
        ux(0x98c),
        ux(0x4cf),
        ux(0xe62),
        ux(0x764),
        ux(0xbea),
        ux(0xb0e),
        ux(0x84b),
      ]);
    const fY = {};
    (fY[ux(0x9c7)] = ux(0x68e)),
      (fY[ux(0x834)] = [
        ux(0xd56),
        ux(0x845),
        ux(0x84c),
        ux(0xe65),
        ux(0xcdc),
        ux(0x72f),
        ux(0x40f),
        ux(0x4fe),
        ux(0x91f),
      ]);
    const fZ = {};
    (fZ[ux(0x9c7)] = ux(0xce9)),
      (fZ[ux(0x834)] = [
        ux(0x865),
        ux(0xbf6),
        ux(0xb1c),
        ux(0x72f),
        ux(0xdfa),
        ux(0x878),
        ux(0x6a1),
        ux(0xc85),
        ux(0xc16),
        ux(0xdb8),
        ux(0x9fe),
      ]);
    const g0 = {};
    (g0[ux(0x9c7)] = ux(0xce9)),
      (g0[ux(0x834)] = [ux(0xa21), ux(0x6a6), ux(0x313), ux(0xcc6), ux(0x277)]);
    const g1 = {};
    (g1[ux(0x9c7)] = ux(0x325)), (g1[ux(0x834)] = [ux(0xa53), ux(0xaa1)]);
    const g2 = {};
    (g2[ux(0x9c7)] = ux(0xd9c)), (g2[ux(0x834)] = [ux(0xd23)]);
    const g3 = {};
    (g3[ux(0x9c7)] = ux(0x7af)),
      (g3[ux(0x834)] = [ux(0x36b), ux(0xbc8), ux(0x55b), ux(0x932)]);
    const g4 = {};
    (g4[ux(0x9c7)] = ux(0x779)),
      (g4[ux(0x834)] = [ux(0x2b4), ux(0x62f), ux(0x389), ux(0x6a5)]);
    const g5 = {};
    (g5[ux(0x9c7)] = ux(0x779)),
      (g5[ux(0x834)] = [
        ux(0x8b4),
        ux(0xd4b),
        ux(0x20f),
        ux(0xafd),
        ux(0x9e4),
        ux(0x7b2),
        ux(0x872),
        ux(0xc17),
        ux(0xd5a),
        ux(0x62c),
        ux(0x753),
        ux(0x31b),
        ux(0x30b),
        ux(0xaec),
        ux(0x299),
        ux(0x54c),
        ux(0x634),
        ux(0xb71),
        ux(0x9c8),
        ux(0x48e),
      ]);
    const g6 = {};
    (g6[ux(0x9c7)] = ux(0x818)),
      (g6[ux(0x834)] = [ux(0x23e), ux(0xcd0), ux(0x2fe), ux(0xdb4)]);
    const g7 = {};
    (g7[ux(0x9c7)] = ux(0x441)),
      (g7[ux(0x834)] = [ux(0xe5d), ux(0x9b5), ux(0x9e2)]);
    const g8 = {};
    (g8[ux(0x9c7)] = ux(0xb6f)),
      (g8[ux(0x834)] = [
        ux(0x6ef),
        ux(0x8a6),
        ux(0x5cc),
        ux(0xef9),
        ux(0x3bf),
        ux(0x3b1),
        ux(0x33b),
        ux(0xdcd),
        ux(0xbd4),
        ux(0x8e7),
        ux(0xa42),
        ux(0xc5d),
        ux(0x919),
        ux(0x236),
        ux(0x836),
      ]);
    const g9 = {};
    (g9[ux(0x9c7)] = ux(0x300)), (g9[ux(0x834)] = [ux(0xf00), ux(0xd40)]);
    const ga = {};
    (ga[ux(0x9c7)] = ux(0x807)),
      (ga[ux(0x834)] = [ux(0x824), ux(0x3d3), ux(0x20c)]);
    const gb = {};
    (gb[ux(0x9c7)] = ux(0x761)),
      (gb[ux(0x834)] = [ux(0x7cd), ux(0x52c), ux(0xe8c)]);
    const gc = {};
    (gc[ux(0x9c7)] = ux(0x210)),
      (gc[ux(0x834)] = [ux(0x217), ux(0xcbc), ux(0xa63), ux(0x83a)]);
    const gd = {};
    (gd[ux(0x9c7)] = ux(0x943)),
      (gd[ux(0x834)] = [ux(0xea0), ux(0x850), ux(0x3db)]);
    const ge = {};
    (ge[ux(0x9c7)] = ux(0x248)),
      (ge[ux(0x834)] = [
        ux(0xd4b),
        ux(0xde5),
        ux(0x5b6),
        ux(0x433),
        ux(0x28a),
        ux(0xe5f),
        ux(0x557),
        ux(0x2b9),
        ux(0xcb3),
        ux(0xca7),
        ux(0xc06),
        ux(0x703),
        ux(0x33d),
        ux(0x318),
        ux(0x338),
        ux(0xcb2),
        ux(0x37a),
        ux(0xc22),
        ux(0x366),
        ux(0xe5b),
        ux(0x231),
        ux(0xa4a),
        ux(0xbf0),
        ux(0xd12),
      ]);
    const gf = {};
    (gf[ux(0x9c7)] = ux(0xa97)),
      (gf[ux(0x834)] = [ux(0x4b8), ux(0x3d7), ux(0x787), ux(0xcf7)]);
    const gg = {};
    (gg[ux(0x9c7)] = ux(0x904)),
      (gg[ux(0x834)] = [
        ux(0x959),
        ux(0x399),
        ux(0x539),
        ux(0xd4b),
        ux(0xbef),
        ux(0xb77),
        ux(0xbd2),
        ux(0xef8),
      ]);
    const gh = {};
    (gh[ux(0x9c7)] = ux(0x1fb)),
      (gh[ux(0x834)] = [
        ux(0x3e9),
        ux(0x2e1),
        ux(0xef9),
        ux(0xa50),
        ux(0x569),
        ux(0x219),
        ux(0x41c),
        ux(0x88a),
        ux(0x499),
        ux(0x33c),
        ux(0xbbd),
        ux(0xe9e),
        ux(0xcbb),
        ux(0xde7),
        ux(0x51f),
        ux(0x4df),
        ux(0xcad),
      ]);
    const gi = {};
    (gi[ux(0x9c7)] = ux(0x695)),
      (gi[ux(0x834)] = [
        ux(0xf2b),
        ux(0x711),
        ux(0x82a),
        ux(0x9c6),
        ux(0x4e7),
        ux(0xed2),
        ux(0x8be),
        ux(0x55c),
        ux(0x942),
        ux(0xe8e),
        ux(0xcce),
      ]);
    const gj = {};
    (gj[ux(0x9c7)] = ux(0xd67)),
      (gj[ux(0x834)] = [
        ux(0x777),
        ux(0x550),
        ux(0x82d),
        ux(0xac8),
        ux(0x2d4),
        ux(0x4d5),
        ux(0xbeb),
        ux(0xafc),
        ux(0xe14),
        ux(0x860),
      ]);
    const gk = {};
    (gk[ux(0x9c7)] = ux(0xd67)),
      (gk[ux(0x834)] = [
        ux(0x584),
        ux(0xc20),
        ux(0x1e8),
        ux(0xdd3),
        ux(0x590),
        ux(0xbd0),
        ux(0xca1),
        ux(0x6de),
        ux(0x319),
        ux(0xcb6),
      ]);
    const gl = {};
    (gl[ux(0x9c7)] = ux(0xc25)),
      (gl[ux(0x834)] = [
        ux(0xacd),
        ux(0x5f0),
        ux(0x7a5),
        ux(0xb11),
        ux(0xb95),
        ux(0x46f),
        ux(0x74c),
        ux(0x7f1),
        ux(0x269),
        ux(0xb8c),
      ]);
    const gm = {};
    (gm[ux(0x9c7)] = ux(0xc25)),
      (gm[ux(0x834)] = [
        ux(0xa21),
        ux(0xa25),
        ux(0x626),
        ux(0x93b),
        ux(0xc87),
        ux(0x871),
        ux(0xe4c),
        ux(0xa52),
        ux(0x41f),
        ux(0x763),
        ux(0x548),
      ]);
    const gn = {};
    (gn[ux(0x9c7)] = ux(0x3f1)),
      (gn[ux(0x834)] = [ux(0x738), ux(0x888), ux(0x397)]);
    const go = {};
    (go[ux(0x9c7)] = ux(0x3f1)),
      (go[ux(0x834)] = [
        ux(0x1d1),
        ux(0x3ce),
        ux(0xb76),
        ux(0xbe9),
        ux(0x25d),
        ux(0xc97),
        ux(0x53c),
        ux(0x9b9),
      ]);
    const gp = {};
    (gp[ux(0x9c7)] = ux(0xe51)),
      (gp[ux(0x834)] = [ux(0x2c6), ux(0xc91), ux(0xb50)]);
    const gq = {};
    (gq[ux(0x9c7)] = ux(0xe51)),
      (gq[ux(0x834)] = [
        ux(0xe9d),
        ux(0x6d3),
        ux(0xa8d),
        ux(0x662),
        ux(0x762),
        ux(0xe53),
      ]);
    const gr = {};
    (gr[ux(0x9c7)] = ux(0xe51)),
      (gr[ux(0x834)] = [ux(0x487), ux(0x668), ux(0x46b), ux(0x215)]);
    const gs = {};
    (gs[ux(0x9c7)] = ux(0xe51)),
      (gs[ux(0x834)] = [
        ux(0xccf),
        ux(0x3f2),
        ux(0x36c),
        ux(0xd4a),
        ux(0x8f8),
        ux(0x287),
        ux(0x85d),
        ux(0x92c),
        ux(0x8a5),
        ux(0x7c2),
        ux(0xd66),
      ]);
    const gt = {};
    (gt[ux(0x9c7)] = ux(0x336)),
      (gt[ux(0x834)] = [ux(0xdd8), ux(0xd0c), ux(0xc10)]);
    const gu = {};
    (gu[ux(0x9c7)] = ux(0xa55)),
      (gu[ux(0x834)] = [
        ux(0xa02),
        ux(0x3e2),
        ux(0x6d3),
        ux(0xb78),
        ux(0xc09),
        ux(0x380),
        ux(0xbb5),
        ux(0x964),
        ux(0x466),
        ux(0x7c1),
        ux(0x350),
        ux(0xcbd),
        ux(0xef9),
        ux(0x1f0),
        ux(0x873),
        ux(0x6f6),
        ux(0x47e),
        ux(0xac9),
        ux(0x9d8),
        ux(0x971),
        ux(0xe25),
        ux(0xc8f),
        ux(0x452),
        ux(0x65f),
        ux(0x40e),
        ux(0xa1c),
        ux(0x61f),
        ux(0xc58),
        ux(0xd2b),
        ux(0x3d8),
        ux(0x8c4),
        ux(0x60e),
        ux(0xa81),
        ux(0x249),
      ]);
    const gv = {};
    (gv[ux(0x9c7)] = ux(0x577)), (gv[ux(0x834)] = [ux(0x939)]);
    const gw = {};
    (gw[ux(0x9c7)] = ux(0x707)),
      (gw[ux(0x834)] = [
        ux(0xcf0),
        ux(0x35c),
        ux(0x7b0),
        ux(0x58c),
        ux(0xc55),
        ux(0x838),
        ux(0x65e),
        ux(0xef9),
        ux(0x97b),
        ux(0x975),
        ux(0x27b),
        ux(0x948),
        ux(0xddc),
        ux(0x45d),
        ux(0x6ff),
        ux(0x802),
        ux(0x5bf),
        ux(0x84d),
        ux(0xec6),
        ux(0xea7),
        ux(0xeda),
        ux(0x2b6),
        ux(0x98a),
        ux(0x9ba),
        ux(0xb59),
        ux(0xdd6),
        ux(0xe7b),
        ux(0xde6),
        ux(0x3df),
        ux(0x3e3),
        ux(0x60e),
        ux(0x5aa),
        ux(0x3f9),
        ux(0x62a),
        ux(0x974),
      ]);
    const gx = {};
    (gx[ux(0x9c7)] = ux(0x963)),
      (gx[ux(0x834)] = [
        ux(0xdcb),
        ux(0x935),
        ux(0x8bd),
        ux(0xf12),
        ux(0x816),
        ux(0xc76),
        ux(0xef9),
        ux(0x226),
        ux(0xad1),
        ux(0x283),
        ux(0xbcb),
        ux(0xb65),
        ux(0x4c3),
        ux(0x342),
        ux(0x381),
        ux(0xbbb),
        ux(0xc88),
        ux(0x72b),
        ux(0xe1e),
        ux(0xaea),
        ux(0xd7c),
        ux(0x5bf),
        ux(0x2f7),
        ux(0x34e),
        ux(0x907),
        ux(0x364),
        ux(0xe95),
        ux(0xada),
        ux(0xf18),
        ux(0x3d4),
        ux(0x697),
        ux(0x50a),
        ux(0xa4d),
        ux(0xc65),
        ux(0x60e),
        ux(0xe3b),
        ux(0xd34),
        ux(0xc57),
        ux(0xe90),
      ]);
    const gy = {};
    (gy[ux(0x9c7)] = ux(0xd93)),
      (gy[ux(0x834)] = [
        ux(0xab5),
        ux(0xec5),
        ux(0x60e),
        ux(0x21f),
        ux(0xa27),
        ux(0x87b),
        ux(0xbb6),
        ux(0x7ba),
        ux(0x6d5),
        ux(0xef9),
        ux(0x5ca),
        ux(0xaa3),
        ux(0x7fb),
        ux(0xc86),
      ]);
    const gz = {};
    (gz[ux(0x9c7)] = ux(0xe68)),
      (gz[ux(0x834)] = [ux(0xc66), ux(0xcc4), ux(0xbb2), ux(0xb52), ux(0x232)]);
    const gA = {};
    (gA[ux(0x9c7)] = ux(0xadf)),
      (gA[ux(0x834)] = [ux(0xaef), ux(0x330), ux(0x268), ux(0x1da)]);
    const gB = {};
    (gB[ux(0x9c7)] = ux(0xadf)),
      (gB[ux(0x834)] = [ux(0x6d3), ux(0xc0b), ux(0x272)]);
    const gC = {};
    (gC[ux(0x9c7)] = ux(0xbb0)),
      (gC[ux(0x834)] = [ux(0xc28), ux(0x35a), ux(0xdb5), ux(0xc04), ux(0xabe)]);
    const gD = {};
    (gD[ux(0x9c7)] = ux(0xbb0)),
      (gD[ux(0x834)] = [ux(0x55f), ux(0x6f7), ux(0xc81), ux(0x781)]);
    const gE = {};
    (gE[ux(0x9c7)] = ux(0xbb0)), (gE[ux(0x834)] = [ux(0x525), ux(0x239)]);
    const gF = {};
    (gF[ux(0x9c7)] = ux(0x883)),
      (gF[ux(0x834)] = [
        ux(0x244),
        ux(0x7b3),
        ux(0x2af),
        ux(0xc94),
        ux(0x897),
        ux(0x7eb),
        ux(0xd5d),
        ux(0x460),
        ux(0x75c),
      ]);
    const gG = {};
    (gG[ux(0x9c7)] = ux(0x759)),
      (gG[ux(0x834)] = [
        ux(0x2bd),
        ux(0x6d9),
        ux(0x406),
        ux(0xedd),
        ux(0xb35),
        ux(0x255),
        ux(0xc98),
      ]);
    const gH = {};
    (gH[ux(0x9c7)] = ux(0xb13)),
      (gH[ux(0x834)] = [
        ux(0x224),
        ux(0xe5e),
        ux(0x6f1),
        ux(0x681),
        ux(0xd8c),
        ux(0x675),
        ux(0xd62),
        ux(0x848),
        ux(0x571),
        ux(0xa0f),
        ux(0x43d),
        ux(0xda3),
      ]);
    const gI = {};
    (gI[ux(0x9c7)] = ux(0x92a)),
      (gI[ux(0x834)] = [
        ux(0x229),
        ux(0x216),
        ux(0x1e6),
        ux(0xd1a),
        ux(0xd2c),
        ux(0x982),
        ux(0xeb7),
        ux(0xb8e),
        ux(0x760),
        ux(0x64b),
      ]);
    const gJ = {};
    (gJ[ux(0x9c7)] = ux(0x92a)),
      (gJ[ux(0x834)] = [
        ux(0xd5b),
        ux(0xc73),
        ux(0xf38),
        ux(0x4f1),
        ux(0x40c),
        ux(0xa7b),
      ]);
    const gK = {};
    (gK[ux(0x9c7)] = ux(0x7d0)),
      (gK[ux(0x834)] = [ux(0x96e), ux(0x42e), ux(0xe2d)]);
    const gL = {};
    (gL[ux(0x9c7)] = ux(0x7d0)),
      (gL[ux(0x834)] = [ux(0x6d3), ux(0xa4f), ux(0x26a), ux(0x2ac), ux(0xa9c)]);
    const gM = {};
    (gM[ux(0x9c7)] = ux(0x22f)),
      (gM[ux(0x834)] = [
        ux(0xebd),
        ux(0xdad),
        ux(0x9bb),
        ux(0xb53),
        ux(0x66c),
        ux(0xdd4),
        ux(0x60e),
        ux(0x96d),
        ux(0x8db),
        ux(0xc80),
        ux(0xb82),
        ux(0xa06),
        ux(0xef9),
        ux(0xb36),
        ux(0x831),
        ux(0x8b3),
        ux(0x281),
        ux(0x30c),
        ux(0xa2f),
      ]);
    const gN = {};
    (gN[ux(0x9c7)] = ux(0xef3)),
      (gN[ux(0x834)] = [
        ux(0xd72),
        ux(0xd6f),
        ux(0xb22),
        ux(0x284),
        ux(0xc12),
        ux(0xea3),
        ux(0xdc3),
        ux(0xb0f),
      ]);
    const gO = {};
    (gO[ux(0x9c7)] = ux(0xef3)), (gO[ux(0x834)] = [ux(0x5f8), ux(0x918)]);
    const gP = {};
    (gP[ux(0x9c7)] = ux(0xf22)), (gP[ux(0x834)] = [ux(0xc3f), ux(0x3c5)]);
    const gQ = {};
    (gQ[ux(0x9c7)] = ux(0xf22)),
      (gQ[ux(0x834)] = [
        ux(0x4f2),
        ux(0x3ee),
        ux(0xd7d),
        ux(0xb72),
        ux(0xaaa),
        ux(0xe4d),
        ux(0x7c6),
        ux(0x33e),
        ux(0xdbe),
      ]);
    const gR = {};
    (gR[ux(0x9c7)] = ux(0x82e)), (gR[ux(0x834)] = [ux(0xd76), ux(0xd26)]);
    const gS = {};
    (gS[ux(0x9c7)] = ux(0x82e)),
      (gS[ux(0x834)] = [
        ux(0x438),
        ux(0x87c),
        ux(0x8c3),
        ux(0xdd5),
        ux(0xd97),
        ux(0x2c7),
        ux(0x26b),
        ux(0x6d3),
        ux(0x770),
      ]);
    const gT = {};
    (gT[ux(0x9c7)] = ux(0xe05)), (gT[ux(0x834)] = [ux(0x8c9)]);
    const gU = {};
    (gU[ux(0x9c7)] = ux(0xe05)),
      (gU[ux(0x834)] = [
        ux(0x310),
        ux(0xc92),
        ux(0xb2b),
        ux(0xe1f),
        ux(0x6d3),
        ux(0xd00),
        ux(0xf3a),
      ]);
    const gV = {};
    (gV[ux(0x9c7)] = ux(0xe05)),
      (gV[ux(0x834)] = [ux(0xc1a), ux(0x570), ux(0xb4e)]);
    const gW = {};
    (gW[ux(0x9c7)] = ux(0xf04)),
      (gW[ux(0x834)] = [ux(0x770), ux(0x2da), ux(0xad7), ux(0x821)]);
    const gX = {};
    (gX[ux(0x9c7)] = ux(0xf04)), (gX[ux(0x834)] = [ux(0x430)]);
    const gY = {};
    (gY[ux(0x9c7)] = ux(0xf04)),
      (gY[ux(0x834)] = [ux(0xdbf), ux(0xc19), ux(0xde2), ux(0x962), ux(0x39d)]);
    const gZ = {};
    (gZ[ux(0x9c7)] = ux(0x5ed)),
      (gZ[ux(0x834)] = [ux(0xd2d), ux(0xe4a), ux(0x5f3)]);
    const h0 = {};
    (h0[ux(0x9c7)] = ux(0x489)), (h0[ux(0x834)] = [ux(0xdfb), ux(0xbe4)]);
    const h1 = {};
    (h1[ux(0x9c7)] = ux(0x6c3)), (h1[ux(0x834)] = [ux(0x56c), ux(0xe55)]);
    const h2 = {};
    (h2[ux(0x9c7)] = ux(0xcf4)), (h2[ux(0x834)] = [ux(0xbe5)]);
    var h3 = [
      fc(ux(0x540)),
      fc(ux(0x648)),
      fc(ux(0xe76)),
      fc(ux(0xb51)),
      fc(ux(0x591)),
      fc(ux(0x961)),
      fc(ux(0x26d)),
      fc(ux(0x674)),
      fc(ux(0x8c0)),
      fc(ux(0xdf7)),
      fc(ux(0x8b5)),
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
    console[ux(0xebe)](ux(0x2eb));
    var h4 = Date[ux(0x296)]() < 0x18e9c4b6482,
      h5 = Math[ux(0xe3c)](Math[ux(0x4a5)]() * 0xa);
    function h6(rs) {
      const uU = ux,
        rt = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let ru = "";
      for (const rv of rs) {
        rv === "\x20"
          ? (ru += "\x20")
          : (ru += rt[(h5 + rv[uU(0x7b7)](0x0)) % rt[uU(0xf30)]]);
      }
      return ru;
    }
    h4 &&
      document[ux(0x9e3)](ux(0xf2e))[ux(0x467)](
        ux(0x976),
        h6(ux(0x8dc)) + ux(0x771)
      );
    function h7(rs, rt, ru) {
      const uV = ux,
        rv = rt - rs;
      if (Math[uV(0x54a)](rv) < 0.01) return rt;
      return rs + rv * (0x1 - Math[uV(0x9a0)](-ru * pS));
    }
    var h8 = [],
      h9 = 0x0;
    function ha(rs, rt = 0x1388) {
      const uW = ux,
        ru = nR(uW(0x1f1) + jx(rs) + uW(0xa1b));
      kI[uW(0x8c5)](ru);
      let rv = 0x0;
      rw();
      function rw() {
        const uX = uW;
        (ru[uX(0x5f5)][uX(0x2a7)] = uX(0x960) + h9 + uX(0xa0b)),
          (ru[uX(0x5f5)][uX(0x440)] = rv);
      }
      (this[uW(0x2a0)] = ![]),
        (this[uW(0xb75)] = () => {
          const uY = uW;
          rt -= pR;
          const rx = rt > 0x0 ? 0x1 : 0x0;
          (rv = h7(rv, rx, 0.3)),
            rw(),
            rt < 0x0 &&
              rv <= 0x0 &&
              (ru[uY(0xcd1)](), (this[uY(0x2a0)] = !![])),
            (h9 += rv * (ru[uY(0x730)] + 0x5));
        }),
        h8[uW(0xf33)](this);
    }
    function hb(rs) {
      new ha(rs, 0x1388);
    }
    function hc() {
      const uZ = ux;
      h9 = 0x0;
      for (let rs = h8[uZ(0xf30)] - 0x1; rs >= 0x0; rs--) {
        const rt = h8[rs];
        rt[uZ(0xb75)](), rt[uZ(0x2a0)] && h8[uZ(0x650)](rs, 0x1);
      }
    }
    var hd = !![],
      he = document[ux(0x9e3)](ux(0xcaf));
    fetch(ux(0x618))
      [ux(0x884)]((rs) => {
        const v0 = ux;
        (he[v0(0x5f5)][v0(0x4f9)] = v0(0xdf2)), (hd = ![]);
      })
      [ux(0x6f2)]((rs) => {
        const v1 = ux;
        he[v1(0x5f5)][v1(0x4f9)] = "";
      });
    var hf = document[ux(0x9e3)](ux(0x1dc)),
      hg = Date[ux(0x296)]();
    function hh() {
      const v2 = ux;
      console[v2(0xebe)](v2(0x234)),
        (hg = Date[v2(0x296)]()),
        (hf[v2(0x5f5)][v2(0x4f9)] = "");
      try {
        aiptag[v2(0x9d7)][v2(0x4f9)][v2(0xf33)](function () {
          const v3 = v2;
          aipDisplayTag[v3(0x4f9)](v3(0x979));
        }),
          aiptag[v2(0x9d7)][v2(0x4f9)][v2(0xf33)](function () {
            const v4 = v2;
            aipDisplayTag[v4(0x4f9)](v4(0x846));
          });
      } catch (rs) {
        console[v2(0xebe)](v2(0xb69));
      }
    }
    setInterval(function () {
      const v5 = ux;
      hf[v5(0x5f5)][v5(0x4f9)] === "" &&
        Date[v5(0x296)]() - hg > 0x7530 &&
        hh();
    }, 0x2710);
    var hi = null,
      hj = 0x0;
    function hk() {
      const v6 = ux;
      console[v6(0xebe)](v6(0x6ab)),
        typeof aiptag[v6(0x5d5)] !== v6(0xaf5)
          ? ((hi = 0x45),
            (hj = Date[v6(0x296)]()),
            aiptag[v6(0x9d7)][v6(0xa16)][v6(0xf33)](function () {
              const v7 = v6;
              aiptag[v7(0x5d5)][v7(0xac3)]();
            }))
          : window[v6(0x627)](v6(0xbc6));
    }
    window[ux(0x627)] = function (rs) {
      const v8 = ux;
      console[v8(0xebe)](v8(0xe41) + rs);
      if (rs === v8(0x392) || rs[v8(0xbd9)](v8(0x593)) > -0x1) {
        if (hi !== null && Date[v8(0x296)]() - hj > 0xbb8) {
          console[v8(0xebe)](v8(0x28c));
          if (hX) {
            const rt = {};
            (rt[v8(0x9c7)] = v8(0xd90)),
              (rt[v8(0x544)] = ![]),
              kJ(
                v8(0xe31),
                (ru) => {
                  const v9 = v8;
                  ru &&
                    hX &&
                    (im(new Uint8Array([cH[v9(0x70e)]])), hJ(v9(0xd87)));
                },
                rt
              );
          }
        } else hJ(v8(0x7a1));
      } else alert(v8(0x930) + rs);
      hl[v8(0x52a)][v8(0xcd1)](v8(0x553)), (hi = null);
    };
    var hl = document[ux(0x9e3)](ux(0x572));
    (hl[ux(0xc0d)] = function () {
      const va = ux;
      hl[va(0x52a)][va(0x536)](va(0x553)), hk();
    }),
      (hl[ux(0x559)] = function () {
        const vb = ux;
        return nR(
          vb(0x21e) + hO[vb(0xefb)] + vb(0x736) + hO[vb(0xf3e)] + vb(0xf07)
        );
      }),
      (hl[ux(0xe49)] = !![]);
    var hm = [
        ux(0x2f0),
        ux(0xf05),
        ux(0x524),
        ux(0x3eb),
        ux(0xb6a),
        ux(0x59a),
        ux(0xba1),
        ux(0xc3c),
        ux(0x602),
        ux(0xe3d),
        ux(0xbb3),
        ux(0x89d),
      ],
      hn = document[ux(0x9e3)](ux(0xd88)),
      ho =
        Date[ux(0x296)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[ux(0xe3c)](Math[ux(0x4a5)]() * hm[ux(0xf30)]);
    hq();
    function hp(rs) {
      const vc = ux;
      (ho += rs),
        ho < 0x0 ? (ho = hm[vc(0xf30)] - 0x1) : (ho %= hm[vc(0xf30)]),
        hq();
    }
    function hq() {
      const vd = ux,
        rs = hm[ho];
      (hn[vd(0x5f5)][vd(0x22d)] =
        vd(0x3f3) + rs[vd(0xb3d)](vd(0x7d9))[0x1] + vd(0x1e7)),
        (hn[vd(0xc0d)] = function () {
          const ve = vd;
          window[ve(0x3a2)](rs, ve(0x335)), hp(0x1);
        });
    }
    (document[ux(0x9e3)](ux(0xef7))[ux(0xc0d)] = function () {
      hp(-0x1);
    }),
      (document[ux(0x9e3)](ux(0xf37))[ux(0xc0d)] = function () {
        hp(0x1);
      });
    var hr = document[ux(0x9e3)](ux(0x9b0));
    hr[ux(0x559)] = function () {
      const vf = ux;
      return nR(
        vf(0x21e) + hO[vf(0xefb)] + vf(0x80b) + hO[vf(0x424)] + vf(0xe28)
      );
    };
    var hs = document[ux(0x9e3)](ux(0xc71)),
      ht = document[ux(0x9e3)](ux(0x34d)),
      hu = ![];
    function hv() {
      const vg = ux;
      let rs = "";
      for (let ru = 0x0; ru < h3[vg(0xf30)]; ru++) {
        const { title: rv, content: rw } = h3[ru];
        (rs += vg(0xe9c) + rv + vg(0x44a)),
          rw[vg(0x45f)]((rx, ry) => {
            const vh = vg;
            let rz = "-\x20";
            if (rx[0x0] === "*") {
              const rA = rx[ry + 0x1];
              if (rA && rA[0x0] === "*") rz = vh(0x376);
              else rz = vh(0x2a2);
              rx = rx[vh(0x607)](0x1);
            }
            (rx = rz + rx), (rs += vh(0xc41) + rx + vh(0xee5));
          }),
          (rs += vg(0xa8a));
      }
      const rt = hC[vg(0x2df)];
      (hu = rt !== void 0x0 && parseInt(rt) < fb), (hs[vg(0xa94)] = rs);
    }
    CanvasRenderingContext2D[ux(0xdae)][ux(0x70b)] = function (rs) {
      const vi = ux;
      this[vi(0xd3a)](rs, rs);
    };
    var hw = ![];
    hw &&
      (OffscreenCanvasRenderingContext2D[ux(0xdae)][ux(0x70b)] = function (rs) {
        const vj = ux;
        this[vj(0xd3a)](rs, rs);
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
            parseInt(rs[vk(0x607)](0x1, 0x3), 0x10),
            parseInt(rs[vk(0x607)](0x3, 0x5), 0x10),
            parseInt(rs[vk(0x607)](0x5, 0x7), 0x10),
          ]),
        hy[rs]
      );
    }
    var hA = document[ux(0x636)](ux(0xa2b)),
      hB = document[ux(0x6a7)](ux(0xd55));
    for (let rs = 0x0; rs < hB[ux(0xf30)]; rs++) {
      const rt = hB[rs],
        ru = f8[rt[ux(0xe0b)](ux(0x3bd))];
      ru && rt[ux(0xd73)](nR(ru), rt[ux(0xd83)][0x0]);
    }
    var hC;
    try {
      hC = localStorage;
    } catch (rv) {
      console[ux(0xbdd)](ux(0x344), rv), (hC = {});
    }
    var hD = document[ux(0x9e3)](ux(0xd6c)),
      hE = document[ux(0x9e3)](ux(0x8f4)),
      hF = document[ux(0x9e3)](ux(0xa57));
    (hD[ux(0x559)] = function () {
      const vl = ux;
      return nR(
        vl(0x5c9) + hO[vl(0xd06)] + vl(0x50d) + cM + vl(0x895) + cL + vl(0xa3e)
      );
    }),
      (hE[ux(0xe6b)] = cL),
      (hE[ux(0xc4b)] = function () {
        const vm = ux;
        !cN[vm(0x6b1)](this[vm(0x459)]) &&
          (this[vm(0x459)] = this[vm(0x459)][vm(0x51a)](cO, ""));
      });
    var hG,
      hH = document[ux(0x9e3)](ux(0x88d));
    function hI(rw) {
      const vn = ux;
      rw ? k9(hH, rw + vn(0xd13)) : k9(hH, vn(0x97e)),
        (hD[vn(0x5f5)][vn(0x4f9)] =
          rw && rw[vn(0xbd9)]("\x20") === -0x1 ? vn(0xdf2) : "");
    }
    hF[ux(0xc0d)] = nw(function () {
      const vo = ux;
      if (!hX || jz) return;
      const rw = hE[vo(0x459)],
        rx = rw[vo(0xf30)];
      if (rx < cM) hb(vo(0x246));
      else {
        if (rx > cL) hb(vo(0x5d1));
        else {
          if (!cN[vo(0x6b1)](rw)) hb(vo(0x39a));
          else {
            hb(vo(0xc0e), hO[vo(0x424)]), (hG = rw);
            const ry = new Uint8Array([
              cH[vo(0x73d)],
              ...new TextEncoder()[vo(0xd68)](rw),
            ]);
            im(ry);
          }
        }
      }
    });
    function hJ(rw, rx = nj[ux(0x676)]) {
      nm(-0x1, null, rw, rx);
    }
    hv();
    var hK = f3(cQ),
      hL = f3(cR),
      hM = f3(d8);
    const hN = {};
    (hN[ux(0xd06)] = ux(0x531)),
      (hN[ux(0x424)] = ux(0x911)),
      (hN[ux(0xed8)] = ux(0x854)),
      (hN[ux(0x5a1)] = ux(0x541)),
      (hN[ux(0x81f)] = ux(0xad3)),
      (hN[ux(0xf3e)] = ux(0x3af)),
      (hN[ux(0xefb)] = ux(0xb61)),
      (hN[ux(0xc60)] = ux(0x4a7)),
      (hN[ux(0x9e7)] = ux(0x79a));
    var hO = hN,
      hP = Object[ux(0x669)](hO),
      hQ = [];
    for (let rw = 0x0; rw < hP[ux(0xf30)]; rw++) {
      const rx = hP[rw],
        ry = rx[ux(0x607)](0x4, rx[ux(0xbd9)](")"))
          [ux(0xb3d)](",\x20")
          [ux(0x696)]((rz) => parseInt(rz) * 0.8);
      hQ[ux(0xf33)](q2(ry));
    }
    var hR = ux(0xb97),
      hS = ux(0x84a);
    (document[ux(0x9e3)](ux(0x5a8))[ux(0xc0d)] = function () {
      const vp = ux,
        rz = nR(vp(0xbd7));
      km[vp(0x8c5)](rz),
        (rz[vp(0x9e3)](vp(0x72e))[vp(0xc0d)] = function () {
          const vq = vp;
          window[vq(0x3a2)](hS, vq(0x335));
        }),
        (rz[vp(0x9e3)](vp(0xd42))[vp(0xc0d)] = function () {
          const vr = vp;
          window[vr(0x3a2)](hR, vr(0x335));
        }),
        (rz[vp(0x9e3)](vp(0x600))[vp(0xc0d)] = function () {
          const vs = vp;
          rz[vs(0xcd1)]();
        });
    }),
      hT(ux(0xaa0), ux(0x66f)),
      hT(ux(0xb5f), ux(0x4d9)),
      hT(ux(0xd96), ux(0x59d)),
      hT(ux(0x7ca), ux(0xc96)),
      hT(ux(0x240), ux(0x2f2)),
      hT(ux(0x4d0), ux(0xc68));
    function hT(rz, rA) {
      const vt = ux;
      document[vt(0x9e3)](rz)[vt(0xc0d)] = function () {
        const vu = vt;
        window[vu(0x3a2)](rA, vu(0x335));
      };
    }
    setInterval(function () {
      const vv = ux;
      hX && im(new Uint8Array([cH[vv(0xc67)]]));
    }, 0x3e8);
    function hU() {
      const vw = ux;
      (pO = [pV]),
        (j7[vw(0x894)] = !![]),
        (j7 = {}),
        (jH = 0x0),
        (jI[vw(0xf30)] = 0x0),
        (ix = []),
        (iH[vw(0xf30)] = 0x0),
        (iD[vw(0xa94)] = ""),
        (iw = {}),
        (iI = ![]),
        (iz = null),
        (iy = null),
        (pE = 0x0),
        (hX = ![]),
        (mF = 0x0),
        (mE = 0x0),
        (mp = ![]),
        (ml[vw(0x5f5)][vw(0x4f9)] = vw(0xdf2)),
        (q6[vw(0x5f5)][vw(0x4f9)] = q5[vw(0x5f5)][vw(0x4f9)] = vw(0xdf2)),
        (pC = 0x0),
        (pD = 0x0);
    }
    var hV;
    function hW(rz) {
      const vx = ux;
      (ji[vx(0x5f5)][vx(0x4f9)] = vx(0xdf2)),
        (pj[vx(0x5f5)][vx(0x4f9)] = vx(0xdf2)),
        i0(),
        kB[vx(0x52a)][vx(0x536)](vx(0x4ac)),
        kC[vx(0x52a)][vx(0xcd1)](vx(0x4ac)),
        hU(),
        console[vx(0xebe)](vx(0xb49) + rz + vx(0x86c)),
        iv(),
        (hV = new WebSocket(rz)),
        (hV[vx(0xec4)] = vx(0x924)),
        (hV[vx(0x23d)] = hY),
        (hV[vx(0xd27)] = k2),
        (hV[vx(0xb44)] = kh);
    }
    crypto[ux(0xc95)] =
      crypto[ux(0xc95)] ||
      function rz() {
        const vy = ux;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vy(0x51a)
        ](/[018]/g, (rA) =>
          (rA ^
            (crypto[vy(0xbd6)](new Uint8Array(0x1))[0x0] &
              (0xf >> (rA / 0x4))))[vy(0xd80)](0x10)
        );
      };
    var hX = ![];
    function hY() {
      const vz = ux;
      console[vz(0xebe)](vz(0x90c)), ig();
      hack.chatFunc = hJ;
      hack.numFunc = iK;
      hack.preload();
    }
    var hZ = document[ux(0x9e3)](ux(0x594));
    function i0() {
      const vA = ux;
      hZ[vA(0x5f5)][vA(0x4f9)] = vA(0xdf2);
    }
    var i1 = document[ux(0x9e3)](ux(0xdc6)),
      i2 = document[ux(0x9e3)](ux(0xcdd)),
      i3 = document[ux(0x9e3)](ux(0xd9a)),
      i4 = document[ux(0x9e3)](ux(0x717));
    i4[ux(0xc0d)] = function () {
      const vB = ux;
      !i7 &&
        (window[vB(0x690)][vB(0x615)] =
          vB(0x1ea) +
          encodeURIComponent(!window[vB(0xb4c)] ? vB(0x88f) : vB(0x58f)) +
          vB(0x450) +
          encodeURIComponent(btoa(i6)));
    };
    var i5 = document[ux(0x9e3)](ux(0x90f));
    (i5[ux(0xc0d)] = function () {
      const vC = ux;
      i6 == hC[vC(0x91b)] && delete hC[vC(0x91b)];
      delete hC[vC(0x71a)];
      if (hV)
        try {
          hV[vC(0xd36)]();
        } catch (rA) {}
    }),
      i0();
    var i6, i7;
    function i8(rA) {
      const vE = ux;
      try {
        let rC = function (rD) {
          const vD = b;
          return rD[vD(0x51a)](/([.*+?\^$(){}|\[\]\/\\])/g, vD(0x889));
        };
        var rB = document[vE(0xcc9)][vE(0x9d2)](
          RegExp(vE(0xc5a) + rC(rA) + vE(0xb19))
        );
        return rB ? rB[0x1] : null;
      } catch (rD) {
        return "";
      }
    }
    var i9 = !window[ux(0xb4c)];
    function ia(rA) {
      const vF = ux;
      try {
        document[vF(0xcc9)] = rA + vF(0xdf6) + (i9 ? vF(0x29c) : "");
      } catch (rB) {}
    }
    var ib = 0x0,
      ic;
    function ie() {
      const vG = ux;
      (ib = 0x0), (hX = ![]);
      !eU(hC[vG(0x91b)]) && (hC[vG(0x91b)] = crypto[vG(0xc95)]());
      (i6 = hC[vG(0x91b)]), (i7 = hC[vG(0x71a)]);
      !i7 &&
        ((i7 = i8(vG(0x71a))),
        i7 && (i7 = decodeURIComponent(i7)),
        ia(vG(0x71a)));
      if (i7)
        try {
          const rA = i7;
          i7 = JSON[vG(0x76c)](decodeURIComponent(escape(atob(rA))));
          if (eU(i7[vG(0x59e)]))
            (i6 = i7[vG(0x59e)]),
              i2[vG(0x467)](vG(0x976), i7[vG(0xc49)]),
              i7[vG(0x564)] &&
                (i3[vG(0x5f5)][vG(0x22d)] = vG(0x3b8) + i7[vG(0x564)] + ")"),
              (hC[vG(0x71a)] = rA);
          else throw new Error(vG(0x7e8));
        } catch (rB) {
          (i7 = null), delete hC[vG(0x71a)], console[vG(0x676)](vG(0xa01) + rB);
        }
      ic = hC[vG(0x6a2)] || "";
    }
    function ig() {
      ie(), ij();
    }
    function ih() {
      const vH = ux,
        rA = [
          vH(0x369),
          vH(0x7bd),
          vH(0x79f),
          vH(0x899),
          vH(0xe21),
          vH(0x8d9),
          vH(0x791),
          vH(0x3a0),
          vH(0xc6c),
          vH(0xaf8),
          vH(0xe57),
          vH(0x686),
          vH(0xa12),
          vH(0xd5f),
          vH(0x704),
          vH(0xc0c),
          vH(0xde1),
          vH(0x22a),
          vH(0xc2b),
          vH(0x9f2),
          vH(0xc29),
          vH(0xd7a),
          vH(0xe87),
          vH(0x512),
          vH(0xb2f),
          vH(0x56d),
          vH(0x6be),
          vH(0xabc),
          vH(0x6c5),
          vH(0xb64),
          vH(0x887),
          vH(0x361),
          vH(0x658),
          vH(0xc1f),
          vH(0x513),
          vH(0x4b5),
          vH(0xa3d),
          vH(0x3f4),
          vH(0xd33),
          vH(0x705),
          vH(0x5be),
          vH(0x528),
          vH(0x362),
          vH(0xb92),
          vH(0xa56),
          vH(0x863),
          vH(0xc9e),
          vH(0x385),
          vH(0x1eb),
          vH(0xc3e),
          vH(0x7f9),
          vH(0xde0),
          vH(0x812),
          vH(0xc24),
          vH(0xb0d),
          vH(0x581),
          vH(0xef1),
          vH(0xc2f),
          vH(0xdf4),
          vH(0x403),
          vH(0xef2),
          vH(0x448),
          vH(0x9f6),
          vH(0x7cb),
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
          if (ii[vI(0x212)] === void 0x0) {
            var rG = function (rL) {
              const vJ = vI,
                rM = vJ(0xf39);
              let rN = "",
                rO = "";
              for (
                let rP = 0xc6a + -0x161c + -0x22 * -0x49,
                  rQ,
                  rR,
                  rS = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rR = rL[vJ(0x6c4)](rS++));
                ~rR &&
                ((rQ =
                  rP % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? rQ * (0x2422 + -0x5 * 0x38b + -0x122b) + rR
                    : rR),
                rP++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rN += String[vJ(0xeac)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (rQ >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rP) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rR = rM[vJ(0xbd9)](rR);
              }
              for (
                let rT = 0x23d0 + 0x13 * -0xdf + -0x1343, rU = rN[vJ(0xf30)];
                rT < rU;
                rT++
              ) {
                rO +=
                  "%" +
                  ("00" +
                    rN[vJ(0x7b7)](rT)[vJ(0xd80)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vJ(0x607)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
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
                  (rO + rN[rR] + rM[vK(0x7b7)](rR % rM[vK(0xf30)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rP = rN[rR]),
                  (rN[rR] = rN[rO]),
                  (rN[rO] = rP);
              }
              (rR = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rO = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rS = -0x1d30 + -0x23c8 + 0x40f8;
                rS < rL[vK(0xf30)];
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
                  (rQ += String[vK(0xeac)](
                    rL[vK(0x7b7)](rS) ^
                      rN[(rN[rR] + rN[rO]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return rQ;
            };
            (ii[vI(0xb55)] = rK), (rA = arguments), (ii[vI(0x212)] = !![]);
          }
          const rH = rC[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rI = rD + rH,
            rJ = rA[rI];
          return (
            !rJ
              ? (ii[vI(0xeaa)] === void 0x0 && (ii[vI(0xeaa)] = !![]),
                (rF = ii[vI(0xb55)](rF, rE)),
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
            (parseInt(rC(0x1a1, 0x1b2, 0x1a9, 0x1b7, vL(0xf0e))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rE(-0x105, -0x12e, -0x131, vL(0xf0e), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(rC(0x1b5, 0x1c9, 0x1b1, 0x1cb, vL(0x7e7))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rE(-0x128, -0x132, -0x134, vL(0x297), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rE(-0x131, -0x155, -0x130, vL(0x5d2), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rF(0x9a, 0xb1, 0xb2, vL(0x7e7), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(rC(0x1b5, 0x1d3, 0x1bc, 0x1d1, vL(0x4b4))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rF(0xb2, 0xbe, 0xb9, vL(0xf26), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(rC(0x183, 0x1ae, 0x197, 0x19e, vL(0xb9e))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rH(-0x244, -0x216, -0x232, -0x217, vL(0x271))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rE(-0x126, -0x10f, -0x13a, vL(0xe5c), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rH(-0x203, -0x209, -0x200, -0x1e1, vL(0x4eb))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rI === rB) break;
          else rG[vL(0xf33)](rG[vL(0xd1e)]());
        } catch (rJ) {
          rG[vL(0xf33)](rG[vL(0xd1e)]());
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
            rD(vM(0x297), -0x130, -0x106, -0x11f, -0x11d) +
            rD(vM(0x8e3), -0x11a, -0x142, -0x138, -0x135),
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
        rA[rC(-0x27e, -0x274, -0x265, vM(0x2c9), -0x274)](
          typeof window,
          rA[rE(vM(0xeae), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        rA[rG(-0x17d, -0x171, -0x181, vM(0x5fb), -0x16a)](
          typeof kj,
          rA[rC(-0x25a, -0x263, -0x26c, vM(0x8e3), -0x270)]
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
      const rF = rB[rE(vM(0xf26), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function rG(rM, rN, rO, rP, rQ) {
        return ii(rM - -0x20a, rP);
      }
      const rH = rA[rJ(0x43a, vM(0x92b), 0x40e, 0x428, 0x430)](
        ik,
        rA[rC(-0x28e, -0x27f, -0x272, vM(0x5fb), -0x281)](
          rA[rD(vM(0x5b0), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rF
          ),
          ic[rD(vM(0xba6), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rI = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rH[
        rD(vM(0x8c8), -0x11e, -0x149, -0x131, -0x13c) +
          rG(-0x172, -0x16e, -0x175, vM(0xeae), -0x166)
      ](rI++, cH[rG(-0x18e, -0x16e, -0x17a, vM(0x297), -0x1a6)]),
        rH[
          rJ(0x415, vM(0x72c), 0x44c, 0x433, 0x422) +
            rE(vM(0x965), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rI, cI),
        (rI += -0x3dd + -0x6b5 + 0xa94);
      function rJ(rM, rN, rO, rP, rQ) {
        return ii(rP - 0x3a2, rN);
      }
      const rK = rA[rJ(0x43c, vM(0x692), 0x43b, 0x446, 0x459)](
        rA[rC(-0x283, -0x272, -0x298, vM(0x331), -0x26e)](
          cI,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let rM = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        rA[rE(vM(0xdb3), 0x200, 0x1fc, 0x1fc, 0x1e5)](rM, rF);
        rM++
      ) {
        rH[
          rC(-0x287, -0x273, -0x27d, vM(0xeae), -0x27c) +
            rE(vM(0x1cb), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rI++,
          rA[rE(vM(0xc77), 0x201, 0x215, 0x21c, 0x1fc)](
            rB[
              rD(vM(0xaff), -0x11c, -0x130, -0x128, -0x13b) +
                rC(-0x289, -0x29c, -0x26a, vM(0xba6), -0x290)
            ](
              rA[rD(vM(0x8ad), -0x13a, -0x124, -0x111, -0x120)](
                rA[rD(vM(0x2c9), -0x10d, -0x119, -0x108, -0x128)](rF, rM),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rK
          )
        );
      }
      if (ic) {
        const rN = ic[rE(vM(0x5fb), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rO = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          rA[rE(vM(0x5f2), 0x21f, 0x216, 0x204, 0x200)](rO, rN);
          rO++
        ) {
          rH[
            rE(vM(0x965), 0x207, 0x20e, 0x209, 0x202) +
              rE(vM(0xaff), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rI++,
            rA[rC(-0x25b, -0x256, -0x24f, vM(0xd94), -0x261)](
              ic[
                rC(-0x267, -0x256, -0x25e, vM(0x8b7), -0x271) +
                  rJ(0x412, vM(0xaff), 0x411, 0x421, 0x425)
              ](
                rA[rJ(0x435, vM(0xf0e), 0x427, 0x434, 0x41a)](
                  rA[rD(vM(0x708), -0x143, -0x134, -0x133, -0x137)](rN, rO),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rK
            )
          );
        }
      }
      const rL = rH[
        rJ(0x423, vM(0x297), 0x44b, 0x440, 0x45a) +
          rC(-0x280, -0x27d, -0x26e, vM(0x965), -0x288)
      ](
        rA[rG(-0x162, -0x164, -0x161, vM(0x8e3), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          rA[rJ(0x429, vM(0xbd8), 0x43d, 0x437, 0x44b)](
            rA[rD(vM(0xb9e), -0x10d, -0x127, -0x124, -0x116)](
              cI,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rF
          )
        )
      );
      rA[rJ(0x435, vM(0x9ae), 0x43b, 0x42a, 0x448)](im, rH), (ib = rL);
    }
    function ik(rA) {
      return new DataView(new ArrayBuffer(rA));
    }
    function il() {
      const vN = ux;
      return hV && hV[vN(0xe32)] === WebSocket[vN(0x98f)];
    }
    function im(rA) {
      const vO = ux;
      if (il()) {
        pF += rA[vO(0x1ed)];
        if (hX) {
          const rB = new Uint8Array(rA[vO(0xcd5)]);
          for (let rE = 0x0; rE < rB[vO(0xf30)]; rE++) {
            rB[rE] ^= ib;
          }
          const rC = cI % rB[vO(0xf30)],
            rD = rB[0x0];
          (rB[0x0] = rB[rC]), (rB[rC] = rD);
        }
        hV[vO(0x6b0)](rA);
      }
    }
    function io(rA, rB = 0x1) {
      const vP = ux;
      let rC = eT(rA);
      const rD = new Uint8Array([
        cH[vP(0x315)],
        rC,
        Math[vP(0xcec)](rB * 0xff),
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
          vQ(0x446),
          vQ(0x891),
          vQ(0x8ab),
          vQ(0x5f1),
          vQ(0x5e6),
          vQ(0x1e1),
          vQ(0xaf0),
          vQ(0xcca),
          vQ(0xe3c),
          vQ(0x98e),
          vQ(0x6e4),
          vQ(0xe99),
          vQ(0xcdf),
          vQ(0x93d),
          vQ(0x374),
          vQ(0x1f4),
          vQ(0xdda),
          vQ(0xc9f),
          vQ(0xbba),
          vQ(0xd3c),
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
          else rD[vR(0xf33)](rD[vR(0xd1e)]());
        } catch (rJ) {
          rD[vR(0xf33)](rD[vR(0xd1e)]());
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
        (kl[vS(0xa94)] = vS(0xd1d) + rA + vS(0x2ce) + rB + vS(0x355)),
        kl[vS(0x8c5)](hZ),
        (hZ[vS(0x5f5)][vS(0x4f9)] = ""),
        (i4[vS(0x5f5)][vS(0x4f9)] = vS(0xdf2)),
        (i1[vS(0x5f5)][vS(0x4f9)] = vS(0xdf2)),
        (hZ[vS(0x9e3)](vS(0x86b))[vS(0x5f5)][vS(0xa5c)] = "0"),
        document[vS(0x458)][vS(0x52a)][vS(0xcd1)](vS(0x552)),
        (kl[vS(0x5f5)][vS(0x4f9)] = ""),
        (km[vS(0x5f5)][vS(0x4f9)] =
          ko[vS(0x5f5)][vS(0x4f9)] =
          kn[vS(0x5f5)][vS(0x4f9)] =
          kD[vS(0x5f5)][vS(0x4f9)] =
            vS(0xdf2));
      const rD = document[vS(0x9e3)](vS(0x849));
      document[vS(0x9e3)](vS(0xec0))[vS(0xc0d)] = function () {
        rG();
      };
      let rE = rC;
      k9(rD, vS(0x90b) + rE + vS(0xca4));
      const rF = setInterval(() => {
        const vT = vS;
        rE--, rE <= 0x0 ? rG() : k9(rD, vT(0x90b) + rE + vT(0xca4));
      }, 0x3e8);
      function rG() {
        const vU = vS;
        clearInterval(rF), k9(rD, vU(0x642)), location[vU(0xbfe)]();
      }
    }
    function iv() {
      const vV = ux;
      if (hV) {
        hV[vV(0x23d)] = hV[vV(0xd27)] = hV[vV(0xb44)] = null;
        try {
          hV[vV(0xd36)]();
        } catch (rA) {}
        hV = null;
      }
    }
    var iw = {},
      ix = [],
      iy,
      iz,
      iA = [],
      iB = ux(0x643);
    function iC() {
      const vW = ux;
      iB = getComputedStyle(document[vW(0x458)])[vW(0xd43)];
    }
    var iD = document[ux(0x9e3)](ux(0x1e9)),
      iE = document[ux(0x9e3)](ux(0x2fc)),
      iF = document[ux(0x9e3)](ux(0x76a)),
      iG = [],
      iH = [],
      iI = ![],
      iJ = 0x0;
    function iK(rA) {
      const vX = ux;
      if(hack.isEnabled('numberNoSuffix')) return Math.round(rA);
      if (rA < 0.01) return "0";
      rA = Math[vX(0xcec)](rA);
      if (rA >= 0x3b9aca00)
        return parseFloat((rA / 0x3b9aca00)[vX(0x278)](0x2)) + "b";
      else {
        if (rA >= 0xf4240)
          return parseFloat((rA / 0xf4240)[vX(0x278)](0x2)) + "m";
        else {
          if (rA >= 0x3e8)
            return parseFloat((rA / 0x3e8)[vX(0x278)](0x1)) + "k";
        }
      }
      return rA;
    }
    function iL(rA, rB) {
      const vY = ux,
        rC = document[vY(0x636)](vY(0xa2b));
      rC[vY(0x6bc)] = vY(0xb7d);
      const rD = document[vY(0x636)](vY(0xa2b));
      (rD[vY(0x6bc)] = vY(0xda4)), rC[vY(0x8c5)](rD);
      const rE = document[vY(0x636)](vY(0x5e5));
      rC[vY(0x8c5)](rE), iD[vY(0x8c5)](rC);
      const rF = {};
      (rF[vY(0x80e)] = rA),
        (rF[vY(0xc6d)] = rB),
        (rF[vY(0x9eb)] = 0x0),
        (rF[vY(0xa73)] = 0x0),
        (rF[vY(0xaaf)] = 0x0),
        (rF["el"] = rC),
        (rF[vY(0x491)] = rD),
        (rF[vY(0x3e7)] = rE);
      const rG = rF;
      (rG[vY(0x6d0)] = iH[vY(0xf30)]),
        (rG[vY(0xb75)] = function () {
          const vZ = vY;
          (this[vZ(0x9eb)] = px(this[vZ(0x9eb)], this[vZ(0xc6d)], 0x64)),
            (this[vZ(0xaaf)] = px(this[vZ(0xaaf)], this[vZ(0xa73)], 0x64)),
            this[vZ(0x3e7)][vZ(0x467)](
              vZ(0x976),
              (this[vZ(0x80e)] ? this[vZ(0x80e)] + vZ(0x275) : "") +
                iK(this[vZ(0x9eb)])
            ),
            (this[vZ(0x491)][vZ(0x5f5)][vZ(0xf3d)] = this[vZ(0xaaf)] + "%");
        }),
        rG[vY(0xb75)](),
        iH[vY(0xf33)](rG);
    }
    function iM(rA) {
      const w0 = ux;
      if (iH[w0(0xf30)] === 0x0) return;
      const rB = iH[0x0];
      rB[w0(0xa73)] = rB[w0(0xaaf)] = 0x64;
      for (let rC = 0x1; rC < iH[w0(0xf30)]; rC++) {
        const rD = iH[rC];
        (rD[w0(0xa73)] =
          Math[w0(0xeeb)](
            0x1,
            rB[w0(0xc6d)] === 0x0 ? 0x1 : rD[w0(0xc6d)] / rB[w0(0xc6d)]
          ) * 0x64),
          rA && (rD[w0(0xaaf)] = rD[w0(0xa73)]),
          iD[w0(0x8c5)](rD["el"]);
      }
    }
    function iN(rA) {
      const w1 = ux,
        rB = new Path2D();
      rB[w1(0xba7)](...rA[w1(0xa91)][0x0]);
      for (let rC = 0x0; rC < rA[w1(0xa91)][w1(0xf30)] - 0x1; rC++) {
        const rD = rA[w1(0xa91)][rC],
          rE = rA[w1(0xa91)][rC + 0x1];
        let rF = 0x0;
        const rG = rE[0x0] - rD[0x0],
          rH = rE[0x1] - rD[0x1],
          rI = Math[w1(0x4a4)](rG, rH);
        while (rF < rI) {
          rB[w1(0xce8)](
            rD[0x0] + (rF / rI) * rG + (Math[w1(0x4a5)]() * 0x2 - 0x1) * 0x32,
            rD[0x1] + (rF / rI) * rH + (Math[w1(0x4a5)]() * 0x2 - 0x1) * 0x32
          ),
            (rF += Math[w1(0x4a5)]() * 0x28 + 0x1e);
        }
        rB[w1(0xce8)](...rE);
      }
      rA[w1(0x9cf)] = rB;
    }
    var iO = 0x0,
      iP = 0x0,
      iQ = [],
      iR = {},
      iS = [],
      iT = {};
    function iU(rA, rB) {
      const w2 = ux;
      if (!pc[w2(0x4be)]) return;
      let baseHP = hack.getHP(rA);
      let decDmg = rA['nHealth'] - rB;
      let dmg = Math.round(decDmg * 10000) / 100 + '%';
      if(baseHP && hack.isEnabled('DDenableNumber')) dmg = Math.round(decDmg * baseHP);
      if(isNaN(dmg)) dmg = '';
      let rC;
      const rD = rB === void 0x0;
      !rD && (rC = Math[w2(0x443)]((rA[w2(0x391)] - rB) * 0x64) || 0x1),
        iA[w2(0xf33)]({
            text: hack.isEnabled('damageDisplay') ? dmg : rC,
          x: rA["x"] + (Math[w2(0x4a5)]() * 0x2 - 0x1) * rA[w2(0x445)] * 0.6,
          y: rA["y"] + (Math[w2(0x4a5)]() * 0x2 - 0x1) * rA[w2(0x445)] * 0.6,
          vx: (Math[w2(0x4a5)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[w2(0x4a5)]() * 0x3,
          angle: (Math[w2(0x4a5)]() * 0x2 - 0x1) * (rD ? 0x1 : 0.1),
          size: Math[w2(0xe6f)](0x1, (rA[w2(0x445)] * 0.2) / 0x14),
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
        rB[w3(0x2a0)] = !![];
        if (
          Math[w3(0x54a)](rB["nx"] - iV) > iX + rB[w3(0x829)] ||
          Math[w3(0x54a)](rB["ny"] - iW) > iY + rB[w3(0x829)]
        )
          rB[w3(0xda0)] = 0xa;
        else !rB[w3(0x7d1)] && iU(rB, 0x0);
        delete iw[rA];
      }
    }
    var j0 = [
      ux(0xc62),
      ux(0x1db),
      ux(0x9c9),
      ux(0x70f),
      ux(0xf10),
      ux(0xab0),
      ux(0x653),
      ux(0xa99),
      ux(0x3f8),
      ux(0x813),
      ux(0x6f4),
      ux(0xe2b),
      ux(0x7ee),
    ];
    function j1(rA, rB = iz) {
      const w4 = ux;
      (rA[w4(0xc62)] = rB[w4(0xc62)]),
        (rA[w4(0x1db)] = rB[w4(0x1db)]),
        (rA[w4(0x9c9)] = rB[w4(0x9c9)]),
        (rA[w4(0x70f)] = rB[w4(0x70f)]),
        (rA[w4(0xf10)] = rB[w4(0xf10)]),
        (rA[w4(0xab0)] = rB[w4(0xab0)]),
        (rA[w4(0x653)] = rB[w4(0x653)]),
        (rA[w4(0xa99)] = rB[w4(0xa99)]),
        (rA[w4(0x3f8)] = rB[w4(0x3f8)]),
        (rA[w4(0x813)] = rB[w4(0x813)]),
        (rA[w4(0x61a)] = rB[w4(0x61a)]),
        (rA[w4(0x6f4)] = rB[w4(0x6f4)]),
        (rA[w4(0xc18)] = rB[w4(0xc18)]),
        (rA[w4(0xe2b)] = rB[w4(0xe2b)]),
        (rA[w4(0x7ee)] = rB[w4(0x7ee)]);
    }
    function j2() {
      (p0 = null), p8(null), (p4 = null), (p2 = ![]), (p3 = 0x0), om && pN();
    }
    var j3 = 0x64,
      j4 = 0x1,
      j5 = 0x64,
      j6 = 0x1,
      j7 = {},
      j8 = [...Object[ux(0x24e)](d8)],
      j9 = [...hP];
    jb(j8),
      jb(j9),
      j8[ux(0xf33)](ux(0x5f9)),
      j9[ux(0xf33)](hO[ux(0xd06)] || ux(0x461)),
      j8[ux(0xf33)](ux(0x9a4)),
      j9[ux(0xf33)](ux(0x291));
    var ja = [];
    for (let rA = 0x0; rA < j8[ux(0xf30)]; rA++) {
      const rB = d8[j8[rA]] || 0x0;
      ja[rA] = 0x78 + (rB - d8[ux(0xefb)]) * 0x3c - 0x1 + 0x1;
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
          w5(0xb83) + j8[rC] + w5(0xd7f) + rD + w5(0x24a) + rD + w5(0x4bd)
        ),
        rF = rE[w5(0x9e3)](w5(0xbee));
      (j7 = {
        id: rC,
        el: rE,
        state: cS[w5(0xdf2)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rE[w5(0x9e3)](w5(0xf0b)),
        progressEl: rF,
        barEl: rF[w5(0x9e3)](w5(0xa19)),
        textEl: rF[w5(0x9e3)](w5(0x5e5)),
        nameEl: rE[w5(0x9e3)](w5(0x7a4)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const w6 = w5,
            rG = Math[w6(0xeeb)](0x1, (pQ - this[w6(0x778)]) / 0x64);
          this[w6(0x47c)] =
            this[w6(0x398)] + (this[w6(0xbcd)] - this[w6(0x398)]) * rG;
          const rH = this[w6(0x47c)] - 0x1;
          this[w6(0x491)][w6(0x5f5)][w6(0x2a7)] =
            w6(0xe0d) + rH * 0x64 + w6(0x4f0) + rH + w6(0xef0);
        },
        update() {
          const w7 = w5,
            rG = jf(this["t"]),
            rH = 0x1 - rG;
          (this["el"][w7(0x5f5)][w7(0xa5c)] = -0xc8 * rH + "px"),
            (this["el"][w7(0x5f5)][w7(0x2a7)] = w7(0xbaf) + -0x64 * rH + "%)");
        },
        remove() {
          const w8 = w5;
          rE[w8(0xcd1)]();
        },
      }),
        (j7[w5(0x2bb)][w5(0x5f5)][w5(0x4f9)] = w5(0xdf2)),
        jd[w5(0xf33)](j7),
        j7[w5(0xb75)](),
        jc[w5(0xf33)](j7),
        kn[w5(0xd73)](rE, q3);
    }
    function jf(rC) {
      return 0x1 - (0x1 - rC) * (0x1 - rC);
    }
    function jg(rC) {
      const w9 = ux;
      return rC < 0.5
        ? (0x1 - Math[w9(0x9be)](0x1 - Math[w9(0x8df)](0x2 * rC, 0x2))) / 0x2
        : (Math[w9(0x9be)](0x1 - Math[w9(0x8df)](-0x2 * rC + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jh() {
      const wa = ux;
      (oB[wa(0xa94)] = ""), (oD = {});
    }
    var ji = document[ux(0x9e3)](ux(0x89e));
    ji[ux(0x5f5)][ux(0x4f9)] = ux(0xdf2);
    var jj = document[ux(0x9e3)](ux(0x298)),
      jk = [],
      jl = document[ux(0x9e3)](ux(0xdd0));
    jl[ux(0x1d9)] = function () {
      jm();
    };
    function jm() {
      const wb = ux;
      for (let rC = 0x0; rC < jk[wb(0xf30)]; rC++) {
        const rD = jk[rC];
        k9(rD[wb(0xd83)][0x0], jl[wb(0xa82)] ? wb(0xab3) : rD[wb(0x9fb)]);
      }
    }
    function jn(rC) {
      const wc = ux;
      (ji[wc(0x5f5)][wc(0x4f9)] = ""), (jj[wc(0xa94)] = wc(0x3cd));
      const rD = rC[wc(0xf30)];
      jk = [];
      for (let rE = 0x0; rE < rD; rE++) {
        const rF = rC[rE];
        jj[wc(0x8c5)](nR(wc(0x9a6) + (rE + 0x1) + wc(0x1f9))), jo(rF);
      }
      m3[wc(0x7f8)][wc(0x4ac)]();
    }
    function jo(rC) {
      const wd = ux;
      for (let rD = 0x0; rD < rC[wd(0xf30)]; rD++) {
        const rE = rC[rD],
          rF = nR(wd(0xd1c) + rE + wd(0x71f));
        (rF[wd(0x9fb)] = rE),
          rD > 0x0 && jk[wd(0xf33)](rF),
          (rF[wd(0xc0d)] = function () {
            jq(rE);
          }),
          jj[wd(0x8c5)](rF);
      }
      jm();
    }
    function jp(rC) {
      const we = ux;
      var rD = document[we(0x636)](we(0xa54));
      (rD[we(0x459)] = rC),
        (rD[we(0x5f5)][we(0x420)] = "0"),
        (rD[we(0x5f5)][we(0xb00)] = "0"),
        (rD[we(0x5f5)][we(0xd63)] = we(0xdfc)),
        document[we(0x458)][we(0x8c5)](rD),
        rD[we(0xb2e)](),
        rD[we(0x837)]();
      try {
        var rE = document[we(0xdf0)](we(0xe17)),
          rF = rE ? we(0xb1b) : we(0x423);
      } catch (rG) {}
      document[we(0x458)][we(0xece)](rD);
    }
    function jq(rC) {
      const wf = ux;
      if (!navigator[wf(0xe3a)]) {
        jp(rC);
        return;
      }
      navigator[wf(0xe3a)][wf(0xcde)](rC)[wf(0x884)](
        function () {},
        function (rD) {}
      );
    }
    var jr = [
        ux(0x754),
        ux(0x49c),
        ux(0xd4f),
        ux(0x689),
        ux(0xb4a),
        ux(0xaf7),
        ux(0xeb1),
        ux(0x957),
        ux(0xdb2),
        ux(0x43c),
        ux(0x7da),
      ],
      js = [ux(0xdc0), ux(0x3ab), ux(0x23c)];
    function jt(rC) {
      const wg = ux,
        rD = rC ? js : jr;
      return rD[Math[wg(0xe3c)](Math[wg(0x4a5)]() * rD[wg(0xf30)])];
    }
    function ju(rC) {
      const wh = ux;
      return rC[wh(0x9d2)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var jv = document[ux(0x9e3)](ux(0xe01));
    jv[ux(0xc0d)] = nw(function (rC) {
      const wi = ux;
      iz && im(new Uint8Array([cH[wi(0xe06)]]));
    });
    var jw = "";
    function jx(rC) {
      const wj = ux;
      return rC[wj(0x51a)](/"/g, wj(0xbc9));
    }
    function jy(rC) {
      const wk = ux;
      let rD = "";
      for (let rE = 0x0; rE < rC[wk(0xf30)]; rE++) {
        const [rF, rG, rH] = rC[rE];
        rD +=
          wk(0xcb7) +
          rF +
          "\x22\x20" +
          (rH ? wk(0xa77) : "") +
          wk(0xea9) +
          jx(rG) +
          wk(0x3ed);
      }
      return wk(0xbbc) + rD + wk(0x99a);
    }
    var jz = ![];
    function jA() {
      const wl = ux;
      return nR(wl(0x21e) + hO[wl(0xefb)] + wl(0x5cb));
    }
    var jB = document[ux(0x9e3)](ux(0x56e));
    function jC() {
      const wm = ux;
      (oT[wm(0x5f5)][wm(0x4f9)] = q3[wm(0x5f5)][wm(0x4f9)] =
        jz ? wm(0xdf2) : ""),
        (jB[wm(0x5f5)][wm(0x4f9)] = kz[wm(0x5f5)][wm(0x4f9)] =
          jz ? "" : wm(0xdf2));
      jz
        ? (kA[wm(0x52a)][wm(0x536)](wm(0x724)),
          k9(kA[wm(0xd83)][0x0], wm(0x87a)))
        : (kA[wm(0x52a)][wm(0xcd1)](wm(0x724)),
          k9(kA[wm(0xd83)][0x0], wm(0xac2)));
      const rC = [hF, mn];
      for (let rD = 0x0; rD < rC[wm(0xf30)]; rD++) {
        const rE = rC[rD];
        rE[wm(0x52a)][jz ? wm(0x536) : wm(0xcd1)](wm(0xd5c)),
          (rE[wm(0x559)] = jz ? jA : null),
          (rE[wm(0xe49)] = !![]);
      }
      jD[wm(0x5f5)][wm(0x4f9)] = o0[wm(0x5f5)][wm(0x4f9)] = jz ? wm(0xdf2) : "";
    }
    var jD = document[ux(0x9e3)](ux(0x819)),
      jE = document[ux(0x9e3)](ux(0x720)),
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
      for (let rF = jM[wn(0xf30)] - 0x1; rF >= 0x0; rF--) {
        const rG = jM[rF];
        if (ny(rC, rG) > 0.7) {
          rE++;
          if (rE >= 0x5) return ![];
        }
      }
      return jM[wn(0xf33)](rC), !![];
    }
    var jP = document[ux(0x9e3)](ux(0x24b)),
      jQ = document[ux(0x9e3)](ux(0xc6a)),
      jR = document[ux(0x9e3)](ux(0x8bc)),
      jS = document[ux(0x9e3)](ux(0x2b3)),
      jT;
    k9(jR, "-"),
      (jR[ux(0xc0d)] = function () {
        if (jT) mA(jT);
      });
    var jU = 0x0,
      jV = document[ux(0x9e3)](ux(0x9e1));
    setInterval(() => {
      const wo = ux;
      jU--;
      if (jU < 0x0) {
        jV[wo(0x52a)][wo(0xa05)](wo(0x4ac)) &&
          hX &&
          im(new Uint8Array([cH[wo(0x67a)]]));
        return;
      }
      jW();
    }, 0x3e8);
    function jW() {
      k9(jS, kb(jU * 0x3e8));
    }
    function jX() {
      const wp = ux,
        rC = document[wp(0x9e3)](wp(0x9dd))[wp(0xd83)],
        rD = document[wp(0x9e3)](wp(0x5da))[wp(0xd83)];
      for (let rE = 0x0; rE < rC[wp(0xf30)]; rE++) {
        const rF = rC[rE],
          rG = rD[rE];
        rF[wp(0xc0d)] = function () {
          const wq = wp;
          for (let rH = 0x0; rH < rD[wq(0xf30)]; rH++) {
            const rI = rE === rH;
            (rD[rH][wq(0x5f5)][wq(0x4f9)] = rI ? "" : wq(0xdf2)),
              rC[rH][wq(0x52a)][rI ? wq(0x536) : wq(0xcd1)](wq(0xae4));
          }
        };
      }
      rC[0x0][wp(0xc0d)]();
    }
    jX();
    var jY = [];
    function jZ(rC) {
      const wr = ux;
      rC[wr(0x52a)][wr(0x536)](wr(0x7e6)), jY[wr(0xf33)](rC);
    }
    var k0,
      k1 = document[ux(0x9e3)](ux(0xd39));
    function k2(rC, rD = !![]) {
      const ws = ux;
      if (rD) {
        if (pQ < jH) {
          jI[ws(0xf33)](rC);
          return;
        } else {
          if (jI[ws(0xf30)] > 0x0)
            while (jI[ws(0xf30)] > 0x0) {
              k2(jI[ws(0xd1e)](), ![]);
            }
        }
      }
      function rE() {
        const wt = ws,
          rQ = rN[wt(0x4d8)](rO++),
          rR = new Uint8Array(rQ);
        for (let rS = 0x0; rS < rQ; rS++) {
          rR[rS] = rN[wt(0x4d8)](rO++);
        }
        return new TextDecoder()[wt(0x3ff)](rR);
      }
      function rF() {
        const wu = ws;
        return rN[wu(0x4d8)](rO++) / 0xff;
      }
      function rG(rQ) {
        const wv = ws,
          rR = rN[wv(0xecf)](rO);
        (rO += 0x2),
          (rQ[wv(0x999)] = rR & 0x1),
          (rQ[wv(0xc62)] = rR & 0x2),
          (rQ[wv(0x1db)] = rR & 0x4),
          (rQ[wv(0x9c9)] = rR & 0x8),
          (rQ[wv(0x70f)] = rR & 0x10),
          (rQ[wv(0xf10)] = rR & 0x20),
          (rQ[wv(0xab0)] = rR & 0x40),
          (rQ[wv(0x653)] = rR & 0x80),
          (rQ[wv(0xa99)] = rR & 0x100),
          (rQ[wv(0x3f8)] = rR & (0x1 << 0x9)),
          (rQ[wv(0x813)] = rR & (0x1 << 0xa)),
          (rQ[wv(0x61a)] = rR & (0x1 << 0xb)),
          (rQ[wv(0x6f4)] = rR & (0x1 << 0xc)),
          (rQ[wv(0xc18)] = rR & (0x1 << 0xd)),
          (rQ[wv(0xe2b)] = rR & (0x1 << 0xe)),
          (rQ[wv(0x7ee)] = rR & (0x1 << 0xf));
      }
      function rH() {
        const ww = ws,
          rQ = rN[ww(0xab9)](rO);
        rO += 0x4;
        const rR = rE();
        iL(rR, rQ);
      }
      function rI() {
        const wx = ws,
          rQ = rN[wx(0xecf)](rO) - cF;
        return (rO += 0x2), rQ;
      }
      function rJ() {
        const wy = ws,
          rQ = {};
        for (let s1 in mr) {
          (rQ[s1] = rN[wy(0xab9)](rO)), (rO += 0x4);
        }
        const rR = rE(),
          rS = Number(rN[wy(0x98b)](rO));
        rO += 0x8;
        const rT = d4(d3(rS)[0x0]),
          rU = rT * 0x2,
          rV = Array(rU);
        for (let s2 = 0x0; s2 < rU; s2++) {
          const s3 = rN[wy(0xecf)](rO) - 0x1;
          rO += 0x2;
          if (s3 < 0x0) continue;
          rV[s2] = dB[s3];
        }
        const rW = [],
          rX = rN[wy(0xecf)](rO);
        rO += 0x2;
        for (let s4 = 0x0; s4 < rX; s4++) {
          const s5 = rN[wy(0xecf)](rO);
          rO += 0x2;
          const s6 = rN[wy(0xab9)](rO);
          (rO += 0x4), rW[wy(0xf33)]([dB[s5], s6]);
        }
        const rY = [],
          rZ = rN[wy(0xecf)](rO);
        rO += 0x2;
        for (let s7 = 0x0; s7 < rZ; s7++) {
          const s8 = rN[wy(0xecf)](rO);
          (rO += 0x2), !eJ[s8] && console[wy(0xebe)](s8), rY[wy(0xf33)](eJ[s8]);
        }
        const s0 = rN[wy(0x4d8)](rO++);
        mw(rR, rQ, rW, rY, rS, rV, s0);
      }
      function rK() {
        const wz = ws,
          rQ = Number(rN[wz(0x98b)](rO));
        return (rO += 0x8), rQ;
      }
      function rL() {
        const wA = ws,
          rQ = rN[wA(0xab9)](rO);
        rO += 0x4;
        const rR = rN[wA(0x4d8)](rO++),
          rS = {};
        (rS[wA(0x9fd)] = rQ), (rS[wA(0x2d9)] = {});
        const rT = rS;
        f2[wA(0x45f)]((rV, rW) => {
          const wB = wA;
          rT[wB(0x2d9)][rV] = [];
          for (let rX = 0x0; rX < rR; rX++) {
            const rY = rE();
            let rZ;
            rV === "xp" ? (rZ = rK()) : ((rZ = rN[wB(0xab9)](rO)), (rO += 0x4)),
              rT[wB(0x2d9)][rV][wB(0xf33)]([rY, rZ]);
          }
        }),
          k9(jE, ka(rT[wA(0x9fd)]) + wA(0xb12)),
          (mD[wA(0xa94)] = "");
        let rU = 0x0;
        for (let rV in rT[wA(0x2d9)]) {
          const rW = ke(rV),
            rX = rT[wA(0x2d9)][rV],
            rY = nR(wA(0xa86) + rU + wA(0x1e3) + rW + wA(0x49a)),
            rZ = rY[wA(0x9e3)](wA(0xcea));
          for (let s0 = 0x0; s0 < rX[wA(0xf30)]; s0++) {
            const [s1, s2] = rX[s0];
            let s3 = mq(rV, s2);
            rV === "xp" && (s3 += wA(0xb88) + (d3(s2)[0x0] + 0x1) + ")");
            const s4 = nR(
              wA(0xf21) + (s0 + 0x1) + ".\x20" + s1 + wA(0xb48) + s3 + wA(0xf1c)
            );
            (s4[wA(0xc0d)] = function () {
              mA(s1);
            }),
              rZ[wA(0xbfc)](s4);
          }
          mD[wA(0xbfc)](rY), rU++;
        }
      }
      function rM() {
        const wC = ws;
        (jT = rE()), k9(jR, jT || "-");
        const rQ = Number(rN[wC(0x98b)](rO));
        (rO += 0x8),
          (jU = Math[wC(0xcec)]((rQ - Date[wC(0x296)]()) / 0x3e8)),
          jW();
        const rR = rN[wC(0xecf)](rO);
        rO += 0x2;
        if (rR === 0x0) jQ[wC(0xa94)] = wC(0xa4c);
        else {
          jQ[wC(0xa94)] = "";
          for (let rT = 0x0; rT < rR; rT++) {
            const rU = rE(),
              rV = rN[wC(0xa0d)](rO);
            rO += 0x4;
            const rW = rV * 0x64,
              rX = rW >= 0x1 ? rW[wC(0x278)](0x2) : rW[wC(0x278)](0x5),
              rY = nR(
                wC(0xd41) +
                  (rT + 0x1) +
                  ".\x20" +
                  rU +
                  wC(0x32d) +
                  rX +
                  wC(0x95e)
              );
            rU === jw && rY[wC(0x52a)][wC(0x536)]("me"),
              (rY[wC(0xc0d)] = function () {
                mA(rU);
              }),
              jQ[wC(0x8c5)](rY);
          }
        }
        k1[wC(0xa94)] = "";
        const rS = rN[wC(0xecf)](rO);
        (rO += 0x2), (k0 = {});
        if (rS === 0x0)
          (jP[wC(0xa94)] = wC(0x782)), (k1[wC(0x5f5)][wC(0x4f9)] = wC(0xdf2));
        else {
          const rZ = {};
          jP[wC(0xa94)] = "";
          for (let s0 = 0x0; s0 < rS; s0++) {
            const s1 = rN[wC(0xecf)](rO);
            rO += 0x2;
            const s2 = rN[wC(0xab9)](rO);
            (rO += 0x4), (k0[s1] = s2);
            const s3 = dB[s1],
              s4 = nR(
                wC(0x840) +
                  s3[wC(0x257)] +
                  wC(0xa13) +
                  qB(s3) +
                  wC(0x9d5) +
                  s2 +
                  wC(0x31d)
              );
            (s4[wC(0x508)] = jV),
              jZ(s4),
              (s4[wC(0x559)] = s3),
              jP[wC(0x8c5)](s4),
              (rZ[s3[wC(0x257)]] = (rZ[s3[wC(0x257)]] || 0x0) + s2);
          }
          oe(jP), (k1[wC(0x5f5)][wC(0x4f9)] = ""), oF(k1, rZ);
        }
      }
      const rN = new DataView(rC[ws(0x949)]);
      pF += rN[ws(0x1ed)];
      let rO = 0x0;
      const rP = rN[ws(0x4d8)](rO++);
      switch (rP) {
        case cH[ws(0x4ad)]:
          {
            const sb = rN[ws(0xecf)](rO);
            rO += 0x2;
            for (let sc = 0x0; sc < sb; sc++) {
              const sd = rN[ws(0xecf)](rO);
              rO += 0x2;
              const se = rN[ws(0xab9)](rO);
              (rO += 0x4), n6(sd, se);
            }
          }
          break;
        case cH[ws(0xdf3)]:
          rM();
          break;
        case cH[ws(0x2e0)]:
          kD[ws(0x52a)][ws(0x536)](ws(0x4ac)), hU(), (jH = pQ + 0x1f4);
          break;
        case cH[ws(0xb62)]:
          (ml[ws(0xa94)] = ws(0x2dd)), ml[ws(0x8c5)](mo), (mp = ![]);
          break;
        case cH[ws(0x471)]: {
          const sf = dB[rN[ws(0xecf)](rO)];
          rO += 0x2;
          const sg = rN[ws(0xab9)](rO);
          (rO += 0x4),
            (ml[ws(0xa94)] =
              ws(0x7bc) +
              sf[ws(0x257)] +
              "\x22\x20" +
              qB(sf) +
              ws(0x9d5) +
              ka(sg) +
              ws(0x5e7));
          const sh = ml[ws(0x9e3)](ws(0xb58));
          (sh[ws(0x559)] = sf),
            (sh[ws(0xc0d)] = function () {
              const wD = ws;
              n6(sf["id"], sg), (this[wD(0xc0d)] = null), mo[wD(0xc0d)]();
            }),
            (mp = ![]);
          break;
        }
        case cH[ws(0x2f8)]: {
          const si = rN[ws(0x4d8)](rO++),
            sj = rN[ws(0xab9)](rO);
          rO += 0x4;
          const sk = rE();
          (ml[ws(0xa94)] =
            ws(0xf2c) +
            sk +
            ws(0xd7f) +
            hO[ws(0x424)] +
            ws(0x683) +
            ka(sj) +
            "\x20" +
            hM[si] +
            ws(0xd7f) +
            hP[si] +
            ws(0x967)),
            (ml[ws(0x9e3)](ws(0xb24))[ws(0xc0d)] = function () {
              mA(sk);
            }),
            ml[ws(0x8c5)](mo),
            (mp = ![]);
          break;
        }
        case cH[ws(0xcae)]:
          (ml[ws(0xa94)] = ws(0xaad)), ml[ws(0x8c5)](mo), (mp = ![]);
          break;
        case cH[ws(0x4ca)]:
          hJ(ws(0xad6));
          break;
        case cH[ws(0x409)]:
          rL();
          break;
        case cH[ws(0xd95)]:
          hJ(ws(0x866)), hb(ws(0x866));
          break;
        case cH[ws(0x9db)]:
          hJ(ws(0x2d5)), hb(ws(0x6d7));
          break;
        case cH[ws(0x8c7)]:
          hJ(ws(0xc51));
          break;
        case cH[ws(0x530)]:
          rJ();
          break;
        case cH[ws(0x1ef)]:
          hb(ws(0x80c));
          break;
        case cH[ws(0xb5a)]:
          hb(ws(0xa45), hO[ws(0xd06)]), hI(hG);
          break;
        case cH[ws(0x7f8)]:
          const rQ = rN[ws(0xecf)](rO);
          rO += 0x2;
          const rR = [];
          for (let sl = 0x0; sl < rQ; sl++) {
            const sm = rN[ws(0xab9)](rO);
            rO += 0x4;
            const sn = rE(),
              so = rE(),
              sp = rE();
            rR[ws(0xf33)]([sn || ws(0x6b7) + sm, so, sp]);
          }
          jn(rR);
          break;
        case cH[ws(0xd49)]:
          for (let sq in mr) {
            const sr = rN[ws(0xab9)](rO);
            (rO += 0x4), ms[sq][ws(0x5b5)](sr);
          }
          break;
        case cH[ws(0xb74)]:
          const rS = rN[ws(0x4d8)](rO++),
            rT = rN[ws(0xab9)](rO++),
            rU = {};
          (rU[ws(0x79d)] = rS), (rU[ws(0x22e)] = rT), (p4 = rU);
          break;
        case cH[ws(0x7c9)]:
          (i1[ws(0x5f5)][ws(0x4f9)] = i7 ? "" : ws(0xdf2)),
            (i4[ws(0x5f5)][ws(0x4f9)] = !i7 ? "" : ws(0xdf2)),
            (hZ[ws(0x5f5)][ws(0x4f9)] = ""),
            (ko[ws(0x5f5)][ws(0x4f9)] = ws(0xdf2)),
            (hX = !![]),
            kC[ws(0x52a)][ws(0x536)](ws(0x4ac)),
            kB[ws(0x52a)][ws(0xcd1)](ws(0x4ac)),
            j2(),
            m2(![]),
            (iy = rN[ws(0xab9)](rO)),
            (rO += 0x4),
            (jw = rE()),
            hI(jw),
            (jz = rN[ws(0x4d8)](rO++)),
            jC(),
            (j3 = rN[ws(0xecf)](rO)),
            (rO += 0x2),
            (j6 = rN[ws(0x4d8)](rO++)),
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
            const st = rN[ws(0xecf)](rO) - 0x1;
            rO += 0x2;
            if (st < 0x0) continue;
            iQ[ss] = dB[st];
          }
          nM(), nU();
          const rV = rN[ws(0xecf)](rO);
          rO += 0x2;
          for (let su = 0x0; su < rV; su++) {
            const sv = rN[ws(0xecf)](rO);
            rO += 0x2;
            const sw = nW(eJ[sv]);
            sw[ws(0x508)] = m4;
          }
          iT = {};
          while (rO < rN[ws(0x1ed)]) {
            const sx = rN[ws(0xecf)](rO);
            rO += 0x2;
            const sy = rN[ws(0xab9)](rO);
            (rO += 0x4), (iT[sx] = sy);
          }
          oc(), n7();
          break;
        case cH[ws(0xdc2)]:
          const rW = rN[ws(0x4d8)](rO++),
            rX = hK[rW] || ws(0x58b);
          console[ws(0xebe)](ws(0x5dd) + rX + ")"),
            (kg = rW === cQ[ws(0x228)] || rW === cQ[ws(0x83b)]);
          !kg &&
            iu(ws(0x514), ws(0x9e6) + rX, rW === cQ[ws(0x43b)] ? 0xa : 0x3c);
          break;
        case cH[ws(0x387)]:
          (hf[ws(0x5f5)][ws(0x4f9)] = ko[ws(0x5f5)][ws(0x4f9)] = ws(0xdf2)),
            kH(!![]),
            jv[ws(0x52a)][ws(0x536)](ws(0x4ac)),
            jh(),
            (pj[ws(0x5f5)][ws(0x4f9)] = "");
          for (let sz in iR) {
            iR[sz][ws(0x9de)] = 0x0;
          }
          (jJ = pQ),
            (no = {}),
            (ng = 0x1),
            (nh = 0x1),
            (ne = 0x0),
            (nf = 0x0),
            mH(),
            (nb = cX[ws(0xd25)]),
            (jF = pQ);
          break;
        case cH[ws(0xb75)]:
          (pE = pQ - jF), (jF = pQ), qa[ws(0x5b5)](rF()), qc[ws(0x5b5)](rF());
          if (jz) {
            const sA = rN[ws(0x4d8)](rO++);
            (jK = sA & 0x80), (jL = f5[sA & 0x7f]);
          } else (jK = ![]), (jL = null), qd[ws(0x5b5)](rF());
          (pL = 0x1 + cV[rN[ws(0x4d8)](rO++)] / 0x64),
            (iX = (cZ / 0x2) * pL),
            (iY = (d0 / 0x2) * pL);
          const rY = rN[ws(0xecf)](rO);
          rO += 0x2;
          for (let sB = 0x0; sB < rY; sB++) {
            const sC = rN[ws(0xab9)](rO);
            rO += 0x4;
            let sD = iw[sC];
            if (sD) {
              if (sD[ws(0xa5d)]) {
                sD[ws(0x356)] = rN[ws(0x4d8)](rO++) - 0x1;
                continue;
              }
              const sE = rN[ws(0x4d8)](rO++);
              sE & 0x1 &&
                ((sD["nx"] = rI()), (sD["ny"] = rI()), (sD[ws(0x4da)] = 0x0));
              sE & 0x2 &&
                ((sD[ws(0xd79)] = eR(rN[ws(0x4d8)](rO++))),
                (sD[ws(0x4da)] = 0x0));
              if (sE & 0x4) {
                const sF = rF();
                if (sF < sD[ws(0x391)]) iU(sD, sF), (sD[ws(0x958)] = 0x1);
                else sF > sD[ws(0x391)] && (sD[ws(0x958)] = 0x0);
                (sD[ws(0x391)] = sF), (sD[ws(0x4da)] = 0x0);
              }
              sE & 0x8 &&
                ((sD[ws(0x823)] = 0x1),
                (sD[ws(0x4da)] = 0x0),
                sD === iz && (pw = 0x1));
              sE & 0x10 && ((sD[ws(0x829)] = rN[ws(0xecf)](rO)), (rO += 0x2));
              sE & 0x20 && (sD[ws(0xd9f)] = rN[ws(0x4d8)](rO++));
              sE & 0x40 && rG(sD);
              if (sE & 0x80) {
                if (sD[ws(0x988)])
                  (sD[ws(0x1d8)] = rN[ws(0xecf)](rO)), (rO += 0x2);
                else {
                  const sG = rF();
                  sG > sD[ws(0xed0)] && iU(sD), (sD[ws(0xed0)] = sG);
                }
              }
              sD[ws(0x988)] && sE & 0x4 && (sD[ws(0x4ff)] = rF()),
                (sD["ox"] = sD["x"]),
                (sD["oy"] = sD["y"]),
                (sD[ws(0x2be)] = sD[ws(0x88c)]),
                (sD[ws(0x5bc)] = sD[ws(0x2fa)]),
                (sD[ws(0x6bb)] = sD[ws(0x445)]),
                (sD[ws(0x8bb)] = 0x0);
            } else {
              const sH = rN[ws(0x4d8)](rO++);
              if (sH === cR[ws(0x694)]) {
                let sM = rN[ws(0x4d8)](rO++);
                const sN = {};
                (sN[ws(0xa91)] = []), (sN["a"] = 0x1);
                const sO = sN;
                while (sM--) {
                  const sP = rI(),
                    sQ = rI();
                  sO[ws(0xa91)][ws(0xf33)]([sP, sQ]);
                }
                iN(sO), (pw = 0x1), iG[ws(0xf33)](sO);
                continue;
              }
              const sI = hL[sH],
                sJ = rI(),
                sK = rI(),
                sL = sH === cR[ws(0x2db)];
              if (sH === cR[ws(0x4ec)] || sH === cR[ws(0x93e)] || sL) {
                const sR = rN[ws(0xecf)](rO);
                (rO += 0x2),
                  (sD = new lL(sH, sC, sJ, sK, sR)),
                  sL &&
                    ((sD[ws(0xa5d)] = !![]),
                    (sD[ws(0x356)] = rN[ws(0x4d8)](rO++) - 0x1));
              } else {
                if (sH === cR[ws(0x372)]) {
                  const sS = rN[ws(0xecf)](rO);
                  (rO += 0x2), (sD = new lO(sC, sJ, sK, sS));
                } else {
                  const sT = eR(rN[ws(0x4d8)](rO++)),
                    sU = rN[ws(0xecf)](rO);
                  rO += 0x2;
                  if (sH === cR[ws(0xa16)]) {
                    const sV = rF(),
                      sW = rN[ws(0x4d8)](rO++);
                    (sD = new lU(sC, sJ, sK, sT, sV, sW, sU)),
                      rG(sD),
                      (sD[ws(0x1d8)] = rN[ws(0xecf)](rO)),
                      (rO += 0x2),
                      (sD[ws(0x80e)] = rE()),
                      (sD[ws(0xe47)] = rE()),
                      (sD[ws(0x4ff)] = rF());
                    if (iy === sC) iz = sD;
                    else {
                      if (jz) {
                        const sX = pW();
                        (sX[ws(0xbd3)] = sD), pO[ws(0xf33)](sX);
                      }
                    }
                  } else {
                    if (sI[ws(0xef5)](ws(0x559)))
                      sD = new lH(sC, sH, sJ, sK, sT, sU);
                    else {
                      const sY = rF(),
                        sZ = rN[ws(0x4d8)](rO++),
                        t0 = sZ >> 0x4,
                        t1 = sZ & 0x1,
                        t2 = sZ & 0x2,
                        t3 = rF();
                      (sD = new lH(sC, sH, sJ, sK, sT, sU, sY)),
                        (sD[ws(0x257)] = t0),
                        (sD[ws(0x80d)] = t1),
                        (sD[ws(0xe2b)] = t2),
                        (sD[ws(0xed0)] = t3),
                        (sD[ws(0xf2f)] = hM[t0]);
                    }
                  }
                }
              }
              (iw[sC] = sD), ix[ws(0xf33)](sD);
            }
          }
          iz &&
            ((iV = iz["nx"]),
            (iW = iz["ny"]),
            (q5[ws(0x5f5)][ws(0x4f9)] = ""),
            q7(q5, iz["nx"], iz["ny"]));
          const rZ = rN[ws(0xecf)](rO);
          rO += 0x2;
          for (let t4 = 0x0; t4 < rZ; t4++) {
            const t5 = rN[ws(0xab9)](rO);
            (rO += 0x4), iZ(t5);
          }
          const s0 = rN[ws(0x4d8)](rO++);
          for (let t6 = 0x0; t6 < s0; t6++) {
            const t7 = rN[ws(0xab9)](rO);
            rO += 0x4;
            const t8 = iw[t7];
            if (t8) {
              (t8[ws(0x382)] = iz), n6(t8[ws(0x559)]["id"], 0x1), iZ(t7);
              if (!oD[t8[ws(0x559)]["id"]]) oD[t8[ws(0x559)]["id"]] = 0x0;
              oD[t8[ws(0x559)]["id"]]++;
            }
          }
          const s1 = rN[ws(0x4d8)](rO++);
          for (let t9 = 0x0; t9 < s1; t9++) {
            const ta = rN[ws(0x4d8)](rO++),
              tb = rF(),
              tc = iR[ta];
            (tc[ws(0x657)] = tb), tb === 0x0 && (tc[ws(0x9de)] = 0x0);
          }
          (iJ = rN[ws(0xecf)](rO)), (rO += 0x2);
          const s2 = rN[ws(0xecf)](rO);
          (rO += 0x2),
            iF[ws(0x467)](
              ws(0x976),
              ki(iJ, ws(0x58e)) + ",\x20" + ki(s2, ws(0x666))
            );
          const s3 = Math[ws(0xeeb)](0xa, iJ);
          if (iI) {
            const td = rN[ws(0x4d8)](rO++),
              te = td >> 0x4,
              tf = td & 0xf,
              tg = rN[ws(0x4d8)](rO++);
            for (let ti = 0x0; ti < tf; ti++) {
              const tj = rN[ws(0x4d8)](rO++);
              (iH[tj][ws(0xc6d)] = rN[ws(0xab9)](rO)), (rO += 0x4);
            }
            const th = [];
            for (let tk = 0x0; tk < tg; tk++) {
              th[ws(0xf33)](rN[ws(0x4d8)](rO++));
            }
            th[ws(0x9ff)](function (tl, tm) {
              return tm - tl;
            });
            for (let tl = 0x0; tl < tg; tl++) {
              const tm = th[tl];
              iH[tm]["el"][ws(0xcd1)](), iH[ws(0x650)](tm, 0x1);
            }
            for (let tn = 0x0; tn < te; tn++) {
              rH();
            }
            iH[ws(0x9ff)](function (to, tp) {
              const wE = ws;
              return tp[wE(0xc6d)] - to[wE(0xc6d)];
            });
          } else {
            iH[ws(0xf30)] = 0x0;
            for (let to = 0x0; to < s3; to++) {
              rH();
            }
            iI = !![];
          }
          iM();
          const s4 = rN[ws(0x4d8)](rO++);
          for (let tp = 0x0; tp < s4; tp++) {
            const tq = rN[ws(0xecf)](rO);
            (rO += 0x2), nW(eJ[tq]);
          }
          const s5 = rN[ws(0xecf)](rO);
          rO += 0x2;
          for (let tr = 0x0; tr < s5; tr++) {
            const ts = rN[ws(0x4d8)](rO++),
              tt = ts >> 0x7,
              tu = ts & 0x7f;
            if (tu === cP[ws(0x972)]) {
              const ty = rN[ws(0x4d8)](rO++),
                tz = rN[ws(0x4d8)](rO++) - 0x1;
              let tA = null,
                tB = 0x0;
              if (tt) {
                const tD = rN[ws(0xab9)](rO);
                rO += 0x4;
                const tE = rE();
                (tA = tE || ws(0x6b7) + tD), (tB = rN[ws(0x4d8)](rO++));
              }
              const tC = j9[ty];
              nm(
                ws(0x972),
                null,
                "⚡\x20" +
                  j8[ty] +
                  ws(0x2e8) +
                  (tz < 0x0
                    ? ws(0xda5)
                    : tz === 0x0
                    ? ws(0xeec)
                    : ws(0xf06) + (tz + 0x1) + "!"),
                tC
              );
              tA &&
                nl(ws(0x972), [
                  [ws(0xaf3), "🏆"],
                  [tC, tA + ws(0x8fe)],
                  [hO[ws(0xefb)], tB + ws(0x5a5)],
                  [tC, ws(0xa1d)],
                ]);
              continue;
            }
            const tv = rN[ws(0xab9)](rO);
            rO += 0x4;
            const tw = rE(),
              tx = tw || ws(0x6b7) + tv;
            if (tu === cP[ws(0x3d2)]) {
              let tF = rE();
              pc[ws(0xc7b)] && (tF = fa(tF));
              if (jO(tF, tv)) nm(tv, tx, tF, tv === iy ? nj["me"] : void 0x0);
              else tv === iy && nm(-0x1, null, ws(0xd0a), nj[ws(0x676)]);
            } else {
              if (tu === cP[ws(0xb74)]) {
                const tG = rN[ws(0xecf)](rO);
                rO += 0x2;
                const tH = rN[ws(0xab9)](rO);
                rO += 0x4;
                const tI = rN[ws(0xab9)](rO);
                rO += 0x4;
                const tJ = dB[tG],
                  tK = hM[tJ[ws(0x257)]],
                  tL = hM[tJ[ws(0x260)][ws(0x257)]],
                  tM = tI === 0x0;
                if (tM)
                  nl(ws(0xb74), [
                    [nj[ws(0xc23)], tx, !![]],
                    [nj[ws(0xc23)], ws(0x6f5)],
                    [
                      hP[tJ[ws(0x257)]],
                      ka(tH) + "\x20" + tK + "\x20" + tJ[ws(0x82f)],
                    ],
                  ]);
                else {
                  const tN = hP[tJ[ws(0x260)][ws(0x257)]];
                  nl(ws(0xb74), [
                    [tN, "⭐"],
                    [tN, tx, !![]],
                    [tN, ws(0x28f)],
                    [
                      tN,
                      ka(tI) +
                        "\x20" +
                        tL +
                        "\x20" +
                        tJ[ws(0x82f)] +
                        ws(0x56f) +
                        ka(tH) +
                        "\x20" +
                        tK +
                        "\x20" +
                        tJ[ws(0x82f)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tO = rN[ws(0xecf)](rO);
                rO += 0x2;
                const tP = eJ[tO],
                  tQ = hM[tP[ws(0x257)]],
                  tR = tu === cP[ws(0x261)],
                  tS = hP[tP[ws(0x257)]];
                nl(ws(0x3ec), [
                  [
                    tS,
                    "" +
                      (tR ? ws(0xea2) : "") +
                      ju(tQ) +
                      "\x20" +
                      tQ +
                      "\x20" +
                      tP[ws(0x82f)] +
                      ws(0x3bc) +
                      jt(tR) +
                      ws(0x7db),
                  ],
                  [tS, tx + "!", !![]],
                ]);
              }
            }
          }
          const s6 = rN[ws(0x4d8)](rO++),
            s7 = s6 & 0xf,
            s8 = s6 >> 0x4;
          let s9 = ![];
          s7 !== j7["id"] &&
            (j7 && (j7[ws(0x894)] = !![]),
            (s9 = !![]),
            je(s7),
            k9(qb, ws(0xa76) + ja[s7] + ws(0x225)));
          const sa = rN[ws(0x4d8)](rO++);
          if (sa > 0x0) {
            let tT = ![];
            for (let tU = 0x0; tU < sa; tU++) {
              const tV = rN[ws(0xecf)](rO);
              rO += 0x2;
              const tW = rN[ws(0xecf)](rO);
              (rO += 0x2), (j7[tV] = tW);
              if (tW > 0x0) {
                if (!j7[ws(0xdee)][tV]) {
                  tT = !![];
                  const tX = nW(eJ[tV], !![]);
                  hack.mobFunc = nW;
                  (tX[ws(0xe49)] = !![]),
                    (tX[ws(0xb37)] = ![]),
                    tX[ws(0x52a)][ws(0xcd1)](ws(0x983)),
                    (tX[ws(0x5a7)] = nR(ws(0x5ef))),
                    tX[ws(0x8c5)](tX[ws(0x5a7)]),
                    (tX[ws(0x9c5)] = tV);
                  let tY = -0x1;
                  (tX["t"] = s9 ? 0x1 : 0x0),
                    (tX[ws(0x894)] = ![]),
                    (tX[ws(0x92d)] = 0x3e8),
                    (tX[ws(0xb75)] = function () {
                      const wF = ws,
                        tZ = tX["t"];
                      if (tZ === tY) return;
                      tY = tZ;
                      const u0 = jg(Math[wF(0xeeb)](0x1, tZ / 0.5)),
                        u1 = jg(
                          Math[wF(0xe6f)](
                            0x0,
                            Math[wF(0xeeb)]((tZ - 0.5) / 0.5)
                          )
                        );
                      (tX[wF(0x5f5)][wF(0x2a7)] =
                        wF(0xb6c) + -0x168 * (0x1 - u1) + wF(0x4a6) + u1 + ")"),
                        (tX[wF(0x5f5)][wF(0x917)] = -1.12 * (0x1 - u0) + "em");
                    }),
                    jc[ws(0xf33)](tX),
                    j7[ws(0xc48)][ws(0x8c5)](tX),
                    (j7[ws(0xdee)][tV] = tX);
                }
                p6(j7[ws(0xdee)][tV][ws(0x5a7)], tW);
              } else {
                const tZ = j7[ws(0xdee)][tV];
                tZ && ((tZ[ws(0x894)] = !![]), delete j7[ws(0xdee)][tV]),
                  delete j7[tV];
              }
            }
            tT &&
              [...j7[ws(0xc48)][ws(0xd83)]]
                [ws(0x9ff)]((u0, u1) => {
                  const wG = ws;
                  return -of(eJ[u0[wG(0x9c5)]], eJ[u1[wG(0x9c5)]]);
                })
                [ws(0x45f)]((u0) => {
                  const wH = ws;
                  j7[wH(0xc48)][wH(0x8c5)](u0);
                });
          }
          (j7[ws(0x778)] = pQ), (j7[ws(0x4a9)] = s8);
          if (s8 !== cS[ws(0xdf2)]) {
            (j7[ws(0x2bb)][ws(0x5f5)][ws(0x4f9)] = ""),
              (j7[ws(0x398)] = j7[ws(0x47c)]),
              (j7[ws(0xbcd)] = rF());
            if (j7[ws(0x222)] !== jK) {
              const u0 = jK ? ws(0x536) : ws(0xcd1);
              j7[ws(0x491)][ws(0x52a)][u0](ws(0x2b8)),
                j7[ws(0x491)][ws(0x52a)][u0](ws(0xa49)),
                j7[ws(0x3e7)][ws(0x52a)][u0](ws(0x741)),
                (j7[ws(0x222)] = jK);
            }
            switch (s8) {
              case cS[ws(0x3f7)]:
                k9(j7[ws(0x83c)], ws(0x53f));
                break;
              case cS[ws(0x972)]:
                const u1 = rN[ws(0x4d8)](rO++) + 0x1;
                k9(j7[ws(0x83c)], ws(0x3c2) + u1);
                break;
              case cS[ws(0x6b5)]:
                k9(j7[ws(0x83c)], ws(0xd4c));
                break;
              case cS[ws(0xba9)]:
                k9(j7[ws(0x83c)], ws(0x320));
                break;
              case cS[ws(0xe97)]:
                k9(j7[ws(0x83c)], ws(0x7b4));
                break;
            }
          } else j7[ws(0x2bb)][ws(0x5f5)][ws(0x4f9)] = ws(0xdf2);
          if (rN[ws(0x1ed)] - rO > 0x0) {
            iz &&
              (j1(qu),
              (qu[ws(0x61a)] = ![]),
              (q6[ws(0x5f5)][ws(0x4f9)] = ""),
              (q5[ws(0x5f5)][ws(0x4f9)] = ws(0xdf2)),
              q7(q6, iz["nx"], iz["ny"]));
            qv[ws(0xaee)](), (iz = null), jv[ws(0x52a)][ws(0xcd1)](ws(0x4ac));
            const u2 = rN[ws(0xecf)](rO) - 0x1;
            rO += 0x2;
            const u3 = rN[ws(0xab9)](rO);
            rO += 0x4;
            const u4 = rN[ws(0xab9)](rO);
            rO += 0x4;
            const u5 = rN[ws(0xab9)](rO);
            rO += 0x4;
            const u6 = rN[ws(0xab9)](rO);
            (rO += 0x4),
              k9(k4, kb(u4)),
              k9(k3, ka(u3)),
              k9(k5, ka(u5)),
              k9(k7, ka(u6));
            let u7 = null;
            rN[ws(0x1ed)] - rO > 0x0 && ((u7 = rN[ws(0xab9)](rO)), (rO += 0x4));
            u7 !== null
              ? (k9(k8, ka(u7)), (k8[ws(0x483)][ws(0x5f5)][ws(0x4f9)] = ""))
              : (k8[ws(0x483)][ws(0x5f5)][ws(0x4f9)] = ws(0xdf2));
            if (u2 === -0x1) k9(k6, ws(0x68c));
            else {
              const u8 = eJ[u2];
              k9(k6, hM[u8[ws(0x257)]] + "\x20" + u8[ws(0x82f)]);
            }
            oE(), (oD = {}), (ko[ws(0x5f5)][ws(0x4f9)] = ""), hh();
          }
          break;
        default:
          console[ws(0xebe)](ws(0x977) + rP);
      }
    }
    var k3 = document[ux(0x9e3)](ux(0xe27)),
      k4 = document[ux(0x9e3)](ux(0x3ae)),
      k5 = document[ux(0x9e3)](ux(0x97a)),
      k6 = document[ux(0x9e3)](ux(0x38d)),
      k7 = document[ux(0x9e3)](ux(0xe56)),
      k8 = document[ux(0x9e3)](ux(0xaf1));
    function k9(rC, rD) {
      const wI = ux;
      rC[wI(0x467)](wI(0x976), rD);
    }
    function ka(rC) {
      const wJ = ux;
      return rC[wJ(0xc5e)](wJ(0x63d));
    }
    function kb(rC, rD) {
      const wK = ux,
        rE = [
          Math[wK(0xe3c)](rC / (0x3e8 * 0x3c * 0x3c)),
          Math[wK(0xe3c)]((rC % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wK(0xe3c)]((rC % (0x3e8 * 0x3c)) / 0x3e8),
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
      [cR[ux(0x416)]]: ux(0x64c),
      [cR[ux(0x5c3)]]: ux(0xa7f),
      [cR[ux(0xb43)]]: ux(0xa7f),
      [cR[ux(0x869)]]: ux(0x7fe),
      [cR[ux(0xe36)]]: ux(0x7fe),
      [cR[ux(0xeb2)]]: ux(0x302),
      [cR[ux(0xded)]]: ux(0x302),
      [cR[ux(0x629)]]: ux(0xb27),
      [cR[ux(0xa88)]]: ux(0xd78),
    };
    kc["0"] = ux(0x68c);
    var kd = kc;
    for (let rC in cR) {
      const rD = cR[rC];
      if (kd[rD]) continue;
      const rE = ke(rC);
      kd[rD] = rE[ux(0x51a)](ux(0x70d), ux(0x6fa));
    }
    function ke(rF) {
      const wL = ux,
        rG = rF[wL(0x51a)](/([A-Z])/g, wL(0x42f)),
        rH = rG[wL(0x6c4)](0x0)[wL(0xe7c)]() + rG[wL(0x607)](0x1);
      return rH;
    }
    var kf = null,
      kg = !![];
    function kh() {
      const wM = ux;
      console[wM(0xebe)](wM(0x7f4)),
        hU(),
        jv[wM(0x52a)][wM(0xcd1)](wM(0x4ac)),
        kg &&
          (kl[wM(0x5f5)][wM(0x4f9)] === wM(0xdf2)
            ? (clearTimeout(kf),
              kD[wM(0x52a)][wM(0x536)](wM(0x4ac)),
              (kf = setTimeout(function () {
                const wN = wM;
                kD[wN(0x52a)][wN(0xcd1)](wN(0x4ac)),
                  (kl[wN(0x5f5)][wN(0x4f9)] = ""),
                  kC[wN(0x828)](kp),
                  (ko[wN(0x5f5)][wN(0x4f9)] = kn[wN(0x5f5)][wN(0x4f9)] =
                    wN(0xdf2)),
                  hh(),
                  hW(hV[wN(0xc32)]);
              }, 0x1f4)))
            : (kD[wM(0x52a)][wM(0xcd1)](wM(0x4ac)), hW(hV[wM(0xc32)])));
    }
    function ki(rF, rG) {
      return rF + "\x20" + rG + (rF === 0x1 ? "" : "s");
    }
    var kj = document[ux(0xe81)](ux(0xb09)),
      kk = kj[ux(0x76b)]("2d"),
      kl = document[ux(0x9e3)](ux(0xca5)),
      km = document[ux(0x9e3)](ux(0xcfa)),
      kn = document[ux(0x9e3)](ux(0x631));
    kn[ux(0x5f5)][ux(0x4f9)] = ux(0xdf2);
    var ko = document[ux(0x9e3)](ux(0x780));
    ko[ux(0x5f5)][ux(0x4f9)] = ux(0xdf2);
    var kp = document[ux(0x9e3)](ux(0xd51)),
      kq = document[ux(0x9e3)](ux(0x2f6)),
      kr = document[ux(0x9e3)](ux(0x274));
    function ks() {
      const wO = ux;
      kr[wO(0xa94)] = "";
      for (let rF = 0x0; rF < 0x32; rF++) {
        const rG = kt[rF],
          rH = nR(wO(0xdd7) + rF + wO(0x303)),
          rI = rH[wO(0x9e3)](wO(0xccd));
        if (rG)
          for (let rJ = 0x0; rJ < rG[wO(0xf30)]; rJ++) {
            const rK = rG[rJ],
              rL = dE[rK];
            if (!rL) rI[wO(0x8c5)](nR(wO(0x32c)));
            else {
              const rM = nR(
                wO(0x840) + rL[wO(0x257)] + "\x22\x20" + qB(rL) + wO(0x282)
              );
              (rM[wO(0x559)] = rL),
                (rM[wO(0x508)] = kq),
                jZ(rM),
                rI[wO(0x8c5)](rM);
            }
          }
        else rI[wO(0xa94)] = wO(0x32c)[wO(0x678)](0x5);
        (rH[wO(0x9e3)](wO(0x956))[wO(0xc0d)] = function () {
          kv(rF);
        }),
          (rH[wO(0x9e3)](wO(0x99e))[wO(0xc0d)] = function () {
            ky(rF);
          }),
          kr[wO(0x8c5)](rH);
      }
    }
    var kt = ku();
    function ku() {
      const wP = ux;
      try {
        const rF = JSON[wP(0x76c)](hC[wP(0x698)]);
        for (const rG in rF) {
          !Array[wP(0x6c0)](rF[rG]) && delete rF[rG];
        }
        return rF;
      } catch {
        return {};
      }
    }
    function kv(rF) {
      const wQ = ux,
        rG = [],
        rH = nA[wQ(0x6a7)](wQ(0xefe));
      for (let rI = 0x0; rI < rH[wQ(0xf30)]; rI++) {
        const rJ = rH[rI],
          rK = rJ[wQ(0xd83)][0x0];
        !rK ? (rG[rI] = null) : (rG[rI] = rK[wQ(0x559)][wQ(0xc49)]);
      }
      (kt[rF] = rG),
        (hC[wQ(0x698)] = JSON[wQ(0xf23)](kt)),
        ks(),
        hb(wQ(0x633) + rF + "!");
    }
    function kw() {
      const wR = ux;
      return nA[wR(0x6a7)](wR(0xefe));
    }
    document[ux(0x9e3)](ux(0x82b))[ux(0xc0d)] = function () {
      kx();
    };
    function kx() {
      const wS = ux,
        rF = kw();
      for (const rG of rF) {
        const rH = rG[wS(0xd83)][0x0];
        if (!rH) continue;
        rH[wS(0xcd1)](),
          iS[wS(0xf33)](rH[wS(0x543)]),
          n6(rH[wS(0x559)]["id"], 0x1),
          im(new Uint8Array([cH[wS(0xcc2)], rG[wS(0x6d0)]]));
      }
    }
    function ky(rF) {
      const wT = ux;
      if (mL || mK[wT(0xf30)] > 0x0) return;
      const rG = kt[rF];
      if (!rG) return;
      kx();
      const rH = kw(),
        rI = Math[wT(0xeeb)](rH[wT(0xf30)], rG[wT(0xf30)]);
      for (let rJ = 0x0; rJ < rI; rJ++) {
        const rK = rG[rJ],
          rL = dE[rK];
        if (!rL || !iT[rL["id"]]) continue;
        const rM = nR(
          wT(0x840) + rL[wT(0x257)] + "\x22\x20" + qB(rL) + wT(0x282)
        );
        (rM[wT(0x559)] = rL),
          (rM[wT(0xcff)] = !![]),
          (rM[wT(0x543)] = iS[wT(0x408)]()),
          nQ(rM, rL),
          (iR[rM[wT(0x543)]] = rM),
          rH[rJ][wT(0x8c5)](rM),
          n6(rM[wT(0x559)]["id"], -0x1);
        const rN = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rN[wT(0x755)](0x0, cH[wT(0x6f8)]),
          rN[wT(0x72a)](0x1, rM[wT(0x559)]["id"]),
          rN[wT(0x755)](0x3, rJ),
          im(rN);
      }
      hb(wT(0x1cd) + rF + "!");
    }
    var kz = document[ux(0x9e3)](ux(0x66b)),
      kA = document[ux(0x9e3)](ux(0x556));
    kA[ux(0xc0d)] = function () {
      const wU = ux;
      kD[wU(0x52a)][wU(0x536)](wU(0x4ac)),
        jz
          ? (kf = setTimeout(function () {
              const wV = wU;
              im(new Uint8Array([cH[wV(0xe06)]]));
            }, 0x1f4))
          : (kf = setTimeout(function () {
              const wW = wU;
              kD[wW(0x52a)][wW(0xcd1)](wW(0x4ac)),
                (kn[wW(0x5f5)][wW(0x4f9)] = ko[wW(0x5f5)][wW(0x4f9)] =
                  wW(0xdf2)),
                (kl[wW(0x5f5)][wW(0x4f9)] = ""),
                kC[wW(0x828)](kp),
                kC[wW(0x52a)][wW(0x536)](wW(0x4ac)),
                jh();
            }, 0x1f4));
    };
    var kB = document[ux(0x9e3)](ux(0x233)),
      kC = document[ux(0x9e3)](ux(0x5f4));
    kC[ux(0x52a)][ux(0x536)](ux(0x4ac));
    var kD = document[ux(0x9e3)](ux(0x3b7)),
      kE = document[ux(0x9e3)](ux(0xc36)),
      kF = document[ux(0x9e3)](ux(0xdf9));
    (kF[ux(0x459)] = hC[ux(0x747)] || ""),
      (kF[ux(0xe6b)] = cJ),
      (kF[ux(0xc4b)] = function () {
        const wX = ux;
        hC[wX(0x747)] = this[wX(0x459)];
      });
    var kG;
    kE[ux(0xc0d)] = function () {
      if (!hX) return;
      kH();
    };
    function kH(rF = ![]) {
      const wY = ux;
      hack.toastFunc = hb;
      if(rF) hack.onload();
      hack.moblst = eN;
      if (kl[wY(0x5f5)][wY(0x4f9)] === wY(0xdf2)) {
        kD[wY(0x52a)][wY(0xcd1)](wY(0x4ac));
        return;
      }
      clearTimeout(kG),
        kC[wY(0x52a)][wY(0xcd1)](wY(0x4ac)),
        (kG = setTimeout(() => {
          const wZ = wY;
          kD[wZ(0x52a)][wZ(0x536)](wZ(0x4ac)),
            (kG = setTimeout(() => {
              const x0 = wZ;
              rF && kD[x0(0x52a)][x0(0xcd1)](x0(0x4ac)),
                (kl[x0(0x5f5)][x0(0x4f9)] = x0(0xdf2)),
                (hf[x0(0x5f5)][x0(0x4f9)] = x0(0xdf2)),
                (kn[x0(0x5f5)][x0(0x4f9)] = ""),
                kn[x0(0x8c5)](kp),
                ir(kF[x0(0x459)][x0(0x607)](0x0, cJ));
            }, 0x1f4));
        }, 0x64));
    }
    var kI = document[ux(0x9e3)](ux(0x6c7));
    function kJ(rF, rG, rH) {
      const x1 = ux,
        rI = {};
      (rI[x1(0x9c7)] = x1(0x5ad)), (rI[x1(0x544)] = !![]), (rH = rH || rI);
      const rJ = nR(
        x1(0xa32) +
          rH[x1(0x9c7)] +
          x1(0x9f4) +
          rF +
          x1(0xea5) +
          (rH[x1(0x544)] ? x1(0xbd1) : "") +
          x1(0x44f)
      );
      return (
        (rJ[x1(0x9e3)](x1(0x750))[x1(0xc0d)] = function () {
          const x2 = x1;
          rG(!![]), rJ[x2(0xcd1)]();
        }),
        (rJ[x1(0x9e3)](x1(0x351))[x1(0xc0d)] = function () {
          const x3 = x1;
          rJ[x3(0xcd1)](), rG(![]);
        }),
        kI[x1(0x8c5)](rJ),
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
            x4(0x615),
            x4(0x27c),
            x4(0x9ce),
            x4(0xda7),
            x4(0xaca),
            x4(0xf01),
            x4(0xd14),
            x4(0x45a),
            x4(0x53b),
            x4(0xdc9),
            x4(0x8f5),
            x4(0x96c),
            x4(0x573),
            x4(0xba4),
            x4(0xe71),
            x4(0x8b2),
            x4(0xd05),
            x4(0xb2c),
            x4(0x371),
            x4(0x293),
            x4(0x25a),
            x4(0x9ac),
            x4(0x2cd),
            x4(0x994),
            x4(0x9f5),
            x4(0x559),
            x4(0x402),
            x4(0xec2),
            x4(0x852),
            x4(0x910),
            x4(0x2c4),
            x4(0xf25),
            x4(0x87f),
            x4(0x9a9),
            x4(0x4ee),
            x4(0x32b),
            x4(0x235),
            x4(0xab1),
            x4(0xbe1),
            x4(0x68d),
            x4(0x5e0),
            x4(0x9bc),
            x4(0xcb4),
            x4(0x876),
            x4(0xbf7),
            x4(0x2f1),
            x4(0x5b2),
            x4(0xbc4),
            x4(0xa2c),
            x4(0xe7d),
            x4(0x4bc),
            x4(0xd4d),
            x4(0x5c6),
            x4(0x60b),
            x4(0x6dd),
            x4(0x412),
            x4(0x2bc),
            x4(0xa07),
            x4(0x314),
            x4(0xbf1),
            x4(0xf27),
            x4(0x740),
            x4(0x1ee),
            x4(0xda6),
            x4(0x26c),
            x4(0x250),
            x4(0xcdb),
            x4(0x8a7),
            x4(0x63f),
            x4(0x2cc),
            x4(0x3d5),
            x4(0xcb9),
            x4(0xc61),
            x4(0x954),
            x4(0x567),
            x4(0x207),
            x4(0x38f),
            x4(0x52f),
            x4(0x340),
            x4(0x2e2),
            x4(0x793),
            x4(0xecb),
            x4(0x8a3),
            x4(0xba8),
            x4(0xc6e),
            x4(0x332),
            x4(0x864),
            x4(0xdaa),
            x4(0x3ea),
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
            else rR[x5(0xf33)](rR[x5(0xd1e)]());
          } catch (rW) {
            rR[x5(0xf33)](rR[x5(0xd1e)]());
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
    var kL = document[ux(0x9e3)](ux(0x565)),
      kM = (function () {
        const x7 = ux;
        let rF = ![];
        return (
          (function (rG) {
            const x6 = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                x6(0x6b1)
              ](rG) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                x6(0x6b1)
              ](rG[x6(0xbda)](0x0, 0x4))
            )
              rF = !![];
          })(navigator[x7(0xad2)] || navigator[x7(0x582)] || window[x7(0xe10)]),
          rF
        );
      })(),
      kN =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          ux(0x6b1)
        ](navigator[ux(0xad2)][ux(0xe12)]()),
      kO = 0x514,
      kP = 0x28a,
      kQ = 0x1,
      kR = [kn, kl, ko, km, kI, hf],
      kS = 0x1,
      kT = 0x1;
    function kU() {
      const x8 = ux;
      (kT = Math[x8(0xe6f)](kj[x8(0xf3d)] / cZ, kj[x8(0xac0)] / d0)),
        (kS =
          Math[pc[x8(0x6a9)] ? x8(0xeeb) : x8(0xe6f)](kV() / kO, kW() / kP) *
          (kM && !kN ? 1.1 : 0x1)),
        (kS *= kQ);
      for (let rF = 0x0; rF < kR[x8(0xf30)]; rF++) {
        const rG = kR[rF];
        let rH = kS * (rG[x8(0xb18)] || 0x1);
        (rG[x8(0x5f5)][x8(0x2a7)] = x8(0x6d6) + rH + ")"),
          (rG[x8(0x5f5)][x8(0xf1f)] = x8(0x933)),
          (rG[x8(0x5f5)][x8(0xf3d)] = kV() / rH + "px"),
          (rG[x8(0x5f5)][x8(0xac0)] = kW() / rH + "px");
      }
    }
    function kV() {
      const x9 = ux;
      return document[x9(0x789)][x9(0xcd2)];
    }
    function kW() {
      const xa = ux;
      return document[xa(0x789)][xa(0x614)];
    }
    var kX = 0x1;
    function kY() {
      const xb = ux;
      (kX = pc[xb(0xc8b)] ? 0.65 : window[xb(0x4d2)]),
        (kj[xb(0xf3d)] = kV() * kX),
        (kj[xb(0xac0)] = kW() * kX),
        kU();
      for (let rF = 0x0; rF < mK[xb(0xf30)]; rF++) {
        mK[rF][xb(0xc4c)]();
      }
    }
    window[ux(0xb81)] = function () {
      kY(), qJ();
    };
    var kZ = (function () {
        const xc = ux,
          rF = 0x23,
          rG = rF / 0x2,
          rH = document[xc(0x636)](xc(0xb09));
        rH[xc(0xf3d)] = rH[xc(0xac0)] = rF;
        const rI = rH[xc(0x76b)]("2d");
        return (
          (rI[xc(0x744)] = xc(0x775)),
          rI[xc(0x936)](),
          rI[xc(0xba7)](0x0, rG),
          rI[xc(0xce8)](rF, rG),
          rI[xc(0xba7)](rG, 0x0),
          rI[xc(0xce8)](rG, rF),
          rI[xc(0x976)](),
          rI[xc(0x6c8)](rH, xc(0x678))
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
      const rI = Math[xd(0x5a6)](rF),
        rJ = Math[xd(0x4ce)](rF),
        rK = rI * 0x28,
        rL = rJ * 0x28;
      l2[xd(0xf33)]({
        dir: rG,
        start: [rK, rL],
        curve: [
          rK + rI * 0x17 + -rJ * rG * rH,
          rL + rJ * 0x17 + rI * rG * rH,
          rK + rI * 0x2e,
          rL + rJ * 0x2e,
        ],
        side: Math[xd(0x98d)](rF),
      });
    }
    var l4 = l5();
    function l5() {
      const xe = ux,
        rF = new Path2D(),
        rG = Math["PI"] / 0x5;
      return (
        rF[xe(0xb0a)](0x0, 0x0, 0x28, rG, l1 - rG),
        rF[xe(0x38c)](
          0x12,
          0x0,
          Math[xe(0x5a6)](rG) * 0x28,
          Math[xe(0x4ce)](rG) * 0x28
        ),
        rF[xe(0x7ce)](),
        rF
      );
    }
    var l6 = l7();
    function l7() {
      const xf = ux,
        rF = new Path2D();
      return (
        rF[xf(0xba7)](-0x28, 0x5),
        rF[xf(0xa6e)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rF[xf(0xce8)](0x28, -0x5),
        rF[xf(0xa6e)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rF[xf(0x7ce)](),
        rF
      );
    }
    function l8(rF, rG = 0x1, rH = 0x0) {
      const xg = ux,
        rI = new Path2D();
      for (let rJ = 0x0; rJ < rF; rJ++) {
        const rK = (Math["PI"] * 0x2 * rJ) / rF + rH;
        rI[xg(0xce8)](
          Math[xg(0x5a6)](rK) - Math[xg(0x4ce)](rK) * 0.1 * rG,
          Math[xg(0x4ce)](rK)
        );
      }
      return rI[xg(0x7ce)](), rI;
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
          rF[xh(0xce8)](Math[xh(0x5a6)](rH) * rI, Math[xh(0x4ce)](rH) * rI);
        }
        return rF[xh(0x7ce)](), rF;
      })(),
      petalCotton: lb(0x9, 0x1, 0.5, 1.6),
      petalWeb: lb(0x5, 0x1, 0.5, 0.7),
      petalCactus: lb(0x8, 0x1, 0.5, 0.7),
      petalSand: l8(0x6, 0x0, 0.2),
    };
    function la(rF, rG, rH, rI, rJ) {
      const xi = ux;
      (rF[xi(0x744)] = rJ),
        (rF[xi(0x9b8)] = rH),
        rF[xi(0x70a)](),
        (rG *= 0.45),
        rF[xi(0x70b)](rG),
        rF[xi(0x94b)](-0x14, 0x0),
        rF[xi(0x936)](),
        rF[xi(0xba7)](0x0, 0x26),
        rF[xi(0xce8)](0x50, 0x7),
        rF[xi(0xce8)](0x50, -0x7),
        rF[xi(0xce8)](0x0, -0x26),
        rF[xi(0xce8)](-0x14, -0x1e),
        rF[xi(0xce8)](-0x14, 0x1e),
        rF[xi(0x7ce)](),
        (rH = rH / rG),
        (rF[xi(0x9b8)] = 0x64 + rH),
        (rF[xi(0x744)] = rJ),
        rF[xi(0x976)](),
        (rF[xi(0x744)] = rF[xi(0x756)] = rI),
        (rF[xi(0x9b8)] -= rH * 0x2),
        rF[xi(0x976)](),
        rF[xi(0x64e)](),
        rF[xi(0xdea)]();
    }
    function lb(rF, rG, rH, rI) {
      const xj = ux,
        rJ = new Path2D();
      return lc(rJ, rF, rG, rH, rI), rJ[xj(0x7ce)](), rJ;
    }
    function lc(rF, rG, rH, rI, rJ) {
      const xk = ux;
      rF[xk(0xba7)](rH, 0x0);
      for (let rK = 0x1; rK <= rG; rK++) {
        const rL = (Math["PI"] * 0x2 * (rK - rI)) / rG,
          rM = (Math["PI"] * 0x2 * rK) / rG;
        rF[xk(0x38c)](
          Math[xk(0x5a6)](rL) * rH * rJ,
          Math[xk(0x4ce)](rL) * rH * rJ,
          Math[xk(0x5a6)](rM) * rH,
          Math[xk(0x4ce)](rM) * rH
        );
      }
    }
    var ld = (function () {
        const xl = ux,
          rF = new Path2D();
        rF[xl(0xba7)](0x3c, 0x0);
        const rG = 0x6;
        for (let rH = 0x0; rH < rG; rH++) {
          const rI = ((rH + 0.5) / rG) * Math["PI"] * 0x2,
            rJ = ((rH + 0x1) / rG) * Math["PI"] * 0x2;
          rF[xl(0x38c)](
            Math[xl(0x5a6)](rI) * 0x78,
            Math[xl(0x4ce)](rI) * 0x78,
            Math[xl(0x5a6)](rJ) * 0x3c,
            Math[xl(0x4ce)](rJ) * 0x3c
          );
        }
        return rF[xl(0x7ce)](), rF;
      })(),
      le = (function () {
        const xm = ux,
          rF = new Path2D(),
          rG = 0x6;
        for (let rH = 0x0; rH < rG; rH++) {
          const rI = ((rH + 0.5) / rG) * Math["PI"] * 0x2;
          rF[xm(0xba7)](0x0, 0x0), rF[xm(0xce8)](...lf(0x37, 0x0, rI));
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            const rK = (rJ / 0x2) * 0x1e + 0x14,
              rL = 0xa - rJ * 0x2;
            rF[xm(0xba7)](...lf(rK + rL, -rL, rI)),
              rF[xm(0xce8)](...lf(rK, 0x0, rI)),
              rF[xm(0xce8)](...lf(rK + rL, rL, rI));
          }
        }
        return rF;
      })();
    function lf(rF, rG, rH) {
      const xn = ux,
        rI = Math[xn(0x4ce)](rH),
        rJ = Math[xn(0x5a6)](rH);
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
          rQ = Math[xo(0xcec)](rP * 0xff)[xo(0xd80)](0x10);
        return rQ[xo(0xf30)] === 0x1 ? "0" + rQ : rQ;
      };
      return "#" + rL(rI) + rL(rJ) + rL(rK);
    }
    var lh = [];
    for (let rF = 0x0; rF < 0xa; rF++) {
      const rG = 0x1 - rF / 0xa;
      lh[ux(0xf33)](lg(0x28 + rG * 0xc8, 0x50, 0x3c * rG));
    }
    var li = [ux(0xb70), ux(0xd8a)],
      lj = li[0x0],
      lk = [ux(0x9a7), ux(0x41a), ux(0xc74), ux(0x529)];
    function ll(rH = ux(0xb87)) {
      const xp = ux,
        rI = [];
      for (let rJ = 0x0; rJ < 0x5; rJ++) {
        rI[xp(0xf33)](q0(rH, 0.8 - (rJ / 0x5) * 0.25));
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
          body: ux(0xb87),
          wing: ux(0x6e0),
          tail_outline: ux(0x71e),
          bone_outline: ux(0xf31),
          bone: ux(0x71e),
          tail: ll(),
        },
      },
      ln = new Path2D(ux(0x639)),
      lo = new Path2D(ux(0x7f5)),
      lp = [];
    for (let rH = 0x0; rH < 0x3; rH++) {
      lp[ux(0xf33)](q0(li[0x0], 0x1 - (rH / 0x3) * 0.2));
    }
    function lq(rI = Math[ux(0x4a5)]()) {
      return function () {
        return (rI = (rI * 0x2455 + 0xc091) % 0x38f40), rI / 0x38f40;
      };
    }
    const lr = {
      [cR[ux(0x551)]]: [ux(0x329), ux(0x501)],
      [cR[ux(0xeba)]]: [ux(0xb87), ux(0x687)],
      [cR[ux(0xd82)]]: [ux(0x47f), ux(0xbed)],
    };
    var ls = lr;
    const lt = {};
    (lt[ux(0xb98)] = !![]),
      (lt[ux(0xdca)] = !![]),
      (lt[ux(0x660)] = !![]),
      (lt[ux(0x223)] = !![]),
      (lt[ux(0xae0)] = !![]),
      (lt[ux(0xe93)] = !![]),
      (lt[ux(0x7df)] = !![]);
    var lu = lt;
    const lv = {};
    (lv[ux(0x280)] = !![]),
      (lv[ux(0xbb7)] = !![]),
      (lv[ux(0x870)] = !![]),
      (lv[ux(0x27e)] = !![]),
      (lv[ux(0xa44)] = !![]),
      (lv[ux(0x341)] = !![]),
      (lv[ux(0xae5)] = !![]);
    var lw = lv;
    const lx = {};
    (lx[ux(0x870)] = !![]),
      (lx[ux(0x27e)] = !![]),
      (lx[ux(0xa44)] = !![]),
      (lx[ux(0x341)] = !![]);
    var ly = lx;
    const lz = {};
    (lz[ux(0xbb7)] = !![]), (lz[ux(0x3b5)] = !![]), (lz[ux(0x223)] = !![]);
    var lA = lz;
    const lB = {};
    (lB[ux(0x7d6)] = !![]), (lB[ux(0xa88)] = !![]), (lB[ux(0xb5e)] = !![]);
    var lC = lB;
    const lD = {};
    (lD[ux(0xe23)] = !![]),
      (lD[ux(0x629)] = !![]),
      (lD[ux(0x214)] = !![]),
      (lD[ux(0x649)] = !![]),
      (lD[ux(0x609)] = !![]);
    var lE = lD;
    function lF(rI, rJ) {
      const xq = ux;
      rI[xq(0x936)](), rI[xq(0xba7)](rJ, 0x0);
      for (let rK = 0x0; rK < 0x6; rK++) {
        const rL = (rK / 0x6) * Math["PI"] * 0x2;
        rI[xq(0xce8)](Math[xq(0x5a6)](rL) * rJ, Math[xq(0x4ce)](rL) * rJ);
      }
      rI[xq(0x7ce)]();
    }
    function lG(rI, rJ, rK, rL, rM) {
      const xr = ux;
      rI[xr(0x936)](),
        rI[xr(0xba7)](0x9, -0x5),
        rI[xr(0xa6e)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rI[xr(0x38c)](0xd, 0x0, 0x9, -0x5),
        rI[xr(0x7ce)](),
        (rI[xr(0x5ce)] = rI[xr(0x339)] = xr(0xcec)),
        (rI[xr(0x744)] = rL),
        (rI[xr(0x9b8)] = rJ),
        rI[xr(0x976)](),
        (rI[xr(0x9b8)] -= rM),
        (rI[xr(0x756)] = rI[xr(0x744)] = rK),
        rI[xr(0x64e)](),
        rI[xr(0x976)]();
    }
    var lH = class {
        constructor(rI = -0x1, rJ, rK, rL, rM, rN = 0x7, rO = -0x1) {
          const xs = ux;
          (this["id"] = rI),
            (this[xs(0x307)] = rJ),
            (this[xs(0x56b)] = hL[rJ]),
            (this[xs(0x7d1)] = this[xs(0x56b)][xs(0xef5)](xs(0x559))),
            (this["x"] = this["nx"] = this["ox"] = rK),
            (this["y"] = this["ny"] = this["oy"] = rL),
            (this[xs(0x88c)] = this[xs(0xd79)] = this[xs(0x2be)] = rM),
            (this[xs(0x914)] =
              this[xs(0x2fa)] =
              this[xs(0x391)] =
              this[xs(0x5bc)] =
                rO),
            (this[xs(0x958)] = 0x0),
            (this[xs(0x445)] = this[xs(0x829)] = this[xs(0x6bb)] = rN),
            (this[xs(0x8bb)] = 0x0),
            (this[xs(0x2a0)] = ![]),
            (this[xs(0xda0)] = 0x0),
            (this[xs(0x823)] = 0x0),
            (this[xs(0x906)] = this[xs(0x56b)][xs(0xbd9)](xs(0x772)) > -0x1),
            (this[xs(0x9df)] = this[xs(0x906)] ? this[xs(0x2fa)] < 0x1 : 0x1),
            (this[xs(0x80d)] = ![]),
            (this[xs(0xed0)] = 0x0),
            (this[xs(0x60d)] = 0x0),
            (this[xs(0xdd2)] = 0x0),
            (this[xs(0x253)] = 0x1),
            (this[xs(0x4c6)] = 0x0),
            (this[xs(0x702)] = [cR[xs(0xcb0)], cR[xs(0xae7)], cR[xs(0xa16)]][
              xs(0x7b5)
            ](this[xs(0x307)])),
            (this[xs(0xb16)] = lw[this[xs(0x56b)]]),
            (this[xs(0x67e)] = ly[this[xs(0x56b)]] ? 0x32 / 0xc8 : 0x0),
            (this[xs(0x64f)] = lu[this[xs(0x56b)]]),
            (this[xs(0xbce)] = 0x0),
            (this[xs(0xd45)] = 0x0),
            (this[xs(0x999)] = ![]),
            (this[xs(0xd3f)] = 0x0),
            (this[xs(0x586)] = !![]),
            (this[xs(0x4da)] = 0x2),
            (this[xs(0xdf8)] = 0x0),
            (this[xs(0x306)] = lE[this[xs(0x56b)]]),
            (this[xs(0xbc0)] = lA[this[xs(0x56b)]]),
            (this[xs(0x1e0)] = lC[this[xs(0x56b)]]);
        }
        [ux(0xb75)]() {
          const xt = ux;
          this[xt(0x2a0)] && (this[xt(0xda0)] += pR / 0xc8);
          (this[xt(0xd45)] += ((this[xt(0x999)] ? 0x1 : -0x1) * pR) / 0xc8),
            (this[xt(0xd45)] = Math[xt(0xeeb)](
              0x1,
              Math[xt(0xe6f)](0x0, this[xt(0xd45)])
            )),
            (this[xt(0xdd2)] = px(
              this[xt(0xdd2)],
              this[xt(0x60d)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[xt(0x60d)] = px(this[xt(0x60d)], this[xt(0xed0)], 0x64));
          this[xt(0x823)] > 0x0 &&
            ((this[xt(0x823)] -= pR / 0x96),
            this[xt(0x823)] < 0x0 && (this[xt(0x823)] = 0x0));
          (this[xt(0x8bb)] += pR / 0x64),
            (this["t"] = Math[xt(0xeeb)](0x1, this[xt(0x8bb)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[xt(0x2fa)] =
              this[xt(0x5bc)] +
              (this[xt(0x391)] - this[xt(0x5bc)]) * this["t"]),
            (this[xt(0x445)] =
              this[xt(0x6bb)] +
              (this[xt(0x829)] - this[xt(0x6bb)]) * this["t"]);
          if (this[xt(0x702)]) {
            const rI = Math[xt(0xeeb)](0x1, pR / 0x64);
            (this[xt(0x253)] +=
              (Math[xt(0x5a6)](this[xt(0xd79)]) - this[xt(0x253)]) * rI),
              (this[xt(0x4c6)] +=
                (Math[xt(0x4ce)](this[xt(0xd79)]) - this[xt(0x4c6)]) * rI);
          }
          (this[xt(0x88c)] = f7(this[xt(0x2be)], this[xt(0xd79)], this["t"])),
            (this[xt(0xd3f)] +=
              ((Math[xt(0x4a4)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pR) /
              0x12),
            this[xt(0x958)] > 0x0 &&
              ((this[xt(0x958)] -= pR / 0x258),
              this[xt(0x958)] < 0x0 && (this[xt(0x958)] = 0x0)),
            this[xt(0x1e0)] &&
              ((this[xt(0x4da)] += pR / 0x5dc),
              this[xt(0x4da)] > 0x1 && (this[xt(0x4da)] = 0x1),
              (this[xt(0x586)] = this[xt(0x4da)] < 0x1)),
            this[xt(0x2fa)] < 0x1 &&
              (this[xt(0x9df)] = px(this[xt(0x9df)], 0x1, 0xc8)),
            this[xt(0x958)] === 0x0 &&
              (this[xt(0x914)] +=
                (this[xt(0x2fa)] - this[xt(0x914)]) *
                Math[xt(0xeeb)](0x1, pR / 0xc8));
        }
        [ux(0xc75)](rI, rJ = ![]) {
          const xu = ux,
            rK = this[xu(0x445)] / 0x19;
          rI[xu(0x70b)](rK),
            rI[xu(0x94b)](0x5, 0x0),
            (rI[xu(0x9b8)] = 0x5),
            (rI[xu(0x339)] = rI[xu(0x5ce)] = xu(0xcec)),
            (rI[xu(0x744)] = rI[xu(0x756)] = this[xu(0xb66)](xu(0x99b)));
          rJ &&
            (rI[xu(0x70a)](),
            rI[xu(0x94b)](0x3, 0x0),
            rI[xu(0x936)](),
            rI[xu(0xba7)](-0xa, 0x0),
            rI[xu(0xce8)](-0x28, -0xf),
            rI[xu(0x38c)](-0x21, 0x0, -0x28, 0xf),
            rI[xu(0x7ce)](),
            rI[xu(0xdea)](),
            rI[xu(0x976)](),
            rI[xu(0x64e)]());
          rI[xu(0x936)](), rI[xu(0xba7)](0x0, 0x1e);
          const rL = 0x1c,
            rM = 0x24,
            rN = 0x5;
          rI[xu(0xba7)](0x0, rL);
          for (let rO = 0x0; rO < rN; rO++) {
            const rP = ((((rO + 0.5) / rN) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              rQ = ((((rO + 0x1) / rN) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rI[xu(0x38c)](
              Math[xu(0x5a6)](rP) * rM * 0.85,
              -Math[xu(0x4ce)](rP) * rM,
              Math[xu(0x5a6)](rQ) * rL * 0.7,
              -Math[xu(0x4ce)](rQ) * rL
            );
          }
          rI[xu(0xce8)](-0x1c, -0x9),
            rI[xu(0x38c)](-0x26, 0x0, -0x1c, 0x9),
            rI[xu(0xce8)](0x0, rL),
            rI[xu(0x7ce)](),
            (rI[xu(0x756)] = this[xu(0xb66)](xu(0x1df))),
            rI[xu(0x64e)](),
            rI[xu(0x976)](),
            rI[xu(0x936)]();
          for (let rR = 0x0; rR < 0x4; rR++) {
            const rS = (((rR / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rT = -0x1e + Math[xu(0x5a6)](rS) * 0xd,
              rU = Math[xu(0x4ce)](rS) * 0xb;
            rI[xu(0xba7)](rT, rU),
              rI[xu(0xce8)](
                rT + Math[xu(0x5a6)](rS) * 0x1b,
                rU + Math[xu(0x4ce)](rS) * 0x1b
              );
          }
          (rI[xu(0x9b8)] = 0x4), rI[xu(0x976)]();
        }
        [ux(0x492)](rI, rJ = ux(0x578), rK = 0x0) {
          const xv = ux;
          for (let rL = 0x0; rL < l2[xv(0xf30)]; rL++) {
            const rM = l2[rL];
            rI[xv(0x70a)](),
              rI[xv(0x317)](
                rM[xv(0xaf4)] * Math[xv(0x4ce)](this[xv(0xd3f)] + rL) * 0.15 +
                  rK * rM[xv(0xd20)]
              ),
              rI[xv(0x936)](),
              rI[xv(0xba7)](...rM[xv(0xd8e)]),
              rI[xv(0x38c)](...rM[xv(0xcd4)]),
              (rI[xv(0x744)] = this[xv(0xb66)](rJ)),
              (rI[xv(0x9b8)] = 0x8),
              (rI[xv(0x339)] = xv(0xcec)),
              rI[xv(0x976)](),
              rI[xv(0xdea)]();
          }
        }
        [ux(0x533)](rI) {
          const xw = ux;
          rI[xw(0x936)]();
          let rJ = 0x0,
            rK = 0x0,
            rL,
            rM;
          const rN = 0x14;
          for (let rO = 0x0; rO < rN; rO++) {
            const rP = (rO / rN) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              rQ = ((rO + 0x1) / rN) * 0x28;
            (rL = Math[xw(0x5a6)](rP) * rQ), (rM = Math[xw(0x4ce)](rP) * rQ);
            const rR = rJ + rL,
              rS = rK + rM;
            rI[xw(0x38c)](
              (rJ + rR) * 0.5 + rM * 0.15,
              (rK + rS) * 0.5 - rL * 0.15,
              rR,
              rS
            ),
              (rJ = rR),
              (rK = rS);
          }
          rI[xw(0x38c)](
            rJ - rM * 0.42 + rL * 0.4,
            rK + rL * 0.42 + rM * 0.4,
            rJ - rM * 0.84,
            rK + rL * 0.84
          ),
            (rI[xw(0x756)] = this[xw(0xb66)](xw(0xc01))),
            rI[xw(0x64e)](),
            (rI[xw(0x9b8)] = 0x8),
            (rI[xw(0x744)] = this[xw(0xb66)](xw(0x390))),
            rI[xw(0x976)]();
        }
        [ux(0x223)](rI) {
          const xx = ux;
          rI[xx(0x70b)](this[xx(0x445)] / 0xd),
            rI[xx(0x317)](-Math["PI"] / 0x6),
            (rI[xx(0x339)] = rI[xx(0x5ce)] = xx(0xcec)),
            rI[xx(0x936)](),
            rI[xx(0xba7)](0x0, -0xe),
            rI[xx(0xce8)](0x6, -0x14),
            (rI[xx(0x756)] = rI[xx(0x744)] = this[xx(0xb66)](xx(0xc2a))),
            (rI[xx(0x9b8)] = 0x7),
            rI[xx(0x976)](),
            (rI[xx(0x756)] = rI[xx(0x744)] = this[xx(0xb66)](xx(0x1d7))),
            (rI[xx(0x9b8)] = 0x2),
            rI[xx(0x976)](),
            rI[xx(0x936)](),
            rI[xx(0xba7)](0x0, -0xc),
            rI[xx(0x38c)](-0x6, 0x0, 0x4, 0xe),
            rI[xx(0xa6e)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rI[xx(0x9b8)] = 0xc),
            (rI[xx(0x756)] = rI[xx(0x744)] = this[xx(0xb66)](xx(0x7e4))),
            rI[xx(0x64e)](),
            rI[xx(0x976)](),
            (rI[xx(0x9b8)] = 0x6),
            (rI[xx(0x756)] = rI[xx(0x744)] = this[xx(0xb66)](xx(0x815))),
            rI[xx(0x976)](),
            rI[xx(0x64e)]();
        }
        [ux(0x660)](rI) {
          const xy = ux;
          rI[xy(0x70b)](this[xy(0x445)] / 0x2d),
            rI[xy(0x94b)](-0x14, 0x0),
            (rI[xy(0x339)] = rI[xy(0x5ce)] = xy(0xcec)),
            rI[xy(0x936)]();
          const rJ = 0x6,
            rK = Math["PI"] * 0.45,
            rL = 0x3c,
            rM = 0x46;
          rI[xy(0xba7)](0x0, 0x0);
          for (let rN = 0x0; rN < rJ; rN++) {
            const rO = ((rN / rJ) * 0x2 - 0x1) * rK,
              rP = (((rN + 0x1) / rJ) * 0x2 - 0x1) * rK;
            rN === 0x0 &&
              rI[xy(0x38c)](
                -0xa,
                -0x32,
                Math[xy(0x5a6)](rO) * rL,
                Math[xy(0x4ce)](rO) * rL
              );
            const rQ = (rO + rP) / 0x2;
            rI[xy(0x38c)](
              Math[xy(0x5a6)](rQ) * rM,
              Math[xy(0x4ce)](rQ) * rM,
              Math[xy(0x5a6)](rP) * rL,
              Math[xy(0x4ce)](rP) * rL
            );
          }
          rI[xy(0x38c)](-0xa, 0x32, 0x0, 0x0),
            (rI[xy(0x756)] = this[xy(0xb66)](xy(0x8c2))),
            (rI[xy(0x744)] = this[xy(0xb66)](xy(0xed3))),
            (rI[xy(0x9b8)] = 0xa),
            rI[xy(0x976)](),
            rI[xy(0x64e)](),
            rI[xy(0x936)](),
            rI[xy(0xb0a)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rI[xy(0x7ce)](),
            (rI[xy(0x744)] = this[xy(0xb66)](xy(0x9ef))),
            (rI[xy(0x9b8)] = 0x1e),
            rI[xy(0x976)](),
            (rI[xy(0x9b8)] = 0xa),
            (rI[xy(0x744)] = rI[xy(0x756)] = this[xy(0xb66)](xy(0xcd3))),
            rI[xy(0x64e)](),
            rI[xy(0x976)]();
        }
        [ux(0x29a)](rI, rJ = ![]) {
          const xz = ux;
          rI[xz(0x70b)](this[xz(0x445)] / 0x64);
          let rK = this[xz(0x7ef)]
            ? 0.75
            : Math[xz(0x4ce)](Date[xz(0x296)]() / 0x96 + this[xz(0xd3f)]);
          (rK = rK * 0.5 + 0.5),
            (rK *= 0.7),
            rI[xz(0x936)](),
            rI[xz(0xba7)](0x0, 0x0),
            rI[xz(0xb0a)](0x0, 0x0, 0x64, rK, Math["PI"] * 0x2 - rK),
            rI[xz(0x7ce)](),
            (rI[xz(0x756)] = this[xz(0xb66)](xz(0xb7c))),
            rI[xz(0x64e)](),
            rI[xz(0xc11)](),
            (rI[xz(0x744)] = xz(0x63b)),
            (rI[xz(0x9b8)] = rJ ? 0x28 : 0x1e),
            (rI[xz(0x5ce)] = xz(0xcec)),
            rI[xz(0x976)](),
            !rJ &&
              (rI[xz(0x936)](),
              rI[xz(0xb0a)](
                0x0 - rK * 0x8,
                -0x32 - rK * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rI[xz(0x756)] = xz(0x5b4)),
              rI[xz(0x64e)]());
        }
        [ux(0x4fc)](rI) {
          const xA = ux;
          rI[xA(0x70b)](this[xA(0x445)] / 0x50),
            rI[xA(0x317)](-this[xA(0x88c)]),
            rI[xA(0x94b)](0x0, 0x50);
          const rJ = Date[xA(0x296)]() / 0x12c + this[xA(0xd3f)];
          rI[xA(0x936)]();
          const rK = 0x3;
          let rL;
          for (let rO = 0x0; rO < rK; rO++) {
            const rP = ((rO / rK) * 0x2 - 0x1) * 0x64,
              rQ = (((rO + 0x1) / rK) * 0x2 - 0x1) * 0x64;
            (rL =
              0x14 +
              (Math[xA(0x4ce)]((rO / rK) * Math["PI"] * 0x8 + rJ) * 0.5 + 0.5) *
                0x1e),
              rO === 0x0 && rI[xA(0xba7)](rP, -rL),
              rI[xA(0xa6e)](rP, rL, rQ, rL, rQ, -rL);
          }
          rI[xA(0xa6e)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rL),
            rI[xA(0x7ce)](),
            (rI[xA(0x442)] *= 0.7);
          const rM = this[xA(0x80d)]
            ? li[0x0]
            : this["id"] < 0x0
            ? lk[0x0]
            : lk[this["id"] % lk[xA(0xf30)]];
          (rI[xA(0x756)] = this[xA(0xb66)](rM)),
            rI[xA(0x64e)](),
            rI[xA(0xc11)](),
            (rI[xA(0x5ce)] = xA(0xcec)),
            (rI[xA(0x744)] = xA(0x63b)),
            xA(0x603),
            (rI[xA(0x9b8)] = 0x1e),
            rI[xA(0x976)]();
          let rN = Math[xA(0x4ce)](rJ * 0x1);
          (rN = rN * 0.5 + 0.5),
            (rN *= 0x3),
            rI[xA(0x936)](),
            rI[xA(0x486)](
              0x0,
              -0x82 - rN * 0x2,
              0x28 - rN,
              0x14 - rN * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rI[xA(0x756)] = rI[xA(0x744)]),
            rI[xA(0x64e)]();
        }
        [ux(0xe6a)](rI, rJ) {
          const xB = ux;
          rI[xB(0x70b)](this[xB(0x445)] / 0x14);
          const rK = rI[xB(0x442)];
          (rI[xB(0x744)] = rI[xB(0x756)] = this[xB(0xb66)](xB(0x88e))),
            (rI[xB(0x442)] = 0.4 * rK),
            rI[xB(0x70a)](),
            rI[xB(0x936)](),
            rI[xB(0x317)](Math["PI"] * 0.16),
            rI[xB(0x94b)](rJ ? -0x6 : -0x9, 0x0),
            rI[xB(0xba7)](0x0, -0x4),
            rI[xB(0x38c)](-0x2, 0x0, 0x0, 0x4),
            (rI[xB(0x9b8)] = 0x8),
            (rI[xB(0x5ce)] = rI[xB(0x339)] = xB(0xcec)),
            rI[xB(0x976)](),
            rI[xB(0xdea)](),
            rI[xB(0x936)](),
            rI[xB(0xb0a)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rI[xB(0x64e)](),
            rI[xB(0xc11)](),
            (rI[xB(0x442)] = 0.5 * rK),
            (rI[xB(0x9b8)] = rJ ? 0x8 : 0x3),
            rI[xB(0x976)]();
        }
        [ux(0x649)](rI) {
          const xC = ux;
          rI[xC(0x70b)](this[xC(0x445)] / 0x64);
          const rJ = this[xC(0xb66)](xC(0xbb8)),
            rK = this[xC(0xb66)](xC(0x953)),
            rL = 0x4;
          rI[xC(0x5ce)] = rI[xC(0x339)] = xC(0xcec);
          const rM = 0x64 - rI[xC(0x9b8)] * 0.5;
          for (let rN = 0x0; rN <= rL; rN++) {
            const rO = (0x1 - rN / rL) * rM;
            lF(rI, rO),
              (rI[xC(0x9b8)] =
                0x1e +
                rN *
                  (Math[xC(0x4ce)](Date[xC(0x296)]() / 0x320 + rN) * 0.5 +
                    0.5) *
                  0x5),
              (rI[xC(0x756)] = rI[xC(0x744)] = rN % 0x2 === 0x0 ? rJ : rK),
              rN === rL - 0x1 && rI[xC(0x64e)](),
              rI[xC(0x976)]();
          }
        }
        [ux(0x3b3)](rI, rJ) {
          const xD = ux;
          rI[xD(0x936)](),
            rI[xD(0xb0a)](0x0, 0x0, this[xD(0x445)], 0x0, l1),
            (rI[xD(0x756)] = this[xD(0xb66)](rJ)),
            rI[xD(0x64e)](),
            (rI[xD(0x756)] = xD(0x5b4));
          for (let rK = 0x1; rK < 0x4; rK++) {
            rI[xD(0x936)](),
              rI[xD(0xb0a)](
                0x0,
                0x0,
                this[xD(0x445)] * (0x1 - rK / 0x4),
                0x0,
                l1
              ),
              rI[xD(0x64e)]();
          }
        }
        [ux(0xc4a)](rI, rJ) {
          const xE = ux;
          rI[xE(0x94b)](-this[xE(0x445)], 0x0), (rI[xE(0x624)] = xE(0x706));
          const rK = 0x32;
          let rL = ![];
          !this[xE(0x58d)] && ((rL = !![]), (this[xE(0x58d)] = []));
          while (this[xE(0x58d)][xE(0xf30)] < rK) {
            this[xE(0x58d)][xE(0xf33)]({
              x: rL ? Math[xE(0x4a5)]() : 0x0,
              y: Math[xE(0x4a5)]() * 0x2 - 0x1,
              vx: Math[xE(0x4a5)]() * 0.03 + 0.02,
              size: Math[xE(0x4a5)]() * 0.2 + 0.2,
            });
          }
          const rM = this[xE(0x445)] * 0x2,
            rN = Math[xE(0xe6f)](this[xE(0x445)] * 0.1, 0x4),
            rO = rI[xE(0x442)];
          (rI[xE(0x756)] = rJ), rI[xE(0x936)]();
          for (let rP = rK - 0x1; rP >= 0x0; rP--) {
            const rQ = this[xE(0x58d)][rP];
            rQ["x"] += rQ["vx"];
            const rR = rQ["x"] * rM,
              rS = this[xE(0x67e)] * rR,
              rT = rQ["y"] * rS,
              rU =
                Math[xE(0x8df)](0x1 - Math[xE(0x54a)](rT) / rS, 0.2) *
                Math[xE(0x8df)](0x1 - rR / rM, 0.2);
            if (rQ["x"] >= 0x1 || rU < 0.001) {
              this[xE(0x58d)][xE(0x650)](rP, 0x1);
              continue;
            }
            (rI[xE(0x442)] = rU * rO * 0.5),
              rI[xE(0x936)](),
              rI[xE(0xb0a)](
                rR,
                rT,
                rQ[xE(0x445)] * rS + rN,
                0x0,
                Math["PI"] * 0x2
              ),
              rI[xE(0x64e)]();
          }
        }
        [ux(0x416)](rI) {
          const xF = ux;
          rI[xF(0x70b)](this[xF(0x445)] / 0x46),
            rI[xF(0x317)](-Math["PI"] / 0x2);
          const rJ = pQ / 0xc8;
          (rI[xF(0x9b8)] = 0x14),
            (rI[xF(0x744)] = xF(0x775)),
            (rI[xF(0x339)] = rI[xF(0x5ce)] = xF(0xcec)),
            (rI[xF(0x756)] = this[xF(0xb66)](xF(0xecc)));
          if (!![]) {
            this[xF(0xd03)](rI);
            return;
          }
          const rK = 0x2;
          for (let rL = 0x1; rL <= rK; rL++) {
            rI[xF(0x70a)]();
            let rM = 0x1 - rL / rK;
            (rM *= 0x1 + Math[xF(0x4ce)](rJ + rL) * 0.5),
              (rM = 0x1 + rM * 0.5),
              (rI[xF(0x442)] *= Math[xF(0x8df)](rL / rK, 0x2)),
              rI[xF(0xd3a)](rM, rM),
              rL !== rK &&
                ((rI[xF(0x442)] *= 0.7),
                (rI[xF(0x624)] = xF(0x706)),
                (rI[xF(0xe63)] = xF(0xa6a))),
              this[xF(0xd03)](rI),
              rI[xF(0xdea)]();
          }
        }
        [ux(0x8e1)](rI, rJ = 0xbe) {
          const xG = ux;
          rI[xG(0x70a)](),
            rI[xG(0x936)](),
            rI[xG(0xba7)](0x0, -0x46 + rJ + 0x1e),
            rI[xG(0xce8)](0x1a, -0x46 + rJ),
            rI[xG(0xce8)](0xd, -0x46),
            rI[xG(0xce8)](-0xd, -0x46),
            rI[xG(0xce8)](-0x1a, -0x46 + rJ),
            rI[xG(0xce8)](0x0, -0x46 + rJ + 0x1e),
            rI[xG(0xc11)](),
            rI[xG(0x64e)](),
            rI[xG(0x976)](),
            rI[xG(0xdea)](),
            rI[xG(0x70a)](),
            rI[xG(0x936)](),
            rI[xG(0xba7)](-0x12, -0x46),
            rI[xG(0x38c)](-0x5, -0x50, -0xa, -0x69),
            rI[xG(0xa6e)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rI[xG(0x38c)](0x5, -0x50, 0x12, -0x46),
            rI[xG(0x38c)](0x0, -0x3c, -0x12, -0x46),
            rI[xG(0x7ce)](),
            this[xG(0x7d1)]
              ? ((rI[xG(0x756)] = this[xG(0xb66)](xG(0x1f5))),
                (rI[xG(0x744)] = this[xG(0xb66)](xG(0x6d1))))
              : (rI[xG(0x744)] = this[xG(0xb66)](xG(0x810))),
            rI[xG(0x64e)](),
            (rI[xG(0x9b8)] = 0xa),
            rI[xG(0x976)](),
            rI[xG(0xdea)]();
        }
        [ux(0xd03)](rI) {
          const xH = ux;
          rI[xH(0x70a)](), rI[xH(0x936)]();
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            rI[xH(0xba7)](0x14, -0x1e),
              rI[xH(0x38c)](0x5a, -0xa, 0x32, -0x32),
              rI[xH(0xce8)](0xa0, -0x32),
              rI[xH(0x38c)](0x8c, 0x3c, 0x14, 0x0),
              rI[xH(0xd3a)](-0x1, 0x1);
          }
          rI[xH(0xc11)](),
            rI[xH(0x64e)](),
            rI[xH(0x976)](),
            rI[xH(0xdea)](),
            this[xH(0x8e1)](rI),
            rI[xH(0x70a)](),
            rI[xH(0x936)](),
            rI[xH(0xb0a)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rI[xH(0xce8)](-0x32, 0x1e),
            rI[xH(0xce8)](-0x1e, 0x1e),
            rI[xH(0xce8)](-0x1f, 0x32),
            rI[xH(0xce8)](0x1f, 0x32),
            rI[xH(0xce8)](0x1e, 0x1e),
            rI[xH(0xce8)](0x32, 0x1e),
            rI[xH(0xce8)](0x32, 0x0),
            rI[xH(0x64e)](),
            rI[xH(0xc11)](),
            rI[xH(0x976)](),
            rI[xH(0x936)](),
            rI[xH(0x486)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rI[xH(0x486)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rI[xH(0x756)] = rI[xH(0x744)]),
            rI[xH(0x64e)](),
            rI[xH(0xdea)]();
        }
        [ux(0x7d6)](rI) {
          const xI = ux;
          rI[xI(0x70b)](this[xI(0x445)] / 0x64), (rI[xI(0x744)] = xI(0x5b4));
          const rJ = this[xI(0xb66)](xI(0xdb7)),
            rK = this[xI(0xb66)](xI(0x7c5));
          (this[xI(0xdf8)] += (pR / 0x12c) * (this[xI(0x586)] ? 0x1 : -0x1)),
            (this[xI(0xdf8)] = Math[xI(0xeeb)](
              0x1,
              Math[xI(0xe6f)](0x0, this[xI(0xdf8)])
            ));
          const rL = this[xI(0x7ef)] ? 0x1 : this[xI(0xdf8)],
            rM = 0x1 - rL;
          rI[xI(0x70a)](),
            rI[xI(0x936)](),
            rI[xI(0x94b)](
              (0x30 +
                (Math[xI(0x4ce)](this[xI(0xd3f)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rL +
                (0x1 - rL) * -0x14,
              0x0
            ),
            rI[xI(0xd3a)](1.1, 1.1),
            rI[xI(0xba7)](0x0, -0xa),
            rI[xI(0xa6e)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rI[xI(0x756)] = rK),
            rI[xI(0x64e)](),
            (rI[xI(0x5ce)] = xI(0xcec)),
            (rI[xI(0x9b8)] = 0x1c),
            rI[xI(0xc11)](),
            rI[xI(0x976)](),
            rI[xI(0xdea)]();
          for (let rN = 0x0; rN < 0x2; rN++) {
            const rO = Math[xI(0x4ce)](this[xI(0xd3f)] * 0x1);
            rI[xI(0x70a)]();
            const rP = rN * 0x2 - 0x1;
            rI[xI(0xd3a)](0x1, rP),
              rI[xI(0x94b)](0x32 * rL - rM * 0xa, 0x50 * rL),
              rI[xI(0x317)](rO * 0.2 + 0.3 - rM * 0x1),
              rI[xI(0x936)](),
              rI[xI(0xba7)](0xa, -0xa),
              rI[xI(0x38c)](0x1e, 0x28, -0x14, 0x50),
              rI[xI(0x38c)](0xa, 0x1e, -0xf, 0x0),
              (rI[xI(0x744)] = rJ),
              (rI[xI(0x9b8)] = 0x2c),
              (rI[xI(0x339)] = rI[xI(0x5ce)] = xI(0xcec)),
              rI[xI(0x976)](),
              (rI[xI(0x9b8)] -= 0x1c),
              (rI[xI(0x756)] = rI[xI(0x744)] = rK),
              rI[xI(0x64e)](),
              rI[xI(0x976)](),
              rI[xI(0xdea)]();
          }
          for (let rQ = 0x0; rQ < 0x2; rQ++) {
            const rR = Math[xI(0x4ce)](this[xI(0xd3f)] * 0x1 + 0x1);
            rI[xI(0x70a)]();
            const rS = rQ * 0x2 - 0x1;
            rI[xI(0xd3a)](0x1, rS),
              rI[xI(0x94b)](-0x41 * rL, 0x32 * rL),
              rI[xI(0x317)](rR * 0.3 + 1.3),
              rI[xI(0x936)](),
              rI[xI(0xba7)](0xc, -0x5),
              rI[xI(0x38c)](0x28, 0x1e, 0x0, 0x3c),
              rI[xI(0x38c)](0x14, 0x1e, 0x0, 0x0),
              (rI[xI(0x744)] = rJ),
              (rI[xI(0x9b8)] = 0x2c),
              (rI[xI(0x339)] = rI[xI(0x5ce)] = xI(0xcec)),
              rI[xI(0x976)](),
              (rI[xI(0x9b8)] -= 0x1c),
              (rI[xI(0x756)] = rI[xI(0x744)] = rK),
              rI[xI(0x976)](),
              rI[xI(0x64e)](),
              rI[xI(0xdea)]();
          }
          this[xI(0x645)](rI);
        }
        [ux(0x645)](rI, rJ = 0x1) {
          const xJ = ux;
          rI[xJ(0x936)](),
            rI[xJ(0xb0a)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rI[xJ(0x744)] = xJ(0x5b4)),
            (rI[xJ(0x756)] = this[xJ(0xb66)](xJ(0x4a2))),
            rI[xJ(0x64e)](),
            (rI[xJ(0x9b8)] = 0x1e * rJ),
            rI[xJ(0x70a)](),
            rI[xJ(0xc11)](),
            rI[xJ(0x976)](),
            rI[xJ(0xdea)](),
            rI[xJ(0x70a)](),
            rI[xJ(0x936)](),
            rI[xJ(0xb0a)](
              0x0,
              0x0,
              0x64 - rI[xJ(0x9b8)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rI[xJ(0xc11)](),
            rI[xJ(0x936)]();
          for (let rK = 0x0; rK < 0x6; rK++) {
            const rL = (rK / 0x6) * Math["PI"] * 0x2;
            rI[xJ(0xce8)](
              Math[xJ(0x5a6)](rL) * 0x28,
              Math[xJ(0x4ce)](rL) * 0x28
            );
          }
          rI[xJ(0x7ce)]();
          for (let rM = 0x0; rM < 0x6; rM++) {
            const rN = (rM / 0x6) * Math["PI"] * 0x2,
              rO = Math[xJ(0x5a6)](rN) * 0x28,
              rP = Math[xJ(0x4ce)](rN) * 0x28;
            rI[xJ(0xba7)](rO, rP), rI[xJ(0xce8)](rO * 0x3, rP * 0x3);
          }
          (rI[xJ(0x9b8)] = 0x10 * rJ),
            (rI[xJ(0x339)] = rI[xJ(0x5ce)] = xJ(0xcec)),
            rI[xJ(0x976)](),
            rI[xJ(0xdea)]();
        }
        [ux(0x3e0)](rI) {
          const xK = ux;
          rI[xK(0x70b)](this[xK(0x445)] / 0x82);
          let rJ, rK;
          const rL = 0x2d,
            rM = lq(
              this[xK(0xa9f)] ||
                (this[xK(0xa9f)] = this[xK(0x7ef)]
                  ? 0x28
                  : Math[xK(0x4a5)]() * 0x3e8)
            );
          let rN = rM() * 6.28;
          const rO = Date[xK(0x296)]() / 0xc8,
            rP = [xK(0x230), xK(0xd71)][xK(0x696)]((rQ) => this[xK(0xb66)](rQ));
          for (let rQ = 0x0; rQ <= rL; rQ++) {
            (rQ % 0x5 === 0x0 || rQ === rL) &&
              (rQ > 0x0 &&
                ((rI[xK(0x9b8)] = 0x19),
                (rI[xK(0x5ce)] = rI[xK(0x339)] = xK(0xcec)),
                (rI[xK(0x744)] = rP[0x1]),
                rI[xK(0x976)](),
                (rI[xK(0x9b8)] = 0xc),
                (rI[xK(0x744)] = rP[0x0]),
                rI[xK(0x976)]()),
              rQ !== rL && (rI[xK(0x936)](), rI[xK(0xba7)](rJ, rK)));
            let rR = rQ / 0x32;
            (rR *= rR), (rN += (0.3 + rM() * 0.8) * 0x3);
            const rS = 0x14 + Math[xK(0x4ce)](rR * 3.14) * 0x6e,
              rT = Math[xK(0x4ce)](rQ + rO) * 0.5,
              rU = Math[xK(0x5a6)](rN + rT) * rS,
              rV = Math[xK(0x4ce)](rN + rT) * rS,
              rW = rU - rJ,
              rX = rV - rK;
            rI[xK(0x38c)]((rJ + rU) / 0x2 + rX, (rK + rV) / 0x2 - rW, rU, rV),
              (rJ = rU),
              (rK = rV);
          }
        }
        [ux(0x609)](rI) {
          const xL = ux;
          rI[xL(0x70b)](this[xL(0x445)] / 0x6e),
            (rI[xL(0x744)] = xL(0x5b4)),
            (rI[xL(0x9b8)] = 0x1c),
            rI[xL(0x936)](),
            rI[xL(0xb0a)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rI[xL(0x756)] = this[xL(0xb66)](xL(0x95d))),
            rI[xL(0x64e)](),
            rI[xL(0x70a)](),
            rI[xL(0xc11)](),
            rI[xL(0x976)](),
            rI[xL(0xdea)](),
            rI[xL(0x936)](),
            rI[xL(0xb0a)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rI[xL(0x756)] = xL(0x38a)),
            rI[xL(0x64e)](),
            rI[xL(0x70a)](),
            rI[xL(0xc11)](),
            rI[xL(0x976)](),
            rI[xL(0xdea)]();
          const rJ = lq(
              this[xL(0xe70)] ||
                (this[xL(0xe70)] = this[xL(0x7ef)]
                  ? 0x1e
                  : Math[xL(0x4a5)]() * 0x3e8)
            ),
            rK = this[xL(0xb66)](xL(0x3c1)),
            rL = this[xL(0xb66)](xL(0x96a));
          for (let rO = 0x0; rO < 0x3; rO++) {
            rI[xL(0x936)]();
            const rP = 0xc;
            for (let rQ = 0x0; rQ < rP; rQ++) {
              const rR = (Math["PI"] * 0x2 * rQ) / rP;
              rI[xL(0x70a)](),
                rI[xL(0x317)](rR + rJ() * 0.4),
                rI[xL(0x94b)](0x3c + rJ() * 0xa, 0x0),
                rI[xL(0xba7)](rJ() * 0x5, rJ() * 0x5),
                rI[xL(0xa6e)](
                  0x14 + rJ() * 0xa,
                  rJ() * 0x14,
                  0x28 + rJ() * 0x14,
                  rJ() * 0x1e + 0xa,
                  0x3c + rJ() * 0xa,
                  rJ() * 0xa + 0xa
                ),
                rI[xL(0xdea)]();
            }
            (rI[xL(0x339)] = rI[xL(0x5ce)] = xL(0xcec)),
              (rI[xL(0x9b8)] = 0x12 - rO * 0x2),
              (rI[xL(0x744)] = rK),
              rI[xL(0x976)](),
              (rI[xL(0x9b8)] -= 0x8),
              (rI[xL(0x744)] = rL),
              rI[xL(0x976)]();
          }
          const rM = 0x28;
          rI[xL(0x317)](-this[xL(0x88c)]),
            (rI[xL(0x756)] = this[xL(0xb66)](xL(0xc9c))),
            (rI[xL(0x744)] = this[xL(0xb66)](xL(0xee2))),
            (rI[xL(0x9b8)] = 0x9);
          const rN = this[xL(0x2fa)] * 0x6;
          for (let rS = 0x0; rS < rN; rS++) {
            const rT = ((rS - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rI[xL(0x936)](),
              rI[xL(0x486)](
                Math[xL(0x5a6)](rT) * rM,
                Math[xL(0x4ce)](rT) * rM * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rI[xL(0x64e)](),
              rI[xL(0x976)]();
          }
        }
        [ux(0x39c)](rI) {
          const xM = ux;
          rI[xM(0x317)](-this[xM(0x88c)]),
            rI[xM(0x70b)](this[xM(0x445)] / 0x3c),
            (rI[xM(0x339)] = rI[xM(0x5ce)] = xM(0xcec));
          let rJ =
            Math[xM(0x4ce)](Date[xM(0x296)]() / 0x12c + this[xM(0xd3f)] * 0.5) *
              0.5 +
            0.5;
          (rJ *= 1.5),
            rI[xM(0x936)](),
            rI[xM(0xba7)](-0x32, -0x32 - rJ * 0x3),
            rI[xM(0x38c)](0x0, -0x3c, 0x32, -0x32 - rJ * 0x3),
            rI[xM(0x38c)](0x50 - rJ * 0x3, -0xa, 0x50, 0x32),
            rI[xM(0x38c)](0x46, 0x4b, 0x28, 0x4e + rJ * 0x5),
            rI[xM(0xce8)](0x1e, 0x3c + rJ * 0x5),
            rI[xM(0x38c)](0x2d, 0x37, 0x32, 0x2d),
            rI[xM(0x38c)](0x0, 0x41, -0x32, 0x32),
            rI[xM(0x38c)](-0x2d, 0x37, -0x1e, 0x3c + rJ * 0x3),
            rI[xM(0xce8)](-0x28, 0x4e + rJ * 0x5),
            rI[xM(0x38c)](-0x46, 0x4b, -0x50, 0x32),
            rI[xM(0x38c)](-0x50 + rJ * 0x3, -0xa, -0x32, -0x32 - rJ * 0x3),
            (rI[xM(0x756)] = this[xM(0xb66)](xM(0xcda))),
            rI[xM(0x64e)](),
            (rI[xM(0x744)] = xM(0x5b4)),
            rI[xM(0x70a)](),
            rI[xM(0xc11)](),
            (rI[xM(0x9b8)] = 0xe),
            rI[xM(0x976)](),
            rI[xM(0xdea)]();
          for (let rK = 0x0; rK < 0x2; rK++) {
            rI[xM(0x70a)](),
              rI[xM(0xd3a)](rK * 0x2 - 0x1, 0x1),
              rI[xM(0x94b)](-0x22, -0x18 - rJ * 0x3),
              rI[xM(0x317)](-0.6),
              rI[xM(0xd3a)](1.3, 1.3),
              rI[xM(0x936)](),
              rI[xM(0xba7)](-0x14, 0x0),
              rI[xM(0x38c)](-0x14, -0x19, 0x0, -0x28),
              rI[xM(0x38c)](0x14, -0x19, 0x14, 0x0),
              rI[xM(0x64e)](),
              rI[xM(0xc11)](),
              (rI[xM(0x9b8)] = 0xd),
              rI[xM(0x976)](),
              rI[xM(0xdea)]();
          }
          rI[xM(0x70a)](),
            rI[xM(0x936)](),
            rI[xM(0x486)](
              0x0,
              0x1e,
              0x24 - rJ * 0x2,
              0x8 - rJ,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rI[xM(0x756)] = this[xM(0xb66)](xM(0xaa7))),
            (rI[xM(0x442)] *= 0.2),
            rI[xM(0x64e)](),
            rI[xM(0xdea)](),
            (rI[xM(0x756)] = rI[xM(0x744)] = this[xM(0xb66)](xM(0x995)));
          for (let rL = 0x0; rL < 0x2; rL++) {
            rI[xM(0x70a)](),
              rI[xM(0xd3a)](rL * 0x2 - 0x1, 0x1),
              rI[xM(0x94b)](0x19 - rJ * 0x1, 0xf - rJ * 0x3),
              rI[xM(0x317)](-0.3),
              rI[xM(0x936)](),
              rI[xM(0xb0a)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rI[xM(0x64e)](),
              rI[xM(0xdea)]();
          }
          rI[xM(0x70a)](),
            (rI[xM(0x9b8)] = 0x5),
            rI[xM(0x94b)](0x0, 0x21 - rJ * 0x1),
            rI[xM(0x936)](),
            rI[xM(0xba7)](-0xc, 0x0),
            rI[xM(0xa6e)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rI[xM(0xa6e)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rI[xM(0x976)](),
            rI[xM(0xdea)]();
        }
        [ux(0x54f)](rI) {
          const xN = ux;
          rI[xN(0x70b)](this[xN(0x445)] / 0x3c),
            rI[xN(0x317)](-Math["PI"] / 0x2),
            rI[xN(0x936)](),
            rI[xN(0xba7)](0x32, 0x50),
            rI[xN(0x38c)](0x1e, 0x1e, 0x32, -0x14),
            rI[xN(0x38c)](0x5a, -0x64, 0x0, -0x64),
            rI[xN(0x38c)](-0x5a, -0x64, -0x32, -0x14),
            rI[xN(0x38c)](-0x1e, 0x1e, -0x32, 0x50),
            (rI[xN(0x756)] = this[xN(0xb66)](xN(0x7b1))),
            rI[xN(0x64e)](),
            (rI[xN(0x5ce)] = rI[xN(0x339)] = xN(0xcec)),
            (rI[xN(0x9b8)] = 0x14),
            rI[xN(0xc11)](),
            (rI[xN(0x744)] = xN(0x5b4)),
            rI[xN(0x976)](),
            (rI[xN(0x756)] = this[xN(0xb66)](xN(0xe0a)));
          const rJ = 0x6;
          rI[xN(0x936)](), rI[xN(0xba7)](-0x32, 0x50);
          for (let rK = 0x0; rK < rJ; rK++) {
            const rL = (((rK + 0.5) / rJ) * 0x2 - 0x1) * 0x32,
              rM = (((rK + 0x1) / rJ) * 0x2 - 0x1) * 0x32;
            rI[xN(0x38c)](rL, 0x1e, rM, 0x50);
          }
          (rI[xN(0x9b8)] = 0x8),
            rI[xN(0x64e)](),
            rI[xN(0x976)](),
            (rI[xN(0x744)] = rI[xN(0x756)] = xN(0x5b4)),
            rI[xN(0x70a)](),
            rI[xN(0x94b)](0x0, -0x5),
            rI[xN(0x936)](),
            rI[xN(0xba7)](0x0, 0x0),
            rI[xN(0xa6e)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rI[xN(0x976)](),
            rI[xN(0xdea)]();
          for (let rN = 0x0; rN < 0x2; rN++) {
            rI[xN(0x70a)](),
              rI[xN(0xd3a)](rN * 0x2 - 0x1, 0x1),
              rI[xN(0x94b)](0x19, -0x38),
              rI[xN(0x936)](),
              rI[xN(0xb0a)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rI[xN(0xc11)](),
              (rI[xN(0x9b8)] = 0xf),
              rI[xN(0x976)](),
              rI[xN(0x64e)](),
              rI[xN(0xdea)]();
          }
        }
        [ux(0x479)](rI) {
          const xO = ux;
          rI[xO(0x70b)](this[xO(0x445)] / 0x32),
            (rI[xO(0x744)] = xO(0x5b4)),
            (rI[xO(0x9b8)] = 0x10);
          const rJ = 0x7;
          rI[xO(0x936)]();
          const rK = 0x12;
          rI[xO(0x756)] = this[xO(0xb66)](xO(0x5c0));
          const rL = Math[xO(0x4ce)](pQ / 0x258);
          for (let rM = 0x0; rM < 0x2; rM++) {
            const rN = 1.2 - rM * 0.2;
            for (let rO = 0x0; rO < rJ; rO++) {
              rI[xO(0x70a)](),
                rI[xO(0x317)](
                  (rO / rJ) * Math["PI"] * 0x2 + (rM / rJ) * Math["PI"]
                ),
                rI[xO(0x94b)](0x2e, 0x0),
                rI[xO(0xd3a)](rN, rN);
              const rP = Math[xO(0x4ce)](rL + rO * 0.05 * (0x1 - rM * 0.5));
              rI[xO(0x936)](),
                rI[xO(0xba7)](0x0, rK),
                rI[xO(0x38c)](0x14, rK, 0x28 + rP, 0x0 + rP * 0x5),
                rI[xO(0x38c)](0x14, -rK, 0x0, -rK),
                rI[xO(0x64e)](),
                rI[xO(0xc11)](),
                rI[xO(0x976)](),
                rI[xO(0xdea)]();
            }
          }
          rI[xO(0x936)](),
            rI[xO(0xb0a)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rI[xO(0x756)] = this[xO(0xb66)](xO(0x507))),
            rI[xO(0x64e)](),
            rI[xO(0xc11)](),
            (rI[xO(0x9b8)] = 0x19),
            rI[xO(0x976)]();
        }
        [ux(0xb5e)](rI) {
          const xP = ux;
          rI[xP(0x70b)](this[xP(0x445)] / 0x28);
          let rJ = this[xP(0xd3f)];
          const rK = this[xP(0x7ef)] ? 0x0 : Math[xP(0x4ce)](pQ / 0x64) * 0xf;
          (rI[xP(0x339)] = rI[xP(0x5ce)] = xP(0xcec)),
            rI[xP(0x936)](),
            rI[xP(0x70a)]();
          const rL = 0x3;
          for (let rM = 0x0; rM < 0x2; rM++) {
            const rN = rM === 0x0 ? 0x1 : -0x1;
            for (let rO = 0x0; rO <= rL; rO++) {
              rI[xP(0x70a)](), rI[xP(0xba7)](0x0, 0x0);
              const rP = Math[xP(0x4ce)](rJ + rO + rM);
              rI[xP(0x317)](((rO / rL) * 0x2 - 0x1) * 0.6 + 1.4 + rP * 0.15),
                rI[xP(0xce8)](0x2d + rN * rK, 0x0),
                rI[xP(0x317)](0.2 + (rP * 0.5 + 0.5) * 0.1),
                rI[xP(0xce8)](0x4b, 0x0),
                rI[xP(0xdea)]();
            }
            rI[xP(0xd3a)](0x1, -0x1);
          }
          rI[xP(0xdea)](),
            (rI[xP(0x9b8)] = 0x8),
            (rI[xP(0x744)] = this[xP(0xb66)](xP(0xb86))),
            rI[xP(0x976)](),
            rI[xP(0x70a)](),
            rI[xP(0x94b)](0x0, rK),
            this[xP(0x488)](rI),
            rI[xP(0xdea)]();
        }
        [ux(0x488)](rI, rJ = ![]) {
          const xQ = ux;
          (rI[xQ(0x339)] = rI[xQ(0x5ce)] = xQ(0xcec)),
            rI[xQ(0x317)](-0.15),
            rI[xQ(0x936)](),
            rI[xQ(0xba7)](-0x32, 0x0),
            rI[xQ(0xce8)](0x28, 0x0),
            rI[xQ(0xba7)](0xf, 0x0),
            rI[xQ(0xce8)](-0x5, 0x19),
            rI[xQ(0xba7)](-0x3, 0x0),
            rI[xQ(0xce8)](0xc, -0x14),
            rI[xQ(0xba7)](-0xe, -0x5),
            rI[xQ(0xce8)](-0x2e, -0x17),
            (rI[xQ(0x9b8)] = 0x1c),
            (rI[xQ(0x744)] = this[xQ(0xb66)](xQ(0xb94))),
            rI[xQ(0x976)](),
            (rI[xQ(0x744)] = this[xQ(0xb66)](xQ(0xd84))),
            (rI[xQ(0x9b8)] -= rJ ? 0xf : 0xa),
            rI[xQ(0x976)]();
        }
        [ux(0x96b)](rI) {
          const xR = ux;
          rI[xR(0x70b)](this[xR(0x445)] / 0x64),
            rI[xR(0x936)](),
            rI[xR(0xb0a)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rI[xR(0x756)] = this[xR(0xb66)](xR(0x363))),
            rI[xR(0x64e)](),
            rI[xR(0xc11)](),
            (rI[xR(0x9b8)] = this[xR(0x7d1)] ? 0x32 : 0x1e),
            (rI[xR(0x744)] = xR(0x5b4)),
            rI[xR(0x976)]();
          if (!this[xR(0xcf6)]) {
            const rJ = new Path2D(),
              rK = this[xR(0x7d1)] ? 0x2 : 0x3;
            for (let rL = 0x0; rL <= rK; rL++) {
              for (let rM = 0x0; rM <= rK; rM++) {
                const rN =
                    ((rM / rK + Math[xR(0x4a5)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rL % 0x2 === 0x0 ? -0x14 : 0x0),
                  rO = ((rL / rK + Math[xR(0x4a5)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rP = Math[xR(0x4a5)]() * 0xd + (this[xR(0x7d1)] ? 0xe : 0x7);
                rJ[xR(0xba7)](rN, rO),
                  rJ[xR(0xb0a)](rN, rO, rP, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xR(0xcf6)] = rJ;
          }
          rI[xR(0x936)](),
            rI[xR(0xb0a)](
              0x0,
              0x0,
              0x64 - rI[xR(0x9b8)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rI[xR(0xc11)](),
            (rI[xR(0x756)] = xR(0xc99)),
            rI[xR(0x64e)](this[xR(0xcf6)]);
        }
        [ux(0x54d)](rI) {
          const xS = ux;
          rI[xS(0x70b)](this[xS(0x445)] / 0x64),
            rI[xS(0x70a)](),
            rI[xS(0x94b)](-0xf5, -0xdc),
            (rI[xS(0x744)] = this[xS(0xb66)](xS(0x6e9))),
            (rI[xS(0x756)] = this[xS(0xb66)](xS(0xf28))),
            (rI[xS(0x9b8)] = 0xf),
            (rI[xS(0x5ce)] = rI[xS(0x339)] = xS(0xcec));
          const rJ = !this[xS(0x7d1)];
          if (rJ) {
            rI[xS(0x70a)](),
              rI[xS(0x94b)](0x10e, 0xde),
              rI[xS(0x70a)](),
              rI[xS(0x317)](-0.1);
            for (let rK = 0x0; rK < 0x3; rK++) {
              rI[xS(0x936)](),
                rI[xS(0xba7)](-0x5, 0x0),
                rI[xS(0x38c)](0x0, 0x28, 0x5, 0x0),
                rI[xS(0x976)](),
                rI[xS(0x64e)](),
                rI[xS(0x94b)](0x28, 0x0);
            }
            rI[xS(0xdea)](), rI[xS(0x94b)](0x17, 0x32), rI[xS(0x317)](0.05);
            for (let rL = 0x0; rL < 0x2; rL++) {
              rI[xS(0x936)](),
                rI[xS(0xba7)](-0x5, 0x0),
                rI[xS(0x38c)](0x0, -0x28, 0x5, 0x0),
                rI[xS(0x976)](),
                rI[xS(0x64e)](),
                rI[xS(0x94b)](0x28, 0x0);
            }
            rI[xS(0xdea)]();
          }
          rI[xS(0x64e)](ln),
            rI[xS(0x976)](ln),
            rI[xS(0x64e)](lo),
            rI[xS(0x976)](lo),
            rI[xS(0xdea)](),
            rJ &&
              (rI[xS(0x936)](),
              rI[xS(0xb0a)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rI[xS(0xb0a)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rI[xS(0x756)] = xS(0x5b4)),
              rI[xS(0x64e)]());
        }
        [ux(0x8e0)](rI) {
          const xT = ux;
          rI[xT(0x70b)](this[xT(0x445)] / 0x46), rI[xT(0x70a)]();
          !this[xT(0x7d1)] && rI[xT(0x317)](Math["PI"] / 0x2);
          rI[xT(0x94b)](0x0, 0x2d),
            rI[xT(0x936)](),
            rI[xT(0xba7)](0x0, -0x64),
            rI[xT(0xa6e)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rI[xT(0xa6e)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rI[xT(0x339)] = rI[xT(0x5ce)] = xT(0xcec)),
            (rI[xT(0x9b8)] = 0x3c),
            (rI[xT(0x744)] = this[xT(0xb66)](xT(0x22c))),
            rI[xT(0x976)](),
            (rI[xT(0x9b8)] -= this[xT(0x7d1)] ? 0x23 : 0x14),
            (rI[xT(0x756)] = rI[xT(0x744)] = this[xT(0xb66)](xT(0xeb3))),
            rI[xT(0x976)](),
            (rI[xT(0x9b8)] -= this[xT(0x7d1)] ? 0x16 : 0xf),
            (rI[xT(0x756)] = rI[xT(0x744)] = this[xT(0xb66)](xT(0xe5a))),
            rI[xT(0x976)](),
            rI[xT(0x64e)](),
            rI[xT(0x94b)](0x0, -0x24);
          if (this[xT(0x7d1)]) rI[xT(0x70b)](0.9);
          rI[xT(0x936)](),
            rI[xT(0x486)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rI[xT(0x756)] = this[xT(0xb66)](xT(0xd15))),
            rI[xT(0x64e)](),
            rI[xT(0xc11)](),
            (rI[xT(0x9b8)] = 0xd),
            (rI[xT(0x744)] = xT(0x5b4)),
            rI[xT(0x976)](),
            rI[xT(0x936)](),
            rI[xT(0x486)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rI[xT(0x756)] = xT(0x401)),
            rI[xT(0x64e)](),
            rI[xT(0xdea)]();
        }
        [ux(0xf1d)](rI) {
          const xU = ux;
          rI[xU(0x70b)](this[xU(0x445)] / 0x19);
          !this[xU(0x7ef)] &&
            this[xU(0x7d1)] &&
            rI[xU(0x317)](Math[xU(0x4ce)](pQ / 0x64 + this["id"]) * 0.15);
          rI[xU(0x936)](),
            rI[xU(0x97c)](-0x16, -0x16, 0x2c, 0x2c),
            (rI[xU(0x756)] = this[xU(0xb66)](xU(0x88e))),
            rI[xU(0x64e)](),
            (rI[xU(0x9b8)] = 0x6),
            (rI[xU(0x5ce)] = xU(0xcec)),
            (rI[xU(0x744)] = this[xU(0xb66)](xU(0xf28))),
            rI[xU(0x976)](),
            rI[xU(0x936)]();
          const rJ = this[xU(0x7ef)] ? 0x1 : 0x1 - Math[xU(0x4ce)](pQ / 0x1f4),
            rK = rO(0x0, 0.25),
            rL = 0x1 - rO(0.25, 0.25),
            rM = rO(0.5, 0.25),
            rN = rO(0.75, 0.25);
          function rO(rP, rQ) {
            const xV = xU;
            return Math[xV(0xeeb)](0x1, Math[xV(0xe6f)](0x0, (rJ - rP) / rQ));
          }
          rI[xU(0x317)]((rL * Math["PI"]) / 0x4);
          for (let rP = 0x0; rP < 0x2; rP++) {
            const rQ = (rP * 0x2 - 0x1) * 0x7 * rN;
            for (let rR = 0x0; rR < 0x3; rR++) {
              let rS = rK * (-0xb + rR * 0xb);
              rI[xU(0xba7)](rS, rQ),
                rI[xU(0xb0a)](rS, rQ, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rI[xU(0x756)] = this[xU(0xb66)](xU(0x40a))), rI[xU(0x64e)]();
        }
        [ux(0x989)](rI) {
          const xW = ux;
          rI[xW(0x70a)](),
            rI[xW(0x94b)](this["x"], this["y"]),
            this[xW(0x654)](rI),
            rI[xW(0x317)](this[xW(0x88c)]),
            (rI[xW(0x9b8)] = 0x8);
          const rJ = (rO, rP) => {
              const xX = xW;
              (rL = this[xX(0x445)] / 0x14),
                rI[xX(0xd3a)](rL, rL),
                rI[xX(0x936)](),
                rI[xX(0xb0a)](0x0, 0x0, 0x14, 0x0, l1),
                (rI[xX(0x756)] = this[xX(0xb66)](rO)),
                rI[xX(0x64e)](),
                (rI[xX(0x744)] = this[xX(0xb66)](rP)),
                rI[xX(0x976)]();
            },
            rK = (rO, rP, rQ) => {
              const xY = xW;
              (rO = l9[rO]),
                rI[xY(0xd3a)](this[xY(0x445)], this[xY(0x445)]),
                (rI[xY(0x9b8)] /= this[xY(0x445)]),
                (rI[xY(0x744)] = this[xY(0xb66)](rQ)),
                rI[xY(0x976)](rO),
                (rI[xY(0x756)] = this[xY(0xb66)](rP)),
                rI[xY(0x64e)](rO);
            };
          let rL, rM, rN;
          switch (this[xW(0x307)]) {
            case cR[xW(0xf1d)]:
            case cR[xW(0xd91)]:
              this[xW(0xf1d)](rI);
              break;
            case cR[xW(0x8e0)]:
            case cR[xW(0xdde)]:
              this[xW(0x8e0)](rI);
              break;
            case cR[xW(0xae5)]:
              (rI[xW(0x744)] = xW(0x5b4)),
                (rI[xW(0x9b8)] = 0x14),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0xecc))),
                rI[xW(0x94b)](-this[xW(0x445)], 0x0),
                rI[xW(0x317)](-Math["PI"] / 0x2),
                rI[xW(0x70b)](0.5),
                rI[xW(0x94b)](0x0, 0x46),
                this[xW(0x8e1)](rI, this[xW(0x445)] * 0x4);
              break;
            case cR[xW(0x416)]:
              this[xW(0x416)](rI);
              break;
            case cR[xW(0xace)]:
              this[xW(0x54d)](rI);
              break;
            case cR[xW(0x54d)]:
              this[xW(0x54d)](rI);
              break;
            case cR[xW(0x96b)]:
            case cR[xW(0xd02)]:
              this[xW(0x96b)](rI);
              break;
            case cR[xW(0x25f)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x1e), this[xW(0x488)](rI, !![]);
              break;
            case cR[xW(0xb5e)]:
              this[xW(0xb5e)](rI);
              break;
            case cR[xW(0x1d2)]:
              (rI[xW(0x9b8)] *= 0.7),
                rK(xW(0xb25), xW(0x5c0), xW(0xf34)),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0.6, 0x0, l1),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x507))),
                rI[xW(0x64e)](),
                rI[xW(0xc11)](),
                (rI[xW(0x744)] = xW(0x94c)),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x479)]:
              this[xW(0x479)](rI);
              break;
            case cR[xW(0x8f7)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x16),
                rI[xW(0x317)](Math["PI"] / 0x2),
                rI[xW(0x936)]();
              for (let sA = 0x0; sA < 0x2; sA++) {
                rI[xW(0xba7)](-0xa, -0x1e),
                  rI[xW(0xa6e)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rI[xW(0xd3a)](0x1, -0x1);
              }
              (rI[xW(0x9b8)] = 0x10),
                (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x3ac))),
                rI[xW(0x976)](),
                (rI[xW(0x9b8)] -= 0x7),
                (rI[xW(0x744)] = xW(0x527)),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x59c)]:
              this[xW(0x54f)](rI);
              break;
            case cR[xW(0x63c)]:
              this[xW(0x39c)](rI);
              break;
            case cR[xW(0x609)]:
              this[xW(0x609)](rI);
              break;
            case cR[xW(0x3e0)]:
              this[xW(0x3e0)](rI);
              break;
            case cR[xW(0x3c6)]:
              !this[xW(0x469)] &&
                ((this[xW(0x469)] = new lU(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cX[xW(0xd25)],
                  0x19
                )),
                (this[xW(0x469)][xW(0x2a0)] = !![]),
                (this[xW(0x469)][xW(0x56a)] = !![]),
                (this[xW(0x469)][xW(0xc42)] = 0x1),
                (this[xW(0x469)][xW(0x813)] = !![]),
                (this[xW(0x469)][xW(0x80e)] = xW(0xa7a)),
                (this[xW(0x469)][xW(0xe2b)] = this[xW(0xe2b)]));
              rI[xW(0x317)](Math["PI"] / 0x2),
                (this[xW(0x469)][xW(0x823)] = this[xW(0x823)]),
                (this[xW(0x469)][xW(0x445)] = this[xW(0x445)]),
                this[xW(0x469)][xW(0x989)](rI);
              break;
            case cR[xW(0x7d6)]:
              this[xW(0x7d6)](rI);
              break;
            case cR[xW(0x672)]:
              rI[xW(0x70a)](),
                rI[xW(0x70b)](this[xW(0x445)] / 0x64),
                rI[xW(0x317)]((Date[xW(0x296)]() / 0x190) % 6.28),
                this[xW(0x645)](rI, 1.5),
                rI[xW(0xdea)]();
              break;
            case cR[xW(0xe93)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x14),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x0, -0x5),
                rI[xW(0xce8)](-0x8, 0x0),
                rI[xW(0xce8)](0x0, 0x5),
                rI[xW(0xce8)](0x8, 0x0),
                rI[xW(0x7ce)](),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x20),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xa87))),
                rI[xW(0x976)](),
                (rI[xW(0x9b8)] = 0x14),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xc8d))),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xae0)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x14),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x5, -0x5),
                rI[xW(0xce8)](-0x5, 0x5),
                rI[xW(0xce8)](0x5, 0x0),
                rI[xW(0x7ce)](),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x20),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x427))),
                rI[xW(0x976)](),
                (rI[xW(0x9b8)] = 0x14),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x8dd))),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x870)]:
              this[xW(0xc4a)](rI, xW(0x51b));
              break;
            case cR[xW(0x27e)]:
              this[xW(0xc4a)](rI, xW(0xde9));
              break;
            case cR[xW(0x341)]:
              this[xW(0xc4a)](rI, xW(0x62b));
              break;
            case cR[xW(0x649)]:
              this[xW(0x649)](rI);
              break;
            case cR[xW(0x4fc)]:
              this[xW(0x4fc)](rI);
              break;
            case cR[xW(0x29a)]:
              this[xW(0x29a)](rI);
              break;
            case cR[xW(0x5b1)]:
              this[xW(0x29a)](rI, !![]);
              break;
            case cR[xW(0x223)]:
              this[xW(0x223)](rI);
              break;
            case cR[xW(0x660)]:
              this[xW(0x660)](rI);
              break;
            case cR[xW(0x712)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x19),
                lF(rI, 0x19),
                (rI[xW(0x5ce)] = xW(0xcec)),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x205))),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xb32))),
                rI[xW(0x64e)](),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xa44)]:
              rI[xW(0x94b)](-this[xW(0x445)], 0x0);
              const rO = Date[xW(0x296)]() / 0x32,
                rP = this[xW(0x445)] * 0x2;
              rI[xW(0x936)]();
              const rQ = 0x32;
              for (let sB = 0x0; sB < rQ; sB++) {
                const sC = sB / rQ,
                  sD = sC * Math["PI"] * (this[xW(0x7ef)] ? 7.75 : 0xa) - rO,
                  sE = sC * rP,
                  sF = sE * this[xW(0x67e)];
                rI[xW(0xce8)](sE, Math[xW(0x4ce)](sD) * sF);
              }
              (rI[xW(0x744)] = xW(0xaf3)),
                (rI[xW(0x5ce)] = rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x4),
                (rI[xW(0xd65)] = xW(0x667)),
                (rI[xW(0xb3c)] = this[xW(0x7ef)] ? 0xa : 0x14),
                rI[xW(0x976)](),
                rI[xW(0x976)](),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xcc3)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x37), this[xW(0x533)](rI);
              break;
            case cR[xW(0xc70)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x14), rI[xW(0x936)]();
              for (let sG = 0x0; sG < 0x2; sG++) {
                rI[xW(0xba7)](-0x17, -0x5),
                  rI[xW(0x38c)](0x0, 5.5, 0x17, -0x5),
                  rI[xW(0xd3a)](0x1, -0x1);
              }
              (rI[xW(0x9b8)] = 0xf),
                (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xf28))),
                rI[xW(0x976)](),
                (rI[xW(0x9b8)] -= 0x6),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x88e))),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xdca)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x23),
                rI[xW(0x936)](),
                rI[xW(0x486)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0xd9d))),
                rI[xW(0x64e)](),
                rI[xW(0xc11)](),
                (rI[xW(0x744)] = xW(0x38a)),
                (rI[xW(0x9b8)] = 0x12),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x1e, 0x0),
                rI[xW(0xa6e)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rI[xW(0xa6e)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rI[xW(0x9b8)] = 0x3),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                (rI[xW(0x744)] = rI[xW(0x756)] = xW(0x8a4)),
                rI[xW(0x64e)](),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x8af)]:
              if (this[xW(0x7a6)] !== this[xW(0x829)]) {
                this[xW(0x7a6)] = this[xW(0x829)];
                const sH = new Path2D(),
                  sI = Math[xW(0xcec)](
                    this[xW(0x829)] * (this[xW(0x829)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sJ = (Math["PI"] * 0x2) / sI,
                  sK = this[xW(0x829)] < 0x64 ? 0.3 : 0.1;
                for (let sL = 0x0; sL < sI; sL++) {
                  const sM = sL * sJ,
                    sN = sM + Math[xW(0x4a5)]() * sJ,
                    sO = 0x1 - Math[xW(0x4a5)]() * sK;
                  sH[xW(0xce8)](
                    Math[xW(0x5a6)](sN) * this[xW(0x829)] * sO,
                    Math[xW(0x4ce)](sN) * this[xW(0x829)] * sO
                  );
                }
                sH[xW(0x7ce)](), (this[xW(0x9cf)] = sH);
              }
              (rL = this[xW(0x445)] / this[xW(0x829)]), rI[xW(0xd3a)](rL, rL);
              const rR = this[xW(0x80d)] ? li : [xW(0x47f), xW(0xbed)];
              (rI[xW(0x744)] = this[xW(0xb66)](rR[0x1])),
                rI[xW(0x976)](this[xW(0x9cf)]),
                (rI[xW(0x756)] = this[xW(0xb66)](rR[0x0])),
                rI[xW(0x64e)](this[xW(0x9cf)]);
              break;
            case cR[xW(0x464)]:
              if (this[xW(0x7a6)] !== this[xW(0x829)]) {
                this[xW(0x7a6)] = this[xW(0x829)];
                const sP = Math[xW(0xcec)](
                    this[xW(0x829)] > 0xc8
                      ? this[xW(0x829)] * 0.18
                      : this[xW(0x829)] * 0.25
                  ),
                  sQ = 0.5,
                  sR = 0.85;
                this[xW(0x9cf)] = lb(sP, this[xW(0x829)], sQ, sR);
                if (this[xW(0x829)] < 0x12c) {
                  const sS = new Path2D(),
                    sT = sP * 0x2;
                  for (let sU = 0x0; sU < sT; sU++) {
                    const sV = ((sU + 0x1) / sT) * Math["PI"] * 0x2;
                    let sW = (sU % 0x2 === 0x0 ? 0.7 : 1.2) * this[xW(0x829)];
                    sS[xW(0xce8)](
                      Math[xW(0x5a6)](sV) * sW,
                      Math[xW(0x4ce)](sV) * sW
                    );
                  }
                  sS[xW(0x7ce)](), (this[xW(0x604)] = sS);
                } else this[xW(0x604)] = null;
              }
              (rL = this[xW(0x445)] / this[xW(0x829)]), rI[xW(0xd3a)](rL, rL);
              this[xW(0x604)] &&
                ((rI[xW(0x756)] = this[xW(0xb66)](xW(0x542))),
                rI[xW(0x64e)](this[xW(0x604)]));
              (rI[xW(0x744)] = this[xW(0xb66)](xW(0xe8b))),
                rI[xW(0x976)](this[xW(0x9cf)]),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0xd44))),
                rI[xW(0x64e)](this[xW(0x9cf)]);
              break;
            case cR[xW(0x558)]:
              rI[xW(0x70a)](),
                (rL = this[xW(0x445)] / 0x28),
                rI[xW(0xd3a)](rL, rL),
                (rI[xW(0x756)] = rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec));
              for (let sX = 0x0; sX < 0x2; sX++) {
                const sY = sX === 0x0 ? 0x1 : -0x1;
                rI[xW(0x70a)](),
                  rI[xW(0x94b)](0x1c, sY * 0xd),
                  rI[xW(0x317)](
                    Math[xW(0x4ce)](this[xW(0xd3f)] * 1.24) * 0.1 * sY
                  ),
                  rI[xW(0x936)](),
                  rI[xW(0xba7)](0x0, sY * 0x6),
                  rI[xW(0xce8)](0x14, sY * 0xb),
                  rI[xW(0xce8)](0x28, 0x0),
                  rI[xW(0x38c)](0x14, sY * 0x5, 0x0, 0x0),
                  rI[xW(0x7ce)](),
                  rI[xW(0x64e)](),
                  rI[xW(0x976)](),
                  rI[xW(0xdea)]();
              }
              (rM = this[xW(0x80d)] ? li : [xW(0x8d4), xW(0x78b)]),
                (rI[xW(0x756)] = this[xW(0xb66)](rM[0x0])),
                rI[xW(0x64e)](l6),
                (rI[xW(0x9b8)] = 0x6),
                (rI[xW(0x756)] = rI[xW(0x744)] = this[xW(0xb66)](rM[0x1])),
                rI[xW(0x976)](l6),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x15, 0x0),
                rI[xW(0x38c)](0x0, -0x3, 0x15, 0x0),
                (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x7),
                rI[xW(0x976)]();
              const rS = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rI[xW(0x936)]();
              for (let sZ = 0x0; sZ < 0x2; sZ++) {
                const t0 = sZ === 0x1 ? 0x1 : -0x1;
                for (let t1 = 0x0; t1 < rS[xW(0xf30)]; t1++) {
                  let [t2, t3] = rS[t1];
                  (t3 *= t0),
                    rI[xW(0xba7)](t2, t3),
                    rI[xW(0xb0a)](t2, t3, 0x5, 0x0, l1);
                }
              }
              rI[xW(0x64e)](), rI[xW(0x64e)](), rI[xW(0xdea)]();
              break;
            case cR[xW(0xd16)]:
            case cR[xW(0x439)]:
              rI[xW(0x70a)](),
                (rL = this[xW(0x445)] / 0x28),
                rI[xW(0xd3a)](rL, rL);
              const rT = this[xW(0x307)] === cR[xW(0xd16)];
              rT &&
                (rI[xW(0x70a)](),
                rI[xW(0x94b)](-0x2d, 0x0),
                rI[xW(0x317)](Math["PI"]),
                this[xW(0x842)](rI, 0xf / 1.1),
                rI[xW(0xdea)]());
              (rM = this[xW(0x80d)]
                ? li
                : rT
                ? [xW(0xead), xW(0x49e)]
                : [xW(0x985), xW(0x538)]),
                rI[xW(0x936)](),
                rI[xW(0x486)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, l1),
                (rI[xW(0x9b8)] = 0xa),
                (rI[xW(0x744)] = this[xW(0xb66)](rM[0x1])),
                rI[xW(0x976)](),
                (rI[xW(0x756)] = this[xW(0xb66)](rM[0x0])),
                rI[xW(0x64e)](),
                rI[xW(0x70a)](),
                rI[xW(0xc11)](),
                rI[xW(0x936)]();
              const rU = [-0x1e, -0x5, 0x16];
              for (let t4 = 0x0; t4 < rU[xW(0xf30)]; t4++) {
                const t5 = rU[t4];
                rI[xW(0xba7)](t5, -0x32),
                  rI[xW(0x38c)](t5 - 0x14, 0x0, t5, 0x32);
              }
              (rI[xW(0x9b8)] = 0xe),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                rI[xW(0x976)](),
                rI[xW(0xdea)]();
              rT ? this[xW(0x202)](rI) : this[xW(0x555)](rI);
              rI[xW(0xdea)]();
              break;
            case cR[xW(0xe19)]:
              (rL = this[xW(0x445)] / 0x32), rI[xW(0xd3a)](rL, rL);
              const rV = 0x2f;
              rI[xW(0x936)]();
              for (let t6 = 0x0; t6 < 0x8; t6++) {
                let t7 =
                  (0.25 + ((t6 % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xW(0x4ce)](t6 + this[xW(0xd3f)] * 1.3) * 0.2;
                t6 >= 0x4 && (t7 *= -0x1),
                  rI[xW(0xba7)](0x0, 0x0),
                  rI[xW(0xce8)](
                    Math[xW(0x5a6)](t7) * rV,
                    Math[xW(0x4ce)](t7) * rV
                  );
              }
              (rI[xW(0x9b8)] = 0x7),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                (rI[xW(0x339)] = xW(0xcec)),
                rI[xW(0x976)](),
                (rI[xW(0x756)] = rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x6);
              for (let t8 = 0x0; t8 < 0x2; t8++) {
                const t9 = t8 === 0x0 ? 0x1 : -0x1;
                rI[xW(0x70a)](),
                  rI[xW(0x94b)](0x16, t9 * 0xa),
                  rI[xW(0x317)](
                    -(Math[xW(0x4ce)](this[xW(0xd3f)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      t9
                  ),
                  rI[xW(0x936)](),
                  rI[xW(0xba7)](0x0, t9 * 0x6),
                  rI[xW(0x38c)](0x14, t9 * 0xf, 0x28, 0x0),
                  rI[xW(0x38c)](0x14, t9 * 0x5, 0x0, 0x0),
                  rI[xW(0x7ce)](),
                  rI[xW(0x64e)](),
                  rI[xW(0x976)](),
                  rI[xW(0xdea)]();
              }
              (rI[xW(0x9b8)] = 0x8),
                la(
                  rI,
                  0x1,
                  0x8,
                  this[xW(0xb66)](xW(0xb87)),
                  this[xW(0xb66)](xW(0x990))
                );
              let rW;
              (rW = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rI[xW(0x936)]();
              for (let ta = 0x0; ta < rW[xW(0xf30)]; ta++) {
                const [tb, tc] = rW[ta];
                rI[xW(0xba7)](tb, -tc),
                  rI[xW(0x38c)](tb + Math[xW(0x98d)](tb) * 4.2, 0x0, tb, tc);
              }
              (rI[xW(0x339)] = xW(0xcec)),
                rI[xW(0x976)](),
                rI[xW(0x94b)](-0x21, 0x0),
                la(
                  rI,
                  0.45,
                  0x8,
                  this[xW(0xb66)](xW(0xdeb)),
                  this[xW(0xb66)](xW(0xa93))
                ),
                rI[xW(0x936)](),
                (rW = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let td = 0x0; td < rW[xW(0xf30)]; td++) {
                const [te, tf] = rW[td];
                rI[xW(0xba7)](te, -tf), rI[xW(0x38c)](te - 0x3, 0x0, te, tf);
              }
              (rI[xW(0x9b8)] = 0x5),
                (rI[xW(0x339)] = xW(0xcec)),
                rI[xW(0x976)](),
                rI[xW(0x94b)](0x11, 0x0),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x0, -0x9),
                rI[xW(0xce8)](0x0, 0x9),
                rI[xW(0xce8)](0xb, 0x0),
                rI[xW(0x7ce)](),
                (rI[xW(0x5ce)] = rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x6),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0xc46))),
                rI[xW(0x64e)](),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x38e)]:
              this[xW(0x24d)](rI, xW(0xedf), xW(0x510), xW(0x5fa));
              break;
            case cR[xW(0x270)]:
              this[xW(0x24d)](rI, xW(0x996), xW(0xd7b), xW(0xbf8));
              break;
            case cR[xW(0xab8)]:
              this[xW(0x24d)](rI, xW(0x69c), xW(0x353), xW(0x5fa));
              break;
            case cR[xW(0x3e1)]:
              (rL = this[xW(0x445)] / 0x46),
                rI[xW(0x70b)](rL),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0xd10))),
                rI[xW(0x64e)](ld),
                rI[xW(0xc11)](ld),
                (rI[xW(0x9b8)] = 0xf),
                (rI[xW(0x744)] = xW(0x7d2)),
                rI[xW(0x976)](ld),
                (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x7),
                (rI[xW(0x744)] = xW(0x7fc)),
                rI[xW(0x976)](le);
              break;
            case cR[xW(0x6b4)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x28),
                this[xW(0xe64)](rI, 0x32, 0x1e, 0x7);
              break;
            case cR[xW(0x78a)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x64),
                this[xW(0xe64)](rI),
                (rI[xW(0x756)] = rI[xW(0x744)]);
              const rX = 0x6,
                rY = 0x3;
              rI[xW(0x936)]();
              for (let tg = 0x0; tg < rX; tg++) {
                const th = (tg / rX) * Math["PI"] * 0x2;
                rI[xW(0x70a)](), rI[xW(0x317)](th);
                for (let ti = 0x0; ti < rY; ti++) {
                  const tj = ti / rY,
                    tk = 0x12 + tj * 0x44,
                    tl = 0x7 + tj * 0x6;
                  rI[xW(0xba7)](tk, 0x0),
                    rI[xW(0xb0a)](tk, 0x0, tl, 0x0, Math["PI"] * 0x2);
                }
                rI[xW(0xdea)]();
              }
              rI[xW(0x64e)]();
              break;
            case cR[xW(0x68f)]:
              (rL = this[xW(0x445)] / 0x31),
                rI[xW(0x70b)](rL),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                (rN = this[xW(0xd3f)] * 0x15e);
              const rZ = (Math[xW(0x4ce)](rN * 0.01) * 0.5 + 0.5) * 0.1;
              (rI[xW(0x744)] = rI[xW(0x756)] = this[xW(0xb66)](xW(0x542))),
                (rI[xW(0x9b8)] = 0x3);
              for (let tm = 0x0; tm < 0x2; tm++) {
                rI[xW(0x70a)]();
                const tn = tm * 0x2 - 0x1;
                rI[xW(0xd3a)](0x1, tn),
                  rI[xW(0x94b)](0x1c, -0x27),
                  rI[xW(0xd3a)](1.5, 1.5),
                  rI[xW(0x317)](rZ),
                  rI[xW(0x936)](),
                  rI[xW(0xba7)](0x0, 0x0),
                  rI[xW(0x38c)](0xc, -0x8, 0x14, 0x3),
                  rI[xW(0xce8)](0xb, 0x1),
                  rI[xW(0xce8)](0x11, 0x9),
                  rI[xW(0x38c)](0xc, 0x5, 0x0, 0x6),
                  rI[xW(0x7ce)](),
                  rI[xW(0x976)](),
                  rI[xW(0x64e)](),
                  rI[xW(0xdea)]();
              }
              rI[xW(0x936)]();
              for (let to = 0x0; to < 0x2; to++) {
                for (let tp = 0x0; tp < 0x4; tp++) {
                  const tq = to * 0x2 - 0x1,
                    tr =
                      (Math[xW(0x4ce)](rN * 0.005 + to + tp * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rI[xW(0x70a)](),
                    rI[xW(0xd3a)](0x1, tq),
                    rI[xW(0x94b)]((tp / 0x3) * 0x1e - 0xf, 0x28);
                  const ts = tp < 0x2 ? 0x1 : -0x1;
                  rI[xW(0x317)](tr * ts),
                    rI[xW(0xba7)](0x0, 0x0),
                    rI[xW(0x94b)](0x0, 0x19),
                    rI[xW(0xce8)](0x0, 0x0),
                    rI[xW(0x317)](ts * 0.7 * (tr + 0.3)),
                    rI[xW(0xce8)](0x0, 0xa),
                    rI[xW(0xdea)]();
                }
              }
              (rI[xW(0x9b8)] = 0xa),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x2, 0x17),
                rI[xW(0x38c)](0x17, 0x0, 0x2, -0x17),
                rI[xW(0xce8)](-0xa, -0xf),
                rI[xW(0xce8)](-0xa, 0xf),
                rI[xW(0x7ce)](),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xe16))),
                (rI[xW(0x9b8)] = 0x44),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                rI[xW(0x976)](),
                (rI[xW(0x9b8)] -= 0x12),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x67b))),
                rI[xW(0x976)](),
                (rI[xW(0x744)] = xW(0x5b4)),
                rI[xW(0x936)]();
              const s0 = 0x12;
              for (let tu = 0x0; tu < 0x2; tu++) {
                rI[xW(0xba7)](-0x12, s0),
                  rI[xW(0x38c)](0x0, -0x7 + s0, 0x12, s0),
                  rI[xW(0xd3a)](0x1, -0x1);
              }
              (rI[xW(0x9b8)] = 0x9), rI[xW(0x976)]();
              break;
            case cR[xW(0x1cf)]:
              (rL = this[xW(0x445)] / 0x50),
                rI[xW(0x70b)](rL),
                rI[xW(0x317)](
                  ((Date[xW(0x296)]() / 0x7d0) % l1) + this[xW(0xd3f)] * 0.4
                );
              const s1 = 0x5;
              !this[xW(0x241)] &&
                (this[xW(0x241)] = Array(s1)[xW(0x64e)](0x64));
              const s3 = this[xW(0x241)],
                s4 = this[xW(0x2a0)]
                  ? 0x0
                  : Math[xW(0xe3c)](this[xW(0x391)] * (s1 - 0x1));
              rI[xW(0x936)]();
              for (let tv = 0x0; tv < s1; tv++) {
                const tw = ((tv + 0.5) / s1) * Math["PI"] * 0x2,
                  tx = ((tv + 0x1) / s1) * Math["PI"] * 0x2;
                s3[tv] += ((tv < s4 ? 0x64 : 0x3c) - s3[tv]) * 0.2;
                const ty = s3[tv];
                if (tv === 0x0) rI[xW(0xba7)](ty, 0x0);
                rI[xW(0x38c)](
                  Math[xW(0x5a6)](tw) * 0x5,
                  Math[xW(0x4ce)](tw) * 0x5,
                  Math[xW(0x5a6)](tx) * ty,
                  Math[xW(0x4ce)](tx) * ty
                );
              }
              rI[xW(0x7ce)](),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x1c + 0xa),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x503))),
                rI[xW(0x976)](),
                (rI[xW(0x9b8)] = 0x10 + 0xa),
                (rI[xW(0x744)] = rI[xW(0x756)] = this[xW(0xb66)](xW(0x8e9))),
                rI[xW(0x64e)](),
                rI[xW(0x976)](),
                rI[xW(0x936)]();
              for (let tz = 0x0; tz < s1; tz++) {
                const tA = (tz / s1) * Math["PI"] * 0x2;
                rI[xW(0x70a)](), rI[xW(0x317)](tA);
                const tB = s3[tz] / 0x64;
                let tC = 0x1a;
                const tD = 0x4;
                for (let tE = 0x0; tE < tD; tE++) {
                  const tF = (0x1 - (tE / tD) * 0.7) * 0xc * tB;
                  rI[xW(0xba7)](tC, 0x0),
                    rI[xW(0xb0a)](tC, 0x0, tF, 0x0, Math["PI"] * 0x2),
                    (tC += tF * 0x2 + 3.5 * tB);
                }
                rI[xW(0xdea)]();
              }
              (rI[xW(0x756)] = xW(0xc0f)), rI[xW(0x64e)]();
              break;
            case cR[xW(0xe77)]:
              (rL = this[xW(0x445)] / 0x1e),
                rI[xW(0x70b)](rL),
                rI[xW(0x94b)](-0x22, 0x0),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x0, -0x8),
                rI[xW(0x38c)](0x9b, 0x0, 0x0, 0x8),
                rI[xW(0x7ce)](),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x1a),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x503))),
                rI[xW(0x976)](),
                (rI[xW(0x9b8)] = 0x10),
                (rI[xW(0x744)] = rI[xW(0x756)] = this[xW(0xb66)](xW(0x8e9))),
                rI[xW(0x64e)](),
                rI[xW(0x976)](),
                rI[xW(0x936)]();
              let s5 = 0xd;
              for (let tG = 0x0; tG < 0x4; tG++) {
                const tH = (0x1 - (tG / 0x4) * 0.7) * 0xa;
                rI[xW(0xba7)](s5, 0x0),
                  rI[xW(0xb0a)](s5, 0x0, tH, 0x0, Math["PI"] * 0x2),
                  (s5 += tH * 0x2 + 0x4);
              }
              (rI[xW(0x756)] = xW(0xc0f)), rI[xW(0x64e)]();
              break;
            case cR[xW(0x621)]:
              (rL = this[xW(0x445)] / 0x64),
                rI[xW(0xd3a)](rL, rL),
                (rI[xW(0x5ce)] = rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x744)] = xW(0x3d0)),
                (rI[xW(0x9b8)] = 0x14);
              const s6 = [0x1, 0.63, 0.28],
                s7 = this[xW(0x80d)] ? lp : [xW(0xa0c), xW(0x2a6), xW(0xca3)],
                s8 = (pQ * 0.005) % l1;
              for (let tI = 0x0; tI < 0x3; tI++) {
                const tJ = s6[tI],
                  tK = s7[tI];
                rI[xW(0x70a)](),
                  rI[xW(0x317)](s8 * (tI % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rI[xW(0x936)]();
                const tL = 0x7 - tI;
                for (let tM = 0x0; tM < tL; tM++) {
                  const tN = (Math["PI"] * 0x2 * tM) / tL;
                  rI[xW(0xce8)](
                    Math[xW(0x5a6)](tN) * tJ * 0x64,
                    Math[xW(0x4ce)](tN) * tJ * 0x64
                  );
                }
                rI[xW(0x7ce)](),
                  (rI[xW(0x744)] = rI[xW(0x756)] = this[xW(0xb66)](tK)),
                  rI[xW(0x64e)](),
                  rI[xW(0x976)](),
                  rI[xW(0xdea)]();
              }
              break;
            case cR[xW(0xa88)]:
              (rL = this[xW(0x445)] / 0x41),
                rI[xW(0xd3a)](rL, rL),
                (rN = this[xW(0xd3f)] * 0x2),
                rI[xW(0x317)](Math["PI"] / 0x2);
              if (this[xW(0x586)]) {
                const tO = 0x3;
                rI[xW(0x936)]();
                for (let tS = 0x0; tS < 0x2; tS++) {
                  for (let tT = 0x0; tT <= tO; tT++) {
                    const tU = (tT / tO) * 0x50 - 0x28;
                    rI[xW(0x70a)]();
                    const tV = tS * 0x2 - 0x1;
                    rI[xW(0x94b)](tV * -0x2d, tU);
                    const tW =
                      1.1 + Math[xW(0x4ce)]((tT / tO) * Math["PI"]) * 0.5;
                    rI[xW(0xd3a)](tW * tV, tW),
                      rI[xW(0x317)](Math[xW(0x4ce)](rN + tT + tV) * 0.3 + 0.3),
                      rI[xW(0xba7)](0x0, 0x0),
                      rI[xW(0x38c)](-0xf, -0x5, -0x14, 0xa),
                      rI[xW(0xdea)]();
                  }
                }
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                  (rI[xW(0x9b8)] = 0x8),
                  (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                  rI[xW(0x976)](),
                  (rI[xW(0x9b8)] = 0xc);
                const tP = Date[xW(0x296)]() * 0.01,
                  tQ = Math[xW(0x4ce)](tP * 0.5) * 0.5 + 0.5,
                  tR = tQ * 0.1 + 0x1;
                rI[xW(0x936)](),
                  rI[xW(0xb0a)](-0xf * tR, 0x2b - tQ, 0x10, 0x0, Math["PI"]),
                  rI[xW(0xb0a)](0xf * tR, 0x2b - tQ, 0x10, 0x0, Math["PI"]),
                  rI[xW(0xba7)](-0x16, -0x2b),
                  rI[xW(0xb0a)](0x0, -0x2b - tQ, 0x16, 0x0, Math["PI"], !![]),
                  (rI[xW(0x744)] = this[xW(0xb66)](xW(0xa9e))),
                  rI[xW(0x976)](),
                  (rI[xW(0x756)] = this[xW(0xb66)](xW(0x8d4))),
                  rI[xW(0x64e)](),
                  rI[xW(0x70a)](),
                  rI[xW(0x317)]((Math["PI"] * 0x3) / 0x2),
                  this[xW(0x555)](rI, 0x1a - tQ, 0x0),
                  rI[xW(0xdea)]();
              }
              if (!this[xW(0x806)]) {
                const tX = dH[d8[xW(0xefb)]],
                  tY = Math[xW(0xe6f)](this["id"] % tX[xW(0xf30)], 0x0),
                  tZ = new lO(-0x1, 0x0, 0x0, tX[tY]["id"]);
                (tZ[xW(0x256)] = 0x1),
                  (tZ[xW(0x88c)] = 0x0),
                  (this[xW(0x806)] = tZ);
              }
              rI[xW(0x70b)](1.3), this[xW(0x806)][xW(0x989)](rI);
              break;
            case cR[xW(0xa26)]:
              (rL = this[xW(0x445)] / 0x14),
                rI[xW(0xd3a)](rL, rL),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x11, 0x0),
                rI[xW(0xce8)](0x0, 0x0),
                rI[xW(0xce8)](0x11, 0x6),
                rI[xW(0xba7)](0x0, 0x0),
                rI[xW(0xce8)](0xb, -0x7),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x875))),
                (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0xc),
                rI[xW(0x976)](),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x60f))),
                (rI[xW(0x9b8)] = 0x6),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xc47)]:
              (rL = this[xW(0x445)] / 0x80),
                rI[xW(0x70b)](rL),
                rI[xW(0x94b)](-0x80, -0x78),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x2ad))),
                rI[xW(0x64e)](f8[xW(0xc82)]),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xc7f))),
                (rI[xW(0x9b8)] = 0x14),
                rI[xW(0x976)](f8[xW(0xc82)]);
              break;
            case cR[xW(0xe04)]:
              (rL = this[xW(0x445)] / 0x19),
                rI[xW(0xd3a)](rL, rL),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x19, 0x0),
                rI[xW(0xce8)](-0x2d, 0x0),
                (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x14),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x88e))),
                rI[xW(0x64e)](),
                (rI[xW(0x9b8)] = 0x7),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xdc4))),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x51d)]:
              rI[xW(0x317)](-this[xW(0x88c)]),
                rI[xW(0x70b)](this[xW(0x445)] / 0x14),
                this[xW(0x6a3)](rI),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x88e))),
                rI[xW(0x64e)](),
                rI[xW(0xc11)](),
                (rI[xW(0x9b8)] = 0xc),
                (rI[xW(0x744)] = xW(0x5b4)),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xaac)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x64), this[xW(0xa14)](rI);
              break;
            case cR[xW(0xdba)]:
              this[xW(0xc75)](rI, !![]);
              break;
            case cR[xW(0x7df)]:
              this[xW(0xc75)](rI, ![]);
              break;
            case cR[xW(0x6aa)]:
              (rL = this[xW(0x445)] / 0xa),
                rI[xW(0x70b)](rL),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x0, 0x8),
                rI[xW(0x38c)](2.5, 0x0, 0x0, -0x8),
                (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0xa),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xdc4))),
                rI[xW(0x976)](),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x88e))),
                (rI[xW(0x9b8)] = 0x6),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x28d)]:
              (rL = this[xW(0x445)] / 0xa),
                rI[xW(0x70b)](rL),
                rI[xW(0x94b)](0x7, 0x0),
                (rI[xW(0x339)] = xW(0xcec)),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x5, -0x5),
                rI[xW(0xa6e)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rI[xW(0xa6e)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x542))),
                rI[xW(0x64e)](),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x237))),
                (rI[xW(0x9b8)] = 0x3),
                (rI[xW(0x5ce)] = xW(0xcec)),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xd8b)]:
              (rL = this[xW(0x445)] / 0x32), rI[xW(0x70b)](rL), rI[xW(0x936)]();
              for (let u0 = 0x0; u0 < 0x9; u0++) {
                const u1 = (u0 / 0x9) * Math["PI"] * 0x2,
                  u2 =
                    0x3c *
                    (0x1 +
                      Math[xW(0x5a6)]((u0 / 0x9) * Math["PI"] * 3.5) * 0.07);
                rI[xW(0xba7)](0x0, 0x0),
                  rI[xW(0xce8)](
                    Math[xW(0x5a6)](u1) * u2,
                    Math[xW(0x4ce)](u1) * u2
                  );
              }
              (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x10),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x88e))),
                rI[xW(0x64e)](),
                (rI[xW(0x9b8)] = 0x6),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xdc4))),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xb73)]:
              rI[xW(0x70a)](),
                (rL = this[xW(0x445)] / 0x28),
                rI[xW(0xd3a)](rL, rL),
                this[xW(0x492)](rI),
                (rI[xW(0x756)] = this[xW(0xb66)](
                  this[xW(0x80d)] ? li[0x0] : xW(0x29d)
                )),
                (rI[xW(0x744)] = xW(0x63b)),
                (rI[xW(0x9b8)] = 0x10),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rI[xW(0x64e)](),
                rI[xW(0x70a)](),
                rI[xW(0xc11)](),
                rI[xW(0x976)](),
                rI[xW(0xdea)](),
                rI[xW(0xdea)]();
              break;
            case cR[xW(0xed9)]:
            case cR[xW(0x61d)]:
            case cR[xW(0xd09)]:
            case cR[xW(0x5cf)]:
            case cR[xW(0x213)]:
            case cR[xW(0xe00)]:
            case cR[xW(0x425)]:
            case cR[xW(0x6eb)]:
              (rL = this[xW(0x445)] / 0x14), rI[xW(0xd3a)](rL, rL);
              const s9 = Math[xW(0x4ce)](this[xW(0xd3f)] * 1.6),
                sa = this[xW(0x56b)][xW(0xef5)](xW(0xed9)),
                sb = this[xW(0x56b)][xW(0xef5)](xW(0xc9b)),
                sc = this[xW(0x56b)][xW(0xef5)](xW(0xd09)),
                sd = this[xW(0x56b)][xW(0xef5)](xW(0xd09)) ? -0x4 : 0x0;
              (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x6);
              sb && rI[xW(0x94b)](0x8, 0x0);
              for (let u3 = 0x0; u3 < 0x2; u3++) {
                const u4 = u3 === 0x0 ? -0x1 : 0x1;
                rI[xW(0x70a)](), rI[xW(0x317)](u4 * (s9 * 0.5 + 0.6) * 0.08);
                const u5 = u4 * 0x4;
                rI[xW(0x936)](),
                  rI[xW(0xba7)](0x0, u5),
                  rI[xW(0x38c)](0xc, 0x6 * u4 + u5, 0x18, u5),
                  rI[xW(0x976)](),
                  rI[xW(0xdea)]();
              }
              if (this[xW(0x80d)])
                (rI[xW(0x756)] = this[xW(0xb66)](li[0x0])),
                  (rI[xW(0x744)] = this[xW(0xb66)](li[0x1]));
              else
                this[xW(0x56b)][xW(0xb68)](xW(0x5c2))
                  ? ((rI[xW(0x756)] = this[xW(0xb66)](xW(0xb28))),
                    (rI[xW(0x744)] = this[xW(0xb66)](xW(0xa43))))
                  : ((rI[xW(0x756)] = this[xW(0xb66)](xW(0x211))),
                    (rI[xW(0x744)] = this[xW(0xb66)](xW(0x86e))));
              rI[xW(0x9b8)] = sb ? 0x9 : 0xc;
              sb &&
                (rI[xW(0x70a)](),
                rI[xW(0x94b)](-0x18, 0x0),
                rI[xW(0xd3a)](-0x1, 0x1),
                lG(rI, 0x15, rI[xW(0x756)], rI[xW(0x744)], rI[xW(0x9b8)]),
                rI[xW(0xdea)]());
              !sc &&
                (rI[xW(0x70a)](),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](-0xa, 0x0, sb ? 0x12 : 0xc, 0x0, l1),
                rI[xW(0x64e)](),
                rI[xW(0xc11)](),
                rI[xW(0x976)](),
                rI[xW(0xdea)]());
              if (sa || sb) {
                rI[xW(0x70a)](),
                  (rI[xW(0x756)] = this[xW(0xb66)](xW(0xecc))),
                  (rI[xW(0x442)] *= 0.5);
                const u6 = (Math["PI"] / 0x7) * (sb ? 0.85 : 0x1) + s9 * 0.08;
                for (let u7 = 0x0; u7 < 0x2; u7++) {
                  const u8 = u7 === 0x0 ? -0x1 : 0x1;
                  rI[xW(0x70a)](),
                    rI[xW(0x317)](u8 * u6),
                    rI[xW(0x94b)](
                      sb ? -0x13 : -0x9,
                      u8 * -0x3 * (sb ? 1.3 : 0x1)
                    ),
                    rI[xW(0x936)](),
                    rI[xW(0x486)](
                      0x0,
                      0x0,
                      sb ? 0x14 : 0xe,
                      sb ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      l1
                    ),
                    rI[xW(0x64e)](),
                    rI[xW(0xdea)]();
                }
                rI[xW(0xdea)]();
              }
              rI[xW(0x70a)](),
                rI[xW(0x94b)](0x4 + sd, 0x0),
                lG(
                  rI,
                  sc ? 0x14 : 12.1,
                  rI[xW(0x756)],
                  rI[xW(0x744)],
                  rI[xW(0x9b8)]
                ),
                rI[xW(0xdea)]();
              break;
            case cR[xW(0xe23)]:
              this[xW(0x3b3)](rI, xW(0x21b));
              break;
            case cR[xW(0x629)]:
              this[xW(0x3b3)](rI, xW(0x6e2));
              break;
            case cR[xW(0x214)]:
              this[xW(0x3b3)](rI, xW(0xc46)),
                (rI[xW(0x442)] *= 0.2),
                lK(rI, this[xW(0x445)] * 1.3, 0x4);
              break;
            case cR[xW(0xb43)]:
            case cR[xW(0x5c3)]:
            case cR[xW(0x869)]:
            case cR[xW(0xe36)]:
            case cR[xW(0xded)]:
            case cR[xW(0xeb2)]:
              rI[xW(0x70a)](),
                (rL = this[xW(0x445)] / 0x28),
                rI[xW(0xd3a)](rL, rL),
                rI[xW(0x936)]();
              for (let u9 = 0x0; u9 < 0x2; u9++) {
                rI[xW(0x70a)](),
                  rI[xW(0xd3a)](0x1, u9 * 0x2 - 0x1),
                  rI[xW(0x94b)](0x0, 0x23),
                  rI[xW(0xba7)](0x9, 0x0),
                  rI[xW(0xce8)](0x5, 0xa),
                  rI[xW(0xce8)](-0x5, 0xa),
                  rI[xW(0xce8)](-0x9, 0x0),
                  rI[xW(0xce8)](0x9, 0x0),
                  rI[xW(0xdea)]();
              }
              (rI[xW(0x9b8)] = 0x12),
                (rI[xW(0x5ce)] = rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x744)] = rI[xW(0x756)] = this[xW(0xb66)](xW(0xbb9))),
                rI[xW(0x64e)](),
                rI[xW(0x976)]();
              let se;
              if (this[xW(0x56b)][xW(0xbd9)](xW(0x719)) > -0x1)
                se = [xW(0x944), xW(0x7dd)];
              else
                this[xW(0x56b)][xW(0xbd9)](xW(0x43a)) > -0x1
                  ? (se = [xW(0x8d4), xW(0x87d)])
                  : (se = [xW(0x5c8), xW(0xebf)]);
              rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0x28, 0x0, l1),
                (rI[xW(0x756)] = this[xW(0xb66)](se[0x0])),
                rI[xW(0x64e)](),
                (rI[xW(0x9b8)] = 0x8),
                (rI[xW(0x744)] = this[xW(0xb66)](se[0x1])),
                rI[xW(0x976)]();
              this[xW(0x56b)][xW(0xbd9)](xW(0x4f6)) > -0x1 &&
                this[xW(0x555)](rI, -0xf, 0x0, 1.25, 0x4);
              rI[xW(0xdea)]();
              break;
            case cR[xW(0xae7)]:
            case cR[xW(0xcb0)]:
              (rN =
                Math[xW(0x4ce)](
                  Date[xW(0x296)]() / 0x3e8 + this[xW(0xd3f)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rL = this[xW(0x445)] / 0x50),
                rI[xW(0xd3a)](rL, rL);
              const sf = this[xW(0x307)] === cR[xW(0xcb0)];
              sf &&
                (rI[xW(0x70a)](),
                rI[xW(0xd3a)](0x2, 0x2),
                this[xW(0x492)](rI),
                rI[xW(0xdea)]());
              rI[xW(0x317)](-this[xW(0x88c)]),
                (rI[xW(0x9b8)] = 0xa),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (rM = this[xW(0x80d)]
                  ? li
                  : sf
                  ? [xW(0x90d), xW(0xd8f)]
                  : [xW(0x329), xW(0x501)]),
                (rI[xW(0x756)] = this[xW(0xb66)](rM[0x0])),
                rI[xW(0x64e)](),
                rI[xW(0xc11)](),
                (rI[xW(0x744)] = this[xW(0xb66)](rM[0x1])),
                rI[xW(0x976)]();
              const sg = this[xW(0xb66)](xW(0x88e)),
                sh = this[xW(0xb66)](xW(0x5fa)),
                si = (ua = 0x1) => {
                  const xZ = xW;
                  rI[xZ(0x70a)](),
                    rI[xZ(0xd3a)](ua, 0x1),
                    rI[xZ(0x94b)](0x13 - rN * 0x4, -0x1d + rN * 0x5),
                    rI[xZ(0x936)](),
                    rI[xZ(0xba7)](0x0, 0x0),
                    rI[xZ(0xa6e)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rI[xZ(0x38c)](0x19, 0x5 + rN * 0x2, 0x0, 0x0),
                    rI[xZ(0x7ce)](),
                    (rI[xZ(0x9b8)] = 0x3),
                    rI[xZ(0x976)](),
                    (rI[xZ(0x756)] = sg),
                    rI[xZ(0x64e)](),
                    rI[xZ(0xc11)](),
                    rI[xZ(0x936)](),
                    rI[xZ(0xb0a)](
                      0x16 + ua * this[xZ(0x253)] * 0x10,
                      -0x4 + this[xZ(0x4c6)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rI[xZ(0x756)] = sh),
                    rI[xZ(0x64e)](),
                    rI[xZ(0xdea)]();
                };
              si(0x1),
                si(-0x1),
                rI[xW(0x70a)](),
                rI[xW(0x94b)](0x0, 0xa),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x28 + rN * 0xa, -0xe + rN * 0x5),
                rI[xW(0x38c)](0x0, +rN * 0x5, 0x2c - rN * 0xf, -0xe + rN * 0x5),
                rI[xW(0xa6e)](
                  0x14,
                  0x28 - rN * 0x14,
                  -0x14,
                  0x28 - rN * 0x14,
                  -0x28 + rN * 0xa,
                  -0xe + rN * 0x5
                ),
                rI[xW(0x7ce)](),
                (rI[xW(0x9b8)] = 0x5),
                rI[xW(0x976)](),
                (rI[xW(0x756)] = sh),
                rI[xW(0x64e)](),
                rI[xW(0xc11)]();
              const sj = rN * 0x2,
                sk = rN * -0xa;
              rI[xW(0x70a)](),
                rI[xW(0x94b)](0x0, sk),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x37, -0x8),
                rI[xW(0xa6e)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rI[xW(0x744)] = sg),
                (rI[xW(0x9b8)] = 0xd),
                rI[xW(0x976)](),
                (rI[xW(0x9b8)] = 0x4),
                (rI[xW(0x744)] = sh),
                rI[xW(0x936)]();
              for (let ua = 0x0; ua < 0x6; ua++) {
                const ub = (((ua + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rI[xW(0xba7)](ub, 0xa), rI[xW(0xce8)](ub, 0x46);
              }
              rI[xW(0x976)](),
                rI[xW(0xdea)](),
                rI[xW(0x70a)](),
                rI[xW(0x94b)](0x0, sj),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x32, -0x14),
                rI[xW(0x38c)](0x0, 0x8, 0x32, -0x12),
                (rI[xW(0x744)] = sg),
                (rI[xW(0x9b8)] = 0xd),
                rI[xW(0x976)](),
                (rI[xW(0x9b8)] = 0x5),
                (rI[xW(0x744)] = sh),
                rI[xW(0x936)]();
              for (let uc = 0x0; uc < 0x6; uc++) {
                let ud = (((uc + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rI[xW(0xba7)](ud, -0x14), rI[xW(0xce8)](ud, 0x2);
              }
              rI[xW(0x976)](), rI[xW(0xdea)](), rI[xW(0xdea)]();
              const sl = 0x1 - rN;
              (rI[xW(0x442)] *= Math[xW(0xe6f)](0x0, (sl - 0.3) / 0.7)),
                rI[xW(0x936)]();
              for (let ue = 0x0; ue < 0x2; ue++) {
                rI[xW(0x70a)](),
                  ue === 0x1 && rI[xW(0xd3a)](-0x1, 0x1),
                  rI[xW(0x94b)](
                    -0x33 + rN * (0xa + ue * 3.4) - ue * 3.4,
                    -0xf + rN * (0x5 - ue * 0x1)
                  ),
                  rI[xW(0xba7)](0xa, 0x0),
                  rI[xW(0xb0a)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rI[xW(0xdea)]();
              }
              rI[xW(0x94b)](0x0, 0x28),
                rI[xW(0xba7)](0x28 - rN * 0xa, -0xe + rN * 0x5),
                rI[xW(0xa6e)](
                  0x14,
                  0x14 - rN * 0xa,
                  -0x14,
                  0x14 - rN * 0xa,
                  -0x28 + rN * 0xa,
                  -0xe + rN * 0x5
                ),
                (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x2),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xa2d)]:
              (rL = this[xW(0x445)] / 0x14), rI[xW(0xd3a)](rL, rL);
              const sm = rI[xW(0x442)];
              (rI[xW(0x744)] = rI[xW(0x756)] = this[xW(0xb66)](xW(0x88e))),
                (rI[xW(0x442)] = 0.6 * sm),
                rI[xW(0x936)]();
              for (let uf = 0x0; uf < 0xa; uf++) {
                const ug = (uf / 0xa) * Math["PI"] * 0x2;
                rI[xW(0x70a)](),
                  rI[xW(0x317)](ug),
                  rI[xW(0x94b)](17.5, 0x0),
                  rI[xW(0xba7)](0x0, 0x0);
                const uh = Math[xW(0x4ce)](ug + Date[xW(0x296)]() / 0x1f4);
                rI[xW(0x317)](uh * 0.5),
                  rI[xW(0x38c)](0x4, -0x2 * uh, 0xe, 0x0),
                  rI[xW(0xdea)]();
              }
              (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 2.3),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x442)] = 0.5 * sm),
                rI[xW(0x64e)](),
                rI[xW(0xc11)](),
                (rI[xW(0x9b8)] = 0x3),
                rI[xW(0x976)](),
                (rI[xW(0x9b8)] = 1.2),
                (rI[xW(0x442)] = 0.6 * sm),
                rI[xW(0x936)](),
                (rI[xW(0x339)] = xW(0xcec));
              for (let ui = 0x0; ui < 0x4; ui++) {
                rI[xW(0x70a)](),
                  rI[xW(0x317)]((ui / 0x4) * Math["PI"] * 0x2),
                  rI[xW(0x94b)](0x4, 0x0),
                  rI[xW(0xba7)](0x0, -0x2),
                  rI[xW(0xa6e)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rI[xW(0xdea)]();
              }
              rI[xW(0x976)]();
              break;
            case cR[xW(0xe6a)]:
              this[xW(0xe6a)](rI);
              break;
            case cR[xW(0xdab)]:
              this[xW(0xe6a)](rI, !![]);
              break;
            case cR[xW(0x321)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x32),
                (rI[xW(0x9b8)] = 0x19),
                (rI[xW(0x5ce)] = xW(0xcec));
              const sn = this[xW(0x7ef)]
                ? 0.6
                : (Date[xW(0x296)]() / 0x4b0) % 6.28;
              for (let uj = 0x0; uj < 0xa; uj++) {
                const uk = 0x1 - uj / 0xa,
                  ul =
                    uk *
                    0x50 *
                    (0x1 +
                      (Math[xW(0x4ce)](sn * 0x3 + uj * 0.5 + this[xW(0xd3f)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rI[xW(0x317)](sn),
                  (rI[xW(0x744)] = this[xW(0xb66)](lh[uj])),
                  rI[xW(0x59b)](-ul / 0x2, -ul / 0x2, ul, ul);
              }
              break;
            case cR[xW(0x6da)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x12),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x19, -0xa),
                rI[xW(0x38c)](0x0, -0x2, 0x19, -0xa),
                rI[xW(0x38c)](0x1e, 0x0, 0x19, 0xa),
                rI[xW(0x38c)](0x0, 0x2, -0x19, 0xa),
                rI[xW(0x38c)](-0x1e, 0x0, -0x19, -0xa),
                rI[xW(0x7ce)](),
                (rI[xW(0x5ce)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0x4),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xb14))),
                rI[xW(0x976)](),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x801))),
                rI[xW(0x64e)](),
                rI[xW(0xc11)](),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x19, -0xa),
                rI[xW(0x38c)](0x14, 0x0, 0x19, 0xa),
                rI[xW(0xce8)](0x28, 0xa),
                rI[xW(0xce8)](0x28, -0xa),
                (rI[xW(0x756)] = xW(0x63b)),
                rI[xW(0x64e)](),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x0, -0xa),
                rI[xW(0x38c)](-0x5, 0x0, 0x0, 0xa),
                (rI[xW(0x9b8)] = 0xa),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xf24))),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x2ff)]:
              (rL = this[xW(0x445)] / 0xc),
                rI[xW(0xd3a)](rL, rL),
                rI[xW(0x317)](-Math["PI"] / 0x6),
                rI[xW(0x94b)](-0xc, 0x0),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x5, 0x0),
                rI[xW(0xce8)](0x0, 0x0),
                (rI[xW(0x9b8)] = 0x4),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xa92))),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x0, 0x0),
                rI[xW(0x38c)](0xa, -0x14, 0x1e, 0x0),
                rI[xW(0x38c)](0xa, 0x14, 0x0, 0x0),
                (rI[xW(0x9b8)] = 0x6),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0xe09))),
                rI[xW(0x976)](),
                rI[xW(0x64e)](),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x6, 0x0),
                rI[xW(0x38c)](0xe, -0x2, 0x16, 0x0),
                (rI[xW(0x9b8)] = 3.5),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x9a1)]:
              rK(xW(0x9a1), xW(0x47f), xW(0xbed));
              break;
            case cR[xW(0xc53)]:
              rK(xW(0xc53), xW(0x749), xW(0xcb8));
              break;
            case cR[xW(0x3ba)]:
              rK(xW(0x3ba), xW(0x88e), xW(0xdc4));
              break;
            case cR[xW(0x4ba)]:
              rK(xW(0x4ba), xW(0x88e), xW(0xdc4));
              break;
            case cR[xW(0xe0e)]:
              rK(xW(0x4ba), xW(0xa71), xW(0x8a1));
              break;
            case cR[xW(0xbb7)]:
              const so = this[xW(0x7ef)] ? 0x3c : this[xW(0x445)] * 0x2;
              rI[xW(0x94b)](-this[xW(0x445)] - 0xa, 0x0),
                (rI[xW(0x5ce)] = rI[xW(0x339)] = xW(0xcec)),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x0, 0x0),
                rI[xW(0xce8)](so, 0x0),
                (rI[xW(0x9b8)] = 0x6),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x237))),
                rI[xW(0x64e)](),
                rI[xW(0x94b)](so, 0x0),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0xd, 0x0),
                rI[xW(0xce8)](0x0, -3.5),
                rI[xW(0xce8)](0x0, 3.5),
                rI[xW(0x7ce)](),
                (rI[xW(0x744)] = rI[xW(0x756)]),
                rI[xW(0x64e)](),
                (rI[xW(0x9b8)] = 0x3),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x280)]:
              const sp = this[xW(0x445)] * 0x2,
                sq = 0xa;
              rI[xW(0x94b)](-this[xW(0x445)], 0x0),
                (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0xd65)] = xW(0x667)),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x0, 0x0),
                rI[xW(0xce8)](-sq * 1.8, 0x0),
                (rI[xW(0x744)] = xW(0xd38)),
                (rI[xW(0x9b8)] = sq * 1.4),
                rI[xW(0x976)](),
                (rI[xW(0x744)] = xW(0x3fc)),
                (rI[xW(0x9b8)] *= 0.7),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x0, 0x0),
                rI[xW(0xce8)](-sq * 0.45, 0x0),
                (rI[xW(0x744)] = xW(0xd38)),
                (rI[xW(0x9b8)] = sq * 0x2 + 3.5),
                rI[xW(0x976)](),
                (rI[xW(0x744)] = xW(0x885)),
                (rI[xW(0x9b8)] = sq * 0x2),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, sq, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x756)] = xW(0x43e)),
                rI[xW(0x64e)](),
                (rI[xW(0x744)] = xW(0xaf3)),
                rI[xW(0x936)]();
              const sr = (Date[xW(0x296)]() * 0.001) % 0x1,
                ss = sr * sp,
                st = sp * 0.2;
              rI[xW(0xba7)](Math[xW(0xe6f)](ss - st, 0x0), 0x0),
                rI[xW(0xce8)](Math[xW(0xeeb)](ss + st, sp), 0x0);
              const su = Math[xW(0x4ce)](sr * Math["PI"]);
              (rI[xW(0xb3c)] = sq * 0x3 * su),
                (rI[xW(0x9b8)] = sq),
                rI[xW(0x976)](),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x0, 0x0),
                rI[xW(0xce8)](sp, 0x0),
                (rI[xW(0x9b8)] = sq),
                (rI[xW(0xb3c)] = sq),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x62e)]:
            case cR[xW(0xd35)]:
            case cR[xW(0x551)]:
            case cR[xW(0xeba)]:
            case cR[xW(0x375)]:
            case cR[xW(0xd82)]:
              (rL = this[xW(0x445)] / 0x23), rI[xW(0x70b)](rL), rI[xW(0x936)]();
              this[xW(0x307)] !== cR[xW(0xd35)] &&
              this[xW(0x307)] !== cR[xW(0x375)]
                ? rI[xW(0x486)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, l1)
                : rI[xW(0xb0a)](0x0, 0x0, 0x23, 0x0, l1);
              (rM = ls[this[xW(0x307)]] || [xW(0xc9c), xW(0xee2)]),
                (rI[xW(0x756)] = this[xW(0xb66)](rM[0x0])),
                rI[xW(0x64e)](),
                (rI[xW(0x744)] = this[xW(0xb66)](rM[0x1])),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x254)]:
              (rI[xW(0x9b8)] = 0x4),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0x93a)),
                rK(xW(0x254), xW(0xf36), xW(0xef6));
              break;
            case cR[xW(0xb3a)]:
              rK(xW(0xb3a), xW(0x88e), xW(0xdc4));
              break;
            case cR[xW(0xb4f)]:
              (rL = this[xW(0x445)] / 0x14), rI[xW(0xd3a)](rL, rL);
              !this[xW(0x7ef)] && rI[xW(0x317)]((pQ / 0x64) % 6.28);
              rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rI[xW(0x38c)](0x0, 0xc, 0x14, 0x0),
                rI[xW(0x7ce)](),
                (rI[xW(0x5ce)] = rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] *= 0.7),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x88e))),
                rI[xW(0x64e)](),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xdc4))),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xb25)]:
              (rI[xW(0x9b8)] *= 0.7),
                rK(xW(0xb25), xW(0x69b), xW(0x814)),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0.6, 0x0, l1),
                (rI[xW(0x756)] = xW(0x67d)),
                rI[xW(0x64e)]();
              break;
            case cR[xW(0x99d)]:
              (rI[xW(0x9b8)] *= 0.8), rK(xW(0x99d), xW(0x2a6), xW(0x30d));
              break;
            case cR[xW(0x1fa)]:
              (rL = this[xW(0x445)] / 0xa), rI[xW(0xd3a)](rL, rL);
              if (!this[xW(0x258)] || pQ - this[xW(0x1ca)] > 0x14) {
                this[xW(0x1ca)] = pQ;
                const um = new Path2D();
                for (let un = 0x0; un < 0xa; un++) {
                  const uo = (Math[xW(0x4a5)]() * 0x2 - 0x1) * 0x7,
                    up = (Math[xW(0x4a5)]() * 0x2 - 0x1) * 0x7;
                  um[xW(0xba7)](uo, up), um[xW(0xb0a)](uo, up, 0x5, 0x0, l1);
                }
                this[xW(0x258)] = um;
              }
              (rI[xW(0x756)] = this[xW(0xb66)](xW(0xecc))),
                rI[xW(0x64e)](this[xW(0x258)]);
              break;
            case cR[xW(0x5df)]:
            case cR[xW(0x511)]:
              (rL = this[xW(0x445)] / 0x1e),
                rI[xW(0xd3a)](rL, rL),
                rI[xW(0x936)]();
              const sv = 0x1 / 0x3;
              for (let uq = 0x0; uq < 0x3; uq++) {
                const ur = (uq / 0x3) * Math["PI"] * 0x2;
                rI[xW(0xba7)](0x0, 0x0),
                  rI[xW(0xb0a)](0x0, 0x0, 0x1e, ur, ur + Math["PI"] / 0x3);
              }
              (rI[xW(0x339)] = xW(0xcec)),
                (rI[xW(0x9b8)] = 0xa),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x756)] = this[xW(0xb66)](
                  this[xW(0x307)] === cR[xW(0x5df)] ? xW(0xa59) : xW(0x266)
                )),
                rI[xW(0x64e)](),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x817)]:
              rJ(xW(0x985), xW(0x396));
              break;
            case cR[xW(0x77f)]:
              rJ(xW(0xb54), xW(0xa0e));
              break;
            case cR[xW(0x563)]:
            case cR[xW(0xc38)]:
              rJ(xW(0x88e), xW(0xdc4));
              break;
            case cR[xW(0xdb6)]:
              (rL = this[xW(0x445)] / 0x14),
                rI[xW(0xd3a)](rL, rL),
                rI[xW(0x317)](-Math["PI"] / 0x4);
              const sw = rI[xW(0x9b8)];
              (rI[xW(0x9b8)] *= 1.5),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x14, -0x14 - sw),
                rI[xW(0xce8)](-0x14, 0x0),
                rI[xW(0xce8)](0x14, 0x0),
                rI[xW(0xce8)](0x14, 0x14 + sw),
                rI[xW(0x317)](Math["PI"] / 0x2),
                rI[xW(0xba7)](-0x14, -0x14 - sw),
                rI[xW(0xce8)](-0x14, 0x0),
                rI[xW(0xce8)](0x14, 0x0),
                rI[xW(0xce8)](0x14, 0x14 + sw),
                (rI[xW(0x339)] = rI[xW(0x339)] = xW(0x93a)),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                rI[xW(0x976)]();
              break;
            case cR[xW(0xcb5)]:
              rJ(xW(0x490), xW(0xa8b));
              break;
            case cR[xW(0xb98)]:
              rJ(xW(0x6d8), xW(0xb40));
              break;
            case cR[xW(0xc27)]:
              rJ(xW(0x345), xW(0xe03));
              break;
            case cR[xW(0x49f)]:
              (rL = this[xW(0x445)] / 0x14),
                rI[xW(0xd3a)](rL, rL),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0x14, 0x0, l1),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0x542))),
                rI[xW(0x64e)](),
                rI[xW(0xc11)](),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x237))),
                rI[xW(0x976)](),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0xf28))),
                rI[xW(0x64e)]();
              break;
            case cR[xW(0xba5)]:
              (rL = this[xW(0x445)] / 0x14), rI[xW(0xd3a)](rL, rL);
              const sx = (us, ut, uu = ![]) => {
                  const y0 = xW;
                  (rI[y0(0x339)] = y0(0xcec)),
                    (rI[y0(0x744)] = this[y0(0xb66)](ut)),
                    (rI[y0(0x756)] = this[y0(0xb66)](us)),
                    rI[y0(0x936)](),
                    rI[y0(0xb0a)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rI[y0(0x976)](),
                    rI[y0(0x64e)]();
                },
                sy = (us, ut) => {
                  const y1 = xW;
                  rI[y1(0x70a)](),
                    rI[y1(0xc11)](),
                    (rI[y1(0x339)] = y1(0xcec)),
                    (rI[y1(0x756)] = this[y1(0xb66)](us)),
                    (rI[y1(0x744)] = this[y1(0xb66)](ut)),
                    rI[y1(0x64e)](),
                    rI[y1(0x976)](),
                    rI[y1(0xdea)]();
                };
              (rI[xW(0x339)] = xW(0xcec)),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                sy(xW(0x542), xW(0x237)),
                rI[xW(0x317)](Math["PI"]),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rI[xW(0xb0a)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rI[xW(0xb0a)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                sy(xW(0x88e), xW(0xdc4)),
                rI[xW(0x317)](-Math["PI"]),
                rI[xW(0x936)](),
                rI[xW(0xb0a)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                sy(xW(0x542), xW(0x237));
              break;
            case cR[xW(0xc31)]:
              this[xW(0x842)](rI, this[xW(0x445)]);
              break;
            case cR[xW(0x3b5)]:
              (rL = this[xW(0x445)] / 0x28),
                rI[xW(0xd3a)](rL, rL),
                rI[xW(0x936)](),
                rI[xW(0xba7)](-0x1e, -0x1e),
                rI[xW(0xce8)](0x14, 0x0),
                rI[xW(0xce8)](-0x1e, 0x1e),
                rI[xW(0x7ce)](),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x542))),
                (rI[xW(0x756)] = this[xW(0xb66)](xW(0xc46))),
                rI[xW(0x64e)](),
                (rI[xW(0x9b8)] = 0x16),
                (rI[xW(0x339)] = rI[xW(0x5ce)] = xW(0xcec)),
                rI[xW(0x976)]();
              break;
            case cR[xW(0x3ca)]:
              rI[xW(0x70b)](this[xW(0x445)] / 0x41),
                rI[xW(0x94b)](-0xa, 0xa),
                (rI[xW(0x5ce)] = rI[xW(0x339)] = xW(0xcec)),
                rI[xW(0x70a)](),
                rI[xW(0x936)](),
                rI[xW(0xba7)](0x1e, 0x0),
                rI[xW(0x94b)](
                  0x46 -
                    (Math[xW(0x4ce)](
                      Date[xW(0x296)]() / 0x190 + 0.8 * this[xW(0xd3f)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rI[xW(0xce8)](0x0, 0x0),
                (rI[xW(0x9b8)] = 0x2a),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0xa70))),
                rI[xW(0x976)](),
                (rI[xW(0x744)] = this[xW(0xb66)](xW(0x53e))),
                (rI[xW(0x9b8)] -= 0xc),
                rI[xW(0x976)](),
                rI[xW(0x936)]();
              for (let us = 0x0; us < 0x2; us++) {
                rI[xW(0xba7)](0x9, 0x7),
                  rI[xW(0xce8)](0x28, 0x14),
                  rI[xW(0xce8)](0x7, 0x9),
                  rI[xW(0xce8)](0x9, 0x7),
                  rI[xW(0xd3a)](0x1, -0x1);
              }
              (rI[xW(0x9b8)] = 0x3),
                (rI[xW(0x756)] = rI[xW(0x744)] = xW(0x8cd)),
                rI[xW(0x976)](),
                rI[xW(0x64e)](),
                rI[xW(0xdea)](),
                this[xW(0x533)](rI);
              break;
            case cR[xW(0x41e)]:
              (rL = this[xW(0x445)] / 0x14), rI[xW(0xd3a)](rL, rL);
              const sz = (ut = 0x1, uu, uv) => {
                const y2 = xW;
                rI[y2(0x70a)](),
                  rI[y2(0xd3a)](0x1, ut),
                  rI[y2(0x936)](),
                  rI[y2(0x97c)](-0x64, 0x0, 0x12c, -0x12c),
                  rI[y2(0xc11)](),
                  rI[y2(0x936)](),
                  rI[y2(0xba7)](-0x14, 0x0),
                  rI[y2(0x38c)](-0x12, -0x19, 0x11, -0xf),
                  (rI[y2(0x339)] = y2(0xcec)),
                  (rI[y2(0x9b8)] = 0x16),
                  (rI[y2(0x744)] = this[y2(0xb66)](uv)),
                  rI[y2(0x976)](),
                  (rI[y2(0x9b8)] = 0xe),
                  (rI[y2(0x744)] = this[y2(0xb66)](uu)),
                  rI[y2(0x976)](),
                  rI[y2(0xdea)]();
              };
              sz(0x1, xW(0x549), xW(0xde8)), sz(-0x1, xW(0x288), xW(0x289));
              break;
            default:
              rI[xW(0x936)](),
                rI[xW(0xb0a)](0x0, 0x0, this[xW(0x445)], 0x0, Math["PI"] * 0x2),
                (rI[xW(0x756)] = xW(0x724)),
                rI[xW(0x64e)](),
                pK(rI, this[xW(0x56b)], 0x14, xW(0xaf3), 0x3);
          }
          rI[xW(0xdea)](), (this[xW(0xa28)] = null);
        }
        [ux(0x6a3)](rI, rJ) {
          const y3 = ux;
          rJ = rJ || pQ / 0x12c + this[y3(0xd3f)] * 0.3;
          const rK = Math[y3(0x4ce)](rJ) * 0.5 + 0.5;
          rI[y3(0x339)] = y3(0xcec);
          const rL = 0x4;
          for (let rM = 0x0; rM < 0x2; rM++) {
            rI[y3(0x70a)]();
            if (rM === 0x0) rI[y3(0x936)]();
            for (let rN = 0x0; rN < 0x2; rN++) {
              for (let rO = 0x0; rO < rL; rO++) {
                rI[y3(0x70a)](), rM > 0x0 && rI[y3(0x936)]();
                const rP = -0.19 - (rO / rL) * Math["PI"] * 0.25;
                rI[y3(0x317)](rP + rK * 0.05), rI[y3(0xba7)](0x0, 0x0);
                const rQ = Math[y3(0x4ce)](rJ + rO);
                rI[y3(0x94b)](0x1c - (rQ * 0.5 + 0.5), 0x0),
                  rI[y3(0x317)](rQ * 0.08),
                  rI[y3(0xce8)](0x0, 0x0),
                  rI[y3(0x38c)](0x0, 0x7, 5.5, 0xe),
                  rM > 0x0 &&
                    ((rI[y3(0x9b8)] = 6.5),
                    (rI[y3(0x744)] =
                      y3(0x839) + (0x2f + (rO / rL) * 0x14) + "%)"),
                    rI[y3(0x976)]()),
                  rI[y3(0xdea)]();
              }
              rI[y3(0xd3a)](-0x1, 0x1);
            }
            rM === 0x0 &&
              ((rI[y3(0x9b8)] = 0x9),
              (rI[y3(0x744)] = y3(0x89b)),
              rI[y3(0x976)]()),
              rI[y3(0xdea)]();
          }
          rI[y3(0x936)](),
            rI[y3(0x486)](
              0x0,
              -0x1e + Math[y3(0x4ce)](rJ * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rI[y3(0x744)] = y3(0x89b)),
            (rI[y3(0x9b8)] = 5.5),
            rI[y3(0x976)](),
            (rI[y3(0xb3c)] = 0x5 + rK * 0x8),
            (rI[y3(0xd65)] = y3(0x9d0)),
            (rI[y3(0x744)] = rI[y3(0xd65)]),
            (rI[y3(0x9b8)] = 3.5),
            rI[y3(0x976)](),
            (rI[y3(0xb3c)] = 0x0);
        }
        [ux(0xa14)](rI) {
          const y4 = ux,
            rJ = this[y4(0x80d)] ? lm[y4(0x32e)] : lm[y4(0x1cc)],
            rK = Date[y4(0x296)]() / 0x1f4 + this[y4(0xd3f)],
            rL = Math[y4(0x4ce)](rK) - 0.5;
          rI[y4(0x339)] = rI[y4(0x5ce)] = y4(0xcec);
          const rM = 0x46;
          rI[y4(0x70a)](), rI[y4(0x936)]();
          for (let rN = 0x0; rN < 0x2; rN++) {
            rI[y4(0x70a)]();
            const rO = rN * 0x2 - 0x1;
            rI[y4(0xd3a)](0x1, rO),
              rI[y4(0x94b)](0x14, rM),
              rI[y4(0x317)](rL * 0.1),
              rI[y4(0xba7)](0x0, 0x0),
              rI[y4(0xce8)](-0xa, 0x32),
              rI[y4(0x38c)](0x32, 0x32, 0x64, 0x1e),
              rI[y4(0x38c)](0x32, 0x32, 0x64, 0x1e),
              rI[y4(0x38c)](0x1e, 0x8c, -0x50, 0x78 - rL * 0x14),
              rI[y4(0x38c)](
                -0xa + rL * 0xf,
                0x6e - rL * 0xa,
                -0x28,
                0x50 - rL * 0xa
              ),
              rI[y4(0x38c)](
                -0xa + rL * 0xa,
                0x3c + rL * 0x5,
                -0x3c,
                0x32 - Math[y4(0xe6f)](0x0, rL) * 0xa
              ),
              rI[y4(0x38c)](-0xa, 0x14 - rL * 0xa, -0x46, rL * 0xa),
              rI[y4(0xdea)]();
          }
          (rI[y4(0x756)] = this[y4(0xb66)](rJ[y4(0x726)])),
            rI[y4(0x64e)](),
            (rI[y4(0x9b8)] = 0x12),
            (rI[y4(0x744)] = y4(0x5b4)),
            rI[y4(0xc11)](),
            rI[y4(0x976)](),
            rI[y4(0xdea)](),
            rI[y4(0x70a)](),
            rI[y4(0x94b)](0x50, 0x0),
            rI[y4(0xd3a)](0x2, 0x2),
            rI[y4(0x936)]();
          for (let rP = 0x0; rP < 0x2; rP++) {
            rI[y4(0xd3a)](0x1, -0x1),
              rI[y4(0x70a)](),
              rI[y4(0x94b)](0x0, 0xf),
              rI[y4(0x317)]((Math[y4(0x4ce)](rK * 0x2) * 0.5 + 0.5) * 0.08),
              rI[y4(0xba7)](0x0, -0x4),
              rI[y4(0x38c)](0xa, 0x0, 0x14, -0x6),
              rI[y4(0x38c)](0xf, 0x3, 0x0, 0x5),
              rI[y4(0xdea)]();
          }
          (rI[y4(0x756)] = rI[y4(0x744)] = y4(0x8cd)),
            rI[y4(0x64e)](),
            (rI[y4(0x9b8)] = 0x6),
            rI[y4(0x976)](),
            rI[y4(0xdea)]();
          for (let rQ = 0x0; rQ < 0x2; rQ++) {
            const rR = rQ === 0x0;
            rR && rI[y4(0x936)]();
            for (let rS = 0x4; rS >= 0x0; rS--) {
              const rT = rS / 0x5,
                rU = 0x32 - 0x2d * rT;
              !rR && rI[y4(0x936)](),
                rI[y4(0x97c)](
                  -0x50 - rT * 0x50 - rU / 0x2,
                  -rU / 0x2 +
                    Math[y4(0x4ce)](rT * Math["PI"] * 0x2 + rK * 0x3) *
                      0x8 *
                      rT,
                  rU,
                  rU
                ),
                !rR &&
                  ((rI[y4(0x9b8)] = 0x14),
                  (rI[y4(0x756)] = rI[y4(0x744)] =
                    this[y4(0xb66)](rJ[y4(0xa5f)][rS])),
                  rI[y4(0x976)](),
                  rI[y4(0x64e)]());
            }
            rR &&
              ((rI[y4(0x9b8)] = 0x22),
              (rI[y4(0x744)] = this[y4(0xb66)](rJ[y4(0x969)])),
              rI[y4(0x976)]());
          }
          rI[y4(0x936)](),
            rI[y4(0xb0a)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rI[y4(0x756)] = this[y4(0xb66)](rJ[y4(0x458)])),
            rI[y4(0x64e)](),
            (rI[y4(0x9b8)] = 0x24),
            (rI[y4(0x744)] = y4(0x38a)),
            rI[y4(0x70a)](),
            rI[y4(0xc11)](),
            rI[y4(0x976)](),
            rI[y4(0xdea)](),
            rI[y4(0x70a)]();
          for (let rV = 0x0; rV < 0x2; rV++) {
            rI[y4(0x936)]();
            for (let rW = 0x0; rW < 0x2; rW++) {
              rI[y4(0x70a)]();
              const rX = rW * 0x2 - 0x1;
              rI[y4(0xd3a)](0x1, rX),
                rI[y4(0x94b)](0x14, rM),
                rI[y4(0x317)](rL * 0.1),
                rI[y4(0xba7)](0x0, 0xa),
                rI[y4(0xce8)](-0xa, 0x32),
                rI[y4(0x38c)](0x32, 0x32, 0x64, 0x1e),
                rI[y4(0x38c)](0x32, 0x32, 0x64, 0x1e),
                rI[y4(0x38c)](0x1e, 0x8c, -0x50, 0x78 - rL * 0x14),
                rI[y4(0xba7)](0x64, 0x1e),
                rI[y4(0x38c)](0x23, 0x5a, -0x28, 0x50 - rL * 0xa),
                rI[y4(0xba7)](-0xa, 0x32),
                rI[y4(0x38c)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[y4(0xe6f)](0x0, rL) * 0xa
                ),
                rI[y4(0xdea)]();
            }
            rV === 0x0
              ? ((rI[y4(0x9b8)] = 0x10),
                (rI[y4(0x744)] = this[y4(0xb66)](rJ[y4(0xb93)])))
              : ((rI[y4(0x9b8)] = 0xa),
                (rI[y4(0x744)] = this[y4(0xb66)](rJ[y4(0x1ff)]))),
              rI[y4(0x976)]();
          }
          rI[y4(0xdea)]();
        }
        [ux(0x24d)](rI, rJ, rK, rL) {
          const y5 = ux;
          rI[y5(0x70a)]();
          const rM = this[y5(0x445)] / 0x28;
          rI[y5(0xd3a)](rM, rM),
            (rJ = this[y5(0xb66)](rJ)),
            (rK = this[y5(0xb66)](rK)),
            (rL = this[y5(0xb66)](rL));
          const rN = Math["PI"] / 0x5;
          rI[y5(0x339)] = rI[y5(0x5ce)] = y5(0xcec);
          const rO = Math[y5(0x4ce)](
              Date[y5(0x296)]() / 0x12c + this[y5(0xd3f)] * 0.2
            ),
            rP = rO * 0.3 + 0.7;
          rI[y5(0x936)](),
            rI[y5(0xb0a)](0x16, 0x0, 0x17, 0x0, l1),
            rI[y5(0xba7)](0x0, 0x0),
            rI[y5(0xb0a)](-0x5, 0x0, 0x21, 0x0, l1),
            (rI[y5(0x756)] = this[y5(0xb66)](y5(0x5fa))),
            rI[y5(0x64e)](),
            rI[y5(0x70a)](),
            rI[y5(0x94b)](0x12, 0x0);
          for (let rS = 0x0; rS < 0x2; rS++) {
            rI[y5(0x70a)](),
              rI[y5(0xd3a)](0x1, rS * 0x2 - 0x1),
              rI[y5(0x317)](Math["PI"] * 0.08 * rP),
              rI[y5(0x94b)](-0x12, 0x0),
              rI[y5(0x936)](),
              rI[y5(0xb0a)](0x0, 0x0, 0x28, Math["PI"], -rN),
              rI[y5(0x38c)](0x14 - rP * 0x3, -0xf, 0x14, 0x0),
              rI[y5(0x7ce)](),
              (rI[y5(0x756)] = rJ),
              rI[y5(0x64e)]();
            const rT = y5(0x349) + rS;
            if (!this[rT]) {
              const rU = new Path2D();
              for (let rV = 0x0; rV < 0x2; rV++) {
                const rW = (Math[y5(0x4a5)]() * 0x2 - 0x1) * 0x28,
                  rX = Math[y5(0x4a5)]() * -0x28,
                  rY = Math[y5(0x4a5)]() * 0x9 + 0x8;
                rU[y5(0xba7)](rW, rX), rU[y5(0xb0a)](rW, rX, rY, 0x0, l1);
              }
              this[rT] = rU;
            }
            rI[y5(0xc11)](),
              (rI[y5(0x756)] = rL),
              rI[y5(0x64e)](this[rT]),
              rI[y5(0xdea)](),
              (rI[y5(0x9b8)] = 0x7),
              (rI[y5(0x744)] = rK),
              rI[y5(0x976)]();
          }
          rI[y5(0xdea)](), rI[y5(0x70a)]();
          let rQ = 0x9;
          rI[y5(0x94b)](0x2a, 0x0);
          const rR = Math["PI"] * 0x3 - rO;
          rI[y5(0x936)]();
          for (let rZ = 0x0; rZ < 0x2; rZ++) {
            let s0 = 0x0,
              s1 = 0x8;
            rI[y5(0xba7)](s0, s1);
            for (let s2 = 0x0; s2 < rQ; s2++) {
              const s3 = s2 / rQ,
                s4 = s3 * rR,
                s5 = 0xf * (0x1 - s3),
                s6 = Math[y5(0x5a6)](s4) * s5,
                s7 = Math[y5(0x4ce)](s4) * s5,
                s8 = s0 + s6,
                s9 = s1 + s7;
              rI[y5(0x38c)](
                s0 + s6 * 0.5 + s7 * 0.25,
                s1 + s7 * 0.5 - s6 * 0.25,
                s8,
                s9
              ),
                (s0 = s8),
                (s1 = s9);
            }
            rI[y5(0xd3a)](0x1, -0x1);
          }
          (rI[y5(0x339)] = rI[y5(0x5ce)] = y5(0xcec)),
            (rI[y5(0x9b8)] = 0x2),
            (rI[y5(0x744)] = rI[y5(0x756)]),
            rI[y5(0x976)](),
            rI[y5(0xdea)](),
            rI[y5(0xdea)]();
        }
        [ux(0xe64)](rI, rJ = 0x64, rK = 0x50, rL = 0x12, rM = 0x8) {
          const y6 = ux;
          rI[y6(0x936)]();
          const rN = (0x1 / rL) * Math["PI"] * 0x2;
          rI[y6(0xba7)](rK, 0x0);
          for (let rO = 0x0; rO < rL; rO++) {
            const rP = rO * rN,
              rQ = (rO + 0x1) * rN;
            rI[y6(0xa6e)](
              Math[y6(0x5a6)](rP) * rJ,
              Math[y6(0x4ce)](rP) * rJ,
              Math[y6(0x5a6)](rQ) * rJ,
              Math[y6(0x4ce)](rQ) * rJ,
              Math[y6(0x5a6)](rQ) * rK,
              Math[y6(0x4ce)](rQ) * rK
            );
          }
          (rI[y6(0x756)] = this[y6(0xb66)](y6(0x646))),
            rI[y6(0x64e)](),
            (rI[y6(0x9b8)] = rM),
            (rI[y6(0x339)] = rI[y6(0x5ce)] = y6(0xcec)),
            (rI[y6(0x744)] = this[y6(0xb66)](y6(0x880))),
            rI[y6(0x976)]();
        }
        [ux(0xb66)](rI) {
          const y7 = ux,
            rJ = 0x1 - this[y7(0x823)];
          if (
            rJ >= 0x1 &&
            this[y7(0xd45)] === 0x0 &&
            !this[y7(0x61a)] &&
            !this[y7(0xe2b)]
          )
            return rI;
          rI = hz(rI);
          this[y7(0x61a)] &&
            (rI = hx(
              rI,
              [0xff, 0xff, 0xff],
              0.85 + Math[y7(0x4ce)](pQ / 0x32) * 0.15
            ));
          this[y7(0xd45)] > 0x0 &&
            (rI = hx(rI, [0x8f, 0x5d, 0xb0], 0x1 - this[y7(0xd45)] * 0.75));
          rI = hx(rI, [0xff, 0x0, 0x0], rJ * 0.25 + 0.75);
          if (this[y7(0xe2b)]) {
            if (!this[y7(0xa28)]) {
              let rK = pQ / 0x4;
              if (!isNaN(this["id"])) rK += this["id"];
              this[y7(0xa28)] = lI(rK % 0x168, 0x64, 0x32);
            }
            rI = hx(rI, this[y7(0xa28)], 0.75);
          }
          return q2(rI);
        }
        [ux(0x654)](rI) {
          const y8 = ux;
          this[y8(0xa28)] = null;
          if (this[y8(0x2a0)]) {
            const rJ = Math[y8(0x4ce)]((this[y8(0xda0)] * Math["PI"]) / 0x2);
            if (!this[y8(0x67e)]) {
              const rK = 0x1 + rJ * 0x1;
              rI[y8(0xd3a)](rK, rK);
            }
            rI[y8(0x442)] *= 0x1 - rJ;
          }
        }
        [ux(0x202)](rI, rJ = !![], rK = 0x1) {
          const y9 = ux;
          rI[y9(0x936)](),
            (rK = 0x8 * rK),
            rI[y9(0xba7)](0x23, -rK),
            rI[y9(0x38c)](0x33, -0x2 - rK, 0x3c, -0xc - rK),
            rI[y9(0xce8)](0x23, -rK),
            rI[y9(0xba7)](0x23, rK),
            rI[y9(0x38c)](0x33, 0x2 + rK, 0x3c, 0xc + rK),
            rI[y9(0xce8)](0x23, rK);
          const rL = y9(0x542);
          (rI[y9(0x756)] = rI[y9(0x744)] =
            rJ ? this[y9(0xb66)](rL) : y9(0x542)),
            rI[y9(0x64e)](),
            (rI[y9(0x339)] = rI[y9(0x5ce)] = y9(0xcec)),
            (rI[y9(0x9b8)] = 0x4),
            rI[y9(0x976)]();
        }
        [ux(0x842)](rI, rJ, rK = 0x1) {
          const ya = ux,
            rL = (rJ / 0x1e) * 1.1;
          rI[ya(0xd3a)](rL, rL),
            rI[ya(0x936)](),
            rI[ya(0xba7)](-0x1e, -0x11),
            rI[ya(0xce8)](0x1e, 0x0),
            rI[ya(0xce8)](-0x1e, 0x11),
            rI[ya(0x7ce)](),
            (rI[ya(0x756)] = rI[ya(0x744)] = this[ya(0xb66)](ya(0x542))),
            rI[ya(0x64e)](),
            (rI[ya(0x9b8)] = 0x14 * rK),
            (rI[ya(0x339)] = rI[ya(0x5ce)] = ya(0xcec)),
            rI[ya(0x976)]();
        }
        [ux(0x555)](rI, rJ = 0x0, rK = 0x0, rL = 0x1, rM = 0x5) {
          const yb = ux;
          rI[yb(0x70a)](),
            rI[yb(0x94b)](rJ, rK),
            rI[yb(0xd3a)](rL, rL),
            rI[yb(0x936)](),
            rI[yb(0xba7)](0x23, -0x8),
            rI[yb(0x38c)](0x34, -5.5, 0x3c, -0x14),
            rI[yb(0xba7)](0x23, 0x8),
            rI[yb(0x38c)](0x34, 5.5, 0x3c, 0x14),
            (rI[yb(0x756)] = rI[yb(0x744)] = this[yb(0xb66)](yb(0x542))),
            (rI[yb(0x339)] = rI[yb(0x5ce)] = yb(0xcec)),
            (rI[yb(0x9b8)] = rM),
            rI[yb(0x976)](),
            rI[yb(0x936)]();
          const rN = Math["PI"] * 0.165;
          rI[yb(0x486)](0x3c, -0x14, 0x7, 0x9, rN, 0x0, l1),
            rI[yb(0x486)](0x3c, 0x14, 0x7, 0x9, -rN, 0x0, l1),
            rI[yb(0x64e)](),
            rI[yb(0xdea)]();
        }
      },
      lI = (rI, rJ, rK) => {
        const yc = ux;
        (rJ /= 0x64), (rK /= 0x64);
        const rL = (rO) => (rO + rI / 0x1e) % 0xc,
          rM = rJ * Math[yc(0xeeb)](rK, 0x1 - rK),
          rN = (rO) =>
            rK -
            rM *
              Math[yc(0xe6f)](
                -0x1,
                Math[yc(0xeeb)](
                  rL(rO) - 0x3,
                  Math[yc(0xeeb)](0x9 - rL(rO), 0x1)
                )
              );
        return [0xff * rN(0x0), 0xff * rN(0x8), 0xff * rN(0x4)];
      };
    function lJ(rI) {
      const yd = ux;
      return -(Math[yd(0x5a6)](Math["PI"] * rI) - 0x1) / 0x2;
    }
    function lK(rI, rJ, rK = 0x6, rL = ux(0xaf3)) {
      const ye = ux,
        rM = rJ / 0x64;
      rI[ye(0xd3a)](rM, rM), rI[ye(0x936)]();
      for (let rN = 0x0; rN < 0xc; rN++) {
        rI[ye(0xba7)](0x0, 0x0);
        const rO = (rN / 0xc) * Math["PI"] * 0x2;
        rI[ye(0xce8)](Math[ye(0x5a6)](rO) * 0x64, Math[ye(0x4ce)](rO) * 0x64);
      }
      (rI[ye(0x9b8)] = rK),
        (rI[ye(0x756)] = rI[ye(0x744)] = rL),
        (rI[ye(0x339)] = rI[ye(0x5ce)] = ye(0xcec));
      for (let rP = 0x0; rP < 0x5; rP++) {
        const rQ = (rP / 0x5) * 0x64 + 0xa;
        lc(rI, 0xc, rQ, 0.5, 0.85);
      }
      rI[ye(0x976)]();
    }
    var lL = class {
        constructor(rI, rJ, rK, rL, rM) {
          const yf = ux;
          (this[yf(0x307)] = rI),
            (this["id"] = rJ),
            (this["x"] = rK),
            (this["y"] = rL),
            (this[yf(0x445)] = rM),
            (this[yf(0x88c)] = Math[yf(0x4a5)]() * l1),
            (this[yf(0x356)] = -0x1),
            (this[yf(0x2a0)] = ![]),
            (this[yf(0x256)] = 0x0),
            (this[yf(0xda0)] = 0x0),
            (this[yf(0x306)] = !![]),
            (this[yf(0xb2d)] = 0x0),
            (this[yf(0x7d1)] = !![]);
        }
        [ux(0xb75)]() {
          const yg = ux;
          if (this[yg(0x256)] < 0x1) {
            this[yg(0x256)] += pR / 0xc8;
            if (this[yg(0x256)] > 0x1) this[yg(0x256)] = 0x1;
          }
          this[yg(0x2a0)] && (this[yg(0xda0)] += pR / 0xc8);
        }
        [ux(0x989)](rI) {
          const yh = ux;
          rI[yh(0x70a)](), rI[yh(0x94b)](this["x"], this["y"]);
          if (this[yh(0x307)] === cR[yh(0x4ec)]) {
            rI[yh(0x317)](this[yh(0x88c)]);
            const rJ = this[yh(0x445)],
              rK = pH(
                rI,
                yh(0xf0c) + this[yh(0x445)],
                rJ * 2.2,
                rJ * 2.2,
                (rM) => {
                  const yi = yh;
                  rM[yi(0x94b)](rJ * 1.1, rJ * 1.1), lK(rM, rJ);
                },
                !![]
              ),
              rL = this[yh(0x256)] + this[yh(0xda0)] * 0.5;
            (rI[yh(0x442)] = (0x1 - this[yh(0xda0)]) * 0.3),
              rI[yh(0xd3a)](rL, rL),
              rI[yh(0x377)](
                rK,
                -rK[yh(0xd74)] / 0x2,
                -rK[yh(0xb3b)] / 0x2,
                rK[yh(0xd74)],
                rK[yh(0xb3b)]
              );
          } else {
            if (this[yh(0x307)] === cR[yh(0x93e)]) {
              let rM = this[yh(0x256)] + this[yh(0xda0)] * 0.5;
              (rI[yh(0x442)] = 0x1 - this[yh(0xda0)]), (rI[yh(0x442)] *= 0.9);
              const rN =
                0.93 +
                0.07 *
                  (Math[yh(0x4ce)](
                    Date[yh(0x296)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              rM *= rN;
              const rO = this[yh(0x445)],
                rP = pH(
                  rI,
                  yh(0xb5b) + this[yh(0x445)],
                  rO * 2.2,
                  rO * 2.2,
                  (rQ) => {
                    const yj = yh;
                    rQ[yj(0x94b)](rO * 1.1, rO * 1.1);
                    const rR = rO / 0x64;
                    rQ[yj(0xd3a)](rR, rR),
                      lF(rQ, 0x5c),
                      (rQ[yj(0x5ce)] = rQ[yj(0x339)] = yj(0xcec)),
                      (rQ[yj(0x9b8)] = 0x28),
                      (rQ[yj(0x744)] = yj(0x775)),
                      rQ[yj(0x976)](),
                      (rQ[yj(0x756)] = yj(0xbb8)),
                      (rQ[yj(0x744)] = yj(0x953)),
                      (rQ[yj(0x9b8)] = 0xe),
                      rQ[yj(0x64e)](),
                      rQ[yj(0x976)]();
                  },
                  !![]
                );
              rI[yh(0xd3a)](rM, rM),
                rI[yh(0x377)](
                  rP,
                  -rP[yh(0xd74)] / 0x2,
                  -rP[yh(0xb3b)] / 0x2,
                  rP[yh(0xd74)],
                  rP[yh(0xb3b)]
                );
            } else {
              if (this[yh(0x307)] === cR[yh(0x2db)]) {
                rI[yh(0x70b)](this[yh(0x445)] / 0x32),
                  (rI[yh(0x5ce)] = yh(0xcec)),
                  rI[yh(0x70a)](),
                  (this[yh(0xb2d)] +=
                    ((this[yh(0x356)] >= 0x0 ? 0x1 : -0x1) * pR) / 0x12c),
                  (this[yh(0xb2d)] = Math[yh(0xeeb)](
                    0x1,
                    Math[yh(0xe6f)](0x0, this[yh(0xb2d)])
                  ));
                if (this[yh(0xb2d)] > 0x0) {
                  rI[yh(0x70b)](this[yh(0xb2d)]),
                    (rI[yh(0x442)] *= this[yh(0xb2d)]),
                    (rI[yh(0x9b8)] = 0.1),
                    (rI[yh(0x744)] = rI[yh(0x756)] = yh(0x527)),
                    (rI[yh(0x7a9)] = yh(0x9b4)),
                    (rI[yh(0x585)] = yh(0x81d) + iB);
                  const rR = yh(0x1d4) + (this[yh(0x356)] + 0x1);
                  lS(
                    rI,
                    rR,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rR[yh(0xf30)] * 0.09),
                    !![]
                  );
                }
                rI[yh(0xdea)]();
                const rQ = this[yh(0x7ef)]
                  ? 0.6
                  : ((this["id"] + Date[yh(0x296)]()) / 0x4b0) % 6.28;
                rI[yh(0x70a)]();
                for (let rS = 0x0; rS < 0x8; rS++) {
                  const rT = 0x1 - rS / 0x8,
                    rU = rT * 0x50;
                  rI[yh(0x317)](rQ),
                    (rI[yh(0x744)] = yh(0x603)),
                    rI[yh(0x936)](),
                    rI[yh(0x97c)](-rU / 0x2, -rU / 0x2, rU, rU),
                    rI[yh(0x7ce)](),
                    (rI[yh(0x9b8)] = 0x28),
                    rI[yh(0x976)](),
                    (rI[yh(0x9b8)] = 0x14),
                    rI[yh(0x976)]();
                }
                rI[yh(0xdea)]();
                if (!this[yh(0x373)]) {
                  this[yh(0x373)] = [];
                  for (let rV = 0x0; rV < 0x1e; rV++) {
                    this[yh(0x373)][yh(0xf33)]({
                      x: Math[yh(0x4a5)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rW = 0x0; rW < this[yh(0x373)][yh(0xf30)]; rW++) {
                  const rX = this[yh(0x373)][rW];
                  (rX["x"] += rX["v"]),
                    rX["x"] > 0x1 &&
                      ((rX["x"] %= 0x1),
                      (rX[yh(0x88c)] = Math[yh(0x4a5)]() * 6.28),
                      (rX["v"] = Math[yh(0x4a5)]() * 0.005 + 0.008),
                      (rX["s"] = Math[yh(0x4a5)]() * 0.025 + 0.008)),
                    rI[yh(0x70a)](),
                    (rI[yh(0x442)] =
                      rX["x"] < 0.2
                        ? rX["x"] / 0.2
                        : rX["x"] > 0.8
                        ? 0x1 - (rX["x"] - 0.8) / 0.2
                        : 0x1),
                    rI[yh(0xd3a)](0x5a, 0x5a),
                    rI[yh(0x317)](rX[yh(0x88c)]),
                    rI[yh(0x94b)](rX["x"], 0x0),
                    rI[yh(0x936)](),
                    rI[yh(0xb0a)](0x0, 0x0, rX["s"], 0x0, Math["PI"] * 0x2),
                    (rI[yh(0x756)] = yh(0x527)),
                    rI[yh(0x64e)](),
                    rI[yh(0xdea)]();
                }
              }
            }
          }
          rI[yh(0xdea)]();
        }
      },
      lM = 0x0,
      lN = 0x0,
      lO = class extends lL {
        constructor(rI, rJ, rK, rL) {
          const yk = ux;
          super(cR[yk(0x372)], rI, rJ, rK, 0x46),
            (this[yk(0x88c)] = (Math[yk(0x4a5)]() * 0x2 - 0x1) * 0.2),
            (this[yk(0x559)] = dB[rL]);
        }
        [ux(0xb75)]() {
          const yl = ux;
          if (this[yl(0x256)] < 0x2 || pQ - lM < 0x9c4) {
            this[yl(0x256)] += pR / 0x12c;
            return;
          }
          this[yl(0x2a0)] && (this[yl(0xda0)] += pR / 0xc8),
            this[yl(0x382)] &&
              ((this["x"] = px(this["x"], this[yl(0x382)]["x"], 0xc8)),
              (this["y"] = px(this["y"], this[yl(0x382)]["y"], 0xc8)));
        }
        [ux(0x989)](rI) {
          const ym = ux;
          if (this[ym(0x256)] === 0x0) return;
          rI[ym(0x70a)](), rI[ym(0x94b)](this["x"], this["y"]);
          const rJ = ym(0xcc8) + this[ym(0x559)]["id"];
          let rK =
            (this[ym(0x23a)] || lN < 0x3) &&
            pH(
              rI,
              rJ,
              0x78,
              0x78,
              (rN) => {
                const yn = ym;
                (this[yn(0x23a)] = !![]),
                  lN++,
                  rN[yn(0x94b)](0x3c, 0x3c),
                  (rN[yn(0x339)] = rN[yn(0x5ce)] = yn(0xcec)),
                  rN[yn(0x936)](),
                  rN[yn(0x97c)](-0x32, -0x32, 0x64, 0x64),
                  (rN[yn(0x9b8)] = 0x12),
                  (rN[yn(0x744)] = yn(0x86a)),
                  rN[yn(0x976)](),
                  (rN[yn(0x9b8)] = 0x8),
                  (rN[yn(0x756)] = hP[this[yn(0x559)][yn(0x257)]]),
                  rN[yn(0x64e)](),
                  (rN[yn(0x744)] = hQ[this[yn(0x559)][yn(0x257)]]),
                  rN[yn(0x976)]();
                const rO = pK(
                  rN,
                  this[yn(0x559)][yn(0x82f)],
                  0x12,
                  yn(0xaf3),
                  0x3,
                  !![]
                );
                rN[yn(0x377)](
                  rO,
                  -rO[yn(0xd74)] / 0x2,
                  0x32 - 0xd / 0x2 - rO[yn(0xb3b)],
                  rO[yn(0xd74)],
                  rO[yn(0xb3b)]
                ),
                  rN[yn(0x70a)](),
                  rN[yn(0x94b)](
                    0x0 + this[yn(0x559)][yn(0x592)],
                    -0x5 + this[yn(0x559)][yn(0xbfa)]
                  ),
                  this[yn(0x559)][yn(0xd19)](rN),
                  rN[yn(0xdea)]();
              },
              !![]
            );
          if (!rK) rK = pG[rJ];
          rI[ym(0x317)](this[ym(0x88c)]);
          const rL = Math[ym(0xeeb)](this[ym(0x256)], 0x1),
            rM =
              (this[ym(0x445)] / 0x64) *
              (0x1 +
                Math[ym(0x4ce)](Date[ym(0x296)]() / 0xfa + this["id"]) * 0.05) *
              rL *
              (0x1 - this[ym(0xda0)]);
          rI[ym(0xd3a)](rM, rM),
            rI[ym(0x317)](Math["PI"] * lJ(0x1 - rL)),
            rK
              ? rI[ym(0x377)](
                  rK,
                  -rK[ym(0xd74)] / 0x2,
                  -rK[ym(0xb3b)] / 0x2,
                  rK[ym(0xd74)],
                  rK[ym(0xb3b)]
                )
              : (rI[ym(0x936)](),
                rI[ym(0x97c)](-0x3c, -0x3c, 0x78, 0x78),
                (rI[ym(0x756)] = hP[this[ym(0x559)][ym(0x257)]]),
                rI[ym(0x64e)]()),
            rI[ym(0xdea)]();
        }
      };
    function lP(rI) {
      const yo = ux;
      rI[yo(0x936)](),
        rI[yo(0xba7)](0x0, 4.5),
        rI[yo(0x38c)](3.75, 0x0, 0x0, -4.5),
        rI[yo(0x38c)](-3.75, 0x0, 0x0, 4.5),
        rI[yo(0x7ce)](),
        (rI[yo(0x339)] = rI[yo(0x5ce)] = yo(0xcec)),
        (rI[yo(0x756)] = rI[yo(0x744)] = yo(0x8cd)),
        (rI[yo(0x9b8)] = 0x1),
        rI[yo(0x976)](),
        rI[yo(0x64e)](),
        rI[yo(0xc11)](),
        rI[yo(0x936)](),
        rI[yo(0xb0a)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, l1),
        (rI[yo(0x756)] = yo(0x43e)),
        rI[yo(0x64e)]();
    }
    function lQ(rI, rJ = ![]) {
      const yp = ux;
      lR(rI, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lR(rI, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rJ) {
        const rK = Math["PI"] / 0x7;
        rI[yp(0x936)](),
          rI[yp(0xb0a)](0x0, 0x0, 23.5, Math["PI"] + rK, Math["PI"] * 0x2 - rK),
          (rI[yp(0x744)] = yp(0x3d0)),
          (rI[yp(0x9b8)] = 0x4),
          (rI[yp(0x339)] = yp(0xcec)),
          rI[yp(0x976)]();
      }
    }
    function lR(rI, rJ, rK) {
      const yq = ux;
      rI[yq(0x70a)](),
        rI[yq(0x317)](rJ),
        rI[yq(0x94b)](0x0, -23.6),
        rI[yq(0x317)](rK),
        rI[yq(0x936)](),
        rI[yq(0xba7)](-6.5, 0x1),
        rI[yq(0xce8)](0x0, -0xf),
        rI[yq(0xce8)](6.5, 0x1),
        (rI[yq(0x756)] = yq(0x447)),
        (rI[yq(0x9b8)] = 3.5),
        rI[yq(0x64e)](),
        (rI[yq(0x5ce)] = yq(0xcec)),
        (rI[yq(0x744)] = yq(0x3d0)),
        rI[yq(0x976)](),
        rI[yq(0xdea)]();
    }
    function lS(rI, rJ, rK, rL, rM, rN, rO = ![]) {
      const yr = ux;
      var rP = rJ[yr(0xf30)],
        rQ;
      rI[yr(0x70a)](),
        rI[yr(0x94b)](rK, rL),
        rI[yr(0x317)]((0x1 * rN) / 0x2),
        rI[yr(0x317)]((0x1 * (rN / rP)) / 0x2),
        (rI[yr(0x5e9)] = yr(0x420));
      for (var rR = 0x0; rR < rP; rR++) {
        rI[yr(0x317)](-rN / rP),
          rI[yr(0x70a)](),
          rI[yr(0x94b)](0x0, rM),
          (rQ = rJ[rR]),
          rO && rI[yr(0x480)](rQ, 0x0, 0x0),
          rI[yr(0x61e)](rQ, 0x0, 0x0),
          rI[yr(0xdea)]();
      }
      rI[yr(0xdea)]();
    }
    function lT(rI, rJ = 0x1) {
      const ys = ux,
        rK = 0xf;
      rI[ys(0x936)]();
      const rL = 0x6;
      for (let rQ = 0x0; rQ < rL; rQ++) {
        const rR = (rQ / rL) * Math["PI"] * 0x2;
        rI[ys(0xce8)](Math[ys(0x5a6)](rR) * rK, Math[ys(0x4ce)](rR) * rK);
      }
      rI[ys(0x7ce)](),
        (rI[ys(0x9b8)] = 0x4),
        (rI[ys(0x744)] = ys(0xbd5)),
        rI[ys(0x976)](),
        (rI[ys(0x756)] = ys(0x922)),
        rI[ys(0x64e)]();
      const rM = (Math["PI"] * 0x2) / rL,
        rN = Math[ys(0x5a6)](rM) * rK,
        rO = Math[ys(0x4ce)](rM) * rK;
      for (let rS = 0x0; rS < rL; rS++) {
        rI[ys(0x936)](),
          rI[ys(0xba7)](0x0, 0x0),
          rI[ys(0xce8)](rK, 0x0),
          rI[ys(0xce8)](rN, rO),
          rI[ys(0x7ce)](),
          (rI[ys(0x756)] =
            ys(0x64a) + (0.2 + (((rS + 0x4) % rL) / rL) * 0.35) + ")"),
          rI[ys(0x64e)](),
          rI[ys(0x317)](rM);
      }
      rI[ys(0x936)]();
      const rP = rK * 0.65;
      for (let rT = 0x0; rT < rL; rT++) {
        const rU = (rT / rL) * Math["PI"] * 0x2;
        rI[ys(0xce8)](Math[ys(0x5a6)](rU) * rP, Math[ys(0x4ce)](rU) * rP);
      }
      (rI[ys(0xb3c)] = 0x23 + rJ * 0xf),
        (rI[ys(0xd65)] = rI[ys(0x756)] = ys(0x5bb)),
        rI[ys(0x64e)](),
        rI[ys(0x64e)](),
        rI[ys(0x64e)]();
    }
    var lU = class extends lH {
        constructor(rI, rJ, rK, rL, rM, rN, rO) {
          const yt = ux;
          super(rI, cR[yt(0xa16)], rJ, rK, rL, rO, rM),
            (this[yt(0xd9f)] = rN),
            (this[yt(0x595)] = 0x0),
            (this[yt(0xc42)] = 0x0),
            (this[yt(0x253)] = 0x0),
            (this[yt(0x4c6)] = 0x0),
            (this[yt(0x80e)] = ""),
            (this[yt(0x1d8)] = 0x0),
            (this[yt(0x702)] = !![]),
            (this[yt(0x999)] = ![]),
            (this[yt(0xc62)] = ![]),
            (this[yt(0x1db)] = ![]),
            (this[yt(0x9c9)] = ![]),
            (this[yt(0x70f)] = ![]),
            (this[yt(0x988)] = !![]),
            (this[yt(0xeef)] = 0x0),
            (this[yt(0x4ff)] = 0x0);
        }
        [ux(0xb75)]() {
          const yu = ux;
          super[yu(0xb75)]();
          if (this[yu(0x2a0)]) (this[yu(0xc42)] = 0x1), (this[yu(0x595)] = 0x0);
          else {
            const rI = pR / 0xc8;
            let rJ = this[yu(0xd9f)];
            if (this[yu(0x999)] && rJ === cX[yu(0xd25)]) rJ = cX[yu(0xcc1)];
            (this[yu(0x595)] = Math[yu(0xeeb)](
              0x1,
              Math[yu(0xe6f)](
                0x0,
                this[yu(0x595)] + (rJ === cX[yu(0x9d3)] ? rI : -rI)
              )
            )),
              (this[yu(0xc42)] = Math[yu(0xeeb)](
                0x1,
                Math[yu(0xe6f)](
                  0x0,
                  this[yu(0xc42)] + (rJ === cX[yu(0xcc1)] ? rI : -rI)
                )
              )),
              (this[yu(0xeef)] = px(this[yu(0xeef)], this[yu(0x4ff)], 0x64));
          }
        }
        [ux(0x989)](rI) {
          const yv = ux;
          rI[yv(0x70a)](), rI[yv(0x94b)](this["x"], this["y"]);
          let rJ = this[yv(0x445)] / l0;
          this[yv(0x2a0)] &&
            rI[yv(0x317)]((this[yv(0xda0)] * Math["PI"]) / 0x4);
          rI[yv(0xd3a)](rJ, rJ), this[yv(0x654)](rI);
          this[yv(0xa99)] &&
            (rI[yv(0x70a)](),
            rI[yv(0x317)](this[yv(0x88c)]),
            rI[yv(0x70b)](this[yv(0x445)] / 0x28 / rJ),
            this[yv(0x492)](rI),
            rI[yv(0xdea)]());
          this[yv(0x3f8)] &&
            (rI[yv(0x70a)](),
            rI[yv(0x70b)](l0 / 0x12),
            this[yv(0x6a3)](rI, pQ / 0x12c),
            rI[yv(0xdea)]());
          const rK = yv(0x3d0);
          if (this[yv(0x7ee)]) {
            const rW = Date[yv(0x296)](),
              rX = (Math[yv(0x4ce)](rW / 0x12c) * 0.5 + 0.5) * 0x2;
            rI[yv(0x936)](),
              rI[yv(0xba7)](0x5, -0x22),
              rI[yv(0xa6e)](0x2f, -0x19, 0x14, 0x5, 0x2b - rX, 0x19),
              rI[yv(0x38c)](0x0, 0x28 + rX * 0.6, -0x2b + rX, 0x19),
              rI[yv(0xa6e)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rI[yv(0x38c)](0x0, -0x23, 0x5, -0x22),
              (rI[yv(0x756)] = rK),
              rI[yv(0x64e)]();
          }
          this[yv(0x70f)] && lQ(rI);
          const rL = {};
          rL[yv(0x4a8)] = [yv(0x417), yv(0xe9b)];
          const rM = rL,
            rN = this[yv(0x9c9)]
              ? [yv(0x5fa), yv(0x542)]
              : this[yv(0x56a)]
              ? [yv(0xb08), yv(0xc5b)]
              : rM[this[yv(0xe47)]] || [yv(0x985), yv(0x396)];
          (rN[0x0] = this[yv(0xb66)](rN[0x0])),
            (rN[0x1] = this[yv(0xb66)](rN[0x1]));
          let rO = 2.75;
          !this[yv(0x56a)] && (rO /= rJ);
          (rI[yv(0x756)] = rN[0x0]),
            (rI[yv(0x9b8)] = rO),
            (rI[yv(0x744)] = rN[0x1]);
          this[yv(0x56a)] &&
            (rI[yv(0x936)](),
            rI[yv(0xba7)](0x0, 0x0),
            rI[yv(0x38c)](-0x1e, 0xf, -0x1e, 0x1e),
            rI[yv(0x38c)](0x0, 0x37, 0x1e, 0x1e),
            rI[yv(0x38c)](0x1e, 0xf, 0x0, 0x0),
            rI[yv(0x64e)](),
            rI[yv(0x976)](),
            rI[yv(0x70a)](),
            (rI[yv(0x756)] = rI[yv(0x744)]),
            (rI[yv(0x7a9)] = yv(0x9b4)),
            (rI[yv(0x585)] = yv(0x324) + iB),
            lS(rI, yv(0x8e4), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rI[yv(0xdea)]());
          rI[yv(0x936)]();
          this[yv(0x6f4)]
            ? !this[yv(0x7ee)]
              ? rI[yv(0x97c)](-0x19, -0x19, 0x32, 0x32)
              : (rI[yv(0xba7)](0x19, 0x19),
                rI[yv(0xce8)](-0x19, 0x19),
                rI[yv(0xce8)](-0x19, -0xa),
                rI[yv(0xce8)](-0xa, -0x19),
                rI[yv(0xce8)](0xa, -0x19),
                rI[yv(0xce8)](0x19, -0xa),
                rI[yv(0x7ce)]())
            : rI[yv(0xb0a)](0x0, 0x0, l0, 0x0, l1);
          rI[yv(0x64e)](), rI[yv(0x976)]();
          this[yv(0xab0)] &&
            (rI[yv(0x70a)](),
            rI[yv(0xc11)](),
            rI[yv(0x936)](),
            !this[yv(0x7ee)] &&
              (rI[yv(0xba7)](-0x8, -0x1e),
              rI[yv(0xce8)](0xf, -0x7),
              rI[yv(0xce8)](0x1e, -0x14),
              rI[yv(0xce8)](0x1e, -0x32)),
            rI[yv(0x94b)](
              0x0,
              0x2 * (0x1 - (this[yv(0xc42)] + this[yv(0x595)]))
            ),
            rI[yv(0xba7)](-0x2, 0x0),
            rI[yv(0xce8)](-0x3, 4.5),
            rI[yv(0xce8)](0x3, 4.5),
            rI[yv(0xce8)](0x2, 0x0),
            (rI[yv(0x756)] = yv(0x8cd)),
            rI[yv(0x64e)](),
            rI[yv(0xdea)]());
          this[yv(0x7ee)] &&
            (rI[yv(0x936)](),
            rI[yv(0xba7)](0x0, -0x17),
            rI[yv(0x38c)](0x4, -0xd, 0x1b, -0x8),
            rI[yv(0xce8)](0x14, -0x1c),
            rI[yv(0xce8)](-0x14, -0x1c),
            rI[yv(0xce8)](-0x1b, -0x8),
            rI[yv(0x38c)](-0x4, -0xd, 0x0, -0x17),
            (rI[yv(0x756)] = rK),
            rI[yv(0x64e)]());
          if (this[yv(0xf10)]) {
            (rI[yv(0x744)] = yv(0xaa2)),
              (rI[yv(0x9b8)] = 1.4),
              rI[yv(0x936)](),
              (rI[yv(0x339)] = yv(0xcec));
            const rY = 4.5;
            for (let rZ = 0x0; rZ < 0x2; rZ++) {
              const s0 = -0x12 + rZ * 0x1d;
              for (let s1 = 0x0; s1 < 0x3; s1++) {
                const s2 = s0 + s1 * 0x3;
                rI[yv(0xba7)](s2, rY + -1.5), rI[yv(0xce8)](s2 + 1.6, rY + 1.6);
              }
            }
            rI[yv(0x976)]();
          }
          if (this[yv(0x653)]) {
            rI[yv(0x936)](),
              rI[yv(0xb0a)](0x0, 2.5, 3.3, 0x0, l1),
              (rI[yv(0x756)] = yv(0x27a)),
              rI[yv(0x64e)](),
              rI[yv(0x936)](),
              rI[yv(0xb0a)](0xd, 2.8, 5.5, 0x0, l1),
              rI[yv(0xb0a)](-0xd, 2.8, 5.5, 0x0, l1),
              (rI[yv(0x756)] = yv(0x2d7)),
              rI[yv(0x64e)](),
              rI[yv(0x70a)](),
              rI[yv(0x317)](-Math["PI"] / 0x4),
              rI[yv(0x936)]();
            const s3 = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[yv(0x6f4)] &&
              s3[yv(0x45f)]((s4) => {
                (s4[0x0] *= 1.1), (s4[0x1] *= 1.1);
              });
            for (let s4 = 0x0; s4 < 0x2; s4++) {
              for (let s5 = 0x0; s5 < s3[yv(0xf30)]; s5++) {
                const s6 = s3[s5];
                rI[yv(0xba7)](s6[0x0], s6[0x1]), rI[yv(0xb0a)](...s6, 0x0, l1);
              }
              rI[yv(0x317)](-Math["PI"] / 0x2);
            }
            (rI[yv(0x756)] = yv(0x2a4)), rI[yv(0x64e)](), rI[yv(0xdea)]();
          }
          const rP = this[yv(0x595)],
            rQ = this[yv(0xc42)],
            rR = 0x6 * rP,
            rS = 0x4 * rQ;
          function rT(s7, s8) {
            const yw = yv;
            rI[yw(0x936)]();
            const s9 = 3.25;
            rI[yw(0xba7)](s7 - s9, s8 - s9),
              rI[yw(0xce8)](s7 + s9, s8 + s9),
              rI[yw(0xba7)](s7 + s9, s8 - s9),
              rI[yw(0xce8)](s7 - s9, s8 + s9),
              (rI[yw(0x9b8)] = 0x2),
              (rI[yw(0x339)] = yw(0xcec)),
              (rI[yw(0x744)] = yw(0x8cd)),
              rI[yw(0x976)](),
              rI[yw(0x7ce)]();
          }
          function rU(s7, s8) {
            const yx = yv;
            rI[yx(0x70a)](),
              rI[yx(0x94b)](s7, s8),
              rI[yx(0x936)](),
              rI[yx(0xba7)](-0x4, 0x0),
              rI[yx(0x38c)](0x0, 0x6, 0x4, 0x0),
              (rI[yx(0x9b8)] = 0x2),
              (rI[yx(0x339)] = yx(0xcec)),
              (rI[yx(0x744)] = yx(0x8cd)),
              rI[yx(0x976)](),
              rI[yx(0xdea)]();
          }
          if (this[yv(0x2a0)]) rT(0x7, -0x5), rT(-0x7, -0x5);
          else {
            if (this[yv(0xc18)]) rU(0x7, -0x5), rU(-0x7, -0x5);
            else {
              let s7 = function (s9, sa, sb, sc, se = 0x0) {
                  const yy = yv,
                    sf = se ^ 0x1;
                  rI[yy(0xba7)](s9 - sb, sa - sc + se * rR + sf * rS),
                    rI[yy(0xce8)](s9 + sb, sa - sc + sf * rR + se * rS),
                    rI[yy(0xce8)](s9 + sb, sa + sc),
                    rI[yy(0xce8)](s9 - sb, sa + sc),
                    rI[yy(0xce8)](s9 - sb, sa - sc);
                },
                s8 = function (s9 = 0x0) {
                  const yz = yv;
                  rI[yz(0x936)](),
                    rI[yz(0x486)](0x7, -0x5, 2.5 + s9, 0x6 + s9, 0x0, 0x0, l1),
                    rI[yz(0xba7)](-0x7, -0x5),
                    rI[yz(0x486)](-0x7, -0x5, 2.5 + s9, 0x6 + s9, 0x0, 0x0, l1),
                    (rI[yz(0x744)] = rI[yz(0x756)] = yz(0x8cd)),
                    rI[yz(0x64e)]();
                };
              rI[yv(0x70a)](),
                rI[yv(0x936)](),
                s7(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                s7(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rI[yv(0xc11)](),
                s8(0.7),
                s8(0x0),
                rI[yv(0xc11)](),
                rI[yv(0x936)](),
                rI[yv(0xb0a)](
                  0x7 + this[yv(0x253)] * 0x2,
                  -0x5 + this[yv(0x4c6)] * 3.5,
                  3.1,
                  0x0,
                  l1
                ),
                rI[yv(0xba7)](-0x7, -0x5),
                rI[yv(0xb0a)](
                  -0x7 + this[yv(0x253)] * 0x2,
                  -0x5 + this[yv(0x4c6)] * 3.5,
                  3.1,
                  0x0,
                  l1
                ),
                (rI[yv(0x756)] = yv(0x43e)),
                rI[yv(0x64e)](),
                rI[yv(0xdea)]();
            }
          }
          if (this[yv(0x1db)]) {
            rI[yv(0x70a)](), rI[yv(0x94b)](0x0, -0xc);
            if (this[yv(0x2a0)]) rI[yv(0xd3a)](0.7, 0.7), rT(0x0, -0x3);
            else
              this[yv(0xc18)]
                ? (rI[yv(0xd3a)](0.7, 0.7), rU(0x0, -0x3))
                : lP(rI);
            rI[yv(0xdea)]();
          }
          this[yv(0xc62)] &&
            (rI[yv(0x70a)](),
            rI[yv(0x94b)](0x0, 0xa),
            rI[yv(0x317)](-Math["PI"] / 0x2),
            rI[yv(0xd3a)](0.82, 0.82),
            this[yv(0x202)](rI, ![], 0.85),
            rI[yv(0xdea)]());
          const rV = rP * (-0x5 - 5.5) + rQ * (-0x5 - 0x4);
          rI[yv(0x70a)](),
            rI[yv(0x936)](),
            rI[yv(0x94b)](0x0, 9.5),
            rI[yv(0xba7)](-5.6, 0x0),
            rI[yv(0x38c)](0x0, 0x5 + rV, 5.6, 0x0),
            (rI[yv(0x339)] = yv(0xcec));
          this[yv(0x653)]
            ? ((rI[yv(0x9b8)] = 0x7),
              (rI[yv(0x744)] = yv(0x27a)),
              rI[yv(0x976)](),
              (rI[yv(0x744)] = yv(0x9cd)))
            : (rI[yv(0x744)] = yv(0x8cd));
          (rI[yv(0x9b8)] = 1.75), rI[yv(0x976)](), rI[yv(0xdea)]();
          if (this[yv(0x813)]) {
            const s9 = this[yv(0x595)],
              sa = 0x28,
              sb = Date[yv(0x296)]() / 0x12c,
              sc = this[yv(0x56a)] ? 0x0 : Math[yv(0x4ce)](sb) * 0.5 + 0.5,
              se = sc * 0x4,
              sf = 0x28 - sc * 0x4,
              sg = sf - (this[yv(0x56a)] ? 0x1 : jg(s9)) * 0x50,
              sh = this[yv(0xab0)];
            (rI[yv(0x9b8)] = 0x9 + rO * 0x2),
              (rI[yv(0x5ce)] = yv(0xcec)),
              (rI[yv(0x339)] = yv(0xcec));
            for (let si = 0x0; si < 0x2; si++) {
              rI[yv(0x936)](), rI[yv(0x70a)]();
              for (let sj = 0x0; sj < 0x2; sj++) {
                rI[yv(0xba7)](0x19, 0x0);
                let sk = sg;
                sh && sj === 0x0 && (sk = sf),
                  rI[yv(0x38c)](0x2d + se, sk * 0.5, 0xb, sk),
                  rI[yv(0xd3a)](-0x1, 0x1);
              }
              rI[yv(0xdea)](),
                (rI[yv(0x744)] = rN[0x1 - si]),
                rI[yv(0x976)](),
                (rI[yv(0x9b8)] = 0x9);
            }
            rI[yv(0x70a)](),
              rI[yv(0x94b)](0x0, sg),
              lT(rI, sc),
              rI[yv(0xdea)]();
          }
          rI[yv(0xdea)]();
        }
        [ux(0x783)](rI, rJ) {}
        [ux(0x605)](rI, rJ = 0x1) {
          const yA = ux,
            rK = nk[this["id"]];
          if (!rK) return;
          for (let rL = 0x0; rL < rK[yA(0xf30)]; rL++) {
            const rM = rK[rL];
            if (rM["t"] > lW + lX) continue;
            !rM["x"] &&
              ((rM["x"] = this["x"]),
              (rM["y"] = this["y"] - this[yA(0x445)] - 0x44),
              (rM[yA(0x69e)] = this["x"]),
              (rM[yA(0x3c8)] = this["y"]));
            const rN = rM["t"] > lW ? 0x1 - (rM["t"] - lW) / lX : 0x1,
              rO = rN * rN * rN;
            (rM["x"] += (this["x"] - rM[yA(0x69e)]) * rO),
              (rM["y"] += (this["y"] - rM[yA(0x3c8)]) * rO),
              (rM[yA(0x69e)] = this["x"]),
              (rM[yA(0x3c8)] = this["y"]);
            const rP = Math[yA(0xeeb)](0x1, rM["t"] / 0x64);
            rI[yA(0x70a)](),
              (rI[yA(0x442)] = (rN < 0.7 ? rN / 0.7 : 0x1) * rP * 0.9),
              rI[yA(0x94b)](rM["x"], rM["y"] - (rM["t"] / lW) * 0x14),
              rI[yA(0x70b)](rJ);
            const rQ = pK(rI, rM[yA(0x37e)], 0x10, yA(0x909), 0x0, !![], ![]);
            rI[yA(0x70b)](rP), rI[yA(0x936)]();
            const rR = rQ[yA(0xd74)] + 0xa,
              rS = rQ[yA(0xb3b)] + 0xf;
            rI[yA(0x348)]
              ? rI[yA(0x348)](-rR / 0x2, -rS / 0x2, rR, rS, 0x5)
              : rI[yA(0x97c)](-rR / 0x2, -rS / 0x2, rR, rS),
              (rI[yA(0x756)] = rM[yA(0x31e)]),
              rI[yA(0x64e)](),
              (rI[yA(0x744)] = yA(0x909)),
              (rI[yA(0x9b8)] = 1.5),
              rI[yA(0x976)](),
              rI[yA(0x377)](
                rQ,
                -rQ[yA(0xd74)] / 0x2,
                -rQ[yA(0xb3b)] / 0x2,
                rQ[yA(0xd74)],
                rQ[yA(0xb3b)]
              ),
              rI[yA(0xdea)]();
          }
        }
      },
      lV = 0x4e20,
      lW = 0xfa0,
      lX = 0xbb8,
      lY = lW + lX;
    function lZ(rI, rJ, rK = 0x1) {
      const yB = ux;
      if (rI[yB(0x2a0)]) return;
      rJ[yB(0x70a)](),
        rJ[yB(0x94b)](rI["x"], rI["y"]),
        m0(rI, rJ, void 0x0, rK),
        rJ[yB(0x94b)](0x0, -rI[yB(0x445)] - 0x19),
        rJ[yB(0x70a)](),
        rJ[yB(0x70b)](rK),
        rI[yB(0xe47)] &&
          (pK(rJ, "@" + rI[yB(0xe47)], 0xb, yB(0xf1e), 0x3),
          rJ[yB(0x94b)](0x0, -0x10)),
        rI[yB(0x80e)] &&
          (pK(rJ, rI[yB(0x80e)], 0x12, yB(0xaf3), 0x3),
          rJ[yB(0x94b)](0x0, -0x5)),
        rJ[yB(0xdea)](),
        !rI[yB(0x988)] &&
          rI[yB(0xdd2)] > 0.001 &&
          ((rJ[yB(0x442)] = rI[yB(0xdd2)]),
          rJ[yB(0xd3a)](rI[yB(0xdd2)] * 0x3, rI[yB(0xdd2)] * 0x3),
          rJ[yB(0x936)](),
          rJ[yB(0xb0a)](0x0, 0x0, 0x14, 0x0, l1),
          (rJ[yB(0x756)] = yB(0x8cd)),
          rJ[yB(0x64e)](),
          nC(rJ, 0.8),
          rJ[yB(0x936)](),
          rJ[yB(0xb0a)](0x0, 0x0, 0x14, 0x0, l1),
          (rJ[yB(0x756)] = yB(0x7d3)),
          rJ[yB(0x64e)](),
          rJ[yB(0x936)](),
          rJ[yB(0xba7)](0x0, 0x0),
          rJ[yB(0xb0a)](0x0, 0x0, 0x10, 0x0, l1 * rI[yB(0x60d)]),
          rJ[yB(0xce8)](0x0, 0x0),
          rJ[yB(0xc11)](),
          nC(rJ, 0.8)),
        rJ[yB(0xdea)]();
    }
    function m0(rI, rJ, rK = ![], rL = 0x1) {
      const yC = ux;
      if (rI[yC(0x9df)] <= 0x0) return;
      rJ[yC(0x70a)](),
        (rJ[yC(0x442)] = rI[yC(0x9df)]),
        (rJ[yC(0x744)] = yC(0x3d0)),
        rJ[yC(0x936)]();
      const rM = rK ? 0x8c : rI[yC(0x988)] ? 0x4b : 0x64;
      let rN = rK ? 0x1a : 0x9;
      const rO = !rK && pc[yC(0xedc)];
      rO && (rN += 0x14);
      if (rK) rJ[yC(0x94b)](rI[yC(0x445)] + 0x11, 0x0);
      else {
        if (rI[yC(0x988)] ? pc[yC(0x9bd)] : pc[yC(0xc15)])
          rJ[yC(0x94b)](0x0, rI[yC(0x445)]),
            rJ[yC(0x70b)](rL),
            rJ[yC(0x94b)](-rM / 0x2, rN / 0x2 + 0x14);
        else {
          const rQ = Math[yC(0xe6f)](0x1, rI[yC(0x445)] / 0x64);
          rJ[yC(0xd3a)](rQ, rQ),
            rJ[yC(0x94b)](-rM / 0x2, rI[yC(0x445)] / rQ + 0x1b);
        }
      }
      rJ[yC(0x936)](),
        rJ[yC(0xba7)](rK ? -0x14 : 0x0, 0x0),
        rJ[yC(0xce8)](rM, 0x0),
        (rJ[yC(0x339)] = yC(0xcec)),
        (rJ[yC(0x9b8)] = rN),
        (rJ[yC(0x744)] = yC(0x3d0)),
        rJ[yC(0x976)]();
      function rP(rR) {
        const yD = yC;
        rJ[yD(0x442)] = rR < 0.05 ? rR / 0.05 : 0x1;
      }
      rI[yC(0x914)] > 0x0 &&
        (rP(rI[yC(0x914)]),
        rJ[yC(0x936)](),
        rJ[yC(0xba7)](0x0, 0x0),
        rJ[yC(0xce8)](rI[yC(0x914)] * rM, 0x0),
        (rJ[yC(0x9b8)] = rN * (rK ? 0.55 : 0.44)),
        (rJ[yC(0x744)] = yC(0x2fd)),
        rJ[yC(0x976)]());
      rI[yC(0x2fa)] > 0x0 &&
        (rP(rI[yC(0x2fa)]),
        rJ[yC(0x936)](),
        rJ[yC(0xba7)](0x0, 0x0),
        rJ[yC(0xce8)](rI[yC(0x2fa)] * rM, 0x0),
        (rJ[yC(0x9b8)] = rN * (rK ? 0.7 : 0.66)),
        (rJ[yC(0x744)] = yC(0x6a0)),
        rJ[yC(0x976)]());
      rI[yC(0xeef)] &&
        (rP(rI[yC(0xeef)]),
        rJ[yC(0x936)](),
        rJ[yC(0xba7)](0x0, 0x0),
        rJ[yC(0xce8)](rI[yC(0xeef)] * rM, 0x0),
        (rJ[yC(0x9b8)] = rN * (rK ? 0.45 : 0.35)),
        (rJ[yC(0x744)] = yC(0x88e)),
        rJ[yC(0x976)]());
      if (rI[yC(0x988)]) {
        rJ[yC(0x442)] = 0x1;
        hack.updatePlayer(rI);
        var hp = Math.round(rI.health * hack.hp);
        var shield = Math.round(rI.shield * hack.hp);
        const rR = pK(
          rJ,
          (rI.username == hack.player.name ? `HP ${hp}${shield ? " + " + shield : ""} ` : '')+yC(0x797) + (rI[yC(0x1d8)] + 0x1),
          rK ? 0xc : 0xe,
          yC(0xaf3),
          0x3,
          !![]
        );
        rJ[yC(0x377)](
          rR,
          rM + rN / 0x2 - rR[yC(0xd74)],
          rN / 0x2,
          rR[yC(0xd74)],
          rR[yC(0xb3b)]
        );
        if (rK) {
          const rS = pK(rJ, "@" + rI[yC(0xe47)], 0xc, yC(0xf1e), 0x3, !![]);
          rJ[yC(0x377)](
            rS,
            -rN / 0x2,
            -rN / 0x2 - rS[yC(0xb3b)],
            rS[yC(0xd74)],
            rS[yC(0xb3b)]
          );
        }
      } else {
        rJ[yC(0x442)] = 0x1;
        const rT = kd[rI[yC(0x307)]],
          rU = pK(rJ, rT, 0xe, yC(0xaf3), 0x3, !![], rI[yC(0xf2f)]);
        rJ[yC(0x70a)](), rJ[yC(0x94b)](0x0, -rN / 0x2 - rU[yC(0xb3b)]);
        rU[yC(0xd74)] > rM + rN
          ? rJ[yC(0x377)](
              rU,
              rM / 0x2 - rU[yC(0xd74)] / 0x2,
              0x0,
              rU[yC(0xd74)],
              rU[yC(0xb3b)]
            )
          : rJ[yC(0x377)](rU, -rN / 0x2, 0x0, rU[yC(0xd74)], rU[yC(0xb3b)]);
        rJ[yC(0xdea)]();
        const rV = pK(rJ, rI[yC(0xf2f)], 0xe, hO[rI[yC(0xf2f)]], 0x3, !![]);
        rJ[yC(0x377)](
          rV,
          rM + rN / 0x2 - rV[yC(0xd74)],
          rN / 0x2,
          rV[yC(0xd74)],
          rV[yC(0xb3b)]
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
        let rW = m1(rI[yC(0x2fa)]);
        rI[yC(0xeef)] > 0x0 && (rW += yC(0xe2c) + m1(rI[yC(0xeef)])),
          rJ[yC(0x70a)](),
          rJ[yC(0x94b)](rM / 0x2, 0x0),
          pK(
            rJ,
            rW,
            0xe,
            yC(0xaf3),
            0x3,
            void 0x0,
            (rI[yC(0x988)] ? 0x1 : 0x0) +
              "_" +
              Math[yC(0xe3c)](rI[yC(0x445)] / 0x64)
          ),
          rJ[yC(0xdea)]();
      }
      rK &&
        rI[yC(0x80e)] &&
        ((rJ[yC(0x442)] = 0x1),
        rJ[yC(0x94b)](rM / 0x2, 0x0),
        pK(rJ, rI[yC(0x80e)], 0x11, yC(0xaf3), 0x3)),
        rJ[yC(0xdea)]();
    }
    function m1(rI) {
      const yE = ux,
        rJ = {};
      return (rJ[yE(0x1dd)] = 0x2), (rI * 0x64)[yE(0xc5e)](yE(0x63d), rJ) + "%";
    }
    function m2(rI) {
      const yF = ux;
      for (let rJ in oG) {
        oG[rJ][yF(0x415)](rI);
      }
      oZ();
    }
    var m3 = {},
      m4 = document[ux(0x9e3)](ux(0xebb));
    mJ(ux(0x843), ux(0x2f6), ux(0x955)),
      mJ(ux(0x4d7), ux(0xebb), ux(0xe18)),
      mJ(ux(0x34d), ux(0xdff), ux(0x2df), () => {
        const yG = ux;
        (hu = ![]), (hC[yG(0x2df)] = fb);
      }),
      mJ(ux(0xd64), ux(0x360), ux(0xb42)),
      mJ(ux(0x8b1), ux(0x245), ux(0x4ed)),
      mJ(ux(0x3d9), ux(0xc35), ux(0x20d)),
      mJ(ux(0x937), ux(0xbe3), ux(0x940)),
      mJ(ux(0xadc), ux(0xc7d), ux(0xd81)),
      mJ(ux(0x89e), ux(0xf0d), ux(0x7f8)),
      mJ(ux(0x85f), ux(0xd5e), "lb"),
      mJ(ux(0xe89), ux(0xc33), ux(0x8cb)),
      mJ(ux(0x742), ux(0xa75), ux(0x4e4), () => {
        const yH = ux;
        (mk[yH(0x5f5)][yH(0x4f9)] = yH(0xdf2)), (hC[yH(0x4e4)] = mj);
      }),
      mJ(ux(0x819), ux(0x9e1), ux(0x5e2), () => {
        const yI = ux;
        if (!hX) return;
        im(new Uint8Array([cH[yI(0x67a)]]));
      });
    var m5 = document[ux(0x9e3)](ux(0x4db)),
      m6 = ![],
      m7 = null,
      m8 = nR(ux(0xb3f));
    setInterval(() => {
      m7 && m9();
    }, 0x3e8);
    function m9() {
      const yJ = ux;
      k9(m8, yJ(0xdcc) + kb(Date[yJ(0x296)]() - m7[yJ(0xe92)]) + yJ(0xa74));
    }
    function ma(rI) {
      const yK = ux;
      document[yK(0x458)][yK(0x52a)][yK(0x536)](yK(0x552));
      const rJ = nR(
        yK(0x84e) +
          rI[yK(0x9c7)] +
          yK(0xd7f) +
          rI[yK(0x3f6)] +
          yK(0xe40) +
          (rI[yK(0x493)]
            ? yK(0x725) +
              rI[yK(0x493)] +
              "\x22\x20" +
              (rI[yK(0xe67)] ? yK(0xbc2) + rI[yK(0xe67)] + "\x22" : "") +
              yK(0x282)
            : "") +
          yK(0x519)
      );
      (r6 = rJ),
        (rJ[yK(0x415)] = function () {
          const yL = yK;
          document[yL(0x458)][yL(0x52a)][yL(0xcd1)](yL(0x552)),
            rJ[yL(0xcd1)](),
            (r6 = null);
        }),
        (rJ[yK(0x9e3)](yK(0x600))[yK(0xc0d)] = rJ[yK(0x415)]);
      const rK = rJ[yK(0x9e3)](yK(0xcea)),
        rL = 0x14;
      rM(0x0);
      if (rI[yK(0xdf1)][yK(0xf30)] > rL) {
        const rN = nR(yK(0xce2));
        rJ[yK(0x8c5)](rN);
        const rO = rN[yK(0x9e3)](yK(0x837)),
          rP = Math[yK(0x443)](rI[yK(0xdf1)][yK(0xf30)] / rL);
        for (let rS = 0x0; rS < rP; rS++) {
          const rT = nR(yK(0xe42) + rS + yK(0xa85) + (rS + 0x1) + yK(0x9e9));
          rO[yK(0x8c5)](rT);
        }
        rO[yK(0xc4b)] = function () {
          const yM = yK;
          rM(this[yM(0x459)]);
        };
        const rQ = rJ[yK(0x9e3)](yK(0xa40)),
          rR = rJ[yK(0x9e3)](yK(0x65a));
        rR[yK(0xc4b)] = function () {
          const yN = yK,
            rU = this[yN(0x459)][yN(0x77b)]();
          (rQ[yN(0xa94)] = ""), (rQ[yN(0x5f5)][yN(0x4f9)] = yN(0xdf2));
          if (!rU) return;
          const rV = new RegExp(rU, "i");
          let rW = 0x0;
          for (let rX = 0x0; rX < rI[yN(0xdf1)][yN(0xf30)]; rX++) {
            const rY = rI[yN(0xdf1)][rX];
            if (rV[yN(0x6b1)](rY[yN(0x987)])) {
              const rZ = nR(
                yN(0xe6d) +
                  (rX + 0x1) +
                  yN(0x2d3) +
                  rY[yN(0x987)] +
                  yN(0x737) +
                  ka(rY[yN(0x7e0)]) +
                  yN(0xe1a)
              );
              rQ[yN(0x8c5)](rZ),
                (rZ[yN(0x9e3)](yN(0x5d7))[yN(0xc0d)] = function () {
                  const yO = yN;
                  mA(rY[yO(0x987)]);
                }),
                (rZ[yN(0xc0d)] = function (s0) {
                  const yP = yN;
                  if (s0[yP(0x382)] === this) {
                    const s1 = Math[yP(0xe3c)](rX / rL);
                    rM(s1), (rO[yP(0x459)] = s1);
                  }
                }),
                rW++;
              if (rW >= 0x8) break;
            }
          }
          rW > 0x0 && (rQ[yN(0x5f5)][yN(0x4f9)] = "");
        };
      }
      function rM(rU = 0x0) {
        const yQ = yK,
          rV = rU * rL,
          rW = Math[yQ(0xeeb)](rI[yQ(0xdf1)][yQ(0xf30)], rV + rL);
        rK[yQ(0xa94)] = "";
        for (let rX = rV; rX < rW; rX++) {
          const rY = rI[yQ(0xdf1)][rX];
          rK[yQ(0x8c5)](rI[yQ(0x4d1)](rY, rX));
          const rZ = nR(yQ(0x8ae));
          for (let s0 = 0x0; s0 < rY[yQ(0xc79)][yQ(0xf30)]; s0++) {
            const [s1, s2] = rY[yQ(0xc79)][s0],
              s3 = dE[s1],
              s4 = nR(
                yQ(0x840) + s3[yQ(0x257)] + "\x22\x20" + qB(s3) + yQ(0x282)
              );
            jZ(s4);
            const s5 = "x" + ka(s2),
              s6 = nR(yQ(0xe34) + s5 + yQ(0xee5));
            s5[yQ(0xf30)] > 0x6 && s6[yQ(0x52a)][yQ(0x536)](yQ(0x941)),
              s4[yQ(0x8c5)](s6),
              (s4[yQ(0x559)] = s3),
              rZ[yQ(0x8c5)](s4);
          }
          rK[yQ(0x8c5)](rZ);
        }
      }
      km[yK(0x8c5)](rJ);
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
          rQ[yR(0xf33)]([rS, rT]), (rP += rT), (rL += rT);
        }
        rQ = rQ[yR(0x9ff)]((rU, rV) => rV[0x1] - rU[0x1]);
        const rR = {};
        (rR[yR(0x987)] = rN),
          (rR[yR(0xc79)] = rQ),
          (rR[yR(0x7e0)] = rP),
          rK[yR(0xf33)](rR);
      }
      if (rJ) rK = rK[yR(0x9ff)]((rU, rV) => rV[yR(0x7e0)] - rU[yR(0x7e0)]);
      const rM = {};
      return (rM[yR(0x7e0)] = rL), (rM[yR(0xdf1)] = rK), rM;
    }
    function mc() {
      return md(new Date());
    }
    function md(rI) {
      const yS = ux,
        rJ = {};
      rJ[yS(0x9a8)] = yS(0x7f6);
      const rK = rI[yS(0x31c)]("en", rJ),
        rL = {};
      rL[yS(0xf2d)] = yS(0xb9b);
      const rM = rI[yS(0x31c)]("en", rL),
        rN = {};
      rN[yS(0x8f6)] = yS(0x7f6);
      const rO = rI[yS(0x31c)]("en", rN);
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
          yT(0x73a) +
            (rJ + 0x1) +
            yT(0x7f0) +
            rI[yT(0x987)] +
            yT(0xa15) +
            ka(rI[yT(0x7e0)]) +
            yT(0xc6b) +
            (rI[yT(0x7e0)] == 0x1 ? "" : "s") +
            yT(0xf13)
        );
      return (
        (rK[yT(0x9e3)](yT(0x5d7))[yT(0xc0d)] = function () {
          const yU = yT;
          mA(rI[yU(0x987)]);
        }),
        rK
      );
    }
    var mg = {
      ultraPlayers: {
        title: ux(0xe4e),
        parse(rI) {
          const yV = ux,
            rJ = rI[yV(0xac1)];
          if (rJ[yV(0xe7a)] !== 0x1) throw new Error(yV(0x419) + rJ[yV(0xe7a)]);
          const rK = {},
            rL = rJ[yV(0xe61)][yV(0xb3d)]("+");
          for (const rN in rJ[yV(0xa3f)]) {
            const rO = rJ[yV(0xa3f)][rN][yV(0xb3d)]("\x20"),
              rP = {};
            for (let rQ = 0x0; rQ < rO[yV(0xf30)] - 0x1; rQ++) {
              let [rR, rS] = rO[rQ][yV(0xb3d)](",");
              rP[rL[rR]] = parseInt(rS);
            }
            rK[rN] = rP;
          }
          const rM = mb(rK, !![]);
          return {
            title: this[yV(0x9c7)],
            titleColor: hO[yV(0xefb)],
            desc:
              mc() +
              yV(0xa5e) +
              ka(rM[yV(0xdf1)][yV(0xf30)]) +
              yV(0xa9b) +
              ka(rM[yV(0x7e0)]) +
              yV(0xb4b),
            getTitleEl: mf,
            groups: rM[yV(0xdf1)],
          };
        },
      },
      superPlayers: {
        title: ux(0xe72),
        parse(rI) {
          const yW = ux,
            rJ = mb(rI[yW(0x206)], !![]);
          return {
            title: this[yW(0x9c7)],
            titleColor: hO[yW(0xc60)],
            desc:
              mc() +
              yW(0xa5e) +
              ka(rJ[yW(0xdf1)][yW(0xf30)]) +
              yW(0xa9b) +
              ka(rJ[yW(0x7e0)]) +
              yW(0xb4b),
            getTitleEl: mf,
            groups: rJ[yW(0xdf1)],
          };
        },
      },
      hyperPlayers: {
        title: ux(0x882),
        parse(rI) {
          const yX = ux,
            rJ = mb(rI[yX(0xd2f)], !![]);
          return {
            title: this[yX(0x9c7)],
            titleColor: hO[yX(0x9e7)],
            desc:
              mc() +
              yX(0xa5e) +
              ka(rJ[yX(0xdf1)][yX(0xf30)]) +
              yX(0xa9b) +
              ka(rJ[yX(0x7e0)]) +
              yX(0xb4b),
            getTitleEl: mf,
            groups: rJ[yX(0xdf1)],
          };
        },
      },
      petals: {
        title: ux(0x1e2),
        parse(rI) {
          const yY = ux,
            rJ = mb(rI[yY(0xc79)], ![]),
            rK = rJ[yY(0xdf1)][yY(0x9ff)](
              (rL, rM) => rM[yY(0x987)] - rL[yY(0x987)]
            );
          return {
            title: this[yY(0x9c7)],
            titleColor: hO[yY(0xd06)],
            desc: mc() + yY(0xa5e) + ka(rJ[yY(0x7e0)]) + yY(0xb4b),
            getTitleEl(rL, rM) {
              const yZ = yY;
              return nR(
                yZ(0xc41) +
                  hM[rL[yZ(0x987)]] +
                  yZ(0xa5e) +
                  ka(rL[yZ(0x7e0)]) +
                  yZ(0xe7e)
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
      let rN = Math[z0(0xe3c)](rI / rM);
      rI %= rM;
      let rO = Math[z0(0xe3c)](rI / rL);
      rI %= rL;
      let rP = Math[z0(0xe3c)](rI / rK);
      rI %= rK;
      let rQ = Math[z0(0xe3c)](rI / rJ),
        rR = [];
      if (rN > 0x0) rR[z0(0xf33)](rN + "y");
      if (rO > 0x0) rR[z0(0xf33)](rO + "d");
      if (rP > 0x0) rR[z0(0xf33)](rP + "h");
      if (rQ > 0x0) rR[z0(0xf33)](rQ + "m");
      return rR[z0(0x2a3)]("\x20");
    }
    function mi() {
      const z1 = ux;
      if (m6) return;
      if (m7 && Date[z1(0x296)]() - m7[z1(0xe92)] < 0x3c * 0xea60) return;
      (m6 = !![]),
        fetch((i9 ? z1(0x8ee) : z1(0x610)) + z1(0x596))
          [z1(0x884)]((rI) => rI[z1(0x27d)]())
          [z1(0x884)]((rI) => {
            const z2 = z1;
            (m6 = ![]), (m7 = rI), m9(), (m5[z2(0xa94)] = "");
            const rJ = {};
            (rJ[z2(0x428)] = !![]),
              (rJ[z2(0xd0e)] = !![]),
              (rJ[z2(0x826)] = !![]),
              (rJ[z2(0xafe)] = !![]),
              (rJ[z2(0x1f7)] = !![]);
            const rK = rJ,
              rL = nR(z2(0xd77));
            m5[z2(0x8c5)](rL);
            for (const rM in rK) {
              if (rM in rI) {
                const rN = rI[rM],
                  rO = nR(
                    z2(0x805) +
                      ke(rM) +
                      z2(0xc8e) +
                      (rM == z2(0x428) ? mh(rN * 0x3e8 * 0x3c) : ka(rN)) +
                      z2(0x31d)
                  );
                rL[z2(0x8c5)](rO);
              }
            }
            for (const rP in mg) {
              if (!(rP in rI)) continue;
              const rQ = mg[rP],
                rR = nR(z2(0xe11) + rQ[z2(0x9c7)] + z2(0xd57));
              (rR[z2(0xc0d)] = function () {
                const z3 = z2;
                ma(rQ[z3(0x76c)](rI));
              }),
                m5[z2(0x8c5)](rR);
            }
            m5[z2(0x8c5)](m8);
          })
          [z1(0x6f2)]((rI) => {
            const z4 = z1;
            (m6 = ![]),
              hb(z4(0x35f)),
              console[z4(0x676)](z4(0x6cc), rI),
              setTimeout(mi, 0x1388);
          });
    }
    mJ(ux(0x8ff), ux(0x80a), ux(0x561), mi);
    var mj = 0xb,
      mk = document[ux(0x9e3)](ux(0xa98));
    hC[ux(0x4e4)] == mj && (mk[ux(0x5f5)][ux(0x4f9)] = ux(0xdf2));
    var ml = document[ux(0x9e3)](ux(0x8b0));
    ml[ux(0x5f5)][ux(0x4f9)] = ux(0xdf2);
    var mm = document[ux(0x9e3)](ux(0x383)),
      mn = document[ux(0x9e3)](ux(0x656)),
      mo = document[ux(0x9e3)](ux(0x60a));
    mo[ux(0xc0d)] = function () {
      const z5 = ux;
      ml[z5(0x5f5)][z5(0x4f9)] = z5(0xdf2);
    };
    var mp = ![];
    mn[ux(0xc0d)] = nw(function (rI) {
      const z6 = ux;
      if (!hX || mp || jz) return;
      const rJ = mm[z6(0x459)][z6(0x77b)]();
      if (!rJ || !eU(rJ)) {
        mm[z6(0x52a)][z6(0xcd1)](z6(0x857)),
          void mm[z6(0x847)],
          mm[z6(0x52a)][z6(0x536)](z6(0x857));
        return;
      }
      (ml[z6(0x5f5)][z6(0x4f9)] = ""),
        (ml[z6(0xa94)] = z6(0xb67)),
        im(
          new Uint8Array([cH[z6(0x5e3)], ...new TextEncoder()[z6(0xd68)](rJ)])
        ),
        (mp = !![]);
    });
    function mq(rI, rJ) {
      const z7 = ux;
      if (rI === z7(0x2a9)) {
        const rK = {};
        (rK[z7(0x8f6)] = z7(0x7f6)),
          (rK[z7(0x9a8)] = z7(0x5af)),
          (rK[z7(0xf2d)] = z7(0x5af)),
          (rJ = new Date(
            rJ === 0x0 ? Date[z7(0x296)]() : rJ * 0x3e8 * 0x3c * 0x3c
          )[z7(0x31c)]("en", rK));
      } else
        rI === z7(0xd24) || rI === z7(0x739)
          ? (rJ = kb(rJ * 0x3e8 * 0x3c, !![]))
          : (rJ = ka(rJ));
      return rJ;
    }
    var mr = f1(),
      ms = {},
      mt = document[ux(0x9e3)](ux(0xae8));
    mt[ux(0xa94)] = "";
    for (let rI in mr) {
      const rJ = mu(rI);
      rJ[ux(0x5b5)](0x0), mt[ux(0x8c5)](rJ), (ms[rI] = rJ);
    }
    function mu(rK) {
      const z8 = ux,
        rL = nR(z8(0x562) + ke(rK) + z8(0x418)),
        rM = rL[z8(0x9e3)](z8(0x30e));
      return (
        (rL[z8(0x5b5)] = function (rN) {
          k9(rM, mq(rK, rN));
        }),
        rL
      );
    }
    var mv;
    function mw(rK, rL, rM, rN, rO, rP, rQ) {
      const z9 = ux;
      mv && (mv[z9(0x384)](), (mv = null));
      const rR = rP[z9(0xf30)] / 0x2,
        rS = z9(0x32c)[z9(0x678)](rR),
        rT = nR(
          z9(0x6b8) +
            rK +
            z9(0xbdb) +
            rS +
            z9(0xd29) +
            rS +
            z9(0x874) +
            z9(0xdf5)[z9(0x678)](eK * dG) +
            z9(0x3b9) +
            (rM[z9(0xf30)] === 0x0 ? z9(0xad4) : "") +
            z9(0xcd8)
        );
      rQ && rT[z9(0x8c5)](nR(z9(0xbec)));
      mv = rT;
      const rU = rT[z9(0x9e3)](z9(0x710)),
        rV = rT[z9(0x9e3)](z9(0x3bb));
      for (let s7 = 0x0; s7 < rP[z9(0xf30)]; s7++) {
        const s8 = rP[s7];
        if (!s8) continue;
        const s9 = og(s8);
        s9[z9(0x52a)][z9(0xcd1)](z9(0x983)),
          (s9[z9(0x608)] = !![]),
          s9[z9(0x5a7)][z9(0xcd1)](),
          (s9[z9(0x5a7)] = null),
          s7 < rR
            ? rU[z9(0xd83)][s7][z9(0x8c5)](s9)
            : rV[z9(0xd83)][s7 - rR][z9(0x8c5)](s9);
      }
      (rT[z9(0x384)] = function () {
        const za = z9;
        (rT[za(0x5f5)][za(0xf0f)] = za(0xa49)),
          (rT[za(0x5f5)][za(0x4f9)] = za(0xdf2)),
          void rT[za(0x847)],
          (rT[za(0x5f5)][za(0x4f9)] = ""),
          setTimeout(function () {
            const zb = za;
            rT[zb(0xcd1)]();
          }, 0x3e8);
      }),
        (rT[z9(0x9e3)](z9(0x600))[z9(0xc0d)] = function () {
          const zc = z9;
          rT[zc(0x384)]();
        });
      const rW = d3(rO),
        rX = rW[0x0],
        rY = rW[0x1],
        rZ = d1(rX + 0x1),
        s0 = rO - rY,
        s1 = rT[z9(0x9e3)](z9(0xe75));
      k9(
        s1,
        z9(0xce6) + (rX + 0x1) + z9(0x275) + iK(s0) + "/" + iK(rZ) + z9(0x908)
      );
      const s2 = Math[z9(0xeeb)](0x1, s0 / rZ),
        s3 = rT[z9(0x9e3)](z9(0x758));
      s3[z9(0x5f5)][z9(0xf3d)] = s2 * 0x64 + "%";
      const s4 = rT[z9(0x9e3)](z9(0xae8));
      for (let sa in mr) {
        const sb = mu(sa);
        sb[z9(0x5b5)](rL[sa]), s4[z9(0x8c5)](sb);
      }
      const s5 = rT[z9(0x9e3)](z9(0x2dc));
      rM[z9(0x9ff)]((sc, sd) => of(sc[0x0], sd[0x0]));
      for (let sc = 0x0; sc < rM[z9(0xf30)]; sc++) {
        const [sd, se] = rM[sc],
          sf = og(sd);
        jZ(sf),
          sf[z9(0x52a)][z9(0xcd1)](z9(0x983)),
          (sf[z9(0x608)] = !![]),
          p6(sf[z9(0x5a7)], se),
          s5[z9(0x8c5)](sf);
      }
      if (rM[z9(0xf30)] > 0x0) {
        const sg = nR(z9(0x9af)),
          sh = {};
        for (let si = 0x0; si < rM[z9(0xf30)]; si++) {
          const [sj, sk] = rM[si];
          sh[sj[z9(0x257)]] = (sh[sj[z9(0x257)]] || 0x0) + sk;
        }
        oF(sg, sh), rT[z9(0x9e3)](z9(0xc35))[z9(0x8c5)](sg);
      }
      const s6 = rT[z9(0x9e3)](z9(0xb20));
      for (let sl = 0x0; sl < rN[z9(0xf30)]; sl++) {
        const sm = rN[sl],
          sn = nW(sm, !![]);
        sn[z9(0x52a)][z9(0xcd1)](z9(0x983)), (sn[z9(0x608)] = !![]);
        const so = s6[z9(0xd83)][sm[z9(0xb85)] * dG + sm[z9(0x257)]];
        s6[z9(0xd73)](sn, so), so[z9(0xcd1)]();
      }
      rT[z9(0x52a)][z9(0x536)](z9(0x475)),
        setTimeout(function () {
          const zd = z9;
          rT[zd(0x52a)][zd(0xcd1)](zd(0x475));
        }, 0x0),
        km[z9(0x8c5)](rT);
    }
    var mz = document[ux(0x9e3)](ux(0xa03));
    document[ux(0x9e3)](ux(0x554))[ux(0xc0d)] = nw(function (rK) {
      const ze = ux,
        rL = mz[ze(0x459)][ze(0x77b)]();
      nv(rL);
    });
    function mA(rK) {
      const zf = ux,
        rL = new Uint8Array([
          cH[zf(0x926)],
          ...new TextEncoder()[zf(0xd68)](rK),
        ]);
      im(rL);
    }
    var mB = document[ux(0x9e3)](ux(0xc7d)),
      mC = document[ux(0x9e3)](ux(0xd5e)),
      mD = mC[ux(0x9e3)](ux(0xcea)),
      mE = 0x0,
      mF = 0x0;
    setInterval(function () {
      const zg = ux;
      hX &&
        (pQ - mF > 0x7530 &&
          mB[zg(0x52a)][zg(0xa05)](zg(0x4ac)) &&
          (im(new Uint8Array([cH[zg(0x9ca)]])), (mF = pQ)),
        pQ - mE > 0xea60 &&
          mC[zg(0x52a)][zg(0xa05)](zg(0x4ac)) &&
          (im(new Uint8Array([cH[zg(0xdbb)]])), (mE = pQ)));
    }, 0x3e8);
    var mG = ![];
    function mH(rK) {
      const zh = ux;
      for (let rL in m3) {
        if (rK === rL) continue;
        m3[rL][zh(0x384)]();
      }
      mG = ![];
    }
    window[ux(0xc0d)] = function (rK) {
      const zi = ux;
      if ([kl, ko, kj][zi(0x7b5)](rK[zi(0x382)])) mH();
    };
    function mI() {
      const zj = ux;
      iz && !pc[zj(0x743)] && io(0x0, 0x0);
    }
    function mJ(rK, rL, rM, rN) {
      const zk = ux,
        rO = document[zk(0x9e3)](rL),
        rP = rO[zk(0x9e3)](zk(0xcea)),
        rQ = document[zk(0x9e3)](rK);
      let rR = null,
        rS = rO[zk(0x9e3)](zk(0x3fe));
      rS &&
        (rS[zk(0xc0d)] = function () {
          const zl = zk;
          rO[zl(0x52a)][zl(0xee9)](zl(0xa67));
        });
      (rP[zk(0x5f5)][zk(0x4f9)] = zk(0xdf2)),
        rO[zk(0x52a)][zk(0xcd1)](zk(0x4ac)),
        (rQ[zk(0xc0d)] = function () {
          const zm = zk;
          rT[zm(0xee9)]();
        }),
        (rO[zk(0x9e3)](zk(0x600))[zk(0xc0d)] = function () {
          mH();
        });
      const rT = [rQ, rO];
      (rT[zk(0x384)] = function () {
        const zn = zk;
        rQ[zn(0x52a)][zn(0xcd1)](zn(0xae4)),
          rO[zn(0x52a)][zn(0xcd1)](zn(0x4ac)),
          !rR &&
            (rR = setTimeout(function () {
              const zo = zn;
              (rP[zo(0x5f5)][zo(0x4f9)] = zo(0xdf2)), (rR = null);
            }, 0x3e8));
      }),
        (rT[zk(0xee9)] = function () {
          const zp = zk;
          mH(rM),
            rO[zp(0x52a)][zp(0xa05)](zp(0x4ac))
              ? rT[zp(0x384)]()
              : rT[zp(0x4ac)]();
        }),
        (rT[zk(0x4ac)] = function () {
          const zq = zk;
          rN && rN(),
            clearTimeout(rR),
            (rR = null),
            (rP[zq(0x5f5)][zq(0x4f9)] = ""),
            rQ[zq(0x52a)][zq(0x536)](zq(0xae4)),
            rO[zq(0x52a)][zq(0x536)](zq(0x4ac)),
            (mG = !![]),
            mI();
        }),
        (m3[rM] = rT);
    }
    var mK = [],
      mL,
      mM = 0x0,
      mN = ![],
      mO = document[ux(0x9e3)](ux(0x3d9)),
      mP = {
        tagName: ux(0x462),
        getBoundingClientRect() {
          const zr = ux,
            rK = mO[zr(0x766)](),
            rL = {};
          return (
            (rL["x"] = rK["x"] + rK[zr(0xf3d)] / 0x2),
            (rL["y"] = rK["y"] + rK[zr(0xac0)] / 0x2),
            rL
          );
        },
        appendChild(rK) {
          const zs = ux;
          rK[zs(0xcd1)]();
        },
      };
    function mQ(rK) {
      const zt = ux;
      if (!hX) return;
      const rL = rK[zt(0x382)];
      if (rL[zt(0xcff)]) mL = na(rL, rK);
      else {
        if (rL[zt(0x413)]) {
          mH();
          const rM = rL[zt(0xb9a)]();
          (rM[zt(0x559)] = rL[zt(0x559)]),
            nQ(rM, rL[zt(0x559)]),
            (rM[zt(0x9de)] = 0x1),
            (rM[zt(0x413)] = !![]),
            (rM[zt(0x63a)] = mP),
            rM[zt(0x52a)][zt(0x536)](zt(0x5d8));
          const rN = rL[zt(0x766)]();
          (rM[zt(0x5f5)][zt(0xb00)] = rN["x"] / kS + "px"),
            (rM[zt(0x5f5)][zt(0x420)] = rN["y"] / kS + "px"),
            kI[zt(0x8c5)](rM),
            (mL = na(rM, rK)),
            (mM = 0x0),
            (mG = !![]);
        } else return ![];
      }
      return (mM = Date[zt(0x296)]()), (mN = !![]), !![];
    }
    function mR(rK) {
      const zu = ux;
      for (let rL = 0x0; rL < rK[zu(0xd83)][zu(0xf30)]; rL++) {
        const rM = rK[zu(0xd83)][rL];
        if (rM[zu(0x52a)][zu(0xa05)](zu(0x559)) && !n9(rM)) return rM;
      }
    }
    function mS() {
      const zv = ux;
      if (mL) {
        if (mN && Date[zv(0x296)]() - mM < 0x1f4) {
          if (mL[zv(0xcff)]) {
            const rK = mL[zv(0x5d3)][zv(0x6d0)];
            mL[zv(0x701)](
              rK >= iO ? nA[zv(0xd83)][rK - iO + 0x1] : nB[zv(0xd83)][rK]
            );
          } else {
            if (mL[zv(0x413)]) {
              let rL = mR(nA) || mR(nB);
              rL && mL[zv(0x701)](rL);
            }
          }
        }
        mL[zv(0x48d)]();
        if (mL[zv(0x413)]) {
          (mL[zv(0x413)] = ![]),
            (mL[zv(0xcff)] = !![]),
            m3[zv(0x20d)][zv(0x4ac)]();
          if (mL[zv(0x63a)] !== mP) {
            const rM = mL[zv(0xefc)];
            rM
              ? ((mL[zv(0x543)] = rM[zv(0x543)]), n6(rM[zv(0x559)]["id"], 0x1))
              : (mL[zv(0x543)] = iS[zv(0x408)]());
            (iR[mL[zv(0x543)]] = mL), n6(mL[zv(0x559)]["id"], -0x1);
            const rN = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rN[zv(0x755)](0x0, cH[zv(0x6f8)]),
              rN[zv(0x72a)](0x1, mL[zv(0x559)]["id"]),
              rN[zv(0x755)](0x3, mL[zv(0x63a)][zv(0x6d0)]),
              im(rN);
          }
        } else
          mL[zv(0x63a)] === mP
            ? (iS[zv(0xf33)](mL[zv(0x543)]),
              n6(mL[zv(0x559)]["id"], 0x1),
              im(new Uint8Array([cH[zv(0xcc2)], mL[zv(0x5d3)][zv(0x6d0)]])))
            : n8(mL[zv(0x5d3)][zv(0x6d0)], mL[zv(0x63a)][zv(0x6d0)]);
        mL = null;
      }
    }
    function mT(rK) {
      const zw = ux;
      mL && (mL[zw(0x5ae)](rK), (mN = ![]));
    }
    var mU = document[ux(0x9e3)](ux(0x3be));
    function mV() {
      const zx = ux;
      mU[zx(0x5f5)][zx(0x4f9)] = zx(0xdf2);
      const rK = mU[zx(0x9e3)](zx(0x52d));
      let rL,
        rM,
        rN = null;
      (mU[zx(0x1d3)] = function (rP) {
        const zy = zx;
        rN === null &&
          ((rK[zy(0x5f5)][zy(0xf3d)] = rK[zy(0x5f5)][zy(0x2a7)] = "0"),
          (mU[zy(0x5f5)][zy(0x4f9)] = ""),
          ([rL, rM] = mW(rP)),
          rO(),
          (rN = rP[zy(0x580)]));
      }),
        (mU[zx(0x616)] = function (rP) {
          const zz = zx;
          if (rP[zz(0x580)] === rN) {
            const [rQ, rR] = mW(rP),
              rS = rQ - rL,
              rT = rR - rM,
              rU = mU[zz(0x766)]();
            let rV = Math[zz(0x4a4)](rS, rT);
            const rW = rU[zz(0xf3d)] / 0x2 / kS;
            rV > rW && (rV = rW);
            const rX = Math[zz(0x209)](rT, rS);
            return (
              (rK[zz(0x5f5)][zz(0x2a7)] = zz(0xb6c) + rX + zz(0xc72)),
              (rK[zz(0x5f5)][zz(0xf3d)] = rV + "px"),
              io(rX, rV / rW),
              !![]
            );
          }
        }),
        (mU[zx(0x9f7)] = function (rP) {
          const zA = zx;
          rP[zA(0x580)] === rN &&
            ((mU[zA(0x5f5)][zA(0x4f9)] = zA(0xdf2)), (rN = null), io(0x0, 0x0));
        });
      function rO() {
        const zB = zx;
        (mU[zB(0x5f5)][zB(0xb00)] = rL + "px"),
          (mU[zB(0x5f5)][zB(0x420)] = rM + "px");
      }
    }
    mV();
    function mW(rK) {
      const zC = ux;
      return [rK[zC(0x858)] / kS, rK[zC(0xa08)] / kS];
    }
    var mX = document[ux(0x9e3)](ux(0x8ef)),
      mY = document[ux(0x9e3)](ux(0xd99)),
      mZ = document[ux(0x9e3)](ux(0x5fd)),
      n0 = {},
      n1 = {};
    if (kM) {
      document[ux(0x458)][ux(0x52a)][ux(0x536)](ux(0xa46)),
        (window[ux(0x89c)] = function (rL) {
          const zD = ux;
          for (let rM = 0x0; rM < rL[zD(0xba0)][zD(0xf30)]; rM++) {
            const rN = rL[zD(0xba0)][rM],
              rO = rN[zD(0x382)];
            if (rO === kj) {
              mU[zD(0x1d3)](rN);
              continue;
            } else {
              if (rO === mY)
                pr(zD(0x8e5), !![]),
                  (n0[rN[zD(0x580)]] = function () {
                    const zE = zD;
                    pr(zE(0x8e5), ![]);
                  });
              else {
                if (rO === mX)
                  pr(zD(0xb1a), !![]),
                    (n0[rN[zD(0x580)]] = function () {
                      const zF = zD;
                      pr(zF(0xb1a), ![]);
                    });
                else
                  rO === mZ &&
                    (pr(zD(0xcf5), !![]),
                    (n0[rN[zD(0x580)]] = function () {
                      const zG = zD;
                      pr(zG(0xcf5), ![]);
                    }));
              }
            }
            if (mL) continue;
            if (rO[zD(0x559)]) {
              const rP = n4(rO);
              mQ(rN),
                mL && (n1[rN[zD(0x580)]] = mT),
                (n0[rN[zD(0x580)]] = function () {
                  const zH = zD;
                  mL && mS(), (rP[zH(0xce0)] = ![]);
                });
            }
          }
        });
      const rK = {};
      (rK[ux(0xe02)] = ![]),
        document[ux(0x8fd)](
          ux(0xf16),
          function (rL) {
            const zI = ux;
            for (let rM = 0x0; rM < rL[zI(0xba0)][zI(0xf30)]; rM++) {
              const rN = rL[zI(0xba0)][rM];
              mU[zI(0x616)](rN) && rL[zI(0x2b1)]();
              if (n1[rN[zI(0x580)]]) n1[rN[zI(0x580)]](rN), rL[zI(0x2b1)]();
              else mL && rL[zI(0x2b1)]();
            }
          },
          rK
        ),
        (window[ux(0xe4f)] = function (rL) {
          const zJ = ux;
          for (let rM = 0x0; rM < rL[zJ(0xba0)][zJ(0xf30)]; rM++) {
            const rN = rL[zJ(0xba0)][rM];
            mU[zJ(0x9f7)](rN),
              n0[rN[zJ(0x580)]] &&
                (n0[rN[zJ(0x580)]](),
                delete n0[rN[zJ(0x580)]],
                delete n1[rN[zJ(0x580)]]);
          }
        });
    } else {
      document[ux(0x458)][ux(0x52a)][ux(0x536)](ux(0xeaf));
      let rL = ![];
      (window[ux(0xa1e)] = function (rM) {
        const zK = ux;
        rM[zK(0xbc7)] === 0x0 && ((rL = !![]), mQ(rM));
      }),
        (document[ux(0x2aa)] = function (rM) {
          const zL = ux;
          mT(rM);
          const rN = rM[zL(0x382)];
          if (rN[zL(0x559)] && !rL) {
            const rO = n4(rN);
            rN[zL(0xa84)] = rN[zL(0xa1e)] = function () {
              const zM = zL;
              rO[zM(0xce0)] = ![];
            };
          }
        }),
        (document[ux(0x966)] = function (rM) {
          const zN = ux;
          rM[zN(0xbc7)] === 0x0 && ((rL = ![]), mS());
        }),
        (kn[ux(0x2aa)] = kj[ux(0x2aa)] =
          function (rM) {
            const zO = ux;
            (ne = rM[zO(0x858)] - kV() / 0x2),
              (nf = rM[zO(0xa08)] - kW() / 0x2);
            if (!pc[zO(0x743)] && iz && !mG) {
              const rN = Math[zO(0x4a4)](ne, nf),
                rO = Math[zO(0x209)](nf, ne);
              io(rO, rN < 0x32 ? rN / 0x64 : 0x1);
            }
          });
    }
    function n2(rM, rN, rO) {
      const zP = ux;
      return Math[zP(0xe6f)](rN, Math[zP(0xeeb)](rM, rO));
    }
    var n3 = [];
    function n4(rM) {
      const zQ = ux;
      let rN = n3[zQ(0x77c)]((rO) => rO["el"] === rM);
      if (rN) return (rN[zQ(0xce0)] = !![]), rN;
      (rN =
        typeof rM[zQ(0x559)] === zQ(0x5b3)
          ? rM[zQ(0x559)]()
          : nL(rM[zQ(0x559)], rM[zQ(0xb37)])),
        (rN[zQ(0xce0)] = !![]),
        (rN[zQ(0x2ef)] = 0x0),
        (rN[zQ(0x5f5)][zQ(0xd63)] = zQ(0xdfc)),
        (rN[zQ(0x5f5)][zQ(0x2a7)] = zQ(0xdf2)),
        kI[zQ(0x8c5)](rN);
      if (kM)
        (rN[zQ(0x5f5)][zQ(0xd4e)] = zQ(0x6ba)),
          (rN[zQ(0x5f5)][zQ(0x420)] = zQ(0x6ba)),
          (rN[zQ(0x5f5)][zQ(0x612)] = zQ(0x727)),
          (rN[zQ(0x5f5)][zQ(0xb00)] = zQ(0x727));
      else {
        const rO = rM[zQ(0x766)](),
          rP = rN[zQ(0x766)]();
        (rN[zQ(0x5f5)][zQ(0x420)] =
          n2(
            rM[zQ(0xe49)]
              ? (rO[zQ(0x420)] + rO[zQ(0xac0)]) / kS + 0xa
              : (rO[zQ(0x420)] - rP[zQ(0xac0)]) / kS - 0xa,
            0xa,
            window[zQ(0xb39)] / kS - 0xa
          ) + "px"),
          (rN[zQ(0x5f5)][zQ(0xb00)] =
            n2(
              (rO[zQ(0xb00)] + rO[zQ(0xf3d)] / 0x2 - rP[zQ(0xf3d)] / 0x2) / kS,
              0xa,
              window[zQ(0x84f)] / kS - 0xa - rP[zQ(0xf3d)] / kS
            ) + "px"),
          (rN[zQ(0x5f5)][zQ(0x612)] = zQ(0x727)),
          (rN[zQ(0x5f5)][zQ(0xd4e)] = zQ(0x727));
      }
      return (
        (rN[zQ(0x5f5)][zQ(0x29b)] = zQ(0xdf2)),
        (rN[zQ(0x5f5)][zQ(0x440)] = 0x0),
        (rN["el"] = rM),
        n3[zQ(0xf33)](rN),
        rN
      );
    }
    var n5 = document[ux(0x9e3)](ux(0x7dc));
    function n6(rM, rN = 0x1) {
      const zR = ux;
      !iT[rM] && ((iT[rM] = 0x0), pb(rM), od()),
        (iT[rM] += rN),
        ob[rM][zR(0x682)](iT[rM]),
        iT[rM] <= 0x0 && (delete iT[rM], ob[rM][zR(0x415)](), od()),
        n7();
    }
    function n7() {
      const zS = ux;
      n5[zS(0xa94)] = "";
      Object[zS(0x24e)](iT)[zS(0xf30)] === 0x0
        ? (n5[zS(0x5f5)][zS(0x4f9)] = zS(0xdf2))
        : (n5[zS(0x5f5)][zS(0x4f9)] = "");
      const rM = {};
      for (const rN in iT) {
        const rO = dB[rN],
          rP = iT[rN];
        rM[rO[zS(0x257)]] = (rM[rO[zS(0x257)]] || 0x0) + rP;
      }
      oF(n5, rM);
      for (const rQ in or) {
        const rR = or[rQ];
        rR[zS(0x52a)][rM[rQ] ? zS(0xcd1) : zS(0x536)](zS(0x877));
      }
    }
    function n8(rM, rN) {
      const zT = ux;
      if (rM === rN) return;
      im(new Uint8Array([cH[zT(0xc05)], rM, rN]));
    }
    function n9(rM) {
      const zU = ux;
      return rM[zU(0x394)] || rM[zU(0x9e3)](zU(0xb58));
    }
    function na(rM, rN, rO = !![]) {
      const zV = ux,
        rP = mK[zV(0x77c)]((rZ) => rZ === rM);
      if (rP) return rP[zV(0x85b)](rN), rP;
      let rQ,
        rR,
        rS,
        rT,
        rU = 0x0,
        rV = 0x0,
        rW = 0x0,
        rX;
      (rM[zV(0x85b)] = function (rZ, s0) {
        const zW = zV;
        (rX = rM[zW(0x63a)] || rM[zW(0x483)]),
          (rX[zW(0x394)] = rM),
          (rM[zW(0x5d3)] = rX),
          (rM[zW(0xeb0)] = ![]),
          (rM[zW(0x431)] = ![]);
        const s1 = rM[zW(0x766)]();
        rZ[zW(0x8aa)] === void 0x0
          ? ((rU = rZ[zW(0x858)] - s1["x"]),
            (rV = rZ[zW(0xa08)] - s1["y"]),
            rM[zW(0x5ae)](rZ),
            (rQ = rS),
            (rR = rT))
          : ((rQ = s1["x"]),
            (rR = s1["y"]),
            rM[zW(0x701)](rZ),
            rM[zW(0x48d)](s0)),
          rY();
      }),
        (rM[zV(0x48d)] = function (rZ = !![]) {
          const zX = zV;
          rM[zX(0x431)] = !![];
          rX[zX(0x394)] === rM && (rX[zX(0x394)] = null);
          if (!rM[zX(0x63a)])
            rM[zX(0x701)](rX),
              Math[zX(0x4a4)](rS - rQ, rT - rR) > 0x32 * kS &&
                rM[zX(0x701)](mP);
          else {
            if (rZ) {
              const s0 = n9(rM[zX(0x63a)]);
              (rM[zX(0xefc)] = s0), s0 && na(s0, rX, ![]);
            }
          }
          rM[zX(0x63a)] !== rX && (rM[zX(0x9de)] = 0x0),
            (rM[zX(0x63a)][zX(0x394)] = rM);
        }),
        (rM[zV(0x701)] = function (rZ) {
          const zY = zV;
          rM[zY(0x63a)] = rZ;
          const s0 = rZ[zY(0x766)]();
          (rS = s0["x"]),
            (rT = s0["y"]),
            (rM[zY(0x5f5)][zY(0x4f7)] =
              rZ === mP ? zY(0x3e5) : getComputedStyle(rZ)[zY(0x4f7)]);
        }),
        (rM[zV(0x5ae)] = function (rZ) {
          const zZ = zV;
          (rS = rZ[zZ(0x858)] - rU),
            (rT = rZ[zZ(0xa08)] - rV),
            (rM[zZ(0x63a)] = null);
          let s0 = Infinity,
            s1 = null;
          const s2 = kp[zZ(0x6a7)](zZ(0x2e6));
          for (let s3 = 0x0; s3 < s2[zZ(0xf30)]; s3++) {
            const s4 = s2[s3],
              s5 = s4[zZ(0x766)](),
              s6 = Math[zZ(0x4a4)](
                s5["x"] + s5[zZ(0xf3d)] / 0x2 - rZ[zZ(0x858)],
                s5["y"] + s5[zZ(0xac0)] / 0x2 - rZ[zZ(0xa08)]
              );
            s6 < 0x1e * kS && s6 < s0 && ((s1 = s4), (s0 = s6));
          }
          s1 && s1 !== rX && rM[zZ(0x701)](s1);
        }),
        rM[zV(0x85b)](rN, rO),
        rM[zV(0x52a)][zV(0x536)](zV(0x5d8)),
        kI[zV(0x8c5)](rM);
      function rY() {
        const A0 = zV;
        (rM[A0(0x5f5)][A0(0xb00)] = rQ / kS + "px"),
          (rM[A0(0x5f5)][A0(0x420)] = rR / kS + "px");
      }
      return (
        (rM[zV(0xc4c)] = function () {
          const A1 = zV;
          rM[A1(0x63a)] && rM[A1(0x701)](rM[A1(0x63a)]);
        }),
        (rM[zV(0xb75)] = function () {
          const A2 = zV;
          (rQ = px(rQ, rS, 0x64)), (rR = px(rR, rT, 0x64)), rY();
          let rZ = 0x0,
            s0 = Infinity;
          rM[A2(0x63a)]
            ? ((s0 = Math[A2(0x4a4)](rS - rQ, rT - rR)),
              (rZ = s0 > 0x5 ? 0x1 : 0x0))
            : (rZ = 0x1),
            (rW = px(rW, rZ, 0x64)),
            (rM[A2(0x5f5)][A2(0x2a7)] =
              A2(0x6d6) +
              (0x1 + 0.3 * rW) +
              A2(0x87e) +
              rW * Math[A2(0x4ce)](Date[A2(0x296)]() / 0x96) * 0xa +
              A2(0x576)),
            rM[A2(0x431)] &&
              rW < 0.05 &&
              s0 < 0x5 &&
              (rM[A2(0x52a)][A2(0xcd1)](A2(0x5d8)),
              (rM[A2(0x5f5)][A2(0xb00)] =
                rM[A2(0x5f5)][A2(0x420)] =
                rM[A2(0x5f5)][A2(0x2a7)] =
                rM[A2(0x5f5)][A2(0x4f7)] =
                rM[A2(0x5f5)][A2(0xf1f)] =
                  ""),
              (rM[A2(0xeb0)] = !![]),
              rM[A2(0x63a)][A2(0x8c5)](rM),
              (rM[A2(0x63a)][A2(0x394)] = null),
              (rM[A2(0x63a)] = null));
        }),
        mK[zV(0xf33)](rM),
        rM
      );
    }
    var nb = cX[ux(0xd25)];
    document[ux(0x63e)] = function () {
      return ![];
    };
    var nc = 0x0,
      nd = 0x0,
      ne = 0x0,
      nf = 0x0,
      ng = 0x1,
      nh = 0x1;
    document[ux(0x316)] = function (rM) {
      const A3 = ux;
      rM[A3(0x382)] === kj &&
        ((ng *= rM[A3(0x795)] < 0x0 ? 1.1 : 0.9),
        (ng = Math[A3(0xeeb)](0x3, Math[A3(0xe6f)](0x1, ng))));
    };
    const ni = {};
    (ni[ux(0xc23)] = ux(0xe9f)),
      (ni["me"] = ux(0xbe6)),
      (ni[ux(0x676)] = ux(0xda1));
    var nj = ni,
      nk = {};
    function nl(rM, rN) {
      nm(rM, null, null, null, jy(rN));
    }
    function nm(rM, rN, rO, rP = nj[ux(0xc23)], rQ) {
      const A4 = ux,
        rR = nR(A4(0x8f1));
      if (!rQ) {
        if (rN) {
          const rT = nR(A4(0xb5c));
          k9(rT, rN + ":"), rR[A4(0x8c5)](rT);
        }
        const rS = nR(A4(0x7bb));
        k9(rS, rO),
          rR[A4(0x8c5)](rS),
          (rR[A4(0xd83)][0x0][A4(0x5f5)][A4(0x1de)] = rP),
          rN && rR[A4(0x828)](nR(A4(0xf15)));
      } else rR[A4(0xa94)] = rQ;
      pk[A4(0x8c5)](rR);
      while (pk[A4(0xd83)][A4(0xf30)] > 0x3c) {
        pk[A4(0xd83)][0x0][A4(0xcd1)]();
      }
      return (
        (pk[A4(0x393)] = pk[A4(0x504)]),
        (rR[A4(0x37e)] = rO),
        (rR[A4(0x31e)] = rP),
        nn(rM, rR),
        rR
      );
    }
    function nn(rM, rN) {
      const A5 = ux;
      (rN["t"] = 0x0), (rN[A5(0x256)] = 0x0);
      if (!nk[rM]) nk[rM] = [];
      nk[rM][A5(0xf33)](rN);
    }
    var no = {};
    kj[ux(0xa1e)] = window[ux(0x966)] = nw(function (rM) {
      const A6 = ux,
        rN = A6(0x3fd) + rM[A6(0xbc7)];
      pr(rN, rM[A6(0x307)] === A6(0x94a));
    });
    var np = 0x0;
    function nq(rM) {
      const A7 = ux,
        rN = 0x200,
        rO = rN / 0x64,
        rP = document[A7(0x636)](A7(0xb09));
      rP[A7(0xf3d)] = rP[A7(0xac0)] = rN;
      const rQ = rP[A7(0x76b)]("2d");
      rQ[A7(0x94b)](rN / 0x2, rN / 0x2), rQ[A7(0x70b)](rO), rM[A7(0xd19)](rQ);
      const rR = (rM[A7(0x7d1)] ? A7(0xcac) : A7(0xa37)) + rM[A7(0x82f)];
      nr(rP, rR);
    }
    function nr(rM, rN) {
      const A8 = ux,
        rO = document[A8(0x636)]("a");
      (rO[A8(0x2c5)] = rN),
        (rO[A8(0x615)] = typeof rM === A8(0x993) ? rM : rM[A8(0x981)]()),
        rO[A8(0xe13)](),
        hJ(rN + A8(0x6ae), hO[A8(0xd06)]);
    }
    var ns = 0x0;
    setInterval(function () {
      ns = 0x0;
    }, 0x1770),
      setInterval(function () {
        const A9 = ux;
        nx[A9(0xf30)] = 0x0;
      }, 0x2710);
    var nt = ![],
      nu = ![];
    function nv(rM) {
      const Aa = ux;
      rM = rM[Aa(0x77b)]();
      if (!rM) hJ(Aa(0xc13)), hb(Aa(0xc13));
      else
        rM[Aa(0xf30)] < cM || rM[Aa(0xf30)] > cL
          ? (hJ(Aa(0x30a)), hb(Aa(0x30a)))
          : (hJ(Aa(0xed4) + rM + Aa(0x36a), hO[Aa(0x424)]),
            hb(Aa(0xed4) + rM + Aa(0x36a)),
            mA(rM));
    }
    document[ux(0x347)] = document[ux(0xc02)] = nw(function (rM) {
      const Ab = ux;
      rM[Ab(0x978)] && rM[Ab(0x2b1)]();
      (nt = rM[Ab(0x978)]), (nu = rM[Ab(0x40d)]);
      if (rM[Ab(0x4f3)] === 0x9) {
        rM[Ab(0x2b1)]();
        return;
      }
      if (document[Ab(0xee6)] && document[Ab(0xee6)][Ab(0x8aa)] === Ab(0x970)) {
        if (rM[Ab(0x307)] === Ab(0x5ec) && rM[Ab(0x4f3)] === 0xd) {
          if (document[Ab(0xee6)] === hE) hF[Ab(0xe13)]();
          else {
            if (document[Ab(0xee6)] === pj) {
              let rN = pj[Ab(0x459)][Ab(0x77b)]()[Ab(0x607)](0x0, cK);
              if (rN && hX) {
                if (pQ - np > 0x3e8) {
                  const rO = rN[Ab(0xef5)](Ab(0xa7c));
                  if (rO || rN[Ab(0xef5)](Ab(0x619))) {
                    const rP = rN[Ab(0x607)](rO ? 0x7 : 0x9);
                    if (!rP) hJ(Ab(0xcf9));
                    else {
                      if (rO) {
                        const rQ = eL[rP];
                        !rQ ? hJ(Ab(0xe69) + rP + "!") : nq(rQ);
                      } else {
                        const rR = dE[rP];
                        !rR ? hJ(Ab(0x66d) + rP + "!") : nq(rR);
                      }
                    }
                  } else {
                    if (rN[Ab(0xef5)](Ab(0xccc))) nr(qy, Ab(0x903));
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
                        }else if(inputChat.startsWith('/change')){
                             hack.commandMultiArg('changeServer', 2, inputChat);
                        }else if(!hack.isEnabled('allowInvalidCommand') && hack.notCommand(inputChat.split(' ')[0])){
                            hack.addError('Invalid command!');
                        }else
                      if (rN[Ab(0xef5)](Ab(0x24c))) {
                        const rS = rN[Ab(0x607)](0x9);
                        nv(rS);
                      } else {
                        hack.speak = (txt) => {
                        let rT = 0x0;
                        for (let rU = 0x0; rU < nx[Ab(0xf30)]; rU++) {
                          ny(txt, nx[rU]) > 0.95 && rT++;
                        }
                        rT >= 0x3 && (ns += 0xa);
                        ns++;
                        if (ns > 0x3) hJ(Ab(0xdac)), (np = pQ + 0xea60);
                        else {
                          nx[Ab(0xf33)](txt);
                          if (nx[Ab(0xf30)] > 0xa) nx[Ab(0xd1e)]();
                          (txt = decodeURIComponent(
                            encodeURIComponent(txt)
                              [Ab(0x51a)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                              [Ab(0x51a)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                          )),
                            im(
                              new Uint8Array([
                                cH[Ab(0x451)],
                                ...new TextEncoder()[Ab(0xd68)](txt),
                              ])
                            ),
                            (np = pQ);
                        }
                      };
                      hack.speak(inputChat);};
                    }
                  }
                } else nm(-0x1, null, Ab(0xb9f), nj[Ab(0x676)]);
              }
              (pj[Ab(0x459)] = ""), pj[Ab(0xe6e)]();
            }
          }
        }
        return;
      }
      pr(rM[Ab(0xe9a)], rM[Ab(0x307)] === Ab(0x9f3));
    });
    function nw(rM) {
      return function (rN) {
        const Ac = b;
        rN instanceof Event && rN[Ac(0x3f0)] && !rN[Ac(0x678)] && rM(rN);
      };
    }
    var nx = [];
    function ny(rM, rN) {
      const Ad = ux;
      var rO = rM,
        rP = rN;
      rM[Ad(0xf30)] < rN[Ad(0xf30)] && ((rO = rN), (rP = rM));
      var rQ = rO[Ad(0xf30)];
      if (rQ == 0x0) return 0x1;
      return (rQ - nz(rO, rP)) / parseFloat(rQ);
    }
    function nz(rM, rN) {
      const Ae = ux;
      (rM = rM[Ae(0xe12)]()), (rN = rN[Ae(0xe12)]());
      var rO = new Array();
      for (var rP = 0x0; rP <= rM[Ae(0xf30)]; rP++) {
        var rQ = rP;
        for (var rR = 0x0; rR <= rN[Ae(0xf30)]; rR++) {
          if (rP == 0x0) rO[rR] = rR;
          else {
            if (rR > 0x0) {
              var rS = rO[rR - 0x1];
              if (rM[Ae(0x6c4)](rP - 0x1) != rN[Ae(0x6c4)](rR - 0x1))
                rS = Math[Ae(0xeeb)](Math[Ae(0xeeb)](rS, rQ), rO[rR]) + 0x1;
              (rO[rR - 0x1] = rQ), (rQ = rS);
            }
          }
        }
        if (rP > 0x0) rO[rN[Ae(0xf30)]] = rQ;
      }
      return rO[rN[Ae(0xf30)]];
    }
    var nA = document[ux(0x9e3)](ux(0x710)),
      nB = document[ux(0x9e3)](ux(0x3bb));
    function nC(rM, rN = 0x1) {
      const Af = ux;
      rM[Af(0x70a)](),
        rM[Af(0xd3a)](0.25 * rN, 0.25 * rN),
        rM[Af(0x94b)](-0x4b, -0x4b),
        rM[Af(0x936)](),
        rM[Af(0xba7)](0x4b, 0x28),
        rM[Af(0xa6e)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        rM[Af(0xa6e)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        rM[Af(0xa6e)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        rM[Af(0xa6e)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        rM[Af(0xa6e)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        rM[Af(0xa6e)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (rM[Af(0x756)] = Af(0xaa2)),
        rM[Af(0x64e)](),
        (rM[Af(0x5ce)] = rM[Af(0x339)] = Af(0xcec)),
        (rM[Af(0x744)] = Af(0x825)),
        (rM[Af(0x9b8)] = 0xc),
        rM[Af(0x976)](),
        rM[Af(0xdea)]();
    }
    for (let rM = 0x0; rM < dB[ux(0xf30)]; rM++) {
      const rN = dB[rM];
      if (rN[ux(0x920)] !== void 0x0)
        switch (rN[ux(0x920)]) {
          case de[ux(0x386)]:
            rN[ux(0xd19)] = function (rO) {
              const Ag = ux;
              rO[Ag(0xd3a)](2.5, 2.5), lP(rO);
            };
            break;
          case de[ux(0x4c5)]:
            rN[ux(0xd19)] = function (rO) {
              const Ah = ux;
              rO[Ah(0x70b)](0.9);
              const rP = pW();
              (rP[Ah(0x7ee)] = !![]), rP[Ah(0x989)](rO);
            };
            break;
          case de[ux(0xa3a)]:
            rN[ux(0xd19)] = function (rO) {
              const Ai = ux;
              rO[Ai(0x317)](-Math["PI"] / 0x2),
                rO[Ai(0x94b)](-0x30, 0x0),
                pV[Ai(0x202)](rO, ![]);
            };
            break;
          case de[ux(0x6ed)]:
            rN[ux(0xd19)] = function (rO) {
              const Aj = ux;
              rO[Aj(0x317)](Math["PI"] / 0xa),
                rO[Aj(0x94b)](0x3, 0x15),
                lQ(rO, !![]);
            };
            break;
          case de[ux(0x45c)]:
            rN[ux(0xd19)] = function (rO) {
              nC(rO);
            };
            break;
          case de[ux(0xcd9)]:
            rN[ux(0xd19)] = function (rO) {
              const Ak = ux;
              rO[Ak(0x94b)](0x0, 0x3),
                rO[Ak(0x317)](-Math["PI"] / 0x4),
                rO[Ak(0x70b)](0.4),
                pV[Ak(0x492)](rO),
                rO[Ak(0x936)](),
                rO[Ak(0xb0a)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rO[Ak(0x9b8)] = 0x8),
                (rO[Ak(0x744)] = Ak(0x8cd)),
                rO[Ak(0x976)]();
            };
            break;
          case de[ux(0xc83)]:
            rN[ux(0xd19)] = function (rO) {
              const Al = ux;
              rO[Al(0x94b)](0x0, 0x7),
                rO[Al(0x70b)](0.8),
                pV[Al(0x6a3)](rO, 0.5);
            };
            break;
          case de[ux(0xb9d)]:
            rN[ux(0xd19)] = function (rO) {
              const Am = ux;
              rO[Am(0x70b)](1.3), lT(rO);
            };
            break;
          default:
            rN[ux(0xd19)] = function (rO) {};
        }
      else {
        const rO = new lH(
          -0x1,
          rN[ux(0x307)],
          0x0,
          0x0,
          rN[ux(0x509)],
          rN[ux(0xb84)] ? 0x10 : rN[ux(0x445)] * 1.1,
          0x0
        );
        (rO[ux(0x7ef)] = !![]),
          rN[ux(0xe2a)] === 0x1
            ? (rN[ux(0xd19)] = function (rP) {
                const An = ux;
                rO[An(0x989)](rP);
              })
            : (rN[ux(0xd19)] = function (rP) {
                const Ao = ux;
                for (let rQ = 0x0; rQ < rN[Ao(0xe2a)]; rQ++) {
                  rP[Ao(0x70a)]();
                  const rR = (rQ / rN[Ao(0xe2a)]) * Math["PI"] * 0x2;
                  rN[Ao(0xddf)]
                    ? rP[Ao(0x94b)](...lf(rN[Ao(0x9c2)], 0x0, rR))
                    : (rP[Ao(0x317)](rR), rP[Ao(0x94b)](rN[Ao(0x9c2)], 0x0)),
                    rP[Ao(0x317)](rN[Ao(0x5ee)]),
                    rO[Ao(0x989)](rP),
                    rP[Ao(0xdea)]();
                }
              });
      }
    }
    const nD = {};
    (nD[ux(0x724)] = ux(0x2de)),
      (nD[ux(0x71d)] = ux(0xb2a)),
      (nD[ux(0x545)] = ux(0xc78)),
      (nD[ux(0x892)] = ux(0x91a)),
      (nD[ux(0xe83)] = ux(0x3a8)),
      (nD[ux(0xc07)] = ux(0xeab)),
      (nD[ux(0x42b)] = ux(0xc84));
    var nE = nD;
    function nF() {
      const Ap = ux,
        rP = document[Ap(0x9e3)](Ap(0x42d));
      let rQ = Ap(0x520);
      for (let rR = 0x0; rR < 0xc8; rR++) {
        const rS = d5(rR),
          rT = 0xc8 * rS,
          rU = 0x19 * rS,
          rV = d4(rR);
        rQ +=
          Ap(0xab7) +
          (rR + 0x1) +
          Ap(0x444) +
          ka(Math[Ap(0xcec)](rT)) +
          Ap(0x444) +
          ka(Math[Ap(0xcec)](rU)) +
          Ap(0x444) +
          rV +
          Ap(0x71f);
      }
      (rQ += Ap(0x497)), (rQ += Ap(0xc40)), (rP[Ap(0xa94)] = rQ);
    }
    nF();
    function nG(rP, rQ) {
      const Aq = ux,
        rR = eL[rP],
        rS = rR[Aq(0x82f)],
        rT = rR[Aq(0x257)];
      return (
        "x" +
        rQ[Aq(0xe2a)] * rQ[Aq(0xbfd)] +
        ("\x20" + rS + Aq(0x500) + hP[rT] + Aq(0x6fe) + hM[rT] + ")")
      );
    }
    function nH(rP) {
      const Ar = ux;
      return rP[Ar(0x278)](0x2)[Ar(0x51a)](/\.?0+$/, "");
    }
    function nI(rP) {
      const As = ux,
        rQ = rP[As(0x905)];
      return Math[As(0xcec)]((rQ * rQ) / (0x32 * 0x32));
    }
    var nJ = [
        [ux(0x4ab), ux(0x4de), nE[ux(0x724)]],
        [ux(0x2fa), ux(0xe91), nE[ux(0x71d)]],
        [ux(0x792), ux(0x5cd), nE[ux(0x545)]],
        [ux(0x6e7), ux(0x43a), nE[ux(0x892)]],
        [ux(0x457), ux(0xb7f), nE[ux(0xc07)]],
        [ux(0x575), ux(0xedb), nE[ux(0xe83)]],
        [ux(0xc63), ux(0xade), nE[ux(0x42b)]],
        [ux(0x9b1), ux(0xb38), nE[ux(0x42b)], (rP) => "+" + ka(rP)],
        [ux(0x59f), ux(0x5ea), nE[ux(0x42b)], (rP) => "+" + ka(rP)],
        [ux(0xd17), ux(0xcab), nE[ux(0x42b)]],
        [
          ux(0x5b8),
          ux(0x35e),
          nE[ux(0x42b)],
          (rP) => Math[ux(0xcec)](rP * 0x64) + "%",
        ],
        [ux(0x951), ux(0x5fe), nE[ux(0x42b)], (rP) => "+" + nH(rP) + ux(0xed7)],
        [ux(0x521), ux(0x7d8), nE[ux(0x545)], (rP) => ka(rP) + "/s"],
        [ux(0x6e5), ux(0x7d8), nE[ux(0x545)], (rP) => ka(rP) + ux(0x55d)],
        [
          ux(0x4f5),
          ux(0x76e),
          nE[ux(0x42b)],
          (rP) => (rP > 0x0 ? "+" : "") + rP,
        ],
        [ux(0x5c1), ux(0x426), nE[ux(0xe83)], (rP) => "+" + rP + "%"],
        [
          ux(0x5ba),
          ux(0x476),
          nE[ux(0xe83)],
          (rP) => "+" + parseInt(rP * 0x64) + "%",
        ],
        [ux(0x477), ux(0xc59), nE[ux(0x42b)], (rP) => "-" + rP + "%"],
        [ux(0x522), ux(0xac6), nE[ux(0x42b)], nG],
        [ux(0xefd), ux(0x2c3), nE[ux(0xe83)], (rP) => rP / 0x3e8 + "s"],
        [ux(0x765), ux(0xc90), nE[ux(0xe83)], (rP) => rP + "s"],
        [ux(0xeef), ux(0x337), nE[ux(0xe83)], (rP) => ka(rP) + ux(0x263)],
        [ux(0x998), ux(0xe8f), nE[ux(0xe83)], (rP) => rP + "s"],
        [ux(0x597), ux(0x81b), nE[ux(0xe83)], (rP) => rP / 0x3e8 + "s"],
        [ux(0x7b8), ux(0xe29), nE[ux(0xe83)]],
        [ux(0xaa6), ux(0x673), nE[ux(0xe83)]],
        [ux(0x3fb), ux(0x4fd), nE[ux(0xe83)], (rP) => rP + ux(0xd2e)],
        [ux(0xa65), ux(0xcfb), nE[ux(0xe83)], (rP) => rP + ux(0xd2e)],
        [ux(0xa18), ux(0x3a6), nE[ux(0xe83)]],
        [ux(0x8a9), ux(0xc3d), nE[ux(0x42b)]],
        [ux(0xbf4), ux(0x50b), nE[ux(0xe83)], (rP) => rP / 0x3e8 + "s"],
        [ux(0xe2f), ux(0xd6e), nE[ux(0x545)], (rP) => ka(rP) + "/s"],
        [
          ux(0x91e),
          ux(0xae2),
          nE[ux(0xe83)],
          (rP, rQ) => ka(rP) + ux(0x34f) + ka(nI(rQ) * rP * 0x14) + ux(0x589),
        ],
        [
          ux(0x905),
          ux(0x950),
          nE[ux(0x42b)],
          (rP, rQ) => ka(rP) + "\x20(" + nI(rQ) + ux(0x7ab),
        ],
        [
          ux(0xcf8),
          ux(0xdbd),
          nE[ux(0xe83)],
          (rP, rQ) => nH(rP * rQ[ux(0x445)]),
        ],
        [ux(0xf08), ux(0x4ef), nE[ux(0xe83)]],
        [ux(0xe1d), ux(0x729), nE[ux(0x42b)]],
        [ux(0x7f3), ux(0x3e4), nE[ux(0xe83)]],
        [ux(0xa34), ux(0xb7e), nE[ux(0xe83)]],
        [ux(0x6dc), ux(0x8c6), nE[ux(0xe83)]],
        [
          ux(0x32a),
          ux(0x8ba),
          nE[ux(0xe83)],
          (rP) => "+" + nH(rP * 0x64) + "%",
        ],
        [ux(0xd6d), ux(0xd50), nE[ux(0xc07)]],
        [ux(0xf03), ux(0xab4), nE[ux(0xe83)]],
        [ux(0x6ec), ux(0xda2), nE[ux(0x545)]],
        [ux(0x4e2), ux(0xc90), nE[ux(0xe83)], (rP) => rP + "s"],
        [ux(0xa7d), ux(0x4b7), nE[ux(0xe83)]],
        [ux(0xd9e), ux(0xc7a), nE[ux(0x42b)], (rP) => rP / 0x3e8 + "s"],
      ],
      nK = [
        [ux(0x776), ux(0x21c), nE[ux(0xe83)]],
        [ux(0x76d), ux(0xadb), nE[ux(0x42b)], (rP) => ka(rP * 0x64) + "%"],
        [ux(0x6f0), ux(0x410), nE[ux(0x42b)]],
        [ux(0x90a), ux(0x411), nE[ux(0xe83)]],
        [ux(0xbcf), ux(0xc7c), nE[ux(0x42b)]],
        [ux(0x5c1), ux(0x426), nE[ux(0xe83)], (rP) => "+" + rP + "%"],
        [ux(0x5eb), ux(0xf3b), nE[ux(0xe83)], (rP) => ka(rP) + "/s"],
        [ux(0xde3), ux(0x259), nE[ux(0x724)], (rP) => rP * 0x64 + ux(0x8f0)],
        [ux(0x472), ux(0xa23), nE[ux(0xe83)], (rP) => rP + "s"],
        [
          ux(0x505),
          ux(0x4b6),
          nE[ux(0x42b)],
          (rP) => "-" + parseInt((0x1 - rP) * 0x64) + "%",
        ],
      ];
    function nL(rP, rQ = !![]) {
      const At = ux;
      let rR = "",
        rS = "",
        rT;
      rP[At(0x920)] === void 0x0
        ? ((rT = nJ),
          rP[At(0xc39)] &&
            (rS =
              At(0x67f) +
              (rP[At(0xc39)] / 0x3e8 +
                "s" +
                (rP[At(0x61c)] > 0x0
                  ? At(0xe2c) + rP[At(0x61c)] / 0x3e8 + "s"
                  : "")) +
              At(0x808)))
        : (rT = nK);
      for (let rV = 0x0; rV < rT[At(0xf30)]; rV++) {
        const [rW, rX, rY, rZ] = rT[rV],
          s0 = rP[rW];
        s0 &&
          s0 !== 0x0 &&
          (rR +=
            At(0x8e8) +
            rY +
            At(0xba3) +
            rX +
            At(0x611) +
            (rZ ? rZ(s0, rP) : ka(s0)) +
            At(0xe0f));
      }
      const rU = nR(
        At(0xc08) +
          rP[At(0x82f)] +
          At(0x8ea) +
          hM[rP[At(0x257)]] +
          At(0xd7f) +
          hP[rP[At(0x257)]] +
          At(0x9aa) +
          rS +
          At(0xd6b) +
          rP[At(0x493)] +
          At(0x9aa) +
          rR +
          At(0xafa)
      );
      if (rP[At(0xce5)] && rQ) {
        rU[At(0xc44)][At(0x5f5)][At(0xcfd)] = At(0x6ba);
        for (let s1 = 0x0; s1 < rP[At(0xce5)][At(0xf30)]; s1++) {
          const [s2, s3] = rP[At(0xce5)][s1],
            s4 = nR(At(0x2e5));
          rU[At(0x8c5)](s4);
          const s5 = f4[s3][rP[At(0x257)]];
          for (let s6 = 0x0; s6 < s5[At(0xf30)]; s6++) {
            const [s7, s8] = s5[s6],
              s9 = eV(s2, s8),
              sa = nR(
                At(0x8fc) +
                  s9[At(0x257)] +
                  "\x22\x20" +
                  qB(s9) +
                  At(0x757) +
                  s7 +
                  At(0x95e)
              );
            s4[At(0x8c5)](sa);
          }
        }
      }
      return rU;
    }
    function nM() {
      const Au = ux;
      mL && (mL[Au(0xcd1)](), (mL = null));
      const rP = kp[Au(0x6a7)](Au(0xb58));
      for (let rQ = 0x0; rQ < rP[Au(0xf30)]; rQ++) {
        const rR = rP[rQ];
        rR[Au(0xcd1)]();
      }
      for (let rS = 0x0; rS < iP; rS++) {
        const rT = nR(Au(0x32c));
        rT[Au(0x6d0)] = rS;
        const rU = iQ[rS];
        if (rU) {
          const rV = nR(
            Au(0x840) + rU[Au(0x257)] + "\x22\x20" + qB(rU) + Au(0x282)
          );
          (rV[Au(0x559)] = rU),
            (rV[Au(0xcff)] = !![]),
            (rV[Au(0x543)] = iS[Au(0x408)]()),
            nQ(rV, rU),
            rT[Au(0x8c5)](rV),
            (iR[rV[Au(0x543)]] = rV);
        }
        rS >= iO
          ? (rT[Au(0x8c5)](nR(Au(0x46a) + ((rS - iO + 0x1) % 0xa) + Au(0xaba))),
            nB[Au(0x8c5)](rT))
          : nA[Au(0x8c5)](rT);
      }
    }
    function nN(rP) {
      const Av = ux;
      return rP < 0.5
        ? 0x4 * rP * rP * rP
        : 0x1 - Math[Av(0x8df)](-0x2 * rP + 0x2, 0x3) / 0x2;
    }
    var nO = [];
    function nP(rP, rQ) {
      const Aw = ux;
      (rP[Aw(0x9de)] = 0x0), (rP[Aw(0x657)] = 0x1);
      let rR = 0x1,
        rS = 0x0,
        rT = -0x1;
      rP[Aw(0x52a)][Aw(0x536)](Aw(0x7e6)), rP[Aw(0x467)](Aw(0x5f5), "");
      const rU = nR(Aw(0xb26));
      rP[Aw(0x8c5)](rU), nO[Aw(0xf33)](rU);
      const rV = qt;
      rU[Aw(0xf3d)] = rU[Aw(0xac0)] = rV;
      const rW = rU[Aw(0x76b)]("2d");
      (rU[Aw(0xaee)] = function () {
        const Ax = Aw;
        rW[Ax(0xe22)](0x0, 0x0, rV, rV);
        rS < 0.99 &&
          ((rW[Ax(0x442)] = 0x1 - rS),
          (rW[Ax(0x756)] = Ax(0x5b4)),
          rW[Ax(0x8bf)](0x0, 0x0, rV, (0x1 - rR) * rV));
        if (rS < 0.01) return;
        (rW[Ax(0x442)] = rS),
          rW[Ax(0x70a)](),
          rW[Ax(0x70b)](rV / 0x64),
          rW[Ax(0x94b)](0x32, 0x2d);
        let rX = rP[Ax(0x9de)];
        rX = nN(rX);
        const rY = Math["PI"] * 0x2 * rX;
        rW[Ax(0x317)](rY * 0x4),
          rW[Ax(0x936)](),
          rW[Ax(0xba7)](0x0, 0x0),
          rW[Ax(0xb0a)](0x0, 0x0, 0x64, 0x0, rY),
          rW[Ax(0xba7)](0x0, 0x0),
          rW[Ax(0xb0a)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rW[Ax(0x756)] = Ax(0x709)),
          rW[Ax(0x64e)](Ax(0xb96)),
          rW[Ax(0xdea)]();
      }),
        (rU[Aw(0xb75)] = function () {
          const Ay = Aw;
          rP[Ay(0x9de)] += pR / (rQ[Ay(0xc39)] + 0xc8);
          let rX = 0x1,
            rY = rP[Ay(0x657)];
          rP[Ay(0x9de)] >= 0x1 && (rX = 0x0);
          const rZ = rP[Ay(0x63a)] || rP[Ay(0x483)];
          ((rZ && rZ[Ay(0x483)] === nB) || !iz) && ((rY = 0x1), (rX = 0x0));
          (rS = px(rS, rX, 0x64)), (rR = px(rR, rY, 0x64));
          const s0 = Math[Ay(0xcec)]((0x1 - rR) * 0x64),
            s1 = Math[Ay(0xcec)](rS * 0x64) / 0x64;
          s1 == 0x0 && s0 <= 0x0
            ? ((rU[Ay(0xbf2)] = ![]), (rU[Ay(0x5f5)][Ay(0x4f9)] = Ay(0xdf2)))
            : ((rU[Ay(0xbf2)] = !![]), (rU[Ay(0x5f5)][Ay(0x4f9)] = "")),
            (rT = s0);
        }),
        rP[Aw(0x8c5)](nR(Aw(0x8e2) + qB(rQ) + Aw(0x282)));
    }
    function nQ(rP, rQ, rR = !![]) {
      const Az = ux;
      rR && rQ[Az(0x920)] === void 0x0 && nP(rP, rQ);
    }
    function nR(rP) {
      const AA = ux;
      return (hA[AA(0xa94)] = rP), hA[AA(0xd83)][0x0];
    }
    var nS = document[ux(0x9e3)](ux(0xb20)),
      nT = [];
    function nU() {
      const AB = ux;
      (nS[AB(0xa94)] = AB(0xdf5)[AB(0x678)](eK * dG)),
        (nT = Array[AB(0x50f)](nS[AB(0xd83)]));
    }
    nU();
    var nV = {};
    for (let rP = 0x0; rP < eJ[ux(0xf30)]; rP++) {
      const rQ = eJ[rP];
      !nV[rQ[ux(0x307)]] &&
        ((nV[rQ[ux(0x307)]] = new lH(
          -0x1,
          rQ[ux(0x307)],
          0x0,
          0x0,
          rQ[ux(0x2c2)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          rQ[ux(0xb1d)],
          0x1
        )),
        (nV[rQ[ux(0x307)]][ux(0x7ef)] = !![]));
      const rR = nV[rQ[ux(0x307)]];
      let rS = null;
      rQ[ux(0x78e)] !== void 0x0 &&
        (rS = new lH(-0x1, rQ[ux(0x78e)], 0x0, 0x0, 0x0, rQ[ux(0xb1d)], 0x1)),
        (rQ[ux(0xd19)] = function (rT) {
          const AC = ux;
          rT[AC(0xd3a)](0.5, 0.5),
            rR[AC(0x989)](rT),
            rS &&
              (rT[AC(0x317)](rR[AC(0x88c)]),
              rT[AC(0x94b)](-rQ[AC(0xb1d)] * 0x2, 0x0),
              rS[AC(0x989)](rT));
        });
    }
    function nW(rT, rU = ![]) {
      const AD = ux,
        rV = nR(AD(0x840) + rT[AD(0x257)] + "\x22\x20" + qB(rT) + AD(0x282));
      jZ(rV), (rV[AD(0x559)] = rT);
      if (rU) return rV;
      const rW = dG * rT[AD(0xb85)] + rT[AD(0x257)],
        rX = nT[rW];
      return nS[AD(0xd73)](rV, rX), rX[AD(0xcd1)](), (nT[rW] = rV), rV;
    }
    var nX = document[ux(0x9e3)](ux(0x785)),
      nY = document[ux(0x9e3)](ux(0x879)),
      nZ = document[ux(0x9e3)](ux(0xb23)),
      o0 = document[ux(0x9e3)](ux(0xce4)),
      o1 = document[ux(0x9e3)](ux(0x404)),
      o2 = o1[ux(0x9e3)](ux(0x758)),
      o3 = o1[ux(0x9e3)](ux(0xf35)),
      o4 = document[ux(0x9e3)](ux(0xd0b)),
      o5 = document[ux(0x9e3)](ux(0xe75)),
      o6 = ![],
      o7 = 0x0,
      o8 = ![];
    (nY[ux(0xc0d)] = function () {
      (o6 = !![]), (o7 = 0x0), (o8 = ![]);
    }),
      (o0[ux(0xc0d)] = function () {
        const AE = ux;
        if (this[AE(0x52a)][AE(0xa05)](AE(0xd5c)) || jz) return;
        kJ(AE(0x934), (rT) => {
          rT && ((o6 = !![]), (o7 = 0x0), (o8 = !![]));
        });
      }),
      (nX[ux(0xa94)] = ux(0xdf5)[ux(0x678)](dF * dG));
    var o9 = Array[ux(0x50f)](nX[ux(0xd83)]),
      oa = document[ux(0x9e3)](ux(0x830)),
      ob = {};
    function oc() {
      const AF = ux;
      for (let rT in ob) {
        ob[rT][AF(0x415)]();
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
        rU = Array[AG(0x50f)](rT[AG(0x6a7)](AG(0xb58)));
      rU[AG(0x9ff)]((rV, rW) => {
        const AH = AG,
          rX = rW[AH(0x559)][AH(0x257)] - rV[AH(0x559)][AH(0x257)];
        return rX === 0x0 ? rW[AH(0x559)]["id"] - rV[AH(0x559)]["id"] : rX;
      });
      for (let rV = 0x0; rV < rU[AG(0xf30)]; rV++) {
        const rW = rU[rV];
        rT[AG(0x8c5)](rW);
      }
    }
    function of(rT, rU) {
      const AI = ux,
        rV = rU[AI(0x257)] - rT[AI(0x257)];
      return rV === 0x0 ? rU["id"] - rT["id"] : rV;
    }
    function og(rT, rU = !![]) {
      const AJ = ux,
        rV = nR(AJ(0x680) + rT[AJ(0x257)] + "\x22\x20" + qB(rT) + AJ(0xe50));
      setTimeout(function () {
        const AK = AJ;
        rV[AK(0x52a)][AK(0xcd1)](AK(0x983));
      }, 0x1f4),
        (rV[AJ(0x559)] = rT);
      if (rU) {
      }
      return (rV[AJ(0x5a7)] = rV[AJ(0x9e3)](AJ(0xbc5))), rV;
    }
    var oh = nR(ux(0x6a8)),
      oi = oh[ux(0x9e3)](ux(0xd3d)),
      oj = oh[ux(0x9e3)](ux(0x9e0)),
      ok = oh[ux(0x9e3)](ux(0xdc1)),
      ol = [];
    for (let rT = 0x0; rT < 0x5; rT++) {
      const rU = nR(ux(0xdf5));
      (rU[ux(0xab2)] = function (rV = 0x0) {
        const AL = ux,
          rW =
            (rT / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rV * Math["PI"] * 0x6,
          rX =
            0x32 +
            (rV > 0x0
              ? Math[AL(0x54a)](Math[AL(0x4ce)](rV * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[AL(0x5f5)][AL(0xb00)] = Math[AL(0x5a6)](rW) * rX + 0x32 + "%"),
          (this[AL(0x5f5)][AL(0x420)] = Math[AL(0x4ce)](rW) * rX + 0x32 + "%");
      }),
        rU[ux(0xab2)](),
        (rU[ux(0xe2a)] = 0x0),
        (rU["el"] = null),
        (rU[ux(0x85b)] = function () {
          const AM = ux;
          (rU[AM(0xe2a)] = 0x0), (rU["el"] = null), (rU[AM(0xa94)] = "");
        }),
        (rU[ux(0xe6c)] = function (rV) {
          const AN = ux;
          if (!rU["el"]) {
            const rW = og(p0, ![]);
            (rW[AN(0xc0d)] = function () {
              if (p2 || p4) return;
              p8(null);
            }),
              rU[AN(0x8c5)](rW),
              (rU["el"] = rW);
          }
          (rU[AN(0xe2a)] += rV), p6(rU["el"][AN(0x5a7)], rU[AN(0xe2a)]);
        }),
        oi[ux(0x8c5)](rU),
        ol[ux(0xf33)](rU);
    }
    var om,
      on = document[ux(0x9e3)](ux(0xbe3)),
      oo = document[ux(0x9e3)](ux(0xb8b)),
      op = document[ux(0x9e3)](ux(0x50e)),
      oq = document[ux(0x9e3)](ux(0x20b)),
      or = {};
    function os() {
      const AO = ux,
        rV = document[AO(0x9e3)](AO(0xcc7));
      for (let rW = 0x0; rW < dG; rW++) {
        const rX = nR(AO(0xdc5) + rW + AO(0x3a4));
        (rX[AO(0xc0d)] = function () {
          const AP = AO;
          let rY = pq;
          pq = !![];
          for (const rZ in ob) {
            const s0 = dB[rZ];
            if (s0[AP(0x257)] !== rW) continue;
            const s1 = ob[rZ];
            s1[AP(0xb46)][AP(0xe13)]();
          }
          pq = rY;
        }),
          (or[rW] = rX),
          rV[AO(0x8c5)](rX);
      }
    }
    os();
    var ot = ![],
      ou = document[ux(0x9e3)](ux(0x3a9));
    ou[ux(0xc0d)] = function () {
      const AQ = ux;
      document[AQ(0x458)][AQ(0x52a)][AQ(0xee9)](AQ(0x6df)),
        (ot = document[AQ(0x458)][AQ(0x52a)][AQ(0xa05)](AQ(0x6df)));
      const rV = ot ? AQ(0x30f) : AQ(0xaab);
      k9(oo, rV),
        k9(oq, rV),
        ot
          ? (on[AQ(0x8c5)](oh), oh[AQ(0x8c5)](nX), op[AQ(0xcd1)]())
          : (on[AQ(0x8c5)](op),
            op[AQ(0xd73)](nX, op[AQ(0xc44)]),
            oh[AQ(0xcd1)]());
    };
    var ov = document[ux(0x9e3)](ux(0xb1f)),
      ow = oz(ux(0xb38), nE[ux(0x71d)]),
      ox = oz(ux(0xa2e), nE[ux(0x724)]),
      oy = oz(ux(0xa5b), nE[ux(0xc07)]);
    function oz(rV, rW) {
      const AR = ux,
        rX = nR(AR(0x407) + rW + AR(0xa1f) + rV + AR(0xa66));
      return (
        (rX[AR(0x5b5)] = function (rY) {
          const AS = AR;
          k9(rX[AS(0xd83)][0x1], ka(Math[AS(0xcec)](rY)));
        }),
        ov[AR(0x8c5)](rX),
        rX
      );
    }
    var oA = document[ux(0x9e3)](ux(0xa0a)),
      oB = document[ux(0x9e3)](ux(0x52e));
    oB[ux(0xa94)] = "";
    var oC = document[ux(0x9e3)](ux(0xd86)),
      oD = {};
    function oE() {
      const AT = ux;
      (oB[AT(0xa94)] = ""), (oC[AT(0xa94)] = "");
      const rV = {},
        rW = [];
      for (let rX in oD) {
        const rY = dB[rX],
          rZ = oD[rX];
        (rV[rY[AT(0x257)]] = (rV[rY[AT(0x257)]] || 0x0) + rZ),
          rW[AT(0xf33)]([rY, rZ]);
      }
      if (rW[AT(0xf30)] === 0x0) {
        oA[AT(0x5f5)][AT(0x4f9)] = AT(0xdf2);
        return;
      }
      (oA[AT(0x5f5)][AT(0x4f9)] = ""),
        rW[AT(0x9ff)]((s0, s1) => {
          return of(s0[0x0], s1[0x0]);
        })[AT(0x45f)](([s0, s1]) => {
          const AU = AT,
            s2 = og(s0);
          jZ(s2), p6(s2[AU(0x5a7)], s1), oB[AU(0x8c5)](s2);
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
            AV(0xc41) + ka(rZ) + "\x20" + rY + AV(0xd7f) + hO[rY] + AV(0xee5)
          );
          rV[AV(0x828)](s0);
        }
      }
      rX % 0x2 === 0x1 &&
        (rV[AV(0xd83)][0x0][AV(0x5f5)][AV(0xb17)] = AV(0x44d));
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
          AW(0xce6) + (oI + 0x1) + AW(0x275) + iK(oK) + "/" + iK(oL) + AW(0x908)
        );
      const rW = d5(oI);
      ow[AW(0x5b5)](0xc8 * rW),
        ox[AW(0x5b5)](0x19 * rW),
        oy[AW(0x5b5)](d4(oI)),
        hack.hp = 0xc8 * rW,
        (oN = Math[AW(0xeeb)](0x1, oK / oL)),
        (oP = 0x0),
        (o0[AW(0x9e3)](AW(0xe85))[AW(0xa94)] =
          oI >= cG ? AW(0x693) : AW(0xe48) + (cG + 0x1) + AW(0x7fd));
    }
    var oS = 0x0,
      oT = document[ux(0x9e3)](ux(0x53a));
    for (let rV = 0x0; rV < cY[ux(0xf30)]; rV++) {
      const [rW, rX] = cY[rV],
        rY = j8[rW],
        rZ = nR(
          ux(0x436) +
            hO[rY] +
            ux(0x4c7) +
            rY +
            ux(0x5c4) +
            (rX + 0x1) +
            ux(0xa80)
        );
      (rZ[ux(0xc0d)] = function () {
        const AX = ux;
        if (oI >= rX) {
          const s0 = oT[AX(0x9e3)](AX(0xba2));
          s0 && s0[AX(0x52a)][AX(0xcd1)](AX(0xae4)),
            (oS = rV),
            (hC[AX(0x684)] = rV),
            this[AX(0x52a)][AX(0x536)](AX(0xae4));
        }
      }),
        (cY[rV][ux(0x8b6)] = rZ),
        oT[ux(0x8c5)](rZ);
    }
    function oU() {
      const AY = ux,
        s0 = parseInt(hC[AY(0x684)]) || 0x0;
      cY[0x0][AY(0x8b6)][AY(0xe13)](),
        cY[AY(0x45f)]((s1, s2) => {
          const AZ = AY,
            s3 = s1[0x1];
          if (oI >= s3) {
            s1[AZ(0x8b6)][AZ(0x52a)][AZ(0xcd1)](AZ(0xd5c));
            if (s0 === s2) s1[AZ(0x8b6)][AZ(0xe13)]();
          } else s1[AZ(0x8b6)][AZ(0x52a)][AZ(0x536)](AZ(0xd5c));
        });
    }
    var oV = document[ux(0x9e3)](ux(0xceb));
    setInterval(() => {
      const B0 = ux;
      if (!on[B0(0x52a)][B0(0xa05)](B0(0x4ac))) return;
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
          const s4 = oX(s3, oG[s3][B1(0xe2a)]);
          (s1 += s4), (s0 += s4);
        }
        if (s1 > 0x0) {
          const s5 = Math[B1(0xeeb)](0x19, (s1 / s0) * 0x64),
            s6 = s5 > 0x1 ? s5[B1(0x278)](0x2) : s5[B1(0x278)](0x5);
          k9(oV, "+" + s6 + "%");
        }
      }
    }
    function oX(s0, s1) {
      const B2 = ux,
        s2 = dB[s0];
      if (!s2) return 0x0;
      const s3 = s2[B2(0x257)];
      return Math[B2(0x8df)](s3 * 0xa, s3) * s1;
    }
    var oY = document[ux(0x9e3)](ux(0xc2d));
    (oY[ux(0xc0d)] = function () {
      const B3 = ux;
      for (const s0 in oG) {
        const s1 = oG[s0];
        s1[B3(0x415)]();
      }
      oZ();
    }),
      oZ(),
      oR();
    function oZ() {
      const B4 = ux,
        s0 = Object[B4(0x669)](oG);
      nZ[B4(0x52a)][B4(0xcd1)](B4(0xa67));
      const s1 = s0[B4(0xf30)] === 0x0;
      (oY[B4(0x5f5)][B4(0x4f9)] = s1 ? B4(0xdf2) : ""), (oQ = 0x0);
      let s2 = 0x0;
      const s3 = s0[B4(0xf30)] > 0x1 ? 0x32 : 0x0;
      for (let s5 = 0x0, s6 = s0[B4(0xf30)]; s5 < s6; s5++) {
        const s7 = s0[s5],
          s8 = (s5 / s6) * Math["PI"] * 0x2;
        s7[B4(0x42c)](
          Math[B4(0x5a6)](s8) * s3 + 0x32,
          Math[B4(0x4ce)](s8) * s3 + 0x32
        ),
          (oQ += d2[s7["el"][B4(0x559)][B4(0x257)]] * s7[B4(0xe2a)]);
      }
      nZ[B4(0x52a)][s3 ? B4(0x536) : B4(0xcd1)](B4(0xa67)),
        nY[B4(0x52a)][s0[B4(0xf30)] > 0x0 ? B4(0xcd1) : B4(0x536)](B4(0x877));
      const s4 = oI >= cG;
      o0[B4(0x52a)][s0[B4(0xf30)] > 0x0 && s4 ? B4(0xcd1) : B4(0x536)](
        B4(0xd5c)
      ),
        oW(),
        (nZ[B4(0x5f5)][B4(0x2a7)] = ""),
        (o6 = ![]),
        (o8 = ![]),
        (o7 = 0x0),
        (oM = Math[B4(0xeeb)](0x1, (oK + oQ) / oL) || 0x0),
        k9(o4, oQ > 0x0 ? "+" + iK(oQ) + B4(0x908) : "");
    }
    var p0,
      p1 = 0x0,
      p2 = ![],
      p3 = 0x0,
      p4 = null;
    function p5() {
      const B5 = ux;
      oj[B5(0x52a)][p1 < 0x5 ? B5(0x536) : B5(0xcd1)](B5(0x877));
    }
    oj[ux(0xc0d)] = function () {
      const B6 = ux;
      if (p2 || !p0 || p1 < 0x5 || !il() || p4) return;
      (p2 = !![]), (p3 = 0x0), (p4 = null), oj[B6(0x52a)][B6(0x536)](B6(0x877));
      const s0 = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      s0[B6(0x755)](0x0, cH[B6(0xbc1)]),
        s0[B6(0x72a)](0x1, p0["id"]),
        s0[B6(0x365)](0x3, p1),
        im(s0);
    };
    function p6(s0, s1) {
      k9(s0, "x" + iK(s1));
    }
    function p7(s0) {
      const B7 = ux;
      typeof s0 === B7(0xbff) && (s0 = nH(s0)), k9(ok, s0 + B7(0x748));
    }
    function p8(s0) {
      const B8 = ux;
      p0 && n6(p0["id"], p1);
      om && om[B8(0xe13)]();
      (p0 = s0), (p1 = 0x0), p5();
      for (let s1 = 0x0; s1 < ol[B8(0xf30)]; s1++) {
        ol[s1][B8(0x85b)]();
      }
      p0
        ? (p7(dD[p0[B8(0x257)]] * (jz ? 0x2 : 0x1) * (hd ? 0.9 : 0x1)),
          (oj[B8(0x5f5)][B8(0xabf)] = hP[p0[B8(0x257)] + 0x1]))
        : p7("?");
    }
    var p9 = 0x0,
      pa = 0x1;
    function pb(s0) {
      const B9 = ux,
        s1 = dB[s0],
        s2 = og(s1);
      (s2[B9(0x508)] = pt), jZ(s2), (s2[B9(0x413)] = !![]), oa[B9(0x8c5)](s2);
      const s3 = og(s1);
      jZ(s3), (s3[B9(0x508)] = on);
      s1[B9(0x257)] >= db && s3[B9(0x52a)][B9(0x536)](B9(0x2a8));
      s3[B9(0xc0d)] = function () {
        const Ba = B9;
        pQ - p9 < 0x1f4 ? pa++ : (pa = 0x1);
        p9 = pQ;
        if (ot) {
          if (p2 || s1[Ba(0x257)] >= db) return;
          const s7 = iT[s1["id"]];
          if (!s7) return;
          p0 !== s1 && p8(s1);
          const s8 = ol[Ba(0xf30)];
          let s9 = pq ? s7 : Math[Ba(0xeeb)](s8 * pa, s7);
          n6(s1["id"], -s9), (p1 += s9), p5();
          let sa = s9 % s8,
            sb = (s9 - sa) / s8;
          const sc = [...ol][Ba(0x9ff)](
            (se, sf) => se[Ba(0xe2a)] - sf[Ba(0xe2a)]
          );
          sb > 0x0 && sc[Ba(0x45f)]((se) => se[Ba(0xe6c)](sb));
          let sd = 0x0;
          while (sa--) {
            const se = sc[sd];
            (sd = (sd + 0x1) % s8), se[Ba(0xe6c)](0x1);
          }
          return;
        }
        if (!oG[s1["id"]]) {
          const sf = og(s1, ![]);
          k9(sf[Ba(0x5a7)], "x1"),
            (sf[Ba(0xc0d)] = function (sh) {
              const Bb = Ba;
              sg[Bb(0x415)](), oZ();
            }),
            nZ[Ba(0x8c5)](sf);
          const sg = {
            petal: s1,
            count: 0x0,
            el: sf,
            setPos(sh, si) {
              const Bc = Ba;
              (sf[Bc(0x5f5)][Bc(0xb00)] = sh + "%"),
                (sf[Bc(0x5f5)][Bc(0x420)] = si + "%"),
                (sf[Bc(0x5f5)][Bc(0xd63)] = Bc(0x931));
            },
            dispose(sh = !![]) {
              const Bd = Ba;
              sf[Bd(0xcd1)](),
                sh && n6(s1["id"], this[Bd(0xe2a)]),
                delete oG[s1["id"]];
            },
          };
          (oG[s1["id"]] = sg), oZ();
        }
        const s6 = oG[s1["id"]];
        if (iT[s1["id"]]) {
          const sh = iT[s1["id"]],
            si = pq ? sh : Math[Ba(0xeeb)](0x1 * pa, sh);
          (s6[Ba(0xe2a)] += si),
            n6(s1["id"], -si),
            p6(s6["el"][Ba(0x5a7)], s6[Ba(0xe2a)]);
        }
        oZ();
      };
      const s4 = dG * s1[B9(0xb85)] + s1[B9(0x75b)],
        s5 = o9[s4];
      return (
        nX[B9(0xd73)](s3, s5),
        s5[B9(0xcd1)](),
        (o9[s4] = s3),
        (s2[B9(0x682)] = function (s6) {
          const Be = B9;
          p6(s2[Be(0x5a7)], s6), p6(s3[Be(0x5a7)], s6);
        }),
        (s2[B9(0xb46)] = s3),
        (ob[s0] = s2),
        (s2[B9(0x415)] = function () {
          const Bf = B9;
          s2[Bf(0xcd1)](), delete ob[s0];
          const s6 = nR(Bf(0xdf5));
          (o9[s4] = s6), nX[Bf(0xd73)](s6, s3), s3[Bf(0xcd1)]();
        }),
        s2[B9(0x682)](iT[s0]),
        s2
      );
    }
    var pc = {},
      pd = {};
    function pe(s0, s1, s2, s3) {
      const Bg = ux,
        s4 = document[Bg(0x9e3)](s2);
      (s4[Bg(0x1d9)] = function () {
        const Bh = Bg;
        (pc[s0] = this[Bh(0xa82)]),
          (hC[s0] = this[Bh(0xa82)] ? "1" : "0"),
          s3 && s3(this[Bh(0xa82)]);
      }),
        (pd[s0] = function () {
          const Bi = Bg;
          s4[Bi(0xe13)]();
        }),
        (s4[Bg(0xa82)] = hC[s0] === void 0x0 ? s1 : hC[s0] === "1"),
        s4[Bg(0x1d9)]();
    }
    var pf = document[ux(0x9e3)](ux(0x2b5));
    (pf[ux(0x559)] = function () {
      const Bj = ux;
      return nR(
        Bj(0x48f) + hO[Bj(0xd06)] + Bj(0x6e6) + hO[Bj(0x424)] + Bj(0xd70)
      );
    }),
      pe(ux(0x743), ![], ux(0x859), mI),
      pe(ux(0x3c9), !![], ux(0x517)),
      pe(ux(0x4be), !![], ux(0x83f)),
      pe(
        ux(0x311),
        !![],
        ux(0xeff),
        (s0) => (kL[ux(0x5f5)][ux(0x4f9)] = s0 ? "" : ux(0xdf2))
      ),
      pe(ux(0x20e), ![], ux(0xe0c)),
      pe(ux(0x1e4), ![], ux(0x75d)),
      pe(ux(0x8d6), ![], ux(0x498)),
      pe(ux(0xbbe), !![], ux(0x312)),
      pe(
        ux(0x7a2),
        !![],
        ux(0x69a),
        (s0) => (pf[ux(0x5f5)][ux(0x4f9)] = s0 ? "" : ux(0xdf2))
      ),
      pe(ux(0x6a9), ![], ux(0xa35), kU),
      pe(ux(0xc8b), ![], ux(0x534), kY),
      pe(ux(0x8cc), ![], ux(0x523), (s0) => pg(kp, ux(0xd4e), s0)),
      pe(ux(0x23f), !![], ux(0x9f8), (s0) =>
        pg(document[ux(0x458)], ux(0x3a3), !s0)
      ),
      pe(ux(0x294), !![], ux(0xe59), (s0) =>
        pg(document[ux(0x458)], ux(0x35d), !s0)
      ),
      pe(ux(0xe07), !![], ux(0x37d)),
      pe(ux(0xedc), ![], ux(0xefa)),
      pe(ux(0xc15), ![], ux(0x628)),
      pe(ux(0x9bd), ![], ux(0x677)),
      pe(ux(0x9ad), ![], ux(0x5e1), (s0) => {
        const Bk = ux;
        pg(document[Bk(0x458)], Bk(0x79c), s0), iC();
      });
    function pg(s0, s1, s2) {
      const Bl = ux;
      s0[Bl(0x52a)][s2 ? Bl(0x536) : Bl(0xcd1)](s1);
    }
    function ph() {
      const Bm = ux,
        s0 = document[Bm(0x9e3)](Bm(0x746)),
        s1 = [];
      for (let s3 = 0x0; s3 <= 0xa; s3++) {
        s1[Bm(0xf33)](0x1 - s3 * 0.05);
      }
      for (const s4 of s1) {
        const s5 = nR(Bm(0xe42) + s4 + "\x22>" + nH(s4 * 0x64) + Bm(0xb07));
        s0[Bm(0x8c5)](s5);
      }
      let s2 = parseFloat(hC[Bm(0x25e)]);
      (isNaN(s2) || !s1[Bm(0x7b5)](s2)) && (s2 = s1[0x0]),
        (s0[Bm(0x459)] = s2),
        (kQ = s2),
        (s0[Bm(0x1d9)] = function () {
          const Bn = Bm;
          (kQ = parseFloat(this[Bn(0x459)])),
            (hC[Bn(0x25e)] = this[Bn(0x459)]),
            kY();
        });
    }
    ph();
    var pi = document[ux(0x9e3)](ux(0x46d)),
      pj = document[ux(0x9e3)](ux(0xe78));
    pj[ux(0xe6b)] = cK;
    var pk = document[ux(0x9e3)](ux(0x6ee));
    function pl(s0) {
      const Bo = ux,
        s1 = nR(Bo(0xbb4));
      km[Bo(0x8c5)](s1);
      const s2 = s1[Bo(0x9e3)](Bo(0x5db));
      s2[Bo(0x459)] = s0;
      const s3 = s1[Bo(0x9e3)](Bo(0x474));
      (s3[Bo(0x1d9)] = function () {
        const Bp = Bo;
        s2[Bp(0x307)] = this[Bp(0xa82)] ? Bp(0x37e) : Bp(0x5d4);
      }),
        (s1[Bo(0x9e3)](Bo(0xd46))[Bo(0xc0d)] = function () {
          const Bq = Bo;
          jq(s0), hb(Bq(0x265));
        }),
        (s1[Bo(0x9e3)](Bo(0xea8))[Bo(0xc0d)] = function () {
          const Br = Bo,
            s4 = {};
          s4[Br(0x307)] = Br(0xe7f);
          const s5 = new Blob([s0], s4),
            s6 = document[Br(0x636)]("a");
          (s6[Br(0x615)] = URL[Br(0x46c)](s5)),
            (s6[Br(0x2c5)] = (jw ? jw : Br(0xe15)) + Br(0x623)),
            s6[Br(0xe13)](),
            hb(Br(0x2f4));
        }),
        (s1[Bo(0x9e3)](Bo(0x600))[Bo(0xc0d)] = function () {
          const Bs = Bo;
          s1[Bs(0xcd1)]();
        });
    }
    function pm() {
      const Bt = ux,
        s0 = nR(Bt(0x4f4));
      km[Bt(0x8c5)](s0);
      const s1 = s0[Bt(0x9e3)](Bt(0x5db)),
        s2 = s0[Bt(0x9e3)](Bt(0x474));
      (s2[Bt(0x1d9)] = function () {
        const Bu = Bt;
        s1[Bu(0x307)] = this[Bu(0xa82)] ? Bu(0x37e) : Bu(0x5d4);
      }),
        (s0[Bt(0x9e3)](Bt(0x600))[Bt(0xc0d)] = function () {
          const Bv = Bt;
          s0[Bv(0xcd1)]();
        }),
        (s0[Bt(0x9e3)](Bt(0x656))[Bt(0xc0d)] = function () {
          const Bw = Bt,
            s3 = s1[Bw(0x459)][Bw(0x77b)]();
          if (eU(s3)) {
            delete hC[Bw(0x71a)], (hC[Bw(0x91b)] = s3);
            if (hV)
              try {
                hV[Bw(0xd36)]();
              } catch (s4) {}
            hb(Bw(0x95a));
          } else hb(Bw(0x881));
        });
    }
    (document[ux(0x9e3)](ux(0x49b))[ux(0xc0d)] = function () {
      const Bx = ux;
      if (i6) {
        pl(i6);
        return;
        const s0 = prompt(Bx(0x55a), i6);
        if (s0 !== null) {
          const s1 = {};
          s1[Bx(0x307)] = Bx(0xe7f);
          const s2 = new Blob([i6], s1),
            s3 = document[Bx(0x636)]("a");
          (s3[Bx(0x615)] = URL[Bx(0x46c)](s2)),
            (s3[Bx(0x2c5)] = jw + Bx(0x6db)),
            s3[Bx(0xe13)](),
            alert(Bx(0x991));
        }
      }
    }),
      (document[ux(0x9e3)](ux(0x36d))[ux(0xc0d)] = function () {
        const By = ux;
        pm();
        return;
        const s0 = prompt(By(0xd3e));
        if (s0 !== null) {
          if (eU(s0)) {
            let s1 = By(0x4e0);
            i7 && (s1 += By(0x304));
            if (confirm(s1)) {
              delete hC[By(0x71a)], (hC[By(0x91b)] = s0);
              if (hV)
                try {
                  hV[By(0xd36)]();
                } catch (s2) {}
            }
          } else alert(By(0x881));
        }
      }),
      pe(ux(0x992), ![], ux(0x2ab), (s0) =>
        pj[ux(0x52a)][s0 ? ux(0x536) : ux(0xcd1)](ux(0xe52))
      ),
      pe(ux(0xc7b), !![], ux(0x478));
    var pn = 0x0,
      po = 0x0,
      pp = 0x0,
      pq = ![];
    function pr(s0, s1) {
      const Bz = ux;
      (s0 === Bz(0x3fa) || s0 === Bz(0xf1b)) && (pq = s1);
      if (s1) {
        switch (s0) {
          case Bz(0x5dc):
            m3[Bz(0xe18)][Bz(0xee9)]();
            break;
          case Bz(0x947):
            m3[Bz(0x940)][Bz(0xee9)]();
            break;
          case Bz(0x68b):
            m3[Bz(0x20d)][Bz(0xee9)]();
            break;
          case Bz(0xebc):
            q3[Bz(0x52a)][Bz(0xee9)](Bz(0xae4));
            break;
          case Bz(0x9c4):
            pd[Bz(0x743)](), hb(Bz(0x81c) + (pc[Bz(0x743)] ? "ON" : Bz(0x574)));
            break;
          case Bz(0x679):
            pd[Bz(0xedc)](), hb(Bz(0x3c0) + (pc[Bz(0xedc)] ? "ON" : Bz(0x574)));
            break;
          case Bz(0xee1):
            pd[Bz(0x20e)](), hb(Bz(0x6f3) + (pc[Bz(0x20e)] ? "ON" : Bz(0x574)));
            break;
          case Bz(0x644):
            pd[Bz(0x1e4)](), hb(Bz(0x359) + (pc[Bz(0x1e4)] ? "ON" : Bz(0x574)));
            break;
          case Bz(0xbe8):
            pd[Bz(0x311)](), hb(Bz(0x5ac) + (pc[Bz(0x311)] ? "ON" : Bz(0x574)));
            break;
          case Bz(0x496):
            pd[Bz(0x8d6)](), hb(Bz(0x49d) + (pc[Bz(0x8d6)] ? "ON" : Bz(0x574)));
            break;
          case Bz(0xcf5):
            if (!mL && hX) {
              const s2 = nA[Bz(0x6a7)](Bz(0xefe)),
                s3 = nB[Bz(0x6a7)](Bz(0xefe));
              for (let s4 = 0x0; s4 < s2[Bz(0xf30)]; s4++) {
                const s5 = s2[s4],
                  s6 = s3[s4],
                  s7 = n9(s5),
                  s8 = n9(s6);
                if (s7) na(s7, s6);
                else s8 && na(s8, s5);
              }
              im(new Uint8Array([cH[Bz(0x861)]]));
            }
            break;
          default:
            if (
              !mL &&
              hX &&
              (s0[Bz(0xef5)](Bz(0xf1a)) || s0[Bz(0xef5)](Bz(0x4f8)))
            )
              sg: {
                let s9 = parseInt(
                  s0[Bz(0x607)](s0[Bz(0xef5)](Bz(0xf1a)) ? 0x5 : 0x6)
                );
                if (no[Bz(0xbe8)]) {
                  pq ? kv(s9) : ky(s9);
                  break sg;
                }
                s9 === 0x0 && (s9 = 0xa);
                iO > 0xa && pq && (s9 += 0xa);
                s9--;
                if (s9 >= 0x0) {
                  const sa = nA[Bz(0x6a7)](Bz(0xefe))[s9],
                    sb = nB[Bz(0x6a7)](Bz(0xefe))[s9];
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
        s0 === Bz(0x286) &&
          (kl[Bz(0x5f5)][Bz(0x4f9)] === "" &&
          pj[Bz(0x5f5)][Bz(0x4f9)] === Bz(0xdf2)
            ? kE[Bz(0xe13)]()
            : pj[Bz(0xb2e)]()),
          delete no[s0];
      if (iz) {
        if (pc[Bz(0x743)]) {
          let se = 0x0,
            sf = 0x0;
          if (no[Bz(0x822)] || no[Bz(0xe79)]) sf = -0x1;
          else (no[Bz(0x86f)] || no[Bz(0x29e)]) && (sf = 0x1);
          if (no[Bz(0x9b7)] || no[Bz(0xb06)]) se = -0x1;
          else (no[Bz(0x5c5)] || no[Bz(0x309)]) && (se = 0x1);
          if (se !== 0x0 || sf !== 0x0)
            (pn = Math[Bz(0x209)](sf, se)), io(pn, 0x1);
          else (po !== 0x0 || pp !== 0x0) && io(pn, 0x0);
          (po = se), (pp = sf);
        }
        ps();
      }
    }
    function ps() {
      const BA = ux,
        s0 = no[BA(0x8e5)] || no[BA(0xf1b)] || no[BA(0x3fa)],
        s1 = no[BA(0xb1a)] || no[BA(0x9ab)],
        s2 = (s0 << 0x1) | s1;
      nb !== s2 && ((nb = s2), im(new Uint8Array([cH[BA(0x659)], s2])));
    }
    var pt = document[ux(0x9e3)](ux(0xc35)),
      pu = 0x0,
      pv = 0x0,
      pw = 0x0;
    function px(s0, s1, s2) {
      const BB = ux;
      return s0 + (s1 - s0) * Math[BB(0xeeb)](0x1, pR / s2);
    }
    var py = 0x1,
      pz = [];
    for (let s0 in cR) {
      if (
        [ux(0xa16), ux(0x694), ux(0x372), ux(0x4ec), ux(0x93e), ux(0x2db)][
          ux(0x7b5)
        ](s0)
      )
        continue;
      pz[ux(0xf33)](cR[s0]);
    }
    var pA = [];
    for (let s1 = 0x0; s1 < 0x1e; s1++) {
      pB();
    }
    function pB(s2 = !![]) {
      const BC = ux,
        s3 = new lH(
          -0x1,
          pz[Math[BC(0xe3c)](Math[BC(0x4a5)]() * pz[BC(0xf30)])],
          0x0,
          Math[BC(0x4a5)]() * d0,
          Math[BC(0x4a5)]() * 6.28
        );
      if (!s3[BC(0x7d1)] && Math[BC(0x4a5)]() < 0.01) s3[BC(0xe2b)] = !![];
      s3[BC(0x7d1)]
        ? (s3[BC(0x829)] = s3[BC(0x445)] = Math[BC(0x4a5)]() * 0x8 + 0xc)
        : (s3[BC(0x829)] = s3[BC(0x445)] = Math[BC(0x4a5)]() * 0x1e + 0x19),
        s2
          ? (s3["x"] = Math[BC(0x4a5)]() * cZ)
          : (s3["x"] = -s3[BC(0x445)] * 0x2),
        (s3[BC(0xbf9)] =
          (Math[BC(0x4a5)]() * 0x3 + 0x4) * s3[BC(0x829)] * 0.02),
        (s3[BC(0x6e3)] = (Math[BC(0x4a5)]() * 0x2 - 0x1) * 0.05),
        pA[BC(0xf33)](s3);
    }
    var pC = 0x0,
      pD = 0x0,
      pE = 0x0,
      pF = 0x0;
    setInterval(function () {
      const BD = ux,
        s2 = [kj, qv, ...Object[BD(0x669)](pG), ...nO],
        s3 = s2[BD(0xf30)];
      let s4 = 0x0;
      for (let s5 = 0x0; s5 < s3; s5++) {
        const s6 = s2[s5];
        s4 += s6[BD(0xf3d)] * s6[BD(0xac0)];
      }
      kL[BD(0x467)](
        BD(0x976),
        Math[BD(0xcec)](0x3e8 / pR) +
          BD(0xe1c) +
          ix[BD(0xf30)] +
          BD(0xb30) +
          s3 +
          BD(0xcf3) +
          iK(s4) +
          BD(0x55e) +
          (pF / 0x3e8)[BD(0x278)](0x2) +
          BD(0x7d4)
      ),
        (pF = 0x0);
    }, 0x3e8);
    var pG = {};
    function pH(s2, s3, s4, s5, s6, s7 = ![]) {
      const BE = ux;
      if (!pG[s3]) {
        const sa = hw
          ? new OffscreenCanvas(0x1, 0x1)
          : document[BE(0x636)](BE(0xb09));
        (sa[BE(0x786)] = sa[BE(0x76b)]("2d")),
          (sa[BE(0xd98)] = 0x0),
          (sa[BE(0xd74)] = s4),
          (sa[BE(0xb3b)] = s5),
          (pG[s3] = sa);
      }
      const s8 = pG[s3],
        s9 = s8[BE(0x786)];
      if (pQ - s8[BE(0xd98)] > 0x1f4) {
        s8[BE(0xd98)] = pQ;
        const sb = s2[BE(0x80f)](),
          sc = Math[BE(0x4a4)](sb["a"], sb["b"]) * 1.5,
          sd = kX * sc,
          se = Math[BE(0x443)](s8[BE(0xd74)] * sd) || 0x1;
        se !== s8["w"] &&
          ((s8["w"] = se),
          (s8[BE(0xf3d)] = se),
          (s8[BE(0xac0)] = Math[BE(0x443)](s8[BE(0xb3b)] * sd) || 0x1),
          s9[BE(0x70a)](),
          s9[BE(0xd3a)](sd, sd),
          s6(s9),
          s9[BE(0xdea)]());
      }
      s8[BE(0x2ed)] = !![];
      if (s7) return s8;
      s2[BE(0x377)](
        s8,
        -s8[BE(0xd74)] / 0x2,
        -s8[BE(0xb3b)] / 0x2,
        s8[BE(0xd74)],
        s8[BE(0xb3b)]
      );
    }
    var pI = /^((?!chrome|android).)*safari/i[ux(0x6b1)](navigator[ux(0xad2)]),
      pJ = pI ? 0.25 : 0x0;
    function pK(s2, s3, s4 = 0x14, s5 = ux(0xaf3), s6 = 0x4, s7, s8 = "") {
      const BF = ux,
        s9 = BF(0xacf) + s4 + BF(0x526) + iB;
      let sa, sb;
      const sc = s3 + "_" + s9 + "_" + s5 + "_" + s6 + "_" + s8,
        sd = pG[sc];
      if (!sd) {
        s2[BF(0x585)] = s9;
        const se = s2[BF(0x637)](s3);
        (sa = se[BF(0xf3d)] + s6), (sb = s4 + s6);
      } else (sa = sd[BF(0xd74)]), (sb = sd[BF(0xb3b)]);
      return pH(
        s2,
        sc,
        sa,
        sb,
        function (sf) {
          const BG = BF;
          sf[BG(0x94b)](s6 / 0x2, s6 / 0x2 - sb * pJ),
            (sf[BG(0x585)] = s9),
            (sf[BG(0x5e9)] = BG(0x420)),
            (sf[BG(0x7a9)] = BG(0xb00)),
            (sf[BG(0x9b8)] = s6),
            (sf[BG(0x744)] = BG(0x3d0)),
            (sf[BG(0x756)] = s5),
            s6 > 0x0 && sf[BG(0x480)](s3, 0x0, 0x0),
            sf[BG(0x61e)](s3, 0x0, 0x0);
        },
        s7
      );
    }
    var pL = 0x1;
    function pM(s2 = cH[ux(0x774)]) {
      const BH = ux,
        s3 = Object[BH(0x669)](oG),
        s4 = new DataView(
          new ArrayBuffer(0x1 + 0x2 + s3[BH(0xf30)] * (0x2 + 0x4))
        );
      let s5 = 0x0;
      s4[BH(0x755)](s5++, s2), s4[BH(0x72a)](s5, s3[BH(0xf30)]), (s5 += 0x2);
      for (let s6 = 0x0; s6 < s3[BH(0xf30)]; s6++) {
        const s7 = s3[s6];
        s4[BH(0x72a)](s5, s7[BH(0x559)]["id"]),
          (s5 += 0x2),
          s4[BH(0x365)](s5, s7[BH(0xe2a)]),
          (s5 += 0x4);
      }
      im(s4);
    }
    function pN() {
      const BI = ux;
      om[BI(0xcd1)](), oi[BI(0x52a)][BI(0xcd1)](BI(0x769)), (om = null);
    }
    var pO = [];
    function pP() {
      const BJ = ux;
      for (let s2 = 0x0; s2 < pO[BJ(0xf30)]; s2++) {
        const s3 = pO[s2],
          s4 = s3[BJ(0xbd3)],
          s5 = s4 && !s4[BJ(0x2a0)];
        s5
          ? ((s3[BJ(0x2a0)] = ![]),
            (s3[BJ(0x595)] = s4[BJ(0x595)]),
            (s3[BJ(0xc42)] = s4[BJ(0xc42)]),
            (s3[BJ(0x999)] = s4[BJ(0x999)]),
            (s3[BJ(0xd45)] = s4[BJ(0xd45)]),
            (s3[BJ(0x823)] = s4[BJ(0x823)]),
            (s3[BJ(0x2fa)] = s4[BJ(0x2fa)]),
            (s3[BJ(0x914)] = s4[BJ(0x914)]),
            (s3[BJ(0x80e)] = s4[BJ(0x80e)]),
            (s3[BJ(0xe47)] = s4[BJ(0xe47)]),
            (s3[BJ(0x253)] = s4[BJ(0x253)]),
            (s3[BJ(0x4c6)] = s4[BJ(0x4c6)]),
            (s3[BJ(0x1d8)] = s4[BJ(0x1d8)]),
            (s3[BJ(0xd3f)] = s4[BJ(0xd3f)]),
            (s3[BJ(0x88c)] = s4[BJ(0x88c)]),
            (s3[BJ(0xeef)] = s4[BJ(0xeef)]),
            j1(s3, s4))
          : ((s3[BJ(0x2a0)] = !![]),
            (s3[BJ(0xda0)] = 0x0),
            (s3[BJ(0xc42)] = 0x1),
            (s3[BJ(0x595)] = 0x0),
            (s3[BJ(0x999)] = ![]),
            (s3[BJ(0xd45)] = 0x0),
            (s3[BJ(0x823)] = 0x0),
            (s3[BJ(0x914)] = px(s3[BJ(0x914)], 0x0, 0xc8)),
            (s3[BJ(0x2fa)] = px(s3[BJ(0x2fa)], 0x0, 0xc8)),
            (s3[BJ(0xeef)] = px(s3[BJ(0xeef)], 0x0, 0xc8)));
        if (s2 > 0x0) {
          if (s4) {
            const s6 = Math[BJ(0x209)](s4["y"] - pv, s4["x"] - pu);
            s3[BJ(0x218)] === void 0x0
              ? (s3[BJ(0x218)] = s6)
              : (s3[BJ(0x218)] = f7(s3[BJ(0x218)], s6, 0.1));
          }
          s3[BJ(0xa38)] += ((s5 ? -0x1 : 0x1) * pR) / 0x320;
          if (s3[BJ(0xa38)] < 0x0) s3[BJ(0xa38)] = 0x0;
          s3[BJ(0xa38)] > 0x1 && pO[BJ(0x650)](s2, 0x1);
        }
      }
    }
    var pQ = Date[ux(0x296)](),
      pR = 0x0,
      pS = 0x0,
      pT = pQ;
    function pU() {
      const BK = ux;
      (pQ = Date[BK(0x296)]()),
        (pR = pQ - pT),
        (pT = pQ),
        (pS = pR / 0x21),
        hc();
      let s2 = 0x0;
      for (let s4 = 0x0; s4 < jY[BK(0xf30)]; s4++) {
        const s5 = jY[s4];
        if (!s5[BK(0x39e)]) jY[BK(0x650)](s4, 0x1), s4--;
        else {
          if (
            (s5[BK(0x508)] &&
              !s5[BK(0x508)][BK(0x52a)][BK(0xa05)](BK(0x4ac))) ||
            s5[BK(0x483)][BK(0x5f5)][BK(0x4f9)] === BK(0xdf2)
          )
            continue;
          else {
            jY[BK(0x650)](s4, 0x1),
              s4--,
              s5[BK(0x52a)][BK(0xcd1)](BK(0x7e6)),
              s2++;
            if (s2 >= 0x14) break;
          }
        }
      }
      (pV[BK(0xbd3)] = iz), pP();
      kD[BK(0x52a)][BK(0xa05)](BK(0x4ac)) && (lM = pQ);
      if (hu) {
        const s6 = pQ / 0x50,
          s7 = Math[BK(0x4ce)](s6) * 0x7,
          s8 = Math[BK(0x54a)](Math[BK(0x4ce)](s6 / 0x4)) * 0.15 + 0.85;
        ht[BK(0x5f5)][BK(0x2a7)] = BK(0xb6c) + s7 + BK(0x4a6) + s8 + ")";
      } else ht[BK(0x5f5)][BK(0x2a7)] = BK(0xdf2);
      for (let s9 = jd[BK(0xf30)] - 0x1; s9 >= 0x0; s9--) {
        const sa = jd[s9];
        if (sa[BK(0x894)]) {
          jd[BK(0x650)](s9, 0x1);
          continue;
        }
        sa[BK(0x368)]();
      }
      for (let sb = nO[BK(0xf30)] - 0x1; sb >= 0x0; sb--) {
        const sc = nO[sb];
        if (!sc[BK(0x39e)]) {
          nO[BK(0x650)](sb, 0x1);
          continue;
        }
        sc[BK(0xb75)]();
      }
      for (let sd = jc[BK(0xf30)] - 0x1; sd >= 0x0; sd--) {
        const se = jc[sd];
        se[BK(0x894)] &&
          se["t"] <= 0x0 &&
          (se[BK(0xcd1)](), jc[BK(0x650)](sd, 0x1)),
          (se["t"] += ((se[BK(0x894)] ? -0x1 : 0x1) * pR) / se[BK(0x92d)]),
          (se["t"] = Math[BK(0xeeb)](0x1, Math[BK(0xe6f)](0x0, se["t"]))),
          se[BK(0xb75)]();
      }
      for (let sf = n3[BK(0xf30)] - 0x1; sf >= 0x0; sf--) {
        const sg = n3[sf];
        if (!sg["el"][BK(0x39e)]) sg[BK(0xce0)] = ![];
        (sg[BK(0x2ef)] += ((sg[BK(0xce0)] ? 0x1 : -0x1) * pR) / 0xc8),
          (sg[BK(0x2ef)] = Math[BK(0xeeb)](
            0x1,
            Math[BK(0xe6f)](sg[BK(0x2ef)])
          ));
        if (!sg[BK(0xce0)] && sg[BK(0x2ef)] <= 0x0) {
          n3[BK(0x650)](sf, 0x1), sg[BK(0xcd1)]();
          continue;
        }
        sg[BK(0x5f5)][BK(0x440)] = sg[BK(0x2ef)];
      }
      if (p2) {
        p3 += pR / 0x7d0;
        if (p3 > 0x1) {
          p3 = 0x0;
          if (p4) {
            p2 = ![];
            const sh = p0[BK(0x260)],
              si = p4[BK(0x79d)];
            if (p4[BK(0x22e)] > 0x0)
              ol[BK(0x45f)]((sj) => sj[BK(0x85b)]()),
                n6(p0["id"], si),
                (p1 = 0x0),
                p7("?"),
                oi[BK(0x52a)][BK(0x536)](BK(0x769)),
                (om = og(sh)),
                oi[BK(0x8c5)](om),
                p6(om[BK(0x5a7)], p4[BK(0x22e)]),
                (om[BK(0xc0d)] = function () {
                  const BL = BK;
                  n6(sh["id"], p4[BL(0x22e)]), pN(), (p4 = null);
                });
            else {
              p1 = si;
              const sj = [...ol][BK(0x9ff)](() => Math[BK(0x4a5)]() - 0.5);
              for (let sk = 0x0, sl = sj[BK(0xf30)]; sk < sl; sk++) {
                const sm = sj[sk];
                sk >= si ? sm[BK(0x85b)]() : sm[BK(0xe6c)](0x1 - sm[BK(0xe2a)]);
              }
              p4 = null;
            }
            p5();
          }
        }
      }
      for (let sn = 0x0; sn < ol[BK(0xf30)]; sn++) {
        ol[sn][BK(0xab2)](p3);
      }
      for (let so in nk) {
        const sp = nk[so];
        if (!sp) {
          delete nk[so];
          continue;
        }
        for (let sq = sp[BK(0xf30)] - 0x1; sq >= 0x0; sq--) {
          const sr = sp[sq];
          sr["t"] += pR;
          if (sr[BK(0x77e)]) sr["t"] > lY && sp[BK(0x650)](sq, 0x1);
          else {
            if (sr["t"] > lV) {
              const ss = 0x1 - Math[BK(0xeeb)](0x1, (sr["t"] - lV) / 0x7d0);
              (sr[BK(0x5f5)][BK(0x440)] = ss),
                ss <= 0x0 && sp[BK(0x650)](sq, 0x1);
            }
          }
        }
        sp[BK(0xf30)] === 0x0 && delete nk[so];
      }
      if (o6)
        sM: {
          if (il()) {
            (o7 += pR),
              (nZ[BK(0x5f5)][BK(0x2a7)] =
                BK(0x6d6) +
                (Math[BK(0x4ce)](Date[BK(0x296)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (o7 > 0x3e8) {
              if (o8) {
                pM(cH[BK(0x39f)]), m2(![]);
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
                  const sx = nB[BK(0xd83)][sw];
                  sx[BK(0x6d0)] += su;
                }
                const sv = nB[BK(0xc44)][BK(0x6d0)] + 0x1;
                for (let sy = 0x0; sy < su; sy++) {
                  const sz = nR(BK(0x32c));
                  (sz[BK(0x6d0)] = iO + sy), nA[BK(0x8c5)](sz);
                  const sA = nR(BK(0x32c));
                  (sA[BK(0x6d0)] = sv + sy),
                    sA[BK(0x8c5)](
                      nR(BK(0x46a) + ((sz[BK(0x6d0)] + 0x1) % 0xa) + BK(0xaba))
                    ),
                    nB[BK(0x8c5)](sA);
                }
                (iO = st), (iP = iO * 0x2);
              }
            }
          } else (o6 = ![]), (o8 = ![]), (o7 = 0x0);
        }
      (oP = px(oP, oN, 0x64)),
        (oO = px(oO, oM, 0x64)),
        (o2[BK(0x5f5)][BK(0xf3d)] = oP * 0x64 + "%"),
        (o3[BK(0x5f5)][BK(0xf3d)] = oO * 0x64 + "%");
      for (let sB in pG) {
        !pG[sB][BK(0x2ed)] ? delete pG[sB] : (pG[sB][BK(0x2ed)] = ![]);
      }
      (nc = px(nc, ne, 0x32)), (nd = px(nd, nf, 0x32));
      const s3 = Math[BK(0xeeb)](0x64, pR) / 0x3c;
      pX -= 0x3 * s3;
      for (let sC = pA[BK(0xf30)] - 0x1; sC >= 0x0; sC--) {
        const sD = pA[sC];
        (sD["x"] += sD[BK(0xbf9)] * s3),
          (sD["y"] += Math[BK(0x4ce)](sD[BK(0x88c)] * 0x2) * 0.8 * s3),
          (sD[BK(0x88c)] += sD[BK(0x6e3)] * s3),
          (sD[BK(0xd3f)] += 0.002 * pR),
          (sD[BK(0x586)] = !![]);
        const sE = sD[BK(0x445)] * 0x2;
        (sD["x"] >= cZ + sE || sD["y"] < -sE || sD["y"] >= d0 + sE) &&
          (pA[BK(0x650)](sC, 0x1), pB(![]));
      }
      for (let sF = 0x0; sF < iH[BK(0xf30)]; sF++) {
        iH[sF][BK(0xb75)]();
      }
      pw = Math[BK(0xe6f)](0x0, pw - pR / 0x12c);
      if (pc[BK(0x3c9)] && pw > 0x0) {
        const sG = Math[BK(0x4a5)]() * 0x2 * Math["PI"],
          sH = pw * 0x3;
        (qL = Math[BK(0x5a6)](sG) * sH), (qM = Math[BK(0x4ce)](sG) * sH);
      } else (qL = 0x0), (qM = 0x0);
      (py = px(py, pL, 0xc8)), (nh = px(nh, ng, 0x64));
      for (let sI = mK[BK(0xf30)] - 0x1; sI >= 0x0; sI--) {
        const sJ = mK[sI];
        sJ[BK(0xb75)](), sJ[BK(0xeb0)] && mK[BK(0x650)](sI, 0x1);
      }
      for (let sK = ix[BK(0xf30)] - 0x1; sK >= 0x0; sK--) {
        const sL = ix[sK];
        sL[BK(0xb75)](),
          sL[BK(0x2a0)] && sL[BK(0xda0)] > 0x1 && ix[BK(0x650)](sK, 0x1);
      }
      iz && ((pu = iz["x"]), (pv = iz["y"])), qJ(), window[BK(0x220)](pU);
    }
    var pV = pW();
    function pW() {
      const BM = ux,
        s2 = new lU(-0x1, 0x0, 0x0, 0x0, 0x1, cX[BM(0xd25)], 0x19);
      return (s2[BM(0xa38)] = 0x1), s2;
    }
    var pX = 0x0,
      pY = [ux(0x665), ux(0x532), ux(0x773)],
      pZ = [];
    for (let s2 = 0x0; s2 < 0x3; s2++) {
      for (let s3 = 0x0; s3 < 0x3; s3++) {
        const s4 = q0(pY[s2], 0x1 - 0.05 * s3);
        pZ[ux(0xf33)](s4);
      }
    }
    function q0(s5, s6) {
      const BN = ux;
      return q1(hz(s5)[BN(0x696)]((s7) => s7 * s6));
    }
    function q1(s5) {
      const BO = ux;
      return s5[BO(0x81e)](
        (s6, s7) => s6 + parseInt(s7)[BO(0xd80)](0x10)[BO(0xee3)](0x2, "0"),
        "#"
      );
    }
    function q2(s5) {
      const BP = ux;
      return BP(0x862) + s5[BP(0x2a3)](",") + ")";
    }
    var q3 = document[ux(0x9e3)](ux(0x7aa));
    function q4() {
      const BQ = ux,
        s5 = document[BQ(0x636)](BQ(0xb09));
      s5[BQ(0xf3d)] = s5[BQ(0xac0)] = 0x3;
      const s6 = s5[BQ(0x76b)]("2d");
      for (let s7 = 0x0; s7 < pZ[BQ(0xf30)]; s7++) {
        const s8 = s7 % 0x3,
          s9 = (s7 - s8) / 0x3;
        (s6[BQ(0x756)] = pZ[s7]), s6[BQ(0x8bf)](s8, s9, 0x1, 0x1);
        const sa = j8[s7],
          sb = j9[s7],
          sc = nR(
            BQ(0xcb7) +
              sb +
              BQ(0xae6) +
              ((s9 + 0.5) / 0x3) * 0x64 +
              BQ(0x9bf) +
              ((s8 + 0.5) / 0x3) * 0x64 +
              BQ(0xa61) +
              sa +
              BQ(0x7fd)
          );
        q3[BQ(0xd73)](sc, q3[BQ(0xd83)][0x0]);
      }
      q3[BQ(0x5f5)][BQ(0x22d)] = BQ(0x3b8) + s5[BQ(0x981)]() + ")";
    }
    q4();
    var q5 = document[ux(0x9e3)](ux(0x26f)),
      q6 = document[ux(0x9e3)](ux(0xaae));
    function q7(s5, s6, s7) {
      const BR = ux;
      (s5[BR(0x5f5)][BR(0xb00)] = (s6 / j3) * 0x64 + "%"),
        (s5[BR(0x5f5)][BR(0x420)] = (s7 / j3) * 0x64 + "%");
    }
    function q8() {
      const BS = ux,
        s5 = qO(),
        s6 = cZ / 0x2 / s5,
        s7 = d0 / 0x2 / s5,
        s8 = j5,
        s9 = Math[BS(0xe6f)](0x0, Math[BS(0xe3c)]((pu - s6) / s8) - 0x1),
        sa = Math[BS(0xe6f)](0x0, Math[BS(0xe3c)]((pv - s7) / s8) - 0x1),
        sb = Math[BS(0xeeb)](j6 - 0x1, Math[BS(0x443)]((pu + s6) / s8)),
        sc = Math[BS(0xeeb)](j6 - 0x1, Math[BS(0x443)]((pv + s7) / s8));
      kk[BS(0x70a)](), kk[BS(0xd3a)](s8, s8), kk[BS(0x936)]();
      for (let sd = s9; sd <= sb + 0x1; sd++) {
        kk[BS(0xba7)](sd, sa), kk[BS(0xce8)](sd, sc + 0x1);
      }
      for (let se = sa; se <= sc + 0x1; se++) {
        kk[BS(0xba7)](s9, se), kk[BS(0xce8)](sb + 0x1, se);
      }
      kk[BS(0xdea)]();
      for (let sf = s9; sf <= sb; sf++) {
        for (let sg = sa; sg <= sc; sg++) {
          kk[BS(0x70a)](),
            kk[BS(0x94b)]((sf + 0.5) * s8, (sg + 0.5) * s8),
            pK(kk, sf + "," + sg, 0x28, BS(0xaf3), 0x6),
            kk[BS(0xdea)]();
        }
      }
      (kk[BS(0x744)] = BS(0x5b4)),
        (kk[BS(0x9b8)] = 0xa),
        (kk[BS(0x339)] = BS(0xcec)),
        kk[BS(0x976)]();
    }
    function q9(s5, s6) {
      const BT = ux,
        s7 = nR(BT(0x352) + s5 + BT(0x54b) + s6 + BT(0x9a2)),
        s8 = s7[BT(0x9e3)](BT(0xad9));
      return (
        kn[BT(0x8c5)](s7),
        (s7[BT(0x5b5)] = function (s9) {
          const BU = BT;
          s9 > 0x0 && s9 !== 0x1
            ? (s8[BU(0x467)](BU(0x5f5), BU(0xe26) + s9 * 0x168 + BU(0xb6b)),
              s7[BU(0x52a)][BU(0x536)](BU(0x4ac)))
            : s7[BU(0x52a)][BU(0xcd1)](BU(0x4ac));
        }),
        kn[BT(0xd73)](s7, q3),
        s7
      );
    }
    var qa = q9(ux(0xced), ux(0xbde));
    qa[ux(0x52a)][ux(0x536)](ux(0x420));
    var qb = nR(ux(0xae9) + hO[ux(0xf3e)] + ux(0x73e));
    qa[ux(0xd83)][0x0][ux(0x8c5)](qb);
    var qc = q9(ux(0x8b9), ux(0xc6f)),
      qd = q9(ux(0x9dc), ux(0x85c));
    qd[ux(0x52a)][ux(0x536)](ux(0x9b4));
    var qe = ux(0x63b),
      qf = 0x2bc,
      qg = new lU("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cX[ux(0xd25)], 0x19);
    qg[ux(0x595)] = 0x0;
    var qh = [
      [ux(0x3c3), ux(0x262)],
      [ux(0x4b2), ux(0x4a1)],
      [ux(0x69f), ux(0x898)],
      [ux(0x2b0), ux(0xb97), ux(0x43f)],
      [ux(0xe45), ux(0x7ff)],
      [ux(0x83e), ux(0x721)],
      [ux(0x3c7), ux(0xdc8)],
    ];
    function qi() {
      const BV = ux;
      let s5 = "";
      const s6 = qh[BV(0xf30)] - 0x1;
      for (let s7 = 0x0; s7 < s6; s7++) {
        const s8 = qh[s7][0x0];
        (s5 += s8),
          s7 === s6 - 0x1
            ? (s5 += BV(0xc34) + qh[s7 + 0x1][0x0] + ".")
            : (s5 += ",\x20");
      }
      return s5;
    }
    var qj = qi(),
      qk = document[ux(0x9e3)](ux(0x379));
    (qk[ux(0x559)] = function () {
      const BW = ux;
      return nR(
        BW(0x21e) +
          hO[BW(0xefb)] +
          BW(0xb9c) +
          hO[BW(0x424)] +
          BW(0xc5c) +
          hO[BW(0xd06)] +
          BW(0xc37) +
          qj +
          BW(0xa1b)
      );
    }),
      (qk[ux(0xe49)] = !![]);
    var ql =
      Date[ux(0x296)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[ux(0xe3c)](Math[ux(0x4a5)]() * qh[ux(0xf30)]);
    function qm() {
      const BX = ux,
        s5 = qh[ql];
      (qg[BX(0x80e)] = s5[0x0]), (qg[BX(0xc32)] = s5[0x1]);
      for (let s6 of j0) {
        qg[s6] = Math[BX(0x4a5)]() > 0.5;
      }
      ql = (ql + 0x1) % qh[BX(0xf30)];
    }
    qm(),
      (qk[ux(0xc0d)] = function () {
        const BY = ux;
        window[BY(0x3a2)](qg[BY(0xc32)], BY(0x335)), qm();
      });
    var qn = new lU(ux(0x2e4), 0x0, -0x19, 0x0, 0x1, cX[ux(0xd25)], 0x19);
    (qn[ux(0x595)] = 0x0), (qn[ux(0x653)] = !![]);
    var qo = [
        ux(0xe8a),
        ux(0x73c),
        ux(0x7c3),
        ux(0xa62),
        ux(0xd69),
        ux(0x731),
        ux(0x7de),
      ],
      qp = [
        ux(0x4fb),
        ux(0xaf6),
        ux(0x36f),
        ux(0xb01),
        ux(0x6bf),
        ux(0xa24),
        ux(0xe98),
        ux(0xca9),
      ],
      qq = 0x0;
    function qr() {
      const BZ = ux,
        s5 = {};
      (s5[BZ(0x37e)] = qo[qq % qo[BZ(0xf30)]]),
        (s5[BZ(0x77e)] = !![]),
        (s5[BZ(0x31e)] = nj["me"]),
        nn(BZ(0x2e4), s5),
        nn("yt", {
          text: qp[qq % qp[BZ(0xf30)]][BZ(0x51a)](
            BZ(0x3b4),
            kF[BZ(0x459)][BZ(0x77b)]() || BZ(0x2bf)
          ),
          isFakeChat: !![],
          col: nj["me"],
        }),
        qq++;
    }
    qr(), setInterval(qr, 0xfa0);
    var qs = 0x0,
      qt = Math[ux(0x443)](
        (Math[ux(0xe6f)](screen[ux(0xf3d)], screen[ux(0xac0)], kV(), kW()) *
          window[ux(0x4d2)]) /
          0xc
      ),
      qu = new lU(-0x1, 0x0, 0x0, 0x0, 0x1, cX[ux(0xcc1)], 0x19);
    (qu[ux(0x2a0)] = !![]), (qu[ux(0xc42)] = 0x1), (qu[ux(0xd3a)] = 0.6);
    var qv = (function () {
        const C0 = ux,
          s5 = document[C0(0x636)](C0(0xb09)),
          s6 = qt * 0x2;
        (s5[C0(0xf3d)] = s5[C0(0xac0)] = s6),
          (s5[C0(0x5f5)][C0(0xf3d)] = s5[C0(0x5f5)][C0(0xac0)] = C0(0x5b9));
        const s7 = document[C0(0x9e3)](C0(0x76f));
        s7[C0(0x8c5)](s5);
        const s8 = s5[C0(0x76b)]("2d");
        return (
          (s5[C0(0xaee)] = function () {
            const C1 = C0;
            (qu[C1(0xe2b)] = ![]),
              s8[C1(0xe22)](0x0, 0x0, s6, s6),
              s8[C1(0x70a)](),
              s8[C1(0x70b)](s6 / 0x64),
              s8[C1(0x94b)](0x32, 0x32),
              s8[C1(0x70b)](0.8),
              s8[C1(0x317)](-Math["PI"] / 0x8),
              qu[C1(0x989)](s8),
              s8[C1(0xdea)]();
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
      qy = s5[C2(0x981)](C2(0x8a2));
      const s6 = qw * 0x64 + "%\x20" + qx * 0x64 + C2(0x7bf),
        s7 = nR(
          C2(0x606) +
            hP[C2(0x696)](
              (s8, s9) => C2(0x803) + s9 + C2(0x279) + s8 + C2(0x28e)
            )[C2(0x2a3)]("\x0a") +
            C2(0xe88) +
            nE[C2(0x71d)] +
            C2(0x7a0) +
            nE[C2(0x724)] +
            C2(0x714) +
            nE[C2(0xc07)] +
            C2(0x78d) +
            dG +
            C2(0x276) +
            qy +
            C2(0xc54) +
            s6 +
            C2(0x640) +
            s6 +
            C2(0x97f) +
            s6 +
            C2(0x2ec) +
            s6 +
            C2(0xa8f)
        );
      document[C2(0x458)][C2(0x8c5)](s7);
    }
    function qB(s5) {
      const C3 = ux,
        s6 =
          -s5[C3(0xf3c)]["x"] * 0x64 +
          "%\x20" +
          -s5[C3(0xf3c)]["y"] * 0x64 +
          "%";
      return (
        C3(0x95c) +
        s6 +
        C3(0xa39) +
        s6 +
        C3(0xeb9) +
        s6 +
        C3(0x264) +
        s6 +
        ";\x22"
      );
    }
    if (document[ux(0x921)] && document[ux(0x921)][ux(0xd28)]) {
      const s5 = setTimeout(qA, 0x1f40);
      document[ux(0x921)][ux(0xd28)][ux(0x884)](() => {
        const C4 = ux;
        console[C4(0xebe)](C4(0x395)), clearTimeout(s5), qA();
      });
    } else qA();
    var qC = [];
    qD();
    function qD() {
      const C5 = ux,
        s6 = {};
      (qw = 0xf), (qC = []);
      let s7 = 0x0;
      for (let s9 = 0x0; s9 < dB[C5(0xf30)]; s9++) {
        const sa = dB[s9],
          sb = C5(0xcfc) + sa[C5(0x82f)] + "_" + (sa[C5(0xe2a)] || 0x1),
          sc = s6[sb];
        if (sc === void 0x0) (sa[C5(0xf3c)] = s6[sb] = s8()), qC[C5(0xf33)](sa);
        else {
          sa[C5(0xf3c)] = sc;
          continue;
        }
      }
      for (let sd = 0x0; sd < eJ[C5(0xf30)]; sd++) {
        const se = eJ[sd],
          sf = C5(0x201) + se[C5(0x82f)],
          sg = s6[sf];
        if (sg === void 0x0) se[C5(0xf3c)] = s6[sf] = s8();
        else {
          se[C5(0xf3c)] = sg;
          continue;
        }
      }
      function s8() {
        const C6 = C5;
        return { x: s7 % qw, y: Math[C6(0xe3c)](s7 / qw), index: s7++ };
      }
    }
    function qE(s6) {
      const C7 = ux,
        s7 = qC[C7(0xf30)] + eK;
      qx = Math[C7(0x443)](s7 / qw);
      const s8 = document[C7(0x636)](C7(0xb09));
      (s8[C7(0xf3d)] = s6 * qw), (s8[C7(0xac0)] = s6 * qx);
      const s9 = s8[C7(0x76b)]("2d"),
        sa = 0x5a,
        sb = sa / 0x2,
        sc = s6 / sa;
      s9[C7(0xd3a)](sc, sc), s9[C7(0x94b)](sb, sb);
      for (let sd = 0x0; sd < qC[C7(0xf30)]; sd++) {
        const se = qC[sd];
        s9[C7(0x70a)](),
          s9[C7(0x94b)](se[C7(0xf3c)]["x"] * sa, se[C7(0xf3c)]["y"] * sa),
          s9[C7(0x70a)](),
          s9[C7(0x94b)](0x0 + se[C7(0x592)], -0x5 + se[C7(0xbfa)]),
          se[C7(0xd19)](s9),
          s9[C7(0xdea)](),
          (s9[C7(0x756)] = C7(0xaf3)),
          (s9[C7(0x7a9)] = C7(0x9b4)),
          (s9[C7(0x5e9)] = C7(0x612)),
          (s9[C7(0x585)] = C7(0xed5) + iB),
          (s9[C7(0x9b8)] = h4 ? 0x5 : 0x3),
          (s9[C7(0x744)] = C7(0x7ad)),
          (s9[C7(0x339)] = s9[C7(0x5ce)] = C7(0xcec)),
          s9[C7(0x94b)](0x0, sb - 0x8 - s9[C7(0x9b8)]);
        let sf = se[C7(0x82f)];
        h4 && (sf = h6(sf));
        const sg = s9[C7(0x637)](sf)[C7(0xf3d)] + s9[C7(0x9b8)],
          sh = Math[C7(0xeeb)](0x4c / sg, 0x1);
        s9[C7(0xd3a)](sh, sh),
          s9[C7(0x480)](sf, 0x0, 0x0),
          s9[C7(0x61e)](sf, 0x0, 0x0),
          s9[C7(0xdea)]();
      }
      for (let si = 0x0; si < eK; si++) {
        const sj = eJ[si];
        s9[C7(0x70a)](),
          s9[C7(0x94b)](sj[C7(0xf3c)]["x"] * sa, sj[C7(0xf3c)]["y"] * sa),
          sj[C7(0x78e)] !== void 0x0 &&
            (s9[C7(0x936)](), s9[C7(0x97c)](-sb, -sb, sa, sa), s9[C7(0xc11)]()),
          s9[C7(0x94b)](sj[C7(0x592)], sj[C7(0xbfa)]),
          sj[C7(0xd19)](s9),
          s9[C7(0xdea)]();
      }
      return s8;
    }
    var qF = new lH(-0x1, cR[ux(0x321)], 0x0, 0x0, Math[ux(0x4a5)]() * 6.28);
    qF[ux(0x445)] = 0x32;
    function qG() {
      const C8 = ux;
      kk[C8(0xb0a)](j3 / 0x2, j3 / 0x2, j3 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qH(s6) {
      const C9 = ux,
        s7 = s6[C9(0xf30)],
        s8 = document[C9(0x636)](C9(0xb09));
      s8[C9(0xf3d)] = s8[C9(0xac0)] = s7;
      const s9 = s8[C9(0x76b)]("2d"),
        sa = s9[C9(0x305)](s7, s7);
      for (let sb = 0x0; sb < s7; sb++) {
        for (let sc = 0x0; sc < s7; sc++) {
          const sd = s6[sb][sc];
          if (!sd) continue;
          const se = (sb * s7 + sc) * 0x4;
          sa[C9(0x949)][se + 0x3] = 0xff;
        }
      }
      return s9[C9(0x388)](sa, 0x0, 0x0), s8;
    }
    function qI() {
      const Ca = ux;
      if (!jL) return;
      kk[Ca(0x70a)](),
        kk[Ca(0x936)](),
        qG(),
        kk[Ca(0xc11)](),
        !jL[Ca(0xb09)] && (jL[Ca(0xb09)] = qH(jL)),
        (kk[Ca(0xca8)] = ![]),
        (kk[Ca(0x442)] = 0.08),
        kk[Ca(0x377)](jL[Ca(0xb09)], 0x0, 0x0, j3, j3),
        kk[Ca(0xdea)]();
    }
    function qJ() {
      const Cb = ux;
      lN = 0x0;
      const s6 = kS * kX;
      qs = 0x0;
      for (let sb = 0x0; sb < nO[Cb(0xf30)]; sb++) {
        const sc = nO[sb];
        sc[Cb(0xbf2)] && sc[Cb(0xaee)]();
      }
      if (
        kl[Cb(0x5f5)][Cb(0x4f9)] === "" ||
        document[Cb(0x458)][Cb(0x52a)][Cb(0xa05)](Cb(0x552))
      ) {
        (kk[Cb(0x756)] = Cb(0x665)),
          kk[Cb(0x8bf)](0x0, 0x0, kj[Cb(0xf3d)], kj[Cb(0xac0)]),
          kk[Cb(0x70a)]();
        let sd = Math[Cb(0xe6f)](kj[Cb(0xf3d)] / cZ, kj[Cb(0xac0)] / d0);
        kk[Cb(0xd3a)](sd, sd),
          kk[Cb(0x97c)](0x0, 0x0, cZ, d0),
          kk[Cb(0x70a)](),
          kk[Cb(0x94b)](pX, -pX),
          kk[Cb(0xd3a)](1.25, 1.25),
          (kk[Cb(0x756)] = kZ),
          kk[Cb(0x64e)](),
          kk[Cb(0xdea)]();
        for (let se = 0x0; se < pA[Cb(0xf30)]; se++) {
          pA[se][Cb(0x989)](kk);
        }
        kk[Cb(0xdea)]();
        if (pc[Cb(0x7a2)] && pf[Cb(0x847)] > 0x0) {
          const sf = pf[Cb(0x766)]();
          kk[Cb(0x70a)]();
          let sg = kX;
          kk[Cb(0xd3a)](sg, sg),
            kk[Cb(0x94b)](
              sf["x"] + sf[Cb(0xf3d)] / 0x2,
              sf["y"] + sf[Cb(0xac0)]
            ),
            kk[Cb(0x70b)](kS * 0.8),
            qn[Cb(0x989)](kk),
            kk[Cb(0xd3a)](0.7, 0.7),
            qn[Cb(0x605)](kk),
            kk[Cb(0xdea)]();
        }
        if (qk[Cb(0x847)] > 0x0) {
          const sh = qk[Cb(0x766)]();
          kk[Cb(0x70a)]();
          let si = kX;
          kk[Cb(0xd3a)](si, si),
            kk[Cb(0x94b)](
              sh["x"] + sh[Cb(0xf3d)] / 0x2,
              sh["y"] + sh[Cb(0xac0)] * 0.6
            ),
            kk[Cb(0x70b)](kS * 0.8),
            qg[Cb(0x989)](kk),
            kk[Cb(0x70b)](0.7),
            kk[Cb(0x70a)](),
            kk[Cb(0x94b)](0x0, -qg[Cb(0x445)] - 0x23),
            pK(kk, qg[Cb(0x80e)], 0x12, Cb(0xaf3), 0x3),
            kk[Cb(0xdea)](),
            qg[Cb(0x605)](kk),
            kk[Cb(0xdea)]();
        }
        if (hl[Cb(0x847)] > 0x0) {
          const sj = hl[Cb(0x766)]();
          kk[Cb(0x70a)]();
          let sk = kX;
          kk[Cb(0xd3a)](sk, sk),
            kk[Cb(0x94b)](
              sj["x"] + sj[Cb(0xf3d)] / 0x2,
              sj["y"] + sj[Cb(0xac0)] * 0.5
            ),
            kk[Cb(0x70b)](kS),
            qF[Cb(0x989)](kk),
            kk[Cb(0xdea)]();
        }
        return;
      }
      if (jz)
        (kk[Cb(0x756)] = pZ[0x0]),
          kk[Cb(0x8bf)](0x0, 0x0, kj[Cb(0xf3d)], kj[Cb(0xac0)]);
      else {
        kk[Cb(0x70a)](), qN();
        for (let sl = -0x1; sl < 0x4; sl++) {
          for (let sm = -0x1; sm < 0x4; sm++) {
            const sn = Math[Cb(0xe6f)](0x0, Math[Cb(0xeeb)](sm, 0x2)),
              so = Math[Cb(0xe6f)](0x0, Math[Cb(0xeeb)](sl, 0x2));
            (kk[Cb(0x756)] = pZ[so * 0x3 + sn]),
              kk[Cb(0x8bf)](sm * j4, sl * j4, j4, j4);
          }
        }
        kk[Cb(0x936)](),
          kk[Cb(0x97c)](0x0, 0x0, j3, j3),
          kk[Cb(0xc11)](),
          kk[Cb(0x936)](),
          kk[Cb(0xba7)](-0xa, j4),
          kk[Cb(0xce8)](j4 * 0x2, j4),
          kk[Cb(0xba7)](j4 * 0x2, j4 * 0.5),
          kk[Cb(0xce8)](j4 * 0x2, j4 * 1.5),
          kk[Cb(0xba7)](j4 * 0x1, j4 * 0x2),
          kk[Cb(0xce8)](j3 + 0xa, j4 * 0x2),
          kk[Cb(0xba7)](j4, j4 * 1.5),
          kk[Cb(0xce8)](j4, j4 * 2.5),
          (kk[Cb(0x9b8)] = qf * 0x2),
          (kk[Cb(0x339)] = Cb(0xcec)),
          (kk[Cb(0x744)] = qe),
          kk[Cb(0x976)](),
          kk[Cb(0xdea)]();
      }
      kk[Cb(0x70a)](),
        kk[Cb(0x936)](),
        kk[Cb(0x97c)](0x0, 0x0, kj[Cb(0xf3d)], kj[Cb(0xac0)]),
        qN();
      pc[Cb(0xe07)] && ((kk[Cb(0x756)] = kZ), kk[Cb(0x64e)]());
      kk[Cb(0x936)]();
      jz ? qG() : kk[Cb(0x97c)](0x0, 0x0, j3, j3);
      kk[Cb(0xdea)](),
        kk[Cb(0x97c)](0x0, 0x0, kj[Cb(0xf3d)], kj[Cb(0xac0)]),
        (kk[Cb(0x756)] = qe),
        kk[Cb(0x64e)](Cb(0xb96)),
        kk[Cb(0x70a)](),
        qN();
      pc[Cb(0x1e4)] && q8();
      qI();
      const s7 = [];
      let s8 = [];
      for (let sp = 0x0; sp < ix[Cb(0xf30)]; sp++) {
        const sq = ix[sp];
        if (sq[Cb(0x64f)]) {
          if (iz) {
            if (
              pQ - sq[Cb(0xbce)] < 0x3e8 ||
              Math[Cb(0x4a4)](sq["nx"] - iz["x"], sq["ny"] - iz["y"]) <
                Math[Cb(0x4a4)](sq["ox"] - iz["x"], sq["oy"] - iz["y"])
            ) {
              s7[Cb(0xf33)](sq), (sq[Cb(0xbce)] = pQ);
              continue;
            }
          }
        }
        sq !== iz && s8[Cb(0xf33)](sq);
      }
      (s8 = qK(s8, (sr) => sr[Cb(0x307)] === cR[Cb(0x93e)])),
        (s8 = qK(s8, (sr) => sr[Cb(0x307)] === cR[Cb(0x4ec)])),
        (s8 = qK(s8, (sr) => sr[Cb(0x307)] === cR[Cb(0x2db)])),
        (s8 = qK(s8, (sr) => sr[Cb(0x306)])),
        (s8 = qK(s8, (sr) => sr[Cb(0x80d)])),
        (s8 = qK(s8, (sr) => sr[Cb(0x7d1)] && !sr[Cb(0xbc0)])),
        (s8 = qK(s8, (sr) => !sr[Cb(0xbc0)])),
        qK(s8, (sr) => !![]);
      iz && iz[Cb(0x989)](kk);
      for (let sr = 0x0; sr < s7[Cb(0xf30)]; sr++) {
        s7[sr][Cb(0x989)](kk);
      }
      if (pc[Cb(0x20e)]) {
        kk[Cb(0x936)]();
        for (let ss = 0x0; ss < ix[Cb(0xf30)]; ss++) {
          const st = ix[ss];
          if (st[Cb(0x2a0)]) continue;
          if (st[Cb(0xb16)]) {
            kk[Cb(0x70a)](),
              kk[Cb(0x94b)](st["x"], st["y"]),
              kk[Cb(0x317)](st[Cb(0x88c)]);
            if (!st[Cb(0x67e)])
              kk[Cb(0x97c)](-st[Cb(0x445)], -0xa, st[Cb(0x445)] * 0x2, 0x14);
            else {
              kk[Cb(0xba7)](-st[Cb(0x445)], -0xa),
                kk[Cb(0xce8)](-st[Cb(0x445)], 0xa);
              const su = 0xa + st[Cb(0x67e)] * st[Cb(0x445)] * 0x2;
              kk[Cb(0xce8)](st[Cb(0x445)], su),
                kk[Cb(0xce8)](st[Cb(0x445)], -su),
                kk[Cb(0xce8)](-st[Cb(0x445)], -0xa);
            }
            kk[Cb(0xdea)]();
          } else
            kk[Cb(0xba7)](st["x"] + st[Cb(0x445)], st["y"]),
              kk[Cb(0xb0a)](st["x"], st["y"], st[Cb(0x445)], 0x0, l1);
        }
        (kk[Cb(0x9b8)] = 0x2), (kk[Cb(0x744)] = Cb(0xc07)), kk[Cb(0x976)]();
      }
      const s9 = pc[Cb(0x8d6)] ? 0x1 / qP() : 0x1;
      for (let sv = 0x0; sv < ix[Cb(0xf30)]; sv++) {
        const sw = ix[sv];
        !sw[Cb(0x7d1)] && sw[Cb(0x586)] && lZ(sw, kk, s9);
      }
      for (let sx = 0x0; sx < ix[Cb(0xf30)]; sx++) {
        const sy = ix[sx];
        sy[Cb(0x988)] && sy[Cb(0x605)](kk, s9);
      }
      const sa = pR / 0x12;
      kk[Cb(0x70a)](),
        (kk[Cb(0x9b8)] = 0x7),
        (kk[Cb(0x744)] = Cb(0xaf3)),
        (kk[Cb(0x339)] = kk[Cb(0x5ce)] = Cb(0x93a));
      for (let sz = iG[Cb(0xf30)] - 0x1; sz >= 0x0; sz--) {
        const sA = iG[sz];
        sA["a"] -= pR / 0x1f4;
        if (sA["a"] <= 0x0) {
          iG[Cb(0x650)](sz, 0x1);
          continue;
        }
        (kk[Cb(0x442)] = sA["a"]), kk[Cb(0x976)](sA[Cb(0x9cf)]);
      }
      kk[Cb(0xdea)]();
      if (pc[Cb(0x4be)])
        for (let sB = iA[Cb(0xf30)] - 0x1; sB >= 0x0; sB--) {
          const sC = iA[sB];
          (sC["x"] += sC["vx"] * sa),
            (sC["y"] += sC["vy"] * sa),
            (sC["vy"] += 0.35 * sa);
          if (sC["vy"] > 0xa) {
            iA[Cb(0x650)](sB, 0x1);
            continue;
          }
          kk[Cb(0x70a)](),
            kk[Cb(0x94b)](sC["x"], sC["y"]),
            (kk[Cb(0x442)] = 0x1 - Math[Cb(0xe6f)](0x0, sC["vy"] / 0xa)),
            kk[Cb(0xd3a)](sC[Cb(0x445)], sC[Cb(0x445)]),
            sC[Cb(0x37e)] !== void 0x0
              ? pK(kk, sC[Cb(0x37e)], 0x15, Cb(0xd08), 0x2, ![], sC[Cb(0x445)])
              : (kk[Cb(0x317)](sC[Cb(0x88c)]),
                pH(kk, Cb(0x7e3) + sC[Cb(0x445)], 0x1e, 0x1e, function (sD) {
                  const Cc = Cb;
                  sD[Cc(0x94b)](0xf, 0xf), nC(sD);
                })),
            kk[Cb(0xdea)]();
        }
      kk[Cb(0xdea)]();
      if (iz && pc[Cb(0xbbe)] && !pc[Cb(0x743)]) {
        kk[Cb(0x70a)](),
          kk[Cb(0x94b)](kj[Cb(0xf3d)] / 0x2, kj[Cb(0xac0)] / 0x2),
          kk[Cb(0x317)](Math[Cb(0x209)](nd, nc)),
          kk[Cb(0xd3a)](s6, s6);
        const sD = 0x28;
        let sE = Math[Cb(0x4a4)](nc, nd) / kS;
        kk[Cb(0x936)](),
          kk[Cb(0xba7)](sD, 0x0),
          kk[Cb(0xce8)](sE, 0x0),
          kk[Cb(0xce8)](sE + -0x14, -0x14),
          kk[Cb(0xba7)](sE, 0x0),
          kk[Cb(0xce8)](sE + -0x14, 0x14),
          (kk[Cb(0x9b8)] = 0xc),
          (kk[Cb(0x339)] = Cb(0xcec)),
          (kk[Cb(0x5ce)] = Cb(0xcec)),
          (kk[Cb(0x442)] =
            sE < 0x64 ? Math[Cb(0xe6f)](sE - 0x32, 0x0) / 0x32 : 0x1),
          (kk[Cb(0x744)] = Cb(0x5b4)),
          kk[Cb(0x976)](),
          kk[Cb(0xdea)]();
      }
      kk[Cb(0x70a)](),
        kk[Cb(0xd3a)](s6, s6),
        kk[Cb(0x94b)](0x28, 0x1e + 0x32),
        kk[Cb(0x70b)](0.85);
      for (let sF = 0x0; sF < pO[Cb(0xf30)]; sF++) {
        const sG = pO[sF];
        if (sF > 0x0) {
          const sH = lJ(Math[Cb(0xe6f)](sG[Cb(0xa38)] - 0.5, 0x0) / 0.5);
          kk[Cb(0x94b)](0x0, (sF === 0x0 ? 0x46 : 0x41) * (0x1 - sH));
        }
        kk[Cb(0x70a)](),
          sF > 0x0 &&
            (kk[Cb(0x94b)](lJ(sG[Cb(0xa38)]) * -0x190, 0x0),
            kk[Cb(0x70b)](0.85)),
          kk[Cb(0x70a)](),
          m0(sG, kk, !![]),
          (sG["id"] = (sG[Cb(0xbd3)] && sG[Cb(0xbd3)]["id"]) || -0x1),
          sG[Cb(0x989)](kk),
          (sG["id"] = -0x1),
          kk[Cb(0xdea)](),
          sG[Cb(0x218)] !== void 0x0 &&
            (kk[Cb(0x70a)](),
            kk[Cb(0x317)](sG[Cb(0x218)]),
            kk[Cb(0x94b)](0x20, 0x0),
            kk[Cb(0x936)](),
            kk[Cb(0xba7)](0x0, 0x6),
            kk[Cb(0xce8)](0x0, -0x6),
            kk[Cb(0xce8)](0x6, 0x0),
            kk[Cb(0x7ce)](),
            (kk[Cb(0x9b8)] = 0x4),
            (kk[Cb(0x339)] = kk[Cb(0x5ce)] = Cb(0xcec)),
            (kk[Cb(0x744)] = Cb(0x8cd)),
            kk[Cb(0x976)](),
            (kk[Cb(0x756)] = Cb(0xaf3)),
            kk[Cb(0x64e)](),
            kk[Cb(0xdea)]()),
          kk[Cb(0xdea)]();
      }
      kk[Cb(0xdea)]();
    }
    function qK(s6, s7) {
      const Cd = ux,
        s8 = [];
      for (let s9 = 0x0; s9 < s6[Cd(0xf30)]; s9++) {
        const sa = s6[s9];
        if (s7[Cd(0xc49)] !== void 0x0 ? s7(sa) : sa[s7]) sa[Cd(0x989)](kk);
        else s8[Cd(0xf33)](sa);
      }
      return s8;
    }
    var qL = 0x0,
      qM = 0x0;
    function qN() {
      const Ce = ux;
      kk[Ce(0x94b)](kj[Ce(0xf3d)] / 0x2, kj[Ce(0xac0)] / 0x2);
      let s6 = qO();
      kk[Ce(0xd3a)](s6, s6),
        kk[Ce(0x94b)](-pu, -pv),
        pc[Ce(0x3c9)] && kk[Ce(0x94b)](qL, qM);
    }
    function qO() {
      const Cf = ux;
      return Math[Cf(0xe6f)](kj[Cf(0xf3d)] / cZ, kj[Cf(0xac0)] / d0) * qP();
    }
    function qP() {
      return nh / py;
    }
    kY(), pU();
    const qQ = {};
    (qQ[ux(0xc49)] = ux(0xb1e)),
      (qQ[ux(0xc32)] = ux(0x4ea)),
      (qQ[ux(0x1de)] = ux(0x50c));
    const qR = {};
    (qR[ux(0xc49)] = ux(0xb31)),
      (qR[ux(0xc32)] = ux(0x853)),
      (qR[ux(0x1de)] = ux(0x685));
    const qS = {};
    (qS[ux(0xc49)] = ux(0x745)),
      (qS[ux(0xc32)] = ux(0x7ae)),
      (qS[ux(0x1de)] = ux(0xf02));
    const qT = {};
    (qT[ux(0xc49)] = ux(0xab6)),
      (qT[ux(0xc32)] = ux(0x435)),
      (qT[ux(0x1de)] = ux(0x290));
    const qU = {};
    (qU[ux(0xc49)] = ux(0x429)),
      (qU[ux(0xc32)] = ux(0xc2e)),
      (qU[ux(0x1de)] = ux(0xb15));
    const qV = {};
    (qV[ux(0xc49)] = ux(0x4c2)),
      (qV[ux(0xc32)] = ux(0x323)),
      (qV[ux(0x1de)] = ux(0x5d9));
    var qW = {
      eu_ffa1: qQ,
      eu_ffa2: qR,
      as_ffa1: qS,
      us_ffa1: qT,
      us_ffa2: qU,
      as_ffa2: qV,
      euSandbox: {
        name: ux(0x9a4),
        color: ux(0x78f),
        onClick() {
          const Cg = ux;
          window[Cg(0x3a2)](Cg(0x95f), Cg(0x335));
        },
      },
    };
    if (window[ux(0x690)][ux(0xa33)] !== ux(0x641))
      for (let s6 in qW) {
        const s7 = qW[s6];
        if (!s7[ux(0xc32)]) continue;
        s7[ux(0xc32)] = s7[ux(0xc32)]
          [ux(0x51a)](ux(0x641), ux(0xb7b))
          [ux(0x51a)](ux(0xee7), ux(0x3d6));
      }
    var qX = document[ux(0x9e3)](ux(0x535)),
      qY = document[ux(0x9e3)](ux(0x6a4)),
      qZ = 0x0;
    for (let s8 in qW) {
      const s9 = qW[s8],
        sa = document[ux(0x636)](ux(0xa2b));
      sa[ux(0x6bc)] = ux(0x8b6);
      const sb = document[ux(0x636)](ux(0x5e5));
      sb[ux(0x467)](ux(0x976), s9[ux(0xc49)]), sa[ux(0x8c5)](sb);
      const sc = document[ux(0x636)](ux(0x5e5));
      (sc[ux(0x6bc)] = ux(0x941)),
        (s9[ux(0x902)] = 0x0),
        (s9[ux(0x583)] = function (sd) {
          const Ch = ux;
          (qZ -= s9[Ch(0x902)]),
            (s9[Ch(0x902)] = sd),
            (qZ += sd),
            k9(sc, ki(sd, Ch(0x666))),
            sa[Ch(0x8c5)](sc);
          const se = Ch(0x800) + ki(qZ, Ch(0x666)) + Ch(0x2ea);
          k9(r2, se), k9(qY, se);
        }),
        (s9[ux(0x601)] = function () {
          const Ci = ux;
          s9[Ci(0x583)](0x0), sc[Ci(0xcd1)]();
        }),
        (sa[ux(0x5f5)][ux(0xd53)] = s9[ux(0x1de)]),
        qX[ux(0x8c5)](sa),
        (sa[ux(0xc0d)] =
          s9[ux(0x484)] ||
          function () {
            const Cj = ux,
              sd = qX[Cj(0x9e3)](Cj(0xba2));
            if (sd === sa) return;
            sd && sd[Cj(0x52a)][Cj(0xcd1)](Cj(0xae4)),
              this[Cj(0x52a)][Cj(0x536)](Cj(0xae4)),
              r5(s9[Cj(0xc32)]),
              (hC[Cj(0x60c)] = s8);
          }),
        (s9["el"] = sa);
    }
    var r0 = nR(ux(0x9f0));
    (r0[ux(0xc0d)] = function () {
      const Ck = ux;
      window[Ck(0x3a2)](Ck(0xa9a), Ck(0x335));
    }),
      qX[ux(0x8c5)](r0);
    var r1 = qW[ux(0xeea)]["el"];
    r1[ux(0x52a)][ux(0x536)](ux(0x5a9)),
      (r1[ux(0x559)] = function () {
        const Cl = ux;
        return nR(Cl(0x21e) + hO[Cl(0xefb)] + Cl(0xddd));
      }),
      (r1[ux(0xe49)] = !![]);
    var r2 = document[ux(0x636)](ux(0x5e5));
    (r2[ux(0x6bc)] = ux(0x6f9)), qX[ux(0x8c5)](r2);
    if (!![]) {
      r3();
      let sd = Date[ux(0x296)]();
      setInterval(function () {
        pQ - sd > 0x2710 && (r3(), (sd = pQ));
      }, 0x3e8);
    }
    function r3() {
      const Cm = ux;
      fetch(Cm(0x8d3))
        [Cm(0x884)]((se) => se[Cm(0x27d)]())
        [Cm(0x884)]((se) => {
          const Cn = Cm;
          for (let sf in se) {
            const sg = qW[sf];
            sg && sg[Cn(0x583)](se[sf]);
          }
        })
        [Cm(0x6f2)]((se) => {
          const Co = Cm;
          console[Co(0x676)](Co(0xa48), se);
        });
    }
    var r4 = window[ux(0xb4c)] || window[ux(0x690)][ux(0x794)] === ux(0xd18);
    if (r4) hW(window[ux(0x690)][ux(0x1f3)][ux(0x51a)](ux(0xd92), "ws"));
    else {
      const se = qW[hC[ux(0x60c)]];
      if (se) se["el"][ux(0xe13)]();
      else {
        let sf = "EU";
        fetch(ux(0x9d6))
          [ux(0x884)]((sg) => sg[ux(0x27d)]())
          [ux(0x884)]((sg) => {
            const Cp = ux;
            if (["NA", "SA"][Cp(0x7b5)](sg[Cp(0x8d5)])) sf = "US";
            else ["AS", "OC"][Cp(0x7b5)](sg[Cp(0x8d5)]) && (sf = "AS");
          })
          [ux(0x6f2)]((sg) => {
            const Cq = ux;
            console[Cq(0xebe)](Cq(0xaeb));
          })
          [ux(0x6c9)](function () {
            const Cr = ux,
              sg = [];
            for (let si in qW) {
              const sj = qW[si];
              sj[Cr(0xc49)][Cr(0xef5)](sf) && sg[Cr(0xf33)](sj);
            }
            const sh =
              sg[Math[Cr(0xe3c)](Math[Cr(0x4a5)]() * sg[Cr(0xf30)])] ||
              qW[Cr(0xdd9)];
            console[Cr(0xebe)](Cr(0xf2a) + sf + Cr(0x328) + sh[Cr(0xc49)]),
              sh["el"][Cr(0xe13)]();
          });
      }
    }
    (document[ux(0x9e3)](ux(0xc69))[ux(0x5f5)][ux(0x4f9)] = ux(0xdf2)),
      kB[ux(0x52a)][ux(0x536)](ux(0x4ac)),
      kC[ux(0x52a)][ux(0xcd1)](ux(0x4ac)),
      (window[ux(0x20a)] = function () {
        im(new Uint8Array([0xff]));
      });
    function r5(sg) {
      const Cs = ux;
      clearTimeout(kG), iv();
      const sh = {};
      (sh[Cs(0xc32)] = sg), (hV = sh), kh(!![]);
    }
    window[ux(0xb3e)] = r5;
    var r6 = null;
    function r7(sg) {
      const Ct = ux;
      if (!sg || typeof sg !== Ct(0xbcc)) {
        console[Ct(0xebe)](Ct(0xb91));
        return;
      }
      if (r6) r6[Ct(0x415)]();
      const sh = sg[Ct(0x925)] || {},
        si = {};
      (si[Ct(0x9c7)] = Ct(0x73f)),
        (si[Ct(0x3f6)] = Ct(0xc60)),
        (si[Ct(0x493)] = Ct(0x647)),
        (si[Ct(0xe67)] = Ct(0x424)),
        (si[Ct(0x6cf)] = !![]),
        (si[Ct(0x2c1)] = !![]),
        (si[Ct(0x3ef)] = ""),
        (si[Ct(0x713)] = ""),
        (si[Ct(0xea6)] = !![]),
        (si[Ct(0x809)] = !![]);
      const sj = si;
      for (let sp in sj) {
        (sh[sp] === void 0x0 || sh[sp] === null) && (sh[sp] = sj[sp]);
      }
      const sk = [];
      for (let sq in sh) {
        sj[sq] === void 0x0 && sk[Ct(0xf33)](sq);
      }
      sk[Ct(0xf30)] > 0x0 &&
        console[Ct(0xebe)](Ct(0x6bd) + sk[Ct(0x2a3)](",\x20"));
      sh[Ct(0x3ef)] === "" && sh[Ct(0x713)] === "" && (sh[Ct(0x3ef)] = "x");
      (sh[Ct(0x3f6)] = hO[sh[Ct(0x3f6)]] || sh[Ct(0x3f6)]),
        (sh[Ct(0xe67)] = hO[sh[Ct(0xe67)]] || sh[Ct(0xe67)]);
      const sl = nR(
        Ct(0x84e) +
          sh[Ct(0x9c7)] +
          Ct(0xd7f) +
          sh[Ct(0x3f6)] +
          Ct(0xe40) +
          (sh[Ct(0x493)]
            ? Ct(0x725) +
              sh[Ct(0x493)] +
              "\x22\x20" +
              (sh[Ct(0xe67)] ? Ct(0xbc2) + sh[Ct(0xe67)] + "\x22" : "") +
              Ct(0x282)
            : "") +
          Ct(0x519)
      );
      (r6 = sl),
        (sl[Ct(0x415)] = function () {
          const Cu = Ct;
          document[Cu(0x458)][Cu(0x52a)][Cu(0xcd1)](Cu(0x552)),
            sl[Cu(0xcd1)](),
            (r6 = null);
        }),
        (sl[Ct(0x9e3)](Ct(0x600))[Ct(0xc0d)] = sl[Ct(0x415)]);
      const sm = sl[Ct(0x9e3)](Ct(0xcea)),
        sn = [],
        so = [];
      for (let sr in sg) {
        if (sr === Ct(0x925)) continue;
        const ss = sg[sr];
        let st = [];
        const su = Array[Ct(0x6c0)](ss);
        let sv = 0x0;
        if (su)
          for (let sw = 0x0; sw < ss[Ct(0xf30)]; sw++) {
            const sx = ss[sw],
              sy = dE[sx];
            if (!sy) {
              sn[Ct(0xf33)](sx);
              continue;
            }
            sv++, st[Ct(0xf33)]([sx, void 0x0]);
          }
        else
          for (let sz in ss) {
            const sA = dE[sz];
            if (!sA) {
              sn[Ct(0xf33)](sz);
              continue;
            }
            const sB = ss[sz];
            (sv += sB), st[Ct(0xf33)]([sz, sB]);
          }
        if (st[Ct(0xf30)] === 0x0) continue;
        so[Ct(0xf33)]([sv, sr, st, su]);
      }
      sh[Ct(0x809)] && so[Ct(0x9ff)]((sC, sD) => sD[0x0] - sC[0x0]);
      for (let sC = 0x0; sC < so[Ct(0xf30)]; sC++) {
        const [sD, sE, sF, sG] = so[sC];
        sh[Ct(0xea6)] && !sG && sF[Ct(0x9ff)]((sK, sL) => sL[0x1] - sK[0x1]);
        let sH = "";
        sh[Ct(0x6cf)] && (sH += sC + 0x1 + ".\x20");
        sH += sE;
        const sI = nR(Ct(0xc41) + sH + Ct(0xee5));
        sm[Ct(0x8c5)](sI);
        const sJ = nR(Ct(0x8ae));
        for (let sK = 0x0; sK < sF[Ct(0xf30)]; sK++) {
          const [sL, sM] = sF[sK],
            sN = dE[sL],
            sO = nR(
              Ct(0x840) + sN[Ct(0x257)] + "\x22\x20" + qB(sN) + Ct(0x282)
            );
          if (!sG && sh[Ct(0x2c1)]) {
            const sP = sh[Ct(0x3ef)] + ka(sM) + sh[Ct(0x713)],
              sQ = nR(Ct(0xe34) + sP + Ct(0xee5));
            sP[Ct(0xf30)] > 0x6 && sQ[Ct(0x52a)][Ct(0x536)](Ct(0x941)),
              sO[Ct(0x8c5)](sQ);
          }
          (sO[Ct(0x559)] = sN), sJ[Ct(0x8c5)](sO);
        }
        sm[Ct(0x8c5)](sJ);
      }
      km[Ct(0x8c5)](sl),
        sn[Ct(0xf30)] > 0x0 &&
          console[Ct(0xebe)](Ct(0x7d5) + sn[Ct(0x2a3)](",\x20")),
        document[Ct(0x458)][Ct(0x52a)][Ct(0x536)](Ct(0x552));
    }
    (window[ux(0x34b)] = r7),
      (document[ux(0x458)][ux(0x2d8)] = function (sg) {
        const Cv = ux;
        sg[Cv(0x2b1)]();
        const sh = sg[Cv(0xb4d)][Cv(0x9d1)][0x0];
        if (sh && sh[Cv(0x307)] === Cv(0xa4e)) {
          console[Cv(0xebe)](Cv(0xc64) + sh[Cv(0xc49)] + Cv(0x86c));
          const si = new FileReader();
          (si[Cv(0x7a7)] = function (sj) {
            const Cw = Cv,
              sk = sj[Cw(0x382)][Cw(0x3a1)];
            try {
              const sl = JSON[Cw(0x76c)](sk);
              r7(sl);
            } catch (sm) {
              console[Cw(0x676)](Cw(0x57b), sm);
            }
          }),
            si[Cv(0x4b1)](sh);
        }
      }),
      (document[ux(0x458)][ux(0x67c)] = function (sg) {
        const Cx = ux;
        sg[Cx(0x2b1)]();
      }),
      Object[ux(0x2d2)](window, ux(0x546), {
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
    "#709e45",
    ".reload-btn",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    "warne",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "binaryType",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "*Snail\x20damage:\x2015\x20→\x2020",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "11th\x20August\x202023",
    "New\x20mob:\x20Fossil.",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    "<div\x20",
    "#eeeeee",
    "Starfish",
    "removeChild",
    "getUint16",
    "breedTimer",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "#368316",
    "Getting\x20",
    "bolder\x2017px\x20",
    "630uAvnOL",
    "\x20rad/s",
    "Rare",
    "soldierAnt",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "Lightning",
    "show_health",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    "moveFactor",
    "#e94034",
    "asdfadsf",
    "KeyF",
    "#cfc295",
    "padStart",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    "\x22></div>",
    "activeElement",
    "wss://",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "toggle",
    "euSandbox",
    "min",
    "started!",
    "Wing",
    "Statue\x20of\x20RuinedLiberty.",
    "shield",
    "),0)",
    "kWicW5FdMW",
    "cmk/auqmq8o8WOngW79c",
    "24th\x20June\x202023",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "startsWith",
    "#21c4b9",
    ".tv-prev",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "Buffs:",
    ".show-health-cb",
    "Ultra",
    "swapped",
    "slowDuration",
    ":scope\x20>\x20.petal",
    ".debug-cb",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "layin",
    "rgb(237\x2061\x20234)",
    "projHealth",
    "20th\x20June\x202023",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "advanced\x20to\x20number\x20",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    "elongation",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "Cactus",
    ".zone-mobs",
    "web_",
    ".player-list",
    "cDHZ",
    "animationDirection",
    "hasHearts",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "\x22></span>\x0a\x09</div>",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "touchmove",
    "M28",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "projHealthF",
    "Digit",
    "ShiftRight",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "dice",
    "#8ecc51",
    "transformOrigin",
    "Honey",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "23rd\x20June\x202023",
    "stringify",
    "#b0473b",
    "can\x20s",
    "1Jge",
    "an\x20UN",
    "#cccccc",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "Region:\x20",
    "Crab\x20redesign.",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "month",
    ".grid\x20.title",
    "tierStr",
    "length",
    "#493911",
    "Comes\x20to\x20avenge\x20mobs.",
    "push",
    "#ccad00",
    ".prediction",
    "#29f2e5",
    ".tv-next",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "Pet\x20Heal",
    "sprite",
    "width",
    "Mythic",
    "powderTime",
    "6fCH",
    "main",
    "Loaded\x20Build\x20#",
    "*Fire\x20health:\x2080\x20→\x20120",
    "starfish",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "Re-added\x20Waves.",
    "petalSunflower",
    "onStart",
    "WAVE",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    "#7dad0c",
    "level",
    "onchange",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    "hasEye",
    ".ads",
    "maximumFractionDigits",
    "color",
    "#fcdd86",
    "hideAfterInactivity",
    "253906KWTZJW",
    "All\x20Petals",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "show_grid",
    "Ugly\x20&\x20stinky.",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "/hqdefault.jpg)",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    ".scores",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    "gblcVXldOG",
    "petHealthFactor",
    "byteLength",
    "horne",
    "usernameTaken",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "stepPerSecMotion",
    "origin",
    "xgMol",
    "#ab5705",
    "Jellyfish",
    "totalAccounts",
    "affectMobHeal",
    ".\x22></span></div>",
    "petalPowder",
    "15th\x20July\x202023",
    "Guardian",
    "Avacado",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    "bone",
    "Dragon_4",
    "mob_",
    "makeAntenna",
    "Extremely\x20slow\x20sussy\x20mob.",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "#ffd941",
    "superPlayers",
    "hit.p",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    "atan2",
    "sendBadMsg",
    ".absorb-btn\x20.tooltip\x20span",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "inventory",
    "show_hitbox",
    "*Turtle\x20health\x20500\x20→\x20600",
    "21st\x20July\x202023",
    "#555555",
    "vFKOVD",
    "workerAntFire",
    "spiderCave",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "posAngle",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "#b58500",
    "Range",
    "Rock_3",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    "requestAnimationFrame",
    "Beetle_6",
    "isSpecialWave",
    "petalBanana",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "\x20at\x20least!",
    "*Arrow\x20damage:\x201\x20→\x203",
    "Sword",
    "connectionIdle",
    "New\x20mob:\x20Snail.",
    "cmk+c0aoqSoLWQrQW6Tx",
    "Stickbug",
    "#416d1e",
    "backgroundImage",
    "successCount",
    "25th\x20June\x202023",
    "#ab7544",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    ".connecting",
    "ad\x20refresh",
    "flors",
    "*Rock\x20health:\x20120\x20→\x20150",
    "#222222",
    "Ghost_5",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    "cacheRendered",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    "arrested\x20for\x20plagerism",
    "onopen",
    "New\x20mob:\x20Dragon\x20Nest.",
    "show_population",
    ".super-buy",
    "legD",
    "Air",
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "New\x20rarity:\x20Hyper.",
    ".credits",
    "Username\x20too\x20short!",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "19th\x20July\x202023",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    ".lottery\x20.inventory-petals",
    "/profile",
    "makeLadybug",
    "keys",
    "Dragon\x20Egg",
    "g\x20on\x20",
    "Added\x20Lottery.",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "eyeX",
    "petalLightning",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "spawnT",
    "tier",
    "powderPath",
    "Health\x20Depletion",
    "kers\x20",
    "*They\x20give\x2010x\x20score.",
    "21st\x20January\x202024",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    "ui_scale",
    "petalStickbug",
    "next",
    "mobDespawned",
    "https://www.youtube.com/@KePiKgamer",
    "\x20HP",
    ";\x20-o-background-position:",
    "Copied!",
    "#7777ff",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    "Buffed\x20Gem.",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "rnex.",
    "\x0a16th\x20May\x202024\x0aAdded\x20Game\x20Statistics:\x0a*Super\x20Players\x0a*Hyper\x20Players\x0a*Ultra\x20Players\x20(with\x20more\x20than\x20200\x20ultra\x20petals)\x0a*All\x20Petals\x0a*Data\x20is\x20updated\x20every\x20hour.\x0a*You\x20can\x20search\x20game\x20stats\x20by\x20username.\x0a",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    ".minimap-dot",
    "darkLadybug",
    "&#Uz",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    "Pollen",
    ".builds\x20.dialog-content",
    "\x20-\x20",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "toFixed",
    "{background-color:",
    "#db4437",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    "accou",
    "json",
    "petalGas",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "petalLightsaber",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    "></div>",
    "*Banana\x20damage:\x201\x20→\x202",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "Salt",
    "Enter",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "#4343a4",
    "#363685",
    "*Light\x20damage:\x2012\x20→\x2010",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "Video\x20AD\x20success!",
    "petalPincer",
    "\x20!important;}",
    "crafted",
    "rgb(219\x20130\x2041)",
    "#406150",
    "Increased\x20shiny\x20mob\x20size.",
    "\x20play",
    "show_scoreboard",
    "occupySlot",
    "now",
    "B4@J",
    ".player-list\x20.dialog-content",
    "*Rock\x20health:\x20150\x20→\x20200",
    "pacman",
    "transition",
    "\x20domain=.hornex.pro",
    "#4f412e",
    "ArrowDown",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "isDead",
    "24th\x20January\x202024",
    "└─\x20",
    "join",
    "#bb1a34",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    "#e0c85c",
    "transform",
    "craft-disable",
    "timeJoined",
    "onmousemove",
    ".hide-chat-cb",
    "*Reduced\x20Shield\x20regen\x20time.",
    "#634002",
    "2070846gZncys",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "Zert",
    "preventDefault",
    "poisonDamageF",
    ".lottery-timer",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    ".clown",
    "*Gas\x20health:\x20140\x20→\x20250",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "bg-rainbow",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "22nd\x20January\x202024",
    "progressEl",
    "ame",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "oAngle",
    "unnamed",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "showItemLabel",
    "dontUiRotate",
    "Slowness\x20Duration",
    "tals.",
    "download",
    "Removed\x20Waves.",
    "Minor\x20physics\x20change.",
    "petSizeChangeFactor",
    "^F[@",
    "Added\x20Waveroom:",
    "ffa\x20sandbox",
    "ion",
    "your\x20",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "Ghost_4",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    "defineProperty",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20class=\x22username-link\x22\x20stroke=\x22",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    "User\x20not\x20found.",
    "\x20Blue",
    "#ff7892",
    "ondrop",
    "leaders",
    "Added\x202\x20US\x20lobbies.",
    "portal",
    ".inventory-petals",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    "#e05748",
    "changelog",
    "changeLobby",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "ll\x20yo",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    "nerd",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    ".petal.empty",
    "fire\x20ant",
    "\x20Wave\x20",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    "\x20online)",
    "running...",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    "wasDrawn",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "alpha",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    "ur\x20pe",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    "15th\x20August\x202023",
    "Downloaded!",
    "Sandstorm_3",
    ".builds",
    "*Bone\x20armor:\x204\x20→\x205",
    "keyAlreadyUsed",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    "health",
    "Beetle",
    ".scoreboard-title",
    "#f22",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "petalLeaf",
    "24th\x20July\x202023",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "Desert\x20Centipede",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    "createImageData",
    "renderBelowEverything",
    "type",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "ArrowRight",
    "Invalid\x20username.",
    "*Cotton\x20health:\x2012\x20→\x2015",
    "*Arrow\x20health:\x20180\x20→\x20220",
    "#b5a24b",
    ".stat-value",
    "Craft",
    "New\x20mob:\x20M28.",
    "show_debug_info",
    ".helper-cb",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    "2772301LQYLdH",
    "iAngle",
    "onwheel",
    "rotate",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "Server-side\x20optimizations.",
    "spawnOnHurt",
    "*Peas\x20health:\x2020\x20→\x2025",
    "toLocaleDateString",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "col",
    "11808nyveDI",
    "Wave\x20Starting...",
    "m28",
    "5th\x20January\x202024",
    "wss://as2.hornex.pro",
    "bolder\x2012px\x20",
    "3rd\x20August\x202023",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "Poisonous\x20gas.",
    "\x0aServer:\x20",
    "#7af54c",
    "petSizeIncrease",
    "\x20all\x20",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "pet",
    "Bubble",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    "KGw#",
    "been\x20",
    "New\x20mob:\x20Nigersaurus.",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "_blank",
    "9th\x20July\x202023",
    "Shield",
    "*Peas\x20damage:\x2015\x20→\x2020",
    "lineCap",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "*Cotton\x20health:\x209\x20→\x2010",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    "Spider_6",
    "l\x20you",
    "petalNitro",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "Dragon_1",
    "localStorage\x20denied.",
    "#8ac255",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    "onkeydown",
    "roundRect",
    "spotPath_",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    "displayData",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    ".changelog-btn",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "/tile\x20(",
    "*Hyper:\x202%\x20→\x201%",
    ".no-btn",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    "#bebe2a",
    "Stick",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "waveNumber",
    "13th\x20February\x202024",
    "flowerPoisonF",
    "[G]\x20Show\x20Grid:\x20",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    "hide-scoreboard",
    "Damage\x20Reflection",
    "Failed\x20to\x20get\x20game\x20stats.\x20Retrying\x20in\x205s...",
    ".settings",
    "W43cOSoOW4lcKG",
    "WRGBrCo9W6y",
    "#d54324",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "setUint32",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    "hpRegen75PerSecF",
    "updateProg",
    "pZWkWOJdLW",
    "\x27s\x20profile...",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    ".import-btn",
    "Hornet_2",
    "i\x20need\x20999\x20billion\x20subs",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    "our\x20o",
    "petalDrop",
    "portalPoints",
    "9iYdxUh",
    "petalSpiderEgg",
    "├─\x20",
    "drawImage",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    ".featured",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    ".show-bg-grid-cb",
    "text",
    "Beetle_4",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    "target",
    ".key-input",
    "hide",
    "WRRdT8kPWO7cMG",
    "thirdEye",
    "joinedGame",
    "putImageData",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "rgba(0,0,0,0.3)",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "quadraticCurveTo",
    ".killer",
    "ladybug",
    "bsorb",
    "#69371d",
    "nHealth",
    "video-ad-skipped",
    "scrollTop",
    "pickedEl",
    "Fonts\x20loaded!",
    "#cfbb50",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    "oProg",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    "Bee",
    "uwu",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "isConnected",
    "iGamble",
    "abeQW7FdIW",
    "result",
    "open",
    "hide-zone-mobs",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "Poop\x20Damage",
    "𐐿𐐘𐐫𐑀𐐃",
    "#38ecd9",
    ".switch-btn",
    "28th\x20December\x202023",
    "copyright\x20striked",
    "#bb3bc2",
    "Spider_3",
    ".time-alive",
    "rgb(31,\x20219,\x20222)",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "Rock\x20Egg",
    "makeHole",
    "%nick%",
    "petalStinger",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    ".circle",
    "url(",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "petalWeb",
    ".petals.small",
    "\x20was\x20",
    "data-icon",
    ".joystick",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "[Y]\x20Show\x20Health:\x20",
    "#543d37",
    "Wave\x20",
    "KePiKgamer",
    "8th\x20August\x202023",
    "Fixed\x20players\x20pushing\x20eachother.",
    "statue",
    "Fleepoint",
    "oPlayerY",
    "enable_shake",
    "snail",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "16th\x20September\x202023",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    "*Reduced\x20mob\x20count.",
    "DMCA",
    "#222",
    "28th\x20August\x202023",
    "userChat",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "Hnphe",
    "wss://hornex-",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    ".inventory-btn",
    "projAngle",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    "Gives\x20you\x20a\x20shield.",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "tumbleweed",
    "bush",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    "Orbit\x20Dance",
    "1px",
    "25th\x20January\x202024",
    "nameEl",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "e\x20bee",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    "mobKilled",
    "\x22></span>\x20",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    "labelPrefix",
    "isTrusted",
    "11th\x20July\x202023",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "url(https://i.ytimg.com/vi/",
    "CCofC2RcTG",
    "Increases",
    "titleColor",
    "killsNeeded",
    "hasHalo",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    "ShiftLeft",
    "twirl",
    "#888",
    "mouse",
    ".expand-btn",
    "decode",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "hsla(0,0%,100%,0.1)",
    "\x20stea",
    "W5T8c2BdUs/cJHBcR8o4uG",
    ".level-progress",
    "healthF",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "pop",
    "glbData",
    "#bbbbbb",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "shiftKey",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    "Extra\x20Range",
    "Breed\x20Strength",
    "inclu",
    "isInventoryPetal",
    "Dragon_5",
    "dispose",
    "pedox",
    "#bff14c",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "compression\x20version\x20not\x20supported:\x20",
    "#bc0000",
    "Bush",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    "New\x20mob:\x20Pedox",
    "petalMagnet",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    "top",
    "Peas",
    "Shell",
    "unsuccessful",
    "Unusual",
    "queenAnt",
    "Extra\x20Speed",
    "#76ad45",
    "totalTimePlayed",
    "US\x20#2",
    "armorF",
    "yellow",
    "setPos",
    ".rewards\x20.dialog-content",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    "\x20$1",
    "Game\x20released\x20to\x20public!",
    "released",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    "Nigerian\x20Ladybug.",
    "wss://us1.hornex.pro",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    "bee",
    "Poison",
    "outdatedVersion",
    "assualted",
    "*Legendary:\x20125\x20→\x20100",
    "#eee",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    "opacity",
    "26th\x20July\x202023",
    "globalAlpha",
    "ceil",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    "size",
    "101636gyvtEF",
    "#fe98a2",
    "z8kgrX3dSq",
    "Heavier\x20than\x20your\x20mom.",
    "\x22></div><div\x20class=\x22log-content\x22>",
    "Gem",
    "Web",
    "span\x202",
    "damageF",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "&response_type=code&scope=identify&state=",
    "iChat",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "hpRegenPerSecF",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    "fire",
    "10th\x20August\x202023",
    "duration",
    "body",
    "value",
    "UNOFF",
    "Iris",
    "heart",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    "forEach",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    "#f009e5",
    "fake",
    "consumeProjDamageF",
    "cactus",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    "setAttribute",
    "curePoisonF",
    "statuePlayer",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    "createObjectURL",
    ".chat",
    "Pincer",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    "26th\x20August\x202023",
    "keyClaimed",
    "shieldReload",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    ".checkbox",
    "hide-icons",
    "Temporary\x20Extra\x20Speed",
    "agroRangeDec",
    ".anti-spam-cb",
    "sunflower",
    "Soldier\x20Ant_2",
    "Kills",
    "prog",
    "Increased\x20Ultra\x20key\x20price.",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    "#735d5f",
    "strokeText",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "parentNode",
    "onClick",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "ellipse",
    "Increased\x20Wave\x20mob\x20count.",
    "stickbugBody",
    "17th\x20June\x202023",
    "It\x20has\x20sussy\x20movement.",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "release",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    "#ce76db",
    "barEl",
    "makeSpiderLegs",
    "desc",
    "Goofy\x20little\x20wanderer.",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "KeyU",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    ".fixed-name-cb",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    ".export-btn",
    "destroyed",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "#d3ad46",
    "petalHeavy",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "#8f5f34",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "hypot",
    "random",
    "deg)\x20scale(",
    "rgb(43,\x20255,\x20163)",
    "YOBA",
    "state",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    "damage",
    "show",
    "addToInventory",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    "6th\x20September\x202023",
    "25th\x20August\x202023",
    "readAsText",
    "2357",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    "Q2mA",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    "Reflected\x20Missile\x20Damage",
    "Fire\x20Damage",
    "New\x20mob:\x20Turtle",
    "isLightning",
    "petalSalt",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "and\x20a",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    "show_damage",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "Soldier\x20Ant_1",
    "Spider\x20Legs",
    "AS\x20#2",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "wig",
    "eyeY",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    "projD",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "cantChat",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    "sin",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    ".ultra-buy",
    "getTitleEl",
    "devicePixelRatio",
    "27th\x20February\x202024",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    ".mobs-btn",
    "getUint8",
    "terms.txt",
    "hideTimer",
    ".game-stats\x20.dialog-content",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    "14th\x20August\x202023",
    "Damage",
    "*Rock\x20health:\x2050\x20→\x2060",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    "projAffectHealDur",
    "Heavy",
    "shop",
    "fireDamageF",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    "Passively\x20regenerates\x20your\x20health.",
    "Ancester\x20of\x20flowers.",
    "wss://eu1.hornex.pro",
    "(81*",
    "web",
    "credits",
    "s.\x20Yo",
    "Elongation",
    "%\x20-\x200.8em*",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "keyCode",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "mobSizeChange",
    "Head",
    "fontSize",
    "Numpad",
    "display",
    "sameTypeColResolveOnly",
    "i\x20make\x20cool\x20videos",
    "ghost",
    "Orbit\x20Twirl",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "nShield",
    "\x22></div>\x20<div\x20style=\x22color:",
    "#5ec13a",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "#a33b15",
    "scrollHeight",
    "misReflectDmgFactor",
    "Pacman",
    "#a52a2a",
    "containerDialog",
    "uiAngle",
    "*Fire\x20damage:\x209\x20→\x2015",
    "Retardation\x20Duration",
    "rgb(166\x2056\x20237)",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    ".absorb\x20.dialog-content",
    "from",
    "#b53229",
    "petalExpander",
    "W77cISkNWONdQa",
    "WP5YoSoxvq",
    "KICKED!",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    ".shake-cb",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    "replace",
    "rgb(222,111,44)",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "guardian",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    "hpRegenPerSec",
    "spawn",
    ".right-align-petals-cb",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    "px\x20",
    "hsla(0,0%,100%,0.4)",
    "dSk+d0afnmo5WODJW6zQxW",
    "#fc5c5c",
    "classList",
    "597CHVAKP",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    ".joystick-knob",
    ".collected-petals",
    "hostn",
    "userProfile",
    "rgb(126,\x20239,\x20109)",
    "#af6656",
    "drawSnailShell",
    ".low-quality-cb",
    ".server-area",
    "add",
    "Dragon_2",
    "#d3bd46",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    ".spawn-zones",
    "r\x20acc",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "#f7904b",
    "Kills\x20Needed",
    "\x0a26th\x20August\x202024\x0aPlay\x20our\x20new\x20game:\x20Triep.IO\x0a",
    "rgb(134,\x2031,\x20222)",
    "#333333",
    "localId",
    "finalMsg",
    "pink",
    "msgpack",
    "Hornet_3",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    "#a44343",
    "abs",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    "*Powder\x20health:\x2010\x20→\x2015",
    "fossil",
    "29th\x20January\x202024",
    "nig",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    "petalYobaEgg",
    "hide-all",
    "loading",
    ".find-user-btn",
    "makeBallAntenna",
    ".continue-btn",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "beetle",
    "petal",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    "Reduced\x20mobile\x20UI\x20scale.",
    "*Super:\x20150+",
    "/s\x20if\x20H<50%",
    "\x20pxls)\x20/\x20",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    "Swastika",
    "gameStats",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "petalBasic",
    "avatar",
    ".debug-info",
    "sizeIncrease",
    "sk.",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "*Peas\x20damage:\x2012\x20→\x2015",
    "isStatue",
    "typeStr",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "WRyiwZv5x3eIdtzgdgC",
    ".waveroom-info",
    "\x20from\x20",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    "*Rare:\x2050\x20→\x2035",
    ".watch-ad",
    "nt\x20an",
    "OFF",
    "lightningDmg",
    "deg)",
    "7th\x20July\x202023",
    "#323032",
    "Spider\x20Egg",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    "Red\x20ball.",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "identifier",
    "W6HBdwO0",
    "vendor",
    "setUserCount",
    "Even\x20more\x20wave\x20changes:",
    "font",
    "visible",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "New\x20petal:\x20Wig.",
    "/s\x20for\x20all\x20tiles)",
    "Increases\x20your\x20vision.",
    "unknown",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "parts",
    "flower",
    "http://localhost:8001/discord",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "\x0a22nd\x20May\x202024\x0aNew\x20setting:\x20Show\x20Health.\x20Press\x20Y\x20to\x20toggle.\x0aNew\x20setting:\x20Fixed\x20Flower\x20Health\x20Bar\x20Size.\x0aNew\x20setting:\x20Fixed\x20Mob\x20Health\x20Bar\x20Size.\x0aNew\x20setting:\x20Change\x20Font.\x0aHoney\x20now\x20also\x20shows\x20tile\x20count\x20&\x20total\x20damage\x20casted\x20by\x20all\x20tiles\x20in\x201\x20second.\x20Do\x20note\x20the\x20numbers\x20are\x20for\x20most\x20ideal\x20case.\x20Most\x20of\x20the\x20time\x20you\x20won\x27t\x20get\x20that\x20much\x20damage.\x0a",
    "uiX",
    "complete",
    ".dc-group",
    "angryT",
    "gameStats.json",
    "despawnTime",
    "2nd\x20October\x202023",
    "Sandstorm_1",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "strokeRect",
    "nigersaurus",
    "https://www.instagram.com/zertalious",
    "accountId",
    "pickupRange",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "Epic",
    "Some\x20anti\x20lag\x20measures:",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "\x20Ultra",
    "cos",
    "countEl",
    ".discord-btn",
    "sandbox-btn",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "WARNING!",
    "setTargetByEvent",
    "2-digit",
    "c)H[",
    "petalPacman",
    "d\x20abs",
    "function",
    "rgba(0,0,0,0.2)",
    "setValue",
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "reflect",
    "100%",
    "extraSpeedTemp",
    "hsl(110,100%,60%)",
    "oHealth",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "WRZdV8kNW5FcHq",
    "*Peas\x20damage:\x208\x20→\x2010",
    "#ffd800",
    "extraSpeed",
    "Fire",
    "centipedeHead",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    "KeyD",
    "1841224gIAuLW",
    "Rock",
    "#8ac355",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    "Heal",
    "lineJoin",
    "soldierAntFire",
    "Coffee",
    "Username\x20too\x20big!",
    "XCN6",
    "startEl",
    "password",
    "adplayer",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    ".username-link",
    "picked",
    "#3db3cb",
    ".lottery\x20.dialog-content",
    ".textbox",
    "KeyV",
    "Kicked!\x20(reason:\x20",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "petalShrinker",
    "local",
    ".change-font-cb",
    "lottery",
    "iCheckKey",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "span",
    "rando",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    "Dahlia",
    "textBaseline",
    "Extra\x20Pickup\x20Range",
    "petHeal",
    "keyup",
    "19th\x20June\x202023",
    "countAngleOffset",
    "<div\x20class=\x22petal-count\x22></div>",
    "*Removed\x20Ultra\x20wave.",
    "Game",
    "OQM)",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    ".grid",
    "style",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Fixed\x20duplicate\x20drops.",
    "Waveroom",
    "#000000",
    "GBip",
    "Hornet\x20Egg",
    ".swap-btn",
    "Extra\x20Spin\x20Speed",
    "Furry",
    ".close-btn",
    "hideUserCount",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    "hsla(0,0%,100%,0.15)",
    "spikePath",
    "drawChats",
    "<style>\x0a\x09\x09",
    "slice",
    "canSkipRen",
    "dragonNest",
    ".dismiss-btn",
    "strok",
    "server",
    "iBreedTimer",
    "Nerfs:",
    "#7d5b1f",
    "http://localhost:6767/",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "bottom",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    "clientHeight",
    "href",
    "onMove",
    "Mushroom",
    "/weborama.js",
    "/dlPetal",
    "hasSpawnImmunity",
    "7th\x20October\x202023",
    "useTime",
    "workerAnt",
    "fillText",
    "*Arrow\x20damage:\x203\x20→\x204",
    "New\x20mob:\x20Mushroom.",
    "sandstorm",
    "It\x20likes\x20to\x20dance.",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    "globalCompositeOperation",
    "A\x20default\x20petal.",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "aip_complete",
    ".fixed-mob-health-cb",
    "antHoleFire",
    "*Rice\x20damage:\x205\x20→\x204",
    "#15cee5",
    "*Bone\x20armor:\x209\x20→\x2010",
    "dontResolveCol",
    "petalEgg",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    ".hud",
    "Skull",
    "Saved\x20Build\x20#",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "Crab",
    "createElement",
    "measureText",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    "targetEl",
    "rgba(0,0,0,0.15)",
    "furry",
    "en-US",
    "oncontextmenu",
    "u\x20hav",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    "hornex.pro",
    "(reloading...)",
    "arial",
    "KeyG",
    "drawTurtleShell",
    "#efc99b",
    "Very\x20sussy\x20data!",
    "\x0a15th\x20August\x202024\x0aLottery\x20participants\x20&\x20winners\x20are\x20now\x20logged\x20in\x20Discord\x20server.\x20Join\x20now!\x0a",
    "beehive",
    "rgba(0,0,0,",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "PedoX",
    "Rose",
    "fill",
    "isConsumable",
    "splice",
    "insert\x20something\x20here...",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "isClown",
    "deadPreDraw",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    ".submit-btn",
    "uiHealth",
    "gcldSq",
    "iMood",
    ".data-search",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "Cotton\x20bush.",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "*Peas\x20damage:\x2010\x20→\x2012",
    "petalTaco",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    "New\x20settings:\x20Low\x20quality.",
    "#1ea761",
    "user",
    "#34f6ff",
    "Reduced\x20Wave\x20duration.",
    "values",
    "dontExpand",
    ".death-info",
    "New\x20score\x20formula.",
    "Invalid\x20petal\x20name:\x20",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "privacy.txt",
    "Nitro",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "petalTurtle",
    "Flower\x20Poison",
    "\x0a13th\x20May\x202024\x0aFixed\x20a\x20bug\x20that\x20didn\x27t\x20let\x20flowers\x20enter\x20portals.\x0aBalances:\x0a*Sword\x20damage:\x2017\x20→\x2021\x0a*Yin\x20yang\x20damage:\x2010\x20→\x2020\x0a*Yin\x20yang\x20reload:\x202s\x20→\x201.5s\x0a",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "error",
    ".fixed-player-health-cb",
    "repeat",
    "KeyY",
    "iReqGambleList",
    "#dc704b",
    "ondragover",
    "hsla(0,0%,100%,0.3)",
    "rectAscend",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "Fixed\x20number\x20rounding\x20issue.",
    "setCount",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "spawn_zone",
    "rgb(81\x20121\x20251)",
    "e8oQW7VdPKa",
    "#8a6b1f",
    "isStatic",
    "choked",
    "Sponge",
    "KeyX",
    "Yourself",
    "OFFIC",
    "5th\x20August\x202023",
    "crab",
    "location",
    "Ghost",
    "%zY4",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    "lightning",
    "14th\x20July\x202023",
    "map",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "saved_builds",
    "Petals",
    ".clown-cb",
    "#38c75f",
    "#ebeb34",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    "oPlayerX",
    "Neowm",
    "#75dd34",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "admin_pass",
    "drawWingAndHalo",
    ".global-user-count",
    "Fixed\x20another\x20craft\x20exploit.",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "querySelectorAll",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    "enable_min_scaling",
    "petalRice",
    "Loading\x20video\x20ad...",
    "1728540InsIdx",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    "\x20downloaded!",
    "Beetle_3",
    "send",
    "test",
    "petRoamFactor",
    "lightningBouncesTiers",
    "petalSponge",
    "waveEnding",
    "Added\x20maze\x20in\x20Waveroom:",
    "Flower\x20#",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x20no-hide\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "Beetle_5",
    "10px",
    "oSize",
    "className",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "WPJcKmoVc8o/",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "isArray",
    "18th\x20September\x202023",
    "Chromosome",
    "16th\x20June\x202023",
    "charAt",
    "W7/cOmkwW4lcU3dcHKS",
    "Decreases",
    ".tooltips",
    "createPattern",
    "finally",
    "Dragon",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "Failed\x20to\x20load\x20game\x20stats!",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    "Soldier\x20Ant_4",
    "addGroupNumbers",
    "index",
    "#854608",
    "projPoisonDamageF",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    "scale(",
    "User\x20not\x20found!",
    "#ff94c9",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    "petalDmca",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "curePoison",
    "15584076IAHWRs",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    "switched",
    "#97782b",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    "#b52d00",
    "angleSpeed",
    "KCsdZ",
    "hpRegen75PerSec",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "poisonDamage",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "#aaaaaa",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    "queenAntFire",
    "projPoisonDamage",
    "ears",
    ".chat-content",
    "New\x20mob:\x20Statue.",
    "extraRange",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    "catch",
    "[F]\x20Show\x20Hitbox:\x20",
    "isSupporter",
    "crafted\x20nothing\x20from",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "iWithdrawPetal",
    "small\x20full",
    "Fire\x20Ant",
    "Dandelion",
    "Added\x20Shiny\x20mobs:",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "\x22\x20stroke=\x22(",
    "*Cotton\x20health:\x207\x20→\x208",
    "stayIdle",
    "setTargetEl",
    "doLerpEye",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "WRzmW4bPaa",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    "lighter",
    "6th\x20July\x202023",
    "hoq5",
    "rgba(0,0,0,0.35)",
    "save",
    "scale2",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "Ant\x20Fire",
    "iWatchAd",
    "hasEars",
    ".petals",
    "Fixed\x20another\x20crafting\x20exploit.",
    "petalHoney",
    "labelSuffix",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    "Light",
    ".login-btn",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    "Desert",
    "discord_data",
    "13th\x20August\x202023",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    "green",
    "#6f5514",
    "\x22></span></div>",
    ".total-accounts",
    "https://www.youtube.com/@FussySucker",
    "dontPushTeam",
    "Sandstorm",
    "red",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    "wing",
    "unset",
    "New\x20setting:\x20UI\x20Scale.",
    "Orbit\x20Shlongation",
    "setUint16",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    "[2tB",
    "Cotton",
    ".hornexcord-btn",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    "offsetHeight",
    "goofy\x20ahh\x20insect\x20robbery",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "Yellow\x20Ladybug",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "23rd\x20August\x202023",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    "maxTimeAlive",
    "<div>\x0a\x09\x09<span\x20stroke=\x22",
    "New\x20mob:\x20Furry.",
    "nice\x20stolen\x20florr\x20assets",
    "iClaimUsername",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    "Some\x20Data",
    "55078DZMiSD",
    "rainbow-text",
    ".shop-btn",
    "enable_kb_movement",
    "strokeStyle",
    "AS\x20#1",
    ".ui-scale\x20select",
    "nickname",
    "%\x20success\x20rate",
    "#695118",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "sizeIncreaseF",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    ".yes-btn",
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "Beehive",
    "*Missile\x20damage:\x2050\x20→\x2055",
    "killed",
    "setUint8",
    "fillStyle",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    ".main",
    "29th\x20June\x202023",
    "motionKind",
    "childIndex",
    "Removed\x20EU\x20#3.",
    ".grid-cb",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "22nd\x20July\x202023",
    "Removed\x20Centipedes\x20from\x20waves.",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    "affectHealDur",
    "getBoundingClientRect",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    "24th\x20August\x202023",
    "show-petal",
    ".player-count",
    "getContext",
    "parse",
    "fovFactor",
    "Mob\x20Size\x20Change",
    ".my-player",
    "Added\x201\x20more\x20EU\x20lobby.",
    ".pro",
    "Body",
    "#4d5e56",
    "iAbsorb",
    "rgba(0,0,0,0.1)",
    "orbitRange",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "updateTime",
    "31st\x20July\x202023",
    "air",
    "trim",
    "find",
    "Ant\x20Egg",
    "isFakeChat",
    "petalFaster",
    ".score-overlay",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "drawArmAndGem",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    ".absorb-petals",
    "ctx",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    "documentElement",
    "sponge",
    "#754a8f",
    "Baby\x20Ant",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "chain",
    "#82c92f",
    "*Opening\x20Lottery",
    "bqpdSW",
    "hpRegen",
    "have\x20",
    "search",
    "deltaY",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "Lvl\x20",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "Yoba_2",
    "rgb(92,\x20116,\x20176)",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "change-font",
    "petalsLeft",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "WP/dQbddHH0",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "Could\x20not\x20claim\x20secret\x20skin.",
    "show_clown",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    ".zone-name",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "pathSize",
    "onload",
    "Rock_1",
    "textAlign",
    ".minimap",
    "\x20tiles)",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "#000",
    "wss://as1.hornex.pro",
    "1st\x20August\x202023",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "#7d893e",
    "*Pincer\x20damage:\x205\x20→\x206",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    "Lobby\x20Closing...",
    "includes",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "charCodeAt",
    "armor",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "<div\x20class=\x22chat-text\x22></div>",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    "WP4dWPa7qCklWPtcLq",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "%\x20!important",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    "Craft\x20rate\x20change:",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "Spider_1",
    "#a2dd26",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "Rock_2",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    "loggedIn",
    ".hyper-buy",
    "WQpcUmojoSo6",
    "Hornet_6",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    "closePath",
    "20th\x20January\x202024",
    "26th\x20June\x202023",
    "isPetal",
    "rgba(0,\x200,\x200,\x200.2)",
    "rgba(0,0,0,0.4)",
    "kbps",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "turtle",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Passive\x20Heal",
    "?v=",
    "assassinated",
    "\x20by",
    ".inventory-rarities",
    "#ada25b",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    "petalShell",
    "totalPetals",
    "Spider_5",
    "Honey\x20factory.",
    "particle_heart_",
    "#c1ab00",
    "isTanky",
    "no-icon",
    "cEca",
    "invalid\x20uuid",
    "Makes\x20you\x20poisonous.",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "Client-side\x20performance\x20improvements.",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    "26th\x20January\x202024",
    "isBae",
    "isIcon",
    ".\x22>\x20<span\x20class=\x22username-link\x22\x20stroke=\x22",
    "*Recuded\x20mob\x20count.",
    "stopWhileMoving",
    "orbitDance",
    "Disconnected.",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "numeric",
    "12th\x20August\x202023",
    "playerList",
    "W7dcP8k2W7ZcLxtcHv0",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "rgba(0,\x200,\x200,\x200.15)",
    "\x22></span>",
    "Evil\x20Centipede",
    "https://www.youtube.com/@IAmLavaWater",
    "(total\x20",
    "#f2b971",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    ".tier-",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "petalerDrop",
    "23rd\x20July\x202023",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    "sortGroups",
    ".game-stats",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "Username\x20is\x20already\x20taken.",
    "isPet",
    "nick",
    "getTransform",
    "#dddddd",
    "Rock_6",
    "W6RcRmo0WR/cQSo1W4PifG",
    "hasGem",
    "#2da14d",
    "#ffe200",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "petalPollen",
    "27th\x20July\x202023",
    ".lottery-btn",
    "Rice",
    "Take\x20Down\x20Time",
    "[K]\x20Keyboard\x20Controls:\x20",
    "bolder\x2025px\x20",
    "reduce",
    "Legendary",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    "KeyW",
    "hurtT",
    "New\x20mob:\x20Spider\x20Cave.",
    "#d43a47",
    "totalChatSent",
    "Dragon_3",
    "prepend",
    "nSize",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    ".clear-build-btn",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "22nd\x20June\x202023",
    "uiName",
    ".inventory\x20.inventory-petals",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    "Hornet",
    "scorp",
    "content",
    "consumeProj",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    "select",
    "Redesigned\x20some\x20mobs.",
    "hsl(60,60%,",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "loginFailed",
    "textEl",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    "Fussy\x20Sucker",
    ".damage-cb",
    "<div\x20class=\x22petal\x20tier-",
    "Ant\x20Hole",
    "makeMissile",
    ".builds-btn",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "*Ultra:\x20120",
    "hornex-pro_300x600",
    "offsetWidth",
    "*Unsual:\x2025\x20→\x2010",
    ".reload-timer",
    "https://discord.gg/SX8jmVHHGT",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "*Super:\x20180",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    "innerWidth",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "acker",
    "wss://eu2.hornex.pro",
    "rgb(77,\x2082,\x20227)",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    "invalid",
    "clientX",
    ".keyboard-cb",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "reset",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "New\x20mob:\x20Sunflower.",
    ".lb-btn",
    "*Hyper:\x2015-25",
    "iSwapPetalRow",
    "rgb(",
    "W5OTW6uDWPScW5eZ",
    "lient",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    "Can\x27t\x20perform\x20that\x20action.",
    "Sandstorm_4",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "centipedeHeadPoison",
    "rgba(0,0,0,0.08)",
    ".id-group",
    "...",
    "13th\x20September\x202023",
    "#454545",
    "KeyS",
    "petalFire",
    "*Reduced\x20drops\x20by\x2050%.",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "*Rock\x20health:\x2045\x20→\x2050",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "#654a19",
    "n\x20an\x20",
    "disabled",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    ".absorb-petals-btn",
    "Leave",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "#764b90",
    ")\x20rotate(",
    "STOP!",
    "#c1a37d",
    "Invalid\x20account!",
    "Hyper\x20Players",
    "30th\x20June\x202023",
    "then",
    "#999",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "WPPnavtdUq",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "\x5c$1",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    "7th\x20August\x202023",
    "angle",
    ".stats\x20.dialog-header\x20span",
    "#ffffff",
    "https://auth.hornex.pro/discord",
    "Ghost_1",
    "2090768fiNzSa",
    "purple",
    "Expander",
    "doRemove",
    "\x20and\x20",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    "https://www.youtube.com/@NeowmHornex",
    "W5bKgSkSW78",
    "isRetard",
    "hsl(60,60%,30%)",
    "ontouchstart",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    ".player-list-btn",
    "Favourite\x20object\x20of\x20a\x20woman.",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "#A8A7A4",
    "image/png",
    "dev",
    "#3f1803",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    "ICIAL",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "consumeProjHealth",
    "tagName",
    "NSlTg",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    "j[zf",
    "<div\x20class=\x22petal-container\x22></div>",
    "rock",
    ".shop-overlay",
    ".credits-btn",
    "wn\x20ri",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "Added\x20Shop.",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "btn",
    "0@x9",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    "MOVE\x20AWAY!!",
    "Pet\x20Size\x20Increase",
    "updateT",
    ".lottery-winner",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "*Ultra:\x20125+",
    "fillRect",
    "\x0a5th\x20May\x202024\x0aHeavy\x20now\x20slows\x20down\x20your\x20petal\x20orbit\x20speed.\x20More\x20slowness\x20for\x20higher\x20rarity.\x20\x0aCotton\x20doesn\x27t\x20expand\x20like\x20Rose\x20when\x20you\x20are\x20angry.\x0aPowder\x20now\x20adds\x20turbulence\x20to\x20your\x20petals\x20when\x20you\x20are\x20angry.\x0aFixed\x20more\x20player\x20dupe\x20bugs.\x0a",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    "#4eae26",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    "appendChild",
    "Poison\x20Reduction",
    "reqFailed",
    "4oL8",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    "rewards",
    "right_align_petals",
    "#333",
    "2166409dMXIbC",
    "affectMobHealDur",
    "Third\x20Eye",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "Increases\x20flower\x27s\x20health\x20power.",
    "https://stats.hornex.pro/api/userCount",
    "#8f5db0",
    "continent_code",
    "fixed_name_size",
    "Arrow",
    "4th\x20April\x202024",
    "bqpdUNe",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    "hornex",
    "#a2eb62",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "pow",
    "avacado",
    "sword",
    "<div\x20class=\x22petal-icon\x22\x20",
    "p41E",
    "Ruined",
    "mouse2",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    "#d9511f",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    "shieldRegenPerSecF",
    "https://stats.hornex.pro/",
    ".angry-btn",
    "%/s",
    "<div\x20class=\x22chat-item\x22></div>",
    "fixedSize",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    ".username-input",
    "12OVuKwi",
    "year",
    "petalChromosome",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "Turtle",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "Sandstorm_5",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    "addEventListener",
    "\x20won\x20and\x20got\x20extra",
    ".game-stats-btn",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    "isSwastika",
    "userCount",
    "Sprite",
    "16th\x20July\x202023",
    "honeyRange",
    "isCentiBody",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "\x20XP",
    "#111",
    "breedPower",
    "(auto\x20reloading\x20in\x20",
    "Connected!",
    "#f54ce7",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    ".logout-btn",
    "nt.\x20H",
    "rgb(255,\x20230,\x2093)",
    "Sussy\x20Discord\x20uwu",
    "attachPetal",
    "redHealth",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    "Banana",
    "marginLeft",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    "*Swastika\x20health:\x2030\x20→\x2035",
    "#c76cd1",
    "player_id",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    "honeyDmg",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "ability",
    "fonts",
    "hsl(110,100%,50%)",
    "isProj",
    "arraybuffer",
    "metaData",
    "iReqUserProfile",
    "*Heavy\x20health:\x20500\x20→\x20600",
    "Yoba_1",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "27th\x20June\x202023",
    "3WRI",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    "dur",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "Much\x20heavier\x20than\x20your\x20mom.",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "absolute",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "0\x200",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    "beginPath",
    ".absorb-btn",
    "Worker\x20Ant",
    "Scorpion\x20redesign.",
    "miter",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    "encod",
    "honeyTile",
    "lightningDmgF",
    "absorb",
    "small",
    "*Hyper:\x20175+",
    "20th\x20July\x202023",
    "#d3c66d",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    "KeyC",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "data",
    "mousedown",
    "translate",
    "rgba(0,0,0,0.2",
    "Soaks\x20damage\x20over\x20time.",
    "Sunflower",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    "Honey\x20Range",
    "spinSpeed",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "#fbb257",
    "toLow",
    "builds",
    ".build-save-btn",
    "beaten\x20to\x20death",
    "redHealthTimer",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    "Account\x20imported!",
    "4th\x20September\x202023",
    "style=\x22background-position:\x20",
    "#a58368",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    "https://sandbox.hornex.pro",
    "translate(-50%,\x20",
    "\x0a17th\x20May\x202024\x0aMore\x20game\x20stats\x20are\x20shown\x20now:\x0a*Total\x20Time\x20Played\x0a*Total\x20Games\x20Played\x0a*Total\x20Kills\x0a*Total\x20Chat\x20Sent\x0a*Total\x20Accounts\x0aNumpad\x20keys\x20can\x20also\x20be\x20used\x20to\x20swap\x20petals\x20now.\x0aPress\x20K\x20to\x20toggle\x20keyboard\x20controls.\x0a",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    "5th\x20July\x202023",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    "GsP9",
    "onmouseup",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "boostStrength",
    "tail_outline",
    "#735b49",
    "mushroom",
    "\x20at\x20y",
    "*Light\x20damage:\x2013\x20→\x2012",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    "projSize",
    "INPUT",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "wave",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "*Yoba\x20health:\x20500\x20→\x20350",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    "stroke",
    "Unknown\x20message\x20id:\x20",
    "altKey",
    "hornex-pro_970x250",
    ".total-kills",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "rect",
    "4\x20yummy\x20poisonous\x20balls.",
    "Your\x20Profile",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    "Poop\x20colored\x20Ladybug.",
    "toDataURL",
    "Buffed\x20Lightsaber:",
    "spin",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "#ffe763",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "key",
    "isPlayer",
    "draw",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    "getBigUint64",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "sign",
    "135249DkEsVO",
    "OPEN",
    "#9e7d24",
    "Password\x20downloaded!",
    "hide_chat",
    "string",
    "e=\x22Yo",
    "#8d9acc",
    "#962921",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "soakTime",
    "isPoison",
    "<div>",
    "#c9b46e",
    "Cement",
    "petalSand",
    ".build-load-btn",
    "7th\x20February\x202024",
    "exp",
    "petalRock",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    "Ghost_2",
    "Sandbox",
    "respawnTimeTiers",
    "<div><span\x20stroke=\x22",
    "#fc9840",
    "day",
    "15807WcQReK",
    "\x22></div>\x0a\x09\x09",
    "Space",
    "IAL\x20c",
    "change_font",
    "VLa2",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    ".video",
    "healthIncrease",
    "Ghost_6",
    "absorbDamage",
    "center",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "It\x20burns.",
    "KeyA",
    "lineWidth",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "teal\x20",
    "fixed_player_health_size",
    "sqrt",
    "%;left:",
    "12th\x20November\x202023",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "uiCountGap",
    "Hornet_4",
    "KeyK",
    "mobId",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    "title",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "hasAbsorbers",
    "iReqAccountData",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "Sand",
    "#400",
    "ages.",
    "path",
    "hsl(60,60%,60%)",
    "files",
    "match",
    "angry",
    "Regenerates\x20health\x20when\x20consumed.",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    "https://ipapi.co/json/",
    "cmd",
    "*Cotton\x20health:\x208\x20→\x209",
    "Dragon_6",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "accountNotFound",
    "ENTERING!!",
    ".tabs",
    "reloadT",
    "hpAlpha",
    ".craft-btn",
    ".lottery",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "querySelector",
    "*Heavy\x20health:\x20450\x20→\x20500",
    "angleOffset",
    "reason:\x20",
    "Hyper",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "</option>",
    "flipDir",
    "iScore",
    "1st\x20February\x202024",
    "total",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "#bb771e",
    "<div\x20class=\x22btn\x20triep-btn\x22>\x0a\x09<span\x20stroke=\x22Triep.IO\x22></span>\x0a\x09<span\x20class=\x22small\x22\x20stroke=\x22Play\x20now!\x22></span>\x0a</div>",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "nSkOW4GRtW",
    "keydown",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "10QIdaPR",
    "cde9W5NdTq",
    "onEnd",
    ".show-population-cb",
    "Nigersaurus",
    "Soldier\x20Ant_6",
    "val",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "numAccounts",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    "sort",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    "discord\x20err:",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    ".find-user-input",
    "Ears",
    "contains",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    "https",
    "clientY",
    "Boomerang.",
    ".collected",
    "px)",
    "#ebda8d",
    "getFloat32",
    "#cecfa3",
    "*Epic:\x2075\x20→\x2065",
    "Hornet_1",
    "shootLightning",
    "FSoixsnA",
    "\x20no-icon\x22\x20",
    "drawDragon",
    "\x22></span>\x20<span\x20stroke=\x22•\x20",
    "player",
    "Soldier\x20Ant_5",
    "consumeProjDamage",
    ".bar",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    "\x22></div>\x0a\x09</div>",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    "petals!",
    "onmousedown",
    ";\x22\x20stroke=\x22",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    "Wave\x20changes:",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "Shield\x20Reuse\x20Cooldown",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "petalStick",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "shinyCol",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    "regenF",
    "div",
    "orb\x20a",
    "jellyfish",
    "Flower\x20Damage",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "Yoba\x20Egg",
    "23rd\x20January\x202024",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "hostname",
    "weight",
    ".scale-cb",
    "Taco",
    "Mob\x20",
    "removeT",
    ";-webkit-background-position:\x20",
    "antennae",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    "Fixed\x20Gem\x20glitch.",
    "zmkhtdVdSq",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    "users",
    ".data-search-result",
    "Dice",
    "*Bone\x20armor:\x208\x20→\x209",
    "#882200",
    "petalWave",
    "Username\x20claimed!",
    "mobile",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    "Failed\x20to\x20get\x20userCount!",
    "reverse",
    "*Snail\x20health:\x2045\x20→\x2050",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "application/json",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    "projSpeed",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    "textarea",
    "8th\x20July\x202023",
    "WPfQmmoXFW",
    ".claim-btn",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "#ff3333",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    "Petal\x20Slots",
    "marginTop",
    "isPortal",
    "\x20•\x20",
    "tail",
    "Beetle_1",
    "%;\x22\x20stroke=\x22",
    "dmca\x20it\x20m28!",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    "6th\x20August\x202023",
    "entRot",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    "expand",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "Former\x20student\x20of\x20Yoda.",
    "blur(10px)",
    "Has\x20fungal\x20infection\x20gg",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    "New\x20mob:\x20Dice.",
    "bezierCurveTo",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    "#cf7030",
    "#D2D1CD",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    "percent",
    "\x20ago",
    ".shop",
    "Need\x20to\x20be\x20Lvl\x20",
    "class=\x22chat-cap\x22",
    "Increases\x20petal\x20spin\x20speed.",
    "2nd\x20March\x202024",
    "RuinedLiberty",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    "/dlMob",
    "fireDamage",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "Centipede",
    "\x22></span></div>\x0a\x09</div>",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    "checked",
    "projType",
    "onmouseleave",
    "\x22>Page\x20#",
    "<div\x20class=\x22dialog\x20tier-",
    "#393cb3",
    "mobPetaler",
    "Spider\x20Cave",
    "</div><div\x20class=\x22log-line\x22></div>",
    "#a760b1",
    "Added\x20video\x20ad.",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "Dark\x20Ladybug",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    "points",
    "#2e933c",
    "#b28b29",
    "innerHTML",
    "Yin\x20Yang",
    "Powder",
    "18th\x20July\x202023",
    ".shop-info",
    "hasSpiderLeg",
    "https://triep.io",
    "\x20players\x20•\x20",
    "*Reduced\x20HP\x20depletion.",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    "#7d5098",
    "weedSeed",
    ".privacy-btn",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "#ff7380",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "Fossil",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "flowerPoison",
    "#eb4755",
    "Ladybug",
    "Added\x20banner\x20ads.",
    "Server\x20side\x20performance\x20improvements.",
    "Absorb",
    "dragon",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    ".minimap-cross",
    "iPercent",
    "hasSwastika",
    "3336680ZmjFAG",
    "updatePos",
    "***",
    "Missile\x20Health",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "US\x20#1",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "yellowLadybug",
    "getUint32",
    "]\x22></div>",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "ANKUAsHKW5LZmq",
    "Queen\x20Ant",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    "background",
    "height",
    "ultraPlayers",
    "Continue",
    "startPreRoll",
    "6th\x20November\x202023",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "Spawns",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "host",
    "Magnet",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    "More\x20wave\x20changes:",
    "petalSkull",
    "bolder\x20",
    "*Gas\x20health:\x20250\x20→\x20200",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "userAgent",
    "rgb(222,\x2031,\x2031)",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    "Rock_5",
    ".timer",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    "Extra\x20Vision",
    ".stats-btn",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    "Bounces",
    "2nd\x20July\x202023",
    "petalAntidote",
    "Yoba",
    "Honey\x20Damage",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    "active",
    "petalSword",
    ";position:absolute;top:",
    "yoba",
    ".stats\x20.dialog-content",
    "<div\x20style=\x22color:\x20",
    "*Gas\x20poison:\x2030\x20→\x2040",
    "Failed\x20to\x20find\x20region.",
    "*Arrow\x20damage:\x204\x20→\x205",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "render",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "1167390UrVkfV",
    ".max-wave",
    "isAggressive",
    "#fff",
    "dir",
    "undefined",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    "wrecked",
    "icBdNmoEta",
    "Soldier\x20Ant",
    "\x0a\x09</div>",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "*Ultra:\x201-5",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    "totalKills",
    "3YHM",
    "left",
    "subscribe\x20for\x20999\x20super\x20petals",
    "Yoba_3",
    "honeyDmgF",
    "countTiers",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "ArrowLeft",
    "%</option>",
    "#5ab6ab",
    "canvas",
    "arc",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "Beetle_2",
    "WQxdVSkKW5VcJq",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    "\x20accounts",
    "28th\x20June\x202023",
    "#a17c4c",
    "rgb(237\x20236\x2061)",
    "isRectHitbox",
    "gridColumn",
    "uiScale",
    "=([^;]*)",
    "mouse0",
    "successful",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "baseSize",
    "EU\x20#1",
    ".flower-stats",
    ".mob-gallery\x20.dialog-content",
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    "Added\x20level\x20up\x20reward\x20table.",
    ".box",
    ".claimer",
    "petalCactus",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "Fire\x20Ant\x20Hole",
    "#a82a00",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "#5ef64f",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "erCas",
    "waveShowTimer",
    "focus",
    "WQ7dTmk3W6FcIG",
    "\x20in\x20view\x20/\x20",
    "EU\x20#2",
    "#c8a826",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    "Nerfed\x20Ant\x20Holes:",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "canShowDrops",
    "Flower\x20Health",
    "innerHeight",
    "petalCotton",
    "worldH",
    "shadowBlur",
    "split",
    "connect",
    "<div\x20stroke=\x22Last\x20Updated:\x2010s\x20ago\x22></div>",
    "#ce79a2",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "settings",
    "centipedeBody",
    "onclose",
    "Spider_4",
    "absorbPetalEl",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "Connecting\x20to\x20",
    "murdered",
    "\x20petals",
    "isDevelopmentMode",
    "dataTransfer",
    "Added\x20Discord\x20login.",
    "petalWing",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    "\x0a1st\x20June\x202024\x0aAdded\x20Hornex\x20Sandbox\x20link.\x0a",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    "#feffc9",
    "rkJNdF",
    "spawnOnDie",
    "\x20Pym\x20Particle.",
    ".petal",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "usernameClaimed",
    "tile_",
    "<div\x20class=\x22chat-name\x22></div>",
    "Beetle\x20Egg",
    "stickbug",
    ".terms-btn",
    "730910PSdqIx",
    "rgb(255,\x2043,\x20117)",
    "keyInvalid",
    "isBoomerang",
    "WR7dPdZdQXS",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    "getHurtColor",
    "<div\x20class=\x22spinner\x22></div>",
    "endsWith",
    "Error\x20refreshing\x20ad.",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "deg",
    "rotate(",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "25th\x20July\x202023",
    "#ffe667",
    "*Cement\x20health:\x2080\x20→\x20100",
    "Nerfed\x20Spider\x20Yoba.",
    "spider",
    "craftResult",
    "update",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "*Fire\x20health:\x2070\x20→\x2080",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    "webSizeTiers",
    "Hornet_5",
    "zert.pro",
    "#fcfe04",
    "progress",
    "Petal\x20Weight",
    "Duration",
    "Scorpion",
    "onresize",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "isLightsaber",
    "uniqueIndex",
    "#5b4d3c",
    "#c69a2c",
    "\x20(Lvl\x20",
    "Lightsaber",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    ".absorb\x20.dialog-header\x20span",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "*Health:\x20100\x20→\x20120",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "231675PITshu",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    "WP10rSoRnG",
    "bone_outline",
    "#775d3e",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    "evenodd",
    "https://discord.gg/zZsUUg8rbu",
    "petalRose",
    "[censored]",
    "cloneNode",
    "long",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "gem",
    "3L$0",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "changedTouches",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    ".active",
    "\x22\x20stroke=\x22",
    "d.\x20Pr",
    "petalYinYang",
    "zvNu",
    "moveTo",
    "\x20You\x20",
    "waveStarting",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    "*Turtle\x20health:\x20600\x20→\x20900",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "Antidote",
    "translate(-50%,",
    "1st\x20July\x202023",
    "Sandstorm_2",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    "*Snail\x20Health:\x20180\x20→\x20120",
    "petalArrow",
    "#fdda40",
    "#353331",
    "oiynC",
    "*Halo\x20now\x20stacks.",
    "<div\x20class=\x22chat-text\x22>",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "show_helper",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "renderOverEverything",
    "iCraft",
    "style=\x22color:",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "locat",
    ".petal-count",
    "adplayer-not-found",
    "button",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "&quot;",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "*Banana\x20health:\x20170\x20→\x20400",
    "object",
    "nProg",
    "consumeTime",
    "breedRange",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "*Rock\x20health:\x2060\x20→\x20120",
    "targetPlayer",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    "hsl(110,100%,10%)",
    "getRandomValues",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22\x20style=\x22width:\x20200px;\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Join\x20Discord!\x22></div>\x0a\x09\x09\x0a\x09\x09\x09<div\x20stroke=\x22Hornexcord\x20is\x20the\x20new\x20main\x20server\x20now.\x22></div>\x0a\x0a\x09\x09\x09<div\x20style=\x22display:\x20flex;\x0a\x20\x20\x20\x20grid-gap:\x205px;\x0a\x20\x20\x20\x20margin-top:\x207px;\x0a\x20\x20\x20\x20flex-direction:\x20column;\x0a\x20\x20\x20\x20align-items:\x20center;\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20hornexcord-btn\x20rainbow-bg\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Hornexcord\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20zertcord-btn\x22\x20style=\x22font-size:\x2010px;\x0a\x20\x20\x20\x20padding:\x205px;background:\x20#7722c3\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Zertcord\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "cuYF",
    "indexOf",
    "substr",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    "19th\x20January\x202024",
    "warn",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    "></di",
    "Tiers",
    ".absorb",
    "New\x20petal:\x20Sponge",
    "Created\x20changelog.",
    "#fbdf26",
    "lieOnGroundTime",
    "KeyL",
    "*Increased\x20drop\x20rates.",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    "#4e3f40",
    ".progress",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "*Powder\x20damage:\x2015\x20→\x2020",
    "are\x20p",
    "canRender",
    "extraRangeTiers",
    "retardDuration",
    "isBooster",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "x.pro",
    "#be342a",
    "moveSpeed",
    "uiY",
    "petDamageFactor",
    "append",
    "petCount",
    "reload",
    "number",
    "Breaths\x20fire.",
    "#8b533f",
    "onkeyup",
    "3rd\x20February\x202024",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    "iSwapPetal",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "blue",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    "sq8Ig3e",
    "onclick",
    "Checking\x20username\x20availability...",
    "hsla(0,0%,100%,0.25)",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "clip",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    "No\x20username\x20provided.",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "fixed_mob_health_size",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "*Iris\x20poison:\x2045\x20→\x2050",
    "isSleeping",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "WP4hW755jCokWRdcKchdT3ui",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "other",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    "12th\x20July\x202023",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    "petalPea",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "W6rnWPrGWPfdbxmAWOHa",
    "#347918",
    "WR7cQCkf",
    "Spider_2",
    ".absorb-clear-btn",
    "wss://us2.hornex.pro",
    "qCkBW5pcR8kD",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    "petalMissile",
    "url",
    ".rewards",
    "\x20&\x20",
    ".inventory",
    ".play-btn",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    "petalLight",
    "respawnTime",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    "Poo",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "Poop\x20Health",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "Fixed\x20Rice.",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "<div\x20stroke=\x22",
    "sadT",
    "Summons\x20the\x20power\x20of\x20wind.",
    "lastElementChild",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "#444444",
    "petalPoo",
    "mobsEl",
    "name",
    "makeFire",
    "oninput",
    "resize",
    "6th\x20October\x202023",
    "Leaf",
    "Rock_4",
    "Basic",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "petalSoil",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "2572iLOAUb",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    "Mob\x20Agro\x20Range",
    "(?:^|;\x5cs*)",
    "#328379",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    "*Cotton\x20health:\x2010\x20→\x2012",
    "toLocaleString",
    "Missile",
    "Super",
    "210ZoZRjI",
    "hasAntenna",
    "lightningBounces",
    "Importing\x20data\x20file:\x20",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "iPing",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    ".loader",
    ".lottery-users",
    "\x20petal",
    "WP3dRYddTJC",
    "score",
    "1998256OxsvrH",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    "petalBone",
    ".changelog\x20.dialog-content",
    "rad)",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "#4040fc",
    "drawShell",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    "%!Ew",
    "#ff63eb",
    "petals",
    "Fire\x20Duration",
    "anti_spam",
    "Breed\x20Range",
    ".stats",
    "Wave",
    "#503402",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "poopPath",
    "halo",
    "#ceea33",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "*Rice\x20damage:\x204\x20→\x205",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "low_quality",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    "#6265eb",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x22",
    "*Snail\x20damage:\x2020\x20→\x2025",
    "Heal\x20Affect\x20Duration",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    "static",
    "*2%\x20craft\x20success\x20rate.",
    "randomUUID",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    "hsla(0,0%,100%,0.5)",
    "Ghost_7",
    "queen",
    "#fff0b8",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "WOziW7b9bq",
    "iJoin",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    "#d6b936",
    "s...)",
    ".menu",
    "regenAfterHp",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "imageSmoothingEnabled",
    "ignore\x20if\x20u\x20already\x20subbed",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    "Web\x20Radius",
    "Petal\x20",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    "keyCheckFailed",
    ".ad-blocker",
    "spiderYoba",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "u\x20are",
    "petalIris",
    "Increased\x20map\x20size\x20by\x2030%.",
    "<span\x20style=\x22color:",
    "#554213",
    "des",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "*Super:\x201%\x20→\x201.5%",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "Account\x20import/export\x20UI\x20redesigned.",
    "sad",
    "iDepositPetal",
    "petalSnail",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    "Ghost_3",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    ".absorb-rarity-btns",
    "petalDrop_",
    "cookie",
    "BrnPE",
    "Snail",
    "/dlSprite",
    ".build-petals",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    "Added\x20Waves.",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    "remove",
    "clientWidth",
    "#e6a44d",
    "curve",
    "buffer",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "projDamageF",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    "spiderLeg",
    "#b0c0ff",
    "://ho",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    ".discord-user",
    "writeText",
    "3220DFvaar",
    "doShow",
    "pickupRangeTiers",
    "<div\x20class=\x22data-top-area\x22>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Current\x20Page:\x22></span>\x0a\x09\x09\x09\x09<select\x20tabindex=\x22-1\x22></select>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Search:\x22></span>\x0a\x09\x09\x09\x09<input\x20class=\x22textbox\x20data-search\x22\x20type=\x22text\x22\x20placeholder=\x22Enter\x20value...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<div\x20class=\x22data-search-result\x22\x20style=\x22display:none;\x22></div>\x0a\x09\x09</div>",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    ".gamble-petals-btn",
    "drops",
    "Level\x20",
    "Shrinker",
    "lineTo",
    "4th\x20August\x202023",
    ".dialog-content",
    ".gamble-prediction",
    "round",
    "LEAVE\x20ZONE!!",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "Soil",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Yoba_4",
    "\x20ctxs\x20(",
    "15th\x20June\x202023",
    "KeyR",
    "mushroomPath",
    "Pill\x20affects\x20Arrow\x20now.",
    "passiveBoost",
    "Provide\x20a\x20name\x20dummy.",
    ".common",
    "Mob\x20Rotation",
    "petal_",
    "marginBottom",
    "26th\x20September\x202023",
    "isHudPetal",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    "petalMushroom",
    "pedoxMain",
    "Gas",
    ".\x20Hac",
    "Common",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "#f55",
    "babyAnt",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    ".xp",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    "totalGamesPlayed",
    "Pill",
    "#33a853",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2048\x2048\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x20\x20<title>data-source-solid</title>\x0a\x20\x20<g\x20id=\x22Layer_2\x22\x20data-name=\x22Layer\x202\x22>\x0a\x20\x20\x20\x20<g\x20id=\x22invisible_box\x22\x20data-name=\x22invisible\x20box\x22>\x0a\x20\x20\x20\x20\x20\x20<rect\x20width=\x2248\x22\x20height=\x2248\x22\x20fill=\x22none\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20\x20\x20<g\x20id=\x22icons_Q2\x22\x20data-name=\x22icons\x20Q2\x22>\x0a\x20\x20\x20\x20\x20\x20<path\x20d=\x22M46,9c0-6.8-19.8-7-22-7S2,2.2,2,9v7c0,.3,1.1,1.8,5.2,3.4h.3a40.3,40.3,0,0,0,8.6,2A65.6,65.6,0,0,0,24,22a65.6,65.6,0,0,0,7.9-.5,40.3,40.3,0,0,0,8.6-2h.3C44.9,17.8,46,16.3,46,16V9.3h0ZM2,31.3V39c0,6.8,19.8,7,22,7s22-.2,22-7V31.3C41.4,34.1,33.3,36,24,36S6.6,34.1,2,31.3Zm43.7-9.8a22.5,22.5,0,0,1-4.9,2.1A54.8,54.8,0,0,1,24,26,54.8,54.8,0,0,1,7.2,23.6a22.5,22.5,0,0,1-4.9-2.1L2,21.3V26c0,.3,1.2,1.9,5.5,3.5A50.2,50.2,0,0,0,24,32a50.2,50.2,0,0,0,16.5-2.5C44.8,27.9,46,26.3,46,26V21.3Z\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20</g>\x0a</svg>",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    "\x27s\x20Profile",
    "oceed",
    "#634418",
    "hornet",
    "webSize",
    "?dev",
    "drawIcon",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "Dragon\x20Nest",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    "shift",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "side",
    "Halo",
    "5th\x20September\x202023",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    "timePlayed",
    "neutral",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    "onmessage",
    "ready",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "consumeProjHealthF",
    "*Swastika\x20health:\x2020\x20→\x2025",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "Added\x20Global\x20Leaderboard.",
    "\x20radians",
    "hyperPlayers",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "Sandstorm_6",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    "petalAntEgg",
    "close",
    "Spider\x20Yoba",
    "#555",
    ".lottery-rarities",
    "scale",
    "isPassiveAggressive",
    "1rrAouN",
    ".container",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    "moveCounter",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    ".zertcord-btn",
    "fontFamily",
    "#32a852",
    "poisonT",
    ".copy-btn",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "accountData",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "Balancing:",
    "Wave\x20Ending...",
    "n\x20war",
    "right",
    "slayed",
    "Missile\x20Damage",
    ".petal-rows",
    "Heart",
    "backgroundColor",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "[data-icon]",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "\x22></span>\x0a\x09\x09\x09</div>",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "Added\x201\x20AS\x20lobby.",
    "off",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    ".lb",
    "d8k3BqDKF8o0WPu",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    "Changes\x20to\x20anti-lag\x20system:",
    "Spawn\x20zone\x20changes:",
    "position",
    ".settings-btn",
    "shadowColor",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    "13th\x20July\x202023",
    "encode",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    "Yoba_6",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    ".username-area",
    "projDamage",
    "Passive\x20Shield",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "#724c2a",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    "insertBefore",
    "worldW",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    "<div\x20style=\x22width:100%;\x20text-align:center;\x22></div>",
    "Petaler",
    "nAngle",
    "WOpcHSkuCtriW7/dJG",
    "#79211b",
    "*Snail\x20damage:\x2010\x20→\x2015",
    "Added\x20Leave\x20Game\x20button.",
    "Stinger",
    "\x22\x20style=\x22color:",
    "toString",
    "stats",
    "petalRockEgg",
    "children",
    "#a07f53",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    ".collected-rarities",
    "Claiming\x20secret\x20skin...",
    ".screen",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    "#d0bb55",
    "dandelion",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    "start",
    "#cb37bf",
    "Congratulations!",
    "petalDice",
    "http",
    "4th\x20July\x202023",
    "krBw",
    "cantPerformAction",
    ".insta-btn",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "lastResizeTime",
    ".sad-btn",
    ".discord-avatar",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    "2nd\x20August\x202023",
    "#924614",
    "fireTime",
    "mood",
    "deadT",
    "#ff4f4f",
    "Missile\x20Poison",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    "bar",
    "has\x20ended.",
    "\x20clie",
    "ount\x20",
    "Removed\x20disclaimer\x20from\x20menu.",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "ned.\x22",
    "petalBubble",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    "prototype",
    "bruh",
    "9th\x20August\x202023",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    "deleted",
    "3m^(",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    "petalSwastika",
    "#82b11e",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "shell",
    "iReqGlb",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    "Nitro\x20Boost",
    "Stick\x20does\x20not\x20expand\x20now.",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    "DMCA-ed",
    ".craft-rate",
    "kicked",
    "Press\x20G\x20to\x20toggle\x20grid.",
    "#cfcfcf",
    "<div\x20class=\x22btn\x20tier-",
    ".discord-area",
    "Soldier\x20Ant_3",
    "https://www.youtube.com/@gowcaw97",
    "ing\x20o",
    "petalCoffee",
    "New\x20mob:\x20Beehive.",
    "Last\x20Updated:\x20",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    "healthIncreaseF",
    ".censor-cb",
    "Yoba_5",
    "breedTimerAlpha",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    "*Taco\x20healing:\x208\x20→\x209",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "eu_ffa",
    "719574lHbJUW",
    "outlineCount",
    "*Heavy\x20damage:\x209\x20→\x2010",
    "\x22\x20stroke=\x22Hornex\x20Sandbox:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Singleplayer\x20Hornex\x20with\x20admin\x20commands\x20and\x20access\x20to\x20unlimited\x20petals.\x20Might\x20be\x20fun\x20for\x20testing\x20random\x20stuff.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x2030+\x20dev\x20commands\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Access\x20to\x20all\x20rarity\x20petals!\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Craft\x20billions\x20of\x20petals!\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Sussy\x20Map\x20Editor\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Some\x20new\x20mobs\x20&\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Go\x20check\x20it\x20out!\x22></div>\x0a\x09</div>",
    "petalAvacado",
    "fixAngle",
    "nLrqsbisiv0SrmoD",
    "WRbjb8oX",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "shieldHpLosePerSec",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    "*Yoba\x20Egg\x20buff.",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "*Snail\x20health:\x2040\x20→\x2045",
    "#853636",
    "#38c125",
    "restore",
    "#dbab2e",
    "Luxurious\x20mansion\x20of\x20ants.",
    "centipedeBodyDesert",
    "els",
    "Antennae",
    "execCommand",
    "groups",
    "none",
    "gambleList",
    "WRS8bSkQW4RcSLDU",
    "<div\x20class=\x22slot\x22></div>",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    "\x0a4th\x20May\x202024\x0aFixed\x20a\x20player\x20dupe\x20bug.\x20\x0aBalances:\x0a*Taco\x20healing:\x209\x20→\x2010\x0a*Sunflower\x20shield:\x201\x20→\x202.5\x0a*Shell\x20shield:\x208\x20→\x2012\x0a*Buffed\x20Yoba\x20Egg\x20by\x2050%\x0a",
    "turtleF",
    ".nickname",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "New\x20mob:\x20Sponge",
    "fixed",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    ".changelog",
    "babyAntFire",
    ".leave-btn",
    "passive",
    "#709d45",
    "petalDandelion",
    "21st\x20June\x202023",
    "iLeaveGame",
    "show_bg_grid",
    "1st\x20April\x202024",
    "#39b54a",
    "#cdbb48",
    "getAttribute",
    ".hitbox-cb",
    "translate(calc(",
    "petalCement",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "opera",
    "<div\x20class=\x22btn\x22>\x0a\x09\x09\x09\x09<span\x20stroke=\x22",
    "toLowerCase",
    "click",
    "*Super:\x205-15",
    "User",
    "#b05a3c",
    "copy",
    "mobGallery",
    "scorpion",
    "\x20petals\x22></div>\x0a\x09\x09\x09\x09\x09</div>",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "\x20FPS\x20/\x20",
    "shlong",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    "n8oKoxnarXHzeIzdmW",
    "clearRect",
    "antHole",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "*Bone\x20armor:\x205\x20→\x206",
    "--angle:",
    ".max-score",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    "Armor",
    "count",
    "isShiny",
    "\x20+\x20",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    "shieldRegenPerSec",
    "Statue",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "readyState",
    "Wig",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "centipedeBodyPoison",
    "Tumbleweed",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "clipboard",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "floor",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "petHealF",
    "\x22></div>\x0a\x09\x09\x09",
    "Preroll\x20state:\x20",
    "<option\x20value=\x22",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    "LavaWater",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "username",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "tooltipDown",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "Grapes",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "Ultra\x20Players\x20(200+)",
    "ontouchend",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "10th\x20July\x202023",
    "hide-chat",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    ".petals-picked",
    "tCkxW5FcNmkQ",
    "Bone",
    ".show-scoreboard-cb",
    "#d3d14f",
    "*Bone\x20armor:\x207\x20→\x208",
    "8URl",
    "New\x20mob:\x20Tumbleweed.",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "Faster",
    "petalStr",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "filter",
    "makeSponge",
    "*Hyper:\x20240",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "descColor",
    "3rd\x20July\x202023",
    "Invalid\x20mob\x20name:\x20",
    "bubble",
    "maxLength",
    "addCount",
    "<div\x20class=\x22data-search-item\x22>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22#",
    "blur",
    "max",
    "seed",
    "pro",
    "Super\x20Players",
    "Lightning\x20damage:\x2012\x20→\x208",
    "Passively\x20regenerates\x20shield.",
    ".level",
    "\x0a14th\x20August\x202024\x0aNew\x20Discord\x20server\x20link:\x20Hornexcord.\x0aA\x20lot\x20of\x20updates\x20done\x20to\x20Sandbox.\x20Go\x20try\x20it\x20out.\x0a",
    "petalStarfish",
    ".chat-input",
    "ArrowUp",
    "version",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    "toUpperCase",
    "s\x20can",
    "\x20petals\x22></div>",
    "text/plain;charset=utf-8;",
    "runSpeed",
    "getElementById",
    "Spider",
    "lightblue",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    ".tooltip",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    "qmklWO4",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    ".rewards-btn",
    "they\x20copied\x20florr\x20code\x20omg!!",
    "#288842",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    "Soak\x20Duration",
    "*Rose\x20heal:\x2013\x20→\x2011",
    "Health",
    "createdAt",
    "petalSuspill",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "useTimeTiers",
    "lobbyClosing",
    "no\x20sub,\x20no\x20gg",
    "14dafFDX",
    "code",
    "#a5d141",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    "Added\x20another\x20AS\x20lobby.",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "#b9baba",
    "Ants\x20redesign.",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "📜\x20",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "Increases\x20petal\x20pickup\x20range.",
    "\x0a\x0a\x09\x09\x09",
    "sortGroupItems",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    ".download-btn",
    "\x20stroke=\x22",
    "NHkBqi",
    "#5849f5",
    "fromCharCode",
    "#ffd363",
    "TC0B",
    "desktop",
    "canRemove",
    "executed",
    "centipedeHeadDesert",
    "#9fab2d",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    "*Damage:\x204\x20→\x206",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    ";-moz-background-position:\x20",
    "petalDragonEgg",
    ".mob-gallery",
    "KeyM",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    "log",
  ];
  a = function () {
    return Cy;
  };
  return a();
}
