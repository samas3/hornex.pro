
const $ = (i) => document.getElementById(i);
const $_ = (i) => document.querySelector(i);
class HornexHack{
  constructor(){
    this.version = '1.11';
    this.config = {};
    this.default = {
      damageDisplay: true, // 伤害显示修改
      DDenableNumber: true, // 显示伤害数值而不是百分比（若可用）
      healthDisplay: true, // 血量显示
      disableChatCheck: true, // 是否禁用聊天内容检查
      autoRespawn: true, // 自动重生
      colorText: false, // 公告彩字
      numberNoSuffix: true, // 经验条优化
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
  getHP(mob) {
    var tier = mob['tier'],
      type = mob['type'];
    var lst = this.moblst;
    if(mob.isCentiBody) type--;
    if (!lst[tier] || tier >= lst.length) return;
    for (var i = 0; i < lst[tier].length; i++) {
      var j = lst[tier][i];
      if (type == j['type']) return j['health'];
    }
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
(function (c, d) {
  const us = b,
    e = c();
  while (!![]) {
    try {
      const f =
        -parseInt(us(0x944)) / 0x1 +
        (parseInt(us(0xf39)) / 0x2) * (parseInt(us(0x5b9)) / 0x3) +
        parseInt(us(0xbf2)) / 0x4 +
        (-parseInt(us(0x791)) / 0x5) * (-parseInt(us(0xf38)) / 0x6) +
        (-parseInt(us(0x46d)) / 0x7) * (-parseInt(us(0x815)) / 0x8) +
        parseInt(us(0x7b8)) / 0x9 +
        (-parseInt(us(0x74d)) / 0xa) * (parseInt(us(0x61e)) / 0xb);
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0xb9ca3),
  (() => {
    const ut = b;
    var cG = 0x2710,
      cH = 0x1e - 0x1,
      cI = { ...cV(ut(0xa09)), ...cV(ut(0xeab)) },
      cJ = 0x93b,
      cK = 0x10,
      cL = 0x3c,
      cM = 0x10,
      cN = 0x3,
      cO = /^[a-zA-Z0-9_]+$/,
      cP = /[^a-zA-Z0-9_]/g,
      cQ = cV(ut(0xe28)),
      cR = cV(ut(0x25f)),
      cS = cV(ut(0x583)),
      cT = cV(ut(0x3da)),
      cU = cV(ut(0xa19));
    function cV(r4) {
      const uu = ut,
        r5 = r4[uu(0xda2)]("\x20"),
        r6 = {};
      for (let r7 = 0x0; r7 < r5[uu(0xed7)]; r7++) {
        r6[r5[r7]] = r7;
      }
      return r6;
    }
    var cW = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cX = {};
    (cX[ut(0x987)] = 0x0), (cX[ut(0x5d4)] = 0x1), (cX[ut(0xb83)] = 0x2);
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
    function d2(r4) {
      const uv = ut;
      return 0x14 * Math[uv(0x7ce)](r4 * 1.05 ** (r4 - 0x1));
    }
    var d3 = [
      0x1, 0x5, 0x32, 0x1f4, 0x2710, 0x7a120, 0x2faf080, 0x12a05f200,
      0xe8d4a51000,
    ];
    function d4(r4) {
      let r5 = 0x0,
        r6 = 0x0;
      while (!![]) {
        const r7 = d2(r5 + 0x1);
        if (r4 < r6 + r7) break;
        (r6 += r7), r5++;
      }
      return [r5, r6];
    }
    function d5(r4) {
      const uw = ut;
      let r5 = 0x5,
        r6 = 0x5;
      while (r4 >= r6) {
        r5++, (r6 += Math[uw(0xc36)](0x1e, r6));
      }
      return r5;
    }
    function d6(r4) {
      const ux = ut;
      return Math[ux(0xe12)](0xf3, Math[ux(0xc36)](r4, 0xc7) / 0xc8);
    }
    function d7() {
      return d8(0x100);
    }
    function d8(r4) {
      const r5 = Array(r4);
      while (r4--) r5[r4] = r4;
      return r5;
    }
    var d9 = cV(ut(0x868)),
      da = Object[ut(0x520)](d9),
      db = da[ut(0xed7)] - 0x1,
      dc = db;
    function dd(r4) {
      const uy = ut,
        r5 = [];
      for (let r6 = 0x1; r6 <= dc; r6++) {
        r5[uy(0xbc0)](r4(r6));
      }
      return r5;
    }
    const de = {};
    (de[ut(0x6ac)] = 0x0),
      (de[ut(0x9b3)] = 0x1),
      (de[ut(0x2b2)] = 0x2),
      (de[ut(0xcc5)] = 0x3),
      (de[ut(0x393)] = 0x4),
      (de[ut(0x36d)] = 0x5),
      (de[ut(0xa9a)] = 0x6),
      (de[ut(0xee8)] = 0x7),
      (de[ut(0x2f0)] = 0x8);
    var df = de;
    function dg(r4, r5) {
      const uz = ut;
      return Math[uz(0xe12)](0x3, r4) * r5;
    }
    const dh = {};
    (dh[ut(0x8ca)] = cS[ut(0xaee)]),
      (dh[ut(0xd8b)] = ut(0x623)),
      (dh[ut(0x31a)] = 0xa),
      (dh[ut(0x23b)] = 0x0),
      (dh[ut(0x4d8)] = 0x1),
      (dh[ut(0x379)] = 0x1),
      (dh[ut(0xa1a)] = 0x3e8),
      (dh[ut(0xe06)] = 0x0),
      (dh[ut(0xe21)] = ![]),
      (dh[ut(0x3d2)] = 0x1),
      (dh[ut(0xdbf)] = ![]),
      (dh[ut(0xa7a)] = 0x0),
      (dh[ut(0xd76)] = 0x0),
      (dh[ut(0xeba)] = ![]),
      (dh[ut(0xc38)] = 0x0),
      (dh[ut(0x5d2)] = 0x0),
      (dh[ut(0xd79)] = 0x0),
      (dh[ut(0xcf9)] = 0x0),
      (dh[ut(0xee2)] = 0x0),
      (dh[ut(0x3e7)] = 0x0),
      (dh[ut(0x2cf)] = 0x1),
      (dh[ut(0x340)] = 0xc),
      (dh[ut(0x66a)] = 0x0),
      (dh[ut(0x204)] = ![]),
      (dh[ut(0x299)] = void 0x0),
      (dh[ut(0x7bf)] = ![]),
      (dh[ut(0xb13)] = 0x0),
      (dh[ut(0xb98)] = ![]),
      (dh[ut(0x99c)] = 0x0),
      (dh[ut(0xaf5)] = 0x0),
      (dh[ut(0x754)] = ![]),
      (dh[ut(0x889)] = 0x0),
      (dh[ut(0x6b8)] = 0x0),
      (dh[ut(0xb59)] = 0x0),
      (dh[ut(0x257)] = ![]),
      (dh[ut(0xe43)] = 0x0),
      (dh[ut(0x79b)] = ![]),
      (dh[ut(0x3f4)] = ![]),
      (dh[ut(0x7b1)] = 0x0),
      (dh[ut(0x487)] = 0x0),
      (dh[ut(0x4fb)] = 0x0),
      (dh[ut(0x860)] = ![]),
      (dh[ut(0xac7)] = 0x1),
      (dh[ut(0xbe8)] = 0x0),
      (dh[ut(0xf4a)] = 0x0),
      (dh[ut(0x53d)] = 0x0),
      (dh[ut(0x476)] = 0x0),
      (dh[ut(0x59a)] = 0x0),
      (dh[ut(0x9ba)] = 0x0),
      (dh[ut(0x29a)] = 0x0),
      (dh[ut(0x811)] = 0x0),
      (dh[ut(0x4fa)] = 0x0),
      (dh[ut(0x46f)] = 0x0),
      (dh[ut(0x790)] = 0x0),
      (dh[ut(0xa1d)] = 0x0),
      (dh[ut(0x2af)] = 0x0),
      (dh[ut(0xf01)] = 0x0),
      (dh[ut(0x262)] = ![]),
      (dh[ut(0x39c)] = 0x0),
      (dh[ut(0x51b)] = 0x0),
      (dh[ut(0xddf)] = 0x0);
    var di = dh;
    const dj = {};
    (dj[ut(0x244)] = ut(0x647)),
      (dj[ut(0xd8b)] = ut(0x841)),
      (dj[ut(0x8ca)] = cS[ut(0xaee)]),
      (dj[ut(0x31a)] = 0x9),
      (dj[ut(0x4d8)] = 0xa),
      (dj[ut(0x379)] = 0xa),
      (dj[ut(0xa1a)] = 0x9c4);
    const dk = {};
    (dk[ut(0x244)] = ut(0xa17)),
      (dk[ut(0xd8b)] = ut(0x4ba)),
      (dk[ut(0x8ca)] = cS[ut(0x5c6)]),
      (dk[ut(0x31a)] = 0xd / 1.1),
      (dk[ut(0x4d8)] = 0x2),
      (dk[ut(0x379)] = 0x37),
      (dk[ut(0xa1a)] = 0x9c4),
      (dk[ut(0xe06)] = 0x1f4),
      (dk[ut(0xdbf)] = !![]),
      (dk[ut(0x3ea)] = 0x28),
      (dk[ut(0xd76)] = Math["PI"] / 0x4);
    const dl = {};
    (dl[ut(0x244)] = ut(0x666)),
      (dl[ut(0xd8b)] = ut(0xd8f)),
      (dl[ut(0x8ca)] = cS[ut(0xd91)]),
      (dl[ut(0x31a)] = 0x8),
      (dl[ut(0x4d8)] = 0x5),
      (dl[ut(0x379)] = 0x5),
      (dl[ut(0xa1a)] = 0xdac),
      (dl[ut(0xe06)] = 0x3e8),
      (dl[ut(0xa7a)] = 0xb),
      (dl[ut(0x257)] = !![]);
    const dm = {};
    (dm[ut(0x244)] = ut(0xc26)),
      (dm[ut(0xd8b)] = ut(0x27b)),
      (dm[ut(0x8ca)] = cS[ut(0xd37)]),
      (dm[ut(0x31a)] = 0x6),
      (dm[ut(0x4d8)] = 0x5),
      (dm[ut(0x379)] = 0x5),
      (dm[ut(0xa1a)] = 0xfa0),
      (dm[ut(0xe21)] = !![]),
      (dm[ut(0x3d2)] = 0x32);
    const dn = {};
    (dn[ut(0x244)] = ut(0x80a)),
      (dn[ut(0xd8b)] = ut(0xa7b)),
      (dn[ut(0x8ca)] = cS[ut(0xf2d)]),
      (dn[ut(0x31a)] = 0xb),
      (dn[ut(0x4d8)] = 0xc8),
      (dn[ut(0x379)] = 0x1e),
      (dn[ut(0xa1a)] = 0x1388);
    const dp = {};
    (dp[ut(0x244)] = ut(0x4db)),
      (dp[ut(0xd8b)] = ut(0x521)),
      (dp[ut(0x8ca)] = cS[ut(0xe81)]),
      (dp[ut(0x31a)] = 0x8),
      (dp[ut(0x4d8)] = 0x2),
      (dp[ut(0x379)] = 0xa0),
      (dp[ut(0xa1a)] = 0x2710),
      (dp[ut(0x340)] = 0xb),
      (dp[ut(0x66a)] = Math["PI"]),
      (dp[ut(0x9da)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dq = {};
    (dq[ut(0x244)] = ut(0xc0d)),
      (dq[ut(0xd8b)] = ut(0xa42)),
      (dq[ut(0x299)] = df[ut(0x6ac)]),
      (dq[ut(0x3e7)] = 0x1e),
      (dq[ut(0x99e)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dr = {};
    (dr[ut(0x244)] = ut(0xcb0)),
      (dr[ut(0xd8b)] = ut(0x7a0)),
      (dr[ut(0x299)] = df[ut(0x9b3)]);
    const ds = {};
    (ds[ut(0x244)] = ut(0x9a5)),
      (ds[ut(0xd8b)] = ut(0x264)),
      (ds[ut(0x8ca)] = cS[ut(0x86c)]),
      (ds[ut(0x31a)] = 0xb),
      (ds[ut(0xa1a)] = 0x9c4),
      (ds[ut(0x4d8)] = 0x14),
      (ds[ut(0x379)] = 0x8),
      (ds[ut(0xeba)] = !![]),
      (ds[ut(0xc38)] = 0x2),
      (ds[ut(0xc98)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (ds[ut(0x5d2)] = 0x14);
    const du = {};
    (du[ut(0x244)] = ut(0xf1e)),
      (du[ut(0xd8b)] = ut(0x3bd)),
      (du[ut(0x8ca)] = cS[ut(0x4fe)]),
      (du[ut(0x31a)] = 0xb),
      (du[ut(0x4d8)] = 0x14),
      (du[ut(0x379)] = 0x14),
      (du[ut(0xa1a)] = 0x5dc),
      (du[ut(0xcf9)] = 0x64),
      (du[ut(0x9cc)] = 0x1);
    const dv = {};
    (dv[ut(0x244)] = ut(0x48f)),
      (dv[ut(0xd8b)] = ut(0xd9d)),
      (dv[ut(0x8ca)] = cS[ut(0x8d1)]),
      (dv[ut(0x31a)] = 0x7),
      (dv[ut(0x4d8)] = 0x5),
      (dv[ut(0x379)] = 0xa),
      (dv[ut(0xa1a)] = 0x258),
      (dv[ut(0x2cf)] = 0x1),
      (dv[ut(0x204)] = !![]),
      (dv[ut(0x9da)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dw = {};
    (dw[ut(0x244)] = ut(0xda7)),
      (dw[ut(0xd8b)] = ut(0x934)),
      (dw[ut(0x8ca)] = cS[ut(0x697)]),
      (dw[ut(0x31a)] = 0xb),
      (dw[ut(0x4d8)] = 0xf),
      (dw[ut(0x379)] = 0x1),
      (dw[ut(0xa1a)] = 0x3e8),
      (dw[ut(0x7bf)] = !![]),
      (dw[ut(0x257)] = !![]);
    const dx = {};
    (dx[ut(0x244)] = ut(0xf44)),
      (dx[ut(0xd8b)] = ut(0x7c7)),
      (dx[ut(0x8ca)] = cS[ut(0x381)]),
      (dx[ut(0x31a)] = 0xb),
      (dx[ut(0x4d8)] = 0xf),
      (dx[ut(0x379)] = 0x5),
      (dx[ut(0xa1a)] = 0x5dc),
      (dx[ut(0xb13)] = 0x32),
      (dx[ut(0x5ed)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dy = {};
    (dy[ut(0x244)] = ut(0xbba)),
      (dy[ut(0xd8b)] = ut(0xf43)),
      (dy[ut(0x8ca)] = cS[ut(0x32f)]),
      (dy[ut(0x31a)] = 0x7),
      (dy[ut(0x4d8)] = 0x19),
      (dy[ut(0x379)] = 0x19),
      (dy[ut(0x2cf)] = 0x4),
      (dy[ut(0xa1a)] = 0x3e8),
      (dy[ut(0xe06)] = 0x1f4),
      (dy[ut(0x340)] = 0x9),
      (dy[ut(0xd76)] = Math["PI"] / 0x8),
      (dy[ut(0xdbf)] = !![]),
      (dy[ut(0x3ea)] = 0x28);
    const dz = {};
    (dz[ut(0x244)] = ut(0x5c5)),
      (dz[ut(0xd8b)] = ut(0x95c)),
      (dz[ut(0x8ca)] = cS[ut(0x7b6)]),
      (dz[ut(0x31a)] = 0x10),
      (dz[ut(0x4d8)] = 0x0),
      (dz[ut(0x663)] = 0x1),
      (dz[ut(0x379)] = 0x0),
      (dz[ut(0xa1a)] = 0x157c),
      (dz[ut(0xe06)] = 0x1f4),
      (dz[ut(0xc23)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dz[ut(0x8ee)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dz[ut(0x99c)] = 0x3c),
      (dz[ut(0xb98)] = !![]),
      (dz[ut(0x257)] = !![]);
    const dA = {};
    (dA[ut(0x244)] = ut(0x84f)),
      (dA[ut(0xd8b)] = ut(0xc8d)),
      (dA[ut(0x8ca)] = cS[ut(0x6eb)]),
      (dA[ut(0xa1a)] = 0x5dc),
      (dA[ut(0x754)] = !![]),
      (dA[ut(0x4d8)] = 0xa),
      (dA[ut(0x379)] = 0x14),
      (dA[ut(0x31a)] = 0xd);
    const dB = {};
    (dB[ut(0x244)] = ut(0x952)),
      (dB[ut(0xd8b)] = ut(0xcdc)),
      (dB[ut(0x8ca)] = cS[ut(0x6f8)]),
      (dB[ut(0xa1a)] = 0xdac),
      (dB[ut(0xe06)] = 0x1f4),
      (dB[ut(0x4d8)] = 0x5),
      (dB[ut(0x379)] = 0x5),
      (dB[ut(0x31a)] = 0xa),
      (dB[ut(0x889)] = 0x46),
      (dB[ut(0x709)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
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
        name: ut(0xdeb),
        desc: ut(0x8ed),
        ability: df[ut(0x2b2)],
        orbitRange: 0x32,
        orbitRangeTiers: dd((r4) => 0x32 + r4 * 0x46),
      },
      {
        name: ut(0x35e),
        desc: ut(0xde8),
        ability: df[ut(0xcc5)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dA,
      dB,
      {
        name: ut(0x3af),
        desc: ut(0xeef),
        type: cS[ut(0x98b)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][ut(0x86a)](
          (r4) => r4 * 0.8
        ),
      },
      {
        name: ut(0x846),
        desc: ut(0xc32),
        type: cS[ut(0xd37)],
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
        name: ut(0xa0c),
        desc: ut(0x305),
        type: cS[ut(0x5aa)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
        orbitSpeedFactor: 0.95,
        orbitSpeedFactorTiers: [0.94, 0.93, 0.92, 0.91, 0.9, 0.8, 0.7, 0.1],
      },
      {
        name: ut(0x6f0),
        desc: ut(0x742),
        type: cS[ut(0x804)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][ut(0x86a)](
          (r4) => r4 - 0.2
        ),
      },
      {
        name: ut(0x56d),
        desc: ut(0xd9e),
        type: cS[ut(0x209)],
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
        name: ut(0x8c4),
        desc: ut(0x286),
        type: cS[ut(0x7c6)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: ut(0xf12),
        desc: ut(0xc8a),
        type: cS[ut(0xce5)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: ut(0xea1),
        desc: ut(0x730),
        type: cS[ut(0x350)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: ut(0xf15),
        desc: ut(0xa92),
        type: cS[ut(0x996)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dD(![]),
      dD(!![]),
      {
        name: ut(0x75e),
        desc: ut(0xc78),
        type: cS[ut(0x609)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: ut(0x2f6),
        desc: ut(0x8ad),
        type: cS[ut(0xae2)],
        size: 0xa,
        healthF: 0xf,
        damageF: 0x14,
        respawnTime: 0x5dc,
        extraSpeed: 0x2,
        extraSpeedTiers: [0x4, 0x6, 0x8, 0xa, 0xc, 0xe, 0x10, 0x18],
        turbulence: 0x14,
        turbulenceTiers: dd((r4) => 0x14 + r4 * 0x50),
      },
      {
        name: ut(0xadb),
        desc: ut(0x426),
        type: cS[ut(0xd91)],
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
        name: ut(0x93b),
        desc: ut(0x8a4),
        type: cS[ut(0x3f9)],
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
        spawn: ut(0xdd8),
        spawnTiers: [
          ut(0x7c3),
          ut(0x63b),
          ut(0xbe0),
          ut(0xbe0),
          ut(0xa4c),
          ut(0xa11),
          ut(0xa11),
          ut(0x9ce),
        ],
      },
      {
        name: ut(0x9a2),
        desc: ut(0x337),
        type: cS[ut(0x9c8)],
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
        spawn: ut(0xc7b),
        spawnTiers: [
          ut(0x2da),
          ut(0x2da),
          ut(0xc11),
          ut(0x37c),
          ut(0x608),
          ut(0xd5c),
          ut(0xd5c),
          ut(0x2f2),
        ],
      },
      {
        name: ut(0x2b8),
        desc: ut(0xd98),
        type: cS[ut(0x3f9)],
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
        spawn: ut(0xf3c),
        spawnTiers: [
          ut(0x805),
          ut(0x805),
          ut(0xbfd),
          ut(0x8cb),
          ut(0x22f),
          ut(0x43d),
          ut(0x43d),
          ut(0x9a9),
        ],
      },
      {
        name: ut(0xded),
        desc: ut(0x8a1),
        type: cS[ut(0x9d5)],
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
        spawn: ut(0x2bc),
        spawnTiers: [
          ut(0x2bc),
          ut(0x7bb),
          ut(0x326),
          ut(0xb95),
          ut(0xd36),
          ut(0x572),
          ut(0x572),
          ut(0x85c),
        ],
      },
      {
        name: ut(0xe61),
        desc: ut(0x255),
        type: cS[ut(0x637)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: ut(0xac4),
        spawnTiers: [
          ut(0x9ac),
          ut(0x7e1),
          ut(0x7e1),
          ut(0x600),
          ut(0xbee),
          ut(0x2e3),
          ut(0x2e3),
          ut(0xba9),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: ut(0x7d4),
        desc: ut(0x4cf),
        type: cS[ut(0xb7c)],
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
        name: ut(0xb03),
        desc: ut(0xa62),
        type: cS[ut(0x26a)],
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
        name: ut(0x214),
        desc: ut(0x862),
        type: cS[ut(0x480)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: ut(0xf06),
        desc: ut(0x7c4),
        type: cS[ut(0x758)],
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
        name: ut(0x70b),
        desc: ut(0xc79),
        type: cS[ut(0xc57)],
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
        name: ut(0x40d),
        desc: ut(0x6ee),
        type: cS[ut(0xaf2)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: ut(0xc81),
        desc: ut(0x760),
        type: cS[ut(0x2bd)],
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
        name: ut(0x6d6),
        desc: ut(0xf29),
        ability: df[ut(0x393)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: ut(0x3ec),
        desc: ut(0x7cf),
        type: cS[ut(0xcb2)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: ut(0x9e2),
        desc: ut(0x587),
        type: cS[ut(0xda0)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: ut(0x784),
        desc: ut(0xb52),
        ability: df[ut(0x36d)],
        petHealF: 0x28,
      },
      {
        name: ut(0x4b7),
        desc: ut(0x654),
        ability: df[ut(0xa9a)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: ut(0xe39),
        type: cS[ut(0xb9e)],
        desc: ut(0x230),
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
        name: ut(0xe26),
        desc: ut(0xa2c),
        type: cS[ut(0xa4e)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: ut(0x59b),
        spawnTiers: [
          ut(0x353),
          ut(0xeeb),
          ut(0xeeb),
          ut(0x338),
          ut(0xd21),
          ut(0xabd),
          ut(0xabd),
          ut(0x99d),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: ut(0xbd0),
        desc: ut(0x949),
        type: cS[ut(0xcb1)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          ut(0x86a)
        ]((r4) => r4 / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: ut(0x8b9),
        desc: ut(0x8b7),
        type: cS[ut(0xe9d)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: ut(0x42f),
        desc: ut(0xdc8),
        type: cS[ut(0xd78)],
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
        name: ut(0x69f),
        desc: ut(0xf3b),
        type: cS[ut(0x9f1)],
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
        name: ut(0x2a1),
        desc: ut(0x3e5),
        type: cS[ut(0xc01)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: ut(0x877),
        desc: ut(0x48d),
        type: cS[ut(0x8df)],
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
        name: ut(0x570),
        desc: ut(0x720),
        type: cS[ut(0xac0)],
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
        consumeProjType: cS[ut(0x26a)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: ut(0x573),
        desc: ut(0xd24),
        type: cS[ut(0x593)],
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
        name: ut(0x5f0),
        desc: ut(0xa20),
        type: cS[ut(0xb8b)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: ut(0xf08),
        spawnTiers: [
          ut(0xd20),
          ut(0x494),
          ut(0x494),
          ut(0x7b3),
          ut(0xb86),
          ut(0xeac),
          ut(0x368),
          ut(0x4cd),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: ut(0xb39), desc: ut(0xf16), ability: df[ut(0xee8)] },
      {
        name: ut(0x741),
        desc: ut(0x318),
        type: cS[ut(0xb8d)],
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
        name: ut(0x3b1),
        desc: ut(0x4a2),
        type: cS[ut(0xc91)],
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
        name: ut(0x801),
        desc: ut(0xa39),
        type: cS[ut(0x215)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: ut(0x83a),
        desc: ut(0x6c1),
        type: cS[ut(0xd1e)],
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
        name: ut(0x580),
        desc: ut(0x6f2),
        type: cS[ut(0x5b0)],
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
        name: ut(0x35f),
        desc: ut(0x534),
        type: cS[ut(0x378)],
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
        spawn: ut(0xf13),
        spawnTiers: [
          ut(0x73e),
          ut(0x813),
          ut(0x813),
          ut(0xb46),
          ut(0xa4d),
          ut(0xd67),
          ut(0xd67),
          ut(0xa70),
        ],
      },
      {
        name: ut(0xca7),
        desc: ut(0xdac),
        type: cS[ut(0xdbe)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: ut(0x3a4),
        desc: ut(0xc35),
        type: cS[ut(0x552)],
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
        name: ut(0x52c),
        desc: ut(0x989),
        type: cS[ut(0xafe)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 2.5,
      },
      {
        name: ut(0x245),
        desc: ut(0x948),
        type: cS[ut(0xda8)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dd((r4) => 0xa + r4 * 0x28),
      },
      {
        name: ut(0xa5f),
        desc: ut(0x642),
        type: cS[ut(0x5f3)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: ut(0xa0b),
        desc: ut(0xdff),
        type: cS[ut(0x49e)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dd((r4) => 0x2 + Math[ut(0xa7d)](1.7 ** r4)),
      },
      {
        name: ut(0xa98),
        desc: ut(0xd7d),
        type: cS[ut(0x4bc)],
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
        name: ut(0xd87),
        desc: ut(0xec6),
        type: cS[ut(0x468)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dd((r4) => 0.02 + r4 * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: ut(0xe40),
        desc: ut(0x833),
        type: cS[ut(0x9dd)],
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
        spawn: ut(0x80a),
        spawnTiers: [
          ut(0x80a),
          ut(0x55a),
          ut(0x39b),
          ut(0x936),
          ut(0xe02),
          ut(0x23e),
          ut(0x23e),
          ut(0xaf4),
        ],
      },
      { name: ut(0xb27), desc: ut(0x803), ability: df[ut(0x2f0)] },
      {
        name: ut(0x5ef),
        desc: ut(0x7c8),
        type: cS[ut(0xc2e)],
        size: 0x10,
        healthF: 0x14,
        damageF: 0xa,
        fixAngle: !![],
        isDice: !![],
        respawnTime: 0x640,
      },
    ];
    function dD(r4) {
      const uA = ut,
        r5 = r4 ? 0x1 : -0x1,
        r6 = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][uA(0x86a)](
          (r7) => r7 * r5
        );
      return {
        name: r4 ? uA(0x414) : uA(0x653),
        desc:
          (r4 ? uA(0xdca) : uA(0x8c7)) +
          uA(0xbb0) +
          (r4 ? uA(0x86b) : "") +
          uA(0xcd9),
        type: cS[r4 ? uA(0x279) : uA(0xd1d)],
        size: 0x10,
        healthF: r4 ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: r6[0x0],
        mobSizeChangeTiers: r6[uA(0xe22)](0x1),
      };
    }
    var dE = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dF = {},
      dG = dC[ut(0xed7)],
      dH = da[ut(0xed7)],
      dI = eP();
    for (let r4 = 0x0, r5 = dC[ut(0xed7)]; r4 < r5; r4++) {
      const r6 = dC[r4];
      (r6[ut(0xa6b)] = !![]), (r6["id"] = r4);
      if (!r6[ut(0x4d2)]) r6[ut(0x4d2)] = r6[ut(0x244)];
      dK(r6), (r6[ut(0xd6a)] = 0x0), (r6[ut(0x523)] = r4);
      let r7 = r6;
      for (let r8 = 0x1; r8 < dH; r8++) {
        const r9 = dO(r6);
        (r9[ut(0x23b)] = r6[ut(0x23b)] + r8),
          (r9[ut(0x244)] = r6[ut(0x244)] + "_" + r9[ut(0x23b)]),
          (r9[ut(0xd6a)] = r8),
          (r7[ut(0x957)] = r9),
          (r7 = r9),
          dJ(r6, r9),
          dK(r9),
          (r9["id"] = dC[ut(0xed7)]),
          (dC[r9["id"]] = r9);
      }
    }
    function dJ(ra, rb) {
      const uB = ut,
        rc = rb[uB(0x23b)] - ra[uB(0x23b)] - 0x1;
      for (let rd in ra) {
        const re = ra[rd + uB(0x8ef)];
        Array[uB(0x660)](re) && (rb[rd] = re[rc]);
      }
    }
    function dK(ra) {
      const uC = ut;
      dF[ra[uC(0x244)]] = ra;
      for (let rb in di) {
        ra[rb] === void 0x0 && (ra[rb] = di[rb]);
      }
      ra[uC(0x299)] === df[uC(0x9b3)] &&
        (ra[uC(0xee2)] = cW[ra[uC(0x23b)] + 0x1] / 0x64),
        (ra[uC(0x663)] =
          ra[uC(0x4d8)] > 0x0
            ? dg(ra[uC(0x23b)], ra[uC(0x4d8)])
            : ra[uC(0x663)]),
        (ra[uC(0x51b)] =
          ra[uC(0x379)] > 0x0
            ? dg(ra[uC(0x23b)], ra[uC(0x379)])
            : ra[uC(0x51b)]),
        (ra[uC(0x7b1)] = dg(ra[uC(0x23b)], ra[uC(0x4fa)])),
        (ra[uC(0x790)] = dg(ra[uC(0x23b)], ra[uC(0x46f)])),
        (ra[uC(0x6c3)] = dg(ra[uC(0x23b)], ra[uC(0xa1d)])),
        (ra[uC(0x29a)] = dg(ra[uC(0x23b)], ra[uC(0x811)])),
        (ra[uC(0x818)] = dg(ra[uC(0x23b)], ra[uC(0xddf)])),
        (ra[uC(0x5f7)] = dg(ra[uC(0x23b)], ra[uC(0xedb)])),
        (ra[uC(0x476)] = dg(ra[uC(0x23b)], ra[uC(0x53d)])),
        (ra[uC(0x59a)] = dg(ra[uC(0x23b)], ra[uC(0x9ba)])),
        ra[uC(0x7cb)] &&
          ((ra[uC(0xe89)] = dg(ra[uC(0x23b)], ra[uC(0x65a)])),
          (ra[uC(0xa8d)] = dg(ra[uC(0x23b)], ra[uC(0xe8f)]))),
        ra[uC(0xa7a)] > 0x0
          ? (ra[uC(0xb18)] = dg(ra[uC(0x23b)], ra[uC(0xa7a)]))
          : (ra[uC(0xb18)] = 0x0),
        (ra[uC(0x676)] = ra[uC(0xe21)]
          ? dg(ra[uC(0x23b)], ra[uC(0x3d2)])
          : 0x0),
        (ra[uC(0xc19)] = ra[uC(0xeba)]
          ? dg(ra[uC(0x23b)], ra[uC(0x5d2)])
          : 0x0),
        (ra[uC(0xe88)] = dg(ra[uC(0x23b)], ra[uC(0xcf9)])),
        dI[ra[uC(0x23b)]][uC(0xbc0)](ra);
    }
    var dL = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dM = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dN = cV(ut(0x8c8));
    function dO(ra) {
      const uD = ut;
      return JSON[uD(0x1f3)](JSON[uD(0xce3)](ra));
    }
    const dP = {};
    (dP[ut(0x244)] = ut(0x91e)),
      (dP[ut(0xd8b)] = ut(0x498)),
      (dP[ut(0x8ca)] = ut(0x400)),
      (dP[ut(0x23b)] = 0x0),
      (dP[ut(0x4d8)] = 0x64),
      (dP[ut(0x379)] = 0x1e),
      (dP[ut(0xdc3)] = 0x32),
      (dP[ut(0xb04)] = dN[ut(0xbbb)]),
      (dP[ut(0x95a)] = ![]),
      (dP[ut(0xf0c)] = !![]),
      (dP[ut(0xe21)] = ![]),
      (dP[ut(0x3d2)] = 0x0),
      (dP[ut(0x676)] = 0x0),
      (dP[ut(0x524)] = ![]),
      (dP[ut(0x831)] = ![]),
      (dP[ut(0xbe3)] = 0x1),
      (dP[ut(0xcdd)] = cS[ut(0xaee)]),
      (dP[ut(0xaec)] = 0x0),
      (dP[ut(0x4d9)] = 0x0),
      (dP[ut(0x503)] = 0.5),
      (dP[ut(0x884)] = 0x0),
      (dP[ut(0x3ea)] = 0x1e),
      (dP[ut(0x269)] = 0x0),
      (dP[ut(0xeff)] = ![]),
      (dP[ut(0x5d2)] = 0x0),
      (dP[ut(0xc38)] = 0x0),
      (dP[ut(0x5ec)] = 11.5),
      (dP[ut(0x5fb)] = 0x4),
      (dP[ut(0xc6f)] = !![]),
      (dP[ut(0xbe8)] = 0x0),
      (dP[ut(0xf4a)] = 0x0),
      (dP[ut(0xc8b)] = 0x1),
      (dP[ut(0x443)] = 0x0),
      (dP[ut(0x3b2)] = 0x0),
      (dP[ut(0x449)] = 0x0),
      (dP[ut(0x369)] = 0x0),
      (dP[ut(0x591)] = 0x1);
    var dQ = dP;
    const dR = {};
    (dR[ut(0x244)] = ut(0x88d)),
      (dR[ut(0xd8b)] = ut(0xbe6)),
      (dR[ut(0x8ca)] = ut(0x625)),
      (dR[ut(0x4d8)] = 0x2ee),
      (dR[ut(0x379)] = 0xa),
      (dR[ut(0xdc3)] = 0x32),
      (dR[ut(0x524)] = !![]),
      (dR[ut(0x831)] = !![]),
      (dR[ut(0xbe3)] = 0.05),
      (dR[ut(0x5ec)] = 0x5),
      (dR[ut(0x91b)] = !![]),
      (dR[ut(0x7f4)] = [[ut(0xc7b), 0x3]]),
      (dR[ut(0x1fb)] = [
        [ut(0x9e0), 0x1],
        [ut(0xc7b), 0x2],
        [ut(0xc24), 0x2],
        [ut(0x1f8), 0x1],
      ]),
      (dR[ut(0xad9)] = [[ut(0xf1e), "f"]]);
    const dS = {};
    (dS[ut(0x244)] = ut(0x9e0)),
      (dS[ut(0xd8b)] = ut(0x2c8)),
      (dS[ut(0x8ca)] = ut(0x871)),
      (dS[ut(0x4d8)] = 0x1f4),
      (dS[ut(0x379)] = 0xa),
      (dS[ut(0xdc3)] = 0x28),
      (dS[ut(0x91b)] = !![]),
      (dS[ut(0x95a)] = !![]),
      (dS[ut(0xad9)] = [
        [ut(0x8c4), "E"],
        [ut(0x414), "G"],
        [ut(0x9a2), "A"],
      ]);
    const dT = {};
    (dT[ut(0x244)] = ut(0xc7b)),
      (dT[ut(0xd8b)] = ut(0xa3a)),
      (dT[ut(0x8ca)] = ut(0x40f)),
      (dT[ut(0x4d8)] = 0x64),
      (dT[ut(0x379)] = 0xa),
      (dT[ut(0xdc3)] = 0x1c),
      (dT[ut(0x95a)] = !![]),
      (dT[ut(0xad9)] = [[ut(0x8c4), "I"]]);
    const dU = {};
    (dU[ut(0x244)] = ut(0xc24)),
      (dU[ut(0xd8b)] = ut(0x726)),
      (dU[ut(0x8ca)] = ut(0x736)),
      (dU[ut(0x4d8)] = 62.5),
      (dU[ut(0x379)] = 0xa),
      (dU[ut(0xdc3)] = 0x1c),
      (dU[ut(0xad9)] = [[ut(0xf15), "H"]]);
    const dV = {};
    (dV[ut(0x244)] = ut(0x1f8)),
      (dV[ut(0xd8b)] = ut(0xdfe)),
      (dV[ut(0x8ca)] = ut(0xc0c)),
      (dV[ut(0x4d8)] = 0x19),
      (dV[ut(0x379)] = 0xa),
      (dV[ut(0xdc3)] = 0x19),
      (dV[ut(0x95a)] = ![]),
      (dV[ut(0xf0c)] = ![]),
      (dV[ut(0xad9)] = [
        [ut(0x48f), "F"],
        [ut(0xf15), "F"],
        [ut(0x653), "G"],
        [ut(0x40d), "F"],
      ]);
    var dW = [dR, dS, dT, dU, dV];
    function dX() {
      const uE = ut,
        ra = dO(dW);
      for (let rb = 0x0; rb < ra[uE(0xed7)]; rb++) {
        const rc = ra[rb];
        (rc[uE(0x8ca)] += uE(0x42f)),
          rc[uE(0x244)] === uE(0x88d) &&
            (rc[uE(0xad9)] = [
              [uE(0xf44), "D"],
              [uE(0x7d4), "E"],
            ]),
          (rc[uE(0x244)] = dY(rc[uE(0x244)])),
          (rc[uE(0xd8b)] = dY(rc[uE(0xd8b)])),
          (rc[uE(0x379)] *= 0x2),
          rc[uE(0x7f4)] &&
            rc[uE(0x7f4)][uE(0xaa2)]((rd) => {
              return (rd[0x0] = dY(rd[0x0])), rd;
            }),
          rc[uE(0x1fb)] &&
            rc[uE(0x1fb)][uE(0xaa2)]((rd) => {
              return (rd[0x0] = dY(rd[0x0])), rd;
            });
      }
      return ra;
    }
    function dY(ra) {
      const uF = ut;
      return ra[uF(0xd73)](/Ant/g, uF(0xb47))[uF(0xd73)](/ant/g, uF(0x9a6));
    }
    const dZ = {};
    (dZ[ut(0x244)] = ut(0xefe)),
      (dZ[ut(0xd8b)] = ut(0xa84)),
      (dZ[ut(0x8ca)] = ut(0xad2)),
      (dZ[ut(0x4d8)] = 37.5),
      (dZ[ut(0x379)] = 0x32),
      (dZ[ut(0xdc3)] = 0x28),
      (dZ[ut(0xad9)] = [
        [ut(0x4db), "F"],
        [ut(0x56d), "I"],
      ]),
      (dZ[ut(0xbe8)] = 0x4),
      (dZ[ut(0xf4a)] = 0x4);
    const e0 = {};
    (e0[ut(0x244)] = ut(0xea1)),
      (e0[ut(0xd8b)] = ut(0x4a6)),
      (e0[ut(0x8ca)] = ut(0x44f)),
      (e0[ut(0x4d8)] = 0x5e),
      (e0[ut(0x379)] = 0x5),
      (e0[ut(0xbe3)] = 0.05),
      (e0[ut(0xdc3)] = 0x3c),
      (e0[ut(0x524)] = !![]),
      (e0[ut(0xad9)] = [[ut(0xea1), "h"]]);
    const e1 = {};
    (e1[ut(0x244)] = ut(0x80a)),
      (e1[ut(0xd8b)] = ut(0x3a9)),
      (e1[ut(0x8ca)] = ut(0x5b6)),
      (e1[ut(0x4d8)] = 0x4b),
      (e1[ut(0x379)] = 0xa),
      (e1[ut(0xbe3)] = 0.05),
      (e1[ut(0x524)] = !![]),
      (e1[ut(0xd4e)] = 1.25),
      (e1[ut(0xad9)] = [
        [ut(0x80a), "h"],
        [ut(0xa0c), "J"],
        [ut(0xe40), "K"],
      ]);
    const e2 = {};
    (e2[ut(0x244)] = ut(0xf3c)),
      (e2[ut(0xd8b)] = ut(0x3f2)),
      (e2[ut(0x8ca)] = ut(0x710)),
      (e2[ut(0x4d8)] = 62.5),
      (e2[ut(0x379)] = 0x32),
      (e2[ut(0x95a)] = !![]),
      (e2[ut(0xdc3)] = 0x28),
      (e2[ut(0xad9)] = [
        [ut(0xa17), "f"],
        [ut(0xcb0), "I"],
        [ut(0x2b8), "K"],
      ]),
      (e2[ut(0xcdd)] = cS[ut(0x5c6)]),
      (e2[ut(0x4d9)] = 0xa),
      (e2[ut(0xaec)] = 0x5),
      (e2[ut(0x3ea)] = 0x26),
      (e2[ut(0x503)] = 0.375 / 1.1),
      (e2[ut(0x884)] = 0.75),
      (e2[ut(0xb04)] = dN[ut(0x710)]);
    const e3 = {};
    (e3[ut(0x244)] = ut(0x4d3)),
      (e3[ut(0xd8b)] = ut(0xb9d)),
      (e3[ut(0x8ca)] = ut(0x634)),
      (e3[ut(0x4d8)] = 87.5),
      (e3[ut(0x379)] = 0xa),
      (e3[ut(0xad9)] = [
        [ut(0x48f), "f"],
        [ut(0x666), "f"],
      ]),
      (e3[ut(0xbe8)] = 0x5),
      (e3[ut(0xf4a)] = 0x5);
    const e4 = {};
    (e4[ut(0x244)] = ut(0xdd8)),
      (e4[ut(0xd8b)] = ut(0x95f)),
      (e4[ut(0x8ca)] = ut(0x400)),
      (e4[ut(0x4d8)] = 0x64),
      (e4[ut(0x379)] = 0x1e),
      (e4[ut(0x95a)] = !![]),
      (e4[ut(0xad9)] = [[ut(0x93b), "F"]]),
      (e4[ut(0xbe8)] = 0x5),
      (e4[ut(0xf4a)] = 0x5);
    const e5 = {};
    (e5[ut(0x244)] = ut(0xf13)),
      (e5[ut(0xd8b)] = ut(0x506)),
      (e5[ut(0x8ca)] = ut(0x26d)),
      (e5[ut(0x4d8)] = 62.5),
      (e5[ut(0x379)] = 0xf),
      (e5[ut(0xe21)] = !![]),
      (e5[ut(0x3d2)] = 0xf),
      (e5[ut(0xdc3)] = 0x23),
      (e5[ut(0x95a)] = !![]),
      (e5[ut(0xad9)] = [
        [ut(0x6f0), "F"],
        [ut(0x952), "F"],
        [ut(0xc0d), "L"],
        [ut(0x6d6), "G"],
      ]);
    const e6 = {};
    (e6[ut(0x244)] = ut(0x339)),
      (e6[ut(0xd8b)] = ut(0x9b2)),
      (e6[ut(0x8ca)] = ut(0xbbf)),
      (e6[ut(0x4d8)] = 0x64),
      (e6[ut(0x379)] = 0xf),
      (e6[ut(0xe21)] = !![]),
      (e6[ut(0x3d2)] = 0xa),
      (e6[ut(0xdc3)] = 0x2f),
      (e6[ut(0x95a)] = !![]),
      (e6[ut(0xad9)] = [
        [ut(0xc26), "F"],
        [ut(0xc81), "F"],
      ]),
      (e6[ut(0xcdd)] = cS[ut(0xe81)]),
      (e6[ut(0x4d9)] = 0x3),
      (e6[ut(0xaec)] = 0x5),
      (e6[ut(0x269)] = 0x7),
      (e6[ut(0x3ea)] = 0x2b),
      (e6[ut(0x503)] = 0.21),
      (e6[ut(0x884)] = -0.31),
      (e6[ut(0xb04)] = dN[ut(0xbaa)]);
    const e7 = {};
    (e7[ut(0x244)] = ut(0x2bc)),
      (e7[ut(0xd8b)] = ut(0x8c9)),
      (e7[ut(0x8ca)] = ut(0xa15)),
      (e7[ut(0x4d8)] = 0x15e),
      (e7[ut(0x379)] = 0x28),
      (e7[ut(0xdc3)] = 0x2d),
      (e7[ut(0x95a)] = !![]),
      (e7[ut(0x91b)] = !![]),
      (e7[ut(0xad9)] = [
        [ut(0x35e), "F"],
        [ut(0xdeb), "G"],
        [ut(0xf12), "H"],
        [ut(0xded), "J"],
      ]);
    const e8 = {};
    (e8[ut(0x244)] = ut(0xbb3)),
      (e8[ut(0xd8b)] = ut(0xe86)),
      (e8[ut(0x8ca)] = ut(0x970)),
      (e8[ut(0x4d8)] = 0x7d),
      (e8[ut(0x379)] = 0x19),
      (e8[ut(0x95a)] = !![]),
      (e8[ut(0xeff)] = !![]),
      (e8[ut(0x5d2)] = 0x5),
      (e8[ut(0xc38)] = 0x2),
      (e8[ut(0xc98)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e8[ut(0x5fb)] = 0x4),
      (e8[ut(0x5ec)] = 0x6),
      (e8[ut(0xad9)] = [[ut(0x9a5), "F"]]);
    const e9 = {};
    (e9[ut(0x244)] = ut(0x5c5)),
      (e9[ut(0xd8b)] = ut(0x2d2)),
      (e9[ut(0x8ca)] = ut(0xe6b)),
      (e9[ut(0x4d8)] = 0.5),
      (e9[ut(0x379)] = 0x5),
      (e9[ut(0x95a)] = ![]),
      (e9[ut(0xf0c)] = ![]),
      (e9[ut(0x5fb)] = 0x1),
      (e9[ut(0xad9)] = [[ut(0x5c5), "F"]]);
    const ea = {};
    (ea[ut(0x244)] = ut(0xa9e)),
      (ea[ut(0xd8b)] = ut(0xd7b)),
      (ea[ut(0x8ca)] = ut(0xa9f)),
      (ea[ut(0x4d8)] = 0x19),
      (ea[ut(0x379)] = 0xa),
      (ea[ut(0xdc3)] = 0x28),
      (ea[ut(0x5c1)] = cS[ut(0xc5b)]),
      (ea[ut(0xad9)] = [
        [ut(0xf15), "J"],
        [ut(0xbba), "J"],
      ]);
    const eb = {};
    (eb[ut(0x244)] = ut(0x7d5)),
      (eb[ut(0xd8b)] = ut(0xeee)),
      (eb[ut(0x8ca)] = ut(0x3fd)),
      (eb[ut(0x4d8)] = 0x19),
      (eb[ut(0x379)] = 0xa),
      (eb[ut(0xdc3)] = 0x28),
      (eb[ut(0x5c1)] = cS[ut(0x2df)]),
      (eb[ut(0x95a)] = !![]),
      (eb[ut(0xad9)] = [
        [ut(0xc26), "J"],
        [ut(0x846), "J"],
      ]);
    const ec = {};
    (ec[ut(0x244)] = ut(0x548)),
      (ec[ut(0xd8b)] = ut(0xdfd)),
      (ec[ut(0x8ca)] = ut(0xdc2)),
      (ec[ut(0x4d8)] = 0x19),
      (ec[ut(0x379)] = 0xa),
      (ec[ut(0xdc3)] = 0x28),
      (ec[ut(0x5c1)] = cS[ut(0xdd0)]),
      (ec[ut(0xf0c)] = ![]),
      (ec[ut(0xad9)] = [
        [ut(0x75e), "J"],
        [ut(0x3af), "H"],
        [ut(0x2f6), "J"],
      ]),
      (ec[ut(0x5fb)] = 0x17),
      (ec[ut(0x5ec)] = 0x17 * 0.75);
    const ed = {};
    (ed[ut(0x244)] = ut(0x550)),
      (ed[ut(0xd8b)] = ut(0xc43)),
      (ed[ut(0x8ca)] = ut(0x5f2)),
      (ed[ut(0x4d8)] = 87.5),
      (ed[ut(0x379)] = 0xa),
      (ed[ut(0xad9)] = [
        [ut(0xadb), "F"],
        [ut(0x84f), "I"],
      ]),
      (ed[ut(0xbe8)] = 0x5),
      (ed[ut(0xf4a)] = 0x5);
    const ee = {};
    (ee[ut(0x244)] = ut(0xede)),
      (ee[ut(0xd8b)] = ut(0x88e)),
      (ee[ut(0x8ca)] = ut(0xe64)),
      (ee[ut(0x4d8)] = 87.5),
      (ee[ut(0x379)] = 0xa),
      (ee[ut(0xad9)] = [
        [ut(0x666), "A"],
        [ut(0xadb), "A"],
      ]),
      (ee[ut(0xbe8)] = 0x5),
      (ee[ut(0xf4a)] = 0x5);
    const ef = {};
    (ef[ut(0x244)] = ut(0xa02)),
      (ef[ut(0xd8b)] = ut(0x507)),
      (ef[ut(0x8ca)] = ut(0xc54)),
      (ef[ut(0x4d8)] = 0x32),
      (ef[ut(0x379)] = 0xa),
      (ef[ut(0xbe3)] = 0.05),
      (ef[ut(0xdc3)] = 0x3c),
      (ef[ut(0x524)] = !![]),
      (ef[ut(0xad9)] = [
        [ut(0xda7), "E"],
        [ut(0xbd0), "F"],
        [ut(0x573), "F"],
      ]);
    const eg = {};
    (eg[ut(0x244)] = ut(0xac4)),
      (eg[ut(0xd8b)] = ut(0x319)),
      (eg[ut(0x8ca)] = ut(0x50d)),
      (eg[ut(0x4d8)] = 0x7d),
      (eg[ut(0x379)] = 0x28),
      (eg[ut(0xdc3)] = 0x32),
      (eg[ut(0x95a)] = ![]),
      (eg[ut(0xf0c)] = ![]),
      (eg[ut(0xb04)] = dN[ut(0x50d)]),
      (eg[ut(0x5fb)] = 0xe),
      (eg[ut(0x5ec)] = 0xb),
      (eg[ut(0xc8b)] = 2.2),
      (eg[ut(0xad9)] = [
        [ut(0xe61), "J"],
        [ut(0x75e), "H"],
      ]);
    const eh = {};
    (eh[ut(0x244)] = ut(0x25b)),
      (eh[ut(0xd8b)] = ut(0x9f5)),
      (eh[ut(0x8ca)] = ut(0xabe)),
      (eh[ut(0x4d8)] = 0x7d),
      (eh[ut(0x379)] = 0x28),
      (eh[ut(0xdc3)] = null),
      (eh[ut(0x95a)] = !![]),
      (eh[ut(0x69d)] = !![]),
      (eh[ut(0xad9)] = [
        [ut(0x647), "D"],
        [ut(0xb03), "E"],
        [ut(0x570), "E"],
      ]),
      (eh[ut(0xdc3)] = 0x32),
      (eh[ut(0x31a)] = 0x32),
      (eh[ut(0xa48)] = !![]),
      (eh[ut(0x443)] = -Math["PI"] / 0x2),
      (eh[ut(0xcdd)] = cS[ut(0x26a)]),
      (eh[ut(0x4d9)] = 0x3),
      (eh[ut(0xaec)] = 0x3),
      (eh[ut(0x3ea)] = 0x21),
      (eh[ut(0x503)] = 0.32),
      (eh[ut(0x884)] = 0.4),
      (eh[ut(0xb04)] = dN[ut(0x710)]);
    const ei = {};
    (ei[ut(0x244)] = ut(0x214)),
      (ei[ut(0xd8b)] = ut(0x2bf)),
      (ei[ut(0x8ca)] = ut(0xf30)),
      (ei[ut(0x4d8)] = 0x96),
      (ei[ut(0x379)] = 0x14),
      (ei[ut(0x95a)] = !![]),
      (ei[ut(0x3b2)] = 0.5),
      (ei[ut(0xad9)] = [
        [ut(0x214), "D"],
        [ut(0x3af), "J"],
        [ut(0x75e), "J"],
      ]);
    const ej = {};
    (ej[ut(0x244)] = ut(0xf06)),
      (ej[ut(0xd8b)] = ut(0x7e3)),
      (ej[ut(0x8ca)] = ut(0xaff)),
      (ej[ut(0x4d8)] = 0x19),
      (ej[ut(0x379)] = 0xf),
      (ej[ut(0xbe3)] = 0.05),
      (ej[ut(0xdc3)] = 0x37),
      (ej[ut(0x524)] = !![]),
      (ej[ut(0xad9)] = [[ut(0xf06), "h"]]),
      (ej[ut(0xcdd)] = cS[ut(0x758)]),
      (ej[ut(0x449)] = 0x9),
      (ej[ut(0x3ea)] = 0x28),
      (ej[ut(0x4d9)] = 0xf),
      (ej[ut(0xaec)] = 2.5),
      (ej[ut(0x3ea)] = 0x21),
      (ej[ut(0x503)] = 0.32),
      (ej[ut(0x884)] = 1.8),
      (ej[ut(0x369)] = 0x14);
    const ek = {};
    (ek[ut(0x244)] = ut(0x70b)),
      (ek[ut(0xd8b)] = ut(0xcf1)),
      (ek[ut(0x8ca)] = ut(0x303)),
      (ek[ut(0x4d8)] = 0xe1),
      (ek[ut(0x379)] = 0xa),
      (ek[ut(0xdc3)] = 0x32),
      (ek[ut(0xad9)] = [
        [ut(0x70b), "H"],
        [ut(0xf44), "L"],
      ]),
      (ek[ut(0x69d)] = !![]),
      (ek[ut(0x8c3)] = !![]),
      (ek[ut(0x5ec)] = 0x23);
    const em = {};
    (em[ut(0x244)] = ut(0x4b8)),
      (em[ut(0xd8b)] = ut(0x9de)),
      (em[ut(0x8ca)] = ut(0x5c3)),
      (em[ut(0x4d8)] = 0x96),
      (em[ut(0x379)] = 0x19),
      (em[ut(0xdc3)] = 0x2f),
      (em[ut(0x95a)] = !![]),
      (em[ut(0xad9)] = [[ut(0x75e), "J"]]),
      (em[ut(0xcdd)] = null),
      (em[ut(0xb04)] = dN[ut(0xbaa)]);
    const en = {};
    (en[ut(0x244)] = ut(0x2fc)),
      (en[ut(0xd8b)] = ut(0xe77)),
      (en[ut(0x8ca)] = ut(0x8f8)),
      (en[ut(0x4d8)] = 0x64),
      (en[ut(0x379)] = 0x1e),
      (en[ut(0xdc3)] = 0x1e),
      (en[ut(0x95a)] = !![]),
      (en[ut(0x941)] = ut(0x7d4)),
      (en[ut(0xad9)] = [
        [ut(0x7d4), "F"],
        [ut(0x6d6), "E"],
        [ut(0xe39), "D"],
        [ut(0xb27), "E"],
      ]);
    const eo = {};
    (eo[ut(0x244)] = ut(0x3ec)),
      (eo[ut(0xd8b)] = ut(0xb24)),
      (eo[ut(0x8ca)] = ut(0x725)),
      (eo[ut(0x4d8)] = 0x64),
      (eo[ut(0x379)] = 0xa),
      (eo[ut(0xdc3)] = 0x3c),
      (eo[ut(0x524)] = !![]),
      (eo[ut(0xbe3)] = 0.05),
      (eo[ut(0xad9)] = [[ut(0x3ec), "D"]]);
    const ep = {};
    (ep[ut(0x244)] = ut(0xea7)),
      (ep[ut(0xd8b)] = ut(0x28f)),
      (ep[ut(0x8ca)] = ut(0x787)),
      (ep[ut(0x4d8)] = 0x64),
      (ep[ut(0x379)] = 0x23),
      (ep[ut(0x95a)] = !![]),
      (ep[ut(0xad9)] = [
        [ut(0x9e2), "E"],
        [ut(0x83a), "D"],
      ]);
    const eq = {};
    (eq[ut(0x244)] = ut(0x66b)),
      (eq[ut(0xd8b)] = ut(0x3cf)),
      (eq[ut(0x8ca)] = ut(0x764)),
      (eq[ut(0x4d8)] = 0xc8),
      (eq[ut(0x379)] = 0x23),
      (eq[ut(0xdc3)] = 0x23),
      (eq[ut(0x95a)] = !![]),
      (eq[ut(0xf4a)] = 0x5),
      (eq[ut(0xad9)] = [
        [ut(0x784), "F"],
        [ut(0x4b7), "D"],
        [ut(0x801), "E"],
      ]);
    const er = {};
    (er[ut(0x244)] = ut(0x59b)),
      (er[ut(0xd8b)] = ut(0x425)),
      (er[ut(0x8ca)] = ut(0xb28)),
      (er[ut(0x4d8)] = 0xc8),
      (er[ut(0x379)] = 0x14),
      (er[ut(0xdc3)] = 0x28),
      (er[ut(0x95a)] = !![]),
      (er[ut(0xad9)] = [
        [ut(0xe26), "E"],
        [ut(0x8b9), "D"],
        [ut(0x42f), "F"],
        [ut(0x69f), "F"],
      ]),
      (er[ut(0x70f)] = !![]),
      (er[ut(0xbf6)] = 0xbb8),
      (er[ut(0xd63)] = 0.3);
    const es = {};
    (es[ut(0x244)] = ut(0x2a1)),
      (es[ut(0xd8b)] = ut(0x56a)),
      (es[ut(0x8ca)] = ut(0xdea)),
      (es[ut(0x4d8)] = 0x78),
      (es[ut(0x379)] = 0x1e),
      (es[ut(0x8c3)] = !![]),
      (es[ut(0x5ec)] = 0xf),
      (es[ut(0x5fb)] = 0x5),
      (es[ut(0xad9)] = [
        [ut(0x2a1), "F"],
        [ut(0x877), "E"],
        [ut(0x3b1), "D"],
      ]),
      (es[ut(0xf4a)] = 0x3);
    const et = {};
    (et[ut(0x244)] = ut(0x5f0)),
      (et[ut(0xd8b)] = ut(0x37f)),
      (et[ut(0x8ca)] = ut(0xbcb)),
      (et[ut(0x4d8)] = 0x78),
      (et[ut(0x379)] = 0x23),
      (et[ut(0xdc3)] = 0x32),
      (et[ut(0x95a)] = !![]),
      (et[ut(0x2c6)] = !![]),
      (et[ut(0xad9)] = [
        [ut(0x5f0), "E"],
        [ut(0x573), "F"],
      ]),
      (et[ut(0x7f4)] = [[ut(0xf08), 0x1]]),
      (et[ut(0x1fb)] = [[ut(0xf08), 0x2]]),
      (et[ut(0xf42)] = !![]);
    const eu = {};
    (eu[ut(0x244)] = ut(0xf08)),
      (eu[ut(0xd8b)] = ut(0xe3e)),
      (eu[ut(0x8ca)] = ut(0xed9)),
      (eu[ut(0x4d8)] = 0x96),
      (eu[ut(0x379)] = 0.1),
      (eu[ut(0xdc3)] = 0x28),
      (eu[ut(0x5fb)] = 0xe),
      (eu[ut(0x5ec)] = 11.6),
      (eu[ut(0x95a)] = !![]),
      (eu[ut(0x2c6)] = !![]),
      (eu[ut(0x5e7)] = !![]),
      (eu[ut(0xb04)] = dN[ut(0x50d)]),
      (eu[ut(0xca3)] = 0xa),
      (eu[ut(0xad9)] = [[ut(0xb39), "G"]]),
      (eu[ut(0x591)] = 0.5);
    const ev = {};
    (ev[ut(0x244)] = ut(0x79f)),
      (ev[ut(0xd8b)] = ut(0x390)),
      (ev[ut(0x8ca)] = ut(0xab2)),
      (ev[ut(0x4d8)] = 0x1f4),
      (ev[ut(0x379)] = 0x28),
      (ev[ut(0xbe3)] = 0.05),
      (ev[ut(0xdc3)] = 0x32),
      (ev[ut(0x524)] = !![]),
      (ev[ut(0x5ec)] = 0x5),
      (ev[ut(0x831)] = !![]),
      (ev[ut(0x91b)] = !![]),
      (ev[ut(0xad9)] = [
        [ut(0x741), "F"],
        [ut(0x2b8), "C"],
      ]),
      (ev[ut(0x7f4)] = [
        [ut(0xefe), 0x2],
        [ut(0xf3c), 0x1],
      ]),
      (ev[ut(0x1fb)] = [
        [ut(0xefe), 0x4],
        [ut(0xf3c), 0x2],
      ]);
    const ew = {};
    (ew[ut(0x244)] = ut(0x580)),
      (ew[ut(0xd8b)] = ut(0x866)),
      (ew[ut(0x8ca)] = ut(0xdcb)),
      (ew[ut(0x4d8)] = 0x50),
      (ew[ut(0x379)] = 0x28),
      (ew[ut(0x5fb)] = 0x2),
      (ew[ut(0x5ec)] = 0x6),
      (ew[ut(0x69d)] = !![]),
      (ew[ut(0xad9)] = [[ut(0x580), "F"]]);
    const ex = {};
    (ex[ut(0x244)] = ut(0x671)),
      (ex[ut(0xd8b)] = ut(0xa3d)),
      (ex[ut(0x8ca)] = ut(0xe99)),
      (ex[ut(0x4d8)] = 0x1f4),
      (ex[ut(0x379)] = 0x28),
      (ex[ut(0xbe3)] = 0.05),
      (ex[ut(0xdc3)] = 0x46),
      (ex[ut(0x5ec)] = 0x5),
      (ex[ut(0x524)] = !![]),
      (ex[ut(0x831)] = !![]),
      (ex[ut(0x91b)] = !![]),
      (ex[ut(0xad9)] = [
        [ut(0x35f), "A"],
        [ut(0x952), "E"],
      ]),
      (ex[ut(0x7f4)] = [[ut(0xf13), 0x2]]),
      (ex[ut(0x1fb)] = [
        [ut(0xf13), 0x3],
        [ut(0x2fc), 0x2],
      ]);
    const ey = {};
    (ey[ut(0x244)] = ut(0x6ae)),
      (ey[ut(0xd8b)] = ut(0xdf8)),
      (ey[ut(0x8ca)] = ut(0x6b9)),
      (ey[ut(0xdc3)] = 0x28),
      (ey[ut(0x4d8)] = 0x64),
      (ey[ut(0x379)] = 0xa),
      (ey[ut(0xbe3)] = 0.05),
      (ey[ut(0x524)] = !![]),
      (ey[ut(0xbe8)] = 0x1),
      (ey[ut(0xf4a)] = 0x1),
      (ey[ut(0xad9)] = [
        [ut(0x4b7), "G"],
        [ut(0x3af), "F"],
        [ut(0xca7), "F"],
      ]);
    const ez = {};
    (ez[ut(0x244)] = ut(0x31e)),
      (ez[ut(0xd8b)] = ut(0x7ae)),
      (ez[ut(0x8ca)] = ut(0x329)),
      (ez[ut(0x4d8)] = 0x3c),
      (ez[ut(0x379)] = 0x28),
      (ez[ut(0xdc3)] = 0x32),
      (ez[ut(0x95a)] = ![]),
      (ez[ut(0xf0c)] = ![]),
      (ez[ut(0xb04)] = dN[ut(0x50d)]),
      (ez[ut(0x5fb)] = 0xe),
      (ez[ut(0x5ec)] = 0xb),
      (ez[ut(0xc8b)] = 2.2),
      (ez[ut(0xad9)] = [
        [ut(0x83a), "E"],
        [ut(0x75e), "J"],
      ]);
    const eA = {};
    (eA[ut(0x244)] = ut(0x89b)),
      (eA[ut(0xd8b)] = ut(0xa8a)),
      (eA[ut(0x8ca)] = ut(0xcdb)),
      (eA[ut(0x4d8)] = 0x258),
      (eA[ut(0x379)] = 0x32),
      (eA[ut(0xbe3)] = 0.05),
      (eA[ut(0xdc3)] = 0x3c),
      (eA[ut(0x5ec)] = 0x7),
      (eA[ut(0x91b)] = !![]),
      (eA[ut(0x524)] = !![]),
      (eA[ut(0x831)] = !![]),
      (eA[ut(0xad9)] = [
        [ut(0xe26), "A"],
        [ut(0xe61), "G"],
      ]),
      (eA[ut(0x7f4)] = [[ut(0x59b), 0x1]]),
      (eA[ut(0x1fb)] = [[ut(0x59b), 0x1]]);
    const eB = {};
    (eB[ut(0x244)] = ut(0x382)),
      (eB[ut(0xd8b)] = ut(0xd27)),
      (eB[ut(0x8ca)] = ut(0x482)),
      (eB[ut(0x4d8)] = 0xc8),
      (eB[ut(0x379)] = 0x1e),
      (eB[ut(0xdc3)] = 0x2d),
      (eB[ut(0x95a)] = !![]),
      (eB[ut(0xad9)] = [
        [ut(0x35e), "G"],
        [ut(0xdeb), "H"],
        [ut(0x3b1), "E"],
      ]);
    const eC = {};
    (eC[ut(0x244)] = ut(0xa0f)),
      (eC[ut(0xd8b)] = ut(0x47e)),
      (eC[ut(0x8ca)] = ut(0xace)),
      (eC[ut(0x4d8)] = 0x3c),
      (eC[ut(0x379)] = 0x64),
      (eC[ut(0xdc3)] = 0x28),
      (eC[ut(0x9b0)] = !![]),
      (eC[ut(0xc6f)] = ![]),
      (eC[ut(0x95a)] = !![]),
      (eC[ut(0xad9)] = [
        [ut(0x8b9), "F"],
        [ut(0xf15), "D"],
        [ut(0x3a4), "G"],
      ]);
    const eD = {};
    (eD[ut(0x244)] = ut(0x52c)),
      (eD[ut(0xd8b)] = ut(0x351)),
      (eD[ut(0x8ca)] = ut(0x218)),
      (eD[ut(0xdc3)] = 0x28),
      (eD[ut(0x4d8)] = 0x5a),
      (eD[ut(0x379)] = 0x5),
      (eD[ut(0xbe3)] = 0.05),
      (eD[ut(0x524)] = !![]),
      (eD[ut(0xad9)] = [[ut(0x52c), "h"]]);
    const eE = {};
    (eE[ut(0x244)] = ut(0x245)),
      (eE[ut(0xd8b)] = ut(0x85f)),
      (eE[ut(0x8ca)] = ut(0xe55)),
      (eE[ut(0x4d8)] = 0x32),
      (eE[ut(0x379)] = 0x14),
      (eE[ut(0xdc3)] = 0x28),
      (eE[ut(0x69d)] = !![]),
      (eE[ut(0xad9)] = [[ut(0x245), "F"]]);
    const eF = {};
    (eF[ut(0x244)] = ut(0xa5f)),
      (eF[ut(0xd8b)] = ut(0x8f0)),
      (eF[ut(0x8ca)] = ut(0x685)),
      (eF[ut(0x4d8)] = 0x32),
      (eF[ut(0x379)] = 0x14),
      (eF[ut(0xbe3)] = 0.05),
      (eF[ut(0x524)] = !![]),
      (eF[ut(0xad9)] = [[ut(0xa5f), "J"]]);
    const eG = {};
    (eG[ut(0x244)] = ut(0x979)),
      (eG[ut(0xd8b)] = ut(0xe60)),
      (eG[ut(0x8ca)] = ut(0x21c)),
      (eG[ut(0x4d8)] = 0x64),
      (eG[ut(0x379)] = 0x1e),
      (eG[ut(0xbe3)] = 0.05),
      (eG[ut(0xdc3)] = 0x32),
      (eG[ut(0x524)] = !![]),
      (eG[ut(0xad9)] = [
        [ut(0x8b9), "D"],
        [ut(0xa0b), "E"],
      ]);
    const eH = {};
    (eH[ut(0x244)] = ut(0x98c)),
      (eH[ut(0xd8b)] = ut(0x53f)),
      (eH[ut(0x8ca)] = ut(0x3cc)),
      (eH[ut(0x4d8)] = 0x96),
      (eH[ut(0x379)] = 0x14),
      (eH[ut(0xdc3)] = 0x28),
      (eH[ut(0xad9)] = [
        [ut(0xa98), "D"],
        [ut(0x877), "F"],
      ]),
      (eH[ut(0x1fb)] = [[ut(0x1f8), 0x1, 0.3]]);
    const eI = {};
    (eI[ut(0x244)] = ut(0xd87)),
      (eI[ut(0xd8b)] = ut(0xdaf)),
      (eI[ut(0x8ca)] = ut(0x922)),
      (eI[ut(0x4d8)] = 0x32),
      (eI[ut(0x379)] = 0x5),
      (eI[ut(0xbe3)] = 0.05),
      (eI[ut(0x524)] = !![]),
      (eI[ut(0xad9)] = [
        [ut(0xd87), "h"],
        [ut(0xf15), "J"],
      ]);
    const eJ = {};
    (eJ[ut(0x244)] = ut(0x5ef)),
      (eJ[ut(0xd8b)] = ut(0x891)),
      (eJ[ut(0x8ca)] = ut(0x20e)),
      (eJ[ut(0x4d8)] = 0x64),
      (eJ[ut(0x379)] = 0x5),
      (eJ[ut(0xbe3)] = 0.05),
      (eJ[ut(0x524)] = !![]),
      (eJ[ut(0xad9)] = [[ut(0x5ef), "h"]]);
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
      eL = eK[ut(0xed7)],
      eM = {},
      eN = [],
      eO = eP();
    function eP() {
      const ra = [];
      for (let rb = 0x0; rb < dH; rb++) {
        ra[rb] = [];
      }
      return ra;
    }
    for (let ra = 0x0; ra < eL; ra++) {
      const rb = eK[ra];
      for (let rc in dQ) {
        rb[rc] === void 0x0 && (rb[rc] = dQ[rc]);
      }
      (eN[ra] = [rb]), (rb[ut(0x8ca)] = cS[rb[ut(0x8ca)]]), eR(rb);
      rb[ut(0xad9)] &&
        rb[ut(0xad9)][ut(0xaa2)]((rd) => {
          const uG = ut;
          rd[0x1] = rd[0x1][uG(0x330)]()[uG(0xdd7)](0x0) - 0x41;
        });
      (rb["id"] = ra), (rb[ut(0x523)] = ra);
      if (!rb[ut(0x4d2)]) rb[ut(0x4d2)] = rb[ut(0x244)];
      for (let rd = 0x1; rd <= db; rd++) {
        const re = JSON[ut(0x1f3)](JSON[ut(0xce3)](rb));
        (re[ut(0x244)] = rb[ut(0x244)] + "_" + rd),
          (re[ut(0x23b)] = rd),
          (eN[ra][rd] = re),
          dJ(rb, re),
          eR(re),
          (re["id"] = eK[ut(0xed7)]),
          eK[ut(0xbc0)](re);
      }
    }
    for (let rf = 0x0; rf < eK[ut(0xed7)]; rf++) {
      const rg = eK[rf];
      rg[ut(0x7f4)] && eQ(rg, rg[ut(0x7f4)]),
        rg[ut(0x1fb)] && eQ(rg, rg[ut(0x1fb)]);
    }
    function eQ(rh, ri) {
      const uH = ut;
      ri[uH(0xaa2)]((rj) => {
        const uI = uH,
          rk = rj[0x0] + (rh[uI(0x23b)] > 0x0 ? "_" + rh[uI(0x23b)] : "");
        rj[0x0] = eM[rk];
      });
    }
    function eR(rh) {
      const uJ = ut;
      (rh[uJ(0x663)] = dg(rh[uJ(0x23b)], rh[uJ(0x4d8)]) * dL[rh[uJ(0x23b)]]),
        (rh[uJ(0x51b)] = dg(rh[uJ(0x23b)], rh[uJ(0x379)])),
        rh[uJ(0xa48)]
          ? (rh[uJ(0x31a)] = rh[uJ(0xdc3)])
          : (rh[uJ(0x31a)] = rh[uJ(0xdc3)] * dM[rh[uJ(0x23b)]]),
        (rh[uJ(0x676)] = dg(rh[uJ(0x23b)], rh[uJ(0x3d2)])),
        (rh[uJ(0x408)] = dg(rh[uJ(0x23b)], rh[uJ(0x4d9)])),
        (rh[uJ(0x651)] = dg(rh[uJ(0x23b)], rh[uJ(0xaec)]) * dL[rh[uJ(0x23b)]]),
        (rh[uJ(0xa0e)] = dg(rh[uJ(0x23b)], rh[uJ(0x269)])),
        rh[uJ(0xd63)] && (rh[uJ(0xc3e)] = dg(rh[uJ(0x23b)], rh[uJ(0xd63)])),
        (rh[uJ(0xc19)] = dg(rh[uJ(0x23b)], rh[uJ(0x5d2)])),
        (eM[rh[uJ(0x244)]] = rh),
        eO[rh[uJ(0x23b)]][uJ(0xbc0)](rh);
    }
    function eS(rh) {
      return (rh / 0xff) * Math["PI"] * 0x2;
    }
    var eT = Math["PI"] * 0x2;
    function eU(rh) {
      const uK = ut;
      return (
        (rh %= eT), rh < 0x0 && (rh += eT), Math[uK(0xa7d)]((rh / eT) * 0xff)
      );
    }
    function eV(rh) {
      const uL = ut;
      if (!rh || rh[uL(0xed7)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        uL(0xcc4)
      ](rh);
    }
    function eW(rh, ri) {
      return dF[rh + (ri > 0x0 ? "_" + ri : "")];
    }
    var eX = da[ut(0x86a)]((rh) => rh[ut(0xb5f)]() + ut(0x86f)),
      eY = da[ut(0x86a)]((rh) => ut(0xd3a) + rh + ut(0x3ce)),
      eZ = {};
    eX[ut(0xaa2)]((rh) => {
      eZ[rh] = 0x0;
    });
    var f0 = {};
    eY[ut(0xaa2)]((rh) => {
      f0[rh] = 0x0;
    });
    var f1 = 0x1 / 0x3e8 / 0x3c / 0x3c;
    function f2() {
      const uM = ut;
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
        timeJoined: Date[uM(0x8ea)]() * f1,
      };
    }
    var f3 = ut(0x9ee)[ut(0xda2)]("\x20");
    function f4(rh) {
      const ri = {};
      for (let rj in rh) {
        ri[rh[rj]] = rj;
      }
      return ri;
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
    for (let rh = 0x0; rh < f5[ut(0xed7)]; rh++) {
      const ri = f5[rh],
        rj = ri[ri[ut(0xed7)] - 0x1],
        rk = dO(rj);
      for (let rl = 0x0; rl < rk[ut(0xed7)]; rl++) {
        const rm = rk[rl];
        if (rm[0x0] < 0x1e) {
          let rn = rm[0x0];
          (rn *= 1.5),
            rn < 1.5 && (rn *= 0xa),
            (rn = parseFloat(rn[ut(0x284)](0x3))),
            (rm[0x0] = rn);
        }
        rm[0x1] = d9[ut(0xd1a)];
      }
      rk[ut(0xbc0)]([0.01, d9[ut(0x9ca)]]), ri[ut(0xbc0)](rk);
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
    function f7(ro, rp) {
      var rq = Math["PI"] * 0x2,
        rr = (rp - ro) % rq;
      return ((0x2 * rr) % rq) - rr;
    }
    function f8(ro, rp, rq) {
      return ro + f7(ro, rp) * rq;
    }
    var f9 = {
      instagram: ut(0x7d6),
      discord: ut(0xcef),
      paw: ut(0x49d),
      gear: ut(0x899),
      scroll: ut(0xa7c),
      bag: ut(0x7f0),
      food: ut(0x85e),
      graph: ut(0x83b),
      resize: ut(0xe51),
      users: ut(0x467),
      trophy: ut(0x394),
      shop: ut(0x581),
      dice: ut(0x584),
      data: ut(0x8d7),
      poopPath: new Path2D(ut(0x652)),
    };
    function fa(ro) {
      const uN = ut;
      return ro[uN(0xd73)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fb(ro) {
      const uO = ut;
      if(hack.isEnabled('disableChatCheck')) return ro;
      return (
        (ro = fa(ro)),
        (ro = ro[uO(0xd73)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uO(0xd73)](/(.)\1{2,}/gi, "$1")
          [uO(0xd73)](/\u200B|\u200C|\u200D/g, "")
          [uO(0x6e4)]()),
        !ro && (ro = uO(0x26b)),
        ro
      );
    }
    var fc = 0x10c;
    function fd(ro) {
      const uP = ut,
        rp = ro[uP(0xda2)]("\x0a")[uP(0xa93)](
          (rq) => rq[uP(0x6e4)]()[uP(0xed7)] > 0x0
        );
      return { title: rp[uP(0xd38)](), content: rp };
    }
    const fe = {};
    (fe[ut(0xb30)] = ut(0x458)),
      (fe[ut(0xe2b)] = [
        ut(0xc02),
        ut(0xbf4),
        ut(0xb64),
        ut(0x42c),
        ut(0x469),
        ut(0x704),
        ut(0x904),
        ut(0x9a8),
      ]);
    const ff = {};
    (ff[ut(0xb30)] = ut(0x424)), (ff[ut(0xe2b)] = [ut(0xc05)]);
    const fg = {};
    (fg[ut(0xb30)] = ut(0x49a)),
      (fg[ut(0xe2b)] = [ut(0xb12), ut(0xbed), ut(0xa34), ut(0xa18)]);
    const fh = {};
    (fh[ut(0xb30)] = ut(0x532)),
      (fh[ut(0xe2b)] = [
        ut(0xd16),
        ut(0x72a),
        ut(0xe47),
        ut(0x2a4),
        ut(0x265),
        ut(0x5d3),
        ut(0x2b5),
        ut(0xb4d),
        ut(0xc12),
      ]);
    const fi = {};
    (fi[ut(0xb30)] = ut(0x223)),
      (fi[ut(0xe2b)] = [ut(0x798), ut(0x39d), ut(0x546), ut(0xa74)]);
    const fj = {};
    (fj[ut(0xb30)] = ut(0xe80)), (fj[ut(0xe2b)] = [ut(0xa04)]);
    const fk = {};
    (fk[ut(0xb30)] = ut(0x737)), (fk[ut(0xe2b)] = [ut(0xb32), ut(0x575)]);
    const fl = {};
    (fl[ut(0xb30)] = ut(0xa6d)),
      (fl[ut(0xe2b)] = [
        ut(0xe7a),
        ut(0xcfc),
        ut(0xf18),
        ut(0xe13),
        ut(0x8ac),
        ut(0xef9),
        ut(0xd25),
        ut(0x594),
      ]);
    const fm = {};
    (fm[ut(0xb30)] = ut(0xf04)),
      (fm[ut(0xe2b)] = [
        ut(0x5d8),
        ut(0x782),
        ut(0xed6),
        ut(0x2ec),
        ut(0xdc9),
        ut(0x6a4),
        ut(0x4f3),
        ut(0xbc8),
      ]);
    const fn = {};
    (fn[ut(0xb30)] = ut(0xef7)), (fn[ut(0xe2b)] = [ut(0x569)]);
    const fo = {};
    (fo[ut(0xb30)] = ut(0x20a)),
      (fo[ut(0xe2b)] = [
        ut(0x9c2),
        ut(0xbb5),
        ut(0x3a5),
        ut(0x830),
        ut(0xb49),
        ut(0x91c),
        ut(0x602),
      ]);
    const fp = {};
    (fp[ut(0xb30)] = ut(0x867)), (fp[ut(0xe2b)] = [ut(0xd94)]);
    const fq = {};
    (fq[ut(0xb30)] = ut(0x3ae)),
      (fq[ut(0xe2b)] = [ut(0xb4e), ut(0x56c), ut(0x907), ut(0x29c)]);
    const fr = {};
    (fr[ut(0xb30)] = ut(0xa2d)), (fr[ut(0xe2b)] = [ut(0x243), ut(0xd5a)]);
    const fs = {};
    (fs[ut(0xb30)] = ut(0x974)),
      (fs[ut(0xe2b)] = [ut(0x7a4), ut(0x55b), ut(0xb4f), ut(0x6b6)]);
    const ft = {};
    (ft[ut(0xb30)] = ut(0x57a)),
      (ft[ut(0xe2b)] = [ut(0xbde), ut(0xabb), ut(0x2eb), ut(0x437)]);
    const fu = {};
    (fu[ut(0xb30)] = ut(0xa8e)),
      (fu[ut(0xe2b)] = [
        ut(0x317),
        ut(0x3a6),
        ut(0x3fe),
        ut(0xb45),
        ut(0xa97),
        ut(0x7ba),
      ]);
    const fv = {};
    (fv[ut(0xb30)] = ut(0xe9b)), (fv[ut(0xe2b)] = [ut(0xa72)]);
    const fw = {};
    (fw[ut(0xb30)] = ut(0x852)), (fw[ut(0xe2b)] = [ut(0x266), ut(0xe38)]);
    const fx = {};
    (fx[ut(0xb30)] = ut(0xc06)),
      (fx[ut(0xe2b)] = [ut(0xee4), ut(0xa45), ut(0x7be)]);
    const fy = {};
    (fy[ut(0xb30)] = ut(0x8d0)),
      (fy[ut(0xe2b)] = [ut(0x26e), ut(0xf2f), ut(0xa67), ut(0xae7), ut(0xe11)]);
    const fz = {};
    (fz[ut(0xb30)] = ut(0xc68)), (fz[ut(0xe2b)] = [ut(0xc46), ut(0xc3a)]);
    const fA = {};
    (fA[ut(0xb30)] = ut(0x659)),
      (fA[ut(0xe2b)] = [ut(0x3b9), ut(0x6c7), ut(0x4ac)]);
    const fB = {};
    (fB[ut(0xb30)] = ut(0xbdf)), (fB[ut(0xe2b)] = [ut(0xb16)]);
    const fC = {};
    (fC[ut(0xb30)] = ut(0x756)), (fC[ut(0xe2b)] = [ut(0x3ca)]);
    const fD = {};
    (fD[ut(0xb30)] = ut(0xac6)), (fD[ut(0xe2b)] = [ut(0xed5)]);
    const fE = {};
    (fE[ut(0xb30)] = ut(0xc1f)),
      (fE[ut(0xe2b)] = [ut(0xc82), ut(0xa2b), ut(0x973)]);
    const fF = {};
    (fF[ut(0xb30)] = ut(0x5c0)),
      (fF[ut(0xe2b)] = [
        ut(0xca1),
        ut(0xb73),
        ut(0xaf7),
        ut(0xb67),
        ut(0x713),
        ut(0xa8f),
        ut(0xb3a),
        ut(0xb37),
        ut(0x421),
        ut(0x8a8),
        ut(0xc4c),
        ut(0x4de),
        ut(0xccd),
        ut(0xf0d),
      ]);
    const fG = {};
    (fG[ut(0xb30)] = ut(0x51c)),
      (fG[ut(0xe2b)] = [
        ut(0xed2),
        ut(0x893),
        ut(0x872),
        ut(0xdad),
        ut(0x2ad),
        ut(0xd1b),
        ut(0x554),
        ut(0x34d),
      ]);
    const fH = {};
    (fH[ut(0xb30)] = ut(0xb7f)),
      (fH[ut(0xe2b)] = [
        ut(0x9f3),
        ut(0xac2),
        ut(0x6bb),
        ut(0x7ff),
        ut(0x2a0),
        ut(0xe3f),
        ut(0x4ca),
        ut(0x4bd),
        ut(0x8bc),
        ut(0x3f8),
        ut(0xd60),
        ut(0xd82),
        ut(0xe31),
        ut(0xba3),
      ]);
    const fI = {};
    (fI[ut(0xb30)] = ut(0x927)),
      (fI[ut(0xe2b)] = [
        ut(0x67c),
        ut(0x797),
        ut(0xbf0),
        ut(0xef6),
        ut(0xe6a),
        ut(0xc97),
        ut(0xc3b),
      ]);
    const fJ = {};
    (fJ[ut(0xb30)] = ut(0xc14)),
      (fJ[ut(0xe2b)] = [
        ut(0xacb),
        ut(0x1fe),
        ut(0x92a),
        ut(0x501),
        ut(0x614),
        ut(0x723),
        ut(0x4e6),
        ut(0xb78),
        ut(0x33f),
        ut(0x8d5),
        ut(0x693),
        ut(0x58a),
        ut(0xc0a),
        ut(0x96b),
      ]);
    const fK = {};
    (fK[ut(0xb30)] = ut(0xa77)),
      (fK[ut(0xe2b)] = [
        ut(0x9ec),
        ut(0x35c),
        ut(0xe63),
        ut(0xa9c),
        ut(0x74e),
        ut(0x8b0),
        ut(0x766),
        ut(0x3d0),
        ut(0x8c5),
        ut(0x2b9),
        ut(0x78e),
        ut(0x7dd),
        ut(0x898),
        ut(0x963),
        ut(0x345),
      ]);
    const fL = {};
    (fL[ut(0xb30)] = ut(0x937)),
      (fL[ut(0xe2b)] = [
        ut(0xa25),
        ut(0x2be),
        ut(0x3cb),
        ut(0x74a),
        ut(0x844),
        ut(0x3d5),
        ut(0x91a),
        ut(0x448),
        ut(0x431),
        ut(0x472),
        ut(0xdc1),
        ut(0x8bd),
        ut(0xca0),
      ]);
    const fM = {};
    (fM[ut(0xb30)] = ut(0x36b)),
      (fM[ut(0xe2b)] = [
        ut(0x247),
        ut(0xf10),
        ut(0xf14),
        ut(0xe0d),
        ut(0x7f5),
        ut(0x63f),
      ]);
    const fN = {};
    (fN[ut(0xb30)] = ut(0xa81)),
      (fN[ut(0xe2b)] = [
        ut(0xb3e),
        ut(0x6b0),
        ut(0xf0e),
        ut(0xde3),
        ut(0x4f1),
        ut(0x519),
        ut(0xc53),
        ut(0xbd1),
        ut(0x6e0),
      ]);
    const fO = {};
    (fO[ut(0xb30)] = ut(0xa81)),
      (fO[ut(0xe2b)] = [
        ut(0xb5c),
        ut(0xd7f),
        ut(0x332),
        ut(0x4bf),
        ut(0x8b4),
        ut(0xa61),
        ut(0x875),
        ut(0xc8f),
        ut(0x37e),
        ut(0x23d),
        ut(0x82b),
        ut(0x530),
        ut(0xeb9),
        ut(0x7d2),
        ut(0x210),
        ut(0xb8a),
        ut(0x9cd),
      ]);
    const fP = {};
    (fP[ut(0xb30)] = ut(0x52a)), (fP[ut(0xe2b)] = [ut(0x715), ut(0xa44)]);
    const fQ = {};
    (fQ[ut(0xb30)] = ut(0xb1d)),
      (fQ[ut(0xe2b)] = [ut(0xa49), ut(0x99b), ut(0xa55)]);
    const fR = {};
    (fR[ut(0xb30)] = ut(0xc28)),
      (fR[ut(0xe2b)] = [ut(0xc56), ut(0x7fa), ut(0xcd5), ut(0xd3e)]);
    const fS = {};
    (fS[ut(0xb30)] = ut(0x964)),
      (fS[ut(0xe2b)] = [
        ut(0x788),
        ut(0x5b4),
        ut(0x648),
        ut(0xd0e),
        ut(0x724),
        ut(0xcd2),
      ]);
    const fT = {};
    (fT[ut(0xb30)] = ut(0xc83)), (fT[ut(0xe2b)] = [ut(0x73b)]);
    const fU = {};
    (fU[ut(0xb30)] = ut(0x8db)),
      (fU[ut(0xe2b)] = [
        ut(0x993),
        ut(0xd39),
        ut(0x50a),
        ut(0xd55),
        ut(0xb93),
        ut(0x7b5),
        ut(0x502),
        ut(0x87f),
      ]);
    const fV = {};
    (fV[ut(0xb30)] = ut(0x4b1)), (fV[ut(0xe2b)] = [ut(0xe59), ut(0x6df)]);
    const fW = {};
    (fW[ut(0xb30)] = ut(0x5d0)),
      (fW[ut(0xe2b)] = [ut(0xaed), ut(0xe2d), ut(0xce6), ut(0xb71), ut(0x1f1)]);
    const fX = {};
    (fX[ut(0xb30)] = ut(0x848)),
      (fX[ut(0xe2b)] = [
        ut(0x6be),
        ut(0xa47),
        ut(0x665),
        ut(0xd6e),
        ut(0xec9),
        ut(0x883),
        ut(0x5db),
        ut(0x44d),
        ut(0x2d6),
      ]);
    const fY = {};
    (fY[ut(0xb30)] = ut(0xa32)),
      (fY[ut(0xe2b)] = [
        ut(0xcb8),
        ut(0xcb5),
        ut(0x2ae),
        ut(0x68d),
        ut(0x4cb),
        ut(0x497),
        ut(0xc39),
        ut(0x9a7),
      ]);
    const fZ = {};
    (fZ[ut(0xb30)] = ut(0x6d3)),
      (fZ[ut(0xe2b)] = [
        ut(0x2d5),
        ut(0xd46),
        ut(0xefb),
        ut(0x77f),
        ut(0xea5),
        ut(0x6bc),
        ut(0x5dc),
        ut(0xa58),
        ut(0xd30),
      ]);
    const g0 = {};
    (g0[ut(0xb30)] = ut(0x6b2)),
      (g0[ut(0xe2b)] = [
        ut(0xd19),
        ut(0xb05),
        ut(0xb74),
        ut(0x6bc),
        ut(0xaa9),
        ut(0x81c),
        ut(0x40c),
        ut(0xb17),
        ut(0xe42),
        ut(0x220),
        ut(0x2ab),
      ]);
    const g1 = {};
    (g1[ut(0xb30)] = ut(0x6b2)),
      (g1[ut(0xe2b)] = [ut(0x732), ut(0x9b9), ut(0x3e6), ut(0x9c0), ut(0x86e)]);
    const g2 = {};
    (g2[ut(0xb30)] = ut(0xe14)), (g2[ut(0xe2b)] = [ut(0x4b2), ut(0x45e)]);
    const g3 = {};
    (g3[ut(0xb30)] = ut(0x236)), (g3[ut(0xe2b)] = [ut(0x8ba)]);
    const g4 = {};
    (g4[ut(0xb30)] = ut(0xaf1)),
      (g4[ut(0xe2b)] = [ut(0x2f8), ut(0x991), ut(0xc92), ut(0xc89)]);
    const g5 = {};
    (g5[ut(0xb30)] = ut(0xb2f)),
      (g5[ut(0xe2b)] = [ut(0x3b6), ut(0x4ef), ut(0xd05), ut(0x44b)]);
    const g6 = {};
    (g6[ut(0xb30)] = ut(0xb2f)),
      (g6[ut(0xe2b)] = [
        ut(0x271),
        ut(0x766),
        ut(0xee0),
        ut(0x72c),
        ut(0x370),
        ut(0x683),
        ut(0xc5f),
        ut(0x327),
        ut(0x71a),
        ut(0xe0e),
        ut(0x571),
        ut(0xe9f),
        ut(0xf22),
        ut(0x4a1),
        ut(0x6a7),
        ut(0xe3d),
        ut(0x92e),
        ut(0x4b5),
        ut(0xe85),
        ut(0xeb8),
      ]);
    const g7 = {};
    (g7[ut(0xb30)] = ut(0xb7e)),
      (g7[ut(0xe2b)] = [ut(0xc1a), ut(0x5bf), ut(0xea3), ut(0x739)]);
    const g8 = {};
    (g8[ut(0xb30)] = ut(0xaf0)),
      (g8[ut(0xe2b)] = [ut(0x3f1), ut(0x595), ut(0xb3d)]);
    const g9 = {};
    (g9[ut(0xb30)] = ut(0x2f9)),
      (g9[ut(0xe2b)] = [
        ut(0x919),
        ut(0x999),
        ut(0x2a3),
        ut(0x90e),
        ut(0x33e),
        ut(0xd2d),
        ut(0xb84),
        ut(0x60a),
        ut(0x5d9),
        ut(0x1f5),
        ut(0x633),
        ut(0xb57),
        ut(0x76a),
        ut(0xc1c),
        ut(0x2d7),
      ]);
    const ga = {};
    (ga[ut(0xb30)] = ut(0xc88)), (ga[ut(0xe2b)] = [ut(0xdc7), ut(0x39a)]);
    const gb = {};
    (gb[ut(0xb30)] = ut(0x916)),
      (gb[ut(0xe2b)] = [ut(0x718), ut(0x5fc), ut(0xaa1)]);
    const gc = {};
    (gc[ut(0xb30)] = ut(0x273)),
      (gc[ut(0xe2b)] = [ut(0xd59), ut(0x4f8), ut(0xa36)]);
    const gd = {};
    (gd[ut(0xb30)] = ut(0xcac)),
      (gd[ut(0xe2b)] = [ut(0xf11), ut(0x8e1), ut(0x37a), ut(0xcd6)]);
    const ge = {};
    (ge[ut(0xb30)] = ut(0xf2c)),
      (ge[ut(0xe2b)] = [ut(0xba0), ut(0x85d), ut(0x4d7)]);
    const gf = {};
    (gf[ut(0xb30)] = ut(0xe6f)),
      (gf[ut(0xe2b)] = [
        ut(0x766),
        ut(0x75a),
        ut(0x90c),
        ut(0x702),
        ut(0x5b8),
        ut(0xcce),
        ut(0xb09),
        ut(0x27e),
        ut(0xbbe),
        ut(0x2d8),
        ut(0x261),
        ut(0xa35),
        ut(0x7af),
        ut(0x54b),
        ut(0xe17),
        ut(0x206),
        ut(0x735),
        ut(0x767),
        ut(0xb38),
        ut(0xafc),
        ut(0xf47),
        ut(0x33d),
        ut(0x810),
        ut(0x840),
      ]);
    const gg = {};
    (gg[ut(0xb30)] = ut(0x961)),
      (gg[ut(0xe2b)] = [ut(0xda1), ut(0x444), ut(0xc7d), ut(0x8f5)]);
    const gh = {};
    (gh[ut(0xb30)] = ut(0x983)),
      (gh[ut(0xe2b)] = [
        ut(0x2c7),
        ut(0x6cc),
        ut(0xd96),
        ut(0x766),
        ut(0x407),
        ut(0x6e8),
        ut(0x7da),
        ut(0xdb4),
      ]);
    const gi = {};
    (gi[ut(0xb30)] = ut(0x4c6)),
      (gi[ut(0xe2b)] = [
        ut(0x9e1),
        ut(0x49c),
        ut(0x90e),
        ut(0x7e2),
        ut(0x7f2),
        ut(0xceb),
        ut(0x212),
        ut(0x389),
        ut(0xb9c),
        ut(0xebf),
        ut(0x94a),
        ut(0xc00),
        ut(0x9e6),
        ut(0xe09),
        ut(0x7f9),
        ut(0x88f),
        ut(0x26c),
      ]);
    const gj = {};
    (gj[ut(0xb30)] = ut(0x297)),
      (gj[ut(0xe2b)] = [
        ut(0xb00),
        ut(0x78b),
        ut(0x281),
        ut(0x3ee),
        ut(0x29b),
        ut(0x603),
        ut(0x7e4),
        ut(0x624),
        ut(0x7f7),
        ut(0xa10),
        ut(0x881),
      ]);
    const gk = {};
    (gk[ut(0xb30)] = ut(0xa0a)),
      (gk[ut(0xe2b)] = [
        ut(0xd17),
        ut(0xb11),
        ut(0xd77),
        ut(0xb31),
        ut(0xb1a),
        ut(0x930),
        ut(0x7fe),
        ut(0xf19),
        ut(0xd70),
        ut(0xac1),
      ]);
    const gl = {};
    (gl[ut(0xb30)] = ut(0xa0a)),
      (gl[ut(0xe2b)] = [
        ut(0xb5e),
        ut(0xb3f),
        ut(0xb65),
        ut(0xd6c),
        ut(0xd84),
        ut(0x3e9),
        ut(0x5a6),
        ut(0xe2a),
        ut(0xd0f),
        ut(0xc87),
      ]);
    const gm = {};
    (gm[ut(0xb30)] = ut(0x87a)),
      (gm[ut(0xe2b)] = [
        ut(0xb5d),
        ut(0xc55),
        ut(0xb51),
        ut(0x8fb),
        ut(0xe2f),
        ut(0x7ac),
        ut(0x334),
        ut(0xed0),
        ut(0x814),
        ut(0x58b),
      ]);
    const gn = {};
    (gn[ut(0xb30)] = ut(0x87a)),
      (gn[ut(0xe2b)] = [
        ut(0x732),
        ut(0x200),
        ut(0x36e),
        ut(0xdc4),
        ut(0xc25),
        ut(0xc8c),
        ut(0x84b),
        ut(0x484),
        ut(0xd64),
        ut(0x333),
        ut(0x8a9),
      ]);
    const go = {};
    (go[ut(0xb30)] = ut(0xe0b)),
      (go[ut(0xe2b)] = [ut(0xd97), ut(0xc90), ut(0x2fe)]);
    const gp = {};
    (gp[ut(0xb30)] = ut(0xe0b)),
      (gp[ut(0xe2b)] = [
        ut(0x577),
        ut(0x35a),
        ut(0xdda),
        ut(0x8cf),
        ut(0x285),
        ut(0xec3),
        ut(0x2d1),
        ut(0x929),
      ]);
    const gq = {};
    (gq[ut(0xb30)] = ut(0xc27)),
      (gq[ut(0xe2b)] = [ut(0xf23), ut(0xbf3), ut(0xdec)]);
    const gr = {};
    (gr[ut(0xb30)] = ut(0xc27)),
      (gr[ut(0xe2b)] = [
        ut(0xe4c),
        ut(0x6e0),
        ut(0x72e),
        ut(0x7f3),
        ut(0xd26),
        ut(0x7a1),
      ]);
    const gs = {};
    (gs[ut(0xb30)] = ut(0xc27)),
      (gs[ut(0xe2b)] = [ut(0x629), ut(0xdd6), ut(0x896), ut(0x2d4)]);
    const gt = {};
    (gt[ut(0xb30)] = ut(0xc27)),
      (gt[ut(0xe2b)] = [
        ut(0x288),
        ut(0xee6),
        ut(0xc16),
        ut(0x310),
        ut(0xf25),
        ut(0x734),
        ut(0x721),
        ut(0x8fe),
        ut(0xd85),
        ut(0xd22),
        ut(0xc4f),
      ]);
    const gu = {};
    (gu[ut(0xb30)] = ut(0xf03)),
      (gu[ut(0xe2b)] = [ut(0xdb2), ut(0x61f), ut(0xf35)]);
    const gv = {};
    (gv[ut(0xb30)] = ut(0xe92)),
      (gv[ut(0xe2b)] = [
        ut(0xe48),
        ut(0x27f),
        ut(0x6e0),
        ut(0xc0b),
        ut(0x403),
        ut(0x7fd),
        ut(0x9cb),
        ut(0xeec),
        ut(0x1fc),
        ut(0x38e),
        ut(0x59c),
        ut(0x82d),
        ut(0x90e),
        ut(0xb1c),
        ut(0xbfc),
        ut(0xa6e),
        ut(0xef2),
        ut(0x588),
        ut(0xeb6),
        ut(0xc96),
        ut(0x91f),
        ut(0xc2d),
        ut(0xad6),
        ut(0x79d),
        ut(0xed4),
        ut(0xe1d),
        ut(0x8de),
        ut(0x3d3),
        ut(0x94c),
        ut(0x9bc),
        ut(0x63a),
        ut(0xaa6),
        ut(0x312),
        ut(0x2ca),
      ]);
    const gw = {};
    (gw[ut(0xb30)] = ut(0xc61)), (gw[ut(0xe2b)] = [ut(0x667)]);
    const gx = {};
    (gx[ut(0xb30)] = ut(0x5a3)),
      (gx[ut(0xe2b)] = [
        ut(0x6f4),
        ut(0x20b),
        ut(0xbb9),
        ut(0x4c2),
        ut(0x661),
        ut(0x72b),
        ut(0xc94),
        ut(0x90e),
        ut(0x632),
        ut(0xb2b),
        ut(0xd1c),
        ut(0x7e5),
        ut(0x4c7),
        ut(0x8a0),
        ut(0xd49),
        ut(0xd34),
        ut(0xb8f),
        ut(0x6a8),
        ut(0x3a1),
        ut(0x24b),
        ut(0x2c3),
        ut(0xaaa),
        ut(0xbc9),
        ut(0x4d4),
        ut(0x395),
        ut(0x28e),
        ut(0x606),
        ut(0x6c2),
        ut(0xc41),
        ut(0xe71),
        ut(0xaa6),
        ut(0x672),
        ut(0xf3f),
        ut(0xb0a),
        ut(0x9ed),
      ]);
    const gy = {};
    (gy[ut(0xb30)] = ut(0xb54)),
      (gy[ut(0xe2b)] = [
        ut(0x67f),
        ut(0x3d8),
        ut(0x68a),
        ut(0x89a),
        ut(0x56b),
        ut(0x447),
        ut(0x90e),
        ut(0xdf9),
        ut(0x248),
        ut(0x812),
        ut(0xa71),
        ut(0xef5),
        ut(0x780),
        ut(0xe87),
        ut(0x8f7),
        ut(0x6c9),
        ut(0x656),
        ut(0xc67),
        ut(0x9f4),
        ut(0x489),
        ut(0xee3),
        ut(0xb8f),
        ut(0x360),
        ut(0xf41),
        ut(0x7ab),
        ut(0xd6b),
        ut(0x540),
        ut(0xbdb),
        ut(0x2fd),
        ut(0x53a),
        ut(0xc49),
        ut(0x9fe),
        ut(0x6d1),
        ut(0x65c),
        ut(0xaa6),
        ut(0xefd),
        ut(0x8a5),
        ut(0xcd7),
        ut(0xbb1),
      ]);
    const gz = {};
    (gz[ut(0xb30)] = ut(0x62d)),
      (gz[ut(0xe2b)] = [
        ut(0x5c2),
        ut(0x9c4),
        ut(0xaa6),
        ut(0xaae),
        ut(0x522),
        ut(0x3bb),
        ut(0x362),
        ut(0xe01),
        ut(0x24a),
        ut(0x90e),
        ut(0x73a),
        ut(0xd99),
        ut(0x617),
        ut(0x28d),
      ]);
    const gA = {};
    (gA[ut(0xb30)] = ut(0xa53)),
      (gA[ut(0xe2b)] = [ut(0x90f), ut(0x808), ut(0x7a9), ut(0xa41), ut(0x8e3)]);
    const gB = {};
    (gB[ut(0xb30)] = ut(0x940)),
      (gB[ut(0xe2b)] = [ut(0x3d7), ut(0xd9a), ut(0x3f6), ut(0x40a)]);
    const gC = {};
    (gC[ut(0xb30)] = ut(0x940)),
      (gC[ut(0xe2b)] = [ut(0x6e0), ut(0x9a4), ut(0xbe9)]);
    const gD = {};
    (gD[ut(0xb30)] = ut(0x50b)),
      (gD[ut(0xe2b)] = [ut(0x2fb), ut(0x618), ut(0x79e), ut(0x2ce), ut(0x96f)]);
    const gE = {};
    (gE[ut(0xb30)] = ut(0x50b)),
      (gE[ut(0xe2b)] = [ut(0x6ed), ut(0xf24), ut(0x658), ut(0x6b1)]);
    const gF = {};
    (gF[ut(0xb30)] = ut(0x50b)), (gF[ut(0xe2b)] = [ut(0x67a), ut(0xcdf)]);
    const gG = {};
    (gG[ut(0xb30)] = ut(0xd4a)),
      (gG[ut(0xe2b)] = [
        ut(0xe58),
        ut(0xa2f),
        ut(0x839),
        ut(0xd8d),
        ut(0xd5f),
        ut(0x932),
        ut(0xcf2),
        ut(0xc2c),
        ut(0xc45),
      ]);
    const gH = {};
    (gH[ut(0xb30)] = ut(0x9c1)),
      (gH[ut(0xe2b)] = [
        ut(0xaca),
        ut(0x44a),
        ut(0x733),
        ut(0x51e),
        ut(0xd66),
        ut(0x954),
        ut(0x22a),
      ]);
    const gI = {};
    (gI[ut(0xb30)] = ut(0xdfa)),
      (gI[ut(0xe2b)] = [
        ut(0xc65),
        ut(0x296),
        ut(0x234),
        ut(0x466),
        ut(0x748),
        ut(0x9e9),
        ut(0xe54),
        ut(0x8fa),
        ut(0x6ef),
        ut(0x240),
        ut(0x9bd),
        ut(0x237),
      ]);
    const gJ = {};
    (gJ[ut(0xb30)] = ut(0x547)),
      (gJ[ut(0xe2b)] = [
        ut(0xd86),
        ut(0x792),
        ut(0x92f),
        ut(0x959),
        ut(0xab1),
        ut(0x460),
        ut(0x605),
        ut(0x5c9),
        ut(0x6ad),
        ut(0xe4e),
      ]);
    const gK = {};
    (gK[ut(0xb30)] = ut(0x547)),
      (gK[ut(0xe2b)] = [
        ut(0xe8d),
        ut(0x687),
        ut(0xc1d),
        ut(0x5d1),
        ut(0x5d6),
        ut(0xa37),
      ]);
    const gL = {};
    (gL[ut(0xb30)] = ut(0x9bf)),
      (gL[ut(0xe2b)] = [ut(0xf34), ut(0x613), ut(0x9d1)]);
    const gM = {};
    (gM[ut(0xb30)] = ut(0x9bf)),
      (gM[ut(0xe2b)] = [ut(0x6e0), ut(0x641), ut(0xce2), ut(0x8c0), ut(0x302)]);
    const gN = {};
    (gN[ut(0xb30)] = ut(0xa50)),
      (gN[ut(0xe2b)] = [
        ut(0x471),
        ut(0x626),
        ut(0xdd9),
        ut(0x5de),
        ut(0x66c),
        ut(0x729),
        ut(0xaa6),
        ut(0xf1b),
        ut(0x252),
        ut(0x2ff),
        ut(0x399),
        ut(0x4f0),
        ut(0x90e),
        ut(0x2b1),
        ut(0x459),
        ut(0xee9),
        ut(0x445),
        ut(0x1f4),
        ut(0x705),
      ]);
    const gO = {};
    (gO[ut(0xb30)] = ut(0x556)),
      (gO[ut(0xe2b)] = [
        ut(0x77d),
        ut(0x320),
        ut(0xbf5),
        ut(0x99a),
        ut(0x8c6),
        ut(0xe68),
        ut(0xaf6),
        ut(0xb7b),
      ]);
    const gP = {};
    (gP[ut(0xb30)] = ut(0x556)), (gP[ut(0xe2b)] = [ut(0x21d), ut(0xc31)]);
    const gQ = {};
    (gQ[ut(0xb30)] = ut(0xd2a)), (gQ[ut(0xe2b)] = [ut(0x5a2), ut(0xddc)]);
    const gR = {};
    (gR[ut(0xb30)] = ut(0xd2a)),
      (gR[ut(0xe2b)] = [
        ut(0xbe2),
        ut(0x8f9),
        ut(0x776),
        ut(0x50e),
        ut(0x86d),
        ut(0x433),
        ut(0x36f),
        ut(0x73d),
        ut(0x93c),
      ]);
    const gS = {};
    (gS[ut(0xb30)] = ut(0x9e8)), (gS[ut(0xe2b)] = [ut(0xcc9), ut(0xc5d)]);
    const gT = {};
    (gT[ut(0xb30)] = ut(0x9e8)),
      (gT[ut(0xe2b)] = [
        ut(0xdbc),
        ut(0xb88),
        ut(0x508),
        ut(0x6a6),
        ut(0xe9c),
        ut(0x291),
        ut(0x7bc),
        ut(0x6e0),
        ut(0x890),
      ]);
    const gU = {};
    (gU[ut(0xb30)] = ut(0x217)), (gU[ut(0xe2b)] = [ut(0x849)]);
    const gV = {};
    (gV[ut(0xb30)] = ut(0x217)),
      (gV[ut(0xe2b)] = [
        ut(0x62a),
        ut(0x97f),
        ut(0xa60),
        ut(0x67e),
        ut(0x6e0),
        ut(0x4ae),
        ut(0x827),
      ]);
    const gW = {};
    (gW[ut(0xb30)] = ut(0x217)),
      (gW[ut(0xe2b)] = [ut(0x9a1), ut(0xc0e), ut(0xc4b)]);
    const gX = {};
    (gX[ut(0xb30)] = ut(0xea9)),
      (gX[ut(0xe2b)] = [ut(0x890), ut(0xe30), ut(0xe95), ut(0x374)]);
    const gY = {};
    (gY[ut(0xb30)] = ut(0xea9)), (gY[ut(0xe2b)] = [ut(0x55d)]);
    const gZ = {};
    (gZ[ut(0xb30)] = ut(0xea9)),
      (gZ[ut(0xe2b)] = [ut(0x3a8), ut(0x29e), ut(0x6c5), ut(0xc3c), ut(0xe2e)]);
    const h0 = {};
    (h0[ut(0xb30)] = ut(0x222)),
      (h0[ut(0xe2b)] = [ut(0x46b), ut(0xadc), ut(0xcae)]);
    const h1 = {};
    (h1[ut(0xb30)] = ut(0xc7a)), (h1[ut(0xe2b)] = [ut(0xb5a), ut(0x510)]);
    const h2 = {};
    (h2[ut(0xb30)] = ut(0xe7c)), (h2[ut(0xe2b)] = [ut(0xcfd), ut(0x57b)]);
    const h3 = {};
    (h3[ut(0xb30)] = ut(0x66e)), (h3[ut(0xe2b)] = [ut(0x8b2)]);
    var h4 = [
      fd(ut(0x7ee)),
      fd(ut(0xe84)),
      fd(ut(0xb4b)),
      fd(ut(0xaa3)),
      fd(ut(0xc33)),
      fd(ut(0xaa0)),
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
    console[ut(0x3d1)](ut(0x80e));
    var h5 = Date[ut(0x8ea)]() < 0x18e9c4b6482,
      h6 = Math[ut(0x7ce)](Math[ut(0xb69)]() * 0xa);
    function h7(ro) {
      const uQ = ut,
        rp = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let rq = "";
      for (const rr of ro) {
        rr === "\x20"
          ? (rq += "\x20")
          : (rq += rp[(h6 + rr[uQ(0xdd7)](0x0)) % rp[uQ(0xed7)]]);
      }
      return rq;
    }
    h5 &&
      document[ut(0xb01)](ut(0x843))[ut(0x4e7)](
        ut(0x873),
        h7(ut(0x7c0)) + ut(0xaeb)
      );
    function h8(ro, rp, rq) {
      const uR = ut,
        rr = rp - ro;
      if (Math[uR(0x301)](rr) < 0.01) return rp;
      return ro + rr * (0x1 - Math[uR(0x6f3)](-rq * pP));
    }
    var h9 = [],
      ha = 0x0;
    function hb(ro, rp = 0x1388) {
      const uS = ut,
        rq = nO(uS(0x290) + jw(ro) + uS(0x65d));
      kH[uS(0x2e9)](rq);
      let rr = 0x0;
      rs();
      function rs() {
        const uT = uS;
        (rq[uT(0x49b)][uT(0x977)] = uT(0x3c5) + ha + uT(0x6b5)),
          (rq[uT(0x49b)][uT(0x7e8)] = rr);
      }
      (this[uS(0xab6)] = ![]),
        (this[uS(0x915)] = () => {
          const uU = uS;
          rp -= pO;
          const rt = rp > 0x0 ? 0x1 : 0x0;
          (rr = h8(rr, rt, 0.3)),
            rs(),
            rp < 0x0 &&
              rr <= 0x0 &&
              (rq[uU(0xeae)](), (this[uU(0xab6)] = !![])),
            (ha += rr * (rq[uU(0xf21)] + 0x5));
        }),
        h9[uS(0xbc0)](this);
    }
    function hc(ro) {
      new hb(ro, 0x1388);
    }
    function hd() {
      const uV = ut;
      ha = 0x0;
      for (let ro = h9[uV(0xed7)] - 0x1; ro >= 0x0; ro--) {
        const rp = h9[ro];
        rp[uV(0x915)](), rp[uV(0xab6)] && h9[uV(0xdba)](ro, 0x1);
      }
    }
    var he = !![],
      hf = document[ut(0xb01)](ut(0x321));
    fetch(ut(0xe8a))
      [ut(0xc09)]((ro) => {
        const uW = ut;
        (hf[uW(0x49b)][uW(0xdaa)] = uW(0x30c)), (he = ![]);
      })
      [ut(0xe1b)]((ro) => {
        const uX = ut;
        hf[uX(0x49b)][uX(0xdaa)] = "";
      });
    var hg = document[ut(0xb01)](ut(0xc86)),
      hh = Date[ut(0x8ea)]();
    function hi() {
      const uY = ut;
      console[uY(0x3d1)](uY(0xebc)),
        (hh = Date[uY(0x8ea)]()),
        (hg[uY(0x49b)][uY(0xdaa)] = "");
      try {
        aiptag[uY(0x621)][uY(0xdaa)][uY(0xbc0)](function () {
          const uZ = uY;
          aipDisplayTag[uZ(0xdaa)](uZ(0x9b1));
        }),
          aiptag[uY(0x621)][uY(0xdaa)][uY(0xbc0)](function () {
            const v0 = uY;
            aipDisplayTag[v0(0xdaa)](v0(0x777));
          });
      } catch (ro) {
        console[uY(0x3d1)](uY(0x371));
      }
    }
    setInterval(function () {
      const v1 = ut;
      hg[v1(0x49b)][v1(0xdaa)] === "" &&
        Date[v1(0x8ea)]() - hh > 0x7530 &&
        hi();
    }, 0x2710);
    var hj = null,
      hk = 0x0;
    function hl() {
      const v2 = ut;
      console[v2(0x3d1)](v2(0x453)),
        typeof aiptag[v2(0xaf3)] !== v2(0x2d3)
          ? ((hj = 0x45),
            (hk = Date[v2(0x8ea)]()),
            aiptag[v2(0x621)][v2(0x455)][v2(0xbc0)](function () {
              const v3 = v2;
              aiptag[v3(0xaf3)][v3(0xbd8)]();
            }))
          : window[v2(0xa63)](v2(0xbcd));
    }
    window[ut(0xa63)] = function (ro) {
      const v4 = ut;
      console[v4(0x3d1)](v4(0xd9c) + ro);
      if (ro === v4(0x4e9) || ro[v4(0x757)](v4(0xd3b)) > -0x1) {
        if (hj !== null && Date[v4(0x8ea)]() - hk > 0xbb8) {
          console[v4(0x3d1)](v4(0x2dd));
          if (hW) {
            const rp = {};
            (rp[v4(0xb30)] = v4(0xc21)),
              (rp[v4(0x97a)] = ![]),
              kI(
                v4(0x59f),
                (rq) => {
                  const v5 = v4;
                  rq &&
                    hW &&
                    (il(new Uint8Array([cI[v5(0x945)]])), hK(v5(0xcf6)));
                },
                rp
              );
          }
        } else hK(v4(0xd89));
      } else alert(v4(0xacf) + ro);
      hm[v4(0xa1b)][v4(0xeae)](v4(0x3e0)), (hj = null);
    };
    var hm = document[ut(0xb01)](ut(0x926));
    (hm[ut(0x4c5)] = function () {
      const v6 = ut;
      hm[v6(0xa1b)][v6(0xde0)](v6(0x3e0)), hl();
    }),
      (hm[ut(0x558)] = function () {
        const v7 = ut;
        return nO(
          v7(0x311) + hP[v7(0xd1a)] + v7(0xd54) + hP[v7(0xd2b)] + v7(0x307)
        );
      }),
      (hm[ut(0x8e7)] = !![]);
    var hn = [
        ut(0x511),
        ut(0x3c6),
        ut(0x24c),
        ut(0x493),
        ut(0x75f),
        ut(0x85a),
        ut(0xa1e),
        ut(0x518),
        ut(0xdb8),
        ut(0x41f),
        ut(0x325),
        ut(0xb6a),
      ],
      ho = document[ut(0xb01)](ut(0x5da)),
      hp =
        Date[ut(0x8ea)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[ut(0x7ce)](Math[ut(0xb69)]() * hn[ut(0xed7)]);
    hr();
    function hq(ro) {
      const v8 = ut;
      (hp += ro),
        hp < 0x0 ? (hp = hn[v8(0xed7)] - 0x1) : (hp %= hn[v8(0xed7)]),
        hr();
    }
    function hr() {
      const v9 = ut,
        ro = hn[hp];
      (ho[v9(0x49b)][v9(0xba2)] =
        v9(0x842) + ro[v9(0xda2)](v9(0x201))[0x1] + v9(0x3df)),
        (ho[v9(0x4c5)] = function () {
          const va = v9;
          window[va(0xbdc)](ro, va(0x28b)), hq(0x1);
        });
    }
    (document[ut(0xb01)](ut(0x483))[ut(0x4c5)] = function () {
      hq(-0x1);
    }),
      (document[ut(0xb01)](ut(0x551))[ut(0x4c5)] = function () {
        hq(0x1);
      });
    var hs = document[ut(0xb01)](ut(0xe66));
    hs[ut(0x558)] = function () {
      const vb = ut;
      return nO(
        vb(0x311) + hP[vb(0xd1a)] + vb(0x75b) + hP[vb(0xd4c)] + vb(0xd06)
      );
    };
    var ht = document[ut(0xb01)](ut(0x82c)),
      hu = document[ut(0xb01)](ut(0x7df)),
      hv = ![];
    function hw() {
      const vc = ut;
      let ro = "";
      for (let rq = 0x0; rq < h4[vc(0xed7)]; rq++) {
        const { title: rr, content: rs } = h4[rq];
        (ro += vc(0x6bd) + rr + vc(0x5cb)),
          rs[vc(0xaa2)]((rt, ru) => {
            const vd = vc;
            let rv = "-\x20";
            if (rt[0x0] === "*") {
              const rw = rt[ru + 0x1];
              if (rw && rw[0x0] === "*") rv = vd(0xba6);
              else rv = vd(0x7b0);
              rt = rt[vd(0xe22)](0x1);
            }
            (rt = rv + rt), (ro += vd(0xb48) + rt + vd(0xec2));
          }),
          (ro += vc(0x673));
      }
      const rp = hD[vc(0x620)];
      (hv = rp !== void 0x0 && parseInt(rp) < fc), (ht[vc(0x26f)] = ro);
    }
    CanvasRenderingContext2D[ut(0xdd1)][ut(0x2db)] = function (ro) {
      const ve = ut;
      this[ve(0x1f7)](ro, ro);
    };
    var hx = ![];
    hx &&
      (OffscreenCanvasRenderingContext2D[ut(0xdd1)][ut(0x2db)] = function (ro) {
        const vf = ut;
        this[vf(0x1f7)](ro, ro);
      });
    function hy(ro, rp, rq) {
      const rr = 0x1 - rq;
      return [
        ro[0x0] * rq + rp[0x0] * rr,
        ro[0x1] * rq + rp[0x1] * rr,
        ro[0x2] * rq + rp[0x2] * rr,
      ];
    }
    var hz = {};
    function hA(ro) {
      const vg = ut;
      return (
        !hz[ro] &&
          (hz[ro] = [
            parseInt(ro[vg(0xe22)](0x1, 0x3), 0x10),
            parseInt(ro[vg(0xe22)](0x3, 0x5), 0x10),
            parseInt(ro[vg(0xe22)](0x5, 0x7), 0x10),
          ]),
        hz[ro]
      );
    }
    var hB = document[ut(0xeb2)](ut(0x475)),
      hC = document[ut(0x7bd)](ut(0x43b));
    for (let ro = 0x0; ro < hC[ut(0xed7)]; ro++) {
      const rp = hC[ro],
        rq = f9[rp[ut(0x990)](ut(0x823))];
      rq && rp[ut(0x1fd)](nO(rq), rp[ut(0x477)][0x0]);
    }
    var hD;
    try {
      hD = localStorage;
    } catch (rr) {
      console[ut(0x3ed)](ut(0xbec), rr), (hD = {});
    }
    var hE = document[ut(0xb01)](ut(0x579)),
      hF = document[ut(0xb01)](ut(0x7a2)),
      hG = document[ut(0xb01)](ut(0x9e5));
    (hE[ut(0x558)] = function () {
      const vh = ut;
      return nO(
        vh(0xc80) + hP[vh(0xa94)] + vh(0xc6c) + cN + vh(0x740) + cM + vh(0x5e8)
      );
    }),
      (hF[ut(0x6de)] = cM),
      (hF[ut(0x6c6)] = function () {
        const vi = ut;
        !cO[vi(0xcc4)](this[vi(0x95d)]) &&
          (this[vi(0x95d)] = this[vi(0x95d)][vi(0xd73)](cP, ""));
      });
    var hH,
      hI = document[ut(0xb01)](ut(0x644));
    function hJ(rs) {
      const vj = ut;
      rs ? k8(hI, rs + vj(0x711)) : k8(hI, vj(0x850)),
        (hE[vj(0x49b)][vj(0xdaa)] =
          rs && rs[vj(0x757)]("\x20") === -0x1 ? vj(0x30c) : "");
    }
    hG[ut(0x4c5)] = nu(function () {
      const vk = ut;
      if (!hW || jy) return;
      const rs = hF[vk(0x95d)],
        rt = rs[vk(0xed7)];
      if (rt < cN) hc(vk(0xd7c));
      else {
        if (rt > cM) hc(vk(0xd32));
        else {
          if (!cO[vk(0xcc4)](rs)) hc(vk(0x538));
          else {
            hc(vk(0xcba), hP[vk(0xd4c)]), (hH = rs);
            const ru = new Uint8Array([
              cI[vk(0x2ba)],
              ...new TextEncoder()[vk(0x7fb)](rs),
            ]);
            il(ru);
          }
        }
      }
    });
    function hK(rs, rt = nh[ut(0xb60)]) {
      nk(-0x1, null, rs, rt);
    }
    hw();
    var hL = f4(cR),
      hM = f4(cS),
      hN = f4(d9);
    const hO = {};
    (hO[ut(0xa94)] = ut(0x8b1)),
      (hO[ut(0xd4c)] = ut(0x4d5)),
      (hO[ut(0x5bc)] = ut(0x22d)),
      (hO[ut(0x411)] = ut(0xdf7)),
      (hO[ut(0x3f3)] = ut(0x392)),
      (hO[ut(0xd2b)] = ut(0xabf)),
      (hO[ut(0xd1a)] = ut(0xead)),
      (hO[ut(0x9ca)] = ut(0x882)),
      (hO[ut(0xa89)] = ut(0x65b));
    var hP = hO,
      hQ = Object[ut(0x6a2)](hP),
      hR = [];
    for (let rs = 0x0; rs < hQ[ut(0xed7)]; rs++) {
      const rt = hQ[rs],
        ru = rt[ut(0xe22)](0x4, rt[ut(0x757)](")"))
          [ut(0xda2)](",\x20")
          [ut(0x86a)]((rv) => parseInt(rv) * 0.8);
      hR[ut(0xbc0)](pZ(ru));
    }
    hS(ut(0xe35), ut(0xcb6)),
      hS(ut(0xf32), ut(0xd68)),
      hS(ut(0x314), ut(0x4e2)),
      hS(ut(0xb02), ut(0x612)),
      hS(ut(0x582), ut(0x3e4)),
      hS(ut(0x978), ut(0xc77)),
      hS(ut(0xe5d), ut(0x9aa));
    function hS(rv, rw) {
      const vl = ut;
      document[vl(0xb01)](rv)[vl(0x4c5)] = function () {
        const vm = vl;
        window[vm(0xbdc)](rw, vm(0x28b));
      };
    }
    setInterval(function () {
      const vn = ut;
      hW && il(new Uint8Array([cI[vn(0x70d)]]));
    }, 0x3e8);
    function hT() {
      const vo = ut;
      (pL = [pS]),
        (j6[vo(0x80d)] = !![]),
        (j6 = {}),
        (jG = 0x0),
        (jH[vo(0xed7)] = 0x0),
        (iw = []),
        (iG[vo(0xed7)] = 0x0),
        (iC[vo(0x26f)] = ""),
        (iv = {}),
        (iH = ![]),
        (iy = null),
        (ix = null),
        (pB = 0x0),
        (hW = ![]),
        (mD = 0x0),
        (mC = 0x0),
        (mn = ![]),
        (mj[vo(0x49b)][vo(0xdaa)] = vo(0x30c)),
        (q3[vo(0x49b)][vo(0xdaa)] = q2[vo(0x49b)][vo(0xdaa)] = vo(0x30c)),
        (pz = 0x0),
        (pA = 0x0);
    }
    var hU;
    function hV(rv) {
      const vp = ut;
      (jh[vp(0x49b)][vp(0xdaa)] = vp(0x30c)),
        (pg[vp(0x49b)][vp(0xdaa)] = vp(0x30c)),
        hZ(),
        kA[vp(0xa1b)][vp(0xde0)](vp(0xd5b)),
        kB[vp(0xa1b)][vp(0xeae)](vp(0xd5b)),
        hT(),
        console[vp(0x3d1)](vp(0xb0e) + rv + vp(0xe83)),
        iu(),
        (hU = new WebSocket(rv)),
        (hU[vp(0x9eb)] = vp(0x53e)),
        (hU[vp(0x2ef)] = hX),
        (hU[vp(0x25a)] = k1),
        (hU[vp(0x2b0)] = kg);
    }
    crypto[ut(0x274)] =
      crypto[ut(0x274)] ||
      function rv() {
        const vq = ut;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vq(0xd73)
        ](/[018]/g, (rw) =>
          (rw ^
            (crypto[vq(0x5b1)](new Uint8Array(0x1))[0x0] &
              (0xf >> (rw / 0x4))))[vq(0xb9b)](0x10)
        );
      };
    var hW = ![];
    function hX() {
      const vr = ut;
      console[vr(0x3d1)](vr(0xa95)), ie();
      hack.preload();
    }
    var hY = document[ut(0xb01)](ut(0xc08));
    function hZ() {
      const vs = ut;
      hY[vs(0x49b)][vs(0xdaa)] = vs(0x30c);
    }
    var i0 = document[ut(0xb01)](ut(0x464)),
      i1 = document[ut(0xb01)](ut(0x4df)),
      i2 = document[ut(0xb01)](ut(0xacd)),
      i3 = document[ut(0xb01)](ut(0xe57));
    i3[ut(0x4c5)] = function () {
      const vt = ut;
      !i6 &&
        (window[vt(0x5af)][vt(0x3a0)] =
          vt(0xd01) +
          encodeURIComponent(!window[vt(0x664)] ? vt(0xe15) : vt(0xc5a)) +
          vt(0x70e) +
          encodeURIComponent(btoa(i5)));
    };
    var i4 = document[ut(0xb01)](ut(0xcf0));
    (i4[ut(0x4c5)] = function () {
      const vu = ut;
      i5 == hD[vu(0x62f)] && delete hD[vu(0x62f)];
      delete hD[vu(0x4da)];
      if (hU)
        try {
          hU[vu(0x67b)]();
        } catch (rw) {}
    }),
      hZ();
    var i5, i6;
    function i7(rw) {
      const vw = ut;
      try {
        let ry = function (rz) {
          const vv = b;
          return rz[vv(0xd73)](/([.*+?\^$(){}|\[\]\/\\])/g, vv(0x7c5));
        };
        var rx = document[vw(0xe0a)][vw(0x7ca)](
          RegExp(vw(0xbb2) + ry(rw) + vw(0xe5e))
        );
        return rx ? rx[0x1] : null;
      } catch (rz) {
        return "";
      }
    }
    var i8 = !window[ut(0x664)];
    function i9(rw) {
      const vx = ut;
      try {
        document[vx(0xe0a)] = rw + vx(0x6d4) + (i8 ? vx(0xae0) : "");
      } catch (rx) {}
    }
    var ia = 0x0,
      ib;
    function ic() {
      const vy = ut;
      (ia = 0x0), (hW = ![]);
      !eV(hD[vy(0x62f)]) && (hD[vy(0x62f)] = crypto[vy(0x274)]());
      (i5 = hD[vy(0x62f)]), (i6 = hD[vy(0x4da)]);
      !i6 &&
        ((i6 = i7(vy(0x4da))),
        i6 && (i6 = decodeURIComponent(i6)),
        i9(vy(0x4da)));
      if (i6)
        try {
          const rw = i6;
          i6 = JSON[vy(0x1f3)](decodeURIComponent(escape(atob(rw))));
          if (eV(i6[vy(0x4e4)]))
            (i5 = i6[vy(0x4e4)]),
              i1[vy(0x4e7)](vy(0x873), i6[vy(0x244)]),
              i6[vy(0xe24)] &&
                (i2[vy(0x49b)][vy(0xba2)] = vy(0xe1f) + i6[vy(0xe24)] + ")"),
              (hD[vy(0x4da)] = rw);
          else throw new Error(vy(0x918));
        } catch (rx) {
          (i6 = null), delete hD[vy(0x4da)], console[vy(0xb60)](vy(0xc7f) + rx);
        }
      ib = hD[vy(0x434)] || "";
    }
    function ie() {
      ic(), ii();
    }
    function ig() {
      const vz = ut,
        rw = [
          vz(0x6e1),
          vz(0x615),
          vz(0x8e6),
          vz(0xa1f),
          vz(0x64a),
          vz(0x8cd),
          vz(0x7d1),
          vz(0xd9b),
          vz(0x229),
          vz(0x383),
          vz(0xd8c),
          vz(0x282),
          vz(0xb25),
          vz(0xa5c),
          vz(0x8f3),
          vz(0x3de),
          vz(0x994),
          vz(0x355),
          vz(0x878),
          vz(0x682),
          vz(0x924),
          vz(0x763),
          vz(0xf17),
          vz(0x83e),
          vz(0xe62),
          vz(0x359),
          vz(0x81a),
          vz(0x81b),
          vz(0x76e),
          vz(0xc50),
          vz(0x3e8),
          vz(0xb0d),
          vz(0x87b),
          vz(0x68c),
          vz(0x249),
          vz(0x3c3),
          vz(0xa91),
          vz(0xf2a),
          vz(0xc84),
          vz(0xe4a),
          vz(0x9b6),
          vz(0x254),
          vz(0xe7f),
          vz(0x8e8),
          vz(0xb43),
          vz(0xc40),
          vz(0xcee),
          vz(0xd15),
          vz(0x7b4),
          vz(0xab7),
          vz(0x975),
          vz(0x912),
          vz(0x7b9),
          vz(0x9ef),
          vz(0xa6a),
          vz(0x674),
          vz(0x446),
          vz(0xad4),
          vz(0xb5b),
          vz(0xb58),
          vz(0x8cc),
          vz(0x768),
          vz(0x9fa),
          vz(0x509),
        ];
      return (
        (ig = function () {
          return rw;
        }),
        ig()
      );
    }
    function ih(rw, rx) {
      const ry = ig();
      return (
        (ih = function (rz, rA) {
          const vA = b;
          rz = rz - (0x67c * -0x1 + -0x2 * -0xbdd + -0x5 * 0x35b);
          let rB = ry[rz];
          if (ih[vA(0x367)] === void 0x0) {
            var rC = function (rH) {
              const vB = vA,
                rI = vB(0xdef);
              let rJ = "",
                rK = "";
              for (
                let rL = 0xc6a + -0x161c + -0x22 * -0x49,
                  rM,
                  rN,
                  rO = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rN = rH[vB(0x8f2)](rO++));
                ~rN &&
                ((rM =
                  rL % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? rM * (0x2422 + -0x5 * 0x38b + -0x122b) + rN
                    : rN),
                rL++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rJ += String[vB(0xbc3)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (rM >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rL) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rN = rI[vB(0x757)](rN);
              }
              for (
                let rP = 0x23d0 + 0x13 * -0xdf + -0x1343, rQ = rJ[vB(0xed7)];
                rP < rQ;
                rP++
              ) {
                rK +=
                  "%" +
                  ("00" +
                    rJ[vB(0xdd7)](rP)[vB(0xb9b)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vB(0xe22)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
              }
              return decodeURIComponent(rK);
            };
            const rG = function (rH, rI) {
              const vC = vA;
              let rJ = [],
                rK = -0x3 * 0x542 + -0x7d7 * 0x3 + 0x274b,
                rL,
                rM = "";
              rH = rC(rH);
              let rN;
              for (
                rN = 0x2205 + 0x3ac + -0x1 * 0x25b1;
                rN < 0x1e33 + 0x1 * -0x181 + -0x5 * 0x58a;
                rN++
              ) {
                rJ[rN] = rN;
              }
              for (
                rN = 0x91f * 0x4 + -0x554 + -0x1 * 0x1f28;
                rN < 0x2e * 0x43 + 0x12 * 0xc5 + -0x84c * 0x3;
                rN++
              ) {
                (rK =
                  (rK + rJ[rN] + rI[vC(0xdd7)](rN % rI[vC(0xed7)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rL = rJ[rN]),
                  (rJ[rN] = rJ[rK]),
                  (rJ[rK] = rL);
              }
              (rN = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rK = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rO = -0x1d30 + -0x23c8 + 0x40f8;
                rO < rH[vC(0xed7)];
                rO++
              ) {
                (rN =
                  (rN + (0x2309 * -0x1 + 0x5 * -0x8b + -0x1 * -0x25c1)) %
                  (0xc5 * -0x1d + -0x1f03 + 0x3654)),
                  (rK =
                    (rK + rJ[rN]) %
                    (-0x5 * -0x256 + 0x1cf * 0x2 + -0x1e * 0x7a)),
                  (rL = rJ[rN]),
                  (rJ[rN] = rJ[rK]),
                  (rJ[rK] = rL),
                  (rM += String[vC(0xbc3)](
                    rH[vC(0xdd7)](rO) ^
                      rJ[(rJ[rN] + rJ[rK]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return rM;
            };
            (ih[vA(0x722)] = rG), (rw = arguments), (ih[vA(0x367)] = !![]);
          }
          const rD = ry[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rE = rz + rD,
            rF = rw[rE];
          return (
            !rF
              ? (ih[vA(0x4f2)] === void 0x0 && (ih[vA(0x4f2)] = !![]),
                (rB = ih[vA(0x722)](rB, rA)),
                (rw[rE] = rB))
              : (rB = rF),
            rB
          );
        }),
        ih(rw, rx)
      );
    }
    (function (rw, rx) {
      const vD = ut;
      function ry(rE, rF, rG, rH, rI) {
        return ih(rH - 0x124, rI);
      }
      function rz(rE, rF, rG, rH, rI) {
        return ih(rF - -0x245, rE);
      }
      function rA(rE, rF, rG, rH, rI) {
        return ih(rI - -0x1b4, rH);
      }
      function rB(rE, rF, rG, rH, rI) {
        return ih(rE - 0x13, rH);
      }
      const rC = rw();
      function rD(rE, rF, rG, rH, rI) {
        return ih(rG - -0x2b3, rI);
      }
      while (!![]) {
        try {
          const rE =
            (parseInt(ry(0x1a1, 0x1b2, 0x1a9, 0x1b7, vD(0xc34))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rA(-0x105, -0x12e, -0x131, vD(0xc34), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(ry(0x1b5, 0x1c9, 0x1b1, 0x1cb, vD(0xc72))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rA(-0x128, -0x132, -0x134, vD(0xa79), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rA(-0x131, -0x155, -0x130, vD(0x7d3), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rB(0x9a, 0xb1, 0xb2, vD(0xc72), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(ry(0x1b5, 0x1d3, 0x1bc, 0x1d1, vD(0xddd))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rB(0xb2, 0xbe, 0xb9, vD(0xe03), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(ry(0x183, 0x1ae, 0x197, 0x19e, vD(0xb96))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rD(-0x244, -0x216, -0x232, -0x217, vD(0xb42))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rA(-0x126, -0x10f, -0x13a, vD(0x70c), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rD(-0x203, -0x209, -0x200, -0x1e1, vD(0x9e7))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rE === rx) break;
          else rC[vD(0xbc0)](rC[vD(0xd38)]());
        } catch (rF) {
          rC[vD(0xbc0)](rC[vD(0xd38)]());
        }
      }
    })(ig, 0xc30df * 0x1 + 0x10f * -0x697 + 0x11613);
    function ii() {
      const vE = ut,
        rw = {
          dEyIJ: function (rI, rJ) {
            return rI === rJ;
          },
          HMRdl:
            rz(vE(0xa79), -0x130, -0x106, -0x11f, -0x11d) +
            rz(vE(0x491), -0x11a, -0x142, -0x138, -0x135),
          MCQcr: function (rI, rJ) {
            return rI(rJ);
          },
          OVQiZ: function (rI, rJ) {
            return rI + rJ;
          },
          UJCyl: function (rI, rJ) {
            return rI % rJ;
          },
          RniHC: function (rI, rJ) {
            return rI * rJ;
          },
          pKOiA: function (rI, rJ) {
            return rI < rJ;
          },
          ksKNr: function (rI, rJ) {
            return rI ^ rJ;
          },
          pZcMn: function (rI, rJ) {
            return rI - rJ;
          },
          GNeTf: function (rI, rJ) {
            return rI - rJ;
          },
          igRib: function (rI, rJ) {
            return rI ^ rJ;
          },
          GUXBF: function (rI, rJ) {
            return rI + rJ;
          },
          NcAdQ: function (rI, rJ) {
            return rI % rJ;
          },
          hlnUf: function (rI, rJ) {
            return rI * rJ;
          },
          pJhNJ: function (rI, rJ) {
            return rI(rJ);
          },
        };
      if (
        rw[ry(-0x27e, -0x274, -0x265, vE(0x4b4), -0x274)](
          typeof window,
          rw[rA(vE(0x5e2), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        rw[rC(-0x17d, -0x171, -0x181, vE(0x5ba), -0x16a)](
          typeof ki,
          rw[ry(-0x25a, -0x263, -0x26c, vE(0x491), -0x270)]
        )
      )
        return;
      const rx = i5;
      function ry(rI, rJ, rK, rL, rM) {
        return ih(rI - -0x30c, rL);
      }
      function rz(rI, rJ, rK, rL, rM) {
        return ih(rM - -0x1cb, rI);
      }
      function rA(rI, rJ, rK, rL, rM) {
        return ih(rM - 0x14c, rI);
      }
      const rB = rx[rA(vE(0xe03), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function rC(rI, rJ, rK, rL, rM) {
        return ih(rI - -0x20a, rL);
      }
      const rD = rw[rF(0x43a, vE(0x357), 0x40e, 0x428, 0x430)](
        ij,
        rw[ry(-0x28e, -0x27f, -0x272, vE(0x5ba), -0x281)](
          rw[rz(vE(0xd04), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rB
          ),
          ib[rz(vE(0xe18), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rE = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rD[
        rz(vE(0xbce), -0x11e, -0x149, -0x131, -0x13c) +
          rC(-0x172, -0x16e, -0x175, vE(0x5e2), -0x166)
      ](rE++, cI[rC(-0x18e, -0x16e, -0x17a, vE(0xa79), -0x1a6)]),
        rD[
          rF(0x415, vE(0xcf3), 0x44c, 0x433, 0x422) +
            rA(vE(0x828), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rE, cJ),
        (rE += -0x3dd + -0x6b5 + 0xa94);
      function rF(rI, rJ, rK, rL, rM) {
        return ih(rL - 0x3a2, rJ);
      }
      const rG = rw[rF(0x43c, vE(0x422), 0x43b, 0x446, 0x459)](
        rw[ry(-0x283, -0x272, -0x298, vE(0x80c), -0x26e)](
          cJ,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let rI = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        rw[rA(vE(0x3b5), 0x200, 0x1fc, 0x1fc, 0x1e5)](rI, rB);
        rI++
      ) {
        rD[
          ry(-0x287, -0x273, -0x27d, vE(0x5e2), -0x27c) +
            rA(vE(0x57d), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rE++,
          rw[rA(vE(0xcbb), 0x201, 0x215, 0x21c, 0x1fc)](
            rx[
              rz(vE(0x3b0), -0x11c, -0x130, -0x128, -0x13b) +
                ry(-0x289, -0x29c, -0x26a, vE(0xe18), -0x290)
            ](
              rw[rz(vE(0x751), -0x13a, -0x124, -0x111, -0x120)](
                rw[rz(vE(0x4b4), -0x10d, -0x119, -0x108, -0x128)](rB, rI),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rG
          )
        );
      }
      if (ib) {
        const rJ = ib[rA(vE(0x5ba), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rK = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          rw[rA(vE(0x93e), 0x21f, 0x216, 0x204, 0x200)](rK, rJ);
          rK++
        ) {
          rD[
            rA(vE(0x828), 0x207, 0x20e, 0x209, 0x202) +
              rA(vE(0x3b0), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rE++,
            rw[ry(-0x25b, -0x256, -0x24f, vE(0x5e1), -0x261)](
              ib[
                ry(-0x267, -0x256, -0x25e, vE(0xc6d), -0x271) +
                  rF(0x412, vE(0x3b0), 0x411, 0x421, 0x425)
              ](
                rw[rF(0x435, vE(0xc34), 0x427, 0x434, 0x41a)](
                  rw[rz(vE(0xd4d), -0x143, -0x134, -0x133, -0x137)](rJ, rK),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rG
            )
          );
        }
      }
      const rH = rD[
        rF(0x423, vE(0xa79), 0x44b, 0x440, 0x45a) +
          ry(-0x280, -0x27d, -0x26e, vE(0x828), -0x288)
      ](
        rw[rC(-0x162, -0x164, -0x161, vE(0x491), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          rw[rF(0x429, vE(0xd69), 0x43d, 0x437, 0x44b)](
            rw[rz(vE(0xb96), -0x10d, -0x127, -0x124, -0x116)](
              cJ,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rB
          )
        )
      );
      rw[rF(0x435, vE(0x638), 0x43b, 0x42a, 0x448)](il, rD), (ia = rH);
    }
    function ij(rw) {
      return new DataView(new ArrayBuffer(rw));
    }
    function ik() {
      const vF = ut;
      return hU && hU[vF(0x88a)] === WebSocket[vF(0x643)];
    }
    function il(rw) {
      const vG = ut;
      if (ik()) {
        pC += rw[vG(0x74f)];
        if (hW) {
          const rx = new Uint8Array(rw[vG(0x5a8)]);
          for (let rA = 0x0; rA < rx[vG(0xed7)]; rA++) {
            rx[rA] ^= ia;
          }
          const ry = cJ % rx[vG(0xed7)],
            rz = rx[0x0];
          (rx[0x0] = rx[ry]), (rx[ry] = rz);
        }
        hU[vG(0x854)](rw);
      }
    }
    function im(rw, rx = 0x1) {
      const vH = ut;
      let ry = eU(rw);
      const rz = new Uint8Array([
        cI[vH(0x441)],
        ry,
        Math[vH(0xa7d)](rx * 0xff),
      ]);
      il(rz);
    }
    function io(rw, rx) {
      const ry = ip();
      return (
        (io = function (rz, rA) {
          rz = rz - (-0x25b2 + 0x10 * 0x211 + 0x5b2);
          let rB = ry[rz];
          return rB;
        }),
        io(rw, rx)
      );
    }
    function ip() {
      const vI = ut,
        rw = [
          vI(0x4a0),
          vI(0xe5f),
          vI(0xcea),
          vI(0xc76),
          vI(0x275),
          vI(0x5ca),
          vI(0x492),
          vI(0xaaf),
          vI(0x7ce),
          vI(0xbd2),
          vI(0xae8),
          vI(0xb6b),
          vI(0xc9b),
          vI(0xc9c),
          vI(0xcec),
          vI(0x2e8),
          vI(0x2c5),
          vI(0xa54),
          vI(0x639),
          vI(0xdf6),
        ];
      return (
        (ip = function () {
          return rw;
        }),
        ip()
      );
    }
    (function (rw, rx) {
      const vJ = ut;
      function ry(rE, rF, rG, rH, rI) {
        return io(rF - -0x22a, rI);
      }
      const rz = rw();
      function rA(rE, rF, rG, rH, rI) {
        return io(rH - -0x178, rF);
      }
      function rB(rE, rF, rG, rH, rI) {
        return io(rH - 0xba, rE);
      }
      function rC(rE, rF, rG, rH, rI) {
        return io(rE - -0x119, rG);
      }
      function rD(rE, rF, rG, rH, rI) {
        return io(rG - -0x53, rE);
      }
      while (!![]) {
        try {
          const rE =
            (-parseInt(rC(0x9, -0x1, 0xe, 0x10, 0x0)) /
              (-0x242b + -0x3 * -0x421 + 0x17c9)) *
              (-parseInt(rD(0xc4, 0xb9, 0xc1, 0xb8, 0xc5)) /
                (0xe5b + 0x551 * 0x2 + -0x18fb)) +
            -parseInt(rC(-0x1, -0x5, -0x4, -0x4, 0x2)) /
              (0x49 * -0xb + 0x6 * 0x373 + 0x1 * -0x118c) +
            -parseInt(rA(-0x52, -0x53, -0x4d, -0x55, -0x54)) /
              (-0x10e7 + -0x14a9 + 0x2594) +
            -parseInt(rD(0xcd, 0xc0, 0xc8, 0xc6, 0xcd)) /
              (0x159 + 0x18e * 0x2 + -0x470) +
            (-parseInt(rC(0x6, -0x2, 0x10, 0x2, 0xc)) /
              (-0x1872 * -0x1 + 0x1d62 + -0x35ce)) *
              (-parseInt(rA(-0x65, -0x5d, -0x54, -0x5e, -0x66)) /
                (-0x11c + -0x682 + 0x7a5 * 0x1)) +
            -parseInt(ry(-0x112, -0x11a, -0x115, -0x122, -0x11b)) /
              (-0x2312 + -0x1 * -0x2659 + -0x33f) +
            (-parseInt(rB(0x1dc, 0x1d0, 0x1dd, 0x1d7, 0x1de)) /
              (-0x5 * 0x61f + -0x8b * 0x3e + -0x2027 * -0x2)) *
              (-parseInt(rB(0x1d8, 0x1cf, 0x1d5, 0x1cf, 0x1d5)) /
                (-0x292 * -0xb + 0x13d * -0x13 + -0x4b5));
          if (rE === rx) break;
          else rz[vJ(0xbc0)](rz[vJ(0xd38)]());
        } catch (rF) {
          rz[vJ(0xbc0)](rz[vJ(0xd38)]());
        }
      }
    })(ip, -0x1 * -0x304f9 + 0x1cdb2 + -0x2848f);
    function iq(rw) {
      function rx(rE, rF, rG, rH, rI) {
        return io(rE - 0x3df, rH);
      }
      function ry(rE, rF, rG, rH, rI) {
        return io(rE - 0x12f, rF);
      }
      function rz(rE, rF, rG, rH, rI) {
        return io(rH - 0x263, rG);
      }
      const rA = {
          xgMol: function (rE) {
            return rE();
          },
          NSlTg: function (rE) {
            return rE();
          },
          BrnPE: function (rE) {
            return rE();
          },
          oiynC: function (rE, rF) {
            return rE(rF);
          },
        },
        rB = new Uint8Array([
          cI[
            rC(0x44e, 0x446, 0x44f, 0x456, 0x44f) +
              rC(0x440, 0x43c, 0x440, 0x448, 0x43d)
          ],
          rA[rz(0x387, 0x37e, 0x37e, 0x381, 0x38b)](ir),
          oP,
          rA[rD(0x4a2, 0x4a9, 0x4a0, 0x4a8, 0x49f)](ir),
          rA[ry(0x245, 0x243, 0x241, 0x249, 0x24d)](ir),
          ...rA[rz(0x381, 0x389, 0x38e, 0x384, 0x37e)](is, rw),
        ]);
      function rC(rE, rF, rG, rH, rI) {
        return io(rE - 0x32e, rF);
      }
      function rD(rE, rF, rG, rH, rI) {
        return io(rI - 0x38e, rG);
      }
      rA[ry(0x250, 0x24e, 0x250, 0x246, 0x24a)](il, rB);
    }
    function ir() {
      function rw(rC, rD, rE, rF, rG) {
        return io(rD - 0xd5, rF);
      }
      function rx(rC, rD, rE, rF, rG) {
        return io(rG - 0x379, rC);
      }
      const ry = {};
      function rz(rC, rD, rE, rF, rG) {
        return io(rG - 0x107, rE);
      }
      ry[rB(-0x1b1, -0x1b7, -0x1bb, -0x1ad, -0x1af)] = function (rC, rD) {
        return rC * rD;
      };
      const rA = ry;
      function rB(rC, rD, rE, rF, rG) {
        return io(rC - -0x2ca, rE);
      }
      return Math[rw(0x1f0, 0x1ec, 0x1f4, 0x1e4, 0x1ea)](
        rA[rB(-0x1b1, -0x1ab, -0x1b8, -0x1b0, -0x1b4)](
          Math[rB(-0x1b7, -0x1bb, -0x1bd, -0x1b7, -0x1b2) + "m"](),
          -0x2573 + -0xe * 0x11e + 0x3616
        )
      );
    }
    function is(rw) {
      function rx(ry, rz, rA, rB, rC) {
        return io(rC - 0x117, rz);
      }
      return new TextEncoder()[rx(0x22e, 0x22d, 0x237, 0x22b, 0x233) + "e"](rw);
    }
    function it(rw, rx, ry = 0x3c) {
      const vK = ut;
      iu(),
        (kk[vK(0x26f)] = vK(0x8aa) + rw + vK(0x348) + rx + vK(0xcf8)),
        kk[vK(0x2e9)](hY),
        (hY[vK(0x49b)][vK(0xdaa)] = ""),
        (i3[vK(0x49b)][vK(0xdaa)] = vK(0x30c)),
        (i0[vK(0x49b)][vK(0xdaa)] = vK(0x30c)),
        (hY[vK(0xb01)](vK(0xd4f))[vK(0x49b)][vK(0xced)] = "0"),
        document[vK(0xc9e)][vK(0xa1b)][vK(0xeae)](vK(0xd6d)),
        (kk[vK(0x49b)][vK(0xdaa)] = ""),
        (kl[vK(0x49b)][vK(0xdaa)] =
          kn[vK(0x49b)][vK(0xdaa)] =
          km[vK(0x49b)][vK(0xdaa)] =
          kC[vK(0x49b)][vK(0xdaa)] =
            vK(0x30c));
      const rz = document[vK(0xb01)](vK(0xa65));
      document[vK(0xb01)](vK(0x3dc))[vK(0x4c5)] = function () {
        rC();
      };
      let rA = ry;
      k8(rz, vK(0x880) + rA + vK(0xe65));
      const rB = setInterval(() => {
        const vL = vK;
        rA--, rA <= 0x0 ? rC() : k8(rz, vL(0x880) + rA + vL(0xe65));
      }, 0x3e8);
      function rC() {
        const vM = vK;
        clearInterval(rB), k8(rz, vM(0x4ec)), location[vM(0x806)]();
      }
    }
    function iu() {
      const vN = ut;
      if (hU) {
        hU[vN(0x2ef)] = hU[vN(0x25a)] = hU[vN(0x2b0)] = null;
        try {
          hU[vN(0x67b)]();
        } catch (rw) {}
        hU = null;
      }
    }
    var iv = {},
      iw = [],
      ix,
      iy,
      iz = [],
      iA = ut(0x824);
    function iB() {
      const vO = ut;
      iA = getComputedStyle(document[vO(0xc9e)])[vO(0xc3d)];
    }
    var iC = document[ut(0xb01)](ut(0xf46)),
      iD = document[ut(0xb01)](ut(0x69c)),
      iE = document[ut(0xb01)](ut(0x34a)),
      iF = [],
      iG = [],
      iH = ![],
      iI = 0x0;
    function iJ(rw) {
      const vP = ut;
      if(hack.isEnabled('numberNoSuffix')) return Math.round(rw);
      if (rw < 0.01) return "0";
      rw = Math[vP(0xa7d)](rw);
      if (rw >= 0x3b9aca00)
        return parseFloat((rw / 0x3b9aca00)[vP(0x284)](0x2)) + "b";
      else {
        if (rw >= 0xf4240)
          return parseFloat((rw / 0xf4240)[vP(0x284)](0x2)) + "m";
        else {
          if (rw >= 0x3e8)
            return parseFloat((rw / 0x3e8)[vP(0x284)](0x1)) + "k";
        }
      }
      return rw;
    }
    function iK(rw, rx) {
      const vQ = ut,
        ry = document[vQ(0xeb2)](vQ(0x475));
      ry[vQ(0x7ec)] = vQ(0x268);
      const rz = document[vQ(0xeb2)](vQ(0x475));
      (rz[vQ(0x7ec)] = vQ(0x47f)), ry[vQ(0x2e9)](rz);
      const rA = document[vQ(0xeb2)](vQ(0x76d));
      ry[vQ(0x2e9)](rA), iC[vQ(0x2e9)](ry);
      const rB = {};
      (rB[vQ(0x486)] = rw),
        (rB[vQ(0xc62)] = rx),
        (rB[vQ(0xd83)] = 0x0),
        (rB[vQ(0xf36)] = 0x0),
        (rB[vQ(0x416)] = 0x0),
        (rB["el"] = ry),
        (rB[vQ(0x845)] = rz),
        (rB[vQ(0x2a5)] = rA);
      const rC = rB;
      (rC[vQ(0xf33)] = iG[vQ(0xed7)]),
        (rC[vQ(0x915)] = function () {
          const vR = vQ;
          (this[vR(0xd83)] = pu(this[vR(0xd83)], this[vR(0xc62)], 0x64)),
            (this[vR(0x416)] = pu(this[vR(0x416)], this[vR(0xf36)], 0x64)),
            this[vR(0x2a5)][vR(0x4e7)](
              vR(0x873),
              (this[vR(0x486)] ? this[vR(0x486)] + vR(0xaba) : "") +
                iJ(this[vR(0xd83)])
            ),
            (this[vR(0x845)][vR(0x49b)][vR(0x40b)] = this[vR(0x416)] + "%");
        }),
        rC[vQ(0x915)](),
        iG[vQ(0xbc0)](rC);
    }
    function iL(rw) {
      const vS = ut;
      if (iG[vS(0xed7)] === 0x0) return;
      const rx = iG[0x0];
      rx[vS(0xf36)] = rx[vS(0x416)] = 0x64;
      for (let ry = 0x1; ry < iG[vS(0xed7)]; ry++) {
        const rz = iG[ry];
        (rz[vS(0xf36)] =
          Math[vS(0xc36)](
            0x1,
            rx[vS(0xc62)] === 0x0 ? 0x1 : rz[vS(0xc62)] / rx[vS(0xc62)]
          ) * 0x64),
          rw && (rz[vS(0x416)] = rz[vS(0xf36)]),
          iC[vS(0x2e9)](rz["el"]);
      }
    }
    function iM(rw) {
      const vT = ut,
        rx = new Path2D();
      rx[vT(0x7eb)](...rw[vT(0x576)][0x0]);
      for (let ry = 0x0; ry < rw[vT(0x576)][vT(0xed7)] - 0x1; ry++) {
        const rz = rw[vT(0x576)][ry],
          rA = rw[vT(0x576)][ry + 0x1];
        let rB = 0x0;
        const rC = rA[0x0] - rz[0x0],
          rD = rA[0x1] - rz[0x1],
          rE = Math[vT(0x796)](rC, rD);
        while (rB < rE) {
          rx[vT(0xa16)](
            rz[0x0] + (rB / rE) * rC + (Math[vT(0xb69)]() * 0x2 - 0x1) * 0x32,
            rz[0x1] + (rB / rE) * rD + (Math[vT(0xb69)]() * 0x2 - 0x1) * 0x32
          ),
            (rB += Math[vT(0xb69)]() * 0x28 + 0x1e);
        }
        rx[vT(0xa16)](...rA);
      }
      rw[vT(0xe9e)] = rx;
    }
    var iN = 0x0,
      iO = 0x0,
      iP = [],
      iQ = {},
      iR = [],
      iS = {};
    function iT(rw, rx) {
      const vU = ut;
      if (!p9[vU(0x7ad)]) return;
      var baseHP = hack.getHP(rw);
      var decDmg = rw['nHealth'] - rx;
      var dmg = Math.floor(decDmg * 10000) / 100 + '%';
      if(baseHP && hack.isEnabled('DDenableNumber')) var dmg = Math.floor(decDmg * baseHP);
      let ry;
      const rz = rx === void 0x0;
      !rz && (ry = Math[vU(0x67d)]((rw[vU(0xbf7)] - rx) * 0x64) || 0x1),
        iz[vU(0xbc0)]({
          text: hack.isEnabled('damageDisplay') ? dmg : ry,
          x: rw["x"] + (Math[vU(0xb69)]() * 0x2 - 0x1) * rw[vU(0x31a)] * 0.6,
          y: rw["y"] + (Math[vU(0xb69)]() * 0x2 - 0x1) * rw[vU(0x31a)] * 0.6,
          vx: (Math[vU(0xb69)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[vU(0xb69)]() * 0x3,
          angle: (Math[vU(0xb69)]() * 0x2 - 0x1) * (rz ? 0x1 : 0.1),
          size: Math[vU(0x49f)](0x1, (rw[vU(0x31a)] * 0.2) / 0x14),
        }),
        rw === iy && (pt = 0x1);
    }
    var iU = 0x0,
      iV = 0x0,
      iW = 0x0,
      iX = 0x0;
    function iY(rw) {
      const vV = ut,
        rx = iv[rw];
      if (rx) {
        rx[vV(0xab6)] = !![];
        if (
          Math[vV(0x301)](rx["nx"] - iU) > iW + rx[vV(0x25c)] ||
          Math[vV(0x301)](rx["ny"] - iV) > iX + rx[vV(0x25c)]
        )
          rx[vV(0xe1e)] = 0xa;
        else !rx[vV(0xa6b)] && iT(rx, 0x0);
        delete iv[rw];
      }
    }
    var iZ = [
      ut(0x415),
      ut(0x51d),
      ut(0x3b3),
      ut(0x352),
      ut(0x914),
      ut(0x72d),
      ut(0xe33),
      ut(0x7c1),
      ut(0x2f7),
      ut(0xaac),
      ut(0xb40),
      ut(0x412),
      ut(0x9d2),
    ];
    function j0(rw, rx = iy) {
      const vW = ut;
      (rw[vW(0x415)] = rx[vW(0x415)]),
        (rw[vW(0x51d)] = rx[vW(0x51d)]),
        (rw[vW(0x3b3)] = rx[vW(0x3b3)]),
        (rw[vW(0x352)] = rx[vW(0x352)]),
        (rw[vW(0x914)] = rx[vW(0x914)]),
        (rw[vW(0x72d)] = rx[vW(0x72d)]),
        (rw[vW(0xe33)] = rx[vW(0xe33)]),
        (rw[vW(0x7c1)] = rx[vW(0x7c1)]),
        (rw[vW(0x2f7)] = rx[vW(0x2f7)]),
        (rw[vW(0xaac)] = rx[vW(0xaac)]),
        (rw[vW(0x37b)] = rx[vW(0x37b)]),
        (rw[vW(0xb40)] = rx[vW(0xb40)]),
        (rw[vW(0x933)] = rx[vW(0x933)]),
        (rw[vW(0x412)] = rx[vW(0x412)]),
        (rw[vW(0x9d2)] = rx[vW(0x9d2)]);
    }
    function j1() {
      (oX = null), p5(null), (p1 = null), (oZ = ![]), (p0 = 0x0), oj && pK();
    }
    var j2 = 0x64,
      j3 = 0x1,
      j4 = 0x64,
      j5 = 0x1,
      j6 = {},
      j7 = [...Object[ut(0x520)](d9)],
      j8 = [...hQ];
    ja(j7),
      ja(j8),
      j7[ut(0xbc0)](ut(0xc9a)),
      j8[ut(0xbc0)](hP[ut(0xa94)] || ut(0x47c)),
      j7[ut(0xbc0)](ut(0xc5c)),
      j8[ut(0xbc0)](ut(0x481));
    var j9 = [];
    for (let rw = 0x0; rw < j7[ut(0xed7)]; rw++) {
      const rx = d9[j7[rw]] || 0x0;
      j9[rw] = 0x78 + (rx - d9[ut(0xd1a)]) * 0x3c - 0x1 + 0x1;
    }
    function ja(ry) {
      const rz = ry[0x3];
      (ry[0x3] = ry[0x5]), (ry[0x5] = rz);
    }
    var jb = [],
      jc = [];
    function jd(ry) {
      const vX = ut,
        rz = j8[ry],
        rA = nO(
          vX(0x847) + j7[ry] + vX(0xeb3) + rz + vX(0x4c0) + rz + vX(0x38d)
        ),
        rB = rA[vX(0xb01)](vX(0xb1f));
      (j6 = {
        id: ry,
        el: rA,
        state: cT[vX(0x30c)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rA[vX(0xb01)](vX(0xbf1)),
        progressEl: rB,
        barEl: rB[vX(0xb01)](vX(0x33b)),
        textEl: rB[vX(0xb01)](vX(0x76d)),
        nameEl: rA[vX(0xb01)](vX(0x22c)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const vY = vX,
            rC = Math[vY(0xc36)](0x1, (pN - this[vY(0x99f)]) / 0x64);
          this[vY(0x45b)] =
            this[vY(0x87d)] + (this[vY(0x324)] - this[vY(0x87d)]) * rC;
          const rD = this[vY(0x45b)] - 0x1;
          this[vY(0x845)][vY(0x49b)][vY(0x977)] =
            vY(0xdb5) + rD * 0x64 + vY(0x8dc) + rD + vY(0x32d);
        },
        update() {
          const vZ = vX,
            rC = je(this["t"]),
            rD = 0x1 - rC;
          (this["el"][vZ(0x49b)][vZ(0xced)] = -0xc8 * rD + "px"),
            (this["el"][vZ(0x49b)][vZ(0x977)] = vZ(0x43f) + -0x64 * rD + "%)");
        },
        remove() {
          const w0 = vX;
          rA[w0(0xeae)]();
        },
      }),
        (j6[vX(0xec8)][vX(0x49b)][vX(0xdaa)] = vX(0x30c)),
        jc[vX(0xbc0)](j6),
        j6[vX(0x915)](),
        jb[vX(0xbc0)](j6),
        km[vX(0x1fd)](rA, q0);
    }
    function je(ry) {
      return 0x1 - (0x1 - ry) * (0x1 - ry);
    }
    function jf(ry) {
      const w1 = ut;
      return ry < 0.5
        ? (0x1 - Math[w1(0x536)](0x1 - Math[w1(0xe12)](0x2 * ry, 0x2))) / 0x2
        : (Math[w1(0x536)](0x1 - Math[w1(0xe12)](-0x2 * ry + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jg() {
      const w2 = ut;
      (oy[w2(0x26f)] = ""), (oA = {});
    }
    var jh = document[ut(0xb01)](ut(0x259));
    jh[ut(0x49b)][ut(0xdaa)] = ut(0x30c);
    var ji = document[ut(0xb01)](ut(0xb81)),
      jj = [],
      jk = document[ut(0xb01)](ut(0x578));
    jk[ut(0xde6)] = function () {
      jl();
    };
    function jl() {
      const w3 = ut;
      for (let ry = 0x0; ry < jj[w3(0xed7)]; ry++) {
        const rz = jj[ry];
        k8(rz[w3(0x477)][0x0], jk[w3(0x373)] ? w3(0xd4b) : rz[w3(0xdc6)]);
      }
    }
    function jm(ry) {
      const w4 = ut;
      (jh[w4(0x49b)][w4(0xdaa)] = ""), (ji[w4(0x26f)] = w4(0x5a1));
      const rz = ry[w4(0xed7)];
      jj = [];
      for (let rA = 0x0; rA < rz; rA++) {
        const rB = ry[rA];
        ji[w4(0x2e9)](nO(w4(0x62b) + (rA + 0x1) + w4(0xc75))), jn(rB);
      }
      m1[w4(0x3aa)][w4(0xd5b)]();
    }
    function jn(ry) {
      const w5 = ut;
      for (let rz = 0x0; rz < ry[w5(0xed7)]; rz++) {
        const rA = ry[rz],
          rB = nO(w5(0xa88) + rA + w5(0x923));
        (rB[w5(0xdc6)] = rA),
          rz > 0x0 && jj[w5(0xbc0)](rB),
          (rB[w5(0x4c5)] = function () {
            jp(rA);
          }),
          ji[w5(0x2e9)](rB);
      }
      jl();
    }
    function jo(ry) {
      const w6 = ut;
      var rz = document[w6(0xeb2)](w6(0x347));
      (rz[w6(0x95d)] = ry),
        (rz[w6(0x49b)][w6(0x293)] = "0"),
        (rz[w6(0x49b)][w6(0x985)] = "0"),
        (rz[w6(0x49b)][w6(0xbc1)] = w6(0x60f)),
        document[w6(0xc9e)][w6(0x2e9)](rz),
        rz[w6(0xc42)](),
        rz[w6(0x636)]();
      try {
        var rA = document[w6(0x752)](w6(0x32b)),
          rB = rA ? w6(0x9c3) : w6(0xc0f);
      } catch (rC) {}
      document[w6(0xc9e)][w6(0x465)](rz);
    }
    function jp(ry) {
      const w7 = ut;
      if (!navigator[w7(0xecd)]) {
        jo(ry);
        return;
      }
      navigator[w7(0xecd)][w7(0x356)](ry)[w7(0xc09)](
        function () {},
        function (rz) {}
      );
    }
    var jq = [
        ut(0x276),
        ut(0xae4),
        ut(0x253),
        ut(0xdae),
        ut(0xb4c),
        ut(0x31d),
        ut(0x746),
        ut(0xd40),
        ut(0x4e0),
        ut(0xe25),
        ut(0x2ee),
      ],
      jr = [ut(0x9c9), ut(0x794), ut(0xcd3)];
    function js(ry) {
      const w8 = ut,
        rz = ry ? jr : jq;
      return rz[Math[w8(0x7ce)](Math[w8(0xb69)]() * rz[w8(0xed7)])];
    }
    function jt(ry) {
      const w9 = ut;
      return ry[w9(0x7ca)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var ju = document[ut(0xb01)](ut(0xece));
    ju[ut(0x4c5)] = nu(function (ry) {
      const wa = ut;
      iy && il(new Uint8Array([cI[wa(0x921)]]));
    });
    var jv = "";
    function jw(ry) {
      const wb = ut;
      return ry[wb(0xd73)](/"/g, wb(0xb1b));
    }
    function jx(ry) {
      const wc = ut;
      let rz = "";
      for (let rA = 0x0; rA < ry[wc(0xed7)]; rA++) {
        const [rB, rC, rD] = ry[rA];
        rz +=
          wc(0x596) +
          rB +
          "\x22\x20" +
          (rD ? wc(0xdc0) : "") +
          wc(0xb33) +
          jw(rC) +
          wc(0x911);
      }
      return wc(0xc4d) + rz + wc(0xc3f);
    }
    var jy = ![];
    function jz() {
      const wd = ut;
      return nO(wd(0x311) + hP[wd(0xd1a)] + wd(0xa0d));
    }
    var jA = document[ut(0xb01)](ut(0x529));
    function jB() {
      const we = ut;
      (oQ[we(0x49b)][we(0xdaa)] = q0[we(0x49b)][we(0xdaa)] =
        jy ? we(0x30c) : ""),
        (jA[we(0x49b)][we(0xdaa)] = ky[we(0x49b)][we(0xdaa)] =
          jy ? "" : we(0x30c));
      jy
        ? (kz[we(0xa1b)][we(0xde0)](we(0xd13)),
          k8(kz[we(0x477)][0x0], we(0x267)))
        : (kz[we(0xa1b)][we(0xeae)](we(0xd13)),
          k8(kz[we(0x477)][0x0], we(0x52b)));
      const ry = [hG, ml];
      for (let rz = 0x0; rz < ry[we(0xed7)]; rz++) {
        const rA = ry[rz];
        rA[we(0xa1b)][jy ? we(0xde0) : we(0xeae)](we(0x76b)),
          (rA[we(0x558)] = jy ? jz : null),
          (rA[we(0x8e7)] = !![]);
      }
      jC[we(0x49b)][we(0xdaa)] = nX[we(0x49b)][we(0xdaa)] = jy ? we(0x30c) : "";
    }
    var jC = document[ut(0xb01)](ut(0x52e)),
      jD = document[ut(0xb01)](ut(0xda5)),
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
    function jN(ry, rz) {
      const wf = ut;
      jM[rz] = (jM[rz] || 0x0) + 0x1;
      if (jM[rz] > 0x8) return ![];
      let rA = 0x0;
      for (let rB = jL[wf(0xed7)] - 0x1; rB >= 0x0; rB--) {
        const rC = jL[rB];
        if (nw(ry, rC) > 0.7) {
          rA++;
          if (rA >= 0x5) return ![];
        }
      }
      return jL[wf(0xbc0)](ry), !![];
    }
    var jO = document[ut(0xb01)](ut(0x328)),
      jP = document[ut(0xb01)](ut(0x5e3)),
      jQ = document[ut(0xb01)](ut(0x98f)),
      jR = document[ut(0xb01)](ut(0xafd)),
      jS;
    k8(jQ, "-"),
      (jQ[ut(0x4c5)] = function () {
        if (jS) mw(jS);
      });
    var jT = 0x0,
      jU = document[ut(0xb01)](ut(0xdcd));
    setInterval(() => {
      const wg = ut;
      jT--;
      if (jT < 0x0) {
        jU[wg(0xa1b)][wg(0x6ba)](wg(0xd5b)) &&
          hW &&
          il(new Uint8Array([cI[wg(0x344)]]));
        return;
      }
      jV();
    }, 0x3e8);
    function jV() {
      k8(jR, ka(jT * 0x3e8));
    }
    function jW() {
      const wh = ut,
        ry = document[wh(0xb01)](wh(0x28c))[wh(0x477)],
        rz = document[wh(0xb01)](wh(0x7a6))[wh(0x477)];
      for (let rA = 0x0; rA < ry[wh(0xed7)]; rA++) {
        const rB = ry[rA],
          rC = rz[rA];
        rB[wh(0x4c5)] = function () {
          const wi = wh;
          for (let rD = 0x0; rD < rz[wi(0xed7)]; rD++) {
            const rE = rA === rD;
            (rz[rD][wi(0x49b)][wi(0xdaa)] = rE ? "" : wi(0x30c)),
              ry[rD][wi(0xa1b)][rE ? wi(0xde0) : wi(0xeae)](wi(0x8c1));
          }
        };
      }
      ry[0x0][wh(0x4c5)]();
    }
    jW();
    var jX = [];
    function jY(ry) {
      const wj = ut;
      ry[wj(0xa1b)][wj(0xde0)](wj(0x8a7)), jX[wj(0xbc0)](ry);
    }
    var jZ,
      k0 = document[ut(0xb01)](ut(0x838));
    function k1(ry, rz = !![]) {
      const wk = ut;
      if (rz) {
        if (pN < jG) {
          jH[wk(0xbc0)](ry);
          return;
        } else {
          if (jH[wk(0xed7)] > 0x0)
            while (jH[wk(0xed7)] > 0x0) {
              k1(jH[wk(0xd38)](), ![]);
            }
        }
      }
      function rA() {
        const wl = wk,
          rM = rJ[wl(0x63c)](rK++),
          rN = new Uint8Array(rM);
        for (let rO = 0x0; rO < rM; rO++) {
          rN[rO] = rJ[wl(0x63c)](rK++);
        }
        return new TextDecoder()[wl(0xd23)](rN);
      }
      function rB() {
        const wm = wk;
        return rJ[wm(0x63c)](rK++) / 0xff;
      }
      function rC(rM) {
        const wn = wk,
          rN = rJ[wn(0x5ae)](rK);
        (rK += 0x2),
          (rM[wn(0xe21)] = rN & 0x1),
          (rM[wn(0x415)] = rN & 0x2),
          (rM[wn(0x51d)] = rN & 0x4),
          (rM[wn(0x3b3)] = rN & 0x8),
          (rM[wn(0x352)] = rN & 0x10),
          (rM[wn(0x914)] = rN & 0x20),
          (rM[wn(0x72d)] = rN & 0x40),
          (rM[wn(0xe33)] = rN & 0x80),
          (rM[wn(0x7c1)] = rN & 0x100),
          (rM[wn(0x2f7)] = rN & (0x1 << 0x9)),
          (rM[wn(0xaac)] = rN & (0x1 << 0xa)),
          (rM[wn(0x37b)] = rN & (0x1 << 0xb)),
          (rM[wn(0xb40)] = rN & (0x1 << 0xc)),
          (rM[wn(0x933)] = rN & (0x1 << 0xd)),
          (rM[wn(0x412)] = rN & (0x1 << 0xe)),
          (rM[wn(0x9d2)] = rN & (0x1 << 0xf));
      }
      function rD() {
        const wo = wk,
          rM = rJ[wo(0x63d)](rK);
        rK += 0x4;
        const rN = rA();
        iK(rN, rM);
      }
      function rE() {
        const wp = wk,
          rM = rJ[wp(0x5ae)](rK) - cG;
        return (rK += 0x2), rM;
      }
      function rF() {
        const wq = wk,
          rM = {};
        for (let rX in mp) {
          (rM[rX] = rJ[wq(0x63d)](rK)), (rK += 0x4);
        }
        const rN = rA(),
          rO = Number(rJ[wq(0xce9)](rK));
        rK += 0x8;
        const rP = d5(d4(rO)[0x0]),
          rQ = rP * 0x2,
          rR = Array(rQ);
        for (let rY = 0x0; rY < rQ; rY++) {
          const rZ = rJ[wq(0x5ae)](rK) - 0x1;
          rK += 0x2;
          if (rZ < 0x0) continue;
          rR[rY] = dC[rZ];
        }
        const rS = [],
          rT = rJ[wq(0x5ae)](rK);
        rK += 0x2;
        for (let s0 = 0x0; s0 < rT; s0++) {
          const s1 = rJ[wq(0x5ae)](rK);
          rK += 0x2;
          const s2 = rJ[wq(0x63d)](rK);
          (rK += 0x4), rS[wq(0xbc0)]([dC[s1], s2]);
        }
        const rU = [],
          rV = rJ[wq(0x5ae)](rK);
        rK += 0x2;
        for (let s3 = 0x0; s3 < rV; s3++) {
          const s4 = rJ[wq(0x5ae)](rK);
          (rK += 0x2), !eK[s4] && console[wq(0x3d1)](s4), rU[wq(0xbc0)](eK[s4]);
        }
        const rW = rJ[wq(0x63c)](rK++);
        mu(rN, rM, rS, rU, rO, rR, rW);
      }
      function rG() {
        const wr = wk,
          rM = Number(rJ[wr(0xce9)](rK));
        return (rK += 0x8), rM;
      }
      function rH() {
        const ws = wk,
          rM = rJ[ws(0x63d)](rK);
        rK += 0x4;
        const rN = rJ[ws(0x63c)](rK++),
          rO = {};
        (rO[ws(0x322)] = rM), (rO[ws(0x439)] = {});
        const rP = rO;
        f3[ws(0xaa2)]((rR, rS) => {
          const wt = ws;
          rP[wt(0x439)][rR] = [];
          for (let rT = 0x0; rT < rN; rT++) {
            const rU = rA();
            let rV;
            rR === "xp" ? (rV = rG()) : ((rV = rJ[wt(0x63d)](rK)), (rK += 0x4)),
              rP[wt(0x439)][rR][wt(0xbc0)]([rU, rV]);
          }
        }),
          k8(jD, k9(rP[ws(0x322)]) + ws(0xb89)),
          (mB[ws(0x26f)] = "");
        let rQ = 0x0;
        for (let rR in rP[ws(0x439)]) {
          const rS = kd(rR),
            rT = rP[ws(0x439)][rR],
            rU = nO(ws(0xc15) + rQ + ws(0x928) + rS + ws(0xbb6)),
            rV = rU[ws(0xb01)](ws(0x402));
          for (let rW = 0x0; rW < rT[ws(0xed7)]; rW++) {
            const [rX, rY] = rT[rW];
            let rZ = mo(rR, rY);
            rR === "xp" && (rZ += ws(0xdcc) + (d4(rY)[0x0] + 0x1) + ")");
            const s0 = nO(
              ws(0x692) + (rW + 0x1) + ".\x20" + rX + ws(0x27c) + rZ + ws(0x36a)
            );
            (s0[ws(0x4c5)] = function () {
              mw(rX);
            }),
              rV[ws(0xda6)](s0);
          }
          mB[ws(0xda6)](rU), rQ++;
        }
      }
      function rI() {
        const wu = wk;
        (jS = rA()), k8(jQ, jS || "-");
        const rM = Number(rJ[wu(0xce9)](rK));
        (rK += 0x8),
          (jT = Math[wu(0xa7d)]((rM - Date[wu(0x8ea)]()) / 0x3e8)),
          jV();
        const rN = rJ[wu(0x5ae)](rK);
        rK += 0x2;
        if (rN === 0x0) jP[wu(0x26f)] = wu(0x50c);
        else {
          jP[wu(0x26f)] = "";
          for (let rP = 0x0; rP < rN; rP++) {
            const rQ = rA(),
              rR = rJ[wu(0x6f5)](rK);
            rK += 0x4;
            const rS = rR * 0x64,
              rT = rS >= 0x1 ? rS[wu(0x284)](0x2) : rS[wu(0x284)](0x5),
              rU = nO(
                wu(0x3c2) +
                  (rP + 0x1) +
                  ".\x20" +
                  rQ +
                  wu(0xd0d) +
                  rT +
                  wu(0x950)
              );
            rQ === jv && rU[wu(0xa1b)][wu(0xde0)]("me"),
              (rU[wu(0x4c5)] = function () {
                mw(rQ);
              }),
              jP[wu(0x2e9)](rU);
          }
        }
        k0[wu(0x26f)] = "";
        const rO = rJ[wu(0x5ae)](rK);
        (rK += 0x2), (jZ = {});
        if (rO === 0x0)
          (jO[wu(0x26f)] = wu(0xa14)), (k0[wu(0x49b)][wu(0xdaa)] = wu(0x30c));
        else {
          const rV = {};
          jO[wu(0x26f)] = "";
          for (let rW = 0x0; rW < rO; rW++) {
            const rX = rJ[wu(0x5ae)](rK);
            rK += 0x2;
            const rY = rJ[wu(0x63d)](rK);
            (rK += 0x4), (jZ[rX] = rY);
            const rZ = dC[rX],
              s0 = nO(
                wu(0x21f) +
                  rZ[wu(0x23b)] +
                  wu(0xea8) +
                  qy(rZ) +
                  wu(0xce4) +
                  rY +
                  wu(0x689)
              );
            (s0[wu(0x5b5)] = jU),
              jY(s0),
              (s0[wu(0x558)] = rZ),
              jO[wu(0x2e9)](s0),
              (rV[rZ[wu(0x23b)]] = (rV[rZ[wu(0x23b)]] || 0x0) + rY);
          }
          ob(jO), (k0[wu(0x49b)][wu(0xdaa)] = ""), oC(k0, rV);
        }
      }
      const rJ = new DataView(ry[wk(0x786)]);
      pC += rJ[wk(0x74f)];
      let rK = 0x0;
      const rL = rJ[wk(0x63c)](rK++);
      switch (rL) {
        case cI[wk(0x456)]:
          {
            const s7 = rJ[wk(0x5ae)](rK);
            rK += 0x2;
            for (let s8 = 0x0; s8 < s7; s8++) {
              const s9 = rJ[wk(0x5ae)](rK);
              rK += 0x2;
              const sa = rJ[wk(0x63d)](rK);
              (rK += 0x4), n4(s9, sa);
            }
          }
          break;
        case cI[wk(0xd71)]:
          rI();
          break;
        case cI[wk(0xb53)]:
          kC[wk(0xa1b)][wk(0xde0)](wk(0xd5b)), hT(), (jG = pN + 0x1f4);
          break;
        case cI[wk(0x42d)]:
          (mj[wk(0x26f)] = wk(0x6b3)), mj[wk(0x2e9)](mm), (mn = ![]);
          break;
        case cI[wk(0xeaf)]: {
          const sb = dC[rJ[wk(0x5ae)](rK)];
          rK += 0x2;
          const sc = rJ[wk(0x63d)](rK);
          (rK += 0x4),
            (mj[wk(0x26f)] =
              wk(0x9c5) +
              sb[wk(0x23b)] +
              "\x22\x20" +
              qy(sb) +
              wk(0xce4) +
              k9(sc) +
              wk(0xc10));
          const sd = mj[wk(0xb01)](wk(0xce7));
          (sd[wk(0x558)] = sb),
            (sd[wk(0x4c5)] = function () {
              const wv = wk;
              n4(sb["id"], sc), (this[wv(0x4c5)] = null), mm[wv(0x4c5)]();
            }),
            (mn = ![]);
          break;
        }
        case cI[wk(0xe97)]: {
          const se = rJ[wk(0x63c)](rK++),
            sf = rJ[wk(0x63d)](rK);
          rK += 0x4;
          const sg = rA();
          (mj[wk(0x26f)] =
            wk(0x589) +
            sg +
            wk(0xeb3) +
            hP[wk(0xd4c)] +
            wk(0x34f) +
            k9(sf) +
            "\x20" +
            hN[se] +
            wk(0xeb3) +
            hQ[se] +
            wk(0x879)),
            (mj[wk(0xb01)](wk(0x819))[wk(0x4c5)] = function () {
              mw(sg);
            }),
            mj[wk(0x2e9)](mm),
            (mn = ![]);
          break;
        }
        case cI[wk(0x640)]:
          (mj[wk(0x26f)] = wk(0x6af)), mj[wk(0x2e9)](mm), (mn = ![]);
          break;
        case cI[wk(0x5f4)]:
          hK(wk(0x473));
          break;
        case cI[wk(0x61a)]:
          rH();
          break;
        case cI[wk(0x4f4)]:
          hK(wk(0xb90)), hc(wk(0xb90));
          break;
        case cI[wk(0x75c)]:
          hK(wk(0x8d8)), hc(wk(0xcc3));
          break;
        case cI[wk(0x349)]:
          hK(wk(0xde9));
          break;
        case cI[wk(0x3c8)]:
          rF();
          break;
        case cI[wk(0xb7a)]:
          hc(wk(0x3d6));
          break;
        case cI[wk(0xeed)]:
          hc(wk(0x241), hP[wk(0xa94)]), hJ(hH);
          break;
        case cI[wk(0x3aa)]:
          const rM = rJ[wk(0x5ae)](rK);
          rK += 0x2;
          const rN = [];
          for (let sh = 0x0; sh < rM; sh++) {
            const si = rJ[wk(0x63d)](rK);
            rK += 0x4;
            const sj = rA(),
              sk = rA(),
              sl = rA();
            rN[wk(0xbc0)]([sj || wk(0xbe5) + si, sk, sl]);
          }
          jm(rN);
          break;
        case cI[wk(0xcc6)]:
          for (let sm in mp) {
            const sn = rJ[wk(0x63d)](rK);
            (rK += 0x4), mq[sm][wk(0xdb1)](sn);
          }
          break;
        case cI[wk(0xa3f)]:
          const rO = rJ[wk(0x63c)](rK++),
            rP = rJ[wk(0x63d)](rK++),
            rQ = {};
          (rQ[wk(0xd31)] = rO), (rQ[wk(0x25d)] = rP), (p1 = rQ);
          break;
        case cI[wk(0xd35)]:
          (i0[wk(0x49b)][wk(0xdaa)] = i6 ? "" : wk(0x30c)),
            (i3[wk(0x49b)][wk(0xdaa)] = !i6 ? "" : wk(0x30c)),
            (hY[wk(0x49b)][wk(0xdaa)] = ""),
            (kn[wk(0x49b)][wk(0xdaa)] = wk(0x30c)),
            (hW = !![]),
            kB[wk(0xa1b)][wk(0xde0)](wk(0xd5b)),
            kA[wk(0xa1b)][wk(0xeae)](wk(0xd5b)),
            j1(),
            m0(![]),
            (ix = rJ[wk(0x63d)](rK)),
            (rK += 0x4),
            (jv = rA()),
            hack.player.name = jv,
            hJ(jv),
            (jy = rJ[wk(0x63c)](rK++)),
            jB(),
            (j2 = rJ[wk(0x5ae)](rK)),
            (rK += 0x2),
            (j5 = rJ[wk(0x63c)](rK++)),
            (j4 = j2 / j5),
            (j3 = j2 / 0x3),
            (oE = rG()),
            oO(),
            oR(),
            (iN = d5(oF)),
            (iO = iN * 0x2),
            (iP = Array(iO)),
            (iQ = {}),
            (iR = d7());
          for (let so = 0x0; so < iO; so++) {
            const sp = rJ[wk(0x5ae)](rK) - 0x1;
            rK += 0x2;
            if (sp < 0x0) continue;
            iP[so] = dC[sp];
          }
          nJ(), nR();
          const rR = rJ[wk(0x5ae)](rK);
          rK += 0x2;
          for (let sq = 0x0; sq < rR; sq++) {
            const sr = rJ[wk(0x5ae)](rK);
            rK += 0x2;
            const ss = nT(eK[sr]);
            ss[wk(0x5b5)] = m2;
          }
          iS = {};
          while (rK < rJ[wk(0x74f)]) {
            const st = rJ[wk(0x5ae)](rK);
            rK += 0x2;
            const su = rJ[wk(0x63d)](rK);
            (rK += 0x4), (iS[st] = su);
          }
          o9(), n5();
          break;
        case cI[wk(0x527)]:
          const rS = rJ[wk(0x63c)](rK++),
            rT = hL[rS] || wk(0x8d9);
          console[wk(0x3d1)](wk(0x2c2) + rT + ")"),
            (kf = rS === cR[wk(0xf48)] || rS === cR[wk(0xbf8)]);
          !kf &&
            it(wk(0xdbd), wk(0xc73) + rT, rS === cR[wk(0x3fc)] ? 0xa : 0x3c);
          break;
        case cI[wk(0xd0c)]:
          (hg[wk(0x49b)][wk(0xdaa)] = kn[wk(0x49b)][wk(0xdaa)] = wk(0x30c)),
            kG(!![]),
            ju[wk(0xa1b)][wk(0xde0)](wk(0xd5b)),
            jg(),
            (pg[wk(0x49b)][wk(0xdaa)] = "");
          for (let sv in iQ) {
            iQ[sv][wk(0xed8)] = 0x0;
          }
          (jI = pN),
            (nm = {}),
            (ne = 0x1),
            (nf = 0x1),
            (nc = 0x0),
            (nd = 0x0),
            mF(),
            (n9 = cY[wk(0x987)]),
            (jE = pN);
          break;
        case cI[wk(0x915)]:
          (pB = pN - jE), (jE = pN), q7[wk(0xdb1)](rB()), q9[wk(0xdb1)](rB());
          if (jy) {
            const sw = rJ[wk(0x63c)](rK++);
            (jJ = sw & 0x80), (jK = f6[sw & 0x7f]);
          } else (jJ = ![]), (jK = null), qa[wk(0xdb1)](rB());
          (pI = 0x1 + cW[rJ[wk(0x63c)](rK++)] / 0x64),
            (iW = (d0 / 0x2) * pI),
            (iX = (d1 / 0x2) * pI);
          const rU = rJ[wk(0x5ae)](rK);
          rK += 0x2;
          for (let sx = 0x0; sx < rU; sx++) {
            const sy = rJ[wk(0x63d)](rK);
            rK += 0x4;
            let sz = iv[sy];
            if (sz) {
              if (sz[wk(0x228)]) {
                sz[wk(0xd42)] = rJ[wk(0x63c)](rK++) - 0x1;
                continue;
              }
              const sA = rJ[wk(0x63c)](rK++);
              sA & 0x1 &&
                ((sz["nx"] = rE()), (sz["ny"] = rE()), (sz[wk(0x9c7)] = 0x0));
              sA & 0x2 &&
                ((sz[wk(0xbc6)] = eS(rJ[wk(0x63c)](rK++))),
                (sz[wk(0x9c7)] = 0x0));
              if (sA & 0x4) {
                const sB = rB();
                if (sB < sz[wk(0xbf7)]) iT(sz, sB), (sz[wk(0x4b0)] = 0x1);
                else sB > sz[wk(0xbf7)] && (sz[wk(0x4b0)] = 0x0);
                (sz[wk(0xbf7)] = sB), (sz[wk(0x9c7)] = 0x0);
              }
              sA & 0x8 &&
                ((sz[wk(0x5e0)] = 0x1),
                (sz[wk(0x9c7)] = 0x0),
                sz === iy && (pt = 0x1));
              sA & 0x10 && ((sz[wk(0x25c)] = rJ[wk(0x5ae)](rK)), (rK += 0x2));
              sA & 0x20 && (sz[wk(0x5be)] = rJ[wk(0x63c)](rK++));
              sA & 0x40 && rC(sz);
              if (sA & 0x80) {
                if (sz[wk(0xbca)])
                  (sz[wk(0xd47)] = rJ[wk(0x5ae)](rK)), (rK += 0x2);
                else {
                  const sC = rB();
                  sC > sz[wk(0x549)] && iT(sz), (sz[wk(0x549)] = sC);
                }
              }
              sz[wk(0xbca)] && sA & 0x4 && (sz[wk(0xe6c)] = rB()),
                (sz["ox"] = sz["x"]),
                (sz["oy"] = sz["y"]),
                (sz[wk(0xca6)] = sz[wk(0x9d6)]),
                (sz[wk(0x6ff)] = sz[wk(0x663)]),
                (sz[wk(0xcf7)] = sz[wk(0x31a)]),
                (sz[wk(0x5ee)] = 0x0);
            } else {
              const sD = rJ[wk(0x63c)](rK++);
              if (sD === cS[wk(0x263)]) {
                let sI = rJ[wk(0x63c)](rK++);
                const sJ = {};
                (sJ[wk(0x576)] = []), (sJ["a"] = 0x1);
                const sK = sJ;
                while (sI--) {
                  const sL = rE(),
                    sM = rE();
                  sK[wk(0x576)][wk(0xbc0)]([sL, sM]);
                }
                iM(sK), (pt = 0x1), iF[wk(0xbc0)](sK);
                continue;
              }
              const sE = hM[sD],
                sF = rE(),
                sG = rE(),
                sH = sD === cS[wk(0x699)];
              if (sD === cS[wk(0x857)] || sD === cS[wk(0xd48)] || sH) {
                const sN = rJ[wk(0x5ae)](rK);
                (rK += 0x2),
                  (sz = new lK(sD, sy, sF, sG, sN)),
                  sH &&
                    ((sz[wk(0x228)] = !![]),
                    (sz[wk(0xd42)] = rJ[wk(0x63c)](rK++) - 0x1));
              } else {
                if (sD === cS[wk(0x3db)]) {
                  const sO = rJ[wk(0x5ae)](rK);
                  (rK += 0x2), (sz = new lN(sy, sF, sG, sO));
                } else {
                  const sP = eS(rJ[wk(0x63c)](rK++)),
                    sQ = rJ[wk(0x5ae)](rK);
                  rK += 0x2;
                  if (sD === cS[wk(0x455)]) {
                    const sR = rB(),
                      sS = rJ[wk(0x63c)](rK++);
                    (sz = new lT(sy, sF, sG, sP, sR, sS, sQ)),
                      rC(sz),
                      (sz[wk(0xd47)] = rJ[wk(0x5ae)](rK)),
                      (rK += 0x2),
                      (sz[wk(0x486)] = rA()),
                      (sz[wk(0x9f0)] = rA()),
                      (sz[wk(0xe6c)] = rB());
                    if (ix === sy) iy = sz;
                    else {
                      if (jy) {
                        const sT = pT();
                        (sT[wk(0x6e3)] = sz), pL[wk(0xbc0)](sT);
                      }
                    }
                  } else {
                    if (sE[wk(0x9d3)](wk(0x558)))
                      sz = new lG(sy, sD, sF, sG, sP, sQ);
                    else {
                      const sU = rB(),
                        sV = rJ[wk(0x63c)](rK++),
                        sW = sV >> 0x4,
                        sX = sV & 0x1,
                        sY = sV & 0x2,
                        sZ = rB();
                      (sz = new lG(sy, sD, sF, sG, sP, sQ, sU)),
                        (sz[wk(0x23b)] = sW),
                        (sz[wk(0xaa4)] = sX),
                        (sz[wk(0x412)] = sY),
                        (sz[wk(0x549)] = sZ),
                        (sz[wk(0x8ae)] = hN[sW]);
                    }
                  }
                }
              }
              (iv[sy] = sz), iw[wk(0xbc0)](sz);
            }
          }
          iy &&
            ((iU = iy["nx"]),
            (iV = iy["ny"]),
            (q2[wk(0x49b)][wk(0xdaa)] = ""),
            q4(q2, iy["nx"], iy["ny"]));
          const rV = rJ[wk(0x5ae)](rK);
          rK += 0x2;
          for (let t0 = 0x0; t0 < rV; t0++) {
            const t1 = rJ[wk(0x63d)](rK);
            (rK += 0x4), iY(t1);
          }
          const rW = rJ[wk(0x63c)](rK++);
          for (let t2 = 0x0; t2 < rW; t2++) {
            const t3 = rJ[wk(0x63d)](rK);
            rK += 0x4;
            const t4 = iv[t3];
            if (t4) {
              (t4[wk(0x54d)] = iy), n4(t4[wk(0x558)]["id"], 0x1), iY(t3);
              if (!oA[t4[wk(0x558)]["id"]]) oA[t4[wk(0x558)]["id"]] = 0x0;
              oA[t4[wk(0x558)]["id"]]++;
            }
          }
          const rX = rJ[wk(0x63c)](rK++);
          for (let t5 = 0x0; t5 < rX; t5++) {
            const t6 = rJ[wk(0x63c)](rK++),
              t7 = rB(),
              t8 = iQ[t6];
            (t8[wk(0x6aa)] = t7), t7 === 0x0 && (t8[wk(0xed8)] = 0x0);
          }
          (iI = rJ[wk(0x5ae)](rK)), (rK += 0x2);
          const rY = rJ[wk(0x5ae)](rK);
          (rK += 0x2),
            iE[wk(0x4e7)](
              wk(0x873),
              kh(iI, wk(0x90d)) + ",\x20" + kh(rY, wk(0x4b3))
            );
          const rZ = Math[wk(0xc36)](0xa, iI);
          if (iH) {
            const t9 = rJ[wk(0x63c)](rK++),
              ta = t9 >> 0x4,
              tb = t9 & 0xf,
              tc = rJ[wk(0x63c)](rK++);
            for (let te = 0x0; te < tb; te++) {
              const tf = rJ[wk(0x63c)](rK++);
              (iG[tf][wk(0xc62)] = rJ[wk(0x63d)](rK)), (rK += 0x4);
            }
            const td = [];
            for (let tg = 0x0; tg < tc; tg++) {
              td[wk(0xbc0)](rJ[wk(0x63c)](rK++));
            }
            td[wk(0x604)](function (th, ti) {
              return ti - th;
            });
            for (let th = 0x0; th < tc; th++) {
              const ti = td[th];
              iG[ti]["el"][wk(0xeae)](), iG[wk(0xdba)](ti, 0x1);
            }
            for (let tj = 0x0; tj < ta; tj++) {
              rD();
            }
            iG[wk(0x604)](function (tk, tl) {
              const ww = wk;
              return tl[ww(0xc62)] - tk[ww(0xc62)];
            });
          } else {
            iG[wk(0xed7)] = 0x0;
            for (let tk = 0x0; tk < rZ; tk++) {
              rD();
            }
            iH = !![];
          }
          iL();
          const s0 = rJ[wk(0x63c)](rK++);
          for (let tl = 0x0; tl < s0; tl++) {
            const tm = rJ[wk(0x5ae)](rK);
            (rK += 0x2), nT(eK[tm]);
          }
          const s1 = rJ[wk(0x5ae)](rK);
          rK += 0x2;
          for (let tn = 0x0; tn < s1; tn++) {
            const to = rJ[wk(0x63c)](rK++),
              tp = to >> 0x7,
              tq = to & 0x7f;
            if (tq === cQ[wk(0xba8)]) {
              const tu = rJ[wk(0x63c)](rK++),
                tv = rJ[wk(0x63c)](rK++) - 0x1;
              let tw = null,
                tx = 0x0;
              if (tp) {
                const tz = rJ[wk(0x63d)](rK);
                rK += 0x4;
                const tA = rA();
                (tw = tA || wk(0xbe5) + tz), (tx = rJ[wk(0x63c)](rK++));
              }
              const ty = j8[tu];
              nk(
                wk(0xba8),
                null,
                "⚡\x20" +
                  j7[tu] +
                  wk(0x9b8) +
                  (tv < 0x0
                    ? wk(0x4e1)
                    : tv === 0x0
                    ? wk(0xe8c)
                    : wk(0xda9) + (tv + 0x1) + "!"),
                ty
              );
              tw &&
                nj(wk(0xba8), [
                  [wk(0x669), "🏆"],
                  [ty, tw + wk(0x7f1)],
                  [hP[wk(0xd1a)], tx + wk(0x208)],
                  [ty, wk(0xcbf)],
                ]);
              continue;
            }
            const tr = rJ[wk(0x63d)](rK);
            rK += 0x4;
            const ts = rA(),
              tt = ts || wk(0xbe5) + tr;
            if (tq === cQ[wk(0x5a0)]) {
              let tB = rA();
              p9[wk(0xc85)] && (tB = fb(tB));
              if (jN(tB, tr)) nk(tr, tt, tB, tr === ix ? nh["me"] : void 0x0);
              else tr === ix && nk(-0x1, null, wk(0xab8), nh[wk(0xb60)]);
            } else {
              if (tq === cQ[wk(0xa3f)]) {
                const tC = rJ[wk(0x5ae)](rK);
                rK += 0x2;
                const tD = rJ[wk(0x63d)](rK);
                rK += 0x4;
                const tE = rJ[wk(0x63d)](rK);
                rK += 0x4;
                const tF = dC[tC],
                  tG = hN[tF[wk(0x23b)]],
                  tH = hN[tF[wk(0x957)][wk(0x23b)]],
                  tI = tE === 0x0;
                if (tI)
                  nj(wk(0xa3f), [
                    [nh[wk(0x2e0)], tt, !![]],
                    [nh[wk(0x2e0)], wk(0x779)],
                    [
                      hQ[tF[wk(0x23b)]],
                      k9(tD) + "\x20" + tG + "\x20" + tF[wk(0x4d2)],
                    ],
                  ]);
                else {
                  const tJ = hQ[tF[wk(0x957)][wk(0x23b)]];
                  nj(wk(0xa3f), [
                    [tJ, "⭐"],
                    [tJ, tt, !![]],
                    [tJ, wk(0x8c2)],
                    [
                      tJ,
                      k9(tE) +
                        "\x20" +
                        tH +
                        "\x20" +
                        tF[wk(0x4d2)] +
                        wk(0xcaf) +
                        k9(tD) +
                        "\x20" +
                        tG +
                        "\x20" +
                        tF[wk(0x4d2)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tK = rJ[wk(0x5ae)](rK);
                rK += 0x2;
                const tL = eK[tK],
                  tM = hN[tL[wk(0x23b)]],
                  tN = tq === cQ[wk(0xd41)],
                  tO = hQ[tL[wk(0x23b)]];
                nj(wk(0xea0), [
                  [
                    tO,
                    "" +
                      (tN ? wk(0x313) : "") +
                      jt(tM) +
                      "\x20" +
                      tM +
                      "\x20" +
                      tL[wk(0x4d2)] +
                      wk(0x835) +
                      js(tN) +
                      wk(0x8bf),
                  ],
                  [tO, tt + "!", !![]],
                ]);
              }
            }
          }
          const s2 = rJ[wk(0x63c)](rK++),
            s3 = s2 & 0xf,
            s4 = s2 >> 0x4;
          let s5 = ![];
          s3 !== j6["id"] &&
            (j6 && (j6[wk(0x80d)] = !![]),
            (s5 = !![]),
            jd(s3),
            k8(q8, wk(0xb61) + j9[s3] + wk(0x38f)));
          const s6 = rJ[wk(0x63c)](rK++);
          if (s6 > 0x0) {
            let tP = ![];
            for (let tQ = 0x0; tQ < s6; tQ++) {
              const tR = rJ[wk(0x5ae)](rK);
              rK += 0x2;
              const tS = rJ[wk(0x5ae)](rK);
              (rK += 0x2), (j6[tR] = tS);
              if (tS > 0x0) {
                if (!j6[wk(0x785)][tR]) {
                  tP = !![];
                  const tT = nT(eK[tR], !![]);
                  (tT[wk(0x8e7)] = !![]),
                    (tT[wk(0xc74)] = ![]),
                    tT[wk(0xa1b)][wk(0xeae)](wk(0xaf9)),
                    (tT[wk(0xa01)] = nO(wk(0x969))),
                    tT[wk(0x2e9)](tT[wk(0xa01)]),
                    (tT[wk(0x700)] = tR);
                  let tU = -0x1;
                  (tT["t"] = s5 ? 0x1 : 0x0),
                    (tT[wk(0x80d)] = ![]),
                    (tT[wk(0x63e)] = 0x3e8),
                    (tT[wk(0x915)] = function () {
                      const wx = wk,
                        tV = tT["t"];
                      if (tV === tU) return;
                      tU = tV;
                      const tW = jf(Math[wx(0xc36)](0x1, tV / 0.5)),
                        tX = jf(
                          Math[wx(0x49f)](
                            0x0,
                            Math[wx(0xc36)]((tV - 0.5) / 0.5)
                          )
                        );
                      (tT[wx(0x49b)][wx(0x977)] =
                        wx(0x306) + -0x168 * (0x1 - tX) + wx(0xc47) + tX + ")"),
                        (tT[wx(0x49b)][wx(0x6a1)] = -1.12 * (0x1 - tW) + "em");
                    }),
                    jb[wk(0xbc0)](tT),
                    j6[wk(0x9d4)][wk(0x2e9)](tT),
                    (j6[wk(0x785)][tR] = tT);
                }
                p3(j6[wk(0x785)][tR][wk(0xa01)], tS);
              } else {
                const tV = j6[wk(0x785)][tR];
                tV && ((tV[wk(0x80d)] = !![]), delete j6[wk(0x785)][tR]),
                  delete j6[tR];
              }
            }
            tP &&
              [...j6[wk(0x9d4)][wk(0x477)]]
                [wk(0x604)]((tW, tX) => {
                  const wy = wk;
                  return -oc(eK[tW[wy(0x700)]], eK[tX[wy(0x700)]]);
                })
                [wk(0xaa2)]((tW) => {
                  const wz = wk;
                  j6[wz(0x9d4)][wz(0x2e9)](tW);
                });
          }
          (j6[wk(0x99f)] = pN), (j6[wk(0xd28)] = s4);
          if (s4 !== cT[wk(0x30c)]) {
            (j6[wk(0xec8)][wk(0x49b)][wk(0xdaa)] = ""),
              (j6[wk(0x87d)] = j6[wk(0x45b)]),
              (j6[wk(0x324)] = rB());
            if (j6[wk(0x956)] !== jJ) {
              const tW = jJ ? wk(0xde0) : wk(0xeae);
              j6[wk(0x845)][wk(0xa1b)][tW](wk(0xb6e)),
                j6[wk(0x845)][wk(0xa1b)][tW](wk(0xaef)),
                j6[wk(0x2a5)][wk(0xa1b)][tW](wk(0x800)),
                (j6[wk(0x956)] = jJ);
            }
            switch (s4) {
              case cT[wk(0x68e)]:
                k8(j6[wk(0xed3)], wk(0xabc));
                break;
              case cT[wk(0xba8)]:
                const tX = rJ[wk(0x63c)](rK++) + 0x1;
                k8(j6[wk(0xed3)], wk(0x876) + tX);
                break;
              case cT[wk(0x44e)]:
                k8(j6[wk(0xed3)], wk(0xeaa));
                break;
              case cT[wk(0xbea)]:
                k8(j6[wk(0xed3)], wk(0xb08));
                break;
              case cT[wk(0x5fe)]:
                k8(j6[wk(0xed3)], wk(0xcd0));
                break;
            }
          } else j6[wk(0xec8)][wk(0x49b)][wk(0xdaa)] = wk(0x30c);
          if (rJ[wk(0x74f)] - rK > 0x0) {
            iy &&
              (j0(qr),
              (qr[wk(0x37b)] = ![]),
              (q3[wk(0x49b)][wk(0xdaa)] = ""),
              (q2[wk(0x49b)][wk(0xdaa)] = wk(0x30c)),
              q4(q3, iy["nx"], iy["ny"]));
            qs[wk(0x2cc)](), (iy = null), ju[wk(0xa1b)][wk(0xeae)](wk(0xd5b));
            const tY = rJ[wk(0x5ae)](rK) - 0x1;
            rK += 0x2;
            const tZ = rJ[wk(0x63d)](rK);
            rK += 0x4;
            const u0 = rJ[wk(0x63d)](rK);
            rK += 0x4;
            const u1 = rJ[wk(0x63d)](rK);
            rK += 0x4;
            const u2 = rJ[wk(0x63d)](rK);
            (rK += 0x4),
              k8(k3, ka(u0)),
              k8(k2, k9(tZ)),
              k8(k4, k9(u1)),
              k8(k6, k9(u2));
            let u3 = null;
            rJ[wk(0x74f)] - rK > 0x0 && ((u3 = rJ[wk(0x63d)](rK)), (rK += 0x4));
            u3 !== null
              ? (k8(k7, k9(u3)), (k7[wk(0x942)][wk(0x49b)][wk(0xdaa)] = ""))
              : (k7[wk(0x942)][wk(0x49b)][wk(0xdaa)] = wk(0x30c));
            if (tY === -0x1) k8(k5, wk(0xcca));
            else {
              const u4 = eK[tY];
              k8(k5, hN[u4[wk(0x23b)]] + "\x20" + u4[wk(0x4d2)]);
            }
            oB(), (oA = {}), (kn[wk(0x49b)][wk(0xdaa)] = ""), hi();
          }
          break;
        default:
          console[wk(0x3d1)](wk(0x601) + rL);
      }
    }
    var k2 = document[ut(0xb01)](ut(0x75d)),
      k3 = document[ut(0xb01)](ut(0xa85)),
      k4 = document[ut(0xb01)](ut(0x397)),
      k5 = document[ut(0xb01)](ut(0x32c)),
      k6 = document[ut(0xb01)](ut(0xea6)),
      k7 = document[ut(0xb01)](ut(0x6ab));
    function k8(ry, rz) {
      const wA = ut;
      ry[wA(0x4e7)](wA(0x873), rz);
    }
    function k9(ry) {
      const wB = ut;
      return ry[wB(0x5c4)](wB(0x87e));
    }
    function ka(ry, rz) {
      const wC = ut,
        rA = [
          Math[wC(0x7ce)](ry / (0x3e8 * 0x3c * 0x3c)),
          Math[wC(0x7ce)]((ry % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wC(0x7ce)]((ry % (0x3e8 * 0x3c)) / 0x3e8),
        ],
        rB = ["h", "m", "s"];
      let rC = "";
      const rD = rz ? 0x1 : 0x2;
      for (let rE = 0x0; rE <= rD; rE++) {
        const rF = rA[rE];
        (rF > 0x0 || rE == rD) && (rC += rF + rB[rE] + "\x20");
      }
      return rC;
    }
    const kb = {
      [cS[ut(0x3cc)]]: ut(0x98c),
      [cS[ut(0xa9f)]]: ut(0xa9e),
      [cS[ut(0xc5b)]]: ut(0xa9e),
      [cS[ut(0x3fd)]]: ut(0x7d5),
      [cS[ut(0x2df)]]: ut(0x7d5),
      [cS[ut(0xdc2)]]: ut(0x548),
      [cS[ut(0xdd0)]]: ut(0x548),
      [cS[ut(0x85b)]]: ut(0x745),
      [cS[ut(0xabe)]]: ut(0x25b),
    };
    kb["0"] = ut(0xcca);
    var kc = kb;
    for (let ry in cS) {
      const rz = cS[ry];
      if (kc[rz]) continue;
      const rA = kd(ry);
      kc[rz] = rA[ut(0xd73)](ut(0xbab), ut(0xb47));
    }
    function kd(rB) {
      const wD = ut,
        rC = rB[wD(0xd73)](/([A-Z])/g, wD(0xf05)),
        rD = rC[wD(0x8f2)](0x0)[wD(0x330)]() + rC[wD(0xe22)](0x1);
      return rD;
    }
    var ke = null,
      kf = !![];
    function kg() {
      const wE = ut;
      console[wE(0x3d1)](wE(0xd3f)),
        hT(),
        ju[wE(0xa1b)][wE(0xeae)](wE(0xd5b)),
        kf &&
          (kk[wE(0x49b)][wE(0xdaa)] === wE(0x30c)
            ? (clearTimeout(ke),
              kC[wE(0xa1b)][wE(0xde0)](wE(0xd5b)),
              (ke = setTimeout(function () {
                const wF = wE;
                kC[wF(0xa1b)][wF(0xeae)](wF(0xd5b)),
                  (kk[wF(0x49b)][wF(0xdaa)] = ""),
                  kB[wF(0x6f1)](ko),
                  (kn[wF(0x49b)][wF(0xdaa)] = km[wF(0x49b)][wF(0xdaa)] =
                    wF(0x30c)),
                  hi(),
                  hV(hU[wF(0xab3)]);
              }, 0x1f4)))
            : (kC[wE(0xa1b)][wE(0xeae)](wE(0xd5b)), hV(hU[wE(0xab3)])));
    }
    function kh(rB, rC) {
      return rB + "\x20" + rC + (rB === 0x1 ? "" : "s");
    }
    var ki = document[ut(0xe20)](ut(0x4f6)),
      kj = ki[ut(0x5d5)]("2d"),
      kk = document[ut(0xb01)](ut(0x6cd)),
      kl = document[ut(0xb01)](ut(0x8a2)),
      km = document[ut(0xb01)](ut(0x83c));
    km[ut(0x49b)][ut(0xdaa)] = ut(0x30c);
    var kn = document[ut(0xb01)](ut(0x2dc));
    kn[ut(0x49b)][ut(0xdaa)] = ut(0x30c);
    var ko = document[ut(0xb01)](ut(0x856)),
      kp = document[ut(0xb01)](ut(0x479)),
      kq = document[ut(0xb01)](ut(0xd3d));
    function kr() {
      const wG = ut;
      kq[wG(0x26f)] = "";
      for (let rB = 0x0; rB < 0x32; rB++) {
        const rC = ks[rB],
          rD = nO(wG(0xd0a) + rB + wG(0x962)),
          rE = rD[wG(0xb01)](wG(0x3ac));
        if (rC)
          for (let rF = 0x0; rF < rC[wG(0xed7)]; rF++) {
            const rG = rC[rF],
              rH = dF[rG];
            if (!rH) rE[wG(0x2e9)](nO(wG(0x861)));
            else {
              const rI = nO(
                wG(0x21f) + rH[wG(0x23b)] + "\x22\x20" + qy(rH) + wG(0x41a)
              );
              (rI[wG(0x558)] = rH),
                (rI[wG(0x5b5)] = kp),
                jY(rI),
                rE[wG(0x2e9)](rI);
            }
          }
        else rE[wG(0x26f)] = wG(0x861)[wG(0x816)](0x5);
        (rD[wG(0xb01)](wG(0x385))[wG(0x4c5)] = function () {
          ku(rB);
        }),
          (rD[wG(0xb01)](wG(0x607))[wG(0x4c5)] = function () {
            kx(rB);
          }),
          kq[wG(0x2e9)](rD);
      }
    }
    var ks = kt();
    function kt() {
      const wH = ut;
      try {
        const rB = JSON[wH(0x1f3)](hD[wH(0xc29)]);
        for (const rC in rB) {
          !Array[wH(0x660)](rB[rC]) && delete rB[rC];
        }
        return rB;
      } catch {
        return {};
      }
    }
    function ku(rB) {
      const wI = ut,
        rC = [],
        rD = ny[wI(0x7bd)](wI(0x778));
      for (let rE = 0x0; rE < rD[wI(0xed7)]; rE++) {
        const rF = rD[rE],
          rG = rF[wI(0x477)][0x0];
        !rG ? (rC[rE] = null) : (rC[rE] = rG[wI(0x558)][wI(0x244)]);
      }
      (ks[rB] = rC),
        (hD[wI(0xc29)] = JSON[wI(0xce3)](ks)),
        kr(),
        hc(wI(0x888) + rB + "!");
    }
    function kv() {
      const wJ = ut;
      return ny[wJ(0x7bd)](wJ(0x778));
    }
    document[ut(0xb01)](ut(0x57f))[ut(0x4c5)] = function () {
      kw();
    };
    function kw() {
      const wK = ut,
        rB = kv();
      for (const rC of rB) {
        const rD = rC[wK(0x477)][0x0];
        if (!rD) continue;
        rD[wK(0xeae)](),
          iR[wK(0xbc0)](rD[wK(0x9d7)]),
          n4(rD[wK(0x558)]["id"], 0x1),
          il(new Uint8Array([cI[wK(0x93d)], rC[wK(0xf33)]]));
      }
    }
    function kx(rB) {
      const wL = ut;
      if (mJ || mI[wL(0xed7)] > 0x0) return;
      const rC = ks[rB];
      if (!rC) return;
      kw();
      const rD = kv(),
        rE = Math[wL(0xc36)](rD[wL(0xed7)], rC[wL(0xed7)]);
      for (let rF = 0x0; rF < rE; rF++) {
        const rG = rC[rF],
          rH = dF[rG];
        if (!rH || !iS[rH["id"]]) continue;
        const rI = nO(
          wL(0x21f) + rH[wL(0x23b)] + "\x22\x20" + qy(rH) + wL(0x41a)
        );
        (rI[wL(0x558)] = rH),
          (rI[wL(0xdf4)] = !![]),
          (rI[wL(0x9d7)] = iR[wL(0x258)]()),
          nN(rI, rH),
          (iQ[rI[wL(0x9d7)]] = rI),
          rD[rF][wL(0x2e9)](rI),
          n4(rI[wL(0x558)]["id"], -0x1);
        const rJ = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rJ[wL(0x463)](0x0, cI[wL(0x2b7)]),
          rJ[wL(0xa2a)](0x1, rI[wL(0x558)]["id"]),
          rJ[wL(0x463)](0x3, rF),
          il(rJ);
      }
      hc(wL(0xe52) + rB + "!");
    }
    var ky = document[ut(0xb01)](ut(0x4a3)),
      kz = document[ut(0xb01)](ut(0xb8e));
    kz[ut(0x4c5)] = function () {
      const wM = ut;
      kC[wM(0xa1b)][wM(0xde0)](wM(0xd5b)),
        jy
          ? (ke = setTimeout(function () {
              const wN = wM;
              il(new Uint8Array([cI[wN(0x921)]]));
            }, 0x1f4))
          : (ke = setTimeout(function () {
              const wO = wM;
              kC[wO(0xa1b)][wO(0xeae)](wO(0xd5b)),
                (km[wO(0x49b)][wO(0xdaa)] = kn[wO(0x49b)][wO(0xdaa)] =
                  wO(0x30c)),
                (kk[wO(0x49b)][wO(0xdaa)] = ""),
                kB[wO(0x6f1)](ko),
                kB[wO(0xa1b)][wO(0xde0)](wO(0xd5b)),
                jg();
            }, 0x1f4));
    };
    var kA = document[ut(0xb01)](ut(0x6ce)),
      kB = document[ut(0xb01)](ut(0xcad));
    kB[ut(0xa1b)][ut(0xde0)](ut(0xd5b));
    var kC = document[ut(0xb01)](ut(0x30a)),
      kD = document[ut(0xb01)](ut(0xd58)),
      kE = document[ut(0xb01)](ut(0xe7d));
    (kE[ut(0x95d)] = hD[ut(0x29d)] || ""),
      (kE[ut(0x6de)] = cK),
      (kE[ut(0x6c6)] = function () {
        const wP = ut;
        hD[wP(0x29d)] = this[wP(0x95d)];
      });
    var kF;
    kD[ut(0x4c5)] = function () {
      if (!hW) return;
      kG();
    };
    function kG(rB = ![]) {
      const wQ = ut;
      hack.chatFunc = hK;
      hack.toastFunc = hc;
      if(rB) hack.onload();
      hack.moblst = eO;
      if (kk[wQ(0x49b)][wQ(0xdaa)] === wQ(0x30c)) {
        kC[wQ(0xa1b)][wQ(0xeae)](wQ(0xd5b));
        return;
      }
      clearTimeout(kF),
        kB[wQ(0xa1b)][wQ(0xeae)](wQ(0xd5b)),
        (kF = setTimeout(() => {
          const wR = wQ;
          kC[wR(0xa1b)][wR(0xde0)](wR(0xd5b)),
            (kF = setTimeout(() => {
              const wS = wR;
              rB && kC[wS(0xa1b)][wS(0xeae)](wS(0xd5b)),
                (kk[wS(0x49b)][wS(0xdaa)] = wS(0x30c)),
                (hg[wS(0x49b)][wS(0xdaa)] = wS(0x30c)),
                (km[wS(0x49b)][wS(0xdaa)] = ""),
                km[wS(0x2e9)](ko),
                iq(kE[wS(0x95d)][wS(0xe22)](0x0, cK));
            }, 0x1f4));
        }, 0x64));
    }
    var kH = document[ut(0xb01)](ut(0x354));
    function kI(rB, rC, rD) {
      const wT = ut,
        rE = {};
      (rE[wT(0xb30)] = wT(0x73c)), (rE[wT(0x97a)] = !![]), (rD = rD || rE);
      const rF = nO(
        wT(0x553) +
          rD[wT(0xb30)] +
          wT(0x3d4) +
          rB +
          wT(0xc6a) +
          (rD[wT(0x97a)] ? wT(0x771) : "") +
          wT(0x21b)
      );
      return (
        (rF[wT(0xb01)](wT(0xa69))[wT(0x4c5)] = function () {
          const wU = wT;
          rC(!![]), rF[wU(0xeae)]();
        }),
        (rF[wT(0xb01)](wT(0xc2a))[wT(0x4c5)] = function () {
          const wV = wT;
          rF[wV(0xeae)](), rC(![]);
        }),
        kH[wT(0x2e9)](rF),
        rF
      );
    }
    function kJ() {
      function rB(rJ, rK, rL, rM, rN) {
        return rE(rM - 0x20c, rL);
      }
      function rC() {
        const wW = b,
          rJ = [
            wW(0x3a0),
            wW(0xbfb),
            wW(0x391),
            wW(0x490),
            wW(0xc69),
            wW(0x566),
            wW(0x695),
            wW(0x3fb),
            wW(0x6f6),
            wW(0x398),
            wW(0xb3c),
            wW(0x981),
            wW(0x488),
            wW(0x3c4),
            wW(0x38a),
            wW(0x2f4),
            wW(0x2e6),
            wW(0x986),
            wW(0x972),
            wW(0x9d8),
            wW(0x8f1),
            wW(0xafb),
            wW(0xd80),
            wW(0xbd4),
            wW(0x8d6),
            wW(0x558),
            wW(0xd75),
            wW(0x946),
            wW(0x65f),
            wW(0x323),
            wW(0xa64),
            wW(0x31b),
            wW(0x93f),
            wW(0x533),
            wW(0xee7),
            wW(0xbac),
            wW(0xea4),
            wW(0xccf),
            wW(0x98e),
            wW(0x953),
            wW(0x8e0),
            wW(0xf2e),
            wW(0x432),
            wW(0xf3d),
            wW(0x51a),
            wW(0xada),
            wW(0x9bb),
            wW(0xa5e),
            wW(0x515),
            wW(0x892),
            wW(0x526),
            wW(0xbd9),
            wW(0x8a6),
            wW(0x96e),
            wW(0x298),
            wW(0xd14),
            wW(0x982),
            wW(0x41c),
            wW(0xf02),
            wW(0x280),
            wW(0xeea),
            wW(0x5b3),
            wW(0xb10),
            wW(0xcda),
            wW(0x365),
            wW(0x564),
            wW(0x38b),
            wW(0x2ea),
            wW(0x9ae),
            wW(0x413),
            wW(0x227),
            wW(0xcd4),
            wW(0x27a),
            wW(0xe1c),
            wW(0x2e1),
            wW(0xe0f),
            wW(0x988),
            wW(0xa33),
            wW(0x585),
            wW(0xda4),
            wW(0xf45),
            wW(0xe1a),
            wW(0xd44),
            wW(0xe5b),
            wW(0x719),
            wW(0x821),
            wW(0x21e),
            wW(0xe7e),
            wW(0x7d0),
          ];
        return (
          (rC = function () {
            return rJ;
          }),
          rC()
        );
      }
      function rD(rJ, rK, rL, rM, rN) {
        return rE(rK - 0x322, rL);
      }
      function rE(rJ, rK) {
        const rL = rC();
        return (
          (rE = function (rM, rN) {
            rM = rM - (0x12b9 * 0x1 + 0x2f5 * 0xb + -0x3263);
            let rO = rL[rM];
            return rO;
          }),
          rE(rJ, rK)
        );
      }
      function rF(rJ, rK, rL, rM, rN) {
        return rE(rL - 0x398, rK);
      }
      (function (rJ, rK) {
        const wX = b;
        function rL(rR, rS, rT, rU, rV) {
          return rE(rR - -0x202, rS);
        }
        function rM(rR, rS, rT, rU, rV) {
          return rE(rS - -0x361, rU);
        }
        const rN = rJ();
        function rO(rR, rS, rT, rU, rV) {
          return rE(rS - -0x1c0, rU);
        }
        function rP(rR, rS, rT, rU, rV) {
          return rE(rU - 0x1f1, rV);
        }
        function rQ(rR, rS, rT, rU, rV) {
          return rE(rV - 0x352, rU);
        }
        while (!![]) {
          try {
            const rR =
              -parseInt(rL(-0xfd, -0x103, -0xdd, -0xfe, -0x10a)) /
                (-0x14de + 0x14ac + -0x33 * -0x1) +
              (parseInt(rL(-0xf2, -0x102, -0x107, -0x110, -0x114)) /
                (-0xe4b * -0x1 + 0x2 * 0x1039 + -0x2ebb)) *
                (parseInt(rQ(0x413, 0x428, 0x42c, 0x416, 0x43b)) /
                  (-0x1ec7 * 0x1 + -0x19f * -0x14 + -0x1a2)) +
              parseInt(rP(0x300, 0x307, 0x2f6, 0x30d, 0x2fd)) /
                (-0x1 * 0x17bf + 0xbba * 0x1 + -0x27 * -0x4f) +
              parseInt(rM(-0x260, -0x274, -0x280, -0x248, -0x27f)) /
                (-0x2706 + -0x17b5 + 0x20 * 0x1f6) +
              (parseInt(rQ(0x45e, 0x496, 0x48c, 0x49d, 0x47d)) /
                (0x260f * -0x1 + 0x1 * -0x20a1 + 0x46b6)) *
                (parseInt(rM(-0x23e, -0x25f, -0x278, -0x280, -0x256)) /
                  (-0xca9 + -0xbd5 + 0x1885)) +
              -parseInt(rQ(0x452, 0x456, 0x44a, 0x433, 0x44e)) /
                (-0xcce + -0x2482 + 0x4 * 0xc56) +
              (-parseInt(rO(-0xec, -0xc2, -0xe4, -0xe7, -0xc6)) /
                (-0x2 * -0x183 + 0x887 * -0x2 + 0x115 * 0xd)) *
                (parseInt(rL(-0x122, -0x12f, -0x129, -0x120, -0x12a)) /
                  (-0x750 + 0x4 * 0x29f + 0x1 * -0x322));
            if (rR === rK) break;
            else rN[wX(0xbc0)](rN[wX(0xd38)]());
          } catch (rS) {
            rN[wX(0xbc0)](rN[wX(0xd38)]());
          }
        }
      })(rC, -0x51c14 * -0x1 + -0x87309 + 0x92db * 0x13);
      const rG = [
        rH(0x22c, 0x242, 0x249, 0x246, 0x242) +
          rF(0x4bd, 0x4b8, 0x4ab, 0x481, 0x4c9) +
          rF(0x4b0, 0x49e, 0x4bb, 0x4c5, 0x4c8) +
          rI(-0x128, -0x11a, -0x135, -0x121, -0x144),
        rF(0x491, 0x482, 0x49e, 0x4ba, 0x48b) +
          rH(0x234, 0x22e, 0x229, 0x255, 0x244),
        rI(-0x14e, -0x170, -0x171, -0x14b, -0x136) +
          rH(0x265, 0x275, 0x23c, 0x287, 0x241),
      ];
      function rH(rJ, rK, rL, rM, rN) {
        return rE(rJ - 0x140, rN);
      }
      function rI(rJ, rK, rL, rM, rN) {
        return rE(rM - -0x23b, rK);
      }
      !rG[
        rH(0x23f, 0x225, 0x23c, 0x231, 0x269) +
          rI(-0x147, -0x157, -0x129, -0x12c, -0x154)
      ](
        window[
          rI(-0x11a, -0x12c, -0x15c, -0x144, -0x128) +
            rD(0x44e, 0x42f, 0x445, 0x45a, 0x404)
        ][
          rF(0x4d2, 0x4b9, 0x4ad, 0x4ca, 0x4a0) +
            rI(-0x15e, -0x112, -0x150, -0x13b, -0x147)
        ][
          rB(0x331, 0x314, 0x315, 0x31d, 0x31c) +
            rI(-0xed, -0xf8, -0xe4, -0x109, -0xfb) +
            "e"
        ]()
      ) &&
        (alert(
          rH(0x228, 0x1fd, 0x211, 0x21d, 0x21f) +
            rB(0x322, 0x354, 0x32c, 0x327, 0x321) +
            rB(0x316, 0x333, 0x2f3, 0x30f, 0x32b) +
            rD(0x471, 0x448, 0x42a, 0x421, 0x44c) +
            rH(0x249, 0x26b, 0x26f, 0x225, 0x276) +
            rI(-0x15f, -0x11d, -0x133, -0x137, -0x116) +
            rD(0x3fb, 0x411, 0x42e, 0x42e, 0x404) +
            rF(0x484, 0x454, 0x475, 0x44f, 0x452) +
            rI(-0x11b, -0x13a, -0x133, -0x11d, -0x132) +
            rI(-0xf4, -0xfc, -0xf7, -0x10a, -0xff) +
            rF(0x4ba, 0x4e9, 0x4cd, 0x4ef, 0x4c5) +
            rF(0x461, 0x492, 0x47f, 0x493, 0x49f) +
            rI(-0x156, -0x130, -0x120, -0x14a, -0x123) +
            rH(0x21e, 0x236, 0x241, 0x246, 0x215) +
            rD(0x44f, 0x444, 0x44b, 0x46c, 0x43d) +
            rD(0x441, 0x44f, 0x47b, 0x428, 0x470) +
            rI(-0x170, -0x13c, -0x14a, -0x145, -0x131) +
            rH(0x238, 0x243, 0x25f, 0x25c, 0x246) +
            rF(0x49e, 0x486, 0x4af, 0x4c8, 0x495) +
            rB(0x2e9, 0x2fe, 0x2f3, 0x301, 0x325) +
            rH(0x226, 0x208, 0x20b, 0x23b, 0x1ff) +
            rD(0x464, 0x43d, 0x464, 0x448, 0x414) +
            rB(0x330, 0x306, 0x342, 0x324, 0x324) +
            rD(0x43f, 0x43f, 0x42d, 0x43f, 0x414) +
            rB(0x2cb, 0x318, 0x2ca, 0x2ef, 0x2e0) +
            rI(-0x108, -0x10e, -0x12f, -0x10d, -0xf7) +
            rB(0x341, 0x31a, 0x310, 0x333, 0x350) +
            rF(0x4b1, 0x49c, 0x4c4, 0x4b8, 0x4d7) +
            rB(0x354, 0x350, 0x365, 0x33f, 0x347) +
            rF(0x4b5, 0x4d3, 0x4c8, 0x4e0, 0x4bf) +
            rH(0x252, 0x24c, 0x26c, 0x230, 0x273)
        ),
        kI(
          rB(0x325, 0x318, 0x30f, 0x325, 0x328) +
            rI(-0x127, -0x15e, -0x162, -0x13e, -0x13f) +
            rH(0x21f, 0x23c, 0x245, 0x21b, 0x248) +
            rD(0x411, 0x414, 0x43b, 0x43e, 0x423) +
            rB(0x31d, 0x369, 0x349, 0x340, 0x34d) +
            rH(0x26a, 0x273, 0x255, 0x295, 0x261) +
            rF(0x4b3, 0x48a, 0x48b, 0x466, 0x46c) +
            rH(0x268, 0x278, 0x28c, 0x25c, 0x259) +
            rH(0x24b, 0x224, 0x277, 0x26c, 0x232) +
            rI(-0x10d, -0x153, -0x124, -0x134, -0x14c) +
            rF(0x477, 0x4a5, 0x47d, 0x45c, 0x45a) +
            rH(0x224, 0x215, 0x21a, 0x24d, 0x24e) +
            rH(0x239, 0x252, 0x21c, 0x236, 0x20d) +
            rI(-0x179, -0x15f, -0x12f, -0x159, -0x142) +
            rB(0x307, 0x300, 0x2fa, 0x322, 0x315) +
            rD(0x458, 0x44b, 0x441, 0x42e, 0x43f) +
            rI(-0x117, -0x144, -0xf0, -0x117, -0x13b) +
            rH(0x23a, 0x224, 0x252, 0x226, 0x250) +
            rH(0x254, 0x247, 0x22b, 0x248, 0x26d) +
            rH(0x22b, 0x20c, 0x200, 0x246, 0x23b) +
            rI(-0x175, -0x175, -0x174, -0x15d, -0x13f) +
            rB(0x2d5, 0x2fa, 0x2d1, 0x2ed, 0x2f5) +
            rB(0x310, 0x312, 0x304, 0x2f6, 0x308) +
            rH(0x24c, 0x22b, 0x249, 0x24e, 0x23b) +
            rH(0x260, 0x27b, 0x28c, 0x28c, 0x235) +
            rI(-0x135, -0x141, -0x126, -0x140, -0x154) +
            rD(0x461, 0x441, 0x442, 0x428, 0x466) +
            rB(0x2e2, 0x326, 0x2f5, 0x2fa, 0x2f3) +
            "v>",
          (rJ) => {
            const rK = {};
            rK[rN(-0x281, -0x2a8, -0x288, -0x28b, -0x282)] =
              rN(-0x28e, -0x297, -0x26e, -0x292, -0x28b) +
              rN(-0x285, -0x2ab, -0x289, -0x2b0, -0x2a7) +
              rQ(0x3f2, 0x3f5, 0x3e1, 0x3e1, 0x3e3) +
              rP(0x146, 0x141, 0x11f, 0x14b, 0x15a);
            function rL(rR, rS, rT, rU, rV) {
              return rB(rR - 0x10e, rS - 0xae, rU, rS - 0xdd, rV - 0x14d);
            }
            const rM = rK;
            function rN(rR, rS, rT, rU, rV) {
              return rD(rR - 0x13a, rR - -0x6b1, rS, rU - 0x11b, rV - 0x1a6);
            }
            function rO(rR, rS, rT, rU, rV) {
              return rI(rR - 0x193, rV, rT - 0x13d, rT - 0x423, rV - 0x15b);
            }
            function rP(rR, rS, rT, rU, rV) {
              return rH(rU - -0x124, rS - 0xf8, rT - 0x15a, rU - 0x16e, rT);
            }
            function rQ(rR, rS, rT, rU, rV) {
              return rH(rS - 0x1ad, rS - 0x30, rT - 0x170, rU - 0x1d5, rR);
            }
            !rJ &&
              (window[
                rP(0xea, 0x112, 0x108, 0x113, 0x129) +
                  rO(0x2dc, 0x2ec, 0x2f5, 0x2e3, 0x2e2)
              ][rO(0x334, 0x305, 0x309, 0x31b, 0x2fd)] =
                rM[rO(0x2d4, 0x319, 0x2f6, 0x2e2, 0x31b)]);
          }
        ));
    }
    kJ();
    var kK = document[ut(0xb01)](ut(0xa66)),
      kL = (function () {
        const wZ = ut;
        let rB = ![];
        return (
          (function (rC) {
            const wY = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                wY(0xcc4)
              ](rC) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                wY(0xcc4)
              ](rC[wY(0x7e6)](0x0, 0x4))
            )
              rB = !![];
          })(navigator[wZ(0x94f)] || navigator[wZ(0xe3c)] || window[wZ(0x3be)]),
          rB
        );
      })(),
      kM =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          ut(0xcc4)
        ](navigator[ut(0x94f)][ut(0xb5f)]()),
      kN = 0x514,
      kO = 0x28a,
      kP = 0x1,
      kQ = [km, kk, kn, kl, kH, hg],
      kR = 0x1,
      kS = 0x1;
    function kT() {
      const x0 = ut;
      (kS = Math[x0(0x49f)](ki[x0(0x40b)] / d0, ki[x0(0x965)] / d1)),
        (kR =
          Math[p9[x0(0x4c1)] ? x0(0xc36) : x0(0x49f)](kU() / kN, kV() / kO) *
          (kL && !kM ? 1.1 : 0x1)),
        (kR *= kP);
      for (let rB = 0x0; rB < kQ[x0(0xed7)]; rB++) {
        const rC = kQ[rB];
        let rD = kR * (rC[x0(0x82e)] || 0x1);
        (rC[x0(0x49b)][x0(0x977)] = x0(0x8af) + rD + ")"),
          (rC[x0(0x49b)][x0(0x622)] = x0(0xae9)),
          (rC[x0(0x49b)][x0(0x40b)] = kU() / rD + "px"),
          (rC[x0(0x49b)][x0(0x965)] = kV() / rD + "px");
      }
    }
    function kU() {
      const x1 = ut;
      return document[x1(0xe32)][x1(0x6d9)];
    }
    function kV() {
      const x2 = ut;
      return document[x2(0xe32)][x2(0xa78)];
    }
    var kW = 0x1;
    function kX() {
      const x3 = ut;
      (kW = p9[x3(0x31f)] ? 0.65 : window[x3(0x450)]),
        (ki[x3(0x40b)] = kU() * kW),
        (ki[x3(0x965)] = kV() * kW),
        kT();
      for (let rB = 0x0; rB < mI[x3(0xed7)]; rB++) {
        mI[rB][x3(0x1ff)]();
      }
    }
    window[ut(0x97e)] = function () {
      kX(), qG();
    };
    var kY = (function () {
        const x4 = ut,
          rB = 0x23,
          rC = rB / 0x2,
          rD = document[x4(0xeb2)](x4(0x4f6));
        rD[x4(0x40b)] = rD[x4(0x965)] = rB;
        const rE = rD[x4(0x5d5)]("2d");
        return (
          (rE[x4(0xbdd)] = x4(0x78a)),
          rE[x4(0x4cc)](),
          rE[x4(0x7eb)](0x0, rC),
          rE[x4(0xa16)](rB, rC),
          rE[x4(0x7eb)](rC, 0x0),
          rE[x4(0xa16)](rC, rB),
          rE[x4(0x873)](),
          rE[x4(0x592)](rD, x4(0x816))
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
    function l2(rB, rC, rD = 0x8) {
      const x5 = ut;
      rC *= -0x1;
      const rE = Math[x5(0x77b)](rB),
        rF = Math[x5(0xc44)](rB),
        rG = rE * 0x28,
        rH = rF * 0x28;
      l1[x5(0xbc0)]({
        dir: rC,
        start: [rG, rH],
        curve: [
          rG + rE * 0x17 + -rF * rC * rD,
          rH + rF * 0x17 + rE * rC * rD,
          rG + rE * 0x2e,
          rH + rF * 0x2e,
        ],
        side: Math[x5(0x430)](rB),
      });
    }
    var l3 = l4();
    function l4() {
      const x6 = ut,
        rB = new Path2D(),
        rC = Math["PI"] / 0x5;
      return (
        rB[x6(0xc20)](0x0, 0x0, 0x28, rC, l0 - rC),
        rB[x6(0xe29)](
          0x12,
          0x0,
          Math[x6(0x77b)](rC) * 0x28,
          Math[x6(0xc44)](rC) * 0x28
        ),
        rB[x6(0x7b7)](),
        rB
      );
    }
    var l5 = l6();
    function l6() {
      const x7 = ut,
        rB = new Path2D();
      return (
        rB[x7(0x7eb)](-0x28, 0x5),
        rB[x7(0xa56)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rB[x7(0xa16)](0x28, -0x5),
        rB[x7(0xa56)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rB[x7(0x7b7)](),
        rB
      );
    }
    function l7(rB, rC = 0x1, rD = 0x0) {
      const x8 = ut,
        rE = new Path2D();
      for (let rF = 0x0; rF < rB; rF++) {
        const rG = (Math["PI"] * 0x2 * rF) / rB + rD;
        rE[x8(0xa16)](
          Math[x8(0x77b)](rG) - Math[x8(0xc44)](rG) * 0.1 * rC,
          Math[x8(0xc44)](rG)
        );
      }
      return rE[x8(0x7b7)](), rE;
    }
    var l8 = {
      petalRock: l7(0x5),
      petalSoil: l7(0xa),
      petalSalt: l7(0x7),
      petalLightning: (function () {
        const x9 = ut,
          rB = new Path2D();
        for (let rC = 0x0; rC < 0x14; rC++) {
          const rD = (rC / 0x14) * Math["PI"] * 0x2,
            rE = rC % 0x2 === 0x0 ? 0x1 : 0.55;
          rB[x9(0xa16)](Math[x9(0x77b)](rD) * rE, Math[x9(0xc44)](rD) * rE);
        }
        return rB[x9(0x7b7)](), rB;
      })(),
      petalCotton: la(0x9, 0x1, 0.5, 1.6),
      petalWeb: la(0x5, 0x1, 0.5, 0.7),
      petalCactus: la(0x8, 0x1, 0.5, 0.7),
      petalSand: l7(0x6, 0x0, 0.2),
    };
    function l9(rB, rC, rD, rE, rF) {
      const xa = ut;
      (rB[xa(0xbdd)] = rF),
        (rB[xa(0x4e5)] = rD),
        rB[xa(0x94d)](),
        (rC *= 0.45),
        rB[xa(0x2db)](rC),
        rB[xa(0xa21)](-0x14, 0x0),
        rB[xa(0x4cc)](),
        rB[xa(0x7eb)](0x0, 0x26),
        rB[xa(0xa16)](0x50, 0x7),
        rB[xa(0xa16)](0x50, -0x7),
        rB[xa(0xa16)](0x0, -0x26),
        rB[xa(0xa16)](-0x14, -0x1e),
        rB[xa(0xa16)](-0x14, 0x1e),
        rB[xa(0x7b7)](),
        (rD = rD / rC),
        (rB[xa(0x4e5)] = 0x64 + rD),
        (rB[xa(0xbdd)] = rF),
        rB[xa(0x873)](),
        (rB[xa(0xbdd)] = rB[xa(0x74b)] = rE),
        (rB[xa(0x4e5)] -= rD * 0x2),
        rB[xa(0x873)](),
        rB[xa(0x869)](),
        rB[xa(0xbad)]();
    }
    function la(rB, rC, rD, rE) {
      const xb = ut,
        rF = new Path2D();
      return lb(rF, rB, rC, rD, rE), rF[xb(0x7b7)](), rF;
    }
    function lb(rB, rC, rD, rE, rF) {
      const xc = ut;
      rB[xc(0x7eb)](rD, 0x0);
      for (let rG = 0x1; rG <= rC; rG++) {
        const rH = (Math["PI"] * 0x2 * (rG - rE)) / rC,
          rI = (Math["PI"] * 0x2 * rG) / rC;
        rB[xc(0xe29)](
          Math[xc(0x77b)](rH) * rD * rF,
          Math[xc(0xc44)](rH) * rD * rF,
          Math[xc(0x77b)](rI) * rD,
          Math[xc(0xc44)](rI) * rD
        );
      }
    }
    var lc = (function () {
        const xd = ut,
          rB = new Path2D();
        rB[xd(0x7eb)](0x3c, 0x0);
        const rC = 0x6;
        for (let rD = 0x0; rD < rC; rD++) {
          const rE = ((rD + 0.5) / rC) * Math["PI"] * 0x2,
            rF = ((rD + 0x1) / rC) * Math["PI"] * 0x2;
          rB[xd(0xe29)](
            Math[xd(0x77b)](rE) * 0x78,
            Math[xd(0xc44)](rE) * 0x78,
            Math[xd(0x77b)](rF) * 0x3c,
            Math[xd(0xc44)](rF) * 0x3c
          );
        }
        return rB[xd(0x7b7)](), rB;
      })(),
      ld = (function () {
        const xe = ut,
          rB = new Path2D(),
          rC = 0x6;
        for (let rD = 0x0; rD < rC; rD++) {
          const rE = ((rD + 0.5) / rC) * Math["PI"] * 0x2;
          rB[xe(0x7eb)](0x0, 0x0), rB[xe(0xa16)](...le(0x37, 0x0, rE));
          for (let rF = 0x0; rF < 0x2; rF++) {
            const rG = (rF / 0x2) * 0x1e + 0x14,
              rH = 0xa - rF * 0x2;
            rB[xe(0x7eb)](...le(rG + rH, -rH, rE)),
              rB[xe(0xa16)](...le(rG, 0x0, rE)),
              rB[xe(0xa16)](...le(rG + rH, rH, rE));
          }
        }
        return rB;
      })();
    function le(rB, rC, rD) {
      const xf = ut,
        rE = Math[xf(0xc44)](rD),
        rF = Math[xf(0x77b)](rD);
      return [rB * rF + rC * rE, rC * rF - rB * rE];
    }
    function lf(rB, rC, rD) {
      (rB /= 0x168), (rC /= 0x64), (rD /= 0x64);
      let rE, rF, rG;
      if (rC === 0x0) rE = rF = rG = rD;
      else {
        const rI = (rL, rM, rN) => {
            if (rN < 0x0) rN += 0x1;
            if (rN > 0x1) rN -= 0x1;
            if (rN < 0x1 / 0x6) return rL + (rM - rL) * 0x6 * rN;
            if (rN < 0x1 / 0x2) return rM;
            if (rN < 0x2 / 0x3) return rL + (rM - rL) * (0x2 / 0x3 - rN) * 0x6;
            return rL;
          },
          rJ = rD < 0.5 ? rD * (0x1 + rC) : rD + rC - rD * rC,
          rK = 0x2 * rD - rJ;
        (rE = rI(rK, rJ, rB + 0x1 / 0x3)),
          (rF = rI(rK, rJ, rB)),
          (rG = rI(rK, rJ, rB - 0x1 / 0x3));
      }
      const rH = (rL) => {
        const xg = b,
          rM = Math[xg(0xa7d)](rL * 0xff)[xg(0xb9b)](0x10);
        return rM[xg(0xed7)] === 0x1 ? "0" + rM : rM;
      };
      return "#" + rH(rE) + rH(rF) + rH(rG);
    }
    var lg = [];
    for (let rB = 0x0; rB < 0xa; rB++) {
      const rC = 0x1 - rB / 0xa;
      lg[ut(0xbc0)](lf(0x28 + rC * 0xc8, 0x50, 0x3c * rC));
    }
    var lh = [ut(0x300), ut(0x90b)],
      li = lh[0x0],
      lj = [ut(0x61c), ut(0xa2e), ut(0x2a7), ut(0x619)];
    function lk(rD = ut(0x375)) {
      const xh = ut,
        rE = [];
      for (let rF = 0x0; rF < 0x5; rF++) {
        rE[xh(0xbc0)](pX(rD, 0.8 - (rF / 0x5) * 0.25));
      }
      return rE;
    }
    var ll = {
        pet: {
          body: li,
          wing: pX(li, 0.7),
          tail_outline: pX(li, 0.4),
          bone_outline: pX(li, 0.4),
          bone: pX(li, 0.6),
          tail: lk(pX(li, 0.8)),
        },
        main: {
          body: ut(0x375),
          wing: ut(0xb75),
          tail_outline: ut(0x727),
          bone_outline: ut(0x69e),
          bone: ut(0x727),
          tail: lk(),
        },
      },
      lm = new Path2D(ut(0xb50)),
      ln = new Path2D(ut(0xa80)),
      lo = [];
    for (let rD = 0x0; rD < 0x3; rD++) {
      lo[ut(0xbc0)](pX(lh[0x0], 0x1 - (rD / 0x3) * 0.2));
    }
    function lp(rE = Math[ut(0xb69)]()) {
      return function () {
        return (rE = (rE * 0x2455 + 0xc091) % 0x38f40), rE / 0x38f40;
      };
    }
    const lq = {
      [cS[ut(0x9d5)]]: [ut(0x39e), ut(0xe5a)],
      [cS[ut(0xa4e)]]: [ut(0x375), ut(0xb34)],
      [cS[ut(0x9dd)]]: [ut(0xa7e), ut(0xb19)],
    };
    var lr = lq;
    const ls = {};
    (ls[ut(0xd91)] = !![]),
      (ls[ut(0xcb1)] = !![]),
      (ls[ut(0xac0)] = !![]),
      (ls[ut(0x593)] = !![]),
      (ls[ut(0x215)] = !![]),
      (ls[ut(0xd1e)] = !![]),
      (ls[ut(0xc57)] = !![]);
    var lt = ls;
    const lu = {};
    (lu[ut(0xb7c)] = !![]),
      (lu[ut(0xb9e)] = !![]),
      (lu[ut(0xd78)] = !![]),
      (lu[ut(0x9f1)] = !![]),
      (lu[ut(0x8df)] = !![]),
      (lu[ut(0xc91)] = !![]),
      (lu[ut(0x4bc)] = !![]);
    var lv = lu;
    const lw = {};
    (lw[ut(0xd78)] = !![]),
      (lw[ut(0x9f1)] = !![]),
      (lw[ut(0x8df)] = !![]),
      (lw[ut(0xc91)] = !![]);
    var lx = lw;
    const ly = {};
    (ly[ut(0xb9e)] = !![]), (ly[ut(0xe81)] = !![]), (ly[ut(0x593)] = !![]);
    var lz = ly;
    const lA = {};
    (lA[ut(0xdcb)] = !![]), (lA[ut(0xabe)] = !![]), (lA[ut(0xe55)] = !![]);
    var lB = lA;
    const lC = {};
    (lC[ut(0x625)] = !![]),
      (lC[ut(0x85b)] = !![]),
      (lC[ut(0xe99)] = !![]),
      (lC[ut(0xab2)] = !![]),
      (lC[ut(0xcdb)] = !![]);
    var lD = lC;
    function lE(rE, rF) {
      const xi = ut;
      rE[xi(0x4cc)](), rE[xi(0x7eb)](rF, 0x0);
      for (let rG = 0x0; rG < 0x6; rG++) {
        const rH = (rG / 0x6) * Math["PI"] * 0x2;
        rE[xi(0xa16)](Math[xi(0x77b)](rH) * rF, Math[xi(0xc44)](rH) * rF);
      }
      rE[xi(0x7b7)]();
    }
    function lF(rE, rF, rG, rH, rI) {
      const xj = ut;
      rE[xj(0x4cc)](),
        rE[xj(0x7eb)](0x9, -0x5),
        rE[xj(0xa56)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rE[xj(0xe29)](0xd, 0x0, 0x9, -0x5),
        rE[xj(0x7b7)](),
        (rE[xj(0x401)] = rE[xj(0x452)] = xj(0xa7d)),
        (rE[xj(0xbdd)] = rH),
        (rE[xj(0x4e5)] = rF),
        rE[xj(0x873)](),
        (rE[xj(0x4e5)] -= rI),
        (rE[xj(0x74b)] = rE[xj(0xbdd)] = rG),
        rE[xj(0x869)](),
        rE[xj(0x873)]();
    }
    var lG = class {
        constructor(rE = -0x1, rF, rG, rH, rI, rJ = 0x7, rK = -0x1) {
          const xk = ut;
          (this["id"] = rE),
            (this[xk(0x8ca)] = rF),
            (this[xk(0x89d)] = hM[rF]),
            (this[xk(0xa6b)] = this[xk(0x89d)][xk(0x9d3)](xk(0x558))),
            (this["x"] = this["nx"] = this["ox"] = rG),
            (this["y"] = this["ny"] = this["oy"] = rH),
            (this[xk(0x9d6)] = this[xk(0xbc6)] = this[xk(0xca6)] = rI),
            (this[xk(0xd18)] =
              this[xk(0x663)] =
              this[xk(0xbf7)] =
              this[xk(0x6ff)] =
                rK),
            (this[xk(0x4b0)] = 0x0),
            (this[xk(0x31a)] = this[xk(0x25c)] = this[xk(0xcf7)] = rJ),
            (this[xk(0x5ee)] = 0x0),
            (this[xk(0xab6)] = ![]),
            (this[xk(0xe1e)] = 0x0),
            (this[xk(0x5e0)] = 0x0),
            (this[xk(0xa86)] = this[xk(0x89d)][xk(0x757)](xk(0x60b)) > -0x1),
            (this[xk(0xe82)] = this[xk(0xa86)] ? this[xk(0x663)] < 0x1 : 0x1),
            (this[xk(0xaa4)] = ![]),
            (this[xk(0x549)] = 0x0),
            (this[xk(0xdb0)] = 0x0),
            (this[xk(0x7db)] = 0x0),
            (this[xk(0x283)] = 0x1),
            (this[xk(0x68b)] = 0x0),
            (this[xk(0x7e9)] = [cS[xk(0x8f8)], cS[xk(0xa15)], cS[xk(0x455)]][
              xk(0x935)
            ](this[xk(0x8ca)])),
            (this[xk(0x58e)] = lv[this[xk(0x89d)]]),
            (this[xk(0x8a3)] = lx[this[xk(0x89d)]] ? 0x32 / 0xc8 : 0x0),
            (this[xk(0x6db)] = lt[this[xk(0x89d)]]),
            (this[xk(0x645)] = 0x0),
            (this[xk(0xe05)] = 0x0),
            (this[xk(0xe21)] = ![]),
            (this[xk(0xa59)] = 0x0),
            (this[xk(0xddb)] = !![]),
            (this[xk(0x9c7)] = 0x2),
            (this[xk(0x9f2)] = 0x0),
            (this[xk(0xe6e)] = lD[this[xk(0x89d)]]),
            (this[xk(0x2aa)] = lz[this[xk(0x89d)]]),
            (this[xk(0x294)] = lB[this[xk(0x89d)]]);
        }
        [ut(0x915)]() {
          const xl = ut;
          this[xl(0xab6)] && (this[xl(0xe1e)] += pO / 0xc8);
          (this[xl(0xe05)] += ((this[xl(0xe21)] ? 0x1 : -0x1) * pO) / 0xc8),
            (this[xl(0xe05)] = Math[xl(0xc36)](
              0x1,
              Math[xl(0x49f)](0x0, this[xl(0xe05)])
            )),
            (this[xl(0x7db)] = pu(
              this[xl(0x7db)],
              this[xl(0xdb0)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[xl(0xdb0)] = pu(this[xl(0xdb0)], this[xl(0x549)], 0x64));
          this[xl(0x5e0)] > 0x0 &&
            ((this[xl(0x5e0)] -= pO / 0x96),
            this[xl(0x5e0)] < 0x0 && (this[xl(0x5e0)] = 0x0));
          (this[xl(0x5ee)] += pO / 0x64),
            (this["t"] = Math[xl(0xc36)](0x1, this[xl(0x5ee)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[xl(0x663)] =
              this[xl(0x6ff)] +
              (this[xl(0xbf7)] - this[xl(0x6ff)]) * this["t"]),
            (this[xl(0x31a)] =
              this[xl(0xcf7)] +
              (this[xl(0x25c)] - this[xl(0xcf7)]) * this["t"]);
          if (this[xl(0x7e9)]) {
            const rE = Math[xl(0xc36)](0x1, pO / 0x64);
            (this[xl(0x283)] +=
              (Math[xl(0x77b)](this[xl(0xbc6)]) - this[xl(0x283)]) * rE),
              (this[xl(0x68b)] +=
                (Math[xl(0xc44)](this[xl(0xbc6)]) - this[xl(0x68b)]) * rE);
          }
          (this[xl(0x9d6)] = f8(this[xl(0xca6)], this[xl(0xbc6)], this["t"])),
            (this[xl(0xa59)] +=
              ((Math[xl(0x796)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pO) /
              0x12),
            this[xl(0x4b0)] > 0x0 &&
              ((this[xl(0x4b0)] -= pO / 0x258),
              this[xl(0x4b0)] < 0x0 && (this[xl(0x4b0)] = 0x0)),
            this[xl(0x294)] &&
              ((this[xl(0x9c7)] += pO / 0x5dc),
              this[xl(0x9c7)] > 0x1 && (this[xl(0x9c7)] = 0x1),
              (this[xl(0xddb)] = this[xl(0x9c7)] < 0x1)),
            this[xl(0x663)] < 0x1 &&
              (this[xl(0xe82)] = pu(this[xl(0xe82)], 0x1, 0xc8)),
            this[xl(0x4b0)] === 0x0 &&
              (this[xl(0xd18)] +=
                (this[xl(0x663)] - this[xl(0xd18)]) *
                Math[xl(0xc36)](0x1, pO / 0xc8));
        }
        [ut(0x939)](rE, rF = ![]) {
          const xm = ut,
            rG = this[xm(0x31a)] / 0x19;
          rE[xm(0x2db)](rG),
            rE[xm(0xa21)](0x5, 0x0),
            (rE[xm(0x4e5)] = 0x5),
            (rE[xm(0x452)] = rE[xm(0x401)] = xm(0xa7d)),
            (rE[xm(0xbdd)] = rE[xm(0x74b)] = this[xm(0x30d)](xm(0x232)));
          rF &&
            (rE[xm(0x94d)](),
            rE[xm(0xa21)](0x3, 0x0),
            rE[xm(0x4cc)](),
            rE[xm(0x7eb)](-0xa, 0x0),
            rE[xm(0xa16)](-0x28, -0xf),
            rE[xm(0xe29)](-0x21, 0x0, -0x28, 0xf),
            rE[xm(0x7b7)](),
            rE[xm(0xbad)](),
            rE[xm(0x873)](),
            rE[xm(0x869)]());
          rE[xm(0x4cc)](), rE[xm(0x7eb)](0x0, 0x1e);
          const rH = 0x1c,
            rI = 0x24,
            rJ = 0x5;
          rE[xm(0x7eb)](0x0, rH);
          for (let rK = 0x0; rK < rJ; rK++) {
            const rL = ((((rK + 0.5) / rJ) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              rM = ((((rK + 0x1) / rJ) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rE[xm(0xe29)](
              Math[xm(0x77b)](rL) * rI * 0.85,
              -Math[xm(0xc44)](rL) * rI,
              Math[xm(0x77b)](rM) * rH * 0.7,
              -Math[xm(0xc44)](rM) * rH
            );
          }
          rE[xm(0xa16)](-0x1c, -0x9),
            rE[xm(0xe29)](-0x26, 0x0, -0x1c, 0x9),
            rE[xm(0xa16)](0x0, rH),
            rE[xm(0x7b7)](),
            (rE[xm(0x74b)] = this[xm(0x30d)](xm(0x98a))),
            rE[xm(0x869)](),
            rE[xm(0x873)](),
            rE[xm(0x4cc)]();
          for (let rN = 0x0; rN < 0x4; rN++) {
            const rO = (((rN / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rP = -0x1e + Math[xm(0x77b)](rO) * 0xd,
              rQ = Math[xm(0xc44)](rO) * 0xb;
            rE[xm(0x7eb)](rP, rQ),
              rE[xm(0xa16)](
                rP + Math[xm(0x77b)](rO) * 0x1b,
                rQ + Math[xm(0xc44)](rO) * 0x1b
              );
          }
          (rE[xm(0x4e5)] = 0x4), rE[xm(0x873)]();
        }
        [ut(0x6e5)](rE, rF = ut(0x97d), rG = 0x0) {
          const xn = ut;
          for (let rH = 0x0; rH < l1[xn(0xed7)]; rH++) {
            const rI = l1[rH];
            rE[xn(0x94d)](),
              rE[xn(0x235)](
                rI[xn(0x728)] * Math[xn(0xc44)](this[xn(0xa59)] + rH) * 0.15 +
                  rG * rI[xn(0xf27)]
              ),
              rE[xn(0x4cc)](),
              rE[xn(0x7eb)](...rI[xn(0x202)]),
              rE[xn(0xe29)](...rI[xn(0xe3b)]),
              (rE[xn(0xbdd)] = this[xn(0x30d)](rF)),
              (rE[xn(0x4e5)] = 0x8),
              (rE[xn(0x452)] = xn(0xa7d)),
              rE[xn(0x873)](),
              rE[xn(0xbad)]();
          }
        }
        [ut(0x4c4)](rE) {
          const xo = ut;
          rE[xo(0x4cc)]();
          let rF = 0x0,
            rG = 0x0,
            rH,
            rI;
          const rJ = 0x14;
          for (let rK = 0x0; rK < rJ; rK++) {
            const rL = (rK / rJ) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              rM = ((rK + 0x1) / rJ) * 0x28;
            (rH = Math[xo(0x77b)](rL) * rM), (rI = Math[xo(0xc44)](rL) * rM);
            const rN = rF + rH,
              rO = rG + rI;
            rE[xo(0xe29)](
              (rF + rN) * 0.5 + rI * 0.15,
              (rG + rO) * 0.5 - rH * 0.15,
              rN,
              rO
            ),
              (rF = rN),
              (rG = rO);
          }
          rE[xo(0xe29)](
            rF - rI * 0.42 + rH * 0.4,
            rG + rH * 0.42 + rI * 0.4,
            rF - rI * 0.84,
            rG + rH * 0.84
          ),
            (rE[xo(0x74b)] = this[xo(0x30d)](xo(0xd02))),
            rE[xo(0x869)](),
            (rE[xo(0x4e5)] = 0x8),
            (rE[xo(0xbdd)] = this[xo(0x30d)](xo(0xa26))),
            rE[xo(0x873)]();
        }
        [ut(0x593)](rE) {
          const xp = ut;
          rE[xp(0x2db)](this[xp(0x31a)] / 0xd),
            rE[xp(0x235)](-Math["PI"] / 0x6),
            (rE[xp(0x452)] = rE[xp(0x401)] = xp(0xa7d)),
            rE[xp(0x4cc)](),
            rE[xp(0x7eb)](0x0, -0xe),
            rE[xp(0xa16)](0x6, -0x14),
            (rE[xp(0x74b)] = rE[xp(0xbdd)] = this[xp(0x30d)](xp(0xc2f))),
            (rE[xp(0x4e5)] = 0x7),
            rE[xp(0x873)](),
            (rE[xp(0x74b)] = rE[xp(0xbdd)] = this[xp(0x30d)](xp(0xeb7))),
            (rE[xp(0x4e5)] = 0x2),
            rE[xp(0x873)](),
            rE[xp(0x4cc)](),
            rE[xp(0x7eb)](0x0, -0xc),
            rE[xp(0xe29)](-0x6, 0x0, 0x4, 0xe),
            rE[xp(0xa56)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rE[xp(0x4e5)] = 0xc),
            (rE[xp(0x74b)] = rE[xp(0xbdd)] = this[xp(0x30d)](xp(0xb35))),
            rE[xp(0x869)](),
            rE[xp(0x873)](),
            (rE[xp(0x4e5)] = 0x6),
            (rE[xp(0x74b)] = rE[xp(0xbdd)] = this[xp(0x30d)](xp(0x7a5))),
            rE[xp(0x873)](),
            rE[xp(0x869)]();
        }
        [ut(0xac0)](rE) {
          const xq = ut;
          rE[xq(0x2db)](this[xq(0x31a)] / 0x2d),
            rE[xq(0xa21)](-0x14, 0x0),
            (rE[xq(0x452)] = rE[xq(0x401)] = xq(0xa7d)),
            rE[xq(0x4cc)]();
          const rF = 0x6,
            rG = Math["PI"] * 0.45,
            rH = 0x3c,
            rI = 0x46;
          rE[xq(0x7eb)](0x0, 0x0);
          for (let rJ = 0x0; rJ < rF; rJ++) {
            const rK = ((rJ / rF) * 0x2 - 0x1) * rG,
              rL = (((rJ + 0x1) / rF) * 0x2 - 0x1) * rG;
            rJ === 0x0 &&
              rE[xq(0xe29)](
                -0xa,
                -0x32,
                Math[xq(0x77b)](rK) * rH,
                Math[xq(0xc44)](rK) * rH
              );
            const rM = (rK + rL) / 0x2;
            rE[xq(0xe29)](
              Math[xq(0x77b)](rM) * rI,
              Math[xq(0xc44)](rM) * rI,
              Math[xq(0x77b)](rL) * rH,
              Math[xq(0xc44)](rL) * rH
            );
          }
          rE[xq(0xe29)](-0xa, 0x32, 0x0, 0x0),
            (rE[xq(0x74b)] = this[xq(0x30d)](xq(0xeb1))),
            (rE[xq(0xbdd)] = this[xq(0x30d)](xq(0x5a7))),
            (rE[xq(0x4e5)] = 0xa),
            rE[xq(0x873)](),
            rE[xq(0x869)](),
            rE[xq(0x4cc)](),
            rE[xq(0xc20)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rE[xq(0x7b7)](),
            (rE[xq(0xbdd)] = this[xq(0x30d)](xq(0xb23))),
            (rE[xq(0x4e5)] = 0x1e),
            rE[xq(0x873)](),
            (rE[xq(0x4e5)] = 0xa),
            (rE[xq(0xbdd)] = rE[xq(0x74b)] = this[xq(0x30d)](xq(0x386))),
            rE[xq(0x869)](),
            rE[xq(0x873)]();
        }
        [ut(0xbcb)](rE, rF = ![]) {
          const xr = ut;
          rE[xr(0x2db)](this[xr(0x31a)] / 0x64);
          let rG = this[xr(0xcd1)]
            ? 0.75
            : Math[xr(0xc44)](Date[xr(0x8ea)]() / 0x96 + this[xr(0xa59)]);
          (rG = rG * 0.5 + 0.5),
            (rG *= 0.7),
            rE[xr(0x4cc)](),
            rE[xr(0x7eb)](0x0, 0x0),
            rE[xr(0xc20)](0x0, 0x0, 0x64, rG, Math["PI"] * 0x2 - rG),
            rE[xr(0x7b7)](),
            (rE[xr(0x74b)] = this[xr(0x30d)](xr(0xcaa))),
            rE[xr(0x869)](),
            rE[xr(0x8da)](),
            (rE[xr(0xbdd)] = xr(0x7dc)),
            (rE[xr(0x4e5)] = rF ? 0x28 : 0x1e),
            (rE[xr(0x401)] = xr(0xa7d)),
            rE[xr(0x873)](),
            !rF &&
              (rE[xr(0x4cc)](),
              rE[xr(0xc20)](
                0x0 - rG * 0x8,
                -0x32 - rG * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rE[xr(0x74b)] = xr(0x525)),
              rE[xr(0x869)]());
        }
        [ut(0xed9)](rE) {
          const xs = ut;
          rE[xs(0x2db)](this[xs(0x31a)] / 0x50),
            rE[xs(0x235)](-this[xs(0x9d6)]),
            rE[xs(0xa21)](0x0, 0x50);
          const rF = Date[xs(0x8ea)]() / 0x12c + this[xs(0xa59)];
          rE[xs(0x4cc)]();
          const rG = 0x3;
          let rH;
          for (let rK = 0x0; rK < rG; rK++) {
            const rL = ((rK / rG) * 0x2 - 0x1) * 0x64,
              rM = (((rK + 0x1) / rG) * 0x2 - 0x1) * 0x64;
            (rH =
              0x14 +
              (Math[xs(0xc44)]((rK / rG) * Math["PI"] * 0x8 + rF) * 0.5 + 0.5) *
                0x1e),
              rK === 0x0 && rE[xs(0x7eb)](rL, -rH),
              rE[xs(0xa56)](rL, rH, rM, rH, rM, -rH);
          }
          rE[xs(0xa56)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rH),
            rE[xs(0x7b7)](),
            (rE[xs(0x557)] *= 0.7);
          const rI = this[xs(0xaa4)]
            ? lh[0x0]
            : this["id"] < 0x0
            ? lj[0x0]
            : lj[this["id"] % lj[xs(0xed7)]];
          (rE[xs(0x74b)] = this[xs(0x30d)](rI)),
            rE[xs(0x869)](),
            rE[xs(0x8da)](),
            (rE[xs(0x401)] = xs(0xa7d)),
            (rE[xs(0xbdd)] = xs(0x7dc)),
            xs(0xcf5),
            (rE[xs(0x4e5)] = 0x1e),
            rE[xs(0x873)]();
          let rJ = Math[xs(0xc44)](rF * 0x1);
          (rJ = rJ * 0.5 + 0.5),
            (rJ *= 0x3),
            rE[xs(0x4cc)](),
            rE[xs(0x428)](
              0x0,
              -0x82 - rJ * 0x2,
              0x28 - rJ,
              0x14 - rJ * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rE[xs(0x74b)] = rE[xs(0xbdd)]),
            rE[xs(0x869)]();
        }
        [ut(0xe6b)](rE, rF) {
          const xt = ut;
          rE[xt(0x2db)](this[xt(0x31a)] / 0x14);
          const rG = rE[xt(0x557)];
          (rE[xt(0xbdd)] = rE[xt(0x74b)] = this[xt(0x30d)](xt(0xedf))),
            (rE[xt(0x557)] = 0.4 * rG),
            rE[xt(0x94d)](),
            rE[xt(0x4cc)](),
            rE[xt(0x235)](Math["PI"] * 0.16),
            rE[xt(0xa21)](rF ? -0x6 : -0x9, 0x0),
            rE[xt(0x7eb)](0x0, -0x4),
            rE[xt(0xe29)](-0x2, 0x0, 0x0, 0x4),
            (rE[xt(0x4e5)] = 0x8),
            (rE[xt(0x401)] = rE[xt(0x452)] = xt(0xa7d)),
            rE[xt(0x873)](),
            rE[xt(0xbad)](),
            rE[xt(0x4cc)](),
            rE[xt(0xc20)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rE[xt(0x869)](),
            rE[xt(0x8da)](),
            (rE[xt(0x557)] = 0.5 * rG),
            (rE[xt(0x4e5)] = rF ? 0x8 : 0x3),
            rE[xt(0x873)]();
        }
        [ut(0xab2)](rE) {
          const xu = ut;
          rE[xu(0x2db)](this[xu(0x31a)] / 0x64);
          const rF = this[xu(0x30d)](xu(0x442)),
            rG = this[xu(0x30d)](xu(0x95b)),
            rH = 0x4;
          rE[xu(0x401)] = rE[xu(0x452)] = xu(0xa7d);
          const rI = 0x64 - rE[xu(0x4e5)] * 0.5;
          for (let rJ = 0x0; rJ <= rH; rJ++) {
            const rK = (0x1 - rJ / rH) * rI;
            lE(rE, rK),
              (rE[xu(0x4e5)] =
                0x1e +
                rJ *
                  (Math[xu(0xc44)](Date[xu(0x8ea)]() / 0x320 + rJ) * 0.5 +
                    0.5) *
                  0x5),
              (rE[xu(0x74b)] = rE[xu(0xbdd)] = rJ % 0x2 === 0x0 ? rF : rG),
              rJ === rH - 0x1 && rE[xu(0x869)](),
              rE[xu(0x873)]();
          }
        }
        [ut(0x55e)](rE, rF) {
          const xv = ut;
          rE[xv(0x4cc)](),
            rE[xv(0xc20)](0x0, 0x0, this[xv(0x31a)], 0x0, l0),
            (rE[xv(0x74b)] = this[xv(0x30d)](rF)),
            rE[xv(0x869)](),
            (rE[xv(0x74b)] = xv(0x525));
          for (let rG = 0x1; rG < 0x4; rG++) {
            rE[xv(0x4cc)](),
              rE[xv(0xc20)](
                0x0,
                0x0,
                this[xv(0x31a)] * (0x1 - rG / 0x4),
                0x0,
                l0
              ),
              rE[xv(0x869)]();
          }
        }
        [ut(0x5f5)](rE, rF) {
          const xw = ut;
          rE[xw(0xa21)](-this[xw(0x31a)], 0x0), (rE[xw(0xd52)] = xw(0x5cf));
          const rG = 0x32;
          let rH = ![];
          !this[xw(0x61b)] && ((rH = !![]), (this[xw(0x61b)] = []));
          while (this[xw(0x61b)][xw(0xed7)] < rG) {
            this[xw(0x61b)][xw(0xbc0)]({
              x: rH ? Math[xw(0xb69)]() : 0x0,
              y: Math[xw(0xb69)]() * 0x2 - 0x1,
              vx: Math[xw(0xb69)]() * 0.03 + 0.02,
              size: Math[xw(0xb69)]() * 0.2 + 0.2,
            });
          }
          const rI = this[xw(0x31a)] * 0x2,
            rJ = Math[xw(0x49f)](this[xw(0x31a)] * 0.1, 0x4),
            rK = rE[xw(0x557)];
          (rE[xw(0x74b)] = rF), rE[xw(0x4cc)]();
          for (let rL = rG - 0x1; rL >= 0x0; rL--) {
            const rM = this[xw(0x61b)][rL];
            rM["x"] += rM["vx"];
            const rN = rM["x"] * rI,
              rO = this[xw(0x8a3)] * rN,
              rP = rM["y"] * rO,
              rQ =
                Math[xw(0xe12)](0x1 - Math[xw(0x301)](rP) / rO, 0.2) *
                Math[xw(0xe12)](0x1 - rN / rI, 0.2);
            if (rM["x"] >= 0x1 || rQ < 0.001) {
              this[xw(0x61b)][xw(0xdba)](rL, 0x1);
              continue;
            }
            (rE[xw(0x557)] = rQ * rK * 0.5),
              rE[xw(0x4cc)](),
              rE[xw(0xc20)](
                rN,
                rP,
                rM[xw(0x31a)] * rO + rJ,
                0x0,
                Math["PI"] * 0x2
              ),
              rE[xw(0x869)]();
          }
        }
        [ut(0x3cc)](rE) {
          const xx = ut;
          rE[xx(0x2db)](this[xx(0x31a)] / 0x46),
            rE[xx(0x235)](-Math["PI"] / 0x2);
          const rF = pN / 0xc8;
          (rE[xx(0x4e5)] = 0x14),
            (rE[xx(0xbdd)] = xx(0x78a)),
            (rE[xx(0x452)] = rE[xx(0x401)] = xx(0xa7d)),
            (rE[xx(0x74b)] = this[xx(0x30d)](xx(0x203)));
          if (!![]) {
            this[xx(0x2fa)](rE);
            return;
          }
          const rG = 0x2;
          for (let rH = 0x1; rH <= rG; rH++) {
            rE[xx(0x94d)]();
            let rI = 0x1 - rH / rG;
            (rI *= 0x1 + Math[xx(0xc44)](rF + rH) * 0.5),
              (rI = 0x1 + rI * 0.5),
              (rE[xx(0x557)] *= Math[xx(0xe12)](rH / rG, 0x2)),
              rE[xx(0x1f7)](rI, rI),
              rH !== rG &&
                ((rE[xx(0x557)] *= 0.7),
                (rE[xx(0xd52)] = xx(0x5cf)),
                (rE[xx(0xa93)] = xx(0x54f))),
              this[xx(0x2fa)](rE),
              rE[xx(0xbad)]();
          }
        }
        [ut(0x7f6)](rE, rF = 0xbe) {
          const xy = ut;
          rE[xy(0x94d)](),
            rE[xy(0x4cc)](),
            rE[xy(0x7eb)](0x0, -0x46 + rF + 0x1e),
            rE[xy(0xa16)](0x1a, -0x46 + rF),
            rE[xy(0xa16)](0xd, -0x46),
            rE[xy(0xa16)](-0xd, -0x46),
            rE[xy(0xa16)](-0x1a, -0x46 + rF),
            rE[xy(0xa16)](0x0, -0x46 + rF + 0x1e),
            rE[xy(0x8da)](),
            rE[xy(0x869)](),
            rE[xy(0x873)](),
            rE[xy(0xbad)](),
            rE[xy(0x94d)](),
            rE[xy(0x4cc)](),
            rE[xy(0x7eb)](-0x12, -0x46),
            rE[xy(0xe29)](-0x5, -0x50, -0xa, -0x69),
            rE[xy(0xa56)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rE[xy(0xe29)](0x5, -0x50, 0x12, -0x46),
            rE[xy(0xe29)](0x0, -0x3c, -0x12, -0x46),
            rE[xy(0x7b7)](),
            this[xy(0xa6b)]
              ? ((rE[xy(0x74b)] = this[xy(0x30d)](xy(0x5ea))),
                (rE[xy(0xbdd)] = this[xy(0x30d)](xy(0x6e7))))
              : (rE[xy(0xbdd)] = this[xy(0x30d)](xy(0x43c))),
            rE[xy(0x869)](),
            (rE[xy(0x4e5)] = 0xa),
            rE[xy(0x873)](),
            rE[xy(0xbad)]();
        }
        [ut(0x2fa)](rE) {
          const xz = ut;
          rE[xz(0x94d)](), rE[xz(0x4cc)]();
          for (let rF = 0x0; rF < 0x2; rF++) {
            rE[xz(0x7eb)](0x14, -0x1e),
              rE[xz(0xe29)](0x5a, -0xa, 0x32, -0x32),
              rE[xz(0xa16)](0xa0, -0x32),
              rE[xz(0xe29)](0x8c, 0x3c, 0x14, 0x0),
              rE[xz(0x1f7)](-0x1, 0x1);
          }
          rE[xz(0x8da)](),
            rE[xz(0x869)](),
            rE[xz(0x873)](),
            rE[xz(0xbad)](),
            this[xz(0x7f6)](rE),
            rE[xz(0x94d)](),
            rE[xz(0x4cc)](),
            rE[xz(0xc20)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rE[xz(0xa16)](-0x32, 0x1e),
            rE[xz(0xa16)](-0x1e, 0x1e),
            rE[xz(0xa16)](-0x1f, 0x32),
            rE[xz(0xa16)](0x1f, 0x32),
            rE[xz(0xa16)](0x1e, 0x1e),
            rE[xz(0xa16)](0x32, 0x1e),
            rE[xz(0xa16)](0x32, 0x0),
            rE[xz(0x869)](),
            rE[xz(0x8da)](),
            rE[xz(0x873)](),
            rE[xz(0x4cc)](),
            rE[xz(0x428)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rE[xz(0x428)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rE[xz(0x74b)] = rE[xz(0xbdd)]),
            rE[xz(0x869)](),
            rE[xz(0xbad)]();
        }
        [ut(0xdcb)](rE) {
          const xA = ut;
          rE[xA(0x2db)](this[xA(0x31a)] / 0x64), (rE[xA(0xbdd)] = xA(0x525));
          const rF = this[xA(0x30d)](xA(0x4c8)),
            rG = this[xA(0x30d)](xA(0x47b));
          (this[xA(0x9f2)] += (pO / 0x12c) * (this[xA(0xddb)] ? 0x1 : -0x1)),
            (this[xA(0x9f2)] = Math[xA(0xc36)](
              0x1,
              Math[xA(0x49f)](0x0, this[xA(0x9f2)])
            ));
          const rH = this[xA(0xcd1)] ? 0x1 : this[xA(0x9f2)],
            rI = 0x1 - rH;
          rE[xA(0x94d)](),
            rE[xA(0x4cc)](),
            rE[xA(0xa21)](
              (0x30 +
                (Math[xA(0xc44)](this[xA(0xa59)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rH +
                (0x1 - rH) * -0x14,
              0x0
            ),
            rE[xA(0x1f7)](1.1, 1.1),
            rE[xA(0x7eb)](0x0, -0xa),
            rE[xA(0xa56)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rE[xA(0x74b)] = rG),
            rE[xA(0x869)](),
            (rE[xA(0x401)] = xA(0xa7d)),
            (rE[xA(0x4e5)] = 0x1c),
            rE[xA(0x8da)](),
            rE[xA(0x873)](),
            rE[xA(0xbad)]();
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            const rK = Math[xA(0xc44)](this[xA(0xa59)] * 0x1);
            rE[xA(0x94d)]();
            const rL = rJ * 0x2 - 0x1;
            rE[xA(0x1f7)](0x1, rL),
              rE[xA(0xa21)](0x32 * rH - rI * 0xa, 0x50 * rH),
              rE[xA(0x235)](rK * 0.2 + 0.3 - rI * 0x1),
              rE[xA(0x4cc)](),
              rE[xA(0x7eb)](0xa, -0xa),
              rE[xA(0xe29)](0x1e, 0x28, -0x14, 0x50),
              rE[xA(0xe29)](0xa, 0x1e, -0xf, 0x0),
              (rE[xA(0xbdd)] = rF),
              (rE[xA(0x4e5)] = 0x2c),
              (rE[xA(0x452)] = rE[xA(0x401)] = xA(0xa7d)),
              rE[xA(0x873)](),
              (rE[xA(0x4e5)] -= 0x1c),
              (rE[xA(0x74b)] = rE[xA(0xbdd)] = rG),
              rE[xA(0x869)](),
              rE[xA(0x873)](),
              rE[xA(0xbad)]();
          }
          for (let rM = 0x0; rM < 0x2; rM++) {
            const rN = Math[xA(0xc44)](this[xA(0xa59)] * 0x1 + 0x1);
            rE[xA(0x94d)]();
            const rO = rM * 0x2 - 0x1;
            rE[xA(0x1f7)](0x1, rO),
              rE[xA(0xa21)](-0x41 * rH, 0x32 * rH),
              rE[xA(0x235)](rN * 0.3 + 1.3),
              rE[xA(0x4cc)](),
              rE[xA(0x7eb)](0xc, -0x5),
              rE[xA(0xe29)](0x28, 0x1e, 0x0, 0x3c),
              rE[xA(0xe29)](0x14, 0x1e, 0x0, 0x0),
              (rE[xA(0xbdd)] = rF),
              (rE[xA(0x4e5)] = 0x2c),
              (rE[xA(0x452)] = rE[xA(0x401)] = xA(0xa7d)),
              rE[xA(0x873)](),
              (rE[xA(0x4e5)] -= 0x1c),
              (rE[xA(0x74b)] = rE[xA(0xbdd)] = rG),
              rE[xA(0x873)](),
              rE[xA(0x869)](),
              rE[xA(0xbad)]();
          }
          this[xA(0xb76)](rE);
        }
        [ut(0xb76)](rE, rF = 0x1) {
          const xB = ut;
          rE[xB(0x4cc)](),
            rE[xB(0xc20)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rE[xB(0xbdd)] = xB(0x525)),
            (rE[xB(0x74b)] = this[xB(0x30d)](xB(0x8d4))),
            rE[xB(0x869)](),
            (rE[xB(0x4e5)] = 0x1e * rF),
            rE[xB(0x94d)](),
            rE[xB(0x8da)](),
            rE[xB(0x873)](),
            rE[xB(0xbad)](),
            rE[xB(0x94d)](),
            rE[xB(0x4cc)](),
            rE[xB(0xc20)](
              0x0,
              0x0,
              0x64 - rE[xB(0x4e5)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rE[xB(0x8da)](),
            rE[xB(0x4cc)]();
          for (let rG = 0x0; rG < 0x6; rG++) {
            const rH = (rG / 0x6) * Math["PI"] * 0x2;
            rE[xB(0xa16)](
              Math[xB(0x77b)](rH) * 0x28,
              Math[xB(0xc44)](rH) * 0x28
            );
          }
          rE[xB(0x7b7)]();
          for (let rI = 0x0; rI < 0x6; rI++) {
            const rJ = (rI / 0x6) * Math["PI"] * 0x2,
              rK = Math[xB(0x77b)](rJ) * 0x28,
              rL = Math[xB(0xc44)](rJ) * 0x28;
            rE[xB(0x7eb)](rK, rL), rE[xB(0xa16)](rK * 0x3, rL * 0x3);
          }
          (rE[xB(0x4e5)] = 0x10 * rF),
            (rE[xB(0x452)] = rE[xB(0x401)] = xB(0xa7d)),
            rE[xB(0x873)](),
            rE[xB(0xbad)]();
        }
        [ut(0x329)](rE) {
          const xC = ut;
          rE[xC(0x2db)](this[xC(0x31a)] / 0x82);
          let rF, rG;
          const rH = 0x2d,
            rI = lp(
              this[xC(0x531)] ||
                (this[xC(0x531)] = this[xC(0xcd1)]
                  ? 0x28
                  : Math[xC(0xb69)]() * 0x3e8)
            );
          let rJ = rI() * 6.28;
          const rK = Date[xC(0x8ea)]() / 0xc8,
            rL = [xC(0x4ea), xC(0x9e4)][xC(0x86a)]((rM) => this[xC(0x30d)](rM));
          for (let rM = 0x0; rM <= rH; rM++) {
            (rM % 0x5 === 0x0 || rM === rH) &&
              (rM > 0x0 &&
                ((rE[xC(0x4e5)] = 0x19),
                (rE[xC(0x401)] = rE[xC(0x452)] = xC(0xa7d)),
                (rE[xC(0xbdd)] = rL[0x1]),
                rE[xC(0x873)](),
                (rE[xC(0x4e5)] = 0xc),
                (rE[xC(0xbdd)] = rL[0x0]),
                rE[xC(0x873)]()),
              rM !== rH && (rE[xC(0x4cc)](), rE[xC(0x7eb)](rF, rG)));
            let rN = rM / 0x32;
            (rN *= rN), (rJ += (0.3 + rI() * 0.8) * 0x3);
            const rO = 0x14 + Math[xC(0xc44)](rN * 3.14) * 0x6e,
              rP = Math[xC(0xc44)](rM + rK) * 0.5,
              rQ = Math[xC(0x77b)](rJ + rP) * rO,
              rR = Math[xC(0xc44)](rJ + rP) * rO,
              rS = rQ - rF,
              rT = rR - rG;
            rE[xC(0xe29)]((rF + rQ) / 0x2 + rT, (rG + rR) / 0x2 - rS, rQ, rR),
              (rF = rQ),
              (rG = rR);
          }
        }
        [ut(0xcdb)](rE) {
          const xD = ut;
          rE[xD(0x2db)](this[xD(0x31a)] / 0x6e),
            (rE[xD(0xbdd)] = xD(0x525)),
            (rE[xD(0x4e5)] = 0x1c),
            rE[xD(0x4cc)](),
            rE[xD(0xc20)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rE[xD(0x74b)] = this[xD(0x30d)](xD(0x901))),
            rE[xD(0x869)](),
            rE[xD(0x94d)](),
            rE[xD(0x8da)](),
            rE[xD(0x873)](),
            rE[xD(0xbad)](),
            rE[xD(0x4cc)](),
            rE[xD(0xc20)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rE[xD(0x74b)] = xD(0x8bb)),
            rE[xD(0x869)](),
            rE[xD(0x94d)](),
            rE[xD(0x8da)](),
            rE[xD(0x873)](),
            rE[xD(0xbad)]();
          const rF = lp(
              this[xD(0x429)] ||
                (this[xD(0x429)] = this[xD(0xcd1)]
                  ? 0x1e
                  : Math[xD(0xb69)]() * 0x3e8)
            ),
            rG = this[xD(0x30d)](xD(0x2de)),
            rH = this[xD(0x30d)](xD(0x4f9));
          for (let rK = 0x0; rK < 0x3; rK++) {
            rE[xD(0x4cc)]();
            const rL = 0xc;
            for (let rM = 0x0; rM < rL; rM++) {
              const rN = (Math["PI"] * 0x2 * rM) / rL;
              rE[xD(0x94d)](),
                rE[xD(0x235)](rN + rF() * 0.4),
                rE[xD(0xa21)](0x3c + rF() * 0xa, 0x0),
                rE[xD(0x7eb)](rF() * 0x5, rF() * 0x5),
                rE[xD(0xa56)](
                  0x14 + rF() * 0xa,
                  rF() * 0x14,
                  0x28 + rF() * 0x14,
                  rF() * 0x1e + 0xa,
                  0x3c + rF() * 0xa,
                  rF() * 0xa + 0xa
                ),
                rE[xD(0xbad)]();
            }
            (rE[xD(0x452)] = rE[xD(0x401)] = xD(0xa7d)),
              (rE[xD(0x4e5)] = 0x12 - rK * 0x2),
              (rE[xD(0xbdd)] = rG),
              rE[xD(0x873)](),
              (rE[xD(0x4e5)] -= 0x8),
              (rE[xD(0xbdd)] = rH),
              rE[xD(0x873)]();
          }
          const rI = 0x28;
          rE[xD(0x235)](-this[xD(0x9d6)]),
            (rE[xD(0x74b)] = this[xD(0x30d)](xD(0xefa))),
            (rE[xD(0xbdd)] = this[xD(0x30d)](xD(0xa13))),
            (rE[xD(0x4e5)] = 0x9);
          const rJ = this[xD(0x663)] * 0x6;
          for (let rO = 0x0; rO < rJ; rO++) {
            const rP = ((rO - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rE[xD(0x4cc)](),
              rE[xD(0x428)](
                Math[xD(0x77b)](rP) * rI,
                Math[xD(0xc44)](rP) * rI * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rE[xD(0x869)](),
              rE[xD(0x873)]();
          }
        }
        [ut(0xe75)](rE) {
          const xE = ut;
          rE[xE(0x235)](-this[xE(0x9d6)]),
            rE[xE(0x2db)](this[xE(0x31a)] / 0x3c),
            (rE[xE(0x452)] = rE[xE(0x401)] = xE(0xa7d));
          let rF =
            Math[xE(0xc44)](Date[xE(0x8ea)]() / 0x12c + this[xE(0xa59)] * 0.5) *
              0.5 +
            0.5;
          (rF *= 1.5),
            rE[xE(0x4cc)](),
            rE[xE(0x7eb)](-0x32, -0x32 - rF * 0x3),
            rE[xE(0xe29)](0x0, -0x3c, 0x32, -0x32 - rF * 0x3),
            rE[xE(0xe29)](0x50 - rF * 0x3, -0xa, 0x50, 0x32),
            rE[xE(0xe29)](0x46, 0x4b, 0x28, 0x4e + rF * 0x5),
            rE[xE(0xa16)](0x1e, 0x3c + rF * 0x5),
            rE[xE(0xe29)](0x2d, 0x37, 0x32, 0x2d),
            rE[xE(0xe29)](0x0, 0x41, -0x32, 0x32),
            rE[xE(0xe29)](-0x2d, 0x37, -0x1e, 0x3c + rF * 0x3),
            rE[xE(0xa16)](-0x28, 0x4e + rF * 0x5),
            rE[xE(0xe29)](-0x46, 0x4b, -0x50, 0x32),
            rE[xE(0xe29)](-0x50 + rF * 0x3, -0xa, -0x32, -0x32 - rF * 0x3),
            (rE[xE(0x74b)] = this[xE(0x30d)](xE(0x78f))),
            rE[xE(0x869)](),
            (rE[xE(0xbdd)] = xE(0x525)),
            rE[xE(0x94d)](),
            rE[xE(0x8da)](),
            (rE[xE(0x4e5)] = 0xe),
            rE[xE(0x873)](),
            rE[xE(0xbad)]();
          for (let rG = 0x0; rG < 0x2; rG++) {
            rE[xE(0x94d)](),
              rE[xE(0x1f7)](rG * 0x2 - 0x1, 0x1),
              rE[xE(0xa21)](-0x22, -0x18 - rF * 0x3),
              rE[xE(0x235)](-0.6),
              rE[xE(0x1f7)](1.3, 1.3),
              rE[xE(0x4cc)](),
              rE[xE(0x7eb)](-0x14, 0x0),
              rE[xE(0xe29)](-0x14, -0x19, 0x0, -0x28),
              rE[xE(0xe29)](0x14, -0x19, 0x14, 0x0),
              rE[xE(0x869)](),
              rE[xE(0x8da)](),
              (rE[xE(0x4e5)] = 0xd),
              rE[xE(0x873)](),
              rE[xE(0xbad)]();
          }
          rE[xE(0x94d)](),
            rE[xE(0x4cc)](),
            rE[xE(0x428)](
              0x0,
              0x1e,
              0x24 - rF * 0x2,
              0x8 - rF,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rE[xE(0x74b)] = this[xE(0x30d)](xE(0x41b))),
            (rE[xE(0x557)] *= 0.2),
            rE[xE(0x869)](),
            rE[xE(0xbad)](),
            (rE[xE(0x74b)] = rE[xE(0xbdd)] = this[xE(0x30d)](xE(0x41e)));
          for (let rH = 0x0; rH < 0x2; rH++) {
            rE[xE(0x94d)](),
              rE[xE(0x1f7)](rH * 0x2 - 0x1, 0x1),
              rE[xE(0xa21)](0x19 - rF * 0x1, 0xf - rF * 0x3),
              rE[xE(0x235)](-0.3),
              rE[xE(0x4cc)](),
              rE[xE(0xc20)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rE[xE(0x869)](),
              rE[xE(0xbad)]();
          }
          rE[xE(0x94d)](),
            (rE[xE(0x4e5)] = 0x5),
            rE[xE(0xa21)](0x0, 0x21 - rF * 0x1),
            rE[xE(0x4cc)](),
            rE[xE(0x7eb)](-0xc, 0x0),
            rE[xE(0xa56)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rE[xE(0xa56)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rE[xE(0x873)](),
            rE[xE(0xbad)]();
        }
        [ut(0xbcc)](rE) {
          const xF = ut;
          rE[xF(0x2db)](this[xF(0x31a)] / 0x3c),
            rE[xF(0x235)](-Math["PI"] / 0x2),
            rE[xF(0x4cc)](),
            rE[xF(0x7eb)](0x32, 0x50),
            rE[xF(0xe29)](0x1e, 0x1e, 0x32, -0x14),
            rE[xF(0xe29)](0x5a, -0x64, 0x0, -0x64),
            rE[xF(0xe29)](-0x5a, -0x64, -0x32, -0x14),
            rE[xF(0xe29)](-0x1e, 0x1e, -0x32, 0x50),
            (rE[xF(0x74b)] = this[xF(0x30d)](xF(0x97c))),
            rE[xF(0x869)](),
            (rE[xF(0x401)] = rE[xF(0x452)] = xF(0xa7d)),
            (rE[xF(0x4e5)] = 0x14),
            rE[xF(0x8da)](),
            (rE[xF(0xbdd)] = xF(0x525)),
            rE[xF(0x873)](),
            (rE[xF(0x74b)] = this[xF(0x30d)](xF(0xa4a)));
          const rF = 0x6;
          rE[xF(0x4cc)](), rE[xF(0x7eb)](-0x32, 0x50);
          for (let rG = 0x0; rG < rF; rG++) {
            const rH = (((rG + 0.5) / rF) * 0x2 - 0x1) * 0x32,
              rI = (((rG + 0x1) / rF) * 0x2 - 0x1) * 0x32;
            rE[xF(0xe29)](rH, 0x1e, rI, 0x50);
          }
          (rE[xF(0x4e5)] = 0x8),
            rE[xF(0x869)](),
            rE[xF(0x873)](),
            (rE[xF(0xbdd)] = rE[xF(0x74b)] = xF(0x525)),
            rE[xF(0x94d)](),
            rE[xF(0xa21)](0x0, -0x5),
            rE[xF(0x4cc)](),
            rE[xF(0x7eb)](0x0, 0x0),
            rE[xF(0xa56)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rE[xF(0x873)](),
            rE[xF(0xbad)]();
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            rE[xF(0x94d)](),
              rE[xF(0x1f7)](rJ * 0x2 - 0x1, 0x1),
              rE[xF(0xa21)](0x19, -0x38),
              rE[xF(0x4cc)](),
              rE[xF(0xc20)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rE[xF(0x8da)](),
              (rE[xF(0x4e5)] = 0xf),
              rE[xF(0x873)](),
              rE[xF(0x869)](),
              rE[xF(0xbad)]();
          }
        }
        [ut(0x218)](rE) {
          const xG = ut;
          rE[xG(0x2db)](this[xG(0x31a)] / 0x32),
            (rE[xG(0xbdd)] = xG(0x525)),
            (rE[xG(0x4e5)] = 0x10);
          const rF = 0x7;
          rE[xG(0x4cc)]();
          const rG = 0x12;
          rE[xG(0x74b)] = this[xG(0x30d)](xG(0x71d));
          const rH = Math[xG(0xc44)](pN / 0x258);
          for (let rI = 0x0; rI < 0x2; rI++) {
            const rJ = 1.2 - rI * 0.2;
            for (let rK = 0x0; rK < rF; rK++) {
              rE[xG(0x94d)](),
                rE[xG(0x235)](
                  (rK / rF) * Math["PI"] * 0x2 + (rI / rF) * Math["PI"]
                ),
                rE[xG(0xa21)](0x2e, 0x0),
                rE[xG(0x1f7)](rJ, rJ);
              const rL = Math[xG(0xc44)](rH + rK * 0.05 * (0x1 - rI * 0.5));
              rE[xG(0x4cc)](),
                rE[xG(0x7eb)](0x0, rG),
                rE[xG(0xe29)](0x14, rG, 0x28 + rL, 0x0 + rL * 0x5),
                rE[xG(0xe29)](0x14, -rG, 0x0, -rG),
                rE[xG(0x869)](),
                rE[xG(0x8da)](),
                rE[xG(0x873)](),
                rE[xG(0xbad)]();
            }
          }
          rE[xG(0x4cc)](),
            rE[xG(0xc20)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rE[xG(0x74b)] = this[xG(0x30d)](xG(0x5ff))),
            rE[xG(0x869)](),
            rE[xG(0x8da)](),
            (rE[xG(0x4e5)] = 0x19),
            rE[xG(0x873)]();
        }
        [ut(0xe55)](rE) {
          const xH = ut;
          rE[xH(0x2db)](this[xH(0x31a)] / 0x28);
          let rF = this[xH(0xa59)];
          const rG = this[xH(0xcd1)] ? 0x0 : Math[xH(0xc44)](pN / 0x64) * 0xf;
          (rE[xH(0x452)] = rE[xH(0x401)] = xH(0xa7d)),
            rE[xH(0x4cc)](),
            rE[xH(0x94d)]();
          const rH = 0x3;
          for (let rI = 0x0; rI < 0x2; rI++) {
            const rJ = rI === 0x0 ? 0x1 : -0x1;
            for (let rK = 0x0; rK <= rH; rK++) {
              rE[xH(0x94d)](), rE[xH(0x7eb)](0x0, 0x0);
              const rL = Math[xH(0xc44)](rF + rK + rI);
              rE[xH(0x235)](((rK / rH) * 0x2 - 0x1) * 0.6 + 1.4 + rL * 0.15),
                rE[xH(0xa16)](0x2d + rJ * rG, 0x0),
                rE[xH(0x235)](0.2 + (rL * 0.5 + 0.5) * 0.1),
                rE[xH(0xa16)](0x4b, 0x0),
                rE[xH(0xbad)]();
            }
            rE[xH(0x1f7)](0x1, -0x1);
          }
          rE[xH(0xbad)](),
            (rE[xH(0x4e5)] = 0x8),
            (rE[xH(0xbdd)] = this[xH(0x30d)](xH(0x8b3))),
            rE[xH(0x873)](),
            rE[xH(0x94d)](),
            rE[xH(0xa21)](0x0, rG),
            this[xH(0x83f)](rE),
            rE[xH(0xbad)]();
        }
        [ut(0x83f)](rE, rF = ![]) {
          const xI = ut;
          (rE[xI(0x452)] = rE[xI(0x401)] = xI(0xa7d)),
            rE[xI(0x235)](-0.15),
            rE[xI(0x4cc)](),
            rE[xI(0x7eb)](-0x32, 0x0),
            rE[xI(0xa16)](0x28, 0x0),
            rE[xI(0x7eb)](0xf, 0x0),
            rE[xI(0xa16)](-0x5, 0x19),
            rE[xI(0x7eb)](-0x3, 0x0),
            rE[xI(0xa16)](0xc, -0x14),
            rE[xI(0x7eb)](-0xe, -0x5),
            rE[xI(0xa16)](-0x2e, -0x17),
            (rE[xI(0x4e5)] = 0x1c),
            (rE[xI(0xbdd)] = this[xI(0x30d)](xI(0xaea))),
            rE[xI(0x873)](),
            (rE[xI(0xbdd)] = this[xI(0x30d)](xI(0x855))),
            (rE[xI(0x4e5)] -= rF ? 0xf : 0xa),
            rE[xI(0x873)]();
        }
        [ut(0x685)](rE) {
          const xJ = ut;
          rE[xJ(0x2db)](this[xJ(0x31a)] / 0x64),
            rE[xJ(0x4cc)](),
            rE[xJ(0xc20)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rE[xJ(0x74b)] = this[xJ(0x30d)](xJ(0x7cd))),
            rE[xJ(0x869)](),
            rE[xJ(0x8da)](),
            (rE[xJ(0x4e5)] = this[xJ(0xa6b)] ? 0x32 : 0x1e),
            (rE[xJ(0xbdd)] = xJ(0x525)),
            rE[xJ(0x873)]();
          if (!this[xJ(0x96d)]) {
            const rF = new Path2D(),
              rG = this[xJ(0xa6b)] ? 0x2 : 0x3;
            for (let rH = 0x0; rH <= rG; rH++) {
              for (let rI = 0x0; rI <= rG; rI++) {
                const rJ =
                    ((rI / rG + Math[xJ(0xb69)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rH % 0x2 === 0x0 ? -0x14 : 0x0),
                  rK = ((rH / rG + Math[xJ(0xb69)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rL = Math[xJ(0xb69)]() * 0xd + (this[xJ(0xa6b)] ? 0xe : 0x7);
                rF[xJ(0x7eb)](rJ, rK),
                  rF[xJ(0xc20)](rJ, rK, rL, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xJ(0x96d)] = rF;
          }
          rE[xJ(0x4cc)](),
            rE[xJ(0xc20)](
              0x0,
              0x0,
              0x64 - rE[xJ(0x4e5)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rE[xJ(0x8da)](),
            (rE[xJ(0x74b)] = xJ(0xf00)),
            rE[xJ(0x869)](this[xJ(0x96d)]);
        }
        [ut(0x21c)](rE) {
          const xK = ut;
          rE[xK(0x2db)](this[xK(0x31a)] / 0x64),
            rE[xK(0x94d)](),
            rE[xK(0xa21)](-0xf5, -0xdc),
            (rE[xK(0xbdd)] = this[xK(0x30d)](xK(0xac8))),
            (rE[xK(0x74b)] = this[xK(0x30d)](xK(0xcfb))),
            (rE[xK(0x4e5)] = 0xf),
            (rE[xK(0x401)] = rE[xK(0x452)] = xK(0xa7d));
          const rF = !this[xK(0xa6b)];
          if (rF) {
            rE[xK(0x94d)](),
              rE[xK(0xa21)](0x10e, 0xde),
              rE[xK(0x94d)](),
              rE[xK(0x235)](-0.1);
            for (let rG = 0x0; rG < 0x3; rG++) {
              rE[xK(0x4cc)](),
                rE[xK(0x7eb)](-0x5, 0x0),
                rE[xK(0xe29)](0x0, 0x28, 0x5, 0x0),
                rE[xK(0x873)](),
                rE[xK(0x869)](),
                rE[xK(0xa21)](0x28, 0x0);
            }
            rE[xK(0xbad)](), rE[xK(0xa21)](0x17, 0x32), rE[xK(0x235)](0.05);
            for (let rH = 0x0; rH < 0x2; rH++) {
              rE[xK(0x4cc)](),
                rE[xK(0x7eb)](-0x5, 0x0),
                rE[xK(0xe29)](0x0, -0x28, 0x5, 0x0),
                rE[xK(0x873)](),
                rE[xK(0x869)](),
                rE[xK(0xa21)](0x28, 0x0);
            }
            rE[xK(0xbad)]();
          }
          rE[xK(0x869)](lm),
            rE[xK(0x873)](lm),
            rE[xK(0x869)](ln),
            rE[xK(0x873)](ln),
            rE[xK(0xbad)](),
            rF &&
              (rE[xK(0x4cc)](),
              rE[xK(0xc20)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rE[xK(0xc20)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rE[xK(0x74b)] = xK(0x525)),
              rE[xK(0x869)]());
        }
        [ut(0x922)](rE) {
          const xL = ut;
          rE[xL(0x2db)](this[xL(0x31a)] / 0x46), rE[xL(0x94d)]();
          !this[xL(0xa6b)] && rE[xL(0x235)](Math["PI"] / 0x2);
          rE[xL(0xa21)](0x0, 0x2d),
            rE[xL(0x4cc)](),
            rE[xL(0x7eb)](0x0, -0x64),
            rE[xL(0xa56)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rE[xL(0xa56)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rE[xL(0x452)] = rE[xL(0x401)] = xL(0xa7d)),
            (rE[xL(0x4e5)] = 0x3c),
            (rE[xL(0xbdd)] = this[xL(0x30d)](xL(0x250))),
            rE[xL(0x873)](),
            (rE[xL(0x4e5)] -= this[xL(0xa6b)] ? 0x23 : 0x14),
            (rE[xL(0x74b)] = rE[xL(0xbdd)] = this[xL(0x30d)](xL(0x2cb))),
            rE[xL(0x873)](),
            (rE[xL(0x4e5)] -= this[xL(0xa6b)] ? 0x16 : 0xf),
            (rE[xL(0x74b)] = rE[xL(0xbdd)] = this[xL(0x30d)](xL(0x461))),
            rE[xL(0x873)](),
            rE[xL(0x869)](),
            rE[xL(0xa21)](0x0, -0x24);
          if (this[xL(0xa6b)]) rE[xL(0x2db)](0.9);
          rE[xL(0x4cc)](),
            rE[xL(0x428)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rE[xL(0x74b)] = this[xL(0x30d)](xL(0x590))),
            rE[xL(0x869)](),
            rE[xL(0x8da)](),
            (rE[xL(0x4e5)] = 0xd),
            (rE[xL(0xbdd)] = xL(0x525)),
            rE[xL(0x873)](),
            rE[xL(0x4cc)](),
            rE[xL(0x428)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rE[xL(0x74b)] = xL(0xe46)),
            rE[xL(0x869)](),
            rE[xL(0xbad)]();
        }
        [ut(0x20e)](rE) {
          const xM = ut;
          rE[xM(0x2db)](this[xM(0x31a)] / 0x19);
          !this[xM(0xcd1)] &&
            this[xM(0xa6b)] &&
            rE[xM(0x235)](Math[xM(0xc44)](pN / 0x64 + this["id"]) * 0.15);
          rE[xM(0x4cc)](),
            rE[xM(0x2ed)](-0x16, -0x16, 0x2c, 0x2c),
            (rE[xM(0x74b)] = this[xM(0x30d)](xM(0xedf))),
            rE[xM(0x869)](),
            (rE[xM(0x4e5)] = 0x6),
            (rE[xM(0x401)] = xM(0xa7d)),
            (rE[xM(0xbdd)] = this[xM(0x30d)](xM(0xcfb))),
            rE[xM(0x873)](),
            rE[xM(0x4cc)]();
          const rF = this[xM(0xcd1)] ? 0x1 : 0x1 - Math[xM(0xc44)](pN / 0x1f4),
            rG = rK(0x0, 0.25),
            rH = 0x1 - rK(0.25, 0.25),
            rI = rK(0.5, 0.25),
            rJ = rK(0.75, 0.25);
          function rK(rL, rM) {
            const xN = xM;
            return Math[xN(0xc36)](0x1, Math[xN(0x49f)](0x0, (rF - rL) / rM));
          }
          rE[xM(0x235)]((rH * Math["PI"]) / 0x4);
          for (let rL = 0x0; rL < 0x2; rL++) {
            const rM = (rL * 0x2 - 0x1) * 0x7 * rJ;
            for (let rN = 0x0; rN < 0x3; rN++) {
              let rO = rG * (-0xb + rN * 0xb);
              rE[xM(0x7eb)](rO, rM),
                rE[xM(0xc20)](rO, rM, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rE[xM(0x74b)] = this[xM(0x30d)](xM(0x958))), rE[xM(0x869)]();
        }
        [ut(0x4a7)](rE) {
          const xO = ut;
          rE[xO(0x94d)](),
            rE[xO(0xa21)](this["x"], this["y"]),
            this[xO(0x586)](rE),
            rE[xO(0x235)](this[xO(0x9d6)]),
            (rE[xO(0x4e5)] = 0x8);
          const rF = (rK, rL) => {
              const xP = xO;
              (rH = this[xP(0x31a)] / 0x14),
                rE[xP(0x1f7)](rH, rH),
                rE[xP(0x4cc)](),
                rE[xP(0xc20)](0x0, 0x0, 0x14, 0x0, l0),
                (rE[xP(0x74b)] = this[xP(0x30d)](rK)),
                rE[xP(0x869)](),
                (rE[xP(0xbdd)] = this[xP(0x30d)](rL)),
                rE[xP(0x873)]();
            },
            rG = (rK, rL, rM) => {
              const xQ = xO;
              (rK = l8[rK]),
                rE[xQ(0x1f7)](this[xQ(0x31a)], this[xQ(0x31a)]),
                (rE[xQ(0x4e5)] /= this[xQ(0x31a)]),
                (rE[xQ(0xbdd)] = this[xQ(0x30d)](rM)),
                rE[xQ(0x873)](rK),
                (rE[xQ(0x74b)] = this[xQ(0x30d)](rL)),
                rE[xQ(0x869)](rK);
            };
          let rH, rI, rJ;
          switch (this[xO(0x8ca)]) {
            case cS[xO(0x20e)]:
            case cS[xO(0xc2e)]:
              this[xO(0x20e)](rE);
              break;
            case cS[xO(0x922)]:
            case cS[xO(0x468)]:
              this[xO(0x922)](rE);
              break;
            case cS[xO(0x4bc)]:
              (rE[xO(0xbdd)] = xO(0x525)),
                (rE[xO(0x4e5)] = 0x14),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0x203))),
                rE[xO(0xa21)](-this[xO(0x31a)], 0x0),
                rE[xO(0x235)](-Math["PI"] / 0x2),
                rE[xO(0x2db)](0.5),
                rE[xO(0xa21)](0x0, 0x46),
                this[xO(0x7f6)](rE, this[xO(0x31a)] * 0x4);
              break;
            case cS[xO(0x3cc)]:
              this[xO(0x3cc)](rE);
              break;
            case cS[xO(0x49e)]:
              this[xO(0x21c)](rE);
              break;
            case cS[xO(0x21c)]:
              this[xO(0x21c)](rE);
              break;
            case cS[xO(0x685)]:
            case cS[xO(0x5f3)]:
              this[xO(0x685)](rE);
              break;
            case cS[xO(0xda8)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x1e), this[xO(0x83f)](rE, !![]);
              break;
            case cS[xO(0xe55)]:
              this[xO(0xe55)](rE);
              break;
            case cS[xO(0xafe)]:
              (rE[xO(0x4e5)] *= 0.7),
                rG(xO(0x350), xO(0x71d), xO(0x56f)),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0.6, 0x0, l0),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0x5ff))),
                rE[xO(0x869)](),
                rE[xO(0x8da)](),
                (rE[xO(0xbdd)] = xO(0xa6f)),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x218)]:
              this[xO(0x218)](rE);
              break;
            case cS[xO(0x552)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x16),
                rE[xO(0x235)](Math["PI"] / 0x2),
                rE[xO(0x4cc)]();
              for (let sw = 0x0; sw < 0x2; sw++) {
                rE[xO(0x7eb)](-0xa, -0x1e),
                  rE[xO(0xa56)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rE[xO(0x1f7)](0x1, -0x1);
              }
              (rE[xO(0x4e5)] = 0x10),
                (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xa5a))),
                rE[xO(0x873)](),
                (rE[xO(0x4e5)] -= 0x7),
                (rE[xO(0xbdd)] = xO(0x272)),
                rE[xO(0x873)]();
              break;
            case cS[xO(0xace)]:
              this[xO(0xbcc)](rE);
              break;
            case cS[xO(0x482)]:
              this[xO(0xe75)](rE);
              break;
            case cS[xO(0xcdb)]:
              this[xO(0xcdb)](rE);
              break;
            case cS[xO(0x329)]:
              this[xO(0x329)](rE);
              break;
            case cS[xO(0x6b9)]:
              !this[xO(0xd03)] &&
                ((this[xO(0xd03)] = new lT(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cY[xO(0x987)],
                  0x19
                )),
                (this[xO(0xd03)][xO(0xab6)] = !![]),
                (this[xO(0xd03)][xO(0x5e9)] = !![]),
                (this[xO(0xd03)][xO(0x6d8)] = 0x1),
                (this[xO(0xd03)][xO(0xaac)] = !![]),
                (this[xO(0xd03)][xO(0x486)] = xO(0x4a5)),
                (this[xO(0xd03)][xO(0x412)] = this[xO(0x412)]));
              rE[xO(0x235)](Math["PI"] / 0x2),
                (this[xO(0xd03)][xO(0x5e0)] = this[xO(0x5e0)]),
                (this[xO(0xd03)][xO(0x31a)] = this[xO(0x31a)]),
                this[xO(0xd03)][xO(0x4a7)](rE);
              break;
            case cS[xO(0xdcb)]:
              this[xO(0xdcb)](rE);
              break;
            case cS[xO(0x5b0)]:
              rE[xO(0x94d)](),
                rE[xO(0x2db)](this[xO(0x31a)] / 0x64),
                rE[xO(0x235)]((Date[xO(0x8ea)]() / 0x190) % 6.28),
                this[xO(0xb76)](rE, 1.5),
                rE[xO(0xbad)]();
              break;
            case cS[xO(0xd1e)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x14),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x0, -0x5),
                rE[xO(0xa16)](-0x8, 0x0),
                rE[xO(0xa16)](0x0, 0x5),
                rE[xO(0xa16)](0x8, 0x0),
                rE[xO(0x7b7)](),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x20),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x820))),
                rE[xO(0x873)](),
                (rE[xO(0x4e5)] = 0x14),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xd50))),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x215)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x14),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x5, -0x5),
                rE[xO(0xa16)](-0x5, 0x5),
                rE[xO(0xa16)](0x5, 0x0),
                rE[xO(0x7b7)](),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x20),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x316))),
                rE[xO(0x873)](),
                (rE[xO(0x4e5)] = 0x14),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x8e4))),
                rE[xO(0x873)]();
              break;
            case cS[xO(0xd78)]:
              this[xO(0x5f5)](rE, xO(0xe8b));
              break;
            case cS[xO(0x9f1)]:
              this[xO(0x5f5)](rE, xO(0xefc));
              break;
            case cS[xO(0xc91)]:
              this[xO(0x5f5)](rE, xO(0x4eb));
              break;
            case cS[xO(0xab2)]:
              this[xO(0xab2)](rE);
              break;
            case cS[xO(0xed9)]:
              this[xO(0xed9)](rE);
              break;
            case cS[xO(0xbcb)]:
              this[xO(0xbcb)](rE);
              break;
            case cS[xO(0xb8b)]:
              this[xO(0xbcb)](rE, !![]);
              break;
            case cS[xO(0x593)]:
              this[xO(0x593)](rE);
              break;
            case cS[xO(0xac0)]:
              this[xO(0xac0)](rE);
              break;
            case cS[xO(0xb8d)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x19),
                lE(rE, 0x19),
                (rE[xO(0x401)] = xO(0xa7d)),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xbe1))),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x836))),
                rE[xO(0x869)](),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x8df)]:
              rE[xO(0xa21)](-this[xO(0x31a)], 0x0);
              const rK = Date[xO(0x8ea)]() / 0x32,
                rL = this[xO(0x31a)] * 0x2;
              rE[xO(0x4cc)]();
              const rM = 0x32;
              for (let sx = 0x0; sx < rM; sx++) {
                const sy = sx / rM,
                  sz = sy * Math["PI"] * (this[xO(0xcd1)] ? 7.75 : 0xa) - rK,
                  sA = sy * rL,
                  sB = sA * this[xO(0x8a3)];
                rE[xO(0xa16)](sA, Math[xO(0xc44)](sz) * sB);
              }
              (rE[xO(0xbdd)] = xO(0x669)),
                (rE[xO(0x401)] = rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x4),
                (rE[xO(0x462)] = xO(0xde7)),
                (rE[xO(0x20d)] = this[xO(0xcd1)] ? 0xa : 0x14),
                rE[xO(0x873)](),
                rE[xO(0x873)](),
                rE[xO(0x873)]();
              break;
            case cS[xO(0xc01)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x37), this[xO(0x4c4)](rE);
              break;
            case cS[xO(0xe9d)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x14), rE[xO(0x4cc)]();
              for (let sC = 0x0; sC < 0x2; sC++) {
                rE[xO(0x7eb)](-0x17, -0x5),
                  rE[xO(0xe29)](0x0, 5.5, 0x17, -0x5),
                  rE[xO(0x1f7)](0x1, -0x1);
              }
              (rE[xO(0x4e5)] = 0xf),
                (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xcfb))),
                rE[xO(0x873)](),
                (rE[xO(0x4e5)] -= 0x6),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xedf))),
                rE[xO(0x873)]();
              break;
            case cS[xO(0xcb1)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x23),
                rE[xO(0x4cc)](),
                rE[xO(0x428)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xd5e))),
                rE[xO(0x869)](),
                rE[xO(0x8da)](),
                (rE[xO(0xbdd)] = xO(0x8bb)),
                (rE[xO(0x4e5)] = 0x12),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x1e, 0x0),
                rE[xO(0xa56)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rE[xO(0xa56)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rE[xO(0x4e5)] = 0x3),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                (rE[xO(0xbdd)] = rE[xO(0x74b)] = xO(0x7d7)),
                rE[xO(0x869)](),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x5b6)]:
              if (this[xO(0xf1d)] !== this[xO(0x25c)]) {
                this[xO(0xf1d)] = this[xO(0x25c)];
                const sD = new Path2D(),
                  sE = Math[xO(0xa7d)](
                    this[xO(0x25c)] * (this[xO(0x25c)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sF = (Math["PI"] * 0x2) / sE,
                  sG = this[xO(0x25c)] < 0x64 ? 0.3 : 0.1;
                for (let sH = 0x0; sH < sE; sH++) {
                  const sI = sH * sF,
                    sJ = sI + Math[xO(0xb69)]() * sF,
                    sK = 0x1 - Math[xO(0xb69)]() * sG;
                  sD[xO(0xa16)](
                    Math[xO(0x77b)](sJ) * this[xO(0x25c)] * sK,
                    Math[xO(0xc44)](sJ) * this[xO(0x25c)] * sK
                  );
                }
                sD[xO(0x7b7)](), (this[xO(0xe9e)] = sD);
              }
              (rH = this[xO(0x31a)] / this[xO(0x25c)]), rE[xO(0x1f7)](rH, rH);
              const rN = this[xO(0xaa4)] ? lh : [xO(0xa7e), xO(0xb19)];
              (rE[xO(0xbdd)] = this[xO(0x30d)](rN[0x1])),
                rE[xO(0x873)](this[xO(0xe9e)]),
                (rE[xO(0x74b)] = this[xO(0x30d)](rN[0x0])),
                rE[xO(0x869)](this[xO(0xe9e)]);
              break;
            case cS[xO(0x44f)]:
              if (this[xO(0xf1d)] !== this[xO(0x25c)]) {
                this[xO(0xf1d)] = this[xO(0x25c)];
                const sL = Math[xO(0xa7d)](
                    this[xO(0x25c)] > 0xc8
                      ? this[xO(0x25c)] * 0.18
                      : this[xO(0x25c)] * 0.25
                  ),
                  sM = 0.5,
                  sN = 0.85;
                this[xO(0xe9e)] = la(sL, this[xO(0x25c)], sM, sN);
                if (this[xO(0x25c)] < 0x12c) {
                  const sO = new Path2D(),
                    sP = sL * 0x2;
                  for (let sQ = 0x0; sQ < sP; sQ++) {
                    const sR = ((sQ + 0x1) / sP) * Math["PI"] * 0x2;
                    let sS = (sQ % 0x2 === 0x0 ? 0.7 : 1.2) * this[xO(0x25c)];
                    sO[xO(0xa16)](
                      Math[xO(0x77b)](sR) * sS,
                      Math[xO(0xc44)](sR) * sS
                    );
                  }
                  sO[xO(0x7b7)](), (this[xO(0x20f)] = sO);
                } else this[xO(0x20f)] = null;
              }
              (rH = this[xO(0x31a)] / this[xO(0x25c)]), rE[xO(0x1f7)](rH, rH);
              this[xO(0x20f)] &&
                ((rE[xO(0x74b)] = this[xO(0x30d)](xO(0xb2c))),
                rE[xO(0x869)](this[xO(0x20f)]));
              (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x955))),
                rE[xO(0x873)](this[xO(0xe9e)]),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0x45a))),
                rE[xO(0x869)](this[xO(0xe9e)]);
              break;
            case cS[xO(0x400)]:
              rE[xO(0x94d)](),
                (rH = this[xO(0x31a)] / 0x28),
                rE[xO(0x1f7)](rH, rH),
                (rE[xO(0x74b)] = rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d));
              for (let sT = 0x0; sT < 0x2; sT++) {
                const sU = sT === 0x0 ? 0x1 : -0x1;
                rE[xO(0x94d)](),
                  rE[xO(0xa21)](0x1c, sU * 0xd),
                  rE[xO(0x235)](
                    Math[xO(0xc44)](this[xO(0xa59)] * 1.24) * 0.1 * sU
                  ),
                  rE[xO(0x4cc)](),
                  rE[xO(0x7eb)](0x0, sU * 0x6),
                  rE[xO(0xa16)](0x14, sU * 0xb),
                  rE[xO(0xa16)](0x28, 0x0),
                  rE[xO(0xe29)](0x14, sU * 0x5, 0x0, 0x0),
                  rE[xO(0x7b7)](),
                  rE[xO(0x869)](),
                  rE[xO(0x873)](),
                  rE[xO(0xbad)]();
              }
              (rI = this[xO(0xaa4)] ? lh : [xO(0xd88), xO(0x947)]),
                (rE[xO(0x74b)] = this[xO(0x30d)](rI[0x0])),
                rE[xO(0x869)](l5),
                (rE[xO(0x4e5)] = 0x6),
                (rE[xO(0x74b)] = rE[xO(0xbdd)] = this[xO(0x30d)](rI[0x1])),
                rE[xO(0x873)](l5),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x15, 0x0),
                rE[xO(0xe29)](0x0, -0x3, 0x15, 0x0),
                (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x7),
                rE[xO(0x873)]();
              const rO = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rE[xO(0x4cc)]();
              for (let sV = 0x0; sV < 0x2; sV++) {
                const sW = sV === 0x1 ? 0x1 : -0x1;
                for (let sX = 0x0; sX < rO[xO(0xed7)]; sX++) {
                  let [sY, sZ] = rO[sX];
                  (sZ *= sW),
                    rE[xO(0x7eb)](sY, sZ),
                    rE[xO(0xc20)](sY, sZ, 0x5, 0x0, l0);
                }
              }
              rE[xO(0x869)](), rE[xO(0x869)](), rE[xO(0xbad)]();
              break;
            case cS[xO(0x710)]:
            case cS[xO(0xad2)]:
              rE[xO(0x94d)](),
                (rH = this[xO(0x31a)] / 0x28),
                rE[xO(0x1f7)](rH, rH);
              const rP = this[xO(0x8ca)] === cS[xO(0x710)];
              rP &&
                (rE[xO(0x94d)](),
                rE[xO(0xa21)](-0x2d, 0x0),
                rE[xO(0x235)](Math["PI"]),
                this[xO(0xbd6)](rE, 0xf / 1.1),
                rE[xO(0xbad)]());
              (rI = this[xO(0xaa4)]
                ? lh
                : rP
                ? [xO(0x759), xO(0x560)]
                : [xO(0xad1), xO(0x78d)]),
                rE[xO(0x4cc)](),
                rE[xO(0x428)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, l0),
                (rE[xO(0x4e5)] = 0xa),
                (rE[xO(0xbdd)] = this[xO(0x30d)](rI[0x1])),
                rE[xO(0x873)](),
                (rE[xO(0x74b)] = this[xO(0x30d)](rI[0x0])),
                rE[xO(0x869)](),
                rE[xO(0x94d)](),
                rE[xO(0x8da)](),
                rE[xO(0x4cc)]();
              const rQ = [-0x1e, -0x5, 0x16];
              for (let t0 = 0x0; t0 < rQ[xO(0xed7)]; t0++) {
                const t1 = rQ[t0];
                rE[xO(0x7eb)](t1, -0x32),
                  rE[xO(0xe29)](t1 - 0x14, 0x0, t1, 0x32);
              }
              (rE[xO(0x4e5)] = 0xe),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                rE[xO(0x873)](),
                rE[xO(0xbad)]();
              rP ? this[xO(0xcb3)](rE) : this[xO(0x6f7)](rE);
              rE[xO(0xbad)]();
              break;
            case cS[xO(0xbbf)]:
              (rH = this[xO(0x31a)] / 0x32), rE[xO(0x1f7)](rH, rH);
              const rR = 0x2f;
              rE[xO(0x4cc)]();
              for (let t2 = 0x0; t2 < 0x8; t2++) {
                let t3 =
                  (0.25 + ((t2 % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xO(0xc44)](t2 + this[xO(0xa59)] * 1.3) * 0.2;
                t2 >= 0x4 && (t3 *= -0x1),
                  rE[xO(0x7eb)](0x0, 0x0),
                  rE[xO(0xa16)](
                    Math[xO(0x77b)](t3) * rR,
                    Math[xO(0xc44)](t3) * rR
                  );
              }
              (rE[xO(0x4e5)] = 0x7),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                (rE[xO(0x452)] = xO(0xa7d)),
                rE[xO(0x873)](),
                (rE[xO(0x74b)] = rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x6);
              for (let t4 = 0x0; t4 < 0x2; t4++) {
                const t5 = t4 === 0x0 ? 0x1 : -0x1;
                rE[xO(0x94d)](),
                  rE[xO(0xa21)](0x16, t5 * 0xa),
                  rE[xO(0x235)](
                    -(Math[xO(0xc44)](this[xO(0xa59)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      t5
                  ),
                  rE[xO(0x4cc)](),
                  rE[xO(0x7eb)](0x0, t5 * 0x6),
                  rE[xO(0xe29)](0x14, t5 * 0xf, 0x28, 0x0),
                  rE[xO(0xe29)](0x14, t5 * 0x5, 0x0, 0x0),
                  rE[xO(0x7b7)](),
                  rE[xO(0x869)](),
                  rE[xO(0x873)](),
                  rE[xO(0xbad)]();
              }
              (rE[xO(0x4e5)] = 0x8),
                l9(
                  rE,
                  0x1,
                  0x8,
                  this[xO(0x30d)](xO(0x375)),
                  this[xO(0x30d)](xO(0x27d))
                );
              let rS;
              (rS = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rE[xO(0x4cc)]();
              for (let t6 = 0x0; t6 < rS[xO(0xed7)]; t6++) {
                const [t7, t8] = rS[t6];
                rE[xO(0x7eb)](t7, -t8),
                  rE[xO(0xe29)](t7 + Math[xO(0x430)](t7) * 4.2, 0x0, t7, t8);
              }
              (rE[xO(0x452)] = xO(0xa7d)),
                rE[xO(0x873)](),
                rE[xO(0xa21)](-0x21, 0x0),
                l9(
                  rE,
                  0.45,
                  0x8,
                  this[xO(0x30d)](xO(0x60c)),
                  this[xO(0x30d)](xO(0x3c7))
                ),
                rE[xO(0x4cc)](),
                (rS = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let t9 = 0x0; t9 < rS[xO(0xed7)]; t9++) {
                const [ta, tb] = rS[t9];
                rE[xO(0x7eb)](ta, -tb), rE[xO(0xe29)](ta - 0x3, 0x0, ta, tb);
              }
              (rE[xO(0x4e5)] = 0x5),
                (rE[xO(0x452)] = xO(0xa7d)),
                rE[xO(0x873)](),
                rE[xO(0xa21)](0x11, 0x0),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x0, -0x9),
                rE[xO(0xa16)](0x0, 0x9),
                rE[xO(0xa16)](0xb, 0x0),
                rE[xO(0x7b7)](),
                (rE[xO(0x401)] = rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x6),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0x5d7))),
                rE[xO(0x869)](),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x634)]:
              this[xO(0x94e)](rE, xO(0x2f3), xO(0x2c4), xO(0x513));
              break;
            case cS[xO(0x5f2)]:
              this[xO(0x94e)](rE, xO(0x9af), xO(0xa27), xO(0xcbc));
              break;
            case cS[xO(0xe64)]:
              this[xO(0x94e)](rE, xO(0x69a), xO(0x5b7), xO(0x513));
              break;
            case cS[xO(0xc54)]:
              (rH = this[xO(0x31a)] / 0x46),
                rE[xO(0x2db)](rH),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xf3a))),
                rE[xO(0x869)](lc),
                rE[xO(0x8da)](lc),
                (rE[xO(0x4e5)] = 0xf),
                (rE[xO(0xbdd)] = xO(0x8ce)),
                rE[xO(0x873)](lc),
                (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x7),
                (rE[xO(0xbdd)] = xO(0x93a)),
                rE[xO(0x873)](ld);
              break;
            case cS[xO(0xcb2)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x28),
                this[xO(0x789)](rE, 0x32, 0x1e, 0x7);
              break;
            case cS[xO(0x725)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x64),
                this[xO(0x789)](rE),
                (rE[xO(0x74b)] = rE[xO(0xbdd)]);
              const rT = 0x6,
                rU = 0x3;
              rE[xO(0x4cc)]();
              for (let tc = 0x0; tc < rT; tc++) {
                const td = (tc / rT) * Math["PI"] * 0x2;
                rE[xO(0x94d)](), rE[xO(0x235)](td);
                for (let te = 0x0; te < rU; te++) {
                  const tf = te / rU,
                    tg = 0x12 + tf * 0x44,
                    th = 0x7 + tf * 0x6;
                  rE[xO(0x7eb)](tg, 0x0),
                    rE[xO(0xc20)](tg, 0x0, th, 0x0, Math["PI"] * 0x2);
                }
                rE[xO(0xbad)]();
              }
              rE[xO(0x869)]();
              break;
            case cS[xO(0x5c3)]:
              (rH = this[xO(0x31a)] / 0x31),
                rE[xO(0x2db)](rH),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                (rJ = this[xO(0xa59)] * 0x15e);
              const rV = (Math[xO(0xc44)](rJ * 0.01) * 0.5 + 0.5) * 0.1;
              (rE[xO(0xbdd)] = rE[xO(0x74b)] = this[xO(0x30d)](xO(0xb2c))),
                (rE[xO(0x4e5)] = 0x3);
              for (let ti = 0x0; ti < 0x2; ti++) {
                rE[xO(0x94d)]();
                const tj = ti * 0x2 - 0x1;
                rE[xO(0x1f7)](0x1, tj),
                  rE[xO(0xa21)](0x1c, -0x27),
                  rE[xO(0x1f7)](1.5, 1.5),
                  rE[xO(0x235)](rV),
                  rE[xO(0x4cc)](),
                  rE[xO(0x7eb)](0x0, 0x0),
                  rE[xO(0xe29)](0xc, -0x8, 0x14, 0x3),
                  rE[xO(0xa16)](0xb, 0x1),
                  rE[xO(0xa16)](0x11, 0x9),
                  rE[xO(0xe29)](0xc, 0x5, 0x0, 0x6),
                  rE[xO(0x7b7)](),
                  rE[xO(0x873)](),
                  rE[xO(0x869)](),
                  rE[xO(0xbad)]();
              }
              rE[xO(0x4cc)]();
              for (let tk = 0x0; tk < 0x2; tk++) {
                for (let tl = 0x0; tl < 0x4; tl++) {
                  const tm = tk * 0x2 - 0x1,
                    tn =
                      (Math[xO(0xc44)](rJ * 0.005 + tk + tl * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rE[xO(0x94d)](),
                    rE[xO(0x1f7)](0x1, tm),
                    rE[xO(0xa21)]((tl / 0x3) * 0x1e - 0xf, 0x28);
                  const to = tl < 0x2 ? 0x1 : -0x1;
                  rE[xO(0x235)](tn * to),
                    rE[xO(0x7eb)](0x0, 0x0),
                    rE[xO(0xa21)](0x0, 0x19),
                    rE[xO(0xa16)](0x0, 0x0),
                    rE[xO(0x235)](to * 0.7 * (tn + 0.3)),
                    rE[xO(0xa16)](0x0, 0xa),
                    rE[xO(0xbad)]();
                }
              }
              (rE[xO(0x4e5)] = 0xa),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x2, 0x17),
                rE[xO(0xe29)](0x17, 0x0, 0x2, -0x17),
                rE[xO(0xa16)](-0xa, -0xf),
                rE[xO(0xa16)](-0xa, 0xf),
                rE[xO(0x7b7)](),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x98d))),
                (rE[xO(0x4e5)] = 0x44),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                rE[xO(0x873)](),
                (rE[xO(0x4e5)] -= 0x12),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x376))),
                rE[xO(0x873)](),
                (rE[xO(0xbdd)] = xO(0x525)),
                rE[xO(0x4cc)]();
              const rW = 0x12;
              for (let tp = 0x0; tp < 0x2; tp++) {
                rE[xO(0x7eb)](-0x12, rW),
                  rE[xO(0xe29)](0x0, -0x7 + rW, 0x12, rW),
                  rE[xO(0x1f7)](0x1, -0x1);
              }
              (rE[xO(0x4e5)] = 0x9), rE[xO(0x873)]();
              break;
            case cS[xO(0xf30)]:
              (rH = this[xO(0x31a)] / 0x50),
                rE[xO(0x2db)](rH),
                rE[xO(0x235)](
                  ((Date[xO(0x8ea)]() / 0x7d0) % l0) + this[xO(0xa59)] * 0.4
                );
              const rX = 0x5;
              !this[xO(0x5e6)] &&
                (this[xO(0x5e6)] = Array(rX)[xO(0x869)](0x64));
              const rY = this[xO(0x5e6)],
                rZ = this[xO(0xab6)]
                  ? 0x0
                  : Math[xO(0x7ce)](this[xO(0xbf7)] * (rX - 0x1));
              rE[xO(0x4cc)]();
              for (let tq = 0x0; tq < rX; tq++) {
                const tr = ((tq + 0.5) / rX) * Math["PI"] * 0x2,
                  ts = ((tq + 0x1) / rX) * Math["PI"] * 0x2;
                rY[tq] += ((tq < rZ ? 0x64 : 0x3c) - rY[tq]) * 0.2;
                const tu = rY[tq];
                if (tq === 0x0) rE[xO(0x7eb)](tu, 0x0);
                rE[xO(0xe29)](
                  Math[xO(0x77b)](tr) * 0x5,
                  Math[xO(0xc44)](tr) * 0x5,
                  Math[xO(0x77b)](ts) * tu,
                  Math[xO(0xc44)](ts) * tu
                );
              }
              rE[xO(0x7b7)](),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x1c + 0xa),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x543))),
                rE[xO(0x873)](),
                (rE[xO(0x4e5)] = 0x10 + 0xa),
                (rE[xO(0xbdd)] = rE[xO(0x74b)] = this[xO(0x30d)](xO(0xadd))),
                rE[xO(0x869)](),
                rE[xO(0x873)](),
                rE[xO(0x4cc)]();
              for (let tv = 0x0; tv < rX; tv++) {
                const tw = (tv / rX) * Math["PI"] * 0x2;
                rE[xO(0x94d)](), rE[xO(0x235)](tw);
                const tx = rY[tv] / 0x64;
                let ty = 0x1a;
                const tz = 0x4;
                for (let tA = 0x0; tA < tz; tA++) {
                  const tB = (0x1 - (tA / tz) * 0.7) * 0xc * tx;
                  rE[xO(0x7eb)](ty, 0x0),
                    rE[xO(0xc20)](ty, 0x0, tB, 0x0, Math["PI"] * 0x2),
                    (ty += tB * 0x2 + 3.5 * tx);
                }
                rE[xO(0xbad)]();
              }
              (rE[xO(0x74b)] = xO(0xb41)), rE[xO(0x869)]();
              break;
            case cS[xO(0x480)]:
              (rH = this[xO(0x31a)] / 0x1e),
                rE[xO(0x2db)](rH),
                rE[xO(0xa21)](-0x22, 0x0),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x0, -0x8),
                rE[xO(0xe29)](0x9b, 0x0, 0x0, 0x8),
                rE[xO(0x7b7)](),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x1a),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x543))),
                rE[xO(0x873)](),
                (rE[xO(0x4e5)] = 0x10),
                (rE[xO(0xbdd)] = rE[xO(0x74b)] = this[xO(0x30d)](xO(0xadd))),
                rE[xO(0x869)](),
                rE[xO(0x873)](),
                rE[xO(0x4cc)]();
              let s0 = 0xd;
              for (let tC = 0x0; tC < 0x4; tC++) {
                const tD = (0x1 - (tC / 0x4) * 0.7) * 0xa;
                rE[xO(0x7eb)](s0, 0x0),
                  rE[xO(0xc20)](s0, 0x0, tD, 0x0, Math["PI"] * 0x2),
                  (s0 += tD * 0x2 + 0x4);
              }
              (rE[xO(0x74b)] = xO(0xb41)), rE[xO(0x869)]();
              break;
            case cS[xO(0x50d)]:
              (rH = this[xO(0x31a)] / 0x64),
                rE[xO(0x1f7)](rH, rH),
                (rE[xO(0x401)] = rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0xbdd)] = xO(0x207)),
                (rE[xO(0x4e5)] = 0x14);
              const s1 = [0x1, 0.63, 0.28],
                s3 = this[xO(0xaa4)] ? lo : [xO(0x5e4), xO(0x4b6), xO(0xa8b)],
                s4 = (pN * 0.005) % l0;
              for (let tE = 0x0; tE < 0x3; tE++) {
                const tF = s1[tE],
                  tG = s3[tE];
                rE[xO(0x94d)](),
                  rE[xO(0x235)](s4 * (tE % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rE[xO(0x4cc)]();
                const tH = 0x7 - tE;
                for (let tI = 0x0; tI < tH; tI++) {
                  const tJ = (Math["PI"] * 0x2 * tI) / tH;
                  rE[xO(0xa16)](
                    Math[xO(0x77b)](tJ) * tF * 0x64,
                    Math[xO(0xc44)](tJ) * tF * 0x64
                  );
                }
                rE[xO(0x7b7)](),
                  (rE[xO(0xbdd)] = rE[xO(0x74b)] = this[xO(0x30d)](tG)),
                  rE[xO(0x869)](),
                  rE[xO(0x873)](),
                  rE[xO(0xbad)]();
              }
              break;
            case cS[xO(0xabe)]:
              (rH = this[xO(0x31a)] / 0x41),
                rE[xO(0x1f7)](rH, rH),
                (rJ = this[xO(0xa59)] * 0x2),
                rE[xO(0x235)](Math["PI"] / 0x2);
              if (this[xO(0xddb)]) {
                const tK = 0x3;
                rE[xO(0x4cc)]();
                for (let tO = 0x0; tO < 0x2; tO++) {
                  for (let tP = 0x0; tP <= tK; tP++) {
                    const tQ = (tP / tK) * 0x50 - 0x28;
                    rE[xO(0x94d)]();
                    const tR = tO * 0x2 - 0x1;
                    rE[xO(0xa21)](tR * -0x2d, tQ);
                    const tS =
                      1.1 + Math[xO(0xc44)]((tP / tK) * Math["PI"]) * 0.5;
                    rE[xO(0x1f7)](tS * tR, tS),
                      rE[xO(0x235)](Math[xO(0xc44)](rJ + tP + tR) * 0.3 + 0.3),
                      rE[xO(0x7eb)](0x0, 0x0),
                      rE[xO(0xe29)](-0xf, -0x5, -0x14, 0xa),
                      rE[xO(0xbad)]();
                  }
                }
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                  (rE[xO(0x4e5)] = 0x8),
                  (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                  rE[xO(0x873)](),
                  (rE[xO(0x4e5)] = 0xc);
                const tL = Date[xO(0x8ea)]() * 0.01,
                  tM = Math[xO(0xc44)](tL * 0.5) * 0.5 + 0.5,
                  tN = tM * 0.1 + 0x1;
                rE[xO(0x4cc)](),
                  rE[xO(0xc20)](-0xf * tN, 0x2b - tM, 0x10, 0x0, Math["PI"]),
                  rE[xO(0xc20)](0xf * tN, 0x2b - tM, 0x10, 0x0, Math["PI"]),
                  rE[xO(0x7eb)](-0x16, -0x2b),
                  rE[xO(0xc20)](0x0, -0x2b - tM, 0x16, 0x0, Math["PI"], !![]),
                  (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xbef))),
                  rE[xO(0x873)](),
                  (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xd88))),
                  rE[xO(0x869)](),
                  rE[xO(0x94d)](),
                  rE[xO(0x235)]((Math["PI"] * 0x3) / 0x2),
                  this[xO(0x6f7)](rE, 0x1a - tM, 0x0),
                  rE[xO(0xbad)]();
              }
              if (!this[xO(0xc4a)]) {
                const tT = dI[d9[xO(0xd1a)]],
                  tU = Math[xO(0x49f)](this["id"] % tT[xO(0xed7)], 0x0),
                  tV = new lN(-0x1, 0x0, 0x0, tT[tU]["id"]);
                (tV[xO(0xf37)] = 0x1),
                  (tV[xO(0x9d6)] = 0x0),
                  (this[xO(0xc4a)] = tV);
              }
              rE[xO(0x2db)](1.3), this[xO(0xc4a)][xO(0x4a7)](rE);
              break;
            case cS[xO(0x637)]:
              (rH = this[xO(0x31a)] / 0x14),
                rE[xO(0x1f7)](rH, rH),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x11, 0x0),
                rE[xO(0xa16)](0x0, 0x0),
                rE[xO(0xa16)](0x11, 0x6),
                rE[xO(0x7eb)](0x0, 0x0),
                rE[xO(0xa16)](0xb, -0x7),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xe50))),
                (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0xc),
                rE[xO(0x873)](),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x35b))),
                (rE[xO(0x4e5)] = 0x6),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x26a)]:
              (rH = this[xO(0x31a)] / 0x80),
                rE[xO(0x2db)](rH),
                rE[xO(0xa21)](-0x80, -0x78),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xdbb))),
                rE[xO(0x869)](f9[xO(0xa06)]),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x9b5))),
                (rE[xO(0x4e5)] = 0x14),
                rE[xO(0x873)](f9[xO(0xa06)]);
              break;
            case cS[xO(0x758)]:
              (rH = this[xO(0x31a)] / 0x19),
                rE[xO(0x1f7)](rH, rH),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x19, 0x0),
                rE[xO(0xa16)](-0x2d, 0x0),
                (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x14),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xedf))),
                rE[xO(0x869)](),
                (rE[xO(0x4e5)] = 0x7),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xd9f))),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x764)]:
              rE[xO(0x235)](-this[xO(0x9d6)]),
                rE[xO(0x2db)](this[xO(0x31a)] / 0x14),
                this[xO(0x5c8)](rE),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xedf))),
                rE[xO(0x869)](),
                rE[xO(0x8da)](),
                (rE[xO(0x4e5)] = 0xc),
                (rE[xO(0xbdd)] = xO(0x525)),
                rE[xO(0x873)]();
              break;
            case cS[xO(0xb28)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x64), this[xO(0x24e)](rE);
              break;
            case cS[xO(0x303)]:
              this[xO(0x939)](rE, !![]);
              break;
            case cS[xO(0xc57)]:
              this[xO(0x939)](rE, ![]);
              break;
            case cS[xO(0xaf2)]:
              (rH = this[xO(0x31a)] / 0xa),
                rE[xO(0x2db)](rH),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x0, 0x8),
                rE[xO(0xe29)](2.5, 0x0, 0x0, -0x8),
                (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0xa),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xd9f))),
                rE[xO(0x873)](),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xedf))),
                (rE[xO(0x4e5)] = 0x6),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x2bd)]:
              (rH = this[xO(0x31a)] / 0xa),
                rE[xO(0x2db)](rH),
                rE[xO(0xa21)](0x7, 0x0),
                (rE[xO(0x452)] = xO(0xa7d)),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x5, -0x5),
                rE[xO(0xa56)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rE[xO(0xa56)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xb2c))),
                rE[xO(0x869)](),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb26))),
                (rE[xO(0x4e5)] = 0x3),
                (rE[xO(0x401)] = xO(0xa7d)),
                rE[xO(0x873)]();
              break;
            case cS[xO(0xaff)]:
              (rH = this[xO(0x31a)] / 0x32), rE[xO(0x2db)](rH), rE[xO(0x4cc)]();
              for (let tW = 0x0; tW < 0x9; tW++) {
                const tX = (tW / 0x9) * Math["PI"] * 0x2,
                  tY =
                    0x3c *
                    (0x1 +
                      Math[xO(0x77b)]((tW / 0x9) * Math["PI"] * 3.5) * 0.07);
                rE[xO(0x7eb)](0x0, 0x0),
                  rE[xO(0xa16)](
                    Math[xO(0x77b)](tX) * tY,
                    Math[xO(0xc44)](tX) * tY
                  );
              }
              (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x10),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xedf))),
                rE[xO(0x869)](),
                (rE[xO(0x4e5)] = 0x6),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xd9f))),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x26d)]:
              rE[xO(0x94d)](),
                (rH = this[xO(0x31a)] / 0x28),
                rE[xO(0x1f7)](rH, rH),
                this[xO(0x6e5)](rE),
                (rE[xO(0x74b)] = this[xO(0x30d)](
                  this[xO(0xaa4)] ? lh[0x0] : xO(0x897)
                )),
                (rE[xO(0xbdd)] = xO(0x7dc)),
                (rE[xO(0x4e5)] = 0x10),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rE[xO(0x869)](),
                rE[xO(0x94d)](),
                rE[xO(0x8da)](),
                rE[xO(0x873)](),
                rE[xO(0xbad)](),
                rE[xO(0xbad)]();
              break;
            case cS[xO(0x40f)]:
            case cS[xO(0x736)]:
            case cS[xO(0xc0c)]:
            case cS[xO(0xb21)]:
            case cS[xO(0x874)]:
            case cS[xO(0x22b)]:
            case cS[xO(0x871)]:
            case cS[xO(0x8e5)]:
              (rH = this[xO(0x31a)] / 0x14), rE[xO(0x1f7)](rH, rH);
              const s5 = Math[xO(0xc44)](this[xO(0xa59)] * 1.6),
                s6 = this[xO(0x89d)][xO(0x9d3)](xO(0x40f)),
                s7 = this[xO(0x89d)][xO(0x9d3)](xO(0xebb)),
                s8 = this[xO(0x89d)][xO(0x9d3)](xO(0xc0c)),
                s9 = this[xO(0x89d)][xO(0x9d3)](xO(0xc0c)) ? -0x4 : 0x0;
              (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x6);
              s7 && rE[xO(0xa21)](0x8, 0x0);
              for (let tZ = 0x0; tZ < 0x2; tZ++) {
                const u0 = tZ === 0x0 ? -0x1 : 0x1;
                rE[xO(0x94d)](), rE[xO(0x235)](u0 * (s5 * 0.5 + 0.6) * 0.08);
                const u1 = u0 * 0x4;
                rE[xO(0x4cc)](),
                  rE[xO(0x7eb)](0x0, u1),
                  rE[xO(0xe29)](0xc, 0x6 * u0 + u1, 0x18, u1),
                  rE[xO(0x873)](),
                  rE[xO(0xbad)]();
              }
              if (this[xO(0xaa4)])
                (rE[xO(0x74b)] = this[xO(0x30d)](lh[0x0])),
                  (rE[xO(0xbdd)] = this[xO(0x30d)](lh[0x1]));
              else
                this[xO(0x89d)][xO(0x32a)](xO(0x42f))
                  ? ((rE[xO(0x74b)] = this[xO(0x30d)](xO(0x58c))),
                    (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xd07))))
                  : ((rE[xO(0x74b)] = this[xO(0x30d)](xO(0x6fa))),
                    (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xad0))));
              rE[xO(0x4e5)] = s7 ? 0x9 : 0xc;
              s7 &&
                (rE[xO(0x94d)](),
                rE[xO(0xa21)](-0x18, 0x0),
                rE[xO(0x1f7)](-0x1, 0x1),
                lF(rE, 0x15, rE[xO(0x74b)], rE[xO(0xbdd)], rE[xO(0x4e5)]),
                rE[xO(0xbad)]());
              !s8 &&
                (rE[xO(0x94d)](),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](-0xa, 0x0, s7 ? 0x12 : 0xc, 0x0, l0),
                rE[xO(0x869)](),
                rE[xO(0x8da)](),
                rE[xO(0x873)](),
                rE[xO(0xbad)]());
              if (s6 || s7) {
                rE[xO(0x94d)](),
                  (rE[xO(0x74b)] = this[xO(0x30d)](xO(0x203))),
                  (rE[xO(0x557)] *= 0.5);
                const u2 = (Math["PI"] / 0x7) * (s7 ? 0.85 : 0x1) + s5 * 0.08;
                for (let u3 = 0x0; u3 < 0x2; u3++) {
                  const u4 = u3 === 0x0 ? -0x1 : 0x1;
                  rE[xO(0x94d)](),
                    rE[xO(0x235)](u4 * u2),
                    rE[xO(0xa21)](
                      s7 ? -0x13 : -0x9,
                      u4 * -0x3 * (s7 ? 1.3 : 0x1)
                    ),
                    rE[xO(0x4cc)](),
                    rE[xO(0x428)](
                      0x0,
                      0x0,
                      s7 ? 0x14 : 0xe,
                      s7 ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      l0
                    ),
                    rE[xO(0x869)](),
                    rE[xO(0xbad)]();
                }
                rE[xO(0xbad)]();
              }
              rE[xO(0x94d)](),
                rE[xO(0xa21)](0x4 + s9, 0x0),
                lF(
                  rE,
                  s8 ? 0x14 : 12.1,
                  rE[xO(0x74b)],
                  rE[xO(0xbdd)],
                  rE[xO(0x4e5)]
                ),
                rE[xO(0xbad)]();
              break;
            case cS[xO(0x625)]:
              this[xO(0x55e)](rE, xO(0x384));
              break;
            case cS[xO(0x85b)]:
              this[xO(0x55e)](rE, xO(0x87c));
              break;
            case cS[xO(0xe99)]:
              this[xO(0x55e)](rE, xO(0x5d7)),
                (rE[xO(0x557)] *= 0.2),
                lJ(rE, this[xO(0x31a)] * 1.3, 0x4);
              break;
            case cS[xO(0xc5b)]:
            case cS[xO(0xa9f)]:
            case cS[xO(0x3fd)]:
            case cS[xO(0x2df)]:
            case cS[xO(0xdd0)]:
            case cS[xO(0xdc2)]:
              rE[xO(0x94d)](),
                (rH = this[xO(0x31a)] / 0x28),
                rE[xO(0x1f7)](rH, rH),
                rE[xO(0x4cc)]();
              for (let u5 = 0x0; u5 < 0x2; u5++) {
                rE[xO(0x94d)](),
                  rE[xO(0x1f7)](0x1, u5 * 0x2 - 0x1),
                  rE[xO(0xa21)](0x0, 0x23),
                  rE[xO(0x7eb)](0x9, 0x0),
                  rE[xO(0xa16)](0x5, 0xa),
                  rE[xO(0xa16)](-0x5, 0xa),
                  rE[xO(0xa16)](-0x9, 0x0),
                  rE[xO(0xa16)](0x9, 0x0),
                  rE[xO(0xbad)]();
              }
              (rE[xO(0x4e5)] = 0x12),
                (rE[xO(0x401)] = rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0xbdd)] = rE[xO(0x74b)] = this[xO(0x30d)](xO(0x2b4))),
                rE[xO(0x869)](),
                rE[xO(0x873)]();
              let sa;
              if (this[xO(0x89d)][xO(0x757)](xO(0x46e)) > -0x1)
                sa = [xO(0x770), xO(0x696)];
              else
                this[xO(0x89d)][xO(0x757)](xO(0x2b3)) > -0x1
                  ? (sa = [xO(0xd88), xO(0xbc2)])
                  : (sa = [xO(0xaad), xO(0x6fc)]);
              rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0x28, 0x0, l0),
                (rE[xO(0x74b)] = this[xO(0x30d)](sa[0x0])),
                rE[xO(0x869)](),
                (rE[xO(0x4e5)] = 0x8),
                (rE[xO(0xbdd)] = this[xO(0x30d)](sa[0x1])),
                rE[xO(0x873)]();
              this[xO(0x89d)][xO(0x757)](xO(0x3c1)) > -0x1 &&
                this[xO(0x6f7)](rE, -0xf, 0x0, 1.25, 0x4);
              rE[xO(0xbad)]();
              break;
            case cS[xO(0xa15)]:
            case cS[xO(0x8f8)]:
              (rJ =
                Math[xO(0xc44)](
                  Date[xO(0x8ea)]() / 0x3e8 + this[xO(0xa59)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rH = this[xO(0x31a)] / 0x50),
                rE[xO(0x1f7)](rH, rH);
              const sb = this[xO(0x8ca)] === cS[xO(0x8f8)];
              sb &&
                (rE[xO(0x94d)](),
                rE[xO(0x1f7)](0x2, 0x2),
                this[xO(0x6e5)](rE),
                rE[xO(0xbad)]());
              rE[xO(0x235)](-this[xO(0x9d6)]),
                (rE[xO(0x4e5)] = 0xa),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (rI = this[xO(0xaa4)]
                  ? lh
                  : sb
                  ? [xO(0x246), xO(0xb9f)]
                  : [xO(0x39e), xO(0xe5a)]),
                (rE[xO(0x74b)] = this[xO(0x30d)](rI[0x0])),
                rE[xO(0x869)](),
                rE[xO(0x8da)](),
                (rE[xO(0xbdd)] = this[xO(0x30d)](rI[0x1])),
                rE[xO(0x873)]();
              const sc = this[xO(0x30d)](xO(0xedf)),
                sd = this[xO(0x30d)](xO(0x513)),
                se = (u6 = 0x1) => {
                  const xR = xO;
                  rE[xR(0x94d)](),
                    rE[xR(0x1f7)](u6, 0x1),
                    rE[xR(0xa21)](0x13 - rJ * 0x4, -0x1d + rJ * 0x5),
                    rE[xR(0x4cc)](),
                    rE[xR(0x7eb)](0x0, 0x0),
                    rE[xR(0xa56)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rE[xR(0xe29)](0x19, 0x5 + rJ * 0x2, 0x0, 0x0),
                    rE[xR(0x7b7)](),
                    (rE[xR(0x4e5)] = 0x3),
                    rE[xR(0x873)](),
                    (rE[xR(0x74b)] = sc),
                    rE[xR(0x869)](),
                    rE[xR(0x8da)](),
                    rE[xR(0x4cc)](),
                    rE[xR(0xc20)](
                      0x16 + u6 * this[xR(0x283)] * 0x10,
                      -0x4 + this[xR(0x68b)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rE[xR(0x74b)] = sd),
                    rE[xR(0x869)](),
                    rE[xR(0xbad)]();
                };
              se(0x1),
                se(-0x1),
                rE[xO(0x94d)](),
                rE[xO(0xa21)](0x0, 0xa),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x28 + rJ * 0xa, -0xe + rJ * 0x5),
                rE[xO(0xe29)](0x0, +rJ * 0x5, 0x2c - rJ * 0xf, -0xe + rJ * 0x5),
                rE[xO(0xa56)](
                  0x14,
                  0x28 - rJ * 0x14,
                  -0x14,
                  0x28 - rJ * 0x14,
                  -0x28 + rJ * 0xa,
                  -0xe + rJ * 0x5
                ),
                rE[xO(0x7b7)](),
                (rE[xO(0x4e5)] = 0x5),
                rE[xO(0x873)](),
                (rE[xO(0x74b)] = sd),
                rE[xO(0x869)](),
                rE[xO(0x8da)]();
              const sf = rJ * 0x2,
                sg = rJ * -0xa;
              rE[xO(0x94d)](),
                rE[xO(0xa21)](0x0, sg),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x37, -0x8),
                rE[xO(0xa56)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rE[xO(0xbdd)] = sc),
                (rE[xO(0x4e5)] = 0xd),
                rE[xO(0x873)](),
                (rE[xO(0x4e5)] = 0x4),
                (rE[xO(0xbdd)] = sd),
                rE[xO(0x4cc)]();
              for (let u6 = 0x0; u6 < 0x6; u6++) {
                const u7 = (((u6 + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rE[xO(0x7eb)](u7, 0xa), rE[xO(0xa16)](u7, 0x46);
              }
              rE[xO(0x873)](),
                rE[xO(0xbad)](),
                rE[xO(0x94d)](),
                rE[xO(0xa21)](0x0, sf),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x32, -0x14),
                rE[xO(0xe29)](0x0, 0x8, 0x32, -0x12),
                (rE[xO(0xbdd)] = sc),
                (rE[xO(0x4e5)] = 0xd),
                rE[xO(0x873)](),
                (rE[xO(0x4e5)] = 0x5),
                (rE[xO(0xbdd)] = sd),
                rE[xO(0x4cc)]();
              for (let u8 = 0x0; u8 < 0x6; u8++) {
                let u9 = (((u8 + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rE[xO(0x7eb)](u9, -0x14), rE[xO(0xa16)](u9, 0x2);
              }
              rE[xO(0x873)](), rE[xO(0xbad)](), rE[xO(0xbad)]();
              const sh = 0x1 - rJ;
              (rE[xO(0x557)] *= Math[xO(0x49f)](0x0, (sh - 0.3) / 0.7)),
                rE[xO(0x4cc)]();
              for (let ua = 0x0; ua < 0x2; ua++) {
                rE[xO(0x94d)](),
                  ua === 0x1 && rE[xO(0x1f7)](-0x1, 0x1),
                  rE[xO(0xa21)](
                    -0x33 + rJ * (0xa + ua * 3.4) - ua * 3.4,
                    -0xf + rJ * (0x5 - ua * 0x1)
                  ),
                  rE[xO(0x7eb)](0xa, 0x0),
                  rE[xO(0xc20)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rE[xO(0xbad)]();
              }
              rE[xO(0xa21)](0x0, 0x28),
                rE[xO(0x7eb)](0x28 - rJ * 0xa, -0xe + rJ * 0x5),
                rE[xO(0xa56)](
                  0x14,
                  0x14 - rJ * 0xa,
                  -0x14,
                  0x14 - rJ * 0xa,
                  -0x28 + rJ * 0xa,
                  -0xe + rJ * 0x5
                ),
                (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x2),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x970)]:
              (rH = this[xO(0x31a)] / 0x14), rE[xO(0x1f7)](rH, rH);
              const si = rE[xO(0x557)];
              (rE[xO(0xbdd)] = rE[xO(0x74b)] = this[xO(0x30d)](xO(0xedf))),
                (rE[xO(0x557)] = 0.6 * si),
                rE[xO(0x4cc)]();
              for (let ub = 0x0; ub < 0xa; ub++) {
                const uc = (ub / 0xa) * Math["PI"] * 0x2;
                rE[xO(0x94d)](),
                  rE[xO(0x235)](uc),
                  rE[xO(0xa21)](17.5, 0x0),
                  rE[xO(0x7eb)](0x0, 0x0);
                const ud = Math[xO(0xc44)](uc + Date[xO(0x8ea)]() / 0x1f4);
                rE[xO(0x235)](ud * 0.5),
                  rE[xO(0xe29)](0x4, -0x2 * ud, 0xe, 0x0),
                  rE[xO(0xbad)]();
              }
              (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 2.3),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rE[xO(0x557)] = 0.5 * si),
                rE[xO(0x869)](),
                rE[xO(0x8da)](),
                (rE[xO(0x4e5)] = 0x3),
                rE[xO(0x873)](),
                (rE[xO(0x4e5)] = 1.2),
                (rE[xO(0x557)] = 0.6 * si),
                rE[xO(0x4cc)](),
                (rE[xO(0x452)] = xO(0xa7d));
              for (let ue = 0x0; ue < 0x4; ue++) {
                rE[xO(0x94d)](),
                  rE[xO(0x235)]((ue / 0x4) * Math["PI"] * 0x2),
                  rE[xO(0xa21)](0x4, 0x0),
                  rE[xO(0x7eb)](0x0, -0x2),
                  rE[xO(0xa56)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rE[xO(0xbad)]();
              }
              rE[xO(0x873)]();
              break;
            case cS[xO(0xe6b)]:
              this[xO(0xe6b)](rE);
              break;
            case cS[xO(0x7b6)]:
              this[xO(0xe6b)](rE, !![]);
              break;
            case cS[xO(0x787)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x32),
                (rE[xO(0x4e5)] = 0x19),
                (rE[xO(0x401)] = xO(0xa7d));
              const sj = this[xO(0xcd1)]
                ? 0.6
                : (Date[xO(0x8ea)]() / 0x4b0) % 6.28;
              for (let uf = 0x0; uf < 0xa; uf++) {
                const ug = 0x1 - uf / 0xa,
                  uh =
                    ug *
                    0x50 *
                    (0x1 +
                      (Math[xO(0xc44)](sj * 0x3 + uf * 0.5 + this[xO(0xa59)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rE[xO(0x235)](sj),
                  (rE[xO(0xbdd)] = this[xO(0x30d)](lg[uf])),
                  rE[xO(0xc99)](-uh / 0x2, -uh / 0x2, uh, uh);
              }
              break;
            case cS[xO(0xda0)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x12),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x19, -0xa),
                rE[xO(0xe29)](0x0, -0x2, 0x19, -0xa),
                rE[xO(0xe29)](0x1e, 0x0, 0x19, 0xa),
                rE[xO(0xe29)](0x0, 0x2, -0x19, 0xa),
                rE[xO(0xe29)](-0x1e, 0x0, -0x19, -0xa),
                rE[xO(0x7b7)](),
                (rE[xO(0x401)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0x4),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x3bc))),
                rE[xO(0x873)](),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0x94b))),
                rE[xO(0x869)](),
                rE[xO(0x8da)](),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x19, -0xa),
                rE[xO(0xe29)](0x14, 0x0, 0x19, 0xa),
                rE[xO(0xa16)](0x28, 0xa),
                rE[xO(0xa16)](0x28, -0xa),
                (rE[xO(0x74b)] = xO(0x7dc)),
                rE[xO(0x869)](),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x0, -0xa),
                rE[xO(0xe29)](-0x5, 0x0, 0x0, 0xa),
                (rE[xO(0x4e5)] = 0xa),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xa43))),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x996)]:
              (rH = this[xO(0x31a)] / 0xc),
                rE[xO(0x1f7)](rH, rH),
                rE[xO(0x235)](-Math["PI"] / 0x6),
                rE[xO(0xa21)](-0xc, 0x0),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x5, 0x0),
                rE[xO(0xa16)](0x0, 0x0),
                (rE[xO(0x4e5)] = 0x4),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x5f9))),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x0, 0x0),
                rE[xO(0xe29)](0xa, -0x14, 0x1e, 0x0),
                rE[xO(0xe29)](0xa, 0x14, 0x0, 0x0),
                (rE[xO(0x4e5)] = 0x6),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xc6e))),
                rE[xO(0x873)](),
                rE[xO(0x869)](),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x6, 0x0),
                rE[xO(0xe29)](0xe, -0x2, 0x16, 0x0),
                (rE[xO(0x4e5)] = 3.5),
                rE[xO(0x873)]();
              break;
            case cS[xO(0xf2d)]:
              rG(xO(0xf2d), xO(0xa7e), xO(0xb19));
              break;
            case cS[xO(0x4fe)]:
              rG(xO(0x4fe), xO(0x5bd), xO(0x47a));
              break;
            case cS[xO(0x6f8)]:
              rG(xO(0x6f8), xO(0xedf), xO(0xd9f));
              break;
            case cS[xO(0x98b)]:
              rG(xO(0x98b), xO(0xedf), xO(0xd9f));
              break;
            case cS[xO(0xdbe)]:
              rG(xO(0x98b), xO(0xe78), xO(0x905));
              break;
            case cS[xO(0xb9e)]:
              const sk = this[xO(0xcd1)] ? 0x3c : this[xO(0x31a)] * 0x2;
              rE[xO(0xa21)](-this[xO(0x31a)] - 0xa, 0x0),
                (rE[xO(0x401)] = rE[xO(0x452)] = xO(0xa7d)),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x0, 0x0),
                rE[xO(0xa16)](sk, 0x0),
                (rE[xO(0x4e5)] = 0x6),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xb26))),
                rE[xO(0x869)](),
                rE[xO(0xa21)](sk, 0x0),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0xd, 0x0),
                rE[xO(0xa16)](0x0, -3.5),
                rE[xO(0xa16)](0x0, 3.5),
                rE[xO(0x7b7)](),
                (rE[xO(0xbdd)] = rE[xO(0x74b)]),
                rE[xO(0x869)](),
                (rE[xO(0x4e5)] = 0x3),
                rE[xO(0x873)]();
              break;
            case cS[xO(0xb7c)]:
              const sl = this[xO(0x31a)] * 0x2,
                sm = 0xa;
              rE[xO(0xa21)](-this[xO(0x31a)], 0x0),
                (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x462)] = xO(0xde7)),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x0, 0x0),
                rE[xO(0xa16)](-sm * 1.8, 0x0),
                (rE[xO(0xbdd)] = xO(0x331)),
                (rE[xO(0x4e5)] = sm * 1.4),
                rE[xO(0x873)](),
                (rE[xO(0xbdd)] = xO(0x2a2)),
                (rE[xO(0x4e5)] *= 0.7),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x0, 0x0),
                rE[xO(0xa16)](-sm * 0.45, 0x0),
                (rE[xO(0xbdd)] = xO(0x331)),
                (rE[xO(0x4e5)] = sm * 0x2 + 3.5),
                rE[xO(0x873)](),
                (rE[xO(0xbdd)] = xO(0x997)),
                (rE[xO(0x4e5)] = sm * 0x2),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, sm, 0x0, Math["PI"] * 0x2),
                (rE[xO(0x74b)] = xO(0x684)),
                rE[xO(0x869)](),
                (rE[xO(0xbdd)] = xO(0x669)),
                rE[xO(0x4cc)]();
              const sn = (Date[xO(0x8ea)]() * 0.001) % 0x1,
                so = sn * sl,
                sp = sl * 0.2;
              rE[xO(0x7eb)](Math[xO(0x49f)](so - sp, 0x0), 0x0),
                rE[xO(0xa16)](Math[xO(0xc36)](so + sp, sl), 0x0);
              const sq = Math[xO(0xc44)](sn * Math["PI"]);
              (rE[xO(0x20d)] = sm * 0x3 * sq),
                (rE[xO(0x4e5)] = sm),
                rE[xO(0x873)](),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x0, 0x0),
                rE[xO(0xa16)](sl, 0x0),
                (rE[xO(0x4e5)] = sm),
                (rE[xO(0x20d)] = sm),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x3f9)]:
            case cS[xO(0x9c8)]:
            case cS[xO(0x9d5)]:
            case cS[xO(0xa4e)]:
            case cS[xO(0x378)]:
            case cS[xO(0x9dd)]:
              (rH = this[xO(0x31a)] / 0x23), rE[xO(0x2db)](rH), rE[xO(0x4cc)]();
              this[xO(0x8ca)] !== cS[xO(0x9c8)] &&
              this[xO(0x8ca)] !== cS[xO(0x378)]
                ? rE[xO(0x428)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, l0)
                : rE[xO(0xc20)](0x0, 0x0, 0x23, 0x0, l0);
              (rI = lr[this[xO(0x8ca)]] || [xO(0xefa), xO(0xa13)]),
                (rE[xO(0x74b)] = this[xO(0x30d)](rI[0x0])),
                rE[xO(0x869)](),
                (rE[xO(0xbdd)] = this[xO(0x30d)](rI[0x1])),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x86c)]:
              (rE[xO(0x4e5)] = 0x4),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0x8be)),
                rG(xO(0x86c), xO(0x567), xO(0xdf1));
              break;
            case cS[xO(0x697)]:
              rG(xO(0x697), xO(0xedf), xO(0xd9f));
              break;
            case cS[xO(0x7c6)]:
              (rH = this[xO(0x31a)] / 0x14), rE[xO(0x1f7)](rH, rH);
              !this[xO(0xcd1)] && rE[xO(0x235)]((pN / 0x64) % 6.28);
              rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rE[xO(0xe29)](0x0, 0xc, 0x14, 0x0),
                rE[xO(0x7b7)](),
                (rE[xO(0x401)] = rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] *= 0.7),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xedf))),
                rE[xO(0x869)](),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xd9f))),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x350)]:
              (rE[xO(0x4e5)] *= 0.7),
                rG(xO(0x350), xO(0xb07), xO(0xc93)),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0.6, 0x0, l0),
                (rE[xO(0x74b)] = xO(0x807)),
                rE[xO(0x869)]();
              break;
            case cS[xO(0x609)]:
              (rE[xO(0x4e5)] *= 0.8), rG(xO(0x609), xO(0x4b6), xO(0xf1f));
              break;
            case cS[xO(0xae2)]:
              (rH = this[xO(0x31a)] / 0xa), rE[xO(0x1f7)](rH, rH);
              if (!this[xO(0x747)] || pN - this[xO(0x3e3)] > 0x14) {
                this[xO(0x3e3)] = pN;
                const ui = new Path2D();
                for (let uj = 0x0; uj < 0xa; uj++) {
                  const uk = (Math[xO(0xb69)]() * 0x2 - 0x1) * 0x7,
                    ul = (Math[xO(0xb69)]() * 0x2 - 0x1) * 0x7;
                  ui[xO(0x7eb)](uk, ul), ui[xO(0xc20)](uk, ul, 0x5, 0x0, l0);
                }
                this[xO(0x747)] = ui;
              }
              (rE[xO(0x74b)] = this[xO(0x30d)](xO(0x203))),
                rE[xO(0x869)](this[xO(0x747)]);
              break;
            case cS[xO(0xd1d)]:
            case cS[xO(0x279)]:
              (rH = this[xO(0x31a)] / 0x1e),
                rE[xO(0x1f7)](rH, rH),
                rE[xO(0x4cc)]();
              const sr = 0x1 / 0x3;
              for (let um = 0x0; um < 0x3; um++) {
                const un = (um / 0x3) * Math["PI"] * 0x2;
                rE[xO(0x7eb)](0x0, 0x0),
                  rE[xO(0xc20)](0x0, 0x0, 0x1e, un, un + Math["PI"] / 0x3);
              }
              (rE[xO(0x452)] = xO(0xa7d)),
                (rE[xO(0x4e5)] = 0xa),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rE[xO(0x74b)] = this[xO(0x30d)](
                  this[xO(0x8ca)] === cS[xO(0xd1d)] ? xO(0x694) : xO(0xa73)
                )),
                rE[xO(0x869)](),
                rE[xO(0x873)]();
              break;
            case cS[xO(0x209)]:
              rF(xO(0xad1), xO(0xac5));
              break;
            case cS[xO(0x804)]:
              rF(xO(0x221), xO(0x5bb));
              break;
            case cS[xO(0xaee)]:
            case cS[xO(0x8d1)]:
              rF(xO(0xedf), xO(0xd9f));
              break;
            case cS[xO(0xce5)]:
              (rH = this[xO(0x31a)] / 0x14),
                rE[xO(0x1f7)](rH, rH),
                rE[xO(0x235)](-Math["PI"] / 0x4);
              const ss = rE[xO(0x4e5)];
              (rE[xO(0x4e5)] *= 1.5),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x14, -0x14 - ss),
                rE[xO(0xa16)](-0x14, 0x0),
                rE[xO(0xa16)](0x14, 0x0),
                rE[xO(0xa16)](0x14, 0x14 + ss),
                rE[xO(0x235)](Math["PI"] / 0x2),
                rE[xO(0x7eb)](-0x14, -0x14 - ss),
                rE[xO(0xa16)](-0x14, 0x0),
                rE[xO(0xa16)](0x14, 0x0),
                rE[xO(0xa16)](0x14, 0x14 + ss),
                (rE[xO(0x452)] = rE[xO(0x452)] = xO(0x8be)),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                rE[xO(0x873)]();
              break;
            case cS[xO(0xd37)]:
              rF(xO(0xdf0), xO(0xdcf));
              break;
            case cS[xO(0xd91)]:
              rF(xO(0x84a), xO(0xeb0));
              break;
            case cS[xO(0x32f)]:
              rF(xO(0xb29), xO(0x688));
              break;
            case cS[xO(0x5aa)]:
              (rH = this[xO(0x31a)] / 0x14),
                rE[xO(0x1f7)](rH, rH),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0x14, 0x0, l0),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xb2c))),
                rE[xO(0x869)](),
                rE[xO(0x8da)](),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb26))),
                rE[xO(0x873)](),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0xcfb))),
                rE[xO(0x869)]();
              break;
            case cS[xO(0x6eb)]:
              (rH = this[xO(0x31a)] / 0x14), rE[xO(0x1f7)](rH, rH);
              const st = (uo, up, uq = ![]) => {
                  const xS = xO;
                  (rE[xS(0x452)] = xS(0xa7d)),
                    (rE[xS(0xbdd)] = this[xS(0x30d)](up)),
                    (rE[xS(0x74b)] = this[xS(0x30d)](uo)),
                    rE[xS(0x4cc)](),
                    rE[xS(0xc20)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rE[xS(0x873)](),
                    rE[xS(0x869)]();
                },
                su = (uo, up) => {
                  const xT = xO;
                  rE[xT(0x94d)](),
                    rE[xT(0x8da)](),
                    (rE[xT(0x452)] = xT(0xa7d)),
                    (rE[xT(0x74b)] = this[xT(0x30d)](uo)),
                    (rE[xT(0xbdd)] = this[xT(0x30d)](up)),
                    rE[xT(0x869)](),
                    rE[xT(0x873)](),
                    rE[xT(0xbad)]();
                };
              (rE[xO(0x452)] = xO(0xa7d)),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                su(xO(0xb2c), xO(0xb26)),
                rE[xO(0x235)](Math["PI"]),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rE[xO(0xc20)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rE[xO(0xc20)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                su(xO(0xedf), xO(0xd9f)),
                rE[xO(0x235)](-Math["PI"]),
                rE[xO(0x4cc)](),
                rE[xO(0xc20)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                su(xO(0xb2c), xO(0xb26));
              break;
            case cS[xO(0x5c6)]:
              this[xO(0xbd6)](rE, this[xO(0x31a)]);
              break;
            case cS[xO(0xe81)]:
              (rH = this[xO(0x31a)] / 0x28),
                rE[xO(0x1f7)](rH, rH),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](-0x1e, -0x1e),
                rE[xO(0xa16)](0x14, 0x0),
                rE[xO(0xa16)](-0x1e, 0x1e),
                rE[xO(0x7b7)](),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xb2c))),
                (rE[xO(0x74b)] = this[xO(0x30d)](xO(0x5d7))),
                rE[xO(0x869)](),
                (rE[xO(0x4e5)] = 0x16),
                (rE[xO(0x452)] = rE[xO(0x401)] = xO(0xa7d)),
                rE[xO(0x873)]();
              break;
            case cS[xO(0xdea)]:
              rE[xO(0x2db)](this[xO(0x31a)] / 0x41),
                rE[xO(0xa21)](-0xa, 0xa),
                (rE[xO(0x401)] = rE[xO(0x452)] = xO(0xa7d)),
                rE[xO(0x94d)](),
                rE[xO(0x4cc)](),
                rE[xO(0x7eb)](0x1e, 0x0),
                rE[xO(0xa21)](
                  0x46 -
                    (Math[xO(0xc44)](
                      Date[xO(0x8ea)]() / 0x190 + 0.8 * this[xO(0xa59)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rE[xO(0xa16)](0x0, 0x0),
                (rE[xO(0x4e5)] = 0x2a),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0xcbd))),
                rE[xO(0x873)](),
                (rE[xO(0xbdd)] = this[xO(0x30d)](xO(0x97b))),
                (rE[xO(0x4e5)] -= 0xc),
                rE[xO(0x873)](),
                rE[xO(0x4cc)]();
              for (let uo = 0x0; uo < 0x2; uo++) {
                rE[xO(0x7eb)](0x9, 0x7),
                  rE[xO(0xa16)](0x28, 0x14),
                  rE[xO(0xa16)](0x7, 0x9),
                  rE[xO(0xa16)](0x9, 0x7),
                  rE[xO(0x1f7)](0x1, -0x1);
              }
              (rE[xO(0x4e5)] = 0x3),
                (rE[xO(0x74b)] = rE[xO(0xbdd)] = xO(0x9ff)),
                rE[xO(0x873)](),
                rE[xO(0x869)](),
                rE[xO(0xbad)](),
                this[xO(0x4c4)](rE);
              break;
            case cS[xO(0x381)]:
              (rH = this[xO(0x31a)] / 0x14), rE[xO(0x1f7)](rH, rH);
              const sv = (up = 0x1, uq, ur) => {
                const xU = xO;
                rE[xU(0x94d)](),
                  rE[xU(0x1f7)](0x1, up),
                  rE[xU(0x4cc)](),
                  rE[xU(0x2ed)](-0x64, 0x0, 0x12c, -0x12c),
                  rE[xU(0x8da)](),
                  rE[xU(0x4cc)](),
                  rE[xU(0x7eb)](-0x14, 0x0),
                  rE[xU(0xe29)](-0x12, -0x19, 0x11, -0xf),
                  (rE[xU(0x452)] = xU(0xa7d)),
                  (rE[xU(0x4e5)] = 0x16),
                  (rE[xU(0xbdd)] = this[xU(0x30d)](ur)),
                  rE[xU(0x873)](),
                  (rE[xU(0x4e5)] = 0xe),
                  (rE[xU(0xbdd)] = this[xU(0x30d)](uq)),
                  rE[xU(0x873)](),
                  rE[xU(0xbad)]();
              };
              sv(0x1, xO(0xc13), xO(0x7de)), sv(-0x1, xO(0xa82), xO(0x5fa));
              break;
            default:
              rE[xO(0x4cc)](),
                rE[xO(0xc20)](0x0, 0x0, this[xO(0x31a)], 0x0, Math["PI"] * 0x2),
                (rE[xO(0x74b)] = xO(0xd13)),
                rE[xO(0x869)](),
                pH(rE, this[xO(0x89d)], 0x14, xO(0x669), 0x3);
          }
          rE[xO(0xbad)](), (this[xO(0x417)] = null);
        }
        [ut(0x5c8)](rE, rF) {
          const xV = ut;
          rF = rF || pN / 0x12c + this[xV(0xa59)] * 0.3;
          const rG = Math[xV(0xc44)](rF) * 0.5 + 0.5;
          rE[xV(0x452)] = xV(0xa7d);
          const rH = 0x4;
          for (let rI = 0x0; rI < 0x2; rI++) {
            rE[xV(0x94d)]();
            if (rI === 0x0) rE[xV(0x4cc)]();
            for (let rJ = 0x0; rJ < 0x2; rJ++) {
              for (let rK = 0x0; rK < rH; rK++) {
                rE[xV(0x94d)](), rI > 0x0 && rE[xV(0x4cc)]();
                const rL = -0.19 - (rK / rH) * Math["PI"] * 0.25;
                rE[xV(0x235)](rL + rG * 0.05), rE[xV(0x7eb)](0x0, 0x0);
                const rM = Math[xV(0xc44)](rF + rK);
                rE[xV(0xa21)](0x1c - (rM * 0.5 + 0.5), 0x0),
                  rE[xV(0x235)](rM * 0.08),
                  rE[xV(0xa16)](0x0, 0x0),
                  rE[xV(0xe29)](0x0, 0x7, 5.5, 0xe),
                  rI > 0x0 &&
                    ((rE[xV(0x4e5)] = 6.5),
                    (rE[xV(0xbdd)] =
                      xV(0x91d) + (0x2f + (rK / rH) * 0x14) + "%)"),
                    rE[xV(0x873)]()),
                  rE[xV(0xbad)]();
              }
              rE[xV(0x1f7)](-0x1, 0x1);
            }
            rI === 0x0 &&
              ((rE[xV(0x4e5)] = 0x9),
              (rE[xV(0xbdd)] = xV(0xa51)),
              rE[xV(0x873)]()),
              rE[xV(0xbad)]();
          }
          rE[xV(0x4cc)](),
            rE[xV(0x428)](
              0x0,
              -0x1e + Math[xV(0xc44)](rF * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rE[xV(0xbdd)] = xV(0xa51)),
            (rE[xV(0x4e5)] = 5.5),
            rE[xV(0x873)](),
            (rE[xV(0x20d)] = 0x5 + rG * 0x8),
            (rE[xV(0x462)] = xV(0x3c9)),
            (rE[xV(0xbdd)] = rE[xV(0x462)]),
            (rE[xV(0x4e5)] = 3.5),
            rE[xV(0x873)](),
            (rE[xV(0x20d)] = 0x0);
        }
        [ut(0x24e)](rE) {
          const xW = ut,
            rF = this[xW(0xaa4)] ? ll[xW(0x76f)] : ll[xW(0xef1)],
            rG = Date[xW(0x8ea)]() / 0x1f4 + this[xW(0xa59)],
            rH = Math[xW(0xc44)](rG) - 0.5;
          rE[xW(0x452)] = rE[xW(0x401)] = xW(0xa7d);
          const rI = 0x46;
          rE[xW(0x94d)](), rE[xW(0x4cc)]();
          for (let rJ = 0x0; rJ < 0x2; rJ++) {
            rE[xW(0x94d)]();
            const rK = rJ * 0x2 - 0x1;
            rE[xW(0x1f7)](0x1, rK),
              rE[xW(0xa21)](0x14, rI),
              rE[xW(0x235)](rH * 0.1),
              rE[xW(0x7eb)](0x0, 0x0),
              rE[xW(0xa16)](-0xa, 0x32),
              rE[xW(0xe29)](0x32, 0x32, 0x64, 0x1e),
              rE[xW(0xe29)](0x32, 0x32, 0x64, 0x1e),
              rE[xW(0xe29)](0x1e, 0x8c, -0x50, 0x78 - rH * 0x14),
              rE[xW(0xe29)](
                -0xa + rH * 0xf,
                0x6e - rH * 0xa,
                -0x28,
                0x50 - rH * 0xa
              ),
              rE[xW(0xe29)](
                -0xa + rH * 0xa,
                0x3c + rH * 0x5,
                -0x3c,
                0x32 - Math[xW(0x49f)](0x0, rH) * 0xa
              ),
              rE[xW(0xe29)](-0xa, 0x14 - rH * 0xa, -0x46, rH * 0xa),
              rE[xW(0xbad)]();
          }
          (rE[xW(0x74b)] = this[xW(0x30d)](rF[xW(0xdd3)])),
            rE[xW(0x869)](),
            (rE[xW(0x4e5)] = 0x12),
            (rE[xW(0xbdd)] = xW(0x525)),
            rE[xW(0x8da)](),
            rE[xW(0x873)](),
            rE[xW(0xbad)](),
            rE[xW(0x94d)](),
            rE[xW(0xa21)](0x50, 0x0),
            rE[xW(0x1f7)](0x2, 0x2),
            rE[xW(0x4cc)]();
          for (let rL = 0x0; rL < 0x2; rL++) {
            rE[xW(0x1f7)](0x1, -0x1),
              rE[xW(0x94d)](),
              rE[xW(0xa21)](0x0, 0xf),
              rE[xW(0x235)]((Math[xW(0xc44)](rG * 0x2) * 0.5 + 0.5) * 0.08),
              rE[xW(0x7eb)](0x0, -0x4),
              rE[xW(0xe29)](0xa, 0x0, 0x14, -0x6),
              rE[xW(0xe29)](0xf, 0x3, 0x0, 0x5),
              rE[xW(0xbad)]();
          }
          (rE[xW(0x74b)] = rE[xW(0xbdd)] = xW(0x9ff)),
            rE[xW(0x869)](),
            (rE[xW(0x4e5)] = 0x6),
            rE[xW(0x873)](),
            rE[xW(0xbad)]();
          for (let rM = 0x0; rM < 0x2; rM++) {
            const rN = rM === 0x0;
            rN && rE[xW(0x4cc)]();
            for (let rO = 0x4; rO >= 0x0; rO--) {
              const rP = rO / 0x5,
                rQ = 0x32 - 0x2d * rP;
              !rN && rE[xW(0x4cc)](),
                rE[xW(0x2ed)](
                  -0x50 - rP * 0x50 - rQ / 0x2,
                  -rQ / 0x2 +
                    Math[xW(0xc44)](rP * Math["PI"] * 0x2 + rG * 0x3) *
                      0x8 *
                      rP,
                  rQ,
                  rQ
                ),
                !rN &&
                  ((rE[xW(0x4e5)] = 0x14),
                  (rE[xW(0x74b)] = rE[xW(0xbdd)] =
                    this[xW(0x30d)](rF[xW(0x7a7)][rO])),
                  rE[xW(0x873)](),
                  rE[xW(0x869)]());
            }
            rN &&
              ((rE[xW(0x4e5)] = 0x22),
              (rE[xW(0xbdd)] = this[xW(0x30d)](rF[xW(0x9ad)])),
              rE[xW(0x873)]());
          }
          rE[xW(0x4cc)](),
            rE[xW(0xc20)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rE[xW(0x74b)] = this[xW(0x30d)](rF[xW(0xc9e)])),
            rE[xW(0x869)](),
            (rE[xW(0x4e5)] = 0x24),
            (rE[xW(0xbdd)] = xW(0x8bb)),
            rE[xW(0x94d)](),
            rE[xW(0x8da)](),
            rE[xW(0x873)](),
            rE[xW(0xbad)](),
            rE[xW(0x94d)]();
          for (let rR = 0x0; rR < 0x2; rR++) {
            rE[xW(0x4cc)]();
            for (let rS = 0x0; rS < 0x2; rS++) {
              rE[xW(0x94d)]();
              const rT = rS * 0x2 - 0x1;
              rE[xW(0x1f7)](0x1, rT),
                rE[xW(0xa21)](0x14, rI),
                rE[xW(0x235)](rH * 0.1),
                rE[xW(0x7eb)](0x0, 0xa),
                rE[xW(0xa16)](-0xa, 0x32),
                rE[xW(0xe29)](0x32, 0x32, 0x64, 0x1e),
                rE[xW(0xe29)](0x32, 0x32, 0x64, 0x1e),
                rE[xW(0xe29)](0x1e, 0x8c, -0x50, 0x78 - rH * 0x14),
                rE[xW(0x7eb)](0x64, 0x1e),
                rE[xW(0xe29)](0x23, 0x5a, -0x28, 0x50 - rH * 0xa),
                rE[xW(0x7eb)](-0xa, 0x32),
                rE[xW(0xe29)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[xW(0x49f)](0x0, rH) * 0xa
                ),
                rE[xW(0xbad)]();
            }
            rR === 0x0
              ? ((rE[xW(0x4e5)] = 0x10),
                (rE[xW(0xbdd)] = this[xW(0x30d)](rF[xW(0x435)])))
              : ((rE[xW(0x4e5)] = 0xa),
                (rE[xW(0xbdd)] = this[xW(0x30d)](rF[xW(0xee1)]))),
              rE[xW(0x873)]();
          }
          rE[xW(0xbad)]();
        }
        [ut(0x94e)](rE, rF, rG, rH) {
          const xX = ut;
          rE[xX(0x94d)]();
          const rI = this[xX(0x31a)] / 0x28;
          rE[xX(0x1f7)](rI, rI),
            (rF = this[xX(0x30d)](rF)),
            (rG = this[xX(0x30d)](rG)),
            (rH = this[xX(0x30d)](rH));
          const rJ = Math["PI"] / 0x5;
          rE[xX(0x452)] = rE[xX(0x401)] = xX(0xa7d);
          const rK = Math[xX(0xc44)](
              Date[xX(0x8ea)]() / 0x12c + this[xX(0xa59)] * 0.2
            ),
            rL = rK * 0.3 + 0.7;
          rE[xX(0x4cc)](),
            rE[xX(0xc20)](0x16, 0x0, 0x17, 0x0, l0),
            rE[xX(0x7eb)](0x0, 0x0),
            rE[xX(0xc20)](-0x5, 0x0, 0x21, 0x0, l0),
            (rE[xX(0x74b)] = this[xX(0x30d)](xX(0x513))),
            rE[xX(0x869)](),
            rE[xX(0x94d)](),
            rE[xX(0xa21)](0x12, 0x0);
          for (let rO = 0x0; rO < 0x2; rO++) {
            rE[xX(0x94d)](),
              rE[xX(0x1f7)](0x1, rO * 0x2 - 0x1),
              rE[xX(0x235)](Math["PI"] * 0.08 * rL),
              rE[xX(0xa21)](-0x12, 0x0),
              rE[xX(0x4cc)](),
              rE[xX(0xc20)](0x0, 0x0, 0x28, Math["PI"], -rJ),
              rE[xX(0xe29)](0x14 - rL * 0x3, -0xf, 0x14, 0x0),
              rE[xX(0x7b7)](),
              (rE[xX(0x74b)] = rF),
              rE[xX(0x869)]();
            const rP = xX(0x774) + rO;
            if (!this[rP]) {
              const rQ = new Path2D();
              for (let rR = 0x0; rR < 0x2; rR++) {
                const rS = (Math[xX(0xb69)]() * 0x2 - 0x1) * 0x28,
                  rT = Math[xX(0xb69)]() * -0x28,
                  rU = Math[xX(0xb69)]() * 0x9 + 0x8;
                rQ[xX(0x7eb)](rS, rT), rQ[xX(0xc20)](rS, rT, rU, 0x0, l0);
              }
              this[rP] = rQ;
            }
            rE[xX(0x8da)](),
              (rE[xX(0x74b)] = rH),
              rE[xX(0x869)](this[rP]),
              rE[xX(0xbad)](),
              (rE[xX(0x4e5)] = 0x7),
              (rE[xX(0xbdd)] = rG),
              rE[xX(0x873)]();
          }
          rE[xX(0xbad)](), rE[xX(0x94d)]();
          let rM = 0x9;
          rE[xX(0xa21)](0x2a, 0x0);
          const rN = Math["PI"] * 0x3 - rK;
          rE[xX(0x4cc)]();
          for (let rV = 0x0; rV < 0x2; rV++) {
            let rW = 0x0,
              rX = 0x8;
            rE[xX(0x7eb)](rW, rX);
            for (let rY = 0x0; rY < rM; rY++) {
              const rZ = rY / rM,
                s0 = rZ * rN,
                s1 = 0xf * (0x1 - rZ),
                s2 = Math[xX(0x77b)](s0) * s1,
                s3 = Math[xX(0xc44)](s0) * s1,
                s4 = rW + s2,
                s5 = rX + s3;
              rE[xX(0xe29)](
                rW + s2 * 0.5 + s3 * 0.25,
                rX + s3 * 0.5 - s2 * 0.25,
                s4,
                s5
              ),
                (rW = s4),
                (rX = s5);
            }
            rE[xX(0x1f7)](0x1, -0x1);
          }
          (rE[xX(0x452)] = rE[xX(0x401)] = xX(0xa7d)),
            (rE[xX(0x4e5)] = 0x2),
            (rE[xX(0xbdd)] = rE[xX(0x74b)]),
            rE[xX(0x873)](),
            rE[xX(0xbad)](),
            rE[xX(0xbad)]();
        }
        [ut(0x789)](rE, rF = 0x64, rG = 0x50, rH = 0x12, rI = 0x8) {
          const xY = ut;
          rE[xY(0x4cc)]();
          const rJ = (0x1 / rH) * Math["PI"] * 0x2;
          rE[xY(0x7eb)](rG, 0x0);
          for (let rK = 0x0; rK < rH; rK++) {
            const rL = rK * rJ,
              rM = (rK + 0x1) * rJ;
            rE[xY(0xa56)](
              Math[xY(0x77b)](rL) * rF,
              Math[xY(0xc44)](rL) * rF,
              Math[xY(0x77b)](rM) * rF,
              Math[xY(0xc44)](rM) * rF,
              Math[xY(0x77b)](rM) * rG,
              Math[xY(0xc44)](rM) * rG
            );
          }
          (rE[xY(0x74b)] = this[xY(0x30d)](xY(0xb87))),
            rE[xY(0x869)](),
            (rE[xY(0x4e5)] = rI),
            (rE[xY(0x452)] = rE[xY(0x401)] = xY(0xa7d)),
            (rE[xY(0xbdd)] = this[xY(0x30d)](xY(0xdd2))),
            rE[xY(0x873)]();
        }
        [ut(0x30d)](rE) {
          const xZ = ut,
            rF = 0x1 - this[xZ(0x5e0)];
          if (
            rF >= 0x1 &&
            this[xZ(0xe05)] === 0x0 &&
            !this[xZ(0x37b)] &&
            !this[xZ(0x412)]
          )
            return rE;
          rE = hA(rE);
          this[xZ(0x37b)] &&
            (rE = hy(
              rE,
              [0xff, 0xff, 0xff],
              0.85 + Math[xZ(0xc44)](pN / 0x32) * 0.15
            ));
          this[xZ(0xe05)] > 0x0 &&
            (rE = hy(rE, [0x8f, 0x5d, 0xb0], 0x1 - this[xZ(0xe05)] * 0.75));
          rE = hy(rE, [0xff, 0x0, 0x0], rF * 0.25 + 0.75);
          if (this[xZ(0x412)]) {
            if (!this[xZ(0x417)]) {
              let rG = pN / 0x4;
              if (!isNaN(this["id"])) rG += this["id"];
              this[xZ(0x417)] = lH(rG % 0x168, 0x64, 0x32);
            }
            rE = hy(rE, this[xZ(0x417)], 0.75);
          }
          return pZ(rE);
        }
        [ut(0x586)](rE) {
          const y0 = ut;
          this[y0(0x417)] = null;
          if (this[y0(0xab6)]) {
            const rF = Math[y0(0xc44)]((this[y0(0xe1e)] * Math["PI"]) / 0x2);
            if (!this[y0(0x8a3)]) {
              const rG = 0x1 + rF * 0x1;
              rE[y0(0x1f7)](rG, rG);
            }
            rE[y0(0x557)] *= 0x1 - rF;
          }
        }
        [ut(0xcb3)](rE, rF = !![], rG = 0x1) {
          const y1 = ut;
          rE[y1(0x4cc)](),
            (rG = 0x8 * rG),
            rE[y1(0x7eb)](0x23, -rG),
            rE[y1(0xe29)](0x33, -0x2 - rG, 0x3c, -0xc - rG),
            rE[y1(0xa16)](0x23, -rG),
            rE[y1(0x7eb)](0x23, rG),
            rE[y1(0xe29)](0x33, 0x2 + rG, 0x3c, 0xc + rG),
            rE[y1(0xa16)](0x23, rG);
          const rH = y1(0xb2c);
          (rE[y1(0x74b)] = rE[y1(0xbdd)] =
            rF ? this[y1(0x30d)](rH) : y1(0xb2c)),
            rE[y1(0x869)](),
            (rE[y1(0x452)] = rE[y1(0x401)] = y1(0xa7d)),
            (rE[y1(0x4e5)] = 0x4),
            rE[y1(0x873)]();
        }
        [ut(0xbd6)](rE, rF, rG = 0x1) {
          const y2 = ut,
            rH = (rF / 0x1e) * 1.1;
          rE[y2(0x1f7)](rH, rH),
            rE[y2(0x4cc)](),
            rE[y2(0x7eb)](-0x1e, -0x11),
            rE[y2(0xa16)](0x1e, 0x0),
            rE[y2(0xa16)](-0x1e, 0x11),
            rE[y2(0x7b7)](),
            (rE[y2(0x74b)] = rE[y2(0xbdd)] = this[y2(0x30d)](y2(0xb2c))),
            rE[y2(0x869)](),
            (rE[y2(0x4e5)] = 0x14 * rG),
            (rE[y2(0x452)] = rE[y2(0x401)] = y2(0xa7d)),
            rE[y2(0x873)]();
        }
        [ut(0x6f7)](rE, rF = 0x0, rG = 0x0, rH = 0x1, rI = 0x5) {
          const y3 = ut;
          rE[y3(0x94d)](),
            rE[y3(0xa21)](rF, rG),
            rE[y3(0x1f7)](rH, rH),
            rE[y3(0x4cc)](),
            rE[y3(0x7eb)](0x23, -0x8),
            rE[y3(0xe29)](0x34, -5.5, 0x3c, -0x14),
            rE[y3(0x7eb)](0x23, 0x8),
            rE[y3(0xe29)](0x34, 5.5, 0x3c, 0x14),
            (rE[y3(0x74b)] = rE[y3(0xbdd)] = this[y3(0x30d)](y3(0xb2c))),
            (rE[y3(0x452)] = rE[y3(0x401)] = y3(0xa7d)),
            (rE[y3(0x4e5)] = rI),
            rE[y3(0x873)](),
            rE[y3(0x4cc)]();
          const rJ = Math["PI"] * 0.165;
          rE[y3(0x428)](0x3c, -0x14, 0x7, 0x9, rJ, 0x0, l0),
            rE[y3(0x428)](0x3c, 0x14, 0x7, 0x9, -rJ, 0x0, l0),
            rE[y3(0x869)](),
            rE[y3(0xbad)]();
        }
      },
      lH = (rE, rF, rG) => {
        const y4 = ut;
        (rF /= 0x64), (rG /= 0x64);
        const rH = (rK) => (rK + rE / 0x1e) % 0xc,
          rI = rF * Math[y4(0xc36)](rG, 0x1 - rG),
          rJ = (rK) =>
            rG -
            rI *
              Math[y4(0x49f)](
                -0x1,
                Math[y4(0xc36)](
                  rH(rK) - 0x3,
                  Math[y4(0xc36)](0x9 - rH(rK), 0x1)
                )
              );
        return [0xff * rJ(0x0), 0xff * rJ(0x8), 0xff * rJ(0x4)];
      };
    function lI(rE) {
      const y5 = ut;
      return -(Math[y5(0x77b)](Math["PI"] * rE) - 0x1) / 0x2;
    }
    function lJ(rE, rF, rG = 0x6, rH = ut(0x669)) {
      const y6 = ut,
        rI = rF / 0x64;
      rE[y6(0x1f7)](rI, rI), rE[y6(0x4cc)]();
      for (let rJ = 0x0; rJ < 0xc; rJ++) {
        rE[y6(0x7eb)](0x0, 0x0);
        const rK = (rJ / 0xc) * Math["PI"] * 0x2;
        rE[y6(0xa16)](Math[y6(0x77b)](rK) * 0x64, Math[y6(0xc44)](rK) * 0x64);
      }
      (rE[y6(0x4e5)] = rG),
        (rE[y6(0x74b)] = rE[y6(0xbdd)] = rH),
        (rE[y6(0x452)] = rE[y6(0x401)] = y6(0xa7d));
      for (let rL = 0x0; rL < 0x5; rL++) {
        const rM = (rL / 0x5) * 0x64 + 0xa;
        lb(rE, 0xc, rM, 0.5, 0.85);
      }
      rE[y6(0x873)]();
    }
    var lK = class {
        constructor(rE, rF, rG, rH, rI) {
          const y7 = ut;
          (this[y7(0x8ca)] = rE),
            (this["id"] = rF),
            (this["x"] = rG),
            (this["y"] = rH),
            (this[y7(0x31a)] = rI),
            (this[y7(0x9d6)] = Math[y7(0xb69)]() * l0),
            (this[y7(0xd42)] = -0x1),
            (this[y7(0xab6)] = ![]),
            (this[y7(0xf37)] = 0x0),
            (this[y7(0xe1e)] = 0x0),
            (this[y7(0xe6e)] = !![]),
            (this[y7(0xb9a)] = 0x0),
            (this[y7(0xa6b)] = !![]);
        }
        [ut(0x915)]() {
          const y8 = ut;
          if (this[y8(0xf37)] < 0x1) {
            this[y8(0xf37)] += pO / 0xc8;
            if (this[y8(0xf37)] > 0x1) this[y8(0xf37)] = 0x1;
          }
          this[y8(0xab6)] && (this[y8(0xe1e)] += pO / 0xc8);
        }
        [ut(0x4a7)](rE) {
          const y9 = ut;
          rE[y9(0x94d)](), rE[y9(0xa21)](this["x"], this["y"]);
          if (this[y9(0x8ca)] === cS[y9(0x857)]) {
            rE[y9(0x235)](this[y9(0x9d6)]);
            const rF = this[y9(0x31a)],
              rG = pE(
                rE,
                y9(0x6f9) + this[y9(0x31a)],
                rF * 2.2,
                rF * 2.2,
                (rI) => {
                  const ya = y9;
                  rI[ya(0xa21)](rF * 1.1, rF * 1.1), lJ(rI, rF);
                },
                !![]
              ),
              rH = this[y9(0xf37)] + this[y9(0xe1e)] * 0.5;
            (rE[y9(0x557)] = (0x1 - this[y9(0xe1e)]) * 0.3),
              rE[y9(0x1f7)](rH, rH),
              rE[y9(0xd33)](
                rG,
                -rG[y9(0x89e)] / 0x2,
                -rG[y9(0x5ab)] / 0x2,
                rG[y9(0x89e)],
                rG[y9(0x5ab)]
              );
          } else {
            if (this[y9(0x8ca)] === cS[y9(0xd48)]) {
              let rI = this[y9(0xf37)] + this[y9(0xe1e)] * 0.5;
              (rE[y9(0x557)] = 0x1 - this[y9(0xe1e)]), (rE[y9(0x557)] *= 0.9);
              const rJ =
                0.93 +
                0.07 *
                  (Math[y9(0xc44)](
                    Date[y9(0x8ea)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              rI *= rJ;
              const rK = this[y9(0x31a)],
                rL = pE(
                  rE,
                  y9(0x92b) + this[y9(0x31a)],
                  rK * 2.2,
                  rK * 2.2,
                  (rM) => {
                    const yb = y9;
                    rM[yb(0xa21)](rK * 1.1, rK * 1.1);
                    const rN = rK / 0x64;
                    rM[yb(0x1f7)](rN, rN),
                      lE(rM, 0x5c),
                      (rM[yb(0x401)] = rM[yb(0x452)] = yb(0xa7d)),
                      (rM[yb(0x4e5)] = 0x28),
                      (rM[yb(0xbdd)] = yb(0x78a)),
                      rM[yb(0x873)](),
                      (rM[yb(0x74b)] = yb(0x442)),
                      (rM[yb(0xbdd)] = yb(0x95b)),
                      (rM[yb(0x4e5)] = 0xe),
                      rM[yb(0x869)](),
                      rM[yb(0x873)]();
                  },
                  !![]
                );
              rE[y9(0x1f7)](rI, rI),
                rE[y9(0xd33)](
                  rL,
                  -rL[y9(0x89e)] / 0x2,
                  -rL[y9(0x5ab)] / 0x2,
                  rL[y9(0x89e)],
                  rL[y9(0x5ab)]
                );
            } else {
              if (this[y9(0x8ca)] === cS[y9(0x699)]) {
                rE[y9(0x2db)](this[y9(0x31a)] / 0x32),
                  (rE[y9(0x401)] = y9(0xa7d)),
                  rE[y9(0x94d)](),
                  (this[y9(0xb9a)] +=
                    ((this[y9(0xd42)] >= 0x0 ? 0x1 : -0x1) * pO) / 0x12c),
                  (this[y9(0xb9a)] = Math[y9(0xc36)](
                    0x1,
                    Math[y9(0x49f)](0x0, this[y9(0xb9a)])
                  ));
                if (this[y9(0xb9a)] > 0x0) {
                  rE[y9(0x2db)](this[y9(0xb9a)]),
                    (rE[y9(0x557)] *= this[y9(0xb9a)]),
                    (rE[y9(0x4e5)] = 0.1),
                    (rE[y9(0xbdd)] = rE[y9(0x74b)] = y9(0x272)),
                    (rE[y9(0x287)] = y9(0xdd4)),
                    (rE[y9(0xadf)] = y9(0xeb5) + iA);
                  const rN = y9(0x256) + (this[y9(0xd42)] + 0x1);
                  lR(
                    rE,
                    rN,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rN[y9(0xed7)] * 0.09),
                    !![]
                  );
                }
                rE[y9(0xbad)]();
                const rM = this[y9(0xcd1)]
                  ? 0.6
                  : ((this["id"] + Date[y9(0x8ea)]()) / 0x4b0) % 6.28;
                rE[y9(0x94d)]();
                for (let rO = 0x0; rO < 0x8; rO++) {
                  const rP = 0x1 - rO / 0x8,
                    rQ = rP * 0x50;
                  rE[y9(0x235)](rM),
                    (rE[y9(0xbdd)] = y9(0xcf5)),
                    rE[y9(0x4cc)](),
                    rE[y9(0x2ed)](-rQ / 0x2, -rQ / 0x2, rQ, rQ),
                    rE[y9(0x7b7)](),
                    (rE[y9(0x4e5)] = 0x28),
                    rE[y9(0x873)](),
                    (rE[y9(0x4e5)] = 0x14),
                    rE[y9(0x873)]();
                }
                rE[y9(0xbad)]();
                if (!this[y9(0x7c2)]) {
                  this[y9(0x7c2)] = [];
                  for (let rR = 0x0; rR < 0x1e; rR++) {
                    this[y9(0x7c2)][y9(0xbc0)]({
                      x: Math[y9(0xb69)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rS = 0x0; rS < this[y9(0x7c2)][y9(0xed7)]; rS++) {
                  const rT = this[y9(0x7c2)][rS];
                  (rT["x"] += rT["v"]),
                    rT["x"] > 0x1 &&
                      ((rT["x"] %= 0x1),
                      (rT[y9(0x9d6)] = Math[y9(0xb69)]() * 6.28),
                      (rT["v"] = Math[y9(0xb69)]() * 0.005 + 0.008),
                      (rT["s"] = Math[y9(0xb69)]() * 0.025 + 0.008)),
                    rE[y9(0x94d)](),
                    (rE[y9(0x557)] =
                      rT["x"] < 0.2
                        ? rT["x"] / 0.2
                        : rT["x"] > 0.8
                        ? 0x1 - (rT["x"] - 0.8) / 0.2
                        : 0x1),
                    rE[y9(0x1f7)](0x5a, 0x5a),
                    rE[y9(0x235)](rT[y9(0x9d6)]),
                    rE[y9(0xa21)](rT["x"], 0x0),
                    rE[y9(0x4cc)](),
                    rE[y9(0xc20)](0x0, 0x0, rT["s"], 0x0, Math["PI"] * 0x2),
                    (rE[y9(0x74b)] = y9(0x272)),
                    rE[y9(0x869)](),
                    rE[y9(0xbad)]();
                }
              }
            }
          }
          rE[y9(0xbad)]();
        }
      },
      lL = 0x0,
      lM = 0x0,
      lN = class extends lK {
        constructor(rE, rF, rG, rH) {
          const yc = ut;
          super(cS[yc(0x3db)], rE, rF, rG, 0x46),
            (this[yc(0x9d6)] = (Math[yc(0xb69)]() * 0x2 - 0x1) * 0.2),
            (this[yc(0x558)] = dC[rH]);
        }
        [ut(0x915)]() {
          const yd = ut;
          if (this[yd(0xf37)] < 0x2 || pN - lL < 0x9c4) {
            this[yd(0xf37)] += pO / 0x12c;
            return;
          }
          this[yd(0xab6)] && (this[yd(0xe1e)] += pO / 0xc8),
            this[yd(0x54d)] &&
              ((this["x"] = pu(this["x"], this[yd(0x54d)]["x"], 0xc8)),
              (this["y"] = pu(this["y"], this[yd(0x54d)]["y"], 0xc8)));
        }
        [ut(0x4a7)](rE) {
          const ye = ut;
          if (this[ye(0xf37)] === 0x0) return;
          rE[ye(0x94d)](), rE[ye(0xa21)](this["x"], this["y"]);
          const rF = ye(0x31c) + this[ye(0x558)]["id"];
          let rG =
            (this[ye(0x9e3)] || lM < 0x3) &&
            pE(
              rE,
              rF,
              0x78,
              0x78,
              (rJ) => {
                const yf = ye;
                (this[yf(0x9e3)] = !![]),
                  lM++,
                  rJ[yf(0xa21)](0x3c, 0x3c),
                  (rJ[yf(0x452)] = rJ[yf(0x401)] = yf(0xa7d)),
                  rJ[yf(0x4cc)](),
                  rJ[yf(0x2ed)](-0x32, -0x32, 0x64, 0x64),
                  (rJ[yf(0x4e5)] = 0x12),
                  (rJ[yf(0xbdd)] = yf(0x8b6)),
                  rJ[yf(0x873)](),
                  (rJ[yf(0x4e5)] = 0x8),
                  (rJ[yf(0x74b)] = hQ[this[yf(0x558)][yf(0x23b)]]),
                  rJ[yf(0x869)](),
                  (rJ[yf(0xbdd)] = hR[this[yf(0x558)][yf(0x23b)]]),
                  rJ[yf(0x873)]();
                const rK = pH(
                  rJ,
                  this[yf(0x558)][yf(0x4d2)],
                  0x12,
                  yf(0x669),
                  0x3,
                  !![]
                );
                rJ[yf(0xd33)](
                  rK,
                  -rK[yf(0x89e)] / 0x2,
                  0x32 - 0xd / 0x2 - rK[yf(0x5ab)],
                  rK[yf(0x89e)],
                  rK[yf(0x5ab)]
                ),
                  rJ[yf(0x94d)](),
                  rJ[yf(0xa21)](
                    0x0 + this[yf(0x558)][yf(0xbe8)],
                    -0x5 + this[yf(0x558)][yf(0xf4a)]
                  ),
                  this[yf(0x558)][yf(0x34b)](rJ),
                  rJ[yf(0xbad)]();
              },
              !![]
            );
          if (!rG) rG = pD[rF];
          rE[ye(0x235)](this[ye(0x9d6)]);
          const rH = Math[ye(0xc36)](this[ye(0xf37)], 0x1),
            rI =
              (this[ye(0x31a)] / 0x64) *
              (0x1 +
                Math[ye(0xc44)](Date[ye(0x8ea)]() / 0xfa + this["id"]) * 0.05) *
              rH *
              (0x1 - this[ye(0xe1e)]);
          rE[ye(0x1f7)](rI, rI),
            rE[ye(0x235)](Math["PI"] * lI(0x1 - rH)),
            rG
              ? rE[ye(0xd33)](
                  rG,
                  -rG[ye(0x89e)] / 0x2,
                  -rG[ye(0x5ab)] / 0x2,
                  rG[ye(0x89e)],
                  rG[ye(0x5ab)]
                )
              : (rE[ye(0x4cc)](),
                rE[ye(0x2ed)](-0x3c, -0x3c, 0x78, 0x78),
                (rE[ye(0x74b)] = hQ[this[ye(0x558)][ye(0x23b)]]),
                rE[ye(0x869)]()),
            rE[ye(0xbad)]();
        }
      };
    function lO(rE) {
      const yg = ut;
      rE[yg(0x4cc)](),
        rE[yg(0x7eb)](0x0, 4.5),
        rE[yg(0xe29)](3.75, 0x0, 0x0, -4.5),
        rE[yg(0xe29)](-3.75, 0x0, 0x0, 4.5),
        rE[yg(0x7b7)](),
        (rE[yg(0x452)] = rE[yg(0x401)] = yg(0xa7d)),
        (rE[yg(0x74b)] = rE[yg(0xbdd)] = yg(0x9ff)),
        (rE[yg(0x4e5)] = 0x1),
        rE[yg(0x873)](),
        rE[yg(0x869)](),
        rE[yg(0x8da)](),
        rE[yg(0x4cc)](),
        rE[yg(0xc20)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, l0),
        (rE[yg(0x74b)] = yg(0x684)),
        rE[yg(0x869)]();
    }
    function lP(rE, rF = ![]) {
      const yh = ut;
      lQ(rE, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lQ(rE, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rF) {
        const rG = Math["PI"] / 0x7;
        rE[yh(0x4cc)](),
          rE[yh(0xc20)](0x0, 0x0, 23.5, Math["PI"] + rG, Math["PI"] * 0x2 - rG),
          (rE[yh(0xbdd)] = yh(0x207)),
          (rE[yh(0x4e5)] = 0x4),
          (rE[yh(0x452)] = yh(0xa7d)),
          rE[yh(0x873)]();
      }
    }
    function lQ(rE, rF, rG) {
      const yi = ut;
      rE[yi(0x94d)](),
        rE[yi(0x235)](rF),
        rE[yi(0xa21)](0x0, -23.6),
        rE[yi(0x235)](rG),
        rE[yi(0x4cc)](),
        rE[yi(0x7eb)](-6.5, 0x1),
        rE[yi(0xa16)](0x0, -0xf),
        rE[yi(0xa16)](6.5, 0x1),
        (rE[yi(0x74b)] = yi(0xe0c)),
        (rE[yi(0x4e5)] = 3.5),
        rE[yi(0x869)](),
        (rE[yi(0x401)] = yi(0xa7d)),
        (rE[yi(0xbdd)] = yi(0x207)),
        rE[yi(0x873)](),
        rE[yi(0xbad)]();
    }
    function lR(rE, rF, rG, rH, rI, rJ, rK = ![]) {
      const yj = ut;
      var rL = rF[yj(0xed7)],
        rM;
      rE[yj(0x94d)](),
        rE[yj(0xa21)](rG, rH),
        rE[yj(0x235)]((0x1 * rJ) / 0x2),
        rE[yj(0x235)]((0x1 * (rJ / rL)) / 0x2),
        (rE[yj(0x74c)] = yj(0x293));
      for (var rN = 0x0; rN < rL; rN++) {
        rE[yj(0x235)](-rJ / rL),
          rE[yj(0x94d)](),
          rE[yj(0xa21)](0x0, rI),
          (rM = rF[rN]),
          rK && rE[yj(0xcde)](rM, 0x0, 0x0),
          rE[yj(0x6e6)](rM, 0x0, 0x0),
          rE[yj(0xbad)]();
      }
      rE[yj(0xbad)]();
    }
    function lS(rE, rF = 0x1) {
      const yk = ut,
        rG = 0xf;
      rE[yk(0x4cc)]();
      const rH = 0x6;
      for (let rM = 0x0; rM < rH; rM++) {
        const rN = (rM / rH) * Math["PI"] * 0x2;
        rE[yk(0xa16)](Math[yk(0x77b)](rN) * rG, Math[yk(0xc44)](rN) * rG);
      }
      rE[yk(0x7b7)](),
        (rE[yk(0x4e5)] = 0x4),
        (rE[yk(0xbdd)] = yk(0xf09)),
        rE[yk(0x873)](),
        (rE[yk(0x74b)] = yk(0xdd5)),
        rE[yk(0x869)]();
      const rI = (Math["PI"] * 0x2) / rH,
        rJ = Math[yk(0x77b)](rI) * rG,
        rK = Math[yk(0xc44)](rI) * rG;
      for (let rO = 0x0; rO < rH; rO++) {
        rE[yk(0x4cc)](),
          rE[yk(0x7eb)](0x0, 0x0),
          rE[yk(0xa16)](rG, 0x0),
          rE[yk(0xa16)](rJ, rK),
          rE[yk(0x7b7)](),
          (rE[yk(0x74b)] =
            yk(0x4e8) + (0.2 + (((rO + 0x4) % rH) / rH) * 0.35) + ")"),
          rE[yk(0x869)](),
          rE[yk(0x235)](rI);
      }
      rE[yk(0x4cc)]();
      const rL = rG * 0.65;
      for (let rP = 0x0; rP < rH; rP++) {
        const rQ = (rP / rH) * Math["PI"] * 0x2;
        rE[yk(0xa16)](Math[yk(0x77b)](rQ) * rL, Math[yk(0xc44)](rQ) * rL);
      }
      (rE[yk(0x20d)] = 0x23 + rF * 0xf),
        (rE[yk(0x462)] = rE[yk(0x74b)] = yk(0xe19)),
        rE[yk(0x869)](),
        rE[yk(0x869)](),
        rE[yk(0x869)]();
    }
    var lT = class extends lG {
        constructor(rE, rF, rG, rH, rI, rJ, rK) {
          const yl = ut;
          super(rE, cS[yl(0x455)], rF, rG, rH, rK, rI),
            (this[yl(0x5be)] = rJ),
            (this[yl(0x998)] = 0x0),
            (this[yl(0x6d8)] = 0x0),
            (this[yl(0x283)] = 0x0),
            (this[yl(0x68b)] = 0x0),
            (this[yl(0x486)] = ""),
            (this[yl(0xd47)] = 0x0),
            (this[yl(0x7e9)] = !![]),
            (this[yl(0xe21)] = ![]),
            (this[yl(0x415)] = ![]),
            (this[yl(0x51d)] = ![]),
            (this[yl(0x3b3)] = ![]),
            (this[yl(0x352)] = ![]),
            (this[yl(0xbca)] = !![]),
            (this[yl(0xebe)] = 0x0),
            (this[yl(0xe6c)] = 0x0);
        }
        [ut(0x915)]() {
          const ym = ut;
          super[ym(0x915)]();
          if (this[ym(0xab6)]) (this[ym(0x6d8)] = 0x1), (this[ym(0x998)] = 0x0);
          else {
            const rE = pO / 0xc8;
            let rF = this[ym(0x5be)];
            if (this[ym(0xe21)] && rF === cY[ym(0x987)]) rF = cY[ym(0x5d4)];
            (this[ym(0x998)] = Math[ym(0xc36)](
              0x1,
              Math[ym(0x49f)](
                0x0,
                this[ym(0x998)] + (rF === cY[ym(0xb83)] ? rE : -rE)
              )
            )),
              (this[ym(0x6d8)] = Math[ym(0xc36)](
                0x1,
                Math[ym(0x49f)](
                  0x0,
                  this[ym(0x6d8)] + (rF === cY[ym(0x5d4)] ? rE : -rE)
                )
              )),
              (this[ym(0xebe)] = pu(this[ym(0xebe)], this[ym(0xe6c)], 0x64));
          }
        }
        [ut(0x4a7)](rE) {
          const yn = ut;
          rE[yn(0x94d)](), rE[yn(0xa21)](this["x"], this["y"]);
          let rF = this[yn(0x31a)] / kZ;
          this[yn(0xab6)] &&
            rE[yn(0x235)]((this[yn(0xe1e)] * Math["PI"]) / 0x4);
          rE[yn(0x1f7)](rF, rF), this[yn(0x586)](rE);
          this[yn(0x7c1)] &&
            (rE[yn(0x94d)](),
            rE[yn(0x235)](this[yn(0x9d6)]),
            rE[yn(0x2db)](this[yn(0x31a)] / 0x28 / rF),
            this[yn(0x6e5)](rE),
            rE[yn(0xbad)]());
          this[yn(0x2f7)] &&
            (rE[yn(0x94d)](),
            rE[yn(0x2db)](kZ / 0x12),
            this[yn(0x5c8)](rE, pN / 0x12c),
            rE[yn(0xbad)]());
          const rG = yn(0x207);
          if (this[yn(0x9d2)]) {
            const rQ = Date[yn(0x8ea)](),
              rR = (Math[yn(0xc44)](rQ / 0x12c) * 0.5 + 0.5) * 0x2;
            rE[yn(0x4cc)](),
              rE[yn(0x7eb)](0x5, -0x22),
              rE[yn(0xa56)](0x2f, -0x19, 0x14, 0x5, 0x2b - rR, 0x19),
              rE[yn(0xe29)](0x0, 0x28 + rR * 0.6, -0x2b + rR, 0x19),
              rE[yn(0xa56)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rE[yn(0xe29)](0x0, -0x23, 0x5, -0x22),
              (rE[yn(0x74b)] = rG),
              rE[yn(0x869)]();
          }
          this[yn(0x352)] && lP(rE);
          const rH = this[yn(0x3b3)]
            ? [yn(0x513), yn(0xb2c)]
            : this[yn(0x5e9)]
            ? [yn(0xec5), yn(0x691)]
            : [yn(0xad1), yn(0xac5)];
          (rH[0x0] = this[yn(0x30d)](rH[0x0])),
            (rH[0x1] = this[yn(0x30d)](rH[0x1]));
          let rI = 2.75;
          !this[yn(0x5e9)] && (rI /= rF);
          (rE[yn(0x74b)] = rH[0x0]),
            (rE[yn(0x4e5)] = rI),
            (rE[yn(0xbdd)] = rH[0x1]);
          this[yn(0x5e9)] &&
            (rE[yn(0x4cc)](),
            rE[yn(0x7eb)](0x0, 0x0),
            rE[yn(0xe29)](-0x1e, 0xf, -0x1e, 0x1e),
            rE[yn(0xe29)](0x0, 0x37, 0x1e, 0x1e),
            rE[yn(0xe29)](0x1e, 0xf, 0x0, 0x0),
            rE[yn(0x869)](),
            rE[yn(0x873)](),
            rE[yn(0x94d)](),
            (rE[yn(0x74b)] = rE[yn(0xbdd)]),
            (rE[yn(0x287)] = yn(0xdd4)),
            (rE[yn(0xadf)] = yn(0xd12) + iA),
            lR(rE, yn(0xf0b), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rE[yn(0xbad)]());
          rE[yn(0x4cc)]();
          this[yn(0xb40)]
            ? !this[yn(0x9d2)]
              ? rE[yn(0x2ed)](-0x19, -0x19, 0x32, 0x32)
              : (rE[yn(0x7eb)](0x19, 0x19),
                rE[yn(0xa16)](-0x19, 0x19),
                rE[yn(0xa16)](-0x19, -0xa),
                rE[yn(0xa16)](-0xa, -0x19),
                rE[yn(0xa16)](0xa, -0x19),
                rE[yn(0xa16)](0x19, -0xa),
                rE[yn(0x7b7)]())
            : rE[yn(0xc20)](0x0, 0x0, kZ, 0x0, l0);
          rE[yn(0x869)](), rE[yn(0x873)]();
          this[yn(0x72d)] &&
            (rE[yn(0x94d)](),
            rE[yn(0x8da)](),
            rE[yn(0x4cc)](),
            !this[yn(0x9d2)] &&
              (rE[yn(0x7eb)](-0x8, -0x1e),
              rE[yn(0xa16)](0xf, -0x7),
              rE[yn(0xa16)](0x1e, -0x14),
              rE[yn(0xa16)](0x1e, -0x32)),
            rE[yn(0xa21)](
              0x0,
              0x2 * (0x1 - (this[yn(0x6d8)] + this[yn(0x998)]))
            ),
            rE[yn(0x7eb)](-0x2, 0x0),
            rE[yn(0xa16)](-0x3, 4.5),
            rE[yn(0xa16)](0x3, 4.5),
            rE[yn(0xa16)](0x2, 0x0),
            (rE[yn(0x74b)] = yn(0x9ff)),
            rE[yn(0x869)](),
            rE[yn(0xbad)]());
          this[yn(0x9d2)] &&
            (rE[yn(0x4cc)](),
            rE[yn(0x7eb)](0x0, -0x17),
            rE[yn(0xe29)](0x4, -0xd, 0x1b, -0x8),
            rE[yn(0xa16)](0x14, -0x1c),
            rE[yn(0xa16)](-0x14, -0x1c),
            rE[yn(0xa16)](-0x1b, -0x8),
            rE[yn(0xe29)](-0x4, -0xd, 0x0, -0x17),
            (rE[yn(0x74b)] = rG),
            rE[yn(0x869)]());
          if (this[yn(0x914)]) {
            (rE[yn(0xbdd)] = yn(0x2f1)),
              (rE[yn(0x4e5)] = 1.4),
              rE[yn(0x4cc)](),
              (rE[yn(0x452)] = yn(0xa7d));
            const rS = 4.5;
            for (let rT = 0x0; rT < 0x2; rT++) {
              const rU = -0x12 + rT * 0x1d;
              for (let rV = 0x0; rV < 0x3; rV++) {
                const rW = rU + rV * 0x3;
                rE[yn(0x7eb)](rW, rS + -1.5), rE[yn(0xa16)](rW + 1.6, rS + 1.6);
              }
            }
            rE[yn(0x873)]();
          }
          if (this[yn(0xe33)]) {
            rE[yn(0x4cc)](),
              rE[yn(0xc20)](0x0, 2.5, 3.3, 0x0, l0),
              (rE[yn(0x74b)] = yn(0xdfb)),
              rE[yn(0x869)](),
              rE[yn(0x4cc)](),
              rE[yn(0xc20)](0xd, 2.8, 5.5, 0x0, l0),
              rE[yn(0xc20)](-0xd, 2.8, 5.5, 0x0, l0),
              (rE[yn(0x74b)] = yn(0xb7d)),
              rE[yn(0x869)](),
              rE[yn(0x94d)](),
              rE[yn(0x235)](-Math["PI"] / 0x4),
              rE[yn(0x4cc)]();
            const rX = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[yn(0xb40)] &&
              rX[yn(0xaa2)]((rY) => {
                (rY[0x0] *= 1.1), (rY[0x1] *= 1.1);
              });
            for (let rY = 0x0; rY < 0x2; rY++) {
              for (let rZ = 0x0; rZ < rX[yn(0xed7)]; rZ++) {
                const s0 = rX[rZ];
                rE[yn(0x7eb)](s0[0x0], s0[0x1]), rE[yn(0xc20)](...s0, 0x0, l0);
              }
              rE[yn(0x235)](-Math["PI"] / 0x2);
            }
            (rE[yn(0x74b)] = yn(0x5cd)), rE[yn(0x869)](), rE[yn(0xbad)]();
          }
          const rJ = this[yn(0x998)],
            rK = this[yn(0x6d8)],
            rL = 0x6 * rJ,
            rM = 0x4 * rK;
          function rN(s1, s3) {
            const yo = yn;
            rE[yo(0x4cc)]();
            const s4 = 3.25;
            rE[yo(0x7eb)](s1 - s4, s3 - s4),
              rE[yo(0xa16)](s1 + s4, s3 + s4),
              rE[yo(0x7eb)](s1 + s4, s3 - s4),
              rE[yo(0xa16)](s1 - s4, s3 + s4),
              (rE[yo(0x4e5)] = 0x2),
              (rE[yo(0x452)] = yo(0xa7d)),
              (rE[yo(0xbdd)] = yo(0x9ff)),
              rE[yo(0x873)](),
              rE[yo(0x7b7)]();
          }
          function rO(s1, s2) {
            const yp = yn;
            rE[yp(0x94d)](),
              rE[yp(0xa21)](s1, s2),
              rE[yp(0x4cc)](),
              rE[yp(0x7eb)](-0x4, 0x0),
              rE[yp(0xe29)](0x0, 0x6, 0x4, 0x0),
              (rE[yp(0x4e5)] = 0x2),
              (rE[yp(0x452)] = yp(0xa7d)),
              (rE[yp(0xbdd)] = yp(0x9ff)),
              rE[yp(0x873)](),
              rE[yp(0xbad)]();
          }
          if (this[yn(0xab6)]) rN(0x7, -0x5), rN(-0x7, -0x5);
          else {
            if (this[yn(0x933)]) rO(0x7, -0x5), rO(-0x7, -0x5);
            else {
              let s1 = function (s3, s4, s5, s6, s7 = 0x0) {
                  const yq = yn,
                    s8 = s7 ^ 0x1;
                  rE[yq(0x7eb)](s3 - s5, s4 - s6 + s7 * rL + s8 * rM),
                    rE[yq(0xa16)](s3 + s5, s4 - s6 + s8 * rL + s7 * rM),
                    rE[yq(0xa16)](s3 + s5, s4 + s6),
                    rE[yq(0xa16)](s3 - s5, s4 + s6),
                    rE[yq(0xa16)](s3 - s5, s4 - s6);
                },
                s2 = function (s3 = 0x0) {
                  const yr = yn;
                  rE[yr(0x4cc)](),
                    rE[yr(0x428)](0x7, -0x5, 2.5 + s3, 0x6 + s3, 0x0, 0x0, l0),
                    rE[yr(0x7eb)](-0x7, -0x5),
                    rE[yr(0x428)](-0x7, -0x5, 2.5 + s3, 0x6 + s3, 0x0, 0x0, l0),
                    (rE[yr(0xbdd)] = rE[yr(0x74b)] = yr(0x9ff)),
                    rE[yr(0x869)]();
                };
              rE[yn(0x94d)](),
                rE[yn(0x4cc)](),
                s1(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                s1(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rE[yn(0x8da)](),
                s2(0.7),
                s2(0x0),
                rE[yn(0x8da)](),
                rE[yn(0x4cc)](),
                rE[yn(0xc20)](
                  0x7 + this[yn(0x283)] * 0x2,
                  -0x5 + this[yn(0x68b)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                rE[yn(0x7eb)](-0x7, -0x5),
                rE[yn(0xc20)](
                  -0x7 + this[yn(0x283)] * 0x2,
                  -0x5 + this[yn(0x68b)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                (rE[yn(0x74b)] = yn(0x684)),
                rE[yn(0x869)](),
                rE[yn(0xbad)]();
            }
          }
          if (this[yn(0x51d)]) {
            rE[yn(0x94d)](), rE[yn(0xa21)](0x0, -0xc);
            if (this[yn(0xab6)]) rE[yn(0x1f7)](0.7, 0.7), rN(0x0, -0x3);
            else
              this[yn(0x933)]
                ? (rE[yn(0x1f7)](0.7, 0.7), rO(0x0, -0x3))
                : lO(rE);
            rE[yn(0xbad)]();
          }
          this[yn(0x415)] &&
            (rE[yn(0x94d)](),
            rE[yn(0xa21)](0x0, 0xa),
            rE[yn(0x235)](-Math["PI"] / 0x2),
            rE[yn(0x1f7)](0.82, 0.82),
            this[yn(0xcb3)](rE, ![], 0.85),
            rE[yn(0xbad)]());
          const rP = rJ * (-0x5 - 5.5) + rK * (-0x5 - 0x4);
          rE[yn(0x94d)](),
            rE[yn(0x4cc)](),
            rE[yn(0xa21)](0x0, 9.5),
            rE[yn(0x7eb)](-5.6, 0x0),
            rE[yn(0xe29)](0x0, 0x5 + rP, 5.6, 0x0),
            (rE[yn(0x452)] = yn(0xa7d));
          this[yn(0xe33)]
            ? ((rE[yn(0x4e5)] = 0x7),
              (rE[yn(0xbdd)] = yn(0xdfb)),
              rE[yn(0x873)](),
              (rE[yn(0xbdd)] = yn(0x358)))
            : (rE[yn(0xbdd)] = yn(0x9ff));
          (rE[yn(0x4e5)] = 1.75), rE[yn(0x873)](), rE[yn(0xbad)]();
          if (this[yn(0xaac)]) {
            const s3 = this[yn(0x998)],
              s4 = 0x28,
              s5 = Date[yn(0x8ea)]() / 0x12c,
              s6 = this[yn(0x5e9)] ? 0x0 : Math[yn(0xc44)](s5) * 0.5 + 0.5,
              s7 = s6 * 0x4,
              s8 = 0x28 - s6 * 0x4,
              s9 = s8 - (this[yn(0x5e9)] ? 0x1 : jf(s3)) * 0x50,
              sa = this[yn(0x72d)];
            (rE[yn(0x4e5)] = 0x9 + rI * 0x2),
              (rE[yn(0x401)] = yn(0xa7d)),
              (rE[yn(0x452)] = yn(0xa7d));
            for (let sb = 0x0; sb < 0x2; sb++) {
              rE[yn(0x4cc)](), rE[yn(0x94d)]();
              for (let sc = 0x0; sc < 0x2; sc++) {
                rE[yn(0x7eb)](0x19, 0x0);
                let se = s9;
                sa && sc === 0x0 && (se = s8),
                  rE[yn(0xe29)](0x2d + s7, se * 0.5, 0xb, se),
                  rE[yn(0x1f7)](-0x1, 0x1);
              }
              rE[yn(0xbad)](),
                (rE[yn(0xbdd)] = rH[0x1 - sb]),
                rE[yn(0x873)](),
                (rE[yn(0x4e5)] = 0x9);
            }
            rE[yn(0x94d)](),
              rE[yn(0xa21)](0x0, s9),
              lS(rE, s6),
              rE[yn(0xbad)]();
          }
          rE[yn(0xbad)]();
        }
        [ut(0xa46)](rE, rF) {}
        [ut(0xcc2)](rE, rF = 0x1) {
          const ys = ut,
            rG = ni[this["id"]];
          if (!rG) return;
          for (let rH = 0x0; rH < rG[ys(0xed7)]; rH++) {
            const rI = rG[rH];
            if (rI["t"] > lV + lW) continue;
            !rI["x"] &&
              ((rI["x"] = this["x"]),
              (rI["y"] = this["y"] - this[ys(0x31a)] - 0x44),
              (rI[ys(0x6a9)] = this["x"]),
              (rI[ys(0x418)] = this["y"]));
            const rJ = rI["t"] > lV ? 0x1 - (rI["t"] - lV) / lW : 0x1,
              rK = rJ * rJ * rJ;
            (rI["x"] += (this["x"] - rI[ys(0x6a9)]) * rK),
              (rI["y"] += (this["y"] - rI[ys(0x418)]) * rK),
              (rI[ys(0x6a9)] = this["x"]),
              (rI[ys(0x418)] = this["y"]);
            const rL = Math[ys(0xc36)](0x1, rI["t"] / 0x64);
            rE[ys(0x94d)](),
              (rE[ys(0x557)] = (rJ < 0.7 ? rJ / 0.7 : 0x1) * rL * 0.9),
              rE[ys(0xa21)](rI["x"], rI["y"] - (rI["t"] / lV) * 0x14),
              rE[ys(0x2db)](rF);
            const rM = pH(rE, rI[ys(0xe72)], 0x10, ys(0xc1e), 0x0, !![], ![]);
            rE[ys(0x2db)](rL), rE[ys(0x4cc)]();
            const rN = rM[ys(0x89e)] + 0xa,
              rO = rM[ys(0x5ab)] + 0xf;
            rE[ys(0xca5)]
              ? rE[ys(0xca5)](-rN / 0x2, -rO / 0x2, rN, rO, 0x5)
              : rE[ys(0x2ed)](-rN / 0x2, -rO / 0x2, rN, rO),
              (rE[ys(0x74b)] = rI[ys(0x992)]),
              rE[ys(0x869)](),
              (rE[ys(0xbdd)] = ys(0xc1e)),
              (rE[ys(0x4e5)] = 1.5),
              rE[ys(0x873)](),
              rE[ys(0xd33)](
                rM,
                -rM[ys(0x89e)] / 0x2,
                -rM[ys(0x5ab)] / 0x2,
                rM[ys(0x89e)],
                rM[ys(0x5ab)]
              ),
              rE[ys(0xbad)]();
          }
        }
      },
      lU = 0x4e20,
      lV = 0xfa0,
      lW = 0xbb8,
      lX = lV + lW;
    function lY(rE, rF, rG = 0x1) {
      const yt = ut;
      if (rE[yt(0xab6)]) return;
      rF[yt(0x94d)](),
        rF[yt(0xa21)](rE["x"], rE["y"]),
        lZ(rE, rF),
        rF[yt(0xa21)](0x0, -rE[yt(0x31a)] - 0x19),
        rF[yt(0x94d)](),
        rF[yt(0x2db)](rG),
        rE[yt(0x9f0)] &&
          (pH(rF, "@" + rE[yt(0x9f0)], 0xb, yt(0x505), 0x3),
          rF[yt(0xa21)](0x0, -0x10)),
        rE[yt(0x486)] &&
          (pH(rF, rE[yt(0x486)], 0x12, yt(0x669), 0x3),
          rF[yt(0xa21)](0x0, -0x5)),
        rF[yt(0xbad)](),
        !rE[yt(0xbca)] &&
          rE[yt(0x7db)] > 0.001 &&
          ((rF[yt(0x557)] = rE[yt(0x7db)]),
          rF[yt(0x1f7)](rE[yt(0x7db)] * 0x3, rE[yt(0x7db)] * 0x3),
          rF[yt(0x4cc)](),
          rF[yt(0xc20)](0x0, 0x0, 0x14, 0x0, l0),
          (rF[yt(0x74b)] = yt(0x9ff)),
          rF[yt(0x869)](),
          nA(rF, 0.8),
          rF[yt(0x4cc)](),
          rF[yt(0xc20)](0x0, 0x0, 0x14, 0x0, l0),
          (rF[yt(0x74b)] = yt(0x54e)),
          rF[yt(0x869)](),
          rF[yt(0x4cc)](),
          rF[yt(0x7eb)](0x0, 0x0),
          rF[yt(0xc20)](0x0, 0x0, 0x10, 0x0, l0 * rE[yt(0xdb0)]),
          rF[yt(0xa16)](0x0, 0x0),
          rF[yt(0x8da)](),
          nA(rF, 0.8)),
        rF[yt(0xbad)]();
    }
    function lZ(rE, rF, rG = ![]) {
      const yu = ut;
      if (rE[yu(0xe82)] <= 0x0) return;
      rF[yu(0x94d)](),
        (rF[yu(0x557)] = rE[yu(0xe82)]),
        (rF[yu(0xbdd)] = yu(0x207)),
        rF[yu(0x4cc)]();
      const rH = rG ? 0x8c : rE[yu(0xbca)] ? 0x4b : 0x64,
        rI = rG ? 0x1a : 0x9;
      if (rG) rF[yu(0xa21)](rE[yu(0x31a)] + 0x11, 0x0);
      else {
        const rK = Math[yu(0x49f)](0x1, rE[yu(0x31a)] / 0x64);
        rF[yu(0x1f7)](rK, rK),
          rF[yu(0xa21)](-rH / 0x2, rE[yu(0x31a)] / rK + 0x1b);
      }
      rF[yu(0x4cc)](),
        rF[yu(0x7eb)](rG ? -0x14 : 0x0, 0x0),
        rF[yu(0xa16)](rH, 0x0),
        (rF[yu(0x452)] = yu(0xa7d)),
        (rF[yu(0x4e5)] = rI),
        (rF[yu(0xbdd)] = yu(0x207)),
        rF[yu(0x873)]();
      function rJ(rL) {
        const yv = yu;
        rF[yv(0x557)] = rL < 0.05 ? rL / 0.05 : 0x1;
      }
      rE[yu(0xd18)] > 0x0 &&
        (rJ(rE[yu(0xd18)]),
        rF[yu(0x4cc)](),
        rF[yu(0x7eb)](0x0, 0x0),
        rF[yu(0xa16)](rE[yu(0xd18)] * rH, 0x0),
        (rF[yu(0x4e5)] = rI * (rG ? 0.55 : 0.44)),
        (rF[yu(0xbdd)] = yu(0xbe4)),
        rF[yu(0x873)]());
      rE[yu(0x663)] > 0x0 &&
        (rJ(rE[yu(0x663)]),
        rF[yu(0x4cc)](),
        rF[yu(0x7eb)](0x0, 0x0),
        rF[yu(0xa16)](rE[yu(0x663)] * rH, 0x0),
        (rF[yu(0x4e5)] = rI * (rG ? 0.7 : 0.66)),
        (rF[yu(0xbdd)] = yu(0xba4)),
        rF[yu(0x873)]());
      rE[yu(0xebe)] &&
        (rJ(rE[yu(0xebe)]),
        rF[yu(0x4cc)](),
        rF[yu(0x7eb)](0x0, 0x0),
        rF[yu(0xa16)](rE[yu(0xebe)] * rH, 0x0),
        (rF[yu(0x4e5)] = rI * (rG ? 0.45 : 0.35)),
        (rF[yu(0xbdd)] = yu(0xedf)),
        rF[yu(0x873)]());
      if (rE[yu(0xbca)]) {
        rF[yu(0x557)] = 0x1;
        if(rE.username == hack.player.name) hack.player.entity = rE;
        var hp = Math.round(rE.health * hack.hp);
        var shield = Math.round(rE.shield * hack.hp);
        const rL = pH(
          rF,
          (rE.username == hack.player.name ? `HP ${hp}${shield ? " + " + shield : ""} ` : '') + yu(0x4d1) + (rE[yu(0xd47)] + 0x1),
          rG ? 0xc : 0xe,
          yu(0x669),
          0x3,
          !![]
        );
        rF[yu(0xd33)](
          rL,
          rH + rI / 0x2 - rL[yu(0x89e)],
          rI / 0x2,
          rL[yu(0x89e)],
          rL[yu(0x5ab)]
        );
        if (rG) {
          const rM = pH(rF, "@" + rE[yu(0x9f0)], 0xc, yu(0x505), 0x3, !![]);
          rF[yu(0xd33)](
            rM,
            -rI / 0x2,
            -rI / 0x2 - rM[yu(0x5ab)],
            rM[yu(0x89e)],
            rM[yu(0x5ab)]
          );
        }
      } else {
        rF[yu(0x557)] = 0x1;
        const rN = kc[rE[yu(0x8ca)]],
          rO = pH(rF, rN, 0xe, yu(0x669), 0x3, !![], rE[yu(0x8ae)]);
        rF[yu(0x94d)](), rF[yu(0xa21)](0x0, -rI / 0x2 - rO[yu(0x5ab)]);
        rO[yu(0x89e)] > rH + rI
          ? rF[yu(0xd33)](
              rO,
              rH / 0x2 - rO[yu(0x89e)] / 0x2,
              0x0,
              rO[yu(0x89e)],
              rO[yu(0x5ab)]
            )
          : rF[yu(0xd33)](rO, -rI / 0x2, 0x0, rO[yu(0x89e)], rO[yu(0x5ab)]);
        rF[yu(0xbad)]();
        const rP = pH(rF, rE[yu(0x8ae)], 0xe, hP[rE[yu(0x8ae)]], 0x3, !![]);
        rF[yu(0xd33)](
          rP,
          rH + rI / 0x2 - rP[yu(0x89e)],
          rI / 0x2,
          rP[yu(0x89e)],
          rP[yu(0x5ab)]
        );
        var genCanvas = pH;
        const health = genCanvas(
          rF,
          `${Math.floor(rE['health'] * hack.getHP(rE))} (${Math.floor(rE['health'] * 100)}%)`,
          30,
          hack.getColor(rE),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) rF.drawImage(
          health,
          -60,
          -150,
          health.worldW,
          health.worldH
        );
        const health2 = genCanvas(
          rF,
          `/ ${hack.getHP(rE)} `,
          30,
          hack.getColor(rE),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) rF.drawImage(
          health2,
          -60,
          -120,
          health2.worldW,
          health2.worldH
        );
      }
      rG &&
        rE[yu(0x486)] &&
        ((rF[yu(0x557)] = 0x1),
        rF[yu(0xa21)](rH / 0x2, 0x0),
        pH(rF, rE[yu(0x486)], 0x11, yu(0x669), 0x3)),
        rF[yu(0xbad)]();
    }
    function m0(rE) {
      const yw = ut;
      for (let rF in oD) {
        oD[rF][yw(0x388)](rE);
      }
      oW();
    }
    var m1 = {},
      m2 = document[ut(0xb01)](ut(0x793));
    mH(ut(0xe44), ut(0x479), ut(0x79c)),
      mH(ut(0x89c), ut(0x793), ut(0x701)),
      mH(ut(0x7df), ut(0x64c), ut(0x620), () => {
        const yx = ut;
        (hv = ![]), (hD[yx(0x620)] = fc);
      }),
      mH(ut(0x902), ut(0xe36), ut(0xc03)),
      mH(ut(0x627), ut(0x9fb), ut(0x714)),
      mH(ut(0x9d0), ut(0x829), ut(0xe16)),
      mH(ut(0xa6c), ut(0xbc5), ut(0x48a)),
      mH(ut(0x81f), ut(0x822), ut(0xb68)),
      mH(ut(0x259), ut(0x9d9), ut(0x3aa)),
      mH(ut(0x783), ut(0x9f8), "lb"),
      mH(ut(0xb55), ut(0xc52), ut(0x73f)),
      mH(ut(0xb6d), ut(0x1fa), ut(0x9fd), () => {
        const yy = ut;
        (mi[yy(0x49b)][yy(0xdaa)] = yy(0x30c)), (hD[yy(0x9fd)] = mh);
      }),
      mH(ut(0x52e), ut(0xdcd), ut(0x364), () => {
        const yz = ut;
        if (!hW) return;
        il(new Uint8Array([cI[yz(0x344)]]));
      });
    var m3 = document[ut(0xb01)](ut(0x40e)),
      m4 = ![],
      m5 = null,
      m6 = nO(ut(0x22e));
    setInterval(() => {
      m5 && m7();
    }, 0x3e8);
    function m7() {
      const yA = ut;
      k8(m6, yA(0xc59) + ka(Date[yA(0x8ea)]() - m5[yA(0x33a)]) + yA(0x574));
    }
    function m8(rE) {
      const yB = ut;
      document[yB(0xc9e)][yB(0xa1b)][yB(0xde0)](yB(0xd6d));
      const rF = nO(
        yB(0x895) +
          rE[yB(0xb30)] +
          yB(0xeb3) +
          rE[yB(0xcbe)] +
          yB(0x7c9) +
          (rE[yB(0xd8b)]
            ? yB(0xae6) +
              rE[yB(0xd8b)] +
              "\x22\x20" +
              (rE[yB(0xb80)] ? yB(0x8e2) + rE[yB(0xb80)] + "\x22" : "") +
              yB(0x41a)
            : "") +
          yB(0x2c1)
      );
      (r2 = rF),
        (rF[yB(0x388)] = function () {
          const yC = yB;
          document[yC(0xc9e)][yC(0xa1b)][yC(0xeae)](yC(0xd6d)),
            rF[yC(0xeae)](),
            (r2 = null);
        }),
        (rF[yB(0xb01)](yB(0x61d))[yB(0x4c5)] = rF[yB(0x388)]);
      const rG = rF[yB(0xb01)](yB(0x402)),
        rH = 0x14;
      rI(0x0);
      if (rE[yB(0x3ad)][yB(0xed7)] > rH) {
        const rJ = nO(yB(0x5a4));
        rF[yB(0x2e9)](rJ);
        const rK = rJ[yB(0xb01)](yB(0x636)),
          rL = Math[yB(0x67d)](rE[yB(0x3ad)][yB(0xed7)] / rH);
        for (let rO = 0x0; rO < rL; rO++) {
          const rP = nO(yB(0x1f6) + rO + yB(0xe69) + (rO + 0x1) + yB(0xea2));
          rK[yB(0x2e9)](rP);
        }
        rK[yB(0x6c6)] = function () {
          const yD = yB;
          rI(this[yD(0x95d)]);
        };
        const rM = rF[yB(0xb01)](yB(0xecb)),
          rN = rF[yB(0xb01)](yB(0x92d));
        rN[yB(0x6c6)] = function () {
          const yE = yB,
            rQ = this[yE(0x95d)][yE(0x6e4)]();
          (rM[yE(0x26f)] = ""), (rM[yE(0x49b)][yE(0xdaa)] = yE(0x30c));
          if (!rQ) return;
          const rR = new RegExp(rQ, "i");
          let rS = 0x0;
          for (let rT = 0x0; rT < rE[yE(0x3ad)][yE(0xed7)]; rT++) {
            const rU = rE[yE(0x3ad)][rT];
            if (rR[yE(0xcc4)](rU[yE(0x2b6)])) {
              const rV = nO(
                yE(0x336) +
                  (rT + 0x1) +
                  yE(0x8f6) +
                  rU[yE(0x2b6)] +
                  yE(0xb56) +
                  k9(rU[yE(0x409)]) +
                  yE(0x4c3)
              );
              rM[yE(0x2e9)](rV),
                (rV[yE(0xb01)](yE(0x84d))[yE(0x4c5)] = function () {
                  const yF = yE;
                  mw(rU[yF(0x2b6)]);
                }),
                (rV[yE(0x4c5)] = function (rW) {
                  const yG = yE;
                  if (rW[yG(0x54d)] === this) {
                    const rX = Math[yG(0x7ce)](rT / rH);
                    rI(rX), (rK[yG(0x95d)] = rX);
                  }
                }),
                rS++;
              if (rS >= 0x8) break;
            }
          }
          rS > 0x0 && (rM[yE(0x49b)][yE(0xdaa)] = "");
        };
      }
      function rI(rQ = 0x0) {
        const yH = yB,
          rR = rQ * rH,
          rS = Math[yH(0xc36)](rE[yH(0x3ad)][yH(0xed7)], rR + rH);
        rG[yH(0x26f)] = "";
        for (let rT = rR; rT < rS; rT++) {
          const rU = rE[yH(0x3ad)][rT];
          rG[yH(0x2e9)](rE[yH(0xf40)](rU, rT));
          const rV = nO(yH(0xa23));
          for (let rW = 0x0; rW < rU[yH(0xc58)][yH(0xed7)]; rW++) {
            const [rX, rY] = rU[yH(0xc58)][rW],
              rZ = dF[rX],
              s0 = nO(
                yH(0x21f) + rZ[yH(0x23b)] + "\x22\x20" + qy(rZ) + yH(0x41a)
              );
            jY(s0);
            const s1 = "x" + k9(rY),
              s2 = nO(yH(0xf0a) + s1 + yH(0xec2));
            s1[yH(0xed7)] > 0x6 && s2[yH(0xa1b)][yH(0xde0)](yH(0xd08)),
              s0[yH(0x2e9)](s2),
              (s0[yH(0x558)] = rZ),
              rV[yH(0x2e9)](s0);
          }
          rG[yH(0x2e9)](rV);
        }
      }
      kl[yB(0x2e9)](rF);
    }
    function m9(rE, rF = ![]) {
      const yI = ut;
      let rG = [],
        rH = 0x0;
      for (const rJ in rE) {
        const rK = rE[rJ];
        let rL = 0x0,
          rM = [];
        for (const rO in rK) {
          const rP = rK[rO];
          rM[yI(0xbc0)]([rO, rP]), (rL += rP), (rH += rP);
        }
        rM = rM[yI(0x604)]((rQ, rR) => rR[0x1] - rQ[0x1]);
        const rN = {};
        (rN[yI(0x2b6)] = rJ),
          (rN[yI(0xc58)] = rM),
          (rN[yI(0x409)] = rL),
          rG[yI(0xbc0)](rN);
      }
      if (rF) rG = rG[yI(0x604)]((rQ, rR) => rR[yI(0x409)] - rQ[yI(0x409)]);
      const rI = {};
      return (rI[yI(0x409)] = rH), (rI[yI(0x3ad)] = rG), rI;
    }
    function ma() {
      return mb(new Date());
    }
    function mb(rE) {
      const yJ = ut,
        rF = {};
      rF[yJ(0x42e)] = yJ(0x7e7);
      const rG = rE[yJ(0xf3e)]("en", rF),
        rH = {};
      rH[yJ(0x4ab)] = yJ(0x559);
      const rI = rE[yJ(0xf3e)]("en", rH),
        rJ = {};
      rJ[yJ(0x71c)] = yJ(0x7e7);
      const rK = rE[yJ(0xf3e)]("en", rJ);
      return "" + rG + mc(rG) + "\x20" + rI + "\x20" + rK;
    }
    function mc(rE) {
      if (rE >= 0xb && rE <= 0xd) return "th";
      switch (rE % 0xa) {
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
    function md(rE, rF) {
      const yK = ut,
        rG = nO(
          yK(0x48c) +
            (rF + 0x1) +
            yK(0xca2) +
            rE[yK(0x2b6)] +
            yK(0xdb3) +
            k9(rE[yK(0x409)]) +
            yK(0xa96) +
            (rE[yK(0x409)] == 0x1 ? "" : "s") +
            yK(0xc17)
        );
      return (
        (rG[yK(0xb01)](yK(0x84d))[yK(0x4c5)] = function () {
          const yL = yK;
          mw(rE[yL(0x2b6)]);
        }),
        rG
      );
    }
    var me = {
      ultraPlayers: {
        title: ut(0xec4),
        parse(rE) {
          const yM = ut,
            rF = rE[yM(0x231)];
          if (rF[yM(0xba1)] !== 0x1) throw new Error(yM(0x58f) + rF[yM(0xba1)]);
          const rG = {},
            rH = rF[yM(0x5fd)][yM(0xda2)]("+");
          for (const rJ in rF[yM(0xa57)]) {
            const rK = rF[yM(0xa57)][rJ][yM(0xda2)]("\x20"),
              rL = {};
            for (let rM = 0x0; rM < rK[yM(0xed7)] - 0x1; rM++) {
              let [rN, rO] = rK[rM][yM(0xda2)](",");
              rL[rH[rN]] = parseInt(rO);
            }
            rG[rJ] = rL;
          }
          const rI = m9(rG, !![]);
          return {
            title: this[yM(0xb30)],
            titleColor: hP[yM(0xd1a)],
            desc:
              ma() +
              yM(0x3e1) +
              k9(rI[yM(0x3ad)][yM(0xed7)]) +
              yM(0x4a8) +
              k9(rI[yM(0x409)]) +
              yM(0x971),
            getTitleEl: md,
            groups: rI[yM(0x3ad)],
          };
        },
      },
      superPlayers: {
        title: ut(0xe41),
        parse(rE) {
          const yN = ut,
            rF = m9(rE[yN(0x894)], !![]);
          return {
            title: this[yN(0xb30)],
            titleColor: hP[yN(0x9ca)],
            desc:
              ma() +
              yN(0x3e1) +
              k9(rF[yN(0x3ad)][yN(0xed7)]) +
              yN(0x4a8) +
              k9(rF[yN(0x409)]) +
              yN(0x971),
            getTitleEl: md,
            groups: rF[yN(0x3ad)],
          };
        },
      },
      hyperPlayers: {
        title: ut(0x9fc),
        parse(rE) {
          const yO = ut,
            rF = m9(rE[yO(0xd57)], !![]);
          return {
            title: this[yO(0xb30)],
            titleColor: hP[yO(0xa89)],
            desc:
              ma() +
              yO(0x3e1) +
              k9(rF[yO(0x3ad)][yO(0xed7)]) +
              yO(0x4a8) +
              k9(rF[yO(0x409)]) +
              yO(0x971),
            getTitleEl: md,
            groups: rF[yO(0x3ad)],
          };
        },
      },
      petals: {
        title: ut(0xad7),
        parse(rE) {
          const yP = ut,
            rF = m9(rE[yP(0xc58)], ![]),
            rG = rF[yP(0x3ad)][yP(0x604)](
              (rH, rI) => rI[yP(0x2b6)] - rH[yP(0x2b6)]
            );
          return {
            title: this[yP(0xb30)],
            titleColor: hP[yP(0xa94)],
            desc: ma() + yP(0x3e1) + k9(rF[yP(0x409)]) + yP(0x971),
            getTitleEl(rH, rI) {
              const yQ = yP;
              return nO(
                yQ(0xb48) +
                  hN[rH[yQ(0x2b6)]] +
                  yQ(0x3e1) +
                  k9(rH[yQ(0x409)]) +
                  yQ(0xa00)
              );
            },
            groups: rG,
          };
        },
      },
    };
    function mf(rE) {
      const yR = ut,
        rF = 0xea60,
        rG = rF * 0x3c,
        rH = rG * 0x18,
        rI = rH * 0x16d;
      let rJ = Math[yR(0x7ce)](rE / rI);
      rE %= rI;
      let rK = Math[yR(0x7ce)](rE / rH);
      rE %= rH;
      let rL = Math[yR(0x7ce)](rE / rG);
      rE %= rG;
      let rM = Math[yR(0x7ce)](rE / rF),
        rN = [];
      if (rJ > 0x0) rN[yR(0xbc0)](rJ + "y");
      if (rK > 0x0) rN[yR(0xbc0)](rK + "d");
      if (rL > 0x0) rN[yR(0xbc0)](rL + "h");
      if (rM > 0x0) rN[yR(0xbc0)](rM + "m");
      return rN[yR(0x361)]("\x20");
    }
    function mg() {
      const yS = ut;
      if (m4) return;
      if (m5 && Date[yS(0x8ea)]() - m5[yS(0x33a)] < 0x3c * 0xea60) return;
      (m4 = !![]),
        fetch((i8 ? yS(0x36c) : yS(0x7ef)) + yS(0xa28))
          [yS(0xc09)]((rE) => rE[yS(0xb1e)]())
          [yS(0xc09)]((rE) => {
            const yT = yS;
            (m4 = ![]), (m5 = rE), m7(), (m3[yT(0x26f)] = "");
            const rF = {};
            (rF[yT(0xf49)] = !![]),
              (rF[yT(0xa7f)] = !![]),
              (rF[yT(0xd43)] = !![]),
              (rF[yT(0x3a2)] = !![]),
              (rF[yT(0x4dd)] = !![]);
            const rG = rF,
              rH = nO(yT(0xc4e));
            m3[yT(0x2e9)](rH);
            for (const rI in rG) {
              if (rI in rE) {
                const rJ = rE[rI],
                  rK = nO(
                    yT(0xe90) +
                      kd(rI) +
                      yT(0xe34) +
                      (rI == yT(0xf49) ? mf(rJ * 0x3e8 * 0x3c) : k9(rJ)) +
                      yT(0x689)
                  );
                rH[yT(0x2e9)](rK);
              }
            }
            for (const rL in me) {
              if (!(rL in rE)) continue;
              const rM = me[rL],
                rN = nO(yT(0xcb7) + rM[yT(0xb30)] + yT(0x960));
              (rN[yT(0x4c5)] = function () {
                const yU = yT;
                m8(rM[yU(0x1f3)](rE));
              }),
                m3[yT(0x2e9)](rN);
            }
            m3[yT(0x2e9)](m6);
          })
          [yS(0xe1b)]((rE) => {
            const yV = yS;
            (m4 = ![]),
              hc(yV(0x377)),
              console[yV(0xb60)](yV(0x69b), rE),
              setTimeout(mg, 0x1388);
          });
    }
    mH(ut(0xdee), ut(0xbd7), ut(0x406), mg);
    var mh = 0xb,
      mi = document[ut(0xb01)](ut(0xcc7));
    hD[ut(0x9fd)] == mh && (mi[ut(0x49b)][ut(0xdaa)] = ut(0x30c));
    var mj = document[ut(0xb01)](ut(0x88c));
    mj[ut(0x49b)][ut(0xdaa)] = ut(0x30c);
    var mk = document[ut(0xb01)](ut(0x308)),
      ml = document[ut(0xb01)](ut(0x64d)),
      mm = document[ut(0xb01)](ut(0x646));
    mm[ut(0x4c5)] = function () {
      const yW = ut;
      mj[yW(0x49b)][yW(0xdaa)] = yW(0x30c);
    };
    var mn = ![];
    ml[ut(0x4c5)] = nu(function (rE) {
      const yX = ut;
      if (!hW || mn || jy) return;
      const rF = mk[yX(0x95d)][yX(0x6e4)]();
      if (!rF || !eV(rF)) {
        mk[yX(0xa1b)][yX(0xeae)](yX(0xa29)),
          void mk[yX(0xb62)],
          mk[yX(0xa1b)][yX(0xde0)](yX(0xa29));
        return;
      }
      (mj[yX(0x49b)][yX(0xdaa)] = ""),
        (mj[yX(0x26f)] = yX(0xd0b)),
        il(
          new Uint8Array([cI[yX(0x224)], ...new TextEncoder()[yX(0x7fb)](rF)])
        ),
        (mn = !![]);
    });
    function mo(rE, rF) {
      const yY = ut;
      if (rE === yY(0xf31)) {
        const rG = {};
        (rG[yY(0x71c)] = yY(0x7e7)),
          (rG[yY(0x42e)] = yY(0xe67)),
          (rG[yY(0x4ab)] = yY(0xe67)),
          (rF = new Date(
            rF === 0x0 ? Date[yY(0x8ea)]() : rF * 0x3e8 * 0x3c * 0x3c
          )[yY(0xf3e)]("en", rG));
      } else
        rE === yY(0xe53) || rE === yY(0xab9)
          ? (rF = ka(rF * 0x3e8 * 0x3c, !![]))
          : (rF = k9(rF));
      return rF;
    }
    var mp = f2(),
      mq = {},
      mr = document[ut(0xb01)](ut(0x4f5));
    mr[ut(0x26f)] = "";
    for (let rE in mp) {
      const rF = ms(rE);
      rF[ut(0xdb1)](0x0), mr[ut(0x2e9)](rF), (mq[rE] = rF);
    }
    function ms(rG) {
      const yZ = ut,
        rH = nO(yZ(0xa9d) + kd(rG) + yZ(0xef3)),
        rI = rH[yZ(0xb01)](yZ(0xdf3));
      return (
        (rH[yZ(0xdb1)] = function (rJ) {
          k8(rI, mo(rG, rJ));
        }),
        rH
      );
    }
    var mt;
    function mu(rG, rH, rI, rJ, rK, rL, rM) {
      const z0 = ut;
      mt && (mt[z0(0xbb4)](), (mt = null));
      const rN = rL[z0(0xed7)] / 0x2,
        rO = z0(0x861)[z0(0x816)](rN),
        rP = nO(
          z0(0x96a) +
            rG +
            z0(0x7d9) +
            rO +
            z0(0x71b) +
            rO +
            z0(0xdde) +
            z0(0x46a)[z0(0x816)](eL * dH) +
            z0(0x3bf) +
            (rI[z0(0xed7)] === 0x0 ? z0(0xbb7) : "") +
            z0(0x3cd)
        );
      rM && rP[z0(0x2e9)](nO(z0(0x8eb)));
      mt = rP;
      const rQ = rP[z0(0xb01)](z0(0xc30)),
        rR = rP[z0(0xb01)](z0(0xeca));
      for (let s3 = 0x0; s3 < rL[z0(0xed7)]; s3++) {
        const s4 = rL[s3];
        if (!s4) continue;
        const s5 = od(s4);
        s5[z0(0xa1b)][z0(0xeae)](z0(0xaf9)),
          (s5[z0(0xc60)] = !![]),
          s5[z0(0xa01)][z0(0xeae)](),
          (s5[z0(0xa01)] = null),
          s3 < rN
            ? rQ[z0(0x477)][s3][z0(0x2e9)](s5)
            : rR[z0(0x477)][s3 - rN][z0(0x2e9)](s5);
      }
      (rP[z0(0xbb4)] = function () {
        const z1 = z0;
        (rP[z1(0x49b)][z1(0x628)] = z1(0xaef)),
          (rP[z1(0x49b)][z1(0xdaa)] = z1(0x30c)),
          void rP[z1(0xb62)],
          (rP[z1(0x49b)][z1(0xdaa)] = ""),
          setTimeout(function () {
            const z2 = z1;
            rP[z2(0xeae)]();
          }, 0x3e8);
      }),
        (rP[z0(0xb01)](z0(0x61d))[z0(0x4c5)] = function () {
          const z3 = z0;
          rP[z3(0xbb4)]();
        });
      const rS = d4(rK),
        rT = rS[0x0],
        rU = rS[0x1],
        rV = d2(rT + 0x1),
        rW = rK - rU,
        rX = rP[z0(0xb01)](z0(0x900));
      k8(
        rX,
        z0(0xb15) + (rT + 0x1) + z0(0xaba) + iJ(rW) + "/" + iJ(rV) + z0(0xbae)
      );
      const rY = Math[z0(0xc36)](0x1, rW / rV),
        rZ = rP[z0(0xb01)](z0(0xc70));
      rZ[z0(0x49b)][z0(0x40b)] = rY * 0x64 + "%";
      const s0 = rP[z0(0xb01)](z0(0x4f5));
      for (let s6 in mp) {
        const s7 = ms(s6);
        s7[z0(0xdb1)](rH[s6]), s0[z0(0x2e9)](s7);
      }
      const s1 = rP[z0(0xb01)](z0(0xcfa));
      rI[z0(0x604)]((s8, s9) => oc(s8[0x0], s9[0x0]));
      for (let s8 = 0x0; s8 < rI[z0(0xed7)]; s8++) {
        const [s9, sa] = rI[s8],
          sb = od(s9);
        jY(sb),
          sb[z0(0xa1b)][z0(0xeae)](z0(0xaf9)),
          (sb[z0(0xc60)] = !![]),
          p3(sb[z0(0xa01)], sa),
          s1[z0(0x2e9)](sb);
      }
      if (rI[z0(0xed7)] > 0x0) {
        const sc = nO(z0(0xde4)),
          sd = {};
        for (let se = 0x0; se < rI[z0(0xed7)]; se++) {
          const [sf, sg] = rI[se];
          sd[sf[z0(0x23b)]] = (sd[sf[z0(0x23b)]] || 0x0) + sg;
        }
        oC(sc, sd), rP[z0(0xb01)](z0(0x829))[z0(0x2e9)](sc);
      }
      const s2 = rP[z0(0xb01)](z0(0xce1));
      for (let sh = 0x0; sh < rJ[z0(0xed7)]; sh++) {
        const si = rJ[sh],
          sj = nT(si, !![]);
        sj[z0(0xa1b)][z0(0xeae)](z0(0xaf9)), (sj[z0(0xc60)] = !![]);
        const sk = s2[z0(0x477)][si[z0(0x523)] * dH + si[z0(0x23b)]];
        s2[z0(0x1fd)](sj, sk), sk[z0(0xeae)]();
      }
      rP[z0(0xa1b)][z0(0xde0)](z0(0xa1c)),
        setTimeout(function () {
          const z4 = z0;
          rP[z4(0xa1b)][z4(0xeae)](z4(0xa1c));
        }, 0x0),
        kl[z0(0x2e9)](rP);
    }
    var mv = document[ut(0xb01)](ut(0x88b));
    document[ut(0xb01)](ut(0xdb9))[ut(0x4c5)] = nu(function (rG) {
      const z5 = ut,
        rH = mv[z5(0x95d)][z5(0x6e4)]();
      nt(rH);
    });
    function mw(rG) {
      const z6 = ut,
        rH = new Uint8Array([
          cI[z6(0x561)],
          ...new TextEncoder()[z6(0x7fb)](rG),
        ]);
      il(rH);
    }
    var mz = document[ut(0xb01)](ut(0x822)),
      mA = document[ut(0xb01)](ut(0x9f8)),
      mB = mA[ut(0xb01)](ut(0x402)),
      mC = 0x0,
      mD = 0x0;
    setInterval(function () {
      const z7 = ut;
      hW &&
        (pN - mD > 0x7530 &&
          mz[z7(0xa1b)][z7(0x6ba)](z7(0xd5b)) &&
          (il(new Uint8Array([cI[z7(0xdce)]])), (mD = pN)),
        pN - mC > 0xea60 &&
          mA[z7(0xa1b)][z7(0x6ba)](z7(0xd5b)) &&
          (il(new Uint8Array([cI[z7(0xe4d)]])), (mC = pN)));
    }, 0x3e8);
    var mE = ![];
    function mF(rG) {
      const z8 = ut;
      for (let rH in m1) {
        if (rG === rH) continue;
        m1[rH][z8(0xbb4)]();
      }
      mE = ![];
    }
    window[ut(0x4c5)] = function (rG) {
      const z9 = ut;
      if ([kk, kn, ki][z9(0x935)](rG[z9(0x54d)])) mF();
    };
    function mG() {
      const za = ut;
      iy && !p9[za(0x3ff)] && im(0x0, 0x0);
    }
    function mH(rG, rH, rI, rJ) {
      const zb = ut,
        rK = document[zb(0xb01)](rH),
        rL = rK[zb(0xb01)](zb(0x402)),
        rM = document[zb(0xb01)](rG);
      let rN = null,
        rO = rK[zb(0xb01)](zb(0x81e));
      rO &&
        (rO[zb(0x4c5)] = function () {
          const zc = zb;
          rK[zc(0xa1b)][zc(0xa08)](zc(0xb2d));
        });
      (rL[zb(0x49b)][zb(0xdaa)] = zb(0x30c)),
        rK[zb(0xa1b)][zb(0xeae)](zb(0xd5b)),
        (rM[zb(0x4c5)] = function () {
          const zd = zb;
          rP[zd(0xa08)]();
        }),
        (rK[zb(0xb01)](zb(0x61d))[zb(0x4c5)] = function () {
          mF();
        });
      const rP = [rM, rK];
      (rP[zb(0xbb4)] = function () {
        const ze = zb;
        rM[ze(0xa1b)][ze(0xeae)](ze(0x8c1)),
          rK[ze(0xa1b)][ze(0xeae)](ze(0xd5b)),
          !rN &&
            (rN = setTimeout(function () {
              const zf = ze;
              (rL[zf(0x49b)][zf(0xdaa)] = zf(0x30c)), (rN = null);
            }, 0x3e8));
      }),
        (rP[zb(0xa08)] = function () {
          const zg = zb;
          mF(rI),
            rK[zg(0xa1b)][zg(0x6ba)](zg(0xd5b))
              ? rP[zg(0xbb4)]()
              : rP[zg(0xd5b)]();
        }),
        (rP[zb(0xd5b)] = function () {
          const zh = zb;
          rJ && rJ(),
            clearTimeout(rN),
            (rN = null),
            (rL[zh(0x49b)][zh(0xdaa)] = ""),
            rM[zh(0xa1b)][zh(0xde0)](zh(0x8c1)),
            rK[zh(0xa1b)][zh(0xde0)](zh(0xd5b)),
            (mE = !![]),
            mG();
        }),
        (m1[rI] = rP);
    }
    var mI = [],
      mJ,
      mK = 0x0,
      mL = ![],
      mM = document[ut(0xb01)](ut(0x9d0)),
      mN = {
        tagName: ut(0x887),
        getBoundingClientRect() {
          const zi = ut,
            rG = mM[zi(0xecc)](),
            rH = {};
          return (
            (rH["x"] = rG["x"] + rG[zi(0x40b)] / 0x2),
            (rH["y"] = rG["y"] + rG[zi(0x965)] / 0x2),
            rH
          );
        },
        appendChild(rG) {
          const zj = ut;
          rG[zj(0xeae)]();
        },
      };
    function mO(rG) {
      const zk = ut;
      if (!hW) return;
      const rH = rG[zk(0x54d)];
      if (rH[zk(0xdf4)]) mJ = n8(rH, rG);
      else {
        if (rH[zk(0xd92)]) {
          mF();
          const rI = rH[zk(0xa38)]();
          (rI[zk(0x558)] = rH[zk(0x558)]),
            nN(rI, rH[zk(0x558)]),
            (rI[zk(0xed8)] = 0x1),
            (rI[zk(0xd92)] = !![]),
            (rI[zk(0xb66)] = mN),
            rI[zk(0xa1b)][zk(0xde0)](zk(0x226));
          const rJ = rH[zk(0xecc)]();
          (rI[zk(0x49b)][zk(0x985)] = rJ["x"] / kR + "px"),
            (rI[zk(0x49b)][zk(0x293)] = rJ["y"] / kR + "px"),
            kH[zk(0x2e9)](rI),
            (mJ = n8(rI, rG)),
            (mK = 0x0),
            (mE = !![]);
        } else return ![];
      }
      return (mK = Date[zk(0x8ea)]()), (mL = !![]), !![];
    }
    function mP(rG) {
      const zl = ut;
      for (let rH = 0x0; rH < rG[zl(0x477)][zl(0xed7)]; rH++) {
        const rI = rG[zl(0x477)][rH];
        if (rI[zl(0xa1b)][zl(0x6ba)](zl(0x558)) && !n7(rI)) return rI;
      }
    }
    function mQ() {
      const zm = ut;
      if (mJ) {
        if (mL && Date[zm(0x8ea)]() - mK < 0x1f4) {
          if (mJ[zm(0xdf4)]) {
            const rG = mJ[zm(0xa68)][zm(0xf33)];
            mJ[zm(0x3fa)](
              rG >= iN ? ny[zm(0x477)][rG - iN + 0x1] : nz[zm(0x477)][rG]
            );
          } else {
            if (mJ[zm(0xd92)]) {
              let rH = mP(ny) || mP(nz);
              rH && mJ[zm(0x3fa)](rH);
            }
          }
        }
        mJ[zm(0x853)]();
        if (mJ[zm(0xd92)]) {
          (mJ[zm(0xd92)] = ![]),
            (mJ[zm(0xdf4)] = !![]),
            m1[zm(0xe16)][zm(0xd5b)]();
          if (mJ[zm(0xb66)] !== mN) {
            const rI = mJ[zm(0xef4)];
            rI
              ? ((mJ[zm(0x9d7)] = rI[zm(0x9d7)]), n4(rI[zm(0x558)]["id"], 0x1))
              : (mJ[zm(0x9d7)] = iR[zm(0x258)]());
            (iQ[mJ[zm(0x9d7)]] = mJ), n4(mJ[zm(0x558)]["id"], -0x1);
            const rJ = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rJ[zm(0x463)](0x0, cI[zm(0x2b7)]),
              rJ[zm(0xa2a)](0x1, mJ[zm(0x558)]["id"]),
              rJ[zm(0x463)](0x3, mJ[zm(0xb66)][zm(0xf33)]),
              il(rJ);
          }
        } else
          mJ[zm(0xb66)] === mN
            ? (iR[zm(0xbc0)](mJ[zm(0x9d7)]),
              n4(mJ[zm(0x558)]["id"], 0x1),
              il(new Uint8Array([cI[zm(0x93d)], mJ[zm(0xa68)][zm(0xf33)]])))
            : n6(mJ[zm(0xa68)][zm(0xf33)], mJ[zm(0xb66)][zm(0xf33)]);
        mJ = null;
      }
    }
    function mR(rG) {
      const zn = ut;
      mJ && (mJ[zn(0x7ed)](rG), (mL = ![]));
    }
    var mS = document[ut(0xb01)](ut(0x951));
    function mT() {
      const zo = ut;
      mS[zo(0x49b)][zo(0xdaa)] = zo(0x30c);
      const rG = mS[zo(0xb01)](zo(0xbbc));
      let rH,
        rI,
        rJ = null;
      (mS[zo(0x7cc)] = function (rL) {
        const zp = zo;
        rJ === null &&
          ((rG[zp(0x49b)][zp(0x40b)] = rG[zp(0x49b)][zp(0x977)] = "0"),
          (mS[zp(0x49b)][zp(0xdaa)] = ""),
          ([rH, rI] = mU(rL)),
          rK(),
          (rJ = rL[zp(0x4dc)]));
      }),
        (mS[zo(0x512)] = function (rL) {
          const zq = zo;
          if (rL[zq(0x4dc)] === rJ) {
            const [rM, rN] = mU(rL),
              rO = rM - rH,
              rP = rN - rI,
              rQ = mS[zq(0xecc)]();
            let rR = Math[zq(0x796)](rO, rP);
            const rS = rQ[zq(0x40b)] / 0x2 / kR;
            rR > rS && (rR = rS);
            const rT = Math[zq(0x5e5)](rP, rO);
            return (
              (rG[zq(0x49b)][zq(0x977)] = zq(0x306) + rT + zq(0xb70)),
              (rG[zq(0x49b)][zq(0x40b)] = rR + "px"),
              im(rT, rR / rS),
              !![]
            );
          }
        }),
        (mS[zo(0xbfe)] = function (rL) {
          const zr = zo;
          rL[zr(0x4dc)] === rJ &&
            ((mS[zr(0x49b)][zr(0xdaa)] = zr(0x30c)), (rJ = null), im(0x0, 0x0));
        });
      function rK() {
        const zs = zo;
        (mS[zs(0x49b)][zs(0x985)] = rH + "px"),
          (mS[zs(0x49b)][zs(0x293)] = rI + "px");
      }
    }
    mT();
    function mU(rG) {
      const zt = ut;
      return [rG[zt(0x62c)] / kR, rG[zt(0xd61)] / kR];
    }
    var mV = document[ut(0xb01)](ut(0xbe7)),
      mW = document[ut(0xb01)](ut(0x686)),
      mX = document[ut(0xb01)](ut(0x2bb)),
      mY = {},
      mZ = {};
    if (kL) {
      document[ut(0xc9e)][ut(0xa1b)][ut(0xde0)](ut(0xcd8)),
        (window[ut(0x716)] = function (rH) {
          const zu = ut;
          for (let rI = 0x0; rI < rH[zu(0x4af)][zu(0xed7)]; rI++) {
            const rJ = rH[zu(0x4af)][rI],
              rK = rJ[zu(0x54d)];
            if (rK === ki) {
              mS[zu(0x7cc)](rJ);
              continue;
            } else {
              if (rK === mW)
                po(zu(0x731), !![]),
                  (mY[rJ[zu(0x4dc)]] = function () {
                    const zv = zu;
                    po(zv(0x731), ![]);
                  });
              else {
                if (rK === mV)
                  po(zu(0x6cf), !![]),
                    (mY[rJ[zu(0x4dc)]] = function () {
                      const zw = zu;
                      po(zw(0x6cf), ![]);
                    });
                else
                  rK === mX &&
                    (po(zu(0xe27), !![]),
                    (mY[rJ[zu(0x4dc)]] = function () {
                      const zx = zu;
                      po(zx(0xe27), ![]);
                    }));
              }
            }
            if (mJ) continue;
            if (rK[zu(0x558)]) {
              const rL = n2(rK);
              mO(rJ),
                mJ && (mZ[rJ[zu(0x4dc)]] = mR),
                (mY[rJ[zu(0x4dc)]] = function () {
                  const zy = zu;
                  mJ && mQ(), (rL[zy(0xc9d)] = ![]);
                });
            }
          }
        });
      const rG = {};
      (rG[ut(0xc8e)] = ![]),
        document[ut(0x657)](
          ut(0x2c9),
          function (rH) {
            const zz = ut;
            for (let rI = 0x0; rI < rH[zz(0x4af)][zz(0xed7)]; rI++) {
              const rJ = rH[zz(0x4af)][rI];
              mS[zz(0x512)](rJ) && rH[zz(0x755)]();
              if (mZ[rJ[zz(0x4dc)]]) mZ[rJ[zz(0x4dc)]](rJ), rH[zz(0x755)]();
              else mJ && rH[zz(0x755)]();
            }
          },
          rG
        ),
        (window[ut(0x2e5)] = function (rH) {
          const zA = ut;
          for (let rI = 0x0; rI < rH[zA(0x4af)][zA(0xed7)]; rI++) {
            const rJ = rH[zA(0x4af)][rI];
            mS[zA(0xbfe)](rJ),
              mY[rJ[zA(0x4dc)]] &&
                (mY[rJ[zA(0x4dc)]](),
                delete mY[rJ[zA(0x4dc)]],
                delete mZ[rJ[zA(0x4dc)]]);
          }
        });
    } else {
      document[ut(0xc9e)][ut(0xa1b)][ut(0xde0)](ut(0xd00));
      let rH = ![];
      (window[ut(0x66d)] = function (rI) {
        const zB = ut;
        rI[zB(0x7aa)] === 0x0 && ((rH = !![]), mO(rI));
      }),
        (document[ut(0x7ea)] = function (rI) {
          const zC = ut;
          mR(rI);
          const rJ = rI[zC(0x54d)];
          if (rJ[zC(0x558)] && !rH) {
            const rK = n2(rJ);
            rJ[zC(0x917)] = rJ[zC(0x66d)] = function () {
              const zD = zC;
              rK[zD(0xc9d)] = ![];
            };
          }
        }),
        (document[ut(0xa3e)] = function (rI) {
          const zE = ut;
          rI[zE(0x7aa)] === 0x0 && ((rH = ![]), mQ());
        }),
        (km[ut(0x7ea)] = ki[ut(0x7ea)] =
          function (rI) {
            const zF = ut;
            (nc = rI[zF(0x62c)] - kU() / 0x2),
              (nd = rI[zF(0xd61)] - kV() / 0x2);
            if (!p9[zF(0x3ff)] && iy && !mE) {
              const rJ = Math[zF(0x796)](nc, nd),
                rK = Math[zF(0x5e5)](nd, nc);
              im(rK, rJ < 0x32 ? rJ / 0x64 : 0x1);
            }
          });
    }
    function n0(rI, rJ, rK) {
      const zG = ut;
      return Math[zG(0x49f)](rJ, Math[zG(0xc36)](rI, rK));
    }
    var n1 = [];
    function n2(rI) {
      const zH = ut;
      let rJ = n1[zH(0x5cc)]((rK) => rK["el"] === rI);
      if (rJ) return (rJ[zH(0xc9d)] = !![]), rJ;
      (rJ =
        typeof rI[zH(0x558)] === zH(0xafa)
          ? rI[zH(0x558)]()
          : nI(rI[zH(0x558)], rI[zH(0xc74)])),
        (rJ[zH(0xc9d)] = !![]),
        (rJ[zH(0x2f5)] = 0x0),
        (rJ[zH(0x49b)][zH(0xbc1)] = zH(0x60f)),
        (rJ[zH(0x49b)][zH(0x977)] = zH(0x30c)),
        kH[zH(0x2e9)](rJ);
      if (kL)
        (rJ[zH(0x49b)][zH(0x278)] = zH(0x8d3)),
          (rJ[zH(0x49b)][zH(0x293)] = zH(0x8d3)),
          (rJ[zH(0x49b)][zH(0x225)] = zH(0x555)),
          (rJ[zH(0x49b)][zH(0x985)] = zH(0x555));
      else {
        const rK = rI[zH(0xecc)](),
          rL = rJ[zH(0xecc)]();
        (rJ[zH(0x49b)][zH(0x293)] =
          n0(
            rI[zH(0x8e7)]
              ? (rK[zH(0x293)] + rK[zH(0x965)]) / kR + 0xa
              : (rK[zH(0x293)] - rL[zH(0x965)]) / kR - 0xa,
            0xa,
            window[zH(0x743)] / kR - 0xa
          ) + "px"),
          (rJ[zH(0x49b)][zH(0x985)] =
            n0(
              (rK[zH(0x985)] + rK[zH(0x40b)] / 0x2 - rL[zH(0x40b)] / 0x2) / kR,
              0xa,
              window[zH(0x706)] / kR - 0xa - rL[zH(0x40b)] / kR
            ) + "px"),
          (rJ[zH(0x49b)][zH(0x225)] = zH(0x555)),
          (rJ[zH(0x49b)][zH(0x278)] = zH(0x555));
      }
      return (
        (rJ[zH(0x49b)][zH(0xb72)] = zH(0x30c)),
        (rJ[zH(0x49b)][zH(0x7e8)] = 0x0),
        (rJ["el"] = rI),
        n1[zH(0xbc0)](rJ),
        rJ
      );
    }
    var n3 = document[ut(0xb01)](ut(0x84e));
    function n4(rI, rJ = 0x1) {
      const zI = ut;
      !iS[rI] && ((iS[rI] = 0x0), p8(rI), oa()),
        (iS[rI] += rJ),
        o8[rI][zI(0x387)](iS[rI]),
        iS[rI] <= 0x0 && (delete iS[rI], o8[rI][zI(0x388)](), oa()),
        n5();
    }
    function n5() {
      const zJ = ut;
      n3[zJ(0x26f)] = "";
      Object[zJ(0x520)](iS)[zJ(0xed7)] === 0x0
        ? (n3[zJ(0x49b)][zJ(0xdaa)] = zJ(0x30c))
        : (n3[zJ(0x49b)][zJ(0xdaa)] = "");
      const rI = {};
      for (const rJ in iS) {
        const rK = dC[rJ],
          rL = iS[rJ];
        rI[rK[zJ(0x23b)]] = (rI[rK[zJ(0x23b)]] || 0x0) + rL;
      }
      oC(n3, rI);
      for (const rM in oo) {
        const rN = oo[rM];
        rN[zJ(0xa1b)][rI[rM] ? zJ(0xeae) : zJ(0xde0)](zJ(0xf0f));
      }
    }
    function n6(rI, rJ) {
      const zK = ut;
      if (rI === rJ) return;
      il(new Uint8Array([cI[zK(0xb0f)], rI, rJ]));
    }
    function n7(rI) {
      const zL = ut;
      return rI[zL(0xa76)] || rI[zL(0xb01)](zL(0xce7));
    }
    function n8(rI, rJ, rK = !![]) {
      const zM = ut,
        rL = mI[zM(0x5cc)]((rV) => rV === rI);
      if (rL) return rL[zM(0x419)](rJ), rL;
      let rM,
        rN,
        rO,
        rP,
        rQ = 0x0,
        rR = 0x0,
        rS = 0x0,
        rT;
      (rI[zM(0x419)] = function (rV, rW) {
        const zN = zM;
        (rT = rI[zN(0xb66)] || rI[zN(0x942)]),
          (rT[zN(0xa76)] = rI),
          (rI[zN(0xa68)] = rT),
          (rI[zN(0x4aa)] = ![]),
          (rI[zN(0xdb7)] = ![]);
        const rX = rI[zN(0xecc)]();
        rV[zN(0x436)] === void 0x0
          ? ((rQ = rV[zN(0x62c)] - rX["x"]),
            (rR = rV[zN(0xd61)] - rX["y"]),
            rI[zN(0x7ed)](rV),
            (rM = rO),
            (rN = rP))
          : ((rM = rX["x"]),
            (rN = rX["y"]),
            rI[zN(0x3fa)](rV),
            rI[zN(0x853)](rW)),
          rU();
      }),
        (rI[zM(0x853)] = function (rV = !![]) {
          const zO = zM;
          rI[zO(0xdb7)] = !![];
          rT[zO(0xa76)] === rI && (rT[zO(0xa76)] = null);
          if (!rI[zO(0xb66)])
            rI[zO(0x3fa)](rT),
              Math[zO(0x796)](rO - rM, rP - rN) > 0x32 * kR &&
                rI[zO(0x3fa)](mN);
          else {
            if (rV) {
              const rW = n7(rI[zO(0xb66)]);
              (rI[zO(0xef4)] = rW), rW && n8(rW, rT, ![]);
            }
          }
          rI[zO(0xb66)] !== rT && (rI[zO(0xed8)] = 0x0),
            (rI[zO(0xb66)][zO(0xa76)] = rI);
        }),
        (rI[zM(0x3fa)] = function (rV) {
          const zP = zM;
          rI[zP(0xb66)] = rV;
          const rW = rV[zP(0xecc)]();
          (rO = rW["x"]),
            (rP = rW["y"]),
            (rI[zP(0x49b)][zP(0xc71)] =
              rV === mN ? zP(0x662) : getComputedStyle(rV)[zP(0xc71)]);
        }),
        (rI[zM(0x7ed)] = function (rV) {
          const zQ = zM;
          (rO = rV[zQ(0x62c)] - rQ),
            (rP = rV[zQ(0xd61)] - rR),
            (rI[zQ(0xb66)] = null);
          let rW = Infinity,
            rX = null;
          const rY = ko[zQ(0x7bd)](zQ(0x4a9));
          for (let rZ = 0x0; rZ < rY[zQ(0xed7)]; rZ++) {
            const s0 = rY[rZ],
              s1 = s0[zQ(0xecc)](),
              s2 = Math[zQ(0x796)](
                s1["x"] + s1[zQ(0x40b)] / 0x2 - rV[zQ(0x62c)],
                s1["y"] + s1[zQ(0x965)] / 0x2 - rV[zQ(0xd61)]
              );
            s2 < 0x1e * kR && s2 < rW && ((rX = s0), (rW = s2));
          }
          rX && rX !== rT && rI[zQ(0x3fa)](rX);
        }),
        rI[zM(0x419)](rJ, rK),
        rI[zM(0xa1b)][zM(0xde0)](zM(0x226)),
        kH[zM(0x2e9)](rI);
      function rU() {
        const zR = zM;
        (rI[zR(0x49b)][zR(0x985)] = rM / kR + "px"),
          (rI[zR(0x49b)][zR(0x293)] = rN / kR + "px");
      }
      return (
        (rI[zM(0x1ff)] = function () {
          const zS = zM;
          rI[zS(0xb66)] && rI[zS(0x3fa)](rI[zS(0xb66)]);
        }),
        (rI[zM(0x915)] = function () {
          const zT = zM;
          (rM = pu(rM, rO, 0x64)), (rN = pu(rN, rP, 0x64)), rU();
          let rV = 0x0,
            rW = Infinity;
          rI[zT(0xb66)]
            ? ((rW = Math[zT(0x796)](rO - rM, rP - rN)),
              (rV = rW > 0x5 ? 0x1 : 0x0))
            : (rV = 0x1),
            (rS = pu(rS, rV, 0x64)),
            (rI[zT(0x49b)][zT(0x977)] =
              zT(0x8af) +
              (0x1 + 0.3 * rS) +
              zT(0xa30) +
              rS * Math[zT(0xc44)](Date[zT(0x8ea)]() / 0x96) * 0xa +
              zT(0xad3)),
            rI[zT(0xdb7)] &&
              rS < 0.05 &&
              rW < 0x5 &&
              (rI[zT(0xa1b)][zT(0xeae)](zT(0x226)),
              (rI[zT(0x49b)][zT(0x985)] =
                rI[zT(0x49b)][zT(0x293)] =
                rI[zT(0x49b)][zT(0x977)] =
                rI[zT(0x49b)][zT(0xc71)] =
                rI[zT(0x49b)][zT(0x622)] =
                  ""),
              (rI[zT(0x4aa)] = !![]),
              rI[zT(0xb66)][zT(0x2e9)](rI),
              (rI[zT(0xb66)][zT(0xa76)] = null),
              (rI[zT(0xb66)] = null));
        }),
        mI[zM(0xbc0)](rI),
        rI
      );
    }
    var n9 = cY[ut(0x987)];
    document[ut(0x64f)] = function () {
      return ![];
    };
    var na = 0x0,
      nb = 0x0,
      nc = 0x0,
      nd = 0x0,
      ne = 0x1,
      nf = 0x1;
    document[ut(0xa8c)] = function (rI) {
      const zU = ut;
      rI[zU(0x54d)] === ki &&
        ((ne *= rI[zU(0x43e)] < 0x0 ? 1.1 : 0.9),
        (ne = Math[zU(0xc36)](0x3, Math[zU(0x49f)](0x1, ne))));
    };
    const ng = {};
    (ng[ut(0x2e0)] = ut(0x60d)),
      (ng["me"] = ut(0xb0c)),
      (ng[ut(0xb60)] = ut(0xe93));
    var nh = ng,
      ni = {};
    function nj(rI, rJ) {
      nk(rI, null, null, null, jx(rJ));
    }
    function nk(rI, rJ, rK, rL = nh[ut(0x2e0)], rM) {
      const zV = ut,
        rN = nO(zV(0xa4b));
      if (!rM) {
        if (rJ) {
          const rP = nO(zV(0x341));
          k8(rP, rJ + ":"), rN[zV(0x2e9)](rP);
        }
        const rO = nO(zV(0x72f));
        k8(rO, rK),
          rN[zV(0x2e9)](rO),
          (rN[zV(0x477)][0x0][zV(0x49b)][zV(0xd5d)] = rL),
          rJ && rN[zV(0x6f1)](nO(zV(0x3f5)));
      } else rN[zV(0x26f)] = rM;
      ph[zV(0x2e9)](rN);
      while (ph[zV(0x477)][zV(0xed7)] > 0x3c) {
        ph[zV(0x477)][0x0][zV(0xeae)]();
      }
      return (
        (ph[zV(0x517)] = ph[zV(0x216)]),
        (rN[zV(0xe72)] = rK),
        (rN[zV(0x992)] = rL),
        nl(rI, rN),
        rN
      );
    }
    function nl(rI, rJ) {
      const zW = ut;
      (rJ["t"] = 0x0), (rJ[zW(0xf37)] = 0x0);
      if (!ni[rI]) ni[rI] = [];
      ni[rI][zW(0xbc0)](rJ);
    }
    var nm = {};
    ki[ut(0x66d)] = window[ut(0xa3e)] = nu(function (rI) {
      const zX = ut,
        rJ = zX(0x681) + rI[zX(0x7aa)];
      po(rJ, rI[zX(0x8ca)] === zX(0xaf8));
    });
    var nn = 0x0;
    function no(rI) {
      const zY = ut,
        rJ = 0x200,
        rK = rJ / 0x64,
        rL = document[zY(0xeb2)](zY(0x4f6));
      rL[zY(0x40b)] = rL[zY(0x965)] = rJ;
      const rM = rL[zY(0x5d5)]("2d");
      rM[zY(0xa21)](rJ / 0x2, rJ / 0x2), rM[zY(0x2db)](rK), rI[zY(0x34b)](rM);
      const rN = (rI[zY(0xa6b)] ? zY(0x500) : zY(0x474)) + rI[zY(0x4d2)];
      np(rL, rN);
    }
    function np(rI, rJ) {
      const zZ = ut,
        rK = document[zZ(0xeb2)]("a");
      (rK[zZ(0xa3b)] = rJ),
        (rK[zZ(0x3a0)] = typeof rI === zZ(0x9cf) ? rI : rI[zZ(0xcff)]()),
        rK[zZ(0x70a)](),
        hK(rJ + zZ(0xc51), hP[zZ(0xa94)]);
    }
    var nq = 0x0;
    setInterval(function () {
      nq = 0x0;
    }, 0x1770),
      setInterval(function () {
        const A0 = ut;
        nv[A0(0xed7)] = 0x0;
      }, 0x2710);
    var nr = ![],
      ns = ![];
    function nt(rI) {
      const A1 = ut;
      rI = rI[A1(0x6e4)]();
      if (!rI) hK(A1(0x832)), hc(A1(0x832));
      else
        rI[A1(0xed7)] < cN || rI[A1(0xed7)] > cM
          ? (hK(A1(0x2e4)), hc(A1(0x2e4)))
          : (hK(A1(0xd53) + rI + A1(0x802), hP[A1(0xd4c)]),
            hc(A1(0xd53) + rI + A1(0x802)),
            mw(rI));
    }
    document[ut(0x5ce)] = document[ut(0xd3c)] = nu(function (rI) {
      const A2 = ut;
      rI[A2(0xc22)] && rI[A2(0x755)]();
      (nr = rI[A2(0xc22)]), (ns = rI[A2(0xa4f)]);
      if (rI[A2(0x33c)] === 0x9) {
        rI[A2(0x755)]();
        return;
      }
      if (document[A2(0x41d)] && document[A2(0x41d)][A2(0x436)] === A2(0xc5e)) {
        if (rI[A2(0x8ca)] === A2(0x8b8) && rI[A2(0x33c)] === 0xd) {
          if (document[A2(0x41d)] === hF) hG[A2(0x70a)]();
          else {
            if (document[A2(0x41d)] === pg) {
              let rJ = pg[A2(0x95d)][A2(0x6e4)]()[A2(0xe22)](0x0, cL);
              if (rJ && hW) {
                if (pN - nn > 0x3e8) {
                  const rK = rJ[A2(0x9d3)](A2(0xd74));
                  if (rK || rJ[A2(0x9d3)](A2(0xe56))) {
                    const rL = rJ[A2(0xe22)](rK ? 0x7 : 0x9);
                    if (!rL) hK(A2(0x4ff));
                    else {
                      if (rK) {
                        const rM = eM[rL];
                        !rM ? hK(A2(0x3ab) + rL + "!") : no(rM);
                      } else {
                        const rN = dF[rL];
                        !rN ? hK(A2(0xecf) + rL + "!") : no(rN);
                      }
                    }
                  } else {
                    if (rJ[A2(0x9d3)](A2(0x611))) np(qv, A2(0x967));
                    else {
                        var inputChat = rJ;
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
                      if (rJ[A2(0x9d3)](A2(0xba5))) {
                        const rO = rJ[A2(0xe22)](0x9);
                        nt(rO);
                      } else {
                        hack.speak = (txt) => {
                        let rP = 0x0;
                        for (let rQ = 0x0; rQ < nv[A2(0xed7)]; rQ++) {
                          nw(txt, nv[rQ]) > 0.95 && rP++;
                        }
                        rP >= 0x3 && (nq += 0xa);
                        nq++;
                        if (nq > 0x3) hK(A2(0x8b5)), (nn = pN + 0xea60);
                        else {
                          nv[A2(0xbc0)](txt);
                          if (nv[A2(0xed7)] > 0xa) nv[A2(0xd38)]();
                          (txt = decodeURIComponent(
                            encodeURIComponent(txt)
                              [A2(0xd73)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                              [A2(0xd73)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                          )),
                            il(
                              new Uint8Array([
                                cI[A2(0x5f8)],
                                ...new TextEncoder()[A2(0x7fb)](txt),
                              ])
                            ),
                            (nn = pN);
                        }
                      };hack.speak(inputChat);}
                    }
                  }
                } else nk(-0x1, null, A2(0x698), nh[A2(0xb60)]);
              }
              (pg[A2(0x95d)] = ""), pg[A2(0xef0)]();
            }
          }
        }
        return;
      }
      po(rI[A2(0xcc8)], rI[A2(0x8ca)] === A2(0xccb));
    });
    function nu(rI) {
      return function (rJ) {
        const A3 = b;
        rJ instanceof Event && rJ[A3(0xa90)] && !rJ[A3(0x816)] && rI(rJ);
      };
    }
    var nv = [];
    function nw(rI, rJ) {
      const A4 = ut;
      var rK = rI,
        rL = rJ;
      rI[A4(0xed7)] < rJ[A4(0xed7)] && ((rK = rJ), (rL = rI));
      var rM = rK[A4(0xed7)];
      if (rM == 0x0) return 0x1;
      return (rM - nx(rK, rL)) / parseFloat(rM);
    }
    function nx(rI, rJ) {
      const A5 = ut;
      (rI = rI[A5(0xb5f)]()), (rJ = rJ[A5(0xb5f)]());
      var rK = new Array();
      for (var rL = 0x0; rL <= rI[A5(0xed7)]; rL++) {
        var rM = rL;
        for (var rN = 0x0; rN <= rJ[A5(0xed7)]; rN++) {
          if (rL == 0x0) rK[rN] = rN;
          else {
            if (rN > 0x0) {
              var rO = rK[rN - 0x1];
              if (rI[A5(0x8f2)](rL - 0x1) != rJ[A5(0x8f2)](rN - 0x1))
                rO = Math[A5(0xc36)](Math[A5(0xc36)](rO, rM), rK[rN]) + 0x1;
              (rK[rN - 0x1] = rM), (rM = rO);
            }
          }
        }
        if (rL > 0x0) rK[rJ[A5(0xed7)]] = rM;
      }
      return rK[rJ[A5(0xed7)]];
    }
    var ny = document[ut(0xb01)](ut(0xc30)),
      nz = document[ut(0xb01)](ut(0xeca));
    function nA(rI, rJ = 0x1) {
      const A6 = ut;
      rI[A6(0x94d)](),
        rI[A6(0x1f7)](0.25 * rJ, 0.25 * rJ),
        rI[A6(0xa21)](-0x4b, -0x4b),
        rI[A6(0x4cc)](),
        rI[A6(0x7eb)](0x4b, 0x28),
        rI[A6(0xa56)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        rI[A6(0xa56)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        rI[A6(0xa56)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        rI[A6(0xa56)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        rI[A6(0xa56)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        rI[A6(0xa56)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (rI[A6(0x74b)] = A6(0x2f1)),
        rI[A6(0x869)](),
        (rI[A6(0x401)] = rI[A6(0x452)] = A6(0xa7d)),
        (rI[A6(0xbdd)] = A6(0x7b2)),
        (rI[A6(0x4e5)] = 0xc),
        rI[A6(0x873)](),
        rI[A6(0xbad)]();
    }
    for (let rI = 0x0; rI < dC[ut(0xed7)]; rI++) {
      const rJ = dC[rI];
      if (rJ[ut(0x299)] !== void 0x0)
        switch (rJ[ut(0x299)]) {
          case df[ut(0x6ac)]:
            rJ[ut(0x34b)] = function (rK) {
              const A7 = ut;
              rK[A7(0x1f7)](2.5, 2.5), lO(rK);
            };
            break;
          case df[ut(0x2f0)]:
            rJ[ut(0x34b)] = function (rK) {
              const A8 = ut;
              rK[A8(0x2db)](0.9);
              const rL = pT();
              (rL[A8(0x9d2)] = !![]), rL[A8(0x4a7)](rK);
            };
            break;
          case df[ut(0x9b3)]:
            rJ[ut(0x34b)] = function (rK) {
              const A9 = ut;
              rK[A9(0x235)](-Math["PI"] / 0x2),
                rK[A9(0xa21)](-0x30, 0x0),
                pS[A9(0xcb3)](rK, ![]);
            };
            break;
          case df[ut(0x2b2)]:
            rJ[ut(0x34b)] = function (rK) {
              const Aa = ut;
              rK[Aa(0x235)](Math["PI"] / 0xa),
                rK[Aa(0xa21)](0x3, 0x15),
                lP(rK, !![]);
            };
            break;
          case df[ut(0xcc5)]:
            rJ[ut(0x34b)] = function (rK) {
              nA(rK);
            };
            break;
          case df[ut(0x393)]:
            rJ[ut(0x34b)] = function (rK) {
              const Ab = ut;
              rK[Ab(0xa21)](0x0, 0x3),
                rK[Ab(0x235)](-Math["PI"] / 0x4),
                rK[Ab(0x2db)](0.4),
                pS[Ab(0x6e5)](rK),
                rK[Ab(0x4cc)](),
                rK[Ab(0xc20)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rK[Ab(0x4e5)] = 0x8),
                (rK[Ab(0xbdd)] = Ab(0x9ff)),
                rK[Ab(0x873)]();
            };
            break;
          case df[ut(0x36d)]:
            rJ[ut(0x34b)] = function (rK) {
              const Ac = ut;
              rK[Ac(0xa21)](0x0, 0x7),
                rK[Ac(0x2db)](0.8),
                pS[Ac(0x5c8)](rK, 0.5);
            };
            break;
          case df[ut(0xa9a)]:
            rJ[ut(0x34b)] = function (rK) {
              const Ad = ut;
              rK[Ad(0x2db)](1.3), lS(rK);
            };
            break;
          default:
            rJ[ut(0x34b)] = function (rK) {};
        }
      else {
        const rK = new lG(
          -0x1,
          rJ[ut(0x8ca)],
          0x0,
          0x0,
          rJ[ut(0xd76)],
          rJ[ut(0x420)] ? 0x10 : rJ[ut(0x31a)] * 1.1,
          0x0
        );
        (rK[ut(0xcd1)] = !![]),
          rJ[ut(0x2cf)] === 0x1
            ? (rJ[ut(0x34b)] = function (rL) {
                const Ae = ut;
                rK[Ae(0x4a7)](rL);
              })
            : (rJ[ut(0x34b)] = function (rL) {
                const Af = ut;
                for (let rM = 0x0; rM < rJ[Af(0x2cf)]; rM++) {
                  rL[Af(0x94d)]();
                  const rN = (rM / rJ[Af(0x2cf)]) * Math["PI"] * 0x2;
                  rJ[Af(0x860)]
                    ? rL[Af(0xa21)](...le(rJ[Af(0x340)], 0x0, rN))
                    : (rL[Af(0x235)](rN), rL[Af(0xa21)](rJ[Af(0x340)], 0x0)),
                    rL[Af(0x235)](rJ[Af(0x66a)]),
                    rK[Af(0x4a7)](rL),
                    rL[Af(0xbad)]();
                }
              });
      }
    }
    const nB = {};
    (nB[ut(0xd13)] = ut(0xebd)),
      (nB[ut(0x675)] = ut(0x670)),
      (nB[ut(0x3b8)] = ut(0x541)),
      (nB[ut(0xf1a)] = ut(0x3ef)),
      (nB[ut(0x342)] = ut(0x30e)),
      (nB[ut(0x865)] = ut(0x2e2)),
      (nB[ut(0x563)] = ut(0x8ec));
    var nC = nB;
    function nD() {
      const Ag = ut,
        rL = document[Ag(0xb01)](Ag(0x4fd));
      let rM = Ag(0x542);
      for (let rN = 0x0; rN < 0xc8; rN++) {
        const rO = d6(rN),
          rP = 0xc8 * rO,
          rQ = 0x19 * rO,
          rR = d5(rN);
        rM +=
          Ag(0x4ee) +
          (rN + 0x1) +
          Ag(0xa24) +
          k9(Math[Ag(0xa7d)](rP)) +
          Ag(0xa24) +
          k9(Math[Ag(0xa7d)](rQ)) +
          Ag(0xa24) +
          rR +
          Ag(0x923);
      }
      (rM += Ag(0x516)), (rM += Ag(0x6c0)), (rL[Ag(0x26f)] = rM);
    }
    nD();
    function nE(rL, rM) {
      const Ah = ut,
        rN = eM[rL],
        rO = rN[Ah(0x4d2)],
        rP = rN[Ah(0x23b)];
      return (
        "x" +
        rM[Ah(0x2cf)] * rM[Ah(0xac7)] +
        ("\x20" + rO + Ah(0x396) + hQ[rP] + Ah(0x5a9) + hN[rP] + ")")
      );
    }
    function nF(rL) {
      const Ai = ut;
      return rL[Ai(0x284)](0x2)[Ai(0xd73)](/\.?0+$/, "");
    }
    var nG = [
        [ut(0x51b), ut(0x1f2), nC[ut(0xd13)]],
        [ut(0x663), ut(0xf2b), nC[ut(0x675)]],
        [ut(0xb18), ut(0x837), nC[ut(0x3b8)]],
        [ut(0x676), ut(0x2b3), nC[ut(0xf1a)]],
        [ut(0xe76), ut(0x4ed), nC[ut(0x865)]],
        [ut(0xc19), ut(0x9a5), nC[ut(0x342)]],
        [ut(0xc38), ut(0x7a8), nC[ut(0x563)]],
        [ut(0xe88), ut(0xd65), nC[ut(0x563)], (rL) => "+" + k9(rL)],
        [ut(0xb13), ut(0x277), nC[ut(0x563)], (rL) => "+" + k9(rL)],
        [ut(0x889), ut(0x738), nC[ut(0x563)]],
        [
          ut(0x6b8),
          ut(0x346),
          nC[ut(0x563)],
          (rL) => Math[ut(0xa7d)](rL * 0x64) + "%",
        ],
        [ut(0xb59), ut(0x270), nC[ut(0x563)], (rL) => "+" + nF(rL) + ut(0xca9)],
        [ut(0x7b1), ut(0x834), nC[ut(0x3b8)], (rL) => k9(rL) + "/s"],
        [ut(0x6c3), ut(0x834), nC[ut(0x3b8)], (rL) => k9(rL) + ut(0xd93)],
        [
          ut(0x487),
          ut(0x54c),
          nC[ut(0x563)],
          (rL) => (rL > 0x0 ? "+" : "") + rL,
        ],
        [ut(0x4fb), ut(0x46c), nC[ut(0x342)], (rL) => "+" + rL + "%"],
        [
          ut(0xd8e),
          ut(0x95e),
          nC[ut(0x342)],
          (rL) => "+" + parseInt(rL * 0x64) + "%",
        ],
        [ut(0xf28), ut(0xb0b), nC[ut(0x563)], (rL) => "-" + rL + "%"],
        [ut(0x995), ut(0x753), nC[ut(0x563)], nE],
        [ut(0x39c), ut(0xa05), nC[ut(0x342)], (rL) => rL / 0x3e8 + "s"],
        [ut(0x863), ut(0x6da), nC[ut(0x342)], (rL) => rL + "s"],
        [ut(0xebe), ut(0x630), nC[ut(0x342)], (rL) => k9(rL) + ut(0x680)],
        [ut(0x616), ut(0x761), nC[ut(0x342)], (rL) => rL + "s"],
        [ut(0x858), ut(0x59d), nC[ut(0x342)], (rL) => rL / 0x3e8 + "s"],
        [ut(0x818), ut(0x7e0), nC[ut(0x342)]],
        [ut(0x476), ut(0x539), nC[ut(0x342)]],
        [ut(0x81d), ut(0x5eb), nC[ut(0x342)], (rL) => rL + ut(0x809)],
        [ut(0xce0), ut(0x68f), nC[ut(0x342)], (rL) => rL + ut(0x809)],
        [ut(0xa8d), ut(0x9ab), nC[ut(0x342)]],
        [ut(0xe89), ut(0x9b7), nC[ut(0x563)]],
        [ut(0x2e7), ut(0xd45), nC[ut(0x342)], (rL) => rL / 0x3e8 + "s"],
        [ut(0x790), ut(0x9db), nC[ut(0x3b8)], (rL) => k9(rL) + "/s"],
        [ut(0x5f7), ut(0x7f8), nC[ut(0x342)]],
        [ut(0x48e), ut(0x478), nC[ut(0x563)]],
        [
          ut(0x496),
          ut(0xdc5),
          nC[ut(0x342)],
          (rL, rM) => nF(rL * rM[ut(0x31a)]),
        ],
        [ut(0xb6c), ut(0x8f4), nC[ut(0x342)]],
        [ut(0x53b), ut(0x239), nC[ut(0x563)]],
        [ut(0x366), ut(0xf26), nC[ut(0x342)]],
        [ut(0x83d), ut(0x404), nC[ut(0x342)]],
        [ut(0x59a), ut(0x9f6), nC[ut(0x342)]],
        [
          ut(0x71e),
          ut(0xb22),
          nC[ut(0x342)],
          (rL) => "+" + nF(rL * 0x64) + "%",
        ],
        [ut(0x408), ut(0x6a3), nC[ut(0x865)]],
        [ut(0x651), ut(0x762), nC[ut(0x342)]],
        [ut(0xa0e), ut(0x885), nC[ut(0x3b8)]],
        [ut(0x369), ut(0x6da), nC[ut(0x342)], (rL) => rL + "s"],
        [ut(0xc3e), ut(0xbda), nC[ut(0x342)]],
        [ut(0xbf6), ut(0xaa7), nC[ut(0x563)], (rL) => rL / 0x3e8 + "s"],
      ],
      nH = [
        [ut(0xe00), ut(0x9be), nC[ut(0x342)]],
        [ut(0xee2), ut(0xe9a), nC[ut(0x563)], (rL) => k9(rL * 0x64) + "%"],
        [ut(0x3e7), ut(0x89f), nC[ut(0x563)]],
        [ut(0xaf5), ut(0x5df), nC[ut(0x342)]],
        [ut(0x3eb), ut(0xab4), nC[ut(0x563)]],
        [ut(0x4fb), ut(0x46c), nC[ut(0x342)], (rL) => "+" + rL + "%"],
        [ut(0x29a), ut(0xd90), nC[ut(0x342)], (rL) => k9(rL) + "/s"],
        [ut(0xd29), ut(0x598), nC[ut(0xd13)], (rL) => rL * 0x64 + ut(0x4a4)],
        [ut(0xcf4), ut(0xbfa), nC[ut(0x342)], (rL) => rL + "s"],
        [
          ut(0x35d),
          ut(0x5b2),
          nC[ut(0x563)],
          (rL) => "-" + parseInt((0x1 - rL) * 0x64) + "%",
        ],
      ];
    function nI(rL, rM = !![]) {
      const Aj = ut;
      let rN = "",
        rO = "",
        rP;
      rL[Aj(0x299)] === void 0x0
        ? ((rP = nG),
          rL[Aj(0xa1a)] &&
            (rO =
              Aj(0xe37) +
              (rL[Aj(0xa1a)] / 0x3e8 +
                "s" +
                (rL[Aj(0xe06)] > 0x0
                  ? Aj(0x3a7) + rL[Aj(0xe06)] / 0x3e8 + "s"
                  : "")) +
              Aj(0xa83)))
        : (rP = nH);
      for (let rR = 0x0; rR < rP[Aj(0xed7)]; rR++) {
        const [rS, rT, rU, rV] = rP[rR],
          rW = rL[rS];
        rW &&
          rW !== 0x0 &&
          (rN +=
            Aj(0x34e) +
            rU +
            Aj(0x4f7) +
            rT +
            Aj(0xc63) +
            (rV ? rV(rW, rL) : k9(rW)) +
            Aj(0x52f));
      }
      const rQ = nO(
        Aj(0x58d) +
          rL[Aj(0x4d2)] +
          Aj(0xc04) +
          hN[rL[Aj(0x23b)]] +
          Aj(0xeb3) +
          hQ[rL[Aj(0x23b)]] +
          Aj(0x6a0) +
          rO +
          Aj(0x66f) +
          rL[Aj(0xd8b)] +
          Aj(0x6a0) +
          rN +
          Aj(0xbd3)
      );
      if (rL[Aj(0xad9)] && rM) {
        rQ[Aj(0xd95)][Aj(0x49b)][Aj(0xb20)] = Aj(0x8d3);
        for (let rX = 0x0; rX < rL[Aj(0xad9)][Aj(0xed7)]; rX++) {
          const [rY, rZ] = rL[Aj(0xad9)][rX],
            s0 = nO(Aj(0xbcf));
          rQ[Aj(0x2e9)](s0);
          const s1 = f5[rZ][rL[Aj(0x23b)]];
          for (let s2 = 0x0; s2 < s1[Aj(0xed7)]; s2++) {
            const [s3, s4] = s1[s2],
              s5 = eW(rY, s4),
              s6 = nO(
                Aj(0x79a) +
                  s5[Aj(0x23b)] +
                  "\x22\x20" +
                  qy(s5) +
                  Aj(0xb91) +
                  s3 +
                  Aj(0x950)
              );
            s0[Aj(0x2e9)](s6);
          }
        }
      }
      return rQ;
    }
    function nJ() {
      const Ak = ut;
      mJ && (mJ[Ak(0xeae)](), (mJ = null));
      const rL = ko[Ak(0x7bd)](Ak(0xce7));
      for (let rM = 0x0; rM < rL[Ak(0xed7)]; rM++) {
        const rN = rL[rM];
        rN[Ak(0xeae)]();
      }
      for (let rO = 0x0; rO < iO; rO++) {
        const rP = nO(Ak(0x861));
        rP[Ak(0xf33)] = rO;
        const rQ = iP[rO];
        if (rQ) {
          const rR = nO(
            Ak(0x21f) + rQ[Ak(0x23b)] + "\x22\x20" + qy(rQ) + Ak(0x41a)
          );
          (rR[Ak(0x558)] = rQ),
            (rR[Ak(0xdf4)] = !![]),
            (rR[Ak(0x9d7)] = iR[Ak(0x258)]()),
            nN(rR, rQ),
            rP[Ak(0x2e9)](rR),
            (iQ[rR[Ak(0x9d7)]] = rR);
        }
        rO >= iN
          ? (rP[Ak(0x2e9)](nO(Ak(0xc07) + ((rO - iN + 0x1) % 0xa) + Ak(0xa03))),
            nz[Ak(0x2e9)](rP))
          : ny[Ak(0x2e9)](rP);
      }
    }
    function nK(rL) {
      const Al = ut;
      return rL < 0.5
        ? 0x4 * rL * rL * rL
        : 0x1 - Math[Al(0xe12)](-0x2 * rL + 0x2, 0x3) / 0x2;
    }
    var nL = [];
    function nM(rL, rM) {
      const Am = ut;
      (rL[Am(0xed8)] = 0x0), (rL[Am(0x6aa)] = 0x1);
      let rN = 0x1,
        rO = 0x0,
        rP = -0x1;
      rL[Am(0xa1b)][Am(0xde0)](Am(0x8a7)), rL[Am(0x4e7)](Am(0x49b), "");
      const rQ = nO(Am(0x82f));
      rL[Am(0x2e9)](rQ), nL[Am(0xbc0)](rQ);
      const rR = qq;
      rQ[Am(0x40b)] = rQ[Am(0x965)] = rR;
      const rS = rQ[Am(0x5d5)]("2d");
      (rQ[Am(0x2cc)] = function () {
        const An = Am;
        rS[An(0x749)](0x0, 0x0, rR, rR);
        rO < 0.99 &&
          ((rS[An(0x557)] = 0x1 - rO),
          (rS[An(0x74b)] = An(0x525)),
          rS[An(0xde5)](0x0, 0x0, rR, (0x1 - rN) * rR));
        if (rO < 0.01) return;
        (rS[An(0x557)] = rO),
          rS[An(0x94d)](),
          rS[An(0x2db)](rR / 0x64),
          rS[An(0xa21)](0x32, 0x2d);
        let rT = rL[An(0xed8)];
        rT = nK(rT);
        const rU = Math["PI"] * 0x2 * rT;
        rS[An(0x235)](rU * 0x4),
          rS[An(0x4cc)](),
          rS[An(0x7eb)](0x0, 0x0),
          rS[An(0xc20)](0x0, 0x0, 0x64, 0x0, rU),
          rS[An(0x7eb)](0x0, 0x0),
          rS[An(0xc20)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rS[An(0x74b)] = An(0xbbd)),
          rS[An(0x869)](An(0xb94)),
          rS[An(0xbad)]();
      }),
        (rQ[Am(0x915)] = function () {
          const Ao = Am;
          rL[Ao(0xed8)] += pO / (rM[Ao(0xa1a)] + 0xc8);
          let rT = 0x1,
            rU = rL[Ao(0x6aa)];
          rL[Ao(0xed8)] >= 0x1 && (rT = 0x0);
          const rV = rL[Ao(0xb66)] || rL[Ao(0x942)];
          ((rV && rV[Ao(0x942)] === nz) || !iy) && ((rU = 0x1), (rT = 0x0));
          (rO = pu(rO, rT, 0x64)), (rN = pu(rN, rU, 0x64));
          const rW = Math[Ao(0xa7d)]((0x1 - rN) * 0x64),
            rX = Math[Ao(0xa7d)](rO * 0x64) / 0x64;
          rX == 0x0 && rW <= 0x0
            ? ((rQ[Ao(0x4be)] = ![]), (rQ[Ao(0x49b)][Ao(0xdaa)] = Ao(0x30c)))
            : ((rQ[Ao(0x4be)] = !![]), (rQ[Ao(0x49b)][Ao(0xdaa)] = "")),
            (rP = rW);
        }),
        rL[Am(0x2e9)](nO(Am(0xe96) + qy(rM) + Am(0x41a)));
    }
    function nN(rL, rM, rN = !![]) {
      const Ap = ut;
      rN && rM[Ap(0x299)] === void 0x0 && nM(rL, rM);
    }
    function nO(rL) {
      const Aq = ut;
      return (hB[Aq(0x26f)] = rL), hB[Aq(0x477)][0x0];
    }
    var nP = document[ut(0xb01)](ut(0xce1)),
      nQ = [];
    function nR() {
      const Ar = ut;
      (nP[Ar(0x26f)] = Ar(0x46a)[Ar(0x816)](eL * dH)),
        (nQ = Array[Ar(0xe4f)](nP[Ar(0x477)]));
    }
    nR();
    var nS = {};
    for (let rL = 0x0; rL < eK[ut(0xed7)]; rL++) {
      const rM = eK[rL];
      !nS[rM[ut(0x8ca)]] &&
        ((nS[rM[ut(0x8ca)]] = new lG(
          -0x1,
          rM[ut(0x8ca)],
          0x0,
          0x0,
          rM[ut(0x2c6)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          rM[ut(0xdc3)],
          0x1
        )),
        (nS[rM[ut(0x8ca)]][ut(0xcd1)] = !![]));
      const rN = nS[rM[ut(0x8ca)]];
      let rO = null;
      rM[ut(0x5c1)] !== void 0x0 &&
        (rO = new lG(-0x1, rM[ut(0x5c1)], 0x0, 0x0, 0x0, rM[ut(0xdc3)], 0x1)),
        (rM[ut(0x34b)] = function (rP) {
          const As = ut;
          rP[As(0x1f7)](0.5, 0.5),
            rN[As(0x4a7)](rP),
            rO &&
              (rP[As(0x235)](rN[As(0x9d6)]),
              rP[As(0xa21)](-rM[As(0xdc3)] * 0x2, 0x0),
              rO[As(0x4a7)](rP));
        });
    }
    function nT(rP, rQ = ![]) {
      const At = ut,
        rR = nO(At(0x21f) + rP[At(0x23b)] + "\x22\x20" + qy(rP) + At(0x41a));
      jY(rR), (rR[At(0x558)] = rP);
      if (rQ) return rR;
      const rS = dH * rP[At(0x523)] + rP[At(0x23b)],
        rT = nQ[rS];
      return nP[At(0x1fd)](rR, rT), rT[At(0xeae)](), (nQ[rS] = rR), rR;
    }
    var nU = document[ut(0xb01)](ut(0xa99)),
      nV = document[ut(0xb01)](ut(0x6a5)),
      nW = document[ut(0xb01)](ut(0x931)),
      nX = document[ut(0xb01)](ut(0x57c)),
      nY = document[ut(0xb01)](ut(0xb36)),
      nZ = nY[ut(0xb01)](ut(0xc70)),
      o0 = nY[ut(0xb01)](ut(0x678)),
      o1 = document[ut(0xb01)](ut(0xda3)),
      o2 = document[ut(0xb01)](ut(0x900)),
      o3 = ![],
      o4 = 0x0,
      o5 = ![];
    (nV[ut(0x4c5)] = function () {
      (o3 = !![]), (o4 = 0x0), (o5 = ![]);
    }),
      (nX[ut(0x4c5)] = function () {
        const Au = ut;
        if (this[Au(0xa1b)][Au(0x6ba)](Au(0x76b)) || jy) return;
        kI(Au(0xc18), (rP) => {
          rP && ((o3 = !![]), (o4 = 0x0), (o5 = !![]));
        });
      }),
      (nU[ut(0x26f)] = ut(0x46a)[ut(0x816)](dG * dH));
    var o6 = Array[ut(0xe4f)](nU[ut(0x477)]),
      o7 = document[ut(0xb01)](ut(0xd2c)),
      o8 = {};
    function o9() {
      const Av = ut;
      for (let rP in o8) {
        o8[rP][Av(0x388)]();
      }
      o8 = {};
      for (let rQ in iS) {
        p8(rQ);
      }
      oa();
    }
    function oa() {
      ob(o7);
    }
    function ob(rP) {
      const Aw = ut,
        rQ = Array[Aw(0xe4f)](rP[Aw(0x7bd)](Aw(0xce7)));
      rQ[Aw(0x604)]((rR, rS) => {
        const Ax = Aw,
          rT = rS[Ax(0x558)][Ax(0x23b)] - rR[Ax(0x558)][Ax(0x23b)];
        return rT === 0x0 ? rS[Ax(0x558)]["id"] - rR[Ax(0x558)]["id"] : rT;
      });
      for (let rR = 0x0; rR < rQ[Aw(0xed7)]; rR++) {
        const rS = rQ[rR];
        rP[Aw(0x2e9)](rS);
      }
    }
    function oc(rP, rQ) {
      const Ay = ut,
        rR = rQ[Ay(0x23b)] - rP[Ay(0x23b)];
      return rR === 0x0 ? rQ["id"] - rP["id"] : rR;
    }
    function od(rP, rQ = !![]) {
      const Az = ut,
        rR = nO(Az(0x20c) + rP[Az(0x23b)] + "\x22\x20" + qy(rP) + Az(0x6e2));
      setTimeout(function () {
        const AA = Az;
        rR[AA(0xa1b)][AA(0xeae)](AA(0xaf9));
      }, 0x1f4),
        (rR[Az(0x558)] = rP);
      if (rQ) {
      }
      return (rR[Az(0xa01)] = rR[Az(0xb01)](Az(0x7d8))), rR;
    }
    var oe = nO(ut(0x410)),
      of = oe[ut(0xb01)](ut(0x372)),
      og = oe[ut(0xb01)](ut(0x29f)),
      oh = oe[ut(0xb01)](ut(0x8fc)),
      oi = [];
    for (let rP = 0x0; rP < 0x5; rP++) {
      const rQ = nO(ut(0x46a));
      (rQ[ut(0x750)] = function (rR = 0x0) {
        const AB = ut,
          rS =
            (rP / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rR * Math["PI"] * 0x6,
          rT =
            0x32 +
            (rR > 0x0
              ? Math[AB(0x301)](Math[AB(0xc44)](rR * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[AB(0x49b)][AB(0x985)] = Math[AB(0x77b)](rS) * rT + 0x32 + "%"),
          (this[AB(0x49b)][AB(0x293)] = Math[AB(0xc44)](rS) * rT + 0x32 + "%");
      }),
        rQ[ut(0x750)](),
        (rQ[ut(0x2cf)] = 0x0),
        (rQ["el"] = null),
        (rQ[ut(0x419)] = function () {
          const AC = ut;
          (rQ[AC(0x2cf)] = 0x0), (rQ["el"] = null), (rQ[AC(0x26f)] = "");
        }),
        (rQ[ut(0x772)] = function (rR) {
          const AD = ut;
          if (!rQ["el"]) {
            const rS = od(oX, ![]);
            (rS[AD(0x4c5)] = function () {
              if (oZ || p1) return;
              p5(null);
            }),
              rQ[AD(0x2e9)](rS),
              (rQ["el"] = rS);
          }
          (rQ[AD(0x2cf)] += rR), p3(rQ["el"][AD(0xa01)], rQ[AD(0x2cf)]);
        }),
        of[ut(0x2e9)](rQ),
        oi[ut(0xbc0)](rQ);
    }
    var oj,
      ok = document[ut(0xb01)](ut(0xbc5)),
      ol = document[ut(0xb01)](ut(0xbc7)),
      om = document[ut(0xb01)](ut(0x57e)),
      on = document[ut(0xb01)](ut(0xac3)),
      oo = {};
    function op() {
      const AE = ut,
        rR = document[AE(0xb01)](AE(0x980));
      for (let rS = 0x0; rS < dH; rS++) {
        const rT = nO(AE(0xd2e) + rS + AE(0x315));
        (rT[AE(0x4c5)] = function () {
          const AF = AE;
          let rU = pn;
          pn = !![];
          for (const rV in o8) {
            const rW = dC[rV];
            if (rW[AF(0x23b)] !== rS) continue;
            const rX = o8[rV];
            rX[AF(0x451)][AF(0x70a)]();
          }
          pn = rU;
        }),
          (oo[rS] = rT),
          rR[AE(0x2e9)](rT);
      }
    }
    op();
    var oq = ![],
      or = document[ut(0xb01)](ut(0x3f0));
    or[ut(0x4c5)] = function () {
      const AG = ut;
      document[AG(0xc9e)][AG(0xa1b)][AG(0xa08)](AG(0x6ca)),
        (oq = document[AG(0xc9e)][AG(0xa1b)][AG(0x6ba)](AG(0x6ca)));
      const rR = oq ? AG(0x251) : AG(0x568);
      k8(ol, rR),
        k8(on, rR),
        oq
          ? (ok[AG(0x2e9)](oe), oe[AG(0x2e9)](nU), om[AG(0xeae)]())
          : (ok[AG(0x2e9)](om),
            om[AG(0x1fd)](nU, om[AG(0xd95)]),
            oe[AG(0xeae)]());
    };
    var os = document[ut(0xb01)](ut(0x427)),
      ot = ow(ut(0xd65), nC[ut(0x675)]),
      ou = ow(ut(0x423), nC[ut(0xd13)]),
      ov = ow(ut(0xd8a), nC[ut(0x865)]);
    function ow(rR, rS) {
      const AH = ut,
        rT = nO(AH(0x3dd) + rS + AH(0x77e) + rR + AH(0x295));
      return (
        (rT[AH(0xdb1)] = function (rU) {
          const AI = AH;
          k8(rT[AI(0x477)][0x1], k9(Math[AI(0xa7d)](rU)));
        }),
        os[AH(0x2e9)](rT),
        rT
      );
    }
    var ox = document[ut(0xb01)](ut(0xe04)),
      oy = document[ut(0xb01)](ut(0x8e9));
    oy[ut(0x26f)] = "";
    var oz = document[ut(0xb01)](ut(0x9df)),
      oA = {};
    function oB() {
      const AJ = ut;
      (oy[AJ(0x26f)] = ""), (oz[AJ(0x26f)] = "");
      const rR = {},
        rS = [];
      for (let rT in oA) {
        const rU = dC[rT],
          rV = oA[rT];
        (rR[rU[AJ(0x23b)]] = (rR[rU[AJ(0x23b)]] || 0x0) + rV),
          rS[AJ(0xbc0)]([rU, rV]);
      }
      if (rS[AJ(0xed7)] === 0x0) {
        ox[AJ(0x49b)][AJ(0xdaa)] = AJ(0x30c);
        return;
      }
      (ox[AJ(0x49b)][AJ(0xdaa)] = ""),
        rS[AJ(0x604)]((rW, rX) => {
          return oc(rW[0x0], rX[0x0]);
        })[AJ(0xaa2)](([rW, rX]) => {
          const AK = AJ,
            rY = od(rW);
          jY(rY), p3(rY[AK(0xa01)], rX), oy[AK(0x2e9)](rY);
        }),
        oC(oz, rR);
    }
    function oC(rR, rS) {
      const AL = ut;
      let rT = 0x0;
      for (let rU in d9) {
        const rV = rS[d9[rU]];
        if (rV !== void 0x0) {
          rT++;
          const rW = nO(
            AL(0xb48) + k9(rV) + "\x20" + rU + AL(0xeb3) + hP[rU] + AL(0xec2)
          );
          rR[AL(0x6f1)](rW);
        }
      }
      rT % 0x2 === 0x1 &&
        (rR[AL(0x477)][0x0][AL(0x49b)][AL(0x47d)] = AL(0x1f9));
    }
    var oD = {},
      oE = 0x0,
      oF,
      oG,
      oH,
      oI,
      oJ = 0x0,
      oK = 0x0,
      oL = 0x0,
      oM = 0x0,
      oN = 0x0;
    function oO() {
      const AM = ut,
        rR = d4(oE);
      (oF = rR[0x0]),
        (oG = rR[0x1]),
        (oI = d2(oF + 0x1)),
        (oH = oE - oG),
        k8(
          o2,
          AM(0xb15) + (oF + 0x1) + AM(0xaba) + iJ(oH) + "/" + iJ(oI) + AM(0xbae)
        );
      const rS = d6(oF);
      ot[AM(0xdb1)](0xc8 * rS),
        ou[AM(0xdb1)](0x19 * rS),
        ov[AM(0xdb1)](d5(oF)),
        hack.hp = 0xc8 * rS,
        (oK = Math[AM(0xc36)](0x1, oH / oI)),
        (oM = 0x0),
        (nX[AM(0xb01)](AM(0xe4b))[AM(0x26f)] =
          oF >= cH ? AM(0xdb6) : AM(0x668) + (cH + 0x1) + AM(0x309));
    }
    var oP = 0x0,
      oQ = document[ut(0xb01)](ut(0xc9f));
    for (let rR = 0x0; rR < cZ[ut(0xed7)]; rR++) {
      const [rS, rT] = cZ[rR],
        rU = j7[rS],
        rV = nO(
          ut(0x4e3) +
            hP[rU] +
            ut(0x43a) +
            rU +
            ut(0x677) +
            (rT + 0x1) +
            ut(0x5f1)
        );
      (rV[ut(0x4c5)] = function () {
        const AN = ut;
        if (oF >= rT) {
          const rW = oQ[AN(0xb01)](AN(0xe79));
          rW && rW[AN(0xa1b)][AN(0xeae)](AN(0x8c1)),
            (oP = rR),
            (hD[AN(0x60e)] = rR),
            this[AN(0xa1b)][AN(0xde0)](AN(0x8c1));
        }
      }),
        (cZ[rR][ut(0x4fc)] = rV),
        oQ[ut(0x2e9)](rV);
    }
    function oR() {
      const AO = ut,
        rW = parseInt(hD[AO(0x60e)]) || 0x0;
      cZ[0x0][AO(0x4fc)][AO(0x70a)](),
        cZ[AO(0xaa2)]((rX, rY) => {
          const AP = AO,
            rZ = rX[0x1];
          if (oF >= rZ) {
            rX[AP(0x4fc)][AP(0xa1b)][AP(0xeae)](AP(0x76b));
            if (rW === rY) rX[AP(0x4fc)][AP(0x70a)]();
          } else rX[AP(0x4fc)][AP(0xa1b)][AP(0xde0)](AP(0x76b));
        });
    }
    var oS = document[ut(0xb01)](ut(0xf07));
    setInterval(() => {
      const AQ = ut;
      if (!ok[AQ(0xa1b)][AQ(0x6ba)](AQ(0xd5b))) return;
      oT();
    }, 0x3e8);
    function oT() {
      const AR = ut;
      if (jZ) {
        let rW = 0x0;
        for (const rY in jZ) {
          rW += oU(rY, jZ[rY]);
        }
        let rX = 0x0;
        for (const rZ in oD) {
          const s0 = oU(rZ, oD[rZ][AR(0x2cf)]);
          (rX += s0), (rW += s0);
        }
        if (rX > 0x0) {
          const s1 = Math[AR(0xc36)](0x19, (rX / rW) * 0x64),
            s2 = s1 > 0x1 ? s1[AR(0x284)](0x2) : s1[AR(0x284)](0x5);
          k8(oS, "+" + s2 + "%");
        }
      }
    }
    function oU(rW, rX) {
      const AS = ut,
        rY = dC[rW];
      if (!rY) return 0x0;
      const rZ = rY[AS(0x23b)];
      return Math[AS(0xe12)](rZ * 0xa, rZ) * rX;
    }
    var oV = document[ut(0xb01)](ut(0x335));
    (oV[ut(0x4c5)] = function () {
      const AT = ut;
      for (const rW in oD) {
        const rX = oD[rW];
        rX[AT(0x388)]();
      }
      oW();
    }),
      oW(),
      oO();
    function oW() {
      const AU = ut,
        rW = Object[AU(0x6a2)](oD);
      nW[AU(0xa1b)][AU(0xeae)](AU(0xb2d));
      const rX = rW[AU(0xed7)] === 0x0;
      (oV[AU(0x49b)][AU(0xdaa)] = rX ? AU(0x30c) : ""), (oN = 0x0);
      let rY = 0x0;
      const rZ = rW[AU(0xed7)] > 0x1 ? 0x32 : 0x0;
      for (let s1 = 0x0, s2 = rW[AU(0xed7)]; s1 < s2; s1++) {
        const s3 = rW[s1],
          s4 = (s1 / s2) * Math["PI"] * 0x2;
        s3[AU(0x37d)](
          Math[AU(0x77b)](s4) * rZ + 0x32,
          Math[AU(0xc44)](s4) * rZ + 0x32
        ),
          (oN += d3[s3["el"][AU(0x558)][AU(0x23b)]] * s3[AU(0x2cf)]);
      }
      nW[AU(0xa1b)][rZ ? AU(0xde0) : AU(0xeae)](AU(0xb2d)),
        nV[AU(0xa1b)][rW[AU(0xed7)] > 0x0 ? AU(0xeae) : AU(0xde0)](AU(0xf0f));
      const s0 = oF >= cH;
      nX[AU(0xa1b)][rW[AU(0xed7)] > 0x0 && s0 ? AU(0xeae) : AU(0xde0)](
        AU(0x76b)
      ),
        oT(),
        (nW[AU(0x49b)][AU(0x977)] = ""),
        (o3 = ![]),
        (o5 = ![]),
        (o4 = 0x0),
        (oJ = Math[AU(0xc36)](0x1, (oH + oN) / oI) || 0x0),
        k8(o1, oN > 0x0 ? "+" + iJ(oN) + AU(0xbae) : "");
    }
    var oX,
      oY = 0x0,
      oZ = ![],
      p0 = 0x0,
      p1 = null;
    function p2() {
      const AV = ut;
      og[AV(0xa1b)][oY < 0x5 ? AV(0xde0) : AV(0xeae)](AV(0xf0f));
    }
    og[ut(0x4c5)] = function () {
      const AW = ut;
      if (oZ || !oX || oY < 0x5 || !ik() || p1) return;
      (oZ = !![]), (p0 = 0x0), (p1 = null), og[AW(0xa1b)][AW(0xde0)](AW(0xf0f));
      const rW = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      rW[AW(0x463)](0x0, cI[AW(0xd2f)]),
        rW[AW(0xa2a)](0x1, oX["id"]),
        rW[AW(0x4d0)](0x3, oY),
        il(rW);
    };
    function p3(rW, rX) {
      k8(rW, "x" + iJ(rX));
    }
    function p4(rW) {
      const AX = ut;
      typeof rW === AX(0x28a) && (rW = nF(rW)), k8(oh, rW + AX(0x76c));
    }
    function p5(rW) {
      const AY = ut;
      oX && n4(oX["id"], oY);
      oj && oj[AY(0x70a)]();
      (oX = rW), (oY = 0x0), p2();
      for (let rX = 0x0; rX < oi[AY(0xed7)]; rX++) {
        oi[rX][AY(0x419)]();
      }
      oX
        ? (p4(dE[oX[AY(0x23b)]] * (jy ? 0x2 : 0x1) * (he ? 0.9 : 0x1)),
          (og[AY(0x49b)][AY(0x80b)] = hQ[oX[AY(0x23b)] + 0x1]))
        : p4("?");
    }
    var p6 = 0x0,
      p7 = 0x1;
    function p8(rW) {
      const AZ = ut,
        rX = dC[rW],
        rY = od(rX);
      (rY[AZ(0x5b5)] = pq), jY(rY), (rY[AZ(0xd92)] = !![]), o7[AZ(0x2e9)](rY);
      const rZ = od(rX);
      jY(rZ), (rZ[AZ(0x5b5)] = ok);
      rX[AZ(0x23b)] >= dc && rZ[AZ(0xa1b)][AZ(0xde0)](AZ(0x9f9));
      rZ[AZ(0x4c5)] = function () {
        const B0 = AZ;
        pN - p6 < 0x1f4 ? p7++ : (p7 = 0x1);
        p6 = pN;
        if (oq) {
          if (oZ || rX[B0(0x23b)] >= dc) return;
          const s3 = iS[rX["id"]];
          if (!s3) return;
          oX !== rX && p5(rX);
          const s4 = oi[B0(0xed7)];
          let s5 = pn ? s3 : Math[B0(0xc36)](s4 * p7, s3);
          n4(rX["id"], -s5), (oY += s5), p2();
          let s6 = s5 % s4,
            s7 = (s5 - s6) / s4;
          const s8 = [...oi][B0(0x604)](
            (sa, sb) => sa[B0(0x2cf)] - sb[B0(0x2cf)]
          );
          s7 > 0x0 && s8[B0(0xaa2)]((sa) => sa[B0(0x772)](s7));
          let s9 = 0x0;
          while (s6--) {
            const sa = s8[s9];
            (s9 = (s9 + 0x1) % s4), sa[B0(0x772)](0x1);
          }
          return;
        }
        if (!oD[rX["id"]]) {
          const sb = od(rX, ![]);
          k8(sb[B0(0xa01)], "x1"),
            (sb[B0(0x4c5)] = function (sd) {
              const B1 = B0;
              sc[B1(0x388)](), oW();
            }),
            nW[B0(0x2e9)](sb);
          const sc = {
            petal: rX,
            count: 0x0,
            el: sb,
            setPos(sd, se) {
              const B2 = B0;
              (sb[B2(0x49b)][B2(0x985)] = sd + "%"),
                (sb[B2(0x49b)][B2(0x293)] = se + "%"),
                (sb[B2(0x49b)][B2(0xbc1)] = B2(0x62e));
            },
            dispose(sd = !![]) {
              const B3 = B0;
              sb[B3(0xeae)](),
                sd && n4(rX["id"], this[B3(0x2cf)]),
                delete oD[rX["id"]];
            },
          };
          (oD[rX["id"]] = sc), oW();
        }
        const s2 = oD[rX["id"]];
        if (iS[rX["id"]]) {
          const sd = iS[rX["id"]],
            se = pn ? sd : Math[B0(0xc36)](0x1 * p7, sd);
          (s2[B0(0x2cf)] += se),
            n4(rX["id"], -se),
            p3(s2["el"][B0(0xa01)], s2[B0(0x2cf)]);
        }
        oW();
      };
      const s0 = dH * rX[AZ(0x523)] + rX[AZ(0xd6a)],
        s1 = o6[s0];
      return (
        nU[AZ(0x1fd)](rZ, s1),
        s1[AZ(0xeae)](),
        (o6[s0] = rZ),
        (rY[AZ(0x387)] = function (s2) {
          const B4 = AZ;
          p3(rY[B4(0xa01)], s2), p3(rZ[B4(0xa01)], s2);
        }),
        (rY[AZ(0x451)] = rZ),
        (o8[rW] = rY),
        (rY[AZ(0x388)] = function () {
          const B5 = AZ;
          rY[B5(0xeae)](), delete o8[rW];
          const s2 = nO(B5(0x46a));
          (o6[s0] = s2), nU[B5(0x1fd)](s2, rZ), rZ[B5(0xeae)]();
        }),
        rY[AZ(0x387)](iS[rW]),
        rY
      );
    }
    var p9 = {},
      pa = {};
    function pb(rW, rX, rY, rZ) {
      const B6 = ut,
        s0 = document[B6(0xb01)](rY);
      (s0[B6(0xde6)] = function () {
        const B7 = B6;
        (p9[rW] = this[B7(0x373)]),
          (hD[rW] = this[B7(0x373)] ? "1" : "0"),
          rZ && rZ(this[B7(0x373)]);
      }),
        (pa[rW] = function () {
          const B8 = B6;
          s0[B8(0x70a)]();
        }),
        (s0[B6(0x373)] = hD[rW] === void 0x0 ? rX : hD[rW] === "1"),
        s0[B6(0xde6)]();
    }
    var pc = document[ut(0xb01)](ut(0x6fe));
    (pc[ut(0x558)] = function () {
      const B9 = ut;
      return nO(
        B9(0x32e) + hP[B9(0xa94)] + B9(0xb77) + hP[B9(0xd4c)] + B9(0x205)
      );
    }),
      pb(ut(0x3ff), ![], ut(0x908), mG),
      pb(ut(0xa12), !![], ut(0xe08)),
      pb(ut(0x7ad), !![], ut(0x23a)),
      pb(
        ut(0x42a),
        !![],
        ut(0x817),
        (rW) => (kK[ut(0x49b)][ut(0xdaa)] = rW ? "" : ut(0x30c))
      ),
      pb(ut(0xbf9), ![], ut(0x851)),
      pb(ut(0x635), ![], ut(0x2ac)),
      pb(ut(0x90a), ![], ut(0xdfc)),
      pb(ut(0x454), !![], ut(0xd7a)),
      pb(
        ut(0x707),
        !![],
        ut(0xe7b),
        (rW) => (pc[ut(0x49b)][ut(0xdaa)] = rW ? "" : ut(0x30c))
      ),
      pb(ut(0x4c1), ![], ut(0xec1), kT),
      pb(ut(0x31f), ![], ut(0xaab), kX),
      pb(ut(0xe91), ![], ut(0xccc), (rW) => pd(ko, ut(0x278), rW)),
      pb(ut(0x925), !![], ut(0x440), (rW) =>
        pd(document[ut(0xc9e)], ut(0x864), !rW)
      ),
      pb(ut(0x9ea), !![], ut(0x9c6), (rW) =>
        pd(document[ut(0xc9e)], ut(0x6dc), !rW)
      ),
      pb(ut(0x55f), !![], ut(0xc2b));
    function pd(rW, rX, rY) {
      const Ba = ut;
      rW[Ba(0xa1b)][rY ? Ba(0xde0) : Ba(0xeae)](rX);
    }
    function pe() {
      const Bb = ut,
        rW = document[Bb(0xb01)](Bb(0x64b)),
        rX = [];
      for (let rZ = 0x0; rZ <= 0xa; rZ++) {
        rX[Bb(0xbc0)](0x1 - rZ * 0.05);
      }
      for (const s0 of rX) {
        const s1 = nO(Bb(0x1f6) + s0 + "\x22>" + nF(s0 * 0x64) + Bb(0x6ec));
        rW[Bb(0x2e9)](s1);
      }
      let rY = parseFloat(hD[Bb(0xd51)]);
      (isNaN(rY) || !rX[Bb(0x935)](rY)) && (rY = rX[0x0]),
        (rW[Bb(0x95d)] = rY),
        (kP = rY),
        (rW[Bb(0xde6)] = function () {
          const Bc = Bb;
          (kP = parseFloat(this[Bc(0x95d)])),
            (hD[Bc(0xd51)] = this[Bc(0x95d)]),
            kX();
        });
    }
    pe();
    var pf = document[ut(0xb01)](ut(0xd1f)),
      pg = document[ut(0xb01)](ut(0x84c));
    pg[ut(0x6de)] = cL;
    var ph = document[ut(0xb01)](ut(0x4ad));
    function pi(rW) {
      const Bd = ut,
        rX = nO(Bd(0x528));
      kl[Bd(0x2e9)](rX);
      const rY = rX[Bd(0xb01)](Bd(0x3c0));
      rY[Bd(0x95d)] = rW;
      const rZ = rX[Bd(0xb01)](Bd(0x48b));
      (rZ[Bd(0xde6)] = function () {
        const Be = Bd;
        rY[Be(0x8ca)] = this[Be(0x373)] ? Be(0xe72) : Be(0xa52);
      }),
        (rX[Bd(0xb01)](Bd(0x781))[Bd(0x4c5)] = function () {
          const Bf = Bd;
          jp(rW), hc(Bf(0xa5d));
        }),
        (rX[Bd(0xb01)](Bd(0x23c))[Bd(0x4c5)] = function () {
          const Bg = Bd,
            s0 = {};
          s0[Bg(0x8ca)] = Bg(0x8fd);
          const s1 = new Blob([rW], s0),
            s2 = document[Bg(0xeb2)]("a");
          (s2[Bg(0x3a0)] = URL[Bg(0x9b4)](s1)),
            (s2[Bg(0xa3b)] = (jv ? jv : Bg(0xde2)) + Bg(0xac9)),
            s2[Bg(0x70a)](),
            hc(Bg(0xe94));
        }),
        (rX[Bd(0xb01)](Bd(0x61d))[Bd(0x4c5)] = function () {
          const Bh = Bd;
          rX[Bh(0xeae)]();
        });
    }
    function pj() {
      const Bi = ut,
        rW = nO(Bi(0x405));
      kl[Bi(0x2e9)](rW);
      const rX = rW[Bi(0xb01)](Bi(0x3c0)),
        rY = rW[Bi(0xb01)](Bi(0x48b));
      (rY[Bi(0xde6)] = function () {
        const Bj = Bi;
        rX[Bj(0x8ca)] = this[Bj(0x373)] ? Bj(0xe72) : Bj(0xa52);
      }),
        (rW[Bi(0xb01)](Bi(0x61d))[Bi(0x4c5)] = function () {
          const Bk = Bi;
          rW[Bk(0xeae)]();
        }),
        (rW[Bi(0xb01)](Bi(0x64d))[Bi(0x4c5)] = function () {
          const Bl = Bi,
            rZ = rX[Bl(0x95d)][Bl(0x6e4)]();
          if (eV(rZ)) {
            delete hD[Bl(0x4da)], (hD[Bl(0x62f)] = rZ);
            if (hU)
              try {
                hU[Bl(0x67b)]();
              } catch (s0) {}
            hc(Bl(0x8d2));
          } else hc(Bl(0xce8));
        });
    }
    (document[ut(0xb01)](ut(0x5ad))[ut(0x4c5)] = function () {
      const Bm = ut;
      if (i5) {
        pi(i5);
        return;
        const rW = prompt(Bm(0xcc1), i5);
        if (rW !== null) {
          const rX = {};
          rX[Bm(0x8ca)] = Bm(0x8fd);
          const rY = new Blob([i5], rX),
            rZ = document[Bm(0xeb2)]("a");
          (rZ[Bm(0x3a0)] = URL[Bm(0x9b4)](rY)),
            (rZ[Bm(0xa3b)] = jv + Bm(0xe3a)),
            rZ[Bm(0x70a)](),
            alert(Bm(0x238));
        }
      }
    }),
      (document[ut(0xb01)](ut(0xdf5))[ut(0x4c5)] = function () {
        const Bn = ut;
        pj();
        return;
        const rW = prompt(Bn(0xdf2));
        if (rW !== null) {
          if (eV(rW)) {
            let rX = Bn(0xe98);
            i6 && (rX += Bn(0x30b));
            if (confirm(rX)) {
              delete hD[Bn(0x4da)], (hD[Bn(0x62f)] = rW);
              if (hU)
                try {
                  hU[Bn(0x67b)]();
                } catch (rY) {}
            }
          } else alert(Bn(0xce8));
        }
      }),
      pb(ut(0xe6d), ![], ut(0xb8c), (rW) =>
        pg[ut(0xa1b)][rW ? ut(0xde0) : ut(0xeae)](ut(0x984))
      ),
      pb(ut(0xc85), !![], ut(0x938));
    var pk = 0x0,
      pl = 0x0,
      pm = 0x0,
      pn = ![];
    function po(rW, rX) {
      const Bo = ut;
      (rW === Bo(0x859) || rW === Bo(0x514)) && (pn = rX);
      if (rX) {
        switch (rW) {
          case Bo(0xcb4):
            m1[Bo(0x701)][Bo(0xa08)]();
            break;
          case Bo(0x34c):
            m1[Bo(0x48a)][Bo(0xa08)]();
            break;
          case Bo(0xc66):
            m1[Bo(0xe16)][Bo(0xa08)]();
            break;
          case Bo(0xd81):
            q0[Bo(0xa1b)][Bo(0xa08)](Bo(0x8c1));
            break;
          case Bo(0xeda):
            pa[Bo(0x3ff)](), hc(Bo(0xc7c) + (p9[Bo(0x3ff)] ? "ON" : Bo(0x495)));
            break;
          case Bo(0x6fb):
            pa[Bo(0xbf9)](), hc(Bo(0xb4a) + (p9[Bo(0xbf9)] ? "ON" : Bo(0x495)));
            break;
          case Bo(0xab5):
            pa[Bo(0x635)](), hc(Bo(0xad8) + (p9[Bo(0x635)] ? "ON" : Bo(0x495)));
            break;
          case Bo(0x3f7):
            pa[Bo(0x42a)](), hc(Bo(0x744) + (p9[Bo(0x42a)] ? "ON" : Bo(0x495)));
            break;
          case Bo(0xb79):
            pa[Bo(0x90a)](), hc(Bo(0x597) + (p9[Bo(0x90a)] ? "ON" : Bo(0x495)));
            break;
          case Bo(0xe27):
            if (!mJ && hW) {
              const rY = ny[Bo(0x7bd)](Bo(0x778)),
                rZ = nz[Bo(0x7bd)](Bo(0x778));
              for (let s0 = 0x0; s0 < rY[Bo(0xed7)]; s0++) {
                const s1 = rY[s0],
                  s2 = rZ[s0],
                  s3 = n7(s1),
                  s4 = n7(s2);
                if (s3) n8(s3, s2);
                else s4 && n8(s4, s1);
              }
              il(new Uint8Array([cI[Bo(0xc64)]]));
            }
            break;
          default:
            if (
              !mJ &&
              hW &&
              (rW[Bo(0x9d3)](Bo(0x650)) || rW[Bo(0x9d3)](Bo(0xb82)))
            )
              sc: {
                let s5 = parseInt(
                  rW[Bo(0xe22)](rW[Bo(0x9d3)](Bo(0x650)) ? 0x5 : 0x6)
                );
                if (nm[Bo(0x3f7)]) {
                  pn ? ku(s5) : kx(s5);
                  break sc;
                }
                s5 === 0x0 && (s5 = 0xa);
                iN > 0xa && pn && (s5 += 0xa);
                s5--;
                if (s5 >= 0x0) {
                  const s6 = ny[Bo(0x7bd)](Bo(0x778))[s5],
                    s7 = nz[Bo(0x7bd)](Bo(0x778))[s5];
                  if (s6 && s7) {
                    const s8 = n7(s6),
                      s9 = n7(s7);
                    if (s8) n8(s8, s7);
                    else s9 && n8(s9, s6);
                  }
                }
                n6(s5, s5 + iN);
              }
        }
        nm[rW] = !![];
      } else
        rW === Bo(0x6bf) &&
          (kk[Bo(0x49b)][Bo(0xdaa)] === "" &&
          pg[Bo(0x49b)][Bo(0xdaa)] === Bo(0x30c)
            ? kD[Bo(0x70a)]()
            : pg[Bo(0xc42)]()),
          delete nm[rW];
      if (iy) {
        if (p9[Bo(0x3ff)]) {
          let sa = 0x0,
            sb = 0x0;
          if (nm[Bo(0x24f)] || nm[Bo(0x219)]) sb = -0x1;
          else (nm[Bo(0xb97)] || nm[Bo(0x260)]) && (sb = 0x1);
          if (nm[Bo(0x59e)] || nm[Bo(0x54a)]) sa = -0x1;
          else (nm[Bo(0xb44)] || nm[Bo(0x25e)]) && (sa = 0x1);
          if (sa !== 0x0 || sb !== 0x0)
            (pk = Math[Bo(0x5e5)](sb, sa)), im(pk, 0x1);
          else (pl !== 0x0 || pm !== 0x0) && im(pk, 0x0);
          (pl = sa), (pm = sb);
        }
        pp();
      }
    }
    function pp() {
      const Bp = ut,
        rW = nm[Bp(0x731)] || nm[Bp(0x514)] || nm[Bp(0x859)],
        rX = nm[Bp(0x6cf)] || nm[Bp(0x485)],
        rY = (rW << 0x1) | rX;
      n9 !== rY && ((n9 = rY), il(new Uint8Array([cI[Bp(0x42b)], rY])));
    }
    var pq = document[ut(0xb01)](ut(0x829)),
      pr = 0x0,
      ps = 0x0,
      pt = 0x0;
    function pu(rW, rX, rY) {
      const Bq = ut;
      return rW + (rX - rW) * Math[Bq(0xc36)](0x1, pO / rY);
    }
    var pv = 0x1,
      pw = [];
    for (let rW in cS) {
      if (
        [ut(0x455), ut(0x263), ut(0x3db), ut(0x857), ut(0xd48), ut(0x699)][
          ut(0x935)
        ](rW)
      )
        continue;
      pw[ut(0xbc0)](cS[rW]);
    }
    var px = [];
    for (let rX = 0x0; rX < 0x1e; rX++) {
      py();
    }
    function py(rY = !![]) {
      const Br = ut,
        rZ = new lG(
          -0x1,
          pw[Math[Br(0x7ce)](Math[Br(0xb69)]() * pw[Br(0xed7)])],
          0x0,
          Math[Br(0xb69)]() * d1,
          Math[Br(0xb69)]() * 6.28
        );
      if (!rZ[Br(0xa6b)] && Math[Br(0xb69)]() < 0.01) rZ[Br(0x412)] = !![];
      rZ[Br(0xa6b)]
        ? (rZ[Br(0x25c)] = rZ[Br(0x31a)] = Math[Br(0xb69)]() * 0x8 + 0xc)
        : (rZ[Br(0x25c)] = rZ[Br(0x31a)] = Math[Br(0xb69)]() * 0x1e + 0x19),
        rY
          ? (rZ["x"] = Math[Br(0xb69)]() * d0)
          : (rZ["x"] = -rZ[Br(0x31a)] * 0x2),
        (rZ[Br(0x5fb)] =
          (Math[Br(0xb69)]() * 0x3 + 0x4) * rZ[Br(0x25c)] * 0.02),
        (rZ[Br(0x6d0)] = (Math[Br(0xb69)]() * 0x2 - 0x1) * 0.05),
        px[Br(0xbc0)](rZ);
    }
    var pz = 0x0,
      pA = 0x0,
      pB = 0x0,
      pC = 0x0;
    setInterval(function () {
      const Bs = ut,
        rY = [ki, qs, ...Object[Bs(0x6a2)](pD), ...nL],
        rZ = rY[Bs(0xed7)];
      let s0 = 0x0;
      for (let s1 = 0x0; s1 < rZ; s1++) {
        const s2 = rY[s1];
        s0 += s2[Bs(0x40b)] * s2[Bs(0x965)];
      }
      kK[Bs(0x4e7)](
        Bs(0x873),
        Math[Bs(0xa7d)](0x3e8 / pO) +
          Bs(0x7fc) +
          iw[Bs(0xed7)] +
          Bs(0xe49) +
          rZ +
          Bs(0xedd) +
          iJ(s0) +
          Bs(0x438) +
          (pC / 0x3e8)[Bs(0x284)](0x2) +
          Bs(0x5dd)
      ),
        (pC = 0x0);
    }, 0x3e8);
    var pD = {};
    function pE(rY, rZ, s0, s1, s2, s3 = ![]) {
      const Bt = ut;
      if (!pD[rZ]) {
        const s6 = hx
          ? new OffscreenCanvas(0x1, 0x1)
          : document[Bt(0xeb2)](Bt(0x4f6));
        (s6[Bt(0x6c4)] = s6[Bt(0x5d5)]("2d")),
          (s6[Bt(0x906)] = 0x0),
          (s6[Bt(0x89e)] = s0),
          (s6[Bt(0x5ab)] = s1),
          (pD[rZ] = s6);
      }
      const s4 = pD[rZ],
        s5 = s4[Bt(0x6c4)];
      if (pN - s4[Bt(0x906)] > 0x1f4) {
        s4[Bt(0x906)] = pN;
        const s7 = rY[Bt(0xef8)](),
          s8 = Math[Bt(0x796)](s7["a"], s7["b"]) * 1.5,
          s9 = kW * s8,
          sa = Math[Bt(0x67d)](s4[Bt(0x89e)] * s9) || 0x1;
        sa !== s4["w"] &&
          ((s4["w"] = sa),
          (s4[Bt(0x40b)] = sa),
          (s4[Bt(0x965)] = Math[Bt(0x67d)](s4[Bt(0x5ab)] * s9) || 0x1),
          s5[Bt(0x94d)](),
          s5[Bt(0x1f7)](s9, s9),
          s2(s5),
          s5[Bt(0xbad)]());
      }
      s4[Bt(0x537)] = !![];
      if (s3) return s4;
      rY[Bt(0xd33)](
        s4,
        -s4[Bt(0x89e)] / 0x2,
        -s4[Bt(0x5ab)] / 0x2,
        s4[Bt(0x89e)],
        s4[Bt(0x5ab)]
      );
    }
    var pF = /^((?!chrome|android).)*safari/i[ut(0xcc4)](navigator[ut(0x94f)]),
      pG = pF ? 0.25 : 0x0;
    function pH(rY, rZ, s0 = 0x14, s1 = ut(0x669), s2 = 0x4, s3, s4 = "") {
      const Bu = ut,
        s5 = Bu(0x64e) + s0 + Bu(0x3b7) + iA;
      let s6, s7;
      const s8 = rZ + "_" + s5 + "_" + s1 + "_" + s2 + "_" + s4,
        s9 = pD[s8];
      if (!s9) {
        rY[Bu(0xadf)] = s5;
        const sa = rY[Bu(0x6e9)](rZ);
        (s6 = sa[Bu(0x40b)] + s2), (s7 = s0 + s2);
      } else (s6 = s9[Bu(0x89e)]), (s7 = s9[Bu(0x5ab)]);
      return pE(
        rY,
        s8,
        s6,
        s7,
        function (sb) {
          const Bv = Bu;
          sb[Bv(0xa21)](s2 / 0x2, s2 / 0x2 - s7 * pG),
            (sb[Bv(0xadf)] = s5),
            (sb[Bv(0x74c)] = Bv(0x293)),
            (sb[Bv(0x287)] = Bv(0x985)),
            (sb[Bv(0x4e5)] = s2),
            (sb[Bv(0xbdd)] = Bv(0x207)),
            (sb[Bv(0x74b)] = s1),
            s2 > 0x0 && sb[Bv(0xcde)](rZ, 0x0, 0x0),
            sb[Bv(0x6e6)](rZ, 0x0, 0x0);
        },
        s3
      );
    }
    var pI = 0x1;
    function pJ(rY = cI[ut(0xb2e)]) {
      const Bw = ut,
        rZ = Object[Bw(0x6a2)](oD),
        s0 = new DataView(
          new ArrayBuffer(0x1 + 0x2 + rZ[Bw(0xed7)] * (0x2 + 0x4))
        );
      let s1 = 0x0;
      s0[Bw(0x463)](s1++, rY), s0[Bw(0xa2a)](s1, rZ[Bw(0xed7)]), (s1 += 0x2);
      for (let s2 = 0x0; s2 < rZ[Bw(0xed7)]; s2++) {
        const s3 = rZ[s2];
        s0[Bw(0xa2a)](s1, s3[Bw(0x558)]["id"]),
          (s1 += 0x2),
          s0[Bw(0x4d0)](s1, s3[Bw(0x2cf)]),
          (s1 += 0x4);
      }
      il(s0);
    }
    function pK() {
      const Bx = ut;
      oj[Bx(0xeae)](), of[Bx(0xa1b)][Bx(0xeae)](Bx(0x7a3)), (oj = null);
    }
    var pL = [];
    function pM() {
      const By = ut;
      for (let rY = 0x0; rY < pL[By(0xed7)]; rY++) {
        const rZ = pL[rY],
          s0 = rZ[By(0x6e3)],
          s1 = s0 && !s0[By(0xab6)];
        s1
          ? ((rZ[By(0xab6)] = ![]),
            (rZ[By(0x998)] = s0[By(0x998)]),
            (rZ[By(0x6d8)] = s0[By(0x6d8)]),
            (rZ[By(0xe21)] = s0[By(0xe21)]),
            (rZ[By(0xe05)] = s0[By(0xe05)]),
            (rZ[By(0x5e0)] = s0[By(0x5e0)]),
            (rZ[By(0x663)] = s0[By(0x663)]),
            (rZ[By(0xd18)] = s0[By(0xd18)]),
            (rZ[By(0x486)] = s0[By(0x486)]),
            (rZ[By(0x9f0)] = s0[By(0x9f0)]),
            (rZ[By(0x283)] = s0[By(0x283)]),
            (rZ[By(0x68b)] = s0[By(0x68b)]),
            (rZ[By(0xd47)] = s0[By(0xd47)]),
            (rZ[By(0xa59)] = s0[By(0xa59)]),
            (rZ[By(0x9d6)] = s0[By(0x9d6)]),
            (rZ[By(0xebe)] = s0[By(0xebe)]),
            j0(rZ, s0))
          : ((rZ[By(0xab6)] = !![]),
            (rZ[By(0xe1e)] = 0x0),
            (rZ[By(0x6d8)] = 0x1),
            (rZ[By(0x998)] = 0x0),
            (rZ[By(0xe21)] = ![]),
            (rZ[By(0xe05)] = 0x0),
            (rZ[By(0x5e0)] = 0x0),
            (rZ[By(0xd18)] = pu(rZ[By(0xd18)], 0x0, 0xc8)),
            (rZ[By(0x663)] = pu(rZ[By(0x663)], 0x0, 0xc8)),
            (rZ[By(0xebe)] = pu(rZ[By(0xebe)], 0x0, 0xc8)));
        if (rY > 0x0) {
          if (s0) {
            const s2 = Math[By(0x5e5)](s0["y"] - ps, s0["x"] - pr);
            rZ[By(0xe2c)] === void 0x0
              ? (rZ[By(0xe2c)] = s2)
              : (rZ[By(0xe2c)] = f8(rZ[By(0xe2c)], s2, 0.1));
          }
          rZ[By(0x71f)] += ((s1 ? -0x1 : 0x1) * pO) / 0x320;
          if (rZ[By(0x71f)] < 0x0) rZ[By(0x71f)] = 0x0;
          rZ[By(0x71f)] > 0x1 && pL[By(0xdba)](rY, 0x1);
        }
      }
    }
    var pN = Date[ut(0x8ea)](),
      pO = 0x0,
      pP = 0x0,
      pQ = pN;
    function pR() {
      const Bz = ut;
      (pN = Date[Bz(0x8ea)]()),
        (pO = pN - pQ),
        (pQ = pN),
        (pP = pO / 0x21),
        hd();
      let rY = 0x0;
      for (let s0 = 0x0; s0 < jX[Bz(0xed7)]; s0++) {
        const s1 = jX[s0];
        if (!s1[Bz(0x4ce)]) jX[Bz(0xdba)](s0, 0x1), s0--;
        else {
          if (
            (s1[Bz(0x5b5)] &&
              !s1[Bz(0x5b5)][Bz(0xa1b)][Bz(0x6ba)](Bz(0xd5b))) ||
            s1[Bz(0x942)][Bz(0x49b)][Bz(0xdaa)] === Bz(0x30c)
          )
            continue;
          else {
            jX[Bz(0xdba)](s0, 0x1),
              s0--,
              s1[Bz(0xa1b)][Bz(0xeae)](Bz(0x8a7)),
              rY++;
            if (rY >= 0x14) break;
          }
        }
      }
      (pS[Bz(0x6e3)] = iy), pM();
      kC[Bz(0xa1b)][Bz(0x6ba)](Bz(0xd5b)) && (lL = pN);
      if (hv) {
        const s2 = pN / 0x50,
          s3 = Math[Bz(0xc44)](s2) * 0x7,
          s4 = Math[Bz(0x301)](Math[Bz(0xc44)](s2 / 0x4)) * 0.15 + 0.85;
        hu[Bz(0x49b)][Bz(0x977)] = Bz(0x306) + s3 + Bz(0xc47) + s4 + ")";
      } else hu[Bz(0x49b)][Bz(0x977)] = Bz(0x30c);
      for (let s5 = jc[Bz(0xed7)] - 0x1; s5 >= 0x0; s5--) {
        const s6 = jc[s5];
        if (s6[Bz(0x80d)]) {
          jc[Bz(0xdba)](s5, 0x1);
          continue;
        }
        s6[Bz(0xe70)]();
      }
      for (let s7 = nL[Bz(0xed7)] - 0x1; s7 >= 0x0; s7--) {
        const s8 = nL[s7];
        if (!s8[Bz(0x4ce)]) {
          nL[Bz(0xdba)](s7, 0x1);
          continue;
        }
        s8[Bz(0x915)]();
      }
      for (let s9 = jb[Bz(0xed7)] - 0x1; s9 >= 0x0; s9--) {
        const sa = jb[s9];
        sa[Bz(0x80d)] &&
          sa["t"] <= 0x0 &&
          (sa[Bz(0xeae)](), jb[Bz(0xdba)](s9, 0x1)),
          (sa["t"] += ((sa[Bz(0x80d)] ? -0x1 : 0x1) * pO) / sa[Bz(0x63e)]),
          (sa["t"] = Math[Bz(0xc36)](0x1, Math[Bz(0x49f)](0x0, sa["t"]))),
          sa[Bz(0x915)]();
      }
      for (let sb = n1[Bz(0xed7)] - 0x1; sb >= 0x0; sb--) {
        const sc = n1[sb];
        if (!sc["el"][Bz(0x4ce)]) sc[Bz(0xc9d)] = ![];
        (sc[Bz(0x2f5)] += ((sc[Bz(0xc9d)] ? 0x1 : -0x1) * pO) / 0xc8),
          (sc[Bz(0x2f5)] = Math[Bz(0xc36)](
            0x1,
            Math[Bz(0x49f)](sc[Bz(0x2f5)])
          ));
        if (!sc[Bz(0xc9d)] && sc[Bz(0x2f5)] <= 0x0) {
          n1[Bz(0xdba)](sb, 0x1), sc[Bz(0xeae)]();
          continue;
        }
        sc[Bz(0x49b)][Bz(0x7e8)] = sc[Bz(0x2f5)];
      }
      if (oZ) {
        p0 += pO / 0x7d0;
        if (p0 > 0x1) {
          p0 = 0x0;
          if (p1) {
            oZ = ![];
            const sd = oX[Bz(0x957)],
              se = p1[Bz(0xd31)];
            if (p1[Bz(0x25d)] > 0x0)
              oi[Bz(0xaa2)]((sf) => sf[Bz(0x419)]()),
                n4(oX["id"], se),
                (oY = 0x0),
                p4("?"),
                of[Bz(0xa1b)][Bz(0xde0)](Bz(0x7a3)),
                (oj = od(sd)),
                of[Bz(0x2e9)](oj),
                p3(oj[Bz(0xa01)], p1[Bz(0x25d)]),
                (oj[Bz(0x4c5)] = function () {
                  const BA = Bz;
                  n4(sd["id"], p1[BA(0x25d)]), pK(), (p1 = null);
                });
            else {
              oY = se;
              const sf = [...oi][Bz(0x604)](() => Math[Bz(0xb69)]() - 0.5);
              for (let sg = 0x0, sh = sf[Bz(0xed7)]; sg < sh; sg++) {
                const si = sf[sg];
                sg >= se ? si[Bz(0x419)]() : si[Bz(0x772)](0x1 - si[Bz(0x2cf)]);
              }
              p1 = null;
            }
            p2();
          }
        }
      }
      for (let sj = 0x0; sj < oi[Bz(0xed7)]; sj++) {
        oi[sj][Bz(0x750)](p0);
      }
      for (let sk in ni) {
        const sl = ni[sk];
        if (!sl) {
          delete ni[sk];
          continue;
        }
        for (let sm = sl[Bz(0xed7)] - 0x1; sm >= 0x0; sm--) {
          const sn = sl[sm];
          sn["t"] += pO;
          if (sn[Bz(0x690)]) sn["t"] > lX && sl[Bz(0xdba)](sm, 0x1);
          else {
            if (sn["t"] > lU) {
              const so = 0x1 - Math[Bz(0xc36)](0x1, (sn["t"] - lU) / 0x7d0);
              (sn[Bz(0x49b)][Bz(0x7e8)] = so),
                so <= 0x0 && sl[Bz(0xdba)](sm, 0x1);
            }
          }
        }
        sl[Bz(0xed7)] === 0x0 && delete ni[sk];
      }
      if (o3)
        sI: {
          if (ik()) {
            (o4 += pO),
              (nW[Bz(0x49b)][Bz(0x977)] =
                Bz(0x8af) +
                (Math[Bz(0xc44)](Date[Bz(0x8ea)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (o4 > 0x3e8) {
              if (o5) {
                pJ(cI[Bz(0x30f)]), m0(![]);
                break sI;
              }
              (o3 = ![]),
                (o5 = ![]),
                (o4 = 0x0),
                pJ(),
                (oE += oN),
                oO(),
                oR(),
                m0(![]);
              const sp = d5(oF);
              if (sp !== iN) {
                const sq = sp - iN;
                for (let ss = 0x0; ss < iN; ss++) {
                  const st = nz[Bz(0x477)][ss];
                  st[Bz(0xf33)] += sq;
                }
                const sr = nz[Bz(0xd95)][Bz(0xf33)] + 0x1;
                for (let su = 0x0; su < sq; su++) {
                  const sv = nO(Bz(0x861));
                  (sv[Bz(0xf33)] = iN + su), ny[Bz(0x2e9)](sv);
                  const sw = nO(Bz(0x861));
                  (sw[Bz(0xf33)] = sr + su),
                    sw[Bz(0x2e9)](
                      nO(Bz(0xc07) + ((sv[Bz(0xf33)] + 0x1) % 0xa) + Bz(0xa03))
                    ),
                    nz[Bz(0x2e9)](sw);
                }
                (iN = sp), (iO = iN * 0x2);
              }
            }
          } else (o3 = ![]), (o5 = ![]), (o4 = 0x0);
        }
      (oM = pu(oM, oK, 0x64)),
        (oL = pu(oL, oJ, 0x64)),
        (nZ[Bz(0x49b)][Bz(0x40b)] = oM * 0x64 + "%"),
        (o0[Bz(0x49b)][Bz(0x40b)] = oL * 0x64 + "%");
      for (let sx in pD) {
        !pD[sx][Bz(0x537)] ? delete pD[sx] : (pD[sx][Bz(0x537)] = ![]);
      }
      (na = pu(na, nc, 0x32)), (nb = pu(nb, nd, 0x32));
      const rZ = Math[Bz(0xc36)](0x64, pO) / 0x3c;
      pU -= 0x3 * rZ;
      for (let sy = px[Bz(0xed7)] - 0x1; sy >= 0x0; sy--) {
        const sz = px[sy];
        (sz["x"] += sz[Bz(0x5fb)] * rZ),
          (sz["y"] += Math[Bz(0xc44)](sz[Bz(0x9d6)] * 0x2) * 0.8 * rZ),
          (sz[Bz(0x9d6)] += sz[Bz(0x6d0)] * rZ),
          (sz[Bz(0xa59)] += 0.002 * pO),
          (sz[Bz(0xddb)] = !![]);
        const sA = sz[Bz(0x31a)] * 0x2;
        (sz["x"] >= d0 + sA || sz["y"] < -sA || sz["y"] >= d1 + sA) &&
          (px[Bz(0xdba)](sy, 0x1), py(![]));
      }
      for (let sB = 0x0; sB < iG[Bz(0xed7)]; sB++) {
        iG[sB][Bz(0x915)]();
      }
      pt = Math[Bz(0x49f)](0x0, pt - pO / 0x12c);
      if (p9[Bz(0xa12)] && pt > 0x0) {
        const sC = Math[Bz(0xb69)]() * 0x2 * Math["PI"],
          sD = pt * 0x3;
        (qI = Math[Bz(0x77b)](sC) * sD), (qJ = Math[Bz(0xc44)](sC) * sD);
      } else (qI = 0x0), (qJ = 0x0);
      (pv = pu(pv, pI, 0xc8)), (nf = pu(nf, ne, 0x64));
      for (let sE = mI[Bz(0xed7)] - 0x1; sE >= 0x0; sE--) {
        const sF = mI[sE];
        sF[Bz(0x915)](), sF[Bz(0x4aa)] && mI[Bz(0xdba)](sE, 0x1);
      }
      for (let sG = iw[Bz(0xed7)] - 0x1; sG >= 0x0; sG--) {
        const sH = iw[sG];
        sH[Bz(0x915)](),
          sH[Bz(0xab6)] && sH[Bz(0xe1e)] > 0x1 && iw[Bz(0xdba)](sG, 0x1);
      }
      iy && ((pr = iy["x"]), (ps = iy["y"])), qG(), window[Bz(0x78c)](pR);
    }
    var pS = pT();
    function pT() {
      const BB = ut,
        rY = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[BB(0x987)], 0x19);
      return (rY[BB(0x71f)] = 0x1), rY;
    }
    var pU = 0x0,
      pV = [ut(0xe5c), ut(0xbeb), ut(0x545)],
      pW = [];
    for (let rY = 0x0; rY < 0x3; rY++) {
      for (let rZ = 0x0; rZ < 0x3; rZ++) {
        const s0 = pX(pV[rY], 0x1 - 0.05 * rZ);
        pW[ut(0xbc0)](s0);
      }
    }
    function pX(s1, s2) {
      const BC = ut;
      return pY(hA(s1)[BC(0x86a)]((s3) => s3 * s2));
    }
    function pY(s1) {
      const BD = ut;
      return s1[BD(0xb3b)](
        (s2, s3) => s2 + parseInt(s3)[BD(0xb9b)](0x10)[BD(0xae3)](0x2, "0"),
        "#"
      );
    }
    function pZ(s1) {
      const BE = ut;
      return BE(0x5a5) + s1[BE(0x361)](",") + ")";
    }
    var q0 = document[ut(0xb01)](ut(0x51f));
    function q1() {
      const BF = ut,
        s1 = document[BF(0xeb2)](BF(0x4f6));
      s1[BF(0x40b)] = s1[BF(0x965)] = 0x3;
      const s2 = s1[BF(0x5d5)]("2d");
      for (let s3 = 0x0; s3 < pW[BF(0xed7)]; s3++) {
        const s4 = s3 % 0x3,
          s5 = (s3 - s4) / 0x3;
        (s2[BF(0x74b)] = pW[s3]), s2[BF(0xde5)](s4, s5, 0x1, 0x1);
        const s6 = j7[s3],
          s7 = j8[s3],
          s8 = nO(
            BF(0x596) +
              s7 +
              BF(0x599) +
              ((s5 + 0.5) / 0x3) * 0x64 +
              BF(0x6cb) +
              ((s4 + 0.5) / 0x3) * 0x64 +
              BF(0x3e2) +
              s6 +
              BF(0x309)
          );
        q0[BF(0x1fd)](s8, q0[BF(0x477)][0x0]);
      }
      q0[BF(0x49b)][BF(0xba2)] = BF(0xe1f) + s1[BF(0xcff)]() + ")";
    }
    q1();
    var q2 = document[ut(0xb01)](ut(0xa40)),
      q3 = document[ut(0xb01)](ut(0x6b7));
    function q4(s1, s2, s3) {
      const BG = ut;
      (s1[BG(0x49b)][BG(0x985)] = (s2 / j2) * 0x64 + "%"),
        (s1[BG(0x49b)][BG(0x293)] = (s3 / j2) * 0x64 + "%");
    }
    function q5() {
      const BH = ut,
        s1 = qL(),
        s2 = d0 / 0x2 / s1,
        s3 = d1 / 0x2 / s1,
        s4 = j4,
        s5 = Math[BH(0x49f)](0x0, Math[BH(0x7ce)]((pr - s2) / s4) - 0x1),
        s6 = Math[BH(0x49f)](0x0, Math[BH(0x7ce)]((ps - s3) / s4) - 0x1),
        s7 = Math[BH(0xc36)](j5 - 0x1, Math[BH(0x67d)]((pr + s2) / s4)),
        s8 = Math[BH(0xc36)](j5 - 0x1, Math[BH(0x67d)]((ps + s3) / s4));
      kj[BH(0x94d)](), kj[BH(0x1f7)](s4, s4), kj[BH(0x4cc)]();
      for (let s9 = s5; s9 <= s7 + 0x1; s9++) {
        kj[BH(0x7eb)](s9, s6), kj[BH(0xa16)](s9, s8 + 0x1);
      }
      for (let sa = s6; sa <= s8 + 0x1; sa++) {
        kj[BH(0x7eb)](s5, sa), kj[BH(0xa16)](s7 + 0x1, sa);
      }
      kj[BH(0xbad)]();
      for (let sb = s5; sb <= s7; sb++) {
        for (let sc = s6; sc <= s8; sc++) {
          kj[BH(0x94d)](),
            kj[BH(0xa21)]((sb + 0.5) * s4, (sc + 0.5) * s4),
            pH(kj, sb + "," + sc, 0x28, BH(0x669), 0x6),
            kj[BH(0xbad)]();
        }
      }
      (kj[BH(0xbdd)] = BH(0x525)),
        (kj[BH(0x4e5)] = 0xa),
        (kj[BH(0x452)] = BH(0xa7d)),
        kj[BH(0x873)]();
    }
    function q6(s1, s2) {
      const BI = ut,
        s3 = nO(BI(0x39f) + s1 + BI(0x470) + s2 + BI(0xb99)),
        s4 = s3[BI(0xb01)](BI(0x825));
      return (
        km[BI(0x2e9)](s3),
        (s3[BI(0xdb1)] = function (s5) {
          const BJ = BI;
          s5 > 0x0 && s5 !== 0x1
            ? (s4[BJ(0x4e7)](BJ(0x49b), BJ(0x6ea) + s5 * 0x168 + BJ(0xd6f)),
              s3[BJ(0xa1b)][BJ(0xde0)](BJ(0xd5b)))
            : s3[BJ(0xa1b)][BJ(0xeae)](BJ(0xd5b));
        }),
        km[BI(0x1fd)](s3, q0),
        s3
      );
    }
    var q7 = q6(ut(0x380), ut(0x910));
    q7[ut(0xa1b)][ut(0xde0)](ut(0x293));
    var q8 = nO(ut(0xe10) + hP[ut(0xd2b)] + ut(0x655));
    q7[ut(0x477)][0x0][ut(0x2e9)](q8);
    var q9 = q6(ut(0xae1), ut(0x610)),
      qa = q6(ut(0xa5b), ut(0xe45));
    qa[ut(0xa1b)][ut(0xde0)](ut(0xdd4));
    var qb = ut(0x7dc),
      qc = 0x2bc,
      qd = new lT("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cY[ut(0x987)], 0x19);
    qd[ut(0x998)] = 0x0;
    var qe = [
      [ut(0x9dc), ut(0xed1)],
      [ut(0x343), ut(0x3ba)],
      [ut(0x903), ut(0xbff)],
      [ut(0xab0), ut(0x4e2), ut(0x6dd)],
      [ut(0xad5), ut(0xade)],
      [ut(0xca8), ut(0x45d)],
      [ut(0x56e), ut(0x213)],
    ];
    function qf() {
      const BK = ut;
      let s1 = "";
      const s2 = qe[BK(0xed7)] - 0x1;
      for (let s3 = 0x0; s3 < s2; s3++) {
        const s4 = qe[s3][0x0];
        (s1 += s4),
          s3 === s2 - 0x1
            ? (s1 += BK(0xba7) + qe[s3 + 0x1][0x0] + ".")
            : (s1 += ",\x20");
      }
      return s1;
    }
    var qg = qf(),
      qh = document[ut(0xb01)](ut(0xb63));
    (qh[ut(0x558)] = function () {
      const BL = ut;
      return nO(
        BL(0x311) +
          hP[BL(0xd1a)] +
          BL(0x795) +
          hP[BL(0xd4c)] +
          BL(0x913) +
          hP[BL(0xa94)] +
          BL(0xe74) +
          qg +
          BL(0x65d)
      );
    }),
      (qh[ut(0x8e7)] = !![]);
    var qi =
      Date[ut(0x8ea)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[ut(0x7ce)](Math[ut(0xb69)]() * qe[ut(0xed7)]);
    function qj() {
      const BM = ut,
        s1 = qe[qi];
      (qd[BM(0x486)] = s1[0x0]), (qd[BM(0xab3)] = s1[0x1]);
      for (let s2 of iZ) {
        qd[s2] = Math[BM(0xb69)]() > 0.5;
      }
      qi = (qi + 0x1) % qe[BM(0xed7)];
    }
    qj(),
      (qh[ut(0x4c5)] = function () {
        const BN = ut;
        window[BN(0xbdc)](qd[BN(0xab3)], BN(0x28b)), qj();
      });
    var qk = new lT(ut(0x38c), 0x0, -0x19, 0x0, 0x1, cY[ut(0x987)], 0x19);
    (qk[ut(0x998)] = 0x0), (qk[ut(0xe33)] = !![]);
    var ql = [
        ut(0xb6f),
        ut(0xcc0),
        ut(0x712),
        ut(0xb14),
        ut(0xa3c),
        ut(0xacc),
        ut(0xa75),
      ],
      qm = [
        ut(0x544),
        ut(0x21a),
        ut(0x920),
        ut(0x3b4),
        ut(0x4bb),
        ut(0xee5),
        ut(0x6fd),
        ut(0x8dd),
      ],
      qn = 0x0;
    function qo() {
      const BO = ut,
        s1 = {};
      (s1[BO(0xe72)] = ql[qn % ql[BO(0xed7)]]),
        (s1[BO(0x690)] = !![]),
        (s1[BO(0x992)] = nh["me"]),
        nl(BO(0x38c), s1),
        nl("yt", {
          text: qm[qn % qm[BO(0xed7)]][BO(0xd73)](
            BO(0xbaf),
            kE[BO(0x95d)][BO(0x6e4)]() || BO(0x504)
          ),
          isFakeChat: !![],
          col: nh["me"],
        }),
        qn++;
    }
    qo(), setInterval(qo, 0xfa0);
    var qp = 0x0,
      qq = Math[ut(0x67d)](
        (Math[ut(0x49f)](screen[ut(0x40b)], screen[ut(0x965)], kU(), kV()) *
          window[ut(0x450)]) /
          0xc
      ),
      qr = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[ut(0x5d4)], 0x19);
    (qr[ut(0xab6)] = !![]), (qr[ut(0x6d8)] = 0x1), (qr[ut(0x1f7)] = 0.6);
    var qs = (function () {
        const BP = ut,
          s1 = document[BP(0xeb2)](BP(0x4f6)),
          s2 = qq * 0x2;
        (s1[BP(0x40b)] = s1[BP(0x965)] = s2),
          (s1[BP(0x49b)][BP(0x40b)] = s1[BP(0x49b)][BP(0x965)] = BP(0x23f));
        const s3 = document[BP(0xb01)](BP(0x457));
        s3[BP(0x2e9)](s1);
        const s4 = s1[BP(0x5d5)]("2d");
        return (
          (s1[BP(0x2cc)] = function () {
            const BQ = BP;
            (qr[BQ(0x412)] = ![]),
              s4[BQ(0x749)](0x0, 0x0, s2, s2),
              s4[BQ(0x94d)](),
              s4[BQ(0x2db)](s2 / 0x64),
              s4[BQ(0xa21)](0x32, 0x32),
              s4[BQ(0x2db)](0.8),
              s4[BQ(0x235)](-Math["PI"] / 0x8),
              qr[BQ(0x4a7)](s4),
              s4[BQ(0xbad)]();
          }),
          s1
        );
      })(),
      qt,
      qu,
      qv,
      qw = ![];
    function qx() {
      const BR = ut;
      if (qw) return;
      (qw = !![]), iB();
      const s1 = qB(qq);
      qv = s1[BR(0xcff)](BR(0x6d2));
      const s2 = qt * 0x64 + "%\x20" + qu * 0x64 + BR(0x769),
        s3 = nO(
          BR(0x8ab) +
            hQ[BR(0x86a)](
              (s4, s5) => BR(0xa07) + s5 + BR(0x799) + s4 + BR(0xd11)
            )[BR(0x361)]("\x0a") +
            BR(0x4b9) +
            nC[BR(0x675)] +
            BR(0xc48) +
            nC[BR(0xd13)] +
            BR(0x966) +
            nC[BR(0x865)] +
            BR(0xd56) +
            dH +
            BR(0x45c) +
            qv +
            BR(0x9f7) +
            s2 +
            BR(0x304) +
            s2 +
            BR(0x292) +
            s2 +
            BR(0xf20) +
            s2 +
            BR(0x2d0)
        );
      document[BR(0xc9e)][BR(0x2e9)](s3);
    }
    function qy(s1) {
      const BS = ut,
        s2 =
          -s1[BS(0xedc)]["x"] * 0x64 +
          "%\x20" +
          -s1[BS(0xedc)]["y"] * 0x64 +
          "%";
      return (
        BS(0x242) +
        s2 +
        BS(0x6d7) +
        s2 +
        BS(0x92c) +
        s2 +
        BS(0xaa5) +
        s2 +
        ";\x22"
      );
    }
    if (document[ut(0x77c)] && document[ut(0x77c)][ut(0xd62)]) {
      const s1 = setTimeout(qx, 0x1f40);
      document[ut(0x77c)][ut(0xd62)][ut(0xc09)](() => {
        const BT = ut;
        console[BT(0x3d1)](BT(0xaa8)), clearTimeout(s1), qx();
      });
    } else qx();
    var qz = [];
    qA();
    function qA() {
      const BU = ut,
        s2 = {};
      (qt = 0xf), (qz = []);
      let s3 = 0x0;
      for (let s5 = 0x0; s5 < dC[BU(0xed7)]; s5++) {
        const s6 = dC[s5],
          s7 = BU(0x3d9) + s6[BU(0x4d2)] + "_" + (s6[BU(0x2cf)] || 0x1),
          s8 = s2[s7];
        if (s8 === void 0x0) (s6[BU(0xedc)] = s2[s7] = s4()), qz[BU(0xbc0)](s6);
        else {
          s6[BU(0xedc)] = s8;
          continue;
        }
      }
      for (let s9 = 0x0; s9 < eK[BU(0xed7)]; s9++) {
        const sa = eK[s9],
          sb = BU(0xe23) + sa[BU(0x4d2)],
          sc = s2[sb];
        if (sc === void 0x0) sa[BU(0xedc)] = s2[sb] = s4();
        else {
          sa[BU(0xedc)] = sc;
          continue;
        }
      }
      function s4() {
        const BV = BU;
        return { x: s3 % qt, y: Math[BV(0x7ce)](s3 / qt), index: s3++ };
      }
    }
    function qB(s2) {
      const BW = ut,
        s3 = qz[BW(0xed7)] + eL;
      qu = Math[BW(0x67d)](s3 / qt);
      const s4 = document[BW(0xeb2)](BW(0x4f6));
      (s4[BW(0x40b)] = s2 * qt), (s4[BW(0x965)] = s2 * qu);
      const s5 = s4[BW(0x5d5)]("2d"),
        s6 = 0x5a,
        s7 = s6 / 0x2,
        s8 = s2 / s6;
      s5[BW(0x1f7)](s8, s8), s5[BW(0xa21)](s7, s7);
      for (let s9 = 0x0; s9 < qz[BW(0xed7)]; s9++) {
        const sa = qz[s9];
        s5[BW(0x94d)](),
          s5[BW(0xa21)](sa[BW(0xedc)]["x"] * s6, sa[BW(0xedc)]["y"] * s6),
          s5[BW(0x94d)](),
          s5[BW(0xa21)](0x0 + sa[BW(0xbe8)], -0x5 + sa[BW(0xf4a)]),
          sa[BW(0x34b)](s5),
          s5[BW(0xbad)](),
          (s5[BW(0x74b)] = BW(0x669)),
          (s5[BW(0x287)] = BW(0xdd4)),
          (s5[BW(0x74c)] = BW(0x225)),
          (s5[BW(0xadf)] = BW(0x5f6) + iA),
          (s5[BW(0x4e5)] = h5 ? 0x5 : 0x3),
          (s5[BW(0xbdd)] = BW(0x773)),
          (s5[BW(0x452)] = s5[BW(0x401)] = BW(0xa7d)),
          s5[BW(0xa21)](0x0, s7 - 0x8 - s5[BW(0x4e5)]);
        let sb = sa[BW(0x4d2)];
        h5 && (sb = h7(sb));
        const sc = s5[BW(0x6e9)](sb)[BW(0x40b)] + s5[BW(0x4e5)],
          sd = Math[BW(0xc36)](0x4c / sc, 0x1);
        s5[BW(0x1f7)](sd, sd),
          s5[BW(0xcde)](sb, 0x0, 0x0),
          s5[BW(0x6e6)](sb, 0x0, 0x0),
          s5[BW(0xbad)]();
      }
      for (let se = 0x0; se < eL; se++) {
        const sf = eK[se];
        s5[BW(0x94d)](),
          s5[BW(0xa21)](sf[BW(0xedc)]["x"] * s6, sf[BW(0xedc)]["y"] * s6),
          sf[BW(0x5c1)] !== void 0x0 &&
            (s5[BW(0x4cc)](), s5[BW(0x2ed)](-s7, -s7, s6, s6), s5[BW(0x8da)]()),
          s5[BW(0xa21)](sf[BW(0xbe8)], sf[BW(0xf4a)]),
          sf[BW(0x34b)](s5),
          s5[BW(0xbad)]();
      }
      return s4;
    }
    var qC = new lG(-0x1, cS[ut(0x787)], 0x0, 0x0, Math[ut(0xb69)]() * 6.28);
    qC[ut(0x31a)] = 0x32;
    function qD() {
      const BX = ut;
      kj[BX(0xc20)](j2 / 0x2, j2 / 0x2, j2 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qE(s2) {
      const BY = ut,
        s3 = s2[BY(0xed7)],
        s4 = document[BY(0xeb2)](BY(0x4f6));
      s4[BY(0x40b)] = s4[BY(0x965)] = s3;
      const s5 = s4[BY(0x5d5)]("2d"),
        s6 = s5[BY(0xec0)](s3, s3);
      for (let s7 = 0x0; s7 < s3; s7++) {
        for (let s8 = 0x0; s8 < s3; s8++) {
          const s9 = s2[s7][s8];
          if (!s9) continue;
          const sa = (s7 * s3 + s8) * 0x4;
          s6[BY(0x786)][sa + 0x3] = 0xff;
        }
      }
      return s5[BY(0x775)](s6, 0x0, 0x0), s4;
    }
    function qF() {
      const BZ = ut;
      if (!jK) return;
      kj[BZ(0x94d)](),
        kj[BZ(0x4cc)](),
        qD(),
        kj[BZ(0x8da)](),
        !jK[BZ(0x4f6)] && (jK[BZ(0x4f6)] = qE(jK)),
        (kj[BZ(0x943)] = ![]),
        (kj[BZ(0x557)] = 0.08),
        kj[BZ(0xd33)](jK[BZ(0x4f6)], 0x0, 0x0, j2, j2),
        kj[BZ(0xbad)]();
    }
    function qG() {
      const C0 = ut;
      lM = 0x0;
      const s3 = kR * kW;
      qp = 0x0;
      for (let s8 = 0x0; s8 < nL[C0(0xed7)]; s8++) {
        const s9 = nL[s8];
        s9[C0(0x4be)] && s9[C0(0x2cc)]();
      }
      if (
        kk[C0(0x49b)][C0(0xdaa)] === "" ||
        document[C0(0xc9e)][C0(0xa1b)][C0(0x6ba)](C0(0xd6d))
      ) {
        (kj[C0(0x74b)] = C0(0xe5c)),
          kj[C0(0xde5)](0x0, 0x0, ki[C0(0x40b)], ki[C0(0x965)]),
          kj[C0(0x94d)]();
        let sa = Math[C0(0x49f)](ki[C0(0x40b)] / d0, ki[C0(0x965)] / d1);
        kj[C0(0x1f7)](sa, sa),
          kj[C0(0x2ed)](0x0, 0x0, d0, d1),
          kj[C0(0x94d)](),
          kj[C0(0xa21)](pU, -pU),
          kj[C0(0x1f7)](1.25, 1.25),
          (kj[C0(0x74b)] = kY),
          kj[C0(0x869)](),
          kj[C0(0xbad)]();
        for (let sb = 0x0; sb < px[C0(0xed7)]; sb++) {
          px[sb][C0(0x4a7)](kj);
        }
        kj[C0(0xbad)]();
        if (p9[C0(0x707)] && pc[C0(0xb62)] > 0x0) {
          const sc = pc[C0(0xecc)]();
          kj[C0(0x94d)]();
          let sd = kW;
          kj[C0(0x1f7)](sd, sd),
            kj[C0(0xa21)](
              sc["x"] + sc[C0(0x40b)] / 0x2,
              sc["y"] + sc[C0(0x965)]
            ),
            kj[C0(0x2db)](kR * 0.8),
            qk[C0(0x4a7)](kj),
            kj[C0(0x1f7)](0.7, 0.7),
            qk[C0(0xcc2)](kj),
            kj[C0(0xbad)]();
        }
        if (qh[C0(0xb62)] > 0x0) {
          const se = qh[C0(0xecc)]();
          kj[C0(0x94d)]();
          let sf = kW;
          kj[C0(0x1f7)](sf, sf),
            kj[C0(0xa21)](
              se["x"] + se[C0(0x40b)] / 0x2,
              se["y"] + se[C0(0x965)] * 0.6
            ),
            kj[C0(0x2db)](kR * 0.8),
            qd[C0(0x4a7)](kj),
            kj[C0(0x2db)](0.7),
            kj[C0(0x94d)](),
            kj[C0(0xa21)](0x0, -qd[C0(0x31a)] - 0x23),
            pH(kj, qd[C0(0x486)], 0x12, C0(0x669), 0x3),
            kj[C0(0xbad)](),
            qd[C0(0xcc2)](kj),
            kj[C0(0xbad)]();
        }
        if (hm[C0(0xb62)] > 0x0) {
          const sg = hm[C0(0xecc)]();
          kj[C0(0x94d)]();
          let sh = kW;
          kj[C0(0x1f7)](sh, sh),
            kj[C0(0xa21)](
              sg["x"] + sg[C0(0x40b)] / 0x2,
              sg["y"] + sg[C0(0x965)] * 0.5
            ),
            kj[C0(0x2db)](kR),
            qC[C0(0x4a7)](kj),
            kj[C0(0xbad)]();
        }
        return;
      }
      if (jy)
        (kj[C0(0x74b)] = pW[0x0]),
          kj[C0(0xde5)](0x0, 0x0, ki[C0(0x40b)], ki[C0(0x965)]);
      else {
        kj[C0(0x94d)](), qK();
        for (let si = -0x1; si < 0x4; si++) {
          for (let sj = -0x1; sj < 0x4; sj++) {
            const sk = Math[C0(0x49f)](0x0, Math[C0(0xc36)](sj, 0x2)),
              sl = Math[C0(0x49f)](0x0, Math[C0(0xc36)](si, 0x2));
            (kj[C0(0x74b)] = pW[sl * 0x3 + sk]),
              kj[C0(0xde5)](sj * j3, si * j3, j3, j3);
          }
        }
        kj[C0(0x4cc)](),
          kj[C0(0x2ed)](0x0, 0x0, j2, j2),
          kj[C0(0x8da)](),
          kj[C0(0x4cc)](),
          kj[C0(0x7eb)](-0xa, j3),
          kj[C0(0xa16)](j3 * 0x2, j3),
          kj[C0(0x7eb)](j3 * 0x2, j3 * 0.5),
          kj[C0(0xa16)](j3 * 0x2, j3 * 1.5),
          kj[C0(0x7eb)](j3 * 0x1, j3 * 0x2),
          kj[C0(0xa16)](j2 + 0xa, j3 * 0x2),
          kj[C0(0x7eb)](j3, j3 * 1.5),
          kj[C0(0xa16)](j3, j3 * 2.5),
          (kj[C0(0x4e5)] = qc * 0x2),
          (kj[C0(0x452)] = C0(0xa7d)),
          (kj[C0(0xbdd)] = qb),
          kj[C0(0x873)](),
          kj[C0(0xbad)]();
      }
      kj[C0(0x94d)](),
        kj[C0(0x4cc)](),
        kj[C0(0x2ed)](0x0, 0x0, ki[C0(0x40b)], ki[C0(0x965)]),
        qK();
      p9[C0(0x55f)] && ((kj[C0(0x74b)] = kY), kj[C0(0x869)]());
      kj[C0(0x4cc)]();
      jy ? qD() : kj[C0(0x2ed)](0x0, 0x0, j2, j2);
      kj[C0(0xbad)](),
        kj[C0(0x2ed)](0x0, 0x0, ki[C0(0x40b)], ki[C0(0x965)]),
        (kj[C0(0x74b)] = qb),
        kj[C0(0x869)](C0(0xb94)),
        kj[C0(0x94d)](),
        qK();
      p9[C0(0x635)] && q5();
      qF();
      const s4 = [];
      let s5 = [];
      for (let sm = 0x0; sm < iw[C0(0xed7)]; sm++) {
        const sn = iw[sm];
        if (sn[C0(0x6db)]) {
          if (iy) {
            if (
              pN - sn[C0(0x645)] < 0x3e8 ||
              Math[C0(0x796)](sn["nx"] - iy["x"], sn["ny"] - iy["y"]) <
                Math[C0(0x796)](sn["ox"] - iy["x"], sn["oy"] - iy["y"])
            ) {
              s4[C0(0xbc0)](sn), (sn[C0(0x645)] = pN);
              continue;
            }
          }
        }
        sn !== iy && s5[C0(0xbc0)](sn);
      }
      (s5 = qH(s5, (so) => so[C0(0x8ca)] === cS[C0(0xd48)])),
        (s5 = qH(s5, (so) => so[C0(0x8ca)] === cS[C0(0x857)])),
        (s5 = qH(s5, (so) => so[C0(0x8ca)] === cS[C0(0x699)])),
        (s5 = qH(s5, (so) => so[C0(0xe6e)])),
        (s5 = qH(s5, (so) => so[C0(0xaa4)])),
        (s5 = qH(s5, (so) => so[C0(0xa6b)] && !so[C0(0x2aa)])),
        (s5 = qH(s5, (so) => !so[C0(0x2aa)])),
        qH(s5, (so) => !![]);
      iy && iy[C0(0x4a7)](kj);
      for (let so = 0x0; so < s4[C0(0xed7)]; so++) {
        s4[so][C0(0x4a7)](kj);
      }
      if (p9[C0(0xbf9)]) {
        kj[C0(0x4cc)]();
        for (let sp = 0x0; sp < iw[C0(0xed7)]; sp++) {
          const sq = iw[sp];
          if (sq[C0(0xab6)]) continue;
          if (sq[C0(0x58e)]) {
            kj[C0(0x94d)](),
              kj[C0(0xa21)](sq["x"], sq["y"]),
              kj[C0(0x235)](sq[C0(0x9d6)]);
            if (!sq[C0(0x8a3)])
              kj[C0(0x2ed)](-sq[C0(0x31a)], -0xa, sq[C0(0x31a)] * 0x2, 0x14);
            else {
              kj[C0(0x7eb)](-sq[C0(0x31a)], -0xa),
                kj[C0(0xa16)](-sq[C0(0x31a)], 0xa);
              const sr = 0xa + sq[C0(0x8a3)] * sq[C0(0x31a)] * 0x2;
              kj[C0(0xa16)](sq[C0(0x31a)], sr),
                kj[C0(0xa16)](sq[C0(0x31a)], -sr),
                kj[C0(0xa16)](-sq[C0(0x31a)], -0xa);
            }
            kj[C0(0xbad)]();
          } else
            kj[C0(0x7eb)](sq["x"] + sq[C0(0x31a)], sq["y"]),
              kj[C0(0xc20)](sq["x"], sq["y"], sq[C0(0x31a)], 0x0, l0);
        }
        (kj[C0(0x4e5)] = 0x2), (kj[C0(0xbdd)] = C0(0x865)), kj[C0(0x873)]();
      }
      const s6 = p9[C0(0x90a)] ? 0x1 / qM() : 0x1;
      for (let ss = 0x0; ss < iw[C0(0xed7)]; ss++) {
        const st = iw[ss];
        !st[C0(0xa6b)] && st[C0(0xddb)] && lY(st, kj, s6);
      }
      for (let su = 0x0; su < iw[C0(0xed7)]; su++) {
        const sv = iw[su];
        sv[C0(0xbca)] && sv[C0(0xcc2)](kj, s6);
      }
      const s7 = pO / 0x12;
      kj[C0(0x94d)](),
        (kj[C0(0x4e5)] = 0x7),
        (kj[C0(0xbdd)] = C0(0x669)),
        (kj[C0(0x452)] = kj[C0(0x401)] = C0(0x8be));
      for (let sw = iF[C0(0xed7)] - 0x1; sw >= 0x0; sw--) {
        const sx = iF[sw];
        sx["a"] -= pO / 0x1f4;
        if (sx["a"] <= 0x0) {
          iF[C0(0xdba)](sw, 0x1);
          continue;
        }
        (kj[C0(0x557)] = sx["a"]), kj[C0(0x873)](sx[C0(0xe9e)]);
      }
      kj[C0(0xbad)]();
      if (p9[C0(0x7ad)])
        for (let sy = iz[C0(0xed7)] - 0x1; sy >= 0x0; sy--) {
          const sz = iz[sy];
          (sz["x"] += sz["vx"] * s7),
            (sz["y"] += sz["vy"] * s7),
            (sz["vy"] += 0.35 * s7);
          if (sz["vy"] > 0xa) {
            iz[C0(0xdba)](sy, 0x1);
            continue;
          }
          kj[C0(0x94d)](),
            kj[C0(0xa21)](sz["x"], sz["y"]),
            (kj[C0(0x557)] = 0x1 - Math[C0(0x49f)](0x0, sz["vy"] / 0xa)),
            kj[C0(0x1f7)](sz[C0(0x31a)], sz[C0(0x31a)]),
            sz[C0(0xe72)] !== void 0x0
              ? pH(kj, sz[C0(0xe72)], 0x15, C0(0x976), 0x2, ![], sz[C0(0x31a)])
              : (kj[C0(0x235)](sz[C0(0x9d6)]),
                pE(kj, C0(0x2d9) + sz[C0(0x31a)], 0x1e, 0x1e, function (sA) {
                  const C1 = C0;
                  sA[C1(0xa21)](0xf, 0xf), nA(sA);
                })),
            kj[C0(0xbad)]();
        }
      kj[C0(0xbad)]();
      if (iy && p9[C0(0x454)] && !p9[C0(0x3ff)]) {
        kj[C0(0x94d)](),
          kj[C0(0xa21)](ki[C0(0x40b)] / 0x2, ki[C0(0x965)] / 0x2),
          kj[C0(0x235)](Math[C0(0x5e5)](nb, na)),
          kj[C0(0x1f7)](s3, s3);
        const sA = 0x28;
        let sB = Math[C0(0x796)](na, nb) / kR;
        kj[C0(0x4cc)](),
          kj[C0(0x7eb)](sA, 0x0),
          kj[C0(0xa16)](sB, 0x0),
          kj[C0(0xa16)](sB + -0x14, -0x14),
          kj[C0(0x7eb)](sB, 0x0),
          kj[C0(0xa16)](sB + -0x14, 0x14),
          (kj[C0(0x4e5)] = 0xc),
          (kj[C0(0x452)] = C0(0xa7d)),
          (kj[C0(0x401)] = C0(0xa7d)),
          (kj[C0(0x557)] =
            sB < 0x64 ? Math[C0(0x49f)](sB - 0x32, 0x0) / 0x32 : 0x1),
          (kj[C0(0xbdd)] = C0(0x525)),
          kj[C0(0x873)](),
          kj[C0(0xbad)]();
      }
      kj[C0(0x94d)](),
        kj[C0(0x1f7)](s3, s3),
        kj[C0(0xa21)](0x28, 0x1e + 0x32),
        kj[C0(0x2db)](0.85);
      for (let sC = 0x0; sC < pL[C0(0xed7)]; sC++) {
        const sD = pL[sC];
        if (sC > 0x0) {
          const sE = lI(Math[C0(0x49f)](sD[C0(0x71f)] - 0.5, 0x0) / 0.5);
          kj[C0(0xa21)](0x0, (sC === 0x0 ? 0x46 : 0x41) * (0x1 - sE));
        }
        kj[C0(0x94d)](),
          sC > 0x0 &&
            (kj[C0(0xa21)](lI(sD[C0(0x71f)]) * -0x190, 0x0),
            kj[C0(0x2db)](0.85)),
          kj[C0(0x94d)](),
          lZ(sD, kj, !![]),
          (sD["id"] = (sD[C0(0x6e3)] && sD[C0(0x6e3)]["id"]) || -0x1),
          sD[C0(0x4a7)](kj),
          (sD["id"] = -0x1),
          kj[C0(0xbad)](),
          sD[C0(0xe2c)] !== void 0x0 &&
            (kj[C0(0x94d)](),
            kj[C0(0x235)](sD[C0(0xe2c)]),
            kj[C0(0xa21)](0x20, 0x0),
            kj[C0(0x4cc)](),
            kj[C0(0x7eb)](0x0, 0x6),
            kj[C0(0xa16)](0x0, -0x6),
            kj[C0(0xa16)](0x6, 0x0),
            kj[C0(0x7b7)](),
            (kj[C0(0x4e5)] = 0x4),
            (kj[C0(0x452)] = kj[C0(0x401)] = C0(0xa7d)),
            (kj[C0(0xbdd)] = C0(0x9ff)),
            kj[C0(0x873)](),
            (kj[C0(0x74b)] = C0(0x669)),
            kj[C0(0x869)](),
            kj[C0(0xbad)]()),
          kj[C0(0xbad)]();
      }
      kj[C0(0xbad)]();
    }
    function qH(s2, s3) {
      const C2 = ut,
        s4 = [];
      for (let s5 = 0x0; s5 < s2[C2(0xed7)]; s5++) {
        const s6 = s2[s5];
        if (s3[C2(0x244)] !== void 0x0 ? s3(s6) : s6[s3]) s6[C2(0x4a7)](kj);
        else s4[C2(0xbc0)](s6);
      }
      return s4;
    }
    var qI = 0x0,
      qJ = 0x0;
    function qK() {
      const C3 = ut;
      kj[C3(0xa21)](ki[C3(0x40b)] / 0x2, ki[C3(0x965)] / 0x2);
      let s2 = qL();
      kj[C3(0x1f7)](s2, s2),
        kj[C3(0xa21)](-pr, -ps),
        p9[C3(0xa12)] && kj[C3(0xa21)](qI, qJ);
    }
    function qL() {
      const C4 = ut;
      return Math[C4(0x49f)](ki[C4(0x40b)] / d0, ki[C4(0x965)] / d1) * qM();
    }
    function qM() {
      return nf / pv;
    }
    kX(), pR();
    const qN = {};
    (qN[ut(0x244)] = ut(0x211)),
      (qN[ut(0xab3)] = ut(0xbd5)),
      (qN[ut(0xd5d)] = ut(0xb92));
    const qO = {};
    (qO[ut(0x244)] = ut(0xe8e)),
      (qO[ut(0xab3)] = ut(0x5c7)),
      (qO[ut(0xd5d)] = ut(0xc95));
    const qP = {};
    (qP[ut(0x244)] = ut(0xa31)),
      (qP[ut(0xab3)] = ut(0xc1b)),
      (qP[ut(0xd5d)] = ut(0x96c));
    const qQ = {};
    (qQ[ut(0x244)] = ut(0x679)),
      (qQ[ut(0xab3)] = ut(0x968)),
      (qQ[ut(0xd5d)] = ut(0xe73));
    const qR = {};
    (qR[ut(0x244)] = ut(0x44c)),
      (qR[ut(0xab3)] = ut(0xa9b)),
      (qR[ut(0xd5d)] = ut(0xa22));
    const qS = {};
    (qS[ut(0x244)] = ut(0x2c0)),
      (qS[ut(0xab3)] = ut(0x5ac)),
      (qS[ut(0xd5d)] = ut(0x6d5));
    const qT = {};
    (qT[ut(0xdab)] = qN),
      (qT[ut(0x55c)] = qO),
      (qT[ut(0x717)] = qP),
      (qT[ut(0xca4)] = qQ),
      (qT[ut(0x3a3)] = qR),
      (qT[ut(0xcb9)] = qS);
    var qU = qT;
    if (window[ut(0x5af)][ut(0x24d)] !== ut(0x80f))
      for (let s2 in qU) {
        const s3 = qU[s2];
        s3[ut(0xab3)] = s3[ut(0xab3)]
          [ut(0xd73)](ut(0x80f), ut(0xc6b))
          [ut(0xd73)](ut(0x6b4), ut(0xcfe));
      }
    var qV = document[ut(0xb01)](ut(0x9a0)),
      qW = document[ut(0xb01)](ut(0xeb4)),
      qX = 0x0;
    for (let s4 in qU) {
      const s5 = qU[s4],
        s6 = document[ut(0xeb2)](ut(0x475));
      s6[ut(0x7ec)] = ut(0x4fc);
      const s7 = document[ut(0xeb2)](ut(0x76d));
      s7[ut(0x4e7)](ut(0x873), s5[ut(0x244)]), s6[ut(0x2e9)](s7);
      const s8 = document[ut(0xeb2)](ut(0x76d));
      (s8[ut(0x7ec)] = ut(0xd08)),
        (s5[ut(0xd72)] = 0x0),
        (s5[ut(0x9a3)] = function (s9) {
          const C5 = ut;
          (qX -= s5[C5(0xd72)]),
            (s5[C5(0xd72)] = s9),
            (qX += s9),
            k8(s8, kh(s9, C5(0x4b3))),
            s6[C5(0x2e9)](s8);
          const sa = C5(0xc37) + kh(qX, C5(0x4b3)) + C5(0x703);
          k8(qY, sa), k8(qW, sa);
        }),
        (s5[ut(0x82a)] = function () {
          const C6 = ut;
          s5[C6(0x9a3)](0x0), s8[C6(0xeae)]();
        }),
        (s6[ut(0x49b)][ut(0xde1)] = s5[ut(0xd5d)]),
        qV[ut(0x2e9)](s6),
        (s6[ut(0x4c5)] = function () {
          const C7 = ut,
            s9 = qV[C7(0xb01)](C7(0xe79));
          if (s9 === s6) return;
          s9 && s9[C7(0xa1b)][C7(0xeae)](C7(0x8c1)),
            this[C7(0xa1b)][C7(0xde0)](C7(0x8c1)),
            r1(s5[C7(0xab3)]),
            (hD[C7(0x65e)] = s4);
        }),
        (s5["el"] = s6);
    }
    var qY = document[ut(0xeb2)](ut(0x76d));
    (qY[ut(0x7ec)] = ut(0x909)), qV[ut(0x2e9)](qY);
    if (!![]) {
      qZ();
      let s9 = Date[ut(0x8ea)]();
      setInterval(function () {
        pN - s9 > 0x2710 && (qZ(), (s9 = pN));
      }, 0x3e8);
    }
    function qZ() {
      const C8 = ut;
      fetch(C8(0x565))
        [C8(0xc09)]((sa) => sa[C8(0xb1e)]())
        [C8(0xc09)]((sa) => {
          const C9 = C8;
          for (let sb in sa) {
            const sc = qU[sb];
            sc && sc[C9(0x9a3)](sa[sb]);
          }
        })
        [C8(0xe1b)]((sa) => {
          const Ca = C8;
          console[Ca(0xb60)](Ca(0x708), sa);
        });
    }
    var r0 = window[ut(0x664)] || window[ut(0x5af)][ut(0x870)] === ut(0xec7);
    if (r0) hV(window[ut(0x5af)][ut(0xb85)][ut(0xd73)](ut(0xcab), "ws"));
    else {
      const sa = qU[hD[ut(0x65e)]];
      if (sa) sa["el"][ut(0x70a)]();
      else {
        let sb = "EU";
        fetch(ut(0xa87))
          [ut(0xc09)]((sc) => sc[ut(0xb1e)]())
          [ut(0xc09)]((sc) => {
            const Cb = ut;
            if (["NA", "SA"][Cb(0x935)](sc[Cb(0xb06)])) sb = "US";
            else ["AS", "OC"][Cb(0x935)](sc[Cb(0xb06)]) && (sb = "AS");
          })
          [ut(0xe1b)]((sc) => {
            const Cc = ut;
            console[Cc(0x3d1)](Cc(0xbc4));
          })
          [ut(0xe07)](function () {
            const Cd = ut,
              sc = [];
            for (let se in qU) {
              const sf = qU[se];
              sf[Cd(0x244)][Cd(0x9d3)](sb) && sc[Cd(0xbc0)](sf);
            }
            const sd =
              sc[Math[Cd(0x7ce)](Math[Cd(0xb69)]() * sc[Cd(0xed7)])] ||
              qU[Cd(0xf1c)];
            console[Cd(0x3d1)](Cd(0x6c8) + sb + Cd(0xd09) + sd[Cd(0x244)]),
              sd["el"][Cd(0x70a)]();
          });
      }
    }
    (document[ut(0xb01)](ut(0x77a))[ut(0x49b)][ut(0xdaa)] = ut(0x30c)),
      kA[ut(0xa1b)][ut(0xde0)](ut(0xd5b)),
      kB[ut(0xa1b)][ut(0xeae)](ut(0xd5b)),
      (window[ut(0xbb8)] = function () {
        il(new Uint8Array([0xff]));
      });
    function r1(sc) {
      const Ce = ut;
      clearTimeout(kF), iu();
      const sd = {};
      (sd[Ce(0xab3)] = sc), (hU = sd), kg(!![]);
    }
    window[ut(0x562)] = r1;
    var r2 = null;
    function r3(sc) {
      const Cf = ut;
      if (!sc || typeof sc !== Cf(0x2a9)) {
        console[Cf(0x3d1)](Cf(0x826));
        return;
      }
      if (r2) r2[Cf(0x388)]();
      const sd = sc[Cf(0xd10)] || {},
        se = {};
      (se[Cf(0xb30)] = Cf(0x8ff)),
        (se[Cf(0xcbe)] = Cf(0x9ca)),
        (se[Cf(0xd8b)] = Cf(0x4d6)),
        (se[Cf(0xb80)] = Cf(0xd4c)),
        (se[Cf(0xb2a)] = !![]),
        (se[Cf(0x649)] = !![]),
        (se[Cf(0x289)] = ""),
        (se[Cf(0x765)] = ""),
        (se[Cf(0x53c)] = !![]),
        (se[Cf(0x2cd)] = !![]);
      const sf = se;
      for (let sl in sf) {
        (sd[sl] === void 0x0 || sd[sl] === null) && (sd[sl] = sf[sl]);
      }
      const sg = [];
      for (let sm in sd) {
        sf[sm] === void 0x0 && sg[Cf(0xbc0)](sm);
      }
      sg[Cf(0xed7)] > 0x0 &&
        console[Cf(0x3d1)](Cf(0x233) + sg[Cf(0x361)](",\x20"));
      sd[Cf(0x289)] === "" && sd[Cf(0x765)] === "" && (sd[Cf(0x289)] = "x");
      (sd[Cf(0xcbe)] = hP[sd[Cf(0xcbe)]] || sd[Cf(0xcbe)]),
        (sd[Cf(0xb80)] = hP[sd[Cf(0xb80)]] || sd[Cf(0xb80)]);
      const sh = nO(
        Cf(0x895) +
          sd[Cf(0xb30)] +
          Cf(0xeb3) +
          sd[Cf(0xcbe)] +
          Cf(0x7c9) +
          (sd[Cf(0xd8b)]
            ? Cf(0xae6) +
              sd[Cf(0xd8b)] +
              "\x22\x20" +
              (sd[Cf(0xb80)] ? Cf(0x8e2) + sd[Cf(0xb80)] + "\x22" : "") +
              Cf(0x41a)
            : "") +
          Cf(0x2c1)
      );
      (r2 = sh),
        (sh[Cf(0x388)] = function () {
          const Cg = Cf;
          document[Cg(0xc9e)][Cg(0xa1b)][Cg(0xeae)](Cg(0xd6d)),
            sh[Cg(0xeae)](),
            (r2 = null);
        }),
        (sh[Cf(0xb01)](Cf(0x61d))[Cf(0x4c5)] = sh[Cf(0x388)]);
      const si = sh[Cf(0xb01)](Cf(0x402)),
        sj = [],
        sk = [];
      for (let sn in sc) {
        if (sn === Cf(0xd10)) continue;
        const so = sc[sn];
        let sp = [];
        const sq = Array[Cf(0x660)](so);
        let sr = 0x0;
        if (sq)
          for (let ss = 0x0; ss < so[Cf(0xed7)]; ss++) {
            const st = so[ss],
              su = dF[st];
            if (!su) {
              sj[Cf(0xbc0)](st);
              continue;
            }
            sr++, sp[Cf(0xbc0)]([st, void 0x0]);
          }
        else
          for (let sv in so) {
            const sw = dF[sv];
            if (!sw) {
              sj[Cf(0xbc0)](sv);
              continue;
            }
            const sx = so[sv];
            (sr += sx), sp[Cf(0xbc0)]([sv, sx]);
          }
        if (sp[Cf(0xed7)] === 0x0) continue;
        sk[Cf(0xbc0)]([sr, sn, sp, sq]);
      }
      sd[Cf(0x2cd)] && sk[Cf(0x604)]((sy, sz) => sz[0x0] - sy[0x0]);
      for (let sy = 0x0; sy < sk[Cf(0xed7)]; sy++) {
        const [sz, sA, sB, sC] = sk[sy];
        sd[Cf(0x53c)] && !sC && sB[Cf(0x604)]((sG, sH) => sH[0x1] - sG[0x1]);
        let sD = "";
        sd[Cf(0xb2a)] && (sD += sy + 0x1 + ".\x20");
        sD += sA;
        const sE = nO(Cf(0xb48) + sD + Cf(0xec2));
        si[Cf(0x2e9)](sE);
        const sF = nO(Cf(0xa23));
        for (let sG = 0x0; sG < sB[Cf(0xed7)]; sG++) {
          const [sH, sI] = sB[sG],
            sJ = dF[sH],
            sK = nO(
              Cf(0x21f) + sJ[Cf(0x23b)] + "\x22\x20" + qy(sJ) + Cf(0x41a)
            );
          if (!sC && sd[Cf(0x649)]) {
            const sL = sd[Cf(0x289)] + k9(sI) + sd[Cf(0x765)],
              sM = nO(Cf(0xf0a) + sL + Cf(0xec2));
            sL[Cf(0xed7)] > 0x6 && sM[Cf(0xa1b)][Cf(0xde0)](Cf(0xd08)),
              sK[Cf(0x2e9)](sM);
          }
          (sK[Cf(0x558)] = sJ), sF[Cf(0x2e9)](sK);
        }
        si[Cf(0x2e9)](sF);
      }
      kl[Cf(0x2e9)](sh),
        sj[Cf(0xed7)] > 0x0 &&
          console[Cf(0x3d1)](Cf(0xc7e) + sj[Cf(0x361)](",\x20")),
        document[Cf(0xc9e)][Cf(0xa1b)][Cf(0xde0)](Cf(0xd6d));
    }
    (window[ut(0xae5)] = r3),
      (document[ut(0xc9e)][ut(0x363)] = function (sc) {
        const Ch = ut;
        sc[Ch(0x755)]();
        const sd = sc[Ch(0x4c9)][Ch(0x2a8)][0x0];
        if (sd && sd[Ch(0x8ca)] === Ch(0x631)) {
          console[Ch(0x3d1)](Ch(0xd7e) + sd[Ch(0x244)] + Ch(0xe83));
          const se = new FileReader();
          (se[Ch(0x45f)] = function (sf) {
            const Ci = Ch,
              sg = sf[Ci(0x54d)][Ci(0x886)];
            try {
              const sh = JSON[Ci(0x1f3)](sg);
              r3(sh);
            } catch (si) {
              console[Ci(0xb60)](Ci(0x50f), si);
            }
          }),
            se[Ch(0x499)](sd);
        }
      }),
      (document[ut(0xc9e)][ut(0x52d)] = function (sc) {
        const Cj = ut;
        sc[Cj(0x755)]();
      }),
      Object[ut(0x2a6)](window, ut(0x535), {
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
      f = f - 0x1f1;
      let h = e[f];
      return h;
    }),
    b(c, d)
  );
}
function a() {
  const Ck = [
    "Nitro\x20Boost",
    "val",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "It\x20burns.",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "Increases",
    "turtle",
    "\x20(Lvl\x20",
    ".lottery",
    "iReqAccountData",
    "#a760b1",
    "centipedeBodyDesert",
    "prototype",
    "#c1a37d",
    "wing",
    "center",
    "hsl(110,100%,50%)",
    "Reduced\x20Wave\x20duration.",
    "charCodeAt",
    "Beetle",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "visible",
    "Fixed\x20players\x20pushing\x20eachother.",
    "Q2mA",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "armorF",
    "add",
    "backgroundColor",
    "User",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    "fillRect",
    "onchange",
    "#34f6ff",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    "snail",
    "Ears",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    "Yoba\x20Egg",
    ".game-stats-btn",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "#ce76db",
    "#21c4b9",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    ".stat-value",
    "isHudPetal",
    ".import-btn",
    "1rrAouN",
    "rgb(134,\x2031,\x20222)",
    "Statue\x20of\x20RuinedLiberty.",
    "*Arrow\x20damage:\x201\x20→\x203",
    "28th\x20June\x202023",
    "#db4437",
    ".fixed-name-cb",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    "orbitRange",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "Rock_4",
    "1Jge",
    ".collected",
    "poisonT",
    "useTime",
    "finally",
    ".shake-cb",
    "*Snail\x20health:\x2040\x20→\x2045",
    "cookie",
    "11th\x20July\x202023",
    "#fe98a2",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "*Bone\x20armor:\x209\x20→\x2010",
    "hit.p",
    "<div\x20style=\x22color:\x20",
    "Lightning\x20damage:\x2012\x20→\x208",
    "pow",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    "3rd\x20August\x202023",
    "https://auth.hornex.pro/discord",
    "inventory",
    "*Peas\x20damage:\x2015\x20→\x2020",
    "zvNu",
    "hsl(110,100%,60%)",
    "<div\x20",
    "catch",
    "toLow",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    "deadT",
    "url(",
    "getElementById",
    "isPoison",
    "slice",
    "mob_",
    "avatar",
    "assualted",
    "Dragon\x20Egg",
    "KeyR",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    "quadraticCurveTo",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    "content",
    "posAngle",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    "Added\x202\x20US\x20lobbies.",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "documentElement",
    "isClown",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x22",
    ".privacy-btn",
    ".settings",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    "Arrow",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "curve",
    "vendor",
    "*Powder\x20health:\x2010\x20→\x2015",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Rock\x20Egg",
    "Super\x20Players",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "lieOnGroundTime",
    ".builds-btn",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "hsla(0,0%,100%,0.1)",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    "\x20in\x20view\x20/\x20",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    ".tooltip",
    "Added\x20another\x20AS\x20lobby.",
    "iReqGlb",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "from",
    "#654a19",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "Loaded\x20Build\x20#",
    "timePlayed",
    "Spawn\x20zone\x20changes:",
    "stickbug",
    "/dlPetal",
    ".login-btn",
    "New\x20rarity:\x20Hyper.",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "#5ec13a",
    "\x20You\x20",
    "#1ea761",
    ".ultra-buy",
    "=([^;]*)",
    "2090768fiNzSa",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "Stick",
    "WQ7dTmk3W6FcIG",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    "yellowLadybug",
    "s...)",
    ".video",
    "2-digit",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "\x22>Page\x20#",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    "bubble",
    "nShield",
    "hide_chat",
    "renderBelowEverything",
    "19th\x20July\x202023",
    "updateProg",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    "text",
    "rgb(219\x20130\x2041)",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    "uwu",
    "duration",
    "Former\x20student\x20of\x20Yoda.",
    "#D2D1CD",
    ".active",
    "New\x20petal:\x20Wig.",
    ".clown-cb",
    "16th\x20June\x202023",
    ".nickname",
    "ned.\x22",
    "WRGBrCo9W6y",
    "7th\x20February\x202024",
    "petalStinger",
    "hpAlpha",
    "...",
    "\x0a16th\x20May\x202024\x0aAdded\x20Game\x20Statistics:\x0a*Super\x20Players\x0a*Hyper\x20Players\x0a*Ultra\x20Players\x20(with\x20more\x20than\x20200\x20ultra\x20petals)\x0a*All\x20Petals\x0a*Data\x20is\x20updated\x20every\x20hour.\x0a*You\x20can\x20search\x20game\x20stats\x20by\x20username.\x0a",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "healthIncrease",
    "consumeProjHealth",
    "/weborama.js",
    "rgb(222,111,44)",
    "started!",
    "Added\x201\x20AS\x20lobby.",
    "EU\x20#2",
    "consumeProjDamageF",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "right_align_petals",
    "8th\x20July\x202023",
    "#ff4f4f",
    "Downloaded!",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    "<div\x20class=\x22petal-icon\x22\x20",
    "keyAlreadyUsed",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    "spiderCave",
    "Extra\x20Vision",
    "5th\x20January\x202024",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "petalBone",
    "path",
    "*Peas\x20health:\x2020\x20→\x2025",
    "mobKilled",
    "Cactus",
    "</option>",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "flors",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    ".petals-picked",
    "M28",
    "\x20no-icon\x22\x20",
    "20th\x20June\x202023",
    "Wave\x20Ending...",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "Ghost_5",
    "rgb(255,\x2043,\x20117)",
    "remove",
    "keyClaimed",
    "#ce79a2",
    "#4eae26",
    "createElement",
    "\x22\x20style=\x22color:",
    ".global-user-count",
    "bolder\x2025px\x20",
    "*Cotton\x20health:\x208\x20→\x209",
    "#7dad0c",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "isLightning",
    "queen",
    "ad\x20refresh",
    "#e05748",
    "shield",
    "*Cotton\x20health:\x209\x20→\x2010",
    "createImageData",
    ".scale-cb",
    "\x22></div>",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    "Ultra\x20Players\x20(200+)",
    "#5ab6ab",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "?dev",
    "progressEl",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    ".petals.small",
    ".data-search-result",
    "getBoundingClientRect",
    "clipboard",
    ".leave-btn",
    "Invalid\x20petal\x20name:\x20",
    "*Recuded\x20mob\x20count.",
    "https://www.youtube.com/@KePiKgamer",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    "textEl",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    "New\x20setting:\x20UI\x20Scale.",
    "length",
    "reloadT",
    "ghost",
    "KeyK",
    "honeyDmgF",
    "sprite",
    "\x20ctxs\x20(",
    "Yellow\x20Ladybug",
    "#ffffff",
    "*Turtle\x20health\x20500\x20→\x20600",
    "bone",
    "fovFactor",
    "*Snail\x20damage:\x2010\x20→\x2015",
    "Changes\x20to\x20anti-lag\x20system:",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "s.\x20Yo",
    "air",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "an\x20UN",
    "Dragon_2",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    "usernameClaimed",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "blur",
    "main",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "swapped",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    "26th\x20January\x202024",
    "getTransform",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "#fff0b8",
    "*Super:\x20180",
    "#38c125",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "Bee",
    "shootLightning",
    "hsla(0,0%,100%,0.5)",
    "affectMobHealDur",
    "2772301LQYLdH",
    "9th\x20July\x202023",
    "29th\x20January\x202024",
    "\x20$1",
    "Dandelion",
    ".gamble-prediction",
    "Ghost",
    "hsl(110,100%,10%)",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "Ruined",
    "isPassiveAggressive",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "disabled",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "Swastika",
    "Spider",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    "Leaf",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    "qmklWO4",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "*Ultra:\x201-5",
    "purple",
    "*Light\x20damage:\x2013\x20→\x2012",
    "eu_ffa",
    "pathSize",
    "Soil",
    "#b5a24b",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    "offsetHeight",
    "*Cotton\x20health:\x2012\x20→\x2015",
    "Removed\x20Waves.",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "Orbit\x20Dance",
    "side",
    "agroRangeDec",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "CCofC2RcTG",
    "Health",
    "20th\x20July\x202023",
    "petalRock",
    "teal\x20",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "starfish",
    "timeJoined",
    ".terms-btn",
    "index",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "percent",
    "spawnT",
    "6EbXQJJ",
    "14374KBQDzy",
    "#33a853",
    "Poisonous\x20gas.",
    "Hornet",
    "n\x20an\x20",
    "toLocaleDateString",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    "getTitleEl",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "dontResolveCol",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "Magnet",
    "have\x20",
    ".scores",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "connectionIdle",
    "totalTimePlayed",
    "uiY",
    "Added\x20banner\x20ads.",
    "Damage",
    "parse",
    "*Arrow\x20health:\x20180\x20→\x20220",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "<option\x20value=\x22",
    "scale",
    "Baby\x20Ant",
    "span\x202",
    ".shop",
    "spawnOnDie",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    "insertBefore",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "resize",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "?v=",
    "start",
    "#eeeeee",
    "occupySlot",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "#222",
    "\x20Ultra",
    "petalPollen",
    "25th\x20January\x202024",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "shadowBlur",
    "dice",
    "spikePath",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    "EU\x20#1",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    "https://www.youtube.com/@gowcaw97",
    "Starfish",
    "petalAntidote",
    "scrollHeight",
    "21st\x20June\x202023",
    "sunflower",
    "ArrowUp",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "fossil",
    "Fixed\x20duplicate\x20drops.",
    "lient",
    "<div\x20class=\x22petal\x20tier-",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "#feffc9",
    "19th\x20June\x202023",
    "13th\x20February\x202024",
    "iCheckKey",
    "bottom",
    "picked",
    "Hnphe",
    "isPortal",
    "WP3dRYddTJC",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    "babyAntFire",
    ".zone-name",
    "rgb(77,\x2082,\x20227)",
    "<div\x20stroke=\x22Last\x20Updated:\x2010s\x20ago\x22></div>",
    "Hornet_4",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "ultraPlayers",
    "#c9b46e",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    "rotate",
    "2nd\x20August\x202023",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    "Password\x20downloaded!",
    "Orbit\x20Shlongation",
    ".damage-cb",
    "tier",
    ".download-btn",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "Rock_5",
    "100%",
    "*Epic:\x2075\x20→\x2065",
    "Username\x20claimed!",
    "style=\x22background-position:\x20",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "name",
    "Stickbug",
    "#f54ce7",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "WP5YoSoxvq",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "hostname",
    "drawDragon",
    "KeyW",
    "#416d1e",
    "Craft",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    "slayed",
    "dSk+d0afnmo5WODJW6zQxW",
    "Summons\x20the\x20power\x20of\x20wind.",
    "WAVE",
    "dontExpand",
    "pop",
    ".player-list-btn",
    "onmessage",
    "Petaler",
    "nSize",
    "successCount",
    "ArrowRight",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "ArrowDown",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "affectMobHeal",
    "lightning",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    "Fixed\x20Gem\x20glitch.",
    "Leave",
    "progress",
    "projPoisonDamageF",
    "petalPoo",
    "[censored]",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    "spider",
    "Some\x20anti\x20lag\x20measures:",
    "innerHTML",
    "Extra\x20Spin\x20Speed",
    "Added\x20Shop.",
    "hsla(0,0%,100%,0.4)",
    "22nd\x20July\x202023",
    "randomUUID",
    "rando",
    "killed",
    "Extra\x20Pickup\x20Range",
    "right",
    "petalExpander",
    "210ZoZRjI",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "#9e7d24",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "are\x20p",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    "e8oQW7VdPKa",
    "eyeX",
    "toFixed",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    "Boomerang.",
    "textAlign",
    "Added\x20Waves.",
    "labelPrefix",
    "number",
    "_blank",
    ".tabs",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "*Taco\x20healing:\x208\x20→\x209",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "Minor\x20physics\x20change.",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    "top",
    "hideAfterInactivity",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "14th\x20July\x202023",
    "15584076IAHWRs",
    "ability",
    "petHeal",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "nickname",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    ".craft-btn",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Snail",
    "#888",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "nameEl",
    "defineProperty",
    "#4040fc",
    "files",
    "object",
    "renderOverEverything",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    ".grid-cb",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    "angleOffset",
    "onclose",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "ears",
    "Poison",
    "#353331",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    "key",
    "iWithdrawPetal",
    "Hornet\x20Egg",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    "iClaimUsername",
    ".swap-btn",
    "Yoba",
    "petalPincer",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "AS\x20#2",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    "Kicked!\x20(reason:\x20",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "#b53229",
    "719574lHbJUW",
    "dontUiRotate",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "touchmove",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "#9fab2d",
    "render",
    "sortGroups",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    "count",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    "undefined",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "particle_heart_",
    "Soldier\x20Ant_1",
    "scale2",
    ".score-overlay",
    "Video\x20AD\x20success!",
    "#543d37",
    "centipedeBodyPoison",
    "other",
    "sk.",
    "#5849f5",
    "Sandstorm_5",
    "Invalid\x20username.",
    "ontouchend",
    ".\x20Hac",
    "retardDuration",
    "xgMol",
    "appendChild",
    "ICIAL",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    "rect",
    "assassinated",
    "onopen",
    "wig",
    "#ff7380",
    "Soldier\x20Ant_6",
    "#e94034",
    "wn\x20ri",
    "alpha",
    "Powder",
    "hasHalo",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    "25th\x20July\x202023",
    "pedoxMain",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "Spider\x20Yoba",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    "#ffe667",
    "abs",
    "*Reduced\x20HP\x20depletion.",
    "shell",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    "Much\x20heavier\x20than\x20your\x20mom.",
    "rotate(",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    ".key-input",
    "\x22></span>",
    ".circle",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    "none",
    "getHurtColor",
    "#38ecd9",
    "iGamble",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    "📜\x20",
    ".discord-btn",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "#76ad45",
    "Added\x20Lottery.",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "size",
    "can\x20s",
    "petalDrop_",
    "wrecked",
    "Tumbleweed",
    "low_quality",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    ".ad-blocker",
    "numAccounts",
    "nt.\x20H",
    "nProg",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    "Yoba_2",
    "*Iris\x20poison:\x2045\x20→\x2050",
    ".lottery\x20.inventory-petals",
    "tumbleweed",
    "endsWith",
    "copy",
    ".killer",
    "),0)",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    "petalPea",
    "toUpperCase",
    "#555",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    ".absorb-clear-btn",
    "<div\x20class=\x22data-search-item\x22>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22#",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    "Dragon_3",
    "Scorpion",
    "createdAt",
    ".bar",
    "keyCode",
    "*Snail\x20health:\x2045\x20→\x2050",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "uiCountGap",
    "<div\x20class=\x22chat-name\x22></div>",
    "lightblue",
    "2357",
    "iReqGambleList",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    "Damage\x20Reflection",
    "textarea",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "reqFailed",
    ".player-count",
    "drawIcon",
    "KeyC",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "petalCactus",
    "Ancester\x20of\x20flowers.",
    "hasEars",
    "Dragon_1",
    ".tooltips",
    "cmk+c0aoqSoLWQrQW6Tx",
    "writeText",
    "3WRI",
    "#400",
    "WRyiwZv5x3eIdtzgdgC",
    "*Reduced\x20mob\x20count.",
    "#7d5b1f",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    "misReflectDmgFactor",
    "Heart",
    "Spider\x20Egg",
    "*Bone\x20armor:\x204\x20→\x205",
    "join",
    "*Snail\x20Health:\x20180\x20→\x20120",
    "ondrop",
    "lottery",
    "rnex.",
    "orbitDance",
    "vFKOVD",
    "Ghost_6",
    "projAffectHealDur",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "24th\x20August\x202023",
    "https://stats.hornex.pro/",
    "halo",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "*Heavy\x20health:\x20450\x20→\x20500",
    "Error\x20refreshing\x20ad.",
    ".container",
    "checked",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    "#c69a2c",
    "#dc704b",
    "Failed\x20to\x20get\x20game\x20stats.\x20Retrying\x20in\x205s...",
    "petalSpiderEgg",
    "damageF",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    "hasSpawnImmunity",
    "Soldier\x20Ant_3",
    "setPos",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    "LEAVE\x20ZONE!!",
    "petalMagnet",
    "Furry",
    "icBdNmoEta",
    "#b58500",
    ".build-save-btn",
    "#e6a44d",
    "setCount",
    "dispose",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    "pro",
    "://ho",
    "nerd",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    "Craft\x20rate\x20change:",
    "\x20at\x20least!",
    "Honey\x20factory.",
    "ages.",
    "rgb(222,\x2031,\x2031)",
    "spiderLeg",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "\x22></div>\x20<div\x20style=\x22color:",
    ".total-kills",
    "ing\x20o",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "Rock_2",
    "slowDuration",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "#7af54c",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    "href",
    "*Snail\x20damage:\x2015\x20→\x2020",
    "totalKills",
    "us_ffa2",
    "Chromosome",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "\x20+\x20",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "playerList",
    "Invalid\x20mob\x20name:\x20",
    ".build-petals",
    "groups",
    "23rd\x20January\x202024",
    "Salt",
    "3YHM",
    "Nitro",
    "regenAfterHp",
    "hasAbsorbers",
    "subscribe\x20for\x20999\x20super\x20petals",
    "3m^(",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    "px\x20",
    "pink",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "#a17c4c",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "opera",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    ".textbox",
    "Head",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    "d.\x20Pr",
    "translate(-50%,\x20",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "#b28b29",
    "userProfile",
    "hsl(60,60%,60%)",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "pedox",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    "Petals",
    "Comes\x20to\x20avenge\x20mobs.",
    "*Turtle\x20health:\x20600\x20→\x20900",
    "log",
    "poisonDamageF",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "Username\x20is\x20already\x20taken.",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    "petal_",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    "petalDrop",
    ".reload-btn",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "sq8Ig3e",
    "/hqdefault.jpg)",
    "loading",
    "\x20•\x20",
    "%;\x22\x20stroke=\x22",
    "powderTime",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    "extraRange",
    "WPPnavtdUq",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "projSpeed",
    "breedRange",
    "Sponge",
    "warn",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    "#c76cd1",
    ".switch-btn",
    "New\x20mob:\x20Tumbleweed.",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "Legendary",
    "isSwastika",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "KeyL",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "petalEgg",
    "setTargetEl",
    "UNOFF",
    "outdatedVersion",
    "centipedeHeadPoison",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "enable_kb_movement",
    "beetle",
    "lineJoin",
    ".dialog-content",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "Petal\x20Weight",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "gameStats",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "projDamage",
    "totalPetals",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    "width",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "Rice",
    ".game-stats\x20.dialog-content",
    "soldierAnt",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    "Epic",
    "isShiny",
    "ion",
    "Expander",
    "hasAntenna",
    "iPercent",
    "shinyCol",
    "oPlayerY",
    "reset",
    "></div>",
    "#eb4755",
    "https",
    "activeElement",
    "#8d9acc",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    "isLightsaber",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    "%zY4",
    "Flower\x20Damage",
    "1st\x20April\x202024",
    "Breaths\x20fire.",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    ".flower-stats",
    "ellipse",
    "seed",
    "show_debug_info",
    "iMood",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    "keyInvalid",
    "day",
    "Fire",
    "sign",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "u\x20are",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "admin_pass",
    "bone_outline",
    "tagName",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "\x20pxls)\x20/\x20",
    "leaders",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    "[data-icon]",
    "#dddddd",
    "Hornet_5",
    "deltaY",
    "translate(-50%,",
    ".show-population-cb",
    "iAngle",
    "#fdda40",
    "projAngle",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    "kWicW5FdMW",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "outlineCount",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    "Fixed\x20another\x20craft\x20exploit.",
    "US\x20#2",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "waveEnding",
    "cactus",
    "devicePixelRatio",
    "absorbPetalEl",
    "lineCap",
    "Loading\x20video\x20ad...",
    "show_helper",
    "player",
    "addToInventory",
    ".my-player",
    "4th\x20April\x202024",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    "#32a852",
    "prog",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    "https://www.youtube.com/@FussySucker",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "onload",
    "Buffed\x20Lightsaber:",
    "#d3d14f",
    "shadowColor",
    "setUint8",
    ".discord-area",
    "removeChild",
    "Fixed\x20number\x20rounding\x20issue.",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "petalAvacado",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "<div\x20class=\x22slot\x22></div>",
    "Added\x20Global\x20Leaderboard.",
    "Extra\x20Speed",
    "31206WnFLiZ",
    "Desert",
    "shieldRegenPerSecF",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "Mob\x20",
    "div",
    "flowerPoison",
    "children",
    "Honey\x20Range",
    ".builds",
    "#554213",
    "#a2dd26",
    "#f009e5",
    "gridColumn",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    "bar",
    "petalStarfish",
    "#406150",
    "furry",
    ".tv-prev",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "Space",
    "nick",
    "mobSizeChange",
    "nt\x20an",
    "*Gas\x20poison:\x2030\x20→\x2040",
    "absorb",
    ".checkbox",
    "<div>\x0a\x09\x09<span\x20stroke=\x22",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "honeyRange",
    "Light",
    "ount\x20",
    "p41E",
    "1167390UrVkfV",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    "Ghost_2",
    "OFF",
    "passiveBoost",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    "asdfadsf",
    "readAsText",
    "2nd\x20March\x202024",
    "style",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    "petalSkull",
    "max",
    "101636gyvtEF",
    "*Arrow\x20damage:\x204\x20→\x205",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    ".death-info",
    "%/s",
    "RuinedLiberty",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "draw",
    "\x20players\x20•\x20",
    ".petal.empty",
    "canRemove",
    "month",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    ".chat-content",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "changedTouches",
    "redHealthTimer",
    "9th\x20August\x202023",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    "user",
    "^F[@",
    "*Cement\x20health:\x2080\x20→\x20100",
    "#e0c85c",
    "Gem",
    "Crab",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "petalSword",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "canRender",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    "enable_min_scaling",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "\x20petals\x22></div>\x0a\x09\x09\x09\x09\x09</div>",
    "drawSnailShell",
    "onclick",
    "15th\x20July\x202023",
    "*Heavy\x20damage:\x209\x20→\x2010",
    "#82b11e",
    "dataTransfer",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    "beginPath",
    "Ghost_7",
    "isConnected",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    "setUint32",
    "Lvl\x20",
    "uiName",
    "Ladybug",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "rgb(255,\x20230,\x2093)",
    "Very\x20sussy\x20data!",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    "healthF",
    "projDamageF",
    "discord_data",
    "Stinger",
    "identifier",
    "totalAccounts",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    ".discord-user",
    "deleted",
    "has\x20ended.",
    "https://discord.gg/zZsUUg8rbu",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "accountId",
    "lineWidth",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "setAttribute",
    "rgba(0,0,0,",
    "video-ad-skipped",
    "#ab7544",
    "#15cee5",
    "(reloading...)",
    "Duration",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    "NHkBqi",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    "cantPerformAction",
    ".stats\x20.dialog-content",
    "canvas",
    "\x22\x20stroke=\x22",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    "#735b49",
    "hpRegenPerSecF",
    "extraSpeed",
    "btn",
    ".rewards\x20.dialog-content",
    "petalSoil",
    "Provide\x20a\x20name\x20dummy.",
    "Petal\x20",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "projSize",
    "unnamed",
    "#8ecc51",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "Cotton\x20bush.",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "WQpcUmojoSo6",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "1st\x20July\x202023",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "sandstorm",
    "Nerfed\x20Spider\x20Yoba.",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    "New\x20petal:\x20Sponge",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    "onMove",
    "#000000",
    "ShiftRight",
    "orb\x20a",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    "scrollTop",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "x.pro",
    "damage",
    "6th\x20September\x202023",
    "hasEye",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    ".minimap",
    "keys",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "uniqueIndex",
    "isStatic",
    "rgba(0,0,0,0.2)",
    "and\x20a",
    "kicked",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    ".waveroom-info",
    "15th\x20August\x202023",
    "Continue",
    "Sunflower",
    "ondragover",
    ".lottery-btn",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    "weedSeed",
    "27th\x20February\x202024",
    "15807WcQReK",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "msgpack",
    "sqrt",
    "wasDrawn",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    "Flower\x20Poison",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "shlong",
    "sortGroupItems",
    "flowerPoisonF",
    "arraybuffer",
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "#ff63eb",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    "#a33b15",
    "i\x20make\x20cool\x20videos",
    "#4d5e56",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "27th\x20June\x202023",
    "Desert\x20Centipede",
    "breedTimer",
    "ArrowLeft",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "Mob\x20Size\x20Change",
    "target",
    "rgba(0,0,0,0.4)",
    "blur(10px)",
    "Dark\x20Ladybug",
    ".tv-next",
    "petalChromosome",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    "unset",
    "24th\x20June\x202023",
    "globalAlpha",
    "petal",
    "long",
    "Rock_1",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    "eu_ffa2",
    "Game\x20released\x20to\x20public!",
    "makeHole",
    "show_bg_grid",
    "#d3ad46",
    "iReqUserProfile",
    "connect",
    "yellow",
    "g\x20on\x20",
    "https://stats.hornex.pro/api/userCount",
    "layin",
    "#29f2e5",
    "Absorb",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    "Extremely\x20slow\x20sussy\x20mob.",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "Pollen",
    "Fleepoint",
    "#ccad00",
    "Taco",
    "*Missile\x20damage:\x2050\x20→\x2055",
    "Yoba_5",
    "Banana",
    "\x20ago",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    "points",
    "Re-added\x20Waves.",
    ".censor-cb",
    ".username-area",
    "20th\x20January\x202024",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    ".gamble-petals-btn",
    "6fCH",
    ".absorb\x20.dialog-content",
    ".clear-build-btn",
    "Turtle",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    ".hyper-buy",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    "l\x20you",
    "deadPreDraw",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    "#a82a00",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "isRectHitbox",
    "compression\x20version\x20not\x20supported:\x20",
    "#634418",
    "petSizeChangeFactor",
    "createPattern",
    "petalBanana",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "<span\x20style=\x22color:",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "Health\x20Depletion",
    ";position:absolute;top:",
    "curePoison",
    "Dragon",
    "*Hyper:\x202%\x20→\x201%",
    "Take\x20Down\x20Time",
    "KeyA",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "userChat",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    "Fixed\x20Rice.",
    "6th\x20July\x202023",
    "<div\x20class=\x22data-top-area\x22>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Current\x20Page:\x22></span>\x0a\x09\x09\x09\x09<select\x20tabindex=\x22-1\x22></select>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<label>\x0a\x09\x09\x09\x09<span\x20stroke=\x22Search:\x22></span>\x0a\x09\x09\x09\x09<input\x20class=\x22textbox\x20data-search\x22\x20type=\x22text\x22\x20placeholder=\x22Enter\x20value...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09</label>\x0a\x09\x09\x09<div\x20class=\x22data-search-result\x22\x20style=\x22display:none;\x22></div>\x0a\x09\x09</div>",
    "rgb(",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    "#368316",
    "buffer",
    "\x22\x20stroke=\x22(",
    "petalHeavy",
    "worldH",
    "wss://as2.hornex.pro",
    ".export-btn",
    "getUint16",
    "location",
    "petalTurtle",
    "getRandomValues",
    "Reflected\x20Missile\x20Damage",
    "55078DZMiSD",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    "containerDialog",
    "rock",
    "#bebe2a",
    "*Light\x20damage:\x2012\x20→\x2010",
    "579qqUWFN",
    "GBip",
    "#cecfa3",
    "Rare",
    "#695118",
    "mood",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    "13th\x20September\x202023",
    "chain",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "crab",
    "toLocaleString",
    "Bubble",
    "petalMissile",
    "wss://eu2.hornex.pro",
    "drawWingAndHalo",
    "*Health:\x20100\x20→\x20120",
    "253906KWTZJW",
    "\x22></div><div\x20class=\x22log-content\x22>",
    "find",
    "#bb1a34",
    "onkeydown",
    "lighter",
    "8th\x20August\x202023",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    "lightningDmgF",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    "sad",
    "getContext",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "#444444",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    ".screen",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    "kbps",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    "Breed\x20Strength",
    "hurtT",
    "krBw",
    "TC0B",
    ".lottery-users",
    "#ebda8d",
    "atan2",
    "legD",
    "sameTypeColResolveOnly",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    "isStatue",
    "#ab5705",
    "Orbit\x20Twirl",
    "runSpeed",
    "pickupRangeTiers",
    "updateT",
    "Dice",
    "Pacman",
    "\x22></span></div>\x0a\x09</div>",
    "darkLadybug",
    "petalMushroom",
    "cantChat",
    "makeFire",
    "bolder\x2017px\x20",
    "honeyDmg",
    "iChat",
    "#2e933c",
    "#363685",
    "moveSpeed",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    "petalStr",
    "lobbyClosing",
    "#a52a2a",
    "Sandstorm_3",
    "Unknown\x20message\x20id:\x20",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "sort",
    "*Damage:\x204\x20→\x206",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    ".build-load-btn",
    "Soldier\x20Ant_4",
    "petalSand",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "Body",
    "#dbab2e",
    "#b9baba",
    "spawn_zone",
    "fixed",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    "/dlSprite",
    "https://www.instagram.com/zertalious",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    "*They\x20give\x2010x\x20score.",
    "WP4dWPa7qCklWPtcLq",
    "soakTime",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "#fc5c5c",
    "glbData",
    "parts",
    "#fc9840",
    ".close-btn",
    "190751AxAeaX",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "changelog",
    "cmd",
    "transformOrigin",
    "insert\x20something\x20here...",
    "*Super:\x20150+",
    "antHole",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    ".credits-btn",
    "animationDirection",
    "Increased\x20Wave\x20mob\x20count.",
    "New\x20mob:\x20M28.",
    "<div><span\x20stroke=\x22",
    "clientX",
    "4th\x20July\x202023",
    "absolute",
    "player_id",
    "Shield",
    "application/json",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "*Bone\x20armor:\x208\x20→\x209",
    "ladybug",
    "show_grid",
    "select",
    "petalStick",
    "VLa2",
    "oiynC",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    "Beetle_2",
    "getUint8",
    "getUint32",
    "dur",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "keyCheckFailed",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "Makes\x20you\x20poisonous.",
    "OPEN",
    ".stats\x20.dialog-header\x20span",
    "consumeTime",
    ".dismiss-btn",
    "Basic",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    "showItemLabel",
    "n8oKoxnarXHzeIzdmW",
    ".ui-scale\x20select",
    ".changelog",
    ".submit-btn",
    "bolder\x20",
    "oncontextmenu",
    "Digit",
    "projHealth",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    "Shrinker",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    "*Rice\x20damage:\x204\x20→\x205",
    "addEventListener",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "6th\x20October\x202023",
    "consumeProjHealthF",
    "rgb(92,\x20116,\x20176)",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "\x22></div>\x0a\x09</div>",
    "server",
    "acker",
    "isArray",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "1px",
    "health",
    "isDevelopmentMode",
    "New\x20mob:\x20Sunflower.",
    "Rose",
    "Scorpion\x20redesign.",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "#fff",
    "countAngleOffset",
    "Guardian",
    "New\x20score\x20formula.",
    "onmousedown",
    "15th\x20June\x202023",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    "#5ef64f",
    "Spider\x20Cave",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "</div><div\x20class=\x22log-line\x22></div>",
    "W6HBdwO0",
    "green",
    "poisonDamage",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    ".prediction",
    "US\x20#1",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    "close",
    "New\x20mob:\x20Pedox",
    "ceil",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "New\x20mob:\x20Beehive.",
    "\x20HP",
    "mouse",
    "nSkOW4GRtW",
    "*Pincer\x20damage:\x205\x20→\x206",
    "#eee",
    "mushroom",
    ".sad-btn",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "#709d45",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "eyeY",
    "WP4hW755jCokWRdcKchdT3ui",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "killsNeeded",
    "Mob\x20Rotation",
    "isFakeChat",
    "#328379",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    "#ff3333",
    "oceed",
    "#ada25b",
    "petalCotton",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "portal",
    "#ebeb34",
    "Failed\x20to\x20load\x20game\x20stats!",
    ".scoreboard-title",
    "stayIdle",
    "#493911",
    "Gas",
    "\x22></div>\x0a\x09\x09",
    "marginLeft",
    "values",
    "Missile\x20Damage",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    ".absorb-petals-btn",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    "*Rock\x20health:\x20150\x20→\x20200",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    "oPlayerX",
    "uiHealth",
    ".max-wave",
    "thirdEye",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "Statue",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "4th\x20August\x202023",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    "wss://",
    "px)",
    "*Opening\x20Lottery",
    ".minimap-cross",
    "reflect",
    "statue",
    "contains",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    "New\x20mob:\x20Nigersaurus.",
    "Enter",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "hpRegen75PerSec",
    "ctx",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "oninput",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "Region:\x20",
    "*Halo\x20now\x20stacks.",
    "switched",
    "%;left:",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    ".menu",
    ".connecting",
    "mouse0",
    "angleSpeed",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "image/png",
    "5th\x20August\x202023",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    "#3db3cb",
    "Spider\x20Legs",
    ";-webkit-background-position:\x20",
    "sadT",
    "clientWidth",
    "Heal\x20Affect\x20Duration",
    "isConsumable",
    "hide-scoreboard",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    "maxLength",
    "Added\x20video\x20ad.",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    "pZWkWOJdLW",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "targetPlayer",
    "trim",
    "makeSpiderLegs",
    "fillText",
    "#854608",
    "*Fire\x20health:\x2070\x20→\x2080",
    "measureText",
    "--angle:",
    "petalYinYang",
    "%</option>",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    "*Rare:\x2050\x20→\x2035",
    "Faster",
    "prepend",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    "exp",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    "getFloat32",
    "r\x20acc",
    "makeBallAntenna",
    "petalWeb",
    "web_",
    "#555555",
    "KeyF",
    "#709e45",
    "no\x20sub,\x20no\x20gg",
    ".clown",
    "oHealth",
    "mobId",
    "mobGallery",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    "\x20online)",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "innerWidth",
    "show_clown",
    "Failed\x20to\x20get\x20userCount!",
    "webSizeTiers",
    "click",
    "Shell",
    "8URl",
    "iPing",
    "&response_type=code&scope=identify&state=",
    "fire",
    "hornet",
    "\x27s\x20Profile",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    "credits",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    "ontouchstart",
    "as_ffa1",
    "New\x20mob:\x20Spider\x20Cave.",
    "1998256OxsvrH",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "year",
    "#ffd800",
    "petSizeIncrease",
    "removeT",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "rkJNdF",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "sponge",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    "#6f5514",
    "dir",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    "Redesigned\x20some\x20mobs.",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    "hasSwastika",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "<div\x20class=\x22chat-text\x22></div>",
    "Increases\x20flower\x27s\x20health\x20power.",
    "mouse2",
    "Wave\x20changes:",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    "workerAnt",
    "3rd\x20February\x202024",
    "Web\x20Radius",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "WARNING!",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    "Spider_1",
    "rewards",
    "\x20and\x20",
    "Honey",
    "Increases\x20petal\x20spin\x20speed.",
    "innerHeight",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "Fire\x20Ant\x20Hole",
    "executed",
    "powderPath",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "clearRect",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "fillStyle",
    "textBaseline",
    "1830BqCmTX",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "byteLength",
    "updatePos",
    "j[zf",
    "execCommand",
    "Spawns",
    "flipDir",
    "preventDefault",
    "26th\x20September\x202023",
    "indexOf",
    "petalDandelion",
    "#ffd363",
    "*Yoba\x20Egg\x20buff.",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "accountNotFound",
    ".max-score",
    "Sand",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "Soak\x20Duration",
    "Missile\x20Health",
    "WOpcHSkuCtriW7/dJG",
    "guardian",
    "labelSuffix",
    "Balancing:",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "z8kgrX3dSq",
    "%\x20!important",
    "*Swastika\x20health:\x2030\x20→\x2035",
    "off",
    "%\x20success\x20rate",
    "span",
    "W7/cOmkwW4lcU3dcHKS",
    "pet",
    "#d3c66d",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "addCount",
    "#000",
    "spotPath_",
    "putImageData",
    "Added\x20Leave\x20Game\x20button.",
    "hornex-pro_300x600",
    ":scope\x20>\x20.petal",
    "crafted\x20nothing\x20from",
    ".loader",
    "cos",
    "fonts",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    ";\x22\x20stroke=\x22",
    "*Hyper:\x20240",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    ".copy-btn",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    ".lb-btn",
    "Halo",
    "els",
    "data",
    "m28",
    "New\x20mob:\x20Mushroom.",
    "makeSponge",
    "rgba(0,0,0,0.1)",
    "Fixed\x20another\x20crafting\x20exploit.",
    "requestAnimationFrame",
    "#d3bd46",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "#b0c0ff",
    "shieldRegenPerSec",
    "5529100Woxbzf",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    ".mob-gallery",
    "copyright\x20striked",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "hypot",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    "{background-color:",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    "isBoomerang",
    "builds",
    "*Peas\x20damage:\x2010\x20→\x2012",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    "Beehive",
    "Increases\x20your\x20vision.",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    ".username-input",
    "show-petal",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    "#ffe200",
    ".lottery\x20.dialog-content",
    "tail",
    "Bounces",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    "button",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    "show_damage",
    "Goofy\x20little\x20wanderer.",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    "└─\x20",
    "hpRegenPerSec",
    "#d43a47",
    "Ghost_3",
    "gblcVXldOG",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "petalBubble",
    "closePath",
    "6608637pBbLTz",
    "W6RcRmo0WR/cQSo1W4PifG",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    "Yoba_1",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "querySelectorAll",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    "absorbDamage",
    "hornex",
    "hasSpiderLeg",
    "portalPoints",
    "Beetle_1",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    "\x5c$1",
    "petalWing",
    "Increases\x20petal\x20pickup\x20range.",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    "\x22></div>\x0a\x09\x09\x09",
    "match",
    "consumeProj",
    "onStart",
    "#d54324",
    "floor",
    "Soaks\x20damage\x20over\x20time.",
    "e\x20bee",
    "bqpdSW",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    "XCN6",
    "Lightsaber",
    "Evil\x20Centipede",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    "#3f1803",
    ".petal-count",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    "*Rock\x20health:\x2060\x20→\x20120",
    "breedTimerAlpha",
    "rgba(0,0,0,0.15)",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "#853636",
    ".changelog-btn",
    "Armor",
    "Sandstorm_2",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "*Ultra:\x20125+",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "substr",
    "numeric",
    "opacity",
    "doLerpEye",
    "onmousemove",
    "moveTo",
    "className",
    "setTargetByEvent",
    "\x0a17th\x20May\x202024\x0aMore\x20game\x20stats\x20are\x20shown\x20now:\x0a*Total\x20Time\x20Played\x0a*Total\x20Games\x20Played\x0a*Total\x20Kills\x0a*Total\x20Chat\x20Sent\x0a*Total\x20Accounts\x0aNumpad\x20keys\x20can\x20also\x20be\x20used\x20to\x20swap\x20petals\x20now.\x0aPress\x20K\x20to\x20toggle\x20keyboard\x20controls.\x0a",
    "http://localhost:6767/",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    "\x20won\x20and\x20got\x20extra",
    "*Peas\x20damage:\x2012\x20→\x2015",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "spawnOnHurt",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "sword",
    "*Hyper:\x20175+",
    "Honey\x20Damage",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "encode",
    "\x20FPS\x20/\x20",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "rainbow-text",
    "Antidote",
    "\x27s\x20profile...",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "petalFaster",
    "Hornet_1",
    "reload",
    "hsla(0,0%,100%,0.3)",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    "\x20radians",
    "Rock",
    "background",
    "KGw#",
    "doRemove",
    "running...",
    "hornex.pro",
    "*Powder\x20damage:\x2015\x20→\x2020",
    "petHealF",
    "*Banana\x20damage:\x201\x20→\x202",
    "Spider_2",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    "1728BEqxsb",
    "repeat",
    ".debug-cb",
    "armor",
    ".claimer",
    "WPJcKmoVc8o/",
    "ANKUAsHKW5LZmq",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    "twirl",
    ".expand-btn",
    ".stats-btn",
    "#393cb3",
    "been\x20",
    ".stats",
    "data-icon",
    "arial",
    ".timer",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "GsP9",
    ".inventory",
    "hideUserCount",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    ".changelog\x20.dialog-content",
    "*Super:\x201%\x20→\x201.5%",
    "uiScale",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "dontPushTeam",
    "No\x20username\x20provided.",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    "Passive\x20Heal",
    "\x20was\x20",
    "#c8a826",
    "Heal",
    ".lottery-rarities",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "Pill",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    ".hud",
    "weight",
    "W77cISkNWONdQa",
    "stickbugBody",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    "A\x20default\x20petal.",
    "url(https://i.ytimg.com/vi/",
    ".grid\x20.title",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    "barEl",
    "Grapes",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "7th\x20August\x202023",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "#ff94c9",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    ".chat-input",
    ".username-link",
    ".inventory-rarities",
    "Yin\x20Yang",
    "Your\x20Profile",
    ".hitbox-cb",
    "28th\x20December\x202023",
    "release",
    "send",
    "#a07f53",
    ".petal-rows",
    "web",
    "despawnTime",
    "ShiftLeft",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "antHoleFire",
    "Yoba_6",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    "It\x20likes\x20to\x20dance.",
    "fixAngle",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    "affectHealDur",
    "hide-zone-mobs",
    "blue",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    "24th\x20January\x202024",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    "fill",
    "map",
    "\x20Blue",
    "petalLightning",
    "Server\x20side\x20performance\x20improvements.",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "Kills",
    "search",
    "queenAnt",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "stroke",
    "workerAntFire",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "Wave\x20",
    "Wave",
    "WR7cQCkf",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "12th\x20July\x202023",
    "gcldSq",
    "#b52d00",
    "oProg",
    "en-US",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    "(auto\x20reloading\x20in\x20",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    "rgb(43,\x20255,\x20163)",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "projD",
    "Missile\x20Poison",
    "result",
    "fake",
    "Saved\x20Build\x20#",
    "webSize",
    "readyState",
    ".find-user-input",
    ".shop-overlay",
    "Ant\x20Hole",
    "Poop\x20colored\x20Ladybug.",
    "*Rock\x20health:\x2050\x20→\x2060",
    "Added\x201\x20more\x20EU\x20lobby.",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    "s\x20can",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "superPlayers",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    "#4f412e",
    "*Gas\x20health:\x20250\x20→\x20200",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "Dragon\x20Nest",
    ".mobs-btn",
    "typeStr",
    "worldW",
    "Extra\x20Range",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    ".common",
    "rectAscend",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    "1841224gIAuLW",
    "no-icon",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    "<style>\x0a\x09\x09",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "tierStr",
    "scale(",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    "rgb(126,\x20239,\x20109)",
    "Created\x20changelog.",
    "#5b4d3c",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "rgba(0,0,0,0.08)",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "keyup",
    "Bone",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    "rgba(0,0,0,0.3)",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    "miter",
    "\x20by",
    "*Reduced\x20Shield\x20regen\x20time.",
    "active",
    "crafted",
    "stepPerSecMotion",
    "Wing",
    "*Heavy\x20health:\x20500\x20→\x20600",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    "Decreases",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "type",
    "Hornet_3",
    "cmk/auqmq8o8WOngW79c",
    "bqpdUNe",
    "rgba(0,\x200,\x200,\x200.2)",
    "*Increased\x20drop\x20rates.",
    "6th\x20November\x202023",
    "petalLight",
    "Account\x20imported!",
    "10px",
    "#8f5f34",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    "10QIdaPR",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2048\x2048\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x20\x20<title>data-source-solid</title>\x0a\x20\x20<g\x20id=\x22Layer_2\x22\x20data-name=\x22Layer\x202\x22>\x0a\x20\x20\x20\x20<g\x20id=\x22invisible_box\x22\x20data-name=\x22invisible\x20box\x22>\x0a\x20\x20\x20\x20\x20\x20<rect\x20width=\x2248\x22\x20height=\x2248\x22\x20fill=\x22none\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20\x20\x20<g\x20id=\x22icons_Q2\x22\x20data-name=\x22icons\x20Q2\x22>\x0a\x20\x20\x20\x20\x20\x20<path\x20d=\x22M46,9c0-6.8-19.8-7-22-7S2,2.2,2,9v7c0,.3,1.1,1.8,5.2,3.4h.3a40.3,40.3,0,0,0,8.6,2A65.6,65.6,0,0,0,24,22a65.6,65.6,0,0,0,7.9-.5,40.3,40.3,0,0,0,8.6-2h.3C44.9,17.8,46,16.3,46,16V9.3h0ZM2,31.3V39c0,6.8,19.8,7,22,7s22-.2,22-7V31.3C41.4,34.1,33.3,36,24,36S6.6,34.1,2,31.3Zm43.7-9.8a22.5,22.5,0,0,1-4.9,2.1A54.8,54.8,0,0,1,24,26,54.8,54.8,0,0,1,7.2,23.6a22.5,22.5,0,0,1-4.9-2.1L2,21.3V26c0,.3,1.2,1.9,5.5,3.5A50.2,50.2,0,0,0,24,32a50.2,50.2,0,0,0,16.5-2.5C44.8,27.9,46,26.3,46,26V21.3Z\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20</g>\x0a</svg>",
    "User\x20not\x20found.",
    "unknown",
    "clip",
    "10th\x20August\x202023",
    "%\x20-\x200.8em*",
    "ignore\x20if\x20u\x20already\x20subbed",
    "*Arrow\x20damage:\x203\x20→\x204",
    "petalWave",
    "local",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "style=\x22color:",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    "#a2eb62",
    "queenAntFire",
    "WP/dQbddHH0",
    "tooltipDown",
    "WP10rSoRnG",
    ".collected-petals",
    "now",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    "#ceea33",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "useTimeTiers",
    "Tiers",
    "Has\x20fungal\x20infection\x20gg",
    "kers\x20",
    "charAt",
    "WRzmW4bPaa",
    "Elongation",
    "Pill\x20affects\x20Arrow\x20now.",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20class=\x22username-link\x22\x20stroke=\x22",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    "spiderYoba",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    "*Unsual:\x2025\x20→\x2010",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    ".craft-rate",
    "text/plain;charset=utf-8;",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    "Some\x20Data",
    ".level",
    "#a58368",
    ".settings-btn",
    "Neowm",
    "Account\x20import/export\x20UI\x20redesigned.",
    "#A8A7A4",
    "lastResizeTime",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    ".keyboard-cb",
    "small\x20full",
    "fixed_name_size",
    "#d0bb55",
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "flower",
    "Buffs:",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "\x22></span>\x20",
    "nLrqsbisiv0SrmoD",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    "hasHearts",
    "update",
    "23rd\x20July\x202023",
    "onmouseleave",
    "invalid\x20uuid",
    "New\x20mob:\x20Statue.",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "isTanky",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "hsl(60,60%,",
    "bruh",
    "*Bone\x20armor:\x205\x20→\x206",
    "i\x20need\x20999\x20billion\x20subs",
    "iLeaveGame",
    "avacado",
    "\x22></span></div>",
    "W6rnWPrGWPfdbxmAWOHa",
    "show_population",
    ".watch-ad",
    "4th\x20September\x202023",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    "Added\x20Shiny\x20mobs:",
    "tile_",
    ";-moz-background-position:\x20",
    ".data-search",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    ".box",
    "Client-side\x20performance\x20improvements.",
    "isSleeping",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    "includes",
    "Rock_3",
    "25th\x20August\x202023",
    ".anti-spam-cb",
    "drawShell",
    "rgba(0,\x200,\x200,\x200.15)",
    "Beetle\x20Egg",
    "Stick\x20does\x20not\x20expand\x20now.",
    "iDepositPetal",
    "OQM)",
    "STOP!",
    "2nd\x20July\x202023",
    "attachPetal",
    "parentNode",
    "imageSmoothingEnabled",
    "746499neXBEm",
    "iWatchAd",
    "warne",
    "#754a8f",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "#f2b971",
    "*Swastika\x20health:\x2020\x20→\x2025",
    "save",
    "makeLadybug",
    "userAgent",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    ".joystick",
    "Web",
    "OFFIC",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "#288842",
    "isSpecialWave",
    "next",
    "#bbbbbb",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "isAggressive",
    "#fbb257",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "value",
    "Temporary\x20Extra\x20Speed",
    "Ugly\x20&\x20stinky.",
    "\x22></span>\x0a\x09\x09\x09</div>",
    "18th\x20July\x202023",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    "*Fire\x20health:\x2080\x20→\x20120",
    "12th\x20August\x202023",
    "height",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "Sprite",
    "wss://us1.hornex.pro",
    "<div\x20class=\x22petal-count\x22></div>",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x20no-hide\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "rgb(237\x2061\x20234)",
    "mushroomPath",
    "strok",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    "jellyfish",
    "\x20petals",
    "our\x20o",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    "21st\x20January\x202024",
    "W7dcP8k2W7ZcLxtcHv0",
    "#f55",
    "transform",
    ".super-buy",
    "Fossil",
    "finalMsg",
    "#f7904b",
    "#7d893e",
    "#323032",
    "onresize",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    ".absorb-rarity-btns",
    "\x20at\x20y",
    "ame",
    "16th\x20July\x202023",
    "hide-chat",
    "left",
    "erCas",
    "neutral",
    "bsorb",
    "Passively\x20regenerates\x20shield.",
    "#fcdd86",
    "petalSalt",
    "PedoX",
    "#b05a3c",
    "></di",
    ".lottery-winner",
    "getAttribute",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "col",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    "WRbjb8oX",
    "spawn",
    "petalLeaf",
    "#999",
    "angryT",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "boostStrength",
    "Dragon_6",
    "extraRangeTiers",
    "updateTime",
    ".server-area",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    "Ant\x20Egg",
    "setUserCount",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    "Lightning",
    "fire\x20ant",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "Hornet_6",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    "Poop\x20Damage",
    "Sandstorm_1",
    "tail_outline",
    "u\x20hav",
    "#962921",
    "isRetard",
    "hornex-pro_970x250",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "antennae",
    "createObjectURL",
    "#503402",
    "WRZdV8kNW5FcHq",
    "Poop\x20Health",
    "\x20Wave\x20",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "curePoisonF",
    "d\x20abs",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    "*Legendary:\x20125\x20→\x20100",
    "Range",
    "26th\x20June\x202023",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    "29th\x20June\x202023",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "successful",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    ".show-scoreboard-cb",
    "hideTimer",
    "petalAntEgg",
    "DMCA-ed",
    "Super",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    "sizeIncrease",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "Beetle_6",
    "string",
    ".inventory-btn",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "isBae",
    "startsWith",
    "mobsEl",
    "petalYobaEgg",
    "angle",
    "localId",
    "\x20play",
    ".player-list",
    "countTiers",
    "Passive\x20Shield",
    "KePiKgamer",
    "petalRockEgg",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    ".collected-rarities",
    "Queen\x20Ant",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "DMCA",
    "cacheRendered",
    "#724c2a",
    ".claim-btn",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "(81*",
    "22nd\x20June\x202023",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "show_scoreboard",
    "binaryType",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    "*Yoba\x20health:\x20500\x20→\x20350",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    "username",
    "petalGas",
    "turtleF",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "Poison\x20Reduction",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    ".lb",
    "craft-disable",
    "cde9W5NdTq",
    ".credits",
    "Hyper\x20Players",
    "shop",
    "*Fire\x20damage:\x209\x20→\x2015",
    "#333",
    "\x20petals\x22></div>",
    "countEl",
    "Bush",
    "]\x22></div>",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    "Slowness\x20Duration",
    "poopPath",
    ".tier-",
    "toggle",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    "13th\x20July\x202023",
    "Skull",
    "Heavy",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    "projPoisonDamage",
    "Nigersaurus",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    "Beetle_5",
    "enable_shake",
    "#cfc295",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "yoba",
    "lineTo",
    "Missile",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    "ffa\x20sandbox",
    "respawnTime",
    "classList",
    "hide-icons",
    "hpRegen75PerSecF",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    "W5bKgSkSW78",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    "translate",
    "rgb(237\x20236\x2061)",
    "<div\x20class=\x22petal-container\x22></div>",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    "#69371d",
    "#79211b",
    "gameStats.json",
    "invalid",
    "setUint16",
    "Increased\x20Ultra\x20key\x20price.",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "22nd\x20January\x202024",
    "#bc0000",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    ")\x20rotate(",
    "AS\x20#1",
    "6th\x20August\x202023",
    "hostn",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    "cloneNode",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    "download",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    "onmouseup",
    "craftResult",
    ".minimap-dot",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    "#b0473b",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "drawArmAndGem",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "fixedSize",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "#cdbb48",
    "<div\x20class=\x22chat-item\x22></div>",
    "Beetle_4",
    "Spider_4",
    "petalDragonEgg",
    "shiftKey",
    "25th\x20June\x202023",
    "hsl(60,60%,30%)",
    "password",
    "3rd\x20July\x202023",
    "iJoin",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    "bezierCurveTo",
    "users",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "moveCounter",
    "#bb3bc2",
    "ENTERING!!",
    "d8k3BqDKF8o0WPu",
    "Copied!",
    "locat",
    "Mushroom",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    "aip_complete",
    "tals.",
    ".reload-timer",
    ".debug-info",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    "startEl",
    ".yes-btn",
    "WQxdVSkKW5VcJq",
    "isPetal",
    ".absorb-btn",
    "1st\x20February\x202024",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "rgba(0,0,0,0.2",
    "Spider_6",
    "*Banana\x20health:\x20170\x20→\x20400",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "#7777ff",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    "pickedEl",
    "26th\x20August\x202023",
    "clientHeight",
    "B4@J",
    "regenF",
    "Heavier\x20than\x20your\x20mom.",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "round",
    "#735d5f",
    "totalGamesPlayed",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "23rd\x20August\x202023",
    "#4343a4",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    ".time-alive",
    "isCentiBody",
    "https://ipapi.co/json/",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "Hyper",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    "#d6b936",
    "onwheel",
    "consumeProjDamage",
    "19th\x20January\x202024",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    "isTrusted",
    "zmkhtdVdSq",
    "Passively\x20regenerates\x20your\x20health.",
    "filter",
    "Common",
    "Connected!",
    "\x20petal",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    "Sword",
    ".absorb-petals",
    "gem",
    "wss://us2.hornex.pro",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "Centipede",
    "centipedeHead",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "forEach",
    "\x0a5th\x20May\x202024\x0aHeavy\x20now\x20slows\x20down\x20your\x20petal\x20orbit\x20speed.\x20More\x20slowness\x20for\x20higher\x20rarity.\x20\x0aCotton\x20doesn\x27t\x20expand\x20like\x20Rose\x20when\x20you\x20are\x20angry.\x0aPowder\x20now\x20adds\x20turbulence\x20to\x20your\x20petals\x20when\x20you\x20are\x20angry.\x0aFixed\x20more\x20player\x20dupe\x20bugs.\x0a",
    "isPet",
    ";\x20-o-background-position:",
    "Nerfs:",
    "Fire\x20Duration",
    "Fonts\x20loaded!",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "*Gas\x20health:\x20140\x20→\x20250",
    ".low-quality-cb",
    "hasGem",
    "#8ac355",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    "BrnPE",
    "Zert",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "beehive",
    "url",
    "Breed\x20Range",
    "KeyG",
    "isDead",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    "maxTimeAlive",
    "\x20-\x20",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "Kills\x20Needed",
    "Dragon_5",
    "mobPetaler",
    "rgb(31,\x20219,\x20222)",
    "petalTaco",
    "*Hyper:\x2015-25",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    ".absorb-btn\x20.tooltip\x20span",
    "Sandstorm",
    "#cfbb50",
    "18th\x20September\x202023",
    "petCount",
    "#aaaaaa",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "New\x20mob:\x20Fossil.",
    "goofy\x20ahh\x20insect\x20robbery",
    ".discord-avatar",
    "nigersaurus",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "#454545",
    "#ffe763",
    "bee",
    "deg)",
    "qCkBW5pcR8kD",
    "LavaWater",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "All\x20Petals",
    "[G]\x20Show\x20Grid:\x20",
    "drops",
    "ur\x20pe",
    "Dahlia",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "#d9511f",
    "https://www.youtube.com/@IAmLavaWater",
    "font",
    "\x20domain=.hornex.pro",
    "MOVE\x20AWAY!!",
    "petalPowder",
    "padStart",
    "destroyed",
    "displayData",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    "KCsdZ",
    "0\x200",
    "#775d3e",
    ".pro",
    "projHealthF",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "petalBasic",
    "reverse",
    "26th\x20July\x202023",
    "1st\x20August\x202023",
    "petalRice",
    "adplayer",
    "Rock_6",
    "breedPower",
    "Press\x20G\x20to\x20toggle\x20grid.",
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    "mousedown",
    "spin",
    "function",
    "IAL\x20c",
    "*Bone\x20armor:\x207\x20→\x208",
    ".lottery-timer",
    "petalSunflower",
    "dandelion",
    "Crab\x20redesign.",
    "querySelector",
    ".insta-btn",
    "Poo",
    "motionKind",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "continent_code",
    "#38c75f",
    "Wave\x20Starting...",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "*Rice\x20damage:\x205\x20→\x204",
    "Mob\x20Agro\x20Range",
    "#fbdf26",
    "W43cOSoOW4lcKG",
    "Connecting\x20to\x20",
    "iSwapPetal",
    "horne",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    "pickupRange",
    "dmca\x20it\x20m28!",
    "Level\x20",
    "New\x20settings:\x20Low\x20quality.",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "hpRegen",
    "#4e3f40",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    "&quot;",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    "14th\x20August\x202023",
    "json",
    ".progress",
    "marginBottom",
    "soldierAntFire",
    "Pet\x20Size\x20Increase",
    "#bb771e",
    "Favourite\x20object\x20of\x20a\x20woman.",
    "FSoixsnA",
    "#222222",
    "Wig",
    "dragon",
    "#8ac255",
    "addGroupNumbers",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    "#333333",
    "expand",
    "iAbsorb",
    "31st\x20July\x202023",
    "title",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "\x20stroke=\x22",
    "#8a6b1f",
    "#c1ab00",
    ".level-progress",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    "Air",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    "reduce",
    "12OVuKwi",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "isSupporter",
    "hsla(0,0%,100%,0.25)",
    "&#Uz",
    "WPfQmmoXFW",
    "KeyD",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    "Spider_3",
    "Fire\x20Ant",
    "<div\x20stroke=\x22",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "[F]\x20Show\x20Hitbox:\x20",
    "\x0a13th\x20May\x202024\x0aFixed\x20a\x20bug\x20that\x20didn\x27t\x20let\x20flowers\x20enter\x20portals.\x0aBalances:\x0a*Sword\x20damage:\x2017\x20→\x2021\x0a*Yin\x20yang\x20damage:\x2010\x20→\x2020\x0a*Yin\x20yang\x20reload:\x202s\x20→\x201.5s\x0a",
    "murdered",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "changeLobby",
    "5th\x20July\x202023",
    ".rewards-btn",
    "\x22></div>\x0a\x09\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "*Cotton\x20health:\x2010\x20→\x2012",
    "W5T8c2BdUs/cJHBcR8o4uG",
    "spinSpeed",
    "New\x20mob:\x20Sponge",
    "WRS8bSkQW4RcSLDU",
    "Added\x20Waveroom:",
    "More\x20wave\x20changes:",
    "Even\x20more\x20wave\x20changes:",
    "toLowerCase",
    "error",
    "Need\x20to\x20be\x20Lvl\x20",
    "offsetWidth",
    ".featured",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    "targetEl",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "stats",
    "random",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    "14dafFDX",
    "elongation",
    ".shop-btn",
    "bg-rainbow",
    "they\x20copied\x20florr\x20code\x20omg!!",
    "rad)",
    "Removed\x20disclaimer\x20from\x20menu.",
    "transition",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "#97782b",
    "drawTurtleShell",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "KeyU",
    "usernameTaken",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "petalLightsaber",
    "#ff7892",
    "27th\x20July\x202023",
    "5th\x20September\x202023",
    "descColor",
    ".player-list\x20.dialog-content",
    "Numpad",
    "angry",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "origin",
    "Ghost_4",
    "#efc99b",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "\x20accounts",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    "petalPacman",
    ".hide-chat-cb",
    "petalHoney",
    ".continue-btn",
    "*Peas\x20damage:\x208\x20→\x2010",
    "Can\x27t\x20perform\x20that\x20action.",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    "rgb(166\x2056\x20237)",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "evenodd",
    "Yoba_3",
    "3L$0",
    "KeyS",
    "isBooster",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    "waveShowTimer",
    "toString",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "Red\x20ball.",
    "petalArrow",
    "#cb37bf",
    "Ants\x20redesign.",
    "version",
    "backgroundImage",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "#75dd34",
    "/profile",
    "├─\x20",
    "\x20&\x20",
    "wave",
    "Sandstorm_6",
    "scorp",
    "Ant\x20Fire",
    "\x20all\x20",
    "restore",
    "\x20XP",
    "%nick%",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "*Rose\x20heal:\x2013\x20→\x2011",
    "(?:^|;\x5cs*)",
    "Jellyfish",
    "hide",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    "sendBadMsg",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "Peas",
    "static",
    ".joystick-knob",
    "rgba(0,0,0,0.35)",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "scorpion",
    "push",
    "position",
    "#764b90",
    "fromCharCode",
    "Failed\x20to\x20find\x20region.",
    ".absorb",
    "nAngle",
    ".absorb\x20.dialog-header\x20span",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    "isPlayer",
    "pacman",
    "nig",
    "adplayer-not-found",
    "4oL8",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    "Coffee",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "135249DkEsVO",
    "\x0a\x09</div>",
    "e=\x22Yo",
    "wss://eu1.hornex.pro",
    "makeMissile",
    ".game-stats",
    "startPreRoll",
    "n\x20war",
    "Fire\x20Damage",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    "open",
    "strokeStyle",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "2nd\x20October\x202023",
    "Beetle_3",
    "#ffd941",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "moveFactor",
    "#f22",
    "Flower\x20#",
    "Luxurious\x20mansion\x20of\x20ants.",
    ".angry-btn",
    "uiX",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    "waveStarting",
    "#af6656",
    "localStorage\x20denied.",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    "Sandstorm_4",
    "#7d5098",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    ".zone-mobs",
    "1963060OLPtia",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    "Added\x20level\x20up\x20reward\x20table.",
    "fireTime",
    "nHealth",
    "loginFailed",
    "show_hitbox",
    "Shield\x20Reuse\x20Cooldown",
    "accou",
    "*Rock\x20health:\x2045\x20→\x2050",
    "Hornet_2",
    "onEnd",
    "https://www.youtube.com/@NeowmHornex",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "petalSnail",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "settings",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    "𐐿𐐘𐐫𐑀𐐃",
    "12th\x20November\x202023",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    ".dc-group",
    "then",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    "babyAnt",
    "Third\x20Eye",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    "unsuccessful",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    "Soldier\x20Ant_2",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "#a44343",
    "28th\x20August\x202023",
    "<div\x20class=\x22dialog\x20tier-",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    "\x22></span>\x0a\x09</div>",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    "lightningDmg",
    "New\x20mob:\x20Dragon\x20Nest.",
    "wss://as1.hornex.pro",
    "*Rock\x20health:\x20120\x20→\x20150",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    "#111",
    "16th\x20September\x202023",
    "arc",
    "Congratulations!",
    "altKey",
    "respawnTimeTiers",
    "Worker\x20Ant",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "Iris",
    "10th\x20July\x202023",
    "13th\x20August\x202023",
    "saved_builds",
    ".no-btn",
    ".show-bg-grid-cb",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    "*Snail\x20damage:\x2020\x20→\x2025",
    "petalDice",
    "#347918",
    ".petals",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    "4\x20yummy\x20poisonous\x20balls.",
    "\x0a4th\x20May\x202024\x0aFixed\x20a\x20player\x20dupe\x20bug.\x20\x0aBalances:\x0a*Taco\x20healing:\x209\x20→\x2010\x0a*Sunflower\x20shield:\x201\x20→\x202.5\x0a*Shell\x20shield:\x208\x20→\x2012\x0a*Buffed\x20Yoba\x20Egg\x20by\x2050%\x0a",
    "cDHZ",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    "min",
    "(total\x20",
    "lightningBounces",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    "fontFamily",
    "fireDamage",
    "<div>",
    "W5OTW6uDWPScW5eZ",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "focus",
    "Nigerian\x20Ladybug.",
    "sin",
    "Removed\x20EU\x20#3.",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    "deg)\x20scale(",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "petalerDrop",
    "Added\x20Discord\x20login.",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    "<div\x20class=\x22chat-text\x22>",
    "<div\x20style=\x22width:100%;\x20text-align:center;\x22></div>",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    "WR7dPdZdQXS",
    "\x20downloaded!",
    ".rewards",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "bush",
    "*Removed\x20Ultra\x20wave.",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "petalShell",
    "petals",
    "Last\x20Updated:\x20",
    "http://localhost:8001/discord",
    "centipedeBody",
    "Sandbox",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    "INPUT",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "canSkipRen",
    "7th\x20July\x202023",
    "score",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "iSwapPetalRow",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "KeyX",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    "7th\x20October\x202023",
    "host",
    "\x0a\x0a\x09\x09\x09",
    "zert.pro",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    "0@x9",
    "#39b54a",
    "stopWhileMoving",
    ".main",
    "fontSize",
    "cEca",
    "reason:\x20",
    "canShowDrops",
    ".\x22></span></div>",
    "Game",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    "Gives\x20you\x20a\x20shield.",
    "17th\x20June\x202023",
    "Soldier\x20Ant",
    "[K]\x20Keyboard\x20Controls:\x20",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "discord\x20err:",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "Pincer",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    "11th\x20August\x202023",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "anti_spam",
    ".ads",
    "Increased\x20map\x20size\x20by\x2030%.",
    "24th\x20July\x202023",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "petRoamFactor",
    "*Reduced\x20drops\x20by\x2050%.",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "passive",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "petalNitro",
    "Reduced\x20mobile\x20UI\x20scale.",
    "#2da14d",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "rgb(81\x20121\x20251)",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    "lightningBouncesTiers",
    "strokeRect",
    "Waveroom",
    "3220DFvaar",
    "encod",
    "doShow",
    "body",
    ".spawn-zones",
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "Added\x20maze\x20in\x20Waveroom:",
    ".\x22>\x20<span\x20class=\x22username-link\x22\x20stroke=\x22",
    "petDamageFactor",
    "us_ffa1",
    "roundRect",
    "oAngle",
    "Cement",
    "Fussy\x20Sucker",
    "\x20rad/s",
    "#fcfe04",
    "http",
    "21st\x20July\x202023",
    ".grid",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    "\x20from\x20",
    "Antennae",
    "petalCoffee",
    "petalSponge",
    "makeAntenna",
    "KeyV",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "privacy.txt",
    "<div\x20class=\x22btn\x22>\x0a\x09\x09\x09\x09<span\x20stroke=\x22",
    "New\x20mob:\x20Furry.",
    "as_ffa2",
    "Checking\x20username\x20availability...",
    "%!Ew",
    "#be342a",
    "#cf7030",
    "titleColor",
    "petals!",
    "nice\x20stolen\x20florr\x20assets",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    "drawChats",
    "User\x20not\x20found!",
    "test",
    "heart",
    "accountData",
    ".shop-info",
    "code",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    "Yourself",
    "keydown",
    ".right-align-petals-cb",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "3336680ZmjFAG",
    "Lobby\x20Closing...",
    "isIcon",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    "arrested\x20for\x20plagerism",
    "des",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    "mobile",
    "\x20Pym\x20Particle.",
    "\x20clie",
    "dragonNest",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "projType",
    "strokeText",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    "entRot",
    ".mob-gallery\x20.dialog-content",
    "Buffed\x20Gem.",
    "stringify",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    "petalSwastika",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    ".petal",
    "Invalid\x20account!",
    "getBigUint64",
    "NSlTg",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "9iYdxUh",
    "marginTop",
    "WOziW7b9bq",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    ".logout-btn",
    "It\x20has\x20sussy\x20movement.",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    "[2tB",
    "shieldReload",
    "hsla(0,0%,100%,0.15)",
    "Claiming\x20secret\x20skin...",
    "oSize",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "healthIncreaseF",
    ".inventory-petals",
    "#cccccc",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "wss://hornex-",
    "toDataURL",
    "desktop",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    "#8b533f",
    "statuePlayer",
    "c)H[",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    "#882200",
    "small",
    "\x0aServer:\x20",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "<div\x20class=\x22spinner\x22></div>",
    "joinedGame",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "Server-side\x20optimizations.",
    "metaData",
    "\x20!important;}",
    "bolder\x2012px\x20",
    "red",
    "inclu",
    "WRRdT8kPWO7cMG",
    "New\x20mob:\x20Dice.",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "redHealth",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    "Ultra",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    "petalShrinker",
    "petalSuspill",
    ".chat",
    "Ghost_1",
    "Dragon_4",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "decode",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "Removed\x20Centipedes\x20from\x20waves.",
    "Sussy\x20Discord\x20uwu",
    "state",
    "shieldHpLosePerSec",
    "23rd\x20June\x202023",
    "Mythic",
    ".inventory\x20.inventory-petals",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "<div\x20class=\x22btn\x20tier-",
    "iCraft",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "petalsLeft",
    "Username\x20too\x20big!",
    "drawImage",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    "loggedIn",
    "Yoba_4",
    "petalIris",
    "shift",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "total",
    "complete",
    "onkeyup",
    ".builds\x20.dialog-content",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "Disconnected.",
    "beaten\x20to\x20death",
    "mobDespawned",
    "waveNumber",
    "totalChatSent",
    "dev",
    "Retardation\x20Duration",
    "*Ultra:\x20120",
    "level",
    "honeyTile",
    "*Cotton\x20health:\x207\x20→\x208",
    "30th\x20June\x202023",
    "***",
    "Unusual",
    "hoq5",
    "petHealthFactor",
    ".id-group",
    "#6265eb",
    "ui_scale",
    "globalCompositeOperation",
    "Getting\x20",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "hyperPlayers",
    ".play-btn",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    "show",
    "Soldier\x20Ant_5",
    "color",
    "#924614",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    "clientY",
    "ready",
    "fireDamageF",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    "Flower\x20Health",
    "Nerfed\x20Ant\x20Holes:",
    "Spider_5",
    "terms.txt",
    "cuYF",
    "childIndex",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "hide-all",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "deg",
    "*Super:\x205-15",
    "gambleList",
    "userCount",
    "replace",
    "/dlMob",
    "\x20stea",
    "uiAngle",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "petalFire",
    "sizeIncreaseF",
    ".helper-cb",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "Username\x20too\x20short!",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "Importing\x20data\x20file:\x20",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "your\x20",
    "KeyM",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "iScore",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "New\x20mob:\x20Snail.",
    "Avacado",
    "#8f5db0",
    "Could\x20not\x20claim\x20secret\x20skin.",
    "Petal\x20Slots",
    "desc",
    "tCkxW5FcNmkQ",
    "*2%\x20craft\x20success\x20rate.",
    "extraSpeedTemp",
    "Regenerates\x20health\x20when\x20consumed.",
    "Pet\x20Heal",
    "petalRose",
    "isInventoryPetal",
    "/s\x20if\x20H<50%",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "lastElementChild",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    "abeQW7FdIW",
    "Preroll\x20state:\x20",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    "#cfcfcf",
    "petalDmca",
    "New\x20mob:\x20Turtle",
    "split",
    ".xp",
    "ll\x20yo",
    ".total-accounts",
    "append",
    "Cotton",
    "petalStickbug",
    "advanced\x20to\x20number\x20",
    "display",
    "eu_ffa1",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    "Increased\x20shiny\x20mob\x20size.",
    "choked",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "iBreedTimer",
    "setValue",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "\x22></span>\x20<span\x20stroke=\x22•\x20",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "translate(calc(",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    "released",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    ".find-user-btn",
    "splice",
    "#634002",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    "KICKED!",
    "petalCement",
    "isProj",
    "class=\x22chat-cap\x22",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "centipedeHeadDesert",
    "baseSize",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
  ];
  a = function () {
    return Ck;
  };
  return a();
}
