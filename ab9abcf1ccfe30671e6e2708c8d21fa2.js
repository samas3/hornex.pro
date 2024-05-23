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
    }
  }
class HornexHack{
    constructor(){
        this.version = '2.0';
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
        };
        this.configKeys = Object.keys(this.default);
        this.chatFunc = null;
        this.toastFunc = null;
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
                let x = this.player.entity.targetPlayer.nx;
                let y = this.player.entity.targetPlayer.ny;
                if(this.speak) this.speak(`Current coords: ${Math.floor(x / 500)}, ${Math.floor(y / 500)}`);
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
        let div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.bottom = '60px';
        div.style.right = '0';
        div.style.padding = '10px';
        div.style.zIndex = '10000';
        document.body.appendChild(div);
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
        for(let i = 0; i < this.configKeys.length; i++){
            let item = this.configKeys[i];
            this.addChat(`${item}: ${this.isEnabled(item)} (defaults to ${this.default[item]})`, '#ffffff');
        }
    }
    openGUI(){
        let main = document.createElement('div');
        for(let i = 0; i < this.configKeys.length; i++){
            let item = this.configKeys[i];
            let idx = document.createElement('div');
            let txt = document.createElement('span');
            txt.innerHTML = item + (Object.keys(this.bindKeys).includes(item) ? ` (Binded to ${this.bindKeys[item]})` : ' (Not bounded)');
            txt.style.margin = '10px';
            idx.appendChild(txt);
            let cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = this.isEnabled(item);
            var that = this;
            cb.onclick = () => {
                that.toggle(item);
            };
            cb.style.float = 'right';
            idx.appendChild(cb);
            main.appendChild(idx);
        }
        for(let i = 0; i < this.triggerKeys.length; i++){
            let item = this.triggerKeys[i];
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
        for(let i = 0; i < this.configKeys.length; i++){
            let item = this.configKeys[i];
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
        return cmd[0] == '/' && !Object.keys(this.commands).includes(cmd);
    }
    getHelp(){
        this.addChat('List of commands:');
        let lst = Object.keys(this.commands);
        for(let i = 0; i < lst.length; i++){
            this.addChat(`${lst[i]} : ${this.commands[lst[i]]}`, '#ffffff');
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
        for (let i = 0; i < lst[tier].length; i++) {
            let j = lst[tier][i];
            if (type == j['type']) return j['health'];
        }
    }
    onKey(module){
        if(!this.triggerKeys.includes(module)) this.toggle(module);
        else this.triggers[module]();
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
        if(!quitBtn.classList.contains('red')){
            quitBtn.onclick();
        }
    }
    registerMain(){
        this.mainInterval = setInterval(() => {
            let status;
            try{
                status = this.getWave();
            }catch{
                location.reload();
            }
            let server = this.getServer();
            this.setStatus(`${server}: ${status}`);
            var btn = document.getElementsByClassName('btn build-save-btn');
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
                            if(childs[i].className == 'chat-name') name = childs[i].getAttribute('stroke');
                            if(childs[i].className == 'chat-text'){
                                if(childs[i].hasAttribute('stroke')){
                                    content = childs[i].getAttribute('stroke');
                                }else{
                                    let c = childs[i].childNodes;
                                    for(let i = 0; i < c.length - 1; i += 2){
                                        name += c[i].getAttribute('stroke') + ' ';
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
function a() {
  const Cp = [
    ".box",
    "sortGroups",
    "startPreRoll",
    "hideUserCount",
    "prog",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    "Rock_4",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "craft-disable",
    "23rd\x20January\x202024",
    "terms.txt",
    "Can\x27t\x20perform\x20that\x20action.",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "mobId",
    "preventDefault",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "7th\x20October\x202023",
    "respawnTime",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    "Yoba_5",
    "#efc99b",
    "change-font",
    "6th\x20August\x202023",
    "removeT",
    "W6HBdwO0",
    "other",
    "*2%\x20craft\x20success\x20rate.",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    "29th\x20June\x202023",
    "*Cotton\x20health:\x209\x20→\x2010",
    "2-digit",
    "dev",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    "Bee",
    "projSpeed",
    "26th\x20June\x202023",
    "deleted",
    "px)",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "roundRect",
    "Poison",
    "isClown",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    "fire",
    "lightningBounces",
    "deltaY",
    "swapped",
    "New\x20petal:\x20Wig.",
    "arc",
    "#cf7030",
    "absorbPetalEl",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    "hit.p",
    "repeat",
    "targetPlayer",
    "getFloat32",
    "Heavier\x20than\x20your\x20mom.",
    "*Reduced\x20mob\x20count.",
    "\x27s\x20Profile",
    "adplayer",
    "metaData",
    "Failed\x20to\x20load\x20game\x20stats!",
    "Sandbox",
    "*Heavy\x20health:\x20500\x20→\x20600",
    "\x5c$1",
    "zert.pro",
    "ll\x20yo",
    "#a58368",
    "#1ea761",
    "Former\x20student\x20of\x20Yoda.",
    "spiderYoba",
    "*Turtle\x20health:\x20600\x20→\x20900",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "eyeY",
    ".right-align-petals-cb",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "posAngle",
    "updateTime",
    "Poop\x20colored\x20Ladybug.",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "visible",
    "#222222",
    ".lottery-timer",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    "*Peas\x20damage:\x2012\x20→\x2015",
    "lineJoin",
    "Downloaded!",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "been\x20",
    "#b53229",
    "#ffd800",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "shieldRegenPerSecF",
    "gem",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    ".logout-btn",
    "11th\x20July\x202023",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "Fire\x20Damage",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "Ears",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "Dragon_3",
    "#d0bb55",
    "textAlign",
    "released",
    ".lb-btn",
    "drawDragon",
    "d8k3BqDKF8o0WPu",
    "Added\x20level\x20up\x20reward\x20table.",
    "#ffe200",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "web_",
    "isIcon",
    "charAt",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    "#75dd34",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "reduce",
    "/dlSprite",
    "render",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    "Client-side\x20performance\x20improvements.",
    "append",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    "DMCA",
    "childIndex",
    "Missile\x20Damage",
    "shieldHpLosePerSec",
    ".close-btn",
    "now",
    "ANKUAsHKW5LZmq",
    "lightning",
    "textBaseline",
    "isLightsaber",
    "ENTERING!!",
    "#695118",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    "#ce76db",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    "#328379",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "marginBottom",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    "totalPetals",
    "^F[@",
    "text/plain;charset=utf-8;",
    "hsla(0,0%,100%,0.3)",
    "Nigersaurus",
    "hpRegenPerSecF",
    "running...",
    "statue",
    "length",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    ".clown-cb",
    "ShiftRight",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    "></div>",
    "healthIncrease",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    "Mythic",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "petalTurtle",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "#fcfe04",
    "16th\x20July\x202023",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "hsla(0,0%,100%,0.5)",
    "https://stats.hornex.pro/api/userCount",
    "15th\x20June\x202023",
    "armorF",
    "isFakeChat",
    "#dbab2e",
    "contains",
    "Continue",
    ".no-btn",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    "Fire\x20Ant",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "#15cee5",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    "hasGem",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    "Ghost_5",
    "fonts",
    "New\x20mob:\x20Mushroom.",
    ".active",
    "#ada25b",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    "slowDuration",
    "alpha",
    "4th\x20September\x202023",
    ".textbox",
    "RuinedLiberty",
    "consumeProjDamageF",
    "superPlayers",
    "KeyY",
    "regenAfterHp",
    "password",
    "9th\x20August\x202023",
    "&#Uz",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    "*Opening\x20Lottery",
    "playerList",
    "uiName",
    "#d3d14f",
    "petalSunflower",
    "uniqueIndex",
    "reload",
    "hpRegen",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    "web",
    "1841224gIAuLW",
    "body",
    "angleOffset",
    "#bff14c",
    ".circle",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    "expand",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "*Rock\x20health:\x20150\x20→\x20200",
    ".lottery-winner",
    "nerd",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "\x22></div>\x0a\x09\x09\x09",
    "Increases",
    ".discord-btn",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "e=\x22Yo",
    "Beetle\x20Egg",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "Soldier\x20Ant_4",
    "*Snail\x20health:\x2040\x20→\x2045",
    "3336680ZmjFAG",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "<div\x20stroke=\x22",
    "18th\x20July\x202023",
    "#7d893e",
    "\x20-\x20",
    "11th\x20August\x202023",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    "Hnphe",
    "wss://us2.hornex.pro",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    "*Missile\x20damage:\x2050\x20→\x2055",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    "W5OTW6uDWPScW5eZ",
    "cantPerformAction",
    "catch",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "#ffffff",
    "isConsumable",
    "Congratulations!",
    "resize",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "log",
    "WOpcHSkuCtriW7/dJG",
    "Provide\x20a\x20name\x20dummy.",
    "ffa\x20sandbox",
    "userProfile",
    "2nd\x20July\x202023",
    "petalAntEgg",
    "rgb(77,\x2082,\x20227)",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    "*Yoba\x20health:\x20500\x20→\x20350",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    "function",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "makeLadybug",
    "Turtle",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    "cacheRendered",
    "translate(calc(",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    "classList",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "***",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    "crab",
    "updateT",
    "Starfish",
    "<div\x20class=\x22btn\x22>\x0a\x09\x09\x09\x09<span\x20stroke=\x22",
    "hpRegen75PerSecF",
    "powderTime",
    "fire\x20ant",
    "transform",
    "\x20domain=.hornex.pro",
    "keyInvalid",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "Ghost_1",
    "button",
    "#32a852",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "NSlTg",
    "W5T8c2BdUs/cJHBcR8o4uG",
    "Scorpion",
    "#5ef64f",
    "petalChromosome",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    "zvNu",
    "neutral",
    "Copied!",
    "New\x20mob:\x20Sunflower.",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "damageF",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "uiX",
    "DMCA-ed",
    "AS\x20#1",
    ".absorb-rarity-btns",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "rainbow-text",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "select",
    "Stick",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "progressEl",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "points",
    "translate",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "execCommand",
    "tierStr",
    "Statue\x20of\x20RuinedLiberty.",
    "number",
    "show_health",
    "lineCap",
    ".petal.empty",
    "\x0a\x0a\x09\x09\x09",
    "*Snail\x20Health:\x20180\x20→\x20120",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "addGroupNumbers",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "\x20clie",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    "#7dad0c",
    "dontExpand",
    ".data-search-result",
    "Yellow\x20Ladybug",
    "Shield",
    "petalDrop_",
    "*Cotton\x20health:\x208\x20→\x209",
    "#543d37",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "rgba(0,\x200,\x200,\x200.2)",
    "petalArrow",
    "WQpcUmojoSo6",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "setAttribute",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    "LavaWater",
    "low_quality",
    "mouse2",
    "Missile",
    "31st\x20July\x202023",
    "prepend",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "*Arrow\x20damage:\x203\x20→\x204",
    "iWatchAd",
    "*Fire\x20damage:\x209\x20→\x2015",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    ".dialog-content",
    "fovFactor",
    "#ffd363",
    "inventory",
    "despawnTime",
    "KeyS",
    "#4e3f40",
    "Spider\x20Egg",
    "15th\x20August\x202023",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "cos",
    "onmouseup",
    "reloadT",
    "craftResult",
    "show_grid",
    "%;left:",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "%/s",
    "Stinger",
    "backgroundColor",
    "Craft\x20rate\x20change:",
    "sqrt",
    "BrnPE",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    "Added\x20Waveroom:",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    ".player-list\x20.dialog-content",
    "yellowLadybug",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "des",
    "tagName",
    "Super\x20Players",
    "<div\x20class=\x22petal-count\x22></div>",
    "\x22></div>\x20<div\x20style=\x22color:",
    ".privacy-btn",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    "className",
    "Has\x20fungal\x20infection\x20gg",
    "scrollHeight",
    "spawnOnHurt",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    "i\x20make\x20cool\x20videos",
    "Added\x20Lottery.",
    "#735d5f",
    "push",
    "Added\x20maze\x20in\x20Waveroom:",
    "KeyR",
    "Web",
    "pickupRange",
    "26th\x20August\x202023",
    "\x20tiles)",
    "IAL\x20c",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    "#c69a2c",
    "hide-zone-mobs",
    "getAttribute",
    "flowerPoison",
    "KeyL",
    "<div\x20class=\x22btn\x20tier-",
    "projType",
    "14dafFDX",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    "#bb1a34",
    "*Rose\x20heal:\x2013\x20→\x2011",
    "canShowDrops",
    "#709e45",
    "24th\x20July\x202023",
    "rgb(92,\x20116,\x20176)",
    "*Rice\x20damage:\x205\x20→\x204",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    "warn",
    "#33a853",
    ".inventory\x20.inventory-petals",
    "#ff7380",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20class=\x22username-link\x22\x20stroke=\x22",
    "onopen",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    ".super-buy",
    "3YHM",
    "Pollen",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "3m^(",
    "Mob\x20Size\x20Change",
    "rgb(134,\x2031,\x20222)",
    "New\x20mob:\x20Tumbleweed.",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    "New\x20mob:\x20M28.",
    "clipboard",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "pink",
    "Claiming\x20secret\x20skin...",
    "n\x20war",
    "encode",
    "bruh",
    "bone",
    "right_align_petals",
    "admin_pass",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "#b05a3c",
    "strokeRect",
    "userAgent",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "\x22></span>",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    "\x22></div>",
    "*Gas\x20poison:\x2030\x20→\x2040",
    "rgba(0,0,0,0.4)",
    "setUint16",
    ".connecting",
    "outdatedVersion",
    "Heavy",
    "rad)",
    "close",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "\x0a\x09</div>",
    "NHkBqi",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "\x20•\x20",
    "Head",
    "Failed\x20to\x20find\x20region.",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "month",
    "\x20from\x20",
    "Pill\x20affects\x20Arrow\x20now.",
    "isHudPetal",
    "*Snail\x20damage:\x2010\x20→\x2015",
    "ultraPlayers",
    "showItemLabel",
    "mouse0",
    "Sandstorm_5",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    "4\x20yummy\x20poisonous\x20balls.",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "*Super:\x20150+",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "randomUUID",
    "*Heavy\x20damage:\x209\x20→\x2010",
    "rkJNdF",
    "8th\x20July\x202023",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    "numAccounts",
    "centipedeHead",
    "petalSwastika",
    "toFixed",
    "Added\x20Global\x20Leaderboard.",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "hpRegenPerSec",
    "spikePath",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "7XrKUbH",
    "#333333",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    "as_ffa1",
    "3rd\x20August\x202023",
    "6fCH",
    "curePoisonF",
    "https://www.youtube.com/@NeowmHornex",
    "26th\x20January\x202024",
    "us_ffa1",
    "petalLightning",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    "murdered",
    "#38c125",
    "10th\x20July\x202023",
    "Reduced\x20mobile\x20UI\x20scale.",
    "Soldier\x20Ant_6",
    "changeLobby",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    "*Fire\x20health:\x2070\x20→\x2080",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    "rgb(237\x20236\x2061)",
    "#ab7544",
    ".petals.small",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "sizeIncrease",
    ".hide-chat-cb",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "ontouchstart",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "Craft",
    ".petal-rows",
    "ArrowUp",
    "tCkxW5FcNmkQ",
    "\x20was\x20",
    "elongation",
    "#db4437",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "release",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "WP4dWPa7qCklWPtcLq",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "Kills\x20Needed",
    "#854608",
    "getElementById",
    ".video",
    "webSize",
    "PedoX",
    "25th\x20August\x202023",
    "24th\x20January\x202024",
    "27th\x20February\x202024",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "iWithdrawPetal",
    "Shell",
    "petals!",
    "12th\x20July\x202023",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "*Peas\x20damage:\x2010\x20→\x2012",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "fireTime",
    "lastElementChild",
    ".builds-btn",
    "absolute",
    ".absorb-btn\x20.tooltip\x20span",
    "Snail",
    "add",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    "wss://as2.hornex.pro",
    "User\x20not\x20found.",
    "#d9511f",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    "1248195uDheLD",
    "Heart",
    "Level\x20",
    ".username-input",
    "petalRice",
    "toLow",
    "M28",
    "#cfc295",
    "WRGBrCo9W6y",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    "clientHeight",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "#a82a00",
    "shadowBlur",
    "killsNeeded",
    "hornex.pro",
    "application/json",
    "soldierAnt",
    "Nerfs:",
    "setUserCount",
    "petalStickbug",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "Rock_1",
    "petalEgg",
    "projDamage",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "vendor",
    "translate(-50%,",
    "2490246bTTeff",
    "Yin\x20Yang",
    ".dismiss-btn",
    "Much\x20heavier\x20than\x20your\x20mom.",
    "hostn",
    ".scoreboard-title",
    "Pet\x20Size\x20Increase",
    "iCheckKey",
    "Fixed\x20Rice.",
    "Mob\x20",
    "Checking\x20username\x20availability...",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "show_helper",
    "Yoba_2",
    "Soldier\x20Ant_2",
    ".show-population-cb",
    "onmousemove",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    "petSizeChangeFactor",
    "#754a8f",
    ".debug-cb",
    "tals.",
    "iAngle",
    "petalSand",
    "dur",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "labelSuffix",
    "fireDamage",
    "#222",
    "requestAnimationFrame",
    "<div\x20",
    "rando",
    "onwheel",
    "lighter",
    "Username\x20is\x20already\x20taken.",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    "centipedeBody",
    "Need\x20to\x20be\x20Lvl\x20",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "KeyK",
    "setUint8",
    "users",
    "isPassiveAggressive",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "avatar",
    "1rrAouN",
    "petalNitro",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "col",
    "startEl",
    "*Hyper:\x20240",
    "complete",
    ".chat-content",
    "*Powder\x20damage:\x2015\x20→\x2020",
    "No\x20username\x20provided.",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "layin",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "#39b54a",
    "totalChatSent",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    ".find-user-input",
    "\x20FPS\x20/\x20",
    "Fixed\x20another\x20craft\x20exploit.",
    "W77cISkNWONdQa",
    "#c1a37d",
    "Breed\x20Range",
    "yellow",
    "#eb4755",
    ".\x22></span></div>",
    "├─\x20",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    "2nd\x20August\x202023",
    "strokeText",
    "onchange",
    "adplayer-not-found",
    "<div\x20class=\x22chat-text\x22>",
    "queen",
    "drawShell",
    "210ZoZRjI",
    "#4eae26",
    "next",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "enable_kb_movement",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    ".login-btn",
    "10QIdaPR",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "Honey\x20Range",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    "petalBasic",
    "fillRect",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "passiveBoost",
    "Fire",
    "Extra\x20Vision",
    "\x20petals",
    "Stick\x20does\x20not\x20expand\x20now.",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "flors",
    "#ebeb34",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    "Dragon_2",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    "<div\x20class=\x22data-top-area\x22>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Current\x20Page:\x22></span>\x0a\x09\x09\x09\x09<select\x20tabindex=\x22-1\x22></select>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Search:\x22></span>\x0a\x09\x09\x09\x09<input\x20class=\x22textbox\x20data-search\x22\x20type=\x22text\x22\x20placeholder=\x22Enter\x20value...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<div\x20class=\x22data-search-result\x22\x20style=\x22display:none;\x22></div>\x0a\x09\x09</div>",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    "loading",
    "#503402",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    "#d54324",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2048\x2048\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x20\x20<title>data-source-solid</title>\x0a\x20\x20<g\x20id=\x22Layer_2\x22\x20data-name=\x22Layer\x202\x22>\x0a\x20\x20\x20\x20<g\x20id=\x22invisible_box\x22\x20data-name=\x22invisible\x20box\x22>\x0a\x20\x20\x20\x20\x20\x20<rect\x20width=\x2248\x22\x20height=\x2248\x22\x20fill=\x22none\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20\x20\x20<g\x20id=\x22icons_Q2\x22\x20data-name=\x22icons\x20Q2\x22>\x0a\x20\x20\x20\x20\x20\x20<path\x20d=\x22M46,9c0-6.8-19.8-7-22-7S2,2.2,2,9v7c0,.3,1.1,1.8,5.2,3.4h.3a40.3,40.3,0,0,0,8.6,2A65.6,65.6,0,0,0,24,22a65.6,65.6,0,0,0,7.9-.5,40.3,40.3,0,0,0,8.6-2h.3C44.9,17.8,46,16.3,46,16V9.3h0ZM2,31.3V39c0,6.8,19.8,7,22,7s22-.2,22-7V31.3C41.4,34.1,33.3,36,24,36S6.6,34.1,2,31.3Zm43.7-9.8a22.5,22.5,0,0,1-4.9,2.1A54.8,54.8,0,0,1,24,26,54.8,54.8,0,0,1,7.2,23.6a22.5,22.5,0,0,1-4.9-2.1L2,21.3V26c0,.3,1.2,1.9,5.5,3.5A50.2,50.2,0,0,0,24,32a50.2,50.2,0,0,0,16.5-2.5C44.8,27.9,46,26.3,46,26V21.3Z\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20</g>\x0a</svg>",
    "show_debug_info",
    "ICIAL",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    "*Damage:\x204\x20→\x206",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "petalRockEgg",
    "Lvl\x20",
    "Added\x20Shop.",
    "queenAnt",
    "result",
    "Dice",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "https://www.instagram.com/zertalious",
    "Increased\x20Ultra\x20key\x20price.",
    "#fbdf26",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "fixAngle",
    "#ebda8d",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "doLerpEye",
    "13th\x20July\x202023",
    "putImageData",
    "heart",
    "healthF",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    ".yes-btn",
    "oPlayerX",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "u\x20are",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    "#775d3e",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "open",
    "forEach",
    "stats",
    ".stats\x20.dialog-content",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    "Slowness\x20Duration",
    "#4343a4",
    "Evil\x20Centipede",
    "#c9b46e",
    "Importing\x20data\x20file:\x20",
    "#924614",
    "mobPetaler",
    "Shield\x20Reuse\x20Cooldown",
    "totalAccounts",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    "0@x9",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x20no-hide\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "Jellyfish",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    "Orbit\x20Twirl",
    "4th\x20July\x202023",
    "\x0a5th\x20May\x202024\x0aHeavy\x20now\x20slows\x20down\x20your\x20petal\x20orbit\x20speed.\x20More\x20slowness\x20for\x20higher\x20rarity.\x20\x0aCotton\x20doesn\x27t\x20expand\x20like\x20Rose\x20when\x20you\x20are\x20angry.\x0aPowder\x20now\x20adds\x20turbulence\x20to\x20your\x20petals\x20when\x20you\x20are\x20angry.\x0aFixed\x20more\x20player\x20dupe\x20bugs.\x0a",
    "scale",
    "nigersaurus",
    "2357",
    "#368316",
    "chain",
    "centipedeBodyPoison",
    "innerHeight",
    "Disconnected.",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "https://auth.hornex.pro/discord",
    "https://stats.hornex.pro/",
    "z8kgrX3dSq",
    "Added\x20banner\x20ads.",
    "Fossil",
    "keydown",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "Hornet_2",
    "#2da14d",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "duration",
    "petalTaco",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    "Spawn\x20zone\x20changes:",
    "Spider_4",
    "tier",
    "sad",
    "Sand",
    "YOBA",
    "poisonDamage",
    "erCas",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    ".player-count",
    "affectHealDur",
    "petalSuspill",
    ".scores",
    "onStart",
    "remove",
    "background",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "KeyW",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    ".petals",
    "Increases\x20flower\x27s\x20health\x20power.",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "Powder",
    "style=\x22color:",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    "petalCactus",
    "addCount",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "getUint32",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "Fleepoint",
    "*Health:\x20100\x20→\x20120",
    "#ce79a2",
    "#fff0b8",
    "drawSnailShell",
    "Honey\x20factory.",
    "7th\x20August\x202023",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "Super",
    "Yoba\x20Egg",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "totalGamesPlayed",
    "Shrinker",
    "Extra\x20Range",
    "consumeProj",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "setCount",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "bolder\x2025px\x20",
    "choked",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "pathSize",
    "inclu",
    "#000",
    "#554213",
    "#a760b1",
    "focus",
    "createImageData",
    "Epic",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "#9fab2d",
    "filter",
    "flipDir",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "icBdNmoEta",
    "value",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    "New\x20petal:\x20Sponge",
    "#962921",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    "toLocaleString",
    "WRyiwZv5x3eIdtzgdgC",
    "Flower\x20Health",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "Buffs:",
    "#111",
    "settings",
    "\x20Ultra",
    "green",
    ".settings",
    "sendBadMsg",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    "Buffed\x20Lightsaber:",
    ";position:absolute;top:",
    "petalMissile",
    "curve",
    "Petal\x20",
    ".grid\x20.title",
    "Yoba_4",
    "#5ec13a",
    "rgba(0,0,0,0.2)",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    ".build-save-btn",
    "_blank",
    "startsWith",
    "totalTimePlayed",
    "#b0c0ff",
    "bqpdUNe",
    "petalWeb",
    "onMove",
    "#5849f5",
    "Dragon",
    "New\x20mob:\x20Beehive.",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    "hide-scoreboard",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    "rgba(0,0,0,0.08)",
    "consumeProjHealth",
    "Nerfed\x20Ant\x20Holes:",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "rectAscend",
    ".lottery-rarities",
    "wss://",
    "...",
    "Unusual",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    "arrested\x20for\x20plagerism",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    "userCount",
    ".low-quality-cb",
    "qmklWO4",
    "*Rock\x20health:\x2050\x20→\x2060",
    "devicePixelRatio",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    "MOVE\x20AWAY!!",
    "</div><div\x20class=\x22log-line\x22></div>",
    "isArray",
    "clientX",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "Sandstorm_4",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "#ccad00",
    "#82b11e",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    "petalShrinker",
    "KICKED!",
    "Petals",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    "click",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "Rare",
    "Fussy\x20Sucker",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "kers\x20",
    "Beetle_2",
    "show_bg_grid",
    "Banana",
    "copyright\x20striked",
    "ount\x20",
    "Could\x20not\x20claim\x20secret\x20skin.",
    "changelog",
    "\x0a17th\x20May\x202024\x0aMore\x20game\x20stats\x20are\x20shown\x20now:\x0a*Total\x20Time\x20Played\x0a*Total\x20Games\x20Played\x0a*Total\x20Kills\x0a*Total\x20Chat\x20Sent\x0a*Total\x20Accounts\x0aNumpad\x20keys\x20can\x20also\x20be\x20used\x20to\x20swap\x20petals\x20now.\x0aPress\x20K\x20to\x20toggle\x20keyboard\x20controls.\x0a",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "iLeaveGame",
    "More\x20wave\x20changes:",
    "\x22></span>\x0a\x09\x09\x09</div>",
    "Preroll\x20state:\x20",
    "#5b4d3c",
    "hurtT",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    "#5ab6ab",
    "24th\x20August\x202023",
    "Bounces",
    "WRRdT8kPWO7cMG",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    "getUint8",
    "\x22>Page\x20#",
    "\x20radians",
    ".stats\x20.dialog-header\x20span",
    "#21c4b9",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    "saved_builds",
    "Very\x20sussy\x20data!",
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "are\x20p",
    "#af6656",
    "Yoba_6",
    "waveEnding",
    "miter",
    "{background-color:",
    "cde9W5NdTq",
    "spawnT",
    "petalMushroom",
    "%;\x22\x20stroke=\x22",
    "hasAntenna",
    "rgb(222,111,44)",
    "#4f412e",
    "#888",
    "KeyF",
    "<div>",
    "Dandelion",
    "wss://us1.hornex.pro",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "Beetle",
    "Fire\x20Ant\x20Hole",
    "Error\x20refreshing\x20ad.",
    "doRemove",
    "*Removed\x20Ultra\x20wave.",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "Honey\x20Damage",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "#999",
    "Account\x20import/export\x20UI\x20redesigned.",
    "petalPincer",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "1998256OxsvrH",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    "tooltipDown",
    "undefined",
    "petalGas",
    "server",
    "values",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    "(81*",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "KeyM",
    "goofy\x20ahh\x20insect\x20robbery",
    "OPEN",
    "renderOverEverything",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "12th\x20August\x202023",
    "\x22></div><div\x20class=\x22log-content\x22>",
    "<div\x20style=\x22color:\x20",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "2090768fiNzSa",
    "Centipede",
    "#a33b15",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "petalStinger",
    "glbData",
    "22nd\x20July\x202023",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "\x0a4th\x20May\x202024\x0aFixed\x20a\x20player\x20dupe\x20bug.\x20\x0aBalances:\x0a*Taco\x20healing:\x209\x20→\x2010\x0a*Sunflower\x20shield:\x201\x20→\x202.5\x0a*Shell\x20shield:\x208\x20→\x2012\x0a*Buffed\x20Yoba\x20Egg\x20by\x2050%\x0a",
    "redHealthTimer",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    "g\x20on\x20",
    ".timer",
    "#f009e5",
    "US\x20#1",
    "sort",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "hpAlpha",
    "petalStr",
    "gridColumn",
    "discord\x20err:",
    "size",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "#f55",
    "toString",
    "#654a19",
    ".changelog\x20.dialog-content",
    "cantChat",
    "#406150",
    "rgba(0,0,0,0.3)",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "Passively\x20regenerates\x20your\x20health.",
    "isSleeping",
    "deg)",
    ".collected",
    "\x20HP",
    ".zone-name",
    "keyCode",
    "antHoleFire",
    "Changes\x20to\x20anti-lag\x20system:",
    ".death-info",
    "sortGroupItems",
    "http://localhost:8001/discord",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    "display",
    "consumeProjDamage",
    "petalRose",
    "petalRock",
    "hide-all",
    "show_clown",
    "Added\x20Leave\x20Game\x20button.",
    "isLightning",
    "#555555",
    "connectionIdle",
    "health",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "TC0B",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "%\x20success\x20rate",
    "#ffd941",
    "onload",
    "weedSeed",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    ".ultra-buy",
    "abeQW7FdIW",
    "privacy.txt",
    "#3f1803",
    "clientY",
    "e8oQW7VdPKa",
    "furry",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "drawChats",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "*Ultra:\x20120",
    ".spawn-zones",
    "*Bone\x20armor:\x204\x20→\x205",
    "<div\x20class=\x22data-search-item\x22>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22#",
    "test",
    "getTitleEl",
    ".zone-mobs",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "Increases\x20your\x20vision.",
    "div",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "#735b49",
    "Dragon_5",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    "tile_",
    "22nd\x20January\x202024",
    "#416d1e",
    "snail",
    "total",
    "1st\x20April\x202024",
    "mousedown",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "*Recuded\x20mob\x20count.",
    ")\x20rotate(",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    "\x22></span></div>",
    "parentNode",
    "isTanky",
    "Lightsaber",
    "petalSword",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    "*Swastika\x20health:\x2030\x20→\x2035",
    "petalPoo",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "25th\x20July\x202023",
    "hsl(60,60%,30%)",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    "iJoin",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    "lient",
    "2872ljWbUa",
    "u\x20hav",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    "\x22></span>\x20",
    "and\x20a",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "Tumbleweed",
    "ArrowRight",
    "anti_spam",
    ".minimap-dot",
    ".ad-blocker",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    "rgb(237\x2061\x20234)",
    "Elongation",
    "#333",
    "wss://eu2.hornex.pro",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "#8f5db0",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    "round",
    "doShow",
    "EU\x20#2",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "d.\x20Pr",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    "sponge",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "entRot",
    "#b28b29",
    ".nickname",
    "#bebe2a",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    "successful",
    "WOziW7b9bq",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "Ant\x20Hole",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "spin",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "Sandstorm_6",
    "#555",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "timePlayed",
    "petalExpander",
    "petalBone",
    "#b52d00",
    ".menu",
    "\x0a13th\x20May\x202024\x0aFixed\x20a\x20bug\x20that\x20didn\x27t\x20let\x20flowers\x20enter\x20portals.\x0aBalances:\x0a*Sword\x20damage:\x2017\x20→\x2021\x0a*Yin\x20yang\x20damage:\x2010\x20→\x2020\x0a*Yin\x20yang\x20reload:\x202s\x20→\x201.5s\x0a",
    "reset",
    "barEl",
    "bezierCurveTo",
    "#fc9840",
    "desc",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    ".hitbox-cb",
    "user",
    "(?:^|;\x5cs*)",
    "petalPollen",
    "*Super:\x20180",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "xgMol",
    "26th\x20September\x202023",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "#bbbbbb",
    ".checkbox",
    "onmessage",
    "bar",
    "Nerfed\x20Spider\x20Yoba.",
    "\x20$1",
    "Faster",
    "#353331",
    "hide_chat",
    "healthIncreaseF",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    "isStatic",
    "username",
    "https",
    "petalLightsaber",
    "#e6a44d",
    "opera",
    "Honey",
    "Dragon\x20Egg",
    "Ants\x20redesign.",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    "Game\x20released\x20to\x20public!",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "name",
    "asdfadsf",
    "#fff",
    "Antennae",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    "ontouchend",
    "hsl(60,60%,60%)",
    "B4@J",
    "spider",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
    "<div\x20class=\x22chat-item\x22></div>",
    "isBae",
    "sizeIncreaseF",
    "A\x20default\x20petal.",
    "spotPath_",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "dmca\x20it\x20m28!",
    "\x22\x20stroke=\x22(",
    "Invalid\x20account!",
    "ion",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "\x22\x20style=\x22color:",
    "eu_ffa2",
    "reason:\x20",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    "*Halo\x20now\x20stacks.",
    "*Unsual:\x2025\x20→\x2010",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "shield",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "Light",
    ".export-btn",
    "[Y]\x20Show\x20Health:\x20",
    "honeyDmg",
    "en-US",
    ".fixed-name-cb",
    "wrecked",
    "rock",
    "parse",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "mobSizeChange",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "statuePlayer",
    ";\x22\x20stroke=\x22",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "#be342a",
    "d\x20abs",
    "Duration",
    "#69371d",
    "LEAVE\x20ZONE!!",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    "petalFire",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    "ellipse",
    "isInventoryPetal",
    "href",
    "canRender",
    ".mob-gallery",
    "air",
    "*Turtle\x20health\x20500\x20→\x20600",
    "m28",
    "petalStick",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "beehive",
    "poisonDamageF",
    "projAffectHealDur",
    "spiderLeg",
    "*Gas\x20health:\x20140\x20→\x20250",
    "petalBubble",
    "*Rock\x20health:\x2045\x20→\x2050",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    "rgba(0,0,0,0.1)",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    ".server-area",
    "assassinated",
    "kicked",
    ".stat-value",
    ".id-group",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    "#323032",
    "21st\x20July\x202023",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    "static",
    "19th\x20July\x202023",
    "score",
    "WPJcKmoVc8o/",
    "6th\x20July\x202023",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "Desert",
    "10th\x20August\x202023",
    "<div\x20class=\x22petal\x20tier-",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    "*Light\x20damage:\x2013\x20→\x2012",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "\x0a16th\x20May\x202024\x0aAdded\x20Game\x20Statistics:\x0a*Super\x20Players\x0a*Hyper\x20Players\x0a*Ultra\x20Players\x20(with\x20more\x20than\x20200\x20ultra\x20petals)\x0a*All\x20Petals\x0a*Data\x20is\x20updated\x20every\x20hour.\x0a*You\x20can\x20search\x20game\x20stats\x20by\x20username.\x0a",
    "mushroom",
    "Stickbug",
    ".build-petals",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    ".absorb",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    "offsetHeight",
    "onclose",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    "files",
    "attachPetal",
    "\x20Pym\x20Particle.",
    "#444444",
    "runSpeed",
    ".reload-btn",
    "*Bone\x20armor:\x209\x20→\x2010",
    "finalMsg",
    "version",
    "?v=",
    "bqpdSW",
    "angry",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "rgb(222,\x2031,\x2031)",
    ".credits",
    "Sponge",
    "shootLightning",
    "isConnected",
    "WQ7dTmk3W6FcIG",
    "nice\x20stolen\x20florr\x20assets",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "fixed_player_health_size",
    "find",
    "*Gas\x20health:\x20250\x20→\x20200",
    "projAngle",
    "worldH",
    "hasSwastika",
    "#A8A7A4",
    "worldW",
    "wing",
    ".fixed-mob-health-cb",
    "splice",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "sadT",
    "Cactus",
    "makeSponge",
    "displayData",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    "countAngleOffset",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "ears",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "keyAlreadyUsed",
    "0\x200",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "#000000",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    "Added\x20Discord\x20login.",
    "Sunflower",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    "14th\x20August\x202023",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "isPet",
    "Wave\x20Ending...",
    "Poisonous\x20gas.",
    "extraRangeTiers",
    "#dddddd",
    "Server-side\x20optimizations.",
    ".lottery\x20.dialog-content",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    "Numpad",
    "Spawns",
    "Rock",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    "Nitro\x20Boost",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "bone_outline",
    "Guardian",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    "rgb(31,\x20219,\x20222)",
    "agroRangeDec",
    "Redesigned\x20some\x20mobs.",
    "textarea",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    "*Cotton\x20health:\x207\x20→\x208",
    "3WRI",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "13th\x20August\x202023",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "blur(10px)",
    "width",
    "Breed\x20Strength",
    "Passively\x20regenerates\x20shield.",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    ".tier-",
    "shlong",
    "Skull",
    ".lottery-btn",
    ".inventory-rarities",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "waveStarting",
    "off",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    "Waveroom",
    "\x20online)",
    "3L$0",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "string",
    "#6265eb",
    "=([^;]*)",
    "antennae",
    "toLowerCase",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    "Sword",
    "#b58500",
    "isSpecialWave",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    "petals",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "Unknown\x20message\x20id:\x20",
    "1st\x20July\x202023",
    "101636gyvtEF",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "nig",
    "UNOFF",
    "setUint32",
    "els",
    "consumeTime",
    "spinSpeed",
    "Passive\x20Shield",
    "hornex-pro_970x250",
    "*Fire\x20health:\x2080\x20→\x20120",
    "petalDmca",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "WPPnavtdUq",
    "KeyC",
    ";\x20-o-background-position:",
    "origin",
    "\x20downloaded!",
    "nLrqsbisiv0SrmoD",
    "*Legendary:\x20125\x20→\x20100",
    "\x20players\x20•\x20",
    "start",
    "WARNING!",
    "locat",
    "error",
    "Lightning\x20damage:\x2012\x20→\x208",
    "%\x20!important",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "6th\x20October\x202023",
    "*Cotton\x20health:\x2010\x20→\x2012",
    "makeBallAntenna",
    "substr",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    "opacity",
    "vFKOVD",
    "#38ecd9",
    ".shop",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "Username\x20too\x20short!",
    "17th\x20June\x202023",
    "advanced\x20to\x20number\x20",
    "fontSize",
    "uiHealth",
    ".continue-btn",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    "createObjectURL",
    "mobKilled",
    "angle",
    "*Ultra:\x201-5",
    "loggedIn",
    "lightningBouncesTiers",
    "isPoison",
    "i\x20need\x20999\x20billion\x20subs",
    "readyState",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "globalAlpha",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "invalid",
    "#709d45",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    "Extremely\x20slow\x20sussy\x20mob.",
    "*Snail\x20damage:\x2015\x20→\x2020",
    "#8d9acc",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "Press\x20G\x20to\x20toggle\x20grid.",
    "bubble",
    "targetEl",
    "cDHZ",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "Luxurious\x20mansion\x20of\x20ants.",
    "#ff94c9",
    "hsl(60,60%,",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "title",
    "Balancing:",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "Summons\x20the\x20power\x20of\x20wind.",
    "Yourself",
    "pet",
    "krBw",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    "30th\x20June\x202023",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    "Poison\x20Reduction",
    "petalHoney",
    "join",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    "It\x20likes\x20to\x20dance.",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    "toDataURL",
    "Spider_5",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "Avacado",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "#a2eb62",
    "719574lHbJUW",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    ".pro",
    "gambleList",
    "extraSpeedTemp",
    "unset",
    "color",
    ".damage-cb",
    "Gem",
    "<div\x20class=\x22spinner\x22></div>",
    ".killer",
    ".game-stats-btn",
    "#7af54c",
    "WP/dQbddHH0",
    ".tv-next",
    "rgb(255,\x2043,\x20117)",
    "bee",
    "atan2",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "Cotton",
    "stickbug",
    "\x20petals\x22></div>",
    "20th\x20June\x202023",
    "oiynC",
    "isAggressive",
    "Health\x20Depletion",
    "sprite",
    "Hyper",
    "uiAngle",
    "iScore",
    ".hyper-buy",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "Kicked!\x20(reason:\x20",
    "percent",
    "*Taco\x20healing:\x208\x20→\x209",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "gcldSq",
    "baseSize",
    "n\x20an\x20",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    "Passive\x20Heal",
    "keys",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "Spider_2",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "wss://eu1.hornex.pro",
    ".inventory-btn",
    "data",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    "petRoamFactor",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "Minor\x20physics\x20change.",
    "kbps",
    "iBreedTimer",
    "Lobby\x20Closing...",
    "Basic",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    "W7dcP8k2W7ZcLxtcHv0",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    "Soldier\x20Ant",
    "mushroomPath",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "url(",
    "scale(",
    "writeText",
    "Reflected\x20Missile\x20Damage",
    "unknown",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    "253906KWTZJW",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "consumeProjHealthF",
    "Third\x20Eye",
    "nameEl",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Saved\x20Build\x20#",
    "picked",
    "petalSpiderEgg",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "23rd\x20July\x202023",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "8th\x20August\x202023",
    "renderBelowEverything",
    "petalDragonEgg",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    "nHealth",
    "Hornet_1",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "12th\x20November\x202023",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    ".switch-btn",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    "petalBanana",
    "iGamble",
    "Hornet_6",
    "workerAnt",
    "nt\x20an",
    "Fixed\x20another\x20crafting\x20exploit.",
    "e\x20bee",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "animationDirection",
    "#e05748",
    ";-webkit-background-position:\x20",
    "#fdda40",
    "rgba(0,0,0,0.15)",
    "isBoomerang",
    "isSupporter",
    "https://discord.gg/zZsUUg8rbu",
    ".sad-btn",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    "scale2",
    "#a44343",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    ".gamble-petals-btn",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "Leave",
    ".lottery\x20.inventory-petals",
    "local",
    "hsla(0,0%,100%,0.15)",
    ".mob-gallery\x20.dialog-content",
    "*Peas\x20damage:\x2015\x20→\x2020",
    ".stats",
    ".absorb\x20.dialog-content",
    "petalDice",
    "fake",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    "#76ad45",
    "Statue",
    ".grid",
    "bush",
    "innerHTML",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "maxLength",
    "bolder\x20",
    "ned.\x22",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    "padStart",
    "#a2dd26",
    "Soldier\x20Ant_5",
    "#34f6ff",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    ".download-btn",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    "rgb(219\x20130\x2041)",
    "getBigUint64",
    "localStorage\x20denied.",
    "Petal\x20Weight",
    ".watch-ad",
    "3rd\x20July\x202023",
    "WRbjb8oX",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "hornex",
    "#eeeeee",
    "class=\x22chat-cap\x22",
    "eyeX",
    "damage",
    "deg)\x20scale(",
    "/dlMob",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "projSize",
    "createPattern",
    "Boomerang.",
    ".absorb-petals-btn",
    "active",
    "Dragon_6",
    "hsla(0,0%,100%,0.25)",
    "petDamageFactor",
    "babyAntFire",
    "\x27s\x20profile...",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    "#d43a47",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    ".shop-overlay",
    "j[zf",
    "<div\x20stroke=\x22Last\x20Updated:\x2010s\x20ago\x22></div>",
    "Spider\x20Cave",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    "&response_type=code&scope=identify&state=",
    "clientWidth",
    "Wave\x20",
    "moveFactor",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    "petalLeaf",
    "Breaths\x20fire.",
    "\x22></span>\x20<span\x20stroke=\x22•\x20",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    "Mob\x20Agro\x20Range",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    ".craft-rate",
    "Fixed\x20number\x20rounding\x20issue.",
    "Heal\x20Affect\x20Duration",
    "Password\x20downloaded!",
    "KeyG",
    "updateProg",
    "petalSalt",
    "hyperPlayers",
    "<div\x20class=\x22petal-container\x22></div>",
    "#79211b",
    "player",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    ".total-accounts",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    "Comes\x20to\x20avenge\x20mobs.",
    "Some\x20anti\x20lag\x20measures:",
    "gameStats.json",
    "Spider_3",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    "updatePos",
    "Mushroom",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "isRectHitbox",
    "*Peas\x20health:\x2020\x20→\x2025",
    ".terms-btn",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "projPoisonDamage",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    "dragon",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "day",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "16th\x20June\x202023",
    "purple",
    "Soil",
    "teal\x20",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "<div\x20class=\x22petal-icon\x22\x20",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "Invalid\x20username.",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "#8a6b1f",
    "Last\x20Updated:\x20",
    "petSizeIncrease",
    "Beetle_1",
    "Dragon\x20Nest",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "main",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    "%</option>",
    "nShield",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    "isShiny",
    "drawImage",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    "hsla(0,0%,100%,0.4)",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    ".xp",
    "fillStyle",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "GBip",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "\x20rad/s",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "totalKills",
    "Antidote",
    "insertBefore",
    "assualted",
    "\x20!important;}",
    "setPos",
    "appendChild",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "Ghost_7",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    "28th\x20December\x202023",
    "isSwastika",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "<div\x20class=\x22chat-text\x22></div>",
    "#e94034",
    "#aaaaaa",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "compression\x20version\x20not\x20supported:\x20",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "petal",
    "iPing",
    "petalSnail",
    "removeChild",
    "petalCoffee",
    "petalIris",
    ".time-alive",
    "#c76cd1",
    "Account\x20imported!",
    ".max-wave",
    "builds",
    "STOP!",
    ".ui-scale\x20select",
    "Username\x20too\x20big!",
    "*Arrow\x20health:\x20180\x20→\x20220",
    "*Iris\x20poison:\x2045\x20→\x2050",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    ".clown",
    "kWicW5FdMW",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    "Pet\x20Heal",
    "KeyD",
    "poisonT",
    "desktop",
    "Body",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    "iReqGambleList",
    "\x20pxls)\x20/\x20",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "canSkipRen",
    "Wave\x20Starting...",
    "Dragon_1",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    "W7/cOmkwW4lcU3dcHKS",
    "finally",
    "orbitRange",
    ".expand-btn",
    "US\x20#2",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    "pedox",
    "Pacman",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "*Arrow\x20damage:\x204\x20→\x205",
    ".changelog-btn",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    "cEca",
    "Buffed\x20Gem.",
    "WRS8bSkQW4RcSLDU",
    "nickname",
    "*Hyper:\x202%\x20→\x201%",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    ".petals-picked",
    "target",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    "[G]\x20Show\x20Grid:\x20",
    "hoq5",
    "projHealthF",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "queenAntFire",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    ".global-user-count",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "mobGallery",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    "Loaded\x20Build\x20#",
    "55078DZMiSD",
    "hasHalo",
    "shieldReload",
    "\x22></span>\x0a\x09</div>",
    "have\x20",
    "Common",
    "deadT",
    "Re-added\x20Waves.",
    "ArrowLeft",
    ".settings-btn",
    "Added\x201\x20AS\x20lobby.",
    "Hornet_3",
    ".anti-spam-cb",
    "querySelectorAll",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "#ff4f4f",
    "9th\x20July\x202023",
    "petalYobaEgg",
    "VLa2",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    "misReflectDmgFactor",
    "23rd\x20June\x202023",
    ".angry-btn",
    "turtleF",
    "nSkOW4GRtW",
    "\x20petals\x22></div>\x0a\x09\x09\x09\x09\x09</div>",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "copy",
    "killed",
    "#8ac255",
    "Halo",
    "ondrop",
    ".play-btn",
    "1st\x20August\x202023",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "progress",
    "#a52a2a",
    "Connected!",
    "KCsdZ",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "9iYdxUh",
    "#f7904b",
    "setTargetByEvent",
    "#b0473b",
    "ghost",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    "Failed\x20to\x20get\x20userCount!",
    "hasAbsorbers",
    "seed",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    "Rock\x20Egg",
    "blur",
    "lightblue",
    "shiftKey",
    ".main",
    "Take\x20Down\x20Time",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "bsorb",
    "altKey",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    "occupySlot",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    "*Reduced\x20HP\x20depletion.",
    "sunflower",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "EU\x20#1",
    "\x20stroke=\x22",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "Zert",
    "closePath",
    "15807WcQReK",
    "%nick%",
    "joinedGame",
    "New\x20mob:\x20Spider\x20Cave.",
    "affectMobHealDur",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "unnamed",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    ".absorb-btn",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    "msgpack",
    "beaten\x20to\x20death",
    "backgroundImage",
    "change_font",
    "5th\x20August\x202023",
    "*Rare:\x2050\x20→\x2035",
    "2772301LQYLdH",
    ".level-progress",
    "Decreases",
    "position",
    ".data-search",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    "<div><span\x20stroke=\x22",
    "Added\x20video\x20ad.",
    "min",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    "WP4hW755jCokWRdcKchdT3ui",
    "Leaf",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "<div\x20class=\x22slot\x22></div>",
    "petalSponge",
    ".tooltips",
    "cmk/auqmq8o8WOngW79c",
    "It\x20burns.",
    "getRandomValues",
    "iChat",
    "drawIcon",
    "Gives\x20you\x20a\x20shield.",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    "quadraticCurveTo",
    "hsl(110,100%,10%)",
    "fillText",
    "as_ffa2",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    "c)H[",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "iReqUserProfile",
    "#ff3333",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    "KeyX",
    "Cement",
    "Extra\x20Pickup\x20Range",
    "isTrusted",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "<style>\x0a\x09\x09",
    "\x20Blue",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    "Arrow",
    "\x20You\x20",
    "#c8a826",
    ".find-user-btn",
    ".debug-info",
    "petalMagnet",
    "27th\x20July\x202023",
    "Goofy\x20little\x20wanderer.",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    ".change-font-cb",
    "span",
    "\x20ctxs\x20(",
    "\x20stea",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "rnex.",
    "wig",
    "json",
    ".mobs-btn",
    "Getting\x20",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "no\x20sub,\x20no\x20gg",
    "New\x20setting:\x20UI\x20Scale.",
    "ur\x20pe",
    "waveShowTimer",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "http://localhost:6767/",
    "#ff7892",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "KeyU",
    "Beetle_4",
    "Neowm",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    ".key-input",
    "petalWing",
    "1st\x20February\x202024",
    "Spider_6",
    "deadPreDraw",
    ":scope\x20>\x20.petal",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "slice",
    "uiCountGap",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "16th\x20September\x202023",
    ".claimer",
    "Wing",
    "player_id",
    "iClaimUsername",
    "oHealth",
    "bg-rainbow",
    "thirdEye",
    "Crab\x20redesign.",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "activeElement",
    ".claim-btn",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "<option\x20value=\x22",
    "📜\x20",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "18th\x20September\x202023",
    "loginFailed",
    "<div>\x0a\x09\x09<span\x20stroke=\x22",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "%\x20-\x200.8em*",
    "cactus",
    "webSizeTiers",
    "petalLight",
    "Ghost_4",
    "hasEye",
    "outlineCount",
    "px\x20",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "useTimeTiers",
    "/dlPetal",
    "show",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "guardian",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    "W43cOSoOW4lcKG",
    "WP3dRYddTJC",
    "Fixed\x20duplicate\x20drops.",
    "Cotton\x20bush.",
    "\x20ago",
    "uiY",
    "rgb(",
    "Worker\x20Ant",
    "2nd\x20October\x202023",
    "val",
    "#393cb3",
    "Scorpion\x20redesign.",
    "Ant\x20Fire",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "petalShell",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    "accountId",
    "hypot",
    "soldierAntFire",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    "135249DkEsVO",
    "x.pro",
    ".inventory-petals",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    "#882200",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    "makeHole",
    "Space",
    "trim",
    "affectMobHeal",
    "us_ffa2",
    "Created\x20changelog.",
    "Lightning",
    "Hyper\x20Players",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "Some\x20Data",
    "ui_scale",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "onclick",
    "*Rock\x20health:\x2060\x20→\x20120",
    "oceed",
    "KGw#",
    "\x20XP",
    "petalsLeft",
    "stringify",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "shieldRegenPerSec",
    "#ceea33",
    "#bb3bc2",
    "iDepositPetal",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    ".username-area",
    "zmkhtdVdSq",
    "petalWave",
    "#fc5c5c",
    "url",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    "tail_outline",
    "petal_",
    "://ho",
    "sword",
    "can\x20s",
    "Absorb",
    "keyup",
    ".copy-btn",
    "passive",
    "#cecfa3",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    "index",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "Ghost_6",
    "encod",
    "armor",
    "rgba(0,\x200,\x200,\x200.15)",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "Hornet",
    "rotate(",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    "none",
    "stickbugBody",
    "petalAvacado",
    ".rewards\x20.dialog-content",
    "\x20(Lvl\x20",
    "hasHearts",
    "Removed\x20disclaimer\x20from\x20menu.",
    "hasSpawnImmunity",
    "<span\x20style=\x22color:",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    "measureText",
    "charCodeAt",
    "Flower\x20Poison",
    "Sandstorm_1",
    "#8f5f34",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    "portal",
    "wss://as1.hornex.pro",
    "they\x20copied\x20florr\x20code\x20omg!!",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    "Grapes",
    "22nd\x20June\x202023",
    ".lb",
    "*Peas\x20damage:\x208\x20→\x2010",
    "fixed",
    "Sandstorm",
    "#9e7d24",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    "*Cement\x20health:\x2080\x20→\x20100",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    "[K]\x20Keyboard\x20Controls:\x20",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    "onEnd",
    "Web\x20Radius",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "canRemove",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "isStatue",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    ".dc-group",
    ".max-score",
    ".show-bg-grid-cb",
    "fossil",
    "21st\x20June\x202023",
    "pedoxMain",
    "no-icon",
    "*Rice\x20damage:\x204\x20→\x205",
    "#c1ab00",
    "Ugly\x20&\x20stinky.",
    "#400",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    "fireDamageF",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    "\x20+\x20",
    "Server\x20side\x20performance\x20improvements.",
    "onkeydown",
    "#ffe667",
    "save",
    "aip_complete",
    "rewards",
    "Rock_5",
    "readAsText",
    "WP10rSoRnG",
    "100%",
    "maxTimeAlive",
    "Region:\x20",
    "pro",
    "sin",
    "oAngle",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "destroyed",
    "mobsEl",
    "petalHeavy",
    "stopWhileMoving",
    "pacman",
    "switched",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "<div\x20class=\x22chat-name\x22></div>",
    "*Bone\x20armor:\x207\x20→\x208",
    "ad\x20refresh",
    "*Powder\x20health:\x2010\x20→\x2015",
    "hide-icons",
    "cuYF",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    "sameTypeColResolveOnly",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    ".builds",
    "count",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    "onresize",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    ".waveroom-info",
    ".grid-cb",
    ".game-stats",
    "bottom",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "dSk+d0afnmo5WODJW6zQxW",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "13th\x20September\x202023",
    ";-moz-background-position:\x20",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "Range",
    "useTime",
    "Retardation\x20Duration",
    "iReqAccountData",
    "cmd",
    "petHealF",
    "isRetard",
    "AS\x20#2",
    "WRzmW4bPaa",
    "small\x20full",
    "textEl",
    "User",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    "#8ecc51",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    "marginTop",
    "New\x20mob:\x20Furry.",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "XCN6",
    "𐐿𐐘𐐫𐑀𐐃",
    "enable_shake",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "wasDrawn",
    "mood",
    "#7d5098",
    "#fbb257",
    ".show-health-cb",
    "Missile\x20Poison",
    "#f2b971",
    "spiderCave",
    "#cfcfcf",
    "show-petal",
    "#288842",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "oPlayerY",
    "typeStr",
    "\x20no-icon\x22\x20",
    "sandstorm",
    "Desert\x20Centipede",
    "image/png",
    "1px",
    "*Bone\x20armor:\x205\x20→\x206",
    ".shop-info",
    "sk.",
    "level",
    "Rock_6",
    "\x20Wave\x20",
    "iSwapPetal",
    ".player-list",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "Dark\x20Ladybug",
    "stroke",
    "Ghost_3",
    "https://www.youtube.com/@gowcaw97",
    "ladybug",
    "Spider\x20Legs",
    "successCount",
    "4625pJBJQF",
    "top",
    "hide-chat",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "connect",
    "dragonNest",
    "dispose",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    "workerAntFire",
    "29th\x20January\x202024",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    "angryT",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    "type",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    "maximumFractionDigits",
    "ctx",
    "petalYinYang",
    "Chromosome",
    "#feffc9",
    "*Pincer\x20damage:\x205\x20→\x206",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    "Salt",
    ".username-link",
    "retardDuration",
    "turtle",
    "#f22",
    "darkLadybug",
    "Soak\x20Duration",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "*Light\x20damage:\x2012\x20→\x2010",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "abs",
    ".keyboard-cb",
    "ShiftLeft",
    "twirl",
    "restore",
    "#d3bd46",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "[data-icon]",
    "isProj",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "querySelector",
    "from",
    "\x20at\x20least!",
    ".prediction",
    "Bone",
    ".discord-avatar",
    ".build-load-btn",
    "#b9baba",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "Damage",
    "shop",
    "8URl",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "p41E",
    "pickedEl",
    "usernameTaken",
    "countTiers",
    "spawnOnDie",
    "\x20all\x20",
    "eu_ffa",
    "regenF",
    "s...)",
    "respawnTimeTiers",
    "drops",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    ".discord-user",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    "petalStarfish",
    "Kills",
    "23622399UiQtNS",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "draw",
    "5th\x20January\x202024",
    "dontUiRotate",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "drawTurtleShell",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    ".chat",
    "angleSpeed",
    "motionKind",
    "getUint16",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x22",
    "\x20at\x20y",
    ".score-overlay",
    "portalPoints",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    "subscribe\x20for\x20999\x20super\x20petals",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "petHeal",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    ".gamble-prediction",
    "fixed_mob_health_size",
    "buffer",
    "CCofC2RcTG",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    "#cfbb50",
    "Air",
    "qCkBW5pcR8kD",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    "WR7cQCkf",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    "Peas",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "└─\x20",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "*Epic:\x2075\x20→\x2065",
    "transformOrigin",
    "#e0c85c",
    "transition",
    "*They\x20give\x2010x\x20score.",
    "Queen\x20Ant",
    "#8b533f",
    "Your\x20Profile",
    "Removed\x20Centipedes\x20from\x20waves.",
    "then",
    "New\x20mob:\x20Pedox",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    "Ladybug",
    "onmouseleave",
    "crafted\x20nothing\x20from",
    ".helper-cb",
    "Missile\x20Health",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "babyAnt",
    "state",
    "year",
    ".censor-cb",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "rgb(126,\x20239,\x20109)",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "15584076IAHWRs",
    "Ancester\x20of\x20flowers.",
    "rgba(0,0,0,0.2",
    "\x20&\x20",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "1167390UrVkfV",
    "code",
    "hsl(110,100%,60%)",
    "breedTimerAlpha",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    "WR7dPdZdQXS",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    "lobbyClosing",
    "Dahlia",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "descColor",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "extraRange",
    "Reduced\x20Wave\x20duration.",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "documentElement",
    "Extra\x20Speed",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    "globalCompositeOperation",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    "rgb(255,\x20230,\x2093)",
    "starfish",
    "Added\x20another\x20AS\x20lobby.",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "W6rnWPrGWPfdbxmAWOHa",
    "Rock_2",
    "imageSmoothingEnabled",
    "Invalid\x20mob\x20name:\x20",
    "Sandstorm_2",
    "petalCotton",
    "byteLength",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "countEl",
    "honeyTile",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    "3rd\x20February\x202024",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    "https://www.youtube.com/@FussySucker",
    "\x20in\x20view\x20/\x20",
    "identifier",
    "red",
    "5th\x20September\x202023",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    ".credits-btn",
    "isCentiBody",
    "OFFIC",
    "iMood",
    "Ant\x20Egg",
    "style=\x22background-position:\x20",
    "nt.\x20H",
    "cloneNode",
    "\x20and\x20",
    "clip",
    "tumbleweed",
    "rotate",
    "absorbDamage",
    "makeSpiderLegs",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "center",
    "#634002",
    "mouse",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    "left",
    "wave",
    "ondragover",
    "hostname",
    "Nitro",
    "Swastika",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "Beehive",
    ".absorb-clear-btn",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "5th\x20July\x202023",
    "text",
    ".my-player",
    "show_population",
    "Hornet_5",
    "Orbit\x20Dance",
    "20th\x20January\x202024",
    "4th\x20August\x202023",
    "Expander",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    "Makes\x20you\x20poisonous.",
    "hornex-pro_300x600",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "getHurtColor",
    "keyCheckFailed",
    "></di",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "Sussy\x20Discord\x20uwu",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    ".total-kills",
    "show_damage",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "W5bKgSkSW78",
    "petalPacman",
    ".insta-btn",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    "side",
    "sign",
    "KeyV",
    "#29f2e5",
    "ready",
    "New\x20mob:\x20Dice.",
    "location",
    "ceil",
    "/profile",
    "Removed\x20EU\x20#3.",
    "cmk+c0aoqSoLWQrQW6Tx",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "createdAt",
    "font",
    "<div\x20style=\x22width:100%;\x20text-align:center;\x22></div>",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "show_scoreboard",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    ".changelog",
    "fill",
    "/weborama.js",
    "dandelion",
    "https://www.youtube.com/@KePiKgamer",
    "nAngle",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "Pill",
    "20th\x20July\x202023",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    "*Increased\x20drop\x20rates.",
    "Regenerates\x20health\x20when\x20consumed.",
    "*Yoba\x20Egg\x20buff.",
    "Dragon_4",
    "*Snail\x20damage:\x2020\x20→\x2025",
    "makeMissile",
    "l\x20you",
    "spawn",
    "\x20accounts",
    "petalDrop",
    "iReqGlb",
    "Coffee",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "*Banana\x20damage:\x201\x20→\x202",
    "legD",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    "\x20won\x20and\x20got\x20extra",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "\x20by",
    "Beetle_6",
    "defineProperty",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    ".petal-count",
    "shell",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "WRZdV8kNW5FcHq",
    "It\x20has\x20sussy\x20movement.",
    "content",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    "dataTransfer",
    "lottery",
    ".common",
    "nick",
    "Ultra\x20Players\x20(200+)",
    ".joystick",
    "15th\x20July\x202023",
    "nProg",
    "span\x202",
    "discord_data",
    "beginPath",
    "rgb(166\x2056\x20237)",
    "Ruined",
    "\x0aServer:\x20",
    "27th\x20June\x202023",
    "FSoixsnA",
    "#4040fc",
    "isPortal",
    "19th\x20June\x202023",
    "(auto\x20reloading\x20in\x20",
    "spawn_zone",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    ".tv-prev",
    "halo",
    "usernameClaimed",
    "Added\x20Waves.",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    "#fcdd86",
    "13th\x20February\x202024",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    "moveSpeed",
    "pow",
    "Game",
    "Iris",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    "clearRect",
    "\x22></span></div>\x0a\x09</div>",
    "right",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "*Bone\x20armor:\x208\x20→\x209",
    "hideTimer",
    "Wig",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    "translate(-50%,\x20",
    "accountData",
    "Petal\x20Slots",
    "KePiKgamer",
    "*Hyper:\x20175+",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "#fe98a2",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    "centipedeBodyDesert",
    "your\x20",
    "sq8Ig3e",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    "createElement",
    "send",
    "petalPowder",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    "#cccccc",
    "innerWidth",
    "*Swastika\x20health:\x2020\x20→\x2025",
    "Flower\x20#",
    "style",
    "*Heavy\x20health:\x20450\x20→\x20500",
    "iSwapPetalRow",
    ".ads",
    "rgba(0,0,0,0.35)",
    "#7d5b1f",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "petHealthFactor",
    "28th\x20August\x202023",
    "fixedSize",
    "localId",
    "invalid\x20uuid",
    "object",
    "labelPrefix",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "*Snail\x20health:\x2045\x20→\x2050",
    "ArrowDown",
    ".\x22>\x20<span\x20class=\x22username-link\x22\x20stroke=\x22",
    "Beetle_3",
    "wn\x20ri",
    "Added\x202\x20US\x20lobbies.",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    "fontFamily",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    "*Reduced\x20Shield\x20regen\x20time.",
    "#724c2a",
    "New\x20settings:\x20Low\x20quality.",
    "an\x20UN",
    "r\x20acc",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "indexOf",
    "Legendary",
    "hsla(0,0%,100%,0.1)",
    "Increased\x20map\x20size\x20by\x2030%.",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    ".\x20Hac",
    "titleColor",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "map",
    "#a5d141",
    "Magnet",
    "centipedeHeadPoison",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "#8ac355",
    "Red\x20ball.",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "split",
    "Removed\x20Waves.",
    "wss://hornex-",
    "iPercent",
    "petalCement",
    "path",
    "getContext",
    "parts",
    "mob_",
    "dontResolveCol",
    "flower",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    "Video\x20AD\x20success!",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    "#a17c4c",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "isDevelopmentMode",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "evenodd",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    "*Super:\x201%\x20→\x201.5%",
    "isPlayer",
    "Q2mA",
    "/tile\x20(",
    "long",
    "WP5YoSoxvq",
    "*Rock\x20health:\x20120\x20→\x20150",
    "Invalid\x20petal\x20name:\x20",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    "ing\x20o",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "endsWith",
    "Temporary\x20Extra\x20Speed",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    "beetle",
    "credits",
    "Hornet\x20Egg",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "Poop\x20Damage",
    "#d3ad46",
    "has\x20ended.",
    ".minimap-cross",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "Hornet_4",
    "orb\x20a",
    "arial",
    ".lottery-users",
    "cookie",
    "unsuccessful",
    "eu_ffa1",
    "28th\x20June\x202023",
    "particle_heart_",
    "KeyA",
    "*Banana\x20health:\x20170\x20→\x20400",
    "Ultra",
    "small",
    "lineWidth",
    "groups",
    "addEventListener",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "#d6b936",
    ".tabs",
    "stepPerSecMotion",
    ".joystick-knob",
    "WQxdVSkKW5VcJq",
    "#f54ce7",
    "projPoisonDamageF",
    "New\x20mob:\x20Sponge",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "#347918",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "*Reduced\x20drops\x20by\x2050%.",
    "#cdbb48",
    "#eee",
    "petalerDrop",
    ".game-stats\x20.dialog-content",
    "%zY4",
    "Increased\x20Wave\x20mob\x20count.",
    "uiScale",
    "data-icon",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "accou",
    "#b5a24b",
    "lightningDmgF",
    "#bc0000",
    "isPetal",
    "Even\x20more\x20wave\x20changes:",
    "drawArmAndGem",
    ".fixed-player-health-cb",
    "petalDandelion",
    "*Super:\x205-15",
    "replace",
    "poopPath",
    "Pincer",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "key",
    "canvas",
    "2571552iXfSxG",
    "26th\x20July\x202023",
    "7th\x20July\x202023",
    "keyClaimed",
    "addToInventory",
    "6th\x20November\x202023",
    "mobDespawned",
    "onmousedown",
    "/s\x20for\x20all\x20tiles)",
    "Wave\x20changes:",
    ".minimap",
    "acker",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    "Flower\x20Damage",
    "Increases\x20petal\x20spin\x20speed.",
    "[censored]",
    "Digit",
    "ame",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    ".swap-btn",
    "Beetle_5",
    "Rose",
    "rgba(0,0,0,",
    "Sprite",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "Rock_3",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "*Ultra:\x20125+",
    "?dev",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "1Jge",
    "4oL8",
    "Spider",
    "#634418",
    "crafted",
    "Health",
    "#363685",
    "Orbit\x20Shlongation",
    "New\x20score\x20formula.",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "host",
    ".clear-build-btn",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    "#3db3cb",
    "[2tB",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    "Yoba_3",
    "show_hitbox",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    "petCount",
    "fixed_name_size",
    "lightningDmg",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    "25th\x20January\x202024",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "bolder\x2017px\x20",
    "dice",
    "#4d5e56",
    "petalSkull",
    "marginLeft",
    "started!",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "warne",
    ".reload-timer",
    "match",
    ".collected-petals",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    "powderPath",
    "btn",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "waveNumber",
    "boostStrength",
    "honeyRange",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    "getTransform",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "n8oKoxnarXHzeIzdmW",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "oProg",
    "lieOnGroundTime",
    "#d3c66d",
    "Poo",
    "gblcVXldOG",
    "OQM)",
    "setTargetEl",
    ".collected-rarities",
    "\x22></div>\x0a\x09</div>",
    "exp",
    "ignore\x20if\x20u\x20already\x20subbed",
    "leaders",
    "Extra\x20Spin\x20Speed",
    "rect",
    "*Hyper:\x2015-25",
    "#a07f53",
    "Rice",
    ".discord-area",
    "GsP9",
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "WAVE",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    "4th\x20April\x202024",
    "https://www.youtube.com/@IAmLavaWater",
    "7th\x20February\x202024",
    "3220DFvaar",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "New\x20mob:\x20Dragon\x20Nest.",
    "Yoba_1",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "toLocaleDateString",
    ".container",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "Favourite\x20object\x20of\x20a\x20woman.",
    ".lottery",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "numeric",
    "strok",
    "Crab",
    "iCraft",
    "&quot;",
    "Furry",
    "http",
    "#ff63eb",
    "Added\x20Shiny\x20mobs:",
    "Bush",
    "#38c75f",
    "max",
    "bolder\x2012px\x20",
    "reqFailed",
    "breedTimer",
    "reverse",
    "hasSpiderLeg",
    ".absorb\x20.dialog-header\x20span",
    "jellyfish",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "oncontextmenu",
    "moveCounter",
    "redHealth",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    ".tooltip",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    "arraybuffer",
    ".screen",
    "moveTo",
    ".import-btn",
    ".bar",
    "children",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    "curePoison",
    "yoba",
    "projDamageF",
    "</option>",
    "#dc704b",
    "12OVuKwi",
    "horne",
    "prototype",
    ".featured",
    "INPUT",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "Fixed\x20players\x20pushing\x20eachother.",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "antHole",
    "pickupRangeTiers",
    "1153013CPXzVE",
    "onkeyup",
    "*Arrow\x20damage:\x201\x20→\x203",
    "24th\x20June\x202023",
    "#ab5705",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    "hpRegen75PerSec",
    "21st\x20January\x202024",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "uwu",
    "breedRange",
    "--angle:",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    "petalAntidote",
    "getBoundingClientRect",
    "<div\x20class=\x22dialog\x20tier-",
    "slayed",
    ".stats-btn",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    "height",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    "dontPushTeam",
    "lastResizeTime",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "update",
    "#cb37bf",
    "weight",
    ".submit-btn",
    "shadowColor",
    "Fire\x20Duration",
    "Tiers",
    "petalSoil",
    "Enter",
    "soakTime",
    "executed",
    "14th\x20July\x202023",
    "All\x20Petals",
    "10px",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    ".show-scoreboard-cb",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "Increased\x20shiny\x20mob\x20size.",
    "download",
    "stayIdle",
    "#764b90",
    "#493911",
    "enable_min_scaling",
    "gameStats",
    "extraSpeed",
    "#7777ff",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "%!Ew",
    "\x20play",
    ".inventory",
    ".shop-btn",
    "Spider\x20Yoba",
    ".rewards",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "toggle",
    "Damage\x20Reflection",
    "Heal",
    "pZWkWOJdLW",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    "random",
    "changedTouches",
    "hide",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "Armor",
    "rgb(43,\x20255,\x20163)",
    "accountNotFound",
    "(total\x20",
    "Soaks\x20damage\x20over\x20time.",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    ".progress",
    "Nigerian\x20Ladybug.",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    "#6f5514",
    "nSize",
    "hasEars",
    ".builds\x20.dialog-content",
    "WPfQmmoXFW",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    ".loader",
    "containerDialog",
    "Sandstorm_3",
    "Baby\x20Ant",
    "),0)",
    "toUpperCase",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "ages.",
    "pop",
    "our\x20o",
    "Loading\x20video\x20ad...",
    "flowerPoisonF",
    "offsetWidth",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "Wave",
    "Gas",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    "25th\x20June\x202023",
    "\x20petal",
    "honeyDmgF",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "/hqdefault.jpg)",
    "centipedeHeadDesert",
    "Ghost",
    "dir",
    "fromCharCode",
    "petalPea",
    "https://ipapi.co/json/",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "New\x20mob:\x20Turtle",
    "shift",
    "s\x20can",
    "oSize",
    "userChat",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "hornet",
    "iAbsorb",
    ".hud",
    "Fonts\x20loaded!",
    "s.\x20Yo",
    "New\x20mob:\x20Statue.",
    "url(https://i.ytimg.com/vi/",
    ".absorb-petals",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    "[F]\x20Show\x20Hitbox:\x20",
    "19th\x20January\x202024",
    "]\x22></div>",
    "Fixed\x20Gem\x20glitch.",
    "oninput",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    "Yoba",
    "hsl(110,100%,50%)",
    "Bubble",
    "New\x20mob:\x20Snail.",
    "OFF",
    "scrollTop",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "6th\x20September\x202023",
    "#D2D1CD",
    ".petal",
    "tail",
    ".flower-stats",
    "orbitDance",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    "hideAfterInactivity",
    "2nd\x20March\x202024",
    "#ffe763",
    "checked",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    "\x22\x20stroke=\x22",
    "strokeStyle",
    "isDead",
    "#454545",
    "2368122rfIPkD",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    "projD",
    "New\x20mob:\x20Nigersaurus.",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "drawWingAndHalo",
    "New\x20rarity:\x20Hyper.",
    "Spider_1",
    "decode",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "disabled",
    "Ghost_2",
    "W6RcRmo0WR/cQSo1W4PifG",
    ".rewards-btn",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    "Failed\x20to\x20get\x20game\x20stats.\x20Retrying\x20in\x205s...",
    "ability",
    ".leave-btn",
    "\x0a22nd\x20May\x202024\x0aNew\x20setting:\x20Show\x20Health.\x20Press\x20Y\x20to\x20toggle.\x0aNew\x20setting:\x20Fixed\x20Flower\x20Health\x20Bar\x20Size.\x0aNew\x20setting:\x20Fixed\x20Mob\x20Health\x20Bar\x20Size.\x0aNew\x20setting:\x20Change\x20Font.\x0aHoney\x20now\x20also\x20shows\x20tile\x20count\x20&\x20total\x20damage\x20casted\x20by\x20all\x20tiles\x20in\x201\x20second.\x20Do\x20note\x20the\x20numbers\x20are\x20for\x20most\x20ideal\x20case.\x20Most\x20of\x20the\x20time\x20you\x20won\x27t\x20get\x20that\x20much\x20damage.\x0a",
    "Added\x201\x20more\x20EU\x20lobby.",
    "User\x20not\x20found!",
    "absorb",
    "Increases\x20petal\x20pickup\x20range.",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    "#bb771e",
    "23rd\x20August\x202023",
    "touchmove",
    "video-ad-skipped",
    "#2e933c",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    "isBooster",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "/s\x20if\x20H<50%",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "deg",
    "#853636",
    ".player-list-btn",
    "#97782b",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    "scorpion",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    "Mob\x20Rotation",
    "Soldier\x20Ant_1",
    "Petaler",
    "petalFaster",
    "*Cotton\x20health:\x2012\x20→\x2015",
    ".chat-input",
    "includes",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    "setValue",
    "projHealth",
    "floor",
    "Taco",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "Connecting\x20to\x20",
    "shinyCol",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    ".level",
    "continent_code",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "Soldier\x20Ant_3",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    ".craft-btn",
    "search",
    "blue",
    "insert\x20something\x20here...",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    "mobile",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    "Username\x20claimed!",
    "reflect",
    "scorp",
    "(reloading...)",
    "makeFire",
    "\x22></div>\x0a\x09\x09",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "timeJoined",
    ".scale-cb",
    "binaryType",
    "Poop\x20Health",
    "lineTo",
    "rgb(81\x20121\x20251)",
    ".shake-cb",
    "breedPower",
    "avacado",
    "makeAntenna",
    "New\x20mob:\x20Fossil.",
  ];
  a = function () {
    return Cp;
  };
  return a();
}
function b(c, d) {
  const e = a();
  return (
    (b = function (f, g) {
      f = f - 0x10c;
      let h = e[f];
      return h;
    }),
    b(c, d)
  );
}
(function (c, d) {
  const uu = b,
    e = c();
  while (!![]) {
    try {
      const f =
        parseInt(uu(0xbb3)) / 0x1 +
        -parseInt(uu(0x1d4)) / 0x2 +
        -parseInt(uu(0x1b7)) / 0x3 +
        (parseInt(uu(0x40d)) / 0x4) * (-parseInt(uu(0x8ec)) / 0x5) +
        (parseInt(uu(0xc54)) / 0x6) * (-parseInt(uu(0x16b)) / 0x7) +
        -parseInt(uu(0xb08)) / 0x8 +
        parseInt(uu(0x93c)) / 0x9;
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0xb3bff),
  (() => {
    const uv = b;
    var cG = 0x2710,
      cH = 0x1e - 0x1,
      cI = { ...cV(uv(0x287)), ...cV(uv(0x7af)) },
      cJ = 0x93b,
      cK = 0x10,
      cL = 0x3c,
      cM = 0x10,
      cN = 0x3,
      cO = /^[a-zA-Z0-9_]+$/,
      cP = /[^a-zA-Z0-9_]/g,
      cQ = cV(uv(0x53c)),
      cR = cV(uv(0xa90)),
      cS = cV(uv(0x603)),
      cT = cV(uv(0x232)),
      cU = cV(uv(0xdc6));
    function cV(r6) {
      const uw = uv,
        r7 = r6[uw(0xaa2)]("\x20"),
        r8 = {};
      for (let r9 = 0x0; r9 < r7[uw(0xd55)]; r9++) {
        r8[r7[r9]] = r9;
      }
      return r8;
    }
    var cW = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cX = {};
    (cX[uv(0xdf2)] = 0x0), (cX[uv(0x2a4)] = 0x1), (cX[uv(0x4e4)] = 0x2);
    var cY = cX,
      cZ = [
        [0x0, 0x0],
        [0x1, 0xa - 0x1],
        [0x2, 0x23 - 0x1],
        [0x5, 0x41 - 0x1],
        [0x4, 0x64 - 0x1],
        [0x3, 0xc8 - 0x1],
      ],
      d0 = 0x7d0,
      d1 = 0x3e8;
    function d2(r6) {
      const ux = uv;
      return 0x14 * Math[ux(0xc8c)](r6 * 1.05 ** (r6 - 0x1));
    }
    var d3 = [
      0x1, 0x5, 0x32, 0x1f4, 0x2710, 0x7a120, 0x2faf080, 0x12a05f200,
      0xe8d4a51000,
    ];
    function d4(r6) {
      let r7 = 0x0,
        r8 = 0x0;
      while (!![]) {
        const r9 = d2(r7 + 0x1);
        if (r6 < r8 + r9) break;
        (r8 += r9), r7++;
      }
      return [r7, r8];
    }
    function d5(r6) {
      const uy = uv;
      let r7 = 0x5,
        r8 = 0x5;
      while (r6 >= r8) {
        r7++, (r8 += Math[uy(0x77f)](0x1e, r8));
      }
      return r7;
    }
    function d6(r6) {
      const uz = uv;
      return Math[uz(0xa4e)](0xf3, Math[uz(0x77f)](r6, 0xc7) / 0xc8);
    }
    function d7() {
      return d8(0x100);
    }
    function d8(r6) {
      const r7 = Array(r6);
      while (r6--) r7[r6] = r6;
      return r7;
    }
    var d9 = cV(uv(0xa4c)),
      da = Object[uv(0x5de)](d9),
      db = da[uv(0xd55)] - 0x1,
      dc = db;
    function dd(r6) {
      const uA = uv,
        r7 = [];
      for (let r8 = 0x1; r8 <= dc; r8++) {
        r7[uA(0xe68)](r6(r8));
      }
      return r7;
    }
    const de = {};
    (de[uv(0x7d8)] = 0x0),
      (de[uv(0x544)] = 0x1),
      (de[uv(0x502)] = 0x2),
      (de[uv(0x266)] = 0x3),
      (de[uv(0x4b2)] = 0x4),
      (de[uv(0xa46)] = 0x5),
      (de[uv(0xd18)] = 0x6),
      (de[uv(0x4a9)] = 0x7),
      (de[uv(0x7b1)] = 0x8);
    var df = de;
    function dg(r6, r7) {
      const uB = uv;
      return Math[uB(0xa4e)](0x3, r6) * r7;
    }
    const dh = {};
    (dh[uv(0x8fa)] = cS[uv(0x233)]),
      (dh[uv(0x445)] = uv(0xc9b)),
      (dh[uv(0x3aa)] = 0xa),
      (dh[uv(0x2a3)] = 0x0),
      (dh[uv(0x267)] = 0x1),
      (dh[uv(0xdf6)] = 0x1),
      (dh[uv(0xcc9)] = 0x3e8),
      (dh[uv(0x8b1)] = 0x0),
      (dh[uv(0x586)] = ![]),
      (dh[uv(0x4b0)] = 0x1),
      (dh[uv(0x919)] = ![]),
      (dh[uv(0x931)] = 0x0),
      (dh[uv(0x5d1)] = 0x0),
      (dh[uv(0x3c8)] = ![]),
      (dh[uv(0xce5)] = 0x0),
      (dh[uv(0xafa)] = 0x0),
      (dh[uv(0x47a)] = 0x0),
      (dh[uv(0x45a)] = 0x0),
      (dh[uv(0xe3b)] = 0x0),
      (dh[uv(0x993)] = 0x0),
      (dh[uv(0x8a2)] = 0x1),
      (dh[uv(0x7cf)] = 0xc),
      (dh[uv(0x500)] = 0x0),
      (dh[uv(0x75a)] = ![]),
      (dh[uv(0xc67)] = void 0x0),
      (dh[uv(0x9c1)] = ![]),
      (dh[uv(0xe6c)] = 0x0),
      (dh[uv(0xc77)] = ![]),
      (dh[uv(0xb54)] = 0x0),
      (dh[uv(0xcaf)] = 0x0),
      (dh[uv(0x2e3)] = ![]),
      (dh[uv(0x19d)] = 0x0),
      (dh[uv(0xca2)] = 0x0),
      (dh[uv(0x558)] = 0x0),
      (dh[uv(0xe1d)] = ![]),
      (dh[uv(0xb5c)] = 0x0),
      (dh[uv(0x620)] = ![]),
      (dh[uv(0x6ca)] = ![]),
      (dh[uv(0x168)] = 0x0),
      (dh[uv(0x496)] = 0x0),
      (dh[uv(0xbe6)] = 0x0),
      (dh[uv(0x260)] = ![]),
      (dh[uv(0xb3b)] = 0x1),
      (dh[uv(0xdf8)] = 0x0),
      (dh[uv(0x7f9)] = 0x0),
      (dh[uv(0xc14)] = 0x0),
      (dh[uv(0x10c)] = 0x0),
      (dh[uv(0xba4)] = 0x0),
      (dh[uv(0x173)] = 0x0),
      (dh[uv(0x955)] = 0x0),
      (dh[uv(0x8b5)] = 0x0),
      (dh[uv(0xd52)] = 0x0),
      (dh[uv(0xd17)] = 0x0),
      (dh[uv(0x824)] = 0x0),
      (dh[uv(0xde0)] = 0x0),
      (dh[uv(0xd98)] = 0x0),
      (dh[uv(0x76a)] = 0x0),
      (dh[uv(0x811)] = ![]),
      (dh[uv(0xd7f)] = 0x0),
      (dh[uv(0x657)] = 0x0),
      (dh[uv(0xd69)] = 0x0);
    var di = dh;
    const dj = {};
    (dj[uv(0x46b)] = uv(0x5ed)),
      (dj[uv(0x445)] = uv(0x47b)),
      (dj[uv(0x8fa)] = cS[uv(0x233)]),
      (dj[uv(0x3aa)] = 0x9),
      (dj[uv(0x267)] = 0xa),
      (dj[uv(0xdf6)] = 0xa),
      (dj[uv(0xcc9)] = 0x9c4);
    const dk = {};
    (dk[uv(0x46b)] = uv(0xe30)),
      (dk[uv(0x445)] = uv(0xdc1)),
      (dk[uv(0x8fa)] = cS[uv(0x2fa)]),
      (dk[uv(0x3aa)] = 0xd / 1.1),
      (dk[uv(0x267)] = 0x2),
      (dk[uv(0xdf6)] = 0x37),
      (dk[uv(0xcc9)] = 0x9c4),
      (dk[uv(0x8b1)] = 0x1f4),
      (dk[uv(0x919)] = !![]),
      (dk[uv(0xcdb)] = 0x28),
      (dk[uv(0x5d1)] = Math["PI"] / 0x4);
    const dl = {};
    (dl[uv(0x46b)] = uv(0xb1d)),
      (dl[uv(0x445)] = uv(0xa11)),
      (dl[uv(0x8fa)] = cS[uv(0x3c3)]),
      (dl[uv(0x3aa)] = 0x8),
      (dl[uv(0x267)] = 0x5),
      (dl[uv(0xdf6)] = 0x5),
      (dl[uv(0xcc9)] = 0xdac),
      (dl[uv(0x8b1)] = 0x3e8),
      (dl[uv(0x931)] = 0xb),
      (dl[uv(0xe1d)] = !![]);
    const dm = {};
    (dm[uv(0x46b)] = uv(0xa50)),
      (dm[uv(0x445)] = uv(0x8ef)),
      (dm[uv(0x8fa)] = cS[uv(0x6d7)]),
      (dm[uv(0x3aa)] = 0x6),
      (dm[uv(0x267)] = 0x5),
      (dm[uv(0xdf6)] = 0x5),
      (dm[uv(0xcc9)] = 0xfa0),
      (dm[uv(0x586)] = !![]),
      (dm[uv(0x4b0)] = 0x32);
    const dn = {};
    (dn[uv(0x46b)] = uv(0x518)),
      (dn[uv(0x445)] = uv(0xcf1)),
      (dn[uv(0x8fa)] = cS[uv(0x3c4)]),
      (dn[uv(0x3aa)] = 0xb),
      (dn[uv(0x267)] = 0xc8),
      (dn[uv(0xdf6)] = 0x1e),
      (dn[uv(0xcc9)] = 0x1388);
    const dp = {};
    (dp[uv(0x46b)] = uv(0xe4d)),
      (dp[uv(0x445)] = uv(0x5d8)),
      (dp[uv(0x8fa)] = cS[uv(0x398)]),
      (dp[uv(0x3aa)] = 0x8),
      (dp[uv(0x267)] = 0x2),
      (dp[uv(0xdf6)] = 0xa0),
      (dp[uv(0xcc9)] = 0x2710),
      (dp[uv(0x7cf)] = 0xb),
      (dp[uv(0x500)] = Math["PI"]),
      (dp[uv(0x92d)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dq = {};
    (dq[uv(0x46b)] = uv(0x5fd)),
      (dq[uv(0x445)] = uv(0x685)),
      (dq[uv(0xc67)] = df[uv(0x7d8)]),
      (dq[uv(0x993)] = 0x1e),
      (dq[uv(0x511)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dr = {};
    (dr[uv(0x46b)] = uv(0x46e)),
      (dr[uv(0x445)] = uv(0x3ea)),
      (dr[uv(0xc67)] = df[uv(0x544)]);
    const ds = {};
    (ds[uv(0x46b)] = uv(0x814)),
      (ds[uv(0x445)] = uv(0x428)),
      (ds[uv(0x8fa)] = cS[uv(0x177)]),
      (ds[uv(0x3aa)] = 0xb),
      (ds[uv(0xcc9)] = 0x9c4),
      (ds[uv(0x267)] = 0x14),
      (ds[uv(0xdf6)] = 0x8),
      (ds[uv(0x3c8)] = !![]),
      (ds[uv(0xce5)] = 0x2),
      (ds[uv(0x585)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (ds[uv(0xafa)] = 0x14);
    const du = {};
    (du[uv(0x46b)] = uv(0x69f)),
      (du[uv(0x445)] = uv(0x546)),
      (du[uv(0x8fa)] = cS[uv(0xbd5)]),
      (du[uv(0x3aa)] = 0xb),
      (du[uv(0x267)] = 0x14),
      (du[uv(0xdf6)] = 0x14),
      (du[uv(0xcc9)] = 0x5dc),
      (du[uv(0x45a)] = 0x64),
      (du[uv(0x187)] = 0x1);
    const dv = {};
    (dv[uv(0x46b)] = uv(0x48c)),
      (dv[uv(0x445)] = uv(0x943)),
      (dv[uv(0x8fa)] = cS[uv(0x7e8)]),
      (dv[uv(0x3aa)] = 0x7),
      (dv[uv(0x267)] = 0x5),
      (dv[uv(0xdf6)] = 0xa),
      (dv[uv(0xcc9)] = 0x258),
      (dv[uv(0x8a2)] = 0x1),
      (dv[uv(0x75a)] = !![]),
      (dv[uv(0x92d)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dw = {};
    (dw[uv(0x46b)] = uv(0x5c8)),
      (dw[uv(0x445)] = uv(0xd36)),
      (dw[uv(0x8fa)] = cS[uv(0x9a4)]),
      (dw[uv(0x3aa)] = 0xb),
      (dw[uv(0x267)] = 0xf),
      (dw[uv(0xdf6)] = 0x1),
      (dw[uv(0xcc9)] = 0x3e8),
      (dw[uv(0x9c1)] = !![]),
      (dw[uv(0xe1d)] = !![]);
    const dx = {};
    (dx[uv(0x46b)] = uv(0xa9c)),
      (dx[uv(0x445)] = uv(0xc6d)),
      (dx[uv(0x8fa)] = cS[uv(0x7a7)]),
      (dx[uv(0x3aa)] = 0xb),
      (dx[uv(0x267)] = 0xf),
      (dx[uv(0xdf6)] = 0x5),
      (dx[uv(0xcc9)] = 0x5dc),
      (dx[uv(0xe6c)] = 0x32),
      (dx[uv(0xbb2)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dy = {};
    (dy[uv(0x46b)] = uv(0x963)),
      (dy[uv(0x445)] = uv(0x985)),
      (dy[uv(0x8fa)] = cS[uv(0xc24)]),
      (dy[uv(0x3aa)] = 0x7),
      (dy[uv(0x267)] = 0x19),
      (dy[uv(0xdf6)] = 0x19),
      (dy[uv(0x8a2)] = 0x4),
      (dy[uv(0xcc9)] = 0x3e8),
      (dy[uv(0x8b1)] = 0x1f4),
      (dy[uv(0x7cf)] = 0x9),
      (dy[uv(0x5d1)] = Math["PI"] / 0x8),
      (dy[uv(0x919)] = !![]),
      (dy[uv(0xcdb)] = 0x28);
    const dz = {};
    (dz[uv(0x46b)] = uv(0xc3f)),
      (dz[uv(0x445)] = uv(0x7ed)),
      (dz[uv(0x8fa)] = cS[uv(0x4b4)]),
      (dz[uv(0x3aa)] = 0x10),
      (dz[uv(0x267)] = 0x0),
      (dz[uv(0x3cb)] = 0x1),
      (dz[uv(0xdf6)] = 0x0),
      (dz[uv(0xcc9)] = 0x157c),
      (dz[uv(0x8b1)] = 0x1f4),
      (dz[uv(0x933)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dz[uv(0x7ee)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dz[uv(0xb54)] = 0x3c),
      (dz[uv(0xc77)] = !![]),
      (dz[uv(0xe1d)] = !![]);
    const dA = {};
    (dA[uv(0x46b)] = uv(0x1d5)),
      (dA[uv(0x445)] = uv(0x6a3)),
      (dA[uv(0x8fa)] = cS[uv(0x8ff)]),
      (dA[uv(0xcc9)] = 0x5dc),
      (dA[uv(0x2e3)] = !![]),
      (dA[uv(0x267)] = 0xa),
      (dA[uv(0xdf6)] = 0x14),
      (dA[uv(0x3aa)] = 0xd);
    const dB = {};
    (dB[uv(0x46b)] = uv(0xe6b)),
      (dB[uv(0x445)] = uv(0x81b)),
      (dB[uv(0x8fa)] = cS[uv(0x30b)]),
      (dB[uv(0xcc9)] = 0xdac),
      (dB[uv(0x8b1)] = 0x1f4),
      (dB[uv(0x267)] = 0x5),
      (dB[uv(0xdf6)] = 0x5),
      (dB[uv(0x3aa)] = 0xa),
      (dB[uv(0x19d)] = 0x46),
      (dB[uv(0x7e7)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
    var dC = [
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
      dz,
      {
        name: uv(0xd20),
        desc: uv(0x2a9),
        ability: df[uv(0x502)],
        orbitRange: 0x32,
        orbitRangeTiers: dd((r6) => 0x32 + r6 * 0x46),
      },
      {
        name: uv(0x1b8),
        desc: uv(0x972),
        ability: df[uv(0x266)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dA,
      dB,
      {
        name: uv(0x904),
        desc: uv(0x3ed),
        type: cS[uv(0x680)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][uv(0xa9a)](
          (r6) => r6 * 0.8
        ),
      },
      {
        name: uv(0x85d),
        desc: uv(0x158),
        type: cS[uv(0x6d7)],
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
        name: uv(0x143),
        desc: uv(0x1d7),
        type: cS[uv(0x893)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
        orbitSpeedFactor: 0.95,
        orbitSpeedFactorTiers: [0.94, 0.93, 0.92, 0.91, 0.9, 0.8, 0.7, 0.1],
      },
      {
        name: uv(0x457),
        desc: uv(0xb16),
        type: cS[uv(0xc85)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][uv(0xa9a)](
          (r6) => r6 - 0.2
        ),
      },
      {
        name: uv(0x123),
        desc: uv(0x9b4),
        type: cS[uv(0x44a)],
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
        name: uv(0x7d3),
        desc: uv(0x65d),
        type: cS[uv(0x7c8)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: uv(0x9ce),
        desc: uv(0xb96),
        type: cS[uv(0x164)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: uv(0x4fc),
        desc: uv(0x2b7),
        type: cS[uv(0x2bc)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: uv(0x782),
        desc: uv(0x3b4),
        type: cS[uv(0x673)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dD(![]),
      dD(!![]),
      {
        name: uv(0x2a5),
        desc: uv(0x949),
        type: cS[uv(0x1eb)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: uv(0x2b9),
        desc: uv(0x406),
        type: cS[uv(0xa6b)],
        size: 0xa,
        healthF: 0xf,
        damageF: 0x14,
        respawnTime: 0x5dc,
        extraSpeed: 0x2,
        extraSpeedTiers: [0x4, 0x6, 0x8, 0xa, 0xc, 0xe, 0x10, 0x18],
        turbulence: 0x14,
        turbulenceTiers: dd((r6) => 0x14 + r6 * 0x50),
      },
      {
        name: uv(0x98f),
        desc: uv(0xa64),
        type: cS[uv(0x3c3)],
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
        name: uv(0xda8),
        desc: uv(0x5e1),
        type: cS[uv(0x1cf)],
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
        spawn: uv(0x36f),
        spawnTiers: [
          uv(0x6a9),
          uv(0x33c),
          uv(0xa83),
          uv(0xa83),
          uv(0x7c3),
          uv(0xb1c),
          uv(0xb1c),
          uv(0xa23),
        ],
      },
      {
        name: uv(0x9b9),
        desc: uv(0x869),
        type: cS[uv(0xdc9)],
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
        spawn: uv(0x5f1),
        spawnTiers: [
          uv(0xc83),
          uv(0xc83),
          uv(0x1e2),
          uv(0xc96),
          uv(0xdaa),
          uv(0x646),
          uv(0x646),
          uv(0x17d),
        ],
      },
      {
        name: uv(0xac9),
        desc: uv(0xabe),
        type: cS[uv(0x1cf)],
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
        spawn: uv(0x843),
        spawnTiers: [
          uv(0x60d),
          uv(0x60d),
          uv(0x29b),
          uv(0x727),
          uv(0xad1),
          uv(0x9d8),
          uv(0x9d8),
          uv(0x615),
        ],
      },
      {
        name: uv(0x2cb),
        desc: uv(0xd72),
        type: cS[uv(0x72d)],
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
        spawn: uv(0xc3d),
        spawnTiers: [
          uv(0xc3d),
          uv(0xb79),
          uv(0x1e1),
          uv(0xb38),
          uv(0x2fe),
          uv(0xccb),
          uv(0xccb),
          uv(0x35e),
        ],
      },
      {
        name: uv(0xe00),
        desc: uv(0x5a0),
        type: cS[uv(0x4ac)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: uv(0x862),
        spawnTiers: [
          uv(0x853),
          uv(0x9a3),
          uv(0x9a3),
          uv(0xc0b),
          uv(0x32d),
          uv(0x156),
          uv(0x156),
          uv(0x438),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: uv(0x401),
        desc: uv(0x8fc),
        type: cS[uv(0x460)],
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
        name: uv(0xb5e),
        desc: uv(0xc64),
        type: cS[uv(0x405)],
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
        name: uv(0xdde),
        desc: uv(0x39f),
        type: cS[uv(0x93a)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: uv(0x36c),
        desc: uv(0x6f6),
        type: cS[uv(0xb00)],
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
        name: uv(0x1a4),
        desc: uv(0x78c),
        type: cS[uv(0x802)],
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
        name: uv(0xb6b),
        desc: uv(0x4d8),
        type: cS[uv(0x1bb)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: uv(0xb04),
        desc: uv(0x4ee),
        type: cS[uv(0x379)],
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
        name: uv(0x8ea),
        desc: uv(0x755),
        ability: df[uv(0x4b2)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: uv(0x4e9),
        desc: uv(0xbfe),
        type: cS[uv(0x785)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: uv(0xd3a),
        desc: uv(0x489),
        type: cS[uv(0x55c)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: uv(0x73a),
        desc: uv(0xc91),
        ability: df[uv(0xa46)],
        petHealF: 0x28,
      },
      {
        name: uv(0x5bd),
        desc: uv(0x7a0),
        ability: df[uv(0xd18)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: uv(0x7a2),
        type: cS[uv(0xe27)],
        desc: uv(0x5df),
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
        name: uv(0x464),
        desc: uv(0x450),
        type: cS[uv(0x60a)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: uv(0x30e),
        spawnTiers: [
          uv(0x6f5),
          uv(0x244),
          uv(0x244),
          uv(0xd22),
          uv(0xa13),
          uv(0x3ef),
          uv(0x3ef),
          uv(0x660),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: uv(0xa1b),
        desc: uv(0x245),
        type: cS[uv(0x6d6)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          uv(0xa9a)
        ]((r6) => r6 / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: uv(0x920),
        desc: uv(0x9eb),
        type: cS[uv(0x43d)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: uv(0x23b),
        desc: uv(0x788),
        type: cS[uv(0x4a2)],
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
        name: uv(0xc18),
        desc: uv(0x510),
        type: cS[uv(0x382)],
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
        name: uv(0x1b0),
        desc: uv(0xa0c),
        type: cS[uv(0x6d4)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: uv(0xc17),
        desc: uv(0x8c7),
        type: cS[uv(0x82d)],
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
        name: uv(0xc8d),
        desc: uv(0xac6),
        type: cS[uv(0x29f)],
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
        consumeProjType: cS[uv(0x405)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: uv(0x33e),
        desc: uv(0x135),
        type: cS[uv(0x613)],
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
        name: uv(0x6fe),
        desc: uv(0x759),
        type: cS[uv(0x9ee)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: uv(0xc21),
        spawnTiers: [
          uv(0xde7),
          uv(0xc5f),
          uv(0xc5f),
          uv(0x8e7),
          uv(0x7e9),
          uv(0xd79),
          uv(0x83e),
          uv(0x6c7),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: uv(0x95d), desc: uv(0x7aa), ability: df[uv(0x4a9)] },
      {
        name: uv(0x463),
        desc: uv(0xc0f),
        type: cS[uv(0x5a9)],
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
        name: uv(0x9cd),
        desc: uv(0x6b4),
        type: cS[uv(0x202)],
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
        name: uv(0x6bf),
        desc: uv(0x942),
        type: cS[uv(0xbc1)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: uv(0xa0d),
        desc: uv(0x70f),
        type: cS[uv(0x2ad)],
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
        name: uv(0xdd2),
        desc: uv(0x9e0),
        type: cS[uv(0xd60)],
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
        name: uv(0xe41),
        desc: uv(0xb4d),
        type: cS[uv(0x602)],
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
        spawn: uv(0xb2a),
        spawnTiers: [
          uv(0xc5b),
          uv(0x5e0),
          uv(0x5e0),
          uv(0x68b),
          uv(0x2a2),
          uv(0x5b0),
          uv(0x5b0),
          uv(0x7ca),
        ],
      },
      {
        name: uv(0x79a),
        desc: uv(0xa51),
        type: cS[uv(0xaa6)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: uv(0x900),
        desc: uv(0xa95),
        type: cS[uv(0xdef)],
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
        name: uv(0x50a),
        desc: uv(0x530),
        type: cS[uv(0xd90)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 2.5,
      },
      {
        name: uv(0x4d0),
        desc: uv(0xcbd),
        type: cS[uv(0x1cc)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dd((r6) => 0xa + r6 * 0x28),
      },
      {
        name: uv(0x68e),
        desc: uv(0x9de),
        type: cS[uv(0x364)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: uv(0x535),
        desc: uv(0xb9a),
        type: cS[uv(0xb45)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dd((r6) => 0x2 + Math[uv(0x423)](1.7 ** r6)),
      },
      {
        name: uv(0x548),
        desc: uv(0x32e),
        type: cS[uv(0x402)],
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
        name: uv(0x5b2),
        desc: uv(0xc63),
        type: cS[uv(0x848)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dd((r6) => 0.02 + r6 * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: uv(0x74f),
        desc: uv(0xe64),
        type: cS[uv(0x253)],
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
        spawn: uv(0x518),
        spawnTiers: [
          uv(0x518),
          uv(0x1ce),
          uv(0x9a0),
          uv(0xb23),
          uv(0xcba),
          uv(0x887),
          uv(0x887),
          uv(0x8df),
        ],
      },
      { name: uv(0xa58), desc: uv(0xc26), ability: df[uv(0x7b1)] },
      {
        name: uv(0x258),
        desc: uv(0x612),
        type: cS[uv(0x635)],
        size: 0x10,
        healthF: 0x14,
        damageF: 0xa,
        fixAngle: !![],
        isDice: !![],
        respawnTime: 0x640,
      },
    ];
    function dD(r6) {
      const uC = uv,
        r7 = r6 ? 0x1 : -0x1,
        r8 = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][uC(0xa9a)](
          (r9) => r9 * r7
        );
      return {
        name: r6 ? uC(0x9dc) : uC(0x2ce),
        desc:
          (r6 ? uC(0xda3) : uC(0x779)) +
          uC(0xbe8) +
          (r6 ? uC(0x79f) : "") +
          uC(0x4db),
        type: cS[r6 ? uC(0x43c) : uC(0x332)],
        size: 0x10,
        healthF: r6 ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: r8[0x0],
        mobSizeChangeTiers: r8[uC(0x7ce)](0x1),
      };
    }
    var dE = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dF = {},
      dG = dC[uv(0xd55)],
      dH = da[uv(0xd55)],
      dI = eP();
    for (let r6 = 0x0, r7 = dC[uv(0xd55)]; r6 < r7; r6++) {
      const r8 = dC[r6];
      (r8[uv(0xafc)] = !![]), (r8["id"] = r6);
      if (!r8[uv(0xd8e)]) r8[uv(0xd8e)] = r8[uv(0x46b)];
      dK(r8), (r8[uv(0xd3b)] = 0x0), (r8[uv(0xd91)] = r6);
      let r9 = r8;
      for (let ra = 0x1; ra < dH; ra++) {
        const rb = dO(r8);
        (rb[uv(0x2a3)] = r8[uv(0x2a3)] + ra),
          (rb[uv(0x46b)] = r8[uv(0x46b)] + "_" + rb[uv(0x2a3)]),
          (rb[uv(0xd3b)] = ra),
          (r9[uv(0x227)] = rb),
          (r9 = rb),
          dJ(r8, rb),
          dK(rb),
          (rb["id"] = dC[uv(0xd55)]),
          (dC[rb["id"]] = rb);
      }
    }
    function dJ(rc, rd) {
      const uD = uv,
        re = rd[uD(0x2a3)] - rc[uD(0x2a3)] - 0x1;
      for (let rf in rc) {
        const rg = rc[rf + uD(0xbd4)];
        Array[uD(0x328)](rg) && (rd[rf] = rg[re]);
      }
    }
    function dK(rc) {
      const uE = uv;
      dF[rc[uE(0x46b)]] = rc;
      for (let rd in di) {
        rc[rd] === void 0x0 && (rc[rd] = di[rd]);
      }
      rc[uE(0xc67)] === df[uE(0x544)] &&
        (rc[uE(0xe3b)] = cW[rc[uE(0x2a3)] + 0x1] / 0x64),
        (rc[uE(0x3cb)] =
          rc[uE(0x267)] > 0x0
            ? dg(rc[uE(0x2a3)], rc[uE(0x267)])
            : rc[uE(0x3cb)]),
        (rc[uE(0x657)] =
          rc[uE(0xdf6)] > 0x0
            ? dg(rc[uE(0x2a3)], rc[uE(0xdf6)])
            : rc[uE(0x657)]),
        (rc[uE(0x168)] = dg(rc[uE(0x2a3)], rc[uE(0xd52)])),
        (rc[uE(0x824)] = dg(rc[uE(0x2a3)], rc[uE(0xd17)])),
        (rc[uE(0xbb9)] = dg(rc[uE(0x2a3)], rc[uE(0xde0)])),
        (rc[uE(0x955)] = dg(rc[uE(0x2a3)], rc[uE(0x8b5)])),
        (rc[uE(0x840)] = dg(rc[uE(0x2a3)], rc[uE(0xd69)])),
        (rc[uE(0x48f)] = dg(rc[uE(0x2a3)], rc[uE(0xc1c)])),
        (rc[uE(0x10c)] = dg(rc[uE(0x2a3)], rc[uE(0xc14)])),
        (rc[uE(0xba4)] = dg(rc[uE(0x2a3)], rc[uE(0x173)])),
        rc[uE(0x2d0)] &&
          ((rc[uE(0x314)] = dg(rc[uE(0x2a3)], rc[uE(0x5fc)])),
          (rc[uE(0x3c2)] = dg(rc[uE(0x2a3)], rc[uE(0xd84)]))),
        rc[uE(0x931)] > 0x0
          ? (rc[uE(0xd93)] = dg(rc[uE(0x2a3)], rc[uE(0x931)]))
          : (rc[uE(0xd93)] = 0x0),
        (rc[uE(0x2a7)] = rc[uE(0x586)]
          ? dg(rc[uE(0x2a3)], rc[uE(0x4b0)])
          : 0x0),
        (rc[uE(0xb3d)] = rc[uE(0x3c8)]
          ? dg(rc[uE(0x2a3)], rc[uE(0xafa)])
          : 0x0),
        (rc[uE(0xd5b)] = dg(rc[uE(0x2a3)], rc[uE(0x45a)])),
        dI[rc[uE(0x2a3)]][uE(0xe68)](rc);
    }
    var dL = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dM = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dN = cV(uv(0xd61));
    function dO(rc) {
      const uF = uv;
      return JSON[uF(0x494)](JSON[uF(0x822)](rc));
    }
    const dP = {};
    (dP[uv(0x46b)] = uv(0x131)),
      (dP[uv(0x445)] = uv(0x46c)),
      (dP[uv(0x8fa)] = uv(0xac7)),
      (dP[uv(0x2a3)] = 0x0),
      (dP[uv(0x267)] = 0x64),
      (dP[uv(0xdf6)] = 0x1e),
      (dP[uv(0x5da)] = 0x32),
      (dP[uv(0x94c)] = dN[uv(0x4c2)]),
      (dP[uv(0x5cd)] = ![]),
      (dP[uv(0x1fe)] = !![]),
      (dP[uv(0x586)] = ![]),
      (dP[uv(0x4b0)] = 0x0),
      (dP[uv(0x2a7)] = 0x0),
      (dP[uv(0x45d)] = ![]),
      (dP[uv(0xbcb)] = ![]),
      (dP[uv(0x671)] = 0x1),
      (dP[uv(0x10f)] = cS[uv(0x233)]),
      (dP[uv(0x70e)] = 0x0),
      (dP[uv(0xba6)] = 0x0),
      (dP[uv(0x65b)] = 0.5),
      (dP[uv(0xc56)] = 0x0),
      (dP[uv(0xcdb)] = 0x1e),
      (dP[uv(0xae8)] = 0x0),
      (dP[uv(0x4ea)] = ![]),
      (dP[uv(0xafa)] = 0x0),
      (dP[uv(0xce5)] = 0x0),
      (dP[uv(0x4dd)] = 11.5),
      (dP[uv(0xa4d)] = 0x4),
      (dP[uv(0x894)] = !![]),
      (dP[uv(0xdf8)] = 0x0),
      (dP[uv(0x7f9)] = 0x0),
      (dP[uv(0x5e7)] = 0x1),
      (dP[uv(0x4f2)] = 0x0),
      (dP[uv(0xd87)] = 0x0),
      (dP[uv(0x7eb)] = 0x0),
      (dP[uv(0x4b1)] = 0x0),
      (dP[uv(0x1e6)] = 0x1);
    var dQ = dP;
    const dR = {};
    (dR[uv(0x46b)] = uv(0x433)),
      (dR[uv(0x445)] = uv(0x599)),
      (dR[uv(0x8fa)] = uv(0xbb1)),
      (dR[uv(0x267)] = 0x2ee),
      (dR[uv(0xdf6)] = 0xa),
      (dR[uv(0x5da)] = 0x32),
      (dR[uv(0x45d)] = !![]),
      (dR[uv(0xbcb)] = !![]),
      (dR[uv(0x671)] = 0.05),
      (dR[uv(0x4dd)] = 0x5),
      (dR[uv(0x400)] = !![]),
      (dR[uv(0xe63)] = [[uv(0x5f1), 0x3]]),
      (dR[uv(0x92e)] = [
        [uv(0x96c), 0x1],
        [uv(0x5f1), 0x2],
        [uv(0x7fb), 0x2],
        [uv(0xc0c), 0x1],
      ]),
      (dR[uv(0x934)] = [[uv(0x69f), "f"]]);
    const dS = {};
    (dS[uv(0x46b)] = uv(0x96c)),
      (dS[uv(0x445)] = uv(0xe24)),
      (dS[uv(0x8fa)] = uv(0x256)),
      (dS[uv(0x267)] = 0x1f4),
      (dS[uv(0xdf6)] = 0xa),
      (dS[uv(0x5da)] = 0x28),
      (dS[uv(0x400)] = !![]),
      (dS[uv(0x5cd)] = !![]),
      (dS[uv(0x934)] = [
        [uv(0x7d3), "E"],
        [uv(0x9dc), "G"],
        [uv(0x9b9), "A"],
      ]);
    const dT = {};
    (dT[uv(0x46b)] = uv(0x5f1)),
      (dT[uv(0x445)] = uv(0x5ee)),
      (dT[uv(0x8fa)] = uv(0x1c9)),
      (dT[uv(0x267)] = 0x64),
      (dT[uv(0xdf6)] = 0xa),
      (dT[uv(0x5da)] = 0x1c),
      (dT[uv(0x5cd)] = !![]),
      (dT[uv(0x934)] = [[uv(0x7d3), "I"]]);
    const dU = {};
    (dU[uv(0x46b)] = uv(0x7fb)),
      (dU[uv(0x445)] = uv(0xd48)),
      (dU[uv(0x8fa)] = uv(0x616)),
      (dU[uv(0x267)] = 62.5),
      (dU[uv(0xdf6)] = 0xa),
      (dU[uv(0x5da)] = 0x1c),
      (dU[uv(0x934)] = [[uv(0x782), "H"]]);
    const dV = {};
    (dV[uv(0x46b)] = uv(0xc0c)),
      (dV[uv(0x445)] = uv(0x6ab)),
      (dV[uv(0x8fa)] = uv(0x97a)),
      (dV[uv(0x267)] = 0x19),
      (dV[uv(0xdf6)] = 0xa),
      (dV[uv(0x5da)] = 0x19),
      (dV[uv(0x5cd)] = ![]),
      (dV[uv(0x1fe)] = ![]),
      (dV[uv(0x934)] = [
        [uv(0x48c), "F"],
        [uv(0x782), "F"],
        [uv(0x2ce), "G"],
        [uv(0xb6b), "F"],
      ]);
    var dW = [dR, dS, dT, dU, dV];
    function dX() {
      const uG = uv,
        rc = dO(dW);
      for (let rd = 0x0; rd < rc[uG(0xd55)]; rd++) {
        const re = rc[rd];
        (re[uG(0x8fa)] += uG(0x23b)),
          re[uG(0x46b)] === uG(0x433) &&
            (re[uG(0x934)] = [
              [uG(0xa9c), "D"],
              [uG(0x401), "E"],
            ]),
          (re[uG(0x46b)] = dY(re[uG(0x46b)])),
          (re[uG(0x445)] = dY(re[uG(0x445)])),
          (re[uG(0xdf6)] *= 0x2),
          re[uG(0xe63)] &&
            re[uG(0xe63)][uG(0x275)]((rf) => {
              return (rf[0x0] = dY(rf[0x0])), rf;
            }),
          re[uG(0x92e)] &&
            re[uG(0x92e)][uG(0x275)]((rf) => {
              return (rf[0x0] = dY(rf[0x0])), rf;
            });
      }
      return rc;
    }
    function dY(rc) {
      const uH = uv;
      return rc[uH(0xb02)](/Ant/g, uH(0xd71))[uH(0xb02)](/ant/g, uH(0xde2));
    }
    const dZ = {};
    (dZ[uv(0x46b)] = uv(0xcda)),
      (dZ[uv(0x445)] = uv(0x75c)),
      (dZ[uv(0x8fa)] = uv(0x5c5)),
      (dZ[uv(0x267)] = 37.5),
      (dZ[uv(0xdf6)] = 0x32),
      (dZ[uv(0x5da)] = 0x28),
      (dZ[uv(0x934)] = [
        [uv(0xe4d), "F"],
        [uv(0x123), "I"],
      ]),
      (dZ[uv(0xdf8)] = 0x4),
      (dZ[uv(0x7f9)] = 0x4);
    const e0 = {};
    (e0[uv(0x46b)] = uv(0x4fc)),
      (e0[uv(0x445)] = uv(0xac1)),
      (e0[uv(0x8fa)] = uv(0x7e6)),
      (e0[uv(0x267)] = 0x5e),
      (e0[uv(0xdf6)] = 0x5),
      (e0[uv(0x671)] = 0.05),
      (e0[uv(0x5da)] = 0x3c),
      (e0[uv(0x45d)] = !![]),
      (e0[uv(0x934)] = [[uv(0x4fc), "h"]]);
    const e1 = {};
    (e1[uv(0x46b)] = uv(0x518)),
      (e1[uv(0x445)] = uv(0x1df)),
      (e1[uv(0x8fa)] = uv(0x493)),
      (e1[uv(0x267)] = 0x4b),
      (e1[uv(0xdf6)] = 0xa),
      (e1[uv(0x671)] = 0.05),
      (e1[uv(0x45d)] = !![]),
      (e1[uv(0xa78)] = 1.25),
      (e1[uv(0x934)] = [
        [uv(0x518), "h"],
        [uv(0x143), "J"],
        [uv(0x74f), "K"],
      ]);
    const e2 = {};
    (e2[uv(0x46b)] = uv(0x843)),
      (e2[uv(0x445)] = uv(0x3ab)),
      (e2[uv(0x8fa)] = uv(0xc2e)),
      (e2[uv(0x267)] = 62.5),
      (e2[uv(0xdf6)] = 0x32),
      (e2[uv(0x5cd)] = !![]),
      (e2[uv(0x5da)] = 0x28),
      (e2[uv(0x934)] = [
        [uv(0xe30), "f"],
        [uv(0x46e), "I"],
        [uv(0xac9), "K"],
      ]),
      (e2[uv(0x10f)] = cS[uv(0x2fa)]),
      (e2[uv(0xba6)] = 0xa),
      (e2[uv(0x70e)] = 0x5),
      (e2[uv(0xcdb)] = 0x26),
      (e2[uv(0x65b)] = 0.375 / 1.1),
      (e2[uv(0xc56)] = 0.75),
      (e2[uv(0x94c)] = dN[uv(0xc2e)]);
    const e3 = {};
    (e3[uv(0x46b)] = uv(0x973)),
      (e3[uv(0x445)] = uv(0xaa0)),
      (e3[uv(0x8fa)] = uv(0x8e9)),
      (e3[uv(0x267)] = 87.5),
      (e3[uv(0xdf6)] = 0xa),
      (e3[uv(0x934)] = [
        [uv(0x48c), "f"],
        [uv(0xb1d), "f"],
      ]),
      (e3[uv(0xdf8)] = 0x5),
      (e3[uv(0x7f9)] = 0x5);
    const e4 = {};
    (e4[uv(0x46b)] = uv(0x36f)),
      (e4[uv(0x445)] = uv(0x87b)),
      (e4[uv(0x8fa)] = uv(0xac7)),
      (e4[uv(0x267)] = 0x64),
      (e4[uv(0xdf6)] = 0x1e),
      (e4[uv(0x5cd)] = !![]),
      (e4[uv(0x934)] = [[uv(0xda8), "F"]]),
      (e4[uv(0xdf8)] = 0x5),
      (e4[uv(0x7f9)] = 0x5);
    const e5 = {};
    (e5[uv(0x46b)] = uv(0xb2a)),
      (e5[uv(0x445)] = uv(0x376)),
      (e5[uv(0x8fa)] = uv(0x473)),
      (e5[uv(0x267)] = 62.5),
      (e5[uv(0xdf6)] = 0xf),
      (e5[uv(0x586)] = !![]),
      (e5[uv(0x4b0)] = 0xf),
      (e5[uv(0x5da)] = 0x23),
      (e5[uv(0x5cd)] = !![]),
      (e5[uv(0x934)] = [
        [uv(0x457), "F"],
        [uv(0xe6b), "F"],
        [uv(0x5fd), "L"],
        [uv(0x8ea), "G"],
      ]);
    const e6 = {};
    (e6[uv(0x46b)] = uv(0xded)),
      (e6[uv(0x445)] = uv(0x954)),
      (e6[uv(0x8fa)] = uv(0xc80)),
      (e6[uv(0x267)] = 0x64),
      (e6[uv(0xdf6)] = 0xf),
      (e6[uv(0x586)] = !![]),
      (e6[uv(0x4b0)] = 0xa),
      (e6[uv(0x5da)] = 0x2f),
      (e6[uv(0x5cd)] = !![]),
      (e6[uv(0x934)] = [
        [uv(0xa50), "F"],
        [uv(0xb04), "F"],
      ]),
      (e6[uv(0x10f)] = cS[uv(0x398)]),
      (e6[uv(0xba6)] = 0x3),
      (e6[uv(0x70e)] = 0x5),
      (e6[uv(0xae8)] = 0x7),
      (e6[uv(0xcdb)] = 0x2b),
      (e6[uv(0x65b)] = 0.21),
      (e6[uv(0xc56)] = -0.31),
      (e6[uv(0x94c)] = dN[uv(0xca3)]);
    const e7 = {};
    (e7[uv(0x46b)] = uv(0xc3d)),
      (e7[uv(0x445)] = uv(0x13b)),
      (e7[uv(0x8fa)] = uv(0xba5)),
      (e7[uv(0x267)] = 0x15e),
      (e7[uv(0xdf6)] = 0x28),
      (e7[uv(0x5da)] = 0x2d),
      (e7[uv(0x5cd)] = !![]),
      (e7[uv(0x400)] = !![]),
      (e7[uv(0x934)] = [
        [uv(0x1b8), "F"],
        [uv(0xd20), "G"],
        [uv(0x9ce), "H"],
        [uv(0x2cb), "J"],
      ]);
    const e8 = {};
    (e8[uv(0x46b)] = uv(0x286)),
      (e8[uv(0x445)] = uv(0x86d)),
      (e8[uv(0x8fa)] = uv(0xb95)),
      (e8[uv(0x267)] = 0x7d),
      (e8[uv(0xdf6)] = 0x19),
      (e8[uv(0x5cd)] = !![]),
      (e8[uv(0x4ea)] = !![]),
      (e8[uv(0xafa)] = 0x5),
      (e8[uv(0xce5)] = 0x2),
      (e8[uv(0x585)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e8[uv(0xa4d)] = 0x4),
      (e8[uv(0x4dd)] = 0x6),
      (e8[uv(0x934)] = [[uv(0x814), "F"]]);
    const e9 = {};
    (e9[uv(0x46b)] = uv(0xc3f)),
      (e9[uv(0x445)] = uv(0x9c7)),
      (e9[uv(0x8fa)] = uv(0x594)),
      (e9[uv(0x267)] = 0.5),
      (e9[uv(0xdf6)] = 0x5),
      (e9[uv(0x5cd)] = ![]),
      (e9[uv(0x1fe)] = ![]),
      (e9[uv(0xa4d)] = 0x1),
      (e9[uv(0x934)] = [[uv(0xc3f), "F"]]);
    const ea = {};
    (ea[uv(0x46b)] = uv(0x395)),
      (ea[uv(0x445)] = uv(0xe12)),
      (ea[uv(0x8fa)] = uv(0x163)),
      (ea[uv(0x267)] = 0x19),
      (ea[uv(0xdf6)] = 0xa),
      (ea[uv(0x5da)] = 0x28),
      (ea[uv(0x28f)] = cS[uv(0x1f8)]),
      (ea[uv(0x934)] = [
        [uv(0x782), "J"],
        [uv(0x963), "J"],
      ]);
    const eb = {};
    (eb[uv(0x46b)] = uv(0x27c)),
      (eb[uv(0x445)] = uv(0xab5)),
      (eb[uv(0x8fa)] = uv(0xa9d)),
      (eb[uv(0x267)] = 0x19),
      (eb[uv(0xdf6)] = 0xa),
      (eb[uv(0x5da)] = 0x28),
      (eb[uv(0x28f)] = cS[uv(0x290)]),
      (eb[uv(0x5cd)] = !![]),
      (eb[uv(0x934)] = [
        [uv(0xa50), "J"],
        [uv(0x85d), "J"],
      ]);
    const ec = {};
    (ec[uv(0x46b)] = uv(0x8d8)),
      (ec[uv(0x445)] = uv(0x420)),
      (ec[uv(0x8fa)] = uv(0xc20)),
      (ec[uv(0x267)] = 0x19),
      (ec[uv(0xdf6)] = 0xa),
      (ec[uv(0x5da)] = 0x28),
      (ec[uv(0x28f)] = cS[uv(0xa65)]),
      (ec[uv(0x1fe)] = ![]),
      (ec[uv(0x934)] = [
        [uv(0x2a5), "J"],
        [uv(0x904), "H"],
        [uv(0x2b9), "J"],
      ]),
      (ec[uv(0xa4d)] = 0x17),
      (ec[uv(0x4dd)] = 0x17 * 0.75);
    const ed = {};
    (ed[uv(0x46b)] = uv(0x8e5)),
      (ed[uv(0x445)] = uv(0xc01)),
      (ed[uv(0x8fa)] = uv(0x909)),
      (ed[uv(0x267)] = 87.5),
      (ed[uv(0xdf6)] = 0xa),
      (ed[uv(0x934)] = [
        [uv(0x98f), "F"],
        [uv(0x1d5), "I"],
      ]),
      (ed[uv(0xdf8)] = 0x5),
      (ed[uv(0x7f9)] = 0x5);
    const ee = {};
    (ee[uv(0x46b)] = uv(0xe1f)),
      (ee[uv(0x445)] = uv(0xd07)),
      (ee[uv(0x8fa)] = uv(0xe57)),
      (ee[uv(0x267)] = 87.5),
      (ee[uv(0xdf6)] = 0xa),
      (ee[uv(0x934)] = [
        [uv(0xb1d), "A"],
        [uv(0x98f), "A"],
      ]),
      (ee[uv(0xdf8)] = 0x5),
      (ee[uv(0x7f9)] = 0x5);
    const ef = {};
    (ef[uv(0x46b)] = uv(0xb8c)),
      (ef[uv(0x445)] = uv(0x7f7)),
      (ef[uv(0x8fa)] = uv(0x63b)),
      (ef[uv(0x267)] = 0x32),
      (ef[uv(0xdf6)] = 0xa),
      (ef[uv(0x671)] = 0.05),
      (ef[uv(0x5da)] = 0x3c),
      (ef[uv(0x45d)] = !![]),
      (ef[uv(0x934)] = [
        [uv(0x5c8), "E"],
        [uv(0xa1b), "F"],
        [uv(0x33e), "F"],
      ]);
    const eg = {};
    (eg[uv(0x46b)] = uv(0x862)),
      (eg[uv(0x445)] = uv(0x928)),
      (eg[uv(0x8fa)] = uv(0x8d7)),
      (eg[uv(0x267)] = 0x7d),
      (eg[uv(0xdf6)] = 0x28),
      (eg[uv(0x5da)] = 0x32),
      (eg[uv(0x5cd)] = ![]),
      (eg[uv(0x1fe)] = ![]),
      (eg[uv(0x94c)] = dN[uv(0x8d7)]),
      (eg[uv(0xa4d)] = 0xe),
      (eg[uv(0x4dd)] = 0xb),
      (eg[uv(0x5e7)] = 2.2),
      (eg[uv(0x934)] = [
        [uv(0xe00), "J"],
        [uv(0x2a5), "H"],
      ]);
    const eh = {};
    (eh[uv(0x46b)] = uv(0xc84)),
      (eh[uv(0x445)] = uv(0xc2d)),
      (eh[uv(0x8fa)] = uv(0x280)),
      (eh[uv(0x267)] = 0x7d),
      (eh[uv(0xdf6)] = 0x28),
      (eh[uv(0x5da)] = null),
      (eh[uv(0x5cd)] = !![]),
      (eh[uv(0xbe1)] = !![]),
      (eh[uv(0x934)] = [
        [uv(0x5ed), "D"],
        [uv(0xb5e), "E"],
        [uv(0xc8d), "E"],
      ]),
      (eh[uv(0x5da)] = 0x32),
      (eh[uv(0x3aa)] = 0x32),
      (eh[uv(0xa7a)] = !![]),
      (eh[uv(0x4f2)] = -Math["PI"] / 0x2),
      (eh[uv(0x10f)] = cS[uv(0x405)]),
      (eh[uv(0xba6)] = 0x3),
      (eh[uv(0x70e)] = 0x3),
      (eh[uv(0xcdb)] = 0x21),
      (eh[uv(0x65b)] = 0.32),
      (eh[uv(0xc56)] = 0.4),
      (eh[uv(0x94c)] = dN[uv(0xc2e)]);
    const ei = {};
    (ei[uv(0x46b)] = uv(0xdde)),
      (ei[uv(0x445)] = uv(0xe43)),
      (ei[uv(0x8fa)] = uv(0x99c)),
      (ei[uv(0x267)] = 0x96),
      (ei[uv(0xdf6)] = 0x14),
      (ei[uv(0x5cd)] = !![]),
      (ei[uv(0xd87)] = 0.5),
      (ei[uv(0x934)] = [
        [uv(0xdde), "D"],
        [uv(0x904), "J"],
        [uv(0x2a5), "J"],
      ]);
    const ej = {};
    (ej[uv(0x46b)] = uv(0x36c)),
      (ej[uv(0x445)] = uv(0x6ac)),
      (ej[uv(0x8fa)] = uv(0xa08)),
      (ej[uv(0x267)] = 0x19),
      (ej[uv(0xdf6)] = 0xf),
      (ej[uv(0x671)] = 0.05),
      (ej[uv(0x5da)] = 0x37),
      (ej[uv(0x45d)] = !![]),
      (ej[uv(0x934)] = [[uv(0x36c), "h"]]),
      (ej[uv(0x10f)] = cS[uv(0xb00)]),
      (ej[uv(0x7eb)] = 0x9),
      (ej[uv(0xcdb)] = 0x28),
      (ej[uv(0xba6)] = 0xf),
      (ej[uv(0x70e)] = 2.5),
      (ej[uv(0xcdb)] = 0x21),
      (ej[uv(0x65b)] = 0.32),
      (ej[uv(0xc56)] = 1.8),
      (ej[uv(0x4b1)] = 0x14);
    const ek = {};
    (ek[uv(0x46b)] = uv(0x1a4)),
      (ek[uv(0x445)] = uv(0xa2b)),
      (ek[uv(0x8fa)] = uv(0xa28)),
      (ek[uv(0x267)] = 0xe1),
      (ek[uv(0xdf6)] = 0xa),
      (ek[uv(0x5da)] = 0x32),
      (ek[uv(0x934)] = [
        [uv(0x1a4), "H"],
        [uv(0xa9c), "L"],
      ]),
      (ek[uv(0xbe1)] = !![]),
      (ek[uv(0xae4)] = !![]),
      (ek[uv(0x4dd)] = 0x23);
    const em = {};
    (em[uv(0x46b)] = uv(0xb85)),
      (em[uv(0x445)] = uv(0x798)),
      (em[uv(0x8fa)] = uv(0xddc)),
      (em[uv(0x267)] = 0x96),
      (em[uv(0xdf6)] = 0x19),
      (em[uv(0x5da)] = 0x2f),
      (em[uv(0x5cd)] = !![]),
      (em[uv(0x934)] = [[uv(0x2a5), "J"]]),
      (em[uv(0x10f)] = null),
      (em[uv(0x94c)] = dN[uv(0xca3)]);
    const en = {};
    (en[uv(0x46b)] = uv(0xbed)),
      (en[uv(0x445)] = uv(0xcfe)),
      (en[uv(0x8fa)] = uv(0xcff)),
      (en[uv(0x267)] = 0x64),
      (en[uv(0xdf6)] = 0x1e),
      (en[uv(0x5da)] = 0x1e),
      (en[uv(0x5cd)] = !![]),
      (en[uv(0x4da)] = uv(0x401)),
      (en[uv(0x934)] = [
        [uv(0x401), "F"],
        [uv(0x8ea), "E"],
        [uv(0x7a2), "D"],
        [uv(0xa58), "E"],
      ]);
    const eo = {};
    (eo[uv(0x46b)] = uv(0x4e9)),
      (eo[uv(0x445)] = uv(0xb7f)),
      (eo[uv(0x8fa)] = uv(0x429)),
      (eo[uv(0x267)] = 0x64),
      (eo[uv(0xdf6)] = 0xa),
      (eo[uv(0x5da)] = 0x3c),
      (eo[uv(0x45d)] = !![]),
      (eo[uv(0x671)] = 0.05),
      (eo[uv(0x934)] = [[uv(0x4e9), "D"]]);
    const ep = {};
    (ep[uv(0x46b)] = uv(0x1bd)),
      (ep[uv(0x445)] = uv(0xbdc)),
      (ep[uv(0x8fa)] = uv(0x4ab)),
      (ep[uv(0x267)] = 0x64),
      (ep[uv(0xdf6)] = 0x23),
      (ep[uv(0x5cd)] = !![]),
      (ep[uv(0x934)] = [
        [uv(0xd3a), "E"],
        [uv(0xa0d), "D"],
      ]);
    const eq = {};
    (eq[uv(0x46b)] = uv(0x520)),
      (eq[uv(0x445)] = uv(0x688)),
      (eq[uv(0x8fa)] = uv(0x7f2)),
      (eq[uv(0x267)] = 0xc8),
      (eq[uv(0xdf6)] = 0x23),
      (eq[uv(0x5da)] = 0x23),
      (eq[uv(0x5cd)] = !![]),
      (eq[uv(0x7f9)] = 0x5),
      (eq[uv(0x934)] = [
        [uv(0x73a), "F"],
        [uv(0x5bd), "D"],
        [uv(0x6bf), "E"],
      ]);
    const er = {};
    (er[uv(0x46b)] = uv(0x30e)),
      (er[uv(0x445)] = uv(0x674)),
      (er[uv(0x8fa)] = uv(0x697)),
      (er[uv(0x267)] = 0xc8),
      (er[uv(0xdf6)] = 0x14),
      (er[uv(0x5da)] = 0x28),
      (er[uv(0x5cd)] = !![]),
      (er[uv(0x934)] = [
        [uv(0x464), "E"],
        [uv(0x920), "D"],
        [uv(0x23b), "F"],
        [uv(0xc18), "F"],
      ]),
      (er[uv(0xce4)] = !![]),
      (er[uv(0x1ab)] = 0xbb8),
      (er[uv(0x87e)] = 0.3);
    const es = {};
    (es[uv(0x46b)] = uv(0x1b0)),
      (es[uv(0x445)] = uv(0x58f)),
      (es[uv(0x8fa)] = uv(0x3f4)),
      (es[uv(0x267)] = 0x78),
      (es[uv(0xdf6)] = 0x1e),
      (es[uv(0xae4)] = !![]),
      (es[uv(0x4dd)] = 0xf),
      (es[uv(0xa4d)] = 0x5),
      (es[uv(0x934)] = [
        [uv(0x1b0), "F"],
        [uv(0xc17), "E"],
        [uv(0x9cd), "D"],
      ]),
      (es[uv(0x7f9)] = 0x3);
    const et = {};
    (et[uv(0x46b)] = uv(0x6fe)),
      (et[uv(0x445)] = uv(0xb56)),
      (et[uv(0x8fa)] = uv(0x895)),
      (et[uv(0x267)] = 0x78),
      (et[uv(0xdf6)] = 0x23),
      (et[uv(0x5da)] = 0x32),
      (et[uv(0x5cd)] = !![]),
      (et[uv(0x941)] = !![]),
      (et[uv(0x934)] = [
        [uv(0x6fe), "E"],
        [uv(0x33e), "F"],
      ]),
      (et[uv(0xe63)] = [[uv(0xc21), 0x1]]),
      (et[uv(0x92e)] = [[uv(0xc21), 0x2]]),
      (et[uv(0xaab)] = !![]);
    const eu = {};
    (eu[uv(0x46b)] = uv(0xc21)),
      (eu[uv(0x445)] = uv(0x868)),
      (eu[uv(0x8fa)] = uv(0x748)),
      (eu[uv(0x267)] = 0x96),
      (eu[uv(0xdf6)] = 0.1),
      (eu[uv(0x5da)] = 0x28),
      (eu[uv(0xa4d)] = 0xe),
      (eu[uv(0x4dd)] = 11.6),
      (eu[uv(0x5cd)] = !![]),
      (eu[uv(0x941)] = !![]),
      (eu[uv(0x89f)] = !![]),
      (eu[uv(0x94c)] = dN[uv(0x8d7)]),
      (eu[uv(0x662)] = 0xa),
      (eu[uv(0x934)] = [[uv(0x95d), "G"]]),
      (eu[uv(0x1e6)] = 0.5);
    const ev = {};
    (ev[uv(0x46b)] = uv(0x9d0)),
      (ev[uv(0x445)] = uv(0x2c7)),
      (ev[uv(0x8fa)] = uv(0x4af)),
      (ev[uv(0x267)] = 0x1f4),
      (ev[uv(0xdf6)] = 0x28),
      (ev[uv(0x671)] = 0.05),
      (ev[uv(0x5da)] = 0x32),
      (ev[uv(0x45d)] = !![]),
      (ev[uv(0x4dd)] = 0x5),
      (ev[uv(0xbcb)] = !![]),
      (ev[uv(0x400)] = !![]),
      (ev[uv(0x934)] = [
        [uv(0x463), "F"],
        [uv(0xac9), "C"],
      ]),
      (ev[uv(0xe63)] = [
        [uv(0xcda), 0x2],
        [uv(0x843), 0x1],
      ]),
      (ev[uv(0x92e)] = [
        [uv(0xcda), 0x4],
        [uv(0x843), 0x2],
      ]);
    const ew = {};
    (ew[uv(0x46b)] = uv(0xdd2)),
      (ew[uv(0x445)] = uv(0xd1e)),
      (ew[uv(0x8fa)] = uv(0x907)),
      (ew[uv(0x267)] = 0x50),
      (ew[uv(0xdf6)] = 0x28),
      (ew[uv(0xa4d)] = 0x2),
      (ew[uv(0x4dd)] = 0x6),
      (ew[uv(0xbe1)] = !![]),
      (ew[uv(0x934)] = [[uv(0xdd2), "F"]]);
    const ex = {};
    (ex[uv(0x46b)] = uv(0x66c)),
      (ex[uv(0x445)] = uv(0xd78)),
      (ex[uv(0x8fa)] = uv(0x8cf)),
      (ex[uv(0x267)] = 0x1f4),
      (ex[uv(0xdf6)] = 0x28),
      (ex[uv(0x671)] = 0.05),
      (ex[uv(0x5da)] = 0x46),
      (ex[uv(0x4dd)] = 0x5),
      (ex[uv(0x45d)] = !![]),
      (ex[uv(0xbcb)] = !![]),
      (ex[uv(0x400)] = !![]),
      (ex[uv(0x934)] = [
        [uv(0xe41), "A"],
        [uv(0xe6b), "E"],
      ]),
      (ex[uv(0xe63)] = [[uv(0xb2a), 0x2]]),
      (ex[uv(0x92e)] = [
        [uv(0xb2a), 0x3],
        [uv(0xbed), 0x2],
      ]);
    const ey = {};
    (ey[uv(0x46b)] = uv(0x639)),
      (ey[uv(0x445)] = uv(0xe0b)),
      (ey[uv(0x8fa)] = uv(0xd54)),
      (ey[uv(0x5da)] = 0x28),
      (ey[uv(0x267)] = 0x64),
      (ey[uv(0xdf6)] = 0xa),
      (ey[uv(0x671)] = 0.05),
      (ey[uv(0x45d)] = !![]),
      (ey[uv(0xdf8)] = 0x1),
      (ey[uv(0x7f9)] = 0x1),
      (ey[uv(0x934)] = [
        [uv(0x5bd), "G"],
        [uv(0x904), "F"],
        [uv(0x79a), "F"],
      ]);
    const ez = {};
    (ez[uv(0x46b)] = uv(0x414)),
      (ez[uv(0x445)] = uv(0x7a9)),
      (ez[uv(0x8fa)] = uv(0x9bf)),
      (ez[uv(0x267)] = 0x3c),
      (ez[uv(0xdf6)] = 0x28),
      (ez[uv(0x5da)] = 0x32),
      (ez[uv(0x5cd)] = ![]),
      (ez[uv(0x1fe)] = ![]),
      (ez[uv(0x94c)] = dN[uv(0x8d7)]),
      (ez[uv(0xa4d)] = 0xe),
      (ez[uv(0x4dd)] = 0xb),
      (ez[uv(0x5e7)] = 2.2),
      (ez[uv(0x934)] = [
        [uv(0xa0d), "E"],
        [uv(0x2a5), "J"],
      ]);
    const eA = {};
    (eA[uv(0x46b)] = uv(0x6aa)),
      (eA[uv(0x445)] = uv(0xb20)),
      (eA[uv(0x8fa)] = uv(0x8f1)),
      (eA[uv(0x267)] = 0x258),
      (eA[uv(0xdf6)] = 0x32),
      (eA[uv(0x671)] = 0.05),
      (eA[uv(0x5da)] = 0x3c),
      (eA[uv(0x4dd)] = 0x7),
      (eA[uv(0x400)] = !![]),
      (eA[uv(0x45d)] = !![]),
      (eA[uv(0xbcb)] = !![]),
      (eA[uv(0x934)] = [
        [uv(0x464), "A"],
        [uv(0xe00), "G"],
      ]),
      (eA[uv(0xe63)] = [[uv(0x30e), 0x1]]),
      (eA[uv(0x92e)] = [[uv(0x30e), 0x1]]);
    const eB = {};
    (eB[uv(0x46b)] = uv(0xb88)),
      (eB[uv(0x445)] = uv(0x9e7)),
      (eB[uv(0x8fa)] = uv(0x3dc)),
      (eB[uv(0x267)] = 0xc8),
      (eB[uv(0xdf6)] = 0x1e),
      (eB[uv(0x5da)] = 0x2d),
      (eB[uv(0x5cd)] = !![]),
      (eB[uv(0x934)] = [
        [uv(0x1b8), "G"],
        [uv(0xd20), "H"],
        [uv(0x9cd), "E"],
      ]);
    const eC = {};
    (eC[uv(0x46b)] = uv(0xd51)),
      (eC[uv(0x445)] = uv(0xd70)),
      (eC[uv(0x8fa)] = uv(0x28c)),
      (eC[uv(0x267)] = 0x3c),
      (eC[uv(0xdf6)] = 0x64),
      (eC[uv(0x5da)] = 0x28),
      (eC[uv(0x8b6)] = !![]),
      (eC[uv(0x894)] = ![]),
      (eC[uv(0x5cd)] = !![]),
      (eC[uv(0x934)] = [
        [uv(0x920), "F"],
        [uv(0x782), "D"],
        [uv(0x900), "G"],
      ]);
    const eD = {};
    (eD[uv(0x46b)] = uv(0x50a)),
      (eD[uv(0x445)] = uv(0x982)),
      (eD[uv(0x8fa)] = uv(0x75f)),
      (eD[uv(0x5da)] = 0x28),
      (eD[uv(0x267)] = 0x5a),
      (eD[uv(0xdf6)] = 0x5),
      (eD[uv(0x671)] = 0.05),
      (eD[uv(0x45d)] = !![]),
      (eD[uv(0x934)] = [[uv(0x50a), "h"]]);
    const eE = {};
    (eE[uv(0x46b)] = uv(0x4d0)),
      (eE[uv(0x445)] = uv(0x5ac)),
      (eE[uv(0x8fa)] = uv(0x5c9)),
      (eE[uv(0x267)] = 0x32),
      (eE[uv(0xdf6)] = 0x14),
      (eE[uv(0x5da)] = 0x28),
      (eE[uv(0xbe1)] = !![]),
      (eE[uv(0x934)] = [[uv(0x4d0), "F"]]);
    const eF = {};
    (eF[uv(0x46b)] = uv(0x68e)),
      (eF[uv(0x445)] = uv(0xe61)),
      (eF[uv(0x8fa)] = uv(0x4cf)),
      (eF[uv(0x267)] = 0x32),
      (eF[uv(0xdf6)] = 0x14),
      (eF[uv(0x671)] = 0.05),
      (eF[uv(0x45d)] = !![]),
      (eF[uv(0x934)] = [[uv(0x68e), "J"]]);
    const eG = {};
    (eG[uv(0x46b)] = uv(0x298)),
      (eG[uv(0x445)] = uv(0xa60)),
      (eG[uv(0x8fa)] = uv(0x875)),
      (eG[uv(0x267)] = 0x64),
      (eG[uv(0xdf6)] = 0x1e),
      (eG[uv(0x671)] = 0.05),
      (eG[uv(0x5da)] = 0x32),
      (eG[uv(0x45d)] = !![]),
      (eG[uv(0x934)] = [
        [uv(0x920), "D"],
        [uv(0x535), "E"],
      ]);
    const eH = {};
    (eH[uv(0x46b)] = uv(0x19e)),
      (eH[uv(0x445)] = uv(0xb41)),
      (eH[uv(0x8fa)] = uv(0x6fd)),
      (eH[uv(0x267)] = 0x96),
      (eH[uv(0xdf6)] = 0x14),
      (eH[uv(0x5da)] = 0x28),
      (eH[uv(0x934)] = [
        [uv(0x548), "D"],
        [uv(0xc17), "F"],
      ]),
      (eH[uv(0x92e)] = [[uv(0xc0c), 0x1, 0.3]]);
    const eI = {};
    (eI[uv(0x46b)] = uv(0x5b2)),
      (eI[uv(0x445)] = uv(0x495)),
      (eI[uv(0x8fa)] = uv(0xcb0)),
      (eI[uv(0x267)] = 0x32),
      (eI[uv(0xdf6)] = 0x5),
      (eI[uv(0x671)] = 0.05),
      (eI[uv(0x45d)] = !![]),
      (eI[uv(0x934)] = [
        [uv(0x5b2), "h"],
        [uv(0x782), "J"],
      ]);
    const eJ = {};
    (eJ[uv(0x46b)] = uv(0x258)),
      (eJ[uv(0x445)] = uv(0x310)),
      (eJ[uv(0x8fa)] = uv(0xb43)),
      (eJ[uv(0x267)] = 0x64),
      (eJ[uv(0xdf6)] = 0x5),
      (eJ[uv(0x671)] = 0.05),
      (eJ[uv(0x45d)] = !![]),
      (eJ[uv(0x934)] = [[uv(0x258), "h"]]);
    var eK = [
        dZ,
        e0,
        e1,
        e2,
        e3,
        ...dW,
        ...dX(),
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
        eJ,
      ],
      eL = eK[uv(0xd55)],
      eM = {},
      eN = [],
      eO = eP();
    function eP() {
      const rc = [];
      for (let rd = 0x0; rd < dH; rd++) {
        rc[rd] = [];
      }
      return rc;
    }
    for (let rc = 0x0; rc < eL; rc++) {
      const rd = eK[rc];
      for (let re in dQ) {
        rd[re] === void 0x0 && (rd[re] = dQ[re]);
      }
      (eN[rc] = [rd]), (rd[uv(0x8fa)] = cS[rd[uv(0x8fa)]]), eR(rd);
      rd[uv(0x934)] &&
        rd[uv(0x934)][uv(0x275)]((rf) => {
          const uI = uv;
          rf[0x1] = rf[0x1][uI(0xc0e)]()[uI(0x851)](0x0) - 0x41;
        });
      (rd["id"] = rc), (rd[uv(0xd91)] = rc);
      if (!rd[uv(0xd8e)]) rd[uv(0xd8e)] = rd[uv(0x46b)];
      for (let rf = 0x1; rf <= db; rf++) {
        const rg = JSON[uv(0x494)](JSON[uv(0x822)](rd));
        (rg[uv(0x46b)] = rd[uv(0x46b)] + "_" + rf),
          (rg[uv(0x2a3)] = rf),
          (eN[rc][rf] = rg),
          dJ(rd, rg),
          eR(rg),
          (rg["id"] = eK[uv(0xd55)]),
          eK[uv(0xe68)](rg);
      }
    }
    for (let rh = 0x0; rh < eK[uv(0xd55)]; rh++) {
      const ri = eK[rh];
      ri[uv(0xe63)] && eQ(ri, ri[uv(0xe63)]),
        ri[uv(0x92e)] && eQ(ri, ri[uv(0x92e)]);
    }
    function eQ(rj, rk) {
      const uJ = uv;
      rk[uJ(0x275)]((rl) => {
        const uK = uJ,
          rm = rl[0x0] + (rj[uK(0x2a3)] > 0x0 ? "_" + rj[uK(0x2a3)] : "");
        rl[0x0] = eM[rm];
      });
    }
    function eR(rj) {
      const uL = uv;
      (rj[uL(0x3cb)] = dg(rj[uL(0x2a3)], rj[uL(0x267)]) * dL[rj[uL(0x2a3)]]),
        (rj[uL(0x657)] = dg(rj[uL(0x2a3)], rj[uL(0xdf6)])),
        rj[uL(0xa7a)]
          ? (rj[uL(0x3aa)] = rj[uL(0x5da)])
          : (rj[uL(0x3aa)] = rj[uL(0x5da)] * dM[rj[uL(0x2a3)]]),
        (rj[uL(0x2a7)] = dg(rj[uL(0x2a3)], rj[uL(0x4b0)])),
        (rj[uL(0x1d0)] = dg(rj[uL(0x2a3)], rj[uL(0xba6)])),
        (rj[uL(0xc8b)] = dg(rj[uL(0x2a3)], rj[uL(0x70e)]) * dL[rj[uL(0x2a3)]]),
        (rj[uL(0x695)] = dg(rj[uL(0x2a3)], rj[uL(0xae8)])),
        rj[uL(0x87e)] && (rj[uL(0x1ef)] = dg(rj[uL(0x2a3)], rj[uL(0x87e)])),
        (rj[uL(0xb3d)] = dg(rj[uL(0x2a3)], rj[uL(0xafa)])),
        (eM[rj[uL(0x46b)]] = rj),
        eO[rj[uL(0x2a3)]][uL(0xe68)](rj);
    }
    function eS(rj) {
      return (rj / 0xff) * Math["PI"] * 0x2;
    }
    var eT = Math["PI"] * 0x2;
    function eU(rj) {
      const uM = uv;
      return (
        (rj %= eT), rj < 0x0 && (rj += eT), Math[uM(0x423)]((rj / eT) * 0xff)
      );
    }
    function eV(rj) {
      const uN = uv;
      if (!rj || rj[uN(0xd55)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        uN(0x3e6)
      ](rj);
    }
    function eW(rj, rk) {
      return dF[rj + (rk > 0x0 ? "_" + rk : "")];
    }
    var eX = da[uv(0xa9a)]((rj) => rj[uv(0x545)]() + uv(0x93b)),
      eY = da[uv(0xa9a)]((rj) => uv(0x3f5) + rj + uv(0x334)),
      eZ = {};
    eX[uv(0x275)]((rj) => {
      eZ[rj] = 0x0;
    });
    var f0 = {};
    eY[uv(0x275)]((rj) => {
      f0[rj] = 0x0;
    });
    var f1 = 0x1 / 0x3e8 / 0x3c / 0x3c;
    function f2() {
      const uO = uv;
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
        timeJoined: Date[uO(0xd3f)]() * f1,
      };
    }
    var f3 = uv(0x486)[uv(0xaa2)]("\x20");
    function f4(rj) {
      const rk = {};
      for (let rl in rj) {
        rk[rj[rl]] = rl;
      }
      return rk;
    }
    var f5 = [
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
    for (let rj = 0x0; rj < f5[uv(0xd55)]; rj++) {
      const rk = f5[rj],
        rl = rk[rk[uv(0xd55)] - 0x1],
        rm = dO(rl);
      for (let rn = 0x0; rn < rm[uv(0xd55)]; rn++) {
        const ro = rm[rn];
        if (ro[0x0] < 0x1e) {
          let rp = ro[0x0];
          (rp *= 1.5),
            rp < 1.5 && (rp *= 0xa),
            (rp = parseFloat(rp[uv(0x165)](0x3))),
            (ro[0x0] = rp);
        }
        ro[0x1] = d9[uv(0xadc)];
      }
      rm[uv(0xe68)]([0.01, d9[uv(0x2ca)]]), rk[uv(0xe68)](rm);
    }
    var f6 = [
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
    function f7(rq, rr) {
      var rs = Math["PI"] * 0x2,
        rt = (rr - rq) % rs;
      return ((0x2 * rt) % rs) - rt;
    }
    function f8(rq, rr, rs) {
      return rq + f7(rq, rr) * rs;
    }
    var f9 = {
      instagram: uv(0x871),
      discord: uv(0x6ae),
      paw: uv(0x16d),
      gear: uv(0xa5f),
      scroll: uv(0x1c3),
      bag: uv(0xa1f),
      food: uv(0xba3),
      graph: uv(0x409),
      resize: uv(0x598),
      users: uv(0xe72),
      trophy: uv(0xcd8),
      shop: uv(0x54b),
      dice: uv(0x231),
      data: uv(0x24d),
      poopPath: new Path2D(uv(0x5ae)),
    };
    function fa(rq) {
      const uP = uv;
      return rq[uP(0xb02)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fb(rq) {
      const uQ = uv;
      if(hack.isEnabled('disableChatCheck')) return rq;
      return (
        (rq = fa(rq)),
        (rq = rq[uQ(0xb02)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uQ(0xb02)](/(.)\1{2,}/gi, "$1")
          [uQ(0xb02)](/\u200B|\u200C|\u200D/g, "")
          [uQ(0x810)]()),
        !rq && (rq = uQ(0xb17)),
        rq
      );
    }
    var fc = 0x10f;
    function fd(rq) {
      const uR = uv,
        rr = rq[uR(0xaa2)]("\x0a")[uR(0x2e2)](
          (rs) => rs[uR(0x810)]()[uR(0xd55)] > 0x0
        );
      return { title: rr[uR(0xc28)](), content: rr };
    }
    const fe = {};
    (fe[uv(0x59d)] = uv(0xb72)),
      (fe[uv(0xa2c)] = [
        uv(0x203),
        uv(0xc7f),
        uv(0x76b),
        uv(0x325),
        uv(0x252),
        uv(0xe37),
        uv(0x378),
        uv(0xc43),
      ]);
    const ff = {};
    (ff[uv(0x59d)] = uv(0x3f6)), (ff[uv(0xa2c)] = [uv(0x8c5)]);
    const fg = {};
    (fg[uv(0x59d)] = uv(0xc4c)),
      (fg[uv(0xa2c)] = [uv(0xda5), uv(0x422), uv(0x696), uv(0xc02)]);
    const fh = {};
    (fh[uv(0x59d)] = uv(0x1a1)),
      (fh[uv(0xa2c)] = [
        uv(0x9f7),
        uv(0x3d4),
        uv(0x897),
        uv(0xb51),
        uv(0x749),
        uv(0xa8f),
        uv(0xd5e),
        uv(0x149),
        uv(0xa63),
      ]);
    const fi = {};
    (fi[uv(0x59d)] = uv(0xa4b)),
      (fi[uv(0xa2c)] = [uv(0x508), uv(0x93e), uv(0x3cf), uv(0xa99)]);
    const fj = {};
    (fj[uv(0x59d)] = uv(0xb74)), (fj[uv(0xa2c)] = [uv(0xe52)]);
    const fk = {};
    (fk[uv(0x59d)] = uv(0x9ab)), (fk[uv(0xa2c)] = [uv(0x8e4), uv(0x248)]);
    const fl = {};
    (fl[uv(0x59d)] = uv(0x7c9)),
      (fl[uv(0xa2c)] = [
        uv(0xce8),
        uv(0x538),
        uv(0xb76),
        uv(0x75d),
        uv(0x385),
        uv(0xc1e),
        uv(0x186),
        uv(0x571),
      ]);
    const fm = {};
    (fm[uv(0x59d)] = uv(0x8f5)),
      (fm[uv(0xa2c)] = [
        uv(0xb22),
        uv(0x702),
        uv(0x7b8),
        uv(0xe38),
        uv(0x9c3),
        uv(0x937),
        uv(0xd6f),
        uv(0x3dd),
      ]);
    const fn = {};
    (fn[uv(0x59d)] = uv(0x175)), (fn[uv(0xa2c)] = [uv(0x58e)]);
    const fo = {};
    (fo[uv(0x59d)] = uv(0xb3f)),
      (fo[uv(0xa2c)] = [
        uv(0x2e4),
        uv(0xcbe),
        uv(0x6cb),
        uv(0x90e),
        uv(0xbf9),
        uv(0x1a7),
        uv(0xd1c),
      ]);
    const fp = {};
    (fp[uv(0x59d)] = uv(0x1a0)), (fp[uv(0xa2c)] = [uv(0x6bb)]);
    const fq = {};
    (fq[uv(0x59d)] = uv(0xcc0)),
      (fq[uv(0xa2c)] = [uv(0xb82), uv(0x5f3), uv(0xc36), uv(0xa02)]);
    const fr = {};
    (fr[uv(0x59d)] = uv(0x3f2)), (fr[uv(0xa2c)] = [uv(0x31e), uv(0xd76)]);
    const fs = {};
    (fs[uv(0x59d)] = uv(0xbba)),
      (fs[uv(0xa2c)] = [uv(0x2aa), uv(0x4c1), uv(0x6ff), uv(0xd8c)]);
    const ft = {};
    (ft[uv(0x59d)] = uv(0x9da)),
      (ft[uv(0xa2c)] = [uv(0x8be), uv(0x718), uv(0x98d), uv(0x198)]);
    const fu = {};
    (fu[uv(0x59d)] = uv(0xc38)),
      (fu[uv(0xa2c)] = [
        uv(0xe66),
        uv(0x139),
        uv(0x947),
        uv(0x13c),
        uv(0xce3),
        uv(0x68c),
      ]);
    const fv = {};
    (fv[uv(0x59d)] = uv(0x940)), (fv[uv(0xa2c)] = [uv(0x743)]);
    const fw = {};
    (fw[uv(0x59d)] = uv(0x6c9)), (fw[uv(0xa2c)] = [uv(0xc3a), uv(0x1f7)]);
    const fx = {};
    (fx[uv(0x59d)] = uv(0x60f)),
      (fx[uv(0xa2c)] = [uv(0x3bc), uv(0x716), uv(0xa68)]);
    const fy = {};
    (fy[uv(0x59d)] = uv(0xb0d)),
      (fy[uv(0xa2c)] = [uv(0x689), uv(0xe25), uv(0x6e7), uv(0x352), uv(0x56a)]);
    const fz = {};
    (fz[uv(0x59d)] = uv(0xcc8)), (fz[uv(0xa2c)] = [uv(0xd56), uv(0x16f)]);
    const fA = {};
    (fA[uv(0x59d)] = uv(0x56d)),
      (fA[uv(0xa2c)] = [uv(0xdad), uv(0xe2a), uv(0x69b)]);
    const fB = {};
    (fB[uv(0x59d)] = uv(0x7fc)), (fB[uv(0xa2c)] = [uv(0xa8c)]);
    const fC = {};
    (fC[uv(0x59d)] = uv(0x44e)), (fC[uv(0xa2c)] = [uv(0xaf7)]);
    const fD = {};
    (fD[uv(0x59d)] = uv(0x7e1)), (fD[uv(0xa2c)] = [uv(0x8bf)]);
    const fE = {};
    (fE[uv(0x59d)] = uv(0x7d1)),
      (fE[uv(0xa2c)] = [uv(0x4a1), uv(0x25c), uv(0x85b)]);
    const fF = {};
    (fF[uv(0x59d)] = uv(0x8ad)),
      (fF[uv(0xa2c)] = [
        uv(0xe69),
        uv(0x1d1),
        uv(0xb6e),
        uv(0xa1c),
        uv(0xc89),
        uv(0x758),
        uv(0x9dd),
        uv(0xc08),
        uv(0x129),
        uv(0x576),
        uv(0x4a3),
        uv(0xcca),
        uv(0xcb9),
        uv(0xdd4),
      ]);
    const fG = {};
    (fG[uv(0x59d)] = uv(0xc44)),
      (fG[uv(0xa2c)] = [
        uv(0x111),
        uv(0x7e4),
        uv(0x5fb),
        uv(0xbdf),
        uv(0x250),
        uv(0xdd0),
        uv(0x77c),
        uv(0x3cd),
      ]);
    const fH = {};
    (fH[uv(0x59d)] = uv(0x9b3)),
      (fH[uv(0xa2c)] = [
        uv(0x80b),
        uv(0xa25),
        uv(0x980),
        uv(0x6a1),
        uv(0x979),
        uv(0xbcd),
        uv(0x625),
        uv(0x5ff),
        uv(0x606),
        uv(0xab3),
        uv(0x3cc),
        uv(0x890),
        uv(0x22d),
        uv(0x59c),
      ]);
    const fI = {};
    (fI[uv(0x59d)] = uv(0xd81)),
      (fI[uv(0xa2c)] = [
        uv(0x971),
        uv(0x60e),
        uv(0x6b6),
        uv(0x76d),
        uv(0x195),
        uv(0x830),
        uv(0x792),
      ]);
    const fJ = {};
    (fJ[uv(0x59d)] = uv(0xa79)),
      (fJ[uv(0xa2c)] = [
        uv(0xcb2),
        uv(0xae1),
        uv(0xb8b),
        uv(0x7bc),
        uv(0x96b),
        uv(0x7bd),
        uv(0x667),
        uv(0x98a),
        uv(0x193),
        uv(0x7c6),
        uv(0x6fc),
        uv(0x279),
        uv(0x4be),
        uv(0x6f2),
      ]);
    const fK = {};
    (fK[uv(0x59d)] = uv(0xe6d)),
      (fK[uv(0xa2c)] = [
        uv(0xbc8),
        uv(0x866),
        uv(0x8a5),
        uv(0x304),
        uv(0x2be),
        uv(0x998),
        uv(0x59e),
        uv(0xd00),
        uv(0xcf8),
        uv(0xd59),
        uv(0x32b),
        uv(0xe4b),
        uv(0x4f1),
        uv(0x55b),
        uv(0x515),
      ]);
    const fL = {};
    (fL[uv(0x59d)] = uv(0x19f)),
      (fL[uv(0xa2c)] = [
        uv(0xbff),
        uv(0x1a2),
        uv(0x698),
        uv(0x37d),
        uv(0x780),
        uv(0x12c),
        uv(0x2cc),
        uv(0x1ed),
        uv(0xdf5),
        uv(0xb48),
        uv(0xd73),
        uv(0x4d5),
        uv(0x35b),
      ]);
    const fM = {};
    (fM[uv(0x59d)] = uv(0x34e)),
      (fM[uv(0xa2c)] = [
        uv(0x1fa),
        uv(0x16a),
        uv(0xdce),
        uv(0x9e2),
        uv(0x823),
        uv(0x910),
      ]);
    const fN = {};
    (fN[uv(0x59d)] = uv(0xc70)),
      (fN[uv(0xa2c)] = [
        uv(0x2e7),
        uv(0x8a3),
        uv(0xbb0),
        uv(0x303),
        uv(0x855),
        uv(0xc7a),
        uv(0xe58),
        uv(0x9f0),
        uv(0xa6c),
      ]);
    const fO = {};
    (fO[uv(0x59d)] = uv(0xc70)),
      (fO[uv(0xa2c)] = [
        uv(0xe53),
        uv(0x945),
        uv(0x9d2),
        uv(0xdcc),
        uv(0x15c),
        uv(0x6bd),
        uv(0x641),
        uv(0x25e),
        uv(0x262),
        uv(0x539),
        uv(0x235),
        uv(0x6c8),
        uv(0x9e6),
        uv(0x120),
        uv(0xb9c),
        uv(0x82a),
        uv(0x5a6),
      ]);
    const fP = {};
    (fP[uv(0x59d)] = uv(0xe42)), (fP[uv(0xa2c)] = [uv(0xdb8), uv(0xe33)]);
    const fQ = {};
    (fQ[uv(0x59d)] = uv(0x50c)),
      (fQ[uv(0xa2c)] = [uv(0x763), uv(0xe01), uv(0x45c)]);
    const fR = {};
    (fR[uv(0x59d)] = uv(0x52b)),
      (fR[uv(0xa2c)] = [uv(0x4fa), uv(0xdea), uv(0x4d4), uv(0x146)]);
    const fS = {};
    (fS[uv(0x59d)] = uv(0x390)),
      (fS[uv(0xa2c)] = [
        uv(0xd7b),
        uv(0x1c0),
        uv(0x259),
        uv(0x3e1),
        uv(0xc2c),
        uv(0x468),
      ]);
    const fT = {};
    (fT[uv(0x59d)] = uv(0xdb2)), (fT[uv(0xa2c)] = [uv(0xdbc)]);
    const fU = {};
    (fU[uv(0x59d)] = uv(0x4c9)),
      (fU[uv(0xa2c)] = [
        uv(0xd4c),
        uv(0x413),
        uv(0x38f),
        uv(0x9fe),
        uv(0x26c),
        uv(0x7c1),
        uv(0xaec),
        uv(0xaad),
      ]);
    const fV = {};
    (fV[uv(0x59d)] = uv(0xd89)), (fV[uv(0xa2c)] = [uv(0x59f), uv(0x77e)]);
    const fW = {};
    (fW[uv(0x59d)] = uv(0x608)),
      (fW[uv(0xa2c)] = [uv(0x2d7), uv(0xb3e), uv(0x807), uv(0x84c), uv(0x297)]);
    const fX = {};
    (fX[uv(0x59d)] = uv(0x2c8)),
      (fX[uv(0xa2c)] = [
        uv(0xc57),
        uv(0xb7e),
        uv(0xdf4),
        uv(0x693),
        uv(0x57f),
        uv(0x344),
        uv(0x20b),
        uv(0x2e0),
        uv(0x436),
      ]);
    const fY = {};
    (fY[uv(0x59d)] = uv(0xcce)),
      (fY[uv(0xa2c)] = [
        uv(0x8c1),
        uv(0xc16),
        uv(0x5dc),
        uv(0x9a6),
        uv(0xd0d),
        uv(0xb14),
        uv(0xc95),
        uv(0xbc7),
      ]);
    const fZ = {};
    (fZ[uv(0x59d)] = uv(0x775)),
      (fZ[uv(0xa2c)] = [
        uv(0x1a8),
        uv(0x3e2),
        uv(0x44b),
        uv(0x206),
        uv(0xcc3),
        uv(0x597),
        uv(0x86c),
        uv(0xca7),
        uv(0x15b),
      ]);
    const g0 = {};
    (g0[uv(0x59d)] = uv(0x9db)),
      (g0[uv(0xa2c)] = [
        uv(0x547),
        uv(0xb52),
        uv(0x992),
        uv(0x597),
        uv(0xc58),
        uv(0x178),
        uv(0xa55),
        uv(0x196),
        uv(0x54d),
        uv(0x316),
        uv(0x1b6),
      ]);
    const g1 = {};
    (g1[uv(0x59d)] = uv(0x9db)),
      (g1[uv(0xa2c)] = [uv(0xb11), uv(0x432), uv(0xa26), uv(0x51a), uv(0x374)]);
    const g2 = {};
    (g2[uv(0x59d)] = uv(0x171)), (g2[uv(0xa2c)] = [uv(0x237), uv(0x2d4)]);
    const g3 = {};
    (g3[uv(0x59d)] = uv(0x21e)), (g3[uv(0xa2c)] = [uv(0xd39)]);
    const g4 = {};
    (g4[uv(0x59d)] = uv(0x73d)),
      (g4[uv(0xa2c)] = [uv(0x2b5), uv(0x2ee), uv(0x17c), uv(0x52a)]);
    const g5 = {};
    (g5[uv(0x59d)] = uv(0xe31)),
      (g5[uv(0xa2c)] = [uv(0x5a7), uv(0x1cd), uv(0x4ae), uv(0x215)]);
    const g6 = {};
    (g6[uv(0x59d)] = uv(0xe31)),
      (g6[uv(0xa2c)] = [
        uv(0x255),
        uv(0x59e),
        uv(0x4aa),
        uv(0xc3c),
        uv(0xa72),
        uv(0x902),
        uv(0xe16),
        uv(0x6e1),
        uv(0x592),
        uv(0x4df),
        uv(0xdb7),
        uv(0x691),
        uv(0xc86),
        uv(0x700),
        uv(0xd9e),
        uv(0x89b),
        uv(0xd4a),
        uv(0x865),
        uv(0xd01),
        uv(0x801),
      ]);
    const g7 = {};
    (g7[uv(0x59d)] = uv(0x7a8)),
      (g7[uv(0xa2c)] = [uv(0xb78), uv(0x6e4), uv(0x52c), uv(0x87d)]);
    const g8 = {};
    (g8[uv(0x59d)] = uv(0xb09)),
      (g8[uv(0xa2c)] = [uv(0x128), uv(0x37a), uv(0xa7f)]);
    const g9 = {};
    (g9[uv(0x59d)] = uv(0x407)),
      (g9[uv(0xa2c)] = [
        uv(0xc33),
        uv(0x8bc),
        uv(0x9c8),
        uv(0x2ef),
        uv(0x7f1),
        uv(0xc1d),
        uv(0x8d3),
        uv(0x7dd),
        uv(0x358),
        uv(0x293),
        uv(0xa56),
        uv(0x56e),
        uv(0x404),
        uv(0xabc),
        uv(0x668),
      ]);
    const ga = {};
    (ga[uv(0x59d)] = uv(0x116)), (ga[uv(0xa2c)] = [uv(0xb58), uv(0xc9f)]);
    const gb = {};
    (gb[uv(0x59d)] = uv(0x604)),
      (gb[uv(0xa2c)] = [uv(0x769), uv(0x3ec), uv(0xd1f)]);
    const gc = {};
    (gc[uv(0x59d)] = uv(0x39a)),
      (gc[uv(0xa2c)] = [uv(0x34c), uv(0x6b1), uv(0xa88)]);
    const gd = {};
    (gd[uv(0x59d)] = uv(0x4c0)),
      (gd[uv(0xa2c)] = [uv(0xa29), uv(0xa2d), uv(0xc74), uv(0x412)]);
    const ge = {};
    (ge[uv(0x59d)] = uv(0xa0e)),
      (ge[uv(0xa2c)] = [uv(0x465), uv(0x238), uv(0x40f)]);
    const gf = {};
    (gf[uv(0x59d)] = uv(0x4c3)),
      (gf[uv(0xa2c)] = [
        uv(0x59e),
        uv(0xa12),
        uv(0x7b6),
        uv(0xacf),
        uv(0x90f),
        uv(0xd08),
        uv(0xdc2),
        uv(0x540),
        uv(0xdf7),
        uv(0x964),
        uv(0x79d),
        uv(0x44c),
        uv(0x78d),
        uv(0xd5f),
        uv(0x632),
        uv(0xe1a),
        uv(0x90d),
        uv(0x51b),
        uv(0x278),
        uv(0x899),
        uv(0x6d1),
        uv(0xa80),
        uv(0x209),
        uv(0x45b),
      ]);
    const gg = {};
    (gg[uv(0x59d)] = uv(0xdaf)),
      (gg[uv(0xa2c)] = [uv(0xc27), uv(0x795), uv(0x189), uv(0x150)]);
    const gh = {};
    (gh[uv(0x59d)] = uv(0xd64)),
      (gh[uv(0xa2c)] = [
        uv(0xe70),
        uv(0xc81),
        uv(0x31f),
        uv(0x59e),
        uv(0x393),
        uv(0x180),
        uv(0x81d),
        uv(0x678),
      ]);
    const gi = {};
    (gi[uv(0x59d)] = uv(0xa35)),
      (gi[uv(0xa2c)] = [
        uv(0x501),
        uv(0x76f),
        uv(0x2ef),
        uv(0x83b),
        uv(0xd0f),
        uv(0x68f),
        uv(0x2a0),
        uv(0x42f),
        uv(0x124),
        uv(0xcd5),
        uv(0x467),
        uv(0xd32),
        uv(0x230),
        uv(0xdab),
        uv(0x247),
        uv(0x323),
        uv(0x7c0),
      ]);
    const gj = {};
    (gj[uv(0x59d)] = uv(0xbd9)),
      (gj[uv(0xa2c)] = [
        uv(0x7d9),
        uv(0x618),
        uv(0x551),
        uv(0x4ad),
        uv(0xc62),
        uv(0xa77),
        uv(0xb25),
        uv(0x15a),
        uv(0xa5e),
        uv(0x269),
        uv(0x712),
      ]);
    const gk = {};
    (gk[uv(0x59d)] = uv(0x264)),
      (gk[uv(0xa2c)] = [
        uv(0x434),
        uv(0x157),
        uv(0x7e0),
        uv(0x9e1),
        uv(0x672),
        uv(0x7f3),
        uv(0xb27),
        uv(0x583),
        uv(0xb01),
        uv(0xb69),
      ]);
    const gl = {};
    (gl[uv(0x59d)] = uv(0x264)),
      (gl[uv(0xa2c)] = [
        uv(0xafd),
        uv(0xe19),
        uv(0x4d2),
        uv(0x521),
        uv(0x818),
        uv(0x437),
        uv(0x665),
        uv(0x952),
        uv(0x513),
        uv(0xa94),
      ]);
    const gm = {};
    (gm[uv(0x59d)] = uv(0x1a6)),
      (gm[uv(0xa2c)] = [
        uv(0x346),
        uv(0x373),
        uv(0x47d),
        uv(0x9ac),
        uv(0xd46),
        uv(0x829),
        uv(0xc9c),
        uv(0x3fa),
        uv(0x37f),
        uv(0x629),
      ]);
    const gn = {};
    (gn[uv(0x59d)] = uv(0x1a6)),
      (gn[uv(0xa2c)] = [
        uv(0xb11),
        uv(0x48b),
        uv(0x924),
        uv(0x477),
        uv(0x8c3),
        uv(0xaed),
        uv(0xcec),
        uv(0xda6),
        uv(0x268),
        uv(0x46a),
        uv(0x301),
      ]);
    const go = {};
    (go[uv(0x59d)] = uv(0xd1b)),
      (go[uv(0xa2c)] = [uv(0x6e8), uv(0x397), uv(0xd8b)]);
    const gp = {};
    (gp[uv(0x59d)] = uv(0xd1b)),
      (gp[uv(0xa2c)] = [
        uv(0x723),
        uv(0xcf2),
        uv(0x159),
        uv(0xa10),
        uv(0x532),
        uv(0xe4a),
        uv(0x75b),
        uv(0x527),
      ]);
    const gq = {};
    (gq[uv(0x59d)] = uv(0x17b)),
      (gq[uv(0xa2c)] = [uv(0xaa3), uv(0xa89), uv(0x466)]);
    const gr = {};
    (gr[uv(0x59d)] = uv(0x17b)),
      (gr[uv(0xa2c)] = [
        uv(0x99d),
        uv(0xa6c),
        uv(0x3df),
        uv(0xaa1),
        uv(0x96f),
        uv(0x243),
      ]);
    const gs = {};
    (gs[uv(0x59d)] = uv(0x17b)),
      (gs[uv(0xa2c)] = [uv(0xaf3), uv(0x994), uv(0xd7e), uv(0xb71)]);
    const gt = {};
    (gt[uv(0x59d)] = uv(0x17b)),
      (gt[uv(0xa2c)] = [
        uv(0xa48),
        uv(0x715),
        uv(0xe55),
        uv(0xad0),
        uv(0xb6f),
        uv(0xa62),
        uv(0x652),
        uv(0xac5),
        uv(0x4cd),
        uv(0x29a),
        uv(0x2c0),
      ]);
    const gu = {};
    (gu[uv(0x59d)] = uv(0x72c)),
      (gu[uv(0xa2c)] = [uv(0xe17), uv(0xa21), uv(0x938)]);
    const gv = {};
    (gv[uv(0x59d)] = uv(0x160)),
      (gv[uv(0xa2c)] = [
        uv(0xcd9),
        uv(0xb21),
        uv(0xa6c),
        uv(0xaf6),
        uv(0x272),
        uv(0x51e),
        uv(0x5a4),
        uv(0x71a),
        uv(0xb37),
        uv(0xe4f),
        uv(0x707),
        uv(0xab6),
        uv(0x2ef),
        uv(0xc55),
        uv(0x4b5),
        uv(0xbbb),
        uv(0x331),
        uv(0x39b),
        uv(0xe22),
        uv(0x26d),
        uv(0x8db),
        uv(0xa14),
        uv(0x273),
        uv(0x1a9),
        uv(0xa04),
        uv(0x7a1),
        uv(0xe34),
        uv(0xb3a),
        uv(0xa6f),
        uv(0xc76),
        uv(0x817),
        uv(0x1ca),
        uv(0xa44),
        uv(0x32a),
      ]);
    const gw = {};
    (gw[uv(0x59d)] = uv(0xb0a)), (gw[uv(0xa2c)] = [uv(0x7ff)]);
    const gx = {};
    (gx[uv(0x59d)] = uv(0x4c6)),
      (gx[uv(0xa2c)] = [
        uv(0xdd3),
        uv(0x935),
        uv(0x302),
        uv(0x95f),
        uv(0xe54),
        uv(0x525),
        uv(0x4e6),
        uv(0x2ef),
        uv(0x83d),
        uv(0xa59),
        uv(0x1c1),
        uv(0x917),
        uv(0x15e),
        uv(0x69a),
        uv(0x528),
        uv(0x476),
        uv(0x860),
        uv(0x50b),
        uv(0x590),
        uv(0x5f9),
        uv(0x90b),
        uv(0x4b3),
        uv(0x212),
        uv(0xc8e),
        uv(0x9cf),
        uv(0x5d7),
        uv(0xd5c),
        uv(0x6cf),
        uv(0xac0),
        uv(0xa96),
        uv(0x1ca),
        uv(0x475),
        uv(0xb4e),
        uv(0x118),
        uv(0xdcd),
      ]);
    const gy = {};
    (gy[uv(0x59d)] = uv(0x9d4)),
      (gy[uv(0xa2c)] = [
        uv(0x30f),
        uv(0xdb3),
        uv(0x589),
        uv(0x6f1),
        uv(0x2b4),
        uv(0xaaf),
        uv(0x2ef),
        uv(0xbb5),
        uv(0x41e),
        uv(0xa1d),
        uv(0xadb),
        uv(0x7c5),
        uv(0x903),
        uv(0x72a),
        uv(0x74d),
        uv(0x487),
        uv(0x879),
        uv(0x474),
        uv(0x2b8),
        uv(0x13e),
        uv(0x152),
        uv(0x860),
        uv(0x3e4),
        uv(0x240),
        uv(0x90c),
        uv(0x69c),
        uv(0x8af),
        uv(0xbef),
        uv(0xab1),
        uv(0xe14),
        uv(0x7cd),
        uv(0xe36),
        uv(0x50d),
        uv(0x236),
        uv(0x1ca),
        uv(0xd16),
        uv(0x387),
        uv(0x610),
        uv(0x113),
      ]);
    const gz = {};
    (gz[uv(0x59d)] = uv(0x289)),
      (gz[uv(0xa2c)] = [
        uv(0x736),
        uv(0x642),
        uv(0x1ca),
        uv(0x522),
        uv(0x56c),
        uv(0x482),
        uv(0xe11),
        uv(0x1ff),
        uv(0x24b),
        uv(0x2ef),
        uv(0x3fc),
        uv(0x816),
        uv(0xb5a),
        uv(0x9a9),
      ]);
    const gA = {};
    (gA[uv(0x59d)] = uv(0x650)),
      (gA[uv(0xa2c)] = [uv(0x552), uv(0x9ae), uv(0x2ea), uv(0x939), uv(0xd19)]);
    const gB = {};
    (gB[uv(0x59d)] = uv(0xdc8)),
      (gB[uv(0xa2c)] = [uv(0x3de), uv(0x7b5), uv(0x29d), uv(0x64a)]);
    const gC = {};
    (gC[uv(0x59d)] = uv(0xdc8)),
      (gC[uv(0xa2c)] = [uv(0xa6c), uv(0x5e5), uv(0x4ff)]);
    const gD = {};
    (gD[uv(0x59d)] = uv(0x54f)),
      (gD[uv(0xa2c)] = [uv(0x73e), uv(0x6a5), uv(0xe73), uv(0x446), uv(0x6ee)]);
    const gE = {};
    (gE[uv(0x59d)] = uv(0x54f)),
      (gE[uv(0xa2c)] = [uv(0xc4a), uv(0x607), uv(0x605), uv(0xe08)]);
    const gF = {};
    (gF[uv(0x59d)] = uv(0x54f)), (gF[uv(0xa2c)] = [uv(0x711), uv(0xca0)]);
    const gG = {};
    (gG[uv(0x59d)] = uv(0x5a5)),
      (gG[uv(0xa2c)] = [
        uv(0xc5a),
        uv(0x8f3),
        uv(0x42a),
        uv(0xcd2),
        uv(0x91a),
        uv(0xd37),
        uv(0xc9e),
        uv(0x21d),
        uv(0x9fb),
      ]);
    const gH = {};
    (gH[uv(0x59d)] = uv(0xcd4)),
      (gH[uv(0xa2c)] = [
        uv(0x842),
        uv(0x80d),
        uv(0x577),
        uv(0xa49),
        uv(0x315),
        uv(0x9d3),
        uv(0x5f0),
      ]);
    const gI = {};
    (gI[uv(0x59d)] = uv(0xad8)),
      (gI[uv(0xa2c)] = [
        uv(0xdfe),
        uv(0x86f),
        uv(0xcbb),
        uv(0x67b),
        uv(0x5e8),
        uv(0xcc7),
        uv(0x2a1),
        uv(0x488),
        uv(0x776),
        uv(0x967),
        uv(0x564),
        uv(0x85c),
      ]);
    const gJ = {};
    (gJ[uv(0x59d)] = uv(0xa3d)),
      (gJ[uv(0xa2c)] = [
        uv(0xc40),
        uv(0xa86),
        uv(0xd75),
        uv(0x32c),
        uv(0x995),
        uv(0x2f8),
        uv(0x251),
        uv(0x2c3),
        uv(0x37b),
        uv(0xde6),
      ]);
    const gK = {};
    (gK[uv(0x59d)] = uv(0xa3d)),
      (gK[uv(0xa2c)] = [
        uv(0x726),
        uv(0xe03),
        uv(0x708),
        uv(0x8f9),
        uv(0x8ac),
        uv(0x388),
      ]);
    const gL = {};
    (gL[uv(0x59d)] = uv(0xcdc)),
      (gL[uv(0xa2c)] = [uv(0x34b), uv(0x49a), uv(0xdfc)]);
    const gM = {};
    (gM[uv(0x59d)] = uv(0xcdc)),
      (gM[uv(0xa2c)] = [uv(0xa6c), uv(0x2c9), uv(0x704), uv(0xa8a), uv(0x75e)]);
    const gN = {};
    (gN[uv(0x59d)] = uv(0xc1a)),
      (gN[uv(0xa2c)] = [
        uv(0x713),
        uv(0x87f),
        uv(0xe02),
        uv(0x643),
        uv(0xb30),
        uv(0x62c),
        uv(0x1ca),
        uv(0x4cc),
        uv(0x803),
        uv(0x9fd),
        uv(0x3d5),
        uv(0x9e8),
        uv(0x2ef),
        uv(0x966),
        uv(0x22a),
        uv(0x8fb),
        uv(0xd31),
        uv(0x6e0),
        uv(0xbae),
      ]);
    const gO = {};
    (gO[uv(0x59d)] = uv(0xbb6)),
      (gO[uv(0xa2c)] = [
        uv(0xa2e),
        uv(0x956),
        uv(0xd29),
        uv(0xb24),
        uv(0x626),
        uv(0x694),
        uv(0x593),
        uv(0x8aa),
      ]);
    const gP = {};
    (gP[uv(0x59d)] = uv(0xbb6)), (gP[uv(0xa2c)] = [uv(0x7f6), uv(0x4b8)]);
    const gQ = {};
    (gQ[uv(0x59d)] = uv(0x731)), (gQ[uv(0xa2c)] = [uv(0x1dc), uv(0xbaf)]);
    const gR = {};
    (gR[uv(0x59d)] = uv(0x731)),
      (gR[uv(0xa2c)] = [
        uv(0xac4),
        uv(0x46f),
        uv(0x3c7),
        uv(0x455),
        uv(0x881),
        uv(0x389),
        uv(0xbbc),
        uv(0x119),
        uv(0x23e),
      ]);
    const gS = {};
    (gS[uv(0x59d)] = uv(0x85e)), (gS[uv(0xa2c)] = [uv(0x8f6), uv(0x26f)]);
    const gT = {};
    (gT[uv(0x59d)] = uv(0x85e)),
      (gT[uv(0xa2c)] = [
        uv(0x60b),
        uv(0x3f9),
        uv(0xd21),
        uv(0x3f8),
        uv(0x3b3),
        uv(0x5e9),
        uv(0x5b3),
        uv(0xa6c),
        uv(0xc6a),
      ]);
    const gU = {};
    (gU[uv(0x59d)] = uv(0x876)), (gU[uv(0xa2c)] = [uv(0x337)]);
    const gV = {};
    (gV[uv(0x59d)] = uv(0x876)),
      (gV[uv(0xa2c)] = [
        uv(0x12a),
        uv(0x4cb),
        uv(0x20e),
        uv(0x211),
        uv(0xa6c),
        uv(0x37e),
        uv(0xb05),
      ]);
    const gW = {};
    (gW[uv(0x59d)] = uv(0x876)),
      (gW[uv(0xa2c)] = [uv(0x85a), uv(0x8a0), uv(0x509)]);
    const gX = {};
    (gX[uv(0x59d)] = uv(0x5cb)),
      (gX[uv(0xa2c)] = [uv(0xc6a), uv(0xa85), uv(0x51c), uv(0x679)]);
    const gY = {};
    (gY[uv(0x59d)] = uv(0x5cb)), (gY[uv(0xa2c)] = [uv(0x469)]);
    const gZ = {};
    (gZ[uv(0x59d)] = uv(0x5cb)),
      (gZ[uv(0xa2c)] = [uv(0x5ab), uv(0xcb8), uv(0x929), uv(0xbc0), uv(0x7da)]);
    const h0 = {};
    (h0[uv(0x59d)] = uv(0xa41)),
      (h0[uv(0xa2c)] = [uv(0x166), uv(0x948), uv(0x676)]);
    const h1 = {};
    (h1[uv(0x59d)] = uv(0x57a)), (h1[uv(0xa2c)] = [uv(0xae9), uv(0x2e8)]);
    const h2 = {};
    (h2[uv(0x59d)] = uv(0x69d)), (h2[uv(0xa2c)] = [uv(0xb31), uv(0x20d)]);
    const h3 = {};
    (h3[uv(0x59d)] = uv(0xd68)), (h3[uv(0xa2c)] = [uv(0x813)]);
    var h4 = [
      fd(uv(0xc69)),
      fd(uv(0x343)),
      fd(uv(0x4ce)),
      fd(uv(0x440)),
      fd(uv(0x28a)),
      fd(uv(0x39c)),
      fd(uv(0x97e)),
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
      h3,
    ];
    console[uv(0xdc3)](uv(0xd53));
    var h5 = Date[uv(0xd3f)]() < 0x18e9c4b6482,
      h6 = Math[uv(0xc8c)](Math[uv(0xbf6)]() * 0xa);
    function h7(rq) {
      const uS = uv,
        rr = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let rs = "";
      for (const rt of rq) {
        rt === "\x20"
          ? (rs += "\x20")
          : (rs += rr[(h6 + rt[uS(0x851)](0x0)) % rr[uS(0xd55)]]);
      }
      return rs;
    }
    h5 &&
      document[uv(0x91c)](uv(0x2fd))[uv(0xe2b)](
        uv(0x8e6),
        h7(uv(0x653)) + uv(0x5b7)
      );
    function h8(rq, rr, rs) {
      const uT = uv,
        rt = rr - rq;
      if (Math[uT(0x911)](rt) < 0.01) return rr;
      return rq + rt * (0x1 - Math[uT(0xb64)](-rs * pR));
    }
    var h9 = [],
      ha = 0x0;
    function hb(rq, rr = 0x1388) {
      const uU = uv,
        rs = nQ(uU(0x6b9) + jw(rq) + uU(0xb63));
      kH[uU(0x6c4)](rs);
      let rt = 0x0;
      ru();
      function ru() {
        const uV = uU;
        (rs[uV(0xa71)][uV(0xde3)] = uV(0xa5a) + ha + uV(0xcde)),
          (rs[uV(0xa71)][uV(0x572)] = rt);
      }
      (this[uU(0xc52)] = ![]),
        (this[uU(0xbce)] = () => {
          const uW = uU;
          rr -= pQ;
          const rv = rr > 0x0 ? 0x1 : 0x0;
          (rt = h8(rt, rv, 0.3)),
            ru(),
            rr < 0x0 &&
              rt <= 0x0 &&
              (rs[uW(0x2b0)](), (this[uW(0xc52)] = !![])),
            (ha += rt * (rs[uW(0x4d6)] + 0x5));
        }),
        h9[uU(0xe68)](this);
    }
    function hc(rq) {
      new hb(rq, 0x1388);
    }
    function hd() {
      const uX = uv;
      ha = 0x0;
      for (let rq = h9[uX(0xd55)] - 0x1; rq >= 0x0; rq--) {
        const rr = h9[rq];
        rr[uX(0xbce)](), rr[uX(0xc52)] && h9[uX(0x4f9)](rq, 0x1);
      }
    }
    var he = !![],
      hf = document[uv(0x91c)](uv(0x418));
    fetch(uv(0xa07))
      [uv(0x970)]((rq) => {
        const uY = uv;
        (hf[uY(0xa71)][uY(0x3c1)] = uY(0x846)), (he = ![]);
      })
      [uv(0xdbb)]((rq) => {
        const uZ = uv;
        hf[uZ(0xa71)][uZ(0x3c1)] = "";
      });
    var hg = document[uv(0x91c)](uv(0xa74)),
      hh = Date[uv(0xd3f)]();
    function hi() {
      const v0 = uv;
      console[v0(0xdc3)](v0(0x89a)),
        (hh = Date[v0(0xd3f)]()),
        (hg[v0(0xa71)][v0(0x3c1)] = "");
      try {
        aiptag[v0(0x8b4)][v0(0x3c1)][v0(0xe68)](function () {
          const v1 = v0;
          aipDisplayTag[v1(0x3c1)](v1(0x55a));
        }),
          aiptag[v0(0x8b4)][v0(0x3c1)][v0(0xe68)](function () {
            const v2 = v0;
            aipDisplayTag[v2(0x3c1)](v2(0x9df));
          });
      } catch (rq) {
        console[v0(0xdc3)](v0(0x371));
      }
    }
    setInterval(function () {
      const v3 = uv;
      hg[v3(0xa71)][v3(0x3c1)] === "" &&
        Date[v3(0xd3f)]() - hh > 0x7530 &&
        hi();
    }, 0x2710);
    var hj = null,
      hk = 0x0;
    function hl() {
      const v4 = uv;
      console[v4(0xdc3)](v4(0xc13)),
        typeof aiptag[v4(0xcf4)] !== v4(0x381)
          ? ((hj = 0x45),
            (hk = Date[v4(0xd3f)]()),
            aiptag[v4(0x8b4)][v4(0x684)][v4(0xe68)](function () {
              const v5 = v4;
              aiptag[v5(0xcf4)][v5(0xcb5)]();
            }))
          : window[v4(0x885)](v4(0x221));
    }
    window[uv(0x885)] = function (rq) {
      const v6 = uv;
      console[v6(0xdc3)](v6(0x348) + rq);
      if (rq === v6(0xc72) || rq[v6(0xa91)](v6(0x207)) > -0x1) {
        if (hj !== null && Date[v6(0xd3f)]() - hk > 0xbb8) {
          console[v6(0xdc3)](v6(0xaae));
          if (hW) {
            const rr = {};
            (rr[v6(0x59d)] = v6(0xdbf)),
              (rr[v6(0x4e0)] = ![]),
              kI(
                v6(0x33a),
                (rs) => {
                  const v7 = v6;
                  rs &&
                    hW &&
                    (il(new Uint8Array([cI[v7(0xe35)]])), hK(v7(0x12e)));
                },
                rr
              );
          }
        } else hK(v6(0x341));
      } else alert(v6(0x44f) + rq);
      hm[v6(0xdd8)][v6(0x2b0)](v6(0x249)), (hj = null);
    };
    var hm = document[uv(0x91c)](uv(0x64f));
    (hm[uv(0x81c)] = function () {
      const v8 = uv;
      hm[v8(0xdd8)][v8(0x1b1)](v8(0x249)), hl();
    }),
      (hm[uv(0x6d2)] = function () {
        const v9 = uv;
        return nQ(
          v9(0x990) + hP[v9(0xadc)] + v9(0x5c7) + hP[v9(0xd5d)] + v9(0x519)
        );
      }),
      (hm[uv(0x380)] = !![]);
    var hn = [
        uv(0x3fd),
        uv(0xd2b),
        uv(0x9ad),
        uv(0x6e3),
        uv(0x58b),
        uv(0x5d4),
        uv(0xb81),
        uv(0x719),
        uv(0xc6e),
        uv(0x2f7),
        uv(0x2d1),
        uv(0x17f),
      ],
      ho = document[uv(0x91c)](uv(0xb9e)),
      hp =
        Date[uv(0xd3f)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[uv(0xc8c)](Math[uv(0xbf6)]() * hn[uv(0xd55)]);
    hr();
    function hq(rq) {
      const va = uv;
      (hp += rq),
        hp < 0x0 ? (hp = hn[va(0xd55)] - 0x1) : (hp %= hn[va(0xd55)]),
        hr();
    }
    function hr() {
      const vb = uv,
        rq = hn[hp];
      (ho[vb(0xa71)][vb(0x773)] =
        vb(0xc34) + rq[vb(0xaa2)](vb(0x4e2))[0x1] + vb(0xc1f)),
        (ho[vb(0x81c)] = function () {
          const vc = vb;
          window[vc(0x274)](rq, vc(0x306)), hq(0x1);
        });
    }
    (document[uv(0x91c)](uv(0xa45))[uv(0x81c)] = function () {
      hq(-0x1);
    }),
      (document[uv(0x91c)](uv(0x5c3))[uv(0x81c)] = function () {
        hq(0x1);
      });
    var hs = document[uv(0x91c)](uv(0x19c));
    hs[uv(0x6d2)] = function () {
      const vd = uv;
      return nQ(
        vd(0x990) + hP[vd(0xadc)] + vd(0x22f) + hP[vd(0x31b)] + vd(0xe1b)
      );
    };
    var ht = document[uv(0x91c)](uv(0x3af)),
      hu = document[uv(0x91c)](uv(0x701)),
      hv = ![];
    function hw() {
      const ve = uv;
      let rq = "";
      for (let rs = 0x0; rs < h4[ve(0xd55)]; rs++) {
        const { title: rt, content: ru } = h4[rs];
        (rq += ve(0x770) + rt + ve(0x391)),
          ru[ve(0x275)]((rv, rw) => {
            const vf = ve;
            let rx = "-\x20";
            if (rv[0x0] === "*") {
              const ry = rv[rw + 0x1];
              if (ry && ry[0x0] === "*") rx = vf(0x21c);
              else rx = vf(0x965);
              rv = rv[vf(0x7ce)](0x1);
            }
            (rv = rx + rv), (rq += vf(0xdae) + rv + vf(0x13d));
          }),
          (rq += ve(0x327));
      }
      const rr = hD[ve(0x342)];
      (hv = rr !== void 0x0 && parseInt(rr) < fc), (ht[ve(0x63c)] = rq);
    }
    CanvasRenderingContext2D[uv(0xbab)][uv(0x627)] = function (rq) {
      const vg = uv;
      this[vg(0x28b)](rq, rq);
    };
    var hx = ![];
    hx &&
      (OffscreenCanvasRenderingContext2D[uv(0xbab)][uv(0x627)] = function (rq) {
        const vh = uv;
        this[vh(0x28b)](rq, rq);
      });
    function hy(rq, rr, rs) {
      const rt = 0x1 - rs;
      return [
        rq[0x0] * rs + rr[0x0] * rt,
        rq[0x1] * rs + rr[0x1] * rt,
        rq[0x2] * rs + rr[0x2] * rt,
      ];
    }
    var hz = {};
    function hA(rq) {
      const vi = uv;
      return (
        !hz[rq] &&
          (hz[rq] = [
            parseInt(rq[vi(0x7ce)](0x1, 0x3), 0x10),
            parseInt(rq[vi(0x7ce)](0x3, 0x5), 0x10),
            parseInt(rq[vi(0x7ce)](0x5, 0x7), 0x10),
          ]),
        hz[rq]
      );
    }
    var hB = document[uv(0xa69)](uv(0x3eb)),
      hC = document[uv(0x729)](uv(0x918));
    for (let rq = 0x0; rq < hC[uv(0xd55)]; rq++) {
      const rr = hC[rq],
        rs = f9[rr[uv(0xe76)](uv(0xaf5))];
      rs && rr[uv(0x6c0)](nQ(rs), rr[uv(0xba2)][0x0]);
    }
    var hD;
    try {
      hD = localStorage;
    } catch (rt) {
      console[uv(0x11a)](uv(0x64d), rt), (hD = {});
    }
    var hE = document[uv(0x91c)](uv(0x82b)),
      hF = document[uv(0x91c)](uv(0x1ba)),
      hG = document[uv(0x91c)](uv(0x7dc));
    (hE[uv(0x6d2)] = function () {
      const vj = uv;
      return nQ(
        vj(0xda1) + hP[vj(0x721)] + vj(0x624) + cN + vj(0x9bd) + cM + vj(0x962)
      );
    }),
      (hF[uv(0x63e)] = cM),
      (hF[uv(0xc3b)] = function () {
        const vk = uv;
        !cO[vk(0x3e6)](this[vk(0x2e6)]) &&
          (this[vk(0x2e6)] = this[vk(0x2e6)][vk(0xb02)](cP, ""));
      });
    var hH,
      hI = document[uv(0x91c)](uv(0x356));
    function hJ(ru) {
      const vl = uv;
      ru ? k8(hI, ru + vl(0xcf3)) : k8(hI, vl(0x96e)),
        (hE[vl(0xa71)][vl(0x3c1)] =
          ru && ru[vl(0xa91)]("\x20") === -0x1 ? vl(0x846) : "");
    }
    hG[uv(0x81c)] = nv(function () {
      const vm = uv;
      if (!hW || jy) return;
      const ru = hF[vm(0x2e6)],
        rv = ru[vm(0xd55)];
      if (rv < cN) hc(vm(0x579));
      else {
        if (rv > cM) hc(vm(0x6df));
        else {
          if (!cO[vm(0x3e6)](ru)) hc(vm(0x9aa));
          else {
            hc(vm(0x1de), hP[vm(0x31b)]), (hH = ru);
            const rw = new Uint8Array([
              cI[vm(0x7d5)],
              ...new TextEncoder()[vm(0x130)](ru),
            ]);
            il(rw);
          }
        }
      }
    });
    function hK(ru, rv = ni[uv(0x569)]) {
      nl(-0x1, null, ru, rv);
    }
    hw();
    var hL = f4(cR),
      hM = f4(cS),
      hN = f4(d9);
    const hO = {};
    (hO[uv(0x721)] = uv(0x97f)),
      (hO[uv(0x31b)] = uv(0x99b)),
      (hO[uv(0x338)] = uv(0xdca)),
      (hO[uv(0x2df)] = uv(0x127)),
      (hO[uv(0xa92)] = uv(0x4e7)),
      (hO[uv(0xd5d)] = uv(0x523)),
      (hO[uv(0xadc)] = uv(0x5c4)),
      (hO[uv(0x2ca)] = uv(0xbfb)),
      (hO[uv(0x5d0)] = uv(0x117));
    var hP = hO,
      hQ = Object[uv(0x384)](hP),
      hR = [];
    for (let ru = 0x0; ru < hQ[uv(0xd55)]; ru++) {
      const rv = hQ[ru],
        rw = rv[uv(0x7ce)](0x4, rv[uv(0xa91)](")"))
          [uv(0xaa2)](",\x20")
          [uv(0xa9a)]((rx) => parseInt(rx) * 0.8);
      hR[uv(0xe68)](q1(rw));
    }
    hS(uv(0xe5e), uv(0x3d8)),
      hS(uv(0x692), uv(0xcc1)),
      hS(uv(0xda4), uv(0x622)),
      hS(uv(0x9ef), uv(0x25b)),
      hS(uv(0x5d3), uv(0x74e)),
      hS(uv(0x121), uv(0x3f0)),
      hS(uv(0x3d6), uv(0x185));
    function hS(rx, ry) {
      const vn = uv;
      document[vn(0x91c)](rx)[vn(0x81c)] = function () {
        const vo = vn;
        window[vo(0x274)](ry, vo(0x306));
      };
    }
    setInterval(function () {
      const vp = uv;
      hW && il(new Uint8Array([cI[vp(0x6d3)]]));
    }, 0x3e8);
    function hT() {
      const vq = uv;
      (pN = [pU]),
        (j6[vq(0x372)] = !![]),
        (j6 = {}),
        (jG = 0x0),
        (jH[vq(0xd55)] = 0x0),
        (iw = []),
        (iG[vq(0xd55)] = 0x0),
        (iC[vq(0x63c)] = ""),
        (iv = {}),
        (iH = ![]),
        (iy = null),
        (ix = null),
        (pD = 0x0),
        (hW = ![]),
        (mE = 0x0),
        (mD = 0x0),
        (mo = ![]),
        (mk[vq(0xa71)][vq(0x3c1)] = vq(0x846)),
        (q5[vq(0xa71)][vq(0x3c1)] = q4[vq(0xa71)][vq(0x3c1)] = vq(0x846)),
        (pB = 0x0),
        (pC = 0x0);
    }
    var hU;
    function hV(rx) {
      const vr = uv;
      (jh[vr(0xa71)][vr(0x3c1)] = vr(0x846)),
        (pi[vr(0xa71)][vr(0x3c1)] = vr(0x846)),
        hZ(),
        kA[vr(0xdd8)][vr(0x1b1)](vr(0x7f0)),
        kB[vr(0xdd8)][vr(0x2b0)](vr(0x7f0)),
        hT(),
        console[vr(0xdc3)](vr(0xc8f) + rx + vr(0x31a)),
        iu(),
        (hU = new WebSocket(rx)),
        (hU[vr(0xcaa)] = vr(0xb9d)),
        (hU[vr(0x11f)] = hX),
        (hU[vr(0x453)] = k1),
        (hU[vr(0x4d7)] = kg);
    }
    crypto[uv(0x15d)] =
      crypto[uv(0x15d)] ||
      function rx() {
        const vs = uv;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vs(0xb02)
        ](/[018]/g, (ry) =>
          (ry ^
            (crypto[vs(0x789)](new Uint8Array(0x1))[0x0] &
              (0xf >> (ry / 0x4))))[vs(0x3ad)](0x10)
        );
      };
    var hW = ![];
    function hX() {
      const vt = uv;
      console[vt(0xdc3)](vt(0x741)), ie();
      hack.preload();
    }
    var hY = document[uv(0x91c)](uv(0x872));
    function hZ() {
      const vu = uv;
      hY[vu(0xa71)][vu(0x3c1)] = vu(0x846);
    }
    var i0 = document[uv(0x91c)](uv(0xb6c)),
      i1 = document[uv(0x91c)](uv(0x936)),
      i2 = document[uv(0x91c)](uv(0x921)),
      i3 = document[uv(0x91c)](uv(0x22b));
    i3[uv(0x81c)] = function () {
      const vv = uv;
      !i6 &&
        (window[vv(0x9f8)][vv(0x4a6)] =
          vv(0x84f) +
          encodeURIComponent(!window[vv(0xab2)] ? vv(0x294) : vv(0x3bf)) +
          vv(0x66e) +
          encodeURIComponent(btoa(i5)));
    };
    var i4 = document[uv(0x91c)](uv(0xd1a));
    (i4[uv(0x81c)] = function () {
      const vw = uv;
      i5 == hD[vw(0x7d4)] && delete hD[vw(0x7d4)];
      delete hD[vw(0xa38)];
      if (hU)
        try {
          hU[vw(0x145)]();
        } catch (ry) {}
    }),
      hZ();
    var i5, i6;
    function i7(ry) {
      const vy = uv;
      try {
        let rA = function (rB) {
          const vx = b;
          return rB[vx(0xb02)](/([.*+?\^$(){}|\[\]\/\\])/g, vx(0xcf9));
        };
        var rz = document[vy(0xad5)][vy(0xb4b)](
          RegExp(vy(0x449) + rA(ry) + vy(0x543))
        );
        return rz ? rz[0x1] : null;
      } catch (rB) {
        return "";
      }
    }
    var i8 = !window[uv(0xab2)];
    function i9(ry) {
      const vz = uv;
      try {
        document[vz(0xad5)] = ry + vz(0x4e5) + (i8 ? vz(0xde4) : "");
      } catch (rz) {}
    }
    var ia = 0x0,
      ib;
    function ic() {
      const vA = uv;
      (ia = 0x0), (hW = ![]);
      !eV(hD[vA(0x7d4)]) && (hD[vA(0x7d4)] = crypto[vA(0x15d)]());
      (i5 = hD[vA(0x7d4)]), (i6 = hD[vA(0xa38)]);
      !i6 &&
        ((i6 = i7(vA(0xa38))),
        i6 && (i6 = decodeURIComponent(i6)),
        i9(vA(0xa38)));
      if (i6)
        try {
          const ry = i6;
          i6 = JSON[vA(0x494)](decodeURIComponent(escape(atob(ry))));
          if (eV(i6[vA(0x804)]))
            (i5 = i6[vA(0x804)]),
              i1[vA(0xe2b)](vA(0x8e6), i6[vA(0x46b)]),
              i6[vA(0x200)] &&
                (i2[vA(0xa71)][vA(0x773)] = vA(0x5f4) + i6[vA(0x200)] + ")"),
              (hD[vA(0xa38)] = ry);
          else throw new Error(vA(0xa7c));
        } catch (rz) {
          (i6 = null), delete hD[vA(0xa38)], console[vA(0x569)](vA(0x3a9) + rz);
        }
      ib = hD[vA(0x134)] || "";
    }
    function ie() {
      ic(), ii();
    }
    function ig() {
      const vB = uv,
        ry = [
          vB(0xbf4),
          vB(0x197),
          vB(0x5c2),
          vB(0x9ed),
          vB(0xb59),
          vB(0x30a),
          vB(0x4e3),
          vB(0x3d7),
          vB(0x7f5),
          vB(0x2e5),
          vB(0x18f),
          vB(0x3db),
          vB(0xa3e),
          vB(0xd28),
          vB(0x8b8),
          vB(0xa67),
          vB(0x651),
          vB(0x9fc),
          vB(0x961),
          vB(0x734),
          vB(0x99f),
          vB(0xdc4),
          vB(0x322),
          vB(0x216),
          vB(0x4ec),
          vB(0x2ec),
          vB(0x4c5),
          vB(0xd40),
          vB(0x6f7),
          vB(0x98c),
          vB(0x55e),
          vB(0x7f4),
          vB(0x5d9),
          vB(0x781),
          vB(0xabb),
          vB(0xb34),
          vB(0x82c),
          vB(0x95a),
          vB(0x760),
          vB(0xcd3),
          vB(0xa2a),
          vB(0x8ab),
          vB(0x1bf),
          vB(0x889),
          vB(0xc07),
          vB(0xdb9),
          vB(0x431),
          vB(0x350),
          vB(0xb5f),
          vB(0x43a),
          vB(0x5ef),
          vB(0x563),
          vB(0xc60),
          vB(0x66d),
          vB(0xae6),
          vB(0xcd0),
          vB(0x6e6),
          vB(0x95e),
          vB(0x705),
          vB(0xdec),
          vB(0x787),
          vB(0x296),
          vB(0x362),
          vB(0xe28),
        ];
      return (
        (ig = function () {
          return ry;
        }),
        ig()
      );
    }
    function ih(ry, rz) {
      const rA = ig();
      return (
        (ih = function (rB, rC) {
          const vC = b;
          rB = rB - (0x67c * -0x1 + -0x2 * -0xbdd + -0x5 * 0x35b);
          let rD = rA[rB];
          if (ih[vC(0x573)] === void 0x0) {
            var rE = function (rJ) {
              const vD = vC,
                rK = vD(0xd9d);
              let rL = "",
                rM = "";
              for (
                let rN = 0xc6a + -0x161c + -0x22 * -0x49,
                  rO,
                  rP,
                  rQ = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rP = rJ[vD(0xd2e)](rQ++));
                ~rP &&
                ((rO =
                  rN % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? rO * (0x2422 + -0x5 * 0x38b + -0x122b) + rP
                    : rP),
                rN++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rL += String[vD(0xc23)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (rO >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rN) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rP = rK[vD(0xa91)](rP);
              }
              for (
                let rR = 0x23d0 + 0x13 * -0xdf + -0x1343, rS = rL[vD(0xd55)];
                rR < rS;
                rR++
              ) {
                rM +=
                  "%" +
                  ("00" +
                    rL[vD(0x851)](rR)[vD(0x3ad)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vD(0x7ce)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
              }
              return decodeURIComponent(rM);
            };
            const rI = function (rJ, rK) {
              const vE = vC;
              let rL = [],
                rM = -0x3 * 0x542 + -0x7d7 * 0x3 + 0x274b,
                rN,
                rO = "";
              rJ = rE(rJ);
              let rP;
              for (
                rP = 0x2205 + 0x3ac + -0x1 * 0x25b1;
                rP < 0x1e33 + 0x1 * -0x181 + -0x5 * 0x58a;
                rP++
              ) {
                rL[rP] = rP;
              }
              for (
                rP = 0x91f * 0x4 + -0x554 + -0x1 * 0x1f28;
                rP < 0x2e * 0x43 + 0x12 * 0xc5 + -0x84c * 0x3;
                rP++
              ) {
                (rM =
                  (rM + rL[rP] + rK[vE(0x851)](rP % rK[vE(0xd55)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rN = rL[rP]),
                  (rL[rP] = rL[rM]),
                  (rL[rM] = rN);
              }
              (rP = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rM = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rQ = -0x1d30 + -0x23c8 + 0x40f8;
                rQ < rJ[vE(0xd55)];
                rQ++
              ) {
                (rP =
                  (rP + (0x2309 * -0x1 + 0x5 * -0x8b + -0x1 * -0x25c1)) %
                  (0xc5 * -0x1d + -0x1f03 + 0x3654)),
                  (rM =
                    (rM + rL[rP]) %
                    (-0x5 * -0x256 + 0x1cf * 0x2 + -0x1e * 0x7a)),
                  (rN = rL[rP]),
                  (rL[rP] = rL[rM]),
                  (rL[rM] = rN),
                  (rO += String[vE(0xc23)](
                    rJ[vE(0x851)](rQ) ^
                      rL[(rL[rP] + rL[rM]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return rO;
            };
            (ih[vC(0x15f)] = rI), (ry = arguments), (ih[vC(0x573)] = !![]);
          }
          const rF = rA[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rG = rB + rF,
            rH = ry[rG];
          return (
            !rH
              ? (ih[vC(0x148)] === void 0x0 && (ih[vC(0x148)] = !![]),
                (rD = ih[vC(0x15f)](rD, rC)),
                (ry[rG] = rD))
              : (rD = rH),
            rD
          );
        }),
        ih(ry, rz)
      );
    }
    (function (ry, rz) {
      const vF = uv;
      function rA(rG, rH, rI, rJ, rK) {
        return ih(rJ - 0x124, rK);
      }
      function rB(rG, rH, rI, rJ, rK) {
        return ih(rH - -0x245, rG);
      }
      function rC(rG, rH, rI, rJ, rK) {
        return ih(rK - -0x1b4, rJ);
      }
      function rD(rG, rH, rI, rJ, rK) {
        return ih(rG - 0x13, rJ);
      }
      const rE = ry();
      function rF(rG, rH, rI, rJ, rK) {
        return ih(rI - -0x2b3, rK);
      }
      while (!![]) {
        try {
          const rG =
            (parseInt(rA(0x1a1, 0x1b2, 0x1a9, 0x1b7, vF(0x596))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rC(-0x105, -0x12e, -0x131, vF(0x596), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(rA(0x1b5, 0x1c9, 0x1b1, 0x1cb, vF(0x703))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rC(-0x128, -0x132, -0x134, vF(0x472), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rC(-0x131, -0x155, -0x130, vF(0x8c4), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rD(0x9a, 0xb1, 0xb2, vF(0x703), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(rA(0x1b5, 0x1d3, 0x1bc, 0x1d1, vF(0xab8))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rD(0xb2, 0xbe, 0xb9, vF(0xb28), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(rA(0x183, 0x1ae, 0x197, 0x19e, vF(0x53f))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rF(-0x244, -0x216, -0x232, -0x217, vF(0xd8a))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rC(-0x126, -0x10f, -0x13a, vF(0x927), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rF(-0x203, -0x209, -0x200, -0x1e1, vF(0x386))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rG === rz) break;
          else rE[vF(0xe68)](rE[vF(0xc28)]());
        } catch (rH) {
          rE[vF(0xe68)](rE[vF(0xc28)]());
        }
      }
    })(ig, 0xc30df * 0x1 + 0x10f * -0x697 + 0x11613);
    function ii() {
      const vG = uv,
        ry = {
          dEyIJ: function (rK, rL) {
            return rK === rL;
          },
          HMRdl:
            rB(vG(0x472), -0x130, -0x106, -0x11f, -0x11d) +
            rB(vG(0x92a), -0x11a, -0x142, -0x138, -0x135),
          MCQcr: function (rK, rL) {
            return rK(rL);
          },
          OVQiZ: function (rK, rL) {
            return rK + rL;
          },
          UJCyl: function (rK, rL) {
            return rK % rL;
          },
          RniHC: function (rK, rL) {
            return rK * rL;
          },
          pKOiA: function (rK, rL) {
            return rK < rL;
          },
          ksKNr: function (rK, rL) {
            return rK ^ rL;
          },
          pZcMn: function (rK, rL) {
            return rK - rL;
          },
          GNeTf: function (rK, rL) {
            return rK - rL;
          },
          igRib: function (rK, rL) {
            return rK ^ rL;
          },
          GUXBF: function (rK, rL) {
            return rK + rL;
          },
          NcAdQ: function (rK, rL) {
            return rK % rL;
          },
          hlnUf: function (rK, rL) {
            return rK * rL;
          },
          pJhNJ: function (rK, rL) {
            return rK(rL);
          },
        };
      if (
        ry[rA(-0x27e, -0x274, -0x265, vG(0xd4e), -0x274)](
          typeof window,
          ry[rC(vG(0x3ce), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        ry[rE(-0x17d, -0x171, -0x181, vG(0x6ba), -0x16a)](
          typeof ki,
          ry[rA(-0x25a, -0x263, -0x26c, vG(0x92a), -0x270)]
        )
      )
        return;
      const rz = i5;
      function rA(rK, rL, rM, rN, rO) {
        return ih(rK - -0x30c, rN);
      }
      function rB(rK, rL, rM, rN, rO) {
        return ih(rO - -0x1cb, rK);
      }
      function rC(rK, rL, rM, rN, rO) {
        return ih(rO - 0x14c, rK);
      }
      const rD = rz[rC(vG(0xb28), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function rE(rK, rL, rM, rN, rO) {
        return ih(rK - -0x20a, rN);
      }
      const rF = ry[rH(0x43a, vG(0x529), 0x40e, 0x428, 0x430)](
        ij,
        ry[rA(-0x28e, -0x27f, -0x272, vG(0x6ba), -0x281)](
          ry[rB(vG(0x794), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rD
          ),
          ib[rB(vG(0xdf1), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rG = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rF[
        rB(vG(0xb29), -0x11e, -0x149, -0x131, -0x13c) +
          rE(-0x172, -0x16e, -0x175, vG(0x3ce), -0x166)
      ](rG++, cI[rE(-0x18e, -0x16e, -0x17a, vG(0x472), -0x1a6)]),
        rF[
          rH(0x415, vG(0xb36), 0x44c, 0x433, 0x422) +
            rC(vG(0xb6d), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rG, cJ),
        (rG += -0x3dd + -0x6b5 + 0xa94);
      function rH(rK, rL, rM, rN, rO) {
        return ih(rN - 0x3a2, rL);
      }
      const rI = ry[rH(0x43c, vG(0xaf2), 0x43b, 0x446, 0x459)](
        ry[rA(-0x283, -0x272, -0x298, vG(0x81f), -0x26e)](
          cJ,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let rK = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        ry[rC(vG(0x125), 0x200, 0x1fc, 0x1fc, 0x1e5)](rK, rD);
        rK++
      ) {
        rF[
          rA(-0x287, -0x273, -0x27d, vG(0x3ce), -0x27c) +
            rC(vG(0x172), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rG++,
          ry[rC(vG(0xbe9), 0x201, 0x215, 0x21c, 0x1fc)](
            rz[
              rB(vG(0x122), -0x11c, -0x130, -0x128, -0x13b) +
                rA(-0x289, -0x29c, -0x26a, vG(0xdf1), -0x290)
            ](
              ry[rB(vG(0x66a), -0x13a, -0x124, -0x111, -0x120)](
                ry[rB(vG(0xd4e), -0x10d, -0x119, -0x108, -0x128)](rD, rK),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rI
          )
        );
      }
      if (ib) {
        const rL = ib[rC(vG(0x6ba), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rM = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          ry[rC(vG(0xb60), 0x21f, 0x216, 0x204, 0x200)](rM, rL);
          rM++
        ) {
          rF[
            rC(vG(0xb6d), 0x207, 0x20e, 0x209, 0x202) +
              rC(vG(0x122), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rG++,
            ry[rA(-0x25b, -0x256, -0x24f, vG(0x5a3), -0x261)](
              ib[
                rA(-0x267, -0x256, -0x25e, vG(0x284), -0x271) +
                  rH(0x412, vG(0x122), 0x411, 0x421, 0x425)
              ](
                ry[rH(0x435, vG(0x596), 0x427, 0x434, 0x41a)](
                  ry[rB(vG(0x70d), -0x143, -0x134, -0x133, -0x137)](rL, rM),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rI
            )
          );
        }
      }
      const rJ = rF[
        rH(0x423, vG(0x472), 0x44b, 0x440, 0x45a) +
          rA(-0x280, -0x27d, -0x26e, vG(0xb6d), -0x288)
      ](
        ry[rE(-0x162, -0x164, -0x161, vG(0x92a), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          ry[rH(0x429, vG(0x89d), 0x43d, 0x437, 0x44b)](
            ry[rB(vG(0x53f), -0x10d, -0x127, -0x124, -0x116)](
              cJ,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rD
          )
        )
      );
      ry[rH(0x435, vG(0x72e), 0x43b, 0x42a, 0x448)](il, rF), (ia = rJ);
    }
    function ij(ry) {
      return new DataView(new ArrayBuffer(ry));
    }
    function ik() {
      const vH = uv;
      return hU && hU[vH(0x588)] === WebSocket[vH(0x38c)];
    }
    function il(ry) {
      const vI = uv;
      if (ik()) {
        pE += ry[vI(0x9a5)];
        if (hW) {
          const rz = new Uint8Array(ry[vI(0x959)]);
          for (let rC = 0x0; rC < rz[vI(0xd55)]; rC++) {
            rz[rC] ^= ia;
          }
          const rA = cJ % rz[vI(0xd55)],
            rB = rz[0x0];
          (rz[0x0] = rz[rA]), (rz[rA] = rB);
        }
        hU[vI(0xa6a)](ry);
      }
    }
    function im(ry, rz = 0x1) {
      const vJ = uv;
      let rA = eU(ry);
      const rB = new Uint8Array([
        cI[vJ(0x1ea)],
        rA,
        Math[vJ(0x423)](rz * 0xff),
      ]);
      il(rB);
    }
    function io(ry, rz) {
      const rA = ip();
      return (
        (io = function (rB, rC) {
          rB = rB - (-0x25b2 + 0x10 * 0x211 + 0x5b2);
          let rD = rA[rB];
          return rD;
        }),
        io(ry, rz)
      );
    }
    function ip() {
      const vK = uv,
        ry = [
          vK(0x550),
          vK(0x394),
          vK(0xdeb),
          vK(0xa4f),
          vK(0x1f3),
          vK(0x5fa),
          vK(0x986),
          vK(0xe51),
          vK(0xc8c),
          vK(0x808),
          vK(0x742),
          vK(0x110),
          vK(0xb75),
          vK(0x83f),
          vK(0x744),
          vK(0x44d),
          vK(0x5b5),
          vK(0x40a),
          vK(0x5cc),
          vK(0x201),
        ];
      return (
        (ip = function () {
          return ry;
        }),
        ip()
      );
    }
    (function (ry, rz) {
      const vL = uv;
      function rA(rG, rH, rI, rJ, rK) {
        return io(rH - -0x22a, rK);
      }
      const rB = ry();
      function rC(rG, rH, rI, rJ, rK) {
        return io(rJ - -0x178, rH);
      }
      function rD(rG, rH, rI, rJ, rK) {
        return io(rJ - 0xba, rG);
      }
      function rE(rG, rH, rI, rJ, rK) {
        return io(rG - -0x119, rI);
      }
      function rF(rG, rH, rI, rJ, rK) {
        return io(rI - -0x53, rG);
      }
      while (!![]) {
        try {
          const rG =
            (-parseInt(rE(0x9, -0x1, 0xe, 0x10, 0x0)) /
              (-0x242b + -0x3 * -0x421 + 0x17c9)) *
              (-parseInt(rF(0xc4, 0xb9, 0xc1, 0xb8, 0xc5)) /
                (0xe5b + 0x551 * 0x2 + -0x18fb)) +
            -parseInt(rE(-0x1, -0x5, -0x4, -0x4, 0x2)) /
              (0x49 * -0xb + 0x6 * 0x373 + 0x1 * -0x118c) +
            -parseInt(rC(-0x52, -0x53, -0x4d, -0x55, -0x54)) /
              (-0x10e7 + -0x14a9 + 0x2594) +
            -parseInt(rF(0xcd, 0xc0, 0xc8, 0xc6, 0xcd)) /
              (0x159 + 0x18e * 0x2 + -0x470) +
            (-parseInt(rE(0x6, -0x2, 0x10, 0x2, 0xc)) /
              (-0x1872 * -0x1 + 0x1d62 + -0x35ce)) *
              (-parseInt(rC(-0x65, -0x5d, -0x54, -0x5e, -0x66)) /
                (-0x11c + -0x682 + 0x7a5 * 0x1)) +
            -parseInt(rA(-0x112, -0x11a, -0x115, -0x122, -0x11b)) /
              (-0x2312 + -0x1 * -0x2659 + -0x33f) +
            (-parseInt(rD(0x1dc, 0x1d0, 0x1dd, 0x1d7, 0x1de)) /
              (-0x5 * 0x61f + -0x8b * 0x3e + -0x2027 * -0x2)) *
              (-parseInt(rD(0x1d8, 0x1cf, 0x1d5, 0x1cf, 0x1d5)) /
                (-0x292 * -0xb + 0x13d * -0x13 + -0x4b5));
          if (rG === rz) break;
          else rB[vL(0xe68)](rB[vL(0xc28)]());
        } catch (rH) {
          rB[vL(0xe68)](rB[vL(0xc28)]());
        }
      }
    })(ip, -0x1 * -0x304f9 + 0x1cdb2 + -0x2848f);
    function iq(ry) {
      function rz(rG, rH, rI, rJ, rK) {
        return io(rG - 0x3df, rJ);
      }
      function rA(rG, rH, rI, rJ, rK) {
        return io(rG - 0x12f, rH);
      }
      function rB(rG, rH, rI, rJ, rK) {
        return io(rJ - 0x263, rI);
      }
      const rC = {
          xgMol: function (rG) {
            return rG();
          },
          NSlTg: function (rG) {
            return rG();
          },
          BrnPE: function (rG) {
            return rG();
          },
          oiynC: function (rG, rH) {
            return rG(rH);
          },
        },
        rD = new Uint8Array([
          cI[
            rE(0x44e, 0x446, 0x44f, 0x456, 0x44f) +
              rE(0x440, 0x43c, 0x440, 0x448, 0x43d)
          ],
          rC[rB(0x387, 0x37e, 0x37e, 0x381, 0x38b)](ir),
          oR,
          rC[rF(0x4a2, 0x4a9, 0x4a0, 0x4a8, 0x49f)](ir),
          rC[rA(0x245, 0x243, 0x241, 0x249, 0x24d)](ir),
          ...rC[rB(0x381, 0x389, 0x38e, 0x384, 0x37e)](is, ry),
        ]);
      function rE(rG, rH, rI, rJ, rK) {
        return io(rG - 0x32e, rH);
      }
      function rF(rG, rH, rI, rJ, rK) {
        return io(rK - 0x38e, rI);
      }
      rC[rA(0x250, 0x24e, 0x250, 0x246, 0x24a)](il, rD);
    }
    function ir() {
      function ry(rE, rF, rG, rH, rI) {
        return io(rF - 0xd5, rH);
      }
      function rz(rE, rF, rG, rH, rI) {
        return io(rI - 0x379, rE);
      }
      const rA = {};
      function rB(rE, rF, rG, rH, rI) {
        return io(rI - 0x107, rG);
      }
      rA[rD(-0x1b1, -0x1b7, -0x1bb, -0x1ad, -0x1af)] = function (rE, rF) {
        return rE * rF;
      };
      const rC = rA;
      function rD(rE, rF, rG, rH, rI) {
        return io(rE - -0x2ca, rG);
      }
      return Math[ry(0x1f0, 0x1ec, 0x1f4, 0x1e4, 0x1ea)](
        rC[rD(-0x1b1, -0x1ab, -0x1b8, -0x1b0, -0x1b4)](
          Math[rD(-0x1b7, -0x1bb, -0x1bd, -0x1b7, -0x1b2) + "m"](),
          -0x2573 + -0xe * 0x11e + 0x3616
        )
      );
    }
    function is(ry) {
      function rz(rA, rB, rC, rD, rE) {
        return io(rE - 0x117, rB);
      }
      return new TextEncoder()[rz(0x22e, 0x22d, 0x237, 0x22b, 0x233) + "e"](ry);
    }
    function it(ry, rz, rA = 0x3c) {
      const vM = uv;
      iu(),
        (kk[vM(0x63c)] = vM(0x845) + ry + vM(0xbc6) + rz + vM(0x426)),
        kk[vM(0x6c4)](hY),
        (hY[vM(0xa71)][vM(0x3c1)] = ""),
        (i3[vM(0xa71)][vM(0x3c1)] = vM(0x846)),
        (i0[vM(0xa71)][vM(0x3c1)] = vM(0x846)),
        (hY[vM(0x91c)](vM(0x4bd))[vM(0xa71)][vM(0x8c0)] = "0"),
        document[vM(0xd97)][vM(0xdd8)][vM(0x2b0)](vM(0x3c5)),
        (kk[vM(0xa71)][vM(0x3c1)] = ""),
        (kl[vM(0xa71)][vM(0x3c1)] =
          kn[vM(0xa71)][vM(0x3c1)] =
          km[vM(0xa71)][vM(0x3c1)] =
          kC[vM(0xa71)][vM(0x3c1)] =
            vM(0x846));
      const rB = document[vM(0x91c)](vM(0xb4a));
      document[vM(0x91c)](vM(0x4de))[vM(0x81c)] = function () {
        rE();
      };
      let rC = rA;
      k8(rB, vM(0xa42) + rC + vM(0x932));
      const rD = setInterval(() => {
        const vN = vM;
        rC--, rC <= 0x0 ? rE() : k8(rB, vN(0xa42) + rC + vN(0x932));
      }, 0x3e8);
      function rE() {
        const vO = vM;
        clearInterval(rD), k8(rB, vO(0xca4)), location[vO(0xd92)]();
      }
    }
    function iu() {
      const vP = uv;
      if (hU) {
        hU[vP(0x11f)] = hU[vP(0x453)] = hU[vP(0x4d7)] = null;
        try {
          hU[vP(0x145)]();
        } catch (ry) {}
        hU = null;
      }
    }
    var iv = {},
      iw = [],
      ix,
      iy,
      iz = [],
      iA = uv(0xad3);
    function iB() {
      const vQ = uv;
      iA = getComputedStyle(document[vQ(0xd97)])[vQ(0xa87)];
    }
    var iC = document[uv(0x91c)](uv(0x2ae)),
      iD = document[uv(0x91c)](uv(0x1d9)),
      iE = document[uv(0x91c)](uv(0x2ab)),
      iF = [],
      iG = [],
      iH = ![],
      iI = 0x0;
    function iJ(ry) {
      const vR = uv;
      if(hack.isEnabled('numberNoSuffix')) return Math.round(ry);
      if (ry < 0.01) return "0";
      ry = Math[vR(0x423)](ry);
      if (ry >= 0x3b9aca00)
        return parseFloat((ry / 0x3b9aca00)[vR(0x165)](0x2)) + "b";
      else {
        if (ry >= 0xf4240)
          return parseFloat((ry / 0xf4240)[vR(0x165)](0x2)) + "m";
        else {
          if (ry >= 0x3e8)
            return parseFloat((ry / 0x3e8)[vR(0x165)](0x1)) + "k";
        }
      }
      return ry;
    }
    function iK(ry, rz) {
      const vS = uv,
        rA = document[vS(0xa69)](vS(0x3eb));
      rA[vS(0xe60)] = vS(0x73f);
      const rB = document[vS(0xa69)](vS(0x3eb));
      (rB[vS(0xe60)] = vS(0x454)), rA[vS(0x6c4)](rB);
      const rC = document[vS(0xa69)](vS(0x7ac));
      rA[vS(0x6c4)](rC), iC[vS(0x6c4)](rA);
      const rD = {};
      (rD[vS(0xa32)] = ry),
        (rD[vS(0x4c4)] = rz),
        (rD[vS(0x5d2)] = 0x0),
        (rD[vS(0x5d6)] = 0x0),
        (rD[vS(0xaa5)] = 0x0),
        (rD["el"] = rA),
        (rD[vS(0x442)] = rB),
        (rD[vS(0x5fe)] = rC);
      const rE = rD;
      (rE[vS(0x83c)] = iG[vS(0xd55)]),
        (rE[vS(0xbce)] = function () {
          const vT = vS;
          (this[vT(0x5d2)] = pw(this[vT(0x5d2)], this[vT(0x4c4)], 0x64)),
            (this[vT(0xaa5)] = pw(this[vT(0xaa5)], this[vT(0x5d6)], 0x64)),
            this[vT(0x5fe)][vT(0xe2b)](
              vT(0x8e6),
              (this[vT(0xa32)] ? this[vT(0xa32)] + vT(0xdb1) : "") +
                iJ(this[vT(0x5d2)])
            ),
            (this[vT(0x442)][vT(0xa71)][vT(0x52e)] = this[vT(0xaa5)] + "%");
        }),
        rE[vS(0xbce)](),
        iG[vS(0xe68)](rE);
    }
    function iL(ry) {
      const vU = uv;
      if (iG[vU(0xd55)] === 0x0) return;
      const rz = iG[0x0];
      rz[vU(0x5d6)] = rz[vU(0xaa5)] = 0x64;
      for (let rA = 0x1; rA < iG[vU(0xd55)]; rA++) {
        const rB = iG[rA];
        (rB[vU(0x5d6)] =
          Math[vU(0x77f)](
            0x1,
            rz[vU(0x4c4)] === 0x0 ? 0x1 : rB[vU(0x4c4)] / rz[vU(0x4c4)]
          ) * 0x64),
          ry && (rB[vU(0xaa5)] = rB[vU(0x5d6)]),
          iC[vU(0x6c4)](rB["el"]);
      }
    }
    function iM(ry) {
      const vV = uv,
        rz = new Path2D();
      rz[vV(0xb9f)](...ry[vV(0xe06)][0x0]);
      for (let rA = 0x0; rA < ry[vV(0xe06)][vV(0xd55)] - 0x1; rA++) {
        const rB = ry[vV(0xe06)][rA],
          rC = ry[vV(0xe06)][rA + 0x1];
        let rD = 0x0;
        const rE = rC[0x0] - rB[0x0],
          rF = rC[0x1] - rB[0x1],
          rG = Math[vV(0x805)](rE, rF);
        while (rD < rG) {
          rz[vV(0xcac)](
            rB[0x0] + (rD / rG) * rE + (Math[vV(0xbf6)]() * 0x2 - 0x1) * 0x32,
            rB[0x1] + (rD / rG) * rF + (Math[vV(0xbf6)]() * 0x2 - 0x1) * 0x32
          ),
            (rD += Math[vV(0xbf6)]() * 0x28 + 0x1e);
        }
        rz[vV(0xcac)](...rC);
      }
      ry[vV(0xaa7)] = rz;
    }
    var iN = 0x0,
      iO = 0x0,
      iP = [],
      iQ = {},
      iR = [],
      iS = {};
    function iT(ry, rz) {
      const vW = uv;
      if (!pb[vW(0x9ea)]) return;
      let baseHP = hack.getHP(ry);
      let decDmg = ry['nHealth'] - rz;
      let dmg = Math.floor(decDmg * 10000) / 100 + '%';
      if(baseHP && hack.isEnabled('DDenableNumber')) dmg = Math.floor(decDmg * baseHP);
      let rA;
      const rB = rz === void 0x0;
      !rB && (rA = Math[vW(0x9f9)]((ry[vW(0x60c)] - rz) * 0x64) || 0x1),
        iz[vW(0xe68)]({
          text: hack.isEnabled('damageDisplay') ? dmg : rA,
          x: ry["x"] + (Math[vW(0xbf6)]() * 0x2 - 0x1) * ry[vW(0x3aa)] * 0.6,
          y: ry["y"] + (Math[vW(0xbf6)]() * 0x2 - 0x1) * ry[vW(0x3aa)] * 0.6,
          vx: (Math[vW(0xbf6)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[vW(0xbf6)]() * 0x3,
          angle: (Math[vW(0xbf6)]() * 0x2 - 0x1) * (rB ? 0x1 : 0.1),
          size: Math[vW(0xb8e)](0x1, (ry[vW(0x3aa)] * 0.2) / 0x14),
        }),
        ry === iy && (pv = 0x1);
    }
    var iU = 0x0,
      iV = 0x0,
      iW = 0x0,
      iX = 0x0;
    function iY(ry) {
      const vX = uv,
        rz = iv[ry];
      if (rz) {
        rz[vX(0xc52)] = !![];
        if (
          Math[vX(0x911)](rz["nx"] - iU) > iW + rz[vX(0xc04)] ||
          Math[vX(0x911)](rz["ny"] - iV) > iX + rz[vX(0xc04)]
        )
          rz[vX(0x722)] = 0xa;
        else !rz[vX(0xafc)] && iT(rz, 0x0);
        delete iv[ry];
      }
    }
    var iZ = [
      uv(0x366),
      uv(0x7ea),
      uv(0x74b),
      uv(0xc05),
      uv(0x84b),
      uv(0x4f4),
      uv(0xce2),
      uv(0xb93),
      uv(0x71d),
      uv(0xd77),
      uv(0x621),
      uv(0x6b2),
      uv(0x479),
    ];
    function j0(ry, rz = iy) {
      const vY = uv;
      (ry[vY(0x366)] = rz[vY(0x366)]),
        (ry[vY(0x7ea)] = rz[vY(0x7ea)]),
        (ry[vY(0x74b)] = rz[vY(0x74b)]),
        (ry[vY(0xc05)] = rz[vY(0xc05)]),
        (ry[vY(0x84b)] = rz[vY(0x84b)]),
        (ry[vY(0x4f4)] = rz[vY(0x4f4)]),
        (ry[vY(0xce2)] = rz[vY(0xce2)]),
        (ry[vY(0xb93)] = rz[vY(0xb93)]),
        (ry[vY(0x71d)] = rz[vY(0x71d)]),
        (ry[vY(0xd77)] = rz[vY(0xd77)]),
        (ry[vY(0x84d)] = rz[vY(0x84d)]),
        (ry[vY(0x621)] = rz[vY(0x621)]),
        (ry[vY(0x3b5)] = rz[vY(0x3b5)]),
        (ry[vY(0x6b2)] = rz[vY(0x6b2)]),
        (ry[vY(0x479)] = rz[vY(0x479)]);
    }
    function j1() {
      (oZ = null), p7(null), (p3 = null), (p1 = ![]), (p2 = 0x0), ol && pM();
    }
    var j2 = 0x64,
      j3 = 0x1,
      j4 = 0x64,
      j5 = 0x1,
      j6 = {},
      j7 = [...Object[uv(0x5de)](d9)],
      j8 = [...hQ];
    ja(j7),
      ja(j8),
      j7[uv(0xe68)](uv(0x53d)),
      j8[uv(0xe68)](hP[uv(0x721)] || uv(0x3a2)),
      j7[uv(0xe68)](uv(0xcf7)),
      j8[uv(0xe68)](uv(0x3b1));
    var j9 = [];
    for (let ry = 0x0; ry < j7[uv(0xd55)]; ry++) {
      const rz = d9[j7[ry]] || 0x0;
      j9[ry] = 0x78 + (rz - d9[uv(0xadc)]) * 0x3c - 0x1 + 0x1;
    }
    function ja(rA) {
      const rB = rA[0x3];
      (rA[0x3] = rA[0x5]), (rA[0x5] = rB);
    }
    var jb = [],
      jc = [];
    function jd(rA) {
      const vZ = uv,
        rB = j8[rA],
        rC = nQ(
          vZ(0x49b) + j7[rA] + vZ(0x483) + rB + vZ(0x181) + rB + vZ(0x687)
        ),
        rD = rC[vZ(0x91c)](vZ(0xc00));
      (j6 = {
        id: rA,
        el: rC,
        state: cT[vZ(0x846)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rC[vZ(0x91c)](vZ(0x3e8)),
        progressEl: rD,
        barEl: rD[vZ(0x91c)](vZ(0xba1)),
        textEl: rD[vZ(0x91c)](vZ(0x7ac)),
        nameEl: rC[vZ(0x91c)](vZ(0x3b9)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const w0 = vZ,
            rE = Math[w0(0x77f)](0x1, (pP - this[w0(0xd06)]) / 0x64);
          this[w0(0xcb7)] =
            this[w0(0xb5b)] + (this[w0(0xa36)] - this[w0(0xb5b)]) * rE;
          const rF = this[w0(0xcb7)] - 0x1;
          this[w0(0x442)][w0(0xa71)][w0(0xde3)] =
            w0(0xdd6) + rF * 0x64 + w0(0x7e5) + rF + w0(0xc0d);
        },
        update() {
          const w1 = vZ,
            rE = je(this["t"]),
            rF = 0x1 - rE;
          (this["el"][w1(0xa71)][w1(0x8c0)] = -0xc8 * rF + "px"),
            (this["el"][w1(0xa71)][w1(0xde3)] = w1(0x1d3) + -0x64 * rF + "%)");
        },
        remove() {
          const w2 = vZ;
          rC[w2(0x2b0)]();
        },
      }),
        (j6[vZ(0xe04)][vZ(0xa71)][vZ(0x3c1)] = vZ(0x846)),
        jc[vZ(0xe68)](j6),
        j6[vZ(0xbce)](),
        jb[vZ(0xe68)](j6),
        km[vZ(0x6c0)](rC, q2);
    }
    function je(rA) {
      return 0x1 - (0x1 - rA) * (0x1 - rA);
    }
    function jf(rA) {
      const w3 = uv;
      return rA < 0.5
        ? (0x1 - Math[w3(0xe50)](0x1 - Math[w3(0xa4e)](0x2 * rA, 0x2))) / 0x2
        : (Math[w3(0xe50)](0x1 - Math[w3(0xa4e)](-0x2 * rA + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jg() {
      const w4 = uv;
      (oA[w4(0x63c)] = ""), (oC = {});
    }
    var jh = document[uv(0x91c)](uv(0xc7d));
    jh[uv(0xa71)][uv(0x3c1)] = uv(0x846);
    var ji = document[uv(0x91c)](uv(0xe56)),
      jj = [],
      jk = document[uv(0x91c)](uv(0x97d));
    jk[uv(0x220)] = function () {
      jl();
    };
    function jl() {
      const w5 = uv;
      for (let rA = 0x0; rA < jj[w5(0xd55)]; rA++) {
        const rB = jj[rA];
        k8(rB[w5(0xba2)][0x0], jk[w5(0xc4e)] ? w5(0xdda) : rB[w5(0x7fd)]);
      }
    }
    function jm(rA) {
      const w6 = uv;
      (jh[w6(0xa71)][w6(0x3c1)] = ""), (ji[w6(0x63c)] = w6(0xddb));
      const rB = rA[w6(0xd55)];
      jj = [];
      for (let rC = 0x0; rC < rB; rC++) {
        const rD = rA[rC];
        ji[w6(0x6c4)](nQ(w6(0x77d) + (rC + 0x1) + w6(0x21b))), jn(rD);
      }
      m2[w6(0xd8d)][w6(0x7f0)]();
    }
    function jn(rA) {
      const w7 = uv;
      for (let rB = 0x0; rB < rA[w7(0xd55)]; rB++) {
        const rC = rA[rB],
          rD = nQ(w7(0xbde) + rC + w7(0x3fe));
        (rD[w7(0x7fd)] = rC),
          rB > 0x0 && jj[w7(0xe68)](rD),
          (rD[w7(0x81c)] = function () {
            jp(rC);
          }),
          ji[w7(0x6c4)](rD);
      }
      jl();
    }
    function jo(rA) {
      const w8 = uv;
      var rB = document[w8(0xa69)](w8(0x526));
      (rB[w8(0x2e6)] = rA),
        (rB[w8(0xa71)][w8(0x8ed)] = "0"),
        (rB[w8(0xa71)][w8(0x9c9)] = "0"),
        (rB[w8(0xa71)][w8(0x77a)] = w8(0x861)),
        document[w8(0xd97)][w8(0x6c4)](rB),
        rB[w8(0x2dd)](),
        rB[w8(0xdff)]();
      try {
        var rC = document[w8(0xe09)](w8(0x737)),
          rD = rC ? w8(0x430) : w8(0xad6);
      } catch (rE) {}
      document[w8(0xd97)][w8(0x6d5)](rB);
    }
    function jp(rA) {
      const w9 = uv;
      if (!navigator[w9(0x12b)]) {
        jo(rA);
        return;
      }
      navigator[w9(0x12b)][w9(0x5f6)](rA)[w9(0x970)](
        function () {},
        function (rB) {}
      );
    }
    var jq = [
        uv(0x738),
        uv(0x891),
        uv(0xbc4),
        uv(0x2d6),
        uv(0x179),
        uv(0x492),
        uv(0xbd8),
        uv(0x772),
        uv(0xcdd),
        uv(0x6c1),
        uv(0x4ba),
      ],
      jr = [uv(0xdf9), uv(0x33f), uv(0x31d)];
    function js(rA) {
      const wa = uv,
        rB = rA ? jr : jq;
      return rB[Math[wa(0xc8c)](Math[wa(0xbf6)]() * rB[wa(0xd55)])];
    }
    function jt(rA) {
      const wb = uv;
      return rA[wb(0xb4b)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var ju = document[uv(0x91c)](uv(0xc68));
    ju[uv(0x81c)] = nv(function (rA) {
      const wc = uv;
      iy && il(new Uint8Array([cI[wc(0x345)]]));
    });
    var jv = "";
    function jw(rA) {
      const wd = uv;
      return rA[wd(0xb02)](/"/g, wd(0xb87));
    }
    function jx(rA) {
      const we = uv;
      let rB = "";
      for (let rC = 0x0; rC < rA[we(0xd55)]; rC++) {
        const [rD, rE, rF] = rA[rC];
        rB +=
          we(0x84e) +
          rD +
          "\x22\x20" +
          (rF ? we(0x655) : "") +
          we(0x762) +
          jw(rE) +
          we(0x410);
      }
      return we(0x222) + rB + we(0x36b);
    }
    var jy = ![];
    function jz() {
      const wf = uv;
      return nQ(wf(0x990) + hP[wf(0xadc)] + wf(0x31c));
    }
    var jA = document[uv(0x91c)](uv(0x8a6));
    function jB() {
      const wg = uv;
      (oS[wg(0xa71)][wg(0x3c1)] = q2[wg(0xa71)][wg(0x3c1)] =
        jy ? wg(0x846) : ""),
        (jA[wg(0xa71)][wg(0x3c1)] = ky[wg(0xa71)][wg(0x3c1)] =
          jy ? "" : wg(0x846));
      jy
        ? (kz[wg(0xdd8)][wg(0x1b1)](wg(0x9b2)),
          k8(kz[wg(0xba2)][0x0], wg(0x62d)))
        : (kz[wg(0xdd8)][wg(0x2b0)](wg(0x9b2)),
          k8(kz[wg(0xba2)][0x0], wg(0xd6d)));
      const rA = [hG, mm];
      for (let rB = 0x0; rB < rA[wg(0xd55)]; rB++) {
        const rC = rA[rB];
        rC[wg(0xdd8)][jy ? wg(0x1b1) : wg(0x2b0)](wg(0x53b)),
          (rC[wg(0x6d2)] = jy ? jz : null),
          (rC[wg(0x380)] = !![]);
      }
      jC[wg(0xa71)][wg(0x3c1)] = nZ[wg(0xa71)][wg(0x3c1)] = jy ? wg(0x846) : "";
    }
    var jC = document[uv(0x91c)](uv(0x536)),
      jD = document[uv(0x91c)](uv(0x686)),
      jE = 0x0,
      jF = 0x3e8 / 0x14,
      jG = 0x0,
      jH = [],
      jI = 0x0,
      jJ = ![],
      jK,
      jL = [],
      jM = {};
    setInterval(() => {
      (jM = {}), (jL = []);
    }, 0x7530);
    function jN(rA, rB) {
      const wh = uv;
      jM[rB] = (jM[rB] || 0x0) + 0x1;
      if (jM[rB] > 0x8) return ![];
      let rC = 0x0;
      for (let rD = jL[wh(0xd55)] - 0x1; rD >= 0x0; rD--) {
        const rE = jL[rD];
        if (nx(rA, rE) > 0.7) {
          rC++;
          if (rC >= 0x5) return ![];
        }
      }
      return jL[wh(0xe68)](rA), !![];
    }
    var jO = document[uv(0x91c)](uv(0x62e)),
      jP = document[uv(0x91c)](uv(0xad4)),
      jQ = document[uv(0x91c)](uv(0xd9f)),
      jR = document[uv(0x91c)](uv(0xd0b)),
      jS;
    k8(jQ, "-"),
      (jQ[uv(0x81c)] = function () {
        if (jS) mz(jS);
      });
    var jT = 0x0,
      jU = document[uv(0x91c)](uv(0xb80));
    setInterval(() => {
      const wi = uv;
      jT--;
      if (jT < 0x0) {
        jU[wi(0xdd8)][wi(0xd6c)](wi(0x7f0)) &&
          hW &&
          il(new Uint8Array([cI[wi(0x6ef)]]));
        return;
      }
      jV();
    }, 0x3e8);
    function jV() {
      k8(jR, ka(jT * 0x3e8));
    }
    function jW() {
      const wj = uv,
        rA = document[wj(0x91c)](wj(0xae3))[wj(0xba2)],
        rB = document[wj(0x91c)](wj(0x514))[wj(0xba2)];
      for (let rC = 0x0; rC < rA[wj(0xd55)]; rC++) {
        const rD = rA[rC],
          rE = rB[rC];
        rD[wj(0x81c)] = function () {
          const wk = wj;
          for (let rF = 0x0; rF < rB[wk(0xd55)]; rF++) {
            const rG = rC === rF;
            (rB[rF][wk(0xa71)][wk(0x3c1)] = rG ? "" : wk(0x846)),
              rA[rF][wk(0xdd8)][rG ? wk(0x1b1) : wk(0x2b0)](wk(0x65f));
          }
        };
      }
      rA[0x0][wj(0x81c)]();
    }
    jW();
    var jX = [];
    function jY(rA) {
      const wl = uv;
      rA[wl(0xdd8)][wl(0x1b1)](wl(0x878)), jX[wl(0xe68)](rA);
    }
    var jZ,
      k0 = document[uv(0x91c)](uv(0x318));
    function k1(rA, rB = !![]) {
      const wm = uv;
      if (rB) {
        if (pP < jG) {
          jH[wm(0xe68)](rA);
          return;
        } else {
          if (jH[wm(0xd55)] > 0x0)
            while (jH[wm(0xd55)] > 0x0) {
              k1(jH[wm(0xc28)](), ![]);
            }
        }
      }
      function rC() {
        const wn = wm,
          rO = rL[wn(0x353)](rM++),
          rP = new Uint8Array(rO);
        for (let rQ = 0x0; rQ < rO; rQ++) {
          rP[rQ] = rL[wn(0x353)](rM++);
        }
        return new TextDecoder()[wn(0xc5c)](rP);
      }
      function rD() {
        const wo = wm;
        return rL[wo(0x353)](rM++) / 0xff;
      }
      function rE(rO) {
        const wp = wm,
          rP = rL[wp(0x94d)](rM);
        (rM += 0x2),
          (rO[wp(0x586)] = rP & 0x1),
          (rO[wp(0x366)] = rP & 0x2),
          (rO[wp(0x7ea)] = rP & 0x4),
          (rO[wp(0x74b)] = rP & 0x8),
          (rO[wp(0xc05)] = rP & 0x10),
          (rO[wp(0x84b)] = rP & 0x20),
          (rO[wp(0x4f4)] = rP & 0x40),
          (rO[wp(0xce2)] = rP & 0x80),
          (rO[wp(0xb93)] = rP & 0x100),
          (rO[wp(0x71d)] = rP & (0x1 << 0x9)),
          (rO[wp(0xd77)] = rP & (0x1 << 0xa)),
          (rO[wp(0x84d)] = rP & (0x1 << 0xb)),
          (rO[wp(0x621)] = rP & (0x1 << 0xc)),
          (rO[wp(0x3b5)] = rP & (0x1 << 0xd)),
          (rO[wp(0x6b2)] = rP & (0x1 << 0xe)),
          (rO[wp(0x479)] = rP & (0x1 << 0xf));
      }
      function rF() {
        const wq = wm,
          rO = rL[wq(0x2bf)](rM);
        rM += 0x4;
        const rP = rC();
        iK(rP, rO);
      }
      function rG() {
        const wr = wm,
          rO = rL[wr(0x94d)](rM) - cG;
        return (rM += 0x2), rO;
      }
      function rH() {
        const ws = wm,
          rO = {};
        for (let rZ in mq) {
          (rO[rZ] = rL[ws(0x2bf)](rM)), (rM += 0x4);
        }
        const rP = rC(),
          rQ = Number(rL[ws(0x64c)](rM));
        rM += 0x8;
        const rR = d5(d4(rQ)[0x0]),
          rS = rR * 0x2,
          rT = Array(rS);
        for (let s0 = 0x0; s0 < rS; s0++) {
          const s1 = rL[ws(0x94d)](rM) - 0x1;
          rM += 0x2;
          if (s1 < 0x0) continue;
          rT[s0] = dC[s1];
        }
        const rU = [],
          rV = rL[ws(0x94d)](rM);
        rM += 0x2;
        for (let s2 = 0x0; s2 < rV; s2++) {
          const s3 = rL[ws(0x94d)](rM);
          rM += 0x2;
          const s4 = rL[ws(0x2bf)](rM);
          (rM += 0x4), rU[ws(0xe68)]([dC[s3], s4]);
        }
        const rW = [],
          rX = rL[ws(0x94d)](rM);
        rM += 0x2;
        for (let s5 = 0x0; s5 < rX; s5++) {
          const s6 = rL[ws(0x94d)](rM);
          (rM += 0x2), !eK[s6] && console[ws(0xdc3)](s6), rW[ws(0xe68)](eK[s6]);
        }
        const rY = rL[ws(0x353)](rM++);
        mv(rP, rO, rU, rW, rQ, rT, rY);
      }
      function rI() {
        const wt = wm,
          rO = Number(rL[wt(0x64c)](rM));
        return (rM += 0x8), rO;
      }
      function rJ() {
        const wu = wm,
          rO = rL[wu(0x2bf)](rM);
        rM += 0x4;
        const rP = rL[wu(0x353)](rM++),
          rQ = {};
        (rQ[wu(0x162)] = rO), (rQ[wu(0xb66)] = {});
        const rR = rQ;
        f3[wu(0x275)]((rT, rU) => {
          const wv = wu;
          rR[wv(0xb66)][rT] = [];
          for (let rV = 0x0; rV < rP; rV++) {
            const rW = rC();
            let rX;
            rT === "xp" ? (rX = rI()) : ((rX = rL[wv(0x2bf)](rM)), (rM += 0x4)),
              rR[wv(0xb66)][rT][wv(0xe68)]([rW, rX]);
          }
        }),
          k8(jD, k9(rR[wu(0x162)]) + wu(0xa18)),
          (mC[wu(0x63c)] = "");
        let rS = 0x0;
        for (let rT in rR[wu(0xb66)]) {
          const rU = kd(rT),
            rV = rR[wu(0xb66)][rT],
            rW = nQ(wu(0xbc3) + rS + wu(0x7d0) + rU + wu(0x161)),
            rX = rW[wu(0x91c)](wu(0xe3a));
          for (let rY = 0x0; rY < rV[wu(0xd55)]; rY++) {
            const [rZ, s0] = rV[rY];
            let s1 = mp(rT, s0);
            rT === "xp" && (s1 += wu(0x84a) + (d4(s0)[0x0] + 0x1) + ")");
            const s2 = nQ(
              wu(0xaea) + (rY + 0x1) + ".\x20" + rZ + wu(0x497) + s1 + wu(0xe05)
            );
            (s2[wu(0x81c)] = function () {
              mz(rZ);
            }),
              rX[wu(0xd38)](s2);
          }
          mC[wu(0xd38)](rW), rS++;
        }
      }
      function rK() {
        const ww = wm;
        (jS = rC()), k8(jQ, jS || "-");
        const rO = Number(rL[ww(0x64c)](rM));
        (rM += 0x8),
          (jT = Math[ww(0x423)]((rO - Date[ww(0xd3f)]()) / 0x3e8)),
          jV();
        const rP = rL[ww(0x94d)](rM);
        rM += 0x2;
        if (rP === 0x0) jP[ww(0x63c)] = ww(0x8e3);
        else {
          jP[ww(0x63c)] = "";
          for (let rR = 0x0; rR < rP; rR++) {
            const rS = rC(),
              rT = rL[ww(0xcf0)](rM);
            rM += 0x4;
            const rU = rT * 0x64,
              rV = rU >= 0x1 ? rU[ww(0x165)](0x2) : rU[ww(0x165)](0x5),
              rW = nQ(
                ww(0xe39) +
                  (rR + 0x1) +
                  ".\x20" +
                  rS +
                  ww(0x65a) +
                  rV +
                  ww(0xd2f)
              );
            rS === jv && rW[ww(0xdd8)][ww(0x1b1)]("me"),
              (rW[ww(0x81c)] = function () {
                mz(rS);
              }),
              jP[ww(0x6c4)](rW);
          }
        }
        k0[ww(0x63c)] = "";
        const rQ = rL[ww(0x94d)](rM);
        (rM += 0x2), (jZ = {});
        if (rQ === 0x0)
          (jO[ww(0x63c)] = ww(0x14d)), (k0[ww(0xa71)][ww(0x3c1)] = ww(0x846));
        else {
          const rX = {};
          jO[ww(0x63c)] = "";
          for (let rY = 0x0; rY < rQ; rY++) {
            const rZ = rL[ww(0x94d)](rM);
            rM += 0x2;
            const s0 = rL[ww(0x2bf)](rM);
            (rM += 0x4), (jZ[rZ] = s0);
            const s1 = dC[rZ],
              s2 = nQ(
                ww(0x4ca) +
                  s1[ww(0x2a3)] +
                  ww(0x8d6) +
                  qA(s1) +
                  ww(0x648) +
                  s0 +
                  ww(0xd62)
              );
            (s2[ww(0xc0a)] = jU),
              jY(s2),
              (s2[ww(0x6d2)] = s1),
              jO[ww(0x6c4)](s2),
              (rX[s1[ww(0x2a3)]] = (rX[s1[ww(0x2a3)]] || 0x0) + s0);
          }
          od(jO), (k0[ww(0xa71)][ww(0x3c1)] = ""), oE(k0, rX);
        }
      }
      const rL = new DataView(rA[wm(0x5e4)]);
      pE += rL[wm(0x9a5)];
      let rM = 0x0;
      const rN = rL[wm(0x353)](rM++);
      switch (rN) {
        case cI[wm(0xb0c)]:
          {
            const s9 = rL[wm(0x94d)](rM);
            rM += 0x2;
            for (let sa = 0x0; sa < s9; sa++) {
              const sb = rL[wm(0x94d)](rM);
              rM += 0x2;
              const sc = rL[wm(0x2bf)](rM);
              (rM += 0x4), n5(sb, sc);
            }
          }
          break;
        case cI[wm(0x5b8)]:
          rK();
          break;
        case cI[wm(0x17e)]:
          kC[wm(0xdd8)][wm(0x1b1)](wm(0x7f0)), hT(), (jG = pP + 0x1f4);
          break;
        case cI[wm(0xde5)]:
          (mk[wm(0x63c)] = wm(0x62b)), mk[wm(0x6c4)](mn), (mo = ![]);
          break;
        case cI[wm(0xb0b)]: {
          const sd = dC[rL[wm(0x94d)](rM)];
          rM += 0x2;
          const se = rL[wm(0x2bf)](rM);
          (rM += 0x4),
            (mk[wm(0x63c)] =
              wm(0xe5f) +
              sd[wm(0x2a3)] +
              "\x22\x20" +
              qA(sd) +
              wm(0x648) +
              k9(se) +
              wm(0xc65));
          const sf = mk[wm(0x91c)](wm(0xc46));
          (sf[wm(0x6d2)] = sd),
            (sf[wm(0x81c)] = function () {
              const wx = wm;
              n5(sd["id"], se), (this[wx(0x81c)] = null), mn[wx(0x81c)]();
            }),
            (mo = ![]);
          break;
        }
        case cI[wm(0x504)]: {
          const sg = rL[wm(0x353)](rM++),
            sh = rL[wm(0x2bf)](rM);
          rM += 0x4;
          const si = rC();
          (mk[wm(0x63c)] =
            wm(0x23f) +
            si +
            wm(0x483) +
            hP[wm(0x31b)] +
            wm(0x1aa) +
            k9(sh) +
            "\x20" +
            hN[sg] +
            wm(0x483) +
            hQ[sg] +
            wm(0x859)),
            (mk[wm(0x91c)](wm(0x7d2))[wm(0x81c)] = function () {
              mz(si);
            }),
            mk[wm(0x6c4)](mn),
            (mo = ![]);
          break;
        }
        case cI[wm(0x9e4)]:
          (mk[wm(0x63c)] = wm(0x5ad)), mk[wm(0x6c4)](mn), (mo = ![]);
          break;
        case cI[wm(0x3b0)]:
          hK(wm(0x36e));
          break;
        case cI[wm(0x399)]:
          rJ();
          break;
        case cI[wm(0xdba)]:
          hK(wm(0xcc2)), hc(wm(0xcc2));
          break;
        case cI[wm(0xbfc)]:
          hK(wm(0x1b4)), hc(wm(0xc6b));
          break;
        case cI[wm(0xb90)]:
          hK(wm(0xd0e));
          break;
        case cI[wm(0xdc7)]:
          rH();
          break;
        case cI[wm(0x92c)]:
          hc(wm(0x1f6));
          break;
        case cI[wm(0xa47)]:
          hc(wm(0xca1), hP[wm(0x721)]), hJ(hH);
          break;
        case cI[wm(0xd8d)]:
          const rO = rL[wm(0x94d)](rM);
          rM += 0x2;
          const rP = [];
          for (let sj = 0x0; sj < rO; sj++) {
            const sk = rL[wm(0x2bf)](rM);
            rM += 0x4;
            const sl = rC(),
              sm = rC(),
              sn = rC();
            rP[wm(0xe68)]([sl || wm(0xa70) + sk, sm, sn]);
          }
          jm(rP);
          break;
        case cI[wm(0xa5b)]:
          for (let so in mq) {
            const sp = rL[wm(0x2bf)](rM);
            (rM += 0x4), mr[so][wm(0xc8a)](sp);
          }
          break;
        case cI[wm(0xe47)]:
          const rQ = rL[wm(0x353)](rM++),
            rR = rL[wm(0x2bf)](rM++),
            rS = {};
          (rS[wm(0x821)] = rQ), (rS[wm(0x8eb)] = rR), (p3 = rS);
          break;
        case cI[wm(0x584)]:
          (i0[wm(0xa71)][wm(0x3c1)] = i6 ? "" : wm(0x846)),
            (i3[wm(0xa71)][wm(0x3c1)] = !i6 ? "" : wm(0x846)),
            (hY[wm(0xa71)][wm(0x3c1)] = ""),
            (kn[wm(0xa71)][wm(0x3c1)] = wm(0x846)),
            (hW = !![]),
            kB[wm(0xdd8)][wm(0x1b1)](wm(0x7f0)),
            kA[wm(0xdd8)][wm(0x2b0)](wm(0x7f0)),
            j1(),
            m1(![]),
            (ix = rL[wm(0x2bf)](rM)),
            (rM += 0x4),
            (jv = rC()),
            hack.player.name = jv,
            hJ(jv),
            (jy = rL[wm(0x353)](rM++)),
            jB(),
            (j2 = rL[wm(0x94d)](rM)),
            (rM += 0x2),
            (j5 = rL[wm(0x353)](rM++)),
            (j4 = j2 / j5),
            (j3 = j2 / 0x3),
            (oG = rI()),
            oQ(),
            oT(),
            (iN = d5(oH)),
            (iO = iN * 0x2),
            (iP = Array(iO)),
            (iQ = {}),
            (iR = d7());
          for (let sq = 0x0; sq < iO; sq++) {
            const sr = rL[wm(0x94d)](rM) - 0x1;
            rM += 0x2;
            if (sr < 0x0) continue;
            iP[sq] = dC[sr];
          }
          nL(), nT();
          const rT = rL[wm(0x94d)](rM);
          rM += 0x2;
          for (let ss = 0x0; ss < rT; ss++) {
            const st = rL[wm(0x94d)](rM);
            rM += 0x2;
            const su = nV(eK[st]);
            su[wm(0xc0a)] = m3;
          }
          iS = {};
          while (rM < rL[wm(0x9a5)]) {
            const sv = rL[wm(0x94d)](rM);
            rM += 0x2;
            const sw = rL[wm(0x2bf)](rM);
            (rM += 0x4), (iS[sv] = sw);
          }
          ob(), n6();
          break;
        case cI[wm(0x4bb)]:
          const rU = rL[wm(0x353)](rM++),
            rV = hL[rU] || wm(0x5f8);
          console[wm(0xdc3)](wm(0x5d5) + rV + ")"),
            (kf = rU === cR[wm(0x3ca)] || rU === cR[wm(0x7e2)]);
          !kf &&
            it(wm(0x333), wm(0x485) + rV, rU === cR[wm(0x142)] ? 0xa : 0x3c);
          break;
        case cI[wm(0x768)]:
          (hg[wm(0xa71)][wm(0x3c1)] = kn[wm(0xa71)][wm(0x3c1)] = wm(0x846)),
            kG(!![]),
            ju[wm(0xdd8)][wm(0x1b1)](wm(0x7f0)),
            jg(),
            (pi[wm(0xa71)][wm(0x3c1)] = "");
          for (let sx in iQ) {
            iQ[sx][wm(0xe46)] = 0x0;
          }
          (jI = pP),
            (nn = {}),
            (nf = 0x1),
            (ng = 0x1),
            (nd = 0x0),
            (ne = 0x0),
            mG(),
            (na = cY[wm(0xdf2)]),
            (jE = pP);
          break;
        case cI[wm(0xbce)]:
          (pD = pP - jE), (jE = pP), q9[wm(0xc8a)](rD()), qb[wm(0xc8a)](rD());
          if (jy) {
            const sy = rL[wm(0x353)](rM++);
            (jJ = sy & 0x80), (jK = f6[sy & 0x7f]);
          } else (jJ = ![]), (jK = null), qc[wm(0xc8a)](rD());
          (pK = 0x1 + cW[rL[wm(0x353)](rM++)] / 0x64),
            (iW = (d0 / 0x2) * pK),
            (iX = (d1 / 0x2) * pK);
          const rW = rL[wm(0x94d)](rM);
          rM += 0x2;
          for (let sz = 0x0; sz < rW; sz++) {
            const sA = rL[wm(0x2bf)](rM);
            rM += 0x4;
            let sB = iv[sA];
            if (sB) {
              if (sB[wm(0xa40)]) {
                sB[wm(0xb53)] = rL[wm(0x353)](rM++) - 0x1;
                continue;
              }
              const sC = rL[wm(0x353)](rM++);
              sC & 0x1 &&
                ((sB["nx"] = rG()), (sB["ny"] = rG()), (sB[wm(0xa57)] = 0x0));
              sC & 0x2 &&
                ((sB[wm(0xa0a)] = eS(rL[wm(0x353)](rM++))),
                (sB[wm(0xa57)] = 0x0));
              if (sC & 0x4) {
                const sD = rD();
                if (sD < sB[wm(0x60c)]) iT(sB, sD), (sB[wm(0x39d)] = 0x1);
                else sD > sB[wm(0x60c)] && (sB[wm(0x39d)] = 0x0);
                (sB[wm(0x60c)] = sD), (sB[wm(0xa57)] = 0x0);
              }
              sC & 0x8 &&
                ((sB[wm(0x34a)] = 0x1),
                (sB[wm(0xa57)] = 0x0),
                sB === iy && (pv = 0x1));
              sC & 0x10 && ((sB[wm(0xc04)] = rL[wm(0x94d)](rM)), (rM += 0x2));
              sC & 0x20 && (sB[wm(0x8c9)] = rL[wm(0x353)](rM++));
              sC & 0x40 && rE(sB);
              if (sC & 0x80) {
                if (sB[wm(0xab7)])
                  (sB[wm(0x8de)] = rL[wm(0x94d)](rM)), (rM += 0x2);
                else {
                  const sE = rD();
                  sE > sB[wm(0xb91)] && iT(sB), (sB[wm(0xb91)] = sE);
                }
              }
              sB[wm(0xab7)] && sC & 0x4 && (sB[wm(0x6b0)] = rD()),
                (sB["ox"] = sB["x"]),
                (sB["oy"] = sB["y"]),
                (sB[wm(0x88f)] = sB[wm(0x582)]),
                (sB[wm(0x7d6)] = sB[wm(0x3cb)]),
                (sB[wm(0xc2a)] = sB[wm(0x3aa)]),
                (sB[wm(0xddd)] = 0x0);
            } else {
              const sF = rL[wm(0x353)](rM++);
              if (sF === cS[wm(0xd41)]) {
                let sK = rL[wm(0x353)](rM++);
                const sL = {};
                (sL[wm(0xe06)] = []), (sL["a"] = 0x1);
                const sM = sL;
                while (sK--) {
                  const sN = rG(),
                    sO = rG();
                  sM[wm(0xe06)][wm(0xe68)]([sN, sO]);
                }
                iM(sM), (pv = 0x1), iF[wm(0xe68)](sM);
                continue;
              }
              const sG = hM[sF],
                sH = rG(),
                sI = rG(),
                sJ = sF === cS[wm(0x856)];
              if (sF === cS[wm(0xd95)] || sF === cS[wm(0x9a8)] || sJ) {
                const sP = rL[wm(0x94d)](rM);
                (rM += 0x2),
                  (sB = new lK(sF, sA, sH, sI, sP)),
                  sJ &&
                    ((sB[wm(0xa40)] = !![]),
                    (sB[wm(0xb53)] = rL[wm(0x353)](rM++) - 0x1));
              } else {
                if (sF === cS[wm(0xa19)]) {
                  const sQ = rL[wm(0x94d)](rM);
                  (rM += 0x2), (sB = new lN(sA, sH, sI, sQ));
                } else {
                  const sR = eS(rL[wm(0x353)](rM++)),
                    sS = rL[wm(0x94d)](rM);
                  rM += 0x2;
                  if (sF === cS[wm(0x684)]) {
                    const sT = rD(),
                      sU = rL[wm(0x353)](rM++);
                    (sB = new lT(sA, sH, sI, sR, sT, sU, sS)),
                      rE(sB),
                      (sB[wm(0x8de)] = rL[wm(0x94d)](rM)),
                      (rM += 0x2),
                      (sB[wm(0xa32)] = rC()),
                      (sB[wm(0x45e)] = rC()),
                      (sB[wm(0x6b0)] = rD());
                    if (ix === sA) iy = sB;
                    else {
                      if (jy) {
                        const sV = pV();
                        (sV[wm(0xcef)] = sB), pN[wm(0xe68)](sV);
                      }
                    }
                  } else {
                    if (sG[wm(0x307)](wm(0x6d2)))
                      sB = new lG(sA, sF, sH, sI, sR, sS);
                    else {
                      const sW = rD(),
                        sX = rL[wm(0x353)](rM++),
                        sY = sX >> 0x4,
                        sZ = sX & 0x1,
                        t0 = sX & 0x2,
                        t1 = rD();
                      (sB = new lG(sA, sF, sH, sI, sR, sS, sW)),
                        (sB[wm(0x2a3)] = sY),
                        (sB[wm(0x50e)] = sZ),
                        (sB[wm(0x6b2)] = t0),
                        (sB[wm(0xb91)] = t1),
                        (sB[wm(0xe0a)] = hN[sY]);
                    }
                  }
                }
              }
              (iv[sA] = sB), iw[wm(0xe68)](sB);
            }
          }
          iy &&
            ((iU = iy["nx"]),
            (iV = iy["ny"]),
            (q4[wm(0xa71)][wm(0x3c1)] = ""),
            q6(q4, iy["nx"], iy["ny"]));
          const rX = rL[wm(0x94d)](rM);
          rM += 0x2;
          for (let t2 = 0x0; t2 < rX; t2++) {
            const t3 = rL[wm(0x2bf)](rM);
            (rM += 0x4), iY(t3);
          }
          const rY = rL[wm(0x353)](rM++);
          for (let t4 = 0x0; t4 < rY; t4++) {
            const t5 = rL[wm(0x2bf)](rM);
            rM += 0x4;
            const t6 = iv[t5];
            if (t6) {
              (t6[wm(0x70a)] = iy), n5(t6[wm(0x6d2)]["id"], 0x1), iY(t5);
              if (!oC[t6[wm(0x6d2)]["id"]]) oC[t6[wm(0x6d2)]["id"]] = 0x0;
              oC[t6[wm(0x6d2)]["id"]]++;
            }
          }
          const rZ = rL[wm(0x353)](rM++);
          for (let t7 = 0x0; t7 < rZ; t7++) {
            const t8 = rL[wm(0x353)](rM++),
              t9 = rD(),
              ta = iQ[t8];
            (ta[wm(0x57d)] = t9), t9 === 0x0 && (ta[wm(0xe46)] = 0x0);
          }
          (iI = rL[wm(0x94d)](rM)), (rM += 0x2);
          const s0 = rL[wm(0x94d)](rM);
          (rM += 0x2),
            iE[wm(0xe2b)](
              wm(0x8e6),
              kh(iI, wm(0xaac)) + ",\x20" + kh(s0, wm(0x448))
            );
          const s1 = Math[wm(0x77f)](0xa, iI);
          if (iH) {
            const tb = rL[wm(0x353)](rM++),
              tc = tb >> 0x4,
              td = tb & 0xf,
              te = rL[wm(0x353)](rM++);
            for (let tg = 0x0; tg < td; tg++) {
              const th = rL[wm(0x353)](rM++);
              (iG[th][wm(0x4c4)] = rL[wm(0x2bf)](rM)), (rM += 0x4);
            }
            const tf = [];
            for (let ti = 0x0; ti < te; ti++) {
              tf[wm(0xe68)](rL[wm(0x353)](rM++));
            }
            tf[wm(0x3a4)](function (tj, tk) {
              return tk - tj;
            });
            for (let tj = 0x0; tj < te; tj++) {
              const tk = tf[tj];
              iG[tk]["el"][wm(0x2b0)](), iG[wm(0x4f9)](tk, 0x1);
            }
            for (let tl = 0x0; tl < tc; tl++) {
              rF();
            }
            iG[wm(0x3a4)](function (tm, tn) {
              const wy = wm;
              return tn[wy(0x4c4)] - tm[wy(0x4c4)];
            });
          } else {
            iG[wm(0xd55)] = 0x0;
            for (let tm = 0x0; tm < s1; tm++) {
              rF();
            }
            iH = !![];
          }
          iL();
          const s2 = rL[wm(0x353)](rM++);
          for (let tn = 0x0; tn < s2; tn++) {
            const to = rL[wm(0x94d)](rM);
            (rM += 0x2), nV(eK[to]);
          }
          const s3 = rL[wm(0x94d)](rM);
          rM += 0x2;
          for (let tp = 0x0; tp < s3; tp++) {
            const tq = rL[wm(0x353)](rM++),
              tr = tq >> 0x7,
              ts = tq & 0x7f;
            if (ts === cQ[wm(0x9ca)]) {
              const tw = rL[wm(0x353)](rM++),
                tx = rL[wm(0x353)](rM++) - 0x1;
              let ty = null,
                tz = 0x0;
              if (tr) {
                const tB = rL[wm(0x2bf)](rM);
                rM += 0x4;
                const tC = rC();
                (ty = tC || wm(0xa70) + tB), (tz = rL[wm(0x353)](rM++));
              }
              const tA = j8[tw];
              nl(
                wm(0x9ca),
                null,
                "⚡\x20" +
                  j7[tw] +
                  wm(0x8e0) +
                  (tx < 0x0
                    ? wm(0xacd)
                    : tx === 0x0
                    ? wm(0xb47)
                    : wm(0x57b) + (tx + 0x1) + "!"),
                tA
              );
              ty &&
                nk(wm(0x9ca), [
                  [wm(0x46d), "🏆"],
                  [tA, ty + wm(0xa20)],
                  [hP[wm(0xadc)], tz + wm(0x2f2)],
                  [tA, wm(0x1a5)],
                ]);
              continue;
            }
            const tt = rL[wm(0x2bf)](rM);
            rM += 0x4;
            const tu = rC(),
              tv = tu || wm(0xa70) + tt;
            if (ts === cQ[wm(0xc2b)]) {
              let tD = rC();
              pb[wm(0x416)] && (tD = fb(tD));
              if (jN(tD, tt)) nl(tt, tv, tD, tt === ix ? ni["me"] : void 0x0);
              else tt === ix && nl(-0x1, null, wm(0x3c0), ni[wm(0x569)]);
            } else {
              if (ts === cQ[wm(0xe47)]) {
                const tE = rL[wm(0x94d)](rM);
                rM += 0x2;
                const tF = rL[wm(0x2bf)](rM);
                rM += 0x4;
                const tG = rL[wm(0x2bf)](rM);
                rM += 0x4;
                const tH = dC[tE],
                  tI = hN[tH[wm(0x2a3)]],
                  tJ = hN[tH[wm(0x227)][wm(0x2a3)]],
                  tK = tG === 0x0;
                if (tK)
                  nk(wm(0xe47), [
                    [ni[wm(0xcd1)], tv, !![]],
                    [ni[wm(0xcd1)], wm(0x975)],
                    [
                      hQ[tH[wm(0x2a3)]],
                      k9(tF) + "\x20" + tI + "\x20" + tH[wm(0xd8e)],
                    ],
                  ]);
                else {
                  const tL = hQ[tH[wm(0x227)][wm(0x2a3)]];
                  nk(wm(0xe47), [
                    [tL, "⭐"],
                    [tL, tv, !![]],
                    [tL, wm(0xb2c)],
                    [
                      tL,
                      k9(tG) +
                        "\x20" +
                        tJ +
                        "\x20" +
                        tH[wm(0xd8e)] +
                        wm(0x14f) +
                        k9(tF) +
                        "\x20" +
                        tI +
                        "\x20" +
                        tH[wm(0xd8e)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tM = rL[wm(0x94d)](rM);
                rM += 0x2;
                const tN = eK[tM],
                  tO = hN[tN[wm(0x2a3)]],
                  tP = ts === cQ[wm(0xb0e)],
                  tQ = hQ[tN[wm(0x2a3)]];
                nk(wm(0x581), [
                  [
                    tQ,
                    "" +
                      (tP ? wm(0x7df) : "") +
                      jt(tO) +
                      "\x20" +
                      tO +
                      "\x20" +
                      tN[wm(0xd8e)] +
                      wm(0x190) +
                      js(tP) +
                      wm(0xa22),
                  ],
                  [tQ, tv + "!", !![]],
                ]);
              }
            }
          }
          const s4 = rL[wm(0x353)](rM++),
            s5 = s4 & 0xf,
            s6 = s4 >> 0x4;
          let s7 = ![];
          s5 !== j6["id"] &&
            (j6 && (j6[wm(0x372)] = !![]),
            (s7 = !![]),
            jd(s5),
            k8(qa, wm(0x1f9) + j9[s5] + wm(0x91e)));
          const s8 = rL[wm(0x353)](rM++);
          if (s8 > 0x0) {
            let tR = ![];
            for (let tS = 0x0; tS < s8; tS++) {
              const tT = rL[wm(0x94d)](rM);
              rM += 0x2;
              const tU = rL[wm(0x94d)](rM);
              (rM += 0x2), (j6[tT] = tU);
              if (tU > 0x0) {
                if (!j6[wm(0x556)][tT]) {
                  tR = !![];
                  const tV = nV(eK[tT], !![]);
                  (tV[wm(0x380)] = !![]),
                    (tV[wm(0x114)] = ![]),
                    tV[wm(0xdd8)][wm(0x2b0)](wm(0x435)),
                    (tV[wm(0x9a7)] = nQ(wm(0xe5c))),
                    tV[wm(0x6c4)](tV[wm(0x9a7)]),
                    (tV[wm(0xcc5)] = tT);
                  let tW = -0x1;
                  (tV["t"] = s7 ? 0x1 : 0x0),
                    (tV[wm(0x372)] = ![]),
                    (tV[wm(0x1ec)] = 0x3e8),
                    (tV[wm(0xbce)] = function () {
                      const wz = wm,
                        tX = tV["t"];
                      if (tX === tW) return;
                      tW = tX;
                      const tY = jf(Math[wz(0x77f)](0x1, tX / 0.5)),
                        tZ = jf(
                          Math[wz(0xb8e)](
                            0x0,
                            Math[wz(0x77f)]((tX - 0.5) / 0.5)
                          )
                        );
                      (tV[wz(0xa71)][wz(0xde3)] =
                        wz(0x844) + -0x168 * (0x1 - tZ) + wz(0x658) + tZ + ")"),
                        (tV[wz(0xa71)][wz(0xb46)] = -1.12 * (0x1 - tY) + "em");
                    }),
                    jb[wm(0xe68)](tV),
                    j6[wm(0x892)][wm(0x6c4)](tV),
                    (j6[wm(0x556)][tT] = tV);
                }
                p5(j6[wm(0x556)][tT][wm(0x9a7)], tU);
              } else {
                const tX = j6[wm(0x556)][tT];
                tX && ((tX[wm(0x372)] = !![]), delete j6[wm(0x556)][tT]),
                  delete j6[tT];
              }
            }
            tR &&
              [...j6[wm(0x892)][wm(0xba2)]]
                [wm(0x3a4)]((tY, tZ) => {
                  const wA = wm;
                  return -oe(eK[tY[wA(0xcc5)]], eK[tZ[wA(0xcc5)]]);
                })
                [wm(0x275)]((tY) => {
                  const wB = wm;
                  j6[wB(0x892)][wB(0x6c4)](tY);
                });
          }
          (j6[wm(0xd06)] = pP), (j6[wm(0x97b)] = s6);
          if (s6 !== cT[wm(0x846)]) {
            (j6[wm(0xe04)][wm(0xa71)][wm(0x3c1)] = ""),
              (j6[wm(0xb5b)] = j6[wm(0xcb7)]),
              (j6[wm(0xa36)] = rD());
            if (j6[wm(0x54a)] !== jJ) {
              const tY = jJ ? wm(0x1b1) : wm(0x2b0);
              j6[wm(0x442)][wm(0xdd8)][tY](wm(0x7d7)),
                j6[wm(0x442)][wm(0xdd8)][tY](wm(0xb92)),
                j6[wm(0x5fe)][wm(0xdd8)][tY](wm(0xdfd)),
                (j6[wm(0x54a)] = jJ);
            }
            switch (s6) {
              case cT[wm(0x1c6)]:
                k8(j6[wm(0x8ba)], wm(0x199));
                break;
              case cT[wm(0x9ca)]:
                const tZ = rL[wm(0x353)](rM++) + 0x1;
                k8(j6[wm(0x8ba)], wm(0x670) + tZ);
                break;
              case cT[wm(0x35f)]:
                k8(j6[wm(0x8ba)], wm(0x50f));
                break;
              case cT[wm(0x53a)]:
                k8(j6[wm(0x8ba)], wm(0x6f4));
                break;
              case cT[wm(0x98e)]:
                k8(j6[wm(0x8ba)], wm(0x5ec));
                break;
            }
          } else j6[wm(0xe04)][wm(0xa71)][wm(0x3c1)] = wm(0x846);
          if (rL[wm(0x9a5)] - rM > 0x0) {
            iy &&
              (j0(qt),
              (qt[wm(0x84d)] = ![]),
              (q5[wm(0xa71)][wm(0x3c1)] = ""),
              (q4[wm(0xa71)][wm(0x3c1)] = wm(0x846)),
              q6(q5, iy["nx"], iy["ny"]));
            qu[wm(0xd35)](), (iy = null), ju[wm(0xdd8)][wm(0x2b0)](wm(0x7f0));
            const u0 = rL[wm(0x94d)](rM) - 0x1;
            rM += 0x2;
            const u1 = rL[wm(0x2bf)](rM);
            rM += 0x4;
            const u2 = rL[wm(0x2bf)](rM);
            rM += 0x4;
            const u3 = rL[wm(0x2bf)](rM);
            rM += 0x4;
            const u4 = rL[wm(0x2bf)](rM);
            (rM += 0x4),
              k8(k3, ka(u2)),
              k8(k2, k9(u1)),
              k8(k4, k9(u3)),
              k8(k6, k9(u4));
            let u5 = null;
            rL[wm(0x9a5)] - rM > 0x0 && ((u5 = rL[wm(0x2bf)](rM)), (rM += 0x4));
            u5 !== null
              ? (k8(k7, k9(u5)), (k7[wm(0x3ff)][wm(0xa71)][wm(0x3c1)] = ""))
              : (k7[wm(0x3ff)][wm(0xa71)][wm(0x3c1)] = wm(0x846));
            if (u0 === -0x1) k8(k5, wm(0x5a1));
            else {
              const u6 = eK[u0];
              k8(k5, hN[u6[wm(0x2a3)]] + "\x20" + u6[wm(0xd8e)]);
            }
            oD(), (oC = {}), (kn[wm(0xa71)][wm(0x3c1)] = ""), hi();
          }
          break;
        default:
          console[wm(0xdc3)](wm(0x54e) + rN);
      }
    }
    var k2 = document[uv(0x91c)](uv(0x873)),
      k3 = document[uv(0x91c)](uv(0x6d8)),
      k4 = document[uv(0x91c)](uv(0x9e9)),
      k5 = document[uv(0x91c)](uv(0x5bf)),
      k6 = document[uv(0x91c)](uv(0x709)),
      k7 = document[uv(0x91c)](uv(0x6db));
    function k8(rA, rB) {
      const wC = uv;
      rA[wC(0xe2b)](wC(0x8e6), rB);
    }
    function k9(rA) {
      const wD = uv;
      return rA[wD(0x2eb)](wD(0x490));
    }
    function ka(rA, rB) {
      const wE = uv,
        rC = [
          Math[wE(0xc8c)](rA / (0x3e8 * 0x3c * 0x3c)),
          Math[wE(0xc8c)]((rA % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wE(0xc8c)]((rA % (0x3e8 * 0x3c)) / 0x3e8),
        ],
        rD = ["h", "m", "s"];
      let rE = "";
      const rF = rB ? 0x1 : 0x2;
      for (let rG = 0x0; rG <= rF; rG++) {
        const rH = rC[rG];
        (rH > 0x0 || rG == rF) && (rE += rH + rD[rG] + "\x20");
      }
      return rE;
    }
    const kb = {
      [cS[uv(0x6fd)]]: uv(0x19e),
      [cS[uv(0x163)]]: uv(0x395),
      [cS[uv(0x1f8)]]: uv(0x395),
      [cS[uv(0xa9d)]]: uv(0x27c),
      [cS[uv(0x290)]]: uv(0x27c),
      [cS[uv(0xc20)]]: uv(0x8d8),
      [cS[uv(0xa65)]]: uv(0x8d8),
      [cS[uv(0x3bb)]]: uv(0x370),
      [cS[uv(0x280)]]: uv(0xc84),
    };
    kb["0"] = uv(0x5a1);
    var kc = kb;
    for (let rA in cS) {
      const rB = cS[rA];
      if (kc[rB]) continue;
      const rC = kd(rA);
      kc[rB] = rC[uv(0xb02)](uv(0x800), uv(0xd71));
    }
    function kd(rD) {
      const wF = uv,
        rE = rD[wF(0xb02)](/([A-Z])/g, wF(0x456)),
        rF = rE[wF(0xd2e)](0x0)[wF(0xc0e)]() + rE[wF(0x7ce)](0x1);
      return rF;
    }
    var ke = null,
      kf = !![];
    function kg() {
      const wG = uv;
      console[wG(0xdc3)](wG(0x292)),
        hT(),
        ju[wG(0xdd8)][wG(0x2b0)](wG(0x7f0)),
        kf &&
          (kk[wG(0xa71)][wG(0x3c1)] === wG(0x846)
            ? (clearTimeout(ke),
              kC[wG(0xdd8)][wG(0x1b1)](wG(0x7f0)),
              (ke = setTimeout(function () {
                const wH = wG;
                kC[wH(0xdd8)][wH(0x2b0)](wH(0x7f0)),
                  (kk[wH(0xa71)][wH(0x3c1)] = ""),
                  kB[wH(0xe32)](ko),
                  (kn[wH(0xa71)][wH(0x3c1)] = km[wH(0xa71)][wH(0x3c1)] =
                    wH(0x846)),
                  hi(),
                  hV(hU[wH(0x82f)]);
              }, 0x1f4)))
            : (kC[wG(0xdd8)][wG(0x2b0)](wG(0x7f0)), hV(hU[wG(0x82f)])));
    }
    function kh(rD, rE) {
      return rD + "\x20" + rE + (rD === 0x1 ? "" : "s");
    }
    var ki = document[uv(0x19b)](uv(0xb07)),
      kj = ki[uv(0xaa8)]("2d"),
      kk = document[uv(0x91c)](uv(0x43f)),
      kl = document[uv(0x91c)](uv(0xa31)),
      km = document[uv(0x91c)](uv(0xc30));
    km[uv(0xa71)][uv(0x3c1)] = uv(0x846);
    var kn = document[uv(0x91c)](uv(0x950));
    kn[uv(0xa71)][uv(0x3c1)] = uv(0x846);
    var ko = document[uv(0x91c)](uv(0x18d)),
      kp = document[uv(0x91c)](uv(0x8a1)),
      kq = document[uv(0x91c)](uv(0xc06));
    function kr() {
      const wI = uv;
      kq[wI(0x63c)] = "";
      for (let rD = 0x0; rD < 0x32; rD++) {
        const rE = ks[rD],
          rF = nQ(wI(0x9ec) + rD + wI(0x40b)),
          rG = rF[wI(0x91c)](wI(0x4d1));
        if (rE)
          for (let rH = 0x0; rH < rE[wI(0xd55)]; rH++) {
            const rI = rE[rH],
              rJ = dF[rI];
            if (!rJ) rG[wI(0x6c4)](nQ(wI(0xd94)));
            else {
              const rK = nQ(
                wI(0x4ca) + rJ[wI(0x2a3)] + "\x22\x20" + qA(rJ) + wI(0xd5a)
              );
              (rK[wI(0x6d2)] = rJ),
                (rK[wI(0xc0a)] = kp),
                jY(rK),
                rG[wI(0x6c4)](rK);
            }
          }
        else rG[wI(0x63c)] = wI(0xd94)[wI(0xcee)](0x5);
        (rF[wI(0x91c)](wI(0x305))[wI(0x81c)] = function () {
          ku(rD);
        }),
          (rF[wI(0x91c)](wI(0x922))[wI(0x81c)] = function () {
            kx(rD);
          }),
          kq[wI(0x6c4)](rF);
      }
    }
    var ks = kt();
    function kt() {
      const wJ = uv;
      try {
        const rD = JSON[wJ(0x494)](hD[wJ(0x359)]);
        for (const rE in rD) {
          !Array[wJ(0x328)](rD[rE]) && delete rD[rE];
        }
        return rD;
      } catch {
        return {};
      }
    }
    function ku(rD) {
      const wK = uv,
        rE = [],
        rF = nz[wK(0x729)](wK(0x7cc));
      for (let rG = 0x0; rG < rF[wK(0xd55)]; rG++) {
        const rH = rF[rG],
          rI = rH[wK(0xba2)][0x0];
        !rI ? (rE[rG] = null) : (rE[rG] = rI[wK(0x6d2)][wK(0x46b)]);
      }
      (ks[rD] = rE),
        (hD[wK(0x359)] = JSON[wK(0x822)](ks)),
        kr(),
        hc(wK(0x600) + rD + "!");
    }
    function kv() {
      const wL = uv;
      return nz[wL(0x729)](wL(0x7cc));
    }
    document[uv(0x91c)](uv(0xb33))[uv(0x81c)] = function () {
      kw();
    };
    function kw() {
      const wM = uv,
        rD = kv();
      for (const rE of rD) {
        const rF = rE[wM(0xba2)][0x0];
        if (!rF) continue;
        rF[wM(0x2b0)](),
          iR[wM(0xe68)](rF[wM(0xa7b)]),
          n5(rF[wM(0x6d2)]["id"], 0x1),
          il(new Uint8Array([cI[wM(0x827)], rE[wM(0x83c)]]));
      }
    }
    function kx(rD) {
      const wN = uv;
      if (mK || mJ[wN(0xd55)] > 0x0) return;
      const rE = ks[rD];
      if (!rE) return;
      kw();
      const rF = kv(),
        rG = Math[wN(0x77f)](rF[wN(0xd55)], rE[wN(0xd55)]);
      for (let rH = 0x0; rH < rG; rH++) {
        const rI = rE[rH],
          rJ = dF[rI];
        if (!rJ || !iS[rJ["id"]]) continue;
        const rK = nQ(
          wN(0x4ca) + rJ[wN(0x2a3)] + "\x22\x20" + qA(rJ) + wN(0xd5a)
        );
        (rK[wN(0x6d2)] = rJ),
          (rK[wN(0x151)] = !![]),
          (rK[wN(0xa7b)] = iR[wN(0xc11)]()),
          nP(rK, rJ),
          (iQ[rK[wN(0xa7b)]] = rK),
          rF[rH][wN(0x6c4)](rK),
          n5(rK[wN(0x6d2)]["id"], -0x1);
        const rL = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rL[wN(0x1fc)](0x0, cI[wN(0x1a3)]),
          rL[wN(0x140)](0x1, rK[wN(0x6d2)]["id"]),
          rL[wN(0x1fc)](0x3, rH),
          il(rL);
      }
      hc(wN(0x71b) + rD + "!");
    }
    var ky = document[uv(0x91c)](uv(0x3bd)),
      kz = document[uv(0x91c)](uv(0x57e));
    kz[uv(0x81c)] = function () {
      const wO = uv;
      kC[wO(0xdd8)][wO(0x1b1)](wO(0x7f0)),
        jy
          ? (ke = setTimeout(function () {
              const wP = wO;
              il(new Uint8Array([cI[wP(0x345)]]));
            }, 0x1f4))
          : (ke = setTimeout(function () {
              const wQ = wO;
              kC[wQ(0xdd8)][wQ(0x2b0)](wQ(0x7f0)),
                (km[wQ(0xa71)][wQ(0x3c1)] = kn[wQ(0xa71)][wQ(0x3c1)] =
                  wQ(0x846)),
                (kk[wQ(0xa71)][wQ(0x3c1)] = ""),
                kB[wQ(0xe32)](ko),
                kB[wQ(0xdd8)][wQ(0x1b1)](wQ(0x7f0)),
                jg();
            }, 0x1f4));
    };
    var kA = document[uv(0x91c)](uv(0x141)),
      kB = document[uv(0x91c)](uv(0x63a));
    kB[uv(0xdd8)][uv(0x1b1)](uv(0x7f0));
    var kC = document[uv(0x91c)](uv(0xd9a)),
      kD = document[uv(0x91c)](uv(0x73c)),
      kE = document[uv(0x91c)](uv(0x42d));
    (kE[uv(0x2e6)] = hD[uv(0x706)] || ""),
      (kE[uv(0x63e)] = cK),
      (kE[uv(0xc3b)] = function () {
        const wR = uv;
        hD[wR(0x706)] = this[wR(0x2e6)];
      });
    var kF;
    kD[uv(0x81c)] = function () {
      if (!hW) return;
      kG();
    };
    function kG(rD = ![]) {
      const wS = uv;
      hack.chatFunc = hK;
      hack.toastFunc = hc;
      if(rD) hack.onload();
      hack.moblst = eO;
      if (kk[wS(0xa71)][wS(0x3c1)] === wS(0x846)) {
        kC[wS(0xdd8)][wS(0x2b0)](wS(0x7f0));
        return;
      }
      clearTimeout(kF),
        kB[wS(0xdd8)][wS(0x2b0)](wS(0x7f0)),
        (kF = setTimeout(() => {
          const wT = wS;
          kC[wT(0xdd8)][wT(0x1b1)](wT(0x7f0)),
            (kF = setTimeout(() => {
              const wU = wT;
              rD && kC[wU(0xdd8)][wU(0x2b0)](wU(0x7f0)),
                (kk[wU(0xa71)][wU(0x3c1)] = wU(0x846)),
                (hg[wU(0xa71)][wU(0x3c1)] = wU(0x846)),
                (km[wU(0xa71)][wU(0x3c1)] = ""),
                km[wU(0x6c4)](ko),
                iq(kE[wU(0x2e6)][wU(0x7ce)](0x0, cK));
            }, 0x1f4));
        }, 0x64));
    }
    var kH = document[uv(0x91c)](uv(0x786));
    function kI(rD, rE, rF) {
      const wV = uv,
        rG = {};
      (rG[wV(0x59d)] = wV(0x567)), (rG[wV(0x4e0)] = !![]), (rF = rF || rG);
      const rH = nQ(
        wV(0x351) +
          rF[wV(0x59d)] +
          wV(0x2d2) +
          rD +
          wV(0xe10) +
          (rF[wV(0x4e0)] ? wV(0xda9) : "") +
          wV(0xb7a)
      );
      return (
        (rH[wV(0x91c)](wV(0x26a))[wV(0x81c)] = function () {
          const wW = wV;
          rE(!![]), rH[wW(0x2b0)]();
        }),
        (rH[wV(0x91c)](wV(0xd6e))[wV(0x81c)] = function () {
          const wX = wV;
          rH[wX(0x2b0)](), rE(![]);
        }),
        kH[wV(0x6c4)](rH),
        rH
      );
    }
    function kJ() {
      function rD(rL, rM, rN, rO, rP) {
        return rG(rO - 0x20c, rN);
      }
      function rE() {
        const wY = b,
          rL = [
            wY(0x4a6),
            wY(0xaf8),
            wY(0xc10),
            wY(0x340),
            wY(0xb32),
            wY(0x20c),
            wY(0x81e),
            wY(0x554),
            wY(0xa8e),
            wY(0xabf),
            wY(0xba9),
            wY(0x94f),
            wY(0x617),
            wY(0x427),
            wY(0x88d),
            wY(0xa84),
            wY(0xa97),
            wY(0x2a8),
            wY(0xc12),
            wY(0xbea),
            wY(0x33b),
            wY(0xe6f),
            wY(0xa66),
            wY(0xda7),
            wY(0x22c),
            wY(0x6d2),
            wY(0x7ae),
            wY(0xb49),
            wY(0xb13),
            wY(0x9bb),
            wY(0x1e9),
            wY(0x835),
            wY(0x6dd),
            wY(0x766),
            wY(0xc32),
            wY(0x92f),
            wY(0x241),
            wY(0xdac),
            wY(0x9e5),
            wY(0x9b7),
            wY(0x62f),
            wY(0x6a0),
            wY(0x26e),
            wY(0x5db),
            wY(0x809),
            wY(0x7b9),
            wY(0x49d),
            wY(0x568),
            wY(0xad2),
            wY(0xc29),
            wY(0x411),
            wY(0x12f),
            wY(0xd96),
            wY(0xb84),
            wY(0x981),
            wY(0x2d9),
            wY(0xb19),
            wY(0x45f),
            wY(0x777),
            wY(0x35c),
            wY(0xa8d),
            wY(0x71c),
            wY(0xbaa),
            wY(0xe18),
            wY(0x7b0),
            wY(0x3a0),
            wY(0x833),
            wY(0x24f),
            wY(0x40e),
            wY(0x481),
            wY(0xdb4),
            wY(0xe59),
            wY(0x225),
            wY(0x1bc),
            wY(0x8dd),
            wY(0xced),
            wY(0x756),
            wY(0x1d8),
            wY(0xa16),
            wY(0xcfb),
            wY(0x720),
            wY(0x1f2),
            wY(0xcd7),
            wY(0x7a3),
            wY(0x37c),
            wY(0xd13),
            wY(0x40c),
            wY(0x640),
            wY(0x619),
          ];
        return (
          (rE = function () {
            return rL;
          }),
          rE()
        );
      }
      function rF(rL, rM, rN, rO, rP) {
        return rG(rM - 0x322, rN);
      }
      function rG(rL, rM) {
        const rN = rE();
        return (
          (rG = function (rO, rP) {
            rO = rO - (0x12b9 * 0x1 + 0x2f5 * 0xb + -0x3263);
            let rQ = rN[rO];
            return rQ;
          }),
          rG(rL, rM)
        );
      }
      function rH(rL, rM, rN, rO, rP) {
        return rG(rN - 0x398, rM);
      }
      (function (rL, rM) {
        const wZ = b;
        function rN(rT, rU, rV, rW, rX) {
          return rG(rT - -0x202, rU);
        }
        function rO(rT, rU, rV, rW, rX) {
          return rG(rU - -0x361, rW);
        }
        const rP = rL();
        function rQ(rT, rU, rV, rW, rX) {
          return rG(rU - -0x1c0, rW);
        }
        function rR(rT, rU, rV, rW, rX) {
          return rG(rW - 0x1f1, rX);
        }
        function rS(rT, rU, rV, rW, rX) {
          return rG(rX - 0x352, rW);
        }
        while (!![]) {
          try {
            const rT =
              -parseInt(rN(-0xfd, -0x103, -0xdd, -0xfe, -0x10a)) /
                (-0x14de + 0x14ac + -0x33 * -0x1) +
              (parseInt(rN(-0xf2, -0x102, -0x107, -0x110, -0x114)) /
                (-0xe4b * -0x1 + 0x2 * 0x1039 + -0x2ebb)) *
                (parseInt(rS(0x413, 0x428, 0x42c, 0x416, 0x43b)) /
                  (-0x1ec7 * 0x1 + -0x19f * -0x14 + -0x1a2)) +
              parseInt(rR(0x300, 0x307, 0x2f6, 0x30d, 0x2fd)) /
                (-0x1 * 0x17bf + 0xbba * 0x1 + -0x27 * -0x4f) +
              parseInt(rO(-0x260, -0x274, -0x280, -0x248, -0x27f)) /
                (-0x2706 + -0x17b5 + 0x20 * 0x1f6) +
              (parseInt(rS(0x45e, 0x496, 0x48c, 0x49d, 0x47d)) /
                (0x260f * -0x1 + 0x1 * -0x20a1 + 0x46b6)) *
                (parseInt(rO(-0x23e, -0x25f, -0x278, -0x280, -0x256)) /
                  (-0xca9 + -0xbd5 + 0x1885)) +
              -parseInt(rS(0x452, 0x456, 0x44a, 0x433, 0x44e)) /
                (-0xcce + -0x2482 + 0x4 * 0xc56) +
              (-parseInt(rQ(-0xec, -0xc2, -0xe4, -0xe7, -0xc6)) /
                (-0x2 * -0x183 + 0x887 * -0x2 + 0x115 * 0xd)) *
                (parseInt(rN(-0x122, -0x12f, -0x129, -0x120, -0x12a)) /
                  (-0x750 + 0x4 * 0x29f + 0x1 * -0x322));
            if (rT === rM) break;
            else rP[wZ(0xe68)](rP[wZ(0xc28)]());
          } catch (rU) {
            rP[wZ(0xe68)](rP[wZ(0xc28)]());
          }
        }
      })(rE, -0x51c14 * -0x1 + -0x87309 + 0x92db * 0x13);
      const rI = [
        rJ(0x22c, 0x242, 0x249, 0x246, 0x242) +
          rH(0x4bd, 0x4b8, 0x4ab, 0x481, 0x4c9) +
          rH(0x4b0, 0x49e, 0x4bb, 0x4c5, 0x4c8) +
          rK(-0x128, -0x11a, -0x135, -0x121, -0x144),
        rH(0x491, 0x482, 0x49e, 0x4ba, 0x48b) +
          rJ(0x234, 0x22e, 0x229, 0x255, 0x244),
        rK(-0x14e, -0x170, -0x171, -0x14b, -0x136) +
          rJ(0x265, 0x275, 0x23c, 0x287, 0x241),
      ];
      function rJ(rL, rM, rN, rO, rP) {
        return rG(rL - 0x140, rP);
      }
      function rK(rL, rM, rN, rO, rP) {
        return rG(rO - -0x23b, rM);
      }
      !rI[
        rJ(0x23f, 0x225, 0x23c, 0x231, 0x269) +
          rK(-0x147, -0x157, -0x129, -0x12c, -0x154)
      ](
        window[
          rK(-0x11a, -0x12c, -0x15c, -0x144, -0x128) +
            rF(0x44e, 0x42f, 0x445, 0x45a, 0x404)
        ][
          rH(0x4d2, 0x4b9, 0x4ad, 0x4ca, 0x4a0) +
            rK(-0x15e, -0x112, -0x150, -0x13b, -0x147)
        ][
          rD(0x331, 0x314, 0x315, 0x31d, 0x31c) +
            rK(-0xed, -0xf8, -0xe4, -0x109, -0xfb) +
            "e"
        ]()
      ) &&
        (alert(
          rJ(0x228, 0x1fd, 0x211, 0x21d, 0x21f) +
            rD(0x322, 0x354, 0x32c, 0x327, 0x321) +
            rD(0x316, 0x333, 0x2f3, 0x30f, 0x32b) +
            rF(0x471, 0x448, 0x42a, 0x421, 0x44c) +
            rJ(0x249, 0x26b, 0x26f, 0x225, 0x276) +
            rK(-0x15f, -0x11d, -0x133, -0x137, -0x116) +
            rF(0x3fb, 0x411, 0x42e, 0x42e, 0x404) +
            rH(0x484, 0x454, 0x475, 0x44f, 0x452) +
            rK(-0x11b, -0x13a, -0x133, -0x11d, -0x132) +
            rK(-0xf4, -0xfc, -0xf7, -0x10a, -0xff) +
            rH(0x4ba, 0x4e9, 0x4cd, 0x4ef, 0x4c5) +
            rH(0x461, 0x492, 0x47f, 0x493, 0x49f) +
            rK(-0x156, -0x130, -0x120, -0x14a, -0x123) +
            rJ(0x21e, 0x236, 0x241, 0x246, 0x215) +
            rF(0x44f, 0x444, 0x44b, 0x46c, 0x43d) +
            rF(0x441, 0x44f, 0x47b, 0x428, 0x470) +
            rK(-0x170, -0x13c, -0x14a, -0x145, -0x131) +
            rJ(0x238, 0x243, 0x25f, 0x25c, 0x246) +
            rH(0x49e, 0x486, 0x4af, 0x4c8, 0x495) +
            rD(0x2e9, 0x2fe, 0x2f3, 0x301, 0x325) +
            rJ(0x226, 0x208, 0x20b, 0x23b, 0x1ff) +
            rF(0x464, 0x43d, 0x464, 0x448, 0x414) +
            rD(0x330, 0x306, 0x342, 0x324, 0x324) +
            rF(0x43f, 0x43f, 0x42d, 0x43f, 0x414) +
            rD(0x2cb, 0x318, 0x2ca, 0x2ef, 0x2e0) +
            rK(-0x108, -0x10e, -0x12f, -0x10d, -0xf7) +
            rD(0x341, 0x31a, 0x310, 0x333, 0x350) +
            rH(0x4b1, 0x49c, 0x4c4, 0x4b8, 0x4d7) +
            rD(0x354, 0x350, 0x365, 0x33f, 0x347) +
            rH(0x4b5, 0x4d3, 0x4c8, 0x4e0, 0x4bf) +
            rJ(0x252, 0x24c, 0x26c, 0x230, 0x273)
        ),
        kI(
          rD(0x325, 0x318, 0x30f, 0x325, 0x328) +
            rK(-0x127, -0x15e, -0x162, -0x13e, -0x13f) +
            rJ(0x21f, 0x23c, 0x245, 0x21b, 0x248) +
            rF(0x411, 0x414, 0x43b, 0x43e, 0x423) +
            rD(0x31d, 0x369, 0x349, 0x340, 0x34d) +
            rJ(0x26a, 0x273, 0x255, 0x295, 0x261) +
            rH(0x4b3, 0x48a, 0x48b, 0x466, 0x46c) +
            rJ(0x268, 0x278, 0x28c, 0x25c, 0x259) +
            rJ(0x24b, 0x224, 0x277, 0x26c, 0x232) +
            rK(-0x10d, -0x153, -0x124, -0x134, -0x14c) +
            rH(0x477, 0x4a5, 0x47d, 0x45c, 0x45a) +
            rJ(0x224, 0x215, 0x21a, 0x24d, 0x24e) +
            rJ(0x239, 0x252, 0x21c, 0x236, 0x20d) +
            rK(-0x179, -0x15f, -0x12f, -0x159, -0x142) +
            rD(0x307, 0x300, 0x2fa, 0x322, 0x315) +
            rF(0x458, 0x44b, 0x441, 0x42e, 0x43f) +
            rK(-0x117, -0x144, -0xf0, -0x117, -0x13b) +
            rJ(0x23a, 0x224, 0x252, 0x226, 0x250) +
            rJ(0x254, 0x247, 0x22b, 0x248, 0x26d) +
            rJ(0x22b, 0x20c, 0x200, 0x246, 0x23b) +
            rK(-0x175, -0x175, -0x174, -0x15d, -0x13f) +
            rD(0x2d5, 0x2fa, 0x2d1, 0x2ed, 0x2f5) +
            rD(0x310, 0x312, 0x304, 0x2f6, 0x308) +
            rJ(0x24c, 0x22b, 0x249, 0x24e, 0x23b) +
            rJ(0x260, 0x27b, 0x28c, 0x28c, 0x235) +
            rK(-0x135, -0x141, -0x126, -0x140, -0x154) +
            rF(0x461, 0x441, 0x442, 0x428, 0x466) +
            rD(0x2e2, 0x326, 0x2f5, 0x2fa, 0x2f3) +
            "v>",
          (rL) => {
            const rM = {};
            rM[rP(-0x281, -0x2a8, -0x288, -0x28b, -0x282)] =
              rP(-0x28e, -0x297, -0x26e, -0x292, -0x28b) +
              rP(-0x285, -0x2ab, -0x289, -0x2b0, -0x2a7) +
              rS(0x3f2, 0x3f5, 0x3e1, 0x3e1, 0x3e3) +
              rR(0x146, 0x141, 0x11f, 0x14b, 0x15a);
            function rN(rT, rU, rV, rW, rX) {
              return rD(rT - 0x10e, rU - 0xae, rW, rU - 0xdd, rX - 0x14d);
            }
            const rO = rM;
            function rP(rT, rU, rV, rW, rX) {
              return rF(rT - 0x13a, rT - -0x6b1, rU, rW - 0x11b, rX - 0x1a6);
            }
            function rQ(rT, rU, rV, rW, rX) {
              return rK(rT - 0x193, rX, rV - 0x13d, rV - 0x423, rX - 0x15b);
            }
            function rR(rT, rU, rV, rW, rX) {
              return rJ(rW - -0x124, rU - 0xf8, rV - 0x15a, rW - 0x16e, rV);
            }
            function rS(rT, rU, rV, rW, rX) {
              return rJ(rU - 0x1ad, rU - 0x30, rV - 0x170, rW - 0x1d5, rT);
            }
            !rL &&
              (window[
                rR(0xea, 0x112, 0x108, 0x113, 0x129) +
                  rQ(0x2dc, 0x2ec, 0x2f5, 0x2e3, 0x2e2)
              ][rQ(0x334, 0x305, 0x309, 0x31b, 0x2fd)] =
                rO[rQ(0x2d4, 0x319, 0x2f6, 0x2e2, 0x31b)]);
          }
        ));
    }
    kJ();
    var kK = document[uv(0x91c)](uv(0x7a6)),
      kL = (function () {
        const x1 = uv;
        let rD = ![];
        return (
          (function (rE) {
            const x0 = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                x0(0x3e6)
              ](rE) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                x0(0x3e6)
              ](rE[x0(0x570)](0x0, 0x4))
            )
              rD = !![];
          })(navigator[x1(0x138)] || navigator[x1(0x1d2)] || window[x1(0x462)]),
          rD
        );
      })(),
      kM =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          uv(0x3e6)
        ](navigator[uv(0x138)][uv(0x545)]()),
      kN = 0x514,
      kO = 0x28a,
      kP = 0x1,
      kQ = [km, kk, kn, kl, kH, hg],
      kR = 0x1,
      kS = 0x1;
    function kT() {
      const x2 = uv;
      (kS = Math[x2(0xb8e)](ki[x2(0x52e)] / d0, ki[x2(0xbc9)] / d1)),
        (kR =
          Math[pb[x2(0xbe4)] ? x2(0x77f) : x2(0xb8e)](kU() / kN, kV() / kO) *
          (kL && !kM ? 1.1 : 0x1)),
        (kR *= kP);
      for (let rD = 0x0; rD < kQ[x2(0xd55)]; rD++) {
        const rE = kQ[rD];
        let rF = kR * (rE[x2(0xaf4)] || 0x1);
        (rE[x2(0xa71)][x2(0xde3)] = x2(0x5f5) + rF + ")"),
          (rE[x2(0xa71)][x2(0x968)] = x2(0x505)),
          (rE[x2(0xa71)][x2(0x52e)] = kU() / rF + "px"),
          (rE[x2(0xa71)][x2(0xbc9)] = kV() / rF + "px");
      }
    }
    function kU() {
      const x3 = uv;
      return document[x3(0x996)][x3(0x66f)];
    }
    function kV() {
      const x4 = uv;
      return document[x4(0x996)][x4(0x1c2)];
    }
    var kW = 0x1;
    function kX() {
      const x5 = uv;
      (kW = pb[x5(0xe2e)] ? 0.65 : window[x5(0x324)]),
        (ki[x5(0x52e)] = kU() * kW),
        (ki[x5(0xbc9)] = kV() * kW),
        kT();
      for (let rD = 0x0; rD < mJ[x5(0xd55)]; rD++) {
        mJ[rD][x5(0xdc0)]();
      }
    }
    window[uv(0x8a4)] = function () {
      kX(), qI();
    };
    var kY = (function () {
        const x6 = uv,
          rD = 0x23,
          rE = rD / 0x2,
          rF = document[x6(0xa69)](x6(0xb07));
        rF[x6(0x52e)] = rF[x6(0xbc9)] = rD;
        const rG = rF[x6(0xaa8)]("2d");
        return (
          (rG[x6(0xc51)] = x6(0x4b7)),
          rG[x6(0xa39)](),
          rG[x6(0xb9f)](0x0, rE),
          rG[x6(0xcac)](rD, rE),
          rG[x6(0xb9f)](rE, 0x0),
          rG[x6(0xcac)](rE, rD),
          rG[x6(0x8e6)](),
          rG[x6(0x65c)](rF, x6(0xcee))
        );
      })(),
      kZ = 0x19,
      l0 = Math["PI"] * 0x2,
      l1 = [];
    l2((Math["PI"] / 0xb4) * 0x1e, 0x1),
      l2((Math["PI"] / 0xb4) * 0x3c, 0x1, 0x6),
      l2((Math["PI"] / 0xb4) * 0x5a, -0x1, 0x6),
      l2((Math["PI"] / 0xb4) * 0x78, -0x1),
      l2((-Math["PI"] / 0xb4) * 0x1e, -0x1),
      l2((-Math["PI"] / 0xb4) * 0x3c, -0x1, 0x6),
      l2((-Math["PI"] / 0xb4) * 0x5a, 0x1, 0x6),
      l2((-Math["PI"] / 0xb4) * 0x78, 0x1);
    function l2(rD, rE, rF = 0x8) {
      const x7 = uv;
      rE *= -0x1;
      const rG = Math[x7(0xe44)](rD),
        rH = Math[x7(0x88e)](rD),
        rI = rG * 0x28,
        rJ = rH * 0x28;
      l1[x7(0xe68)]({
        dir: rE,
        start: [rI, rJ],
        curve: [
          rI + rG * 0x17 + -rH * rE * rF,
          rJ + rH * 0x17 + rG * rE * rF,
          rI + rG * 0x2e,
          rJ + rH * 0x2e,
        ],
        side: Math[x7(0x9f3)](rD),
      });
    }
    var l3 = l4();
    function l4() {
      const x8 = uv,
        rD = new Path2D(),
        rE = Math["PI"] / 0x5;
      return (
        rD[x8(0xce9)](0x0, 0x0, 0x28, rE, l0 - rE),
        rD[x8(0x78e)](
          0x12,
          0x0,
          Math[x8(0xe44)](rE) * 0x28,
          Math[x8(0x88e)](rE) * 0x28
        ),
        rD[x8(0x765)](),
        rD
      );
    }
    var l5 = l6();
    function l6() {
      const x9 = uv,
        rD = new Path2D();
      return (
        rD[x9(0xb9f)](-0x28, 0x5),
        rD[x9(0x443)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rD[x9(0xcac)](0x28, -0x5),
        rD[x9(0x443)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rD[x9(0x765)](),
        rD
      );
    }
    function l7(rD, rE = 0x1, rF = 0x0) {
      const xa = uv,
        rG = new Path2D();
      for (let rH = 0x0; rH < rD; rH++) {
        const rI = (Math["PI"] * 0x2 * rH) / rD + rF;
        rG[xa(0xcac)](
          Math[xa(0xe44)](rI) - Math[xa(0x88e)](rI) * 0.1 * rE,
          Math[xa(0x88e)](rI)
        );
      }
      return rG[xa(0x765)](), rG;
    }
    var l8 = {
      petalRock: l7(0x5),
      petalSoil: l7(0xa),
      petalSalt: l7(0x7),
      petalLightning: (function () {
        const xb = uv,
          rD = new Path2D();
        for (let rE = 0x0; rE < 0x14; rE++) {
          const rF = (rE / 0x14) * Math["PI"] * 0x2,
            rG = rE % 0x2 === 0x0 ? 0x1 : 0.55;
          rD[xb(0xcac)](Math[xb(0xe44)](rF) * rG, Math[xb(0x88e)](rF) * rG);
        }
        return rD[xb(0x765)](), rD;
      })(),
      petalCotton: la(0x9, 0x1, 0.5, 1.6),
      petalWeb: la(0x5, 0x1, 0.5, 0.7),
      petalCactus: la(0x8, 0x1, 0.5, 0.7),
      petalSand: l7(0x6, 0x0, 0.2),
    };
    function l9(rD, rE, rF, rG, rH) {
      const xc = uv;
      (rD[xc(0xc51)] = rH),
        (rD[xc(0xade)] = rF),
        rD[xc(0x884)](),
        (rE *= 0.45),
        rD[xc(0x627)](rE),
        rD[xc(0xe07)](-0x14, 0x0),
        rD[xc(0xa39)](),
        rD[xc(0xb9f)](0x0, 0x26),
        rD[xc(0xcac)](0x50, 0x7),
        rD[xc(0xcac)](0x50, -0x7),
        rD[xc(0xcac)](0x0, -0x26),
        rD[xc(0xcac)](-0x14, -0x1e),
        rD[xc(0xcac)](-0x14, 0x1e),
        rD[xc(0x765)](),
        (rF = rF / rE),
        (rD[xc(0xade)] = 0x64 + rF),
        (rD[xc(0xc51)] = rH),
        rD[xc(0x8e6)](),
        (rD[xc(0xc51)] = rD[xc(0x6b8)] = rG),
        (rD[xc(0xade)] -= rF * 0x2),
        rD[xc(0x8e6)](),
        rD[xc(0xa06)](),
        rD[xc(0x915)]();
    }
    function la(rD, rE, rF, rG) {
      const xd = uv,
        rH = new Path2D();
      return lb(rH, rD, rE, rF, rG), rH[xd(0x765)](), rH;
    }
    function lb(rD, rE, rF, rG, rH) {
      const xe = uv;
      rD[xe(0xb9f)](rF, 0x0);
      for (let rI = 0x1; rI <= rE; rI++) {
        const rJ = (Math["PI"] * 0x2 * (rI - rG)) / rE,
          rK = (Math["PI"] * 0x2 * rI) / rE;
        rD[xe(0x78e)](
          Math[xe(0xe44)](rJ) * rF * rH,
          Math[xe(0x88e)](rJ) * rF * rH,
          Math[xe(0xe44)](rK) * rF,
          Math[xe(0x88e)](rK) * rF
        );
      }
    }
    var lc = (function () {
        const xf = uv,
          rD = new Path2D();
        rD[xf(0xb9f)](0x3c, 0x0);
        const rE = 0x6;
        for (let rF = 0x0; rF < rE; rF++) {
          const rG = ((rF + 0.5) / rE) * Math["PI"] * 0x2,
            rH = ((rF + 0x1) / rE) * Math["PI"] * 0x2;
          rD[xf(0x78e)](
            Math[xf(0xe44)](rG) * 0x78,
            Math[xf(0x88e)](rG) * 0x78,
            Math[xf(0xe44)](rH) * 0x3c,
            Math[xf(0x88e)](rH) * 0x3c
          );
        }
        return rD[xf(0x765)](), rD;
      })(),
      ld = (function () {
        const xg = uv,
          rD = new Path2D(),
          rE = 0x6;
        for (let rF = 0x0; rF < rE; rF++) {
          const rG = ((rF + 0.5) / rE) * Math["PI"] * 0x2;
          rD[xg(0xb9f)](0x0, 0x0), rD[xg(0xcac)](...le(0x37, 0x0, rG));
          for (let rH = 0x0; rH < 0x2; rH++) {
            const rI = (rH / 0x2) * 0x1e + 0x14,
              rJ = 0xa - rH * 0x2;
            rD[xg(0xb9f)](...le(rI + rJ, -rJ, rG)),
              rD[xg(0xcac)](...le(rI, 0x0, rG)),
              rD[xg(0xcac)](...le(rI + rJ, rJ, rG));
          }
        }
        return rD;
      })();
    function le(rD, rE, rF) {
      const xh = uv,
        rG = Math[xh(0x88e)](rF),
        rH = Math[xh(0xe44)](rF);
      return [rD * rH + rE * rG, rE * rH - rD * rG];
    }
    function lf(rD, rE, rF) {
      (rD /= 0x168), (rE /= 0x64), (rF /= 0x64);
      let rG, rH, rI;
      if (rE === 0x0) rG = rH = rI = rF;
      else {
        const rK = (rN, rO, rP) => {
            if (rP < 0x0) rP += 0x1;
            if (rP > 0x1) rP -= 0x1;
            if (rP < 0x1 / 0x6) return rN + (rO - rN) * 0x6 * rP;
            if (rP < 0x1 / 0x2) return rO;
            if (rP < 0x2 / 0x3) return rN + (rO - rN) * (0x2 / 0x3 - rP) * 0x6;
            return rN;
          },
          rL = rF < 0.5 ? rF * (0x1 + rE) : rF + rE - rF * rE,
          rM = 0x2 * rF - rL;
        (rG = rK(rM, rL, rD + 0x1 / 0x3)),
          (rH = rK(rM, rL, rD)),
          (rI = rK(rM, rL, rD - 0x1 / 0x3));
      }
      const rJ = (rN) => {
        const xi = b,
          rO = Math[xi(0x423)](rN * 0xff)[xi(0x3ad)](0x10);
        return rO[xi(0xd55)] === 0x1 ? "0" + rO : rO;
      };
      return "#" + rJ(rG) + rJ(rH) + rJ(rI);
    }
    var lg = [];
    for (let rD = 0x0; rD < 0xa; rD++) {
      const rE = 0x1 - rD / 0xa;
      lg[uv(0xe68)](lf(0x28 + rE * 0xc8, 0x50, 0x3c * rE));
    }
    var lh = [uv(0x883), uv(0xd23)],
      li = lh[0x0],
      lj = [uv(0x444), uv(0xafb), uv(0xa3f), uv(0x82e)];
    function lk(rF = uv(0xe74)) {
      const xj = uv,
        rG = [];
      for (let rH = 0x0; rH < 0x5; rH++) {
        rG[xj(0xe68)](pZ(rF, 0.8 - (rH / 0x5) * 0.25));
      }
      return rG;
    }
    var ll = {
        pet: {
          body: li,
          wing: pZ(li, 0.7),
          tail_outline: pZ(li, 0.4),
          bone_outline: pZ(li, 0.4),
          bone: pZ(li, 0.6),
          tail: lk(pZ(li, 0.8)),
        },
        main: {
          body: uv(0xe74),
          wing: uv(0xc7e),
          tail_outline: uv(0xc03),
          bone_outline: uv(0xbe3),
          bone: uv(0xc03),
          tail: lk(),
        },
      },
      lm = new Path2D(uv(0xc75)),
      ln = new Path2D(uv(0xe15)),
      lo = [];
    for (let rF = 0x0; rF < 0x3; rF++) {
      lo[uv(0xe68)](pZ(lh[0x0], 0x1 - (rF / 0x3) * 0.2));
    }
    function lp(rG = Math[uv(0xbf6)]()) {
      return function () {
        return (rG = (rG * 0x2455 + 0xc091) % 0x38f40), rG / 0x38f40;
      };
    }
    const lq = {
      [cS[uv(0x72d)]]: [uv(0x5c1), uv(0x2ff)],
      [cS[uv(0x60a)]]: [uv(0xe74), uv(0x6a6)],
      [cS[uv(0x253)]]: [uv(0xe67), uv(0xe40)],
    };
    var lr = lq;
    const ls = {};
    (ls[uv(0x3c3)] = !![]),
      (ls[uv(0x6d6)] = !![]),
      (ls[uv(0x29f)] = !![]),
      (ls[uv(0x613)] = !![]),
      (ls[uv(0xbc1)] = !![]),
      (ls[uv(0x2ad)] = !![]),
      (ls[uv(0x802)] = !![]);
    var lt = ls;
    const lu = {};
    (lu[uv(0x460)] = !![]),
      (lu[uv(0xe27)] = !![]),
      (lu[uv(0x4a2)] = !![]),
      (lu[uv(0x382)] = !![]),
      (lu[uv(0x82d)] = !![]),
      (lu[uv(0x202)] = !![]),
      (lu[uv(0x402)] = !![]);
    var lv = lu;
    const lw = {};
    (lw[uv(0x4a2)] = !![]),
      (lw[uv(0x382)] = !![]),
      (lw[uv(0x82d)] = !![]),
      (lw[uv(0x202)] = !![]);
    var lx = lw;
    const ly = {};
    (ly[uv(0xe27)] = !![]), (ly[uv(0x398)] = !![]), (ly[uv(0x613)] = !![]);
    var lz = ly;
    const lA = {};
    (lA[uv(0x907)] = !![]), (lA[uv(0x280)] = !![]), (lA[uv(0x5c9)] = !![]);
    var lB = lA;
    const lC = {};
    (lC[uv(0xbb1)] = !![]),
      (lC[uv(0x3bb)] = !![]),
      (lC[uv(0x8cf)] = !![]),
      (lC[uv(0x4af)] = !![]),
      (lC[uv(0x8f1)] = !![]);
    var lD = lC;
    function lE(rG, rH) {
      const xk = uv;
      rG[xk(0xa39)](), rG[xk(0xb9f)](rH, 0x0);
      for (let rI = 0x0; rI < 0x6; rI++) {
        const rJ = (rI / 0x6) * Math["PI"] * 0x2;
        rG[xk(0xcac)](Math[xk(0xe44)](rJ) * rH, Math[xk(0x88e)](rJ) * rH);
      }
      rG[xk(0x765)]();
    }
    function lF(rG, rH, rI, rJ, rK) {
      const xl = uv;
      rG[xl(0xa39)](),
        rG[xl(0xb9f)](0x9, -0x5),
        rG[xl(0x443)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rG[xl(0x78e)](0xd, 0x0, 0x9, -0x5),
        rG[xl(0x765)](),
        (rG[xl(0xd10)] = rG[xl(0xe0e)] = xl(0x423)),
        (rG[xl(0xc51)] = rJ),
        (rG[xl(0xade)] = rH),
        rG[xl(0x8e6)](),
        (rG[xl(0xade)] -= rK),
        (rG[xl(0x6b8)] = rG[xl(0xc51)] = rI),
        rG[xl(0xa06)](),
        rG[xl(0x8e6)]();
    }
    var lG = class {
        constructor(rG = -0x1, rH, rI, rJ, rK, rL = 0x7, rM = -0x1) {
          const xm = uv;
          (this["id"] = rG),
            (this[xm(0x8fa)] = rH),
            (this[xm(0x8d5)] = hM[rH]),
            (this[xm(0xafc)] = this[xm(0x8d5)][xm(0x307)](xm(0x6d2))),
            (this["x"] = this["nx"] = this["ox"] = rI),
            (this["y"] = this["ny"] = this["oy"] = rJ),
            (this[xm(0x582)] = this[xm(0xa0a)] = this[xm(0x88f)] = rK),
            (this[xm(0xb99)] =
              this[xm(0x3cb)] =
              this[xm(0x60c)] =
              this[xm(0x7d6)] =
                rM),
            (this[xm(0x39d)] = 0x0),
            (this[xm(0x3aa)] = this[xm(0xc04)] = this[xm(0xc2a)] = rL),
            (this[xm(0xddd)] = 0x0),
            (this[xm(0xc52)] = ![]),
            (this[xm(0x722)] = 0x0),
            (this[xm(0x34a)] = 0x0),
            (this[xm(0x9b6)] = this[xm(0x8d5)][xm(0xa91)](xm(0x6ed)) > -0x1),
            (this[xm(0x3a6)] = this[xm(0x9b6)] ? this[xm(0x3cb)] < 0x1 : 0x1),
            (this[xm(0x50e)] = ![]),
            (this[xm(0xb91)] = 0x0),
            (this[xm(0x5eb)] = 0x0),
            (this[xm(0x989)] = 0x0),
            (this[xm(0x656)] = 0x1),
            (this[xm(0xd02)] = 0x0),
            (this[xm(0x263)] = [cS[xm(0xcff)], cS[xm(0xba5)], cS[xm(0x684)]][
              xm(0xc88)
            ](this[xm(0x8fa)])),
            (this[xm(0x690)] = lv[this[xm(0x8d5)]]),
            (this[xm(0x317)] = lx[this[xm(0x8d5)]] ? 0x32 / 0xc8 : 0x0),
            (this[xm(0xdbe)] = lt[this[xm(0x8d5)]]),
            (this[xm(0x557)] = 0x0),
            (this[xm(0x6eb)] = 0x0),
            (this[xm(0x586)] = ![]),
            (this[xm(0xb98)] = 0x0),
            (this[xm(0xd09)] = !![]),
            (this[xm(0xa57)] = 0x2),
            (this[xm(0x733)] = 0x0),
            (this[xm(0x609)] = lD[this[xm(0x8d5)]]),
            (this[xm(0x38d)] = lz[this[xm(0x8d5)]]),
            (this[xm(0xc4b)] = lB[this[xm(0x8d5)]]);
        }
        [uv(0xbce)]() {
          const xn = uv;
          this[xn(0xc52)] && (this[xn(0x722)] += pQ / 0xc8);
          (this[xn(0x6eb)] += ((this[xn(0x586)] ? 0x1 : -0x1) * pQ) / 0xc8),
            (this[xn(0x6eb)] = Math[xn(0x77f)](
              0x1,
              Math[xn(0xb8e)](0x0, this[xn(0x6eb)])
            )),
            (this[xn(0x989)] = pw(
              this[xn(0x989)],
              this[xn(0x5eb)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[xn(0x5eb)] = pw(this[xn(0x5eb)], this[xn(0xb91)], 0x64));
          this[xn(0x34a)] > 0x0 &&
            ((this[xn(0x34a)] -= pQ / 0x96),
            this[xn(0x34a)] < 0x0 && (this[xn(0x34a)] = 0x0));
          (this[xn(0xddd)] += pQ / 0x64),
            (this["t"] = Math[xn(0x77f)](0x1, this[xn(0xddd)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[xn(0x3cb)] =
              this[xn(0x7d6)] +
              (this[xn(0x60c)] - this[xn(0x7d6)]) * this["t"]),
            (this[xn(0x3aa)] =
              this[xn(0xc2a)] +
              (this[xn(0xc04)] - this[xn(0xc2a)]) * this["t"]);
          if (this[xn(0x263)]) {
            const rG = Math[xn(0x77f)](0x1, pQ / 0x64);
            (this[xn(0x656)] +=
              (Math[xn(0xe44)](this[xn(0xa0a)]) - this[xn(0x656)]) * rG),
              (this[xn(0xd02)] +=
                (Math[xn(0x88e)](this[xn(0xa0a)]) - this[xn(0xd02)]) * rG);
          }
          (this[xn(0x582)] = f8(this[xn(0x88f)], this[xn(0xa0a)], this["t"])),
            (this[xn(0xb98)] +=
              ((Math[xn(0x805)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pQ) /
              0x12),
            this[xn(0x39d)] > 0x0 &&
              ((this[xn(0x39d)] -= pQ / 0x258),
              this[xn(0x39d)] < 0x0 && (this[xn(0x39d)] = 0x0)),
            this[xn(0xc4b)] &&
              ((this[xn(0xa57)] += pQ / 0x5dc),
              this[xn(0xa57)] > 0x1 && (this[xn(0xa57)] = 0x1),
              (this[xn(0xd09)] = this[xn(0xa57)] < 0x1)),
            this[xn(0x3cb)] < 0x1 &&
              (this[xn(0x3a6)] = pw(this[xn(0x3a6)], 0x1, 0xc8)),
            this[xn(0x39d)] === 0x0 &&
              (this[xn(0xb99)] +=
                (this[xn(0x3cb)] - this[xn(0xb99)]) *
                Math[xn(0x77f)](0x1, pQ / 0xc8));
        }
        [uv(0x224)](rG, rH = ![]) {
          const xo = uv,
            rI = this[xo(0x3aa)] / 0x19;
          rG[xo(0x627)](rI),
            rG[xo(0xe07)](0x5, 0x0),
            (rG[xo(0xade)] = 0x5),
            (rG[xo(0xe0e)] = rG[xo(0xd10)] = xo(0x423)),
            (rG[xo(0xc51)] = rG[xo(0x6b8)] = this[xo(0x9e3)](xo(0x27d)));
          rH &&
            (rG[xo(0x884)](),
            rG[xo(0xe07)](0x3, 0x0),
            rG[xo(0xa39)](),
            rG[xo(0xb9f)](-0xa, 0x0),
            rG[xo(0xcac)](-0x28, -0xf),
            rG[xo(0x78e)](-0x21, 0x0, -0x28, 0xf),
            rG[xo(0x765)](),
            rG[xo(0x915)](),
            rG[xo(0x8e6)](),
            rG[xo(0xa06)]());
          rG[xo(0xa39)](), rG[xo(0xb9f)](0x0, 0x1e);
          const rJ = 0x1c,
            rK = 0x24,
            rL = 0x5;
          rG[xo(0xb9f)](0x0, rJ);
          for (let rM = 0x0; rM < rL; rM++) {
            const rN = ((((rM + 0.5) / rL) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              rO = ((((rM + 0x1) / rL) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rG[xo(0x78e)](
              Math[xo(0xe44)](rN) * rK * 0.85,
              -Math[xo(0x88e)](rN) * rK,
              Math[xo(0xe44)](rO) * rJ * 0.7,
              -Math[xo(0x88e)](rO) * rJ
            );
          }
          rG[xo(0xcac)](-0x1c, -0x9),
            rG[xo(0x78e)](-0x26, 0x0, -0x1c, 0x9),
            rG[xo(0xcac)](0x0, rJ),
            rG[xo(0x765)](),
            (rG[xo(0x6b8)] = this[xo(0x9e3)](xo(0xa4a))),
            rG[xo(0xa06)](),
            rG[xo(0x8e6)](),
            rG[xo(0xa39)]();
          for (let rP = 0x0; rP < 0x4; rP++) {
            const rQ = (((rP / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rR = -0x1e + Math[xo(0xe44)](rQ) * 0xd,
              rS = Math[xo(0x88e)](rQ) * 0xb;
            rG[xo(0xb9f)](rR, rS),
              rG[xo(0xcac)](
                rR + Math[xo(0xe44)](rQ) * 0x1b,
                rS + Math[xo(0x88e)](rQ) * 0x1b
              );
          }
          (rG[xo(0xade)] = 0x4), rG[xo(0x8e6)]();
        }
        [uv(0x9c2)](rG, rH = uv(0x4bf), rI = 0x0) {
          const xp = uv;
          for (let rJ = 0x0; rJ < l1[xp(0xd55)]; rJ++) {
            const rK = l1[rJ];
            rG[xp(0x884)](),
              rG[xp(0x9c0)](
                rK[xp(0xc22)] * Math[xp(0x88e)](this[xp(0xb98)] + rJ) * 0.15 +
                  rI * rK[xp(0x9f2)]
              ),
              rG[xp(0xa39)](),
              rG[xp(0xb9f)](...rK[xp(0x566)]),
              rG[xp(0x78e)](...rK[xp(0x2fb)]),
              (rG[xp(0xc51)] = this[xp(0x9e3)](rH)),
              (rG[xp(0xade)] = 0x8),
              (rG[xp(0xe0e)] = xp(0x423)),
              rG[xp(0x8e6)](),
              rG[xp(0x915)]();
          }
        }
        [uv(0x2c6)](rG) {
          const xq = uv;
          rG[xq(0xa39)]();
          let rH = 0x0,
            rI = 0x0,
            rJ,
            rK;
          const rL = 0x14;
          for (let rM = 0x0; rM < rL; rM++) {
            const rN = (rM / rL) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              rO = ((rM + 0x1) / rL) * 0x28;
            (rJ = Math[xq(0xe44)](rN) * rO), (rK = Math[xq(0x88e)](rN) * rO);
            const rP = rH + rJ,
              rQ = rI + rK;
            rG[xq(0x78e)](
              (rH + rP) * 0.5 + rK * 0.15,
              (rI + rQ) * 0.5 - rJ * 0.15,
              rP,
              rQ
            ),
              (rH = rP),
              (rI = rQ);
          }
          rG[xq(0x78e)](
            rH - rK * 0.42 + rJ * 0.4,
            rI + rJ * 0.42 + rK * 0.4,
            rH - rK * 0.84,
            rI + rJ * 0.84
          ),
            (rG[xq(0x6b8)] = this[xq(0x9e3)](xq(0x96d))),
            rG[xq(0xa06)](),
            (rG[xq(0xade)] = 0x8),
            (rG[xq(0xc51)] = this[xq(0x9e3)](xq(0x49f))),
            rG[xq(0x8e6)]();
        }
        [uv(0x613)](rG) {
          const xr = uv;
          rG[xr(0x627)](this[xr(0x3aa)] / 0xd),
            rG[xr(0x9c0)](-Math["PI"] / 0x6),
            (rG[xr(0xe0e)] = rG[xr(0xd10)] = xr(0x423)),
            rG[xr(0xa39)](),
            rG[xr(0xb9f)](0x0, -0xe),
            rG[xr(0xcac)](0x6, -0x14),
            (rG[xr(0x6b8)] = rG[xr(0xc51)] = this[xr(0x9e3)](xr(0xaeb))),
            (rG[xr(0xade)] = 0x7),
            rG[xr(0x8e6)](),
            (rG[xr(0x6b8)] = rG[xr(0xc51)] = this[xr(0x9e3)](xr(0xe1c))),
            (rG[xr(0xade)] = 0x2),
            rG[xr(0x8e6)](),
            rG[xr(0xa39)](),
            rG[xr(0xb9f)](0x0, -0xc),
            rG[xr(0x78e)](-0x6, 0x0, 0x4, 0xe),
            rG[xr(0x443)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rG[xr(0xade)] = 0xc),
            (rG[xr(0x6b8)] = rG[xr(0xc51)] = this[xr(0x9e3)](xr(0x87a))),
            rG[xr(0xa06)](),
            rG[xr(0x8e6)](),
            (rG[xr(0xade)] = 0x6),
            (rG[xr(0x6b8)] = rG[xr(0xc51)] = this[xr(0x9e3)](xr(0xd2a))),
            rG[xr(0x8e6)](),
            rG[xr(0xa06)]();
        }
        [uv(0x29f)](rG) {
          const xs = uv;
          rG[xs(0x627)](this[xs(0x3aa)] / 0x2d),
            rG[xs(0xe07)](-0x14, 0x0),
            (rG[xs(0xe0e)] = rG[xs(0xd10)] = xs(0x423)),
            rG[xs(0xa39)]();
          const rH = 0x6,
            rI = Math["PI"] * 0.45,
            rJ = 0x3c,
            rK = 0x46;
          rG[xs(0xb9f)](0x0, 0x0);
          for (let rL = 0x0; rL < rH; rL++) {
            const rM = ((rL / rH) * 0x2 - 0x1) * rI,
              rN = (((rL + 0x1) / rH) * 0x2 - 0x1) * rI;
            rL === 0x0 &&
              rG[xs(0x78e)](
                -0xa,
                -0x32,
                Math[xs(0xe44)](rM) * rJ,
                Math[xs(0x88e)](rM) * rJ
              );
            const rO = (rM + rN) / 0x2;
            rG[xs(0x78e)](
              Math[xs(0xe44)](rO) * rK,
              Math[xs(0x88e)](rO) * rK,
              Math[xs(0xe44)](rN) * rJ,
              Math[xs(0x88e)](rN) * rJ
            );
          }
          rG[xs(0x78e)](-0xa, 0x32, 0x0, 0x0),
            (rG[xs(0x6b8)] = this[xs(0x9e3)](xs(0x226))),
            (rG[xs(0xc51)] = this[xs(0x9e3)](xs(0x28e))),
            (rG[xs(0xade)] = 0xa),
            rG[xs(0x8e6)](),
            rG[xs(0xa06)](),
            rG[xs(0xa39)](),
            rG[xs(0xce9)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rG[xs(0x765)](),
            (rG[xs(0xc51)] = this[xs(0x9e3)](xs(0xc6f))),
            (rG[xs(0xade)] = 0x1e),
            rG[xs(0x8e6)](),
            (rG[xs(0xade)] = 0xa),
            (rG[xs(0xc51)] = rG[xs(0x6b8)] = this[xs(0x9e3)](xs(0x461))),
            rG[xs(0xa06)](),
            rG[xs(0x8e6)]();
        }
        [uv(0x895)](rG, rH = ![]) {
          const xt = uv;
          rG[xt(0x627)](this[xt(0x3aa)] / 0x64);
          let rI = this[xt(0xd2d)]
            ? 0.75
            : Math[xt(0x88e)](Date[xt(0xd3f)]() / 0x96 + this[xt(0xb98)]);
          (rI = rI * 0.5 + 0.5),
            (rI *= 0.7),
            rG[xt(0xa39)](),
            rG[xt(0xb9f)](0x0, 0x0),
            rG[xt(0xce9)](0x0, 0x0, 0x64, rI, Math["PI"] * 0x2 - rI),
            rG[xt(0x765)](),
            (rG[xt(0x6b8)] = this[xt(0x9e3)](xt(0xd63))),
            rG[xt(0xa06)](),
            rG[xt(0x9be)](),
            (rG[xt(0xc51)] = xt(0x61f)),
            (rG[xt(0xade)] = rH ? 0x28 : 0x1e),
            (rG[xt(0xd10)] = xt(0x423)),
            rG[xt(0x8e6)](),
            !rH &&
              (rG[xt(0xa39)](),
              rG[xt(0xce9)](
                0x0 - rI * 0x8,
                -0x32 - rI * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rG[xt(0x6b8)] = xt(0x300)),
              rG[xt(0xa06)]());
        }
        [uv(0x748)](rG) {
          const xu = uv;
          rG[xu(0x627)](this[xu(0x3aa)] / 0x50),
            rG[xu(0x9c0)](-this[xu(0x582)]),
            rG[xu(0xe07)](0x0, 0x50);
          const rH = Date[xu(0xd3f)]() / 0x12c + this[xu(0xb98)];
          rG[xu(0xa39)]();
          const rI = 0x3;
          let rJ;
          for (let rM = 0x0; rM < rI; rM++) {
            const rN = ((rM / rI) * 0x2 - 0x1) * 0x64,
              rO = (((rM + 0x1) / rI) * 0x2 - 0x1) * 0x64;
            (rJ =
              0x14 +
              (Math[xu(0x88e)]((rM / rI) * Math["PI"] * 0x8 + rH) * 0.5 + 0.5) *
                0x1e),
              rM === 0x0 && rG[xu(0xb9f)](rN, -rJ),
              rG[xu(0x443)](rN, rJ, rO, rJ, rO, -rJ);
          }
          rG[xu(0x443)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rJ),
            rG[xu(0x765)](),
            (rG[xu(0x58a)] *= 0.7);
          const rK = this[xu(0x50e)]
            ? lh[0x0]
            : this["id"] < 0x0
            ? lj[0x0]
            : lj[this["id"] % lj[xu(0xd55)]];
          (rG[xu(0x6b8)] = this[xu(0x9e3)](rK)),
            rG[xu(0xa06)](),
            rG[xu(0x9be)](),
            (rG[xu(0xd10)] = xu(0x423)),
            (rG[xu(0xc51)] = xu(0x61f)),
            xu(0x630),
            (rG[xu(0xade)] = 0x1e),
            rG[xu(0x8e6)]();
          let rL = Math[xu(0x88e)](rH * 0x1);
          (rL = rL * 0.5 + 0.5),
            (rL *= 0x3),
            rG[xu(0xa39)](),
            rG[xu(0x4a4)](
              0x0,
              -0x82 - rL * 0x2,
              0x28 - rL,
              0x14 - rL * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rG[xu(0x6b8)] = rG[xu(0xc51)]),
            rG[xu(0xa06)]();
        }
        [uv(0x594)](rG, rH) {
          const xv = uv;
          rG[xv(0x627)](this[xv(0x3aa)] / 0x14);
          const rI = rG[xv(0x58a)];
          (rG[xv(0xc51)] = rG[xv(0x6b8)] = this[xv(0x9e3)](xv(0xdbd))),
            (rG[xv(0x58a)] = 0.4 * rI),
            rG[xv(0x884)](),
            rG[xv(0xa39)](),
            rG[xv(0x9c0)](Math["PI"] * 0.16),
            rG[xv(0xe07)](rH ? -0x6 : -0x9, 0x0),
            rG[xv(0xb9f)](0x0, -0x4),
            rG[xv(0x78e)](-0x2, 0x0, 0x0, 0x4),
            (rG[xv(0xade)] = 0x8),
            (rG[xv(0xd10)] = rG[xv(0xe0e)] = xv(0x423)),
            rG[xv(0x8e6)](),
            rG[xv(0x915)](),
            rG[xv(0xa39)](),
            rG[xv(0xce9)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rG[xv(0xa06)](),
            rG[xv(0x9be)](),
            (rG[xv(0x58a)] = 0.5 * rI),
            (rG[xv(0xade)] = rH ? 0x8 : 0x3),
            rG[xv(0x8e6)]();
        }
        [uv(0x4af)](rG) {
          const xw = uv;
          rG[xw(0x627)](this[xw(0x3aa)] / 0x64);
          const rH = this[xw(0x9e3)](xw(0x61e)),
            rI = this[xw(0x9e3)](xw(0x8cb)),
            rJ = 0x4;
          rG[xw(0xd10)] = rG[xw(0xe0e)] = xw(0x423);
          const rK = 0x64 - rG[xw(0xade)] * 0.5;
          for (let rL = 0x0; rL <= rJ; rL++) {
            const rM = (0x1 - rL / rJ) * rK;
            lE(rG, rM),
              (rG[xw(0xade)] =
                0x1e +
                rL *
                  (Math[xw(0x88e)](Date[xw(0xd3f)]() / 0x320 + rL) * 0.5 +
                    0.5) *
                  0x5),
              (rG[xw(0x6b8)] = rG[xw(0xc51)] = rL % 0x2 === 0x0 ? rH : rI),
              rL === rJ - 0x1 && rG[xw(0xa06)](),
              rG[xw(0x8e6)]();
          }
        }
        [uv(0x80e)](rG, rH) {
          const xx = uv;
          rG[xx(0xa39)](),
            rG[xx(0xce9)](0x0, 0x0, this[xx(0x3aa)], 0x0, l0),
            (rG[xx(0x6b8)] = this[xx(0x9e3)](rH)),
            rG[xx(0xa06)](),
            (rG[xx(0x6b8)] = xx(0x300));
          for (let rI = 0x1; rI < 0x4; rI++) {
            rG[xx(0xa39)](),
              rG[xx(0xce9)](
                0x0,
                0x0,
                this[xx(0x3aa)] * (0x1 - rI / 0x4),
                0x0,
                l0
              ),
              rG[xx(0xa06)]();
          }
        }
        [uv(0xca5)](rG, rH) {
          const xy = uv;
          rG[xy(0xe07)](-this[xy(0x3aa)], 0x0), (rG[xy(0x999)] = xy(0x1f5));
          const rI = 0x32;
          let rJ = ![];
          !this[xy(0xaa9)] && ((rJ = !![]), (this[xy(0xaa9)] = []));
          while (this[xy(0xaa9)][xy(0xd55)] < rI) {
            this[xy(0xaa9)][xy(0xe68)]({
              x: rJ ? Math[xy(0xbf6)]() : 0x0,
              y: Math[xy(0xbf6)]() * 0x2 - 0x1,
              vx: Math[xy(0xbf6)]() * 0.03 + 0.02,
              size: Math[xy(0xbf6)]() * 0.2 + 0.2,
            });
          }
          const rK = this[xy(0x3aa)] * 0x2,
            rL = Math[xy(0xb8e)](this[xy(0x3aa)] * 0.1, 0x4),
            rM = rG[xy(0x58a)];
          (rG[xy(0x6b8)] = rH), rG[xy(0xa39)]();
          for (let rN = rI - 0x1; rN >= 0x0; rN--) {
            const rO = this[xy(0xaa9)][rN];
            rO["x"] += rO["vx"];
            const rP = rO["x"] * rK,
              rQ = this[xy(0x317)] * rP,
              rR = rO["y"] * rQ,
              rS =
                Math[xy(0xa4e)](0x1 - Math[xy(0x911)](rR) / rQ, 0.2) *
                Math[xy(0xa4e)](0x1 - rP / rK, 0.2);
            if (rO["x"] >= 0x1 || rS < 0.001) {
              this[xy(0xaa9)][xy(0x4f9)](rN, 0x1);
              continue;
            }
            (rG[xy(0x58a)] = rS * rM * 0.5),
              rG[xy(0xa39)](),
              rG[xy(0xce9)](
                rP,
                rR,
                rO[xy(0x3aa)] * rQ + rL,
                0x0,
                Math["PI"] * 0x2
              ),
              rG[xy(0xa06)]();
          }
        }
        [uv(0x6fd)](rG) {
          const xz = uv;
          rG[xz(0x627)](this[xz(0x3aa)] / 0x46),
            rG[xz(0x9c0)](-Math["PI"] / 0x2);
          const rH = pP / 0xc8;
          (rG[xz(0xade)] = 0x14),
            (rG[xz(0xc51)] = xz(0x4b7)),
            (rG[xz(0xe0e)] = rG[xz(0xd10)] = xz(0x423)),
            (rG[xz(0x6b8)] = this[xz(0x9e3)](xz(0x654)));
          if (!![]) {
            this[xz(0x877)](rG);
            return;
          }
          const rI = 0x2;
          for (let rJ = 0x1; rJ <= rI; rJ++) {
            rG[xz(0x884)]();
            let rK = 0x1 - rJ / rI;
            (rK *= 0x1 + Math[xz(0x88e)](rH + rJ) * 0.5),
              (rK = 0x1 + rK * 0.5),
              (rG[xz(0x58a)] *= Math[xz(0xa4e)](rJ / rI, 0x2)),
              rG[xz(0x28b)](rK, rK),
              rJ !== rI &&
                ((rG[xz(0x58a)] *= 0.7),
                (rG[xz(0x999)] = xz(0x1f5)),
                (rG[xz(0x2e2)] = xz(0x52d))),
              this[xz(0x877)](rG),
              rG[xz(0x915)]();
          }
        }
        [uv(0x834)](rG, rH = 0xbe) {
          const xA = uv;
          rG[xA(0x884)](),
            rG[xA(0xa39)](),
            rG[xA(0xb9f)](0x0, -0x46 + rH + 0x1e),
            rG[xA(0xcac)](0x1a, -0x46 + rH),
            rG[xA(0xcac)](0xd, -0x46),
            rG[xA(0xcac)](-0xd, -0x46),
            rG[xA(0xcac)](-0x1a, -0x46 + rH),
            rG[xA(0xcac)](0x0, -0x46 + rH + 0x1e),
            rG[xA(0x9be)](),
            rG[xA(0xa06)](),
            rG[xA(0x8e6)](),
            rG[xA(0x915)](),
            rG[xA(0x884)](),
            rG[xA(0xa39)](),
            rG[xA(0xb9f)](-0x12, -0x46),
            rG[xA(0x78e)](-0x5, -0x50, -0xa, -0x69),
            rG[xA(0x443)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rG[xA(0x78e)](0x5, -0x50, 0x12, -0x46),
            rG[xA(0x78e)](0x0, -0x3c, -0x12, -0x46),
            rG[xA(0x765)](),
            this[xA(0xafc)]
              ? ((rG[xA(0x6b8)] = this[xA(0x9e3)](xA(0xbb7))),
                (rG[xA(0xc51)] = this[xA(0x9e3)](xA(0x19a))))
              : (rG[xA(0xc51)] = this[xA(0x9e3)](xA(0x512))),
            rG[xA(0xa06)](),
            (rG[xA(0xade)] = 0xa),
            rG[xA(0x8e6)](),
            rG[xA(0x915)]();
        }
        [uv(0x877)](rG) {
          const xB = uv;
          rG[xB(0x884)](), rG[xB(0xa39)]();
          for (let rH = 0x0; rH < 0x2; rH++) {
            rG[xB(0xb9f)](0x14, -0x1e),
              rG[xB(0x78e)](0x5a, -0xa, 0x32, -0x32),
              rG[xB(0xcac)](0xa0, -0x32),
              rG[xB(0x78e)](0x8c, 0x3c, 0x14, 0x0),
              rG[xB(0x28b)](-0x1, 0x1);
          }
          rG[xB(0x9be)](),
            rG[xB(0xa06)](),
            rG[xB(0x8e6)](),
            rG[xB(0x915)](),
            this[xB(0x834)](rG),
            rG[xB(0x884)](),
            rG[xB(0xa39)](),
            rG[xB(0xce9)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rG[xB(0xcac)](-0x32, 0x1e),
            rG[xB(0xcac)](-0x1e, 0x1e),
            rG[xB(0xcac)](-0x1f, 0x32),
            rG[xB(0xcac)](0x1f, 0x32),
            rG[xB(0xcac)](0x1e, 0x1e),
            rG[xB(0xcac)](0x32, 0x1e),
            rG[xB(0xcac)](0x32, 0x0),
            rG[xB(0xa06)](),
            rG[xB(0x9be)](),
            rG[xB(0x8e6)](),
            rG[xB(0xa39)](),
            rG[xB(0x4a4)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rG[xB(0x4a4)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rG[xB(0x6b8)] = rG[xB(0xc51)]),
            rG[xB(0xa06)](),
            rG[xB(0x915)]();
        }
        [uv(0x907)](rG) {
          const xC = uv;
          rG[xC(0x627)](this[xC(0x3aa)] / 0x64), (rG[xC(0xc51)] = xC(0x300));
          const rH = this[xC(0x9e3)](xC(0x330)),
            rI = this[xC(0x9e3)](xC(0x645));
          (this[xC(0x733)] += (pQ / 0x12c) * (this[xC(0xd09)] ? 0x1 : -0x1)),
            (this[xC(0x733)] = Math[xC(0x77f)](
              0x1,
              Math[xC(0xb8e)](0x0, this[xC(0x733)])
            ));
          const rJ = this[xC(0xd2d)] ? 0x1 : this[xC(0x733)],
            rK = 0x1 - rJ;
          rG[xC(0x884)](),
            rG[xC(0xa39)](),
            rG[xC(0xe07)](
              (0x30 +
                (Math[xC(0x88e)](this[xC(0xb98)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rJ +
                (0x1 - rJ) * -0x14,
              0x0
            ),
            rG[xC(0x28b)](1.1, 1.1),
            rG[xC(0xb9f)](0x0, -0xa),
            rG[xC(0x443)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rG[xC(0x6b8)] = rI),
            rG[xC(0xa06)](),
            (rG[xC(0xd10)] = xC(0x423)),
            (rG[xC(0xade)] = 0x1c),
            rG[xC(0x9be)](),
            rG[xC(0x8e6)](),
            rG[xC(0x915)]();
          for (let rL = 0x0; rL < 0x2; rL++) {
            const rM = Math[xC(0x88e)](this[xC(0xb98)] * 0x1);
            rG[xC(0x884)]();
            const rN = rL * 0x2 - 0x1;
            rG[xC(0x28b)](0x1, rN),
              rG[xC(0xe07)](0x32 * rJ - rK * 0xa, 0x50 * rJ),
              rG[xC(0x9c0)](rM * 0.2 + 0.3 - rK * 0x1),
              rG[xC(0xa39)](),
              rG[xC(0xb9f)](0xa, -0xa),
              rG[xC(0x78e)](0x1e, 0x28, -0x14, 0x50),
              rG[xC(0x78e)](0xa, 0x1e, -0xf, 0x0),
              (rG[xC(0xc51)] = rH),
              (rG[xC(0xade)] = 0x2c),
              (rG[xC(0xe0e)] = rG[xC(0xd10)] = xC(0x423)),
              rG[xC(0x8e6)](),
              (rG[xC(0xade)] -= 0x1c),
              (rG[xC(0x6b8)] = rG[xC(0xc51)] = rI),
              rG[xC(0xa06)](),
              rG[xC(0x8e6)](),
              rG[xC(0x915)]();
          }
          for (let rO = 0x0; rO < 0x2; rO++) {
            const rP = Math[xC(0x88e)](this[xC(0xb98)] * 0x1 + 0x1);
            rG[xC(0x884)]();
            const rQ = rO * 0x2 - 0x1;
            rG[xC(0x28b)](0x1, rQ),
              rG[xC(0xe07)](-0x41 * rJ, 0x32 * rJ),
              rG[xC(0x9c0)](rP * 0.3 + 1.3),
              rG[xC(0xa39)](),
              rG[xC(0xb9f)](0xc, -0x5),
              rG[xC(0x78e)](0x28, 0x1e, 0x0, 0x3c),
              rG[xC(0x78e)](0x14, 0x1e, 0x0, 0x0),
              (rG[xC(0xc51)] = rH),
              (rG[xC(0xade)] = 0x2c),
              (rG[xC(0xe0e)] = rG[xC(0xd10)] = xC(0x423)),
              rG[xC(0x8e6)](),
              (rG[xC(0xade)] -= 0x1c),
              (rG[xC(0x6b8)] = rG[xC(0xc51)] = rI),
              rG[xC(0x8e6)](),
              rG[xC(0xa06)](),
              rG[xC(0x915)]();
          }
          this[xC(0x946)](rG);
        }
        [uv(0x946)](rG, rH = 0x1) {
          const xD = uv;
          rG[xD(0xa39)](),
            rG[xD(0xce9)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rG[xD(0xc51)] = xD(0x300)),
            (rG[xD(0x6b8)] = this[xD(0x9e3)](xD(0x854))),
            rG[xD(0xa06)](),
            (rG[xD(0xade)] = 0x1e * rH),
            rG[xD(0x884)](),
            rG[xD(0x9be)](),
            rG[xD(0x8e6)](),
            rG[xD(0x915)](),
            rG[xD(0x884)](),
            rG[xD(0xa39)](),
            rG[xD(0xce9)](
              0x0,
              0x0,
              0x64 - rG[xD(0xade)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rG[xD(0x9be)](),
            rG[xD(0xa39)]();
          for (let rI = 0x0; rI < 0x6; rI++) {
            const rJ = (rI / 0x6) * Math["PI"] * 0x2;
            rG[xD(0xcac)](
              Math[xD(0xe44)](rJ) * 0x28,
              Math[xD(0x88e)](rJ) * 0x28
            );
          }
          rG[xD(0x765)]();
          for (let rK = 0x0; rK < 0x6; rK++) {
            const rL = (rK / 0x6) * Math["PI"] * 0x2,
              rM = Math[xD(0xe44)](rL) * 0x28,
              rN = Math[xD(0x88e)](rL) * 0x28;
            rG[xD(0xb9f)](rM, rN), rG[xD(0xcac)](rM * 0x3, rN * 0x3);
          }
          (rG[xD(0xade)] = 0x10 * rH),
            (rG[xD(0xe0e)] = rG[xD(0xd10)] = xD(0x423)),
            rG[xD(0x8e6)](),
            rG[xD(0x915)]();
        }
        [uv(0x9bf)](rG) {
          const xE = uv;
          rG[xE(0x627)](this[xE(0x3aa)] / 0x82);
          let rH, rI;
          const rJ = 0x2d,
            rK = lp(
              this[xE(0x3d3)] ||
                (this[xE(0x3d3)] = this[xE(0xd2d)]
                  ? 0x28
                  : Math[xE(0xbf6)]() * 0x3e8)
            );
          let rL = rK() * 6.28;
          const rM = Date[xE(0xd3f)]() / 0xc8,
            rN = [xE(0x183), xE(0xa8b)][xE(0xa9a)]((rO) => this[xE(0x9e3)](rO));
          for (let rO = 0x0; rO <= rJ; rO++) {
            (rO % 0x5 === 0x0 || rO === rJ) &&
              (rO > 0x0 &&
                ((rG[xE(0xade)] = 0x19),
                (rG[xE(0xd10)] = rG[xE(0xe0e)] = xE(0x423)),
                (rG[xE(0xc51)] = rN[0x1]),
                rG[xE(0x8e6)](),
                (rG[xE(0xade)] = 0xc),
                (rG[xE(0xc51)] = rN[0x0]),
                rG[xE(0x8e6)]()),
              rO !== rJ && (rG[xE(0xa39)](), rG[xE(0xb9f)](rH, rI)));
            let rP = rO / 0x32;
            (rP *= rP), (rL += (0.3 + rK() * 0.8) * 0x3);
            const rQ = 0x14 + Math[xE(0x88e)](rP * 3.14) * 0x6e,
              rR = Math[xE(0x88e)](rO + rM) * 0.5,
              rS = Math[xE(0xe44)](rL + rR) * rQ,
              rT = Math[xE(0x88e)](rL + rR) * rQ,
              rU = rS - rH,
              rV = rT - rI;
            rG[xE(0x78e)]((rH + rS) / 0x2 + rV, (rI + rT) / 0x2 - rU, rS, rT),
              (rH = rS),
              (rI = rT);
          }
        }
        [uv(0x8f1)](rG) {
          const xF = uv;
          rG[xF(0x627)](this[xF(0x3aa)] / 0x6e),
            (rG[xF(0xc51)] = xF(0x300)),
            (rG[xF(0xade)] = 0x1c),
            rG[xF(0xa39)](),
            rG[xF(0xce9)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rG[xF(0x6b8)] = this[xF(0x9e3)](xF(0xcfc))),
            rG[xF(0xa06)](),
            rG[xF(0x884)](),
            rG[xF(0x9be)](),
            rG[xF(0x8e6)](),
            rG[xF(0x915)](),
            rG[xF(0xa39)](),
            rG[xF(0xce9)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rG[xF(0x6b8)] = xF(0x3b2)),
            rG[xF(0xa06)](),
            rG[xF(0x884)](),
            rG[xF(0x9be)](),
            rG[xF(0x8e6)](),
            rG[xF(0x915)]();
          const rH = lp(
              this[xF(0x74c)] ||
                (this[xF(0x74c)] = this[xF(0xd2d)]
                  ? 0x1e
                  : Math[xF(0xbf6)]() * 0x3e8)
            ),
            rI = this[xF(0x9e3)](xF(0xe23)),
            rJ = this[xF(0x9e3)](xF(0x3ee));
          for (let rM = 0x0; rM < 0x3; rM++) {
            rG[xF(0xa39)]();
            const rN = 0xc;
            for (let rO = 0x0; rO < rN; rO++) {
              const rP = (Math["PI"] * 0x2 * rO) / rN;
              rG[xF(0x884)](),
                rG[xF(0x9c0)](rP + rH() * 0.4),
                rG[xF(0xe07)](0x3c + rH() * 0xa, 0x0),
                rG[xF(0xb9f)](rH() * 0x5, rH() * 0x5),
                rG[xF(0x443)](
                  0x14 + rH() * 0xa,
                  rH() * 0x14,
                  0x28 + rH() * 0x14,
                  rH() * 0x1e + 0xa,
                  0x3c + rH() * 0xa,
                  rH() * 0xa + 0xa
                ),
                rG[xF(0x915)]();
            }
            (rG[xF(0xe0e)] = rG[xF(0xd10)] = xF(0x423)),
              (rG[xF(0xade)] = 0x12 - rM * 0x2),
              (rG[xF(0xc51)] = rI),
              rG[xF(0x8e6)](),
              (rG[xF(0xade)] -= 0x8),
              (rG[xF(0xc51)] = rJ),
              rG[xF(0x8e6)]();
          }
          const rK = 0x28;
          rG[xF(0x9c0)](-this[xF(0x582)]),
            (rG[xF(0x6b8)] = this[xF(0x9e3)](xF(0x2c5))),
            (rG[xF(0xc51)] = this[xF(0x9e3)](xF(0x1be))),
            (rG[xF(0xade)] = 0x9);
          const rL = this[xF(0x3cb)] * 0x6;
          for (let rQ = 0x0; rQ < rL; rQ++) {
            const rR = ((rQ - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rG[xF(0xa39)](),
              rG[xF(0x4a4)](
                Math[xF(0xe44)](rR) * rK,
                Math[xF(0x88e)](rR) * rK * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rG[xF(0xa06)](),
              rG[xF(0x8e6)]();
          }
        }
        [uv(0xbbd)](rG) {
          const xG = uv;
          rG[xG(0x9c0)](-this[xG(0x582)]),
            rG[xG(0x627)](this[xG(0x3aa)] / 0x3c),
            (rG[xG(0xe0e)] = rG[xG(0xd10)] = xG(0x423));
          let rH =
            Math[xG(0x88e)](Date[xG(0xd3f)]() / 0x12c + this[xG(0xb98)] * 0.5) *
              0.5 +
            0.5;
          (rH *= 1.5),
            rG[xG(0xa39)](),
            rG[xG(0xb9f)](-0x32, -0x32 - rH * 0x3),
            rG[xG(0x78e)](0x0, -0x3c, 0x32, -0x32 - rH * 0x3),
            rG[xG(0x78e)](0x50 - rH * 0x3, -0xa, 0x50, 0x32),
            rG[xG(0x78e)](0x46, 0x4b, 0x28, 0x4e + rH * 0x5),
            rG[xG(0xcac)](0x1e, 0x3c + rH * 0x5),
            rG[xG(0x78e)](0x2d, 0x37, 0x32, 0x2d),
            rG[xG(0x78e)](0x0, 0x41, -0x32, 0x32),
            rG[xG(0x78e)](-0x2d, 0x37, -0x1e, 0x3c + rH * 0x3),
            rG[xG(0xcac)](-0x28, 0x4e + rH * 0x5),
            rG[xG(0x78e)](-0x46, 0x4b, -0x50, 0x32),
            rG[xG(0x78e)](-0x50 + rH * 0x3, -0xa, -0x32, -0x32 - rH * 0x3),
            (rG[xG(0x6b8)] = this[xG(0x9e3)](xG(0x309))),
            rG[xG(0xa06)](),
            (rG[xG(0xc51)] = xG(0x300)),
            rG[xG(0x884)](),
            rG[xG(0x9be)](),
            (rG[xG(0xade)] = 0xe),
            rG[xG(0x8e6)](),
            rG[xG(0x915)]();
          for (let rI = 0x0; rI < 0x2; rI++) {
            rG[xG(0x884)](),
              rG[xG(0x28b)](rI * 0x2 - 0x1, 0x1),
              rG[xG(0xe07)](-0x22, -0x18 - rH * 0x3),
              rG[xG(0x9c0)](-0.6),
              rG[xG(0x28b)](1.3, 1.3),
              rG[xG(0xa39)](),
              rG[xG(0xb9f)](-0x14, 0x0),
              rG[xG(0x78e)](-0x14, -0x19, 0x0, -0x28),
              rG[xG(0x78e)](0x14, -0x19, 0x14, 0x0),
              rG[xG(0xa06)](),
              rG[xG(0x9be)](),
              (rG[xG(0xade)] = 0xd),
              rG[xG(0x8e6)](),
              rG[xG(0x915)]();
          }
          rG[xG(0x884)](),
            rG[xG(0xa39)](),
            rG[xG(0x4a4)](
              0x0,
              0x1e,
              0x24 - rH * 0x2,
              0x8 - rH,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rG[xG(0x6b8)] = this[xG(0x9e3)](xG(0x21a))),
            (rG[xG(0x58a)] *= 0.2),
            rG[xG(0xa06)](),
            rG[xG(0x915)](),
            (rG[xG(0x6b8)] = rG[xG(0xc51)] = this[xG(0x9e3)](xG(0x591)));
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            rG[xG(0x884)](),
              rG[xG(0x28b)](rJ * 0x2 - 0x1, 0x1),
              rG[xG(0xe07)](0x19 - rH * 0x1, 0xf - rH * 0x3),
              rG[xG(0x9c0)](-0.3),
              rG[xG(0xa39)](),
              rG[xG(0xce9)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rG[xG(0xa06)](),
              rG[xG(0x915)]();
          }
          rG[xG(0x884)](),
            (rG[xG(0xade)] = 0x5),
            rG[xG(0xe07)](0x0, 0x21 - rH * 0x1),
            rG[xG(0xa39)](),
            rG[xG(0xb9f)](-0xc, 0x0),
            rG[xG(0x443)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rG[xG(0x443)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rG[xG(0x8e6)](),
            rG[xG(0x915)]();
        }
        [uv(0x553)](rG) {
          const xH = uv;
          rG[xH(0x627)](this[xH(0x3aa)] / 0x3c),
            rG[xH(0x9c0)](-Math["PI"] / 0x2),
            rG[xH(0xa39)](),
            rG[xH(0xb9f)](0x32, 0x50),
            rG[xH(0x78e)](0x1e, 0x1e, 0x32, -0x14),
            rG[xH(0x78e)](0x5a, -0x64, 0x0, -0x64),
            rG[xH(0x78e)](-0x5a, -0x64, -0x32, -0x14),
            rG[xH(0x78e)](-0x1e, 0x1e, -0x32, 0x50),
            (rG[xH(0x6b8)] = this[xH(0x9e3)](xH(0xdb0))),
            rG[xH(0xa06)](),
            (rG[xH(0xd10)] = rG[xH(0xe0e)] = xH(0x423)),
            (rG[xH(0xade)] = 0x14),
            rG[xH(0x9be)](),
            (rG[xH(0xc51)] = xH(0x300)),
            rG[xH(0x8e6)](),
            (rG[xH(0x6b8)] = this[xH(0x9e3)](xH(0xaee)));
          const rH = 0x6;
          rG[xH(0xa39)](), rG[xH(0xb9f)](-0x32, 0x50);
          for (let rI = 0x0; rI < rH; rI++) {
            const rJ = (((rI + 0.5) / rH) * 0x2 - 0x1) * 0x32,
              rK = (((rI + 0x1) / rH) * 0x2 - 0x1) * 0x32;
            rG[xH(0x78e)](rJ, 0x1e, rK, 0x50);
          }
          (rG[xH(0xade)] = 0x8),
            rG[xH(0xa06)](),
            rG[xH(0x8e6)](),
            (rG[xH(0xc51)] = rG[xH(0x6b8)] = xH(0x300)),
            rG[xH(0x884)](),
            rG[xH(0xe07)](0x0, -0x5),
            rG[xH(0xa39)](),
            rG[xH(0xb9f)](0x0, 0x0),
            rG[xH(0x443)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rG[xH(0x8e6)](),
            rG[xH(0x915)]();
          for (let rL = 0x0; rL < 0x2; rL++) {
            rG[xH(0x884)](),
              rG[xH(0x28b)](rL * 0x2 - 0x1, 0x1),
              rG[xH(0xe07)](0x19, -0x38),
              rG[xH(0xa39)](),
              rG[xH(0xce9)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rG[xH(0x9be)](),
              (rG[xH(0xade)] = 0xf),
              rG[xH(0x8e6)](),
              rG[xH(0xa06)](),
              rG[xH(0x915)]();
          }
        }
        [uv(0x75f)](rG) {
          const xI = uv;
          rG[xI(0x627)](this[xI(0x3aa)] / 0x32),
            (rG[xI(0xc51)] = xI(0x300)),
            (rG[xI(0xade)] = 0x10);
          const rH = 0x7;
          rG[xI(0xa39)]();
          const rI = 0x12;
          rG[xI(0x6b8)] = this[xI(0x9e3)](xI(0xd15));
          const rJ = Math[xI(0x88e)](pP / 0x258);
          for (let rK = 0x0; rK < 0x2; rK++) {
            const rL = 1.2 - rK * 0.2;
            for (let rM = 0x0; rM < rH; rM++) {
              rG[xI(0x884)](),
                rG[xI(0x9c0)](
                  (rM / rH) * Math["PI"] * 0x2 + (rK / rH) * Math["PI"]
                ),
                rG[xI(0xe07)](0x2e, 0x0),
                rG[xI(0x28b)](rL, rL);
              const rN = Math[xI(0x88e)](rJ + rM * 0.05 * (0x1 - rK * 0.5));
              rG[xI(0xa39)](),
                rG[xI(0xb9f)](0x0, rI),
                rG[xI(0x78e)](0x14, rI, 0x28 + rN, 0x0 + rN * 0x5),
                rG[xI(0x78e)](0x14, -rI, 0x0, -rI),
                rG[xI(0xa06)](),
                rG[xI(0x9be)](),
                rG[xI(0x8e6)](),
                rG[xI(0x915)]();
            }
          }
          rG[xI(0xa39)](),
            rG[xI(0xce9)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rG[xI(0x6b8)] = this[xI(0x9e3)](xI(0x740))),
            rG[xI(0xa06)](),
            rG[xI(0x9be)](),
            (rG[xI(0xade)] = 0x19),
            rG[xI(0x8e6)]();
        }
        [uv(0x5c9)](rG) {
          const xJ = uv;
          rG[xJ(0x627)](this[xJ(0x3aa)] / 0x28);
          let rH = this[xJ(0xb98)];
          const rI = this[xJ(0xd2d)] ? 0x0 : Math[xJ(0x88e)](pP / 0x64) * 0xf;
          (rG[xJ(0xe0e)] = rG[xJ(0xd10)] = xJ(0x423)),
            rG[xJ(0xa39)](),
            rG[xJ(0x884)]();
          const rJ = 0x3;
          for (let rK = 0x0; rK < 0x2; rK++) {
            const rL = rK === 0x0 ? 0x1 : -0x1;
            for (let rM = 0x0; rM <= rJ; rM++) {
              rG[xJ(0x884)](), rG[xJ(0xb9f)](0x0, 0x0);
              const rN = Math[xJ(0x88e)](rH + rM + rK);
              rG[xJ(0x9c0)](((rM / rJ) * 0x2 - 0x1) * 0.6 + 1.4 + rN * 0.15),
                rG[xJ(0xcac)](0x2d + rL * rI, 0x0),
                rG[xJ(0x9c0)](0.2 + (rN * 0.5 + 0.5) * 0.1),
                rG[xJ(0xcac)](0x4b, 0x0),
                rG[xJ(0x915)]();
            }
            rG[xJ(0x28b)](0x1, -0x1);
          }
          rG[xJ(0x915)](),
            (rG[xJ(0xade)] = 0x8),
            (rG[xJ(0xc51)] = this[xJ(0x9e3)](xJ(0x349))),
            rG[xJ(0x8e6)](),
            rG[xJ(0x884)](),
            rG[xJ(0xe07)](0x0, rI),
            this[xJ(0x847)](rG),
            rG[xJ(0x915)]();
        }
        [uv(0x847)](rG, rH = ![]) {
          const xK = uv;
          (rG[xK(0xe0e)] = rG[xK(0xd10)] = xK(0x423)),
            rG[xK(0x9c0)](-0.15),
            rG[xK(0xa39)](),
            rG[xK(0xb9f)](-0x32, 0x0),
            rG[xK(0xcac)](0x28, 0x0),
            rG[xK(0xb9f)](0xf, 0x0),
            rG[xK(0xcac)](-0x5, 0x19),
            rG[xK(0xb9f)](-0x3, 0x0),
            rG[xK(0xcac)](0xc, -0x14),
            rG[xK(0xb9f)](-0xe, -0x5),
            rG[xK(0xcac)](-0x2e, -0x17),
            (rG[xK(0xade)] = 0x1c),
            (rG[xK(0xc51)] = this[xK(0x9e3)](xK(0x271))),
            rG[xK(0x8e6)](),
            (rG[xK(0xc51)] = this[xK(0x9e3)](xK(0xb6a))),
            (rG[xK(0xade)] -= rH ? 0xf : 0xa),
            rG[xK(0x8e6)]();
        }
        [uv(0x4cf)](rG) {
          const xL = uv;
          rG[xL(0x627)](this[xL(0x3aa)] / 0x64),
            rG[xL(0xa39)](),
            rG[xL(0xce9)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rG[xL(0x6b8)] = this[xL(0x9e3)](xL(0x24c))),
            rG[xL(0xa06)](),
            rG[xL(0x9be)](),
            (rG[xL(0xade)] = this[xL(0xafc)] ? 0x32 : 0x1e),
            (rG[xL(0xc51)] = xL(0x300)),
            rG[xL(0x8e6)]();
          if (!this[xL(0x5f2)]) {
            const rH = new Path2D(),
              rI = this[xL(0xafc)] ? 0x2 : 0x3;
            for (let rJ = 0x0; rJ <= rI; rJ++) {
              for (let rK = 0x0; rK <= rI; rK++) {
                const rL =
                    ((rK / rI + Math[xL(0xbf6)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rJ % 0x2 === 0x0 ? -0x14 : 0x0),
                  rM = ((rJ / rI + Math[xL(0xbf6)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rN = Math[xL(0xbf6)]() * 0xd + (this[xL(0xafc)] ? 0xe : 0x7);
                rH[xL(0xb9f)](rL, rM),
                  rH[xL(0xce9)](rL, rM, rN, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xL(0x5f2)] = rH;
          }
          rG[xL(0xa39)](),
            rG[xL(0xce9)](
              0x0,
              0x0,
              0x64 - rG[xL(0xade)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rG[xL(0x9be)](),
            (rG[xL(0x6b8)] = xL(0xd66)),
            rG[xL(0xa06)](this[xL(0x5f2)]);
        }
        [uv(0x875)](rG) {
          const xM = uv;
          rG[xM(0x627)](this[xM(0x3aa)] / 0x64),
            rG[xM(0x884)](),
            rG[xM(0xe07)](-0xf5, -0xdc),
            (rG[xM(0xc51)] = this[xM(0x9e3)](xM(0x6ce))),
            (rG[xM(0x6b8)] = this[xM(0x9e3)](xM(0xa6d))),
            (rG[xM(0xade)] = 0xf),
            (rG[xM(0xd10)] = rG[xM(0xe0e)] = xM(0x423));
          const rH = !this[xM(0xafc)];
          if (rH) {
            rG[xM(0x884)](),
              rG[xM(0xe07)](0x10e, 0xde),
              rG[xM(0x884)](),
              rG[xM(0x9c0)](-0.1);
            for (let rI = 0x0; rI < 0x3; rI++) {
              rG[xM(0xa39)](),
                rG[xM(0xb9f)](-0x5, 0x0),
                rG[xM(0x78e)](0x0, 0x28, 0x5, 0x0),
                rG[xM(0x8e6)](),
                rG[xM(0xa06)](),
                rG[xM(0xe07)](0x28, 0x0);
            }
            rG[xM(0x915)](), rG[xM(0xe07)](0x17, 0x32), rG[xM(0x9c0)](0.05);
            for (let rJ = 0x0; rJ < 0x2; rJ++) {
              rG[xM(0xa39)](),
                rG[xM(0xb9f)](-0x5, 0x0),
                rG[xM(0x78e)](0x0, -0x28, 0x5, 0x0),
                rG[xM(0x8e6)](),
                rG[xM(0xa06)](),
                rG[xM(0xe07)](0x28, 0x0);
            }
            rG[xM(0x915)]();
          }
          rG[xM(0xa06)](lm),
            rG[xM(0x8e6)](lm),
            rG[xM(0xa06)](ln),
            rG[xM(0x8e6)](ln),
            rG[xM(0x915)](),
            rH &&
              (rG[xM(0xa39)](),
              rG[xM(0xce9)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rG[xM(0xce9)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rG[xM(0x6b8)] = xM(0x300)),
              rG[xM(0xa06)]());
        }
        [uv(0xcb0)](rG) {
          const xN = uv;
          rG[xN(0x627)](this[xN(0x3aa)] / 0x46), rG[xN(0x884)]();
          !this[xN(0xafc)] && rG[xN(0x9c0)](Math["PI"] / 0x2);
          rG[xN(0xe07)](0x0, 0x2d),
            rG[xN(0xa39)](),
            rG[xN(0xb9f)](0x0, -0x64),
            rG[xN(0x443)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rG[xN(0x443)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rG[xN(0xe0e)] = rG[xN(0xd10)] = xN(0x423)),
            (rG[xN(0xade)] = 0x3c),
            (rG[xN(0xc51)] = this[xN(0x9e3)](xN(0x3f3))),
            rG[xN(0x8e6)](),
            (rG[xN(0xade)] -= this[xN(0xafc)] ? 0x23 : 0x14),
            (rG[xN(0x6b8)] = rG[xN(0xc51)] = this[xN(0x9e3)](xN(0x2e1))),
            rG[xN(0x8e6)](),
            (rG[xN(0xade)] -= this[xN(0xafc)] ? 0x16 : 0xf),
            (rG[xN(0x6b8)] = rG[xN(0xc51)] = this[xN(0x9e3)](xN(0xd8f))),
            rG[xN(0x8e6)](),
            rG[xN(0xa06)](),
            rG[xN(0xe07)](0x0, -0x24);
          if (this[xN(0xafc)]) rG[xN(0x627)](0.9);
          rG[xN(0xa39)](),
            rG[xN(0x4a4)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rG[xN(0x6b8)] = this[xN(0x9e3)](xN(0xb2b))),
            rG[xN(0xa06)](),
            rG[xN(0x9be)](),
            (rG[xN(0xade)] = 0xd),
            (rG[xN(0xc51)] = xN(0x300)),
            rG[xN(0x8e6)](),
            rG[xN(0xa39)](),
            rG[xN(0x4a4)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rG[xN(0x6b8)] = xN(0xa93)),
            rG[xN(0xa06)](),
            rG[xN(0x915)]();
        }
        [uv(0xb43)](rG) {
          const xO = uv;
          rG[xO(0x627)](this[xO(0x3aa)] / 0x19);
          !this[xO(0xd2d)] &&
            this[xO(0xafc)] &&
            rG[xO(0x9c0)](Math[xO(0x88e)](pP / 0x64 + this["id"]) * 0.15);
          rG[xO(0xa39)](),
            rG[xO(0xb68)](-0x16, -0x16, 0x2c, 0x2c),
            (rG[xO(0x6b8)] = this[xO(0x9e3)](xO(0xdbd))),
            rG[xO(0xa06)](),
            (rG[xO(0xade)] = 0x6),
            (rG[xO(0xd10)] = xO(0x423)),
            (rG[xO(0xc51)] = this[xO(0x9e3)](xO(0xa6d))),
            rG[xO(0x8e6)](),
            rG[xO(0xa39)]();
          const rH = this[xO(0xd2d)] ? 0x1 : 0x1 - Math[xO(0x88e)](pP / 0x1f4),
            rI = rM(0x0, 0.25),
            rJ = 0x1 - rM(0.25, 0.25),
            rK = rM(0.5, 0.25),
            rL = rM(0.75, 0.25);
          function rM(rN, rO) {
            const xP = xO;
            return Math[xP(0x77f)](0x1, Math[xP(0xb8e)](0x0, (rH - rN) / rO));
          }
          rG[xO(0x9c0)]((rJ * Math["PI"]) / 0x4);
          for (let rN = 0x0; rN < 0x2; rN++) {
            const rO = (rN * 0x2 - 0x1) * 0x7 * rL;
            for (let rP = 0x0; rP < 0x3; rP++) {
              let rQ = rI * (-0xb + rP * 0xb);
              rG[xO(0xb9f)](rQ, rO),
                rG[xO(0xce9)](rQ, rO, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rG[xO(0x6b8)] = this[xO(0x9e3)](xO(0x451))), rG[xO(0xa06)]();
        }
        [uv(0x93f)](rG) {
          const xQ = uv;
          rG[xQ(0x884)](),
            rG[xQ(0xe07)](this["x"], this["y"]),
            this[xQ(0x7cb)](rG),
            rG[xQ(0x9c0)](this[xQ(0x582)]),
            (rG[xQ(0xade)] = 0x8);
          const rH = (rM, rN) => {
              const xR = xQ;
              (rJ = this[xR(0x3aa)] / 0x14),
                rG[xR(0x28b)](rJ, rJ),
                rG[xR(0xa39)](),
                rG[xR(0xce9)](0x0, 0x0, 0x14, 0x0, l0),
                (rG[xR(0x6b8)] = this[xR(0x9e3)](rM)),
                rG[xR(0xa06)](),
                (rG[xR(0xc51)] = this[xR(0x9e3)](rN)),
                rG[xR(0x8e6)]();
            },
            rI = (rM, rN, rO) => {
              const xS = xQ;
              (rM = l8[rM]),
                rG[xS(0x28b)](this[xS(0x3aa)], this[xS(0x3aa)]),
                (rG[xS(0xade)] /= this[xS(0x3aa)]),
                (rG[xS(0xc51)] = this[xS(0x9e3)](rO)),
                rG[xS(0x8e6)](rM),
                (rG[xS(0x6b8)] = this[xS(0x9e3)](rN)),
                rG[xS(0xa06)](rM);
            };
          let rJ, rK, rL;
          switch (this[xQ(0x8fa)]) {
            case cS[xQ(0xb43)]:
            case cS[xQ(0x635)]:
              this[xQ(0xb43)](rG);
              break;
            case cS[xQ(0xcb0)]:
            case cS[xQ(0x848)]:
              this[xQ(0xcb0)](rG);
              break;
            case cS[xQ(0x402)]:
              (rG[xQ(0xc51)] = xQ(0x300)),
                (rG[xQ(0xade)] = 0x14),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x654))),
                rG[xQ(0xe07)](-this[xQ(0x3aa)], 0x0),
                rG[xQ(0x9c0)](-Math["PI"] / 0x2),
                rG[xQ(0x627)](0.5),
                rG[xQ(0xe07)](0x0, 0x46),
                this[xQ(0x834)](rG, this[xQ(0x3aa)] * 0x4);
              break;
            case cS[xQ(0x6fd)]:
              this[xQ(0x6fd)](rG);
              break;
            case cS[xQ(0xb45)]:
              this[xQ(0x875)](rG);
              break;
            case cS[xQ(0x875)]:
              this[xQ(0x875)](rG);
              break;
            case cS[xQ(0x4cf)]:
            case cS[xQ(0x364)]:
              this[xQ(0x4cf)](rG);
              break;
            case cS[xQ(0x1cc)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x1e), this[xQ(0x847)](rG, !![]);
              break;
            case cS[xQ(0x5c9)]:
              this[xQ(0x5c9)](rG);
              break;
            case cS[xQ(0xd90)]:
              (rG[xQ(0xade)] *= 0.7),
                rI(xQ(0x2bc), xQ(0xd15), xQ(0x32f)),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0.6, 0x0, l0),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x740))),
                rG[xQ(0xa06)](),
                rG[xQ(0x9be)](),
                (rG[xQ(0xc51)] = xQ(0x983)),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x75f)]:
              this[xQ(0x75f)](rG);
              break;
            case cS[xQ(0xdef)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x16),
                rG[xQ(0x9c0)](Math["PI"] / 0x2),
                rG[xQ(0xa39)]();
              for (let sy = 0x0; sy < 0x2; sy++) {
                rG[xQ(0xb9f)](-0xa, -0x1e),
                  rG[xQ(0x443)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rG[xQ(0x28b)](0x1, -0x1);
              }
              (rG[xQ(0xade)] = 0x10),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x826))),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xade)] -= 0x7),
                (rG[xQ(0xc51)] = xQ(0x6b5)),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x28c)]:
              this[xQ(0x553)](rG);
              break;
            case cS[xQ(0x3dc)]:
              this[xQ(0xbbd)](rG);
              break;
            case cS[xQ(0x8f1)]:
              this[xQ(0x8f1)](rG);
              break;
            case cS[xQ(0x9bf)]:
              this[xQ(0x9bf)](rG);
              break;
            case cS[xQ(0xd54)]:
              !this[xQ(0x498)] &&
                ((this[xQ(0x498)] = new lT(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cY[xQ(0xdf2)],
                  0x19
                )),
                (this[xQ(0x498)][xQ(0xc52)] = !![]),
                (this[xQ(0x498)][xQ(0x870)] = !![]),
                (this[xQ(0x498)][xQ(0x4fb)] = 0x1),
                (this[xQ(0x498)][xQ(0xd77)] = !![]),
                (this[xQ(0x498)][xQ(0xa32)] = xQ(0xd83)),
                (this[xQ(0x498)][xQ(0x6b2)] = this[xQ(0x6b2)]));
              rG[xQ(0x9c0)](Math["PI"] / 0x2),
                (this[xQ(0x498)][xQ(0x34a)] = this[xQ(0x34a)]),
                (this[xQ(0x498)][xQ(0x3aa)] = this[xQ(0x3aa)]),
                this[xQ(0x498)][xQ(0x93f)](rG);
              break;
            case cS[xQ(0x907)]:
              this[xQ(0x907)](rG);
              break;
            case cS[xQ(0xd60)]:
              rG[xQ(0x884)](),
                rG[xQ(0x627)](this[xQ(0x3aa)] / 0x64),
                rG[xQ(0x9c0)]((Date[xQ(0xd3f)]() / 0x190) % 6.28),
                this[xQ(0x946)](rG, 1.5),
                rG[xQ(0x915)]();
              break;
            case cS[xQ(0x2ad)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x14),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x0, -0x5),
                rG[xQ(0xcac)](-0x8, 0x0),
                rG[xQ(0xcac)](0x0, 0x5),
                rG[xQ(0xcac)](0x8, 0x0),
                rG[xQ(0x765)](),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x20),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x7fe))),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xade)] = 0x14),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x542))),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0xbc1)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x14),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x5, -0x5),
                rG[xQ(0xcac)](-0x5, 0x5),
                rG[xQ(0xcac)](0x5, 0x0),
                rG[xQ(0x765)](),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x20),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x638))),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xade)] = 0x14),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x5b4))),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x4a2)]:
              this[xQ(0xca5)](rG, xQ(0x367));
              break;
            case cS[xQ(0x382)]:
              this[xQ(0xca5)](rG, xQ(0x17a));
              break;
            case cS[xQ(0x202)]:
              this[xQ(0xca5)](rG, xQ(0xd74));
              break;
            case cS[xQ(0x4af)]:
              this[xQ(0x4af)](rG);
              break;
            case cS[xQ(0x748)]:
              this[xQ(0x748)](rG);
              break;
            case cS[xQ(0x895)]:
              this[xQ(0x895)](rG);
              break;
            case cS[xQ(0x9ee)]:
              this[xQ(0x895)](rG, !![]);
              break;
            case cS[xQ(0x613)]:
              this[xQ(0x613)](rG);
              break;
            case cS[xQ(0x29f)]:
              this[xQ(0x29f)](rG);
              break;
            case cS[xQ(0x5a9)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x19),
                lE(rG, 0x19),
                (rG[xQ(0xd10)] = xQ(0x423)),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x3d1))),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x7a4))),
                rG[xQ(0xa06)](),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x82d)]:
              rG[xQ(0xe07)](-this[xQ(0x3aa)], 0x0);
              const rM = Date[xQ(0xd3f)]() / 0x32,
                rN = this[xQ(0x3aa)] * 0x2;
              rG[xQ(0xa39)]();
              const rO = 0x32;
              for (let sz = 0x0; sz < rO; sz++) {
                const sA = sz / rO,
                  sB = sA * Math["PI"] * (this[xQ(0xd2d)] ? 7.75 : 0xa) - rM,
                  sC = sA * rN,
                  sD = sC * this[xQ(0x317)];
                rG[xQ(0xcac)](sC, Math[xQ(0x88e)](sB) * sD);
              }
              (rG[xQ(0xc51)] = xQ(0x46d)),
                (rG[xQ(0xd10)] = rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x4),
                (rG[xQ(0xbd2)] = xQ(0x647)),
                (rG[xQ(0x1c5)] = this[xQ(0xd2d)] ? 0xa : 0x14),
                rG[xQ(0x8e6)](),
                rG[xQ(0x8e6)](),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x6d4)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x37), this[xQ(0x2c6)](rG);
              break;
            case cS[xQ(0x43d)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x14), rG[xQ(0xa39)]();
              for (let sE = 0x0; sE < 0x2; sE++) {
                rG[xQ(0xb9f)](-0x17, -0x5),
                  rG[xQ(0x78e)](0x0, 5.5, 0x17, -0x5),
                  rG[xQ(0x28b)](0x1, -0x1);
              }
              (rG[xQ(0xade)] = 0xf),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xa6d))),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xade)] -= 0x6),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xdbd))),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x6d6)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x23),
                rG[xQ(0xa39)](),
                rG[xQ(0x4a4)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x27f))),
                rG[xQ(0xa06)](),
                rG[xQ(0x9be)](),
                (rG[xQ(0xc51)] = xQ(0x3b2)),
                (rG[xQ(0xade)] = 0x12),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x1e, 0x0),
                rG[xQ(0x443)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rG[xQ(0x443)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rG[xQ(0xade)] = 0x3),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                (rG[xQ(0xc51)] = rG[xQ(0x6b8)] = xQ(0x3d9)),
                rG[xQ(0xa06)](),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x493)]:
              if (this[xQ(0x2d8)] !== this[xQ(0xc04)]) {
                this[xQ(0x2d8)] = this[xQ(0xc04)];
                const sF = new Path2D(),
                  sG = Math[xQ(0x423)](
                    this[xQ(0xc04)] * (this[xQ(0xc04)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sH = (Math["PI"] * 0x2) / sG,
                  sI = this[xQ(0xc04)] < 0x64 ? 0.3 : 0.1;
                for (let sJ = 0x0; sJ < sG; sJ++) {
                  const sK = sJ * sH,
                    sL = sK + Math[xQ(0xbf6)]() * sH,
                    sM = 0x1 - Math[xQ(0xbf6)]() * sI;
                  sF[xQ(0xcac)](
                    Math[xQ(0xe44)](sL) * this[xQ(0xc04)] * sM,
                    Math[xQ(0x88e)](sL) * this[xQ(0xc04)] * sM
                  );
                }
                sF[xQ(0x765)](), (this[xQ(0xaa7)] = sF);
              }
              (rJ = this[xQ(0x3aa)] / this[xQ(0xc04)]), rG[xQ(0x28b)](rJ, rJ);
              const rP = this[xQ(0x50e)] ? lh : [xQ(0xe67), xQ(0xe40)];
              (rG[xQ(0xc51)] = this[xQ(0x9e3)](rP[0x1])),
                rG[xQ(0x8e6)](this[xQ(0xaa7)]),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](rP[0x0])),
                rG[xQ(0xa06)](this[xQ(0xaa7)]);
              break;
            case cS[xQ(0x7e6)]:
              if (this[xQ(0x2d8)] !== this[xQ(0xc04)]) {
                this[xQ(0x2d8)] = this[xQ(0xc04)];
                const sN = Math[xQ(0x423)](
                    this[xQ(0xc04)] > 0xc8
                      ? this[xQ(0xc04)] * 0.18
                      : this[xQ(0xc04)] * 0.25
                  ),
                  sO = 0.5,
                  sP = 0.85;
                this[xQ(0xaa7)] = la(sN, this[xQ(0xc04)], sO, sP);
                if (this[xQ(0xc04)] < 0x12c) {
                  const sQ = new Path2D(),
                    sR = sN * 0x2;
                  for (let sS = 0x0; sS < sR; sS++) {
                    const sT = ((sS + 0x1) / sR) * Math["PI"] * 0x2;
                    let sU = (sS % 0x2 === 0x0 ? 0.7 : 1.2) * this[xQ(0xc04)];
                    sQ[xQ(0xcac)](
                      Math[xQ(0xe44)](sT) * sU,
                      Math[xQ(0x88e)](sT) * sU
                    );
                  }
                  sQ[xQ(0x765)](), (this[xQ(0x169)] = sQ);
                } else this[xQ(0x169)] = null;
              }
              (rJ = this[xQ(0x3aa)] / this[xQ(0xc04)]), rG[xQ(0x28b)](rJ, rJ);
              this[xQ(0x169)] &&
                ((rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x16c))),
                rG[xQ(0xa06)](this[xQ(0x169)]));
              (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x8d2))),
                rG[xQ(0x8e6)](this[xQ(0xaa7)]),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0xde9))),
                rG[xQ(0xa06)](this[xQ(0xaa7)]);
              break;
            case cS[xQ(0xac7)]:
              rG[xQ(0x884)](),
                (rJ = this[xQ(0x3aa)] / 0x28),
                rG[xQ(0x28b)](rJ, rJ),
                (rG[xQ(0x6b8)] = rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423));
              for (let sV = 0x0; sV < 0x2; sV++) {
                const sW = sV === 0x0 ? 0x1 : -0x1;
                rG[xQ(0x884)](),
                  rG[xQ(0xe07)](0x1c, sW * 0xd),
                  rG[xQ(0x9c0)](
                    Math[xQ(0x88e)](this[xQ(0xb98)] * 1.24) * 0.1 * sW
                  ),
                  rG[xQ(0xa39)](),
                  rG[xQ(0xb9f)](0x0, sW * 0x6),
                  rG[xQ(0xcac)](0x14, sW * 0xb),
                  rG[xQ(0xcac)](0x28, 0x0),
                  rG[xQ(0x78e)](0x14, sW * 0x5, 0x0, 0x0),
                  rG[xQ(0x765)](),
                  rG[xQ(0xa06)](),
                  rG[xQ(0x8e6)](),
                  rG[xQ(0x915)]();
              }
              (rK = this[xQ(0x50e)] ? lh : [xQ(0x41f), xQ(0x1e7)]),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](rK[0x0])),
                rG[xQ(0xa06)](l5),
                (rG[xQ(0xade)] = 0x6),
                (rG[xQ(0x6b8)] = rG[xQ(0xc51)] = this[xQ(0x9e3)](rK[0x1])),
                rG[xQ(0x8e6)](l5),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x15, 0x0),
                rG[xQ(0x78e)](0x0, -0x3, 0x15, 0x0),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x7),
                rG[xQ(0x8e6)]();
              const rQ = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rG[xQ(0xa39)]();
              for (let sX = 0x0; sX < 0x2; sX++) {
                const sY = sX === 0x1 ? 0x1 : -0x1;
                for (let sZ = 0x0; sZ < rQ[xQ(0xd55)]; sZ++) {
                  let [t0, t1] = rQ[sZ];
                  (t1 *= sY),
                    rG[xQ(0xb9f)](t0, t1),
                    rG[xQ(0xce9)](t0, t1, 0x5, 0x0, l0);
                }
              }
              rG[xQ(0xa06)](), rG[xQ(0xa06)](), rG[xQ(0x915)]();
              break;
            case cS[xQ(0xc2e)]:
            case cS[xQ(0x5c5)]:
              rG[xQ(0x884)](),
                (rJ = this[xQ(0x3aa)] / 0x28),
                rG[xQ(0x28b)](rJ, rJ);
              const rR = this[xQ(0x8fa)] === cS[xQ(0xc2e)];
              rR &&
                (rG[xQ(0x884)](),
                rG[xQ(0xe07)](-0x2d, 0x0),
                rG[xQ(0x9c0)](Math["PI"]),
                this[xQ(0xa15)](rG, 0xf / 1.1),
                rG[xQ(0x915)]());
              (rK = this[xQ(0x50e)]
                ? lh
                : rR
                ? [xQ(0xe3c), xQ(0xacc)]
                : [xQ(0xc4d), xQ(0x916)]),
                rG[xQ(0xa39)](),
                rG[xQ(0x4a4)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, l0),
                (rG[xQ(0xade)] = 0xa),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](rK[0x1])),
                rG[xQ(0x8e6)](),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](rK[0x0])),
                rG[xQ(0xa06)](),
                rG[xQ(0x884)](),
                rG[xQ(0x9be)](),
                rG[xQ(0xa39)]();
              const rS = [-0x1e, -0x5, 0x16];
              for (let t2 = 0x0; t2 < rS[xQ(0xd55)]; t2++) {
                const t3 = rS[t2];
                rG[xQ(0xb9f)](t3, -0x32),
                  rG[xQ(0x78e)](t3 - 0x14, 0x0, t3, 0x32);
              }
              (rG[xQ(0xade)] = 0xe),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                rG[xQ(0x8e6)](),
                rG[xQ(0x915)]();
              rR ? this[xQ(0xcb1)](rG) : this[xQ(0x56f)](rG);
              rG[xQ(0x915)]();
              break;
            case cS[xQ(0xc80)]:
              (rJ = this[xQ(0x3aa)] / 0x32), rG[xQ(0x28b)](rJ, rJ);
              const rT = 0x2f;
              rG[xQ(0xa39)]();
              for (let t4 = 0x0; t4 < 0x8; t4++) {
                let t5 =
                  (0.25 + ((t4 % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xQ(0x88e)](t4 + this[xQ(0xb98)] * 1.3) * 0.2;
                t4 >= 0x4 && (t5 *= -0x1),
                  rG[xQ(0xb9f)](0x0, 0x0),
                  rG[xQ(0xcac)](
                    Math[xQ(0xe44)](t5) * rT,
                    Math[xQ(0x88e)](t5) * rT
                  );
              }
              (rG[xQ(0xade)] = 0x7),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                rG[xQ(0x8e6)](),
                (rG[xQ(0x6b8)] = rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x6);
              for (let t6 = 0x0; t6 < 0x2; t6++) {
                const t7 = t6 === 0x0 ? 0x1 : -0x1;
                rG[xQ(0x884)](),
                  rG[xQ(0xe07)](0x16, t7 * 0xa),
                  rG[xQ(0x9c0)](
                    -(Math[xQ(0x88e)](this[xQ(0xb98)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      t7
                  ),
                  rG[xQ(0xa39)](),
                  rG[xQ(0xb9f)](0x0, t7 * 0x6),
                  rG[xQ(0x78e)](0x14, t7 * 0xf, 0x28, 0x0),
                  rG[xQ(0x78e)](0x14, t7 * 0x5, 0x0, 0x0),
                  rG[xQ(0x765)](),
                  rG[xQ(0xa06)](),
                  rG[xQ(0x8e6)](),
                  rG[xQ(0x915)]();
              }
              (rG[xQ(0xade)] = 0x8),
                l9(
                  rG,
                  0x1,
                  0x8,
                  this[xQ(0x9e3)](xQ(0xe74)),
                  this[xQ(0x9e3)](xQ(0x863))
                );
              let rU;
              (rU = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rG[xQ(0xa39)]();
              for (let t8 = 0x0; t8 < rU[xQ(0xd55)]; t8++) {
                const [t9, ta] = rU[t8];
                rG[xQ(0xb9f)](t9, -ta),
                  rG[xQ(0x78e)](t9 + Math[xQ(0x9f3)](t9) * 4.2, 0x0, t9, ta);
              }
              (rG[xQ(0xe0e)] = xQ(0x423)),
                rG[xQ(0x8e6)](),
                rG[xQ(0xe07)](-0x21, 0x0),
                l9(
                  rG,
                  0.45,
                  0x8,
                  this[xQ(0x9e3)](xQ(0xd6b)),
                  this[xQ(0x9e3)](xQ(0x42c))
                ),
                rG[xQ(0xa39)](),
                (rU = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let tb = 0x0; tb < rU[xQ(0xd55)]; tb++) {
                const [tc, td] = rU[tb];
                rG[xQ(0xb9f)](tc, -td), rG[xQ(0x78e)](tc - 0x3, 0x0, tc, td);
              }
              (rG[xQ(0xade)] = 0x5),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                rG[xQ(0x8e6)](),
                rG[xQ(0xe07)](0x11, 0x0),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x0, -0x9),
                rG[xQ(0xcac)](0x0, 0x9),
                rG[xQ(0xcac)](0xb, 0x0),
                rG[xQ(0x765)](),
                (rG[xQ(0xd10)] = rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x6),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x4dc))),
                rG[xQ(0xa06)](),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x8e9)]:
              this[xQ(0xdd1)](rG, xQ(0x6cd), xQ(0xd14), xQ(0x507));
              break;
            case cS[xQ(0x909)]:
              this[xQ(0xdd1)](rG, xQ(0x2e9), xQ(0x683), xQ(0x49c));
              break;
            case cS[xQ(0xe57)]:
              this[xQ(0xdd1)](rG, xQ(0x242), xQ(0x42e), xQ(0x507));
              break;
            case cS[xQ(0x63b)]:
              (rJ = this[xQ(0x3aa)] / 0x46),
                rG[xQ(0x627)](rJ),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x11b))),
                rG[xQ(0xa06)](lc),
                rG[xQ(0x9be)](lc),
                (rG[xQ(0xade)] = 0xf),
                (rG[xQ(0xc51)] = xQ(0xe26)),
                rG[xQ(0x8e6)](lc),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x7),
                (rG[xQ(0xc51)] = xQ(0x841)),
                rG[xQ(0x8e6)](ld);
              break;
            case cS[xQ(0x785)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x28),
                this[xQ(0x4fd)](rG, 0x32, 0x1e, 0x7);
              break;
            case cS[xQ(0x429)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x64),
                this[xQ(0x4fd)](rG),
                (rG[xQ(0x6b8)] = rG[xQ(0xc51)]);
              const rV = 0x6,
                rW = 0x3;
              rG[xQ(0xa39)]();
              for (let te = 0x0; te < rV; te++) {
                const tf = (te / rV) * Math["PI"] * 0x2;
                rG[xQ(0x884)](), rG[xQ(0x9c0)](tf);
                for (let tg = 0x0; tg < rW; tg++) {
                  const th = tg / rW,
                    ti = 0x12 + th * 0x44,
                    tj = 0x7 + th * 0x6;
                  rG[xQ(0xb9f)](ti, 0x0),
                    rG[xQ(0xce9)](ti, 0x0, tj, 0x0, Math["PI"] * 0x2);
                }
                rG[xQ(0x915)]();
              }
              rG[xQ(0xa06)]();
              break;
            case cS[xQ(0xddc)]:
              (rJ = this[xQ(0x3aa)] / 0x31),
                rG[xQ(0x627)](rJ),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                (rL = this[xQ(0xb98)] * 0x15e);
              const rX = (Math[xQ(0x88e)](rL * 0.01) * 0.5 + 0.5) * 0.1;
              (rG[xQ(0xc51)] = rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x16c))),
                (rG[xQ(0xade)] = 0x3);
              for (let tk = 0x0; tk < 0x2; tk++) {
                rG[xQ(0x884)]();
                const tl = tk * 0x2 - 0x1;
                rG[xQ(0x28b)](0x1, tl),
                  rG[xQ(0xe07)](0x1c, -0x27),
                  rG[xQ(0x28b)](1.5, 1.5),
                  rG[xQ(0x9c0)](rX),
                  rG[xQ(0xa39)](),
                  rG[xQ(0xb9f)](0x0, 0x0),
                  rG[xQ(0x78e)](0xc, -0x8, 0x14, 0x3),
                  rG[xQ(0xcac)](0xb, 0x1),
                  rG[xQ(0xcac)](0x11, 0x9),
                  rG[xQ(0x78e)](0xc, 0x5, 0x0, 0x6),
                  rG[xQ(0x765)](),
                  rG[xQ(0x8e6)](),
                  rG[xQ(0xa06)](),
                  rG[xQ(0x915)]();
              }
              rG[xQ(0xa39)]();
              for (let tm = 0x0; tm < 0x2; tm++) {
                for (let tn = 0x0; tn < 0x4; tn++) {
                  const to = tm * 0x2 - 0x1,
                    tp =
                      (Math[xQ(0x88e)](rL * 0.005 + tm + tn * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rG[xQ(0x884)](),
                    rG[xQ(0x28b)](0x1, to),
                    rG[xQ(0xe07)]((tn / 0x3) * 0x1e - 0xf, 0x28);
                  const tq = tn < 0x2 ? 0x1 : -0x1;
                  rG[xQ(0x9c0)](tp * tq),
                    rG[xQ(0xb9f)](0x0, 0x0),
                    rG[xQ(0xe07)](0x0, 0x19),
                    rG[xQ(0xcac)](0x0, 0x0),
                    rG[xQ(0x9c0)](tq * 0.7 * (tp + 0.3)),
                    rG[xQ(0xcac)](0x0, 0xa),
                    rG[xQ(0x915)]();
                }
              }
              (rG[xQ(0xade)] = 0xa),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x2, 0x17),
                rG[xQ(0x78e)](0x17, 0x0, 0x2, -0x17),
                rG[xQ(0xcac)](-0xa, -0xf),
                rG[xQ(0xcac)](-0xa, 0xf),
                rG[xQ(0x765)](),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x136))),
                (rG[xQ(0xade)] = 0x44),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xade)] -= 0x12),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xba8))),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xc51)] = xQ(0x300)),
                rG[xQ(0xa39)]();
              const rY = 0x12;
              for (let tr = 0x0; tr < 0x2; tr++) {
                rG[xQ(0xb9f)](-0x12, rY),
                  rG[xQ(0x78e)](0x0, -0x7 + rY, 0x12, rY),
                  rG[xQ(0x28b)](0x1, -0x1);
              }
              (rG[xQ(0xade)] = 0x9), rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x99c)]:
              (rJ = this[xQ(0x3aa)] / 0x50),
                rG[xQ(0x627)](rJ),
                rG[xQ(0x9c0)](
                  ((Date[xQ(0xd3f)]() / 0x7d0) % l0) + this[xQ(0xb98)] * 0.4
                );
              const rZ = 0x5;
              !this[xQ(0xa1e)] &&
                (this[xQ(0xa1e)] = Array(rZ)[xQ(0xa06)](0x64));
              const s0 = this[xQ(0xa1e)],
                s1 = this[xQ(0xc52)]
                  ? 0x0
                  : Math[xQ(0xc8c)](this[xQ(0x60c)] * (rZ - 0x1));
              rG[xQ(0xa39)]();
              for (let ts = 0x0; ts < rZ; ts++) {
                const tu = ((ts + 0.5) / rZ) * Math["PI"] * 0x2,
                  tv = ((ts + 0x1) / rZ) * Math["PI"] * 0x2;
                s0[ts] += ((ts < s1 ? 0x64 : 0x3c) - s0[ts]) * 0.2;
                const tw = s0[ts];
                if (ts === 0x0) rG[xQ(0xb9f)](tw, 0x0);
                rG[xQ(0x78e)](
                  Math[xQ(0xe44)](tu) * 0x5,
                  Math[xQ(0x88e)](tu) * 0x5,
                  Math[xQ(0xe44)](tv) * tw,
                  Math[xQ(0x88e)](tv) * tw
                );
              }
              rG[xQ(0x765)](),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x1c + 0xa),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x396))),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xade)] = 0x10 + 0xa),
                (rG[xQ(0xc51)] = rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x1b5))),
                rG[xQ(0xa06)](),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)]();
              for (let tx = 0x0; tx < rZ; tx++) {
                const ty = (tx / rZ) * Math["PI"] * 0x2;
                rG[xQ(0x884)](), rG[xQ(0x9c0)](ty);
                const tz = s0[tx] / 0x64;
                let tA = 0x1a;
                const tB = 0x4;
                for (let tC = 0x0; tC < tB; tC++) {
                  const tD = (0x1 - (tC / tB) * 0.7) * 0xc * tz;
                  rG[xQ(0xb9f)](tA, 0x0),
                    rG[xQ(0xce9)](tA, 0x0, tD, 0x0, Math["PI"] * 0x2),
                    (tA += tD * 0x2 + 3.5 * tz);
                }
                rG[xQ(0x915)]();
              }
              (rG[xQ(0x6b8)] = xQ(0x661)), rG[xQ(0xa06)]();
              break;
            case cS[xQ(0x93a)]:
              (rJ = this[xQ(0x3aa)] / 0x1e),
                rG[xQ(0x627)](rJ),
                rG[xQ(0xe07)](-0x22, 0x0),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x0, -0x8),
                rG[xQ(0x78e)](0x9b, 0x0, 0x0, 0x8),
                rG[xQ(0x765)](),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x1a),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x396))),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xade)] = 0x10),
                (rG[xQ(0xc51)] = rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x1b5))),
                rG[xQ(0xa06)](),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)]();
              let s3 = 0xd;
              for (let tE = 0x0; tE < 0x4; tE++) {
                const tF = (0x1 - (tE / 0x4) * 0.7) * 0xa;
                rG[xQ(0xb9f)](s3, 0x0),
                  rG[xQ(0xce9)](s3, 0x0, tF, 0x0, Math["PI"] * 0x2),
                  (s3 += tF * 0x2 + 0x4);
              }
              (rG[xQ(0x6b8)] = xQ(0x661)), rG[xQ(0xa06)]();
              break;
            case cS[xQ(0x8d7)]:
              (rJ = this[xQ(0x3aa)] / 0x64),
                rG[xQ(0x28b)](rJ, rJ),
                (rG[xQ(0xd10)] = rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xc51)] = xQ(0x1f0)),
                (rG[xQ(0xade)] = 0x14);
              const s4 = [0x1, 0.63, 0.28],
                s5 = this[xQ(0x50e)] ? lo : [xQ(0x261), xQ(0x969), xQ(0xae2)],
                s6 = (pP * 0.005) % l0;
              for (let tG = 0x0; tG < 0x3; tG++) {
                const tH = s4[tG],
                  tI = s5[tG];
                rG[xQ(0x884)](),
                  rG[xQ(0x9c0)](s6 * (tG % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rG[xQ(0xa39)]();
                const tJ = 0x7 - tG;
                for (let tK = 0x0; tK < tJ; tK++) {
                  const tL = (Math["PI"] * 0x2 * tK) / tJ;
                  rG[xQ(0xcac)](
                    Math[xQ(0xe44)](tL) * tH * 0x64,
                    Math[xQ(0x88e)](tL) * tH * 0x64
                  );
                }
                rG[xQ(0x765)](),
                  (rG[xQ(0xc51)] = rG[xQ(0x6b8)] = this[xQ(0x9e3)](tI)),
                  rG[xQ(0xa06)](),
                  rG[xQ(0x8e6)](),
                  rG[xQ(0x915)]();
              }
              break;
            case cS[xQ(0x280)]:
              (rJ = this[xQ(0x3aa)] / 0x41),
                rG[xQ(0x28b)](rJ, rJ),
                (rL = this[xQ(0xb98)] * 0x2),
                rG[xQ(0x9c0)](Math["PI"] / 0x2);
              if (this[xQ(0xd09)]) {
                const tM = 0x3;
                rG[xQ(0xa39)]();
                for (let tQ = 0x0; tQ < 0x2; tQ++) {
                  for (let tR = 0x0; tR <= tM; tR++) {
                    const tS = (tR / tM) * 0x50 - 0x28;
                    rG[xQ(0x884)]();
                    const tT = tQ * 0x2 - 0x1;
                    rG[xQ(0xe07)](tT * -0x2d, tS);
                    const tU =
                      1.1 + Math[xQ(0x88e)]((tR / tM) * Math["PI"]) * 0.5;
                    rG[xQ(0x28b)](tU * tT, tU),
                      rG[xQ(0x9c0)](Math[xQ(0x88e)](rL + tR + tT) * 0.3 + 0.3),
                      rG[xQ(0xb9f)](0x0, 0x0),
                      rG[xQ(0x78e)](-0xf, -0x5, -0x14, 0xa),
                      rG[xQ(0x915)]();
                  }
                }
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                  (rG[xQ(0xade)] = 0x8),
                  (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                  rG[xQ(0x8e6)](),
                  (rG[xQ(0xade)] = 0xc);
                const tN = Date[xQ(0xd3f)]() * 0.01,
                  tO = Math[xQ(0x88e)](tN * 0.5) * 0.5 + 0.5,
                  tP = tO * 0.1 + 0x1;
                rG[xQ(0xa39)](),
                  rG[xQ(0xce9)](-0xf * tP, 0x2b - tO, 0x10, 0x0, Math["PI"]),
                  rG[xQ(0xce9)](0xf * tP, 0x2b - tO, 0x10, 0x0, Math["PI"]),
                  rG[xQ(0xb9f)](-0x16, -0x2b),
                  rG[xQ(0xce9)](0x0, -0x2b - tO, 0x16, 0x0, Math["PI"], !![]),
                  (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x8ca))),
                  rG[xQ(0x8e6)](),
                  (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x41f))),
                  rG[xQ(0xa06)](),
                  rG[xQ(0x884)](),
                  rG[xQ(0x9c0)]((Math["PI"] * 0x3) / 0x2),
                  this[xQ(0x56f)](rG, 0x1a - tO, 0x0),
                  rG[xQ(0x915)]();
              }
              if (!this[xQ(0xaf0)]) {
                const tV = dI[d9[xQ(0xadc)]],
                  tW = Math[xQ(0xb8e)](this["id"] % tV[xQ(0xd55)], 0x0),
                  tX = new lN(-0x1, 0x0, 0x0, tV[tW]["id"]);
                (tX[xQ(0x363)] = 0x1),
                  (tX[xQ(0x582)] = 0x0),
                  (this[xQ(0xaf0)] = tX);
              }
              rG[xQ(0x627)](1.3), this[xQ(0xaf0)][xQ(0x93f)](rG);
              break;
            case cS[xQ(0x4ac)]:
              (rJ = this[xQ(0x3aa)] / 0x14),
                rG[xQ(0x28b)](rJ, rJ),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x11, 0x0),
                rG[xQ(0xcac)](0x0, 0x0),
                rG[xQ(0xcac)](0x11, 0x6),
                rG[xQ(0xb9f)](0x0, 0x0),
                rG[xQ(0xcac)](0xb, -0x7),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x3ae))),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0xc),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xa76))),
                (rG[xQ(0xade)] = 0x6),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x405)]:
              (rJ = this[xQ(0x3aa)] / 0x80),
                rG[xQ(0x627)](rJ),
                rG[xQ(0xe07)](-0x80, -0x78),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x9c5))),
                rG[xQ(0xa06)](f9[xQ(0xb03)]),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x24a))),
                (rG[xQ(0xade)] = 0x14),
                rG[xQ(0x8e6)](f9[xQ(0xb03)]);
              break;
            case cS[xQ(0xb00)]:
              (rJ = this[xQ(0x3aa)] / 0x19),
                rG[xQ(0x28b)](rJ, rJ),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x19, 0x0),
                rG[xQ(0xcac)](-0x2d, 0x0),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x14),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0xdbd))),
                rG[xQ(0xa06)](),
                (rG[xQ(0xade)] = 0x7),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x8d0))),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x7f2)]:
              rG[xQ(0x9c0)](-this[xQ(0x582)]),
                rG[xQ(0x627)](this[xQ(0x3aa)] / 0x14),
                this[xQ(0xc59)](rG),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0xdbd))),
                rG[xQ(0xa06)](),
                rG[xQ(0x9be)](),
                (rG[xQ(0xade)] = 0xc),
                (rG[xQ(0xc51)] = xQ(0x300)),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x697)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x64), this[xQ(0xd27)](rG);
              break;
            case cS[xQ(0xa28)]:
              this[xQ(0x224)](rG, !![]);
              break;
            case cS[xQ(0x802)]:
              this[xQ(0x224)](rG, ![]);
              break;
            case cS[xQ(0x1bb)]:
              (rJ = this[xQ(0x3aa)] / 0xa),
                rG[xQ(0x627)](rJ),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x0, 0x8),
                rG[xQ(0x78e)](2.5, 0x0, 0x0, -0x8),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0xa),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x8d0))),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xdbd))),
                (rG[xQ(0xade)] = 0x6),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x379)]:
              (rJ = this[xQ(0x3aa)] / 0xa),
                rG[xQ(0x627)](rJ),
                rG[xQ(0xe07)](0x7, 0x0),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x5, -0x5),
                rG[xQ(0x443)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rG[xQ(0x443)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x16c))),
                rG[xQ(0xa06)](),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xd0a))),
                (rG[xQ(0xade)] = 0x3),
                (rG[xQ(0xd10)] = xQ(0x423)),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0xa08)]:
              (rJ = this[xQ(0x3aa)] / 0x32), rG[xQ(0x627)](rJ), rG[xQ(0xa39)]();
              for (let tY = 0x0; tY < 0x9; tY++) {
                const tZ = (tY / 0x9) * Math["PI"] * 0x2,
                  u0 =
                    0x3c *
                    (0x1 +
                      Math[xQ(0xe44)]((tY / 0x9) * Math["PI"] * 3.5) * 0.07);
                rG[xQ(0xb9f)](0x0, 0x0),
                  rG[xQ(0xcac)](
                    Math[xQ(0xe44)](tZ) * u0,
                    Math[xQ(0x88e)](tZ) * u0
                  );
              }
              (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x10),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0xdbd))),
                rG[xQ(0xa06)](),
                (rG[xQ(0xade)] = 0x6),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x8d0))),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x473)]:
              rG[xQ(0x884)](),
                (rJ = this[xQ(0x3aa)] / 0x28),
                rG[xQ(0x28b)](rJ, rJ),
                this[xQ(0x9c2)](rG),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](
                  this[xQ(0x50e)] ? lh[0x0] : xQ(0x368)
                )),
                (rG[xQ(0xc51)] = xQ(0x61f)),
                (rG[xQ(0xade)] = 0x10),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rG[xQ(0xa06)](),
                rG[xQ(0x884)](),
                rG[xQ(0x9be)](),
                rG[xQ(0x8e6)](),
                rG[xQ(0x915)](),
                rG[xQ(0x915)]();
              break;
            case cS[xQ(0x1c9)]:
            case cS[xQ(0x616)]:
            case cS[xQ(0x97a)]:
            case cS[xQ(0x806)]:
            case cS[xQ(0x8f4)]:
            case cS[xQ(0x663)]:
            case cS[xQ(0x256)]:
            case cS[xQ(0x710)]:
              (rJ = this[xQ(0x3aa)] / 0x14), rG[xQ(0x28b)](rJ, rJ);
              const s7 = Math[xQ(0x88e)](this[xQ(0xb98)] * 1.6),
                s8 = this[xQ(0x8d5)][xQ(0x307)](xQ(0x1c9)),
                s9 = this[xQ(0x8d5)][xQ(0x307)](xQ(0x223)),
                sa = this[xQ(0x8d5)][xQ(0x307)](xQ(0x97a)),
                sb = this[xQ(0x8d5)][xQ(0x307)](xQ(0x97a)) ? -0x4 : 0x0;
              (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x6);
              s9 && rG[xQ(0xe07)](0x8, 0x0);
              for (let u1 = 0x0; u1 < 0x2; u1++) {
                const u2 = u1 === 0x0 ? -0x1 : 0x1;
                rG[xQ(0x884)](), rG[xQ(0x9c0)](u2 * (s7 * 0.5 + 0.6) * 0.08);
                const u3 = u2 * 0x4;
                rG[xQ(0xa39)](),
                  rG[xQ(0xb9f)](0x0, u3),
                  rG[xQ(0x78e)](0xc, 0x6 * u2 + u3, 0x18, u3),
                  rG[xQ(0x8e6)](),
                  rG[xQ(0x915)]();
              }
              if (this[xQ(0x50e)])
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](lh[0x0])),
                  (rG[xQ(0xc51)] = this[xQ(0x9e3)](lh[0x1]));
              else
                this[xQ(0x8d5)][xQ(0xac2)](xQ(0x23b))
                  ? ((rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x1c4))),
                    (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x80c))))
                  : ((rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x3c9))),
                    (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xc53))));
              rG[xQ(0xade)] = s9 ? 0x9 : 0xc;
              s9 &&
                (rG[xQ(0x884)](),
                rG[xQ(0xe07)](-0x18, 0x0),
                rG[xQ(0x28b)](-0x1, 0x1),
                lF(rG, 0x15, rG[xQ(0x6b8)], rG[xQ(0xc51)], rG[xQ(0xade)]),
                rG[xQ(0x915)]());
              !sa &&
                (rG[xQ(0x884)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](-0xa, 0x0, s9 ? 0x12 : 0xc, 0x0, l0),
                rG[xQ(0xa06)](),
                rG[xQ(0x9be)](),
                rG[xQ(0x8e6)](),
                rG[xQ(0x915)]());
              if (s8 || s9) {
                rG[xQ(0x884)](),
                  (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x654))),
                  (rG[xQ(0x58a)] *= 0.5);
                const u4 = (Math["PI"] / 0x7) * (s9 ? 0.85 : 0x1) + s7 * 0.08;
                for (let u5 = 0x0; u5 < 0x2; u5++) {
                  const u6 = u5 === 0x0 ? -0x1 : 0x1;
                  rG[xQ(0x884)](),
                    rG[xQ(0x9c0)](u6 * u4),
                    rG[xQ(0xe07)](
                      s9 ? -0x13 : -0x9,
                      u6 * -0x3 * (s9 ? 1.3 : 0x1)
                    ),
                    rG[xQ(0xa39)](),
                    rG[xQ(0x4a4)](
                      0x0,
                      0x0,
                      s9 ? 0x14 : 0xe,
                      s9 ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      l0
                    ),
                    rG[xQ(0xa06)](),
                    rG[xQ(0x915)]();
                }
                rG[xQ(0x915)]();
              }
              rG[xQ(0x884)](),
                rG[xQ(0xe07)](0x4 + sb, 0x0),
                lF(
                  rG,
                  sa ? 0x14 : 12.1,
                  rG[xQ(0x6b8)],
                  rG[xQ(0xc51)],
                  rG[xQ(0xade)]
                ),
                rG[xQ(0x915)]();
              break;
            case cS[xQ(0xbb1)]:
              this[xQ(0x80e)](rG, xQ(0x549));
              break;
            case cS[xQ(0x3bb)]:
              this[xQ(0x80e)](rG, xQ(0x43e));
              break;
            case cS[xQ(0x8cf)]:
              this[xQ(0x80e)](rG, xQ(0x4dc)),
                (rG[xQ(0x58a)] *= 0.2),
                lJ(rG, this[xQ(0x3aa)] * 1.3, 0x4);
              break;
            case cS[xQ(0x1f8)]:
            case cS[xQ(0x163)]:
            case cS[xQ(0xa9d)]:
            case cS[xQ(0x290)]:
            case cS[xQ(0xa65)]:
            case cS[xQ(0xc20)]:
              rG[xQ(0x884)](),
                (rJ = this[xQ(0x3aa)] / 0x28),
                rG[xQ(0x28b)](rJ, rJ),
                rG[xQ(0xa39)]();
              for (let u7 = 0x0; u7 < 0x2; u7++) {
                rG[xQ(0x884)](),
                  rG[xQ(0x28b)](0x1, u7 * 0x2 - 0x1),
                  rG[xQ(0xe07)](0x0, 0x23),
                  rG[xQ(0xb9f)](0x9, 0x0),
                  rG[xQ(0xcac)](0x5, 0xa),
                  rG[xQ(0xcac)](-0x5, 0xa),
                  rG[xQ(0xcac)](-0x9, 0x0),
                  rG[xQ(0xcac)](0x9, 0x0),
                  rG[xQ(0x915)]();
              }
              (rG[xQ(0xade)] = 0x12),
                (rG[xQ(0xd10)] = rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xc51)] = rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x458))),
                rG[xQ(0xa06)](),
                rG[xQ(0x8e6)]();
              let sc;
              if (this[xQ(0x8d5)][xQ(0xa91)](xQ(0x4c8)) > -0x1)
                sc = [xQ(0xb5d), xQ(0xd7d)];
              else
                this[xQ(0x8d5)][xQ(0xa91)](xQ(0xce1)) > -0x1
                  ? (sc = [xQ(0x41f), xQ(0xbe2)])
                  : (sc = [xQ(0xa9f), xQ(0x115)]);
              rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0x28, 0x0, l0),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](sc[0x0])),
                rG[xQ(0xa06)](),
                (rG[xQ(0xade)] = 0x8),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](sc[0x1])),
                rG[xQ(0x8e6)]();
              this[xQ(0x8d5)][xQ(0xa91)](xQ(0x14b)) > -0x1 &&
                this[xQ(0x56f)](rG, -0xf, 0x0, 1.25, 0x4);
              rG[xQ(0x915)]();
              break;
            case cS[xQ(0xba5)]:
            case cS[xQ(0xcff)]:
              (rL =
                Math[xQ(0x88e)](
                  Date[xQ(0xd3f)]() / 0x3e8 + this[xQ(0xb98)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rJ = this[xQ(0x3aa)] / 0x50),
                rG[xQ(0x28b)](rJ, rJ);
              const sd = this[xQ(0x8fa)] === cS[xQ(0xcff)];
              sd &&
                (rG[xQ(0x884)](),
                rG[xQ(0x28b)](0x2, 0x2),
                this[xQ(0x9c2)](rG),
                rG[xQ(0x915)]());
              rG[xQ(0x9c0)](-this[xQ(0x582)]),
                (rG[xQ(0xade)] = 0xa),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (rK = this[xQ(0x50e)]
                  ? lh
                  : sd
                  ? [xQ(0xae7), xQ(0xbcf)]
                  : [xQ(0x5c1), xQ(0x2ff)]),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](rK[0x0])),
                rG[xQ(0xa06)](),
                rG[xQ(0x9be)](),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](rK[0x1])),
                rG[xQ(0x8e6)]();
              const se = this[xQ(0x9e3)](xQ(0xdbd)),
                sf = this[xQ(0x9e3)](xQ(0x507)),
                sg = (u8 = 0x1) => {
                  const xT = xQ;
                  rG[xT(0x884)](),
                    rG[xT(0x28b)](u8, 0x1),
                    rG[xT(0xe07)](0x13 - rL * 0x4, -0x1d + rL * 0x5),
                    rG[xT(0xa39)](),
                    rG[xT(0xb9f)](0x0, 0x0),
                    rG[xT(0x443)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rG[xT(0x78e)](0x19, 0x5 + rL * 0x2, 0x0, 0x0),
                    rG[xT(0x765)](),
                    (rG[xT(0xade)] = 0x3),
                    rG[xT(0x8e6)](),
                    (rG[xT(0x6b8)] = se),
                    rG[xT(0xa06)](),
                    rG[xT(0x9be)](),
                    rG[xT(0xa39)](),
                    rG[xT(0xce9)](
                      0x16 + u8 * this[xT(0x656)] * 0x10,
                      -0x4 + this[xT(0xd02)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rG[xT(0x6b8)] = sf),
                    rG[xT(0xa06)](),
                    rG[xT(0x915)]();
                };
              sg(0x1),
                sg(-0x1),
                rG[xQ(0x884)](),
                rG[xQ(0xe07)](0x0, 0xa),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x28 + rL * 0xa, -0xe + rL * 0x5),
                rG[xQ(0x78e)](0x0, +rL * 0x5, 0x2c - rL * 0xf, -0xe + rL * 0x5),
                rG[xQ(0x443)](
                  0x14,
                  0x28 - rL * 0x14,
                  -0x14,
                  0x28 - rL * 0x14,
                  -0x28 + rL * 0xa,
                  -0xe + rL * 0x5
                ),
                rG[xQ(0x765)](),
                (rG[xQ(0xade)] = 0x5),
                rG[xQ(0x8e6)](),
                (rG[xQ(0x6b8)] = sf),
                rG[xQ(0xa06)](),
                rG[xQ(0x9be)]();
              const sh = rL * 0x2,
                si = rL * -0xa;
              rG[xQ(0x884)](),
                rG[xQ(0xe07)](0x0, si),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x37, -0x8),
                rG[xQ(0x443)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rG[xQ(0xc51)] = se),
                (rG[xQ(0xade)] = 0xd),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xade)] = 0x4),
                (rG[xQ(0xc51)] = sf),
                rG[xQ(0xa39)]();
              for (let u8 = 0x0; u8 < 0x6; u8++) {
                const u9 = (((u8 + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rG[xQ(0xb9f)](u9, 0xa), rG[xQ(0xcac)](u9, 0x46);
              }
              rG[xQ(0x8e6)](),
                rG[xQ(0x915)](),
                rG[xQ(0x884)](),
                rG[xQ(0xe07)](0x0, sh),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x32, -0x14),
                rG[xQ(0x78e)](0x0, 0x8, 0x32, -0x12),
                (rG[xQ(0xc51)] = se),
                (rG[xQ(0xade)] = 0xd),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xade)] = 0x5),
                (rG[xQ(0xc51)] = sf),
                rG[xQ(0xa39)]();
              for (let ua = 0x0; ua < 0x6; ua++) {
                let ub = (((ua + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rG[xQ(0xb9f)](ub, -0x14), rG[xQ(0xcac)](ub, 0x2);
              }
              rG[xQ(0x8e6)](), rG[xQ(0x915)](), rG[xQ(0x915)]();
              const sj = 0x1 - rL;
              (rG[xQ(0x58a)] *= Math[xQ(0xb8e)](0x0, (sj - 0.3) / 0.7)),
                rG[xQ(0xa39)]();
              for (let uc = 0x0; uc < 0x2; uc++) {
                rG[xQ(0x884)](),
                  uc === 0x1 && rG[xQ(0x28b)](-0x1, 0x1),
                  rG[xQ(0xe07)](
                    -0x33 + rL * (0xa + uc * 3.4) - uc * 3.4,
                    -0xf + rL * (0x5 - uc * 0x1)
                  ),
                  rG[xQ(0xb9f)](0xa, 0x0),
                  rG[xQ(0xce9)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rG[xQ(0x915)]();
              }
              rG[xQ(0xe07)](0x0, 0x28),
                rG[xQ(0xb9f)](0x28 - rL * 0xa, -0xe + rL * 0x5),
                rG[xQ(0x443)](
                  0x14,
                  0x14 - rL * 0xa,
                  -0x14,
                  0x14 - rL * 0xa,
                  -0x28 + rL * 0xa,
                  -0xe + rL * 0x5
                ),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x2),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0xb95)]:
              (rJ = this[xQ(0x3aa)] / 0x14), rG[xQ(0x28b)](rJ, rJ);
              const sk = rG[xQ(0x58a)];
              (rG[xQ(0xc51)] = rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0xdbd))),
                (rG[xQ(0x58a)] = 0.6 * sk),
                rG[xQ(0xa39)]();
              for (let ud = 0x0; ud < 0xa; ud++) {
                const ue = (ud / 0xa) * Math["PI"] * 0x2;
                rG[xQ(0x884)](),
                  rG[xQ(0x9c0)](ue),
                  rG[xQ(0xe07)](17.5, 0x0),
                  rG[xQ(0xb9f)](0x0, 0x0);
                const uf = Math[xQ(0x88e)](ue + Date[xQ(0xd3f)]() / 0x1f4);
                rG[xQ(0x9c0)](uf * 0.5),
                  rG[xQ(0x78e)](0x4, -0x2 * uf, 0xe, 0x0),
                  rG[xQ(0x915)]();
              }
              (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 2.3),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rG[xQ(0x58a)] = 0.5 * sk),
                rG[xQ(0xa06)](),
                rG[xQ(0x9be)](),
                (rG[xQ(0xade)] = 0x3),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xade)] = 1.2),
                (rG[xQ(0x58a)] = 0.6 * sk),
                rG[xQ(0xa39)](),
                (rG[xQ(0xe0e)] = xQ(0x423));
              for (let ug = 0x0; ug < 0x4; ug++) {
                rG[xQ(0x884)](),
                  rG[xQ(0x9c0)]((ug / 0x4) * Math["PI"] * 0x2),
                  rG[xQ(0xe07)](0x4, 0x0),
                  rG[xQ(0xb9f)](0x0, -0x2),
                  rG[xQ(0x443)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rG[xQ(0x915)]();
              }
              rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x594)]:
              this[xQ(0x594)](rG);
              break;
            case cS[xQ(0x4b4)]:
              this[xQ(0x594)](rG, !![]);
              break;
            case cS[xQ(0x4ab)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x32),
                (rG[xQ(0xade)] = 0x19),
                (rG[xQ(0xd10)] = xQ(0x423));
              const sl = this[xQ(0xd2d)]
                ? 0.6
                : (Date[xQ(0xd3f)]() / 0x4b0) % 6.28;
              for (let uh = 0x0; uh < 0xa; uh++) {
                const ui = 0x1 - uh / 0xa,
                  uj =
                    ui *
                    0x50 *
                    (0x1 +
                      (Math[xQ(0x88e)](sl * 0x3 + uh * 0.5 + this[xQ(0xb98)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rG[xQ(0x9c0)](sl),
                  (rG[xQ(0xc51)] = this[xQ(0x9e3)](lg[uh])),
                  rG[xQ(0x137)](-uj / 0x2, -uj / 0x2, uj, uj);
              }
              break;
            case cS[xQ(0x55c)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x12),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x19, -0xa),
                rG[xQ(0x78e)](0x0, -0x2, 0x19, -0xa),
                rG[xQ(0x78e)](0x1e, 0x0, 0x19, 0xa),
                rG[xQ(0x78e)](0x0, 0x2, -0x19, 0xa),
                rG[xQ(0x78e)](-0x1e, 0x0, -0x19, -0xa),
                rG[xQ(0x765)](),
                (rG[xQ(0xd10)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0x4),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xab0))),
                rG[xQ(0x8e6)](),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x8ce))),
                rG[xQ(0xa06)](),
                rG[xQ(0x9be)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x19, -0xa),
                rG[xQ(0x78e)](0x14, 0x0, 0x19, 0xa),
                rG[xQ(0xcac)](0x28, 0xa),
                rG[xQ(0xcac)](0x28, -0xa),
                (rG[xQ(0x6b8)] = xQ(0x61f)),
                rG[xQ(0xa06)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x0, -0xa),
                rG[xQ(0x78e)](-0x5, 0x0, 0x0, 0xa),
                (rG[xQ(0xade)] = 0xa),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x747))),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x673)]:
              (rJ = this[xQ(0x3aa)] / 0xc),
                rG[xQ(0x28b)](rJ, rJ),
                rG[xQ(0x9c0)](-Math["PI"] / 0x6),
                rG[xQ(0xe07)](-0xc, 0x0),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x5, 0x0),
                rG[xQ(0xcac)](0x0, 0x0),
                (rG[xQ(0xade)] = 0x4),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xc73))),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x0, 0x0),
                rG[xQ(0x78e)](0xa, -0x14, 0x1e, 0x0),
                rG[xQ(0x78e)](0xa, 0x14, 0x0, 0x0),
                (rG[xQ(0xade)] = 0x6),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x20f))),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa06)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x6, 0x0),
                rG[xQ(0x78e)](0xe, -0x2, 0x16, 0x0),
                (rG[xQ(0xade)] = 3.5),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x3c4)]:
              rI(xQ(0x3c4), xQ(0xe67), xQ(0xe40));
              break;
            case cS[xQ(0xbd5)]:
              rI(xQ(0xbd5), xQ(0xd45), xQ(0x2db));
              break;
            case cS[xQ(0x30b)]:
              rI(xQ(0x30b), xQ(0xdbd), xQ(0x8d0));
              break;
            case cS[xQ(0x680)]:
              rI(xQ(0x680), xQ(0xdbd), xQ(0x8d0));
              break;
            case cS[xQ(0xaa6)]:
              rI(xQ(0x680), xQ(0xc45), xQ(0x4f5));
              break;
            case cS[xQ(0xe27)]:
              const sm = this[xQ(0xd2d)] ? 0x3c : this[xQ(0x3aa)] * 0x2;
              rG[xQ(0xe07)](-this[xQ(0x3aa)] - 0xa, 0x0),
                (rG[xQ(0xd10)] = rG[xQ(0xe0e)] = xQ(0x423)),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x0, 0x0),
                rG[xQ(0xcac)](sm, 0x0),
                (rG[xQ(0xade)] = 0x6),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0xd0a))),
                rG[xQ(0xa06)](),
                rG[xQ(0xe07)](sm, 0x0),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0xd, 0x0),
                rG[xQ(0xcac)](0x0, -3.5),
                rG[xQ(0xcac)](0x0, 3.5),
                rG[xQ(0x765)](),
                (rG[xQ(0xc51)] = rG[xQ(0x6b8)]),
                rG[xQ(0xa06)](),
                (rG[xQ(0xade)] = 0x3),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x460)]:
              const sn = this[xQ(0x3aa)] * 0x2,
                so = 0xa;
              rG[xQ(0xe07)](-this[xQ(0x3aa)], 0x0),
                (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xbd2)] = xQ(0x647)),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x0, 0x0),
                rG[xQ(0xcac)](-so * 1.8, 0x0),
                (rG[xQ(0xc51)] = xQ(0x439)),
                (rG[xQ(0xade)] = so * 1.4),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xc51)] = xQ(0x369)),
                (rG[xQ(0xade)] *= 0.7),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x0, 0x0),
                rG[xQ(0xcac)](-so * 0.45, 0x0),
                (rG[xQ(0xc51)] = xQ(0x439)),
                (rG[xQ(0xade)] = so * 0x2 + 3.5),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xc51)] = xQ(0x377)),
                (rG[xQ(0xade)] = so * 0x2),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, so, 0x0, Math["PI"] * 0x2),
                (rG[xQ(0x6b8)] = xQ(0xaef)),
                rG[xQ(0xa06)](),
                (rG[xQ(0xc51)] = xQ(0x46d)),
                rG[xQ(0xa39)]();
              const sp = (Date[xQ(0xd3f)]() * 0.001) % 0x1,
                sq = sp * sn,
                sr = sn * 0.2;
              rG[xQ(0xb9f)](Math[xQ(0xb8e)](sq - sr, 0x0), 0x0),
                rG[xQ(0xcac)](Math[xQ(0x77f)](sq + sr, sn), 0x0);
              const ss = Math[xQ(0x88e)](sp * Math["PI"]);
              (rG[xQ(0x1c5)] = so * 0x3 * ss),
                (rG[xQ(0xade)] = so),
                rG[xQ(0x8e6)](),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x0, 0x0),
                rG[xQ(0xcac)](sn, 0x0),
                (rG[xQ(0xade)] = so),
                (rG[xQ(0x1c5)] = so),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x1cf)]:
            case cS[xQ(0xdc9)]:
            case cS[xQ(0x72d)]:
            case cS[xQ(0x60a)]:
            case cS[xQ(0x602)]:
            case cS[xQ(0x253)]:
              (rJ = this[xQ(0x3aa)] / 0x23), rG[xQ(0x627)](rJ), rG[xQ(0xa39)]();
              this[xQ(0x8fa)] !== cS[xQ(0xdc9)] &&
              this[xQ(0x8fa)] !== cS[xQ(0x602)]
                ? rG[xQ(0x4a4)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, l0)
                : rG[xQ(0xce9)](0x0, 0x0, 0x23, 0x0, l0);
              (rK = lr[this[xQ(0x8fa)]] || [xQ(0x2c5), xQ(0x1be)]),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](rK[0x0])),
                rG[xQ(0xa06)](),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](rK[0x1])),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x177)]:
              (rG[xQ(0xade)] = 0x4),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x360)),
                rI(xQ(0x177), xQ(0x9f5), xQ(0x357));
              break;
            case cS[xQ(0x9a4)]:
              rI(xQ(0x9a4), xQ(0xdbd), xQ(0x8d0));
              break;
            case cS[xQ(0x7c8)]:
              (rJ = this[xQ(0x3aa)] / 0x14), rG[xQ(0x28b)](rJ, rJ);
              !this[xQ(0xd2d)] && rG[xQ(0x9c0)]((pP / 0x64) % 6.28);
              rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rG[xQ(0x78e)](0x0, 0xc, 0x14, 0x0),
                rG[xQ(0x765)](),
                (rG[xQ(0xd10)] = rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] *= 0.7),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0xdbd))),
                rG[xQ(0xa06)](),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x8d0))),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x2bc)]:
              (rG[xQ(0xade)] *= 0.7),
                rI(xQ(0x2bc), xQ(0xb8d), xQ(0x29c)),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0.6, 0x0, l0),
                (rG[xQ(0x6b8)] = xQ(0xd50)),
                rG[xQ(0xa06)]();
              break;
            case cS[xQ(0x1eb)]:
              (rG[xQ(0xade)] *= 0.8), rI(xQ(0x1eb), xQ(0x969), xQ(0xaf9));
              break;
            case cS[xQ(0xa6b)]:
              (rJ = this[xQ(0x3aa)] / 0xa), rG[xQ(0x28b)](rJ, rJ);
              if (!this[xQ(0xb4f)] || pP - this[xQ(0xde1)] > 0x14) {
                this[xQ(0xde1)] = pP;
                const uk = new Path2D();
                for (let ul = 0x0; ul < 0xa; ul++) {
                  const um = (Math[xQ(0xbf6)]() * 0x2 - 0x1) * 0x7,
                    un = (Math[xQ(0xbf6)]() * 0x2 - 0x1) * 0x7;
                  uk[xQ(0xb9f)](um, un), uk[xQ(0xce9)](um, un, 0x5, 0x0, l0);
                }
                this[xQ(0xb4f)] = uk;
              }
              (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x654))),
                rG[xQ(0xa06)](this[xQ(0xb4f)]);
              break;
            case cS[xQ(0x332)]:
            case cS[xQ(0x43c)]:
              (rJ = this[xQ(0x3aa)] / 0x1e),
                rG[xQ(0x28b)](rJ, rJ),
                rG[xQ(0xa39)]();
              const st = 0x1 / 0x3;
              for (let uo = 0x0; uo < 0x3; uo++) {
                const up = (uo / 0x3) * Math["PI"] * 0x2;
                rG[xQ(0xb9f)](0x0, 0x0),
                  rG[xQ(0xce9)](0x0, 0x0, 0x1e, up, up + Math["PI"] / 0x3);
              }
              (rG[xQ(0xe0e)] = xQ(0x423)),
                (rG[xQ(0xade)] = 0xa),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](
                  this[xQ(0x8fa)] === cS[xQ(0x332)] ? xQ(0x797) : xQ(0xbe7)
                )),
                rG[xQ(0xa06)](),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x44a)]:
              rH(xQ(0xc4d), xQ(0x95c));
              break;
            case cS[xQ(0xc85)]:
              rH(xQ(0x901), xQ(0x83a));
              break;
            case cS[xQ(0x233)]:
            case cS[xQ(0x7e8)]:
              rH(xQ(0xdbd), xQ(0x8d0));
              break;
            case cS[xQ(0x164)]:
              (rJ = this[xQ(0x3aa)] / 0x14),
                rG[xQ(0x28b)](rJ, rJ),
                rG[xQ(0x9c0)](-Math["PI"] / 0x4);
              const su = rG[xQ(0xade)];
              (rG[xQ(0xade)] *= 1.5),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x14, -0x14 - su),
                rG[xQ(0xcac)](-0x14, 0x0),
                rG[xQ(0xcac)](0x14, 0x0),
                rG[xQ(0xcac)](0x14, 0x14 + su),
                rG[xQ(0x9c0)](Math["PI"] / 0x2),
                rG[xQ(0xb9f)](-0x14, -0x14 - su),
                rG[xQ(0xcac)](-0x14, 0x0),
                rG[xQ(0xcac)](0x14, 0x0),
                rG[xQ(0xcac)](0x14, 0x14 + su),
                (rG[xQ(0xe0e)] = rG[xQ(0xe0e)] = xQ(0x360)),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x6d7)]:
              rH(xQ(0xd47), xQ(0x2dc));
              break;
            case cS[xQ(0x3c3)]:
              rH(xQ(0x59a), xQ(0x2c4));
              break;
            case cS[xQ(0xc24)]:
              rH(xQ(0x739), xQ(0x58d));
              break;
            case cS[xQ(0x893)]:
              (rJ = this[xQ(0x3aa)] / 0x14),
                rG[xQ(0x28b)](rJ, rJ),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0x14, 0x0, l0),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x16c))),
                rG[xQ(0xa06)](),
                rG[xQ(0x9be)](),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xd0a))),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0xa6d))),
                rG[xQ(0xa06)]();
              break;
            case cS[xQ(0x8ff)]:
              (rJ = this[xQ(0x3aa)] / 0x14), rG[xQ(0x28b)](rJ, rJ);
              const sv = (uq, ur, us = ![]) => {
                  const xU = xQ;
                  (rG[xU(0xe0e)] = xU(0x423)),
                    (rG[xU(0xc51)] = this[xU(0x9e3)](ur)),
                    (rG[xU(0x6b8)] = this[xU(0x9e3)](uq)),
                    rG[xU(0xa39)](),
                    rG[xU(0xce9)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rG[xU(0x8e6)](),
                    rG[xU(0xa06)]();
                },
                sw = (uq, ur) => {
                  const xV = xQ;
                  rG[xV(0x884)](),
                    rG[xV(0x9be)](),
                    (rG[xV(0xe0e)] = xV(0x423)),
                    (rG[xV(0x6b8)] = this[xV(0x9e3)](uq)),
                    (rG[xV(0xc51)] = this[xV(0x9e3)](ur)),
                    rG[xV(0xa06)](),
                    rG[xV(0x8e6)](),
                    rG[xV(0x915)]();
                };
              (rG[xQ(0xe0e)] = xQ(0x423)),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                sw(xQ(0x16c), xQ(0xd0a)),
                rG[xQ(0x9c0)](Math["PI"]),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rG[xQ(0xce9)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rG[xQ(0xce9)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                sw(xQ(0xdbd), xQ(0x8d0)),
                rG[xQ(0x9c0)](-Math["PI"]),
                rG[xQ(0xa39)](),
                rG[xQ(0xce9)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                sw(xQ(0x16c), xQ(0xd0a));
              break;
            case cS[xQ(0x2fa)]:
              this[xQ(0xa15)](rG, this[xQ(0x3aa)]);
              break;
            case cS[xQ(0x398)]:
              (rJ = this[xQ(0x3aa)] / 0x28),
                rG[xQ(0x28b)](rJ, rJ),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](-0x1e, -0x1e),
                rG[xQ(0xcac)](0x14, 0x0),
                rG[xQ(0xcac)](-0x1e, 0x1e),
                rG[xQ(0x765)](),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x16c))),
                (rG[xQ(0x6b8)] = this[xQ(0x9e3)](xQ(0x4dc))),
                rG[xQ(0xa06)](),
                (rG[xQ(0xade)] = 0x16),
                (rG[xQ(0xe0e)] = rG[xQ(0xd10)] = xQ(0x423)),
                rG[xQ(0x8e6)]();
              break;
            case cS[xQ(0x3f4)]:
              rG[xQ(0x627)](this[xQ(0x3aa)] / 0x41),
                rG[xQ(0xe07)](-0xa, 0xa),
                (rG[xQ(0xd10)] = rG[xQ(0xe0e)] = xQ(0x423)),
                rG[xQ(0x884)](),
                rG[xQ(0xa39)](),
                rG[xQ(0xb9f)](0x1e, 0x0),
                rG[xQ(0xe07)](
                  0x46 -
                    (Math[xQ(0x88e)](
                      Date[xQ(0xd3f)]() / 0x190 + 0.8 * this[xQ(0xb98)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rG[xQ(0xcac)](0x0, 0x0),
                (rG[xQ(0xade)] = 0x2a),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0xcea))),
                rG[xQ(0x8e6)](),
                (rG[xQ(0xc51)] = this[xQ(0x9e3)](xQ(0x745))),
                (rG[xQ(0xade)] -= 0xc),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa39)]();
              for (let uq = 0x0; uq < 0x2; uq++) {
                rG[xQ(0xb9f)](0x9, 0x7),
                  rG[xQ(0xcac)](0x28, 0x14),
                  rG[xQ(0xcac)](0x7, 0x9),
                  rG[xQ(0xcac)](0x9, 0x7),
                  rG[xQ(0x28b)](0x1, -0x1);
              }
              (rG[xQ(0xade)] = 0x3),
                (rG[xQ(0x6b8)] = rG[xQ(0xc51)] = xQ(0x41c)),
                rG[xQ(0x8e6)](),
                rG[xQ(0xa06)](),
                rG[xQ(0x915)](),
                this[xQ(0x2c6)](rG);
              break;
            case cS[xQ(0x7a7)]:
              (rJ = this[xQ(0x3aa)] / 0x14), rG[xQ(0x28b)](rJ, rJ);
              const sx = (ur = 0x1, us, ut) => {
                const xW = xQ;
                rG[xW(0x884)](),
                  rG[xW(0x28b)](0x1, ur),
                  rG[xW(0xa39)](),
                  rG[xW(0xb68)](-0x64, 0x0, 0x12c, -0x12c),
                  rG[xW(0x9be)](),
                  rG[xW(0xa39)](),
                  rG[xW(0xb9f)](-0x14, 0x0),
                  rG[xW(0x78e)](-0x12, -0x19, 0x11, -0xf),
                  (rG[xW(0xe0e)] = xW(0x423)),
                  (rG[xW(0xade)] = 0x16),
                  (rG[xW(0xc51)] = this[xW(0x9e3)](ut)),
                  rG[xW(0x8e6)](),
                  (rG[xW(0xade)] = 0xe),
                  (rG[xW(0xc51)] = this[xW(0x9e3)](us)),
                  rG[xW(0x8e6)](),
                  rG[xW(0x915)]();
              };
              sx(0x1, xQ(0x628), xQ(0xc7c)), sx(-0x1, xQ(0x27b), xQ(0xb2e));
              break;
            default:
              rG[xQ(0xa39)](),
                rG[xQ(0xce9)](0x0, 0x0, this[xQ(0x3aa)], 0x0, Math["PI"] * 0x2),
                (rG[xQ(0x6b8)] = xQ(0x9b2)),
                rG[xQ(0xa06)](),
                pJ(rG, this[xQ(0x8d5)], 0x14, xQ(0x46d), 0x3);
          }
          rG[xQ(0x915)](), (this[xQ(0xc90)] = null);
        }
        [uv(0xc59)](rG, rH) {
          const xX = uv;
          rH = rH || pP / 0x12c + this[xX(0xb98)] * 0.3;
          const rI = Math[xX(0x88e)](rH) * 0.5 + 0.5;
          rG[xX(0xe0e)] = xX(0x423);
          const rJ = 0x4;
          for (let rK = 0x0; rK < 0x2; rK++) {
            rG[xX(0x884)]();
            if (rK === 0x0) rG[xX(0xa39)]();
            for (let rL = 0x0; rL < 0x2; rL++) {
              for (let rM = 0x0; rM < rJ; rM++) {
                rG[xX(0x884)](), rK > 0x0 && rG[xX(0xa39)]();
                const rN = -0.19 - (rM / rJ) * Math["PI"] * 0.25;
                rG[xX(0x9c0)](rN + rI * 0.05), rG[xX(0xb9f)](0x0, 0x0);
                const rO = Math[xX(0x88e)](rH + rM);
                rG[xX(0xe07)](0x1c - (rO * 0.5 + 0.5), 0x0),
                  rG[xX(0x9c0)](rO * 0.08),
                  rG[xX(0xcac)](0x0, 0x0),
                  rG[xX(0x78e)](0x0, 0x7, 5.5, 0xe),
                  rK > 0x0 &&
                    ((rG[xX(0xade)] = 6.5),
                    (rG[xX(0xc51)] =
                      xX(0x59b) + (0x2f + (rM / rJ) * 0x14) + "%)"),
                    rG[xX(0x8e6)]()),
                  rG[xX(0x915)]();
              }
              rG[xX(0x28b)](-0x1, 0x1);
            }
            rK === 0x0 &&
              ((rG[xX(0xade)] = 0x9),
              (rG[xX(0xc51)] = xX(0x408)),
              rG[xX(0x8e6)]()),
              rG[xX(0x915)]();
          }
          rG[xX(0xa39)](),
            rG[xX(0x4a4)](
              0x0,
              -0x1e + Math[xX(0x88e)](rH * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rG[xX(0xc51)] = xX(0x408)),
            (rG[xX(0xade)] = 5.5),
            rG[xX(0x8e6)](),
            (rG[xX(0x1c5)] = 0x5 + rI * 0x8),
            (rG[xX(0xbd2)] = xX(0x471)),
            (rG[xX(0xc51)] = rG[xX(0xbd2)]),
            (rG[xX(0xade)] = 3.5),
            rG[xX(0x8e6)](),
            (rG[xX(0x1c5)] = 0x0);
        }
        [uv(0xd27)](rG) {
          const xY = uv,
            rH = this[xY(0x50e)] ? ll[xY(0x5a2)] : ll[xY(0x6ad)],
            rI = Date[xY(0xd3f)]() / 0x1f4 + this[xY(0xb98)],
            rJ = Math[xY(0x88e)](rI) - 0.5;
          rG[xY(0xe0e)] = rG[xY(0xd10)] = xY(0x423);
          const rK = 0x46;
          rG[xY(0x884)](), rG[xY(0xa39)]();
          for (let rL = 0x0; rL < 0x2; rL++) {
            rG[xY(0x884)]();
            const rM = rL * 0x2 - 0x1;
            rG[xY(0x28b)](0x1, rM),
              rG[xY(0xe07)](0x14, rK),
              rG[xY(0x9c0)](rJ * 0.1),
              rG[xY(0xb9f)](0x0, 0x0),
              rG[xY(0xcac)](-0xa, 0x32),
              rG[xY(0x78e)](0x32, 0x32, 0x64, 0x1e),
              rG[xY(0x78e)](0x32, 0x32, 0x64, 0x1e),
              rG[xY(0x78e)](0x1e, 0x8c, -0x50, 0x78 - rJ * 0x14),
              rG[xY(0x78e)](
                -0xa + rJ * 0xf,
                0x6e - rJ * 0xa,
                -0x28,
                0x50 - rJ * 0xa
              ),
              rG[xY(0x78e)](
                -0xa + rJ * 0xa,
                0x3c + rJ * 0x5,
                -0x3c,
                0x32 - Math[xY(0xb8e)](0x0, rJ) * 0xa
              ),
              rG[xY(0x78e)](-0xa, 0x14 - rJ * 0xa, -0x46, rJ * 0xa),
              rG[xY(0x915)]();
          }
          (rG[xY(0x6b8)] = this[xY(0x9e3)](rH[xY(0x4f7)])),
            rG[xY(0xa06)](),
            (rG[xY(0xade)] = 0x12),
            (rG[xY(0xc51)] = xY(0x300)),
            rG[xY(0x9be)](),
            rG[xY(0x8e6)](),
            rG[xY(0x915)](),
            rG[xY(0x884)](),
            rG[xY(0xe07)](0x50, 0x0),
            rG[xY(0x28b)](0x2, 0x2),
            rG[xY(0xa39)]();
          for (let rN = 0x0; rN < 0x2; rN++) {
            rG[xY(0x28b)](0x1, -0x1),
              rG[xY(0x884)](),
              rG[xY(0xe07)](0x0, 0xf),
              rG[xY(0x9c0)]((Math[xY(0x88e)](rI * 0x2) * 0.5 + 0.5) * 0.08),
              rG[xY(0xb9f)](0x0, -0x4),
              rG[xY(0x78e)](0xa, 0x0, 0x14, -0x6),
              rG[xY(0x78e)](0xf, 0x3, 0x0, 0x5),
              rG[xY(0x915)]();
          }
          (rG[xY(0x6b8)] = rG[xY(0xc51)] = xY(0x41c)),
            rG[xY(0xa06)](),
            (rG[xY(0xade)] = 0x6),
            rG[xY(0x8e6)](),
            rG[xY(0x915)]();
          for (let rO = 0x0; rO < 0x2; rO++) {
            const rP = rO === 0x0;
            rP && rG[xY(0xa39)]();
            for (let rQ = 0x4; rQ >= 0x0; rQ--) {
              const rR = rQ / 0x5,
                rS = 0x32 - 0x2d * rR;
              !rP && rG[xY(0xa39)](),
                rG[xY(0xb68)](
                  -0x50 - rR * 0x50 - rS / 0x2,
                  -rS / 0x2 +
                    Math[xY(0x88e)](rR * Math["PI"] * 0x2 + rI * 0x3) *
                      0x8 *
                      rR,
                  rS,
                  rS
                ),
                !rP &&
                  ((rG[xY(0xade)] = 0x14),
                  (rG[xY(0x6b8)] = rG[xY(0xc51)] =
                    this[xY(0x9e3)](rH[xY(0xc47)][rQ])),
                  rG[xY(0x8e6)](),
                  rG[xY(0xa06)]());
            }
            rP &&
              ((rG[xY(0xade)] = 0x22),
              (rG[xY(0xc51)] = this[xY(0x9e3)](rH[xY(0x831)])),
              rG[xY(0x8e6)]());
          }
          rG[xY(0xa39)](),
            rG[xY(0xce9)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rG[xY(0x6b8)] = this[xY(0x9e3)](rH[xY(0xd97)])),
            rG[xY(0xa06)](),
            (rG[xY(0xade)] = 0x24),
            (rG[xY(0xc51)] = xY(0x3b2)),
            rG[xY(0x884)](),
            rG[xY(0x9be)](),
            rG[xY(0x8e6)](),
            rG[xY(0x915)](),
            rG[xY(0x884)]();
          for (let rT = 0x0; rT < 0x2; rT++) {
            rG[xY(0xa39)]();
            for (let rU = 0x0; rU < 0x2; rU++) {
              rG[xY(0x884)]();
              const rV = rU * 0x2 - 0x1;
              rG[xY(0x28b)](0x1, rV),
                rG[xY(0xe07)](0x14, rK),
                rG[xY(0x9c0)](rJ * 0.1),
                rG[xY(0xb9f)](0x0, 0xa),
                rG[xY(0xcac)](-0xa, 0x32),
                rG[xY(0x78e)](0x32, 0x32, 0x64, 0x1e),
                rG[xY(0x78e)](0x32, 0x32, 0x64, 0x1e),
                rG[xY(0x78e)](0x1e, 0x8c, -0x50, 0x78 - rJ * 0x14),
                rG[xY(0xb9f)](0x64, 0x1e),
                rG[xY(0x78e)](0x23, 0x5a, -0x28, 0x50 - rJ * 0xa),
                rG[xY(0xb9f)](-0xa, 0x32),
                rG[xY(0x78e)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[xY(0xb8e)](0x0, rJ) * 0xa
                ),
                rG[xY(0x915)]();
            }
            rT === 0x0
              ? ((rG[xY(0xade)] = 0x10),
                (rG[xY(0xc51)] = this[xY(0x9e3)](rH[xY(0x51f)])))
              : ((rG[xY(0xade)] = 0xa),
                (rG[xY(0xc51)] = this[xY(0x9e3)](rH[xY(0x132)]))),
              rG[xY(0x8e6)]();
          }
          rG[xY(0x915)]();
        }
        [uv(0xdd1)](rG, rH, rI, rJ) {
          const xZ = uv;
          rG[xZ(0x884)]();
          const rK = this[xZ(0x3aa)] / 0x28;
          rG[xZ(0x28b)](rK, rK),
            (rH = this[xZ(0x9e3)](rH)),
            (rI = this[xZ(0x9e3)](rI)),
            (rJ = this[xZ(0x9e3)](rJ));
          const rL = Math["PI"] / 0x5;
          rG[xZ(0xe0e)] = rG[xZ(0xd10)] = xZ(0x423);
          const rM = Math[xZ(0x88e)](
              Date[xZ(0xd3f)]() / 0x12c + this[xZ(0xb98)] * 0.2
            ),
            rN = rM * 0.3 + 0.7;
          rG[xZ(0xa39)](),
            rG[xZ(0xce9)](0x16, 0x0, 0x17, 0x0, l0),
            rG[xZ(0xb9f)](0x0, 0x0),
            rG[xZ(0xce9)](-0x5, 0x0, 0x21, 0x0, l0),
            (rG[xZ(0x6b8)] = this[xZ(0x9e3)](xZ(0x507))),
            rG[xZ(0xa06)](),
            rG[xZ(0x884)](),
            rG[xZ(0xe07)](0x12, 0x0);
          for (let rQ = 0x0; rQ < 0x2; rQ++) {
            rG[xZ(0x884)](),
              rG[xZ(0x28b)](0x1, rQ * 0x2 - 0x1),
              rG[xZ(0x9c0)](Math["PI"] * 0.08 * rN),
              rG[xZ(0xe07)](-0x12, 0x0),
              rG[xZ(0xa39)](),
              rG[xZ(0xce9)](0x0, 0x0, 0x28, Math["PI"], -rL),
              rG[xZ(0x78e)](0x14 - rN * 0x3, -0xf, 0x14, 0x0),
              rG[xZ(0x765)](),
              (rG[xZ(0x6b8)] = rH),
              rG[xZ(0xa06)]();
            const rR = xZ(0x47c) + rQ;
            if (!this[rR]) {
              const rS = new Path2D();
              for (let rT = 0x0; rT < 0x2; rT++) {
                const rU = (Math[xZ(0xbf6)]() * 0x2 - 0x1) * 0x28,
                  rV = Math[xZ(0xbf6)]() * -0x28,
                  rW = Math[xZ(0xbf6)]() * 0x9 + 0x8;
                rS[xZ(0xb9f)](rU, rV), rS[xZ(0xce9)](rU, rV, rW, 0x0, l0);
              }
              this[rR] = rS;
            }
            rG[xZ(0x9be)](),
              (rG[xZ(0x6b8)] = rJ),
              rG[xZ(0xa06)](this[rR]),
              rG[xZ(0x915)](),
              (rG[xZ(0xade)] = 0x7),
              (rG[xZ(0xc51)] = rI),
              rG[xZ(0x8e6)]();
          }
          rG[xZ(0x915)](), rG[xZ(0x884)]();
          let rO = 0x9;
          rG[xZ(0xe07)](0x2a, 0x0);
          const rP = Math["PI"] * 0x3 - rM;
          rG[xZ(0xa39)]();
          for (let rX = 0x0; rX < 0x2; rX++) {
            let rY = 0x0,
              rZ = 0x8;
            rG[xZ(0xb9f)](rY, rZ);
            for (let s0 = 0x0; s0 < rO; s0++) {
              const s1 = s0 / rO,
                s2 = s1 * rP,
                s3 = 0xf * (0x1 - s1),
                s4 = Math[xZ(0xe44)](s2) * s3,
                s5 = Math[xZ(0x88e)](s2) * s3,
                s6 = rY + s4,
                s7 = rZ + s5;
              rG[xZ(0x78e)](
                rY + s4 * 0.5 + s5 * 0.25,
                rZ + s5 * 0.5 - s4 * 0.25,
                s6,
                s7
              ),
                (rY = s6),
                (rZ = s7);
            }
            rG[xZ(0x28b)](0x1, -0x1);
          }
          (rG[xZ(0xe0e)] = rG[xZ(0xd10)] = xZ(0x423)),
            (rG[xZ(0xade)] = 0x2),
            (rG[xZ(0xc51)] = rG[xZ(0x6b8)]),
            rG[xZ(0x8e6)](),
            rG[xZ(0x915)](),
            rG[xZ(0x915)]();
        }
        [uv(0x4fd)](rG, rH = 0x64, rI = 0x50, rJ = 0x12, rK = 0x8) {
          const y0 = uv;
          rG[y0(0xa39)]();
          const rL = (0x1 / rJ) * Math["PI"] * 0x2;
          rG[y0(0xb9f)](rI, 0x0);
          for (let rM = 0x0; rM < rJ; rM++) {
            const rN = rM * rL,
              rO = (rM + 0x1) * rL;
            rG[y0(0x443)](
              Math[y0(0xe44)](rN) * rH,
              Math[y0(0x88e)](rN) * rH,
              Math[y0(0xe44)](rO) * rH,
              Math[y0(0x88e)](rO) * rH,
              Math[y0(0xe44)](rO) * rI,
              Math[y0(0x88e)](rO) * rI
            );
          }
          (rG[y0(0x6b8)] = this[y0(0x9e3)](y0(0xccc))),
            rG[y0(0xa06)](),
            (rG[y0(0xade)] = rK),
            (rG[y0(0xe0e)] = rG[y0(0xd10)] = y0(0x423)),
            (rG[y0(0xc51)] = this[y0(0x9e3)](y0(0x217))),
            rG[y0(0x8e6)]();
        }
        [uv(0x9e3)](rG) {
          const y1 = uv,
            rH = 0x1 - this[y1(0x34a)];
          if (
            rH >= 0x1 &&
            this[y1(0x6eb)] === 0x0 &&
            !this[y1(0x84d)] &&
            !this[y1(0x6b2)]
          )
            return rG;
          rG = hA(rG);
          this[y1(0x84d)] &&
            (rG = hy(
              rG,
              [0xff, 0xff, 0xff],
              0.85 + Math[y1(0x88e)](pP / 0x32) * 0.15
            ));
          this[y1(0x6eb)] > 0x0 &&
            (rG = hy(rG, [0x8f, 0x5d, 0xb0], 0x1 - this[y1(0x6eb)] * 0.75));
          rG = hy(rG, [0xff, 0x0, 0x0], rH * 0.25 + 0.75);
          if (this[y1(0x6b2)]) {
            if (!this[y1(0xc90)]) {
              let rI = pP / 0x4;
              if (!isNaN(this["id"])) rI += this["id"];
              this[y1(0xc90)] = lH(rI % 0x168, 0x64, 0x32);
            }
            rG = hy(rG, this[y1(0xc90)], 0.75);
          }
          return q1(rG);
        }
        [uv(0x7cb)](rG) {
          const y2 = uv;
          this[y2(0xc90)] = null;
          if (this[y2(0xc52)]) {
            const rH = Math[y2(0x88e)]((this[y2(0x722)] * Math["PI"]) / 0x2);
            if (!this[y2(0x317)]) {
              const rI = 0x1 + rH * 0x1;
              rG[y2(0x28b)](rI, rI);
            }
            rG[y2(0x58a)] *= 0x1 - rH;
          }
        }
        [uv(0xcb1)](rG, rH = !![], rI = 0x1) {
          const y3 = uv;
          rG[y3(0xa39)](),
            (rI = 0x8 * rI),
            rG[y3(0xb9f)](0x23, -rI),
            rG[y3(0x78e)](0x33, -0x2 - rI, 0x3c, -0xc - rI),
            rG[y3(0xcac)](0x23, -rI),
            rG[y3(0xb9f)](0x23, rI),
            rG[y3(0x78e)](0x33, 0x2 + rI, 0x3c, 0xc + rI),
            rG[y3(0xcac)](0x23, rI);
          const rJ = y3(0x16c);
          (rG[y3(0x6b8)] = rG[y3(0xc51)] =
            rH ? this[y3(0x9e3)](rJ) : y3(0x16c)),
            rG[y3(0xa06)](),
            (rG[y3(0xe0e)] = rG[y3(0xd10)] = y3(0x423)),
            (rG[y3(0xade)] = 0x4),
            rG[y3(0x8e6)]();
        }
        [uv(0xa15)](rG, rH, rI = 0x1) {
          const y4 = uv,
            rJ = (rH / 0x1e) * 1.1;
          rG[y4(0x28b)](rJ, rJ),
            rG[y4(0xa39)](),
            rG[y4(0xb9f)](-0x1e, -0x11),
            rG[y4(0xcac)](0x1e, 0x0),
            rG[y4(0xcac)](-0x1e, 0x11),
            rG[y4(0x765)](),
            (rG[y4(0x6b8)] = rG[y4(0xc51)] = this[y4(0x9e3)](y4(0x16c))),
            rG[y4(0xa06)](),
            (rG[y4(0xade)] = 0x14 * rI),
            (rG[y4(0xe0e)] = rG[y4(0xd10)] = y4(0x423)),
            rG[y4(0x8e6)]();
        }
        [uv(0x56f)](rG, rH = 0x0, rI = 0x0, rJ = 0x1, rK = 0x5) {
          const y5 = uv;
          rG[y5(0x884)](),
            rG[y5(0xe07)](rH, rI),
            rG[y5(0x28b)](rJ, rJ),
            rG[y5(0xa39)](),
            rG[y5(0xb9f)](0x23, -0x8),
            rG[y5(0x78e)](0x34, -5.5, 0x3c, -0x14),
            rG[y5(0xb9f)](0x23, 0x8),
            rG[y5(0x78e)](0x34, 5.5, 0x3c, 0x14),
            (rG[y5(0x6b8)] = rG[y5(0xc51)] = this[y5(0x9e3)](y5(0x16c))),
            (rG[y5(0xe0e)] = rG[y5(0xd10)] = y5(0x423)),
            (rG[y5(0xade)] = rK),
            rG[y5(0x8e6)](),
            rG[y5(0xa39)]();
          const rL = Math["PI"] * 0.165;
          rG[y5(0x4a4)](0x3c, -0x14, 0x7, 0x9, rL, 0x0, l0),
            rG[y5(0x4a4)](0x3c, 0x14, 0x7, 0x9, -rL, 0x0, l0),
            rG[y5(0xa06)](),
            rG[y5(0x915)]();
        }
      },
      lH = (rG, rH, rI) => {
        const y6 = uv;
        (rH /= 0x64), (rI /= 0x64);
        const rJ = (rM) => (rM + rG / 0x1e) % 0xc,
          rK = rH * Math[y6(0x77f)](rI, 0x1 - rI),
          rL = (rM) =>
            rI -
            rK *
              Math[y6(0xb8e)](
                -0x1,
                Math[y6(0x77f)](
                  rJ(rM) - 0x3,
                  Math[y6(0x77f)](0x9 - rJ(rM), 0x1)
                )
              );
        return [0xff * rL(0x0), 0xff * rL(0x8), 0xff * rL(0x4)];
      };
    function lI(rG) {
      const y7 = uv;
      return -(Math[y7(0xe44)](Math["PI"] * rG) - 0x1) / 0x2;
    }
    function lJ(rG, rH, rI = 0x6, rJ = uv(0x46d)) {
      const y8 = uv,
        rK = rH / 0x64;
      rG[y8(0x28b)](rK, rK), rG[y8(0xa39)]();
      for (let rL = 0x0; rL < 0xc; rL++) {
        rG[y8(0xb9f)](0x0, 0x0);
        const rM = (rL / 0xc) * Math["PI"] * 0x2;
        rG[y8(0xcac)](Math[y8(0xe44)](rM) * 0x64, Math[y8(0x88e)](rM) * 0x64);
      }
      (rG[y8(0xade)] = rI),
        (rG[y8(0x6b8)] = rG[y8(0xc51)] = rJ),
        (rG[y8(0xe0e)] = rG[y8(0xd10)] = y8(0x423));
      for (let rN = 0x0; rN < 0x5; rN++) {
        const rO = (rN / 0x5) * 0x64 + 0xa;
        lb(rG, 0xc, rO, 0.5, 0.85);
      }
      rG[y8(0x8e6)]();
    }
    var lK = class {
        constructor(rG, rH, rI, rJ, rK) {
          const y9 = uv;
          (this[y9(0x8fa)] = rG),
            (this["id"] = rH),
            (this["x"] = rI),
            (this["y"] = rJ),
            (this[y9(0x3aa)] = rK),
            (this[y9(0x582)] = Math[y9(0xbf6)]() * l0),
            (this[y9(0xb53)] = -0x1),
            (this[y9(0xc52)] = ![]),
            (this[y9(0x363)] = 0x0),
            (this[y9(0x722)] = 0x0),
            (this[y9(0x609)] = !![]),
            (this[y9(0x7ba)] = 0x0),
            (this[y9(0xafc)] = !![]);
        }
        [uv(0xbce)]() {
          const ya = uv;
          if (this[ya(0x363)] < 0x1) {
            this[ya(0x363)] += pQ / 0xc8;
            if (this[ya(0x363)] > 0x1) this[ya(0x363)] = 0x1;
          }
          this[ya(0xc52)] && (this[ya(0x722)] += pQ / 0xc8);
        }
        [uv(0x93f)](rG) {
          const yb = uv;
          rG[yb(0x884)](), rG[yb(0xe07)](this["x"], this["y"]);
          if (this[yb(0x8fa)] === cS[yb(0xd95)]) {
            rG[yb(0x9c0)](this[yb(0x582)]);
            const rH = this[yb(0x3aa)],
              rI = pG(
                rG,
                yb(0xd2c) + this[yb(0x3aa)],
                rH * 2.2,
                rH * 2.2,
                (rK) => {
                  const yc = yb;
                  rK[yc(0xe07)](rH * 1.1, rH * 1.1), lJ(rK, rH);
                },
                !![]
              ),
              rJ = this[yb(0x363)] + this[yb(0x722)] * 0.5;
            (rG[yb(0x58a)] = (0x1 - this[yb(0x722)]) * 0.3),
              rG[yb(0x28b)](rJ, rJ),
              rG[yb(0x6b3)](
                rI,
                -rI[yb(0x4f6)] / 0x2,
                -rI[yb(0x4f3)] / 0x2,
                rI[yb(0x4f6)],
                rI[yb(0x4f3)]
              );
          } else {
            if (this[yb(0x8fa)] === cS[yb(0x9a8)]) {
              let rK = this[yb(0x363)] + this[yb(0x722)] * 0.5;
              (rG[yb(0x58a)] = 0x1 - this[yb(0x722)]), (rG[yb(0x58a)] *= 0.9);
              const rL =
                0.93 +
                0.07 *
                  (Math[yb(0x88e)](
                    Date[yb(0xd3f)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              rK *= rL;
              const rM = this[yb(0x3aa)],
                rN = pG(
                  rG,
                  yb(0x3f1) + this[yb(0x3aa)],
                  rM * 2.2,
                  rM * 2.2,
                  (rO) => {
                    const yd = yb;
                    rO[yd(0xe07)](rM * 1.1, rM * 1.1);
                    const rP = rM / 0x64;
                    rO[yd(0x28b)](rP, rP),
                      lE(rO, 0x5c),
                      (rO[yd(0xd10)] = rO[yd(0xe0e)] = yd(0x423)),
                      (rO[yd(0xade)] = 0x28),
                      (rO[yd(0xc51)] = yd(0x4b7)),
                      rO[yd(0x8e6)](),
                      (rO[yd(0x6b8)] = yd(0x61e)),
                      (rO[yd(0xc51)] = yd(0x8cb)),
                      (rO[yd(0xade)] = 0xe),
                      rO[yd(0xa06)](),
                      rO[yd(0x8e6)]();
                  },
                  !![]
                );
              rG[yb(0x28b)](rK, rK),
                rG[yb(0x6b3)](
                  rN,
                  -rN[yb(0x4f6)] / 0x2,
                  -rN[yb(0x4f3)] / 0x2,
                  rN[yb(0x4f6)],
                  rN[yb(0x4f3)]
                );
            } else {
              if (this[yb(0x8fa)] === cS[yb(0x856)]) {
                rG[yb(0x627)](this[yb(0x3aa)] / 0x32),
                  (rG[yb(0xd10)] = yb(0x423)),
                  rG[yb(0x884)](),
                  (this[yb(0x7ba)] +=
                    ((this[yb(0xb53)] >= 0x0 ? 0x1 : -0x1) * pQ) / 0x12c),
                  (this[yb(0x7ba)] = Math[yb(0x77f)](
                    0x1,
                    Math[yb(0xb8e)](0x0, this[yb(0x7ba)])
                  ));
                if (this[yb(0x7ba)] > 0x0) {
                  rG[yb(0x627)](this[yb(0x7ba)]),
                    (rG[yb(0x58a)] *= this[yb(0x7ba)]),
                    (rG[yb(0xade)] = 0.1),
                    (rG[yb(0xc51)] = rG[yb(0x6b8)] = yb(0x6b5)),
                    (rG[yb(0xd24)] = yb(0x9c4)),
                    (rG[yb(0xa00)] = yb(0x2d5) + iA);
                  const rP = yb(0xb70) + (this[yb(0xb53)] + 0x1);
                  lR(
                    rG,
                    rP,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rP[yb(0xd55)] * 0.09),
                    !![]
                  );
                }
                rG[yb(0x915)]();
                const rO = this[yb(0xd2d)]
                  ? 0.6
                  : ((this["id"] + Date[yb(0xd3f)]()) / 0x4b0) % 6.28;
                rG[yb(0x884)]();
                for (let rQ = 0x0; rQ < 0x8; rQ++) {
                  const rR = 0x1 - rQ / 0x8,
                    rS = rR * 0x50;
                  rG[yb(0x9c0)](rO),
                    (rG[yb(0xc51)] = yb(0x630)),
                    rG[yb(0xa39)](),
                    rG[yb(0xb68)](-rS / 0x2, -rS / 0x2, rS, rS),
                    rG[yb(0x765)](),
                    (rG[yb(0xade)] = 0x28),
                    rG[yb(0x8e6)](),
                    (rG[yb(0xade)] = 0x14),
                    rG[yb(0x8e6)]();
                }
                rG[yb(0x915)]();
                if (!this[yb(0x951)]) {
                  this[yb(0x951)] = [];
                  for (let rT = 0x0; rT < 0x1e; rT++) {
                    this[yb(0x951)][yb(0xe68)]({
                      x: Math[yb(0xbf6)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rU = 0x0; rU < this[yb(0x951)][yb(0xd55)]; rU++) {
                  const rV = this[yb(0x951)][rU];
                  (rV["x"] += rV["v"]),
                    rV["x"] > 0x1 &&
                      ((rV["x"] %= 0x1),
                      (rV[yb(0x582)] = Math[yb(0xbf6)]() * 6.28),
                      (rV["v"] = Math[yb(0xbf6)]() * 0.005 + 0.008),
                      (rV["s"] = Math[yb(0xbf6)]() * 0.025 + 0.008)),
                    rG[yb(0x884)](),
                    (rG[yb(0x58a)] =
                      rV["x"] < 0.2
                        ? rV["x"] / 0.2
                        : rV["x"] > 0.8
                        ? 0x1 - (rV["x"] - 0.8) / 0.2
                        : 0x1),
                    rG[yb(0x28b)](0x5a, 0x5a),
                    rG[yb(0x9c0)](rV[yb(0x582)]),
                    rG[yb(0xe07)](rV["x"], 0x0),
                    rG[yb(0xa39)](),
                    rG[yb(0xce9)](0x0, 0x0, rV["s"], 0x0, Math["PI"] * 0x2),
                    (rG[yb(0x6b8)] = yb(0x6b5)),
                    rG[yb(0xa06)](),
                    rG[yb(0x915)]();
                }
              }
            }
          }
          rG[yb(0x915)]();
        }
      },
      lL = 0x0,
      lM = 0x0,
      lN = class extends lK {
        constructor(rG, rH, rI, rJ) {
          const ye = uv;
          super(cS[ye(0xa19)], rG, rH, rI, 0x46),
            (this[ye(0x582)] = (Math[ye(0xbf6)]() * 0x2 - 0x1) * 0.2),
            (this[ye(0x6d2)] = dC[rJ]);
        }
        [uv(0xbce)]() {
          const yf = uv;
          if (this[yf(0x363)] < 0x2 || pP - lL < 0x9c4) {
            this[yf(0x363)] += pQ / 0x12c;
            return;
          }
          this[yf(0xc52)] && (this[yf(0x722)] += pQ / 0xc8),
            this[yf(0x70a)] &&
              ((this["x"] = pw(this["x"], this[yf(0x70a)]["x"], 0xc8)),
              (this["y"] = pw(this["y"], this[yf(0x70a)]["y"], 0xc8)));
        }
        [uv(0x93f)](rG) {
          const yg = uv;
          if (this[yg(0x363)] === 0x0) return;
          rG[yg(0x884)](), rG[yg(0xe07)](this["x"], this["y"]);
          const rH = yg(0xe21) + this[yg(0x6d2)]["id"];
          let rI =
            (this[yg(0xdd5)] || lM < 0x3) &&
            pG(
              rG,
              rH,
              0x78,
              0x78,
              (rL) => {
                const yh = yg;
                (this[yh(0xdd5)] = !![]),
                  lM++,
                  rL[yh(0xe07)](0x3c, 0x3c),
                  (rL[yh(0xe0e)] = rL[yh(0xd10)] = yh(0x423)),
                  rL[yh(0xa39)](),
                  rL[yh(0xb68)](-0x32, -0x32, 0x64, 0x64),
                  (rL[yh(0xade)] = 0x12),
                  (rL[yh(0xc51)] = yh(0x313)),
                  rL[yh(0x8e6)](),
                  (rL[yh(0xade)] = 0x8),
                  (rL[yh(0x6b8)] = hQ[this[yh(0x6d2)][yh(0x2a3)]]),
                  rL[yh(0xa06)](),
                  (rL[yh(0xc51)] = hR[this[yh(0x6d2)][yh(0x2a3)]]),
                  rL[yh(0x8e6)]();
                const rM = pJ(
                  rL,
                  this[yh(0x6d2)][yh(0xd8e)],
                  0x12,
                  yh(0x46d),
                  0x3,
                  !![]
                );
                rL[yh(0x6b3)](
                  rM,
                  -rM[yh(0x4f6)] / 0x2,
                  0x32 - 0xd / 0x2 - rM[yh(0x4f3)],
                  rM[yh(0x4f6)],
                  rM[yh(0x4f3)]
                ),
                  rL[yh(0x884)](),
                  rL[yh(0xe07)](
                    0x0 + this[yh(0x6d2)][yh(0xdf8)],
                    -0x5 + this[yh(0x6d2)][yh(0x7f9)]
                  ),
                  this[yh(0x6d2)][yh(0x78b)](rL),
                  rL[yh(0x915)]();
              },
              !![]
            );
          if (!rI) rI = pF[rH];
          rG[yg(0x9c0)](this[yg(0x582)]);
          const rJ = Math[yg(0x77f)](this[yg(0x363)], 0x1),
            rK =
              (this[yg(0x3aa)] / 0x64) *
              (0x1 +
                Math[yg(0x88e)](Date[yg(0xd3f)]() / 0xfa + this["id"]) * 0.05) *
              rJ *
              (0x1 - this[yg(0x722)]);
          rG[yg(0x28b)](rK, rK),
            rG[yg(0x9c0)](Math["PI"] * lI(0x1 - rJ)),
            rI
              ? rG[yg(0x6b3)](
                  rI,
                  -rI[yg(0x4f6)] / 0x2,
                  -rI[yg(0x4f3)] / 0x2,
                  rI[yg(0x4f6)],
                  rI[yg(0x4f3)]
                )
              : (rG[yg(0xa39)](),
                rG[yg(0xb68)](-0x3c, -0x3c, 0x78, 0x78),
                (rG[yg(0x6b8)] = hQ[this[yg(0x6d2)][yg(0x2a3)]]),
                rG[yg(0xa06)]()),
            rG[yg(0x915)]();
        }
      };
    function lO(rG) {
      const yi = uv;
      rG[yi(0xa39)](),
        rG[yi(0xb9f)](0x0, 4.5),
        rG[yi(0x78e)](3.75, 0x0, 0x0, -4.5),
        rG[yi(0x78e)](-3.75, 0x0, 0x0, 4.5),
        rG[yi(0x765)](),
        (rG[yi(0xe0e)] = rG[yi(0xd10)] = yi(0x423)),
        (rG[yi(0x6b8)] = rG[yi(0xc51)] = yi(0x41c)),
        (rG[yi(0xade)] = 0x1),
        rG[yi(0x8e6)](),
        rG[yi(0xa06)](),
        rG[yi(0x9be)](),
        rG[yi(0xa39)](),
        rG[yi(0xce9)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, l0),
        (rG[yi(0x6b8)] = yi(0xaef)),
        rG[yi(0xa06)]();
    }
    function lP(rG, rH = ![]) {
      const yj = uv;
      lQ(rG, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lQ(rG, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rH) {
        const rI = Math["PI"] / 0x7;
        rG[yj(0xa39)](),
          rG[yj(0xce9)](0x0, 0x0, 23.5, Math["PI"] + rI, Math["PI"] * 0x2 - rI),
          (rG[yj(0xc51)] = yj(0x1f0)),
          (rG[yj(0xade)] = 0x4),
          (rG[yj(0xe0e)] = yj(0x423)),
          rG[yj(0x8e6)]();
      }
    }
    function lQ(rG, rH, rI) {
      const yk = uv;
      rG[yk(0x884)](),
        rG[yk(0x9c0)](rH),
        rG[yk(0xe07)](0x0, -23.6),
        rG[yk(0x9c0)](rI),
        rG[yk(0xa39)](),
        rG[yk(0xb9f)](-6.5, 0x1),
        rG[yk(0xcac)](0x0, -0xf),
        rG[yk(0xcac)](6.5, 0x1),
        (rG[yk(0x6b8)] = yk(0xa61)),
        (rG[yk(0xade)] = 3.5),
        rG[yk(0xa06)](),
        (rG[yk(0xd10)] = yk(0x423)),
        (rG[yk(0xc51)] = yk(0x1f0)),
        rG[yk(0x8e6)](),
        rG[yk(0x915)]();
    }
    function lR(rG, rH, rI, rJ, rK, rL, rM = ![]) {
      const yl = uv;
      var rN = rH[yl(0xd55)],
        rO;
      rG[yl(0x884)](),
        rG[yl(0xe07)](rI, rJ),
        rG[yl(0x9c0)]((0x1 * rL) / 0x2),
        rG[yl(0x9c0)]((0x1 * (rL / rN)) / 0x2),
        (rG[yl(0xd42)] = yl(0x8ed));
      for (var rP = 0x0; rP < rN; rP++) {
        rG[yl(0x9c0)](-rL / rN),
          rG[yl(0x884)](),
          rG[yl(0xe07)](0x0, rK),
          (rO = rH[rP]),
          rM && rG[yl(0x21f)](rO, 0x0, 0x0),
          rG[yl(0x790)](rO, 0x0, 0x0),
          rG[yl(0x915)]();
      }
      rG[yl(0x915)]();
    }
    function lS(rG, rH = 0x1) {
      const ym = uv,
        rI = 0xf;
      rG[ym(0xa39)]();
      const rJ = 0x6;
      for (let rO = 0x0; rO < rJ; rO++) {
        const rP = (rO / rJ) * Math["PI"] * 0x2;
        rG[ym(0xcac)](Math[ym(0xe44)](rP) * rI, Math[ym(0x88e)](rP) * rI);
      }
      rG[ym(0x765)](),
        (rG[ym(0xade)] = 0x4),
        (rG[ym(0xc51)] = ym(0x78f)),
        rG[ym(0x8e6)](),
        (rG[ym(0x6b8)] = ym(0xc3e)),
        rG[ym(0xa06)]();
      const rK = (Math["PI"] * 0x2) / rJ,
        rL = Math[ym(0xe44)](rK) * rI,
        rM = Math[ym(0x88e)](rK) * rI;
      for (let rQ = 0x0; rQ < rJ; rQ++) {
        rG[ym(0xa39)](),
          rG[ym(0xb9f)](0x0, 0x0),
          rG[ym(0xcac)](rI, 0x0),
          rG[ym(0xcac)](rL, rM),
          rG[ym(0x765)](),
          (rG[ym(0x6b8)] =
            ym(0xb1e) + (0.2 + (((rQ + 0x4) % rJ) / rJ) * 0.35) + ")"),
          rG[ym(0xa06)](),
          rG[ym(0x9c0)](rK);
      }
      rG[ym(0xa39)]();
      const rN = rI * 0.65;
      for (let rR = 0x0; rR < rJ; rR++) {
        const rS = (rR / rJ) * Math["PI"] * 0x2;
        rG[ym(0xcac)](Math[ym(0xe44)](rS) * rN, Math[ym(0x88e)](rS) * rN);
      }
      (rG[ym(0x1c5)] = 0x23 + rH * 0xf),
        (rG[ym(0xbd2)] = rG[ym(0x6b8)] = ym(0x988)),
        rG[ym(0xa06)](),
        rG[ym(0xa06)](),
        rG[ym(0xa06)]();
    }
    var lT = class extends lG {
        constructor(rG, rH, rI, rJ, rK, rL, rM) {
          const yn = uv;
          super(rG, cS[yn(0x684)], rH, rI, rJ, rM, rK),
            (this[yn(0x8c9)] = rL),
            (this[yn(0x8f8)] = 0x0),
            (this[yn(0x4fb)] = 0x0),
            (this[yn(0x656)] = 0x0),
            (this[yn(0xd02)] = 0x0),
            (this[yn(0xa32)] = ""),
            (this[yn(0x8de)] = 0x0),
            (this[yn(0x263)] = !![]),
            (this[yn(0x586)] = ![]),
            (this[yn(0x366)] = ![]),
            (this[yn(0x7ea)] = ![]),
            (this[yn(0x74b)] = ![]),
            (this[yn(0xc05)] = ![]),
            (this[yn(0xab7)] = !![]),
            (this[yn(0x48a)] = 0x0),
            (this[yn(0x6b0)] = 0x0);
        }
        [uv(0xbce)]() {
          const yo = uv;
          super[yo(0xbce)]();
          if (this[yo(0xc52)]) (this[yo(0x4fb)] = 0x1), (this[yo(0x8f8)] = 0x0);
          else {
            const rG = pQ / 0xc8;
            let rH = this[yo(0x8c9)];
            if (this[yo(0x586)] && rH === cY[yo(0xdf2)]) rH = cY[yo(0x2a4)];
            (this[yo(0x8f8)] = Math[yo(0x77f)](
              0x1,
              Math[yo(0xb8e)](
                0x0,
                this[yo(0x8f8)] + (rH === cY[yo(0x4e4)] ? rG : -rG)
              )
            )),
              (this[yo(0x4fb)] = Math[yo(0x77f)](
                0x1,
                Math[yo(0xb8e)](
                  0x0,
                  this[yo(0x4fb)] + (rH === cY[yo(0x2a4)] ? rG : -rG)
                )
              )),
              (this[yo(0x48a)] = pw(this[yo(0x48a)], this[yo(0x6b0)], 0x64));
          }
        }
        [uv(0x93f)](rG) {
          const yp = uv;
          rG[yp(0x884)](), rG[yp(0xe07)](this["x"], this["y"]);
          let rH = this[yp(0x3aa)] / kZ;
          this[yp(0xc52)] &&
            rG[yp(0x9c0)]((this[yp(0x722)] * Math["PI"]) / 0x4);
          rG[yp(0x28b)](rH, rH), this[yp(0x7cb)](rG);
          this[yp(0xb93)] &&
            (rG[yp(0x884)](),
            rG[yp(0x9c0)](this[yp(0x582)]),
            rG[yp(0x627)](this[yp(0x3aa)] / 0x28 / rH),
            this[yp(0x9c2)](rG),
            rG[yp(0x915)]());
          this[yp(0x71d)] &&
            (rG[yp(0x884)](),
            rG[yp(0x627)](kZ / 0x12),
            this[yp(0xc59)](rG, pP / 0x12c),
            rG[yp(0x915)]());
          const rI = yp(0x1f0);
          if (this[yp(0x479)]) {
            const rU = Date[yp(0xd3f)](),
              rV = (Math[yp(0x88e)](rU / 0x12c) * 0.5 + 0.5) * 0x2;
            rG[yp(0xa39)](),
              rG[yp(0xb9f)](0x5, -0x22),
              rG[yp(0x443)](0x2f, -0x19, 0x14, 0x5, 0x2b - rV, 0x19),
              rG[yp(0x78e)](0x0, 0x28 + rV * 0.6, -0x2b + rV, 0x19),
              rG[yp(0x443)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rG[yp(0x78e)](0x0, -0x23, 0x5, -0x22),
              (rG[yp(0x6b8)] = rI),
              rG[yp(0xa06)]();
          }
          this[yp(0xc05)] && lP(rG);
          const rJ = {};
          rJ[yp(0x2a6)] = [yp(0xd99), yp(0xa9b)];
          const rK = rJ,
            rL = this[yp(0x74b)]
              ? [yp(0x507), yp(0x16c)]
              : this[yp(0x870)]
              ? [yp(0x34d), yp(0xd49)]
              : rK[this[yp(0x45e)]] || [yp(0xc4d), yp(0x95c)];
          (rL[0x0] = this[yp(0x9e3)](rL[0x0])),
            (rL[0x1] = this[yp(0x9e3)](rL[0x1]));
          let rM = 2.75;
          !this[yp(0x870)] && (rM /= rH);
          (rG[yp(0x6b8)] = rL[0x0]),
            (rG[yp(0xade)] = rM),
            (rG[yp(0xc51)] = rL[0x1]);
          this[yp(0x870)] &&
            (rG[yp(0xa39)](),
            rG[yp(0xb9f)](0x0, 0x0),
            rG[yp(0x78e)](-0x1e, 0xf, -0x1e, 0x1e),
            rG[yp(0x78e)](0x0, 0x37, 0x1e, 0x1e),
            rG[yp(0x78e)](0x1e, 0xf, 0x0, 0x0),
            rG[yp(0xa06)](),
            rG[yp(0x8e6)](),
            rG[yp(0x884)](),
            (rG[yp(0x6b8)] = rG[yp(0xc51)]),
            (rG[yp(0xd24)] = yp(0x9c4)),
            (rG[yp(0xa00)] = yp(0xb8f) + iA),
            lR(rG, yp(0xa3b), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rG[yp(0x915)]());
          rG[yp(0xa39)]();
          this[yp(0x621)]
            ? !this[yp(0x479)]
              ? rG[yp(0xb68)](-0x19, -0x19, 0x32, 0x32)
              : (rG[yp(0xb9f)](0x19, 0x19),
                rG[yp(0xcac)](-0x19, 0x19),
                rG[yp(0xcac)](-0x19, -0xa),
                rG[yp(0xcac)](-0xa, -0x19),
                rG[yp(0xcac)](0xa, -0x19),
                rG[yp(0xcac)](0x19, -0xa),
                rG[yp(0x765)]())
            : rG[yp(0xce9)](0x0, 0x0, kZ, 0x0, l0);
          rG[yp(0xa06)](), rG[yp(0x8e6)]();
          this[yp(0x4f4)] &&
            (rG[yp(0x884)](),
            rG[yp(0x9be)](),
            rG[yp(0xa39)](),
            !this[yp(0x479)] &&
              (rG[yp(0xb9f)](-0x8, -0x1e),
              rG[yp(0xcac)](0xf, -0x7),
              rG[yp(0xcac)](0x1e, -0x14),
              rG[yp(0xcac)](0x1e, -0x32)),
            rG[yp(0xe07)](
              0x0,
              0x2 * (0x1 - (this[yp(0x4fb)] + this[yp(0x8f8)]))
            ),
            rG[yp(0xb9f)](-0x2, 0x0),
            rG[yp(0xcac)](-0x3, 4.5),
            rG[yp(0xcac)](0x3, 4.5),
            rG[yp(0xcac)](0x2, 0x0),
            (rG[yp(0x6b8)] = yp(0x41c)),
            rG[yp(0xa06)](),
            rG[yp(0x915)]());
          this[yp(0x479)] &&
            (rG[yp(0xa39)](),
            rG[yp(0xb9f)](0x0, -0x17),
            rG[yp(0x78e)](0x4, -0xd, 0x1b, -0x8),
            rG[yp(0xcac)](0x14, -0x1c),
            rG[yp(0xcac)](-0x14, -0x1c),
            rG[yp(0xcac)](-0x1b, -0x8),
            rG[yp(0x78e)](-0x4, -0xd, 0x0, -0x17),
            (rG[yp(0x6b8)] = rI),
            rG[yp(0xa06)]());
          if (this[yp(0x84b)]) {
            (rG[yp(0xc51)] = yp(0x11d)),
              (rG[yp(0xade)] = 1.4),
              rG[yp(0xa39)](),
              (rG[yp(0xe0e)] = yp(0x423));
            const rW = 4.5;
            for (let rX = 0x0; rX < 0x2; rX++) {
              const rY = -0x12 + rX * 0x1d;
              for (let rZ = 0x0; rZ < 0x3; rZ++) {
                const s0 = rY + rZ * 0x3;
                rG[yp(0xb9f)](s0, rW + -1.5), rG[yp(0xcac)](s0 + 1.6, rW + 1.6);
              }
            }
            rG[yp(0x8e6)]();
          }
          if (this[yp(0xce2)]) {
            rG[yp(0xa39)](),
              rG[yp(0xce9)](0x0, 2.5, 3.3, 0x0, l0),
              (rG[yp(0x6b8)] = yp(0x192)),
              rG[yp(0xa06)](),
              rG[yp(0xa39)](),
              rG[yp(0xce9)](0xd, 2.8, 5.5, 0x0, l0),
              rG[yp(0xce9)](-0xd, 2.8, 5.5, 0x0, l0),
              (rG[yp(0x6b8)] = yp(0x7bf)),
              rG[yp(0xa06)](),
              rG[yp(0x884)](),
              rG[yp(0x9c0)](-Math["PI"] / 0x4),
              rG[yp(0xa39)]();
            const s1 = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[yp(0x621)] &&
              s1[yp(0x275)]((s2) => {
                (s2[0x0] *= 1.1), (s2[0x1] *= 1.1);
              });
            for (let s2 = 0x0; s2 < 0x2; s2++) {
              for (let s3 = 0x0; s3 < s1[yp(0xd55)]; s3++) {
                const s4 = s1[s3];
                rG[yp(0xb9f)](s4[0x0], s4[0x1]), rG[yp(0xce9)](...s4, 0x0, l0);
              }
              rG[yp(0x9c0)](-Math["PI"] / 0x2);
            }
            (rG[yp(0x6b8)] = yp(0x112)), rG[yp(0xa06)](), rG[yp(0x915)]();
          }
          const rN = this[yp(0x8f8)],
            rO = this[yp(0x4fb)],
            rP = 0x6 * rN,
            rQ = 0x4 * rO;
          function rR(s5, s6) {
            const yq = yp;
            rG[yq(0xa39)]();
            const s7 = 3.25;
            rG[yq(0xb9f)](s5 - s7, s6 - s7),
              rG[yq(0xcac)](s5 + s7, s6 + s7),
              rG[yq(0xb9f)](s5 + s7, s6 - s7),
              rG[yq(0xcac)](s5 - s7, s6 + s7),
              (rG[yq(0xade)] = 0x2),
              (rG[yq(0xe0e)] = yq(0x423)),
              (rG[yq(0xc51)] = yq(0x41c)),
              rG[yq(0x8e6)](),
              rG[yq(0x765)]();
          }
          function rS(s5, s6) {
            const yr = yp;
            rG[yr(0x884)](),
              rG[yr(0xe07)](s5, s6),
              rG[yr(0xa39)](),
              rG[yr(0xb9f)](-0x4, 0x0),
              rG[yr(0x78e)](0x0, 0x6, 0x4, 0x0),
              (rG[yr(0xade)] = 0x2),
              (rG[yr(0xe0e)] = yr(0x423)),
              (rG[yr(0xc51)] = yr(0x41c)),
              rG[yr(0x8e6)](),
              rG[yr(0x915)]();
          }
          if (this[yp(0xc52)]) rR(0x7, -0x5), rR(-0x7, -0x5);
          else {
            if (this[yp(0x3b5)]) rS(0x7, -0x5), rS(-0x7, -0x5);
            else {
              let s5 = function (s7, s8, s9, sa, sb = 0x0) {
                  const ys = yp,
                    sc = sb ^ 0x1;
                  rG[ys(0xb9f)](s7 - s9, s8 - sa + sb * rP + sc * rQ),
                    rG[ys(0xcac)](s7 + s9, s8 - sa + sc * rP + sb * rQ),
                    rG[ys(0xcac)](s7 + s9, s8 + sa),
                    rG[ys(0xcac)](s7 - s9, s8 + sa),
                    rG[ys(0xcac)](s7 - s9, s8 - sa);
                },
                s6 = function (s7 = 0x0) {
                  const yt = yp;
                  rG[yt(0xa39)](),
                    rG[yt(0x4a4)](0x7, -0x5, 2.5 + s7, 0x6 + s7, 0x0, 0x0, l0),
                    rG[yt(0xb9f)](-0x7, -0x5),
                    rG[yt(0x4a4)](-0x7, -0x5, 2.5 + s7, 0x6 + s7, 0x0, 0x0, l0),
                    (rG[yt(0xc51)] = rG[yt(0x6b8)] = yt(0x41c)),
                    rG[yt(0xa06)]();
                };
              rG[yp(0x884)](),
                rG[yp(0xa39)](),
                s5(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                s5(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rG[yp(0x9be)](),
                s6(0.7),
                s6(0x0),
                rG[yp(0x9be)](),
                rG[yp(0xa39)](),
                rG[yp(0xce9)](
                  0x7 + this[yp(0x656)] * 0x2,
                  -0x5 + this[yp(0xd02)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                rG[yp(0xb9f)](-0x7, -0x5),
                rG[yp(0xce9)](
                  -0x7 + this[yp(0x656)] * 0x2,
                  -0x5 + this[yp(0xd02)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                (rG[yp(0x6b8)] = yp(0xaef)),
                rG[yp(0xa06)](),
                rG[yp(0x915)]();
            }
          }
          if (this[yp(0x7ea)]) {
            rG[yp(0x884)](), rG[yp(0xe07)](0x0, -0xc);
            if (this[yp(0xc52)]) rG[yp(0x28b)](0.7, 0.7), rR(0x0, -0x3);
            else
              this[yp(0x3b5)]
                ? (rG[yp(0x28b)](0.7, 0.7), rS(0x0, -0x3))
                : lO(rG);
            rG[yp(0x915)]();
          }
          this[yp(0x366)] &&
            (rG[yp(0x884)](),
            rG[yp(0xe07)](0x0, 0xa),
            rG[yp(0x9c0)](-Math["PI"] / 0x2),
            rG[yp(0x28b)](0.82, 0.82),
            this[yp(0xcb1)](rG, ![], 0.85),
            rG[yp(0x915)]());
          const rT = rN * (-0x5 - 5.5) + rO * (-0x5 - 0x4);
          rG[yp(0x884)](),
            rG[yp(0xa39)](),
            rG[yp(0xe07)](0x0, 9.5),
            rG[yp(0xb9f)](-5.6, 0x0),
            rG[yp(0x78e)](0x0, 0x5 + rT, 5.6, 0x0),
            (rG[yp(0xe0e)] = yp(0x423));
          this[yp(0xce2)]
            ? ((rG[yp(0xade)] = 0x7),
              (rG[yp(0xc51)] = yp(0x192)),
              rG[yp(0x8e6)](),
              (rG[yp(0xc51)] = yp(0x87c)))
            : (rG[yp(0xc51)] = yp(0x41c));
          (rG[yp(0xade)] = 1.75), rG[yp(0x8e6)](), rG[yp(0x915)]();
          if (this[yp(0xd77)]) {
            const s7 = this[yp(0x8f8)],
              s8 = 0x28,
              s9 = Date[yp(0xd3f)]() / 0x12c,
              sa = this[yp(0x870)] ? 0x0 : Math[yp(0x88e)](s9) * 0.5 + 0.5,
              sb = sa * 0x4,
              sc = 0x28 - sa * 0x4,
              se = sc - (this[yp(0x870)] ? 0x1 : jf(s7)) * 0x50,
              sf = this[yp(0x4f4)];
            (rG[yp(0xade)] = 0x9 + rM * 0x2),
              (rG[yp(0xd10)] = yp(0x423)),
              (rG[yp(0xe0e)] = yp(0x423));
            for (let sg = 0x0; sg < 0x2; sg++) {
              rG[yp(0xa39)](), rG[yp(0x884)]();
              for (let sh = 0x0; sh < 0x2; sh++) {
                rG[yp(0xb9f)](0x19, 0x0);
                let si = se;
                sf && sh === 0x0 && (si = sc),
                  rG[yp(0x78e)](0x2d + sb, si * 0.5, 0xb, si),
                  rG[yp(0x28b)](-0x1, 0x1);
              }
              rG[yp(0x915)](),
                (rG[yp(0xc51)] = rL[0x1 - sg]),
                rG[yp(0x8e6)](),
                (rG[yp(0xade)] = 0x9);
            }
            rG[yp(0x884)](),
              rG[yp(0xe07)](0x0, se),
              lS(rG, sa),
              rG[yp(0x915)]();
          }
          rG[yp(0x915)]();
        }
        [uv(0xafe)](rG, rH) {}
        [uv(0x3e0)](rG, rH = 0x1) {
          const yu = uv,
            rI = nj[this["id"]];
          if (!rI) return;
          for (let rJ = 0x0; rJ < rI[yu(0xd55)]; rJ++) {
            const rK = rI[rJ];
            if (rK["t"] > lV + lW) continue;
            !rK["x"] &&
              ((rK["x"] = this["x"]),
              (rK["y"] = this["y"] - this[yu(0x3aa)] - 0x44),
              (rK[yu(0x26b)] = this["x"]),
              (rK[yu(0x8d4)] = this["y"]));
            const rL = rK["t"] > lV ? 0x1 - (rK["t"] - lV) / lW : 0x1,
              rM = rL * rL * rL;
            (rK["x"] += (this["x"] - rK[yu(0x26b)]) * rM),
              (rK["y"] += (this["y"] - rK[yu(0x8d4)]) * rM),
              (rK[yu(0x26b)] = this["x"]),
              (rK[yu(0x8d4)] = this["y"]);
            const rN = Math[yu(0x77f)](0x1, rK["t"] / 0x64);
            rG[yu(0x884)](),
              (rG[yu(0x58a)] = (rL < 0.7 ? rL / 0.7 : 0x1) * rN * 0.9),
              rG[yu(0xe07)](rK["x"], rK["y"] - (rK["t"] / lV) * 0x14),
              rG[yu(0x627)](rH);
            const rO = pJ(rG, rK[yu(0x9d5)], 0x10, yu(0x2f0), 0x0, !![], ![]);
            rG[yu(0x627)](rN), rG[yu(0xa39)]();
            const rP = rO[yu(0x4f6)] + 0xa,
              rQ = rO[yu(0x4f3)] + 0xf;
            rG[yu(0xce0)]
              ? rG[yu(0xce0)](-rP / 0x2, -rQ / 0x2, rP, rQ, 0x5)
              : rG[yu(0xb68)](-rP / 0x2, -rQ / 0x2, rP, rQ),
              (rG[yu(0x6b8)] = rK[yu(0x204)]),
              rG[yu(0xa06)](),
              (rG[yu(0xc51)] = yu(0x2f0)),
              (rG[yu(0xade)] = 1.5),
              rG[yu(0x8e6)](),
              rG[yu(0x6b3)](
                rO,
                -rO[yu(0x4f6)] / 0x2,
                -rO[yu(0x4f3)] / 0x2,
                rO[yu(0x4f6)],
                rO[yu(0x4f3)]
              ),
              rG[yu(0x915)]();
          }
        }
      },
      lU = 0x4e20,
      lV = 0xfa0,
      lW = 0xbb8,
      lX = lV + lW;
    function lY(rG, rH, rI = 0x1) {
      const yv = uv;
      if (rG[yv(0xc52)]) return;
      rH[yv(0x884)](),
        rH[yv(0xe07)](rG["x"], rG["y"]),
        lZ(rG, rH, void 0x0, rI),
        rH[yv(0xe07)](0x0, -rG[yv(0x3aa)] - 0x19),
        rH[yv(0x884)](),
        rH[yv(0x627)](rI),
        rG[yv(0x45e)] &&
          (pJ(rH, "@" + rG[yv(0x45e)], 0xb, yv(0x8bd), 0x3),
          rH[yv(0xe07)](0x0, -0x10)),
        rG[yv(0xa32)] &&
          (pJ(rH, rG[yv(0xa32)], 0x12, yv(0x46d), 0x3),
          rH[yv(0xe07)](0x0, -0x5)),
        rH[yv(0x915)](),
        !rG[yv(0xab7)] &&
          rG[yv(0x989)] > 0.001 &&
          ((rH[yv(0x58a)] = rG[yv(0x989)]),
          rH[yv(0x28b)](rG[yv(0x989)] * 0x3, rG[yv(0x989)] * 0x3),
          rH[yv(0xa39)](),
          rH[yv(0xce9)](0x0, 0x0, 0x14, 0x0, l0),
          (rH[yv(0x6b8)] = yv(0x41c)),
          rH[yv(0xa06)](),
          nB(rH, 0.8),
          rH[yv(0xa39)](),
          rH[yv(0xce9)](0x0, 0x0, 0x14, 0x0, l0),
          (rH[yv(0x6b8)] = yv(0x13f)),
          rH[yv(0xa06)](),
          rH[yv(0xa39)](),
          rH[yv(0xb9f)](0x0, 0x0),
          rH[yv(0xce9)](0x0, 0x0, 0x10, 0x0, l0 * rG[yv(0x5eb)]),
          rH[yv(0xcac)](0x0, 0x0),
          rH[yv(0x9be)](),
          nB(rH, 0.8)),
        rH[yv(0x915)]();
    }
    function lZ(rG, rH, rI = ![], rJ = 0x1) {
      const yw = uv;
      if (rG[yw(0x3a6)] <= 0x0) return;
      rH[yw(0x884)](),
        (rH[yw(0x58a)] = rG[yw(0x3a6)]),
        (rH[yw(0xc51)] = yw(0x1f0)),
        rH[yw(0xa39)]();
      const rK = rI ? 0x8c : rG[yw(0xab7)] ? 0x4b : 0x64;
      let rL = rI ? 0x1a : 0x9;
      const rM = !rI && pb[yw(0xe0d)];
      rM && (rL += 0x14);
      if (rI) rH[yw(0xe07)](rG[yw(0x3aa)] + 0x11, 0x0);
      else {
        if (rG[yw(0xab7)] ? pb[yw(0x4ef)] : pb[yw(0x958)])
          rH[yw(0xe07)](0x0, rG[yw(0x3aa)]),
            rH[yw(0x627)](rJ),
            rH[yw(0xe07)](-rK / 0x2, rL / 0x2 + 0x14);
        else {
          const rO = Math[yw(0xb8e)](0x1, rG[yw(0x3aa)] / 0x64);
          rH[yw(0x28b)](rO, rO),
            rH[yw(0xe07)](-rK / 0x2, rG[yw(0x3aa)] / rO + 0x1b);
        }
      }
      rH[yw(0xa39)](),
        rH[yw(0xb9f)](rI ? -0x14 : 0x0, 0x0),
        rH[yw(0xcac)](rK, 0x0),
        (rH[yw(0xe0e)] = yw(0x423)),
        (rH[yw(0xade)] = rL),
        (rH[yw(0xc51)] = yw(0x1f0)),
        rH[yw(0x8e6)]();
      function rN(rP) {
        const yx = yw;
        rH[yx(0x58a)] = rP < 0.05 ? rP / 0.05 : 0x1;
      }
      rG[yw(0xb99)] > 0x0 &&
        (rN(rG[yw(0xb99)]),
        rH[yw(0xa39)](),
        rH[yw(0xb9f)](0x0, 0x0),
        rH[yw(0xcac)](rG[yw(0xb99)] * rK, 0x0),
        (rH[yw(0xade)] = rL * (rI ? 0.55 : 0.44)),
        (rH[yw(0xc51)] = yw(0x908)),
        rH[yw(0x8e6)]());
      rG[yw(0x3cb)] > 0x0 &&
        (rN(rG[yw(0x3cb)]),
        rH[yw(0xa39)](),
        rH[yw(0xb9f)](0x0, 0x0),
        rH[yw(0xcac)](rG[yw(0x3cb)] * rK, 0x0),
        (rH[yw(0xade)] = rL * (rI ? 0.7 : 0.66)),
        (rH[yw(0xc51)] = yw(0xd30)),
        rH[yw(0x8e6)]());
      rG[yw(0x48a)] &&
        (rN(rG[yw(0x48a)]),
        rH[yw(0xa39)](),
        rH[yw(0xb9f)](0x0, 0x0),
        rH[yw(0xcac)](rG[yw(0x48a)] * rK, 0x0),
        (rH[yw(0xade)] = rL * (rI ? 0.45 : 0.35)),
        (rH[yw(0xc51)] = yw(0xdbd)),
        rH[yw(0x8e6)]());
      if (rG[yw(0xab7)]) {
        rH[yw(0x58a)] = 0x1;
        if(rG.username == hack.player.name) hack.player.entity = rG;
        var hp = Math.round(rG.health * hack.hp);
        var shield = Math.round(rG.shield * hack.hp);
        const rP = pJ(
          rH,
          (rG.username == hack.player.name ? `HP ${hp}${shield ? " + " + shield : ""} ` : '')+ yw(0x254) + (rG[yw(0x8de)] + 0x1),
          rI ? 0xc : 0xe,
          yw(0x46d),
          0x3,
          !![]
        );
        rH[yw(0x6b3)](
          rP,
          rK + rL / 0x2 - rP[yw(0x4f6)],
          rL / 0x2,
          rP[yw(0x4f6)],
          rP[yw(0x4f3)]
        );
        if (rI) {
          const rQ = pJ(rH, "@" + rG[yw(0x45e)], 0xc, yw(0x8bd), 0x3, !![]);
          rH[yw(0x6b3)](
            rQ,
            -rL / 0x2,
            -rL / 0x2 - rQ[yw(0x4f3)],
            rQ[yw(0x4f6)],
            rQ[yw(0x4f3)]
          );
        }
      } else {
        rH[yw(0x58a)] = 0x1;
        const rR = kc[rG[yw(0x8fa)]],
          rS = pJ(rH, rR, 0xe, yw(0x46d), 0x3, !![], rG[yw(0xe0a)]);
        rH[yw(0x884)](), rH[yw(0xe07)](0x0, -rL / 0x2 - rS[yw(0x4f3)]);
        rS[yw(0x4f6)] > rK + rL
          ? rH[yw(0x6b3)](
              rS,
              rK / 0x2 - rS[yw(0x4f6)] / 0x2,
              0x0,
              rS[yw(0x4f6)],
              rS[yw(0x4f3)]
            )
          : rH[yw(0x6b3)](rS, -rL / 0x2, 0x0, rS[yw(0x4f6)], rS[yw(0x4f3)]);
        rH[yw(0x915)]();
        const rT = pJ(rH, rG[yw(0xe0a)], 0xe, hP[rG[yw(0xe0a)]], 0x3, !![]);
        rH[yw(0x6b3)](
          rT,
          rK + rL / 0x2 - rT[yw(0x4f6)],
          rL / 0x2,
          rT[yw(0x4f6)],
          rT[yw(0x4f3)]
        );
        const genCanvas = pJ;
        const health = genCanvas(
          rH,
          `${Math.floor(rG['health'] * hack.getHP(rG))} (${Math.floor(rG['health'] * 100)}%)`,
          30,
          hack.getColor(rG),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) rH.drawImage(
          health,
          -60,
          -150,
          health.worldW,
          health.worldH
        );
        const health2 = genCanvas(
          rH,
          `/ ${hack.getHP(rG)} `,
          30,
          hack.getColor(rG),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) rH.drawImage(
          health2,
          -60,
          -120,
          health2.worldW,
          health2.worldH
        );
      }
      if (rM) {
        let rU = m0(rG[yw(0x3cb)]);
        rG[yw(0x48a)] > 0x0 && (rU += yw(0x880) + m0(rG[yw(0x48a)])),
          rH[yw(0x884)](),
          rH[yw(0xe07)](rK / 0x2, 0x0),
          pJ(
            rH,
            rU,
            0xe,
            yw(0x46d),
            0x3,
            void 0x0,
            (rG[yw(0xab7)] ? 0x1 : 0x0) +
              "_" +
              Math[yw(0xc8c)](rG[yw(0x3aa)] / 0x64)
          ),
          rH[yw(0x915)]();
      }
      rI &&
        rG[yw(0xa32)] &&
        ((rH[yw(0x58a)] = 0x1),
        rH[yw(0xe07)](rK / 0x2, 0x0),
        pJ(rH, rG[yw(0xa32)], 0x11, yw(0x46d), 0x3)),
        rH[yw(0x915)]();
    }
    function m0(rG) {
      const yy = uv,
        rH = {};
      return (rH[yy(0x8fd)] = 0x2), (rG * 0x64)[yy(0x2eb)](yy(0x490), rH) + "%";
    }
    function m1(rG) {
      const yz = uv;
      for (let rH in oF) {
        oF[rH][yz(0x8f2)](rG);
      }
      oY();
    }
    var m2 = {},
      m3 = document[uv(0x91c)](uv(0x4a8));
    mI(uv(0x1ad), uv(0x8a1), uv(0x6dc)),
      mI(uv(0x7b3), uv(0x4a8), uv(0x717)),
      mI(uv(0x701), uv(0xa05), uv(0x342), () => {
        const yA = uv;
        (hv = ![]), (hD[yA(0x342)] = fc);
      }),
      mI(uv(0x725), uv(0x2f4), uv(0x2f1)),
      mI(uv(0x9b5), uv(0x4e8), uv(0xac8)),
      mI(uv(0x5e3), uv(0xbeb), uv(0xe3d)),
      mI(uv(0x76e), uv(0x4d3), uv(0xc6c)),
      mI(uv(0xbc5), uv(0x633), uv(0x276)),
      mI(uv(0xc7d), uv(0x8e2), uv(0xd8d)),
      mI(uv(0xd26), uv(0x85f), "lb"),
      mI(uv(0xc61), uv(0xbee), uv(0x886)),
      mI(uv(0xbec), uv(0x575), uv(0x926), () => {
        const yB = uv;
        (mj[yB(0xa71)][yB(0x3c1)] = yB(0x846)), (hD[yB(0x926)] = mi);
      }),
      mI(uv(0x536), uv(0xb80), uv(0xa30), () => {
        const yC = uv;
        if (!hW) return;
        il(new Uint8Array([cI[yC(0x6ef)]]));
      });
    var m4 = document[uv(0x91c)](uv(0xaf1)),
      m5 = ![],
      m6 = null,
      m7 = nQ(uv(0x66b));
    setInterval(() => {
      m6 && m8();
    }, 0x3e8);
    function m8() {
      const yD = uv;
      k8(m7, yD(0x6a7) + ka(Date[yD(0xd3f)]() - m6[yD(0x9ff)]) + yD(0x7f8));
    }
    function m9(rG) {
      const yE = uv;
      document[yE(0xd97)][yE(0xdd8)][yE(0x1b1)](yE(0x3c5));
      const rH = nQ(
        yE(0x99a) +
          rG[yE(0x59d)] +
          yE(0x483) +
          rG[yE(0xa98)] +
          yE(0xda2) +
          (rG[yE(0x445)]
            ? yE(0x828) +
              rG[yE(0x445)] +
              "\x22\x20" +
              (rG[yE(0x991)] ? yE(0x2ba) + rG[yE(0x991)] + "\x22" : "") +
              yE(0xd5a)
            : "") +
          yE(0x2f6)
      );
      (r4 = rH),
        (rH[yE(0x8f2)] = function () {
          const yF = yE;
          document[yF(0xd97)][yF(0xdd8)][yF(0x2b0)](yF(0x3c5)),
            rH[yF(0x2b0)](),
            (r4 = null);
        }),
        (rH[yE(0x91c)](yE(0xd3e))[yE(0x81c)] = rH[yE(0x8f2)]);
      const rI = rH[yE(0x91c)](yE(0xe3a)),
        rJ = 0x14;
      rK(0x0);
      if (rG[yE(0xadf)][yE(0xd55)] > rJ) {
        const rL = nQ(yE(0x246));
        rH[yE(0x6c4)](rL);
        const rM = rL[yE(0x91c)](yE(0xdff)),
          rN = Math[yE(0x9f9)](rG[yE(0xadf)][yE(0xd55)] / rJ);
        for (let rQ = 0x0; rQ < rN; rQ++) {
          const rR = nQ(yE(0x7de) + rQ + yE(0x354) + (rQ + 0x1) + yE(0xba7));
          rM[yE(0x6c4)](rR);
        }
        rM[yE(0xc3b)] = function () {
          const yG = yE;
          rK(this[yG(0x2e6)]);
        };
        const rO = rH[yE(0x91c)](yE(0xe1e)),
          rP = rH[yE(0x91c)](yE(0x77b));
        rP[yE(0xc3b)] = function () {
          const yH = yE,
            rS = this[yH(0x2e6)][yH(0x810)]();
          (rO[yH(0x63c)] = ""), (rO[yH(0xa71)][yH(0x3c1)] = yH(0x846));
          if (!rS) return;
          const rT = new RegExp(rS, "i");
          let rU = 0x0;
          for (let rV = 0x0; rV < rG[yH(0xadf)][yH(0xd55)]; rV++) {
            const rW = rG[yH(0xadf)][rV];
            if (rT[yH(0x3e6)](rW[yH(0xb06)])) {
              const rX = nQ(
                yH(0x3e5) +
                  (rV + 0x1) +
                  yH(0x11e) +
                  rW[yH(0xb06)] +
                  yH(0x2c1) +
                  k9(rW[yH(0xd4d)]) +
                  yH(0x735)
              );
              rO[yH(0x6c4)](rX),
                (rX[yH(0x91c)](yH(0x905))[yH(0x81c)] = function () {
                  const yI = yH;
                  mz(rW[yI(0xb06)]);
                }),
                (rX[yH(0x81c)] = function (rY) {
                  const yJ = yH;
                  if (rY[yJ(0x70a)] === this) {
                    const rZ = Math[yJ(0xc8c)](rV / rJ);
                    rK(rZ), (rM[yJ(0x2e6)] = rZ);
                  }
                }),
                rU++;
              if (rU >= 0x8) break;
            }
          }
          rU > 0x0 && (rO[yH(0xa71)][yH(0x3c1)] = "");
        };
      }
      function rK(rS = 0x0) {
        const yK = yE,
          rT = rS * rJ,
          rU = Math[yK(0x77f)](rG[yK(0xadf)][yK(0xd55)], rT + rJ);
        rI[yK(0x63c)] = "";
        for (let rV = rT; rV < rU; rV++) {
          const rW = rG[yK(0xadf)][rV];
          rI[yK(0x6c4)](rG[yK(0x3e7)](rW, rV));
          const rX = nQ(yK(0x682));
          for (let rY = 0x0; rY < rW[yK(0x54c)][yK(0xd55)]; rY++) {
            const [rZ, s0] = rW[yK(0x54c)][rY],
              s1 = dF[rZ],
              s2 = nQ(
                yK(0x4ca) + s1[yK(0x2a3)] + "\x22\x20" + qA(s1) + yK(0xd5a)
              );
            jY(s2);
            const s3 = "x" + k9(s0),
              s4 = nQ(yK(0x6e2) + s3 + yK(0x13d));
            s3[yK(0xd55)] > 0x6 && s4[yK(0xdd8)][yK(0x1b1)](yK(0xadd)),
              s2[yK(0x6c4)](s4),
              (s2[yK(0x6d2)] = s1),
              rX[yK(0x6c4)](s2);
          }
          rI[yK(0x6c4)](rX);
        }
      }
      kl[yE(0x6c4)](rH);
    }
    function ma(rG, rH = ![]) {
      const yL = uv;
      let rI = [],
        rJ = 0x0;
      for (const rL in rG) {
        const rM = rG[rL];
        let rN = 0x0,
          rO = [];
        for (const rQ in rM) {
          const rR = rM[rQ];
          rO[yL(0xe68)]([rQ, rR]), (rN += rR), (rJ += rR);
        }
        rO = rO[yL(0x3a4)]((rS, rT) => rT[0x1] - rS[0x1]);
        const rP = {};
        (rP[yL(0xb06)] = rL),
          (rP[yL(0x54c)] = rO),
          (rP[yL(0xd4d)] = rN),
          rI[yL(0xe68)](rP);
      }
      if (rH) rI = rI[yL(0x3a4)]((rS, rT) => rT[yL(0xd4d)] - rS[yL(0xd4d)]);
      const rK = {};
      return (rK[yL(0xd4d)] = rJ), (rK[yL(0xadf)] = rI), rK;
    }
    function mb() {
      return mc(new Date());
    }
    function mc(rG) {
      const yM = uv,
        rH = {};
      rH[yM(0x699)] = yM(0xb83);
      const rI = rG[yM(0xb7b)]("en", rH),
        rJ = {};
      rJ[yM(0x14e)] = yM(0xaba);
      const rK = rG[yM(0xb7b)]("en", rJ),
        rL = {};
      rL[yM(0x97c)] = yM(0xb83);
      const rM = rG[yM(0xb7b)]("en", rL);
      return "" + rI + md(rI) + "\x20" + rK + "\x20" + rM;
    }
    function md(rG) {
      if (rG >= 0xb && rG <= 0xd) return "th";
      switch (rG % 0xa) {
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
    function me(rG, rH) {
      const yN = uv,
        rI = nQ(
          yN(0x7e3) +
            (rH + 0x1) +
            yN(0xa82) +
            rG[yN(0xb06)] +
            yN(0x675) +
            k9(rG[yN(0xd4d)]) +
            yN(0xc1b) +
            (rG[yN(0xd4d)] == 0x1 ? "" : "s") +
            yN(0x71f)
        );
      return (
        (rI[yN(0x91c)](yN(0x905))[yN(0x81c)] = function () {
          const yO = yN;
          mz(rG[yO(0xb06)]);
        }),
        rI
      );
    }
    var mf = {
      ultraPlayers: {
        title: uv(0xa33),
        parse(rG) {
          const yP = uv,
            rH = rG[yP(0x153)];
          if (rH[yP(0x4e1)] !== 0x1) throw new Error(yP(0x6d0) + rH[yP(0x4e1)]);
          const rI = {},
            rJ = rH[yP(0x3a7)][yP(0xaa2)]("+");
          for (const rL in rH[yP(0x1fd)]) {
            const rM = rH[yP(0x1fd)][rL][yP(0xaa2)]("\x20"),
              rN = {};
            for (let rO = 0x0; rO < rM[yP(0xd55)] - 0x1; rO++) {
              let [rP, rQ] = rM[rO][yP(0xaa2)](",");
              rN[rJ[rP]] = parseInt(rQ);
            }
            rI[rL] = rN;
          }
          const rK = ma(rI, !![]);
          return {
            title: this[yP(0x59d)],
            titleColor: hP[yP(0xadc)],
            desc:
              mb() +
              yP(0x14a) +
              k9(rK[yP(0xadf)][yP(0xd55)]) +
              yP(0x565) +
              k9(rK[yP(0xd4d)]) +
              yP(0x23d),
            getTitleEl: me,
            groups: rK[yP(0xadf)],
          };
        },
      },
      superPlayers: {
        title: uv(0xe5b),
        parse(rG) {
          const yQ = uv,
            rH = ma(rG[yQ(0xd85)], !![]);
          return {
            title: this[yQ(0x59d)],
            titleColor: hP[yQ(0x2ca)],
            desc:
              mb() +
              yQ(0x14a) +
              k9(rH[yQ(0xadf)][yQ(0xd55)]) +
              yQ(0x565) +
              k9(rH[yQ(0xd4d)]) +
              yQ(0x23d),
            getTitleEl: me,
            groups: rH[yQ(0xadf)],
          };
        },
      },
      hyperPlayers: {
        title: uv(0x815),
        parse(rG) {
          const yR = uv,
            rH = ma(rG[yR(0x681)], !![]);
          return {
            title: this[yR(0x59d)],
            titleColor: hP[yR(0x5d0)],
            desc:
              mb() +
              yR(0x14a) +
              k9(rH[yR(0xadf)][yR(0xd55)]) +
              yR(0x565) +
              k9(rH[yR(0xd4d)]) +
              yR(0x23d),
            getTitleEl: me,
            groups: rH[yR(0xadf)],
          };
        },
      },
      petals: {
        title: uv(0xbda),
        parse(rG) {
          const yS = uv,
            rH = ma(rG[yS(0x54c)], ![]),
            rI = rH[yS(0xadf)][yS(0x3a4)](
              (rJ, rK) => rK[yS(0xb06)] - rJ[yS(0xb06)]
            );
          return {
            title: this[yS(0x59d)],
            titleColor: hP[yS(0x721)],
            desc: mb() + yS(0x14a) + k9(rH[yS(0xd4d)]) + yS(0x23d),
            getTitleEl(rJ, rK) {
              const yT = yS;
              return nQ(
                yT(0xdae) +
                  hN[rJ[yT(0xb06)]] +
                  yT(0x14a) +
                  k9(rJ[yT(0xd4d)]) +
                  yT(0x5ca)
              );
            },
            groups: rI,
          };
        },
      },
    };
    function mg(rG) {
      const yU = uv,
        rH = 0xea60,
        rI = rH * 0x3c,
        rJ = rI * 0x18,
        rK = rJ * 0x16d;
      let rL = Math[yU(0xc8c)](rG / rK);
      rG %= rK;
      let rM = Math[yU(0xc8c)](rG / rJ);
      rG %= rJ;
      let rN = Math[yU(0xc8c)](rG / rI);
      rG %= rI;
      let rO = Math[yU(0xc8c)](rG / rH),
        rP = [];
      if (rL > 0x0) rP[yU(0xe68)](rL + "y");
      if (rM > 0x0) rP[yU(0xe68)](rM + "d");
      if (rN > 0x0) rP[yU(0xe68)](rN + "h");
      if (rO > 0x0) rP[yU(0xe68)](rO + "m");
      return rP[yU(0x5aa)]("\x20");
    }
    function mh() {
      const yV = uv;
      if (m5) return;
      if (m6 && Date[yV(0xd3f)]() - m6[yV(0x9ff)] < 0x3c * 0xea60) return;
      (m5 = !![]),
        fetch((i8 ? yV(0x295) : yV(0x7be)) + yV(0x68a))
          [yV(0x970)]((rG) => rG[yV(0x7b2)]())
          [yV(0x970)]((rG) => {
            const yW = yV;
            (m5 = ![]), (m6 = rG), m8(), (m4[yW(0x63c)] = "");
            const rH = {};
            (rH[yW(0x308)] = !![]),
              (rH[yW(0x2cd)] = !![]),
              (rH[yW(0x210)] = !![]),
              (rH[yW(0x6be)] = !![]),
              (rH[yW(0x282)] = !![]);
            const rI = rH,
              rJ = nQ(yW(0xa01));
            m4[yW(0x6c4)](rJ);
            for (const rK in rI) {
              if (rK in rG) {
                const rL = rG[rK],
                  rM = nQ(
                    yW(0x239) +
                      kd(rK) +
                      yW(0x94e) +
                      (rK == yW(0x308) ? mg(rL * 0x3e8 * 0x3c) : k9(rL)) +
                      yW(0xd62)
                  );
                rJ[yW(0x6c4)](rM);
              }
            }
            for (const rN in mf) {
              if (!(rN in rG)) continue;
              const rO = mf[rN],
                rP = nQ(yW(0xddf) + rO[yW(0x59d)] + yW(0x347));
              (rP[yW(0x81c)] = function () {
                const yX = yW;
                m9(rO[yX(0x494)](rG));
              }),
                m4[yW(0x6c4)](rP);
            }
            m4[yW(0x6c4)](m7);
          })
          [yV(0xdbb)]((rG) => {
            const yY = yV;
            (m5 = ![]),
              hc(yY(0xc66)),
              console[yY(0x569)](yY(0xcf6), rG),
              setTimeout(mh, 0x1388);
          });
    }
    mI(uv(0x5c0), uv(0x8a8), uv(0xbe5), mh);
    var mi = 0xb,
      mj = document[uv(0x91c)](uv(0x8dc));
    hD[uv(0x926)] == mi && (mj[uv(0xa71)][uv(0x3c1)] = uv(0x846));
    var mk = document[uv(0x91c)](uv(0x669));
    mk[uv(0xa71)][uv(0x3c1)] = uv(0x846);
    var ml = document[uv(0x91c)](uv(0x7c7)),
      mm = document[uv(0x91c)](uv(0xbd1)),
      mn = document[uv(0x91c)](uv(0x1d6));
    mn[uv(0x81c)] = function () {
      const yZ = uv;
      mk[yZ(0xa71)][yZ(0x3c1)] = yZ(0x846);
    };
    var mo = ![];
    mm[uv(0x81c)] = nv(function (rG) {
      const z0 = uv;
      if (!hW || mo || jy) return;
      const rH = ml[z0(0x2e6)][z0(0x810)]();
      if (!rH || !eV(rH)) {
        ml[z0(0xdd8)][z0(0x2b0)](z0(0x58c)),
          void ml[z0(0xc15)],
          ml[z0(0xdd8)][z0(0x1b1)](z0(0x58c));
        return;
      }
      (mk[z0(0xa71)][z0(0x3c1)] = ""),
        (mk[z0(0x63c)] = z0(0x5be)),
        il(
          new Uint8Array([cI[z0(0x1db)], ...new TextEncoder()[z0(0x130)](rH)])
        ),
        (mo = !![]);
    });
    function mp(rG, rH) {
      const z1 = uv;
      if (rG === z1(0xca8)) {
        const rI = {};
        (rI[z1(0x97c)] = z1(0xb83)),
          (rI[z1(0x699)] = z1(0xcd6)),
          (rI[z1(0x14e)] = z1(0xcd6)),
          (rH = new Date(
            rH === 0x0 ? Date[z1(0xd3f)]() : rH * 0x3e8 * 0x3c * 0x3c
          )[z1(0xb7b)]("en", rI));
      } else
        rG === z1(0x43b) || rG === z1(0x88b)
          ? (rH = ka(rH * 0x3e8 * 0x3c, !![]))
          : (rH = k9(rH));
      return rH;
    }
    var mq = f2(),
      mr = {},
      ms = document[uv(0x91c)](uv(0x277));
    ms[uv(0x63c)] = "";
    for (let rG in mq) {
      const rH = mt(rG);
      rH[uv(0xc8a)](0x0), ms[uv(0x6c4)](rH), (mr[rG] = rH);
    }
    function mt(rI) {
      const z2 = uv,
        rJ = nQ(z2(0x531) + kd(rI) + z2(0x4c7)),
        rK = rJ[z2(0x91c)](z2(0x4bc));
      return (
        (rJ[z2(0xc8a)] = function (rL) {
          k8(rK, mp(rI, rL));
        }),
        rJ
      );
    }
    var mu;
    function mv(rI, rJ, rK, rL, rM, rN, rO) {
      const z3 = uv;
      mu && (mu[z3(0xbf8)](), (mu = null));
      const rP = rN[z3(0xd55)] / 0x2,
        rQ = z3(0xd94)[z3(0xcee)](rP),
        rR = nQ(
          z3(0x285) +
            rI +
            z3(0x98b) +
            rQ +
            z3(0xb40) +
            rQ +
            z3(0x8c2) +
            z3(0x784)[z3(0xcee)](eL * dH) +
            z3(0x38e) +
            (rK[z3(0xd55)] === 0x0 ? z3(0x419) : "") +
            z3(0x5b6)
        );
      rO && rR[z3(0x6c4)](nQ(z3(0xdcb)));
      mu = rR;
      const rS = rR[z3(0x91c)](z3(0x2b6)),
        rT = rR[z3(0x91c)](z3(0x184));
      for (let s5 = 0x0; s5 < rN[z3(0xd55)]; s5++) {
        const s6 = rN[s5];
        if (!s6) continue;
        const s7 = of(s6);
        s7[z3(0xdd8)][z3(0x2b0)](z3(0x435)),
          (s7[z3(0x6f3)] = !![]),
          s7[z3(0x9a7)][z3(0x2b0)](),
          (s7[z3(0x9a7)] = null),
          s5 < rP
            ? rS[z3(0xba2)][s5][z3(0x6c4)](s7)
            : rT[z3(0xba2)][s5 - rP][z3(0x6c4)](s7);
      }
      (rR[z3(0xbf8)] = function () {
        const z4 = z3;
        (rR[z4(0xa71)][z4(0x61b)] = z4(0xb92)),
          (rR[z4(0xa71)][z4(0x3c1)] = z4(0x846)),
          void rR[z4(0xc15)],
          (rR[z4(0xa71)][z4(0x3c1)] = ""),
          setTimeout(function () {
            const z5 = z4;
            rR[z5(0x2b0)]();
          }, 0x3e8);
      }),
        (rR[z3(0x91c)](z3(0xd3e))[z3(0x81c)] = function () {
          const z6 = z3;
          rR[z6(0xbf8)]();
        });
      const rU = d4(rM),
        rV = rU[0x0],
        rW = rU[0x1],
        rX = d2(rV + 0x1),
        rY = rM - rW,
        rZ = rR[z3(0x91c)](z3(0xc93));
      k8(
        rZ,
        z3(0x1b9) + (rV + 0x1) + z3(0xdb1) + iJ(rY) + "/" + iJ(rX) + z3(0x820)
      );
      const s0 = Math[z3(0x77f)](0x1, rY / rX),
        s1 = rR[z3(0x91c)](z3(0x753));
      s1[z3(0xa71)][z3(0x52e)] = s0 * 0x64 + "%";
      const s2 = rR[z3(0x91c)](z3(0x277));
      for (let s8 in mq) {
        const s9 = mt(s8);
        s9[z3(0xc8a)](rJ[s8]), s2[z3(0x6c4)](s9);
      }
      const s3 = rR[z3(0x91c)](z3(0x80a));
      rK[z3(0x3a4)]((sa, sb) => oe(sa[0x0], sb[0x0]));
      for (let sa = 0x0; sa < rK[z3(0xd55)]; sa++) {
        const [sb, sc] = rK[sa],
          sd = of(sb);
        jY(sd),
          sd[z3(0xdd8)][z3(0x2b0)](z3(0x435)),
          (sd[z3(0x6f3)] = !![]),
          p5(sd[z3(0x9a7)], sc),
          s3[z3(0x6c4)](sd);
      }
      if (rK[z3(0xd55)] > 0x0) {
        const se = nQ(z3(0x8f7)),
          sf = {};
        for (let sg = 0x0; sg < rK[z3(0xd55)]; sg++) {
          const [sh, si] = rK[sg];
          sf[sh[z3(0x2a3)]] = (sf[sh[z3(0x2a3)]] || 0x0) + si;
        }
        oE(se, sf), rR[z3(0x91c)](z3(0xbeb))[z3(0x6c4)](se);
      }
      const s4 = rR[z3(0x91c)](z3(0x631));
      for (let sj = 0x0; sj < rL[z3(0xd55)]; sj++) {
        const sk = rL[sj],
          sl = nV(sk, !![]);
        sl[z3(0xdd8)][z3(0x2b0)](z3(0x435)), (sl[z3(0x6f3)] = !![]);
        const sm = s4[z3(0xba2)][sk[z3(0xd91)] * dH + sk[z3(0x2a3)]];
        s4[z3(0x6c0)](sl, sm), sm[z3(0x2b0)]();
      }
      rR[z3(0xdd8)][z3(0x1b1)](z3(0x89c)),
        setTimeout(function () {
          const z7 = z3;
          rR[z7(0xdd8)][z7(0x2b0)](z7(0x89c));
        }, 0x0),
        kl[z3(0x6c4)](rR);
    }
    var mw = document[uv(0x91c)](uv(0x213));
    document[uv(0x91c)](uv(0x7a5))[uv(0x81c)] = nv(function (rI) {
      const z8 = uv,
        rJ = mw[z8(0x2e6)][z8(0x810)]();
      nu(rJ);
    });
    function mz(rI) {
      const z9 = uv,
        rJ = new Uint8Array([
          cI[z9(0x796)],
          ...new TextEncoder()[z9(0x130)](rI),
        ]);
      il(rJ);
    }
    var mA = document[uv(0x91c)](uv(0x633)),
      mB = document[uv(0x91c)](uv(0x85f)),
      mC = mB[uv(0x91c)](uv(0xe3a)),
      mD = 0x0,
      mE = 0x0;
    setInterval(function () {
      const za = uv;
      hW &&
        (pP - mE > 0x7530 &&
          mA[za(0xdd8)][za(0xd6c)](za(0x7f0)) &&
          (il(new Uint8Array([cI[za(0x8b3)]])), (mE = pP)),
        pP - mD > 0xea60 &&
          mB[za(0xdd8)][za(0xd6c)](za(0x7f0)) &&
          (il(new Uint8Array([cI[za(0xa1a)]])), (mD = pP)));
    }, 0x3e8);
    var mF = ![];
    function mG(rI) {
      const zb = uv;
      for (let rJ in m2) {
        if (rI === rJ) continue;
        m2[rJ][zb(0xbf8)]();
      }
      mF = ![];
    }
    window[uv(0x81c)] = function (rI) {
      const zc = uv;
      if ([kk, kn, ki][zc(0xc88)](rI[zc(0x70a)])) mG();
    };
    function mH() {
      const zd = uv;
      iy && !pb[zd(0x229)] && im(0x0, 0x0);
    }
    function mI(rI, rJ, rK, rL) {
      const ze = uv,
        rM = document[ze(0x91c)](rJ),
        rN = rM[ze(0x91c)](ze(0xe3a)),
        rO = document[ze(0x91c)](rI);
      let rP = null,
        rQ = rM[ze(0x91c)](ze(0x6fa));
      rQ &&
        (rQ[ze(0x81c)] = function () {
          const zf = ze;
          rM[zf(0xdd8)][zf(0xbf1)](zf(0xd9c));
        });
      (rN[ze(0xa71)][ze(0x3c1)] = ze(0x846)),
        rM[ze(0xdd8)][ze(0x2b0)](ze(0x7f0)),
        (rO[ze(0x81c)] = function () {
          const zg = ze;
          rR[zg(0xbf1)]();
        }),
        (rM[ze(0x91c)](ze(0xd3e))[ze(0x81c)] = function () {
          mG();
        });
      const rR = [rO, rM];
      (rR[ze(0xbf8)] = function () {
        const zh = ze;
        rO[zh(0xdd8)][zh(0x2b0)](zh(0x65f)),
          rM[zh(0xdd8)][zh(0x2b0)](zh(0x7f0)),
          !rP &&
            (rP = setTimeout(function () {
              const zi = zh;
              (rN[zi(0xa71)][zi(0x3c1)] = zi(0x846)), (rP = null);
            }, 0x3e8));
      }),
        (rR[ze(0xbf1)] = function () {
          const zj = ze;
          mG(rK),
            rM[zj(0xdd8)][zj(0xd6c)](zj(0x7f0))
              ? rR[zj(0xbf8)]()
              : rR[zj(0x7f0)]();
        }),
        (rR[ze(0x7f0)] = function () {
          const zk = ze;
          rL && rL(),
            clearTimeout(rP),
            (rP = null),
            (rN[zk(0xa71)][zk(0x3c1)] = ""),
            rO[zk(0xdd8)][zk(0x1b1)](zk(0x65f)),
            rM[zk(0xdd8)][zk(0x1b1)](zk(0x7f0)),
            (mF = !![]),
            mH();
        }),
        (m2[rK] = rR);
    }
    var mJ = [],
      mK,
      mL = 0x0,
      mM = ![],
      mN = document[uv(0x91c)](uv(0x5e3)),
      mO = {
        tagName: uv(0x636),
        getBoundingClientRect() {
          const zl = uv,
            rI = mN[zl(0xbc2)](),
            rJ = {};
          return (
            (rJ["x"] = rI["x"] + rI[zl(0x52e)] / 0x2),
            (rJ["y"] = rI["y"] + rI[zl(0xbc9)] / 0x2),
            rJ
          );
        },
        appendChild(rI) {
          const zm = uv;
          rI[zm(0x2b0)]();
        },
      };
    function mP(rI) {
      const zn = uv;
      if (!hW) return;
      const rJ = rI[zn(0x70a)];
      if (rJ[zn(0x151)]) mK = n9(rJ, rI);
      else {
        if (rJ[zn(0x4a5)]) {
          mG();
          const rK = rJ[zn(0x9bc)]();
          (rK[zn(0x6d2)] = rJ[zn(0x6d2)]),
            nP(rK, rJ[zn(0x6d2)]),
            (rK[zn(0xe46)] = 0x1),
            (rK[zn(0x4a5)] = !![]),
            (rK[zn(0x595)] = mO),
            rK[zn(0xdd8)][zn(0x1b1)](zn(0x601));
          const rL = rJ[zn(0xbc2)]();
          (rK[zn(0xa71)][zn(0x9c9)] = rL["x"] / kR + "px"),
            (rK[zn(0xa71)][zn(0x8ed)] = rL["y"] / kR + "px"),
            kH[zn(0x6c4)](rK),
            (mK = n9(rK, rI)),
            (mL = 0x0),
            (mF = !![]);
        } else return ![];
      }
      return (mL = Date[zn(0xd3f)]()), (mM = !![]), !![];
    }
    function mQ(rI) {
      const zo = uv;
      for (let rJ = 0x0; rJ < rI[zo(0xba2)][zo(0xd55)]; rJ++) {
        const rK = rI[zo(0xba2)][rJ];
        if (rK[zo(0xdd8)][zo(0xd6c)](zo(0x6d2)) && !n8(rK)) return rK;
      }
    }
    function mR() {
      const zp = uv;
      if (mK) {
        if (mM && Date[zp(0xd3f)]() - mL < 0x1f4) {
          if (mK[zp(0x151)]) {
            const rI = mK[zp(0x205)][zp(0x83c)];
            mK[zp(0xb61)](
              rI >= iN ? nz[zp(0xba2)][rI - iN + 0x1] : nA[zp(0xba2)][rI]
            );
          } else {
            if (mK[zp(0x4a5)]) {
              let rJ = mQ(nz) || mQ(nA);
              rJ && mK[zp(0xb61)](rJ);
            }
          }
        }
        mK[zp(0x194)]();
        if (mK[zp(0x4a5)]) {
          (mK[zp(0x4a5)] = ![]),
            (mK[zp(0x151)] = !![]),
            m2[zp(0xe3d)][zp(0x7f0)]();
          if (mK[zp(0x595)] !== mO) {
            const rK = mK[zp(0xce7)];
            rK
              ? ((mK[zp(0xa7b)] = rK[zp(0xa7b)]), n5(rK[zp(0x6d2)]["id"], 0x1))
              : (mK[zp(0xa7b)] = iR[zp(0xc11)]());
            (iQ[mK[zp(0xa7b)]] = mK), n5(mK[zp(0x6d2)]["id"], -0x1);
            const rL = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rL[zp(0x1fc)](0x0, cI[zp(0x1a3)]),
              rL[zp(0x140)](0x1, mK[zp(0x6d2)]["id"]),
              rL[zp(0x1fc)](0x3, mK[zp(0x595)][zp(0x83c)]),
              il(rL);
          }
        } else
          mK[zp(0x595)] === mO
            ? (iR[zp(0xe68)](mK[zp(0xa7b)]),
              n5(mK[zp(0x6d2)]["id"], 0x1),
              il(new Uint8Array([cI[zp(0x827)], mK[zp(0x205)][zp(0x83c)]])))
            : n7(mK[zp(0x205)][zp(0x83c)], mK[zp(0x595)][zp(0x83c)]);
        mK = null;
      }
    }
    function mS(rI) {
      const zq = uv;
      mK && (mK[zq(0x746)](rI), (mM = ![]));
    }
    var mT = document[uv(0x91c)](uv(0xa34));
    function mU() {
      const zr = uv;
      mT[zr(0xa71)][zr(0x3c1)] = zr(0x846);
      const rI = mT[zr(0x91c)](zr(0xae5));
      let rJ,
        rK,
        rL = null;
      (mT[zr(0x2af)] = function (rN) {
        const zs = zr;
        rL === null &&
          ((rI[zs(0xa71)][zs(0x52e)] = rI[zs(0xa71)][zs(0xde3)] = "0"),
          (mT[zs(0xa71)][zs(0x3c1)] = ""),
          ([rJ, rK] = mV(rN)),
          rM(),
          (rL = rN[zs(0x9b1)]));
      }),
        (mT[zr(0x30c)] = function (rN) {
          const zt = zr;
          if (rN[zt(0x9b1)] === rL) {
            const [rO, rP] = mV(rN),
              rQ = rO - rJ,
              rR = rP - rK,
              rS = mT[zt(0xbc2)]();
            let rT = Math[zt(0x805)](rQ, rR);
            const rU = rS[zt(0x52e)] / 0x2 / kR;
            rT > rU && (rT = rU);
            const rV = Math[zt(0x5c6)](rR, rQ);
            return (
              (rI[zt(0xa71)][zt(0xde3)] = zt(0x844) + rV + zt(0x144)),
              (rI[zt(0xa71)][zt(0x52e)] = rT + "px"),
              im(rV, rT / rU),
              !![]
            );
          }
        }),
        (mT[zr(0x86a)] = function (rN) {
          const zu = zr;
          rN[zu(0x9b1)] === rL &&
            ((mT[zu(0xa71)][zu(0x3c1)] = zu(0x846)), (rL = null), im(0x0, 0x0));
        });
      function rM() {
        const zv = zr;
        (mT[zv(0xa71)][zv(0x9c9)] = rJ + "px"),
          (mT[zv(0xa71)][zv(0x8ed)] = rK + "px");
      }
    }
    mU();
    function mV(rI) {
      const zw = uv;
      return [rI[zw(0x329)] / kR, rI[zw(0x3da)] / kR];
    }
    var mW = document[uv(0x91c)](uv(0x732)),
      mX = document[uv(0x91c)](uv(0x623)),
      mY = document[uv(0x91c)](uv(0xb1b)),
      mZ = {},
      n0 = {};
    if (kL) {
      document[uv(0xd97)][uv(0xdd8)][uv(0x1b1)](uv(0xc9d)),
        (window[uv(0x18a)] = function (rJ) {
          const zx = uv;
          for (let rK = 0x0; rK < rJ[zx(0xbf7)][zx(0xd55)]; rK++) {
            const rL = rJ[zx(0xbf7)][rK],
              rM = rL[zx(0x70a)];
            if (rM === ki) {
              mT[zx(0x2af)](rL);
              continue;
            } else {
              if (rM === mX)
                pq(zx(0xe2f), !![]),
                  (mZ[rL[zx(0x9b1)]] = function () {
                    const zy = zx;
                    pq(zy(0xe2f), ![]);
                  });
              else {
                if (rM === mW)
                  pq(zx(0x155), !![]),
                    (mZ[rL[zx(0x9b1)]] = function () {
                      const zz = zx;
                      pq(zz(0x155), ![]);
                    });
                else
                  rM === mY &&
                    (pq(zx(0xe6a), !![]),
                    (mZ[rL[zx(0x9b1)]] = function () {
                      const zA = zx;
                      pq(zA(0xe6a), ![]);
                    }));
              }
            }
            if (mK) continue;
            if (rM[zx(0x6d2)]) {
              const rN = n3(rM);
              mP(rL),
                mK && (n0[rL[zx(0x9b1)]] = mS),
                (mZ[rL[zx(0x9b1)]] = function () {
                  const zB = zx;
                  mK && mR(), (rN[zB(0x424)] = ![]);
                });
            }
          }
        });
      const rI = {};
      (rI[uv(0x839)] = ![]),
        document[uv(0xae0)](
          uv(0xc71),
          function (rJ) {
            const zC = uv;
            for (let rK = 0x0; rK < rJ[zC(0xbf7)][zC(0xd55)]; rK++) {
              const rL = rJ[zC(0xbf7)][rK];
              mT[zC(0x30c)](rL) && rJ[zC(0xcc6)]();
              if (n0[rL[zC(0x9b1)]]) n0[rL[zC(0x9b1)]](rL), rJ[zC(0xcc6)]();
              else mK && rJ[zC(0xcc6)]();
            }
          },
          rI
        ),
        (window[uv(0x470)] = function (rJ) {
          const zD = uv;
          for (let rK = 0x0; rK < rJ[zD(0xbf7)][zD(0xd55)]; rK++) {
            const rL = rJ[zD(0xbf7)][rK];
            mT[zD(0x86a)](rL),
              mZ[rL[zD(0x9b1)]] &&
                (mZ[rL[zD(0x9b1)]](),
                delete mZ[rL[zD(0x9b1)]],
                delete n0[rL[zD(0x9b1)]]);
          }
        });
    } else {
      document[uv(0xd97)][uv(0xdd8)][uv(0x1b1)](uv(0x6ec));
      let rJ = ![];
      (window[uv(0xb0f)] = function (rK) {
        const zE = uv;
        rK[zE(0xde8)] === 0x0 && ((rJ = !![]), mP(rK));
      }),
        (document[uv(0x1e4)] = function (rK) {
          const zF = uv;
          mS(rK);
          const rL = rK[zF(0x70a)];
          if (rL[zF(0x6d2)] && !rJ) {
            const rM = n3(rL);
            rL[zF(0x974)] = rL[zF(0xb0f)] = function () {
              const zG = zF;
              rM[zG(0x424)] = ![];
            };
          }
        }),
        (document[uv(0xe45)] = function (rK) {
          const zH = uv;
          rK[zH(0xde8)] === 0x0 && ((rJ = ![]), mR());
        }),
        (km[uv(0x1e4)] = ki[uv(0x1e4)] =
          function (rK) {
            const zI = uv;
            (nd = rK[zI(0x329)] - kU() / 0x2),
              (ne = rK[zI(0x3da)] - kV() / 0x2);
            if (!pb[zI(0x229)] && iy && !mF) {
              const rL = Math[zI(0x805)](nd, ne),
                rM = Math[zI(0x5c6)](ne, nd);
              im(rM, rL < 0x32 ? rL / 0x64 : 0x1);
            }
          });
    }
    function n1(rK, rL, rM) {
      const zJ = uv;
      return Math[zJ(0xb8e)](rL, Math[zJ(0x77f)](rK, rM));
    }
    var n2 = [];
    function n3(rK) {
      const zK = uv;
      let rL = n2[zK(0x4f0)]((rM) => rM["el"] === rK);
      if (rL) return (rL[zK(0x424)] = !![]), rL;
      (rL =
        typeof rK[zK(0x6d2)] === zK(0xdcf)
          ? rK[zK(0x6d2)]()
          : nK(rK[zK(0x6d2)], rK[zK(0x114)])),
        (rL[zK(0x424)] = !![]),
        (rL[zK(0xd80)] = 0x0),
        (rL[zK(0xa71)][zK(0x77a)] = zK(0x861)),
        (rL[zK(0xa71)][zK(0xde3)] = zK(0x846)),
        kH[zK(0x6c4)](rL);
      if (kL)
        (rL[zK(0xa71)][zK(0xa54)] = zK(0xbdb)),
          (rL[zK(0xa71)][zK(0x8ed)] = zK(0xbdb)),
          (rL[zK(0xa71)][zK(0x8a9)] = zK(0x5ba)),
          (rL[zK(0xa71)][zK(0x9c9)] = zK(0x5ba));
      else {
        const rM = rK[zK(0xbc2)](),
          rN = rL[zK(0xbc2)]();
        (rL[zK(0xa71)][zK(0x8ed)] =
          n1(
            rK[zK(0x380)]
              ? (rM[zK(0x8ed)] + rM[zK(0xbc9)]) / kR + 0xa
              : (rM[zK(0x8ed)] - rN[zK(0xbc9)]) / kR - 0xa,
            0xa,
            window[zK(0x291)] / kR - 0xa
          ) + "px"),
          (rL[zK(0xa71)][zK(0x9c9)] =
            n1(
              (rM[zK(0x9c9)] + rM[zK(0x52e)] / 0x2 - rN[zK(0x52e)] / 0x2) / kR,
              0xa,
              window[zK(0xa6e)] / kR - 0xa - rN[zK(0x52e)] / kR
            ) + "px"),
          (rL[zK(0xa71)][zK(0x8a9)] = zK(0x5ba)),
          (rL[zK(0xa71)][zK(0xa54)] = zK(0x5ba));
      }
      return (
        (rL[zK(0xa71)][zK(0x96a)] = zK(0x846)),
        (rL[zK(0xa71)][zK(0x572)] = 0x0),
        (rL["el"] = rK),
        n2[zK(0xe68)](rL),
        rL
      );
    }
    var n4 = document[uv(0x91c)](uv(0x537));
    function n5(rK, rL = 0x1) {
      const zL = uv;
      !iS[rK] && ((iS[rK] = 0x0), pa(rK), oc()),
        (iS[rK] += rL),
        oa[rK][zL(0x2d3)](iS[rK]),
        iS[rK] <= 0x0 && (delete iS[rK], oa[rK][zL(0x8f2)](), oc()),
        n6();
    }
    function n6() {
      const zM = uv;
      n4[zM(0x63c)] = "";
      Object[zM(0x5de)](iS)[zM(0xd55)] === 0x0
        ? (n4[zM(0xa71)][zM(0x3c1)] = zM(0x846))
        : (n4[zM(0xa71)][zM(0x3c1)] = "");
      const rK = {};
      for (const rL in iS) {
        const rM = dC[rL],
          rN = iS[rL];
        rK[rM[zM(0x2a3)]] = (rK[rM[zM(0x2a3)]] || 0x0) + rN;
      }
      oE(n4, rK);
      for (const rO in oq) {
        const rP = oq[rO];
        rP[zM(0xdd8)][rK[rO] ? zM(0x2b0) : zM(0x1b1)](zM(0xc5e));
      }
    }
    function n7(rK, rL) {
      const zN = uv;
      if (rK === rL) return;
      il(new Uint8Array([cI[zN(0x8e1)], rK, rL]));
    }
    function n8(rK) {
      const zO = uv;
      return rK[zO(0x92b)] || rK[zO(0x91c)](zO(0xc46));
    }
    function n9(rK, rL, rM = !![]) {
      const zP = uv,
        rN = mJ[zP(0x4f0)]((rX) => rX === rK);
      if (rN) return rN[zP(0x441)](rL), rN;
      let rO,
        rP,
        rQ,
        rR,
        rS = 0x0,
        rT = 0x0,
        rU = 0x0,
        rV;
      (rK[zP(0x441)] = function (rX, rY) {
        const zQ = zP;
        (rV = rK[zQ(0x595)] || rK[zQ(0x3ff)]),
          (rV[zQ(0x92b)] = rK),
          (rK[zQ(0x205)] = rV),
          (rK[zQ(0x86e)] = ![]),
          (rK[zQ(0xd25)] = ![]);
        const rZ = rK[zQ(0xbc2)]();
        rX[zQ(0xe5a)] === void 0x0
          ? ((rS = rX[zQ(0x329)] - rZ["x"]),
            (rT = rX[zQ(0x3da)] - rZ["y"]),
            rK[zQ(0x746)](rX),
            (rO = rQ),
            (rP = rR))
          : ((rO = rZ["x"]),
            (rP = rZ["y"]),
            rK[zQ(0xb61)](rX),
            rK[zQ(0x194)](rY)),
          rW();
      }),
        (rK[zP(0x194)] = function (rX = !![]) {
          const zR = zP;
          rK[zR(0xd25)] = !![];
          rV[zR(0x92b)] === rK && (rV[zR(0x92b)] = null);
          if (!rK[zR(0x595)])
            rK[zR(0xb61)](rV),
              Math[zR(0x805)](rQ - rO, rR - rP) > 0x32 * kR &&
                rK[zR(0xb61)](mO);
          else {
            if (rX) {
              const rY = n8(rK[zR(0x595)]);
              (rK[zR(0xce7)] = rY), rY && n9(rY, rV, ![]);
            }
          }
          rK[zR(0x595)] !== rV && (rK[zR(0xe46)] = 0x0),
            (rK[zR(0x595)][zR(0x92b)] = rK);
        }),
        (rK[zP(0xb61)] = function (rX) {
          const zS = zP;
          rK[zS(0x595)] = rX;
          const rY = rX[zS(0xbc2)]();
          (rQ = rY["x"]),
            (rR = rY["y"]),
            (rK[zS(0xa71)][zS(0x57c)] =
              rX === mO ? zS(0x8da) : getComputedStyle(rX)[zS(0x57c)]);
        }),
        (rK[zP(0x746)] = function (rX) {
          const zT = zP;
          (rQ = rX[zT(0x329)] - rS),
            (rR = rX[zT(0x3da)] - rT),
            (rK[zT(0x595)] = null);
          let rY = Infinity,
            rZ = null;
          const s0 = ko[zT(0x729)](zT(0xe0f));
          for (let s1 = 0x0; s1 < s0[zT(0xd55)]; s1++) {
            const s2 = s0[s1],
              s3 = s2[zT(0xbc2)](),
              s4 = Math[zT(0x805)](
                s3["x"] + s3[zT(0x52e)] / 0x2 - rX[zT(0x329)],
                s3["y"] + s3[zT(0xbc9)] / 0x2 - rX[zT(0x3da)]
              );
            s4 < 0x1e * kR && s4 < rY && ((rZ = s2), (rY = s4));
          }
          rZ && rZ !== rV && rK[zT(0xb61)](rZ);
        }),
        rK[zP(0x441)](rL, rM),
        rK[zP(0xdd8)][zP(0x1b1)](zP(0x601)),
        kH[zP(0x6c4)](rK);
      function rW() {
        const zU = zP;
        (rK[zU(0xa71)][zU(0x9c9)] = rO / kR + "px"),
          (rK[zU(0xa71)][zU(0x8ed)] = rP / kR + "px");
      }
      return (
        (rK[zP(0xdc0)] = function () {
          const zV = zP;
          rK[zV(0x595)] && rK[zV(0xb61)](rK[zV(0x595)]);
        }),
        (rK[zP(0xbce)] = function () {
          const zW = zP;
          (rO = pw(rO, rQ, 0x64)), (rP = pw(rP, rR, 0x64)), rW();
          let rX = 0x0,
            rY = Infinity;
          rK[zW(0x595)]
            ? ((rY = Math[zW(0x805)](rQ - rO, rR - rP)),
              (rX = rY > 0x5 ? 0x1 : 0x0))
            : (rX = 0x1),
            (rU = pw(rU, rX, 0x64)),
            (rK[zW(0xa71)][zW(0xde3)] =
              zW(0x5f5) +
              (0x1 + 0.3 * rU) +
              zW(0x3fb) +
              rU * Math[zW(0x88e)](Date[zW(0xd3f)]() / 0x96) * 0xa +
              zW(0x3b6)),
            rK[zW(0xd25)] &&
              rU < 0.05 &&
              rY < 0x5 &&
              (rK[zW(0xdd8)][zW(0x2b0)](zW(0x601)),
              (rK[zW(0xa71)][zW(0x9c9)] =
                rK[zW(0xa71)][zW(0x8ed)] =
                rK[zW(0xa71)][zW(0xde3)] =
                rK[zW(0xa71)][zW(0x57c)] =
                rK[zW(0xa71)][zW(0x968)] =
                  ""),
              (rK[zW(0x86e)] = !![]),
              rK[zW(0x595)][zW(0x6c4)](rK),
              (rK[zW(0x595)][zW(0x92b)] = null),
              (rK[zW(0x595)] = null));
        }),
        mJ[zP(0xe68)](rK),
        rK
      );
    }
    var na = cY[uv(0xdf2)];
    document[uv(0xb97)] = function () {
      return ![];
    };
    var nb = 0x0,
      nc = 0x0,
      nd = 0x0,
      ne = 0x0,
      nf = 0x1,
      ng = 0x1;
    document[uv(0x1f4)] = function (rK) {
      const zX = uv;
      rK[zX(0x70a)] === ki &&
        ((nf *= rK[zX(0xce6)] < 0x0 ? 1.1 : 0.9),
        (nf = Math[zX(0x77f)](0x3, Math[zX(0xb8e)](0x1, nf))));
    };
    const nh = {};
    (nh[uv(0xcd1)] = uv(0x923)),
      (nh["me"] = uv(0x25d)),
      (nh[uv(0x569)] = uv(0x72b));
    var ni = nh,
      nj = {};
    function nk(rK, rL) {
      nl(rK, null, null, null, jx(rL));
    }
    function nl(rK, rL, rM, rN = ni[uv(0xcd1)], rO) {
      const zY = uv,
        rP = nQ(zY(0x478));
      if (!rO) {
        if (rL) {
          const rR = nQ(zY(0x898));
          k8(rR, rL + ":"), rP[zY(0x6c4)](rR);
        }
        const rQ = nQ(zY(0x6cc));
        k8(rQ, rM),
          rP[zY(0x6c4)](rQ),
          (rP[zY(0xba2)][0x0][zY(0xa71)][zY(0x5bb)] = rN),
          rL && rP[zY(0xe32)](nQ(zY(0x2b2)));
      } else rP[zY(0x63c)] = rO;
      pj[zY(0x6c4)](rP);
      while (pj[zY(0xba2)][zY(0xd55)] > 0x3c) {
        pj[zY(0xba2)][0x0][zY(0x2b0)]();
      }
      return (
        (pj[zY(0xc42)] = pj[zY(0xe62)]),
        (rP[zY(0x9d5)] = rM),
        (rP[zY(0x204)] = rN),
        nm(rK, rP),
        rP
      );
    }
    function nm(rK, rL) {
      const zZ = uv;
      (rL["t"] = 0x0), (rL[zZ(0x363)] = 0x0);
      if (!nj[rK]) nj[rK] = [];
      nj[rK][zZ(0xe68)](rL);
    }
    var nn = {};
    ki[uv(0xb0f)] = window[uv(0xe45)] = nv(function (rK) {
      const A0 = uv,
        rL = A0(0x9c6) + rK[A0(0xde8)];
      pq(rL, rK[A0(0x8fa)] === A0(0x3f7));
    });
    var no = 0x0;
    function np(rK) {
      const A1 = uv,
        rL = 0x200,
        rM = rL / 0x64,
        rN = document[A1(0xa69)](A1(0xb07));
      rN[A1(0x52e)] = rN[A1(0xbc9)] = rL;
      const rO = rN[A1(0xaa8)]("2d");
      rO[A1(0xe07)](rL / 0x2, rL / 0x2), rO[A1(0x627)](rM), rK[A1(0x78b)](rO);
      const rP = (rK[A1(0xafc)] ? A1(0x2fc) : A1(0x1dd)) + rK[A1(0xd8e)];
      nq(rN, rP);
    }
    function nq(rK, rL) {
      const A2 = uv,
        rM = document[A2(0xa69)]("a");
      (rM[A2(0xbe0)] = rL),
        (rM[A2(0x4a6)] = typeof rK === A2(0x541) ? rK : rK[A2(0x5af)]()),
        rM[A2(0x336)](),
        hK(rL + A2(0x562), hP[A2(0x721)]);
    }
    var nr = 0x0;
    setInterval(function () {
      nr = 0x0;
    }, 0x1770),
      setInterval(function () {
        const A3 = uv;
        nw[A3(0xd55)] = 0x0;
      }, 0x2710);
    var ns = ![],
      nt = ![];
    function nu(rK) {
      const A4 = uv;
      rK = rK[A4(0x810)]();
      if (!rK) hK(A4(0x20a)), hc(A4(0x20a));
      else
        rK[A4(0xd55)] < cN || rK[A4(0xd55)] > cM
          ? (hK(A4(0x6a4)), hc(A4(0x6a4)))
          : (hK(A4(0x7b4) + rK + A4(0x664), hP[A4(0x31b)]),
            hc(A4(0x7b4) + rK + A4(0x664)),
            mz(rK));
    }
    document[uv(0x882)] = document[uv(0xbb4)] = nv(function (rK) {
      const A5 = uv;
      rK[A5(0x757)] && rK[A5(0xcc6)]();
      (ns = rK[A5(0x757)]), (nt = rK[A5(0x752)]);
      if (rK[A5(0x3ba)] === 0x9) {
        rK[A5(0xcc6)]();
        return;
      }
      if (document[A5(0x7db)] && document[A5(0x7db)][A5(0xe5a)] === A5(0xbad)) {
        if (rK[A5(0x8fa)] === A5(0x837) && rK[A5(0x3ba)] === 0xd) {
          if (document[A5(0x7db)] === hF) hG[A5(0x336)]();
          else {
            if (document[A5(0x7db)] === pi) {
              let rL = pi[A5(0x2e6)][A5(0x810)]()[A5(0x7ce)](0x0, cL);
              if (rL && hW) {
                if (pP - no > 0x3e8) {
                  const rM = rL[A5(0x307)](A5(0x659));
                  if (rM || rL[A5(0x307)](A5(0x7ef))) {
                    const rN = rL[A5(0x7ce)](rM ? 0x7 : 0x9);
                    if (!rN) hK(A5(0xdc5));
                    else {
                      if (rM) {
                        const rO = eM[rN];
                        !rO ? hK(A5(0x9a2) + rN + "!") : np(rO);
                      } else {
                        const rP = dF[rN];
                        !rP ? hK(A5(0xabd) + rN + "!") : np(rP);
                      }
                    }
                  } else {
                    if (rL[A5(0x307)](A5(0xd34))) nq(qx, A5(0xb1f));
                    else {
                        let inputChat = rL;
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
                        }else if(inputChat.startsWith('/bind')){
                            hack.commandMultiArg('bindKey', 3, inputChat);
                            hack.saveModule();
                        }else if(hack.notCommand(inputChat.split(' ')[0])){
                            hack.addError('Invalid command!');
                        }else if (rL[A5(0x307)](A5(0x9fa))) {
                        const rQ = rL[A5(0x7ce)](0x9);
                        nu(rQ);
                      } else {
                        hack.speak = (txt) => {
                        let rR = 0x0;
                        for (let rS = 0x0; rS < nw[A5(0xd55)]; rS++) {
                          nx(txt, nw[rS]) > 0.95 && rR++;
                        }
                        rR >= 0x3 && (nr += 0xa);
                        nr++;
                        if (nr > 0x3) hK(A5(0x39e)), (no = pP + 0xea60);
                        else {
                          nw[A5(0xe68)](txt);
                          if (nw[A5(0xd55)] > 0xa) nw[A5(0xc28)]();
                          (txt = decodeURIComponent(
                            encodeURIComponent(txt)
                              [A5(0xb02)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                              [A5(0xb02)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                          )),
                            il(
                              new Uint8Array([
                                cI[A5(0x78a)],
                                ...new TextEncoder()[A5(0x130)](txt),
                              ])
                            ),
                            (no = pP);
                        }};
                        hack.speak(inputChat);
                      }
                    }
                  }
                } else nl(-0x1, null, A5(0x55d), ni[A5(0x569)]);
              }
              (pi[A5(0x2e6)] = ""), pi[A5(0x750)]();
            }
          }
        }
        return;
      }
      pq(rK[A5(0x987)], rK[A5(0x8fa)] === A5(0x299));
    });
    function nv(rK) {
      return function (rL) {
        const A6 = b;
        rL instanceof Event && rL[A6(0x79c)] && !rL[A6(0xcee)] && rK(rL);
      };
    }
    var nw = [];
    function nx(rK, rL) {
      const A7 = uv;
      var rM = rK,
        rN = rL;
      rK[A7(0xd55)] < rL[A7(0xd55)] && ((rM = rL), (rN = rK));
      var rO = rM[A7(0xd55)];
      if (rO == 0x0) return 0x1;
      return (rO - ny(rM, rN)) / parseFloat(rO);
    }
    function ny(rK, rL) {
      const A8 = uv;
      (rK = rK[A8(0x545)]()), (rL = rL[A8(0x545)]());
      var rM = new Array();
      for (var rN = 0x0; rN <= rK[A8(0xd55)]; rN++) {
        var rO = rN;
        for (var rP = 0x0; rP <= rL[A8(0xd55)]; rP++) {
          if (rN == 0x0) rM[rP] = rP;
          else {
            if (rP > 0x0) {
              var rQ = rM[rP - 0x1];
              if (rK[A8(0xd2e)](rN - 0x1) != rL[A8(0xd2e)](rP - 0x1))
                rQ = Math[A8(0x77f)](Math[A8(0x77f)](rQ, rO), rM[rP]) + 0x1;
              (rM[rP - 0x1] = rO), (rO = rQ);
            }
          }
        }
        if (rN > 0x0) rM[rL[A8(0xd55)]] = rO;
      }
      return rM[rL[A8(0xd55)]];
    }
    var nz = document[uv(0x91c)](uv(0x2b6)),
      nA = document[uv(0x91c)](uv(0x184));
    function nB(rK, rL = 0x1) {
      const A9 = uv;
      rK[A9(0x884)](),
        rK[A9(0x28b)](0.25 * rL, 0.25 * rL),
        rK[A9(0xe07)](-0x4b, -0x4b),
        rK[A9(0xa39)](),
        rK[A9(0xb9f)](0x4b, 0x28),
        rK[A9(0x443)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        rK[A9(0x443)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        rK[A9(0x443)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        rK[A9(0x443)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        rK[A9(0x443)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        rK[A9(0x443)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (rK[A9(0x6b8)] = A9(0x11d)),
        rK[A9(0xa06)](),
        (rK[A9(0xd10)] = rK[A9(0xe0e)] = A9(0x423)),
        (rK[A9(0xc51)] = A9(0x666)),
        (rK[A9(0xade)] = 0xc),
        rK[A9(0x8e6)](),
        rK[A9(0x915)]();
    }
    for (let rK = 0x0; rK < dC[uv(0xd55)]; rK++) {
      const rL = dC[rK];
      if (rL[uv(0xc67)] !== void 0x0)
        switch (rL[uv(0xc67)]) {
          case df[uv(0x7d8)]:
            rL[uv(0x78b)] = function (rM) {
              const Aa = uv;
              rM[Aa(0x28b)](2.5, 2.5), lO(rM);
            };
            break;
          case df[uv(0x7b1)]:
            rL[uv(0x78b)] = function (rM) {
              const Ab = uv;
              rM[Ab(0x627)](0.9);
              const rN = pV();
              (rN[Ab(0x479)] = !![]), rN[Ab(0x93f)](rM);
            };
            break;
          case df[uv(0x544)]:
            rL[uv(0x78b)] = function (rM) {
              const Ac = uv;
              rM[Ac(0x9c0)](-Math["PI"] / 0x2),
                rM[Ac(0xe07)](-0x30, 0x0),
                pU[Ac(0xcb1)](rM, ![]);
            };
            break;
          case df[uv(0x502)]:
            rL[uv(0x78b)] = function (rM) {
              const Ad = uv;
              rM[Ad(0x9c0)](Math["PI"] / 0xa),
                rM[Ad(0xe07)](0x3, 0x15),
                lP(rM, !![]);
            };
            break;
          case df[uv(0x266)]:
            rL[uv(0x78b)] = function (rM) {
              nB(rM);
            };
            break;
          case df[uv(0x4b2)]:
            rL[uv(0x78b)] = function (rM) {
              const Ae = uv;
              rM[Ae(0xe07)](0x0, 0x3),
                rM[Ae(0x9c0)](-Math["PI"] / 0x4),
                rM[Ae(0x627)](0.4),
                pU[Ae(0x9c2)](rM),
                rM[Ae(0xa39)](),
                rM[Ae(0xce9)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rM[Ae(0xade)] = 0x8),
                (rM[Ae(0xc51)] = Ae(0x41c)),
                rM[Ae(0x8e6)]();
            };
            break;
          case df[uv(0xa46)]:
            rL[uv(0x78b)] = function (rM) {
              const Af = uv;
              rM[Af(0xe07)](0x0, 0x7),
                rM[Af(0x627)](0.8),
                pU[Af(0xc59)](rM, 0.5);
            };
            break;
          case df[uv(0xd18)]:
            rL[uv(0x78b)] = function (rM) {
              const Ag = uv;
              rM[Ag(0x627)](1.3), lS(rM);
            };
            break;
          default:
            rL[uv(0x78b)] = function (rM) {};
        }
      else {
        const rM = new lG(
          -0x1,
          rL[uv(0x8fa)],
          0x0,
          0x0,
          rL[uv(0x5d1)],
          rL[uv(0xd43)] ? 0x10 : rL[uv(0x3aa)] * 1.1,
          0x0
        );
        (rM[uv(0xd2d)] = !![]),
          rL[uv(0x8a2)] === 0x1
            ? (rL[uv(0x78b)] = function (rN) {
                const Ah = uv;
                rM[Ah(0x93f)](rN);
              })
            : (rL[uv(0x78b)] = function (rN) {
                const Ai = uv;
                for (let rO = 0x0; rO < rL[Ai(0x8a2)]; rO++) {
                  rN[Ai(0x884)]();
                  const rP = (rO / rL[Ai(0x8a2)]) * Math["PI"] * 0x2;
                  rL[Ai(0x260)]
                    ? rN[Ai(0xe07)](...le(rL[Ai(0x7cf)], 0x0, rP))
                    : (rN[Ai(0x9c0)](rP), rN[Ai(0xe07)](rL[Ai(0x7cf)], 0x0)),
                    rN[Ai(0x9c0)](rL[Ai(0x500)]),
                    rM[Ai(0x93f)](rN),
                    rN[Ai(0x915)]();
                }
              });
      }
    }
    const nC = {};
    (nC[uv(0x9b2)] = uv(0x61c)),
      (nC[uv(0x2f3)] = uv(0xdee)),
      (nC[uv(0x12d)] = uv(0xb8a)),
      (nC[uv(0x69e)] = uv(0x6d9)),
      (nC[uv(0x751)] = uv(0x574)),
      (nC[uv(0xc9a)] = uv(0x30d)),
      (nC[uv(0x219)] = uv(0x825));
    var nD = nC;
    function nE() {
      const Aj = uv,
        rN = document[Aj(0x91c)](Aj(0x849));
      let rO = Aj(0xa0b);
      for (let rP = 0x0; rP < 0xc8; rP++) {
        const rQ = d6(rP),
          rR = 0xc8 * rQ,
          rS = 0x19 * rQ,
          rT = d5(rP);
        rO +=
          Aj(0x503) +
          (rP + 0x1) +
          Aj(0x6c5) +
          k9(Math[Aj(0x423)](rR)) +
          Aj(0x6c5) +
          k9(Math[Aj(0x423)](rS)) +
          Aj(0x6c5) +
          rT +
          Aj(0x3fe);
      }
      (rO += Aj(0x9f1)), (rO += Aj(0xcc4)), (rN[Aj(0x63c)] = rO);
    }
    nE();
    function nF(rN, rO) {
      const Ak = uv,
        rP = eM[rN],
        rQ = rP[Ak(0xd8e)],
        rR = rP[Ak(0x2a3)];
      return (
        "x" +
        rO[Ak(0x8a2)] * rO[Ak(0xb3b)] +
        ("\x20" + rQ + Ak(0xe5d) + hQ[rR] + Ak(0x47f) + hN[rR] + ")")
      );
    }
    function nG(rN) {
      const Al = uv;
      return rN[Al(0x165)](0x2)[Al(0xb02)](/\.?0+$/, "");
    }
    function nH(rN) {
      const Am = uv,
        rO = rN[Am(0xb55)];
      return Math[Am(0x423)]((rO * rO) / (0x32 * 0x32));
    }
    var nI = [
        [uv(0x657), uv(0x925), nD[uv(0x9b2)]],
        [uv(0x3cb), uv(0xb2d), nD[uv(0x2f3)]],
        [uv(0xd93), uv(0xbf3), nD[uv(0x12d)]],
        [uv(0x2a7), uv(0xce1), nD[uv(0x69e)]],
        [uv(0x29e), uv(0x49e), nD[uv(0xc9a)]],
        [uv(0xb3d), uv(0x814), nD[uv(0x751)]],
        [uv(0xce5), uv(0x34f), nD[uv(0x219)]],
        [uv(0xd5b), uv(0x2ed), nD[uv(0x219)], (rN) => "+" + k9(rN)],
        [uv(0xe6c), uv(0x79b), nD[uv(0x219)], (rN) => "+" + k9(rN)],
        [uv(0x19d), uv(0x86b), nD[uv(0x219)]],
        [
          uv(0xca2),
          uv(0xbf2),
          nD[uv(0x219)],
          (rN) => Math[uv(0x423)](rN * 0x64) + "%",
        ],
        [uv(0x558), uv(0xb67), nD[uv(0x219)], (rN) => "+" + nG(rN) + uv(0x6bc)],
        [uv(0x168), uv(0x5dd), nD[uv(0x12d)], (rN) => k9(rN) + "/s"],
        [uv(0xbb9), uv(0x5dd), nD[uv(0x12d)], (rN) => k9(rN) + uv(0xc79)],
        [
          uv(0x496),
          uv(0x126),
          nD[uv(0x219)],
          (rN) => (rN > 0x0 ? "+" : "") + rN,
        ],
        [uv(0xbe6), uv(0x997), nD[uv(0x751)], (rN) => "+" + rN + "%"],
        [
          uv(0x5b9),
          uv(0xac3),
          nD[uv(0x751)],
          (rN) => "+" + parseInt(rN * 0x64) + "%",
        ],
        [uv(0x524), uv(0x677), nD[uv(0x219)], (rN) => "-" + rN + "%"],
        [uv(0xa17), uv(0x517), nD[uv(0x219)], nF],
        [uv(0xd7f), uv(0x27a), nD[uv(0x751)], (rN) => rN / 0x3e8 + "s"],
        [uv(0x2ac), uv(0x67c), nD[uv(0x751)], (rN) => rN + "s"],
        [uv(0x48a), uv(0xe20), nD[uv(0x751)], (rN) => k9(rN) + uv(0x3b8)],
        [uv(0xbd7), uv(0x90a), nD[uv(0x751)], (rN) => rN + "s"],
        [uv(0xe3e), uv(0x754), nD[uv(0x751)], (rN) => rN / 0x3e8 + "s"],
        [uv(0x840), uv(0xbfa), nD[uv(0x751)]],
        [uv(0x10c), uv(0x852), nD[uv(0x751)]],
        [uv(0x914), uv(0x288), nD[uv(0x751)], (rN) => rN + uv(0x355)],
        [uv(0x42b), uv(0xc82), nD[uv(0x751)], (rN) => rN + uv(0x355)],
        [uv(0x3c2), uv(0xacb), nD[uv(0x751)]],
        [uv(0x314), uv(0xcab), nD[uv(0x219)]],
        [uv(0x906), uv(0x8b2), nD[uv(0x751)], (rN) => rN / 0x3e8 + "s"],
        [uv(0x824), uv(0x559), nD[uv(0x12d)], (rN) => k9(rN) + "/s"],
        [
          uv(0x48f),
          uv(0x375),
          nD[uv(0x751)],
          (rN, rO) => k9(rN) + uv(0xab9) + k9(nH(rO) * rN * 0x14) + uv(0xb10),
        ],
        [
          uv(0xb55),
          uv(0x22e),
          nD[uv(0x219)],
          (rN, rO) => k9(rN) + "\x20(" + nH(rO) + uv(0xe6e),
        ],
        [
          uv(0x23a),
          uv(0x51d),
          nD[uv(0x751)],
          (rN, rO) => nG(rN * rO[uv(0x3aa)]),
        ],
        [uv(0x191), uv(0x41b), nD[uv(0x751)]],
        [uv(0x534), uv(0xb2f), nD[uv(0x219)]],
        [uv(0xc49), uv(0x9d9), nD[uv(0x751)]],
        [uv(0xbd0), uv(0x64e), nD[uv(0x751)]],
        [uv(0xba4), uv(0x5a8), nD[uv(0x751)]],
        [
          uv(0x6a8),
          uv(0x1da),
          nD[uv(0x751)],
          (rN) => "+" + nG(rN * 0x64) + "%",
        ],
        [uv(0x1d0), uv(0xd3c), nD[uv(0xc9a)]],
        [uv(0xc8b), uv(0x977), nD[uv(0x751)]],
        [uv(0x695), uv(0x8cd), nD[uv(0x12d)]],
        [uv(0x4b1), uv(0x67c), nD[uv(0x751)], (rN) => rN + "s"],
        [uv(0x1ef), uv(0xd1d), nD[uv(0x751)]],
        [uv(0x1ab), uv(0xbd3), nD[uv(0x219)], (rN) => rN / 0x3e8 + "s"],
      ],
      nJ = [
        [uv(0x6f9), uv(0x8b0), nD[uv(0x751)]],
        [uv(0xe3b), uv(0x23c), nD[uv(0x219)], (rN) => k9(rN * 0x64) + "%"],
        [uv(0x993), uv(0x2cf), nD[uv(0x219)]],
        [uv(0xcaf), uv(0x52f), nD[uv(0x751)]],
        [uv(0xbbe), uv(0x218), nD[uv(0x219)]],
        [uv(0xbe6), uv(0x997), nD[uv(0x751)], (rN) => "+" + rN + "%"],
        [uv(0x955), uv(0x6e9), nD[uv(0x751)], (rN) => k9(rN) + "/s"],
        [uv(0xd3d), uv(0x5ce), nD[uv(0x9b2)], (rN) => rN * 0x64 + uv(0xe4c)],
        [uv(0x71e), uv(0x281), nD[uv(0x751)], (rN) => rN + "s"],
        [
          uv(0x730),
          uv(0x5f7),
          nD[uv(0x219)],
          (rN) => "-" + parseInt((0x1 - rN) * 0x64) + "%",
        ],
      ];
    function nK(rN, rO = !![]) {
      const An = uv;
      let rP = "",
        rQ = "",
        rR;
      rN[An(0xc67)] === void 0x0
        ? ((rR = nI),
          rN[An(0xcc9)] &&
            (rQ =
              An(0x63d) +
              (rN[An(0xcc9)] / 0x3e8 +
                "s" +
                (rN[An(0x8b1)] > 0x0
                  ? An(0x880) + rN[An(0x8b1)] / 0x3e8 + "s"
                  : "")) +
              An(0x1e5)))
        : (rR = nJ);
      for (let rT = 0x0; rT < rR[An(0xd55)]; rT++) {
        const [rU, rV, rW, rX] = rR[rT],
          rY = rN[rU];
        rY &&
          rY !== 0x0 &&
          (rP +=
            An(0x312) +
            rW +
            An(0xc50) +
            rV +
            An(0x25a) +
            (rX ? rX(rY, rN) : k9(rY)) +
            An(0x167));
      }
      const rS = nQ(
        An(0x3a5) +
          rN[An(0xd8e)] +
          An(0xe2c) +
          hN[rN[An(0x2a3)]] +
          An(0x483) +
          hQ[rN[An(0x2a3)]] +
          An(0xca6) +
          rQ +
          An(0xe29) +
          rN[An(0x445)] +
          An(0xca6) +
          rP +
          An(0x147)
      );
      if (rN[An(0x934)] && rO) {
        rS[An(0x1ac)][An(0xa71)][An(0xd4b)] = An(0xbdb);
        for (let rZ = 0x0; rZ < rN[An(0x934)][An(0xd55)]; rZ++) {
          const [s0, s1] = rN[An(0x934)][rZ],
            s2 = nQ(An(0xd0c));
          rS[An(0x6c4)](s2);
          const s3 = f5[s1][rN[An(0x2a3)]];
          for (let s4 = 0x0; s4 < s3[An(0xd55)]; s4++) {
            const [s5, s6] = s3[s4],
              s7 = eW(s0, s6),
              s8 = nQ(
                An(0x95b) +
                  s7[An(0x2a3)] +
                  "\x22\x20" +
                  qA(s7) +
                  An(0xa0f) +
                  s5 +
                  An(0xd2f)
              );
            s2[An(0x6c4)](s8);
          }
        }
      }
      return rS;
    }
    function nL() {
      const Ao = uv;
      mK && (mK[Ao(0x2b0)](), (mK = null));
      const rN = ko[Ao(0x729)](Ao(0xc46));
      for (let rO = 0x0; rO < rN[Ao(0xd55)]; rO++) {
        const rP = rN[rO];
        rP[Ao(0x2b0)]();
      }
      for (let rQ = 0x0; rQ < iO; rQ++) {
        const rR = nQ(Ao(0xd94));
        rR[Ao(0x83c)] = rQ;
        const rS = iP[rQ];
        if (rS) {
          const rT = nQ(
            Ao(0x4ca) + rS[Ao(0x2a3)] + "\x22\x20" + qA(rS) + Ao(0xd5a)
          );
          (rT[Ao(0x6d2)] = rS),
            (rT[Ao(0x151)] = !![]),
            (rT[Ao(0xa7b)] = iR[Ao(0xc11)]()),
            nP(rT, rS),
            rR[Ao(0x6c4)](rT),
            (iQ[rT[Ao(0xa7b)]] = rT);
        }
        rQ >= iN
          ? (rR[Ao(0x6c4)](nQ(Ao(0xc4f) + ((rQ - iN + 0x1) % 0xa) + Ao(0xc39))),
            nA[Ao(0x6c4)](rR))
          : nz[Ao(0x6c4)](rR);
      }
    }
    function nM(rN) {
      const Ap = uv;
      return rN < 0.5
        ? 0x4 * rN * rN * rN
        : 0x1 - Math[Ap(0xa4e)](-0x2 * rN + 0x2, 0x3) / 0x2;
    }
    var nN = [];
    function nO(rN, rO) {
      const Aq = uv;
      (rN[Aq(0xe46)] = 0x0), (rN[Aq(0x57d)] = 0x1);
      let rP = 0x1,
        rQ = 0x0,
        rR = -0x1;
      rN[Aq(0xdd8)][Aq(0x1b1)](Aq(0x878)), rN[Aq(0xe2b)](Aq(0xa71), "");
      const rS = nQ(Aq(0x91b));
      rN[Aq(0x6c4)](rS), nN[Aq(0xe68)](rS);
      const rT = qs;
      rS[Aq(0x52e)] = rS[Aq(0xbc9)] = rT;
      const rU = rS[Aq(0xaa8)]("2d");
      (rS[Aq(0xd35)] = function () {
        const Ar = Aq;
        rU[Ar(0xa52)](0x0, 0x0, rT, rT);
        rQ < 0.99 &&
          ((rU[Ar(0x58a)] = 0x1 - rQ),
          (rU[Ar(0x6b8)] = Ar(0x300)),
          rU[Ar(0x234)](0x0, 0x0, rT, (0x1 - rP) * rT));
        if (rQ < 0.01) return;
        (rU[Ar(0x58a)] = rQ),
          rU[Ar(0x884)](),
          rU[Ar(0x627)](rT / 0x64),
          rU[Ar(0xe07)](0x32, 0x2d);
        let rV = rN[Ar(0xe46)];
        rV = nM(rV);
        const rW = Math["PI"] * 0x2 * rV;
        rU[Ar(0x9c0)](rW * 0x4),
          rU[Ar(0xa39)](),
          rU[Ar(0xb9f)](0x0, 0x0),
          rU[Ar(0xce9)](0x0, 0x0, 0x64, 0x0, rW),
          rU[Ar(0xb9f)](0x0, 0x0),
          rU[Ar(0xce9)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rU[Ar(0x6b8)] = Ar(0xa75)),
          rU[Ar(0xa06)](Ar(0xab4)),
          rU[Ar(0x915)]();
      }),
        (rS[Aq(0xbce)] = function () {
          const As = Aq;
          rN[As(0xe46)] += pQ / (rO[As(0xcc9)] + 0xc8);
          let rV = 0x1,
            rW = rN[As(0x57d)];
          rN[As(0xe46)] >= 0x1 && (rV = 0x0);
          const rX = rN[As(0x595)] || rN[As(0x3ff)];
          ((rX && rX[As(0x3ff)] === nA) || !iy) && ((rW = 0x1), (rV = 0x0));
          (rQ = pw(rQ, rV, 0x64)), (rP = pw(rP, rW, 0x64));
          const rY = Math[As(0x423)]((0x1 - rP) * 0x64),
            rZ = Math[As(0x423)](rQ * 0x64) / 0x64;
          rZ == 0x0 && rY <= 0x0
            ? ((rS[As(0x4a7)] = ![]), (rS[As(0xa71)][As(0x3c1)] = As(0x846)))
            : ((rS[As(0x4a7)] = !![]), (rS[As(0xa71)][As(0x3c1)] = "")),
            (rR = rY);
        }),
        rN[Aq(0x6c4)](nQ(Aq(0x6a2) + qA(rO) + Aq(0xd5a)));
    }
    function nP(rN, rO, rP = !![]) {
      const At = uv;
      rP && rO[At(0xc67)] === void 0x0 && nO(rN, rO);
    }
    function nQ(rN) {
      const Au = uv;
      return (hB[Au(0x63c)] = rN), hB[Au(0xba2)][0x0];
    }
    var nR = document[uv(0x91c)](uv(0x631)),
      nS = [];
    function nT() {
      const Av = uv;
      (nR[Av(0x63c)] = Av(0x784)[Av(0xcee)](eL * dH)),
        (nS = Array[Av(0x91d)](nR[Av(0xba2)]));
    }
    nT();
    var nU = {};
    for (let rN = 0x0; rN < eK[uv(0xd55)]; rN++) {
      const rO = eK[rN];
      !nU[rO[uv(0x8fa)]] &&
        ((nU[rO[uv(0x8fa)]] = new lG(
          -0x1,
          rO[uv(0x8fa)],
          0x0,
          0x0,
          rO[uv(0x941)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          rO[uv(0x5da)],
          0x1
        )),
        (nU[rO[uv(0x8fa)]][uv(0xd2d)] = !![]));
      const rP = nU[rO[uv(0x8fa)]];
      let rQ = null;
      rO[uv(0x28f)] !== void 0x0 &&
        (rQ = new lG(-0x1, rO[uv(0x28f)], 0x0, 0x0, 0x0, rO[uv(0x5da)], 0x1)),
        (rO[uv(0x78b)] = function (rR) {
          const Aw = uv;
          rR[Aw(0x28b)](0.5, 0.5),
            rP[Aw(0x93f)](rR),
            rQ &&
              (rR[Aw(0x9c0)](rP[Aw(0x582)]),
              rR[Aw(0xe07)](-rO[Aw(0x5da)] * 0x2, 0x0),
              rQ[Aw(0x93f)](rR));
        });
    }
    function nV(rR, rS = ![]) {
      const Ax = uv,
        rT = nQ(Ax(0x4ca) + rR[Ax(0x2a3)] + "\x22\x20" + qA(rR) + Ax(0xd5a));
      jY(rT), (rT[Ax(0x6d2)] = rR);
      if (rS) return rT;
      const rU = dH * rR[Ax(0xd91)] + rR[Ax(0x2a3)],
        rV = nS[rU];
      return nR[Ax(0x6c0)](rT, rV), rV[Ax(0x2b0)](), (nS[rU] = rT), rT;
    }
    var nW = document[uv(0x91c)](uv(0xc35)),
      nX = document[uv(0x91c)](uv(0x65e)),
      nY = document[uv(0x91c)](uv(0xcb3)),
      nZ = document[uv(0x91c)](uv(0x62a)),
      o0 = document[uv(0x91c)](uv(0x778)),
      o1 = o0[uv(0x91c)](uv(0x753)),
      o2 = o0[uv(0x91c)](uv(0x91f)),
      o3 = document[uv(0x91c)](uv(0x6b7)),
      o4 = document[uv(0x91c)](uv(0xc93)),
      o5 = ![],
      o6 = 0x0,
      o7 = ![];
    (nX[uv(0x81c)] = function () {
      (o5 = !![]), (o6 = 0x0), (o7 = ![]);
    }),
      (nZ[uv(0x81c)] = function () {
        const Ay = uv;
        if (this[Ay(0xdd8)][Ay(0xd6c)](Ay(0x53b)) || jy) return;
        kI(Ay(0x335), (rR) => {
          rR && ((o5 = !![]), (o6 = 0x0), (o7 = !![]));
        });
      }),
      (nW[uv(0x63c)] = uv(0x784)[uv(0xcee)](dG * dH));
    var o8 = Array[uv(0x91d)](nW[uv(0xba2)]),
      o9 = document[uv(0x91c)](uv(0x11c)),
      oa = {};
    function ob() {
      const Az = uv;
      for (let rR in oa) {
        oa[rR][Az(0x8f2)]();
      }
      oa = {};
      for (let rS in iS) {
        pa(rS);
      }
      oc();
    }
    function oc() {
      od(o9);
    }
    function od(rR) {
      const AA = uv,
        rS = Array[AA(0x91d)](rR[AA(0x729)](AA(0xc46)));
      rS[AA(0x3a4)]((rT, rU) => {
        const AB = AA,
          rV = rU[AB(0x6d2)][AB(0x2a3)] - rT[AB(0x6d2)][AB(0x2a3)];
        return rV === 0x0 ? rU[AB(0x6d2)]["id"] - rT[AB(0x6d2)]["id"] : rV;
      });
      for (let rT = 0x0; rT < rS[AA(0xd55)]; rT++) {
        const rU = rS[rT];
        rR[AA(0x6c4)](rU);
      }
    }
    function oe(rR, rS) {
      const AC = uv,
        rT = rS[AC(0x2a3)] - rR[AC(0x2a3)];
      return rT === 0x0 ? rS["id"] - rR["id"] : rT;
    }
    function of(rR, rS = !![]) {
      const AD = uv,
        rT = nQ(AD(0xc5d) + rR[AD(0x2a3)] + "\x22\x20" + qA(rR) + AD(0xb77));
      setTimeout(function () {
        const AE = AD;
        rT[AE(0xdd8)][AE(0x2b0)](AE(0x435));
      }, 0x1f4),
        (rT[AD(0x6d2)] = rR);
      if (rS) {
      }
      return (rT[AD(0x9a7)] = rT[AD(0x91c)](AD(0xa27))), rT;
    }
    var og = nQ(uv(0xc97)),
      oh = og[uv(0x91c)](uv(0xb7c)),
      oi = og[uv(0x91c)](uv(0xc98)),
      oj = og[uv(0x91c)](uv(0x67a)),
      ok = [];
    for (let rR = 0x0; rR < 0x5; rR++) {
      const rS = nQ(uv(0x784));
      (rS[uv(0x68d)] = function (rT = 0x0) {
        const AF = uv,
          rU =
            (rR / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rT * Math["PI"] * 0x6,
          rV =
            0x32 +
            (rT > 0x0
              ? Math[AF(0x911)](Math[AF(0x88e)](rT * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[AF(0xa71)][AF(0x9c9)] = Math[AF(0xe44)](rU) * rV + 0x32 + "%"),
          (this[AF(0xa71)][AF(0x8ed)] = Math[AF(0x88e)](rU) * rV + 0x32 + "%");
      }),
        rS[uv(0x68d)](),
        (rS[uv(0x8a2)] = 0x0),
        (rS["el"] = null),
        (rS[uv(0x441)] = function () {
          const AG = uv;
          (rS[AG(0x8a2)] = 0x0), (rS["el"] = null), (rS[AG(0x63c)] = "");
        }),
        (rS[uv(0x2bd)] = function (rT) {
          const AH = uv;
          if (!rS["el"]) {
            const rU = of(oZ, ![]);
            (rU[AH(0x81c)] = function () {
              if (p1 || p3) return;
              p7(null);
            }),
              rS[AH(0x6c4)](rU),
              (rS["el"] = rU);
          }
          (rS[AH(0x8a2)] += rT), p5(rS["el"][AH(0x9a7)], rS[AH(0x8a2)]);
        }),
        oh[uv(0x6c4)](rS),
        ok[uv(0xe68)](rS);
    }
    var ol,
      om = document[uv(0x91c)](uv(0x4d3)),
      on = document[uv(0x91c)](uv(0xb94)),
      oo = document[uv(0x91c)](uv(0x634)),
      op = document[uv(0x91c)](uv(0x1af)),
      oq = {};
    function or() {
      const AI = uv,
        rT = document[AI(0x91c)](AI(0xdfb));
      for (let rU = 0x0; rU < dH; rU++) {
        const rV = nQ(AI(0x10e) + rU + AI(0xaca));
        (rV[AI(0x81c)] = function () {
          const AJ = AI;
          let rW = pp;
          pp = !![];
          for (const rX in oa) {
            const rY = dC[rX];
            if (rY[AJ(0x2a3)] !== rU) continue;
            const rZ = oa[rX];
            rZ[AJ(0xceb)][AJ(0x336)]();
          }
          pp = rW;
        }),
          (oq[rU] = rV),
          rT[AI(0x6c4)](rV);
      }
    }
    or();
    var os = ![],
      ot = document[uv(0x91c)](uv(0x611));
    ot[uv(0x81c)] = function () {
      const AK = uv;
      document[AK(0xd97)][AK(0xdd8)][AK(0xbf1)](AK(0x896)),
        (os = document[AK(0xd97)][AK(0xdd8)][AK(0xd6c)](AK(0x896)));
      const rT = os ? AK(0x18c) : AK(0x836);
      k8(on, rT),
        k8(op, rT),
        os
          ? (om[AK(0x6c4)](og), og[AK(0x6c4)](nW), oo[AK(0x2b0)]())
          : (om[AK(0x6c4)](oo),
            oo[AK(0x6c0)](nW, oo[AK(0x1ac)]),
            og[AK(0x2b0)]());
    };
    var ou = document[uv(0x91c)](uv(0xc48)),
      ov = oy(uv(0x2ed), nD[uv(0x2f3)]),
      ow = oy(uv(0xb15), nD[uv(0x9b2)]),
      ox = oy(uv(0xa5c), nD[uv(0xc9a)]);
    function oy(rT, rU) {
      const AL = uv,
        rV = nQ(AL(0xdd9) + rU + AL(0x499) + rT + AL(0xe71));
      return (
        (rV[AL(0xc8a)] = function (rW) {
          const AM = AL;
          k8(rV[AM(0xba2)][0x1], k9(Math[AM(0x423)](rW)));
        }),
        ou[AL(0x6c4)](rV),
        rV
      );
    }
    var oz = document[uv(0x91c)](uv(0x3b7)),
      oA = document[uv(0x91c)](uv(0xb4c));
    oA[uv(0x63c)] = "";
    var oB = document[uv(0x91c)](uv(0xb62)),
      oC = {};
    function oD() {
      const AN = uv;
      (oA[AN(0x63c)] = ""), (oB[AN(0x63c)] = "");
      const rT = {},
        rU = [];
      for (let rV in oC) {
        const rW = dC[rV],
          rX = oC[rV];
        (rT[rW[AN(0x2a3)]] = (rT[rW[AN(0x2a3)]] || 0x0) + rX),
          rU[AN(0xe68)]([rW, rX]);
      }
      if (rU[AN(0xd55)] === 0x0) {
        oz[AN(0xa71)][AN(0x3c1)] = AN(0x846);
        return;
      }
      (oz[AN(0xa71)][AN(0x3c1)] = ""),
        rU[AN(0x3a4)]((rY, rZ) => {
          return oe(rY[0x0], rZ[0x0]);
        })[AN(0x275)](([rY, rZ]) => {
          const AO = AN,
            s0 = of(rY);
          jY(s0), p5(s0[AO(0x9a7)], rZ), oA[AO(0x6c4)](s0);
        }),
        oE(oB, rT);
    }
    function oE(rT, rU) {
      const AP = uv;
      let rV = 0x0;
      for (let rW in d9) {
        const rX = rU[d9[rW]];
        if (rX !== void 0x0) {
          rV++;
          const rY = nQ(
            AP(0xdae) + k9(rX) + "\x20" + rW + AP(0x483) + hP[rW] + AP(0x13d)
          );
          rT[AP(0xe32)](rY);
        }
      }
      rV % 0x2 === 0x1 &&
        (rT[AP(0xba2)][0x0][AP(0xa71)][AP(0x3a8)] = AP(0xa37));
    }
    var oF = {},
      oG = 0x0,
      oH,
      oI,
      oJ,
      oK,
      oL = 0x0,
      oM = 0x0,
      oN = 0x0,
      oO = 0x0,
      oP = 0x0;
    function oQ() {
      const AQ = uv,
        rT = d4(oG);
      (oH = rT[0x0]),
        (oI = rT[0x1]),
        (oK = d2(oH + 0x1)),
        (oJ = oG - oI),
        k8(
          o4,
          AQ(0x1b9) + (oH + 0x1) + AQ(0xdb1) + iJ(oJ) + "/" + iJ(oK) + AQ(0x820)
        );
      const rU = d6(oH);
      ov[AQ(0xc8a)](0xc8 * rU),
        ow[AQ(0xc8a)](0x19 * rU),
        ox[AQ(0xc8a)](d5(oH)),
        hack.hp = 0xc8 * rU,
        (oM = Math[AQ(0x77f)](0x1, oJ / oK)),
        (oO = 0x0),
        (nZ[AQ(0x91c)](AQ(0xb9b))[AQ(0x63c)] =
          oH >= cH ? AQ(0xc92) : AQ(0x99e) + (cH + 0x1) + AQ(0x13a));
    }
    var oR = 0x0,
      oS = document[uv(0x91c)](uv(0x3e3));
    for (let rT = 0x0; rT < cZ[uv(0xd55)]; rT++) {
      const [rU, rV] = cZ[rT],
        rW = j7[rU],
        rX = nQ(
          uv(0x18b) +
            hP[rW] +
            uv(0x4b6) +
            rW +
            uv(0x637) +
            (rV + 0x1) +
            uv(0xa53)
        );
      (rX[uv(0x81c)] = function () {
        const AR = uv;
        if (oH >= rV) {
          const rY = oS[AR(0x91c)](AR(0xd7c));
          rY && rY[AR(0xdd8)][AR(0x2b0)](AR(0x65f)),
            (oR = rT),
            (hD[AR(0xa43)] = rT),
            this[AR(0xdd8)][AR(0x1b1)](AR(0x65f));
        }
      }),
        (cZ[rT][uv(0xb50)] = rX),
        oS[uv(0x6c4)](rX);
    }
    function oT() {
      const AS = uv,
        rY = parseInt(hD[AS(0xa43)]) || 0x0;
      cZ[0x0][AS(0xb50)][AS(0x336)](),
        cZ[AS(0x275)]((rZ, s0) => {
          const AT = AS,
            s1 = rZ[0x1];
          if (oH >= s1) {
            rZ[AT(0xb50)][AT(0xdd8)][AT(0x2b0)](AT(0x53b));
            if (rY === s0) rZ[AT(0xb50)][AT(0x336)]();
          } else rZ[AT(0xb50)][AT(0xdd8)][AT(0x1b1)](AT(0x53b));
        });
    }
    var oU = document[uv(0x91c)](uv(0x957));
    setInterval(() => {
      const AU = uv;
      if (!om[AU(0xdd8)][AU(0xd6c)](AU(0x7f0))) return;
      oV();
    }, 0x3e8);
    function oV() {
      const AV = uv;
      if (jZ) {
        let rY = 0x0;
        for (const s0 in jZ) {
          rY += oW(s0, jZ[s0]);
        }
        let rZ = 0x0;
        for (const s1 in oF) {
          const s2 = oW(s1, oF[s1][AV(0x8a2)]);
          (rZ += s2), (rY += s2);
        }
        if (rZ > 0x0) {
          const s3 = Math[AV(0x77f)](0x19, (rZ / rY) * 0x64),
            s4 = s3 > 0x1 ? s3[AV(0x165)](0x2) : s3[AV(0x165)](0x5);
          k8(oU, "+" + s4 + "%");
        }
      }
    }
    function oW(rY, rZ) {
      const AW = uv,
        s0 = dC[rY];
      if (!s0) return 0x0;
      const s1 = s0[AW(0x2a3)];
      return Math[AW(0xa4e)](s1 * 0xa, s1) * rZ;
    }
    var oX = document[uv(0x91c)](uv(0x9d1));
    (oX[uv(0x81c)] = function () {
      const AX = uv;
      for (const rY in oF) {
        const rZ = oF[rY];
        rZ[AX(0x8f2)]();
      }
      oY();
    }),
      oY(),
      oQ();
    function oY() {
      const AY = uv,
        rY = Object[AY(0x384)](oF);
      nY[AY(0xdd8)][AY(0x2b0)](AY(0xd9c));
      const rZ = rY[AY(0xd55)] === 0x0;
      (oX[AY(0xa71)][AY(0x3c1)] = rZ ? AY(0x846) : ""), (oP = 0x0);
      let s0 = 0x0;
      const s1 = rY[AY(0xd55)] > 0x1 ? 0x32 : 0x0;
      for (let s3 = 0x0, s4 = rY[AY(0xd55)]; s3 < s4; s3++) {
        const s5 = rY[s3],
          s6 = (s3 / s4) * Math["PI"] * 0x2;
        s5[AY(0x6c3)](
          Math[AY(0xe44)](s6) * s1 + 0x32,
          Math[AY(0x88e)](s6) * s1 + 0x32
        ),
          (oP += d3[s5["el"][AY(0x6d2)][AY(0x2a3)]] * s5[AY(0x8a2)]);
      }
      nY[AY(0xdd8)][s1 ? AY(0x1b1) : AY(0x2b0)](AY(0xd9c)),
        nX[AY(0xdd8)][rY[AY(0xd55)] > 0x0 ? AY(0x2b0) : AY(0x1b1)](AY(0xc5e));
      const s2 = oH >= cH;
      nZ[AY(0xdd8)][rY[AY(0xd55)] > 0x0 && s2 ? AY(0x2b0) : AY(0x1b1)](
        AY(0x53b)
      ),
        oV(),
        (nY[AY(0xa71)][AY(0xde3)] = ""),
        (o5 = ![]),
        (o7 = ![]),
        (o6 = 0x0),
        (oL = Math[AY(0x77f)](0x1, (oJ + oP) / oK) || 0x0),
        k8(o3, oP > 0x0 ? "+" + iJ(oP) + AY(0x820) : "");
    }
    var oZ,
      p0 = 0x0,
      p1 = ![],
      p2 = 0x0,
      p3 = null;
    function p4() {
      const AZ = uv;
      oi[AZ(0xdd8)][p0 < 0x5 ? AZ(0x1b1) : AZ(0x2b0)](AZ(0xc5e));
    }
    oi[uv(0x81c)] = function () {
      const B0 = uv;
      if (p1 || !oZ || p0 < 0x5 || !ik() || p3) return;
      (p1 = !![]), (p2 = 0x0), (p3 = null), oi[B0(0xdd8)][B0(0x1b1)](B0(0xc5e));
      const rY = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      rY[B0(0x1fc)](0x0, cI[B0(0xb86)]),
        rY[B0(0x140)](0x1, oZ["id"]),
        rY[B0(0x555)](0x3, p0),
        il(rY);
    };
    function p5(rY, rZ) {
      k8(rY, "x" + iJ(rZ));
    }
    function p6(rY) {
      const B1 = uv;
      typeof rY === B1(0xe0c) && (rY = nG(rY)), k8(oj, rY + B1(0x3d0));
    }
    function p7(rY) {
      const B2 = uv;
      oZ && n5(oZ["id"], p0);
      ol && ol[B2(0x336)]();
      (oZ = rY), (p0 = 0x0), p4();
      for (let rZ = 0x0; rZ < ok[B2(0xd55)]; rZ++) {
        ok[rZ][B2(0x441)]();
      }
      oZ
        ? (p6(dE[oZ[B2(0x2a3)]] * (jy ? 0x2 : 0x1) * (he ? 0.9 : 0x1)),
          (oi[B2(0xa71)][B2(0x2b1)] = hQ[oZ[B2(0x2a3)] + 0x1]))
        : p6("?");
    }
    var p8 = 0x0,
      p9 = 0x1;
    function pa(rY) {
      const B3 = uv,
        rZ = dC[rY],
        s0 = of(rZ);
      (s0[B3(0xc0a)] = ps), jY(s0), (s0[B3(0x4a5)] = !![]), o9[B3(0x6c4)](s0);
      const s1 = of(rZ);
      jY(s1), (s1[B3(0xc0a)] = om);
      rZ[B3(0x2a3)] >= dc && s1[B3(0xdd8)][B3(0x1b1)](B3(0xcbf));
      s1[B3(0x81c)] = function () {
        const B4 = B3;
        pP - p8 < 0x1f4 ? p9++ : (p9 = 0x1);
        p8 = pP;
        if (os) {
          if (p1 || rZ[B4(0x2a3)] >= dc) return;
          const s5 = iS[rZ["id"]];
          if (!s5) return;
          oZ !== rZ && p7(rZ);
          const s6 = ok[B4(0xd55)];
          let s7 = pp ? s5 : Math[B4(0x77f)](s6 * p9, s5);
          n5(rZ["id"], -s7), (p0 += s7), p4();
          let s8 = s7 % s6,
            s9 = (s7 - s8) / s6;
          const sa = [...ok][B4(0x3a4)](
            (sc, sd) => sc[B4(0x8a2)] - sd[B4(0x8a2)]
          );
          s9 > 0x0 && sa[B4(0x275)]((sc) => sc[B4(0x2bd)](s9));
          let sb = 0x0;
          while (s8--) {
            const sc = sa[sb];
            (sb = (sb + 0x1) % s6), sc[B4(0x2bd)](0x1);
          }
          return;
        }
        if (!oF[rZ["id"]]) {
          const sd = of(rZ, ![]);
          k8(sd[B4(0x9a7)], "x1"),
            (sd[B4(0x81c)] = function (sf) {
              const B5 = B4;
              se[B5(0x8f2)](), oY();
            }),
            nY[B4(0x6c4)](sd);
          const se = {
            petal: rZ,
            count: 0x0,
            el: sd,
            setPos(sf, sg) {
              const B6 = B4;
              (sd[B6(0xa71)][B6(0x9c9)] = sf + "%"),
                (sd[B6(0xa71)][B6(0x8ed)] = sg + "%"),
                (sd[B6(0xa71)][B6(0x77a)] = B6(0x1ae));
            },
            dispose(sf = !![]) {
              const B7 = B4;
              sd[B7(0x2b0)](),
                sf && n5(rZ["id"], this[B7(0x8a2)]),
                delete oF[rZ["id"]];
            },
          };
          (oF[rZ["id"]] = se), oY();
        }
        const s4 = oF[rZ["id"]];
        if (iS[rZ["id"]]) {
          const sf = iS[rZ["id"]],
            sg = pp ? sf : Math[B4(0x77f)](0x1 * p9, sf);
          (s4[B4(0x8a2)] += sg),
            n5(rZ["id"], -sg),
            p5(s4["el"][B4(0x9a7)], s4[B4(0x8a2)]);
        }
        oY();
      };
      const s2 = dH * rZ[B3(0xd91)] + rZ[B3(0xd3b)],
        s3 = o8[s2];
      return (
        nW[B3(0x6c0)](s1, s3),
        s3[B3(0x2b0)](),
        (o8[s2] = s1),
        (s0[B3(0x2d3)] = function (s4) {
          const B8 = B3;
          p5(s0[B8(0x9a7)], s4), p5(s1[B8(0x9a7)], s4);
        }),
        (s0[B3(0xceb)] = s1),
        (oa[rY] = s0),
        (s0[B3(0x8f2)] = function () {
          const B9 = B3;
          s0[B9(0x2b0)](), delete oa[rY];
          const s4 = nQ(B9(0x784));
          (o8[s2] = s4), nW[B9(0x6c0)](s4, s1), s1[B9(0x2b0)]();
        }),
        s0[B3(0x2d3)](iS[rY]),
        s0
      );
    }
    var pb = {},
      pc = {};
    function pd(rY, rZ, s0, s1) {
      const Ba = uv,
        s2 = document[Ba(0x91c)](s0);
      (s2[Ba(0x220)] = function () {
        const Bb = Ba;
        (pb[rY] = this[Bb(0xc4e)]),
          (hD[rY] = this[Bb(0xc4e)] ? "1" : "0"),
          s1 && s1(this[Bb(0xc4e)]);
      }),
        (pc[rY] = function () {
          const Bc = Ba;
          s2[Bc(0x336)]();
        }),
        (s2[Ba(0xc4e)] = hD[rY] === void 0x0 ? rZ : hD[rY] === "1"),
        s2[Ba(0x220)]();
    }
    var pe = document[uv(0x91c)](uv(0x6e5));
    (pe[uv(0x6d2)] = function () {
      const Bd = uv;
      return nQ(
        Bd(0x93d) + hP[Bd(0x721)] + Bd(0x25f) + hP[Bd(0x31b)] + Bd(0xcdf)
      );
    }),
      pd(uv(0x229), ![], uv(0x912), mH),
      pd(uv(0x8c6), !![], uv(0xcae)),
      pd(uv(0x9ea), !![], uv(0x5bc)),
      pd(
        uv(0x24e),
        !![],
        uv(0x1e8),
        (rY) => (kK[uv(0xa71)][uv(0x3c1)] = rY ? "" : uv(0x846))
      ),
      pd(uv(0xb39), ![], uv(0x447)),
      pd(uv(0xe48), ![], uv(0x8a7)),
      pd(uv(0xb3c), ![], uv(0x491)),
      pd(uv(0x1e0), !![], uv(0x976)),
      pd(
        uv(0x3c6),
        !![],
        uv(0xd57),
        (rY) => (pe[uv(0xa71)][uv(0x3c1)] = rY ? "" : uv(0x846))
      ),
      pd(uv(0xbe4), ![], uv(0xca9), kT),
      pd(uv(0xe2e), ![], uv(0x321), kX),
      pd(uv(0x133), ![], uv(0xd03), (rY) => pf(ko, uv(0xa54), rY)),
      pd(uv(0x9d7), !![], uv(0x1e3), (rY) =>
        pf(document[uv(0xd97)], uv(0xe75), !rY)
      ),
      pd(uv(0xa03), !![], uv(0xbdd), (rY) =>
        pf(document[uv(0xd97)], uv(0x311), !rY)
      ),
      pd(uv(0x33d), !![], uv(0x874)),
      pd(uv(0xe0d), ![], uv(0x8cc)),
      pd(uv(0x958), ![], uv(0x4f8)),
      pd(uv(0x4ef), ![], uv(0xaff)),
      pd(uv(0x774), ![], uv(0x7ab), (rY) => {
        const Be = uv;
        pf(document[Be(0xd97)], Be(0xccd), rY), iB();
      });
    function pf(rY, rZ, s0) {
      const Bf = uv;
      rY[Bf(0xdd8)][s0 ? Bf(0x1b1) : Bf(0x2b0)](rZ);
    }
    function pg() {
      const Bg = uv,
        rY = document[Bg(0x91c)](Bg(0x6de)),
        rZ = [];
      for (let s1 = 0x0; s1 <= 0xa; s1++) {
        rZ[Bg(0xe68)](0x1 - s1 * 0.05);
      }
      for (const s2 of rZ) {
        const s3 = nQ(Bg(0x7de) + s2 + "\x22>" + nG(s2 * 0x64) + Bg(0x6af));
        rY[Bg(0x6c4)](s3);
      }
      let s0 = parseFloat(hD[Bg(0x81a)]);
      (isNaN(s0) || !rZ[Bg(0xc88)](s0)) && (s0 = rZ[0x0]),
        (rY[Bg(0x2e6)] = s0),
        (kP = s0),
        (rY[Bg(0x220)] = function () {
          const Bh = Bg;
          (kP = parseFloat(this[Bh(0x2e6)])),
            (hD[Bh(0x81a)] = this[Bh(0x2e6)]),
            kX();
        });
    }
    pg();
    var ph = document[uv(0x91c)](uv(0x94a)),
      pi = document[uv(0x91c)](uv(0xc87));
    pi[uv(0x63e)] = cL;
    var pj = document[uv(0x91c)](uv(0x208));
    function pk(rY) {
      const Bi = uv,
        rZ = nQ(Bi(0xa9e));
      kl[Bi(0x6c4)](rZ);
      const s0 = rZ[Bi(0x91c)](Bi(0xd82));
      s0[Bi(0x2e6)] = rY;
      const s1 = rZ[Bi(0x91c)](Bi(0x452));
      (s1[Bi(0x220)] = function () {
        const Bj = Bi;
        s0[Bj(0x8fa)] = this[Bj(0xc4e)] ? Bj(0x9d5) : Bj(0xd88);
      }),
        (rZ[Bi(0x91c)](Bi(0x838))[Bi(0x81c)] = function () {
          const Bk = Bi;
          jp(rY), hc(Bk(0xdf3));
        }),
        (rZ[Bi(0x91c)](Bi(0x649))[Bi(0x81c)] = function () {
          const Bl = Bi,
            s2 = {};
          s2[Bl(0x8fa)] = Bl(0xd4f);
          const s3 = new Blob([rY], s2),
            s4 = document[Bl(0xa69)]("a");
          (s4[Bl(0x4a6)] = URL[Bl(0x580)](s3)),
            (s4[Bl(0xbe0)] = (jv ? jv : Bl(0x8bb)) + Bl(0xb7d)),
            s4[Bl(0x336)](),
            hc(Bl(0xd11));
        }),
        (rZ[Bi(0x91c)](Bi(0xd3e))[Bi(0x81c)] = function () {
          const Bm = Bi;
          rZ[Bm(0x2b0)]();
        });
    }
    function pl() {
      const Bn = uv,
        rY = nQ(Bn(0x506));
      kl[Bn(0x6c4)](rY);
      const rZ = rY[Bn(0x91c)](Bn(0xd82)),
        s0 = rY[Bn(0x91c)](Bn(0x452));
      (s0[Bn(0x220)] = function () {
        const Bo = Bn;
        rZ[Bo(0x8fa)] = this[Bo(0xc4e)] ? Bo(0x9d5) : Bo(0xd88);
      }),
        (rY[Bn(0x91c)](Bn(0xd3e))[Bn(0x81c)] = function () {
          const Bp = Bn;
          rY[Bp(0x2b0)]();
        }),
        (rY[Bn(0x91c)](Bn(0xbd1))[Bn(0x81c)] = function () {
          const Bq = Bn,
            s1 = rZ[Bq(0x2e6)][Bq(0x810)]();
          if (eV(s1)) {
            delete hD[Bq(0xa38)], (hD[Bq(0x7d4)] = s1);
            if (hU)
              try {
                hU[Bq(0x145)]();
              } catch (s2) {}
            hc(Bq(0x6da));
          } else hc(Bq(0x480));
        });
    }
    (document[uv(0x91c)](uv(0x48d))[uv(0x81c)] = function () {
      const Br = uv;
      if (i5) {
        pk(i5);
        return;
        const rY = prompt(Br(0x793), i5);
        if (rY !== null) {
          const rZ = {};
          rZ[Br(0x8fa)] = Br(0xd4f);
          const s0 = new Blob([i5], rZ),
            s1 = document[Br(0xa69)]("a");
          (s1[Br(0x4a6)] = URL[Br(0x580)](s0)),
            (s1[Br(0xbe0)] = jv + Br(0x6c6)),
            s1[Br(0x336)](),
            alert(Br(0x67d));
        }
      }
    }),
      (document[uv(0x91c)](uv(0xba0))[uv(0x81c)] = function () {
        const Bs = uv;
        pl();
        return;
        const rY = prompt(Bs(0xbca));
        if (rY !== null) {
          if (eV(rY)) {
            let rZ = Bs(0xb1a);
            i6 && (rZ += Bs(0xbb8));
            if (confirm(rZ)) {
              delete hD[Bs(0xa38)], (hD[Bs(0x7d4)] = rY);
              if (hU)
                try {
                  hU[Bs(0x145)]();
                } catch (s0) {}
            }
          } else alert(Bs(0x480));
        }
      }),
      pd(uv(0x459), ![], uv(0x188), (rY) =>
        pi[uv(0xdd8)][rY ? uv(0x1b1) : uv(0x2b0)](uv(0x8ee))
      ),
      pd(uv(0x416), !![], uv(0x728));
    var pm = 0x0,
      pn = 0x0,
      po = 0x0,
      pp = ![];
    function pq(rY, rZ) {
      const Bt = uv;
      (rY === Bt(0x913) || rY === Bt(0xd58)) && (pp = rZ);
      if (rZ) {
        switch (rY) {
          case Bt(0x9f4):
            m2[Bt(0x717)][Bt(0xbf1)]();
            break;
          case Bt(0x55f):
            m2[Bt(0xc6c)][Bt(0xbf1)]();
            break;
          case Bt(0x799):
            m2[Bt(0xe3d)][Bt(0xbf1)]();
            break;
          case Bt(0x38a):
            q2[Bt(0xdd8)][Bt(0xbf1)](Bt(0x65f));
            break;
          case Bt(0x1fb):
            pc[Bt(0x229)](), hc(Bt(0x867) + (pb[Bt(0x229)] ? "ON" : Bt(0xc41)));
            break;
          case Bt(0xd86):
            pc[Bt(0xe0d)](), hc(Bt(0x48e) + (pb[Bt(0xe0d)] ? "ON" : Bt(0xc41)));
            break;
          case Bt(0x36a):
            pc[Bt(0xb39)](), hc(Bt(0xc37) + (pb[Bt(0xb39)] ? "ON" : Bt(0xc41)));
            break;
          case Bt(0x67e):
            pc[Bt(0xe48)](), hc(Bt(0x70c) + (pb[Bt(0xe48)] ? "ON" : Bt(0xc41)));
            break;
          case Bt(0x10d):
            pc[Bt(0x24e)](), hc(Bt(0x783) + (pb[Bt(0x24e)] ? "ON" : Bt(0xc41)));
            break;
          case Bt(0x7c2):
            pc[Bt(0xb3c)](), hc(Bt(0x944) + (pb[Bt(0xb3c)] ? "ON" : Bt(0xc41)));
            break;
          case Bt(0xe6a):
            if (!mK && hW) {
              const s0 = nz[Bt(0x729)](Bt(0x7cc)),
                s1 = nA[Bt(0x729)](Bt(0x7cc));
              for (let s2 = 0x0; s2 < s0[Bt(0xd55)]; s2++) {
                const s3 = s0[s2],
                  s4 = s1[s2],
                  s5 = n8(s3),
                  s6 = n8(s4);
                if (s5) n9(s5, s4);
                else s6 && n9(s6, s3);
              }
              il(new Uint8Array([cI[Bt(0xa73)]]));
            }
            break;
          default:
            if (
              !mK &&
              hW &&
              (rY[Bt(0x307)](Bt(0xb18)) || rY[Bt(0x307)](Bt(0x516)))
            )
              se: {
                let s7 = parseInt(
                  rY[Bt(0x7ce)](rY[Bt(0x307)](Bt(0xb18)) ? 0x5 : 0x6)
                );
                if (nn[Bt(0x10d)]) {
                  pp ? ku(s7) : kx(s7);
                  break se;
                }
                s7 === 0x0 && (s7 = 0xa);
                iN > 0xa && pp && (s7 += 0xa);
                s7--;
                if (s7 >= 0x0) {
                  const s8 = nz[Bt(0x729)](Bt(0x7cc))[s7],
                    s9 = nA[Bt(0x729)](Bt(0x7cc))[s7];
                  if (s8 && s9) {
                    const sa = n8(s8),
                      sb = n8(s9);
                    if (sa) n9(sa, s9);
                    else sb && n9(sb, s8);
                  }
                }
                n7(s7, s7 + iN);
              }
        }
        nn[rY] = !![];
      } else
        rY === Bt(0xbd6) &&
          (kk[Bt(0xa71)][Bt(0x3c1)] === "" &&
          pi[Bt(0xa71)][Bt(0x3c1)] === Bt(0x846)
            ? kD[Bt(0x336)]()
            : pi[Bt(0x2dd)]()),
          delete nn[rY];
      if (iy) {
        if (pb[Bt(0x229)]) {
          let sc = 0x0,
            sd = 0x0;
          if (nn[Bt(0x2b3)] || nn[Bt(0x18e)]) sd = -0x1;
          else (nn[Bt(0xe3f)] || nn[Bt(0xa81)]) && (sd = 0x1);
          if (nn[Bt(0xada)] || nn[Bt(0x724)]) sc = -0x1;
          else (nn[Bt(0x6ea)] || nn[Bt(0x415)]) && (sc = 0x1);
          if (sc !== 0x0 || sd !== 0x0)
            (pm = Math[Bt(0x5c6)](sd, sc)), im(pm, 0x1);
          else (pn !== 0x0 || po !== 0x0) && im(pm, 0x0);
          (pn = sc), (po = sd);
        }
        pr();
      }
    }
    function pr() {
      const Bu = uv,
        rY = nn[Bu(0xe2f)] || nn[Bu(0xd58)] || nn[Bu(0x913)],
        rZ = nn[Bu(0x155)] || nn[Bu(0x80f)],
        s0 = (rY << 0x1) | rZ;
      na !== s0 && ((na = s0), il(new Uint8Array([cI[Bu(0x9b8)], s0])));
    }
    var ps = document[uv(0x91c)](uv(0xbeb)),
      pt = 0x0,
      pu = 0x0,
      pv = 0x0;
    function pw(rY, rZ, s0) {
      const Bv = uv;
      return rY + (rZ - rY) * Math[Bv(0x77f)](0x1, pQ / s0);
    }
    var px = 0x1,
      py = [];
    for (let rY in cS) {
      if (
        [uv(0x684), uv(0xd41), uv(0xa19), uv(0xd95), uv(0x9a8), uv(0x856)][
          uv(0xc88)
        ](rY)
      )
        continue;
      py[uv(0xe68)](cS[rY]);
    }
    var pz = [];
    for (let rZ = 0x0; rZ < 0x1e; rZ++) {
      pA();
    }
    function pA(s0 = !![]) {
      const Bw = uv,
        s1 = new lG(
          -0x1,
          py[Math[Bw(0xc8c)](Math[Bw(0xbf6)]() * py[Bw(0xd55)])],
          0x0,
          Math[Bw(0xbf6)]() * d1,
          Math[Bw(0xbf6)]() * 6.28
        );
      if (!s1[Bw(0xafc)] && Math[Bw(0xbf6)]() < 0.01) s1[Bw(0x6b2)] = !![];
      s1[Bw(0xafc)]
        ? (s1[Bw(0xc04)] = s1[Bw(0x3aa)] = Math[Bw(0xbf6)]() * 0x8 + 0xc)
        : (s1[Bw(0xc04)] = s1[Bw(0x3aa)] = Math[Bw(0xbf6)]() * 0x1e + 0x19),
        s0
          ? (s1["x"] = Math[Bw(0xbf6)]() * d0)
          : (s1["x"] = -s1[Bw(0x3aa)] * 0x2),
        (s1[Bw(0xa4d)] =
          (Math[Bw(0xbf6)]() * 0x3 + 0x4) * s1[Bw(0xc04)] * 0.02),
        (s1[Bw(0x94b)] = (Math[Bw(0xbf6)]() * 0x2 - 0x1) * 0.05),
        pz[Bw(0xe68)](s1);
    }
    var pB = 0x0,
      pC = 0x0,
      pD = 0x0,
      pE = 0x0;
    setInterval(function () {
      const Bx = uv,
        s0 = [ki, qu, ...Object[Bx(0x384)](pF), ...nN],
        s1 = s0[Bx(0xd55)];
      let s2 = 0x0;
      for (let s3 = 0x0; s3 < s1; s3++) {
        const s4 = s0[s3];
        s2 += s4[Bx(0x52e)] * s4[Bx(0xbc9)];
      }
      kK[Bx(0xe2b)](
        Bx(0x8e6),
        Math[Bx(0x423)](0x3e8 / pQ) +
          Bx(0x214) +
          iw[Bx(0xd55)] +
          Bx(0x9b0) +
          s1 +
          Bx(0x7ad) +
          iJ(s2) +
          Bx(0x6f0) +
          (pE / 0x3e8)[Bx(0x165)](0x2) +
          Bx(0x5ea)
      ),
        (pE = 0x0);
    }, 0x3e8);
    var pF = {};
    function pG(s0, s1, s2, s3, s4, s5 = ![]) {
      const By = uv;
      if (!pF[s1]) {
        const s8 = hx
          ? new OffscreenCanvas(0x1, 0x1)
          : document[By(0xa69)](By(0xb07));
        (s8[By(0x8fe)] = s8[By(0xaa8)]("2d")),
          (s8[By(0xbcc)] = 0x0),
          (s8[By(0x4f6)] = s2),
          (s8[By(0x4f3)] = s3),
          (pF[s1] = s8);
      }
      const s6 = pF[s1],
        s7 = s6[By(0x8fe)];
      if (pP - s6[By(0xbcc)] > 0x1f4) {
        s6[By(0xbcc)] = pP;
        const s9 = s0[By(0xb57)](),
          sa = Math[By(0x805)](s9["a"], s9["b"]) * 1.5,
          sb = kW * sa,
          sc = Math[By(0x9f9)](s6[By(0x4f6)] * sb) || 0x1;
        sc !== s6["w"] &&
          ((s6["w"] = sc),
          (s6[By(0x52e)] = sc),
          (s6[By(0xbc9)] = Math[By(0x9f9)](s6[By(0x4f3)] * sb) || 0x1),
          s7[By(0x884)](),
          s7[By(0x28b)](sb, sb),
          s4(s7),
          s7[By(0x915)]());
      }
      s6[By(0x8c8)] = !![];
      if (s5) return s6;
      s0[By(0x6b3)](
        s6,
        -s6[By(0x4f6)] / 0x2,
        -s6[By(0x4f3)] / 0x2,
        s6[By(0x4f6)],
        s6[By(0x4f3)]
      );
    }
    var pH = /^((?!chrome|android).)*safari/i[uv(0x3e6)](navigator[uv(0x138)]),
      pI = pH ? 0.25 : 0x0;
    function pJ(s0, s1, s2 = 0x14, s3 = uv(0x46d), s4 = 0x4, s5, s6 = "") {
      const Bz = uv,
        s7 = Bz(0x63f) + s2 + Bz(0x7ec) + iA;
      let s8, s9;
      const sa = s1 + "_" + s7 + "_" + s3 + "_" + s4 + "_" + s6,
        sb = pF[sa];
      if (!sb) {
        s0[Bz(0xa00)] = s7;
        const sc = s0[Bz(0x850)](s1);
        (s8 = sc[Bz(0x52e)] + s4), (s9 = s2 + s4);
      } else (s8 = sb[Bz(0x4f6)]), (s9 = sb[Bz(0x4f3)]);
      return pG(
        s0,
        sa,
        s8,
        s9,
        function (sd) {
          const BA = Bz;
          sd[BA(0xe07)](s4 / 0x2, s4 / 0x2 - s9 * pI),
            (sd[BA(0xa00)] = s7),
            (sd[BA(0xd42)] = BA(0x8ed)),
            (sd[BA(0xd24)] = BA(0x9c9)),
            (sd[BA(0xade)] = s4),
            (sd[BA(0xc51)] = BA(0x1f0)),
            (sd[BA(0x6b8)] = s3),
            s4 > 0x0 && sd[BA(0x21f)](s1, 0x0, 0x0),
            sd[BA(0x790)](s1, 0x0, 0x0);
        },
        s5
      );
    }
    var pK = 0x1;
    function pL(s0 = cI[uv(0xc2f)]) {
      const BB = uv,
        s1 = Object[BB(0x384)](oF),
        s2 = new DataView(
          new ArrayBuffer(0x1 + 0x2 + s1[BB(0xd55)] * (0x2 + 0x4))
        );
      let s3 = 0x0;
      s2[BB(0x1fc)](s3++, s0), s2[BB(0x140)](s3, s1[BB(0xd55)]), (s3 += 0x2);
      for (let s4 = 0x0; s4 < s1[BB(0xd55)]; s4++) {
        const s5 = s1[s4];
        s2[BB(0x140)](s3, s5[BB(0x6d2)]["id"]),
          (s3 += 0x2),
          s2[BB(0x555)](s3, s5[BB(0x8a2)]),
          (s3 += 0x4);
      }
      il(s2);
    }
    function pM() {
      const BC = uv;
      ol[BC(0x2b0)](), oh[BC(0xdd8)][BC(0x2b0)](BC(0x8d1)), (ol = null);
    }
    var pN = [];
    function pO() {
      const BD = uv;
      for (let s0 = 0x0; s0 < pN[BD(0xd55)]; s0++) {
        const s1 = pN[s0],
          s2 = s1[BD(0xcef)],
          s3 = s2 && !s2[BD(0xc52)];
        s3
          ? ((s1[BD(0xc52)] = ![]),
            (s1[BD(0x8f8)] = s2[BD(0x8f8)]),
            (s1[BD(0x4fb)] = s2[BD(0x4fb)]),
            (s1[BD(0x586)] = s2[BD(0x586)]),
            (s1[BD(0x6eb)] = s2[BD(0x6eb)]),
            (s1[BD(0x34a)] = s2[BD(0x34a)]),
            (s1[BD(0x3cb)] = s2[BD(0x3cb)]),
            (s1[BD(0xb99)] = s2[BD(0xb99)]),
            (s1[BD(0xa32)] = s2[BD(0xa32)]),
            (s1[BD(0x45e)] = s2[BD(0x45e)]),
            (s1[BD(0x656)] = s2[BD(0x656)]),
            (s1[BD(0xd02)] = s2[BD(0xd02)]),
            (s1[BD(0x8de)] = s2[BD(0x8de)]),
            (s1[BD(0xb98)] = s2[BD(0xb98)]),
            (s1[BD(0x582)] = s2[BD(0x582)]),
            (s1[BD(0x48a)] = s2[BD(0x48a)]),
            j0(s1, s2))
          : ((s1[BD(0xc52)] = !![]),
            (s1[BD(0x722)] = 0x0),
            (s1[BD(0x4fb)] = 0x1),
            (s1[BD(0x8f8)] = 0x0),
            (s1[BD(0x586)] = ![]),
            (s1[BD(0x6eb)] = 0x0),
            (s1[BD(0x34a)] = 0x0),
            (s1[BD(0xb99)] = pw(s1[BD(0xb99)], 0x0, 0xc8)),
            (s1[BD(0x3cb)] = pw(s1[BD(0x3cb)], 0x0, 0xc8)),
            (s1[BD(0x48a)] = pw(s1[BD(0x48a)], 0x0, 0xc8)));
        if (s0 > 0x0) {
          if (s2) {
            const s4 = Math[BD(0x5c6)](s2["y"] - pu, s2["x"] - pt);
            s1[BD(0xd05)] === void 0x0
              ? (s1[BD(0xd05)] = s4)
              : (s1[BD(0xd05)] = f8(s1[BD(0xd05)], s4, 0.1));
          }
          s1[BD(0xccf)] += ((s3 ? -0x1 : 0x1) * pQ) / 0x320;
          if (s1[BD(0xccf)] < 0x0) s1[BD(0xccf)] = 0x0;
          s1[BD(0xccf)] > 0x1 && pN[BD(0x4f9)](s0, 0x1);
        }
      }
    }
    var pP = Date[uv(0xd3f)](),
      pQ = 0x0,
      pR = 0x0,
      pS = pP;
    function pT() {
      const BE = uv;
      (pP = Date[BE(0xd3f)]()),
        (pQ = pP - pS),
        (pS = pP),
        (pR = pQ / 0x21),
        hd();
      let s0 = 0x0;
      for (let s2 = 0x0; s2 < jX[BE(0xd55)]; s2++) {
        const s3 = jX[s2];
        if (!s3[BE(0x4eb)]) jX[BE(0x4f9)](s2, 0x1), s2--;
        else {
          if (
            (s3[BE(0xc0a)] &&
              !s3[BE(0xc0a)][BE(0xdd8)][BE(0xd6c)](BE(0x7f0))) ||
            s3[BE(0x3ff)][BE(0xa71)][BE(0x3c1)] === BE(0x846)
          )
            continue;
          else {
            jX[BE(0x4f9)](s2, 0x1),
              s2--,
              s3[BE(0xdd8)][BE(0x2b0)](BE(0x878)),
              s0++;
            if (s0 >= 0x14) break;
          }
        }
      }
      (pU[BE(0xcef)] = iy), pO();
      kC[BE(0xdd8)][BE(0xd6c)](BE(0x7f0)) && (lL = pP);
      if (hv) {
        const s4 = pP / 0x50,
          s5 = Math[BE(0x88e)](s4) * 0x7,
          s6 = Math[BE(0x911)](Math[BE(0x88e)](s4 / 0x4)) * 0.15 + 0.85;
        hu[BE(0xa71)][BE(0xde3)] = BE(0x844) + s5 + BE(0x658) + s6 + ")";
      } else hu[BE(0xa71)][BE(0xde3)] = BE(0x846);
      for (let s7 = jc[BE(0xd55)] - 0x1; s7 >= 0x0; s7--) {
        const s8 = jc[s7];
        if (s8[BE(0x372)]) {
          jc[BE(0x4f9)](s7, 0x1);
          continue;
        }
        s8[BE(0x67f)]();
      }
      for (let s9 = nN[BE(0xd55)] - 0x1; s9 >= 0x0; s9--) {
        const sa = nN[s9];
        if (!sa[BE(0x4eb)]) {
          nN[BE(0x4f9)](s9, 0x1);
          continue;
        }
        sa[BE(0xbce)]();
      }
      for (let sb = jb[BE(0xd55)] - 0x1; sb >= 0x0; sb--) {
        const sc = jb[sb];
        sc[BE(0x372)] &&
          sc["t"] <= 0x0 &&
          (sc[BE(0x2b0)](), jb[BE(0x4f9)](sb, 0x1)),
          (sc["t"] += ((sc[BE(0x372)] ? -0x1 : 0x1) * pQ) / sc[BE(0x1ec)]),
          (sc["t"] = Math[BE(0x77f)](0x1, Math[BE(0xb8e)](0x0, sc["t"]))),
          sc[BE(0xbce)]();
      }
      for (let sd = n2[BE(0xd55)] - 0x1; sd >= 0x0; sd--) {
        const se = n2[sd];
        if (!se["el"][BE(0x4eb)]) se[BE(0x424)] = ![];
        (se[BE(0xd80)] += ((se[BE(0x424)] ? 0x1 : -0x1) * pQ) / 0xc8),
          (se[BE(0xd80)] = Math[BE(0x77f)](
            0x1,
            Math[BE(0xb8e)](se[BE(0xd80)])
          ));
        if (!se[BE(0x424)] && se[BE(0xd80)] <= 0x0) {
          n2[BE(0x4f9)](sd, 0x1), se[BE(0x2b0)]();
          continue;
        }
        se[BE(0xa71)][BE(0x572)] = se[BE(0xd80)];
      }
      if (p1) {
        p2 += pQ / 0x7d0;
        if (p2 > 0x1) {
          p2 = 0x0;
          if (p3) {
            p1 = ![];
            const sf = oZ[BE(0x227)],
              sg = p3[BE(0x821)];
            if (p3[BE(0x8eb)] > 0x0)
              ok[BE(0x275)]((sh) => sh[BE(0x441)]()),
                n5(oZ["id"], sg),
                (p0 = 0x0),
                p6("?"),
                oh[BE(0xdd8)][BE(0x1b1)](BE(0x8d1)),
                (ol = of(sf)),
                oh[BE(0x6c4)](ol),
                p5(ol[BE(0x9a7)], p3[BE(0x8eb)]),
                (ol[BE(0x81c)] = function () {
                  const BF = BE;
                  n5(sf["id"], p3[BF(0x8eb)]), pM(), (p3 = null);
                });
            else {
              p0 = sg;
              const sh = [...ok][BE(0x3a4)](() => Math[BE(0xbf6)]() - 0.5);
              for (let si = 0x0, sj = sh[BE(0xd55)]; si < sj; si++) {
                const sk = sh[si];
                si >= sg ? sk[BE(0x441)]() : sk[BE(0x2bd)](0x1 - sk[BE(0x8a2)]);
              }
              p3 = null;
            }
            p4();
          }
        }
      }
      for (let sl = 0x0; sl < ok[BE(0xd55)]; sl++) {
        ok[sl][BE(0x68d)](p2);
      }
      for (let sm in nj) {
        const sn = nj[sm];
        if (!sn) {
          delete nj[sm];
          continue;
        }
        for (let so = sn[BE(0xd55)] - 0x1; so >= 0x0; so--) {
          const sp = sn[so];
          sp["t"] += pQ;
          if (sp[BE(0xd6a)]) sp["t"] > lX && sn[BE(0x4f9)](so, 0x1);
          else {
            if (sp["t"] > lU) {
              const sq = 0x1 - Math[BE(0x77f)](0x1, (sp["t"] - lU) / 0x7d0);
              (sp[BE(0xa71)][BE(0x572)] = sq),
                sq <= 0x0 && sn[BE(0x4f9)](so, 0x1);
            }
          }
        }
        sn[BE(0xd55)] === 0x0 && delete nj[sm];
      }
      if (o5)
        sK: {
          if (ik()) {
            (o6 += pQ),
              (nY[BE(0xa71)][BE(0xde3)] =
                BE(0x5f5) +
                (Math[BE(0x88e)](Date[BE(0xd3f)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (o6 > 0x3e8) {
              if (o7) {
                pL(cI[BE(0x614)]), m1(![]);
                break sK;
              }
              (o5 = ![]),
                (o7 = ![]),
                (o6 = 0x0),
                pL(),
                (oG += oP),
                oQ(),
                oT(),
                m1(![]);
              const sr = d5(oH);
              if (sr !== iN) {
                const ss = sr - iN;
                for (let su = 0x0; su < iN; su++) {
                  const sv = nA[BE(0xba2)][su];
                  sv[BE(0x83c)] += ss;
                }
                const st = nA[BE(0x1ac)][BE(0x83c)] + 0x1;
                for (let sw = 0x0; sw < ss; sw++) {
                  const sx = nQ(BE(0xd94));
                  (sx[BE(0x83c)] = iN + sw), nz[BE(0x6c4)](sx);
                  const sy = nQ(BE(0xd94));
                  (sy[BE(0x83c)] = st + sw),
                    sy[BE(0x6c4)](
                      nQ(BE(0xc4f) + ((sx[BE(0x83c)] + 0x1) % 0xa) + BE(0xc39))
                    ),
                    nA[BE(0x6c4)](sy);
                }
                (iN = sr), (iO = iN * 0x2);
              }
            }
          } else (o5 = ![]), (o7 = ![]), (o6 = 0x0);
        }
      (oO = pw(oO, oM, 0x64)),
        (oN = pw(oN, oL, 0x64)),
        (o1[BE(0xa71)][BE(0x52e)] = oO * 0x64 + "%"),
        (o2[BE(0xa71)][BE(0x52e)] = oN * 0x64 + "%");
      for (let sz in pF) {
        !pF[sz][BE(0x8c8)] ? delete pF[sz] : (pF[sz][BE(0x8c8)] = ![]);
      }
      (nb = pw(nb, nd, 0x32)), (nc = pw(nc, ne, 0x32));
      const s1 = Math[BE(0x77f)](0x64, pQ) / 0x3c;
      pW -= 0x3 * s1;
      for (let sA = pz[BE(0xd55)] - 0x1; sA >= 0x0; sA--) {
        const sB = pz[sA];
        (sB["x"] += sB[BE(0xa4d)] * s1),
          (sB["y"] += Math[BE(0x88e)](sB[BE(0x582)] * 0x2) * 0.8 * s1),
          (sB[BE(0x582)] += sB[BE(0x94b)] * s1),
          (sB[BE(0xb98)] += 0.002 * pQ),
          (sB[BE(0xd09)] = !![]);
        const sC = sB[BE(0x3aa)] * 0x2;
        (sB["x"] >= d0 + sC || sB["y"] < -sC || sB["y"] >= d1 + sC) &&
          (pz[BE(0x4f9)](sA, 0x1), pA(![]));
      }
      for (let sD = 0x0; sD < iG[BE(0xd55)]; sD++) {
        iG[sD][BE(0xbce)]();
      }
      pv = Math[BE(0xb8e)](0x0, pv - pQ / 0x12c);
      if (pb[BE(0x8c6)] && pv > 0x0) {
        const sE = Math[BE(0xbf6)]() * 0x2 * Math["PI"],
          sF = pv * 0x3;
        (qK = Math[BE(0xe44)](sE) * sF), (qL = Math[BE(0x88e)](sE) * sF);
      } else (qK = 0x0), (qL = 0x0);
      (px = pw(px, pK, 0xc8)), (ng = pw(ng, nf, 0x64));
      for (let sG = mJ[BE(0xd55)] - 0x1; sG >= 0x0; sG--) {
        const sH = mJ[sG];
        sH[BE(0xbce)](), sH[BE(0x86e)] && mJ[BE(0x4f9)](sG, 0x1);
      }
      for (let sI = iw[BE(0xd55)] - 0x1; sI >= 0x0; sI--) {
        const sJ = iw[sI];
        sJ[BE(0xbce)](),
          sJ[BE(0xc52)] && sJ[BE(0x722)] > 0x1 && iw[BE(0x4f9)](sI, 0x1);
      }
      iy && ((pt = iy["x"]), (pu = iy["y"])), qI(), window[BE(0x1f1)](pT);
    }
    var pU = pV();
    function pV() {
      const BG = uv,
        s0 = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[BG(0xdf2)], 0x19);
      return (s0[BG(0xccf)] = 0x1), s0;
    }
    var pW = 0x0,
      pX = [uv(0xcfd), uv(0x35d), uv(0xb44)],
      pY = [];
    for (let s0 = 0x0; s0 < 0x3; s0++) {
      for (let s1 = 0x0; s1 < 0x3; s1++) {
        const s2 = pZ(pX[s0], 0x1 - 0.05 * s1);
        pY[uv(0xe68)](s2);
      }
    }
    function pZ(s3, s4) {
      const BH = uv;
      return q0(hA(s3)[BH(0xa9a)]((s5) => s5 * s4));
    }
    function q0(s3) {
      const BI = uv;
      return s3[BI(0xd33)](
        (s4, s5) => s4 + parseInt(s5)[BI(0x3ad)](0x10)[BI(0x644)](0x2, "0"),
        "#"
      );
    }
    function q1(s3) {
      const BJ = uv;
      return BJ(0x7fa) + s3[BJ(0x5aa)](",") + ")";
    }
    var q2 = document[uv(0x91c)](uv(0xb12));
    function q3() {
      const BK = uv,
        s3 = document[BK(0xa69)](BK(0xb07));
      s3[BK(0x52e)] = s3[BK(0xbc9)] = 0x3;
      const s4 = s3[BK(0xaa8)]("2d");
      for (let s5 = 0x0; s5 < pY[BK(0xd55)]; s5++) {
        const s6 = s5 % 0x3,
          s7 = (s5 - s6) / 0x3;
        (s4[BK(0x6b8)] = pY[s5]), s4[BK(0x234)](s6, s7, 0x1, 0x1);
        const s8 = j7[s5],
          s9 = j8[s5],
          sa = nQ(
            BK(0x84e) +
              s9 +
              BK(0x2f9) +
              ((s7 + 0.5) / 0x3) * 0x64 +
              BK(0xe49) +
              ((s6 + 0.5) / 0x3) * 0x64 +
              BK(0x365) +
              s8 +
              BK(0x13a)
          );
        q2[BK(0x6c0)](sa, q2[BK(0xba2)][0x0]);
      }
      q2[BK(0xa71)][BK(0x773)] = BK(0x5f4) + s3[BK(0x5af)]() + ")";
    }
    q3();
    var q4 = document[uv(0x91c)](uv(0x417)),
      q5 = document[uv(0x91c)](uv(0xace));
    function q6(s3, s4, s5) {
      const BL = uv;
      (s3[BL(0xa71)][BL(0x9c9)] = (s4 / j2) * 0x64 + "%"),
        (s3[BL(0xa71)][BL(0x8ed)] = (s5 / j2) * 0x64 + "%");
    }
    function q7() {
      const BM = uv,
        s3 = qN(),
        s4 = d0 / 0x2 / s3,
        s5 = d1 / 0x2 / s3,
        s6 = j4,
        s7 = Math[BM(0xb8e)](0x0, Math[BM(0xc8c)]((pt - s4) / s6) - 0x1),
        s8 = Math[BM(0xb8e)](0x0, Math[BM(0xc8c)]((pu - s5) / s6) - 0x1),
        s9 = Math[BM(0x77f)](j5 - 0x1, Math[BM(0x9f9)]((pt + s4) / s6)),
        sa = Math[BM(0x77f)](j5 - 0x1, Math[BM(0x9f9)]((pu + s5) / s6));
      kj[BM(0x884)](), kj[BM(0x28b)](s6, s6), kj[BM(0xa39)]();
      for (let sb = s7; sb <= s9 + 0x1; sb++) {
        kj[BM(0xb9f)](sb, s8), kj[BM(0xcac)](sb, sa + 0x1);
      }
      for (let sc = s8; sc <= sa + 0x1; sc++) {
        kj[BM(0xb9f)](s7, sc), kj[BM(0xcac)](s9 + 0x1, sc);
      }
      kj[BM(0x915)]();
      for (let sd = s7; sd <= s9; sd++) {
        for (let se = s8; se <= sa; se++) {
          kj[BM(0x884)](),
            kj[BM(0xe07)]((sd + 0.5) * s6, (se + 0.5) * s6),
            pJ(kj, sd + "," + se, 0x28, BM(0x46d), 0x6),
            kj[BM(0x915)]();
        }
      }
      (kj[BM(0xc51)] = BM(0x300)),
        (kj[BM(0xade)] = 0xa),
        (kj[BM(0xe0e)] = BM(0x423)),
        kj[BM(0x8e6)]();
    }
    function q8(s3, s4) {
      const BN = uv,
        s5 = nQ(BN(0x864) + s3 + BN(0x16e) + s4 + BN(0x5e6)),
        s6 = s5[BN(0x91c)](BN(0x3a1));
      return (
        km[BN(0x6c4)](s5),
        (s5[BN(0xc8a)] = function (s7) {
          const BO = BN;
          s7 > 0x0 && s7 !== 0x1
            ? (s6[BO(0xe2b)](BO(0xa71), BO(0xbbf) + s7 * 0x168 + BO(0xc7b)),
              s5[BO(0xdd8)][BO(0x1b1)](BO(0x7f0)))
            : s5[BO(0xdd8)][BO(0x2b0)](BO(0x7f0));
        }),
        km[BN(0x6c0)](s5, q2),
        s5
      );
    }
    var q9 = q8(uv(0x4a0), uv(0x228));
    q9[uv(0xdd8)][uv(0x1b1)](uv(0x8ed));
    var qa = nQ(uv(0x392) + hP[uv(0xd5d)] + uv(0xbf5));
    q9[uv(0xba2)][0x0][uv(0x6c4)](qa);
    var qb = q8(uv(0x326), uv(0x1b2)),
      qc = q8(uv(0xd44), uv(0xd12));
    qc[uv(0xdd8)][uv(0x1b1)](uv(0x9c4));
    var qd = uv(0x61f),
      qe = 0x2bc,
      qf = new lT("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cY[uv(0xdf2)], 0x19);
    qf[uv(0x8f8)] = 0x0;
    var qg = [
      [uv(0xa5d), uv(0xa09)],
      [uv(0x28d), uv(0x578)],
      [uv(0x7c4), uv(0x174)],
      [uv(0x764), uv(0x622), uv(0x960)],
      [uv(0xe2d), uv(0xb73)],
      [uv(0x339), uv(0x9af)],
      [uv(0x2c2), uv(0x8e8)],
    ];
    function qh() {
      const BP = uv;
      let s3 = "";
      const s4 = qg[BP(0xd55)] - 0x1;
      for (let s5 = 0x0; s5 < s4; s5++) {
        const s6 = qg[s5][0x0];
        (s3 += s6),
          s5 === s4 - 0x1
            ? (s3 += BP(0x984) + qg[s5 + 0x1][0x0] + ".")
            : (s3 += ",\x20");
      }
      return s3;
    }
    var qi = qh(),
      qj = document[uv(0x91c)](uv(0xbac));
    (qj[uv(0x6d2)] = function () {
      const BQ = uv;
      return nQ(
        BQ(0x990) +
          hP[BQ(0xadc)] +
          BQ(0xd04) +
          hP[BQ(0x31b)] +
          BQ(0x72f) +
          hP[BQ(0x721)] +
          BQ(0xdd7) +
          qi +
          BQ(0xb63)
      );
    }),
      (qj[uv(0x380)] = !![]);
    var qk =
      Date[uv(0xd3f)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[uv(0xc8c)](Math[uv(0xbf6)]() * qg[uv(0xd55)]);
    function ql() {
      const BR = uv,
        s3 = qg[qk];
      (qf[BR(0xa32)] = s3[0x0]), (qf[BR(0x82f)] = s3[0x1]);
      for (let s4 of iZ) {
        qf[s4] = Math[BR(0xbf6)]() > 0.5;
      }
      qk = (qk + 0x1) % qg[BR(0xd55)];
    }
    ql(),
      (qj[uv(0x81c)] = function () {
        const BS = uv;
        window[BS(0x274)](qf[BS(0x82f)], BS(0x306)), ql();
      });
    var qm = new lT(uv(0xda0), 0x0, -0x19, 0x0, 0x1, cY[uv(0xdf2)], 0x19);
    (qm[uv(0x8f8)] = 0x0), (qm[uv(0xce2)] = !![]);
    var qn = [
        uv(0x858),
        uv(0x4ed),
        uv(0xd65),
        uv(0x47e),
        uv(0x403),
        uv(0x38b),
        uv(0x89e),
      ],
      qo = [
        uv(0xe65),
        uv(0x283),
        uv(0x587),
        uv(0x953),
        uv(0x5b1),
        uv(0x2bb),
        uv(0x7b7),
        uv(0xb65),
      ],
      qp = 0x0;
    function qq() {
      const BT = uv,
        s3 = {};
      (s3[BT(0x9d5)] = qn[qp % qn[BT(0xd55)]]),
        (s3[BT(0xd6a)] = !![]),
        (s3[BT(0x204)] = ni["me"]),
        nm(BT(0xda0), s3),
        nm("yt", {
          text: qo[qp % qo[BT(0xd55)]][BT(0xb02)](
            BT(0x767),
            kE[BT(0x2e6)][BT(0x810)]() || BT(0x76c)
          ),
          isFakeChat: !![],
          col: ni["me"],
        }),
        qp++;
    }
    qq(), setInterval(qq, 0xfa0);
    var qr = 0x0,
      qs = Math[uv(0x9f9)](
        (Math[uv(0xb8e)](screen[uv(0x52e)], screen[uv(0xbc9)], kU(), kV()) *
          window[uv(0x324)]) /
          0xc
      ),
      qt = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[uv(0x2a4)], 0x19);
    (qt[uv(0xc52)] = !![]), (qt[uv(0x4fb)] = 0x1), (qt[uv(0x28b)] = 0.6);
    var qu = (function () {
        const BU = uv,
          s3 = document[BU(0xa69)](BU(0xb07)),
          s4 = qs * 0x2;
        (s3[BU(0x52e)] = s3[BU(0xbc9)] = s4),
          (s3[BU(0xa71)][BU(0x52e)] = s3[BU(0xa71)][BU(0xbc9)] = BU(0x88a));
        const s5 = document[BU(0x91c)](BU(0x9d6));
        s5[BU(0x6c4)](s3);
        const s6 = s3[BU(0xaa8)]("2d");
        return (
          (s3[BU(0xd35)] = function () {
            const BV = BU;
            (qt[BV(0x6b2)] = ![]),
              s6[BV(0xa52)](0x0, 0x0, s4, s4),
              s6[BV(0x884)](),
              s6[BV(0x627)](s4 / 0x64),
              s6[BV(0xe07)](0x32, 0x32),
              s6[BV(0x627)](0.8),
              s6[BV(0x9c0)](-Math["PI"] / 0x8),
              qt[BV(0x93f)](s6),
              s6[BV(0x915)]();
          }),
          s3
        );
      })(),
      qv,
      qw,
      qx,
      qy = ![];
    function qz() {
      const BW = uv;
      if (qy) return;
      (qy = !![]), iB();
      const s3 = qD(qs);
      qx = s3[BW(0x5af)](BW(0x8d9));
      const s4 = qv * 0x64 + "%\x20" + qw * 0x64 + BW(0x56b),
        s5 = nQ(
          BW(0x79e) +
            hQ[BW(0xa9a)](
              (s6, s7) => BW(0x533) + s7 + BW(0x361) + s6 + BW(0x6c2)
            )[BW(0x5aa)]("\x0a") +
            BW(0x270) +
            nD[BW(0x2f3)] +
            BW(0xbf0) +
            nD[BW(0x9b2)] +
            BW(0x61a) +
            nD[BW(0xc9a)] +
            BW(0xcbc) +
            dH +
            BW(0xdf0) +
            qx +
            BW(0x70b) +
            s4 +
            BW(0x7bb) +
            s4 +
            BW(0xdb6) +
            s4 +
            BW(0xc19) +
            s4 +
            BW(0xc78)
        );
      document[BW(0xd97)][BW(0x6c4)](s5);
    }
    function qA(s3) {
      const BX = uv,
        s4 =
          -s3[BX(0x5cf)]["x"] * 0x64 +
          "%\x20" +
          -s3[BX(0x5cf)]["y"] * 0x64 +
          "%";
      return (
        BX(0x9ba) +
        s4 +
        BX(0x61d) +
        s4 +
        BX(0x8ae) +
        s4 +
        BX(0x560) +
        s4 +
        ";\x22"
      );
    }
    if (document[uv(0xd7a)] && document[uv(0xd7a)][uv(0x9f6)]) {
      const s3 = setTimeout(qz, 0x1f40);
      document[uv(0xd7a)][uv(0x9f6)][uv(0x970)](() => {
        const BY = uv;
        console[BY(0xdc3)](BY(0xc31)), clearTimeout(s3), qz();
      });
    } else qz();
    var qB = [];
    qC();
    function qC() {
      const BZ = uv,
        s4 = {};
      (qv = 0xf), (qB = []);
      let s5 = 0x0;
      for (let s7 = 0x0; s7 < dC[BZ(0xd55)]; s7++) {
        const s8 = dC[s7],
          s9 = BZ(0x832) + s8[BZ(0xd8e)] + "_" + (s8[BZ(0x8a2)] || 0x1),
          sa = s4[s9];
        if (sa === void 0x0) (s8[BZ(0x5cf)] = s4[s9] = s6()), qB[BZ(0xe68)](s8);
        else {
          s8[BZ(0x5cf)] = sa;
          continue;
        }
      }
      for (let sb = 0x0; sb < eK[BZ(0xd55)]; sb++) {
        const sc = eK[sb],
          sd = BZ(0xaaa) + sc[BZ(0xd8e)],
          se = s4[sd];
        if (se === void 0x0) sc[BZ(0x5cf)] = s4[sd] = s6();
        else {
          sc[BZ(0x5cf)] = se;
          continue;
        }
      }
      function s6() {
        const C0 = BZ;
        return { x: s5 % qv, y: Math[C0(0xc8c)](s5 / qv), index: s5++ };
      }
    }
    function qD(s4) {
      const C1 = uv,
        s5 = qB[C1(0xd55)] + eL;
      qw = Math[C1(0x9f9)](s5 / qv);
      const s6 = document[C1(0xa69)](C1(0xb07));
      (s6[C1(0x52e)] = s4 * qv), (s6[C1(0xbc9)] = s4 * qw);
      const s7 = s6[C1(0xaa8)]("2d"),
        s8 = 0x5a,
        s9 = s8 / 0x2,
        sa = s4 / s8;
      s7[C1(0x28b)](sa, sa), s7[C1(0xe07)](s9, s9);
      for (let sb = 0x0; sb < qB[C1(0xd55)]; sb++) {
        const sc = qB[sb];
        s7[C1(0x884)](),
          s7[C1(0xe07)](sc[C1(0x5cf)]["x"] * s8, sc[C1(0x5cf)]["y"] * s8),
          s7[C1(0x884)](),
          s7[C1(0xe07)](0x0 + sc[C1(0xdf8)], -0x5 + sc[C1(0x7f9)]),
          sc[C1(0x78b)](s7),
          s7[C1(0x915)](),
          (s7[C1(0x6b8)] = C1(0x46d)),
          (s7[C1(0xd24)] = C1(0x9c4)),
          (s7[C1(0xd42)] = C1(0x8a9)),
          (s7[C1(0xa00)] = C1(0xb42) + iA),
          (s7[C1(0xade)] = h5 ? 0x5 : 0x3),
          (s7[C1(0xc51)] = C1(0x2da)),
          (s7[C1(0xe0e)] = s7[C1(0xd10)] = C1(0x423)),
          s7[C1(0xe07)](0x0, s9 - 0x8 - s7[C1(0xade)]);
        let sd = sc[C1(0xd8e)];
        h5 && (sd = h7(sd));
        const se = s7[C1(0x850)](sd)[C1(0x52e)] + s7[C1(0xade)],
          sf = Math[C1(0x77f)](0x4c / se, 0x1);
        s7[C1(0x28b)](sf, sf),
          s7[C1(0x21f)](sd, 0x0, 0x0),
          s7[C1(0x790)](sd, 0x0, 0x0),
          s7[C1(0x915)]();
      }
      for (let sg = 0x0; sg < eL; sg++) {
        const sh = eK[sg];
        s7[C1(0x884)](),
          s7[C1(0xe07)](sh[C1(0x5cf)]["x"] * s8, sh[C1(0x5cf)]["y"] * s8),
          sh[C1(0x28f)] !== void 0x0 &&
            (s7[C1(0xa39)](), s7[C1(0xb68)](-s9, -s9, s8, s8), s7[C1(0x9be)]()),
          s7[C1(0xe07)](sh[C1(0xdf8)], sh[C1(0x7f9)]),
          sh[C1(0x78b)](s7),
          s7[C1(0x915)]();
      }
      return s6;
    }
    var qE = new lG(-0x1, cS[uv(0x4ab)], 0x0, 0x0, Math[uv(0xbf6)]() * 6.28);
    qE[uv(0x3aa)] = 0x32;
    function qF() {
      const C2 = uv;
      kj[C2(0xce9)](j2 / 0x2, j2 / 0x2, j2 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qG(s4) {
      const C3 = uv,
        s5 = s4[C3(0xd55)],
        s6 = document[C3(0xa69)](C3(0xb07));
      s6[C3(0x52e)] = s6[C3(0xbc9)] = s5;
      const s7 = s6[C3(0xaa8)]("2d"),
        s8 = s7[C3(0x2de)](s5, s5);
      for (let s9 = 0x0; s9 < s5; s9++) {
        for (let sa = 0x0; sa < s5; sa++) {
          const sb = s4[s9][sa];
          if (!sb) continue;
          const sc = (s9 * s5 + sa) * 0x4;
          s8[C3(0x5e4)][sc + 0x3] = 0xff;
        }
      }
      return s7[C3(0x265)](s8, 0x0, 0x0), s6;
    }
    function qH() {
      const C4 = uv;
      if (!jK) return;
      kj[C4(0x884)](),
        kj[C4(0xa39)](),
        qF(),
        kj[C4(0x9be)](),
        !jK[C4(0xb07)] && (jK[C4(0xb07)] = qG(jK)),
        (kj[C4(0x9a1)] = ![]),
        (kj[C4(0x58a)] = 0.08),
        kj[C4(0x6b3)](jK[C4(0xb07)], 0x0, 0x0, j2, j2),
        kj[C4(0x915)]();
    }
    function qI() {
      const C5 = uv;
      lM = 0x0;
      const s4 = kR * kW;
      qr = 0x0;
      for (let s9 = 0x0; s9 < nN[C5(0xd55)]; s9++) {
        const sa = nN[s9];
        sa[C5(0x4a7)] && sa[C5(0xd35)]();
      }
      if (
        kk[C5(0xa71)][C5(0x3c1)] === "" ||
        document[C5(0xd97)][C5(0xdd8)][C5(0xd6c)](C5(0x3c5))
      ) {
        (kj[C5(0x6b8)] = C5(0xcfd)),
          kj[C5(0x234)](0x0, 0x0, ki[C5(0x52e)], ki[C5(0xbc9)]),
          kj[C5(0x884)]();
        let sb = Math[C5(0xb8e)](ki[C5(0x52e)] / d0, ki[C5(0xbc9)] / d1);
        kj[C5(0x28b)](sb, sb),
          kj[C5(0xb68)](0x0, 0x0, d0, d1),
          kj[C5(0x884)](),
          kj[C5(0xe07)](pW, -pW),
          kj[C5(0x28b)](1.25, 1.25),
          (kj[C5(0x6b8)] = kY),
          kj[C5(0xa06)](),
          kj[C5(0x915)]();
        for (let sc = 0x0; sc < pz[C5(0xd55)]; sc++) {
          pz[sc][C5(0x93f)](kj);
        }
        kj[C5(0x915)]();
        if (pb[C5(0x3c6)] && pe[C5(0xc15)] > 0x0) {
          const sd = pe[C5(0xbc2)]();
          kj[C5(0x884)]();
          let se = kW;
          kj[C5(0x28b)](se, se),
            kj[C5(0xe07)](
              sd["x"] + sd[C5(0x52e)] / 0x2,
              sd["y"] + sd[C5(0xbc9)]
            ),
            kj[C5(0x627)](kR * 0.8),
            qm[C5(0x93f)](kj),
            kj[C5(0x28b)](0.7, 0.7),
            qm[C5(0x3e0)](kj),
            kj[C5(0x915)]();
        }
        if (qj[C5(0xc15)] > 0x0) {
          const sf = qj[C5(0xbc2)]();
          kj[C5(0x884)]();
          let sg = kW;
          kj[C5(0x28b)](sg, sg),
            kj[C5(0xe07)](
              sf["x"] + sf[C5(0x52e)] / 0x2,
              sf["y"] + sf[C5(0xbc9)] * 0.6
            ),
            kj[C5(0x627)](kR * 0.8),
            qf[C5(0x93f)](kj),
            kj[C5(0x627)](0.7),
            kj[C5(0x884)](),
            kj[C5(0xe07)](0x0, -qf[C5(0x3aa)] - 0x23),
            pJ(kj, qf[C5(0xa32)], 0x12, C5(0x46d), 0x3),
            kj[C5(0x915)](),
            qf[C5(0x3e0)](kj),
            kj[C5(0x915)]();
        }
        if (hm[C5(0xc15)] > 0x0) {
          const sh = hm[C5(0xbc2)]();
          kj[C5(0x884)]();
          let si = kW;
          kj[C5(0x28b)](si, si),
            kj[C5(0xe07)](
              sh["x"] + sh[C5(0x52e)] / 0x2,
              sh["y"] + sh[C5(0xbc9)] * 0.5
            ),
            kj[C5(0x627)](kR),
            qE[C5(0x93f)](kj),
            kj[C5(0x915)]();
        }
        return;
      }
      if (jy)
        (kj[C5(0x6b8)] = pY[0x0]),
          kj[C5(0x234)](0x0, 0x0, ki[C5(0x52e)], ki[C5(0xbc9)]);
      else {
        kj[C5(0x884)](), qM();
        for (let sj = -0x1; sj < 0x4; sj++) {
          for (let sk = -0x1; sk < 0x4; sk++) {
            const sl = Math[C5(0xb8e)](0x0, Math[C5(0x77f)](sk, 0x2)),
              sm = Math[C5(0xb8e)](0x0, Math[C5(0x77f)](sj, 0x2));
            (kj[C5(0x6b8)] = pY[sm * 0x3 + sl]),
              kj[C5(0x234)](sk * j3, sj * j3, j3, j3);
          }
        }
        kj[C5(0xa39)](),
          kj[C5(0xb68)](0x0, 0x0, j2, j2),
          kj[C5(0x9be)](),
          kj[C5(0xa39)](),
          kj[C5(0xb9f)](-0xa, j3),
          kj[C5(0xcac)](j3 * 0x2, j3),
          kj[C5(0xb9f)](j3 * 0x2, j3 * 0.5),
          kj[C5(0xcac)](j3 * 0x2, j3 * 1.5),
          kj[C5(0xb9f)](j3 * 0x1, j3 * 0x2),
          kj[C5(0xcac)](j2 + 0xa, j3 * 0x2),
          kj[C5(0xb9f)](j3, j3 * 1.5),
          kj[C5(0xcac)](j3, j3 * 2.5),
          (kj[C5(0xade)] = qe * 0x2),
          (kj[C5(0xe0e)] = C5(0x423)),
          (kj[C5(0xc51)] = qd),
          kj[C5(0x8e6)](),
          kj[C5(0x915)]();
      }
      kj[C5(0x884)](),
        kj[C5(0xa39)](),
        kj[C5(0xb68)](0x0, 0x0, ki[C5(0x52e)], ki[C5(0xbc9)]),
        qM();
      pb[C5(0x33d)] && ((kj[C5(0x6b8)] = kY), kj[C5(0xa06)]());
      kj[C5(0xa39)]();
      jy ? qF() : kj[C5(0xb68)](0x0, 0x0, j2, j2);
      kj[C5(0x915)](),
        kj[C5(0xb68)](0x0, 0x0, ki[C5(0x52e)], ki[C5(0xbc9)]),
        (kj[C5(0x6b8)] = qd),
        kj[C5(0xa06)](C5(0xab4)),
        kj[C5(0x884)](),
        qM();
      pb[C5(0xe48)] && q7();
      qH();
      const s5 = [];
      let s6 = [];
      for (let sn = 0x0; sn < iw[C5(0xd55)]; sn++) {
        const so = iw[sn];
        if (so[C5(0xdbe)]) {
          if (iy) {
            if (
              pP - so[C5(0x557)] < 0x3e8 ||
              Math[C5(0x805)](so["nx"] - iy["x"], so["ny"] - iy["y"]) <
                Math[C5(0x805)](so["ox"] - iy["x"], so["oy"] - iy["y"])
            ) {
              s5[C5(0xe68)](so), (so[C5(0x557)] = pP);
              continue;
            }
          }
        }
        so !== iy && s6[C5(0xe68)](so);
      }
      (s6 = qJ(s6, (sp) => sp[C5(0x8fa)] === cS[C5(0x9a8)])),
        (s6 = qJ(s6, (sp) => sp[C5(0x8fa)] === cS[C5(0xd95)])),
        (s6 = qJ(s6, (sp) => sp[C5(0x8fa)] === cS[C5(0x856)])),
        (s6 = qJ(s6, (sp) => sp[C5(0x609)])),
        (s6 = qJ(s6, (sp) => sp[C5(0x50e)])),
        (s6 = qJ(s6, (sp) => sp[C5(0xafc)] && !sp[C5(0x38d)])),
        (s6 = qJ(s6, (sp) => !sp[C5(0x38d)])),
        qJ(s6, (sp) => !![]);
      iy && iy[C5(0x93f)](kj);
      for (let sp = 0x0; sp < s5[C5(0xd55)]; sp++) {
        s5[sp][C5(0x93f)](kj);
      }
      if (pb[C5(0xb39)]) {
        kj[C5(0xa39)]();
        for (let sq = 0x0; sq < iw[C5(0xd55)]; sq++) {
          const sr = iw[sq];
          if (sr[C5(0xc52)]) continue;
          if (sr[C5(0x690)]) {
            kj[C5(0x884)](),
              kj[C5(0xe07)](sr["x"], sr["y"]),
              kj[C5(0x9c0)](sr[C5(0x582)]);
            if (!sr[C5(0x317)])
              kj[C5(0xb68)](-sr[C5(0x3aa)], -0xa, sr[C5(0x3aa)] * 0x2, 0x14);
            else {
              kj[C5(0xb9f)](-sr[C5(0x3aa)], -0xa),
                kj[C5(0xcac)](-sr[C5(0x3aa)], 0xa);
              const ss = 0xa + sr[C5(0x317)] * sr[C5(0x3aa)] * 0x2;
              kj[C5(0xcac)](sr[C5(0x3aa)], ss),
                kj[C5(0xcac)](sr[C5(0x3aa)], -ss),
                kj[C5(0xcac)](-sr[C5(0x3aa)], -0xa);
            }
            kj[C5(0x915)]();
          } else
            kj[C5(0xb9f)](sr["x"] + sr[C5(0x3aa)], sr["y"]),
              kj[C5(0xce9)](sr["x"], sr["y"], sr[C5(0x3aa)], 0x0, l0);
        }
        (kj[C5(0xade)] = 0x2), (kj[C5(0xc51)] = C5(0xc9a)), kj[C5(0x8e6)]();
      }
      const s7 = pb[C5(0xb3c)] ? 0x1 / qO() : 0x1;
      for (let st = 0x0; st < iw[C5(0xd55)]; st++) {
        const su = iw[st];
        !su[C5(0xafc)] && su[C5(0xd09)] && lY(su, kj, s7);
      }
      for (let sv = 0x0; sv < iw[C5(0xd55)]; sv++) {
        const sw = iw[sv];
        sw[C5(0xab7)] && sw[C5(0x3e0)](kj, s7);
      }
      const s8 = pQ / 0x12;
      kj[C5(0x884)](),
        (kj[C5(0xade)] = 0x7),
        (kj[C5(0xc51)] = C5(0x46d)),
        (kj[C5(0xe0e)] = kj[C5(0xd10)] = C5(0x360));
      for (let sx = iF[C5(0xd55)] - 0x1; sx >= 0x0; sx--) {
        const sy = iF[sx];
        sy["a"] -= pQ / 0x1f4;
        if (sy["a"] <= 0x0) {
          iF[C5(0x4f9)](sx, 0x1);
          continue;
        }
        (kj[C5(0x58a)] = sy["a"]), kj[C5(0x8e6)](sy[C5(0xaa7)]);
      }
      kj[C5(0x915)]();
      if (pb[C5(0x9ea)])
        for (let sz = iz[C5(0xd55)] - 0x1; sz >= 0x0; sz--) {
          const sA = iz[sz];
          (sA["x"] += sA["vx"] * s8),
            (sA["y"] += sA["vy"] * s8),
            (sA["vy"] += 0.35 * s8);
          if (sA["vy"] > 0xa) {
            iz[C5(0x4f9)](sz, 0x1);
            continue;
          }
          kj[C5(0x884)](),
            kj[C5(0xe07)](sA["x"], sA["y"]),
            (kj[C5(0x58a)] = 0x1 - Math[C5(0xb8e)](0x0, sA["vy"] / 0xa)),
            kj[C5(0x28b)](sA[C5(0x3aa)], sA[C5(0x3aa)]),
            sA[C5(0x9d5)] !== void 0x0
              ? pJ(kj, sA[C5(0x9d5)], 0x15, C5(0x3ac), 0x2, ![], sA[C5(0x3aa)])
              : (kj[C5(0x9c0)](sA[C5(0x582)]),
                pG(kj, C5(0xad9) + sA[C5(0x3aa)], 0x1e, 0x1e, function (sB) {
                  const C6 = C5;
                  sB[C6(0xe07)](0xf, 0xf), nB(sB);
                })),
            kj[C5(0x915)]();
        }
      kj[C5(0x915)]();
      if (iy && pb[C5(0x1e0)] && !pb[C5(0x229)]) {
        kj[C5(0x884)](),
          kj[C5(0xe07)](ki[C5(0x52e)] / 0x2, ki[C5(0xbc9)] / 0x2),
          kj[C5(0x9c0)](Math[C5(0x5c6)](nc, nb)),
          kj[C5(0x28b)](s4, s4);
        const sB = 0x28;
        let sC = Math[C5(0x805)](nb, nc) / kR;
        kj[C5(0xa39)](),
          kj[C5(0xb9f)](sB, 0x0),
          kj[C5(0xcac)](sC, 0x0),
          kj[C5(0xcac)](sC + -0x14, -0x14),
          kj[C5(0xb9f)](sC, 0x0),
          kj[C5(0xcac)](sC + -0x14, 0x14),
          (kj[C5(0xade)] = 0xc),
          (kj[C5(0xe0e)] = C5(0x423)),
          (kj[C5(0xd10)] = C5(0x423)),
          (kj[C5(0x58a)] =
            sC < 0x64 ? Math[C5(0xb8e)](sC - 0x32, 0x0) / 0x32 : 0x1),
          (kj[C5(0xc51)] = C5(0x300)),
          kj[C5(0x8e6)](),
          kj[C5(0x915)]();
      }
      kj[C5(0x884)](),
        kj[C5(0x28b)](s4, s4),
        kj[C5(0xe07)](0x28, 0x1e + 0x32),
        kj[C5(0x627)](0.85);
      for (let sD = 0x0; sD < pN[C5(0xd55)]; sD++) {
        const sE = pN[sD];
        if (sD > 0x0) {
          const sF = lI(Math[C5(0xb8e)](sE[C5(0xccf)] - 0.5, 0x0) / 0.5);
          kj[C5(0xe07)](0x0, (sD === 0x0 ? 0x46 : 0x41) * (0x1 - sF));
        }
        kj[C5(0x884)](),
          sD > 0x0 &&
            (kj[C5(0xe07)](lI(sE[C5(0xccf)]) * -0x190, 0x0),
            kj[C5(0x627)](0.85)),
          kj[C5(0x884)](),
          lZ(sE, kj, !![]),
          (sE["id"] = (sE[C5(0xcef)] && sE[C5(0xcef)]["id"]) || -0x1),
          sE[C5(0x93f)](kj),
          (sE["id"] = -0x1),
          kj[C5(0x915)](),
          sE[C5(0xd05)] !== void 0x0 &&
            (kj[C5(0x884)](),
            kj[C5(0x9c0)](sE[C5(0xd05)]),
            kj[C5(0xe07)](0x20, 0x0),
            kj[C5(0xa39)](),
            kj[C5(0xb9f)](0x0, 0x6),
            kj[C5(0xcac)](0x0, -0x6),
            kj[C5(0xcac)](0x6, 0x0),
            kj[C5(0x765)](),
            (kj[C5(0xade)] = 0x4),
            (kj[C5(0xe0e)] = kj[C5(0xd10)] = C5(0x423)),
            (kj[C5(0xc51)] = C5(0x41c)),
            kj[C5(0x8e6)](),
            (kj[C5(0x6b8)] = C5(0x46d)),
            kj[C5(0xa06)](),
            kj[C5(0x915)]()),
          kj[C5(0x915)]();
      }
      kj[C5(0x915)]();
    }
    function qJ(s4, s5) {
      const C7 = uv,
        s6 = [];
      for (let s7 = 0x0; s7 < s4[C7(0xd55)]; s7++) {
        const s8 = s4[s7];
        if (s5[C7(0x46b)] !== void 0x0 ? s5(s8) : s8[s5]) s8[C7(0x93f)](kj);
        else s6[C7(0xe68)](s8);
      }
      return s6;
    }
    var qK = 0x0,
      qL = 0x0;
    function qM() {
      const C8 = uv;
      kj[C8(0xe07)](ki[C8(0x52e)] / 0x2, ki[C8(0xbc9)] / 0x2);
      let s4 = qN();
      kj[C8(0x28b)](s4, s4),
        kj[C8(0xe07)](-pt, -pu),
        pb[C8(0x8c6)] && kj[C8(0xe07)](qK, qL);
    }
    function qN() {
      const C9 = uv;
      return Math[C9(0xb8e)](ki[C9(0x52e)] / d0, ki[C9(0xbc9)] / d1) * qO();
    }
    function qO() {
      return ng / px;
    }
    kX(), pT();
    const qP = {};
    (qP[uv(0x46b)] = uv(0x761)),
      (qP[uv(0x82f)] = uv(0x5e2)),
      (qP[uv(0x5bb)] = uv(0xa3a));
    const qQ = {};
    (qQ[uv(0x46b)] = uv(0x425)),
      (qQ[uv(0x82f)] = uv(0x41d)),
      (qQ[uv(0x5bb)] = uv(0xcad));
    const qR = {};
    (qR[uv(0x46b)] = uv(0xdfa)),
      (qR[uv(0x82f)] = uv(0x857)),
      (qR[uv(0x5bb)] = uv(0x41a));
    const qS = {};
    (qS[uv(0x46b)] = uv(0x3a3)),
      (qS[uv(0x82f)] = uv(0x36d)),
      (qS[uv(0x5bb)] = uv(0x64b));
    const qT = {};
    (qT[uv(0x46b)] = uv(0x6fb)),
      (qT[uv(0x82f)] = uv(0xdb5)),
      (qT[uv(0x5bb)] = uv(0x182));
    const qU = {};
    (qU[uv(0x46b)] = uv(0x8b7)),
      (qU[uv(0x82f)] = uv(0x1b3)),
      (qU[uv(0x5bb)] = uv(0xb35));
    const qV = {};
    (qV[uv(0xad7)] = qP),
      (qV[uv(0x484)] = qQ),
      (qV[uv(0x170)] = qR),
      (qV[uv(0x176)] = qS),
      (qV[uv(0x812)] = qT),
      (qV[uv(0x791)] = qU);
    var qW = qV;
    if (window[uv(0x9f8)][uv(0x9cc)] !== uv(0x1c7))
      for (let s4 in qW) {
        const s5 = qW[s4];
        s5[uv(0x82f)] = s5[uv(0x82f)]
          [uv(0xb02)](uv(0x1c7), uv(0xcfa))
          [uv(0xb02)](uv(0x319), uv(0xaa4));
      }
    var qX = document[uv(0x91c)](uv(0x4b9)),
      qY = document[uv(0x91c)](uv(0x714)),
      qZ = 0x0;
    for (let s6 in qW) {
      const s7 = qW[s6],
        s8 = document[uv(0xa69)](uv(0x3eb));
      s8[uv(0xe60)] = uv(0xb50);
      const s9 = document[uv(0xa69)](uv(0x7ac));
      s9[uv(0xe2b)](uv(0x8e6), s7[uv(0x46b)]), s8[uv(0x6c4)](s9);
      const sa = document[uv(0xa69)](uv(0x7ac));
      (sa[uv(0xe60)] = uv(0xadd)),
        (s7[uv(0x320)] = 0x0),
        (s7[uv(0x1cb)] = function (sb) {
          const Ca = uv;
          (qZ -= s7[Ca(0x320)]),
            (s7[Ca(0x320)] = sb),
            (qZ += sb),
            k8(sa, kh(sb, Ca(0x448))),
            s8[Ca(0x6c4)](sa);
          const sc = Ca(0xbfd) + kh(qZ, Ca(0x448)) + Ca(0x53e);
          k8(r0, sc), k8(qY, sc);
        }),
        (s7[uv(0xcb6)] = function () {
          const Cb = uv;
          s7[Cb(0x1cb)](0x0), sa[Cb(0x2b0)]();
        }),
        (s8[uv(0xa71)][uv(0xe4e)] = s7[uv(0x5bb)]),
        qX[uv(0x6c4)](s8),
        (s8[uv(0x81c)] = function () {
          const Cc = uv,
            sb = qX[Cc(0x91c)](Cc(0xd7c));
          if (sb === s8) return;
          sb && sb[Cc(0xdd8)][Cc(0x2b0)](Cc(0x65f)),
            this[Cc(0xdd8)][Cc(0x1b1)](Cc(0x65f)),
            r3(s7[Cc(0x82f)]),
            (hD[Cc(0x383)] = s6);
        }),
        (s7["el"] = s8);
    }
    var r0 = document[uv(0xa69)](uv(0x7ac));
    (r0[uv(0xe60)] = uv(0x8b9)), qX[uv(0x6c4)](r0);
    if (!![]) {
      r1();
      let sb = Date[uv(0xd3f)]();
      setInterval(function () {
        pP - sb > 0x2710 && (r1(), (sb = pP));
      }, 0x3e8);
    }
    function r1() {
      const Cd = uv;
      fetch(Cd(0xd67))
        [Cd(0x970)]((sc) => sc[Cd(0x7b2)]())
        [Cd(0x970)]((sc) => {
          const Ce = Cd;
          for (let sd in sc) {
            const se = qW[sd];
            se && se[Ce(0x1cb)](sc[sd]);
          }
        })
        [Cd(0xdbb)]((sc) => {
          const Cf = Cd;
          console[Cf(0x569)](Cf(0x74a), sc);
        });
    }
    var r2 = window[uv(0xab2)] || window[uv(0x9f8)][uv(0xc99)] === uv(0xb26);
    if (r2) hV(window[uv(0x9f8)][uv(0x561)][uv(0xb02)](uv(0xb89), "ws"));
    else {
      const sc = qW[hD[uv(0x383)]];
      if (sc) sc["el"][uv(0x336)]();
      else {
        let sd = "EU";
        fetch(uv(0xc25))
          [uv(0x970)]((se) => se[uv(0x7b2)]())
          [uv(0x970)]((se) => {
            const Cg = uv;
            if (["NA", "SA"][Cg(0xc88)](se[Cg(0xc94)])) sd = "US";
            else ["AS", "OC"][Cg(0xc88)](se[Cg(0xc94)]) && (sd = "AS");
          })
          [uv(0xdbb)]((se) => {
            const Ch = uv;
            console[Ch(0xdc3)](Ch(0x14c));
          })
          [uv(0x6f8)](function () {
            const Ci = uv,
              se = [];
            for (let sg in qW) {
              const sh = qW[sg];
              sh[Ci(0x46b)][Ci(0x307)](sd) && se[Ci(0xe68)](sh);
            }
            const sf =
              se[Math[Ci(0xc8c)](Math[Ci(0xbf6)]() * se[Ci(0xd55)])] ||
              qW[Ci(0x930)];
            console[Ci(0xdc3)](Ci(0x88c) + sd + Ci(0xa3c) + sf[Ci(0x46b)]),
              sf["el"][Ci(0x336)]();
          });
      }
    }
    (document[uv(0x91c)](uv(0xc09))[uv(0xa71)][uv(0x3c1)] = uv(0x846)),
      kA[uv(0xdd8)][uv(0x1b1)](uv(0x7f0)),
      kB[uv(0xdd8)][uv(0x2b0)](uv(0x7f0)),
      (window[uv(0x2f5)] = function () {
        il(new Uint8Array([0xff]));
      });
    function r3(se) {
      const Cj = uv;
      clearTimeout(kF), iu();
      const sf = {};
      (sf[Cj(0x82f)] = se), (hU = sf), kg(!![]);
    }
    window[uv(0x8f0)] = r3;
    var r4 = null;
    function r5(se) {
      const Ck = uv;
      if (!se || typeof se !== Ck(0xa7d)) {
        console[Ck(0xdc3)](Ck(0x421));
        return;
      }
      if (r4) r4[Ck(0x8f2)]();
      const sf = se[Ck(0xcf5)] || {},
        sg = {};
      (sg[Ck(0x59d)] = Ck(0x819)),
        (sg[Ck(0xa98)] = Ck(0x2ca)),
        (sg[Ck(0x445)] = Ck(0x35a)),
        (sg[Ck(0x991)] = Ck(0x31b)),
        (sg[Ck(0xe13)] = !![]),
        (sg[Ck(0x154)] = !![]),
        (sg[Ck(0xa7e)] = ""),
        (sg[Ck(0x1ee)] = ""),
        (sg[Ck(0x3be)] = !![]),
        (sg[Ck(0xcb4)] = !![]);
      const sh = sg;
      for (let sn in sh) {
        (sf[sn] === void 0x0 || sf[sn] === null) && (sf[sn] = sh[sn]);
      }
      const si = [];
      for (let so in sf) {
        sh[so] === void 0x0 && si[Ck(0xe68)](so);
      }
      si[Ck(0xd55)] > 0x0 &&
        console[Ck(0xdc3)](Ck(0x3e9) + si[Ck(0x5aa)](",\x20"));
      sf[Ck(0xa7e)] === "" && sf[Ck(0x1ee)] === "" && (sf[Ck(0xa7e)] = "x");
      (sf[Ck(0xa98)] = hP[sf[Ck(0xa98)]] || sf[Ck(0xa98)]),
        (sf[Ck(0x991)] = hP[sf[Ck(0x991)]] || sf[Ck(0x991)]);
      const sj = nQ(
        Ck(0x99a) +
          sf[Ck(0x59d)] +
          Ck(0x483) +
          sf[Ck(0xa98)] +
          Ck(0xda2) +
          (sf[Ck(0x445)]
            ? Ck(0x828) +
              sf[Ck(0x445)] +
              "\x22\x20" +
              (sf[Ck(0x991)] ? Ck(0x2ba) + sf[Ck(0x991)] + "\x22" : "") +
              Ck(0xd5a)
            : "") +
          Ck(0x2f6)
      );
      (r4 = sj),
        (sj[Ck(0x8f2)] = function () {
          const Cl = Ck;
          document[Cl(0xd97)][Cl(0xdd8)][Cl(0x2b0)](Cl(0x3c5)),
            sj[Cl(0x2b0)](),
            (r4 = null);
        }),
        (sj[Ck(0x91c)](Ck(0xd3e))[Ck(0x81c)] = sj[Ck(0x8f2)]);
      const sk = sj[Ck(0x91c)](Ck(0xe3a)),
        sl = [],
        sm = [];
      for (let sp in se) {
        if (sp === Ck(0xcf5)) continue;
        const sq = se[sp];
        let sr = [];
        const ss = Array[Ck(0x328)](sq);
        let st = 0x0;
        if (ss)
          for (let su = 0x0; su < sq[Ck(0xd55)]; su++) {
            const sv = sq[su],
              sw = dF[sv];
            if (!sw) {
              sl[Ck(0xe68)](sv);
              continue;
            }
            st++, sr[Ck(0xe68)]([sv, void 0x0]);
          }
        else
          for (let sx in sq) {
            const sy = dF[sx];
            if (!sy) {
              sl[Ck(0xe68)](sx);
              continue;
            }
            const sz = sq[sx];
            (st += sz), sr[Ck(0xe68)]([sx, sz]);
          }
        if (sr[Ck(0xd55)] === 0x0) continue;
        sm[Ck(0xe68)]([st, sp, sr, ss]);
      }
      sf[Ck(0xcb4)] && sm[Ck(0x3a4)]((sA, sB) => sB[0x0] - sA[0x0]);
      for (let sA = 0x0; sA < sm[Ck(0xd55)]; sA++) {
        const [sB, sC, sD, sE] = sm[sA];
        sf[Ck(0x3be)] && !sE && sD[Ck(0x3a4)]((sI, sJ) => sJ[0x1] - sI[0x1]);
        let sF = "";
        sf[Ck(0xe13)] && (sF += sA + 0x1 + ".\x20");
        sF += sC;
        const sG = nQ(Ck(0xdae) + sF + Ck(0x13d));
        sk[Ck(0x6c4)](sG);
        const sH = nQ(Ck(0x682));
        for (let sI = 0x0; sI < sD[Ck(0xd55)]; sI++) {
          const [sJ, sK] = sD[sI],
            sL = dF[sJ],
            sM = nQ(
              Ck(0x4ca) + sL[Ck(0x2a3)] + "\x22\x20" + qA(sL) + Ck(0xd5a)
            );
          if (!sE && sf[Ck(0x154)]) {
            const sN = sf[Ck(0xa7e)] + k9(sK) + sf[Ck(0x1ee)],
              sO = nQ(Ck(0x6e2) + sN + Ck(0x13d));
            sN[Ck(0xd55)] > 0x6 && sO[Ck(0xdd8)][Ck(0x1b1)](Ck(0xadd)),
              sM[Ck(0x6c4)](sO);
          }
          (sM[Ck(0x6d2)] = sL), sH[Ck(0x6c4)](sM);
        }
        sk[Ck(0x6c4)](sH);
      }
      kl[Ck(0x6c4)](sj),
        sl[Ck(0xd55)] > 0x0 &&
          console[Ck(0xdc3)](Ck(0x978) + sl[Ck(0x5aa)](",\x20")),
        document[Ck(0xd97)][Ck(0xdd8)][Ck(0x1b1)](Ck(0x3c5));
    }
    (window[uv(0x4fe)] = r5),
      (document[uv(0xd97)][uv(0x73b)] = function (se) {
        const Cm = uv;
        se[Cm(0xcc6)]();
        const sf = se[Cm(0xa2f)][Cm(0x4d9)][0x0];
        if (sf && sf[Cm(0x8fa)] === Cm(0x1c8)) {
          console[Cm(0xdc3)](Cm(0x27e) + sf[Cm(0x46b)] + Cm(0x31a));
          const sg = new FileReader();
          (sg[Cm(0x3d2)] = function (sh) {
            const Cn = Cm,
              si = sh[Cn(0x70a)][Cn(0x257)];
            try {
              const sj = JSON[Cn(0x494)](si);
              r5(sj);
            } catch (sk) {
              console[Cn(0x569)](Cn(0xd9b), sk);
            }
          }),
            sg[Cm(0x888)](sf);
        }
      }),
      (document[uv(0xd97)][uv(0x9cb)] = function (se) {
        const Co = uv;
        se[Co(0xcc6)]();
      }),
      Object[uv(0xa24)](window, uv(0x771), {
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
      kr();
  })();
