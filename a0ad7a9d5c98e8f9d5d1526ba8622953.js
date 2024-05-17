const $ = (i) => document.getElementById(i);
const $_ = (i) => document.querySelector(i);
class HornexHack{
  constructor(){
    this.version = '1.10';
    this.config = {};
    this.default = {
      damageDisplay: true, // 伤害显示修改
      DDenableNumber: true, // 显示伤害数值而不是百分比（若可用）
      healthDisplay: true, // 血量显示
      disableChatCheck: true, // 是否禁用聊天内容检查
      autoRespawn: true, // 自动重生
      colorText: false, // 公告彩字
      betterXP: true, // 经验条优化
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
      '/profile': '<internal> shows user\'s profile',
      '/dlMob': '<internal> downloads an image of a specific mob',
      '/dlPetal': '<internal> downloads an image of a specific petal',
      '/toggle': 'toggles a specific module',
      '/list': 'lists all the modules and configs',
      '/help': 'show this help',
      '/server': 'get current server',
      '/wave': 'get wave progress',
    };
    this.hp = 0;
    this.ingame = false;
    this.player = {
      name: "",
      entity: null
    };
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
      var div = document.createElement('div');
      div.style.position = 'fixed';
      div.style.bottom = '60px';
      div.style.right = '0';
      div.style.padding = '10px';
      div.style.zIndex = '10000';
      document.body.appendChild(div);
      this.status.style.fontFamily = 'Fredoka One';
      this.status.style.fontSize = '15px';
      var colors = ['red', 'yellow', 'lime', 'cyan', 'blue', 'magenta'];
      this.status.style.background = `linear-gradient(to right, ${colors.join(',')},${colors[0]})`
      this.status.style.backgroundClip = 'text';
      this.status.style.webkitTextFillColor = 'transparent';
      div.style.textAlign = 'right';
      this.status.innerHTML = this.name;
      div.appendChild(this.status);
      setInterval(() => {
        if(this.isEnabled('colorText')){
          colors = this.moveElement(colors);
          this.status.style.background = `linear-gradient(to right, ${colors.join(',')},${colors[0]})`
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
      this.config[module] = (status == "true");
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
    for(var i = 0; i < this.configKeys.length; i++){
      var item = this.configKeys[i];
      this.addChat(`${item}: ${this.isEnabled(item)} (defaults to ${this.default[item]})`, '#ffffff');
    }
  }
  saveModule(){
    for(var i = 0; i < this.configKeys.length; i++){
      var item = this.configKeys[i];
      localStorage.setItem(`hh${item}`, this.isEnabled(item));
    }
  }
  loadModule(){
    for(var i = 0; i < this.configKeys.length; i++){
      var item = this.configKeys[i];
      if(!localStorage.getItem(`hh${item}`)){
        this.config[item] = this.default[item];
        this.setEnabled(item, this.default[item]);
      }else{
        this.setEnabled(item, localStorage.getItem(`hh${item}`));
      }
    }
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
    var lst = Object.keys(this.commands);
    for(var i = 0; i < lst.length; i++){
      this.addChat(`${lst[i]} : ${this.commands[lst[i]]}`, '#ffffff');
    }
  }
  getServer(){
    var server = localStorage.getItem('server');
    return `${server.substring(0, 2).toUpperCase()}${server[server.length - 1]}`;
  }
  getColor(r){
    return this.rarityColor[r['tier']];
  }
  getWave(){
    var name = $_('body > div.hud > div.zone > div.zone-name').getAttribute('stroke');
    var status = $_('body > div.hud > div.zone > div.progress > span').getAttribute('stroke');
    var prog = $_('body > div.hud > div.zone > div.progress > div').style.transform;
    var start = prog.indexOf('calc(') + 5;
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
  log(text){
    if(text == '') console.log('<empty str>');
    else console.log(text);
  }
  command2Arg(func, args){
    args = args.split(' ');
    if(args.length != 2){
      this.addError('Args num not correct');
      return true;
    }else{
      this[func](args[1]);
      return false;
    }
  }
  // ----- Event -----
  registerDie(){
    var div = $_('body > div.score-overlay');
    var that = this;
    this.dieObserver = new this.MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == 'attributes') {
              var style = mutation.target.style;
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
    var quitBtn = $_('body > div.score-overlay > div.score-area > div.btn.continue-btn');
    if(!quitBtn.classList.contains('red')){
      quitBtn.onclick();
    }
  }
  registerWave(){
    this.waveInterval = setInterval(() => {
      var status = this.getWave();
      var server = this.getServer();
      this.setStatus(`${server}: ${status}`);
    }, 1000);
  }
  registerChat(){
    var div = $_('body > div.common > div.chat > div');
    this.chatObserver = new this.MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if(mutation.type == 'childList'){
            var chat = mutation.addedNodes[0];
            if(chat){
              var childs = chat.childNodes;
              var name = "", content = "";
              for(var i = 0; i < childs.length; i++){
                if(childs[i].className == 'chat-name') name = childs[i].getAttribute('stroke');
                if(childs[i].className == 'chat-text'){
                  if(childs[i].hasAttribute('stroke')){
                    content = childs[i].getAttribute('stroke');
                  }else{
                    var c = childs[i].childNodes;
                    for(var i = 0; i < c.length - 1; i += 2){
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
    var chatbox = $_('body > div.common > div.chat > input');
    this.keyFunc = evt => {
      if(document.activeElement.classList == chatbox.classList || !this.ingame) return;
      if(evt.key == 'q'){
        var x = this.player.entity.targetPlayer.nx;
        var y = this.player.entity.targetPlayer.ny;
        if(this.speak) this.speak(`Current coords: ${Math.floor(x / 500)}, ${Math.floor(y / 500)}`);
        else{
          hack.addChat('You need to send something into chat to enable this!', '#ff7f50');
        }
      }
    };
    window.addEventListener('keyup', this.keyFunc);
  }
  register(){
    this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    if(!this.waveInterval) this.registerWave();
    if(!this.keyFunc) this.registerKey();
    if(!this.chatObserver) this.registerChat();
    if(!this.dieObserver) this.registerDie();
  }
}
var hack = new HornexHack();
hack.loadStatus();
function getHP(mob, lst) {
  var tier = mob['tier'],
    type = mob['type'];
  if(mob.isCentiBody) type--;
  if (!lst[tier] || tier >= lst.length) return;
  for (var i = 0; i < lst[tier].length; i++) {
    var j = lst[tier][i];
    if (type == j['type']) return j['health']; // hack identifier
  }
}
(function (c, d) {
  const ur = b,
    e = c();
  while (!![]) {
    try {
      const f =
        parseInt(ur(0x47c)) / 0x1 +
        parseInt(ur(0x4ae)) / 0x2 +
        -parseInt(ur(0x863)) / 0x3 +
        (-parseInt(ur(0xdc)) / 0x4) * (-parseInt(ur(0x2b3)) / 0x5) +
        parseInt(ur(0x9ee)) / 0x6 +
        (-parseInt(ur(0x14d)) / 0x7) * (parseInt(ur(0xb95)) / 0x8) +
        (-parseInt(ur(0x588)) / 0x9) * (parseInt(ur(0xa53)) / 0xa);
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0x9cfb4),
  (() => {
    const us = b;
    var cG = 0x2710,
      cH = 0x1e - 0x1,
      cI = { ...cV(us(0x58a)), ...cV(us(0x5d1)) },
      cJ = 0x93b,
      cK = 0x10,
      cL = 0x3c,
      cM = 0x10,
      cN = 0x3,
      cO = /^[a-zA-Z0-9_]+$/,
      cP = /[^a-zA-Z0-9_]/g,
      cQ = cV(us(0x4a5)),
      cR = cV(us(0x18b)),
      cS = cV(us(0x4d5)),
      cT = cV(us(0x2af)),
      cU = cV(us(0xd70));
    function cV(r3) {
      const ut = us,
        r4 = r3[ut(0x64a)]("\x20"),
        r5 = {};
      for (let r6 = 0x0; r6 < r4[ut(0x8c2)]; r6++) {
        r5[r4[r6]] = r6;
      }
      return r5;
    }
    var cW = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cX = {};
    (cX[us(0xc8e)] = 0x0), (cX[us(0xb35)] = 0x1), (cX[us(0xb94)] = 0x2);
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
    function d2(r3) {
      const uu = us;
      return 0x14 * Math[uu(0x815)](r3 * 1.05 ** (r3 - 0x1));
    }
    var d3 = [
      0x1, 0x5, 0x32, 0x1f4, 0x2710, 0x7a120, 0x2faf080, 0x12a05f200,
      0xe8d4a51000,
    ];
    function d4(r3) {
      let r4 = 0x0,
        r5 = 0x0;
      while (!![]) {
        const r6 = d2(r4 + 0x1);
        if (r3 < r5 + r6) break;
        (r5 += r6), r4++;
      }
      return [r4, r5];
    }
    function d5(r3) {
      const uv = us;
      let r4 = 0x5,
        r5 = 0x5;
      while (r3 >= r5) {
        r4++, (r5 += Math[uv(0xbe6)](0x1e, r5));
      }
      return r4;
    }
    function d6(r3) {
      const uw = us;
      return Math[uw(0x168)](0xf3, Math[uw(0xbe6)](r3, 0xc7) / 0xc8);
    }
    function d7() {
      return d8(0x100);
    }
    function d8(r3) {
      const r4 = Array(r3);
      while (r3--) r4[r3] = r3;
      return r4;
    }
    var d9 = cV(us(0x263)),
      da = Object[us(0x4f4)](d9),
      db = da[us(0x8c2)] - 0x1,
      dc = db;
    function dd(r3) {
      const ux = us,
        r4 = [];
      for (let r5 = 0x1; r5 <= dc; r5++) {
        r4[ux(0x733)](r3(r5));
      }
      return r4;
    }
    const de = {};
    (de[us(0x654)] = 0x0),
      (de[us(0x92c)] = 0x1),
      (de[us(0x374)] = 0x2),
      (de[us(0x998)] = 0x3),
      (de[us(0x4bb)] = 0x4),
      (de[us(0x3f0)] = 0x5),
      (de[us(0xcc3)] = 0x6),
      (de[us(0x15d)] = 0x7),
      (de[us(0x3ae)] = 0x8);
    var df = de;
    function dg(r3, r4) {
      const uy = us;
      return Math[uy(0x168)](0x3, r3) * r4;
    }
    const dh = {};
    (dh[us(0x41e)] = cS[us(0x378)]),
      (dh[us(0x477)] = us(0x54b)),
      (dh[us(0xc60)] = 0xa),
      (dh[us(0x3b6)] = 0x0),
      (dh[us(0x424)] = 0x1),
      (dh[us(0x921)] = 0x1),
      (dh[us(0x530)] = 0x3e8),
      (dh[us(0xaf1)] = 0x0),
      (dh[us(0x23d)] = ![]),
      (dh[us(0x171)] = 0x1),
      (dh[us(0xbb8)] = ![]),
      (dh[us(0xda9)] = 0x0),
      (dh[us(0x787)] = 0x0),
      (dh[us(0xc2e)] = ![]),
      (dh[us(0x4e3)] = 0x0),
      (dh[us(0x784)] = 0x0),
      (dh[us(0x14c)] = 0x0),
      (dh[us(0x7d1)] = 0x0),
      (dh[us(0xbd9)] = 0x0),
      (dh[us(0x9b7)] = 0x0),
      (dh[us(0xccd)] = 0x1),
      (dh[us(0x97c)] = 0xc),
      (dh[us(0x545)] = 0x0),
      (dh[us(0x509)] = ![]),
      (dh[us(0x834)] = void 0x0),
      (dh[us(0xb96)] = ![]),
      (dh[us(0x645)] = 0x0),
      (dh[us(0x401)] = ![]),
      (dh[us(0x3d3)] = 0x0),
      (dh[us(0xaa7)] = 0x0),
      (dh[us(0xb54)] = ![]),
      (dh[us(0xd73)] = 0x0),
      (dh[us(0x9d)] = 0x0),
      (dh[us(0xc2d)] = 0x0),
      (dh[us(0x4c5)] = ![]),
      (dh[us(0xde0)] = 0x0),
      (dh[us(0xbfd)] = ![]),
      (dh[us(0xb89)] = ![]),
      (dh[us(0x69d)] = 0x0),
      (dh[us(0x5fc)] = 0x0),
      (dh[us(0xc31)] = 0x0),
      (dh[us(0x81a)] = ![]),
      (dh[us(0xc13)] = 0x1),
      (dh[us(0xed)] = 0x0),
      (dh[us(0xd15)] = 0x0),
      (dh[us(0x2b9)] = 0x0),
      (dh[us(0x6bf)] = 0x0),
      (dh[us(0xca4)] = 0x0),
      (dh[us(0x13d)] = 0x0),
      (dh[us(0xadb)] = 0x0),
      (dh[us(0x8d6)] = 0x0),
      (dh[us(0x392)] = 0x0),
      (dh[us(0xb41)] = 0x0),
      (dh[us(0xd16)] = 0x0),
      (dh[us(0x8c9)] = 0x0),
      (dh[us(0x7ad)] = 0x0),
      (dh[us(0xd21)] = 0x0),
      (dh[us(0xbcf)] = ![]),
      (dh[us(0x6cd)] = 0x0),
      (dh[us(0xcf9)] = 0x0),
      (dh[us(0x1da)] = 0x0);
    var di = dh;
    const dj = {};
    (dj[us(0xcda)] = us(0x94b)),
      (dj[us(0x477)] = us(0xc5e)),
      (dj[us(0x41e)] = cS[us(0x378)]),
      (dj[us(0xc60)] = 0x9),
      (dj[us(0x424)] = 0xa),
      (dj[us(0x921)] = 0xa),
      (dj[us(0x530)] = 0x9c4);
    const dk = {};
    (dk[us(0xcda)] = us(0xaf3)),
      (dk[us(0x477)] = us(0xc2b)),
      (dk[us(0x41e)] = cS[us(0xaed)]),
      (dk[us(0xc60)] = 0xd / 1.1),
      (dk[us(0x424)] = 0x2),
      (dk[us(0x921)] = 0x37),
      (dk[us(0x530)] = 0x9c4),
      (dk[us(0xaf1)] = 0x1f4),
      (dk[us(0xbb8)] = !![]),
      (dk[us(0xa7d)] = 0x28),
      (dk[us(0x787)] = Math["PI"] / 0x4);
    const dl = {};
    (dl[us(0xcda)] = us(0x4f6)),
      (dl[us(0x477)] = us(0x661)),
      (dl[us(0x41e)] = cS[us(0xd99)]),
      (dl[us(0xc60)] = 0x8),
      (dl[us(0x424)] = 0x5),
      (dl[us(0x921)] = 0x5),
      (dl[us(0x530)] = 0xdac),
      (dl[us(0xaf1)] = 0x3e8),
      (dl[us(0xda9)] = 0xb),
      (dl[us(0x4c5)] = !![]);
    const dm = {};
    (dm[us(0xcda)] = us(0xc1)),
      (dm[us(0x477)] = us(0x9b6)),
      (dm[us(0x41e)] = cS[us(0xbe3)]),
      (dm[us(0xc60)] = 0x6),
      (dm[us(0x424)] = 0x5),
      (dm[us(0x921)] = 0x5),
      (dm[us(0x530)] = 0xfa0),
      (dm[us(0x23d)] = !![]),
      (dm[us(0x171)] = 0x32);
    const dn = {};
    (dn[us(0xcda)] = us(0x8dd)),
      (dn[us(0x477)] = us(0xa0d)),
      (dn[us(0x41e)] = cS[us(0x671)]),
      (dn[us(0xc60)] = 0xb),
      (dn[us(0x424)] = 0xc8),
      (dn[us(0x921)] = 0x1e),
      (dn[us(0x530)] = 0x1388);
    const dp = {};
    (dp[us(0xcda)] = us(0x972)),
      (dp[us(0x477)] = us(0xd9e)),
      (dp[us(0x41e)] = cS[us(0x440)]),
      (dp[us(0xc60)] = 0x8),
      (dp[us(0x424)] = 0x2),
      (dp[us(0x921)] = 0xa0),
      (dp[us(0x530)] = 0x2710),
      (dp[us(0x97c)] = 0xb),
      (dp[us(0x545)] = Math["PI"]),
      (dp[us(0xae1)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dq = {};
    (dq[us(0xcda)] = us(0xde7)),
      (dq[us(0x477)] = us(0x9e8)),
      (dq[us(0x834)] = df[us(0x654)]),
      (dq[us(0x9b7)] = 0x1e),
      (dq[us(0x620)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dr = {};
    (dr[us(0xcda)] = us(0x6d7)),
      (dr[us(0x477)] = us(0x360)),
      (dr[us(0x834)] = df[us(0x92c)]);
    const ds = {};
    (ds[us(0xcda)] = us(0xa1)),
      (ds[us(0x477)] = us(0x36d)),
      (ds[us(0x41e)] = cS[us(0x15a)]),
      (ds[us(0xc60)] = 0xb),
      (ds[us(0x530)] = 0x9c4),
      (ds[us(0x424)] = 0x14),
      (ds[us(0x921)] = 0x8),
      (ds[us(0xc2e)] = !![]),
      (ds[us(0x4e3)] = 0x2),
      (ds[us(0x219)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (ds[us(0x784)] = 0x14);
    const du = {};
    (du[us(0xcda)] = us(0x3a5)),
      (du[us(0x477)] = us(0xdd4)),
      (du[us(0x41e)] = cS[us(0x2b8)]),
      (du[us(0xc60)] = 0xb),
      (du[us(0x424)] = 0x14),
      (du[us(0x921)] = 0x14),
      (du[us(0x530)] = 0x5dc),
      (du[us(0x7d1)] = 0x64),
      (du[us(0x418)] = 0x1);
    const dv = {};
    (dv[us(0xcda)] = us(0x45b)),
      (dv[us(0x477)] = us(0xc42)),
      (dv[us(0x41e)] = cS[us(0x908)]),
      (dv[us(0xc60)] = 0x7),
      (dv[us(0x424)] = 0x5),
      (dv[us(0x921)] = 0xa),
      (dv[us(0x530)] = 0x258),
      (dv[us(0xccd)] = 0x1),
      (dv[us(0x509)] = !![]),
      (dv[us(0xae1)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dw = {};
    (dw[us(0xcda)] = us(0xd24)),
      (dw[us(0x477)] = us(0xb8f)),
      (dw[us(0x41e)] = cS[us(0x9c2)]),
      (dw[us(0xc60)] = 0xb),
      (dw[us(0x424)] = 0xf),
      (dw[us(0x921)] = 0x1),
      (dw[us(0x530)] = 0x3e8),
      (dw[us(0xb96)] = !![]),
      (dw[us(0x4c5)] = !![]);
    const dx = {};
    (dx[us(0xcda)] = us(0x237)),
      (dx[us(0x477)] = us(0x696)),
      (dx[us(0x41e)] = cS[us(0xd87)]),
      (dx[us(0xc60)] = 0xb),
      (dx[us(0x424)] = 0xf),
      (dx[us(0x921)] = 0x5),
      (dx[us(0x530)] = 0x5dc),
      (dx[us(0x645)] = 0x32),
      (dx[us(0xa22)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dy = {};
    (dy[us(0xcda)] = us(0x3a1)),
      (dy[us(0x477)] = us(0x120)),
      (dy[us(0x41e)] = cS[us(0xab6)]),
      (dy[us(0xc60)] = 0x7),
      (dy[us(0x424)] = 0x19),
      (dy[us(0x921)] = 0x19),
      (dy[us(0xccd)] = 0x4),
      (dy[us(0x530)] = 0x3e8),
      (dy[us(0xaf1)] = 0x1f4),
      (dy[us(0x97c)] = 0x9),
      (dy[us(0x787)] = Math["PI"] / 0x8),
      (dy[us(0xbb8)] = !![]),
      (dy[us(0xa7d)] = 0x28);
    const dz = {};
    (dz[us(0xcda)] = us(0xc63)),
      (dz[us(0x477)] = us(0x4fe)),
      (dz[us(0x41e)] = cS[us(0x1e8)]),
      (dz[us(0xc60)] = 0x10),
      (dz[us(0x424)] = 0x0),
      (dz[us(0x3ab)] = 0x1),
      (dz[us(0x921)] = 0x0),
      (dz[us(0x530)] = 0x157c),
      (dz[us(0xaf1)] = 0x1f4),
      (dz[us(0x67b)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dz[us(0x643)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dz[us(0x3d3)] = 0x3c),
      (dz[us(0x401)] = !![]),
      (dz[us(0x4c5)] = !![]);
    const dA = {};
    (dA[us(0xcda)] = us(0x923)),
      (dA[us(0x477)] = us(0x785)),
      (dA[us(0x41e)] = cS[us(0xdbd)]),
      (dA[us(0x530)] = 0x5dc),
      (dA[us(0xb54)] = !![]),
      (dA[us(0x424)] = 0xa),
      (dA[us(0x921)] = 0x14),
      (dA[us(0xc60)] = 0xd);
    const dB = {};
    (dB[us(0xcda)] = us(0x585)),
      (dB[us(0x477)] = us(0x875)),
      (dB[us(0x41e)] = cS[us(0xb67)]),
      (dB[us(0x530)] = 0xdac),
      (dB[us(0xaf1)] = 0x1f4),
      (dB[us(0x424)] = 0x5),
      (dB[us(0x921)] = 0x5),
      (dB[us(0xc60)] = 0xa),
      (dB[us(0xd73)] = 0x46),
      (dB[us(0x1a1)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
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
        name: us(0xc11),
        desc: us(0x9c9),
        ability: df[us(0x374)],
        orbitRange: 0x32,
        orbitRangeTiers: dd((r3) => 0x32 + r3 * 0x46),
      },
      {
        name: us(0x8e4),
        desc: us(0xce0),
        ability: df[us(0x998)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dA,
      dB,
      {
        name: us(0xb36),
        desc: us(0x42e),
        type: cS[us(0x5c1)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][us(0x466)](
          (r3) => r3 * 0.8
        ),
      },
      {
        name: us(0x5cd),
        desc: us(0x773),
        type: cS[us(0xbe3)],
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
        name: us(0xd58),
        desc: us(0xa05),
        type: cS[us(0x45a)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
        orbitSpeedFactor: 0.95,
        orbitSpeedFactorTiers: [0.94, 0.93, 0.92, 0.91, 0.9, 0.8, 0.7, 0.1],
      },
      {
        name: us(0x92e),
        desc: us(0xa93),
        type: cS[us(0xb2d)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][us(0x466)](
          (r3) => r3 - 0.2
        ),
      },
      {
        name: us(0x87d),
        desc: us(0x655),
        type: cS[us(0x67f)],
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
        name: us(0x3bc),
        desc: us(0x410),
        type: cS[us(0x83f)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: us(0xcfe),
        desc: us(0x2ad),
        type: cS[us(0xc9a)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: us(0xbf2),
        desc: us(0x8a6),
        type: cS[us(0x239)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: us(0x22b),
        desc: us(0x940),
        type: cS[us(0x452)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dD(![]),
      dD(!![]),
      {
        name: us(0x1b3),
        desc: us(0x57f),
        type: cS[us(0x3dc)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: us(0xd9c),
        desc: us(0xc79),
        type: cS[us(0x155)],
        size: 0xa,
        healthF: 0xf,
        damageF: 0x14,
        respawnTime: 0x5dc,
        extraSpeed: 0x2,
        extraSpeedTiers: [0x4, 0x6, 0x8, 0xa, 0xc, 0xe, 0x10, 0x18],
        turbulence: 0x14,
        turbulenceTiers: dd((r3) => 0x14 + r3 * 0x50),
      },
      {
        name: us(0x6f3),
        desc: us(0x990),
        type: cS[us(0xd99)],
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
        name: us(0x327),
        desc: us(0x693),
        type: cS[us(0x3c0)],
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
        spawn: us(0xb34),
        spawnTiers: [
          us(0x602),
          us(0xbe0),
          us(0x461),
          us(0x461),
          us(0xc24),
          us(0xb1e),
          us(0xb1e),
          us(0x4b6),
        ],
      },
      {
        name: us(0x37a),
        desc: us(0x54e),
        type: cS[us(0xd78)],
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
        spawn: us(0x325),
        spawnTiers: [
          us(0x824),
          us(0x824),
          us(0x623),
          us(0x1ed),
          us(0x993),
          us(0xa83),
          us(0xa83),
          us(0x315),
        ],
      },
      {
        name: us(0x763),
        desc: us(0x619),
        type: cS[us(0x3c0)],
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
        spawn: us(0x3dd),
        spawnTiers: [
          us(0x4e5),
          us(0x4e5),
          us(0xb64),
          us(0x776),
          us(0xb1c),
          us(0xbe2),
          us(0xbe2),
          us(0x346),
        ],
      },
      {
        name: us(0x33b),
        desc: us(0x159),
        type: cS[us(0xb05)],
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
        spawn: us(0xae2),
        spawnTiers: [
          us(0xae2),
          us(0x285),
          us(0x38f),
          us(0x4e6),
          us(0x97d),
          us(0x594),
          us(0x594),
          us(0x149),
        ],
      },
      {
        name: us(0x5f0),
        desc: us(0xa32),
        type: cS[us(0x2f6)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: us(0xd0e),
        spawnTiers: [
          us(0x200),
          us(0xa98),
          us(0xa98),
          us(0x93b),
          us(0xdb4),
          us(0xc0c),
          us(0xc0c),
          us(0x6e6),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: us(0x7d2),
        desc: us(0x869),
        type: cS[us(0x35b)],
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
        name: us(0x36a),
        desc: us(0x989),
        type: cS[us(0x8e8)],
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
        name: us(0x857),
        desc: us(0x246),
        type: cS[us(0x250)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: us(0x194),
        desc: us(0xa24),
        type: cS[us(0x967)],
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
        name: us(0x4dd),
        desc: us(0x1bd),
        type: cS[us(0x4c7)],
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
        name: us(0x8b1),
        desc: us(0x2ac),
        type: cS[us(0x777)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: us(0x720),
        desc: us(0x5f9),
        type: cS[us(0x986)],
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
        name: us(0xa3c),
        desc: us(0xc0d),
        ability: df[us(0x4bb)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: us(0xab2),
        desc: us(0x1a0),
        type: cS[us(0x561)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: us(0x96b),
        desc: us(0xabd),
        type: cS[us(0x1d9)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: us(0x4f9),
        desc: us(0x900),
        ability: df[us(0x3f0)],
        petHealF: 0x28,
      },
      {
        name: us(0x6da),
        desc: us(0xa8c),
        ability: df[us(0xcc3)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: us(0x44c),
        type: cS[us(0xd8e)],
        desc: us(0xa79),
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
        name: us(0x7c0),
        desc: us(0x356),
        type: cS[us(0x100)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: us(0x5c6),
        spawnTiers: [
          us(0x4db),
          us(0x46f),
          us(0x46f),
          us(0x3f9),
          us(0xb31),
          us(0x847),
          us(0x847),
          us(0x7bf),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: us(0x57b),
        desc: us(0x52d),
        type: cS[us(0x11a)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          us(0x466)
        ]((r3) => r3 / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: us(0xaa),
        desc: us(0x277),
        type: cS[us(0x94a)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: us(0x412),
        desc: us(0x670),
        type: cS[us(0xa5a)],
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
        name: us(0x17c),
        desc: us(0x800),
        type: cS[us(0x1be)],
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
        name: us(0x642),
        desc: us(0xa29),
        type: cS[us(0x769)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: us(0x9f6),
        desc: us(0xd0f),
        type: cS[us(0x9ac)],
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
        name: us(0x3b2),
        desc: us(0x59a),
        type: cS[us(0x791)],
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
        consumeProjType: cS[us(0x8e8)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: us(0x694),
        desc: us(0xcbd),
        type: cS[us(0x29b)],
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
        name: us(0x1a5),
        desc: us(0xdb3),
        type: cS[us(0x475)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: us(0x64e),
        spawnTiers: [
          us(0x295),
          us(0xd13),
          us(0xd13),
          us(0xcae),
          us(0x83c),
          us(0x832),
          us(0x348),
          us(0xd37),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: us(0xb99), desc: us(0x276), ability: df[us(0x15d)] },
      {
        name: us(0x476),
        desc: us(0x5a0),
        type: cS[us(0xa4d)],
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
        name: us(0x930),
        desc: us(0x511),
        type: cS[us(0x117)],
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
        name: us(0x658),
        desc: us(0x783),
        type: cS[us(0xd34)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: us(0xb92),
        desc: us(0x64b),
        type: cS[us(0x449)],
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
        name: us(0x1d5),
        desc: us(0x384),
        type: cS[us(0x779)],
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
        name: us(0x170),
        desc: us(0x362),
        type: cS[us(0xc77)],
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
        spawn: us(0x1d1),
        spawnTiers: [
          us(0x862),
          us(0xabf),
          us(0xabf),
          us(0x34e),
          us(0x195),
          us(0x9e2),
          us(0x9e2),
          us(0xea),
        ],
      },
      {
        name: us(0x579),
        desc: us(0xd45),
        type: cS[us(0x5f1)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: us(0x9dd),
        desc: us(0x371),
        type: cS[us(0x35e)],
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
        name: us(0x1ce),
        desc: us(0x140),
        type: cS[us(0xa99)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 2.5,
      },
      {
        name: us(0x433),
        desc: us(0xd7a),
        type: cS[us(0x9ad)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dd((r3) => 0xa + r3 * 0x28),
      },
      {
        name: us(0x2e4),
        desc: us(0xa81),
        type: cS[us(0x491)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: us(0x920),
        desc: us(0x97a),
        type: cS[us(0x83a)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dd((r3) => 0x2 + Math[us(0x2ab)](1.7 ** r3)),
      },
      {
        name: us(0xc8c),
        desc: us(0x697),
        type: cS[us(0x9a9)],
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
        name: us(0x62f),
        desc: us(0xa84),
        type: cS[us(0x806)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dd((r3) => 0.02 + r3 * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: us(0x9f9),
        desc: us(0xa01),
        type: cS[us(0xb22)],
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
        spawn: us(0x8dd),
        spawnTiers: [
          us(0x8dd),
          us(0x868),
          us(0x3e1),
          us(0xd74),
          us(0x9c3),
          us(0xc3),
          us(0xc3),
          us(0x89a),
        ],
      },
      { name: us(0x214), desc: us(0x599), ability: df[us(0x3ae)] },
      {
        name: us(0x8b4),
        desc: us(0x9e9),
        type: cS[us(0x7ce)],
        size: 0x10,
        healthF: 0x14,
        damageF: 0xa,
        fixAngle: !![],
        isDice: !![],
        respawnTime: 0x640,
      },
    ];
    function dD(r3) {
      const uz = us,
        r4 = r3 ? 0x1 : -0x1,
        r5 = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][uz(0x466)](
          (r6) => r6 * r4
        );
      return {
        name: r3 ? uz(0x59d) : uz(0x9a2),
        desc:
          (r3 ? uz(0xa6f) : uz(0x735)) +
          uz(0xc26) +
          (r3 ? uz(0xbe4) : "") +
          uz(0x2fc),
        type: cS[r3 ? uz(0x821) : uz(0x977)],
        size: 0x10,
        healthF: r3 ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: r5[0x0],
        mobSizeChangeTiers: r5[uz(0xba3)](0x1),
      };
    }
    var dE = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dF = {},
      dG = dC[us(0x8c2)],
      dH = da[us(0x8c2)],
      dI = eP();
    for (let r3 = 0x0, r4 = dC[us(0x8c2)]; r3 < r4; r3++) {
      const r5 = dC[r3];
      (r5[us(0x27a)] = !![]), (r5["id"] = r3);
      if (!r5[us(0x703)]) r5[us(0x703)] = r5[us(0xcda)];
      dK(r5), (r5[us(0x483)] = 0x0), (r5[us(0x8b9)] = r3);
      let r6 = r5;
      for (let r7 = 0x1; r7 < dH; r7++) {
        const r8 = dO(r5);
        (r8[us(0x3b6)] = r5[us(0x3b6)] + r7),
          (r8[us(0xcda)] = r5[us(0xcda)] + "_" + r8[us(0x3b6)]),
          (r8[us(0x483)] = r7),
          (r6[us(0x3f8)] = r8),
          (r6 = r8),
          dJ(r5, r8),
          dK(r8),
          (r8["id"] = dC[us(0x8c2)]),
          (dC[r8["id"]] = r8);
      }
    }
    function dJ(r9, ra) {
      const uA = us,
        rb = ra[uA(0x3b6)] - r9[uA(0x3b6)] - 0x1;
      for (let rc in r9) {
        const rd = r9[rc + uA(0xd97)];
        Array[uA(0xc9c)](rd) && (ra[rc] = rd[rb]);
      }
    }
    function dK(r9) {
      const uB = us;
      dF[r9[uB(0xcda)]] = r9;
      for (let ra in di) {
        r9[ra] === void 0x0 && (r9[ra] = di[ra]);
      }
      r9[uB(0x834)] === df[uB(0x92c)] &&
        (r9[uB(0xbd9)] = cW[r9[uB(0x3b6)] + 0x1] / 0x64),
        (r9[uB(0x3ab)] =
          r9[uB(0x424)] > 0x0
            ? dg(r9[uB(0x3b6)], r9[uB(0x424)])
            : r9[uB(0x3ab)]),
        (r9[uB(0xcf9)] =
          r9[uB(0x921)] > 0x0
            ? dg(r9[uB(0x3b6)], r9[uB(0x921)])
            : r9[uB(0xcf9)]),
        (r9[uB(0x69d)] = dg(r9[uB(0x3b6)], r9[uB(0x392)])),
        (r9[uB(0xd16)] = dg(r9[uB(0x3b6)], r9[uB(0xb41)])),
        (r9[uB(0xda2)] = dg(r9[uB(0x3b6)], r9[uB(0x8c9)])),
        (r9[uB(0xadb)] = dg(r9[uB(0x3b6)], r9[uB(0x8d6)])),
        (r9[uB(0x90c)] = dg(r9[uB(0x3b6)], r9[uB(0x1da)])),
        (r9[uB(0xdc2)] = dg(r9[uB(0x3b6)], r9[uB(0xb9c)])),
        (r9[uB(0x6bf)] = dg(r9[uB(0x3b6)], r9[uB(0x2b9)])),
        (r9[uB(0xca4)] = dg(r9[uB(0x3b6)], r9[uB(0x13d)])),
        r9[uB(0xb2f)] &&
          ((r9[uB(0x46b)] = dg(r9[uB(0x3b6)], r9[uB(0xb0b)])),
          (r9[uB(0xd60)] = dg(r9[uB(0x3b6)], r9[uB(0x586)]))),
        r9[uB(0xda9)] > 0x0
          ? (r9[uB(0xa33)] = dg(r9[uB(0x3b6)], r9[uB(0xda9)]))
          : (r9[uB(0xa33)] = 0x0),
        (r9[uB(0x8ba)] = r9[uB(0x23d)]
          ? dg(r9[uB(0x3b6)], r9[uB(0x171)])
          : 0x0),
        (r9[uB(0x2f2)] = r9[uB(0xc2e)]
          ? dg(r9[uB(0x3b6)], r9[uB(0x784)])
          : 0x0),
        (r9[uB(0x488)] = dg(r9[uB(0x3b6)], r9[uB(0x7d1)])),
        dI[r9[uB(0x3b6)]][uB(0x733)](r9);
    }
    var dL = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dM = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dN = cV(us(0x75f));
    function dO(r9) {
      const uC = us;
      return JSON[uC(0xae6)](JSON[uC(0x1e2)](r9));
    }
    const dP = {};
    (dP[us(0xcda)] = us(0x8aa)),
      (dP[us(0x477)] = us(0x6cf)),
      (dP[us(0x41e)] = us(0x2d2)),
      (dP[us(0x3b6)] = 0x0),
      (dP[us(0x424)] = 0x64),
      (dP[us(0x921)] = 0x1e),
      (dP[us(0x5ee)] = 0x32),
      (dP[us(0x90f)] = dN[us(0xd0d)]),
      (dP[us(0xc6f)] = ![]),
      (dP[us(0x37f)] = !![]),
      (dP[us(0x23d)] = ![]),
      (dP[us(0x171)] = 0x0),
      (dP[us(0x8ba)] = 0x0),
      (dP[us(0x54a)] = ![]),
      (dP[us(0x36e)] = ![]),
      (dP[us(0x955)] = 0x1),
      (dP[us(0x5ec)] = cS[us(0x378)]),
      (dP[us(0x29a)] = 0x0),
      (dP[us(0x6f1)] = 0x0),
      (dP[us(0x7ac)] = 0.5),
      (dP[us(0xd6a)] = 0x0),
      (dP[us(0xa7d)] = 0x1e),
      (dP[us(0xa1f)] = 0x0),
      (dP[us(0x187)] = ![]),
      (dP[us(0x784)] = 0x0),
      (dP[us(0x4e3)] = 0x0),
      (dP[us(0x1ac)] = 11.5),
      (dP[us(0x767)] = 0x4),
      (dP[us(0x81e)] = !![]),
      (dP[us(0xed)] = 0x0),
      (dP[us(0xd15)] = 0x0),
      (dP[us(0x30c)] = 0x1),
      (dP[us(0x937)] = 0x0),
      (dP[us(0x212)] = 0x0),
      (dP[us(0x153)] = 0x0),
      (dP[us(0x935)] = 0x0),
      (dP[us(0xbac)] = 0x1);
    var dQ = dP;
    const dR = {};
    (dR[us(0xcda)] = us(0xc34)),
      (dR[us(0x477)] = us(0xcf)),
      (dR[us(0x41e)] = us(0xa96)),
      (dR[us(0x424)] = 0x2ee),
      (dR[us(0x921)] = 0xa),
      (dR[us(0x5ee)] = 0x32),
      (dR[us(0x54a)] = !![]),
      (dR[us(0x36e)] = !![]),
      (dR[us(0x955)] = 0.05),
      (dR[us(0x1ac)] = 0x5),
      (dR[us(0x738)] = !![]),
      (dR[us(0x42f)] = [[us(0x325), 0x3]]),
      (dR[us(0xcd3)] = [
        [us(0x65b), 0x1],
        [us(0x325), 0x2],
        [us(0xd19), 0x2],
        [us(0x18a), 0x1],
      ]),
      (dR[us(0x8a2)] = [[us(0x3a5), "f"]]);
    const dS = {};
    (dS[us(0xcda)] = us(0x65b)),
      (dS[us(0x477)] = us(0x40c)),
      (dS[us(0x41e)] = us(0x208)),
      (dS[us(0x424)] = 0x1f4),
      (dS[us(0x921)] = 0xa),
      (dS[us(0x5ee)] = 0x28),
      (dS[us(0x738)] = !![]),
      (dS[us(0xc6f)] = !![]),
      (dS[us(0x8a2)] = [
        [us(0x3bc), "E"],
        [us(0x59d), "G"],
        [us(0x37a), "A"],
      ]);
    const dT = {};
    (dT[us(0xcda)] = us(0x325)),
      (dT[us(0x477)] = us(0x172)),
      (dT[us(0x41e)] = us(0x213)),
      (dT[us(0x424)] = 0x64),
      (dT[us(0x921)] = 0xa),
      (dT[us(0x5ee)] = 0x1c),
      (dT[us(0xc6f)] = !![]),
      (dT[us(0x8a2)] = [[us(0x3bc), "I"]]);
    const dU = {};
    (dU[us(0xcda)] = us(0xd19)),
      (dU[us(0x477)] = us(0x742)),
      (dU[us(0x41e)] = us(0xb38)),
      (dU[us(0x424)] = 62.5),
      (dU[us(0x921)] = 0xa),
      (dU[us(0x5ee)] = 0x1c),
      (dU[us(0x8a2)] = [[us(0x22b), "H"]]);
    const dV = {};
    (dV[us(0xcda)] = us(0x18a)),
      (dV[us(0x477)] = us(0x7b5)),
      (dV[us(0x41e)] = us(0x837)),
      (dV[us(0x424)] = 0x19),
      (dV[us(0x921)] = 0xa),
      (dV[us(0x5ee)] = 0x19),
      (dV[us(0xc6f)] = ![]),
      (dV[us(0x37f)] = ![]),
      (dV[us(0x8a2)] = [
        [us(0x45b), "F"],
        [us(0x22b), "F"],
        [us(0x9a2), "G"],
        [us(0x8b1), "F"],
      ]);
    var dW = [dR, dS, dT, dU, dV];
    function dX() {
      const uD = us,
        r9 = dO(dW);
      for (let ra = 0x0; ra < r9[uD(0x8c2)]; ra++) {
        const rb = r9[ra];
        (rb[uD(0x41e)] += uD(0x412)),
          rb[uD(0xcda)] === uD(0xc34) &&
            (rb[uD(0x8a2)] = [
              [uD(0x237), "D"],
              [uD(0x7d2), "E"],
            ]),
          (rb[uD(0xcda)] = dY(rb[uD(0xcda)])),
          (rb[uD(0x477)] = dY(rb[uD(0x477)])),
          (rb[uD(0x921)] *= 0x2),
          rb[uD(0x42f)] &&
            rb[uD(0x42f)][uD(0xaba)]((rc) => {
              return (rc[0x0] = dY(rc[0x0])), rc;
            }),
          rb[uD(0xcd3)] &&
            rb[uD(0xcd3)][uD(0xaba)]((rc) => {
              return (rc[0x0] = dY(rc[0x0])), rc;
            });
      }
      return r9;
    }
    function dY(r9) {
      const uE = us;
      return r9[uE(0x9c7)](/Ant/g, uE(0xb0a))[uE(0x9c7)](/ant/g, uE(0xca1));
    }
    const dZ = {};
    (dZ[us(0xcda)] = us(0x797)),
      (dZ[us(0x477)] = us(0xc1c)),
      (dZ[us(0x41e)] = us(0xf3)),
      (dZ[us(0x424)] = 37.5),
      (dZ[us(0x921)] = 0x32),
      (dZ[us(0x5ee)] = 0x28),
      (dZ[us(0x8a2)] = [
        [us(0x972), "F"],
        [us(0x87d), "I"],
      ]),
      (dZ[us(0xed)] = 0x4),
      (dZ[us(0xd15)] = 0x4);
    const e0 = {};
    (e0[us(0xcda)] = us(0xbf2)),
      (e0[us(0x477)] = us(0x582)),
      (e0[us(0x41e)] = us(0xb2c)),
      (e0[us(0x424)] = 0x5e),
      (e0[us(0x921)] = 0x5),
      (e0[us(0x955)] = 0.05),
      (e0[us(0x5ee)] = 0x3c),
      (e0[us(0x54a)] = !![]),
      (e0[us(0x8a2)] = [[us(0xbf2), "h"]]);
    const e1 = {};
    (e1[us(0xcda)] = us(0x8dd)),
      (e1[us(0x477)] = us(0x3d0)),
      (e1[us(0x41e)] = us(0xa26)),
      (e1[us(0x424)] = 0x4b),
      (e1[us(0x921)] = 0xa),
      (e1[us(0x955)] = 0.05),
      (e1[us(0x54a)] = !![]),
      (e1[us(0x685)] = 1.25),
      (e1[us(0x8a2)] = [
        [us(0x8dd), "h"],
        [us(0xd58), "J"],
        [us(0x9f9), "K"],
      ]);
    const e2 = {};
    (e2[us(0xcda)] = us(0x3dd)),
      (e2[us(0x477)] = us(0xf2)),
      (e2[us(0x41e)] = us(0x6a6)),
      (e2[us(0x424)] = 62.5),
      (e2[us(0x921)] = 0x32),
      (e2[us(0xc6f)] = !![]),
      (e2[us(0x5ee)] = 0x28),
      (e2[us(0x8a2)] = [
        [us(0xaf3), "f"],
        [us(0x6d7), "I"],
        [us(0x763), "K"],
      ]),
      (e2[us(0x5ec)] = cS[us(0xaed)]),
      (e2[us(0x6f1)] = 0xa),
      (e2[us(0x29a)] = 0x5),
      (e2[us(0xa7d)] = 0x26),
      (e2[us(0x7ac)] = 0.375 / 1.1),
      (e2[us(0xd6a)] = 0.75),
      (e2[us(0x90f)] = dN[us(0x6a6)]);
    const e3 = {};
    (e3[us(0xcda)] = us(0xaeb)),
      (e3[us(0x477)] = us(0x974)),
      (e3[us(0x41e)] = us(0x1c8)),
      (e3[us(0x424)] = 87.5),
      (e3[us(0x921)] = 0xa),
      (e3[us(0x8a2)] = [
        [us(0x45b), "f"],
        [us(0x4f6), "f"],
      ]),
      (e3[us(0xed)] = 0x5),
      (e3[us(0xd15)] = 0x5);
    const e4 = {};
    (e4[us(0xcda)] = us(0xb34)),
      (e4[us(0x477)] = us(0x7dd)),
      (e4[us(0x41e)] = us(0x2d2)),
      (e4[us(0x424)] = 0x64),
      (e4[us(0x921)] = 0x1e),
      (e4[us(0xc6f)] = !![]),
      (e4[us(0x8a2)] = [[us(0x327), "F"]]),
      (e4[us(0xed)] = 0x5),
      (e4[us(0xd15)] = 0x5);
    const e5 = {};
    (e5[us(0xcda)] = us(0x1d1)),
      (e5[us(0x477)] = us(0x8fc)),
      (e5[us(0x41e)] = us(0x808)),
      (e5[us(0x424)] = 62.5),
      (e5[us(0x921)] = 0xf),
      (e5[us(0x23d)] = !![]),
      (e5[us(0x171)] = 0xf),
      (e5[us(0x5ee)] = 0x23),
      (e5[us(0xc6f)] = !![]),
      (e5[us(0x8a2)] = [
        [us(0x92e), "F"],
        [us(0x585), "F"],
        [us(0xde7), "L"],
        [us(0xa3c), "G"],
      ]);
    const e6 = {};
    (e6[us(0xcda)] = us(0x891)),
      (e6[us(0x477)] = us(0xb73)),
      (e6[us(0x41e)] = us(0x5bc)),
      (e6[us(0x424)] = 0x64),
      (e6[us(0x921)] = 0xf),
      (e6[us(0x23d)] = !![]),
      (e6[us(0x171)] = 0xa),
      (e6[us(0x5ee)] = 0x2f),
      (e6[us(0xc6f)] = !![]),
      (e6[us(0x8a2)] = [
        [us(0xc1), "F"],
        [us(0x720), "F"],
      ]),
      (e6[us(0x5ec)] = cS[us(0x440)]),
      (e6[us(0x6f1)] = 0x3),
      (e6[us(0x29a)] = 0x5),
      (e6[us(0xa1f)] = 0x7),
      (e6[us(0xa7d)] = 0x2b),
      (e6[us(0x7ac)] = 0.21),
      (e6[us(0xd6a)] = -0.31),
      (e6[us(0x90f)] = dN[us(0xc6d)]);
    const e7 = {};
    (e7[us(0xcda)] = us(0xae2)),
      (e7[us(0x477)] = us(0x3f4)),
      (e7[us(0x41e)] = us(0xcf1)),
      (e7[us(0x424)] = 0x15e),
      (e7[us(0x921)] = 0x28),
      (e7[us(0x5ee)] = 0x2d),
      (e7[us(0xc6f)] = !![]),
      (e7[us(0x738)] = !![]),
      (e7[us(0x8a2)] = [
        [us(0x8e4), "F"],
        [us(0xc11), "G"],
        [us(0xcfe), "H"],
        [us(0x33b), "J"],
      ]);
    const e8 = {};
    (e8[us(0xcda)] = us(0x197)),
      (e8[us(0x477)] = us(0x877)),
      (e8[us(0x41e)] = us(0xb7)),
      (e8[us(0x424)] = 0x7d),
      (e8[us(0x921)] = 0x19),
      (e8[us(0xc6f)] = !![]),
      (e8[us(0x187)] = !![]),
      (e8[us(0x784)] = 0x5),
      (e8[us(0x4e3)] = 0x2),
      (e8[us(0x219)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e8[us(0x767)] = 0x4),
      (e8[us(0x1ac)] = 0x6),
      (e8[us(0x8a2)] = [[us(0xa1), "F"]]);
    const e9 = {};
    (e9[us(0xcda)] = us(0xc63)),
      (e9[us(0x477)] = us(0x2bc)),
      (e9[us(0x41e)] = us(0x7ed)),
      (e9[us(0x424)] = 0.5),
      (e9[us(0x921)] = 0x5),
      (e9[us(0xc6f)] = ![]),
      (e9[us(0x37f)] = ![]),
      (e9[us(0x767)] = 0x1),
      (e9[us(0x8a2)] = [[us(0xc63), "F"]]);
    const ea = {};
    (ea[us(0xcda)] = us(0xaa1)),
      (ea[us(0x477)] = us(0x478)),
      (ea[us(0x41e)] = us(0x884)),
      (ea[us(0x424)] = 0x19),
      (ea[us(0x921)] = 0xa),
      (ea[us(0x5ee)] = 0x28),
      (ea[us(0x55f)] = cS[us(0x49e)]),
      (ea[us(0x8a2)] = [
        [us(0x22b), "J"],
        [us(0x3a1), "J"],
      ]);
    const eb = {};
    (eb[us(0xcda)] = us(0x677)),
      (eb[us(0x477)] = us(0x5b2)),
      (eb[us(0x41e)] = us(0x833)),
      (eb[us(0x424)] = 0x19),
      (eb[us(0x921)] = 0xa),
      (eb[us(0x5ee)] = 0x28),
      (eb[us(0x55f)] = cS[us(0x8c5)]),
      (eb[us(0xc6f)] = !![]),
      (eb[us(0x8a2)] = [
        [us(0xc1), "J"],
        [us(0x5cd), "J"],
      ]);
    const ec = {};
    (ec[us(0xcda)] = us(0xcfd)),
      (ec[us(0x477)] = us(0xadd)),
      (ec[us(0x41e)] = us(0xb6f)),
      (ec[us(0x424)] = 0x19),
      (ec[us(0x921)] = 0xa),
      (ec[us(0x5ee)] = 0x28),
      (ec[us(0x55f)] = cS[us(0x839)]),
      (ec[us(0x37f)] = ![]),
      (ec[us(0x8a2)] = [
        [us(0x1b3), "J"],
        [us(0xb36), "H"],
        [us(0xd9c), "J"],
      ]),
      (ec[us(0x767)] = 0x17),
      (ec[us(0x1ac)] = 0x17 * 0.75);
    const ed = {};
    (ed[us(0xcda)] = us(0x8b6)),
      (ed[us(0x477)] = us(0x8ed)),
      (ed[us(0x41e)] = us(0x2fa)),
      (ed[us(0x424)] = 87.5),
      (ed[us(0x921)] = 0xa),
      (ed[us(0x8a2)] = [
        [us(0x6f3), "F"],
        [us(0x923), "I"],
      ]),
      (ed[us(0xed)] = 0x5),
      (ed[us(0xd15)] = 0x5);
    const ee = {};
    (ee[us(0xcda)] = us(0x2ba)),
      (ee[us(0x477)] = us(0xa1d)),
      (ee[us(0x41e)] = us(0x3fe)),
      (ee[us(0x424)] = 87.5),
      (ee[us(0x921)] = 0xa),
      (ee[us(0x8a2)] = [
        [us(0x4f6), "A"],
        [us(0x6f3), "A"],
      ]),
      (ee[us(0xed)] = 0x5),
      (ee[us(0xd15)] = 0x5);
    const ef = {};
    (ef[us(0xcda)] = us(0xbbd)),
      (ef[us(0x477)] = us(0xc8a)),
      (ef[us(0x41e)] = us(0xd61)),
      (ef[us(0x424)] = 0x32),
      (ef[us(0x921)] = 0xa),
      (ef[us(0x955)] = 0.05),
      (ef[us(0x5ee)] = 0x3c),
      (ef[us(0x54a)] = !![]),
      (ef[us(0x8a2)] = [
        [us(0xd24), "E"],
        [us(0x57b), "F"],
        [us(0x694), "F"],
      ]);
    const eg = {};
    (eg[us(0xcda)] = us(0xd0e)),
      (eg[us(0x477)] = us(0x5de)),
      (eg[us(0x41e)] = us(0x3cf)),
      (eg[us(0x424)] = 0x7d),
      (eg[us(0x921)] = 0x28),
      (eg[us(0x5ee)] = 0x32),
      (eg[us(0xc6f)] = ![]),
      (eg[us(0x37f)] = ![]),
      (eg[us(0x90f)] = dN[us(0x3cf)]),
      (eg[us(0x767)] = 0xe),
      (eg[us(0x1ac)] = 0xb),
      (eg[us(0x30c)] = 2.2),
      (eg[us(0x8a2)] = [
        [us(0x5f0), "J"],
        [us(0x1b3), "H"],
      ]);
    const eh = {};
    (eh[us(0xcda)] = us(0x69a)),
      (eh[us(0x477)] = us(0xb9)),
      (eh[us(0x41e)] = us(0xd7b)),
      (eh[us(0x424)] = 0x7d),
      (eh[us(0x921)] = 0x28),
      (eh[us(0x5ee)] = null),
      (eh[us(0xc6f)] = !![]),
      (eh[us(0xd9)] = !![]),
      (eh[us(0x8a2)] = [
        [us(0x94b), "D"],
        [us(0x36a), "E"],
        [us(0x3b2), "E"],
      ]),
      (eh[us(0x5ee)] = 0x32),
      (eh[us(0xc60)] = 0x32),
      (eh[us(0x4a7)] = !![]),
      (eh[us(0x937)] = -Math["PI"] / 0x2),
      (eh[us(0x5ec)] = cS[us(0x8e8)]),
      (eh[us(0x6f1)] = 0x3),
      (eh[us(0x29a)] = 0x3),
      (eh[us(0xa7d)] = 0x21),
      (eh[us(0x7ac)] = 0.32),
      (eh[us(0xd6a)] = 0.4),
      (eh[us(0x90f)] = dN[us(0x6a6)]);
    const ei = {};
    (ei[us(0xcda)] = us(0x857)),
      (ei[us(0x477)] = us(0xce5)),
      (ei[us(0x41e)] = us(0x29f)),
      (ei[us(0x424)] = 0x96),
      (ei[us(0x921)] = 0x14),
      (ei[us(0xc6f)] = !![]),
      (ei[us(0x212)] = 0.5),
      (ei[us(0x8a2)] = [
        [us(0x857), "D"],
        [us(0xb36), "J"],
        [us(0x1b3), "J"],
      ]);
    const ej = {};
    (ej[us(0xcda)] = us(0x194)),
      (ej[us(0x477)] = us(0x139)),
      (ej[us(0x41e)] = us(0x755)),
      (ej[us(0x424)] = 0x19),
      (ej[us(0x921)] = 0xf),
      (ej[us(0x955)] = 0.05),
      (ej[us(0x5ee)] = 0x37),
      (ej[us(0x54a)] = !![]),
      (ej[us(0x8a2)] = [[us(0x194), "h"]]),
      (ej[us(0x5ec)] = cS[us(0x967)]),
      (ej[us(0x153)] = 0x9),
      (ej[us(0xa7d)] = 0x28),
      (ej[us(0x6f1)] = 0xf),
      (ej[us(0x29a)] = 2.5),
      (ej[us(0xa7d)] = 0x21),
      (ej[us(0x7ac)] = 0.32),
      (ej[us(0xd6a)] = 1.8),
      (ej[us(0x935)] = 0x14);
    const ek = {};
    (ek[us(0xcda)] = us(0x4dd)),
      (ek[us(0x477)] = us(0x690)),
      (ek[us(0x41e)] = us(0x828)),
      (ek[us(0x424)] = 0xe1),
      (ek[us(0x921)] = 0xa),
      (ek[us(0x5ee)] = 0x32),
      (ek[us(0x8a2)] = [
        [us(0x4dd), "H"],
        [us(0x237), "L"],
      ]),
      (ek[us(0xd9)] = !![]),
      (ek[us(0x438)] = !![]),
      (ek[us(0x1ac)] = 0x23);
    const em = {};
    (em[us(0xcda)] = us(0xdcb)),
      (em[us(0x477)] = us(0x8b8)),
      (em[us(0x41e)] = us(0x78c)),
      (em[us(0x424)] = 0x96),
      (em[us(0x921)] = 0x19),
      (em[us(0x5ee)] = 0x2f),
      (em[us(0xc6f)] = !![]),
      (em[us(0x8a2)] = [[us(0x1b3), "J"]]),
      (em[us(0x5ec)] = null),
      (em[us(0x90f)] = dN[us(0xc6d)]);
    const en = {};
    (en[us(0xcda)] = us(0x5c9)),
      (en[us(0x477)] = us(0x9df)),
      (en[us(0x41e)] = us(0x5b9)),
      (en[us(0x424)] = 0x64),
      (en[us(0x921)] = 0x1e),
      (en[us(0x5ee)] = 0x1e),
      (en[us(0xc6f)] = !![]),
      (en[us(0x55e)] = us(0x7d2)),
      (en[us(0x8a2)] = [
        [us(0x7d2), "F"],
        [us(0xa3c), "E"],
        [us(0x44c), "D"],
        [us(0x214), "E"],
      ]);
    const eo = {};
    (eo[us(0xcda)] = us(0xab2)),
      (eo[us(0x477)] = us(0x18e)),
      (eo[us(0x41e)] = us(0x39d)),
      (eo[us(0x424)] = 0x64),
      (eo[us(0x921)] = 0xa),
      (eo[us(0x5ee)] = 0x3c),
      (eo[us(0x54a)] = !![]),
      (eo[us(0x955)] = 0.05),
      (eo[us(0x8a2)] = [[us(0xab2), "D"]]);
    const ep = {};
    (ep[us(0xcda)] = us(0x890)),
      (ep[us(0x477)] = us(0xbda)),
      (ep[us(0x41e)] = us(0xb76)),
      (ep[us(0x424)] = 0x64),
      (ep[us(0x921)] = 0x23),
      (ep[us(0xc6f)] = !![]),
      (ep[us(0x8a2)] = [
        [us(0x96b), "E"],
        [us(0xb92), "D"],
      ]);
    const eq = {};
    (eq[us(0xcda)] = us(0x68b)),
      (eq[us(0x477)] = us(0x112)),
      (eq[us(0x41e)] = us(0x2a8)),
      (eq[us(0x424)] = 0xc8),
      (eq[us(0x921)] = 0x23),
      (eq[us(0x5ee)] = 0x23),
      (eq[us(0xc6f)] = !![]),
      (eq[us(0xd15)] = 0x5),
      (eq[us(0x8a2)] = [
        [us(0x4f9), "F"],
        [us(0x6da), "D"],
        [us(0x658), "E"],
      ]);
    const er = {};
    (er[us(0xcda)] = us(0x5c6)),
      (er[us(0x477)] = us(0x5bd)),
      (er[us(0x41e)] = us(0x233)),
      (er[us(0x424)] = 0xc8),
      (er[us(0x921)] = 0x14),
      (er[us(0x5ee)] = 0x28),
      (er[us(0xc6f)] = !![]),
      (er[us(0x8a2)] = [
        [us(0x7c0), "E"],
        [us(0xaa), "D"],
        [us(0x412), "F"],
        [us(0x17c), "F"],
      ]),
      (er[us(0x517)] = !![]),
      (er[us(0x7ec)] = 0xbb8),
      (er[us(0x8cf)] = 0.3);
    const es = {};
    (es[us(0xcda)] = us(0x642)),
      (es[us(0x477)] = us(0x32f)),
      (es[us(0x41e)] = us(0x76f)),
      (es[us(0x424)] = 0x78),
      (es[us(0x921)] = 0x1e),
      (es[us(0x438)] = !![]),
      (es[us(0x1ac)] = 0xf),
      (es[us(0x767)] = 0x5),
      (es[us(0x8a2)] = [
        [us(0x642), "F"],
        [us(0x9f6), "E"],
        [us(0x930), "D"],
      ]),
      (es[us(0xd15)] = 0x3);
    const et = {};
    (et[us(0xcda)] = us(0x1a5)),
      (et[us(0x477)] = us(0x6fd)),
      (et[us(0x41e)] = us(0xc6)),
      (et[us(0x424)] = 0x78),
      (et[us(0x921)] = 0x23),
      (et[us(0x5ee)] = 0x32),
      (et[us(0xc6f)] = !![]),
      (et[us(0x2d0)] = !![]),
      (et[us(0x8a2)] = [
        [us(0x1a5), "E"],
        [us(0x694), "F"],
      ]),
      (et[us(0x42f)] = [[us(0x64e), 0x1]]),
      (et[us(0xcd3)] = [[us(0x64e), 0x2]]),
      (et[us(0x6c4)] = !![]);
    const eu = {};
    (eu[us(0xcda)] = us(0x64e)),
      (eu[us(0x477)] = us(0x596)),
      (eu[us(0x41e)] = us(0x663)),
      (eu[us(0x424)] = 0x96),
      (eu[us(0x921)] = 0.1),
      (eu[us(0x5ee)] = 0x28),
      (eu[us(0x767)] = 0xe),
      (eu[us(0x1ac)] = 11.6),
      (eu[us(0xc6f)] = !![]),
      (eu[us(0x2d0)] = !![]),
      (eu[us(0x8da)] = !![]),
      (eu[us(0x90f)] = dN[us(0x3cf)]),
      (eu[us(0x251)] = 0xa),
      (eu[us(0x8a2)] = [[us(0xb99), "G"]]),
      (eu[us(0xbac)] = 0.5);
    const ev = {};
    (ev[us(0xcda)] = us(0x8ad)),
      (ev[us(0x477)] = us(0x67a)),
      (ev[us(0x41e)] = us(0x4c1)),
      (ev[us(0x424)] = 0x1f4),
      (ev[us(0x921)] = 0x28),
      (ev[us(0x955)] = 0.05),
      (ev[us(0x5ee)] = 0x32),
      (ev[us(0x54a)] = !![]),
      (ev[us(0x1ac)] = 0x5),
      (ev[us(0x36e)] = !![]),
      (ev[us(0x738)] = !![]),
      (ev[us(0x8a2)] = [
        [us(0x476), "F"],
        [us(0x763), "C"],
      ]),
      (ev[us(0x42f)] = [
        [us(0x797), 0x2],
        [us(0x3dd), 0x1],
      ]),
      (ev[us(0xcd3)] = [
        [us(0x797), 0x4],
        [us(0x3dd), 0x2],
      ]);
    const ew = {};
    (ew[us(0xcda)] = us(0x1d5)),
      (ew[us(0x477)] = us(0x190)),
      (ew[us(0x41e)] = us(0x523)),
      (ew[us(0x424)] = 0x50),
      (ew[us(0x921)] = 0x28),
      (ew[us(0x767)] = 0x2),
      (ew[us(0x1ac)] = 0x6),
      (ew[us(0xd9)] = !![]),
      (ew[us(0x8a2)] = [[us(0x1d5), "F"]]);
    const ex = {};
    (ex[us(0xcda)] = us(0x5f3)),
      (ex[us(0x477)] = us(0x114)),
      (ex[us(0x41e)] = us(0x179)),
      (ex[us(0x424)] = 0x1f4),
      (ex[us(0x921)] = 0x28),
      (ex[us(0x955)] = 0.05),
      (ex[us(0x5ee)] = 0x46),
      (ex[us(0x1ac)] = 0x5),
      (ex[us(0x54a)] = !![]),
      (ex[us(0x36e)] = !![]),
      (ex[us(0x738)] = !![]),
      (ex[us(0x8a2)] = [
        [us(0x170), "A"],
        [us(0x585), "E"],
      ]),
      (ex[us(0x42f)] = [[us(0x1d1), 0x2]]),
      (ex[us(0xcd3)] = [
        [us(0x1d1), 0x3],
        [us(0x5c9), 0x2],
      ]);
    const ey = {};
    (ey[us(0xcda)] = us(0xa04)),
      (ey[us(0x477)] = us(0x25e)),
      (ey[us(0x41e)] = us(0x146)),
      (ey[us(0x5ee)] = 0x28),
      (ey[us(0x424)] = 0x64),
      (ey[us(0x921)] = 0xa),
      (ey[us(0x955)] = 0.05),
      (ey[us(0x54a)] = !![]),
      (ey[us(0xed)] = 0x1),
      (ey[us(0xd15)] = 0x1),
      (ey[us(0x8a2)] = [
        [us(0x6da), "G"],
        [us(0xb36), "F"],
        [us(0x579), "F"],
      ]);
    const ez = {};
    (ez[us(0xcda)] = us(0x63d)),
      (ez[us(0x477)] = us(0x6b5)),
      (ez[us(0x41e)] = us(0x27f)),
      (ez[us(0x424)] = 0x3c),
      (ez[us(0x921)] = 0x28),
      (ez[us(0x5ee)] = 0x32),
      (ez[us(0xc6f)] = ![]),
      (ez[us(0x37f)] = ![]),
      (ez[us(0x90f)] = dN[us(0x3cf)]),
      (ez[us(0x767)] = 0xe),
      (ez[us(0x1ac)] = 0xb),
      (ez[us(0x30c)] = 2.2),
      (ez[us(0x8a2)] = [
        [us(0xb92), "E"],
        [us(0x1b3), "J"],
      ]);
    const eA = {};
    (eA[us(0xcda)] = us(0xa6d)),
      (eA[us(0x477)] = us(0xda6)),
      (eA[us(0x41e)] = us(0x181)),
      (eA[us(0x424)] = 0x258),
      (eA[us(0x921)] = 0x32),
      (eA[us(0x955)] = 0.05),
      (eA[us(0x5ee)] = 0x3c),
      (eA[us(0x1ac)] = 0x7),
      (eA[us(0x738)] = !![]),
      (eA[us(0x54a)] = !![]),
      (eA[us(0x36e)] = !![]),
      (eA[us(0x8a2)] = [
        [us(0x7c0), "A"],
        [us(0x5f0), "G"],
      ]),
      (eA[us(0x42f)] = [[us(0x5c6), 0x1]]),
      (eA[us(0xcd3)] = [[us(0x5c6), 0x1]]);
    const eB = {};
    (eB[us(0xcda)] = us(0x44e)),
      (eB[us(0x477)] = us(0x4ec)),
      (eB[us(0x41e)] = us(0x26a)),
      (eB[us(0x424)] = 0xc8),
      (eB[us(0x921)] = 0x1e),
      (eB[us(0x5ee)] = 0x2d),
      (eB[us(0xc6f)] = !![]),
      (eB[us(0x8a2)] = [
        [us(0x8e4), "G"],
        [us(0xc11), "H"],
        [us(0x930), "E"],
      ]);
    const eC = {};
    (eC[us(0xcda)] = us(0x5a6)),
      (eC[us(0x477)] = us(0xa61)),
      (eC[us(0x41e)] = us(0xb5b)),
      (eC[us(0x424)] = 0x3c),
      (eC[us(0x921)] = 0x64),
      (eC[us(0x5ee)] = 0x28),
      (eC[us(0x25b)] = !![]),
      (eC[us(0x81e)] = ![]),
      (eC[us(0xc6f)] = !![]),
      (eC[us(0x8a2)] = [
        [us(0xaa), "F"],
        [us(0x22b), "D"],
        [us(0x9dd), "G"],
      ]);
    const eD = {};
    (eD[us(0xcda)] = us(0x1ce)),
      (eD[us(0x477)] = us(0xa9f)),
      (eD[us(0x41e)] = us(0x1f9)),
      (eD[us(0x5ee)] = 0x28),
      (eD[us(0x424)] = 0x5a),
      (eD[us(0x921)] = 0x5),
      (eD[us(0x955)] = 0.05),
      (eD[us(0x54a)] = !![]),
      (eD[us(0x8a2)] = [[us(0x1ce), "h"]]);
    const eE = {};
    (eE[us(0xcda)] = us(0x433)),
      (eE[us(0x477)] = us(0x9fb)),
      (eE[us(0x41e)] = us(0x188)),
      (eE[us(0x424)] = 0x32),
      (eE[us(0x921)] = 0x14),
      (eE[us(0x5ee)] = 0x28),
      (eE[us(0xd9)] = !![]),
      (eE[us(0x8a2)] = [[us(0x433), "F"]]);
    const eF = {};
    (eF[us(0xcda)] = us(0x2e4)),
      (eF[us(0x477)] = us(0xaff)),
      (eF[us(0x41e)] = us(0x734)),
      (eF[us(0x424)] = 0x32),
      (eF[us(0x921)] = 0x14),
      (eF[us(0x955)] = 0.05),
      (eF[us(0x54a)] = !![]),
      (eF[us(0x8a2)] = [[us(0x2e4), "J"]]);
    const eG = {};
    (eG[us(0xcda)] = us(0xd3c)),
      (eG[us(0x477)] = us(0x7f2)),
      (eG[us(0x41e)] = us(0x496)),
      (eG[us(0x424)] = 0x64),
      (eG[us(0x921)] = 0x1e),
      (eG[us(0x955)] = 0.05),
      (eG[us(0x5ee)] = 0x32),
      (eG[us(0x54a)] = !![]),
      (eG[us(0x8a2)] = [
        [us(0xaa), "D"],
        [us(0x920), "E"],
      ]);
    const eH = {};
    (eH[us(0xcda)] = us(0xbe9)),
      (eH[us(0x477)] = us(0xda8)),
      (eH[us(0x41e)] = us(0x4a1)),
      (eH[us(0x424)] = 0x96),
      (eH[us(0x921)] = 0x14),
      (eH[us(0x5ee)] = 0x28),
      (eH[us(0x8a2)] = [
        [us(0xc8c), "D"],
        [us(0x9f6), "F"],
      ]),
      (eH[us(0xcd3)] = [[us(0x18a), 0x1, 0.3]]);
    const eI = {};
    (eI[us(0xcda)] = us(0x62f)),
      (eI[us(0x477)] = us(0x162)),
      (eI[us(0x41e)] = us(0x970)),
      (eI[us(0x424)] = 0x32),
      (eI[us(0x921)] = 0x5),
      (eI[us(0x955)] = 0.05),
      (eI[us(0x54a)] = !![]),
      (eI[us(0x8a2)] = [
        [us(0x62f), "h"],
        [us(0x22b), "J"],
      ]);
    const eJ = {};
    (eJ[us(0xcda)] = us(0x8b4)),
      (eJ[us(0x477)] = us(0x55c)),
      (eJ[us(0x41e)] = us(0xdbe)),
      (eJ[us(0x424)] = 0x64),
      (eJ[us(0x921)] = 0x5),
      (eJ[us(0x955)] = 0.05),
      (eJ[us(0x54a)] = !![]),
      (eJ[us(0x8a2)] = [[us(0x8b4), "h"]]);
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
      eL = eK[us(0x8c2)],
      eM = {},
      eN = [],
      eO = eP();
    function eP() {
      const r9 = [];
      for (let ra = 0x0; ra < dH; ra++) {
        r9[ra] = [];
      }
      return r9;
    }
    for (let r9 = 0x0; r9 < eL; r9++) {
      const ra = eK[r9];
      for (let rb in dQ) {
        ra[rb] === void 0x0 && (ra[rb] = dQ[rb]);
      }
      (eN[r9] = [ra]), (ra[us(0x41e)] = cS[ra[us(0x41e)]]), eR(ra);
      ra[us(0x8a2)] &&
        ra[us(0x8a2)][us(0xaba)]((rc) => {
          const uF = us;
          rc[0x1] = rc[0x1][uF(0xcd8)]()[uF(0x5a1)](0x0) - 0x41;
        });
      (ra["id"] = r9), (ra[us(0x8b9)] = r9);
      if (!ra[us(0x703)]) ra[us(0x703)] = ra[us(0xcda)];
      for (let rc = 0x1; rc <= db; rc++) {
        const rd = JSON[us(0xae6)](JSON[us(0x1e2)](ra));
        (rd[us(0xcda)] = ra[us(0xcda)] + "_" + rc),
          (rd[us(0x3b6)] = rc),
          (eN[r9][rc] = rd),
          dJ(ra, rd),
          eR(rd),
          (rd["id"] = eK[us(0x8c2)]),
          eK[us(0x733)](rd);
      }
    }
    for (let re = 0x0; re < eK[us(0x8c2)]; re++) {
      const rf = eK[re];
      rf[us(0x42f)] && eQ(rf, rf[us(0x42f)]),
        rf[us(0xcd3)] && eQ(rf, rf[us(0xcd3)]);
    }
    function eQ(rg, rh) {
      const uG = us;
      rh[uG(0xaba)]((ri) => {
        const uH = uG,
          rj = ri[0x0] + (rg[uH(0x3b6)] > 0x0 ? "_" + rg[uH(0x3b6)] : "");
        ri[0x0] = eM[rj];
      });
    }
    function eR(rg) {
      const uI = us;
      (rg[uI(0x3ab)] = dg(rg[uI(0x3b6)], rg[uI(0x424)]) * dL[rg[uI(0x3b6)]]),
        (rg[uI(0xcf9)] = dg(rg[uI(0x3b6)], rg[uI(0x921)])),
        rg[uI(0x4a7)]
          ? (rg[uI(0xc60)] = rg[uI(0x5ee)])
          : (rg[uI(0xc60)] = rg[uI(0x5ee)] * dM[rg[uI(0x3b6)]]),
        (rg[uI(0x8ba)] = dg(rg[uI(0x3b6)], rg[uI(0x171)])),
        (rg[uI(0x7b3)] = dg(rg[uI(0x3b6)], rg[uI(0x6f1)])),
        (rg[uI(0x470)] = dg(rg[uI(0x3b6)], rg[uI(0x29a)]) * dL[rg[uI(0x3b6)]]),
        (rg[uI(0x662)] = dg(rg[uI(0x3b6)], rg[uI(0xa1f)])),
        rg[uI(0x8cf)] && (rg[uI(0x559)] = dg(rg[uI(0x3b6)], rg[uI(0x8cf)])),
        (rg[uI(0x2f2)] = dg(rg[uI(0x3b6)], rg[uI(0x784)])),
        (eM[rg[uI(0xcda)]] = rg),
        eO[rg[uI(0x3b6)]][uI(0x733)](rg);
    }
    function eS(rg) {
      return (rg / 0xff) * Math["PI"] * 0x2;
    }
    var eT = Math["PI"] * 0x2;
    function eU(rg) {
      const uJ = us;
      return (
        (rg %= eT), rg < 0x0 && (rg += eT), Math[uJ(0x2ab)]((rg / eT) * 0xff)
      );
    }
    function eV(rg) {
      const uK = us;
      if (!rg || rg[uK(0x8c2)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        uK(0x73d)
      ](rg);
    }
    function eW(rg, rh) {
      return dF[rg + (rh > 0x0 ? "_" + rh : "")];
    }
    var eX = da[us(0x466)]((rg) => rg[us(0x49d)]() + us(0x88a)),
      eY = da[us(0x466)]((rg) => us(0x22c) + rg + us(0x6a9)),
      eZ = {};
    eX[us(0xaba)]((rg) => {
      eZ[rg] = 0x0;
    });
    var f0 = {};
    eY[us(0xaba)]((rg) => {
      f0[rg] = 0x0;
    });
    var f1 = 0x1 / 0x3e8 / 0x3c / 0x3c;
    function f2() {
      const uL = us;
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
        timeJoined: Date[uL(0x7c4)]() * f1,
      };
    }
    var f3 = us(0xa95)[us(0x64a)]("\x20");
    function f4(rg) {
      const rh = {};
      for (let ri in rg) {
        rh[rg[ri]] = ri;
      }
      return rh;
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
    for (let rg = 0x0; rg < f5[us(0x8c2)]; rg++) {
      const rh = f5[rg],
        ri = rh[rh[us(0x8c2)] - 0x1],
        rj = dO(ri);
      for (let rk = 0x0; rk < rj[us(0x8c2)]; rk++) {
        const rl = rj[rk];
        if (rl[0x0] < 0x1e) {
          let rm = rl[0x0];
          (rm *= 1.5),
            rm < 1.5 && (rm *= 0xa),
            (rm = parseFloat(rm[us(0x9da)](0x3))),
            (rl[0x0] = rm);
        }
        rl[0x1] = d9[us(0x547)];
      }
      rj[us(0x733)]([0.01, d9[us(0xd3)]]), rh[us(0x733)](rj);
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
    function f7(rn, ro) {
      var rp = Math["PI"] * 0x2,
        rq = (ro - rn) % rp;
      return ((0x2 * rq) % rp) - rq;
    }
    function f8(rn, ro, rp) {
      return rn + f7(rn, ro) * rp;
    }
    var f9 = {
      instagram: us(0x3c5),
      discord: us(0x7af),
      paw: us(0x5a3),
      gear: us(0x6f9),
      scroll: us(0x30f),
      bag: us(0x2d3),
      food: us(0xad6),
      graph: us(0x9ce),
      resize: us(0x126),
      users: us(0xa55),
      trophy: us(0x329),
      shop: us(0x38e),
      dice: us(0x3a6),
      data: us(0x131),
      poopPath: new Path2D(us(0xd1a)),
    };
    function fa(rn) {
      const uM = us;
      return rn[uM(0x9c7)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fb(rn) {
      const uN = us;
      if(hack.isEnabled('disableChatCheck')) return rn;
      return (
        (rn = fa(rn)),
        (rn = rn[uN(0x9c7)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uN(0x9c7)](/(.)\1{2,}/gi, "$1")
          [uN(0x9c7)](/\u200B|\u200C|\u200D/g, "")
          [uN(0x938)]()),
        !rn && (rn = uN(0x628)),
        rn
      );
    }
    var fc = 0x109;
    function fd(rn) {
      const uO = us,
        ro = rn[uO(0x64a)]("\x0a")[uO(0xaa5)](
          (rp) => rp[uO(0x938)]()[uO(0x8c2)] > 0x0
        );
      return { title: ro[uO(0x913)](), content: ro };
    }
    const fe = {};
    (fe[us(0x9fe)] = us(0x1cc)),
      (fe[us(0x47d)] = [
        us(0x516),
        us(0xb01),
        us(0x9b4),
        us(0x8bf),
        us(0x73c),
        us(0xb42),
        us(0xa58),
        us(0x9fa),
      ]);
    const ff = {};
    (ff[us(0x9fe)] = us(0xce7)), (ff[us(0x47d)] = [us(0x48b)]);
    const fg = {};
    (fg[us(0x9fe)] = us(0x6c3)),
      (fg[us(0x47d)] = [us(0xbff), us(0x4a3), us(0xc53), us(0x148)]);
    const fh = {};
    (fh[us(0x9fe)] = us(0x84a)),
      (fh[us(0x47d)] = [
        us(0x38d),
        us(0xb84),
        us(0x5c3),
        us(0x1e3),
        us(0xde8),
        us(0x917),
        us(0xa09),
        us(0x441),
        us(0xbbb),
      ]);
    const fi = {};
    (fi[us(0x9fe)] = us(0xba)),
      (fi[us(0x47d)] = [us(0xa5), us(0xc6b), us(0x593), us(0x8d5)]);
    const fj = {};
    (fj[us(0x9fe)] = us(0xd83)), (fj[us(0x47d)] = [us(0x147)]);
    const fk = {};
    (fk[us(0x9fe)] = us(0x6e0)), (fk[us(0x47d)] = [us(0x632), us(0x495)]);
    const fl = {};
    (fl[us(0x9fe)] = us(0x9bc)),
      (fl[us(0x47d)] = [
        us(0x5ff),
        us(0x2d5),
        us(0x94d),
        us(0x217),
        us(0x809),
        us(0x35f),
        us(0x82d),
        us(0x3e7),
      ]);
    const fm = {};
    (fm[us(0x9fe)] = us(0xbb)),
      (fm[us(0x47d)] = [
        us(0x7bc),
        us(0x613),
        us(0xcba),
        us(0xce8),
        us(0x5c4),
        us(0xa49),
        us(0xcb9),
        us(0x91b),
      ]);
    const fn = {};
    (fn[us(0x9fe)] = us(0xb12)), (fn[us(0x47d)] = [us(0x852)]);
    const fo = {};
    (fo[us(0x9fe)] = us(0x6a3)),
      (fo[us(0x47d)] = [
        us(0xab),
        us(0x848),
        us(0xce4),
        us(0xc52),
        us(0x542),
        us(0x94c),
        us(0x5f2),
      ]);
    const fp = {};
    (fp[us(0x9fe)] = us(0x805)), (fp[us(0x47d)] = [us(0xc66)]);
    const fq = {};
    (fq[us(0x9fe)] = us(0x3fd)),
      (fq[us(0x47d)] = [us(0xcfc), us(0x9fc), us(0xd2f), us(0xd68)]);
    const fr = {};
    (fr[us(0x9fe)] = us(0x640)), (fr[us(0x47d)] = [us(0x7fe), us(0x58d)]);
    const fs = {};
    (fs[us(0x9fe)] = us(0x6b4)),
      (fs[us(0x47d)] = [us(0xe7), us(0x714), us(0x7b2), us(0x7f3)]);
    const ft = {};
    (ft[us(0x9fe)] = us(0xc0)),
      (ft[us(0x47d)] = [us(0x105), us(0x2a7), us(0x318), us(0x487)]);
    const fu = {};
    (fu[us(0x9fe)] = us(0x633)),
      (fu[us(0x47d)] = [
        us(0xccb),
        us(0x498),
        us(0x4e8),
        us(0x506),
        us(0x850),
        us(0xcd5),
      ]);
    const fv = {};
    (fv[us(0x9fe)] = us(0xdc8)), (fv[us(0x47d)] = [us(0x7cc)]);
    const fw = {};
    (fw[us(0x9fe)] = us(0xaf5)), (fw[us(0x47d)] = [us(0x28c), us(0xba5)]);
    const fx = {};
    (fx[us(0x9fe)] = us(0x2c5)),
      (fx[us(0x47d)] = [us(0x859), us(0x211), us(0x538)]);
    const fy = {};
    (fy[us(0x9fe)] = us(0x6a0)),
      (fy[us(0x47d)] = [us(0x49b), us(0x72a), us(0x6a4), us(0x7fd), us(0x5e8)]);
    const fz = {};
    (fz[us(0x9fe)] = us(0x1ee)), (fz[us(0x47d)] = [us(0xc7c), us(0x90d)]);
    const fA = {};
    (fA[us(0x9fe)] = us(0x1f2)),
      (fA[us(0x47d)] = [us(0x23c), us(0xb37), us(0xbed)]);
    const fB = {};
    (fB[us(0x9fe)] = us(0x23a)), (fB[us(0x47d)] = [us(0x710)]);
    const fC = {};
    (fC[us(0x9fe)] = us(0x4f5)), (fC[us(0x47d)] = [us(0x6c1)]);
    const fD = {};
    (fD[us(0x9fe)] = us(0x888)), (fD[us(0x47d)] = [us(0x12a)]);
    const fE = {};
    (fE[us(0x9fe)] = us(0xbbf)),
      (fE[us(0x47d)] = [us(0x567), us(0x3a4), us(0x4ed)]);
    const fF = {};
    (fF[us(0x9fe)] = us(0x22d)),
      (fF[us(0x47d)] = [
        us(0x4a9),
        us(0x332),
        us(0xc04),
        us(0x590),
        us(0xca5),
        us(0xcd0),
        us(0x397),
        us(0xa9b),
        us(0x10a),
        us(0x983),
        us(0x9c6),
        us(0x790),
        us(0xaec),
        us(0x62b),
      ]);
    const fG = {};
    (fG[us(0x9fe)] = us(0x261)),
      (fG[us(0x47d)] = [
        us(0xcd2),
        us(0x539),
        us(0x5f7),
        us(0xd17),
        us(0xd48),
        us(0xd20),
        us(0x910),
        us(0x2a9),
      ]);
    const fH = {};
    (fH[us(0x9fe)] = us(0xb98)),
      (fH[us(0x47d)] = [
        us(0x604),
        us(0x21a),
        us(0x349),
        us(0x27d),
        us(0xac3),
        us(0x9a4),
        us(0xac8),
        us(0x4bc),
        us(0x206),
        us(0x5af),
        us(0x99e),
        us(0x45d),
        us(0x313),
        us(0xb30),
      ]);
    const fI = {};
    (fI[us(0x9fe)] = us(0x83d)),
      (fI[us(0x47d)] = [
        us(0xce6),
        us(0x137),
        us(0x2f1),
        us(0xdda),
        us(0x471),
        us(0xb86),
        us(0x279),
      ]);
    const fJ = {};
    (fJ[us(0x9fe)] = us(0x118)),
      (fJ[us(0x47d)] = [
        us(0x8d7),
        us(0xc5b),
        us(0xc3d),
        us(0x8c1),
        us(0x51f),
        us(0x268),
        us(0xc36),
        us(0x2df),
        us(0x5e9),
        us(0x980),
        us(0x32e),
        us(0x6fe),
        us(0x6e9),
        us(0x25d),
      ]);
    const fK = {};
    (fK[us(0x9fe)] = us(0x231)),
      (fK[us(0x47d)] = [
        us(0x2fe),
        us(0xc4e),
        us(0x93a),
        us(0xcb7),
        us(0x326),
        us(0x71a),
        us(0x510),
        us(0xd07),
        us(0x3b5),
        us(0x817),
        us(0x60a),
        us(0xc3e),
        us(0x5d9),
        us(0x61c),
        us(0x6f7),
      ]);
    const fL = {};
    (fL[us(0x9fe)] = us(0x4c4)),
      (fL[us(0x47d)] = [
        us(0xdbb),
        us(0x245),
        us(0x987),
        us(0x361),
        us(0x310),
        us(0x293),
        us(0xd30),
        us(0xa7),
        us(0xaaa),
        us(0x7f9),
        us(0xc32),
        us(0x5cb),
        us(0x979),
      ]);
    const fM = {};
    (fM[us(0x9fe)] = us(0xd96)),
      (fM[us(0x47d)] = [
        us(0xd8a),
        us(0x9e3),
        us(0x6a8),
        us(0x283),
        us(0xa6e),
        us(0x6b1),
      ]);
    const fN = {};
    (fN[us(0x9fe)] = us(0x5b1)),
      (fN[us(0x47d)] = [
        us(0xc9d),
        us(0x22a),
        us(0xaae),
        us(0xa2e),
        us(0xcbf),
        us(0xd4c),
        us(0xd2d),
        us(0x5bb),
        us(0xa67),
      ]);
    const fO = {};
    (fO[us(0x9fe)] = us(0x5b1)),
      (fO[us(0x47d)] = [
        us(0x462),
        us(0x6cb),
        us(0x608),
        us(0x145),
        us(0xa11),
        us(0x7d6),
        us(0xb80),
        us(0x3f3),
        us(0x78a),
        us(0x450),
        us(0x4df),
        us(0x71b),
        us(0x9c8),
        us(0x3d2),
        us(0x3eb),
        us(0xa77),
        us(0x4fd),
      ]);
    const fP = {};
    (fP[us(0x9fe)] = us(0x43c)), (fP[us(0x47d)] = [us(0xdcc), us(0xb52)]);
    const fQ = {};
    (fQ[us(0x9fe)] = us(0xcb1)),
      (fQ[us(0x47d)] = [us(0x5ae), us(0xa2), us(0x405)]);
    const fR = {};
    (fR[us(0x9fe)] = us(0x32a)),
      (fR[us(0x47d)] = [us(0x16d), us(0xf6), us(0x768), us(0x7f7)]);
    const fS = {};
    (fS[us(0x9fe)] = us(0x7fc)),
      (fS[us(0x47d)] = [
        us(0x814),
        us(0x322),
        us(0xad3),
        us(0x123),
        us(0xdc3),
        us(0xb0),
      ]);
    const fT = {};
    (fT[us(0x9fe)] = us(0x947)), (fT[us(0x47d)] = [us(0x249)]);
    const fU = {};
    (fU[us(0x9fe)] = us(0xa19)),
      (fU[us(0x47d)] = [
        us(0x151),
        us(0x8e0),
        us(0x1df),
        us(0x7d3),
        us(0x8ea),
        us(0x952),
        us(0x3b7),
        us(0xb3e),
      ]);
    const fV = {};
    (fV[us(0x9fe)] = us(0x77f)), (fV[us(0x47d)] = [us(0x981), us(0xa18)]);
    const fW = {};
    (fW[us(0x9fe)] = us(0x47b)),
      (fW[us(0x47d)] = [us(0x4e7), us(0xa3e), us(0xbf7), us(0xd8d), us(0xade)]);
    const fX = {};
    (fX[us(0x9fe)] = us(0x9e)),
      (fX[us(0x47d)] = [
        us(0xa68),
        us(0xb1a),
        us(0x7f1),
        us(0x765),
        us(0x33f),
        us(0x3d4),
        us(0x26b),
        us(0x6d0),
        us(0x257),
      ]);
    const fY = {};
    (fY[us(0x9fe)] = us(0x96e)),
      (fY[us(0x47d)] = [
        us(0xbc8),
        us(0x8c0),
        us(0x4a6),
        us(0x56c),
        us(0xab3),
        us(0xb29),
        us(0x503),
        us(0x3ea),
      ]);
    const fZ = {};
    (fZ[us(0x9fe)] = us(0xcad)),
      (fZ[us(0x47d)] = [
        us(0xb71),
        us(0x731),
        us(0xcc0),
        us(0x55d),
        us(0x705),
        us(0x228),
        us(0x2c4),
        us(0x43f),
        us(0x76d),
      ]);
    const g0 = {};
    (g0[us(0x9fe)] = us(0xd40)),
      (g0[us(0x47d)] = [
        us(0x191),
        us(0x5db),
        us(0x687),
        us(0x228),
        us(0x699),
        us(0x873),
        us(0x9c0),
        us(0x6bd),
        us(0xaaf),
        us(0xd3a),
        us(0x1ec),
      ]);
    const g1 = {};
    (g1[us(0x9fe)] = us(0xd40)),
      (g1[us(0x47d)] = [us(0x479), us(0x1b9), us(0x6c9), us(0x494), us(0x29e)]);
    const g2 = {};
    (g2[us(0x9fe)] = us(0x156)), (g2[us(0x47d)] = [us(0x9c5), us(0x72e)]);
    const g3 = {};
    (g3[us(0x9fe)] = us(0x4e9)), (g3[us(0x47d)] = [us(0xd57)]);
    const g4 = {};
    (g4[us(0x9fe)] = us(0x6d1)),
      (g4[us(0x47d)] = [us(0x1c1), us(0x9e6), us(0xa4), us(0x52e)]);
    const g5 = {};
    (g5[us(0x9fe)] = us(0x74d)),
      (g5[us(0x47d)] = [us(0x2fb), us(0x1f8), us(0x4b9), us(0x641)]);
    const g6 = {};
    (g6[us(0x9fe)] = us(0x74d)),
      (g6[us(0x47d)] = [
        us(0x91f),
        us(0x510),
        us(0xbd4),
        us(0x270),
        us(0x65f),
        us(0x15e),
        us(0x816),
        us(0xbc1),
        us(0x50f),
        us(0x75a),
        us(0xd7d),
        us(0xee),
        us(0x724),
        us(0x28f),
        us(0x3b9),
        us(0x810),
        us(0x647),
        us(0xa9d),
        us(0xd0c),
        us(0x216),
      ]);
    const g7 = {};
    (g7[us(0x9fe)] = us(0xb75)),
      (g7[us(0x47d)] = [us(0x3b8), us(0xa65), us(0x9d0), us(0x81c)]);
    const g8 = {};
    (g8[us(0x9fe)] = us(0x3d7)),
      (g8[us(0x47d)] = [us(0xb60), us(0x54f), us(0x629)]);
    const g9 = {};
    (g9[us(0x9fe)] = us(0x5ca)),
      (g9[us(0x47d)] = [
        us(0x6fa),
        us(0x79d),
        us(0x876),
        us(0xb3),
        us(0x56e),
        us(0x227),
        us(0x20b),
        us(0xd51),
        us(0x502),
        us(0x854),
        us(0xe0),
        us(0x1c2),
        us(0x272),
        us(0x8de),
        us(0x587),
      ]);
    const ga = {};
    (ga[us(0x9fe)] = us(0x18d)), (ga[us(0x47d)] = [us(0xd04), us(0x13c)]);
    const gb = {};
    (gb[us(0x9fe)] = us(0x9a6)),
      (gb[us(0x47d)] = [us(0x12c), us(0x9d7), us(0x883)]);
    const gc = {};
    (gc[us(0x9fe)] = us(0xc03)),
      (gc[us(0x47d)] = [us(0x5c8), us(0x648), us(0x71c)]);
    const gd = {};
    (gd[us(0x9fe)] = us(0x209)),
      (gd[us(0x47d)] = [us(0x5b7), us(0x99a), us(0xbee), us(0x333)]);
    const ge = {};
    (ge[us(0x9fe)] = us(0x4ad)),
      (ge[us(0x47d)] = [us(0x419), us(0x7a5), us(0x99c)]);
    const gf = {};
    (gf[us(0x9fe)] = us(0xd63)),
      (gf[us(0x47d)] = [
        us(0x510),
        us(0x8d8),
        us(0xd18),
        us(0x67c),
        us(0x255),
        us(0xb59),
        us(0x10b),
        us(0xbd1),
        us(0xa25),
        us(0xdc0),
        us(0xc21),
        us(0xce),
        us(0xd71),
        us(0x52b),
        us(0xcb3),
        us(0x63b),
        us(0x230),
        us(0x7ae),
        us(0xdb5),
        us(0x40b),
        us(0x167),
        us(0x637),
        us(0x901),
        us(0x3d9),
      ]);
    const gg = {};
    (gg[us(0x9fe)] = us(0xc7e)),
      (gg[us(0x47d)] = [us(0x34f), us(0x2bf), us(0x597), us(0x460)]);
    const gh = {};
    (gh[us(0x9fe)] = us(0x4a0)),
      (gh[us(0x47d)] = [
        us(0x435),
        us(0xb19),
        us(0x387),
        us(0x510),
        us(0xc68),
        us(0x97f),
        us(0x6a5),
        us(0x565),
      ]);
    const gi = {};
    (gi[us(0x9fe)] = us(0x822)),
      (gi[us(0x47d)] = [
        us(0xb2),
        us(0xc81),
        us(0xb3),
        us(0x722),
        us(0x300),
        us(0x2b6),
        us(0xa9),
        us(0xbfa),
        us(0x102),
        us(0x1cf),
        us(0x7ff),
        us(0xb44),
        us(0x667),
        us(0x24e),
        us(0xc76),
        us(0x841),
        us(0x544),
      ]);
    const gj = {};
    (gj[us(0x9fe)] = us(0xd5b)),
      (gj[us(0x47d)] = [
        us(0x7a0),
        us(0xc01),
        us(0x60c),
        us(0x8ee),
        us(0xbb0),
        us(0x4b0),
        us(0xa3b),
        us(0x6f0),
        us(0xa66),
        us(0xc4b),
        us(0x838),
      ]);
    const gk = {};
    (gk[us(0x9fe)] = us(0x46d)),
      (gk[us(0x47d)] = [
        us(0x775),
        us(0xa1c),
        us(0x76b),
        us(0x652),
        us(0x4d9),
        us(0xd41),
        us(0xa76),
        us(0xb6d),
        us(0xc33),
        us(0x1d6),
      ]);
    const gl = {};
    (gl[us(0x9fe)] = us(0x46d)),
      (gl[us(0x47d)] = [
        us(0x1d4),
        us(0xb20),
        us(0xb9b),
        us(0x3bd),
        us(0x60d),
        us(0xe6),
        us(0x716),
        us(0xbdb),
        us(0x85f),
        us(0x84e),
      ]);
    const gm = {};
    (gm[us(0x9fe)] = us(0x9ba)),
      (gm[us(0x47d)] = [
        us(0x65d),
        us(0x9ef),
        us(0x2c1),
        us(0x90e),
        us(0x2f3),
        us(0x6ec),
        us(0x351),
        us(0xc7a),
        us(0xb88),
        us(0x2ff),
      ]);
    const gn = {};
    (gn[us(0x9fe)] = us(0x9ba)),
      (gn[us(0x47d)] = [
        us(0x479),
        us(0x8ca),
        us(0xc2c),
        us(0x631),
        us(0xcec),
        us(0x7a1),
        us(0xb45),
        us(0x2b5),
        us(0xdd3),
        us(0xd03),
        us(0xc43),
      ]);
    const go = {};
    (go[us(0x9fe)] = us(0x3df)),
      (go[us(0x47d)] = [us(0xa12), us(0x2e3), us(0x858)]);
    const gp = {};
    (gp[us(0x9fe)] = us(0x3df)),
      (gp[us(0x47d)] = [
        us(0x7c8),
        us(0xd64),
        us(0x2f5),
        us(0x8f8),
        us(0x7e3),
        us(0x984),
        us(0x42c),
        us(0x8c7),
      ]);
    const gq = {};
    (gq[us(0x9fe)] = us(0x1ba)),
      (gq[us(0x47d)] = [us(0x2f0), us(0x404), us(0xbb1)]);
    const gr = {};
    (gr[us(0x9fe)] = us(0x1ba)),
      (gr[us(0x47d)] = [
        us(0x72b),
        us(0xa67),
        us(0x2ef),
        us(0x25a),
        us(0xc1e),
        us(0x678),
      ]);
    const gs = {};
    (gs[us(0x9fe)] = us(0x1ba)),
      (gs[us(0x47d)] = [us(0x3ce), us(0x82a), us(0x19a), us(0xbf5)]);
    const gt = {};
    (gt[us(0x9fe)] = us(0x1ba)),
      (gt[us(0x47d)] = [
        us(0x363),
        us(0xaa3),
        us(0x956),
        us(0xdd6),
        us(0x8a8),
        us(0x5d3),
        us(0xde),
        us(0x85c),
        us(0xd50),
        us(0x8d9),
        us(0x922),
      ]);
    const gu = {};
    (gu[us(0x9fe)] = us(0xc6a)),
      (gu[us(0x47d)] = [us(0x8b7), us(0x68e), us(0x321)]);
    const gv = {};
    (gv[us(0x9fe)] = us(0xc89)),
      (gv[us(0x47d)] = [
        us(0x345),
        us(0x75b),
        us(0xa67),
        us(0x689),
        us(0xa08),
        us(0x6b0),
        us(0x33d),
        us(0xb74),
        us(0x108),
        us(0x7df),
        us(0xcd7),
        us(0x4b8),
        us(0xb3),
        us(0xc73),
        us(0x26d),
        us(0x51e),
        us(0x189),
        us(0x89f),
        us(0xd4d),
        us(0x7db),
        us(0x427),
        us(0x925),
        us(0x226),
        us(0x180),
        us(0xab0),
        us(0xcc),
        us(0xd02),
        us(0x4bd),
        us(0x122),
        us(0x91d),
        us(0x8db),
        us(0x8f4),
        us(0x8e9),
        us(0x220),
      ]);
    const gw = {};
    (gw[us(0x9fe)] = us(0x81f)), (gw[us(0x47d)] = [us(0x489)]);
    const gx = {};
    (gx[us(0x9fe)] = us(0x4b2)),
      (gx[us(0x47d)] = [
        us(0x454),
        us(0x178),
        us(0x2d1),
        us(0x396),
        us(0x8c3),
        us(0x468),
        us(0xca),
        us(0xb3),
        us(0x16a),
        us(0x533),
        us(0xfa),
        us(0x74c),
        us(0xb4b),
        us(0xa21),
        us(0x514),
        us(0x2be),
        us(0x887),
        us(0xac0),
        us(0x5fd),
        us(0x644),
        us(0x134),
        us(0x11c),
        us(0xc74),
        us(0x926),
        us(0xa3),
        us(0x201),
        us(0x855),
        us(0xc1a),
        us(0xa07),
        us(0xd3f),
        us(0x8f4),
        us(0x880),
        us(0xc28),
        us(0x5d4),
        us(0x1ab),
      ]);
    const gy = {};
    (gy[us(0x9fe)] = us(0x4c2)),
      (gy[us(0x47d)] = [
        us(0x7fb),
        us(0x77a),
        us(0xc1d),
        us(0xb3f),
        us(0xc5),
        us(0x630),
        us(0xb3),
        us(0xdb),
        us(0x727),
        us(0x968),
        us(0x5bf),
        us(0xa8e),
        us(0x101),
        us(0xc61),
        us(0x207),
        us(0x185),
        us(0x6c7),
        us(0x428),
        us(0x64f),
        us(0xa0c),
        us(0x7a9),
        us(0x887),
        us(0x9bf),
        us(0x4cb),
        us(0x336),
        us(0x754),
        us(0x77d),
        us(0x86b),
        us(0xced),
        us(0x40a),
        us(0xcc1),
        us(0x1b2),
        us(0x778),
        us(0x53f),
        us(0x8f4),
        us(0x383),
        us(0xb65),
        us(0x540),
        us(0x5a8),
      ]);
    const gz = {};
    (gz[us(0x9fe)] = us(0x8a0)),
      (gz[us(0x47d)] = [
        us(0x866),
        us(0x298),
        us(0x8f4),
        us(0x5a5),
        us(0x621),
        us(0x8dc),
        us(0x99f),
        us(0xd82),
        us(0xa14),
        us(0xb3),
        us(0x420),
        us(0x66d),
        us(0x23e),
        us(0x9d4),
      ]);
    const gA = {};
    (gA[us(0x9fe)] = us(0x3f5)),
      (gA[us(0x47d)] = [us(0x7a6), us(0x836), us(0xd95), us(0x933), us(0x605)]);
    const gB = {};
    (gB[us(0x9fe)] = us(0x83e)),
      (gB[us(0x47d)] = [us(0x2ca), us(0x9e5), us(0x7da), us(0x73e)]);
    const gC = {};
    (gC[us(0x9fe)] = us(0x83e)),
      (gC[us(0x47d)] = [us(0xa67), us(0x902), us(0x1e4)]);
    const gD = {};
    (gD[us(0x9fe)] = us(0x627)),
      (gD[us(0x47d)] = [us(0x442), us(0x725), us(0xa50), us(0x24d), us(0x121)]);
    const gE = {};
    (gE[us(0x9fe)] = us(0x627)),
      (gE[us(0x47d)] = [us(0xd93), us(0x771), us(0x48d), us(0x701)]);
    const gF = {};
    (gF[us(0x9fe)] = us(0x627)), (gF[us(0x47d)] = [us(0x1eb), us(0x95d)]);
    const gG = {};
    (gG[us(0x9fe)] = us(0x8e6)),
      (gG[us(0x47d)] = [
        us(0x899),
        us(0x950),
        us(0x6c2),
        us(0xd75),
        us(0xfc),
        us(0x45e),
        us(0x49f),
        us(0x9aa),
        us(0xbcc),
      ]);
    const gH = {};
    (gH[us(0x9fe)] = us(0xe3)),
      (gH[us(0x47d)] = [
        us(0xdaa),
        us(0xaf8),
        us(0x4fa),
        us(0xdd9),
        us(0xc9),
        us(0x166),
        us(0xb48),
      ]);
    const gI = {};
    (gI[us(0x9fe)] = us(0x5cc)),
      (gI[us(0x47d)] = [
        us(0x1f5),
        us(0xc6e),
        us(0x789),
        us(0xf4),
        us(0x1ae),
        us(0x8e7),
        us(0x6b2),
        us(0x5c5),
        us(0x612),
        us(0x1cd),
        us(0x5e5),
        us(0x154),
      ]);
    const gJ = {};
    (gJ[us(0x9fe)] = us(0x9e0)),
      (gJ[us(0x47d)] = [
        us(0x229),
        us(0x669),
        us(0x177),
        us(0xcb6),
        us(0x5b5),
        us(0x481),
        us(0x78e),
        us(0xfe),
        us(0x788),
        us(0x860),
      ]);
    const gK = {};
    (gK[us(0x9fe)] = us(0x9e0)),
      (gK[us(0x47d)] = [
        us(0x5d7),
        us(0xb77),
        us(0x98f),
        us(0x437),
        us(0xa3a),
        us(0x3f7),
      ]);
    const gL = {};
    (gL[us(0x9fe)] = us(0x8e1)),
      (gL[us(0x47d)] = [us(0xc0f), us(0xa8), us(0x650)]);
    const gM = {};
    (gM[us(0x9fe)] = us(0x8e1)),
      (gM[us(0x47d)] = [us(0xa67), us(0x535), us(0x124), us(0x639), us(0x5ea)]);
    const gN = {};
    (gN[us(0x9fe)] = us(0xd85)),
      (gN[us(0x47d)] = [
        us(0xdd1),
        us(0x382),
        us(0xda4),
        us(0xd05),
        us(0x8f5),
        us(0x6e3),
        us(0x8f4),
        us(0xb47),
        us(0xbe7),
        us(0x4ac),
        us(0x4c8),
        us(0x210),
        us(0xb3),
        us(0x90b),
        us(0xdc7),
        us(0x9d9),
        us(0x1de),
        us(0x8ab),
        us(0xcdf),
      ]);
    const gO = {};
    (gO[us(0x9fe)] = us(0x2ec)),
      (gO[us(0x47d)] = [
        us(0x6ce),
        us(0x1b5),
        us(0x11e),
        us(0x702),
        us(0x818),
        us(0xa7e),
        us(0x6ee),
        us(0x402),
      ]);
    const gP = {};
    (gP[us(0x9fe)] = us(0x2ec)), (gP[us(0x47d)] = [us(0x600), us(0x4b5)]);
    const gQ = {};
    (gQ[us(0x9fe)] = us(0x7bb)), (gQ[us(0x47d)] = [us(0x6b7), us(0xaf2)]);
    const gR = {};
    (gR[us(0x9fe)] = us(0x7bb)),
      (gR[us(0x47d)] = [
        us(0x7a2),
        us(0xc86),
        us(0xdd8),
        us(0x856),
        us(0x3e3),
        us(0x7e9),
        us(0xb8),
        us(0xd90),
        us(0x6df),
      ]);
    const gS = {};
    (gS[us(0x9fe)] = us(0x1f7)), (gS[us(0x47d)] = [us(0x86c), us(0x928)]);
    const gT = {};
    (gT[us(0x9fe)] = us(0x1f7)),
      (gT[us(0x47d)] = [
        us(0xcfa),
        us(0xa9c),
        us(0x656),
        us(0xcdc),
        us(0x898),
        us(0x13f),
        us(0xc07),
        us(0xa67),
        us(0xab4),
      ]);
    const gU = {};
    (gU[us(0x9fe)] = us(0x49c)), (gU[us(0x47d)] = [us(0x4f7)]);
    const gV = {};
    (gV[us(0x9fe)] = us(0x49c)),
      (gV[us(0x47d)] = [
        us(0x548),
        us(0x125),
        us(0x21b),
        us(0x152),
        us(0xa67),
        us(0x564),
        us(0xcde),
      ]);
    const gW = {};
    (gW[us(0x9fe)] = us(0x49c)),
      (gW[us(0x47d)] = [us(0x537), us(0x9bb), us(0x6af)]);
    const gX = {};
    (gX[us(0x9fe)] = us(0x4d6)),
      (gX[us(0x47d)] = [us(0xab4), us(0x64c), us(0xc84), us(0xb97)]);
    const gY = {};
    (gY[us(0x9fe)] = us(0x4d6)), (gY[us(0x47d)] = [us(0xba1)]);
    const gZ = {};
    (gZ[us(0x9fe)] = us(0x4d6)),
      (gZ[us(0x47d)] = [us(0x1f6), us(0xaf0), us(0x8f9), us(0x6aa), us(0x607)]);
    const h0 = {};
    (h0[us(0x9fe)] = us(0x84f)),
      (h0[us(0x47d)] = [us(0x17a), us(0x35a), us(0x6db)]);
    const h1 = {};
    (h1[us(0x9fe)] = us(0xb8e)), (h1[us(0x47d)] = [us(0xa92), us(0x394)]);
    const h2 = {};
    (h2[us(0x9fe)] = us(0x3a3)), (h2[us(0x47d)] = [us(0x69b), us(0xbd2)]);
    const h3 = {};
    (h3[us(0x9fe)] = us(0xd01)), (h3[us(0x47d)] = [us(0xcf5)]);
    var h4 = [
      fd(us(0x215)),
      fd(us(0x2bb)),
      fd(us(0x262)),
      fd(us(0x1fc)),
      fd(us(0x28e)),
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
    console[us(0xd6f)](us(0x50e));
    var h5 = Date[us(0x7c4)]() < 0x18e9c4b6482,
      h6 = Math[us(0x815)](Math[us(0xb7c)]() * 0xa);
    function h7(rn) {
      const uP = us,
        ro = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let rp = "";
      for (const rq of rn) {
        rq === "\x20"
          ? (rp += "\x20")
          : (rp += ro[(h6 + rq[uP(0x5a1)](0x0)) % ro[uP(0x8c2)]]);
      }
      return rp;
    }
    h5 &&
      document[us(0xa02)](us(0xaf4))[us(0x7ea)](
        us(0x130),
        h7(us(0x422)) + us(0x6ed)
      );
    function h8(rn, ro, rp) {
      const uQ = us,
        rq = ro - rn;
      if (Math[uQ(0x7a8)](rq) < 0.01) return ro;
      return rn + rq * (0x1 - Math[uQ(0x904)](-rp * pO));
    }
    var h9 = [],
      ha = 0x0;
    function hb(rn, ro = 0x1388) {
      const uR = us,
        rp = nN(uR(0xb2e) + jw(rn) + uR(0x664));
      kH[uR(0x75c)](rp);
      let rq = 0x0;
      rr();
      function rr() {
        const uS = uR;
        (rp[uS(0xb14)][uS(0x8cb)] = uS(0xae) + ha + uS(0xbb5)),
          (rp[uS(0xb14)][uS(0x896)] = rq);
      }
      (this[uR(0xd11)] = ![]),
        (this[uR(0xc2f)] = () => {
          const uT = uR;
          ro -= pN;
          const rs = ro > 0x0 ? 0x1 : 0x0;
          (rq = h8(rq, rs, 0.3)),
            rr(),
            ro < 0x0 &&
              rq <= 0x0 &&
              (rp[uT(0xbc7)](), (this[uT(0xd11)] = !![])),
            (ha += rq * (rp[uT(0x79f)] + 0x5));
        }),
        h9[uR(0x733)](this);
    }
    function hc(rn) {
      new hb(rn, 0x1388);
    }
    function hd() {
      const uU = us;
      ha = 0x0;
      for (let rn = h9[uU(0x8c2)] - 0x1; rn >= 0x0; rn--) {
        const ro = h9[rn];
        ro[uU(0xc2f)](), ro[uU(0xd11)] && h9[uU(0x34a)](rn, 0x1);
      }
    }
    var he = !![],
      hf = document[us(0xa02)](us(0xd7c));
    fetch(us(0xa9e))
      [us(0x715)]((rn) => {
        const uV = us;
        (hf[uV(0xb14)][uV(0x5ad)] = uV(0xaa8)), (he = ![]);
      })
      [us(0x79c)]((rn) => {
        const uW = us;
        hf[uW(0xb14)][uW(0x5ad)] = "";
      });
    var hg = document[us(0xa02)](us(0xdc9)),
      hh = Date[us(0x7c4)]();
    function hi() {
      const uX = us;
      console[uX(0xd6f)](uX(0x625)),
        (hh = Date[uX(0x7c4)]()),
        (hg[uX(0xb14)][uX(0x5ad)] = "");
      try {
        aiptag[uX(0x81b)][uX(0x5ad)][uX(0x733)](function () {
          const uY = uX;
          aipDisplayTag[uY(0x5ad)](uY(0x1d2));
        }),
          aiptag[uX(0x81b)][uX(0x5ad)][uX(0x733)](function () {
            const uZ = uX;
            aipDisplayTag[uZ(0x5ad)](uZ(0x72f));
          });
      } catch (rn) {
        console[uX(0xd6f)](uX(0xd39));
      }
    }
    setInterval(function () {
      const v0 = us;
      hg[v0(0xb14)][v0(0x5ad)] === "" &&
        Date[v0(0x7c4)]() - hh > 0x7530 &&
        hi();
    }, 0x2710);
    var hj = null,
      hk = 0x0;
    function hl() {
      const v1 = us;
      console[v1(0xd6f)](v1(0x6ab)),
        typeof aiptag[v1(0xbd5)] !== v1(0x3a0)
          ? ((hj = 0x45),
            (hk = Date[v1(0x7c4)]()),
            aiptag[v1(0x81b)][v1(0x5b6)][v1(0x733)](function () {
              const v2 = v1;
              aiptag[v2(0xbd5)][v2(0x75e)]();
            }))
          : window[v1(0x2e0)](v1(0x3e4));
    }
    window[us(0x2e0)] = function (rn) {
      const v3 = us;
      console[v3(0xd6f)](v3(0x193) + rn);
      if (rn === v3(0x795) || rn[v3(0xaa0)](v3(0x222)) > -0x1) {
        if (hj !== null && Date[v3(0x7c4)]() - hk > 0xbb8) {
          console[v3(0xd6f)](v3(0x6bb));
          if (hW) {
            const ro = {};
            (ro[v3(0x9fe)] = v3(0x274)),
              (ro[v3(0x5a2)] = ![]),
              kI(
                v3(0xc4d),
                (rp) => {
                  const v4 = v3;
                  rp &&
                    hW &&
                    (il(new Uint8Array([cI[v4(0x68c)]])), hK(v4(0x3cb)));
                },
                ro
              );
          }
        } else hK(v3(0x829));
      } else alert(v3(0xb1b) + rn);
      hm[v3(0x5a4)][v3(0xbc7)](v3(0xe1)), (hj = null);
    };
    var hm = document[us(0xa02)](us(0x9cf));
    (hm[us(0x269)] = function () {
      const v5 = us;
      hm[v5(0x5a4)][v5(0x2b0)](v5(0xe1)), hl();
    }),
      (hm[us(0xab7)] = function () {
        const v6 = us;
        return nN(
          v6(0xafa) + hP[v6(0x547)] + v6(0xdd5) + hP[v6(0x522)] + v6(0x43d)
        );
      }),
      (hm[us(0x5aa)] = !![]);
    var hn = [
        us(0xae7),
        us(0xad9),
        us(0x969),
        us(0xcac),
        us(0xa89),
        us(0x691),
        us(0x1af),
        us(0xc5c),
        us(0x87f),
        us(0x43a),
        us(0x50d),
        us(0xa31),
      ],
      ho = document[us(0xa02)](us(0xd54)),
      hp =
        Date[us(0x7c4)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[us(0x815)](Math[us(0xb7c)]() * hn[us(0x8c2)]);
    hr();
    function hq(rn) {
      const v7 = us;
      (hp += rn),
        hp < 0x0 ? (hp = hn[v7(0x8c2)] - 0x1) : (hp %= hn[v7(0x8c2)]),
        hr();
    }
    function hr() {
      const v8 = us,
        rn = hn[hp];
      (ho[v8(0xb14)][v8(0xac5)] =
        v8(0xba9) + rn[v8(0x64a)](v8(0xf0))[0x1] + v8(0x916)),
        (ho[v8(0x269)] = function () {
          const v9 = v8;
          window[v9(0x57c)](rn, v9(0xdb7)), hq(0x1);
        });
    }
    (document[us(0xa02)](us(0xbe))[us(0x269)] = function () {
      hq(-0x1);
    }),
      (document[us(0xa02)](us(0x892))[us(0x269)] = function () {
        hq(0x1);
      });
    var hs = document[us(0xa02)](us(0xc2a));
    hs[us(0xab7)] = function () {
      const va = us;
      return nN(
        va(0xafa) + hP[va(0x547)] + va(0x966) + hP[va(0xb33)] + va(0x9b9)
      );
    };
    var ht = document[us(0xa02)](us(0x192)),
      hu = document[us(0xa02)](us(0xd27)),
      hv = ![];
    function hw() {
      const vb = us;
      let rn = "";
      for (let rp = 0x0; rp < h4[vb(0x8c2)]; rp++) {
        const { title: rq, content: rr } = h4[rp];
        (rn += vb(0x299) + rq + vb(0xddc)),
          rr[vb(0xaba)]((rs, rt) => {
            const vc = vb;
            let ru = "-\x20";
            if (rs[0x0] === "*") {
              const rv = rs[rt + 0x1];
              if (rv && rv[0x0] === "*") ru = vc(0x423);
              else ru = vc(0x46c);
              rs = rs[vc(0xba3)](0x1);
            }
            (rs = ru + rs), (rn += vc(0x5df) + rs + vc(0x10c));
          }),
          (rn += vb(0x354));
      }
      const ro = hD[vb(0x660)];
      (hv = ro !== void 0x0 && parseInt(ro) < fc), (ht[vb(0xcc2)] = rn);
    }
    CanvasRenderingContext2D[us(0xb7e)][us(0x2cb)] = function (rn) {
      const vd = us;
      this[vd(0x9b0)](rn, rn);
    };
    var hx = ![];
    hx &&
      (OffscreenCanvasRenderingContext2D[us(0xb7e)][us(0x2cb)] = function (rn) {
        const ve = us;
        this[ve(0x9b0)](rn, rn);
      });
    function hy(rn, ro, rp) {
      const rq = 0x1 - rp;
      return [
        rn[0x0] * rp + ro[0x0] * rq,
        rn[0x1] * rp + ro[0x1] * rq,
        rn[0x2] * rp + ro[0x2] * rq,
      ];
    }
    var hz = {};
    function hA(rn) {
      const vf = us;
      return (
        !hz[rn] &&
          (hz[rn] = [
            parseInt(rn[vf(0xba3)](0x1, 0x3), 0x10),
            parseInt(rn[vf(0xba3)](0x3, 0x5), 0x10),
            parseInt(rn[vf(0xba3)](0x5, 0x7), 0x10),
          ]),
        hz[rn]
      );
    }
    var hB = document[us(0x6be)](us(0x7e0)),
      hC = document[us(0xbb9)](us(0x4eb));
    for (let rn = 0x0; rn < hC[us(0x8c2)]; rn++) {
      const ro = hC[rn],
        rp = f9[ro[us(0xa60)](us(0x355))];
      rp && ro[us(0x865)](nN(rp), ro[us(0xbaf)][0x0]);
    }
    var hD;
    try {
      hD = localStorage;
    } catch (rq) {
      console[us(0xd62)](us(0x8f6), rq), (hD = {});
    }
    var hE = document[us(0xa02)](us(0x843)),
      hF = document[us(0xa02)](us(0xc5f)),
      hG = document[us(0xa02)](us(0x665));
    (hE[us(0xab7)] = function () {
      const vg = us;
      return nN(
        vg(0x235) + hP[vg(0xde2)] + vg(0x9a5) + cN + vg(0xaa6) + cM + vg(0x411)
      );
    }),
      (hF[us(0xae3)] = cM),
      (hF[us(0x4d8)] = function () {
        const vh = us;
        !cO[vh(0x73d)](this[vh(0x69c)]) &&
          (this[vh(0x69c)] = this[vh(0x69c)][vh(0x9c7)](cP, ""));
      });
    var hH,
      hI = document[us(0xa02)](us(0x353));
    function hJ(rr) {
      const vi = us;
      rr ? k8(hI, rr + vi(0x915)) : k8(hI, vi(0xb8d)),
        (hE[vi(0xb14)][vi(0x5ad)] =
          rr && rr[vi(0xaa0)]("\x20") === -0x1 ? vi(0xaa8) : "");
    }
    hG[us(0x269)] = nt(function () {
      const vj = us;
      if (!hW || jy) return;
      const rr = hF[vj(0x69c)],
        rs = rr[vj(0x8c2)];
      if (rs < cN) hc(vj(0x5eb));
      else {
        if (rs > cM) hc(vj(0x448));
        else {
          if (!cO[vj(0x73d)](rr)) hc(vj(0x8f0));
          else {
            hc(vj(0x7ee), hP[vj(0xb33)]), (hH = rr);
            const rt = new Uint8Array([
              cI[vj(0xcca)],
              ...new TextEncoder()[vj(0x965)](rr),
            ]);
            il(rt);
          }
        }
      }
    });
    function hK(rr, rs = ng[us(0x26e)]) {
      nj(-0x1, null, rr, rs);
    }
    hw();
    var hL = f4(cR),
      hM = f4(cS),
      hN = f4(d9);
    const hO = {};
    (hO[us(0xde2)] = us(0x60b)),
      (hO[us(0xb33)] = us(0xbec)),
      (hO[us(0x9cd)] = us(0x944)),
      (hO[us(0x750)] = us(0x85d)),
      (hO[us(0x99b)] = us(0x762)),
      (hO[us(0x522)] = us(0x176)),
      (hO[us(0x547)] = us(0x472)),
      (hO[us(0xd3)] = us(0x929)),
      (hO[us(0x8bb)] = us(0x991));
    var hP = hO,
      hQ = Object[us(0x5e3)](hP),
      hR = [];
    for (let rr = 0x0; rr < hQ[us(0x8c2)]; rr++) {
      const rs = hQ[rr],
        rt = rs[us(0xba3)](0x4, rs[us(0xaa0)](")"))
          [us(0x64a)](",\x20")
          [us(0x466)]((ru) => parseInt(ru) * 0.8);
      hR[us(0x733)](pY(rt));
    }
    hS(us(0x320), us(0x234)),
      hS(us(0xaa2), us(0x698)),
      hS(us(0x305), us(0x372)),
      hS(us(0x903), us(0x30a)),
      hS(us(0x116), us(0x66f)),
      hS(us(0x636), us(0x761)),
      hS(us(0xa6), us(0xdbf));
    function hS(ru, rv) {
      const vk = us;
      document[vk(0xa02)](ru)[vk(0x269)] = function () {
        const vl = vk;
        window[vl(0x57c)](rv, vl(0xdb7));
      };
    }
    setInterval(function () {
      const vm = us;
      hW && il(new Uint8Array([cI[vm(0xbaa)]]));
    }, 0x3e8);
    function hT() {
      const vn = us;
      (pK = [pR]),
        (j6[vn(0x43b)] = !![]),
        (j6 = {}),
        (jG = 0x0),
        (jH[vn(0x8c2)] = 0x0),
        (iw = []),
        (iG[vn(0x8c2)] = 0x0),
        (iC[vn(0xcc2)] = ""),
        (iv = {}),
        (iH = ![]),
        (iy = null),
        (ix = null),
        (pA = 0x0),
        (hW = ![]),
        (mC = 0x0),
        (mB = 0x0),
        (mm = ![]),
        (mi[vn(0xb14)][vn(0x5ad)] = vn(0xaa8)),
        (q2[vn(0xb14)][vn(0x5ad)] = q1[vn(0xb14)][vn(0x5ad)] = vn(0xaa8)),
        (py = 0x0),
        (pz = 0x0);
    }
    var hU;
    function hV(ru) {
      const vo = us;
      (jh[vo(0xb14)][vo(0x5ad)] = vo(0xaa8)),
        (pf[vo(0xb14)][vo(0x5ad)] = vo(0xaa8)),
        hZ(),
        kA[vo(0x5a4)][vo(0x2b0)](vo(0xd69)),
        kB[vo(0x5a4)][vo(0xbc7)](vo(0xd69)),
        hT(),
        console[vo(0xd6f)](vo(0x99d) + ru + vo(0x578)),
        iu(),
        (hU = new WebSocket(ru)),
        (hU[vo(0xfd)] = vo(0x7e6)),
        (hU[vo(0x3a9)] = hX),
        (hU[vo(0xc02)] = k1),
        (hU[vo(0x3ef)] = kg);
    }
    crypto[us(0xa38)] =
      crypto[us(0xa38)] ||
      function ru() {
        const vp = us;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vp(0x9c7)
        ](/[018]/g, (rv) =>
          (rv ^
            (crypto[vp(0x707)](new Uint8Array(0x1))[0x0] &
              (0xf >> (rv / 0x4))))[vp(0xbfe)](0x10)
        );
      };
    var hW = ![];
    function hX() {
      const vq = us;
      console[vq(0xd6f)](vq(0xc14)), ie();
      hack.preload();
    }
    var hY = document[us(0xa02)](us(0x8f1));
    function hZ() {
      const vr = us;
      hY[vr(0xb14)][vr(0x5ad)] = vr(0xaa8);
    }
    var i0 = document[us(0xa02)](us(0x10e)),
      i1 = document[us(0xa02)](us(0xad4)),
      i2 = document[us(0xa02)](us(0x81d)),
      i3 = document[us(0xa02)](us(0xd2));
    i3[us(0x269)] = function () {
      const vs = us;
      !i6 &&
        (window[vs(0x8f3)][vs(0x56b)] =
          vs(0xbd) +
          encodeURIComponent(!window[vs(0x48e)] ? vs(0x943) : vs(0x302)) +
          vs(0x54c) +
          encodeURIComponent(btoa(i5)));
    };
    var i4 = document[us(0xa02)](us(0xc92));
    (i4[us(0x269)] = function () {
      const vt = us;
      i5 == hD[vt(0x7c5)] && delete hD[vt(0x7c5)];
      delete hD[vt(0x27c)];
      if (hU)
        try {
          hU[vt(0xcb5)]();
        } catch (rv) {}
    }),
      hZ();
    var i5, i6;
    function i7(rv) {
      const vv = us;
      try {
        let rx = function (ry) {
          const vu = b;
          return ry[vu(0x9c7)](/([.*+?\^$(){}|\[\]\/\\])/g, vu(0x748));
        };
        var rw = document[vv(0x182)][vv(0x973)](
          RegExp(vv(0x2aa) + rx(rv) + vv(0xa41))
        );
        return rw ? rw[0x1] : null;
      } catch (ry) {
        return "";
      }
    }
    var i8 = !window[us(0x48e)];
    function i9(rv) {
      const vw = us;
      try {
        document[vw(0x182)] = rv + vw(0xc64) + (i8 ? vw(0x963) : "");
      } catch (rw) {}
    }
    var ia = 0x0,
      ib;
    function ic() {
      const vx = us;
      (ia = 0x0), (hW = ![]);
      !eV(hD[vx(0x7c5)]) && (hD[vx(0x7c5)] = crypto[vx(0xa38)]());
      (i5 = hD[vx(0x7c5)]), (i6 = hD[vx(0x27c)]);
      !i6 &&
        ((i6 = i7(vx(0x27c))),
        i6 && (i6 = decodeURIComponent(i6)),
        i9(vx(0x27c)));
      if (i6)
        try {
          const rv = i6;
          i6 = JSON[vx(0xae6)](decodeURIComponent(escape(atob(rv))));
          if (eV(i6[vx(0x1b8)]))
            (i5 = i6[vx(0x1b8)]),
              i1[vx(0x7ea)](vx(0x130), i6[vx(0xcda)]),
              i6[vx(0x82e)] &&
                (i2[vx(0xb14)][vx(0xac5)] = vx(0xc1f) + i6[vx(0x82e)] + ")"),
              (hD[vx(0x27c)] = rv);
          else throw new Error(vx(0xd2b));
        } catch (rw) {
          (i6 = null), delete hD[vx(0x27c)], console[vx(0x26e)](vx(0x7aa) + rw);
        }
      ib = hD[vx(0xb16)] || "";
    }
    function ie() {
      ic(), ii();
    }
    function ig() {
      const vy = us,
        rv = [
          vy(0xcbb),
          vy(0x497),
          vy(0x296),
          vy(0x98a),
          vy(0xd86),
          vy(0x1d0),
          vy(0xbdd),
          vy(0x531),
          vy(0x9af),
          vy(0x45c),
          vy(0x844),
          vy(0x867),
          vy(0x7e1),
          vy(0xd1e),
          vy(0xcf2),
          vy(0xec),
          vy(0x3fc),
          vy(0xa97),
          vy(0xb08),
          vy(0x2fd),
          vy(0x682),
          vy(0x87e),
          vy(0x8ce),
          vy(0x186),
          vy(0xc82),
          vy(0x3d5),
          vy(0x4f1),
          vy(0x106),
          vy(0x601),
          vy(0x258),
          vy(0xca6),
          vy(0x365),
          vy(0x861),
          vy(0x2f9),
          vy(0x142),
          vy(0x86d),
          vy(0xd6),
          vy(0x683),
          vy(0x6a2),
          vy(0x6d9),
          vy(0xb56),
          vy(0x89d),
          vy(0x1e9),
          vy(0x3f6),
          vy(0xafc),
          vy(0xccc),
          vy(0x7a4),
          vy(0x223),
          vy(0x157),
          vy(0xa88),
          vy(0x1f0),
          vy(0x9f7),
          vy(0x751),
          vy(0x429),
          vy(0x7d5),
          vy(0xbb3),
          vy(0xbeb),
          vy(0xc38),
          vy(0x1bc),
          vy(0x507),
          vy(0xb7b),
          vy(0xb49),
          vy(0xc17),
          vy(0xa27),
        ];
      return (
        (ig = function () {
          return rv;
        }),
        ig()
      );
    }
    function ih(rv, rw) {
      const rx = ig();
      return (
        (ih = function (ry, rz) {
          const vz = b;
          ry = ry - (0x67c * -0x1 + -0x2 * -0xbdd + -0x5 * 0x35b);
          let rA = rx[ry];
          if (ih[vz(0x686)] === void 0x0) {
            var rB = function (rG) {
              const vA = vz,
                rH = vA(0xd1f);
              let rI = "",
                rJ = "";
              for (
                let rK = 0xc6a + -0x161c + -0x22 * -0x49,
                  rL,
                  rM,
                  rN = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rM = rG[vA(0x8bc)](rN++));
                ~rM &&
                ((rL =
                  rK % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? rL * (0x2422 + -0x5 * 0x38b + -0x122b) + rM
                    : rM),
                rK++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rI += String[vA(0x5b4)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (rL >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rK) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rM = rH[vA(0xaa0)](rM);
              }
              for (
                let rO = 0x23d0 + 0x13 * -0xdf + -0x1343, rP = rI[vA(0x8c2)];
                rO < rP;
                rO++
              ) {
                rJ +=
                  "%" +
                  ("00" +
                    rI[vA(0x5a1)](rO)[vA(0xbfe)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vA(0xba3)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
              }
              return decodeURIComponent(rJ);
            };
            const rF = function (rG, rH) {
              const vB = vz;
              let rI = [],
                rJ = -0x3 * 0x542 + -0x7d7 * 0x3 + 0x274b,
                rK,
                rL = "";
              rG = rB(rG);
              let rM;
              for (
                rM = 0x2205 + 0x3ac + -0x1 * 0x25b1;
                rM < 0x1e33 + 0x1 * -0x181 + -0x5 * 0x58a;
                rM++
              ) {
                rI[rM] = rM;
              }
              for (
                rM = 0x91f * 0x4 + -0x554 + -0x1 * 0x1f28;
                rM < 0x2e * 0x43 + 0x12 * 0xc5 + -0x84c * 0x3;
                rM++
              ) {
                (rJ =
                  (rJ + rI[rM] + rH[vB(0x5a1)](rM % rH[vB(0x8c2)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rK = rI[rM]),
                  (rI[rM] = rI[rJ]),
                  (rI[rJ] = rK);
              }
              (rM = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rJ = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rN = -0x1d30 + -0x23c8 + 0x40f8;
                rN < rG[vB(0x8c2)];
                rN++
              ) {
                (rM =
                  (rM + (0x2309 * -0x1 + 0x5 * -0x8b + -0x1 * -0x25c1)) %
                  (0xc5 * -0x1d + -0x1f03 + 0x3654)),
                  (rJ =
                    (rJ + rI[rM]) %
                    (-0x5 * -0x256 + 0x1cf * 0x2 + -0x1e * 0x7a)),
                  (rK = rI[rM]),
                  (rI[rM] = rI[rJ]),
                  (rI[rJ] = rK),
                  (rL += String[vB(0x5b4)](
                    rG[vB(0x5a1)](rN) ^
                      rI[(rI[rM] + rI[rJ]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return rL;
            };
            (ih[vz(0x912)] = rF), (rv = arguments), (ih[vz(0x686)] = !![]);
          }
          const rC = rx[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rD = ry + rC,
            rE = rv[rD];
          return (
            !rE
              ? (ih[vz(0x98c)] === void 0x0 && (ih[vz(0x98c)] = !![]),
                (rA = ih[vz(0x912)](rA, rz)),
                (rv[rD] = rA))
              : (rA = rE),
            rA
          );
        }),
        ih(rv, rw)
      );
    }
    (function (rv, rw) {
      const vC = us;
      function rx(rD, rE, rF, rG, rH) {
        return ih(rG - 0x124, rH);
      }
      function ry(rD, rE, rF, rG, rH) {
        return ih(rE - -0x245, rD);
      }
      function rz(rD, rE, rF, rG, rH) {
        return ih(rH - -0x1b4, rG);
      }
      function rA(rD, rE, rF, rG, rH) {
        return ih(rD - 0x13, rG);
      }
      const rB = rv();
      function rC(rD, rE, rF, rG, rH) {
        return ih(rF - -0x2b3, rH);
      }
      while (!![]) {
        try {
          const rD =
            (parseInt(rx(0x1a1, 0x1b2, 0x1a9, 0x1b7, vC(0x5e7))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rz(-0x105, -0x12e, -0x131, vC(0x5e7), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(rx(0x1b5, 0x1c9, 0x1b1, 0x1cb, vC(0x1ef))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rz(-0x128, -0x132, -0x134, vC(0x7e8), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rz(-0x131, -0x155, -0x130, vC(0x961), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rA(0x9a, 0xb1, 0xb2, vC(0x1ef), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(rx(0x1b5, 0x1d3, 0x1bc, 0x1d1, vC(0xa71))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rA(0xb2, 0xbe, 0xb9, vC(0xdc1), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(rx(0x183, 0x1ae, 0x197, 0x19e, vC(0x609))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rC(-0x244, -0x216, -0x232, -0x217, vC(0x10f))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rz(-0x126, -0x10f, -0x13a, vC(0x51d), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rC(-0x203, -0x209, -0x200, -0x1e1, vC(0xdd0))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rD === rw) break;
          else rB[vC(0x733)](rB[vC(0x913)]());
        } catch (rE) {
          rB[vC(0x733)](rB[vC(0x913)]());
        }
      }
    })(ig, 0xc30df * 0x1 + 0x10f * -0x697 + 0x11613);
    function ii() {
      const vD = us,
        rv = {
          dEyIJ: function (rH, rI) {
            return rH === rI;
          },
          HMRdl:
            ry(vD(0x7e8), -0x130, -0x106, -0x11f, -0x11d) +
            ry(vD(0x528), -0x11a, -0x142, -0x138, -0x135),
          MCQcr: function (rH, rI) {
            return rH(rI);
          },
          OVQiZ: function (rH, rI) {
            return rH + rI;
          },
          UJCyl: function (rH, rI) {
            return rH % rI;
          },
          RniHC: function (rH, rI) {
            return rH * rI;
          },
          pKOiA: function (rH, rI) {
            return rH < rI;
          },
          ksKNr: function (rH, rI) {
            return rH ^ rI;
          },
          pZcMn: function (rH, rI) {
            return rH - rI;
          },
          GNeTf: function (rH, rI) {
            return rH - rI;
          },
          igRib: function (rH, rI) {
            return rH ^ rI;
          },
          GUXBF: function (rH, rI) {
            return rH + rI;
          },
          NcAdQ: function (rH, rI) {
            return rH % rI;
          },
          hlnUf: function (rH, rI) {
            return rH * rI;
          },
          pJhNJ: function (rH, rI) {
            return rH(rI);
          },
        };
      if (
        rv[rx(-0x27e, -0x274, -0x265, vD(0x59f), -0x274)](
          typeof window,
          rv[rz(vD(0x520), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        rv[rB(-0x17d, -0x171, -0x181, vD(0x525), -0x16a)](
          typeof ki,
          rv[rx(-0x25a, -0x263, -0x26c, vD(0x528), -0x270)]
        )
      )
        return;
      const rw = i5;
      function rx(rH, rI, rJ, rK, rL) {
        return ih(rH - -0x30c, rK);
      }
      function ry(rH, rI, rJ, rK, rL) {
        return ih(rL - -0x1cb, rH);
      }
      function rz(rH, rI, rJ, rK, rL) {
        return ih(rL - 0x14c, rH);
      }
      const rA = rw[rz(vD(0xdc1), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function rB(rH, rI, rJ, rK, rL) {
        return ih(rH - -0x20a, rK);
      }
      const rC = rv[rE(0x43a, vD(0xc08), 0x40e, 0x428, 0x430)](
        ij,
        rv[rx(-0x28e, -0x27f, -0x272, vD(0x525), -0x281)](
          rv[ry(vD(0xcf4), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rA
          ),
          ib[ry(vD(0x6ca), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rD = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rC[
        ry(vD(0x45f), -0x11e, -0x149, -0x131, -0x13c) +
          rB(-0x172, -0x16e, -0x175, vD(0x520), -0x166)
      ](rD++, cI[rB(-0x18e, -0x16e, -0x17a, vD(0x7e8), -0x1a6)]),
        rC[
          rE(0x415, vD(0x493), 0x44c, 0x433, 0x422) +
            rz(vD(0x260), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rD, cJ),
        (rD += -0x3dd + -0x6b5 + 0xa94);
      function rE(rH, rI, rJ, rK, rL) {
        return ih(rK - 0x3a2, rI);
      }
      const rF = rv[rE(0x43c, vD(0x79a), 0x43b, 0x446, 0x459)](
        rv[rx(-0x283, -0x272, -0x298, vD(0xa42), -0x26e)](
          cJ,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let rH = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        rv[rz(vD(0x4ce), 0x200, 0x1fc, 0x1fc, 0x1e5)](rH, rA);
        rH++
      ) {
        rC[
          rx(-0x287, -0x273, -0x27d, vD(0x520), -0x27c) +
            rz(vD(0x218), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rD++,
          rv[rz(vD(0x232), 0x201, 0x215, 0x21c, 0x1fc)](
            rw[
              ry(vD(0xca9), -0x11c, -0x130, -0x128, -0x13b) +
                rx(-0x289, -0x29c, -0x26a, vD(0x6ca), -0x290)
            ](
              rv[ry(vD(0xb5a), -0x13a, -0x124, -0x111, -0x120)](
                rv[ry(vD(0x59f), -0x10d, -0x119, -0x108, -0x128)](rA, rH),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rF
          )
        );
      }
      if (ib) {
        const rI = ib[rz(vD(0x525), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rJ = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          rv[rz(vD(0xb27), 0x21f, 0x216, 0x204, 0x200)](rJ, rI);
          rJ++
        ) {
          rC[
            rz(vD(0x260), 0x207, 0x20e, 0x209, 0x202) +
              rz(vD(0xca9), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rD++,
            rv[rx(-0x25b, -0x256, -0x24f, vD(0x95a), -0x261)](
              ib[
                rx(-0x267, -0x256, -0x25e, vD(0x77e), -0x271) +
                  rE(0x412, vD(0xca9), 0x411, 0x421, 0x425)
              ](
                rv[rE(0x435, vD(0x5e7), 0x427, 0x434, 0x41a)](
                  rv[ry(vD(0xc16), -0x143, -0x134, -0x133, -0x137)](rI, rJ),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rF
            )
          );
        }
      }
      const rG = rC[
        rE(0x423, vD(0x7e8), 0x44b, 0x440, 0x45a) +
          rx(-0x280, -0x27d, -0x26e, vD(0x260), -0x288)
      ](
        rv[rB(-0x162, -0x164, -0x161, vD(0x528), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          rv[rE(0x429, vD(0x358), 0x43d, 0x437, 0x44b)](
            rv[ry(vD(0x609), -0x10d, -0x127, -0x124, -0x116)](
              cJ,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rA
          )
        )
      );
      rv[rE(0x435, vD(0x408), 0x43b, 0x42a, 0x448)](il, rC), (ia = rG);
    }
    function ij(rv) {
      return new DataView(new ArrayBuffer(rv));
    }
    function ik() {
      const vE = us;
      return hU && hU[vE(0x5ab)] === WebSocket[vE(0x20d)];
    }
    function il(rv) {
      const vF = us;
      if (ik()) {
        pB += rv[vF(0x4d4)];
        if (hW) {
          const rw = new Uint8Array(rv[vF(0xd5f)]);
          for (let rz = 0x0; rz < rw[vF(0x8c2)]; rz++) {
            rw[rz] ^= ia;
          }
          const rx = cJ % rw[vF(0x8c2)],
            ry = rw[0x0];
          (rw[0x0] = rw[rx]), (rw[rx] = ry);
        }
        hU[vF(0x1dc)](rv);
      }
    }
    function im(rv, rw = 0x1) {
      const vG = us;
      let rx = eU(rv);
      const ry = new Uint8Array([
        cI[vG(0xa8a)],
        rx,
        Math[vG(0x2ab)](rw * 0xff),
      ]);
      il(ry);
    }
    function io(rv, rw) {
      const rx = ip();
      return (
        (io = function (ry, rz) {
          ry = ry - (-0x25b2 + 0x10 * 0x211 + 0x5b2);
          let rA = rx[ry];
          return rA;
        }),
        io(rv, rw)
      );
    }
    function ip() {
      const vH = us,
        rv = [
          vH(0xd9b),
          vH(0x672),
          vH(0xb53),
          vH(0x39f),
          vH(0x94e),
          vH(0x704),
          vH(0x2b1),
          vH(0xb5),
          vH(0x815),
          vH(0x2bd),
          vH(0x66e),
          vH(0x583),
          vH(0x4f2),
          vH(0xbbc),
          vH(0x432),
          vH(0x62d),
          vH(0xddf),
          vH(0xc37),
          vH(0xc48),
          vH(0xd5a),
        ];
      return (
        (ip = function () {
          return rv;
        }),
        ip()
      );
    }
    (function (rv, rw) {
      const vI = us;
      function rx(rD, rE, rF, rG, rH) {
        return io(rE - -0x22a, rH);
      }
      const ry = rv();
      function rz(rD, rE, rF, rG, rH) {
        return io(rG - -0x178, rE);
      }
      function rA(rD, rE, rF, rG, rH) {
        return io(rG - 0xba, rD);
      }
      function rB(rD, rE, rF, rG, rH) {
        return io(rD - -0x119, rF);
      }
      function rC(rD, rE, rF, rG, rH) {
        return io(rF - -0x53, rD);
      }
      while (!![]) {
        try {
          const rD =
            (-parseInt(rB(0x9, -0x1, 0xe, 0x10, 0x0)) /
              (-0x242b + -0x3 * -0x421 + 0x17c9)) *
              (-parseInt(rC(0xc4, 0xb9, 0xc1, 0xb8, 0xc5)) /
                (0xe5b + 0x551 * 0x2 + -0x18fb)) +
            -parseInt(rB(-0x1, -0x5, -0x4, -0x4, 0x2)) /
              (0x49 * -0xb + 0x6 * 0x373 + 0x1 * -0x118c) +
            -parseInt(rz(-0x52, -0x53, -0x4d, -0x55, -0x54)) /
              (-0x10e7 + -0x14a9 + 0x2594) +
            -parseInt(rC(0xcd, 0xc0, 0xc8, 0xc6, 0xcd)) /
              (0x159 + 0x18e * 0x2 + -0x470) +
            (-parseInt(rB(0x6, -0x2, 0x10, 0x2, 0xc)) /
              (-0x1872 * -0x1 + 0x1d62 + -0x35ce)) *
              (-parseInt(rz(-0x65, -0x5d, -0x54, -0x5e, -0x66)) /
                (-0x11c + -0x682 + 0x7a5 * 0x1)) +
            -parseInt(rx(-0x112, -0x11a, -0x115, -0x122, -0x11b)) /
              (-0x2312 + -0x1 * -0x2659 + -0x33f) +
            (-parseInt(rA(0x1dc, 0x1d0, 0x1dd, 0x1d7, 0x1de)) /
              (-0x5 * 0x61f + -0x8b * 0x3e + -0x2027 * -0x2)) *
              (-parseInt(rA(0x1d8, 0x1cf, 0x1d5, 0x1cf, 0x1d5)) /
                (-0x292 * -0xb + 0x13d * -0x13 + -0x4b5));
          if (rD === rw) break;
          else ry[vI(0x733)](ry[vI(0x913)]());
        } catch (rE) {
          ry[vI(0x733)](ry[vI(0x913)]());
        }
      }
    })(ip, -0x1 * -0x304f9 + 0x1cdb2 + -0x2848f);
    function iq(rv) {
      function rw(rD, rE, rF, rG, rH) {
        return io(rD - 0x3df, rG);
      }
      function rx(rD, rE, rF, rG, rH) {
        return io(rD - 0x12f, rE);
      }
      function ry(rD, rE, rF, rG, rH) {
        return io(rG - 0x263, rF);
      }
      const rz = {
          xgMol: function (rD) {
            return rD();
          },
          NSlTg: function (rD) {
            return rD();
          },
          BrnPE: function (rD) {
            return rD();
          },
          oiynC: function (rD, rE) {
            return rD(rE);
          },
        },
        rA = new Uint8Array([
          cI[
            rB(0x44e, 0x446, 0x44f, 0x456, 0x44f) +
              rB(0x440, 0x43c, 0x440, 0x448, 0x43d)
          ],
          rz[ry(0x387, 0x37e, 0x37e, 0x381, 0x38b)](ir),
          oO,
          rz[rC(0x4a2, 0x4a9, 0x4a0, 0x4a8, 0x49f)](ir),
          rz[rx(0x245, 0x243, 0x241, 0x249, 0x24d)](ir),
          ...rz[ry(0x381, 0x389, 0x38e, 0x384, 0x37e)](is, rv),
        ]);
      function rB(rD, rE, rF, rG, rH) {
        return io(rD - 0x32e, rE);
      }
      function rC(rD, rE, rF, rG, rH) {
        return io(rH - 0x38e, rF);
      }
      rz[rx(0x250, 0x24e, 0x250, 0x246, 0x24a)](il, rA);
    }
    function ir() {
      function rv(rB, rC, rD, rE, rF) {
        return io(rC - 0xd5, rE);
      }
      function rw(rB, rC, rD, rE, rF) {
        return io(rF - 0x379, rB);
      }
      const rx = {};
      function ry(rB, rC, rD, rE, rF) {
        return io(rF - 0x107, rD);
      }
      rx[rA(-0x1b1, -0x1b7, -0x1bb, -0x1ad, -0x1af)] = function (rB, rC) {
        return rB * rC;
      };
      const rz = rx;
      function rA(rB, rC, rD, rE, rF) {
        return io(rB - -0x2ca, rD);
      }
      return Math[rv(0x1f0, 0x1ec, 0x1f4, 0x1e4, 0x1ea)](
        rz[rA(-0x1b1, -0x1ab, -0x1b8, -0x1b0, -0x1b4)](
          Math[rA(-0x1b7, -0x1bb, -0x1bd, -0x1b7, -0x1b2) + "m"](),
          -0x2573 + -0xe * 0x11e + 0x3616
        )
      );
    }
    function is(rv) {
      function rw(rx, ry, rz, rA, rB) {
        return io(rB - 0x117, ry);
      }
      return new TextEncoder()[rw(0x22e, 0x22d, 0x237, 0x22b, 0x233) + "e"](rv);
    }
    function it(rv, rw, rx = 0x3c) {
      const vJ = us;
      iu(),
        (kk[vJ(0xcc2)] = vJ(0xd06) + rv + vJ(0xadf) + rw + vJ(0x772)),
        kk[vJ(0x75c)](hY),
        (hY[vJ(0xb14)][vJ(0x5ad)] = ""),
        (i3[vJ(0xb14)][vJ(0x5ad)] = vJ(0xaa8)),
        (i0[vJ(0xb14)][vJ(0x5ad)] = vJ(0xaa8)),
        (hY[vJ(0xa02)](vJ(0xc5a))[vJ(0xb14)][vJ(0x975)] = "0"),
        document[vJ(0xb87)][vJ(0x5a4)][vJ(0xbc7)](vJ(0xef)),
        (kk[vJ(0xb14)][vJ(0x5ad)] = ""),
        (kl[vJ(0xb14)][vJ(0x5ad)] =
          kn[vJ(0xb14)][vJ(0x5ad)] =
          km[vJ(0xb14)][vJ(0x5ad)] =
          kC[vJ(0xb14)][vJ(0x5ad)] =
            vJ(0xaa8));
      const ry = document[vJ(0xa02)](vJ(0x65a));
      document[vJ(0xa02)](vJ(0x3aa))[vJ(0x269)] = function () {
        rB();
      };
      let rz = rx;
      k8(ry, vJ(0x95e) + rz + vJ(0x2e9));
      const rA = setInterval(() => {
        const vK = vJ;
        rz--, rz <= 0x0 ? rB() : k8(ry, vK(0x95e) + rz + vK(0x2e9));
      }, 0x3e8);
      function rB() {
        const vL = vJ;
        clearInterval(rA), k8(ry, vL(0x802)), location[vL(0x68a)]();
      }
    }
    function iu() {
      const vM = us;
      if (hU) {
        hU[vM(0x3a9)] = hU[vM(0xc02)] = hU[vM(0x3ef)] = null;
        try {
          hU[vM(0xcb5)]();
        } catch (rv) {}
        hU = null;
      }
    }
    var iv = {},
      iw = [],
      ix,
      iy,
      iz = [],
      iA = us(0xd38);
    function iB() {
      const vN = us;
      iA = getComputedStyle(document[vN(0xb87)])[vN(0x12d)];
    }
    var iC = document[us(0xa02)](us(0xb23)),
      iD = document[us(0xa02)](us(0x2c7)),
      iE = document[us(0xa02)](us(0x949)),
      iF = [],
      iG = [],
      iH = ![],
      iI = 0x0;
    function iJ(rv) {
      const vO = us;
      if (rv < 0.01) return "0";
      rv = Math[vO(0x2ab)](rv);
      if (rv >= 0x3b9aca00)
        return parseFloat((rv / 0x3b9aca00)[vO(0x9da)](0x2)) + "b";
      else {
        if (rv >= 0xf4240)
          return parseFloat((rv / 0xf4240)[vO(0x9da)](0x2)) + "m";
        else {
          if (rv >= 0x3e8)
            return parseFloat((rv / 0x3e8)[vO(0x9da)](0x1)) + "k";
        }
      }
      return rv;
    }
    function iK(rv, rw) {
      const vP = us,
        rx = document[vP(0x6be)](vP(0x7e0));
      rx[vP(0x58e)] = vP(0xf8);
      const ry = document[vP(0x6be)](vP(0x7e0));
      (ry[vP(0x58e)] = vP(0x615)), rx[vP(0x75c)](ry);
      const rz = document[vP(0x6be)](vP(0x552));
      rx[vP(0x75c)](rz), iC[vP(0x75c)](rx);
      const rA = {};
      (rA[vP(0x324)] = rv),
        (rA[vP(0x882)] = rw),
        (rA[vP(0x73a)] = 0x0),
        (rA[vP(0x737)] = 0x0),
        (rA[vP(0x49a)] = 0x0),
        (rA["el"] = rx),
        (rA[vP(0x9ec)] = ry),
        (rA[vP(0xd31)] = rz);
      const rB = rA;
      (rB[vP(0x46a)] = iG[vP(0x8c2)]),
        (rB[vP(0xc2f)] = function () {
          const vQ = vP;
          (this[vQ(0x73a)] = pt(this[vQ(0x73a)], this[vQ(0x882)], 0x64)),
            (this[vQ(0x49a)] = pt(this[vQ(0x49a)], this[vQ(0x737)], 0x64)),
            this[vQ(0xd31)][vQ(0x7ea)](
              vQ(0x130),
              (this[vQ(0x324)] ? this[vQ(0x324)] + vQ(0x5da) : "") +
                iJ(this[vQ(0x73a)])
            ),
            (this[vQ(0x9ec)][vQ(0xb14)][vQ(0xd8b)] = this[vQ(0x49a)] + "%");
        }),
        rB[vP(0xc2f)](),
        iG[vP(0x733)](rB);
    }
    function iL(rv) {
      const vR = us;
      if (iG[vR(0x8c2)] === 0x0) return;
      const rw = iG[0x0];
      rw[vR(0x737)] = rw[vR(0x49a)] = 0x64;
      for (let rx = 0x1; rx < iG[vR(0x8c2)]; rx++) {
        const ry = iG[rx];
        (ry[vR(0x737)] =
          Math[vR(0xbe6)](
            0x1,
            rw[vR(0x882)] === 0x0 ? 0x1 : ry[vR(0x882)] / rw[vR(0x882)]
          ) * 0x64),
          rv && (ry[vR(0x49a)] = ry[vR(0x737)]),
          iC[vR(0x75c)](ry["el"]);
      }
    }
    function iM(rv) {
      const vS = us,
        rw = new Path2D();
      rw[vS(0x7f4)](...rv[vS(0xa30)][0x0]);
      for (let rx = 0x0; rx < rv[vS(0xa30)][vS(0x8c2)] - 0x1; rx++) {
        const ry = rv[vS(0xa30)][rx],
          rz = rv[vS(0xa30)][rx + 0x1];
        let rA = 0x0;
        const rB = rz[0x0] - ry[0x0],
          rC = rz[0x1] - ry[0x1],
          rD = Math[vS(0xa5e)](rB, rC);
        while (rA < rD) {
          rw[vS(0x5d2)](
            ry[0x0] + (rA / rD) * rB + (Math[vS(0xb7c)]() * 0x2 - 0x1) * 0x32,
            ry[0x1] + (rA / rD) * rC + (Math[vS(0xb7c)]() * 0x2 - 0x1) * 0x32
          ),
            (rA += Math[vS(0xb7c)]() * 0x28 + 0x1e);
        }
        rw[vS(0x5d2)](...rz);
      }
      rv[vS(0x70c)] = rw;
    }
    var iN = 0x0,
      iO = 0x0,
      iP = [],
      iQ = {},
      iR = [],
      iS = {};
    function iT(rv, rw) {
      const vT = us;
      if (!p8[vT(0x4e1)]) return;
      var baseHP = getHP(rv, hack.moblst);
      var decDmg = rv['nHealth'] - rw;
      var dmg = Math.floor(decDmg * 10000) / 100 + '%';
      if(baseHP && hack.isEnabled('DDenableNumber')) var dmg = Math.floor(decDmg * baseHP);
      let rx;
      const ry = rw === void 0x0;
      !ry && (rx = Math[vT(0xb0c)]((rv[vT(0xb24)] - rw) * 0x64) || 0x1),
        iz[vT(0x733)]({
          text: hack.isEnabled('damageDisplay') ? dmg : rx,
          x: rv["x"] + (Math[vT(0xb7c)]() * 0x2 - 0x1) * rv[vT(0xc60)] * 0.6,
          y: rv["y"] + (Math[vT(0xb7c)]() * 0x2 - 0x1) * rv[vT(0xc60)] * 0.6,
          vx: (Math[vT(0xb7c)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[vT(0xb7c)]() * 0x3,
          angle: (Math[vT(0xb7c)]() * 0x2 - 0x1) * (ry ? 0x1 : 0.1),
          size: Math[vT(0xdb0)](0x1, (rv[vT(0xc60)] * 0.2) / 0x14),
        }),
        rv === iy && (ps = 0x1);
    }
    var iU = 0x0,
      iV = 0x0,
      iW = 0x0,
      iX = 0x0;
    function iY(rv) {
      const vU = us,
        rw = iv[rv];
      if (rw) {
        rw[vU(0xd11)] = !![];
        if (
          Math[vU(0x7a8)](rw["nx"] - iU) > iW + rw[vU(0xb3a)] ||
          Math[vU(0x7a8)](rw["ny"] - iV) > iX + rw[vU(0xb3a)]
        )
          rw[vU(0x3ec)] = 0xa;
        else !rw[vU(0x27a)] && iT(rw, 0x0);
        delete iv[rv];
      }
    }
    var iZ = [
      us(0x35d),
      us(0x618),
      us(0x624),
      us(0x367),
      us(0xc49),
      us(0xb61),
      us(0xb9e),
      us(0x879),
      us(0x521),
      us(0x1d7),
      us(0xdd7),
      us(0x78b),
      us(0x284),
    ];
    function j0(rv, rw = iy) {
      const vV = us;
      (rv[vV(0x35d)] = rw[vV(0x35d)]),
        (rv[vV(0x618)] = rw[vV(0x618)]),
        (rv[vV(0x624)] = rw[vV(0x624)]),
        (rv[vV(0x367)] = rw[vV(0x367)]),
        (rv[vV(0xc49)] = rw[vV(0xc49)]),
        (rv[vV(0xb61)] = rw[vV(0xb61)]),
        (rv[vV(0xb9e)] = rw[vV(0xb9e)]),
        (rv[vV(0x879)] = rw[vV(0x879)]),
        (rv[vV(0x521)] = rw[vV(0x521)]),
        (rv[vV(0x1d7)] = rw[vV(0x1d7)]),
        (rv[vV(0x84b)] = rw[vV(0x84b)]),
        (rv[vV(0xdd7)] = rw[vV(0xdd7)]),
        (rv[vV(0x1f3)] = rw[vV(0x1f3)]),
        (rv[vV(0x78b)] = rw[vV(0x78b)]),
        (rv[vV(0x284)] = rw[vV(0x284)]);
    }
    function j1() {
      (oW = null), p4(null), (p0 = null), (oY = ![]), (oZ = 0x0), oi && pJ();
    }
    var j2 = 0x64,
      j3 = 0x1,
      j4 = 0x64,
      j5 = 0x1,
      j6 = {},
      j7 = [...Object[us(0x4f4)](d9)],
      j8 = [...hQ];
    ja(j7),
      ja(j8),
      j7[us(0x733)](us(0x8e3)),
      j8[us(0x733)](hP[us(0xde2)] || us(0xd1)),
      j7[us(0x733)](us(0xbc2)),
      j8[us(0x733)](us(0x70e));
    var j9 = [];
    for (let rv = 0x0; rv < j7[us(0x8c2)]; rv++) {
      const rw = d9[j7[rv]] || 0x0;
      j9[rv] = 0x78 + (rw - d9[us(0x547)]) * 0x3c - 0x1 + 0x1;
    }
    function ja(rx) {
      const ry = rx[0x3];
      (rx[0x3] = rx[0x5]), (rx[0x5] = ry);
    }
    var jb = [],
      jc = [];
    function jd(rx) {
      const vW = us,
        ry = j8[rx],
        rz = nN(
          vW(0x9a7) + j7[rx] + vW(0x301) + ry + vW(0x113) + ry + vW(0xda3)
        ),
        rA = rz[vW(0xa02)](vW(0x3b4));
      (j6 = {
        id: rx,
        el: rz,
        state: cT[vW(0xaa8)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rz[vW(0xa02)](vW(0xbb2)),
        progressEl: rA,
        barEl: rA[vW(0xa02)](vW(0x4d3)),
        textEl: rA[vW(0xa02)](vW(0x552)),
        nameEl: rz[vW(0xa02)](vW(0x6b3)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const vX = vW,
            rB = Math[vX(0xbe6)](0x1, (pM - this[vX(0xc40)]) / 0x64);
          this[vX(0x22f)] =
            this[vX(0xbf1)] + (this[vX(0x764)] - this[vX(0xbf1)]) * rB;
          const rC = this[vX(0x22f)] - 0x1;
          this[vX(0x9ec)][vX(0xb14)][vX(0x8cb)] =
            vX(0xcaf) + rC * 0x64 + vX(0x135) + rC + vX(0xb90);
        },
        update() {
          const vY = vW,
            rB = je(this["t"]),
            rC = 0x1 - rB;
          (this["el"][vY(0xb14)][vY(0x975)] = -0xc8 * rC + "px"),
            (this["el"][vY(0xb14)][vY(0x8cb)] = vY(0x63f) + -0x64 * rC + "%)");
        },
        remove() {
          const vZ = vW;
          rz[vZ(0xbc7)]();
        },
      }),
        (j6[vW(0x77b)][vW(0xb14)][vW(0x5ad)] = vW(0xaa8)),
        jc[vW(0x733)](j6),
        j6[vW(0xc2f)](),
        jb[vW(0x733)](j6),
        km[vW(0x865)](rz, pZ);
    }
    function je(rx) {
      return 0x1 - (0x1 - rx) * (0x1 - rx);
    }
    function jf(rx) {
      const w0 = us;
      return rx < 0.5
        ? (0x1 - Math[w0(0xa35)](0x1 - Math[w0(0x168)](0x2 * rx, 0x2))) / 0x2
        : (Math[w0(0xa35)](0x1 - Math[w0(0x168)](-0x2 * rx + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jg() {
      const w1 = us;
      (ox[w1(0xcc2)] = ""), (oz = {});
    }
    var jh = document[us(0xa02)](us(0x803));
    jh[us(0xb14)][us(0x5ad)] = us(0xaa8);
    var ji = document[us(0xa02)](us(0x2c9)),
      jj = [],
      jk = document[us(0xa02)](us(0x35c));
    jk[us(0x1c9)] = function () {
      jl();
    };
    function jl() {
      const w2 = us;
      for (let rx = 0x0; rx < jj[w2(0x8c2)]; rx++) {
        const ry = jj[rx];
        k8(ry[w2(0xbaf)][0x0], jk[w2(0x88f)] ? w2(0xb09) : ry[w2(0x589)]);
      }
    }
    function jm(rx) {
      const w3 = us;
      (jh[w3(0xb14)][w3(0x5ad)] = ""), (ji[w3(0xcc2)] = w3(0x994));
      const ry = rx[w3(0x8c2)];
      jj = [];
      for (let rz = 0x0; rz < ry; rz++) {
        const rA = rx[rz];
        ji[w3(0x75c)](nN(w3(0x563) + (rz + 0x1) + w3(0xa03))), jn(rA);
      }
      m1[w3(0xb82)][w3(0xd69)]();
    }
    function jn(rx) {
      const w4 = us;
      for (let ry = 0x0; ry < rx[w4(0x8c2)]; ry++) {
        const rz = rx[ry],
          rA = nN(w4(0x6f4) + rz + w4(0x1bf));
        (rA[w4(0x589)] = rz),
          ry > 0x0 && jj[w4(0x733)](rA),
          (rA[w4(0x269)] = function () {
            jp(rz);
          }),
          ji[w4(0x75c)](rA);
      }
      jl();
    }
    function jo(rx) {
      const w5 = us;
      var ry = document[w5(0x6be)](w5(0x2e8));
      (ry[w5(0x69c)] = rx),
        (ry[w5(0xb14)][w5(0xdd)] = "0"),
        (ry[w5(0xb14)][w5(0x31e)] = "0"),
        (ry[w5(0xb14)][w5(0xc30)] = w5(0x342)),
        document[w5(0xb87)][w5(0x75c)](ry),
        ry[w5(0x6b8)](),
        ry[w5(0x1a4)]();
      try {
        var rz = document[w5(0x5b3)](w5(0x6a1)),
          rA = rz ? w5(0x711) : w5(0x676);
      } catch (rB) {}
      document[w5(0xb87)][w5(0xc56)](ry);
    }
    function jp(rx) {
      const w6 = us;
      if (!navigator[w6(0x485)]) {
        jo(rx);
        return;
      }
      navigator[w6(0x485)][w6(0x7c9)](rx)[w6(0x715)](
        function () {},
        function (ry) {}
      );
    }
    var jq = [
        us(0x20a),
        us(0x799),
        us(0x368),
        us(0xc27),
        us(0x9c1),
        us(0xd5e),
        us(0xc1b),
        us(0xa85),
        us(0x47e),
        us(0x39e),
        us(0xbce),
      ],
      jr = [us(0x465), us(0x8ac), us(0x51b)];
    function js(rx) {
      const w7 = us,
        ry = rx ? jr : jq;
      return ry[Math[w7(0x815)](Math[w7(0xb7c)]() * ry[w7(0x8c2)])];
    }
    function jt(rx) {
      const w8 = us;
      return rx[w8(0x973)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var ju = document[us(0xa02)](us(0x8af));
    ju[us(0x269)] = nt(function (rx) {
      const w9 = us;
      iy && il(new Uint8Array([cI[w9(0x68d)]]));
    });
    var jv = "";
    function jw(rx) {
      const wa = us;
      return rx[wa(0x9c7)](/"/g, wa(0x6bc));
    }
    function jx(rx) {
      const wb = us;
      let ry = "";
      for (let rz = 0x0; rz < rx[wb(0x8c2)]; rz++) {
        const [rA, rB, rC] = rx[rz];
        ry +=
          wb(0xb39) +
          rA +
          "\x22\x20" +
          (rC ? wb(0x556) : "") +
          wb(0x297) +
          jw(rB) +
          wb(0x63a);
      }
      return wb(0xca0) + ry + wb(0xb81);
    }
    var jy = ![];
    function jz() {
      const wc = us;
      return nN(wc(0xafa) + hP[wc(0x547)] + wc(0x649));
    }
    var jA = document[us(0xa02)](us(0x871));
    function jB() {
      const wd = us;
      (oP[wd(0xb14)][wd(0x5ad)] = pZ[wd(0xb14)][wd(0x5ad)] =
        jy ? wd(0xaa8) : ""),
        (jA[wd(0xb14)][wd(0x5ad)] = ky[wd(0xb14)][wd(0x5ad)] =
          jy ? "" : wd(0xaa8));
      jy
        ? (kz[wd(0x5a4)][wd(0x2b0)](wd(0x27b)),
          k8(kz[wd(0xbaf)][0x0], wd(0xd91)))
        : (kz[wd(0x5a4)][wd(0xbc7)](wd(0x27b)),
          k8(kz[wd(0xbaf)][0x0], wd(0x512)));
      const rx = [hG, mk];
      for (let ry = 0x0; ry < rx[wd(0x8c2)]; ry++) {
        const rz = rx[ry];
        rz[wd(0x5a4)][jy ? wd(0x2b0) : wd(0xbc7)](wd(0xd76)),
          (rz[wd(0xab7)] = jy ? jz : null),
          (rz[wd(0x5aa)] = !![]);
      }
      jC[wd(0xb14)][wd(0x5ad)] = nW[wd(0xb14)][wd(0x5ad)] = jy ? wd(0xaa8) : "";
    }
    var jC = document[us(0xa02)](us(0xb9a)),
      jD = document[us(0xa02)](us(0x3a2)),
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
    function jN(rx, ry) {
      const we = us;
      jM[ry] = (jM[ry] || 0x0) + 0x1;
      if (jM[ry] > 0x8) return ![];
      let rz = 0x0;
      for (let rA = jL[we(0x8c2)] - 0x1; rA >= 0x0; rA--) {
        const rB = jL[rA];
        if (nv(rx, rB) > 0.7) {
          rz++;
          if (rz >= 0x5) return ![];
        }
      }
      return jL[we(0x733)](rx), !![];
    }
    var jO = document[us(0xa02)](us(0x541)),
      jP = document[us(0xa02)](us(0xcd1)),
      jQ = document[us(0xa02)](us(0x7f0)),
      jR = document[us(0xa02)](us(0x634)),
      jS;
    k8(jQ, "-"),
      (jQ[us(0x269)] = function () {
        if (jS) mv(jS);
      });
    var jT = 0x0,
      jU = document[us(0xa02)](us(0xa4a));
    setInterval(() => {
      const wf = us;
      jT--;
      if (jT < 0x0) {
        jU[wf(0x5a4)][wf(0x842)](wf(0xd69)) &&
          hW &&
          il(new Uint8Array([cI[wf(0x111)]]));
        return;
      }
      jV();
    }, 0x3e8);
    function jV() {
      k8(jR, ka(jT * 0x3e8));
    }
    function jW() {
      const wg = us,
        rx = document[wg(0xa02)](wg(0xc0b))[wg(0xbaf)],
        ry = document[wg(0xa02)](wg(0xc8))[wg(0xbaf)];
      for (let rz = 0x0; rz < rx[wg(0x8c2)]; rz++) {
        const rA = rx[rz],
          rB = ry[rz];
        rA[wg(0x269)] = function () {
          const wh = wg;
          for (let rC = 0x0; rC < ry[wh(0x8c2)]; rC++) {
            const rD = rz === rC;
            (ry[rC][wh(0xb14)][wh(0x5ad)] = rD ? "" : wh(0xaa8)),
              rx[rC][wh(0x5a4)][rD ? wh(0x2b0) : wh(0xbc7)](wh(0x453));
          }
        };
      }
      rx[0x0][wg(0x269)]();
    }
    jW();
    var jX = [];
    function jY(rx) {
      const wi = us;
      rx[wi(0x5a4)][wi(0x2b0)](wi(0xafe)), jX[wi(0x733)](rx);
    }
    var jZ,
      k0 = document[us(0xa02)](us(0x4c6));
    function k1(rx, ry = !![]) {
      const wj = us;
      if (ry) {
        if (pM < jG) {
          jH[wj(0x733)](rx);
          return;
        } else {
          if (jH[wj(0x8c2)] > 0x0)
            while (jH[wj(0x8c2)] > 0x0) {
              k1(jH[wj(0x913)](), ![]);
            }
        }
      }
      function rz() {
        const wk = wj,
          rL = rI[wk(0xa0a)](rJ++),
          rM = new Uint8Array(rL);
        for (let rN = 0x0; rN < rL; rN++) {
          rM[rN] = rI[wk(0xa0a)](rJ++);
        }
        return new TextDecoder()[wk(0x6de)](rM);
      }
      function rA() {
        const wl = wj;
        return rI[wl(0xa0a)](rJ++) / 0xff;
      }
      function rB(rL) {
        const wm = wj,
          rM = rI[wm(0x1fb)](rJ);
        (rJ += 0x2),
          (rL[wm(0x23d)] = rM & 0x1),
          (rL[wm(0x35d)] = rM & 0x2),
          (rL[wm(0x618)] = rM & 0x4),
          (rL[wm(0x624)] = rM & 0x8),
          (rL[wm(0x367)] = rM & 0x10),
          (rL[wm(0xc49)] = rM & 0x20),
          (rL[wm(0xb61)] = rM & 0x40),
          (rL[wm(0xb9e)] = rM & 0x80),
          (rL[wm(0x879)] = rM & 0x100),
          (rL[wm(0x521)] = rM & (0x1 << 0x9)),
          (rL[wm(0x1d7)] = rM & (0x1 << 0xa)),
          (rL[wm(0x84b)] = rM & (0x1 << 0xb)),
          (rL[wm(0xdd7)] = rM & (0x1 << 0xc)),
          (rL[wm(0x1f3)] = rM & (0x1 << 0xd)),
          (rL[wm(0x78b)] = rM & (0x1 << 0xe)),
          (rL[wm(0x284)] = rM & (0x1 << 0xf));
      }
      function rC() {
        const wn = wj,
          rL = rI[wn(0xab5)](rJ);
        rJ += 0x4;
        const rM = rz();
        iK(rM, rL);
      }
      function rD() {
        const wo = wj,
          rL = rI[wo(0x1fb)](rJ) - cG;
        return (rJ += 0x2), rL;
      }
      function rE() {
        const wp = wj,
          rL = {};
        for (let rW in mo) {
          (rL[rW] = rI[wp(0xab5)](rJ)), (rJ += 0x4);
        }
        const rM = rz(),
          rN = Number(rI[wp(0x15b)](rJ));
        rJ += 0x8;
        const rO = d5(d4(rN)[0x0]),
          rP = rO * 0x2,
          rQ = Array(rP);
        for (let rX = 0x0; rX < rP; rX++) {
          const rY = rI[wp(0x1fb)](rJ) - 0x1;
          rJ += 0x2;
          if (rY < 0x0) continue;
          rQ[rX] = dC[rY];
        }
        const rR = [],
          rS = rI[wp(0x1fb)](rJ);
        rJ += 0x2;
        for (let rZ = 0x0; rZ < rS; rZ++) {
          const s0 = rI[wp(0x1fb)](rJ);
          rJ += 0x2;
          const s1 = rI[wp(0xab5)](rJ);
          (rJ += 0x4), rR[wp(0x733)]([dC[s0], s1]);
        }
        const rT = [],
          rU = rI[wp(0x1fb)](rJ);
        rJ += 0x2;
        for (let s2 = 0x0; s2 < rU; s2++) {
          const s3 = rI[wp(0x1fb)](rJ);
          (rJ += 0x2), !eK[s3] && console[wp(0xd6f)](s3), rT[wp(0x733)](eK[s3]);
        }
        const rV = rI[wp(0xa0a)](rJ++);
        mt(rM, rL, rR, rT, rN, rQ, rV);
      }
      function rF() {
        const wq = wj,
          rL = Number(rI[wq(0x15b)](rJ));
        return (rJ += 0x8), rL;
      }
      function rG() {
        const wr = wj,
          rL = rI[wr(0xab5)](rJ);
        rJ += 0x4;
        const rM = rI[wr(0xa0a)](rJ++),
          rN = {};
        (rN[wr(0x13a)] = rL), (rN[wr(0x52c)] = {});
        const rO = rN;
        f3[wr(0xaba)]((rQ, rR) => {
          const ws = wr;
          rO[ws(0x52c)][rQ] = [];
          for (let rS = 0x0; rS < rM; rS++) {
            const rT = rz();
            let rU;
            rQ === "xp" ? (rU = rF()) : ((rU = rI[ws(0xab5)](rJ)), (rJ += 0x4)),
              rO[ws(0x52c)][rQ][ws(0x733)]([rT, rU]);
          }
        }),
          k8(jD, k9(rO[wr(0x13a)]) + wr(0x95b)),
          (mA[wr(0xcc2)] = "");
        let rP = 0x0;
        for (let rQ in rO[wr(0x52c)]) {
          const rR = kd(rQ),
            rS = rO[wr(0x52c)][rQ],
            rT = nN(wr(0xa37) + rP + wr(0x8f7) + rR + wr(0x20c)),
            rU = rT[wr(0xa02)](wr(0x88e));
          for (let rV = 0x0; rV < rS[wr(0x8c2)]; rV++) {
            const [rW, rX] = rS[rV];
            let rY = mn(rQ, rX);
            rQ === "xp" && (rY += wr(0xc98) + (d4(rX)[0x0] + 0x1) + ")");
            const rZ = nN(
              wr(0xc6c) + (rV + 0x1) + ".\x20" + rW + wr(0x4f0) + rY + wr(0x41d)
            );
            (rZ[wr(0x269)] = function () {
              mv(rW);
            }),
              rU[wr(0x3d8)](rZ);
          }
          mA[wr(0x3d8)](rT), rP++;
        }
      }
      function rH() {
        const wt = wj;
        (jS = rz()), k8(jQ, jS || "-");
        const rL = Number(rI[wt(0x15b)](rJ));
        (rJ += 0x8),
          (jT = Math[wt(0x2ab)]((rL - Date[wt(0x7c4)]()) / 0x3e8)),
          jV();
        const rM = rI[wt(0x1fb)](rJ);
        rJ += 0x2;
        if (rM === 0x0) jP[wt(0xcc2)] = wt(0xa78);
        else {
          jP[wt(0xcc2)] = "";
          for (let rO = 0x0; rO < rM; rO++) {
            const rP = rz(),
              rQ = rI[wt(0xaf6)](rJ);
            rJ += 0x4;
            const rR = rQ * 0x64,
              rS = rR >= 0x1 ? rR[wt(0x9da)](0x2) : rR[wt(0x9da)](0x5),
              rT = nN(
                wt(0x616) +
                  (rO + 0x1) +
                  ".\x20" +
                  rP +
                  wt(0xacd) +
                  rS +
                  wt(0x37b)
              );
            rP === jv && rT[wt(0x5a4)][wt(0x2b0)]("me"),
              (rT[wt(0x269)] = function () {
                mv(rP);
              }),
              jP[wt(0x75c)](rT);
          }
        }
        k0[wt(0xcc2)] = "";
        const rN = rI[wt(0x1fb)](rJ);
        (rJ += 0x2), (jZ = {});
        if (rN === 0x0)
          (jO[wt(0xcc2)] = wt(0xaf7)), (k0[wt(0xb14)][wt(0x5ad)] = wt(0xaa8));
        else {
          const rU = {};
          jO[wt(0xcc2)] = "";
          for (let rV = 0x0; rV < rN; rV++) {
            const rW = rI[wt(0x1fb)](rJ);
            rJ += 0x2;
            const rX = rI[wt(0xab5)](rJ);
            (rJ += 0x4), (jZ[rW] = rX);
            const rY = dC[rW],
              rZ = nN(
                wt(0xcc7) +
                  rY[wt(0x3b6)] +
                  wt(0xc41) +
                  qx(rY) +
                  wt(0x7e5) +
                  rX +
                  wt(0x169)
              );
            (rZ[wt(0x409)] = jU),
              jY(rZ),
              (rZ[wt(0xab7)] = rY),
              jO[wt(0x75c)](rZ),
              (rU[rY[wt(0x3b6)]] = (rU[rY[wt(0x3b6)]] || 0x0) + rX);
          }
          oa(jO), (k0[wt(0xb14)][wt(0x5ad)] = ""), oB(k0, rU);
        }
      }
      const rI = new DataView(rx[wj(0xa57)]);
      pB += rI[wj(0x4d4)];
      let rJ = 0x0;
      const rK = rI[wj(0xa0a)](rJ++);
      switch (rK) {
        case cI[wj(0x626)]:
          {
            const s6 = rI[wj(0x1fb)](rJ);
            rJ += 0x2;
            for (let s7 = 0x0; s7 < s6; s7++) {
              const s8 = rI[wj(0x1fb)](rJ);
              rJ += 0x2;
              const s9 = rI[wj(0xab5)](rJ);
              (rJ += 0x4), n3(s8, s9);
            }
          }
          break;
        case cI[wj(0xb78)]:
          rH();
          break;
        case cI[wj(0x6e1)]:
          kC[wj(0x5a4)][wj(0x2b0)](wj(0xd69)), hT(), (jG = pM + 0x1f4);
          break;
        case cI[wj(0x43e)]:
          (mi[wj(0xcc2)] = wj(0xa6a)), mi[wj(0x75c)](ml), (mm = ![]);
          break;
        case cI[wj(0xa8b)]: {
          const sa = dC[rI[wj(0x1fb)](rJ)];
          rJ += 0x2;
          const sb = rI[wj(0xab5)](rJ);
          (rJ += 0x4),
            (mi[wj(0xcc2)] =
              wj(0x3fb) +
              sa[wj(0x3b6)] +
              "\x22\x20" +
              qx(sa) +
              wj(0x7e5) +
              k9(sb) +
              wj(0x2c6));
          const sc = mi[wj(0xa02)](wj(0x995));
          (sc[wj(0xab7)] = sa),
            (sc[wj(0x269)] = function () {
              const wu = wj;
              n3(sa["id"], sb), (this[wu(0x269)] = null), ml[wu(0x269)]();
            }),
            (mm = ![]);
          break;
        }
        case cI[wj(0x562)]: {
          const sd = rI[wj(0xa0a)](rJ++),
            se = rI[wj(0xab5)](rJ);
          rJ += 0x4;
          const sf = rz();
          (mi[wj(0xcc2)] =
            wj(0x314) +
            sf +
            wj(0x301) +
            hP[wj(0xb33)] +
            wj(0xff) +
            k9(se) +
            "\x20" +
            hN[sd] +
            wj(0x301) +
            hQ[sd] +
            wj(0x9ab)),
            (mi[wj(0xa02)](wj(0x8e5))[wj(0x269)] = function () {
              mv(sf);
            }),
            mi[wj(0x75c)](ml),
            (mm = ![]);
          break;
        }
        case cI[wj(0x5e6)]:
          (mi[wj(0xcc2)] = wj(0xb03)), mi[wj(0x75c)](ml), (mm = ![]);
          break;
        case cI[wj(0x282)]:
          hK(wj(0xb11));
          break;
        case cI[wj(0xdd2)]:
          rG();
          break;
        case cI[wj(0x4f3)]:
          hK(wj(0xd59)), hc(wj(0xd59));
          break;
        case cI[wj(0x183)]:
          hK(wj(0x2e7)), hc(wj(0x7ef));
          break;
        case cI[wj(0xd7)]:
          hK(wj(0x7e7));
          break;
        case cI[wj(0xc96)]:
          rE();
          break;
        case cI[wj(0xc67)]:
          hc(wj(0xd66));
          break;
        case cI[wj(0x9c4)]:
          hc(wj(0x91c), hP[wj(0xde2)]), hJ(hH);
          break;
        case cI[wj(0xb82)]:
          const rL = rI[wj(0x1fb)](rJ);
          rJ += 0x2;
          const rM = [];
          for (let sg = 0x0; sg < rL; sg++) {
            const sh = rI[wj(0xab5)](rJ);
            rJ += 0x4;
            const si = rz(),
              sj = rz(),
              sk = rz();
            rM[wj(0x733)]([si || wj(0x5e1) + sh, sj, sk]);
          }
          jm(rM);
          break;
        case cI[wj(0xaf)]:
          for (let sl in mo) {
            const sm = rI[wj(0xab5)](rJ);
            (rJ += 0x4), mp[sl][wj(0xb62)](sm);
          }
          break;
        case cI[wj(0x684)]:
          const rN = rI[wj(0xa0a)](rJ++),
            rO = rI[wj(0xab5)](rJ++),
            rP = {};
          (rP[wj(0x7f5)] = rN), (rP[wj(0x309)] = rO), (p0 = rP);
          break;
        case cI[wj(0xcc6)]:
          (i0[wj(0xb14)][wj(0x5ad)] = i6 ? "" : wj(0xaa8)),
            (i3[wj(0xb14)][wj(0x5ad)] = !i6 ? "" : wj(0xaa8)),
            (hY[wj(0xb14)][wj(0x5ad)] = ""),
            (kn[wj(0xb14)][wj(0x5ad)] = wj(0xaa8)),
            (hW = !![]),
            kB[wj(0x5a4)][wj(0x2b0)](wj(0xd69)),
            kA[wj(0x5a4)][wj(0xbc7)](wj(0xd69)),
            j1(),
            m0(![]),
            (ix = rI[wj(0xab5)](rJ)),
            (rJ += 0x4),
            (jv = rz()),
            hack.player.name = jv,
            hJ(jv),
            (jy = rI[wj(0xa0a)](rJ++)),
            jB(),
            (j2 = rI[wj(0x1fb)](rJ)),
            (rJ += 0x2),
            (j5 = rI[wj(0xa0a)](rJ++)),
            (j4 = j2 / j5),
            (j3 = j2 / 0x3),
            (oD = rF()),
            oN(),
            oQ(),
            (iN = d5(oE)),
            (iO = iN * 0x2),
            (iP = Array(iO)),
            (iQ = {}),
            (iR = d7());
          for (let sn = 0x0; sn < iO; sn++) {
            const so = rI[wj(0x1fb)](rJ) - 0x1;
            rJ += 0x2;
            if (so < 0x0) continue;
            iP[sn] = dC[so];
          }
          nI(), nQ();
          const rQ = rI[wj(0x1fb)](rJ);
          rJ += 0x2;
          for (let sp = 0x0; sp < rQ; sp++) {
            const sq = rI[wj(0x1fb)](rJ);
            rJ += 0x2;
            const sr = nS(eK[sq]);
            sr[wj(0x409)] = m2;
          }
          iS = {};
          while (rJ < rI[wj(0x4d4)]) {
            const ss = rI[wj(0x1fb)](rJ);
            rJ += 0x2;
            const st = rI[wj(0xab5)](rJ);
            (rJ += 0x4), (iS[ss] = st);
          }
          o8(), n4();
          break;
        case cI[wj(0x369)]:
          const rR = rI[wj(0xa0a)](rJ++),
            rS = hL[rR] || wj(0x4c9);
          console[wj(0xd6f)](wj(0x19c) + rS + ")"),
            (kf = rR === cR[wj(0x492)] || rR === cR[wj(0xddb)]);
          !kf &&
            it(wj(0x316), wj(0x143) + rS, rR === cR[wj(0xe4)] ? 0xa : 0x3c);
          break;
        case cI[wj(0x5b0)]:
          (hg[wj(0xb14)][wj(0x5ad)] = kn[wj(0xb14)][wj(0x5ad)] = wj(0xaa8)),
            kG(!![]),
            ju[wj(0x5a4)][wj(0x2b0)](wj(0xd69)),
            jg(),
            (pf[wj(0xb14)][wj(0x5ad)] = "");
          for (let su in iQ) {
            iQ[su][wj(0x1c6)] = 0x0;
          }
          (jI = pM),
            (nl = {}),
            (nd = 0x1),
            (ne = 0x1),
            (nb = 0x0),
            (nc = 0x0),
            mE(),
            (n8 = cY[wj(0xc8e)]),
            (jE = pM);
          break;
        case cI[wj(0xc2f)]:
          (pA = pM - jE), (jE = pM), q6[wj(0xb62)](rA()), q8[wj(0xb62)](rA());
          if (jy) {
            const sv = rI[wj(0xa0a)](rJ++);
            (jJ = sv & 0x80), (jK = f6[sv & 0x7f]);
          } else (jJ = ![]), (jK = null), q9[wj(0xb62)](rA());
          (pH = 0x1 + cW[rI[wj(0xa0a)](rJ++)] / 0x64),
            (iW = (d0 / 0x2) * pH),
            (iX = (d1 / 0x2) * pH);
          const rT = rI[wj(0x1fb)](rJ);
          rJ += 0x2;
          for (let sw = 0x0; sw < rT; sw++) {
            const sx = rI[wj(0xab5)](rJ);
            rJ += 0x4;
            let sy = iv[sx];
            if (sy) {
              if (sy[wj(0x1fe)]) {
                sy[wj(0xaea)] = rI[wj(0xa0a)](rJ++) - 0x1;
                continue;
              }
              const sz = rI[wj(0xa0a)](rJ++);
              sz & 0x1 &&
                ((sy["nx"] = rD()), (sy["ny"] = rD()), (sy[wj(0xc7)] = 0x0));
              sz & 0x2 &&
                ((sy[wj(0x575)] = eS(rI[wj(0xa0a)](rJ++))),
                (sy[wj(0xc7)] = 0x0));
              if (sz & 0x4) {
                const sA = rA();
                if (sA < sy[wj(0xb24)]) iT(sy, sA), (sy[wj(0x7b9)] = 0x1);
                else sA > sy[wj(0xb24)] && (sy[wj(0x7b9)] = 0x0);
                (sy[wj(0xb24)] = sA), (sy[wj(0xc7)] = 0x0);
              }
              sz & 0x8 &&
                ((sy[wj(0x6d3)] = 0x1),
                (sy[wj(0xc7)] = 0x0),
                sy === iy && (ps = 0x1));
              sz & 0x10 && ((sy[wj(0xb3a)] = rI[wj(0x1fb)](rJ)), (rJ += 0x2));
              sz & 0x20 && (sy[wj(0xa7b)] = rI[wj(0xa0a)](rJ++));
              sz & 0x40 && rB(sy);
              if (sz & 0x80) {
                if (sy[wj(0x6b9)])
                  (sy[wj(0x29c)] = rI[wj(0x1fb)](rJ)), (rJ += 0x2);
                else {
                  const sB = rA();
                  sB > sy[wj(0xa17)] && iT(sy), (sy[wj(0xa17)] = sB);
                }
              }
              sy[wj(0x6b9)] && sz & 0x4 && (sy[wj(0xc59)] = rA()),
                (sy["ox"] = sy["x"]),
                (sy["oy"] = sy["y"]),
                (sy[wj(0x93f)] = sy[wj(0x4c3)]),
                (sy[wj(0xa4e)] = sy[wj(0x3ab)]),
                (sy[wj(0x1a2)] = sy[wj(0xc60)]),
                (sy[wj(0xddd)] = 0x0);
            } else {
              const sC = rI[wj(0xa0a)](rJ++);
              if (sC === cS[wj(0x753)]) {
                let sH = rI[wj(0xa0a)](rJ++);
                const sI = {};
                (sI[wj(0xa30)] = []), (sI["a"] = 0x1);
                const sJ = sI;
                while (sH--) {
                  const sK = rD(),
                    sL = rD();
                  sJ[wj(0xa30)][wj(0x733)]([sK, sL]);
                }
                iM(sJ), (ps = 0x1), iF[wj(0x733)](sJ);
                continue;
              }
              const sD = hM[sC],
                sE = rD(),
                sF = rD(),
                sG = sC === cS[wj(0xad7)];
              if (sC === cS[wj(0x12b)] || sC === cS[wj(0x87b)] || sG) {
                const sM = rI[wj(0x1fb)](rJ);
                (rJ += 0x2),
                  (sy = new lK(sC, sx, sE, sF, sM)),
                  sG &&
                    ((sy[wj(0x1fe)] = !![]),
                    (sy[wj(0xaea)] = rI[wj(0xa0a)](rJ++) - 0x1));
              } else {
                if (sC === cS[wj(0xb40)]) {
                  const sN = rI[wj(0x1fb)](rJ);
                  (rJ += 0x2), (sy = new lN(sx, sE, sF, sN));
                } else {
                  const sO = eS(rI[wj(0xa0a)](rJ++)),
                    sP = rI[wj(0x1fb)](rJ);
                  rJ += 0x2;
                  if (sC === cS[wj(0x5b6)]) {
                    const sQ = rA(),
                      sR = rI[wj(0xa0a)](rJ++);
                    (sy = new lT(sx, sE, sF, sO, sQ, sR, sP)),
                      rB(sy),
                      (sy[wj(0x29c)] = rI[wj(0x1fb)](rJ)),
                      (rJ += 0x2),
                      (sy[wj(0x324)] = rz()),
                      (sy[wj(0x557)] = rz()),
                      (sy[wj(0xc59)] = rA());
                    if (ix === sx) iy = sy;
                    else {
                      if (jy) {
                        const sS = pS();
                        (sS[wj(0x4ab)] = sy), pK[wj(0x733)](sS);
                      }
                    }
                  } else {
                    if (sD[wj(0x439)](wj(0xab7)))
                      sy = new lG(sx, sC, sE, sF, sO, sP);
                    else {
                      const sT = rA(),
                        sU = rI[wj(0xa0a)](rJ++),
                        sV = sU >> 0x4,
                        sW = sU & 0x1,
                        sX = sU & 0x2,
                        sY = rA();
                      (sy = new lG(sx, sC, sE, sF, sO, sP, sT)),
                        (sy[wj(0x3b6)] = sV),
                        (sy[wj(0x52a)] = sW),
                        (sy[wj(0x78b)] = sX),
                        (sy[wj(0xa17)] = sY),
                        (sy[wj(0x110)] = hN[sV]);
                    }
                  }
                }
              }
              (iv[sx] = sy), iw[wj(0x733)](sy);
            }
          }
          iy &&
            ((iU = iy["nx"]),
            (iV = iy["ny"]),
            (q1[wj(0xb14)][wj(0x5ad)] = ""),
            q3(q1, iy["nx"], iy["ny"]));
          const rU = rI[wj(0x1fb)](rJ);
          rJ += 0x2;
          for (let sZ = 0x0; sZ < rU; sZ++) {
            const t0 = rI[wj(0xab5)](rJ);
            (rJ += 0x4), iY(t0);
          }
          const rV = rI[wj(0xa0a)](rJ++);
          for (let t1 = 0x0; t1 < rV; t1++) {
            const t2 = rI[wj(0xab5)](rJ);
            rJ += 0x4;
            const t3 = iv[t2];
            if (t3) {
              (t3[wj(0x37c)] = iy), n3(t3[wj(0xab7)]["id"], 0x1), iY(t2);
              if (!oz[t3[wj(0xab7)]["id"]]) oz[t3[wj(0xab7)]["id"]] = 0x0;
              oz[t3[wj(0xab7)]["id"]]++;
            }
          }
          const rW = rI[wj(0xa0a)](rJ++);
          for (let t4 = 0x0; t4 < rW; t4++) {
            const t5 = rI[wj(0xa0a)](rJ++),
              t6 = rA(),
              t7 = iQ[t5];
            (t7[wj(0x89e)] = t6), t6 === 0x0 && (t7[wj(0x1c6)] = 0x0);
          }
          (iI = rI[wj(0x1fb)](rJ)), (rJ += 0x2);
          const rX = rI[wj(0x1fb)](rJ);
          (rJ += 0x2),
            iE[wj(0x7ea)](
              wj(0x130),
              kh(iI, wj(0x381)) + ",\x20" + kh(rX, wj(0xd47))
            );
          const rY = Math[wj(0xbe6)](0xa, iI);
          if (iH) {
            const t8 = rI[wj(0xa0a)](rJ++),
              t9 = t8 >> 0x4,
              ta = t8 & 0xf,
              tb = rI[wj(0xa0a)](rJ++);
            for (let td = 0x0; td < ta; td++) {
              const te = rI[wj(0xa0a)](rJ++);
              (iG[te][wj(0x882)] = rI[wj(0xab5)](rJ)), (rJ += 0x4);
            }
            const tc = [];
            for (let tf = 0x0; tf < tb; tf++) {
              tc[wj(0x733)](rI[wj(0xa0a)](rJ++));
            }
            tc[wj(0x242)](function (tg, th) {
              return th - tg;
            });
            for (let tg = 0x0; tg < tb; tg++) {
              const th = tc[tg];
              iG[th]["el"][wj(0xbc7)](), iG[wj(0x34a)](th, 0x1);
            }
            for (let ti = 0x0; ti < t9; ti++) {
              rC();
            }
            iG[wj(0x242)](function (tj, tk) {
              const wv = wj;
              return tk[wv(0x882)] - tj[wv(0x882)];
            });
          } else {
            iG[wj(0x8c2)] = 0x0;
            for (let tj = 0x0; tj < rY; tj++) {
              rC();
            }
            iH = !![];
          }
          iL();
          const rZ = rI[wj(0xa0a)](rJ++);
          for (let tk = 0x0; tk < rZ; tk++) {
            const tl = rI[wj(0x1fb)](rJ);
            (rJ += 0x2), nS(eK[tl]);
          }
          const s0 = rI[wj(0x1fb)](rJ);
          rJ += 0x2;
          for (let tm = 0x0; tm < s0; tm++) {
            const tn = rI[wj(0xa0a)](rJ++),
              to = tn >> 0x7,
              tp = tn & 0x7f;
            if (tp === cQ[wj(0xbdc)]) {
              const tt = rI[wj(0xa0a)](rJ++),
                tu = rI[wj(0xa0a)](rJ++) - 0x1;
              let tv = null,
                tw = 0x0;
              if (to) {
                const ty = rI[wj(0xab5)](rJ);
                rJ += 0x4;
                const tz = rz();
                (tv = tz || wj(0x5e1) + ty), (tw = rI[wj(0xa0a)](rJ++));
              }
              const tx = j8[tt];
              nj(
                wj(0xbdc),
                null,
                "⚡\x20" +
                  j7[tt] +
                  wj(0xb85) +
                  (tu < 0x0
                    ? wj(0xa2b)
                    : tu === 0x0
                    ? wj(0xcef)
                    : wj(0x3ad) + (tu + 0x1) + "!"),
                tx
              );
              tv &&
                ni(wj(0xbdc), [
                  [wj(0x18c), "🏆"],
                  [tx, tv + wj(0xcd4)],
                  [hP[wj(0x547)], tw + wj(0xad5)],
                  [tx, wj(0x458)],
                ]);
              continue;
            }
            const tq = rI[wj(0xab5)](rJ);
            rJ += 0x4;
            const tr = rz(),
              ts = tr || wj(0x5e1) + tq;
            if (tp === cQ[wj(0x174)]) {
              let tA = rz();
              p8[wj(0xa6c)] && (tA = fb(tA));
              if (jN(tA, tq)) nj(tq, ts, tA, tq === ix ? ng["me"] : void 0x0);
              else tq === ix && nj(-0x1, null, wj(0x1c7), ng[wj(0x26e)]);
            } else {
              if (tp === cQ[wj(0x684)]) {
                const tB = rI[wj(0x1fb)](rJ);
                rJ += 0x2;
                const tC = rI[wj(0xab5)](rJ);
                rJ += 0x4;
                const tD = rI[wj(0xab5)](rJ);
                rJ += 0x4;
                const tE = dC[tB],
                  tF = hN[tE[wj(0x3b6)]],
                  tG = hN[tE[wj(0x3f8)][wj(0x3b6)]],
                  tH = tD === 0x0;
                if (tH)
                  ni(wj(0x684), [
                    [ng[wj(0xbc9)], ts, !![]],
                    [ng[wj(0xbc9)], wj(0x311)],
                    [
                      hQ[tE[wj(0x3b6)]],
                      k9(tC) + "\x20" + tF + "\x20" + tE[wj(0x703)],
                    ],
                  ]);
                else {
                  const tI = hQ[tE[wj(0x3f8)][wj(0x3b6)]];
                  ni(wj(0x684), [
                    [tI, "⭐"],
                    [tI, ts, !![]],
                    [tI, wj(0xb8a)],
                    [
                      tI,
                      k9(tD) +
                        "\x20" +
                        tG +
                        "\x20" +
                        tE[wj(0x703)] +
                        wj(0xbde) +
                        k9(tC) +
                        "\x20" +
                        tF +
                        "\x20" +
                        tE[wj(0x703)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tJ = rI[wj(0x1fb)](rJ);
                rJ += 0x2;
                const tK = eK[tJ],
                  tL = hN[tK[wj(0x3b6)]],
                  tM = tp === cQ[wj(0xdaf)],
                  tN = hQ[tK[wj(0x3b6)]];
                ni(wj(0xda1), [
                  [
                    tN,
                    "" +
                      (tM ? wj(0x3b3) : "") +
                      jt(tL) +
                      "\x20" +
                      tL +
                      "\x20" +
                      tK[wj(0x703)] +
                      wj(0x2d8) +
                      js(tM) +
                      wj(0x26c),
                  ],
                  [tN, ts + "!", !![]],
                ]);
              }
            }
          }
          const s1 = rI[wj(0xa0a)](rJ++),
            s2 = s1 & 0xf,
            s3 = s1 >> 0x4;
          let s4 = ![];
          s2 !== j6["id"] &&
            (j6 && (j6[wj(0x43b)] = !![]),
            (s4 = !![]),
            jd(s2),
            k8(q7, wj(0x1a8) + j9[s2] + wj(0x9a0)));
          const s5 = rI[wj(0xa0a)](rJ++);
          if (s5 > 0x0) {
            let tO = ![];
            for (let tP = 0x0; tP < s5; tP++) {
              const tQ = rI[wj(0x1fb)](rJ);
              rJ += 0x2;
              const tR = rI[wj(0x1fb)](rJ);
              (rJ += 0x2), (j6[tQ] = tR);
              if (tR > 0x0) {
                if (!j6[wj(0x13b)][tQ]) {
                  tO = !![];
                  const tS = nS(eK[tQ], !![]);
                  (tS[wj(0x5aa)] = !![]),
                    (tS[wj(0x41a)] = ![]),
                    tS[wj(0x5a4)][wj(0xbc7)](wj(0x9ed)),
                    (tS[wj(0xb51)] = nN(wj(0xd80))),
                    tS[wj(0x75c)](tS[wj(0xb51)]),
                    (tS[wj(0xc18)] = tQ);
                  let tT = -0x1;
                  (tS["t"] = s4 ? 0x1 : 0x0),
                    (tS[wj(0x43b)] = ![]),
                    (tS[wj(0x560)] = 0x3e8),
                    (tS[wj(0xc2f)] = function () {
                      const ww = wj,
                        tU = tS["t"];
                      if (tU === tT) return;
                      tT = tU;
                      const tV = jf(Math[ww(0xbe6)](0x1, tU / 0.5)),
                        tW = jf(
                          Math[ww(0xdb0)](
                            0x0,
                            Math[ww(0xbe6)]((tU - 0.5) / 0.5)
                          )
                        );
                      (tS[ww(0xb14)][ww(0x8cb)] =
                        ww(0x83b) + -0x168 * (0x1 - tW) + ww(0x951) + tW + ")"),
                        (tS[ww(0xb14)][ww(0xa62)] = -1.12 * (0x1 - tV) + "em");
                    }),
                    jb[wj(0x733)](tS),
                    j6[wj(0x12e)][wj(0x75c)](tS),
                    (j6[wj(0x13b)][tQ] = tS);
                }
                p2(j6[wj(0x13b)][tQ][wj(0xb51)], tR);
              } else {
                const tU = j6[wj(0x13b)][tQ];
                tU && ((tU[wj(0x43b)] = !![]), delete j6[wj(0x13b)][tQ]),
                  delete j6[tQ];
              }
            }
            tO &&
              [...j6[wj(0x12e)][wj(0xbaf)]]
                [wj(0x242)]((tV, tW) => {
                  const wx = wj;
                  return -ob(eK[tV[wx(0xc18)]], eK[tW[wx(0xc18)]]);
                })
                [wj(0xaba)]((tV) => {
                  const wy = wj;
                  j6[wy(0x12e)][wy(0x75c)](tV);
                });
          }
          (j6[wj(0xc40)] = pM), (j6[wj(0x4c0)] = s3);
          if (s3 !== cT[wj(0xaa8)]) {
            (j6[wj(0x77b)][wj(0xb14)][wj(0x5ad)] = ""),
              (j6[wj(0xbf1)] = j6[wj(0x22f)]),
              (j6[wj(0x764)] = rA());
            if (j6[wj(0xdac)] !== jJ) {
              const tV = jJ ? wj(0x2b0) : wj(0xbc7);
              j6[wj(0x9ec)][wj(0x5a4)][tV](wj(0x3c4)),
                j6[wj(0x9ec)][wj(0x5a4)][tV](wj(0x8a9)),
                j6[wj(0xd31)][wj(0x5a4)][tV](wj(0x504)),
                (j6[wj(0xdac)] = jJ);
            }
            switch (s3) {
              case cT[wj(0xb8b)]:
                k8(j6[wj(0x726)], wj(0x942));
                break;
              case cT[wj(0xbdc)]:
                const tW = rI[wj(0xa0a)](rJ++) + 0x1;
                k8(j6[wj(0x726)], wj(0x6d6) + tW);
                break;
              case cT[wj(0x347)]:
                k8(j6[wj(0x726)], wj(0x307));
                break;
              case cT[wj(0x406)]:
                k8(j6[wj(0x726)], wj(0xc19));
                break;
              case cT[wj(0xa8d)]:
                k8(j6[wj(0x726)], wj(0xc7f));
                break;
            }
          } else j6[wj(0x77b)][wj(0xb14)][wj(0x5ad)] = wj(0xaa8);
          if (rI[wj(0x4d4)] - rJ > 0x0) {
            iy &&
              (j0(qq),
              (qq[wj(0x84b)] = ![]),
              (q2[wj(0xb14)][wj(0x5ad)] = ""),
              (q1[wj(0xb14)][wj(0x5ad)] = wj(0xaa8)),
              q3(q2, iy["nx"], iy["ny"]));
            qr[wj(0x872)](), (iy = null), ju[wj(0x5a4)][wj(0xbc7)](wj(0xd69));
            const tX = rI[wj(0x1fb)](rJ) - 0x1;
            rJ += 0x2;
            const tY = rI[wj(0xab5)](rJ);
            rJ += 0x4;
            const tZ = rI[wj(0xab5)](rJ);
            rJ += 0x4;
            const u0 = rI[wj(0xab5)](rJ);
            rJ += 0x4;
            const u1 = rI[wj(0xab5)](rJ);
            (rJ += 0x4),
              k8(k3, ka(tZ)),
              k8(k2, k9(tY)),
              k8(k4, k9(u0)),
              k8(k6, k9(u1));
            let u2 = null;
            rI[wj(0x4d4)] - rJ > 0x0 && ((u2 = rI[wj(0xab5)](rJ)), (rJ += 0x4));
            u2 !== null
              ? (k8(k7, k9(u2)), (k7[wj(0x89c)][wj(0xb14)][wj(0x5ad)] = ""))
              : (k7[wj(0x89c)][wj(0xb14)][wj(0x5ad)] = wj(0xaa8));
            if (tX === -0x1) k8(k5, wj(0x957));
            else {
              const u3 = eK[tX];
              k8(k5, hN[u3[wj(0x3b6)]] + "\x20" + u3[wj(0x703)]);
            }
            oA(), (oz = {}), (kn[wj(0xb14)][wj(0x5ad)] = ""), hi();
          }
          break;
        default:
          console[wj(0xd6f)](wj(0xb10) + rK);
      }
    }
    var k2 = document[us(0xa02)](us(0xd94)),
      k3 = document[us(0xa02)](us(0xd5d)),
      k4 = document[us(0xa02)](us(0x444)),
      k5 = document[us(0xa02)](us(0xf1)),
      k6 = document[us(0xa02)](us(0x5c0)),
      k7 = document[us(0xa02)](us(0x286));
    function k8(rx, ry) {
      const wz = us;
      rx[wz(0x7ea)](wz(0x130), ry);
    }
    function k9(rx) {
      const wA = us;
      return rx[wA(0xbae)](wA(0xcd6));
    }
    function ka(rx, ry) {
      const wB = us,
        rz = [
          Math[wB(0x815)](rx / (0x3e8 * 0x3c * 0x3c)),
          Math[wB(0x815)]((rx % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wB(0x815)]((rx % (0x3e8 * 0x3c)) / 0x3e8),
        ],
        rA = ["h", "m", "s"];
      let rB = "";
      const rC = ry ? 0x1 : 0x2;
      for (let rD = 0x0; rD <= rC; rD++) {
        const rE = rz[rD];
        (rE > 0x0 || rD == rC) && (rB += rE + rA[rD] + "\x20");
      }
      return rB;
    }
    const kb = {
      [cS[us(0x4a1)]]: us(0xbe9),
      [cS[us(0x884)]]: us(0xaa1),
      [cS[us(0x49e)]]: us(0xaa1),
      [cS[us(0x833)]]: us(0x677),
      [cS[us(0x8c5)]]: us(0x677),
      [cS[us(0xb6f)]]: us(0xcfd),
      [cS[us(0x839)]]: us(0xcfd),
      [cS[us(0xc4)]]: us(0x82c),
      [cS[us(0xd7b)]]: us(0x69a),
    };
    kb["0"] = us(0x957);
    var kc = kb;
    for (let rx in cS) {
      const ry = cS[rx];
      if (kc[ry]) continue;
      const rz = kd(rx);
      kc[ry] = rz[us(0x9c7)](us(0x5be), us(0xb0a));
    }
    function kd(rA) {
      const wC = us,
        rB = rA[wC(0x9c7)](/([A-Z])/g, wC(0xcff)),
        rC = rB[wC(0x8bc)](0x0)[wC(0xcd8)]() + rB[wC(0xba3)](0x1);
      return rC;
    }
    var ke = null,
      kf = !![];
    function kg() {
      const wD = us;
      console[wD(0xd6f)](wD(0xcce)),
        hT(),
        ju[wD(0x5a4)][wD(0xbc7)](wD(0xd69)),
        kf &&
          (kk[wD(0xb14)][wD(0x5ad)] === wD(0xaa8)
            ? (clearTimeout(ke),
              kC[wD(0x5a4)][wD(0x2b0)](wD(0xd69)),
              (ke = setTimeout(function () {
                const wE = wD;
                kC[wE(0x5a4)][wE(0xbc7)](wE(0xd69)),
                  (kk[wE(0xb14)][wE(0x5ad)] = ""),
                  kB[wE(0x84d)](ko),
                  (kn[wE(0xb14)][wE(0x5ad)] = km[wE(0xb14)][wE(0x5ad)] =
                    wE(0xaa8)),
                  hi(),
                  hV(hU[wE(0xcb)]);
              }, 0x1f4)))
            : (kC[wD(0x5a4)][wD(0xbc7)](wD(0xd69)), hV(hU[wD(0xcb)])));
    }
    function kh(rA, rB) {
      return rA + "\x20" + rB + (rA === 0x1 ? "" : "s");
    }
    var ki = document[us(0x3cd)](us(0x9b5)),
      kj = ki[us(0xad8)]("2d"),
      kk = document[us(0xa02)](us(0xde3)),
      kl = document[us(0xa02)](us(0xdb6)),
      km = document[us(0xa02)](us(0x42b));
    km[us(0xb14)][us(0x5ad)] = us(0xaa8);
    var kn = document[us(0xa02)](us(0xb26));
    kn[us(0xb14)][us(0x5ad)] = us(0xaa8);
    var ko = document[us(0xa02)](us(0x33c)),
      kp = document[us(0xa02)](us(0x8ef)),
      kq = document[us(0xa02)](us(0xc10));
    function kr() {
      const wF = us;
      kq[wF(0xcc2)] = "";
      for (let rA = 0x0; rA < 0x32; rA++) {
        const rB = ks[rA],
          rC = nN(wF(0x3e2) + rA + wF(0xa54)),
          rD = rC[wF(0xa02)](wF(0x551));
        if (rB)
          for (let rE = 0x0; rE < rB[wF(0x8c2)]; rE++) {
            const rF = rB[rE],
              rG = dF[rF];
            if (!rG) rD[wF(0x75c)](nN(wF(0xbdf)));
            else {
              const rH = nN(
                wF(0xcc7) + rG[wF(0x3b6)] + "\x22\x20" + qx(rG) + wF(0xb5f)
              );
              (rH[wF(0xab7)] = rG),
                (rH[wF(0x409)] = kp),
                jY(rH),
                rD[wF(0x75c)](rH);
            }
          }
        else rD[wF(0xcc2)] = wF(0xbdf)[wF(0x513)](0x5);
        (rC[wF(0xa02)](wF(0x1c3))[wF(0x269)] = function () {
          ku(rA);
        }),
          (rC[wF(0xa02)](wF(0x19d))[wF(0x269)] = function () {
            kx(rA);
          }),
          kq[wF(0x75c)](rC);
      }
    }
    var ks = kt();
    function kt() {
      const wG = us;
      try {
        const rA = JSON[wG(0xae6)](hD[wG(0x96a)]);
        for (const rB in rA) {
          !Array[wG(0xc9c)](rA[rB]) && delete rA[rB];
        }
        return rA;
      } catch {
        return {};
      }
    }
    function ku(rA) {
      const wH = us,
        rB = [],
        rC = nx[wH(0xbb9)](wH(0xba6));
      for (let rD = 0x0; rD < rC[wH(0x8c2)]; rD++) {
        const rE = rC[rD],
          rF = rE[wH(0xbaf)][0x0];
        !rF ? (rB[rD] = null) : (rB[rD] = rF[wH(0xab7)][wH(0xcda)]);
      }
      (ks[rA] = rB),
        (hD[wH(0x96a)] = JSON[wH(0x1e2)](ks)),
        kr(),
        hc(wH(0x2d6) + rA + "!");
    }
    function kv() {
      const wI = us;
      return nx[wI(0xbb9)](wI(0xba6));
    }
    document[us(0xa02)](us(0xd08))[us(0x269)] = function () {
      kw();
    };
    function kw() {
      const wJ = us,
        rA = kv();
      for (const rB of rA) {
        const rC = rB[wJ(0xbaf)][0x0];
        if (!rC) continue;
        rC[wJ(0xbc7)](),
          iR[wJ(0x733)](rC[wJ(0xba7)]),
          n3(rC[wJ(0xab7)]["id"], 0x1),
          il(new Uint8Array([cI[wJ(0xa1e)], rB[wJ(0x46a)]]));
      }
    }
    function kx(rA) {
      const wK = us;
      if (mI || mH[wK(0x8c2)] > 0x0) return;
      const rB = ks[rA];
      if (!rB) return;
      kw();
      const rC = kv(),
        rD = Math[wK(0xbe6)](rC[wK(0x8c2)], rB[wK(0x8c2)]);
      for (let rE = 0x0; rE < rD; rE++) {
        const rF = rB[rE],
          rG = dF[rF];
        if (!rG || !iS[rG["id"]]) continue;
        const rH = nN(
          wK(0xcc7) + rG[wK(0x3b6)] + "\x22\x20" + qx(rG) + wK(0xb5f)
        );
        (rH[wK(0xab7)] = rG),
          (rH[wK(0x1b6)] = !![]),
          (rH[wK(0xba7)] = iR[wK(0xb25)]()),
          nM(rH, rG),
          (iQ[rH[wK(0xba7)]] = rH),
          rC[rE][wK(0x75c)](rH),
          n3(rH[wK(0xab7)]["id"], -0x1);
        const rI = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rI[wK(0xbb6)](0x0, cI[wK(0x160)]),
          rI[wK(0x945)](0x1, rH[wK(0xab7)]["id"]),
          rI[wK(0xbb6)](0x3, rE),
          il(rI);
      }
      hc(wK(0x6e4) + rA + "!");
    }
    var ky = document[us(0xa02)](us(0xcc4)),
      kz = document[us(0xa02)](us(0x64d));
    kz[us(0x269)] = function () {
      const wL = us;
      kC[wL(0x5a4)][wL(0x2b0)](wL(0xd69)),
        jy
          ? (ke = setTimeout(function () {
              const wM = wL;
              il(new Uint8Array([cI[wM(0x68d)]]));
            }, 0x1f4))
          : (ke = setTimeout(function () {
              const wN = wL;
              kC[wN(0x5a4)][wN(0xbc7)](wN(0xd69)),
                (km[wN(0xb14)][wN(0x5ad)] = kn[wN(0xb14)][wN(0x5ad)] =
                  wN(0xaa8)),
                (kk[wN(0xb14)][wN(0x5ad)] = ""),
                kB[wN(0x84d)](ko),
                kB[wN(0x5a4)][wN(0x2b0)](wN(0xd69)),
                jg();
            }, 0x1f4));
    };
    var kA = document[us(0xa02)](us(0x58c)),
      kB = document[us(0xa02)](us(0x2b2));
    kB[us(0x5a4)][us(0x2b0)](us(0xd69));
    var kC = document[us(0xa02)](us(0x1cb)),
      kD = document[us(0xa02)](us(0xae9)),
      kE = document[us(0xa02)](us(0x161));
    (kE[us(0x69c)] = hD[us(0x603)] || ""),
      (kE[us(0xae3)] = cK),
      (kE[us(0x4d8)] = function () {
        const wO = us;
        hD[wO(0x603)] = this[wO(0x69c)];
      });
    var kF;
    kD[us(0x269)] = function () {
      if (!hW) return;
      kG();
    };
    function kG(rA = ![]) {
      const wP = us;
      hack.chatFunc = hK;
      hack.toastFunc = hc;
      if(rA) hack.onload();
      hack.moblst = eO;
      if (kk[wP(0xb14)][wP(0x5ad)] === wP(0xaa8)) {
        kC[wP(0x5a4)][wP(0xbc7)](wP(0xd69));
        return;
      }
      clearTimeout(kF),
        kB[wP(0x5a4)][wP(0xbc7)](wP(0xd69)),
        (kF = setTimeout(() => {
          const wQ = wP;
          kC[wQ(0x5a4)][wQ(0x2b0)](wQ(0xd69)),
            (kF = setTimeout(() => {
              const wR = wQ;
              rA && kC[wR(0x5a4)][wR(0xbc7)](wR(0xd69)),
                (kk[wR(0xb14)][wR(0x5ad)] = wR(0xaa8)),
                (hg[wR(0xb14)][wR(0x5ad)] = wR(0xaa8)),
                (km[wR(0xb14)][wR(0x5ad)] = ""),
                km[wR(0x75c)](ko),
                iq(kE[wR(0x69c)][wR(0xba3)](0x0, cK));
            }, 0x1f4));
        }, 0x64));
    }
    var kH = document[us(0xa02)](us(0x70d));
    function kI(rA, rB, rC) {
      const wS = us,
        rD = {};
      (rD[wS(0x9fe)] = wS(0x6f2)), (rD[wS(0x5a2)] = !![]), (rC = rC || rD);
      const rE = nN(
        wS(0xd2e) +
          rC[wS(0x9fe)] +
          wS(0xad) +
          rA +
          wS(0x897) +
          (rC[wS(0x5a2)] ? wS(0xcdb) : "") +
          wS(0xc91)
      );
      return (
        (rE[wS(0xa02)](wS(0xb06))[wS(0x269)] = function () {
          const wT = wS;
          rB(!![]), rE[wT(0xbc7)]();
        }),
        (rE[wS(0xa02)](wS(0xb2b))[wS(0x269)] = function () {
          const wU = wS;
          rE[wU(0xbc7)](), rB(![]);
        }),
        kH[wS(0x75c)](rE),
        rE
      );
    }
    function kJ() {
      function rA(rI, rJ, rK, rL, rM) {
        return rD(rL - 0x20c, rK);
      }
      function rB() {
        const wV = b,
          rI = [
            wV(0x56b),
            wV(0xa75),
            wV(0xb46),
            wV(0x9ea),
            wV(0x308),
            wV(0xc09),
            wV(0xb2a),
            wV(0x3b0),
            wV(0x59c),
            wV(0xb6a),
            wV(0x1ff),
            wV(0x3e6),
            wV(0x9eb),
            wV(0x73b),
            wV(0x927),
            wV(0x457),
            wV(0x1db),
            wV(0x7d7),
            wV(0x56a),
            wV(0xd36),
            wV(0xabb),
            wV(0x572),
            wV(0x337),
            wV(0x3c3),
            wV(0x129),
            wV(0xab7),
            wV(0xc50),
            wV(0xa40),
            wV(0x65c),
            wV(0xa2f),
            wV(0xaf9),
            wV(0x303),
            wV(0x4cf),
            wV(0xac1),
            wV(0xc69),
            wV(0x3e8),
            wV(0x9e7),
            wV(0x91a),
            wV(0x430),
            wV(0xc80),
            wV(0x9a3),
            wV(0x695),
            wV(0xa59),
            wV(0xbea),
            wV(0x32b),
            wV(0x8d4),
            wV(0x622),
            wV(0x2f4),
            wV(0x7a7),
            wV(0x323),
            wV(0x996),
            wV(0x4d1),
            wV(0x976),
            wV(0x6ac),
            wV(0x8df),
            wV(0x248),
            wV(0x28d),
            wV(0x4cc),
            wV(0xd1d),
            wV(0x486),
            wV(0x243),
            wV(0x7a3),
            wV(0xabc),
            wV(0xaef),
            wV(0xbc4),
            wV(0x953),
            wV(0xd6c),
            wV(0xac2),
            wV(0xc78),
            wV(0x94f),
            wV(0x4d2),
            wV(0x415),
            wV(0x3f2),
            wV(0xb6),
            wV(0xc62),
            wV(0x58b),
            wV(0x971),
            wV(0x692),
            wV(0x65e),
            wV(0x3e9),
            wV(0x786),
            wV(0x919),
            wV(0xafb),
            wV(0x61f),
            wV(0x2d4),
            wV(0x6ea),
            wV(0xbd6),
            wV(0x598),
            wV(0xacc),
          ];
        return (
          (rB = function () {
            return rI;
          }),
          rB()
        );
      }
      function rC(rI, rJ, rK, rL, rM) {
        return rD(rJ - 0x322, rK);
      }
      function rD(rI, rJ) {
        const rK = rB();
        return (
          (rD = function (rL, rM) {
            rL = rL - (0x12b9 * 0x1 + 0x2f5 * 0xb + -0x3263);
            let rN = rK[rL];
            return rN;
          }),
          rD(rI, rJ)
        );
      }
      function rE(rI, rJ, rK, rL, rM) {
        return rD(rK - 0x398, rJ);
      }
      (function (rI, rJ) {
        const wW = b;
        function rK(rQ, rR, rS, rT, rU) {
          return rD(rQ - -0x202, rR);
        }
        function rL(rQ, rR, rS, rT, rU) {
          return rD(rR - -0x361, rT);
        }
        const rM = rI();
        function rN(rQ, rR, rS, rT, rU) {
          return rD(rR - -0x1c0, rT);
        }
        function rO(rQ, rR, rS, rT, rU) {
          return rD(rT - 0x1f1, rU);
        }
        function rP(rQ, rR, rS, rT, rU) {
          return rD(rU - 0x352, rT);
        }
        while (!![]) {
          try {
            const rQ =
              -parseInt(rK(-0xfd, -0x103, -0xdd, -0xfe, -0x10a)) /
                (-0x14de + 0x14ac + -0x33 * -0x1) +
              (parseInt(rK(-0xf2, -0x102, -0x107, -0x110, -0x114)) /
                (-0xe4b * -0x1 + 0x2 * 0x1039 + -0x2ebb)) *
                (parseInt(rP(0x413, 0x428, 0x42c, 0x416, 0x43b)) /
                  (-0x1ec7 * 0x1 + -0x19f * -0x14 + -0x1a2)) +
              parseInt(rO(0x300, 0x307, 0x2f6, 0x30d, 0x2fd)) /
                (-0x1 * 0x17bf + 0xbba * 0x1 + -0x27 * -0x4f) +
              parseInt(rL(-0x260, -0x274, -0x280, -0x248, -0x27f)) /
                (-0x2706 + -0x17b5 + 0x20 * 0x1f6) +
              (parseInt(rP(0x45e, 0x496, 0x48c, 0x49d, 0x47d)) /
                (0x260f * -0x1 + 0x1 * -0x20a1 + 0x46b6)) *
                (parseInt(rL(-0x23e, -0x25f, -0x278, -0x280, -0x256)) /
                  (-0xca9 + -0xbd5 + 0x1885)) +
              -parseInt(rP(0x452, 0x456, 0x44a, 0x433, 0x44e)) /
                (-0xcce + -0x2482 + 0x4 * 0xc56) +
              (-parseInt(rN(-0xec, -0xc2, -0xe4, -0xe7, -0xc6)) /
                (-0x2 * -0x183 + 0x887 * -0x2 + 0x115 * 0xd)) *
                (parseInt(rK(-0x122, -0x12f, -0x129, -0x120, -0x12a)) /
                  (-0x750 + 0x4 * 0x29f + 0x1 * -0x322));
            if (rQ === rJ) break;
            else rM[wW(0x733)](rM[wW(0x913)]());
          } catch (rR) {
            rM[wW(0x733)](rM[wW(0x913)]());
          }
        }
      })(rB, -0x51c14 * -0x1 + -0x87309 + 0x92db * 0x13);
      const rF = [
        rG(0x22c, 0x242, 0x249, 0x246, 0x242) +
          rE(0x4bd, 0x4b8, 0x4ab, 0x481, 0x4c9) +
          rE(0x4b0, 0x49e, 0x4bb, 0x4c5, 0x4c8) +
          rH(-0x128, -0x11a, -0x135, -0x121, -0x144),
        rE(0x491, 0x482, 0x49e, 0x4ba, 0x48b) +
          rG(0x234, 0x22e, 0x229, 0x255, 0x244),
        rH(-0x14e, -0x170, -0x171, -0x14b, -0x136) +
          rG(0x265, 0x275, 0x23c, 0x287, 0x241),
      ];
      function rG(rI, rJ, rK, rL, rM) {
        return rD(rI - 0x140, rM);
      }
      function rH(rI, rJ, rK, rL, rM) {
        return rD(rL - -0x23b, rJ);
      }
      !rF[
        rG(0x23f, 0x225, 0x23c, 0x231, 0x269) +
          rH(-0x147, -0x157, -0x129, -0x12c, -0x154)
      ](
        window[
          rH(-0x11a, -0x12c, -0x15c, -0x144, -0x128) +
            rC(0x44e, 0x42f, 0x445, 0x45a, 0x404)
        ][
          rE(0x4d2, 0x4b9, 0x4ad, 0x4ca, 0x4a0) +
            rH(-0x15e, -0x112, -0x150, -0x13b, -0x147)
        ][
          rA(0x331, 0x314, 0x315, 0x31d, 0x31c) +
            rH(-0xed, -0xf8, -0xe4, -0x109, -0xfb) +
            "e"
        ]()
      ) &&
        (alert(
          rG(0x228, 0x1fd, 0x211, 0x21d, 0x21f) +
            rA(0x322, 0x354, 0x32c, 0x327, 0x321) +
            rA(0x316, 0x333, 0x2f3, 0x30f, 0x32b) +
            rC(0x471, 0x448, 0x42a, 0x421, 0x44c) +
            rG(0x249, 0x26b, 0x26f, 0x225, 0x276) +
            rH(-0x15f, -0x11d, -0x133, -0x137, -0x116) +
            rC(0x3fb, 0x411, 0x42e, 0x42e, 0x404) +
            rE(0x484, 0x454, 0x475, 0x44f, 0x452) +
            rH(-0x11b, -0x13a, -0x133, -0x11d, -0x132) +
            rH(-0xf4, -0xfc, -0xf7, -0x10a, -0xff) +
            rE(0x4ba, 0x4e9, 0x4cd, 0x4ef, 0x4c5) +
            rE(0x461, 0x492, 0x47f, 0x493, 0x49f) +
            rH(-0x156, -0x130, -0x120, -0x14a, -0x123) +
            rG(0x21e, 0x236, 0x241, 0x246, 0x215) +
            rC(0x44f, 0x444, 0x44b, 0x46c, 0x43d) +
            rC(0x441, 0x44f, 0x47b, 0x428, 0x470) +
            rH(-0x170, -0x13c, -0x14a, -0x145, -0x131) +
            rG(0x238, 0x243, 0x25f, 0x25c, 0x246) +
            rE(0x49e, 0x486, 0x4af, 0x4c8, 0x495) +
            rA(0x2e9, 0x2fe, 0x2f3, 0x301, 0x325) +
            rG(0x226, 0x208, 0x20b, 0x23b, 0x1ff) +
            rC(0x464, 0x43d, 0x464, 0x448, 0x414) +
            rA(0x330, 0x306, 0x342, 0x324, 0x324) +
            rC(0x43f, 0x43f, 0x42d, 0x43f, 0x414) +
            rA(0x2cb, 0x318, 0x2ca, 0x2ef, 0x2e0) +
            rH(-0x108, -0x10e, -0x12f, -0x10d, -0xf7) +
            rA(0x341, 0x31a, 0x310, 0x333, 0x350) +
            rE(0x4b1, 0x49c, 0x4c4, 0x4b8, 0x4d7) +
            rA(0x354, 0x350, 0x365, 0x33f, 0x347) +
            rE(0x4b5, 0x4d3, 0x4c8, 0x4e0, 0x4bf) +
            rG(0x252, 0x24c, 0x26c, 0x230, 0x273)
        ),
        kI(
          rA(0x325, 0x318, 0x30f, 0x325, 0x328) +
            rH(-0x127, -0x15e, -0x162, -0x13e, -0x13f) +
            rG(0x21f, 0x23c, 0x245, 0x21b, 0x248) +
            rC(0x411, 0x414, 0x43b, 0x43e, 0x423) +
            rA(0x31d, 0x369, 0x349, 0x340, 0x34d) +
            rG(0x26a, 0x273, 0x255, 0x295, 0x261) +
            rE(0x4b3, 0x48a, 0x48b, 0x466, 0x46c) +
            rG(0x268, 0x278, 0x28c, 0x25c, 0x259) +
            rG(0x24b, 0x224, 0x277, 0x26c, 0x232) +
            rH(-0x10d, -0x153, -0x124, -0x134, -0x14c) +
            rE(0x477, 0x4a5, 0x47d, 0x45c, 0x45a) +
            rG(0x224, 0x215, 0x21a, 0x24d, 0x24e) +
            rG(0x239, 0x252, 0x21c, 0x236, 0x20d) +
            rH(-0x179, -0x15f, -0x12f, -0x159, -0x142) +
            rA(0x307, 0x300, 0x2fa, 0x322, 0x315) +
            rC(0x458, 0x44b, 0x441, 0x42e, 0x43f) +
            rH(-0x117, -0x144, -0xf0, -0x117, -0x13b) +
            rG(0x23a, 0x224, 0x252, 0x226, 0x250) +
            rG(0x254, 0x247, 0x22b, 0x248, 0x26d) +
            rG(0x22b, 0x20c, 0x200, 0x246, 0x23b) +
            rH(-0x175, -0x175, -0x174, -0x15d, -0x13f) +
            rA(0x2d5, 0x2fa, 0x2d1, 0x2ed, 0x2f5) +
            rA(0x310, 0x312, 0x304, 0x2f6, 0x308) +
            rG(0x24c, 0x22b, 0x249, 0x24e, 0x23b) +
            rG(0x260, 0x27b, 0x28c, 0x28c, 0x235) +
            rH(-0x135, -0x141, -0x126, -0x140, -0x154) +
            rC(0x461, 0x441, 0x442, 0x428, 0x466) +
            rA(0x2e2, 0x326, 0x2f5, 0x2fa, 0x2f3) +
            "v>",
          (rI) => {
            const rJ = {};
            rJ[rM(-0x281, -0x2a8, -0x288, -0x28b, -0x282)] =
              rM(-0x28e, -0x297, -0x26e, -0x292, -0x28b) +
              rM(-0x285, -0x2ab, -0x289, -0x2b0, -0x2a7) +
              rP(0x3f2, 0x3f5, 0x3e1, 0x3e1, 0x3e3) +
              rO(0x146, 0x141, 0x11f, 0x14b, 0x15a);
            function rK(rQ, rR, rS, rT, rU) {
              return rA(rQ - 0x10e, rR - 0xae, rT, rR - 0xdd, rU - 0x14d);
            }
            const rL = rJ;
            function rM(rQ, rR, rS, rT, rU) {
              return rC(rQ - 0x13a, rQ - -0x6b1, rR, rT - 0x11b, rU - 0x1a6);
            }
            function rN(rQ, rR, rS, rT, rU) {
              return rH(rQ - 0x193, rU, rS - 0x13d, rS - 0x423, rU - 0x15b);
            }
            function rO(rQ, rR, rS, rT, rU) {
              return rG(rT - -0x124, rR - 0xf8, rS - 0x15a, rT - 0x16e, rS);
            }
            function rP(rQ, rR, rS, rT, rU) {
              return rG(rR - 0x1ad, rR - 0x30, rS - 0x170, rT - 0x1d5, rQ);
            }
            !rI &&
              (window[
                rO(0xea, 0x112, 0x108, 0x113, 0x129) +
                  rN(0x2dc, 0x2ec, 0x2f5, 0x2e3, 0x2e2)
              ][rN(0x334, 0x305, 0x309, 0x31b, 0x2fd)] =
                rL[rN(0x2d4, 0x319, 0x2f6, 0x2e2, 0x31b)]);
          }
        ));
    }
    kJ();
    var kK = document[us(0xa02)](us(0x505)),
      kL = (function () {
        const wY = us;
        let rA = ![];
        return (
          (function (rB) {
            const wX = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                wX(0x73d)
              ](rB) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                wX(0x73d)
              ](rB[wX(0x85b)](0x0, 0x4))
            )
              rA = !![];
          })(navigator[wY(0x7c6)] || navigator[wY(0x40d)] || window[wY(0x14b)]),
          rA
        );
      })(),
      kM =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          us(0x73d)
        ](navigator[us(0x7c6)][us(0x49d)]()),
      kN = 0x514,
      kO = 0x28a,
      kP = 0x1,
      kQ = [km, kk, kn, kl, kH, hg],
      kR = 0x1,
      kS = 0x1;
    function kT() {
      const wZ = us;
      (kS = Math[wZ(0xdb0)](ki[wZ(0xd8b)] / d0, ki[wZ(0x3ca)] / d1)),
        (kR =
          Math[p8[wZ(0x136)] ? wZ(0xbe6) : wZ(0xdb0)](kU() / kN, kV() / kO) *
          (kL && !kM ? 1.1 : 0x1)),
        (kR *= kP);
      for (let rA = 0x0; rA < kQ[wZ(0x8c2)]; rA++) {
        const rB = kQ[rA];
        let rC = kR * (rB[wZ(0xd8f)] || 0x1);
        (rB[wZ(0xb14)][wZ(0x8cb)] = wZ(0xa0) + rC + ")"),
          (rB[wZ(0xb14)][wZ(0xdc4)] = wZ(0xa87)),
          (rB[wZ(0xb14)][wZ(0xd8b)] = kU() / rC + "px"),
          (rB[wZ(0xb14)][wZ(0x3ca)] = kV() / rC + "px");
      }
    }
    function kU() {
      const x0 = us;
      return document[x0(0xcfb)][x0(0x377)];
    }
    function kV() {
      const x1 = us;
      return document[x1(0xcfb)][x1(0xa56)];
    }
    var kW = 0x1;
    function kX() {
      const x2 = us;
      (kW = p8[x2(0x53b)] ? 0.65 : window[x2(0xd29)]),
        (ki[x2(0xd8b)] = kU() * kW),
        (ki[x2(0x3ca)] = kV() * kW),
        kT();
      for (let rA = 0x0; rA < mH[x2(0x8c2)]; rA++) {
        mH[rA][x2(0x9ff)]();
      }
    }
    window[us(0x5a7)] = function () {
      kX(), qF();
    };
    var kY = (function () {
        const x3 = us,
          rA = 0x23,
          rB = rA / 0x2,
          rC = document[x3(0x6be)](x3(0x9b5));
        rC[x3(0xd8b)] = rC[x3(0x3ca)] = rA;
        const rD = rC[x3(0xad8)]("2d");
        return (
          (rD[x3(0x555)] = x3(0x813)),
          rD[x3(0x16b)](),
          rD[x3(0x7f4)](0x0, rB),
          rD[x3(0x5d2)](rA, rB),
          rD[x3(0x7f4)](rB, 0x0),
          rD[x3(0x5d2)](rB, rA),
          rD[x3(0x130)](),
          rD[x3(0xd09)](rC, x3(0x513))
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
    function l2(rA, rB, rC = 0x8) {
      const x4 = us;
      rB *= -0x1;
      const rD = Math[x4(0xb0e)](rA),
        rE = Math[x4(0xbe5)](rA),
        rF = rD * 0x28,
        rG = rE * 0x28;
      l1[x4(0x733)]({
        dir: rB,
        start: [rF, rG],
        curve: [
          rF + rD * 0x17 + -rE * rB * rC,
          rG + rE * 0x17 + rD * rB * rC,
          rF + rD * 0x2e,
          rG + rE * 0x2e,
        ],
        side: Math[x4(0x638)](rA),
      });
    }
    var l3 = l4();
    function l4() {
      const x5 = us,
        rA = new Path2D(),
        rB = Math["PI"] / 0x5;
      return (
        rA[x5(0x67d)](0x0, 0x0, 0x28, rB, l0 - rB),
        rA[x5(0x9f0)](
          0x12,
          0x0,
          Math[x5(0xb0e)](rB) * 0x28,
          Math[x5(0xbe5)](rB) * 0x28
        ),
        rA[x5(0xa2a)](),
        rA
      );
    }
    var l5 = l6();
    function l6() {
      const x6 = us,
        rA = new Path2D();
      return (
        rA[x6(0x7f4)](-0x28, 0x5),
        rA[x6(0xb18)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rA[x6(0x5d2)](0x28, -0x5),
        rA[x6(0xb18)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rA[x6(0xa2a)](),
        rA
      );
    }
    function l7(rA, rB = 0x1, rC = 0x0) {
      const x7 = us,
        rD = new Path2D();
      for (let rE = 0x0; rE < rA; rE++) {
        const rF = (Math["PI"] * 0x2 * rE) / rA + rC;
        rD[x7(0x5d2)](
          Math[x7(0xb0e)](rF) - Math[x7(0xbe5)](rF) * 0.1 * rB,
          Math[x7(0xbe5)](rF)
        );
      }
      return rD[x7(0xa2a)](), rD;
    }
    var l8 = {
      petalRock: l7(0x5),
      petalSoil: l7(0xa),
      petalSalt: l7(0x7),
      petalLightning: (function () {
        const x8 = us,
          rA = new Path2D();
        for (let rB = 0x0; rB < 0x14; rB++) {
          const rC = (rB / 0x14) * Math["PI"] * 0x2,
            rD = rB % 0x2 === 0x0 ? 0x1 : 0.55;
          rA[x8(0x5d2)](Math[x8(0xb0e)](rC) * rD, Math[x8(0xbe5)](rC) * rD);
        }
        return rA[x8(0xa2a)](), rA;
      })(),
      petalCotton: la(0x9, 0x1, 0.5, 1.6),
      petalWeb: la(0x5, 0x1, 0.5, 0.7),
      petalCactus: la(0x8, 0x1, 0.5, 0.7),
      petalSand: l7(0x6, 0x0, 0.2),
    };
    function l9(rA, rB, rC, rD, rE) {
      const x9 = us;
      (rA[x9(0x555)] = rE),
        (rA[x9(0x26f)] = rC),
        rA[x9(0x68f)](),
        (rB *= 0.45),
        rA[x9(0x2cb)](rB),
        rA[x9(0xc8b)](-0x14, 0x0),
        rA[x9(0x16b)](),
        rA[x9(0x7f4)](0x0, 0x26),
        rA[x9(0x5d2)](0x50, 0x7),
        rA[x9(0x5d2)](0x50, -0x7),
        rA[x9(0x5d2)](0x0, -0x26),
        rA[x9(0x5d2)](-0x14, -0x1e),
        rA[x9(0x5d2)](-0x14, 0x1e),
        rA[x9(0xa2a)](),
        (rC = rC / rB),
        (rA[x9(0x26f)] = 0x64 + rC),
        (rA[x9(0x555)] = rE),
        rA[x9(0x130)](),
        (rA[x9(0x555)] = rA[x9(0x5ef)] = rD),
        (rA[x9(0x26f)] -= rC * 0x2),
        rA[x9(0x130)](),
        rA[x9(0x527)](),
        rA[x9(0x936)]();
    }
    function la(rA, rB, rC, rD) {
      const xa = us,
        rE = new Path2D();
      return lb(rE, rA, rB, rC, rD), rE[xa(0xa2a)](), rE;
    }
    function lb(rA, rB, rC, rD, rE) {
      const xb = us;
      rA[xb(0x7f4)](rC, 0x0);
      for (let rF = 0x1; rF <= rB; rF++) {
        const rG = (Math["PI"] * 0x2 * (rF - rD)) / rB,
          rH = (Math["PI"] * 0x2 * rF) / rB;
        rA[xb(0x9f0)](
          Math[xb(0xb0e)](rG) * rC * rE,
          Math[xb(0xbe5)](rG) * rC * rE,
          Math[xb(0xb0e)](rH) * rC,
          Math[xb(0xbe5)](rH) * rC
        );
      }
    }
    var lc = (function () {
        const xc = us,
          rA = new Path2D();
        rA[xc(0x7f4)](0x3c, 0x0);
        const rB = 0x6;
        for (let rC = 0x0; rC < rB; rC++) {
          const rD = ((rC + 0.5) / rB) * Math["PI"] * 0x2,
            rE = ((rC + 0x1) / rB) * Math["PI"] * 0x2;
          rA[xc(0x9f0)](
            Math[xc(0xb0e)](rD) * 0x78,
            Math[xc(0xbe5)](rD) * 0x78,
            Math[xc(0xb0e)](rE) * 0x3c,
            Math[xc(0xbe5)](rE) * 0x3c
          );
        }
        return rA[xc(0xa2a)](), rA;
      })(),
      ld = (function () {
        const xd = us,
          rA = new Path2D(),
          rB = 0x6;
        for (let rC = 0x0; rC < rB; rC++) {
          const rD = ((rC + 0.5) / rB) * Math["PI"] * 0x2;
          rA[xd(0x7f4)](0x0, 0x0), rA[xd(0x5d2)](...le(0x37, 0x0, rD));
          for (let rE = 0x0; rE < 0x2; rE++) {
            const rF = (rE / 0x2) * 0x1e + 0x14,
              rG = 0xa - rE * 0x2;
            rA[xd(0x7f4)](...le(rF + rG, -rG, rD)),
              rA[xd(0x5d2)](...le(rF, 0x0, rD)),
              rA[xd(0x5d2)](...le(rF + rG, rG, rD));
          }
        }
        return rA;
      })();
    function le(rA, rB, rC) {
      const xe = us,
        rD = Math[xe(0xbe5)](rC),
        rE = Math[xe(0xb0e)](rC);
      return [rA * rE + rB * rD, rB * rE - rA * rD];
    }
    function lf(rA, rB, rC) {
      (rA /= 0x168), (rB /= 0x64), (rC /= 0x64);
      let rD, rE, rF;
      if (rB === 0x0) rD = rE = rF = rC;
      else {
        const rH = (rK, rL, rM) => {
            if (rM < 0x0) rM += 0x1;
            if (rM > 0x1) rM -= 0x1;
            if (rM < 0x1 / 0x6) return rK + (rL - rK) * 0x6 * rM;
            if (rM < 0x1 / 0x2) return rL;
            if (rM < 0x2 / 0x3) return rK + (rL - rK) * (0x2 / 0x3 - rM) * 0x6;
            return rK;
          },
          rI = rC < 0.5 ? rC * (0x1 + rB) : rC + rB - rC * rB,
          rJ = 0x2 * rC - rI;
        (rD = rH(rJ, rI, rA + 0x1 / 0x3)),
          (rE = rH(rJ, rI, rA)),
          (rF = rH(rJ, rI, rA - 0x1 / 0x3));
      }
      const rG = (rK) => {
        const xf = b,
          rL = Math[xf(0x2ab)](rK * 0xff)[xf(0xbfe)](0x10);
        return rL[xf(0x8c2)] === 0x1 ? "0" + rL : rL;
      };
      return "#" + rG(rD) + rG(rE) + rG(rF);
    }
    var lg = [];
    for (let rA = 0x0; rA < 0xa; rA++) {
      const rB = 0x1 - rA / 0xa;
      lg[us(0x733)](lf(0x28 + rB * 0xc8, 0x50, 0x3c * rB));
    }
    var lh = [us(0x11b), us(0xd22)],
      li = lh[0x0],
      lj = [us(0x568), us(0x16e), us(0x4bf), us(0xa90)];
    function lk(rC = us(0x264)) {
      const xg = us,
        rD = [];
      for (let rE = 0x0; rE < 0x5; rE++) {
        rD[xg(0x733)](pW(rC, 0.8 - (rE / 0x5) * 0.25));
      }
      return rD;
    }
    var ll = {
        pet: {
          body: li,
          wing: pW(li, 0.7),
          tail_outline: pW(li, 0.4),
          bone_outline: pW(li, 0.4),
          bone: pW(li, 0.6),
          tail: lk(pW(li, 0.8)),
        },
        main: {
          body: us(0x264),
          wing: us(0x801),
          tail_outline: us(0xd3e),
          bone_outline: us(0x3fa),
          bone: us(0xd3e),
          tail: lk(),
        },
      },
      lm = new Path2D(us(0x4a2)),
      ln = new Path2D(us(0xc4f)),
      lo = [];
    for (let rC = 0x0; rC < 0x3; rC++) {
      lo[us(0x733)](pW(lh[0x0], 0x1 - (rC / 0x3) * 0.2));
    }
    function lp(rD = Math[us(0xb7c)]()) {
      return function () {
        return (rD = (rD * 0x2455 + 0xc091) % 0x38f40), rD / 0x38f40;
      };
    }
    const lq = {
      [cS[us(0xb05)]]: [us(0x2ce), us(0xc25)],
      [cS[us(0x100)]]: [us(0x264), us(0xb5e)],
      [cS[us(0xb22)]]: [us(0x98b), us(0x9d5)],
    };
    var lr = lq;
    const ls = {};
    (ls[us(0xd99)] = !![]),
      (ls[us(0x11a)] = !![]),
      (ls[us(0x791)] = !![]),
      (ls[us(0x29b)] = !![]),
      (ls[us(0xd34)] = !![]),
      (ls[us(0x449)] = !![]),
      (ls[us(0x4c7)] = !![]);
    var lt = ls;
    const lu = {};
    (lu[us(0x35b)] = !![]),
      (lu[us(0xd8e)] = !![]),
      (lu[us(0xa5a)] = !![]),
      (lu[us(0x1be)] = !![]),
      (lu[us(0x9ac)] = !![]),
      (lu[us(0x117)] = !![]),
      (lu[us(0x9a9)] = !![]);
    var lv = lu;
    const lw = {};
    (lw[us(0xa5a)] = !![]),
      (lw[us(0x1be)] = !![]),
      (lw[us(0x9ac)] = !![]),
      (lw[us(0x117)] = !![]);
    var lx = lw;
    const ly = {};
    (ly[us(0xd8e)] = !![]), (ly[us(0x440)] = !![]), (ly[us(0x29b)] = !![]);
    var lz = ly;
    const lA = {};
    (lA[us(0x523)] = !![]), (lA[us(0xd7b)] = !![]), (lA[us(0x188)] = !![]);
    var lB = lA;
    const lC = {};
    (lC[us(0xa96)] = !![]),
      (lC[us(0xc4)] = !![]),
      (lC[us(0x179)] = !![]),
      (lC[us(0x4c1)] = !![]),
      (lC[us(0x181)] = !![]);
    var lD = lC;
    function lE(rD, rE) {
      const xh = us;
      rD[xh(0x16b)](), rD[xh(0x7f4)](rE, 0x0);
      for (let rF = 0x0; rF < 0x6; rF++) {
        const rG = (rF / 0x6) * Math["PI"] * 0x2;
        rD[xh(0x5d2)](Math[xh(0xb0e)](rG) * rE, Math[xh(0xbe5)](rG) * rE);
      }
      rD[xh(0xa2a)]();
    }
    function lF(rD, rE, rF, rG, rH) {
      const xi = us;
      rD[xi(0x16b)](),
        rD[xi(0x7f4)](0x9, -0x5),
        rD[xi(0xb18)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rD[xi(0x9f0)](0xd, 0x0, 0x9, -0x5),
        rD[xi(0xa2a)](),
        (rD[xi(0xd10)] = rD[xi(0x534)] = xi(0x2ab)),
        (rD[xi(0x555)] = rG),
        (rD[xi(0x26f)] = rE),
        rD[xi(0x130)](),
        (rD[xi(0x26f)] -= rH),
        (rD[xi(0x5ef)] = rD[xi(0x555)] = rF),
        rD[xi(0x527)](),
        rD[xi(0x130)]();
    }
    var lG = class {
        constructor(rD = -0x1, rE, rF, rG, rH, rI = 0x7, rJ = -0x1) {
          const xj = us;
          (this["id"] = rD),
            (this[xj(0x41e)] = rE),
            (this[xj(0x635)] = hM[rE]),
            (this[xj(0x27a)] = this[xj(0x635)][xj(0x439)](xj(0xab7))),
            (this["x"] = this["nx"] = this["ox"] = rF),
            (this["y"] = this["ny"] = this["oy"] = rG),
            (this[xj(0x4c3)] = this[xj(0x575)] = this[xj(0x93f)] = rH),
            (this[xj(0x7bd)] =
              this[xj(0x3ab)] =
              this[xj(0xb24)] =
              this[xj(0xa4e)] =
                rJ),
            (this[xj(0x7b9)] = 0x0),
            (this[xj(0xc60)] = this[xj(0xb3a)] = this[xj(0x1a2)] = rI),
            (this[xj(0xddd)] = 0x0),
            (this[xj(0xd11)] = ![]),
            (this[xj(0x3ec)] = 0x0),
            (this[xj(0x6d3)] = 0x0),
            (this[xj(0xc20)] = this[xj(0x635)][xj(0xaa0)](xj(0x138)) > -0x1),
            (this[xj(0x526)] = this[xj(0xc20)] ? this[xj(0x3ab)] < 0x1 : 0x1),
            (this[xj(0x52a)] = ![]),
            (this[xj(0xa17)] = 0x0),
            (this[xj(0x38b)] = 0x0),
            (this[xj(0x6a7)] = 0x0),
            (this[xj(0xb07)] = 0x1),
            (this[xj(0x536)] = 0x0),
            (this[xj(0x924)] = [cS[xj(0x5b9)], cS[xj(0xcf1)], cS[xj(0x5b6)]][
              xj(0xd4)
            ](this[xj(0x41e)])),
            (this[xj(0x39c)] = lv[this[xj(0x635)]]),
            (this[xj(0x17b)] = lx[this[xj(0x635)]] ? 0x32 / 0xc8 : 0x0),
            (this[xj(0x359)] = lt[this[xj(0x635)]]),
            (this[xj(0x380)] = 0x0),
            (this[xj(0xab1)] = 0x0),
            (this[xj(0x23d)] = ![]),
            (this[xj(0xca3)] = 0x0),
            (this[xj(0x549)] = !![]),
            (this[xj(0xc7)] = 0x2),
            (this[xj(0x98d)] = 0x0),
            (this[xj(0xc9b)] = lD[this[xj(0x635)]]),
            (this[xj(0xcee)] = lz[this[xj(0x635)]]),
            (this[xj(0xc8d)] = lB[this[xj(0x635)]]);
        }
        [us(0xc2f)]() {
          const xk = us;
          this[xk(0xd11)] && (this[xk(0x3ec)] += pN / 0xc8);
          (this[xk(0xab1)] += ((this[xk(0x23d)] ? 0x1 : -0x1) * pN) / 0xc8),
            (this[xk(0xab1)] = Math[xk(0xbe6)](
              0x1,
              Math[xk(0xdb0)](0x0, this[xk(0xab1)])
            )),
            (this[xk(0x6a7)] = pt(
              this[xk(0x6a7)],
              this[xk(0x38b)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[xk(0x38b)] = pt(this[xk(0x38b)], this[xk(0xa17)], 0x64));
          this[xk(0x6d3)] > 0x0 &&
            ((this[xk(0x6d3)] -= pN / 0x96),
            this[xk(0x6d3)] < 0x0 && (this[xk(0x6d3)] = 0x0));
          (this[xk(0xddd)] += pN / 0x64),
            (this["t"] = Math[xk(0xbe6)](0x1, this[xk(0xddd)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[xk(0x3ab)] =
              this[xk(0xa4e)] +
              (this[xk(0xb24)] - this[xk(0xa4e)]) * this["t"]),
            (this[xk(0xc60)] =
              this[xk(0x1a2)] +
              (this[xk(0xb3a)] - this[xk(0x1a2)]) * this["t"]);
          if (this[xk(0x924)]) {
            const rD = Math[xk(0xbe6)](0x1, pN / 0x64);
            (this[xk(0xb07)] +=
              (Math[xk(0xb0e)](this[xk(0x575)]) - this[xk(0xb07)]) * rD),
              (this[xk(0x536)] +=
                (Math[xk(0xbe5)](this[xk(0x575)]) - this[xk(0x536)]) * rD);
          }
          (this[xk(0x4c3)] = f8(this[xk(0x93f)], this[xk(0x575)], this["t"])),
            (this[xk(0xca3)] +=
              ((Math[xk(0xa5e)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pN) /
              0x12),
            this[xk(0x7b9)] > 0x0 &&
              ((this[xk(0x7b9)] -= pN / 0x258),
              this[xk(0x7b9)] < 0x0 && (this[xk(0x7b9)] = 0x0)),
            this[xk(0xc8d)] &&
              ((this[xk(0xc7)] += pN / 0x5dc),
              this[xk(0xc7)] > 0x1 && (this[xk(0xc7)] = 0x1),
              (this[xk(0x549)] = this[xk(0xc7)] < 0x1)),
            this[xk(0x3ab)] < 0x1 &&
              (this[xk(0x526)] = pt(this[xk(0x526)], 0x1, 0xc8)),
            this[xk(0x7b9)] === 0x0 &&
              (this[xk(0x7bd)] +=
                (this[xk(0x3ab)] - this[xk(0x7bd)]) *
                Math[xk(0xbe6)](0x1, pN / 0xc8));
        }
        [us(0x75d)](rD, rE = ![]) {
          const xl = us,
            rF = this[xl(0xc60)] / 0x19;
          rD[xl(0x2cb)](rF),
            rD[xl(0xc8b)](0x5, 0x0),
            (rD[xl(0x26f)] = 0x5),
            (rD[xl(0x534)] = rD[xl(0xd10)] = xl(0x2ab)),
            (rD[xl(0x555)] = rD[xl(0x5ef)] = this[xl(0xdad)](xl(0x719)));
          rE &&
            (rD[xl(0x68f)](),
            rD[xl(0xc8b)](0x3, 0x0),
            rD[xl(0x16b)](),
            rD[xl(0x7f4)](-0xa, 0x0),
            rD[xl(0x5d2)](-0x28, -0xf),
            rD[xl(0x9f0)](-0x21, 0x0, -0x28, 0xf),
            rD[xl(0xa2a)](),
            rD[xl(0x936)](),
            rD[xl(0x130)](),
            rD[xl(0x527)]());
          rD[xl(0x16b)](), rD[xl(0x7f4)](0x0, 0x1e);
          const rG = 0x1c,
            rH = 0x24,
            rI = 0x5;
          rD[xl(0x7f4)](0x0, rG);
          for (let rJ = 0x0; rJ < rI; rJ++) {
            const rK = ((((rJ + 0.5) / rI) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              rL = ((((rJ + 0x1) / rI) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rD[xl(0x9f0)](
              Math[xl(0xb0e)](rK) * rH * 0.85,
              -Math[xl(0xbe5)](rK) * rH,
              Math[xl(0xb0e)](rL) * rG * 0.7,
              -Math[xl(0xbe5)](rL) * rG
            );
          }
          rD[xl(0x5d2)](-0x1c, -0x9),
            rD[xl(0x9f0)](-0x26, 0x0, -0x1c, 0x9),
            rD[xl(0x5d2)](0x0, rG),
            rD[xl(0xa2a)](),
            (rD[xl(0x5ef)] = this[xl(0xdad)](xl(0xf7))),
            rD[xl(0x527)](),
            rD[xl(0x130)](),
            rD[xl(0x16b)]();
          for (let rM = 0x0; rM < 0x4; rM++) {
            const rN = (((rM / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rO = -0x1e + Math[xl(0xb0e)](rN) * 0xd,
              rP = Math[xl(0xbe5)](rN) * 0xb;
            rD[xl(0x7f4)](rO, rP),
              rD[xl(0x5d2)](
                rO + Math[xl(0xb0e)](rN) * 0x1b,
                rP + Math[xl(0xbe5)](rN) * 0x1b
              );
          }
          (rD[xl(0x26f)] = 0x4), rD[xl(0x130)]();
        }
        [us(0x196)](rD, rE = us(0x500), rF = 0x0) {
          const xm = us;
          for (let rG = 0x0; rG < l1[xm(0x8c2)]; rG++) {
            const rH = l1[rG];
            rD[xm(0x68f)](),
              rD[xm(0x978)](
                rH[xm(0x849)] * Math[xm(0xbe5)](this[xm(0xca3)] + rG) * 0.15 +
                  rF * rH[xm(0x8b5)]
              ),
              rD[xm(0x16b)](),
              rD[xm(0x7f4)](...rH[xm(0x5ce)]),
              rD[xm(0x9f0)](...rH[xm(0x741)]),
              (rD[xm(0x555)] = this[xm(0xdad)](rE)),
              (rD[xm(0x26f)] = 0x8),
              (rD[xm(0x534)] = xm(0x2ab)),
              rD[xm(0x130)](),
              rD[xm(0x936)]();
          }
        }
        [us(0xb69)](rD) {
          const xn = us;
          rD[xn(0x16b)]();
          let rE = 0x0,
            rF = 0x0,
            rG,
            rH;
          const rI = 0x14;
          for (let rJ = 0x0; rJ < rI; rJ++) {
            const rK = (rJ / rI) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              rL = ((rJ + 0x1) / rI) * 0x28;
            (rG = Math[xn(0xb0e)](rK) * rL), (rH = Math[xn(0xbe5)](rK) * rL);
            const rM = rE + rG,
              rN = rF + rH;
            rD[xn(0x9f0)](
              (rE + rM) * 0.5 + rH * 0.15,
              (rF + rN) * 0.5 - rG * 0.15,
              rM,
              rN
            ),
              (rE = rM),
              (rF = rN);
          }
          rD[xn(0x9f0)](
            rE - rH * 0.42 + rG * 0.4,
            rF + rG * 0.42 + rH * 0.4,
            rE - rH * 0.84,
            rF + rG * 0.84
          ),
            (rD[xn(0x5ef)] = this[xn(0xdad)](xn(0xcf6))),
            rD[xn(0x527)](),
            (rD[xn(0x26f)] = 0x8),
            (rD[xn(0x555)] = this[xn(0xdad)](xn(0x9db))),
            rD[xn(0x130)]();
        }
        [us(0x29b)](rD) {
          const xo = us;
          rD[xo(0x2cb)](this[xo(0xc60)] / 0xd),
            rD[xo(0x978)](-Math["PI"] / 0x6),
            (rD[xo(0x534)] = rD[xo(0xd10)] = xo(0x2ab)),
            rD[xo(0x16b)](),
            rD[xo(0x7f4)](0x0, -0xe),
            rD[xo(0x5d2)](0x6, -0x14),
            (rD[xo(0x5ef)] = rD[xo(0x555)] = this[xo(0xdad)](xo(0xd42))),
            (rD[xo(0x26f)] = 0x7),
            rD[xo(0x130)](),
            (rD[xo(0x5ef)] = rD[xo(0x555)] = this[xo(0xdad)](xo(0x53c))),
            (rD[xo(0x26f)] = 0x2),
            rD[xo(0x130)](),
            rD[xo(0x16b)](),
            rD[xo(0x7f4)](0x0, -0xc),
            rD[xo(0x9f0)](-0x6, 0x0, 0x4, 0xe),
            rD[xo(0xb18)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rD[xo(0x26f)] = 0xc),
            (rD[xo(0x5ef)] = rD[xo(0x555)] = this[xo(0xdad)](xo(0x2cf))),
            rD[xo(0x527)](),
            rD[xo(0x130)](),
            (rD[xo(0x26f)] = 0x6),
            (rD[xo(0x5ef)] = rD[xo(0x555)] = this[xo(0xdad)](xo(0x17f))),
            rD[xo(0x130)](),
            rD[xo(0x527)]();
        }
        [us(0x791)](rD) {
          const xp = us;
          rD[xp(0x2cb)](this[xp(0xc60)] / 0x2d),
            rD[xp(0xc8b)](-0x14, 0x0),
            (rD[xp(0x534)] = rD[xp(0xd10)] = xp(0x2ab)),
            rD[xp(0x16b)]();
          const rE = 0x6,
            rF = Math["PI"] * 0.45,
            rG = 0x3c,
            rH = 0x46;
          rD[xp(0x7f4)](0x0, 0x0);
          for (let rI = 0x0; rI < rE; rI++) {
            const rJ = ((rI / rE) * 0x2 - 0x1) * rF,
              rK = (((rI + 0x1) / rE) * 0x2 - 0x1) * rF;
            rI === 0x0 &&
              rD[xp(0x9f0)](
                -0xa,
                -0x32,
                Math[xp(0xb0e)](rJ) * rG,
                Math[xp(0xbe5)](rJ) * rG
              );
            const rL = (rJ + rK) / 0x2;
            rD[xp(0x9f0)](
              Math[xp(0xb0e)](rL) * rH,
              Math[xp(0xbe5)](rL) * rH,
              Math[xp(0xb0e)](rK) * rG,
              Math[xp(0xbe5)](rK) * rG
            );
          }
          rD[xp(0x9f0)](-0xa, 0x32, 0x0, 0x0),
            (rD[xp(0x5ef)] = this[xp(0xdad)](xp(0x103))),
            (rD[xp(0x555)] = this[xp(0xdad)](xp(0x4aa))),
            (rD[xp(0x26f)] = 0xa),
            rD[xp(0x130)](),
            rD[xp(0x527)](),
            rD[xp(0x16b)](),
            rD[xp(0x67d)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rD[xp(0xa2a)](),
            (rD[xp(0x555)] = this[xp(0xdad)](xp(0x80f))),
            (rD[xp(0x26f)] = 0x1e),
            rD[xp(0x130)](),
            (rD[xp(0x26f)] = 0xa),
            (rD[xp(0x555)] = rD[xp(0x5ef)] = this[xp(0xdad)](xp(0x4ca))),
            rD[xp(0x527)](),
            rD[xp(0x130)]();
        }
        [us(0xc6)](rD, rE = ![]) {
          const xq = us;
          rD[xq(0x2cb)](this[xq(0xc60)] / 0x64);
          let rF = this[xq(0x2ae)]
            ? 0.75
            : Math[xq(0xbe5)](Date[xq(0x7c4)]() / 0x96 + this[xq(0xca3)]);
          (rF = rF * 0.5 + 0.5),
            (rF *= 0.7),
            rD[xq(0x16b)](),
            rD[xq(0x7f4)](0x0, 0x0),
            rD[xq(0x67d)](0x0, 0x0, 0x64, rF, Math["PI"] * 0x2 - rF),
            rD[xq(0xa2a)](),
            (rD[xq(0x5ef)] = this[xq(0xdad)](xq(0xb3b))),
            rD[xq(0x527)](),
            rD[xq(0xc88)](),
            (rD[xq(0x555)] = xq(0x4e4)),
            (rD[xq(0x26f)] = rE ? 0x28 : 0x1e),
            (rD[xq(0xd10)] = xq(0x2ab)),
            rD[xq(0x130)](),
            !rE &&
              (rD[xq(0x16b)](),
              rD[xq(0x67d)](
                0x0 - rF * 0x8,
                -0x32 - rF * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rD[xq(0x5ef)] = xq(0x96f)),
              rD[xq(0x527)]());
        }
        [us(0x663)](rD) {
          const xr = us;
          rD[xr(0x2cb)](this[xr(0xc60)] / 0x50),
            rD[xr(0x978)](-this[xr(0x4c3)]),
            rD[xr(0xc8b)](0x0, 0x50);
          const rE = Date[xr(0x7c4)]() / 0x12c + this[xr(0xca3)];
          rD[xr(0x16b)]();
          const rF = 0x3;
          let rG;
          for (let rJ = 0x0; rJ < rF; rJ++) {
            const rK = ((rJ / rF) * 0x2 - 0x1) * 0x64,
              rL = (((rJ + 0x1) / rF) * 0x2 - 0x1) * 0x64;
            (rG =
              0x14 +
              (Math[xr(0xbe5)]((rJ / rF) * Math["PI"] * 0x8 + rE) * 0.5 + 0.5) *
                0x1e),
              rJ === 0x0 && rD[xr(0x7f4)](rK, -rG),
              rD[xr(0xb18)](rK, rG, rL, rG, rL, -rG);
          }
          rD[xr(0xb18)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rG),
            rD[xr(0xa2a)](),
            (rD[xr(0x23f)] *= 0.7);
          const rH = this[xr(0x52a)]
            ? lh[0x0]
            : this["id"] < 0x0
            ? lj[0x0]
            : lj[this["id"] % lj[xr(0x8c2)]];
          (rD[xr(0x5ef)] = this[xr(0xdad)](rH)),
            rD[xr(0x527)](),
            rD[xr(0xc88)](),
            (rD[xr(0xd10)] = xr(0x2ab)),
            (rD[xr(0x555)] = xr(0x4e4)),
            xr(0x1c0),
            (rD[xr(0x26f)] = 0x1e),
            rD[xr(0x130)]();
          let rI = Math[xr(0xbe5)](rE * 0x1);
          (rI = rI * 0.5 + 0.5),
            (rI *= 0x3),
            rD[xr(0x16b)](),
            rD[xr(0xe9)](
              0x0,
              -0x82 - rI * 0x2,
              0x28 - rI,
              0x14 - rI * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rD[xr(0x5ef)] = rD[xr(0x555)]),
            rD[xr(0x527)]();
        }
        [us(0x7ed)](rD, rE) {
          const xs = us;
          rD[xs(0x2cb)](this[xs(0xc60)] / 0x14);
          const rF = rD[xs(0x23f)];
          (rD[xs(0x555)] = rD[xs(0x5ef)] = this[xs(0xdad)](xs(0x666))),
            (rD[xs(0x23f)] = 0.4 * rF),
            rD[xs(0x68f)](),
            rD[xs(0x16b)](),
            rD[xs(0x978)](Math["PI"] * 0.16),
            rD[xs(0xc8b)](rE ? -0x6 : -0x9, 0x0),
            rD[xs(0x7f4)](0x0, -0x4),
            rD[xs(0x9f0)](-0x2, 0x0, 0x0, 0x4),
            (rD[xs(0x26f)] = 0x8),
            (rD[xs(0xd10)] = rD[xs(0x534)] = xs(0x2ab)),
            rD[xs(0x130)](),
            rD[xs(0x936)](),
            rD[xs(0x16b)](),
            rD[xs(0x67d)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rD[xs(0x527)](),
            rD[xs(0xc88)](),
            (rD[xs(0x23f)] = 0.5 * rF),
            (rD[xs(0x26f)] = rE ? 0x8 : 0x3),
            rD[xs(0x130)]();
        }
        [us(0x4c1)](rD) {
          const xt = us;
          rD[xt(0x2cb)](this[xt(0xc60)] / 0x64);
          const rE = this[xt(0xdad)](xt(0xbf9)),
            rF = this[xt(0xdad)](xt(0x21f)),
            rG = 0x4;
          rD[xt(0xd10)] = rD[xt(0x534)] = xt(0x2ab);
          const rH = 0x64 - rD[xt(0x26f)] * 0.5;
          for (let rI = 0x0; rI <= rG; rI++) {
            const rJ = (0x1 - rI / rG) * rH;
            lE(rD, rJ),
              (rD[xt(0x26f)] =
                0x1e +
                rI *
                  (Math[xt(0xbe5)](Date[xt(0x7c4)]() / 0x320 + rI) * 0.5 +
                    0.5) *
                  0x5),
              (rD[xt(0x5ef)] = rD[xt(0x555)] = rI % 0x2 === 0x0 ? rE : rF),
              rI === rG - 0x1 && rD[xt(0x527)](),
              rD[xt(0x130)]();
          }
        }
        [us(0x1fa)](rD, rE) {
          const xu = us;
          rD[xu(0x16b)](),
            rD[xu(0x67d)](0x0, 0x0, this[xu(0xc60)], 0x0, l0),
            (rD[xu(0x5ef)] = this[xu(0xdad)](rE)),
            rD[xu(0x527)](),
            (rD[xu(0x5ef)] = xu(0x96f));
          for (let rF = 0x1; rF < 0x4; rF++) {
            rD[xu(0x16b)](),
              rD[xu(0x67d)](
                0x0,
                0x0,
                this[xu(0xc60)] * (0x1 - rF / 0x4),
                0x0,
                l0
              ),
              rD[xu(0x527)]();
          }
        }
        [us(0x80d)](rD, rE) {
          const xv = us;
          rD[xv(0xc8b)](-this[xv(0xc60)], 0x0), (rD[xv(0x611)] = xv(0x6e2));
          const rF = 0x32;
          let rG = ![];
          !this[xv(0xb5d)] && ((rG = !![]), (this[xv(0xb5d)] = []));
          while (this[xv(0xb5d)][xv(0x8c2)] < rF) {
            this[xv(0xb5d)][xv(0x733)]({
              x: rG ? Math[xv(0xb7c)]() : 0x0,
              y: Math[xv(0xb7c)]() * 0x2 - 0x1,
              vx: Math[xv(0xb7c)]() * 0.03 + 0.02,
              size: Math[xv(0xb7c)]() * 0.2 + 0.2,
            });
          }
          const rH = this[xv(0xc60)] * 0x2,
            rI = Math[xv(0xdb0)](this[xv(0xc60)] * 0.1, 0x4),
            rJ = rD[xv(0x23f)];
          (rD[xv(0x5ef)] = rE), rD[xv(0x16b)]();
          for (let rK = rF - 0x1; rK >= 0x0; rK--) {
            const rL = this[xv(0xb5d)][rK];
            rL["x"] += rL["vx"];
            const rM = rL["x"] * rH,
              rN = this[xv(0x17b)] * rM,
              rO = rL["y"] * rN,
              rP =
                Math[xv(0x168)](0x1 - Math[xv(0x7a8)](rO) / rN, 0.2) *
                Math[xv(0x168)](0x1 - rM / rH, 0.2);
            if (rL["x"] >= 0x1 || rP < 0.001) {
              this[xv(0xb5d)][xv(0x34a)](rK, 0x1);
              continue;
            }
            (rD[xv(0x23f)] = rP * rJ * 0.5),
              rD[xv(0x16b)](),
              rD[xv(0x67d)](
                rM,
                rO,
                rL[xv(0xc60)] * rN + rI,
                0x0,
                Math["PI"] * 0x2
              ),
              rD[xv(0x527)]();
          }
        }
        [us(0x4a1)](rD) {
          const xw = us;
          rD[xw(0x2cb)](this[xw(0xc60)] / 0x46),
            rD[xw(0x978)](-Math["PI"] / 0x2);
          const rE = pM / 0xc8;
          (rD[xw(0x26f)] = 0x14),
            (rD[xw(0x555)] = xw(0x813)),
            (rD[xw(0x534)] = rD[xw(0xd10)] = xw(0x2ab)),
            (rD[xw(0x5ef)] = this[xw(0xdad)](xw(0x88c)));
          if (!![]) {
            this[xw(0xbc3)](rD);
            return;
          }
          const rF = 0x2;
          for (let rG = 0x1; rG <= rF; rG++) {
            rD[xw(0x68f)]();
            let rH = 0x1 - rG / rF;
            (rH *= 0x1 + Math[xw(0xbe5)](rE + rG) * 0.5),
              (rH = 0x1 + rH * 0.5),
              (rD[xw(0x23f)] *= Math[xw(0x168)](rG / rF, 0x2)),
              rD[xw(0x9b0)](rH, rH),
              rG !== rF &&
                ((rD[xw(0x23f)] *= 0.7),
                (rD[xw(0x611)] = xw(0x6e2)),
                (rD[xw(0xaa5)] = xw(0xdce))),
              this[xw(0xbc3)](rD),
              rD[xw(0x936)]();
          }
        }
        [us(0xb5c)](rD, rE = 0xbe) {
          const xx = us;
          rD[xx(0x68f)](),
            rD[xx(0x16b)](),
            rD[xx(0x7f4)](0x0, -0x46 + rE + 0x1e),
            rD[xx(0x5d2)](0x1a, -0x46 + rE),
            rD[xx(0x5d2)](0xd, -0x46),
            rD[xx(0x5d2)](-0xd, -0x46),
            rD[xx(0x5d2)](-0x1a, -0x46 + rE),
            rD[xx(0x5d2)](0x0, -0x46 + rE + 0x1e),
            rD[xx(0xc88)](),
            rD[xx(0x527)](),
            rD[xx(0x130)](),
            rD[xx(0x936)](),
            rD[xx(0x68f)](),
            rD[xx(0x16b)](),
            rD[xx(0x7f4)](-0x12, -0x46),
            rD[xx(0x9f0)](-0x5, -0x50, -0xa, -0x69),
            rD[xx(0xb18)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rD[xx(0x9f0)](0x5, -0x50, 0x12, -0x46),
            rD[xx(0x9f0)](0x0, -0x3c, -0x12, -0x46),
            rD[xx(0xa2a)](),
            this[xx(0x27a)]
              ? ((rD[xx(0x5ef)] = this[xx(0xdad)](xx(0xc51))),
                (rD[xx(0x555)] = this[xx(0xdad)](xx(0xa43))))
              : (rD[xx(0x555)] = this[xx(0xdad)](xx(0x3ed))),
            rD[xx(0x527)](),
            (rD[xx(0x26f)] = 0xa),
            rD[xx(0x130)](),
            rD[xx(0x936)]();
        }
        [us(0xbc3)](rD) {
          const xy = us;
          rD[xy(0x68f)](), rD[xy(0x16b)]();
          for (let rE = 0x0; rE < 0x2; rE++) {
            rD[xy(0x7f4)](0x14, -0x1e),
              rD[xy(0x9f0)](0x5a, -0xa, 0x32, -0x32),
              rD[xy(0x5d2)](0xa0, -0x32),
              rD[xy(0x9f0)](0x8c, 0x3c, 0x14, 0x0),
              rD[xy(0x9b0)](-0x1, 0x1);
          }
          rD[xy(0xc88)](),
            rD[xy(0x527)](),
            rD[xy(0x130)](),
            rD[xy(0x936)](),
            this[xy(0xb5c)](rD),
            rD[xy(0x68f)](),
            rD[xy(0x16b)](),
            rD[xy(0x67d)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rD[xy(0x5d2)](-0x32, 0x1e),
            rD[xy(0x5d2)](-0x1e, 0x1e),
            rD[xy(0x5d2)](-0x1f, 0x32),
            rD[xy(0x5d2)](0x1f, 0x32),
            rD[xy(0x5d2)](0x1e, 0x1e),
            rD[xy(0x5d2)](0x32, 0x1e),
            rD[xy(0x5d2)](0x32, 0x0),
            rD[xy(0x527)](),
            rD[xy(0xc88)](),
            rD[xy(0x130)](),
            rD[xy(0x16b)](),
            rD[xy(0xe9)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rD[xy(0xe9)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rD[xy(0x5ef)] = rD[xy(0x555)]),
            rD[xy(0x527)](),
            rD[xy(0x936)]();
        }
        [us(0x523)](rD) {
          const xz = us;
          rD[xz(0x2cb)](this[xz(0xc60)] / 0x64), (rD[xz(0x555)] = xz(0x96f));
          const rE = this[xz(0xdad)](xz(0x19f)),
            rF = this[xz(0xdad)](xz(0x782));
          (this[xz(0x98d)] += (pN / 0x12c) * (this[xz(0x549)] ? 0x1 : -0x1)),
            (this[xz(0x98d)] = Math[xz(0xbe6)](
              0x1,
              Math[xz(0xdb0)](0x0, this[xz(0x98d)])
            ));
          const rG = this[xz(0x2ae)] ? 0x1 : this[xz(0x98d)],
            rH = 0x1 - rG;
          rD[xz(0x68f)](),
            rD[xz(0x16b)](),
            rD[xz(0xc8b)](
              (0x30 +
                (Math[xz(0xbe5)](this[xz(0xca3)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rG +
                (0x1 - rG) * -0x14,
              0x0
            ),
            rD[xz(0x9b0)](1.1, 1.1),
            rD[xz(0x7f4)](0x0, -0xa),
            rD[xz(0xb18)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rD[xz(0x5ef)] = rF),
            rD[xz(0x527)](),
            (rD[xz(0xd10)] = xz(0x2ab)),
            (rD[xz(0x26f)] = 0x1c),
            rD[xz(0xc88)](),
            rD[xz(0x130)](),
            rD[xz(0x936)]();
          for (let rI = 0x0; rI < 0x2; rI++) {
            const rJ = Math[xz(0xbe5)](this[xz(0xca3)] * 0x1);
            rD[xz(0x68f)]();
            const rK = rI * 0x2 - 0x1;
            rD[xz(0x9b0)](0x1, rK),
              rD[xz(0xc8b)](0x32 * rG - rH * 0xa, 0x50 * rG),
              rD[xz(0x978)](rJ * 0.2 + 0.3 - rH * 0x1),
              rD[xz(0x16b)](),
              rD[xz(0x7f4)](0xa, -0xa),
              rD[xz(0x9f0)](0x1e, 0x28, -0x14, 0x50),
              rD[xz(0x9f0)](0xa, 0x1e, -0xf, 0x0),
              (rD[xz(0x555)] = rE),
              (rD[xz(0x26f)] = 0x2c),
              (rD[xz(0x534)] = rD[xz(0xd10)] = xz(0x2ab)),
              rD[xz(0x130)](),
              (rD[xz(0x26f)] -= 0x1c),
              (rD[xz(0x5ef)] = rD[xz(0x555)] = rF),
              rD[xz(0x527)](),
              rD[xz(0x130)](),
              rD[xz(0x936)]();
          }
          for (let rL = 0x0; rL < 0x2; rL++) {
            const rM = Math[xz(0xbe5)](this[xz(0xca3)] * 0x1 + 0x1);
            rD[xz(0x68f)]();
            const rN = rL * 0x2 - 0x1;
            rD[xz(0x9b0)](0x1, rN),
              rD[xz(0xc8b)](-0x41 * rG, 0x32 * rG),
              rD[xz(0x978)](rM * 0.3 + 1.3),
              rD[xz(0x16b)](),
              rD[xz(0x7f4)](0xc, -0x5),
              rD[xz(0x9f0)](0x28, 0x1e, 0x0, 0x3c),
              rD[xz(0x9f0)](0x14, 0x1e, 0x0, 0x0),
              (rD[xz(0x555)] = rE),
              (rD[xz(0x26f)] = 0x2c),
              (rD[xz(0x534)] = rD[xz(0xd10)] = xz(0x2ab)),
              rD[xz(0x130)](),
              (rD[xz(0x26f)] -= 0x1c),
              (rD[xz(0x5ef)] = rD[xz(0x555)] = rF),
              rD[xz(0x130)](),
              rD[xz(0x527)](),
              rD[xz(0x936)]();
          }
          this[xz(0x273)](rD);
        }
        [us(0x273)](rD, rE = 0x1) {
          const xA = us;
          rD[xA(0x16b)](),
            rD[xA(0x67d)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rD[xA(0x555)] = xA(0x96f)),
            (rD[xA(0x5ef)] = this[xA(0xdad)](xA(0xaab))),
            rD[xA(0x527)](),
            (rD[xA(0x26f)] = 0x1e * rE),
            rD[xA(0x68f)](),
            rD[xA(0xc88)](),
            rD[xA(0x130)](),
            rD[xA(0x936)](),
            rD[xA(0x68f)](),
            rD[xA(0x16b)](),
            rD[xA(0x67d)](
              0x0,
              0x0,
              0x64 - rD[xA(0x26f)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rD[xA(0xc88)](),
            rD[xA(0x16b)]();
          for (let rF = 0x0; rF < 0x6; rF++) {
            const rG = (rF / 0x6) * Math["PI"] * 0x2;
            rD[xA(0x5d2)](
              Math[xA(0xb0e)](rG) * 0x28,
              Math[xA(0xbe5)](rG) * 0x28
            );
          }
          rD[xA(0xa2a)]();
          for (let rH = 0x0; rH < 0x6; rH++) {
            const rI = (rH / 0x6) * Math["PI"] * 0x2,
              rJ = Math[xA(0xb0e)](rI) * 0x28,
              rK = Math[xA(0xbe5)](rI) * 0x28;
            rD[xA(0x7f4)](rJ, rK), rD[xA(0x5d2)](rJ * 0x3, rK * 0x3);
          }
          (rD[xA(0x26f)] = 0x10 * rE),
            (rD[xA(0x534)] = rD[xA(0xd10)] = xA(0x2ab)),
            rD[xA(0x130)](),
            rD[xA(0x936)]();
        }
        [us(0x27f)](rD) {
          const xB = us;
          rD[xB(0x2cb)](this[xB(0xc60)] / 0x82);
          let rE, rF;
          const rG = 0x2d,
            rH = lp(
              this[xB(0x909)] ||
                (this[xB(0x909)] = this[xB(0x2ae)]
                  ? 0x28
                  : Math[xB(0xb7c)]() * 0x3e8)
            );
          let rI = rH() * 6.28;
          const rJ = Date[xB(0x7c4)]() / 0xc8,
            rK = [xB(0xc9e), xB(0xd8)][xB(0x466)]((rL) => this[xB(0xdad)](rL));
          for (let rL = 0x0; rL <= rG; rL++) {
            (rL % 0x5 === 0x0 || rL === rG) &&
              (rL > 0x0 &&
                ((rD[xB(0x26f)] = 0x19),
                (rD[xB(0xd10)] = rD[xB(0x534)] = xB(0x2ab)),
                (rD[xB(0x555)] = rK[0x1]),
                rD[xB(0x130)](),
                (rD[xB(0x26f)] = 0xc),
                (rD[xB(0x555)] = rK[0x0]),
                rD[xB(0x130)]()),
              rL !== rG && (rD[xB(0x16b)](), rD[xB(0x7f4)](rE, rF)));
            let rM = rL / 0x32;
            (rM *= rM), (rI += (0.3 + rH() * 0.8) * 0x3);
            const rN = 0x14 + Math[xB(0xbe5)](rM * 3.14) * 0x6e,
              rO = Math[xB(0xbe5)](rL + rJ) * 0.5,
              rP = Math[xB(0xb0e)](rI + rO) * rN,
              rQ = Math[xB(0xbe5)](rI + rO) * rN,
              rR = rP - rE,
              rS = rQ - rF;
            rD[xB(0x9f0)]((rE + rP) / 0x2 + rS, (rF + rQ) / 0x2 - rR, rP, rQ),
              (rE = rP),
              (rF = rQ);
          }
        }
        [us(0x181)](rD) {
          const xC = us;
          rD[xC(0x2cb)](this[xC(0xc60)] / 0x6e),
            (rD[xC(0x555)] = xC(0x96f)),
            (rD[xC(0x26f)] = 0x1c),
            rD[xC(0x16b)](),
            rD[xC(0x67d)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rD[xC(0x5ef)] = this[xC(0xdad)](xC(0x2cd))),
            rD[xC(0x527)](),
            rD[xC(0x68f)](),
            rD[xC(0xc88)](),
            rD[xC(0x130)](),
            rD[xC(0x936)](),
            rD[xC(0x16b)](),
            rD[xC(0x67d)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rD[xC(0x5ef)] = xC(0x85e)),
            rD[xC(0x527)](),
            rD[xC(0x68f)](),
            rD[xC(0xc88)](),
            rD[xC(0x130)](),
            rD[xC(0x936)]();
          const rE = lp(
              this[xC(0xeb)] ||
                (this[xC(0xeb)] = this[xC(0x2ae)]
                  ? 0x1e
                  : Math[xC(0xb7c)]() * 0x3e8)
            ),
            rF = this[xC(0xdad)](xC(0x338)),
            rG = this[xC(0xdad)](xC(0x18f));
          for (let rJ = 0x0; rJ < 0x3; rJ++) {
            rD[xC(0x16b)]();
            const rK = 0xc;
            for (let rL = 0x0; rL < rK; rL++) {
              const rM = (Math["PI"] * 0x2 * rL) / rK;
              rD[xC(0x68f)](),
                rD[xC(0x978)](rM + rE() * 0.4),
                rD[xC(0xc8b)](0x3c + rE() * 0xa, 0x0),
                rD[xC(0x7f4)](rE() * 0x5, rE() * 0x5),
                rD[xC(0xb18)](
                  0x14 + rE() * 0xa,
                  rE() * 0x14,
                  0x28 + rE() * 0x14,
                  rE() * 0x1e + 0xa,
                  0x3c + rE() * 0xa,
                  rE() * 0xa + 0xa
                ),
                rD[xC(0x936)]();
            }
            (rD[xC(0x534)] = rD[xC(0xd10)] = xC(0x2ab)),
              (rD[xC(0x26f)] = 0x12 - rJ * 0x2),
              (rD[xC(0x555)] = rF),
              rD[xC(0x130)](),
              (rD[xC(0x26f)] -= 0x8),
              (rD[xC(0x555)] = rG),
              rD[xC(0x130)]();
          }
          const rH = 0x28;
          rD[xC(0x978)](-this[xC(0x4c3)]),
            (rD[xC(0x5ef)] = this[xC(0xdad)](xC(0xdde))),
            (rD[xC(0x555)] = this[xC(0xdad)](xC(0x792))),
            (rD[xC(0x26f)] = 0x9);
          const rI = this[xC(0x3ab)] * 0x6;
          for (let rN = 0x0; rN < rI; rN++) {
            const rO = ((rN - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rD[xC(0x16b)](),
              rD[xC(0xe9)](
                Math[xC(0xb0e)](rO) * rH,
                Math[xC(0xbe5)](rO) * rH * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rD[xC(0x527)](),
              rD[xC(0x130)]();
          }
        }
        [us(0x992)](rD) {
          const xD = us;
          rD[xD(0x978)](-this[xD(0x4c3)]),
            rD[xD(0x2cb)](this[xD(0xc60)] / 0x3c),
            (rD[xD(0x534)] = rD[xD(0xd10)] = xD(0x2ab));
          let rE =
            Math[xD(0xbe5)](Date[xD(0x7c4)]() / 0x12c + this[xD(0xca3)] * 0.5) *
              0.5 +
            0.5;
          (rE *= 1.5),
            rD[xD(0x16b)](),
            rD[xD(0x7f4)](-0x32, -0x32 - rE * 0x3),
            rD[xD(0x9f0)](0x0, -0x3c, 0x32, -0x32 - rE * 0x3),
            rD[xD(0x9f0)](0x50 - rE * 0x3, -0xa, 0x50, 0x32),
            rD[xD(0x9f0)](0x46, 0x4b, 0x28, 0x4e + rE * 0x5),
            rD[xD(0x5d2)](0x1e, 0x3c + rE * 0x5),
            rD[xD(0x9f0)](0x2d, 0x37, 0x32, 0x2d),
            rD[xD(0x9f0)](0x0, 0x41, -0x32, 0x32),
            rD[xD(0x9f0)](-0x2d, 0x37, -0x1e, 0x3c + rE * 0x3),
            rD[xD(0x5d2)](-0x28, 0x4e + rE * 0x5),
            rD[xD(0x9f0)](-0x46, 0x4b, -0x50, 0x32),
            rD[xD(0x9f0)](-0x50 + rE * 0x3, -0xa, -0x32, -0x32 - rE * 0x3),
            (rD[xD(0x5ef)] = this[xD(0xdad)](xD(0xa36))),
            rD[xD(0x527)](),
            (rD[xD(0x555)] = xD(0x96f)),
            rD[xD(0x68f)](),
            rD[xD(0xc88)](),
            (rD[xD(0x26f)] = 0xe),
            rD[xD(0x130)](),
            rD[xD(0x936)]();
          for (let rF = 0x0; rF < 0x2; rF++) {
            rD[xD(0x68f)](),
              rD[xD(0x9b0)](rF * 0x2 - 0x1, 0x1),
              rD[xD(0xc8b)](-0x22, -0x18 - rE * 0x3),
              rD[xD(0x978)](-0.6),
              rD[xD(0x9b0)](1.3, 1.3),
              rD[xD(0x16b)](),
              rD[xD(0x7f4)](-0x14, 0x0),
              rD[xD(0x9f0)](-0x14, -0x19, 0x0, -0x28),
              rD[xD(0x9f0)](0x14, -0x19, 0x14, 0x0),
              rD[xD(0x527)](),
              rD[xD(0xc88)](),
              (rD[xD(0x26f)] = 0xd),
              rD[xD(0x130)](),
              rD[xD(0x936)]();
          }
          rD[xD(0x68f)](),
            rD[xD(0x16b)](),
            rD[xD(0xe9)](
              0x0,
              0x1e,
              0x24 - rE * 0x2,
              0x8 - rE,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rD[xD(0x5ef)] = this[xD(0xdad)](xD(0x1b1))),
            (rD[xD(0x23f)] *= 0.2),
            rD[xD(0x527)](),
            rD[xD(0x936)](),
            (rD[xD(0x5ef)] = rD[xD(0x555)] = this[xD(0xdad)](xD(0xa9a)));
          for (let rG = 0x0; rG < 0x2; rG++) {
            rD[xD(0x68f)](),
              rD[xD(0x9b0)](rG * 0x2 - 0x1, 0x1),
              rD[xD(0xc8b)](0x19 - rE * 0x1, 0xf - rE * 0x3),
              rD[xD(0x978)](-0.3),
              rD[xD(0x16b)](),
              rD[xD(0x67d)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rD[xD(0x527)](),
              rD[xD(0x936)]();
          }
          rD[xD(0x68f)](),
            (rD[xD(0x26f)] = 0x5),
            rD[xD(0xc8b)](0x0, 0x21 - rE * 0x1),
            rD[xD(0x16b)](),
            rD[xD(0x7f4)](-0xc, 0x0),
            rD[xD(0xb18)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rD[xD(0xb18)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rD[xD(0x130)](),
            rD[xD(0x936)]();
        }
        [us(0x221)](rD) {
          const xE = us;
          rD[xE(0x2cb)](this[xE(0xc60)] / 0x3c),
            rD[xE(0x978)](-Math["PI"] / 0x2),
            rD[xE(0x16b)](),
            rD[xE(0x7f4)](0x32, 0x50),
            rD[xE(0x9f0)](0x1e, 0x1e, 0x32, -0x14),
            rD[xE(0x9f0)](0x5a, -0x64, 0x0, -0x64),
            rD[xE(0x9f0)](-0x5a, -0x64, -0x32, -0x14),
            rD[xE(0x9f0)](-0x1e, 0x1e, -0x32, 0x50),
            (rD[xE(0x5ef)] = this[xE(0xdad)](xE(0x93d))),
            rD[xE(0x527)](),
            (rD[xE(0xd10)] = rD[xE(0x534)] = xE(0x2ab)),
            (rD[xE(0x26f)] = 0x14),
            rD[xE(0xc88)](),
            (rD[xE(0x555)] = xE(0x96f)),
            rD[xE(0x130)](),
            (rD[xE(0x5ef)] = this[xE(0xdad)](xE(0x4fc)));
          const rE = 0x6;
          rD[xE(0x16b)](), rD[xE(0x7f4)](-0x32, 0x50);
          for (let rF = 0x0; rF < rE; rF++) {
            const rG = (((rF + 0.5) / rE) * 0x2 - 0x1) * 0x32,
              rH = (((rF + 0x1) / rE) * 0x2 - 0x1) * 0x32;
            rD[xE(0x9f0)](rG, 0x1e, rH, 0x50);
          }
          (rD[xE(0x26f)] = 0x8),
            rD[xE(0x527)](),
            rD[xE(0x130)](),
            (rD[xE(0x555)] = rD[xE(0x5ef)] = xE(0x96f)),
            rD[xE(0x68f)](),
            rD[xE(0xc8b)](0x0, -0x5),
            rD[xE(0x16b)](),
            rD[xE(0x7f4)](0x0, 0x0),
            rD[xE(0xb18)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rD[xE(0x130)](),
            rD[xE(0x936)]();
          for (let rI = 0x0; rI < 0x2; rI++) {
            rD[xE(0x68f)](),
              rD[xE(0x9b0)](rI * 0x2 - 0x1, 0x1),
              rD[xE(0xc8b)](0x19, -0x38),
              rD[xE(0x16b)](),
              rD[xE(0x67d)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rD[xE(0xc88)](),
              (rD[xE(0x26f)] = 0xf),
              rD[xE(0x130)](),
              rD[xE(0x527)](),
              rD[xE(0x936)]();
          }
        }
        [us(0x1f9)](rD) {
          const xF = us;
          rD[xF(0x2cb)](this[xF(0xc60)] / 0x32),
            (rD[xF(0x555)] = xF(0x96f)),
            (rD[xF(0x26f)] = 0x10);
          const rE = 0x7;
          rD[xF(0x16b)]();
          const rF = 0x12;
          rD[xF(0x5ef)] = this[xF(0xdad)](xF(0x13e));
          const rG = Math[xF(0xbe5)](pM / 0x258);
          for (let rH = 0x0; rH < 0x2; rH++) {
            const rI = 1.2 - rH * 0.2;
            for (let rJ = 0x0; rJ < rE; rJ++) {
              rD[xF(0x68f)](),
                rD[xF(0x978)](
                  (rJ / rE) * Math["PI"] * 0x2 + (rH / rE) * Math["PI"]
                ),
                rD[xF(0xc8b)](0x2e, 0x0),
                rD[xF(0x9b0)](rI, rI);
              const rK = Math[xF(0xbe5)](rG + rJ * 0.05 * (0x1 - rH * 0.5));
              rD[xF(0x16b)](),
                rD[xF(0x7f4)](0x0, rF),
                rD[xF(0x9f0)](0x14, rF, 0x28 + rK, 0x0 + rK * 0x5),
                rD[xF(0x9f0)](0x14, -rF, 0x0, -rF),
                rD[xF(0x527)](),
                rD[xF(0xc88)](),
                rD[xF(0x130)](),
                rD[xF(0x936)]();
            }
          }
          rD[xF(0x16b)](),
            rD[xF(0x67d)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rD[xF(0x5ef)] = this[xF(0xdad)](xF(0x28b))),
            rD[xF(0x527)](),
            rD[xF(0xc88)](),
            (rD[xF(0x26f)] = 0x19),
            rD[xF(0x130)]();
        }
        [us(0x188)](rD) {
          const xG = us;
          rD[xG(0x2cb)](this[xG(0xc60)] / 0x28);
          let rE = this[xG(0xca3)];
          const rF = this[xG(0x2ae)] ? 0x0 : Math[xG(0xbe5)](pM / 0x64) * 0xf;
          (rD[xG(0x534)] = rD[xG(0xd10)] = xG(0x2ab)),
            rD[xG(0x16b)](),
            rD[xG(0x68f)]();
          const rG = 0x3;
          for (let rH = 0x0; rH < 0x2; rH++) {
            const rI = rH === 0x0 ? 0x1 : -0x1;
            for (let rJ = 0x0; rJ <= rG; rJ++) {
              rD[xG(0x68f)](), rD[xG(0x7f4)](0x0, 0x0);
              const rK = Math[xG(0xbe5)](rE + rJ + rH);
              rD[xG(0x978)](((rJ / rG) * 0x2 - 0x1) * 0.6 + 1.4 + rK * 0.15),
                rD[xG(0x5d2)](0x2d + rI * rF, 0x0),
                rD[xG(0x978)](0.2 + (rK * 0.5 + 0.5) * 0.1),
                rD[xG(0x5d2)](0x4b, 0x0),
                rD[xG(0x936)]();
            }
            rD[xG(0x9b0)](0x1, -0x1);
          }
          rD[xG(0x936)](),
            (rD[xG(0x26f)] = 0x8),
            (rD[xG(0x555)] = this[xG(0xdad)](xG(0x9b8))),
            rD[xG(0x130)](),
            rD[xG(0x68f)](),
            rD[xG(0xc8b)](0x0, rF),
            this[xG(0xb9f)](rD),
            rD[xG(0x936)]();
        }
        [us(0xb9f)](rD, rE = ![]) {
          const xH = us;
          (rD[xH(0x534)] = rD[xH(0xd10)] = xH(0x2ab)),
            rD[xH(0x978)](-0.15),
            rD[xH(0x16b)](),
            rD[xH(0x7f4)](-0x32, 0x0),
            rD[xH(0x5d2)](0x28, 0x0),
            rD[xH(0x7f4)](0xf, 0x0),
            rD[xH(0x5d2)](-0x5, 0x19),
            rD[xH(0x7f4)](-0x3, 0x0),
            rD[xH(0x5d2)](0xc, -0x14),
            rD[xH(0x7f4)](-0xe, -0x5),
            rD[xH(0x5d2)](-0x2e, -0x17),
            (rD[xH(0x26f)] = 0x1c),
            (rD[xH(0x555)] = this[xH(0xdad)](xH(0x399))),
            rD[xH(0x130)](),
            (rD[xH(0x555)] = this[xH(0xdad)](xH(0x7eb))),
            (rD[xH(0x26f)] -= rE ? 0xf : 0xa),
            rD[xH(0x130)]();
        }
        [us(0x734)](rD) {
          const xI = us;
          rD[xI(0x2cb)](this[xI(0xc60)] / 0x64),
            rD[xI(0x16b)](),
            rD[xI(0x67d)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rD[xI(0x5ef)] = this[xI(0xdad)](xI(0x42d))),
            rD[xI(0x527)](),
            rD[xI(0xc88)](),
            (rD[xI(0x26f)] = this[xI(0x27a)] ? 0x32 : 0x1e),
            (rD[xI(0x555)] = xI(0x96f)),
            rD[xI(0x130)]();
          if (!this[xI(0x8fd)]) {
            const rE = new Path2D(),
              rF = this[xI(0x27a)] ? 0x2 : 0x3;
            for (let rG = 0x0; rG <= rF; rG++) {
              for (let rH = 0x0; rH <= rF; rH++) {
                const rI =
                    ((rH / rF + Math[xI(0xb7c)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rG % 0x2 === 0x0 ? -0x14 : 0x0),
                  rJ = ((rG / rF + Math[xI(0xb7c)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rK = Math[xI(0xb7c)]() * 0xd + (this[xI(0x27a)] ? 0xe : 0x7);
                rE[xI(0x7f4)](rI, rJ),
                  rE[xI(0x67d)](rI, rJ, rK, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xI(0x8fd)] = rE;
          }
          rD[xI(0x16b)](),
            rD[xI(0x67d)](
              0x0,
              0x0,
              0x64 - rD[xI(0x26f)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rD[xI(0xc88)](),
            (rD[xI(0x5ef)] = xI(0x6c5)),
            rD[xI(0x527)](this[xI(0x8fd)]);
        }
        [us(0x496)](rD) {
          const xJ = us;
          rD[xJ(0x2cb)](this[xJ(0xc60)] / 0x64),
            rD[xJ(0x68f)](),
            rD[xJ(0xc8b)](-0xf5, -0xdc),
            (rD[xJ(0x555)] = this[xJ(0xdad)](xJ(0x758))),
            (rD[xJ(0x5ef)] = this[xJ(0xdad)](xJ(0x8cc))),
            (rD[xJ(0x26f)] = 0xf),
            (rD[xJ(0xd10)] = rD[xJ(0x534)] = xJ(0x2ab));
          const rE = !this[xJ(0x27a)];
          if (rE) {
            rD[xJ(0x68f)](),
              rD[xJ(0xc8b)](0x10e, 0xde),
              rD[xJ(0x68f)](),
              rD[xJ(0x978)](-0.1);
            for (let rF = 0x0; rF < 0x3; rF++) {
              rD[xJ(0x16b)](),
                rD[xJ(0x7f4)](-0x5, 0x0),
                rD[xJ(0x9f0)](0x0, 0x28, 0x5, 0x0),
                rD[xJ(0x130)](),
                rD[xJ(0x527)](),
                rD[xJ(0xc8b)](0x28, 0x0);
            }
            rD[xJ(0x936)](), rD[xJ(0xc8b)](0x17, 0x32), rD[xJ(0x978)](0.05);
            for (let rG = 0x0; rG < 0x2; rG++) {
              rD[xJ(0x16b)](),
                rD[xJ(0x7f4)](-0x5, 0x0),
                rD[xJ(0x9f0)](0x0, -0x28, 0x5, 0x0),
                rD[xJ(0x130)](),
                rD[xJ(0x527)](),
                rD[xJ(0xc8b)](0x28, 0x0);
            }
            rD[xJ(0x936)]();
          }
          rD[xJ(0x527)](lm),
            rD[xJ(0x130)](lm),
            rD[xJ(0x527)](ln),
            rD[xJ(0x130)](ln),
            rD[xJ(0x936)](),
            rE &&
              (rD[xJ(0x16b)](),
              rD[xJ(0x67d)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rD[xJ(0x67d)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rD[xJ(0x5ef)] = xJ(0x96f)),
              rD[xJ(0x527)]());
        }
        [us(0x970)](rD) {
          const xK = us;
          rD[xK(0x2cb)](this[xK(0xc60)] / 0x46), rD[xK(0x68f)]();
          !this[xK(0x27a)] && rD[xK(0x978)](Math["PI"] / 0x2);
          rD[xK(0xc8b)](0x0, 0x2d),
            rD[xK(0x16b)](),
            rD[xK(0x7f4)](0x0, -0x64),
            rD[xK(0xb18)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rD[xK(0xb18)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rD[xK(0x534)] = rD[xK(0xd10)] = xK(0x2ab)),
            (rD[xK(0x26f)] = 0x3c),
            (rD[xK(0x555)] = this[xK(0xdad)](xK(0xd9f))),
            rD[xK(0x130)](),
            (rD[xK(0x26f)] -= this[xK(0x27a)] ? 0x23 : 0x14),
            (rD[xK(0x5ef)] = rD[xK(0x555)] = this[xK(0xdad)](xK(0xa16))),
            rD[xK(0x130)](),
            (rD[xK(0x26f)] -= this[xK(0x27a)] ? 0x16 : 0xf),
            (rD[xK(0x5ef)] = rD[xK(0x555)] = this[xK(0xdad)](xK(0x9f3))),
            rD[xK(0x130)](),
            rD[xK(0x527)](),
            rD[xK(0xc8b)](0x0, -0x24);
          if (this[xK(0x27a)]) rD[xK(0x2cb)](0.9);
          rD[xK(0x16b)](),
            rD[xK(0xe9)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rD[xK(0x5ef)] = this[xK(0xdad)](xK(0x421))),
            rD[xK(0x527)](),
            rD[xK(0xc88)](),
            (rD[xK(0x26f)] = 0xd),
            (rD[xK(0x555)] = xK(0x96f)),
            rD[xK(0x130)](),
            rD[xK(0x16b)](),
            rD[xK(0xe9)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rD[xK(0x5ef)] = xK(0x6e5)),
            rD[xK(0x527)](),
            rD[xK(0x936)]();
        }
        [us(0xdbe)](rD) {
          const xL = us;
          rD[xL(0x2cb)](this[xL(0xc60)] / 0x19);
          !this[xL(0x2ae)] &&
            this[xL(0x27a)] &&
            rD[xL(0x978)](Math[xL(0xbe5)](pM / 0x64 + this["id"]) * 0.15);
          rD[xL(0x16b)](),
            rD[xL(0x66c)](-0x16, -0x16, 0x2c, 0x2c),
            (rD[xL(0x5ef)] = this[xL(0xdad)](xL(0x666))),
            rD[xL(0x527)](),
            (rD[xL(0x26f)] = 0x6),
            (rD[xL(0xd10)] = xL(0x2ab)),
            (rD[xL(0x555)] = this[xL(0xdad)](xL(0x8cc))),
            rD[xL(0x130)](),
            rD[xL(0x16b)]();
          const rE = this[xL(0x2ae)] ? 0x1 : 0x1 - Math[xL(0xbe5)](pM / 0x1f4),
            rF = rJ(0x0, 0.25),
            rG = 0x1 - rJ(0.25, 0.25),
            rH = rJ(0.5, 0.25),
            rI = rJ(0.75, 0.25);
          function rJ(rK, rL) {
            const xM = xL;
            return Math[xM(0xbe6)](0x1, Math[xM(0xdb0)](0x0, (rE - rK) / rL));
          }
          rD[xL(0x978)]((rG * Math["PI"]) / 0x4);
          for (let rK = 0x0; rK < 0x2; rK++) {
            const rL = (rK * 0x2 - 0x1) * 0x7 * rI;
            for (let rM = 0x0; rM < 0x3; rM++) {
              let rN = rF * (-0xb + rM * 0xb);
              rD[xL(0x7f4)](rN, rL),
                rD[xL(0x67d)](rN, rL, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rD[xL(0x5ef)] = this[xL(0xdad)](xL(0x5dc))), rD[xL(0x527)]();
        }
        [us(0x74e)](rD) {
          const xN = us;
          rD[xN(0x68f)](),
            rD[xN(0xc8b)](this["x"], this["y"]),
            this[xN(0xb8c)](rD),
            rD[xN(0x978)](this[xN(0x4c3)]),
            (rD[xN(0x26f)] = 0x8);
          const rE = (rJ, rK) => {
              const xO = xN;
              (rG = this[xO(0xc60)] / 0x14),
                rD[xO(0x9b0)](rG, rG),
                rD[xO(0x16b)](),
                rD[xO(0x67d)](0x0, 0x0, 0x14, 0x0, l0),
                (rD[xO(0x5ef)] = this[xO(0xdad)](rJ)),
                rD[xO(0x527)](),
                (rD[xO(0x555)] = this[xO(0xdad)](rK)),
                rD[xO(0x130)]();
            },
            rF = (rJ, rK, rL) => {
              const xP = xN;
              (rJ = l8[rJ]),
                rD[xP(0x9b0)](this[xP(0xc60)], this[xP(0xc60)]),
                (rD[xP(0x26f)] /= this[xP(0xc60)]),
                (rD[xP(0x555)] = this[xP(0xdad)](rL)),
                rD[xP(0x130)](rJ),
                (rD[xP(0x5ef)] = this[xP(0xdad)](rK)),
                rD[xP(0x527)](rJ);
            };
          let rG, rH, rI;
          switch (this[xN(0x41e)]) {
            case cS[xN(0xdbe)]:
            case cS[xN(0x7ce)]:
              this[xN(0xdbe)](rD);
              break;
            case cS[xN(0x970)]:
            case cS[xN(0x806)]:
              this[xN(0x970)](rD);
              break;
            case cS[xN(0x9a9)]:
              (rD[xN(0x555)] = xN(0x96f)),
                (rD[xN(0x26f)] = 0x14),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x88c))),
                rD[xN(0xc8b)](-this[xN(0xc60)], 0x0),
                rD[xN(0x978)](-Math["PI"] / 0x2),
                rD[xN(0x2cb)](0.5),
                rD[xN(0xc8b)](0x0, 0x46),
                this[xN(0xb5c)](rD, this[xN(0xc60)] * 0x4);
              break;
            case cS[xN(0x4a1)]:
              this[xN(0x4a1)](rD);
              break;
            case cS[xN(0x83a)]:
              this[xN(0x496)](rD);
              break;
            case cS[xN(0x496)]:
              this[xN(0x496)](rD);
              break;
            case cS[xN(0x734)]:
            case cS[xN(0x491)]:
              this[xN(0x734)](rD);
              break;
            case cS[xN(0x9ad)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x1e), this[xN(0xb9f)](rD, !![]);
              break;
            case cS[xN(0x188)]:
              this[xN(0x188)](rD);
              break;
            case cS[xN(0xa99)]:
              (rD[xN(0x26f)] *= 0.7),
                rF(xN(0x239), xN(0x13e), xN(0x4e2)),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0.6, 0x0, l0),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x28b))),
                rD[xN(0x527)](),
                rD[xN(0xc88)](),
                (rD[xN(0x555)] = xN(0x42a)),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x1f9)]:
              this[xN(0x1f9)](rD);
              break;
            case cS[xN(0x35e)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x16),
                rD[xN(0x978)](Math["PI"] / 0x2),
                rD[xN(0x16b)]();
              for (let sv = 0x0; sv < 0x2; sv++) {
                rD[xN(0x7f4)](-0xa, -0x1e),
                  rD[xN(0xb18)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rD[xN(0x9b0)](0x1, -0x1);
              }
              (rD[xN(0x26f)] = 0x10),
                (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x8d2))),
                rD[xN(0x130)](),
                (rD[xN(0x26f)] -= 0x7),
                (rD[xN(0x555)] = xN(0xb28)),
                rD[xN(0x130)]();
              break;
            case cS[xN(0xb5b)]:
              this[xN(0x221)](rD);
              break;
            case cS[xN(0x26a)]:
              this[xN(0x992)](rD);
              break;
            case cS[xN(0x181)]:
              this[xN(0x181)](rD);
              break;
            case cS[xN(0x27f)]:
              this[xN(0x27f)](rD);
              break;
            case cS[xN(0x146)]:
              !this[xN(0xda)] &&
                ((this[xN(0xda)] = new lT(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cY[xN(0xc8e)],
                  0x19
                )),
                (this[xN(0xda)][xN(0xd11)] = !![]),
                (this[xN(0xda)][xN(0x4e0)] = !![]),
                (this[xN(0xda)][xN(0x12f)] = 0x1),
                (this[xN(0xda)][xN(0x1d7)] = !![]),
                (this[xN(0xda)][xN(0x324)] = xN(0x340)),
                (this[xN(0xda)][xN(0x78b)] = this[xN(0x78b)]));
              rD[xN(0x978)](Math["PI"] / 0x2),
                (this[xN(0xda)][xN(0x6d3)] = this[xN(0x6d3)]),
                (this[xN(0xda)][xN(0xc60)] = this[xN(0xc60)]),
                this[xN(0xda)][xN(0x74e)](rD);
              break;
            case cS[xN(0x523)]:
              this[xN(0x523)](rD);
              break;
            case cS[xN(0x779)]:
              rD[xN(0x68f)](),
                rD[xN(0x2cb)](this[xN(0xc60)] / 0x64),
                rD[xN(0x978)]((Date[xN(0x7c4)]() / 0x190) % 6.28),
                this[xN(0x273)](rD, 1.5),
                rD[xN(0x936)]();
              break;
            case cS[xN(0x449)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x14),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x0, -0x5),
                rD[xN(0x5d2)](-0x8, 0x0),
                rD[xN(0x5d2)](0x0, 0x5),
                rD[xN(0x5d2)](0x8, 0x0),
                rD[xN(0xa2a)](),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x20),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x92f))),
                rD[xN(0x130)](),
                (rD[xN(0x26f)] = 0x14),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x3cc))),
                rD[xN(0x130)]();
              break;
            case cS[xN(0xd34)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x14),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x5, -0x5),
                rD[xN(0x5d2)](-0x5, 0x5),
                rD[xN(0x5d2)](0x5, 0x0),
                rD[xN(0xa2a)](),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x20),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0xb04))),
                rD[xN(0x130)](),
                (rD[xN(0x26f)] = 0x14),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x1d8))),
                rD[xN(0x130)]();
              break;
            case cS[xN(0xa5a)]:
              this[xN(0x80d)](rD, xN(0xc45));
              break;
            case cS[xN(0x1be)]:
              this[xN(0x80d)](rD, xN(0x845));
              break;
            case cS[xN(0x117)]:
              this[xN(0x80d)](rD, xN(0x2d9));
              break;
            case cS[xN(0x4c1)]:
              this[xN(0x4c1)](rD);
              break;
            case cS[xN(0x663)]:
              this[xN(0x663)](rD);
              break;
            case cS[xN(0xc6)]:
              this[xN(0xc6)](rD);
              break;
            case cS[xN(0x475)]:
              this[xN(0xc6)](rD, !![]);
              break;
            case cS[xN(0x29b)]:
              this[xN(0x29b)](rD);
              break;
            case cS[xN(0x791)]:
              this[xN(0x791)](rD);
              break;
            case cS[xN(0xa4d)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x19),
                lE(rD, 0x19),
                (rD[xN(0xd10)] = xN(0x2ab)),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x807))),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0xe8))),
                rD[xN(0x527)](),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x9ac)]:
              rD[xN(0xc8b)](-this[xN(0xc60)], 0x0);
              const rJ = Date[xN(0x7c4)]() / 0x32,
                rK = this[xN(0xc60)] * 0x2;
              rD[xN(0x16b)]();
              const rL = 0x32;
              for (let sw = 0x0; sw < rL; sw++) {
                const sx = sw / rL,
                  sy = sx * Math["PI"] * (this[xN(0x2ae)] ? 7.75 : 0xa) - rJ,
                  sz = sx * rK,
                  sA = sz * this[xN(0x17b)];
                rD[xN(0x5d2)](sz, Math[xN(0xbe5)](sy) * sA);
              }
              (rD[xN(0x555)] = xN(0x18c)),
                (rD[xN(0xd10)] = rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x4),
                (rD[xN(0x400)] = xN(0x668)),
                (rD[xN(0xa7a)] = this[xN(0x2ae)] ? 0xa : 0x14),
                rD[xN(0x130)](),
                rD[xN(0x130)](),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x769)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x37), this[xN(0xb69)](rD);
              break;
            case cS[xN(0x94a)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x14), rD[xN(0x16b)]();
              for (let sB = 0x0; sB < 0x2; sB++) {
                rD[xN(0x7f4)](-0x17, -0x5),
                  rD[xN(0x9f0)](0x0, 5.5, 0x17, -0x5),
                  rD[xN(0x9b0)](0x1, -0x1);
              }
              (rD[xN(0x26f)] = 0xf),
                (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x8cc))),
                rD[xN(0x130)](),
                (rD[xN(0x26f)] -= 0x6),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x666))),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x11a)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x23),
                rD[xN(0x16b)](),
                rD[xN(0xe9)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x11f))),
                rD[xN(0x527)](),
                rD[xN(0xc88)](),
                (rD[xN(0x555)] = xN(0x85e)),
                (rD[xN(0x26f)] = 0x12),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x1e, 0x0),
                rD[xN(0xb18)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rD[xN(0xb18)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rD[xN(0x26f)] = 0x3),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                (rD[xN(0x555)] = rD[xN(0x5ef)] = xN(0xa70)),
                rD[xN(0x527)](),
                rD[xN(0x130)]();
              break;
            case cS[xN(0xa26)]:
              if (this[xN(0x6d8)] !== this[xN(0xb3a)]) {
                this[xN(0x6d8)] = this[xN(0xb3a)];
                const sC = new Path2D(),
                  sD = Math[xN(0x2ab)](
                    this[xN(0xb3a)] * (this[xN(0xb3a)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sE = (Math["PI"] * 0x2) / sD,
                  sF = this[xN(0xb3a)] < 0x64 ? 0.3 : 0.1;
                for (let sG = 0x0; sG < sD; sG++) {
                  const sH = sG * sE,
                    sI = sH + Math[xN(0xb7c)]() * sE,
                    sJ = 0x1 - Math[xN(0xb7c)]() * sF;
                  sC[xN(0x5d2)](
                    Math[xN(0xb0e)](sI) * this[xN(0xb3a)] * sJ,
                    Math[xN(0xbe5)](sI) * this[xN(0xb3a)] * sJ
                  );
                }
                sC[xN(0xa2a)](), (this[xN(0x70c)] = sC);
              }
              (rG = this[xN(0xc60)] / this[xN(0xb3a)]), rD[xN(0x9b0)](rG, rG);
              const rM = this[xN(0x52a)] ? lh : [xN(0x98b), xN(0x9d5)];
              (rD[xN(0x555)] = this[xN(0xdad)](rM[0x1])),
                rD[xN(0x130)](this[xN(0x70c)]),
                (rD[xN(0x5ef)] = this[xN(0xdad)](rM[0x0])),
                rD[xN(0x527)](this[xN(0x70c)]);
              break;
            case cS[xN(0xb2c)]:
              if (this[xN(0x6d8)] !== this[xN(0xb3a)]) {
                this[xN(0x6d8)] = this[xN(0xb3a)];
                const sK = Math[xN(0x2ab)](
                    this[xN(0xb3a)] > 0xc8
                      ? this[xN(0xb3a)] * 0.18
                      : this[xN(0xb3a)] * 0.25
                  ),
                  sL = 0.5,
                  sM = 0.85;
                this[xN(0x70c)] = la(sK, this[xN(0xb3a)], sL, sM);
                if (this[xN(0xb3a)] < 0x12c) {
                  const sN = new Path2D(),
                    sO = sK * 0x2;
                  for (let sP = 0x0; sP < sO; sP++) {
                    const sQ = ((sP + 0x1) / sO) * Math["PI"] * 0x2;
                    let sR = (sP % 0x2 === 0x0 ? 0.7 : 1.2) * this[xN(0xb3a)];
                    sN[xN(0x5d2)](
                      Math[xN(0xb0e)](sQ) * sR,
                      Math[xN(0xbe5)](sQ) * sR
                    );
                  }
                  sN[xN(0xa2a)](), (this[xN(0x127)] = sN);
                } else this[xN(0x127)] = null;
              }
              (rG = this[xN(0xc60)] / this[xN(0xb3a)]), rD[xN(0x9b0)](rG, rG);
              this[xN(0x127)] &&
                ((rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x53e))),
                rD[xN(0x527)](this[xN(0x127)]));
              (rD[xN(0x555)] = this[xN(0xdad)](xN(0xc97))),
                rD[xN(0x130)](this[xN(0x70c)]),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x357))),
                rD[xN(0x527)](this[xN(0x70c)]);
              break;
            case cS[xN(0x2d2)]:
              rD[xN(0x68f)](),
                (rG = this[xN(0xc60)] / 0x28),
                rD[xN(0x9b0)](rG, rG),
                (rD[xN(0x5ef)] = rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab));
              for (let sS = 0x0; sS < 0x2; sS++) {
                const sT = sS === 0x0 ? 0x1 : -0x1;
                rD[xN(0x68f)](),
                  rD[xN(0xc8b)](0x1c, sT * 0xd),
                  rD[xN(0x978)](
                    Math[xN(0xbe5)](this[xN(0xca3)] * 1.24) * 0.1 * sT
                  ),
                  rD[xN(0x16b)](),
                  rD[xN(0x7f4)](0x0, sT * 0x6),
                  rD[xN(0x5d2)](0x14, sT * 0xb),
                  rD[xN(0x5d2)](0x28, 0x0),
                  rD[xN(0x9f0)](0x14, sT * 0x5, 0x0, 0x0),
                  rD[xN(0xa2a)](),
                  rD[xN(0x527)](),
                  rD[xN(0x130)](),
                  rD[xN(0x936)]();
              }
              (rH = this[xN(0x52a)] ? lh : [xN(0xc47), xN(0x5e0)]),
                (rD[xN(0x5ef)] = this[xN(0xdad)](rH[0x0])),
                rD[xN(0x527)](l5),
                (rD[xN(0x26f)] = 0x6),
                (rD[xN(0x5ef)] = rD[xN(0x555)] = this[xN(0xdad)](rH[0x1])),
                rD[xN(0x130)](l5),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x15, 0x0),
                rD[xN(0x9f0)](0x0, -0x3, 0x15, 0x0),
                (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x7),
                rD[xN(0x130)]();
              const rN = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rD[xN(0x16b)]();
              for (let sU = 0x0; sU < 0x2; sU++) {
                const sV = sU === 0x1 ? 0x1 : -0x1;
                for (let sW = 0x0; sW < rN[xN(0x8c2)]; sW++) {
                  let [sX, sY] = rN[sW];
                  (sY *= sV),
                    rD[xN(0x7f4)](sX, sY),
                    rD[xN(0x67d)](sX, sY, 0x5, 0x0, l0);
                }
              }
              rD[xN(0x527)](), rD[xN(0x527)](), rD[xN(0x936)]();
              break;
            case cS[xN(0x6a6)]:
            case cS[xN(0xf3)]:
              rD[xN(0x68f)](),
                (rG = this[xN(0xc60)] / 0x28),
                rD[xN(0x9b0)](rG, rG);
              const rO = this[xN(0x41e)] === cS[xN(0x6a6)];
              rO &&
                (rD[xN(0x68f)](),
                rD[xN(0xc8b)](-0x2d, 0x0),
                rD[xN(0x978)](Math["PI"]),
                this[xN(0x205)](rD, 0xf / 1.1),
                rD[xN(0x936)]());
              (rH = this[xN(0x52a)]
                ? lh
                : rO
                ? [xN(0xb63), xN(0xb32)]
                : [xN(0xa91), xN(0xc0a)]),
                rD[xN(0x16b)](),
                rD[xN(0xe9)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, l0),
                (rD[xN(0x26f)] = 0xa),
                (rD[xN(0x555)] = this[xN(0xdad)](rH[0x1])),
                rD[xN(0x130)](),
                (rD[xN(0x5ef)] = this[xN(0xdad)](rH[0x0])),
                rD[xN(0x527)](),
                rD[xN(0x68f)](),
                rD[xN(0xc88)](),
                rD[xN(0x16b)]();
              const rP = [-0x1e, -0x5, 0x16];
              for (let sZ = 0x0; sZ < rP[xN(0x8c2)]; sZ++) {
                const t0 = rP[sZ];
                rD[xN(0x7f4)](t0, -0x32),
                  rD[xN(0x9f0)](t0 - 0x14, 0x0, t0, 0x32);
              }
              (rD[xN(0x26f)] = 0xe),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                rD[xN(0x130)](),
                rD[xN(0x936)]();
              rO ? this[xN(0xbf4)](rD) : this[xN(0x595)](rD);
              rD[xN(0x936)]();
              break;
            case cS[xN(0x5bc)]:
              (rG = this[xN(0xc60)] / 0x32), rD[xN(0x9b0)](rG, rG);
              const rQ = 0x2f;
              rD[xN(0x16b)]();
              for (let t1 = 0x0; t1 < 0x8; t1++) {
                let t2 =
                  (0.25 + ((t1 % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xN(0xbe5)](t1 + this[xN(0xca3)] * 1.3) * 0.2;
                t1 >= 0x4 && (t2 *= -0x1),
                  rD[xN(0x7f4)](0x0, 0x0),
                  rD[xN(0x5d2)](
                    Math[xN(0xb0e)](t2) * rQ,
                    Math[xN(0xbe5)](t2) * rQ
                  );
              }
              (rD[xN(0x26f)] = 0x7),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                (rD[xN(0x534)] = xN(0x2ab)),
                rD[xN(0x130)](),
                (rD[xN(0x5ef)] = rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x6);
              for (let t3 = 0x0; t3 < 0x2; t3++) {
                const t4 = t3 === 0x0 ? 0x1 : -0x1;
                rD[xN(0x68f)](),
                  rD[xN(0xc8b)](0x16, t4 * 0xa),
                  rD[xN(0x978)](
                    -(Math[xN(0xbe5)](this[xN(0xca3)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      t4
                  ),
                  rD[xN(0x16b)](),
                  rD[xN(0x7f4)](0x0, t4 * 0x6),
                  rD[xN(0x9f0)](0x14, t4 * 0xf, 0x28, 0x0),
                  rD[xN(0x9f0)](0x14, t4 * 0x5, 0x0, 0x0),
                  rD[xN(0xa2a)](),
                  rD[xN(0x527)](),
                  rD[xN(0x130)](),
                  rD[xN(0x936)]();
              }
              (rD[xN(0x26f)] = 0x8),
                l9(
                  rD,
                  0x1,
                  0x8,
                  this[xN(0xdad)](xN(0x264)),
                  this[xN(0xdad)](xN(0x831))
                );
              let rR;
              (rR = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rD[xN(0x16b)]();
              for (let t5 = 0x0; t5 < rR[xN(0x8c2)]; t5++) {
                const [t6, t7] = rR[t5];
                rD[xN(0x7f4)](t6, -t7),
                  rD[xN(0x9f0)](t6 + Math[xN(0x638)](t6) * 4.2, 0x0, t6, t7);
              }
              (rD[xN(0x534)] = xN(0x2ab)),
                rD[xN(0x130)](),
                rD[xN(0xc8b)](-0x21, 0x0),
                l9(
                  rD,
                  0.45,
                  0x8,
                  this[xN(0xdad)](xN(0xabe)),
                  this[xN(0xdad)](xN(0xdc5))
                ),
                rD[xN(0x16b)](),
                (rR = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let t8 = 0x0; t8 < rR[xN(0x8c2)]; t8++) {
                const [t9, ta] = rR[t8];
                rD[xN(0x7f4)](t9, -ta), rD[xN(0x9f0)](t9 - 0x3, 0x0, t9, ta);
              }
              (rD[xN(0x26f)] = 0x5),
                (rD[xN(0x534)] = xN(0x2ab)),
                rD[xN(0x130)](),
                rD[xN(0xc8b)](0x11, 0x0),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x0, -0x9),
                rD[xN(0x5d2)](0x0, 0x9),
                rD[xN(0x5d2)](0xb, 0x0),
                rD[xN(0xa2a)](),
                (rD[xN(0xd10)] = rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x6),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x4cd))),
                rD[xN(0x527)](),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x1c8)]:
              this[xN(0xa06)](rD, xN(0xbe8), xN(0xa48), xN(0xda5));
              break;
            case cS[xN(0x2fa)]:
              this[xN(0xa06)](rD, xN(0xa23), xN(0xca2), xN(0x59e));
              break;
            case cS[xN(0x3fe)]:
              this[xN(0xa06)](rD, xN(0xa00), xN(0xd9a), xN(0xda5));
              break;
            case cS[xN(0xd61)]:
              (rG = this[xN(0xc60)] / 0x46),
                rD[xN(0x2cb)](rG),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x3ba))),
                rD[xN(0x527)](lc),
                rD[xN(0xc88)](lc),
                (rD[xN(0x26f)] = 0xf),
                (rD[xN(0x555)] = xN(0xbbe)),
                rD[xN(0x130)](lc),
                (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x7),
                (rD[xN(0x555)] = xN(0x6e8)),
                rD[xN(0x130)](ld);
              break;
            case cS[xN(0x561)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x28),
                this[xN(0xb0f)](rD, 0x32, 0x1e, 0x7);
              break;
            case cS[xN(0x39d)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x64),
                this[xN(0xb0f)](rD),
                (rD[xN(0x5ef)] = rD[xN(0x555)]);
              const rS = 0x6,
                rT = 0x3;
              rD[xN(0x16b)]();
              for (let tb = 0x0; tb < rS; tb++) {
                const tc = (tb / rS) * Math["PI"] * 0x2;
                rD[xN(0x68f)](), rD[xN(0x978)](tc);
                for (let td = 0x0; td < rT; td++) {
                  const te = td / rT,
                    tf = 0x12 + te * 0x44,
                    tg = 0x7 + te * 0x6;
                  rD[xN(0x7f4)](tf, 0x0),
                    rD[xN(0x67d)](tf, 0x0, tg, 0x0, Math["PI"] * 0x2);
                }
                rD[xN(0x936)]();
              }
              rD[xN(0x527)]();
              break;
            case cS[xN(0x78c)]:
              (rG = this[xN(0xc60)] / 0x31),
                rD[xN(0x2cb)](rG),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                (rI = this[xN(0xca3)] * 0x15e);
              const rU = (Math[xN(0xbe5)](rI * 0.01) * 0.5 + 0.5) * 0.1;
              (rD[xN(0x555)] = rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x53e))),
                (rD[xN(0x26f)] = 0x3);
              for (let th = 0x0; th < 0x2; th++) {
                rD[xN(0x68f)]();
                const ti = th * 0x2 - 0x1;
                rD[xN(0x9b0)](0x1, ti),
                  rD[xN(0xc8b)](0x1c, -0x27),
                  rD[xN(0x9b0)](1.5, 1.5),
                  rD[xN(0x978)](rU),
                  rD[xN(0x16b)](),
                  rD[xN(0x7f4)](0x0, 0x0),
                  rD[xN(0x9f0)](0xc, -0x8, 0x14, 0x3),
                  rD[xN(0x5d2)](0xb, 0x1),
                  rD[xN(0x5d2)](0x11, 0x9),
                  rD[xN(0x9f0)](0xc, 0x5, 0x0, 0x6),
                  rD[xN(0xa2a)](),
                  rD[xN(0x130)](),
                  rD[xN(0x527)](),
                  rD[xN(0x936)]();
              }
              rD[xN(0x16b)]();
              for (let tj = 0x0; tj < 0x2; tj++) {
                for (let tk = 0x0; tk < 0x4; tk++) {
                  const tl = tj * 0x2 - 0x1,
                    tm =
                      (Math[xN(0xbe5)](rI * 0.005 + tj + tk * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rD[xN(0x68f)](),
                    rD[xN(0x9b0)](0x1, tl),
                    rD[xN(0xc8b)]((tk / 0x3) * 0x1e - 0xf, 0x28);
                  const tn = tk < 0x2 ? 0x1 : -0x1;
                  rD[xN(0x978)](tm * tn),
                    rD[xN(0x7f4)](0x0, 0x0),
                    rD[xN(0xc8b)](0x0, 0x19),
                    rD[xN(0x5d2)](0x0, 0x0),
                    rD[xN(0x978)](tn * 0.7 * (tm + 0.3)),
                    rD[xN(0x5d2)](0x0, 0xa),
                    rD[xN(0x936)]();
                }
              }
              (rD[xN(0x26f)] = 0xa),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x2, 0x17),
                rD[xN(0x9f0)](0x17, 0x0, 0x2, -0x17),
                rD[xN(0x5d2)](-0xa, -0xf),
                rD[xN(0x5d2)](-0xa, 0xf),
                rD[xN(0xa2a)](),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x267))),
                (rD[xN(0x26f)] = 0x44),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                rD[xN(0x130)](),
                (rD[xN(0x26f)] -= 0x12),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0xa7c))),
                rD[xN(0x130)](),
                (rD[xN(0x555)] = xN(0x96f)),
                rD[xN(0x16b)]();
              const rV = 0x12;
              for (let to = 0x0; to < 0x2; to++) {
                rD[xN(0x7f4)](-0x12, rV),
                  rD[xN(0x9f0)](0x0, -0x7 + rV, 0x12, rV),
                  rD[xN(0x9b0)](0x1, -0x1);
              }
              (rD[xN(0x26f)] = 0x9), rD[xN(0x130)]();
              break;
            case cS[xN(0x29f)]:
              (rG = this[xN(0xc60)] / 0x50),
                rD[xN(0x2cb)](rG),
                rD[xN(0x978)](
                  ((Date[xN(0x7c4)]() / 0x7d0) % l0) + this[xN(0xca3)] * 0.4
                );
              const rW = 0x5;
              !this[xN(0xac9)] &&
                (this[xN(0xac9)] = Array(rW)[xN(0x527)](0x64));
              const rX = this[xN(0xac9)],
                rY = this[xN(0xd11)]
                  ? 0x0
                  : Math[xN(0x815)](this[xN(0xb24)] * (rW - 0x1));
              rD[xN(0x16b)]();
              for (let tp = 0x0; tp < rW; tp++) {
                const tq = ((tp + 0.5) / rW) * Math["PI"] * 0x2,
                  tr = ((tp + 0x1) / rW) * Math["PI"] * 0x2;
                rX[tp] += ((tp < rY ? 0x64 : 0x3c) - rX[tp]) * 0.2;
                const ts = rX[tp];
                if (tp === 0x0) rD[xN(0x7f4)](ts, 0x0);
                rD[xN(0x9f0)](
                  Math[xN(0xb0e)](tq) * 0x5,
                  Math[xN(0xbe5)](tq) * 0x5,
                  Math[xN(0xb0e)](tr) * ts,
                  Math[xN(0xbe5)](tr) * ts
                );
              }
              rD[xN(0xa2a)](),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x1c + 0xa),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x36b))),
                rD[xN(0x130)](),
                (rD[xN(0x26f)] = 0x10 + 0xa),
                (rD[xN(0x555)] = rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x7c3))),
                rD[xN(0x527)](),
                rD[xN(0x130)](),
                rD[xN(0x16b)]();
              for (let tu = 0x0; tu < rW; tu++) {
                const tv = (tu / rW) * Math["PI"] * 0x2;
                rD[xN(0x68f)](), rD[xN(0x978)](tv);
                const tw = rX[tu] / 0x64;
                let tx = 0x1a;
                const ty = 0x4;
                for (let tz = 0x0; tz < ty; tz++) {
                  const tA = (0x1 - (tz / ty) * 0.7) * 0xc * tw;
                  rD[xN(0x7f4)](tx, 0x0),
                    rD[xN(0x67d)](tx, 0x0, tA, 0x0, Math["PI"] * 0x2),
                    (tx += tA * 0x2 + 3.5 * tw);
                }
                rD[xN(0x936)]();
              }
              (rD[xN(0x5ef)] = xN(0xa72)), rD[xN(0x527)]();
              break;
            case cS[xN(0x250)]:
              (rG = this[xN(0xc60)] / 0x1e),
                rD[xN(0x2cb)](rG),
                rD[xN(0xc8b)](-0x22, 0x0),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x0, -0x8),
                rD[xN(0x9f0)](0x9b, 0x0, 0x0, 0x8),
                rD[xN(0xa2a)](),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x1a),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x36b))),
                rD[xN(0x130)](),
                (rD[xN(0x26f)] = 0x10),
                (rD[xN(0x555)] = rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x7c3))),
                rD[xN(0x527)](),
                rD[xN(0x130)](),
                rD[xN(0x16b)]();
              let rZ = 0xd;
              for (let tB = 0x0; tB < 0x4; tB++) {
                const tC = (0x1 - (tB / 0x4) * 0.7) * 0xa;
                rD[xN(0x7f4)](rZ, 0x0),
                  rD[xN(0x67d)](rZ, 0x0, tC, 0x0, Math["PI"] * 0x2),
                  (rZ += tC * 0x2 + 0x4);
              }
              (rD[xN(0x5ef)] = xN(0xa72)), rD[xN(0x527)]();
              break;
            case cS[xN(0x3cf)]:
              (rG = this[xN(0xc60)] / 0x64),
                rD[xN(0x9b0)](rG, rG),
                (rD[xN(0xd10)] = rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x555)] = xN(0x5d0)),
                (rD[xN(0x26f)] = 0x14);
              const s0 = [0x1, 0.63, 0.28],
                s1 = this[xN(0x52a)] ? lo : [xN(0xbe1), xN(0x389), xN(0xd12)],
                s3 = (pM * 0.005) % l0;
              for (let tD = 0x0; tD < 0x3; tD++) {
                const tE = s0[tD],
                  tF = s1[tD];
                rD[xN(0x68f)](),
                  rD[xN(0x978)](s3 * (tD % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rD[xN(0x16b)]();
                const tG = 0x7 - tD;
                for (let tH = 0x0; tH < tG; tH++) {
                  const tI = (Math["PI"] * 0x2 * tH) / tG;
                  rD[xN(0x5d2)](
                    Math[xN(0xb0e)](tI) * tE * 0x64,
                    Math[xN(0xbe5)](tI) * tE * 0x64
                  );
                }
                rD[xN(0xa2a)](),
                  (rD[xN(0x555)] = rD[xN(0x5ef)] = this[xN(0xdad)](tF)),
                  rD[xN(0x527)](),
                  rD[xN(0x130)](),
                  rD[xN(0x936)]();
              }
              break;
            case cS[xN(0xd7b)]:
              (rG = this[xN(0xc60)] / 0x41),
                rD[xN(0x9b0)](rG, rG),
                (rI = this[xN(0xca3)] * 0x2),
                rD[xN(0x978)](Math["PI"] / 0x2);
              if (this[xN(0x549)]) {
                const tJ = 0x3;
                rD[xN(0x16b)]();
                for (let tN = 0x0; tN < 0x2; tN++) {
                  for (let tO = 0x0; tO <= tJ; tO++) {
                    const tP = (tO / tJ) * 0x50 - 0x28;
                    rD[xN(0x68f)]();
                    const tQ = tN * 0x2 - 0x1;
                    rD[xN(0xc8b)](tQ * -0x2d, tP);
                    const tR =
                      1.1 + Math[xN(0xbe5)]((tO / tJ) * Math["PI"]) * 0.5;
                    rD[xN(0x9b0)](tR * tQ, tR),
                      rD[xN(0x978)](Math[xN(0xbe5)](rI + tO + tQ) * 0.3 + 0.3),
                      rD[xN(0x7f4)](0x0, 0x0),
                      rD[xN(0x9f0)](-0xf, -0x5, -0x14, 0xa),
                      rD[xN(0x936)]();
                  }
                }
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                  (rD[xN(0x26f)] = 0x8),
                  (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                  rD[xN(0x130)](),
                  (rD[xN(0x26f)] = 0xc);
                const tK = Date[xN(0x7c4)]() * 0.01,
                  tL = Math[xN(0xbe5)](tK * 0.5) * 0.5 + 0.5,
                  tM = tL * 0.1 + 0x1;
                rD[xN(0x16b)](),
                  rD[xN(0x67d)](-0xf * tM, 0x2b - tL, 0x10, 0x0, Math["PI"]),
                  rD[xN(0x67d)](0xf * tM, 0x2b - tL, 0x10, 0x0, Math["PI"]),
                  rD[xN(0x7f4)](-0x16, -0x2b),
                  rD[xN(0x67d)](0x0, -0x2b - tL, 0x16, 0x0, Math["PI"], !![]),
                  (rD[xN(0x555)] = this[xN(0xdad)](xN(0x5c2))),
                  rD[xN(0x130)](),
                  (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0xc47))),
                  rD[xN(0x527)](),
                  rD[xN(0x68f)](),
                  rD[xN(0x978)]((Math["PI"] * 0x3) / 0x2),
                  this[xN(0x595)](rD, 0x1a - tL, 0x0),
                  rD[xN(0x936)]();
              }
              if (!this[xN(0xb17)]) {
                const tS = dI[d9[xN(0x547)]],
                  tT = Math[xN(0xdb0)](this["id"] % tS[xN(0x8c2)], 0x0),
                  tU = new lN(-0x1, 0x0, 0x0, tS[tT]["id"]);
                (tU[xN(0x60e)] = 0x1),
                  (tU[xN(0x4c3)] = 0x0),
                  (this[xN(0xb17)] = tU);
              }
              rD[xN(0x2cb)](1.3), this[xN(0xb17)][xN(0x74e)](rD);
              break;
            case cS[xN(0x2f6)]:
              (rG = this[xN(0xc60)] / 0x14),
                rD[xN(0x9b0)](rG, rG),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x11, 0x0),
                rD[xN(0x5d2)](0x0, 0x0),
                rD[xN(0x5d2)](0x11, 0x6),
                rD[xN(0x7f4)](0x0, 0x0),
                rD[xN(0x5d2)](0xb, -0x7),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0xb72))),
                (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0xc),
                rD[xN(0x130)](),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x403))),
                (rD[xN(0x26f)] = 0x6),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x8e8)]:
              (rG = this[xN(0xc60)] / 0x80),
                rD[xN(0x2cb)](rG),
                rD[xN(0xc8b)](-0x80, -0x78),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x61e))),
                rD[xN(0x527)](f9[xN(0x47a)]),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0xb6c))),
                (rD[xN(0x26f)] = 0x14),
                rD[xN(0x130)](f9[xN(0x47a)]);
              break;
            case cS[xN(0x967)]:
              (rG = this[xN(0xc60)] / 0x19),
                rD[xN(0x9b0)](rG, rG),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x19, 0x0),
                rD[xN(0x5d2)](-0x2d, 0x0),
                (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x14),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x666))),
                rD[xN(0x527)](),
                (rD[xN(0x26f)] = 0x7),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x2dd))),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x2a8)]:
              rD[xN(0x978)](-this[xN(0x4c3)]),
                rD[xN(0x2cb)](this[xN(0xc60)] / 0x14),
                this[xN(0x6ef)](rD),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x666))),
                rD[xN(0x527)](),
                rD[xN(0xc88)](),
                (rD[xN(0x26f)] = 0xc),
                (rD[xN(0x555)] = xN(0x96f)),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x233)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x64), this[xN(0x76c)](rD);
              break;
            case cS[xN(0x828)]:
              this[xN(0x75d)](rD, !![]);
              break;
            case cS[xN(0x4c7)]:
              this[xN(0x75d)](rD, ![]);
              break;
            case cS[xN(0x777)]:
              (rG = this[xN(0xc60)] / 0xa),
                rD[xN(0x2cb)](rG),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x0, 0x8),
                rD[xN(0x9f0)](2.5, 0x0, 0x0, -0x8),
                (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0xa),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x2dd))),
                rD[xN(0x130)](),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x666))),
                (rD[xN(0x26f)] = 0x6),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x986)]:
              (rG = this[xN(0xc60)] / 0xa),
                rD[xN(0x2cb)](rG),
                rD[xN(0xc8b)](0x7, 0x0),
                (rD[xN(0x534)] = xN(0x2ab)),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x5, -0x5),
                rD[xN(0xb18)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rD[xN(0xb18)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x53e))),
                rD[xN(0x527)](),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x946))),
                (rD[xN(0x26f)] = 0x3),
                (rD[xN(0xd10)] = xN(0x2ab)),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x755)]:
              (rG = this[xN(0xc60)] / 0x32), rD[xN(0x2cb)](rG), rD[xN(0x16b)]();
              for (let tV = 0x0; tV < 0x9; tV++) {
                const tW = (tV / 0x9) * Math["PI"] * 0x2,
                  tX =
                    0x3c *
                    (0x1 +
                      Math[xN(0xb0e)]((tV / 0x9) * Math["PI"] * 3.5) * 0.07);
                rD[xN(0x7f4)](0x0, 0x0),
                  rD[xN(0x5d2)](
                    Math[xN(0xb0e)](tW) * tX,
                    Math[xN(0xbe5)](tW) * tX
                  );
              }
              (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x10),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x666))),
                rD[xN(0x527)](),
                (rD[xN(0x26f)] = 0x6),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x2dd))),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x808)]:
              rD[xN(0x68f)](),
                (rG = this[xN(0xc60)] / 0x28),
                rD[xN(0x9b0)](rG, rG),
                this[xN(0x196)](rD),
                (rD[xN(0x5ef)] = this[xN(0xdad)](
                  this[xN(0x52a)] ? lh[0x0] : xN(0x398)
                )),
                (rD[xN(0x555)] = xN(0x4e4)),
                (rD[xN(0x26f)] = 0x10),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rD[xN(0x527)](),
                rD[xN(0x68f)](),
                rD[xN(0xc88)](),
                rD[xN(0x130)](),
                rD[xN(0x936)](),
                rD[xN(0x936)]();
              break;
            case cS[xN(0x213)]:
            case cS[xN(0xb38)]:
            case cS[xN(0x837)]:
            case cS[xN(0x5f4)]:
            case cS[xN(0x2e1)]:
            case cS[xN(0x24b)]:
            case cS[xN(0x208)]:
            case cS[xN(0x132)]:
              (rG = this[xN(0xc60)] / 0x14), rD[xN(0x9b0)](rG, rG);
              const s4 = Math[xN(0xbe5)](this[xN(0xca3)] * 1.6),
                s5 = this[xN(0x635)][xN(0x439)](xN(0x213)),
                s6 = this[xN(0x635)][xN(0x439)](xN(0xd00)),
                s7 = this[xN(0x635)][xN(0x439)](xN(0x837)),
                s8 = this[xN(0x635)][xN(0x439)](xN(0x837)) ? -0x4 : 0x0;
              (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x6);
              s6 && rD[xN(0xc8b)](0x8, 0x0);
              for (let tY = 0x0; tY < 0x2; tY++) {
                const tZ = tY === 0x0 ? -0x1 : 0x1;
                rD[xN(0x68f)](), rD[xN(0x978)](tZ * (s4 * 0.5 + 0.6) * 0.08);
                const u0 = tZ * 0x4;
                rD[xN(0x16b)](),
                  rD[xN(0x7f4)](0x0, u0),
                  rD[xN(0x9f0)](0xc, 0x6 * tZ + u0, 0x18, u0),
                  rD[xN(0x130)](),
                  rD[xN(0x936)]();
              }
              if (this[xN(0x52a)])
                (rD[xN(0x5ef)] = this[xN(0xdad)](lh[0x0])),
                  (rD[xN(0x555)] = this[xN(0xdad)](lh[0x1]));
              else
                this[xN(0x635)][xN(0x426)](xN(0x412))
                  ? ((rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x4ef))),
                    (rD[xN(0x555)] = this[xN(0xdad)](xN(0x827))))
                  : ((rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x6d2))),
                    (rD[xN(0x555)] = this[xN(0xdad)](xN(0x1b7))));
              rD[xN(0x26f)] = s6 ? 0x9 : 0xc;
              s6 &&
                (rD[xN(0x68f)](),
                rD[xN(0xc8b)](-0x18, 0x0),
                rD[xN(0x9b0)](-0x1, 0x1),
                lF(rD, 0x15, rD[xN(0x5ef)], rD[xN(0x555)], rD[xN(0x26f)]),
                rD[xN(0x936)]());
              !s7 &&
                (rD[xN(0x68f)](),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](-0xa, 0x0, s6 ? 0x12 : 0xc, 0x0, l0),
                rD[xN(0x527)](),
                rD[xN(0xc88)](),
                rD[xN(0x130)](),
                rD[xN(0x936)]());
              if (s5 || s6) {
                rD[xN(0x68f)](),
                  (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x88c))),
                  (rD[xN(0x23f)] *= 0.5);
                const u1 = (Math["PI"] / 0x7) * (s6 ? 0.85 : 0x1) + s4 * 0.08;
                for (let u2 = 0x0; u2 < 0x2; u2++) {
                  const u3 = u2 === 0x0 ? -0x1 : 0x1;
                  rD[xN(0x68f)](),
                    rD[xN(0x978)](u3 * u1),
                    rD[xN(0xc8b)](
                      s6 ? -0x13 : -0x9,
                      u3 * -0x3 * (s6 ? 1.3 : 0x1)
                    ),
                    rD[xN(0x16b)](),
                    rD[xN(0xe9)](
                      0x0,
                      0x0,
                      s6 ? 0x14 : 0xe,
                      s6 ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      l0
                    ),
                    rD[xN(0x527)](),
                    rD[xN(0x936)]();
                }
                rD[xN(0x936)]();
              }
              rD[xN(0x68f)](),
                rD[xN(0xc8b)](0x4 + s8, 0x0),
                lF(
                  rD,
                  s7 ? 0x14 : 12.1,
                  rD[xN(0x5ef)],
                  rD[xN(0x555)],
                  rD[xN(0x26f)]
                ),
                rD[xN(0x936)]();
              break;
            case cS[xN(0xa96)]:
              this[xN(0x1fa)](rD, xN(0x24f));
              break;
            case cS[xN(0xc4)]:
              this[xN(0x1fa)](rD, xN(0xd88));
              break;
            case cS[xN(0x179)]:
              this[xN(0x1fa)](rD, xN(0x4cd)),
                (rD[xN(0x23f)] *= 0.2),
                lJ(rD, this[xN(0xc60)] * 1.3, 0x4);
              break;
            case cS[xN(0x49e)]:
            case cS[xN(0x884)]:
            case cS[xN(0x833)]:
            case cS[xN(0x8c5)]:
            case cS[xN(0x839)]:
            case cS[xN(0xb6f)]:
              rD[xN(0x68f)](),
                (rG = this[xN(0xc60)] / 0x28),
                rD[xN(0x9b0)](rG, rG),
                rD[xN(0x16b)]();
              for (let u4 = 0x0; u4 < 0x2; u4++) {
                rD[xN(0x68f)](),
                  rD[xN(0x9b0)](0x1, u4 * 0x2 - 0x1),
                  rD[xN(0xc8b)](0x0, 0x23),
                  rD[xN(0x7f4)](0x9, 0x0),
                  rD[xN(0x5d2)](0x5, 0xa),
                  rD[xN(0x5d2)](-0x5, 0xa),
                  rD[xN(0x5d2)](-0x9, 0x0),
                  rD[xN(0x5d2)](0x9, 0x0),
                  rD[xN(0x936)]();
              }
              (rD[xN(0x26f)] = 0x12),
                (rD[xN(0xd10)] = rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x555)] = rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x3c1))),
                rD[xN(0x527)](),
                rD[xN(0x130)]();
              let s9;
              if (this[xN(0x635)][xN(0xaa0)](xN(0xd0)) > -0x1)
                s9 = [xN(0xd4e), xN(0xace)];
              else
                this[xN(0x635)][xN(0xaa0)](xN(0x9e4)) > -0x1
                  ? (s9 = [xN(0xc47), xN(0x17d)])
                  : (s9 = [xN(0xc15), xN(0x2b7)]);
              rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0x28, 0x0, l0),
                (rD[xN(0x5ef)] = this[xN(0xdad)](s9[0x0])),
                rD[xN(0x527)](),
                (rD[xN(0x26f)] = 0x8),
                (rD[xN(0x555)] = this[xN(0xdad)](s9[0x1])),
                rD[xN(0x130)]();
              this[xN(0x635)][xN(0xaa0)](xN(0x673)) > -0x1 &&
                this[xN(0x595)](rD, -0xf, 0x0, 1.25, 0x4);
              rD[xN(0x936)]();
              break;
            case cS[xN(0xcf1)]:
            case cS[xN(0x5b9)]:
              (rI =
                Math[xN(0xbe5)](
                  Date[xN(0x7c4)]() / 0x3e8 + this[xN(0xca3)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rG = this[xN(0xc60)] / 0x50),
                rD[xN(0x9b0)](rG, rG);
              const sa = this[xN(0x41e)] === cS[xN(0x5b9)];
              sa &&
                (rD[xN(0x68f)](),
                rD[xN(0x9b0)](0x2, 0x2),
                this[xN(0x196)](rD),
                rD[xN(0x936)]());
              rD[xN(0x978)](-this[xN(0x4c3)]),
                (rD[xN(0x26f)] = 0xa),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (rH = this[xN(0x52a)]
                  ? lh
                  : sa
                  ? [xN(0xd26), xN(0xb3c)]
                  : [xN(0x2ce), xN(0xc25)]),
                (rD[xN(0x5ef)] = this[xN(0xdad)](rH[0x0])),
                rD[xN(0x527)](),
                rD[xN(0xc88)](),
                (rD[xN(0x555)] = this[xN(0xdad)](rH[0x1])),
                rD[xN(0x130)]();
              const sb = this[xN(0xdad)](xN(0x666)),
                sc = this[xN(0xdad)](xN(0xda5)),
                sd = (u5 = 0x1) => {
                  const xQ = xN;
                  rD[xQ(0x68f)](),
                    rD[xQ(0x9b0)](u5, 0x1),
                    rD[xQ(0xc8b)](0x13 - rI * 0x4, -0x1d + rI * 0x5),
                    rD[xQ(0x16b)](),
                    rD[xQ(0x7f4)](0x0, 0x0),
                    rD[xQ(0xb18)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rD[xQ(0x9f0)](0x19, 0x5 + rI * 0x2, 0x0, 0x0),
                    rD[xQ(0xa2a)](),
                    (rD[xQ(0x26f)] = 0x3),
                    rD[xQ(0x130)](),
                    (rD[xQ(0x5ef)] = sb),
                    rD[xQ(0x527)](),
                    rD[xQ(0xc88)](),
                    rD[xQ(0x16b)](),
                    rD[xQ(0x67d)](
                      0x16 + u5 * this[xQ(0xb07)] * 0x10,
                      -0x4 + this[xQ(0x536)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rD[xQ(0x5ef)] = sc),
                    rD[xQ(0x527)](),
                    rD[xQ(0x936)]();
                };
              sd(0x1),
                sd(-0x1),
                rD[xN(0x68f)](),
                rD[xN(0xc8b)](0x0, 0xa),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x28 + rI * 0xa, -0xe + rI * 0x5),
                rD[xN(0x9f0)](0x0, +rI * 0x5, 0x2c - rI * 0xf, -0xe + rI * 0x5),
                rD[xN(0xb18)](
                  0x14,
                  0x28 - rI * 0x14,
                  -0x14,
                  0x28 - rI * 0x14,
                  -0x28 + rI * 0xa,
                  -0xe + rI * 0x5
                ),
                rD[xN(0xa2a)](),
                (rD[xN(0x26f)] = 0x5),
                rD[xN(0x130)](),
                (rD[xN(0x5ef)] = sc),
                rD[xN(0x527)](),
                rD[xN(0xc88)]();
              const se = rI * 0x2,
                sf = rI * -0xa;
              rD[xN(0x68f)](),
                rD[xN(0xc8b)](0x0, sf),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x37, -0x8),
                rD[xN(0xb18)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rD[xN(0x555)] = sb),
                (rD[xN(0x26f)] = 0xd),
                rD[xN(0x130)](),
                (rD[xN(0x26f)] = 0x4),
                (rD[xN(0x555)] = sc),
                rD[xN(0x16b)]();
              for (let u5 = 0x0; u5 < 0x6; u5++) {
                const u6 = (((u5 + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rD[xN(0x7f4)](u6, 0xa), rD[xN(0x5d2)](u6, 0x46);
              }
              rD[xN(0x130)](),
                rD[xN(0x936)](),
                rD[xN(0x68f)](),
                rD[xN(0xc8b)](0x0, se),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x32, -0x14),
                rD[xN(0x9f0)](0x0, 0x8, 0x32, -0x12),
                (rD[xN(0x555)] = sb),
                (rD[xN(0x26f)] = 0xd),
                rD[xN(0x130)](),
                (rD[xN(0x26f)] = 0x5),
                (rD[xN(0x555)] = sc),
                rD[xN(0x16b)]();
              for (let u7 = 0x0; u7 < 0x6; u7++) {
                let u8 = (((u7 + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rD[xN(0x7f4)](u8, -0x14), rD[xN(0x5d2)](u8, 0x2);
              }
              rD[xN(0x130)](), rD[xN(0x936)](), rD[xN(0x936)]();
              const sg = 0x1 - rI;
              (rD[xN(0x23f)] *= Math[xN(0xdb0)](0x0, (sg - 0.3) / 0.7)),
                rD[xN(0x16b)]();
              for (let u9 = 0x0; u9 < 0x2; u9++) {
                rD[xN(0x68f)](),
                  u9 === 0x1 && rD[xN(0x9b0)](-0x1, 0x1),
                  rD[xN(0xc8b)](
                    -0x33 + rI * (0xa + u9 * 3.4) - u9 * 3.4,
                    -0xf + rI * (0x5 - u9 * 0x1)
                  ),
                  rD[xN(0x7f4)](0xa, 0x0),
                  rD[xN(0x67d)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rD[xN(0x936)]();
              }
              rD[xN(0xc8b)](0x0, 0x28),
                rD[xN(0x7f4)](0x28 - rI * 0xa, -0xe + rI * 0x5),
                rD[xN(0xb18)](
                  0x14,
                  0x14 - rI * 0xa,
                  -0x14,
                  0x14 - rI * 0xa,
                  -0x28 + rI * 0xa,
                  -0xe + rI * 0x5
                ),
                (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x2),
                rD[xN(0x130)]();
              break;
            case cS[xN(0xb7)]:
              (rG = this[xN(0xc60)] / 0x14), rD[xN(0x9b0)](rG, rG);
              const sh = rD[xN(0x23f)];
              (rD[xN(0x555)] = rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x666))),
                (rD[xN(0x23f)] = 0.6 * sh),
                rD[xN(0x16b)]();
              for (let ua = 0x0; ua < 0xa; ua++) {
                const ub = (ua / 0xa) * Math["PI"] * 0x2;
                rD[xN(0x68f)](),
                  rD[xN(0x978)](ub),
                  rD[xN(0xc8b)](17.5, 0x0),
                  rD[xN(0x7f4)](0x0, 0x0);
                const uc = Math[xN(0xbe5)](ub + Date[xN(0x7c4)]() / 0x1f4);
                rD[xN(0x978)](uc * 0.5),
                  rD[xN(0x9f0)](0x4, -0x2 * uc, 0xe, 0x0),
                  rD[xN(0x936)]();
              }
              (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 2.3),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rD[xN(0x23f)] = 0.5 * sh),
                rD[xN(0x527)](),
                rD[xN(0xc88)](),
                (rD[xN(0x26f)] = 0x3),
                rD[xN(0x130)](),
                (rD[xN(0x26f)] = 1.2),
                (rD[xN(0x23f)] = 0.6 * sh),
                rD[xN(0x16b)](),
                (rD[xN(0x534)] = xN(0x2ab));
              for (let ud = 0x0; ud < 0x4; ud++) {
                rD[xN(0x68f)](),
                  rD[xN(0x978)]((ud / 0x4) * Math["PI"] * 0x2),
                  rD[xN(0xc8b)](0x4, 0x0),
                  rD[xN(0x7f4)](0x0, -0x2),
                  rD[xN(0xb18)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rD[xN(0x936)]();
              }
              rD[xN(0x130)]();
              break;
            case cS[xN(0x7ed)]:
              this[xN(0x7ed)](rD);
              break;
            case cS[xN(0x1e8)]:
              this[xN(0x7ed)](rD, !![]);
              break;
            case cS[xN(0xb76)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x32),
                (rD[xN(0x26f)] = 0x19),
                (rD[xN(0xd10)] = xN(0x2ab));
              const si = this[xN(0x2ae)]
                ? 0.6
                : (Date[xN(0x7c4)]() / 0x4b0) % 6.28;
              for (let ue = 0x0; ue < 0xa; ue++) {
                const uf = 0x1 - ue / 0xa,
                  ug =
                    uf *
                    0x50 *
                    (0x1 +
                      (Math[xN(0xbe5)](si * 0x3 + ue * 0.5 + this[xN(0xca3)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rD[xN(0x978)](si),
                  (rD[xN(0x555)] = this[xN(0xdad)](lg[ue])),
                  rD[xN(0x39b)](-ug / 0x2, -ug / 0x2, ug, ug);
              }
              break;
            case cS[xN(0x1d9)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x12),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x19, -0xa),
                rD[xN(0x9f0)](0x0, -0x2, 0x19, -0xa),
                rD[xN(0x9f0)](0x1e, 0x0, 0x19, 0xa),
                rD[xN(0x9f0)](0x0, 0x2, -0x19, 0xa),
                rD[xN(0x9f0)](-0x1e, 0x0, -0x19, -0xa),
                rD[xN(0xa2a)](),
                (rD[xN(0xd10)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0x4),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0xa5c))),
                rD[xN(0x130)](),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x95f))),
                rD[xN(0x527)](),
                rD[xN(0xc88)](),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x19, -0xa),
                rD[xN(0x9f0)](0x14, 0x0, 0x19, 0xa),
                rD[xN(0x5d2)](0x28, 0xa),
                rD[xN(0x5d2)](0x28, -0xa),
                (rD[xN(0x5ef)] = xN(0x4e4)),
                rD[xN(0x527)](),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x0, -0xa),
                rD[xN(0x9f0)](-0x5, 0x0, 0x0, 0xa),
                (rD[xN(0x26f)] = 0xa),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0xc7b))),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x452)]:
              (rG = this[xN(0xc60)] / 0xc),
                rD[xN(0x9b0)](rG, rG),
                rD[xN(0x978)](-Math["PI"] / 0x6),
                rD[xN(0xc8b)](-0xc, 0x0),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x5, 0x0),
                rD[xN(0x5d2)](0x0, 0x0),
                (rD[xN(0x26f)] = 0x4),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x59b))),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x0, 0x0),
                rD[xN(0x9f0)](0xa, -0x14, 0x1e, 0x0),
                rD[xN(0x9f0)](0xa, 0x14, 0x0, 0x0),
                (rD[xN(0x26f)] = 0x6),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0xcdd))),
                rD[xN(0x130)](),
                rD[xN(0x527)](),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x6, 0x0),
                rD[xN(0x9f0)](0xe, -0x2, 0x16, 0x0),
                (rD[xN(0x26f)] = 3.5),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x671)]:
              rF(xN(0x671), xN(0x98b), xN(0x9d5));
              break;
            case cS[xN(0x2b8)]:
              rF(xN(0x2b8), xN(0xce9), xN(0x5fb));
              break;
            case cS[xN(0xb67)]:
              rF(xN(0xb67), xN(0x666), xN(0x2dd));
              break;
            case cS[xN(0x5c1)]:
              rF(xN(0x5c1), xN(0x666), xN(0x2dd));
              break;
            case cS[xN(0x5f1)]:
              rF(xN(0x5c1), xN(0x2ee), xN(0xb4));
              break;
            case cS[xN(0xd8e)]:
              const sj = this[xN(0x2ae)] ? 0x3c : this[xN(0xc60)] * 0x2;
              rD[xN(0xc8b)](-this[xN(0xc60)] - 0xa, 0x0),
                (rD[xN(0xd10)] = rD[xN(0x534)] = xN(0x2ab)),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x0, 0x0),
                rD[xN(0x5d2)](sj, 0x0),
                (rD[xN(0x26f)] = 0x6),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x946))),
                rD[xN(0x527)](),
                rD[xN(0xc8b)](sj, 0x0),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0xd, 0x0),
                rD[xN(0x5d2)](0x0, -3.5),
                rD[xN(0x5d2)](0x0, 3.5),
                rD[xN(0xa2a)](),
                (rD[xN(0x555)] = rD[xN(0x5ef)]),
                rD[xN(0x527)](),
                (rD[xN(0x26f)] = 0x3),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x35b)]:
              const sk = this[xN(0xc60)] * 0x2,
                sl = 0xa;
              rD[xN(0xc8b)](-this[xN(0xc60)], 0x0),
                (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x400)] = xN(0x668)),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x0, 0x0),
                rD[xN(0x5d2)](-sl * 1.8, 0x0),
                (rD[xN(0x555)] = xN(0x271)),
                (rD[xN(0x26f)] = sl * 1.4),
                rD[xN(0x130)](),
                (rD[xN(0x555)] = xN(0x5cf)),
                (rD[xN(0x26f)] *= 0.7),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x0, 0x0),
                rD[xN(0x5d2)](-sl * 0.45, 0x0),
                (rD[xN(0x555)] = xN(0x271)),
                (rD[xN(0x26f)] = sl * 0x2 + 3.5),
                rD[xN(0x130)](),
                (rD[xN(0x555)] = xN(0x954)),
                (rD[xN(0x26f)] = sl * 0x2),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, sl, 0x0, Math["PI"] * 0x2),
                (rD[xN(0x5ef)] = xN(0xd1c)),
                rD[xN(0x527)](),
                (rD[xN(0x555)] = xN(0x18c)),
                rD[xN(0x16b)]();
              const sm = (Date[xN(0x7c4)]() * 0.001) % 0x1,
                sn = sm * sk,
                so = sk * 0.2;
              rD[xN(0x7f4)](Math[xN(0xdb0)](sn - so, 0x0), 0x0),
                rD[xN(0x5d2)](Math[xN(0xbe6)](sn + so, sk), 0x0);
              const sp = Math[xN(0xbe5)](sm * Math["PI"]);
              (rD[xN(0xa7a)] = sl * 0x3 * sp),
                (rD[xN(0x26f)] = sl),
                rD[xN(0x130)](),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x0, 0x0),
                rD[xN(0x5d2)](sk, 0x0),
                (rD[xN(0x26f)] = sl),
                (rD[xN(0xa7a)] = sl),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x3c0)]:
            case cS[xN(0xd78)]:
            case cS[xN(0xb05)]:
            case cS[xN(0x100)]:
            case cS[xN(0xc77)]:
            case cS[xN(0xb22)]:
              (rG = this[xN(0xc60)] / 0x23), rD[xN(0x2cb)](rG), rD[xN(0x16b)]();
              this[xN(0x41e)] !== cS[xN(0xd78)] &&
              this[xN(0x41e)] !== cS[xN(0xc77)]
                ? rD[xN(0xe9)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, l0)
                : rD[xN(0x67d)](0x0, 0x0, 0x23, 0x0, l0);
              (rH = lr[this[xN(0x41e)]] || [xN(0xdde), xN(0x792)]),
                (rD[xN(0x5ef)] = this[xN(0xdad)](rH[0x0])),
                rD[xN(0x527)](),
                (rD[xN(0x555)] = this[xN(0xdad)](rH[0x1])),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x15a)]:
              (rD[xN(0x26f)] = 0x4),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0xcd9)),
                rF(xN(0x15a), xN(0xbb7), xN(0x173));
              break;
            case cS[xN(0x9c2)]:
              rF(xN(0x9c2), xN(0x666), xN(0x2dd));
              break;
            case cS[xN(0x83f)]:
              (rG = this[xN(0xc60)] / 0x14), rD[xN(0x9b0)](rG, rG);
              !this[xN(0x2ae)] && rD[xN(0x978)]((pM / 0x64) % 6.28);
              rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rD[xN(0x9f0)](0x0, 0xc, 0x14, 0x0),
                rD[xN(0xa2a)](),
                (rD[xN(0xd10)] = rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] *= 0.7),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x666))),
                rD[xN(0x527)](),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x2dd))),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x239)]:
              (rD[xN(0x26f)] *= 0.7),
                rF(xN(0x239), xN(0x706), xN(0x7c7)),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0.6, 0x0, l0),
                (rD[xN(0x5ef)] = xN(0x72d)),
                rD[xN(0x527)]();
              break;
            case cS[xN(0x3dc)]:
              (rD[xN(0x26f)] *= 0.8), rF(xN(0x3dc), xN(0x389), xN(0x6f5));
              break;
            case cS[xN(0x155)]:
              (rG = this[xN(0xc60)] / 0xa), rD[xN(0x9b0)](rG, rG);
              if (!this[xN(0x8b3)] || pM - this[xN(0xbca)] > 0x14) {
                this[xN(0xbca)] = pM;
                const uh = new Path2D();
                for (let ui = 0x0; ui < 0xa; ui++) {
                  const uj = (Math[xN(0xb7c)]() * 0x2 - 0x1) * 0x7,
                    uk = (Math[xN(0xb7c)]() * 0x2 - 0x1) * 0x7;
                  uh[xN(0x7f4)](uj, uk), uh[xN(0x67d)](uj, uk, 0x5, 0x0, l0);
                }
                this[xN(0x8b3)] = uh;
              }
              (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x88c))),
                rD[xN(0x527)](this[xN(0x8b3)]);
              break;
            case cS[xN(0x977)]:
            case cS[xN(0x821)]:
              (rG = this[xN(0xc60)] / 0x1e),
                rD[xN(0x9b0)](rG, rG),
                rD[xN(0x16b)]();
              const sq = 0x1 / 0x3;
              for (let ul = 0x0; ul < 0x3; ul++) {
                const um = (ul / 0x3) * Math["PI"] * 0x2;
                rD[xN(0x7f4)](0x0, 0x0),
                  rD[xN(0x67d)](0x0, 0x0, 0x1e, um, um + Math["PI"] / 0x3);
              }
              (rD[xN(0x534)] = xN(0x2ab)),
                (rD[xN(0x26f)] = 0xa),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rD[xN(0x5ef)] = this[xN(0xdad)](
                  this[xN(0x41e)] === cS[xN(0x977)] ? xN(0x70b) : xN(0x9f4)
                )),
                rD[xN(0x527)](),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x67f)]:
              rE(xN(0xa91), xN(0x87c));
              break;
            case cS[xN(0xb2d)]:
              rE(xN(0x554), xN(0x238));
              break;
            case cS[xN(0x378)]:
            case cS[xN(0x908)]:
              rE(xN(0x666), xN(0x2dd));
              break;
            case cS[xN(0xc9a)]:
              (rG = this[xN(0xc60)] / 0x14),
                rD[xN(0x9b0)](rG, rG),
                rD[xN(0x978)](-Math["PI"] / 0x4);
              const sr = rD[xN(0x26f)];
              (rD[xN(0x26f)] *= 1.5),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x14, -0x14 - sr),
                rD[xN(0x5d2)](-0x14, 0x0),
                rD[xN(0x5d2)](0x14, 0x0),
                rD[xN(0x5d2)](0x14, 0x14 + sr),
                rD[xN(0x978)](Math["PI"] / 0x2),
                rD[xN(0x7f4)](-0x14, -0x14 - sr),
                rD[xN(0x5d2)](-0x14, 0x0),
                rD[xN(0x5d2)](0x14, 0x0),
                rD[xN(0x5d2)](0x14, 0x14 + sr),
                (rD[xN(0x534)] = rD[xN(0x534)] = xN(0xcd9)),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                rD[xN(0x130)]();
              break;
            case cS[xN(0xbe3)]:
              rE(xN(0xcaa), xN(0x574));
              break;
            case cS[xN(0xd99)]:
              rE(xN(0x44a), xN(0xbcd));
              break;
            case cS[xN(0xab6)]:
              rE(xN(0xc39), xN(0x728));
              break;
            case cS[xN(0x45a)]:
              (rG = this[xN(0xc60)] / 0x14),
                rD[xN(0x9b0)](rG, rG),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0x14, 0x0, l0),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x53e))),
                rD[xN(0x527)](),
                rD[xN(0xc88)](),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x946))),
                rD[xN(0x130)](),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x8cc))),
                rD[xN(0x527)]();
              break;
            case cS[xN(0xdbd)]:
              (rG = this[xN(0xc60)] / 0x14), rD[xN(0x9b0)](rG, rG);
              const ss = (un, uo, up = ![]) => {
                  const xR = xN;
                  (rD[xR(0x534)] = xR(0x2ab)),
                    (rD[xR(0x555)] = this[xR(0xdad)](uo)),
                    (rD[xR(0x5ef)] = this[xR(0xdad)](un)),
                    rD[xR(0x16b)](),
                    rD[xR(0x67d)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rD[xR(0x130)](),
                    rD[xR(0x527)]();
                },
                st = (un, uo) => {
                  const xS = xN;
                  rD[xS(0x68f)](),
                    rD[xS(0xc88)](),
                    (rD[xS(0x534)] = xS(0x2ab)),
                    (rD[xS(0x5ef)] = this[xS(0xdad)](un)),
                    (rD[xS(0x555)] = this[xS(0xdad)](uo)),
                    rD[xS(0x527)](),
                    rD[xS(0x130)](),
                    rD[xS(0x936)]();
                };
              (rD[xN(0x534)] = xN(0x2ab)),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                st(xN(0x53e), xN(0x946)),
                rD[xN(0x978)](Math["PI"]),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rD[xN(0x67d)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rD[xN(0x67d)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                st(xN(0x666), xN(0x2dd)),
                rD[xN(0x978)](-Math["PI"]),
                rD[xN(0x16b)](),
                rD[xN(0x67d)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                st(xN(0x53e), xN(0x946));
              break;
            case cS[xN(0xaed)]:
              this[xN(0x205)](rD, this[xN(0xc60)]);
              break;
            case cS[xN(0x440)]:
              (rG = this[xN(0xc60)] / 0x28),
                rD[xN(0x9b0)](rG, rG),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](-0x1e, -0x1e),
                rD[xN(0x5d2)](0x14, 0x0),
                rD[xN(0x5d2)](-0x1e, 0x1e),
                rD[xN(0xa2a)](),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x53e))),
                (rD[xN(0x5ef)] = this[xN(0xdad)](xN(0x4cd))),
                rD[xN(0x527)](),
                (rD[xN(0x26f)] = 0x16),
                (rD[xN(0x534)] = rD[xN(0xd10)] = xN(0x2ab)),
                rD[xN(0x130)]();
              break;
            case cS[xN(0x76f)]:
              rD[xN(0x2cb)](this[xN(0xc60)] / 0x41),
                rD[xN(0xc8b)](-0xa, 0xa),
                (rD[xN(0xd10)] = rD[xN(0x534)] = xN(0x2ab)),
                rD[xN(0x68f)](),
                rD[xN(0x16b)](),
                rD[xN(0x7f4)](0x1e, 0x0),
                rD[xN(0xc8b)](
                  0x46 -
                    (Math[xN(0xbe5)](
                      Date[xN(0x7c4)]() / 0x190 + 0.8 * this[xN(0xca3)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rD[xN(0x5d2)](0x0, 0x0),
                (rD[xN(0x26f)] = 0x2a),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0xad0))),
                rD[xN(0x130)](),
                (rD[xN(0x555)] = this[xN(0xdad)](xN(0x431))),
                (rD[xN(0x26f)] -= 0xc),
                rD[xN(0x130)](),
                rD[xN(0x16b)]();
              for (let un = 0x0; un < 0x2; un++) {
                rD[xN(0x7f4)](0x9, 0x7),
                  rD[xN(0x5d2)](0x28, 0x14),
                  rD[xN(0x5d2)](0x7, 0x9),
                  rD[xN(0x5d2)](0x9, 0x7),
                  rD[xN(0x9b0)](0x1, -0x1);
              }
              (rD[xN(0x26f)] = 0x3),
                (rD[xN(0x5ef)] = rD[xN(0x555)] = xN(0x5d5)),
                rD[xN(0x130)](),
                rD[xN(0x527)](),
                rD[xN(0x936)](),
                this[xN(0xb69)](rD);
              break;
            case cS[xN(0xd87)]:
              (rG = this[xN(0xc60)] / 0x14), rD[xN(0x9b0)](rG, rG);
              const su = (uo = 0x1, up, uq) => {
                const xT = xN;
                rD[xT(0x68f)](),
                  rD[xT(0x9b0)](0x1, uo),
                  rD[xT(0x16b)](),
                  rD[xT(0x66c)](-0x64, 0x0, 0x12c, -0x12c),
                  rD[xT(0xc88)](),
                  rD[xT(0x16b)](),
                  rD[xT(0x7f4)](-0x14, 0x0),
                  rD[xT(0x9f0)](-0x12, -0x19, 0x11, -0xf),
                  (rD[xT(0x534)] = xT(0x2ab)),
                  (rD[xT(0x26f)] = 0x16),
                  (rD[xT(0x555)] = this[xT(0xdad)](uq)),
                  rD[xT(0x130)](),
                  (rD[xT(0x26f)] = 0xe),
                  (rD[xT(0x555)] = this[xT(0xdad)](up)),
                  rD[xT(0x130)](),
                  rD[xT(0x936)]();
              };
              su(0x1, xN(0xb13), xN(0xc87)), su(-0x1, xN(0x8ae), xN(0x244));
              break;
            default:
              rD[xN(0x16b)](),
                rD[xN(0x67d)](0x0, 0x0, this[xN(0xc60)], 0x0, Math["PI"] * 0x2),
                (rD[xN(0x5ef)] = xN(0x27b)),
                rD[xN(0x527)](),
                pG(rD, this[xN(0x635)], 0x14, xN(0x18c), 0x3);
          }
          rD[xN(0x936)](), (this[xN(0x1e7)] = null);
        }
        [us(0x6ef)](rD, rE) {
          const xU = us;
          rE = rE || pM / 0x12c + this[xU(0xca3)] * 0.3;
          const rF = Math[xU(0xbe5)](rE) * 0.5 + 0.5;
          rD[xU(0x534)] = xU(0x2ab);
          const rG = 0x4;
          for (let rH = 0x0; rH < 0x2; rH++) {
            rD[xU(0x68f)]();
            if (rH === 0x0) rD[xU(0x16b)]();
            for (let rI = 0x0; rI < 0x2; rI++) {
              for (let rJ = 0x0; rJ < rG; rJ++) {
                rD[xU(0x68f)](), rH > 0x0 && rD[xU(0x16b)]();
                const rK = -0.19 - (rJ / rG) * Math["PI"] * 0.25;
                rD[xU(0x978)](rK + rF * 0.05), rD[xU(0x7f4)](0x0, 0x0);
                const rL = Math[xU(0xbe5)](rE + rJ);
                rD[xU(0xc8b)](0x1c - (rL * 0.5 + 0.5), 0x0),
                  rD[xU(0x978)](rL * 0.08),
                  rD[xU(0x5d2)](0x0, 0x0),
                  rD[xU(0x9f0)](0x0, 0x7, 5.5, 0xe),
                  rH > 0x0 &&
                    ((rD[xU(0x26f)] = 6.5),
                    (rD[xU(0x555)] =
                      xU(0x3a8) + (0x2f + (rJ / rG) * 0x14) + "%)"),
                    rD[xU(0x130)]()),
                  rD[xU(0x936)]();
              }
              rD[xU(0x9b0)](-0x1, 0x1);
            }
            rH === 0x0 &&
              ((rD[xU(0x26f)] = 0x9),
              (rD[xU(0x555)] = xU(0x886)),
              rD[xU(0x130)]()),
              rD[xU(0x936)]();
          }
          rD[xU(0x16b)](),
            rD[xU(0xe9)](
              0x0,
              -0x1e + Math[xU(0xbe5)](rE * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rD[xU(0x555)] = xU(0x886)),
            (rD[xU(0x26f)] = 5.5),
            rD[xU(0x130)](),
            (rD[xU(0xa7a)] = 0x5 + rF * 0x8),
            (rD[xU(0x400)] = xU(0x10d)),
            (rD[xU(0x555)] = rD[xU(0x400)]),
            (rD[xU(0x26f)] = 3.5),
            rD[xU(0x130)](),
            (rD[xU(0xa7a)] = 0x0);
        }
        [us(0x76c)](rD) {
          const xV = us,
            rE = this[xV(0x52a)] ? ll[xV(0x53d)] : ll[xV(0x736)],
            rF = Date[xV(0x7c4)]() / 0x1f4 + this[xV(0xca3)],
            rG = Math[xV(0xbe5)](rF) - 0.5;
          rD[xV(0x534)] = rD[xV(0xd10)] = xV(0x2ab);
          const rH = 0x46;
          rD[xV(0x68f)](), rD[xV(0x16b)]();
          for (let rI = 0x0; rI < 0x2; rI++) {
            rD[xV(0x68f)]();
            const rJ = rI * 0x2 - 0x1;
            rD[xV(0x9b0)](0x1, rJ),
              rD[xV(0xc8b)](0x14, rH),
              rD[xV(0x978)](rG * 0.1),
              rD[xV(0x7f4)](0x0, 0x0),
              rD[xV(0x5d2)](-0xa, 0x32),
              rD[xV(0x9f0)](0x32, 0x32, 0x64, 0x1e),
              rD[xV(0x9f0)](0x32, 0x32, 0x64, 0x1e),
              rD[xV(0x9f0)](0x1e, 0x8c, -0x50, 0x78 - rG * 0x14),
              rD[xV(0x9f0)](
                -0xa + rG * 0xf,
                0x6e - rG * 0xa,
                -0x28,
                0x50 - rG * 0xa
              ),
              rD[xV(0x9f0)](
                -0xa + rG * 0xa,
                0x3c + rG * 0x5,
                -0x3c,
                0x32 - Math[xV(0xdb0)](0x0, rG) * 0xa
              ),
              rD[xV(0x9f0)](-0xa, 0x14 - rG * 0xa, -0x46, rG * 0xa),
              rD[xV(0x936)]();
          }
          (rD[xV(0x5ef)] = this[xV(0xdad)](rE[xV(0x39a)])),
            rD[xV(0x527)](),
            (rD[xV(0x26f)] = 0x12),
            (rD[xV(0x555)] = xV(0x96f)),
            rD[xV(0xc88)](),
            rD[xV(0x130)](),
            rD[xV(0x936)](),
            rD[xV(0x68f)](),
            rD[xV(0xc8b)](0x50, 0x0),
            rD[xV(0x9b0)](0x2, 0x2),
            rD[xV(0x16b)]();
          for (let rK = 0x0; rK < 0x2; rK++) {
            rD[xV(0x9b0)](0x1, -0x1),
              rD[xV(0x68f)](),
              rD[xV(0xc8b)](0x0, 0xf),
              rD[xV(0x978)]((Math[xV(0xbe5)](rF * 0x2) * 0.5 + 0.5) * 0.08),
              rD[xV(0x7f4)](0x0, -0x4),
              rD[xV(0x9f0)](0xa, 0x0, 0x14, -0x6),
              rD[xV(0x9f0)](0xf, 0x3, 0x0, 0x5),
              rD[xV(0x936)]();
          }
          (rD[xV(0x5ef)] = rD[xV(0x555)] = xV(0x5d5)),
            rD[xV(0x527)](),
            (rD[xV(0x26f)] = 0x6),
            rD[xV(0x130)](),
            rD[xV(0x936)]();
          for (let rL = 0x0; rL < 0x2; rL++) {
            const rM = rL === 0x0;
            rM && rD[xV(0x16b)]();
            for (let rN = 0x4; rN >= 0x0; rN--) {
              const rO = rN / 0x5,
                rP = 0x32 - 0x2d * rO;
              !rM && rD[xV(0x16b)](),
                rD[xV(0x66c)](
                  -0x50 - rO * 0x50 - rP / 0x2,
                  -rP / 0x2 +
                    Math[xV(0xbe5)](rO * Math["PI"] * 0x2 + rF * 0x3) *
                      0x8 *
                      rO,
                  rP,
                  rP
                ),
                !rM &&
                  ((rD[xV(0x26f)] = 0x14),
                  (rD[xV(0x5ef)] = rD[xV(0x555)] =
                    this[xV(0xdad)](rE[xV(0x71f)][rN])),
                  rD[xV(0x130)](),
                  rD[xV(0x527)]());
            }
            rM &&
              ((rD[xV(0x26f)] = 0x22),
              (rD[xV(0x555)] = this[xV(0xdad)](rE[xV(0x144)])),
              rD[xV(0x130)]());
          }
          rD[xV(0x16b)](),
            rD[xV(0x67d)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rD[xV(0x5ef)] = this[xV(0xdad)](rE[xV(0xb87)])),
            rD[xV(0x527)](),
            (rD[xV(0x26f)] = 0x24),
            (rD[xV(0x555)] = xV(0x85e)),
            rD[xV(0x68f)](),
            rD[xV(0xc88)](),
            rD[xV(0x130)](),
            rD[xV(0x936)](),
            rD[xV(0x68f)]();
          for (let rQ = 0x0; rQ < 0x2; rQ++) {
            rD[xV(0x16b)]();
            for (let rR = 0x0; rR < 0x2; rR++) {
              rD[xV(0x68f)]();
              const rS = rR * 0x2 - 0x1;
              rD[xV(0x9b0)](0x1, rS),
                rD[xV(0xc8b)](0x14, rH),
                rD[xV(0x978)](rG * 0.1),
                rD[xV(0x7f4)](0x0, 0xa),
                rD[xV(0x5d2)](-0xa, 0x32),
                rD[xV(0x9f0)](0x32, 0x32, 0x64, 0x1e),
                rD[xV(0x9f0)](0x32, 0x32, 0x64, 0x1e),
                rD[xV(0x9f0)](0x1e, 0x8c, -0x50, 0x78 - rG * 0x14),
                rD[xV(0x7f4)](0x64, 0x1e),
                rD[xV(0x9f0)](0x23, 0x5a, -0x28, 0x50 - rG * 0xa),
                rD[xV(0x7f4)](-0xa, 0x32),
                rD[xV(0x9f0)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[xV(0xdb0)](0x0, rG) * 0xa
                ),
                rD[xV(0x936)]();
            }
            rQ === 0x0
              ? ((rD[xV(0x26f)] = 0x10),
                (rD[xV(0x555)] = this[xV(0xdad)](rE[xV(0x6e7)])))
              : ((rD[xV(0x26f)] = 0xa),
                (rD[xV(0x555)] = this[xV(0xdad)](rE[xV(0x61b)]))),
              rD[xV(0x130)]();
          }
          rD[xV(0x936)]();
        }
        [us(0xa06)](rD, rE, rF, rG) {
          const xW = us;
          rD[xW(0x68f)]();
          const rH = this[xW(0xc60)] / 0x28;
          rD[xW(0x9b0)](rH, rH),
            (rE = this[xW(0xdad)](rE)),
            (rF = this[xW(0xdad)](rF)),
            (rG = this[xW(0xdad)](rG));
          const rI = Math["PI"] / 0x5;
          rD[xW(0x534)] = rD[xW(0xd10)] = xW(0x2ab);
          const rJ = Math[xW(0xbe5)](
              Date[xW(0x7c4)]() / 0x12c + this[xW(0xca3)] * 0.2
            ),
            rK = rJ * 0.3 + 0.7;
          rD[xW(0x16b)](),
            rD[xW(0x67d)](0x16, 0x0, 0x17, 0x0, l0),
            rD[xW(0x7f4)](0x0, 0x0),
            rD[xW(0x67d)](-0x5, 0x0, 0x21, 0x0, l0),
            (rD[xW(0x5ef)] = this[xW(0xdad)](xW(0xda5))),
            rD[xW(0x527)](),
            rD[xW(0x68f)](),
            rD[xW(0xc8b)](0x12, 0x0);
          for (let rN = 0x0; rN < 0x2; rN++) {
            rD[xW(0x68f)](),
              rD[xW(0x9b0)](0x1, rN * 0x2 - 0x1),
              rD[xW(0x978)](Math["PI"] * 0.08 * rK),
              rD[xW(0xc8b)](-0x12, 0x0),
              rD[xW(0x16b)](),
              rD[xW(0x67d)](0x0, 0x0, 0x28, Math["PI"], -rI),
              rD[xW(0x9f0)](0x14 - rK * 0x3, -0xf, 0x14, 0x0),
              rD[xW(0xa2a)](),
              (rD[xW(0x5ef)] = rE),
              rD[xW(0x527)]();
            const rO = xW(0x80c) + rN;
            if (!this[rO]) {
              const rP = new Path2D();
              for (let rQ = 0x0; rQ < 0x2; rQ++) {
                const rR = (Math[xW(0xb7c)]() * 0x2 - 0x1) * 0x28,
                  rS = Math[xW(0xb7c)]() * -0x28,
                  rT = Math[xW(0xb7c)]() * 0x9 + 0x8;
                rP[xW(0x7f4)](rR, rS), rP[xW(0x67d)](rR, rS, rT, 0x0, l0);
              }
              this[rO] = rP;
            }
            rD[xW(0xc88)](),
              (rD[xW(0x5ef)] = rG),
              rD[xW(0x527)](this[rO]),
              rD[xW(0x936)](),
              (rD[xW(0x26f)] = 0x7),
              (rD[xW(0x555)] = rF),
              rD[xW(0x130)]();
          }
          rD[xW(0x936)](), rD[xW(0x68f)]();
          let rL = 0x9;
          rD[xW(0xc8b)](0x2a, 0x0);
          const rM = Math["PI"] * 0x3 - rJ;
          rD[xW(0x16b)]();
          for (let rU = 0x0; rU < 0x2; rU++) {
            let rV = 0x0,
              rW = 0x8;
            rD[xW(0x7f4)](rV, rW);
            for (let rX = 0x0; rX < rL; rX++) {
              const rY = rX / rL,
                rZ = rY * rM,
                s0 = 0xf * (0x1 - rY),
                s1 = Math[xW(0xb0e)](rZ) * s0,
                s2 = Math[xW(0xbe5)](rZ) * s0,
                s3 = rV + s1,
                s4 = rW + s2;
              rD[xW(0x9f0)](
                rV + s1 * 0.5 + s2 * 0.25,
                rW + s2 * 0.5 - s1 * 0.25,
                s3,
                s4
              ),
                (rV = s3),
                (rW = s4);
            }
            rD[xW(0x9b0)](0x1, -0x1);
          }
          (rD[xW(0x534)] = rD[xW(0xd10)] = xW(0x2ab)),
            (rD[xW(0x26f)] = 0x2),
            (rD[xW(0x555)] = rD[xW(0x5ef)]),
            rD[xW(0x130)](),
            rD[xW(0x936)](),
            rD[xW(0x936)]();
        }
        [us(0xb0f)](rD, rE = 0x64, rF = 0x50, rG = 0x12, rH = 0x8) {
          const xX = us;
          rD[xX(0x16b)]();
          const rI = (0x1 / rG) * Math["PI"] * 0x2;
          rD[xX(0x7f4)](rF, 0x0);
          for (let rJ = 0x0; rJ < rG; rJ++) {
            const rK = rJ * rI,
              rL = (rJ + 0x1) * rI;
            rD[xX(0xb18)](
              Math[xX(0xb0e)](rK) * rE,
              Math[xX(0xbe5)](rK) * rE,
              Math[xX(0xb0e)](rL) * rE,
              Math[xX(0xbe5)](rL) * rE,
              Math[xX(0xb0e)](rL) * rF,
              Math[xX(0xbe5)](rL) * rF
            );
          }
          (rD[xX(0x5ef)] = this[xX(0xdad)](xX(0x9d3))),
            rD[xX(0x527)](),
            (rD[xX(0x26f)] = rH),
            (rD[xX(0x534)] = rD[xX(0xd10)] = xX(0x2ab)),
            (rD[xX(0x555)] = this[xX(0xdad)](xX(0xaac))),
            rD[xX(0x130)]();
        }
        [us(0xdad)](rD) {
          const xY = us,
            rE = 0x1 - this[xY(0x6d3)];
          if (
            rE >= 0x1 &&
            this[xY(0xab1)] === 0x0 &&
            !this[xY(0x84b)] &&
            !this[xY(0x78b)]
          )
            return rD;
          rD = hA(rD);
          this[xY(0x84b)] &&
            (rD = hy(
              rD,
              [0xff, 0xff, 0xff],
              0.85 + Math[xY(0xbe5)](pM / 0x32) * 0.15
            ));
          this[xY(0xab1)] > 0x0 &&
            (rD = hy(rD, [0x8f, 0x5d, 0xb0], 0x1 - this[xY(0xab1)] * 0.75));
          rD = hy(rD, [0xff, 0x0, 0x0], rE * 0.25 + 0.75);
          if (this[xY(0x78b)]) {
            if (!this[xY(0x1e7)]) {
              let rF = pM / 0x4;
              if (!isNaN(this["id"])) rF += this["id"];
              this[xY(0x1e7)] = lH(rF % 0x168, 0x64, 0x32);
            }
            rD = hy(rD, this[xY(0x1e7)], 0.75);
          }
          return pY(rD);
        }
        [us(0xb8c)](rD) {
          const xZ = us;
          this[xZ(0x1e7)] = null;
          if (this[xZ(0xd11)]) {
            const rE = Math[xZ(0xbe5)]((this[xZ(0x3ec)] * Math["PI"]) / 0x2);
            if (!this[xZ(0x17b)]) {
              const rF = 0x1 + rE * 0x1;
              rD[xZ(0x9b0)](rF, rF);
            }
            rD[xZ(0x23f)] *= 0x1 - rE;
          }
        }
        [us(0xbf4)](rD, rE = !![], rF = 0x1) {
          const y0 = us;
          rD[y0(0x16b)](),
            (rF = 0x8 * rF),
            rD[y0(0x7f4)](0x23, -rF),
            rD[y0(0x9f0)](0x33, -0x2 - rF, 0x3c, -0xc - rF),
            rD[y0(0x5d2)](0x23, -rF),
            rD[y0(0x7f4)](0x23, rF),
            rD[y0(0x9f0)](0x33, 0x2 + rF, 0x3c, 0xc + rF),
            rD[y0(0x5d2)](0x23, rF);
          const rG = y0(0x53e);
          (rD[y0(0x5ef)] = rD[y0(0x555)] =
            rE ? this[y0(0xdad)](rG) : y0(0x53e)),
            rD[y0(0x527)](),
            (rD[y0(0x534)] = rD[y0(0xd10)] = y0(0x2ab)),
            (rD[y0(0x26f)] = 0x4),
            rD[y0(0x130)]();
        }
        [us(0x205)](rD, rE, rF = 0x1) {
          const y1 = us,
            rG = (rE / 0x1e) * 1.1;
          rD[y1(0x9b0)](rG, rG),
            rD[y1(0x16b)](),
            rD[y1(0x7f4)](-0x1e, -0x11),
            rD[y1(0x5d2)](0x1e, 0x0),
            rD[y1(0x5d2)](-0x1e, 0x11),
            rD[y1(0xa2a)](),
            (rD[y1(0x5ef)] = rD[y1(0x555)] = this[y1(0xdad)](y1(0x53e))),
            rD[y1(0x527)](),
            (rD[y1(0x26f)] = 0x14 * rF),
            (rD[y1(0x534)] = rD[y1(0xd10)] = y1(0x2ab)),
            rD[y1(0x130)]();
        }
        [us(0x595)](rD, rE = 0x0, rF = 0x0, rG = 0x1, rH = 0x5) {
          const y2 = us;
          rD[y2(0x68f)](),
            rD[y2(0xc8b)](rE, rF),
            rD[y2(0x9b0)](rG, rG),
            rD[y2(0x16b)](),
            rD[y2(0x7f4)](0x23, -0x8),
            rD[y2(0x9f0)](0x34, -5.5, 0x3c, -0x14),
            rD[y2(0x7f4)](0x23, 0x8),
            rD[y2(0x9f0)](0x34, 5.5, 0x3c, 0x14),
            (rD[y2(0x5ef)] = rD[y2(0x555)] = this[y2(0xdad)](y2(0x53e))),
            (rD[y2(0x534)] = rD[y2(0xd10)] = y2(0x2ab)),
            (rD[y2(0x26f)] = rH),
            rD[y2(0x130)](),
            rD[y2(0x16b)]();
          const rI = Math["PI"] * 0.165;
          rD[y2(0xe9)](0x3c, -0x14, 0x7, 0x9, rI, 0x0, l0),
            rD[y2(0xe9)](0x3c, 0x14, 0x7, 0x9, -rI, 0x0, l0),
            rD[y2(0x527)](),
            rD[y2(0x936)]();
        }
      },
      lH = (rD, rE, rF) => {
        const y3 = us;
        (rE /= 0x64), (rF /= 0x64);
        const rG = (rJ) => (rJ + rD / 0x1e) % 0xc,
          rH = rE * Math[y3(0xbe6)](rF, 0x1 - rF),
          rI = (rJ) =>
            rF -
            rH *
              Math[y3(0xdb0)](
                -0x1,
                Math[y3(0xbe6)](
                  rG(rJ) - 0x3,
                  Math[y3(0xbe6)](0x9 - rG(rJ), 0x1)
                )
              );
        return [0xff * rI(0x0), 0xff * rI(0x8), 0xff * rI(0x4)];
      };
    function lI(rD) {
      const y4 = us;
      return -(Math[y4(0xb0e)](Math["PI"] * rD) - 0x1) / 0x2;
    }
    function lJ(rD, rE, rF = 0x6, rG = us(0x18c)) {
      const y5 = us,
        rH = rE / 0x64;
      rD[y5(0x9b0)](rH, rH), rD[y5(0x16b)]();
      for (let rI = 0x0; rI < 0xc; rI++) {
        rD[y5(0x7f4)](0x0, 0x0);
        const rJ = (rI / 0xc) * Math["PI"] * 0x2;
        rD[y5(0x5d2)](Math[y5(0xb0e)](rJ) * 0x64, Math[y5(0xbe5)](rJ) * 0x64);
      }
      (rD[y5(0x26f)] = rF),
        (rD[y5(0x5ef)] = rD[y5(0x555)] = rG),
        (rD[y5(0x534)] = rD[y5(0xd10)] = y5(0x2ab));
      for (let rK = 0x0; rK < 0x5; rK++) {
        const rL = (rK / 0x5) * 0x64 + 0xa;
        lb(rD, 0xc, rL, 0.5, 0.85);
      }
      rD[y5(0x130)]();
    }
    var lK = class {
        constructor(rD, rE, rF, rG, rH) {
          const y6 = us;
          (this[y6(0x41e)] = rD),
            (this["id"] = rE),
            (this["x"] = rF),
            (this["y"] = rG),
            (this[y6(0xc60)] = rH),
            (this[y6(0x4c3)] = Math[y6(0xb7c)]() * l0),
            (this[y6(0xaea)] = -0x1),
            (this[y6(0xd11)] = ![]),
            (this[y6(0x60e)] = 0x0),
            (this[y6(0x3ec)] = 0x0),
            (this[y6(0xc9b)] = !![]),
            (this[y6(0x646)] = 0x0),
            (this[y6(0x27a)] = !![]);
        }
        [us(0xc2f)]() {
          const y7 = us;
          if (this[y7(0x60e)] < 0x1) {
            this[y7(0x60e)] += pN / 0xc8;
            if (this[y7(0x60e)] > 0x1) this[y7(0x60e)] = 0x1;
          }
          this[y7(0xd11)] && (this[y7(0x3ec)] += pN / 0xc8);
        }
        [us(0x74e)](rD) {
          const y8 = us;
          rD[y8(0x68f)](), rD[y8(0xc8b)](this["x"], this["y"]);
          if (this[y8(0x41e)] === cS[y8(0x12b)]) {
            rD[y8(0x978)](this[y8(0x4c3)]);
            const rE = this[y8(0xc60)],
              rF = pD(
                rD,
                y8(0x28a) + this[y8(0xc60)],
                rE * 2.2,
                rE * 2.2,
                (rH) => {
                  const y9 = y8;
                  rH[y9(0xc8b)](rE * 1.1, rE * 1.1), lJ(rH, rE);
                },
                !![]
              ),
              rG = this[y8(0x60e)] + this[y8(0x3ec)] * 0.5;
            (rD[y8(0x23f)] = (0x1 - this[y8(0x3ec)]) * 0.3),
              rD[y8(0x9b0)](rG, rG),
              rD[y8(0xdb8)](
                rF,
                -rF[y8(0xdc6)] / 0x2,
                -rF[y8(0xd33)] / 0x2,
                rF[y8(0xdc6)],
                rF[y8(0xd33)]
              );
          } else {
            if (this[y8(0x41e)] === cS[y8(0x87b)]) {
              let rH = this[y8(0x60e)] + this[y8(0x3ec)] * 0.5;
              (rD[y8(0x23f)] = 0x1 - this[y8(0x3ec)]), (rD[y8(0x23f)] *= 0.9);
              const rI =
                0.93 +
                0.07 *
                  (Math[y8(0xbe5)](
                    Date[y8(0x7c4)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              rH *= rI;
              const rJ = this[y8(0xc60)],
                rK = pD(
                  rD,
                  y8(0x36f) + this[y8(0xc60)],
                  rJ * 2.2,
                  rJ * 2.2,
                  (rL) => {
                    const ya = y8;
                    rL[ya(0xc8b)](rJ * 1.1, rJ * 1.1);
                    const rM = rJ / 0x64;
                    rL[ya(0x9b0)](rM, rM),
                      lE(rL, 0x5c),
                      (rL[ya(0xd10)] = rL[ya(0x534)] = ya(0x2ab)),
                      (rL[ya(0x26f)] = 0x28),
                      (rL[ya(0x555)] = ya(0x813)),
                      rL[ya(0x130)](),
                      (rL[ya(0x5ef)] = ya(0xbf9)),
                      (rL[ya(0x555)] = ya(0x21f)),
                      (rL[ya(0x26f)] = 0xe),
                      rL[ya(0x527)](),
                      rL[ya(0x130)]();
                  },
                  !![]
                );
              rD[y8(0x9b0)](rH, rH),
                rD[y8(0xdb8)](
                  rK,
                  -rK[y8(0xdc6)] / 0x2,
                  -rK[y8(0xd33)] / 0x2,
                  rK[y8(0xdc6)],
                  rK[y8(0xd33)]
                );
            } else {
              if (this[y8(0x41e)] === cS[y8(0xad7)]) {
                rD[y8(0x2cb)](this[y8(0xc60)] / 0x32),
                  (rD[y8(0xd10)] = y8(0x2ab)),
                  rD[y8(0x68f)](),
                  (this[y8(0x646)] +=
                    ((this[y8(0xaea)] >= 0x0 ? 0x1 : -0x1) * pN) / 0x12c),
                  (this[y8(0x646)] = Math[y8(0xbe6)](
                    0x1,
                    Math[y8(0xdb0)](0x0, this[y8(0x646)])
                  ));
                if (this[y8(0x646)] > 0x0) {
                  rD[y8(0x2cb)](this[y8(0x646)]),
                    (rD[y8(0x23f)] *= this[y8(0x646)]),
                    (rD[y8(0x26f)] = 0.1),
                    (rD[y8(0x555)] = rD[y8(0x5ef)] = y8(0xb28)),
                    (rD[y8(0x964)] = y8(0x6c8)),
                    (rD[y8(0x199)] = y8(0xcab) + iA);
                  const rM = y8(0x3d1) + (this[y8(0xaea)] + 0x1);
                  lR(
                    rD,
                    rM,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rM[y8(0x8c2)] * 0.09),
                    !![]
                  );
                }
                rD[y8(0x936)]();
                const rL = this[y8(0x2ae)]
                  ? 0.6
                  : ((this["id"] + Date[y8(0x7c4)]()) / 0x4b0) % 6.28;
                rD[y8(0x68f)]();
                for (let rN = 0x0; rN < 0x8; rN++) {
                  const rO = 0x1 - rN / 0x8,
                    rP = rO * 0x50;
                  rD[y8(0x978)](rL),
                    (rD[y8(0x555)] = y8(0x1c0)),
                    rD[y8(0x16b)](),
                    rD[y8(0x66c)](-rP / 0x2, -rP / 0x2, rP, rP),
                    rD[y8(0xa2a)](),
                    (rD[y8(0x26f)] = 0x28),
                    rD[y8(0x130)](),
                    (rD[y8(0x26f)] = 0x14),
                    rD[y8(0x130)]();
                }
                rD[y8(0x936)]();
                if (!this[y8(0xa52)]) {
                  this[y8(0xa52)] = [];
                  for (let rQ = 0x0; rQ < 0x1e; rQ++) {
                    this[y8(0xa52)][y8(0x733)]({
                      x: Math[y8(0xb7c)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rR = 0x0; rR < this[y8(0xa52)][y8(0x8c2)]; rR++) {
                  const rS = this[y8(0xa52)][rR];
                  (rS["x"] += rS["v"]),
                    rS["x"] > 0x1 &&
                      ((rS["x"] %= 0x1),
                      (rS[y8(0x4c3)] = Math[y8(0xb7c)]() * 6.28),
                      (rS["v"] = Math[y8(0xb7c)]() * 0.005 + 0.008),
                      (rS["s"] = Math[y8(0xb7c)]() * 0.025 + 0.008)),
                    rD[y8(0x68f)](),
                    (rD[y8(0x23f)] =
                      rS["x"] < 0.2
                        ? rS["x"] / 0.2
                        : rS["x"] > 0.8
                        ? 0x1 - (rS["x"] - 0.8) / 0.2
                        : 0x1),
                    rD[y8(0x9b0)](0x5a, 0x5a),
                    rD[y8(0x978)](rS[y8(0x4c3)]),
                    rD[y8(0xc8b)](rS["x"], 0x0),
                    rD[y8(0x16b)](),
                    rD[y8(0x67d)](0x0, 0x0, rS["s"], 0x0, Math["PI"] * 0x2),
                    (rD[y8(0x5ef)] = y8(0xb28)),
                    rD[y8(0x527)](),
                    rD[y8(0x936)]();
                }
              }
            }
          }
          rD[y8(0x936)]();
        }
      },
      lL = 0x0,
      lM = 0x0,
      lN = class extends lK {
        constructor(rD, rE, rF, rG) {
          const yb = us;
          super(cS[yb(0xb40)], rD, rE, rF, 0x46),
            (this[yb(0x4c3)] = (Math[yb(0xb7c)]() * 0x2 - 0x1) * 0.2),
            (this[yb(0xab7)] = dC[rG]);
        }
        [us(0xc2f)]() {
          const yc = us;
          if (this[yc(0x60e)] < 0x2 || pM - lL < 0x9c4) {
            this[yc(0x60e)] += pN / 0x12c;
            return;
          }
          this[yc(0xd11)] && (this[yc(0x3ec)] += pN / 0xc8),
            this[yc(0x37c)] &&
              ((this["x"] = pt(this["x"], this[yc(0x37c)]["x"], 0xc8)),
              (this["y"] = pt(this["y"], this[yc(0x37c)]["y"], 0xc8)));
        }
        [us(0x74e)](rD) {
          const yd = us;
          if (this[yd(0x60e)] === 0x0) return;
          rD[yd(0x68f)](), rD[yd(0xc8b)](this["x"], this["y"]);
          const rE = yd(0x4b4) + this[yd(0xab7)]["id"];
          let rF =
            (this[yd(0xadc)] || lM < 0x3) &&
            pD(
              rD,
              rE,
              0x78,
              0x78,
              (rI) => {
                const ye = yd;
                (this[ye(0xadc)] = !![]),
                  lM++,
                  rI[ye(0xc8b)](0x3c, 0x3c),
                  (rI[ye(0x534)] = rI[ye(0xd10)] = ye(0x2ab)),
                  rI[ye(0x16b)](),
                  rI[ye(0x66c)](-0x32, -0x32, 0x64, 0x64),
                  (rI[ye(0x26f)] = 0x12),
                  (rI[ye(0x555)] = ye(0xb4d)),
                  rI[ye(0x130)](),
                  (rI[ye(0x26f)] = 0x8),
                  (rI[ye(0x5ef)] = hQ[this[ye(0xab7)][ye(0x3b6)]]),
                  rI[ye(0x527)](),
                  (rI[ye(0x555)] = hR[this[ye(0xab7)][ye(0x3b6)]]),
                  rI[ye(0x130)]();
                const rJ = pG(
                  rI,
                  this[ye(0xab7)][ye(0x703)],
                  0x12,
                  ye(0x18c),
                  0x3,
                  !![]
                );
                rI[ye(0xdb8)](
                  rJ,
                  -rJ[ye(0xdc6)] / 0x2,
                  0x32 - 0xd / 0x2 - rJ[ye(0xd33)],
                  rJ[ye(0xdc6)],
                  rJ[ye(0xd33)]
                ),
                  rI[ye(0x68f)](),
                  rI[ye(0xc8b)](
                    0x0 + this[ye(0xab7)][ye(0xed)],
                    -0x5 + this[ye(0xab7)][ye(0xd15)]
                  ),
                  this[ye(0xab7)][ye(0xa2d)](rI),
                  rI[ye(0x936)]();
              },
              !![]
            );
          if (!rF) rF = pC[rE];
          rD[yd(0x978)](this[yd(0x4c3)]);
          const rG = Math[yd(0xbe6)](this[yd(0x60e)], 0x1),
            rH =
              (this[yd(0xc60)] / 0x64) *
              (0x1 +
                Math[yd(0xbe5)](Date[yd(0x7c4)]() / 0xfa + this["id"]) * 0.05) *
              rG *
              (0x1 - this[yd(0x3ec)]);
          rD[yd(0x9b0)](rH, rH),
            rD[yd(0x978)](Math["PI"] * lI(0x1 - rG)),
            rF
              ? rD[yd(0xdb8)](
                  rF,
                  -rF[yd(0xdc6)] / 0x2,
                  -rF[yd(0xd33)] / 0x2,
                  rF[yd(0xdc6)],
                  rF[yd(0xd33)]
                )
              : (rD[yd(0x16b)](),
                rD[yd(0x66c)](-0x3c, -0x3c, 0x78, 0x78),
                (rD[yd(0x5ef)] = hQ[this[yd(0xab7)][yd(0x3b6)]]),
                rD[yd(0x527)]()),
            rD[yd(0x936)]();
        }
      };
    function lO(rD) {
      const yf = us;
      rD[yf(0x16b)](),
        rD[yf(0x7f4)](0x0, 4.5),
        rD[yf(0x9f0)](3.75, 0x0, 0x0, -4.5),
        rD[yf(0x9f0)](-3.75, 0x0, 0x0, 4.5),
        rD[yf(0xa2a)](),
        (rD[yf(0x534)] = rD[yf(0xd10)] = yf(0x2ab)),
        (rD[yf(0x5ef)] = rD[yf(0x555)] = yf(0x5d5)),
        (rD[yf(0x26f)] = 0x1),
        rD[yf(0x130)](),
        rD[yf(0x527)](),
        rD[yf(0xc88)](),
        rD[yf(0x16b)](),
        rD[yf(0x67d)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, l0),
        (rD[yf(0x5ef)] = yf(0xd1c)),
        rD[yf(0x527)]();
    }
    function lP(rD, rE = ![]) {
      const yg = us;
      lQ(rD, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lQ(rD, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rE) {
        const rF = Math["PI"] / 0x7;
        rD[yg(0x16b)](),
          rD[yg(0x67d)](0x0, 0x0, 23.5, Math["PI"] + rF, Math["PI"] * 0x2 - rF),
          (rD[yg(0x555)] = yg(0x5d0)),
          (rD[yg(0x26f)] = 0x4),
          (rD[yg(0x534)] = yg(0x2ab)),
          rD[yg(0x130)]();
      }
    }
    function lQ(rD, rE, rF) {
      const yh = us;
      rD[yh(0x68f)](),
        rD[yh(0x978)](rE),
        rD[yh(0xc8b)](0x0, -23.6),
        rD[yh(0x978)](rF),
        rD[yh(0x16b)](),
        rD[yh(0x7f4)](-6.5, 0x1),
        rD[yh(0x5d2)](0x0, -0xf),
        rD[yh(0x5d2)](6.5, 0x1),
        (rD[yh(0x5ef)] = yh(0x7ab)),
        (rD[yh(0x26f)] = 3.5),
        rD[yh(0x527)](),
        (rD[yh(0xd10)] = yh(0x2ab)),
        (rD[yh(0x555)] = yh(0x5d0)),
        rD[yh(0x130)](),
        rD[yh(0x936)]();
    }
    function lR(rD, rE, rF, rG, rH, rI, rJ = ![]) {
      const yi = us;
      var rK = rE[yi(0x8c2)],
        rL;
      rD[yi(0x68f)](),
        rD[yi(0xc8b)](rF, rG),
        rD[yi(0x978)]((0x1 * rI) / 0x2),
        rD[yi(0x978)]((0x1 * (rI / rK)) / 0x2),
        (rD[yi(0x22e)] = yi(0xdd));
      for (var rM = 0x0; rM < rK; rM++) {
        rD[yi(0x978)](-rI / rK),
          rD[yi(0x68f)](),
          rD[yi(0xc8b)](0x0, rH),
          (rL = rE[rM]),
          rJ && rD[yi(0x1fd)](rL, 0x0, 0x0),
          rD[yi(0x7dc)](rL, 0x0, 0x0),
          rD[yi(0x936)]();
      }
      rD[yi(0x936)]();
    }
    function lS(rD, rE = 0x1) {
      const yj = us,
        rF = 0xf;
      rD[yj(0x16b)]();
      const rG = 0x6;
      for (let rL = 0x0; rL < rG; rL++) {
        const rM = (rL / rG) * Math["PI"] * 0x2;
        rD[yj(0x5d2)](Math[yj(0xb0e)](rM) * rF, Math[yj(0xbe5)](rM) * rF);
      }
      rD[yj(0xa2a)](),
        (rD[yj(0x26f)] = 0x4),
        (rD[yj(0x555)] = yj(0x730)),
        rD[yj(0x130)](),
        (rD[yj(0x5ef)] = yj(0x52f)),
        rD[yj(0x527)]();
      const rH = (Math["PI"] * 0x2) / rG,
        rI = Math[yj(0xb0e)](rH) * rF,
        rJ = Math[yj(0xbe5)](rH) * rF;
      for (let rN = 0x0; rN < rG; rN++) {
        rD[yj(0x16b)](),
          rD[yj(0x7f4)](0x0, 0x0),
          rD[yj(0x5d2)](rF, 0x0),
          rD[yj(0x5d2)](rI, rJ),
          rD[yj(0xa2a)](),
          (rD[yj(0x5ef)] =
            yj(0x7b4) + (0.2 + (((rN + 0x4) % rG) / rG) * 0.35) + ")"),
          rD[yj(0x527)](),
          rD[yj(0x978)](rH);
      }
      rD[yj(0x16b)]();
      const rK = rF * 0.65;
      for (let rO = 0x0; rO < rG; rO++) {
        const rP = (rO / rG) * Math["PI"] * 0x2;
        rD[yj(0x5d2)](Math[yj(0xb0e)](rP) * rK, Math[yj(0xbe5)](rP) * rK);
      }
      (rD[yj(0xa7a)] = 0x23 + rE * 0xf),
        (rD[yj(0x400)] = rD[yj(0x5ef)] = yj(0x115)),
        rD[yj(0x527)](),
        rD[yj(0x527)](),
        rD[yj(0x527)]();
    }
    var lT = class extends lG {
        constructor(rD, rE, rF, rG, rH, rI, rJ) {
          const yk = us;
          super(rD, cS[yk(0x5b6)], rE, rF, rG, rJ, rH),
            (this[yk(0xa7b)] = rI),
            (this[yk(0x793)] = 0x0),
            (this[yk(0x12f)] = 0x0),
            (this[yk(0xb07)] = 0x0),
            (this[yk(0x536)] = 0x0),
            (this[yk(0x324)] = ""),
            (this[yk(0x29c)] = 0x0),
            (this[yk(0x924)] = !![]),
            (this[yk(0x23d)] = ![]),
            (this[yk(0x35d)] = ![]),
            (this[yk(0x618)] = ![]),
            (this[yk(0x624)] = ![]),
            (this[yk(0x367)] = ![]),
            (this[yk(0x6b9)] = !![]),
            (this[yk(0x55a)] = 0x0),
            (this[yk(0xc59)] = 0x0);
        }
        [us(0xc2f)]() {
          const yl = us;
          super[yl(0xc2f)]();
          if (this[yl(0xd11)]) (this[yl(0x12f)] = 0x1), (this[yl(0x793)] = 0x0);
          else {
            const rD = pN / 0xc8;
            let rE = this[yl(0xa7b)];
            if (this[yl(0x23d)] && rE === cY[yl(0xc8e)]) rE = cY[yl(0xb35)];
            (this[yl(0x793)] = Math[yl(0xbe6)](
              0x1,
              Math[yl(0xdb0)](
                0x0,
                this[yl(0x793)] + (rE === cY[yl(0xb94)] ? rD : -rD)
              )
            )),
              (this[yl(0x12f)] = Math[yl(0xbe6)](
                0x1,
                Math[yl(0xdb0)](
                  0x0,
                  this[yl(0x12f)] + (rE === cY[yl(0xb35)] ? rD : -rD)
                )
              )),
              (this[yl(0x55a)] = pt(this[yl(0x55a)], this[yl(0xc59)], 0x64));
          }
        }
        [us(0x74e)](rD) {
          const ym = us;
          rD[ym(0x68f)](), rD[ym(0xc8b)](this["x"], this["y"]);
          let rE = this[ym(0xc60)] / kZ;
          this[ym(0xd11)] &&
            rD[ym(0x978)]((this[ym(0x3ec)] * Math["PI"]) / 0x4);
          rD[ym(0x9b0)](rE, rE), this[ym(0xb8c)](rD);
          this[ym(0x879)] &&
            (rD[ym(0x68f)](),
            rD[ym(0x978)](this[ym(0x4c3)]),
            rD[ym(0x2cb)](this[ym(0xc60)] / 0x28 / rE),
            this[ym(0x196)](rD),
            rD[ym(0x936)]());
          this[ym(0x521)] &&
            (rD[ym(0x68f)](),
            rD[ym(0x2cb)](kZ / 0x12),
            this[ym(0x6ef)](rD, pM / 0x12c),
            rD[ym(0x936)]());
          const rF = ym(0x5d0);
          if (this[ym(0x284)]) {
            const rP = Date[ym(0x7c4)](),
              rQ = (Math[ym(0xbe5)](rP / 0x12c) * 0.5 + 0.5) * 0x2;
            rD[ym(0x16b)](),
              rD[ym(0x7f4)](0x5, -0x22),
              rD[ym(0xb18)](0x2f, -0x19, 0x14, 0x5, 0x2b - rQ, 0x19),
              rD[ym(0x9f0)](0x0, 0x28 + rQ * 0.6, -0x2b + rQ, 0x19),
              rD[ym(0xb18)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rD[ym(0x9f0)](0x0, -0x23, 0x5, -0x22),
              (rD[ym(0x5ef)] = rF),
              rD[ym(0x527)]();
          }
          this[ym(0x367)] && lP(rD);
          const rG = this[ym(0x624)]
            ? [ym(0xda5), ym(0x53e)]
            : this[ym(0x4e0)]
            ? [ym(0x4f8), ym(0x729)]
            : [ym(0xa91), ym(0x87c)];
          (rG[0x0] = this[ym(0xdad)](rG[0x0])),
            (rG[0x1] = this[ym(0xdad)](rG[0x1]));
          let rH = 2.75;
          !this[ym(0x4e0)] && (rH /= rE);
          (rD[ym(0x5ef)] = rG[0x0]),
            (rD[ym(0x26f)] = rH),
            (rD[ym(0x555)] = rG[0x1]);
          this[ym(0x4e0)] &&
            (rD[ym(0x16b)](),
            rD[ym(0x7f4)](0x0, 0x0),
            rD[ym(0x9f0)](-0x1e, 0xf, -0x1e, 0x1e),
            rD[ym(0x9f0)](0x0, 0x37, 0x1e, 0x1e),
            rD[ym(0x9f0)](0x1e, 0xf, 0x0, 0x0),
            rD[ym(0x527)](),
            rD[ym(0x130)](),
            rD[ym(0x68f)](),
            (rD[ym(0x5ef)] = rD[ym(0x555)]),
            (rD[ym(0x964)] = ym(0x6c8)),
            (rD[ym(0x199)] = ym(0xdae) + iA),
            lR(rD, ym(0x84c), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rD[ym(0x936)]());
          rD[ym(0x16b)]();
          this[ym(0xdd7)]
            ? !this[ym(0x284)]
              ? rD[ym(0x66c)](-0x19, -0x19, 0x32, 0x32)
              : (rD[ym(0x7f4)](0x19, 0x19),
                rD[ym(0x5d2)](-0x19, 0x19),
                rD[ym(0x5d2)](-0x19, -0xa),
                rD[ym(0x5d2)](-0xa, -0x19),
                rD[ym(0x5d2)](0xa, -0x19),
                rD[ym(0x5d2)](0x19, -0xa),
                rD[ym(0xa2a)]())
            : rD[ym(0x67d)](0x0, 0x0, kZ, 0x0, l0);
          rD[ym(0x527)](), rD[ym(0x130)]();
          this[ym(0xb61)] &&
            (rD[ym(0x68f)](),
            rD[ym(0xc88)](),
            rD[ym(0x16b)](),
            !this[ym(0x284)] &&
              (rD[ym(0x7f4)](-0x8, -0x1e),
              rD[ym(0x5d2)](0xf, -0x7),
              rD[ym(0x5d2)](0x1e, -0x14),
              rD[ym(0x5d2)](0x1e, -0x32)),
            rD[ym(0xc8b)](
              0x0,
              0x2 * (0x1 - (this[ym(0x12f)] + this[ym(0x793)]))
            ),
            rD[ym(0x7f4)](-0x2, 0x0),
            rD[ym(0x5d2)](-0x3, 4.5),
            rD[ym(0x5d2)](0x3, 4.5),
            rD[ym(0x5d2)](0x2, 0x0),
            (rD[ym(0x5ef)] = ym(0x5d5)),
            rD[ym(0x527)](),
            rD[ym(0x936)]());
          this[ym(0x284)] &&
            (rD[ym(0x16b)](),
            rD[ym(0x7f4)](0x0, -0x17),
            rD[ym(0x9f0)](0x4, -0xd, 0x1b, -0x8),
            rD[ym(0x5d2)](0x14, -0x1c),
            rD[ym(0x5d2)](-0x14, -0x1c),
            rD[ym(0x5d2)](-0x1b, -0x8),
            rD[ym(0x9f0)](-0x4, -0xd, 0x0, -0x17),
            (rD[ym(0x5ef)] = rF),
            rD[ym(0x527)]());
          if (this[ym(0xc49)]) {
            (rD[ym(0x555)] = ym(0x4ba)),
              (rD[ym(0x26f)] = 1.4),
              rD[ym(0x16b)](),
              (rD[ym(0x534)] = ym(0x2ab));
            const rR = 4.5;
            for (let rS = 0x0; rS < 0x2; rS++) {
              const rT = -0x12 + rS * 0x1d;
              for (let rU = 0x0; rU < 0x3; rU++) {
                const rV = rT + rU * 0x3;
                rD[ym(0x7f4)](rV, rR + -1.5), rD[ym(0x5d2)](rV + 1.6, rR + 1.6);
              }
            }
            rD[ym(0x130)]();
          }
          if (this[ym(0xb9e)]) {
            rD[ym(0x16b)](),
              rD[ym(0x67d)](0x0, 2.5, 3.3, 0x0, l0),
              (rD[ym(0x5ef)] = ym(0x756)),
              rD[ym(0x527)](),
              rD[ym(0x16b)](),
              rD[ym(0x67d)](0xd, 2.8, 5.5, 0x0, l0),
              rD[ym(0x67d)](-0xd, 2.8, 5.5, 0x0, l0),
              (rD[ym(0x5ef)] = ym(0x225)),
              rD[ym(0x527)](),
              rD[ym(0x68f)](),
              rD[ym(0x978)](-Math["PI"] / 0x4),
              rD[ym(0x16b)]();
            const rW = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[ym(0xdd7)] &&
              rW[ym(0xaba)]((rX) => {
                (rX[0x0] *= 1.1), (rX[0x1] *= 1.1);
              });
            for (let rX = 0x0; rX < 0x2; rX++) {
              for (let rY = 0x0; rY < rW[ym(0x8c2)]; rY++) {
                const rZ = rW[rY];
                rD[ym(0x7f4)](rZ[0x0], rZ[0x1]), rD[ym(0x67d)](...rZ, 0x0, l0);
              }
              rD[ym(0x978)](-Math["PI"] / 0x2);
            }
            (rD[ym(0x5ef)] = ym(0x335)), rD[ym(0x527)](), rD[ym(0x936)]();
          }
          const rI = this[ym(0x793)],
            rJ = this[ym(0x12f)],
            rK = 0x6 * rI,
            rL = 0x4 * rJ;
          function rM(s0, s1) {
            const yn = ym;
            rD[yn(0x16b)]();
            const s3 = 3.25;
            rD[yn(0x7f4)](s0 - s3, s1 - s3),
              rD[yn(0x5d2)](s0 + s3, s1 + s3),
              rD[yn(0x7f4)](s0 + s3, s1 - s3),
              rD[yn(0x5d2)](s0 - s3, s1 + s3),
              (rD[yn(0x26f)] = 0x2),
              (rD[yn(0x534)] = yn(0x2ab)),
              (rD[yn(0x555)] = yn(0x5d5)),
              rD[yn(0x130)](),
              rD[yn(0xa2a)]();
          }
          function rN(s0, s1) {
            const yo = ym;
            rD[yo(0x68f)](),
              rD[yo(0xc8b)](s0, s1),
              rD[yo(0x16b)](),
              rD[yo(0x7f4)](-0x4, 0x0),
              rD[yo(0x9f0)](0x0, 0x6, 0x4, 0x0),
              (rD[yo(0x26f)] = 0x2),
              (rD[yo(0x534)] = yo(0x2ab)),
              (rD[yo(0x555)] = yo(0x5d5)),
              rD[yo(0x130)](),
              rD[yo(0x936)]();
          }
          if (this[ym(0xd11)]) rM(0x7, -0x5), rM(-0x7, -0x5);
          else {
            if (this[ym(0x1f3)]) rN(0x7, -0x5), rN(-0x7, -0x5);
            else {
              let s0 = function (s2, s3, s4, s5, s6 = 0x0) {
                  const yp = ym,
                    s7 = s6 ^ 0x1;
                  rD[yp(0x7f4)](s2 - s4, s3 - s5 + s6 * rK + s7 * rL),
                    rD[yp(0x5d2)](s2 + s4, s3 - s5 + s7 * rK + s6 * rL),
                    rD[yp(0x5d2)](s2 + s4, s3 + s5),
                    rD[yp(0x5d2)](s2 - s4, s3 + s5),
                    rD[yp(0x5d2)](s2 - s4, s3 - s5);
                },
                s1 = function (s3 = 0x0) {
                  const yq = ym;
                  rD[yq(0x16b)](),
                    rD[yq(0xe9)](0x7, -0x5, 2.5 + s3, 0x6 + s3, 0x0, 0x0, l0),
                    rD[yq(0x7f4)](-0x7, -0x5),
                    rD[yq(0xe9)](-0x7, -0x5, 2.5 + s3, 0x6 + s3, 0x0, 0x0, l0),
                    (rD[yq(0x555)] = rD[yq(0x5ef)] = yq(0x5d5)),
                    rD[yq(0x527)]();
                };
              rD[ym(0x68f)](),
                rD[ym(0x16b)](),
                s0(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                s0(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rD[ym(0xc88)](),
                s1(0.7),
                s1(0x0),
                rD[ym(0xc88)](),
                rD[ym(0x16b)](),
                rD[ym(0x67d)](
                  0x7 + this[ym(0xb07)] * 0x2,
                  -0x5 + this[ym(0x536)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                rD[ym(0x7f4)](-0x7, -0x5),
                rD[ym(0x67d)](
                  -0x7 + this[ym(0xb07)] * 0x2,
                  -0x5 + this[ym(0x536)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                (rD[ym(0x5ef)] = ym(0xd1c)),
                rD[ym(0x527)](),
                rD[ym(0x936)]();
            }
          }
          if (this[ym(0x618)]) {
            rD[ym(0x68f)](), rD[ym(0xc8b)](0x0, -0xc);
            if (this[ym(0xd11)]) rD[ym(0x9b0)](0.7, 0.7), rM(0x0, -0x3);
            else
              this[ym(0x1f3)]
                ? (rD[ym(0x9b0)](0.7, 0.7), rN(0x0, -0x3))
                : lO(rD);
            rD[ym(0x936)]();
          }
          this[ym(0x35d)] &&
            (rD[ym(0x68f)](),
            rD[ym(0xc8b)](0x0, 0xa),
            rD[ym(0x978)](-Math["PI"] / 0x2),
            rD[ym(0x9b0)](0.82, 0.82),
            this[ym(0xbf4)](rD, ![], 0.85),
            rD[ym(0x936)]());
          const rO = rI * (-0x5 - 5.5) + rJ * (-0x5 - 0x4);
          rD[ym(0x68f)](),
            rD[ym(0x16b)](),
            rD[ym(0xc8b)](0x0, 9.5),
            rD[ym(0x7f4)](-5.6, 0x0),
            rD[ym(0x9f0)](0x0, 0x5 + rO, 5.6, 0x0),
            (rD[ym(0x534)] = ym(0x2ab));
          this[ym(0xb9e)]
            ? ((rD[ym(0x26f)] = 0x7),
              (rD[ym(0x555)] = ym(0x756)),
              rD[ym(0x130)](),
              (rD[ym(0x555)] = ym(0xc44)))
            : (rD[ym(0x555)] = ym(0x5d5));
          (rD[ym(0x26f)] = 1.75), rD[ym(0x130)](), rD[ym(0x936)]();
          if (this[ym(0x1d7)]) {
            const s2 = this[ym(0x793)],
              s3 = 0x28,
              s4 = Date[ym(0x7c4)]() / 0x12c,
              s5 = this[ym(0x4e0)] ? 0x0 : Math[ym(0xbe5)](s4) * 0.5 + 0.5,
              s6 = s5 * 0x4,
              s7 = 0x28 - s5 * 0x4,
              s8 = s7 - (this[ym(0x4e0)] ? 0x1 : jf(s2)) * 0x50,
              s9 = this[ym(0xb61)];
            (rD[ym(0x26f)] = 0x9 + rH * 0x2),
              (rD[ym(0xd10)] = ym(0x2ab)),
              (rD[ym(0x534)] = ym(0x2ab));
            for (let sa = 0x0; sa < 0x2; sa++) {
              rD[ym(0x16b)](), rD[ym(0x68f)]();
              for (let sb = 0x0; sb < 0x2; sb++) {
                rD[ym(0x7f4)](0x19, 0x0);
                let sc = s8;
                s9 && sb === 0x0 && (sc = s7),
                  rD[ym(0x9f0)](0x2d + s6, sc * 0.5, 0xb, sc),
                  rD[ym(0x9b0)](-0x1, 0x1);
              }
              rD[ym(0x936)](),
                (rD[ym(0x555)] = rG[0x1 - sa]),
                rD[ym(0x130)](),
                (rD[ym(0x26f)] = 0x9);
            }
            rD[ym(0x68f)](),
              rD[ym(0xc8b)](0x0, s8),
              lS(rD, s5),
              rD[ym(0x936)]();
          }
          rD[ym(0x936)]();
        }
        [us(0x5fa)](rD, rE) {}
        [us(0x6f6)](rD, rE = 0x1) {
          const yr = us,
            rF = nh[this["id"]];
          if (!rF) return;
          for (let rG = 0x0; rG < rF[yr(0x8c2)]; rG++) {
            const rH = rF[rG];
            if (rH["t"] > lV + lW) continue;
            !rH["x"] &&
              ((rH["x"] = this["x"]),
              (rH["y"] = this["y"] - this[yr(0xc60)] - 0x44),
              (rH[yr(0x553)] = this["x"]),
              (rH[yr(0x80e)] = this["y"]));
            const rI = rH["t"] > lV ? 0x1 - (rH["t"] - lV) / lW : 0x1,
              rJ = rI * rI * rI;
            (rH["x"] += (this["x"] - rH[yr(0x553)]) * rJ),
              (rH["y"] += (this["y"] - rH[yr(0x80e)]) * rJ),
              (rH[yr(0x553)] = this["x"]),
              (rH[yr(0x80e)] = this["y"]);
            const rK = Math[yr(0xbe6)](0x1, rH["t"] / 0x64);
            rD[yr(0x68f)](),
              (rD[yr(0x23f)] = (rI < 0.7 ? rI / 0.7 : 0x1) * rK * 0.9),
              rD[yr(0xc8b)](rH["x"], rH["y"] - (rH["t"] / lV) * 0x14),
              rD[yr(0x2cb)](rE);
            const rL = pG(rD, rH[yr(0x87a)], 0x10, yr(0x92d), 0x0, !![], ![]);
            rD[yr(0x2cb)](rK), rD[yr(0x16b)]();
            const rM = rL[yr(0xdc6)] + 0xa,
              rN = rL[yr(0xd33)] + 0xf;
            rD[yr(0xc3b)]
              ? rD[yr(0xc3b)](-rM / 0x2, -rN / 0x2, rM, rN, 0x5)
              : rD[yr(0x66c)](-rM / 0x2, -rN / 0x2, rM, rN),
              (rD[yr(0x5ef)] = rH[yr(0x20e)]),
              rD[yr(0x527)](),
              (rD[yr(0x555)] = yr(0x92d)),
              (rD[yr(0x26f)] = 1.5),
              rD[yr(0x130)](),
              rD[yr(0xdb8)](
                rL,
                -rL[yr(0xdc6)] / 0x2,
                -rL[yr(0xd33)] / 0x2,
                rL[yr(0xdc6)],
                rL[yr(0xd33)]
              ),
              rD[yr(0x936)]();
          }
        }
      },
      lU = 0x4e20,
      lV = 0xfa0,
      lW = 0xbb8,
      lX = lV + lW;
    function lY(rD, rE, rF = 0x1) {
      const ys = us;
      if (rD[ys(0xd11)]) return;
      rE[ys(0x68f)](),
        rE[ys(0xc8b)](rD["x"], rD["y"]),
        lZ(rD, rE),
        rE[ys(0xc8b)](0x0, -rD[ys(0xc60)] - 0x19),
        rE[ys(0x68f)](),
        rE[ys(0x2cb)](rF),
        rD[ys(0x557)] &&
          (pG(rE, "@" + rD[ys(0x557)], 0xb, ys(0x38a), 0x3),
          rE[ys(0xc8b)](0x0, -0x10)),
        rD[ys(0x324)] &&
          (pG(rE, rD[ys(0x324)], 0x12, ys(0x18c), 0x3),
          rE[ys(0xc8b)](0x0, -0x5)),
        rE[ys(0x936)](),
        !rD[ys(0x6b9)] &&
          rD[ys(0x6a7)] > 0.001 &&
          ((rE[ys(0x23f)] = rD[ys(0x6a7)]),
          rE[ys(0x9b0)](rD[ys(0x6a7)] * 0x3, rD[ys(0x6a7)] * 0x3),
          rE[ys(0x16b)](),
          rE[ys(0x67d)](0x0, 0x0, 0x14, 0x0, l0),
          (rE[ys(0x5ef)] = ys(0x5d5)),
          rE[ys(0x527)](),
          nz(rE, 0.8),
          rE[ys(0x16b)](),
          rE[ys(0x67d)](0x0, 0x0, 0x14, 0x0, l0),
          (rE[ys(0x5ef)] = ys(0x740)),
          rE[ys(0x527)](),
          rE[ys(0x16b)](),
          rE[ys(0x7f4)](0x0, 0x0),
          rE[ys(0x67d)](0x0, 0x0, 0x10, 0x0, l0 * rD[ys(0x38b)]),
          rE[ys(0x5d2)](0x0, 0x0),
          rE[ys(0xc88)](),
          nz(rE, 0.8)),
        rE[ys(0x936)]();
    }
    function lZ(rD, rE, rF = ![]) {
      const yt = us;
      if (rD[yt(0x526)] <= 0x0) return;
      rE[yt(0x68f)](),
        (rE[yt(0x23f)] = rD[yt(0x526)]),
        (rE[yt(0x555)] = yt(0x5d0)),
        rE[yt(0x16b)]();
      const rG = rF ? 0x8c : rD[yt(0x6b9)] ? 0x4b : 0x64,
        rH = rF ? 0x1a : 0x9;
      if (rF) rE[yt(0xc8b)](rD[yt(0xc60)] + 0x11, 0x0);
      else {
        const rJ = Math[yt(0xdb0)](0x1, rD[yt(0xc60)] / 0x64);
        rE[yt(0x9b0)](rJ, rJ),
          rE[yt(0xc8b)](-rG / 0x2, rD[yt(0xc60)] / rJ + 0x1b);
      }
      rE[yt(0x16b)](),
        rE[yt(0x7f4)](rF ? -0x14 : 0x0, 0x0),
        rE[yt(0x5d2)](rG, 0x0),
        (rE[yt(0x534)] = yt(0x2ab)),
        (rE[yt(0x26f)] = rH),
        (rE[yt(0x555)] = yt(0x5d0)),
        rE[yt(0x130)]();
      function rI(rK) {
        const yu = yt;
        rE[yu(0x23f)] = rK < 0.05 ? rK / 0.05 : 0x1;
      }
      rD[yt(0x7bd)] > 0x0 &&
        (rI(rD[yt(0x7bd)]),
        rE[yt(0x16b)](),
        rE[yt(0x7f4)](0x0, 0x0),
        rE[yt(0x5d2)](rD[yt(0x7bd)] * rG, 0x0),
        (rE[yt(0x26f)] = rH * (rF ? 0.55 : 0.44)),
        (rE[yt(0x555)] = yt(0x328)),
        rE[yt(0x130)]());
      rD[yt(0x3ab)] > 0x0 &&
        (rI(rD[yt(0x3ab)]),
        rE[yt(0x16b)](),
        rE[yt(0x7f4)](0x0, 0x0),
        rE[yt(0x5d2)](rD[yt(0x3ab)] * rG, 0x0),
        (rE[yt(0x26f)] = rH * (rF ? 0.7 : 0.66)),
        (rE[yt(0x555)] = yt(0x78d)),
        rE[yt(0x130)]());
      rD[yt(0x55a)] &&
        (rI(rD[yt(0x55a)]),
        rE[yt(0x16b)](),
        rE[yt(0x7f4)](0x0, 0x0),
        rE[yt(0x5d2)](rD[yt(0x55a)] * rG, 0x0),
        (rE[yt(0x26f)] = rH * (rF ? 0.45 : 0.35)),
        (rE[yt(0x555)] = yt(0x666)),
        rE[yt(0x130)]());
      if (rD[yt(0x6b9)]) {
        rE[yt(0x23f)] = 0x1;
        var hp = Math.round(rD.health * hack.hp);
        var shield = Math.round(rD.shield * hack.hp);
        if(rD.username == hack.player.name) hack.player.entity = rD;
        const rK = pG(
          rE,
          `HP ${hp}${shield ? " + " + shield : ""} ` + yt(0x508) + (rD[yt(0x29c)] + 0x1),
          rF ? 0xc : 0xe,
          yt(0x18c),
          0x3,
          !![]
        );
        rE[yt(0xdb8)](
          rK,
          rG + rH / 0x2 - rK[yt(0xdc6)],
          rH / 0x2,
          rK[yt(0xdc6)],
          rK[yt(0xd33)]
        );
        if (rF) {
          const rL = pG(rE, "@" + rD[yt(0x557)], 0xc, yt(0x38a), 0x3, !![]);
          rE[yt(0xdb8)](
            rL,
            -rH / 0x2,
            -rH / 0x2 - rL[yt(0xd33)],
            rL[yt(0xdc6)],
            rL[yt(0xd33)]
          );
        }
      } else {
        rE[yt(0x23f)] = 0x1;
        const rM = kc[rD[yt(0x41e)]],
          rN = pG(rE, rM, 0xe, yt(0x18c), 0x3, !![], rD[yt(0x110)]);
        rE[yt(0x68f)](), rE[yt(0xc8b)](0x0, -rH / 0x2 - rN[yt(0xd33)]);
        rN[yt(0xdc6)] > rG + rH
          ? rE[yt(0xdb8)](
              rN,
              rG / 0x2 - rN[yt(0xdc6)] / 0x2,
              0x0,
              rN[yt(0xdc6)],
              rN[yt(0xd33)]
            )
          : rE[yt(0xdb8)](rN, -rH / 0x2, 0x0, rN[yt(0xdc6)], rN[yt(0xd33)]);
        rE[yt(0x936)]();
        const rO = pG(rE, rD[yt(0x110)], 0xe, hP[rD[yt(0x110)]], 0x3, !![]);
        rE[yt(0xdb8)](
          rO,
          rG + rH / 0x2 - rO[yt(0xdc6)],
          rH / 0x2,
          rO[yt(0xdc6)],
          rO[yt(0xd33)]
        );
        var genCanvas = pG;
        const health = genCanvas(
          rE,
          `${Math.floor(rD['health'] * getHP(rD, hack.moblst))} (${Math.floor(rD['health'] * 100)}%)`,
          30,
          hack.getColor(rD),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) rE.drawImage(
          health,
          -60,
          -150,
          health.worldW,
          health.worldH
        );
        const health2 = genCanvas(
          rE,
          `/ ${getHP(rD, hack.moblst)} `,
          30,
          hack.getColor(rD),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) rE.drawImage(
          health2,
          -60,
          -120,
          health2.worldW,
          health2.worldH
        );
      }
      rF &&
        rD[yt(0x324)] &&
        ((rE[yt(0x23f)] = 0x1),
        rE[yt(0xc8b)](rG / 0x2, 0x0),
        pG(rE, rD[yt(0x324)], 0x11, yt(0x18c), 0x3)),
        rE[yt(0x936)]();
    }
    function m0(rD) {
      const yv = us;
      for (let rE in oC) {
        oC[rE][yv(0x1c4)](rD);
      }
      oV();
    }
    var m1 = {},
      m2 = document[us(0xa02)](us(0x7d8));
    mG(us(0x9dc), us(0x8ef), us(0x7d9)),
      mG(us(0xab9), us(0x7d8), us(0xceb)),
      mG(us(0xd27), us(0x319), us(0x660), () => {
        const yw = us;
        (hv = ![]), (hD[yw(0x660)] = fc);
      }),
      mG(us(0x918), us(0x54d), us(0x878)),
      mG(us(0x5ed), us(0x266), us(0x414)),
      mG(us(0x934), us(0x747), us(0x7b7)),
      mG(us(0xcb0), us(0x1a3), us(0x718)),
      mG(us(0x835), us(0x515), us(0x8fa)),
      mG(us(0x803), us(0x47f), us(0xb82)),
      mG(us(0x3b1), us(0xa46), "lb"),
      mG(us(0x14f), us(0xae8), us(0x7b0)),
      mG(us(0x675), us(0x851), us(0x823), () => {
        const yx = us;
        (mh[yx(0xb14)][yx(0x5ad)] = yx(0xaa8)), (hD[yx(0x823)] = mg);
      }),
      mG(us(0xb9a), us(0xa4a), us(0x8a3), () => {
        const yy = us;
        if (!hW) return;
        il(new Uint8Array([cI[yy(0x111)]]));
      });
    var m3 = document[us(0xa02)](us(0x364)),
      m4 = ![],
      m5 = null,
      m6 = nN(us(0x566));
    setInterval(() => {
      m5 && m7();
    }, 0x3e8);
    function m7() {
      const yz = us;
      k8(m6, yz(0x395) + ka(Date[yz(0x7c4)]() - m5[yz(0x21d)]) + yz(0x959));
    }
    function m8(rD) {
      const yA = us;
      document[yA(0xb87)][yA(0x5a4)][yA(0x2b0)](yA(0xef));
      const rE = nN(
        yA(0x56f) +
          rD[yA(0x9fe)] +
          yA(0x301) +
          rD[yA(0x3d6)] +
          yA(0xae4) +
          (rD[yA(0x477)]
            ? yA(0x744) +
              rD[yA(0x477)] +
              "\x22\x20" +
              (rD[yA(0xdb2)] ? yA(0x163) + rD[yA(0xdb2)] + "\x22" : "") +
              yA(0xb5f)
            : "") +
          yA(0x8a4)
      );
      (r1 = rE),
        (rE[yA(0x1c4)] = function () {
          const yB = yA;
          document[yB(0xb87)][yB(0x5a4)][yB(0xbc7)](yB(0xef)),
            rE[yB(0xbc7)](),
            (r1 = null);
        }),
        (rE[yA(0xa02)](yA(0x6ff))[yA(0x269)] = rE[yA(0x1c4)]);
      const rF = rE[yA(0xa02)](yA(0x88e)),
        rG = 0x14;
      rH(0x0);
      if (rD[yA(0x7e4)][yA(0x8c2)] > rG) {
        const rI = nN(yA(0x62e));
        rE[yA(0x75c)](rI);
        const rJ = rI[yA(0xa02)](yA(0x1a4)),
          rK = Math[yA(0xb0c)](rD[yA(0x7e4)][yA(0x8c2)] / rG);
        for (let rN = 0x0; rN < rK; rN++) {
          const rO = nN(yA(0x4be) + rN + yA(0xa1b) + (rN + 0x1) + yA(0x24c));
          rJ[yA(0x75c)](rO);
        }
        rJ[yA(0x4d8)] = function () {
          const yC = yA;
          rH(this[yC(0x69c)]);
        };
        const rL = rE[yA(0xa02)](yA(0xdcf)),
          rM = rE[yA(0xa02)](yA(0x447));
        rM[yA(0x4d8)] = function () {
          const yD = yA,
            rP = this[yD(0x69c)][yD(0x938)]();
          (rL[yD(0xcc2)] = ""), (rL[yD(0xb14)][yD(0x5ad)] = yD(0xaa8));
          if (!rP) return;
          const rQ = new RegExp(rP, "i");
          let rR = 0x0;
          for (let rS = 0x0; rS < rD[yD(0x7e4)][yD(0x8c2)]; rS++) {
            const rT = rD[yD(0x7e4)][rS];
            if (rQ[yD(0x73d)](rT[yD(0x78f)])) {
              const rU = nN(
                yD(0x948) +
                  (rS + 0x1) +
                  yD(0x6eb) +
                  rT[yD(0x78f)] +
                  yD(0xa4b) +
                  k9(rT[yD(0xac)]) +
                  yD(0x91e)
              );
              rL[yD(0x75c)](rU),
                (rU[yD(0xa02)](yD(0x558))[yD(0x269)] = function () {
                  const yE = yD;
                  mv(rT[yE(0x78f)]);
                }),
                (rU[yD(0x269)] = function (rV) {
                  const yF = yD;
                  if (rV[yF(0x37c)] === this) {
                    const rW = Math[yF(0x815)](rS / rG);
                    rH(rW), (rJ[yF(0x69c)] = rW);
                  }
                }),
                rR++;
              if (rR >= 0x8) break;
            }
          }
          rR > 0x0 && (rL[yD(0xb14)][yD(0x5ad)] = "");
        };
      }
      function rH(rP = 0x0) {
        const yG = yA,
          rQ = rP * rG,
          rR = Math[yG(0xbe6)](rD[yG(0x7e4)][yG(0x8c2)], rQ + rG);
        rF[yG(0xcc2)] = "";
        for (let rS = rQ; rS < rR; rS++) {
          const rT = rD[yG(0x7e4)][rS];
          rF[yG(0x75c)](rD[yG(0x88b)](rT, rS));
          const rU = nN(yG(0xce2));
          for (let rV = 0x0; rV < rT[yG(0x66a)][yG(0x8c2)]; rV++) {
            const [rW, rX] = rT[yG(0x66a)][rV],
              rY = dF[rW],
              rZ = nN(
                yG(0xcc7) + rY[yG(0x3b6)] + "\x22\x20" + qx(rY) + yG(0xb5f)
              );
            jY(rZ);
            const s0 = "x" + k9(rX),
              s1 = nN(yG(0x7f6) + s0 + yG(0x10c));
            s0[yG(0x8c2)] > 0x6 && s1[yG(0x5a4)][yG(0x2b0)](yG(0x373)),
              rZ[yG(0x75c)](s1),
              (rZ[yG(0xab7)] = rY),
              rU[yG(0x75c)](rZ);
          }
          rF[yG(0x75c)](rU);
        }
      }
      kl[yA(0x75c)](rE);
    }
    function m9(rD, rE = ![]) {
      const yH = us;
      let rF = [],
        rG = 0x0;
      for (const rI in rD) {
        const rJ = rD[rI];
        let rK = 0x0,
          rL = [];
        for (const rN in rJ) {
          const rO = rJ[rN];
          rL[yH(0x733)]([rN, rO]), (rK += rO), (rG += rO);
        }
        rL = rL[yH(0x242)]((rP, rQ) => rQ[0x1] - rP[0x1]);
        const rM = {};
        (rM[yH(0x78f)] = rI),
          (rM[yH(0x66a)] = rL),
          (rM[yH(0xac)] = rK),
          rF[yH(0x733)](rM);
      }
      if (rE) rF = rF[yH(0x242)]((rP, rQ) => rQ[yH(0xac)] - rP[yH(0xac)]);
      const rH = {};
      return (rH[yH(0xac)] = rG), (rH[yH(0x7e4)] = rF), rH;
    }
    function ma() {
      return mb(new Date());
    }
    function mb(rD) {
      const yI = us,
        rE = {};
      rE[yI(0x7d4)] = yI(0xb4f);
      const rF = rD[yI(0x914)]("en", rE),
        rG = {};
      rG[yI(0xd6b)] = yI(0x9fd);
      const rH = rD[yI(0x914)]("en", rG),
        rI = {};
      rI[yI(0x90a)] = yI(0xb4f);
      const rJ = rD[yI(0x914)]("en", rI);
      return "" + rF + mc(rF) + "\x20" + rH + "\x20" + rJ;
    }
    function mc(rD) {
      if (rD >= 0xb && rD <= 0xd) return "th";
      switch (rD % 0xa) {
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
    function md(rD, rE) {
      const yJ = us,
        rF = nN(
          yJ(0xca7) +
            (rE + 0x1) +
            yJ(0x48a) +
            rD[yJ(0x78f)] +
            yJ(0x7cd) +
            k9(rD[yJ(0xac)]) +
            yJ(0xa0b) +
            (rD[yJ(0xac)] == 0x1 ? "" : "s") +
            yJ(0xd53)
        );
      return (
        (rF[yJ(0xa02)](yJ(0x558))[yJ(0x269)] = function () {
          const yK = yJ;
          mv(rD[yK(0x78f)]);
        }),
        rF
      );
    }
    var me = {
      ultraPlayers: {
        title: us(0x304),
        parse(rD) {
          const yL = us,
            rE = rD[yL(0xd81)];
          if (rE[yL(0xd28)] !== 0x1) throw new Error(yL(0xcf8) + rE[yL(0xd28)]);
          const rF = {},
            rG = rE[yL(0xdb9)][yL(0x64a)]("+");
          for (const rI in rE[yL(0x63e)]) {
            const rJ = rE[yL(0x63e)][rI][yL(0x64a)]("\x20"),
              rK = {};
            for (let rL = 0x0; rL < rJ[yL(0x8c2)] - 0x1; rL++) {
              let [rM, rN] = rJ[rL][yL(0x64a)](",");
              rK[rG[rM]] = parseInt(rN);
            }
            rF[rI] = rK;
          }
          const rH = m9(rF, !![]);
          return {
            title: this[yL(0x9fe)],
            titleColor: hP[yL(0x547)],
            desc:
              ma() +
              yL(0x407) +
              k9(rH[yL(0x7e4)][yL(0x8c2)]) +
              yL(0xb1f) +
              k9(rH[yL(0xac)]) +
              yL(0x9b2),
            getTitleEl: md,
            groups: rH[yL(0x7e4)],
          };
        },
      },
      superPlayers: {
        title: us(0xd32),
        parse(rD) {
          const yM = us,
            rE = m9(rD[yM(0x33e)], !![]);
          return {
            title: this[yM(0x9fe)],
            titleColor: hP[yM(0xd3)],
            desc:
              ma() +
              yM(0x407) +
              k9(rE[yM(0x7e4)][yM(0x8c2)]) +
              yM(0xb1f) +
              k9(rE[yM(0xac)]) +
              yM(0x9b2),
            getTitleEl: md,
            groups: rE[yM(0x7e4)],
          };
        },
      },
      hyperPlayers: {
        title: us(0x7ca),
        parse(rD) {
          const yN = us,
            rE = m9(rD[yN(0x9cb)], !![]);
          return {
            title: this[yN(0x9fe)],
            titleColor: hP[yN(0x8bb)],
            desc:
              ma() +
              yN(0x407) +
              k9(rE[yN(0x7e4)][yN(0x8c2)]) +
              yN(0xb1f) +
              k9(rE[yN(0xac)]) +
              yN(0x9b2),
            getTitleEl: md,
            groups: rE[yN(0x7e4)],
          };
        },
      },
      petals: {
        title: us(0x133),
        parse(rD) {
          const yO = us,
            rE = m9(rD[yO(0x66a)], ![]),
            rF = rE[yO(0x7e4)][yO(0x242)](
              (rG, rH) => rH[yO(0x78f)] - rG[yO(0x78f)]
            );
          return {
            title: this[yO(0x9fe)],
            titleColor: hP[yO(0xde2)],
            desc: ma() + yO(0x407) + k9(rE[yO(0xac)]) + yO(0x9b2),
            getTitleEl(rG, rH) {
              const yP = yO;
              return nN(
                yP(0x5df) +
                  hN[rG[yP(0x78f)]] +
                  yP(0x407) +
                  k9(rG[yP(0xac)]) +
                  yP(0x265)
              );
            },
            groups: rF,
          };
        },
      },
    };
    function mf() {
      const yQ = us;
      if (m4) return;
      if (m5 && Date[yQ(0x7c4)]() - m5[yQ(0x21d)] < 0x3c * 0xea60) return;
      (m4 = !![]),
        fetch((i8 ? yQ(0xb83) : yQ(0x9a1)) + yQ(0x31d))
          [yQ(0x715)]((rD) => rD[yQ(0x1e6)]())
          [yQ(0x715)]((rD) => {
            const yR = yQ;
            (m4 = ![]), (m5 = rD), m7(), (m3[yR(0xcc2)] = "");
            for (const rE in me) {
              if (!(rE in rD)) continue;
              const rF = me[rE],
                rG = nN(yR(0xbf3) + rF[yR(0x9fe)] + yR(0x56d));
              (rG[yR(0x269)] = function () {
                const yS = yR;
                m8(rF[yS(0xae6)](rD));
              }),
                m3[yR(0x75c)](rG);
            }
            m3[yR(0x75c)](m6);
          })
          [yQ(0x79c)]((rD) => {
            const yT = yQ;
            (m4 = ![]),
              hc(yT(0xd4f)),
              console[yT(0x26e)](yT(0xb66), rD),
              setTimeout(mf, 0x1388);
          });
    }
    mG(us(0x385), us(0xa94), us(0xb7a), mf);
    var mg = 0xb,
      mh = document[us(0xa02)](us(0x15f));
    hD[us(0x823)] == mg && (mh[us(0xb14)][us(0x5ad)] = us(0xaa8));
    var mi = document[us(0xa02)](us(0x846));
    mi[us(0xb14)][us(0x5ad)] = us(0xaa8);
    var mj = document[us(0xa02)](us(0xc95)),
      mk = document[us(0xa02)](us(0x7d0)),
      ml = document[us(0xa02)](us(0xe2));
    ml[us(0x269)] = function () {
      const yU = us;
      mi[yU(0xb14)][yU(0x5ad)] = yU(0xaa8);
    };
    var mm = ![];
    mk[us(0x269)] = nt(function (rD) {
      const yV = us;
      if (!hW || mm || jy) return;
      const rE = mj[yV(0x69c)][yV(0x938)]();
      if (!rE || !eV(rE)) {
        mj[yV(0x5a4)][yV(0xbc7)](yV(0x158)),
          void mj[yV(0x3ac)],
          mj[yV(0x5a4)][yV(0x2b0)](yV(0x158));
        return;
      }
      (mi[yV(0xb14)][yV(0x5ad)] = ""),
        (mi[yV(0xcc2)] = yV(0x2c2)),
        il(
          new Uint8Array([cI[yV(0xba8)], ...new TextEncoder()[yV(0x965)](rE)])
        ),
        (mm = !![]);
    });
    function mn(rD, rE) {
      const yW = us;
      if (rD === yW(0x6ad)) {
        const rF = {};
        (rF[yW(0x90a)] = yW(0xb4f)),
          (rF[yW(0x7d4)] = yW(0xbc0)),
          (rF[yW(0xd6b)] = yW(0xbc0)),
          (rE = new Date(
            rE === 0x0 ? Date[yW(0x7c4)]() : rE * 0x3e8 * 0x3c * 0x3c
          )[yW(0x914)]("en", rF));
      } else
        rD === yW(0x4de) || rD === yW(0x393)
          ? (rE = ka(rE * 0x3e8 * 0x3c, !![]))
          : (rE = k9(rE));
      return rE;
    }
    var mo = f2(),
      mp = {},
      mq = document[us(0xa02)](us(0xb70));
    mq[us(0xcc2)] = "";
    for (let rD in mo) {
      const rE = mr(rD);
      rE[us(0xb62)](0x0), mq[us(0x75c)](rE), (mp[rD] = rE);
    }
    function mr(rF) {
      const yX = us,
        rG = nN(yX(0x164) + kd(rF) + yX(0xa8f)),
        rH = rG[yX(0xa02)](yX(0x14a));
      return (
        (rG[yX(0xb62)] = function (rI) {
          k8(rH, mn(rF, rI));
        }),
        rG
      );
    }
    var ms;
    function mt(rF, rG, rH, rI, rJ, rK, rL) {
      const yY = us;
      ms && (ms[yY(0xbc6)](), (ms = null));
      const rM = rK[yY(0x8c2)] / 0x2,
        rN = yY(0xbdf)[yY(0x513)](rM),
        rO = nN(
          yY(0xbd3) +
            rF +
            yY(0x659) +
            rN +
            yY(0xa3f) +
            rN +
            yY(0x463) +
            yY(0x37d)[yY(0x513)](eL * dH) +
            yY(0x1b4) +
            (rH[yY(0x8c2)] === 0x0 ? yY(0x1d3) : "") +
            yY(0x165)
        );
      rL && rO[yY(0x75c)](nN(yY(0x932)));
      ms = rO;
      const rP = rO[yY(0xa02)](yY(0xc94)),
        rQ = rO[yY(0xa02)](yY(0xc71));
      for (let s2 = 0x0; s2 < rK[yY(0x8c2)]; s2++) {
        const s3 = rK[s2];
        if (!s3) continue;
        const s4 = oc(s3);
        s4[yY(0x5a4)][yY(0xbc7)](yY(0x9ed)),
          (s4[yY(0xf9)] = !![]),
          s4[yY(0xb51)][yY(0xbc7)](),
          (s4[yY(0xb51)] = null),
          s2 < rM
            ? rP[yY(0xbaf)][s2][yY(0x75c)](s4)
            : rQ[yY(0xbaf)][s2 - rM][yY(0x75c)](s4);
      }
      (rO[yY(0xbc6)] = function () {
        const yZ = yY;
        (rO[yZ(0xb14)][yZ(0x881)] = yZ(0x8a9)),
          (rO[yZ(0xb14)][yZ(0x5ad)] = yZ(0xaa8)),
          void rO[yZ(0x3ac)],
          (rO[yZ(0xb14)][yZ(0x5ad)] = ""),
          setTimeout(function () {
            const z0 = yZ;
            rO[z0(0xbc7)]();
          }, 0x3e8);
      }),
        (rO[yY(0xa02)](yY(0x6ff))[yY(0x269)] = function () {
          const z1 = yY;
          rO[z1(0xbc6)]();
        });
      const rR = d4(rJ),
        rS = rR[0x0],
        rT = rR[0x1],
        rU = d2(rS + 0x1),
        rV = rJ - rT,
        rW = rO[yY(0xa02)](yY(0x3da));
      k8(
        rW,
        yY(0x15c) + (rS + 0x1) + yY(0x5da) + iJ(rV) + "/" + iJ(rU) + yY(0xd8c)
      );
      const rX = Math[yY(0xbe6)](0x1, rV / rU),
        rY = rO[yY(0xa02)](yY(0xd67));
      rY[yY(0xb14)][yY(0xd8b)] = rX * 0x64 + "%";
      const rZ = rO[yY(0xa02)](yY(0xb70));
      for (let s5 in mo) {
        const s6 = mr(s5);
        s6[yY(0xb62)](rG[s5]), rZ[yY(0x75c)](s6);
      }
      const s0 = rO[yY(0xa02)](yY(0xb0d));
      rH[yY(0x242)]((s7, s8) => ob(s7[0x0], s8[0x0]));
      for (let s7 = 0x0; s7 < rH[yY(0x8c2)]; s7++) {
        const [s8, s9] = rH[s7],
          sa = oc(s8);
        jY(sa),
          sa[yY(0x5a4)][yY(0xbc7)](yY(0x9ed)),
          (sa[yY(0xf9)] = !![]),
          p2(sa[yY(0xb51)], s9),
          s0[yY(0x75c)](sa);
      }
      if (rH[yY(0x8c2)] > 0x0) {
        const sb = nN(yY(0xcd)),
          sc = {};
        for (let sd = 0x0; sd < rH[yY(0x8c2)]; sd++) {
          const [se, sf] = rH[sd];
          sc[se[yY(0x3b6)]] = (sc[se[yY(0x3b6)]] || 0x0) + sf;
        }
        oB(sb, sc), rO[yY(0xa02)](yY(0x747))[yY(0x75c)](sb);
      }
      const s1 = rO[yY(0xa02)](yY(0x606));
      for (let sg = 0x0; sg < rI[yY(0x8c2)]; sg++) {
        const sh = rI[sg],
          si = nS(sh, !![]);
        si[yY(0x5a4)][yY(0xbc7)](yY(0x9ed)), (si[yY(0xf9)] = !![]);
        const sj = s1[yY(0xbaf)][sh[yY(0x8b9)] * dH + sh[yY(0x3b6)]];
        s1[yY(0x865)](si, sj), sj[yY(0xbc7)]();
      }
      rO[yY(0x5a4)][yY(0x2b0)](yY(0x4d7)),
        setTimeout(function () {
          const z2 = yY;
          rO[z2(0x5a4)][z2(0xbc7)](z2(0x4d7));
        }, 0x0),
        kl[yY(0x75c)](rO);
    }
    var mu = document[us(0xa02)](us(0x61a));
    document[us(0xa02)](us(0x281))[us(0x269)] = nt(function (rF) {
      const z3 = us,
        rG = mu[z3(0x69c)][z3(0x938)]();
      ns(rG);
    });
    function mv(rF) {
      const z4 = us,
        rG = new Uint8Array([
          cI[z4(0xa2c)],
          ...new TextEncoder()[z4(0x965)](rF),
        ]);
      il(rG);
    }
    var mw = document[us(0xa02)](us(0x515)),
      mz = document[us(0xa02)](us(0xa46)),
      mA = mz[us(0xa02)](us(0x88e)),
      mB = 0x0,
      mC = 0x0;
    setInterval(function () {
      const z5 = us;
      hW &&
        (pM - mC > 0x7530 &&
          mw[z5(0x5a4)][z5(0x842)](z5(0xd69)) &&
          (il(new Uint8Array([cI[z5(0x550)]])), (mC = pM)),
        pM - mB > 0xea60 &&
          mz[z5(0x5a4)][z5(0x842)](z5(0xd69)) &&
          (il(new Uint8Array([cI[z5(0x1a9)]])), (mB = pM)));
    }, 0x3e8);
    var mD = ![];
    function mE(rF) {
      const z6 = us;
      for (let rG in m1) {
        if (rF === rG) continue;
        m1[rG][z6(0xbc6)]();
      }
      mD = ![];
    }
    window[us(0x269)] = function (rF) {
      const z7 = us;
      if ([kk, kn, ki][z7(0xd4)](rF[z7(0x37c)])) mE();
    };
    function mF() {
      const z8 = us;
      iy && !p8[z8(0x2e6)] && im(0x0, 0x0);
    }
    function mG(rF, rG, rH, rI) {
      const z9 = us,
        rJ = document[z9(0xa02)](rG),
        rK = rJ[z9(0xa02)](z9(0x88e)),
        rL = document[z9(0xa02)](rF);
      let rM = null,
        rN = rJ[z9(0xa02)](z9(0x44d));
      rN &&
        (rN[z9(0x269)] = function () {
          const za = z9;
          rJ[za(0x5a4)][za(0xd2a)](za(0x1c5));
        });
      (rK[z9(0xb14)][z9(0x5ad)] = z9(0xaa8)),
        rJ[z9(0x5a4)][z9(0xbc7)](z9(0xd69)),
        (rL[z9(0x269)] = function () {
          const zb = z9;
          rO[zb(0xd2a)]();
        }),
        (rJ[z9(0xa02)](z9(0x6ff))[z9(0x269)] = function () {
          mE();
        });
      const rO = [rL, rJ];
      (rO[z9(0xbc6)] = function () {
        const zc = z9;
        rL[zc(0x5a4)][zc(0xbc7)](zc(0x453)),
          rJ[zc(0x5a4)][zc(0xbc7)](zc(0xd69)),
          !rM &&
            (rM = setTimeout(function () {
              const zd = zc;
              (rK[zd(0xb14)][zd(0x5ad)] = zd(0xaa8)), (rM = null);
            }, 0x3e8));
      }),
        (rO[z9(0xd2a)] = function () {
          const ze = z9;
          mE(rH),
            rJ[ze(0x5a4)][ze(0x842)](ze(0xd69))
              ? rO[ze(0xbc6)]()
              : rO[ze(0xd69)]();
        }),
        (rO[z9(0xd69)] = function () {
          const zf = z9;
          rI && rI(),
            clearTimeout(rM),
            (rM = null),
            (rK[zf(0xb14)][zf(0x5ad)] = ""),
            rL[zf(0x5a4)][zf(0x2b0)](zf(0x453)),
            rJ[zf(0x5a4)][zf(0x2b0)](zf(0xd69)),
            (mD = !![]),
            mF();
        }),
        (m1[rH] = rO);
    }
    var mH = [],
      mI,
      mJ = 0x0,
      mK = ![],
      mL = document[us(0xa02)](us(0x934)),
      mM = {
        tagName: us(0x331),
        getBoundingClientRect() {
          const zg = us,
            rF = mL[zg(0x653)](),
            rG = {};
          return (
            (rG["x"] = rF["x"] + rF[zg(0xd8b)] / 0x2),
            (rG["y"] = rF["y"] + rF[zg(0x3ca)] / 0x2),
            rG
          );
        },
        appendChild(rF) {
          const zh = us;
          rF[zh(0xbc7)]();
        },
      };
    function mN(rF) {
      const zi = us;
      if (!hW) return;
      const rG = rF[zi(0x37c)];
      if (rG[zi(0x1b6)]) mI = n7(rG, rF);
      else {
        if (rG[zi(0xacb)]) {
          mE();
          const rH = rG[zi(0x204)]();
          (rH[zi(0xab7)] = rG[zi(0xab7)]),
            nM(rH, rG[zi(0xab7)]),
            (rH[zi(0x1c6)] = 0x1),
            (rH[zi(0xacb)] = !![]),
            (rH[zi(0x1ca)] = mM),
            rH[zi(0x5a4)][zi(0x2b0)](zi(0xc2));
          const rI = rG[zi(0x653)]();
          (rH[zi(0xb14)][zi(0x31e)] = rI["x"] / kR + "px"),
            (rH[zi(0xb14)][zi(0xdd)] = rI["y"] / kR + "px"),
            kH[zi(0x75c)](rH),
            (mI = n7(rH, rF)),
            (mJ = 0x0),
            (mD = !![]);
        } else return ![];
      }
      return (mJ = Date[zi(0x7c4)]()), (mK = !![]), !![];
    }
    function mO(rF) {
      const zj = us;
      for (let rG = 0x0; rG < rF[zj(0xbaf)][zj(0x8c2)]; rG++) {
        const rH = rF[zj(0xbaf)][rG];
        if (rH[zj(0x5a4)][zj(0x842)](zj(0xab7)) && !n6(rH)) return rH;
      }
    }
    function mP() {
      const zk = us;
      if (mI) {
        if (mK && Date[zk(0x7c4)]() - mJ < 0x1f4) {
          if (mI[zk(0x1b6)]) {
            const rF = mI[zk(0x7b1)][zk(0x46a)];
            mI[zk(0x352)](
              rF >= iN ? nx[zk(0xbaf)][rF - iN + 0x1] : ny[zk(0xbaf)][rF]
            );
          } else {
            if (mI[zk(0xacb)]) {
              let rG = mO(nx) || mO(ny);
              rG && mI[zk(0x352)](rG);
            }
          }
        }
        mI[zk(0xd44)]();
        if (mI[zk(0xacb)]) {
          (mI[zk(0xacb)] = ![]),
            (mI[zk(0x1b6)] = !![]),
            m1[zk(0x7b7)][zk(0xd69)]();
          if (mI[zk(0x1ca)] !== mM) {
            const rH = mI[zk(0xada)];
            rH
              ? ((mI[zk(0xba7)] = rH[zk(0xba7)]), n3(rH[zk(0xab7)]["id"], 0x1))
              : (mI[zk(0xba7)] = iR[zk(0xb25)]());
            (iQ[mI[zk(0xba7)]] = mI), n3(mI[zk(0xab7)]["id"], -0x1);
            const rI = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rI[zk(0xbb6)](0x0, cI[zk(0x160)]),
              rI[zk(0x945)](0x1, mI[zk(0xab7)]["id"]),
              rI[zk(0xbb6)](0x3, mI[zk(0x1ca)][zk(0x46a)]),
              il(rI);
          }
        } else
          mI[zk(0x1ca)] === mM
            ? (iR[zk(0x733)](mI[zk(0xba7)]),
              n3(mI[zk(0xab7)]["id"], 0x1),
              il(new Uint8Array([cI[zk(0xa1e)], mI[zk(0x7b1)][zk(0x46a)]])))
            : n5(mI[zk(0x7b1)][zk(0x46a)], mI[zk(0x1ca)][zk(0x46a)]);
        mI = null;
      }
    }
    function mQ(rF) {
      const zl = us;
      mI && (mI[zl(0x9e1)](rF), (mK = ![]));
    }
    var mR = document[us(0xa02)](us(0x379));
    function mS() {
      const zm = us;
      mR[zm(0xb14)][zm(0x5ad)] = zm(0xaa8);
      const rF = mR[zm(0xa02)](zm(0x825));
      let rG,
        rH,
        rI = null;
      (mR[zm(0x939)] = function (rK) {
        const zn = zm;
        rI === null &&
          ((rF[zn(0xb14)][zn(0xd8b)] = rF[zn(0xb14)][zn(0x8cb)] = "0"),
          (mR[zn(0xb14)][zn(0x5ad)] = ""),
          ([rG, rH] = mT(rK)),
          rJ(),
          (rI = rK[zn(0x413)]));
      }),
        (mR[zm(0x27e)] = function (rK) {
          const zo = zm;
          if (rK[zo(0x413)] === rI) {
            const [rL, rM] = mT(rK),
              rN = rL - rG,
              rO = rM - rH,
              rP = mR[zo(0x653)]();
            let rQ = Math[zo(0xa5e)](rN, rO);
            const rR = rP[zo(0xd8b)] / 0x2 / kR;
            rQ > rR && (rQ = rR);
            const rS = Math[zo(0x6ba)](rO, rN);
            return (
              (rF[zo(0xb14)][zo(0x8cb)] = zo(0x83b) + rS + zo(0x16f)),
              (rF[zo(0xb14)][zo(0xd8b)] = rQ + "px"),
              im(rS, rQ / rR),
              !![]
            );
          }
        }),
        (mR[zm(0x79e)] = function (rK) {
          const zp = zm;
          rK[zp(0x413)] === rI &&
            ((mR[zp(0xb14)][zp(0x5ad)] = zp(0xaa8)), (rI = null), im(0x0, 0x0));
        });
      function rJ() {
        const zq = zm;
        (mR[zq(0xb14)][zq(0x31e)] = rG + "px"),
          (mR[zq(0xb14)][zq(0xdd)] = rH + "px");
      }
    }
    mS();
    function mT(rF) {
      const zr = us;
      return [rF[zr(0xcea)] / kR, rF[zr(0xb57)] / kR];
    }
    var mU = document[us(0xa02)](us(0x570)),
      mV = document[us(0xa02)](us(0x459)),
      mW = document[us(0xa02)](us(0xcc5)),
      mX = {},
      mY = {};
    if (kL) {
      document[us(0xb87)][us(0x5a4)][us(0x2b0)](us(0x2a2)),
        (window[us(0x5e2)] = function (rG) {
          const zs = us;
          for (let rH = 0x0; rH < rG[zs(0x907)][zs(0x8c2)]; rH++) {
            const rI = rG[zs(0x907)][rH],
              rJ = rI[zs(0x37c)];
            if (rJ === ki) {
              mR[zs(0x939)](rI);
              continue;
            } else {
              if (rJ === mV)
                pn(zs(0x32c), !![]),
                  (mX[rI[zs(0x413)]] = function () {
                    const zt = zs;
                    pn(zt(0x32c), ![]);
                  });
              else {
                if (rJ === mU)
                  pn(zs(0x62c), !![]),
                    (mX[rI[zs(0x413)]] = function () {
                      const zu = zs;
                      pn(zu(0x62c), ![]);
                    });
                else
                  rJ === mW &&
                    (pn(zs(0xc3f), !![]),
                    (mX[rI[zs(0x413)]] = function () {
                      const zv = zs;
                      pn(zv(0xc3f), ![]);
                    }));
              }
            }
            if (mI) continue;
            if (rJ[zs(0xab7)]) {
              const rK = n1(rJ);
              mN(rI),
                mI && (mY[rI[zs(0x413)]] = mQ),
                (mX[rI[zs(0x413)]] = function () {
                  const zw = zs;
                  mI && mP(), (rK[zw(0xa47)] = ![]);
                });
            }
          }
        });
      const rF = {};
      (rF[us(0x532)] = ![]),
        document[us(0x8a5)](
          us(0x2db),
          function (rG) {
            const zx = us;
            for (let rH = 0x0; rH < rG[zx(0x907)][zx(0x8c2)]; rH++) {
              const rI = rG[zx(0x907)][rH];
              mR[zx(0x27e)](rI) && rG[zx(0x24a)]();
              if (mY[rI[zx(0x413)]]) mY[rI[zx(0x413)]](rI), rG[zx(0x24a)]();
              else mI && rG[zx(0x24a)]();
            }
          },
          rF
        ),
        (window[us(0x6b6)] = function (rG) {
          const zy = us;
          for (let rH = 0x0; rH < rG[zy(0x907)][zy(0x8c2)]; rH++) {
            const rI = rG[zy(0x907)][rH];
            mR[zy(0x79e)](rI),
              mX[rI[zy(0x413)]] &&
                (mX[rI[zy(0x413)]](),
                delete mX[rI[zy(0x413)]],
                delete mY[rI[zy(0x413)]]);
          }
        });
    } else {
      document[us(0xb87)][us(0x5a4)][us(0x2b0)](us(0x6d4));
      let rG = ![];
      (window[us(0x82f)] = function (rH) {
        const zz = us;
        rH[zz(0xcc9)] === 0x0 && ((rG = !![]), mN(rH));
      }),
        (document[us(0xd65)] = function (rH) {
          const zA = us;
          mQ(rH);
          const rI = rH[zA(0x37c)];
          if (rI[zA(0xab7)] && !rG) {
            const rJ = n1(rI);
            rI[zA(0x2d7)] = rI[zA(0x82f)] = function () {
              const zB = zA;
              rJ[zB(0xa47)] = ![];
            };
          }
        }),
        (document[us(0xd2c)] = function (rH) {
          const zC = us;
          rH[zC(0xcc9)] === 0x0 && ((rG = ![]), mP());
        }),
        (km[us(0xd65)] = ki[us(0xd65)] =
          function (rH) {
            const zD = us;
            (nb = rH[zD(0xcea)] - kU() / 0x2),
              (nc = rH[zD(0xb57)] - kV() / 0x2);
            if (!p8[zD(0x2e6)] && iy && !mD) {
              const rI = Math[zD(0xa5e)](nb, nc),
                rJ = Math[zD(0x6ba)](nc, nb);
              im(rJ, rI < 0x32 ? rI / 0x64 : 0x1);
            }
          });
    }
    function mZ(rH, rI, rJ) {
      const zE = us;
      return Math[zE(0xdb0)](rI, Math[zE(0xbe6)](rH, rJ));
    }
    var n0 = [];
    function n1(rH) {
      const zF = us;
      let rI = n0[zF(0xc3c)]((rJ) => rJ["el"] === rH);
      if (rI) return (rI[zF(0xa47)] = !![]), rI;
      (rI =
        typeof rH[zF(0xab7)] === zF(0x289)
          ? rH[zF(0xab7)]()
          : nH(rH[zF(0xab7)], rH[zF(0x41a)])),
        (rI[zF(0xa47)] = !![]),
        (rI[zF(0x6cc)] = 0x0),
        (rI[zF(0xb14)][zF(0xc30)] = zF(0x342)),
        (rI[zF(0xb14)][zF(0x8cb)] = zF(0xaa8)),
        kH[zF(0x75c)](rI);
      if (kL)
        (rI[zF(0xb14)][zF(0x7f8)] = zF(0x23b)),
          (rI[zF(0xb14)][zF(0xdd)] = zF(0x23b)),
          (rI[zF(0xb14)][zF(0x44b)] = zF(0x4a4)),
          (rI[zF(0xb14)][zF(0x31e)] = zF(0x4a4));
      else {
        const rJ = rH[zF(0x653)](),
          rK = rI[zF(0x653)]();
        (rI[zF(0xb14)][zF(0xdd)] =
          mZ(
            rH[zF(0x5aa)]
              ? (rJ[zF(0xdd)] + rJ[zF(0x3ca)]) / kR + 0xa
              : (rJ[zF(0xdd)] - rK[zF(0x3ca)]) / kR - 0xa,
            0xa,
            window[zF(0x9de)] / kR - 0xa
          ) + "px"),
          (rI[zF(0xb14)][zF(0x31e)] =
            mZ(
              (rJ[zF(0x31e)] + rJ[zF(0xd8b)] / 0x2 - rK[zF(0xd8b)] / 0x2) / kR,
              0xa,
              window[zF(0x434)] / kR - 0xa - rK[zF(0xd8b)] / kR
            ) + "px"),
          (rI[zF(0xb14)][zF(0x44b)] = zF(0x4a4)),
          (rI[zF(0xb14)][zF(0x7f8)] = zF(0x4a4));
      }
      return (
        (rI[zF(0xb14)][zF(0xa64)] = zF(0xaa8)),
        (rI[zF(0xb14)][zF(0x896)] = 0x0),
        (rI["el"] = rH),
        n0[zF(0x733)](rI),
        rI
      );
    }
    var n2 = document[us(0xa02)](us(0x745));
    function n3(rH, rI = 0x1) {
      const zG = us;
      !iS[rH] && ((iS[rH] = 0x0), p7(rH), o9()),
        (iS[rH] += rI),
        o7[rH][zG(0x999)](iS[rH]),
        iS[rH] <= 0x0 && (delete iS[rH], o7[rH][zG(0x1c4)](), o9()),
        n4();
    }
    function n4() {
      const zH = us;
      n2[zH(0xcc2)] = "";
      Object[zH(0x4f4)](iS)[zH(0x8c2)] === 0x0
        ? (n2[zH(0xb14)][zH(0x5ad)] = zH(0xaa8))
        : (n2[zH(0xb14)][zH(0x5ad)] = "");
      const rH = {};
      for (const rI in iS) {
        const rJ = dC[rI],
          rK = iS[rI];
        rH[rJ[zH(0x3b6)]] = (rH[rJ[zH(0x3b6)]] || 0x0) + rK;
      }
      oB(n2, rH);
      for (const rL in on) {
        const rM = on[rL];
        rM[zH(0x5a4)][rH[rL] ? zH(0xbc7) : zH(0x2b0)](zH(0xd14));
      }
    }
    function n5(rH, rI) {
      const zI = us;
      if (rH === rI) return;
      il(new Uint8Array([cI[zI(0xc83)], rH, rI]));
    }
    function n6(rH) {
      const zJ = us;
      return rH[zJ(0xd3d)] || rH[zJ(0xa02)](zJ(0x995));
    }
    function n7(rH, rI, rJ = !![]) {
      const zK = us,
        rK = mH[zK(0xc3c)]((rU) => rU === rH);
      if (rK) return rK[zK(0x370)](rI), rK;
      let rL,
        rM,
        rN,
        rO,
        rP = 0x0,
        rQ = 0x0,
        rR = 0x0,
        rS;
      (rH[zK(0x370)] = function (rU, rV) {
        const zL = zK;
        (rS = rH[zL(0x1ca)] || rH[zL(0x89c)]),
          (rS[zL(0xd3d)] = rH),
          (rH[zL(0x7b1)] = rS),
          (rH[zL(0x717)] = ![]),
          (rH[zL(0x5b8)] = ![]);
        const rW = rH[zL(0x653)]();
        rU[zL(0x62a)] === void 0x0
          ? ((rP = rU[zL(0xcea)] - rW["x"]),
            (rQ = rU[zL(0xb57)] - rW["y"]),
            rH[zL(0x9e1)](rU),
            (rL = rN),
            (rM = rO))
          : ((rL = rW["x"]),
            (rM = rW["y"]),
            rH[zL(0x352)](rU),
            rH[zL(0xd44)](rV)),
          rT();
      }),
        (rH[zK(0xd44)] = function (rU = !![]) {
          const zM = zK;
          rH[zM(0x5b8)] = !![];
          rS[zM(0xd3d)] === rH && (rS[zM(0xd3d)] = null);
          if (!rH[zM(0x1ca)])
            rH[zM(0x352)](rS),
              Math[zM(0xa5e)](rN - rL, rO - rM) > 0x32 * kR &&
                rH[zM(0x352)](mM);
          else {
            if (rU) {
              const rV = n6(rH[zM(0x1ca)]);
              (rH[zM(0xada)] = rV), rV && n7(rV, rS, ![]);
            }
          }
          rH[zM(0x1ca)] !== rS && (rH[zM(0x1c6)] = 0x0),
            (rH[zM(0x1ca)][zM(0xd3d)] = rH);
        }),
        (rH[zK(0x352)] = function (rU) {
          const zN = zK;
          rH[zN(0x1ca)] = rU;
          const rV = rU[zN(0x653)]();
          (rN = rV["x"]),
            (rO = rV["y"]),
            (rH[zN(0xb14)][zN(0x5f8)] =
              rU === mM ? zN(0x80b) : getComputedStyle(rU)[zN(0x5f8)]);
        }),
        (rH[zK(0x9e1)] = function (rU) {
          const zO = zK;
          (rN = rU[zO(0xcea)] - rP),
            (rO = rU[zO(0xb57)] - rQ),
            (rH[zO(0x1ca)] = null);
          let rV = Infinity,
            rW = null;
          const rX = ko[zO(0xbb9)](zO(0x759));
          for (let rY = 0x0; rY < rX[zO(0x8c2)]; rY++) {
            const rZ = rX[rY],
              s0 = rZ[zO(0x653)](),
              s1 = Math[zO(0xa5e)](
                s0["x"] + s0[zO(0xd8b)] / 0x2 - rU[zO(0xcea)],
                s0["y"] + s0[zO(0x3ca)] / 0x2 - rU[zO(0xb57)]
              );
            s1 < 0x1e * kR && s1 < rV && ((rW = rZ), (rV = s1));
          }
          rW && rW !== rS && rH[zO(0x352)](rW);
        }),
        rH[zK(0x370)](rI, rJ),
        rH[zK(0x5a4)][zK(0x2b0)](zK(0xc2)),
        kH[zK(0x75c)](rH);
      function rT() {
        const zP = zK;
        (rH[zP(0xb14)][zP(0x31e)] = rL / kR + "px"),
          (rH[zP(0xb14)][zP(0xdd)] = rM / kR + "px");
      }
      return (
        (rH[zK(0x9ff)] = function () {
          const zQ = zK;
          rH[zQ(0x1ca)] && rH[zQ(0x352)](rH[zQ(0x1ca)]);
        }),
        (rH[zK(0xc2f)] = function () {
          const zR = zK;
          (rL = pt(rL, rN, 0x64)), (rM = pt(rM, rO, 0x64)), rT();
          let rU = 0x0,
            rV = Infinity;
          rH[zR(0x1ca)]
            ? ((rV = Math[zR(0xa5e)](rN - rL, rO - rM)),
              (rU = rV > 0x5 ? 0x1 : 0x0))
            : (rU = 0x1),
            (rR = pt(rR, rU, 0x64)),
            (rH[zR(0xb14)][zR(0x8cb)] =
              zR(0xa0) +
              (0x1 + 0.3 * rR) +
              zR(0xcb2) +
              rR * Math[zR(0xbe5)](Date[zR(0x7c4)]() / 0x96) * 0xa +
              zR(0xd5c)),
            rH[zR(0x5b8)] &&
              rR < 0.05 &&
              rV < 0x5 &&
              (rH[zR(0x5a4)][zR(0xbc7)](zR(0xc2)),
              (rH[zR(0xb14)][zR(0x31e)] =
                rH[zR(0xb14)][zR(0xdd)] =
                rH[zR(0xb14)][zR(0x8cb)] =
                rH[zR(0xb14)][zR(0x5f8)] =
                rH[zR(0xb14)][zR(0xdc4)] =
                  ""),
              (rH[zR(0x717)] = !![]),
              rH[zR(0x1ca)][zR(0x75c)](rH),
              (rH[zR(0x1ca)][zR(0xd3d)] = null),
              (rH[zR(0x1ca)] = null));
        }),
        mH[zK(0x733)](rH),
        rH
      );
    }
    var n8 = cY[us(0xc8e)];
    document[us(0xa4f)] = function () {
      return ![];
    };
    var n9 = 0x0,
      na = 0x0,
      nb = 0x0,
      nc = 0x0,
      nd = 0x1,
      ne = 0x1;
    document[us(0x2da)] = function (rH) {
      const zS = us;
      rH[zS(0x37c)] === ki &&
        ((nd *= rH[zS(0xaca)] < 0x0 ? 1.1 : 0.9),
        (nd = Math[zS(0xbe6)](0x3, Math[zS(0xdb0)](0x1, nd))));
    };
    const nf = {};
    (nf[us(0xbc9)] = us(0x804)),
      (nf["me"] = us(0xb6e)),
      (nf[us(0x26e)] = us(0x651));
    var ng = nf,
      nh = {};
    function ni(rH, rI) {
      nj(rH, null, null, null, jx(rI));
    }
    function nj(rH, rI, rJ, rK = ng[us(0xbc9)], rL) {
      const zT = us,
        rM = nN(zT(0x86e));
      if (!rL) {
        if (rI) {
          const rO = nN(zT(0x436));
          k8(rO, rI + ":"), rM[zT(0x75c)](rO);
        }
        const rN = nN(zT(0xd6d));
        k8(rN, rJ),
          rM[zT(0x75c)](rN),
          (rM[zT(0xbaf)][0x0][zT(0xb14)][zT(0x70a)] = rK),
          rI && rM[zT(0x84d)](nN(zT(0x41b)));
      } else rM[zT(0xcc2)] = rL;
      pg[zT(0x75c)](rM);
      while (pg[zT(0xbaf)][zT(0x8c2)] > 0x3c) {
        pg[zT(0xbaf)][0x0][zT(0xbc7)]();
      }
      return (
        (pg[zT(0xdab)] = pg[zT(0x2dc)]),
        (rM[zT(0x87a)] = rJ),
        (rM[zT(0x20e)] = rK),
        nk(rH, rM),
        rM
      );
    }
    function nk(rH, rI) {
      const zU = us;
      (rI["t"] = 0x0), (rI[zU(0x60e)] = 0x0);
      if (!nh[rH]) nh[rH] = [];
      nh[rH][zU(0x733)](rI);
    }
    var nl = {};
    ki[us(0x82f)] = window[us(0xd2c)] = nt(function (rH) {
      const zV = us,
        rI = zV(0x388) + rH[zV(0xcc9)];
      pn(rI, rH[zV(0x41e)] === zV(0x95c));
    });
    var nm = 0x0;
    function nn(rH) {
      const zW = us,
        rI = 0x200,
        rJ = rI / 0x64,
        rK = document[zW(0x6be)](zW(0x9b5));
      rK[zW(0xd8b)] = rK[zW(0x3ca)] = rI;
      const rL = rK[zW(0xad8)]("2d");
      rL[zW(0xc8b)](rI / 0x2, rI / 0x2), rL[zW(0x2cb)](rJ), rH[zW(0xa2d)](rL);
      const rM = (rH[zW(0x27a)] ? zW(0xca8) : zW(0x766)) + rH[zW(0x703)];
      no(rK, rM);
    }
    function no(rH, rI) {
      const zX = us,
        rJ = document[zX(0x6be)]("a");
      (rJ[zX(0xba4)] = rI),
        (rJ[zX(0x56b)] = typeof rH === zX(0xd4a) ? rH : rH[zX(0x2e2)]()),
        rJ[zX(0x330)](),
        hK(rI + zX(0x376), hP[zX(0xde2)]);
    }
    var np = 0x0;
    setInterval(function () {
      np = 0x0;
    }, 0x1770),
      setInterval(function () {
        const zY = us;
        nu[zY(0x8c2)] = 0x0;
      }, 0x2710);
    var nq = ![],
      nr = ![];
    function ns(rH) {
      const zZ = us;
      rH = rH[zZ(0x938)]();
      if (!rH) hK(zZ(0x774)), hc(zZ(0x774));
      else
        rH[zZ(0x8c2)] < cN || rH[zZ(0x8c2)] > cM
          ? (hK(zZ(0x37e)), hc(zZ(0x37e)))
          : (hK(zZ(0xcbc) + rH + zZ(0xd23), hP[zZ(0xb33)]),
            hc(zZ(0xcbc) + rH + zZ(0xd23)),
            mv(rH));
    }
    document[us(0x31f)] = document[us(0x2ea)] = nt(function (rH) {
      const A0 = us;
      rH[A0(0xa51)] && rH[A0(0x24a)]();
      (nq = rH[A0(0xa51)]), (nr = rH[A0(0x5f5)]);
      if (rH[A0(0x811)] === 0x9) {
        rH[A0(0x24a)]();
        return;
      }
      if (document[A0(0x71e)] && document[A0(0x71e)][A0(0x62a)] === A0(0x55b)) {
        if (rH[A0(0x41e)] === A0(0xa3d) && rH[A0(0x811)] === 0xd) {
          if (document[A0(0x71e)] === hF) hG[A0(0x330)]();
          else {
            if (document[A0(0x71e)] === pf) {
              let rI = pf[A0(0x69c)][A0(0x938)]()[A0(0xba3)](0x0, cL);
              if (rI && hW) {
                if (pM - nm > 0x3e8) {
                  const rJ = rI[A0(0x439)](A0(0xd98));
                  if (rJ || rI[A0(0x439)](A0(0xa69))) {
                    const rK = rI[A0(0xba3)](rJ ? 0x7 : 0x9);
                    if (!rK) hK(A0(0x569));
                    else {
                      if (rJ) {
                        const rL = eM[rK];
                        !rL ? hK(A0(0x830) + rK + "!") : nn(rL);
                      } else {
                        const rM = dF[rK];
                        !rM ? hK(A0(0xb50) + rK + "!") : nn(rM);
                      }
                    }
                  } else {
                    if (rI[A0(0x439)](A0(0x252))) no(qu, A0(0xb43));
                    else {
                        var inputChat = rI;
                        if(inputChat.startsWith('/toggle')){
                          hack.command2Arg('toggle', inputChat);
                        }else if(inputChat.startsWith('/list')){
                          hack.addChat('List of module and configs:');
                          hack.listModule();
                        }else if(inputChat.startsWith('/help')){
                          hack.getHelp();
                        }else if(inputChat.startsWith('/server')){
                          hack.addChat('Current server: ' + hack.getServer());
                        }else if(inputChat.startsWith('/wave')){
                          hack.addChat(hack.getWave());
                        }else if(hack.notCommand(inputChat.split(' ')[0])){
                          hack.addError('Invalid command!');
                        }else
                      if (rI[A0(0x439)](A0(0x33a))) {
                        const rN = rI[A0(0xba3)](0x9);
                        ns(rN);
                      } else {
                        hack.speak = (txt) => {
                        let rO = 0x0;
                        for (let rP = 0x0; rP < nu[A0(0x8c2)]; rP++) {
                          nv(txt, nu[rP]) > 0.95 && rO++;
                        }
                        rO >= 0x3 && (np += 0xa);
                        np++;
                        if (np > 0x3) hK(A0(0x86a)), (nm = pM + 0xea60);
                        else {
                          nu[A0(0x733)](txt);
                          if (nu[A0(0x8c2)] > 0xa) nu[A0(0x913)]();
                          (txt = decodeURIComponent(
                            encodeURIComponent(txt)
                              [A0(0x9c7)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                              [A0(0x9c7)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                          )),
                            il(
                              new Uint8Array([
                                cI[A0(0xa1a)],
                                ...new TextEncoder()[A0(0x965)](rI),
                              ])
                            ),
                            (nm = pM);
                        }};
                        hack.speak(inputChat);
                      }
                    }
                  }
                } else nj(-0x1, null, A0(0x25f), ng[A0(0x26e)]);
              }
              (pf[A0(0x69c)] = ""), pf[A0(0xa34)]();
            }
          }
        }
        return;
      }
      pn(rH[A0(0x85a)], rH[A0(0x41e)] === A0(0x1bb));
    });
    function nt(rH) {
      return function (rI) {
        const A1 = b;
        rI instanceof Event && rI[A1(0xaa4)] && !rI[A1(0x513)] && rH(rI);
      };
    }
    var nu = [];
    function nv(rH, rI) {
      const A2 = us;
      var rJ = rH,
        rK = rI;
      rH[A2(0x8c2)] < rI[A2(0x8c2)] && ((rJ = rI), (rK = rH));
      var rL = rJ[A2(0x8c2)];
      if (rL == 0x0) return 0x1;
      return (rL - nw(rJ, rK)) / parseFloat(rL);
    }
    function nw(rH, rI) {
      const A3 = us;
      (rH = rH[A3(0x49d)]()), (rI = rI[A3(0x49d)]());
      var rJ = new Array();
      for (var rK = 0x0; rK <= rH[A3(0x8c2)]; rK++) {
        var rL = rK;
        for (var rM = 0x0; rM <= rI[A3(0x8c2)]; rM++) {
          if (rK == 0x0) rJ[rM] = rM;
          else {
            if (rM > 0x0) {
              var rN = rJ[rM - 0x1];
              if (rH[A3(0x8bc)](rK - 0x1) != rI[A3(0x8bc)](rM - 0x1))
                rN = Math[A3(0xbe6)](Math[A3(0xbe6)](rN, rL), rJ[rM]) + 0x1;
              (rJ[rM - 0x1] = rL), (rL = rN);
            }
          }
        }
        if (rK > 0x0) rJ[rI[A3(0x8c2)]] = rL;
      }
      return rJ[rI[A3(0x8c2)]];
    }
    var nx = document[us(0xa02)](us(0xc94)),
      ny = document[us(0xa02)](us(0xc71));
    function nz(rH, rI = 0x1) {
      const A4 = us;
      rH[A4(0x68f)](),
        rH[A4(0x9b0)](0.25 * rI, 0.25 * rI),
        rH[A4(0xc8b)](-0x4b, -0x4b),
        rH[A4(0x16b)](),
        rH[A4(0x7f4)](0x4b, 0x28),
        rH[A4(0xb18)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        rH[A4(0xb18)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        rH[A4(0xb18)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        rH[A4(0xb18)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        rH[A4(0xb18)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        rH[A4(0xb18)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (rH[A4(0x5ef)] = A4(0x4ba)),
        rH[A4(0x527)](),
        (rH[A4(0xd10)] = rH[A4(0x534)] = A4(0x2ab)),
        (rH[A4(0x555)] = A4(0x1e5)),
        (rH[A4(0x26f)] = 0xc),
        rH[A4(0x130)](),
        rH[A4(0x936)]();
    }
    for (let rH = 0x0; rH < dC[us(0x8c2)]; rH++) {
      const rI = dC[rH];
      if (rI[us(0x834)] !== void 0x0)
        switch (rI[us(0x834)]) {
          case df[us(0x654)]:
            rI[us(0xa2d)] = function (rJ) {
              const A5 = us;
              rJ[A5(0x9b0)](2.5, 2.5), lO(rJ);
            };
            break;
          case df[us(0x3ae)]:
            rI[us(0xa2d)] = function (rJ) {
              const A6 = us;
              rJ[A6(0x2cb)](0.9);
              const rK = pS();
              (rK[A6(0x284)] = !![]), rK[A6(0x74e)](rJ);
            };
            break;
          case df[us(0x92c)]:
            rI[us(0xa2d)] = function (rJ) {
              const A7 = us;
              rJ[A7(0x978)](-Math["PI"] / 0x2),
                rJ[A7(0xc8b)](-0x30, 0x0),
                pR[A7(0xbf4)](rJ, ![]);
            };
            break;
          case df[us(0x374)]:
            rI[us(0xa2d)] = function (rJ) {
              const A8 = us;
              rJ[A8(0x978)](Math["PI"] / 0xa),
                rJ[A8(0xc8b)](0x3, 0x15),
                lP(rJ, !![]);
            };
            break;
          case df[us(0x998)]:
            rI[us(0xa2d)] = function (rJ) {
              nz(rJ);
            };
            break;
          case df[us(0x4bb)]:
            rI[us(0xa2d)] = function (rJ) {
              const A9 = us;
              rJ[A9(0xc8b)](0x0, 0x3),
                rJ[A9(0x978)](-Math["PI"] / 0x4),
                rJ[A9(0x2cb)](0.4),
                pR[A9(0x196)](rJ),
                rJ[A9(0x16b)](),
                rJ[A9(0x67d)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rJ[A9(0x26f)] = 0x8),
                (rJ[A9(0x555)] = A9(0x5d5)),
                rJ[A9(0x130)]();
            };
            break;
          case df[us(0x3f0)]:
            rI[us(0xa2d)] = function (rJ) {
              const Aa = us;
              rJ[Aa(0xc8b)](0x0, 0x7),
                rJ[Aa(0x2cb)](0.8),
                pR[Aa(0x6ef)](rJ, 0.5);
            };
            break;
          case df[us(0xcc3)]:
            rI[us(0xa2d)] = function (rJ) {
              const Ab = us;
              rJ[Ab(0x2cb)](1.3), lS(rJ);
            };
            break;
          default:
            rI[us(0xa2d)] = function (rJ) {};
        }
      else {
        const rJ = new lG(
          -0x1,
          rI[us(0x41e)],
          0x0,
          0x0,
          rI[us(0x787)],
          rI[us(0x499)] ? 0x10 : rI[us(0xc60)] * 1.1,
          0x0
        );
        (rJ[us(0x2ae)] = !![]),
          rI[us(0xccd)] === 0x1
            ? (rI[us(0xa2d)] = function (rK) {
                const Ac = us;
                rJ[Ac(0x74e)](rK);
              })
            : (rI[us(0xa2d)] = function (rK) {
                const Ad = us;
                for (let rL = 0x0; rL < rI[Ad(0xccd)]; rL++) {
                  rK[Ad(0x68f)]();
                  const rM = (rL / rI[Ad(0xccd)]) * Math["PI"] * 0x2;
                  rI[Ad(0x81a)]
                    ? rK[Ad(0xc8b)](...le(rI[Ad(0x97c)], 0x0, rM))
                    : (rK[Ad(0x978)](rM), rK[Ad(0xc8b)](rI[Ad(0x97c)], 0x0)),
                    rK[Ad(0x978)](rI[Ad(0x545)]),
                    rJ[Ad(0x74e)](rK),
                    rK[Ad(0x936)]();
                }
              });
      }
    }
    const nA = {};
    (nA[us(0x27b)] = us(0x30b)),
      (nA[us(0x57a)] = us(0xba2)),
      (nA[us(0x9c)] = us(0x8bd)),
      (nA[us(0x7fa)] = us(0x416)),
      (nA[us(0xbad)] = us(0x40f)),
      (nA[us(0x4a8)] = us(0xd89)),
      (nA[us(0x870)] = us(0x96c));
    var nB = nA;
    function nC() {
      const Ae = us,
        rK = document[Ae(0xa02)](Ae(0xb00));
      let rL = Ae(0x7cf);
      for (let rM = 0x0; rM < 0xc8; rM++) {
        const rN = d6(rM),
          rO = 0xc8 * rN,
          rP = 0x19 * rN,
          rQ = d5(rM);
        rL +=
          Ae(0x580) +
          (rM + 0x1) +
          Ae(0x524) +
          k9(Math[Ae(0x2ab)](rO)) +
          Ae(0x524) +
          k9(Math[Ae(0x2ab)](rP)) +
          Ae(0x524) +
          rQ +
          Ae(0x1bf);
      }
      (rL += Ae(0x4af)), (rL += Ae(0xb55)), (rK[Ae(0xcc2)] = rL);
    }
    nC();
    function nD(rK, rL) {
      const Af = us,
        rM = eM[rK],
        rN = rM[Af(0x703)],
        rO = rM[Af(0x3b6)];
      return (
        "x" +
        rL[Af(0xccd)] * rL[Af(0xc13)] +
        ("\x20" + rN + Af(0x71d) + hQ[rO] + Af(0x63c) + hN[rO] + ")")
      );
    }
    function nE(rK) {
      const Ag = us;
      return rK[Ag(0x9da)](0x2)[Ag(0x9c7)](/\.?0+$/, "");
    }
    var nF = [
        [us(0xcf9), us(0x3c8), nB[us(0x27b)]],
        [us(0x3ab), us(0x988), nB[us(0x57a)]],
        [us(0xa33), us(0xd1b), nB[us(0x9c)]],
        [us(0x8ba), us(0x9e4), nB[us(0x7fa)]],
        [us(0xba0), us(0x66b), nB[us(0x4a8)]],
        [us(0x2f2), us(0xa1), nB[us(0xbad)]],
        [us(0x4e3), us(0xac6), nB[us(0x870)]],
        [us(0x488), us(0xcf0), nB[us(0x870)], (rK) => "+" + k9(rK)],
        [us(0x645), us(0x150), nB[us(0x870)], (rK) => "+" + k9(rK)],
        [us(0xd73), us(0x543), nB[us(0x870)]],
        [
          us(0x9d),
          us(0x820),
          nB[us(0x870)],
          (rK) => Math[us(0x2ab)](rK * 0x64) + "%",
        ],
        [us(0xc2d), us(0x688), nB[us(0x870)], (rK) => "+" + nE(rK) + us(0x334)],
        [us(0x69d), us(0x6dd), nB[us(0x9c)], (rK) => k9(rK) + "/s"],
        [us(0xda2), us(0x6dd), nB[us(0x9c)], (rK) => k9(rK) + us(0xcf3)],
        [
          us(0x5fc),
          us(0x657),
          nB[us(0x870)],
          (rK) => (rK > 0x0 ? "+" : "") + rK,
        ],
        [us(0xc31), us(0xac7), nB[us(0xbad)], (rK) => "+" + rK + "%"],
        [
          us(0xbf6),
          us(0x723),
          nB[us(0xbad)],
          (rK) => "+" + parseInt(rK * 0x64) + "%",
        ],
        [us(0x757), us(0xab8), nB[us(0x870)], (rK) => "-" + rK + "%"],
        [us(0x1f1), us(0x8c4), nB[us(0x870)], nD],
        [us(0x6cd), us(0x6ae), nB[us(0xbad)], (rK) => rK / 0x3e8 + "s"],
        [us(0x712), us(0x109), nB[us(0xbad)], (rK) => rK + "s"],
        [us(0x55a), us(0x4ee), nB[us(0xbad)], (rK) => k9(rK) + us(0xa0f)],
        [us(0x236), us(0x5c7), nB[us(0xbad)], (rK) => rK + "s"],
        [us(0xd72), us(0x780), nB[us(0xbad)], (rK) => rK / 0x3e8 + "s"],
        [us(0x90c), us(0xd77), nB[us(0xbad)]],
        [us(0x6bf), us(0x96d), nB[us(0xbad)]],
        [us(0x732), us(0x581), nB[us(0xbad)], (rK) => rK + us(0xa0e)],
        [us(0x617), us(0x3de), nB[us(0xbad)], (rK) => rK + us(0xa0e)],
        [us(0xd60), us(0x9cc), nB[us(0xbad)]],
        [us(0x46b), us(0x343), nB[us(0x870)]],
        [us(0xb93), us(0xb68), nB[us(0xbad)], (rK) => rK / 0x3e8 + "s"],
        [us(0xd16), us(0xdbc), nB[us(0x9c)], (rK) => k9(rK) + "/s"],
        [us(0xdc2), us(0x474), nB[us(0xbad)]],
        [us(0x1e0), us(0xc3a), nB[us(0x870)]],
        [
          us(0x4b1),
          us(0x9a8),
          nB[us(0xbad)],
          (rK, rL) => nE(rK * rL[us(0xc60)]),
        ],
        [us(0x253), us(0x5fe), nB[us(0xbad)]],
        [us(0x5d6), us(0xc4a), nB[us(0x870)]],
        [us(0x2ed), us(0x8fb), nB[us(0xbad)]],
        [us(0xdb1), us(0x746), nB[us(0xbad)]],
        [us(0xca4), us(0x4d0), nB[us(0xbad)]],
        [
          us(0x74f),
          us(0x812),
          nB[us(0xbad)],
          (rK) => "+" + nE(rK * 0x64) + "%",
        ],
        [us(0x7b3), us(0xc0e), nB[us(0x4a8)]],
        [us(0x470), us(0x982), nB[us(0xbad)]],
        [us(0x662), us(0x577), nB[us(0x9c)]],
        [us(0x935), us(0x109), nB[us(0xbad)], (rK) => rK + "s"],
        [us(0x559), us(0x3a7), nB[us(0xbad)]],
        [us(0x7ec), us(0xde6), nB[us(0x870)], (rK) => rK / 0x3e8 + "s"],
      ],
      nG = [
        [us(0x749), us(0xc4c), nB[us(0xbad)]],
        [us(0xbd9), us(0x700), nB[us(0x870)], (rK) => k9(rK * 0x64) + "%"],
        [us(0x9b7), us(0x6dc), nB[us(0x870)]],
        [us(0xaa7), us(0x8b2), nB[us(0xbad)]],
        [us(0x29d), us(0x20f), nB[us(0x870)]],
        [us(0xc31), us(0xac7), nB[us(0xbad)], (rK) => "+" + rK + "%"],
        [us(0xadb), us(0x2a1), nB[us(0xbad)], (rK) => k9(rK) + "/s"],
        [us(0xb4e), us(0xcbe), nB[us(0x27b)], (rK) => rK * 0x64 + us(0xd43)],
        [us(0x2c8), us(0xc46), nB[us(0xbad)], (rK) => rK + "s"],
        [
          us(0x9bd),
          us(0x317),
          nB[us(0x870)],
          (rK) => "-" + parseInt((0x1 - rK) * 0x64) + "%",
        ],
      ];
    function nH(rK, rL = !![]) {
      const Ah = us;
      let rM = "",
        rN = "",
        rO;
      rK[Ah(0x834)] === void 0x0
        ? ((rO = nF),
          rK[Ah(0x530)] &&
            (rN =
              Ah(0x76e) +
              (rK[Ah(0x530)] / 0x3e8 +
                "s" +
                (rK[Ah(0xaf1)] > 0x0
                  ? Ah(0xae0) + rK[Ah(0xaf1)] / 0x3e8 + "s"
                  : "")) +
              Ah(0x184)))
        : (rO = nG);
      for (let rQ = 0x0; rQ < rO[Ah(0x8c2)]; rQ++) {
        const [rR, rS, rT, rU] = rO[rQ],
          rV = rK[rR];
        rV &&
          rV !== 0x0 &&
          (rM +=
            Ah(0xaa9) +
            rT +
            Ah(0x8ff) +
            rS +
            Ah(0x8c8) +
            (rU ? rU(rV, rK) : k9(rV)) +
            Ah(0xa5f));
      }
      const rP = nN(
        Ah(0xa28) +
          rK[Ah(0x703)] +
          Ah(0x390) +
          hN[rK[Ah(0x3b6)]] +
          Ah(0x301) +
          hQ[rK[Ah(0x3b6)]] +
          Ah(0x7e2) +
          rN +
          Ah(0x679) +
          rK[Ah(0x477)] +
          Ah(0x7e2) +
          rM +
          Ah(0x11d)
      );
      if (rK[Ah(0x8a2)] && rL) {
        rP[Ah(0xa63)][Ah(0xb14)][Ah(0x391)] = Ah(0x23b);
        for (let rW = 0x0; rW < rK[Ah(0x8a2)][Ah(0x8c2)]; rW++) {
          const [rX, rY] = rK[Ah(0x8a2)][rW],
            rZ = nN(Ah(0xa80));
          rP[Ah(0x75c)](rZ);
          const s0 = f5[rY][rK[Ah(0x3b6)]];
          for (let s1 = 0x0; s1 < s0[Ah(0x8c2)]; s1++) {
            const [s2, s3] = s0[s1],
              s4 = eW(rX, s3),
              s5 = nN(
                Ah(0x7cb) +
                  s4[Ah(0x3b6)] +
                  "\x22\x20" +
                  qx(s4) +
                  Ah(0xc00) +
                  s2 +
                  Ah(0x37b)
              );
            rZ[Ah(0x75c)](s5);
          }
        }
      }
      return rP;
    }
    function nI() {
      const Ai = us;
      mI && (mI[Ai(0xbc7)](), (mI = null));
      const rK = ko[Ai(0xbb9)](Ai(0x995));
      for (let rL = 0x0; rL < rK[Ai(0x8c2)]; rL++) {
        const rM = rK[rL];
        rM[Ai(0xbc7)]();
      }
      for (let rN = 0x0; rN < iO; rN++) {
        const rO = nN(Ai(0xbdf));
        rO[Ai(0x46a)] = rN;
        const rP = iP[rN];
        if (rP) {
          const rQ = nN(
            Ai(0xcc7) + rP[Ai(0x3b6)] + "\x22\x20" + qx(rP) + Ai(0xb5f)
          );
          (rQ[Ai(0xab7)] = rP),
            (rQ[Ai(0x1b6)] = !![]),
            (rQ[Ai(0xba7)] = iR[Ai(0xb25)]()),
            nM(rQ, rP),
            rO[Ai(0x75c)](rQ),
            (iQ[rQ[Ai(0xba7)]] = rQ);
        }
        rN >= iN
          ? (rO[Ai(0x75c)](nN(Ai(0x529) + ((rN - iN + 0x1) % 0xa) + Ai(0x889))),
            ny[Ai(0x75c)](rO))
          : nx[Ai(0x75c)](rO);
      }
    }
    function nJ(rK) {
      const Aj = us;
      return rK < 0.5
        ? 0x4 * rK * rK * rK
        : 0x1 - Math[Aj(0x168)](-0x2 * rK + 0x2, 0x3) / 0x2;
    }
    var nK = [];
    function nL(rK, rL) {
      const Ak = us;
      (rK[Ak(0x1c6)] = 0x0), (rK[Ak(0x89e)] = 0x1);
      let rM = 0x1,
        rN = 0x0,
        rO = -0x1;
      rK[Ak(0x5a4)][Ak(0x2b0)](Ak(0xafe)), rK[Ak(0x7ea)](Ak(0xb14), "");
      const rP = nN(Ak(0x464));
      rK[Ak(0x75c)](rP), nK[Ak(0x733)](rP);
      const rQ = qp;
      rP[Ak(0xd8b)] = rP[Ak(0x3ca)] = rQ;
      const rR = rP[Ak(0xad8)]("2d");
      (rP[Ak(0x872)] = function () {
        const Al = Ak;
        rR[Al(0xc12)](0x0, 0x0, rQ, rQ);
        rN < 0.99 &&
          ((rR[Al(0x23f)] = 0x1 - rN),
          (rR[Al(0x5ef)] = Al(0x96f)),
          rR[Al(0xc72)](0x0, 0x0, rQ, (0x1 - rM) * rQ));
        if (rN < 0.01) return;
        (rR[Al(0x23f)] = rN),
          rR[Al(0x68f)](),
          rR[Al(0x2cb)](rQ / 0x64),
          rR[Al(0xc8b)](0x32, 0x2d);
        let rS = rK[Al(0x1c6)];
        rS = nJ(rS);
        const rT = Math["PI"] * 0x2 * rS;
        rR[Al(0x978)](rT * 0x4),
          rR[Al(0x16b)](),
          rR[Al(0x7f4)](0x0, 0x0),
          rR[Al(0x67d)](0x0, 0x0, 0x64, 0x0, rT),
          rR[Al(0x7f4)](0x0, 0x0),
          rR[Al(0x67d)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rR[Al(0x5ef)] = Al(0x7b6)),
          rR[Al(0x527)](Al(0x366)),
          rR[Al(0x936)]();
      }),
        (rP[Ak(0xc2f)] = function () {
          const Am = Ak;
          rK[Am(0x1c6)] += pN / (rL[Am(0x530)] + 0xc8);
          let rS = 0x1,
            rT = rK[Am(0x89e)];
          rK[Am(0x1c6)] >= 0x1 && (rS = 0x0);
          const rU = rK[Am(0x1ca)] || rK[Am(0x89c)];
          ((rU && rU[Am(0x89c)] === ny) || !iy) && ((rT = 0x1), (rS = 0x0));
          (rN = pt(rN, rS, 0x64)), (rM = pt(rM, rT, 0x64));
          const rV = Math[Am(0x2ab)]((0x1 - rM) * 0x64),
            rW = Math[Am(0x2ab)](rN * 0x64) / 0x64;
          rW == 0x0 && rV <= 0x0
            ? ((rP[Am(0x278)] = ![]), (rP[Am(0xb14)][Am(0x5ad)] = Am(0xaa8)))
            : ((rP[Am(0x278)] = !![]), (rP[Am(0xb14)][Am(0x5ad)] = "")),
            (rO = rV);
        }),
        rK[Ak(0x75c)](nN(Ak(0x294) + qx(rL) + Ak(0xb5f)));
    }
    function nM(rK, rL, rM = !![]) {
      const An = us;
      rM && rL[An(0x834)] === void 0x0 && nL(rK, rL);
    }
    function nN(rK) {
      const Ao = us;
      return (hB[Ao(0xcc2)] = rK), hB[Ao(0xbaf)][0x0];
    }
    var nO = document[us(0xa02)](us(0x606)),
      nP = [];
    function nQ() {
      const Ap = us;
      (nO[Ap(0xcc2)] = Ap(0x37d)[Ap(0x513)](eL * dH)),
        (nP = Array[Ap(0x874)](nO[Ap(0xbaf)]));
    }
    nQ();
    var nR = {};
    for (let rK = 0x0; rK < eK[us(0x8c2)]; rK++) {
      const rL = eK[rK];
      !nR[rL[us(0x41e)]] &&
        ((nR[rL[us(0x41e)]] = new lG(
          -0x1,
          rL[us(0x41e)],
          0x0,
          0x0,
          rL[us(0x2d0)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          rL[us(0x5ee)],
          0x1
        )),
        (nR[rL[us(0x41e)]][us(0x2ae)] = !![]));
      const rM = nR[rL[us(0x41e)]];
      let rN = null;
      rL[us(0x55f)] !== void 0x0 &&
        (rN = new lG(-0x1, rL[us(0x55f)], 0x0, 0x0, 0x0, rL[us(0x5ee)], 0x1)),
        (rL[us(0xa2d)] = function (rO) {
          const Aq = us;
          rO[Aq(0x9b0)](0.5, 0.5),
            rM[Aq(0x74e)](rO),
            rN &&
              (rO[Aq(0x978)](rM[Aq(0x4c3)]),
              rO[Aq(0xc8b)](-rL[Aq(0x5ee)] * 0x2, 0x0),
              rN[Aq(0x74e)](rO));
        });
    }
    function nS(rO, rP = ![]) {
      const Ar = us,
        rQ = nN(Ar(0xcc7) + rO[Ar(0x3b6)] + "\x22\x20" + qx(rO) + Ar(0xb5f));
      jY(rQ), (rQ[Ar(0xab7)] = rO);
      if (rP) return rQ;
      const rR = dH * rO[Ar(0x8b9)] + rO[Ar(0x3b6)],
        rS = nP[rR];
      return nO[Ar(0x865)](rQ, rS), rS[Ar(0xbc7)](), (nP[rR] = rQ), rQ;
    }
    var nT = document[us(0xa02)](us(0xcb4)),
      nU = document[us(0xa02)](us(0xae5)),
      nV = document[us(0xa02)](us(0xc75)),
      nW = document[us(0xa02)](us(0xa86)),
      nX = document[us(0xa02)](us(0x14e)),
      nY = nX[us(0xa02)](us(0xd67)),
      nZ = nX[us(0xa02)](us(0x5d8)),
      o0 = document[us(0xa02)](us(0x482)),
      o1 = document[us(0xa02)](us(0x3da)),
      o2 = ![],
      o3 = 0x0,
      o4 = ![];
    (nU[us(0x269)] = function () {
      (o2 = !![]), (o3 = 0x0), (o4 = ![]);
    }),
      (nW[us(0x269)] = function () {
        const As = us;
        if (this[As(0x5a4)][As(0x842)](As(0xd76)) || jy) return;
        kI(As(0x69e), (rO) => {
          rO && ((o2 = !![]), (o3 = 0x0), (o4 = !![]));
        });
      }),
      (nT[us(0xcc2)] = us(0x37d)[us(0x513)](dG * dH));
    var o5 = Array[us(0x874)](nT[us(0xbaf)]),
      o6 = document[us(0xa02)](us(0x9f1)),
      o7 = {};
    function o8() {
      const At = us;
      for (let rO in o7) {
        o7[rO][At(0x1c4)]();
      }
      o7 = {};
      for (let rP in iS) {
        p7(rP);
      }
      o9();
    }
    function o9() {
      oa(o6);
    }
    function oa(rO) {
      const Au = us,
        rP = Array[Au(0x874)](rO[Au(0xbb9)](Au(0x995)));
      rP[Au(0x242)]((rQ, rR) => {
        const Av = Au,
          rS = rR[Av(0xab7)][Av(0x3b6)] - rQ[Av(0xab7)][Av(0x3b6)];
        return rS === 0x0 ? rR[Av(0xab7)]["id"] - rQ[Av(0xab7)]["id"] : rS;
      });
      for (let rQ = 0x0; rQ < rP[Au(0x8c2)]; rQ++) {
        const rR = rP[rQ];
        rO[Au(0x75c)](rR);
      }
    }
    function ob(rO, rP) {
      const Aw = us,
        rQ = rP[Aw(0x3b6)] - rO[Aw(0x3b6)];
      return rQ === 0x0 ? rP["id"] - rO["id"] : rQ;
    }
    function oc(rO, rP = !![]) {
      const Ax = us,
        rQ = nN(Ax(0xdcd) + rO[Ax(0x3b6)] + "\x22\x20" + qx(rO) + Ax(0x107));
      setTimeout(function () {
        const Ay = Ax;
        rQ[Ay(0x5a4)][Ay(0xbc7)](Ay(0x9ed));
      }, 0x1f4),
        (rQ[Ax(0xab7)] = rO);
      if (rP) {
      }
      return (rQ[Ax(0xb51)] = rQ[Ax(0xa02)](Ax(0xc54))), rQ;
    }
    var od = nN(us(0x386)),
      oe = od[us(0xa02)](us(0x57e)),
      of = od[us(0xa02)](us(0x6c0)),
      og = od[us(0xa02)](us(0x31a)),
      oh = [];
    for (let rO = 0x0; rO < 0x5; rO++) {
      const rP = nN(us(0x37d));
      (rP[us(0xc35)] = function (rQ = 0x0) {
        const Az = us,
          rR =
            (rO / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rQ * Math["PI"] * 0x6,
          rS =
            0x32 +
            (rQ > 0x0
              ? Math[Az(0x7a8)](Math[Az(0xbe5)](rQ * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[Az(0xb14)][Az(0x31e)] = Math[Az(0xb0e)](rR) * rS + 0x32 + "%"),
          (this[Az(0xb14)][Az(0xdd)] = Math[Az(0xbe5)](rR) * rS + 0x32 + "%");
      }),
        rP[us(0xc35)](),
        (rP[us(0xccd)] = 0x0),
        (rP["el"] = null),
        (rP[us(0x370)] = function () {
          const AA = us;
          (rP[AA(0xccd)] = 0x0), (rP["el"] = null), (rP[AA(0xcc2)] = "");
        }),
        (rP[us(0x518)] = function (rQ) {
          const AB = us;
          if (!rP["el"]) {
            const rR = oc(oW, ![]);
            (rR[AB(0x269)] = function () {
              if (oY || p0) return;
              p4(null);
            }),
              rP[AB(0x75c)](rR),
              (rP["el"] = rR);
          }
          (rP[AB(0xccd)] += rQ), p2(rP["el"][AB(0xb51)], rP[AB(0xccd)]);
        }),
        oe[us(0x75c)](rP),
        oh[us(0x733)](rP);
    }
    var oi,
      oj = document[us(0xa02)](us(0x1a3)),
      ok = document[us(0xa02)](us(0x2a3)),
      ol = document[us(0xa02)](us(0x8d3)),
      om = document[us(0xa02)](us(0x73f)),
      on = {};
    function oo() {
      const AC = us,
        rQ = document[AC(0xa02)](AC(0xd7e));
      for (let rR = 0x0; rR < dH; rR++) {
        const rS = nN(AC(0xc29) + rR + AC(0x31b));
        (rS[AC(0x269)] = function () {
          const AD = AC;
          let rT = pm;
          pm = !![];
          for (const rU in o7) {
            const rV = dC[rU];
            if (rV[AD(0x3b6)] !== rR) continue;
            const rW = o7[rU];
            rW[AD(0x119)][AD(0x330)]();
          }
          pm = rT;
        }),
          (on[rR] = rS),
          rQ[AC(0x75c)](rS);
      }
    }
    oo();
    var op = ![],
      oq = document[us(0xa02)](us(0xc90));
    oq[us(0x269)] = function () {
      const AE = us;
      document[AE(0xb87)][AE(0x5a4)][AE(0xd2a)](AE(0x7be)),
        (op = document[AE(0xb87)][AE(0x5a4)][AE(0x842)](AE(0x7be)));
      const rQ = op ? AE(0xa15) : AE(0x9f8);
      k8(ok, rQ),
        k8(om, rQ),
        op
          ? (oj[AE(0x75c)](od), od[AE(0x75c)](nT), ol[AE(0xbc7)]())
          : (oj[AE(0x75c)](ol),
            ol[AE(0x865)](nT, ol[AE(0xa63)]),
            od[AE(0xbc7)]());
    };
    var or = document[us(0xa02)](us(0xce1)),
      os = ov(us(0xcf0), nB[us(0x57a)]),
      ot = ov(us(0xc57), nB[us(0x27b)]),
      ou = ov(us(0x291), nB[us(0x4a8)]);
    function ov(rQ, rR) {
      const AF = us,
        rS = nN(AF(0xce3) + rR + AF(0xa73) + rQ + AF(0x6f8));
      return (
        (rS[AF(0xb62)] = function (rT) {
          const AG = AF;
          k8(rS[AG(0xbaf)][0x1], k9(Math[AG(0x2ab)](rT)));
        }),
        or[AF(0x75c)](rS),
        rS
      );
    }
    var ow = document[us(0xa02)](us(0x74a)),
      ox = document[us(0xa02)](us(0x958));
    ox[us(0xcc2)] = "";
    var oy = document[us(0xa02)](us(0xa82)),
      oz = {};
    function oA() {
      const AH = us;
      (ox[AH(0xcc2)] = ""), (oy[AH(0xcc2)] = "");
      const rQ = {},
        rR = [];
      for (let rS in oz) {
        const rT = dC[rS],
          rU = oz[rS];
        (rQ[rT[AH(0x3b6)]] = (rQ[rT[AH(0x3b6)]] || 0x0) + rU),
          rR[AH(0x733)]([rT, rU]);
      }
      if (rR[AH(0x8c2)] === 0x0) {
        ow[AH(0xb14)][AH(0x5ad)] = AH(0xaa8);
        return;
      }
      (ow[AH(0xb14)][AH(0x5ad)] = ""),
        rR[AH(0x242)]((rV, rW) => {
          return ob(rV[0x0], rW[0x0]);
        })[AH(0xaba)](([rV, rW]) => {
          const AI = AH,
            rX = oc(rV);
          jY(rX), p2(rX[AI(0xb51)], rW), ox[AI(0x75c)](rX);
        }),
        oB(oy, rQ);
    }
    function oB(rQ, rR) {
      const AJ = us;
      let rS = 0x0;
      for (let rT in d9) {
        const rU = rR[d9[rT]];
        if (rU !== void 0x0) {
          rS++;
          const rV = nN(
            AJ(0x5df) + k9(rU) + "\x20" + rT + AJ(0x301) + hP[rT] + AJ(0x10c)
          );
          rQ[AJ(0x84d)](rV);
        }
      }
      rS % 0x2 === 0x1 &&
        (rQ[AJ(0xbaf)][0x0][AJ(0xb14)][AJ(0xd92)] = AJ(0x104));
    }
    var oC = {},
      oD = 0x0,
      oE,
      oF,
      oG,
      oH,
      oI = 0x0,
      oJ = 0x0,
      oK = 0x0,
      oL = 0x0,
      oM = 0x0;
    function oN() {
      const AK = us,
        rQ = d4(oD);
      (oE = rQ[0x0]),
        (oF = rQ[0x1]),
        (oH = d2(oE + 0x1)),
        (oG = oD - oF),
        k8(
          o1,
          !hack.isEnabled('betterXP') ? AK(0x15c) + (oE + 0x1) + AK(0x5da) + iJ(oG) + "/" + iJ(oH) + AK(0xd8c) : AK(0x15c) + (oE + 0x1) + AK(0x5da) + (oG) + "/" + (oH) + AK(0xd8c)
        );
      const rR = d6(oE);
      os[AK(0xb62)](0xc8 * rR),
        ot[AK(0xb62)](0x19 * rR),
        ou[AK(0xb62)](d5(oE)),
        hack.hp = 0xc8 * rR,
        (oJ = Math[AK(0xbe6)](0x1, oG / oH)),
        (oL = 0x0),
        (nW[AK(0xa02)](AK(0x4ea))[AK(0xcc2)] =
          oE >= cH ? AK(0xa74) : AK(0xa6b) + (cH + 0x1) + AK(0xd3b));
    }
    var oO = 0x0,
      oP = document[us(0xa02)](us(0x5e4));
    for (let rQ = 0x0; rQ < cZ[us(0x8c2)]; rQ++) {
      const [rR, rS] = cZ[rQ],
        rT = j7[rR],
        rU = nN(
          us(0x469) +
            hP[rT] +
            us(0x592) +
            rT +
            us(0x50c) +
            (rS + 0x1) +
            us(0xd84)
        );
      (rU[us(0x269)] = function () {
        const AL = us;
        if (oE >= rS) {
          const rV = oP[AL(0xa02)](AL(0x89b));
          rV && rV[AL(0x5a4)][AL(0xbc7)](AL(0x453)),
            (oO = rQ),
            (hD[AL(0x40e)] = rQ),
            this[AL(0x5a4)][AL(0x2b0)](AL(0x453));
        }
      }),
        (cZ[rQ][us(0xbfb)] = rU),
        oP[us(0x75c)](rU);
    }
    function oQ() {
      const AM = us,
        rV = parseInt(hD[AM(0x40e)]) || 0x0;
      cZ[0x0][AM(0xbfb)][AM(0x330)](),
        cZ[AM(0xaba)]((rW, rX) => {
          const AN = AM,
            rY = rW[0x1];
          if (oE >= rY) {
            rW[AN(0xbfb)][AN(0x5a4)][AN(0xbc7)](AN(0xd76));
            if (rV === rX) rW[AN(0xbfb)][AN(0x330)]();
          } else rW[AN(0xbfb)][AN(0x5a4)][AN(0x2b0)](AN(0xd76));
        });
    }
    var oR = document[us(0xa02)](us(0xc85));
    setInterval(() => {
      const AO = us;
      if (!oj[AO(0x5a4)][AO(0x842)](AO(0xd69))) return;
      oS();
    }, 0x3e8);
    function oS() {
      const AP = us;
      if (jZ) {
        let rV = 0x0;
        for (const rX in jZ) {
          rV += oT(rX, jZ[rX]);
        }
        let rW = 0x0;
        for (const rY in oC) {
          const rZ = oT(rY, oC[rY][AP(0xccd)]);
          (rW += rZ), (rV += rZ);
        }
        if (rW > 0x0) {
          const s0 = Math[AP(0xbe6)](0x19, (rW / rV) * 0x64),
            s1 = s0 > 0x1 ? s0[AP(0x9da)](0x2) : s0[AP(0x9da)](0x5);
          k8(oR, "+" + s1 + "%");
        }
      }
    }
    function oT(rV, rW) {
      const AQ = us,
        rX = dC[rV];
      if (!rX) return 0x0;
      const rY = rX[AQ(0x3b6)];
      return Math[AQ(0x168)](rY * 0xa, rY) * rW;
    }
    var oU = document[us(0xa02)](us(0xb6b));
    (oU[us(0x269)] = function () {
      const AR = us;
      for (const rV in oC) {
        const rW = oC[rV];
        rW[AR(0x1c4)]();
      }
      oV();
    }),
      oV(),
      oN();
    function oV() {
      const AS = us,
        rV = Object[AS(0x5e3)](oC);
      nV[AS(0x5a4)][AS(0xbc7)](AS(0x1c5));
      const rW = rV[AS(0x8c2)] === 0x0;
      (oU[AS(0xb14)][AS(0x5ad)] = rW ? AS(0xaa8) : ""), (oM = 0x0);
      let rX = 0x0;
      const rY = rV[AS(0x8c2)] > 0x1 ? 0x32 : 0x0;
      for (let s0 = 0x0, s1 = rV[AS(0x8c2)]; s0 < s1; s0++) {
        const s2 = rV[s0],
          s3 = (s0 / s1) * Math["PI"] * 0x2;
        s2[AS(0x2a4)](
          Math[AS(0xb0e)](s3) * rY + 0x32,
          Math[AS(0xbe5)](s3) * rY + 0x32
        ),
          (oM += d3[s2["el"][AS(0xab7)][AS(0x3b6)]] * s2[AS(0xccd)]);
      }
      nV[AS(0x5a4)][rY ? AS(0x2b0) : AS(0xbc7)](AS(0x1c5)),
        nU[AS(0x5a4)][rV[AS(0x8c2)] > 0x0 ? AS(0xbc7) : AS(0x2b0)](AS(0xd14));
      const rZ = oE >= cH;
      nW[AS(0x5a4)][rV[AS(0x8c2)] > 0x0 && rZ ? AS(0xbc7) : AS(0x2b0)](
        AS(0xd76)
      ),
        oS(),
        (nV[AS(0xb14)][AS(0x8cb)] = ""),
        (o2 = ![]),
        (o4 = ![]),
        (o3 = 0x0),
        (oI = Math[AS(0xbe6)](0x1, (oG + oM) / oH) || 0x0),
        k8(o0, oM > 0x0 ? (!hack.isEnabled('betterXP') ? "+" + iJ(oM) + AS(0xd8c) : "+" + (oM) + AS(0xd8c)) : "");
    }
    var oW,
      oX = 0x0,
      oY = ![],
      oZ = 0x0,
      p0 = null;
    function p1() {
      const AT = us;
      of[AT(0x5a4)][oX < 0x5 ? AT(0x2b0) : AT(0xbc7)](AT(0xd14));
    }
    of[us(0x269)] = function () {
      const AU = us;
      if (oY || !oW || oX < 0x5 || !ik() || p0) return;
      (oY = !![]), (oZ = 0x0), (p0 = null), of[AU(0x5a4)][AU(0x2b0)](AU(0xd14));
      const rV = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      rV[AU(0xbb6)](0x0, cI[AU(0x93e)]),
        rV[AU(0x945)](0x1, oW["id"]),
        rV[AU(0x5a9)](0x3, oX),
        il(rV);
    };
    function p2(rV, rW) {
      k8(rV, "x" + iJ(rW));
    }
    function p3(rV) {
      const AV = us;
      typeof rV === AV(0xbd0) && (rV = nE(rV)), k8(og, rV + AV(0x341));
    }
    function p4(rV) {
      const AW = us;
      oW && n3(oW["id"], oX);
      oi && oi[AW(0x330)]();
      (oW = rV), (oX = 0x0), p1();
      for (let rW = 0x0; rW < oh[AW(0x8c2)]; rW++) {
        oh[rW][AW(0x370)]();
      }
      oW
        ? (p3(dE[oW[AW(0x3b6)]] * (jy ? 0x2 : 0x1) * (he ? 0.9 : 0x1)),
          (of[AW(0xb14)][AW(0xa4c)] = hQ[oW[AW(0x3b6)] + 0x1]))
        : p3("?");
    }
    var p5 = 0x0,
      p6 = 0x1;
    function p7(rV) {
      const AX = us,
        rW = dC[rV],
        rX = oc(rW);
      (rX[AX(0x409)] = pp), jY(rX), (rX[AX(0xacb)] = !![]), o6[AX(0x75c)](rX);
      const rY = oc(rW);
      jY(rY), (rY[AX(0x409)] = oj);
      rW[AX(0x3b6)] >= dc && rY[AX(0x5a4)][AX(0x2b0)](AX(0x997));
      rY[AX(0x269)] = function () {
        const AY = AX;
        pM - p5 < 0x1f4 ? p6++ : (p6 = 0x1);
        p5 = pM;
        if (op) {
          if (oY || rW[AY(0x3b6)] >= dc) return;
          const s2 = iS[rW["id"]];
          if (!s2) return;
          oW !== rW && p4(rW);
          const s3 = oh[AY(0x8c2)];
          let s4 = pm ? s2 : Math[AY(0xbe6)](s3 * p6, s2);
          n3(rW["id"], -s4), (oX += s4), p1();
          let s5 = s4 % s3,
            s6 = (s4 - s5) / s3;
          const s7 = [...oh][AY(0x242)](
            (s9, sa) => s9[AY(0xccd)] - sa[AY(0xccd)]
          );
          s6 > 0x0 && s7[AY(0xaba)]((s9) => s9[AY(0x518)](s6));
          let s8 = 0x0;
          while (s5--) {
            const s9 = s7[s8];
            (s8 = (s8 + 0x1) % s3), s9[AY(0x518)](0x1);
          }
          return;
        }
        if (!oC[rW["id"]]) {
          const sa = oc(rW, ![]);
          k8(sa[AY(0xb51)], "x1"),
            (sa[AY(0x269)] = function (sc) {
              const AZ = AY;
              sb[AZ(0x1c4)](), oV();
            }),
            nV[AY(0x75c)](sa);
          const sb = {
            petal: rW,
            count: 0x0,
            el: sa,
            setPos(sc, sd) {
              const B0 = AY;
              (sa[B0(0xb14)][B0(0x31e)] = sc + "%"),
                (sa[B0(0xb14)][B0(0xdd)] = sd + "%"),
                (sa[B0(0xb14)][B0(0xc30)] = B0(0x8f2));
            },
            dispose(sc = !![]) {
              const B1 = AY;
              sa[B1(0xbc7)](),
                sc && n3(rW["id"], this[B1(0xccd)]),
                delete oC[rW["id"]];
            },
          };
          (oC[rW["id"]] = sb), oV();
        }
        const s1 = oC[rW["id"]];
        if (iS[rW["id"]]) {
          const sc = iS[rW["id"]],
            sd = pm ? sc : Math[AY(0xbe6)](0x1 * p6, sc);
          (s1[AY(0xccd)] += sd),
            n3(rW["id"], -sd),
            p2(s1["el"][AY(0xb51)], s1[AY(0xccd)]);
        }
        oV();
      };
      const rZ = dH * rW[AX(0x8b9)] + rW[AX(0x483)],
        s0 = o5[rZ];
      return (
        nT[AX(0x865)](rY, s0),
        s0[AX(0xbc7)](),
        (o5[rZ] = rY),
        (rX[AX(0x999)] = function (s1) {
          const B2 = AX;
          p2(rX[B2(0xb51)], s1), p2(rY[B2(0xb51)], s1);
        }),
        (rX[AX(0x119)] = rY),
        (o7[rV] = rX),
        (rX[AX(0x1c4)] = function () {
          const B3 = AX;
          rX[B3(0xbc7)](), delete o7[rV];
          const s1 = nN(B3(0x37d));
          (o5[rZ] = s1), nT[B3(0x865)](s1, rY), rY[B3(0xbc7)]();
        }),
        rX[AX(0x999)](iS[rV]),
        rX
      );
    }
    var p8 = {},
      p9 = {};
    function pa(rV, rW, rX, rY) {
      const B4 = us,
        rZ = document[B4(0xa02)](rX);
      (rZ[B4(0x1c9)] = function () {
        const B5 = B4;
        (p8[rV] = this[B5(0x88f)]),
          (hD[rV] = this[B5(0x88f)] ? "1" : "0"),
          rY && rY(this[B5(0x88f)]);
      }),
        (p9[rV] = function () {
          const B6 = B4;
          rZ[B6(0x330)]();
        }),
        (rZ[B4(0x88f)] = hD[rV] === void 0x0 ? rW : hD[rV] === "1"),
        rZ[B4(0x1c9)]();
    }
    var pb = document[us(0xa02)](us(0xb7f));
    (pb[us(0xab7)] = function () {
      const B7 = us;
      return nN(
        B7(0x798) + hP[B7(0xde2)] + B7(0x1f4) + hP[B7(0xb33)] + B7(0x339)
      );
    }),
      pa(us(0x2e6), ![], us(0xc9f), mF),
      pa(us(0xbcb), !![], us(0xd35)),
      pa(us(0x4e1), !![], us(0x8a1)),
      pa(
        us(0x97e),
        !![],
        us(0x743),
        (rV) => (kK[us(0xb14)][us(0x5ad)] = rV ? "" : us(0xaa8))
      ),
      pa(us(0x713), ![], us(0x7b8)),
      pa(us(0x417), ![], us(0x906)),
      pa(us(0x1a7), ![], us(0xc99)),
      pa(us(0xb15), !![], us(0x1aa)),
      pa(
        us(0x680),
        !![],
        us(0xbba),
        (rV) => (pb[us(0xb14)][us(0x5ad)] = rV ? "" : us(0xaa8))
      ),
      pa(us(0x136), ![], us(0xc05), kT),
      pa(us(0x53b), ![], us(0xde1), kX),
      pa(us(0x5f6), ![], us(0x9b1), (rV) => pc(ko, us(0x7f8), rV)),
      pa(us(0x9f5), !![], us(0xb1), (rV) =>
        pc(document[us(0xb87)], us(0xc58), !rV)
      ),
      pa(us(0xb9d), !![], us(0x960), (rV) =>
        pc(document[us(0xb87)], us(0x709), !rV)
      ),
      pa(us(0x19e), !![], us(0x175));
    function pc(rV, rW, rX) {
      const B8 = us;
      rV[B8(0x5a4)][rX ? B8(0x2b0) : B8(0xbc7)](rW);
    }
    function pd() {
      const B9 = us,
        rV = document[B9(0xa02)](B9(0xccf)),
        rW = [];
      for (let rY = 0x0; rY <= 0xa; rY++) {
        rW[B9(0x733)](0x1 - rY * 0.05);
      }
      for (const rZ of rW) {
        const s0 = nN(B9(0x4be) + rZ + "\x22>" + nE(rZ * 0x64) + B9(0x2a5));
        rV[B9(0x75c)](s0);
      }
      let rX = parseFloat(hD[B9(0x781)]);
      (isNaN(rX) || !rW[B9(0xd4)](rX)) && (rX = rW[0x0]),
        (rV[B9(0x69c)] = rX),
        (kP = rX),
        (rV[B9(0x1c9)] = function () {
          const Ba = B9;
          (kP = parseFloat(this[Ba(0x69c)])),
            (hD[Ba(0x781)] = this[Ba(0x69c)]),
            kX();
        });
    }
    pd();
    var pe = document[us(0xa02)](us(0x9b3)),
      pf = document[us(0xa02)](us(0x67e));
    pf[us(0xae3)] = cL;
    var pg = document[us(0xa02)](us(0xc70));
    function ph(rV) {
      const Bb = us,
        rW = nN(Bb(0x51a));
      kl[Bb(0x75c)](rW);
      const rX = rW[Bb(0xa02)](Bb(0x894));
      rX[Bb(0x69c)] = rV;
      const rY = rW[Bb(0xa02)](Bb(0xda0));
      (rY[Bb(0x1c9)] = function () {
        const Bc = Bb;
        rX[Bc(0x41e)] = this[Bc(0x88f)] ? Bc(0x87a) : Bc(0x46e);
      }),
        (rW[Bb(0xa02)](Bb(0x911))[Bb(0x269)] = function () {
          const Bd = Bb;
          jp(rV), hc(Bd(0xc8f));
        }),
        (rW[Bb(0xa02)](Bb(0xb91))[Bb(0x269)] = function () {
          const Be = Bb,
            rZ = {};
          rZ[Be(0x41e)] = Be(0x8eb);
          const s0 = new Blob([rV], rZ),
            s1 = document[Be(0x6be)]("a");
          (s1[Be(0x56b)] = URL[Be(0xb4a)](s0)),
            (s1[Be(0xba4)] = (jv ? jv : Be(0xcc8)) + Be(0x3be)),
            s1[Be(0x330)](),
            hc(Be(0xcf7));
        }),
        (rW[Bb(0xa02)](Bb(0x6ff))[Bb(0x269)] = function () {
          const Bf = Bb;
          rW[Bf(0xbc7)]();
        });
    }
    function pi() {
      const Bg = us,
        rV = nN(Bg(0x3e0));
      kl[Bg(0x75c)](rV);
      const rW = rV[Bg(0xa02)](Bg(0x894)),
        rX = rV[Bg(0xa02)](Bg(0xda0));
      (rX[Bg(0x1c9)] = function () {
        const Bh = Bg;
        rW[Bh(0x41e)] = this[Bh(0x88f)] ? Bh(0x87a) : Bh(0x46e);
      }),
        (rV[Bg(0xa02)](Bg(0x6ff))[Bg(0x269)] = function () {
          const Bi = Bg;
          rV[Bi(0xbc7)]();
        }),
        (rV[Bg(0xa02)](Bg(0x7d0))[Bg(0x269)] = function () {
          const Bj = Bg,
            rY = rW[Bj(0x69c)][Bj(0x938)]();
          if (eV(rY)) {
            delete hD[Bj(0x27c)], (hD[Bj(0x7c5)] = rY);
            if (hU)
              try {
                hU[Bj(0xcb5)]();
              } catch (rZ) {}
            hc(Bj(0x34d));
          } else hc(Bj(0x19b));
        });
    }
    (document[us(0xa02)](us(0x58f))[us(0x269)] = function () {
      const Bk = us;
      if (i5) {
        ph(i5);
        return;
        const rV = prompt(Bk(0x88d), i5);
        if (rV !== null) {
          const rW = {};
          rW[Bk(0x41e)] = Bk(0x8eb);
          const rX = new Blob([i5], rW),
            rY = document[Bk(0x6be)]("a");
          (rY[Bk(0x56b)] = URL[Bk(0xb4a)](rX)),
            (rY[Bk(0xba4)] = jv + Bk(0x292)),
            rY[Bk(0x330)](),
            alert(Bk(0xbd7));
        }
      }
    }),
      (document[us(0xa02)](us(0xafd))[us(0x269)] = function () {
        const Bl = us;
        pi();
        return;
        const rV = prompt(Bl(0x48f));
        if (rV !== null) {
          if (eV(rV)) {
            let rW = Bl(0x796);
            i6 && (rW += Bl(0x48c));
            if (confirm(rW)) {
              delete hD[Bl(0x27c)], (hD[Bl(0x7c5)] = rV);
              if (hU)
                try {
                  hU[Bl(0xcb5)]();
                } catch (rX) {}
            }
          } else alert(Bl(0x19b));
        }
      }),
      pa(us(0x1b0), ![], us(0x5ac), (rV) =>
        pf[us(0x5a4)][rV ? us(0x2b0) : us(0xbc7)](us(0x61d))
      ),
      pa(us(0xa6c), !![], us(0xde5));
    var pj = 0x0,
      pk = 0x0,
      pl = 0x0,
      pm = ![];
    function pn(rV, rW) {
      const Bm = us;
      (rV === Bm(0x3f1) || rV === Bm(0x455)) && (pm = rW);
      if (rW) {
        switch (rV) {
          case Bm(0x1ea):
            m1[Bm(0xceb)][Bm(0xd2a)]();
            break;
          case Bm(0x752):
            m1[Bm(0x718)][Bm(0xd2a)]();
            break;
          case Bm(0xd25):
            m1[Bm(0x7b7)][Bm(0xd2a)]();
            break;
          case Bm(0x198):
            pZ[Bm(0x5a4)][Bm(0xd2a)](Bm(0x453));
            break;
          case Bm(0x7c1):
            p9[Bm(0x713)](), hc(Bm(0x36c) + (p8[Bm(0x713)] ? "ON" : Bm(0x51c)));
            break;
          case Bm(0x674):
            p9[Bm(0x417)](), hc(Bm(0x895) + (p8[Bm(0x417)] ? "ON" : Bm(0x51c)));
            break;
          case Bm(0xfb):
            p9[Bm(0x97e)](), hc(Bm(0xc5d) + (p8[Bm(0x97e)] ? "ON" : Bm(0x51c)));
            break;
          case Bm(0x3ff):
            p9[Bm(0x1a7)](), hc(Bm(0x490) + (p8[Bm(0x1a7)] ? "ON" : Bm(0x51c)));
            break;
          case Bm(0xc3f):
            if (!mI && hW) {
              const rX = nx[Bm(0xbb9)](Bm(0xba6)),
                rY = ny[Bm(0xbb9)](Bm(0xba6));
              for (let rZ = 0x0; rZ < rX[Bm(0x8c2)]; rZ++) {
                const s0 = rX[rZ],
                  s1 = rY[rZ],
                  s2 = n6(s0),
                  s3 = n6(s1);
                if (s2) n7(s2, s1);
                else s3 && n7(s3, s0);
              }
              il(new Uint8Array([cI[Bm(0xc06)]]));
            }
            break;
          default:
            if (!mI && hW && rV[Bm(0x439)](Bm(0x247)))
              sb: {
                let s4 = parseInt(rV[Bm(0xba3)](0x5));
                if (nl[Bm(0xfb)]) {
                  pm ? ku(s4) : kx(s4);
                  break sb;
                }
                s4 === 0x0 && (s4 = 0xa);
                iN > 0xa && pm && (s4 += 0xa);
                s4--;
                if (s4 >= 0x0) {
                  const s5 = nx[Bm(0xbb9)](Bm(0xba6))[s4],
                    s6 = ny[Bm(0xbb9)](Bm(0xba6))[s4];
                  if (s5 && s6) {
                    const s7 = n6(s5),
                      s8 = n6(s6);
                    if (s7) n7(s7, s6);
                    else s8 && n7(s8, s5);
                  }
                }
                n5(s4, s4 + iN);
              }
        }
        nl[rV] = !![];
      } else
        rV === Bm(0x584) &&
          (kk[Bm(0xb14)][Bm(0x5ad)] === "" &&
          pf[Bm(0xb14)][Bm(0x5ad)] === Bm(0xaa8)
            ? kD[Bm(0x330)]()
            : pf[Bm(0x6b8)]()),
          delete nl[rV];
      if (iy) {
        if (p8[Bm(0x2e6)]) {
          let s9 = 0x0,
            sa = 0x0;
          if (nl[Bm(0x819)] || nl[Bm(0x445)]) sa = -0x1;
          else (nl[Bm(0xdf)] || nl[Bm(0x484)]) && (sa = 0x1);
          if (nl[Bm(0x6c6)] || nl[Bm(0xd0b)]) s9 = -0x1;
          else (nl[Bm(0xa44)] || nl[Bm(0x9ae)]) && (s9 = 0x1);
          if (s9 !== 0x0 || sa !== 0x0)
            (pj = Math[Bm(0x6ba)](sa, s9)), im(pj, 0x1);
          else (pk !== 0x0 || pl !== 0x0) && im(pj, 0x0);
          (pk = s9), (pl = sa);
        }
        po();
      }
    }
    function po() {
      const Bn = us,
        rV = nl[Bn(0x32c)] || nl[Bn(0x455)] || nl[Bn(0x3f1)],
        rW = nl[Bn(0x62c)] || nl[Bn(0x9d8)],
        rX = (rV << 0x1) | rW;
      n8 !== rX && ((n8 = rX), il(new Uint8Array([cI[Bn(0x288)], rX])));
    }
    var pp = document[us(0xa02)](us(0x747)),
      pq = 0x0,
      pr = 0x0,
      ps = 0x0;
    function pt(rV, rW, rX) {
      const Bo = us;
      return rV + (rW - rV) * Math[Bo(0xbe6)](0x1, pN / rX);
    }
    var pu = 0x1,
      pv = [];
    for (let rV in cS) {
      if (
        [us(0x5b6), us(0x753), us(0xb40), us(0x12b), us(0x87b), us(0xad7)][
          us(0xd4)
        ](rV)
      )
        continue;
      pv[us(0x733)](cS[rV]);
    }
    var pw = [];
    for (let rW = 0x0; rW < 0x1e; rW++) {
      px();
    }
    function px(rX = !![]) {
      const Bp = us,
        rY = new lG(
          -0x1,
          pv[Math[Bp(0x815)](Math[Bp(0xb7c)]() * pv[Bp(0x8c2)])],
          0x0,
          Math[Bp(0xb7c)]() * d1,
          Math[Bp(0xb7c)]() * 6.28
        );
      if (!rY[Bp(0x27a)] && Math[Bp(0xb7c)]() < 0.01) rY[Bp(0x78b)] = !![];
      rY[Bp(0x27a)]
        ? (rY[Bp(0xb3a)] = rY[Bp(0xc60)] = Math[Bp(0xb7c)]() * 0x8 + 0xc)
        : (rY[Bp(0xb3a)] = rY[Bp(0xc60)] = Math[Bp(0xb7c)]() * 0x1e + 0x19),
        rX
          ? (rY["x"] = Math[Bp(0xb7c)]() * d0)
          : (rY["x"] = -rY[Bp(0xc60)] * 0x2),
        (rY[Bp(0x767)] =
          (Math[Bp(0xb7c)]() * 0x3 + 0x4) * rY[Bp(0xb3a)] * 0.02),
        (rY[Bp(0x72c)] = (Math[Bp(0xb7c)]() * 0x2 - 0x1) * 0.05),
        pw[Bp(0x733)](rY);
    }
    var py = 0x0,
      pz = 0x0,
      pA = 0x0,
      pB = 0x0;
    setInterval(function () {
      const Bq = us,
        rX = [ki, qr, ...Object[Bq(0x5e3)](pC), ...nK],
        rY = rX[Bq(0x8c2)];
      let rZ = 0x0;
      for (let s0 = 0x0; s0 < rY; s0++) {
        const s1 = rX[s0];
        rZ += s1[Bq(0xd8b)] * s1[Bq(0x3ca)];
      }
      kK[Bq(0x7ea)](
        Bq(0x130),
        Math[Bq(0x2ab)](0x3e8 / pN) +
          Bq(0x3bf) +
          iw[Bq(0x8c2)] +
          Bq(0x31c) +
          rY +
          Bq(0x576) +
          iJ(rZ) +
          Bq(0x82b) +
          (pB / 0x3e8)[Bq(0x9da)](0x2) +
          Bq(0xa39)
      ),
        (pB = 0x0);
    }, 0x3e8);
    var pC = {};
    function pD(rX, rY, rZ, s0, s1, s2 = ![]) {
      const Br = us;
      if (!pC[rY]) {
        const s5 = hx
          ? new OffscreenCanvas(0x1, 0x1)
          : document[Br(0x6be)](Br(0x9b5));
        (s5[Br(0x8fe)] = s5[Br(0xad8)]("2d")),
          (s5[Br(0xc55)] = 0x0),
          (s5[Br(0xdc6)] = rZ),
          (s5[Br(0xd33)] = s0),
          (pC[rY] = s5);
      }
      const s3 = pC[rY],
        s4 = s3[Br(0x8fe)];
      if (pM - s3[Br(0xc55)] > 0x1f4) {
        s3[Br(0xc55)] = pM;
        const s6 = rX[Br(0xd4b)](),
          s7 = Math[Br(0xa5e)](s6["a"], s6["b"]) * 1.5,
          s8 = kW * s7,
          s9 = Math[Br(0xb0c)](s3[Br(0xdc6)] * s8) || 0x1;
        s9 !== s3["w"] &&
          ((s3["w"] = s9),
          (s3[Br(0xd8b)] = s9),
          (s3[Br(0x3ca)] = Math[Br(0xb0c)](s3[Br(0xd33)] * s8) || 0x1),
          s4[Br(0x68f)](),
          s4[Br(0x9b0)](s8, s8),
          s1(s4),
          s4[Br(0x936)]());
      }
      s3[Br(0xbc)] = !![];
      if (s2) return s3;
      rX[Br(0xdb8)](
        s3,
        -s3[Br(0xdc6)] / 0x2,
        -s3[Br(0xd33)] / 0x2,
        s3[Br(0xdc6)],
        s3[Br(0xd33)]
      );
    }
    var pE = /^((?!chrome|android).)*safari/i[us(0x73d)](navigator[us(0x7c6)]),
      pF = pE ? 0.25 : 0x0;
    function pG(rX, rY, rZ = 0x14, s0 = us(0x18c), s1 = 0x4, s2, s3 = "") {
      const Bs = us,
        s4 = Bs(0x3db) + rZ + Bs(0x8be) + iA;
      let s5, s6;
      const s7 = rY + "_" + s4 + "_" + s0 + "_" + s1 + "_" + s3,
        s8 = pC[s7];
      if (!s8) {
        rX[Bs(0x199)] = s4;
        const s9 = rX[Bs(0x3e5)](rY);
        (s5 = s9[Bs(0xd8b)] + s1), (s6 = rZ + s1);
      } else (s5 = s8[Bs(0xdc6)]), (s6 = s8[Bs(0xd33)]);
      return pD(
        rX,
        s7,
        s5,
        s6,
        function (sa) {
          const Bt = Bs;
          sa[Bt(0xc8b)](s1 / 0x2, s1 / 0x2 - s6 * pF),
            (sa[Bt(0x199)] = s4),
            (sa[Bt(0x22e)] = Bt(0xdd)),
            (sa[Bt(0x964)] = Bt(0x31e)),
            (sa[Bt(0x26f)] = s1),
            (sa[Bt(0x555)] = Bt(0x5d0)),
            (sa[Bt(0x5ef)] = s0),
            s1 > 0x0 && sa[Bt(0x1fd)](rY, 0x0, 0x0),
            sa[Bt(0x7dc)](rY, 0x0, 0x0);
        },
        s2
      );
    }
    var pH = 0x1;
    function pI(rX = cI[us(0xdba)]) {
      const Bu = us,
        rY = Object[Bu(0x5e3)](oC),
        rZ = new DataView(
          new ArrayBuffer(0x1 + 0x2 + rY[Bu(0x8c2)] * (0x2 + 0x4))
        );
      let s0 = 0x0;
      rZ[Bu(0xbb6)](s0++, rX), rZ[Bu(0x945)](s0, rY[Bu(0x8c2)]), (s0 += 0x2);
      for (let s1 = 0x0; s1 < rY[Bu(0x8c2)]; s1++) {
        const s2 = rY[s1];
        rZ[Bu(0x945)](s0, s2[Bu(0xab7)]["id"]),
          (s0 += 0x2),
          rZ[Bu(0x5a9)](s0, s2[Bu(0xccd)]),
          (s0 += 0x4);
      }
      il(rZ);
    }
    function pJ() {
      const Bv = us;
      oi[Bv(0xbc7)](), oe[Bv(0x5a4)][Bv(0xbc7)](Bv(0xaee)), (oi = null);
    }
    var pK = [];
    function pL() {
      const Bw = us;
      for (let rX = 0x0; rX < pK[Bw(0x8c2)]; rX++) {
        const rY = pK[rX],
          rZ = rY[Bw(0x4ab)],
          s0 = rZ && !rZ[Bw(0xd11)];
        s0
          ? ((rY[Bw(0xd11)] = ![]),
            (rY[Bw(0x793)] = rZ[Bw(0x793)]),
            (rY[Bw(0x12f)] = rZ[Bw(0x12f)]),
            (rY[Bw(0x23d)] = rZ[Bw(0x23d)]),
            (rY[Bw(0xab1)] = rZ[Bw(0xab1)]),
            (rY[Bw(0x6d3)] = rZ[Bw(0x6d3)]),
            (rY[Bw(0x3ab)] = rZ[Bw(0x3ab)]),
            (rY[Bw(0x7bd)] = rZ[Bw(0x7bd)]),
            (rY[Bw(0x324)] = rZ[Bw(0x324)]),
            (rY[Bw(0x557)] = rZ[Bw(0x557)]),
            (rY[Bw(0xb07)] = rZ[Bw(0xb07)]),
            (rY[Bw(0x536)] = rZ[Bw(0x536)]),
            (rY[Bw(0x29c)] = rZ[Bw(0x29c)]),
            (rY[Bw(0xca3)] = rZ[Bw(0xca3)]),
            (rY[Bw(0x4c3)] = rZ[Bw(0x4c3)]),
            (rY[Bw(0x55a)] = rZ[Bw(0x55a)]),
            j0(rY, rZ))
          : ((rY[Bw(0xd11)] = !![]),
            (rY[Bw(0x3ec)] = 0x0),
            (rY[Bw(0x12f)] = 0x1),
            (rY[Bw(0x793)] = 0x0),
            (rY[Bw(0x23d)] = ![]),
            (rY[Bw(0xab1)] = 0x0),
            (rY[Bw(0x6d3)] = 0x0),
            (rY[Bw(0x7bd)] = pt(rY[Bw(0x7bd)], 0x0, 0xc8)),
            (rY[Bw(0x3ab)] = pt(rY[Bw(0x3ab)], 0x0, 0xc8)),
            (rY[Bw(0x55a)] = pt(rY[Bw(0x55a)], 0x0, 0xc8)));
        if (rX > 0x0) {
          if (rZ) {
            const s1 = Math[Bw(0x6ba)](rZ["y"] - pr, rZ["x"] - pq);
            rY[Bw(0x3c7)] === void 0x0
              ? (rY[Bw(0x3c7)] = s1)
              : (rY[Bw(0x3c7)] = f8(rY[Bw(0x3c7)], s1, 0.1));
          }
          rY[Bw(0x1a6)] += ((s0 ? -0x1 : 0x1) * pN) / 0x320;
          if (rY[Bw(0x1a6)] < 0x0) rY[Bw(0x1a6)] = 0x0;
          rY[Bw(0x1a6)] > 0x1 && pK[Bw(0x34a)](rX, 0x1);
        }
      }
    }
    var pM = Date[us(0x7c4)](),
      pN = 0x0,
      pO = 0x0,
      pP = pM;
    function pQ() {
      const Bx = us;
      (pM = Date[Bx(0x7c4)]()),
        (pN = pM - pP),
        (pP = pM),
        (pO = pN / 0x21),
        hd();
      let rX = 0x0;
      for (let rZ = 0x0; rZ < jX[Bx(0x8c2)]; rZ++) {
        const s0 = jX[rZ];
        if (!s0[Bx(0x2a6)]) jX[Bx(0x34a)](rZ, 0x1), rZ--;
        else {
          if (
            (s0[Bx(0x409)] &&
              !s0[Bx(0x409)][Bx(0x5a4)][Bx(0x842)](Bx(0xd69))) ||
            s0[Bx(0x89c)][Bx(0xb14)][Bx(0x5ad)] === Bx(0xaa8)
          )
            continue;
          else {
            jX[Bx(0x34a)](rZ, 0x1),
              rZ--,
              s0[Bx(0x5a4)][Bx(0xbc7)](Bx(0xafe)),
              rX++;
            if (rX >= 0x14) break;
          }
        }
      }
      (pR[Bx(0x4ab)] = iy), pL();
      kC[Bx(0x5a4)][Bx(0x842)](Bx(0xd69)) && (lL = pM);
      if (hv) {
        const s1 = pM / 0x50,
          s2 = Math[Bx(0xbe5)](s1) * 0x7,
          s3 = Math[Bx(0x7a8)](Math[Bx(0xbe5)](s1 / 0x4)) * 0.15 + 0.85;
        hu[Bx(0xb14)][Bx(0x8cb)] = Bx(0x83b) + s2 + Bx(0x951) + s3 + ")";
      } else hu[Bx(0xb14)][Bx(0x8cb)] = Bx(0xaa8);
      for (let s4 = jc[Bx(0x8c2)] - 0x1; s4 >= 0x0; s4--) {
        const s5 = jc[s4];
        if (s5[Bx(0x43b)]) {
          jc[Bx(0x34a)](s4, 0x1);
          continue;
        }
        s5[Bx(0xb3d)]();
      }
      for (let s6 = nK[Bx(0x8c2)] - 0x1; s6 >= 0x0; s6--) {
        const s7 = nK[s6];
        if (!s7[Bx(0x2a6)]) {
          nK[Bx(0x34a)](s6, 0x1);
          continue;
        }
        s7[Bx(0xc2f)]();
      }
      for (let s8 = jb[Bx(0x8c2)] - 0x1; s8 >= 0x0; s8--) {
        const s9 = jb[s8];
        s9[Bx(0x43b)] &&
          s9["t"] <= 0x0 &&
          (s9[Bx(0xbc7)](), jb[Bx(0x34a)](s8, 0x1)),
          (s9["t"] += ((s9[Bx(0x43b)] ? -0x1 : 0x1) * pN) / s9[Bx(0x560)]),
          (s9["t"] = Math[Bx(0xbe6)](0x1, Math[Bx(0xdb0)](0x0, s9["t"]))),
          s9[Bx(0xc2f)]();
      }
      for (let sa = n0[Bx(0x8c2)] - 0x1; sa >= 0x0; sa--) {
        const sb = n0[sa];
        if (!sb["el"][Bx(0x2a6)]) sb[Bx(0xa47)] = ![];
        (sb[Bx(0x6cc)] += ((sb[Bx(0xa47)] ? 0x1 : -0x1) * pN) / 0xc8),
          (sb[Bx(0x6cc)] = Math[Bx(0xbe6)](
            0x1,
            Math[Bx(0xdb0)](sb[Bx(0x6cc)])
          ));
        if (!sb[Bx(0xa47)] && sb[Bx(0x6cc)] <= 0x0) {
          n0[Bx(0x34a)](sa, 0x1), sb[Bx(0xbc7)]();
          continue;
        }
        sb[Bx(0xb14)][Bx(0x896)] = sb[Bx(0x6cc)];
      }
      if (oY) {
        oZ += pN / 0x7d0;
        if (oZ > 0x1) {
          oZ = 0x0;
          if (p0) {
            oY = ![];
            const sc = oW[Bx(0x3f8)],
              sd = p0[Bx(0x7f5)];
            if (p0[Bx(0x309)] > 0x0)
              oh[Bx(0xaba)]((se) => se[Bx(0x370)]()),
                n3(oW["id"], sd),
                (oX = 0x0),
                p3("?"),
                oe[Bx(0x5a4)][Bx(0x2b0)](Bx(0xaee)),
                (oi = oc(sc)),
                oe[Bx(0x75c)](oi),
                p2(oi[Bx(0xb51)], p0[Bx(0x309)]),
                (oi[Bx(0x269)] = function () {
                  const By = Bx;
                  n3(sc["id"], p0[By(0x309)]), pJ(), (p0 = null);
                });
            else {
              oX = sd;
              const se = [...oh][Bx(0x242)](() => Math[Bx(0xb7c)]() - 0.5);
              for (let sf = 0x0, sg = se[Bx(0x8c2)]; sf < sg; sf++) {
                const sh = se[sf];
                sf >= sd ? sh[Bx(0x370)]() : sh[Bx(0x518)](0x1 - sh[Bx(0xccd)]);
              }
              p0 = null;
            }
            p1();
          }
        }
      }
      for (let si = 0x0; si < oh[Bx(0x8c2)]; si++) {
        oh[si][Bx(0xc35)](oZ);
      }
      for (let sj in nh) {
        const sk = nh[sj];
        if (!sk) {
          delete nh[sj];
          continue;
        }
        for (let sl = sk[Bx(0x8c2)] - 0x1; sl >= 0x0; sl--) {
          const sm = sk[sl];
          sm["t"] += pN;
          if (sm[Bx(0x8a7)]) sm["t"] > lX && sk[Bx(0x34a)](sl, 0x1);
          else {
            if (sm["t"] > lU) {
              const sn = 0x1 - Math[Bx(0xbe6)](0x1, (sm["t"] - lU) / 0x7d0);
              (sm[Bx(0xb14)][Bx(0x896)] = sn),
                sn <= 0x0 && sk[Bx(0x34a)](sl, 0x1);
            }
          }
        }
        sk[Bx(0x8c2)] === 0x0 && delete nh[sj];
      }
      if (o2)
        sH: {
          if (ik()) {
            (o3 += pN),
              (nV[Bx(0xb14)][Bx(0x8cb)] =
                Bx(0xa0) +
                (Math[Bx(0xbe5)](Date[Bx(0x7c4)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (o3 > 0x3e8) {
              if (o4) {
                pI(cI[Bx(0x1e1)]), m0(![]);
                break sH;
              }
              (o2 = ![]),
                (o4 = ![]),
                (o3 = 0x0),
                pI(),
                (oD += oM),
                oN(),
                oQ(),
                m0(![]);
              const so = d5(oE);
              if (so !== iN) {
                const sp = so - iN;
                for (let sr = 0x0; sr < iN; sr++) {
                  const ss = ny[Bx(0xbaf)][sr];
                  ss[Bx(0x46a)] += sp;
                }
                const sq = ny[Bx(0xa63)][Bx(0x46a)] + 0x1;
                for (let st = 0x0; st < sp; st++) {
                  const su = nN(Bx(0xbdf));
                  (su[Bx(0x46a)] = iN + st), nx[Bx(0x75c)](su);
                  const sv = nN(Bx(0xbdf));
                  (sv[Bx(0x46a)] = sq + st),
                    sv[Bx(0x75c)](
                      nN(Bx(0x529) + ((su[Bx(0x46a)] + 0x1) % 0xa) + Bx(0x889))
                    ),
                    ny[Bx(0x75c)](sv);
                }
                (iN = so), (iO = iN * 0x2);
              }
            }
          } else (o2 = ![]), (o4 = ![]), (o3 = 0x0);
        }
      (oL = pt(oL, oJ, 0x64)),
        (oK = pt(oK, oI, 0x64)),
        (nY[Bx(0xb14)][Bx(0xd8b)] = oL * 0x64 + "%"),
        (nZ[Bx(0xb14)][Bx(0xd8b)] = oK * 0x64 + "%");
      for (let sw in pC) {
        !pC[sw][Bx(0xbc)] ? delete pC[sw] : (pC[sw][Bx(0xbc)] = ![]);
      }
      (n9 = pt(n9, nb, 0x32)), (na = pt(na, nc, 0x32));
      const rY = Math[Bx(0xbe6)](0x64, pN) / 0x3c;
      pT -= 0x3 * rY;
      for (let sx = pw[Bx(0x8c2)] - 0x1; sx >= 0x0; sx--) {
        const sy = pw[sx];
        (sy["x"] += sy[Bx(0x767)] * rY),
          (sy["y"] += Math[Bx(0xbe5)](sy[Bx(0x4c3)] * 0x2) * 0.8 * rY),
          (sy[Bx(0x4c3)] += sy[Bx(0x72c)] * rY),
          (sy[Bx(0xca3)] += 0.002 * pN),
          (sy[Bx(0x549)] = !![]);
        const sz = sy[Bx(0xc60)] * 0x2;
        (sy["x"] >= d0 + sz || sy["y"] < -sz || sy["y"] >= d1 + sz) &&
          (pw[Bx(0x34a)](sx, 0x1), px(![]));
      }
      for (let sA = 0x0; sA < iG[Bx(0x8c2)]; sA++) {
        iG[sA][Bx(0xc2f)]();
      }
      ps = Math[Bx(0xdb0)](0x0, ps - pN / 0x12c);
      if (p8[Bx(0xbcb)] && ps > 0x0) {
        const sB = Math[Bx(0xb7c)]() * 0x2 * Math["PI"],
          sC = ps * 0x3;
        (qH = Math[Bx(0xb0e)](sB) * sC), (qI = Math[Bx(0xbe5)](sB) * sC);
      } else (qH = 0x0), (qI = 0x0);
      (pu = pt(pu, pH, 0xc8)), (ne = pt(ne, nd, 0x64));
      for (let sD = mH[Bx(0x8c2)] - 0x1; sD >= 0x0; sD--) {
        const sE = mH[sD];
        sE[Bx(0xc2f)](), sE[Bx(0x717)] && mH[Bx(0x34a)](sD, 0x1);
      }
      for (let sF = iw[Bx(0x8c2)] - 0x1; sF >= 0x0; sF--) {
        const sG = iw[sF];
        sG[Bx(0xc2f)](),
          sG[Bx(0xd11)] && sG[Bx(0x3ec)] > 0x1 && iw[Bx(0x34a)](sF, 0x1);
      }
      iy && ((pq = iy["x"]), (pr = iy["y"])), qF(), window[Bx(0x853)](pQ);
    }
    var pR = pS();
    function pS() {
      const Bz = us,
        rX = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[Bz(0xc8e)], 0x19);
      return (rX[Bz(0x1a6)] = 0x1), rX;
    }
    var pT = 0x0,
      pU = [us(0x3bb), us(0x4b7), us(0x275)],
      pV = [];
    for (let rX = 0x0; rX < 0x3; rX++) {
      for (let rY = 0x0; rY < 0x3; rY++) {
        const rZ = pW(pU[rX], 0x1 - 0.05 * rY);
        pV[us(0x733)](rZ);
      }
    }
    function pW(s0, s1) {
      const BA = us;
      return pX(hA(s0)[BA(0x466)]((s2) => s2 * s1));
    }
    function pX(s0) {
      const BB = us;
      return s0[BB(0xcb8)](
        (s1, s2) => s1 + parseInt(s2)[BB(0xbfe)](0x10)[BB(0x8d1)](0x2, "0"),
        "#"
      );
    }
    function pY(s0) {
      const BC = us;
      return BC(0x202) + s0[BC(0x128)](",") + ")";
    }
    var pZ = document[us(0xa02)](us(0x760));
    function q0() {
      const BD = us,
        s0 = document[BD(0x6be)](BD(0x9b5));
      s0[BD(0xd8b)] = s0[BD(0x3ca)] = 0x3;
      const s1 = s0[BD(0xad8)]("2d");
      for (let s2 = 0x0; s2 < pV[BD(0x8c2)]; s2++) {
        const s3 = s2 % 0x3,
          s4 = (s2 - s3) / 0x3;
        (s1[BD(0x5ef)] = pV[s2]), s1[BD(0xc72)](s3, s4, 0x1, 0x1);
        const s5 = j7[s2],
          s6 = j8[s2],
          s7 = nN(
            BD(0xb39) +
              s6 +
              BD(0xb4c) +
              ((s4 + 0.5) / 0x3) * 0x64 +
              BD(0x8ec) +
              ((s3 + 0.5) / 0x3) * 0x64 +
              BD(0x50a) +
              s5 +
              BD(0xd3b)
          );
        pZ[BD(0x865)](s7, pZ[BD(0xbaf)][0x0]);
      }
      pZ[BD(0xb14)][BD(0xac5)] = BD(0xc1f) + s0[BD(0x2e2)]() + ")";
    }
    q0();
    var q1 = document[us(0xa02)](us(0x864)),
      q2 = document[us(0xa02)](us(0x80a));
    function q3(s0, s1, s2) {
      const BE = us;
      (s0[BE(0xb14)][BE(0x31e)] = (s1 / j2) * 0x64 + "%"),
        (s0[BE(0xb14)][BE(0xdd)] = (s2 / j2) * 0x64 + "%");
    }
    function q4() {
      const BF = us,
        s0 = qK(),
        s1 = d0 / 0x2 / s0,
        s2 = d1 / 0x2 / s0,
        s3 = j4,
        s4 = Math[BF(0xdb0)](0x0, Math[BF(0x815)]((pq - s1) / s3) - 0x1),
        s5 = Math[BF(0xdb0)](0x0, Math[BF(0x815)]((pr - s2) / s3) - 0x1),
        s6 = Math[BF(0xbe6)](j5 - 0x1, Math[BF(0xb0c)]((pq + s1) / s3)),
        s7 = Math[BF(0xbe6)](j5 - 0x1, Math[BF(0xb0c)]((pr + s2) / s3));
      kj[BF(0x68f)](), kj[BF(0x9b0)](s3, s3), kj[BF(0x16b)]();
      for (let s8 = s4; s8 <= s6 + 0x1; s8++) {
        kj[BF(0x7f4)](s8, s5), kj[BF(0x5d2)](s8, s7 + 0x1);
      }
      for (let s9 = s5; s9 <= s7 + 0x1; s9++) {
        kj[BF(0x7f4)](s4, s9), kj[BF(0x5d2)](s6 + 0x1, s9);
      }
      kj[BF(0x936)]();
      for (let sa = s4; sa <= s6; sa++) {
        for (let sb = s5; sb <= s7; sb++) {
          kj[BF(0x68f)](),
            kj[BF(0xc8b)]((sa + 0.5) * s3, (sb + 0.5) * s3),
            pG(kj, sa + "," + sb, 0x28, BF(0x18c), 0x6),
            kj[BF(0x936)]();
        }
      }
      (kj[BF(0x555)] = BF(0x96f)),
        (kj[BF(0x26f)] = 0xa),
        (kj[BF(0x534)] = BF(0x2ab)),
        kj[BF(0x130)]();
    }
    function q5(s0, s1) {
      const BG = us,
        s2 = nN(BG(0x3c2) + s0 + BG(0x941) + s1 + BG(0x17e)),
        s3 = s2[BG(0xa02)](BG(0x885));
      return (
        km[BG(0x75c)](s2),
        (s2[BG(0xb62)] = function (s4) {
          const BH = BG;
          s4 > 0x0 && s4 !== 0x1
            ? (s3[BH(0x7ea)](BH(0xb14), BH(0x573) + s4 * 0x168 + BH(0xe5)),
              s2[BH(0x5a4)][BH(0x2b0)](BH(0xd69)))
            : s2[BH(0x5a4)][BH(0xbc7)](BH(0xd69));
        }),
        km[BG(0x865)](s2, pZ),
        s2
      );
    }
    var q6 = q5(us(0xbd8), us(0x203));
    q6[us(0x5a4)][us(0x2b0)](us(0xdd));
    var q7 = nN(us(0x30d) + hP[us(0x522)] + us(0x770));
    q6[us(0xbaf)][0x0][us(0x75c)](q7);
    var q8 = q5(us(0x350), us(0xad2)),
      q9 = q5(us(0x610), us(0x241));
    q9[us(0x5a4)][us(0x2b0)](us(0x6c8));
    var qa = us(0x4e4),
      qb = 0x2bc,
      qc = new lT("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cY[us(0xc8e)], 0x19);
    qc[us(0x793)] = 0x0;
    var qd = [
      [us(0x6d5), us(0xbfc)],
      [us(0x34b), us(0xc22)],
      [us(0xd52), us(0x739)],
      [us(0xbf8), us(0x372), us(0x2cc)],
      [us(0x2f7), us(0xc93)],
      [us(0xa10), us(0x893)],
      [us(0xd7f), us(0x425)],
    ];
    function qe() {
      const BI = us;
      let s0 = "";
      const s1 = qd[BI(0x8c2)] - 0x1;
      for (let s2 = 0x0; s2 < s1; s2++) {
        const s3 = qd[s2][0x0];
        (s0 += s3),
          s2 === s1 - 0x1
            ? (s0 += BI(0x1dd) + qd[s2 + 0x1][0x0] + ".")
            : (s0 += ",\x20");
      }
      return s0;
    }
    var qf = qe(),
      qg = document[us(0xa02)](us(0x905));
    (qg[us(0xab7)] = function () {
      const BJ = us;
      return nN(
        BJ(0xafa) +
          hP[BJ(0x547)] +
          BJ(0x9ca) +
          hP[BJ(0xb33)] +
          BJ(0x98e) +
          hP[BJ(0xde2)] +
          BJ(0x3c6) +
          qf +
          BJ(0x664)
      );
    }),
      (qg[us(0x5aa)] = !![]);
    var qh =
      Date[us(0x7c4)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[us(0x815)](Math[us(0xb7c)]() * qd[us(0x8c2)]);
    function qi() {
      const BK = us,
        s0 = qd[qh];
      (qc[BK(0x324)] = s0[0x0]), (qc[BK(0xcb)] = s0[0x1]);
      for (let s1 of iZ) {
        qc[s1] = Math[BK(0xb7c)]() > 0.5;
      }
      qh = (qh + 0x1) % qd[BK(0x8c2)];
    }
    qi(),
      (qg[us(0x269)] = function () {
        const BL = us;
        window[BL(0x57c)](qc[BL(0xcb)], BL(0xdb7)), qi();
      });
    var qj = new lT(us(0x86f), 0x0, -0x19, 0x0, 0x1, cY[us(0xc8e)], 0x19);
    (qj[us(0x793)] = 0x0), (qj[us(0xb9e)] = !![]);
    var qk = [
        us(0x7ba),
        us(0x446),
        us(0x708),
        us(0x4dc),
        us(0x3ee),
        us(0x141),
        us(0x50b),
      ],
      ql = [
        us(0x290),
        us(0xb79),
        us(0x70f),
        us(0x256),
        us(0x4fb),
        us(0x931),
        us(0x74b),
        us(0x2b4),
      ],
      qm = 0x0;
    function qn() {
      const BM = us,
        s0 = {};
      (s0[BM(0x87a)] = qk[qm % qk[BM(0x8c2)]]),
        (s0[BM(0x8a7)] = !![]),
        (s0[BM(0x20e)] = ng["me"]),
        nk(BM(0x86f), s0),
        nk("yt", {
          text: ql[qm % ql[BM(0x8c2)]][BM(0x9c7)](
            BM(0x92b),
            kE[BM(0x69c)][BM(0x938)]() || BM(0x480)
          ),
          isFakeChat: !![],
          col: ng["me"],
        }),
        qm++;
    }
    qn(), setInterval(qn, 0xfa0);
    var qo = 0x0,
      qp = Math[us(0xb0c)](
        (Math[us(0xdb0)](screen[us(0xd8b)], screen[us(0x3ca)], kU(), kV()) *
          window[us(0xd29)]) /
          0xc
      ),
      qq = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[us(0xb35)], 0x19);
    (qq[us(0xd11)] = !![]), (qq[us(0x12f)] = 0x1), (qq[us(0x9b0)] = 0.6);
    var qr = (function () {
        const BN = us,
          s0 = document[BN(0x6be)](BN(0x9b5)),
          s1 = qp * 0x2;
        (s0[BN(0xd8b)] = s0[BN(0x3ca)] = s1),
          (s0[BN(0xb14)][BN(0xd8b)] = s0[BN(0xb14)][BN(0x3ca)] = BN(0xa45));
        const s2 = document[BN(0xa02)](BN(0xd6e));
        s2[BN(0x75c)](s0);
        const s3 = s0[BN(0xad8)]("2d");
        return (
          (s0[BN(0x872)] = function () {
            const BO = BN;
            (qq[BO(0x78b)] = ![]),
              s3[BO(0xc12)](0x0, 0x0, s1, s1),
              s3[BO(0x68f)](),
              s3[BO(0x2cb)](s1 / 0x64),
              s3[BO(0xc8b)](0x32, 0x32),
              s3[BO(0x2cb)](0.8),
              s3[BO(0x978)](-Math["PI"] / 0x8),
              qq[BO(0x74e)](s3),
              s3[BO(0x936)]();
          }),
          s0
        );
      })(),
      qs,
      qt,
      qu,
      qv = ![];
    function qw() {
      const BP = us;
      if (qv) return;
      (qv = !![]), iB();
      const s0 = qA(qp);
      qu = s0[BP(0x2e2)](BP(0x681));
      const s1 = qs * 0x64 + "%\x20" + qt * 0x64 + BP(0x21e),
        s2 = nN(
          BP(0xc7d) +
            hQ[BP(0x466)](
              (s3, s4) => BP(0xbb4) + s4 + BP(0x5dd) + s3 + BP(0x9d1)
            )[BP(0x128)]("\x0a") +
            BP(0xbf) +
            nB[BP(0x57a)] +
            BP(0x2de) +
            nB[BP(0x27b)] +
            BP(0x9f2) +
            nB[BP(0x4a8)] +
            BP(0x6fb) +
            dH +
            BP(0xa20) +
            qu +
            BP(0xc65) +
            s1 +
            BP(0x962) +
            s1 +
            BP(0x254) +
            s1 +
            BP(0x306) +
            s1 +
            BP(0x224)
        );
      document[BP(0xb87)][BP(0x75c)](s2);
    }
    function qx(s0) {
      const BQ = us,
        s1 =
          -s0[BQ(0xd9d)]["x"] * 0x64 +
          "%\x20" +
          -s0[BQ(0xd9d)]["y"] * 0x64 +
          "%";
      return (
        BQ(0x7c2) +
        s1 +
        BQ(0xd46) +
        s1 +
        BQ(0xbc5) +
        s1 +
        BQ(0x25c) +
        s1 +
        ";\x22"
      );
    }
    if (document[us(0x92a)] && document[us(0x92a)][us(0xacf)]) {
      const s0 = setTimeout(qw, 0x1f40);
      document[us(0x92a)][us(0xacf)][us(0x715)](() => {
        const BR = us;
        console[BR(0xd6f)](BR(0x8c6)), clearTimeout(s0), qw();
      });
    } else qw();
    var qy = [];
    qz();
    function qz() {
      const BS = us,
        s1 = {};
      (qs = 0xf), (qy = []);
      let s2 = 0x0;
      for (let s4 = 0x0; s4 < dC[BS(0x8c2)]; s4++) {
        const s5 = dC[s4],
          s6 = BS(0x4da) + s5[BS(0x703)] + "_" + (s5[BS(0xccd)] || 0x1),
          s7 = s1[s6];
        if (s7 === void 0x0) (s5[BS(0xd9d)] = s1[s6] = s3()), qy[BS(0x733)](s5);
        else {
          s5[BS(0xd9d)] = s7;
          continue;
        }
      }
      for (let s8 = 0x0; s8 < eK[BS(0x8c2)]; s8++) {
        const s9 = eK[s8],
          sa = BS(0x985) + s9[BS(0x703)],
          sb = s1[sa];
        if (sb === void 0x0) s9[BS(0xd9d)] = s1[sa] = s3();
        else {
          s9[BS(0xd9d)] = sb;
          continue;
        }
      }
      function s3() {
        const BT = BS;
        return { x: s2 % qs, y: Math[BT(0x815)](s2 / qs), index: s2++ };
      }
    }
    function qA(s1) {
      const BU = us,
        s2 = qy[BU(0x8c2)] + eL;
      qt = Math[BU(0xb0c)](s2 / qs);
      const s3 = document[BU(0x6be)](BU(0x9b5));
      (s3[BU(0xd8b)] = s1 * qs), (s3[BU(0x3ca)] = s1 * qt);
      const s4 = s3[BU(0xad8)]("2d"),
        s5 = 0x5a,
        s6 = s5 / 0x2,
        s7 = s1 / s5;
      s4[BU(0x9b0)](s7, s7), s4[BU(0xc8b)](s6, s6);
      for (let s8 = 0x0; s8 < qy[BU(0x8c2)]; s8++) {
        const s9 = qy[s8];
        s4[BU(0x68f)](),
          s4[BU(0xc8b)](s9[BU(0xd9d)]["x"] * s5, s9[BU(0xd9d)]["y"] * s5),
          s4[BU(0x68f)](),
          s4[BU(0xc8b)](0x0 + s9[BU(0xed)], -0x5 + s9[BU(0xd15)]),
          s9[BU(0xa2d)](s4),
          s4[BU(0x936)](),
          (s4[BU(0x5ef)] = BU(0x18c)),
          (s4[BU(0x964)] = BU(0x6c8)),
          (s4[BU(0x22e)] = BU(0x44b)),
          (s4[BU(0x199)] = BU(0xad1) + iA),
          (s4[BU(0x26f)] = h5 ? 0x5 : 0x3),
          (s4[BU(0x555)] = BU(0x4ff)),
          (s4[BU(0x534)] = s4[BU(0xd10)] = BU(0x2ab)),
          s4[BU(0xc8b)](0x0, s6 - 0x8 - s4[BU(0x26f)]);
        let sa = s9[BU(0x703)];
        h5 && (sa = h7(sa));
        const sb = s4[BU(0x3e5)](sa)[BU(0xd8b)] + s4[BU(0x26f)],
          sc = Math[BU(0xbe6)](0x4c / sb, 0x1);
        s4[BU(0x9b0)](sc, sc),
          s4[BU(0x1fd)](sa, 0x0, 0x0),
          s4[BU(0x7dc)](sa, 0x0, 0x0),
          s4[BU(0x936)]();
      }
      for (let sd = 0x0; sd < eL; sd++) {
        const se = eK[sd];
        s4[BU(0x68f)](),
          s4[BU(0xc8b)](se[BU(0xd9d)]["x"] * s5, se[BU(0xd9d)]["y"] * s5),
          se[BU(0x55f)] !== void 0x0 &&
            (s4[BU(0x16b)](), s4[BU(0x66c)](-s6, -s6, s5, s5), s4[BU(0xc88)]()),
          s4[BU(0xc8b)](se[BU(0xed)], se[BU(0xd15)]),
          se[BU(0xa2d)](s4),
          s4[BU(0x936)]();
      }
      return s3;
    }
    var qB = new lG(-0x1, cS[us(0xb76)], 0x0, 0x0, Math[us(0xb7c)]() * 6.28);
    qB[us(0xc60)] = 0x32;
    function qC() {
      const BV = us;
      kj[BV(0x67d)](j2 / 0x2, j2 / 0x2, j2 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qD(s1) {
      const BW = us,
        s2 = s1[BW(0x8c2)],
        s3 = document[BW(0x6be)](BW(0x9b5));
      s3[BW(0xd8b)] = s3[BW(0x3ca)] = s2;
      const s4 = s3[BW(0xad8)]("2d"),
        s5 = s4[BW(0xd5)](s2, s2);
      for (let s6 = 0x0; s6 < s2; s6++) {
        for (let s7 = 0x0; s7 < s2; s7++) {
          const s8 = s1[s6][s7];
          if (!s8) continue;
          const s9 = (s6 * s2 + s7) * 0x4;
          s5[BW(0xa57)][s9 + 0x3] = 0xff;
        }
      }
      return s4[BW(0x571)](s5, 0x0, 0x0), s3;
    }
    function qE() {
      const BX = us;
      if (!jK) return;
      kj[BX(0x68f)](),
        kj[BX(0x16b)](),
        qC(),
        kj[BX(0xc88)](),
        !jK[BX(0x9b5)] && (jK[BX(0x9b5)] = qD(jK)),
        (kj[BX(0xa5d)] = ![]),
        (kj[BX(0x23f)] = 0.08),
        kj[BX(0xdb8)](jK[BX(0x9b5)], 0x0, 0x0, j2, j2),
        kj[BX(0x936)]();
    }
    function qF() {
      const BY = us;
      lM = 0x0;
      const s1 = kR * kW;
      qo = 0x0;
      for (let s7 = 0x0; s7 < nK[BY(0x8c2)]; s7++) {
        const s8 = nK[s7];
        s8[BY(0x278)] && s8[BY(0x872)]();
      }
      if (
        kk[BY(0xb14)][BY(0x5ad)] === "" ||
        document[BY(0xb87)][BY(0x5a4)][BY(0x842)](BY(0xef))
      ) {
        (kj[BY(0x5ef)] = BY(0x3bb)),
          kj[BY(0xc72)](0x0, 0x0, ki[BY(0xd8b)], ki[BY(0x3ca)]),
          kj[BY(0x68f)]();
        let s9 = Math[BY(0xdb0)](ki[BY(0xd8b)] / d0, ki[BY(0x3ca)] / d1);
        kj[BY(0x9b0)](s9, s9),
          kj[BY(0x66c)](0x0, 0x0, d0, d1),
          kj[BY(0x68f)](),
          kj[BY(0xc8b)](pT, -pT),
          kj[BY(0x9b0)](1.25, 1.25),
          (kj[BY(0x5ef)] = kY),
          kj[BY(0x527)](),
          kj[BY(0x936)]();
        for (let sa = 0x0; sa < pw[BY(0x8c2)]; sa++) {
          pw[sa][BY(0x74e)](kj);
        }
        kj[BY(0x936)]();
        if (p8[BY(0x680)] && pb[BY(0x3ac)] > 0x0) {
          const sb = pb[BY(0x653)]();
          kj[BY(0x68f)]();
          let sc = kW;
          kj[BY(0x9b0)](sc, sc),
            kj[BY(0xc8b)](
              sb["x"] + sb[BY(0xd8b)] / 0x2,
              sb["y"] + sb[BY(0x3ca)]
            ),
            kj[BY(0x2cb)](kR * 0.8),
            qj[BY(0x74e)](kj),
            kj[BY(0x9b0)](0.7, 0.7),
            qj[BY(0x6f6)](kj),
            kj[BY(0x936)]();
        }
        if (qg[BY(0x3ac)] > 0x0) {
          const sd = qg[BY(0x653)]();
          kj[BY(0x68f)]();
          let se = kW;
          kj[BY(0x9b0)](se, se),
            kj[BY(0xc8b)](
              sd["x"] + sd[BY(0xd8b)] / 0x2,
              sd["y"] + sd[BY(0x3ca)] * 0.6
            ),
            kj[BY(0x2cb)](kR * 0.8),
            qc[BY(0x74e)](kj),
            kj[BY(0x2cb)](0.7),
            kj[BY(0x68f)](),
            kj[BY(0xc8b)](0x0, -qc[BY(0xc60)] - 0x23),
            pG(kj, qc[BY(0x324)], 0x12, BY(0x18c), 0x3),
            kj[BY(0x936)](),
            qc[BY(0x6f6)](kj),
            kj[BY(0x936)]();
        }
        if (hm[BY(0x3ac)] > 0x0) {
          const sf = hm[BY(0x653)]();
          kj[BY(0x68f)]();
          let sg = kW;
          kj[BY(0x9b0)](sg, sg),
            kj[BY(0xc8b)](
              sf["x"] + sf[BY(0xd8b)] / 0x2,
              sf["y"] + sf[BY(0x3ca)] * 0.5
            ),
            kj[BY(0x2cb)](kR),
            qB[BY(0x74e)](kj),
            kj[BY(0x936)]();
        }
        return;
      }
      if (jy)
        (kj[BY(0x5ef)] = pV[0x0]),
          kj[BY(0xc72)](0x0, 0x0, ki[BY(0xd8b)], ki[BY(0x3ca)]);
      else {
        kj[BY(0x68f)](), qJ();
        for (let sh = -0x1; sh < 0x4; sh++) {
          for (let si = -0x1; si < 0x4; si++) {
            const sj = Math[BY(0xdb0)](0x0, Math[BY(0xbe6)](si, 0x2)),
              sk = Math[BY(0xdb0)](0x0, Math[BY(0xbe6)](sh, 0x2));
            (kj[BY(0x5ef)] = pV[sk * 0x3 + sj]),
              kj[BY(0xc72)](si * j3, sh * j3, j3, j3);
          }
        }
        kj[BY(0x16b)](),
          kj[BY(0x66c)](0x0, 0x0, j2, j2),
          kj[BY(0xc88)](),
          kj[BY(0x16b)](),
          kj[BY(0x7f4)](-0xa, j3),
          kj[BY(0x5d2)](j3 * 0x2, j3),
          kj[BY(0x7f4)](j3 * 0x2, j3 * 0.5),
          kj[BY(0x5d2)](j3 * 0x2, j3 * 1.5),
          kj[BY(0x7f4)](j3 * 0x1, j3 * 0x2),
          kj[BY(0x5d2)](j2 + 0xa, j3 * 0x2),
          kj[BY(0x7f4)](j3, j3 * 1.5),
          kj[BY(0x5d2)](j3, j3 * 2.5),
          (kj[BY(0x26f)] = qb * 0x2),
          (kj[BY(0x534)] = BY(0x2ab)),
          (kj[BY(0x555)] = qa),
          kj[BY(0x130)](),
          kj[BY(0x936)]();
      }
      kj[BY(0x68f)](),
        kj[BY(0x16b)](),
        kj[BY(0x66c)](0x0, 0x0, ki[BY(0xd8b)], ki[BY(0x3ca)]),
        qJ();
      p8[BY(0x19e)] && ((kj[BY(0x5ef)] = kY), kj[BY(0x527)]());
      kj[BY(0x16b)]();
      jy ? qC() : kj[BY(0x66c)](0x0, 0x0, j2, j2);
      kj[BY(0x936)](),
        kj[BY(0x66c)](0x0, 0x0, ki[BY(0xd8b)], ki[BY(0x3ca)]),
        (kj[BY(0x5ef)] = qa),
        kj[BY(0x527)](BY(0x366)),
        kj[BY(0x68f)](),
        qJ();
      p8[BY(0x417)] && q4();
      qE();
      const s3 = [];
      let s4 = [];
      for (let sl = 0x0; sl < iw[BY(0x8c2)]; sl++) {
        const sm = iw[sl];
        if (sm[BY(0x359)]) {
          if (iy) {
            if (
              pM - sm[BY(0x380)] < 0x3e8 ||
              Math[BY(0xa5e)](sm["nx"] - iy["x"], sm["ny"] - iy["y"]) <
                Math[BY(0xa5e)](sm["ox"] - iy["x"], sm["oy"] - iy["y"])
            ) {
              s3[BY(0x733)](sm), (sm[BY(0x380)] = pM);
              continue;
            }
          }
        }
        sm !== iy && s4[BY(0x733)](sm);
      }
      (s4 = qG(s4, (sn) => sn[BY(0x41e)] === cS[BY(0x87b)])),
        (s4 = qG(s4, (sn) => sn[BY(0x41e)] === cS[BY(0x12b)])),
        (s4 = qG(s4, (sn) => sn[BY(0x41e)] === cS[BY(0xad7)])),
        (s4 = qG(s4, (sn) => sn[BY(0xc9b)])),
        (s4 = qG(s4, (sn) => sn[BY(0x52a)])),
        (s4 = qG(s4, (sn) => sn[BY(0x27a)] && !sn[BY(0xcee)])),
        (s4 = qG(s4, (sn) => !sn[BY(0xcee)])),
        qG(s4, (sn) => !![]);
      iy && iy[BY(0x74e)](kj);
      for (let sn = 0x0; sn < s3[BY(0x8c2)]; sn++) {
        s3[sn][BY(0x74e)](kj);
      }
      if (p8[BY(0x713)]) {
        kj[BY(0x16b)]();
        for (let so = 0x0; so < iw[BY(0x8c2)]; so++) {
          const sp = iw[so];
          if (sp[BY(0xd11)]) continue;
          if (sp[BY(0x39c)]) {
            kj[BY(0x68f)](),
              kj[BY(0xc8b)](sp["x"], sp["y"]),
              kj[BY(0x978)](sp[BY(0x4c3)]);
            if (!sp[BY(0x17b)])
              kj[BY(0x66c)](-sp[BY(0xc60)], -0xa, sp[BY(0xc60)] * 0x2, 0x14);
            else {
              kj[BY(0x7f4)](-sp[BY(0xc60)], -0xa),
                kj[BY(0x5d2)](-sp[BY(0xc60)], 0xa);
              const sq = 0xa + sp[BY(0x17b)] * sp[BY(0xc60)] * 0x2;
              kj[BY(0x5d2)](sp[BY(0xc60)], sq),
                kj[BY(0x5d2)](sp[BY(0xc60)], -sq),
                kj[BY(0x5d2)](-sp[BY(0xc60)], -0xa);
            }
            kj[BY(0x936)]();
          } else
            kj[BY(0x7f4)](sp["x"] + sp[BY(0xc60)], sp["y"]),
              kj[BY(0x67d)](sp["x"], sp["y"], sp[BY(0xc60)], 0x0, l0);
        }
        (kj[BY(0x26f)] = 0x2), (kj[BY(0x555)] = BY(0x4a8)), kj[BY(0x130)]();
      }
      const s5 = p8[BY(0x1a7)] ? 0x1 / qL() : 0x1;
      for (let sr = 0x0; sr < iw[BY(0x8c2)]; sr++) {
        const ss = iw[sr];
        !ss[BY(0x27a)] && ss[BY(0x549)] && lY(ss, kj, s5);
      }
      for (let st = 0x0; st < iw[BY(0x8c2)]; st++) {
        const su = iw[st];
        su[BY(0x6b9)] && su[BY(0x6f6)](kj, s5);
      }
      const s6 = pN / 0x12;
      kj[BY(0x68f)](),
        (kj[BY(0x26f)] = 0x7),
        (kj[BY(0x555)] = BY(0x18c)),
        (kj[BY(0x534)] = kj[BY(0xd10)] = BY(0xcd9));
      for (let sv = iF[BY(0x8c2)] - 0x1; sv >= 0x0; sv--) {
        const sw = iF[sv];
        sw["a"] -= pN / 0x1f4;
        if (sw["a"] <= 0x0) {
          iF[BY(0x34a)](sv, 0x1);
          continue;
        }
        (kj[BY(0x23f)] = sw["a"]), kj[BY(0x130)](sw[BY(0x70c)]);
      }
      kj[BY(0x936)]();
      if (p8[BY(0x4e1)])
        for (let sx = iz[BY(0x8c2)] - 0x1; sx >= 0x0; sx--) {
          const sy = iz[sx];
          (sy["x"] += sy["vx"] * s6),
            (sy["y"] += sy["vy"] * s6),
            (sy["vy"] += 0.35 * s6);
          if (sy["vy"] > 0xa) {
            iz[BY(0x34a)](sx, 0x1);
            continue;
          }
          kj[BY(0x68f)](),
            kj[BY(0xc8b)](sy["x"], sy["y"]),
            (kj[BY(0x23f)] = 0x1 - Math[BY(0xdb0)](0x0, sy["vy"] / 0xa)),
            kj[BY(0x9b0)](sy[BY(0xc60)], sy[BY(0xc60)]),
            sy[BY(0x87a)] !== void 0x0
              ? pG(kj, sy[BY(0x87a)], 0x15, BY(0x259), 0x2, ![], sy[BY(0xc60)])
              : (kj[BY(0x978)](sy[BY(0x4c3)]),
                pD(kj, BY(0xb58) + sy[BY(0xc60)], 0x1e, 0x1e, function (sz) {
                  const BZ = BY;
                  sz[BZ(0xc8b)](0xf, 0xf), nz(sz);
                })),
            kj[BY(0x936)]();
        }
      kj[BY(0x936)]();
      if (iy && p8[BY(0xb15)] && !p8[BY(0x2e6)]) {
        kj[BY(0x68f)](),
          kj[BY(0xc8b)](ki[BY(0xd8b)] / 0x2, ki[BY(0x3ca)] / 0x2),
          kj[BY(0x978)](Math[BY(0x6ba)](na, n9)),
          kj[BY(0x9b0)](s1, s1);
        const sz = 0x28;
        let sA = Math[BY(0xa5e)](n9, na) / kR;
        kj[BY(0x16b)](),
          kj[BY(0x7f4)](sz, 0x0),
          kj[BY(0x5d2)](sA, 0x0),
          kj[BY(0x5d2)](sA + -0x14, -0x14),
          kj[BY(0x7f4)](sA, 0x0),
          kj[BY(0x5d2)](sA + -0x14, 0x14),
          (kj[BY(0x26f)] = 0xc),
          (kj[BY(0x534)] = BY(0x2ab)),
          (kj[BY(0xd10)] = BY(0x2ab)),
          (kj[BY(0x23f)] =
            sA < 0x64 ? Math[BY(0xdb0)](sA - 0x32, 0x0) / 0x32 : 0x1),
          (kj[BY(0x555)] = BY(0x96f)),
          kj[BY(0x130)](),
          kj[BY(0x936)]();
      }
      kj[BY(0x68f)](),
        kj[BY(0x9b0)](s1, s1),
        kj[BY(0xc8b)](0x28, 0x1e + 0x32),
        kj[BY(0x2cb)](0.85);
      for (let sB = 0x0; sB < pK[BY(0x8c2)]; sB++) {
        const sC = pK[sB];
        if (sB > 0x0) {
          const sD = lI(Math[BY(0xdb0)](sC[BY(0x1a6)] - 0.5, 0x0) / 0.5);
          kj[BY(0xc8b)](0x0, (sB === 0x0 ? 0x46 : 0x41) * (0x1 - sD));
        }
        kj[BY(0x68f)](),
          sB > 0x0 &&
            (kj[BY(0xc8b)](lI(sC[BY(0x1a6)]) * -0x190, 0x0),
            kj[BY(0x2cb)](0.85)),
          kj[BY(0x68f)](),
          lZ(sC, kj, !![]),
          (sC["id"] = (sC[BY(0x4ab)] && sC[BY(0x4ab)]["id"]) || -0x1),
          sC[BY(0x74e)](kj),
          (sC["id"] = -0x1),
          kj[BY(0x936)](),
          sC[BY(0x3c7)] !== void 0x0 &&
            (kj[BY(0x68f)](),
            kj[BY(0x978)](sC[BY(0x3c7)]),
            kj[BY(0xc8b)](0x20, 0x0),
            kj[BY(0x16b)](),
            kj[BY(0x7f4)](0x0, 0x6),
            kj[BY(0x5d2)](0x0, -0x6),
            kj[BY(0x5d2)](0x6, 0x0),
            kj[BY(0xa2a)](),
            (kj[BY(0x26f)] = 0x4),
            (kj[BY(0x534)] = kj[BY(0xd10)] = BY(0x2ab)),
            (kj[BY(0x555)] = BY(0x5d5)),
            kj[BY(0x130)](),
            (kj[BY(0x5ef)] = BY(0x18c)),
            kj[BY(0x527)](),
            kj[BY(0x936)]()),
          kj[BY(0x936)]();
      }
      kj[BY(0x936)]();
    }
    function qG(s1, s2) {
      const C0 = us,
        s3 = [];
      for (let s4 = 0x0; s4 < s1[C0(0x8c2)]; s4++) {
        const s5 = s1[s4];
        if (s2[C0(0xcda)] !== void 0x0 ? s2(s5) : s5[s2]) s5[C0(0x74e)](kj);
        else s3[C0(0x733)](s5);
      }
      return s3;
    }
    var qH = 0x0,
      qI = 0x0;
    function qJ() {
      const C1 = us;
      kj[C1(0xc8b)](ki[C1(0xd8b)] / 0x2, ki[C1(0x3ca)] / 0x2);
      let s1 = qK();
      kj[C1(0x9b0)](s1, s1),
        kj[C1(0xc8b)](-pq, -pr),
        p8[C1(0xbcb)] && kj[C1(0xc8b)](qH, qI);
    }
    function qK() {
      const C2 = us;
      return Math[C2(0xdb0)](ki[C2(0xd8b)] / d0, ki[C2(0x3ca)] / d1) * qL();
    }
    function qL() {
      return ne / pu;
    }
    kX(), pQ();
    const qM = {};
    (qM[us(0xcda)] = us(0x501)),
      (qM[us(0xcb)] = us(0x2c3)),
      (qM[us(0x70a)] = us(0x30e));
    const qN = {};
    (qN[us(0xcda)] = us(0x240)),
      (qN[us(0xcb)] = us(0x38c)),
      (qN[us(0x70a)] = us(0xc23));
    const qO = {};
    (qO[us(0xcda)] = us(0x21c)),
      (qO[us(0xcb)] = us(0x79b)),
      (qO[us(0x70a)] = us(0xbf0));
    const qP = {};
    (qP[us(0xcda)] = us(0xd56)),
      (qP[us(0xcb)] = us(0x443)),
      (qP[us(0x70a)] = us(0x60f));
    const qQ = {};
    (qQ[us(0xcda)] = us(0x9d2)),
      (qQ[us(0xcb)] = us(0x344)),
      (qQ[us(0x70a)] = us(0x3c9));
    const qR = {};
    (qR[us(0xcda)] = us(0xbab)),
      (qR[us(0xcb)] = us(0x57d)),
      (qR[us(0x70a)] = us(0x7de));
    const qS = {};
    (qS[us(0x614)] = qM),
      (qS[us(0x5ba)] = qN),
      (qS[us(0x451)] = qO),
      (qS[us(0x32d)] = qP),
      (qS[us(0xda7)] = qQ),
      (qS[us(0x2c0)] = qR);
    var qT = qS;
    if (window[us(0x8f3)][us(0x41f)] !== us(0x44f))
      for (let s1 in qT) {
        const s2 = qT[s1];
        s2[us(0xcb)] = s2[us(0xcb)]
          [us(0x9c7)](us(0x44f), us(0x287))
          [us(0x9c7)](us(0xb21), us(0xd55));
      }
    var qU = document[us(0xa02)](us(0x8b0)),
      qV = document[us(0xa02)](us(0x16c)),
      qW = 0x0;
    for (let s3 in qT) {
      const s4 = qT[s3],
        s5 = document[us(0x6be)](us(0x7e0));
      s5[us(0x58e)] = us(0xbfb);
      const s6 = document[us(0x6be)](us(0x552));
      s6[us(0x7ea)](us(0x130), s4[us(0xcda)]), s5[us(0x75c)](s6);
      const s7 = document[us(0x6be)](us(0x552));
      (s7[us(0x58e)] = us(0x373)),
        (s4[us(0xaad)] = 0x0),
        (s4[us(0xd79)] = function (s8) {
          const C3 = us;
          (qW -= s4[C3(0xaad)]),
            (s4[C3(0xaad)] = s8),
            (qW += s8),
            k8(s7, kh(s8, C3(0xd47))),
            s5[C3(0x75c)](s7);
          const s9 = C3(0xa7f) + kh(qW, C3(0xd47)) + C3(0x2a0);
          k8(qX, s9), k8(qV, s9);
        }),
        (s4[us(0x456)] = function () {
          const C4 = us;
          s4[C4(0xd79)](0x0), s7[C4(0xbc7)]();
        }),
        (s5[us(0xb14)][us(0x546)] = s4[us(0x70a)]),
        qU[us(0x75c)](s5),
        (s5[us(0x269)] = function () {
          const C5 = us,
            s8 = qU[C5(0xa02)](C5(0x89b));
          if (s8 === s5) return;
          s8 && s8[C5(0x5a4)][C5(0xbc7)](C5(0x453)),
            this[C5(0x5a4)][C5(0x2b0)](C5(0x453)),
            r0(s4[C5(0xcb)]),
            (hD[C5(0xb1d)] = s3);
        }),
        (s4["el"] = s5);
    }
    var qX = document[us(0x6be)](us(0x552));
    (qX[us(0x58e)] = us(0x97b)), qU[us(0x75c)](qX);
    if (!![]) {
      qY();
      let s8 = Date[us(0x7c4)]();
      setInterval(function () {
        pM - s8 > 0x2710 && (qY(), (s8 = pM));
      }, 0x3e8);
    }
    function qY() {
      const C6 = us;
      fetch(C6(0x9f))
        [C6(0x715)]((s9) => s9[C6(0x1e6)]())
        [C6(0x715)]((s9) => {
          const C7 = C6;
          for (let sa in s9) {
            const sb = qT[sa];
            sb && sb[C7(0xd79)](s9[sa]);
          }
        })
        [C6(0x79c)]((s9) => {
          const C8 = C6;
          console[C8(0x26e)](C8(0x721), s9);
        });
    }
    var qZ = window[us(0x48e)] || window[us(0x8f3)][us(0x591)] === us(0x375);
    if (qZ) hV(window[us(0x8f3)][us(0xf5)][us(0x9c7)](us(0xa5b), "ws"));
    else {
      const s9 = qT[hD[us(0xb1d)]];
      if (s9) s9["el"][us(0x330)]();
      else {
        let sa = "EU";
        fetch(us(0x8d0))
          [us(0x715)]((sb) => sb[us(0x1e6)]())
          [us(0x715)]((sb) => {
            const C9 = us;
            if (["NA", "SA"][C9(0xd4)](sb[C9(0xac4)])) sa = "US";
            else ["AS", "OC"][C9(0xd4)](sb[C9(0xac4)]) && (sa = "AS");
          })
          [us(0x79c)]((sb) => {
            const Ca = us;
            console[Ca(0xd6f)](Ca(0x3af));
          })
          [us(0x280)](function () {
            const Cb = us,
              sb = [];
            for (let sd in qT) {
              const se = qT[sd];
              se[Cb(0xcda)][Cb(0x439)](sa) && sb[Cb(0x733)](se);
            }
            const sc =
              sb[Math[Cb(0x815)](Math[Cb(0xb7c)]() * sb[Cb(0x8c2)])] ||
              qT[Cb(0x9d6)];
            console[Cb(0xd6f)](Cb(0x2f8) + sa + Cb(0x2eb) + sc[Cb(0xcda)]),
              sc["el"][Cb(0x330)]();
          });
      }
    }
    (document[us(0xa02)](us(0x2e5))[us(0xb14)][us(0x5ad)] = us(0xaa8)),
      kA[us(0x5a4)][us(0x2b0)](us(0xd69)),
      kB[us(0x5a4)][us(0xbc7)](us(0xd69)),
      (window[us(0x9be)] = function () {
        il(new Uint8Array([0xff]));
      });
    function r0(sb) {
      const Cc = us;
      clearTimeout(kF), iu();
      const sc = {};
      (sc[Cc(0xcb)] = sb), (hU = sc), kg(!![]);
    }
    window[us(0xdca)] = r0;
    var r1 = null;
    function r2(sb) {
      const Cd = us;
      if (!sb || typeof sb !== Cd(0xb02)) {
        console[Cd(0xd6f)](Cd(0x69f));
        return;
      }
      if (r1) r1[Cd(0x1c4)]();
      const sc = sb[Cd(0x8e2)] || {},
        sd = {};
      (sd[Cd(0x9fe)] = Cd(0x34c)),
        (sd[Cd(0x3d6)] = Cd(0xd3)),
        (sd[Cd(0x477)] = Cd(0x4b3)),
        (sd[Cd(0xdb2)] = Cd(0xb33)),
        (sd[Cd(0xb7d)] = !![]),
        (sd[Cd(0x93c)] = !![]),
        (sd[Cd(0x794)] = ""),
        (sd[Cd(0x41c)] = ""),
        (sd[Cd(0xbef)] = !![]),
        (sd[Cd(0xd0a)] = !![]);
      const se = sd;
      for (let sk in se) {
        (sc[sk] === void 0x0 || sc[sk] === null) && (sc[sk] = se[sk]);
      }
      const sf = [];
      for (let sl in sc) {
        se[sl] === void 0x0 && sf[Cd(0x733)](sl);
      }
      sf[Cd(0x8c2)] > 0x0 &&
        console[Cd(0xd6f)](Cd(0xa13) + sf[Cd(0x128)](",\x20"));
      sc[Cd(0x794)] === "" && sc[Cd(0x41c)] === "" && (sc[Cd(0x794)] = "x");
      (sc[Cd(0x3d6)] = hP[sc[Cd(0x3d6)]] || sc[Cd(0x3d6)]),
        (sc[Cd(0xdb2)] = hP[sc[Cd(0xdb2)]] || sc[Cd(0xdb2)]);
      const sg = nN(
        Cd(0x56f) +
          sc[Cd(0x9fe)] +
          Cd(0x301) +
          sc[Cd(0x3d6)] +
          Cd(0xae4) +
          (sc[Cd(0x477)]
            ? Cd(0x744) +
              sc[Cd(0x477)] +
              "\x22\x20" +
              (sc[Cd(0xdb2)] ? Cd(0x163) + sc[Cd(0xdb2)] + "\x22" : "") +
              Cd(0xb5f)
            : "") +
          Cd(0x8a4)
      );
      (r1 = sg),
        (sg[Cd(0x1c4)] = function () {
          const Ce = Cd;
          document[Ce(0xb87)][Ce(0x5a4)][Ce(0xbc7)](Ce(0xef)),
            sg[Ce(0xbc7)](),
            (r1 = null);
        }),
        (sg[Cd(0xa02)](Cd(0x6ff))[Cd(0x269)] = sg[Cd(0x1c4)]);
      const sh = sg[Cd(0xa02)](Cd(0x88e)),
        si = [],
        sj = [];
      for (let sm in sb) {
        if (sm === Cd(0x8e2)) continue;
        const sn = sb[sm];
        let so = [];
        const sp = Array[Cd(0xc9c)](sn);
        let sq = 0x0;
        if (sp)
          for (let sr = 0x0; sr < sn[Cd(0x8c2)]; sr++) {
            const ss = sn[sr],
              st = dF[ss];
            if (!st) {
              si[Cd(0x733)](ss);
              continue;
            }
            sq++, so[Cd(0x733)]([ss, void 0x0]);
          }
        else
          for (let su in sn) {
            const sv = dF[su];
            if (!sv) {
              si[Cd(0x733)](su);
              continue;
            }
            const sw = sn[su];
            (sq += sw), so[Cd(0x733)]([su, sw]);
          }
        if (so[Cd(0x8c2)] === 0x0) continue;
        sj[Cd(0x733)]([sq, sm, so, sp]);
      }
      sc[Cd(0xd0a)] && sj[Cd(0x242)]((sx, sy) => sy[0x0] - sx[0x0]);
      for (let sx = 0x0; sx < sj[Cd(0x8c2)]; sx++) {
        const [sy, sz, sA, sB] = sj[sx];
        sc[Cd(0xbef)] && !sB && sA[Cd(0x242)]((sF, sG) => sG[0x1] - sF[0x1]);
        let sC = "";
        sc[Cd(0xb7d)] && (sC += sx + 0x1 + ".\x20");
        sC += sz;
        const sD = nN(Cd(0x5df) + sC + Cd(0x10c));
        sh[Cd(0x75c)](sD);
        const sE = nN(Cd(0xce2));
        for (let sF = 0x0; sF < sA[Cd(0x8c2)]; sF++) {
          const [sG, sH] = sA[sF],
            sI = dF[sG],
            sJ = nN(
              Cd(0xcc7) + sI[Cd(0x3b6)] + "\x22\x20" + qx(sI) + Cd(0xb5f)
            );
          if (!sB && sc[Cd(0x93c)]) {
            const sK = sc[Cd(0x794)] + k9(sH) + sc[Cd(0x41c)],
              sL = nN(Cd(0x7f6) + sK + Cd(0x10c));
            sK[Cd(0x8c2)] > 0x6 && sL[Cd(0x5a4)][Cd(0x2b0)](Cd(0x373)),
              sJ[Cd(0x75c)](sL);
          }
          (sJ[Cd(0xab7)] = sI), sE[Cd(0x75c)](sJ);
        }
        sh[Cd(0x75c)](sE);
      }
      kl[Cd(0x75c)](sg),
        si[Cd(0x8c2)] > 0x0 &&
          console[Cd(0xd6f)](Cd(0x1ad) + si[Cd(0x128)](",\x20")),
        document[Cd(0xb87)][Cd(0x5a4)][Cd(0x2b0)](Cd(0xef));
    }
    (window[us(0x473)] = r2),
      (document[us(0xb87)][us(0x53a)] = function (sb) {
        const Cf = us;
        sb[Cf(0x24a)]();
        const sc = sb[Cf(0x76a)][Cf(0x826)][0x0];
        if (sc && sc[Cf(0x41e)] === Cf(0x77c)) {
          console[Cf(0xd6f)](Cf(0x312) + sc[Cf(0xcda)] + Cf(0x578));
          const sd = new FileReader();
          (sd[Cf(0x519)] = function (se) {
            const Cg = Cf,
              sf = se[Cg(0x37c)][Cg(0x467)];
            try {
              const sg = JSON[Cg(0xae6)](sf);
              r2(sg);
            } catch (sh) {
              console[Cg(0x26e)](Cg(0x6fc), sh);
            }
          }),
            sd[Cf(0xd49)](sc);
        }
      }),
      (document[us(0xb87)][us(0xde4)] = function (sb) {
        const Ch = us;
        sb[Ch(0x24a)]();
      }),
      Object[us(0x840)](window, us(0x8cd), {
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
function b(c, d) {
  const e = a();
  return (
    (b = function (f, g) {
      f = f - 0x9c;
      let h = e[f];
      return h;
    }),
    b(c, d)
  );
}
function a() {
  const Ci = [
    "pickedEl",
    "#6f5514",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    "4th\x20August\x202023",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    "#347918",
    "%/s",
    "release",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    ";-webkit-background-position:\x20",
    "user",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    "readAsText",
    "string",
    "getTransform",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "*Cotton\x20health:\x208\x20→\x209",
    "#d3c66d",
    "Failed\x20to\x20get\x20game\x20stats.\x20Retrying\x20in\x205s...",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "Neowm",
    "\x22></span>\x0a\x09</div>",
    ".screen",
    "wss://hornex-",
    "US\x20#1",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    "Heavy",
    "Can\x27t\x20perform\x20that\x20action.",
    "1rrAouN",
    "14th\x20July\x202023",
    "deg)",
    ".time-alive",
    "wrecked",
    "buffer",
    "consumeProjDamage",
    "bush",
    "warn",
    "19th\x20July\x202023",
    "*Reduced\x20mob\x20count.",
    "onmousemove",
    "Username\x20is\x20already\x20taken.",
    ".main",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "show",
    "projD",
    "month",
    "://ho",
    "<div\x20class=\x22chat-text\x22></div>",
    ".my-player",
    "log",
    "ffa\x20sandbox",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    "despawnTime",
    "webSize",
    "Rock_3",
    "*2%\x20craft\x20success\x20rate.",
    "off",
    "Armor",
    "petalAntEgg",
    "setUserCount",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    "mobPetaler",
    ".ad-blocker",
    "*Missile\x20damage:\x2050\x20→\x2055",
    ".absorb-rarity-btns",
    "Fleepoint",
    "<div\x20class=\x22petal-count\x22></div>",
    "ultraPlayers",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "7th\x20February\x202024",
    "\x22></span></div>\x0a\x09</div>",
    "25th\x20June\x202023",
    "n8oKoxnarXHzeIzdmW",
    "petalMagnet",
    "#b52d00",
    "#5849f5",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "width",
    "\x20XP",
    "Removed\x20disclaimer\x20from\x20menu.",
    "petalArrow",
    "uiScale",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    "Leave",
    "gridColumn",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    ".max-score",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    "24th\x20August\x202023",
    "Tiers",
    "/dlMob",
    "petalRose",
    "#bebe2a",
    "101636gyvtEF",
    "Powder",
    "sprite",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "#416d1e",
    ".checkbox",
    "mobKilled",
    "hpRegen75PerSec",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "#000000",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    "us_ffa2",
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "regenF",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "scrollTop",
    "isSpecialWave",
    "getHurtColor",
    "bolder\x2012px\x20",
    "mobDespawned",
    "max",
    "weight",
    "descColor",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    "Sandstorm_4",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    ".common",
    "_blank",
    "drawImage",
    "petalStr",
    "iAbsorb",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    "Passive\x20Shield",
    "petalYinYang",
    "dice",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "1Jge",
    "honeyDmg",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "transformOrigin",
    "#b28b29",
    "worldW",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    "5th\x20January\x202024",
    ".ads",
    "connect",
    "Crab",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "blur(10px)",
    ".data-search-result",
    "(81*",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    "glbData",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "isSupporter",
    "Added\x20Leave\x20Game\x20button.",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    "loginFailed",
    "\x22></div><div\x20class=\x22log-content\x22>",
    "updateT",
    "#fff0b8",
    "719574lHbJUW",
    "lieOnGroundTime",
    ".low-quality-cb",
    "Common",
    ".menu",
    "ondragover",
    ".anti-spam-cb",
    "Fire\x20Duration",
    "Third\x20Eye",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    "pink",
    "reflect",
    "7th\x20August\x202023",
    "https://stats.hornex.pro/api/userCount",
    "scale(",
    "Lightning",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "Reduced\x20mobile\x20UI\x20scale.",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    ".ultra-buy",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    "Bone",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "totalPetals",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "translate(-50%,\x20",
    "accountData",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    ".show-population-cb",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "Buffs:",
    "#A8A7A4",
    "BrnPE",
    "toLow",
    "jellyfish",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "13th\x20February\x202024",
    "29th\x20January\x202024",
    "wasDrawn",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    ".tv-prev",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    "20th\x20January\x202024",
    "Iris",
    "picked",
    "Rock_5",
    "antHoleFire",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "pacman",
    "hideTimer",
    ".lottery\x20.dialog-content",
    "Nerfed\x20Ant\x20Holes:",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "url",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "Luxurious\x20mansion\x20of\x20ants.",
    "Desert",
    "#f009e5",
    ".login-btn",
    "Super",
    "includes",
    "createImageData",
    "zmkhtdVdSq",
    "reqFailed",
    "#724c2a",
    "stayIdle",
    "statuePlayer",
    "*Arrow\x20damage:\x201\x20→\x203",
    "124888lJSwSz",
    "top",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "KeyS",
    "*Bone\x20armor:\x208\x20→\x209",
    "loading",
    ".dismiss-btn",
    "29th\x20June\x202023",
    "outdatedVersion",
    "deg",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    "#c8a826",
    "ellipse",
    "Spider_6",
    "seed",
    "sq8Ig3e",
    "uiX",
    "*Peas\x20health:\x2020\x20→\x2025",
    "hide-all",
    "?v=",
    ".killer",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "bee",
    "Fixed\x20number\x20rounding\x20issue.",
    "origin",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "#fcdd86",
    "progress",
    "canSkipRen",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    "KeyL",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    "binaryType",
    "*Health:\x20100\x20→\x20120",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "petalDragonEgg",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "#4eae26",
    "span\x202",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "ANKUAsHKW5LZmq",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    "Heal\x20Affect\x20Duration",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "\x22></div>",
    "hsl(60,60%,60%)",
    ".discord-area",
    "&#Uz",
    "tierStr",
    "iReqGambleList",
    "Comes\x20to\x20avenge\x20mobs.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    "hsl(110,100%,60%)",
    ".hyper-buy",
    "petalNitro",
    "28th\x20August\x202023",
    "absorbPetalEl",
    "petalCoffee",
    "#ffe667",
    "*Gas\x20health:\x20140\x20→\x20250",
    "\x0a\x09</div>",
    "Added\x20level\x20up\x20reward\x20table.",
    "#924614",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    "*Swastika\x20health:\x2020\x20→\x2025",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "Buffed\x20Gem.",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "spikePath",
    "join",
    "10QIdaPR",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    "web",
    "New\x20mob:\x20Spider\x20Cave.",
    "fontFamily",
    "mobsEl",
    "sadT",
    "stroke",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2048\x2048\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x20\x20<title>data-source-solid</title>\x0a\x20\x20<g\x20id=\x22Layer_2\x22\x20data-name=\x22Layer\x202\x22>\x0a\x20\x20\x20\x20<g\x20id=\x22invisible_box\x22\x20data-name=\x22invisible\x20box\x22>\x0a\x20\x20\x20\x20\x20\x20<rect\x20width=\x2248\x22\x20height=\x2248\x22\x20fill=\x22none\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20\x20\x20<g\x20id=\x22icons_Q2\x22\x20data-name=\x22icons\x20Q2\x22>\x0a\x20\x20\x20\x20\x20\x20<path\x20d=\x22M46,9c0-6.8-19.8-7-22-7S2,2.2,2,9v7c0,.3,1.1,1.8,5.2,3.4h.3a40.3,40.3,0,0,0,8.6,2A65.6,65.6,0,0,0,24,22a65.6,65.6,0,0,0,7.9-.5,40.3,40.3,0,0,0,8.6-2h.3C44.9,17.8,46,16.3,46,16V9.3h0ZM2,31.3V39c0,6.8,19.8,7,22,7s22-.2,22-7V31.3C41.4,34.1,33.3,36,24,36S6.6,34.1,2,31.3Zm43.7-9.8a22.5,22.5,0,0,1-4.9,2.1A54.8,54.8,0,0,1,24,26,54.8,54.8,0,0,1,7.2,23.6a22.5,22.5,0,0,1-4.9-2.1L2,21.3V26c0,.3,1.2,1.9,5.5,3.5A50.2,50.2,0,0,0,24,32a50.2,50.2,0,0,0,16.5-2.5C44.8,27.9,46,26.3,46,26V21.3Z\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20</g>\x0a</svg>",
    "queenAntFire",
    "All\x20Petals",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "%\x20-\x200.8em*",
    "enable_min_scaling",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "Body",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "numAccounts",
    "els",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "curePoisonF",
    "#ffd800",
    "Minor\x20physics\x20change.",
    "Passively\x20regenerates\x20shield.",
    "goofy\x20ahh\x20insect\x20robbery",
    "WP5YoSoxvq",
    "reason:\x20",
    "tail_outline",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    "statue",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    "Yoba_6",
    ".stat-value",
    "opera",
    "sizeIncreaseF",
    "438613HPRPZb",
    ".level-progress",
    ".rewards-btn",
    "Extra\x20Pickup\x20Range",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "outlineCount",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    "petalPowder",
    "3rd\x20August\x202023",
    "gblcVXldOG",
    "invalid",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    "petalLightning",
    "getBigUint64",
    "Level\x20",
    "air",
    "*Pincer\x20damage:\x205\x20→\x206",
    ".shop-info",
    "iWithdrawPetal",
    ".nickname",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "style=\x22color:",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "pow",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "beginPath",
    ".global-user-count",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "#bc0000",
    "rad)",
    "Spider\x20Egg",
    "poisonDamageF",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    "#21c4b9",
    "userChat",
    ".show-bg-grid-cb",
    "rgb(31,\x20219,\x20222)",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    "spiderCave",
    "Added\x20Global\x20Leaderboard.",
    "rectAscend",
    "Gas",
    "#764b90",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    "#ffe200",
    "*Peas\x20damage:\x2010\x20→\x2012",
    "dragonNest",
    "cookie",
    "accountNotFound",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    "*Halo\x20now\x20stacks.",
    "W77cISkNWONdQa",
    "shootLightning",
    "stickbug",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    "Baby\x20Ant",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "#fff",
    "24th\x20July\x202023",
    "Favourite\x20object\x20of\x20a\x20woman.",
    "#735b49",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    ".changelog\x20.dialog-content",
    "Preroll\x20state:\x20",
    "Dandelion",
    "Spider_4",
    "makeSpiderLegs",
    "Jellyfish",
    "KeyM",
    "font",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    "Invalid\x20account!",
    "Kicked!\x20(reason:\x20",
    ".build-load-btn",
    "show_bg_grid",
    "#82b11e",
    "Soaks\x20damage\x20over\x20time.",
    "webSizeTiers",
    "oSize",
    ".absorb",
    "select",
    "Pacman",
    "removeT",
    "fixed_name_size",
    "Need\x20to\x20be\x20Lvl\x20",
    "iReqGlb",
    ".helper-cb",
    "*Yoba\x20health:\x20500\x20→\x20350",
    "runSpeed",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    "hide_chat",
    "#eb4755",
    "*Fire\x20damage:\x209\x20→\x2015",
    "Sand",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    "isHudPetal",
    "#454545",
    "accountId",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "10th\x20July\x202023",
    "keydown",
    "WRS8bSkQW4RcSLDU",
    "Gives\x20you\x20a\x20shield.",
    "petalGas",
    "\x22></span></div>",
    "hsla(0,0%,100%,0.15)",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    "*Cotton\x20health:\x2010\x20→\x2012",
    ".build-save-btn",
    "dispose",
    "expand",
    "reloadT",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    "ladybug",
    "onchange",
    "targetEl",
    ".circle",
    "4th\x20April\x202024",
    "*Epic:\x2075\x20→\x2065",
    "Sunflower",
    "*Cotton\x20health:\x209\x20→\x2010",
    "bqpdUNe",
    "Spider",
    "hornex-pro_970x250",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    "Even\x20more\x20wave\x20changes:",
    "Turtle",
    "*Hyper:\x2015-25",
    "hasGem",
    "#a2eb62",
    "petalDmca",
    "armorF",
    ".\x20Hac",
    "send",
    "\x20&\x20",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "honeyRange",
    "iGamble",
    "stringify",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    "#d43a47",
    "json",
    "shinyCol",
    "petalBubble",
    "WRGBrCo9W6y",
    "KeyV",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    "Soldier\x20Ant_3",
    "7th\x20October\x202023",
    "cEca",
    "W7dcP8k2W7ZcLxtcHv0",
    "spawn",
    "6th\x20October\x202023",
    "isSleeping",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    "22nd\x20June\x202023",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "sunflower",
    "makeHole",
    "getUint16",
    "\x0a4th\x20May\x202024\x0aFixed\x20a\x20player\x20dupe\x20bug.\x20\x0aBalances:\x0a*Taco\x20healing:\x209\x20→\x2010\x0a*Sunflower\x20shield:\x201\x20→\x202.5\x0a*Shell\x20shield:\x208\x20→\x2012\x0a*Buffed\x20Yoba\x20Egg\x20by\x2050%\x0a",
    "strokeText",
    "isPortal",
    "12OVuKwi",
    "Sandstorm_1",
    "*Taco\x20healing:\x208\x20→\x209",
    "rgb(",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "cloneNode",
    "makeMissile",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    "queenAnt",
    "21st\x20July\x202023",
    "killed",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    "OPEN",
    "col",
    "Breed\x20Range",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "regenAfterHp",
    "soldierAnt",
    "Wig",
    "\x0a16th\x20May\x202024\x0aAdded\x20Game\x20Statistics:\x0a*Super\x20Players\x0a*Hyper\x20Players\x0a*Ultra\x20Players\x20(with\x20more\x20than\x20200\x20ultra\x20petals)\x0a*All\x20Petals\x0a*Data\x20is\x20updated\x20every\x20hour.\x0a*You\x20can\x20search\x20game\x20stats\x20by\x20username.\x0a",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    "6fCH",
    "lightningBouncesTiers",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "AS\x20#1",
    "createdAt",
    "%\x20!important",
    "#fbb257",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "nig",
    "complete",
    "WRRdT8kPWO7cMG",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "#ff7892",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    "New\x20mob:\x20Snail.",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    "Leaf",
    "total",
    "13th\x20September\x202023",
    "textBaseline",
    "prog",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    "26th\x20August\x202023",
    "%!Ew",
    "dragon",
    "privacy.txt",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "soakTime",
    "Magnet",
    "#cecfa3",
    "petalCactus",
    "2nd\x20October\x202023",
    "10px",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "isPoison",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "globalAlpha",
    "EU\x20#2",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "sort",
    "an\x20UN",
    "#363685",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    "Digit",
    "inclu",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "preventDefault",
    "babyAntFire",
    "</option>",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    "*Snail\x20health:\x2040\x20→\x2045",
    "#b58500",
    "petalStarfish",
    "petDamageFactor",
    "/dlSprite",
    "elongation",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    "*Light\x20damage:\x2012\x20→\x2010",
    "subscribe\x20for\x20999\x20super\x20petals",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "WR7dPdZdQXS",
    "#f55",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "isRetard",
    ";\x20-o-background-position:",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "Statue\x20of\x20RuinedLiberty.",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "GsP9",
    "6th\x20September\x202023",
    "\x0a5th\x20May\x202024\x0aHeavy\x20now\x20slows\x20down\x20your\x20petal\x20orbit\x20speed.\x20More\x20slowness\x20for\x20higher\x20rarity.\x20\x0aCotton\x20doesn\x27t\x20expand\x20like\x20Rose\x20when\x20you\x20are\x20angry.\x0aPowder\x20now\x20adds\x20turbulence\x20to\x20your\x20petals\x20when\x20you\x20are\x20angry.\x0aFixed\x20more\x20player\x20dupe\x20bugs.\x0a",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    "#c69a2c",
    "\x20petals\x22></div>",
    ".credits",
    "#b05a3c",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "onclick",
    "furry",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "\x20by",
    "*Rock\x20health:\x2045\x20→\x2050",
    "error",
    "lineWidth",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    "#555",
    "*Swastika\x20health:\x2030\x20→\x2035",
    "drawTurtleShell",
    "Congratulations!",
    "#4d5e56",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "canRender",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "isPetal",
    "red",
    "discord_data",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "onMove",
    "tumbleweed",
    "finally",
    ".find-user-btn",
    "cantChat",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "isBae",
    "Yoba_1",
    ".max-wave",
    "zert.pro",
    "iMood",
    "function",
    "web_",
    "#a52a2a",
    "Fixed\x20Gem\x20glitch.",
    "ame",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "*Arrow\x20damage:\x204\x20→\x205",
    "i\x20make\x20cool\x20videos",
    "Petal\x20Slots",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "<div\x20class=\x22petal-icon\x22\x20",
    "Ghost_1",
    "WP/dQbddHH0",
    "\x20stroke=\x22",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    "projHealthF",
    "petalBanana",
    "level",
    "breedRange",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "starfish",
    "\x20online)",
    "Pet\x20Heal",
    "mobile",
    ".absorb\x20.dialog-header\x20span",
    "setPos",
    "%</option>",
    "isConnected",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "guardian",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "(?:^|;\x5cs*)",
    "round",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "isIcon",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    "add",
    "1167390UrVkfV",
    ".grid",
    "155yLxxXS",
    "ignore\x20if\x20u\x20already\x20subbed",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "#709e45",
    "petalSoil",
    "flowerPoisonF",
    "Yellow\x20Ladybug",
    "\x0a13th\x20May\x202024\x0aFixed\x20a\x20bug\x20that\x20didn\x27t\x20let\x20flowers\x20enter\x20portals.\x0aBalances:\x0a*Sword\x20damage:\x2017\x20→\x2021\x0a*Yin\x20yang\x20damage:\x2010\x20→\x2020\x0a*Yin\x20yang\x20reload:\x202s\x20→\x201.5s\x0a",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    "135249DkEsVO",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "as_ffa2",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "<div\x20class=\x22spinner\x22></div>",
    "wss://eu1.hornex.pro",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    "12th\x20November\x202023",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    ".scoreboard-title",
    "shieldReload",
    ".player-list\x20.dialog-content",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "scale2",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    "#a58368",
    "#7af54c",
    "#c1ab00",
    "dontUiRotate",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "beetle",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    "1998256OxsvrH",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "Saved\x20Build\x20#",
    "onmouseleave",
    "\x20was\x20",
    "#15cee5",
    "onwheel",
    "touchmove",
    "scrollHeight",
    "#cfcfcf",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "aip_complete",
    "workerAntFire",
    "toDataURL",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "Mushroom",
    ".loader",
    "enable_kb_movement",
    "User\x20not\x20found.",
    "textarea",
    "s...)",
    "onkeyup",
    "\x0aServer:\x20",
    "24th\x20June\x202023",
    "orbitDance",
    "#D2D1CD",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "Removed\x20Waves.",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    "lightningDmg",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    "locat",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "petalStick",
    "LavaWater",
    "Region:\x20",
    "WP4hW755jCokWRdcKchdT3ui",
    "darkLadybug",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    "\x20Pym\x20Particle.",
    "nSkOW4GRtW",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    "*Peas\x20damage:\x2012\x20→\x2015",
    "\x22\x20style=\x22color:",
    "http://localhost:8001/discord",
    "can\x20s",
    "Ultra\x20Players\x20(200+)",
    ".discord-btn",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    "Wave\x20Ending...",
    "host",
    "successCount",
    "https://www.instagram.com/zertalious",
    "#e05748",
    "petRoamFactor",
    "<div\x20style=\x22color:\x20",
    "rgb(166\x2056\x20237)",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    "crafted\x20nothing\x20from",
    "Importing\x20data\x20file:\x20",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "Soldier\x20Ant_6",
    "KICKED!",
    "Reflected\x20Missile\x20Damage",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    ".changelog",
    ".craft-rate",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "\x20in\x20view\x20/\x20",
    "gameStats.json",
    "left",
    "onkeydown",
    ".privacy-btn",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    "s\x20can",
    "nick",
    "Soldier\x20Ant",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "Beetle\x20Egg",
    "#f22",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    "13th\x20August\x202023",
    "x.pro",
    "mouse2",
    "us_ffa1",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    "Extremely\x20slow\x20sussy\x20mob.",
    "click",
    "fake",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "\x20rad/s",
    "#bb1a34",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "your\x20",
    "#543d37",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "/profile",
    "Yoba\x20Egg",
    ".petal-rows",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    "superPlayers",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    "RuinedLiberty",
    "%\x20success\x20rate",
    "fixed",
    "Poop\x20Health",
    "wss://us2.hornex.pro",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    "Hornet_6",
    "waveEnding",
    "Ghost_6",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "splice",
    "2357",
    "Some\x20Data",
    "Account\x20imported!",
    "Spider_3",
    "New\x20mob:\x20Turtle",
    "MOVE\x20AWAY!!",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    "setTargetEl",
    ".stats\x20.dialog-header\x20span",
    "</div><div\x20class=\x22log-line\x22></div>",
    "data-icon",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "#32a852",
    "cuYF",
    "isConsumable",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "petalLightsaber",
    ".censor-cb",
    "hasAntenna",
    "petalChromosome",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "Increases\x20your\x20vision.",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "Added\x20Waves.",
    ".game-stats\x20.dialog-content",
    "W43cOSoOW4lcKG",
    "evenodd",
    "hasEars",
    "slayed",
    "kicked",
    "Poo",
    "#a33b15",
    "[F]\x20Show\x20Hitbox:\x20",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    "dontPushTeam",
    "tile_",
    "reset",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    "https://discord.gg/zZsUUg8rbu",
    "small",
    "ears",
    "?dev",
    "\x20downloaded!",
    "clientWidth",
    "petalBasic",
    ".joystick",
    "Ant\x20Egg",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    "target",
    "<div\x20class=\x22slot\x22></div>",
    "Invalid\x20username.",
    "isPassiveAggressive",
    "consumeTime",
    "flower",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    ".game-stats-btn",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    "mouse",
    "#e0c85c",
    "#8ecc51",
    "iBreedTimer",
    "wss://eu2.hornex.pro",
    "New\x20mob:\x20Dice.",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    "Yoba_2",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    "marginBottom",
    "hpRegenPerSecF",
    "maxTimeAlive",
    "New\x20petal:\x20Sponge",
    "Last\x20Updated:\x20",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    "#4f412e",
    "#775d3e",
    "wing",
    "strokeRect",
    "isRectHitbox",
    "sponge",
    "assualted",
    "Game",
    "undefined",
    "Peas",
    ".total-accounts",
    "16th\x20June\x202023",
    "Increased\x20Ultra\x20key\x20price.",
    "Soil",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    "Fire\x20Damage",
    "hsl(60,60%,",
    "onopen",
    ".reload-btn",
    "health",
    "offsetWidth",
    "advanced\x20to\x20number\x20",
    "wig",
    "Failed\x20to\x20find\x20region.",
    "UNOFF",
    ".lb-btn",
    "Taco",
    "📜\x20",
    ".progress",
    "*Heavy\x20health:\x20500\x20→\x20600",
    "tier",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "New\x20mob:\x20Dragon\x20Nest.",
    "*Rock\x20health:\x20150\x20→\x20200",
    "#33a853",
    "#1ea761",
    "Wing",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    "\x20FPS\x20/\x20",
    "petalEgg",
    "#353331",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    "e=\x22Yo",
    "bg-rainbow",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    "posAngle",
    "Damage",
    "rgb(237\x20236\x2061)",
    "height",
    "Claiming\x20secret\x20skin...",
    "#6265eb",
    "getElementById",
    "Increased\x20Wave\x20mob\x20count.",
    "sandstorm",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "WAVE",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    "boostStrength",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "WRyiwZv5x3eIdtzgdgC",
    "titleColor",
    "26th\x20July\x202023",
    "append",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    ".level",
    "bolder\x20",
    "petalSand",
    "Hornet",
    "Mob\x20Rotation",
    "11th\x20July\x202023",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "Rock_2",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "Server\x20side\x20performance\x20improvements.",
    "adplayer-not-found",
    "measureText",
    "\x20at\x20y",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    "\x20all\x20",
    "ll\x20yo",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    "deadT",
    "#dddddd",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    "onclose",
    "halo",
    "ShiftLeft",
    "210ZoZRjI",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "3rd\x20July\x202023",
    "WP10rSoRnG",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    "next",
    "Dragon_3",
    "#493911",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    "WRbjb8oX",
    "23rd\x20January\x202024",
    "yellowLadybug",
    "KeyU",
    "shadowColor",
    "isBooster",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "#7d5b1f",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    "waveStarting",
    "\x20•\x20",
    "VLa2",
    "containerDialog",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "*Bone\x20armor:\x207\x20→\x208",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "vendor",
    "spawn_zone",
    "#38ecd9",
    "Boomerang.",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    "Fire",
    "identifier",
    "credits",
    "des",
    "#c76cd1",
    "show_grid",
    "sizeIncrease",
    "Ants\x20redesign.",
    "canShowDrops",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "labelSuffix",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "type",
    "hostname",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "#634418",
    "hornex",
    "├─\x20",
    "healthF",
    "https://www.youtube.com/@gowcaw97",
    "endsWith",
    "*Bone\x20armor:\x205\x20→\x206",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    "rgba(0,0,0,0.2",
    ".hud",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "#d54324",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "spawnOnHurt",
    "></di",
    "#f7904b",
    "9iYdxUh",
    "Stickbug",
    "innerWidth",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    "<div\x20class=\x22chat-name\x22></div>",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    "stepPerSecMotion",
    "startsWith",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    "doRemove",
    "15th\x20August\x202023",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    "keyInvalid",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "petalStinger",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "wss://us1.hornex.pro",
    ".total-kills",
    "ArrowUp",
    "nice\x20stolen\x20florr\x20assets",
    ".data-search",
    "Username\x20too\x20big!",
    "petalSuspill",
    "#ff94c9",
    "bottom",
    "Arrow",
    ".expand-btn",
    "Furry",
    "hornex.pro",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "as_ffa1",
    "petalLeaf",
    "active",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    "ShiftRight",
    "hideUserCount",
    "wn\x20ri",
    "petals!",
    ".sad-btn",
    "petalHeavy",
    "Light",
    "icBdNmoEta",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "Client-side\x20performance\x20improvements.",
    "4oL8",
    "Pill\x20affects\x20Arrow\x20now.",
    "Beetle_3",
    "Added\x20Waveroom:",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "DMCA-ed",
    "map",
    "result",
    "Redesigned\x20some\x20mobs.",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "index",
    "consumeProjHealth",
    "└─\x20",
    "13th\x20July\x202023",
    "password",
    "Dragon_2",
    "projHealth",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    "rgb(255,\x2043,\x20117)",
    "displayData",
    "Honey\x20Damage",
    "petalPacman",
    "Honey",
    "desc",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "Wave\x20changes:",
    "poopPath",
    "8th\x20August\x202023",
    "597643cpzVcT",
    "content",
    "deleted",
    ".player-list",
    "unnamed",
    "Buffed\x20Lightsaber:",
    ".xp",
    "childIndex",
    "ArrowDown",
    "clipboard",
    "are\x20p",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "healthIncrease",
    "Scorpion\x20redesign.",
    ".\x22>\x20<span\x20class=\x22username-link\x22\x20stroke=\x22",
    "𐐿𐐘𐐫𐑀𐐃",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "isDevelopmentMode",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "petalMushroom",
    "connectionIdle",
    "[2tB",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    "fossil",
    "WP4dWPa7qCklWPtcLq",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "isLightsaber",
    "iPercent",
    "Some\x20anti\x20lag\x20measures:",
    "21st\x20June\x202023",
    "toLowerCase",
    "centipedeBody",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    "16th\x20July\x202023",
    "pedox",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    "unset",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    "fixedSize",
    "blue",
    "Added\x20maze\x20in\x20Waveroom:",
    "#368316",
    "targetPlayer",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    "20th\x20July\x202023",
    "180144zHWirQ",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "passiveBoost",
    "6th\x20July\x202023",
    "Very\x20sussy\x20data!",
    "petalDrop_",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    "Beetle_6",
    "#af6656",
    "*Super:\x201%\x20→\x201.5%",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "#ff7380",
    "spiderLeg",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    "<option\x20value=\x22",
    "#4040fc",
    "state",
    "beehive",
    "5th\x20July\x202023",
    "angle",
    "25th\x20August\x202023",
    "dontExpand",
    ".lottery-rarities",
    "petalShell",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    "unknown",
    "#e6a44d",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "https",
    "#444444",
    "3m^(",
    "STOP!",
    "Poison\x20Reduction",
    "n\x20war",
    "Hnphe",
    ".bar",
    "byteLength",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "20th\x20June\x202023",
    "hide-icons",
    "oninput",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    "petal_",
    "Dragon_1",
    "dmca\x20it\x20m28!",
    "Shell",
    "timePlayed",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    "isStatue",
    "show_damage",
    "#ccad00",
    "lightningBounces",
    "rgba(0,0,0,0.15)",
    "Hornet_1",
    "Yoba_3",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "2nd\x20August\x202023",
    ".tooltip",
    "[data-icon]",
    "Sussy\x20Discord\x20uwu",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    "Shield",
    "#a82a00",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "WPJcKmoVc8o/",
    "3220DFvaar",
    "cantPerformAction",
    "keys",
    "26th\x20September\x202023",
    "Rose",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "#5ab6ab",
    "Halo",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "#cdbb48",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "#000",
    "#323032",
    "EU\x20#1",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "rainbow-text",
    ".debug-info",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    "W5T8c2BdUs/cJHBcR8o4uG",
    "Lvl\x20",
    "occupySlot",
    "%;\x22\x20stroke=\x22",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    "running...",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "Balancing:",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    "Continue",
    "repeat",
    "*Cotton\x20health:\x207\x20→\x208",
    ".stats",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "fire",
    "addCount",
    "onload",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "arrested\x20for\x20plagerism",
    "OFF",
    "8URl",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "*They\x20give\x2010x\x20score.",
    "TC0B",
    "hasHalo",
    "Mythic",
    "turtle",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    "GBip",
    "hpAlpha",
    "fill",
    "p41E",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    "isPet",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "leaders",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "hsl(110,100%,50%)",
    "respawnTime",
    "abeQW7FdIW",
    "passive",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    "lineCap",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "eyeY",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "ondrop",
    "low_quality",
    "#7dad0c",
    "pet",
    "#333333",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    ".lottery\x20.inventory-petals",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "Web\x20Radius",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    "countAngleOffset",
    "backgroundColor",
    "Ultra",
    "New\x20mob:\x20M28.",
    "visible",
    "isStatic",
    "insert\x20something\x20here...",
    "&response_type=code&scope=identify&state=",
    ".settings",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "iReqAccountData",
    ".build-petals",
    "span",
    "oPlayerX",
    "#feffc9",
    "strokeStyle",
    "class=\x22chat-cap\x22",
    "username",
    ".username-link",
    "fireDamage",
    "shield",
    "INPUT",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    "*Hyper:\x20240",
    "attachPetal",
    "chain",
    "dur",
    "petalSponge",
    "keyAlreadyUsed",
    "<div><span\x20stroke=\x22",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "<div\x20stroke=\x22Last\x20Updated:\x2010s\x20ago\x22></div>",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    "#fc9840",
    "Provide\x20a\x20name\x20dummy.",
    "our\x20o",
    "href",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "\x22></span>\x0a\x09\x09\x09</div>",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    ".angry-btn",
    "putImageData",
    "IAL\x20c",
    "--angle:",
    "#a760b1",
    "nAngle",
    "\x20ctxs\x20(",
    "Missile\x20Poison",
    "...",
    "Cement",
    "green",
    "Coffee",
    "open",
    "wss://as2.hornex.pro",
    ".container",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "Orbit\x20Twirl",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "14dafFDX",
    "Enter",
    "Web",
    "consumeProjDamageF",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    "3763647Xmbgno",
    "val",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    "hit.p",
    ".connecting",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    "className",
    ".export-btn",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "search",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "Yoba_5",
    "makeBallAntenna",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "ned.\x22",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    "#2e933c",
    "r\x20acc",
    "Expander",
    "#be342a",
    "^F[@",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "charCodeAt",
    "finalMsg",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    "classList",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    "Nigersaurus",
    "onresize",
    "*Rose\x20heal:\x2013\x20→\x2011",
    "setUint32",
    "tooltipDown",
    "readyState",
    ".hide-chat-cb",
    "display",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "joinedGame",
    "23rd\x20August\x202023",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    "execCommand",
    "fromCharCode",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "player",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "released",
    "spiderYoba",
    "eu_ffa2",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "scorpion",
    "Breaths\x20fire.",
    "Ant\x20Fire",
    "*Banana\x20health:\x20170\x20→\x20400",
    ".petals-picked",
    "petalSalt",
    "#7d5098",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "*Unsual:\x2025\x20→\x2010",
    "Dragon",
    "Soak\x20Duration",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    "Spider\x20Yoba",
    "25th\x20July\x202023",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    "28th\x20June\x202023",
    "Grapes",
    "start",
    "#888",
    "#222",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "lineTo",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "*Rice\x20damage:\x205\x20→\x204",
    "#333",
    "shlong",
    "Added\x201\x20AS\x20lobby.",
    ".prediction",
    "*Gas\x20health:\x20250\x20→\x20200",
    "\x20-\x20",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "#bbbbbb",
    "{background-color:",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "<div\x20stroke=\x22",
    "#754a8f",
    "Flower\x20#",
    "ontouchstart",
    "values",
    ".spawn-zones",
    "*Legendary:\x20125\x20→\x20100",
    "keyCheckFailed",
    "cDHZ",
    "Lightning\x20damage:\x2012\x20→\x208",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "*Reduced\x20HP\x20depletion.",
    "Username\x20too\x20short!",
    "projType",
    ".credits-btn",
    "baseSize",
    "fillStyle",
    "Stick",
    "petalCement",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "Spider\x20Cave",
    "soldierAntFire",
    "shiftKey",
    "right_align_petals",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "fontSize",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "drawArmAndGem",
    "#554213",
    "mobSizeChange",
    "*Snail\x20damage:\x2015\x20→\x2020",
    "Elongation",
    "New\x20petal:\x20Wig.",
    "Fixed\x20duplicate\x20drops.",
    "W7/cOmkwW4lcU3dcHKS",
    "Beetle_1",
    "nickname",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    ".mob-gallery\x20.dialog-content",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "3L$0",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "rgb(126,\x20239,\x20109)",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "spawnT",
    "rgb(219\x20130\x2041)",
    "ENTERING!!",
    "globalCompositeOperation",
    "*Rare:\x2050\x20→\x2035",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    "eu_ffa1",
    "bar",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "entRot",
    "hasEye",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    ".find-user-input",
    "bone",
    "*Fire\x20health:\x2080\x20→\x20120",
    "hide-chat",
    "#634002",
    "\x20You\x20",
    "extraRangeTiers",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "d\x20abs",
    "Soldier\x20Ant_2",
    "hasAbsorbers",
    "ad\x20refresh",
    "addToInventory",
    "1st\x20July\x202023",
    "[censored]",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "tagName",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    "mouse0",
    "xgMol",
    "<div\x20class=\x22data-top-area\x22>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Current\x20Page:\x22></span>\x0a\x09\x09\x09\x09<select\x20tabindex=\x22-1\x22></select>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Search:\x22></span>\x0a\x09\x09\x09\x09<input\x20class=\x22textbox\x20data-search\x22\x20type=\x22text\x22\x20placeholder=\x22Enter\x20value...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<div\x20class=\x22data-search-result\x22\x20style=\x22display:none;\x22></div>\x0a\x09\x09</div>",
    "Avacado",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "19th\x20January\x202024",
    ".lottery-timer",
    "typeStr",
    ".super-buy",
    "*Snail\x20health:\x2045\x20→\x2050",
    "sign",
    "*Reduced\x20Shield\x20regen\x20time.",
    "\x22></span>\x20",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "\x22\x20stroke=\x22(",
    "Tumbleweed",
    "users",
    "translate(-50%,",
    "22nd\x20January\x202024",
    "Fixed\x20another\x20craft\x20exploit.",
    "Snail",
    "useTimeTiers",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    "pickupRange",
    "waveShowTimer",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    "split",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Added\x202\x20US\x20lobbies.",
    ".continue-btn",
    "Ghost",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "#ff4f4f",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "getBoundingClientRect",
    "thirdEye",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "Mob\x20Size\x20Change",
    "Antidote",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    ".reload-timer",
    "Queen\x20Ant",
    "acker",
    "More\x20wave\x20changes:",
    "l\x20you",
    "*Heavy\x20health:\x20450\x20→\x20500",
    "changelog",
    "Regenerates\x20health\x20when\x20consumed.",
    "projPoisonDamage",
    "ghost",
    "\x22></div>\x0a\x09</div>",
    ".claim-btn",
    "#ffffff",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "#34f6ff",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    "petals",
    "Duration",
    "rect",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "KCsdZ",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    "It\x20burns.",
    "petalRock",
    "2090768fiNzSa",
    "Head",
    "KeyG",
    ".shop-btn",
    "unsuccessful",
    "Evil\x20Centipede",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    "Honey\x20factory.",
    "respawnTimeTiers",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    "arc",
    ".chat-input",
    "petalPollen",
    "show_clown",
    "image/png",
    "W6rnWPrGWPfdbxmAWOHa",
    "CCofC2RcTG",
    "craftResult",
    "petHealthFactor",
    "vFKOVD",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "Extra\x20Spin\x20Speed",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    "reload",
    "Guardian",
    "iWatchAd",
    "iLeaveGame",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "save",
    "It\x20has\x20sussy\x20movement.",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "hostn",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "Banana",
    "teal\x20",
    "Increases\x20petal\x20pickup\x20range.",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "terms.txt",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "Petaler",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "value",
    "hpRegenPerSec",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    "6th\x20November\x202023",
    "copy",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "25th\x20January\x202024",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    "*Rock\x20health:\x2060\x20→\x20120",
    "hornet",
    "breedTimerAlpha",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    "Petals",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    "Loading\x20video\x20ad...",
    "strok",
    "timeJoined",
    "Slowness\x20Duration",
    "Added\x20Discord\x20login.",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "Spawn\x20zone\x20changes:",
    ".zone-name",
    "21st\x20January\x202024",
    "Goofy\x20little\x20wanderer.",
    "ontouchend",
    "Fixed\x20Rice.",
    "focus",
    "isPlayer",
    "atan2",
    "Video\x20AD\x20success!",
    "&quot;",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "createElement",
    "flowerPoison",
    ".craft-btn",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "2nd\x20March\x202024",
    "dontResolveCol",
    "hsla(0,0%,100%,0.5)",
    "KeyA",
    "*Rice\x20damage:\x204\x20→\x205",
    "center",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    "zvNu",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "alpha",
    "slowDuration",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    "asdfadsf",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "1st\x20August\x202023",
    "#555555",
    "hurtT",
    "desktop",
    "KePiKgamer",
    "Wave\x20",
    "Antennae",
    "pathSize",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    "Gem",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    "Extra\x20Range",
    "Passive\x20Heal",
    "decode",
    "Stick\x20does\x20not\x20expand\x20now.",
    "3rd\x20February\x202024",
    "changeLobby",
    "lighter",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "Loaded\x20Build\x20#",
    "hsla(0,0%,100%,0.1)",
    "Sandstorm_6",
    "bone_outline",
    "rgba(0,\x200,\x200,\x200.15)",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    "been\x20",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20class=\x22username-link\x22\x20stroke=\x22",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    ".pro",
    "Press\x20G\x20to\x20toggle\x20grid.",
    "drawWingAndHalo",
    "*Super:\x20150+",
    "projDamageF",
    "WARNING!",
    "Dahlia",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "#b5a24b",
    "drawChats",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "New\x20mob:\x20Statue.",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    ".close-btn",
    "Extra\x20Vision",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "uiName",
    "253906KWTZJW",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    "#38c75f",
    "getRandomValues",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "hide-scoreboard",
    "color",
    "#ff3333",
    "path",
    ".tooltips",
    "#406150",
    "i\x20need\x20999\x20billion\x20subs",
    "New\x20settings:\x20Low\x20quality.",
    "successful",
    "affectHealDur",
    "show_hitbox",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    "then",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    "canRemove",
    "absorb",
    "#c9b46e",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    "\x22></div>\x20<div\x20style=\x22color:",
    "activeElement",
    "tail",
    "Pincer",
    "Failed\x20to\x20get\x20userCount!",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    "Temporary\x20Extra\x20Speed",
    "*Cotton\x20health:\x2012\x20→\x2015",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "textEl",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "#709d45",
    "#328379",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "Added\x20another\x20AS\x20lobby.",
    "angleSpeed",
    "hsla(0,0%,100%,0.3)",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "hornex-pro_300x600",
    "hsl(110,100%,10%)",
    "*Ultra:\x20120",
    "twirl",
    "push",
    "mushroom",
    "Decreases",
    "main",
    "percent",
    "isTanky",
    "https://www.youtube.com/@NeowmHornex",
    "iScore",
    "d.\x20Pr",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "test",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    ".absorb-btn\x20.tooltip\x20span",
    "rgba(0,0,0,0.4)",
    "curve",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    ".debug-cb",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    ".inventory-rarities",
    "Petal\x20Weight",
    ".inventory",
    "\x5c$1",
    "orbitRange",
    ".collected",
    "no\x20sub,\x20no\x20gg",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "31st\x20July\x202023",
    "draw",
    "petSizeIncrease",
    "Epic",
    "W6RcRmo0WR/cQSo1W4PifG",
    "KeyC",
    "lightning",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "dandelion",
    "#db4437",
    "agroRangeDec",
    "#aaaaaa",
    ".petal.empty",
    "*Bone\x20armor:\x209\x20→\x2010",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "appendChild",
    "drawShell",
    "startPreRoll",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    ".minimap",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    "rgb(222,\x2031,\x2031)",
    "Hornet\x20Egg",
    "nProg",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "Mob\x20",
    "moveSpeed",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "petalSnail",
    "dataTransfer",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "drawDragon",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "snail",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "4\x20yummy\x20poisonous\x20balls.",
    "No\x20username\x20provided.",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "Hornet_3",
    "petalRice",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "petalTurtle",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    "progressEl",
    "application/json",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "0@x9",
    "9th\x20August\x202023",
    "Take\x20Down\x20Time",
    "ui_scale",
    "#a2dd26",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "lightningDmgF",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "have\x20",
    "uiAngle",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "isShiny",
    "crab",
    "#75dd34",
    "*Damage:\x204\x20→\x206",
    "key",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    "petalTaco",
    "#cfc295",
    "angryT",
    "labelPrefix",
    "video-ad-skipped",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    "Bee",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    "destroyed",
    "%zY4",
    "wss://as1.hornex.pro",
    "catch",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    "onEnd",
    "offsetHeight",
    "Crab\x20redesign.",
    "*Reduced\x20drops\x20by\x2050%.",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "55078DZMiSD",
    "WOziW7b9bq",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "orb\x20a",
    "abs",
    "*Snail\x20damage:\x2010\x20→\x2015",
    "discord\x20err:",
    "#fe98a2",
    "projSize",
    "angleOffset",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    "rewards",
    "startEl",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "projDamage",
    "rgba(0,0,0,",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    "rgba(0,0,0,0.35)",
    "inventory",
    ".hitbox-cb",
    "redHealthTimer",
    "they\x20copied\x20florr\x20code\x20omg!!",
    "23rd\x20June\x202023",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "redHealth",
    "switched",
    "Dragon_6",
    "Dragon\x20Egg",
    "KeyF",
    "style=\x22background-position:\x20",
    "#d9511f",
    "now",
    "player_id",
    "userAgent",
    "#2da14d",
    "Re-added\x20Waves.",
    "writeText",
    "Hyper\x20Players",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "\x22></span>\x20<span\x20stroke=\x22•\x20",
    "petalDice",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    ".submit-btn",
    "healthIncreaseF",
    "Lightsaber",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "day",
    "WQxdVSkKW5VcJq",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "erCas",
    ".mob-gallery",
    "builds",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "fillText",
    "Ugly\x20&\x20stinky.",
    "#3db3cb",
    "Craft\x20rate\x20change:",
    "div",
    "FSoixsnA",
    "\x22></div>\x0a\x09\x09",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    "groups",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    "arraybuffer",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    "B4@J",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "setAttribute",
    "#a07f53",
    "fireTime",
    "bubble",
    "Checking\x20username\x20availability...",
    "User\x20not\x20found!",
    ".lottery-winner",
    "New\x20mob:\x20Sunflower.",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "*Opening\x20Lottery",
    "moveTo",
    "petalsLeft",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "right",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "purple",
    "New\x20mob:\x20Beehive.",
    "12th\x20August\x202023",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "Poisonous\x20gas.",
    "#97782b",
    "(reloading...)",
    ".player-list-btn",
    "#b9baba",
    "24th\x20January\x202024",
    "petalAvacado",
    "#ffd941",
    "spider",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    ".minimap-cross",
    "1px",
    "spotPath_",
    "makeFire",
    "oPlayerY",
    "#bb771e",
    "*Powder\x20health:\x2010\x20→\x2015",
    "keyCode",
    "Pet\x20Size\x20Increase",
    "rgba(0,0,0,0.1)",
    "New\x20mob:\x20Mushroom.",
    "floor",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    "KeyW",
    "fixAngle",
    "cmd",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    ".discord-avatar",
    "stopWhileMoving",
    "7th\x20July\x202023",
    "Damage\x20Reflection",
    "petalExpander",
    "15th\x20July\x202023",
    "shop",
    "Soldier\x20Ant_1",
    ".joystick-knob",
    "files",
    "#882200",
    "shell",
    "Could\x20not\x20claim\x20secret\x20skin.",
    "Reduced\x20Wave\x20duration.",
    "\x20pxls)\x20/\x20",
    "Fire\x20Ant\x20Hole",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "avatar",
    "onmousedown",
    "Invalid\x20mob\x20name:\x20",
    "#9e7d24",
    "Ghost_5",
    "centipedeHeadPoison",
    "ability",
    ".stats-btn",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    "babyAnt",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    "centipedeBodyDesert",
    "petalSkull",
    "rotate(",
    "Ghost_4",
    "4th\x20September\x202023",
    "2nd\x20July\x202023",
    "petalWing",
    "defineProperty",
    "*Rock\x20health:\x2050\x20→\x2060",
    "contains",
    ".username-area",
    "tCkxW5FcNmkQ",
    "#38c125",
    ".shop-overlay",
    "Dragon_5",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "dir",
    "27th\x20February\x202024",
    "hasSpawnImmunity",
    "Ruined",
    "prepend",
    "Increased\x20map\x20size\x20by\x2030%.",
    "19th\x20June\x202023",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    ".shop",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    "requestAnimationFrame",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    "Nerfed\x20Spider\x20Yoba.",
    "Starfish",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    "Changes\x20to\x20anti-lag\x20system:",
    "code",
    "substr",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    "rgb(134,\x2031,\x20222)",
    "rgba(0,0,0,0.3)",
    "Server-side\x20optimizations.",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "gcldSq",
    "Spider_1",
    "1332519gpTkiA",
    ".minimap-dot",
    "insertBefore",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "e8oQW7VdPKa",
    "Rock_1",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    "<div\x20class=\x22chat-item\x22></div>",
    "nerd",
    "yellow",
    ".waveroom-info",
    "render",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    "from",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "settings",
    "hasSpiderLeg",
    "text",
    "honeyTile",
    "#cfbb50",
    "Pollen",
    "WOpcHSkuCtriW7/dJG",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "animationDirection",
    "score",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "centipedeHead",
    ".timer",
    "hsl(60,60%,30%)",
    "*Peas\x20damage:\x208\x20→\x2010",
    "18th\x20September\x202023",
    "]\x22></div>",
    "Kills",
    "getTitleEl",
    "#eeeeee",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    ".dialog-content",
    "checked",
    "M28",
    "Scorpion",
    ".tv-next",
    "https://www.youtube.com/@FussySucker",
    ".textbox",
    "[G]\x20Show\x20Grid:\x20",
    "opacity",
    "\x0a\x0a\x09\x09\x09",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "New\x20rarity:\x20Hyper.",
    "Rock_6",
    ".active",
    "parentNode",
    "dSk+d0afnmo5WODJW6zQxW",
    "uiHealth",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "4th\x20July\x202023",
    ".damage-cb",
    "drops",
    "lottery",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    "addEventListener",
    "Increases\x20flower\x27s\x20health\x20power.",
    "isFakeChat",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "reverse",
    "bruh",
    "*Arrow\x20health:\x20180\x20→\x20220",
    "copyright\x20striked",
    "Beehive",
    "#4343a4",
    ".leave-btn",
    ".server-area",
    "Rice",
    "Breed\x20Strength",
    "powderPath",
    "Dice",
    "side",
    "Dark\x20Ladybug",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    "uniqueIndex",
    "poisonDamage",
    "Hyper",
    "charAt",
    "#ff63eb",
    "px\x20",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "length",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "Spawns",
    "centipedeBodyPoison",
    "Fonts\x20loaded!",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "hpRegen75PerSecF",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "transform",
    "#cccccc",
    "msgpack",
    "qmklWO4",
    "fireDamageF",
    "https://ipapi.co/json/",
    "padStart",
    "#bb3bc2",
    ".absorb\x20.dialog-content",
    "ur\x20pe",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "petHealF",
    "New\x20mob:\x20Fossil.",
    "*Yoba\x20Egg\x20buff.",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "sameTypeColResolveOnly",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "Rock",
    "*Rock\x20health:\x20120\x20→\x20150",
    "15584076IAHWRs",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "26th\x20June\x202023",
    "metaData",
    "Waveroom",
    "Heart",
    ".claimer",
    "30th\x20June\x202023",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "petalPoo",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "text/plain;charset=utf-8;",
    "%;left:",
    "Nigerian\x20Ladybug.",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    ".builds",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    ".dc-group",
    "absolute",
    "location",
    "Nerfs:",
    "New\x20score\x20formula.",
    "localStorage\x20denied.",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "*Increased\x20drop\x20rates.",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "stats",
    "Orbit\x20Dance",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "mushroomPath",
    "ctx",
    "\x22\x20stroke=\x22",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "*Powder\x20damage:\x2015\x20→\x2020",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    ".insta-btn",
    "exp",
    ".featured",
    ".grid-cb",
    "changedTouches",
    "petalLight",
    "weedSeed",
    "year",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "armor",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    "motionKind",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    ".copy-btn",
    "rkJNdF",
    "shift",
    "toLocaleDateString",
    "\x27s\x20Profile",
    "/hqdefault.jpg)",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    ".settings-btn",
    "<div\x20",
    "3336680ZmjFAG",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "Username\x20claimed!",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    "\x20petals\x22></div>\x0a\x09\x09\x09\x09\x09</div>",
    "Added\x20Shop.",
    "Skull",
    "damageF",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    "Yin\x20Yang",
    "doLerpEye",
    "*Snail\x20damage:\x2020\x20→\x2025",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "pro",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    "rgb(43,\x20255,\x20163)",
    "fonts",
    "%nick%",
    "antennae",
    "#111",
    "Faster",
    "#393cb3",
    "Nitro",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    ".inventory-btn",
    "projAffectHealDur",
    "restore",
    "projAngle",
    "trim",
    "onStart",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    "Sandstorm_3",
    "showItemLabel",
    "#7d893e",
    "iCraft",
    "oAngle",
    "Passively\x20regenerates\x20your\x20health.",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    "Kills\x20Needed",
    "https://auth.hornex.pro/discord",
    "rgb(77,\x2082,\x20227)",
    "setUint16",
    "#222222",
    "11th\x20August\x202023",
    "<div\x20class=\x22data-search-item\x22>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22#",
    ".player-count",
    "petalBone",
    "Basic",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "rando",
    "ion",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    "deg)\x20scale(",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "g\x20on\x20",
    "#999",
    "moveFactor",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    "Yourself",
    ".collected-petals",
    "\x20ago",
    "krBw",
    "\x20accounts",
    "mousedown",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    "(auto\x20reloading\x20in\x20",
    "#f2b971",
    ".show-scoreboard-cb",
    "XCN6",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    "\x20domain=.hornex.pro",
    "textAlign",
    "encode",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "petalDandelion",
    "*Banana\x20damage:\x201\x20→\x202",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "saved_builds",
    "DMCA",
    "#ceea33",
    "Flower\x20Poison",
    "6th\x20August\x202023",
    "rgba(0,0,0,0.2)",
    "avacado",
    "bsorb",
    "Stinger",
    "match",
    "Red\x20ball.",
    "marginTop",
    "1841224gIAuLW",
    "petalShrinker",
    "rotate",
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    "small\x20full",
    "uiCountGap",
    "Yoba_4",
    "show_debug_info",
    "*Fire\x20health:\x2070\x20→\x2080",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "Missile\x20Health",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    "mob_",
    "petalPincer",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "Health",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    "W5bKgSkSW78",
    "#735d5f",
    "NHkBqi",
    "turtleF",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    "rgb(92,\x20116,\x20176)",
    "uwu",
    "Soldier\x20Ant_4",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    ".petal",
    "and\x20a",
    "craft-disable",
    "heart",
    "setCount",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "Legendary",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    "Connecting\x20to\x20",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    "*Snail\x20Health:\x20180\x20→\x20120",
    "\x20at\x20least!",
    "http://localhost:6767/",
    "Shrinker",
    "local",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    "23rd\x20July\x202023",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "Nitro\x20Boost",
    "petalSword",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "petalWave",
    "petalStickbug",
    "ArrowRight",
    "WP3dRYddTJC",
    "scale",
    ".right-align-petals-cb",
    "\x20petals",
    ".chat",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "canvas",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "extraRange",
    "#5b4d3c",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    "12th\x20July\x202023",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    "1st\x20February\x202024",
    "misReflectDmgFactor",
    "sendBadMsg",
    "*Bone\x20armor:\x204\x20→\x205",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "murdered",
    "petalCotton",
    "Rock_4",
    "usernameClaimed",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    "replace",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "hyperPlayers",
    "Poop\x20Damage",
    "Rare",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    ".watch-ad",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "\x20!important;}",
    "US\x20#2",
    "#efc99b",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "#4e3f40",
    "eu_ffa",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    "Space",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "toFixed",
    "#69371d",
    ".builds-btn",
    "Chromosome",
    "innerHeight",
    "Former\x20student\x20of\x20Yoda.",
    "27th\x20June\x202023",
    "setTargetByEvent",
    "Spider_5",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "Poison",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "flors",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    "ount\x20",
    "nt\x20an",
    "barEl",
    "spin",
    "4737840bbItax",
    "*Removed\x20Ultra\x20wave.",
    "quadraticCurveTo",
    ".inventory\x20.inventory-petals",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "#d3d14f",
    "#7777ff",
    "show_population",
    "Wave",
    "nLrqsbisiv0SrmoD",
    "Absorb",
    "Rock\x20Egg",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "It\x20likes\x20to\x20dance.",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "long",
    "title",
    "resize",
    "#ebeb34",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    "querySelector",
    ".\x22></span></div>",
    "Statue",
    "Much\x20heavier\x20than\x20your\x20mom.",
    "makeLadybug",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    "getUint8",
    "\x20petal",
    "*Gas\x20poison:\x2030\x20→\x2040",
    "Heavier\x20than\x20your\x20mom.",
    "\x20radians",
    "\x20HP",
    "Fussy\x20Sucker",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    "Craft",
    "#9fab2d",
    "breedTimer",
    "Added\x20video\x20ad.",
    "10th\x20August\x202023",
    "iChat",
    "\x22>Page\x20#",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    "Poop\x20colored\x20Ladybug.",
    "iDepositPetal",
    "projPoisonDamageF",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "pickupRangeTiers",
    "#962921",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "rock",
    "WQpcUmojoSo6",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "closePath",
    "has\x20ended.",
    "iReqUserProfile",
    "drawIcon",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    "nt.\x20H",
    "points",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    "Summons\x20the\x20power\x20of\x20wind.",
    "hpRegen",
    "blur",
    "sqrt",
    "#b0c0ff",
    "<div\x20class=\x22dialog\x20tier-",
    "randomUUID",
    "kbps",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "*Ultra:\x20125+",
    "Spider\x20Legs",
    "keyup",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "warne",
    "=([^;]*)",
    "KGw#",
    "#854608",
    "KeyD",
    "100%",
    ".lb",
    "doShow",
    "#b53229",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    ".lottery",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "background",
    "petalHoney",
    "oHealth",
    "oncontextmenu",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    "altKey",
    "portalPoints",
    "10OFgRDy",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "clientHeight",
    "data",
    "Account\x20import/export\x20UI\x20redesigned.",
    "u\x20are",
    "petalFire",
    "http",
    "#a17c4c",
    "imageSmoothingEnabled",
    "hypot",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "getAttribute",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    "marginLeft",
    "lastElementChild",
    "transition",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    "*Hyper:\x20175+",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    "New\x20mob:\x20Nigersaurus.",
    "/dlPetal",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "anti_spam",
    "Dragon\x20Nest",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "Increases",
    "#3f1803",
    "Q2mA",
    "hsla(0,0%,100%,0.25)",
    ";\x22\x20stroke=\x22",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    "accou",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "shadowBlur",
    "mood",
    "#dc704b",
    "projSpeed",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "(total\x20",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    "Makes\x20you\x20poisonous.",
    ".collected-rarities",
    "Soldier\x20Ant_5",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "beaten\x20to\x20death",
    ".gamble-petals-btn",
    "0\x200",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "iAngle",
    "keyClaimed",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    "lobbyClosing",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "#fc5c5c",
    "#ffe763",
    "New\x20mob:\x20Sponge",
    "Increases\x20petal\x20spin\x20speed.",
    ".game-stats",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    "antHole",
    "cmk+c0aoqSoLWQrQW6Tx",
    "Sandstorm_2",
    "petalSunflower",
    "#8d9acc",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "*Cement\x20health:\x2080\x20→\x20100",
    "/weborama.js",
    "Ancester\x20of\x20flowers.",
    "indexOf",
    "Centipede",
    ".terms-btn",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "isTrusted",
    "filter",
    "\x20and\x20",
    "breedPower",
    "none",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "#8f5f34",
    "#c1a37d",
    "userCount",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    "poisonT",
    "Sponge",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    "Added\x201\x20more\x20EU\x20lobby.",
    "getUint32",
    "petalPea",
    "petal",
    "Mob\x20Agro\x20Range",
    ".mobs-btn",
    "forEach",
    "kers\x20",
    "horne",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "#dbab2e",
    "Spider_2",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    "15807WcQReK",
    "ICIAL",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "continent_code",
    "backgroundImage",
    "Bounces",
    "Extra\x20Speed",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "legD",
    "deltaY",
    "isInventoryPetal",
    "e\x20bee",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "#ada25b",
    "ready",
    "#cf7030",
    "bolder\x2017px\x20",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    ".discord-user",
    "\x20Ultra",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    "portal",
    "getContext",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "swapped",
    "petHeal",
    "cacheRendered",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    "Added\x20banner\x20ads.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "\x20+\x20",
    "countTiers",
    "Yoba",
    "maxLength",
    "\x22></div>\x0a\x09\x09\x09",
    ".absorb-petals-btn",
    "parse",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    ".rewards",
    ".play-btn",
    "waveNumber",
    "Ladybug",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    "petalMissile",
    "show-petal",
    "\x20clie",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    "useTime",
    "Fixed\x20players\x20pushing\x20eachother.",
    "Missile",
    ".grid\x20.title",
    "28th\x20December\x202023",
    "getFloat32",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    "tals.",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "dev",
    "WPfQmmoXFW",
    ".import-btn",
    "no-icon",
    "Has\x20fungal\x20infection\x20gg",
    ".rewards\x20.dialog-content",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    "object",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    "#76ad45",
    "petalYobaEgg",
    ".yes-btn",
    "eyeX",
    "WR7cQCkf",
    "***",
    "Fire\x20Ant",
    "consumeProjHealthF",
    "ceil",
    ".inventory-petals",
    "cos",
    "makeSponge",
    "Unknown\x20message\x20id:\x20",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "26th\x20January\x202024",
    "#a44343",
    "style",
    "show_helper",
    "admin_pass",
    "petalerDrop",
    "bezierCurveTo",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "Hornet_4",
    "server",
    "Beetle_5",
    "\x20players\x20•\x20",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "wss://",
    "petalRockEgg",
    ".scores",
    "nHealth",
    "pop",
    ".score-overlay",
    "OQM)",
    "hsla(0,0%,100%,0.4)",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    "oceed",
    ".no-btn",
    "cactus",
    "petalFaster",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "consumeProj",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "Dragon_4",
    "#d3ad46",
    "Unusual",
    "Beetle",
    "sad",
    "Salt",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "workerAnt",
    "<span\x20style=\x22color:",
    "nSize",
    "#fcfe04",
    "#cb37bf",
    "updateProg",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "petalDrop",
    "shieldRegenPerSecF",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    "Sprite",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    "ages.",
    "*Light\x20damage:\x2013\x20→\x2012",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    "z8kgrX3dSq",
    "createObjectURL",
    "*Heavy\x20damage:\x209\x20→\x2010",
    ";position:absolute;top:",
    "rgba(0,0,0,0.08)",
    "shieldHpLosePerSec",
    "numeric",
    "Invalid\x20petal\x20name:\x20",
    "countEl",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "NSlTg",
    "flipDir",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "WRZdV8kNW5FcHq",
    "clientY",
    "particle_heart_",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "j[zf",
    "nigersaurus",
    "sword",
    "parts",
    "#8a6b1f",
    "></div>",
    "New\x20mob:\x20Tumbleweed.",
    "hasSwastika",
    "setValue",
    "#ffd363",
    "Hornet_2",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    "Failed\x20to\x20load\x20game\x20stats!",
    "petalWeb",
    "Retardation\x20Duration",
    "drawSnailShell",
    "ing\x20o",
    ".absorb-clear-btn",
    "#503402",
    "*Ultra:\x201-5",
    "#fbdf26",
    "centipedeHeadDesert",
    ".stats\x20.dialog-content",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "#654a19",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    "27th\x20July\x202023",
    "m28",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "gambleList",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    "gameStats",
    "cmk/auqmq8o8WOngW79c",
    "random",
    "addGroupNumbers",
    "prototype",
    ".clown",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "<div>",
    "playerList",
    "https://stats.hornex.pro/",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    "\x20Wave\x20",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    "body",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    "isSwastika",
    "crafted",
    "killsNeeded",
    "deadPreDraw",
    "Your\x20Profile",
    "17th\x20June\x202023",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    "),0)",
    ".download-btn",
    "Pill",
    "retardDuration",
    "angry",
    "120QIenDn",
    "absorbDamage",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    "5th\x20September\x202023",
    "Air",
    ".lottery-btn",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    "honeyDmgF",
    "show_scoreboard",
    "isClown",
    "stickbugBody",
    "duration",
    "Game\x20released\x20to\x20public!",
    "#5ef64f",
    "slice",
    "download",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    ":scope\x20>\x20.petal",
    "localId",
    "iCheckKey",
    "url(https://i.ytimg.com/vi/",
    "iPing",
    "AS\x20#2",
    "petSizeChangeFactor",
    "lightblue",
    "toLocaleString",
    "children",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    ".zone-mobs",
    "W6HBdwO0",
    ".tier-",
    "px)",
    "setUint8",
    "#29f2e5",
    "isProj",
    "querySelectorAll",
    ".clown-cb",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "encod",
    "Bush",
    "rgba(0,\x200,\x200,\x200.2)",
    "16th\x20September\x202023",
    "2-digit",
    "*Iris\x20poison:\x2045\x20→\x2050",
    "Sandbox",
    "pedoxMain",
    "rnex.",
    ";-moz-background-position:\x20",
    "hide",
    "remove",
    "New\x20mob:\x20Furry.",
    "other",
    "powderTime",
    "enable_shake",
    "Removed\x20EU\x20#3.",
    "#ce79a2",
    "assassinated",
    "affectMobHeal",
    "number",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x20no-hide\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "*Turtle\x20health\x20500\x20→\x20600",
    "adplayer",
    "lient",
    "Password\x20downloaded!",
    "LEAVE\x20ZONE!!",
    "fovFactor",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    "wave",
    "bqpdSW",
    "\x20from\x20",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    "Beetle_2",
    "#ebda8d",
    "Hornet_5",
    "petalIris",
    "\x20Blue",
    "sin",
    "min",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    "#e94034",
    "PedoX",
    "n\x20an\x20",
    "kWicW5FdMW",
    "rgb(255,\x20230,\x2093)",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    "sortGroupItems",
    "rgb(237\x2061\x20234)",
    "oProg",
    "Cactus",
    "<div\x20class=\x22btn\x22>\x0a\x09\x09\x09\x09<span\x20stroke=\x22",
    "makeAntenna",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    "extraSpeedTemp",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    "Zert",
    "#fdda40",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    "btn",
    "https://www.youtube.com/@KePiKgamer",
    "isBoomerang",
    "toString",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    "Fixed\x20another\x20crafting\x20exploit.",
    "onmessage",
    "22nd\x20July\x202023",
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    ".scale-cb",
    "iSwapPetalRow",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "3WRI",
    "layin",
    "#d3bd46",
    ".tabs",
    "Sandstorm_5",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "Missile\x20Damage",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    ".builds\x20.dialog-content",
    "Ears",
    "clearRect",
    "petCount",
    "Connected!",
    "#8ac355",
    "hoq5",
    "cde9W5NdTq",
    "mobId",
    "Wave\x20Starting...",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "executed",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "Removed\x20Centipedes\x20from\x20waves.",
    "url(",
    "isCentiBody",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "rgb(81\x20121\x20251)",
    "Beetle_4",
    "#5ec13a",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "choked",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    "<div\x20class=\x22btn\x20tier-",
    ".video",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "spinSpeed",
    "isLightning",
    "update",
    "position",
    "extraSpeed",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "*Super:\x205-15",
    "Ant\x20Hole",
    "updatePos",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "iJoin",
    "qCkBW5pcR8kD",
    "#8ac255",
    "Honey\x20Range",
    "roundRect",
    "find",
    "Added\x20Shiny\x20mobs:",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "KeyR",
    "updateTime",
    "\x20no-icon\x22\x20",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    "#400",
    "rgb(222,111,44)",
    "Shield\x20Reuse\x20Cooldown",
    "#8f5db0",
    "oiynC",
    "hasHearts",
    "Orbit\x20Shlongation",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    "Range",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "\x20stea",
    "#ab5705",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    ".petal-count",
    "lastResizeTime",
    "removeChild",
    "Flower\x20Damage",
    "hide-zone-mobs",
    "nShield",
    ".id-group",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "A\x20default\x20petal.",
    ".username-input",
    "size",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "sk.",
    "Bubble",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "usernameTaken",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "s.\x20Yo",
    "9th\x20July\x202023",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "scorp",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "isAggressive",
    ".chat-content",
    ".petals.small",
    "fillRect",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    ".box",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    "petalSpiderEgg",
    "u\x20hav",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "*Recuded\x20mob\x20count.",
    "#b0473b",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    "<style>\x0a\x09\x09",
    "18th\x20July\x202023",
    "Lobby\x20Closing...",
    "OFFIC",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "WQ7dTmk3W6FcIG",
    "iSwapPetal",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    ".gamble-prediction",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    "#853636",
    "clip",
    "8th\x20July\x202023",
    "Cotton\x20bush.",
    "translate",
    "Sword",
    "hideAfterInactivity",
    "neutral",
    "Copied!",
    ".switch-btn",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    ".logout-btn",
    "https://www.youtube.com/@IAmLavaWater",
    ".petals",
    ".key-input",
    "userProfile",
    "#288842",
    "\x20(Lvl\x20",
    ".fixed-name-cb",
    "petalSwastika",
    "renderBelowEverything",
    "isArray",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    "#ab7544",
    ".keyboard-cb",
    "<div\x20class=\x22chat-text\x22>",
    "fire\x20ant",
    "#79211b",
    "moveCounter",
    "curePoison",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    "WPPnavtdUq",
    "<div>\x0a\x09\x09<span\x20stroke=\x22",
    "Petal\x20",
    "3YHM",
    "#ce76db",
    "bolder\x2025px\x20",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    "5th\x20August\x202023",
    "Ghost_3",
    "translate(calc(",
    ".absorb-btn",
    "14th\x20August\x202023",
    ")\x20rotate(",
    "*Peas\x20damage:\x2015\x20→\x2020",
    ".absorb-petals",
    "close",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    "reduce",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    "New\x20setting:\x20UI\x20Scale.",
    "pZWkWOJdLW",
    "Getting\x20",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "Health\x20Depletion",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    "*Super:\x20180",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "innerHTML",
    "gem",
    ".death-info",
    ".swap-btn",
    "loggedIn",
    "<div\x20class=\x22petal\x20tier-",
    "User",
    "button",
    "iClaimUsername",
    "Added\x20Lottery.",
    "W5OTW6uDWPScW5eZ",
    "count",
    "Disconnected.",
    ".ui-scale\x20select",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    ".lottery-users",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    "spawnOnDie",
    "\x20won\x20and\x20got\x20extra",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    "en-US",
    "*Hyper:\x202%\x20→\x201%",
    "toUpperCase",
    "miter",
    "name",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    "#39b54a",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    ".flower-stats",
    "<div\x20class=\x22petal-container\x22></div>",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "New\x20mob:\x20Pedox",
    "1st\x20April\x202024",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    "#695118",
    "clientX",
    "mobGallery",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "renderOverEverything",
    "started!",
    "Flower\x20Health",
    "yoba",
    "WRzmW4bPaa",
    "/s\x20if\x20H<50%",
    "c)H[",
    "Created\x20changelog.",
    "#8b533f",
    "Downloaded!",
    "compression\x20version\x20not\x20supported:\x20",
    "damage",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    "documentElement",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "Desert\x20Centipede",
    "Swastika",
    "\x20$1",
    "queen",
    "15th\x20June\x202023",
    "*Arrow\x20damage:\x203\x20→\x204",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    "*Turtle\x20health:\x20600\x20→\x20900",
    ".clear-build-btn",
    "createPattern",
    "sortGroups",
    "ArrowLeft",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "static",
    "Sandstorm",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "lineJoin",
    "isDead",
    "#d6b936",
    "Ghost_2",
    "disabled",
    "uiY",
    "shieldRegenPerSec",
    "Increased\x20shiny\x20mob\x20size.",
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "Worker\x20Ant",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    "Heal",
    "#eee",
    "2772301LQYLdH",
    "d8k3BqDKF8o0WPu",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "affectMobHealDur",
    "#d0bb55",
    "\x27s\x20profile...",
    "Cotton",
    "KeyX",
    "#f54ce7",
    ".changelog-btn",
    "version",
    "devicePixelRatio",
    "toggle",
    "invalid\x20uuid",
    "onmouseup",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "nameEl",
    "Super\x20Players",
    "worldH",
    "petalAntidote",
    ".shake-cb",
    "\x20play",
    "Ghost_7",
    "arial",
    "Error\x20refreshing\x20ad.",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "\x22></span>",
    "Fossil",
  ];
  a = function () {
    return Ci;
  };
  return a();
}
