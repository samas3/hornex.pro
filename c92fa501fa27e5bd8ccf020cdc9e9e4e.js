const $ = (i) => document.getElementById(i);
const $_ = (i) => document.querySelector(i);
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
        this.version = '2.2';
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
            '/server': 'get current server',
            '/wave': 'get wave progress',
            '/bind <module> <key>': 'bind a module to the specific key',
            '/bind <module> clear': 'clear a module\'s keybind',
            '/open': 'open the config gui',
            '/delBuild <id>': 'delete a build',
            '/viewPetal <id>': 'view a petal(add it into Build #49)',
            '/viewMob <id>': 'view a mob(add it to zone mobs)',
        };
        this.hp = 0;
        this.ingame = false;
        this.player = {
            name: "",
            entity: null
        };
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
        this.loadModule();
    }
    onload(){
        this.addChat(`${this.name} enabled!`);
        this.addChat('Type /help in chat box to get help');
        this.register();
        this.ingame = true;
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
    getPos(){
        let x = this.player.entity.targetPlayer.nx;
        let y = this.player.entity.targetPlayer.ny;
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
        console.log(i['name'].replaceAll(' ', ''))
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
        this.addChat(`You died @ ${this.getPos().join(', ')}`, '#fff')
        if(!quitBtn.classList.contains('red')){
            this.addChat('Respawning', '#fff');
            quitBtn.onclick();
        }else{
            this.addChat('Not respawning, you are in Waveroom', '#fff');
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
                        //hack.log(name + ' ' + content);
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
    updateMob(mob){
      if(mob['isShiny']){
        let x = Math.floor(mob['nx'] / 500), y = Math.floor(mob['ny'] / 500);
        let tier = mob['tierStr'], type = this.moblst, cur;
        for(const i of type[mob['tier']]){
          if(i['type'] == mob['type']) cur = i;
        }
        let name = cur['uiName'];
        this.addChat(`A shiny ${tier} ${name} spawned at ${x}, ${y}`, '#ff7f50');
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
hack.loadStatus();
(function (c, d) {
  const ut = b,
    e = c();
  while (!![]) {
    try {
      const f =
        (-parseInt(ut(0x77b)) / 0x1) * (parseInt(ut(0x42a)) / 0x2) +
        (-parseInt(ut(0x4bd)) / 0x3) * (parseInt(ut(0xb7c)) / 0x4) +
        (-parseInt(ut(0x375)) / 0x5) * (parseInt(ut(0x68f)) / 0x6) +
        (-parseInt(ut(0x72f)) / 0x7) * (parseInt(ut(0x8b3)) / 0x8) +
        parseInt(ut(0xa4d)) / 0x9 +
        -parseInt(ut(0x390)) / 0xa +
        parseInt(ut(0xbe0)) / 0xb;
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0x87192),
  (() => {
    const uu = b;
    var cF = 0x2710,
      cG = 0x1e - 0x1,
      cH = { ...cU(uu(0xa08)), ...cU(uu(0x870)) },
      cI = 0x93b,
      cJ = 0x10,
      cK = 0x3c,
      cL = 0x10,
      cM = 0x3,
      cN = /^[a-zA-Z0-9_]+$/,
      cO = /[^a-zA-Z0-9_]/g,
      cP = cU(uu(0xd8a)),
      cQ = cU(uu(0x861)),
      cR = cU(uu(0x1b8)),
      cS = cU(uu(0xdbb)),
      cT = cU(uu(0xbb4));
    function cU(r5) {
      const uv = uu,
        r6 = r5[uv(0xc24)]("\x20"),
        r7 = {};
      for (let r8 = 0x0; r8 < r6[uv(0xc60)]; r8++) {
        r7[r6[r8]] = r8;
      }
      return r7;
    }
    var cV = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cW = {};
    (cW[uu(0x4a1)] = 0x0), (cW[uu(0xb59)] = 0x1), (cW[uu(0x2f7)] = 0x2);
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
    function d1(r5) {
      const uw = uu;
      return 0x14 * Math[uw(0xb54)](r5 * 1.05 ** (r5 - 0x1));
    }
    var d2 = [
      0x1, 0x5, 0x32, 0x1f4, 0x2710, 0x7a120, 0x2faf080, 0x12a05f200,
      0xe8d4a51000,
    ];
    function d3(r5) {
      let r6 = 0x0,
        r7 = 0x0;
      while (!![]) {
        const r8 = d1(r6 + 0x1);
        if (r5 < r7 + r8) break;
        (r7 += r8), r6++;
      }
      return [r6, r7];
    }
    function d4(r5) {
      const ux = uu;
      let r6 = 0x5,
        r7 = 0x5;
      while (r5 >= r7) {
        r6++, (r7 += Math[ux(0xd8d)](0x1e, r7));
      }
      return r6;
    }
    function d5(r5) {
      const uy = uu;
      return Math[uy(0x3a4)](0xf3, Math[uy(0xd8d)](r5, 0xc7) / 0xc8);
    }
    function d6() {
      return d7(0x100);
    }
    function d7(r5) {
      const r6 = Array(r5);
      while (r5--) r6[r5] = r5;
      return r6;
    }
    var d8 = cU(uu(0x1db)),
      d9 = Object[uu(0xd6d)](d8),
      da = d9[uu(0xc60)] - 0x1,
      db = da;
    function dc(r5) {
      const uz = uu,
        r6 = [];
      for (let r7 = 0x1; r7 <= db; r7++) {
        r6[uz(0x7b8)](r5(r7));
      }
      return r6;
    }
    const dd = {};
    (dd[uu(0x2d7)] = 0x0),
      (dd[uu(0x5e3)] = 0x1),
      (dd[uu(0x5dd)] = 0x2),
      (dd[uu(0x3f2)] = 0x3),
      (dd[uu(0x499)] = 0x4),
      (dd[uu(0x2d3)] = 0x5),
      (dd[uu(0x727)] = 0x6),
      (dd[uu(0x1e3)] = 0x7),
      (dd[uu(0x68c)] = 0x8);
    var de = dd;
    function df(r5, r6) {
      const uA = uu;
      return Math[uA(0x3a4)](0x3, r5) * r6;
    }
    const dg = {};
    (dg[uu(0x909)] = cR[uu(0xb87)]),
      (dg[uu(0x801)] = uu(0xb93)),
      (dg[uu(0x423)] = 0xa),
      (dg[uu(0x308)] = 0x0),
      (dg[uu(0xd8e)] = 0x1),
      (dg[uu(0x459)] = 0x1),
      (dg[uu(0xe25)] = 0x3e8),
      (dg[uu(0xa9d)] = 0x0),
      (dg[uu(0xe1e)] = ![]),
      (dg[uu(0xe18)] = 0x1),
      (dg[uu(0xe64)] = ![]),
      (dg[uu(0xbd7)] = 0x0),
      (dg[uu(0xa4e)] = 0x0),
      (dg[uu(0xa78)] = ![]),
      (dg[uu(0x5dc)] = 0x0),
      (dg[uu(0x542)] = 0x0),
      (dg[uu(0x3a6)] = 0x0),
      (dg[uu(0x610)] = 0x0),
      (dg[uu(0x468)] = 0x0),
      (dg[uu(0xa4c)] = 0x0),
      (dg[uu(0x9dd)] = 0x1),
      (dg[uu(0x576)] = 0xc),
      (dg[uu(0x93c)] = 0x0),
      (dg[uu(0x4c1)] = ![]),
      (dg[uu(0x974)] = void 0x0),
      (dg[uu(0xb0e)] = ![]),
      (dg[uu(0x62f)] = 0x0),
      (dg[uu(0x99a)] = ![]),
      (dg[uu(0x5fd)] = 0x0),
      (dg[uu(0x5aa)] = 0x0),
      (dg[uu(0xb3b)] = ![]),
      (dg[uu(0x8e2)] = 0x0),
      (dg[uu(0x7c9)] = 0x0),
      (dg[uu(0xe2c)] = 0x0),
      (dg[uu(0x241)] = ![]),
      (dg[uu(0x78a)] = 0x0),
      (dg[uu(0x769)] = ![]),
      (dg[uu(0x165)] = ![]),
      (dg[uu(0x382)] = 0x0),
      (dg[uu(0x88e)] = 0x0),
      (dg[uu(0xccd)] = 0x0),
      (dg[uu(0x597)] = ![]),
      (dg[uu(0x107)] = 0x1),
      (dg[uu(0xd01)] = 0x0),
      (dg[uu(0xcc8)] = 0x0),
      (dg[uu(0x860)] = 0x0),
      (dg[uu(0x41d)] = 0x0),
      (dg[uu(0xaba)] = 0x0),
      (dg[uu(0xe59)] = 0x0),
      (dg[uu(0xd68)] = 0x0),
      (dg[uu(0xd30)] = 0x0),
      (dg[uu(0x8e7)] = 0x0),
      (dg[uu(0xd2f)] = 0x0),
      (dg[uu(0x29f)] = 0x0),
      (dg[uu(0xa2d)] = 0x0),
      (dg[uu(0x275)] = 0x0),
      (dg[uu(0x8a8)] = 0x0),
      (dg[uu(0x43a)] = ![]),
      (dg[uu(0x2e2)] = 0x0),
      (dg[uu(0xe45)] = 0x0),
      (dg[uu(0x6fa)] = 0x0);
    var dh = dg;
    const di = {};
    (di[uu(0x670)] = uu(0xce8)),
      (di[uu(0x801)] = uu(0x482)),
      (di[uu(0x909)] = cR[uu(0xb87)]),
      (di[uu(0x423)] = 0x9),
      (di[uu(0xd8e)] = 0xa),
      (di[uu(0x459)] = 0xa),
      (di[uu(0xe25)] = 0x9c4);
    const dj = {};
    (dj[uu(0x670)] = uu(0xd60)),
      (dj[uu(0x801)] = uu(0x9f9)),
      (dj[uu(0x909)] = cR[uu(0xca2)]),
      (dj[uu(0x423)] = 0xd / 1.1),
      (dj[uu(0xd8e)] = 0x2),
      (dj[uu(0x459)] = 0x37),
      (dj[uu(0xe25)] = 0x9c4),
      (dj[uu(0xa9d)] = 0x1f4),
      (dj[uu(0xe64)] = !![]),
      (dj[uu(0x8a7)] = 0x28),
      (dj[uu(0xa4e)] = Math["PI"] / 0x4);
    const dk = {};
    (dk[uu(0x670)] = uu(0x81e)),
      (dk[uu(0x801)] = uu(0x947)),
      (dk[uu(0x909)] = cR[uu(0x65c)]),
      (dk[uu(0x423)] = 0x8),
      (dk[uu(0xd8e)] = 0x5),
      (dk[uu(0x459)] = 0x5),
      (dk[uu(0xe25)] = 0xdac),
      (dk[uu(0xa9d)] = 0x3e8),
      (dk[uu(0xbd7)] = 0xb),
      (dk[uu(0x241)] = !![]);
    const dl = {};
    (dl[uu(0x670)] = uu(0xaad)),
      (dl[uu(0x801)] = uu(0x362)),
      (dl[uu(0x909)] = cR[uu(0xa2c)]),
      (dl[uu(0x423)] = 0x6),
      (dl[uu(0xd8e)] = 0x5),
      (dl[uu(0x459)] = 0x5),
      (dl[uu(0xe25)] = 0xfa0),
      (dl[uu(0xe1e)] = !![]),
      (dl[uu(0xe18)] = 0x32);
    const dm = {};
    (dm[uu(0x670)] = uu(0xb37)),
      (dm[uu(0x801)] = uu(0x824)),
      (dm[uu(0x909)] = cR[uu(0xd0d)]),
      (dm[uu(0x423)] = 0xb),
      (dm[uu(0xd8e)] = 0xc8),
      (dm[uu(0x459)] = 0x1e),
      (dm[uu(0xe25)] = 0x1388);
    const dn = {};
    (dn[uu(0x670)] = uu(0xc14)),
      (dn[uu(0x801)] = uu(0xb8c)),
      (dn[uu(0x909)] = cR[uu(0x622)]),
      (dn[uu(0x423)] = 0x8),
      (dn[uu(0xd8e)] = 0x2),
      (dn[uu(0x459)] = 0xa0),
      (dn[uu(0xe25)] = 0x2710),
      (dn[uu(0x576)] = 0xb),
      (dn[uu(0x93c)] = Math["PI"]),
      (dn[uu(0x9db)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dp = {};
    (dp[uu(0x670)] = uu(0x493)),
      (dp[uu(0x801)] = uu(0x3ad)),
      (dp[uu(0x974)] = de[uu(0x2d7)]),
      (dp[uu(0xa4c)] = 0x1e),
      (dp[uu(0x72d)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dq = {};
    (dq[uu(0x670)] = uu(0x51a)),
      (dq[uu(0x801)] = uu(0xd1e)),
      (dq[uu(0x974)] = de[uu(0x5e3)]);
    const dr = {};
    (dr[uu(0x670)] = uu(0x3d7)),
      (dr[uu(0x801)] = uu(0x779)),
      (dr[uu(0x909)] = cR[uu(0x6f5)]),
      (dr[uu(0x423)] = 0xb),
      (dr[uu(0xe25)] = 0x9c4),
      (dr[uu(0xd8e)] = 0x14),
      (dr[uu(0x459)] = 0x8),
      (dr[uu(0xa78)] = !![]),
      (dr[uu(0x5dc)] = 0x2),
      (dr[uu(0x6d7)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (dr[uu(0x542)] = 0x14);
    const ds = {};
    (ds[uu(0x670)] = uu(0x19b)),
      (ds[uu(0x801)] = uu(0xde6)),
      (ds[uu(0x909)] = cR[uu(0x1df)]),
      (ds[uu(0x423)] = 0xb),
      (ds[uu(0xd8e)] = 0x14),
      (ds[uu(0x459)] = 0x14),
      (ds[uu(0xe25)] = 0x5dc),
      (ds[uu(0x610)] = 0x64),
      (ds[uu(0xb78)] = 0x1);
    const du = {};
    (du[uu(0x670)] = uu(0x1fb)),
      (du[uu(0x801)] = uu(0x749)),
      (du[uu(0x909)] = cR[uu(0x69e)]),
      (du[uu(0x423)] = 0x7),
      (du[uu(0xd8e)] = 0x5),
      (du[uu(0x459)] = 0xa),
      (du[uu(0xe25)] = 0x258),
      (du[uu(0x9dd)] = 0x1),
      (du[uu(0x4c1)] = !![]),
      (du[uu(0x9db)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dv = {};
    (dv[uu(0x670)] = uu(0xc45)),
      (dv[uu(0x801)] = uu(0xa00)),
      (dv[uu(0x909)] = cR[uu(0xd16)]),
      (dv[uu(0x423)] = 0xb),
      (dv[uu(0xd8e)] = 0xf),
      (dv[uu(0x459)] = 0x1),
      (dv[uu(0xe25)] = 0x3e8),
      (dv[uu(0xb0e)] = !![]),
      (dv[uu(0x241)] = !![]);
    const dw = {};
    (dw[uu(0x670)] = uu(0x26e)),
      (dw[uu(0x801)] = uu(0x614)),
      (dw[uu(0x909)] = cR[uu(0x8bf)]),
      (dw[uu(0x423)] = 0xb),
      (dw[uu(0xd8e)] = 0xf),
      (dw[uu(0x459)] = 0x5),
      (dw[uu(0xe25)] = 0x5dc),
      (dw[uu(0x62f)] = 0x32),
      (dw[uu(0x3e6)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dx = {};
    (dx[uu(0x670)] = uu(0x3eb)),
      (dx[uu(0x801)] = uu(0xe55)),
      (dx[uu(0x909)] = cR[uu(0x5f4)]),
      (dx[uu(0x423)] = 0x7),
      (dx[uu(0xd8e)] = 0x19),
      (dx[uu(0x459)] = 0x19),
      (dx[uu(0x9dd)] = 0x4),
      (dx[uu(0xe25)] = 0x3e8),
      (dx[uu(0xa9d)] = 0x1f4),
      (dx[uu(0x576)] = 0x9),
      (dx[uu(0xa4e)] = Math["PI"] / 0x8),
      (dx[uu(0xe64)] = !![]),
      (dx[uu(0x8a7)] = 0x28);
    const dy = {};
    (dy[uu(0x670)] = uu(0xa1e)),
      (dy[uu(0x801)] = uu(0x21a)),
      (dy[uu(0x909)] = cR[uu(0xe47)]),
      (dy[uu(0x423)] = 0x10),
      (dy[uu(0xd8e)] = 0x0),
      (dy[uu(0x9d4)] = 0x1),
      (dy[uu(0x459)] = 0x0),
      (dy[uu(0xe25)] = 0x157c),
      (dy[uu(0xa9d)] = 0x1f4),
      (dy[uu(0x4a9)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dy[uu(0x11a)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dy[uu(0x5fd)] = 0x3c),
      (dy[uu(0x99a)] = !![]),
      (dy[uu(0x241)] = !![]);
    const dz = {};
    (dz[uu(0x670)] = uu(0x219)),
      (dz[uu(0x801)] = uu(0x578)),
      (dz[uu(0x909)] = cR[uu(0x8b6)]),
      (dz[uu(0xe25)] = 0x5dc),
      (dz[uu(0xb3b)] = !![]),
      (dz[uu(0xd8e)] = 0xa),
      (dz[uu(0x459)] = 0x14),
      (dz[uu(0x423)] = 0xd);
    const dA = {};
    (dA[uu(0x670)] = uu(0xa91)),
      (dA[uu(0x801)] = uu(0x408)),
      (dA[uu(0x909)] = cR[uu(0xb5a)]),
      (dA[uu(0xe25)] = 0xdac),
      (dA[uu(0xa9d)] = 0x1f4),
      (dA[uu(0xd8e)] = 0x5),
      (dA[uu(0x459)] = 0x5),
      (dA[uu(0x423)] = 0xa),
      (dA[uu(0x8e2)] = 0x46),
      (dA[uu(0x3c6)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
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
        name: uu(0xb51),
        desc: uu(0x7b1),
        ability: de[uu(0x5dd)],
        orbitRange: 0x32,
        orbitRangeTiers: dc((r5) => 0x32 + r5 * 0x46),
      },
      {
        name: uu(0xac0),
        desc: uu(0xc56),
        ability: de[uu(0x3f2)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dz,
      dA,
      {
        name: uu(0x95d),
        desc: uu(0x132),
        type: cR[uu(0xdc3)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][uu(0x91f)](
          (r5) => r5 * 0.8
        ),
      },
      {
        name: uu(0x63c),
        desc: uu(0x677),
        type: cR[uu(0xa2c)],
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
        name: uu(0x8b2),
        desc: uu(0x8ee),
        type: cR[uu(0xd78)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
        orbitSpeedFactor: 0.95,
        orbitSpeedFactorTiers: [0.94, 0.93, 0.92, 0.91, 0.9, 0.8, 0.7, 0.1],
      },
      {
        name: uu(0x8e0),
        desc: uu(0x5ee),
        type: cR[uu(0xb3d)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][uu(0x91f)](
          (r5) => r5 - 0.2
        ),
      },
      {
        name: uu(0x1c2),
        desc: uu(0xa3a),
        type: cR[uu(0x598)],
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
        name: uu(0x91c),
        desc: uu(0xa30),
        type: cR[uu(0xae6)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: uu(0x13c),
        desc: uu(0x605),
        type: cR[uu(0xa19)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: uu(0xc3f),
        desc: uu(0x44a),
        type: cR[uu(0x7dc)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: uu(0x8b5),
        desc: uu(0x627),
        type: cR[uu(0x96e)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dC(![]),
      dC(!![]),
      {
        name: uu(0x498),
        desc: uu(0x8c3),
        type: cR[uu(0x331)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: uu(0x5b2),
        desc: uu(0x895),
        type: cR[uu(0xde9)],
        size: 0xa,
        healthF: 0xf,
        damageF: 0x14,
        respawnTime: 0x5dc,
        extraSpeed: 0x2,
        extraSpeedTiers: [0x4, 0x6, 0x8, 0xa, 0xc, 0xe, 0x10, 0x18],
        turbulence: 0x14,
        turbulenceTiers: dc((r5) => 0x14 + r5 * 0x50),
      },
      {
        name: uu(0x887),
        desc: uu(0xab7),
        type: cR[uu(0x65c)],
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
        name: uu(0x83d),
        desc: uu(0xad4),
        type: cR[uu(0x5ba)],
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
        spawn: uu(0xa0d),
        spawnTiers: [
          uu(0x949),
          uu(0x34f),
          uu(0x1a3),
          uu(0x1a3),
          uu(0x78d),
          uu(0x771),
          uu(0x771),
          uu(0xcf5),
        ],
      },
      {
        name: uu(0x148),
        desc: uu(0xb5b),
        type: cR[uu(0x346)],
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
        spawn: uu(0x5fc),
        spawnTiers: [
          uu(0xdca),
          uu(0xdca),
          uu(0xa5c),
          uu(0xa8b),
          uu(0x2aa),
          uu(0x402),
          uu(0x402),
          uu(0x50b),
        ],
      },
      {
        name: uu(0x3de),
        desc: uu(0x2c9),
        type: cR[uu(0x5ba)],
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
        spawn: uu(0x832),
        spawnTiers: [
          uu(0x193),
          uu(0x193),
          uu(0x773),
          uu(0x39a),
          uu(0x5f8),
          uu(0xad3),
          uu(0xad3),
          uu(0x926),
        ],
      },
      {
        name: uu(0xe58),
        desc: uu(0x2e3),
        type: cR[uu(0xa7d)],
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
        spawn: uu(0x5f2),
        spawnTiers: [
          uu(0x5f2),
          uu(0xe27),
          uu(0xb0d),
          uu(0xdb7),
          uu(0x924),
          uu(0x9ba),
          uu(0x9ba),
          uu(0x7ef),
        ],
      },
      {
        name: uu(0x74a),
        desc: uu(0xa4f),
        type: cR[uu(0x651)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: uu(0x27d),
        spawnTiers: [
          uu(0x591),
          uu(0x36d),
          uu(0x36d),
          uu(0xaf2),
          uu(0x699),
          uu(0x615),
          uu(0x615),
          uu(0xca3),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: uu(0x23d),
        desc: uu(0x9dc),
        type: cR[uu(0x89f)],
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
        name: uu(0x1b7),
        desc: uu(0xb24),
        type: cR[uu(0x884)],
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
        name: uu(0x841),
        desc: uu(0x7ea),
        type: cR[uu(0x426)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: uu(0x4a4),
        desc: uu(0x65e),
        type: cR[uu(0xaf1)],
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
        name: uu(0xc79),
        desc: uu(0xa50),
        type: cR[uu(0x2a3)],
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
        name: uu(0xb03),
        desc: uu(0x7a0),
        type: cR[uu(0x917)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: uu(0x2e5),
        desc: uu(0xb9f),
        type: cR[uu(0x139)],
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
        name: uu(0x3a0),
        desc: uu(0x414),
        ability: de[uu(0x499)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: uu(0x7a7),
        desc: uu(0x30d),
        type: cR[uu(0x15e)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: uu(0x4be),
        desc: uu(0x393),
        type: cR[uu(0x75e)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: uu(0x9ed),
        desc: uu(0xcf0),
        ability: de[uu(0x2d3)],
        petHealF: 0x28,
      },
      {
        name: uu(0x1da),
        desc: uu(0x5ac),
        ability: de[uu(0x727)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: uu(0x11c),
        type: cR[uu(0x412)],
        desc: uu(0x4b0),
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
        name: uu(0x1ce),
        desc: uu(0x8c7),
        type: cR[uu(0xb23)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: uu(0x997),
        spawnTiers: [
          uu(0xe57),
          uu(0x562),
          uu(0x562),
          uu(0x4d7),
          uu(0x249),
          uu(0x592),
          uu(0x592),
          uu(0x8cf),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: uu(0xbbc),
        desc: uu(0x804),
        type: cR[uu(0x913)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          uu(0x91f)
        ]((r5) => r5 / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: uu(0x181),
        desc: uu(0xbf6),
        type: cR[uu(0x86d)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: uu(0x706),
        desc: uu(0x81b),
        type: cR[uu(0x625)],
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
        name: uu(0x373),
        desc: uu(0x814),
        type: cR[uu(0x5ff)],
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
        name: uu(0x6e4),
        desc: uu(0xd11),
        type: cR[uu(0x461)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: uu(0x8f5),
        desc: uu(0x92d),
        type: cR[uu(0x88a)],
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
        name: uu(0x358),
        desc: uu(0x9fd),
        type: cR[uu(0x520)],
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
        consumeProjType: cR[uu(0x884)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: uu(0x288),
        desc: uu(0xc72),
        type: cR[uu(0xdc4)],
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
        name: uu(0x996),
        desc: uu(0x2b7),
        type: cR[uu(0xe4d)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: uu(0x1fa),
        spawnTiers: [
          uu(0x7df),
          uu(0xbdb),
          uu(0xbdb),
          uu(0x9c1),
          uu(0x5b4),
          uu(0x278),
          uu(0x916),
          uu(0x4ff),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: uu(0x39c), desc: uu(0x656), ability: de[uu(0x1e3)] },
      {
        name: uu(0xb12),
        desc: uu(0x711),
        type: cR[uu(0xca5)],
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
        name: uu(0x72e),
        desc: uu(0x7db),
        type: cR[uu(0xa25)],
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
        name: uu(0x572),
        desc: uu(0x761),
        type: cR[uu(0xc05)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: uu(0xdc6),
        desc: uu(0xce9),
        type: cR[uu(0xadf)],
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
        name: uu(0x287),
        desc: uu(0xafe),
        type: cR[uu(0xe3b)],
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
        name: uu(0x31f),
        desc: uu(0xacb),
        type: cR[uu(0x42e)],
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
        spawn: uu(0x447),
        spawnTiers: [
          uu(0xba9),
          uu(0xbb9),
          uu(0xbb9),
          uu(0x236),
          uu(0x901),
          uu(0x1de),
          uu(0x1de),
          uu(0xe06),
        ],
      },
      {
        name: uu(0x70d),
        desc: uu(0x29e),
        type: cR[uu(0x290)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: uu(0x776),
        desc: uu(0x2cb),
        type: cR[uu(0x724)],
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
        name: uu(0x7e9),
        desc: uu(0x6e5),
        type: cR[uu(0x13e)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 2.5,
      },
      {
        name: uu(0x548),
        desc: uu(0xc7a),
        type: cR[uu(0x51d)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dc((r5) => 0xa + r5 * 0x28),
      },
      {
        name: uu(0xe0c),
        desc: uu(0x198),
        type: cR[uu(0x453)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: uu(0xb06),
        desc: uu(0xb6d),
        type: cR[uu(0x6d1)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dc((r5) => 0x2 + Math[uu(0xbb6)](1.7 ** r5)),
      },
      {
        name: uu(0x456),
        desc: uu(0xd5b),
        type: cR[uu(0xe07)],
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
        name: uu(0x222),
        desc: uu(0x911),
        type: cR[uu(0x2e0)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dc((r5) => 0.02 + r5 * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: uu(0x1d3),
        desc: uu(0xb22),
        type: cR[uu(0x6c1)],
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
        spawn: uu(0xb37),
        spawnTiers: [
          uu(0xb37),
          uu(0xabc),
          uu(0xd1a),
          uu(0x340),
          uu(0xcba),
          uu(0xb57),
          uu(0xb57),
          uu(0x396),
        ],
      },
      { name: uu(0x4d0), desc: uu(0x8e4), ability: de[uu(0x68c)] },
      {
        name: uu(0xbe6),
        desc: uu(0x865),
        type: cR[uu(0xdb6)],
        size: 0x10,
        healthF: 0x14,
        damageF: 0xa,
        fixAngle: !![],
        isDice: !![],
        respawnTime: 0x640,
      },
    ];
    function dC(r5) {
      const uB = uu,
        r6 = r5 ? 0x1 : -0x1,
        r7 = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][uB(0x91f)](
          (r8) => r8 * r6
        );
      return {
        name: r5 ? uB(0xcb8) : uB(0x155),
        desc:
          (r5 ? uB(0xcab) : uB(0x239)) +
          uB(0x24a) +
          (r5 ? uB(0x829) : "") +
          uB(0x4f1),
        type: cR[r5 ? uB(0x6ff) : uB(0xe66)],
        size: 0x10,
        healthF: r5 ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: r7[0x0],
        mobSizeChangeTiers: r7[uB(0xb56)](0x1),
      };
    }
    var dD = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dE = {},
      dF = dB[uu(0xc60)],
      dG = d9[uu(0xc60)],
      dH = eO();
    for (let r5 = 0x0, r6 = dB[uu(0xc60)]; r5 < r6; r5++) {
      const r7 = dB[r5];
      (r7[uu(0xdb2)] = !![]), (r7["id"] = r5);
      if (!r7[uu(0x1a6)]) r7[uu(0x1a6)] = r7[uu(0x670)];
      dJ(r7), (r7[uu(0x2d4)] = 0x0), (r7[uu(0x1a7)] = r5);
      let r8 = r7;
      for (let r9 = 0x1; r9 < dG; r9++) {
        const ra = dN(r7);
        (ra[uu(0x308)] = r7[uu(0x308)] + r9),
          (ra[uu(0x670)] = r7[uu(0x670)] + "_" + ra[uu(0x308)]),
          (ra[uu(0x2d4)] = r9),
          (r8[uu(0x119)] = ra),
          (r8 = ra),
          dI(r7, ra),
          dJ(ra),
          (ra["id"] = dB[uu(0xc60)]),
          (dB[ra["id"]] = ra);
      }
    }
    function dI(rb, rc) {
      const uC = uu,
        rd = rc[uC(0x308)] - rb[uC(0x308)] - 0x1;
      for (let re in rb) {
        const rf = rb[re + uC(0x790)];
        Array[uC(0x105)](rf) && (rc[re] = rf[rd]);
      }
    }
    function dJ(rb) {
      const uD = uu;
      dE[rb[uD(0x670)]] = rb;
      for (let rc in dh) {
        rb[rc] === void 0x0 && (rb[rc] = dh[rc]);
      }
      rb[uD(0x974)] === de[uD(0x5e3)] &&
        (rb[uD(0x468)] = cV[rb[uD(0x308)] + 0x1] / 0x64),
        (rb[uD(0x9d4)] =
          rb[uD(0xd8e)] > 0x0
            ? df(rb[uD(0x308)], rb[uD(0xd8e)])
            : rb[uD(0x9d4)]),
        (rb[uD(0xe45)] =
          rb[uD(0x459)] > 0x0
            ? df(rb[uD(0x308)], rb[uD(0x459)])
            : rb[uD(0xe45)]),
        (rb[uD(0x382)] = df(rb[uD(0x308)], rb[uD(0x8e7)])),
        (rb[uD(0x29f)] = df(rb[uD(0x308)], rb[uD(0xd2f)])),
        (rb[uD(0xafb)] = df(rb[uD(0x308)], rb[uD(0xa2d)])),
        (rb[uD(0xd68)] = df(rb[uD(0x308)], rb[uD(0xd30)])),
        (rb[uD(0x50f)] = df(rb[uD(0x308)], rb[uD(0x6fa)])),
        (rb[uD(0xd2d)] = df(rb[uD(0x308)], rb[uD(0x47e)])),
        (rb[uD(0x41d)] = df(rb[uD(0x308)], rb[uD(0x860)])),
        (rb[uD(0xaba)] = df(rb[uD(0x308)], rb[uD(0xe59)])),
        rb[uD(0xdd6)] &&
          ((rb[uD(0x7f6)] = df(rb[uD(0x308)], rb[uD(0xb4d)])),
          (rb[uD(0xe3d)] = df(rb[uD(0x308)], rb[uD(0xb01)]))),
        rb[uD(0xbd7)] > 0x0
          ? (rb[uD(0x643)] = df(rb[uD(0x308)], rb[uD(0xbd7)]))
          : (rb[uD(0x643)] = 0x0),
        (rb[uD(0xa27)] = rb[uD(0xe1e)]
          ? df(rb[uD(0x308)], rb[uD(0xe18)])
          : 0x0),
        (rb[uD(0x5cb)] = rb[uD(0xa78)]
          ? df(rb[uD(0x308)], rb[uD(0x542)])
          : 0x0),
        (rb[uD(0x8bb)] = df(rb[uD(0x308)], rb[uD(0x610)])),
        dH[rb[uD(0x308)]][uD(0x7b8)](rb);
    }
    var dK = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dL = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dM = cU(uu(0xd51));
    function dN(rb) {
      const uE = uu;
      return JSON[uE(0x386)](JSON[uE(0x3cc)](rb));
    }
    const dO = {};
    (dO[uu(0x670)] = uu(0x38d)),
      (dO[uu(0x801)] = uu(0x9da)),
      (dO[uu(0x909)] = uu(0x394)),
      (dO[uu(0x308)] = 0x0),
      (dO[uu(0xd8e)] = 0x64),
      (dO[uu(0x459)] = 0x1e),
      (dO[uu(0x6ba)] = 0x32),
      (dO[uu(0x582)] = dM[uu(0x77a)]),
      (dO[uu(0x2a4)] = ![]),
      (dO[uu(0x39e)] = !![]),
      (dO[uu(0xe1e)] = ![]),
      (dO[uu(0xe18)] = 0x0),
      (dO[uu(0xa27)] = 0x0),
      (dO[uu(0x142)] = ![]),
      (dO[uu(0x753)] = ![]),
      (dO[uu(0x935)] = 0x1),
      (dO[uu(0x546)] = cR[uu(0xb87)]),
      (dO[uu(0xbf7)] = 0x0),
      (dO[uu(0x22c)] = 0x0),
      (dO[uu(0x500)] = 0.5),
      (dO[uu(0x173)] = 0x0),
      (dO[uu(0x8a7)] = 0x1e),
      (dO[uu(0x8fc)] = 0x0),
      (dO[uu(0x269)] = ![]),
      (dO[uu(0x542)] = 0x0),
      (dO[uu(0x5dc)] = 0x0),
      (dO[uu(0xc10)] = 11.5),
      (dO[uu(0xab0)] = 0x4),
      (dO[uu(0x156)] = !![]),
      (dO[uu(0xd01)] = 0x0),
      (dO[uu(0xcc8)] = 0x0),
      (dO[uu(0xe36)] = 0x1),
      (dO[uu(0xd7c)] = 0x0),
      (dO[uu(0x3f6)] = 0x0),
      (dO[uu(0xdd4)] = 0x0),
      (dO[uu(0x164)] = 0x0),
      (dO[uu(0x2a9)] = 0x1);
    var dP = dO;
    const dQ = {};
    (dQ[uu(0x670)] = uu(0x9e7)),
      (dQ[uu(0x801)] = uu(0x1c3)),
      (dQ[uu(0x909)] = uu(0x98e)),
      (dQ[uu(0xd8e)] = 0x2ee),
      (dQ[uu(0x459)] = 0xa),
      (dQ[uu(0x6ba)] = 0x32),
      (dQ[uu(0x142)] = !![]),
      (dQ[uu(0x753)] = !![]),
      (dQ[uu(0x935)] = 0.05),
      (dQ[uu(0xc10)] = 0x5),
      (dQ[uu(0xac2)] = !![]),
      (dQ[uu(0x985)] = [[uu(0x5fc), 0x3]]),
      (dQ[uu(0xdb1)] = [
        [uu(0x35a), 0x1],
        [uu(0x5fc), 0x2],
        [uu(0x8d0), 0x2],
        [uu(0xd40), 0x1],
      ]),
      (dQ[uu(0x613)] = [[uu(0x19b), "f"]]);
    const dR = {};
    (dR[uu(0x670)] = uu(0x35a)),
      (dR[uu(0x801)] = uu(0x2fe)),
      (dR[uu(0x909)] = uu(0x514)),
      (dR[uu(0xd8e)] = 0x1f4),
      (dR[uu(0x459)] = 0xa),
      (dR[uu(0x6ba)] = 0x28),
      (dR[uu(0xac2)] = !![]),
      (dR[uu(0x2a4)] = !![]),
      (dR[uu(0x613)] = [
        [uu(0x91c), "E"],
        [uu(0xcb8), "G"],
        [uu(0x148), "A"],
      ]);
    const dS = {};
    (dS[uu(0x670)] = uu(0x5fc)),
      (dS[uu(0x801)] = uu(0xe04)),
      (dS[uu(0x909)] = uu(0x33b)),
      (dS[uu(0xd8e)] = 0x64),
      (dS[uu(0x459)] = 0xa),
      (dS[uu(0x6ba)] = 0x1c),
      (dS[uu(0x2a4)] = !![]),
      (dS[uu(0x613)] = [[uu(0x91c), "I"]]);
    const dT = {};
    (dT[uu(0x670)] = uu(0x8d0)),
      (dT[uu(0x801)] = uu(0x1d0)),
      (dT[uu(0x909)] = uu(0x717)),
      (dT[uu(0xd8e)] = 62.5),
      (dT[uu(0x459)] = 0xa),
      (dT[uu(0x6ba)] = 0x1c),
      (dT[uu(0x613)] = [[uu(0x8b5), "H"]]);
    const dU = {};
    (dU[uu(0x670)] = uu(0xd40)),
      (dU[uu(0x801)] = uu(0xcad)),
      (dU[uu(0x909)] = uu(0xd9a)),
      (dU[uu(0xd8e)] = 0x19),
      (dU[uu(0x459)] = 0xa),
      (dU[uu(0x6ba)] = 0x19),
      (dU[uu(0x2a4)] = ![]),
      (dU[uu(0x39e)] = ![]),
      (dU[uu(0x613)] = [
        [uu(0x1fb), "F"],
        [uu(0x8b5), "F"],
        [uu(0x155), "G"],
        [uu(0xb03), "F"],
      ]);
    var dV = [dQ, dR, dS, dT, dU];
    function dW() {
      const uF = uu,
        rb = dN(dV);
      for (let rc = 0x0; rc < rb[uF(0xc60)]; rc++) {
        const rd = rb[rc];
        (rd[uF(0x909)] += uF(0x706)),
          rd[uF(0x670)] === uF(0x9e7) &&
            (rd[uF(0x613)] = [
              [uF(0x26e), "D"],
              [uF(0x23d), "E"],
            ]),
          (rd[uF(0x670)] = dX(rd[uF(0x670)])),
          (rd[uF(0x801)] = dX(rd[uF(0x801)])),
          (rd[uF(0x459)] *= 0x2),
          rd[uF(0x985)] &&
            rd[uF(0x985)][uF(0xa2e)]((re) => {
              return (re[0x0] = dX(re[0x0])), re;
            }),
          rd[uF(0xdb1)] &&
            rd[uF(0xdb1)][uF(0xa2e)]((re) => {
              return (re[0x0] = dX(re[0x0])), re;
            });
      }
      return rb;
    }
    function dX(rb) {
      const uG = uu;
      return rb[uG(0x88f)](/Ant/g, uG(0xc12))[uG(0x88f)](/ant/g, uG(0xa1f));
    }
    const dY = {};
    (dY[uu(0x670)] = uu(0x4e0)),
      (dY[uu(0x801)] = uu(0x5d1)),
      (dY[uu(0x909)] = uu(0xda9)),
      (dY[uu(0xd8e)] = 37.5),
      (dY[uu(0x459)] = 0x32),
      (dY[uu(0x6ba)] = 0x28),
      (dY[uu(0x613)] = [
        [uu(0xc14), "F"],
        [uu(0x1c2), "I"],
      ]),
      (dY[uu(0xd01)] = 0x4),
      (dY[uu(0xcc8)] = 0x4);
    const dZ = {};
    (dZ[uu(0x670)] = uu(0xc3f)),
      (dZ[uu(0x801)] = uu(0x846)),
      (dZ[uu(0x909)] = uu(0x9c6)),
      (dZ[uu(0xd8e)] = 0x5e),
      (dZ[uu(0x459)] = 0x5),
      (dZ[uu(0x935)] = 0.05),
      (dZ[uu(0x6ba)] = 0x3c),
      (dZ[uu(0x142)] = !![]),
      (dZ[uu(0x613)] = [[uu(0xc3f), "h"]]);
    const e0 = {};
    (e0[uu(0x670)] = uu(0xb37)),
      (e0[uu(0x801)] = uu(0xaa2)),
      (e0[uu(0x909)] = uu(0xe32)),
      (e0[uu(0xd8e)] = 0x4b),
      (e0[uu(0x459)] = 0xa),
      (e0[uu(0x935)] = 0.05),
      (e0[uu(0x142)] = !![]),
      (e0[uu(0xcd4)] = 1.25),
      (e0[uu(0x613)] = [
        [uu(0xb37), "h"],
        [uu(0x8b2), "J"],
        [uu(0x1d3), "K"],
      ]);
    const e1 = {};
    (e1[uu(0x670)] = uu(0x832)),
      (e1[uu(0x801)] = uu(0x611)),
      (e1[uu(0x909)] = uu(0xb6f)),
      (e1[uu(0xd8e)] = 62.5),
      (e1[uu(0x459)] = 0x32),
      (e1[uu(0x2a4)] = !![]),
      (e1[uu(0x6ba)] = 0x28),
      (e1[uu(0x613)] = [
        [uu(0xd60), "f"],
        [uu(0x51a), "I"],
        [uu(0x3de), "K"],
      ]),
      (e1[uu(0x546)] = cR[uu(0xca2)]),
      (e1[uu(0x22c)] = 0xa),
      (e1[uu(0xbf7)] = 0x5),
      (e1[uu(0x8a7)] = 0x26),
      (e1[uu(0x500)] = 0.375 / 1.1),
      (e1[uu(0x173)] = 0.75),
      (e1[uu(0x582)] = dM[uu(0xb6f)]);
    const e2 = {};
    (e2[uu(0x670)] = uu(0x8f1)),
      (e2[uu(0x801)] = uu(0x6c5)),
      (e2[uu(0x909)] = uu(0xd89)),
      (e2[uu(0xd8e)] = 87.5),
      (e2[uu(0x459)] = 0xa),
      (e2[uu(0x613)] = [
        [uu(0x1fb), "f"],
        [uu(0x81e), "f"],
      ]),
      (e2[uu(0xd01)] = 0x5),
      (e2[uu(0xcc8)] = 0x5);
    const e3 = {};
    (e3[uu(0x670)] = uu(0xa0d)),
      (e3[uu(0x801)] = uu(0x748)),
      (e3[uu(0x909)] = uu(0x394)),
      (e3[uu(0xd8e)] = 0x64),
      (e3[uu(0x459)] = 0x1e),
      (e3[uu(0x2a4)] = !![]),
      (e3[uu(0x613)] = [[uu(0x83d), "F"]]),
      (e3[uu(0xd01)] = 0x5),
      (e3[uu(0xcc8)] = 0x5);
    const e4 = {};
    (e4[uu(0x670)] = uu(0x447)),
      (e4[uu(0x801)] = uu(0x157)),
      (e4[uu(0x909)] = uu(0xbf5)),
      (e4[uu(0xd8e)] = 62.5),
      (e4[uu(0x459)] = 0xf),
      (e4[uu(0xe1e)] = !![]),
      (e4[uu(0xe18)] = 0xf),
      (e4[uu(0x6ba)] = 0x23),
      (e4[uu(0x2a4)] = !![]),
      (e4[uu(0x613)] = [
        [uu(0x8e0), "F"],
        [uu(0xa91), "F"],
        [uu(0x493), "L"],
        [uu(0x3a0), "G"],
      ]);
    const e5 = {};
    (e5[uu(0x670)] = uu(0x61d)),
      (e5[uu(0x801)] = uu(0x8e6)),
      (e5[uu(0x909)] = uu(0x689)),
      (e5[uu(0xd8e)] = 0x64),
      (e5[uu(0x459)] = 0xf),
      (e5[uu(0xe1e)] = !![]),
      (e5[uu(0xe18)] = 0xa),
      (e5[uu(0x6ba)] = 0x2f),
      (e5[uu(0x2a4)] = !![]),
      (e5[uu(0x613)] = [
        [uu(0xaad), "F"],
        [uu(0x2e5), "F"],
      ]),
      (e5[uu(0x546)] = cR[uu(0x622)]),
      (e5[uu(0x22c)] = 0x3),
      (e5[uu(0xbf7)] = 0x5),
      (e5[uu(0x8fc)] = 0x7),
      (e5[uu(0x8a7)] = 0x2b),
      (e5[uu(0x500)] = 0.21),
      (e5[uu(0x173)] = -0.31),
      (e5[uu(0x582)] = dM[uu(0x8b9)]);
    const e6 = {};
    (e6[uu(0x670)] = uu(0x5f2)),
      (e6[uu(0x801)] = uu(0xb33)),
      (e6[uu(0x909)] = uu(0x906)),
      (e6[uu(0xd8e)] = 0x15e),
      (e6[uu(0x459)] = 0x28),
      (e6[uu(0x6ba)] = 0x2d),
      (e6[uu(0x2a4)] = !![]),
      (e6[uu(0xac2)] = !![]),
      (e6[uu(0x613)] = [
        [uu(0xac0), "F"],
        [uu(0xb51), "G"],
        [uu(0x13c), "H"],
        [uu(0xe58), "J"],
      ]);
    const e7 = {};
    (e7[uu(0x670)] = uu(0x671)),
      (e7[uu(0x801)] = uu(0x5e6)),
      (e7[uu(0x909)] = uu(0x147)),
      (e7[uu(0xd8e)] = 0x7d),
      (e7[uu(0x459)] = 0x19),
      (e7[uu(0x2a4)] = !![]),
      (e7[uu(0x269)] = !![]),
      (e7[uu(0x542)] = 0x5),
      (e7[uu(0x5dc)] = 0x2),
      (e7[uu(0x6d7)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e7[uu(0xab0)] = 0x4),
      (e7[uu(0xc10)] = 0x6),
      (e7[uu(0x613)] = [[uu(0x3d7), "F"]]);
    const e8 = {};
    (e8[uu(0x670)] = uu(0xa1e)),
      (e8[uu(0x801)] = uu(0x680)),
      (e8[uu(0x909)] = uu(0x8be)),
      (e8[uu(0xd8e)] = 0.5),
      (e8[uu(0x459)] = 0x5),
      (e8[uu(0x2a4)] = ![]),
      (e8[uu(0x39e)] = ![]),
      (e8[uu(0xab0)] = 0x1),
      (e8[uu(0x613)] = [[uu(0xa1e), "F"]]);
    const e9 = {};
    (e9[uu(0x670)] = uu(0xd28)),
      (e9[uu(0x801)] = uu(0x7b2)),
      (e9[uu(0x909)] = uu(0x580)),
      (e9[uu(0xd8e)] = 0x19),
      (e9[uu(0x459)] = 0xa),
      (e9[uu(0x6ba)] = 0x28),
      (e9[uu(0xa2f)] = cR[uu(0xdec)]),
      (e9[uu(0x613)] = [
        [uu(0x8b5), "J"],
        [uu(0x3eb), "J"],
      ]);
    const ea = {};
    (ea[uu(0x670)] = uu(0xcda)),
      (ea[uu(0x801)] = uu(0xc8f)),
      (ea[uu(0x909)] = uu(0xa7c)),
      (ea[uu(0xd8e)] = 0x19),
      (ea[uu(0x459)] = 0xa),
      (ea[uu(0x6ba)] = 0x28),
      (ea[uu(0xa2f)] = cR[uu(0x800)]),
      (ea[uu(0x2a4)] = !![]),
      (ea[uu(0x613)] = [
        [uu(0xaad), "J"],
        [uu(0x63c), "J"],
      ]);
    const eb = {};
    (eb[uu(0x670)] = uu(0xca8)),
      (eb[uu(0x801)] = uu(0xad9)),
      (eb[uu(0x909)] = uu(0x1e6)),
      (eb[uu(0xd8e)] = 0x19),
      (eb[uu(0x459)] = 0xa),
      (eb[uu(0x6ba)] = 0x28),
      (eb[uu(0xa2f)] = cR[uu(0x5e8)]),
      (eb[uu(0x39e)] = ![]),
      (eb[uu(0x613)] = [
        [uu(0x498), "J"],
        [uu(0x95d), "H"],
        [uu(0x5b2), "J"],
      ]),
      (eb[uu(0xab0)] = 0x17),
      (eb[uu(0xc10)] = 0x17 * 0.75);
    const ec = {};
    (ec[uu(0x670)] = uu(0x5d0)),
      (ec[uu(0x801)] = uu(0x5b7)),
      (ec[uu(0x909)] = uu(0x869)),
      (ec[uu(0xd8e)] = 87.5),
      (ec[uu(0x459)] = 0xa),
      (ec[uu(0x613)] = [
        [uu(0x887), "F"],
        [uu(0x219), "I"],
      ]),
      (ec[uu(0xd01)] = 0x5),
      (ec[uu(0xcc8)] = 0x5);
    const ed = {};
    (ed[uu(0x670)] = uu(0xb38)),
      (ed[uu(0x801)] = uu(0x5b0)),
      (ed[uu(0x909)] = uu(0x4ac)),
      (ed[uu(0xd8e)] = 87.5),
      (ed[uu(0x459)] = 0xa),
      (ed[uu(0x613)] = [
        [uu(0x81e), "A"],
        [uu(0x887), "A"],
      ]),
      (ed[uu(0xd01)] = 0x5),
      (ed[uu(0xcc8)] = 0x5);
    const ee = {};
    (ee[uu(0x670)] = uu(0x669)),
      (ee[uu(0x801)] = uu(0x9b9)),
      (ee[uu(0x909)] = uu(0x9e6)),
      (ee[uu(0xd8e)] = 0x32),
      (ee[uu(0x459)] = 0xa),
      (ee[uu(0x935)] = 0.05),
      (ee[uu(0x6ba)] = 0x3c),
      (ee[uu(0x142)] = !![]),
      (ee[uu(0x613)] = [
        [uu(0xc45), "E"],
        [uu(0xbbc), "F"],
        [uu(0x288), "F"],
      ]);
    const ef = {};
    (ef[uu(0x670)] = uu(0x27d)),
      (ef[uu(0x801)] = uu(0x363)),
      (ef[uu(0x909)] = uu(0xb50)),
      (ef[uu(0xd8e)] = 0x7d),
      (ef[uu(0x459)] = 0x28),
      (ef[uu(0x6ba)] = 0x32),
      (ef[uu(0x2a4)] = ![]),
      (ef[uu(0x39e)] = ![]),
      (ef[uu(0x582)] = dM[uu(0xb50)]),
      (ef[uu(0xab0)] = 0xe),
      (ef[uu(0xc10)] = 0xb),
      (ef[uu(0xe36)] = 2.2),
      (ef[uu(0x613)] = [
        [uu(0x74a), "J"],
        [uu(0x498), "H"],
      ]);
    const eg = {};
    (eg[uu(0x670)] = uu(0x12b)),
      (eg[uu(0x801)] = uu(0xbf8)),
      (eg[uu(0x909)] = uu(0x409)),
      (eg[uu(0xd8e)] = 0x7d),
      (eg[uu(0x459)] = 0x28),
      (eg[uu(0x6ba)] = null),
      (eg[uu(0x2a4)] = !![]),
      (eg[uu(0xa12)] = !![]),
      (eg[uu(0x613)] = [
        [uu(0xce8), "D"],
        [uu(0x1b7), "E"],
        [uu(0x358), "E"],
      ]),
      (eg[uu(0x6ba)] = 0x32),
      (eg[uu(0x423)] = 0x32),
      (eg[uu(0x385)] = !![]),
      (eg[uu(0xd7c)] = -Math["PI"] / 0x2),
      (eg[uu(0x546)] = cR[uu(0x884)]),
      (eg[uu(0x22c)] = 0x3),
      (eg[uu(0xbf7)] = 0x3),
      (eg[uu(0x8a7)] = 0x21),
      (eg[uu(0x500)] = 0.32),
      (eg[uu(0x173)] = 0.4),
      (eg[uu(0x582)] = dM[uu(0xb6f)]);
    const eh = {};
    (eh[uu(0x670)] = uu(0x841)),
      (eh[uu(0x801)] = uu(0x4a7)),
      (eh[uu(0x909)] = uu(0xd8c)),
      (eh[uu(0xd8e)] = 0x96),
      (eh[uu(0x459)] = 0x14),
      (eh[uu(0x2a4)] = !![]),
      (eh[uu(0x3f6)] = 0.5),
      (eh[uu(0x613)] = [
        [uu(0x841), "D"],
        [uu(0x95d), "J"],
        [uu(0x498), "J"],
      ]);
    const ei = {};
    (ei[uu(0x670)] = uu(0x4a4)),
      (ei[uu(0x801)] = uu(0x85a)),
      (ei[uu(0x909)] = uu(0x410)),
      (ei[uu(0xd8e)] = 0x19),
      (ei[uu(0x459)] = 0xf),
      (ei[uu(0x935)] = 0.05),
      (ei[uu(0x6ba)] = 0x37),
      (ei[uu(0x142)] = !![]),
      (ei[uu(0x613)] = [[uu(0x4a4), "h"]]),
      (ei[uu(0x546)] = cR[uu(0xaf1)]),
      (ei[uu(0xdd4)] = 0x9),
      (ei[uu(0x8a7)] = 0x28),
      (ei[uu(0x22c)] = 0xf),
      (ei[uu(0xbf7)] = 2.5),
      (ei[uu(0x8a7)] = 0x21),
      (ei[uu(0x500)] = 0.32),
      (ei[uu(0x173)] = 1.8),
      (ei[uu(0x164)] = 0x14);
    const ej = {};
    (ej[uu(0x670)] = uu(0xc79)),
      (ej[uu(0x801)] = uu(0x989)),
      (ej[uu(0x909)] = uu(0xc55)),
      (ej[uu(0xd8e)] = 0xe1),
      (ej[uu(0x459)] = 0xa),
      (ej[uu(0x6ba)] = 0x32),
      (ej[uu(0x613)] = [
        [uu(0xc79), "H"],
        [uu(0x26e), "L"],
      ]),
      (ej[uu(0xa12)] = !![]),
      (ej[uu(0x6e9)] = !![]),
      (ej[uu(0xc10)] = 0x23);
    const ek = {};
    (ek[uu(0x670)] = uu(0x39d)),
      (ek[uu(0x801)] = uu(0xc4e)),
      (ek[uu(0x909)] = uu(0x30c)),
      (ek[uu(0xd8e)] = 0x96),
      (ek[uu(0x459)] = 0x19),
      (ek[uu(0x6ba)] = 0x2f),
      (ek[uu(0x2a4)] = !![]),
      (ek[uu(0x613)] = [[uu(0x498), "J"]]),
      (ek[uu(0x546)] = null),
      (ek[uu(0x582)] = dM[uu(0x8b9)]);
    const em = {};
    (em[uu(0x670)] = uu(0x189)),
      (em[uu(0x801)] = uu(0x657)),
      (em[uu(0x909)] = uu(0xde3)),
      (em[uu(0xd8e)] = 0x64),
      (em[uu(0x459)] = 0x1e),
      (em[uu(0x6ba)] = 0x1e),
      (em[uu(0x2a4)] = !![]),
      (em[uu(0xa5f)] = uu(0x23d)),
      (em[uu(0x613)] = [
        [uu(0x23d), "F"],
        [uu(0x3a0), "E"],
        [uu(0x11c), "D"],
        [uu(0x4d0), "E"],
      ]);
    const en = {};
    (en[uu(0x670)] = uu(0x7a7)),
      (en[uu(0x801)] = uu(0x7ba)),
      (en[uu(0x909)] = uu(0xbec)),
      (en[uu(0xd8e)] = 0x64),
      (en[uu(0x459)] = 0xa),
      (en[uu(0x6ba)] = 0x3c),
      (en[uu(0x142)] = !![]),
      (en[uu(0x935)] = 0.05),
      (en[uu(0x613)] = [[uu(0x7a7), "D"]]);
    const eo = {};
    (eo[uu(0x670)] = uu(0x381)),
      (eo[uu(0x801)] = uu(0x3c5)),
      (eo[uu(0x909)] = uu(0x9ad)),
      (eo[uu(0xd8e)] = 0x64),
      (eo[uu(0x459)] = 0x23),
      (eo[uu(0x2a4)] = !![]),
      (eo[uu(0x613)] = [
        [uu(0x4be), "E"],
        [uu(0xdc6), "D"],
      ]);
    const ep = {};
    (ep[uu(0x670)] = uu(0xaa5)),
      (ep[uu(0x801)] = uu(0xba1)),
      (ep[uu(0x909)] = uu(0x28d)),
      (ep[uu(0xd8e)] = 0xc8),
      (ep[uu(0x459)] = 0x23),
      (ep[uu(0x6ba)] = 0x23),
      (ep[uu(0x2a4)] = !![]),
      (ep[uu(0xcc8)] = 0x5),
      (ep[uu(0x613)] = [
        [uu(0x9ed), "F"],
        [uu(0x1da), "D"],
        [uu(0x572), "E"],
      ]);
    const eq = {};
    (eq[uu(0x670)] = uu(0x997)),
      (eq[uu(0x801)] = uu(0x9ac)),
      (eq[uu(0x909)] = uu(0x6be)),
      (eq[uu(0xd8e)] = 0xc8),
      (eq[uu(0x459)] = 0x14),
      (eq[uu(0x6ba)] = 0x28),
      (eq[uu(0x2a4)] = !![]),
      (eq[uu(0x613)] = [
        [uu(0x1ce), "E"],
        [uu(0x181), "D"],
        [uu(0x706), "F"],
        [uu(0x373), "F"],
      ]),
      (eq[uu(0x9be)] = !![]),
      (eq[uu(0x3dd)] = 0xbb8),
      (eq[uu(0xabf)] = 0.3);
    const er = {};
    (er[uu(0x670)] = uu(0x6e4)),
      (er[uu(0x801)] = uu(0x927)),
      (er[uu(0x909)] = uu(0xe26)),
      (er[uu(0xd8e)] = 0x78),
      (er[uu(0x459)] = 0x1e),
      (er[uu(0x6e9)] = !![]),
      (er[uu(0xc10)] = 0xf),
      (er[uu(0xab0)] = 0x5),
      (er[uu(0x613)] = [
        [uu(0x6e4), "F"],
        [uu(0x8f5), "E"],
        [uu(0x72e), "D"],
      ]),
      (er[uu(0xcc8)] = 0x3);
    const es = {};
    (es[uu(0x670)] = uu(0x996)),
      (es[uu(0x801)] = uu(0x369)),
      (es[uu(0x909)] = uu(0x429)),
      (es[uu(0xd8e)] = 0x78),
      (es[uu(0x459)] = 0x23),
      (es[uu(0x6ba)] = 0x32),
      (es[uu(0x2a4)] = !![]),
      (es[uu(0x3ac)] = !![]),
      (es[uu(0x613)] = [
        [uu(0x996), "E"],
        [uu(0x288), "F"],
      ]),
      (es[uu(0x985)] = [[uu(0x1fa), 0x1]]),
      (es[uu(0xdb1)] = [[uu(0x1fa), 0x2]]),
      (es[uu(0x6d4)] = !![]);
    const et = {};
    (et[uu(0x670)] = uu(0x1fa)),
      (et[uu(0x801)] = uu(0xb10)),
      (et[uu(0x909)] = uu(0x603)),
      (et[uu(0xd8e)] = 0x96),
      (et[uu(0x459)] = 0.1),
      (et[uu(0x6ba)] = 0x28),
      (et[uu(0xab0)] = 0xe),
      (et[uu(0xc10)] = 11.6),
      (et[uu(0x2a4)] = !![]),
      (et[uu(0x3ac)] = !![]),
      (et[uu(0x87e)] = !![]),
      (et[uu(0x582)] = dM[uu(0xb50)]),
      (et[uu(0xa49)] = 0xa),
      (et[uu(0x613)] = [[uu(0x39c), "G"]]),
      (et[uu(0x2a9)] = 0.5);
    const eu = {};
    (eu[uu(0x670)] = uu(0x297)),
      (eu[uu(0x801)] = uu(0x54d)),
      (eu[uu(0x909)] = uu(0x587)),
      (eu[uu(0xd8e)] = 0x1f4),
      (eu[uu(0x459)] = 0x28),
      (eu[uu(0x935)] = 0.05),
      (eu[uu(0x6ba)] = 0x32),
      (eu[uu(0x142)] = !![]),
      (eu[uu(0xc10)] = 0x5),
      (eu[uu(0x753)] = !![]),
      (eu[uu(0xac2)] = !![]),
      (eu[uu(0x613)] = [
        [uu(0xb12), "F"],
        [uu(0x3de), "C"],
      ]),
      (eu[uu(0x985)] = [
        [uu(0x4e0), 0x2],
        [uu(0x832), 0x1],
      ]),
      (eu[uu(0xdb1)] = [
        [uu(0x4e0), 0x4],
        [uu(0x832), 0x2],
      ]);
    const ev = {};
    (ev[uu(0x670)] = uu(0x287)),
      (ev[uu(0x801)] = uu(0x7e2)),
      (ev[uu(0x909)] = uu(0x575)),
      (ev[uu(0xd8e)] = 0x50),
      (ev[uu(0x459)] = 0x28),
      (ev[uu(0xab0)] = 0x2),
      (ev[uu(0xc10)] = 0x6),
      (ev[uu(0xa12)] = !![]),
      (ev[uu(0x613)] = [[uu(0x287), "F"]]);
    const ew = {};
    (ew[uu(0x670)] = uu(0x397)),
      (ew[uu(0x801)] = uu(0xb69)),
      (ew[uu(0x909)] = uu(0x22b)),
      (ew[uu(0xd8e)] = 0x1f4),
      (ew[uu(0x459)] = 0x28),
      (ew[uu(0x935)] = 0.05),
      (ew[uu(0x6ba)] = 0x46),
      (ew[uu(0xc10)] = 0x5),
      (ew[uu(0x142)] = !![]),
      (ew[uu(0x753)] = !![]),
      (ew[uu(0xac2)] = !![]),
      (ew[uu(0x613)] = [
        [uu(0x31f), "A"],
        [uu(0xa91), "E"],
      ]),
      (ew[uu(0x985)] = [[uu(0x447), 0x2]]),
      (ew[uu(0xdb1)] = [
        [uu(0x447), 0x3],
        [uu(0x189), 0x2],
      ]);
    const ex = {};
    (ex[uu(0x670)] = uu(0x4c4)),
      (ex[uu(0x801)] = uu(0x3e8)),
      (ex[uu(0x909)] = uu(0x1dd)),
      (ex[uu(0x6ba)] = 0x28),
      (ex[uu(0xd8e)] = 0x64),
      (ex[uu(0x459)] = 0xa),
      (ex[uu(0x935)] = 0.05),
      (ex[uu(0x142)] = !![]),
      (ex[uu(0xd01)] = 0x1),
      (ex[uu(0xcc8)] = 0x1),
      (ex[uu(0x613)] = [
        [uu(0x1da), "G"],
        [uu(0x95d), "F"],
        [uu(0x70d), "F"],
      ]);
    const ey = {};
    (ey[uu(0x670)] = uu(0xe12)),
      (ey[uu(0x801)] = uu(0xa94)),
      (ey[uu(0x909)] = uu(0xadc)),
      (ey[uu(0xd8e)] = 0x3c),
      (ey[uu(0x459)] = 0x28),
      (ey[uu(0x6ba)] = 0x32),
      (ey[uu(0x2a4)] = ![]),
      (ey[uu(0x39e)] = ![]),
      (ey[uu(0x582)] = dM[uu(0xb50)]),
      (ey[uu(0xab0)] = 0xe),
      (ey[uu(0xc10)] = 0xb),
      (ey[uu(0xe36)] = 2.2),
      (ey[uu(0x613)] = [
        [uu(0xdc6), "E"],
        [uu(0x498), "J"],
      ]);
    const ez = {};
    (ez[uu(0x670)] = uu(0x2e7)),
      (ez[uu(0x801)] = uu(0x4f8)),
      (ez[uu(0x909)] = uu(0x422)),
      (ez[uu(0xd8e)] = 0x258),
      (ez[uu(0x459)] = 0x32),
      (ez[uu(0x935)] = 0.05),
      (ez[uu(0x6ba)] = 0x3c),
      (ez[uu(0xc10)] = 0x7),
      (ez[uu(0xac2)] = !![]),
      (ez[uu(0x142)] = !![]),
      (ez[uu(0x753)] = !![]),
      (ez[uu(0x613)] = [
        [uu(0x1ce), "A"],
        [uu(0x74a), "G"],
      ]),
      (ez[uu(0x985)] = [[uu(0x997), 0x1]]),
      (ez[uu(0xdb1)] = [[uu(0x997), 0x1]]);
    const eA = {};
    (eA[uu(0x670)] = uu(0x9c9)),
      (eA[uu(0x801)] = uu(0x202)),
      (eA[uu(0x909)] = uu(0xd0b)),
      (eA[uu(0xd8e)] = 0xc8),
      (eA[uu(0x459)] = 0x1e),
      (eA[uu(0x6ba)] = 0x2d),
      (eA[uu(0x2a4)] = !![]),
      (eA[uu(0x613)] = [
        [uu(0xac0), "G"],
        [uu(0xb51), "H"],
        [uu(0x72e), "E"],
      ]);
    const eB = {};
    (eB[uu(0x670)] = uu(0x662)),
      (eB[uu(0x801)] = uu(0x725)),
      (eB[uu(0x909)] = uu(0x39b)),
      (eB[uu(0xd8e)] = 0x3c),
      (eB[uu(0x459)] = 0x64),
      (eB[uu(0x6ba)] = 0x28),
      (eB[uu(0x71e)] = !![]),
      (eB[uu(0x156)] = ![]),
      (eB[uu(0x2a4)] = !![]),
      (eB[uu(0x613)] = [
        [uu(0x181), "F"],
        [uu(0x8b5), "D"],
        [uu(0x776), "G"],
      ]);
    const eC = {};
    (eC[uu(0x670)] = uu(0x7e9)),
      (eC[uu(0x801)] = uu(0x83b)),
      (eC[uu(0x909)] = uu(0xdac)),
      (eC[uu(0x6ba)] = 0x28),
      (eC[uu(0xd8e)] = 0x5a),
      (eC[uu(0x459)] = 0x5),
      (eC[uu(0x935)] = 0.05),
      (eC[uu(0x142)] = !![]),
      (eC[uu(0x613)] = [[uu(0x7e9), "h"]]);
    const eD = {};
    (eD[uu(0x670)] = uu(0x548)),
      (eD[uu(0x801)] = uu(0x3b4)),
      (eD[uu(0x909)] = uu(0xd79)),
      (eD[uu(0xd8e)] = 0x32),
      (eD[uu(0x459)] = 0x14),
      (eD[uu(0x6ba)] = 0x28),
      (eD[uu(0xa12)] = !![]),
      (eD[uu(0x613)] = [[uu(0x548), "F"]]);
    const eE = {};
    (eE[uu(0x670)] = uu(0xe0c)),
      (eE[uu(0x801)] = uu(0x23e)),
      (eE[uu(0x909)] = uu(0x9a8)),
      (eE[uu(0xd8e)] = 0x32),
      (eE[uu(0x459)] = 0x14),
      (eE[uu(0x935)] = 0.05),
      (eE[uu(0x142)] = !![]),
      (eE[uu(0x613)] = [[uu(0xe0c), "J"]]);
    const eF = {};
    (eF[uu(0x670)] = uu(0x284)),
      (eF[uu(0x801)] = uu(0xb66)),
      (eF[uu(0x909)] = uu(0x693)),
      (eF[uu(0xd8e)] = 0x64),
      (eF[uu(0x459)] = 0x1e),
      (eF[uu(0x935)] = 0.05),
      (eF[uu(0x6ba)] = 0x32),
      (eF[uu(0x142)] = !![]),
      (eF[uu(0x613)] = [
        [uu(0x181), "D"],
        [uu(0xb06), "E"],
      ]);
    const eG = {};
    (eG[uu(0x670)] = uu(0x10b)),
      (eG[uu(0x801)] = uu(0xc30)),
      (eG[uu(0x909)] = uu(0x34e)),
      (eG[uu(0xd8e)] = 0x96),
      (eG[uu(0x459)] = 0x14),
      (eG[uu(0x6ba)] = 0x28),
      (eG[uu(0x613)] = [
        [uu(0x456), "D"],
        [uu(0x8f5), "F"],
      ]),
      (eG[uu(0xdb1)] = [[uu(0xd40), 0x1, 0.3]]);
    const eH = {};
    (eH[uu(0x670)] = uu(0x222)),
      (eH[uu(0x801)] = uu(0x14e)),
      (eH[uu(0x909)] = uu(0x564)),
      (eH[uu(0xd8e)] = 0x32),
      (eH[uu(0x459)] = 0x5),
      (eH[uu(0x935)] = 0.05),
      (eH[uu(0x142)] = !![]),
      (eH[uu(0x613)] = [
        [uu(0x222), "h"],
        [uu(0x8b5), "J"],
      ]);
    const eI = {};
    (eI[uu(0x670)] = uu(0xbe6)),
      (eI[uu(0x801)] = uu(0x3ca)),
      (eI[uu(0x909)] = uu(0x1d6)),
      (eI[uu(0xd8e)] = 0x64),
      (eI[uu(0x459)] = 0x5),
      (eI[uu(0x935)] = 0.05),
      (eI[uu(0x142)] = !![]),
      (eI[uu(0x613)] = [[uu(0xbe6), "h"]]);
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
      eK = eJ[uu(0xc60)],
      eL = {},
      eM = [],
      eN = eO();
    function eO() {
      const rb = [];
      for (let rc = 0x0; rc < dG; rc++) {
        rb[rc] = [];
      }
      return rb;
    }
    for (let rb = 0x0; rb < eK; rb++) {
      const rc = eJ[rb];
      for (let rd in dP) {
        rc[rd] === void 0x0 && (rc[rd] = dP[rd]);
      }
      (eM[rb] = [rc]), (rc[uu(0x909)] = cR[rc[uu(0x909)]]), eQ(rc);
      rc[uu(0x613)] &&
        rc[uu(0x613)][uu(0xa2e)]((re) => {
          const uH = uu;
          re[0x1] = re[0x1][uH(0x4f2)]()[uH(0x80b)](0x0) - 0x41;
        });
      (rc["id"] = rb), (rc[uu(0x1a7)] = rb);
      if (!rc[uu(0x1a6)]) rc[uu(0x1a6)] = rc[uu(0x670)];
      for (let re = 0x1; re <= da; re++) {
        const rf = JSON[uu(0x386)](JSON[uu(0x3cc)](rc));
        (rf[uu(0x670)] = rc[uu(0x670)] + "_" + re),
          (rf[uu(0x308)] = re),
          (eM[rb][re] = rf),
          dI(rc, rf),
          eQ(rf),
          (rf["id"] = eJ[uu(0xc60)]),
          eJ[uu(0x7b8)](rf);
      }
    }
    for (let rg = 0x0; rg < eJ[uu(0xc60)]; rg++) {
      const rh = eJ[rg];
      rh[uu(0x985)] && eP(rh, rh[uu(0x985)]),
        rh[uu(0xdb1)] && eP(rh, rh[uu(0xdb1)]);
    }
    function eP(ri, rj) {
      const uI = uu;
      rj[uI(0xa2e)]((rk) => {
        const uJ = uI,
          rl = rk[0x0] + (ri[uJ(0x308)] > 0x0 ? "_" + ri[uJ(0x308)] : "");
        rk[0x0] = eL[rl];
      });
    }
    function eQ(ri) {
      const uK = uu;
      (ri[uK(0x9d4)] = df(ri[uK(0x308)], ri[uK(0xd8e)]) * dK[ri[uK(0x308)]]),
        (ri[uK(0xe45)] = df(ri[uK(0x308)], ri[uK(0x459)])),
        ri[uK(0x385)]
          ? (ri[uK(0x423)] = ri[uK(0x6ba)])
          : (ri[uK(0x423)] = ri[uK(0x6ba)] * dL[ri[uK(0x308)]]),
        (ri[uK(0xa27)] = df(ri[uK(0x308)], ri[uK(0xe18)])),
        (ri[uK(0x3c8)] = df(ri[uK(0x308)], ri[uK(0x22c)])),
        (ri[uK(0xdc1)] = df(ri[uK(0x308)], ri[uK(0xbf7)]) * dK[ri[uK(0x308)]]),
        (ri[uK(0xa73)] = df(ri[uK(0x308)], ri[uK(0x8fc)])),
        ri[uK(0xabf)] && (ri[uK(0x9c7)] = df(ri[uK(0x308)], ri[uK(0xabf)])),
        (ri[uK(0x5cb)] = df(ri[uK(0x308)], ri[uK(0x542)])),
        (eL[ri[uK(0x670)]] = ri),
        eN[ri[uK(0x308)]][uK(0x7b8)](ri);
    }
    function eR(ri) {
      return (ri / 0xff) * Math["PI"] * 0x2;
    }
    var eS = Math["PI"] * 0x2;
    function eT(ri) {
      const uL = uu;
      return (
        (ri %= eS), ri < 0x0 && (ri += eS), Math[uL(0xbb6)]((ri / eS) * 0xff)
      );
    }
    function eU(ri) {
      const uM = uu;
      if (!ri || ri[uM(0xc60)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        uM(0xbe9)
      ](ri);
    }
    function eV(ri, rj) {
      return dE[ri + (rj > 0x0 ? "_" + rj : "")];
    }
    var eW = d9[uu(0x91f)]((ri) => ri[uu(0xded)]() + uu(0x33a)),
      eX = d9[uu(0x91f)]((ri) => uu(0x672) + ri + uu(0x484)),
      eY = {};
    eW[uu(0xa2e)]((ri) => {
      eY[ri] = 0x0;
    });
    var eZ = {};
    eX[uu(0xa2e)]((ri) => {
      eZ[ri] = 0x0;
    });
    var f0 = 0x1 / 0x3e8 / 0x3c / 0x3c;
    function f1() {
      const uN = uu;
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
        timeJoined: Date[uN(0x5b6)]() * f0,
      };
    }
    var f2 = uu(0x3f4)[uu(0xc24)]("\x20");
    function f3(ri) {
      const rj = {};
      for (let rk in ri) {
        rj[ri[rk]] = rk;
      }
      return rj;
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
    for (let ri = 0x0; ri < f4[uu(0xc60)]; ri++) {
      const rj = f4[ri],
        rk = rj[rj[uu(0xc60)] - 0x1],
        rl = dN(rk);
      for (let rm = 0x0; rm < rl[uu(0xc60)]; rm++) {
        const rn = rl[rm];
        if (rn[0x0] < 0x1e) {
          let ro = rn[0x0];
          (ro *= 1.5),
            ro < 1.5 && (ro *= 0xa),
            (ro = parseFloat(ro[uu(0x9f2)](0x3))),
            (rn[0x0] = ro);
        }
        rn[0x1] = d8[uu(0xca6)];
      }
      rl[uu(0x7b8)]([0.01, d8[uu(0x318)]]), rj[uu(0x7b8)](rl);
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
    function f6(rp, rq) {
      var rr = Math["PI"] * 0x2,
        rs = (rq - rp) % rr;
      return ((0x2 * rs) % rr) - rs;
    }
    function f7(rp, rq, rr) {
      return rp + f6(rp, rq) * rr;
    }
    var f8 = {
      instagram: uu(0x9ef),
      discord: uu(0x154),
      paw: uu(0x129),
      gear: uu(0xd71),
      scroll: uu(0x5bd),
      bag: uu(0xb8b),
      food: uu(0xe0b),
      graph: uu(0x355),
      resize: uu(0xb5c),
      users: uu(0x481),
      trophy: uu(0xd5e),
      shop: uu(0x1d4),
      dice: uu(0xb55),
      data: uu(0x228),
      poopPath: new Path2D(uu(0x1e0)),
    };
    function f9(rp) {
      const uO = uu;
      return rp[uO(0x88f)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fa(rp) {
      const uP = uu;
      if(hack.isEnabled('disableChatCheck')) return rp;
      return (
        (rp = f9(rp)),
        (rp = rp[uP(0x88f)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uP(0x88f)](/(.)\1{2,}/gi, "$1")
          [uP(0x88f)](/\u200B|\u200C|\u200D/g, "")
          [uP(0x3ab)]()),
        !rp && (rp = uP(0x1c6)),
        rp
      );
    }
    var fb = 0x110;
    function fc(rp) {
      const uQ = uu,
        rq = rp[uQ(0xc24)]("\x0a")[uQ(0xc81)](
          (rr) => rr[uQ(0x3ab)]()[uQ(0xc60)] > 0x0
        );
      return { title: rq[uQ(0xd43)](), content: rq };
    }
    const fd = {};
    (fd[uu(0x767)] = uu(0x16c)),
      (fd[uu(0x300)] = [
        uu(0x565),
        uu(0x4da),
        uu(0x2b3),
        uu(0x6f3),
        uu(0x571),
        uu(0x347),
        uu(0x68e),
        uu(0x5f6),
      ]);
    const fe = {};
    (fe[uu(0x767)] = uu(0x53c)), (fe[uu(0x300)] = [uu(0xa5e)]);
    const ff = {};
    (ff[uu(0x767)] = uu(0x66b)),
      (ff[uu(0x300)] = [uu(0xb89), uu(0xa66), uu(0xa7a), uu(0xc83)]);
    const fg = {};
    (fg[uu(0x767)] = uu(0xa0b)),
      (fg[uu(0x300)] = [
        uu(0xc08),
        uu(0x8c4),
        uu(0x2a8),
        uu(0x3f5),
        uu(0x58b),
        uu(0x280),
        uu(0x9d0),
        uu(0x458),
        uu(0xa26),
      ]);
    const fh = {};
    (fh[uu(0x767)] = uu(0x2eb)),
      (fh[uu(0x300)] = [uu(0xe01), uu(0x7cb), uu(0x80d), uu(0x888)]);
    const fi = {};
    (fi[uu(0x767)] = uu(0x55c)), (fi[uu(0x300)] = [uu(0x7f7)]);
    const fj = {};
    (fj[uu(0x767)] = uu(0x3b0)), (fj[uu(0x300)] = [uu(0x557), uu(0x8a9)]);
    const fk = {};
    (fk[uu(0x767)] = uu(0x11f)),
      (fk[uu(0x300)] = [
        uu(0xb53),
        uu(0xcef),
        uu(0x3d9),
        uu(0xcd6),
        uu(0xb3c),
        uu(0x873),
        uu(0xadb),
        uu(0x896),
      ]);
    const fl = {};
    (fl[uu(0x767)] = uu(0x758)),
      (fl[uu(0x300)] = [
        uu(0x437),
        uu(0x56c),
        uu(0xad8),
        uu(0xac6),
        uu(0xd45),
        uu(0x806),
        uu(0xfc),
        uu(0x230),
      ]);
    const fm = {};
    (fm[uu(0x767)] = uu(0x91e)), (fm[uu(0x300)] = [uu(0x183)]);
    const fn = {};
    (fn[uu(0x767)] = uu(0x60b)),
      (fn[uu(0x300)] = [
        uu(0xbc2),
        uu(0x114),
        uu(0x531),
        uu(0x864),
        uu(0xe62),
        uu(0x486),
        uu(0x8b4),
      ]);
    const fo = {};
    (fo[uu(0x767)] = uu(0xdd8)), (fo[uu(0x300)] = [uu(0xac3)]);
    const fp = {};
    (fp[uu(0x767)] = uu(0x59d)),
      (fp[uu(0x300)] = [uu(0xc07), uu(0xb26), uu(0x7d1), uu(0x320)]);
    const fq = {};
    (fq[uu(0x767)] = uu(0x52b)), (fq[uu(0x300)] = [uu(0xdfc), uu(0xe61)]);
    const fr = {};
    (fr[uu(0x767)] = uu(0xdee)),
      (fr[uu(0x300)] = [uu(0x8df), uu(0x2d8), uu(0x445), uu(0xbf3)]);
    const fs = {};
    (fs[uu(0x767)] = uu(0xb1c)),
      (fs[uu(0x300)] = [uu(0xc01), uu(0x697), uu(0x345), uu(0x34b)]);
    const ft = {};
    (ft[uu(0x767)] = uu(0x9a6)),
      (ft[uu(0x300)] = [
        uu(0x8ae),
        uu(0x70f),
        uu(0x42f),
        uu(0x618),
        uu(0x2b6),
        uu(0x4ca),
      ]);
    const fu = {};
    (fu[uu(0x767)] = uu(0x898)), (fu[uu(0x300)] = [uu(0xba8)]);
    const fv = {};
    (fv[uu(0x767)] = uu(0x933)), (fv[uu(0x300)] = [uu(0x108), uu(0xc8b)]);
    const fw = {};
    (fw[uu(0x767)] = uu(0x22d)),
      (fw[uu(0x300)] = [uu(0x4bc), uu(0x2d9), uu(0xb43)]);
    const fx = {};
    (fx[uu(0x767)] = uu(0x63d)),
      (fx[uu(0x300)] = [uu(0x29b), uu(0x5ae), uu(0x32f), uu(0x586), uu(0x65f)]);
    const fy = {};
    (fy[uu(0x767)] = uu(0x1c9)), (fy[uu(0x300)] = [uu(0x710), uu(0x6c6)]);
    const fz = {};
    (fz[uu(0x767)] = uu(0x688)),
      (fz[uu(0x300)] = [uu(0x830), uu(0x1f8), uu(0x4ba)]);
    const fA = {};
    (fA[uu(0x767)] = uu(0xc1a)), (fA[uu(0x300)] = [uu(0x889)]);
    const fB = {};
    (fB[uu(0x767)] = uu(0x1ae)), (fB[uu(0x300)] = [uu(0x619)]);
    const fC = {};
    (fC[uu(0x767)] = uu(0x88d)), (fC[uu(0x300)] = [uu(0xcf9)]);
    const fD = {};
    (fD[uu(0x767)] = uu(0x9f0)),
      (fD[uu(0x300)] = [uu(0x764), uu(0xc21), uu(0x4d2)]);
    const fE = {};
    (fE[uu(0x767)] = uu(0x4d4)),
      (fE[uu(0x300)] = [
        uu(0x22a),
        uu(0xe2b),
        uu(0x1b0),
        uu(0x357),
        uu(0x976),
        uu(0x4e4),
        uu(0x16b),
        uu(0x6f4),
        uu(0x1e7),
        uu(0x35b),
        uu(0xab5),
        uu(0x9ab),
        uu(0xbd1),
        uu(0x5ed),
      ]);
    const fF = {};
    (fF[uu(0x767)] = uu(0x7a9)),
      (fF[uu(0x300)] = [
        uu(0x4c8),
        uu(0x32b),
        uu(0xd4d),
        uu(0x530),
        uu(0x919),
        uu(0x36c),
        uu(0x285),
        uu(0x19e),
      ]);
    const fG = {};
    (fG[uu(0x767)] = uu(0xbcc)),
      (fG[uu(0x300)] = [
        uu(0x28b),
        uu(0x967),
        uu(0xcb7),
        uu(0x27f),
        uu(0xc9f),
        uu(0x536),
        uu(0xc98),
        uu(0x84a),
        uu(0xbc9),
        uu(0xc6b),
        uu(0x5f5),
        uu(0x4c6),
        uu(0xbc6),
        uu(0x327),
      ]);
    const fH = {};
    (fH[uu(0x767)] = uu(0x987)),
      (fH[uu(0x300)] = [
        uu(0x7c3),
        uu(0x928),
        uu(0xe1f),
        uu(0x8ed),
        uu(0x4ef),
        uu(0x256),
        uu(0xbe2),
      ]);
    const fI = {};
    (fI[uu(0x767)] = uu(0xddd)),
      (fI[uu(0x300)] = [
        uu(0xb45),
        uu(0x7d5),
        uu(0x38f),
        uu(0x384),
        uu(0xbbf),
        uu(0x2be),
        uu(0xb05),
        uu(0x13f),
        uu(0x7cf),
        uu(0xd7e),
        uu(0xbe3),
        uu(0x9f3),
        uu(0xcbb),
        uu(0x19f),
      ]);
    const fJ = {};
    (fJ[uu(0x767)] = uu(0x3b2)),
      (fJ[uu(0x300)] = [
        uu(0x3e0),
        uu(0x7c7),
        uu(0xca7),
        uu(0x1a1),
        uu(0xd77),
        uu(0xc39),
        uu(0xc33),
        uu(0x443),
        uu(0xa70),
        uu(0x245),
        uu(0xcf7),
        uu(0xb32),
        uu(0x1ba),
        uu(0xba0),
        uu(0xc7b),
      ]);
    const fK = {};
    (fK[uu(0x767)] = uu(0x4ad)),
      (fK[uu(0x300)] = [
        uu(0xa8a),
        uu(0x783),
        uu(0xaf0),
        uu(0xc35),
        uu(0x466),
        uu(0x18c),
        uu(0xb77),
        uu(0x3b1),
        uu(0x838),
        uu(0x70b),
        uu(0xe60),
        uu(0xb76),
        uu(0xaf9),
      ]);
    const fL = {};
    (fL[uu(0x767)] = uu(0xcc5)),
      (fL[uu(0x300)] = [
        uu(0xac1),
        uu(0x9cb),
        uu(0xa80),
        uu(0x247),
        uu(0xaeb),
        uu(0x719),
      ]);
    const fM = {};
    (fM[uu(0x767)] = uu(0xfd)),
      (fM[uu(0x300)] = [
        uu(0xcaa),
        uu(0x516),
        uu(0x169),
        uu(0x377),
        uu(0x356),
        uu(0x489),
        uu(0x75b),
        uu(0xaec),
        uu(0x7f4),
      ]);
    const fN = {};
    (fN[uu(0x767)] = uu(0xfd)),
      (fN[uu(0x300)] = [
        uu(0xb75),
        uu(0xe46),
        uu(0x82f),
        uu(0xd87),
        uu(0xa58),
        uu(0x1b1),
        uu(0x986),
        uu(0x3c3),
        uu(0x7d3),
        uu(0x6ae),
        uu(0x1f9),
        uu(0x82b),
        uu(0x54a),
        uu(0x515),
        uu(0x495),
        uu(0xa4a),
        uu(0x1e2),
      ]);
    const fO = {};
    (fO[uu(0x767)] = uu(0x83a)), (fO[uu(0x300)] = [uu(0x3d2), uu(0x76e)]);
    const fP = {};
    (fP[uu(0x767)] = uu(0x227)),
      (fP[uu(0x300)] = [uu(0x7d8), uu(0x413), uu(0x75c)]);
    const fQ = {};
    (fQ[uu(0x767)] = uu(0x6c3)),
      (fQ[uu(0x300)] = [uu(0xa99), uu(0x405), uu(0xb2c), uu(0xbba)]);
    const fR = {};
    (fR[uu(0x767)] = uu(0xbc4)),
      (fR[uu(0x300)] = [
        uu(0x197),
        uu(0x133),
        uu(0x6f1),
        uu(0x966),
        uu(0xce7),
        uu(0xd44),
      ]);
    const fS = {};
    (fS[uu(0x767)] = uu(0x462)), (fS[uu(0x300)] = [uu(0x774)]);
    const fT = {};
    (fT[uu(0x767)] = uu(0x1b2)),
      (fT[uu(0x300)] = [
        uu(0x9b4),
        uu(0xa07),
        uu(0x929),
        uu(0x12c),
        uu(0x3fa),
        uu(0x4f5),
        uu(0x289),
        uu(0xcc3),
      ]);
    const fU = {};
    (fU[uu(0x767)] = uu(0x29d)), (fU[uu(0x300)] = [uu(0x5e9), uu(0x960)]);
    const fV = {};
    (fV[uu(0x767)] = uu(0x654)),
      (fV[uu(0x300)] = [uu(0xc87), uu(0xc77), uu(0x1f6), uu(0xe68), uu(0x40c)]);
    const fW = {};
    (fW[uu(0x767)] = uu(0xdbd)),
      (fW[uu(0x300)] = [
        uu(0x4cd),
        uu(0x7be),
        uu(0x6a5),
        uu(0xd61),
        uu(0xd29),
        uu(0x936),
        uu(0x102),
        uu(0x106),
        uu(0x968),
      ]);
    const fX = {};
    (fX[uu(0x767)] = uu(0xacc)),
      (fX[uu(0x300)] = [
        uu(0xc42),
        uu(0x4a3),
        uu(0x792),
        uu(0x757),
        uu(0x813),
        uu(0x554),
        uu(0x65a),
        uu(0x52c),
      ]);
    const fY = {};
    (fY[uu(0x767)] = uu(0xa87)),
      (fY[uu(0x300)] = [
        uu(0xc9a),
        uu(0xc70),
        uu(0xa3c),
        uu(0x626),
        uu(0x2c7),
        uu(0x1be),
        uu(0x210),
        uu(0xb04),
        uu(0xda7),
      ]);
    const fZ = {};
    (fZ[uu(0x767)] = uu(0xc2c)),
      (fZ[uu(0x300)] = [
        uu(0xd2e),
        uu(0x915),
        uu(0x272),
        uu(0x1be),
        uu(0x306),
        uu(0x6c0),
        uu(0x38a),
        uu(0xa11),
        uu(0xd34),
        uu(0x855),
        uu(0x529),
      ]);
    const g0 = {};
    (g0[uu(0x767)] = uu(0xc2c)),
      (g0[uu(0x300)] = [uu(0xa64), uu(0xaef), uu(0x54c), uu(0x1cf), uu(0x867)]);
    const g1 = {};
    (g1[uu(0x767)] = uu(0x66f)), (g1[uu(0x300)] = [uu(0xc4a), uu(0xc46)]);
    const g2 = {};
    (g2[uu(0x767)] = uu(0x878)), (g2[uu(0x300)] = [uu(0xa8f)]);
    const g3 = {};
    (g3[uu(0x767)] = uu(0x7e0)),
      (g3[uu(0x300)] = [uu(0x167), uu(0xdc8), uu(0x45e), uu(0x517)]);
    const g4 = {};
    (g4[uu(0x767)] = uu(0x16f)),
      (g4[uu(0x300)] = [uu(0x63a), uu(0x7fd), uu(0x2ef), uu(0x455)]);
    const g5 = {};
    (g5[uu(0x767)] = uu(0x16f)),
      (g5[uu(0x300)] = [
        uu(0xb13),
        uu(0xc33),
        uu(0x3ba),
        uu(0x58a),
        uu(0x686),
        uu(0x262),
        uu(0xce2),
        uu(0xe44),
        uu(0xa7e),
        uu(0x428),
        uu(0xa6c),
        uu(0x1ef),
        uu(0x4b6),
        uu(0x336),
        uu(0x8b0),
        uu(0xccc),
        uu(0x900),
        uu(0x1fd),
        uu(0x6b2),
        uu(0x8ff),
      ]);
    const g6 = {};
    (g6[uu(0x767)] = uu(0xc51)),
      (g6[uu(0x300)] = [uu(0x21d), uu(0x1aa), uu(0x61e), uu(0x604)]);
    const g7 = {};
    (g7[uu(0x767)] = uu(0x6b4)),
      (g7[uu(0x300)] = [uu(0x79a), uu(0x35e), uu(0xc1d)]);
    const g8 = {};
    (g8[uu(0x767)] = uu(0x10c)),
      (g8[uu(0x300)] = [
        uu(0xbed),
        uu(0x4af),
        uu(0x624),
        uu(0xcac),
        uu(0x5ce),
        uu(0x563),
        uu(0x350),
        uu(0x7fe),
        uu(0x7b3),
        uu(0xc7e),
        uu(0x3a2),
        uu(0x716),
        uu(0x56a),
        uu(0x348),
        uu(0x419),
      ]);
    const g9 = {};
    (g9[uu(0x767)] = uu(0x21c)), (g9[uu(0x300)] = [uu(0xa47), uu(0xbd9)]);
    const ga = {};
    (ga[uu(0x767)] = uu(0x8f8)),
      (ga[uu(0x300)] = [uu(0x20b), uu(0x159), uu(0x134)]);
    const gb = {};
    (gb[uu(0x767)] = uu(0x291)),
      (gb[uu(0x300)] = [uu(0x631), uu(0xd93), uu(0x5f0)]);
    const gc = {};
    (gc[uu(0x767)] = uu(0xba6)),
      (gc[uu(0x300)] = [uu(0x793), uu(0x1c7), uu(0x235), uu(0x215)]);
    const gd = {};
    (gd[uu(0x767)] = uu(0x96f)),
      (gd[uu(0x300)] = [uu(0x99d), uu(0xe22), uu(0x7e6)]);
    const ge = {};
    (ge[uu(0x767)] = uu(0xc8a)),
      (ge[uu(0x300)] = [
        uu(0xc33),
        uu(0x15b),
        uu(0xddf),
        uu(0xb83),
        uu(0x4a5),
        uu(0x473),
        uu(0x6ea),
        uu(0x6da),
        uu(0x22e),
        uu(0xdcd),
        uu(0x2b5),
        uu(0x3d6),
        uu(0x23b),
        uu(0x338),
        uu(0x872),
        uu(0xe16),
        uu(0x781),
        uu(0xd7a),
        uu(0x55d),
        uu(0x8ba),
        uu(0x3a5),
        uu(0x521),
        uu(0x232),
        uu(0x74c),
      ]);
    const gf = {};
    (gf[uu(0x767)] = uu(0x641)),
      (gf[uu(0x300)] = [uu(0x876), uu(0x64e), uu(0x821), uu(0xacf)]);
    const gg = {};
    (gg[uu(0x767)] = uu(0x650)),
      (gg[uu(0x300)] = [
        uu(0xe3f),
        uu(0x138),
        uu(0xdd0),
        uu(0xc33),
        uu(0x267),
        uu(0x1e5),
        uu(0xde2),
        uu(0x6d5),
      ]);
    const gh = {};
    (gh[uu(0x767)] = uu(0xb72)),
      (gh[uu(0x300)] = [
        uu(0xa7b),
        uu(0x9d2),
        uu(0xcac),
        uu(0x4dc),
        uu(0x5a9),
        uu(0x5de),
        uu(0x41c),
        uu(0xd0c),
        uu(0x961),
        uu(0xc78),
        uu(0xe5f),
        uu(0x378),
        uu(0xe05),
        uu(0xd65),
        uu(0x77e),
        uu(0x886),
        uu(0x600),
      ]);
    const gi = {};
    (gi[uu(0x767)] = uu(0xc29)),
      (gi[uu(0x300)] = [
        uu(0xc20),
        uu(0xa72),
        uu(0x60e),
        uu(0x629),
        uu(0x791),
        uu(0x96a),
        uu(0xc49),
        uu(0x4f3),
        uu(0x5a0),
        uu(0x3d5),
        uu(0xc95),
      ]);
    const gj = {};
    (gj[uu(0x767)] = uu(0x4e6)),
      (gj[uu(0x300)] = [
        uu(0x4b8),
        uu(0x5a7),
        uu(0x568),
        uu(0xd76),
        uu(0xc1e),
        uu(0xabd),
        uu(0xccb),
        uu(0xa20),
        uu(0xd63),
        uu(0x5d8),
      ]);
    const gk = {};
    (gk[uu(0x767)] = uu(0x4e6)),
      (gk[uu(0x300)] = [
        uu(0x28a),
        uu(0xda4),
        uu(0x166),
        uu(0x566),
        uu(0xb67),
        uu(0xb7b),
        uu(0xa54),
        uu(0xbd5),
        uu(0x25f),
        uu(0x910),
      ]);
    const gl = {};
    (gl[uu(0x767)] = uu(0x937)),
      (gl[uu(0x300)] = [
        uu(0xe41),
        uu(0x8f2),
        uu(0x370),
        uu(0x73f),
        uu(0x4f6),
        uu(0x4b2),
        uu(0x703),
        uu(0x259),
        uu(0x76b),
        uu(0x60c),
      ]);
    const gm = {};
    (gm[uu(0x767)] = uu(0x937)),
      (gm[uu(0x300)] = [
        uu(0xa64),
        uu(0xe69),
        uu(0xaf6),
        uu(0xa67),
        uu(0x5f7),
        uu(0x40e),
        uu(0x32a),
        uu(0x6a8),
        uu(0xc9e),
        uu(0x9d1),
        uu(0x1b3),
      ]);
    const gn = {};
    (gn[uu(0x767)] = uu(0xb46)),
      (gn[uu(0x300)] = [uu(0x2ba), uu(0x992), uu(0xae1)]);
    const go = {};
    (go[uu(0x767)] = uu(0xb46)),
      (go[uu(0x300)] = [
        uu(0xac7),
        uu(0x2c4),
        uu(0x478),
        uu(0x44f),
        uu(0x944),
        uu(0xc34),
        uu(0xc8d),
        uu(0x71c),
      ]);
    const gp = {};
    (gp[uu(0x767)] = uu(0x33d)),
      (gp[uu(0x300)] = [uu(0x74f), uu(0x341), uu(0x5cd)]);
    const gq = {};
    (gq[uu(0x767)] = uu(0x33d)),
      (gq[uu(0x300)] = [
        uu(0x607),
        uu(0x7f4),
        uu(0xe54),
        uu(0x266),
        uu(0x62c),
        uu(0x15a),
      ]);
    const gr = {};
    (gr[uu(0x767)] = uu(0x33d)),
      (gr[uu(0x300)] = [uu(0x5e7), uu(0xe3e), uu(0x768), uu(0x1f3)]);
    const gs = {};
    (gs[uu(0x767)] = uu(0x33d)),
      (gs[uu(0x300)] = [
        uu(0xb4c),
        uu(0x738),
        uu(0x849),
        uu(0x9e9),
        uu(0x296),
        uu(0x97a),
        uu(0x93d),
        uu(0x543),
        uu(0x2a0),
        uu(0x687),
        uu(0x3f8),
      ]);
    const gt = {};
    (gt[uu(0x767)] = uu(0x3a8)),
      (gt[uu(0x300)] = [uu(0x49b), uu(0x67d), uu(0x96c)]);
    const gu = {};
    (gu[uu(0x767)] = uu(0x922)),
      (gu[uu(0x300)] = [
        uu(0x68d),
        uu(0x70c),
        uu(0x7f4),
        uu(0xd26),
        uu(0x82d),
        uu(0x2c2),
        uu(0x726),
        uu(0xa3d),
        uu(0x9f5),
        uu(0x8c2),
        uu(0x90c),
        uu(0x1c1),
        uu(0xcac),
        uu(0x4d8),
        uu(0x8cb),
        uu(0x1d8),
        uu(0x756),
        uu(0x649),
        uu(0x47a),
        uu(0xb70),
        uu(0xdd1),
        uu(0x323),
        uu(0xb8f),
        uu(0x732),
        uu(0x877),
        uu(0x337),
        uu(0x2d6),
        uu(0x4cc),
        uu(0xd58),
        uu(0x858),
        uu(0x6c4),
        uu(0xd12),
        uu(0x302),
        uu(0xc1b),
      ]);
    const gv = {};
    (gv[uu(0x767)] = uu(0xba3)), (gv[uu(0x300)] = [uu(0x51c)]);
    const gw = {};
    (gw[uu(0x767)] = uu(0x9f7)),
      (gw[uu(0x300)] = [
        uu(0x742),
        uu(0xbb3),
        uu(0x62b),
        uu(0xd74),
        uu(0x2dd),
        uu(0x477),
        uu(0x1ac),
        uu(0xcac),
        uu(0xd13),
        uu(0x491),
        uu(0x65b),
        uu(0x53b),
        uu(0x177),
        uu(0x6b9),
        uu(0xb8e),
        uu(0xc61),
        uu(0x5e1),
        uu(0x268),
        uu(0x415),
        uu(0x58c),
        uu(0x1c0),
        uu(0xbd3),
        uu(0x182),
        uu(0x115),
        uu(0x6b1),
        uu(0x130),
        uu(0x934),
        uu(0x399),
        uu(0x452),
        uu(0x2bb),
        uu(0xd12),
        uu(0x448),
        uu(0x590),
        uu(0x20c),
        uu(0xc58),
      ]);
    const gx = {};
    (gx[uu(0x767)] = uu(0x963)),
      (gx[uu(0x300)] = [
        uu(0x980),
        uu(0x45d),
        uu(0x839),
        uu(0xc57),
        uu(0x19c),
        uu(0x77f),
        uu(0xcac),
        uu(0x5e2),
        uu(0xace),
        uu(0xd0a),
        uu(0x7ad),
        uu(0x45f),
        uu(0x248),
        uu(0xcb0),
        uu(0xb62),
        uu(0xd25),
        uu(0x2ac),
        uu(0xbf4),
        uu(0x2f1),
        uu(0xcd1),
        uu(0xcde),
        uu(0x5e1),
        uu(0xdfb),
        uu(0x7c0),
        uu(0xc88),
        uu(0x7fb),
        uu(0x86f),
        uu(0x34a),
        uu(0x5fa),
        uu(0x3b6),
        uu(0x666),
        uu(0xe15),
        uu(0xaae),
        uu(0x1f4),
        uu(0xd12),
        uu(0x2ad),
        uu(0xcf1),
        uu(0xc4c),
        uu(0x8c8),
      ]);
    const gy = {};
    (gy[uu(0x767)] = uu(0x9f4)),
      (gy[uu(0x300)] = [
        uu(0x411),
        uu(0x8d7),
        uu(0xd12),
        uu(0x90d),
        uu(0x450),
        uu(0xa86),
        uu(0x6cb),
        uu(0x28f),
        uu(0x8e3),
        uu(0xcac),
        uu(0x162),
        uu(0x4e5),
        uu(0x55b),
        uu(0xc92),
      ]);
    const gz = {};
    (gz[uu(0x767)] = uu(0x4d9)),
      (gz[uu(0x300)] = [uu(0x903), uu(0xe29), uu(0xcea), uu(0xbb0), uu(0x475)]);
    const gA = {};
    (gA[uu(0x767)] = uu(0x652)),
      (gA[uu(0x300)] = [uu(0x759), uu(0x3f1), uu(0xc41), uu(0xd39)]);
    const gB = {};
    (gB[uu(0x767)] = uu(0x652)),
      (gB[uu(0x300)] = [uu(0x7f4), uu(0x3c0), uu(0xe5d)]);
    const gC = {};
    (gC[uu(0x767)] = uu(0x224)),
      (gC[uu(0x300)] = [uu(0xd27), uu(0x11d), uu(0x9ce), uu(0xa21), uu(0xc6d)]);
    const gD = {};
    (gD[uu(0x767)] = uu(0x224)),
      (gD[uu(0x300)] = [uu(0xe3c), uu(0xad2), uu(0x8e8), uu(0x286)]);
    const gE = {};
    (gE[uu(0x767)] = uu(0x224)), (gE[uu(0x300)] = [uu(0xb8a), uu(0x785)]);
    const gF = {};
    (gF[uu(0x767)] = uu(0x737)),
      (gF[uu(0x300)] = [
        uu(0xa22),
        uu(0xc73),
        uu(0xd91),
        uu(0x3d1),
        uu(0x9f8),
        uu(0xc27),
        uu(0x78b),
        uu(0x975),
        uu(0xcf4),
      ]);
    const gG = {};
    (gG[uu(0x767)] = uu(0x42c)),
      (gG[uu(0x300)] = [
        uu(0x6a7),
        uu(0x2c6),
        uu(0x4a2),
        uu(0x7ff),
        uu(0xd17),
        uu(0x264),
        uu(0xdf3),
      ]);
    const gH = {};
    (gH[uu(0x767)] = uu(0x4f9)),
      (gH[uu(0x300)] = [
        uu(0xcf8),
        uu(0xaa3),
        uu(0xdb8),
        uu(0xae3),
        uu(0xb0f),
        uu(0xa48),
        uu(0x48f),
        uu(0x9cd),
        uu(0x271),
        uu(0x8db),
        uu(0x818),
        uu(0xccf),
      ]);
    const gI = {};
    (gI[uu(0x767)] = uu(0xc97)),
      (gI[uu(0x300)] = [
        uu(0x7d0),
        uu(0xe28),
        uu(0xa51),
        uu(0x113),
        uu(0x251),
        uu(0x83f),
        uu(0xb3f),
        uu(0x3fe),
        uu(0x194),
        uu(0xc02),
      ]);
    const gJ = {};
    (gJ[uu(0x767)] = uu(0xc97)),
      (gJ[uu(0x300)] = [
        uu(0x187),
        uu(0x32c),
        uu(0x8a5),
        uu(0x5f3),
        uu(0xb71),
        uu(0x3a3),
      ]);
    const gK = {};
    (gK[uu(0x767)] = uu(0x9d3)),
      (gK[uu(0x300)] = [uu(0x70e), uu(0x55e), uu(0x2ea)]);
    const gL = {};
    (gL[uu(0x767)] = uu(0x9d3)),
      (gL[uu(0x300)] = [uu(0x7f4), uu(0x683), uu(0x43d), uu(0x67a), uu(0x5a6)]);
    const gM = {};
    (gM[uu(0x767)] = uu(0xa01)),
      (gM[uu(0x300)] = [
        uu(0x18f),
        uu(0x2ee),
        uu(0xbda),
        uu(0xb4a),
        uu(0x66c),
        uu(0x214),
        uu(0xd12),
        uu(0x9e1),
        uu(0xcbd),
        uu(0x943),
        uu(0x7ca),
        uu(0x392),
        uu(0xcac),
        uu(0x2b9),
        uu(0xcf6),
        uu(0xb40),
        uu(0x9bd),
        uu(0x5bb),
        uu(0x28e),
      ]);
    const gN = {};
    (gN[uu(0x767)] = uu(0x9e2)),
      (gN[uu(0x300)] = [
        uu(0x321),
        uu(0x8fe),
        uu(0x59f),
        uu(0x745),
        uu(0xb4e),
        uu(0x871),
        uu(0x81f),
        uu(0xcb5),
      ]);
    const gO = {};
    (gO[uu(0x767)] = uu(0x9e2)), (gO[uu(0x300)] = [uu(0xb9d), uu(0xd6a)]);
    const gP = {};
    (gP[uu(0x767)] = uu(0xb07)), (gP[uu(0x300)] = [uu(0x9b5), uu(0xe0a)]);
    const gQ = {};
    (gQ[uu(0x767)] = uu(0xb07)),
      (gQ[uu(0x300)] = [
        uu(0xb81),
        uu(0x79c),
        uu(0x3cf),
        uu(0xd94),
        uu(0x7d4),
        uu(0x8ce),
        uu(0x38b),
        uu(0x71a),
        uu(0xa1c),
      ]);
    const gR = {};
    (gR[uu(0x767)] = uu(0x53a)), (gR[uu(0x300)] = [uu(0xa35), uu(0xb5f)]);
    const gS = {};
    (gS[uu(0x767)] = uu(0x53a)),
      (gS[uu(0x300)] = [
        uu(0x8c6),
        uu(0xe0d),
        uu(0x82c),
        uu(0xa45),
        uu(0x9c4),
        uu(0x37b),
        uu(0x1ad),
        uu(0x7f4),
        uu(0x2f0),
      ]);
    const gT = {};
    (gT[uu(0x767)] = uu(0x2f4)), (gT[uu(0x300)] = [uu(0x49d)]);
    const gU = {};
    (gU[uu(0x767)] = uu(0x2f4)),
      (gU[uu(0x300)] = [
        uu(0x4bb),
        uu(0x3b9),
        uu(0x30a),
        uu(0x810),
        uu(0x7f4),
        uu(0x75a),
        uu(0x467),
      ]);
    const gV = {};
    (gV[uu(0x767)] = uu(0x2f4)),
      (gV[uu(0x300)] = [uu(0x3f3), uu(0x97c), uu(0xd6b)]);
    const gW = {};
    (gW[uu(0x767)] = uu(0x50c)),
      (gW[uu(0x300)] = [uu(0x2f0), uu(0x417), uu(0x2d1), uu(0xa9c)]);
    const gX = {};
    (gX[uu(0x767)] = uu(0x50c)), (gX[uu(0x300)] = [uu(0x243)]);
    const gY = {};
    (gY[uu(0x767)] = uu(0x50c)),
      (gY[uu(0x300)] = [uu(0x48d), uu(0xb27), uu(0xa37), uu(0x3b8), uu(0xb82)]);
    const gZ = {};
    (gZ[uu(0x767)] = uu(0x14d)),
      (gZ[uu(0x300)] = [uu(0x794), uu(0x4d1), uu(0x38c)]);
    const h0 = {};
    (h0[uu(0x767)] = uu(0x970)), (h0[uu(0x300)] = [uu(0x544), uu(0x3a7)]);
    const h1 = {};
    (h1[uu(0x767)] = uu(0x3bb)), (h1[uu(0x300)] = [uu(0x66a), uu(0xa76)]);
    const h2 = {};
    (h2[uu(0x767)] = uu(0x866)), (h2[uu(0x300)] = [uu(0x4fa)]);
    var h3 = [
      fc(uu(0xb84)),
      fc(uu(0xd42)),
      fc(uu(0x449)),
      fc(uu(0xd3c)),
      fc(uu(0xe35)),
      fc(uu(0x750)),
      fc(uu(0xaf5)),
      fc(uu(0xd05)),
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
    console[uu(0x21f)](uu(0xe1a));
    var h4 = Date[uu(0x5b6)]() < 0x18e9c4b6482,
      h5 = Math[uu(0xb54)](Math[uu(0x66d)]() * 0xa);
    function h6(rp) {
      const uR = uu,
        rq = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let rr = "";
      for (const rs of rp) {
        rs === "\x20"
          ? (rr += "\x20")
          : (rr += rq[(h5 + rs[uR(0x80b)](0x0)) % rq[uR(0xc60)]]);
      }
      return rr;
    }
    h4 &&
      document[uu(0x5d6)](uu(0x5eb))[uu(0x13b)](
        uu(0x5b9),
        h6(uu(0xb35)) + uu(0x632)
      );
    function h7(rp, rq, rr) {
      const uS = uu,
        rs = rq - rp;
      if (Math[uS(0x6e2)](rs) < 0.01) return rq;
      return rp + rs * (0x1 - Math[uS(0xc28)](-rr * pQ));
    }
    var h8 = [],
      h9 = 0x0;
    function ha(rp, rq = 0x1388) {
      const uT = uu,
        rr = nP(uT(0x83c) + jv(rp) + uT(0xa3b));
      kG[uT(0xd82)](rr);
      let rs = 0x0;
      rt();
      function rt() {
        const uU = uT;
        (rr[uU(0xa09)][uU(0xb34)] = uU(0x89c) + h9 + uU(0x13a)),
          (rr[uU(0xa09)][uU(0x844)] = rs);
      }
      (this[uT(0xda1)] = ![]),
        (this[uT(0x630)] = () => {
          const uV = uT;
          rq -= pP;
          const ru = rq > 0x0 ? 0x1 : 0x0;
          (rs = h7(rs, ru, 0.3)),
            rt(),
            rq < 0x0 &&
              rs <= 0x0 &&
              (rr[uV(0x5e5)](), (this[uV(0xda1)] = !![])),
            (h9 += rs * (rr[uV(0x9d8)] + 0x5));
        }),
        h8[uT(0x7b8)](this);
    }
    function hb(rp) {
      new ha(rp, 0x1388);
    }
    function hc() {
      const uW = uu;
      h9 = 0x0;
      for (let rp = h8[uW(0xc60)] - 0x1; rp >= 0x0; rp--) {
        const rq = h8[rp];
        rq[uW(0x630)](), rq[uW(0xda1)] && h8[uW(0xc15)](rp, 0x1);
      }
    }
    var hd = !![],
      he = document[uu(0x5d6)](uu(0x44e));
    fetch(uu(0x175))
      [uu(0x535)]((rp) => {
        const uX = uu;
        (he[uX(0xa09)][uX(0xd21)] = uX(0x89b)), (hd = ![]);
      })
      [uu(0x5e0)]((rp) => {
        const uY = uu;
        he[uY(0xa09)][uY(0xd21)] = "";
      });
    var hf = document[uu(0x5d6)](uu(0x885)),
      hg = Date[uu(0x5b6)]();
    function hh() {
      const uZ = uu;
      console[uZ(0x21f)](uZ(0x6c7)),
        (hg = Date[uZ(0x5b6)]()),
        (hf[uZ(0xa09)][uZ(0xd21)] = "");
      try {
        aiptag[uZ(0xc84)][uZ(0xd21)][uZ(0x7b8)](function () {
          const v0 = uZ;
          aipDisplayTag[v0(0xd21)](v0(0x504));
        }),
          aiptag[uZ(0xc84)][uZ(0xd21)][uZ(0x7b8)](function () {
            const v1 = uZ;
            aipDisplayTag[v1(0xd21)](v1(0x755));
          });
      } catch (rp) {
        console[uZ(0x21f)](uZ(0xd96));
      }
    }
    setInterval(function () {
      const v2 = uu;
      hf[v2(0xa09)][v2(0xd21)] === "" &&
        Date[v2(0x5b6)]() - hg > 0x7530 &&
        hh();
    }, 0x2710);
    var hi = null,
      hj = 0x0;
    function hk() {
      const v3 = uu;
      console[v3(0x21f)](v3(0xe0f)),
        typeof aiptag[v3(0xab1)] !== v3(0x784)
          ? ((hi = 0x45),
            (hj = Date[v3(0x5b6)]()),
            aiptag[v3(0xc84)][v3(0xbfd)][v3(0x7b8)](function () {
              const v4 = v3;
              aiptag[v4(0xab1)][v4(0x6a3)]();
            }))
          : window[v3(0x36a)](v3(0xd3d));
    }
    window[uu(0x36a)] = function (rp) {
      const v5 = uu;
      console[v5(0x21f)](v5(0x4fc) + rp);
      if (rp === v5(0x242) || rp[v5(0x6ee)](v5(0xcec)) > -0x1) {
        if (hi !== null && Date[v5(0x5b6)]() - hj > 0xbb8) {
          console[v5(0x21f)](v5(0xcee));
          if (hV) {
            const rq = {};
            (rq[v5(0x767)] = v5(0xa62)),
              (rq[v5(0x6e0)] = ![]),
              kH(
                v5(0xdbf),
                (rr) => {
                  const v6 = v5;
                  rr &&
                    hV &&
                    (ik(new Uint8Array([cH[v6(0x149)]])), hJ(v6(0xb6c)));
                },
                rq
              );
          }
        } else hJ(v5(0x1a5));
      } else alert(v5(0x7d2) + rp);
      hl[v5(0x487)][v5(0x5e5)](v5(0x95f)), (hi = null);
    };
    var hl = document[uu(0x5d6)](uu(0x39f));
    (hl[uu(0x46d)] = function () {
      const v7 = uu;
      hl[v7(0x487)][v7(0x8d8)](v7(0x95f)), hk();
    }),
      (hl[uu(0xd7f)] = function () {
        const v8 = uu;
        return nP(
          v8(0x9fb) + hO[v8(0xca6)] + v8(0x141) + hO[v8(0x2e6)] + v8(0x41a)
        );
      }),
      (hl[uu(0x9b0)] = !![]);
    var hm = [
        uu(0xcfc),
        uu(0x153),
        uu(0xafd),
        uu(0x508),
        uu(0x3e7),
        uu(0x8e1),
        uu(0xba5),
        uu(0xbe1),
        uu(0x596),
        uu(0xbab),
        uu(0x180),
        uu(0x28c),
      ],
      hn = document[uu(0x5d6)](uu(0xe31)),
      ho =
        Date[uu(0x5b6)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[uu(0xb54)](Math[uu(0x66d)]() * hm[uu(0xc60)]);
    hq();
    function hp(rp) {
      const v9 = uu;
      (ho += rp),
        ho < 0x0 ? (ho = hm[v9(0xc60)] - 0x1) : (ho %= hm[v9(0xc60)]),
        hq();
    }
    function hq() {
      const va = uu,
        rp = hm[ho];
      (hn[va(0xa09)][va(0xd37)] =
        va(0x6b3) + rp[va(0xc24)](va(0xda5))[0x1] + va(0x5db)),
        (hn[va(0x46d)] = function () {
          const vb = va;
          window[vb(0x20a)](rp, vb(0x7a8)), hp(0x1);
        });
    }
    (document[uu(0x5d6)](uu(0xbb5))[uu(0x46d)] = function () {
      hp(-0x1);
    }),
      (document[uu(0x5d6)](uu(0x9e0))[uu(0x46d)] = function () {
        hp(0x1);
      });
    var hr = document[uu(0x5d6)](uu(0xd5f));
    hr[uu(0xd7f)] = function () {
      const vc = uu;
      return nP(
        vc(0x9fb) + hO[vc(0xca6)] + vc(0x4ec) + hO[vc(0x274)] + vc(0xdaf)
      );
    };
    var hs = document[uu(0x5d6)](uu(0x617)),
      ht = document[uu(0x5d6)](uu(0xb7f)),
      hu = ![];
    function hv() {
      const vd = uu;
      let rp = "";
      for (let rr = 0x0; rr < h3[vd(0xc60)]; rr++) {
        const { title: rs, content: rt } = h3[rr];
        (rp += vd(0x3bf) + rs + vd(0x395)),
          rt[vd(0xa2e)]((ru, rv) => {
            const ve = vd;
            let rw = "-\x20";
            if (ru[0x0] === "*") {
              const rx = ru[rv + 0x1];
              if (rx && rx[0x0] === "*") rw = ve(0x118);
              else rw = ve(0x1b6);
              ru = ru[ve(0xb56)](0x1);
            }
            (ru = rw + ru), (rp += ve(0xae9) + ru + ve(0x9ea));
          }),
          (rp += vd(0xd15));
      }
      const rq = hC[vd(0x965)];
      (hu = rq !== void 0x0 && parseInt(rq) < fb), (hs[vd(0x679)] = rp);
    }
    CanvasRenderingContext2D[uu(0xa6a)][uu(0xd57)] = function (rp) {
      const vf = uu;
      this[vf(0x5df)](rp, rp);
    };
    var hw = ![];
    hw &&
      (OffscreenCanvasRenderingContext2D[uu(0xa6a)][uu(0xd57)] = function (rp) {
        const vg = uu;
        this[vg(0x5df)](rp, rp);
      });
    function hx(rp, rq, rr) {
      const rs = 0x1 - rr;
      return [
        rp[0x0] * rr + rq[0x0] * rs,
        rp[0x1] * rr + rq[0x1] * rs,
        rp[0x2] * rr + rq[0x2] * rs,
      ];
    }
    var hy = {};
    function hz(rp) {
      const vh = uu;
      return (
        !hy[rp] &&
          (hy[rp] = [
            parseInt(rp[vh(0xb56)](0x1, 0x3), 0x10),
            parseInt(rp[vh(0xb56)](0x3, 0x5), 0x10),
            parseInt(rp[vh(0xb56)](0x5, 0x7), 0x10),
          ]),
        hy[rp]
      );
    }
    var hA = document[uu(0x57c)](uu(0x807)),
      hB = document[uu(0x828)](uu(0x659));
    for (let rp = 0x0; rp < hB[uu(0xc60)]; rp++) {
      const rq = hB[rp],
        rr = f8[rq[uu(0x1af)](uu(0x49e))];
      rr && rq[uu(0x201)](nP(rr), rq[uu(0x87b)][0x0]);
    }
    var hC;
    try {
      hC = localStorage;
    } catch (rs) {
      console[uu(0x37c)](uu(0x931), rs), (hC = {});
    }
    var hD = document[uu(0x5d6)](uu(0x310)),
      hE = document[uu(0x5d6)](uu(0x26b)),
      hF = document[uu(0x5d6)](uu(0xcc1));
    (hD[uu(0xd7f)] = function () {
      const vi = uu;
      return nP(
        vi(0x2cc) + hO[vi(0xc03)] + vi(0x368) + cM + vi(0x34d) + cL + vi(0x991)
      );
    }),
      (hE[uu(0x62e)] = cL),
      (hE[uu(0x510)] = function () {
        const vj = uu;
        !cN[vj(0xbe9)](this[vj(0xc04)]) &&
          (this[vj(0xc04)] = this[vj(0xc04)][vj(0x88f)](cO, ""));
      });
    var hG,
      hH = document[uu(0x5d6)](uu(0xc40));
    function hI(rt) {
      const vk = uu;
      rt ? k7(hH, rt + vk(0x51e)) : k7(hH, vk(0xb95)),
        (hD[vk(0xa09)][vk(0xd21)] =
          rt && rt[vk(0x6ee)]("\x20") === -0x1 ? vk(0x89b) : "");
    }
    hF[uu(0x46d)] = nu(function () {
      const vl = uu;
      if (!hV || jx) return;
      const rt = hE[vl(0xc04)],
        ru = rt[vl(0xc60)];
      if (ru < cM) hb(vl(0xdbe));
      else {
        if (ru > cL) hb(vl(0xbad));
        else {
          if (!cN[vl(0xbe9)](rt)) hb(vl(0xd23));
          else {
            hb(vl(0x5fb), hO[vl(0x274)]), (hG = rt);
            const rv = new Uint8Array([
              cH[vl(0xda3)],
              ...new TextEncoder()[vl(0xb80)](rt),
            ]);
            ik(rv);
          }
        }
      }
    });
    function hJ(rt, ru = nh[uu(0x648)]) {
      nk(-0x1, null, rt, ru);
    }
    hv();
    var hK = f3(cQ),
      hL = f3(cR),
      hM = f3(d8);
    const hN = {};
    (hN[uu(0xc03)] = uu(0xc4b)),
      (hN[uu(0x274)] = uu(0xb5d)),
      (hN[uu(0x8f4)] = uu(0xdc5)),
      (hN[uu(0xb41)] = uu(0xa17)),
      (hN[uu(0xa3f)] = uu(0x812)),
      (hN[uu(0x2e6)] = uu(0xc5a)),
      (hN[uu(0xca6)] = uu(0x3ed)),
      (hN[uu(0x318)] = uu(0xce0)),
      (hN[uu(0xa9b)] = uu(0x6bb));
    var hO = hN,
      hP = Object[uu(0x17d)](hO),
      hQ = [];
    for (let rt = 0x0; rt < hP[uu(0xc60)]; rt++) {
      const ru = hP[rt],
        rv = ru[uu(0xb56)](0x4, ru[uu(0x6ee)](")"))
          [uu(0xc24)](",\x20")
          [uu(0x91f)]((rw) => parseInt(rw) * 0.8);
      hQ[uu(0x7b8)](q0(rv));
    }
    hR(uu(0xa05), uu(0x87f)),
      hR(uu(0xcf2), uu(0x9ec)),
      hR(uu(0x94e), uu(0x95c)),
      hR(uu(0x786), uu(0xdf9)),
      hR(uu(0x674), uu(0x48a)),
      hR(uu(0x743), uu(0x349)),
      hR(uu(0xd90), uu(0x225));
    function hR(rw, rx) {
      const vm = uu;
      document[vm(0x5d6)](rw)[vm(0x46d)] = function () {
        const vn = vm;
        window[vn(0x20a)](rx, vn(0x7a8));
      };
    }
    setInterval(function () {
      const vo = uu;
      hV && ik(new Uint8Array([cH[vo(0x48c)]]));
    }, 0x3e8);
    function hS() {
      const vp = uu;
      (pM = [pT]),
        (j5[vp(0xc6e)] = !![]),
        (j5 = {}),
        (jF = 0x0),
        (jG[vp(0xc60)] = 0x0),
        (iv = []),
        (iF[vp(0xc60)] = 0x0),
        (iB[vp(0x679)] = ""),
        (iu = {}),
        (iG = ![]),
        (ix = null),
        (iw = null),
        (pC = 0x0),
        (hV = ![]),
        (mD = 0x0),
        (mC = 0x0),
        (mn = ![]),
        (mj[vp(0xa09)][vp(0xd21)] = vp(0x89b)),
        (q4[vp(0xa09)][vp(0xd21)] = q3[vp(0xa09)][vp(0xd21)] = vp(0x89b)),
        (pA = 0x0),
        (pB = 0x0);
    }
    var hT;
    function hU(rw) {
      const vq = uu;
      (jg[vq(0xa09)][vq(0xd21)] = vq(0x89b)),
        (ph[vq(0xa09)][vq(0xd21)] = vq(0x89b)),
        hY(),
        kz[vq(0x487)][vq(0x8d8)](vq(0x7f2)),
        kA[vq(0x487)][vq(0x5e5)](vq(0x7f2)),
        hS(),
        console[vq(0x21f)](vq(0x5af) + rw + vq(0x20d)),
        it(),
        (hT = new WebSocket(rw)),
        (hT[vq(0x90e)] = vq(0xa9e)),
        (hT[vq(0x93f)] = hW),
        (hT[vq(0x88c)] = k0),
        (hT[vq(0x438)] = kf);
    }
    crypto[uu(0xbc8)] =
      crypto[uu(0xbc8)] ||
      function rw() {
        const vr = uu;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vr(0x88f)
        ](/[018]/g, (rx) =>
          (rx ^
            (crypto[vr(0x11e)](new Uint8Array(0x1))[0x0] &
              (0xf >> (rx / 0x4))))[vr(0x7bc)](0x10)
        );
      };
    var hV = ![];
    function hW() {
      const vs = uu;
      console[vs(0x21f)](vs(0x94f)), ic();
      hack.chatFunc = hJ;
      hack.numFunc = iI;
      hack.preload();
    }
    var hX = document[uu(0x5d6)](uu(0x317));
    function hY() {
      const vt = uu;
      hX[vt(0xa09)][vt(0xd21)] = vt(0x89b);
    }
    var hZ = document[uu(0x5d6)](uu(0x238)),
      i0 = document[uu(0x5d6)](uu(0x4cb)),
      i1 = document[uu(0x5d6)](uu(0xab3)),
      i2 = document[uu(0x5d6)](uu(0x984));
    i2[uu(0x46d)] = function () {
      const vu = uu;
      !i5 &&
        (window[vu(0xb79)][vu(0x136)] =
          vu(0x90b) +
          encodeURIComponent(!window[vu(0x2ce)] ? vu(0xcd3) : vu(0xbc0)) +
          vu(0x9eb) +
          encodeURIComponent(btoa(i4)));
    };
    var i3 = document[uu(0x5d6)](uu(0x1bd));
    (i3[uu(0x46d)] = function () {
      const vv = uu;
      i4 == hC[vv(0x751)] && delete hC[vv(0x751)];
      delete hC[vv(0x37e)];
      if (hT)
        try {
          hT[vv(0xc75)]();
        } catch (rx) {}
    }),
      hY();
    var i4, i5;
    function i6(rx) {
      const vx = uu;
      try {
        let rz = function (rA) {
          const vw = b;
          return rA[vw(0x88f)](/([.*+?\^$(){}|\[\]\/\\])/g, vw(0x31b));
        };
        var ry = document[vx(0x365)][vx(0xcc0)](
          RegExp(vx(0x2cf) + rz(rx) + vx(0x47b))
        );
        return ry ? ry[0x1] : null;
      } catch (rA) {
        return "";
      }
    }
    var i7 = !window[uu(0x2ce)];
    function i8(rx) {
      const vy = uu;
      try {
        document[vy(0x365)] = rx + vy(0xdae) + (i7 ? vy(0x803) : "");
      } catch (ry) {}
    }
    var i9 = 0x0,
      ia;
    function ib() {
      const vz = uu;
      (i9 = 0x0), (hV = ![]);
      !eU(hC[vz(0x751)]) && (hC[vz(0x751)] = crypto[vz(0xbc8)]());
      (i4 = hC[vz(0x751)]), (i5 = hC[vz(0x37e)]);
      !i5 &&
        ((i5 = i6(vz(0x37e))),
        i5 && (i5 = decodeURIComponent(i5)),
        i8(vz(0x37e)));
      if (i5)
        try {
          const rx = i5;
          i5 = JSON[vz(0x386)](decodeURIComponent(escape(atob(rx))));
          if (eU(i5[vz(0x808)]))
            (i4 = i5[vz(0x808)]),
              i0[vz(0x13b)](vz(0x5b9), i5[vz(0x670)]),
              i5[vz(0x788)] &&
                (i1[vz(0xa09)][vz(0xd37)] = vz(0x6dc) + i5[vz(0x788)] + ")"),
              (hC[vz(0x37e)] = rx);
          else throw new Error(vz(0x8a1));
        } catch (ry) {
          (i5 = null), delete hC[vz(0x37e)], console[vz(0x648)](vz(0x74d) + ry);
        }
      ia = hC[vz(0x892)] || "";
    }
    function ic() {
      ib(), ih();
    }
    function ie() {
      const vA = uu,
        rx = [
          vA(0xdb3),
          vA(0x212),
          vA(0xdf7),
          vA(0xa41),
          vA(0xd07),
          vA(0xc32),
          vA(0xaf4),
          vA(0x754),
          vA(0x8cc),
          vA(0x2bf),
          vA(0x6f8),
          vA(0x609),
          vA(0x124),
          vA(0x439),
          vA(0x494),
          vA(0x8c1),
          vA(0xd19),
          vA(0x313),
          vA(0xe42),
          vA(0xe4e),
          vA(0x52e),
          vA(0xe67),
          vA(0x5bc),
          vA(0x43b),
          vA(0xe0e),
          vA(0xb19),
          vA(0x10f),
          vA(0xaa0),
          vA(0xce5),
          vA(0x6f6),
          vA(0x690),
          vA(0xdbc),
          vA(0x616),
          vA(0x92f),
          vA(0x303),
          vA(0x191),
          vA(0x897),
          vA(0x279),
          vA(0xb90),
          vA(0x881),
          vA(0xa92),
          vA(0x594),
          vA(0xdd5),
          vA(0x1d1),
          vA(0xdc9),
          vA(0x8d2),
          vA(0x952),
          vA(0x533),
          vA(0x95e),
          vA(0x998),
          vA(0x3c4),
          vA(0x6a0),
          vA(0xc3b),
          vA(0x815),
          vA(0xd5a),
          vA(0x512),
          vA(0xbf0),
          vA(0x122),
          vA(0xe5b),
          vA(0x295),
          vA(0x4b9),
          vA(0xdf0),
          vA(0xda0),
          vA(0x60a),
        ];
      return (
        (ie = function () {
          return rx;
        }),
        ie()
      );
    }
    function ig(rx, ry) {
      const rz = ie();
      return (
        (ig = function (rA, rB) {
          const vB = b;
          rA = rA - (0x67c * -0x1 + -0x2 * -0xbdd + -0x5 * 0x35b);
          let rC = rz[rA];
          if (ig[vB(0x962)] === void 0x0) {
            var rD = function (rI) {
              const vC = vB,
                rJ = vC(0x6d3);
              let rK = "",
                rL = "";
              for (
                let rM = 0xc6a + -0x161c + -0x22 * -0x49,
                  rN,
                  rO,
                  rP = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rO = rI[vC(0xff)](rP++));
                ~rO &&
                ((rN =
                  rM % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? rN * (0x2422 + -0x5 * 0x38b + -0x122b) + rO
                    : rO),
                rM++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rK += String[vC(0x70a)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (rN >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rM) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rO = rJ[vC(0x6ee)](rO);
              }
              for (
                let rQ = 0x23d0 + 0x13 * -0xdf + -0x1343, rR = rK[vC(0xc60)];
                rQ < rR;
                rQ++
              ) {
                rL +=
                  "%" +
                  ("00" +
                    rK[vC(0x80b)](rQ)[vC(0x7bc)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vC(0xb56)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
              }
              return decodeURIComponent(rL);
            };
            const rH = function (rI, rJ) {
              const vD = vB;
              let rK = [],
                rL = -0x3 * 0x542 + -0x7d7 * 0x3 + 0x274b,
                rM,
                rN = "";
              rI = rD(rI);
              let rO;
              for (
                rO = 0x2205 + 0x3ac + -0x1 * 0x25b1;
                rO < 0x1e33 + 0x1 * -0x181 + -0x5 * 0x58a;
                rO++
              ) {
                rK[rO] = rO;
              }
              for (
                rO = 0x91f * 0x4 + -0x554 + -0x1 * 0x1f28;
                rO < 0x2e * 0x43 + 0x12 * 0xc5 + -0x84c * 0x3;
                rO++
              ) {
                (rL =
                  (rL + rK[rO] + rJ[vD(0x80b)](rO % rJ[vD(0xc60)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rM = rK[rO]),
                  (rK[rO] = rK[rL]),
                  (rK[rL] = rM);
              }
              (rO = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rL = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rP = -0x1d30 + -0x23c8 + 0x40f8;
                rP < rI[vD(0xc60)];
                rP++
              ) {
                (rO =
                  (rO + (0x2309 * -0x1 + 0x5 * -0x8b + -0x1 * -0x25c1)) %
                  (0xc5 * -0x1d + -0x1f03 + 0x3654)),
                  (rL =
                    (rL + rK[rO]) %
                    (-0x5 * -0x256 + 0x1cf * 0x2 + -0x1e * 0x7a)),
                  (rM = rK[rO]),
                  (rK[rO] = rK[rL]),
                  (rK[rL] = rM),
                  (rN += String[vD(0x70a)](
                    rI[vD(0x80b)](rP) ^
                      rK[(rK[rO] + rK[rL]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return rN;
            };
            (ig[vB(0x41e)] = rH), (rx = arguments), (ig[vB(0x962)] = !![]);
          }
          const rE = rz[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rF = rA + rE,
            rG = rx[rF];
          return (
            !rG
              ? (ig[vB(0x292)] === void 0x0 && (ig[vB(0x292)] = !![]),
                (rC = ig[vB(0x41e)](rC, rB)),
                (rx[rF] = rC))
              : (rC = rG),
            rC
          );
        }),
        ig(rx, ry)
      );
    }
    (function (rx, ry) {
      const vE = uu;
      function rz(rF, rG, rH, rI, rJ) {
        return ig(rI - 0x124, rJ);
      }
      function rA(rF, rG, rH, rI, rJ) {
        return ig(rG - -0x245, rF);
      }
      function rB(rF, rG, rH, rI, rJ) {
        return ig(rJ - -0x1b4, rI);
      }
      function rC(rF, rG, rH, rI, rJ) {
        return ig(rF - 0x13, rI);
      }
      const rD = rx();
      function rE(rF, rG, rH, rI, rJ) {
        return ig(rH - -0x2b3, rJ);
      }
      while (!![]) {
        try {
          const rF =
            (parseInt(rz(0x1a1, 0x1b2, 0x1a9, 0x1b7, vE(0x1e4))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rB(-0x105, -0x12e, -0x131, vE(0x1e4), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(rz(0x1b5, 0x1c9, 0x1b1, 0x1cb, vE(0x519))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rB(-0x128, -0x132, -0x134, vE(0x463), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rB(-0x131, -0x155, -0x130, vE(0x430), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rC(0x9a, 0xb1, 0xb2, vE(0x519), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(rz(0x1b5, 0x1d3, 0x1bc, 0x1d1, vE(0x99e))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rC(0xb2, 0xbe, 0xb9, vE(0xa34), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(rz(0x183, 0x1ae, 0x197, 0x19e, vE(0x8d9))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rE(-0x244, -0x216, -0x232, -0x217, vE(0x69f))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rB(-0x126, -0x10f, -0x13a, vE(0x258), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rE(-0x203, -0x209, -0x200, -0x1e1, vE(0x329))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rF === ry) break;
          else rD[vE(0x7b8)](rD[vE(0xd43)]());
        } catch (rG) {
          rD[vE(0x7b8)](rD[vE(0xd43)]());
        }
      }
    })(ie, 0xc30df * 0x1 + 0x10f * -0x697 + 0x11613);
    function ih() {
      const vF = uu,
        rx = {
          dEyIJ: function (rJ, rK) {
            return rJ === rK;
          },
          HMRdl:
            rA(vF(0x463), -0x130, -0x106, -0x11f, -0x11d) +
            rA(vF(0xdb9), -0x11a, -0x142, -0x138, -0x135),
          MCQcr: function (rJ, rK) {
            return rJ(rK);
          },
          OVQiZ: function (rJ, rK) {
            return rJ + rK;
          },
          UJCyl: function (rJ, rK) {
            return rJ % rK;
          },
          RniHC: function (rJ, rK) {
            return rJ * rK;
          },
          pKOiA: function (rJ, rK) {
            return rJ < rK;
          },
          ksKNr: function (rJ, rK) {
            return rJ ^ rK;
          },
          pZcMn: function (rJ, rK) {
            return rJ - rK;
          },
          GNeTf: function (rJ, rK) {
            return rJ - rK;
          },
          igRib: function (rJ, rK) {
            return rJ ^ rK;
          },
          GUXBF: function (rJ, rK) {
            return rJ + rK;
          },
          NcAdQ: function (rJ, rK) {
            return rJ % rK;
          },
          hlnUf: function (rJ, rK) {
            return rJ * rK;
          },
          pJhNJ: function (rJ, rK) {
            return rJ(rK);
          },
        };
      if (
        rx[rz(-0x27e, -0x274, -0x265, vF(0x9b3), -0x274)](
          typeof window,
          rx[rB(vF(0xbce), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        rx[rD(-0x17d, -0x171, -0x181, vF(0xe19), -0x16a)](
          typeof kh,
          rx[rz(-0x25a, -0x263, -0x26c, vF(0xdb9), -0x270)]
        )
      )
        return;
      const ry = i4;
      function rz(rJ, rK, rL, rM, rN) {
        return ig(rJ - -0x30c, rM);
      }
      function rA(rJ, rK, rL, rM, rN) {
        return ig(rN - -0x1cb, rJ);
      }
      function rB(rJ, rK, rL, rM, rN) {
        return ig(rN - 0x14c, rJ);
      }
      const rC = ry[rB(vF(0xa34), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function rD(rJ, rK, rL, rM, rN) {
        return ig(rJ - -0x20a, rM);
      }
      const rE = rx[rG(0x43a, vF(0x7f9), 0x40e, 0x428, 0x430)](
        ii,
        rx[rz(-0x28e, -0x27f, -0x272, vF(0xe19), -0x281)](
          rx[rA(vF(0x237), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rC
          ),
          ia[rA(vF(0x376), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rF = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rE[
        rA(vF(0x4e1), -0x11e, -0x149, -0x131, -0x13c) +
          rD(-0x172, -0x16e, -0x175, vF(0xbce), -0x166)
      ](rF++, cH[rD(-0x18e, -0x16e, -0x17a, vF(0x463), -0x1a6)]),
        rE[
          rG(0x415, vF(0x4d3), 0x44c, 0x433, 0x422) +
            rB(vF(0xd08), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rF, cI),
        (rF += -0x3dd + -0x6b5 + 0xa94);
      function rG(rJ, rK, rL, rM, rN) {
        return ig(rM - 0x3a2, rK);
      }
      const rH = rx[rG(0x43c, vF(0xc53), 0x43b, 0x446, 0x459)](
        rx[rz(-0x283, -0x272, -0x298, vF(0x704), -0x26e)](
          cI,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let rJ = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        rx[rB(vF(0x1bc), 0x200, 0x1fc, 0x1fc, 0x1e5)](rJ, rC);
        rJ++
      ) {
        rE[
          rz(-0x287, -0x273, -0x27d, vF(0xbce), -0x27c) +
            rB(vF(0x15d), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rF++,
          rx[rB(vF(0x5a8), 0x201, 0x215, 0x21c, 0x1fc)](
            ry[
              rA(vF(0x7f8), -0x11c, -0x130, -0x128, -0x13b) +
                rz(-0x289, -0x29c, -0x26a, vF(0x376), -0x290)
            ](
              rx[rA(vF(0x843), -0x13a, -0x124, -0x111, -0x120)](
                rx[rA(vF(0x9b3), -0x10d, -0x119, -0x108, -0x128)](rC, rJ),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rH
          )
        );
      }
      if (ia) {
        const rK = ia[rB(vF(0xe19), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rL = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          rx[rB(vF(0x549), 0x21f, 0x216, 0x204, 0x200)](rL, rK);
          rL++
        ) {
          rE[
            rB(vF(0xd08), 0x207, 0x20e, 0x209, 0x202) +
              rB(vF(0x7f8), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rF++,
            rx[rz(-0x25b, -0x256, -0x24f, vF(0xaed), -0x261)](
              ia[
                rz(-0x267, -0x256, -0x25e, vF(0x728), -0x271) +
                  rG(0x412, vF(0x7f8), 0x411, 0x421, 0x425)
              ](
                rx[rG(0x435, vF(0x1e4), 0x427, 0x434, 0x41a)](
                  rx[rA(vF(0x7f3), -0x143, -0x134, -0x133, -0x137)](rK, rL),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rH
            )
          );
        }
      }
      const rI = rE[
        rG(0x423, vF(0x463), 0x44b, 0x440, 0x45a) +
          rz(-0x280, -0x27d, -0x26e, vF(0xd08), -0x288)
      ](
        rx[rD(-0x162, -0x164, -0x161, vF(0xdb9), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          rx[rG(0x429, vF(0x43c), 0x43d, 0x437, 0x44b)](
            rx[rA(vF(0x8d9), -0x10d, -0x127, -0x124, -0x116)](
              cI,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rC
          )
        )
      );
      rx[rG(0x435, vF(0xc26), 0x43b, 0x42a, 0x448)](ik, rE), (i9 = rI);
    }
    function ii(rx) {
      return new DataView(new ArrayBuffer(rx));
    }
    function ij() {
      const vG = uu;
      return hT && hT[vG(0x695)] === WebSocket[vG(0x608)];
    }
    function ik(rx) {
      const vH = uu;
      if (ij()) {
        pD += rx[vH(0x120)];
        if (hV) {
          const ry = new Uint8Array(rx[vH(0xbcf)]);
          for (let rB = 0x0; rB < ry[vH(0xc60)]; rB++) {
            ry[rB] ^= i9;
          }
          const rz = cI % ry[vH(0xc60)],
            rA = ry[0x0];
          (ry[0x0] = ry[rz]), (ry[rz] = rA);
        }
        hT[vH(0x64a)](rx);
      }
    }
    function il(rx, ry = 0x1) {
      const vI = uu;
      let rz = eT(rx);
      const rA = new Uint8Array([
        cH[vI(0x573)],
        rz,
        Math[vI(0xbb6)](ry * 0xff),
      ]);
      ik(rA);
    }
    function im(rx, ry) {
      const rz = io();
      return (
        (im = function (rA, rB) {
          rA = rA - (-0x25b2 + 0x10 * 0x211 + 0x5b2);
          let rC = rz[rA];
          return rC;
        }),
        im(rx, ry)
      );
    }
    function io() {
      const vJ = uu,
        rx = [
          vJ(0x34c),
          vJ(0x67f),
          vJ(0x2ff),
          vJ(0xd99),
          vJ(0x6d2),
          vJ(0x820),
          vJ(0x89e),
          vJ(0xb2e),
          vJ(0xb54),
          vJ(0xdce),
          vJ(0x145),
          vJ(0xb6e),
          vJ(0xb98),
          vJ(0x787),
          vJ(0x9b6),
          vJ(0x6c2),
          vJ(0x8fd),
          vJ(0x97d),
          vJ(0xc3a),
          vJ(0x67b),
        ];
      return (
        (io = function () {
          return rx;
        }),
        io()
      );
    }
    (function (rx, ry) {
      const vK = uu;
      function rz(rF, rG, rH, rI, rJ) {
        return im(rG - -0x22a, rJ);
      }
      const rA = rx();
      function rB(rF, rG, rH, rI, rJ) {
        return im(rI - -0x178, rG);
      }
      function rC(rF, rG, rH, rI, rJ) {
        return im(rI - 0xba, rF);
      }
      function rD(rF, rG, rH, rI, rJ) {
        return im(rF - -0x119, rH);
      }
      function rE(rF, rG, rH, rI, rJ) {
        return im(rH - -0x53, rF);
      }
      while (!![]) {
        try {
          const rF =
            (-parseInt(rD(0x9, -0x1, 0xe, 0x10, 0x0)) /
              (-0x242b + -0x3 * -0x421 + 0x17c9)) *
              (-parseInt(rE(0xc4, 0xb9, 0xc1, 0xb8, 0xc5)) /
                (0xe5b + 0x551 * 0x2 + -0x18fb)) +
            -parseInt(rD(-0x1, -0x5, -0x4, -0x4, 0x2)) /
              (0x49 * -0xb + 0x6 * 0x373 + 0x1 * -0x118c) +
            -parseInt(rB(-0x52, -0x53, -0x4d, -0x55, -0x54)) /
              (-0x10e7 + -0x14a9 + 0x2594) +
            -parseInt(rE(0xcd, 0xc0, 0xc8, 0xc6, 0xcd)) /
              (0x159 + 0x18e * 0x2 + -0x470) +
            (-parseInt(rD(0x6, -0x2, 0x10, 0x2, 0xc)) /
              (-0x1872 * -0x1 + 0x1d62 + -0x35ce)) *
              (-parseInt(rB(-0x65, -0x5d, -0x54, -0x5e, -0x66)) /
                (-0x11c + -0x682 + 0x7a5 * 0x1)) +
            -parseInt(rz(-0x112, -0x11a, -0x115, -0x122, -0x11b)) /
              (-0x2312 + -0x1 * -0x2659 + -0x33f) +
            (-parseInt(rC(0x1dc, 0x1d0, 0x1dd, 0x1d7, 0x1de)) /
              (-0x5 * 0x61f + -0x8b * 0x3e + -0x2027 * -0x2)) *
              (-parseInt(rC(0x1d8, 0x1cf, 0x1d5, 0x1cf, 0x1d5)) /
                (-0x292 * -0xb + 0x13d * -0x13 + -0x4b5));
          if (rF === ry) break;
          else rA[vK(0x7b8)](rA[vK(0xd43)]());
        } catch (rG) {
          rA[vK(0x7b8)](rA[vK(0xd43)]());
        }
      }
    })(io, -0x1 * -0x304f9 + 0x1cdb2 + -0x2848f);
    function ip(rx) {
      function ry(rF, rG, rH, rI, rJ) {
        return im(rF - 0x3df, rI);
      }
      function rz(rF, rG, rH, rI, rJ) {
        return im(rF - 0x12f, rG);
      }
      function rA(rF, rG, rH, rI, rJ) {
        return im(rI - 0x263, rH);
      }
      const rB = {
          xgMol: function (rF) {
            return rF();
          },
          NSlTg: function (rF) {
            return rF();
          },
          BrnPE: function (rF) {
            return rF();
          },
          oiynC: function (rF, rG) {
            return rF(rG);
          },
        },
        rC = new Uint8Array([
          cH[
            rD(0x44e, 0x446, 0x44f, 0x456, 0x44f) +
              rD(0x440, 0x43c, 0x440, 0x448, 0x43d)
          ],
          rB[rA(0x387, 0x37e, 0x37e, 0x381, 0x38b)](iq),
          oQ,
          rB[rE(0x4a2, 0x4a9, 0x4a0, 0x4a8, 0x49f)](iq),
          rB[rz(0x245, 0x243, 0x241, 0x249, 0x24d)](iq),
          ...rB[rA(0x381, 0x389, 0x38e, 0x384, 0x37e)](ir, rx),
        ]);
      function rD(rF, rG, rH, rI, rJ) {
        return im(rF - 0x32e, rG);
      }
      function rE(rF, rG, rH, rI, rJ) {
        return im(rJ - 0x38e, rH);
      }
      rB[rz(0x250, 0x24e, 0x250, 0x246, 0x24a)](ik, rC);
    }
    function iq() {
      function rx(rD, rE, rF, rG, rH) {
        return im(rE - 0xd5, rG);
      }
      function ry(rD, rE, rF, rG, rH) {
        return im(rH - 0x379, rD);
      }
      const rz = {};
      function rA(rD, rE, rF, rG, rH) {
        return im(rH - 0x107, rF);
      }
      rz[rC(-0x1b1, -0x1b7, -0x1bb, -0x1ad, -0x1af)] = function (rD, rE) {
        return rD * rE;
      };
      const rB = rz;
      function rC(rD, rE, rF, rG, rH) {
        return im(rD - -0x2ca, rF);
      }
      return Math[rx(0x1f0, 0x1ec, 0x1f4, 0x1e4, 0x1ea)](
        rB[rC(-0x1b1, -0x1ab, -0x1b8, -0x1b0, -0x1b4)](
          Math[rC(-0x1b7, -0x1bb, -0x1bd, -0x1b7, -0x1b2) + "m"](),
          -0x2573 + -0xe * 0x11e + 0x3616
        )
      );
    }
    function ir(rx) {
      function ry(rz, rA, rB, rC, rD) {
        return im(rD - 0x117, rA);
      }
      return new TextEncoder()[ry(0x22e, 0x22d, 0x237, 0x22b, 0x233) + "e"](rx);
    }
    function is(rx, ry, rz = 0x3c) {
      const vL = uu;
      it(),
        (kj[vL(0x679)] = vL(0x6ab) + rx + vL(0xdf8) + ry + vL(0xc85)),
        kj[vL(0xd82)](hX),
        (hX[vL(0xa09)][vL(0xd21)] = ""),
        (i2[vL(0xa09)][vL(0xd21)] = vL(0x89b)),
        (hZ[vL(0xa09)][vL(0xd21)] = vL(0x89b)),
        (hX[vL(0x5d6)](vL(0x3ec))[vL(0xa09)][vL(0xb97)] = "0"),
        document[vL(0xd31)][vL(0x487)][vL(0x5e5)](vL(0xe21)),
        (kj[vL(0xa09)][vL(0xd21)] = ""),
        (kk[vL(0xa09)][vL(0xd21)] =
          km[vL(0xa09)][vL(0xd21)] =
          kl[vL(0xa09)][vL(0xd21)] =
          kB[vL(0xa09)][vL(0xd21)] =
            vL(0x89b));
      const rA = document[vL(0x5d6)](vL(0x701));
      document[vL(0x5d6)](vL(0x585))[vL(0x46d)] = function () {
        rD();
      };
      let rB = rz;
      k7(rA, vL(0x282) + rB + vL(0xe23));
      const rC = setInterval(() => {
        const vM = vL;
        rB--, rB <= 0x0 ? rD() : k7(rA, vM(0x282) + rB + vM(0xe23));
      }, 0x3e8);
      function rD() {
        const vN = vL;
        clearInterval(rC), k7(rA, vN(0x7d7)), location[vN(0xb17)]();
      }
    }
    function it() {
      const vO = uu;
      if (hT) {
        hT[vO(0x93f)] = hT[vO(0x88c)] = hT[vO(0x438)] = null;
        try {
          hT[vO(0xc75)]();
        } catch (rx) {}
        hT = null;
      }
    }
    var iu = {},
      iv = [],
      iw,
      ix,
      iy = [],
      iz = uu(0xc0c);
    function iA() {
      const vP = uu;
      iz = getComputedStyle(document[vP(0xd31)])[vP(0xd14)];
    }
    var iB = document[uu(0x5d6)](uu(0x5a1)),
      iC = document[uu(0x5d6)](uu(0xbea)),
      iD = document[uu(0x5d6)](uu(0x74e)),
      iE = [],
      iF = [],
      iG = ![],
      iH = 0x0;
    function iI(rx) {
      const vQ = uu;
      if(hack.isEnabled('numberNoSuffix')) return Math.round(rx);
      if (rx < 0.01) return "0";
      rx = Math[vQ(0xbb6)](rx);
      if (rx >= 0x3b9aca00)
        return parseFloat((rx / 0x3b9aca00)[vQ(0x9f2)](0x2)) + "b";
      else {
        if (rx >= 0xf4240)
          return parseFloat((rx / 0xf4240)[vQ(0x9f2)](0x2)) + "m";
        else {
          if (rx >= 0x3e8)
            return parseFloat((rx / 0x3e8)[vQ(0x9f2)](0x1)) + "k";
        }
      }
      return rx;
    }
    function iJ(rx, ry) {
      const vR = uu,
        rz = document[vR(0x57c)](vR(0x807));
      rz[vR(0x9bf)] = vR(0xe65);
      const rA = document[vR(0x57c)](vR(0x807));
      (rA[vR(0x9bf)] = vR(0x6fe)), rz[vR(0xd82)](rA);
      const rB = document[vR(0x57c)](vR(0x7e5));
      rz[vR(0xd82)](rB), iB[vR(0xd82)](rz);
      const rC = {};
      (rC[vR(0xbfe)] = rx),
        (rC[vR(0x606)] = ry),
        (rC[vR(0x57b)] = 0x0),
        (rC[vR(0xd95)] = 0x0),
        (rC[vR(0x983)] = 0x0),
        (rC["el"] = rz),
        (rC[vR(0x17c)] = rA),
        (rC[vR(0x61a)] = rB);
      const rD = rC;
      (rD[vR(0xa8c)] = iF[vR(0xc60)]),
        (rD[vR(0x630)] = function () {
          const vS = vR;
          (this[vS(0x57b)] = pv(this[vS(0x57b)], this[vS(0x606)], 0x64)),
            (this[vS(0x983)] = pv(this[vS(0x983)], this[vS(0xd95)], 0x64)),
            this[vS(0x61a)][vS(0x13b)](
              vS(0x5b9),
              (this[vS(0xbfe)] ? this[vS(0xbfe)] + vS(0x777) : "") +
                iI(this[vS(0x57b)])
            ),
            (this[vS(0x17c)][vS(0xa09)][vS(0x59c)] = this[vS(0x983)] + "%");
        }),
        rD[vR(0x630)](),
        iF[vR(0x7b8)](rD);
    }
    function iK(rx) {
      const vT = uu;
      if (iF[vT(0xc60)] === 0x0) return;
      const ry = iF[0x0];
      ry[vT(0xd95)] = ry[vT(0x983)] = 0x64;
      for (let rz = 0x1; rz < iF[vT(0xc60)]; rz++) {
        const rA = iF[rz];
        (rA[vT(0xd95)] =
          Math[vT(0xd8d)](
            0x1,
            ry[vT(0x606)] === 0x0 ? 0x1 : rA[vT(0x606)] / ry[vT(0x606)]
          ) * 0x64),
          rx && (rA[vT(0x983)] = rA[vT(0xd95)]),
          iB[vT(0xd82)](rA["el"]);
      }
    }
    function iL(rx) {
      const vU = uu,
        ry = new Path2D();
      ry[vU(0xc4d)](...rx[vU(0x9a7)][0x0]);
      for (let rz = 0x0; rz < rx[vU(0x9a7)][vU(0xc60)] - 0x1; rz++) {
        const rA = rx[vU(0x9a7)][rz],
          rB = rx[vU(0x9a7)][rz + 0x1];
        let rC = 0x0;
        const rD = rB[0x0] - rA[0x0],
          rE = rB[0x1] - rA[0x1],
          rF = Math[vU(0xbe5)](rD, rE);
        while (rC < rF) {
          ry[vU(0x91a)](
            rA[0x0] + (rC / rF) * rD + (Math[vU(0x66d)]() * 0x2 - 0x1) * 0x32,
            rA[0x1] + (rC / rF) * rE + (Math[vU(0x66d)]() * 0x2 - 0x1) * 0x32
          ),
            (rC += Math[vU(0x66d)]() * 0x28 + 0x1e);
        }
        ry[vU(0x91a)](...rB);
      }
      rx[vU(0x635)] = ry;
    }
    var iM = 0x0,
      iN = 0x0,
      iO = [],
      iP = {},
      iQ = [],
      iR = {};
    function iS(rx, ry) {
      const vV = uu;
      if (!pa[vV(0x795)]) return;
      let baseHP = hack.getHP(rx);
      let decDmg = rx['nHealth'] - ry;
      let dmg = Math.round(decDmg * 10000) / 100 + '%';
      if(baseHP && hack.isEnabled('DDenableNumber')) dmg = Math.round(decDmg * baseHP);
      if(isNaN(dmg)) dmg = '';
      let rz;
      const rA = rx === void 0x0;
      !rA && (rz = Math[vV(0xbeb)]((rx[vV(0x6b6)] - rx) * 0x64) || 0x1),
        iy[vV(0x7b8)]({
          text: hack.isEnabled('damageDisplay') ? dmg : rz,
          x: rx["x"] + (Math[vV(0x66d)]() * 0x2 - 0x1) * rx[vV(0x423)] * 0.6,
          y: rx["y"] + (Math[vV(0x66d)]() * 0x2 - 0x1) * rx[vV(0x423)] * 0.6,
          vx: (Math[vV(0x66d)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[vV(0x66d)]() * 0x3,
          angle: (Math[vV(0x66d)]() * 0x2 - 0x1) * (rA ? 0x1 : 0.1),
          size: Math[vV(0x9b2)](0x1, (rx[vV(0x423)] * 0.2) / 0x14),
        }),
        rx === ix && (pu = 0x1);
    }
    var iT = 0x0,
      iU = 0x0,
      iV = 0x0,
      iW = 0x0;
    function iX(rx) {
      const vW = uu,
        ry = iu[rx];
      if (ry) {
        ry[vW(0xda1)] = !![];
        if (
          Math[vW(0x6e2)](ry["nx"] - iT) > iV + ry[vW(0x33e)] ||
          Math[vW(0x6e2)](ry["ny"] - iU) > iW + ry[vW(0x33e)]
        )
          ry[vW(0x86c)] = 0xa;
        else !ry[vW(0xdb2)] && iS(ry, 0x0);
        delete iu[rx];
      }
    }
    var iY = [
      uu(0x908),
      uu(0x932),
      uu(0x890),
      uu(0xde5),
      uu(0x152),
      uu(0x663),
      uu(0x1d9),
      uu(0x35c),
      uu(0x31e),
      uu(0xe14),
      uu(0xcc7),
      uu(0x959),
      uu(0x25a),
    ];
    function iZ(rx, ry = ix) {
      const vX = uu;
      (rx[vX(0x908)] = ry[vX(0x908)]),
        (rx[vX(0x932)] = ry[vX(0x932)]),
        (rx[vX(0x890)] = ry[vX(0x890)]),
        (rx[vX(0xde5)] = ry[vX(0xde5)]),
        (rx[vX(0x152)] = ry[vX(0x152)]),
        (rx[vX(0x663)] = ry[vX(0x663)]),
        (rx[vX(0x1d9)] = ry[vX(0x1d9)]),
        (rx[vX(0x35c)] = ry[vX(0x35c)]),
        (rx[vX(0x31e)] = ry[vX(0x31e)]),
        (rx[vX(0xe14)] = ry[vX(0xe14)]),
        (rx[vX(0xbac)] = ry[vX(0xbac)]),
        (rx[vX(0xcc7)] = ry[vX(0xcc7)]),
        (rx[vX(0x9a0)] = ry[vX(0x9a0)]),
        (rx[vX(0x959)] = ry[vX(0x959)]),
        (rx[vX(0x25a)] = ry[vX(0x25a)]);
    }
    function j0() {
      (oY = null), p6(null), (p2 = null), (p0 = ![]), (p1 = 0x0), ok && pL();
    }
    var j1 = 0x64,
      j2 = 0x1,
      j3 = 0x64,
      j4 = 0x1,
      j5 = {},
      j6 = [...Object[uu(0xd6d)](d8)],
      j7 = [...hP];
    j9(j6),
      j9(j7),
      j6[uu(0x7b8)](uu(0x8f3)),
      j7[uu(0x7b8)](hO[uu(0xc03)] || uu(0xa56)),
      j6[uu(0x7b8)](uu(0xd84)),
      j7[uu(0x7b8)](uu(0x79d));
    var j8 = [];
    for (let rx = 0x0; rx < j6[uu(0xc60)]; rx++) {
      const ry = d8[j6[rx]] || 0x0;
      j8[rx] = 0x78 + (ry - d8[uu(0xca6)]) * 0x3c - 0x1 + 0x1;
    }
    function j9(rz) {
      const rA = rz[0x3];
      (rz[0x3] = rz[0x5]), (rz[0x5] = rA);
    }
    var ja = [],
      jb = [];
    function jc(rz) {
      const vY = uu,
        rA = j7[rz],
        rB = nP(
          vY(0x9cf) + j6[rz] + vY(0xaa1) + rA + vY(0x3b3) + rA + vY(0x859)
        ),
        rC = rB[vY(0x5d6)](vY(0x880));
      (j5 = {
        id: rz,
        el: rB,
        state: cS[vY(0x89b)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rB[vY(0x5d6)](vY(0xc43)),
        progressEl: rC,
        barEl: rC[vY(0x5d6)](vY(0x342)),
        textEl: rC[vY(0x5d6)](vY(0x7e5)),
        nameEl: rB[vY(0x5d6)](vY(0xced)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const vZ = vY,
            rD = Math[vZ(0xd8d)](0x1, (pO - this[vZ(0x837)]) / 0x64);
          this[vZ(0xab6)] =
            this[vZ(0xdc2)] + (this[vZ(0xba4)] - this[vZ(0xdc2)]) * rD;
          const rE = this[vZ(0xab6)] - 0x1;
          this[vZ(0x17c)][vZ(0xa09)][vZ(0xb34)] =
            vZ(0x950) + rE * 0x64 + vZ(0xc00) + rE + vZ(0x842);
        },
        update() {
          const w0 = vY,
            rD = jd(this["t"]),
            rE = 0x1 - rD;
          (this["el"][w0(0xa09)][w0(0xb97)] = -0xc8 * rE + "px"),
            (this["el"][w0(0xa09)][w0(0xb34)] = w0(0x185) + -0x64 * rE + "%)");
        },
        remove() {
          const w1 = vY;
          rB[w1(0x5e5)]();
        },
      }),
        (j5[vY(0xc22)][vY(0xa09)][vY(0xd21)] = vY(0x89b)),
        jb[vY(0x7b8)](j5),
        j5[vY(0x630)](),
        ja[vY(0x7b8)](j5),
        kl[vY(0x201)](rB, q1);
    }
    function jd(rz) {
      return 0x1 - (0x1 - rz) * (0x1 - rz);
    }
    function je(rz) {
      const w2 = uu;
      return rz < 0.5
        ? (0x1 - Math[w2(0xdf4)](0x1 - Math[w2(0x3a4)](0x2 * rz, 0x2))) / 0x2
        : (Math[w2(0xdf4)](0x1 - Math[w2(0x3a4)](-0x2 * rz + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jf() {
      const w3 = uu;
      (oz[w3(0x679)] = ""), (oB = {});
    }
    var jg = document[uu(0x5d6)](uu(0x9a9));
    jg[uu(0xa09)][uu(0xd21)] = uu(0x89b);
    var jh = document[uu(0x5d6)](uu(0xae2)),
      ji = [],
      jj = document[uu(0x5d6)](uu(0x43f));
    jj[uu(0x7ae)] = function () {
      jk();
    };
    function jk() {
      const w4 = uu;
      for (let rz = 0x0; rz < ji[w4(0xc60)]; rz++) {
        const rA = ji[rz];
        k7(rA[w4(0x87b)][0x0], jj[w4(0xa61)] ? w4(0x454) : rA[w4(0xa6e)]);
      }
    }
    function jl(rz) {
      const w5 = uu;
      (jg[w5(0xa09)][w5(0xd21)] = ""), (jh[w5(0x679)] = w5(0x9c8));
      const rA = rz[w5(0xc60)];
      ji = [];
      for (let rB = 0x0; rB < rA; rB++) {
        const rC = rz[rB];
        jh[w5(0xd82)](nP(w5(0x69a) + (rB + 0x1) + w5(0x4df))), jm(rC);
      }
      m1[w5(0x538)][w5(0x7f2)]();
    }
    function jm(rz) {
      const w6 = uu;
      for (let rA = 0x0; rA < rz[w6(0xc60)]; rA++) {
        const rB = rz[rA],
          rC = nP(w6(0xe38) + rB + w6(0x817));
        (rC[w6(0xa6e)] = rB),
          rA > 0x0 && ji[w6(0x7b8)](rC),
          (rC[w6(0x46d)] = function () {
            jo(rB);
          }),
          jh[w6(0xd82)](rC);
      }
      jk();
    }
    function jn(rz) {
      const w7 = uu;
      var rA = document[w7(0x57c)](w7(0x311));
      (rA[w7(0xc04)] = rz),
        (rA[w7(0xa09)][w7(0x762)] = "0"),
        (rA[w7(0xa09)][w7(0x9f6)] = "0"),
        (rA[w7(0xa09)][w7(0xdba)] = w7(0xbdf)),
        document[w7(0xd31)][w7(0xd82)](rA),
        rA[w7(0x2af)](),
        rA[w7(0xd9e)]();
      try {
        var rB = document[w7(0x479)](w7(0xd22)),
          rC = rB ? w7(0xd66) : w7(0x4ed);
      } catch (rD) {}
      document[w7(0xd31)][w7(0x740)](rA);
    }
    function jo(rz) {
      const w8 = uu;
      if (!navigator[w8(0xcbf)]) {
        jn(rz);
        return;
      }
      navigator[w8(0xcbf)][w8(0xcd8)](rz)[w8(0x535)](
        function () {},
        function (rA) {}
      );
    }
    var jp = [
        uu(0xe2e),
        uu(0x37d),
        uu(0x507),
        uu(0x94d),
        uu(0xd36),
        uu(0xc96),
        uu(0x33f),
        uu(0x5cf),
        uu(0xd56),
        uu(0x6b0),
        uu(0xb1e),
      ],
      jq = [uu(0x128), uu(0x940), uu(0x446)];
    function jr(rz) {
      const w9 = uu,
        rA = rz ? jq : jp;
      return rA[Math[w9(0xb54)](Math[w9(0x66d)]() * rA[w9(0xc60)])];
    }
    function js(rz) {
      const wa = uu;
      return rz[wa(0xcc0)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var jt = document[uu(0x5d6)](uu(0x192));
    jt[uu(0x46d)] = nu(function (rz) {
      const wb = uu;
      ix && ik(new Uint8Array([cH[wb(0x522)]]));
    });
    var ju = "";
    function jv(rz) {
      const wc = uu;
      return rz[wc(0x88f)](/"/g, wc(0x163));
    }
    function jw(rz) {
      const wd = uu;
      let rA = "";
      for (let rB = 0x0; rB < rz[wd(0xc60)]; rB++) {
        const [rC, rD, rE] = rz[rB];
        rA +=
          wd(0xc47) +
          rC +
          "\x22\x20" +
          (rE ? wd(0x67e) : "") +
          wd(0xd92) +
          jv(rD) +
          wd(0x3bc);
      }
      return wd(0x49c) + rA + wd(0x851);
    }
    var jx = ![];
    function jy() {
      const we = uu;
      return nP(we(0x9fb) + hO[we(0xca6)] + we(0xb15));
    }
    var jz = document[uu(0x5d6)](uu(0x8ea));
    function jA() {
      const wf = uu;
      (oR[wf(0xa09)][wf(0xd21)] = q1[wf(0xa09)][wf(0xd21)] =
        jx ? wf(0x89b) : ""),
        (jz[wf(0xa09)][wf(0xd21)] = kx[wf(0xa09)][wf(0xd21)] =
          jx ? "" : wf(0x89b));
      jx
        ? (ky[wf(0x487)][wf(0x8d8)](wf(0x64f)),
          k7(ky[wf(0x87b)][0x0], wf(0x420)))
        : (ky[wf(0x487)][wf(0x5e5)](wf(0x64f)),
          k7(ky[wf(0x87b)][0x0], wf(0x593)));
      const rz = [hF, ml];
      for (let rA = 0x0; rA < rz[wf(0xc60)]; rA++) {
        const rB = rz[rA];
        rB[wf(0x487)][jx ? wf(0x8d8) : wf(0x5e5)](wf(0x746)),
          (rB[wf(0xd7f)] = jx ? jy : null),
          (rB[wf(0x9b0)] = !![]);
      }
      jB[wf(0xa09)][wf(0xd21)] = nY[wf(0xa09)][wf(0xd21)] = jx ? wf(0x89b) : "";
    }
    var jB = document[uu(0x5d6)](uu(0xc69)),
      jC = document[uu(0x5d6)](uu(0x26c)),
      jD = 0x0,
      jE = 0x3e8 / 0x14,
      jF = 0x0,
      jG = [],
      jH = 0x0,
      jI = ![],
      jJ,
      jK = [],
      jL = {};
    setInterval(() => {
      (jL = {}), (jK = []);
    }, 0x7530);
    function jM(rz, rA) {
      const wg = uu;
      jL[rA] = (jL[rA] || 0x0) + 0x1;
      if (jL[rA] > 0x8) return ![];
      let rB = 0x0;
      for (let rC = jK[wg(0xc60)] - 0x1; rC >= 0x0; rC--) {
        const rD = jK[rC];
        if (nw(rz, rD) > 0.7) {
          rB++;
          if (rB >= 0x5) return ![];
        }
      }
      return jK[wg(0x7b8)](rz), !![];
    }
    var jN = document[uu(0x5d6)](uu(0x226)),
      jO = document[uu(0x5d6)](uu(0x3e1)),
      jP = document[uu(0x5d6)](uu(0xb1d)),
      jQ = document[uu(0x5d6)](uu(0x7c5)),
      jR;
    k7(jP, "-"),
      (jP[uu(0x46d)] = function () {
        if (jR) mw(jR);
      });
    var jS = 0x0,
      jT = document[uu(0x5d6)](uu(0x21e));
    setInterval(() => {
      const wh = uu;
      jS--;
      if (jS < 0x0) {
        jT[wh(0x487)][wh(0x3a1)](wh(0x7f2)) &&
          hV &&
          ik(new Uint8Array([cH[wh(0x401)]]));
        return;
      }
      jU();
    }, 0x3e8);
    function jU() {
      k7(jQ, k9(jS * 0x3e8));
    }
    function jV() {
      const wi = uu,
        rz = document[wi(0x5d6)](wi(0x1dc))[wi(0x87b)],
        rA = document[wi(0x5d6)](wi(0x47f))[wi(0x87b)];
      for (let rB = 0x0; rB < rz[wi(0xc60)]; rB++) {
        const rC = rz[rB],
          rD = rA[rB];
        rC[wi(0x46d)] = function () {
          const wj = wi;
          for (let rE = 0x0; rE < rA[wj(0xc60)]; rE++) {
            const rF = rB === rE;
            (rA[rE][wj(0xa09)][wj(0xd21)] = rF ? "" : wj(0x89b)),
              rz[rE][wj(0x487)][rF ? wj(0x8d8) : wj(0x5e5)](wj(0x3fb));
          }
        };
      }
      rz[0x0][wi(0x46d)]();
    }
    jV();
    var jW = [];
    function jX(rz) {
      const wk = uu;
      rz[wk(0x487)][wk(0x8d8)](wk(0xe1b)), jW[wk(0x7b8)](rz);
    }
    var jY,
      jZ = document[uu(0x5d6)](uu(0xe48));
    function k0(rz, rA = !![]) {
      const wl = uu;
      if (rA) {
        if (pO < jF) {
          jG[wl(0x7b8)](rz);
          return;
        } else {
          if (jG[wl(0xc60)] > 0x0)
            while (jG[wl(0xc60)] > 0x0) {
              k0(jG[wl(0xd43)](), ![]);
            }
        }
      }
      function rB() {
        const wm = wl,
          rN = rK[wm(0x9e8)](rL++),
          rO = new Uint8Array(rN);
        for (let rP = 0x0; rP < rN; rP++) {
          rO[rP] = rK[wm(0x9e8)](rL++);
        }
        return new TextDecoder()[wm(0xa68)](rO);
      }
      function rC() {
        const wn = wl;
        return rK[wn(0x9e8)](rL++) / 0xff;
      }
      function rD(rN) {
        const wo = wl,
          rO = rK[wo(0x5ab)](rL);
        (rL += 0x2),
          (rN[wo(0xe1e)] = rO & 0x1),
          (rN[wo(0x908)] = rO & 0x2),
          (rN[wo(0x932)] = rO & 0x4),
          (rN[wo(0x890)] = rO & 0x8),
          (rN[wo(0xde5)] = rO & 0x10),
          (rN[wo(0x152)] = rO & 0x20),
          (rN[wo(0x663)] = rO & 0x40),
          (rN[wo(0x1d9)] = rO & 0x80),
          (rN[wo(0x35c)] = rO & 0x100),
          (rN[wo(0x31e)] = rO & (0x1 << 0x9)),
          (rN[wo(0xe14)] = rO & (0x1 << 0xa)),
          (rN[wo(0xbac)] = rO & (0x1 << 0xb)),
          (rN[wo(0xcc7)] = rO & (0x1 << 0xc)),
          (rN[wo(0x9a0)] = rO & (0x1 << 0xd)),
          (rN[wo(0x959)] = rO & (0x1 << 0xe)),
          (rN[wo(0x25a)] = rO & (0x1 << 0xf));
      }
      function rE() {
        const wp = wl,
          rN = rK[wp(0x1f1)](rL);
        rL += 0x4;
        const rO = rB();
        iJ(rO, rN);
      }
      function rF() {
        const wq = wl,
          rN = rK[wq(0x5ab)](rL) - cF;
        return (rL += 0x2), rN;
      }
      function rG() {
        const wr = wl,
          rN = {};
        for (let rY in mp) {
          (rN[rY] = rK[wr(0x1f1)](rL)), (rL += 0x4);
        }
        const rO = rB(),
          rP = Number(rK[wr(0xb0b)](rL));
        rL += 0x8;
        const rQ = d4(d3(rP)[0x0]),
          rR = rQ * 0x2,
          rS = Array(rR);
        for (let rZ = 0x0; rZ < rR; rZ++) {
          const s0 = rK[wr(0x5ab)](rL) - 0x1;
          rL += 0x2;
          if (s0 < 0x0) continue;
          rS[rZ] = dB[s0];
        }
        const rT = [],
          rU = rK[wr(0x5ab)](rL);
        rL += 0x2;
        for (let s1 = 0x0; s1 < rU; s1++) {
          const s2 = rK[wr(0x5ab)](rL);
          rL += 0x2;
          const s3 = rK[wr(0x1f1)](rL);
          (rL += 0x4), rT[wr(0x7b8)]([dB[s2], s3]);
        }
        const rV = [],
          rW = rK[wr(0x5ab)](rL);
        rL += 0x2;
        for (let s4 = 0x0; s4 < rW; s4++) {
          const s5 = rK[wr(0x5ab)](rL);
          (rL += 0x2), !eJ[s5] && console[wr(0x21f)](s5), rV[wr(0x7b8)](eJ[s5]);
        }
        const rX = rK[wr(0x9e8)](rL++);
        mu(rO, rN, rT, rV, rP, rS, rX);
      }
      function rH() {
        const ws = wl,
          rN = Number(rK[ws(0xb0b)](rL));
        return (rL += 0x8), rN;
      }
      function rI() {
        const wt = wl,
          rN = rK[wt(0x1f1)](rL);
        rL += 0x4;
        const rO = rK[wt(0x9e8)](rL++),
          rP = {};
        (rP[wt(0x56d)] = rN), (rP[wt(0x5d3)] = {});
        const rQ = rP;
        f2[wt(0xa2e)]((rS, rT) => {
          const wu = wt;
          rQ[wu(0x5d3)][rS] = [];
          for (let rU = 0x0; rU < rO; rU++) {
            const rV = rB();
            let rW;
            rS === "xp" ? (rW = rH()) : ((rW = rK[wu(0x1f1)](rL)), (rL += 0x4)),
              rQ[wu(0x5d3)][rS][wu(0x7b8)]([rV, rW]);
          }
        }),
          k7(jC, k8(rQ[wt(0x56d)]) + wt(0x16a)),
          (mB[wt(0x679)] = "");
        let rR = 0x0;
        for (let rS in rQ[wt(0x5d3)]) {
          const rT = kc(rS),
            rU = rQ[wt(0x5d3)][rS],
            rV = nP(wt(0xb0c) + rR + wt(0x433) + rT + wt(0xc8c)),
            rW = rV[wt(0x5d6)](wt(0x178));
          for (let rX = 0x0; rX < rU[wt(0xc60)]; rX++) {
            const [rY, rZ] = rU[rX];
            let s0 = mo(rS, rZ);
            rS === "xp" && (s0 += wt(0xc44) + (d3(rZ)[0x0] + 0x1) + ")");
            const s1 = nP(
              wt(0x760) + (rX + 0x1) + ".\x20" + rY + wt(0x5a2) + s0 + wt(0x344)
            );
            (s1[wt(0x46d)] = function () {
              mw(rY);
            }),
              rW[wt(0x6eb)](s1);
          }
          mB[wt(0x6eb)](rV), rR++;
        }
      }
      function rJ() {
        const wv = wl;
        (jR = rB()), k7(jP, jR || "-");
        const rN = Number(rK[wv(0xb0b)](rL));
        (rL += 0x8),
          (jS = Math[wv(0xbb6)]((rN - Date[wv(0x5b6)]()) / 0x3e8)),
          jU();
        const rO = rK[wv(0x5ab)](rL);
        rL += 0x2;
        if (rO === 0x0) jO[wv(0x679)] = wv(0x407);
        else {
          jO[wv(0x679)] = "";
          for (let rQ = 0x0; rQ < rO; rQ++) {
            const rR = rB(),
              rS = rK[wv(0x5d2)](rL);
            rL += 0x4;
            const rT = rS * 0x64,
              rU = rT >= 0x1 ? rT[wv(0x9f2)](0x2) : rT[wv(0x9f2)](0x5),
              rV = nP(
                wv(0x71d) +
                  (rQ + 0x1) +
                  ".\x20" +
                  rR +
                  wv(0x476) +
                  rU +
                  wv(0xb48)
              );
            rR === ju && rV[wv(0x487)][wv(0x8d8)]("me"),
              (rV[wv(0x46d)] = function () {
                mw(rR);
              }),
              jO[wv(0xd82)](rV);
          }
        }
        jZ[wv(0x679)] = "";
        const rP = rK[wv(0x5ab)](rL);
        (rL += 0x2), (jY = {});
        if (rP === 0x0)
          (jN[wv(0x679)] = wv(0x273)), (jZ[wv(0xa09)][wv(0xd21)] = wv(0x89b));
        else {
          const rW = {};
          jN[wv(0x679)] = "";
          for (let rX = 0x0; rX < rP; rX++) {
            const rY = rK[wv(0x5ab)](rL);
            rL += 0x2;
            const rZ = rK[wv(0x1f1)](rL);
            (rL += 0x4), (jY[rY] = rZ);
            const s0 = dB[rY],
              s1 = nP(
                wv(0x537) +
                  s0[wv(0x308)] +
                  wv(0xcbc) +
                  qz(s0) +
                  wv(0x4ee) +
                  rZ +
                  wv(0x465)
              );
            (s1[wv(0x1bf)] = jT),
              jX(s1),
              (s1[wv(0xd7f)] = s0),
              jN[wv(0xd82)](s1),
              (rW[s0[wv(0x308)]] = (rW[s0[wv(0x308)]] || 0x0) + rZ);
          }
          oc(jN), (jZ[wv(0xa09)][wv(0xd21)] = ""), oD(jZ, rW);
        }
      }
      const rK = new DataView(rz[wl(0xc5f)]);
      pD += rK[wl(0x120)];
      let rL = 0x0;
      const rM = rK[wl(0x9e8)](rL++);
      switch (rM) {
        case cH[wl(0x8a0)]:
          {
            const s8 = rK[wl(0x5ab)](rL);
            rL += 0x2;
            for (let s9 = 0x0; s9 < s8; s9++) {
              const sa = rK[wl(0x5ab)](rL);
              rL += 0x2;
              const sb = rK[wl(0x1f1)](rL);
              (rL += 0x4), n4(sa, sb);
            }
          }
          break;
        case cH[wl(0x558)]:
          rJ();
          break;
        case cH[wl(0x80a)]:
          kB[wl(0x487)][wl(0x8d8)](wl(0x7f2)), hS(), (jF = pO + 0x1f4);
          break;
        case cH[wl(0x1e1)]:
          (mj[wl(0x679)] = wl(0x97b)), mj[wl(0xd82)](mm), (mn = ![]);
          break;
        case cH[wl(0x112)]: {
          const sc = dB[rK[wl(0x5ab)](rL)];
          rL += 0x2;
          const sd = rK[wl(0x1f1)](rL);
          (rL += 0x4),
            (mj[wl(0x679)] =
              wl(0x3e2) +
              sc[wl(0x308)] +
              "\x22\x20" +
              qz(sc) +
              wl(0x4ee) +
              k8(sd) +
              wl(0xdb4));
          const se = mj[wl(0x5d6)](wl(0xb6a));
          (se[wl(0xd7f)] = sc),
            (se[wl(0x46d)] = function () {
              const ww = wl;
              n4(sc["id"], sd), (this[ww(0x46d)] = null), mm[ww(0x46d)]();
            }),
            (mn = ![]);
          break;
        }
        case cH[wl(0x2d5)]: {
          const sf = rK[wl(0x9e8)](rL++),
            sg = rK[wl(0x1f1)](rL);
          rL += 0x4;
          const sh = rB();
          (mj[wl(0x679)] =
            wl(0x798) +
            sh +
            wl(0xaa1) +
            hO[wl(0x274)] +
            wl(0x110) +
            k8(sg) +
            "\x20" +
            hM[sf] +
            wl(0xaa1) +
            hP[sf] +
            wl(0x994)),
            (mj[wl(0x5d6)](wl(0x2f8))[wl(0x46d)] = function () {
              mw(sh);
            }),
            mj[wl(0xd82)](mm),
            (mn = ![]);
          break;
        }
        case cH[wl(0x875)]:
          (mj[wl(0x679)] = wl(0x3db)), mj[wl(0xd82)](mm), (mn = ![]);
          break;
        case cH[wl(0x80e)]:
          hJ(wl(0x62d));
          break;
        case cH[wl(0x94c)]:
          rI();
          break;
        case cH[wl(0x371)]:
          hJ(wl(0xc2b)), hb(wl(0xc2b));
          break;
        case cH[wl(0x1f0)]:
          hJ(wl(0x700)), hb(wl(0xab9));
          break;
        case cH[wl(0xb21)]:
          hJ(wl(0x2a7));
          break;
        case cH[wl(0x6cd)]:
          rG();
          break;
        case cH[wl(0x569)]:
          hb(wl(0x995));
          break;
        case cH[wl(0x172)]:
          hb(wl(0x81a), hO[wl(0xc03)]), hI(hG);
          break;
        case cH[wl(0x538)]:
          const rN = rK[wl(0x5ab)](rL);
          rL += 0x2;
          const rO = [];
          for (let si = 0x0; si < rN; si++) {
            const sj = rK[wl(0x1f1)](rL);
            rL += 0x4;
            const sk = rB(),
              sl = rB(),
              sm = rB();
            rO[wl(0x7b8)]([sk || wl(0x6bf) + sj, sl, sm]);
          }
          jl(rO);
          break;
        case cH[wl(0x891)]:
          for (let sn in mp) {
            const so = rK[wl(0x1f1)](rL);
            (rL += 0x4), mq[sn][wl(0x270)](so);
          }
          break;
        case cH[wl(0xd6c)]:
          const rP = rK[wl(0x9e8)](rL++),
            rQ = rK[wl(0x1f1)](rL++),
            rR = {};
          (rR[wl(0x2db)] = rP), (rR[wl(0xa0c)] = rQ), (p2 = rR);
          break;
        case cH[wl(0x24c)]:
          (hZ[wl(0xa09)][wl(0xd21)] = i5 ? "" : wl(0x89b)),
            (i2[wl(0xa09)][wl(0xd21)] = !i5 ? "" : wl(0x89b)),
            (hX[wl(0xa09)][wl(0xd21)] = ""),
            (km[wl(0xa09)][wl(0xd21)] = wl(0x89b)),
            (hV = !![]),
            kA[wl(0x487)][wl(0x8d8)](wl(0x7f2)),
            kz[wl(0x487)][wl(0x5e5)](wl(0x7f2)),
            j0(),
            m0(![]),
            (iw = rK[wl(0x1f1)](rL)),
            (rL += 0x4),
            (ju = rB()),
            hI(ju),
            hack.player.name = ju,
            (jx = rK[wl(0x9e8)](rL++)),
            jA(),
            (j1 = rK[wl(0x5ab)](rL)),
            (rL += 0x2),
            (j4 = rK[wl(0x9e8)](rL++)),
            (j3 = j1 / j4),
            (j2 = j1 / 0x3),
            (oF = rH()),
            oP(),
            oS(),
            (iM = d4(oG)),
            (iN = iM * 0x2),
            (iO = Array(iN)),
            (iP = {}),
            (iQ = d6());
          for (let sp = 0x0; sp < iN; sp++) {
            const sq = rK[wl(0x5ab)](rL) - 0x1;
            rL += 0x2;
            if (sq < 0x0) continue;
            iO[sp] = dB[sq];
          }
          nK(), nS();
          const rS = rK[wl(0x5ab)](rL);
          rL += 0x2;
          for (let sr = 0x0; sr < rS; sr++) {
            const ss = rK[wl(0x5ab)](rL);
            rL += 0x2;
            const st = nU(eJ[ss]);
            st[wl(0x1bf)] = m2;
          }
          iR = {};
          while (rL < rK[wl(0x120)]) {
            const su = rK[wl(0x5ab)](rL);
            rL += 0x2;
            const sv = rK[wl(0x1f1)](rL);
            (rL += 0x4), (iR[su] = sv);
          }
          oa(), n5();
          break;
        case cH[wl(0xa5b)]:
          const rT = rK[wl(0x9e8)](rL++),
            rU = hK[rT] || wl(0x81c);
          console[wl(0x21f)](wl(0x406) + rU + ")"),
            (ke = rT === cQ[wl(0x802)] || rT === cQ[wl(0xcc4)]);
          !ke &&
            is(wl(0xa9f), wl(0x8b8) + rU, rT === cQ[wl(0x79b)] ? 0xa : 0x3c);
          break;
        case cH[wl(0x513)]:
          (hf[wl(0xa09)][wl(0xd21)] = km[wl(0xa09)][wl(0xd21)] = wl(0x89b)),
            kF(!![]),
            jt[wl(0x487)][wl(0x8d8)](wl(0x7f2)),
            jf(),
            (ph[wl(0xa09)][wl(0xd21)] = "");
          for (let sw in iP) {
            iP[sw][wl(0xa33)] = 0x0;
          }
          (jH = pO),
            (nm = {}),
            (ne = 0x1),
            (nf = 0x1),
            (nc = 0x0),
            (nd = 0x0),
            mF(),
            (n9 = cX[wl(0x4a1)]),
            (jD = pO);
          break;
        case cH[wl(0x630)]:
          (pC = pO - jD), (jD = pO), q8[wl(0x270)](rC()), qa[wl(0x270)](rC());
          if (jx) {
            const sx = rK[wl(0x9e8)](rL++);
            (jI = sx & 0x80), (jJ = f5[sx & 0x7f]);
          } else (jI = ![]), (jJ = null), qb[wl(0x270)](rC());
          (pJ = 0x1 + cV[rK[wl(0x9e8)](rL++)] / 0x64),
            (iV = (cZ / 0x2) * pJ),
            (iW = (d0 / 0x2) * pJ);
          const rV = rK[wl(0x5ab)](rL);
          rL += 0x2;
          for (let sy = 0x0; sy < rV; sy++) {
            const sz = rK[wl(0x1f1)](rL);
            rL += 0x4;
            let sA = iu[sz];
            if (sA) {
              if (sA[wl(0x827)]) {
                sA[wl(0x8f6)] = rK[wl(0x9e8)](rL++) - 0x1;
                continue;
              }
              const sB = rK[wl(0x9e8)](rL++);
              sB & 0x1 &&
                ((sA["nx"] = rF()), (sA["ny"] = rF()), (sA[wl(0x2c8)] = 0x0));
              sB & 0x2 &&
                ((sA[wl(0xada)] = eR(rK[wl(0x9e8)](rL++))),
                (sA[wl(0x2c8)] = 0x0));
              if (sB & 0x4) {
                const sC = rC();
                if (sC < sA[wl(0x6b6)]) iS(sA, sC), (sA[wl(0x694)] = 0x1);
                else sC > sA[wl(0x6b6)] && (sA[wl(0x694)] = 0x0);
                (sA[wl(0x6b6)] = sC), (sA[wl(0x2c8)] = 0x0);
              }
              sB & 0x8 &&
                ((sA[wl(0x61f)] = 0x1),
                (sA[wl(0x2c8)] = 0x0),
                sA === ix && (pu = 0x1));
              sB & 0x10 && ((sA[wl(0x33e)] = rK[wl(0x5ab)](rL)), (rL += 0x2));
              sB & 0x20 && (sA[wl(0x4c5)] = rK[wl(0x9e8)](rL++));
              sB & 0x40 && rD(sA);
              if (sB & 0x80) {
                if (sA[wl(0x250)])
                  (sA[wl(0xe56)] = rK[wl(0x5ab)](rL)), (rL += 0x2);
                else {
                  const sD = rC();
                  sD > sA[wl(0xcd5)] && iS(sA), (sA[wl(0xcd5)] = sD);
                }
              }
              sA[wl(0x250)] && sB & 0x4 && (sA[wl(0x6d8)] = rC()),
                (sA["ox"] = sA["x"]),
                (sA["oy"] = sA["y"]),
                (sA[wl(0x19d)] = sA[wl(0x6b8)]),
                (sA[wl(0x62a)] = sA[wl(0x9d4)]),
                (sA[wl(0x72b)] = sA[wl(0x423)]),
                (sA[wl(0x602)] = 0x0);
            } else {
              const sE = rK[wl(0x9e8)](rL++);
              if (sE === cR[wl(0x41f)]) {
                let sJ = rK[wl(0x9e8)](rL++);
                const sK = {};
                (sK[wl(0x9a7)] = []), (sK["a"] = 0x1);
                const sL = sK;
                while (sJ--) {
                  const sM = rF(),
                    sN = rF();
                  sL[wl(0x9a7)][wl(0x7b8)]([sM, sN]);
                }
                iL(sL), (pu = 0x1), iE[wl(0x7b8)](sL);
                continue;
              }
              const sF = hL[sE],
                sG = rF(),
                sH = rF(),
                sI = sE === cR[wl(0x5c7)];
              if (sE === cR[wl(0x2b1)] || sE === cR[wl(0xc52)] || sI) {
                const sO = rK[wl(0x5ab)](rL);
                (rL += 0x2),
                  (sA = new lJ(sE, sz, sG, sH, sO)),
                  sI &&
                    ((sA[wl(0x827)] = !![]),
                    (sA[wl(0x8f6)] = rK[wl(0x9e8)](rL++) - 0x1));
              } else {
                if (sE === cR[wl(0x8a6)]) {
                  const sP = rK[wl(0x5ab)](rL);
                  (rL += 0x2), (sA = new lM(sz, sG, sH, sP));
                } else {
                  const sQ = eR(rK[wl(0x9e8)](rL++)),
                    sR = rK[wl(0x5ab)](rL);
                  rL += 0x2;
                  if (sE === cR[wl(0xbfd)]) {
                    const sS = rC(),
                      sT = rK[wl(0x9e8)](rL++);
                    (sA = new lS(sz, sG, sH, sQ, sS, sT, sR)),
                      rD(sA),
                      (sA[wl(0xe56)] = rK[wl(0x5ab)](rL)),
                      (rL += 0x2),
                      (sA[wl(0xbfe)] = rB()),
                      (sA[wl(0xda2)] = rB()),
                      (sA[wl(0x6d8)] = rC());
                    if (iw === sz) ix = sA;
                    else {
                      if (jx) {
                        const sU = pU();
                        (sU[wl(0xcc2)] = sA), pM[wl(0x7b8)](sU);
                      }
                    }
                  } else {
                    if (sF[wl(0xa69)](wl(0xd7f)))
                      sA = new lF(sz, sE, sG, sH, sQ, sR);
                    else {
                      const sV = rC(),
                        sW = rK[wl(0x9e8)](rL++),
                        sX = sW >> 0x4,
                        sY = sW & 0x1,
                        sZ = sW & 0x2,
                        t0 = rC();
                      (sA = new lF(sz, sE, sG, sH, sQ, sR, sV)),
                        (sA[wl(0x308)] = sX),
                        (sA[wl(0x1f5)] = sY),
                        (sA[wl(0x959)] = sZ),
                        (sA[wl(0xcd5)] = t0),
                        (sA[wl(0x30b)] = hM[sX]);
                    }
                  }
                }
              }
              (iu[sz] = sA), iv[wl(0x7b8)](sA);
            }
          }
          ix &&
            ((iT = ix["nx"]),
            (iU = ix["ny"]),
            (q3[wl(0xa09)][wl(0xd21)] = ""),
            q5(q3, ix["nx"], ix["ny"]));
          const rW = rK[wl(0x5ab)](rL);
          rL += 0x2;
          for (let t1 = 0x0; t1 < rW; t1++) {
            const t2 = rK[wl(0x1f1)](rL);
            (rL += 0x4), iX(t2);
          }
          const rX = rK[wl(0x9e8)](rL++);
          for (let t3 = 0x0; t3 < rX; t3++) {
            const t4 = rK[wl(0x1f1)](rL);
            rL += 0x4;
            const t5 = iu[t4];
            if (t5) {
              (t5[wl(0x6a9)] = ix), n4(t5[wl(0xd7f)]["id"], 0x1), iX(t4);
              if (!oB[t5[wl(0xd7f)]["id"]]) oB[t5[wl(0xd7f)]["id"]] = 0x0;
              oB[t5[wl(0xd7f)]["id"]]++;
            }
          }
          const rY = rK[wl(0x9e8)](rL++);
          for (let t6 = 0x0; t6 < rY; t6++) {
            const t7 = rK[wl(0x9e8)](rL++),
              t8 = rC(),
              t9 = iP[t7];
            (t9[wl(0xc62)] = t8), t8 === 0x0 && (t9[wl(0xa33)] = 0x0);
          }
          (iH = rK[wl(0x5ab)](rL)), (rL += 0x2);
          const rZ = rK[wl(0x5ab)](rL);
          (rL += 0x2),
            iD[wl(0x13b)](
              wl(0x5b9),
              kg(iH, wl(0x574)) + ",\x20" + kg(rZ, wl(0x8d5))
            );
          const s0 = Math[wl(0xd8d)](0xa, iH);
          if (iG) {
            const ta = rK[wl(0x9e8)](rL++),
              tb = ta >> 0x4,
              tc = ta & 0xf,
              td = rK[wl(0x9e8)](rL++);
            for (let tf = 0x0; tf < tc; tf++) {
              const tg = rK[wl(0x9e8)](rL++);
              (iF[tg][wl(0x606)] = rK[wl(0x1f1)](rL)), (rL += 0x4);
            }
            const te = [];
            for (let th = 0x0; th < td; th++) {
              te[wl(0x7b8)](rK[wl(0x9e8)](rL++));
            }
            te[wl(0x38e)](function (ti, tj) {
              return tj - ti;
            });
            for (let ti = 0x0; ti < td; ti++) {
              const tj = te[ti];
              iF[tj]["el"][wl(0x5e5)](), iF[wl(0xc15)](tj, 0x1);
            }
            for (let tk = 0x0; tk < tb; tk++) {
              rE();
            }
            iF[wl(0x38e)](function (tl, tm) {
              const wx = wl;
              return tm[wx(0x606)] - tl[wx(0x606)];
            });
          } else {
            iF[wl(0xc60)] = 0x0;
            for (let tl = 0x0; tl < s0; tl++) {
              rE();
            }
            iG = !![];
          }
          iK();
          const s1 = rK[wl(0x9e8)](rL++);
          for (let tm = 0x0; tm < s1; tm++) {
            const tn = rK[wl(0x5ab)](rL);
            (rL += 0x2), nU(eJ[tn]);
          }
          const s2 = rK[wl(0x5ab)](rL);
          rL += 0x2;
          for (let to = 0x0; to < s2; to++) {
            const tp = rK[wl(0x9e8)](rL++),
              tq = tp >> 0x7,
              tr = tp & 0x7f;
            if (tr === cP[wl(0x1bb)]) {
              const tv = rK[wl(0x9e8)](rL++),
                tw = rK[wl(0x9e8)](rL++) - 0x1;
              let tx = null,
                ty = 0x0;
              if (tq) {
                const tA = rK[wl(0x1f1)](rL);
                rL += 0x4;
                const tB = rB();
                (tx = tB || wl(0x6bf) + tA), (ty = rK[wl(0x9e8)](rL++));
              }
              const tz = j7[tv];
              nk(
                wl(0x1bb),
                null,
                "⚡\x20" +
                  j6[tv] +
                  wl(0xdff) +
                  (tw < 0x0
                    ? wl(0x707)
                    : tw === 0x0
                    ? wl(0x23a)
                    : wl(0x4cf) + (tw + 0x1) + "!"),
                tz
              );
              tx &&
                nj(wl(0x1bb), [
                  [wl(0xd1d), "🏆"],
                  [tz, tx + wl(0x1a9)],
                  [hO[wl(0xca6)], ty + wl(0x4bf)],
                  [tz, wl(0x314)],
                ]);
              continue;
            }
            const ts = rK[wl(0x1f1)](rL);
            rL += 0x4;
            const tt = rB(),
              tu = tt || wl(0x6bf) + ts;
            if (tr === cP[wl(0x8c5)]) {
              let tC = rB();
              pa[wl(0x98d)] && (tC = fa(tC));
              if (jM(tC, ts)) nk(ts, tu, tC, ts === iw ? nh["me"] : void 0x0);
              else ts === iw && nk(-0x1, null, wl(0x502), nh[wl(0x648)]);
            } else {
              if (tr === cP[wl(0xd6c)]) {
                const tD = rK[wl(0x5ab)](rL);
                rL += 0x2;
                const tE = rK[wl(0x1f1)](rL);
                rL += 0x4;
                const tF = rK[wl(0x1f1)](rL);
                rL += 0x4;
                const tG = dB[tD],
                  tH = hM[tG[wl(0x308)]],
                  tI = hM[tG[wl(0x119)][wl(0x308)]],
                  tJ = tF === 0x0;
                if (tJ)
                  nj(wl(0xd6c), [
                    [nh[wl(0xdd3)], tu, !![]],
                    [nh[wl(0xdd3)], wl(0x1a0)],
                    [
                      hP[tG[wl(0x308)]],
                      k8(tE) + "\x20" + tH + "\x20" + tG[wl(0x1a6)],
                    ],
                  ]);
                else {
                  const tK = hP[tG[wl(0x119)][wl(0x308)]];
                  nj(wl(0xd6c), [
                    [tK, "⭐"],
                    [tK, tu, !![]],
                    [tK, wl(0xaa4)],
                    [
                      tK,
                      k8(tF) +
                        "\x20" +
                        tI +
                        "\x20" +
                        tG[wl(0x1a6)] +
                        wl(0xd67) +
                        k8(tE) +
                        "\x20" +
                        tH +
                        "\x20" +
                        tG[wl(0x1a6)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tL = rK[wl(0x5ab)](rL);
                rL += 0x2;
                const tM = eJ[tL],
                  tN = hM[tM[wl(0x308)]],
                  tO = tr === cP[wl(0x3c7)],
                  tP = hP[tM[wl(0x308)]];
                nj(wl(0xcb1), [
                  [
                    tP,
                    "" +
                      (tO ? wl(0x581) : "") +
                      js(tN) +
                      "\x20" +
                      tN +
                      "\x20" +
                      tM[wl(0x1a6)] +
                      wl(0x696) +
                      jr(tO) +
                      wl(0x5c4),
                  ],
                  [tP, tu + "!", !![]],
                ]);
              }
            }
          }
          const s3 = rK[wl(0x9e8)](rL++),
            s4 = s3 & 0xf,
            s5 = s3 >> 0x4;
          let s6 = ![];
          s4 !== j5["id"] &&
            (j5 && (j5[wl(0xc6e)] = !![]),
            (s6 = !![]),
            jc(s4),
            k7(q9, wl(0x85d) + j8[s4] + wl(0xb28)));
          const s7 = rK[wl(0x9e8)](rL++);
          if (s7 > 0x0) {
            let tQ = ![];
            for (let tR = 0x0; tR < s7; tR++) {
              const tS = rK[wl(0x5ab)](rL);
              rL += 0x2;
              const tT = rK[wl(0x5ab)](rL);
              (rL += 0x2), (j5[tS] = tT);
              if (tT > 0x0) {
                if (!j5[wl(0x833)][tS]) {
                  tQ = !![];
                  const tU = nU(eJ[tS], !![]);
                  hack.mobFunc = nU;
                  (tU[wl(0x9b0)] = !![]),
                    (tU[wl(0xa03)] = ![]),
                    tU[wl(0x487)][wl(0x5e5)](wl(0x958)),
                    (tU[wl(0xad1)] = nP(wl(0x69c))),
                    tU[wl(0xd82)](tU[wl(0xad1)]),
                    (tU[wl(0x7bf)] = tS);
                  let tV = -0x1;
                  (tU["t"] = s6 ? 0x1 : 0x0),
                    (tU[wl(0xc6e)] = ![]),
                    (tU[wl(0x328)] = 0x3e8),
                    (tU[wl(0x630)] = function () {
                      const wy = wl,
                        tW = tU["t"];
                      if (tW === tV) return;
                      tV = tW;
                      const tX = je(Math[wy(0xd8d)](0x1, tW / 0.5)),
                        tY = je(
                          Math[wy(0x9b2)](
                            0x0,
                            Math[wy(0xd8d)]((tW - 0.5) / 0.5)
                          )
                        );
                      (tU[wy(0xa09)][wy(0xb34)] =
                        wy(0x7a2) + -0x168 * (0x1 - tY) + wy(0x7ee) + tY + ")"),
                        (tU[wy(0xa09)][wy(0x780)] = -1.12 * (0x1 - tX) + "em");
                    }),
                    ja[wl(0x7b8)](tU),
                    j5[wl(0x7b0)][wl(0xd82)](tU),
                    (j5[wl(0x833)][tS] = tU);
                }
                p4(j5[wl(0x833)][tS][wl(0xad1)], tT);
              } else {
                const tW = j5[wl(0x833)][tS];
                tW && ((tW[wl(0xc6e)] = !![]), delete j5[wl(0x833)][tS]),
                  delete j5[tS];
              }
            }
            tQ &&
              [...j5[wl(0x7b0)][wl(0x87b)]]
                [wl(0x38e)]((tX, tY) => {
                  const wz = wl;
                  return -od(eJ[tX[wz(0x7bf)]], eJ[tY[wz(0x7bf)]]);
                })
                [wl(0xa2e)]((tX) => {
                  const wA = wl;
                  j5[wA(0x7b0)][wA(0xd82)](tX);
                });
          }
          (j5[wl(0x837)] = pO), (j5[wl(0x140)] = s5);
          if (s5 !== cS[wl(0x89b)]) {
            (j5[wl(0xc22)][wl(0xa09)][wl(0xd21)] = ""),
              (j5[wl(0xdc2)] = j5[wl(0xab6)]),
              (j5[wl(0xba4)] = rC());
            if (j5[wl(0x7c1)] !== jI) {
              const tX = jI ? wl(0x8d8) : wl(0x5e5);
              j5[wl(0x17c)][wl(0x487)][tX](wl(0xd3a)),
                j5[wl(0x17c)][wl(0x487)][tX](wl(0x7f5)),
                j5[wl(0x61a)][wl(0x487)][tX](wl(0xd18)),
                (j5[wl(0x7c1)] = jI);
            }
            switch (s5) {
              case cS[wl(0x316)]:
                k7(j5[wl(0x35f)], wl(0x731));
                break;
              case cS[wl(0x1bb)]:
                const tY = rK[wl(0x9e8)](rL++) + 0x1;
                k7(j5[wl(0x35f)], wl(0xd24) + tY);
                break;
              case cS[wl(0xd8f)]:
                k7(j5[wl(0x35f)], wl(0x3ea));
                break;
              case cS[wl(0x57f)]:
                k7(j5[wl(0x35f)], wl(0xabe));
                break;
              case cS[wl(0xaa7)]:
                k7(j5[wl(0x35f)], wl(0x60d));
                break;
            }
          } else j5[wl(0xc22)][wl(0xa09)][wl(0xd21)] = wl(0x89b);
          if (rK[wl(0x120)] - rL > 0x0) {
            ix &&
              (iZ(qs),
              (qs[wl(0xbac)] = ![]),
              (q4[wl(0xa09)][wl(0xd21)] = ""),
              (q3[wl(0xa09)][wl(0xd21)] = wl(0x89b)),
              q5(q4, ix["nx"], ix["ny"]));
            qt[wl(0xc93)](), (ix = null), jt[wl(0x487)][wl(0x5e5)](wl(0x7f2));
            const tZ = rK[wl(0x5ab)](rL) - 0x1;
            rL += 0x2;
            const u0 = rK[wl(0x1f1)](rL);
            rL += 0x4;
            const u1 = rK[wl(0x1f1)](rL);
            rL += 0x4;
            const u2 = rK[wl(0x1f1)](rL);
            rL += 0x4;
            const u3 = rK[wl(0x1f1)](rL);
            (rL += 0x4),
              k7(k2, k9(u1)),
              k7(k1, k8(u0)),
              k7(k3, k8(u2)),
              k7(k5, k8(u3));
            let u4 = null;
            rK[wl(0x120)] - rL > 0x0 && ((u4 = rK[wl(0x1f1)](rL)), (rL += 0x4));
            u4 !== null
              ? (k7(k6, k8(u4)), (k6[wl(0x550)][wl(0xa09)][wl(0xd21)] = ""))
              : (k6[wl(0x550)][wl(0xa09)][wl(0xd21)] = wl(0x89b));
            if (tZ === -0x1) k7(k4, wl(0xcb9));
            else {
              const u5 = eJ[tZ];
              k7(k4, hM[u5[wl(0x308)]] + "\x20" + u5[wl(0x1a6)]);
            }
            oC(), (oB = {}), (km[wl(0xa09)][wl(0xd21)] = ""), hh();
          }
          break;
        default:
          console[wl(0x21f)](wl(0x4fd) + rM);
      }
    }
    var k1 = document[uu(0x5d6)](uu(0x87a)),
      k2 = document[uu(0x5d6)](uu(0x9fe)),
      k3 = document[uu(0x5d6)](uu(0xabb)),
      k4 = document[uu(0x5d6)](uu(0x204)),
      k5 = document[uu(0x5d6)](uu(0xb4f)),
      k6 = document[uu(0x5d6)](uu(0x101));
    function k7(rz, rA) {
      const wB = uu;
      rz[wB(0x13b)](wB(0x5b9), rA);
    }
    function k8(rz) {
      const wC = uu;
      return rz[wC(0xa53)](wC(0x583));
    }
    function k9(rz, rA) {
      const wD = uu,
        rB = [
          Math[wD(0xb54)](rz / (0x3e8 * 0x3c * 0x3c)),
          Math[wD(0xb54)]((rz % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wD(0xb54)]((rz % (0x3e8 * 0x3c)) / 0x3e8),
        ],
        rC = ["h", "m", "s"];
      let rD = "";
      const rE = rA ? 0x1 : 0x2;
      for (let rF = 0x0; rF <= rE; rF++) {
        const rG = rB[rF];
        (rG > 0x0 || rF == rE) && (rD += rG + rC[rF] + "\x20");
      }
      return rD;
    }
    const ka = {
      [cR[uu(0x34e)]]: uu(0x10b),
      [cR[uu(0x580)]]: uu(0xd28),
      [cR[uu(0xdec)]]: uu(0xd28),
      [cR[uu(0xa7c)]]: uu(0xcda),
      [cR[uu(0x800)]]: uu(0xcda),
      [cR[uu(0x1e6)]]: uu(0xca8),
      [cR[uu(0x5e8)]]: uu(0xca8),
      [cR[uu(0xbbd)]]: uu(0x79f),
      [cR[uu(0x409)]]: uu(0x12b),
    };
    ka["0"] = uu(0xcb9);
    var kb = ka;
    for (let rz in cR) {
      const rA = cR[rz];
      if (kb[rA]) continue;
      const rB = kc(rz);
      kb[rA] = rB[uu(0x88f)](uu(0x55f), uu(0xc12));
    }
    function kc(rC) {
      const wE = uu,
        rD = rC[wE(0x88f)](/([A-Z])/g, wE(0x5ec)),
        rE = rD[wE(0xff)](0x0)[wE(0x4f2)]() + rD[wE(0xb56)](0x1);
      return rE;
    }
    var kd = null,
      ke = !![];
    function kf() {
      const wF = uu;
      console[wF(0x21f)](wF(0xe2a)),
        hS(),
        jt[wF(0x487)][wF(0x5e5)](wF(0x7f2)),
        ke &&
          (kj[wF(0xa09)][wF(0xd21)] === wF(0x89b)
            ? (clearTimeout(kd),
              kB[wF(0x487)][wF(0x8d8)](wF(0x7f2)),
              (kd = setTimeout(function () {
                const wG = wF;
                kB[wG(0x487)][wG(0x5e5)](wG(0x7f2)),
                  (kj[wG(0xa09)][wG(0xd21)] = ""),
                  kA[wG(0xc71)](kn),
                  (km[wG(0xa09)][wG(0xd21)] = kl[wG(0xa09)][wG(0xd21)] =
                    wG(0x89b)),
                  hh(),
                  hU(hT[wG(0xafa)]);
              }, 0x1f4)))
            : (kB[wF(0x487)][wF(0x5e5)](wF(0x7f2)), hU(hT[wF(0xafa)])));
    }
    function kg(rC, rD) {
      return rC + "\x20" + rD + (rC === 0x1 ? "" : "s");
    }
    var kh = document[uu(0x1e9)](uu(0xa75)),
      ki = kh[uu(0xc6f)]("2d"),
      kj = document[uu(0x5d6)](uu(0x5c9)),
      kk = document[uu(0x5d6)](uu(0x98b)),
      kl = document[uu(0x5d6)](uu(0xcc6));
    kl[uu(0xa09)][uu(0xd21)] = uu(0x89b);
    var km = document[uu(0x5d6)](uu(0x7c4));
    km[uu(0xa09)][uu(0xd21)] = uu(0x89b);
    var kn = document[uu(0x5d6)](uu(0x20e)),
      ko = document[uu(0x5d6)](uu(0x73d)),
      kp = document[uu(0x5d6)](uu(0x9d5));
    function kq() {
      const wH = uu;
      kp[wH(0x679)] = "";
      for (let rC = 0x0; rC < 0x32; rC++) {
        const rD = kr[rC],
          rE = nP(wH(0xcae) + rC + wH(0x88b)),
          rF = rE[wH(0x5d6)](wH(0x93b));
        if (rD)
          for (let rG = 0x0; rG < rD[wH(0xc60)]; rG++) {
            const rH = rD[rG],
              rI = dE[rH];
            if (!rI) rF[wH(0xd82)](nP(wH(0x57a)));
            else {
              const rJ = nP(
                wH(0x537) + rI[wH(0x308)] + "\x22\x20" + qz(rI) + wH(0xa32)
              );
              (rJ[wH(0xd7f)] = rI),
                (rJ[wH(0x1bf)] = ko),
                jX(rJ),
                rF[wH(0xd82)](rJ);
            }
          }
        else rF[wH(0x679)] = wH(0x57a)[wH(0x4c2)](0x5);
        (rE[wH(0x5d6)](wH(0x48e))[wH(0x46d)] = function () {
          kt(rC);
        }),
          (rE[wH(0x5d6)](wH(0x480))[wH(0x46d)] = function () {
            kw(rC);
          }),
          kp[wH(0xd82)](rE);
      }
    }
    var kr = ks();
    function ks() {
      const wI = uu;
      try {
        const rC = JSON[wI(0x386)](hC[wI(0x168)]);
        for (const rD in rC) {
          !Array[wI(0x105)](rC[rD]) && delete rC[rD];
        }
        return rC;
      } catch {
        return {};
      }
    }
    function kt(rC) {
      const wJ = uu,
        rD = [],
        rE = ny[wJ(0x828)](wJ(0x51b));
      for (let rF = 0x0; rF < rE[wJ(0xc60)]; rF++) {
        const rG = rE[rF],
          rH = rG[wJ(0x87b)][0x0];
        !rH ? (rD[rF] = null) : (rD[rF] = rH[wJ(0xd7f)][wJ(0x670)]);
      }
      (kr[rC] = rD),
        (hC[wJ(0x168)] = JSON[wJ(0x3cc)](kr)),
        kq(),
        hb(wJ(0x9c3) + rC + "!");
    }
    function ku() {
      const wK = uu;
      return ny[wK(0x828)](wK(0x51b));
    }
    document[uu(0x5d6)](uu(0x971))[uu(0x46d)] = function () {
      kv();
    };
    function kv() {
      const wL = uu,
        rC = ku();
      for (const rD of rC) {
        const rE = rD[wL(0x87b)][0x0];
        if (!rE) continue;
        rE[wL(0x5e5)](),
          iQ[wL(0x7b8)](rE[wL(0x58e)]),
          n4(rE[wL(0xd7f)]["id"], 0x1),
          ik(new Uint8Array([cH[wL(0x7fc)], rD[wL(0xa8c)]]));
      }
    }
    function kw(rC) {
      const wM = uu;
      if (mJ || mI[wM(0xc60)] > 0x0) return;
      const rD = kr[rC];
      if (!rD) return;
      kv();
      const rE = ku(),
        rF = Math[wM(0xd8d)](rE[wM(0xc60)], rD[wM(0xc60)]);
      for (let rG = 0x0; rG < rF; rG++) {
        const rH = rD[rG],
          rI = dE[rH];
        if (!rI || !iR[rI["id"]]) continue;
        const rJ = nP(
          wM(0x537) + rI[wM(0x308)] + "\x22\x20" + qz(rI) + wM(0xa32)
        );
        (rJ[wM(0xd7f)] = rI),
          (rJ[wM(0xbde)] = !![]),
          (rJ[wM(0x58e)] = iQ[wM(0x9ca)]()),
          nO(rJ, rI),
          (iP[rJ[wM(0x58e)]] = rJ),
          rE[rG][wM(0xd82)](rJ),
          n4(rJ[wM(0xd7f)]["id"], -0x1);
        const rK = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rK[wM(0xbbe)](0x0, cH[wM(0x3ce)]),
          rK[wM(0xa0a)](0x1, rJ[wM(0xd7f)]["id"]),
          rK[wM(0xbbe)](0x3, rG),
          ik(rK);
      }
      hb(wM(0xd38) + rC + "!");
    }
    var kx = document[uu(0x5d6)](uu(0x45a)),
      ky = document[uu(0x5d6)](uu(0x770));
    ky[uu(0x46d)] = function () {
      const wN = uu;
      kB[wN(0x487)][wN(0x8d8)](wN(0x7f2)),
        jx
          ? (kd = setTimeout(function () {
              const wO = wN;
              ik(new Uint8Array([cH[wO(0x522)]]));
            }, 0x1f4))
          : (kd = setTimeout(function () {
              const wP = wN;
              kB[wP(0x487)][wP(0x5e5)](wP(0x7f2)),
                (kl[wP(0xa09)][wP(0xd21)] = km[wP(0xa09)][wP(0xd21)] =
                  wP(0x89b)),
                (kj[wP(0xa09)][wP(0xd21)] = ""),
                kA[wP(0xc71)](kn),
                kA[wP(0x487)][wP(0x8d8)](wP(0x7f2)),
                jf();
            }, 0x1f4));
    };
    var kz = document[uu(0x5d6)](uu(0x50d)),
      kA = document[uu(0x5d6)](uu(0x206));
    kA[uu(0x487)][uu(0x8d8)](uu(0x7f2));
    var kB = document[uu(0x5d6)](uu(0x722)),
      kC = document[uu(0x5d6)](uu(0xb9e)),
      kD = document[uu(0x5d6)](uu(0x2e4));
    (kD[uu(0xc04)] = hC[uu(0xd83)] || ""),
      (kD[uu(0x62e)] = cJ),
      (kD[uu(0x510)] = function () {
        const wQ = uu;
        hC[wQ(0xd83)] = this[wQ(0xc04)];
      });
    var kE;
    kC[uu(0x46d)] = function () {
      if (!hV) return;
      kF();
    };
    function kF(rC = ![]) {
      const wR = uu;
      hack.toastFunc = hb;
      if(rC) hack.onload();
      hack.moblst = eN;
      if (kj[wR(0xa09)][wR(0xd21)] === wR(0x89b)) {
        kB[wR(0x487)][wR(0x5e5)](wR(0x7f2));
        return;
      }
      clearTimeout(kE),
        kA[wR(0x487)][wR(0x5e5)](wR(0x7f2)),
        (kE = setTimeout(() => {
          const wS = wR;
          kB[wS(0x487)][wS(0x8d8)](wS(0x7f2)),
            (kE = setTimeout(() => {
              const wT = wS;
              rC && kB[wT(0x487)][wT(0x5e5)](wT(0x7f2)),
                (kj[wT(0xa09)][wT(0xd21)] = wT(0x89b)),
                (hf[wT(0xa09)][wT(0xd21)] = wT(0x89b)),
                (kl[wT(0xa09)][wT(0xd21)] = ""),
                kl[wT(0xd82)](kn),
                ip(kD[wT(0xc04)][wT(0xb56)](0x0, cJ));
            }, 0x1f4));
        }, 0x64));
    }
    var kG = document[uu(0x5d6)](uu(0x56e));
    function kH(rC, rD, rE) {
      const wU = uu,
        rF = {};
      (rF[wU(0x767)] = wU(0xad0)), (rF[wU(0x6e0)] = !![]), (rE = rE || rF);
      const rG = nP(
        wU(0xdc7) +
          rE[wU(0x767)] +
          wU(0x4f0) +
          rC +
          wU(0x91d) +
          (rE[wU(0x6e0)] ? wU(0x176) : "") +
          wU(0xdea)
      );
      return (
        (rG[wU(0x5d6)](wU(0x255))[wU(0x46d)] = function () {
          const wV = wU;
          rD(!![]), rG[wV(0x5e5)]();
        }),
        (rG[wU(0x5d6)](wU(0x7a1))[wU(0x46d)] = function () {
          const wW = wU;
          rG[wW(0x5e5)](), rD(![]);
        }),
        kG[wU(0xd82)](rG),
        rG
      );
    }
    function kI() {
      function rC(rK, rL, rM, rN, rO) {
        return rF(rN - 0x20c, rM);
      }
      function rD() {
        const wX = b,
          rK = [
            wX(0x136),
            wX(0x144),
            wX(0x845),
            wX(0x7b6),
            wX(0x8f9),
            wX(0xd4b),
            wX(0xe2d),
            wX(0x90a),
            wX(0x705),
            wX(0x436),
            wX(0x6f9),
            wX(0x294),
            wX(0x5a5),
            wX(0x135),
            wX(0xb8d),
            wX(0x948),
            wX(0xd69),
            wX(0x98f),
            wX(0x14c),
            wX(0xe30),
            wX(0x5bf),
            wX(0x3fd),
            wX(0x35d),
            wX(0x920),
            wX(0xe5a),
            wX(0xd7f),
            wX(0x7dd),
            wX(0xdeb),
            wX(0x921),
            wX(0x5a4),
            wX(0x882),
            wX(0x10a),
            wX(0x3fc),
            wX(0x7cc),
            wX(0x26a),
            wX(0xcce),
            wX(0x4d5),
            wX(0x125),
            wX(0x1f2),
            wX(0x3af),
            wX(0x6ec),
            wX(0x64b),
            wX(0x4c0),
            wX(0xd35),
            wX(0x772),
            wX(0xd41),
            wX(0x74b),
            wX(0x471),
            wX(0x673),
            wX(0x6a6),
            wX(0x534),
            wX(0x66e),
            wX(0x4c9),
            wX(0x6e6),
            wX(0x698),
            wX(0xcca),
            wX(0xe40),
            wX(0x584),
            wX(0x633),
            wX(0x676),
            wX(0x9bb),
            wX(0xaf7),
            wX(0xc7d),
            wX(0xa1b),
            wX(0x506),
            wX(0xd72),
            wX(0x27e),
            wX(0x981),
            wX(0xcdc),
            wX(0x6ca),
            wX(0x379),
            wX(0xa3e),
            wX(0xb39),
            wX(0x246),
            wX(0xa84),
            wX(0x5b1),
            wX(0x685),
            wX(0x8ec),
            wX(0xb6b),
            wX(0x55a),
            wX(0xae7),
            wX(0xaaa),
            wX(0x27c),
            wX(0x52d),
            wX(0x9af),
            wX(0x988),
            wX(0x186),
            wX(0x440),
            wX(0x9df),
          ];
        return (
          (rD = function () {
            return rK;
          }),
          rD()
        );
      }
      function rE(rK, rL, rM, rN, rO) {
        return rF(rL - 0x322, rM);
      }
      function rF(rK, rL) {
        const rM = rD();
        return (
          (rF = function (rN, rO) {
            rN = rN - (0x12b9 * 0x1 + 0x2f5 * 0xb + -0x3263);
            let rP = rM[rN];
            return rP;
          }),
          rF(rK, rL)
        );
      }
      function rG(rK, rL, rM, rN, rO) {
        return rF(rM - 0x398, rL);
      }
      (function (rK, rL) {
        const wY = b;
        function rM(rS, rT, rU, rV, rW) {
          return rF(rS - -0x202, rT);
        }
        function rN(rS, rT, rU, rV, rW) {
          return rF(rT - -0x361, rV);
        }
        const rO = rK();
        function rP(rS, rT, rU, rV, rW) {
          return rF(rT - -0x1c0, rV);
        }
        function rQ(rS, rT, rU, rV, rW) {
          return rF(rV - 0x1f1, rW);
        }
        function rR(rS, rT, rU, rV, rW) {
          return rF(rW - 0x352, rV);
        }
        while (!![]) {
          try {
            const rS =
              -parseInt(rM(-0xfd, -0x103, -0xdd, -0xfe, -0x10a)) /
                (-0x14de + 0x14ac + -0x33 * -0x1) +
              (parseInt(rM(-0xf2, -0x102, -0x107, -0x110, -0x114)) /
                (-0xe4b * -0x1 + 0x2 * 0x1039 + -0x2ebb)) *
                (parseInt(rR(0x413, 0x428, 0x42c, 0x416, 0x43b)) /
                  (-0x1ec7 * 0x1 + -0x19f * -0x14 + -0x1a2)) +
              parseInt(rQ(0x300, 0x307, 0x2f6, 0x30d, 0x2fd)) /
                (-0x1 * 0x17bf + 0xbba * 0x1 + -0x27 * -0x4f) +
              parseInt(rN(-0x260, -0x274, -0x280, -0x248, -0x27f)) /
                (-0x2706 + -0x17b5 + 0x20 * 0x1f6) +
              (parseInt(rR(0x45e, 0x496, 0x48c, 0x49d, 0x47d)) /
                (0x260f * -0x1 + 0x1 * -0x20a1 + 0x46b6)) *
                (parseInt(rN(-0x23e, -0x25f, -0x278, -0x280, -0x256)) /
                  (-0xca9 + -0xbd5 + 0x1885)) +
              -parseInt(rR(0x452, 0x456, 0x44a, 0x433, 0x44e)) /
                (-0xcce + -0x2482 + 0x4 * 0xc56) +
              (-parseInt(rP(-0xec, -0xc2, -0xe4, -0xe7, -0xc6)) /
                (-0x2 * -0x183 + 0x887 * -0x2 + 0x115 * 0xd)) *
                (parseInt(rM(-0x122, -0x12f, -0x129, -0x120, -0x12a)) /
                  (-0x750 + 0x4 * 0x29f + 0x1 * -0x322));
            if (rS === rL) break;
            else rO[wY(0x7b8)](rO[wY(0xd43)]());
          } catch (rT) {
            rO[wY(0x7b8)](rO[wY(0xd43)]());
          }
        }
      })(rD, -0x51c14 * -0x1 + -0x87309 + 0x92db * 0x13);
      const rH = [
        rI(0x22c, 0x242, 0x249, 0x246, 0x242) +
          rG(0x4bd, 0x4b8, 0x4ab, 0x481, 0x4c9) +
          rG(0x4b0, 0x49e, 0x4bb, 0x4c5, 0x4c8) +
          rJ(-0x128, -0x11a, -0x135, -0x121, -0x144),
        rG(0x491, 0x482, 0x49e, 0x4ba, 0x48b) +
          rI(0x234, 0x22e, 0x229, 0x255, 0x244),
        rJ(-0x14e, -0x170, -0x171, -0x14b, -0x136) +
          rI(0x265, 0x275, 0x23c, 0x287, 0x241),
      ];
      function rI(rK, rL, rM, rN, rO) {
        return rF(rK - 0x140, rO);
      }
      function rJ(rK, rL, rM, rN, rO) {
        return rF(rN - -0x23b, rL);
      }
      !rH[
        rI(0x23f, 0x225, 0x23c, 0x231, 0x269) +
          rJ(-0x147, -0x157, -0x129, -0x12c, -0x154)
      ](
        window[
          rJ(-0x11a, -0x12c, -0x15c, -0x144, -0x128) +
            rE(0x44e, 0x42f, 0x445, 0x45a, 0x404)
        ][
          rG(0x4d2, 0x4b9, 0x4ad, 0x4ca, 0x4a0) +
            rJ(-0x15e, -0x112, -0x150, -0x13b, -0x147)
        ][
          rC(0x331, 0x314, 0x315, 0x31d, 0x31c) +
            rJ(-0xed, -0xf8, -0xe4, -0x109, -0xfb) +
            "e"
        ]()
      ) &&
        (alert(
          rI(0x228, 0x1fd, 0x211, 0x21d, 0x21f) +
            rC(0x322, 0x354, 0x32c, 0x327, 0x321) +
            rC(0x316, 0x333, 0x2f3, 0x30f, 0x32b) +
            rE(0x471, 0x448, 0x42a, 0x421, 0x44c) +
            rI(0x249, 0x26b, 0x26f, 0x225, 0x276) +
            rJ(-0x15f, -0x11d, -0x133, -0x137, -0x116) +
            rE(0x3fb, 0x411, 0x42e, 0x42e, 0x404) +
            rG(0x484, 0x454, 0x475, 0x44f, 0x452) +
            rJ(-0x11b, -0x13a, -0x133, -0x11d, -0x132) +
            rJ(-0xf4, -0xfc, -0xf7, -0x10a, -0xff) +
            rG(0x4ba, 0x4e9, 0x4cd, 0x4ef, 0x4c5) +
            rG(0x461, 0x492, 0x47f, 0x493, 0x49f) +
            rJ(-0x156, -0x130, -0x120, -0x14a, -0x123) +
            rI(0x21e, 0x236, 0x241, 0x246, 0x215) +
            rE(0x44f, 0x444, 0x44b, 0x46c, 0x43d) +
            rE(0x441, 0x44f, 0x47b, 0x428, 0x470) +
            rJ(-0x170, -0x13c, -0x14a, -0x145, -0x131) +
            rI(0x238, 0x243, 0x25f, 0x25c, 0x246) +
            rG(0x49e, 0x486, 0x4af, 0x4c8, 0x495) +
            rC(0x2e9, 0x2fe, 0x2f3, 0x301, 0x325) +
            rI(0x226, 0x208, 0x20b, 0x23b, 0x1ff) +
            rE(0x464, 0x43d, 0x464, 0x448, 0x414) +
            rC(0x330, 0x306, 0x342, 0x324, 0x324) +
            rE(0x43f, 0x43f, 0x42d, 0x43f, 0x414) +
            rC(0x2cb, 0x318, 0x2ca, 0x2ef, 0x2e0) +
            rJ(-0x108, -0x10e, -0x12f, -0x10d, -0xf7) +
            rC(0x341, 0x31a, 0x310, 0x333, 0x350) +
            rG(0x4b1, 0x49c, 0x4c4, 0x4b8, 0x4d7) +
            rC(0x354, 0x350, 0x365, 0x33f, 0x347) +
            rG(0x4b5, 0x4d3, 0x4c8, 0x4e0, 0x4bf) +
            rI(0x252, 0x24c, 0x26c, 0x230, 0x273)
        ),
        kH(
          rC(0x325, 0x318, 0x30f, 0x325, 0x328) +
            rJ(-0x127, -0x15e, -0x162, -0x13e, -0x13f) +
            rI(0x21f, 0x23c, 0x245, 0x21b, 0x248) +
            rE(0x411, 0x414, 0x43b, 0x43e, 0x423) +
            rC(0x31d, 0x369, 0x349, 0x340, 0x34d) +
            rI(0x26a, 0x273, 0x255, 0x295, 0x261) +
            rG(0x4b3, 0x48a, 0x48b, 0x466, 0x46c) +
            rI(0x268, 0x278, 0x28c, 0x25c, 0x259) +
            rI(0x24b, 0x224, 0x277, 0x26c, 0x232) +
            rJ(-0x10d, -0x153, -0x124, -0x134, -0x14c) +
            rG(0x477, 0x4a5, 0x47d, 0x45c, 0x45a) +
            rI(0x224, 0x215, 0x21a, 0x24d, 0x24e) +
            rI(0x239, 0x252, 0x21c, 0x236, 0x20d) +
            rJ(-0x179, -0x15f, -0x12f, -0x159, -0x142) +
            rC(0x307, 0x300, 0x2fa, 0x322, 0x315) +
            rE(0x458, 0x44b, 0x441, 0x42e, 0x43f) +
            rJ(-0x117, -0x144, -0xf0, -0x117, -0x13b) +
            rI(0x23a, 0x224, 0x252, 0x226, 0x250) +
            rI(0x254, 0x247, 0x22b, 0x248, 0x26d) +
            rI(0x22b, 0x20c, 0x200, 0x246, 0x23b) +
            rJ(-0x175, -0x175, -0x174, -0x15d, -0x13f) +
            rC(0x2d5, 0x2fa, 0x2d1, 0x2ed, 0x2f5) +
            rC(0x310, 0x312, 0x304, 0x2f6, 0x308) +
            rI(0x24c, 0x22b, 0x249, 0x24e, 0x23b) +
            rI(0x260, 0x27b, 0x28c, 0x28c, 0x235) +
            rJ(-0x135, -0x141, -0x126, -0x140, -0x154) +
            rE(0x461, 0x441, 0x442, 0x428, 0x466) +
            rC(0x2e2, 0x326, 0x2f5, 0x2fa, 0x2f3) +
            "v>",
          (rK) => {
            const rL = {};
            rL[rO(-0x281, -0x2a8, -0x288, -0x28b, -0x282)] =
              rO(-0x28e, -0x297, -0x26e, -0x292, -0x28b) +
              rO(-0x285, -0x2ab, -0x289, -0x2b0, -0x2a7) +
              rR(0x3f2, 0x3f5, 0x3e1, 0x3e1, 0x3e3) +
              rQ(0x146, 0x141, 0x11f, 0x14b, 0x15a);
            function rM(rS, rT, rU, rV, rW) {
              return rC(rS - 0x10e, rT - 0xae, rV, rT - 0xdd, rW - 0x14d);
            }
            const rN = rL;
            function rO(rS, rT, rU, rV, rW) {
              return rE(rS - 0x13a, rS - -0x6b1, rT, rV - 0x11b, rW - 0x1a6);
            }
            function rP(rS, rT, rU, rV, rW) {
              return rJ(rS - 0x193, rW, rU - 0x13d, rU - 0x423, rW - 0x15b);
            }
            function rQ(rS, rT, rU, rV, rW) {
              return rI(rV - -0x124, rT - 0xf8, rU - 0x15a, rV - 0x16e, rU);
            }
            function rR(rS, rT, rU, rV, rW) {
              return rI(rT - 0x1ad, rT - 0x30, rU - 0x170, rV - 0x1d5, rS);
            }
            !rK &&
              (window[
                rQ(0xea, 0x112, 0x108, 0x113, 0x129) +
                  rP(0x2dc, 0x2ec, 0x2f5, 0x2e3, 0x2e2)
              ][rP(0x334, 0x305, 0x309, 0x31b, 0x2fd)] =
                rN[rP(0x2d4, 0x319, 0x2f6, 0x2e2, 0x31b)]);
          }
        ));
    }
    kI();
    var kJ = document[uu(0x5d6)](uu(0x15c)),
      kK = (function () {
        const x0 = uu;
        let rC = ![];
        return (
          (function (rD) {
            const wZ = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                wZ(0xbe9)
              ](rD) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                wZ(0xbe9)
              ](rD[wZ(0xc17)](0x0, 0x4))
            )
              rC = !![];
          })(navigator[x0(0xa5d)] || navigator[x0(0xd2c)] || window[x0(0xe03)]),
          rC
        );
      })(),
      kL =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          uu(0xbe9)
        ](navigator[uu(0xa5d)][uu(0xded)]()),
      kM = 0x514,
      kN = 0x28a,
      kO = 0x1,
      kP = [kl, kj, km, kk, kG, hf],
      kQ = 0x1,
      kR = 0x1;
    function kS() {
      const x1 = uu;
      (kR = Math[x1(0x9b2)](kh[x1(0x59c)] / cZ, kh[x1(0x52a)] / d0)),
        (kQ =
          Math[pa[x1(0x151)] ? x1(0xd8d) : x1(0x9b2)](kT() / kM, kU() / kN) *
          (kK && !kL ? 1.1 : 0x1)),
        (kQ *= kO);
      for (let rC = 0x0; rC < kP[x1(0xc60)]; rC++) {
        const rD = kP[rC];
        let rE = kQ * (rD[x1(0xaca)] || 0x1);
        (rD[x1(0xa09)][x1(0xb34)] = x1(0x85b) + rE + ")"),
          (rD[x1(0xa09)][x1(0x854)] = x1(0x1c4)),
          (rD[x1(0xa09)][x1(0x59c)] = kT() / rE + "px"),
          (rD[x1(0xa09)][x1(0x52a)] = kU() / rE + "px");
      }
    }
    function kT() {
      const x2 = uu;
      return document[x2(0x8dd)][x2(0x265)];
    }
    function kU() {
      const x3 = uu;
      return document[x3(0x8dd)][x3(0x653)];
    }
    var kV = 0x1;
    function kW() {
      const x4 = uu;
      (kV = pa[x4(0x7c2)] ? 0.65 : window[x4(0xe24)]),
        (kh[x4(0x59c)] = kT() * kV),
        (kh[x4(0x52a)] = kU() * kV),
        kS();
      for (let rC = 0x0; rC < mI[x4(0xc60)]; rC++) {
        mI[rC][x4(0x18d)]();
      }
    }
    window[uu(0xe17)] = function () {
      kW(), qH();
    };
    var kX = (function () {
        const x5 = uu,
          rC = 0x23,
          rD = rC / 0x2,
          rE = document[x5(0x57c)](x5(0xa75));
        rE[x5(0x59c)] = rE[x5(0x52a)] = rC;
        const rF = rE[x5(0xc6f)]("2d");
        return (
          (rF[x5(0xdf1)] = x5(0x811)),
          rF[x5(0x540)](),
          rF[x5(0xc4d)](0x0, rD),
          rF[x5(0x91a)](rC, rD),
          rF[x5(0xc4d)](rD, 0x0),
          rF[x5(0x91a)](rD, rC),
          rF[x5(0x5b9)](),
          rF[x5(0xc89)](rE, x5(0x4c2))
        );
      })(),
      kY = 0x19,
      kZ = Math["PI"] * 0x2,
      l0 = [];
    l1((Math["PI"] / 0xb4) * 0x1e, 0x1),
      l1((Math["PI"] / 0xb4) * 0x3c, 0x1, 0x6),
      l1((Math["PI"] / 0xb4) * 0x5a, -0x1, 0x6),
      l1((Math["PI"] / 0xb4) * 0x78, -0x1),
      l1((-Math["PI"] / 0xb4) * 0x1e, -0x1),
      l1((-Math["PI"] / 0xb4) * 0x3c, -0x1, 0x6),
      l1((-Math["PI"] / 0xb4) * 0x5a, 0x1, 0x6),
      l1((-Math["PI"] / 0xb4) * 0x78, 0x1);
    function l1(rC, rD, rE = 0x8) {
      const x6 = uu;
      rD *= -0x1;
      const rF = Math[x6(0x85f)](rC),
        rG = Math[x6(0xdad)](rC),
        rH = rF * 0x28,
        rI = rG * 0x28;
      l0[x6(0x7b8)]({
        dir: rD,
        start: [rH, rI],
        curve: [
          rH + rF * 0x17 + -rG * rD * rE,
          rI + rG * 0x17 + rF * rD * rE,
          rH + rF * 0x2e,
          rI + rG * 0x2e,
        ],
        side: Math[x6(0xc0d)](rC),
      });
    }
    var l2 = l3();
    function l3() {
      const x7 = uu,
        rC = new Path2D(),
        rD = Math["PI"] / 0x5;
      return (
        rC[x7(0x660)](0x0, 0x0, 0x28, rD, kZ - rD),
        rC[x7(0x92a)](
          0x12,
          0x0,
          Math[x7(0x85f)](rD) * 0x28,
          Math[x7(0xdad)](rD) * 0x28
        ),
        rC[x7(0x51f)](),
        rC
      );
    }
    var l4 = l5();
    function l5() {
      const x8 = uu,
        rC = new Path2D();
      return (
        rC[x8(0xc4d)](-0x28, 0x5),
        rC[x8(0xc0b)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rC[x8(0x91a)](0x28, -0x5),
        rC[x8(0xc0b)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rC[x8(0x51f)](),
        rC
      );
    }
    function l6(rC, rD = 0x1, rE = 0x0) {
      const x9 = uu,
        rF = new Path2D();
      for (let rG = 0x0; rG < rC; rG++) {
        const rH = (Math["PI"] * 0x2 * rG) / rC + rE;
        rF[x9(0x91a)](
          Math[x9(0x85f)](rH) - Math[x9(0xdad)](rH) * 0.1 * rD,
          Math[x9(0xdad)](rH)
        );
      }
      return rF[x9(0x51f)](), rF;
    }
    var l7 = {
      petalRock: l6(0x5),
      petalSoil: l6(0xa),
      petalSalt: l6(0x7),
      petalLightning: (function () {
        const xa = uu,
          rC = new Path2D();
        for (let rD = 0x0; rD < 0x14; rD++) {
          const rE = (rD / 0x14) * Math["PI"] * 0x2,
            rF = rD % 0x2 === 0x0 ? 0x1 : 0.55;
          rC[xa(0x91a)](Math[xa(0x85f)](rE) * rF, Math[xa(0xdad)](rE) * rF);
        }
        return rC[xa(0x51f)](), rC;
      })(),
      petalCotton: l9(0x9, 0x1, 0.5, 1.6),
      petalWeb: l9(0x5, 0x1, 0.5, 0.7),
      petalCactus: l9(0x8, 0x1, 0.5, 0.7),
      petalSand: l6(0x6, 0x0, 0.2),
    };
    function l8(rC, rD, rE, rF, rG) {
      const xb = uu;
      (rC[xb(0xdf1)] = rG),
        (rC[xb(0x930)] = rE),
        rC[xb(0xb1a)](),
        (rD *= 0.45),
        rC[xb(0xd57)](rD),
        rC[xb(0xbd2)](-0x14, 0x0),
        rC[xb(0x540)](),
        rC[xb(0xc4d)](0x0, 0x26),
        rC[xb(0x91a)](0x50, 0x7),
        rC[xb(0x91a)](0x50, -0x7),
        rC[xb(0x91a)](0x0, -0x26),
        rC[xb(0x91a)](-0x14, -0x1e),
        rC[xb(0x91a)](-0x14, 0x1e),
        rC[xb(0x51f)](),
        (rE = rE / rD),
        (rC[xb(0x930)] = 0x64 + rE),
        (rC[xb(0xdf1)] = rG),
        rC[xb(0x5b9)](),
        (rC[xb(0xdf1)] = rC[xb(0xc50)] = rF),
        (rC[xb(0x930)] -= rE * 0x2),
        rC[xb(0x5b9)](),
        rC[xb(0xa90)](),
        rC[xb(0xaea)]();
    }
    function l9(rC, rD, rE, rF) {
      const xc = uu,
        rG = new Path2D();
      return la(rG, rC, rD, rE, rF), rG[xc(0x51f)](), rG;
    }
    function la(rC, rD, rE, rF, rG) {
      const xd = uu;
      rC[xd(0xc4d)](rE, 0x0);
      for (let rH = 0x1; rH <= rD; rH++) {
        const rI = (Math["PI"] * 0x2 * (rH - rF)) / rD,
          rJ = (Math["PI"] * 0x2 * rH) / rD;
        rC[xd(0x92a)](
          Math[xd(0x85f)](rI) * rE * rG,
          Math[xd(0xdad)](rI) * rE * rG,
          Math[xd(0x85f)](rJ) * rE,
          Math[xd(0xdad)](rJ) * rE
        );
      }
    }
    var lb = (function () {
        const xe = uu,
          rC = new Path2D();
        rC[xe(0xc4d)](0x3c, 0x0);
        const rD = 0x6;
        for (let rE = 0x0; rE < rD; rE++) {
          const rF = ((rE + 0.5) / rD) * Math["PI"] * 0x2,
            rG = ((rE + 0x1) / rD) * Math["PI"] * 0x2;
          rC[xe(0x92a)](
            Math[xe(0x85f)](rF) * 0x78,
            Math[xe(0xdad)](rF) * 0x78,
            Math[xe(0x85f)](rG) * 0x3c,
            Math[xe(0xdad)](rG) * 0x3c
          );
        }
        return rC[xe(0x51f)](), rC;
      })(),
      lc = (function () {
        const xf = uu,
          rC = new Path2D(),
          rD = 0x6;
        for (let rE = 0x0; rE < rD; rE++) {
          const rF = ((rE + 0.5) / rD) * Math["PI"] * 0x2;
          rC[xf(0xc4d)](0x0, 0x0), rC[xf(0x91a)](...ld(0x37, 0x0, rF));
          for (let rG = 0x0; rG < 0x2; rG++) {
            const rH = (rG / 0x2) * 0x1e + 0x14,
              rI = 0xa - rG * 0x2;
            rC[xf(0xc4d)](...ld(rH + rI, -rI, rF)),
              rC[xf(0x91a)](...ld(rH, 0x0, rF)),
              rC[xf(0x91a)](...ld(rH + rI, rI, rF));
          }
        }
        return rC;
      })();
    function ld(rC, rD, rE) {
      const xg = uu,
        rF = Math[xg(0xdad)](rE),
        rG = Math[xg(0x85f)](rE);
      return [rC * rG + rD * rF, rD * rG - rC * rF];
    }
    function le(rC, rD, rE) {
      (rC /= 0x168), (rD /= 0x64), (rE /= 0x64);
      let rF, rG, rH;
      if (rD === 0x0) rF = rG = rH = rE;
      else {
        const rJ = (rM, rN, rO) => {
            if (rO < 0x0) rO += 0x1;
            if (rO > 0x1) rO -= 0x1;
            if (rO < 0x1 / 0x6) return rM + (rN - rM) * 0x6 * rO;
            if (rO < 0x1 / 0x2) return rN;
            if (rO < 0x2 / 0x3) return rM + (rN - rM) * (0x2 / 0x3 - rO) * 0x6;
            return rM;
          },
          rK = rE < 0.5 ? rE * (0x1 + rD) : rE + rD - rE * rD,
          rL = 0x2 * rE - rK;
        (rF = rJ(rL, rK, rC + 0x1 / 0x3)),
          (rG = rJ(rL, rK, rC)),
          (rH = rJ(rL, rK, rC - 0x1 / 0x3));
      }
      const rI = (rM) => {
        const xh = b,
          rN = Math[xh(0xbb6)](rM * 0xff)[xh(0x7bc)](0x10);
        return rN[xh(0xc60)] === 0x1 ? "0" + rN : rN;
      };
      return "#" + rI(rF) + rI(rG) + rI(rH);
    }
    var lf = [];
    for (let rC = 0x0; rC < 0xa; rC++) {
      const rD = 0x1 - rC / 0xa;
      lf[uu(0x7b8)](le(0x28 + rD * 0xc8, 0x50, 0x3c * rD));
    }
    var lg = [uu(0xde8), uu(0xa7f)],
      lh = lg[0x0],
      li = [uu(0x90f), uu(0x7bb), uu(0xa85), uu(0x1f7)];
    function lj(rE = uu(0x143)) {
      const xi = uu,
        rF = [];
      for (let rG = 0x0; rG < 0x5; rG++) {
        rF[xi(0x7b8)](pY(rE, 0.8 - (rG / 0x5) * 0.25));
      }
      return rF;
    }
    var lk = {
        pet: {
          body: lh,
          wing: pY(lh, 0.7),
          tail_outline: pY(lh, 0.4),
          bone_outline: pY(lh, 0.4),
          bone: pY(lh, 0.6),
          tail: lj(pY(lh, 0.8)),
        },
        main: {
          body: uu(0x143),
          wing: uu(0x9b8),
          tail_outline: uu(0x2f9),
          bone_outline: uu(0xbfb),
          bone: uu(0x2f9),
          tail: lj(),
        },
      },
      ll = new Path2D(uu(0x80c)),
      lm = new Path2D(uu(0xbc7)),
      ln = [];
    for (let rE = 0x0; rE < 0x3; rE++) {
      ln[uu(0x7b8)](pY(lg[0x0], 0x1 - (rE / 0x3) * 0.2));
    }
    function lo(rF = Math[uu(0x66d)]()) {
      return function () {
        return (rF = (rF * 0x2455 + 0xc091) % 0x38f40), rF / 0x38f40;
      };
    }
    const lp = {
      [cR[uu(0xa7d)]]: [uu(0x432), uu(0x3df)],
      [cR[uu(0xb23)]]: [uu(0x143), uu(0x809)],
      [cR[uu(0x6c1)]]: [uu(0x9a5), uu(0x647)],
    };
    var lq = lp;
    const lr = {};
    (lr[uu(0x65c)] = !![]),
      (lr[uu(0x913)] = !![]),
      (lr[uu(0x520)] = !![]),
      (lr[uu(0xdc4)] = !![]),
      (lr[uu(0xc05)] = !![]),
      (lr[uu(0xadf)] = !![]),
      (lr[uu(0x2a3)] = !![]);
    var ls = lr;
    const lt = {};
    (lt[uu(0x89f)] = !![]),
      (lt[uu(0x412)] = !![]),
      (lt[uu(0x625)] = !![]),
      (lt[uu(0x5ff)] = !![]),
      (lt[uu(0x88a)] = !![]),
      (lt[uu(0xa25)] = !![]),
      (lt[uu(0xe07)] = !![]);
    var lu = lt;
    const lv = {};
    (lv[uu(0x625)] = !![]),
      (lv[uu(0x5ff)] = !![]),
      (lv[uu(0x88a)] = !![]),
      (lv[uu(0xa25)] = !![]);
    var lw = lv;
    const lx = {};
    (lx[uu(0x412)] = !![]), (lx[uu(0x622)] = !![]), (lx[uu(0xdc4)] = !![]);
    var ly = lx;
    const lz = {};
    (lz[uu(0x575)] = !![]), (lz[uu(0x409)] = !![]), (lz[uu(0xd79)] = !![]);
    var lA = lz;
    const lB = {};
    (lB[uu(0x98e)] = !![]),
      (lB[uu(0xbbd)] = !![]),
      (lB[uu(0x22b)] = !![]),
      (lB[uu(0x587)] = !![]),
      (lB[uu(0x422)] = !![]);
    var lC = lB;
    function lD(rF, rG) {
      const xj = uu;
      rF[xj(0x540)](), rF[xj(0xc4d)](rG, 0x0);
      for (let rH = 0x0; rH < 0x6; rH++) {
        const rI = (rH / 0x6) * Math["PI"] * 0x2;
        rF[xj(0x91a)](Math[xj(0x85f)](rI) * rG, Math[xj(0xdad)](rI) * rG);
      }
      rF[xj(0x51f)]();
    }
    function lE(rF, rG, rH, rI, rJ) {
      const xk = uu;
      rF[xk(0x540)](),
        rF[xk(0xc4d)](0x9, -0x5),
        rF[xk(0xc0b)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rF[xk(0x92a)](0xd, 0x0, 0x9, -0x5),
        rF[xk(0x51f)](),
        (rF[xk(0xd4e)] = rF[xk(0xe13)] = xk(0xbb6)),
        (rF[xk(0xdf1)] = rI),
        (rF[xk(0x930)] = rG),
        rF[xk(0x5b9)](),
        (rF[xk(0x930)] -= rJ),
        (rF[xk(0xc50)] = rF[xk(0xdf1)] = rH),
        rF[xk(0xa90)](),
        rF[xk(0x5b9)]();
    }
    var lF = class {
        constructor(rF = -0x1, rG, rH, rI, rJ, rK = 0x7, rL = -0x1) {
          const xl = uu;
          (this["id"] = rF),
            (this[xl(0x909)] = rG),
            (this[xl(0x5d7)] = hL[rG]),
            (this[xl(0xdb2)] = this[xl(0x5d7)][xl(0xa69)](xl(0xd7f))),
            (this["x"] = this["nx"] = this["ox"] = rH),
            (this["y"] = this["ny"] = this["oy"] = rI),
            (this[xl(0x6b8)] = this[xl(0xada)] = this[xl(0x19d)] = rJ),
            (this[xl(0x831)] =
              this[xl(0x9d4)] =
              this[xl(0x6b6)] =
              this[xl(0x62a)] =
                rL),
            (this[xl(0x694)] = 0x0),
            (this[xl(0x423)] = this[xl(0x33e)] = this[xl(0x72b)] = rK),
            (this[xl(0x602)] = 0x0),
            (this[xl(0xda1)] = ![]),
            (this[xl(0x86c)] = 0x0),
            (this[xl(0x61f)] = 0x0),
            (this[xl(0xa43)] = this[xl(0x5d7)][xl(0x6ee)](xl(0x229)) > -0x1),
            (this[xl(0x4de)] = this[xl(0xa43)] ? this[xl(0x9d4)] < 0x1 : 0x1),
            (this[xl(0x1f5)] = ![]),
            (this[xl(0xcd5)] = 0x0),
            (this[xl(0x6c8)] = 0x0),
            (this[xl(0x655)] = 0x0),
            (this[xl(0x9c2)] = 0x1),
            (this[xl(0x3e9)] = 0x0),
            (this[xl(0xd75)] = [cR[xl(0xde3)], cR[xl(0x906)], cR[xl(0xbfd)]][
              xl(0xb65)
            ](this[xl(0x909)])),
            (this[xl(0x42b)] = lu[this[xl(0x5d7)]]),
            (this[xl(0x44c)] = lw[this[xl(0x5d7)]] ? 0x32 / 0xc8 : 0x0),
            (this[xl(0x5d9)] = ls[this[xl(0x5d7)]]),
            (this[xl(0x315)] = 0x0),
            (this[xl(0x12f)] = 0x0),
            (this[xl(0xe1e)] = ![]),
            (this[xl(0x205)] = 0x0),
            (this[xl(0x79e)] = !![]),
            (this[xl(0x2c8)] = 0x2),
            (this[xl(0xddb)] = 0x0),
            (this[xl(0x17e)] = lC[this[xl(0x5d7)]]),
            (this[xl(0x5da)] = ly[this[xl(0x5d7)]]),
            (this[xl(0xa13)] = lA[this[xl(0x5d7)]]);
        }
        [uu(0x630)]() {
          const xm = uu;
          this[xm(0xda1)] && (this[xm(0x86c)] += pP / 0xc8);
          (this[xm(0x12f)] += ((this[xm(0xe1e)] ? 0x1 : -0x1) * pP) / 0xc8),
            (this[xm(0x12f)] = Math[xm(0xd8d)](
              0x1,
              Math[xm(0x9b2)](0x0, this[xm(0x12f)])
            )),
            (this[xm(0x655)] = pv(
              this[xm(0x655)],
              this[xm(0x6c8)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[xm(0x6c8)] = pv(this[xm(0x6c8)], this[xm(0xcd5)], 0x64));
          this[xm(0x61f)] > 0x0 &&
            ((this[xm(0x61f)] -= pP / 0x96),
            this[xm(0x61f)] < 0x0 && (this[xm(0x61f)] = 0x0));
          (this[xm(0x602)] += pP / 0x64),
            (this["t"] = Math[xm(0xd8d)](0x1, this[xm(0x602)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[xm(0x9d4)] =
              this[xm(0x62a)] +
              (this[xm(0x6b6)] - this[xm(0x62a)]) * this["t"]),
            (this[xm(0x423)] =
              this[xm(0x72b)] +
              (this[xm(0x33e)] - this[xm(0x72b)]) * this["t"]);
          if (this[xm(0xd75)]) {
            const rF = Math[xm(0xd8d)](0x1, pP / 0x64);
            (this[xm(0x9c2)] +=
              (Math[xm(0x85f)](this[xm(0xada)]) - this[xm(0x9c2)]) * rF),
              (this[xm(0x3e9)] +=
                (Math[xm(0xdad)](this[xm(0xada)]) - this[xm(0x3e9)]) * rF);
          }
          (this[xm(0x6b8)] = f7(this[xm(0x19d)], this[xm(0xada)], this["t"])),
            (this[xm(0x205)] +=
              ((Math[xm(0xbe5)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pP) /
              0x12),
            this[xm(0x694)] > 0x0 &&
              ((this[xm(0x694)] -= pP / 0x258),
              this[xm(0x694)] < 0x0 && (this[xm(0x694)] = 0x0)),
            this[xm(0xa13)] &&
              ((this[xm(0x2c8)] += pP / 0x5dc),
              this[xm(0x2c8)] > 0x1 && (this[xm(0x2c8)] = 0x1),
              (this[xm(0x79e)] = this[xm(0x2c8)] < 0x1)),
            this[xm(0x9d4)] < 0x1 &&
              (this[xm(0x4de)] = pv(this[xm(0x4de)], 0x1, 0xc8)),
            this[xm(0x694)] === 0x0 &&
              (this[xm(0x831)] +=
                (this[xm(0x9d4)] - this[xm(0x831)]) *
                Math[xm(0xd8d)](0x1, pP / 0xc8));
        }
        [uu(0x5c8)](rF, rG = ![]) {
          const xn = uu,
            rH = this[xn(0x423)] / 0x19;
          rF[xn(0xd57)](rH),
            rF[xn(0xbd2)](0x5, 0x0),
            (rF[xn(0x930)] = 0x5),
            (rF[xn(0xe13)] = rF[xn(0xd4e)] = xn(0xbb6)),
            (rF[xn(0xdf1)] = rF[xn(0xc50)] = this[xn(0x863)](xn(0x416)));
          rG &&
            (rF[xn(0xb1a)](),
            rF[xn(0xbd2)](0x3, 0x0),
            rF[xn(0x540)](),
            rF[xn(0xc4d)](-0xa, 0x0),
            rF[xn(0x91a)](-0x28, -0xf),
            rF[xn(0x92a)](-0x21, 0x0, -0x28, 0xf),
            rF[xn(0x51f)](),
            rF[xn(0xaea)](),
            rF[xn(0x5b9)](),
            rF[xn(0xa90)]());
          rF[xn(0x540)](), rF[xn(0xc4d)](0x0, 0x1e);
          const rI = 0x1c,
            rJ = 0x24,
            rK = 0x5;
          rF[xn(0xc4d)](0x0, rI);
          for (let rL = 0x0; rL < rK; rL++) {
            const rM = ((((rL + 0.5) / rK) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              rN = ((((rL + 0x1) / rK) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rF[xn(0x92a)](
              Math[xn(0x85f)](rM) * rJ * 0.85,
              -Math[xn(0xdad)](rM) * rJ,
              Math[xn(0x85f)](rN) * rI * 0.7,
              -Math[xn(0xdad)](rN) * rI
            );
          }
          rF[xn(0x91a)](-0x1c, -0x9),
            rF[xn(0x92a)](-0x26, 0x0, -0x1c, 0x9),
            rF[xn(0x91a)](0x0, rI),
            rF[xn(0x51f)](),
            (rF[xn(0xc50)] = this[xn(0x863)](xn(0xda8))),
            rF[xn(0xa90)](),
            rF[xn(0x5b9)](),
            rF[xn(0x540)]();
          for (let rO = 0x0; rO < 0x4; rO++) {
            const rP = (((rO / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rQ = -0x1e + Math[xn(0x85f)](rP) * 0xd,
              rR = Math[xn(0xdad)](rP) * 0xb;
            rF[xn(0xc4d)](rQ, rR),
              rF[xn(0x91a)](
                rQ + Math[xn(0x85f)](rP) * 0x1b,
                rR + Math[xn(0xdad)](rP) * 0x1b
              );
          }
          (rF[xn(0x930)] = 0x4), rF[xn(0x5b9)]();
        }
        [uu(0x387)](rF, rG = uu(0x941), rH = 0x0) {
          const xo = uu;
          for (let rI = 0x0; rI < l0[xo(0xc60)]; rI++) {
            const rJ = l0[rI];
            rF[xo(0xb1a)](),
              rF[xo(0x5f9)](
                rJ[xo(0x83e)] * Math[xo(0xdad)](this[xo(0x205)] + rI) * 0.15 +
                  rH * rJ[xo(0x77d)]
              ),
              rF[xo(0x540)](),
              rF[xo(0xc4d)](...rJ[xo(0x36e)]),
              rF[xo(0x92a)](...rJ[xo(0x211)]),
              (rF[xo(0xdf1)] = this[xo(0x863)](rG)),
              (rF[xo(0x930)] = 0x8),
              (rF[xo(0xe13)] = xo(0xbb6)),
              rF[xo(0x5b9)](),
              rF[xo(0xaea)]();
          }
        }
        [uu(0x36b)](rF) {
          const xp = uu;
          rF[xp(0x540)]();
          let rG = 0x0,
            rH = 0x0,
            rI,
            rJ;
          const rK = 0x14;
          for (let rL = 0x0; rL < rK; rL++) {
            const rM = (rL / rK) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              rN = ((rL + 0x1) / rK) * 0x28;
            (rI = Math[xp(0x85f)](rM) * rN), (rJ = Math[xp(0xdad)](rM) * rN);
            const rO = rG + rI,
              rP = rH + rJ;
            rF[xp(0x92a)](
              (rG + rO) * 0.5 + rJ * 0.15,
              (rH + rP) * 0.5 - rI * 0.15,
              rO,
              rP
            ),
              (rG = rO),
              (rH = rP);
          }
          rF[xp(0x92a)](
            rG - rJ * 0.42 + rI * 0.4,
            rH + rI * 0.42 + rJ * 0.4,
            rG - rJ * 0.84,
            rH + rI * 0.84
          ),
            (rF[xp(0xc50)] = this[xp(0x863)](xp(0xc2f))),
            rF[xp(0xa90)](),
            (rF[xp(0x930)] = 0x8),
            (rF[xp(0xdf1)] = this[xp(0x863)](xp(0x398))),
            rF[xp(0x5b9)]();
        }
        [uu(0xdc4)](rF) {
          const xq = uu;
          rF[xq(0xd57)](this[xq(0x423)] / 0xd),
            rF[xq(0x5f9)](-Math["PI"] / 0x6),
            (rF[xq(0xe13)] = rF[xq(0xd4e)] = xq(0xbb6)),
            rF[xq(0x540)](),
            rF[xq(0xc4d)](0x0, -0xe),
            rF[xq(0x91a)](0x6, -0x14),
            (rF[xq(0xc50)] = rF[xq(0xdf1)] = this[xq(0x863)](xq(0x71b))),
            (rF[xq(0x930)] = 0x7),
            rF[xq(0x5b9)](),
            (rF[xq(0xc50)] = rF[xq(0xdf1)] = this[xq(0x863)](xq(0x552))),
            (rF[xq(0x930)] = 0x2),
            rF[xq(0x5b9)](),
            rF[xq(0x540)](),
            rF[xq(0xc4d)](0x0, -0xc),
            rF[xq(0x92a)](-0x6, 0x0, 0x4, 0xe),
            rF[xq(0xc0b)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rF[xq(0x930)] = 0xc),
            (rF[xq(0xc50)] = rF[xq(0xdf1)] = this[xq(0x863)](xq(0x912))),
            rF[xq(0xa90)](),
            rF[xq(0x5b9)](),
            (rF[xq(0x930)] = 0x6),
            (rF[xq(0xc50)] = rF[xq(0xdf1)] = this[xq(0x863)](xq(0x18b))),
            rF[xq(0x5b9)](),
            rF[xq(0xa90)]();
        }
        [uu(0x520)](rF) {
          const xr = uu;
          rF[xr(0xd57)](this[xr(0x423)] / 0x2d),
            rF[xr(0xbd2)](-0x14, 0x0),
            (rF[xr(0xe13)] = rF[xr(0xd4e)] = xr(0xbb6)),
            rF[xr(0x540)]();
          const rG = 0x6,
            rH = Math["PI"] * 0.45,
            rI = 0x3c,
            rJ = 0x46;
          rF[xr(0xc4d)](0x0, 0x0);
          for (let rK = 0x0; rK < rG; rK++) {
            const rL = ((rK / rG) * 0x2 - 0x1) * rH,
              rM = (((rK + 0x1) / rG) * 0x2 - 0x1) * rH;
            rK === 0x0 &&
              rF[xr(0x92a)](
                -0xa,
                -0x32,
                Math[xr(0x85f)](rL) * rI,
                Math[xr(0xdad)](rL) * rI
              );
            const rN = (rL + rM) / 0x2;
            rF[xr(0x92a)](
              Math[xr(0x85f)](rN) * rJ,
              Math[xr(0xdad)](rN) * rJ,
              Math[xr(0x85f)](rM) * rI,
              Math[xr(0xdad)](rM) * rI
            );
          }
          rF[xr(0x92a)](-0xa, 0x32, 0x0, 0x0),
            (rF[xr(0xc50)] = this[xr(0x863)](xr(0x27b))),
            (rF[xr(0xdf1)] = this[xr(0x863)](xr(0x97e))),
            (rF[xr(0x930)] = 0xa),
            rF[xr(0x5b9)](),
            rF[xr(0xa90)](),
            rF[xr(0x540)](),
            rF[xr(0x660)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rF[xr(0x51f)](),
            (rF[xr(0xdf1)] = this[xr(0x863)](xr(0x57d))),
            (rF[xr(0x930)] = 0x1e),
            rF[xr(0x5b9)](),
            (rF[xr(0x930)] = 0xa),
            (rF[xr(0xdf1)] = rF[xr(0xc50)] = this[xr(0x863)](xr(0x7c6))),
            rF[xr(0xa90)](),
            rF[xr(0x5b9)]();
        }
        [uu(0x429)](rF, rG = ![]) {
          const xs = uu;
          rF[xs(0xd57)](this[xs(0x423)] / 0x64);
          let rH = this[xs(0xa28)]
            ? 0.75
            : Math[xs(0xdad)](Date[xs(0x5b6)]() / 0x96 + this[xs(0x205)]);
          (rH = rH * 0.5 + 0.5),
            (rH *= 0.7),
            rF[xs(0x540)](),
            rF[xs(0xc4d)](0x0, 0x0),
            rF[xs(0x660)](0x0, 0x0, 0x64, rH, Math["PI"] * 0x2 - rH),
            rF[xs(0x51f)](),
            (rF[xs(0xc50)] = this[xs(0x863)](xs(0x4c7))),
            rF[xs(0xa90)](),
            rF[xs(0xb63)](),
            (rF[xs(0xdf1)] = xs(0xd1f)),
            (rF[xs(0x930)] = rG ? 0x28 : 0x1e),
            (rF[xs(0xd4e)] = xs(0xbb6)),
            rF[xs(0x5b9)](),
            !rG &&
              (rF[xs(0x540)](),
              rF[xs(0x660)](
                0x0 - rH * 0x8,
                -0x32 - rH * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rF[xs(0xc50)] = xs(0x702)),
              rF[xs(0xa90)]());
        }
        [uu(0x603)](rF) {
          const xt = uu;
          rF[xt(0xd57)](this[xt(0x423)] / 0x50),
            rF[xt(0x5f9)](-this[xt(0x6b8)]),
            rF[xt(0xbd2)](0x0, 0x50);
          const rG = Date[xt(0x5b6)]() / 0x12c + this[xt(0x205)];
          rF[xt(0x540)]();
          const rH = 0x3;
          let rI;
          for (let rL = 0x0; rL < rH; rL++) {
            const rM = ((rL / rH) * 0x2 - 0x1) * 0x64,
              rN = (((rL + 0x1) / rH) * 0x2 - 0x1) * 0x64;
            (rI =
              0x14 +
              (Math[xt(0xdad)]((rL / rH) * Math["PI"] * 0x8 + rG) * 0.5 + 0.5) *
                0x1e),
              rL === 0x0 && rF[xt(0xc4d)](rM, -rI),
              rF[xt(0xc0b)](rM, rI, rN, rI, rN, -rI);
          }
          rF[xt(0xc0b)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rI),
            rF[xt(0x51f)](),
            (rF[xt(0xa46)] *= 0.7);
          const rJ = this[xt(0x1f5)]
            ? lg[0x0]
            : this["id"] < 0x0
            ? li[0x0]
            : li[this["id"] % li[xt(0xc60)]];
          (rF[xt(0xc50)] = this[xt(0x863)](rJ)),
            rF[xt(0xa90)](),
            rF[xt(0xb63)](),
            (rF[xt(0xd4e)] = xt(0xbb6)),
            (rF[xt(0xdf1)] = xt(0xd1f)),
            xt(0xc76),
            (rF[xt(0x930)] = 0x1e),
            rF[xt(0x5b9)]();
          let rK = Math[xt(0xdad)](rG * 0x1);
          (rK = rK * 0.5 + 0.5),
            (rK *= 0x3),
            rF[xt(0x540)](),
            rF[xt(0x6f0)](
              0x0,
              -0x82 - rK * 0x2,
              0x28 - rK,
              0x14 - rK * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rF[xt(0xc50)] = rF[xt(0xdf1)]),
            rF[xt(0xa90)]();
        }
        [uu(0x8be)](rF, rG) {
          const xu = uu;
          rF[xu(0xd57)](this[xu(0x423)] / 0x14);
          const rH = rF[xu(0xa46)];
          (rF[xu(0xdf1)] = rF[xu(0xc50)] = this[xu(0x863)](xu(0xe49))),
            (rF[xu(0xa46)] = 0.4 * rH),
            rF[xu(0xb1a)](),
            rF[xu(0x540)](),
            rF[xu(0x5f9)](Math["PI"] * 0.16),
            rF[xu(0xbd2)](rG ? -0x6 : -0x9, 0x0),
            rF[xu(0xc4d)](0x0, -0x4),
            rF[xu(0x92a)](-0x2, 0x0, 0x0, 0x4),
            (rF[xu(0x930)] = 0x8),
            (rF[xu(0xd4e)] = rF[xu(0xe13)] = xu(0xbb6)),
            rF[xu(0x5b9)](),
            rF[xu(0xaea)](),
            rF[xu(0x540)](),
            rF[xu(0x660)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rF[xu(0xa90)](),
            rF[xu(0xb63)](),
            (rF[xu(0xa46)] = 0.5 * rH),
            (rF[xu(0x930)] = rG ? 0x8 : 0x3),
            rF[xu(0x5b9)]();
        }
        [uu(0x587)](rF) {
          const xv = uu;
          rF[xv(0xd57)](this[xv(0x423)] / 0x64);
          const rG = this[xv(0x863)](xv(0x853)),
            rH = this[xv(0x863)](xv(0xdda)),
            rI = 0x4;
          rF[xv(0xd4e)] = rF[xv(0xe13)] = xv(0xbb6);
          const rJ = 0x64 - rF[xv(0x930)] * 0.5;
          for (let rK = 0x0; rK <= rI; rK++) {
            const rL = (0x1 - rK / rI) * rJ;
            lD(rF, rL),
              (rF[xv(0x930)] =
                0x1e +
                rK *
                  (Math[xv(0xdad)](Date[xv(0x5b6)]() / 0x320 + rK) * 0.5 +
                    0.5) *
                  0x5),
              (rF[xv(0xc50)] = rF[xv(0xdf1)] = rK % 0x2 === 0x0 ? rG : rH),
              rK === rI - 0x1 && rF[xv(0xa90)](),
              rF[xv(0x5b9)]();
          }
        }
        [uu(0x190)](rF, rG) {
          const xw = uu;
          rF[xw(0x540)](),
            rF[xw(0x660)](0x0, 0x0, this[xw(0x423)], 0x0, kZ),
            (rF[xw(0xc50)] = this[xw(0x863)](rG)),
            rF[xw(0xa90)](),
            (rF[xw(0xc50)] = xw(0x702));
          for (let rH = 0x1; rH < 0x4; rH++) {
            rF[xw(0x540)](),
              rF[xw(0x660)](
                0x0,
                0x0,
                this[xw(0x423)] * (0x1 - rH / 0x4),
                0x0,
                kZ
              ),
              rF[xw(0xa90)]();
          }
        }
        [uu(0xdc0)](rF, rG) {
          const xx = uu;
          rF[xx(0xbd2)](-this[xx(0x423)], 0x0), (rF[xx(0xab2)] = xx(0x78c));
          const rH = 0x32;
          let rI = ![];
          !this[xx(0xd62)] && ((rI = !![]), (this[xx(0xd62)] = []));
          while (this[xx(0xd62)][xx(0xc60)] < rH) {
            this[xx(0xd62)][xx(0x7b8)]({
              x: rI ? Math[xx(0x66d)]() : 0x0,
              y: Math[xx(0x66d)]() * 0x2 - 0x1,
              vx: Math[xx(0x66d)]() * 0.03 + 0.02,
              size: Math[xx(0x66d)]() * 0.2 + 0.2,
            });
          }
          const rJ = this[xx(0x423)] * 0x2,
            rK = Math[xx(0x9b2)](this[xx(0x423)] * 0.1, 0x4),
            rL = rF[xx(0xa46)];
          (rF[xx(0xc50)] = rG), rF[xx(0x540)]();
          for (let rM = rH - 0x1; rM >= 0x0; rM--) {
            const rN = this[xx(0xd62)][rM];
            rN["x"] += rN["vx"];
            const rO = rN["x"] * rJ,
              rP = this[xx(0x44c)] * rO,
              rQ = rN["y"] * rP,
              rR =
                Math[xx(0x3a4)](0x1 - Math[xx(0x6e2)](rQ) / rP, 0.2) *
                Math[xx(0x3a4)](0x1 - rO / rJ, 0.2);
            if (rN["x"] >= 0x1 || rR < 0.001) {
              this[xx(0xd62)][xx(0xc15)](rM, 0x1);
              continue;
            }
            (rF[xx(0xa46)] = rR * rL * 0.5),
              rF[xx(0x540)](),
              rF[xx(0x660)](
                rO,
                rQ,
                rN[xx(0x423)] * rP + rK,
                0x0,
                Math["PI"] * 0x2
              ),
              rF[xx(0xa90)]();
          }
        }
        [uu(0x34e)](rF) {
          const xy = uu;
          rF[xy(0xd57)](this[xy(0x423)] / 0x46),
            rF[xy(0x5f9)](-Math["PI"] / 0x2);
          const rG = pO / 0xc8;
          (rF[xy(0x930)] = 0x14),
            (rF[xy(0xdf1)] = xy(0x811)),
            (rF[xy(0xe13)] = rF[xy(0xd4e)] = xy(0xbb6)),
            (rF[xy(0xc50)] = this[xy(0x863)](xy(0xbae)));
          if (!![]) {
            this[xy(0x978)](rF);
            return;
          }
          const rH = 0x2;
          for (let rI = 0x1; rI <= rH; rI++) {
            rF[xy(0xb1a)]();
            let rJ = 0x1 - rI / rH;
            (rJ *= 0x1 + Math[xy(0xdad)](rG + rI) * 0.5),
              (rJ = 0x1 + rJ * 0.5),
              (rF[xy(0xa46)] *= Math[xy(0x3a4)](rI / rH, 0x2)),
              rF[xy(0x5df)](rJ, rJ),
              rI !== rH &&
                ((rF[xy(0xa46)] *= 0.7),
                (rF[xy(0xab2)] = xy(0x78c)),
                (rF[xy(0xc81)] = xy(0xcdd))),
              this[xy(0x978)](rF),
              rF[xy(0xaea)]();
          }
        }
        [uu(0xb36)](rF, rG = 0xbe) {
          const xz = uu;
          rF[xz(0xb1a)](),
            rF[xz(0x540)](),
            rF[xz(0xc4d)](0x0, -0x46 + rG + 0x1e),
            rF[xz(0x91a)](0x1a, -0x46 + rG),
            rF[xz(0x91a)](0xd, -0x46),
            rF[xz(0x91a)](-0xd, -0x46),
            rF[xz(0x91a)](-0x1a, -0x46 + rG),
            rF[xz(0x91a)](0x0, -0x46 + rG + 0x1e),
            rF[xz(0xb63)](),
            rF[xz(0xa90)](),
            rF[xz(0x5b9)](),
            rF[xz(0xaea)](),
            rF[xz(0xb1a)](),
            rF[xz(0x540)](),
            rF[xz(0xc4d)](-0x12, -0x46),
            rF[xz(0x92a)](-0x5, -0x50, -0xa, -0x69),
            rF[xz(0xc0b)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rF[xz(0x92a)](0x5, -0x50, 0x12, -0x46),
            rF[xz(0x92a)](0x0, -0x3c, -0x12, -0x46),
            rF[xz(0x51f)](),
            this[xz(0xdb2)]
              ? ((rF[xz(0xc50)] = this[xz(0x863)](xz(0x5c3))),
                (rF[xz(0xdf1)] = this[xz(0x863)](xz(0xba7))))
              : (rF[xz(0xdf1)] = this[xz(0x863)](xz(0x87d))),
            rF[xz(0xa90)](),
            (rF[xz(0x930)] = 0xa),
            rF[xz(0x5b9)](),
            rF[xz(0xaea)]();
        }
        [uu(0x978)](rF) {
          const xA = uu;
          rF[xA(0xb1a)](), rF[xA(0x540)]();
          for (let rG = 0x0; rG < 0x2; rG++) {
            rF[xA(0xc4d)](0x14, -0x1e),
              rF[xA(0x92a)](0x5a, -0xa, 0x32, -0x32),
              rF[xA(0x91a)](0xa0, -0x32),
              rF[xA(0x92a)](0x8c, 0x3c, 0x14, 0x0),
              rF[xA(0x5df)](-0x1, 0x1);
          }
          rF[xA(0xb63)](),
            rF[xA(0xa90)](),
            rF[xA(0x5b9)](),
            rF[xA(0xaea)](),
            this[xA(0xb36)](rF),
            rF[xA(0xb1a)](),
            rF[xA(0x540)](),
            rF[xA(0x660)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rF[xA(0x91a)](-0x32, 0x1e),
            rF[xA(0x91a)](-0x1e, 0x1e),
            rF[xA(0x91a)](-0x1f, 0x32),
            rF[xA(0x91a)](0x1f, 0x32),
            rF[xA(0x91a)](0x1e, 0x1e),
            rF[xA(0x91a)](0x32, 0x1e),
            rF[xA(0x91a)](0x32, 0x0),
            rF[xA(0xa90)](),
            rF[xA(0xb63)](),
            rF[xA(0x5b9)](),
            rF[xA(0x540)](),
            rF[xA(0x6f0)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rF[xA(0x6f0)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rF[xA(0xc50)] = rF[xA(0xdf1)]),
            rF[xA(0xa90)](),
            rF[xA(0xaea)]();
        }
        [uu(0x575)](rF) {
          const xB = uu;
          rF[xB(0xd57)](this[xB(0x423)] / 0x64), (rF[xB(0xdf1)] = xB(0x702));
          const rG = this[xB(0x863)](xB(0x7a3)),
            rH = this[xB(0x863)](xB(0x6d9));
          (this[xB(0xddb)] += (pP / 0x12c) * (this[xB(0x79e)] ? 0x1 : -0x1)),
            (this[xB(0xddb)] = Math[xB(0xd8d)](
              0x1,
              Math[xB(0x9b2)](0x0, this[xB(0xddb)])
            ));
          const rI = this[xB(0xa28)] ? 0x1 : this[xB(0xddb)],
            rJ = 0x1 - rI;
          rF[xB(0xb1a)](),
            rF[xB(0x540)](),
            rF[xB(0xbd2)](
              (0x30 +
                (Math[xB(0xdad)](this[xB(0x205)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rI +
                (0x1 - rI) * -0x14,
              0x0
            ),
            rF[xB(0x5df)](1.1, 1.1),
            rF[xB(0xc4d)](0x0, -0xa),
            rF[xB(0xc0b)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rF[xB(0xc50)] = rH),
            rF[xB(0xa90)](),
            (rF[xB(0xd4e)] = xB(0xbb6)),
            (rF[xB(0x930)] = 0x1c),
            rF[xB(0xb63)](),
            rF[xB(0x5b9)](),
            rF[xB(0xaea)]();
          for (let rK = 0x0; rK < 0x2; rK++) {
            const rL = Math[xB(0xdad)](this[xB(0x205)] * 0x1);
            rF[xB(0xb1a)]();
            const rM = rK * 0x2 - 0x1;
            rF[xB(0x5df)](0x1, rM),
              rF[xB(0xbd2)](0x32 * rI - rJ * 0xa, 0x50 * rI),
              rF[xB(0x5f9)](rL * 0.2 + 0.3 - rJ * 0x1),
              rF[xB(0x540)](),
              rF[xB(0xc4d)](0xa, -0xa),
              rF[xB(0x92a)](0x1e, 0x28, -0x14, 0x50),
              rF[xB(0x92a)](0xa, 0x1e, -0xf, 0x0),
              (rF[xB(0xdf1)] = rG),
              (rF[xB(0x930)] = 0x2c),
              (rF[xB(0xe13)] = rF[xB(0xd4e)] = xB(0xbb6)),
              rF[xB(0x5b9)](),
              (rF[xB(0x930)] -= 0x1c),
              (rF[xB(0xc50)] = rF[xB(0xdf1)] = rH),
              rF[xB(0xa90)](),
              rF[xB(0x5b9)](),
              rF[xB(0xaea)]();
          }
          for (let rN = 0x0; rN < 0x2; rN++) {
            const rO = Math[xB(0xdad)](this[xB(0x205)] * 0x1 + 0x1);
            rF[xB(0xb1a)]();
            const rP = rN * 0x2 - 0x1;
            rF[xB(0x5df)](0x1, rP),
              rF[xB(0xbd2)](-0x41 * rI, 0x32 * rI),
              rF[xB(0x5f9)](rO * 0.3 + 1.3),
              rF[xB(0x540)](),
              rF[xB(0xc4d)](0xc, -0x5),
              rF[xB(0x92a)](0x28, 0x1e, 0x0, 0x3c),
              rF[xB(0x92a)](0x14, 0x1e, 0x0, 0x0),
              (rF[xB(0xdf1)] = rG),
              (rF[xB(0x930)] = 0x2c),
              (rF[xB(0xe13)] = rF[xB(0xd4e)] = xB(0xbb6)),
              rF[xB(0x5b9)](),
              (rF[xB(0x930)] -= 0x1c),
              (rF[xB(0xc50)] = rF[xB(0xdf1)] = rH),
              rF[xB(0x5b9)](),
              rF[xB(0xa90)](),
              rF[xB(0xaea)]();
          }
          this[xB(0x721)](rF);
        }
        [uu(0x721)](rF, rG = 0x1) {
          const xC = uu;
          rF[xC(0x540)](),
            rF[xC(0x660)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rF[xC(0xdf1)] = xC(0x702)),
            (rF[xC(0xc50)] = this[xC(0x863)](xC(0x4b4))),
            rF[xC(0xa90)](),
            (rF[xC(0x930)] = 0x1e * rG),
            rF[xC(0xb1a)](),
            rF[xC(0xb63)](),
            rF[xC(0x5b9)](),
            rF[xC(0xaea)](),
            rF[xC(0xb1a)](),
            rF[xC(0x540)](),
            rF[xC(0x660)](
              0x0,
              0x0,
              0x64 - rF[xC(0x930)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rF[xC(0xb63)](),
            rF[xC(0x540)]();
          for (let rH = 0x0; rH < 0x6; rH++) {
            const rI = (rH / 0x6) * Math["PI"] * 0x2;
            rF[xC(0x91a)](
              Math[xC(0x85f)](rI) * 0x28,
              Math[xC(0xdad)](rI) * 0x28
            );
          }
          rF[xC(0x51f)]();
          for (let rJ = 0x0; rJ < 0x6; rJ++) {
            const rK = (rJ / 0x6) * Math["PI"] * 0x2,
              rL = Math[xC(0x85f)](rK) * 0x28,
              rM = Math[xC(0xdad)](rK) * 0x28;
            rF[xC(0xc4d)](rL, rM), rF[xC(0x91a)](rL * 0x3, rM * 0x3);
          }
          (rF[xC(0x930)] = 0x10 * rG),
            (rF[xC(0xe13)] = rF[xC(0xd4e)] = xC(0xbb6)),
            rF[xC(0x5b9)](),
            rF[xC(0xaea)]();
        }
        [uu(0xadc)](rF) {
          const xD = uu;
          rF[xD(0xd57)](this[xD(0x423)] / 0x82);
          let rG, rH;
          const rI = 0x2d,
            rJ = lo(
              this[xD(0xad5)] ||
                (this[xD(0xad5)] = this[xD(0xa28)]
                  ? 0x28
                  : Math[xD(0x66d)]() * 0x3e8)
            );
          let rK = rJ() * 6.28;
          const rL = Date[xD(0x5b6)]() / 0xc8,
            rM = [xD(0xa2a), xD(0xd85)][xD(0x91f)]((rN) => this[xD(0x863)](rN));
          for (let rN = 0x0; rN <= rI; rN++) {
            (rN % 0x5 === 0x0 || rN === rI) &&
              (rN > 0x0 &&
                ((rF[xD(0x930)] = 0x19),
                (rF[xD(0xd4e)] = rF[xD(0xe13)] = xD(0xbb6)),
                (rF[xD(0xdf1)] = rM[0x1]),
                rF[xD(0x5b9)](),
                (rF[xD(0x930)] = 0xc),
                (rF[xD(0xdf1)] = rM[0x0]),
                rF[xD(0x5b9)]()),
              rN !== rI && (rF[xD(0x540)](), rF[xD(0xc4d)](rG, rH)));
            let rO = rN / 0x32;
            (rO *= rO), (rK += (0.3 + rJ() * 0.8) * 0x3);
            const rP = 0x14 + Math[xD(0xdad)](rO * 3.14) * 0x6e,
              rQ = Math[xD(0xdad)](rN + rL) * 0.5,
              rR = Math[xD(0x85f)](rK + rQ) * rP,
              rS = Math[xD(0xdad)](rK + rQ) * rP,
              rT = rR - rG,
              rU = rS - rH;
            rF[xD(0x92a)]((rG + rR) / 0x2 + rU, (rH + rS) / 0x2 - rT, rR, rS),
              (rG = rR),
              (rH = rS);
          }
        }
        [uu(0x422)](rF) {
          const xE = uu;
          rF[xE(0xd57)](this[xE(0x423)] / 0x6e),
            (rF[xE(0xdf1)] = xE(0x702)),
            (rF[xE(0x930)] = 0x1c),
            rF[xE(0x540)](),
            rF[xE(0x660)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rF[xE(0xc50)] = this[xE(0x863)](xE(0xa29))),
            rF[xE(0xa90)](),
            rF[xE(0xb1a)](),
            rF[xE(0xb63)](),
            rF[xE(0x5b9)](),
            rF[xE(0xaea)](),
            rF[xE(0x540)](),
            rF[xE(0x660)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rF[xE(0xc50)] = xE(0xbc5)),
            rF[xE(0xa90)](),
            rF[xE(0xb1a)](),
            rF[xE(0xb63)](),
            rF[xE(0x5b9)](),
            rF[xE(0xaea)]();
          const rG = lo(
              this[xE(0xc54)] ||
                (this[xE(0xc54)] = this[xE(0xa28)]
                  ? 0x1e
                  : Math[xE(0x66d)]() * 0x3e8)
            ),
            rH = this[xE(0x863)](xE(0x188)),
            rI = this[xE(0x863)](xE(0xe34));
          for (let rL = 0x0; rL < 0x3; rL++) {
            rF[xE(0x540)]();
            const rM = 0xc;
            for (let rN = 0x0; rN < rM; rN++) {
              const rO = (Math["PI"] * 0x2 * rN) / rM;
              rF[xE(0xb1a)](),
                rF[xE(0x5f9)](rO + rG() * 0.4),
                rF[xE(0xbd2)](0x3c + rG() * 0xa, 0x0),
                rF[xE(0xc4d)](rG() * 0x5, rG() * 0x5),
                rF[xE(0xc0b)](
                  0x14 + rG() * 0xa,
                  rG() * 0x14,
                  0x28 + rG() * 0x14,
                  rG() * 0x1e + 0xa,
                  0x3c + rG() * 0xa,
                  rG() * 0xa + 0xa
                ),
                rF[xE(0xaea)]();
            }
            (rF[xE(0xe13)] = rF[xE(0xd4e)] = xE(0xbb6)),
              (rF[xE(0x930)] = 0x12 - rL * 0x2),
              (rF[xE(0xdf1)] = rH),
              rF[xE(0x5b9)](),
              (rF[xE(0x930)] -= 0x8),
              (rF[xE(0xdf1)] = rI),
              rF[xE(0x5b9)]();
          }
          const rJ = 0x28;
          rF[xE(0x5f9)](-this[xE(0x6b8)]),
            (rF[xE(0xc50)] = this[xE(0x863)](xE(0x100))),
            (rF[xE(0xdf1)] = this[xE(0x863)](xE(0xadd))),
            (rF[xE(0x930)] = 0x9);
          const rK = this[xE(0x9d4)] * 0x6;
          for (let rP = 0x0; rP < rK; rP++) {
            const rQ = ((rP - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rF[xE(0x540)](),
              rF[xE(0x6f0)](
                Math[xE(0x85f)](rQ) * rJ,
                Math[xE(0xdad)](rQ) * rJ * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rF[xE(0xa90)](),
              rF[xE(0x5b9)]();
          }
        }
        [uu(0xd46)](rF) {
          const xF = uu;
          rF[xF(0x5f9)](-this[xF(0x6b8)]),
            rF[xF(0xd57)](this[xF(0x423)] / 0x3c),
            (rF[xF(0xe13)] = rF[xF(0xd4e)] = xF(0xbb6));
          let rG =
            Math[xF(0xdad)](Date[xF(0x5b6)]() / 0x12c + this[xF(0x205)] * 0.5) *
              0.5 +
            0.5;
          (rG *= 1.5),
            rF[xF(0x540)](),
            rF[xF(0xc4d)](-0x32, -0x32 - rG * 0x3),
            rF[xF(0x92a)](0x0, -0x3c, 0x32, -0x32 - rG * 0x3),
            rF[xF(0x92a)](0x50 - rG * 0x3, -0xa, 0x50, 0x32),
            rF[xF(0x92a)](0x46, 0x4b, 0x28, 0x4e + rG * 0x5),
            rF[xF(0x91a)](0x1e, 0x3c + rG * 0x5),
            rF[xF(0x92a)](0x2d, 0x37, 0x32, 0x2d),
            rF[xF(0x92a)](0x0, 0x41, -0x32, 0x32),
            rF[xF(0x92a)](-0x2d, 0x37, -0x1e, 0x3c + rG * 0x3),
            rF[xF(0x91a)](-0x28, 0x4e + rG * 0x5),
            rF[xF(0x92a)](-0x46, 0x4b, -0x50, 0x32),
            rF[xF(0x92a)](-0x50 + rG * 0x3, -0xa, -0x32, -0x32 - rG * 0x3),
            (rF[xF(0xc50)] = this[xF(0x863)](xF(0x3d8))),
            rF[xF(0xa90)](),
            (rF[xF(0xdf1)] = xF(0x702)),
            rF[xF(0xb1a)](),
            rF[xF(0xb63)](),
            (rF[xF(0x930)] = 0xe),
            rF[xF(0x5b9)](),
            rF[xF(0xaea)]();
          for (let rH = 0x0; rH < 0x2; rH++) {
            rF[xF(0xb1a)](),
              rF[xF(0x5df)](rH * 0x2 - 0x1, 0x1),
              rF[xF(0xbd2)](-0x22, -0x18 - rG * 0x3),
              rF[xF(0x5f9)](-0.6),
              rF[xF(0x5df)](1.3, 1.3),
              rF[xF(0x540)](),
              rF[xF(0xc4d)](-0x14, 0x0),
              rF[xF(0x92a)](-0x14, -0x19, 0x0, -0x28),
              rF[xF(0x92a)](0x14, -0x19, 0x14, 0x0),
              rF[xF(0xa90)](),
              rF[xF(0xb63)](),
              (rF[xF(0x930)] = 0xd),
              rF[xF(0x5b9)](),
              rF[xF(0xaea)]();
          }
          rF[xF(0xb1a)](),
            rF[xF(0x540)](),
            rF[xF(0x6f0)](
              0x0,
              0x1e,
              0x24 - rG * 0x2,
              0x8 - rG,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rF[xF(0xc50)] = this[xF(0x863)](xF(0x972))),
            (rF[xF(0xa46)] *= 0.2),
            rF[xF(0xa90)](),
            rF[xF(0xaea)](),
            (rF[xF(0xc50)] = rF[xF(0xdf1)] = this[xF(0x863)](xF(0x1cc)));
          for (let rI = 0x0; rI < 0x2; rI++) {
            rF[xF(0xb1a)](),
              rF[xF(0x5df)](rI * 0x2 - 0x1, 0x1),
              rF[xF(0xbd2)](0x19 - rG * 0x1, 0xf - rG * 0x3),
              rF[xF(0x5f9)](-0.3),
              rF[xF(0x540)](),
              rF[xF(0x660)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rF[xF(0xa90)](),
              rF[xF(0xaea)]();
          }
          rF[xF(0xb1a)](),
            (rF[xF(0x930)] = 0x5),
            rF[xF(0xbd2)](0x0, 0x21 - rG * 0x1),
            rF[xF(0x540)](),
            rF[xF(0xc4d)](-0xc, 0x0),
            rF[xF(0xc0b)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rF[xF(0xc0b)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rF[xF(0x5b9)](),
            rF[xF(0xaea)]();
        }
        [uu(0x81d)](rF) {
          const xG = uu;
          rF[xG(0xd57)](this[xG(0x423)] / 0x3c),
            rF[xG(0x5f9)](-Math["PI"] / 0x2),
            rF[xG(0x540)](),
            rF[xG(0xc4d)](0x32, 0x50),
            rF[xG(0x92a)](0x1e, 0x1e, 0x32, -0x14),
            rF[xG(0x92a)](0x5a, -0x64, 0x0, -0x64),
            rF[xG(0x92a)](-0x5a, -0x64, -0x32, -0x14),
            rF[xG(0x92a)](-0x1e, 0x1e, -0x32, 0x50),
            (rF[xG(0xc50)] = this[xG(0x863)](xG(0x579))),
            rF[xG(0xa90)](),
            (rF[xG(0xd4e)] = rF[xG(0xe13)] = xG(0xbb6)),
            (rF[xG(0x930)] = 0x14),
            rF[xG(0xb63)](),
            (rF[xG(0xdf1)] = xG(0x702)),
            rF[xG(0x5b9)](),
            (rF[xG(0xc50)] = this[xG(0x863)](xG(0xb2a)));
          const rG = 0x6;
          rF[xG(0x540)](), rF[xG(0xc4d)](-0x32, 0x50);
          for (let rH = 0x0; rH < rG; rH++) {
            const rI = (((rH + 0.5) / rG) * 0x2 - 0x1) * 0x32,
              rJ = (((rH + 0x1) / rG) * 0x2 - 0x1) * 0x32;
            rF[xG(0x92a)](rI, 0x1e, rJ, 0x50);
          }
          (rF[xG(0x930)] = 0x8),
            rF[xG(0xa90)](),
            rF[xG(0x5b9)](),
            (rF[xG(0xdf1)] = rF[xG(0xc50)] = xG(0x702)),
            rF[xG(0xb1a)](),
            rF[xG(0xbd2)](0x0, -0x5),
            rF[xG(0x540)](),
            rF[xG(0xc4d)](0x0, 0x0),
            rF[xG(0xc0b)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rF[xG(0x5b9)](),
            rF[xG(0xaea)]();
          for (let rK = 0x0; rK < 0x2; rK++) {
            rF[xG(0xb1a)](),
              rF[xG(0x5df)](rK * 0x2 - 0x1, 0x1),
              rF[xG(0xbd2)](0x19, -0x38),
              rF[xG(0x540)](),
              rF[xG(0x660)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rF[xG(0xb63)](),
              (rF[xG(0x930)] = 0xf),
              rF[xG(0x5b9)](),
              rF[xG(0xa90)](),
              rF[xG(0xaea)]();
          }
        }
        [uu(0xdac)](rF) {
          const xH = uu;
          rF[xH(0xd57)](this[xH(0x423)] / 0x32),
            (rF[xH(0xdf1)] = xH(0x702)),
            (rF[xH(0x930)] = 0x10);
          const rG = 0x7;
          rF[xH(0x540)]();
          const rH = 0x12;
          rF[xH(0xc50)] = this[xH(0x863)](xH(0xe11));
          const rI = Math[xH(0xdad)](pO / 0x258);
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            const rK = 1.2 - rJ * 0.2;
            for (let rL = 0x0; rL < rG; rL++) {
              rF[xH(0xb1a)](),
                rF[xH(0x5f9)](
                  (rL / rG) * Math["PI"] * 0x2 + (rJ / rG) * Math["PI"]
                ),
                rF[xH(0xbd2)](0x2e, 0x0),
                rF[xH(0x5df)](rK, rK);
              const rM = Math[xH(0xdad)](rI + rL * 0.05 * (0x1 - rJ * 0.5));
              rF[xH(0x540)](),
                rF[xH(0xc4d)](0x0, rH),
                rF[xH(0x92a)](0x14, rH, 0x28 + rM, 0x0 + rM * 0x5),
                rF[xH(0x92a)](0x14, -rH, 0x0, -rH),
                rF[xH(0xa90)](),
                rF[xH(0xb63)](),
                rF[xH(0x5b9)](),
                rF[xH(0xaea)]();
            }
          }
          rF[xH(0x540)](),
            rF[xH(0x660)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rF[xH(0xc50)] = this[xH(0x863)](xH(0x49a))),
            rF[xH(0xa90)](),
            rF[xH(0xb63)](),
            (rF[xH(0x930)] = 0x19),
            rF[xH(0x5b9)]();
        }
        [uu(0xd79)](rF) {
          const xI = uu;
          rF[xI(0xd57)](this[xI(0x423)] / 0x28);
          let rG = this[xI(0x205)];
          const rH = this[xI(0xa28)] ? 0x0 : Math[xI(0xdad)](pO / 0x64) * 0xf;
          (rF[xI(0xe13)] = rF[xI(0xd4e)] = xI(0xbb6)),
            rF[xI(0x540)](),
            rF[xI(0xb1a)]();
          const rI = 0x3;
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            const rK = rJ === 0x0 ? 0x1 : -0x1;
            for (let rL = 0x0; rL <= rI; rL++) {
              rF[xI(0xb1a)](), rF[xI(0xc4d)](0x0, 0x0);
              const rM = Math[xI(0xdad)](rG + rL + rJ);
              rF[xI(0x5f9)](((rL / rI) * 0x2 - 0x1) * 0.6 + 1.4 + rM * 0.15),
                rF[xI(0x91a)](0x2d + rK * rH, 0x0),
                rF[xI(0x5f9)](0.2 + (rM * 0.5 + 0.5) * 0.1),
                rF[xI(0x91a)](0x4b, 0x0),
                rF[xI(0xaea)]();
            }
            rF[xI(0x5df)](0x1, -0x1);
          }
          rF[xI(0xaea)](),
            (rF[xI(0x930)] = 0x8),
            (rF[xI(0xdf1)] = this[xI(0x863)](xI(0x3ae))),
            rF[xI(0x5b9)](),
            rF[xI(0xb1a)](),
            rF[xI(0xbd2)](0x0, rH),
            this[xI(0xd97)](rF),
            rF[xI(0xaea)]();
        }
        [uu(0xd97)](rF, rG = ![]) {
          const xJ = uu;
          (rF[xJ(0xe13)] = rF[xJ(0xd4e)] = xJ(0xbb6)),
            rF[xJ(0x5f9)](-0.15),
            rF[xJ(0x540)](),
            rF[xJ(0xc4d)](-0x32, 0x0),
            rF[xJ(0x91a)](0x28, 0x0),
            rF[xJ(0xc4d)](0xf, 0x0),
            rF[xJ(0x91a)](-0x5, 0x19),
            rF[xJ(0xc4d)](-0x3, 0x0),
            rF[xJ(0x91a)](0xc, -0x14),
            rF[xJ(0xc4d)](-0xe, -0x5),
            rF[xJ(0x91a)](-0x2e, -0x17),
            (rF[xJ(0x930)] = 0x1c),
            (rF[xJ(0xdf1)] = this[xJ(0x863)](xJ(0xd4c))),
            rF[xJ(0x5b9)](),
            (rF[xJ(0xdf1)] = this[xJ(0x863)](xJ(0xce4))),
            (rF[xJ(0x930)] -= rG ? 0xf : 0xa),
            rF[xJ(0x5b9)]();
        }
        [uu(0x9a8)](rF) {
          const xK = uu;
          rF[xK(0xd57)](this[xK(0x423)] / 0x64),
            rF[xK(0x540)](),
            rF[xK(0x660)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rF[xK(0xc50)] = this[xK(0x863)](xK(0xb91))),
            rF[xK(0xa90)](),
            rF[xK(0xb63)](),
            (rF[xK(0x930)] = this[xK(0xdb2)] ? 0x32 : 0x1e),
            (rF[xK(0xdf1)] = xK(0x702)),
            rF[xK(0x5b9)]();
          if (!this[xK(0xdd7)]) {
            const rG = new Path2D(),
              rH = this[xK(0xdb2)] ? 0x2 : 0x3;
            for (let rI = 0x0; rI <= rH; rI++) {
              for (let rJ = 0x0; rJ <= rH; rJ++) {
                const rK =
                    ((rJ / rH + Math[xK(0x66d)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rI % 0x2 === 0x0 ? -0x14 : 0x0),
                  rL = ((rI / rH + Math[xK(0x66d)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rM = Math[xK(0x66d)]() * 0xd + (this[xK(0xdb2)] ? 0xe : 0x7);
                rG[xK(0xc4d)](rK, rL),
                  rG[xK(0x660)](rK, rL, rM, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xK(0xdd7)] = rG;
          }
          rF[xK(0x540)](),
            rF[xK(0x660)](
              0x0,
              0x0,
              0x64 - rF[xK(0x930)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rF[xK(0xb63)](),
            (rF[xK(0xc50)] = xK(0x1ee)),
            rF[xK(0xa90)](this[xK(0xdd7)]);
        }
        [uu(0x693)](rF) {
          const xL = uu;
          rF[xL(0xd57)](this[xL(0x423)] / 0x64),
            rF[xL(0xb1a)](),
            rF[xL(0xbd2)](-0xf5, -0xdc),
            (rF[xL(0xdf1)] = this[xL(0x863)](xL(0x907))),
            (rF[xL(0xc50)] = this[xL(0x863)](xL(0x213))),
            (rF[xL(0x930)] = 0xf),
            (rF[xL(0xd4e)] = rF[xL(0xe13)] = xL(0xbb6));
          const rG = !this[xL(0xdb2)];
          if (rG) {
            rF[xL(0xb1a)](),
              rF[xL(0xbd2)](0x10e, 0xde),
              rF[xL(0xb1a)](),
              rF[xL(0x5f9)](-0.1);
            for (let rH = 0x0; rH < 0x3; rH++) {
              rF[xL(0x540)](),
                rF[xL(0xc4d)](-0x5, 0x0),
                rF[xL(0x92a)](0x0, 0x28, 0x5, 0x0),
                rF[xL(0x5b9)](),
                rF[xL(0xa90)](),
                rF[xL(0xbd2)](0x28, 0x0);
            }
            rF[xL(0xaea)](), rF[xL(0xbd2)](0x17, 0x32), rF[xL(0x5f9)](0.05);
            for (let rI = 0x0; rI < 0x2; rI++) {
              rF[xL(0x540)](),
                rF[xL(0xc4d)](-0x5, 0x0),
                rF[xL(0x92a)](0x0, -0x28, 0x5, 0x0),
                rF[xL(0x5b9)](),
                rF[xL(0xa90)](),
                rF[xL(0xbd2)](0x28, 0x0);
            }
            rF[xL(0xaea)]();
          }
          rF[xL(0xa90)](ll),
            rF[xL(0x5b9)](ll),
            rF[xL(0xa90)](lm),
            rF[xL(0x5b9)](lm),
            rF[xL(0xaea)](),
            rG &&
              (rF[xL(0x540)](),
              rF[xL(0x660)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rF[xL(0x660)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rF[xL(0xc50)] = xL(0x702)),
              rF[xL(0xa90)]());
        }
        [uu(0x564)](rF) {
          const xM = uu;
          rF[xM(0xd57)](this[xM(0x423)] / 0x46), rF[xM(0xb1a)]();
          !this[xM(0xdb2)] && rF[xM(0x5f9)](Math["PI"] / 0x2);
          rF[xM(0xbd2)](0x0, 0x2d),
            rF[xM(0x540)](),
            rF[xM(0xc4d)](0x0, -0x64),
            rF[xM(0xc0b)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rF[xM(0xc0b)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rF[xM(0xe13)] = rF[xM(0xd4e)] = xM(0xbb6)),
            (rF[xM(0x930)] = 0x3c),
            (rF[xM(0xdf1)] = this[xM(0x863)](xM(0x68b))),
            rF[xM(0x5b9)](),
            (rF[xM(0x930)] -= this[xM(0xdb2)] ? 0x23 : 0x14),
            (rF[xM(0xc50)] = rF[xM(0xdf1)] = this[xM(0x863)](xM(0x7f0))),
            rF[xM(0x5b9)](),
            (rF[xM(0x930)] -= this[xM(0xdb2)] ? 0x16 : 0xf),
            (rF[xM(0xc50)] = rF[xM(0xdf1)] = this[xM(0x863)](xM(0x8c0))),
            rF[xM(0x5b9)](),
            rF[xM(0xa90)](),
            rF[xM(0xbd2)](0x0, -0x24);
          if (this[xM(0xdb2)]) rF[xM(0xd57)](0.9);
          rF[xM(0x540)](),
            rF[xM(0x6f0)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rF[xM(0xc50)] = this[xM(0x863)](xM(0xe53))),
            rF[xM(0xa90)](),
            rF[xM(0xb63)](),
            (rF[xM(0x930)] = 0xd),
            (rF[xM(0xdf1)] = xM(0x702)),
            rF[xM(0x5b9)](),
            rF[xM(0x540)](),
            rF[xM(0x6f0)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rF[xM(0xc50)] = xM(0x485)),
            rF[xM(0xa90)](),
            rF[xM(0xaea)]();
        }
        [uu(0x1d6)](rF) {
          const xN = uu;
          rF[xN(0xd57)](this[xN(0x423)] / 0x19);
          !this[xN(0xa28)] &&
            this[xN(0xdb2)] &&
            rF[xN(0x5f9)](Math[xN(0xdad)](pO / 0x64 + this["id"]) * 0.15);
          rF[xN(0x540)](),
            rF[xN(0x7ec)](-0x16, -0x16, 0x2c, 0x2c),
            (rF[xN(0xc50)] = this[xN(0x863)](xN(0xe49))),
            rF[xN(0xa90)](),
            (rF[xN(0x930)] = 0x6),
            (rF[xN(0xd4e)] = xN(0xbb6)),
            (rF[xN(0xdf1)] = this[xN(0x863)](xN(0x213))),
            rF[xN(0x5b9)](),
            rF[xN(0x540)]();
          const rG = this[xN(0xa28)] ? 0x1 : 0x1 - Math[xN(0xdad)](pO / 0x1f4),
            rH = rL(0x0, 0.25),
            rI = 0x1 - rL(0.25, 0.25),
            rJ = rL(0.5, 0.25),
            rK = rL(0.75, 0.25);
          function rL(rM, rN) {
            const xO = xN;
            return Math[xO(0xd8d)](0x1, Math[xO(0x9b2)](0x0, (rG - rM) / rN));
          }
          rF[xN(0x5f9)]((rI * Math["PI"]) / 0x4);
          for (let rM = 0x0; rM < 0x2; rM++) {
            const rN = (rM * 0x2 - 0x1) * 0x7 * rK;
            for (let rO = 0x0; rO < 0x3; rO++) {
              let rP = rH * (-0xb + rO * 0xb);
              rF[xN(0xc4d)](rP, rN),
                rF[xN(0x660)](rP, rN, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rF[xN(0xc50)] = this[xN(0x863)](xN(0x319))), rF[xN(0xa90)]();
        }
        [uu(0xd6f)](rF) {
          const xP = uu;
          rF[xP(0xb1a)](),
            rF[xP(0xbd2)](this["x"], this["y"]),
            this[xP(0xc5d)](rF),
            rF[xP(0x5f9)](this[xP(0x6b8)]),
            (rF[xP(0x930)] = 0x8);
          const rG = (rL, rM) => {
              const xQ = xP;
              (rI = this[xQ(0x423)] / 0x14),
                rF[xQ(0x5df)](rI, rI),
                rF[xQ(0x540)](),
                rF[xQ(0x660)](0x0, 0x0, 0x14, 0x0, kZ),
                (rF[xQ(0xc50)] = this[xQ(0x863)](rL)),
                rF[xQ(0xa90)](),
                (rF[xQ(0xdf1)] = this[xQ(0x863)](rM)),
                rF[xQ(0x5b9)]();
            },
            rH = (rL, rM, rN) => {
              const xR = xP;
              (rL = l7[rL]),
                rF[xR(0x5df)](this[xR(0x423)], this[xR(0x423)]),
                (rF[xR(0x930)] /= this[xR(0x423)]),
                (rF[xR(0xdf1)] = this[xR(0x863)](rN)),
                rF[xR(0x5b9)](rL),
                (rF[xR(0xc50)] = this[xR(0x863)](rM)),
                rF[xR(0xa90)](rL);
            };
          let rI, rJ, rK;
          switch (this[xP(0x909)]) {
            case cR[xP(0x1d6)]:
            case cR[xP(0xdb6)]:
              this[xP(0x1d6)](rF);
              break;
            case cR[xP(0x564)]:
            case cR[xP(0x2e0)]:
              this[xP(0x564)](rF);
              break;
            case cR[xP(0xe07)]:
              (rF[xP(0xdf1)] = xP(0x702)),
                (rF[xP(0x930)] = 0x14),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0xbae))),
                rF[xP(0xbd2)](-this[xP(0x423)], 0x0),
                rF[xP(0x5f9)](-Math["PI"] / 0x2),
                rF[xP(0xd57)](0.5),
                rF[xP(0xbd2)](0x0, 0x46),
                this[xP(0xb36)](rF, this[xP(0x423)] * 0x4);
              break;
            case cR[xP(0x34e)]:
              this[xP(0x34e)](rF);
              break;
            case cR[xP(0x6d1)]:
              this[xP(0x693)](rF);
              break;
            case cR[xP(0x693)]:
              this[xP(0x693)](rF);
              break;
            case cR[xP(0x9a8)]:
            case cR[xP(0x453)]:
              this[xP(0x9a8)](rF);
              break;
            case cR[xP(0x51d)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x1e), this[xP(0xd97)](rF, !![]);
              break;
            case cR[xP(0xd79)]:
              this[xP(0xd79)](rF);
              break;
            case cR[xP(0x13e)]:
              (rF[xP(0x930)] *= 0.7),
                rH(xP(0x7dc), xP(0xe11), xP(0x234)),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0.6, 0x0, kZ),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x49a))),
                rF[xP(0xa90)](),
                rF[xP(0xb63)](),
                (rF[xP(0xdf1)] = xP(0x84c)),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0xdac)]:
              this[xP(0xdac)](rF);
              break;
            case cR[xP(0x724)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x16),
                rF[xP(0x5f9)](Math["PI"] / 0x2),
                rF[xP(0x540)]();
              for (let sx = 0x0; sx < 0x2; sx++) {
                rF[xP(0xc4d)](-0xa, -0x1e),
                  rF[xP(0xc0b)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rF[xP(0x5df)](0x1, -0x1);
              }
              (rF[xP(0x930)] = 0x10),
                (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x692))),
                rF[xP(0x5b9)](),
                (rF[xP(0x930)] -= 0x7),
                (rF[xP(0xdf1)] = xP(0xa04)),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x39b)]:
              this[xP(0x81d)](rF);
              break;
            case cR[xP(0xd0b)]:
              this[xP(0xd46)](rF);
              break;
            case cR[xP(0x422)]:
              this[xP(0x422)](rF);
              break;
            case cR[xP(0xadc)]:
              this[xP(0xadc)](rF);
              break;
            case cR[xP(0x1dd)]:
              !this[xP(0x49f)] &&
                ((this[xP(0x49f)] = new lS(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cX[xP(0x4a1)],
                  0x19
                )),
                (this[xP(0x49f)][xP(0xda1)] = !![]),
                (this[xP(0x49f)][xP(0x7a5)] = !![]),
                (this[xP(0x49f)][xP(0xa8d)] = 0x1),
                (this[xP(0x49f)][xP(0xe14)] = !![]),
                (this[xP(0x49f)][xP(0xbfe)] = xP(0xcfd)),
                (this[xP(0x49f)][xP(0x959)] = this[xP(0x959)]));
              rF[xP(0x5f9)](Math["PI"] / 0x2),
                (this[xP(0x49f)][xP(0x61f)] = this[xP(0x61f)]),
                (this[xP(0x49f)][xP(0x423)] = this[xP(0x423)]),
                this[xP(0x49f)][xP(0xd6f)](rF);
              break;
            case cR[xP(0x575)]:
              this[xP(0x575)](rF);
              break;
            case cR[xP(0xe3b)]:
              rF[xP(0xb1a)](),
                rF[xP(0xd57)](this[xP(0x423)] / 0x64),
                rF[xP(0x5f9)]((Date[xP(0x5b6)]() / 0x190) % 6.28),
                this[xP(0x721)](rF, 1.5),
                rF[xP(0xaea)]();
              break;
            case cR[xP(0xadf)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x14),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x0, -0x5),
                rF[xP(0x91a)](-0x8, 0x0),
                rF[xP(0x91a)](0x0, 0x5),
                rF[xP(0x91a)](0x8, 0x0),
                rF[xP(0x51f)](),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x20),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x46f))),
                rF[xP(0x5b9)](),
                (rF[xP(0x930)] = 0x14),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x942))),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0xc05)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x14),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x5, -0x5),
                rF[xP(0x91a)](-0x5, 0x5),
                rF[xP(0x91a)](0x5, 0x0),
                rF[xP(0x51f)](),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x20),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x78e))),
                rF[xP(0x5b9)](),
                (rF[xP(0x930)] = 0x14),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x354))),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x625)]:
              this[xP(0xdc0)](rF, xP(0x782));
              break;
            case cR[xP(0x5ff)]:
              this[xP(0xdc0)](rF, xP(0x301));
              break;
            case cR[xP(0xa25)]:
              this[xP(0xdc0)](rF, xP(0x4a8));
              break;
            case cR[xP(0x587)]:
              this[xP(0x587)](rF);
              break;
            case cR[xP(0x603)]:
              this[xP(0x603)](rF);
              break;
            case cR[xP(0x429)]:
              this[xP(0x429)](rF);
              break;
            case cR[xP(0xe4d)]:
              this[xP(0x429)](rF, !![]);
              break;
            case cR[xP(0xdc4)]:
              this[xP(0xdc4)](rF);
              break;
            case cR[xP(0x520)]:
              this[xP(0x520)](rF);
              break;
            case cR[xP(0xca5)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x19),
                lD(rF, 0x19),
                (rF[xP(0xd4e)] = xP(0xbb6)),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x82a))),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x848))),
                rF[xP(0xa90)](),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x88a)]:
              rF[xP(0xbd2)](-this[xP(0x423)], 0x0);
              const rL = Date[xP(0x5b6)]() / 0x32,
                rM = this[xP(0x423)] * 0x2;
              rF[xP(0x540)]();
              const rN = 0x32;
              for (let sy = 0x0; sy < rN; sy++) {
                const sz = sy / rN,
                  sA = sz * Math["PI"] * (this[xP(0xa28)] ? 7.75 : 0xa) - rL,
                  sB = sz * rM,
                  sC = sB * this[xP(0x44c)];
                rF[xP(0x91a)](sB, Math[xP(0xdad)](sA) * sC);
              }
              (rF[xP(0xdf1)] = xP(0xd1d)),
                (rF[xP(0xd4e)] = rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x4),
                (rF[xP(0xb20)] = xP(0x3d0)),
                (rF[xP(0x3f7)] = this[xP(0xa28)] ? 0xa : 0x14),
                rF[xP(0x5b9)](),
                rF[xP(0x5b9)](),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x461)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x37), this[xP(0x36b)](rF);
              break;
            case cR[xP(0x86d)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x14), rF[xP(0x540)]();
              for (let sD = 0x0; sD < 0x2; sD++) {
                rF[xP(0xc4d)](-0x17, -0x5),
                  rF[xP(0x92a)](0x0, 5.5, 0x17, -0x5),
                  rF[xP(0x5df)](0x1, -0x1);
              }
              (rF[xP(0x930)] = 0xf),
                (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x213))),
                rF[xP(0x5b9)](),
                (rF[xP(0x930)] -= 0x6),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0xe49))),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x913)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x23),
                rF[xP(0x540)](),
                rF[xP(0x6f0)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x2da))),
                rF[xP(0xa90)](),
                rF[xP(0xb63)](),
                (rF[xP(0xdf1)] = xP(0xbc5)),
                (rF[xP(0x930)] = 0x12),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x1e, 0x0),
                rF[xP(0xc0b)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rF[xP(0xc0b)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rF[xP(0x930)] = 0x3),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                (rF[xP(0xdf1)] = rF[xP(0xc50)] = xP(0x27a)),
                rF[xP(0xa90)](),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0xe32)]:
              if (this[xP(0x43e)] !== this[xP(0x33e)]) {
                this[xP(0x43e)] = this[xP(0x33e)];
                const sE = new Path2D(),
                  sF = Math[xP(0xbb6)](
                    this[xP(0x33e)] * (this[xP(0x33e)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sG = (Math["PI"] * 0x2) / sF,
                  sH = this[xP(0x33e)] < 0x64 ? 0.3 : 0.1;
                for (let sI = 0x0; sI < sF; sI++) {
                  const sJ = sI * sG,
                    sK = sJ + Math[xP(0x66d)]() * sG,
                    sL = 0x1 - Math[xP(0x66d)]() * sH;
                  sE[xP(0x91a)](
                    Math[xP(0x85f)](sK) * this[xP(0x33e)] * sL,
                    Math[xP(0xdad)](sK) * this[xP(0x33e)] * sL
                  );
                }
                sE[xP(0x51f)](), (this[xP(0x635)] = sE);
              }
              (rI = this[xP(0x423)] / this[xP(0x33e)]), rF[xP(0x5df)](rI, rI);
              const rO = this[xP(0x1f5)] ? lg : [xP(0x9a5), xP(0x647)];
              (rF[xP(0xdf1)] = this[xP(0x863)](rO[0x1])),
                rF[xP(0x5b9)](this[xP(0x635)]),
                (rF[xP(0xc50)] = this[xP(0x863)](rO[0x0])),
                rF[xP(0xa90)](this[xP(0x635)]);
              break;
            case cR[xP(0x9c6)]:
              if (this[xP(0x43e)] !== this[xP(0x33e)]) {
                this[xP(0x43e)] = this[xP(0x33e)];
                const sM = Math[xP(0xbb6)](
                    this[xP(0x33e)] > 0xc8
                      ? this[xP(0x33e)] * 0.18
                      : this[xP(0x33e)] * 0.25
                  ),
                  sN = 0.5,
                  sO = 0.85;
                this[xP(0x635)] = l9(sM, this[xP(0x33e)], sN, sO);
                if (this[xP(0x33e)] < 0x12c) {
                  const sP = new Path2D(),
                    sQ = sM * 0x2;
                  for (let sR = 0x0; sR < sQ; sR++) {
                    const sS = ((sR + 0x1) / sQ) * Math["PI"] * 0x2;
                    let sT = (sR % 0x2 === 0x0 ? 0.7 : 1.2) * this[xP(0x33e)];
                    sP[xP(0x91a)](
                      Math[xP(0x85f)](sS) * sT,
                      Math[xP(0xdad)](sS) * sT
                    );
                  }
                  sP[xP(0x51f)](), (this[xP(0x6fb)] = sP);
                } else this[xP(0x6fb)] = null;
              }
              (rI = this[xP(0x423)] / this[xP(0x33e)]), rF[xP(0x5df)](rI, rI);
              this[xP(0x6fb)] &&
                ((rF[xP(0xc50)] = this[xP(0x863)](xP(0x874))),
                rF[xP(0xa90)](this[xP(0x6fb)]));
              (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x723))),
                rF[xP(0x5b9)](this[xP(0x635)]),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x734))),
                rF[xP(0xa90)](this[xP(0x635)]);
              break;
            case cR[xP(0x394)]:
              rF[xP(0xb1a)](),
                (rI = this[xP(0x423)] / 0x28),
                rF[xP(0x5df)](rI, rI),
                (rF[xP(0xc50)] = rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6));
              for (let sU = 0x0; sU < 0x2; sU++) {
                const sV = sU === 0x0 ? 0x1 : -0x1;
                rF[xP(0xb1a)](),
                  rF[xP(0xbd2)](0x1c, sV * 0xd),
                  rF[xP(0x5f9)](
                    Math[xP(0xdad)](this[xP(0x205)] * 1.24) * 0.1 * sV
                  ),
                  rF[xP(0x540)](),
                  rF[xP(0xc4d)](0x0, sV * 0x6),
                  rF[xP(0x91a)](0x14, sV * 0xb),
                  rF[xP(0x91a)](0x28, 0x0),
                  rF[xP(0x92a)](0x14, sV * 0x5, 0x0, 0x0),
                  rF[xP(0x51f)](),
                  rF[xP(0xa90)](),
                  rF[xP(0x5b9)](),
                  rF[xP(0xaea)]();
              }
              (rJ = this[xP(0x1f5)] ? lg : [xP(0xbc1), xP(0xb09)]),
                (rF[xP(0xc50)] = this[xP(0x863)](rJ[0x0])),
                rF[xP(0xa90)](l4),
                (rF[xP(0x930)] = 0x6),
                (rF[xP(0xc50)] = rF[xP(0xdf1)] = this[xP(0x863)](rJ[0x1])),
                rF[xP(0x5b9)](l4),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x15, 0x0),
                rF[xP(0x92a)](0x0, -0x3, 0x15, 0x0),
                (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x7),
                rF[xP(0x5b9)]();
              const rP = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rF[xP(0x540)]();
              for (let sW = 0x0; sW < 0x2; sW++) {
                const sX = sW === 0x1 ? 0x1 : -0x1;
                for (let sY = 0x0; sY < rP[xP(0xc60)]; sY++) {
                  let [sZ, t0] = rP[sY];
                  (t0 *= sX),
                    rF[xP(0xc4d)](sZ, t0),
                    rF[xP(0x660)](sZ, t0, 0x5, 0x0, kZ);
                }
              }
              rF[xP(0xa90)](), rF[xP(0xa90)](), rF[xP(0xaea)]();
              break;
            case cR[xP(0xb6f)]:
            case cR[xP(0xda9)]:
              rF[xP(0xb1a)](),
                (rI = this[xP(0x423)] / 0x28),
                rF[xP(0x5df)](rI, rI);
              const rQ = this[xP(0x909)] === cR[xP(0xb6f)];
              rQ &&
                (rF[xP(0xb1a)](),
                rF[xP(0xbd2)](-0x2d, 0x0),
                rF[xP(0x5f9)](Math["PI"]),
                this[xP(0x9a4)](rF, 0xf / 1.1),
                rF[xP(0xaea)]());
              (rJ = this[xP(0x1f5)]
                ? lg
                : rQ
                ? [xP(0xca0), xP(0x969)]
                : [xP(0xcfe), xP(0x2df)]),
                rF[xP(0x540)](),
                rF[xP(0x6f0)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, kZ),
                (rF[xP(0x930)] = 0xa),
                (rF[xP(0xdf1)] = this[xP(0x863)](rJ[0x1])),
                rF[xP(0x5b9)](),
                (rF[xP(0xc50)] = this[xP(0x863)](rJ[0x0])),
                rF[xP(0xa90)](),
                rF[xP(0xb1a)](),
                rF[xP(0xb63)](),
                rF[xP(0x540)]();
              const rR = [-0x1e, -0x5, 0x16];
              for (let t1 = 0x0; t1 < rR[xP(0xc60)]; t1++) {
                const t2 = rR[t1];
                rF[xP(0xc4d)](t2, -0x32),
                  rF[xP(0x92a)](t2 - 0x14, 0x0, t2, 0x32);
              }
              (rF[xP(0x930)] = 0xe),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                rF[xP(0x5b9)](),
                rF[xP(0xaea)]();
              rQ ? this[xP(0x541)](rF) : this[xP(0x856)](rF);
              rF[xP(0xaea)]();
              break;
            case cR[xP(0x689)]:
              (rI = this[xP(0x423)] / 0x32), rF[xP(0x5df)](rI, rI);
              const rS = 0x2f;
              rF[xP(0x540)]();
              for (let t3 = 0x0; t3 < 0x8; t3++) {
                let t4 =
                  (0.25 + ((t3 % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xP(0xdad)](t3 + this[xP(0x205)] * 1.3) * 0.2;
                t3 >= 0x4 && (t4 *= -0x1),
                  rF[xP(0xc4d)](0x0, 0x0),
                  rF[xP(0x91a)](
                    Math[xP(0x85f)](t4) * rS,
                    Math[xP(0xdad)](t4) * rS
                  );
              }
              (rF[xP(0x930)] = 0x7),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                (rF[xP(0xe13)] = xP(0xbb6)),
                rF[xP(0x5b9)](),
                (rF[xP(0xc50)] = rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x6);
              for (let t5 = 0x0; t5 < 0x2; t5++) {
                const t6 = t5 === 0x0 ? 0x1 : -0x1;
                rF[xP(0xb1a)](),
                  rF[xP(0xbd2)](0x16, t6 * 0xa),
                  rF[xP(0x5f9)](
                    -(Math[xP(0xdad)](this[xP(0x205)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      t6
                  ),
                  rF[xP(0x540)](),
                  rF[xP(0xc4d)](0x0, t6 * 0x6),
                  rF[xP(0x92a)](0x14, t6 * 0xf, 0x28, 0x0),
                  rF[xP(0x92a)](0x14, t6 * 0x5, 0x0, 0x0),
                  rF[xP(0x51f)](),
                  rF[xP(0xa90)](),
                  rF[xP(0x5b9)](),
                  rF[xP(0xaea)]();
              }
              (rF[xP(0x930)] = 0x8),
                l8(
                  rF,
                  0x1,
                  0x8,
                  this[xP(0x863)](xP(0x143)),
                  this[xP(0x863)](xP(0x822))
                );
              let rT;
              (rT = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rF[xP(0x540)]();
              for (let t7 = 0x0; t7 < rT[xP(0xc60)]; t7++) {
                const [t8, t9] = rT[t7];
                rF[xP(0xc4d)](t8, -t9),
                  rF[xP(0x92a)](t8 + Math[xP(0xc0d)](t8) * 4.2, 0x0, t8, t9);
              }
              (rF[xP(0xe13)] = xP(0xbb6)),
                rF[xP(0x5b9)](),
                rF[xP(0xbd2)](-0x21, 0x0),
                l8(
                  rF,
                  0.45,
                  0x8,
                  this[xP(0x863)](xP(0x7e1)),
                  this[xP(0x863)](xP(0x20f))
                ),
                rF[xP(0x540)](),
                (rT = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let ta = 0x0; ta < rT[xP(0xc60)]; ta++) {
                const [tb, tc] = rT[ta];
                rF[xP(0xc4d)](tb, -tc), rF[xP(0x92a)](tb - 0x3, 0x0, tb, tc);
              }
              (rF[xP(0x930)] = 0x5),
                (rF[xP(0xe13)] = xP(0xbb6)),
                rF[xP(0x5b9)](),
                rF[xP(0xbd2)](0x11, 0x0),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x0, -0x9),
                rF[xP(0x91a)](0x0, 0x9),
                rF[xP(0x91a)](0xb, 0x0),
                rF[xP(0x51f)](),
                (rF[xP(0xd4e)] = rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x6),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x46b))),
                rF[xP(0xa90)](),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0xd89)]:
              this[xP(0x2a2)](rF, xP(0xd54), xP(0x5c6), xP(0x92b));
              break;
            case cR[xP(0x869)]:
              this[xP(0x2a2)](rF, xP(0x383), xP(0xcb2), xP(0x826));
              break;
            case cR[xP(0x4ac)]:
              this[xP(0x2a2)](rF, xP(0x9b7), xP(0x76a), xP(0x92b));
              break;
            case cR[xP(0x9e6)]:
              (rI = this[xP(0x423)] / 0x46),
                rF[xP(0xd57)](rI),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x451))),
                rF[xP(0xa90)](lb),
                rF[xP(0xb63)](lb),
                (rF[xP(0x930)] = 0xf),
                (rF[xP(0xdf1)] = xP(0x5ea)),
                rF[xP(0x5b9)](lb),
                (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x7),
                (rF[xP(0xdf1)] = xP(0xbf1)),
                rF[xP(0x5b9)](lc);
              break;
            case cR[xP(0x15e)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x28),
                this[xP(0x714)](rF, 0x32, 0x1e, 0x7);
              break;
            case cR[xP(0xbec)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x64),
                this[xP(0x714)](rF),
                (rF[xP(0xc50)] = rF[xP(0xdf1)]);
              const rU = 0x6,
                rV = 0x3;
              rF[xP(0x540)]();
              for (let td = 0x0; td < rU; td++) {
                const te = (td / rU) * Math["PI"] * 0x2;
                rF[xP(0xb1a)](), rF[xP(0x5f9)](te);
                for (let tf = 0x0; tf < rV; tf++) {
                  const tg = tf / rV,
                    th = 0x12 + tg * 0x44,
                    ti = 0x7 + tg * 0x6;
                  rF[xP(0xc4d)](th, 0x0),
                    rF[xP(0x660)](th, 0x0, ti, 0x0, Math["PI"] * 0x2);
                }
                rF[xP(0xaea)]();
              }
              rF[xP(0xa90)]();
              break;
            case cR[xP(0x30c)]:
              (rI = this[xP(0x423)] / 0x31),
                rF[xP(0xd57)](rI),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                (rK = this[xP(0x205)] * 0x15e);
              const rW = (Math[xP(0xdad)](rK * 0.01) * 0.5 + 0.5) * 0.1;
              (rF[xP(0xdf1)] = rF[xP(0xc50)] = this[xP(0x863)](xP(0x874))),
                (rF[xP(0x930)] = 0x3);
              for (let tj = 0x0; tj < 0x2; tj++) {
                rF[xP(0xb1a)]();
                const tk = tj * 0x2 - 0x1;
                rF[xP(0x5df)](0x1, tk),
                  rF[xP(0xbd2)](0x1c, -0x27),
                  rF[xP(0x5df)](1.5, 1.5),
                  rF[xP(0x5f9)](rW),
                  rF[xP(0x540)](),
                  rF[xP(0xc4d)](0x0, 0x0),
                  rF[xP(0x92a)](0xc, -0x8, 0x14, 0x3),
                  rF[xP(0x91a)](0xb, 0x1),
                  rF[xP(0x91a)](0x11, 0x9),
                  rF[xP(0x92a)](0xc, 0x5, 0x0, 0x6),
                  rF[xP(0x51f)](),
                  rF[xP(0x5b9)](),
                  rF[xP(0xa90)](),
                  rF[xP(0xaea)]();
              }
              rF[xP(0x540)]();
              for (let tl = 0x0; tl < 0x2; tl++) {
                for (let tm = 0x0; tm < 0x4; tm++) {
                  const tn = tl * 0x2 - 0x1,
                    to =
                      (Math[xP(0xdad)](rK * 0.005 + tl + tm * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rF[xP(0xb1a)](),
                    rF[xP(0x5df)](0x1, tn),
                    rF[xP(0xbd2)]((tm / 0x3) * 0x1e - 0xf, 0x28);
                  const tp = tm < 0x2 ? 0x1 : -0x1;
                  rF[xP(0x5f9)](to * tp),
                    rF[xP(0xc4d)](0x0, 0x0),
                    rF[xP(0xbd2)](0x0, 0x19),
                    rF[xP(0x91a)](0x0, 0x0),
                    rF[xP(0x5f9)](tp * 0.7 * (to + 0.3)),
                    rF[xP(0x91a)](0x0, 0xa),
                    rF[xP(0xaea)]();
                }
              }
              (rF[xP(0x930)] = 0xa),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x2, 0x17),
                rF[xP(0x92a)](0x17, 0x0, 0x2, -0x17),
                rF[xP(0x91a)](-0xa, -0xf),
                rF[xP(0x91a)](-0xa, 0xf),
                rF[xP(0x51f)](),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x905))),
                (rF[xP(0x930)] = 0x44),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                rF[xP(0x5b9)](),
                (rF[xP(0x930)] -= 0x12),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x2f2))),
                rF[xP(0x5b9)](),
                (rF[xP(0xdf1)] = xP(0x702)),
                rF[xP(0x540)]();
              const rX = 0x12;
              for (let tq = 0x0; tq < 0x2; tq++) {
                rF[xP(0xc4d)](-0x12, rX),
                  rF[xP(0x92a)](0x0, -0x7 + rX, 0x12, rX),
                  rF[xP(0x5df)](0x1, -0x1);
              }
              (rF[xP(0x930)] = 0x9), rF[xP(0x5b9)]();
              break;
            case cR[xP(0xd8c)]:
              (rI = this[xP(0x423)] / 0x50),
                rF[xP(0xd57)](rI),
                rF[xP(0x5f9)](
                  ((Date[xP(0x5b6)]() / 0x7d0) % kZ) + this[xP(0x205)] * 0.4
                );
              const rY = 0x5;
              !this[xP(0x8bc)] &&
                (this[xP(0x8bc)] = Array(rY)[xP(0xa90)](0x64));
              const rZ = this[xP(0x8bc)],
                s0 = this[xP(0xda1)]
                  ? 0x0
                  : Math[xP(0xb54)](this[xP(0x6b6)] * (rY - 0x1));
              rF[xP(0x540)]();
              for (let tr = 0x0; tr < rY; tr++) {
                const ts = ((tr + 0.5) / rY) * Math["PI"] * 0x2,
                  tu = ((tr + 0x1) / rY) * Math["PI"] * 0x2;
                rZ[tr] += ((tr < s0 ? 0x64 : 0x3c) - rZ[tr]) * 0.2;
                const tv = rZ[tr];
                if (tr === 0x0) rF[xP(0xc4d)](tv, 0x0);
                rF[xP(0x92a)](
                  Math[xP(0x85f)](ts) * 0x5,
                  Math[xP(0xdad)](ts) * 0x5,
                  Math[xP(0x85f)](tu) * tv,
                  Math[xP(0xdad)](tu) * tv
                );
              }
              rF[xP(0x51f)](),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x1c + 0xa),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x823))),
                rF[xP(0x5b9)](),
                (rF[xP(0x930)] = 0x10 + 0xa),
                (rF[xP(0xdf1)] = rF[xP(0xc50)] = this[xP(0x863)](xP(0x601))),
                rF[xP(0xa90)](),
                rF[xP(0x5b9)](),
                rF[xP(0x540)]();
              for (let tw = 0x0; tw < rY; tw++) {
                const tx = (tw / rY) * Math["PI"] * 0x2;
                rF[xP(0xb1a)](), rF[xP(0x5f9)](tx);
                const ty = rZ[tw] / 0x64;
                let tz = 0x1a;
                const tA = 0x4;
                for (let tB = 0x0; tB < tA; tB++) {
                  const tC = (0x1 - (tB / tA) * 0.7) * 0xc * ty;
                  rF[xP(0xc4d)](tz, 0x0),
                    rF[xP(0x660)](tz, 0x0, tC, 0x0, Math["PI"] * 0x2),
                    (tz += tC * 0x2 + 3.5 * ty);
                }
                rF[xP(0xaea)]();
              }
              (rF[xP(0xc50)] = xP(0xdcb)), rF[xP(0xa90)]();
              break;
            case cR[xP(0x426)]:
              (rI = this[xP(0x423)] / 0x1e),
                rF[xP(0xd57)](rI),
                rF[xP(0xbd2)](-0x22, 0x0),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x0, -0x8),
                rF[xP(0x92a)](0x9b, 0x0, 0x0, 0x8),
                rF[xP(0x51f)](),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x1a),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x823))),
                rF[xP(0x5b9)](),
                (rF[xP(0x930)] = 0x10),
                (rF[xP(0xdf1)] = rF[xP(0xc50)] = this[xP(0x863)](xP(0x601))),
                rF[xP(0xa90)](),
                rF[xP(0x5b9)](),
                rF[xP(0x540)]();
              let s1 = 0xd;
              for (let tD = 0x0; tD < 0x4; tD++) {
                const tE = (0x1 - (tD / 0x4) * 0.7) * 0xa;
                rF[xP(0xc4d)](s1, 0x0),
                  rF[xP(0x660)](s1, 0x0, tE, 0x0, Math["PI"] * 0x2),
                  (s1 += tE * 0x2 + 0x4);
              }
              (rF[xP(0xc50)] = xP(0xdcb)), rF[xP(0xa90)]();
              break;
            case cR[xP(0xb50)]:
              (rI = this[xP(0x423)] / 0x64),
                rF[xP(0x5df)](rI, rI),
                (rF[xP(0xd4e)] = rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0xdf1)] = xP(0x15f)),
                (rF[xP(0x930)] = 0x14);
              const s3 = [0x1, 0.63, 0.28],
                s4 = this[xP(0x1f5)] ? ln : [xP(0x640), xP(0xdab), xP(0x53f)],
                s5 = (pO * 0.005) % kZ;
              for (let tF = 0x0; tF < 0x3; tF++) {
                const tG = s3[tF],
                  tH = s4[tF];
                rF[xP(0xb1a)](),
                  rF[xP(0x5f9)](s5 * (tF % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rF[xP(0x540)]();
                const tI = 0x7 - tF;
                for (let tJ = 0x0; tJ < tI; tJ++) {
                  const tK = (Math["PI"] * 0x2 * tJ) / tI;
                  rF[xP(0x91a)](
                    Math[xP(0x85f)](tK) * tG * 0x64,
                    Math[xP(0xdad)](tK) * tG * 0x64
                  );
                }
                rF[xP(0x51f)](),
                  (rF[xP(0xdf1)] = rF[xP(0xc50)] = this[xP(0x863)](tH)),
                  rF[xP(0xa90)](),
                  rF[xP(0x5b9)](),
                  rF[xP(0xaea)]();
              }
              break;
            case cR[xP(0x409)]:
              (rI = this[xP(0x423)] / 0x41),
                rF[xP(0x5df)](rI, rI),
                (rK = this[xP(0x205)] * 0x2),
                rF[xP(0x5f9)](Math["PI"] / 0x2);
              if (this[xP(0x79e)]) {
                const tL = 0x3;
                rF[xP(0x540)]();
                for (let tP = 0x0; tP < 0x2; tP++) {
                  for (let tQ = 0x0; tQ <= tL; tQ++) {
                    const tR = (tQ / tL) * 0x50 - 0x28;
                    rF[xP(0xb1a)]();
                    const tS = tP * 0x2 - 0x1;
                    rF[xP(0xbd2)](tS * -0x2d, tR);
                    const tT =
                      1.1 + Math[xP(0xdad)]((tQ / tL) * Math["PI"]) * 0.5;
                    rF[xP(0x5df)](tT * tS, tT),
                      rF[xP(0x5f9)](Math[xP(0xdad)](rK + tQ + tS) * 0.3 + 0.3),
                      rF[xP(0xc4d)](0x0, 0x0),
                      rF[xP(0x92a)](-0xf, -0x5, -0x14, 0xa),
                      rF[xP(0xaea)]();
                  }
                }
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                  (rF[xP(0x930)] = 0x8),
                  (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                  rF[xP(0x5b9)](),
                  (rF[xP(0x930)] = 0xc);
                const tM = Date[xP(0x5b6)]() * 0.01,
                  tN = Math[xP(0xdad)](tM * 0.5) * 0.5 + 0.5,
                  tO = tN * 0.1 + 0x1;
                rF[xP(0x540)](),
                  rF[xP(0x660)](-0xf * tO, 0x2b - tN, 0x10, 0x0, Math["PI"]),
                  rF[xP(0x660)](0xf * tO, 0x2b - tN, 0x10, 0x0, Math["PI"]),
                  rF[xP(0xc4d)](-0x16, -0x2b),
                  rF[xP(0x660)](0x0, -0x2b - tN, 0x16, 0x0, Math["PI"], !![]),
                  (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x1b9))),
                  rF[xP(0x5b9)](),
                  (rF[xP(0xc50)] = this[xP(0x863)](xP(0xbc1))),
                  rF[xP(0xa90)](),
                  rF[xP(0xb1a)](),
                  rF[xP(0x5f9)]((Math["PI"] * 0x3) / 0x2),
                  this[xP(0x856)](rF, 0x1a - tN, 0x0),
                  rF[xP(0xaea)]();
              }
              if (!this[xP(0x99b)]) {
                const tU = dH[d8[xP(0xca6)]],
                  tV = Math[xP(0x9b2)](this["id"] % tU[xP(0xc60)], 0x0),
                  tW = new lM(-0x1, 0x0, 0x0, tU[tV]["id"]);
                (tW[xP(0x4b1)] = 0x1),
                  (tW[xP(0x6b8)] = 0x0),
                  (this[xP(0x99b)] = tW);
              }
              rF[xP(0xd57)](1.3), this[xP(0x99b)][xP(0xd6f)](rF);
              break;
            case cR[xP(0x651)]:
              (rI = this[xP(0x423)] / 0x14),
                rF[xP(0x5df)](rI, rI),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x11, 0x0),
                rF[xP(0x91a)](0x0, 0x0),
                rF[xP(0x91a)](0x11, 0x6),
                rF[xP(0xc4d)](0x0, 0x0),
                rF[xP(0x91a)](0xb, -0x7),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x953))),
                (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0xc),
                rF[xP(0x5b9)](),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x48b))),
                (rF[xP(0x930)] = 0x6),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x884)]:
              (rI = this[xP(0x423)] / 0x80),
                rF[xP(0xd57)](rI),
                rF[xP(0xbd2)](-0x80, -0x78),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0xe4f))),
                rF[xP(0xa90)](f8[xP(0x589)]),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x18e))),
                (rF[xP(0x930)] = 0x14),
                rF[xP(0x5b9)](f8[xP(0x589)]);
              break;
            case cR[xP(0xaf1)]:
              (rI = this[xP(0x423)] / 0x19),
                rF[xP(0x5df)](rI, rI),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x19, 0x0),
                rF[xP(0x91a)](-0x2d, 0x0),
                (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x14),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0xe49))),
                rF[xP(0xa90)](),
                (rF[xP(0x930)] = 0x7),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x6d6))),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x28d)]:
              rF[xP(0x5f9)](-this[xP(0x6b8)]),
                rF[xP(0xd57)](this[xP(0x423)] / 0x14),
                this[xP(0xd5c)](rF),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0xe49))),
                rF[xP(0xa90)](),
                rF[xP(0xb63)](),
                (rF[xP(0x930)] = 0xc),
                (rF[xP(0xdf1)] = xP(0x702)),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x6be)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x64), this[xP(0x50e)](rF);
              break;
            case cR[xP(0xc55)]:
              this[xP(0x5c8)](rF, !![]);
              break;
            case cR[xP(0x2a3)]:
              this[xP(0x5c8)](rF, ![]);
              break;
            case cR[xP(0x917)]:
              (rI = this[xP(0x423)] / 0xa),
                rF[xP(0xd57)](rI),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x0, 0x8),
                rF[xP(0x92a)](2.5, 0x0, 0x0, -0x8),
                (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0xa),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x6d6))),
                rF[xP(0x5b9)](),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0xe49))),
                (rF[xP(0x930)] = 0x6),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x139)]:
              (rI = this[xP(0x423)] / 0xa),
                rF[xP(0xd57)](rI),
                rF[xP(0xbd2)](0x7, 0x0),
                (rF[xP(0xe13)] = xP(0xbb6)),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x5, -0x5),
                rF[xP(0xc0b)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rF[xP(0xc0b)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x874))),
                rF[xP(0xa90)](),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x7ab))),
                (rF[xP(0x930)] = 0x3),
                (rF[xP(0xd4e)] = xP(0xbb6)),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x410)]:
              (rI = this[xP(0x423)] / 0x32), rF[xP(0xd57)](rI), rF[xP(0x540)]();
              for (let tX = 0x0; tX < 0x9; tX++) {
                const tY = (tX / 0x9) * Math["PI"] * 0x2,
                  tZ =
                    0x3c *
                    (0x1 +
                      Math[xP(0x85f)]((tX / 0x9) * Math["PI"] * 3.5) * 0.07);
                rF[xP(0xc4d)](0x0, 0x0),
                  rF[xP(0x91a)](
                    Math[xP(0x85f)](tY) * tZ,
                    Math[xP(0xdad)](tY) * tZ
                  );
              }
              (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x10),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0xe49))),
                rF[xP(0xa90)](),
                (rF[xP(0x930)] = 0x6),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x6d6))),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0xbf5)]:
              rF[xP(0xb1a)](),
                (rI = this[xP(0x423)] / 0x28),
                rF[xP(0x5df)](rI, rI),
                this[xP(0x387)](rF),
                (rF[xP(0xc50)] = this[xP(0x863)](
                  this[xP(0x1f5)] ? lg[0x0] : xP(0x117)
                )),
                (rF[xP(0xdf1)] = xP(0xd1f)),
                (rF[xP(0x930)] = 0x10),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rF[xP(0xa90)](),
                rF[xP(0xb1a)](),
                rF[xP(0xb63)](),
                rF[xP(0x5b9)](),
                rF[xP(0xaea)](),
                rF[xP(0xaea)]();
              break;
            case cR[xP(0x33b)]:
            case cR[xP(0x717)]:
            case cR[xP(0xd9a)]:
            case cR[xP(0x6fc)]:
            case cR[xP(0xd59)]:
            case cR[xP(0x8da)]:
            case cR[xP(0x514)]:
            case cR[xP(0x836)]:
              (rI = this[xP(0x423)] / 0x14), rF[xP(0x5df)](rI, rI);
              const s6 = Math[xP(0xdad)](this[xP(0x205)] * 1.6),
                s7 = this[xP(0x5d7)][xP(0xa69)](xP(0x33b)),
                s8 = this[xP(0x5d7)][xP(0xa69)](xP(0x276)),
                s9 = this[xP(0x5d7)][xP(0xa69)](xP(0xd9a)),
                sa = this[xP(0x5d7)][xP(0xa69)](xP(0xd9a)) ? -0x4 : 0x0;
              (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x6);
              s8 && rF[xP(0xbd2)](0x8, 0x0);
              for (let u0 = 0x0; u0 < 0x2; u0++) {
                const u1 = u0 === 0x0 ? -0x1 : 0x1;
                rF[xP(0xb1a)](), rF[xP(0x5f9)](u1 * (s6 * 0.5 + 0.6) * 0.08);
                const u2 = u1 * 0x4;
                rF[xP(0x540)](),
                  rF[xP(0xc4d)](0x0, u2),
                  rF[xP(0x92a)](0xc, 0x6 * u1 + u2, 0x18, u2),
                  rF[xP(0x5b9)](),
                  rF[xP(0xaea)]();
              }
              if (this[xP(0x1f5)])
                (rF[xP(0xc50)] = this[xP(0x863)](lg[0x0])),
                  (rF[xP(0xdf1)] = this[xP(0x863)](lg[0x1]));
              else
                this[xP(0x5d7)][xP(0x54e)](xP(0x706))
                  ? ((rF[xP(0xc50)] = this[xP(0x863)](xP(0x2c3))),
                    (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x3d3))))
                  : ((rF[xP(0xc50)] = this[xP(0x863)](xP(0xcf3))),
                    (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x9e5))));
              rF[xP(0x930)] = s8 ? 0x9 : 0xc;
              s8 &&
                (rF[xP(0xb1a)](),
                rF[xP(0xbd2)](-0x18, 0x0),
                rF[xP(0x5df)](-0x1, 0x1),
                lE(rF, 0x15, rF[xP(0xc50)], rF[xP(0xdf1)], rF[xP(0x930)]),
                rF[xP(0xaea)]());
              !s9 &&
                (rF[xP(0xb1a)](),
                rF[xP(0x540)](),
                rF[xP(0x660)](-0xa, 0x0, s8 ? 0x12 : 0xc, 0x0, kZ),
                rF[xP(0xa90)](),
                rF[xP(0xb63)](),
                rF[xP(0x5b9)](),
                rF[xP(0xaea)]());
              if (s7 || s8) {
                rF[xP(0xb1a)](),
                  (rF[xP(0xc50)] = this[xP(0x863)](xP(0xbae))),
                  (rF[xP(0xa46)] *= 0.5);
                const u3 = (Math["PI"] / 0x7) * (s8 ? 0.85 : 0x1) + s6 * 0.08;
                for (let u4 = 0x0; u4 < 0x2; u4++) {
                  const u5 = u4 === 0x0 ? -0x1 : 0x1;
                  rF[xP(0xb1a)](),
                    rF[xP(0x5f9)](u5 * u3),
                    rF[xP(0xbd2)](
                      s8 ? -0x13 : -0x9,
                      u5 * -0x3 * (s8 ? 1.3 : 0x1)
                    ),
                    rF[xP(0x540)](),
                    rF[xP(0x6f0)](
                      0x0,
                      0x0,
                      s8 ? 0x14 : 0xe,
                      s8 ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      kZ
                    ),
                    rF[xP(0xa90)](),
                    rF[xP(0xaea)]();
                }
                rF[xP(0xaea)]();
              }
              rF[xP(0xb1a)](),
                rF[xP(0xbd2)](0x4 + sa, 0x0),
                lE(
                  rF,
                  s9 ? 0x14 : 12.1,
                  rF[xP(0xc50)],
                  rF[xP(0xdf1)],
                  rF[xP(0x930)]
                ),
                rF[xP(0xaea)]();
              break;
            case cR[xP(0x98e)]:
              this[xP(0x190)](rF, xP(0x5c1));
              break;
            case cR[xP(0xbbd)]:
              this[xP(0x190)](rF, xP(0x9fc));
              break;
            case cR[xP(0x22b)]:
              this[xP(0x190)](rF, xP(0x46b)),
                (rF[xP(0xa46)] *= 0.2),
                lI(rF, this[xP(0x423)] * 1.3, 0x4);
              break;
            case cR[xP(0xdec)]:
            case cR[xP(0x580)]:
            case cR[xP(0xa7c)]:
            case cR[xP(0x800)]:
            case cR[xP(0x5e8)]:
            case cR[xP(0x1e6)]:
              rF[xP(0xb1a)](),
                (rI = this[xP(0x423)] / 0x28),
                rF[xP(0x5df)](rI, rI),
                rF[xP(0x540)]();
              for (let u6 = 0x0; u6 < 0x2; u6++) {
                rF[xP(0xb1a)](),
                  rF[xP(0x5df)](0x1, u6 * 0x2 - 0x1),
                  rF[xP(0xbd2)](0x0, 0x23),
                  rF[xP(0xc4d)](0x9, 0x0),
                  rF[xP(0x91a)](0x5, 0xa),
                  rF[xP(0x91a)](-0x5, 0xa),
                  rF[xP(0x91a)](-0x9, 0x0),
                  rF[xP(0x91a)](0x9, 0x0),
                  rF[xP(0xaea)]();
              }
              (rF[xP(0x930)] = 0x12),
                (rF[xP(0xd4e)] = rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0xdf1)] = rF[xP(0xc50)] = this[xP(0x863)](xP(0xc66))),
                rF[xP(0xa90)](),
                rF[xP(0x5b9)]();
              let sb;
              if (this[xP(0x5d7)][xP(0x6ee)](xP(0x69d)) > -0x1)
                sb = [xP(0x9b1), xP(0x4f4)];
              else
                this[xP(0x5d7)][xP(0x6ee)](xP(0x8bd)) > -0x1
                  ? (sb = [xP(0xbc1), xP(0x9d9)])
                  : (sb = [xP(0xd52), xP(0x9bc)]);
              rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0x28, 0x0, kZ),
                (rF[xP(0xc50)] = this[xP(0x863)](sb[0x0])),
                rF[xP(0xa90)](),
                (rF[xP(0x930)] = 0x8),
                (rF[xP(0xdf1)] = this[xP(0x863)](sb[0x1])),
                rF[xP(0x5b9)]();
              this[xP(0x5d7)][xP(0x6ee)](xP(0x3d4)) > -0x1 &&
                this[xP(0x856)](rF, -0xf, 0x0, 1.25, 0x4);
              rF[xP(0xaea)]();
              break;
            case cR[xP(0x906)]:
            case cR[xP(0xde3)]:
              (rK =
                Math[xP(0xdad)](
                  Date[xP(0x5b6)]() / 0x3e8 + this[xP(0x205)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rI = this[xP(0x423)] / 0x50),
                rF[xP(0x5df)](rI, rI);
              const sc = this[xP(0x909)] === cR[xP(0xde3)];
              sc &&
                (rF[xP(0xb1a)](),
                rF[xP(0x5df)](0x2, 0x2),
                this[xP(0x387)](rF),
                rF[xP(0xaea)]());
              rF[xP(0x5f9)](-this[xP(0x6b8)]),
                (rF[xP(0x930)] = 0xa),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (rJ = this[xP(0x1f5)]
                  ? lg
                  : sc
                  ? [xP(0x577), xP(0xdf2)]
                  : [xP(0x432), xP(0x3df)]),
                (rF[xP(0xc50)] = this[xP(0x863)](rJ[0x0])),
                rF[xP(0xa90)](),
                rF[xP(0xb63)](),
                (rF[xP(0xdf1)] = this[xP(0x863)](rJ[0x1])),
                rF[xP(0x5b9)]();
              const sd = this[xP(0x863)](xP(0xe49)),
                se = this[xP(0x863)](xP(0x92b)),
                sf = (u7 = 0x1) => {
                  const xS = xP;
                  rF[xS(0xb1a)](),
                    rF[xS(0x5df)](u7, 0x1),
                    rF[xS(0xbd2)](0x13 - rK * 0x4, -0x1d + rK * 0x5),
                    rF[xS(0x540)](),
                    rF[xS(0xc4d)](0x0, 0x0),
                    rF[xS(0xc0b)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rF[xS(0x92a)](0x19, 0x5 + rK * 0x2, 0x0, 0x0),
                    rF[xS(0x51f)](),
                    (rF[xS(0x930)] = 0x3),
                    rF[xS(0x5b9)](),
                    (rF[xS(0xc50)] = sd),
                    rF[xS(0xa90)](),
                    rF[xS(0xb63)](),
                    rF[xS(0x540)](),
                    rF[xS(0x660)](
                      0x16 + u7 * this[xS(0x9c2)] * 0x10,
                      -0x4 + this[xS(0x3e9)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rF[xS(0xc50)] = se),
                    rF[xS(0xa90)](),
                    rF[xS(0xaea)]();
                };
              sf(0x1),
                sf(-0x1),
                rF[xP(0xb1a)](),
                rF[xP(0xbd2)](0x0, 0xa),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x28 + rK * 0xa, -0xe + rK * 0x5),
                rF[xP(0x92a)](0x0, +rK * 0x5, 0x2c - rK * 0xf, -0xe + rK * 0x5),
                rF[xP(0xc0b)](
                  0x14,
                  0x28 - rK * 0x14,
                  -0x14,
                  0x28 - rK * 0x14,
                  -0x28 + rK * 0xa,
                  -0xe + rK * 0x5
                ),
                rF[xP(0x51f)](),
                (rF[xP(0x930)] = 0x5),
                rF[xP(0x5b9)](),
                (rF[xP(0xc50)] = se),
                rF[xP(0xa90)](),
                rF[xP(0xb63)]();
              const sg = rK * 0x2,
                sh = rK * -0xa;
              rF[xP(0xb1a)](),
                rF[xP(0xbd2)](0x0, sh),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x37, -0x8),
                rF[xP(0xc0b)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rF[xP(0xdf1)] = sd),
                (rF[xP(0x930)] = 0xd),
                rF[xP(0x5b9)](),
                (rF[xP(0x930)] = 0x4),
                (rF[xP(0xdf1)] = se),
                rF[xP(0x540)]();
              for (let u7 = 0x0; u7 < 0x6; u7++) {
                const u8 = (((u7 + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rF[xP(0xc4d)](u8, 0xa), rF[xP(0x91a)](u8, 0x46);
              }
              rF[xP(0x5b9)](),
                rF[xP(0xaea)](),
                rF[xP(0xb1a)](),
                rF[xP(0xbd2)](0x0, sg),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x32, -0x14),
                rF[xP(0x92a)](0x0, 0x8, 0x32, -0x12),
                (rF[xP(0xdf1)] = sd),
                (rF[xP(0x930)] = 0xd),
                rF[xP(0x5b9)](),
                (rF[xP(0x930)] = 0x5),
                (rF[xP(0xdf1)] = se),
                rF[xP(0x540)]();
              for (let u9 = 0x0; u9 < 0x6; u9++) {
                let ua = (((u9 + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rF[xP(0xc4d)](ua, -0x14), rF[xP(0x91a)](ua, 0x2);
              }
              rF[xP(0x5b9)](), rF[xP(0xaea)](), rF[xP(0xaea)]();
              const si = 0x1 - rK;
              (rF[xP(0xa46)] *= Math[xP(0x9b2)](0x0, (si - 0.3) / 0.7)),
                rF[xP(0x540)]();
              for (let ub = 0x0; ub < 0x2; ub++) {
                rF[xP(0xb1a)](),
                  ub === 0x1 && rF[xP(0x5df)](-0x1, 0x1),
                  rF[xP(0xbd2)](
                    -0x33 + rK * (0xa + ub * 3.4) - ub * 3.4,
                    -0xf + rK * (0x5 - ub * 0x1)
                  ),
                  rF[xP(0xc4d)](0xa, 0x0),
                  rF[xP(0x660)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rF[xP(0xaea)]();
              }
              rF[xP(0xbd2)](0x0, 0x28),
                rF[xP(0xc4d)](0x28 - rK * 0xa, -0xe + rK * 0x5),
                rF[xP(0xc0b)](
                  0x14,
                  0x14 - rK * 0xa,
                  -0x14,
                  0x14 - rK * 0xa,
                  -0x28 + rK * 0xa,
                  -0xe + rK * 0x5
                ),
                (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x2),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x147)]:
              (rI = this[xP(0x423)] / 0x14), rF[xP(0x5df)](rI, rI);
              const sj = rF[xP(0xa46)];
              (rF[xP(0xdf1)] = rF[xP(0xc50)] = this[xP(0x863)](xP(0xe49))),
                (rF[xP(0xa46)] = 0.6 * sj),
                rF[xP(0x540)]();
              for (let uc = 0x0; uc < 0xa; uc++) {
                const ud = (uc / 0xa) * Math["PI"] * 0x2;
                rF[xP(0xb1a)](),
                  rF[xP(0x5f9)](ud),
                  rF[xP(0xbd2)](17.5, 0x0),
                  rF[xP(0xc4d)](0x0, 0x0);
                const ue = Math[xP(0xdad)](ud + Date[xP(0x5b6)]() / 0x1f4);
                rF[xP(0x5f9)](ue * 0.5),
                  rF[xP(0x92a)](0x4, -0x2 * ue, 0xe, 0x0),
                  rF[xP(0xaea)]();
              }
              (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 2.3),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rF[xP(0xa46)] = 0.5 * sj),
                rF[xP(0xa90)](),
                rF[xP(0xb63)](),
                (rF[xP(0x930)] = 0x3),
                rF[xP(0x5b9)](),
                (rF[xP(0x930)] = 1.2),
                (rF[xP(0xa46)] = 0.6 * sj),
                rF[xP(0x540)](),
                (rF[xP(0xe13)] = xP(0xbb6));
              for (let uf = 0x0; uf < 0x4; uf++) {
                rF[xP(0xb1a)](),
                  rF[xP(0x5f9)]((uf / 0x4) * Math["PI"] * 0x2),
                  rF[xP(0xbd2)](0x4, 0x0),
                  rF[xP(0xc4d)](0x0, -0x2),
                  rF[xP(0xc0b)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rF[xP(0xaea)]();
              }
              rF[xP(0x5b9)]();
              break;
            case cR[xP(0x8be)]:
              this[xP(0x8be)](rF);
              break;
            case cR[xP(0xe47)]:
              this[xP(0x8be)](rF, !![]);
              break;
            case cR[xP(0x9ad)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x32),
                (rF[xP(0x930)] = 0x19),
                (rF[xP(0xd4e)] = xP(0xbb6));
              const sk = this[xP(0xa28)]
                ? 0.6
                : (Date[xP(0x5b6)]() / 0x4b0) % 6.28;
              for (let ug = 0x0; ug < 0xa; ug++) {
                const uh = 0x1 - ug / 0xa,
                  ui =
                    uh *
                    0x50 *
                    (0x1 +
                      (Math[xP(0xdad)](sk * 0x3 + ug * 0.5 + this[xP(0x205)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rF[xP(0x5f9)](sk),
                  (rF[xP(0xdf1)] = this[xP(0x863)](lf[ug])),
                  rF[xP(0x137)](-ui / 0x2, -ui / 0x2, ui, ui);
              }
              break;
            case cR[xP(0x75e)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x12),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x19, -0xa),
                rF[xP(0x92a)](0x0, -0x2, 0x19, -0xa),
                rF[xP(0x92a)](0x1e, 0x0, 0x19, 0xa),
                rF[xP(0x92a)](0x0, 0x2, -0x19, 0xa),
                rF[xP(0x92a)](-0x1e, 0x0, -0x19, -0xa),
                rF[xP(0x51f)](),
                (rF[xP(0xd4e)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0x4),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0xc25))),
                rF[xP(0x5b9)](),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x84d))),
                rF[xP(0xa90)](),
                rF[xP(0xb63)](),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x19, -0xa),
                rF[xP(0x92a)](0x14, 0x0, 0x19, 0xa),
                rF[xP(0x91a)](0x28, 0xa),
                rF[xP(0x91a)](0x28, -0xa),
                (rF[xP(0xc50)] = xP(0xd1f)),
                rF[xP(0xa90)](),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x0, -0xa),
                rF[xP(0x92a)](-0x5, 0x0, 0x0, 0xa),
                (rF[xP(0x930)] = 0xa),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x8ab))),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x96e)]:
              (rI = this[xP(0x423)] / 0xc),
                rF[xP(0x5df)](rI, rI),
                rF[xP(0x5f9)](-Math["PI"] / 0x6),
                rF[xP(0xbd2)](-0xc, 0x0),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x5, 0x0),
                rF[xP(0x91a)](0x0, 0x0),
                (rF[xP(0x930)] = 0x4),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0xcc9))),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x0, 0x0),
                rF[xP(0x92a)](0xa, -0x14, 0x1e, 0x0),
                rF[xP(0x92a)](0xa, 0x14, 0x0, 0x0),
                (rF[xP(0x930)] = 0x6),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x1a8))),
                rF[xP(0x5b9)](),
                rF[xP(0xa90)](),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x6, 0x0),
                rF[xP(0x92a)](0xe, -0x2, 0x16, 0x0),
                (rF[xP(0x930)] = 3.5),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0xd0d)]:
              rH(xP(0xd0d), xP(0x9a5), xP(0x647));
              break;
            case cR[xP(0x1df)]:
              rH(xP(0x1df), xP(0xad7), xP(0xd3b));
              break;
            case cR[xP(0xb5a)]:
              rH(xP(0xb5a), xP(0xe49), xP(0x6d6));
              break;
            case cR[xP(0xdc3)]:
              rH(xP(0xdc3), xP(0xe49), xP(0x6d6));
              break;
            case cR[xP(0x290)]:
              rH(xP(0xdc3), xP(0x599), xP(0x709));
              break;
            case cR[xP(0x412)]:
              const sl = this[xP(0xa28)] ? 0x3c : this[xP(0x423)] * 0x2;
              rF[xP(0xbd2)](-this[xP(0x423)] - 0xa, 0x0),
                (rF[xP(0xd4e)] = rF[xP(0xe13)] = xP(0xbb6)),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x0, 0x0),
                rF[xP(0x91a)](sl, 0x0),
                (rF[xP(0x930)] = 0x6),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0x660)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x7ab))),
                rF[xP(0xa90)](),
                rF[xP(0xbd2)](sl, 0x0),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0xd, 0x0),
                rF[xP(0x91a)](0x0, -3.5),
                rF[xP(0x91a)](0x0, 3.5),
                rF[xP(0x51f)](),
                (rF[xP(0xdf1)] = rF[xP(0xc50)]),
                rF[xP(0xa90)](),
                (rF[xP(0x930)] = 0x3),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x89f)]:
              const sm = this[xP(0x423)] * 0x2,
                sn = 0xa;
              rF[xP(0xbd2)](-this[xP(0x423)], 0x0),
                (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0xb20)] = xP(0x3d0)),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x0, 0x0),
                rF[xP(0x91a)](-sn * 1.8, 0x0),
                (rF[xP(0xdf1)] = xP(0x645)),
                (rF[xP(0x930)] = sn * 1.4),
                rF[xP(0x5b9)](),
                (rF[xP(0xdf1)] = xP(0x372)),
                (rF[xP(0x930)] *= 0.7),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x0, 0x0),
                rF[xP(0x91a)](-sn * 0.45, 0x0),
                (rF[xP(0xdf1)] = xP(0x645)),
                (rF[xP(0x930)] = sn * 0x2 + 3.5),
                rF[xP(0x5b9)](),
                (rF[xP(0xdf1)] = xP(0x661)),
                (rF[xP(0x930)] = sn * 0x2),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, sn, 0x0, Math["PI"] * 0x2),
                (rF[xP(0xc50)] = xP(0xdfd)),
                rF[xP(0xa90)](),
                (rF[xP(0xdf1)] = xP(0xd1d)),
                rF[xP(0x540)]();
              const so = (Date[xP(0x5b6)]() * 0.001) % 0x1,
                sp = so * sm,
                sq = sm * 0.2;
              rF[xP(0xc4d)](Math[xP(0x9b2)](sp - sq, 0x0), 0x0),
                rF[xP(0x91a)](Math[xP(0xd8d)](sp + sq, sm), 0x0);
              const sr = Math[xP(0xdad)](so * Math["PI"]);
              (rF[xP(0x3f7)] = sn * 0x3 * sr),
                (rF[xP(0x930)] = sn),
                rF[xP(0x5b9)](),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x0, 0x0),
                rF[xP(0x91a)](sm, 0x0),
                (rF[xP(0x930)] = sn),
                (rF[xP(0x3f7)] = sn),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x5ba)]:
            case cR[xP(0x346)]:
            case cR[xP(0xa7d)]:
            case cR[xP(0xb23)]:
            case cR[xP(0x42e)]:
            case cR[xP(0x6c1)]:
              (rI = this[xP(0x423)] / 0x23), rF[xP(0xd57)](rI), rF[xP(0x540)]();
              this[xP(0x909)] !== cR[xP(0x346)] &&
              this[xP(0x909)] !== cR[xP(0x42e)]
                ? rF[xP(0x6f0)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, kZ)
                : rF[xP(0x660)](0x0, 0x0, 0x23, 0x0, kZ);
              (rJ = lq[this[xP(0x909)]] || [xP(0x100), xP(0xadd)]),
                (rF[xP(0xc50)] = this[xP(0x863)](rJ[0x0])),
                rF[xP(0xa90)](),
                (rF[xP(0xdf1)] = this[xP(0x863)](rJ[0x1])),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x6f5)]:
              (rF[xP(0x930)] = 0x4),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xa4b)),
                rH(xP(0x6f5), xP(0x389), xP(0x94a));
              break;
            case cR[xP(0xd16)]:
              rH(xP(0xd16), xP(0xe49), xP(0x6d6));
              break;
            case cR[xP(0xae6)]:
              (rI = this[xP(0x423)] / 0x14), rF[xP(0x5df)](rI, rI);
              !this[xP(0xa28)] && rF[xP(0x5f9)]((pO / 0x64) % 6.28);
              rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rF[xP(0x92a)](0x0, 0xc, 0x14, 0x0),
                rF[xP(0x51f)](),
                (rF[xP(0xd4e)] = rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] *= 0.7),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0xe49))),
                rF[xP(0xa90)](),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x6d6))),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x7dc)]:
              (rF[xP(0x930)] *= 0.7),
                rH(xP(0x7dc), xP(0xdd9), xP(0x33c)),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0.6, 0x0, kZ),
                (rF[xP(0xc50)] = xP(0x664)),
                rF[xP(0xa90)]();
              break;
            case cR[xP(0x331)]:
              (rF[xP(0x930)] *= 0.8), rH(xP(0x331), xP(0xdab), xP(0x434));
              break;
            case cR[xP(0xde9)]:
              (rI = this[xP(0x423)] / 0xa), rF[xP(0x5df)](rI, rI);
              if (!this[xP(0x894)] || pO - this[xP(0x1ec)] > 0x14) {
                this[xP(0x1ec)] = pO;
                const uj = new Path2D();
                for (let uk = 0x0; uk < 0xa; uk++) {
                  const ul = (Math[xP(0x66d)]() * 0x2 - 0x1) * 0x7,
                    um = (Math[xP(0x66d)]() * 0x2 - 0x1) * 0x7;
                  uj[xP(0xc4d)](ul, um), uj[xP(0x660)](ul, um, 0x5, 0x0, kZ);
                }
                this[xP(0x894)] = uj;
              }
              (rF[xP(0xc50)] = this[xP(0x863)](xP(0xbae))),
                rF[xP(0xa90)](this[xP(0x894)]);
              break;
            case cR[xP(0xe66)]:
            case cR[xP(0x6ff)]:
              (rI = this[xP(0x423)] / 0x1e),
                rF[xP(0x5df)](rI, rI),
                rF[xP(0x540)]();
              const ss = 0x1 / 0x3;
              for (let un = 0x0; un < 0x3; un++) {
                const uo = (un / 0x3) * Math["PI"] * 0x2;
                rF[xP(0xc4d)](0x0, 0x0),
                  rF[xP(0x660)](0x0, 0x0, 0x1e, uo, uo + Math["PI"] / 0x3);
              }
              (rF[xP(0xe13)] = xP(0xbb6)),
                (rF[xP(0x930)] = 0xa),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rF[xP(0xc50)] = this[xP(0x863)](
                  this[xP(0x909)] === cR[xP(0xe66)] ? xP(0x904) : xP(0x2dc)
                )),
                rF[xP(0xa90)](),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0x598)]:
              rG(xP(0xcfe), xP(0xc11));
              break;
            case cR[xP(0xb3d)]:
              rG(xP(0xa44), xP(0x4ae));
              break;
            case cR[xP(0xb87)]:
            case cR[xP(0x69e)]:
              rG(xP(0xe49), xP(0x6d6));
              break;
            case cR[xP(0xa19)]:
              (rI = this[xP(0x423)] / 0x14),
                rF[xP(0x5df)](rI, rI),
                rF[xP(0x5f9)](-Math["PI"] / 0x4);
              const st = rF[xP(0x930)];
              (rF[xP(0x930)] *= 1.5),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x14, -0x14 - st),
                rF[xP(0x91a)](-0x14, 0x0),
                rF[xP(0x91a)](0x14, 0x0),
                rF[xP(0x91a)](0x14, 0x14 + st),
                rF[xP(0x5f9)](Math["PI"] / 0x2),
                rF[xP(0xc4d)](-0x14, -0x14 - st),
                rF[xP(0x91a)](-0x14, 0x0),
                rF[xP(0x91a)](0x14, 0x0),
                rF[xP(0x91a)](0x14, 0x14 + st),
                (rF[xP(0xe13)] = rF[xP(0xe13)] = xP(0xa4b)),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0xa2c)]:
              rG(xP(0x75f), xP(0x203));
              break;
            case cR[xP(0x65c)]:
              rG(xP(0xbdc), xP(0x639));
              break;
            case cR[xP(0x5f4)]:
              rG(xP(0x5cc), xP(0xb68));
              break;
            case cR[xP(0xd78)]:
              (rI = this[xP(0x423)] / 0x14),
                rF[xP(0x5df)](rI, rI),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0x14, 0x0, kZ),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x874))),
                rF[xP(0xa90)](),
                rF[xP(0xb63)](),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x7ab))),
                rF[xP(0x5b9)](),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x213))),
                rF[xP(0xa90)]();
              break;
            case cR[xP(0x8b6)]:
              (rI = this[xP(0x423)] / 0x14), rF[xP(0x5df)](rI, rI);
              const su = (up, uq, ur = ![]) => {
                  const xT = xP;
                  (rF[xT(0xe13)] = xT(0xbb6)),
                    (rF[xT(0xdf1)] = this[xT(0x863)](uq)),
                    (rF[xT(0xc50)] = this[xT(0x863)](up)),
                    rF[xT(0x540)](),
                    rF[xT(0x660)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rF[xT(0x5b9)](),
                    rF[xT(0xa90)]();
                },
                sv = (up, uq) => {
                  const xU = xP;
                  rF[xU(0xb1a)](),
                    rF[xU(0xb63)](),
                    (rF[xU(0xe13)] = xU(0xbb6)),
                    (rF[xU(0xc50)] = this[xU(0x863)](up)),
                    (rF[xU(0xdf1)] = this[xU(0x863)](uq)),
                    rF[xU(0xa90)](),
                    rF[xU(0x5b9)](),
                    rF[xU(0xaea)]();
                };
              (rF[xP(0xe13)] = xP(0xbb6)),
                rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                sv(xP(0x874), xP(0x7ab)),
                rF[xP(0x5f9)](Math["PI"]),
                rF[xP(0x540)](),
                rF[xP(0x660)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rF[xP(0x660)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rF[xP(0x660)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                sv(xP(0xe49), xP(0x6d6)),
                rF[xP(0x5f9)](-Math["PI"]),
                rF[xP(0x540)](),
                rF[xP(0x660)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                sv(xP(0x874), xP(0x7ab));
              break;
            case cR[xP(0xca2)]:
              this[xP(0x9a4)](rF, this[xP(0x423)]);
              break;
            case cR[xP(0x622)]:
              (rI = this[xP(0x423)] / 0x28),
                rF[xP(0x5df)](rI, rI),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](-0x1e, -0x1e),
                rF[xP(0x91a)](0x14, 0x0),
                rF[xP(0x91a)](-0x1e, 0x1e),
                rF[xP(0x51f)](),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x874))),
                (rF[xP(0xc50)] = this[xP(0x863)](xP(0x46b))),
                rF[xP(0xa90)](),
                (rF[xP(0x930)] = 0x16),
                (rF[xP(0xe13)] = rF[xP(0xd4e)] = xP(0xbb6)),
                rF[xP(0x5b9)]();
              break;
            case cR[xP(0xe26)]:
              rF[xP(0xd57)](this[xP(0x423)] / 0x41),
                rF[xP(0xbd2)](-0xa, 0xa),
                (rF[xP(0xd4e)] = rF[xP(0xe13)] = xP(0xbb6)),
                rF[xP(0xb1a)](),
                rF[xP(0x540)](),
                rF[xP(0xc4d)](0x1e, 0x0),
                rF[xP(0xbd2)](
                  0x46 -
                    (Math[xP(0xdad)](
                      Date[xP(0x5b6)]() / 0x190 + 0.8 * this[xP(0x205)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rF[xP(0x91a)](0x0, 0x0),
                (rF[xP(0x930)] = 0x2a),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0x8a2))),
                rF[xP(0x5b9)](),
                (rF[xP(0xdf1)] = this[xP(0x863)](xP(0xbff))),
                (rF[xP(0x930)] -= 0xc),
                rF[xP(0x5b9)](),
                rF[xP(0x540)]();
              for (let up = 0x0; up < 0x2; up++) {
                rF[xP(0xc4d)](0x9, 0x7),
                  rF[xP(0x91a)](0x28, 0x14),
                  rF[xP(0x91a)](0x7, 0x9),
                  rF[xP(0x91a)](0x9, 0x7),
                  rF[xP(0x5df)](0x1, -0x1);
              }
              (rF[xP(0x930)] = 0x3),
                (rF[xP(0xc50)] = rF[xP(0xdf1)] = xP(0xa15)),
                rF[xP(0x5b9)](),
                rF[xP(0xa90)](),
                rF[xP(0xaea)](),
                this[xP(0x36b)](rF);
              break;
            case cR[xP(0x8bf)]:
              (rI = this[xP(0x423)] / 0x14), rF[xP(0x5df)](rI, rI);
              const sw = (uq = 0x1, ur, us) => {
                const xV = xP;
                rF[xV(0xb1a)](),
                  rF[xV(0x5df)](0x1, uq),
                  rF[xV(0x540)](),
                  rF[xV(0x7ec)](-0x64, 0x0, 0x12c, -0x12c),
                  rF[xV(0xb63)](),
                  rF[xV(0x540)](),
                  rF[xV(0xc4d)](-0x14, 0x0),
                  rF[xV(0x92a)](-0x12, -0x19, 0x11, -0xf),
                  (rF[xV(0xe13)] = xV(0xbb6)),
                  (rF[xV(0x930)] = 0x16),
                  (rF[xV(0xdf1)] = this[xV(0x863)](us)),
                  rF[xV(0x5b9)](),
                  (rF[xV(0x930)] = 0xe),
                  (rF[xV(0xdf1)] = this[xV(0x863)](ur)),
                  rF[xV(0x5b9)](),
                  rF[xV(0xaea)]();
              };
              sw(0x1, xP(0xc86), xP(0xd73)), sw(-0x1, xP(0x2f5), xP(0x825));
              break;
            default:
              rF[xP(0x540)](),
                rF[xP(0x660)](0x0, 0x0, this[xP(0x423)], 0x0, Math["PI"] * 0x2),
                (rF[xP(0xc50)] = xP(0x64f)),
                rF[xP(0xa90)](),
                pI(rF, this[xP(0x5d7)], 0x14, xP(0xd1d), 0x3);
          }
          rF[xP(0xaea)](), (this[xP(0xc7f)] = null);
        }
        [uu(0xd5c)](rF, rG) {
          const xW = uu;
          rG = rG || pO / 0x12c + this[xW(0x205)] * 0.3;
          const rH = Math[xW(0xdad)](rG) * 0.5 + 0.5;
          rF[xW(0xe13)] = xW(0xbb6);
          const rI = 0x4;
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            rF[xW(0xb1a)]();
            if (rJ === 0x0) rF[xW(0x540)]();
            for (let rK = 0x0; rK < 0x2; rK++) {
              for (let rL = 0x0; rL < rI; rL++) {
                rF[xW(0xb1a)](), rJ > 0x0 && rF[xW(0x540)]();
                const rM = -0.19 - (rL / rI) * Math["PI"] * 0.25;
                rF[xW(0x5f9)](rM + rH * 0.05), rF[xW(0xc4d)](0x0, 0x0);
                const rN = Math[xW(0xdad)](rG + rL);
                rF[xW(0xbd2)](0x1c - (rN * 0.5 + 0.5), 0x0),
                  rF[xW(0x5f9)](rN * 0.08),
                  rF[xW(0x91a)](0x0, 0x0),
                  rF[xW(0x92a)](0x0, 0x7, 5.5, 0xe),
                  rJ > 0x0 &&
                    ((rF[xW(0x930)] = 6.5),
                    (rF[xW(0xdf1)] =
                      xW(0xba2) + (0x2f + (rL / rI) * 0x14) + "%)"),
                    rF[xW(0x5b9)]()),
                  rF[xW(0xaea)]();
              }
              rF[xW(0x5df)](-0x1, 0x1);
            }
            rJ === 0x0 &&
              ((rF[xW(0x930)] = 0x9),
              (rF[xW(0xdf1)] = xW(0x8f0)),
              rF[xW(0x5b9)]()),
              rF[xW(0xaea)]();
          }
          rF[xW(0x540)](),
            rF[xW(0x6f0)](
              0x0,
              -0x1e + Math[xW(0xdad)](rG * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rF[xW(0xdf1)] = xW(0x8f0)),
            (rF[xW(0x930)] = 5.5),
            rF[xW(0x5b9)](),
            (rF[xW(0x3f7)] = 0x5 + rH * 0x8),
            (rF[xW(0xb20)] = xW(0xb9c)),
            (rF[xW(0xdf1)] = rF[xW(0xb20)]),
            (rF[xW(0x930)] = 3.5),
            rF[xW(0x5b9)](),
            (rF[xW(0x3f7)] = 0x0);
        }
        [uu(0x50e)](rF) {
          const xX = uu,
            rG = this[xX(0x1f5)] ? lk[xX(0x32e)] : lk[xX(0xcb6)],
            rH = Date[xX(0x5b6)]() / 0x1f4 + this[xX(0x205)],
            rI = Math[xX(0xdad)](rH) - 0.5;
          rF[xX(0xe13)] = rF[xX(0xd4e)] = xX(0xbb6);
          const rJ = 0x46;
          rF[xX(0xb1a)](), rF[xX(0x540)]();
          for (let rK = 0x0; rK < 0x2; rK++) {
            rF[xX(0xb1a)]();
            const rL = rK * 0x2 - 0x1;
            rF[xX(0x5df)](0x1, rL),
              rF[xX(0xbd2)](0x14, rJ),
              rF[xX(0x5f9)](rI * 0.1),
              rF[xX(0xc4d)](0x0, 0x0),
              rF[xX(0x91a)](-0xa, 0x32),
              rF[xX(0x92a)](0x32, 0x32, 0x64, 0x1e),
              rF[xX(0x92a)](0x32, 0x32, 0x64, 0x1e),
              rF[xX(0x92a)](0x1e, 0x8c, -0x50, 0x78 - rI * 0x14),
              rF[xX(0x92a)](
                -0xa + rI * 0xf,
                0x6e - rI * 0xa,
                -0x28,
                0x50 - rI * 0xa
              ),
              rF[xX(0x92a)](
                -0xa + rI * 0xa,
                0x3c + rI * 0x5,
                -0x3c,
                0x32 - Math[xX(0x9b2)](0x0, rI) * 0xa
              ),
              rF[xX(0x92a)](-0xa, 0x14 - rI * 0xa, -0x46, rI * 0xa),
              rF[xX(0xaea)]();
          }
          (rF[xX(0xc50)] = this[xX(0x863)](rG[xX(0xc38)])),
            rF[xX(0xa90)](),
            (rF[xX(0x930)] = 0x12),
            (rF[xX(0xdf1)] = xX(0x702)),
            rF[xX(0xb63)](),
            rF[xX(0x5b9)](),
            rF[xX(0xaea)](),
            rF[xX(0xb1a)](),
            rF[xX(0xbd2)](0x50, 0x0),
            rF[xX(0x5df)](0x2, 0x2),
            rF[xX(0x540)]();
          for (let rM = 0x0; rM < 0x2; rM++) {
            rF[xX(0x5df)](0x1, -0x1),
              rF[xX(0xb1a)](),
              rF[xX(0xbd2)](0x0, 0xf),
              rF[xX(0x5f9)]((Math[xX(0xdad)](rH * 0x2) * 0.5 + 0.5) * 0.08),
              rF[xX(0xc4d)](0x0, -0x4),
              rF[xX(0x92a)](0xa, 0x0, 0x14, -0x6),
              rF[xX(0x92a)](0xf, 0x3, 0x0, 0x5),
              rF[xX(0xaea)]();
          }
          (rF[xX(0xc50)] = rF[xX(0xdf1)] = xX(0xa15)),
            rF[xX(0xa90)](),
            (rF[xX(0x930)] = 0x6),
            rF[xX(0x5b9)](),
            rF[xX(0xaea)]();
          for (let rN = 0x0; rN < 0x2; rN++) {
            const rO = rN === 0x0;
            rO && rF[xX(0x540)]();
            for (let rP = 0x4; rP >= 0x0; rP--) {
              const rQ = rP / 0x5,
                rR = 0x32 - 0x2d * rQ;
              !rO && rF[xX(0x540)](),
                rF[xX(0x7ec)](
                  -0x50 - rQ * 0x50 - rR / 0x2,
                  -rR / 0x2 +
                    Math[xX(0xdad)](rQ * Math["PI"] * 0x2 + rH * 0x3) *
                      0x8 *
                      rQ,
                  rR,
                  rR
                ),
                !rO &&
                  ((rF[xX(0x930)] = 0x14),
                  (rF[xX(0xc50)] = rF[xX(0xdf1)] =
                    this[xX(0x863)](rG[xX(0x95b)][rP])),
                  rF[xX(0x5b9)](),
                  rF[xX(0xa90)]());
            }
            rO &&
              ((rF[xX(0x930)] = 0x22),
              (rF[xX(0xdf1)] = this[xX(0x863)](rG[xX(0xc67)])),
              rF[xX(0x5b9)]());
          }
          rF[xX(0x540)](),
            rF[xX(0x660)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rF[xX(0xc50)] = this[xX(0x863)](rG[xX(0xd31)])),
            rF[xX(0xa90)](),
            (rF[xX(0x930)] = 0x24),
            (rF[xX(0xdf1)] = xX(0xbc5)),
            rF[xX(0xb1a)](),
            rF[xX(0xb63)](),
            rF[xX(0x5b9)](),
            rF[xX(0xaea)](),
            rF[xX(0xb1a)]();
          for (let rS = 0x0; rS < 0x2; rS++) {
            rF[xX(0x540)]();
            for (let rT = 0x0; rT < 0x2; rT++) {
              rF[xX(0xb1a)]();
              const rU = rT * 0x2 - 0x1;
              rF[xX(0x5df)](0x1, rU),
                rF[xX(0xbd2)](0x14, rJ),
                rF[xX(0x5f9)](rI * 0.1),
                rF[xX(0xc4d)](0x0, 0xa),
                rF[xX(0x91a)](-0xa, 0x32),
                rF[xX(0x92a)](0x32, 0x32, 0x64, 0x1e),
                rF[xX(0x92a)](0x32, 0x32, 0x64, 0x1e),
                rF[xX(0x92a)](0x1e, 0x8c, -0x50, 0x78 - rI * 0x14),
                rF[xX(0xc4d)](0x64, 0x1e),
                rF[xX(0x92a)](0x23, 0x5a, -0x28, 0x50 - rI * 0xa),
                rF[xX(0xc4d)](-0xa, 0x32),
                rF[xX(0x92a)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[xX(0x9b2)](0x0, rI) * 0xa
                ),
                rF[xX(0xaea)]();
            }
            rS === 0x0
              ? ((rF[xX(0x930)] = 0x10),
                (rF[xX(0xdf1)] = this[xX(0x863)](rG[xX(0xd4a)])))
              : ((rF[xX(0x930)] = 0xa),
                (rF[xX(0xdf1)] = this[xX(0x863)](rG[xX(0x7da)]))),
              rF[xX(0x5b9)]();
          }
          rF[xX(0xaea)]();
        }
        [uu(0x2a2)](rF, rG, rH, rI) {
          const xY = uu;
          rF[xY(0xb1a)]();
          const rJ = this[xY(0x423)] / 0x28;
          rF[xY(0x5df)](rJ, rJ),
            (rG = this[xY(0x863)](rG)),
            (rH = this[xY(0x863)](rH)),
            (rI = this[xY(0x863)](rI));
          const rK = Math["PI"] / 0x5;
          rF[xY(0xe13)] = rF[xY(0xd4e)] = xY(0xbb6);
          const rL = Math[xY(0xdad)](
              Date[xY(0x5b6)]() / 0x12c + this[xY(0x205)] * 0.2
            ),
            rM = rL * 0.3 + 0.7;
          rF[xY(0x540)](),
            rF[xY(0x660)](0x16, 0x0, 0x17, 0x0, kZ),
            rF[xY(0xc4d)](0x0, 0x0),
            rF[xY(0x660)](-0x5, 0x0, 0x21, 0x0, kZ),
            (rF[xY(0xc50)] = this[xY(0x863)](xY(0x92b))),
            rF[xY(0xa90)](),
            rF[xY(0xb1a)](),
            rF[xY(0xbd2)](0x12, 0x0);
          for (let rP = 0x0; rP < 0x2; rP++) {
            rF[xY(0xb1a)](),
              rF[xY(0x5df)](0x1, rP * 0x2 - 0x1),
              rF[xY(0x5f9)](Math["PI"] * 0.08 * rM),
              rF[xY(0xbd2)](-0x12, 0x0),
              rF[xY(0x540)](),
              rF[xY(0x660)](0x0, 0x0, 0x28, Math["PI"], -rK),
              rF[xY(0x92a)](0x14 - rM * 0x3, -0xf, 0x14, 0x0),
              rF[xY(0x51f)](),
              (rF[xY(0xc50)] = rG),
              rF[xY(0xa90)]();
            const rQ = xY(0x9de) + rP;
            if (!this[rQ]) {
              const rR = new Path2D();
              for (let rS = 0x0; rS < 0x2; rS++) {
                const rT = (Math[xY(0x66d)]() * 0x2 - 0x1) * 0x28,
                  rU = Math[xY(0x66d)]() * -0x28,
                  rV = Math[xY(0x66d)]() * 0x9 + 0x8;
                rR[xY(0xc4d)](rT, rU), rR[xY(0x660)](rT, rU, rV, 0x0, kZ);
              }
              this[rQ] = rR;
            }
            rF[xY(0xb63)](),
              (rF[xY(0xc50)] = rI),
              rF[xY(0xa90)](this[rQ]),
              rF[xY(0xaea)](),
              (rF[xY(0x930)] = 0x7),
              (rF[xY(0xdf1)] = rH),
              rF[xY(0x5b9)]();
          }
          rF[xY(0xaea)](), rF[xY(0xb1a)]();
          let rN = 0x9;
          rF[xY(0xbd2)](0x2a, 0x0);
          const rO = Math["PI"] * 0x3 - rL;
          rF[xY(0x540)]();
          for (let rW = 0x0; rW < 0x2; rW++) {
            let rX = 0x0,
              rY = 0x8;
            rF[xY(0xc4d)](rX, rY);
            for (let rZ = 0x0; rZ < rN; rZ++) {
              const s0 = rZ / rN,
                s1 = s0 * rO,
                s2 = 0xf * (0x1 - s0),
                s3 = Math[xY(0x85f)](s1) * s2,
                s4 = Math[xY(0xdad)](s1) * s2,
                s5 = rX + s3,
                s6 = rY + s4;
              rF[xY(0x92a)](
                rX + s3 * 0.5 + s4 * 0.25,
                rY + s4 * 0.5 - s3 * 0.25,
                s5,
                s6
              ),
                (rX = s5),
                (rY = s6);
            }
            rF[xY(0x5df)](0x1, -0x1);
          }
          (rF[xY(0xe13)] = rF[xY(0xd4e)] = xY(0xbb6)),
            (rF[xY(0x930)] = 0x2),
            (rF[xY(0xdf1)] = rF[xY(0xc50)]),
            rF[xY(0x5b9)](),
            rF[xY(0xaea)](),
            rF[xY(0xaea)]();
        }
        [uu(0x714)](rF, rG = 0x64, rH = 0x50, rI = 0x12, rJ = 0x8) {
          const xZ = uu;
          rF[xZ(0x540)]();
          const rK = (0x1 / rI) * Math["PI"] * 0x2;
          rF[xZ(0xc4d)](rH, 0x0);
          for (let rL = 0x0; rL < rI; rL++) {
            const rM = rL * rK,
              rN = (rL + 0x1) * rK;
            rF[xZ(0xc0b)](
              Math[xZ(0x85f)](rM) * rG,
              Math[xZ(0xdad)](rM) * rG,
              Math[xZ(0x85f)](rN) * rG,
              Math[xZ(0xdad)](rN) * rG,
              Math[xZ(0x85f)](rN) * rH,
              Math[xZ(0xdad)](rN) * rH
            );
          }
          (rF[xZ(0xc50)] = this[xZ(0x863)](xZ(0x92e))),
            rF[xZ(0xa90)](),
            (rF[xZ(0x930)] = rJ),
            (rF[xZ(0xe13)] = rF[xZ(0xd4e)] = xZ(0xbb6)),
            (rF[xZ(0xdf1)] = this[xZ(0x863)](xZ(0xcb4))),
            rF[xZ(0x5b9)]();
        }
        [uu(0x863)](rF) {
          const y0 = uu,
            rG = 0x1 - this[y0(0x61f)];
          if (
            rG >= 0x1 &&
            this[y0(0x12f)] === 0x0 &&
            !this[y0(0xbac)] &&
            !this[y0(0x959)]
          )
            return rF;
          rF = hz(rF);
          this[y0(0xbac)] &&
            (rF = hx(
              rF,
              [0xff, 0xff, 0xff],
              0.85 + Math[y0(0xdad)](pO / 0x32) * 0.15
            ));
          this[y0(0x12f)] > 0x0 &&
            (rF = hx(rF, [0x8f, 0x5d, 0xb0], 0x1 - this[y0(0x12f)] * 0.75));
          rF = hx(rF, [0xff, 0x0, 0x0], rG * 0.25 + 0.75);
          if (this[y0(0x959)]) {
            if (!this[y0(0xc7f)]) {
              let rH = pO / 0x4;
              if (!isNaN(this["id"])) rH += this["id"];
              this[y0(0xc7f)] = lG(rH % 0x168, 0x64, 0x32);
            }
            rF = hx(rF, this[y0(0xc7f)], 0.75);
          }
          return q0(rF);
        }
        [uu(0xc5d)](rF) {
          const y1 = uu;
          this[y1(0xc7f)] = null;
          if (this[y1(0xda1)]) {
            const rG = Math[y1(0xdad)]((this[y1(0x86c)] * Math["PI"]) / 0x2);
            if (!this[y1(0x44c)]) {
              const rH = 0x1 + rG * 0x1;
              rF[y1(0x5df)](rH, rH);
            }
            rF[y1(0xa46)] *= 0x1 - rG;
          }
        }
        [uu(0x541)](rF, rG = !![], rH = 0x1) {
          const y2 = uu;
          rF[y2(0x540)](),
            (rH = 0x8 * rH),
            rF[y2(0xc4d)](0x23, -rH),
            rF[y2(0x92a)](0x33, -0x2 - rH, 0x3c, -0xc - rH),
            rF[y2(0x91a)](0x23, -rH),
            rF[y2(0xc4d)](0x23, rH),
            rF[y2(0x92a)](0x33, 0x2 + rH, 0x3c, 0xc + rH),
            rF[y2(0x91a)](0x23, rH);
          const rI = y2(0x874);
          (rF[y2(0xc50)] = rF[y2(0xdf1)] =
            rG ? this[y2(0x863)](rI) : y2(0x874)),
            rF[y2(0xa90)](),
            (rF[y2(0xe13)] = rF[y2(0xd4e)] = y2(0xbb6)),
            (rF[y2(0x930)] = 0x4),
            rF[y2(0x5b9)]();
        }
        [uu(0x9a4)](rF, rG, rH = 0x1) {
          const y3 = uu,
            rI = (rG / 0x1e) * 1.1;
          rF[y3(0x5df)](rI, rI),
            rF[y3(0x540)](),
            rF[y3(0xc4d)](-0x1e, -0x11),
            rF[y3(0x91a)](0x1e, 0x0),
            rF[y3(0x91a)](-0x1e, 0x11),
            rF[y3(0x51f)](),
            (rF[y3(0xc50)] = rF[y3(0xdf1)] = this[y3(0x863)](y3(0x874))),
            rF[y3(0xa90)](),
            (rF[y3(0x930)] = 0x14 * rH),
            (rF[y3(0xe13)] = rF[y3(0xd4e)] = y3(0xbb6)),
            rF[y3(0x5b9)]();
        }
        [uu(0x856)](rF, rG = 0x0, rH = 0x0, rI = 0x1, rJ = 0x5) {
          const y4 = uu;
          rF[y4(0xb1a)](),
            rF[y4(0xbd2)](rG, rH),
            rF[y4(0x5df)](rI, rI),
            rF[y4(0x540)](),
            rF[y4(0xc4d)](0x23, -0x8),
            rF[y4(0x92a)](0x34, -5.5, 0x3c, -0x14),
            rF[y4(0xc4d)](0x23, 0x8),
            rF[y4(0x92a)](0x34, 5.5, 0x3c, 0x14),
            (rF[y4(0xc50)] = rF[y4(0xdf1)] = this[y4(0x863)](y4(0x874))),
            (rF[y4(0xe13)] = rF[y4(0xd4e)] = y4(0xbb6)),
            (rF[y4(0x930)] = rJ),
            rF[y4(0x5b9)](),
            rF[y4(0x540)]();
          const rK = Math["PI"] * 0.165;
          rF[y4(0x6f0)](0x3c, -0x14, 0x7, 0x9, rK, 0x0, kZ),
            rF[y4(0x6f0)](0x3c, 0x14, 0x7, 0x9, -rK, 0x0, kZ),
            rF[y4(0xa90)](),
            rF[y4(0xaea)]();
        }
      },
      lG = (rF, rG, rH) => {
        const y5 = uu;
        (rG /= 0x64), (rH /= 0x64);
        const rI = (rL) => (rL + rF / 0x1e) % 0xc,
          rJ = rG * Math[y5(0xd8d)](rH, 0x1 - rH),
          rK = (rL) =>
            rH -
            rJ *
              Math[y5(0x9b2)](
                -0x1,
                Math[y5(0xd8d)](
                  rI(rL) - 0x3,
                  Math[y5(0xd8d)](0x9 - rI(rL), 0x1)
                )
              );
        return [0xff * rK(0x0), 0xff * rK(0x8), 0xff * rK(0x4)];
      };
    function lH(rF) {
      const y6 = uu;
      return -(Math[y6(0x85f)](Math["PI"] * rF) - 0x1) / 0x2;
    }
    function lI(rF, rG, rH = 0x6, rI = uu(0xd1d)) {
      const y7 = uu,
        rJ = rG / 0x64;
      rF[y7(0x5df)](rJ, rJ), rF[y7(0x540)]();
      for (let rK = 0x0; rK < 0xc; rK++) {
        rF[y7(0xc4d)](0x0, 0x0);
        const rL = (rK / 0xc) * Math["PI"] * 0x2;
        rF[y7(0x91a)](Math[y7(0x85f)](rL) * 0x64, Math[y7(0xdad)](rL) * 0x64);
      }
      (rF[y7(0x930)] = rH),
        (rF[y7(0xc50)] = rF[y7(0xdf1)] = rI),
        (rF[y7(0xe13)] = rF[y7(0xd4e)] = y7(0xbb6));
      for (let rM = 0x0; rM < 0x5; rM++) {
        const rN = (rM / 0x5) * 0x64 + 0xa;
        la(rF, 0xc, rN, 0.5, 0.85);
      }
      rF[y7(0x5b9)]();
    }
    var lJ = class {
        constructor(rF, rG, rH, rI, rJ) {
          const y8 = uu;
          (this[y8(0x909)] = rF),
            (this["id"] = rG),
            (this["x"] = rH),
            (this["y"] = rI),
            (this[y8(0x423)] = rJ),
            (this[y8(0x6b8)] = Math[y8(0x66d)]() * kZ),
            (this[y8(0x8f6)] = -0x1),
            (this[y8(0xda1)] = ![]),
            (this[y8(0x4b1)] = 0x0),
            (this[y8(0x86c)] = 0x0),
            (this[y8(0x17e)] = !![]),
            (this[y8(0xb29)] = 0x0),
            (this[y8(0xdb2)] = !![]);
        }
        [uu(0x630)]() {
          const y9 = uu;
          if (this[y9(0x4b1)] < 0x1) {
            this[y9(0x4b1)] += pP / 0xc8;
            if (this[y9(0x4b1)] > 0x1) this[y9(0x4b1)] = 0x1;
          }
          this[y9(0xda1)] && (this[y9(0x86c)] += pP / 0xc8);
        }
        [uu(0xd6f)](rF) {
          const ya = uu;
          rF[ya(0xb1a)](), rF[ya(0xbd2)](this["x"], this["y"]);
          if (this[ya(0x909)] === cR[ya(0x2b1)]) {
            rF[ya(0x5f9)](this[ya(0x6b8)]);
            const rG = this[ya(0x423)],
              rH = pF(
                rF,
                ya(0x526) + this[ya(0x423)],
                rG * 2.2,
                rG * 2.2,
                (rJ) => {
                  const yb = ya;
                  rJ[yb(0xbd2)](rG * 1.1, rG * 1.1), lI(rJ, rG);
                },
                !![]
              ),
              rI = this[ya(0x4b1)] + this[ya(0x86c)] * 0.5;
            (rF[ya(0xa46)] = (0x1 - this[ya(0x86c)]) * 0.3),
              rF[ya(0x5df)](rI, rI),
              rF[ya(0xc9d)](
                rH,
                -rH[ya(0x5a3)] / 0x2,
                -rH[ya(0xd81)] / 0x2,
                rH[ya(0x5a3)],
                rH[ya(0xd81)]
              );
          } else {
            if (this[ya(0x909)] === cR[ya(0xc52)]) {
              let rJ = this[ya(0x4b1)] + this[ya(0x86c)] * 0.5;
              (rF[ya(0xa46)] = 0x1 - this[ya(0x86c)]), (rF[ya(0xa46)] *= 0.9);
              const rK =
                0.93 +
                0.07 *
                  (Math[ya(0xdad)](
                    Date[ya(0x5b6)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              rJ *= rK;
              const rL = this[ya(0x423)],
                rM = pF(
                  rF,
                  ya(0x2c1) + this[ya(0x423)],
                  rL * 2.2,
                  rL * 2.2,
                  (rN) => {
                    const yc = ya;
                    rN[yc(0xbd2)](rL * 1.1, rL * 1.1);
                    const rO = rL / 0x64;
                    rN[yc(0x5df)](rO, rO),
                      lD(rN, 0x5c),
                      (rN[yc(0xd4e)] = rN[yc(0xe13)] = yc(0xbb6)),
                      (rN[yc(0x930)] = 0x28),
                      (rN[yc(0xdf1)] = yc(0x811)),
                      rN[yc(0x5b9)](),
                      (rN[yc(0xc50)] = yc(0x853)),
                      (rN[yc(0xdf1)] = yc(0xdda)),
                      (rN[yc(0x930)] = 0xe),
                      rN[yc(0xa90)](),
                      rN[yc(0x5b9)]();
                  },
                  !![]
                );
              rF[ya(0x5df)](rJ, rJ),
                rF[ya(0xc9d)](
                  rM,
                  -rM[ya(0x5a3)] / 0x2,
                  -rM[ya(0xd81)] / 0x2,
                  rM[ya(0x5a3)],
                  rM[ya(0xd81)]
                );
            } else {
              if (this[ya(0x909)] === cR[ya(0x5c7)]) {
                rF[ya(0xd57)](this[ya(0x423)] / 0x32),
                  (rF[ya(0xd4e)] = ya(0xbb6)),
                  rF[ya(0xb1a)](),
                  (this[ya(0xb29)] +=
                    ((this[ya(0x8f6)] >= 0x0 ? 0x1 : -0x1) * pP) / 0x12c),
                  (this[ya(0xb29)] = Math[ya(0xd8d)](
                    0x1,
                    Math[ya(0x9b2)](0x0, this[ya(0xb29)])
                  ));
                if (this[ya(0xb29)] > 0x0) {
                  rF[ya(0xd57)](this[ya(0xb29)]),
                    (rF[ya(0xa46)] *= this[ya(0xb29)]),
                    (rF[ya(0x930)] = 0.1),
                    (rF[ya(0xdf1)] = rF[ya(0xc50)] = ya(0xa04)),
                    (rF[ya(0x509)] = ya(0x8de)),
                    (rF[ya(0x6df)] = ya(0x111) + iz);
                  const rO = ya(0x6a2) + (this[ya(0x8f6)] + 0x1);
                  lQ(
                    rF,
                    rO,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rO[ya(0xc60)] * 0.09),
                    !![]
                  );
                }
                rF[ya(0xaea)]();
                const rN = this[ya(0xa28)]
                  ? 0.6
                  : ((this["id"] + Date[ya(0x5b6)]()) / 0x4b0) % 6.28;
                rF[ya(0xb1a)]();
                for (let rP = 0x0; rP < 0x8; rP++) {
                  const rQ = 0x1 - rP / 0x8,
                    rR = rQ * 0x50;
                  rF[ya(0x5f9)](rN),
                    (rF[ya(0xdf1)] = ya(0xc76)),
                    rF[ya(0x540)](),
                    rF[ya(0x7ec)](-rR / 0x2, -rR / 0x2, rR, rR),
                    rF[ya(0x51f)](),
                    (rF[ya(0x930)] = 0x28),
                    rF[ya(0x5b9)](),
                    (rF[ya(0x930)] = 0x14),
                    rF[ya(0x5b9)]();
                }
                rF[ya(0xaea)]();
                if (!this[ya(0x24b)]) {
                  this[ya(0x24b)] = [];
                  for (let rS = 0x0; rS < 0x1e; rS++) {
                    this[ya(0x24b)][ya(0x7b8)]({
                      x: Math[ya(0x66d)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rT = 0x0; rT < this[ya(0x24b)][ya(0xc60)]; rT++) {
                  const rU = this[ya(0x24b)][rT];
                  (rU["x"] += rU["v"]),
                    rU["x"] > 0x1 &&
                      ((rU["x"] %= 0x1),
                      (rU[ya(0x6b8)] = Math[ya(0x66d)]() * 6.28),
                      (rU["v"] = Math[ya(0x66d)]() * 0.005 + 0.008),
                      (rU["s"] = Math[ya(0x66d)]() * 0.025 + 0.008)),
                    rF[ya(0xb1a)](),
                    (rF[ya(0xa46)] =
                      rU["x"] < 0.2
                        ? rU["x"] / 0.2
                        : rU["x"] > 0.8
                        ? 0x1 - (rU["x"] - 0.8) / 0.2
                        : 0x1),
                    rF[ya(0x5df)](0x5a, 0x5a),
                    rF[ya(0x5f9)](rU[ya(0x6b8)]),
                    rF[ya(0xbd2)](rU["x"], 0x0),
                    rF[ya(0x540)](),
                    rF[ya(0x660)](0x0, 0x0, rU["s"], 0x0, Math["PI"] * 0x2),
                    (rF[ya(0xc50)] = ya(0xa04)),
                    rF[ya(0xa90)](),
                    rF[ya(0xaea)]();
                }
              }
            }
          }
          rF[ya(0xaea)]();
        }
      },
      lK = 0x0,
      lL = 0x0,
      lM = class extends lJ {
        constructor(rF, rG, rH, rI) {
          const yd = uu;
          super(cR[yd(0x8a6)], rF, rG, rH, 0x46),
            (this[yd(0x6b8)] = (Math[yd(0x66d)]() * 0x2 - 0x1) * 0.2),
            (this[yd(0xd7f)] = dB[rI]);
        }
        [uu(0x630)]() {
          const ye = uu;
          if (this[ye(0x4b1)] < 0x2 || pO - lK < 0x9c4) {
            this[ye(0x4b1)] += pP / 0x12c;
            return;
          }
          this[ye(0xda1)] && (this[ye(0x86c)] += pP / 0xc8),
            this[ye(0x6a9)] &&
              ((this["x"] = pv(this["x"], this[ye(0x6a9)]["x"], 0xc8)),
              (this["y"] = pv(this["y"], this[ye(0x6a9)]["y"], 0xc8)));
        }
        [uu(0xd6f)](rF) {
          const yf = uu;
          if (this[yf(0x4b1)] === 0x0) return;
          rF[yf(0xb1a)](), rF[yf(0xbd2)](this["x"], this["y"]);
          const rG = yf(0x99f) + this[yf(0xd7f)]["id"];
          let rH =
            (this[yf(0xbb2)] || lL < 0x3) &&
            pF(
              rF,
              rG,
              0x78,
              0x78,
              (rK) => {
                const yg = yf;
                (this[yg(0xbb2)] = !![]),
                  lL++,
                  rK[yg(0xbd2)](0x3c, 0x3c),
                  (rK[yg(0xe13)] = rK[yg(0xd4e)] = yg(0xbb6)),
                  rK[yg(0x540)](),
                  rK[yg(0x7ec)](-0x32, -0x32, 0x64, 0x64),
                  (rK[yg(0x930)] = 0x12),
                  (rK[yg(0xdf1)] = yg(0x6cf)),
                  rK[yg(0x5b9)](),
                  (rK[yg(0x930)] = 0x8),
                  (rK[yg(0xc50)] = hP[this[yg(0xd7f)][yg(0x308)]]),
                  rK[yg(0xa90)](),
                  (rK[yg(0xdf1)] = hQ[this[yg(0xd7f)][yg(0x308)]]),
                  rK[yg(0x5b9)]();
                const rL = pI(
                  rK,
                  this[yg(0xd7f)][yg(0x1a6)],
                  0x12,
                  yg(0xd1d),
                  0x3,
                  !![]
                );
                rK[yg(0xc9d)](
                  rL,
                  -rL[yg(0x5a3)] / 0x2,
                  0x32 - 0xd / 0x2 - rL[yg(0xd81)],
                  rL[yg(0x5a3)],
                  rL[yg(0xd81)]
                ),
                  rK[yg(0xb1a)](),
                  rK[yg(0xbd2)](
                    0x0 + this[yg(0xd7f)][yg(0xd01)],
                    -0x5 + this[yg(0xd7f)][yg(0xcc8)]
                  ),
                  this[yg(0xd7f)][yg(0x231)](rK),
                  rK[yg(0xaea)]();
              },
              !![]
            );
          if (!rH) rH = pE[rG];
          rF[yf(0x5f9)](this[yf(0x6b8)]);
          const rI = Math[yf(0xd8d)](this[yf(0x4b1)], 0x1),
            rJ =
              (this[yf(0x423)] / 0x64) *
              (0x1 +
                Math[yf(0xdad)](Date[yf(0x5b6)]() / 0xfa + this["id"]) * 0.05) *
              rI *
              (0x1 - this[yf(0x86c)]);
          rF[yf(0x5df)](rJ, rJ),
            rF[yf(0x5f9)](Math["PI"] * lH(0x1 - rI)),
            rH
              ? rF[yf(0xc9d)](
                  rH,
                  -rH[yf(0x5a3)] / 0x2,
                  -rH[yf(0xd81)] / 0x2,
                  rH[yf(0x5a3)],
                  rH[yf(0xd81)]
                )
              : (rF[yf(0x540)](),
                rF[yf(0x7ec)](-0x3c, -0x3c, 0x78, 0x78),
                (rF[yf(0xc50)] = hP[this[yf(0xd7f)][yf(0x308)]]),
                rF[yf(0xa90)]()),
            rF[yf(0xaea)]();
        }
      };
    function lN(rF) {
      const yh = uu;
      rF[yh(0x540)](),
        rF[yh(0xc4d)](0x0, 4.5),
        rF[yh(0x92a)](3.75, 0x0, 0x0, -4.5),
        rF[yh(0x92a)](-3.75, 0x0, 0x0, 4.5),
        rF[yh(0x51f)](),
        (rF[yh(0xe13)] = rF[yh(0xd4e)] = yh(0xbb6)),
        (rF[yh(0xc50)] = rF[yh(0xdf1)] = yh(0xa15)),
        (rF[yh(0x930)] = 0x1),
        rF[yh(0x5b9)](),
        rF[yh(0xa90)](),
        rF[yh(0xb63)](),
        rF[yh(0x540)](),
        rF[yh(0x660)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, kZ),
        (rF[yh(0xc50)] = yh(0xdfd)),
        rF[yh(0xa90)]();
    }
    function lO(rF, rG = ![]) {
      const yi = uu;
      lP(rF, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lP(rF, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rG) {
        const rH = Math["PI"] / 0x7;
        rF[yi(0x540)](),
          rF[yi(0x660)](0x0, 0x0, 23.5, Math["PI"] + rH, Math["PI"] * 0x2 - rH),
          (rF[yi(0xdf1)] = yi(0x15f)),
          (rF[yi(0x930)] = 0x4),
          (rF[yi(0xe13)] = yi(0xbb6)),
          rF[yi(0x5b9)]();
      }
    }
    function lP(rF, rG, rH) {
      const yj = uu;
      rF[yj(0xb1a)](),
        rF[yj(0x5f9)](rG),
        rF[yj(0xbd2)](0x0, -23.6),
        rF[yj(0x5f9)](rH),
        rF[yj(0x540)](),
        rF[yj(0xc4d)](-6.5, 0x1),
        rF[yj(0x91a)](0x0, -0xf),
        rF[yj(0x91a)](6.5, 0x1),
        (rF[yj(0xc50)] = yj(0xce6)),
        (rF[yj(0x930)] = 3.5),
        rF[yj(0xa90)](),
        (rF[yj(0xd4e)] = yj(0xbb6)),
        (rF[yj(0xdf1)] = yj(0x15f)),
        rF[yj(0x5b9)](),
        rF[yj(0xaea)]();
    }
    function lQ(rF, rG, rH, rI, rJ, rK, rL = ![]) {
      const yk = uu;
      var rM = rG[yk(0xc60)],
        rN;
      rF[yk(0xb1a)](),
        rF[yk(0xbd2)](rH, rI),
        rF[yk(0x5f9)]((0x1 * rK) / 0x2),
        rF[yk(0x5f9)]((0x1 * (rK / rM)) / 0x2),
        (rF[yk(0x797)] = yk(0x762));
      for (var rO = 0x0; rO < rM; rO++) {
        rF[yk(0x5f9)](-rK / rM),
          rF[yk(0xb1a)](),
          rF[yk(0xbd2)](0x0, rJ),
          (rN = rG[rO]),
          rL && rF[yk(0x505)](rN, 0x0, 0x0),
          rF[yk(0xae5)](rN, 0x0, 0x0),
          rF[yk(0xaea)]();
      }
      rF[yk(0xaea)]();
    }
    function lR(rF, rG = 0x1) {
      const yl = uu,
        rH = 0xf;
      rF[yl(0x540)]();
      const rI = 0x6;
      for (let rN = 0x0; rN < rI; rN++) {
        const rO = (rN / rI) * Math["PI"] * 0x2;
        rF[yl(0x91a)](Math[yl(0x85f)](rO) * rH, Math[yl(0xdad)](rO) * rH);
      }
      rF[yl(0x51f)](),
        (rF[yl(0x930)] = 0x4),
        (rF[yl(0xdf1)] = yl(0xc9b)),
        rF[yl(0x5b9)](),
        (rF[yl(0xc50)] = yl(0x3ee)),
        rF[yl(0xa90)]();
      const rJ = (Math["PI"] * 0x2) / rI,
        rK = Math[yl(0x85f)](rJ) * rH,
        rL = Math[yl(0xdad)](rJ) * rH;
      for (let rP = 0x0; rP < rI; rP++) {
        rF[yl(0x540)](),
          rF[yl(0xc4d)](0x0, 0x0),
          rF[yl(0x91a)](rH, 0x0),
          rF[yl(0x91a)](rK, rL),
          rF[yl(0x51f)](),
          (rF[yl(0xc50)] =
            yl(0xc31) + (0.2 + (((rP + 0x4) % rI) / rI) * 0.35) + ")"),
          rF[yl(0xa90)](),
          rF[yl(0x5f9)](rJ);
      }
      rF[yl(0x540)]();
      const rM = rH * 0.65;
      for (let rQ = 0x0; rQ < rI; rQ++) {
        const rR = (rQ / rI) * Math["PI"] * 0x2;
        rF[yl(0x91a)](Math[yl(0x85f)](rR) * rM, Math[yl(0xdad)](rR) * rM);
      }
      (rF[yl(0x3f7)] = 0x23 + rG * 0xf),
        (rF[yl(0xb20)] = rF[yl(0xc50)] = yl(0xd00)),
        rF[yl(0xa90)](),
        rF[yl(0xa90)](),
        rF[yl(0xa90)]();
    }
    var lS = class extends lF {
        constructor(rF, rG, rH, rI, rJ, rK, rL) {
          const ym = uu;
          super(rF, cR[ym(0xbfd)], rG, rH, rI, rL, rJ),
            (this[ym(0x4c5)] = rK),
            (this[ym(0x474)] = 0x0),
            (this[ym(0xa8d)] = 0x0),
            (this[ym(0x9c2)] = 0x0),
            (this[ym(0x3e9)] = 0x0),
            (this[ym(0xbfe)] = ""),
            (this[ym(0xe56)] = 0x0),
            (this[ym(0xd75)] = !![]),
            (this[ym(0xe1e)] = ![]),
            (this[ym(0x908)] = ![]),
            (this[ym(0x932)] = ![]),
            (this[ym(0x890)] = ![]),
            (this[ym(0xde5)] = ![]),
            (this[ym(0x250)] = !![]),
            (this[ym(0xbd6)] = 0x0),
            (this[ym(0x6d8)] = 0x0);
        }
        [uu(0x630)]() {
          const yn = uu;
          super[yn(0x630)]();
          if (this[yn(0xda1)]) (this[yn(0xa8d)] = 0x1), (this[yn(0x474)] = 0x0);
          else {
            const rF = pP / 0xc8;
            let rG = this[yn(0x4c5)];
            if (this[yn(0xe1e)] && rG === cX[yn(0x4a1)]) rG = cX[yn(0xb59)];
            (this[yn(0x474)] = Math[yn(0xd8d)](
              0x1,
              Math[yn(0x9b2)](
                0x0,
                this[yn(0x474)] + (rG === cX[yn(0x2f7)] ? rF : -rF)
              )
            )),
              (this[yn(0xa8d)] = Math[yn(0xd8d)](
                0x1,
                Math[yn(0x9b2)](
                  0x0,
                  this[yn(0xa8d)] + (rG === cX[yn(0xb59)] ? rF : -rF)
                )
              )),
              (this[yn(0xbd6)] = pv(this[yn(0xbd6)], this[yn(0x6d8)], 0x64));
          }
        }
        [uu(0xd6f)](rF) {
          const yo = uu;
          rF[yo(0xb1a)](), rF[yo(0xbd2)](this["x"], this["y"]);
          let rG = this[yo(0x423)] / kY;
          this[yo(0xda1)] &&
            rF[yo(0x5f9)]((this[yo(0x86c)] * Math["PI"]) / 0x4);
          rF[yo(0x5df)](rG, rG), this[yo(0xc5d)](rF);
          this[yo(0x35c)] &&
            (rF[yo(0xb1a)](),
            rF[yo(0x5f9)](this[yo(0x6b8)]),
            rF[yo(0xd57)](this[yo(0x423)] / 0x28 / rG),
            this[yo(0x387)](rF),
            rF[yo(0xaea)]());
          this[yo(0x31e)] &&
            (rF[yo(0xb1a)](),
            rF[yo(0xd57)](kY / 0x12),
            this[yo(0xd5c)](rF, pO / 0x12c),
            rF[yo(0xaea)]());
          const rH = yo(0x15f);
          if (this[yo(0x25a)]) {
            const rT = Date[yo(0x5b6)](),
              rU = (Math[yo(0xdad)](rT / 0x12c) * 0.5 + 0.5) * 0x2;
            rF[yo(0x540)](),
              rF[yo(0xc4d)](0x5, -0x22),
              rF[yo(0xc0b)](0x2f, -0x19, 0x14, 0x5, 0x2b - rU, 0x19),
              rF[yo(0x92a)](0x0, 0x28 + rU * 0.6, -0x2b + rU, 0x19),
              rF[yo(0xc0b)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rF[yo(0x92a)](0x0, -0x23, 0x5, -0x22),
              (rF[yo(0xc50)] = rH),
              rF[yo(0xa90)]();
          }
          this[yo(0xde5)] && lO(rF);
          const rI = {};
          rI[yo(0x360)] = [yo(0x75d), yo(0xa60)];
          const rJ = rI,
            rK = this[yo(0x890)]
              ? [yo(0x92b), yo(0x874)]
              : this[yo(0x7a5)]
              ? [yo(0x9d7), yo(0xa81)]
              : rJ[this[yo(0xda2)]] || [yo(0xcfe), yo(0xc11)];
          (rK[0x0] = this[yo(0x863)](rK[0x0])),
            (rK[0x1] = this[yo(0x863)](rK[0x1]));
          let rL = 2.75;
          !this[yo(0x7a5)] && (rL /= rG);
          (rF[yo(0xc50)] = rK[0x0]),
            (rF[yo(0x930)] = rL),
            (rF[yo(0xdf1)] = rK[0x1]);
          this[yo(0x7a5)] &&
            (rF[yo(0x540)](),
            rF[yo(0xc4d)](0x0, 0x0),
            rF[yo(0x92a)](-0x1e, 0xf, -0x1e, 0x1e),
            rF[yo(0x92a)](0x0, 0x37, 0x1e, 0x1e),
            rF[yo(0x92a)](0x1e, 0xf, 0x0, 0x0),
            rF[yo(0xa90)](),
            rF[yo(0x5b9)](),
            rF[yo(0xb1a)](),
            (rF[yo(0xc50)] = rF[yo(0xdf1)]),
            (rF[yo(0x509)] = yo(0x8de)),
            (rF[yo(0x6df)] = yo(0x299) + iz),
            lQ(rF, yo(0xbdd), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rF[yo(0xaea)]());
          rF[yo(0x540)]();
          this[yo(0xcc7)]
            ? !this[yo(0x25a)]
              ? rF[yo(0x7ec)](-0x19, -0x19, 0x32, 0x32)
              : (rF[yo(0xc4d)](0x19, 0x19),
                rF[yo(0x91a)](-0x19, 0x19),
                rF[yo(0x91a)](-0x19, -0xa),
                rF[yo(0x91a)](-0xa, -0x19),
                rF[yo(0x91a)](0xa, -0x19),
                rF[yo(0x91a)](0x19, -0xa),
                rF[yo(0x51f)]())
            : rF[yo(0x660)](0x0, 0x0, kY, 0x0, kZ);
          rF[yo(0xa90)](), rF[yo(0x5b9)]();
          this[yo(0x663)] &&
            (rF[yo(0xb1a)](),
            rF[yo(0xb63)](),
            rF[yo(0x540)](),
            !this[yo(0x25a)] &&
              (rF[yo(0xc4d)](-0x8, -0x1e),
              rF[yo(0x91a)](0xf, -0x7),
              rF[yo(0x91a)](0x1e, -0x14),
              rF[yo(0x91a)](0x1e, -0x32)),
            rF[yo(0xbd2)](
              0x0,
              0x2 * (0x1 - (this[yo(0xa8d)] + this[yo(0x474)]))
            ),
            rF[yo(0xc4d)](-0x2, 0x0),
            rF[yo(0x91a)](-0x3, 4.5),
            rF[yo(0x91a)](0x3, 4.5),
            rF[yo(0x91a)](0x2, 0x0),
            (rF[yo(0xc50)] = yo(0xa15)),
            rF[yo(0xa90)](),
            rF[yo(0xaea)]());
          this[yo(0x25a)] &&
            (rF[yo(0x540)](),
            rF[yo(0xc4d)](0x0, -0x17),
            rF[yo(0x92a)](0x4, -0xd, 0x1b, -0x8),
            rF[yo(0x91a)](0x14, -0x1c),
            rF[yo(0x91a)](-0x14, -0x1c),
            rF[yo(0x91a)](-0x1b, -0x8),
            rF[yo(0x92a)](-0x4, -0xd, 0x0, -0x17),
            (rF[yo(0xc50)] = rH),
            rF[yo(0xa90)]());
          if (this[yo(0x152)]) {
            (rF[yo(0xdf1)] = yo(0x7b4)),
              (rF[yo(0x930)] = 1.4),
              rF[yo(0x540)](),
              (rF[yo(0xe13)] = yo(0xbb6));
            const rV = 4.5;
            for (let rW = 0x0; rW < 0x2; rW++) {
              const rX = -0x12 + rW * 0x1d;
              for (let rY = 0x0; rY < 0x3; rY++) {
                const rZ = rX + rY * 0x3;
                rF[yo(0xc4d)](rZ, rV + -1.5), rF[yo(0x91a)](rZ + 1.6, rV + 1.6);
              }
            }
            rF[yo(0x5b9)]();
          }
          if (this[yo(0x1d9)]) {
            rF[yo(0x540)](),
              rF[yo(0x660)](0x0, 2.5, 3.3, 0x0, kZ),
              (rF[yo(0xc50)] = yo(0xad6)),
              rF[yo(0xa90)](),
              rF[yo(0x540)](),
              rF[yo(0x660)](0xd, 2.8, 5.5, 0x0, kZ),
              rF[yo(0x660)](-0xd, 2.8, 5.5, 0x0, kZ),
              (rF[yo(0xc50)] = yo(0xa88)),
              rF[yo(0xa90)](),
              rF[yo(0xb1a)](),
              rF[yo(0x5f9)](-Math["PI"] / 0x4),
              rF[yo(0x540)]();
            const s0 = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[yo(0xcc7)] &&
              s0[yo(0xa2e)]((s1) => {
                (s1[0x0] *= 1.1), (s1[0x1] *= 1.1);
              });
            for (let s1 = 0x0; s1 < 0x2; s1++) {
              for (let s2 = 0x0; s2 < s0[yo(0xc60)]; s2++) {
                const s3 = s0[s2];
                rF[yo(0xc4d)](s3[0x0], s3[0x1]), rF[yo(0x660)](...s3, 0x0, kZ);
              }
              rF[yo(0x5f9)](-Math["PI"] / 0x2);
            }
            (rF[yo(0xc50)] = yo(0x89d)), rF[yo(0xa90)](), rF[yo(0xaea)]();
          }
          const rM = this[yo(0x474)],
            rN = this[yo(0xa8d)],
            rO = 0x6 * rM,
            rP = 0x4 * rN;
          function rQ(s4, s5) {
            const yp = yo;
            rF[yp(0x540)]();
            const s6 = 3.25;
            rF[yp(0xc4d)](s4 - s6, s5 - s6),
              rF[yp(0x91a)](s4 + s6, s5 + s6),
              rF[yp(0xc4d)](s4 + s6, s5 - s6),
              rF[yp(0x91a)](s4 - s6, s5 + s6),
              (rF[yp(0x930)] = 0x2),
              (rF[yp(0xe13)] = yp(0xbb6)),
              (rF[yp(0xdf1)] = yp(0xa15)),
              rF[yp(0x5b9)](),
              rF[yp(0x51f)]();
          }
          function rR(s4, s5) {
            const yq = yo;
            rF[yq(0xb1a)](),
              rF[yq(0xbd2)](s4, s5),
              rF[yq(0x540)](),
              rF[yq(0xc4d)](-0x4, 0x0),
              rF[yq(0x92a)](0x0, 0x6, 0x4, 0x0),
              (rF[yq(0x930)] = 0x2),
              (rF[yq(0xe13)] = yq(0xbb6)),
              (rF[yq(0xdf1)] = yq(0xa15)),
              rF[yq(0x5b9)](),
              rF[yq(0xaea)]();
          }
          if (this[yo(0xda1)]) rQ(0x7, -0x5), rQ(-0x7, -0x5);
          else {
            if (this[yo(0x9a0)]) rR(0x7, -0x5), rR(-0x7, -0x5);
            else {
              let s4 = function (s6, s7, s8, s9, sa = 0x0) {
                  const yr = yo,
                    sb = sa ^ 0x1;
                  rF[yr(0xc4d)](s6 - s8, s7 - s9 + sa * rO + sb * rP),
                    rF[yr(0x91a)](s6 + s8, s7 - s9 + sb * rO + sa * rP),
                    rF[yr(0x91a)](s6 + s8, s7 + s9),
                    rF[yr(0x91a)](s6 - s8, s7 + s9),
                    rF[yr(0x91a)](s6 - s8, s7 - s9);
                },
                s5 = function (s6 = 0x0) {
                  const ys = yo;
                  rF[ys(0x540)](),
                    rF[ys(0x6f0)](0x7, -0x5, 2.5 + s6, 0x6 + s6, 0x0, 0x0, kZ),
                    rF[ys(0xc4d)](-0x7, -0x5),
                    rF[ys(0x6f0)](-0x7, -0x5, 2.5 + s6, 0x6 + s6, 0x0, 0x0, kZ),
                    (rF[ys(0xdf1)] = rF[ys(0xc50)] = ys(0xa15)),
                    rF[ys(0xa90)]();
                };
              rF[yo(0xb1a)](),
                rF[yo(0x540)](),
                s4(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                s4(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rF[yo(0xb63)](),
                s5(0.7),
                s5(0x0),
                rF[yo(0xb63)](),
                rF[yo(0x540)](),
                rF[yo(0x660)](
                  0x7 + this[yo(0x9c2)] * 0x2,
                  -0x5 + this[yo(0x3e9)] * 3.5,
                  3.1,
                  0x0,
                  kZ
                ),
                rF[yo(0xc4d)](-0x7, -0x5),
                rF[yo(0x660)](
                  -0x7 + this[yo(0x9c2)] * 0x2,
                  -0x5 + this[yo(0x3e9)] * 3.5,
                  3.1,
                  0x0,
                  kZ
                ),
                (rF[yo(0xc50)] = yo(0xdfd)),
                rF[yo(0xa90)](),
                rF[yo(0xaea)]();
            }
          }
          if (this[yo(0x932)]) {
            rF[yo(0xb1a)](), rF[yo(0xbd2)](0x0, -0xc);
            if (this[yo(0xda1)]) rF[yo(0x5df)](0.7, 0.7), rQ(0x0, -0x3);
            else
              this[yo(0x9a0)]
                ? (rF[yo(0x5df)](0.7, 0.7), rR(0x0, -0x3))
                : lN(rF);
            rF[yo(0xaea)]();
          }
          this[yo(0x908)] &&
            (rF[yo(0xb1a)](),
            rF[yo(0xbd2)](0x0, 0xa),
            rF[yo(0x5f9)](-Math["PI"] / 0x2),
            rF[yo(0x5df)](0.82, 0.82),
            this[yo(0x541)](rF, ![], 0.85),
            rF[yo(0xaea)]());
          const rS = rM * (-0x5 - 5.5) + rN * (-0x5 - 0x4);
          rF[yo(0xb1a)](),
            rF[yo(0x540)](),
            rF[yo(0xbd2)](0x0, 9.5),
            rF[yo(0xc4d)](-5.6, 0x0),
            rF[yo(0x92a)](0x0, 0x5 + rS, 5.6, 0x0),
            (rF[yo(0xe13)] = yo(0xbb6));
          this[yo(0x1d9)]
            ? ((rF[yo(0x930)] = 0x7),
              (rF[yo(0xdf1)] = yo(0xad6)),
              rF[yo(0x5b9)](),
              (rF[yo(0xdf1)] = yo(0x999)))
            : (rF[yo(0xdf1)] = yo(0xa15));
          (rF[yo(0x930)] = 1.75), rF[yo(0x5b9)](), rF[yo(0xaea)]();
          if (this[yo(0xe14)]) {
            const s6 = this[yo(0x474)],
              s7 = 0x28,
              s8 = Date[yo(0x5b6)]() / 0x12c,
              s9 = this[yo(0x7a5)] ? 0x0 : Math[yo(0xdad)](s8) * 0.5 + 0.5,
              sa = s9 * 0x4,
              sb = 0x28 - s9 * 0x4,
              sc = sb - (this[yo(0x7a5)] ? 0x1 : je(s6)) * 0x50,
              se = this[yo(0x663)];
            (rF[yo(0x930)] = 0x9 + rL * 0x2),
              (rF[yo(0xd4e)] = yo(0xbb6)),
              (rF[yo(0xe13)] = yo(0xbb6));
            for (let sf = 0x0; sf < 0x2; sf++) {
              rF[yo(0x540)](), rF[yo(0xb1a)]();
              for (let sg = 0x0; sg < 0x2; sg++) {
                rF[yo(0xc4d)](0x19, 0x0);
                let sh = sc;
                se && sg === 0x0 && (sh = sb),
                  rF[yo(0x92a)](0x2d + sa, sh * 0.5, 0xb, sh),
                  rF[yo(0x5df)](-0x1, 0x1);
              }
              rF[yo(0xaea)](),
                (rF[yo(0xdf1)] = rK[0x1 - sf]),
                rF[yo(0x5b9)](),
                (rF[yo(0x930)] = 0x9);
            }
            rF[yo(0xb1a)](),
              rF[yo(0xbd2)](0x0, sc),
              lR(rF, s9),
              rF[yo(0xaea)]();
          }
          rF[yo(0xaea)]();
        }
        [uu(0xd06)](rF, rG) {}
        [uu(0x7b7)](rF, rG = 0x1) {
          const yt = uu,
            rH = ni[this["id"]];
          if (!rH) return;
          for (let rI = 0x0; rI < rH[yt(0xc60)]; rI++) {
            const rJ = rH[rI];
            if (rJ["t"] > lU + lV) continue;
            !rJ["x"] &&
              ((rJ["x"] = this["x"]),
              (rJ["y"] = this["y"] - this[yt(0x423)] - 0x44),
              (rJ[yt(0xb88)] = this["x"]),
              (rJ[yt(0xd3e)] = this["y"]));
            const rK = rJ["t"] > lU ? 0x1 - (rJ["t"] - lU) / lV : 0x1,
              rL = rK * rK * rK;
            (rJ["x"] += (this["x"] - rJ[yt(0xb88)]) * rL),
              (rJ["y"] += (this["y"] - rJ[yt(0xd3e)]) * rL),
              (rJ[yt(0xb88)] = this["x"]),
              (rJ[yt(0xd3e)] = this["y"]);
            const rM = Math[yt(0xd8d)](0x1, rJ["t"] / 0x64);
            rF[yt(0xb1a)](),
              (rF[yt(0xa46)] = (rK < 0.7 ? rK / 0.7 : 0x1) * rM * 0.9),
              rF[yt(0xbd2)](rJ["x"], rJ["y"] - (rJ["t"] / lU) * 0x14),
              rF[yt(0xd57)](rG);
            const rN = pI(rF, rJ[yt(0x240)], 0x10, yt(0x2d0), 0x0, !![], ![]);
            rF[yt(0xd57)](rM), rF[yt(0x540)]();
            const rO = rN[yt(0x5a3)] + 0xa,
              rP = rN[yt(0xd81)] + 0xf;
            rF[yt(0xe5c)]
              ? rF[yt(0xe5c)](-rO / 0x2, -rP / 0x2, rO, rP, 0x5)
              : rF[yt(0x7ec)](-rO / 0x2, -rP / 0x2, rO, rP),
              (rF[yt(0xc50)] = rJ[yt(0xdef)]),
              rF[yt(0xa90)](),
              (rF[yt(0xdf1)] = yt(0x2d0)),
              (rF[yt(0x930)] = 1.5),
              rF[yt(0x5b9)](),
              rF[yt(0xc9d)](
                rN,
                -rN[yt(0x5a3)] / 0x2,
                -rN[yt(0xd81)] / 0x2,
                rN[yt(0x5a3)],
                rN[yt(0xd81)]
              ),
              rF[yt(0xaea)]();
          }
        }
      },
      lT = 0x4e20,
      lU = 0xfa0,
      lV = 0xbb8,
      lW = lU + lV;
    function lX(rF, rG, rH = 0x1) {
      const yu = uu;
      if (rF[yu(0xda1)]) return;
      rG[yu(0xb1a)](),
        rG[yu(0xbd2)](rF["x"], rF["y"]),
        lY(rF, rG, void 0x0, rH),
        rG[yu(0xbd2)](0x0, -rF[yu(0x423)] - 0x19),
        rG[yu(0xb1a)](),
        rG[yu(0xd57)](rH),
        rF[yu(0xda2)] &&
          (pI(rG, "@" + rF[yu(0xda2)], 0xb, yu(0x63f), 0x3),
          rG[yu(0xbd2)](0x0, -0x10)),
        rF[yu(0xbfe)] &&
          (pI(rG, rF[yu(0xbfe)], 0x12, yu(0xd1d), 0x3),
          rG[yu(0xbd2)](0x0, -0x5)),
        rG[yu(0xaea)](),
        !rF[yu(0x250)] &&
          rF[yu(0x655)] > 0.001 &&
          ((rG[yu(0xa46)] = rF[yu(0x655)]),
          rG[yu(0x5df)](rF[yu(0x655)] * 0x3, rF[yu(0x655)] * 0x3),
          rG[yu(0x540)](),
          rG[yu(0x660)](0x0, 0x0, 0x14, 0x0, kZ),
          (rG[yu(0xc50)] = yu(0xa15)),
          rG[yu(0xa90)](),
          nA(rG, 0.8),
          rG[yu(0x540)](),
          rG[yu(0x660)](0x0, 0x0, 0x14, 0x0, kZ),
          (rG[yu(0xc50)] = yu(0x22f)),
          rG[yu(0xa90)](),
          rG[yu(0x540)](),
          rG[yu(0xc4d)](0x0, 0x0),
          rG[yu(0x660)](0x0, 0x0, 0x10, 0x0, kZ * rF[yu(0x6c8)]),
          rG[yu(0x91a)](0x0, 0x0),
          rG[yu(0xb63)](),
          nA(rG, 0.8)),
        rG[yu(0xaea)]();
    }
    function lY(rF, rG, rH = ![], rI = 0x1) {
      const yv = uu;
      if (rF[yv(0x4de)] <= 0x0) return;
      rG[yv(0xb1a)](),
        (rG[yv(0xa46)] = rF[yv(0x4de)]),
        (rG[yv(0xdf1)] = yv(0x15f)),
        rG[yv(0x540)]();
      const rJ = rH ? 0x8c : rF[yv(0x250)] ? 0x4b : 0x64;
      let rK = rH ? 0x1a : 0x9;
      const rL = !rH && pa[yv(0xce1)];
      rL && (rK += 0x14);
      if (rH) rG[yv(0xbd2)](rF[yv(0x423)] + 0x11, 0x0);
      else {
        if (rF[yv(0x250)] ? pa[yv(0x9c5)] : pa[yv(0x4e7)])
          rG[yv(0xbd2)](0x0, rF[yv(0x423)]),
            rG[yv(0xd57)](rI),
            rG[yv(0xbd2)](-rJ / 0x2, rK / 0x2 + 0x14);
        else {
          const rN = Math[yv(0x9b2)](0x1, rF[yv(0x423)] / 0x64);
          rG[yv(0x5df)](rN, rN),
            rG[yv(0xbd2)](-rJ / 0x2, rF[yv(0x423)] / rN + 0x1b);
        }
      }
      rG[yv(0x540)](),
        rG[yv(0xc4d)](rH ? -0x14 : 0x0, 0x0),
        rG[yv(0x91a)](rJ, 0x0),
        (rG[yv(0xe13)] = yv(0xbb6)),
        (rG[yv(0x930)] = rK),
        (rG[yv(0xdf1)] = yv(0x15f)),
        rG[yv(0x5b9)]();
      function rM(rO) {
        const yw = yv;
        rG[yw(0xa46)] = rO < 0.05 ? rO / 0.05 : 0x1;
      }
      rF[yv(0x831)] > 0x0 &&
        (rM(rF[yv(0x831)]),
        rG[yv(0x540)](),
        rG[yv(0xc4d)](0x0, 0x0),
        rG[yv(0x91a)](rF[yv(0x831)] * rJ, 0x0),
        (rG[yv(0x930)] = rK * (rH ? 0.55 : 0.44)),
        (rG[yv(0xdf1)] = yv(0xe43)),
        rG[yv(0x5b9)]());
      rF[yv(0x9d4)] > 0x0 &&
        (rM(rF[yv(0x9d4)]),
        rG[yv(0x540)](),
        rG[yv(0xc4d)](0x0, 0x0),
        rG[yv(0x91a)](rF[yv(0x9d4)] * rJ, 0x0),
        (rG[yv(0x930)] = rK * (rH ? 0.7 : 0.66)),
        (rG[yv(0xdf1)] = yv(0xde4)),
        rG[yv(0x5b9)]());
      rF[yv(0xbd6)] &&
        (rM(rF[yv(0xbd6)]),
        rG[yv(0x540)](),
        rG[yv(0xc4d)](0x0, 0x0),
        rG[yv(0x91a)](rF[yv(0xbd6)] * rJ, 0x0),
        (rG[yv(0x930)] = rK * (rH ? 0.45 : 0.35)),
        (rG[yv(0xdf1)] = yv(0xe49)),
        rG[yv(0x5b9)]());
      if (rF[yv(0x250)]) {
        rG[yv(0xa46)] = 0x1;
        if(rF.username == hack.player.name) hack.player.entity = rF;
        var hp = Math.round(rF.health * hack.hp);
        var shield = Math.round(rF.shield * hack.hp);
        const rO = pI(
          rG,
          (rF.username == hack.player.name ? `HP ${hp}${shield ? " + " + shield : ""} ` : '')+ yv(0xa23) + (rF[yv(0xe56)] + 0x1),
          rH ? 0xc : 0xe,
          yv(0xd1d),
          0x3,
          !![]
        );
        rG[yv(0xc9d)](
          rO,
          rJ + rK / 0x2 - rO[yv(0x5a3)],
          rK / 0x2,
          rO[yv(0x5a3)],
          rO[yv(0xd81)]
        );
        if (rH) {
          const rP = pI(rG, "@" + rF[yv(0xda2)], 0xc, yv(0x63f), 0x3, !![]);
          rG[yv(0xc9d)](
            rP,
            -rK / 0x2,
            -rK / 0x2 - rP[yv(0xd81)],
            rP[yv(0x5a3)],
            rP[yv(0xd81)]
          );
        }
      } else {
        rG[yv(0xa46)] = 0x1;
        const rQ = kb[rF[yv(0x909)]],
          rR = pI(rG, rQ, 0xe, yv(0xd1d), 0x3, !![], rF[yv(0x30b)]);
        rG[yv(0xb1a)](), rG[yv(0xbd2)](0x0, -rK / 0x2 - rR[yv(0xd81)]);
        rR[yv(0x5a3)] > rJ + rK
          ? rG[yv(0xc9d)](
              rR,
              rJ / 0x2 - rR[yv(0x5a3)] / 0x2,
              0x0,
              rR[yv(0x5a3)],
              rR[yv(0xd81)]
            )
          : rG[yv(0xc9d)](rR, -rK / 0x2, 0x0, rR[yv(0x5a3)], rR[yv(0xd81)]);
        rG[yv(0xaea)]();
        const rS = pI(rG, rF[yv(0x30b)], 0xe, hO[rF[yv(0x30b)]], 0x3, !![]);
        rG[yv(0xc9d)](
          rS,
          rJ + rK / 0x2 - rS[yv(0x5a3)],
          rK / 0x2,
          rS[yv(0x5a3)],
          rS[yv(0xd81)]
        );
        const genCanvas = pI;
        hack.updateMob(rF);
        const health = genCanvas(
          rG,
          `${Math.round(rF['health'] * hack.getHP(rF))} (${Math.round(rF['health'] * 100)}%)`,
          30,
          hack.getColor(rF),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) rG.drawImage(
          health,
          -60,
          -150,
          health.worldW,
          health.worldH
        );
        const health2 = genCanvas(
          rG,
          `/ ${hack.getHP(rF)} `,
          30,
          hack.getColor(rF),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) rG.drawImage(
          health2,
          -60,
          -120,
          health2.worldW,
          health2.worldH
        );
        const entityId = genCanvas(
          rG,
          'ID: ' + rF['id'],
          20,
          '#fff',
          3,
          true
        );
        rG.drawImage(
          entityId,
          -60,
          -90,
          entityId.worldW,
          entityId.worldH
        );
      }
      if (rL) {
        let rT = lZ(rF[yv(0x9d4)]);
        rF[yv(0xbd6)] > 0x0 && (rT += yv(0x59a) + lZ(rF[yv(0xbd6)])),
          rG[yv(0xb1a)](),
          rG[yv(0xbd2)](rJ / 0x2, 0x0),
          pI(
            rG,
            rT,
            0xe,
            yv(0xd1d),
            0x3,
            void 0x0,
            (rF[yv(0x250)] ? 0x1 : 0x0) +
              "_" +
              Math[yv(0xb54)](rF[yv(0x423)] / 0x64)
          ),
          rG[yv(0xaea)]();
      }
      rH &&
        rF[yv(0xbfe)] &&
        ((rG[yv(0xa46)] = 0x1),
        rG[yv(0xbd2)](rJ / 0x2, 0x0),
        pI(rG, rF[yv(0xbfe)], 0x11, yv(0xd1d), 0x3)),
        rG[yv(0xaea)]();
    }
    function lZ(rF) {
      const yx = uu,
        rG = {};
      return (rG[yx(0x6dd)] = 0x2), (rF * 0x64)[yx(0xa53)](yx(0x583), rG) + "%";
    }
    function m0(rF) {
      const yy = uu;
      for (let rG in oE) {
        oE[rG][yy(0xc1c)](rF);
      }
      oX();
    }
    var m1 = {},
      m2 = document[uu(0x5d6)](uu(0x979));
    mH(uu(0x283), uu(0x73d), uu(0x1e8)),
      mH(uu(0xd80), uu(0x979), uu(0x4b5)),
      mH(uu(0xb7f), uu(0x497), uu(0x965), () => {
        const yz = uu;
        (hu = ![]), (hC[yz(0x965)] = fb);
      }),
      mH(uu(0x16d), uu(0xb86), uu(0x359)),
      mH(uu(0xcd0), uu(0xb60), uu(0xb99)),
      mH(uu(0x46e), uu(0x766), uu(0x490)),
      mH(uu(0x4db), uu(0xbe7), uu(0x2a5)),
      mH(uu(0xcfb), uu(0x8d3), uu(0x7bd)),
      mH(uu(0x9a9), uu(0x3cd), uu(0x538)),
      mH(uu(0x4fe), uu(0x4fb), "lb"),
      mH(uu(0x56f), uu(0x2b2), uu(0x1d2)),
      mH(uu(0xca4), uu(0x9c0), uu(0x3a9), () => {
        const yA = uu;
        (mi[yA(0xa09)][yA(0xd21)] = yA(0x89b)), (hC[yA(0x3a9)] = mh);
      }),
      mH(uu(0xc69), uu(0x21e), uu(0x7eb), () => {
        const yB = uu;
        if (!hV) return;
        ik(new Uint8Array([cH[yB(0x401)]]));
      });
    var m3 = document[uu(0x5d6)](uu(0xa0f)),
      m4 = ![],
      m5 = null,
      m6 = nP(uu(0x31c));
    setInterval(() => {
      m5 && m7();
    }, 0x3e8);
    function m7() {
      const yC = uu;
      k7(m6, yC(0x2ca) + k9(Date[yC(0x5b6)]() - m5[yC(0x8ef)]) + yC(0x252));
    }
    function m8(rF) {
      const yD = uu;
      document[yD(0xd31)][yD(0x487)][yD(0x8d8)](yD(0xe21));
      const rG = nP(
        yD(0xa5a) +
          rF[yD(0x767)] +
          yD(0xaa1) +
          rF[yD(0xbb7)] +
          yD(0x54b) +
          (rF[yD(0x801)]
            ? yD(0x796) +
              rF[yD(0x801)] +
              "\x22\x20" +
              (rF[yD(0x380)] ? yD(0xb64) + rF[yD(0x380)] + "\x22" : "") +
              yD(0xa32)
            : "") +
          yD(0x1ea)
      );
      (r3 = rG),
        (rG[yD(0xc1c)] = function () {
          const yE = yD;
          document[yE(0xd31)][yE(0x487)][yE(0x5e5)](yE(0xe21)),
            rG[yE(0x5e5)](),
            (r3 = null);
        }),
        (rG[yD(0x5d6)](yD(0xc09))[yD(0x46d)] = rG[yD(0xc1c)]);
      const rH = rG[yD(0x5d6)](yD(0x178)),
        rI = 0x14;
      rJ(0x0);
      if (rF[yD(0x61b)][yD(0xc60)] > rI) {
        const rK = nP(yD(0x13d));
        rG[yD(0xd82)](rK);
        const rL = rK[yD(0x5d6)](yD(0xd9e)),
          rM = Math[yD(0xbeb)](rF[yD(0x61b)][yD(0xc60)] / rI);
        for (let rP = 0x0; rP < rM; rP++) {
          const rQ = nP(yD(0xc23) + rP + yD(0xc68) + (rP + 0x1) + yD(0xceb));
          rL[yD(0xd82)](rQ);
        }
        rL[yD(0x510)] = function () {
          const yF = yD;
          rJ(this[yF(0xc04)]);
        };
        const rN = rG[yD(0x5d6)](yD(0x8d4)),
          rO = rG[yD(0x5d6)](yD(0xe1d));
        rO[yD(0x510)] = function () {
          const yG = yD,
            rR = this[yG(0xc04)][yG(0x3ab)]();
          (rN[yG(0x679)] = ""), (rN[yG(0xa09)][yG(0xd21)] = yG(0x89b));
          if (!rR) return;
          const rS = new RegExp(rR, "i");
          let rT = 0x0;
          for (let rU = 0x0; rU < rF[yG(0x61b)][yG(0xc60)]; rU++) {
            const rV = rF[yG(0x61b)][rU];
            if (rS[yG(0xbe9)](rV[yG(0x8a3)])) {
              const rW = nP(
                yG(0xb1b) +
                  (rU + 0x1) +
                  yG(0x1ab) +
                  rV[yG(0x8a3)] +
                  yG(0x93a) +
                  k8(rV[yG(0x29c)]) +
                  yG(0xbcd)
              );
              rN[yG(0xd82)](rW),
                (rW[yG(0x5d6)](yG(0xd04))[yG(0x46d)] = function () {
                  const yH = yG;
                  mw(rV[yH(0x8a3)]);
                }),
                (rW[yG(0x46d)] = function (rX) {
                  const yI = yG;
                  if (rX[yI(0x6a9)] === this) {
                    const rY = Math[yI(0xb54)](rU / rI);
                    rJ(rY), (rL[yI(0xc04)] = rY);
                  }
                }),
                rT++;
              if (rT >= 0x8) break;
            }
          }
          rT > 0x0 && (rN[yG(0xa09)][yG(0xd21)] = "");
        };
      }
      function rJ(rR = 0x0) {
        const yJ = yD,
          rS = rR * rI,
          rT = Math[yJ(0xd8d)](rF[yJ(0x61b)][yJ(0xc60)], rS + rI);
        rH[yJ(0x679)] = "";
        for (let rU = rS; rU < rT; rU++) {
          const rV = rF[yJ(0x61b)][rU];
          rH[yJ(0xd82)](rF[yJ(0x1fe)](rV, rU));
          const rW = nP(yJ(0x364));
          for (let rX = 0x0; rX < rV[yJ(0xc2d)][yJ(0xc60)]; rX++) {
            const [rY, rZ] = rV[yJ(0xc2d)][rX],
              s0 = dE[rY],
              s1 = nP(
                yJ(0x537) + s0[yJ(0x308)] + "\x22\x20" + qz(s0) + yJ(0xa32)
              );
            jX(s1);
            const s2 = "x" + k8(rZ),
              s3 = nP(yJ(0xaf3) + s2 + yJ(0x9ea));
            s2[yJ(0xc60)] > 0x6 && s3[yJ(0x487)][yJ(0x8d8)](yJ(0x431)),
              s1[yJ(0xd82)](s3),
              (s1[yJ(0xd7f)] = s0),
              rW[yJ(0xd82)](s1);
          }
          rH[yJ(0xd82)](rW);
        }
      }
      kk[yD(0xd82)](rG);
    }
    function m9(rF, rG = ![]) {
      const yK = uu;
      let rH = [],
        rI = 0x0;
      for (const rK in rF) {
        const rL = rF[rK];
        let rM = 0x0,
          rN = [];
        for (const rP in rL) {
          const rQ = rL[rP];
          rN[yK(0x7b8)]([rP, rQ]), (rM += rQ), (rI += rQ);
        }
        rN = rN[yK(0x38e)]((rR, rS) => rS[0x1] - rR[0x1]);
        const rO = {};
        (rO[yK(0x8a3)] = rK),
          (rO[yK(0xc2d)] = rN),
          (rO[yK(0x29c)] = rM),
          rH[yK(0x7b8)](rO);
      }
      if (rG) rH = rH[yK(0x38e)]((rR, rS) => rS[yK(0x29c)] - rR[yK(0x29c)]);
      const rJ = {};
      return (rJ[yK(0x29c)] = rI), (rJ[yK(0x61b)] = rH), rJ;
    }
    function ma() {
      return mb(new Date());
    }
    function mb(rF) {
      const yL = uu,
        rG = {};
      rG[yL(0x1a4)] = yL(0x123);
      const rH = rF[yL(0x104)]("en", rG),
        rI = {};
      rI[yL(0x195)] = yL(0x6fd);
      const rJ = rF[yL(0x104)]("en", rI),
        rK = {};
      rK[yL(0x366)] = yL(0x123);
      const rL = rF[yL(0x104)]("en", rK);
      return "" + rH + mc(rH) + "\x20" + rJ + "\x20" + rL;
    }
    function mc(rF) {
      if (rF >= 0xb && rF <= 0xd) return "th";
      switch (rF % 0xa) {
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
    function md(rF, rG) {
      const yM = uu,
        rH = nP(
          yM(0xb92) +
            (rG + 0x1) +
            yM(0x4a0) +
            rF[yM(0x8a3)] +
            yM(0xb1f) +
            k8(rF[yM(0x29c)]) +
            yM(0x2fa) +
            (rF[yM(0x29c)] == 0x1 ? "" : "s") +
            yM(0x6aa)
        );
      return (
        (rH[yM(0x5d6)](yM(0xd04))[yM(0x46d)] = function () {
          const yN = yM;
          mw(rF[yN(0x8a3)]);
        }),
        rH
      );
    }
    var me = {
      ultraPlayers: {
        title: uu(0x339),
        parse(rF) {
          const yO = uu,
            rG = rF[yO(0x5d4)];
          if (rG[yO(0x678)] !== 0x1) throw new Error(yO(0xd1b) + rG[yO(0x678)]);
          const rH = {},
            rI = rG[yO(0xdf5)][yO(0xc24)]("+");
          for (const rK in rG[yO(0x8d1)]) {
            const rL = rG[yO(0x8d1)][rK][yO(0xc24)]("\x20"),
              rM = {};
            for (let rN = 0x0; rN < rL[yO(0xc60)] - 0x1; rN++) {
              let [rO, rP] = rL[rN][yO(0xc24)](",");
              rM[rI[rO]] = parseInt(rP);
            }
            rH[rK] = rM;
          }
          const rJ = m9(rH, !![]);
          return {
            title: this[yO(0x767)],
            titleColor: hO[yO(0xca6)],
            desc:
              ma() +
              yO(0x7cd) +
              k8(rJ[yO(0x61b)][yO(0xc60)]) +
              yO(0xb08) +
              k8(rJ[yO(0x29c)]) +
              yO(0x957),
            getTitleEl: md,
            groups: rJ[yO(0x61b)],
          };
        },
      },
      superPlayers: {
        title: uu(0x46a),
        parse(rF) {
          const yP = uu,
            rG = m9(rF[yP(0x902)], !![]);
          return {
            title: this[yP(0x767)],
            titleColor: hO[yP(0x318)],
            desc:
              ma() +
              yP(0x7cd) +
              k8(rG[yP(0x61b)][yP(0xc60)]) +
              yP(0xb08) +
              k8(rG[yP(0x29c)]) +
              yP(0x957),
            getTitleEl: md,
            groups: rG[yP(0x61b)],
          };
        },
      },
      hyperPlayers: {
        title: uu(0xe3a),
        parse(rF) {
          const yQ = uu,
            rG = m9(rF[yQ(0xd32)], !![]);
          return {
            title: this[yQ(0x767)],
            titleColor: hO[yQ(0xa9b)],
            desc:
              ma() +
              yQ(0x7cd) +
              k8(rG[yQ(0x61b)][yQ(0xc60)]) +
              yQ(0xb08) +
              k8(rG[yQ(0x29c)]) +
              yQ(0x957),
            getTitleEl: md,
            groups: rG[yQ(0x61b)],
          };
        },
      },
      petals: {
        title: uu(0xb00),
        parse(rF) {
          const yR = uu,
            rG = m9(rF[yR(0xc2d)], ![]),
            rH = rG[yR(0x61b)][yR(0x38e)](
              (rI, rJ) => rJ[yR(0x8a3)] - rI[yR(0x8a3)]
            );
          return {
            title: this[yR(0x767)],
            titleColor: hO[yR(0xc03)],
            desc: ma() + yR(0x7cd) + k8(rG[yR(0x29c)]) + yR(0x957),
            getTitleEl(rI, rJ) {
              const yS = yR;
              return nP(
                yS(0xae9) +
                  hM[rI[yS(0x8a3)]] +
                  yS(0x7cd) +
                  k8(rI[yS(0x29c)]) +
                  yS(0xc13)
              );
            },
            groups: rH,
          };
        },
      },
    };
    function mf(rF) {
      const yT = uu,
        rG = 0xea60,
        rH = rG * 0x3c,
        rI = rH * 0x18,
        rJ = rI * 0x16d;
      let rK = Math[yT(0xb54)](rF / rJ);
      rF %= rJ;
      let rL = Math[yT(0xb54)](rF / rI);
      rF %= rI;
      let rM = Math[yT(0xb54)](rF / rH);
      rF %= rH;
      let rN = Math[yT(0xb54)](rF / rG),
        rO = [];
      if (rK > 0x0) rO[yT(0x7b8)](rK + "y");
      if (rL > 0x0) rO[yT(0x7b8)](rL + "d");
      if (rM > 0x0) rO[yT(0x7b8)](rM + "h");
      if (rN > 0x0) rO[yT(0x7b8)](rN + "m");
      return rO[yT(0x6af)]("\x20");
    }
    function mg() {
      const yU = uu;
      if (m4) return;
      if (m5 && Date[yU(0x5b6)]() - m5[yU(0x8ef)] < 0x3c * 0xea60) return;
      (m4 = !![]),
        fetch((i7 ? yU(0x421) : yU(0xac9)) + yU(0xbee))
          [yU(0x535)]((rF) => rF[yU(0x545)]())
          [yU(0x535)]((rF) => {
            const yV = yU;
            (m4 = ![]), (m5 = rF), m7(), (m3[yV(0x679)] = "");
            const rG = {};
            (rG[yV(0x6bd)] = !![]),
              (rG[yV(0x76c)] = !![]),
              (rG[yV(0xd0e)] = !![]),
              (rG[yV(0x946)] = !![]),
              (rG[yV(0x6e8)] = !![]);
            const rH = rG,
              rI = nP(yV(0x4f7));
            m3[yV(0xd82)](rI);
            for (const rJ in rH) {
              if (rJ in rF) {
                const rK = rF[rJ],
                  rL = nP(
                    yV(0xd02) +
                      kc(rJ) +
                      yV(0x2ed) +
                      (rJ == yV(0x6bd) ? mf(rK * 0x3e8 * 0x3c) : k8(rK)) +
                      yV(0x465)
                  );
                rI[yV(0xd82)](rL);
              }
            }
            for (const rM in me) {
              if (!(rM in rF)) continue;
              const rN = me[rM],
                rO = nP(yV(0x281) + rN[yV(0x767)] + yV(0x6b7));
              (rO[yV(0x46d)] = function () {
                const yW = yV;
                m8(rN[yW(0x386)](rF));
              }),
                m3[yV(0xd82)](rO);
            }
            m3[yV(0xd82)](m6);
          })
          [yU(0x5e0)]((rF) => {
            const yX = yU;
            (m4 = ![]),
              hb(yX(0x3c2)),
              console[yX(0x648)](yX(0x24e), rF),
              setTimeout(mg, 0x1388);
          });
    }
    mH(uu(0x3f9), uu(0x555), uu(0xc63), mg);
    var mh = 0xb,
      mi = document[uu(0x5d6)](uu(0x7a6));
    hC[uu(0x3a9)] == mh && (mi[uu(0xa09)][uu(0xd21)] = uu(0x89b));
    var mj = document[uu(0x5d6)](uu(0xd49));
    mj[uu(0xa09)][uu(0xd21)] = uu(0x89b);
    var mk = document[uu(0x5d6)](uu(0x7e7)),
      ml = document[uu(0x5d6)](uu(0xb61)),
      mm = document[uu(0x5d6)](uu(0xde1));
    mm[uu(0x46d)] = function () {
      const yY = uu;
      mj[yY(0xa09)][yY(0xd21)] = yY(0x89b);
    };
    var mn = ![];
    ml[uu(0x46d)] = nu(function (rF) {
      const yZ = uu;
      if (!hV || mn || jx) return;
      const rG = mk[yZ(0xc04)][yZ(0x3ab)]();
      if (!rG || !eU(rG)) {
        mk[yZ(0x487)][yZ(0x5e5)](yZ(0x29a)),
          void mk[yZ(0x404)],
          mk[yZ(0x487)][yZ(0x8d8)](yZ(0x29a));
        return;
      }
      (mj[yZ(0xa09)][yZ(0xd21)] = ""),
        (mj[yZ(0x679)] = yZ(0xb3e)),
        ik(
          new Uint8Array([cH[yZ(0xa02)], ...new TextEncoder()[yZ(0xb80)](rG)])
        ),
        (mn = !![]);
    });
    function mo(rF, rG) {
      const z0 = uu;
      if (rF === z0(0xb02)) {
        const rH = {};
        (rH[z0(0x366)] = z0(0x123)),
          (rH[z0(0x1a4)] = z0(0xb47)),
          (rH[z0(0x195)] = z0(0xb47)),
          (rG = new Date(
            rG === 0x0 ? Date[z0(0x5b6)]() : rG * 0x3e8 * 0x3c * 0x3c
          )[z0(0x104)]("en", rH));
      } else
        rF === z0(0x26f) || rF === z0(0xacd)
          ? (rG = k9(rG * 0x3e8 * 0x3c, !![]))
          : (rG = k8(rG));
      return rG;
    }
    var mp = f1(),
      mq = {},
      mr = document[uu(0x5d6)](uu(0x1b5));
    mr[uu(0x679)] = "";
    for (let rF in mp) {
      const rG = ms(rF);
      rG[uu(0x270)](0x0), mr[uu(0xd82)](rG), (mq[rF] = rG);
    }
    function ms(rH) {
      const z1 = uu,
        rI = nP(z1(0x852) + kc(rH) + z1(0xd33)),
        rJ = rI[z1(0x5d6)](z1(0x636));
      return (
        (rI[z1(0x270)] = function (rK) {
          k7(rJ, mo(rH, rK));
        }),
        rI
      );
    }
    var mt;
    function mu(rH, rI, rJ, rK, rL, rM, rN) {
      const z2 = uu;
      mt && (mt[z2(0x10d)](), (mt = null));
      const rO = rM[z2(0xc60)] / 0x2,
        rP = z2(0x57a)[z2(0x4c2)](rO),
        rQ = nP(
          z2(0xab4) +
            rH +
            z2(0xce3) +
            rP +
            z2(0x84f) +
            rP +
            z2(0xd7d) +
            z2(0x642)[z2(0x4c2)](eK * dG) +
            z2(0x2cd) +
            (rJ[z2(0xc60)] === 0x0 ? z2(0x990) : "") +
            z2(0xc3d)
        );
      rN && rQ[z2(0xd82)](nP(z2(0x524)));
      mt = rQ;
      const rR = rQ[z2(0x5d6)](z2(0xa57)),
        rS = rQ[z2(0x5d6)](z2(0x9ee));
      for (let s4 = 0x0; s4 < rM[z2(0xc60)]; s4++) {
        const s5 = rM[s4];
        if (!s5) continue;
        const s6 = oe(s5);
        s6[z2(0x487)][z2(0x5e5)](z2(0x958)),
          (s6[z2(0x9a1)] = !![]),
          s6[z2(0xad1)][z2(0x5e5)](),
          (s6[z2(0xad1)] = null),
          s4 < rO
            ? rR[z2(0x87b)][s4][z2(0xd82)](s6)
            : rS[z2(0x87b)][s4 - rO][z2(0xd82)](s6);
      }
      (rQ[z2(0x10d)] = function () {
        const z3 = z2;
        (rQ[z3(0xa09)][z3(0x26d)] = z3(0x7f5)),
          (rQ[z3(0xa09)][z3(0xd21)] = z3(0x89b)),
          void rQ[z3(0x404)],
          (rQ[z3(0xa09)][z3(0xd21)] = ""),
          setTimeout(function () {
            const z4 = z3;
            rQ[z4(0x5e5)]();
          }, 0x3e8);
      }),
        (rQ[z2(0x5d6)](z2(0xc09))[z2(0x46d)] = function () {
          const z5 = z2;
          rQ[z5(0x10d)]();
        });
      const rT = d3(rL),
        rU = rT[0x0],
        rV = rT[0x1],
        rW = d1(rU + 0x1),
        rX = rL - rV,
        rY = rQ[z2(0x5d6)](z2(0x775));
      k7(
        rY,
        z2(0x634) + (rU + 0x1) + z2(0x777) + iI(rX) + "/" + iI(rW) + z2(0x4c3)
      );
      const rZ = Math[z2(0xd8d)](0x1, rX / rW),
        s0 = rQ[z2(0x5d6)](z2(0xade));
      s0[z2(0xa09)][z2(0x59c)] = rZ * 0x64 + "%";
      const s1 = rQ[z2(0x5d6)](z2(0x1b5));
      for (let s7 in mp) {
        const s8 = ms(s7);
        s8[z2(0x270)](rI[s7]), s1[z2(0xd82)](s8);
      }
      const s2 = rQ[z2(0x5d6)](z2(0xb94));
      rJ[z2(0x38e)]((s9, sa) => od(s9[0x0], sa[0x0]));
      for (let s9 = 0x0; s9 < rJ[z2(0xc60)]; s9++) {
        const [sa, sb] = rJ[s9],
          sc = oe(sa);
        jX(sc),
          sc[z2(0x487)][z2(0x5e5)](z2(0x958)),
          (sc[z2(0x9a1)] = !![]),
          p4(sc[z2(0xad1)], sb),
          s2[z2(0xd82)](sc);
      }
      if (rJ[z2(0xc60)] > 0x0) {
        const sd = nP(z2(0xd53)),
          se = {};
        for (let sf = 0x0; sf < rJ[z2(0xc60)]; sf++) {
          const [sg, sh] = rJ[sf];
          se[sg[z2(0x308)]] = (se[sg[z2(0x308)]] || 0x0) + sh;
        }
        oD(sd, se), rQ[z2(0x5d6)](z2(0x766))[z2(0xd82)](sd);
      }
      const s3 = rQ[z2(0x5d6)](z2(0xe50));
      for (let si = 0x0; si < rK[z2(0xc60)]; si++) {
        const sj = rK[si],
          sk = nU(sj, !![]);
        sk[z2(0x487)][z2(0x5e5)](z2(0x958)), (sk[z2(0x9a1)] = !![]);
        const sl = s3[z2(0x87b)][sj[z2(0x1a7)] * dG + sj[z2(0x308)]];
        s3[z2(0x201)](sk, sl), sl[z2(0x5e5)]();
      }
      rQ[z2(0x487)][z2(0x8d8)](z2(0x733)),
        setTimeout(function () {
          const z6 = z2;
          rQ[z6(0x487)][z6(0x5e5)](z6(0x733));
        }, 0x0),
        kk[z2(0xd82)](rQ);
    }
    var mv = document[uu(0x5d6)](uu(0x5c0));
    document[uu(0x5d6)](uu(0xcd2))[uu(0x46d)] = nu(function (rH) {
      const z7 = uu,
        rI = mv[z7(0xc04)][z7(0x3ab)]();
      nt(rI);
    });
    function mw(rH) {
      const z8 = uu,
        rI = new Uint8Array([
          cH[z8(0xbd4)],
          ...new TextEncoder()[z8(0xb80)](rH),
        ]);
      ik(rI);
    }
    var mz = document[uu(0x5d6)](uu(0x8d3)),
      mA = document[uu(0x5d6)](uu(0x4fb)),
      mB = mA[uu(0x5d6)](uu(0x178)),
      mC = 0x0,
      mD = 0x0;
    setInterval(function () {
      const z9 = uu;
      hV &&
        (pO - mD > 0x7530 &&
          mz[z9(0x487)][z9(0x3a1)](z9(0x7f2)) &&
          (ik(new Uint8Array([cH[z9(0xd0f)]])), (mD = pO)),
        pO - mC > 0xea60 &&
          mA[z9(0x487)][z9(0x3a1)](z9(0x7f2)) &&
          (ik(new Uint8Array([cH[z9(0x403)]])), (mC = pO)));
    }, 0x3e8);
    var mE = ![];
    function mF(rH) {
      const za = uu;
      for (let rI in m1) {
        if (rH === rI) continue;
        m1[rI][za(0x10d)]();
      }
      mE = ![];
    }
    window[uu(0x46d)] = function (rH) {
      const zb = uu;
      if ([kj, km, kh][zb(0xb65)](rH[zb(0x6a9)])) mF();
    };
    function mG() {
      const zc = uu;
      ix && !pa[zc(0x19a)] && il(0x0, 0x0);
    }
    function mH(rH, rI, rJ, rK) {
      const zd = uu,
        rL = document[zd(0x5d6)](rI),
        rM = rL[zd(0x5d6)](zd(0x178)),
        rN = document[zd(0x5d6)](rH);
      let rO = null,
        rP = rL[zd(0x5d6)](zd(0x7aa));
      rP &&
        (rP[zd(0x46d)] = function () {
          const ze = zd;
          rL[ze(0x487)][ze(0x64d)](ze(0x263));
        });
      (rM[zd(0xa09)][zd(0xd21)] = zd(0x89b)),
        rL[zd(0x487)][zd(0x5e5)](zd(0x7f2)),
        (rN[zd(0x46d)] = function () {
          const zf = zd;
          rQ[zf(0x64d)]();
        }),
        (rL[zd(0x5d6)](zd(0xc09))[zd(0x46d)] = function () {
          mF();
        });
      const rQ = [rN, rL];
      (rQ[zd(0x10d)] = function () {
        const zg = zd;
        rN[zg(0x487)][zg(0x5e5)](zg(0x3fb)),
          rL[zg(0x487)][zg(0x5e5)](zg(0x7f2)),
          !rO &&
            (rO = setTimeout(function () {
              const zh = zg;
              (rM[zh(0xa09)][zh(0xd21)] = zh(0x89b)), (rO = null);
            }, 0x3e8));
      }),
        (rQ[zd(0x64d)] = function () {
          const zi = zd;
          mF(rJ),
            rL[zi(0x487)][zi(0x3a1)](zi(0x7f2))
              ? rQ[zi(0x10d)]()
              : rQ[zi(0x7f2)]();
        }),
        (rQ[zd(0x7f2)] = function () {
          const zj = zd;
          rK && rK(),
            clearTimeout(rO),
            (rO = null),
            (rM[zj(0xa09)][zj(0xd21)] = ""),
            rN[zj(0x487)][zj(0x8d8)](zj(0x3fb)),
            rL[zj(0x487)][zj(0x8d8)](zj(0x7f2)),
            (mE = !![]),
            mG();
        }),
        (m1[rJ] = rQ);
    }
    var mI = [],
      mJ,
      mK = 0x0,
      mL = ![],
      mM = document[uu(0x5d6)](uu(0x46e)),
      mN = {
        tagName: uu(0x8c9),
        getBoundingClientRect() {
          const zk = uu,
            rH = mM[zk(0x17a)](),
            rI = {};
          return (
            (rI["x"] = rH["x"] + rH[zk(0x59c)] / 0x2),
            (rI["y"] = rH["y"] + rH[zk(0x52a)] / 0x2),
            rI
          );
        },
        appendChild(rH) {
          const zl = uu;
          rH[zl(0x5e5)]();
        },
      };
    function mO(rH) {
      const zm = uu;
      if (!hV) return;
      const rI = rH[zm(0x6a9)];
      if (rI[zm(0xbde)]) mJ = n8(rI, rH);
      else {
        if (rI[zm(0xa83)]) {
          mF();
          const rJ = rI[zm(0xcdb)]();
          (rJ[zm(0xd7f)] = rI[zm(0xd7f)]),
            nO(rJ, rI[zm(0xd7f)]),
            (rJ[zm(0xa33)] = 0x1),
            (rJ[zm(0xa83)] = !![]),
            (rJ[zm(0x8a4)] = mN),
            rJ[zm(0x487)][zm(0x8d8)](zm(0x324));
          const rK = rI[zm(0x17a)]();
          (rJ[zm(0xa09)][zm(0x9f6)] = rK["x"] / kQ + "px"),
            (rJ[zm(0xa09)][zm(0x762)] = rK["y"] / kQ + "px"),
            kG[zm(0xd82)](rJ),
            (mJ = n8(rJ, rH)),
            (mK = 0x0),
            (mE = !![]);
        } else return ![];
      }
      return (mK = Date[zm(0x5b6)]()), (mL = !![]), !![];
    }
    function mP(rH) {
      const zn = uu;
      for (let rI = 0x0; rI < rH[zn(0x87b)][zn(0xc60)]; rI++) {
        const rJ = rH[zn(0x87b)][rI];
        if (rJ[zn(0x487)][zn(0x3a1)](zn(0xd7f)) && !n7(rJ)) return rJ;
      }
    }
    function mQ() {
      const zo = uu;
      if (mJ) {
        if (mL && Date[zo(0x5b6)]() - mK < 0x1f4) {
          if (mJ[zo(0xbde)]) {
            const rH = mJ[zo(0x2de)][zo(0xa8c)];
            mJ[zo(0xbe8)](
              rH >= iM ? ny[zo(0x87b)][rH - iM + 0x1] : nz[zo(0x87b)][rH]
            );
          } else {
            if (mJ[zo(0xa83)]) {
              let rI = mP(ny) || mP(nz);
              rI && mJ[zo(0xbe8)](rI);
            }
          }
        }
        mJ[zo(0x3be)]();
        if (mJ[zo(0xa83)]) {
          (mJ[zo(0xa83)] = ![]),
            (mJ[zo(0xbde)] = !![]),
            m1[zo(0x490)][zo(0x7f2)]();
          if (mJ[zo(0x8a4)] !== mN) {
            const rJ = mJ[zo(0x2b4)];
            rJ
              ? ((mJ[zo(0x58e)] = rJ[zo(0x58e)]), n4(rJ[zo(0xd7f)]["id"], 0x1))
              : (mJ[zo(0x58e)] = iQ[zo(0x9ca)]());
            (iP[mJ[zo(0x58e)]] = mJ), n4(mJ[zo(0xd7f)]["id"], -0x1);
            const rK = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rK[zo(0xbbe)](0x0, cH[zo(0x3ce)]),
              rK[zo(0xa0a)](0x1, mJ[zo(0xd7f)]["id"]),
              rK[zo(0xbbe)](0x3, mJ[zo(0x8a4)][zo(0xa8c)]),
              ik(rK);
          }
        } else
          mJ[zo(0x8a4)] === mN
            ? (iQ[zo(0x7b8)](mJ[zo(0x58e)]),
              n4(mJ[zo(0xd7f)]["id"], 0x1),
              ik(new Uint8Array([cH[zo(0x7fc)], mJ[zo(0x2de)][zo(0xa8c)]])))
            : n6(mJ[zo(0x2de)][zo(0xa8c)], mJ[zo(0x8a4)][zo(0xa8c)]);
        mJ = null;
      }
    }
    function mR(rH) {
      const zp = uu;
      mJ && (mJ[zp(0xaa9)](rH), (mL = ![]));
    }
    var mS = document[uu(0x5d6)](uu(0xcff));
    function mT() {
      const zq = uu;
      mS[zq(0xa09)][zq(0xd21)] = zq(0x89b);
      const rH = mS[zq(0x5d6)](zq(0x3ff));
      let rI,
        rJ,
        rK = null;
      (mS[zq(0xa98)] = function (rM) {
        const zr = zq;
        rK === null &&
          ((rH[zr(0xa09)][zr(0x59c)] = rH[zr(0xa09)][zr(0xb34)] = "0"),
          (mS[zr(0xa09)][zr(0xd21)] = ""),
          ([rI, rJ] = mU(rM)),
          rL(),
          (rK = rM[zr(0x7de)]));
      }),
        (mS[zq(0xd03)] = function (rM) {
          const zs = zq;
          if (rM[zs(0x7de)] === rK) {
            const [rN, rO] = mU(rM),
              rP = rN - rI,
              rQ = rO - rJ,
              rR = mS[zs(0x17a)]();
            let rS = Math[zs(0xbe5)](rP, rQ);
            const rT = rR[zs(0x59c)] / 0x2 / kQ;
            rS > rT && (rS = rT);
            const rU = Math[zs(0x86a)](rQ, rP);
            return (
              (rH[zs(0xa09)][zs(0xb34)] = zs(0x7a2) + rU + zs(0x77c)),
              (rH[zs(0xa09)][zs(0x59c)] = rS + "px"),
              il(rU, rS / rT),
              !![]
            );
          }
        }),
        (mS[zq(0x1cb)] = function (rM) {
          const zt = zq;
          rM[zt(0x7de)] === rK &&
            ((mS[zt(0xa09)][zt(0xd21)] = zt(0x89b)), (rK = null), il(0x0, 0x0));
        });
      function rL() {
        const zu = zq;
        (mS[zu(0xa09)][zu(0x9f6)] = rI + "px"),
          (mS[zu(0xa09)][zu(0x762)] = rJ + "px");
      }
    }
    mT();
    function mU(rH) {
      const zv = uu;
      return [rH[zv(0xa39)] / kQ, rH[zv(0xc1f)] / kQ];
    }
    var mV = document[uu(0x5d6)](uu(0x6f7)),
      mW = document[uu(0x5d6)](uu(0xaa6)),
      mX = document[uu(0x5d6)](uu(0x72a)),
      mY = {},
      mZ = {};
    if (kK) {
      document[uu(0xd31)][uu(0x487)][uu(0x8d8)](uu(0xb4b)),
        (window[uu(0xc2a)] = function (rI) {
          const zw = uu;
          for (let rJ = 0x0; rJ < rI[zw(0x334)][zw(0xc60)]; rJ++) {
            const rK = rI[zw(0x334)][rJ],
              rL = rK[zw(0x6a9)];
            if (rL === kh) {
              mS[zw(0xa98)](rK);
              continue;
            } else {
              if (rL === mW)
                pp(zw(0xa77), !![]),
                  (mY[rK[zw(0x7de)]] = function () {
                    const zx = zw;
                    pp(zx(0xa77), ![]);
                  });
              else {
                if (rL === mV)
                  pp(zw(0x435), !![]),
                    (mY[rK[zw(0x7de)]] = function () {
                      const zy = zw;
                      pp(zy(0x435), ![]);
                    });
                else
                  rL === mX &&
                    (pp(zw(0x14f), !![]),
                    (mY[rK[zw(0x7de)]] = function () {
                      const zz = zw;
                      pp(zz(0x14f), ![]);
                    }));
              }
            }
            if (mJ) continue;
            if (rL[zw(0xd7f)]) {
              const rM = n2(rL);
              mO(rK),
                mJ && (mZ[rK[zw(0x7de)]] = mR),
                (mY[rK[zw(0x7de)]] = function () {
                  const zA = zw;
                  mJ && mQ(), (rM[zA(0x5ef)] = ![]);
                });
            }
          }
        });
      const rH = {};
      (rH[uu(0xa36)] = ![]),
        document[uu(0xa52)](
          uu(0xae0),
          function (rI) {
            const zB = uu;
            for (let rJ = 0x0; rJ < rI[zB(0x334)][zB(0xc60)]; rJ++) {
              const rK = rI[zB(0x334)][rJ];
              mS[zB(0xd03)](rK) && rI[zB(0x47c)]();
              if (mZ[rK[zB(0x7de)]]) mZ[rK[zB(0x7de)]](rK), rI[zB(0x47c)]();
              else mJ && rI[zB(0x47c)]();
            }
          },
          rH
        ),
        (window[uu(0xb2d)] = function (rI) {
          const zC = uu;
          for (let rJ = 0x0; rJ < rI[zC(0x334)][zC(0xc60)]; rJ++) {
            const rK = rI[zC(0x334)][rJ];
            mS[zC(0x1cb)](rK),
              mY[rK[zC(0x7de)]] &&
                (mY[rK[zC(0x7de)]](),
                delete mY[rK[zC(0x7de)]],
                delete mZ[rK[zC(0x7de)]]);
          }
        });
    } else {
      document[uu(0xd31)][uu(0x487)][uu(0x8d8)](uu(0x8e5));
      let rI = ![];
      (window[uu(0x2c0)] = function (rJ) {
        const zD = uu;
        rJ[zD(0xb58)] === 0x0 && ((rI = !![]), mO(rJ));
      }),
        (document[uu(0xd4f)] = function (rJ) {
          const zE = uu;
          mR(rJ);
          const rK = rJ[zE(0x6a9)];
          if (rK[zE(0xd7f)] && !rI) {
            const rL = n2(rK);
            rK[zE(0x4e3)] = rK[zE(0x2c0)] = function () {
              const zF = zE;
              rL[zF(0x5ef)] = ![];
            };
          }
        }),
        (document[uu(0xa89)] = function (rJ) {
          const zG = uu;
          rJ[zG(0xb58)] === 0x0 && ((rI = ![]), mQ());
        }),
        (kl[uu(0xd4f)] = kh[uu(0xd4f)] =
          function (rJ) {
            const zH = uu;
            (nc = rJ[zH(0xa39)] - kT() / 0x2),
              (nd = rJ[zH(0xc1f)] - kU() / 0x2);
            if (!pa[zH(0x19a)] && ix && !mE) {
              const rK = Math[zH(0xbe5)](nc, nd),
                rL = Math[zH(0x86a)](nd, nc);
              il(rL, rK < 0x32 ? rK / 0x64 : 0x1);
            }
          });
    }
    function n0(rJ, rK, rL) {
      const zI = uu;
      return Math[zI(0x9b2)](rK, Math[zI(0xd8d)](rJ, rL));
    }
    var n1 = [];
    function n2(rJ) {
      const zJ = uu;
      let rK = n1[zJ(0x501)]((rL) => rL["el"] === rJ);
      if (rK) return (rK[zJ(0x5ef)] = !![]), rK;
      (rK =
        typeof rJ[zJ(0xd7f)] === zJ(0xa40)
          ? rJ[zJ(0xd7f)]()
          : nJ(rJ[zJ(0xd7f)], rJ[zJ(0xa03)])),
        (rK[zJ(0x5ef)] = !![]),
        (rK[zJ(0x217)] = 0x0),
        (rK[zJ(0xa09)][zJ(0xdba)] = zJ(0xbdf)),
        (rK[zJ(0xa09)][zJ(0xb34)] = zJ(0x89b)),
        kG[zJ(0xd82)](rK);
      if (kK)
        (rK[zJ(0xa09)][zJ(0x85e)] = zJ(0x30e)),
          (rK[zJ(0xa09)][zJ(0x762)] = zJ(0x30e)),
          (rK[zJ(0xa09)][zJ(0x2fc)] = zJ(0x939)),
          (rK[zJ(0xa09)][zJ(0x9f6)] = zJ(0x939));
      else {
        const rL = rJ[zJ(0x17a)](),
          rM = rK[zJ(0x17a)]();
        (rK[zJ(0xa09)][zJ(0x762)] =
          n0(
            rJ[zJ(0x9b0)]
              ? (rL[zJ(0x762)] + rL[zJ(0x52a)]) / kQ + 0xa
              : (rL[zJ(0x762)] - rM[zJ(0x52a)]) / kQ - 0xa,
            0xa,
            window[zJ(0xc9c)] / kQ - 0xa
          ) + "px"),
          (rK[zJ(0xa09)][zJ(0x9f6)] =
            n0(
              (rL[zJ(0x9f6)] + rL[zJ(0x59c)] / 0x2 - rM[zJ(0x59c)] / 0x2) / kQ,
              0xa,
              window[zJ(0x223)] / kQ - 0xa - rM[zJ(0x59c)] / kQ
            ) + "px"),
          (rK[zJ(0xa09)][zJ(0x2fc)] = zJ(0x939)),
          (rK[zJ(0xa09)][zJ(0x85e)] = zJ(0x939));
      }
      return (
        (rK[zJ(0xa09)][zJ(0x982)] = zJ(0x89b)),
        (rK[zJ(0xa09)][zJ(0x844)] = 0x0),
        (rK["el"] = rJ),
        n1[zJ(0x7b8)](rK),
        rK
      );
    }
    var n3 = document[uu(0x5d6)](uu(0xd86));
    function n4(rJ, rK = 0x1) {
      const zK = uu;
      !iR[rJ] && ((iR[rJ] = 0x0), p9(rJ), ob()),
        (iR[rJ] += rK),
        o9[rJ][zK(0x25d)](iR[rJ]),
        iR[rJ] <= 0x0 && (delete iR[rJ], o9[rJ][zK(0xc1c)](), ob()),
        n5();
    }
    function n5() {
      const zL = uu;
      n3[zL(0x679)] = "";
      Object[zL(0xd6d)](iR)[zL(0xc60)] === 0x0
        ? (n3[zL(0xa09)][zL(0xd21)] = zL(0x89b))
        : (n3[zL(0xa09)][zL(0xd21)] = "");
      const rJ = {};
      for (const rK in iR) {
        const rL = dB[rK],
          rM = iR[rK];
        rJ[rL[zL(0x308)]] = (rJ[rL[zL(0x308)]] || 0x0) + rM;
      }
      oD(n3, rJ);
      for (const rN in op) {
        const rO = op[rN];
        rO[zL(0x487)][rJ[rN] ? zL(0x5e5) : zL(0x8d8)](zL(0x86b));
      }
    }
    function n6(rJ, rK) {
      const zM = uu;
      if (rJ === rK) return;
      ik(new Uint8Array([cH[zM(0x6ef)], rJ, rK]));
    }
    function n7(rJ) {
      const zN = uu;
      return rJ[zN(0x763)] || rJ[zN(0x5d6)](zN(0xb6a));
    }
    function n8(rJ, rK, rL = !![]) {
      const zO = uu,
        rM = mI[zO(0x501)]((rW) => rW === rJ);
      if (rM) return rM[zO(0x7e4)](rK), rM;
      let rN,
        rO,
        rP,
        rQ,
        rR = 0x0,
        rS = 0x0,
        rT = 0x0,
        rU;
      (rJ[zO(0x7e4)] = function (rW, rX) {
        const zP = zO;
        (rU = rJ[zP(0x8a4)] || rJ[zP(0x550)]),
          (rU[zP(0x763)] = rJ),
          (rJ[zP(0x2de)] = rU),
          (rJ[zP(0xd50)] = ![]),
          (rJ[zP(0x951)] = ![]);
        const rY = rJ[zP(0x17a)]();
        rW[zP(0x8b7)] === void 0x0
          ? ((rR = rW[zP(0xa39)] - rY["x"]),
            (rS = rW[zP(0xc1f)] - rY["y"]),
            rJ[zP(0xaa9)](rW),
            (rN = rP),
            (rO = rQ))
          : ((rN = rY["x"]),
            (rO = rY["y"]),
            rJ[zP(0xbe8)](rW),
            rJ[zP(0x3be)](rX)),
          rV();
      }),
        (rJ[zO(0x3be)] = function (rW = !![]) {
          const zQ = zO;
          rJ[zQ(0x951)] = !![];
          rU[zQ(0x763)] === rJ && (rU[zQ(0x763)] = null);
          if (!rJ[zQ(0x8a4)])
            rJ[zQ(0xbe8)](rU),
              Math[zQ(0xbe5)](rP - rN, rQ - rO) > 0x32 * kQ &&
                rJ[zQ(0xbe8)](mN);
          else {
            if (rW) {
              const rX = n7(rJ[zQ(0x8a4)]);
              (rJ[zQ(0x2b4)] = rX), rX && n8(rX, rU, ![]);
            }
          }
          rJ[zQ(0x8a4)] !== rU && (rJ[zQ(0xa33)] = 0x0),
            (rJ[zQ(0x8a4)][zQ(0x763)] = rJ);
        }),
        (rJ[zO(0xbe8)] = function (rW) {
          const zR = zO;
          rJ[zR(0x8a4)] = rW;
          const rX = rW[zR(0x17a)]();
          (rP = rX["x"]),
            (rQ = rX["y"]),
            (rJ[zR(0xa09)][zR(0x9fa)] =
              rW === mN ? zR(0xca9) : getComputedStyle(rW)[zR(0x9fa)]);
        }),
        (rJ[zO(0xaa9)] = function (rW) {
          const zS = zO;
          (rP = rW[zS(0xa39)] - rR),
            (rQ = rW[zS(0xc1f)] - rS),
            (rJ[zS(0x8a4)] = null);
          let rX = Infinity,
            rY = null;
          const rZ = kn[zS(0x828)](zS(0x1d7));
          for (let s0 = 0x0; s0 < rZ[zS(0xc60)]; s0++) {
            const s1 = rZ[s0],
              s2 = s1[zS(0x17a)](),
              s3 = Math[zS(0xbe5)](
                s2["x"] + s2[zS(0x59c)] / 0x2 - rW[zS(0xa39)],
                s2["y"] + s2[zS(0x52a)] / 0x2 - rW[zS(0xc1f)]
              );
            s3 < 0x1e * kQ && s3 < rX && ((rY = s1), (rX = s3));
          }
          rY && rY !== rU && rJ[zS(0xbe8)](rY);
        }),
        rJ[zO(0x7e4)](rK, rL),
        rJ[zO(0x487)][zO(0x8d8)](zO(0x324)),
        kG[zO(0xd82)](rJ);
      function rV() {
        const zT = zO;
        (rJ[zT(0xa09)][zT(0x9f6)] = rN / kQ + "px"),
          (rJ[zT(0xa09)][zT(0x762)] = rO / kQ + "px");
      }
      return (
        (rJ[zO(0x18d)] = function () {
          const zU = zO;
          rJ[zU(0x8a4)] && rJ[zU(0xbe8)](rJ[zU(0x8a4)]);
        }),
        (rJ[zO(0x630)] = function () {
          const zV = zO;
          (rN = pv(rN, rP, 0x64)), (rO = pv(rO, rQ, 0x64)), rV();
          let rW = 0x0,
            rX = Infinity;
          rJ[zV(0x8a4)]
            ? ((rX = Math[zV(0xbe5)](rP - rN, rQ - rO)),
              (rW = rX > 0x5 ? 0x1 : 0x0))
            : (rW = 0x1),
            (rT = pv(rT, rW, 0x64)),
            (rJ[zV(0xa09)][zV(0xb34)] =
              zV(0x85b) +
              (0x1 + 0.3 * rT) +
              zV(0x7af) +
              rT * Math[zV(0xdad)](Date[zV(0x5b6)]() / 0x96) * 0xa +
              zV(0xc16)),
            rJ[zV(0x951)] &&
              rT < 0.05 &&
              rX < 0x5 &&
              (rJ[zV(0x487)][zV(0x5e5)](zV(0x324)),
              (rJ[zV(0xa09)][zV(0x9f6)] =
                rJ[zV(0xa09)][zV(0x762)] =
                rJ[zV(0xa09)][zV(0xb34)] =
                rJ[zV(0xa09)][zV(0x9fa)] =
                rJ[zV(0xa09)][zV(0x854)] =
                  ""),
              (rJ[zV(0xd50)] = !![]),
              rJ[zV(0x8a4)][zV(0xd82)](rJ),
              (rJ[zV(0x8a4)][zV(0x763)] = null),
              (rJ[zV(0x8a4)] = null));
        }),
        mI[zO(0x7b8)](rJ),
        rJ
      );
    }
    var n9 = cX[uu(0x4a1)];
    document[uu(0x23f)] = function () {
      return ![];
    };
    var na = 0x0,
      nb = 0x0,
      nc = 0x0,
      nd = 0x0,
      ne = 0x1,
      nf = 0x1;
    document[uu(0xac4)] = function (rJ) {
      const zW = uu;
      rJ[zW(0x6a9)] === kh &&
        ((ne *= rJ[zW(0xa14)] < 0x0 ? 1.1 : 0.9),
        (ne = Math[zW(0xd8d)](0x3, Math[zW(0x9b2)](0x1, ne))));
    };
    const ng = {};
    (ng[uu(0xdd3)] = uu(0xa6b)),
      (ng["me"] = uu(0xbaf)),
      (ng[uu(0x648)] = uu(0x956));
    var nh = ng,
      ni = {};
    function nj(rJ, rK) {
      nk(rJ, null, null, null, jw(rK));
    }
    function nk(rJ, rK, rL, rM = nh[uu(0xdd3)], rN) {
      const zX = uu,
        rO = nP(zX(0x4b7));
      if (!rN) {
        if (rK) {
          const rQ = nP(zX(0x69b));
          k7(rQ, rK + ":"), rO[zX(0xd82)](rQ);
        }
        const rP = nP(zX(0x1ca));
        k7(rP, rL),
          rO[zX(0xd82)](rP),
          (rO[zX(0x87b)][0x0][zX(0xa09)][zX(0x25b)] = rM),
          rK && rO[zX(0xc71)](nP(zX(0x97f)));
      } else rO[zX(0x679)] = rN;
      pi[zX(0xd82)](rO);
      while (pi[zX(0x87b)][zX(0xc60)] > 0x3c) {
        pi[zX(0x87b)][0x0][zX(0x5e5)]();
      }
      return (
        (pi[zX(0x54f)] = pi[zX(0x261)]),
        (rO[zX(0x240)] = rL),
        (rO[zX(0xdef)] = rM),
        nl(rJ, rO),
        rO
      );
    }
    function nl(rJ, rK) {
      const zY = uu;
      (rK["t"] = 0x0), (rK[zY(0x4b1)] = 0x0);
      if (!ni[rJ]) ni[rJ] = [];
      ni[rJ][zY(0x7b8)](rK);
    }
    var nm = {};
    kh[uu(0x2c0)] = window[uu(0xa89)] = nu(function (rJ) {
      const zZ = uu,
        rK = zZ(0xdde) + rJ[zZ(0xb58)];
      pp(rK, rJ[zZ(0x909)] === zZ(0x3b5));
    });
    var nn = 0x0;
    function no(rJ) {
      const A0 = uu,
        rK = 0x200,
        rL = rK / 0x64,
        rM = document[A0(0x57c)](A0(0xa75));
      rM[A0(0x59c)] = rM[A0(0x52a)] = rK;
      const rN = rM[A0(0xc6f)]("2d");
      rN[A0(0xbd2)](rK / 0x2, rK / 0x2), rN[A0(0xd57)](rL), rJ[A0(0x231)](rN);
      const rO = (rJ[A0(0xdb2)] ? A0(0x8eb) : A0(0x64c)) + rJ[A0(0x1a6)];
      np(rM, rO);
    }
    function np(rJ, rK) {
      const A1 = uu,
        rL = document[A1(0x57c)]("a");
      (rL[A1(0xa97)] = rK),
        (rL[A1(0x136)] = typeof rJ === A1(0x184) ? rJ : rJ[A1(0x40f)]()),
        rL[A1(0x7d6)](),
        hJ(rK + A1(0xb25), hO[A1(0xc03)]);
    }
    var nq = 0x0;
    setInterval(function () {
      nq = 0x0;
    }, 0x1770),
      setInterval(function () {
        const A2 = uu;
        nv[A2(0xc60)] = 0x0;
      }, 0x2710);
    var nr = ![],
      ns = ![];
    function nt(rJ) {
      const A3 = uu;
      rJ = rJ[A3(0x3ab)]();
      if (!rJ) hJ(A3(0xcbe)), hb(A3(0xcbe));
      else
        rJ[A3(0xc60)] < cM || rJ[A3(0xc60)] > cL
          ? (hJ(A3(0x667)), hb(A3(0x667)))
          : (hJ(A3(0x30f) + rJ + A3(0xbc3), hO[A3(0x274)]),
            hb(A3(0x30f) + rJ + A3(0xbc3)),
            mw(rJ));
    }
    document[uu(0x715)] = document[uu(0x840)] = nu(function (rJ) {
      const A4 = uu;
      rJ[A4(0x488)] && rJ[A4(0x47c)]();
      (nr = rJ[A4(0x488)]), (ns = rJ[A4(0x862)]);
      if (rJ[A4(0x87c)] === 0x9) {
        rJ[A4(0x47c)]();
        return;
      }
      if (document[A4(0xd47)] && document[A4(0xd47)][A4(0x8b7)] === A4(0xe1c)) {
        if (rJ[A4(0x909)] === A4(0xd2a) && rJ[A4(0x87c)] === 0xd) {
          if (document[A4(0xd47)] === hE) hF[A4(0x7d6)]();
          else {
            if (document[A4(0xd47)] === ph) {
              let rK = ph[A4(0xc04)][A4(0x3ab)]()[A4(0xb56)](0x0, cK);
              if (rK && hV) {
                if (pO - nn > 0x3e8) {
                  const rL = rK[A4(0xa69)](A4(0xe37));
                  if (rL || rK[A4(0xa69)](A4(0xc0f))) {
                    const rM = rK[A4(0xb56)](rL ? 0x7 : 0x9);
                    if (!rM) hJ(A4(0x938));
                    else {
                      if (rL) {
                        const rN = eL[rM];
                        !rN ? hJ(A4(0x351) + rM + "!") : no(rN);
                      } else {
                        const rO = dE[rM];
                        !rO ? hJ(A4(0xc3e) + rM + "!") : no(rO);
                      }
                    }
                  } else {
                    if (rK[A4(0xa69)](A4(0x21b))) np(qw, A4(0x78f));
                    else {
                      let inputChat = rK;
                      if(inputChat.startsWith('/toggle')){
                          hack.commandMultiArg('toggle', 2, inputChat);
                      }else if(inputChat.startsWith('/list')){
                          hack.addChat('List of module and configs:');
                          hack.listModule();
                      }else if(inputChat.startsWith('/help')){
                          hack.getHelp();
                      }else if(inputChat.startsWith('/server')){
                          hack.addChat('Current server: ' + hack.getServer());
                      }else if(inputChat.startsWith('/wave')){
                          hack.addChat(hack.getWave());
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
                   }else if(hack.notCommand(inputChat.split(' ')[0])){
                          hack.addError('Invalid command!');
                      }else
                      if (rK[A4(0xa69)](A4(0x8dc))) {
                        const rP = rK[A4(0xb56)](0x9);
                        nt(rP);
                      } else {
                        hack.speak = (txt) => {
                        let rQ = 0x0;
                        for (let rR = 0x0; rR < nv[A4(0xc60)]; rR++) {
                          nw(txt, nv[rR]) > 0.95 && rQ++;
                        }
                        rQ >= 0x3 && (nq += 0xa);
                        nq++;
                        if (nq > 0x3) hJ(A4(0xa18)), (nn = pO + 0xea60);
                        else {
                          nv[A4(0x7b8)](txt);
                          if (nv[A4(0xc60)] > 0xa) nv[A4(0xd43)]();
                          (txt = decodeURIComponent(
                            encodeURIComponent(txt)
                              [A4(0x88f)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                              [A4(0x88f)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                          )),
                            ik(
                              new Uint8Array([
                                cH[A4(0x260)],
                                ...new TextEncoder()[A4(0xb80)](txt),
                              ])
                            ),
                            (nn = pO);
                        }};
                        hack.speak(inputChat);
                      }
                    }
                  }
                } else nk(-0x1, null, A4(0xe39), nh[A4(0x648)]);
              }
              (ph[A4(0xc04)] = ""), ph[A4(0x1c8)]();
            }
          }
        }
        return;
      }
      pp(rJ[A4(0x5e4)], rJ[A4(0x909)] === A4(0x5d5));
    });
    function nu(rJ) {
      return function (rK) {
        const A5 = b;
        rK instanceof Event && rK[A5(0x6ed)] && !rK[A5(0x4c2)] && rJ(rK);
      };
    }
    var nv = [];
    function nw(rJ, rK) {
      const A6 = uu;
      var rL = rJ,
        rM = rK;
      rJ[A6(0xc60)] < rK[A6(0xc60)] && ((rL = rK), (rM = rJ));
      var rN = rL[A6(0xc60)];
      if (rN == 0x0) return 0x1;
      return (rN - nx(rL, rM)) / parseFloat(rN);
    }
    function nx(rJ, rK) {
      const A7 = uu;
      (rJ = rJ[A7(0xded)]()), (rK = rK[A7(0xded)]());
      var rL = new Array();
      for (var rM = 0x0; rM <= rJ[A7(0xc60)]; rM++) {
        var rN = rM;
        for (var rO = 0x0; rO <= rK[A7(0xc60)]; rO++) {
          if (rM == 0x0) rL[rO] = rO;
          else {
            if (rO > 0x0) {
              var rP = rL[rO - 0x1];
              if (rJ[A7(0xff)](rM - 0x1) != rK[A7(0xff)](rO - 0x1))
                rP = Math[A7(0xd8d)](Math[A7(0xd8d)](rP, rN), rL[rO]) + 0x1;
              (rL[rO - 0x1] = rN), (rN = rP);
            }
          }
        }
        if (rM > 0x0) rL[rK[A7(0xc60)]] = rN;
      }
      return rL[rK[A7(0xc60)]];
    }
    var ny = document[uu(0x5d6)](uu(0xa57)),
      nz = document[uu(0x5d6)](uu(0x9ee));
    function nA(rJ, rK = 0x1) {
      const A8 = uu;
      rJ[A8(0xb1a)](),
        rJ[A8(0x5df)](0.25 * rK, 0.25 * rK),
        rJ[A8(0xbd2)](-0x4b, -0x4b),
        rJ[A8(0x540)](),
        rJ[A8(0xc4d)](0x4b, 0x28),
        rJ[A8(0xc0b)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        rJ[A8(0xc0b)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        rJ[A8(0xc0b)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        rJ[A8(0xc0b)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        rJ[A8(0xc0b)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        rJ[A8(0xc0b)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (rJ[A8(0xc50)] = A8(0x7b4)),
        rJ[A8(0xa90)](),
        (rJ[A8(0xd4e)] = rJ[A8(0xe13)] = A8(0xbb6)),
        (rJ[A8(0xdf1)] = A8(0x736)),
        (rJ[A8(0x930)] = 0xc),
        rJ[A8(0x5b9)](),
        rJ[A8(0xaea)]();
    }
    for (let rJ = 0x0; rJ < dB[uu(0xc60)]; rJ++) {
      const rK = dB[rJ];
      if (rK[uu(0x974)] !== void 0x0)
        switch (rK[uu(0x974)]) {
          case de[uu(0x2d7)]:
            rK[uu(0x231)] = function (rL) {
              const A9 = uu;
              rL[A9(0x5df)](2.5, 2.5), lN(rL);
            };
            break;
          case de[uu(0x68c)]:
            rK[uu(0x231)] = function (rL) {
              const Aa = uu;
              rL[Aa(0xd57)](0.9);
              const rM = pU();
              (rM[Aa(0x25a)] = !![]), rM[Aa(0xd6f)](rL);
            };
            break;
          case de[uu(0x5e3)]:
            rK[uu(0x231)] = function (rL) {
              const Ab = uu;
              rL[Ab(0x5f9)](-Math["PI"] / 0x2),
                rL[Ab(0xbd2)](-0x30, 0x0),
                pT[Ab(0x541)](rL, ![]);
            };
            break;
          case de[uu(0x5dd)]:
            rK[uu(0x231)] = function (rL) {
              const Ac = uu;
              rL[Ac(0x5f9)](Math["PI"] / 0xa),
                rL[Ac(0xbd2)](0x3, 0x15),
                lO(rL, !![]);
            };
            break;
          case de[uu(0x3f2)]:
            rK[uu(0x231)] = function (rL) {
              nA(rL);
            };
            break;
          case de[uu(0x499)]:
            rK[uu(0x231)] = function (rL) {
              const Ad = uu;
              rL[Ad(0xbd2)](0x0, 0x3),
                rL[Ad(0x5f9)](-Math["PI"] / 0x4),
                rL[Ad(0xd57)](0.4),
                pT[Ad(0x387)](rL),
                rL[Ad(0x540)](),
                rL[Ad(0x660)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rL[Ad(0x930)] = 0x8),
                (rL[Ad(0xdf1)] = Ad(0xa15)),
                rL[Ad(0x5b9)]();
            };
            break;
          case de[uu(0x2d3)]:
            rK[uu(0x231)] = function (rL) {
              const Ae = uu;
              rL[Ae(0xbd2)](0x0, 0x7),
                rL[Ae(0xd57)](0.8),
                pT[Ae(0xd5c)](rL, 0.5);
            };
            break;
          case de[uu(0x727)]:
            rK[uu(0x231)] = function (rL) {
              const Af = uu;
              rL[Af(0xd57)](1.3), lR(rL);
            };
            break;
          default:
            rK[uu(0x231)] = function (rL) {};
        }
      else {
        const rL = new lF(
          -0x1,
          rK[uu(0x909)],
          0x0,
          0x0,
          rK[uu(0xa4e)],
          rK[uu(0x778)] ? 0x10 : rK[uu(0x423)] * 1.1,
          0x0
        );
        (rL[uu(0xa28)] = !![]),
          rK[uu(0x9dd)] === 0x1
            ? (rK[uu(0x231)] = function (rM) {
                const Ag = uu;
                rL[Ag(0xd6f)](rM);
              })
            : (rK[uu(0x231)] = function (rM) {
                const Ah = uu;
                for (let rN = 0x0; rN < rK[Ah(0x9dd)]; rN++) {
                  rM[Ah(0xb1a)]();
                  const rO = (rN / rK[Ah(0x9dd)]) * Math["PI"] * 0x2;
                  rK[Ah(0x597)]
                    ? rM[Ah(0xbd2)](...ld(rK[Ah(0x576)], 0x0, rO))
                    : (rM[Ah(0x5f9)](rO), rM[Ah(0xbd2)](rK[Ah(0x576)], 0x0)),
                    rM[Ah(0x5f9)](rK[Ah(0x93c)]),
                    rL[Ah(0xd6f)](rM),
                    rM[Ah(0xaea)]();
                }
              });
      }
    }
    const nB = {};
    (nB[uu(0x64f)] = uu(0xc6c)),
      (nB[uu(0xe4c)] = uu(0xbcb)),
      (nB[uu(0xe63)] = uu(0x50a)),
      (nB[uu(0xe33)] = uu(0xb11)),
      (nB[uu(0x8ac)] = uu(0x621)),
      (nB[uu(0x2a6)] = uu(0x918)),
      (nB[uu(0x561)] = uu(0x96d));
    var nC = nB;
    function nD() {
      const Ai = uu,
        rM = document[Ai(0x5d6)](Ai(0x525));
      let rN = Ai(0x257);
      for (let rO = 0x0; rO < 0xc8; rO++) {
        const rP = d5(rO),
          rQ = 0xc8 * rP,
          rR = 0x19 * rP,
          rS = d4(rO);
        rN +=
          Ai(0xd3f) +
          (rO + 0x1) +
          Ai(0x18a) +
          k8(Math[Ai(0xbb6)](rQ)) +
          Ai(0x18a) +
          k8(Math[Ai(0xbb6)](rR)) +
          Ai(0x18a) +
          rS +
          Ai(0x817);
      }
      (rN += Ai(0xd9c)), (rN += Ai(0x388)), (rM[Ai(0x679)] = rN);
    }
    nD();
    function nE(rM, rN) {
      const Aj = uu,
        rO = eL[rM],
        rP = rO[Aj(0x1a6)],
        rQ = rO[Aj(0x308)];
      return (
        "x" +
        rN[Aj(0x9dd)] * rN[Aj(0x107)] +
        ("\x20" + rP + Aj(0x665) + hP[rQ] + Aj(0xbfc) + hM[rQ] + ")")
      );
    }
    function nF(rM) {
      const Ak = uu;
      return rM[Ak(0x9f2)](0x2)[Ak(0x88f)](/\.?0+$/, "");
    }
    function nG(rM) {
      const Al = uu,
        rN = rM[Al(0x993)];
      return Math[Al(0xbb6)]((rN * rN) / (0x32 * 0x32));
    }
    var nH = [
        [uu(0xe45), uu(0xddc), nC[uu(0x64f)]],
        [uu(0x9d4), uu(0x374), nC[uu(0xe4c)]],
        [uu(0x643), uu(0x208), nC[uu(0xe63)]],
        [uu(0xa27), uu(0x8bd), nC[uu(0xe33)]],
        [uu(0x789), uu(0xb96), nC[uu(0x2a6)]],
        [uu(0x5cb), uu(0x3d7), nC[uu(0x8ac)]],
        [uu(0x5dc), uu(0x5c2), nC[uu(0x561)]],
        [uu(0x8bb), uu(0x220), nC[uu(0x561)], (rM) => "+" + k8(rM)],
        [uu(0x62f), uu(0x307), nC[uu(0x561)], (rM) => "+" + k8(rM)],
        [uu(0x8e2), uu(0x955), nC[uu(0x561)]],
        [
          uu(0x7c9),
          uu(0x5fe),
          nC[uu(0x561)],
          (rM) => Math[uu(0xbb6)](rM * 0x64) + "%",
        ],
        [uu(0xe2c), uu(0xe4b), nC[uu(0x561)], (rM) => "+" + nF(rM) + uu(0x16e)],
        [uu(0x382), uu(0x17b), nC[uu(0xe63)], (rM) => k8(rM) + "/s"],
        [uu(0xafb), uu(0x17b), nC[uu(0xe63)], (rM) => k8(rM) + uu(0xa9a)],
        [
          uu(0x88e),
          uu(0xaee),
          nC[uu(0x561)],
          (rM) => (rM > 0x0 ? "+" : "") + rM,
        ],
        [uu(0xccd), uu(0x96b), nC[uu(0x8ac)], (rM) => "+" + rM + "%"],
        [
          uu(0x2a1),
          uu(0x199),
          nC[uu(0x8ac)],
          (rM) => "+" + parseInt(rM * 0x64) + "%",
        ],
        [uu(0xc0e), uu(0x668), nC[uu(0x561)], (rM) => "-" + rM + "%"],
        [uu(0x6e7), uu(0xdcf), nC[uu(0x561)], nE],
        [uu(0x2e2), uu(0x914), nC[uu(0x8ac)], (rM) => rM / 0x3e8 + "s"],
        [uu(0x76f), uu(0x5b5), nC[uu(0x8ac)], (rM) => rM + "s"],
        [uu(0xbd6), uu(0xb3a), nC[uu(0x8ac)], (rM) => k8(rM) + uu(0x121)],
        [uu(0xb5e), uu(0x68a), nC[uu(0x8ac)], (rM) => rM + "s"],
        [uu(0x559), uu(0x335), nC[uu(0x8ac)], (rM) => rM / 0x3e8 + "s"],
        [uu(0x50f), uu(0x127), nC[uu(0x8ac)]],
        [uu(0x41d), uu(0x293), nC[uu(0x8ac)]],
        [uu(0x4e2), uu(0x8ad), nC[uu(0x8ac)], (rM) => rM + uu(0x158)],
        [uu(0x400), uu(0x7c8), nC[uu(0x8ac)], (rM) => rM + uu(0x158)],
        [uu(0xe3d), uu(0x718), nC[uu(0x8ac)]],
        [uu(0x7f6), uu(0xc5c), nC[uu(0x561)]],
        [uu(0xbf2), uu(0x233), nC[uu(0x8ac)], (rM) => rM / 0x3e8 + "s"],
        [uu(0x29f), uu(0xa06), nC[uu(0xe63)], (rM) => k8(rM) + "/s"],
        [
          uu(0xd2d),
          uu(0x744),
          nC[uu(0x8ac)],
          (rM, rN) => k8(rM) + uu(0x57e) + k8(nG(rN) * rM * 0x14) + uu(0xc18),
        ],
        [
          uu(0x993),
          uu(0x6bc),
          nC[uu(0x561)],
          (rM, rN) => k8(rM) + "\x20(" + nG(rN) + uu(0x511),
        ],
        [
          uu(0xab8),
          uu(0xbb1),
          nC[uu(0x8ac)],
          (rM, rN) => nF(rM * rN[uu(0x423)]),
        ],
        [uu(0xbca), uu(0x46c), nC[uu(0x8ac)]],
        [uu(0x12a), uu(0xe4a), nC[uu(0x561)]],
        [uu(0x2bd), uu(0x326), nC[uu(0x8ac)]],
        [uu(0x469), uu(0xdf6), nC[uu(0x8ac)]],
        [uu(0xaba), uu(0xae8), nC[uu(0x8ac)]],
        [
          uu(0x7e8),
          uu(0xe02),
          nC[uu(0x8ac)],
          (rM) => "+" + nF(rM * 0x64) + "%",
        ],
        [uu(0x3c8), uu(0xa63), nC[uu(0x2a6)]],
        [uu(0xdc1), uu(0xdfa), nC[uu(0x8ac)]],
        [uu(0xa73), uu(0xc82), nC[uu(0xe63)]],
        [uu(0x164), uu(0x5b5), nC[uu(0x8ac)], (rM) => rM + "s"],
        [uu(0x9c7), uu(0xb30), nC[uu(0x8ac)]],
        [uu(0x3dd), uu(0x620), nC[uu(0x561)], (rM) => rM / 0x3e8 + "s"],
      ],
      nI = [
        [uu(0xb7e), uu(0x93e), nC[uu(0x8ac)]],
        [uu(0x468), uu(0xe2f), nC[uu(0x561)], (rM) => k8(rM * 0x64) + "%"],
        [uu(0xa4c), uu(0xb9b), nC[uu(0x561)]],
        [uu(0x5aa), uu(0x25c), nC[uu(0x8ac)]],
        [uu(0x684), uu(0x3aa), nC[uu(0x561)]],
        [uu(0xccd), uu(0x96b), nC[uu(0x8ac)], (rM) => "+" + rM + "%"],
        [uu(0xd68), uu(0xd64), nC[uu(0x8ac)], (rM) => k8(rM) + "/s"],
        [uu(0xc48), uu(0x72c), nC[uu(0x64f)], (rM) => rM * 0x64 + uu(0x14a)],
        [uu(0x551), uu(0xaff), nC[uu(0x8ac)], (rM) => rM + "s"],
        [
          uu(0x425),
          uu(0x708),
          nC[uu(0x561)],
          (rM) => "-" + parseInt((0x1 - rM) * 0x64) + "%",
        ],
      ];
    function nJ(rM, rN = !![]) {
      const Am = uu;
      let rO = "",
        rP = "",
        rQ;
      rM[Am(0x974)] === void 0x0
        ? ((rQ = nH),
          rM[Am(0xe25)] &&
            (rP =
              Am(0x73a) +
              (rM[Am(0xe25)] / 0x3e8 +
                "s" +
                (rM[Am(0xa9d)] > 0x0
                  ? Am(0x59a) + rM[Am(0xa9d)] / 0x3e8 + "s"
                  : "")) +
              Am(0x40a)))
        : (rQ = nI);
      for (let rS = 0x0; rS < rQ[Am(0xc60)]; rS++) {
        const [rT, rU, rV, rW] = rQ[rS],
          rX = rM[rT];
        rX &&
          rX !== 0x0 &&
          (rO +=
            Am(0x646) +
            rV +
            Am(0xc90) +
            rU +
            Am(0x109) +
            (rW ? rW(rX, rM) : k8(rX)) +
            Am(0xb42));
      }
      const rR = nP(
        Am(0x322) +
          rM[Am(0x1a6)] +
          Am(0x1fc) +
          hM[rM[Am(0x308)]] +
          Am(0xaa1) +
          hP[rM[Am(0x308)]] +
          Am(0x547) +
          rP +
          Am(0x418) +
          rM[Am(0x801)] +
          Am(0x547) +
          rO +
          Am(0xb85)
      );
      if (rM[Am(0x613)] && rN) {
        rR[Am(0x457)][Am(0xa09)][Am(0x735)] = Am(0x30e);
        for (let rY = 0x0; rY < rM[Am(0x613)][Am(0xc60)]; rY++) {
          const [rZ, s0] = rM[Am(0x613)][rY],
            s1 = nP(Am(0x847));
          rR[Am(0xd82)](s1);
          const s2 = f4[s0][rM[Am(0x308)]];
          for (let s3 = 0x0; s3 < s2[Am(0xc60)]; s3++) {
            const [s4, s5] = s2[s3],
              s6 = eV(rZ, s5),
              s7 = nP(
                Am(0x741) +
                  s6[Am(0x308)] +
                  "\x22\x20" +
                  qz(s6) +
                  Am(0x298) +
                  s4 +
                  Am(0xb48)
              );
            s1[Am(0xd82)](s7);
          }
        }
      }
      return rR;
    }
    function nK() {
      const An = uu;
      mJ && (mJ[An(0x5e5)](), (mJ = null));
      const rM = kn[An(0x828)](An(0xb6a));
      for (let rN = 0x0; rN < rM[An(0xc60)]; rN++) {
        const rO = rM[rN];
        rO[An(0x5e5)]();
      }
      for (let rP = 0x0; rP < iN; rP++) {
        const rQ = nP(An(0x57a));
        rQ[An(0xa8c)] = rP;
        const rR = iO[rP];
        if (rR) {
          const rS = nP(
            An(0x537) + rR[An(0x308)] + "\x22\x20" + qz(rR) + An(0xa32)
          );
          (rS[An(0xd7f)] = rR),
            (rS[An(0xbde)] = !![]),
            (rS[An(0x58e)] = iQ[An(0x9ca)]()),
            nO(rS, rR),
            rQ[An(0xd82)](rS),
            (iP[rS[An(0x58e)]] = rS);
        }
        rP >= iM
          ? (rQ[An(0xd82)](nP(An(0xd5d) + ((rP - iM + 0x1) % 0xa) + An(0x333))),
            nz[An(0xd82)](rQ))
          : ny[An(0xd82)](rQ);
      }
    }
    function nL(rM) {
      const Ao = uu;
      return rM < 0.5
        ? 0x4 * rM * rM * rM
        : 0x1 - Math[Ao(0x3a4)](-0x2 * rM + 0x2, 0x3) / 0x2;
    }
    var nM = [];
    function nN(rM, rN) {
      const Ap = uu;
      (rM[Ap(0xa33)] = 0x0), (rM[Ap(0xc62)] = 0x1);
      let rO = 0x1,
        rP = 0x0,
        rQ = -0x1;
      rM[Ap(0x487)][Ap(0x8d8)](Ap(0xe1b)), rM[Ap(0x13b)](Ap(0xa09), "");
      const rR = nP(Ap(0xc3c));
      rM[Ap(0xd82)](rR), nM[Ap(0x7b8)](rR);
      const rS = qr;
      rR[Ap(0x59c)] = rR[Ap(0x52a)] = rS;
      const rT = rR[Ap(0xc6f)]("2d");
      (rR[Ap(0xc93)] = function () {
        const Aq = Ap;
        rT[Aq(0x2f3)](0x0, 0x0, rS, rS);
        rP < 0.99 &&
          ((rT[Aq(0xa46)] = 0x1 - rP),
          (rT[Aq(0xc50)] = Aq(0x702)),
          rT[Aq(0x10e)](0x0, 0x0, rS, (0x1 - rO) * rS));
        if (rP < 0.01) return;
        (rT[Aq(0xa46)] = rP),
          rT[Aq(0xb1a)](),
          rT[Aq(0xd57)](rS / 0x64),
          rT[Aq(0xbd2)](0x32, 0x2d);
        let rU = rM[Aq(0xa33)];
        rU = nL(rU);
        const rV = Math["PI"] * 0x2 * rU;
        rT[Aq(0x5f9)](rV * 0x4),
          rT[Aq(0x540)](),
          rT[Aq(0xc4d)](0x0, 0x0),
          rT[Aq(0x660)](0x0, 0x0, 0x64, 0x0, rV),
          rT[Aq(0xc4d)](0x0, 0x0),
          rT[Aq(0x660)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rT[Aq(0xc50)] = Aq(0x6d0)),
          rT[Aq(0xa90)](Aq(0x36f)),
          rT[Aq(0xaea)]();
      }),
        (rR[Ap(0x630)] = function () {
          const Ar = Ap;
          rM[Ar(0xa33)] += pP / (rN[Ar(0xe25)] + 0xc8);
          let rU = 0x1,
            rV = rM[Ar(0xc62)];
          rM[Ar(0xa33)] >= 0x1 && (rU = 0x0);
          const rW = rM[Ar(0x8a4)] || rM[Ar(0x550)];
          ((rW && rW[Ar(0x550)] === nz) || !ix) && ((rV = 0x1), (rU = 0x0));
          (rP = pv(rP, rU, 0x64)), (rO = pv(rO, rV, 0x64));
          const rX = Math[Ar(0xbb6)]((0x1 - rO) * 0x64),
            rY = Math[Ar(0xbb6)](rP * 0x64) / 0x64;
          rY == 0x0 && rX <= 0x0
            ? ((rR[Ar(0x7ed)] = ![]), (rR[Ar(0xa09)][Ar(0xd21)] = Ar(0x89b)))
            : ((rR[Ar(0x7ed)] = !![]), (rR[Ar(0xa09)][Ar(0xd21)] = "")),
            (rQ = rX);
        }),
        rM[Ap(0xd82)](nP(Ap(0x1b4) + qz(rN) + Ap(0xa32)));
    }
    function nO(rM, rN, rO = !![]) {
      const As = uu;
      rO && rN[As(0x974)] === void 0x0 && nN(rM, rN);
    }
    function nP(rM) {
      const At = uu;
      return (hA[At(0x679)] = rM), hA[At(0x87b)][0x0];
    }
    var nQ = document[uu(0x5d6)](uu(0xe50)),
      nR = [];
    function nS() {
      const Au = uu;
      (nQ[Au(0x679)] = Au(0x642)[Au(0x4c2)](eK * dG)),
        (nR = Array[Au(0x161)](nQ[Au(0x87b)]));
    }
    nS();
    var nT = {};
    for (let rM = 0x0; rM < eJ[uu(0xc60)]; rM++) {
      const rN = eJ[rM];
      !nT[rN[uu(0x909)]] &&
        ((nT[rN[uu(0x909)]] = new lF(
          -0x1,
          rN[uu(0x909)],
          0x0,
          0x0,
          rN[uu(0x3ac)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          rN[uu(0x6ba)],
          0x1
        )),
        (nT[rN[uu(0x909)]][uu(0xa28)] = !![]));
      const rO = nT[rN[uu(0x909)]];
      let rP = null;
      rN[uu(0xa2f)] !== void 0x0 &&
        (rP = new lF(-0x1, rN[uu(0xa2f)], 0x0, 0x0, 0x0, rN[uu(0x6ba)], 0x1)),
        (rN[uu(0x231)] = function (rQ) {
          const Av = uu;
          rQ[Av(0x5df)](0.5, 0.5),
            rO[Av(0xd6f)](rQ),
            rP &&
              (rQ[Av(0x5f9)](rO[Av(0x6b8)]),
              rQ[Av(0xbd2)](-rN[Av(0x6ba)] * 0x2, 0x0),
              rP[Av(0xd6f)](rQ));
        });
    }
    function nU(rQ, rR = ![]) {
      const Aw = uu,
        rS = nP(Aw(0x537) + rQ[Aw(0x308)] + "\x22\x20" + qz(rQ) + Aw(0xa32));
      jX(rS), (rS[Aw(0xd7f)] = rQ);
      if (rR) return rS;
      const rT = dG * rQ[Aw(0x1a7)] + rQ[Aw(0x308)],
        rU = nR[rT];
      return nQ[Aw(0x201)](rS, rU), rU[Aw(0x5e5)](), (nR[rT] = rS), rS;
    }
    var nV = document[uu(0x5d6)](uu(0xa0e)),
      nW = document[uu(0x5d6)](uu(0xd98)),
      nX = document[uu(0x5d6)](uu(0x23c)),
      nY = document[uu(0x5d6)](uu(0xb7a)),
      nZ = document[uu(0x5d6)](uu(0xa42)),
      o0 = nZ[uu(0x5d6)](uu(0xade)),
      o1 = nZ[uu(0x5d6)](uu(0x2fd)),
      o2 = document[uu(0x5d6)](uu(0x170)),
      o3 = document[uu(0x5d6)](uu(0x775)),
      o4 = ![],
      o5 = 0x0,
      o6 = ![];
    (nW[uu(0x46d)] = function () {
      (o4 = !![]), (o5 = 0x0), (o6 = ![]);
    }),
      (nY[uu(0x46d)] = function () {
        const Ax = uu;
        if (this[Ax(0x487)][Ax(0x3a1)](Ax(0x746)) || jx) return;
        kH(Ax(0x254), (rQ) => {
          rQ && ((o4 = !![]), (o5 = 0x0), (o6 = !![]));
        });
      }),
      (nV[uu(0x679)] = uu(0x642)[uu(0x4c2)](dF * dG));
    var o7 = Array[uu(0x161)](nV[uu(0x87b)]),
      o8 = document[uu(0x5d6)](uu(0x2ec)),
      o9 = {};
    function oa() {
      const Ay = uu;
      for (let rQ in o9) {
        o9[rQ][Ay(0xc1c)]();
      }
      o9 = {};
      for (let rR in iR) {
        p9(rR);
      }
      ob();
    }
    function ob() {
      oc(o8);
    }
    function oc(rQ) {
      const Az = uu,
        rR = Array[Az(0x161)](rQ[Az(0x828)](Az(0xb6a)));
      rR[Az(0x38e)]((rS, rT) => {
        const AA = Az,
          rU = rT[AA(0xd7f)][AA(0x308)] - rS[AA(0xd7f)][AA(0x308)];
        return rU === 0x0 ? rT[AA(0xd7f)]["id"] - rS[AA(0xd7f)]["id"] : rU;
      });
      for (let rS = 0x0; rS < rR[Az(0xc60)]; rS++) {
        const rT = rR[rS];
        rQ[Az(0xd82)](rT);
      }
    }
    function od(rQ, rR) {
      const AB = uu,
        rS = rR[AB(0x308)] - rQ[AB(0x308)];
      return rS === 0x0 ? rR["id"] - rQ["id"] : rS;
    }
    function oe(rQ, rR = !![]) {
      const AC = uu,
        rS = nP(AC(0xbaa) + rQ[AC(0x308)] + "\x22\x20" + qz(rQ) + AC(0x45b));
      setTimeout(function () {
        const AD = AC;
        rS[AD(0x487)][AD(0x5e5)](AD(0x958));
      }, 0x1f4),
        (rS[AC(0xd7f)] = rQ);
      if (rR) {
      }
      return (rS[AC(0xad1)] = rS[AC(0x5d6)](AC(0x638))), rS;
    }
    var of = nP(uu(0x3cb)),
      og = of[uu(0x5d6)](uu(0xe20)),
      oh = of[uu(0x5d6)](uu(0xa82)),
      oi = of[uu(0x5d6)](uu(0x4aa)),
      oj = [];
    for (let rQ = 0x0; rQ < 0x5; rQ++) {
      const rR = nP(uu(0x642));
      (rR[uu(0x496)] = function (rS = 0x0) {
        const AE = uu,
          rT =
            (rQ / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rS * Math["PI"] * 0x6,
          rU =
            0x32 +
            (rS > 0x0
              ? Math[AE(0x6e2)](Math[AE(0xdad)](rS * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[AE(0xa09)][AE(0x9f6)] = Math[AE(0x85f)](rT) * rU + 0x32 + "%"),
          (this[AE(0xa09)][AE(0x762)] = Math[AE(0xdad)](rT) * rU + 0x32 + "%");
      }),
        rR[uu(0x496)](),
        (rR[uu(0x9dd)] = 0x0),
        (rR["el"] = null),
        (rR[uu(0x7e4)] = function () {
          const AF = uu;
          (rR[AF(0x9dd)] = 0x0), (rR["el"] = null), (rR[AF(0x679)] = "");
        }),
        (rR[uu(0x5be)] = function (rS) {
          const AG = uu;
          if (!rR["el"]) {
            const rT = oe(oY, ![]);
            (rT[AG(0x46d)] = function () {
              if (p0 || p2) return;
              p6(null);
            }),
              rR[AG(0xd82)](rT),
              (rR["el"] = rT);
          }
          (rR[AG(0x9dd)] += rS), p4(rR["el"][AG(0xad1)], rR[AG(0x9dd)]);
        }),
        og[uu(0xd82)](rR),
        oj[uu(0x7b8)](rR);
    }
    var ok,
      ol = document[uu(0x5d6)](uu(0xbe7)),
      om = document[uu(0x5d6)](uu(0x73c)),
      on = document[uu(0x5d6)](uu(0xaa8)),
      oo = document[uu(0x5d6)](uu(0x644)),
      op = {};
    function oq() {
      const AH = uu,
        rS = document[AH(0x5d6)](AH(0x9e3));
      for (let rT = 0x0; rT < dG; rT++) {
        const rU = nP(AH(0x2f6) + rT + AH(0x954));
        (rU[AH(0x46d)] = function () {
          const AI = AH;
          let rV = po;
          po = !![];
          for (const rW in o9) {
            const rX = dB[rW];
            if (rX[AI(0x308)] !== rT) continue;
            const rY = o9[rW];
            rY[AI(0xbef)][AI(0x7d6)]();
          }
          po = rV;
        }),
          (op[rT] = rU),
          rS[AH(0xd82)](rU);
      }
    }
    oq();
    var or = ![],
      os = document[uu(0x5d6)](uu(0xcdf));
    os[uu(0x46d)] = function () {
      const AJ = uu;
      document[AJ(0xd31)][AJ(0x487)][AJ(0x64d)](AJ(0xd10)),
        (or = document[AJ(0xd31)][AJ(0x487)][AJ(0x3a1)](AJ(0xd10)));
      const rS = or ? AJ(0x1cd) : AJ(0xa6f);
      k7(om, rS),
        k7(oo, rS),
        or
          ? (ol[AJ(0xd82)](of), of[AJ(0xd82)](nV), on[AJ(0x5e5)]())
          : (ol[AJ(0xd82)](on),
            on[AJ(0x201)](nV, on[AJ(0x457)]),
            of[AJ(0x5e5)]());
    };
    var ot = document[uu(0x5d6)](uu(0x492)),
      ou = ox(uu(0x220), nC[uu(0xe4c)]),
      ov = ox(uu(0x5ca), nC[uu(0x64f)]),
      ow = ox(uu(0xb9a), nC[uu(0x2a6)]);
    function ox(rS, rT) {
      const AK = uu,
        rU = nP(AK(0xae4) + rT + AK(0xb44) + rS + AK(0xb2b));
      return (
        (rU[AK(0x270)] = function (rV) {
          const AL = AK;
          k7(rU[AL(0x87b)][0x1], k8(Math[AL(0xbb6)](rV)));
        }),
        ot[AK(0xd82)](rU),
        rU
      );
    }
    var oy = document[uu(0x5d6)](uu(0x367)),
      oz = document[uu(0x5d6)](uu(0x834));
    oz[uu(0x679)] = "";
    var oA = document[uu(0x5d6)](uu(0xa1a)),
      oB = {};
    function oC() {
      const AM = uu;
      (oz[AM(0x679)] = ""), (oA[AM(0x679)] = "");
      const rS = {},
        rT = [];
      for (let rU in oB) {
        const rV = dB[rU],
          rW = oB[rU];
        (rS[rV[AM(0x308)]] = (rS[rV[AM(0x308)]] || 0x0) + rW),
          rT[AM(0x7b8)]([rV, rW]);
      }
      if (rT[AM(0xc60)] === 0x0) {
        oy[AM(0xa09)][AM(0xd21)] = AM(0x89b);
        return;
      }
      (oy[AM(0xa09)][AM(0xd21)] = ""),
        rT[AM(0x38e)]((rX, rY) => {
          return od(rX[0x0], rY[0x0]);
        })[AM(0xa2e)](([rX, rY]) => {
          const AN = AM,
            rZ = oe(rX);
          jX(rZ), p4(rZ[AN(0xad1)], rY), oz[AN(0xd82)](rZ);
        }),
        oD(oA, rS);
    }
    function oD(rS, rT) {
      const AO = uu;
      let rU = 0x0;
      for (let rV in d8) {
        const rW = rT[d8[rV]];
        if (rW !== void 0x0) {
          rU++;
          const rX = nP(
            AO(0xae9) + k8(rW) + "\x20" + rV + AO(0xaa1) + hO[rV] + AO(0x9ea)
          );
          rS[AO(0xc71)](rX);
        }
      }
      rU % 0x2 === 0x1 &&
        (rS[AO(0x87b)][0x0][AO(0xa09)][AO(0xcfa)] = AO(0x67c));
    }
    var oE = {},
      oF = 0x0,
      oG,
      oH,
      oI,
      oJ,
      oK = 0x0,
      oL = 0x0,
      oM = 0x0,
      oN = 0x0,
      oO = 0x0;
    function oP() {
      const AP = uu,
        rS = d3(oF);
      (oG = rS[0x0]),
        (oH = rS[0x1]),
        (oJ = d1(oG + 0x1)),
        (oI = oF - oH),
        k7(
          o3,
          AP(0x634) + (oG + 0x1) + AP(0x777) + iI(oI) + "/" + iI(oJ) + AP(0x4c3)
        );
      const rT = d5(oG);
      ou[AP(0x270)](0xc8 * rT),
        ov[AP(0x270)](0x19 * rT),
        ow[AP(0x270)](d4(oG)),
        hack.hp = 0xc8 * rT,
        (oL = Math[AP(0xd8d)](0x1, oI / oJ)),
        (oN = 0x0),
        (nY[AP(0x5d6)](AP(0x9a3))[AP(0x679)] =
          oG >= cG ? AP(0x216) : AP(0xd2b) + (cG + 0x1) + AP(0x712));
    }
    var oQ = 0x0,
      oR = document[uu(0x5d6)](uu(0x879));
    for (let rS = 0x0; rS < cY[uu(0xc60)]; rS++) {
      const [rT, rU] = cY[rS],
        rV = j6[rT],
        rW = nP(
          uu(0x6c9) +
            hO[rV] +
            uu(0xa38) +
            rV +
            uu(0x76d) +
            (rU + 0x1) +
            uu(0x131)
        );
      (rW[uu(0x46d)] = function () {
        const AQ = uu;
        if (oG >= rU) {
          const rX = oR[AQ(0x5d6)](AQ(0x312));
          rX && rX[AQ(0x487)][AQ(0x5e5)](AQ(0x3fb)),
            (oQ = rS),
            (hC[AQ(0x1a2)] = rS),
            this[AQ(0x487)][AQ(0x8d8)](AQ(0x3fb));
        }
      }),
        (cY[rS][uu(0x253)] = rW),
        oR[uu(0xd82)](rW);
    }
    function oS() {
      const AR = uu,
        rX = parseInt(hC[AR(0x1a2)]) || 0x0;
      cY[0x0][AR(0x253)][AR(0x7d6)](),
        cY[AR(0xa2e)]((rY, rZ) => {
          const AS = AR,
            s0 = rY[0x1];
          if (oG >= s0) {
            rY[AS(0x253)][AS(0x487)][AS(0x5e5)](AS(0x746));
            if (rX === rZ) rY[AS(0x253)][AS(0x7d6)]();
          } else rY[AS(0x253)][AS(0x487)][AS(0x8d8)](AS(0x746));
        });
    }
    var oT = document[uu(0x5d6)](uu(0x1ff));
    setInterval(() => {
      const AT = uu;
      if (!ol[AT(0x487)][AT(0x3a1)](AT(0x7f2))) return;
      oU();
    }, 0x3e8);
    function oU() {
      const AU = uu;
      if (jY) {
        let rX = 0x0;
        for (const rZ in jY) {
          rX += oV(rZ, jY[rZ]);
        }
        let rY = 0x0;
        for (const s0 in oE) {
          const s1 = oV(s0, oE[s0][AU(0x9dd)]);
          (rY += s1), (rX += s1);
        }
        if (rY > 0x0) {
          const s2 = Math[AU(0xd8d)](0x19, (rY / rX) * 0x64),
            s3 = s2 > 0x1 ? s2[AU(0x9f2)](0x2) : s2[AU(0x9f2)](0x5);
          k7(oT, "+" + s3 + "%");
        }
      }
    }
    function oV(rX, rY) {
      const AV = uu,
        rZ = dB[rX];
      if (!rZ) return 0x0;
      const s0 = rZ[AV(0x308)];
      return Math[AV(0x3a4)](s0 * 0xa, s0) * rY;
    }
    var oW = document[uu(0x5d6)](uu(0x8ca));
    (oW[uu(0x46d)] = function () {
      const AW = uu;
      for (const rX in oE) {
        const rY = oE[rX];
        rY[AW(0xc1c)]();
      }
      oX();
    }),
      oX(),
      oP();
    function oX() {
      const AX = uu,
        rX = Object[AX(0x17d)](oE);
      nX[AX(0x487)][AX(0x5e5)](AX(0x263));
      const rY = rX[AX(0xc60)] === 0x0;
      (oW[AX(0xa09)][AX(0xd21)] = rY ? AX(0x89b) : ""), (oO = 0x0);
      let rZ = 0x0;
      const s0 = rX[AX(0xc60)] > 0x1 ? 0x32 : 0x0;
      for (let s2 = 0x0, s3 = rX[AX(0xc60)]; s2 < s3; s2++) {
        const s4 = rX[s2],
          s5 = (s2 / s3) * Math["PI"] * 0x2;
        s4[AX(0x9f1)](
          Math[AX(0x85f)](s5) * s0 + 0x32,
          Math[AX(0xdad)](s5) * s0 + 0x32
        ),
          (oO += d2[s4["el"][AX(0xd7f)][AX(0x308)]] * s4[AX(0x9dd)]);
      }
      nX[AX(0x487)][s0 ? AX(0x8d8) : AX(0x5e5)](AX(0x263)),
        nW[AX(0x487)][rX[AX(0xc60)] > 0x0 ? AX(0x5e5) : AX(0x8d8)](AX(0x86b));
      const s1 = oG >= cG;
      nY[AX(0x487)][rX[AX(0xc60)] > 0x0 && s1 ? AX(0x5e5) : AX(0x8d8)](
        AX(0x746)
      ),
        oU(),
        (nX[AX(0xa09)][AX(0xb34)] = ""),
        (o4 = ![]),
        (o6 = ![]),
        (o5 = 0x0),
        (oK = Math[AX(0xd8d)](0x1, (oI + oO) / oJ) || 0x0),
        k7(o2, oO > 0x0 ? "+" + iI(oO) + AX(0x4c3) : "");
    }
    var oY,
      oZ = 0x0,
      p0 = ![],
      p1 = 0x0,
      p2 = null;
    function p3() {
      const AY = uu;
      oh[AY(0x487)][oZ < 0x5 ? AY(0x8d8) : AY(0x5e5)](AY(0x86b));
    }
    oh[uu(0x46d)] = function () {
      const AZ = uu;
      if (p0 || !oY || oZ < 0x5 || !ij() || p2) return;
      (p0 = !![]), (p1 = 0x0), (p2 = null), oh[AZ(0x487)][AZ(0x8d8)](AZ(0x86b));
      const rX = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      rX[AZ(0xbbe)](0x0, cH[AZ(0x45c)]),
        rX[AZ(0xa0a)](0x1, oY["id"]),
        rX[AZ(0xbfa)](0x3, oZ),
        ik(rX);
    };
    function p4(rX, rY) {
      k7(rX, "x" + iI(rY));
    }
    function p5(rX) {
      const B0 = uu;
      typeof rX === B0(0x3c9) && (rX = nF(rX)), k7(oi, rX + B0(0x305));
    }
    function p6(rX) {
      const B1 = uu;
      oY && n4(oY["id"], oZ);
      ok && ok[B1(0x7d6)]();
      (oY = rX), (oZ = 0x0), p3();
      for (let rY = 0x0; rY < oj[B1(0xc60)]; rY++) {
        oj[rY][B1(0x7e4)]();
      }
      oY
        ? (p5(dD[oY[B1(0x308)]] * (jx ? 0x2 : 0x1) * (hd ? 0.9 : 0x1)),
          (oh[B1(0xa09)][B1(0xc8e)] = hP[oY[B1(0x308)] + 0x1]))
        : p5("?");
    }
    var p7 = 0x0,
      p8 = 0x1;
    function p9(rX) {
      const B2 = uu,
        rY = dB[rX],
        rZ = oe(rY);
      (rZ[B2(0x1bf)] = pr), jX(rZ), (rZ[B2(0xa83)] = !![]), o8[B2(0xd82)](rZ);
      const s0 = oe(rY);
      jX(s0), (s0[B2(0x1bf)] = ol);
      rY[B2(0x308)] >= db && s0[B2(0x487)][B2(0x8d8)](B2(0x1eb));
      s0[B2(0x46d)] = function () {
        const B3 = B2;
        pO - p7 < 0x1f4 ? p8++ : (p8 = 0x1);
        p7 = pO;
        if (or) {
          if (p0 || rY[B3(0x308)] >= db) return;
          const s4 = iR[rY["id"]];
          if (!s4) return;
          oY !== rY && p6(rY);
          const s5 = oj[B3(0xc60)];
          let s6 = po ? s4 : Math[B3(0xd8d)](s5 * p8, s4);
          n4(rY["id"], -s6), (oZ += s6), p3();
          let s7 = s6 % s5,
            s8 = (s6 - s7) / s5;
          const s9 = [...oj][B3(0x38e)](
            (sb, sc) => sb[B3(0x9dd)] - sc[B3(0x9dd)]
          );
          s8 > 0x0 && s9[B3(0xa2e)]((sb) => sb[B3(0x5be)](s8));
          let sa = 0x0;
          while (s7--) {
            const sb = s9[sa];
            (sa = (sa + 0x1) % s5), sb[B3(0x5be)](0x1);
          }
          return;
        }
        if (!oE[rY["id"]]) {
          const sc = oe(rY, ![]);
          k7(sc[B3(0xad1)], "x1"),
            (sc[B3(0x46d)] = function (se) {
              const B4 = B3;
              sd[B4(0xc1c)](), oX();
            }),
            nX[B3(0xd82)](sc);
          const sd = {
            petal: rY,
            count: 0x0,
            el: sc,
            setPos(se, sf) {
              const B5 = B3;
              (sc[B5(0xa09)][B5(0x9f6)] = se + "%"),
                (sc[B5(0xa09)][B5(0x762)] = sf + "%"),
                (sc[B5(0xa09)][B5(0xdba)] = B5(0x850));
            },
            dispose(se = !![]) {
              const B6 = B3;
              sc[B6(0x5e5)](),
                se && n4(rY["id"], this[B6(0x9dd)]),
                delete oE[rY["id"]];
            },
          };
          (oE[rY["id"]] = sd), oX();
        }
        const s3 = oE[rY["id"]];
        if (iR[rY["id"]]) {
          const se = iR[rY["id"]],
            sf = po ? se : Math[B3(0xd8d)](0x1 * p8, se);
          (s3[B3(0x9dd)] += sf),
            n4(rY["id"], -sf),
            p4(s3["el"][B3(0xad1)], s3[B3(0x9dd)]);
        }
        oX();
      };
      const s1 = dG * rY[B2(0x1a7)] + rY[B2(0x2d4)],
        s2 = o7[s1];
      return (
        nV[B2(0x201)](s0, s2),
        s2[B2(0x5e5)](),
        (o7[s1] = s0),
        (rZ[B2(0x25d)] = function (s3) {
          const B7 = B2;
          p4(rZ[B7(0xad1)], s3), p4(s0[B7(0xad1)], s3);
        }),
        (rZ[B2(0xbef)] = s0),
        (o9[rX] = rZ),
        (rZ[B2(0xc1c)] = function () {
          const B8 = B2;
          rZ[B8(0x5e5)](), delete o9[rX];
          const s3 = nP(B8(0x642));
          (o7[s1] = s3), nV[B8(0x201)](s3, s0), s0[B8(0x5e5)]();
        }),
        rZ[B2(0x25d)](iR[rX]),
        rZ
      );
    }
    var pa = {},
      pb = {};
    function pc(rX, rY, rZ, s0) {
      const B9 = uu,
        s1 = document[B9(0x5d6)](rZ);
      (s1[B9(0x7ae)] = function () {
        const Ba = B9;
        (pa[rX] = this[Ba(0xa61)]),
          (hC[rX] = this[Ba(0xa61)] ? "1" : "0"),
          s0 && s0(this[Ba(0xa61)]);
      }),
        (pb[rX] = function () {
          const Bb = B9;
          s1[Bb(0x7d6)]();
        }),
        (s1[B9(0xa61)] = hC[rX] === void 0x0 ? rY : hC[rX] === "1"),
        s1[B9(0x7ae)]();
    }
    var pd = document[uu(0x5d6)](uu(0x391));
    (pd[uu(0xd7f)] = function () {
      const Bc = uu;
      return nP(
        Bc(0x82e) + hO[Bc(0xc03)] + Bc(0x6cc) + hO[Bc(0x274)] + Bc(0xd9f)
      );
    }),
      pc(uu(0x19a), ![], uu(0x44d), mG),
      pc(uu(0x6ad), !![], uu(0x3e5)),
      pc(uu(0x795), !![], uu(0xc2e)),
      pc(
        uu(0x332),
        !![],
        uu(0x3dc),
        (rX) => (kJ[uu(0xa09)][uu(0xd21)] = rX ? "" : uu(0x89b))
      ),
      pc(uu(0x5b3), ![], uu(0x460)),
      pc(uu(0x196), ![], uu(0xd88)),
      pc(uu(0x98c), ![], uu(0xa71)),
      pc(uu(0x171), !![], uu(0xcb3)),
      pc(
        uu(0xb2f),
        !![],
        uu(0x5ad),
        (rX) => (pd[uu(0xa09)][uu(0xd21)] = rX ? "" : uu(0x89b))
      ),
      pc(uu(0x151), ![], uu(0xb16), kS),
      pc(uu(0x7c2), ![], uu(0x3f0), kW),
      pc(uu(0x2e1), ![], uu(0xaf8), (rX) => pe(kn, uu(0x85e), rX)),
      pc(uu(0x60f), !![], uu(0x59e), (rX) =>
        pe(document[uu(0xd31)], uu(0x464), !rX)
      ),
      pc(uu(0x805), !![], uu(0x330), (rX) =>
        pe(document[uu(0xd31)], uu(0x84b), !rX)
      ),
      pc(uu(0x3b7), !![], uu(0x560)),
      pc(uu(0xce1), ![], uu(0x63e)),
      pc(uu(0x4e7), ![], uu(0xafc)),
      pc(uu(0x9c5), ![], uu(0x570)),
      pc(uu(0x4e9), ![], uu(0xc80), (rX) => {
        const Bd = uu;
        pe(document[Bd(0xd31)], Bd(0xa65), rX), iA();
      });
    function pe(rX, rY, rZ) {
      const Be = uu;
      rX[Be(0x487)][rZ ? Be(0x8d8) : Be(0x5e5)](rY);
    }
    function pf() {
      const Bf = uu,
        rX = document[Bf(0x5d6)](Bf(0x244)),
        rY = [];
      for (let s0 = 0x0; s0 <= 0xa; s0++) {
        rY[Bf(0x7b8)](0x1 - s0 * 0.05);
      }
      for (const s1 of rY) {
        const s2 = nP(Bf(0xc23) + s1 + "\x22>" + nF(s1 * 0x64) + Bf(0x89a));
        rX[Bf(0xd82)](s2);
      }
      let rZ = parseFloat(hC[Bf(0x179)]);
      (isNaN(rZ) || !rY[Bf(0xb65)](rZ)) && (rZ = rY[0x0]),
        (rX[Bf(0xc04)] = rZ),
        (kO = rZ),
        (rX[Bf(0x7ae)] = function () {
          const Bg = Bf;
          (kO = parseFloat(this[Bg(0xc04)])),
            (hC[Bg(0x179)] = this[Bg(0xc04)]),
            kW();
        });
    }
    pf();
    var pg = document[uu(0x5d6)](uu(0x6ac)),
      ph = document[uu(0x5d6)](uu(0xc0a));
    ph[uu(0x62e)] = cK;
    var pi = document[uu(0x5d6)](uu(0xb49));
    function pj(rX) {
      const Bh = uu,
        rY = nP(Bh(0x1ed));
      kk[Bh(0xd82)](rY);
      const rZ = rY[Bh(0x5d6)](Bh(0x9ae));
      rZ[Bh(0xc04)] = rX;
      const s0 = rY[Bh(0x5d6)](Bh(0x7f1));
      (s0[Bh(0x7ae)] = function () {
        const Bi = Bh;
        rZ[Bi(0x909)] = this[Bi(0xa61)] ? Bi(0x240) : Bi(0xa1d);
      }),
        (rY[Bh(0x5d6)](Bh(0xa74))[Bh(0x46d)] = function () {
          const Bj = Bh;
          jo(rX), hb(Bj(0xbbb));
        }),
        (rY[Bh(0x5d6)](Bh(0x3ef))[Bh(0x46d)] = function () {
          const Bk = Bh,
            s1 = {};
          s1[Bk(0x909)] = Bk(0x58d);
          const s2 = new Blob([rX], s1),
            s3 = document[Bk(0x57c)]("a");
          (s3[Bk(0x136)] = URL[Bk(0xd9d)](s2)),
            (s3[Bk(0xa97)] = (ju ? ju : Bk(0xd55)) + Bk(0x503)),
            s3[Bk(0x7d6)](),
            hb(Bk(0x973));
        }),
        (rY[Bh(0x5d6)](Bh(0xc09))[Bh(0x46d)] = function () {
          const Bl = Bh;
          rY[Bl(0x5e5)]();
        });
    }
    function pk() {
      const Bm = uu,
        rX = nP(Bm(0xd20));
      kk[Bm(0xd82)](rX);
      const rY = rX[Bm(0x5d6)](Bm(0x9ae)),
        rZ = rX[Bm(0x5d6)](Bm(0x7f1));
      (rZ[Bm(0x7ae)] = function () {
        const Bn = Bm;
        rY[Bn(0x909)] = this[Bn(0xa61)] ? Bn(0x240) : Bn(0xa1d);
      }),
        (rX[Bm(0x5d6)](Bm(0xc09))[Bm(0x46d)] = function () {
          const Bo = Bm;
          rX[Bo(0x5e5)]();
        }),
        (rX[Bm(0x5d6)](Bm(0xb61))[Bm(0x46d)] = function () {
          const Bp = Bm,
            s0 = rY[Bp(0xc04)][Bp(0x3ab)]();
          if (eU(s0)) {
            delete hC[Bp(0x37e)], (hC[Bp(0x751)] = s0);
            if (hT)
              try {
                hT[Bp(0xc75)]();
              } catch (s1) {}
            hb(Bp(0x4d6));
          } else hb(Bp(0x8fb));
        });
    }
    (document[uu(0x5d6)](uu(0x352))[uu(0x46d)] = function () {
      const Bq = uu;
      if (i4) {
        pj(i4);
        return;
        const rX = prompt(Bq(0xe09), i4);
        if (rX !== null) {
          const rY = {};
          rY[Bq(0x909)] = Bq(0x58d);
          const rZ = new Blob([i4], rY),
            s0 = document[Bq(0x57c)]("a");
          (s0[Bq(0x136)] = URL[Bq(0xd9d)](rZ)),
            (s0[Bq(0xa97)] = ju + Bq(0x1d5)),
            s0[Bq(0x7d6)](),
            alert(Bq(0x98a));
        }
      }
    }),
      (document[uu(0x5d6)](uu(0x31d))[uu(0x46d)] = function () {
        const Br = uu;
        pk();
        return;
        const rX = prompt(Br(0x483));
        if (rX !== null) {
          if (eU(rX)) {
            let rY = Br(0x221);
            i5 && (rY += Br(0x5f1));
            if (confirm(rY)) {
              delete hC[Br(0x37e)], (hC[Br(0x751)] = rX);
              if (hT)
                try {
                  hT[Br(0xc75)]();
                } catch (rZ) {}
            }
          } else alert(Br(0x8fb));
        }
      }),
      pc(uu(0x9a2), ![], uu(0xca1), (rX) =>
        ph[uu(0x487)][rX ? uu(0x8d8) : uu(0x5e5)](uu(0x713))
      ),
      pc(uu(0x98d), !![], uu(0x1c5));
    var pl = 0x0,
      pm = 0x0,
      pn = 0x0,
      po = ![];
    function pp(rX, rY) {
      const Bs = uu;
      (rX === Bs(0x658) || rX === Bs(0xac8)) && (po = rY);
      if (rY) {
        switch (rX) {
          case Bs(0x4a6):
            m1[Bs(0x4b5)][Bs(0x64d)]();
            break;
          case Bs(0x40b):
            m1[Bs(0x2a5)][Bs(0x64d)]();
            break;
          case Bs(0x9ff):
            m1[Bs(0x490)][Bs(0x64d)]();
            break;
          case Bs(0x816):
            q1[Bs(0x487)][Bs(0x64d)](Bs(0x3fb));
            break;
          case Bs(0x59b):
            pb[Bs(0x19a)](), hb(Bs(0xc5e) + (pa[Bs(0x19a)] ? "ON" : Bs(0xa31)));
            break;
          case Bs(0x9d6):
            pb[Bs(0xce1)](), hb(Bs(0x65d) + (pa[Bs(0xce1)] ? "ON" : Bs(0xa31)));
            break;
          case Bs(0x24d):
            pb[Bs(0x5b3)](), hb(Bs(0x3c1) + (pa[Bs(0x5b3)] ? "ON" : Bs(0xa31)));
            break;
          case Bs(0xdcc):
            pb[Bs(0x196)](), hb(Bs(0xc36) + (pa[Bs(0x196)] ? "ON" : Bs(0xa31)));
            break;
          case Bs(0x2c5):
            pb[Bs(0x332)](), hb(Bs(0x174) + (pa[Bs(0x332)] ? "ON" : Bs(0xa31)));
            break;
          case Bs(0x9cc):
            pb[Bs(0x98c)](), hb(Bs(0x7a4) + (pa[Bs(0x98c)] ? "ON" : Bs(0xa31)));
            break;
          case Bs(0x14f):
            if (!mJ && hV) {
              const rZ = ny[Bs(0x828)](Bs(0x51b)),
                s0 = nz[Bs(0x828)](Bs(0x51b));
              for (let s1 = 0x0; s1 < rZ[Bs(0xc60)]; s1++) {
                const s2 = rZ[s1],
                  s3 = s0[s1],
                  s4 = n7(s2),
                  s5 = n7(s3);
                if (s4) n8(s4, s3);
                else s5 && n8(s5, s2);
              }
              ik(new Uint8Array([cH[Bs(0xc06)]]));
            }
            break;
          default:
            if (
              !mJ &&
              hV &&
              (rX[Bs(0xa69)](Bs(0x4eb)) || rX[Bs(0xa69)](Bs(0x2d2)))
            )
              sd: {
                let s6 = parseInt(
                  rX[Bs(0xb56)](rX[Bs(0xa69)](Bs(0x4eb)) ? 0x5 : 0x6)
                );
                if (nm[Bs(0x2c5)]) {
                  po ? kt(s6) : kw(s6);
                  break sd;
                }
                s6 === 0x0 && (s6 = 0xa);
                iM > 0xa && po && (s6 += 0xa);
                s6--;
                if (s6 >= 0x0) {
                  const s7 = ny[Bs(0x828)](Bs(0x51b))[s6],
                    s8 = nz[Bs(0x828)](Bs(0x51b))[s6];
                  if (s7 && s8) {
                    const s9 = n7(s7),
                      sa = n7(s8);
                    if (s9) n8(s9, s8);
                    else sa && n8(sa, s7);
                  }
                }
                n6(s6, s6 + iM);
              }
        }
        nm[rX] = !![];
      } else
        rX === Bs(0x73e) &&
          (kj[Bs(0xa09)][Bs(0xd21)] === "" &&
          ph[Bs(0xa09)][Bs(0xd21)] === Bs(0x89b)
            ? kC[Bs(0x7d6)]()
            : ph[Bs(0x2af)]()),
          delete nm[rX];
      if (ix) {
        if (pa[Bs(0x19a)]) {
          let sb = 0x0,
            sc = 0x0;
          if (nm[Bs(0x61c)] || nm[Bs(0xd6e)]) sc = -0x1;
          else (nm[Bs(0xa6d)] || nm[Bs(0x612)]) && (sc = 0x1);
          if (nm[Bs(0xd8b)] || nm[Bs(0x53e)]) sb = -0x1;
          else (nm[Bs(0xc4f)] || nm[Bs(0x923)]) && (sb = 0x1);
          if (sb !== 0x0 || sc !== 0x0)
            (pl = Math[Bs(0x86a)](sc, sb)), il(pl, 0x1);
          else (pm !== 0x0 || pn !== 0x0) && il(pl, 0x0);
          (pm = sb), (pn = sc);
        }
        pq();
      }
    }
    function pq() {
      const Bt = uu,
        rX = nm[Bt(0xa77)] || nm[Bt(0xac8)] || nm[Bt(0x658)],
        rY = nm[Bt(0x435)] || nm[Bt(0x9e4)],
        rZ = (rX << 0x1) | rY;
      n9 !== rZ && ((n9 = rZ), ik(new Uint8Array([cH[Bt(0x103)], rZ])));
    }
    var pr = document[uu(0x5d6)](uu(0x766)),
      ps = 0x0,
      pt = 0x0,
      pu = 0x0;
    function pv(rX, rY, rZ) {
      const Bu = uu;
      return rX + (rY - rX) * Math[Bu(0xd8d)](0x1, pP / rZ);
    }
    var pw = 0x1,
      px = [];
    for (let rX in cR) {
      if (
        [uu(0xbfd), uu(0x41f), uu(0x8a6), uu(0x2b1), uu(0xc52), uu(0x5c7)][
          uu(0xb65)
        ](rX)
      )
        continue;
      px[uu(0x7b8)](cR[rX]);
    }
    var py = [];
    for (let rY = 0x0; rY < 0x1e; rY++) {
      pz();
    }
    function pz(rZ = !![]) {
      const Bv = uu,
        s0 = new lF(
          -0x1,
          px[Math[Bv(0xb54)](Math[Bv(0x66d)]() * px[Bv(0xc60)])],
          0x0,
          Math[Bv(0x66d)]() * d0,
          Math[Bv(0x66d)]() * 6.28
        );
      if (!s0[Bv(0xdb2)] && Math[Bv(0x66d)]() < 0.01) s0[Bv(0x959)] = !![];
      s0[Bv(0xdb2)]
        ? (s0[Bv(0x33e)] = s0[Bv(0x423)] = Math[Bv(0x66d)]() * 0x8 + 0xc)
        : (s0[Bv(0x33e)] = s0[Bv(0x423)] = Math[Bv(0x66d)]() * 0x1e + 0x19),
        rZ
          ? (s0["x"] = Math[Bv(0x66d)]() * cZ)
          : (s0["x"] = -s0[Bv(0x423)] * 0x2),
        (s0[Bv(0xab0)] =
          (Math[Bv(0x66d)]() * 0x3 + 0x4) * s0[Bv(0x33e)] * 0.02),
        (s0[Bv(0xa93)] = (Math[Bv(0x66d)]() * 0x2 - 0x1) * 0.05),
        py[Bv(0x7b8)](s0);
    }
    var pA = 0x0,
      pB = 0x0,
      pC = 0x0,
      pD = 0x0;
    setInterval(function () {
      const Bw = uu,
        rZ = [kh, qt, ...Object[Bw(0x17d)](pE), ...nM],
        s0 = rZ[Bw(0xc60)];
      let s1 = 0x0;
      for (let s2 = 0x0; s2 < s0; s2++) {
        const s3 = rZ[s2];
        s1 += s3[Bw(0x59c)] * s3[Bw(0x52a)];
      }
      kJ[Bw(0x13b)](
        Bw(0x5b9),
        Math[Bw(0xbb6)](0x3e8 / pP) +
          Bw(0xc19) +
          iv[Bw(0xc60)] +
          Bw(0xc59) +
          s0 +
          Bw(0x623) +
          iI(s1) +
          Bw(0xe52) +
          (pD / 0x3e8)[Bw(0x9f2)](0x2) +
          Bw(0x444)
      ),
        (pD = 0x0);
    }, 0x3e8);
    var pE = {};
    function pF(rZ, s0, s1, s2, s3, s4 = ![]) {
      const Bx = uu;
      if (!pE[s0]) {
        const s7 = hw
          ? new OffscreenCanvas(0x1, 0x1)
          : document[Bx(0x57c)](Bx(0xa75));
        (s7[Bx(0x25e)] = s7[Bx(0xc6f)]("2d")),
          (s7[Bx(0x3da)] = 0x0),
          (s7[Bx(0x5a3)] = s1),
          (s7[Bx(0xd81)] = s2),
          (pE[s0] = s7);
      }
      const s5 = pE[s0],
        s6 = s5[Bx(0x25e)];
      if (pO - s5[Bx(0x3da)] > 0x1f4) {
        s5[Bx(0x3da)] = pO;
        const s8 = rZ[Bx(0xb73)](),
          s9 = Math[Bx(0xbe5)](s8["a"], s8["b"]) * 1.5,
          sa = kV * s9,
          sb = Math[Bx(0xbeb)](s5[Bx(0x5a3)] * sa) || 0x1;
        sb !== s5["w"] &&
          ((s5["w"] = sb),
          (s5[Bx(0x59c)] = sb),
          (s5[Bx(0x52a)] = Math[Bx(0xbeb)](s5[Bx(0xd81)] * sa) || 0x1),
          s6[Bx(0xb1a)](),
          s6[Bx(0x5df)](sa, sa),
          s3(s6),
          s6[Bx(0xaea)]());
      }
      s5[Bx(0xd9b)] = !![];
      if (s4) return s5;
      rZ[Bx(0xc9d)](
        s5,
        -s5[Bx(0x5a3)] / 0x2,
        -s5[Bx(0xd81)] / 0x2,
        s5[Bx(0x5a3)],
        s5[Bx(0xd81)]
      );
    }
    var pG = /^((?!chrome|android).)*safari/i[uu(0xbe9)](navigator[uu(0xa5d)]),
      pH = pG ? 0.25 : 0x0;
    function pI(rZ, s0, s1 = 0x14, s2 = uu(0xd1d), s3 = 0x4, s4, s5 = "") {
      const By = uu,
        s6 = By(0x353) + s1 + By(0x95a) + iz;
      let s7, s8;
      const s9 = s0 + "_" + s6 + "_" + s2 + "_" + s3 + "_" + s5,
        sa = pE[s9];
      if (!sa) {
        rZ[By(0x6df)] = s6;
        const sb = rZ[By(0xc99)](s0);
        (s7 = sb[By(0x59c)] + s3), (s8 = s1 + s3);
      } else (s7 = sa[By(0x5a3)]), (s8 = sa[By(0xd81)]);
      return pF(
        rZ,
        s9,
        s7,
        s8,
        function (sc) {
          const Bz = By;
          sc[Bz(0xbd2)](s3 / 0x2, s3 / 0x2 - s8 * pH),
            (sc[Bz(0x6df)] = s6),
            (sc[Bz(0x797)] = Bz(0x762)),
            (sc[Bz(0x509)] = Bz(0x9f6)),
            (sc[Bz(0x930)] = s3),
            (sc[Bz(0xdf1)] = Bz(0x15f)),
            (sc[Bz(0xc50)] = s2),
            s3 > 0x0 && sc[Bz(0x505)](s0, 0x0, 0x0),
            sc[Bz(0xae5)](s0, 0x0, 0x0);
        },
        s4
      );
    }
    var pJ = 0x1;
    function pK(rZ = cH[uu(0xe5e)]) {
      const BA = uu,
        s0 = Object[BA(0x17d)](oE),
        s1 = new DataView(
          new ArrayBuffer(0x1 + 0x2 + s0[BA(0xc60)] * (0x2 + 0x4))
        );
      let s2 = 0x0;
      s1[BA(0xbbe)](s2++, rZ), s1[BA(0xa0a)](s2, s0[BA(0xc60)]), (s2 += 0x2);
      for (let s3 = 0x0; s3 < s0[BA(0xc60)]; s3++) {
        const s4 = s0[s3];
        s1[BA(0xa0a)](s2, s4[BA(0xd7f)]["id"]),
          (s2 += 0x2),
          s1[BA(0xbfa)](s2, s4[BA(0x9dd)]),
          (s2 += 0x4);
      }
      ik(s1);
    }
    function pL() {
      const BB = uu;
      ok[BB(0x5e5)](), og[BB(0x487)][BB(0x5e5)](BB(0x441)), (ok = null);
    }
    var pM = [];
    function pN() {
      const BC = uu;
      for (let rZ = 0x0; rZ < pM[BC(0xc60)]; rZ++) {
        const s0 = pM[rZ],
          s1 = s0[BC(0xcc2)],
          s2 = s1 && !s1[BC(0xda1)];
        s2
          ? ((s0[BC(0xda1)] = ![]),
            (s0[BC(0x474)] = s1[BC(0x474)]),
            (s0[BC(0xa8d)] = s1[BC(0xa8d)]),
            (s0[BC(0xe1e)] = s1[BC(0xe1e)]),
            (s0[BC(0x12f)] = s1[BC(0x12f)]),
            (s0[BC(0x61f)] = s1[BC(0x61f)]),
            (s0[BC(0x9d4)] = s1[BC(0x9d4)]),
            (s0[BC(0x831)] = s1[BC(0x831)]),
            (s0[BC(0xbfe)] = s1[BC(0xbfe)]),
            (s0[BC(0xda2)] = s1[BC(0xda2)]),
            (s0[BC(0x9c2)] = s1[BC(0x9c2)]),
            (s0[BC(0x3e9)] = s1[BC(0x3e9)]),
            (s0[BC(0xe56)] = s1[BC(0xe56)]),
            (s0[BC(0x205)] = s1[BC(0x205)]),
            (s0[BC(0x6b8)] = s1[BC(0x6b8)]),
            (s0[BC(0xbd6)] = s1[BC(0xbd6)]),
            iZ(s0, s1))
          : ((s0[BC(0xda1)] = !![]),
            (s0[BC(0x86c)] = 0x0),
            (s0[BC(0xa8d)] = 0x1),
            (s0[BC(0x474)] = 0x0),
            (s0[BC(0xe1e)] = ![]),
            (s0[BC(0x12f)] = 0x0),
            (s0[BC(0x61f)] = 0x0),
            (s0[BC(0x831)] = pv(s0[BC(0x831)], 0x0, 0xc8)),
            (s0[BC(0x9d4)] = pv(s0[BC(0x9d4)], 0x0, 0xc8)),
            (s0[BC(0xbd6)] = pv(s0[BC(0xbd6)], 0x0, 0xc8)));
        if (rZ > 0x0) {
          if (s1) {
            const s3 = Math[BC(0x86a)](s1["y"] - pt, s1["x"] - ps);
            s0[BC(0x528)] === void 0x0
              ? (s0[BC(0x528)] = s3)
              : (s0[BC(0x528)] = f7(s0[BC(0x528)], s3, 0.1));
          }
          s0[BC(0x58f)] += ((s2 ? -0x1 : 0x1) * pP) / 0x320;
          if (s0[BC(0x58f)] < 0x0) s0[BC(0x58f)] = 0x0;
          s0[BC(0x58f)] > 0x1 && pM[BC(0xc15)](rZ, 0x1);
        }
      }
    }
    var pO = Date[uu(0x5b6)](),
      pP = 0x0,
      pQ = 0x0,
      pR = pO;
    function pS() {
      const BD = uu;
      (pO = Date[BD(0x5b6)]()),
        (pP = pO - pR),
        (pR = pO),
        (pQ = pP / 0x21),
        hc();
      let rZ = 0x0;
      for (let s1 = 0x0; s1 < jW[BD(0xc60)]; s1++) {
        const s2 = jW[s1];
        if (!s2[BD(0x56b)]) jW[BD(0xc15)](s1, 0x1), s1--;
        else {
          if (
            (s2[BD(0x1bf)] &&
              !s2[BD(0x1bf)][BD(0x487)][BD(0x3a1)](BD(0x7f2))) ||
            s2[BD(0x550)][BD(0xa09)][BD(0xd21)] === BD(0x89b)
          )
            continue;
          else {
            jW[BD(0xc15)](s1, 0x1),
              s1--,
              s2[BD(0x487)][BD(0x5e5)](BD(0xe1b)),
              rZ++;
            if (rZ >= 0x14) break;
          }
        }
      }
      (pT[BD(0xcc2)] = ix), pN();
      kB[BD(0x487)][BD(0x3a1)](BD(0x7f2)) && (lK = pO);
      if (hu) {
        const s3 = pO / 0x50,
          s4 = Math[BD(0xdad)](s3) * 0x7,
          s5 = Math[BD(0x6e2)](Math[BD(0xdad)](s3 / 0x4)) * 0.15 + 0.85;
        ht[BD(0xa09)][BD(0xb34)] = BD(0x7a2) + s4 + BD(0x7ee) + s5 + ")";
      } else ht[BD(0xa09)][BD(0xb34)] = BD(0x89b);
      for (let s6 = jb[BD(0xc60)] - 0x1; s6 >= 0x0; s6--) {
        const s7 = jb[s6];
        if (s7[BD(0xc6e)]) {
          jb[BD(0xc15)](s6, 0x1);
          continue;
        }
        s7[BD(0x126)]();
      }
      for (let s8 = nM[BD(0xc60)] - 0x1; s8 >= 0x0; s8--) {
        const s9 = nM[s8];
        if (!s9[BD(0x56b)]) {
          nM[BD(0xc15)](s8, 0x1);
          continue;
        }
        s9[BD(0x630)]();
      }
      for (let sa = ja[BD(0xc60)] - 0x1; sa >= 0x0; sa--) {
        const sb = ja[sa];
        sb[BD(0xc6e)] &&
          sb["t"] <= 0x0 &&
          (sb[BD(0x5e5)](), ja[BD(0xc15)](sa, 0x1)),
          (sb["t"] += ((sb[BD(0xc6e)] ? -0x1 : 0x1) * pP) / sb[BD(0x328)]),
          (sb["t"] = Math[BD(0xd8d)](0x1, Math[BD(0x9b2)](0x0, sb["t"]))),
          sb[BD(0x630)]();
      }
      for (let sc = n1[BD(0xc60)] - 0x1; sc >= 0x0; sc--) {
        const sd = n1[sc];
        if (!sd["el"][BD(0x56b)]) sd[BD(0x5ef)] = ![];
        (sd[BD(0x217)] += ((sd[BD(0x5ef)] ? 0x1 : -0x1) * pP) / 0xc8),
          (sd[BD(0x217)] = Math[BD(0xd8d)](
            0x1,
            Math[BD(0x9b2)](sd[BD(0x217)])
          ));
        if (!sd[BD(0x5ef)] && sd[BD(0x217)] <= 0x0) {
          n1[BD(0xc15)](sc, 0x1), sd[BD(0x5e5)]();
          continue;
        }
        sd[BD(0xa09)][BD(0x844)] = sd[BD(0x217)];
      }
      if (p0) {
        p1 += pP / 0x7d0;
        if (p1 > 0x1) {
          p1 = 0x0;
          if (p2) {
            p0 = ![];
            const se = oY[BD(0x119)],
              sf = p2[BD(0x2db)];
            if (p2[BD(0xa0c)] > 0x0)
              oj[BD(0xa2e)]((sg) => sg[BD(0x7e4)]()),
                n4(oY["id"], sf),
                (oZ = 0x0),
                p5("?"),
                og[BD(0x487)][BD(0x8d8)](BD(0x441)),
                (ok = oe(se)),
                og[BD(0xd82)](ok),
                p4(ok[BD(0xad1)], p2[BD(0xa0c)]),
                (ok[BD(0x46d)] = function () {
                  const BE = BD;
                  n4(se["id"], p2[BE(0xa0c)]), pL(), (p2 = null);
                });
            else {
              oZ = sf;
              const sg = [...oj][BD(0x38e)](() => Math[BD(0x66d)]() - 0.5);
              for (let sh = 0x0, si = sg[BD(0xc60)]; sh < si; sh++) {
                const sj = sg[sh];
                sh >= sf ? sj[BD(0x7e4)]() : sj[BD(0x5be)](0x1 - sj[BD(0x9dd)]);
              }
              p2 = null;
            }
            p3();
          }
        }
      }
      for (let sk = 0x0; sk < oj[BD(0xc60)]; sk++) {
        oj[sk][BD(0x496)](p1);
      }
      for (let sl in ni) {
        const sm = ni[sl];
        if (!sm) {
          delete ni[sl];
          continue;
        }
        for (let sn = sm[BD(0xc60)] - 0x1; sn >= 0x0; sn--) {
          const so = sm[sn];
          so["t"] += pP;
          if (so[BD(0x747)]) so["t"] > lW && sm[BD(0xc15)](sn, 0x1);
          else {
            if (so["t"] > lT) {
              const sp = 0x1 - Math[BD(0xd8d)](0x1, (so["t"] - lT) / 0x7d0);
              (so[BD(0xa09)][BD(0x844)] = sp),
                sp <= 0x0 && sm[BD(0xc15)](sn, 0x1);
            }
          }
        }
        sm[BD(0xc60)] === 0x0 && delete ni[sl];
      }
      if (o4)
        sJ: {
          if (ij()) {
            (o5 += pP),
              (nX[BD(0xa09)][BD(0xb34)] =
                BD(0x85b) +
                (Math[BD(0xdad)](Date[BD(0x5b6)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (o5 > 0x3e8) {
              if (o6) {
                pK(cH[BD(0xde0)]), m0(![]);
                break sJ;
              }
              (o4 = ![]),
                (o6 = ![]),
                (o5 = 0x0),
                pK(),
                (oF += oO),
                oP(),
                oS(),
                m0(![]);
              const sq = d4(oG);
              if (sq !== iM) {
                const sr = sq - iM;
                for (let st = 0x0; st < iM; st++) {
                  const su = nz[BD(0x87b)][st];
                  su[BD(0xa8c)] += sr;
                }
                const ss = nz[BD(0x457)][BD(0xa8c)] + 0x1;
                for (let sv = 0x0; sv < sr; sv++) {
                  const sw = nP(BD(0x57a));
                  (sw[BD(0xa8c)] = iM + sv), ny[BD(0xd82)](sw);
                  const sx = nP(BD(0x57a));
                  (sx[BD(0xa8c)] = ss + sv),
                    sx[BD(0xd82)](
                      nP(BD(0xd5d) + ((sw[BD(0xa8c)] + 0x1) % 0xa) + BD(0x333))
                    ),
                    nz[BD(0xd82)](sx);
                }
                (iM = sq), (iN = iM * 0x2);
              }
            }
          } else (o4 = ![]), (o6 = ![]), (o5 = 0x0);
        }
      (oN = pv(oN, oL, 0x64)),
        (oM = pv(oM, oK, 0x64)),
        (o0[BD(0xa09)][BD(0x59c)] = oN * 0x64 + "%"),
        (o1[BD(0xa09)][BD(0x59c)] = oM * 0x64 + "%");
      for (let sy in pE) {
        !pE[sy][BD(0xd9b)] ? delete pE[sy] : (pE[sy][BD(0xd9b)] = ![]);
      }
      (na = pv(na, nc, 0x32)), (nb = pv(nb, nd, 0x32));
      const s0 = Math[BD(0xd8d)](0x64, pP) / 0x3c;
      pV -= 0x3 * s0;
      for (let sz = py[BD(0xc60)] - 0x1; sz >= 0x0; sz--) {
        const sA = py[sz];
        (sA["x"] += sA[BD(0xab0)] * s0),
          (sA["y"] += Math[BD(0xdad)](sA[BD(0x6b8)] * 0x2) * 0.8 * s0),
          (sA[BD(0x6b8)] += sA[BD(0xa93)] * s0),
          (sA[BD(0x205)] += 0.002 * pP),
          (sA[BD(0x79e)] = !![]);
        const sB = sA[BD(0x423)] * 0x2;
        (sA["x"] >= cZ + sB || sA["y"] < -sB || sA["y"] >= d0 + sB) &&
          (py[BD(0xc15)](sz, 0x1), pz(![]));
      }
      for (let sC = 0x0; sC < iF[BD(0xc60)]; sC++) {
        iF[sC][BD(0x630)]();
      }
      pu = Math[BD(0x9b2)](0x0, pu - pP / 0x12c);
      if (pa[BD(0x6ad)] && pu > 0x0) {
        const sD = Math[BD(0x66d)]() * 0x2 * Math["PI"],
          sE = pu * 0x3;
        (qJ = Math[BD(0x85f)](sD) * sE), (qK = Math[BD(0xdad)](sD) * sE);
      } else (qJ = 0x0), (qK = 0x0);
      (pw = pv(pw, pJ, 0xc8)), (nf = pv(nf, ne, 0x64));
      for (let sF = mI[BD(0xc60)] - 0x1; sF >= 0x0; sF--) {
        const sG = mI[sF];
        sG[BD(0x630)](), sG[BD(0xd50)] && mI[BD(0xc15)](sF, 0x1);
      }
      for (let sH = iv[BD(0xc60)] - 0x1; sH >= 0x0; sH--) {
        const sI = iv[sH];
        sI[BD(0x630)](),
          sI[BD(0xda1)] && sI[BD(0x86c)] > 0x1 && iv[BD(0xc15)](sH, 0x1);
      }
      ix && ((ps = ix["x"]), (pt = ix["y"])), qH(), window[BD(0x8cd)](pS);
    }
    var pT = pU();
    function pU() {
      const BF = uu,
        rZ = new lS(-0x1, 0x0, 0x0, 0x0, 0x1, cX[BF(0x4a1)], 0x19);
      return (rZ[BF(0x58f)] = 0x1), rZ;
    }
    var pV = 0x0,
      pW = [uu(0xbd0), uu(0x4dd), uu(0x63b)],
      pX = [];
    for (let rZ = 0x0; rZ < 0x3; rZ++) {
      for (let s0 = 0x0; s0 < 0x3; s0++) {
        const s1 = pY(pW[rZ], 0x1 - 0.05 * s0);
        pX[uu(0x7b8)](s1);
      }
    }
    function pY(s2, s3) {
      const BG = uu;
      return pZ(hz(s2)[BG(0x91f)]((s4) => s4 * s3));
    }
    function pZ(s2) {
      const BH = uu;
      return s2[BH(0x37f)](
        (s3, s4) => s3 + parseInt(s4)[BH(0x7bc)](0x10)[BH(0x9aa)](0x2, "0"),
        "#"
      );
    }
    function q0(s2) {
      const BI = uu;
      return BI(0x116) + s2[BI(0x6af)](",") + ")";
    }
    var q1 = document[uu(0x5d6)](uu(0x8d6));
    function q2() {
      const BJ = uu,
        s2 = document[BJ(0x57c)](BJ(0xa75));
      s2[BJ(0x59c)] = s2[BJ(0x52a)] = 0x3;
      const s3 = s2[BJ(0xc6f)]("2d");
      for (let s4 = 0x0; s4 < pX[BJ(0xc60)]; s4++) {
        const s5 = s4 % 0x3,
          s6 = (s4 - s5) / 0x3;
        (s3[BJ(0xc50)] = pX[s4]), s3[BJ(0x10e)](s5, s6, 0x1, 0x1);
        const s7 = j6[s4],
          s8 = j7[s4],
          s9 = nP(
            BJ(0xc47) +
              s8 +
              BJ(0x86e) +
              ((s6 + 0.5) / 0x3) * 0x64 +
              BJ(0x893) +
              ((s5 + 0.5) / 0x3) * 0x64 +
              BJ(0x7d9) +
              s7 +
              BJ(0x712)
          );
        q1[BJ(0x201)](s9, q1[BJ(0x87b)][0x0]);
      }
      q1[BJ(0xa09)][BJ(0xd37)] = BJ(0x6dc) + s2[BJ(0x40f)]() + ")";
    }
    q2();
    var q3 = document[uu(0x5d6)](uu(0x146)),
      q4 = document[uu(0x5d6)](uu(0xd09));
    function q5(s2, s3, s4) {
      const BK = uu;
      (s2[BK(0xa09)][BK(0x9f6)] = (s3 / j1) * 0x64 + "%"),
        (s2[BK(0xa09)][BK(0x762)] = (s4 / j1) * 0x64 + "%");
    }
    function q6() {
      const BL = uu,
        s2 = qM(),
        s3 = cZ / 0x2 / s2,
        s4 = d0 / 0x2 / s2,
        s5 = j3,
        s6 = Math[BL(0x9b2)](0x0, Math[BL(0xb54)]((ps - s3) / s5) - 0x1),
        s7 = Math[BL(0x9b2)](0x0, Math[BL(0xb54)]((pt - s4) / s5) - 0x1),
        s8 = Math[BL(0xd8d)](j4 - 0x1, Math[BL(0xbeb)]((ps + s3) / s5)),
        s9 = Math[BL(0xd8d)](j4 - 0x1, Math[BL(0xbeb)]((pt + s4) / s5));
      ki[BL(0xb1a)](), ki[BL(0x5df)](s5, s5), ki[BL(0x540)]();
      for (let sa = s6; sa <= s8 + 0x1; sa++) {
        ki[BL(0xc4d)](sa, s7), ki[BL(0x91a)](sa, s9 + 0x1);
      }
      for (let sb = s7; sb <= s9 + 0x1; sb++) {
        ki[BL(0xc4d)](s6, sb), ki[BL(0x91a)](s8 + 0x1, sb);
      }
      ki[BL(0xaea)]();
      for (let sc = s6; sc <= s8; sc++) {
        for (let sd = s7; sd <= s9; sd++) {
          ki[BL(0xb1a)](),
            ki[BL(0xbd2)]((sc + 0.5) * s5, (sd + 0.5) * s5),
            pI(ki, sc + "," + sd, 0x28, BL(0xd1d), 0x6),
            ki[BL(0xaea)]();
        }
      }
      (ki[BL(0xdf1)] = BL(0x702)),
        (ki[BL(0x930)] = 0xa),
        (ki[BL(0xe13)] = BL(0xbb6)),
        ki[BL(0x5b9)]();
    }
    function q7(s2, s3) {
      const BM = uu,
        s4 = nP(BM(0x532) + s2 + BM(0x3bd) + s3 + BM(0x6a1)),
        s5 = s4[BM(0x5d6)](BM(0x4ab));
      return (
        kl[BM(0xd82)](s4),
        (s4[BM(0x270)] = function (s6) {
          const BN = BM;
          s6 > 0x0 && s6 !== 0x1
            ? (s5[BN(0x13b)](BN(0xa09), BN(0xa24) + s6 * 0x168 + BN(0x218)),
              s4[BN(0x487)][BN(0x8d8)](BN(0x7f2)))
            : s4[BN(0x487)][BN(0x5e5)](BN(0x7f2));
        }),
        kl[BM(0x201)](s4, q1),
        s4
      );
    }
    var q8 = q7(uu(0xb0a), uu(0x31a));
    q8[uu(0x487)][uu(0x8d8)](uu(0x762));
    var q9 = nP(uu(0x277) + hO[uu(0x2e6)] + uu(0x819));
    q8[uu(0x87b)][0x0][uu(0xd82)](q9);
    var qa = q7(uu(0x567), uu(0x71f)),
      qb = q7(uu(0x730), uu(0x47d));
    qb[uu(0x487)][uu(0x8d8)](uu(0x8de));
    var qc = uu(0xd1f),
      qd = 0x2bc,
      qe = new lS("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cX[uu(0x4a1)], 0x19);
    qe[uu(0x474)] = 0x0;
    var qf = [
      [uu(0xb7d), uu(0xcaf)],
      [uu(0x6f2), uu(0xdb0)],
      [uu(0x628), uu(0xdb5)],
      [uu(0x325), uu(0x95c), uu(0x7ce)],
      [uu(0x2e9), uu(0x752)],
      [uu(0x765), uu(0xaac)],
      [uu(0x977), uu(0x6e3)],
    ];
    function qg() {
      const BO = uu;
      let s2 = "";
      const s3 = qf[BO(0xc60)] - 0x1;
      for (let s4 = 0x0; s4 < s3; s4++) {
        const s5 = qf[s4][0x0];
        (s2 += s5),
          s4 === s3 - 0x1
            ? (s2 += BO(0x11b) + qf[s4 + 0x1][0x0] + ".")
            : (s2 += ",\x20");
      }
      return s2;
    }
    var qh = qg(),
      qi = document[uu(0x5d6)](uu(0x92c));
    (qi[uu(0xd7f)] = function () {
      const BP = uu;
      return nP(
        BP(0x9fb) +
          hO[BP(0xca6)] +
          BP(0xbd8) +
          hO[BP(0x274)] +
          BP(0x681) +
          hO[BP(0xc03)] +
          BP(0x41b) +
          qh +
          BP(0xa3b)
      );
    }),
      (qi[uu(0x9b0)] = !![]);
    var qj =
      Date[uu(0x5b6)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[uu(0xb54)](Math[uu(0x66d)]() * qf[uu(0xc60)]);
    function qk() {
      const BQ = uu,
        s2 = qf[qj];
      (qe[BQ(0xbfe)] = s2[0x0]), (qe[BQ(0xafa)] = s2[0x1]);
      for (let s3 of iY) {
        qe[s3] = Math[BQ(0x66d)]() > 0.5;
      }
      qj = (qj + 0x1) % qf[BQ(0xc60)];
    }
    qk(),
      (qi[uu(0x46d)] = function () {
        const BR = uu;
        window[BR(0x20a)](qe[BR(0xafa)], BR(0x7a8)), qk();
      });
    var ql = new lS(uu(0x427), 0x0, -0x19, 0x0, 0x1, cX[uu(0x4a1)], 0x19);
    (ql[uu(0x474)] = 0x0), (ql[uu(0x1d9)] = !![]);
    var qm = [
        uu(0x8af),
        uu(0x6b5),
        uu(0x539),
        uu(0xbe4),
        uu(0xb14),
        uu(0x94b),
        uu(0x73b),
      ],
      qn = [
        uu(0x150),
        uu(0x24f),
        uu(0x8aa),
        uu(0x556),
        uu(0x424),
        uu(0x527),
        uu(0x868),
        uu(0x739),
      ],
      qo = 0x0;
    function qp() {
      const BS = uu,
        s2 = {};
      (s2[BS(0x240)] = qm[qo % qm[BS(0xc60)]]),
        (s2[BS(0x747)] = !![]),
        (s2[BS(0xdef)] = nh["me"]),
        nl(BS(0x427), s2),
        nl("yt", {
          text: qn[qo % qn[BS(0xc60)]][BS(0x88f)](
            BS(0xa96),
            kD[BS(0xc04)][BS(0x3ab)]() || BS(0xaab)
          ),
          isFakeChat: !![],
          col: nh["me"],
        }),
        qo++;
    }
    qp(), setInterval(qp, 0xfa0);
    var qq = 0x0,
      qr = Math[uu(0xbeb)](
        (Math[uu(0x9b2)](screen[uu(0x59c)], screen[uu(0x52a)], kT(), kU()) *
          window[uu(0xe24)]) /
          0xc
      ),
      qs = new lS(-0x1, 0x0, 0x0, 0x0, 0x1, cX[uu(0xb59)], 0x19);
    (qs[uu(0xda1)] = !![]), (qs[uu(0xa8d)] = 0x1), (qs[uu(0x5df)] = 0.6);
    var qt = (function () {
        const BT = uu,
          s2 = document[BT(0x57c)](BT(0xa75)),
          s3 = qr * 0x2;
        (s2[BT(0x59c)] = s2[BT(0x52a)] = s3),
          (s2[BT(0xa09)][BT(0x59c)] = s2[BT(0xa09)][BT(0x52a)] = BT(0x472));
        const s4 = document[BT(0x5d6)](BT(0x5b8));
        s4[BT(0xd82)](s2);
        const s5 = s2[BT(0xc6f)]("2d");
        return (
          (s2[BT(0xc93)] = function () {
            const BU = BT;
            (qs[BU(0x959)] = ![]),
              s5[BU(0x2f3)](0x0, 0x0, s3, s3),
              s5[BU(0xb1a)](),
              s5[BU(0xd57)](s3 / 0x64),
              s5[BU(0xbd2)](0x32, 0x32),
              s5[BU(0xd57)](0.8),
              s5[BU(0x5f9)](-Math["PI"] / 0x8),
              qs[BU(0xd6f)](s5),
              s5[BU(0xaea)]();
          }),
          s2
        );
      })(),
      qu,
      qv,
      qw,
      qx = ![];
    function qy() {
      const BV = uu;
      if (qx) return;
      (qx = !![]), iA();
      const s2 = qC(qr);
      qw = s2[BV(0x40f)](BV(0xc74));
      const s3 = qu * 0x64 + "%\x20" + qv * 0x64 + BV(0x160),
        s4 = nP(
          BV(0x2ab) +
            hP[BV(0x91f)](
              (s5, s6) => BV(0xe51) + s6 + BV(0xc7c) + s5 + BV(0x12e)
            )[BV(0x6af)]("\x0a") +
            BV(0xdaa) +
            nC[BV(0xe4c)] +
            BV(0xa16) +
            nC[BV(0x64f)] +
            BV(0x523) +
            nC[BV(0x2a6)] +
            BV(0x857) +
            dG +
            BV(0xe00) +
            qw +
            BV(0xe08) +
            s3 +
            BV(0x3e4) +
            s3 +
            BV(0xdfe) +
            s3 +
            BV(0xcd7) +
            s3 +
            BV(0x7e3)
        );
      document[BV(0xd31)][BV(0xd82)](s4);
    }
    function qz(s2) {
      const BW = uu,
        s3 =
          -s2[BW(0xdd2)]["x"] * 0x64 +
          "%\x20" +
          -s2[BW(0xdd2)]["y"] * 0x64 +
          "%";
      return (
        BW(0xd1c) +
        s3 +
        BW(0x40d) +
        s3 +
        BW(0x200) +
        s3 +
        BW(0x53d) +
        s3 +
        ";\x22"
      );
    }
    if (document[uu(0xc6a)] && document[uu(0xc6a)][uu(0xc91)]) {
      const s2 = setTimeout(qy, 0x1f40);
      document[uu(0xc6a)][uu(0xc91)][uu(0x535)](() => {
        const BX = uu;
        console[BX(0x21f)](BX(0x2ae)), clearTimeout(s2), qy();
      });
    } else qy();
    var qA = [];
    qB();
    function qB() {
      const BY = uu,
        s3 = {};
      (qu = 0xf), (qA = []);
      let s4 = 0x0;
      for (let s6 = 0x0; s6 < dB[BY(0xc60)]; s6++) {
        const s7 = dB[s6],
          s8 = BY(0x14b) + s7[BY(0x1a6)] + "_" + (s7[BY(0x9dd)] || 0x1),
          s9 = s3[s8];
        if (s9 === void 0x0) (s7[BY(0xdd2)] = s3[s8] = s5()), qA[BY(0x7b8)](s7);
        else {
          s7[BY(0xdd2)] = s9;
          continue;
        }
      }
      for (let sa = 0x0; sa < eJ[BY(0xc60)]; sa++) {
        const sb = eJ[sa],
          sc = BY(0xcd9) + sb[BY(0x1a6)],
          sd = s3[sc];
        if (sd === void 0x0) sb[BY(0xdd2)] = s3[sc] = s5();
        else {
          sb[BY(0xdd2)] = sd;
          continue;
        }
      }
      function s5() {
        const BZ = BY;
        return { x: s4 % qu, y: Math[BZ(0xb54)](s4 / qu), index: s4++ };
      }
    }
    function qC(s3) {
      const C0 = uu,
        s4 = qA[C0(0xc60)] + eK;
      qv = Math[C0(0xbeb)](s4 / qu);
      const s5 = document[C0(0x57c)](C0(0xa75));
      (s5[C0(0x59c)] = s3 * qu), (s5[C0(0x52a)] = s3 * qv);
      const s6 = s5[C0(0xc6f)]("2d"),
        s7 = 0x5a,
        s8 = s7 / 0x2,
        s9 = s3 / s7;
      s6[C0(0x5df)](s9, s9), s6[C0(0xbd2)](s8, s8);
      for (let sa = 0x0; sa < qA[C0(0xc60)]; sa++) {
        const sb = qA[sa];
        s6[C0(0xb1a)](),
          s6[C0(0xbd2)](sb[C0(0xdd2)]["x"] * s7, sb[C0(0xdd2)]["y"] * s7),
          s6[C0(0xb1a)](),
          s6[C0(0xbd2)](0x0 + sb[C0(0xd01)], -0x5 + sb[C0(0xcc8)]),
          sb[C0(0x231)](s6),
          s6[C0(0xaea)](),
          (s6[C0(0xc50)] = C0(0xd1d)),
          (s6[C0(0x509)] = C0(0x8de)),
          (s6[C0(0x797)] = C0(0x2fc)),
          (s6[C0(0x6df)] = C0(0x85c) + iz),
          (s6[C0(0x930)] = h4 ? 0x5 : 0x3),
          (s6[C0(0xdf1)] = C0(0xc37)),
          (s6[C0(0xe13)] = s6[C0(0xd4e)] = C0(0xbb6)),
          s6[C0(0xbd2)](0x0, s8 - 0x8 - s6[C0(0x930)]);
        let sc = sb[C0(0x1a6)];
        h4 && (sc = h6(sc));
        const sd = s6[C0(0xc99)](sc)[C0(0x59c)] + s6[C0(0x930)],
          se = Math[C0(0xd8d)](0x4c / sd, 0x1);
        s6[C0(0x5df)](se, se),
          s6[C0(0x505)](sc, 0x0, 0x0),
          s6[C0(0xae5)](sc, 0x0, 0x0),
          s6[C0(0xaea)]();
      }
      for (let sf = 0x0; sf < eK; sf++) {
        const sg = eJ[sf];
        s6[C0(0xb1a)](),
          s6[C0(0xbd2)](sg[C0(0xdd2)]["x"] * s7, sg[C0(0xdd2)]["y"] * s7),
          sg[C0(0xa2f)] !== void 0x0 &&
            (s6[C0(0x540)](), s6[C0(0x7ec)](-s8, -s8, s7, s7), s6[C0(0xb63)]()),
          s6[C0(0xbd2)](sg[C0(0xd01)], sg[C0(0xcc8)]),
          sg[C0(0x231)](s6),
          s6[C0(0xaea)]();
      }
      return s5;
    }
    var qD = new lF(-0x1, cR[uu(0x9ad)], 0x0, 0x0, Math[uu(0x66d)]() * 6.28);
    qD[uu(0x423)] = 0x32;
    function qE() {
      const C1 = uu;
      ki[C1(0x660)](j1 / 0x2, j1 / 0x2, j1 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qF(s3) {
      const C2 = uu,
        s4 = s3[C2(0xc60)],
        s5 = document[C2(0x57c)](C2(0xa75));
      s5[C2(0x59c)] = s5[C2(0x52a)] = s4;
      const s6 = s5[C2(0xc6f)]("2d"),
        s7 = s6[C2(0x964)](s4, s4);
      for (let s8 = 0x0; s8 < s4; s8++) {
        for (let s9 = 0x0; s9 < s4; s9++) {
          const sa = s3[s8][s9];
          if (!sa) continue;
          const sb = (s8 * s4 + s9) * 0x4;
          s7[C2(0xc5f)][sb + 0x3] = 0xff;
        }
      }
      return s6[C2(0x8e9)](s7, 0x0, 0x0), s5;
    }
    function qG() {
      const C3 = uu;
      if (!jJ) return;
      ki[C3(0xb1a)](),
        ki[C3(0x540)](),
        qE(),
        ki[C3(0xb63)](),
        !jJ[C3(0xa75)] && (jJ[C3(0xa75)] = qF(jJ)),
        (ki[C3(0x588)] = ![]),
        (ki[C3(0xa46)] = 0.08),
        ki[C3(0xc9d)](jJ[C3(0xa75)], 0x0, 0x0, j1, j1),
        ki[C3(0xaea)]();
    }
    function qH() {
      const C4 = uu;
      lL = 0x0;
      const s3 = kQ * kV;
      qq = 0x0;
      for (let s8 = 0x0; s8 < nM[C4(0xc60)]; s8++) {
        const s9 = nM[s8];
        s9[C4(0x7ed)] && s9[C4(0xc93)]();
      }
      if (
        kj[C4(0xa09)][C4(0xd21)] === "" ||
        document[C4(0xd31)][C4(0x487)][C4(0x3a1)](C4(0xe21))
      ) {
        (ki[C4(0xc50)] = C4(0xbd0)),
          ki[C4(0x10e)](0x0, 0x0, kh[C4(0x59c)], kh[C4(0x52a)]),
          ki[C4(0xb1a)]();
        let sa = Math[C4(0x9b2)](kh[C4(0x59c)] / cZ, kh[C4(0x52a)] / d0);
        ki[C4(0x5df)](sa, sa),
          ki[C4(0x7ec)](0x0, 0x0, cZ, d0),
          ki[C4(0xb1a)](),
          ki[C4(0xbd2)](pV, -pV),
          ki[C4(0x5df)](1.25, 1.25),
          (ki[C4(0xc50)] = kX),
          ki[C4(0xa90)](),
          ki[C4(0xaea)]();
        for (let sb = 0x0; sb < py[C4(0xc60)]; sb++) {
          py[sb][C4(0xd6f)](ki);
        }
        ki[C4(0xaea)]();
        if (pa[C4(0xb2f)] && pd[C4(0x404)] > 0x0) {
          const sc = pd[C4(0x17a)]();
          ki[C4(0xb1a)]();
          let sd = kV;
          ki[C4(0x5df)](sd, sd),
            ki[C4(0xbd2)](
              sc["x"] + sc[C4(0x59c)] / 0x2,
              sc["y"] + sc[C4(0x52a)]
            ),
            ki[C4(0xd57)](kQ * 0.8),
            ql[C4(0xd6f)](ki),
            ki[C4(0x5df)](0.7, 0.7),
            ql[C4(0x7b7)](ki),
            ki[C4(0xaea)]();
        }
        if (qi[C4(0x404)] > 0x0) {
          const se = qi[C4(0x17a)]();
          ki[C4(0xb1a)]();
          let sf = kV;
          ki[C4(0x5df)](sf, sf),
            ki[C4(0xbd2)](
              se["x"] + se[C4(0x59c)] / 0x2,
              se["y"] + se[C4(0x52a)] * 0.6
            ),
            ki[C4(0xd57)](kQ * 0.8),
            qe[C4(0xd6f)](ki),
            ki[C4(0xd57)](0.7),
            ki[C4(0xb1a)](),
            ki[C4(0xbd2)](0x0, -qe[C4(0x423)] - 0x23),
            pI(ki, qe[C4(0xbfe)], 0x12, C4(0xd1d), 0x3),
            ki[C4(0xaea)](),
            qe[C4(0x7b7)](ki),
            ki[C4(0xaea)]();
        }
        if (hl[C4(0x404)] > 0x0) {
          const sg = hl[C4(0x17a)]();
          ki[C4(0xb1a)]();
          let sh = kV;
          ki[C4(0x5df)](sh, sh),
            ki[C4(0xbd2)](
              sg["x"] + sg[C4(0x59c)] / 0x2,
              sg["y"] + sg[C4(0x52a)] * 0.5
            ),
            ki[C4(0xd57)](kQ),
            qD[C4(0xd6f)](ki),
            ki[C4(0xaea)]();
        }
        return;
      }
      if (jx)
        (ki[C4(0xc50)] = pX[0x0]),
          ki[C4(0x10e)](0x0, 0x0, kh[C4(0x59c)], kh[C4(0x52a)]);
      else {
        ki[C4(0xb1a)](), qL();
        for (let si = -0x1; si < 0x4; si++) {
          for (let sj = -0x1; sj < 0x4; sj++) {
            const sk = Math[C4(0x9b2)](0x0, Math[C4(0xd8d)](sj, 0x2)),
              sl = Math[C4(0x9b2)](0x0, Math[C4(0xd8d)](si, 0x2));
            (ki[C4(0xc50)] = pX[sl * 0x3 + sk]),
              ki[C4(0x10e)](sj * j2, si * j2, j2, j2);
          }
        }
        ki[C4(0x540)](),
          ki[C4(0x7ec)](0x0, 0x0, j1, j1),
          ki[C4(0xb63)](),
          ki[C4(0x540)](),
          ki[C4(0xc4d)](-0xa, j2),
          ki[C4(0x91a)](j2 * 0x2, j2),
          ki[C4(0xc4d)](j2 * 0x2, j2 * 0.5),
          ki[C4(0x91a)](j2 * 0x2, j2 * 1.5),
          ki[C4(0xc4d)](j2 * 0x1, j2 * 0x2),
          ki[C4(0x91a)](j1 + 0xa, j2 * 0x2),
          ki[C4(0xc4d)](j2, j2 * 1.5),
          ki[C4(0x91a)](j2, j2 * 2.5),
          (ki[C4(0x930)] = qd * 0x2),
          (ki[C4(0xe13)] = C4(0xbb6)),
          (ki[C4(0xdf1)] = qc),
          ki[C4(0x5b9)](),
          ki[C4(0xaea)]();
      }
      ki[C4(0xb1a)](),
        ki[C4(0x540)](),
        ki[C4(0x7ec)](0x0, 0x0, kh[C4(0x59c)], kh[C4(0x52a)]),
        qL();
      pa[C4(0x3b7)] && ((ki[C4(0xc50)] = kX), ki[C4(0xa90)]());
      ki[C4(0x540)]();
      jx ? qE() : ki[C4(0x7ec)](0x0, 0x0, j1, j1);
      ki[C4(0xaea)](),
        ki[C4(0x7ec)](0x0, 0x0, kh[C4(0x59c)], kh[C4(0x52a)]),
        (ki[C4(0xc50)] = qc),
        ki[C4(0xa90)](C4(0x36f)),
        ki[C4(0xb1a)](),
        qL();
      pa[C4(0x196)] && q6();
      qG();
      const s4 = [];
      let s5 = [];
      for (let sm = 0x0; sm < iv[C4(0xc60)]; sm++) {
        const sn = iv[sm];
        if (sn[C4(0x5d9)]) {
          if (ix) {
            if (
              pO - sn[C4(0x315)] < 0x3e8 ||
              Math[C4(0xbe5)](sn["nx"] - ix["x"], sn["ny"] - ix["y"]) <
                Math[C4(0xbe5)](sn["ox"] - ix["x"], sn["oy"] - ix["y"])
            ) {
              s4[C4(0x7b8)](sn), (sn[C4(0x315)] = pO);
              continue;
            }
          }
        }
        sn !== ix && s5[C4(0x7b8)](sn);
      }
      (s5 = qI(s5, (so) => so[C4(0x909)] === cR[C4(0xc52)])),
        (s5 = qI(s5, (so) => so[C4(0x909)] === cR[C4(0x2b1)])),
        (s5 = qI(s5, (so) => so[C4(0x909)] === cR[C4(0x5c7)])),
        (s5 = qI(s5, (so) => so[C4(0x17e)])),
        (s5 = qI(s5, (so) => so[C4(0x1f5)])),
        (s5 = qI(s5, (so) => so[C4(0xdb2)] && !so[C4(0x5da)])),
        (s5 = qI(s5, (so) => !so[C4(0x5da)])),
        qI(s5, (so) => !![]);
      ix && ix[C4(0xd6f)](ki);
      for (let so = 0x0; so < s4[C4(0xc60)]; so++) {
        s4[so][C4(0xd6f)](ki);
      }
      if (pa[C4(0x5b3)]) {
        ki[C4(0x540)]();
        for (let sp = 0x0; sp < iv[C4(0xc60)]; sp++) {
          const sq = iv[sp];
          if (sq[C4(0xda1)]) continue;
          if (sq[C4(0x42b)]) {
            ki[C4(0xb1a)](),
              ki[C4(0xbd2)](sq["x"], sq["y"]),
              ki[C4(0x5f9)](sq[C4(0x6b8)]);
            if (!sq[C4(0x44c)])
              ki[C4(0x7ec)](-sq[C4(0x423)], -0xa, sq[C4(0x423)] * 0x2, 0x14);
            else {
              ki[C4(0xc4d)](-sq[C4(0x423)], -0xa),
                ki[C4(0x91a)](-sq[C4(0x423)], 0xa);
              const sr = 0xa + sq[C4(0x44c)] * sq[C4(0x423)] * 0x2;
              ki[C4(0x91a)](sq[C4(0x423)], sr),
                ki[C4(0x91a)](sq[C4(0x423)], -sr),
                ki[C4(0x91a)](-sq[C4(0x423)], -0xa);
            }
            ki[C4(0xaea)]();
          } else
            ki[C4(0xc4d)](sq["x"] + sq[C4(0x423)], sq["y"]),
              ki[C4(0x660)](sq["x"], sq["y"], sq[C4(0x423)], 0x0, kZ);
        }
        (ki[C4(0x930)] = 0x2), (ki[C4(0xdf1)] = C4(0x2a6)), ki[C4(0x5b9)]();
      }
      const s6 = pa[C4(0x98c)] ? 0x1 / qN() : 0x1;
      for (let ss = 0x0; ss < iv[C4(0xc60)]; ss++) {
        const st = iv[ss];
        !st[C4(0xdb2)] && st[C4(0x79e)] && lX(st, ki, s6);
      }
      for (let su = 0x0; su < iv[C4(0xc60)]; su++) {
        const sv = iv[su];
        sv[C4(0x250)] && sv[C4(0x7b7)](ki, s6);
      }
      const s7 = pP / 0x12;
      ki[C4(0xb1a)](),
        (ki[C4(0x930)] = 0x7),
        (ki[C4(0xdf1)] = C4(0xd1d)),
        (ki[C4(0xe13)] = ki[C4(0xd4e)] = C4(0xa4b));
      for (let sw = iE[C4(0xc60)] - 0x1; sw >= 0x0; sw--) {
        const sx = iE[sw];
        sx["a"] -= pP / 0x1f4;
        if (sx["a"] <= 0x0) {
          iE[C4(0xc15)](sw, 0x1);
          continue;
        }
        (ki[C4(0xa46)] = sx["a"]), ki[C4(0x5b9)](sx[C4(0x635)]);
      }
      ki[C4(0xaea)]();
      if (pa[C4(0x795)])
        for (let sy = iy[C4(0xc60)] - 0x1; sy >= 0x0; sy--) {
          const sz = iy[sy];
          (sz["x"] += sz["vx"] * s7),
            (sz["y"] += sz["vy"] * s7),
            (sz["vy"] += 0.35 * s7);
          if (sz["vy"] > 0xa) {
            iy[C4(0xc15)](sy, 0x1);
            continue;
          }
          ki[C4(0xb1a)](),
            ki[C4(0xbd2)](sz["x"], sz["y"]),
            (ki[C4(0xa46)] = 0x1 - Math[C4(0x9b2)](0x0, sz["vy"] / 0xa)),
            ki[C4(0x5df)](sz[C4(0x423)], sz[C4(0x423)]),
            sz[C4(0x240)] !== void 0x0
              ? pI(ki, sz[C4(0x240)], 0x15, C4(0x682), 0x2, ![], sz[C4(0x423)])
              : (ki[C4(0x5f9)](sz[C4(0x6b8)]),
                pF(ki, C4(0xd48) + sz[C4(0x423)], 0x1e, 0x1e, function (sA) {
                  const C5 = C4;
                  sA[C5(0xbd2)](0xf, 0xf), nA(sA);
                })),
            ki[C4(0xaea)]();
        }
      ki[C4(0xaea)]();
      if (ix && pa[C4(0x171)] && !pa[C4(0x19a)]) {
        ki[C4(0xb1a)](),
          ki[C4(0xbd2)](kh[C4(0x59c)] / 0x2, kh[C4(0x52a)] / 0x2),
          ki[C4(0x5f9)](Math[C4(0x86a)](nb, na)),
          ki[C4(0x5df)](s3, s3);
        const sA = 0x28;
        let sB = Math[C4(0xbe5)](na, nb) / kQ;
        ki[C4(0x540)](),
          ki[C4(0xc4d)](sA, 0x0),
          ki[C4(0x91a)](sB, 0x0),
          ki[C4(0x91a)](sB + -0x14, -0x14),
          ki[C4(0xc4d)](sB, 0x0),
          ki[C4(0x91a)](sB + -0x14, 0x14),
          (ki[C4(0x930)] = 0xc),
          (ki[C4(0xe13)] = C4(0xbb6)),
          (ki[C4(0xd4e)] = C4(0xbb6)),
          (ki[C4(0xa46)] =
            sB < 0x64 ? Math[C4(0x9b2)](sB - 0x32, 0x0) / 0x32 : 0x1),
          (ki[C4(0xdf1)] = C4(0x702)),
          ki[C4(0x5b9)](),
          ki[C4(0xaea)]();
      }
      ki[C4(0xb1a)](),
        ki[C4(0x5df)](s3, s3),
        ki[C4(0xbd2)](0x28, 0x1e + 0x32),
        ki[C4(0xd57)](0.85);
      for (let sC = 0x0; sC < pM[C4(0xc60)]; sC++) {
        const sD = pM[sC];
        if (sC > 0x0) {
          const sE = lH(Math[C4(0x9b2)](sD[C4(0x58f)] - 0.5, 0x0) / 0.5);
          ki[C4(0xbd2)](0x0, (sC === 0x0 ? 0x46 : 0x41) * (0x1 - sE));
        }
        ki[C4(0xb1a)](),
          sC > 0x0 &&
            (ki[C4(0xbd2)](lH(sD[C4(0x58f)]) * -0x190, 0x0),
            ki[C4(0xd57)](0.85)),
          ki[C4(0xb1a)](),
          lY(sD, ki, !![]),
          (sD["id"] = (sD[C4(0xcc2)] && sD[C4(0xcc2)]["id"]) || -0x1),
          sD[C4(0xd6f)](ki),
          (sD["id"] = -0x1),
          ki[C4(0xaea)](),
          sD[C4(0x528)] !== void 0x0 &&
            (ki[C4(0xb1a)](),
            ki[C4(0x5f9)](sD[C4(0x528)]),
            ki[C4(0xbd2)](0x20, 0x0),
            ki[C4(0x540)](),
            ki[C4(0xc4d)](0x0, 0x6),
            ki[C4(0x91a)](0x0, -0x6),
            ki[C4(0x91a)](0x6, 0x0),
            ki[C4(0x51f)](),
            (ki[C4(0x930)] = 0x4),
            (ki[C4(0xe13)] = ki[C4(0xd4e)] = C4(0xbb6)),
            (ki[C4(0xdf1)] = C4(0xa15)),
            ki[C4(0x5b9)](),
            (ki[C4(0xc50)] = C4(0xd1d)),
            ki[C4(0xa90)](),
            ki[C4(0xaea)]()),
          ki[C4(0xaea)]();
      }
      ki[C4(0xaea)]();
    }
    function qI(s3, s4) {
      const C6 = uu,
        s5 = [];
      for (let s6 = 0x0; s6 < s3[C6(0xc60)]; s6++) {
        const s7 = s3[s6];
        if (s4[C6(0x670)] !== void 0x0 ? s4(s7) : s7[s4]) s7[C6(0xd6f)](ki);
        else s5[C6(0x7b8)](s7);
      }
      return s5;
    }
    var qJ = 0x0,
      qK = 0x0;
    function qL() {
      const C7 = uu;
      ki[C7(0xbd2)](kh[C7(0x59c)] / 0x2, kh[C7(0x52a)] / 0x2);
      let s3 = qM();
      ki[C7(0x5df)](s3, s3),
        ki[C7(0xbd2)](-ps, -pt),
        pa[C7(0x6ad)] && ki[C7(0xbd2)](qJ, qK);
    }
    function qM() {
      const C8 = uu;
      return Math[C8(0x9b2)](kh[C8(0x59c)] / cZ, kh[C8(0x52a)] / d0) * qN();
    }
    function qN() {
      return nf / pw;
    }
    kW(), pS();
    const qO = {};
    (qO[uu(0x670)] = uu(0x442)),
      (qO[uu(0xafa)] = uu(0xd70)),
      (qO[uu(0x25b)] = uu(0x2bc));
    const qP = {};
    (qP[uu(0x670)] = uu(0x12d)),
      (qP[uu(0xafa)] = uu(0x6ce)),
      (qP[uu(0x25b)] = uu(0xe10));
    const qQ = {};
    (qQ[uu(0x670)] = uu(0xb31)),
      (qQ[uu(0xafa)] = uu(0xa2b)),
      (qQ[uu(0x25b)] = uu(0xb18));
    const qR = {};
    (qR[uu(0x670)] = uu(0x207)),
      (qR[uu(0xafa)] = uu(0x2b0)),
      (qR[uu(0x25b)] = uu(0x7fa));
    const qS = {};
    (qS[uu(0x670)] = uu(0xd7b)),
      (qS[uu(0xafa)] = uu(0x17f)),
      (qS[uu(0x25b)] = uu(0x44b));
    const qT = {};
    (qT[uu(0x670)] = uu(0x4e8)),
      (qT[uu(0xafa)] = uu(0x99c)),
      (qT[uu(0x25b)] = uu(0x6a4));
    var qU = {
      eu_ffa1: qO,
      eu_ffa2: qP,
      as_ffa1: qQ,
      us_ffa1: qR,
      us_ffa2: qS,
      as_ffa2: qT,
      euSandbox: {
        name: uu(0xd84),
        color: uu(0x52f),
        onClick() {
          const C9 = uu;
          window[C9(0x20a)](C9(0x7ac), C9(0x7a8));
        },
      },
    };
    if (window[uu(0xb79)][uu(0x835)] !== uu(0xa79))
      for (let s3 in qU) {
        const s4 = qU[s3];
        if (!s4[uu(0xafa)]) continue;
        s4[uu(0xafa)] = s4[uu(0xafa)]
          [uu(0x88f)](uu(0xa79), uu(0x37a))
          [uu(0x88f)](uu(0x883), uu(0x637));
      }
    var qV = document[uu(0x5d6)](uu(0x7b5)),
      qW = document[uu(0x5d6)](uu(0x899)),
      qX = 0x0;
    for (let s5 in qU) {
      const s6 = qU[s5],
        s7 = document[uu(0x57c)](uu(0x807));
      s7[uu(0x9bf)] = uu(0x253);
      const s8 = document[uu(0x57c)](uu(0x7e5));
      s8[uu(0x13b)](uu(0x5b9), s6[uu(0x670)]), s7[uu(0xd82)](s8);
      const s9 = document[uu(0x57c)](uu(0x7e5));
      (s9[uu(0x9bf)] = uu(0x431)),
        (s6[uu(0xa10)] = 0x0),
        (s6[uu(0xa8e)] = function (sa) {
          const Ca = uu;
          (qX -= s6[Ca(0xa10)]),
            (s6[Ca(0xa10)] = sa),
            (qX += sa),
            k7(s9, kg(sa, Ca(0x8d5))),
            s7[Ca(0xd82)](s9);
          const sb = Ca(0x8b1) + kg(qX, Ca(0x8d5)) + Ca(0x675);
          k7(qZ, sb), k7(qW, sb);
        }),
        (s6[uu(0x304)] = function () {
          const Cb = uu;
          s6[Cb(0xa8e)](0x0), s9[Cb(0x5e5)]();
        }),
        (s7[uu(0xa09)][uu(0x553)] = s6[uu(0x25b)]),
        qV[uu(0xd82)](s7),
        (s7[uu(0x46d)] =
          s6[uu(0xaaf)] ||
          function () {
            const Cc = uu,
              sa = qV[Cc(0x5d6)](Cc(0x312));
            if (sa === s7) return;
            sa && sa[Cc(0x487)][Cc(0x5e5)](Cc(0x3fb)),
              this[Cc(0x487)][Cc(0x8d8)](Cc(0x3fb)),
              r2(s6[Cc(0xafa)]),
              (hC[Cc(0x5c5)] = s5);
          }),
        (s6["el"] = s7);
    }
    var qY = qU[uu(0xb52)]["el"];
    qY[uu(0x487)][uu(0x8d8)](uu(0xc64)),
      (qY[uu(0xd7f)] = function () {
        const Cd = uu;
        return nP(Cd(0x9fb) + hO[Cd(0xca6)] + Cd(0x91b));
      }),
      (qY[uu(0x9b0)] = !![]);
    var qZ = document[uu(0x57c)](uu(0x7e5));
    (qZ[uu(0x9bf)] = uu(0x4b3)), qV[uu(0xd82)](qZ);
    if (!![]) {
      r0();
      let sa = Date[uu(0x5b6)]();
      setInterval(function () {
        pO - sa > 0x2710 && (r0(), (sa = pO));
      }, 0x3e8);
    }
    function r0() {
      const Ce = uu;
      fetch(Ce(0x6db))
        [Ce(0x535)]((sb) => sb[Ce(0x545)]())
        [Ce(0x535)]((sb) => {
          const Cf = Ce;
          for (let sc in sb) {
            const sd = qU[sc];
            sd && sd[Cf(0xa8e)](sb[sc]);
          }
        })
        [Ce(0x5e0)]((sb) => {
          const Cg = Ce;
          console[Cg(0x648)](Cg(0xa55), sb);
        });
    }
    var r1 = window[uu(0x2ce)] || window[uu(0xb79)][uu(0xde7)] === uu(0x595);
    if (r1) hU(window[uu(0xb79)][uu(0x945)][uu(0x88f)](uu(0xbf9), "ws"));
    else {
      const sb = qU[hC[uu(0x5c5)]];
      if (sb) sb["el"][uu(0x7d6)]();
      else {
        let sc = "EU";
        fetch(uu(0x32d))
          [uu(0x535)]((sd) => sd[uu(0x545)]())
          [uu(0x535)]((sd) => {
            const Ch = uu;
            if (["NA", "SA"][Ch(0xb65)](sd[Ch(0x2b8)])) sc = "US";
            else ["AS", "OC"][Ch(0xb65)](sd[Ch(0x2b8)]) && (sc = "AS");
          })
          [uu(0x5e0)]((sd) => {
            const Ci = uu;
            console[Ci(0x21f)](Ci(0x4ea));
          })
          [uu(0x8f7)](function () {
            const Cj = uu,
              sd = [];
            for (let sf in qU) {
              const sg = qU[sf];
              sg[Cj(0x670)][Cj(0xa69)](sc) && sd[Cj(0x7b8)](sg);
            }
            const se =
              sd[Math[Cj(0xb54)](Math[Cj(0x66d)]() * sd[Cj(0xc60)])] ||
              qU[Cj(0x925)];
            console[Cj(0x21f)](Cj(0x518) + sc + Cj(0xc94) + se[Cj(0x670)]),
              se["el"][Cj(0x7d6)]();
          });
      }
    }
    (document[uu(0x5d6)](uu(0x309))[uu(0xa09)][uu(0xd21)] = uu(0x89b)),
      kz[uu(0x487)][uu(0x8d8)](uu(0x7f2)),
      kA[uu(0x487)][uu(0x5e5)](uu(0x7f2)),
      (window[uu(0xac5)] = function () {
        ik(new Uint8Array([0xff]));
      });
    function r2(sd) {
      const Ck = uu;
      clearTimeout(kE), it();
      const se = {};
      (se[Ck(0xafa)] = sd), (hT = se), kf(!![]);
    }
    window[uu(0x80f)] = r2;
    var r3 = null;
    function r4(sd) {
      const Cl = uu;
      if (!sd || typeof sd !== Cl(0x691)) {
        console[Cl(0x21f)](Cl(0xc5b));
        return;
      }
      if (r3) r3[Cl(0xc1c)]();
      const se = sd[Cl(0x799)] || {},
        sf = {};
      (sf[Cl(0x767)] = Cl(0x361)),
        (sf[Cl(0xbb7)] = Cl(0x318)),
        (sf[Cl(0x801)] = Cl(0x470)),
        (sf[Cl(0x380)] = Cl(0x274)),
        (sf[Cl(0x84e)] = !![]),
        (sf[Cl(0x3e3)] = !![]),
        (sf[Cl(0x7b9)] = ""),
        (sf[Cl(0x6de)] = ""),
        (sf[Cl(0xb74)] = !![]),
        (sf[Cl(0x343)] = !![]);
      const sg = sf;
      for (let sm in sg) {
        (se[sm] === void 0x0 || se[sm] === null) && (se[sm] = sg[sm]);
      }
      const sh = [];
      for (let sn in se) {
        sg[sn] === void 0x0 && sh[Cl(0x7b8)](sn);
      }
      sh[Cl(0xc60)] > 0x0 &&
        console[Cl(0x21f)](Cl(0x720) + sh[Cl(0x6af)](",\x20"));
      se[Cl(0x7b9)] === "" && se[Cl(0x6de)] === "" && (se[Cl(0x7b9)] = "x");
      (se[Cl(0xbb7)] = hO[se[Cl(0xbb7)]] || se[Cl(0xbb7)]),
        (se[Cl(0x380)] = hO[se[Cl(0x380)]] || se[Cl(0x380)]);
      const si = nP(
        Cl(0xa5a) +
          se[Cl(0x767)] +
          Cl(0xaa1) +
          se[Cl(0xbb7)] +
          Cl(0x54b) +
          (se[Cl(0x801)]
            ? Cl(0x796) +
              se[Cl(0x801)] +
              "\x22\x20" +
              (se[Cl(0x380)] ? Cl(0xb64) + se[Cl(0x380)] + "\x22" : "") +
              Cl(0xa32)
            : "") +
          Cl(0x1ea)
      );
      (r3 = si),
        (si[Cl(0xc1c)] = function () {
          const Cm = Cl;
          document[Cm(0xd31)][Cm(0x487)][Cm(0x5e5)](Cm(0xe21)),
            si[Cm(0x5e5)](),
            (r3 = null);
        }),
        (si[Cl(0x5d6)](Cl(0xc09))[Cl(0x46d)] = si[Cl(0xc1c)]);
      const sj = si[Cl(0x5d6)](Cl(0x178)),
        sk = [],
        sl = [];
      for (let so in sd) {
        if (so === Cl(0x799)) continue;
        const sp = sd[so];
        let sq = [];
        const sr = Array[Cl(0x105)](sp);
        let ss = 0x0;
        if (sr)
          for (let st = 0x0; st < sp[Cl(0xc60)]; st++) {
            const su = sp[st],
              sv = dE[su];
            if (!sv) {
              sk[Cl(0x7b8)](su);
              continue;
            }
            ss++, sq[Cl(0x7b8)]([su, void 0x0]);
          }
        else
          for (let sw in sp) {
            const sx = dE[sw];
            if (!sx) {
              sk[Cl(0x7b8)](sw);
              continue;
            }
            const sy = sp[sw];
            (ss += sy), sq[Cl(0x7b8)]([sw, sy]);
          }
        if (sq[Cl(0xc60)] === 0x0) continue;
        sl[Cl(0x7b8)]([ss, so, sq, sr]);
      }
      se[Cl(0x343)] && sl[Cl(0x38e)]((sz, sA) => sA[0x0] - sz[0x0]);
      for (let sz = 0x0; sz < sl[Cl(0xc60)]; sz++) {
        const [sA, sB, sC, sD] = sl[sz];
        se[Cl(0xb74)] && !sD && sC[Cl(0x38e)]((sH, sI) => sI[0x1] - sH[0x1]);
        let sE = "";
        se[Cl(0x84e)] && (sE += sz + 0x1 + ".\x20");
        sE += sB;
        const sF = nP(Cl(0xae9) + sE + Cl(0x9ea));
        sj[Cl(0xd82)](sF);
        const sG = nP(Cl(0x364));
        for (let sH = 0x0; sH < sC[Cl(0xc60)]; sH++) {
          const [sI, sJ] = sC[sH],
            sK = dE[sI],
            sL = nP(
              Cl(0x537) + sK[Cl(0x308)] + "\x22\x20" + qz(sK) + Cl(0xa32)
            );
          if (!sD && se[Cl(0x3e3)]) {
            const sM = se[Cl(0x7b9)] + k8(sJ) + se[Cl(0x6de)],
              sN = nP(Cl(0xaf3) + sM + Cl(0x9ea));
            sM[Cl(0xc60)] > 0x6 && sN[Cl(0x487)][Cl(0x8d8)](Cl(0x431)),
              sL[Cl(0xd82)](sN);
          }
          (sL[Cl(0xd7f)] = sK), sG[Cl(0xd82)](sL);
        }
        sj[Cl(0xd82)](sG);
      }
      kk[Cl(0xd82)](si),
        sk[Cl(0xc60)] > 0x0 &&
          console[Cl(0x21f)](Cl(0xa95) + sk[Cl(0x6af)](",\x20")),
        document[Cl(0xd31)][Cl(0x487)][Cl(0x8d8)](Cl(0xe21));
    }
    (window[uu(0x729)] = r4),
      (document[uu(0xd31)][uu(0xa59)] = function (sd) {
        const Cn = uu;
        sd[Cn(0x47c)]();
        const se = sd[Cn(0xfe)][Cn(0xbb8)][0x0];
        if (se && se[Cn(0x909)] === Cn(0x2e8)) {
          console[Cn(0x21f)](Cn(0x42d) + se[Cn(0x670)] + Cn(0x20d));
          const sf = new FileReader();
          (sf[Cn(0xc65)] = function (sg) {
            const Co = Cn,
              sh = sg[Co(0x6a9)][Co(0x8fa)];
            try {
              const si = JSON[Co(0x386)](sh);
              r4(si);
            } catch (sj) {
              console[Co(0x648)](Co(0x209), sj);
            }
          }),
            sf[Cn(0x6e1)](se);
        }
      }),
      (document[uu(0xd31)][uu(0x4ce)] = function (sd) {
        const Cp = uu;
        sd[Cp(0x47c)]();
      }),
      Object[uu(0xda6)](window, uu(0x2fb), {
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
      kq();
  })();
function b(c, d) {
  const e = a();
  return (
    (b = function (f, g) {
      f = f - 0xfc;
      let h = e[f];
      return h;
    }),
    b(c, d)
  );
}
function a() {
  const Cq = [
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "iGamble",
    ".dismiss-btn",
    "*Rock\x20health:\x2060\x20→\x20120",
    "spiderYoba",
    "#75dd34",
    "hasEars",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "search",
    "#ffe667",
    "petalPowder",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "warne",
    "centipedeBody",
    "toLowerCase",
    "21st\x20January\x202024",
    "col",
    "z8kgrX3dSq",
    "strokeStyle",
    "#cb37bf",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    "sqrt",
    "petalStr",
    "Petal\x20Weight",
    "WP/dQbddHH0",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "https://www.instagram.com/zertalious",
    "Missile\x20Health",
    "*Bone\x20armor:\x204\x20→\x205",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "#eee",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    "\x20Wave\x20",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    "Pet\x20Size\x20Increase",
    "opera",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "Spider_6",
    "petalSword",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    "Fixed\x20players\x20pushing\x20eachother.",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    "Mushroom",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "WQ7dTmk3W6FcIG",
    "Loading\x20video\x20ad...",
    "rgb(81\x20121\x20251)",
    "#ffd800",
    "Tumbleweed",
    "lineCap",
    "hasGem",
    "*Fire\x20damage:\x209\x20→\x2015",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "onresize",
    "poisonDamageF",
    "GBip",
    "running...",
    "no-icon",
    "INPUT",
    ".data-search",
    "isPoison",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    ".container",
    "hide-all",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "s...)",
    "devicePixelRatio",
    "respawnTime",
    "snail",
    "Yoba_1",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    "Disconnected.",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "spinSpeed",
    "oceed",
    "killed",
    "Extra\x20Vision",
    "\x20play",
    ".screen",
    "rock",
    "purple",
    "#735b49",
    "\x0a13th\x20May\x202024\x0aFixed\x20a\x20bug\x20that\x20didn\x27t\x20let\x20flowers\x20enter\x20portals.\x0aBalances:\x0a*Sword\x20damage:\x2017\x20→\x2021\x0a*Yin\x20yang\x20damage:\x2010\x20→\x2020\x0a*Yin\x20yang\x20reload:\x202s\x20→\x201.5s\x0a",
    "petRoamFactor",
    "/dlMob",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "Hyper\x20Players",
    "petalTurtle",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    "consumeProjDamage",
    "Reduced\x20Wave\x20duration.",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    "ame",
    "More\x20wave\x20changes:",
    "WR7cQCkf",
    "#f22",
    "*Iris\x20poison:\x2045\x20→\x2050",
    "damage",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "petalBubble",
    ".lottery-rarities",
    "#ffffff",
    "Orbit\x20Shlongation",
    "Extra\x20Spin\x20Speed",
    "green",
    "petalPacman",
    "nSkOW4GRtW",
    "#634002",
    ".mob-gallery\x20.dialog-content",
    ".tier-",
    "\x20pxls)\x20/\x20",
    "#634418",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "level",
    "Dragon_1",
    "Yoba\x20Egg",
    "curePoisonF",
    "10QIdaPR",
    "WRS8bSkQW4RcSLDU",
    "roundRect",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    "iAbsorb",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "pink",
    "isProj",
    "progress",
    "petalShrinker",
    "WOpcHSkuCtriW7/dJG",
    "Removed\x20disclaimer\x20from\x20menu.",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    "23rd\x20August\x202023",
    "dataTransfer",
    "charAt",
    "#fff0b8",
    ".max-wave",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "iMood",
    "toLocaleDateString",
    "isArray",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "petCount",
    "Fixed\x20Gem\x20glitch.",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "can\x20s",
    "PedoX",
    "25th\x20July\x202023",
    "hide",
    "fillRect",
    "WPJcKmoVc8o/",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "bolder\x2025px\x20",
    "keyClaimed",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "rgb(",
    "#4f412e",
    "├─\x20",
    "next",
    "useTimeTiers",
    "\x20&\x20",
    "Arrow",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "getRandomValues",
    "1st\x20February\x202024",
    "byteLength",
    "\x20HP",
    "qCkBW5pcR8kD",
    "numeric",
    "FSoixsnA",
    "3336680ZmjFAG",
    "updateProg",
    "Armor",
    "DMCA-ed",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    "shlong",
    "Petaler",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "EU\x20#2",
    "\x20!important;}",
    "poisonT",
    "*Taco\x20healing:\x208\x20→\x209",
    "\x22></span></div>\x0a\x09</div>",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "d.\x20Pr",
    "href",
    "strokeRect",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    "petalPincer",
    "px)",
    "setAttribute",
    "Swastika",
    "<div\x20class=\x22data-top-area\x22>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Current\x20Page:\x22></span>\x0a\x09\x09\x09\x09<select\x20tabindex=\x22-1\x22></select>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Search:\x22></span>\x0a\x09\x09\x09\x09<input\x20class=\x22textbox\x20data-search\x22\x20type=\x22text\x22\x20placeholder=\x22Enter\x20value...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<div\x20class=\x22data-search-result\x22\x20style=\x22display:none;\x22></div>\x0a\x09\x09</div>",
    "petalSunflower",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "state",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "isStatic",
    "#c69a2c",
    "accou",
    "KCsdZ",
    ".minimap-dot",
    "jellyfish",
    "Ant\x20Egg",
    "iWatchAd",
    "%/s",
    "petal_",
    "our\x20o",
    "19th\x20June\x202023",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "KeyR",
    "i\x20make\x20cool\x20videos",
    "enable_min_scaling",
    "hasHearts",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    "Shrinker",
    "stopWhileMoving",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "\x20radians",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    "*Yoba\x20Egg\x20buff.",
    ".debug-info",
    "6fCH",
    "petalSponge",
    "#222",
    "%\x20!important",
    "from",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "&quot;",
    "projAffectHealDur",
    "isSwastika",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    "saved_builds",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "\x20accounts",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    "4th\x20April\x202024",
    ".settings-btn",
    "\x20rad/s",
    "31st\x20July\x202023",
    ".xp",
    "show_helper",
    "usernameClaimed",
    "projD",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "/weborama.js",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "*Heavy\x20damage:\x209\x20→\x2010",
    ".dialog-content",
    "ui_scale",
    "getBoundingClientRect",
    "Passive\x20Heal",
    "barEl",
    "values",
    "renderBelowEverything",
    "wss://us2.hornex.pro",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    "Bone",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    "string",
    "translate(-50%,",
    "lient",
    "Added\x201\x20AS\x20lobby.",
    "#543d37",
    "Spider\x20Yoba",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    "#ffe200",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "resize",
    "#503402",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    "makeHole",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    ".leave-btn",
    "Hornet_1",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "month",
    "show_grid",
    "New\x20mob:\x20Mushroom.",
    "Makes\x20you\x20poisonous.",
    "Temporary\x20Extra\x20Speed",
    "enable_kb_movement",
    "Soil",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "oAngle",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "crafted\x20nothing\x20from",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    "spawn_zone",
    "Beetle_3",
    "day",
    "Could\x20not\x20claim\x20secret\x20skin.",
    "uiName",
    "uniqueIndex",
    "#39b54a",
    "\x20won\x20and\x20got\x20extra",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20class=\x22username-link\x22\x20stroke=\x22",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "26th\x20September\x202023",
    "getAttribute",
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "10th\x20August\x202023",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    "<div\x20class=\x22petal-icon\x22\x20",
    ".stats\x20.dialog-content",
    "└─\x20",
    "Poo",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "#7d5098",
    "*Gas\x20health:\x20250\x20→\x20200",
    "wave",
    "3m^(",
    ".logout-btn",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    "containerDialog",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "*Super:\x201%\x20→\x201.5%",
    "Pollen",
    "Luxurious\x20mansion\x20of\x20ants.",
    "0\x200",
    ".anti-spam-cb",
    "[censored]",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "blur",
    "7th\x20October\x202023",
    "<div\x20class=\x22chat-text\x22></div>",
    "onEnd",
    "#8d9acc",
    "Craft",
    "Dragon\x20Egg",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    "WP10rSoRnG",
    "rewards",
    "Rock\x20Egg",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "dice",
    ".petal.empty",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "isClown",
    "Gem",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    ".tabs",
    "statue",
    "Spider_5",
    "petalSoil",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    "keyInvalid",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "air",
    "cDHZ",
    "*Fire\x20health:\x2070\x20→\x2080",
    "centipedeHeadDesert",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    "builds",
    "getElementById",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    "craft-disable",
    "powderTime",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "hsla(0,0%,100%,0.5)",
    "*Peas\x20health:\x2020\x20→\x2025",
    "accountNotFound",
    "getUint32",
    "></di",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "isPet",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    "#fc5c5c",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    "Ghost",
    "Light",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    "*Cement\x20health:\x2080\x20→\x20100",
    "getTitleEl",
    ".gamble-prediction",
    ";-moz-background-position:\x20",
    "insertBefore",
    "Sussy\x20Discord\x20uwu",
    "#a760b1",
    ".killer",
    "moveCounter",
    ".grid",
    "US\x20#1",
    "Heal",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    "open",
    "New\x20mob:\x20Spider\x20Cave.",
    "*Rice\x20damage:\x205\x20→\x204",
    "...",
    ".petal-rows",
    "#b28b29",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    "curve",
    "WP4dWPa7qCklWPtcLq",
    "#cccccc",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    "alpha",
    "deg",
    "Yin\x20Yang",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "/dlSprite",
    "24th\x20July\x202023",
    "New\x20mob:\x20Dragon\x20Nest.",
    ".lottery",
    "log",
    "Flower\x20Health",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    "Avacado",
    "innerWidth",
    "1st\x20July\x202023",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    ".lottery\x20.inventory-petals",
    "14th\x20August\x202023",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2048\x2048\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x20\x20<title>data-source-solid</title>\x0a\x20\x20<g\x20id=\x22Layer_2\x22\x20data-name=\x22Layer\x202\x22>\x0a\x20\x20\x20\x20<g\x20id=\x22invisible_box\x22\x20data-name=\x22invisible\x20box\x22>\x0a\x20\x20\x20\x20\x20\x20<rect\x20width=\x2248\x22\x20height=\x2248\x22\x20fill=\x22none\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20\x20\x20<g\x20id=\x22icons_Q2\x22\x20data-name=\x22icons\x20Q2\x22>\x0a\x20\x20\x20\x20\x20\x20<path\x20d=\x22M46,9c0-6.8-19.8-7-22-7S2,2.2,2,9v7c0,.3,1.1,1.8,5.2,3.4h.3a40.3,40.3,0,0,0,8.6,2A65.6,65.6,0,0,0,24,22a65.6,65.6,0,0,0,7.9-.5,40.3,40.3,0,0,0,8.6-2h.3C44.9,17.8,46,16.3,46,16V9.3h0ZM2,31.3V39c0,6.8,19.8,7,22,7s22-.2,22-7V31.3C41.4,34.1,33.3,36,24,36S6.6,34.1,2,31.3Zm43.7-9.8a22.5,22.5,0,0,1-4.9,2.1A54.8,54.8,0,0,1,24,26,54.8,54.8,0,0,1,7.2,23.6a22.5,22.5,0,0,1-4.9-2.1L2,21.3V26c0,.3,1.2,1.9,5.5,3.5A50.2,50.2,0,0,0,24,32a50.2,50.2,0,0,0,16.5-2.5C44.8,27.9,46,26.3,46,26V21.3Z\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20</g>\x0a</svg>",
    "Body",
    "Added\x20maze\x20in\x20Waveroom:",
    "spiderCave",
    "projDamageF",
    "12th\x20November\x202023",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "rgba(0,0,0,0.4)",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "drawIcon",
    "*Powder\x20damage:\x2015\x20→\x2020",
    "Retardation\x20Duration",
    "#ccad00",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    "Spider_3",
    "c)H[",
    ".discord-area",
    "Decreases",
    "started!",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    ".box",
    "Lightsaber",
    "Has\x20fungal\x20infection\x20gg",
    "oncontextmenu",
    "text",
    "dontExpand",
    "video-ad-skipped",
    "Game\x20released\x20to\x20public!",
    ".ui-scale\x20select",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    "toLow",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    "Dragon_4",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "portalPoints",
    "loggedIn",
    "KeyF",
    "Failed\x20to\x20load\x20game\x20stats!",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    "isPlayer",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "\x20ago",
    "btn",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    ".yes-btn",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    "8URl",
    "*Recuded\x20mob\x20count.",
    "isBae",
    "color",
    "Breed\x20Strength",
    "setCount",
    "ctx",
    "Server-side\x20optimizations.",
    "iChat",
    "scrollHeight",
    "*Pincer\x20damage:\x205\x20→\x206",
    "expand",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "clientWidth",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    "shootLightning",
    "s.\x20Yo",
    ".username-input",
    ".total-accounts",
    "animationDirection",
    "Magnet",
    "timePlayed",
    "setValue",
    "*Rare:\x2050\x20→\x2035",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "Unusual",
    "angleOffset",
    "queen",
    "<div\x20style=\x22color:\x20",
    "Ghost_5",
    "CCofC2RcTG",
    "#3f1803",
    "#4eae26",
    "dev",
    "Sandstorm",
    "://ho",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    "<div\x20class=\x22btn\x22>\x0a\x09\x09\x09\x09<span\x20stroke=\x22",
    "(auto\x20reloading\x20in\x20",
    ".builds-btn",
    "Fossil",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "Turtle",
    "Banana",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "Even\x20more\x20wave\x20changes:",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    "guardian",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "petalCement",
    "22nd\x20July\x202023",
    "NHkBqi",
    "Flower\x20Poison",
    "\x20at\x20y",
    "W5T8c2BdUs/cJHBcR8o4uG",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "Beehive",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    "bolder\x2012px\x20",
    "invalid",
    "Some\x20anti\x20lag\x20measures:",
    "totalPetals",
    "9th\x20August\x202023",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    "shieldRegenPerSec",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "extraSpeedTemp",
    "makeLadybug",
    "petalShell",
    "isAggressive",
    "absorb",
    "blue",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "petSizeChangeFactor",
    "Soldier\x20Ant_4",
    "<style>\x0a\x09\x09",
    "*Rice\x20damage:\x204\x20→\x205",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "Fonts\x20loaded!",
    "focus",
    "wss://us1.hornex.pro",
    "web",
    ".rewards",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "swapped",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    "continent_code",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    "rgb(166\x2056\x20237)",
    "orbitDance",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "icBdNmoEta",
    "onmousedown",
    "tile_",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "#a82a00",
    "*Reduced\x20mob\x20count.",
    "KeyL",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    "hideTimer",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    "Last\x20Updated:\x20",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "isDevelopmentMode",
    "(?:^|;\x5cs*)",
    "#111",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    "Numpad",
    "halo",
    "childIndex",
    "keyAlreadyUsed",
    "*Arrow\x20damage:\x203\x20→\x204",
    "thirdEye",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "#924614",
    "petalsLeft",
    "#7777ff",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "startEl",
    "#d3bd46",
    "petalAvacado",
    "right_align_petals",
    "slowDuration",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    ".nickname",
    "Pincer",
    "Mythic",
    "Dragon\x20Nest",
    "application/json",
    "LavaWater",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "13th\x20February\x202024",
    ".inventory\x20.inventory-petals",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x22",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "Added\x201\x20more\x20EU\x20lobby.",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "#dc704b",
    "clearRect",
    "21st\x20June\x202023",
    "#4343a4",
    "<div\x20class=\x22btn\x20tier-",
    "angry",
    ".claimer",
    "#6f5514",
    "\x20petal",
    "msgpack",
    "bottom",
    ".prediction",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "NSlTg",
    "content",
    "#38c125",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    "WP5YoSoxvq",
    "hideUserCount",
    "%\x20success\x20rate",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "Extra\x20Pickup\x20Range",
    "tier",
    ".loader",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "tierStr",
    "crab",
    "Soaks\x20damage\x20over\x20time.",
    "10px",
    "Getting\x20",
    ".username-area",
    "textarea",
    ".active",
    "cmk+c0aoqSoLWQrQW6Tx",
    "petals!",
    "consumeTime",
    "killsNeeded",
    ".dc-group",
    "Super",
    "#bbbbbb",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "\x5c$1",
    "<div\x20stroke=\x22Last\x20Updated:\x2010s\x20ago\x22></div>",
    ".import-btn",
    "hasHalo",
    "Spider\x20Egg",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "*Snail\x20damage:\x2020\x20→\x2025",
    "picked",
    "Zert",
    "Orbit\x20Dance",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "dur",
    "(81*",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "https://ipapi.co/json/",
    "pet",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    ".show-scoreboard-cb",
    "petalSand",
    "show_debug_info",
    "]\x22></div>",
    "changedTouches",
    "Take\x20Down\x20Time",
    "*Arrow\x20damage:\x204\x20→\x205",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "Ultra\x20Players\x20(200+)",
    "Kills",
    "soldierAnt",
    "#2da14d",
    "10th\x20July\x202023",
    "nSize",
    "executed",
    "Rock_3",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    ".bar",
    "sortGroups",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    "petalAntEgg",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    "*Rock\x20health:\x20120\x20→\x20150",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "101636gyvtEF",
    "\x20and\x20",
    "pedox",
    "Beetle_2",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "Invalid\x20mob\x20name:\x20",
    ".export-btn",
    "bolder\x20",
    "#a2eb62",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "Taco",
    "settings",
    "Queen\x20Ant",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    "hasSpiderLeg",
    "your\x20",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "textEl",
    "YOBA",
    "Some\x20Data",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "<div\x20class=\x22petal-container\x22></div>",
    "cookie",
    "year",
    ".collected",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    "aip_complete",
    "drawSnailShell",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "Sandstorm_2",
    "start",
    "evenodd",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "cantPerformAction",
    "#888",
    "Gas",
    "Health",
    "25580HYpuup",
    "zvNu",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "Hnphe",
    "zert.pro",
    "Minor\x20physics\x20change.",
    "warn",
    "destroyed",
    "discord_data",
    "reduce",
    "descColor",
    "M28",
    "hpRegenPerSec",
    "#962921",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "fixedSize",
    "parse",
    "makeSpiderLegs",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "#29f2e5",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    "bruh",
    "sort",
    "Added\x20Shiny\x20mobs:",
    "2962870FrWQbw",
    ".clown",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "beetle",
    "\x22></div><div\x20class=\x22log-content\x22>",
    "Rock_6",
    "Spider\x20Cave",
    "#69371d",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "Hornet_3",
    "nigersaurus",
    "Air",
    "Crab",
    "isPassiveAggressive",
    ".watch-ad",
    "Spider\x20Legs",
    "contains",
    "*Bone\x20armor:\x208\x20→\x209",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    "pow",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "sizeIncreaseF",
    "New\x20petal:\x20Sponge",
    "9th\x20July\x202023",
    "shop",
    "Breed\x20Range",
    "trim",
    "dontUiRotate",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    "#5b4d3c",
    "OFFIC",
    "3rd\x20February\x202024",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "26th\x20August\x202023",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    "It\x20likes\x20to\x20dance.",
    "mousedown",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "show_bg_grid",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    "*Turtle\x20health\x20500\x20→\x20600",
    "16th\x20June\x202023",
    "\x22></span>\x20",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    "release",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    "[F]\x20Show\x20Hitbox:\x20",
    "Failed\x20to\x20get\x20game\x20stats.\x20Retrying\x20in\x205s...",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    "W7dcP8k2W7ZcLxtcHv0",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    "webSizeTiers",
    "mobDespawned",
    "projDamage",
    "number",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    "stringify",
    ".player-list",
    "iWithdrawPetal",
    "Added\x20Leave\x20Game\x20button.",
    "#34f6ff",
    "*2%\x20craft\x20success\x20rate.",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    "#882200",
    "Head",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "Lightning",
    "#b0c0ff",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "lastResizeTime",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    ".debug-cb",
    "fireTime",
    "Hornet\x20Egg",
    "#5ec13a",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    ".lottery-users",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    "showItemLabel",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    ".shake-cb",
    "pickupRangeTiers",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "Statue\x20of\x20RuinedLiberty.",
    "eyeY",
    "Wave\x20Ending...",
    "Peas",
    ".id-group",
    "rgb(255,\x2043,\x20117)",
    "hsl(110,100%,50%)",
    ".download-btn",
    ".low-quality-cb",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    "heart",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "regenAfterHp",
    "shadowBlur",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    ".game-stats-btn",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "active",
    "STOP!",
    "IAL\x20c",
    "*Health:\x20100\x20→\x20120",
    ".joystick-knob",
    "entRot",
    "iReqGambleList",
    "Soldier\x20Ant_5",
    "iReqGlb",
    "offsetWidth",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "Kicked!\x20(reason:\x20",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "mobPetaler",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    "KeyC",
    "Added\x20banner\x20ads.",
    ";-webkit-background-position:\x20",
    "*Reduced\x20drops\x20by\x2050%.",
    "toDataURL",
    "dandelion",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "petalArrow",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "*Snail\x20damage:\x2015\x20→\x2020",
    "#c9b46e",
    "Added\x202\x20US\x20lobbies.",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    "flowerPoison",
    "rkJNdF",
    "lightning",
    "Leave",
    "https://stats.hornex.pro/",
    "dragonNest",
    "size",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "misReflectDmgFactor",
    "petalStarfish",
    "nerd",
    "*Bone\x20armor:\x209\x20→\x2010",
    "pacman",
    "15842JzaQNh",
    "isRectHitbox",
    "29th\x20June\x202023",
    "Importing\x20data\x20file:\x20",
    "petalSpiderEgg",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "XCN6",
    "small",
    "#7af54c",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "#b5a24b",
    "mouse0",
    "ing\x20o",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "onclose",
    "d8k3BqDKF8o0WPu",
    "affectMobHeal",
    "W77cISkNWONdQa",
    "cuYF",
    "Buffed\x20Gem.",
    "pathSize",
    ".censor-cb",
    "ned.\x22",
    "show-petal",
    "EU\x20#1",
    "*Turtle\x20health:\x20600\x20→\x20900",
    "kbps",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "arrested\x20for\x20plagerism",
    "Spider",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "\x0a17th\x20May\x202024\x0aMore\x20game\x20stats\x20are\x20shown\x20now:\x0a*Total\x20Time\x20Played\x0a*Total\x20Games\x20Played\x0a*Total\x20Kills\x0a*Total\x20Chat\x20Sent\x0a*Total\x20Accounts\x0aNumpad\x20keys\x20can\x20also\x20be\x20used\x20to\x20swap\x20petals\x20now.\x0aPress\x20K\x20to\x20toggle\x20keyboard\x20controls.\x0a",
    "Increases\x20flower\x27s\x20health\x20power.",
    "rgb(237\x20236\x2061)",
    "rectAscend",
    ".keyboard-cb",
    ".ad-blocker",
    "*Increased\x20drop\x20rates.",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "#33a853",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "petalMushroom",
    "***",
    "Fixed\x20another\x20craft\x20exploit.",
    "Sword",
    "lastElementChild",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "damageF",
    ".death-info",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "iCraft",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    "Reduced\x20mobile\x20UI\x20scale.",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    ".hitbox-cb",
    "petalSnail",
    "11th\x20August\x202023",
    "B4@J",
    "hide-zone-mobs",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "fovFactor",
    "weight",
    "Super\x20Players",
    "#444444",
    "Elongation",
    "onclick",
    ".inventory-btn",
    "#393cb3",
    "Very\x20sussy\x20data!",
    "locat",
    "100%",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "angryT",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "Redesigned\x20some\x20mobs.",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "execCommand",
    "*Cotton\x20health:\x208\x20→\x209",
    "=([^;]*)",
    "preventDefault",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "honeyDmgF",
    ".lottery\x20.dialog-content",
    ".build-load-btn",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "A\x20default\x20petal.",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    "Petals",
    "hsla(0,0%,100%,0.1)",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "classList",
    "altKey",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    "#7d5b1f",
    "iPing",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    ".build-save-btn",
    "Spawn\x20zone\x20changes:",
    "inventory",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    ".flower-stats",
    "Third\x20Eye",
    "WRzmW4bPaa",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    "updatePos",
    ".changelog",
    "Sand",
    "spiderLeg",
    "#a52a2a",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "<div\x20class=\x22chat-text\x22>",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "data-icon",
    "statuePlayer",
    ".\x22>\x20<span\x20class=\x22username-link\x22\x20stroke=\x22",
    "neutral",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "Dandelion",
    "*Light\x20damage:\x2012\x20→\x2010",
    "KeyV",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "#15cee5",
    "respawnTimeTiers",
    ".craft-rate",
    ".timer",
    "yellowLadybug",
    "25th\x20August\x202023",
    "#cecfa3",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "spawnT",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    "small\x20full",
    "#8f5f34",
    "mobGallery",
    "*Cotton\x20health:\x2012\x20→\x2015",
    "<div\x20class=\x22chat-item\x22></div>",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "cmk/auqmq8o8WOngW79c",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    "New\x20mob:\x20M28.",
    "Changes\x20to\x20anti-lag\x20system:",
    "1438617kLPBKe",
    "DMCA",
    "\x20Ultra",
    "u\x20are",
    "occupySlot",
    "repeat",
    "\x20XP",
    "Statue",
    "mood",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "#fcfe04",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    "1841224gIAuLW",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    ".discord-user",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    "New\x20mob:\x20Nigersaurus.",
    "ondragover",
    "advanced\x20to\x20number\x20",
    "Wig",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    "[2tB",
    "13th\x20September\x202023",
    "flors",
    "Account\x20imported!",
    "Dragon_3",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    "3rd\x20July\x202023",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    ".absorb-btn",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    "#af6656",
    "hpAlpha",
    ".\x22></span></div>",
    "Bee",
    "4oL8",
    "twirl",
    "onmouseleave",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "13th\x20July\x202023",
    "fixed_mob_health_size",
    "AS\x20#2",
    "change_font",
    "Failed\x20to\x20find\x20region.",
    "Digit",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "unsuccessful",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "\x20Pym\x20Particle.",
    "toUpperCase",
    "*Super:\x20150+",
    "#ada25b",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    "<div\x20style=\x22width:100%;\x20text-align:center;\x22></div>",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    "28th\x20June\x202023",
    "Created\x20changelog.",
    ".lb",
    "Preroll\x20state:\x20",
    "Unknown\x20message\x20id:\x20",
    ".lb-btn",
    "Ghost_7",
    "projSize",
    "find",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    "hornex-pro_970x250",
    "strokeText",
    "rnex.",
    "slayed",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    "textAlign",
    "#ff63eb",
    "Soldier\x20Ant_6",
    "20th\x20June\x202023",
    ".connecting",
    "drawDragon",
    "armor",
    "oninput",
    "\x20tiles)",
    "W6HBdwO0",
    "joinedGame",
    "queenAnt",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "Region:\x20",
    "cEca",
    "Antennae",
    ":scope\x20>\x20.petal",
    "Scorpion\x20redesign.",
    "petalStickbug",
    "\x27s\x20Profile",
    "closePath",
    "petalTaco",
    "*Snail\x20health:\x2045\x20→\x2050",
    "iLeaveGame",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    ".rewards\x20.dialog-content",
    "web_",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    "posAngle",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    "height",
    "22nd\x20January\x202024",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "\x20You\x20",
    "W6rnWPrGWPfdbxmAWOHa",
    "#82c92f",
    "Increased\x20shiny\x20mob\x20size.",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    "WRRdT8kPWO7cMG",
    "and\x20a",
    "then",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "<div\x20class=\x22petal\x20tier-",
    "playerList",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "22nd\x20June\x202023",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "1st\x20April\x202024",
    ";\x20-o-background-position:",
    "ArrowLeft",
    "#d6b936",
    "beginPath",
    "makeAntenna",
    "lightningDmgF",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    "New\x20mob:\x20Sponge",
    "json",
    "projType",
    "\x22></div>\x0a\x09\x09",
    "Stickbug",
    "OQM)",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "\x22></div>\x0a\x09\x09\x09",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    "Honey\x20factory.",
    "endsWith",
    "scrollTop",
    "parentNode",
    "shieldReload",
    "#7dad0c",
    "backgroundColor",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    ".game-stats",
    "subscribe\x20for\x20999\x20super\x20petals",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "gambleList",
    "despawnTime",
    "ll\x20yo",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "7th\x20February\x202024",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    "Ant\x20Fire",
    ".show-bg-grid-cb",
    "yellow",
    "Dragon_2",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "avacado",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "MOVE\x20AWAY!!",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "usernameTaken",
    "*Swastika\x20health:\x2030\x20→\x2035",
    "isConnected",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    "numAccounts",
    ".tooltips",
    ".rewards-btn",
    ".fixed-player-health-cb",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "Antidote",
    "iAngle",
    "flower",
    "turtle",
    "uiCountGap",
    "#f54ce7",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "#7d893e",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    "iScore",
    "createElement",
    "#bb771e",
    "/tile\x20(",
    "waveStarting",
    "centipedeHead",
    "📜\x20",
    "motionKind",
    "en-US",
    "https",
    ".reload-btn",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    "beehive",
    "imageSmoothingEnabled",
    "poopPath",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    "text/plain;charset=utf-8;",
    "localId",
    "removeT",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    "Sandstorm_1",
    "Dragon_5",
    "Continue",
    "dSk+d0afnmo5WODJW6zQxW",
    "?dev",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    "fixAngle",
    "petalPollen",
    "#D2D1CD",
    "\x20+\x20",
    "KeyK",
    "width",
    "23rd\x20January\x202024",
    ".show-population-cb",
    "Added\x20level\x20up\x20reward\x20table.",
    "*Hyper:\x20175+",
    ".scores",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "worldW",
    "nt.\x20H",
    "nt\x20an",
    "*Reduced\x20HP\x20depletion.",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    "%!Ew",
    "*Peas\x20damage:\x2012\x20→\x2015",
    "breedPower",
    "getUint16",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    ".clown-cb",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "Connecting\x20to\x20",
    "Poop\x20colored\x20Ladybug.",
    "hit.p",
    "Powder",
    "show_hitbox",
    "Ghost_4",
    "Heal\x20Affect\x20Duration",
    "now",
    "Nigerian\x20Ladybug.",
    ".my-player",
    "stroke",
    "petalEgg",
    "*Arrow\x20health:\x20180\x20→\x20220",
    "qmklWO4",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "addCount",
    "kers\x20",
    ".find-user-input",
    "#b58500",
    "Bounces",
    "#ab5705",
    "\x20by",
    "server",
    "#b53229",
    "portal",
    "drawShell",
    ".menu",
    "Flower\x20Damage",
    "lightningDmg",
    "#8ac255",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "beaten\x20to\x20death",
    "Dark\x20Ladybug",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    "getFloat32",
    "leaders",
    "ultraPlayers",
    "keydown",
    "querySelector",
    "typeStr",
    "*Hyper:\x2015-25",
    "isConsumable",
    "renderOverEverything",
    "/hqdefault.jpg)",
    "lightningBounces",
    "ears",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "scale",
    "catch",
    "*Peas\x20damage:\x208\x20→\x2010",
    "*Arrow\x20damage:\x201\x20→\x203",
    "antennae",
    "code",
    "remove",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "Increased\x20Wave\x20mob\x20count.",
    "centipedeBodyDesert",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "rgba(0,\x200,\x200,\x200.2)",
    ".grid\x20.title",
    "\x20$1",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    "Increases\x20petal\x20spin\x20speed.",
    "doShow",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    "Yoba",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    "petalPea",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "Hornet_4",
    "rotate",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "Checking\x20username\x20availability...",
    "Soldier\x20Ant",
    "boostStrength",
    "Damage\x20Reflection",
    "petalGas",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    "#d9511f",
    "updateT",
    "ghost",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "score",
    "Added\x20another\x20AS\x20lobby.",
    "OPEN",
    "e8oQW7VdPKa",
    "WQpcUmojoSo6",
    "25th\x20January\x202024",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    "Lobby\x20Closing...",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    "show_population",
    "healthIncreaseF",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "ArrowDown",
    "drops",
    "Increases\x20petal\x20pickup\x20range.",
    "Sandstorm_5",
    "gcldSq",
    ".changelog\x20.dialog-content",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "nameEl",
    "groups",
    "KeyW",
    "Scorpion",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "hurtT",
    "Fire\x20Duration",
    "#38ecd9",
    "petalStinger",
    "\x20ctxs\x20(",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    "petalFire",
    "*Hyper:\x20240",
    "Passively\x20regenerates\x20your\x20health.",
    "Neowm",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    "oHealth",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "Removed\x20Centipedes\x20from\x20waves.",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "maxLength",
    "pickupRange",
    "update",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    ".pro",
    "2772301LQYLdH",
    "Level\x20",
    "path",
    ".stat-value",
    "wss://hornex-",
    ".petal-count",
    "#ce79a2",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    "#4d5e56",
    "Grapes",
    "6th\x20November\x202023",
    ".show-health-cb",
    "#8ecc51",
    "#ebda8d",
    "18th\x20July\x202023",
    "<div\x20class=\x22slot\x22></div>",
    "hpRegen",
    ".absorb-btn\x20.tooltip\x20span",
    "#555",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    "#4e3f40",
    "error",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "send",
    "teal\x20",
    "Mob\x20",
    "toggle",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "red",
    "16th\x20July\x202023",
    "petalStick",
    "2nd\x20July\x202023",
    "clientHeight",
    "8th\x20August\x202023",
    "breedTimerAlpha",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    "Former\x20student\x20of\x20Yoda.",
    "ShiftLeft",
    "[data-icon]",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    "petalRose",
    "[Y]\x20Show\x20Health:\x20",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    "Lightning\x20damage:\x2012\x20→\x208",
    "arc",
    "#999",
    "Nigersaurus",
    "hasSwastika",
    "hsla(0,0%,100%,0.3)",
    "\x22></div>\x20<div\x20style=\x22color:",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "Invalid\x20username.",
    "Mob\x20Agro\x20Range",
    "Bush",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "2nd\x20March\x202024",
    "New\x20score\x20formula.",
    "random",
    "n\x20war",
    "3rd\x20August\x202023",
    "name",
    "Jellyfish",
    "total",
    "orb\x20a",
    ".hyper-buy",
    "\x20online)",
    "are\x20p",
    "4\x20yummy\x20poisonous\x20balls.",
    "version",
    "innerHTML",
    "*Reduced\x20Shield\x20regen\x20time.",
    "1rrAouN",
    "span\x202",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "class=\x22chat-cap\x22",
    "2090768fiNzSa",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    "#f55",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "breedRange",
    "bsorb",
    "*Heavy\x20health:\x20450\x20→\x20500",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "6th\x20October\x202023",
    "scorpion",
    "Soak\x20Duration",
    "#416d1e",
    "wig",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    "Account\x20import/export\x20UI\x20redesigned.",
    "678dogVOU",
    "WPPnavtdUq",
    "object",
    "#bb3bc2",
    "fossil",
    "redHealthTimer",
    "readyState",
    "\x20was\x20",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "15584076IAHWRs",
    "Sandstorm_4",
    "<div><span\x20stroke=\x22",
    "<div\x20class=\x22chat-name\x22></div>",
    "<div\x20class=\x22petal-count\x22></div>",
    "Desert",
    "petalLight",
    "&#Uz",
    "nLrqsbisiv0SrmoD",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    "WAVE",
    "startPreRoll",
    "#3db3cb",
    "New\x20mob:\x20Sunflower.",
    "s\x20can",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "target",
    "\x22></span>\x0a\x09</div>",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    ".chat",
    "enable_shake",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "join",
    "assualted",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "url(https://i.ytimg.com/vi/",
    "26th\x20July\x202023",
    "nice\x20stolen\x20florr\x20assets",
    "nHealth",
    "\x22></span>\x0a\x09\x09\x09</div>",
    "angle",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "baseSize",
    "rgb(92,\x20116,\x20176)",
    "Honey\x20Range",
    "totalTimePlayed",
    "dragon",
    "Flower\x20#",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    "petalRockEgg",
    "xgMol",
    "13th\x20August\x202023",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    "Red\x20ball.",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    "ad\x20refresh",
    "iBreedTimer",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "ion",
    "*Snail\x20Health:\x20180\x20→\x20120",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "userProfile",
    "wss://eu2.hornex.pro",
    "rgba(0,0,0,0.08)",
    "rgba(0,0,0,0.35)",
    "petalSkull",
    "rando",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "dontResolveCol",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "#cfcfcf",
    "lightningBouncesTiers",
    "nShield",
    "#a2dd26",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "https://stats.hornex.pro/api/userCount",
    "url(",
    "maximumFractionDigits",
    "labelSuffix",
    "font",
    "finalMsg",
    "readAsText",
    "abs",
    "https://www.youtube.com/@gowcaw97",
    "Snail",
    "Passively\x20regenerates\x20shield.",
    "strok",
    "spawn",
    "totalAccounts",
    "stepPerSecMotion",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "append",
    "local",
    "isTrusted",
    "indexOf",
    "iSwapPetal",
    "ellipse",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    "2357",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    "petalLightning",
    "WR7dPdZdQXS",
    ".angry-btn",
    "tCkxW5FcNmkQ",
    "12OVuKwi",
    "armorF",
    "spikePath",
    "soldierAntFire",
    "long",
    "bar",
    "petalExpander",
    "User\x20not\x20found.",
    ".reload-timer",
    "rgba(0,0,0,0.2)",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    "KGw#",
    "r\x20acc",
    "Fire",
    "has\x20ended.",
    "Reflected\x20Missile\x20Damage",
    "#A8A7A4",
    "fromCharCode",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "Cement",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "\x22></span>",
    "hide-chat",
    "makeSponge",
    "onkeydown",
    "*Cotton\x20health:\x2010\x20→\x2012",
    "workerAnt",
    "Poop\x20Damage",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    "#347918",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "isRetard",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "drawTurtleShell",
    ".circle",
    "#288842",
    "petalChromosome",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    "gem",
    "0@x9",
    "displayData",
    ".swap-btn",
    "oSize",
    "Health\x20Depletion",
    "extraRangeTiers",
    "Nitro",
    "63kMBVvM",
    "ENTERING!!",
    "Kills\x20Needed",
    "*Peas\x20damage:\x2010\x20→\x2012",
    "hide-icons",
    "#32a852",
    "marginBottom",
    "#d43a47",
    "30th\x20June\x202023",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "ignore\x20if\x20u\x20already\x20subbed",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    ".absorb\x20.dialog-header\x20span",
    ".builds",
    "Enter",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    "removeChild",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    ".super-buy",
    "Honey\x20Damage",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "off",
    "isFakeChat",
    "Ugly\x20&\x20stinky.",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "Stick",
    "d\x20abs",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    "discord\x20err:",
    ".player-count",
    "Removed\x20Waves.",
    "\x0a5th\x20May\x202024\x0aHeavy\x20now\x20slows\x20down\x20your\x20petal\x20orbit\x20speed.\x20More\x20slowness\x20for\x20higher\x20rarity.\x20\x0aCotton\x20doesn\x27t\x20expand\x20like\x20Rose\x20when\x20you\x20are\x20angry.\x0aPowder\x20now\x20adds\x20turbulence\x20to\x20your\x20petals\x20when\x20you\x20are\x20angry.\x0aFixed\x20more\x20player\x20dupe\x20bugs.\x0a",
    "player_id",
    "https://www.youtube.com/@IAmLavaWater",
    "dontPushTeam",
    "abeQW7FdIW",
    "hornex-pro_300x600",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "29th\x20January\x202024",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    "#bff14c",
    "petalDmca",
    "#ce76db",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "top",
    "pickedEl",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    "Fussy\x20Sucker",
    ".inventory",
    "title",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    "isBoomerang",
    "#bebe2a",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    "totalGamesPlayed",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "affectHealDur",
    ".continue-btn",
    "Beetle_5",
    "x.pro",
    "Hornet_2",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    ".level",
    "Chromosome",
    "\x20-\x20",
    "isLightsaber",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    "static",
    "61CwulVr",
    "rad)",
    "side",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    "marginLeft",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    "rgb(222,111,44)",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "undefined",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    ".insta-btn",
    "encod",
    "avatar",
    "duration",
    "lieOnGroundTime",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    "lighter",
    "Beetle_4",
    "#76ad45",
    "Sprite",
    "Tiers",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "Added\x20Global\x20Leaderboard.",
    "show_damage",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    "textBaseline",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "metaData",
    "New\x20mob:\x20Tumbleweed.",
    "outdatedVersion",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    "#406150",
    "visible",
    "Fire\x20Ant\x20Hole",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    ".no-btn",
    "rotate(",
    "#82b11e",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "isStatue",
    ".shop-info",
    "Sponge",
    "_blank",
    "6th\x20September\x202023",
    ".expand-btn",
    "#222222",
    "https://sandbox.hornex.pro",
    "*Banana\x20health:\x20170\x20→\x20400",
    "onchange",
    ")\x20rotate(",
    "mobsEl",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    "#ff7380",
    ".server-area",
    "ount\x20",
    "drawChats",
    "push",
    "labelPrefix",
    "Favourite\x20object\x20of\x20a\x20woman.",
    "#bc0000",
    "toString",
    "stats",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "mobId",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "isSpecialWave",
    "low_quality",
    "New\x20mob:\x20Pedox",
    ".score-overlay",
    ".lottery-timer",
    "#e6a44d",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    "Mob\x20Rotation",
    "reflect",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "15807WcQReK",
    "\x20•\x20",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "New\x20mob:\x20Snail.",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "Server\x20side\x20performance\x20improvements.",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "click",
    "(reloading...)",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "%;\x22\x20stroke=\x22",
    "bone",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    "petalCactus",
    "\x20stea",
    "identifier",
    "Ghost_1",
    "1st\x20August\x202023",
    "#dbab2e",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "reset",
    "span",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    ".key-input",
    "petSizeIncrease",
    "Sunflower",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    "lottery",
    "rect",
    "canRender",
    "deg)\x20scale(",
    "Yoba_6",
    "#9fab2d",
    ".checkbox",
    "show",
    "hoq5",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    "reverse",
    "consumeProjHealth",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    "3YHM",
    "3WRI",
    "rgb(219\x20130\x2041)",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "iDepositPetal",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    "centipedeBodyPoison",
    "desc",
    "connectionIdle",
    "\x20domain=.hornex.pro",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    "show_scoreboard",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    "div",
    "accountId",
    "#8a6b1f",
    "changeLobby",
    "charCodeAt",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "cantChat",
    "connect",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "rgba(0,0,0,0.1)",
    "rgb(222,\x2031,\x2031)",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    "Poisonous\x20gas.",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    "KeyM",
    "\x22></span></div>",
    "*Legendary:\x20125\x20→\x20100",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    "Username\x20claimed!",
    "It\x20burns.",
    "unknown",
    "nig",
    "Rose",
    "Press\x20G\x20to\x20toggle\x20grid.",
    "253906KWTZJW",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "#9e7d24",
    "#a33b15",
    "Heavier\x20than\x20your\x20mom.",
    "#363685",
    "#be342a",
    "isPortal",
    "querySelectorAll",
    "\x20Blue",
    "#ffd941",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "redHealth",
    "Hornet",
    "els",
    ".collected-petals",
    "hostname",
    "queenAntFire",
    "updateTime",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "15th\x20August\x202023",
    "Ancester\x20of\x20flowers.",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "Beetle\x20Egg",
    "dir",
    "Buffed\x20Lightsaber:",
    "onkeyup",
    "Starfish",
    "),0)",
    "j[zf",
    "opacity",
    "ages.",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    "#c8a826",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "hide-scoreboard",
    "rgba(0,0,0,0.2",
    "#f2b971",
    "addGroupNumbers",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "absolute",
    "<div>",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "#fdda40",
    "transformOrigin",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "makeBallAntenna",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "scale(",
    "bolder\x2017px\x20",
    "Need\x20to\x20be\x20Lvl\x20",
    "right",
    "cos",
    "flowerPoisonF",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "shiftKey",
    "getHurtColor",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    "15th\x20June\x202023",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "no\x20sub,\x20no\x20gg",
    "darkLadybug",
    "atan2",
    "disabled",
    "deadT",
    "petalBone",
    ";position:absolute;top:",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "*Peas\x20damage:\x2015\x20→\x2020",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "#333333",
    "keyCheckFailed",
    "New\x20mob:\x20Turtle",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    "2nd\x20August\x202023",
    ".spawn-zones",
    ".max-score",
    "children",
    "keyCode",
    "#dddddd",
    "sameTypeColResolveOnly",
    "privacy.txt",
    ".progress",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    "tals.",
    "wss://",
    "petalPoo",
    ".ads",
    "*Rock\x20health:\x2050\x20→\x2060",
    "Dahlia",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "New\x20settings:\x20Low\x20quality.",
    "petalWave",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    "onmessage",
    "18th\x20September\x202023",
    "mobSizeChange",
    "replace",
    "hasAbsorbers",
    "accountData",
    "admin_pass",
    "%;left:",
    "powderPath",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    "zmkhtdVdSq",
    "5th\x20January\x202024",
    ".global-user-count",
    "%</option>",
    "none",
    "translate(-50%,\x20",
    "#bb1a34",
    "1167390UrVkfV",
    "petalLightsaber",
    "addToInventory",
    "invalid\x20uuid",
    "#cf7030",
    "key",
    "targetEl",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    "petalDrop",
    "projSpeed",
    "affectMobHealDur",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    "i\x20need\x20999\x20billion\x20subs",
    "#b0473b",
    "lightblue",
    "Orbit\x20Twirl",
    "Added\x20Lottery.",
    "they\x20copied\x20florr\x20code\x20omg!!",
    "*Rock\x20health:\x20150\x20→\x20200",
    "(total\x20",
    "Heavy",
    "255192PmzAXa",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "Leaf",
    "petalYinYang",
    "tagName",
    "reason:\x20",
    "scorp",
    "*Bone\x20armor:\x207\x20→\x208",
    "healthIncrease",
    "legD",
    "Poison",
    "bubble",
    "petalMagnet",
    "#d3d14f",
    "sq8Ig3e",
    "Craft\x20rate\x20change:",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    "userChat",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "*Rose\x20heal:\x2013\x20→\x2011",
    "fake",
    ".absorb-clear-btn",
    "*Rock\x20health:\x2045\x20→\x2050",
    "WP3dRYddTJC",
    "requestAnimationFrame",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "Dragon_6",
    "Worker\x20Ant",
    "users",
    "W5OTW6uDWPScW5eZ",
    ".stats",
    ".data-search-result",
    "user",
    ".minimap",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "add",
    "3L$0",
    "babyAntFire",
    "*Epic:\x2075\x20→\x2065",
    "/profile",
    "documentElement",
    "center",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    "Faster",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "webSize",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "desktop",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "hpRegenPerSecF",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "putImageData",
    ".waveroom-info",
    "Petal\x20",
    "hostn",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    "Much\x20heavier\x20than\x20your\x20mom.",
    "createdAt",
    "hsl(60,60%,30%)",
    "Ladybug",
    "*Removed\x20Ultra\x20wave.",
    "Waveroom",
    "Rare",
    "Wave",
    "waveNumber",
    "finally",
    "23rd\x20July\x202023",
    "host",
    "result",
    "Invalid\x20account!",
    "projPoisonDamageF",
    "719574lHbJUW",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "Spider_4",
    "superPlayers",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "#ff3333",
    "#b05a3c",
    "yoba",
    "#aaaaaa",
    "hasAntenna",
    "type",
    "UNOFF",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    "*Hyper:\x202%\x20→\x201%",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    "binaryType",
    "#fc9840",
    "Increased\x20map\x20size\x20by\x2030%.",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "#c1ab00",
    "petalCoffee",
    "Slowness\x20Duration",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "Ghost_6",
    "petalRice",
    "#5849f5",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    "lineTo",
    "\x22\x20stroke=\x22Hornex\x20Sandbox:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Singleplayer\x20Hornex\x20with\x20admin\x20commands\x20and\x20access\x20to\x20unlimited\x20petals.\x20Might\x20be\x20fun\x20for\x20testing\x20random\x20stuff.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x2030+\x20dev\x20commands\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Access\x20to\x20all\x20rarity\x20petals!\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Craft\x20billions\x20of\x20petals!\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Sussy\x20Map\x20Editor\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Some\x20new\x20mobs\x20&\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Go\x20check\x20it\x20out!\x22></div>\x0a\x09</div>",
    "Wing",
    "\x0a\x0a\x09\x09\x09",
    "26th\x20January\x202024",
    "map",
    "e=\x22Yo",
    "acker",
    "8th\x20July\x202023",
    "ArrowRight",
    "Yoba_4",
    "eu_ffa",
    "Hornet_6",
    "Extremely\x20slow\x20sussy\x20mob.",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "quadraticCurveTo",
    "#000000",
    ".featured",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "#efc99b",
    "WP4hW755jCokWRdcKchdT3ui",
    "lineWidth",
    "localStorage\x20denied.",
    "hasEye",
    "28th\x20December\x202023",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    "moveFactor",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "12th\x20July\x202023",
    "Provide\x20a\x20name\x20dummy.",
    "unset",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    ".build-petals",
    "countAngleOffset",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "Range",
    "onopen",
    "copyright\x20striked",
    "#323032",
    "#6265eb",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    "origin",
    "totalKills",
    "Regenerates\x20health\x20when\x20consumed.",
    "wn\x20ri",
    "Beetle_1",
    "#21c4b9",
    "goofy\x20ahh\x20insect\x20robbery",
    "glbData",
    "choked",
    ".discord-btn",
    "Connected!",
    "translate(calc(",
    "released",
    "WOziW7b9bq",
    "#654a19",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "Web\x20Radius",
    "#ff4f4f",
    "\x20petals",
    "spin",
    "isShiny",
    "px\x20",
    "tail",
    "https://discord.gg/zZsUUg8rbu",
    "Salt",
    "gblcVXldOG",
    "loading",
    "Added\x20video\x20ad.",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "vFKOVD",
    "5th\x20July\x202023",
    "createImageData",
    "changelog",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "#d3ad46",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "Extra\x20Speed",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "#ceea33",
    "petalLeaf",
    "20th\x20July\x202023",
    "17th\x20June\x202023",
    ".clear-build-btn",
    "#eb4755",
    "Downloaded!",
    "ability",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    "Fleepoint",
    "pedoxMain",
    ".mob-gallery",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    "iJoin",
    "#368316",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "New\x20mob:\x20Beehive.",
    "ICIAL",
    "transition",
    "iPercent",
    ".login-btn",
    "spawnOnHurt",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "4th\x20September\x202023",
    "been\x20",
    "It\x20has\x20sussy\x20movement.",
    "Password\x20downloaded!",
    ".common",
    "fixed_name_size",
    "anti_spam",
    "antHole",
    "erCas",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "honeyRange",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "Username\x20is\x20already\x20taken.",
    "Pacman",
    "Dragon",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "#400",
    "isBooster",
    "petalerDrop",
    "wss://as2.hornex.pro",
    "Ants\x20redesign.",
    "Q2mA",
    "petalDrop_",
    "isSleeping",
    "canSkipRen",
    "hide_chat",
    ".tooltip",
    "makeMissile",
    "#735d5f",
    "19th\x20January\x202024",
    "points",
    "mushroom",
    ".player-list-btn",
    "padStart",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    "Breaths\x20fire.",
    "m28",
    ".textbox",
    "1998256OxsvrH",
    "tooltipDown",
    "#d3c66d",
    "max",
    "^F[@",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    "Fixed\x20Rice.",
    "9iYdxUh",
    "#ebeb34",
    "#97782b",
    "Cotton\x20bush.",
    "Yoba_5",
    "an\x20UN",
    "#709e45",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    "fire",
    "className",
    ".shop",
    "Ghost_3",
    "eyeX",
    "Saved\x20Build\x20#",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "fixed_player_health_size",
    "cactus",
    "fireDamage",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    "Furry",
    "pop",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "KeyU",
    "*Unsual:\x2025\x20→\x2010",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "26th\x20June\x202023",
    "health",
    ".builds\x20.dialog-content",
    "KeyY",
    "#5ab6ab",
    "offsetHeight",
    "#764b90",
    "asdfadsf",
    "countTiers",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    "count",
    "spotPath_",
    "e\x20bee",
    ".tv-next",
    "*Light\x20damage:\x2013\x20→\x2012",
    "24th\x20June\x202023",
    ".absorb-rarity-btns",
    "Space",
    "#454545",
    "bush",
    "Ant\x20Hole",
    "getUint8",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "\x22></div>",
    "&response_type=code&scope=identify&state=",
    "terms.txt",
    "Halo",
    ".petals.small",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    "16th\x20September\x202023",
    "setPos",
    "toFixed",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    "4th\x20July\x202023",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    "left",
    "6th\x20July\x202023",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "fontSize",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "#b52d00",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    ".time-alive",
    "KeyX",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    "25th\x20June\x202023",
    "iCheckKey",
    "canShowDrops",
    "hsla(0,0%,100%,0.4)",
    ".privacy-btn",
    "Passive\x20Shield",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    "style",
    "setUint16",
    "27th\x20February\x202024",
    "successCount",
    "Beetle",
    ".absorb-petals",
    ".game-stats\x20.dialog-content",
    "userCount",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "stayIdle",
    "hideAfterInactivity",
    "deltaY",
    "#333",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "rgb(134,\x2031,\x20222)",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "petalSwastika",
    ".collected-rarities",
    "\x20clie",
    "Stick\x20does\x20not\x20expand\x20now.",
    "password",
    "Bubble",
    "fire\x20ant",
    "*Ultra:\x201-5",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    "New\x20rarity:\x20Hyper.",
    "Lvl\x20",
    "--angle:",
    "petalNitro",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "poisonDamage",
    "isIcon",
    "#a58368",
    "#ab7544",
    "wss://as1.hornex.pro",
    "petalIris",
    "hpRegen75PerSecF",
    "forEach",
    "chain",
    "Boomerang.",
    "OFF",
    "></div>",
    "reloadT",
    "1Jge",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    "passive",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    "clientX",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    "\x22></div>\x0a\x09</div>",
    "*Super:\x20180",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    "des",
    "Legendary",
    "function",
    "W5bKgSkSW78",
    ".level-progress",
    "isCentiBody",
    "#feffc9",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    "globalAlpha",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "petDamageFactor",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    "miter",
    "extraRange",
    "3597183gLgAGo",
    "uiAngle",
    "Summons\x20the\x20power\x20of\x20wind.",
    "Gives\x20you\x20a\x20shield.",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "addEventListener",
    "toLocaleString",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    "Failed\x20to\x20get\x20userCount!",
    "#f009e5",
    ".petals",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "ondrop",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    "kicked",
    "Soldier\x20Ant_2",
    "userAgent",
    "𐐿𐐘𐐫𐑀𐐃",
    "attachPetal",
    "#a5d141",
    "checked",
    "Congratulations!",
    "Missile\x20Damage",
    "Wave\x20changes:",
    "change-font",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
    "decode",
    "startsWith",
    "prototype",
    "#b9baba",
    "*Missile\x20damage:\x2050\x20→\x2055",
    "KeyS",
    "val",
    "Absorb",
    "*Heavy\x20health:\x20500\x20→\x20600",
    ".fixed-name-cb",
    "Fixed\x20another\x20crafting\x20exploit.",
    "projPoisonDamage",
    ".copy-btn",
    "canvas",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    "mouse2",
    "isLightning",
    "hornex.pro",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "centipedeHeadPoison",
    "petalYobaEgg",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "#d0bb55",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    "#328379",
    ".craft-btn",
    "isInventoryPetal",
    "sk.",
    "#4040fc",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "5th\x20August\x202023",
    "#ff7892",
    "onmouseup",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    "Soldier\x20Ant_3",
    "index",
    "sadT",
    "setUserCount",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    "fill",
    "Web",
    "WRZdV8kNW5FcHq",
    "angleSpeed",
    "Goofy\x20little\x20wanderer.",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "%nick%",
    "download",
    "onStart",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "/s\x20if\x20H<50%",
    "Hyper",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    "useTime",
    "arraybuffer",
    "KICKED!",
    "ANKUAsHKW5LZmq",
    "\x22\x20style=\x22color:",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "crafted",
    "Guardian",
    ".sad-btn",
    "lobbyClosing",
    ".absorb\x20.dialog-content",
    "setTargetByEvent",
    "<div\x20",
    "unnamed",
    "https://www.youtube.com/@FussySucker",
    "Iris",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "onClick",
    "moveSpeed",
    "adplayer",
    "globalCompositeOperation",
    ".discord-avatar",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x20no-hide\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    "prog",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    "passiveBoost",
    "User\x20not\x20found!",
    "curePoison",
    ".total-kills",
    "Rock_1",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    "Wave\x20Starting...",
    "fireDamageF",
    "Heart",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "isTanky",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "onwheel",
    "sendBadMsg",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    "Re-added\x20Waves.",
    "ShiftRight",
    "http://localhost:6767/",
    "uiScale",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "6th\x20August\x202023",
    "maxTimeAlive",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "Pill\x20affects\x20Arrow\x20now.",
    "WARNING!",
    "countEl",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "Hornet_5",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "weedSeed",
    "#db4437",
    "#695118",
    "New\x20setting:\x20UI\x20Scale.",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    "nAngle",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "tumbleweed",
    "#cfc295",
    ".main",
    "petalSuspill",
    "touchmove",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    ".player-list\x20.dialog-content",
    "Fixed\x20number\x20rounding\x20issue.",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "fillText",
    "petalWing",
    "have\x20",
    "Poison\x20Reduction",
    "<div\x20stroke=\x22",
    "restore",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "krBw",
    "Mob\x20Size\x20Change",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "petalDandelion",
    "Sandstorm_3",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "bqpdSW",
    "\x0a4th\x20May\x202024\x0aFixed\x20a\x20player\x20dupe\x20bug.\x20\x0aBalances:\x0a*Taco\x20healing:\x209\x20→\x2010\x0a*Sunflower\x20shield:\x201\x20→\x202.5\x0a*Shell\x20shield:\x208\x20→\x2012\x0a*Buffed\x20Yoba\x20Egg\x20by\x2050%\x0a",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "55078DZMiSD",
    ".right-align-petals-cb",
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "url",
    "hpRegen75PerSec",
    ".fixed-mob-health-cb",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    "Shield\x20Reuse\x20Cooldown",
    "All\x20Petals",
    "consumeProjDamageF",
    "timeJoined",
    "Rice",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "Skull",
    "23rd\x20June\x202023",
    "\x20players\x20•\x20",
    "#754a8f",
    "LEAVE\x20ZONE!!",
    "getBigUint64",
    "<div\x20class=\x22dialog\x20tier-",
    "Yoba_2",
    "absorbDamage",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    "#c76cd1",
    "Honey",
    "Added\x20Shop.",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    ".scale-cb",
    "reload",
    "rgb(237\x2061\x20234)",
    "WRyiwZv5x3eIdtzgdgC",
    "save",
    "<div\x20class=\x22data-search-item\x22>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22#",
    "20th\x20January\x202024",
    ".lottery-winner",
    "assassinated",
    "\x22></span>\x20<span\x20stroke=\x22•\x20",
    "shadowColor",
    "reqFailed",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    "petalDragonEgg",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    "\x20downloaded!",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    "\x20at\x20least!",
    "waveShowTimer",
    "#cdbb48",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "ontouchend",
    "BrnPE",
    "show_clown",
    "Fire\x20Damage",
    "AS\x20#1",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "transform",
    "hornex",
    "sword",
    "Rock",
    "Yellow\x20Ladybug",
    "210ZoZRjI",
    "Shield",
    "flipDir",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    "petalFaster",
    "<div\x20class=\x22spinner\x22></div>",
    "*Damage:\x204\x20→\x206",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "Epic",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    ";\x22\x20stroke=\x22",
    "New\x20mob:\x20Fossil.",
    "11th\x20July\x202023",
    "2-digit",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    ".chat-content",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    "mobile",
    "Added\x20Waves.",
    "consumeProjHealthF",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    ".petals-picked",
    "sandstorm",
    "Ears",
    "euSandbox",
    "New\x20petal:\x20Wig.",
    "floor",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    "slice",
    "Rock_5",
    "button",
    "sad",
    "petalWeb",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "rgb(255,\x20230,\x2093)",
    "soakTime",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    ".credits",
    ".submit-btn",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    "clip",
    "style=\x22color:",
    "includes",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "#709d45",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    ".petal",
    "l\x20you",
    "Claiming\x20secret\x20skin...",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    "14dafFDX",
    "hornet",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "15th\x20July\x202023",
    "getTransform",
    "sortGroupItems",
    "Added\x20Waveroom:",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "sizeIncrease",
    "location",
    ".gamble-petals-btn",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "4bfAGNk",
    "KePiKgamer",
    "orbitRange",
    ".changelog-btn",
    "encode",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    "\x0a1st\x20June\x202024\x0aAdded\x20Hornex\x20Sandbox\x20link.\x0a",
    "\x0a\x09</div>",
    ".settings",
    "petalBasic",
    "oPlayerX",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "pro",
    "*Cotton\x20health:\x207\x20→\x208",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "#d54324",
    "<div>\x0a\x09\x09<span\x20stroke=\x22",
    "insert\x20something\x20here...",
    ".inventory-petals",
    "Your\x20Profile",
    "Duration",
    "marginTop",
    "3220DFvaar",
    "credits",
    "Petal\x20Slots",
    "Extra\x20Range",
    "hsl(60,60%,60%)",
    "Fixed\x20duplicate\x20drops.",
    ".play-btn",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "*Fire\x20health:\x2080\x20→\x20120",
    "Comes\x20to\x20avenge\x20mobs.",
    "hsl(60,60%,",
    "7th\x20July\x202023",
    "nProg",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    "21st\x20July\x202023",
    "#854608",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "Spider_1",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    "hasSpawnImmunity",
    "Username\x20too\x20big!",
    "#eeeeee",
    "#fbdf26",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    "Nitro\x20Boost",
    "cacheRendered",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    "ffa\x20sandbox",
    ".tv-prev",
    "round",
    "titleColor",
    "files",
    "Spider_2",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "Copied!",
    "Coffee",
    "antHoleFire",
    "setUint8",
    "*They\x20give\x2010x\x20score.",
    "http://localhost:8001/discord",
    "#8f5db0",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "\x27s\x20profile...",
    "12th\x20August\x202023",
    "rgba(0,0,0,0.3)",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "randomUUID",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "elongation",
    "#5ef64f",
    "5th\x20September\x202023",
    "\x20petals\x22></div>\x0a\x09\x09\x09\x09\x09</div>",
    "TC0B",
    "buffer",
    "#1ea761",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    "translate",
    "*Gas\x20health:\x20140\x20→\x20250",
    "iReqUserProfile",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    "shield",
    "regenF",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "Ghost_2",
    "#ff94c9",
    "Ruined",
    "isHudPetal",
    "fixed",
    "25056691zykLwS",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    "dmca\x20it\x20m28!",
    "hypot",
    "Dice",
    ".absorb",
    "setTargetEl",
    "test",
    ".scoreboard-title",
    "ceil",
    "sponge",
    "New\x20mob:\x20Statue.",
    "gameStats.json",
    "absorbPetalEl",
    "kWicW5FdMW",
    "rgba(0,\x200,\x200,\x200.15)",
    "retardDuration",
    "*Opening\x20Lottery",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    "spider",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "projHealthF",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "http",
    "setUint32",
    "#493911",
    "\x22\x20stroke=\x22(",
    "player",
    "nick",
    "#f7904b",
    "%\x20-\x200.8em*",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "Common",
    "value",
    "petalAntidote",
    "iSwapPetalRow",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "New\x20mob:\x20Dice.",
    ".close-btn",
    ".chat-input",
    "bezierCurveTo",
    "arial",
    "sign",
    "agroRangeDec",
    "/dlPetal",
    "runSpeed",
    "#cfbb50",
    "Fire\x20Ant",
    "\x20petals\x22></div>",
    "Stinger",
    "splice",
    "deg)",
    "substr",
    "/s\x20for\x20all\x20tiles)",
    "\x20FPS\x20/\x20",
    "2nd\x20October\x202023",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "dispose",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    "clientY",
    "Crab\x20redesign.",
    "Increased\x20Ultra\x20key\x20price.",
    "progressEl",
    "<option\x20value=\x22",
    "split",
    "#a17c4c",
    "VLa2",
    "Client-side\x20performance\x20improvements.",
    "exp",
    "14th\x20July\x202023",
    "ontouchstart",
    "Can\x27t\x20perform\x20that\x20action.",
    "4th\x20August\x202023",
    "petals",
    ".damage-cb",
    "#8b533f",
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "rgba(0,0,0,",
    "bqpdUNe",
    "Balancing:",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "[G]\x20Show\x20Grid:\x20",
    "#000",
    "wing",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    "oiynC",
    "W6RcRmo0WR/cQSo1W4PifG",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    "Invalid\x20petal\x20name:\x20",
    "Cactus",
    ".stats\x20.dialog-header\x20span",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "New\x20mob:\x20Furry.",
    ".zone-mobs",
    "\x20(Lvl\x20",
    "Cotton",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "<span\x20style=\x22color:",
    "shieldHpLosePerSec",
    "*Ultra:\x20125+",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    "rgb(126,\x20239,\x20109)",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    "moveTo",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    "KeyD",
    "fillStyle",
    "27th\x20July\x202023",
    "honeyTile",
    "%zY4",
    "seed",
    "shell",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "*Yoba\x20health:\x20500\x20→\x20350",
    "\x20in\x20view\x20/\x20",
    "rgb(31,\x20219,\x20222)",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    "Poop\x20Health",
    "deadPreDraw",
    "[K]\x20Keyboard\x20Controls:\x20",
    "data",
    "length",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    "uiHealth",
    "gameStats",
    "sandbox-btn",
    "onload",
    "#353331",
    "tail_outline",
    "\x22>Page\x20#",
    ".lottery-btn",
    "fonts",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "#e05748",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    "doRemove",
    "getContext",
    "*Ultra:\x20120",
    "prepend",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    "image/png",
    "close",
    "hsla(0,0%,100%,0.15)",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    "*Cotton\x20health:\x209\x20→\x2010",
    "Shell",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    "{background-color:",
    "horne",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "shinyCol",
    ".change-font-cb",
    "filter",
    "Missile\x20Poison",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    "cmd",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "#a44343",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "createPattern",
    "19th\x20July\x202023",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "background",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    "\x22\x20stroke=\x22",
    "ready",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "render",
    "\x0aServer:\x20",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    "wrecked",
    "27th\x20June\x202023",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "measureText",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "hsl(110,100%,10%)",
    "innerHeight",
    "drawImage",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "#ffd363",
    ".hide-chat-cb",
    "petalMissile",
    "Sandstorm_6",
    ".shop-btn",
    "petalHoney",
    "Ultra",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    "Desert\x20Centipede",
    "1px",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    "Increases",
    "Buffs:",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "https://www.youtube.com/@KePiKgamer",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "mobKilled",
    "#79211b",
    ".helper-cb",
    "#c1a37d",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "main",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Expander",
    "Yourself",
    "Rock_4",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    "\x20no-icon\x22\x20",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    "No\x20username\x20provided.",
    "clipboard",
    "match",
    ".claim-btn",
    "targetPlayer",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    "loginFailed",
    "24th\x20August\x202023",
    ".hud",
    "isSupporter",
    "uiY",
    "#2e933c",
    "inclu",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "*Powder\x20health:\x2010\x20→\x2015",
    "extraSpeed",
    "\x20all\x20",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    ".credits-btn",
    "*Gas\x20poison:\x2030\x20→\x2040",
    ".find-user-btn",
    "https://auth.hornex.pro/discord",
    "petHealthFactor",
    "breedTimer",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    "writeText",
    "mob_",
    "Evil\x20Centipede",
    "cloneNode",
    "u\x20hav",
    "blur(10px)",
    "*Snail\x20damage:\x2010\x20→\x2015",
    ".switch-btn",
    "rgb(43,\x20255,\x20163)",
    "show_health",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    "#a07f53",
    "W7/cOmkwW4lcU3dcHKS",
    "#fe98a2",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "Basic",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    "</option>",
    "complete",
    ".zone-name",
    "Video\x20AD\x20success!",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    ".terms-btn",
    "#555555",
    "Removed\x20EU\x20#3.",
    "Beetle_6",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    "gridColumn",
    ".stats-btn",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    "RuinedLiberty",
    "#ffe763",
    ".joystick",
    "hsl(110,100%,60%)",
    "uiX",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "onMove",
    ".username-link",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "drawArmAndGem",
    "n8oKoxnarXHzeIzdmW",
    "GsP9",
    ".minimap-cross",
    "*Banana\x20damage:\x201\x20→\x202",
    "furry",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    "petalRock",
    "totalChatSent",
    "iReqAccountData",
    "switched",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "Nerfs:",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "fontFamily",
    "</div><div\x20class=\x22log-line\x22></div>",
    "petalCotton",
    "Nerfed\x20Ant\x20Holes:",
    "rainbow-text",
    "WRbjb8oX",
    "Rock_2",
    "compression\x20version\x20not\x20supported:\x20",
    "style=\x22background-position:\x20",
    "#fff",
    "Increases\x20your\x20vision.",
    "rgba(0,0,0,0.15)",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "display",
    "copy",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    "Wave\x20",
    "*Halo\x20now\x20stacks.",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "Centipede",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    "keyup",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "vendor",
    "honeyDmg",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    "shieldRegenPerSecF",
    "petHealF",
    "body",
    "hyperPlayers",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "n\x20an\x20",
    "murdered",
    "backgroundImage",
    "Loaded\x20Build\x20#",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    "bg-rainbow",
    "#554213",
    "\x0a16th\x20May\x202024\x0aAdded\x20Game\x20Statistics:\x0a*Super\x20Players\x0a*Hyper\x20Players\x0a*Ultra\x20Players\x20(with\x20more\x20than\x20200\x20ultra\x20petals)\x0a*All\x20Petals\x0a*Data\x20is\x20updated\x20every\x20hour.\x0a*You\x20can\x20search\x20game\x20stats\x20by\x20username.\x0a",
    "adplayer-not-found",
    "oPlayerY",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "Baby\x20Ant",
    "ur\x20pe",
    "\x0a22nd\x20May\x202024\x0aNew\x20setting:\x20Show\x20Health.\x20Press\x20Y\x20to\x20toggle.\x0aNew\x20setting:\x20Fixed\x20Flower\x20Health\x20Bar\x20Size.\x0aNew\x20setting:\x20Fixed\x20Mob\x20Health\x20Bar\x20Size.\x0aNew\x20setting:\x20Change\x20Font.\x0aHoney\x20now\x20also\x20shows\x20tile\x20count\x20&\x20total\x20damage\x20casted\x20by\x20all\x20tiles\x20in\x201\x20second.\x20Do\x20note\x20the\x20numbers\x20are\x20for\x20most\x20ideal\x20case.\x20Most\x20of\x20the\x20time\x20you\x20won\x27t\x20get\x20that\x20much\x20damage.\x0a",
    "shift",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "uwu",
    "activeElement",
    "particle_heart_",
    ".shop-overlay",
    "bone_outline",
    "layin",
    "#775d3e",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "lineJoin",
    "onmousemove",
    "canRemove",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    "#8ac355",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    "#e94034",
    "User",
    "deleted",
    "scale2",
    "*Swastika\x20health:\x2020\x20→\x2025",
    "workerAntFire",
    "WQxdVSkKW5VcJq",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "drawWingAndHalo",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    ".video",
    "Missile",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "parts",
    "*Super:\x205-15",
    "Pet\x20Heal",
    "*Snail\x20health:\x2040\x20→\x2045",
    "successful",
    "\x20from\x20",
    "petHeal",
    ".\x20Hac",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    "Added\x20Discord\x20login.",
    "craftResult",
    "keys",
    "ArrowUp",
    "draw",
    "wss://eu1.hornex.pro",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "g\x20on\x20",
    "#853636",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "doLerpEye",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "petalHeavy",
    "stickbug",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "US\x20#2",
    "projAngle",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    "petal",
    ".mobs-btn",
    "worldH",
    "appendChild",
    "nickname",
    "Sandbox",
    "#724c2a",
    ".inventory-rarities",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    ".grid-cb",
    "ladybug",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    "KeyA",
    "starfish",
    "min",
    "healthF",
    "waveEnding",
    ".ultra-buy",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "\x20stroke=\x22",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    "Nerfed\x20Spider\x20Yoba.",
    "percent",
    "Error\x20refreshing\x20ad.",
    "stickbugBody",
    ".absorb-petals-btn",
    "Game",
    "babyAnt",
    "wasDrawn",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    "createObjectURL",
    "select",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "cde9W5NdTq",
    "isDead",
    "username",
    "iClaimUsername",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "?v=",
    "defineProperty",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "#fcdd86",
    "bee",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    "#e0c85c",
    "sunflower",
    "sin",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "spawnOnDie",
    "isPetal",
    "pZWkWOJdLW",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    "https://www.youtube.com/@NeowmHornex",
    "petalDice",
    "Yoba_3",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    "p41E",
    "position",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    "W43cOSoOW4lcKG",
    "7th\x20August\x202023",
    "Username\x20too\x20short!",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "makeFire",
    "projHealth",
    "oProg",
    "petalSalt",
    "petalBanana",
    "rgb(77,\x2082,\x20227)",
    "Pill",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "WPfQmmoXFW",
    "Soldier\x20Ant_1",
    "hsla(0,0%,100%,0.25)",
    "KeyG",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "135249DkEsVO",
    "Spawns",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    "*Bone\x20armor:\x205\x20→\x206",
    "sprite",
    "other",
    "outlineCount",
    "WRGBrCo9W6y",
    "consumeProj",
    "mushroomPath",
    "24th\x20January\x202024",
    "#38c75f",
    "#fbb257",
    "turtleF",
    "Damage",
    "28th\x20August\x202023",
    "mouse",
  ];
  a = function () {
    return Cq;
  };
  return a();
}
