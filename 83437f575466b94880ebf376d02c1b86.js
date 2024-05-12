
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
        this.speak(`Current coords: ${Math.floor(x / 500)}, ${Math.floor(y / 500)}`)
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
  const ue = b,
    e = c();
  while (!![]) {
    try {
      const f =
        (parseInt(ue(0x62a)) / 0x1) * (-parseInt(ue(0x84a)) / 0x2) +
        parseInt(ue(0x957)) / 0x3 +
        parseInt(ue(0x8f6)) / 0x4 +
        (parseInt(ue(0x2a4)) / 0x5) * (parseInt(ue(0x861)) / 0x6) +
        (-parseInt(ue(0x9ad)) / 0x7) * (parseInt(ue(0x3fb)) / 0x8) +
        (parseInt(ue(0xa53)) / 0x9) * (parseInt(ue(0x337)) / 0xa) +
        -parseInt(ue(0x2ae)) / 0xb;
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0xe1909),
  (() => {
    const uf = b;
    var cG = 0x2710,
      cH = 0x1e - 0x1,
      cI = { ...cV(uf(0x689)), ...cV(uf(0xb13)) },
      cJ = 0x93b,
      cK = 0x10,
      cL = 0x3c,
      cM = 0x10,
      cN = 0x3,
      cO = /^[a-zA-Z0-9_]+$/,
      cP = /[^a-zA-Z0-9_]/g,
      cQ = cV(uf(0x634)),
      cR = cV(uf(0x546)),
      cS = cV(uf(0xaa1)),
      cT = cV(uf(0x6d2)),
      cU = cV(uf(0x43c));
    function cV(qQ) {
      const ug = uf,
        qR = qQ[ug(0x1cf)]("\x20"),
        qS = {};
      for (let qT = 0x0; qT < qR[ug(0xbc8)]; qT++) {
        qS[qR[qT]] = qT;
      }
      return qS;
    }
    var cW = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cX = {};
    (cX[uf(0x4b0)] = 0x0), (cX[uf(0x48b)] = 0x1), (cX[uf(0x28d)] = 0x2);
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
    function d2(qQ) {
      const uh = uf;
      return 0x14 * Math[uh(0xa9a)](qQ * 1.05 ** (qQ - 0x1));
    }
    var d3 = [
      0x1, 0x5, 0x32, 0x1f4, 0x2710, 0x7a120, 0x2faf080, 0x12a05f200,
      0xe8d4a51000,
    ];
    function d4(qQ) {
      let qR = 0x0,
        qS = 0x0;
      while (!![]) {
        const qT = d2(qR + 0x1);
        if (qQ < qS + qT) break;
        (qS += qT), qR++;
      }
      return [qR, qS];
    }
    function d5(qQ) {
      const ui = uf;
      let qR = 0x5,
        qS = 0x5;
      while (qQ >= qS) {
        qR++, (qS += Math[ui(0xc0c)](0x1e, qS));
      }
      return qR;
    }
    function d6(qQ) {
      const uj = uf;
      return Math[uj(0xbee)](0xf3, Math[uj(0xc0c)](qQ, 0xc7) / 0xc8);
    }
    function d7() {
      return d8(0x100);
    }
    function d8(qQ) {
      const qR = Array(qQ);
      while (qQ--) qR[qQ] = qQ;
      return qR;
    }
    var d9 = cV(uf(0x575)),
      da = Object[uf(0x8d3)](d9),
      db = da[uf(0xbc8)] - 0x1,
      dc = db;
    function dd(qQ) {
      const uk = uf,
        qR = [];
      for (let qS = 0x1; qS <= dc; qS++) {
        qR[uk(0x6aa)](qQ(qS));
      }
      return qR;
    }
    const de = {};
    (de[uf(0x56c)] = 0x0),
      (de[uf(0x61f)] = 0x1),
      (de[uf(0x3ee)] = 0x2),
      (de[uf(0xbdf)] = 0x3),
      (de[uf(0x838)] = 0x4),
      (de[uf(0x5c7)] = 0x5),
      (de[uf(0xb3a)] = 0x6),
      (de[uf(0x1fb)] = 0x7),
      (de[uf(0xc2a)] = 0x8);
    var df = de;
    function dg(qQ, qR) {
      const ul = uf;
      return Math[ul(0xbee)](0x3, qQ) * qR;
    }
    const dh = {};
    (dh[uf(0x511)] = cS[uf(0xc41)]),
      (dh[uf(0x902)] = uf(0x4f1)),
      (dh[uf(0x58f)] = 0xa),
      (dh[uf(0xcce)] = 0x0),
      (dh[uf(0x34f)] = 0x1),
      (dh[uf(0x11f)] = 0x1),
      (dh[uf(0x65e)] = 0x3e8),
      (dh[uf(0xa27)] = 0x0),
      (dh[uf(0x257)] = ![]),
      (dh[uf(0xaa4)] = 0x1),
      (dh[uf(0xb40)] = ![]),
      (dh[uf(0xb58)] = 0x0),
      (dh[uf(0x88e)] = 0x0),
      (dh[uf(0xa30)] = ![]),
      (dh[uf(0x801)] = 0x0),
      (dh[uf(0x811)] = 0x0),
      (dh[uf(0x174)] = 0x0),
      (dh[uf(0xd27)] = 0x0),
      (dh[uf(0x1b7)] = 0x0),
      (dh[uf(0x370)] = 0x0),
      (dh[uf(0xcca)] = 0x1),
      (dh[uf(0x232)] = 0xc),
      (dh[uf(0x4a5)] = 0x0),
      (dh[uf(0x789)] = ![]),
      (dh[uf(0x81d)] = void 0x0),
      (dh[uf(0x16b)] = ![]),
      (dh[uf(0xcd5)] = 0x0),
      (dh[uf(0x196)] = ![]),
      (dh[uf(0x125)] = 0x0),
      (dh[uf(0x32c)] = 0x0),
      (dh[uf(0x831)] = ![]),
      (dh[uf(0x1f3)] = 0x0),
      (dh[uf(0xdac)] = 0x0),
      (dh[uf(0xb75)] = 0x0),
      (dh[uf(0x17f)] = ![]),
      (dh[uf(0xa67)] = 0x0),
      (dh[uf(0x5a5)] = ![]),
      (dh[uf(0x94a)] = ![]),
      (dh[uf(0x78c)] = 0x0),
      (dh[uf(0x339)] = 0x0),
      (dh[uf(0x16a)] = 0x0),
      (dh[uf(0xc21)] = ![]),
      (dh[uf(0x7b1)] = 0x1),
      (dh[uf(0xda5)] = 0x0),
      (dh[uf(0x1ed)] = 0x0),
      (dh[uf(0x29e)] = 0x0),
      (dh[uf(0xed)] = 0x0),
      (dh[uf(0xad5)] = 0x0),
      (dh[uf(0x2b5)] = 0x0),
      (dh[uf(0x673)] = 0x0),
      (dh[uf(0xaf0)] = 0x0),
      (dh[uf(0x982)] = 0x0),
      (dh[uf(0x324)] = 0x0),
      (dh[uf(0x8c7)] = 0x0),
      (dh[uf(0xbdc)] = 0x0),
      (dh[uf(0x425)] = 0x0),
      (dh[uf(0x28b)] = 0x0),
      (dh[uf(0xd64)] = ![]),
      (dh[uf(0x50f)] = 0x0),
      (dh[uf(0x1d8)] = 0x0),
      (dh[uf(0x8e4)] = 0x0);
    var di = dh;
    const dj = {};
    (dj[uf(0x9ed)] = uf(0x348)),
      (dj[uf(0x902)] = uf(0x483)),
      (dj[uf(0x511)] = cS[uf(0xc41)]),
      (dj[uf(0x58f)] = 0x9),
      (dj[uf(0x34f)] = 0xa),
      (dj[uf(0x11f)] = 0xa),
      (dj[uf(0x65e)] = 0x9c4);
    const dk = {};
    (dk[uf(0x9ed)] = uf(0xc5f)),
      (dk[uf(0x902)] = uf(0x4a4)),
      (dk[uf(0x511)] = cS[uf(0x50b)]),
      (dk[uf(0x58f)] = 0xd / 1.1),
      (dk[uf(0x34f)] = 0x2),
      (dk[uf(0x11f)] = 0x37),
      (dk[uf(0x65e)] = 0x9c4),
      (dk[uf(0xa27)] = 0x1f4),
      (dk[uf(0xb40)] = !![]),
      (dk[uf(0x4ec)] = 0x28),
      (dk[uf(0x88e)] = Math["PI"] / 0x4);
    const dl = {};
    (dl[uf(0x9ed)] = uf(0x3d0)),
      (dl[uf(0x902)] = uf(0x3c8)),
      (dl[uf(0x511)] = cS[uf(0x135)]),
      (dl[uf(0x58f)] = 0x8),
      (dl[uf(0x34f)] = 0x5),
      (dl[uf(0x11f)] = 0x5),
      (dl[uf(0x65e)] = 0xdac),
      (dl[uf(0xa27)] = 0x3e8),
      (dl[uf(0xb58)] = 0xb),
      (dl[uf(0x17f)] = !![]);
    const dm = {};
    (dm[uf(0x9ed)] = uf(0x2da)),
      (dm[uf(0x902)] = uf(0xc3d)),
      (dm[uf(0x511)] = cS[uf(0xaec)]),
      (dm[uf(0x58f)] = 0x6),
      (dm[uf(0x34f)] = 0x5),
      (dm[uf(0x11f)] = 0x5),
      (dm[uf(0x65e)] = 0xfa0),
      (dm[uf(0x257)] = !![]),
      (dm[uf(0xaa4)] = 0x32);
    const dn = {};
    (dn[uf(0x9ed)] = uf(0x420)),
      (dn[uf(0x902)] = uf(0xb4d)),
      (dn[uf(0x511)] = cS[uf(0x7f3)]),
      (dn[uf(0x58f)] = 0xb),
      (dn[uf(0x34f)] = 0xc8),
      (dn[uf(0x11f)] = 0x1e),
      (dn[uf(0x65e)] = 0x1388);
    const dp = {};
    (dp[uf(0x9ed)] = uf(0x7f0)),
      (dp[uf(0x902)] = uf(0xb24)),
      (dp[uf(0x511)] = cS[uf(0x268)]),
      (dp[uf(0x58f)] = 0x8),
      (dp[uf(0x34f)] = 0x2),
      (dp[uf(0x11f)] = 0xa0),
      (dp[uf(0x65e)] = 0x2710),
      (dp[uf(0x232)] = 0xb),
      (dp[uf(0x4a5)] = Math["PI"]),
      (dp[uf(0x916)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dq = {};
    (dq[uf(0x9ed)] = uf(0x794)),
      (dq[uf(0x902)] = uf(0xaf1)),
      (dq[uf(0x81d)] = df[uf(0x56c)]),
      (dq[uf(0x370)] = 0x1e),
      (dq[uf(0x5f2)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dr = {};
    (dr[uf(0x9ed)] = uf(0xa2a)),
      (dr[uf(0x902)] = uf(0x83b)),
      (dr[uf(0x81d)] = df[uf(0x61f)]);
    const ds = {};
    (ds[uf(0x9ed)] = uf(0xa92)),
      (ds[uf(0x902)] = uf(0x81b)),
      (ds[uf(0x511)] = cS[uf(0x645)]),
      (ds[uf(0x58f)] = 0xb),
      (ds[uf(0x65e)] = 0x9c4),
      (ds[uf(0x34f)] = 0x14),
      (ds[uf(0x11f)] = 0x8),
      (ds[uf(0xa30)] = !![]),
      (ds[uf(0x801)] = 0x2),
      (ds[uf(0x9ac)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (ds[uf(0x811)] = 0x14);
    const du = {};
    (du[uf(0x9ed)] = uf(0xc3f)),
      (du[uf(0x902)] = uf(0x2b0)),
      (du[uf(0x511)] = cS[uf(0x3e1)]),
      (du[uf(0x58f)] = 0xb),
      (du[uf(0x34f)] = 0x14),
      (du[uf(0x11f)] = 0x14),
      (du[uf(0x65e)] = 0x5dc),
      (du[uf(0xd27)] = 0x64),
      (du[uf(0x330)] = 0x1);
    const dv = {};
    (dv[uf(0x9ed)] = uf(0x931)),
      (dv[uf(0x902)] = uf(0xa95)),
      (dv[uf(0x511)] = cS[uf(0x874)]),
      (dv[uf(0x58f)] = 0x7),
      (dv[uf(0x34f)] = 0x5),
      (dv[uf(0x11f)] = 0xa),
      (dv[uf(0x65e)] = 0x258),
      (dv[uf(0xcca)] = 0x1),
      (dv[uf(0x789)] = !![]),
      (dv[uf(0x916)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dw = {};
    (dw[uf(0x9ed)] = uf(0xd02)),
      (dw[uf(0x902)] = uf(0xb72)),
      (dw[uf(0x511)] = cS[uf(0x659)]),
      (dw[uf(0x58f)] = 0xb),
      (dw[uf(0x34f)] = 0xf),
      (dw[uf(0x11f)] = 0x1),
      (dw[uf(0x65e)] = 0x3e8),
      (dw[uf(0x16b)] = !![]),
      (dw[uf(0x17f)] = !![]);
    const dx = {};
    (dx[uf(0x9ed)] = uf(0x3c1)),
      (dx[uf(0x902)] = uf(0xb42)),
      (dx[uf(0x511)] = cS[uf(0xc15)]),
      (dx[uf(0x58f)] = 0xb),
      (dx[uf(0x34f)] = 0xf),
      (dx[uf(0x11f)] = 0x5),
      (dx[uf(0x65e)] = 0x5dc),
      (dx[uf(0xcd5)] = 0x32),
      (dx[uf(0x117)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dy = {};
    (dy[uf(0x9ed)] = uf(0x1ea)),
      (dy[uf(0x902)] = uf(0x5bb)),
      (dy[uf(0x511)] = cS[uf(0x85d)]),
      (dy[uf(0x58f)] = 0x7),
      (dy[uf(0x34f)] = 0x19),
      (dy[uf(0x11f)] = 0x19),
      (dy[uf(0xcca)] = 0x4),
      (dy[uf(0x65e)] = 0x3e8),
      (dy[uf(0xa27)] = 0x1f4),
      (dy[uf(0x232)] = 0x9),
      (dy[uf(0x88e)] = Math["PI"] / 0x8),
      (dy[uf(0xb40)] = !![]),
      (dy[uf(0x4ec)] = 0x28);
    const dz = {};
    (dz[uf(0x9ed)] = uf(0x7cc)),
      (dz[uf(0x902)] = uf(0x872)),
      (dz[uf(0x511)] = cS[uf(0x956)]),
      (dz[uf(0x58f)] = 0x10),
      (dz[uf(0x34f)] = 0x0),
      (dz[uf(0x238)] = 0x1),
      (dz[uf(0x11f)] = 0x0),
      (dz[uf(0x65e)] = 0x157c),
      (dz[uf(0xa27)] = 0x1f4),
      (dz[uf(0x54e)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dz[uf(0x42e)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dz[uf(0x125)] = 0x3c),
      (dz[uf(0x196)] = !![]),
      (dz[uf(0x17f)] = !![]);
    const dA = {};
    (dA[uf(0x9ed)] = uf(0x578)),
      (dA[uf(0x902)] = uf(0x206)),
      (dA[uf(0x511)] = cS[uf(0x621)]),
      (dA[uf(0x65e)] = 0x7d0),
      (dA[uf(0x831)] = !![]),
      (dA[uf(0x34f)] = 0xa),
      (dA[uf(0x11f)] = 0xa),
      (dA[uf(0x58f)] = 0xd);
    const dB = {};
    (dB[uf(0x9ed)] = uf(0x9a2)),
      (dB[uf(0x902)] = uf(0xa42)),
      (dB[uf(0x511)] = cS[uf(0x65f)]),
      (dB[uf(0x65e)] = 0xdac),
      (dB[uf(0xa27)] = 0x1f4),
      (dB[uf(0x34f)] = 0x5),
      (dB[uf(0x11f)] = 0x5),
      (dB[uf(0x58f)] = 0xa),
      (dB[uf(0x1f3)] = 0x46),
      (dB[uf(0x846)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
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
        name: uf(0xc8a),
        desc: uf(0xe2),
        ability: df[uf(0x3ee)],
        orbitRange: 0x32,
        orbitRangeTiers: dd((qQ) => 0x32 + qQ * 0x46),
      },
      {
        name: uf(0x1dd),
        desc: uf(0xcbe),
        ability: df[uf(0xbdf)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dA,
      dB,
      {
        name: uf(0x5ce),
        desc: uf(0x7c1),
        type: cS[uf(0x2c5)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][uf(0x2f3)](
          (qQ) => qQ * 0.8
        ),
      },
      {
        name: uf(0x3aa),
        desc: uf(0x19c),
        type: cS[uf(0xaec)],
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
        name: uf(0x94e),
        desc: uf(0x2db),
        type: cS[uf(0xa62)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
        orbitSpeedFactor: 0.95,
        orbitSpeedFactorTiers: [0.94, 0.93, 0.92, 0.91, 0.9, 0.8, 0.7, 0.1],
      },
      {
        name: uf(0x63d),
        desc: uf(0x6ac),
        type: cS[uf(0x1ac)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][uf(0x2f3)](
          (qQ) => qQ - 0.2
        ),
      },
      {
        name: uf(0xb3f),
        desc: uf(0x240),
        type: cS[uf(0xc73)],
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
        name: uf(0xba5),
        desc: uf(0xd6c),
        type: cS[uf(0x63e)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: uf(0x744),
        desc: uf(0xb4f),
        type: cS[uf(0x8ed)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: uf(0x57f),
        desc: uf(0x629),
        type: cS[uf(0x9e0)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: uf(0x465),
        desc: uf(0x67f),
        type: cS[uf(0x49d)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dD(![]),
      dD(!![]),
      {
        name: uf(0x86d),
        desc: uf(0x91f),
        type: cS[uf(0x2d5)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: uf(0x798),
        desc: uf(0xcff),
        type: cS[uf(0x3ba)],
        size: 0xa,
        healthF: 0xf,
        damageF: 0x14,
        respawnTime: 0x5dc,
        extraSpeed: 0x2,
        extraSpeedTiers: [0x4, 0x6, 0x8, 0xa, 0xc, 0xe, 0x10, 0x18],
        turbulence: 0x14,
        turbulenceTiers: dd((qQ) => 0x14 + qQ * 0x50),
      },
      {
        name: uf(0x279),
        desc: uf(0xaa5),
        type: cS[uf(0x135)],
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
        name: uf(0x171),
        desc: uf(0x47c),
        type: cS[uf(0xd9d)],
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
        spawn: uf(0xd4b),
        spawnTiers: [
          uf(0x437),
          uf(0x24b),
          uf(0x1b3),
          uf(0x1b3),
          uf(0x65a),
          uf(0x104),
          uf(0x104),
          uf(0xc47),
        ],
      },
      {
        name: uf(0xc82),
        desc: uf(0x836),
        type: cS[uf(0x551)],
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
        spawn: uf(0x992),
        spawnTiers: [
          uf(0x7a3),
          uf(0x7a3),
          uf(0xc83),
          uf(0x852),
          uf(0x5e2),
          uf(0x1ae),
          uf(0x1ae),
          uf(0xbe1),
        ],
      },
      {
        name: uf(0x237),
        desc: uf(0x9f3),
        type: cS[uf(0xd9d)],
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
        spawn: uf(0xbc5),
        spawnTiers: [
          uf(0xd2c),
          uf(0xd2c),
          uf(0x945),
          uf(0xd01),
          uf(0xab2),
          uf(0x45b),
          uf(0x45b),
          uf(0x1cc),
        ],
      },
      {
        name: uf(0x1bb),
        desc: uf(0x5cb),
        type: cS[uf(0x413)],
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
        spawn: uf(0x289),
        spawnTiers: [
          uf(0x289),
          uf(0xc6c),
          uf(0x627),
          uf(0x85f),
          uf(0xcef),
          uf(0xbbf),
          uf(0xbbf),
          uf(0x9c6),
        ],
      },
      {
        name: uf(0x3f7),
        desc: uf(0x66d),
        type: cS[uf(0x24a)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: uf(0x234),
        spawnTiers: [
          uf(0xff),
          uf(0xb02),
          uf(0xb02),
          uf(0xdcf),
          uf(0x85e),
          uf(0x605),
          uf(0x605),
          uf(0x1de),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: uf(0x8e1),
        desc: uf(0xa17),
        type: cS[uf(0x55e)],
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
        name: uf(0xa7d),
        desc: uf(0xc0e),
        type: cS[uf(0x105)],
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
        name: uf(0xa0b),
        desc: uf(0x814),
        type: cS[uf(0x52b)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: uf(0x8c5),
        desc: uf(0xae0),
        type: cS[uf(0x61b)],
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
        name: uf(0x9be),
        desc: uf(0x763),
        type: cS[uf(0x197)],
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
        name: uf(0x537),
        desc: uf(0x87e),
        type: cS[uf(0xa47)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: uf(0x438),
        desc: uf(0x81f),
        type: cS[uf(0x731)],
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
        name: uf(0x85c),
        desc: uf(0xa83),
        ability: df[uf(0x838)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: uf(0xca),
        desc: uf(0x66f),
        type: cS[uf(0x1da)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: uf(0x845),
        desc: uf(0xb69),
        type: cS[uf(0x352)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: uf(0x41e),
        desc: uf(0x407),
        ability: df[uf(0x5c7)],
        petHealF: 0x28,
      },
      {
        name: uf(0x446),
        desc: uf(0x9d1),
        ability: df[uf(0xb3a)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: uf(0x360),
        type: cS[uf(0xc24)],
        desc: uf(0xc57),
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
        name: uf(0x191),
        desc: uf(0xb5e),
        type: cS[uf(0x531)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: uf(0x143),
        spawnTiers: [
          uf(0xd8c),
          uf(0x6e7),
          uf(0x6e7),
          uf(0x919),
          uf(0x9a3),
          uf(0x4ad),
          uf(0x4ad),
          uf(0x303),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: uf(0x3e4),
        desc: uf(0xb7c),
        type: cS[uf(0x2ec)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          uf(0x2f3)
        ]((qQ) => qQ / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: uf(0x139),
        desc: uf(0x2c0),
        type: cS[uf(0x96d)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: uf(0x979),
        desc: uf(0xd42),
        type: cS[uf(0x3a0)],
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
        name: uf(0xa44),
        desc: uf(0x9cc),
        type: cS[uf(0x730)],
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
        name: uf(0x779),
        desc: uf(0xdd2),
        type: cS[uf(0x4f2)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: uf(0x8aa),
        desc: uf(0x13f),
        type: cS[uf(0x1f9)],
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
        name: uf(0xcfc),
        desc: uf(0x513),
        type: cS[uf(0x184)],
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
        consumeProjType: cS[uf(0x105)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: uf(0xa9d),
        desc: uf(0x5c8),
        type: cS[uf(0x8e2)],
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
        name: uf(0x82d),
        desc: uf(0xa81),
        type: cS[uf(0x3a6)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: uf(0x68b),
        spawnTiers: [
          uf(0x1e8),
          uf(0x440),
          uf(0x440),
          uf(0x29b),
          uf(0xb76),
          uf(0xd9c),
          uf(0x67b),
          uf(0x80e),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: uf(0x19b), desc: uf(0x8d4), ability: df[uf(0x1fb)] },
      {
        name: uf(0xccf),
        desc: uf(0x4fb),
        type: cS[uf(0x9fc)],
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
        name: uf(0x1f0),
        desc: uf(0x390),
        type: cS[uf(0x17a)],
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
        name: uf(0x7d3),
        desc: uf(0xb8b),
        type: cS[uf(0xbf7)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: uf(0x4d8),
        desc: uf(0x38e),
        type: cS[uf(0x1d5)],
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
        name: uf(0x7c0),
        desc: uf(0xc46),
        type: cS[uf(0x60a)],
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
        name: uf(0x747),
        desc: uf(0xd39),
        type: cS[uf(0x453)],
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
        spawn: uf(0x637),
        spawnTiers: [
          uf(0x63a),
          uf(0xbfb),
          uf(0xbfb),
          uf(0xa86),
          uf(0x658),
          uf(0x1af),
          uf(0x1af),
          uf(0x933),
        ],
      },
      {
        name: uf(0xd2e),
        desc: uf(0x914),
        type: cS[uf(0xfa)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: uf(0xad4),
        desc: uf(0x706),
        type: cS[uf(0x72c)],
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
        name: uf(0x140),
        desc: uf(0x259),
        type: cS[uf(0xa32)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 2.5,
      },
      {
        name: uf(0x4ed),
        desc: uf(0xc72),
        type: cS[uf(0xaee)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dd((qQ) => 0xa + qQ * 0x28),
      },
      {
        name: uf(0xd83),
        desc: uf(0x687),
        type: cS[uf(0xb05)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: uf(0x8f1),
        desc: uf(0x486),
        type: cS[uf(0xd77)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dd((qQ) => 0x2 + Math[uf(0xac6)](1.7 ** qQ)),
      },
      {
        name: uf(0x213),
        desc: uf(0x623),
        type: cS[uf(0x7b6)],
        size: 0x1e,
        healthF: 0x5,
        damageF: 0x11,
        isLightsaber: !![],
        uiAngle: -Math["PI"] / 0x6,
        respawnTime: 0x3e8,
        uiX: 0x8,
        uiY: -0x5,
      },
      {
        name: uf(0x399),
        desc: uf(0x217),
        type: cS[uf(0xa79)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dd((qQ) => 0.02 + qQ * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: uf(0x63c),
        desc: uf(0x784),
        type: cS[uf(0x503)],
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
        spawn: uf(0x420),
        spawnTiers: [
          uf(0x420),
          uf(0x9bd),
          uf(0x7b8),
          uf(0xa03),
          uf(0x3f4),
          uf(0x7c9),
          uf(0x7c9),
          uf(0x545),
        ],
      },
      { name: uf(0xd9e), desc: uf(0x911), ability: df[uf(0xc2a)] },
      {
        name: uf(0x403),
        desc: uf(0xb63),
        type: cS[uf(0xa78)],
        size: 0x10,
        healthF: 0x14,
        damageF: 0xa,
        fixAngle: !![],
        isDice: !![],
        respawnTime: 0x640,
      },
    ];
    function dD(qQ) {
      const um = uf,
        qR = qQ ? 0x1 : -0x1,
        qS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][um(0x2f3)](
          (qT) => qT * qR
        );
      return {
        name: qQ ? um(0x8a5) : um(0x14f),
        desc:
          (qQ ? um(0x414) : um(0x7be)) +
          um(0xde) +
          (qQ ? um(0xe1) : "") +
          um(0xae9),
        type: cS[qQ ? um(0x2aa) : um(0x70e)],
        size: 0x10,
        healthF: qQ ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: qS[0x0],
        mobSizeChangeTiers: qS[um(0x4e2)](0x1),
      };
    }
    var dE = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dF = {},
      dG = dC[uf(0xbc8)],
      dH = da[uf(0xbc8)],
      dI = eP();
    for (let qQ = 0x0, qR = dC[uf(0xbc8)]; qQ < qR; qQ++) {
      const qS = dC[qQ];
      (qS[uf(0xd19)] = !![]), (qS["id"] = qQ);
      if (!qS[uf(0xaba)]) qS[uf(0xaba)] = qS[uf(0x9ed)];
      dK(qS), (qS[uf(0xfc)] = 0x0), (qS[uf(0x72f)] = qQ);
      let qT = qS;
      for (let qU = 0x1; qU < dH; qU++) {
        const qV = dO(qS);
        (qV[uf(0xcce)] = qS[uf(0xcce)] + qU),
          (qV[uf(0x9ed)] = qS[uf(0x9ed)] + "_" + qV[uf(0xcce)]),
          (qV[uf(0xfc)] = qU),
          (qT[uf(0xa20)] = qV),
          (qT = qV),
          dJ(qS, qV),
          dK(qV),
          (qV["id"] = dC[uf(0xbc8)]),
          (dC[qV["id"]] = qV);
      }
    }
    function dJ(qW, qX) {
      const un = uf,
        qY = qX[un(0xcce)] - qW[un(0xcce)] - 0x1;
      for (let qZ in qW) {
        const r0 = qW[qZ + un(0x6a3)];
        Array[un(0x9fe)](r0) && (qX[qZ] = r0[qY]);
      }
    }
    function dK(qW) {
      const uo = uf;
      dF[qW[uo(0x9ed)]] = qW;
      for (let qX in di) {
        qW[qX] === void 0x0 && (qW[qX] = di[qX]);
      }
      qW[uo(0x81d)] === df[uo(0x61f)] &&
        (qW[uo(0x1b7)] = cW[qW[uo(0xcce)] + 0x1] / 0x64),
        (qW[uo(0x238)] =
          qW[uo(0x34f)] > 0x0
            ? dg(qW[uo(0xcce)], qW[uo(0x34f)])
            : qW[uo(0x238)]),
        (qW[uo(0x1d8)] =
          qW[uo(0x11f)] > 0x0
            ? dg(qW[uo(0xcce)], qW[uo(0x11f)])
            : qW[uo(0x1d8)]),
        (qW[uo(0x78c)] = dg(qW[uo(0xcce)], qW[uo(0x982)])),
        (qW[uo(0x8c7)] = dg(qW[uo(0xcce)], qW[uo(0x324)])),
        (qW[uo(0x98d)] = dg(qW[uo(0xcce)], qW[uo(0xbdc)])),
        (qW[uo(0x673)] = dg(qW[uo(0xcce)], qW[uo(0xaf0)])),
        (qW[uo(0x1e2)] = dg(qW[uo(0xcce)], qW[uo(0x8e4)])),
        (qW[uo(0xcd0)] = dg(qW[uo(0xcce)], qW[uo(0x7ce)])),
        (qW[uo(0xed)] = dg(qW[uo(0xcce)], qW[uo(0x29e)])),
        (qW[uo(0xad5)] = dg(qW[uo(0xcce)], qW[uo(0x2b5)])),
        qW[uo(0x481)] &&
          ((qW[uo(0x1c7)] = dg(qW[uo(0xcce)], qW[uo(0x239)])),
          (qW[uo(0x2a5)] = dg(qW[uo(0xcce)], qW[uo(0x450)]))),
        qW[uo(0xb58)] > 0x0
          ? (qW[uo(0xbfd)] = dg(qW[uo(0xcce)], qW[uo(0xb58)]))
          : (qW[uo(0xbfd)] = 0x0),
        (qW[uo(0x3b1)] = qW[uo(0x257)]
          ? dg(qW[uo(0xcce)], qW[uo(0xaa4)])
          : 0x0),
        (qW[uo(0xb29)] = qW[uo(0xa30)]
          ? dg(qW[uo(0xcce)], qW[uo(0x811)])
          : 0x0),
        (qW[uo(0x8bb)] = dg(qW[uo(0xcce)], qW[uo(0xd27)])),
        dI[qW[uo(0xcce)]][uo(0x6aa)](qW);
    }
    var dL = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dM = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dN = cV(uf(0xdd6));
    function dO(qW) {
      const up = uf;
      return JSON[up(0x681)](JSON[up(0xa99)](qW));
    }
    const dP = {};
    (dP[uf(0x9ed)] = uf(0x42b)),
      (dP[uf(0x902)] = uf(0x9a5)),
      (dP[uf(0x511)] = uf(0x2bf)),
      (dP[uf(0xcce)] = 0x0),
      (dP[uf(0x34f)] = 0x64),
      (dP[uf(0x11f)] = 0x1e),
      (dP[uf(0xad8)] = 0x32),
      (dP[uf(0xdab)] = dN[uf(0x842)]),
      (dP[uf(0x96c)] = ![]),
      (dP[uf(0x97a)] = !![]),
      (dP[uf(0x257)] = ![]),
      (dP[uf(0xaa4)] = 0x0),
      (dP[uf(0x3b1)] = 0x0),
      (dP[uf(0x6f8)] = ![]),
      (dP[uf(0x51e)] = ![]),
      (dP[uf(0x7d1)] = 0x1),
      (dP[uf(0x47f)] = cS[uf(0xc41)]),
      (dP[uf(0x261)] = 0x0),
      (dP[uf(0xa06)] = 0x0),
      (dP[uf(0x23b)] = 0.5),
      (dP[uf(0xbce)] = 0x0),
      (dP[uf(0x4ec)] = 0x1e),
      (dP[uf(0x235)] = 0x0),
      (dP[uf(0xce)] = ![]),
      (dP[uf(0x811)] = 0x0),
      (dP[uf(0x801)] = 0x0),
      (dP[uf(0x442)] = 11.5),
      (dP[uf(0xa0f)] = 0x4),
      (dP[uf(0x6be)] = !![]),
      (dP[uf(0xda5)] = 0x0),
      (dP[uf(0x1ed)] = 0x0),
      (dP[uf(0x95c)] = 0x1),
      (dP[uf(0xbc2)] = 0x0),
      (dP[uf(0x4f5)] = 0x0),
      (dP[uf(0x1e7)] = 0x0),
      (dP[uf(0x8e7)] = 0x0),
      (dP[uf(0x2a1)] = 0x1);
    var dQ = dP;
    const dR = {};
    (dR[uf(0x9ed)] = uf(0x700)),
      (dR[uf(0x902)] = uf(0x27a)),
      (dR[uf(0x511)] = uf(0xcf8)),
      (dR[uf(0x34f)] = 0x2ee),
      (dR[uf(0x11f)] = 0xa),
      (dR[uf(0xad8)] = 0x32),
      (dR[uf(0x6f8)] = !![]),
      (dR[uf(0x51e)] = !![]),
      (dR[uf(0x7d1)] = 0.05),
      (dR[uf(0x442)] = 0x5),
      (dR[uf(0x4eb)] = !![]),
      (dR[uf(0xa23)] = [[uf(0x992), 0x3]]),
      (dR[uf(0xa2c)] = [
        [uf(0x514), 0x1],
        [uf(0x992), 0x2],
        [uf(0xd88), 0x2],
        [uf(0xd8f), 0x1],
      ]),
      (dR[uf(0x40e)] = [[uf(0xc3f), "f"]]);
    const dS = {};
    (dS[uf(0x9ed)] = uf(0x514)),
      (dS[uf(0x902)] = uf(0x9cd)),
      (dS[uf(0x511)] = uf(0x8d0)),
      (dS[uf(0x34f)] = 0x1f4),
      (dS[uf(0x11f)] = 0xa),
      (dS[uf(0xad8)] = 0x28),
      (dS[uf(0x4eb)] = !![]),
      (dS[uf(0x96c)] = !![]),
      (dS[uf(0x40e)] = [
        [uf(0xba5), "E"],
        [uf(0x8a5), "G"],
        [uf(0xc82), "A"],
      ]);
    const dT = {};
    (dT[uf(0x9ed)] = uf(0x992)),
      (dT[uf(0x902)] = uf(0x985)),
      (dT[uf(0x511)] = uf(0xa1b)),
      (dT[uf(0x34f)] = 0x64),
      (dT[uf(0x11f)] = 0xa),
      (dT[uf(0xad8)] = 0x1c),
      (dT[uf(0x96c)] = !![]),
      (dT[uf(0x40e)] = [[uf(0xba5), "I"]]);
    const dU = {};
    (dU[uf(0x9ed)] = uf(0xd88)),
      (dU[uf(0x902)] = uf(0x4ea)),
      (dU[uf(0x511)] = uf(0x350)),
      (dU[uf(0x34f)] = 62.5),
      (dU[uf(0x11f)] = 0xa),
      (dU[uf(0xad8)] = 0x1c),
      (dU[uf(0x40e)] = [[uf(0x465), "H"]]);
    const dV = {};
    (dV[uf(0x9ed)] = uf(0xd8f)),
      (dV[uf(0x902)] = uf(0x55a)),
      (dV[uf(0x511)] = uf(0x88a)),
      (dV[uf(0x34f)] = 0x19),
      (dV[uf(0x11f)] = 0xa),
      (dV[uf(0xad8)] = 0x19),
      (dV[uf(0x96c)] = ![]),
      (dV[uf(0x97a)] = ![]),
      (dV[uf(0x40e)] = [
        [uf(0x931), "F"],
        [uf(0x465), "F"],
        [uf(0x14f), "G"],
        [uf(0x537), "F"],
      ]);
    var dW = [dR, dS, dT, dU, dV];
    function dX() {
      const uq = uf,
        qW = dO(dW);
      for (let qX = 0x0; qX < qW[uq(0xbc8)]; qX++) {
        const qY = qW[qX];
        (qY[uq(0x511)] += uq(0x979)),
          qY[uq(0x9ed)] === uq(0x700) &&
            (qY[uq(0x40e)] = [
              [uq(0x3c1), "D"],
              [uq(0x8e1), "E"],
            ]),
          (qY[uq(0x9ed)] = dY(qY[uq(0x9ed)])),
          (qY[uq(0x902)] = dY(qY[uq(0x902)])),
          (qY[uq(0x11f)] *= 0x2),
          qY[uq(0xa23)] &&
            qY[uq(0xa23)][uq(0x4a2)]((qZ) => {
              return (qZ[0x0] = dY(qZ[0x0])), qZ;
            }),
          qY[uq(0xa2c)] &&
            qY[uq(0xa2c)][uq(0x4a2)]((qZ) => {
              return (qZ[0x0] = dY(qZ[0x0])), qZ;
            });
      }
      return qW;
    }
    function dY(qW) {
      const ur = uf;
      return qW[ur(0x516)](/Ant/g, ur(0xc20))[ur(0x516)](/ant/g, ur(0xc93));
    }
    const dZ = {};
    (dZ[uf(0x9ed)] = uf(0x73d)),
      (dZ[uf(0x902)] = uf(0x9f0)),
      (dZ[uf(0x511)] = uf(0x5dd)),
      (dZ[uf(0x34f)] = 37.5),
      (dZ[uf(0x11f)] = 0x32),
      (dZ[uf(0xad8)] = 0x28),
      (dZ[uf(0x40e)] = [
        [uf(0x7f0), "F"],
        [uf(0xb3f), "I"],
      ]),
      (dZ[uf(0xda5)] = 0x4),
      (dZ[uf(0x1ed)] = 0x4);
    const e0 = {};
    (e0[uf(0x9ed)] = uf(0x57f)),
      (e0[uf(0x902)] = uf(0xcda)),
      (e0[uf(0x511)] = uf(0x186)),
      (e0[uf(0x34f)] = 0x5e),
      (e0[uf(0x11f)] = 0x5),
      (e0[uf(0x7d1)] = 0.05),
      (e0[uf(0xad8)] = 0x3c),
      (e0[uf(0x6f8)] = !![]),
      (e0[uf(0x40e)] = [[uf(0x57f), "h"]]);
    const e1 = {};
    (e1[uf(0x9ed)] = uf(0x420)),
      (e1[uf(0x902)] = uf(0xa4d)),
      (e1[uf(0x511)] = uf(0x38a)),
      (e1[uf(0x34f)] = 0x4b),
      (e1[uf(0x11f)] = 0xa),
      (e1[uf(0x7d1)] = 0.05),
      (e1[uf(0x6f8)] = !![]),
      (e1[uf(0x42f)] = 1.25),
      (e1[uf(0x40e)] = [
        [uf(0x420), "h"],
        [uf(0x94e), "J"],
        [uf(0x63c), "K"],
      ]);
    const e2 = {};
    (e2[uf(0x9ed)] = uf(0xbc5)),
      (e2[uf(0x902)] = uf(0x1ab)),
      (e2[uf(0x511)] = uf(0x729)),
      (e2[uf(0x34f)] = 62.5),
      (e2[uf(0x11f)] = 0x32),
      (e2[uf(0x96c)] = !![]),
      (e2[uf(0xad8)] = 0x28),
      (e2[uf(0x40e)] = [
        [uf(0xc5f), "f"],
        [uf(0xa2a), "I"],
        [uf(0x237), "K"],
      ]),
      (e2[uf(0x47f)] = cS[uf(0x50b)]),
      (e2[uf(0xa06)] = 0xa),
      (e2[uf(0x261)] = 0x5),
      (e2[uf(0x4ec)] = 0x26),
      (e2[uf(0x23b)] = 0.375 / 1.1),
      (e2[uf(0xbce)] = 0.75),
      (e2[uf(0xdab)] = dN[uf(0x729)]);
    const e3 = {};
    (e3[uf(0x9ed)] = uf(0x99e)),
      (e3[uf(0x902)] = uf(0x41a)),
      (e3[uf(0x511)] = uf(0x172)),
      (e3[uf(0x34f)] = 87.5),
      (e3[uf(0x11f)] = 0xa),
      (e3[uf(0x40e)] = [
        [uf(0x931), "f"],
        [uf(0x3d0), "f"],
      ]),
      (e3[uf(0xda5)] = 0x5),
      (e3[uf(0x1ed)] = 0x5);
    const e4 = {};
    (e4[uf(0x9ed)] = uf(0xd4b)),
      (e4[uf(0x902)] = uf(0xa2d)),
      (e4[uf(0x511)] = uf(0x2bf)),
      (e4[uf(0x34f)] = 0x64),
      (e4[uf(0x11f)] = 0x1e),
      (e4[uf(0x96c)] = !![]),
      (e4[uf(0x40e)] = [[uf(0x171), "F"]]),
      (e4[uf(0xda5)] = 0x5),
      (e4[uf(0x1ed)] = 0x5);
    const e5 = {};
    (e5[uf(0x9ed)] = uf(0x637)),
      (e5[uf(0x902)] = uf(0x1b5)),
      (e5[uf(0x511)] = uf(0x881)),
      (e5[uf(0x34f)] = 62.5),
      (e5[uf(0x11f)] = 0xf),
      (e5[uf(0x257)] = !![]),
      (e5[uf(0xaa4)] = 0xf),
      (e5[uf(0xad8)] = 0x23),
      (e5[uf(0x96c)] = !![]),
      (e5[uf(0x40e)] = [
        [uf(0x63d), "F"],
        [uf(0x9a2), "F"],
        [uf(0x794), "L"],
        [uf(0x85c), "G"],
      ]);
    const e6 = {};
    (e6[uf(0x9ed)] = uf(0x121)),
      (e6[uf(0x902)] = uf(0x249)),
      (e6[uf(0x511)] = uf(0x47a)),
      (e6[uf(0x34f)] = 0x64),
      (e6[uf(0x11f)] = 0xf),
      (e6[uf(0x257)] = !![]),
      (e6[uf(0xaa4)] = 0xa),
      (e6[uf(0xad8)] = 0x2f),
      (e6[uf(0x96c)] = !![]),
      (e6[uf(0x40e)] = [
        [uf(0x2da), "F"],
        [uf(0x438), "F"],
      ]),
      (e6[uf(0x47f)] = cS[uf(0x268)]),
      (e6[uf(0xa06)] = 0x3),
      (e6[uf(0x261)] = 0x5),
      (e6[uf(0x235)] = 0x7),
      (e6[uf(0x4ec)] = 0x2b),
      (e6[uf(0x23b)] = 0.21),
      (e6[uf(0xbce)] = -0.31),
      (e6[uf(0xdab)] = dN[uf(0x3fa)]);
    const e7 = {};
    (e7[uf(0x9ed)] = uf(0x289)),
      (e7[uf(0x902)] = uf(0xa5c)),
      (e7[uf(0x511)] = uf(0x181)),
      (e7[uf(0x34f)] = 0x15e),
      (e7[uf(0x11f)] = 0x28),
      (e7[uf(0xad8)] = 0x2d),
      (e7[uf(0x96c)] = !![]),
      (e7[uf(0x4eb)] = !![]),
      (e7[uf(0x40e)] = [
        [uf(0x1dd), "F"],
        [uf(0xc8a), "G"],
        [uf(0x744), "H"],
        [uf(0x1bb), "J"],
      ]);
    const e8 = {};
    (e8[uf(0x9ed)] = uf(0x96b)),
      (e8[uf(0x902)] = uf(0x91b)),
      (e8[uf(0x511)] = uf(0xa7b)),
      (e8[uf(0x34f)] = 0x7d),
      (e8[uf(0x11f)] = 0x19),
      (e8[uf(0x96c)] = !![]),
      (e8[uf(0xce)] = !![]),
      (e8[uf(0x811)] = 0x5),
      (e8[uf(0x801)] = 0x2),
      (e8[uf(0x9ac)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e8[uf(0xa0f)] = 0x4),
      (e8[uf(0x442)] = 0x6),
      (e8[uf(0x40e)] = [[uf(0xa92), "F"]]);
    const e9 = {};
    (e9[uf(0x9ed)] = uf(0x7cc)),
      (e9[uf(0x902)] = uf(0xca3)),
      (e9[uf(0x511)] = uf(0x243)),
      (e9[uf(0x34f)] = 0.5),
      (e9[uf(0x11f)] = 0x5),
      (e9[uf(0x96c)] = ![]),
      (e9[uf(0x97a)] = ![]),
      (e9[uf(0xa0f)] = 0x1),
      (e9[uf(0x40e)] = [[uf(0x7cc), "F"]]);
    const ea = {};
    (ea[uf(0x9ed)] = uf(0x2dc)),
      (ea[uf(0x902)] = uf(0x2de)),
      (ea[uf(0x511)] = uf(0x2fe)),
      (ea[uf(0x34f)] = 0x19),
      (ea[uf(0x11f)] = 0xa),
      (ea[uf(0xad8)] = 0x28),
      (ea[uf(0xdbe)] = cS[uf(0x62b)]),
      (ea[uf(0x40e)] = [
        [uf(0x465), "J"],
        [uf(0x1ea), "J"],
      ]);
    const eb = {};
    (eb[uf(0x9ed)] = uf(0x728)),
      (eb[uf(0x902)] = uf(0x975)),
      (eb[uf(0x511)] = uf(0x854)),
      (eb[uf(0x34f)] = 0x19),
      (eb[uf(0x11f)] = 0xa),
      (eb[uf(0xad8)] = 0x28),
      (eb[uf(0xdbe)] = cS[uf(0x224)]),
      (eb[uf(0x96c)] = !![]),
      (eb[uf(0x40e)] = [
        [uf(0x2da), "J"],
        [uf(0x3aa), "J"],
      ]);
    const ec = {};
    (ec[uf(0x9ed)] = uf(0xc9d)),
      (ec[uf(0x902)] = uf(0xd95)),
      (ec[uf(0x511)] = uf(0x657)),
      (ec[uf(0x34f)] = 0x19),
      (ec[uf(0x11f)] = 0xa),
      (ec[uf(0xad8)] = 0x28),
      (ec[uf(0xdbe)] = cS[uf(0x1a2)]),
      (ec[uf(0x97a)] = ![]),
      (ec[uf(0x40e)] = [
        [uf(0x86d), "J"],
        [uf(0x5ce), "H"],
        [uf(0x798), "J"],
      ]),
      (ec[uf(0xa0f)] = 0x17),
      (ec[uf(0x442)] = 0x17 * 0.75);
    const ed = {};
    (ed[uf(0x9ed)] = uf(0x781)),
      (ed[uf(0x902)] = uf(0x142)),
      (ed[uf(0x511)] = uf(0xc6e)),
      (ed[uf(0x34f)] = 87.5),
      (ed[uf(0x11f)] = 0xa),
      (ed[uf(0x40e)] = [
        [uf(0x279), "F"],
        [uf(0x578), "I"],
      ]),
      (ed[uf(0xda5)] = 0x5),
      (ed[uf(0x1ed)] = 0x5);
    const ee = {};
    (ee[uf(0x9ed)] = uf(0x25f)),
      (ee[uf(0x902)] = uf(0x86e)),
      (ee[uf(0x511)] = uf(0xad0)),
      (ee[uf(0x34f)] = 87.5),
      (ee[uf(0x11f)] = 0xa),
      (ee[uf(0x40e)] = [
        [uf(0x3d0), "A"],
        [uf(0x279), "A"],
      ]),
      (ee[uf(0xda5)] = 0x5),
      (ee[uf(0x1ed)] = 0x5);
    const ef = {};
    (ef[uf(0x9ed)] = uf(0xb5a)),
      (ef[uf(0x902)] = uf(0xd4)),
      (ef[uf(0x511)] = uf(0x642)),
      (ef[uf(0x34f)] = 0x32),
      (ef[uf(0x11f)] = 0xa),
      (ef[uf(0x7d1)] = 0.05),
      (ef[uf(0xad8)] = 0x3c),
      (ef[uf(0x6f8)] = !![]),
      (ef[uf(0x40e)] = [
        [uf(0xd02), "E"],
        [uf(0x3e4), "F"],
        [uf(0xa9d), "F"],
      ]);
    const eg = {};
    (eg[uf(0x9ed)] = uf(0x234)),
      (eg[uf(0x902)] = uf(0x6ec)),
      (eg[uf(0x511)] = uf(0xc70)),
      (eg[uf(0x34f)] = 0x7d),
      (eg[uf(0x11f)] = 0x28),
      (eg[uf(0xad8)] = 0x32),
      (eg[uf(0x96c)] = ![]),
      (eg[uf(0x97a)] = ![]),
      (eg[uf(0xdab)] = dN[uf(0xc70)]),
      (eg[uf(0xa0f)] = 0xe),
      (eg[uf(0x442)] = 0xb),
      (eg[uf(0x95c)] = 2.2),
      (eg[uf(0x40e)] = [
        [uf(0x3f7), "J"],
        [uf(0x86d), "H"],
      ]);
    const eh = {};
    (eh[uf(0x9ed)] = uf(0xcfa)),
      (eh[uf(0x902)] = uf(0x75d)),
      (eh[uf(0x511)] = uf(0x15f)),
      (eh[uf(0x34f)] = 0x7d),
      (eh[uf(0x11f)] = 0x28),
      (eh[uf(0xad8)] = null),
      (eh[uf(0x96c)] = !![]),
      (eh[uf(0xe8)] = !![]),
      (eh[uf(0x40e)] = [
        [uf(0x348), "D"],
        [uf(0xa7d), "E"],
        [uf(0xcfc), "E"],
      ]),
      (eh[uf(0xad8)] = 0x32),
      (eh[uf(0x58f)] = 0x32),
      (eh[uf(0xd28)] = !![]),
      (eh[uf(0xbc2)] = -Math["PI"] / 0x2),
      (eh[uf(0x47f)] = cS[uf(0x105)]),
      (eh[uf(0xa06)] = 0x3),
      (eh[uf(0x261)] = 0x3),
      (eh[uf(0x4ec)] = 0x21),
      (eh[uf(0x23b)] = 0.32),
      (eh[uf(0xbce)] = 0.4),
      (eh[uf(0xdab)] = dN[uf(0x729)]);
    const ei = {};
    (ei[uf(0x9ed)] = uf(0xa0b)),
      (ei[uf(0x902)] = uf(0xb46)),
      (ei[uf(0x511)] = uf(0x1cd)),
      (ei[uf(0x34f)] = 0x96),
      (ei[uf(0x11f)] = 0x14),
      (ei[uf(0x96c)] = !![]),
      (ei[uf(0x4f5)] = 0.5),
      (ei[uf(0x40e)] = [
        [uf(0xa0b), "D"],
        [uf(0x5ce), "J"],
        [uf(0x86d), "J"],
      ]);
    const ej = {};
    (ej[uf(0x9ed)] = uf(0x8c5)),
      (ej[uf(0x902)] = uf(0x636)),
      (ej[uf(0x511)] = uf(0x92e)),
      (ej[uf(0x34f)] = 0x19),
      (ej[uf(0x11f)] = 0xf),
      (ej[uf(0x7d1)] = 0.05),
      (ej[uf(0xad8)] = 0x37),
      (ej[uf(0x6f8)] = !![]),
      (ej[uf(0x40e)] = [[uf(0x8c5), "h"]]),
      (ej[uf(0x47f)] = cS[uf(0x61b)]),
      (ej[uf(0x1e7)] = 0x9),
      (ej[uf(0x4ec)] = 0x28),
      (ej[uf(0xa06)] = 0xf),
      (ej[uf(0x261)] = 2.5),
      (ej[uf(0x4ec)] = 0x21),
      (ej[uf(0x23b)] = 0.32),
      (ej[uf(0xbce)] = 1.8),
      (ej[uf(0x8e7)] = 0x14);
    const ek = {};
    (ek[uf(0x9ed)] = uf(0x9be)),
      (ek[uf(0x902)] = uf(0xa73)),
      (ek[uf(0x511)] = uf(0xd3)),
      (ek[uf(0x34f)] = 0xe1),
      (ek[uf(0x11f)] = 0xa),
      (ek[uf(0xad8)] = 0x32),
      (ek[uf(0x40e)] = [
        [uf(0x9be), "H"],
        [uf(0x3c1), "L"],
      ]),
      (ek[uf(0xe8)] = !![]),
      (ek[uf(0x684)] = !![]),
      (ek[uf(0x442)] = 0x23);
    const em = {};
    (em[uf(0x9ed)] = uf(0xa6a)),
      (em[uf(0x902)] = uf(0x6c5)),
      (em[uf(0x511)] = uf(0xd0d)),
      (em[uf(0x34f)] = 0x96),
      (em[uf(0x11f)] = 0x19),
      (em[uf(0xad8)] = 0x2f),
      (em[uf(0x96c)] = !![]),
      (em[uf(0x40e)] = [[uf(0x86d), "J"]]),
      (em[uf(0x47f)] = null),
      (em[uf(0xdab)] = dN[uf(0x3fa)]);
    const en = {};
    (en[uf(0x9ed)] = uf(0x815)),
      (en[uf(0x902)] = uf(0x285)),
      (en[uf(0x511)] = uf(0x721)),
      (en[uf(0x34f)] = 0x64),
      (en[uf(0x11f)] = 0x1e),
      (en[uf(0xad8)] = 0x1e),
      (en[uf(0x96c)] = !![]),
      (en[uf(0xacf)] = uf(0x8e1)),
      (en[uf(0x40e)] = [
        [uf(0x8e1), "F"],
        [uf(0x85c), "E"],
        [uf(0x360), "D"],
        [uf(0xd9e), "E"],
      ]);
    const eo = {};
    (eo[uf(0x9ed)] = uf(0xca)),
      (eo[uf(0x902)] = uf(0x955)),
      (eo[uf(0x511)] = uf(0x226)),
      (eo[uf(0x34f)] = 0x64),
      (eo[uf(0x11f)] = 0xa),
      (eo[uf(0xad8)] = 0x3c),
      (eo[uf(0x6f8)] = !![]),
      (eo[uf(0x7d1)] = 0.05),
      (eo[uf(0x40e)] = [[uf(0xca), "D"]]);
    const ep = {};
    (ep[uf(0x9ed)] = uf(0x1b8)),
      (ep[uf(0x902)] = uf(0x6f3)),
      (ep[uf(0x511)] = uf(0xbc6)),
      (ep[uf(0x34f)] = 0x64),
      (ep[uf(0x11f)] = 0x23),
      (ep[uf(0x96c)] = !![]),
      (ep[uf(0x40e)] = [
        [uf(0x845), "E"],
        [uf(0x4d8), "D"],
      ]);
    const eq = {};
    (eq[uf(0x9ed)] = uf(0x7a1)),
      (eq[uf(0x902)] = uf(0x80a)),
      (eq[uf(0x511)] = uf(0x14e)),
      (eq[uf(0x34f)] = 0xc8),
      (eq[uf(0x11f)] = 0x23),
      (eq[uf(0xad8)] = 0x23),
      (eq[uf(0x96c)] = !![]),
      (eq[uf(0x1ed)] = 0x5),
      (eq[uf(0x40e)] = [
        [uf(0x41e), "F"],
        [uf(0x446), "D"],
        [uf(0x7d3), "E"],
      ]);
    const er = {};
    (er[uf(0x9ed)] = uf(0x143)),
      (er[uf(0x902)] = uf(0x3e8)),
      (er[uf(0x511)] = uf(0xc4a)),
      (er[uf(0x34f)] = 0xc8),
      (er[uf(0x11f)] = 0x14),
      (er[uf(0xad8)] = 0x28),
      (er[uf(0x96c)] = !![]),
      (er[uf(0x40e)] = [
        [uf(0x191), "E"],
        [uf(0x139), "D"],
        [uf(0x979), "F"],
        [uf(0xa44), "F"],
      ]),
      (er[uf(0x49a)] = !![]),
      (er[uf(0x692)] = 0xbb8),
      (er[uf(0x4e0)] = 0.3);
    const es = {};
    (es[uf(0x9ed)] = uf(0x779)),
      (es[uf(0x902)] = uf(0x920)),
      (es[uf(0x511)] = uf(0x7e1)),
      (es[uf(0x34f)] = 0x78),
      (es[uf(0x11f)] = 0x1e),
      (es[uf(0x684)] = !![]),
      (es[uf(0x442)] = 0xf),
      (es[uf(0xa0f)] = 0x5),
      (es[uf(0x40e)] = [
        [uf(0x779), "F"],
        [uf(0x8aa), "E"],
        [uf(0x1f0), "D"],
      ]),
      (es[uf(0x1ed)] = 0x3);
    const et = {};
    (et[uf(0x9ed)] = uf(0x82d)),
      (et[uf(0x902)] = uf(0xcf1)),
      (et[uf(0x511)] = uf(0x162)),
      (et[uf(0x34f)] = 0x78),
      (et[uf(0x11f)] = 0x23),
      (et[uf(0xad8)] = 0x32),
      (et[uf(0x96c)] = !![]),
      (et[uf(0x5ab)] = !![]),
      (et[uf(0x40e)] = [
        [uf(0x82d), "E"],
        [uf(0xa9d), "F"],
      ]),
      (et[uf(0xa23)] = [[uf(0x68b), 0x1]]),
      (et[uf(0xa2c)] = [[uf(0x68b), 0x2]]),
      (et[uf(0xba7)] = !![]);
    const eu = {};
    (eu[uf(0x9ed)] = uf(0x68b)),
      (eu[uf(0x902)] = uf(0xc4c)),
      (eu[uf(0x511)] = uf(0x296)),
      (eu[uf(0x34f)] = 0x96),
      (eu[uf(0x11f)] = 0.1),
      (eu[uf(0xad8)] = 0x28),
      (eu[uf(0xa0f)] = 0xe),
      (eu[uf(0x442)] = 11.6),
      (eu[uf(0x96c)] = !![]),
      (eu[uf(0x5ab)] = !![]),
      (eu[uf(0x12f)] = !![]),
      (eu[uf(0xdab)] = dN[uf(0xc70)]),
      (eu[uf(0xac7)] = 0xa),
      (eu[uf(0x40e)] = [[uf(0x19b), "G"]]),
      (eu[uf(0x2a1)] = 0.5);
    const ev = {};
    (ev[uf(0x9ed)] = uf(0x961)),
      (ev[uf(0x902)] = uf(0xe0)),
      (ev[uf(0x511)] = uf(0x241)),
      (ev[uf(0x34f)] = 0x1f4),
      (ev[uf(0x11f)] = 0x28),
      (ev[uf(0x7d1)] = 0.05),
      (ev[uf(0xad8)] = 0x32),
      (ev[uf(0x6f8)] = !![]),
      (ev[uf(0x442)] = 0x5),
      (ev[uf(0x51e)] = !![]),
      (ev[uf(0x4eb)] = !![]),
      (ev[uf(0x40e)] = [
        [uf(0xccf), "F"],
        [uf(0x237), "C"],
      ]),
      (ev[uf(0xa23)] = [
        [uf(0x73d), 0x2],
        [uf(0xbc5), 0x1],
      ]),
      (ev[uf(0xa2c)] = [
        [uf(0x73d), 0x4],
        [uf(0xbc5), 0x2],
      ]);
    const ew = {};
    (ew[uf(0x9ed)] = uf(0x7c0)),
      (ew[uf(0x902)] = uf(0x4fc)),
      (ew[uf(0x511)] = uf(0x4a0)),
      (ew[uf(0x34f)] = 0x50),
      (ew[uf(0x11f)] = 0x28),
      (ew[uf(0xa0f)] = 0x2),
      (ew[uf(0x442)] = 0x6),
      (ew[uf(0xe8)] = !![]),
      (ew[uf(0x40e)] = [[uf(0x7c0), "F"]]);
    const ex = {};
    (ex[uf(0x9ed)] = uf(0xc16)),
      (ex[uf(0x902)] = uf(0x189)),
      (ex[uf(0x511)] = uf(0x7b3)),
      (ex[uf(0x34f)] = 0x1f4),
      (ex[uf(0x11f)] = 0x28),
      (ex[uf(0x7d1)] = 0.05),
      (ex[uf(0xad8)] = 0x46),
      (ex[uf(0x442)] = 0x5),
      (ex[uf(0x6f8)] = !![]),
      (ex[uf(0x51e)] = !![]),
      (ex[uf(0x4eb)] = !![]),
      (ex[uf(0x40e)] = [
        [uf(0x747), "A"],
        [uf(0x9a2), "E"],
      ]),
      (ex[uf(0xa23)] = [[uf(0x637), 0x2]]),
      (ex[uf(0xa2c)] = [
        [uf(0x637), 0x3],
        [uf(0x815), 0x2],
      ]);
    const ey = {};
    (ey[uf(0x9ed)] = uf(0x703)),
      (ey[uf(0x902)] = uf(0x517)),
      (ey[uf(0x511)] = uf(0xb37)),
      (ey[uf(0xad8)] = 0x28),
      (ey[uf(0x34f)] = 0x64),
      (ey[uf(0x11f)] = 0xa),
      (ey[uf(0x7d1)] = 0.05),
      (ey[uf(0x6f8)] = !![]),
      (ey[uf(0xda5)] = 0x1),
      (ey[uf(0x1ed)] = 0x1),
      (ey[uf(0x40e)] = [
        [uf(0x446), "G"],
        [uf(0x5ce), "F"],
        [uf(0xd2e), "F"],
      ]);
    const ez = {};
    (ez[uf(0x9ed)] = uf(0x990)),
      (ez[uf(0x902)] = uf(0xaf7)),
      (ez[uf(0x511)] = uf(0xa11)),
      (ez[uf(0x34f)] = 0x3c),
      (ez[uf(0x11f)] = 0x28),
      (ez[uf(0xad8)] = 0x32),
      (ez[uf(0x96c)] = ![]),
      (ez[uf(0x97a)] = ![]),
      (ez[uf(0xdab)] = dN[uf(0xc70)]),
      (ez[uf(0xa0f)] = 0xe),
      (ez[uf(0x442)] = 0xb),
      (ez[uf(0x95c)] = 2.2),
      (ez[uf(0x40e)] = [
        [uf(0x4d8), "E"],
        [uf(0x86d), "J"],
      ]);
    const eA = {};
    (eA[uf(0x9ed)] = uf(0x3d8)),
      (eA[uf(0x902)] = uf(0xc65)),
      (eA[uf(0x511)] = uf(0x176)),
      (eA[uf(0x34f)] = 0x258),
      (eA[uf(0x11f)] = 0x32),
      (eA[uf(0x7d1)] = 0.05),
      (eA[uf(0xad8)] = 0x3c),
      (eA[uf(0x442)] = 0x7),
      (eA[uf(0x4eb)] = !![]),
      (eA[uf(0x6f8)] = !![]),
      (eA[uf(0x51e)] = !![]),
      (eA[uf(0x40e)] = [
        [uf(0x191), "A"],
        [uf(0x3f7), "G"],
      ]),
      (eA[uf(0xa23)] = [[uf(0x143), 0x1]]),
      (eA[uf(0xa2c)] = [[uf(0x143), 0x1]]);
    const eB = {};
    (eB[uf(0x9ed)] = uf(0x68a)),
      (eB[uf(0x902)] = uf(0x40f)),
      (eB[uf(0x511)] = uf(0x459)),
      (eB[uf(0x34f)] = 0xc8),
      (eB[uf(0x11f)] = 0x1e),
      (eB[uf(0xad8)] = 0x2d),
      (eB[uf(0x96c)] = !![]),
      (eB[uf(0x40e)] = [
        [uf(0x1dd), "G"],
        [uf(0xc8a), "H"],
        [uf(0x1f0), "E"],
      ]);
    const eC = {};
    (eC[uf(0x9ed)] = uf(0xaf9)),
      (eC[uf(0x902)] = uf(0x8a4)),
      (eC[uf(0x511)] = uf(0xa46)),
      (eC[uf(0x34f)] = 0x3c),
      (eC[uf(0x11f)] = 0x64),
      (eC[uf(0xad8)] = 0x28),
      (eC[uf(0x656)] = !![]),
      (eC[uf(0x6be)] = ![]),
      (eC[uf(0x96c)] = !![]),
      (eC[uf(0x40e)] = [
        [uf(0x139), "F"],
        [uf(0x465), "D"],
        [uf(0xad4), "G"],
      ]);
    const eD = {};
    (eD[uf(0x9ed)] = uf(0x140)),
      (eD[uf(0x902)] = uf(0x53d)),
      (eD[uf(0x511)] = uf(0x841)),
      (eD[uf(0xad8)] = 0x28),
      (eD[uf(0x34f)] = 0x5a),
      (eD[uf(0x11f)] = 0x5),
      (eD[uf(0x7d1)] = 0.05),
      (eD[uf(0x6f8)] = !![]),
      (eD[uf(0x40e)] = [[uf(0x140), "h"]]);
    const eE = {};
    (eE[uf(0x9ed)] = uf(0x4ed)),
      (eE[uf(0x902)] = uf(0x736)),
      (eE[uf(0x511)] = uf(0xbb2)),
      (eE[uf(0x34f)] = 0x32),
      (eE[uf(0x11f)] = 0x14),
      (eE[uf(0xad8)] = 0x28),
      (eE[uf(0xe8)] = !![]),
      (eE[uf(0x40e)] = [[uf(0x4ed), "F"]]);
    const eF = {};
    (eF[uf(0x9ed)] = uf(0xd83)),
      (eF[uf(0x902)] = uf(0xf7)),
      (eF[uf(0x511)] = uf(0x5b5)),
      (eF[uf(0x34f)] = 0x32),
      (eF[uf(0x11f)] = 0x14),
      (eF[uf(0x7d1)] = 0.05),
      (eF[uf(0x6f8)] = !![]),
      (eF[uf(0x40e)] = [[uf(0xd83), "J"]]);
    const eG = {};
    (eG[uf(0x9ed)] = uf(0x976)),
      (eG[uf(0x902)] = uf(0x7bf)),
      (eG[uf(0x511)] = uf(0x500)),
      (eG[uf(0x34f)] = 0x64),
      (eG[uf(0x11f)] = 0x1e),
      (eG[uf(0x7d1)] = 0.05),
      (eG[uf(0xad8)] = 0x32),
      (eG[uf(0x6f8)] = !![]),
      (eG[uf(0x40e)] = [
        [uf(0x139), "D"],
        [uf(0x8f1), "E"],
      ]);
    const eH = {};
    (eH[uf(0x9ed)] = uf(0xb62)),
      (eH[uf(0x902)] = uf(0x5ee)),
      (eH[uf(0x511)] = uf(0x754)),
      (eH[uf(0x34f)] = 0x96),
      (eH[uf(0x11f)] = 0x14),
      (eH[uf(0xad8)] = 0x28),
      (eH[uf(0x40e)] = [
        [uf(0x213), "D"],
        [uf(0x8aa), "F"],
      ]),
      (eH[uf(0xa2c)] = [[uf(0xd8f), 0x1, 0.3]]);
    const eI = {};
    (eI[uf(0x9ed)] = uf(0x399)),
      (eI[uf(0x902)] = uf(0x9b8)),
      (eI[uf(0x511)] = uf(0x6ce)),
      (eI[uf(0x34f)] = 0x32),
      (eI[uf(0x11f)] = 0x5),
      (eI[uf(0x7d1)] = 0.05),
      (eI[uf(0x6f8)] = !![]),
      (eI[uf(0x40e)] = [
        [uf(0x399), "h"],
        [uf(0x465), "J"],
      ]);
    const eJ = {};
    (eJ[uf(0x9ed)] = uf(0x403)),
      (eJ[uf(0x902)] = uf(0x470)),
      (eJ[uf(0x511)] = uf(0xba9)),
      (eJ[uf(0x34f)] = 0x64),
      (eJ[uf(0x11f)] = 0x5),
      (eJ[uf(0x7d1)] = 0.05),
      (eJ[uf(0x6f8)] = !![]),
      (eJ[uf(0x40e)] = [[uf(0x403), "h"]]);
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
      eL = eK[uf(0xbc8)],
      eM = {},
      eN = [],
      eO = eP();
    function eP() {
      const qW = [];
      for (let qX = 0x0; qX < dH; qX++) {
        qW[qX] = [];
      }
      return qW;
    }
    for (let qW = 0x0; qW < eL; qW++) {
      const qX = eK[qW];
      for (let qY in dQ) {
        qX[qY] === void 0x0 && (qX[qY] = dQ[qY]);
      }
      (eN[qW] = [qX]), (qX[uf(0x511)] = cS[qX[uf(0x511)]]), eR(qX);
      qX[uf(0x40e)] &&
        qX[uf(0x40e)][uf(0x4a2)]((qZ) => {
          const us = uf;
          qZ[0x1] = qZ[0x1][us(0xd1e)]()[us(0x96f)](0x0) - 0x41;
        });
      (qX["id"] = qW), (qX[uf(0x72f)] = qW);
      if (!qX[uf(0xaba)]) qX[uf(0xaba)] = qX[uf(0x9ed)];
      for (let qZ = 0x1; qZ <= db; qZ++) {
        const r0 = JSON[uf(0x681)](JSON[uf(0xa99)](qX));
        (r0[uf(0x9ed)] = qX[uf(0x9ed)] + "_" + qZ),
          (r0[uf(0xcce)] = qZ),
          (eN[qW][qZ] = r0),
          dJ(qX, r0),
          eR(r0),
          (r0["id"] = eK[uf(0xbc8)]),
          eK[uf(0x6aa)](r0);
      }
    }
    for (let r1 = 0x0; r1 < eK[uf(0xbc8)]; r1++) {
      const r2 = eK[r1];
      r2[uf(0xa23)] && eQ(r2, r2[uf(0xa23)]),
        r2[uf(0xa2c)] && eQ(r2, r2[uf(0xa2c)]);
    }
    function eQ(r3, r4) {
      const ut = uf;
      r4[ut(0x4a2)]((r5) => {
        const uu = ut,
          r6 = r5[0x0] + (r3[uu(0xcce)] > 0x0 ? "_" + r3[uu(0xcce)] : "");
        r5[0x0] = eM[r6];
      });
    }
    function eR(r3) {
      const uv = uf;
      (r3[uv(0x238)] = dg(r3[uv(0xcce)], r3[uv(0x34f)]) * dL[r3[uv(0xcce)]]),
        (r3[uv(0x1d8)] = dg(r3[uv(0xcce)], r3[uv(0x11f)])),
        r3[uv(0xd28)]
          ? (r3[uv(0x58f)] = r3[uv(0xad8)])
          : (r3[uv(0x58f)] = r3[uv(0xad8)] * dM[r3[uv(0xcce)]]),
        (r3[uv(0x3b1)] = dg(r3[uv(0xcce)], r3[uv(0xaa4)])),
        (r3[uv(0xa01)] = dg(r3[uv(0xcce)], r3[uv(0xa06)])),
        (r3[uv(0x4c8)] = dg(r3[uv(0xcce)], r3[uv(0x261)]) * dL[r3[uv(0xcce)]]),
        (r3[uv(0x1e3)] = dg(r3[uv(0xcce)], r3[uv(0x235)])),
        r3[uv(0x4e0)] && (r3[uv(0x719)] = dg(r3[uv(0xcce)], r3[uv(0x4e0)])),
        (r3[uv(0xb29)] = dg(r3[uv(0xcce)], r3[uv(0x811)])),
        (eM[r3[uv(0x9ed)]] = r3),
        eO[r3[uv(0xcce)]][uv(0x6aa)](r3);
    }
    function eS(r3) {
      return (r3 / 0xff) * Math["PI"] * 0x2;
    }
    var eT = Math["PI"] * 0x2;
    function eU(r3) {
      const uw = uf;
      return (
        (r3 %= eT), r3 < 0x0 && (r3 += eT), Math[uw(0xac6)]((r3 / eT) * 0xff)
      );
    }
    function eV(r3) {
      const ux = uf;
      if (!r3 || r3[ux(0xbc8)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        ux(0x7a5)
      ](r3);
    }
    function eW(r3, r4) {
      return dF[r3 + (r4 > 0x0 ? "_" + r4 : "")];
    }
    var eX = da[uf(0x2f3)]((r3) => r3[uf(0x682)]() + uf(0xc00)),
      eY = da[uf(0x2f3)]((r3) => uf(0xa45) + r3 + uf(0xb00)),
      eZ = {};
    eX[uf(0x4a2)]((r3) => {
      eZ[r3] = 0x0;
    });
    var f0 = {};
    eY[uf(0x4a2)]((r3) => {
      f0[r3] = 0x0;
    });
    var f1 = 0x1 / 0x3e8 / 0x3c / 0x3c;
    function f2() {
      const uy = uf;
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
        timeJoined: Date[uy(0x603)]() * f1,
      };
    }
    var f3 = uf(0x463)[uf(0x1cf)]("\x20");
    function f4(r3) {
      const r4 = {};
      for (let r5 in r3) {
        r4[r3[r5]] = r5;
      }
      return r4;
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
    for (let r3 = 0x0; r3 < f5[uf(0xbc8)]; r3++) {
      const r4 = f5[r3],
        r5 = r4[r4[uf(0xbc8)] - 0x1],
        r6 = dO(r5);
      for (let r7 = 0x0; r7 < r6[uf(0xbc8)]; r7++) {
        const r8 = r6[r7];
        if (r8[0x0] < 0x1e) {
          let r9 = r8[0x0];
          (r9 *= 1.5),
            r9 < 1.5 && (r9 *= 0xa),
            (r9 = parseFloat(r9[uf(0xac4)](0x3))),
            (r8[0x0] = r9);
        }
        r8[0x1] = d9[uf(0xcd9)];
      }
      r6[uf(0x6aa)]([0.01, d9[uf(0xb6e)]]), r4[uf(0x6aa)](r6);
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
    function f7(ra, rb) {
      var rc = Math["PI"] * 0x2,
        rd = (rb - ra) % rc;
      return ((0x2 * rd) % rc) - rd;
    }
    function f8(ra, rb, rc) {
      return ra + f7(ra, rb) * rc;
    }
    var f9 = {
      instagram: uf(0x5f8),
      discord: uf(0x58d),
      paw: uf(0xa35),
      gear: uf(0x9e4),
      scroll: uf(0x803),
      bag: uf(0xcf5),
      food: uf(0x5cf),
      graph: uf(0xca0),
      resize: uf(0x3c9),
      users: uf(0x871),
      trophy: uf(0x391),
      shop: uf(0x138),
      dice: uf(0x2ee),
      poopPath: new Path2D(uf(0x614)),
    };
    function fa(ra) {
      const uz = uf;
      return ra[uz(0x516)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fb(ra) {
      const uA = uf;
      if(hack.isEnabled('disableChatCheck')) return ra;
      return (
        (ra = fa(ra)),
        (ra = ra[uA(0x516)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uA(0x516)](/(.)\1{2,}/gi, "$1")
          [uA(0x516)](/\u200B|\u200C|\u200D/g, "")
          [uA(0x11a)]()),
        !ra && (ra = uA(0x544)),
        ra
      );
    }
    var fc = 0x105;
    function fd(ra) {
      const uB = uf,
        rb = ra[uB(0x1cf)]("\x0a")[uB(0x21a)](
          (rc) => rc[uB(0x11a)]()[uB(0xbc8)] > 0x0
        );
      return { title: rb[uB(0x6f7)](), content: rb };
    }
    const fe = {};
    (fe[uf(0xcb5)] = uf(0x539)),
      (fe[uf(0x23a)] = [
        uf(0x129),
        uf(0x593),
        uf(0x676),
        uf(0xc6f),
        uf(0xc94),
        uf(0xcf),
        uf(0x696),
        uf(0x3cd),
      ]);
    const ff = {};
    (ff[uf(0xcb5)] = uf(0x8f2)), (ff[uf(0x23a)] = [uf(0x21e)]);
    const fg = {};
    (fg[uf(0xcb5)] = uf(0x785)),
      (fg[uf(0x23a)] = [uf(0xd03), uf(0x60c), uf(0xc01), uf(0x445)]);
    const fh = {};
    (fh[uf(0xcb5)] = uf(0xa7f)),
      (fh[uf(0x23a)] = [
        uf(0x31e),
        uf(0xcc1),
        uf(0xc55),
        uf(0x4ff),
        uf(0xc7),
        uf(0x73f),
        uf(0x225),
        uf(0x2be),
        uf(0xd60),
      ]);
    const fi = {};
    (fi[uf(0xcb5)] = uf(0x52d)),
      (fi[uf(0x23a)] = [uf(0x967), uf(0x16d), uf(0x2d1), uf(0x898)]);
    const fj = {};
    (fj[uf(0xcb5)] = uf(0x87c)), (fj[uf(0x23a)] = [uf(0x6db)]);
    const fk = {};
    (fk[uf(0xcb5)] = uf(0x72a)), (fk[uf(0x23a)] = [uf(0x9b5), uf(0x8cf)]);
    const fl = {};
    (fl[uf(0xcb5)] = uf(0x9a0)),
      (fl[uf(0x23a)] = [
        uf(0x32f),
        uf(0x147),
        uf(0x946),
        uf(0x5a6),
        uf(0x3b0),
        uf(0xb1f),
        uf(0x2fa),
        uf(0x523),
      ]);
    const fm = {};
    (fm[uf(0xcb5)] = uf(0x8ff)),
      (fm[uf(0x23a)] = [
        uf(0x4de),
        uf(0x4a1),
        uf(0xc1e),
        uf(0x11c),
        uf(0xa76),
        uf(0x520),
        uf(0x1ce),
        uf(0x944),
      ]);
    const fn = {};
    (fn[uf(0xcb5)] = uf(0xc9f)), (fn[uf(0x23a)] = [uf(0x6c2)]);
    const fo = {};
    (fo[uf(0xcb5)] = uf(0xa8c)),
      (fo[uf(0x23a)] = [
        uf(0xaae),
        uf(0x180),
        uf(0x601),
        uf(0x6a5),
        uf(0x57e),
        uf(0x965),
        uf(0x9b7),
      ]);
    const fp = {};
    (fp[uf(0xcb5)] = uf(0xb0f)), (fp[uf(0x23a)] = [uf(0x783)]);
    const fq = {};
    (fq[uf(0xcb5)] = uf(0x62d)),
      (fq[uf(0x23a)] = [uf(0x620), uf(0x949), uf(0x649), uf(0x8d2)]);
    const fr = {};
    (fr[uf(0xcb5)] = uf(0xabb)), (fr[uf(0x23a)] = [uf(0x173), uf(0xd8e)]);
    const fs = {};
    (fs[uf(0xcb5)] = uf(0x6c4)),
      (fs[uf(0x23a)] = [uf(0x17e), uf(0x177), uf(0xbea), uf(0x75e)]);
    const ft = {};
    (ft[uf(0xcb5)] = uf(0x9c3)),
      (ft[uf(0x23a)] = [uf(0x25c), uf(0x723), uf(0x54c), uf(0x800)]);
    const fu = {};
    (fu[uf(0xcb5)] = uf(0xbb9)),
      (fu[uf(0x23a)] = [
        uf(0x791),
        uf(0x43f),
        uf(0x83a),
        uf(0x405),
        uf(0x5b2),
        uf(0x909),
      ]);
    const fv = {};
    (fv[uf(0xcb5)] = uf(0x340)), (fv[uf(0x23a)] = [uf(0x5ad)]);
    const fw = {};
    (fw[uf(0xcb5)] = uf(0x93e)), (fw[uf(0x23a)] = [uf(0x4ab), uf(0xd5f)]);
    const fx = {};
    (fx[uf(0xcb5)] = uf(0x796)),
      (fx[uf(0x23a)] = [uf(0x8b5), uf(0x6de), uf(0x2f7)]);
    const fy = {};
    (fy[uf(0xcb5)] = uf(0xa8a)),
      (fy[uf(0x23a)] = [uf(0x741), uf(0x4af), uf(0x686), uf(0x498), uf(0x75a)]);
    const fz = {};
    (fz[uf(0xcb5)] = uf(0xc79)), (fz[uf(0x23a)] = [uf(0x133), uf(0x124)]);
    const fA = {};
    (fA[uf(0xcb5)] = uf(0x5a4)),
      (fA[uf(0x23a)] = [uf(0xce3), uf(0x45e), uf(0xd4e)]);
    const fB = {};
    (fB[uf(0xcb5)] = uf(0x640)), (fB[uf(0x23a)] = [uf(0x528)]);
    const fC = {};
    (fC[uf(0xcb5)] = uf(0xcf2)), (fC[uf(0x23a)] = [uf(0x26b)]);
    const fD = {};
    (fD[uf(0xcb5)] = uf(0x447)), (fD[uf(0x23a)] = [uf(0x3b6)]);
    const fE = {};
    (fE[uf(0xcb5)] = uf(0x6e4)),
      (fE[uf(0x23a)] = [uf(0x91d), uf(0x44a), uf(0x80b)]);
    const fF = {};
    (fF[uf(0xcb5)] = uf(0x7d2)),
      (fF[uf(0x23a)] = [
        uf(0xcc6),
        uf(0x901),
        uf(0x82b),
        uf(0x827),
        uf(0xc71),
        uf(0x252),
        uf(0xd18),
        uf(0xb5b),
        uf(0x2c4),
        uf(0xc2c),
        uf(0x7f9),
        uf(0xd6b),
        uf(0x355),
        uf(0x479),
      ]);
    const fG = {};
    (fG[uf(0xcb5)] = uf(0xd59)),
      (fG[uf(0x23a)] = [
        uf(0x5be),
        uf(0x71e),
        uf(0x3e0),
        uf(0xd50),
        uf(0xd47),
        uf(0xd70),
        uf(0xb79),
        uf(0x5e1),
      ]);
    const fH = {};
    (fH[uf(0xcb5)] = uf(0x928)),
      (fH[uf(0x23a)] = [
        uf(0xef),
        uf(0x325),
        uf(0x73c),
        uf(0x755),
        uf(0xb2e),
        uf(0x6c7),
        uf(0x876),
        uf(0x47d),
        uf(0x6af),
        uf(0x214),
        uf(0x7a9),
        uf(0xcc5),
        uf(0x6d5),
        uf(0x1b6),
      ]);
    const fI = {};
    (fI[uf(0xcb5)] = uf(0x489)),
      (fI[uf(0x23a)] = [
        uf(0x6f1),
        uf(0xd69),
        uf(0xcb),
        uf(0x611),
        uf(0xbcc),
        uf(0xda4),
        uf(0x559),
      ]);
    const fJ = {};
    (fJ[uf(0xcb5)] = uf(0xc40)),
      (fJ[uf(0x23a)] = [
        uf(0x26d),
        uf(0xc12),
        uf(0x333),
        uf(0x998),
        uf(0x724),
        uf(0x1e5),
        uf(0x428),
        uf(0x4c7),
        uf(0x83d),
        uf(0x7dc),
        uf(0x79b),
        uf(0x72b),
        uf(0xaac),
        uf(0x89c),
      ]);
    const fK = {};
    (fK[uf(0xcb5)] = uf(0x9d6)),
      (fK[uf(0x23a)] = [
        uf(0xdbc),
        uf(0x834),
        uf(0x9ae),
        uf(0xdc0),
        uf(0x851),
        uf(0xeb),
        uf(0x16e),
        uf(0x4d4),
        uf(0xaf6),
        uf(0x15d),
        uf(0x16f),
        uf(0x29f),
        uf(0x311),
        uf(0x59a),
        uf(0xb7b),
      ]);
    const fL = {};
    (fL[uf(0xcb5)] = uf(0x693)),
      (fL[uf(0x23a)] = [
        uf(0x860),
        uf(0x5ae),
        uf(0x394),
        uf(0x60b),
        uf(0xa3b),
        uf(0xcdb),
        uf(0x670),
        uf(0x5e3),
        uf(0x2e9),
        uf(0x338),
        uf(0x59d),
        uf(0x179),
        uf(0x543),
      ]);
    const fM = {};
    (fM[uf(0xcb5)] = uf(0x655)),
      (fM[uf(0x23a)] = [
        uf(0xbd9),
        uf(0x50e),
        uf(0xc5b),
        uf(0xb61),
        uf(0x588),
        uf(0xc0d),
      ]);
    const fN = {};
    (fN[uf(0xcb5)] = uf(0x1d1)),
      (fN[uf(0x23a)] = [
        uf(0x11d),
        uf(0x21b),
        uf(0xa4b),
        uf(0x18b),
        uf(0xa84),
        uf(0x3f6),
        uf(0x71f),
        uf(0x68f),
        uf(0x248),
      ]);
    const fO = {};
    (fO[uf(0xcb5)] = uf(0x1d1)),
      (fO[uf(0x23a)] = [
        uf(0x8ba),
        uf(0x5c1),
        uf(0x471),
        uf(0xc2),
        uf(0xb7d),
        uf(0x154),
        uf(0x795),
        uf(0x3eb),
        uf(0x56d),
        uf(0xee),
        uf(0x897),
        uf(0xbb0),
        uf(0x56f),
        uf(0xa5b),
        uf(0x594),
        uf(0x9c4),
        uf(0x93b),
      ]);
    const fP = {};
    (fP[uf(0xcb5)] = uf(0x844)), (fP[uf(0x23a)] = [uf(0xdd1), uf(0x292)]);
    const fQ = {};
    (fQ[uf(0xcb5)] = uf(0x118)),
      (fQ[uf(0x23a)] = [uf(0xdb6), uf(0x77c), uf(0x95b)]);
    const fR = {};
    (fR[uf(0xcb5)] = uf(0x170)),
      (fR[uf(0x23a)] = [uf(0xa85), uf(0x4ba), uf(0x22d), uf(0x1fe)]);
    const fS = {};
    (fS[uf(0xcb5)] = uf(0xaa6)),
      (fS[uf(0x23a)] = [
        uf(0x2cf),
        uf(0x484),
        uf(0x67c),
        uf(0x3d1),
        uf(0xcee),
        uf(0x638),
      ]);
    const fT = {};
    (fT[uf(0xcb5)] = uf(0x106)), (fT[uf(0x23a)] = [uf(0xbcd)]);
    const fU = {};
    (fU[uf(0xcb5)] = uf(0x88b)),
      (fU[uf(0x23a)] = [
        uf(0xc8d),
        uf(0x702),
        uf(0xd99),
        uf(0x885),
        uf(0x9bc),
        uf(0x708),
        uf(0x959),
        uf(0x585),
      ]);
    const fV = {};
    (fV[uf(0xcb5)] = uf(0xc31)), (fV[uf(0x23a)] = [uf(0x14c), uf(0x18f)]);
    const fW = {};
    (fW[uf(0xcb5)] = uf(0x641)),
      (fW[uf(0x23a)] = [uf(0xc67), uf(0x991), uf(0xa39), uf(0x49b), uf(0x1ff)]);
    const fX = {};
    (fX[uf(0xcb5)] = uf(0xb6d)),
      (fX[uf(0x23a)] = [
        uf(0x82f),
        uf(0xd2f),
        uf(0x20d),
        uf(0x1f4),
        uf(0x7f4),
        uf(0xb0c),
        uf(0x8a3),
        uf(0xc22),
        uf(0xda3),
      ]);
    const fY = {};
    (fY[uf(0xcb5)] = uf(0x5ba)),
      (fY[uf(0x23a)] = [
        uf(0xa2b),
        uf(0xd06),
        uf(0xd62),
        uf(0x208),
        uf(0xafd),
        uf(0x807),
        uf(0x74d),
        uf(0x2e7),
      ]);
    const fZ = {};
    (fZ[uf(0xcb5)] = uf(0xb45)),
      (fZ[uf(0x23a)] = [
        uf(0x2d0),
        uf(0xa40),
        uf(0xa58),
        uf(0x385),
        uf(0x806),
        uf(0x7f7),
        uf(0x694),
        uf(0x432),
        uf(0x2f1),
      ]);
    const g0 = {};
    (g0[uf(0xcb5)] = uf(0xbe7)),
      (g0[uf(0x23a)] = [
        uf(0xb1c),
        uf(0x56b),
        uf(0xc76),
        uf(0x7f7),
        uf(0x540),
        uf(0x43e),
        uf(0x740),
        uf(0xda2),
        uf(0xbd5),
        uf(0x5aa),
        uf(0xc9b),
      ]);
    const g1 = {};
    (g1[uf(0xcb5)] = uf(0xbe7)),
      (g1[uf(0x23a)] = [uf(0x8ac), uf(0x4f9), uf(0xc75), uf(0xdb4), uf(0xab6)]);
    const g2 = {};
    (g2[uf(0xcb5)] = uf(0x5b8)), (g2[uf(0x23a)] = [uf(0x96a), uf(0xd0e)]);
    const g3 = {};
    (g3[uf(0xcb5)] = uf(0x7a7)), (g3[uf(0x23a)] = [uf(0x97c)]);
    const g4 = {};
    (g4[uf(0xcb5)] = uf(0xcb8)),
      (g4[uf(0x23a)] = [uf(0xc58), uf(0x713), uf(0x5b4), uf(0xc89)]);
    const g5 = {};
    (g5[uf(0xcb5)] = uf(0x912)),
      (g5[uf(0x23a)] = [uf(0xc51), uf(0x5bc), uf(0xb09), uf(0x18a)]);
    const g6 = {};
    (g6[uf(0xcb5)] = uf(0x912)),
      (g6[uf(0x23a)] = [
        uf(0x1dc),
        uf(0x16e),
        uf(0x315),
        uf(0x878),
        uf(0x804),
        uf(0x70c),
        uf(0x3a5),
        uf(0x9ca),
        uf(0x905),
        uf(0x495),
        uf(0xb91),
        uf(0x6b8),
        uf(0xc91),
        uf(0x3dc),
        uf(0x631),
        uf(0x17c),
        uf(0x856),
        uf(0x7db),
        uf(0x64e),
        uf(0x488),
      ]);
    const g7 = {};
    (g7[uf(0xcb5)] = uf(0x9f8)),
      (g7[uf(0x23a)] = [uf(0x922), uf(0xa9b), uf(0x477), uf(0x8c8)]);
    const g8 = {};
    (g8[uf(0xcb5)] = uf(0x758)),
      (g8[uf(0x23a)] = [uf(0xc32), uf(0xb3b), uf(0xcd1)]);
    const g9 = {};
    (g9[uf(0xcb5)] = uf(0x3e7)),
      (g9[uf(0x23a)] = [
        uf(0xd1),
        uf(0x8b1),
        uf(0xa37),
        uf(0x749),
        uf(0x4b1),
        uf(0x294),
        uf(0x6bf),
        uf(0xc34),
        uf(0x275),
        uf(0xf8),
        uf(0x73a),
        uf(0x3e9),
        uf(0x7d7),
        uf(0xb5f),
        uf(0x504),
      ]);
    const ga = {};
    (ga[uf(0xcb5)] = uf(0x3fd)), (ga[uf(0x23a)] = [uf(0x668), uf(0x925)]);
    const gb = {};
    (gb[uf(0xcb5)] = uf(0x58e)),
      (gb[uf(0x23a)] = [uf(0x448), uf(0x67e), uf(0xcd2)]);
    const gc = {};
    (gc[uf(0xcb5)] = uf(0x5d5)),
      (gc[uf(0x23a)] = [uf(0x5c6), uf(0xd29), uf(0xb0b)]);
    const gd = {};
    (gd[uf(0xcb5)] = uf(0x4be)),
      (gd[uf(0x23a)] = [uf(0x617), uf(0x2d4), uf(0x53a), uf(0x36b)]);
    const ge = {};
    (ge[uf(0xcb5)] = uf(0x221)),
      (ge[uf(0x23a)] = [uf(0x90d), uf(0x401), uf(0x3d2)]);
    const gf = {};
    (gf[uf(0xcb5)] = uf(0x2a6)),
      (gf[uf(0x23a)] = [
        uf(0x16e),
        uf(0x757),
        uf(0xa6f),
        uf(0x6fc),
        uf(0x27b),
        uf(0x68c),
        uf(0xbc4),
        uf(0x34c),
        uf(0x195),
        uf(0xbec),
        uf(0x600),
        uf(0xcac),
        uf(0x1a4),
        uf(0x2e5),
        uf(0x855),
        uf(0x2a0),
        uf(0x61e),
        uf(0x473),
        uf(0x421),
        uf(0xc64),
        uf(0x6fe),
        uf(0x9df),
        uf(0x485),
        uf(0xca1),
      ]);
    const gg = {};
    (gg[uf(0xcb5)] = uf(0x216)),
      (gg[uf(0x23a)] = [uf(0xcc4), uf(0x9b6), uf(0xd9f), uf(0x549)]);
    const gh = {};
    (gh[uf(0xcb5)] = uf(0x869)),
      (gh[uf(0x23a)] = [
        uf(0x704),
        uf(0xb34),
        uf(0x344),
        uf(0x16e),
        uf(0xc56),
        uf(0x2ce),
        uf(0x5eb),
        uf(0xb39),
      ]);
    const gi = {};
    (gi[uf(0xcb5)] = uf(0x509)),
      (gi[uf(0x23a)] = [
        uf(0x44c),
        uf(0xbef),
        uf(0x749),
        uf(0x927),
        uf(0x654),
        uf(0x80d),
        uf(0x1a7),
        uf(0x270),
        uf(0x5f4),
        uf(0xd33),
        uf(0x304),
        uf(0x538),
        uf(0x2f5),
        uf(0xe5),
        uf(0x476),
        uf(0xc0f),
        uf(0xc69),
      ]);
    const gj = {};
    (gj[uf(0xcb5)] = uf(0x3c2)),
      (gj[uf(0x23a)] = [
        uf(0xafb),
        uf(0xc4b),
        uf(0x530),
        uf(0x57a),
        uf(0xa14),
        uf(0x8a0),
        uf(0xc8f),
        uf(0x258),
        uf(0x21f),
        uf(0xbeb),
        uf(0x22e),
      ]);
    const gk = {};
    (gk[uf(0xcb5)] = uf(0x4d1)),
      (gk[uf(0x23a)] = [
        uf(0x501),
        uf(0x767),
        uf(0x35c),
        uf(0x568),
        uf(0x7b9),
        uf(0xb6c),
        uf(0x75c),
        uf(0x4bd),
        uf(0xd10),
        uf(0x756),
      ]);
    const gl = {};
    (gl[uf(0xcb5)] = uf(0x4d1)),
      (gl[uf(0x23a)] = [
        uf(0x8f7),
        uf(0xa05),
        uf(0x5e6),
        uf(0x77e),
        uf(0x8dc),
        uf(0x2bb),
        uf(0xc44),
        uf(0x55f),
        uf(0x298),
        uf(0x66c),
      ]);
    const gm = {};
    (gm[uf(0xcb5)] = uf(0xbe8)),
      (gm[uf(0x23a)] = [
        uf(0xe9),
        uf(0x9dc),
        uf(0x4e7),
        uf(0x87d),
        uf(0x64c),
        uf(0x63b),
        uf(0x3df),
        uf(0x9ef),
        uf(0x19e),
        uf(0x8af),
      ]);
    const gn = {};
    (gn[uf(0xcb5)] = uf(0xbe8)),
      (gn[uf(0x23a)] = [
        uf(0x8ac),
        uf(0x6bd),
        uf(0x93f),
        uf(0x33e),
        uf(0xc90),
        uf(0x278),
        uf(0x8f8),
        uf(0xd13),
        uf(0xbc0),
        uf(0x2cd),
        uf(0xdba),
      ]);
    const go = {};
    (go[uf(0xcb5)] = uf(0x873)),
      (go[uf(0x23a)] = [uf(0x6b3), uf(0xb67), uf(0xf3)]);
    const gp = {};
    (gp[uf(0xcb5)] = uf(0x873)),
      (gp[uf(0x23a)] = [
        uf(0xc84),
        uf(0x242),
        uf(0x42c),
        uf(0x5c3),
        uf(0xced),
        uf(0x54f),
        uf(0x6dd),
        uf(0x8a7),
      ]);
    const gq = {};
    (gq[uf(0xcb5)] = uf(0xb11)),
      (gq[uf(0x23a)] = [uf(0x9cb), uf(0x760), uf(0x416)]);
    const gr = {};
    (gr[uf(0xcb5)] = uf(0xb11)),
      (gr[uf(0x23a)] = [
        uf(0x31a),
        uf(0x248),
        uf(0xad3),
        uf(0x993),
        uf(0x74b),
        uf(0x326),
      ]);
    const gs = {};
    (gs[uf(0xcb5)] = uf(0xb11)),
      (gs[uf(0x23a)] = [uf(0xcfb), uf(0x23d), uf(0xa5d), uf(0x203)]);
    const gt = {};
    (gt[uf(0xcb5)] = uf(0xb11)),
      (gt[uf(0x23a)] = [
        uf(0x2fc),
        uf(0x381),
        uf(0x467),
        uf(0x345),
        uf(0x3b4),
        uf(0xb31),
        uf(0xab7),
        uf(0x69f),
        uf(0x1d6),
        uf(0x167),
        uf(0xa00),
      ]);
    const gu = {};
    (gu[uf(0xcb5)] = uf(0xc39)),
      (gu[uf(0x23a)] = [uf(0x36e), uf(0xd4f), uf(0x329)]);
    const gv = {};
    (gv[uf(0xcb5)] = uf(0x230)),
      (gv[uf(0x23a)] = [
        uf(0xacc),
        uf(0xcbc),
        uf(0x248),
        uf(0x297),
        uf(0xd8),
        uf(0xbba),
        uf(0xd24),
        uf(0xac0),
        uf(0x5a7),
        uf(0x8f5),
        uf(0xbda),
        uf(0x82c),
        uf(0x749),
        uf(0xc2d),
        uf(0x561),
        uf(0x8e3),
        uf(0x906),
        uf(0x577),
        uf(0x981),
        uf(0xa7a),
        uf(0x6e9),
        uf(0x812),
        uf(0xb49),
        uf(0x158),
        uf(0x7b4),
        uf(0xacd),
        uf(0x653),
        uf(0x3ff),
        uf(0xb28),
        uf(0xd0c),
        uf(0x26a),
        uf(0x70f),
        uf(0x77d),
        uf(0xcec),
      ]);
    const gw = {};
    (gw[uf(0xcb5)] = uf(0x786)), (gw[uf(0x23a)] = [uf(0x69b)]);
    const gx = {};
    (gx[uf(0xcb5)] = uf(0x487)),
      (gx[uf(0x23a)] = [
        uf(0x91a),
        uf(0x6a0),
        uf(0x14d),
        uf(0x596),
        uf(0xaa7),
        uf(0x5b1),
        uf(0x31f),
        uf(0x749),
        uf(0x59c),
        uf(0xdcb),
        uf(0xbe2),
        uf(0x8b4),
        uf(0xad6),
        uf(0x276),
        uf(0x515),
        uf(0x76f),
        uf(0xd90),
        uf(0xb96),
        uf(0xd79),
        uf(0xf6),
        uf(0x309),
        uf(0xab3),
        uf(0x357),
        uf(0xdc4),
        uf(0x92a),
        uf(0x64b),
        uf(0xbfc),
        uf(0x263),
        uf(0x2b8),
        uf(0x9f7),
        uf(0x70f),
        uf(0xbcb),
        uf(0x4cf),
        uf(0x7cb),
        uf(0xc33),
      ]);
    const gy = {};
    (gy[uf(0xcb5)] = uf(0xa1e)),
      (gy[uf(0x23a)] = [
        uf(0xba1),
        uf(0x65b),
        uf(0x950),
        uf(0x80c),
        uf(0x6bb),
        uf(0x1c2),
        uf(0x749),
        uf(0xb32),
        uf(0x521),
        uf(0x9d0),
        uf(0x6cc),
        uf(0xac9),
        uf(0xdb5),
        uf(0x119),
        uf(0xb6b),
        uf(0x305),
        uf(0x94f),
        uf(0xba2),
        uf(0xd63),
        uf(0x37b),
        uf(0x1a8),
        uf(0xd90),
        uf(0xbde),
        uf(0xa8b),
        uf(0xb07),
        uf(0x7e3),
        uf(0x58b),
        uf(0x62e),
        uf(0x200),
        uf(0x4a6),
        uf(0x250),
        uf(0xc6a),
        uf(0xad2),
        uf(0xb54),
        uf(0x70f),
        uf(0x9c8),
        uf(0x930),
        uf(0x793),
        uf(0x6e6),
      ]);
    const gz = {};
    (gz[uf(0xcb5)] = uf(0x6cd)),
      (gz[uf(0x23a)] = [
        uf(0x341),
        uf(0x508),
        uf(0x70f),
        uf(0x21c),
        uf(0x44e),
        uf(0xbe6),
        uf(0xd91),
        uf(0xc62),
        uf(0x37a),
        uf(0x749),
        uf(0x3a3),
        uf(0x6f9),
        uf(0x356),
        uf(0x50c),
      ]);
    const gA = {};
    (gA[uf(0xcb5)] = uf(0x1c1)),
      (gA[uf(0x23a)] = [uf(0xc48), uf(0x168), uf(0x5fd), uf(0xb47), uf(0x574)]);
    const gB = {};
    (gB[uf(0xcb5)] = uf(0xa6e)),
      (gB[uf(0x23a)] = [uf(0x962), uf(0x77a), uf(0x9e8), uf(0x8d5)]);
    const gC = {};
    (gC[uf(0xcb5)] = uf(0xa6e)),
      (gC[uf(0x23a)] = [uf(0x248), uf(0x1b1), uf(0xbf2)]);
    const gD = {};
    (gD[uf(0xcb5)] = uf(0x674)),
      (gD[uf(0x23a)] = [uf(0x328), uf(0x522), uf(0x34d), uf(0xb88), uf(0x441)]);
    const gE = {};
    (gE[uf(0xcb5)] = uf(0x674)),
      (gE[uf(0x23a)] = [uf(0x780), uf(0x5bd), uf(0xa19), uf(0x57d)]);
    const gF = {};
    (gF[uf(0xcb5)] = uf(0x674)), (gF[uf(0x23a)] = [uf(0x54b), uf(0x952)]);
    const gG = {};
    (gG[uf(0xcb5)] = uf(0x5d4)),
      (gG[uf(0x23a)] = [
        uf(0xbb4),
        uf(0x4d2),
        uf(0xcd8),
        uf(0x33f),
        uf(0x9ce),
        uf(0x62f),
        uf(0x25b),
        uf(0x42a),
        uf(0xd34),
      ]);
    const gH = {};
    (gH[uf(0xcb5)] = uf(0x59f)),
      (gH[uf(0x23a)] = [
        uf(0xbd8),
        uf(0x132),
        uf(0x92f),
        uf(0x1d3),
        uf(0xcab),
        uf(0x33a),
        uf(0x1fc),
      ]);
    const gI = {};
    (gI[uf(0xcb5)] = uf(0x115)),
      (gI[uf(0x23a)] = [
        uf(0xaaf),
        uf(0x7d0),
        uf(0xd67),
        uf(0x116),
        uf(0x43d),
        uf(0x2ff),
        uf(0x599),
        uf(0xc4d),
        uf(0xa4e),
        uf(0x4db),
        uf(0xc7f),
        uf(0xbaf),
      ]);
    const gJ = {};
    (gJ[uf(0xcb5)] = uf(0x60d)),
      (gJ[uf(0x23a)] = [
        uf(0xafa),
        uf(0x591),
        uf(0x907),
        uf(0x98a),
        uf(0xd8d),
        uf(0x964),
        uf(0x4b6),
        uf(0x374),
        uf(0x194),
        uf(0xdd5),
      ]);
    const gK = {};
    (gK[uf(0xcb5)] = uf(0x60d)),
      (gK[uf(0x23a)] = [
        uf(0xa89),
        uf(0x777),
        uf(0xaea),
        uf(0x361),
        uf(0x9a6),
        uf(0x5c5),
      ]);
    const gL = {};
    (gL[uf(0xcb5)] = uf(0x7a0)),
      (gL[uf(0x23a)] = [uf(0x5a3), uf(0x282), uf(0x69e)]);
    const gM = {};
    (gM[uf(0xcb5)] = uf(0x7a0)),
      (gM[uf(0x23a)] = [uf(0x248), uf(0x5db), uf(0xbf5), uf(0x889), uf(0x926)]);
    const gN = {};
    (gN[uf(0xcb5)] = uf(0x434)),
      (gN[uf(0x23a)] = [
        uf(0xd9a),
        uf(0x293),
        uf(0x81c),
        uf(0xb43),
        uf(0x39c),
        uf(0x6c6),
        uf(0x70f),
        uf(0x26c),
        uf(0x512),
        uf(0xd56),
        uf(0x274),
        uf(0x9fa),
        uf(0x749),
        uf(0x497),
        uf(0x8d8),
        uf(0x52a),
        uf(0x382),
        uf(0x4cb),
        uf(0xd80),
      ]);
    const gO = {};
    (gO[uf(0xcb5)] = uf(0x33b)),
      (gO[uf(0x23a)] = [
        uf(0x4a7),
        uf(0x7ec),
        uf(0x705),
        uf(0x866),
        uf(0x375),
        uf(0x5df),
        uf(0x351),
        uf(0x231),
      ]);
    const gP = {};
    (gP[uf(0xcb5)] = uf(0x33b)), (gP[uf(0x23a)] = [uf(0x810), uf(0x164)]);
    const gQ = {};
    (gQ[uf(0xcb5)] = uf(0x90f)), (gQ[uf(0x23a)] = [uf(0xae1), uf(0x4d9)]);
    const gR = {};
    (gR[uf(0xcb5)] = uf(0x90f)),
      (gR[uf(0x23a)] = [
        uf(0x89d),
        uf(0x93a),
        uf(0x362),
        uf(0xc07),
        uf(0x10c),
        uf(0x11b),
        uf(0x130),
        uf(0xd09),
        uf(0x78f),
      ]);
    const gS = {};
    (gS[uf(0xcb5)] = uf(0x4f3)), (gS[uf(0x23a)] = [uf(0x526), uf(0x6d7)]);
    const gT = {};
    (gT[uf(0xcb5)] = uf(0x4f3)),
      (gT[uf(0x23a)] = [
        uf(0xafc),
        uf(0x833),
        uf(0xaf8),
        uf(0xace),
        uf(0x4aa),
        uf(0x750),
        uf(0xae5),
        uf(0x248),
        uf(0x3b5),
      ]);
    const gU = {};
    (gU[uf(0xcb5)] = uf(0x9a7)), (gU[uf(0x23a)] = [uf(0x280)]);
    const gV = {};
    (gV[uf(0xcb5)] = uf(0x9a7)),
      (gV[uf(0x23a)] = [
        uf(0x2e8),
        uf(0xb77),
        uf(0xc04),
        uf(0x525),
        uf(0x248),
        uf(0x619),
        uf(0xb0a),
      ]);
    const gW = {};
    (gW[uf(0xcb5)] = uf(0x9a7)),
      (gW[uf(0x23a)] = [uf(0xc1d), uf(0x628), uf(0x7fe)]);
    const gX = {};
    (gX[uf(0xcb5)] = uf(0x6f5)),
      (gX[uf(0x23a)] = [uf(0x3b5), uf(0x2ca), uf(0xd37), uf(0x6e0)]);
    const gY = {};
    (gY[uf(0xcb5)] = uf(0x6f5)), (gY[uf(0x23a)] = [uf(0x376)]);
    const gZ = {};
    (gZ[uf(0xcb5)] = uf(0x6f5)),
      (gZ[uf(0x23a)] = [uf(0xd07), uf(0x643), uf(0xb95), uf(0x820), uf(0xb2c)]);
    const h0 = {};
    (h0[uf(0xcb5)] = uf(0x58c)),
      (h0[uf(0x23a)] = [uf(0x71a), uf(0x1a6), uf(0x4f4)]);
    const h1 = {};
    (h1[uf(0xcb5)] = uf(0x5d9)), (h1[uf(0x23a)] = [uf(0x6b6), uf(0x2e6)]);
    const h2 = {};
    (h2[uf(0xcb5)] = uf(0x368)), (h2[uf(0x23a)] = [uf(0xbac), uf(0x1a3)]);
    const h3 = {};
    (h3[uf(0xcb5)] = uf(0x39d)), (h3[uf(0x23a)] = [uf(0x86a)]);
    var h4 = [
      fd(uf(0xadf)),
      fd(uf(0xb89)),
      fd(uf(0x5fb)),
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
    console[uf(0xabc)](uf(0x1f7));
    var h5 = Date[uf(0x603)]() < 0x18e9c4b6482,
      h6 = Math[uf(0xa9a)](Math[uf(0xb03)]() * 0xa);
    function h7(ra) {
      const uC = uf,
        rb = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let rc = "";
      for (const rd of ra) {
        rd === "\x20"
          ? (rc += "\x20")
          : (rc += rb[(h6 + rd[uC(0x96f)](0x0)) % rb[uC(0xbc8)]]);
      }
      return rc;
    }
    h5 &&
      document[uf(0xa10)](uf(0xa28))[uf(0x491)](
        uf(0x6f2),
        h7(uf(0xb7e)) + uf(0x83f)
      );
    function h8(ra, rb, rc) {
      const uD = uf,
        rd = rb - ra;
      if (Math[uD(0x71b)](rd) < 0.01) return rb;
      return ra + rd * (0x1 - Math[uD(0x680)](-rc * pB));
    }
    var h9 = [],
      ha = 0x0;
    function hb(ra, rb = 0x1388) {
      const uE = uf,
        rc = nA(uE(0x4d7) + jw(ra) + uE(0x38b));
      kH[uE(0xd58)](rc);
      let rd = 0x0;
      re();
      function re() {
        const uF = uE;
        (rc[uF(0x397)][uF(0x99f)] = uF(0x35f) + ha + uF(0xac8)),
          (rc[uF(0x397)][uF(0x894)] = rd);
      }
      (this[uE(0x3d9)] = ![]),
        (this[uE(0x8ee)] = () => {
          const uG = uE;
          rb -= pA;
          const rf = rb > 0x0 ? 0x1 : 0x0;
          (rd = h8(rd, rf, 0.3)),
            re(),
            rb < 0x0 &&
              rd <= 0x0 &&
              (rc[uG(0xa5a)](), (this[uG(0x3d9)] = !![])),
            (ha += rd * (rc[uG(0x4e3)] + 0x5));
        }),
        h9[uE(0x6aa)](this);
    }
    function hc(ra) {
      new hb(ra, 0x1388);
    }
    function hd() {
      const uH = uf;
      ha = 0x0;
      for (let ra = h9[uH(0xbc8)] - 0x1; ra >= 0x0; ra--) {
        const rb = h9[ra];
        rb[uH(0x8ee)](), rb[uH(0x3d9)] && h9[uH(0xb41)](ra, 0x1);
      }
    }
    var he = !![],
      hf = document[uf(0xa10)](uf(0x3e3));
    fetch(uf(0x9c9))
      [uf(0xb51)]((ra) => {
        const uI = uf;
        (hf[uI(0x397)][uI(0x373)] = uI(0x972)), (he = ![]);
      })
      [uf(0xbc9)]((ra) => {
        const uJ = uf;
        hf[uJ(0x397)][uJ(0x373)] = "";
      });
    var hg = document[uf(0xa10)](uf(0x896)),
      hh = Date[uf(0x603)]();
    function hi() {
      const uK = uf;
      console[uK(0xabc)](uK(0x46a)),
        (hh = Date[uK(0x603)]()),
        (hg[uK(0x397)][uK(0x373)] = "");
      try {
        aiptag[uK(0x1aa)][uK(0x373)][uK(0x6aa)](function () {
          const uL = uK;
          aipDisplayTag[uL(0x373)](uL(0xb1d));
        }),
          aiptag[uK(0x1aa)][uK(0x373)][uK(0x6aa)](function () {
            const uM = uK;
            aipDisplayTag[uM(0x373)](uM(0x2c7));
          });
      } catch (ra) {
        console[uK(0xabc)](uK(0x5ef));
      }
    }
    setInterval(function () {
      const uN = uf;
      hg[uN(0x397)][uN(0x373)] === "" &&
        Date[uN(0x603)]() - hh > 0x7530 &&
        hi();
    }, 0x2710);
    var hj = null,
      hk = 0x0;
    function hl() {
      const uO = uf;
      console[uO(0xabc)](uO(0xae4)),
        typeof aiptag[uO(0xd1b)] !== uO(0x458)
          ? ((hj = 0x45),
            (hk = Date[uO(0x603)]()),
            aiptag[uO(0x1aa)][uO(0xa9e)][uO(0x6aa)](function () {
              const uP = uO;
              aiptag[uP(0xd1b)][uP(0xd2a)]();
            }))
          : window[uO(0x460)](uO(0x212));
    }
    window[uf(0x460)] = function (ra) {
      const uQ = uf;
      console[uQ(0xabc)](uQ(0xd3e) + ra);
      if (ra === uQ(0x8e8) || ra[uQ(0xbf1)](uQ(0xb8a)) > -0x1) {
        if (hj !== null && Date[uQ(0x603)]() - hk > 0xbb8) {
          console[uQ(0xabc)](uQ(0xb90));
          if (hW) {
            const rb = {};
            (rb[uQ(0xcb5)] = uQ(0xa69)),
              (rb[uQ(0x554)] = ![]),
              kI(
                uQ(0x2bc),
                (rc) => {
                  const uR = uQ;
                  rc &&
                    hW &&
                    (il(new Uint8Array([cI[uR(0xa7c)]])), hK(uR(0xab1)));
                },
                rb
              );
          }
        } else hK(uQ(0xce1));
      } else alert(uQ(0xb30) + ra);
      hm[uQ(0x474)][uQ(0xa5a)](uQ(0x415)), (hj = null);
    };
    var hm = document[uf(0xa10)](uf(0xcb6));
    (hm[uf(0xc3)] = function () {
      const uS = uf;
      hm[uS(0x474)][uS(0x1b0)](uS(0x415)), hl();
    }),
      (hm[uf(0xbca)] = function () {
        const uT = uf;
        return nA(
          uT(0xbb7) + hP[uT(0xcd9)] + uT(0xc63) + hP[uT(0x25e)] + uT(0xc8b)
        );
      }),
      (hm[uf(0xc6b)] = !![]);
    var hn = [
        uf(0x726),
        uf(0x82a),
        uf(0xada),
        uf(0xd5b),
        uf(0xae7),
        uf(0xab4),
        uf(0x5c4),
        uf(0x35d),
        uf(0x825),
        uf(0xc8),
        uf(0x4d5),
        uf(0x799),
      ],
      ho = document[uf(0xa10)](uf(0x8b7)),
      hp =
        Date[uf(0x603)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[uf(0xa9a)](Math[uf(0xb03)]() * hn[uf(0xbc8)]);
    hr();
    function hq(ra) {
      const uU = uf;
      (hp += ra),
        hp < 0x0 ? (hp = hn[uU(0xbc8)] - 0x1) : (hp %= hn[uU(0xbc8)]),
        hr();
    }
    function hr() {
      const uV = uf,
        ra = hn[hp];
      (ho[uV(0x397)][uV(0x632)] =
        uV(0x127) + ra[uV(0x1cf)](uV(0x70d))[0x1] + uV(0x87a)),
        (ho[uV(0xc3)] = function () {
          const uW = uV;
          window[uW(0x996)](ra, uW(0x1e9)), hq(0x1);
        });
    }
    (document[uf(0xa10)](uf(0xd6))[uf(0xc3)] = function () {
      hq(-0x1);
    }),
      (document[uf(0xa10)](uf(0x4fd))[uf(0xc3)] = function () {
        hq(0x1);
      });
    var hs = document[uf(0xa10)](uf(0x581));
    hs[uf(0xbca)] = function () {
      const uX = uf;
      return nA(
        uX(0xbb7) + hP[uX(0xcd9)] + uX(0xce0) + hP[uX(0x409)] + uX(0x4fa)
      );
    };
    var ht = document[uf(0xa10)](uf(0x8cc)),
      hu = document[uf(0xa10)](uf(0xabd)),
      hv = ![];
    function hw() {
      const uY = uf;
      let ra = "";
      for (let rc = 0x0; rc < h4[uY(0xbc8)]; rc++) {
        const { title: rd, content: re } = h4[rc];
        (ra += uY(0xe7) + rd + uY(0x541)),
          re[uY(0x4a2)]((rf, rg) => {
            const uZ = uY;
            let rh = "-\x20";
            if (rf[0x0] === "*") {
              const ri = rf[rg + 0x1];
              if (ri && ri[0x0] === "*") rh = uZ(0x219);
              else rh = uZ(0x1c5);
              rf = rf[uZ(0x4e2)](0x1);
            }
            (rf = rh + rf), (ra += uZ(0x8db) + rf + uZ(0xc02));
          }),
          (ra += uY(0x3ab));
      }
      const rb = hD[uY(0x9f5)];
      (hv = rb !== void 0x0 && parseInt(rb) < fc), (ht[uY(0xd6e)] = ra);
    }
    CanvasRenderingContext2D[uf(0xce7)][uf(0x5b0)] = function (ra) {
      const v0 = uf;
      this[v0(0x6ff)](ra, ra);
    };
    var hx = ![];
    hx &&
      (OffscreenCanvasRenderingContext2D[uf(0xce7)][uf(0x5b0)] = function (ra) {
        const v1 = uf;
        this[v1(0x6ff)](ra, ra);
      });
    function hy(ra, rb, rc) {
      const rd = 0x1 - rc;
      return [
        ra[0x0] * rc + rb[0x0] * rd,
        ra[0x1] * rc + rb[0x1] * rd,
        ra[0x2] * rc + rb[0x2] * rd,
      ];
    }
    var hz = {};
    function hA(ra) {
      const v2 = uf;
      return (
        !hz[ra] &&
          (hz[ra] = [
            parseInt(ra[v2(0x4e2)](0x1, 0x3), 0x10),
            parseInt(ra[v2(0x4e2)](0x3, 0x5), 0x10),
            parseInt(ra[v2(0x4e2)](0x5, 0x7), 0x10),
          ]),
        hz[ra]
      );
    }
    var hB = document[uf(0x966)](uf(0x5e9)),
      hC = document[uf(0x5fc)](uf(0x969));
    for (let ra = 0x0; ra < hC[uf(0xbc8)]; ra++) {
      const rb = hC[ra],
        rc = f9[rb[uf(0x160)](uf(0x2d3))];
      rc && rb[uf(0x393)](nA(rc), rb[uf(0x8c1)][0x0]);
    }
    var hD;
    try {
      hD = localStorage;
    } catch (rd) {
      console[uf(0x67d)](uf(0xd52), rd), (hD = {});
    }
    var hE = document[uf(0xa10)](uf(0x8ec)),
      hF = document[uf(0xa10)](uf(0x6e5)),
      hG = document[uf(0xa10)](uf(0xaeb));
    (hE[uf(0xbca)] = function () {
      const v3 = uf;
      return nA(
        v3(0x9e5) + hP[v3(0x970)] + v3(0xc3a) + cN + v3(0x995) + cM + v3(0xcf6)
      );
    }),
      (hF[uf(0x672)] = cM),
      (hF[uf(0x1d7)] = function () {
        const v4 = uf;
        !cO[v4(0x7a5)](this[v4(0x94c)]) &&
          (this[v4(0x94c)] = this[v4(0x94c)][v4(0x516)](cP, ""));
      });
    var hH,
      hI = document[uf(0xa10)](uf(0x6ca));
    function hJ(re) {
      const v5 = uf;
      re ? k8(hI, re + v5(0x295)) : k8(hI, v5(0xd38)),
        (hE[v5(0x397)][v5(0x373)] =
          re && re[v5(0xbf1)]("\x20") === -0x1 ? v5(0x972) : "");
    }
    hG[uf(0xc3)] = ng(function () {
      const v6 = uf;
      if (!hW || jy) return;
      const re = hF[v6(0x94c)],
        rf = re[v6(0xbc8)];
      if (rf < cN) hc(v6(0xaa0));
      else {
        if (rf > cM) hc(v6(0x4bc));
        else {
          if (!cO[v6(0x7a5)](re)) hc(v6(0x301));
          else {
            hc(v6(0x8dd), hP[v6(0x409)]), (hH = re);
            const rg = new Uint8Array([
              cI[v6(0x228)],
              ...new TextEncoder()[v6(0x6a7)](re),
            ]);
            il(rg);
          }
        }
      }
    });
    function hK(re, rf = n3[uf(0x126)]) {
      n6(-0x1, null, re, rf);
    }
    hw();
    var hL = f4(cR),
      hM = f4(cS),
      hN = f4(d9);
    const hO = {};
    (hO[uf(0x970)] = uf(0x9bb)),
      (hO[uf(0x409)] = uf(0xd21)),
      (hO[uf(0x163)] = uf(0x354)),
      (hO[uf(0x788)] = uf(0x980)),
      (hO[uf(0x284)] = uf(0xd76)),
      (hO[uf(0x25e)] = uf(0xdc6)),
      (hO[uf(0xcd9)] = uf(0x490)),
      (hO[uf(0xb6e)] = uf(0x867)),
      (hO[uf(0x602)] = uf(0xb97));
    var hP = hO,
      hQ = Object[uf(0x1be)](hP),
      hR = [];
    for (let re = 0x0; re < hQ[uf(0xbc8)]; re++) {
      const rf = hQ[re],
        rg = rf[uf(0x4e2)](0x4, rf[uf(0xbf1)](")"))
          [uf(0x1cf)](",\x20")
          [uf(0x2f3)]((rh) => parseInt(rh) * 0.8);
      hR[uf(0x6aa)](pL(rg));
    }
    hS(uf(0x1bf), uf(0x7fb)),
      hS(uf(0x380), uf(0x607)),
      hS(uf(0x18c), uf(0x9a8)),
      hS(uf(0x639), uf(0xbbb)),
      hS(uf(0xdbb), uf(0x3e2)),
      hS(uf(0x8d1), uf(0x198)),
      hS(uf(0x943), uf(0xb53));
    function hS(rh, ri) {
      const v7 = uf;
      document[v7(0xa10)](rh)[v7(0xc3)] = function () {
        const v8 = v7;
        window[v8(0x996)](ri, v8(0x1e9));
      };
    }
    setInterval(function () {
      const v9 = uf;
      hW && il(new Uint8Array([cI[v9(0xd2b)]]));
    }, 0x3e8);
    function hT() {
      const va = uf;
      (px = [pE]),
        (j6[va(0x2c3)] = !![]),
        (j6 = {}),
        (jG = 0x0),
        (jH[va(0xbc8)] = 0x0),
        (iw = []),
        (iG[va(0xbc8)] = 0x0),
        (iC[va(0xd6e)] = ""),
        (iv = {}),
        (iH = ![]),
        (iy = null),
        (ix = null),
        (pn = 0x0),
        (hW = ![]),
        (mn = 0x0),
        (mm = 0x0),
        (m9 = ![]),
        (m5[va(0x397)][va(0x373)] = va(0x972)),
        (pP[va(0x397)][va(0x373)] = pO[va(0x397)][va(0x373)] = va(0x972)),
        (pl = 0x0),
        (pm = 0x0);
    }
    var hU;
    function hV(rh) {
      const vb = uf;
      (jh[vb(0x397)][vb(0x373)] = vb(0x972)),
        (p2[vb(0x397)][vb(0x373)] = vb(0x972)),
        hZ(),
        kA[vb(0x474)][vb(0x1b0)](vb(0x9b3)),
        kB[vb(0x474)][vb(0xa5a)](vb(0x9b3)),
        hT(),
        console[vb(0xabc)](vb(0x8be) + rh + vb(0x8ea)),
        iu(),
        (hU = new WebSocket(rh)),
        (hU[vb(0x5f0)] = vb(0x5bf)),
        (hU[vb(0xc08)] = hX),
        (hU[vb(0xb48)] = k1),
        (hU[vb(0x830)] = kg);
    }
    crypto[uf(0xc5c)] =
      crypto[uf(0xc5c)] ||
      function rh() {
        const vc = uf;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vc(0x516)
        ](/[018]/g, (ri) =>
          (ri ^
            (crypto[vc(0x8c0)](new Uint8Array(0x1))[0x0] &
              (0xf >> (ri / 0x4))))[vc(0x12a)](0x10)
        );
      };
    var hW = ![];
    function hX() {
      const vd = uf;
      console[vd(0xabc)](vd(0x974)), ie();
      hack.preload();
    }
    var hY = document[uf(0xa10)](uf(0x968));
    function hZ() {
      const ve = uf;
      hY[ve(0x397)][ve(0x373)] = ve(0x972);
    }
    var i0 = document[uf(0xa10)](uf(0x312)),
      i1 = document[uf(0xa10)](uf(0x2e1)),
      i2 = document[uf(0xa10)](uf(0x1c0)),
      i3 = document[uf(0xa10)](uf(0x24d));
    i3[uf(0xc3)] = function () {
      const vf = uf;
      !i6 &&
        (window[vf(0x3c5)][vf(0xa08)] =
          vf(0x54d) +
          encodeURIComponent(!window[vf(0x99c)] ? vf(0x45c) : vf(0x79f)) +
          vf(0x613) +
          encodeURIComponent(btoa(i5)));
    };
    var i4 = document[uf(0xa10)](uf(0xcb1));
    (i4[uf(0xc3)] = function () {
      const vg = uf;
      i5 == hD[vg(0xb19)] && delete hD[vg(0xb19)];
      delete hD[vg(0x9ec)];
      if (hU)
        try {
          hU[vg(0xc1c)]();
        } catch (ri) {}
    }),
      hZ();
    var i5, i6;
    function i7(ri) {
      const vi = uf;
      try {
        let rk = function (rl) {
          const vh = b;
          return rl[vh(0x516)](/([.*+?\^$(){}|\[\]\/\\])/g, vh(0x199));
        };
        var rj = document[vi(0x44b)][vi(0xa94)](
          RegExp(vi(0x5da) + rk(ri) + vi(0x7ae))
        );
        return rj ? rj[0x1] : null;
      } catch (rl) {
        return "";
      }
    }
    var i8 = !window[uf(0x99c)];
    function i9(ri) {
      const vj = uf;
      try {
        document[vj(0x44b)] = ri + vj(0x7d9) + (i8 ? vj(0x65d) : "");
      } catch (rj) {}
    }
    var ia = 0x0,
      ib;
    function ic() {
      const vk = uf;
      (ia = 0x0), (hW = ![]);
      !eV(hD[vk(0xb19)]) && (hD[vk(0xb19)] = crypto[vk(0xc5c)]());
      (i5 = hD[vk(0xb19)]), (i6 = hD[vk(0x9ec)]);
      !i6 &&
        ((i6 = i7(vk(0x9ec))),
        i6 && (i6 = decodeURIComponent(i6)),
        i9(vk(0x9ec)));
      if (i6)
        try {
          const ri = i6;
          i6 = JSON[vk(0x681)](decodeURIComponent(escape(atob(ri))));
          if (eV(i6[vk(0x9c0)]))
            (i5 = i6[vk(0x9c0)]),
              i1[vk(0x491)](vk(0x6f2), i6[vk(0x9ed)]),
              i6[vk(0x2ef)] &&
                (i2[vk(0x397)][vk(0x632)] = vk(0xc99) + i6[vk(0x2ef)] + ")"),
              (hD[vk(0x9ec)] = ri);
          else throw new Error(vk(0x402));
        } catch (rj) {
          (i6 = null), delete hD[vk(0x9ec)], console[vk(0x126)](vk(0xae2) + rj);
        }
      ib = hD[vk(0xc1f)] || "";
    }
    function ie() {
      ic(), ii();
    }
    function ig() {
      const vl = uf,
        ri = [
          vl(0xa55),
          vl(0xd6f),
          vl(0x8c3),
          vl(0xd23),
          vl(0x406),
          vl(0xd55),
          vl(0xdcc),
          vl(0xaab),
          vl(0xd7c),
          vl(0xa57),
          vl(0xb04),
          vl(0x3a9),
          vl(0x211),
          vl(0x61c),
          vl(0x994),
          vl(0xd78),
          vl(0x22f),
          vl(0x222),
          vl(0x5d0),
          vl(0xb4e),
          vl(0x2af),
          vl(0x277),
          vl(0x5f6),
          vl(0x3e6),
          vl(0xc5e),
          vl(0x892),
          vl(0x5dc),
          vl(0x267),
          vl(0x7fd),
          vl(0x1a1),
          vl(0x444),
          vl(0xa70),
          vl(0xba3),
          vl(0x7bc),
          vl(0x9c1),
          vl(0x3c3),
          vl(0xa68),
          vl(0x553),
          vl(0x3b8),
          vl(0x456),
          vl(0x4ae),
          vl(0x7aa),
          vl(0xea),
          vl(0x7d5),
          vl(0x332),
          vl(0x60e),
          vl(0x4bb),
          vl(0xb7a),
          vl(0x2b2),
          vl(0x145),
          vl(0x822),
          vl(0xa0a),
          vl(0xc77),
          vl(0xab9),
          vl(0x202),
          vl(0xb8d),
          vl(0x449),
          vl(0xd3d),
          vl(0x110),
          vl(0x711),
          vl(0x4bf),
          vl(0x3c4),
          vl(0xa96),
          vl(0xce9),
        ];
      return (
        (ig = function () {
          return ri;
        }),
        ig()
      );
    }
    function ih(ri, rj) {
      const rk = ig();
      return (
        (ih = function (rl, rm) {
          const vm = b;
          rl = rl - (0x67c * -0x1 + -0x2 * -0xbdd + -0x5 * 0x35b);
          let rn = rk[rl];
          if (ih[vm(0x418)] === void 0x0) {
            var ro = function (rt) {
              const vn = vm,
                ru = vn(0xb38);
              let rv = "",
                rw = "";
              for (
                let rx = 0xc6a + -0x161c + -0x22 * -0x49,
                  ry,
                  rz,
                  rA = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rz = rt[vn(0xc13)](rA++));
                ~rz &&
                ((ry =
                  rx % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? ry * (0x2422 + -0x5 * 0x38b + -0x122b) + rz
                    : rz),
                rx++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rv += String[vn(0x7da)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (ry >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rx) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rz = ru[vn(0xbf1)](rz);
              }
              for (
                let rB = 0x23d0 + 0x13 * -0xdf + -0x1343, rC = rv[vn(0xbc8)];
                rB < rC;
                rB++
              ) {
                rw +=
                  "%" +
                  ("00" +
                    rv[vn(0x96f)](rB)[vn(0x12a)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vn(0x4e2)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
              }
              return decodeURIComponent(rw);
            };
            const rs = function (rt, ru) {
              const vo = vm;
              let rv = [],
                rw = -0x3 * 0x542 + -0x7d7 * 0x3 + 0x274b,
                rx,
                ry = "";
              rt = ro(rt);
              let rz;
              for (
                rz = 0x2205 + 0x3ac + -0x1 * 0x25b1;
                rz < 0x1e33 + 0x1 * -0x181 + -0x5 * 0x58a;
                rz++
              ) {
                rv[rz] = rz;
              }
              for (
                rz = 0x91f * 0x4 + -0x554 + -0x1 * 0x1f28;
                rz < 0x2e * 0x43 + 0x12 * 0xc5 + -0x84c * 0x3;
                rz++
              ) {
                (rw =
                  (rw + rv[rz] + ru[vo(0x96f)](rz % ru[vo(0xbc8)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rx = rv[rz]),
                  (rv[rz] = rv[rw]),
                  (rv[rw] = rx);
              }
              (rz = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rw = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rA = -0x1d30 + -0x23c8 + 0x40f8;
                rA < rt[vo(0xbc8)];
                rA++
              ) {
                (rz =
                  (rz + (0x2309 * -0x1 + 0x5 * -0x8b + -0x1 * -0x25c1)) %
                  (0xc5 * -0x1d + -0x1f03 + 0x3654)),
                  (rw =
                    (rw + rv[rz]) %
                    (-0x5 * -0x256 + 0x1cf * 0x2 + -0x1e * 0x7a)),
                  (rx = rv[rz]),
                  (rv[rz] = rv[rw]),
                  (rv[rw] = rx),
                  (ry += String[vo(0x7da)](
                    rt[vo(0x96f)](rA) ^
                      rv[(rv[rz] + rv[rw]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return ry;
            };
            (ih[vm(0x8e5)] = rs), (ri = arguments), (ih[vm(0x418)] = !![]);
          }
          const rp = rk[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rq = rl + rp,
            rr = ri[rq];
          return (
            !rr
              ? (ih[vm(0xae6)] === void 0x0 && (ih[vm(0xae6)] = !![]),
                (rn = ih[vm(0x8e5)](rn, rm)),
                (ri[rq] = rn))
              : (rn = rr),
            rn
          );
        }),
        ih(ri, rj)
      );
    }
    (function (ri, rj) {
      const vp = uf;
      function rk(rq, rr, rs, rt, ru) {
        return ih(rt - 0x124, ru);
      }
      function rl(rq, rr, rs, rt, ru) {
        return ih(rr - -0x245, rq);
      }
      function rm(rq, rr, rs, rt, ru) {
        return ih(ru - -0x1b4, rt);
      }
      function rn(rq, rr, rs, rt, ru) {
        return ih(rq - 0x13, rt);
      }
      const ro = ri();
      function rp(rq, rr, rs, rt, ru) {
        return ih(rs - -0x2b3, ru);
      }
      while (!![]) {
        try {
          const rq =
            (parseInt(rk(0x1a1, 0x1b2, 0x1a9, 0x1b7, vp(0x37e))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rm(-0x105, -0x12e, -0x131, vp(0x37e), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(rk(0x1b5, 0x1c9, 0x1b1, 0x1cb, vp(0xca9))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rm(-0x128, -0x132, -0x134, vp(0xb74), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rm(-0x131, -0x155, -0x130, vp(0x883), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rn(0x9a, 0xb1, 0xb2, vp(0xca9), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(rk(0x1b5, 0x1d3, 0x1bc, 0x1d1, vp(0x265))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rn(0xb2, 0xbe, 0xb9, vp(0x218), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(rk(0x183, 0x1ae, 0x197, 0x19e, vp(0x41c))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rp(-0x244, -0x216, -0x232, -0x217, vp(0x81e))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rm(-0x126, -0x10f, -0x13a, vp(0x71c), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rp(-0x203, -0x209, -0x200, -0x1e1, vp(0x712))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rq === rj) break;
          else ro[vp(0x6aa)](ro[vp(0x6f7)]());
        } catch (rr) {
          ro[vp(0x6aa)](ro[vp(0x6f7)]());
        }
      }
    })(ig, 0xc30df * 0x1 + 0x10f * -0x697 + 0x11613);
    function ii() {
      const vq = uf,
        ri = {
          dEyIJ: function (ru, rv) {
            return ru === rv;
          },
          HMRdl:
            rl(vq(0xb74), -0x130, -0x106, -0x11f, -0x11d) +
            rl(vq(0x573), -0x11a, -0x142, -0x138, -0x135),
          MCQcr: function (ru, rv) {
            return ru(rv);
          },
          OVQiZ: function (ru, rv) {
            return ru + rv;
          },
          UJCyl: function (ru, rv) {
            return ru % rv;
          },
          RniHC: function (ru, rv) {
            return ru * rv;
          },
          pKOiA: function (ru, rv) {
            return ru < rv;
          },
          ksKNr: function (ru, rv) {
            return ru ^ rv;
          },
          pZcMn: function (ru, rv) {
            return ru - rv;
          },
          GNeTf: function (ru, rv) {
            return ru - rv;
          },
          igRib: function (ru, rv) {
            return ru ^ rv;
          },
          GUXBF: function (ru, rv) {
            return ru + rv;
          },
          NcAdQ: function (ru, rv) {
            return ru % rv;
          },
          hlnUf: function (ru, rv) {
            return ru * rv;
          },
          pJhNJ: function (ru, rv) {
            return ru(rv);
          },
        };
      if (
        ri[rk(-0x27e, -0x274, -0x265, vq(0xbb6), -0x274)](
          typeof window,
          ri[rm(vq(0x8de), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        ri[ro(-0x17d, -0x171, -0x181, vq(0xcaa), -0x16a)](
          typeof ki,
          ri[rk(-0x25a, -0x263, -0x26c, vq(0x573), -0x270)]
        )
      )
        return;
      const rj = i5;
      function rk(ru, rv, rw, rx, ry) {
        return ih(ru - -0x30c, rx);
      }
      function rl(ru, rv, rw, rx, ry) {
        return ih(ry - -0x1cb, ru);
      }
      function rm(ru, rv, rw, rx, ry) {
        return ih(ry - 0x14c, ru);
      }
      const rn = rj[rm(vq(0x218), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function ro(ru, rv, rw, rx, ry) {
        return ih(ru - -0x20a, rx);
      }
      const rp = ri[rr(0x43a, vq(0x978), 0x40e, 0x428, 0x430)](
        ij,
        ri[rk(-0x28e, -0x27f, -0x272, vq(0xcaa), -0x281)](
          ri[rl(vq(0x934), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rn
          ),
          ib[rl(vq(0xd25), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rq = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rp[
        rl(vq(0xbd3), -0x11e, -0x149, -0x131, -0x13c) +
          ro(-0x172, -0x16e, -0x175, vq(0x8de), -0x166)
      ](rq++, cI[ro(-0x18e, -0x16e, -0x17a, vq(0xb74), -0x1a6)]),
        rp[
          rr(0x415, vq(0x2f0), 0x44c, 0x433, 0x422) +
            rm(vq(0x31d), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rq, cJ),
        (rq += -0x3dd + -0x6b5 + 0xa94);
      function rr(ru, rv, rw, rx, ry) {
        return ih(rx - 0x3a2, rv);
      }
      const rs = ri[rr(0x43c, vq(0x28e), 0x43b, 0x446, 0x459)](
        ri[rk(-0x283, -0x272, -0x298, vq(0x8fb), -0x26e)](
          cJ,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let ru = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        ri[rm(vq(0x1df), 0x200, 0x1fc, 0x1fc, 0x1e5)](ru, rn);
        ru++
      ) {
        rp[
          rk(-0x287, -0x273, -0x27d, vq(0x8de), -0x27c) +
            rm(vq(0x738), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rq++,
          ri[rm(vq(0xdca), 0x201, 0x215, 0x21c, 0x1fc)](
            rj[
              rl(vq(0x34a), -0x11c, -0x130, -0x128, -0x13b) +
                rk(-0x289, -0x29c, -0x26a, vq(0xd25), -0x290)
            ](
              ri[rl(vq(0x2d7), -0x13a, -0x124, -0x111, -0x120)](
                ri[rl(vq(0xbb6), -0x10d, -0x119, -0x108, -0x128)](rn, ru),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rs
          )
        );
      }
      if (ib) {
        const rv = ib[rm(vq(0xcaa), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rw = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          ri[rm(vq(0x144), 0x21f, 0x216, 0x204, 0x200)](rw, rv);
          rw++
        ) {
          rp[
            rm(vq(0x31d), 0x207, 0x20e, 0x209, 0x202) +
              rm(vq(0x34a), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rq++,
            ri[rk(-0x25b, -0x256, -0x24f, vq(0x7c2), -0x261)](
              ib[
                rk(-0x267, -0x256, -0x25e, vq(0xd82), -0x271) +
                  rr(0x412, vq(0x34a), 0x411, 0x421, 0x425)
              ](
                ri[rr(0x435, vq(0x37e), 0x427, 0x434, 0x41a)](
                  ri[rl(vq(0x392), -0x143, -0x134, -0x133, -0x137)](rv, rw),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rs
            )
          );
        }
      }
      const rt = rp[
        rr(0x423, vq(0xb74), 0x44b, 0x440, 0x45a) +
          rk(-0x280, -0x27d, -0x26e, vq(0x31d), -0x288)
      ](
        ri[ro(-0x162, -0x164, -0x161, vq(0x573), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          ri[rr(0x429, vq(0x1f8), 0x43d, 0x437, 0x44b)](
            ri[rl(vq(0x41c), -0x10d, -0x127, -0x124, -0x116)](
              cJ,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rn
          )
        )
      );
      ri[rr(0x435, vq(0x55c), 0x43b, 0x42a, 0x448)](il, rp), (ia = rt);
    }
    function ij(ri) {
      return new DataView(new ArrayBuffer(ri));
    }
    function ik() {
      const vr = uf;
      return hU && hU[vr(0x3cf)] === WebSocket[vr(0x1fa)];
    }
    function il(ri) {
      const vs = uf;
      if (ik()) {
        po += ri[vs(0xc92)];
        if (hW) {
          const rj = new Uint8Array(ri[vs(0x3cc)]);
          for (let rm = 0x0; rm < rj[vs(0xbc8)]; rm++) {
            rj[rm] ^= ia;
          }
          const rk = cJ % rj[vs(0xbc8)],
            rl = rj[0x0];
          (rj[0x0] = rj[rk]), (rj[rk] = rl);
        }
        hU[vs(0x96e)](ri);
      }
    }
    function im(ri, rj = 0x1) {
      const vt = uf;
      let rk = eU(ri);
      const rl = new Uint8Array([
        cI[vt(0x84e)],
        rk,
        Math[vt(0xac6)](rj * 0xff),
      ]);
      il(rl);
    }
    function io(ri, rj) {
      const rk = ip();
      return (
        (io = function (rl, rm) {
          rl = rl - (-0x25b2 + 0x10 * 0x211 + 0x5b2);
          let rn = rk[rl];
          return rn;
        }),
        io(ri, rj)
      );
    }
    function ip() {
      const vu = uf,
        ri = [
          vu(0xd49),
          vu(0xda6),
          vu(0x678),
          vu(0x38d),
          vu(0x5f9),
          vu(0x947),
          vu(0xc23),
          vu(0x37f),
          vu(0xa9a),
          vu(0x51b),
          vu(0x4da),
          vu(0x615),
          vu(0x8ce),
          vu(0x59e),
          vu(0x988),
          vu(0x562),
          vu(0xb26),
          vu(0x9d3),
          vu(0x20b),
          vu(0x427),
        ];
      return (
        (ip = function () {
          return ri;
        }),
        ip()
      );
    }
    (function (ri, rj) {
      const vv = uf;
      function rk(rq, rr, rs, rt, ru) {
        return io(rr - -0x22a, ru);
      }
      const rl = ri();
      function rm(rq, rr, rs, rt, ru) {
        return io(rt - -0x178, rr);
      }
      function rn(rq, rr, rs, rt, ru) {
        return io(rt - 0xba, rq);
      }
      function ro(rq, rr, rs, rt, ru) {
        return io(rq - -0x119, rs);
      }
      function rp(rq, rr, rs, rt, ru) {
        return io(rs - -0x53, rq);
      }
      while (!![]) {
        try {
          const rq =
            (-parseInt(ro(0x9, -0x1, 0xe, 0x10, 0x0)) /
              (-0x242b + -0x3 * -0x421 + 0x17c9)) *
              (-parseInt(rp(0xc4, 0xb9, 0xc1, 0xb8, 0xc5)) /
                (0xe5b + 0x551 * 0x2 + -0x18fb)) +
            -parseInt(ro(-0x1, -0x5, -0x4, -0x4, 0x2)) /
              (0x49 * -0xb + 0x6 * 0x373 + 0x1 * -0x118c) +
            -parseInt(rm(-0x52, -0x53, -0x4d, -0x55, -0x54)) /
              (-0x10e7 + -0x14a9 + 0x2594) +
            -parseInt(rp(0xcd, 0xc0, 0xc8, 0xc6, 0xcd)) /
              (0x159 + 0x18e * 0x2 + -0x470) +
            (-parseInt(ro(0x6, -0x2, 0x10, 0x2, 0xc)) /
              (-0x1872 * -0x1 + 0x1d62 + -0x35ce)) *
              (-parseInt(rm(-0x65, -0x5d, -0x54, -0x5e, -0x66)) /
                (-0x11c + -0x682 + 0x7a5 * 0x1)) +
            -parseInt(rk(-0x112, -0x11a, -0x115, -0x122, -0x11b)) /
              (-0x2312 + -0x1 * -0x2659 + -0x33f) +
            (-parseInt(rn(0x1dc, 0x1d0, 0x1dd, 0x1d7, 0x1de)) /
              (-0x5 * 0x61f + -0x8b * 0x3e + -0x2027 * -0x2)) *
              (-parseInt(rn(0x1d8, 0x1cf, 0x1d5, 0x1cf, 0x1d5)) /
                (-0x292 * -0xb + 0x13d * -0x13 + -0x4b5));
          if (rq === rj) break;
          else rl[vv(0x6aa)](rl[vv(0x6f7)]());
        } catch (rr) {
          rl[vv(0x6aa)](rl[vv(0x6f7)]());
        }
      }
    })(ip, -0x1 * -0x304f9 + 0x1cdb2 + -0x2848f);
    function iq(ri) {
      function rj(rq, rr, rs, rt, ru) {
        return io(rq - 0x3df, rt);
      }
      function rk(rq, rr, rs, rt, ru) {
        return io(rq - 0x12f, rr);
      }
      function rl(rq, rr, rs, rt, ru) {
        return io(rt - 0x263, rs);
      }
      const rm = {
          xgMol: function (rq) {
            return rq();
          },
          NSlTg: function (rq) {
            return rq();
          },
          BrnPE: function (rq) {
            return rq();
          },
          oiynC: function (rq, rr) {
            return rq(rr);
          },
        },
        rn = new Uint8Array([
          cI[
            ro(0x44e, 0x446, 0x44f, 0x456, 0x44f) +
              ro(0x440, 0x43c, 0x440, 0x448, 0x43d)
          ],
          rm[rl(0x387, 0x37e, 0x37e, 0x381, 0x38b)](ir),
          oB,
          rm[rp(0x4a2, 0x4a9, 0x4a0, 0x4a8, 0x49f)](ir),
          rm[rk(0x245, 0x243, 0x241, 0x249, 0x24d)](ir),
          ...rm[rl(0x381, 0x389, 0x38e, 0x384, 0x37e)](is, ri),
        ]);
      function ro(rq, rr, rs, rt, ru) {
        return io(rq - 0x32e, rr);
      }
      function rp(rq, rr, rs, rt, ru) {
        return io(ru - 0x38e, rs);
      }
      rm[rk(0x250, 0x24e, 0x250, 0x246, 0x24a)](il, rn);
    }
    function ir() {
      function ri(ro, rp, rq, rr, rs) {
        return io(rp - 0xd5, rr);
      }
      function rj(ro, rp, rq, rr, rs) {
        return io(rs - 0x379, ro);
      }
      const rk = {};
      function rl(ro, rp, rq, rr, rs) {
        return io(rs - 0x107, rq);
      }
      rk[rn(-0x1b1, -0x1b7, -0x1bb, -0x1ad, -0x1af)] = function (ro, rp) {
        return ro * rp;
      };
      const rm = rk;
      function rn(ro, rp, rq, rr, rs) {
        return io(ro - -0x2ca, rq);
      }
      return Math[ri(0x1f0, 0x1ec, 0x1f4, 0x1e4, 0x1ea)](
        rm[rn(-0x1b1, -0x1ab, -0x1b8, -0x1b0, -0x1b4)](
          Math[rn(-0x1b7, -0x1bb, -0x1bd, -0x1b7, -0x1b2) + "m"](),
          -0x2573 + -0xe * 0x11e + 0x3616
        )
      );
    }
    function is(ri) {
      function rj(rk, rl, rm, rn, ro) {
        return io(ro - 0x117, rl);
      }
      return new TextEncoder()[rj(0x22e, 0x22d, 0x237, 0x22b, 0x233) + "e"](ri);
    }
    function it(ri, rj, rk = 0x3c) {
      const vw = uf;
      iu(),
        (kk[vw(0xd6e)] = vw(0x840) + ri + vw(0xbb8) + rj + vw(0x9f4)),
        kk[vw(0xd58)](hY),
        (hY[vw(0x397)][vw(0x373)] = ""),
        (i3[vw(0x397)][vw(0x373)] = vw(0x972)),
        (i0[vw(0x397)][vw(0x373)] = vw(0x972)),
        (hY[vw(0xa10)](vw(0xd87))[vw(0x397)][vw(0xcb0)] = "0"),
        document[vw(0x53e)][vw(0x474)][vw(0xa5a)](vw(0x2b1)),
        (kk[vw(0x397)][vw(0x373)] = ""),
        (kl[vw(0x397)][vw(0x373)] =
          kn[vw(0x397)][vw(0x373)] =
          km[vw(0x397)][vw(0x373)] =
          kC[vw(0x397)][vw(0x373)] =
            vw(0x972));
      const rl = document[vw(0xa10)](vw(0x5f7));
      document[vw(0xa10)](vw(0x30c))[vw(0xc3)] = function () {
        ro();
      };
      let rm = rk;
      k8(rl, vw(0x7c3) + rm + vw(0x89f));
      const rn = setInterval(() => {
        const vx = vw;
        rm--, rm <= 0x0 ? ro() : k8(rl, vx(0x7c3) + rm + vx(0x89f));
      }, 0x3e8);
      function ro() {
        const vy = vw;
        clearInterval(rn), k8(rl, vy(0x608)), location[vy(0x701)]();
      }
    }
    function iu() {
      const vz = uf;
      if (hU) {
        hU[vz(0xc08)] = hU[vz(0xb48)] = hU[vz(0x830)] = null;
        try {
          hU[vz(0xc1c)]();
        } catch (ri) {}
        hU = null;
      }
    }
    var iv = {},
      iw = [],
      ix,
      iy,
      iz = [],
      iA = uf(0xd0f);
    function iB() {
      const vA = uf;
      iA = getComputedStyle(document[vA(0x53e)])[vA(0x74f)];
    }
    var iC = document[uf(0xa10)](uf(0x23e)),
      iD = document[uf(0xa10)](uf(0x72e)),
      iE = document[uf(0xa10)](uf(0x776)),
      iF = [],
      iG = [],
      iH = ![],
      iI = 0x0;
    function iJ(ri) {
      const vB = uf;
      if (ri < 0.01) return "0";
      ri = Math[vB(0xac6)](ri);
      if (ri >= 0x3b9aca00)
        return parseFloat((ri / 0x3b9aca00)[vB(0xac4)](0x2)) + "b";
      else {
        if (ri >= 0xf4240)
          return parseFloat((ri / 0xf4240)[vB(0xac4)](0x2)) + "m";
        else {
          if (ri >= 0x3e8)
            return parseFloat((ri / 0x3e8)[vB(0xac4)](0x1)) + "k";
        }
      }
      return ri;
    }
    function iK(ri, rj) {
      const vC = uf,
        rk = document[vC(0x966)](vC(0x5e9));
      rk[vC(0xa25)] = vC(0x5e0);
      const rl = document[vC(0x966)](vC(0x5e9));
      (rl[vC(0xa25)] = vC(0xd4d)), rk[vC(0xd58)](rl);
      const rm = document[vC(0x966)](vC(0x1b9));
      rk[vC(0xd58)](rm), iC[vC(0xd58)](rk);
      const rn = {};
      (rn[vC(0x2ab)] = ri),
        (rn[vC(0x318)] = rj),
        (rn[vC(0x9d4)] = 0x0),
        (rn[vC(0xc5a)] = 0x0),
        (rn[vC(0x555)] = 0x0),
        (rn["el"] = rk),
        (rn[vC(0x2fb)] = rl),
        (rn[vC(0x5b6)] = rm);
      const ro = rn;
      (ro[vC(0xd36)] = iG[vC(0xbc8)]),
        (ro[vC(0x8ee)] = function () {
          const vD = vC;
          (this[vD(0x9d4)] = pg(this[vD(0x9d4)], this[vD(0x318)], 0x64)),
            (this[vD(0x555)] = pg(this[vD(0x555)], this[vD(0xc5a)], 0x64)),
            this[vD(0x5b6)][vD(0x491)](
              vD(0x6f2),
              (this[vD(0x2ab)] ? this[vD(0x2ab)] + vD(0xdaf) : "") +
                iJ(this[vD(0x9d4)])
            ),
            (this[vD(0x2fb)][vD(0x397)][vD(0x766)] = this[vD(0x555)] + "%");
        }),
        ro[vC(0x8ee)](),
        iG[vC(0x6aa)](ro);
    }
    function iL(ri) {
      const vE = uf;
      if (iG[vE(0xbc8)] === 0x0) return;
      const rj = iG[0x0];
      rj[vE(0xc5a)] = rj[vE(0x555)] = 0x64;
      for (let rk = 0x1; rk < iG[vE(0xbc8)]; rk++) {
        const rl = iG[rk];
        (rl[vE(0xc5a)] =
          Math[vE(0xc0c)](
            0x1,
            rj[vE(0x318)] === 0x0 ? 0x1 : rl[vE(0x318)] / rj[vE(0x318)]
          ) * 0x64),
          ri && (rl[vE(0x555)] = rl[vE(0xc5a)]),
          iC[vE(0xd58)](rl["el"]);
      }
    }
    function iM(ri) {
      const vF = uf,
        rj = new Path2D();
      rj[vF(0x92d)](...ri[vF(0x269)][0x0]);
      for (let rk = 0x0; rk < ri[vF(0x269)][vF(0xbc8)] - 0x1; rk++) {
        const rl = ri[vF(0x269)][rk],
          rm = ri[vF(0x269)][rk + 0x1];
        let rn = 0x0;
        const ro = rm[0x0] - rl[0x0],
          rp = rm[0x1] - rl[0x1],
          rq = Math[vF(0x4b2)](ro, rp);
        while (rn < rq) {
          rj[vF(0xbe4)](
            rl[0x0] + (rn / rq) * ro + (Math[vF(0xb03)]() * 0x2 - 0x1) * 0x32,
            rl[0x1] + (rn / rq) * rp + (Math[vF(0xb03)]() * 0x2 - 0x1) * 0x32
          ),
            (rn += Math[vF(0xb03)]() * 0x28 + 0x1e);
        }
        rj[vF(0xbe4)](...rm);
      }
      ri[vF(0x6e8)] = rj;
    }
    var iN = 0x0,
      iO = 0x0,
      iP = [],
      iQ = {},
      iR = [],
      iS = {};
    function iT(ri, rj) {
      const vG = uf;
      if (!oV[vG(0x1a5)]) return;
      let rk;
      var baseHP = getHP(ri, hack.moblst);
      var decDmg = ri['nHealth'] - rj;
      var dmg = Math.floor(decDmg * 10000) / 100 + '%';
      if(baseHP && hack.isEnabled('DDenableNumber')) var dmg = Math.floor(decDmg * baseHP);
      const rl = rj === void 0x0;
      !rl && (rk = Math[vG(0x435)]((ri[vG(0xc14)] - rj) * 0x64) || 0x1),
        iz[vG(0x6aa)]({
            text: hack.isEnabled('damageDisplay') ? dmg : rk,
          x: ri["x"] + (Math[vG(0xb03)]() * 0x2 - 0x1) * ri[vG(0x58f)] * 0.6,
          y: ri["y"] + (Math[vG(0xb03)]() * 0x2 - 0x1) * ri[vG(0x58f)] * 0.6,
          vx: (Math[vG(0xb03)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[vG(0xb03)]() * 0x3,
          angle: (Math[vG(0xb03)]() * 0x2 - 0x1) * (rl ? 0x1 : 0.1),
          size: Math[vG(0x411)](0x1, (ri[vG(0x58f)] * 0.2) / 0x14),
        }),
        ri === iy && (pf = 0x1);
    }
    var iU = 0x0,
      iV = 0x0,
      iW = 0x0,
      iX = 0x0;
    function iY(ri) {
      const vH = uf,
        rj = iv[ri];
      if (rj) {
        rj[vH(0x3d9)] = !![];
        if (
          Math[vH(0x71b)](rj["nx"] - iU) > iW + rj[vH(0x9bf)] ||
          Math[vH(0x71b)](rj["ny"] - iV) > iX + rj[vH(0x9bf)]
        )
          rj[vH(0xd72)] = 0xa;
        else !rj[vH(0xd19)] && iT(rj, 0x0);
        delete iv[ri];
      }
    }
    var iZ = [
      uf(0xa07),
      uf(0xd53),
      uf(0x50d),
      uf(0x9b1),
      uf(0xa63),
      uf(0x46f),
      uf(0xacb),
      uf(0x595),
      uf(0xbe0),
      uf(0xaa2),
      uf(0xb57),
      uf(0x26e),
      uf(0xcdf),
    ];
    function j0(ri, rj = iy) {
      const vI = uf;
      (ri[vI(0xa07)] = rj[vI(0xa07)]),
        (ri[vI(0xd53)] = rj[vI(0xd53)]),
        (ri[vI(0x50d)] = rj[vI(0x50d)]),
        (ri[vI(0x9b1)] = rj[vI(0x9b1)]),
        (ri[vI(0xa63)] = rj[vI(0xa63)]),
        (ri[vI(0x46f)] = rj[vI(0x46f)]),
        (ri[vI(0xacb)] = rj[vI(0xacb)]),
        (ri[vI(0x595)] = rj[vI(0x595)]),
        (ri[vI(0xbe0)] = rj[vI(0xbe0)]),
        (ri[vI(0xaa2)] = rj[vI(0xaa2)]),
        (ri[vI(0x4a9)] = rj[vI(0x4a9)]),
        (ri[vI(0xb57)] = rj[vI(0xb57)]),
        (ri[vI(0x300)] = rj[vI(0x300)]),
        (ri[vI(0x26e)] = rj[vI(0x26e)]),
        (ri[vI(0xcdf)] = rj[vI(0xcdf)]);
    }
    function j1() {
      (oJ = null), oR(null), (oN = null), (oL = ![]), (oM = 0x0), o5 && pw();
    }
    var j2 = 0x64,
      j3 = 0x1,
      j4 = 0x64,
      j5 = 0x1,
      j6 = {},
      j7 = [...Object[uf(0x8d3)](d9)],
      j8 = [...hQ];
    ja(j7),
      ja(j8),
      j7[uf(0x6aa)](uf(0xa36)),
      j8[uf(0x6aa)](hP[uf(0x970)] || uf(0xdcd)),
      j7[uf(0x6aa)](uf(0x7bb)),
      j8[uf(0x6aa)](uf(0xdbf));
    var j9 = [];
    for (let ri = 0x0; ri < j7[uf(0xbc8)]; ri++) {
      const rj = d9[j7[ri]] || 0x0;
      j9[ri] = 0x78 + (rj - d9[uf(0xcd9)]) * 0x3c - 0x1 + 0x1;
    }
    function ja(rk) {
      const rl = rk[0x3];
      (rk[0x3] = rk[0x5]), (rk[0x5] = rl);
    }
    var jb = [],
      jc = [];
    function jd(rk) {
      const vJ = uf,
        rl = j8[rk],
        rm = nA(
          vJ(0x3a4) + j7[rk] + vJ(0xb80) + rl + vJ(0x939) + rl + vJ(0x136)
        ),
        rn = rm[vJ(0xa10)](vJ(0x761));
      (j6 = {
        id: rk,
        el: rm,
        state: cT[vJ(0x972)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rm[vJ(0xa10)](vJ(0x88c)),
        progressEl: rn,
        barEl: rn[vJ(0xa10)](vJ(0x27e)),
        textEl: rn[vJ(0xa10)](vJ(0x1b9)),
        nameEl: rm[vJ(0xa10)](vJ(0xc98)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const vK = vJ,
            ro = Math[vK(0xc0c)](0x1, (pz - this[vK(0x3e5)]) / 0x64);
          this[vK(0xd3a)] =
            this[vK(0xdb7)] + (this[vK(0x6ba)] - this[vK(0xdb7)]) * ro;
          const rp = this[vK(0xd3a)] - 0x1;
          this[vK(0x2fb)][vK(0x397)][vK(0x99f)] =
            vK(0x6c1) + rp * 0x64 + vK(0x2c9) + rp + vK(0xcf4);
        },
        update() {
          const vL = vJ,
            ro = je(this["t"]),
            rp = 0x1 - ro;
          (this["el"][vL(0x397)][vL(0xcb0)] = -0xc8 * rp + "px"),
            (this["el"][vL(0x397)][vL(0x99f)] = vL(0xa04) + -0x64 * rp + "%)");
        },
        remove() {
          const vM = vJ;
          rm[vM(0xa5a)]();
        },
      }),
        (j6[vJ(0xd30)][vJ(0x397)][vJ(0x373)] = vJ(0x972)),
        jc[vJ(0x6aa)](j6),
        j6[vJ(0x8ee)](),
        jb[vJ(0x6aa)](j6),
        km[vJ(0x393)](rm, pM);
    }
    function je(rk) {
      return 0x1 - (0x1 - rk) * (0x1 - rk);
    }
    function jf(rk) {
      const vN = uf;
      return rk < 0.5
        ? (0x1 - Math[vN(0x802)](0x1 - Math[vN(0xbee)](0x2 * rk, 0x2))) / 0x2
        : (Math[vN(0x802)](0x1 - Math[vN(0xbee)](-0x2 * rk + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jg() {
      const vO = uf;
      (ok[vO(0xd6e)] = ""), (om = {});
    }
    var jh = document[uf(0xa10)](uf(0x835));
    jh[uf(0x397)][uf(0x373)] = uf(0x972);
    var ji = document[uf(0xa10)](uf(0xc26)),
      jj = [],
      jk = document[uf(0xa10)](uf(0x57c));
    jk[uf(0x7c8)] = function () {
      jl();
    };
    function jl() {
      const vP = uf;
      for (let rk = 0x0; rk < jj[vP(0xbc8)]; rk++) {
        const rl = jj[rk];
        k8(rl[vP(0x8c1)][0x0], jk[vP(0xb85)] ? vP(0xc50) : rl[vP(0x1e6)]);
      }
    }
    function jm(rk) {
      const vQ = uf;
      (jh[vQ(0x397)][vQ(0x373)] = ""), (ji[vQ(0xd6e)] = vQ(0xc68));
      const rl = rk[vQ(0xbc8)];
      jj = [];
      for (let rm = 0x0; rm < rl; rm++) {
        const rn = rk[rm];
        ji[vQ(0xd58)](nA(vQ(0xdd7) + (rm + 0x1) + vQ(0xa09))), jn(rn);
      }
      m1[vQ(0xbf6)][vQ(0x9b3)]();
    }
    function jn(rk) {
      const vR = uf;
      for (let rl = 0x0; rl < rk[vR(0xbc8)]; rl++) {
        const rm = rk[rl],
          rn = nA(vR(0x550) + rm + vR(0xa6c));
        (rn[vR(0x1e6)] = rm),
          rl > 0x0 && jj[vR(0x6aa)](rn),
          (rn[vR(0xc3)] = function () {
            jp(rm);
          }),
          ji[vR(0xd58)](rn);
      }
      jl();
    }
    function jo(rk) {
      const vS = uf;
      var rl = document[vS(0x966)](vS(0x8f4));
      (rl[vS(0x94c)] = rk),
        (rl[vS(0x397)][vS(0x765)] = "0"),
        (rl[vS(0x397)][vS(0x502)] = "0"),
        (rl[vS(0x397)][vS(0x895)] = vS(0xce5)),
        document[vS(0x53e)][vS(0xd58)](rl),
        rl[vS(0x880)](),
        rl[vS(0x519)]();
      try {
        var rm = document[vS(0x24c)](vS(0x533)),
          rn = rm ? vS(0xabf) : vS(0xdb9);
      } catch (ro) {}
      document[vS(0x53e)][vS(0x685)](rl);
    }
    function jp(rk) {
      const vT = uf;
      if (!navigator[vT(0x942)]) {
        jo(rk);
        return;
      }
      navigator[vT(0x942)][vT(0x62c)](rk)[vT(0xb51)](
        function () {},
        function (rl) {}
      );
    }
    var jq = [
        uf(0xa15),
        uf(0x53f),
        uf(0x113),
        uf(0x366),
        uf(0xb7f),
        uf(0x921),
        uf(0x331),
        uf(0x40a),
        uf(0x3d3),
        uf(0x579),
        uf(0xc29),
      ],
      jr = [uf(0xa8f), uf(0xc7d), uf(0x73e)];
    function js(rk) {
      const vU = uf,
        rl = rk ? jr : jq;
      return rl[Math[vU(0xa9a)](Math[vU(0xb03)]() * rl[vU(0xbc8)])];
    }
    function jt(rk) {
      const vV = uf;
      return rk[vV(0xa94)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var ju = document[uf(0xa10)](uf(0x586));
    ju[uf(0xc3)] = ng(function (rk) {
      const vW = uf;
      iy && il(new Uint8Array([cI[vW(0x302)]]));
    });
    var jv = "";
    function jw(rk) {
      const vX = uf;
      return rk[vX(0x516)](/"/g, vX(0xa2f));
    }
    function jx(rk) {
      const vY = uf;
      let rl = "";
      for (let rm = 0x0; rm < rk[vY(0xbc8)]; rm++) {
        const [rn, ro, rp] = rk[rm];
        rl +=
          vY(0xbd6) +
          rn +
          "\x22\x20" +
          (rp ? vY(0x19d) : "") +
          vY(0x6a6) +
          jw(ro) +
          vY(0xd73);
      }
      return vY(0xbf3) + rl + vY(0xda0);
    }
    var jy = ![];
    function jz() {
      const vZ = uf;
      return nA(vZ(0xbb7) + hP[vZ(0xcd9)] + vZ(0xdb2));
    }
    var jA = document[uf(0xa10)](uf(0x310));
    function jB() {
      const w0 = uf;
      (oC[w0(0x397)][w0(0x373)] = pM[w0(0x397)][w0(0x373)] =
        jy ? w0(0x972) : ""),
        (jA[w0(0x397)][w0(0x373)] = ky[w0(0x397)][w0(0x373)] =
          jy ? "" : w0(0x972));
      jy
        ? (kz[w0(0x474)][w0(0x1b0)](w0(0x79a)),
          k8(kz[w0(0x8c1)][0x0], w0(0xc1a)))
        : (kz[w0(0x474)][w0(0xa5a)](w0(0x79a)),
          k8(kz[w0(0x8c1)][0x0], w0(0xa71)));
      const rk = [hG, m7];
      for (let rl = 0x0; rl < rk[w0(0xbc8)]; rl++) {
        const rm = rk[rl];
        rm[w0(0x474)][jy ? w0(0x1b0) : w0(0xa5a)](w0(0x8df)),
          (rm[w0(0xbca)] = jy ? jz : null),
          (rm[w0(0xc6b)] = !![]);
      }
      jC[w0(0x397)][w0(0x373)] = nJ[w0(0x397)][w0(0x373)] = jy ? w0(0x972) : "";
    }
    var jC = document[uf(0xa10)](uf(0x732)),
      jD = document[uf(0xa10)](uf(0x7e8)),
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
    function jN(rk, rl) {
      const w1 = uf;
      jM[rl] = (jM[rl] || 0x0) + 0x1;
      if (jM[rl] > 0x8) return ![];
      let rm = 0x0;
      for (let rn = jL[w1(0xbc8)] - 0x1; rn >= 0x0; rn--) {
        const ro = jL[rn];
        if (ni(rk, ro) > 0.7) {
          rm++;
          if (rm >= 0x5) return ![];
        }
      }
      return jL[w1(0x6aa)](rk), !![];
    }
    var jO = document[uf(0xa10)](uf(0x14a)),
      jP = document[uf(0xa10)](uf(0x6ae)),
      jQ = document[uf(0xa10)](uf(0x59b)),
      jR = document[uf(0xa10)](uf(0xf1)),
      jS;
    k8(jQ, "-"),
      (jQ[uf(0xc3)] = function () {
        if (jS) mi(jS);
      });
    var jT = 0x0,
      jU = document[uf(0xa10)](uf(0x83c));
    setInterval(() => {
      const w2 = uf;
      jT--;
      if (jT < 0x0) {
        jU[w2(0x474)][w2(0xdb3)](w2(0x9b3)) &&
          hW &&
          il(new Uint8Array([cI[w2(0xc3c)]]));
        return;
      }
      jV();
    }, 0x3e8);
    function jV() {
      k8(jR, ka(jT * 0x3e8));
    }
    function jW() {
      const w3 = uf,
        rk = document[w3(0xa10)](w3(0x5de))[w3(0x8c1)],
        rl = document[w3(0xa10)](w3(0x91e))[w3(0x8c1)];
      for (let rm = 0x0; rm < rk[w3(0xbc8)]; rm++) {
        const rn = rk[rm],
          ro = rl[rm];
        rn[w3(0xc3)] = function () {
          const w4 = w3;
          for (let rp = 0x0; rp < rl[w4(0xbc8)]; rp++) {
            const rq = rm === rp;
            (rl[rp][w4(0x397)][w4(0x373)] = rq ? "" : w4(0x972)),
              rk[rp][w4(0x474)][rq ? w4(0x1b0) : w4(0xa5a)](w4(0x359));
          }
        };
      }
      rk[0x0][w3(0xc3)]();
    }
    jW();
    var jX = [];
    function jY(rk) {
      const w5 = uf;
      rk[w5(0x474)][w5(0x1b0)](w5(0x6d3)), jX[w5(0x6aa)](rk);
    }
    var jZ,
      k0 = document[uf(0xa10)](uf(0x335));
    function k1(rk, rl = !![]) {
      const w6 = uf;
      if (rl) {
        if (pz < jG) {
          jH[w6(0x6aa)](rk);
          return;
        } else {
          if (jH[w6(0xbc8)] > 0x0)
            while (jH[w6(0xbc8)] > 0x0) {
              k1(jH[w6(0x6f7)](), ![]);
            }
        }
      }
      function rm() {
        const w7 = w6,
          ry = rv[w7(0x419)](rw++),
          rz = new Uint8Array(ry);
        for (let rA = 0x0; rA < ry; rA++) {
          rz[rA] = rv[w7(0x419)](rw++);
        }
        return new TextDecoder()[w7(0x624)](rz);
      }
      function rn() {
        const w8 = w6;
        return rv[w8(0x419)](rw++) / 0xff;
      }
      function ro(ry) {
        const w9 = w6,
          rz = rv[w9(0xe3)](rw);
        (rw += 0x2),
          (ry[w9(0x257)] = rz & 0x1),
          (ry[w9(0xa07)] = rz & 0x2),
          (ry[w9(0xd53)] = rz & 0x4),
          (ry[w9(0x50d)] = rz & 0x8),
          (ry[w9(0x9b1)] = rz & 0x10),
          (ry[w9(0xa63)] = rz & 0x20),
          (ry[w9(0x46f)] = rz & 0x40),
          (ry[w9(0xacb)] = rz & 0x80),
          (ry[w9(0x595)] = rz & 0x100),
          (ry[w9(0xbe0)] = rz & (0x1 << 0x9)),
          (ry[w9(0xaa2)] = rz & (0x1 << 0xa)),
          (ry[w9(0x4a9)] = rz & (0x1 << 0xb)),
          (ry[w9(0xb57)] = rz & (0x1 << 0xc)),
          (ry[w9(0x300)] = rz & (0x1 << 0xd)),
          (ry[w9(0x26e)] = rz & (0x1 << 0xe)),
          (ry[w9(0xcdf)] = rz & (0x1 << 0xf));
      }
      function rp() {
        const wa = w6,
          ry = rv[wa(0x9a4)](rw);
        rw += 0x4;
        const rz = rm();
        iK(rz, ry);
      }
      function rq() {
        const wb = w6,
          ry = rv[wb(0xe3)](rw) - cG;
        return (rw += 0x2), ry;
      }
      function rr() {
        const wc = w6,
          ry = {};
        for (let rJ in mb) {
          (ry[rJ] = rv[wc(0x9a4)](rw)), (rw += 0x4);
        }
        const rz = rm(),
          rA = Number(rv[wc(0xd04)](rw));
        rw += 0x8;
        const rB = d5(d4(rA)[0x0]),
          rC = rB * 0x2,
          rD = Array(rC);
        for (let rK = 0x0; rK < rC; rK++) {
          const rL = rv[wc(0xe3)](rw) - 0x1;
          rw += 0x2;
          if (rL < 0x0) continue;
          rD[rK] = dC[rL];
        }
        const rE = [],
          rF = rv[wc(0xe3)](rw);
        rw += 0x2;
        for (let rM = 0x0; rM < rF; rM++) {
          const rN = rv[wc(0xe3)](rw);
          rw += 0x2;
          const rO = rv[wc(0x9a4)](rw);
          (rw += 0x4), rE[wc(0x6aa)]([dC[rN], rO]);
        }
        const rG = [],
          rH = rv[wc(0xe3)](rw);
        rw += 0x2;
        for (let rP = 0x0; rP < rH; rP++) {
          const rQ = rv[wc(0xe3)](rw);
          (rw += 0x2), !eK[rQ] && console[wc(0xabc)](rQ), rG[wc(0x6aa)](eK[rQ]);
        }
        const rI = rv[wc(0x419)](rw++);
        mg(rz, ry, rE, rG, rA, rD, rI);
      }
      function rs() {
        const wd = w6,
          ry = Number(rv[wd(0xd04)](rw));
        return (rw += 0x8), ry;
      }
      function rt() {
        const we = w6,
          ry = rv[we(0x9a4)](rw);
        rw += 0x4;
        const rz = rv[we(0x419)](rw++),
          rA = {};
        (rA[we(0xbb3)] = ry), (rA[we(0x169)] = {});
        const rB = rA;
        f3[we(0x4a2)]((rD, rE) => {
          const wf = we;
          rB[wf(0x169)][rD] = [];
          for (let rF = 0x0; rF < rz; rF++) {
            const rG = rm();
            let rH;
            rD === "xp" ? (rH = rs()) : ((rH = rv[wf(0x9a4)](rw)), (rw += 0x4)),
              rB[wf(0x169)][rD][wf(0x6aa)]([rG, rH]);
          }
        }),
          k8(jD, k9(rB[we(0xbb3)]) + we(0x22b)),
          (ml[we(0xd6e)] = "");
        let rC = 0x0;
        for (let rD in rB[we(0x169)]) {
          const rE = kd(rD),
            rF = rB[we(0x169)][rD],
            rG = nA(we(0x7d6) + rC + we(0x4c5) + rE + we(0xd0a)),
            rH = rG[we(0xa10)](we(0x109));
          for (let rI = 0x0; rI < rF[we(0xbc8)]; rI++) {
            const [rJ, rK] = rF[rI];
            let rL = ma(rD, rK);
            rD === "xp" && (rL += we(0x7df) + (d4(rK)[0x0] + 0x1) + ")");
            const rM = nA(
              we(0x8b8) + (rI + 0x1) + ".\x20" + rJ + we(0x39b) + rL + we(0xbed)
            );
            (rM[we(0xc3)] = function () {
              mi(rJ);
            }),
              rH[we(0x7dd)](rM);
          }
          ml[we(0x7dd)](rG), rC++;
        }
      }
      function ru() {
        const wg = w6;
        (jS = rm()), k8(jQ, jS || "-");
        const ry = Number(rv[wg(0xd04)](rw));
        (rw += 0x8),
          (jT = Math[wg(0xac6)]((ry - Date[wg(0x603)]()) / 0x3e8)),
          jV();
        const rz = rv[wg(0xe3)](rw);
        rw += 0x2;
        if (rz === 0x0) jP[wg(0xd6e)] = wg(0xbe9);
        else {
          jP[wg(0xd6e)] = "";
          for (let rB = 0x0; rB < rz; rB++) {
            const rC = rm(),
              rD = rv[wg(0x36c)](rw);
            rw += 0x4;
            const rE = rD * 0x64,
              rF = rE >= 0x1 ? rE[wg(0xac4)](0x2) : rE[wg(0xac4)](0x5),
              rG = nA(
                wg(0x36d) +
                  (rB + 0x1) +
                  ".\x20" +
                  rC +
                  wg(0x24f) +
                  rF +
                  wg(0x6fd)
              );
            rC === jv && rG[wg(0x474)][wg(0x1b0)]("me"),
              (rG[wg(0xc3)] = function () {
                mi(rC);
              }),
              jP[wg(0xd58)](rG);
          }
        }
        k0[wg(0xd6e)] = "";
        const rA = rv[wg(0xe3)](rw);
        (rw += 0x2), (jZ = {});
        if (rA === 0x0)
          (jO[wg(0xd6e)] = wg(0x720)), (k0[wg(0x397)][wg(0x373)] = wg(0x972));
        else {
          const rH = {};
          jO[wg(0xd6e)] = "";
          for (let rI = 0x0; rI < rA; rI++) {
            const rJ = rv[wg(0xe3)](rw);
            rw += 0x2;
            const rK = rv[wg(0x9a4)](rw);
            (rw += 0x4), (jZ[rJ] = rK);
            const rL = dC[rJ],
              rM = nA(
                wg(0x6b2) +
                  rL[wg(0xcce)] +
                  wg(0x1e1) +
                  qk(rL) +
                  wg(0xa59) +
                  rK +
                  wg(0xd1a)
              );
            (rM[wg(0xa0e)] = jU),
              jY(rM),
              (rM[wg(0xbca)] = rL),
              jO[wg(0xd58)](rM),
              (rH[rL[wg(0xcce)]] = (rH[rL[wg(0xcce)]] || 0x0) + rK);
          }
          nX(jO), (k0[wg(0x397)][wg(0x373)] = ""), oo(k0, rH);
        }
      }
      const rv = new DataView(rk[w6(0x813)]);
      po += rv[w6(0xc92)];
      let rw = 0x0;
      const rx = rv[w6(0x419)](rw++);
      switch (rx) {
        case cI[w6(0x6cf)]:
          {
            const rT = rv[w6(0xe3)](rw);
            rw += 0x2;
            for (let rU = 0x0; rU < rT; rU++) {
              const rV = rv[w6(0xe3)](rw);
              rw += 0x2;
              const rW = rv[w6(0x9a4)](rw);
              (rw += 0x4), mQ(rV, rW);
            }
          }
          break;
        case cI[w6(0x2df)]:
          ru();
          break;
        case cI[w6(0x36f)]:
          kC[w6(0x474)][w6(0x1b0)](w6(0x9b3)), hT(), (jG = pz + 0x1f4);
          break;
        case cI[w6(0x3a7)]:
          (m5[w6(0xd6e)] = w6(0x76e)), m5[w6(0xd58)](m8), (m9 = ![]);
          break;
        case cI[w6(0x566)]: {
          const rX = dC[rv[w6(0xe3)](rw)];
          rw += 0x2;
          const rY = rv[w6(0x9a4)](rw);
          (rw += 0x4),
            (m5[w6(0xd6e)] =
              w6(0x34b) +
              rX[w6(0xcce)] +
              "\x22\x20" +
              qk(rX) +
              w6(0xa59) +
              k9(rY) +
              w6(0x32d));
          const rZ = m5[w6(0xa10)](w6(0x679));
          (rZ[w6(0xbca)] = rX),
            (rZ[w6(0xc3)] = function () {
              const wh = w6;
              mQ(rX["id"], rY), (this[wh(0xc3)] = null), m8[wh(0xc3)]();
            }),
            (m9 = ![]);
          break;
        }
        case cI[w6(0x829)]: {
          const s0 = rv[w6(0x419)](rw++),
            s1 = rv[w6(0x9a4)](rw);
          rw += 0x4;
          const s2 = rm();
          (m5[w6(0xd6e)] =
            w6(0x2f9) +
            s2 +
            w6(0xb80) +
            hP[w6(0x409)] +
            w6(0x15e) +
            k9(s1) +
            "\x20" +
            hN[s0] +
            w6(0xb80) +
            hQ[s0] +
            w6(0xb1e)),
            (m5[w6(0xa10)](w6(0x626))[w6(0xc3)] = function () {
              mi(s2);
            }),
            m5[w6(0xd58)](m8),
            (m9 = ![]);
          break;
        }
        case cI[w6(0x891)]:
          (m5[w6(0xd6e)] = w6(0xdc)), m5[w6(0xd58)](m8), (m9 = ![]);
          break;
        case cI[w6(0x48d)]:
          hK(w6(0x264));
          break;
        case cI[w6(0xcaf)]:
          rt();
          break;
        case cI[w6(0x8cd)]:
          hK(w6(0xbe5)), hc(w6(0xbe5));
          break;
        case cI[w6(0x3db)]:
          hK(w6(0x472)), hc(w6(0x6dc));
          break;
        case cI[w6(0x349)]:
          hK(w6(0x7e7));
          break;
        case cI[w6(0x8bf)]:
          rr();
          break;
        case cI[w6(0x2b7)]:
          hc(w6(0x7e4));
          break;
        case cI[w6(0x464)]:
          hc(w6(0xcde), hP[w6(0x970)]), hJ(hH);
          break;
        case cI[w6(0xbf6)]:
          const ry = rv[w6(0xe3)](rw);
          rw += 0x2;
          const rz = [];
          for (let s3 = 0x0; s3 < ry; s3++) {
            const s4 = rv[w6(0x9a4)](rw);
            rw += 0x4;
            const s5 = rm(),
              s6 = rm(),
              s7 = rm();
            rz[w6(0x6aa)]([s5 || w6(0x818) + s4, s6, s7]);
          }
          jm(rz);
          break;
        case cI[w6(0xa41)]:
          for (let s8 in mb) {
            const s9 = rv[w6(0x9a4)](rw);
            (rw += 0x4), mc[s8][w6(0x9b4)](s9);
          }
          break;
        case cI[w6(0xca7)]:
          const rA = rv[w6(0x419)](rw++),
            rB = rv[w6(0x9a4)](rw++),
            rC = {};
          (rC[w6(0x6df)] = rA), (rC[w6(0x74a)] = rB), (oN = rC);
          break;
        case cI[w6(0x7de)]:
          (i0[w6(0x397)][w6(0x373)] = i6 ? "" : w6(0x972)),
            (i3[w6(0x397)][w6(0x373)] = !i6 ? "" : w6(0x972)),
            (hY[w6(0x397)][w6(0x373)] = ""),
            (kn[w6(0x397)][w6(0x373)] = w6(0x972)),
            (hW = !![]),
            kB[w6(0x474)][w6(0x1b0)](w6(0x9b3)),
            kA[w6(0x474)][w6(0xa5a)](w6(0x9b3)),
            j1(),
            m0(![]),
            (ix = rv[w6(0x9a4)](rw)),
            (rw += 0x4),
            (jv = rm()),
            hack.player.name = jv,
            hJ(jv),
            (jy = rv[w6(0x419)](rw++)),
            jB(),
            (j2 = rv[w6(0xe3)](rw)),
            (rw += 0x2),
            (j5 = rv[w6(0x419)](rw++)),
            (j4 = j2 / j5),
            (j3 = j2 / 0x3),
            (oq = rs()),
            oA(),
            oD(),
            (iN = d5(or)),
            (iO = iN * 0x2),
            (iP = Array(iO)),
            (iQ = {}),
            (iR = d7());
          for (let sa = 0x0; sa < iO; sa++) {
            const sb = rv[w6(0xe3)](rw) - 0x1;
            rw += 0x2;
            if (sb < 0x0) continue;
            iP[sa] = dC[sb];
          }
          nv(), nD();
          const rD = rv[w6(0xe3)](rw);
          rw += 0x2;
          for (let sc = 0x0; sc < rD; sc++) {
            const sd = rv[w6(0xe3)](rw);
            rw += 0x2;
            const se = nF(eK[sd]);
            se[w6(0xa0e)] = m2;
          }
          iS = {};
          while (rw < rv[w6(0xc92)]) {
            const sf = rv[w6(0xe3)](rw);
            rw += 0x2;
            const sg = rv[w6(0x9a4)](rw);
            (rw += 0x4), (iS[sf] = sg);
          }
          nV(), mR();
          break;
        case cI[w6(0xdc5)]:
          const rE = rv[w6(0x419)](rw++),
            rF = hL[rE] || w6(0x3af);
          console[w6(0xabc)](w6(0x38f) + rF + ")"),
            (kf = rE === cR[w6(0x582)] || rE === cR[w6(0x977)]);
          !kf &&
            it(w6(0x6d9), w6(0xbab) + rF, rE === cR[w6(0xaca)] ? 0xa : 0x3c);
          break;
        case cI[w6(0x8ad)]:
          (hg[w6(0x397)][w6(0x373)] = kn[w6(0x397)][w6(0x373)] = w6(0x972)),
            kG(!![]),
            ju[w6(0x474)][w6(0x1b0)](w6(0x9b3)),
            jg(),
            (p2[w6(0x397)][w6(0x373)] = "");
          for (let sh in iQ) {
            iQ[sh][w6(0xa0c)] = 0x0;
          }
          (jI = pz),
            (n8 = {}),
            (n0 = 0x1),
            (n1 = 0x1),
            (mY = 0x0),
            (mZ = 0x0),
            mp(),
            (mV = cY[w6(0x4b0)]),
            (jE = pz);
          break;
        case cI[w6(0x8ee)]:
          (pn = pz - jE), (jE = pz), pT[w6(0x9b4)](rn()), pV[w6(0x9b4)](rn());
          if (jy) {
            const si = rv[w6(0x419)](rw++);
            (jJ = si & 0x80), (jK = f6[si & 0x7f]);
          } else (jJ = ![]), (jK = null), pW[w6(0x9b4)](rn());
          (pu = 0x1 + cW[rv[w6(0x419)](rw++)] / 0x64),
            (iW = (d0 / 0x2) * pu),
            (iX = (d1 / 0x2) * pu);
          const rG = rv[w6(0xe3)](rw);
          rw += 0x2;
          for (let sj = 0x0; sj < rG; sj++) {
            const sk = rv[w6(0x9a4)](rw);
            rw += 0x4;
            let sl = iv[sk];
            if (sl) {
              if (sl[w6(0x8f9)]) {
                sl[w6(0x924)] = rv[w6(0x419)](rw++) - 0x1;
                continue;
              }
              const sm = rv[w6(0x419)](rw++);
              sm & 0x1 &&
                ((sl["nx"] = rq()), (sl["ny"] = rq()), (sl[w6(0xdd3)] = 0x0));
              sm & 0x2 &&
                ((sl[w6(0x91c)] = eS(rv[w6(0x419)](rw++))),
                (sl[w6(0xdd3)] = 0x0));
              if (sm & 0x4) {
                const sn = rn();
                if (sn < sl[w6(0xc14)]) iT(sl, sn), (sl[w6(0x5d2)] = 0x1);
                else sn > sl[w6(0xc14)] && (sl[w6(0x5d2)] = 0x0);
                (sl[w6(0xc14)] = sn), (sl[w6(0xdd3)] = 0x0);
              }
              sm & 0x8 &&
                ((sl[w6(0x828)] = 0x1),
                (sl[w6(0xdd3)] = 0x0),
                sl === iy && (pf = 0x1));
              sm & 0x10 && ((sl[w6(0x9bf)] = rv[w6(0xe3)](rw)), (rw += 0x2));
              sm & 0x20 && (sl[w6(0x210)] = rv[w6(0x419)](rw++));
              sm & 0x40 && ro(sl);
              if (sm & 0x80) {
                if (sl[w6(0x5e5)])
                  (sl[w6(0xb14)] = rv[w6(0xe3)](rw)), (rw += 0x2);
                else {
                  const so = rn();
                  so > sl[w6(0x1db)] && iT(sl), (sl[w6(0x1db)] = so);
                }
              }
              sl[w6(0x5e5)] && sm & 0x4 && (sl[w6(0x618)] = rn()),
                (sl["ox"] = sl["x"]),
                (sl["oy"] = sl["y"]),
                (sl[w6(0xb3d)] = sl[w6(0x903)]),
                (sl[w6(0x734)] = sl[w6(0x238)]),
                (sl[w6(0x18e)] = sl[w6(0x58f)]),
                (sl[w6(0xc3b)] = 0x0);
            } else {
              const sp = rv[w6(0x419)](rw++);
              if (sp === cS[w6(0xd7e)]) {
                let su = rv[w6(0x419)](rw++);
                const sv = {};
                (sv[w6(0x269)] = []), (sv["a"] = 0x1);
                const sw = sv;
                while (su--) {
                  const sx = rq(),
                    sy = rq();
                  sw[w6(0x269)][w6(0x6aa)]([sx, sy]);
                }
                iM(sw), (pf = 0x1), iF[w6(0x6aa)](sw);
                continue;
              }
              const sq = hM[sp],
                sr = rq(),
                ss = rq(),
                st = sp === cS[w6(0x790)];
              if (sp === cS[w6(0xcf0)] || sp === cS[w6(0x86c)] || st) {
                const sz = rv[w6(0xe3)](rw);
                (rw += 0x2),
                  (sl = new lK(sp, sk, sr, ss, sz)),
                  st &&
                    ((sl[w6(0x8f9)] = !![]),
                    (sl[w6(0x924)] = rv[w6(0x419)](rw++) - 0x1));
              } else {
                if (sp === cS[w6(0xb2d)]) {
                  const sA = rv[w6(0xe3)](rw);
                  (rw += 0x2), (sl = new lN(sk, sr, ss, sA));
                } else {
                  const sB = eS(rv[w6(0x419)](rw++)),
                    sC = rv[w6(0xe3)](rw);
                  rw += 0x2;
                  if (sp === cS[w6(0xa9e)]) {
                    const sD = rn(),
                      sE = rv[w6(0x419)](rw++);
                    (sl = new lT(sk, sr, ss, sB, sD, sE, sC)),
                      ro(sl),
                      (sl[w6(0xb14)] = rv[w6(0xe3)](rw)),
                      (rw += 0x2),
                      (sl[w6(0x2ab)] = rm()),
                      (sl[w6(0x7cf)] = rm()),
                      (sl[w6(0x618)] = rn());
                    if (ix === sk) iy = sl;
                    else {
                      if (jy) {
                        const sF = pF();
                        (sF[w6(0xc11)] = sl), px[w6(0x6aa)](sF);
                      }
                    }
                  } else {
                    if (sq[w6(0xb93)](w6(0xbca)))
                      sl = new lG(sk, sp, sr, ss, sB, sC);
                    else {
                      const sG = rn(),
                        sH = rv[w6(0x419)](rw++),
                        sI = sH >> 0x4,
                        sJ = sH & 0x1,
                        sK = sH & 0x2,
                        sL = rn();
                      (sl = new lG(sk, sp, sr, ss, sB, sC, sG)),
                        (sl[w6(0xcce)] = sI),
                        (sl[w6(0x2e3)] = sJ),
                        (sl[w6(0x26e)] = sK),
                        (sl[w6(0x1db)] = sL),
                        (sl[w6(0x518)] = hN[sI]);
                    }
                  }
                }
              }
              (iv[sk] = sl), iw[w6(0x6aa)](sl);
            }
          }
          iy &&
            ((iU = iy["nx"]),
            (iV = iy["ny"]),
            (pO[w6(0x397)][w6(0x373)] = ""),
            pQ(pO, iy["nx"], iy["ny"]));
          const rH = rv[w6(0xe3)](rw);
          rw += 0x2;
          for (let sM = 0x0; sM < rH; sM++) {
            const sN = rv[w6(0x9a4)](rw);
            (rw += 0x4), iY(sN);
          }
          const rI = rv[w6(0x419)](rw++);
          for (let sO = 0x0; sO < rI; sO++) {
            const sP = rv[w6(0x9a4)](rw);
            rw += 0x4;
            const sQ = iv[sP];
            if (sQ) {
              (sQ[w6(0x10b)] = iy), mQ(sQ[w6(0xbca)]["id"], 0x1), iY(sP);
              if (!om[sQ[w6(0xbca)]["id"]]) om[sQ[w6(0xbca)]["id"]] = 0x0;
              om[sQ[w6(0xbca)]["id"]]++;
            }
          }
          const rJ = rv[w6(0x419)](rw++);
          for (let sR = 0x0; sR < rJ; sR++) {
            const sS = rv[w6(0x419)](rw++),
              sT = rn(),
              sU = iQ[sS];
            (sU[w6(0xd86)] = sT), sT === 0x0 && (sU[w6(0xa0c)] = 0x0);
          }
          (iI = rv[w6(0xe3)](rw)), (rw += 0x2);
          const rK = rv[w6(0xe3)](rw);
          (rw += 0x2),
            iE[w6(0x491)](
              w6(0x6f2),
              kh(iI, w6(0xac3)) + ",\x20" + kh(rK, w6(0x7c5))
            );
          const rL = Math[w6(0xc0c)](0xa, iI);
          if (iH) {
            const sV = rv[w6(0x419)](rw++),
              sW = sV >> 0x4,
              sX = sV & 0xf,
              sY = rv[w6(0x419)](rw++);
            for (let t0 = 0x0; t0 < sX; t0++) {
              const t1 = rv[w6(0x419)](rw++);
              (iG[t1][w6(0x318)] = rv[w6(0x9a4)](rw)), (rw += 0x4);
            }
            const sZ = [];
            for (let t2 = 0x0; t2 < sY; t2++) {
              sZ[w6(0x6aa)](rv[w6(0x419)](rw++));
            }
            sZ[w6(0x1d0)](function (t3, t4) {
              return t4 - t3;
            });
            for (let t3 = 0x0; t3 < sY; t3++) {
              const t4 = sZ[t3];
              iG[t4]["el"][w6(0xa5a)](), iG[w6(0xb41)](t4, 0x1);
            }
            for (let t5 = 0x0; t5 < sW; t5++) {
              rp();
            }
            iG[w6(0x1d0)](function (t6, t7) {
              const wi = w6;
              return t7[wi(0x318)] - t6[wi(0x318)];
            });
          } else {
            iG[w6(0xbc8)] = 0x0;
            for (let t6 = 0x0; t6 < rL; t6++) {
              rp();
            }
            iH = !![];
          }
          iL();
          const rM = rv[w6(0x419)](rw++);
          for (let t7 = 0x0; t7 < rM; t7++) {
            const t8 = rv[w6(0xe3)](rw);
            (rw += 0x2), nF(eK[t8]);
          }
          const rN = rv[w6(0xe3)](rw);
          rw += 0x2;
          for (let t9 = 0x0; t9 < rN; t9++) {
            const ta = rv[w6(0x419)](rw++),
              tb = ta >> 0x7,
              tc = ta & 0x7f;
            if (tc === cQ[w6(0x452)]) {
              const tg = rv[w6(0x419)](rw++),
                th = rv[w6(0x419)](rw++) - 0x1;
              let ti = null,
                tj = 0x0;
              if (tb) {
                const tl = rv[w6(0x9a4)](rw);
                rw += 0x4;
                const tm = rm();
                (ti = tm || w6(0x818) + tl), (tj = rv[w6(0x419)](rw++));
              }
              const tk = j8[tg];
              n6(
                w6(0x452),
                null,
                "⚡\x20" +
                  j7[tg] +
                  w6(0x677) +
                  (th < 0x0
                    ? w6(0x584)
                    : th === 0x0
                    ? w6(0x31b)
                    : w6(0xc05) + (th + 0x1) + "!"),
                tk
              );
              ti &&
                n5(w6(0x452), [
                  [w6(0xb5c), "🏆"],
                  [tk, ti + w6(0x306)],
                  [hP[w6(0xcd9)], tj + w6(0xd61)],
                  [tk, w6(0xb3c)],
                ]);
              continue;
            }
            const td = rv[w6(0x9a4)](rw);
            rw += 0x4;
            const te = rm(),
              tf = te || w6(0x818) + td;
            if (tc === cQ[w6(0x287)]) {
              let tn = rm();
              oV[w6(0x7ea)] && (tn = fb(tn));
              if (jN(tn, td)) n6(td, tf, tn, td === ix ? n3["me"] : void 0x0);
              else td === ix && n6(-0x1, null, w6(0xba4), n3[w6(0x126)]);
            } else {
              if (tc === cQ[w6(0xca7)]) {
                const to = rv[w6(0xe3)](rw);
                rw += 0x2;
                const tp = rv[w6(0x9a4)](rw);
                rw += 0x4;
                const tq = rv[w6(0x9a4)](rw);
                rw += 0x4;
                const tr = dC[to],
                  ts = hN[tr[w6(0xcce)]],
                  tt = hN[tr[w6(0xa20)][w6(0xcce)]],
                  tu = tq === 0x0;
                if (tu)
                  n5(w6(0xca7), [
                    [n3[w6(0xcd4)], tf, !![]],
                    [n3[w6(0xcd4)], w6(0x103)],
                    [
                      hQ[tr[w6(0xcce)]],
                      k9(tp) + "\x20" + ts + "\x20" + tr[w6(0xaba)],
                    ],
                  ]);
                else {
                  const tv = hQ[tr[w6(0xa20)][w6(0xcce)]];
                  n5(w6(0xca7), [
                    [tv, "⭐"],
                    [tv, tf, !![]],
                    [tv, w6(0xb66)],
                    [
                      tv,
                      k9(tq) +
                        "\x20" +
                        tt +
                        "\x20" +
                        tr[w6(0xaba)] +
                        w6(0x3f0) +
                        k9(tp) +
                        "\x20" +
                        ts +
                        "\x20" +
                        tr[w6(0xaba)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tw = rv[w6(0xe3)](rw);
                rw += 0x2;
                const tx = eK[tw],
                  ty = hN[tx[w6(0xcce)]],
                  tz = tc === cQ[w6(0x209)],
                  tA = hQ[tx[w6(0xcce)]];
                n5(w6(0x7ac), [
                  [
                    tA,
                    "" +
                      (tz ? w6(0x587) : "") +
                      jt(ty) +
                      "\x20" +
                      ty +
                      "\x20" +
                      tx[w6(0xaba)] +
                      w6(0xade) +
                      js(tz) +
                      w6(0x77b),
                  ],
                  [tA, tf + "!", !![]],
                ]);
              }
            }
          }
          const rO = rv[w6(0x419)](rw++),
            rP = rO & 0xf,
            rQ = rO >> 0x4;
          let rR = ![];
          rP !== j6["id"] &&
            (j6 && (j6[w6(0x2c3)] = !![]),
            (rR = !![]),
            jd(rP),
            k8(pU, w6(0xaed) + j9[rP] + w6(0xb9a)));
          const rS = rv[w6(0x419)](rw++);
          if (rS > 0x0) {
            let tB = ![];
            for (let tC = 0x0; tC < rS; tC++) {
              const tD = rv[w6(0xe3)](rw);
              rw += 0x2;
              const tE = rv[w6(0xe3)](rw);
              (rw += 0x2), (j6[tD] = tE);
              if (tE > 0x0) {
                if (!j6[w6(0x468)][tD]) {
                  tB = !![];
                  const tF = nF(eK[tD], !![]);
                  (tF[w6(0xc6b)] = !![]),
                    (tF[w6(0xdc2)] = ![]),
                    tF[w6(0x474)][w6(0xa5a)](w6(0x429)),
                    (tF[w6(0x7cd)] = nA(w6(0x7c7))),
                    tF[w6(0xd58)](tF[w6(0x7cd)]),
                    (tF[w6(0x6b7)] = tD);
                  let tG = -0x1;
                  (tF["t"] = rR ? 0x1 : 0x0),
                    (tF[w6(0x2c3)] = ![]),
                    (tF[w6(0x9c5)] = 0x3e8),
                    (tF[w6(0x8ee)] = function () {
                      const wj = w6,
                        tH = tF["t"];
                      if (tH === tG) return;
                      tG = tH;
                      const tI = jf(Math[wj(0xc0c)](0x1, tH / 0.5)),
                        tJ = jf(
                          Math[wj(0x411)](
                            0x0,
                            Math[wj(0xc0c)]((tH - 0.5) / 0.5)
                          )
                        );
                      (tF[wj(0x397)][wj(0x99f)] =
                        wj(0x714) + -0x168 * (0x1 - tJ) + wj(0x752) + tJ + ")"),
                        (tF[wj(0x397)][wj(0x79d)] = -1.12 * (0x1 - tI) + "em");
                    }),
                    jb[w6(0x6aa)](tF),
                    j6[w6(0xa0d)][w6(0xd58)](tF),
                    (j6[w6(0x468)][tD] = tF);
                }
                oP(j6[w6(0x468)][tD][w6(0x7cd)], tE);
              } else {
                const tH = j6[w6(0x468)][tD];
                tH && ((tH[w6(0x2c3)] = !![]), delete j6[w6(0x468)][tD]),
                  delete j6[tD];
              }
            }
            tB &&
              [...j6[w6(0xa0d)][w6(0x8c1)]]
                [w6(0x1d0)]((tI, tJ) => {
                  const wk = w6;
                  return -nY(eK[tI[wk(0x6b7)]], eK[tJ[wk(0x6b7)]]);
                })
                [w6(0x4a2)]((tI) => {
                  const wl = w6;
                  j6[wl(0xa0d)][wl(0xd58)](tI);
                });
          }
          (j6[w6(0x3e5)] = pz), (j6[w6(0x887)] = rQ);
          if (rQ !== cT[w6(0x972)]) {
            (j6[w6(0xd30)][w6(0x397)][w6(0x373)] = ""),
              (j6[w6(0xdb7)] = j6[w6(0xd3a)]),
              (j6[w6(0x6ba)] = rn());
            if (j6[w6(0x709)] !== jJ) {
              const tI = jJ ? w6(0x1b0) : w6(0xa5a);
              j6[w6(0x2fb)][w6(0x474)][tI](w6(0x451)),
                j6[w6(0x2fb)][w6(0x474)][tI](w6(0xa31)),
                j6[w6(0x5b6)][w6(0x474)][tI](w6(0xb16)),
                (j6[w6(0x709)] = jJ);
            }
            switch (rQ) {
              case cT[w6(0x9b2)]:
                k8(j6[w6(0x423)], w6(0x862));
                break;
              case cT[w6(0x452)]:
                const tJ = rv[w6(0x419)](rw++) + 0x1;
                k8(j6[w6(0x423)], w6(0x8c6) + tJ);
                break;
              case cT[w6(0x839)]:
                k8(j6[w6(0x423)], w6(0x1c9));
                break;
              case cT[w6(0x244)]:
                k8(j6[w6(0x423)], w6(0x51a));
                break;
              case cT[w6(0x192)]:
                k8(j6[w6(0x423)], w6(0x2ad));
                break;
            }
          } else j6[w6(0xd30)][w6(0x397)][w6(0x373)] = w6(0x972);
          if (rv[w6(0xc92)] - rw > 0x0) {
            iy &&
              (j0(qd),
              (qd[w6(0x4a9)] = ![]),
              (pP[w6(0x397)][w6(0x373)] = ""),
              (pO[w6(0x397)][w6(0x373)] = w6(0x972)),
              pQ(pP, iy["nx"], iy["ny"]));
            qe[w6(0x13a)](), (iy = null), ju[w6(0x474)][w6(0xa5a)](w6(0x9b3));
            const tK = rv[w6(0xe3)](rw) - 0x1;
            rw += 0x2;
            const tL = rv[w6(0x9a4)](rw);
            rw += 0x4;
            const tM = rv[w6(0x9a4)](rw);
            rw += 0x4;
            const tN = rv[w6(0x9a4)](rw);
            rw += 0x4;
            const tO = rv[w6(0x9a4)](rw);
            (rw += 0x4),
              k8(k3, ka(tM)),
              k8(k2, k9(tL)),
              k8(k4, k9(tN)),
              k8(k6, k9(tO));
            let tP = null;
            rv[w6(0xc92)] - rw > 0x0 && ((tP = rv[w6(0x9a4)](rw)), (rw += 0x4));
            tP !== null
              ? (k8(k7, k9(tP)), (k7[w6(0x773)][w6(0x397)][w6(0x373)] = ""))
              : (k7[w6(0x773)][w6(0x397)][w6(0x373)] = w6(0x972));
            if (tK === -0x1) k8(k5, w6(0x247));
            else {
              const tQ = eK[tK];
              k8(k5, hN[tQ[w6(0xcce)]] + "\x20" + tQ[w6(0xaba)]);
            }
            on(), (om = {}), (kn[w6(0x397)][w6(0x373)] = ""), hi();
          }
          break;
        default:
          console[w6(0xabc)](w6(0xd98) + rx);
      }
    }
    var k2 = document[uf(0xa10)](uf(0x7fa)),
      k3 = document[uf(0xa10)](uf(0x358)),
      k4 = document[uf(0xa10)](uf(0x101)),
      k5 = document[uf(0xa10)](uf(0x153)),
      k6 = document[uf(0xa10)](uf(0x8c4)),
      k7 = document[uf(0xa10)](uf(0x9c2));
    function k8(rk, rl) {
      const wm = uf;
      rk[wm(0x491)](wm(0x6f2), rl);
    }
    function k9(rk) {
      const wn = uf;
      return rk[wn(0x166)](wn(0xc61));
    }
    function ka(rk, rl) {
      const wo = uf,
        rm = [
          Math[wo(0xa9a)](rk / (0x3e8 * 0x3c * 0x3c)),
          Math[wo(0xa9a)]((rk % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wo(0xa9a)]((rk % (0x3e8 * 0x3c)) / 0x3e8),
        ],
        rn = ["h", "m", "s"];
      let ro = "";
      const rp = rl ? 0x1 : 0x2;
      for (let rq = 0x0; rq <= rp; rq++) {
        const rr = rm[rq];
        (rr > 0x0 || rq == rp) && (ro += rr + rn[rq] + "\x20");
      }
      return ro;
    }
    const kb = {
      [cS[uf(0x754)]]: uf(0xb62),
      [cS[uf(0x2fe)]]: uf(0x2dc),
      [cS[uf(0x62b)]]: uf(0x2dc),
      [cS[uf(0x854)]]: uf(0x728),
      [cS[uf(0x224)]]: uf(0x728),
      [cS[uf(0x657)]]: uf(0xc9d),
      [cS[uf(0x1a2)]]: uf(0xc9d),
      [cS[uf(0x201)]]: uf(0x3c6),
      [cS[uf(0x15f)]]: uf(0xcfa),
    };
    kb["0"] = uf(0x247);
    var kc = kb;
    for (let rk in cS) {
      const rl = cS[rk];
      if (kc[rl]) continue;
      const rm = kd(rk);
      kc[rl] = rm[uf(0x516)](uf(0x948), uf(0xc20));
    }
    function kd(rn) {
      const wp = uf,
        ro = rn[wp(0x516)](/([A-Z])/g, wp(0x52f)),
        rp = ro[wp(0xc13)](0x0)[wp(0xd1e)]() + ro[wp(0x4e2)](0x1);
      return rp;
    }
    var ke = null,
      kf = !![];
    function kg() {
      const wq = uf;
      console[wq(0xabc)](wq(0x886)),
        hT(),
        ju[wq(0x474)][wq(0xa5a)](wq(0x9b3)),
        kf &&
          (kk[wq(0x397)][wq(0x373)] === wq(0x972)
            ? (clearTimeout(ke),
              kC[wq(0x474)][wq(0x1b0)](wq(0x9b3)),
              (ke = setTimeout(function () {
                const wr = wq;
                kC[wr(0x474)][wr(0xa5a)](wr(0x9b3)),
                  (kk[wr(0x397)][wr(0x373)] = ""),
                  kB[wr(0x215)](ko),
                  (kn[wr(0x397)][wr(0x373)] = km[wr(0x397)][wr(0x373)] =
                    wr(0x972)),
                  hi(),
                  hV(hU[wr(0x461)]);
              }, 0x1f4)))
            : (kC[wq(0x474)][wq(0xa5a)](wq(0x9b3)), hV(hU[wq(0x461)])));
    }
    function kh(rn, ro) {
      return rn + "\x20" + ro + (rn === 0x1 ? "" : "s");
    }
    var ki = document[uf(0x262)](uf(0x606)),
      kj = ki[uf(0xb87)]("2d"),
      kk = document[uf(0xa10)](uf(0x4e9)),
      kl = document[uf(0xa10)](uf(0x5d7)),
      km = document[uf(0xa10)](uf(0x8b2));
    km[uf(0x397)][uf(0x373)] = uf(0x972);
    var kn = document[uf(0xa10)](uf(0xc7c));
    kn[uf(0x397)][uf(0x373)] = uf(0x972);
    var ko = document[uf(0xa10)](uf(0x496)),
      kp = document[uf(0xa10)](uf(0x987)),
      kq = document[uf(0xa10)](uf(0x666));
    function kr() {
      const ws = uf;
      kq[ws(0xd6e)] = "";
      for (let rn = 0x0; rn < 0x32; rn++) {
        const ro = ks[rn],
          rp = nA(ws(0x7ed) + rn + ws(0x9aa)),
          rq = rp[ws(0xa10)](ws(0x7f6));
        if (ro)
          for (let rr = 0x0; rr < ro[ws(0xbc8)]; rr++) {
            const rs = ro[rr],
              rt = dF[rs];
            if (!rt) rq[ws(0xd58)](nA(ws(0x417)));
            else {
              const ru = nA(
                ws(0x6b2) + rt[ws(0xcce)] + "\x22\x20" + qk(rt) + ws(0x697)
              );
              (ru[ws(0xbca)] = rt),
                (ru[ws(0xa0e)] = kp),
                jY(ru),
                rq[ws(0xd58)](ru);
            }
          }
        else rq[ws(0xd6e)] = ws(0x417)[ws(0x462)](0x5);
        (rp[ws(0xa10)](ws(0xda))[ws(0xc3)] = function () {
          ku(rn);
        }),
          (rp[ws(0xa10)](ws(0x6cb))[ws(0xc3)] = function () {
            kx(rn);
          }),
          kq[ws(0xd58)](rp);
      }
    }
    var ks = kt();
    function kt() {
      const wt = uf;
      try {
        const rn = JSON[wt(0x681)](hD[wt(0xc45)]);
        for (const ro in rn) {
          !Array[wt(0x9fe)](rn[ro]) && delete rn[ro];
        }
        return rn;
      } catch {
        return {};
      }
    }
    function ku(rn) {
      const wu = uf,
        ro = [],
        rp = nk[wu(0x5fc)](wu(0xb44));
      for (let rq = 0x0; rq < rp[wu(0xbc8)]; rq++) {
        const rr = rp[rq],
          rs = rr[wu(0x8c1)][0x0];
        !rs ? (ro[rq] = null) : (ro[rq] = rs[wu(0xbca)][wu(0x9ed)]);
      }
      (ks[rn] = ro),
        (hD[wu(0xc45)] = JSON[wu(0xa99)](ks)),
        kr(),
        hc(wu(0x95a) + rn + "!");
    }
    function kv() {
      const wv = uf;
      return nk[wv(0x5fc)](wv(0xb44));
    }
    document[uf(0xa10)](uf(0x84f))[uf(0xc3)] = function () {
      kw();
    };
    function kw() {
      const ww = uf,
        rn = kv();
      for (const ro of rn) {
        const rp = ro[ww(0x8c1)][0x0];
        if (!rp) continue;
        rp[ww(0xa5a)](),
          iR[ww(0x6aa)](rp[ww(0x5d1)]),
          mQ(rp[ww(0xbca)]["id"], 0x1),
          il(new Uint8Array([cI[ww(0x9c7)], ro[ww(0xd36)]]));
      }
    }
    function kx(rn) {
      const wx = uf;
      if (mt || ms[wx(0xbc8)] > 0x0) return;
      const ro = ks[rn];
      if (!ro) return;
      kw();
      const rp = kv(),
        rq = Math[wx(0xc0c)](rp[wx(0xbc8)], ro[wx(0xbc8)]);
      for (let rr = 0x0; rr < rq; rr++) {
        const rs = ro[rr],
          rt = dF[rs];
        if (!rt || !iS[rt["id"]]) continue;
        const ru = nA(
          wx(0x6b2) + rt[wx(0xcce)] + "\x22\x20" + qk(rt) + wx(0x697)
        );
        (ru[wx(0xbca)] = rt),
          (ru[wx(0x864)] = !![]),
          (ru[wx(0x5d1)] = iR[wx(0x565)]()),
          nz(ru, rt),
          (iQ[ru[wx(0x5d1)]] = ru),
          rp[rr][wx(0xd58)](ru),
          mQ(ru[wx(0xbca)]["id"], -0x1);
        const rv = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rv[wx(0x227)](0x0, cI[wx(0x691)]),
          rv[wx(0x4b7)](0x1, ru[wx(0xbca)]["id"]),
          rv[wx(0x227)](0x3, rr),
          il(rv);
      }
      hc(wx(0xc7b) + rn + "!");
    }
    var ky = document[uf(0xa10)](uf(0xd65)),
      kz = document[uf(0xa10)](uf(0x567));
    kz[uf(0xc3)] = function () {
      const wy = uf;
      kC[wy(0x474)][wy(0x1b0)](wy(0x9b3)),
        jy
          ? (ke = setTimeout(function () {
              const wz = wy;
              il(new Uint8Array([cI[wz(0x302)]]));
            }, 0x1f4))
          : (ke = setTimeout(function () {
              const wA = wy;
              kC[wA(0x474)][wA(0xa5a)](wA(0x9b3)),
                (km[wA(0x397)][wA(0x373)] = kn[wA(0x397)][wA(0x373)] =
                  wA(0x972)),
                (kk[wA(0x397)][wA(0x373)] = ""),
                kB[wA(0x215)](ko),
                kB[wA(0x474)][wA(0x1b0)](wA(0x9b3)),
                jg();
            }, 0x1f4));
    };
    var kA = document[uf(0xa10)](uf(0xd1f)),
      kB = document[uf(0xa10)](uf(0x6c8));
    kB[uf(0x474)][uf(0x1b0)](uf(0x9b3));
    var kC = document[uf(0xa10)](uf(0xa5e)),
      kD = document[uf(0xa10)](uf(0x27f)),
      kE = document[uf(0xa10)](uf(0xb70));
    (kE[uf(0x94c)] = hD[uf(0x665)] || ""),
      (kE[uf(0x672)] = cK),
      (kE[uf(0x1d7)] = function () {
        const wB = uf;
        hD[wB(0x665)] = this[wB(0x94c)];
      });
    var kF;
    kD[uf(0xc3)] = function () {
      if (!hW) return;
      kG();
    };
    function kG(rn = ![]) {
      const wC = uf;
      hack.chatFunc = hK;
      hack.toastFunc = hc;
      hack.onload();
      hack.moblst = eO;
      if (kk[wC(0x397)][wC(0x373)] === wC(0x972)) {
        kC[wC(0x474)][wC(0xa5a)](wC(0x9b3));
        return;
      }
      clearTimeout(kF),
        kB[wC(0x474)][wC(0xa5a)](wC(0x9b3)),
        (kF = setTimeout(() => {
          const wD = wC;
          kC[wD(0x474)][wD(0x1b0)](wD(0x9b3)),
            (kF = setTimeout(() => {
              const wE = wD;
              rn && kC[wE(0x474)][wE(0xa5a)](wE(0x9b3)),
                (kk[wE(0x397)][wE(0x373)] = wE(0x972)),
                (hg[wE(0x397)][wE(0x373)] = wE(0x972)),
                (km[wE(0x397)][wE(0x373)] = ""),
                km[wE(0xd58)](ko),
                iq(kE[wE(0x94c)][wE(0x4e2)](0x0, cK));
            }, 0x1f4));
        }, 0x64));
    }
    var kH = document[uf(0xa10)](uf(0xcf3));
    function kI(rn, ro, rp) {
      const wF = uf,
        rq = {};
      (rq[wF(0xcb5)] = wF(0x80f)), (rq[wF(0x554)] = !![]), (rp = rp || rq);
      const rr = nA(
        wF(0x6a1) +
          rp[wF(0xcb5)] +
          wF(0xcd6) +
          rn +
          wF(0x50a) +
          (rp[wF(0x554)] ? wF(0xca6) : "") +
          wF(0xc8c)
      );
      return (
        (rr[wF(0xa10)](wF(0xc2f))[wF(0xc3)] = function () {
          const wG = wF;
          ro(!![]), rr[wG(0xa5a)]();
        }),
        (rr[wF(0xa10)](wF(0x3d4))[wF(0xc3)] = function () {
          const wH = wF;
          rr[wH(0xa5a)](), ro(![]);
        }),
        kH[wF(0xd58)](rr),
        rr
      );
    }
    function kJ() {
      function rn(rv, rw, rx, ry, rz) {
        return rq(ry - 0x20c, rx);
      }
      function ro() {
        const wI = b,
          rv = [
            wI(0xa08),
            wI(0x7a4),
            wI(0xb35),
            wI(0x6a2),
            wI(0xcc3),
            wI(0xd3f),
            wI(0x45d),
            wI(0x3ec),
            wI(0xa60),
            wI(0x973),
            wI(0x377),
            wI(0x494),
            wI(0xc09),
            wI(0xbb1),
            wI(0xd68),
            wI(0x983),
            wI(0xbd1),
            wI(0xc59),
            wI(0x53c),
            wI(0x9e6),
            wI(0xc27),
            wI(0x6a8),
            wI(0x775),
            wI(0x4b4),
            wI(0x850),
            wI(0xbca),
            wI(0xb73),
            wI(0x7bd),
            wI(0x48e),
            wI(0x4cd),
            wI(0x9a9),
            wI(0xb92),
            wI(0x32b),
            wI(0x68d),
            wI(0x821),
            wI(0x774),
            wI(0x3bf),
            wI(0x592),
            wI(0xb9c),
            wI(0xdaa),
            wI(0x4c3),
            wI(0x30a),
            wI(0x2eb),
            wI(0xb27),
            wI(0xcd3),
            wI(0xc87),
            wI(0xb50),
            wI(0xb8f),
            wI(0xd5),
            wI(0xa7e),
            wI(0xc86),
            wI(0x8b0),
            wI(0x698),
            wI(0xce4),
            wI(0x832),
            wI(0x3ed),
            wI(0x55d),
            wI(0x155),
            wI(0x3a8),
            wI(0x527),
            wI(0x3ac),
            wI(0x66b),
            wI(0x5ac),
            wI(0xb01),
            wI(0x79e),
            wI(0xa97),
            wI(0xa02),
            wI(0x3d6),
            wI(0xd05),
            wI(0x52e),
            wI(0xb6f),
            wI(0x3d5),
            wI(0x2c1),
            wI(0x81a),
            wI(0x120),
            wI(0x15c),
            wI(0xac2),
            wI(0xdc1),
            wI(0x6bc),
            wI(0xdf),
            wI(0x29a),
            wI(0xd3b),
            wI(0x22c),
            wI(0xdbd),
            wI(0x6ea),
            wI(0x102),
            wI(0x971),
            wI(0xbdd),
            wI(0xd2),
          ];
        return (
          (ro = function () {
            return rv;
          }),
          ro()
        );
      }
      function rp(rv, rw, rx, ry, rz) {
        return rq(rw - 0x322, rx);
      }
      function rq(rv, rw) {
        const rx = ro();
        return (
          (rq = function (ry, rz) {
            ry = ry - (0x12b9 * 0x1 + 0x2f5 * 0xb + -0x3263);
            let rA = rx[ry];
            return rA;
          }),
          rq(rv, rw)
        );
      }
      function rr(rv, rw, rx, ry, rz) {
        return rq(rx - 0x398, rw);
      }
      (function (rv, rw) {
        const wJ = b;
        function rx(rD, rE, rF, rG, rH) {
          return rq(rD - -0x202, rE);
        }
        function ry(rD, rE, rF, rG, rH) {
          return rq(rE - -0x361, rG);
        }
        const rz = rv();
        function rA(rD, rE, rF, rG, rH) {
          return rq(rE - -0x1c0, rG);
        }
        function rB(rD, rE, rF, rG, rH) {
          return rq(rG - 0x1f1, rH);
        }
        function rC(rD, rE, rF, rG, rH) {
          return rq(rH - 0x352, rG);
        }
        while (!![]) {
          try {
            const rD =
              -parseInt(rx(-0xfd, -0x103, -0xdd, -0xfe, -0x10a)) /
                (-0x14de + 0x14ac + -0x33 * -0x1) +
              (parseInt(rx(-0xf2, -0x102, -0x107, -0x110, -0x114)) /
                (-0xe4b * -0x1 + 0x2 * 0x1039 + -0x2ebb)) *
                (parseInt(rC(0x413, 0x428, 0x42c, 0x416, 0x43b)) /
                  (-0x1ec7 * 0x1 + -0x19f * -0x14 + -0x1a2)) +
              parseInt(rB(0x300, 0x307, 0x2f6, 0x30d, 0x2fd)) /
                (-0x1 * 0x17bf + 0xbba * 0x1 + -0x27 * -0x4f) +
              parseInt(ry(-0x260, -0x274, -0x280, -0x248, -0x27f)) /
                (-0x2706 + -0x17b5 + 0x20 * 0x1f6) +
              (parseInt(rC(0x45e, 0x496, 0x48c, 0x49d, 0x47d)) /
                (0x260f * -0x1 + 0x1 * -0x20a1 + 0x46b6)) *
                (parseInt(ry(-0x23e, -0x25f, -0x278, -0x280, -0x256)) /
                  (-0xca9 + -0xbd5 + 0x1885)) +
              -parseInt(rC(0x452, 0x456, 0x44a, 0x433, 0x44e)) /
                (-0xcce + -0x2482 + 0x4 * 0xc56) +
              (-parseInt(rA(-0xec, -0xc2, -0xe4, -0xe7, -0xc6)) /
                (-0x2 * -0x183 + 0x887 * -0x2 + 0x115 * 0xd)) *
                (parseInt(rx(-0x122, -0x12f, -0x129, -0x120, -0x12a)) /
                  (-0x750 + 0x4 * 0x29f + 0x1 * -0x322));
            if (rD === rw) break;
            else rz[wJ(0x6aa)](rz[wJ(0x6f7)]());
          } catch (rE) {
            rz[wJ(0x6aa)](rz[wJ(0x6f7)]());
          }
        }
      })(ro, -0x51c14 * -0x1 + -0x87309 + 0x92db * 0x13);
      const rs = [
        rt(0x22c, 0x242, 0x249, 0x246, 0x242) +
          rr(0x4bd, 0x4b8, 0x4ab, 0x481, 0x4c9) +
          rr(0x4b0, 0x49e, 0x4bb, 0x4c5, 0x4c8) +
          ru(-0x128, -0x11a, -0x135, -0x121, -0x144),
        rr(0x491, 0x482, 0x49e, 0x4ba, 0x48b) +
          rt(0x234, 0x22e, 0x229, 0x255, 0x244),
        ru(-0x14e, -0x170, -0x171, -0x14b, -0x136) +
          rt(0x265, 0x275, 0x23c, 0x287, 0x241),
      ];
      function rt(rv, rw, rx, ry, rz) {
        return rq(rv - 0x140, rz);
      }
      function ru(rv, rw, rx, ry, rz) {
        return rq(ry - -0x23b, rw);
      }
      !rs[
        rt(0x23f, 0x225, 0x23c, 0x231, 0x269) +
          ru(-0x147, -0x157, -0x129, -0x12c, -0x154)
      ](
        window[
          ru(-0x11a, -0x12c, -0x15c, -0x144, -0x128) +
            rp(0x44e, 0x42f, 0x445, 0x45a, 0x404)
        ][
          rr(0x4d2, 0x4b9, 0x4ad, 0x4ca, 0x4a0) +
            ru(-0x15e, -0x112, -0x150, -0x13b, -0x147)
        ][
          rn(0x331, 0x314, 0x315, 0x31d, 0x31c) +
            ru(-0xed, -0xf8, -0xe4, -0x109, -0xfb) +
            "e"
        ]()
      ) &&
        (alert(
          rt(0x228, 0x1fd, 0x211, 0x21d, 0x21f) +
            rn(0x322, 0x354, 0x32c, 0x327, 0x321) +
            rn(0x316, 0x333, 0x2f3, 0x30f, 0x32b) +
            rp(0x471, 0x448, 0x42a, 0x421, 0x44c) +
            rt(0x249, 0x26b, 0x26f, 0x225, 0x276) +
            ru(-0x15f, -0x11d, -0x133, -0x137, -0x116) +
            rp(0x3fb, 0x411, 0x42e, 0x42e, 0x404) +
            rr(0x484, 0x454, 0x475, 0x44f, 0x452) +
            ru(-0x11b, -0x13a, -0x133, -0x11d, -0x132) +
            ru(-0xf4, -0xfc, -0xf7, -0x10a, -0xff) +
            rr(0x4ba, 0x4e9, 0x4cd, 0x4ef, 0x4c5) +
            rr(0x461, 0x492, 0x47f, 0x493, 0x49f) +
            ru(-0x156, -0x130, -0x120, -0x14a, -0x123) +
            rt(0x21e, 0x236, 0x241, 0x246, 0x215) +
            rp(0x44f, 0x444, 0x44b, 0x46c, 0x43d) +
            rp(0x441, 0x44f, 0x47b, 0x428, 0x470) +
            ru(-0x170, -0x13c, -0x14a, -0x145, -0x131) +
            rt(0x238, 0x243, 0x25f, 0x25c, 0x246) +
            rr(0x49e, 0x486, 0x4af, 0x4c8, 0x495) +
            rn(0x2e9, 0x2fe, 0x2f3, 0x301, 0x325) +
            rt(0x226, 0x208, 0x20b, 0x23b, 0x1ff) +
            rp(0x464, 0x43d, 0x464, 0x448, 0x414) +
            rn(0x330, 0x306, 0x342, 0x324, 0x324) +
            rp(0x43f, 0x43f, 0x42d, 0x43f, 0x414) +
            rn(0x2cb, 0x318, 0x2ca, 0x2ef, 0x2e0) +
            ru(-0x108, -0x10e, -0x12f, -0x10d, -0xf7) +
            rn(0x341, 0x31a, 0x310, 0x333, 0x350) +
            rr(0x4b1, 0x49c, 0x4c4, 0x4b8, 0x4d7) +
            rn(0x354, 0x350, 0x365, 0x33f, 0x347) +
            rr(0x4b5, 0x4d3, 0x4c8, 0x4e0, 0x4bf) +
            rt(0x252, 0x24c, 0x26c, 0x230, 0x273)
        ),
        kI(
          rn(0x325, 0x318, 0x30f, 0x325, 0x328) +
            ru(-0x127, -0x15e, -0x162, -0x13e, -0x13f) +
            rt(0x21f, 0x23c, 0x245, 0x21b, 0x248) +
            rp(0x411, 0x414, 0x43b, 0x43e, 0x423) +
            rn(0x31d, 0x369, 0x349, 0x340, 0x34d) +
            rt(0x26a, 0x273, 0x255, 0x295, 0x261) +
            rr(0x4b3, 0x48a, 0x48b, 0x466, 0x46c) +
            rt(0x268, 0x278, 0x28c, 0x25c, 0x259) +
            rt(0x24b, 0x224, 0x277, 0x26c, 0x232) +
            ru(-0x10d, -0x153, -0x124, -0x134, -0x14c) +
            rr(0x477, 0x4a5, 0x47d, 0x45c, 0x45a) +
            rt(0x224, 0x215, 0x21a, 0x24d, 0x24e) +
            rt(0x239, 0x252, 0x21c, 0x236, 0x20d) +
            ru(-0x179, -0x15f, -0x12f, -0x159, -0x142) +
            rn(0x307, 0x300, 0x2fa, 0x322, 0x315) +
            rp(0x458, 0x44b, 0x441, 0x42e, 0x43f) +
            ru(-0x117, -0x144, -0xf0, -0x117, -0x13b) +
            rt(0x23a, 0x224, 0x252, 0x226, 0x250) +
            rt(0x254, 0x247, 0x22b, 0x248, 0x26d) +
            rt(0x22b, 0x20c, 0x200, 0x246, 0x23b) +
            ru(-0x175, -0x175, -0x174, -0x15d, -0x13f) +
            rn(0x2d5, 0x2fa, 0x2d1, 0x2ed, 0x2f5) +
            rn(0x310, 0x312, 0x304, 0x2f6, 0x308) +
            rt(0x24c, 0x22b, 0x249, 0x24e, 0x23b) +
            rt(0x260, 0x27b, 0x28c, 0x28c, 0x235) +
            ru(-0x135, -0x141, -0x126, -0x140, -0x154) +
            rp(0x461, 0x441, 0x442, 0x428, 0x466) +
            rn(0x2e2, 0x326, 0x2f5, 0x2fa, 0x2f3) +
            "v>",
          (rv) => {
            const rw = {};
            rw[rz(-0x281, -0x2a8, -0x288, -0x28b, -0x282)] =
              rz(-0x28e, -0x297, -0x26e, -0x292, -0x28b) +
              rz(-0x285, -0x2ab, -0x289, -0x2b0, -0x2a7) +
              rC(0x3f2, 0x3f5, 0x3e1, 0x3e1, 0x3e3) +
              rB(0x146, 0x141, 0x11f, 0x14b, 0x15a);
            function rx(rD, rE, rF, rG, rH) {
              return rn(rD - 0x10e, rE - 0xae, rG, rE - 0xdd, rH - 0x14d);
            }
            const ry = rw;
            function rz(rD, rE, rF, rG, rH) {
              return rp(rD - 0x13a, rD - -0x6b1, rE, rG - 0x11b, rH - 0x1a6);
            }
            function rA(rD, rE, rF, rG, rH) {
              return ru(rD - 0x193, rH, rF - 0x13d, rF - 0x423, rH - 0x15b);
            }
            function rB(rD, rE, rF, rG, rH) {
              return rt(rG - -0x124, rE - 0xf8, rF - 0x15a, rG - 0x16e, rF);
            }
            function rC(rD, rE, rF, rG, rH) {
              return rt(rE - 0x1ad, rE - 0x30, rF - 0x170, rG - 0x1d5, rD);
            }
            !rv &&
              (window[
                rB(0xea, 0x112, 0x108, 0x113, 0x129) +
                  rA(0x2dc, 0x2ec, 0x2f5, 0x2e3, 0x2e2)
              ][rA(0x334, 0x305, 0x309, 0x31b, 0x2fd)] =
                ry[rA(0x2d4, 0x319, 0x2f6, 0x2e2, 0x31b)]);
          }
        ));
    }
    kJ();
    var kK = document[uf(0xa10)](uf(0x923)),
      kL = (function () {
        const wL = uf;
        let rn = ![];
        return (
          (function (ro) {
            const wK = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                wK(0x7a5)
              ](ro) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                wK(0x7a5)
              ](ro[wK(0x426)](0x0, 0x4))
            )
              rn = !![];
          })(navigator[wL(0x4f6)] || navigator[wL(0xc35)] || window[wL(0x35e)]),
          rn
        );
      })(),
      kM =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          uf(0x7a5)
        ](navigator[uf(0x4f6)][uf(0x682)]()),
      kN = 0x514,
      kO = 0x28a,
      kP = 0x1,
      kQ = [km, kk, kn, kl, kH, hg],
      kR = 0x1,
      kS = 0x1;
    function kT() {
      const wM = uf;
      (kS = Math[wM(0x411)](ki[wM(0x766)] / d0, ki[wM(0x3bb)] / d1)),
        (kR =
          Math[oV[wM(0xb8e)] ? wM(0xc0c) : wM(0x411)](kU() / kN, kV() / kO) *
          (kL && !kM ? 1.1 : 0x1)),
        (kR *= kP);
      for (let rn = 0x0; rn < kQ[wM(0xbc8)]; rn++) {
        const ro = kQ[rn];
        let rp = kR * (ro[wM(0x54a)] || 0x1);
        (ro[wM(0x397)][wM(0x99f)] = wM(0xb06) + rp + ")"),
          (ro[wM(0x397)][wM(0x67a)] = wM(0x205)),
          (ro[wM(0x397)][wM(0x766)] = kU() / rp + "px"),
          (ro[wM(0x397)][wM(0x3bb)] = kV() / rp + "px");
      }
    }
    function kU() {
      const wN = uf;
      return document[wN(0xc36)][wN(0xb83)];
    }
    function kV() {
      const wO = uf;
      return document[wO(0xc36)][wO(0x859)];
    }
    var kW = 0x1;
    function kX() {
      const wP = uf;
      (kW = oV[wP(0x1e4)] ? 0.65 : window[wP(0x536)]),
        (ki[wP(0x766)] = kU() * kW),
        (ki[wP(0x3bb)] = kV() * kW),
        kT();
      for (let rn = 0x0; rn < ms[wP(0xbc8)]; rn++) {
        ms[rn][wP(0xb86)]();
      }
    }
    window[uf(0xc9c)] = function () {
      kX(), qs();
    };
    var kY = (function () {
        const wQ = uf,
          rn = 0x23,
          ro = rn / 0x2,
          rp = document[wQ(0x966)](wQ(0x606));
        rp[wQ(0x766)] = rp[wQ(0x3bb)] = rn;
        const rq = rp[wQ(0xb87)]("2d");
        return (
          (rq[wQ(0xfb)] = wQ(0x396)),
          rq[wQ(0x787)](),
          rq[wQ(0x92d)](0x0, ro),
          rq[wQ(0xbe4)](rn, ro),
          rq[wQ(0x92d)](ro, 0x0),
          rq[wQ(0xbe4)](ro, rn),
          rq[wQ(0x6f2)](),
          rq[wQ(0xcb9)](rp, wQ(0x462))
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
    function l2(rn, ro, rp = 0x8) {
      const wR = uf;
      ro *= -0x1;
      const rq = Math[wR(0xa87)](rn),
        rr = Math[wR(0x7f1)](rn),
        rs = rq * 0x28,
        rt = rr * 0x28;
      l1[wR(0x6aa)]({
        dir: ro,
        start: [rs, rt],
        curve: [
          rs + rq * 0x17 + -rr * ro * rp,
          rt + rr * 0x17 + rq * ro * rp,
          rs + rq * 0x2e,
          rt + rr * 0x2e,
        ],
        side: Math[wR(0xadd)](rn),
      });
    }
    var l3 = l4();
    function l4() {
      const wS = uf,
        rn = new Path2D(),
        ro = Math["PI"] / 0x5;
      return (
        rn[wS(0x769)](0x0, 0x0, 0x28, ro, l0 - ro),
        rn[wS(0x2d2)](
          0x12,
          0x0,
          Math[wS(0xa87)](ro) * 0x28,
          Math[wS(0x7f1)](ro) * 0x28
        ),
        rn[wS(0x8ef)](),
        rn
      );
    }
    var l5 = l6();
    function l6() {
      const wT = uf,
        rn = new Path2D();
      return (
        rn[wT(0x92d)](-0x28, 0x5),
        rn[wT(0x9f1)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rn[wT(0xbe4)](0x28, -0x5),
        rn[wT(0x9f1)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rn[wT(0x8ef)](),
        rn
      );
    }
    function l7(rn, ro = 0x1, rp = 0x0) {
      const wU = uf,
        rq = new Path2D();
      for (let rr = 0x0; rr < rn; rr++) {
        const rs = (Math["PI"] * 0x2 * rr) / rn + rp;
        rq[wU(0xbe4)](
          Math[wU(0xa87)](rs) - Math[wU(0x7f1)](rs) * 0.1 * ro,
          Math[wU(0x7f1)](rs)
        );
      }
      return rq[wU(0x8ef)](), rq;
    }
    var l8 = {
      petalRock: l7(0x5),
      petalSoil: l7(0xa),
      petalSalt: l7(0x7),
      petalLightning: (function () {
        const wV = uf,
          rn = new Path2D();
        for (let ro = 0x0; ro < 0x14; ro++) {
          const rp = (ro / 0x14) * Math["PI"] * 0x2,
            rq = ro % 0x2 === 0x0 ? 0x1 : 0.55;
          rn[wV(0xbe4)](Math[wV(0xa87)](rp) * rq, Math[wV(0x7f1)](rp) * rq);
        }
        return rn[wV(0x8ef)](), rn;
      })(),
      petalCotton: la(0x9, 0x1, 0.5, 1.6),
      petalWeb: la(0x5, 0x1, 0.5, 0.7),
      petalCactus: la(0x8, 0x1, 0.5, 0.7),
      petalSand: l7(0x6, 0x0, 0.2),
    };
    function l9(rn, ro, rp, rq, rr) {
      const wW = uf;
      (rn[wW(0xfb)] = rr),
        (rn[wW(0x6b1)] = rp),
        rn[wW(0xa26)](),
        (ro *= 0.45),
        rn[wW(0x5b0)](ro),
        rn[wW(0xb25)](-0x14, 0x0),
        rn[wW(0x787)](),
        rn[wW(0x92d)](0x0, 0x26),
        rn[wW(0xbe4)](0x50, 0x7),
        rn[wW(0xbe4)](0x50, -0x7),
        rn[wW(0xbe4)](0x0, -0x26),
        rn[wW(0xbe4)](-0x14, -0x1e),
        rn[wW(0xbe4)](-0x14, 0x1e),
        rn[wW(0x8ef)](),
        (rp = rp / ro),
        (rn[wW(0x6b1)] = 0x64 + rp),
        (rn[wW(0xfb)] = rr),
        rn[wW(0x6f2)](),
        (rn[wW(0xfb)] = rn[wW(0x716)] = rq),
        (rn[wW(0x6b1)] -= rp * 0x2),
        rn[wW(0x6f2)](),
        rn[wW(0x190)](),
        rn[wW(0x20f)]();
    }
    function la(rn, ro, rp, rq) {
      const wX = uf,
        rr = new Path2D();
      return lb(rr, rn, ro, rp, rq), rr[wX(0x8ef)](), rr;
    }
    function lb(rn, ro, rp, rq, rr) {
      const wY = uf;
      rn[wY(0x92d)](rp, 0x0);
      for (let rs = 0x1; rs <= ro; rs++) {
        const rt = (Math["PI"] * 0x2 * (rs - rq)) / ro,
          ru = (Math["PI"] * 0x2 * rs) / ro;
        rn[wY(0x2d2)](
          Math[wY(0xa87)](rt) * rp * rr,
          Math[wY(0x7f1)](rt) * rp * rr,
          Math[wY(0xa87)](ru) * rp,
          Math[wY(0x7f1)](ru) * rp
        );
      }
    }
    var lc = (function () {
        const wZ = uf,
          rn = new Path2D();
        rn[wZ(0x92d)](0x3c, 0x0);
        const ro = 0x6;
        for (let rp = 0x0; rp < ro; rp++) {
          const rq = ((rp + 0.5) / ro) * Math["PI"] * 0x2,
            rr = ((rp + 0x1) / ro) * Math["PI"] * 0x2;
          rn[wZ(0x2d2)](
            Math[wZ(0xa87)](rq) * 0x78,
            Math[wZ(0x7f1)](rq) * 0x78,
            Math[wZ(0xa87)](rr) * 0x3c,
            Math[wZ(0x7f1)](rr) * 0x3c
          );
        }
        return rn[wZ(0x8ef)](), rn;
      })(),
      ld = (function () {
        const x0 = uf,
          rn = new Path2D(),
          ro = 0x6;
        for (let rp = 0x0; rp < ro; rp++) {
          const rq = ((rp + 0.5) / ro) * Math["PI"] * 0x2;
          rn[x0(0x92d)](0x0, 0x0), rn[x0(0xbe4)](...le(0x37, 0x0, rq));
          for (let rr = 0x0; rr < 0x2; rr++) {
            const rs = (rr / 0x2) * 0x1e + 0x14,
              rt = 0xa - rr * 0x2;
            rn[x0(0x92d)](...le(rs + rt, -rt, rq)),
              rn[x0(0xbe4)](...le(rs, 0x0, rq)),
              rn[x0(0xbe4)](...le(rs + rt, rt, rq));
          }
        }
        return rn;
      })();
    function le(rn, ro, rp) {
      const x1 = uf,
        rq = Math[x1(0x7f1)](rp),
        rr = Math[x1(0xa87)](rp);
      return [rn * rr + ro * rq, ro * rr - rn * rq];
    }
    function lf(rn, ro, rp) {
      (rn /= 0x168), (ro /= 0x64), (rp /= 0x64);
      let rq, rr, rs;
      if (ro === 0x0) rq = rr = rs = rp;
      else {
        const ru = (rx, ry, rz) => {
            if (rz < 0x0) rz += 0x1;
            if (rz > 0x1) rz -= 0x1;
            if (rz < 0x1 / 0x6) return rx + (ry - rx) * 0x6 * rz;
            if (rz < 0x1 / 0x2) return ry;
            if (rz < 0x2 / 0x3) return rx + (ry - rx) * (0x2 / 0x3 - rz) * 0x6;
            return rx;
          },
          rv = rp < 0.5 ? rp * (0x1 + ro) : rp + ro - rp * ro,
          rw = 0x2 * rp - rv;
        (rq = ru(rw, rv, rn + 0x1 / 0x3)),
          (rr = ru(rw, rv, rn)),
          (rs = ru(rw, rv, rn - 0x1 / 0x3));
      }
      const rt = (rx) => {
        const x2 = b,
          ry = Math[x2(0xac6)](rx * 0xff)[x2(0x12a)](0x10);
        return ry[x2(0xbc8)] === 0x1 ? "0" + ry : ry;
      };
      return "#" + rt(rq) + rt(rr) + rt(rs);
    }
    var lg = [];
    for (let rn = 0x0; rn < 0xa; rn++) {
      const ro = 0x1 - rn / 0xa;
      lg[uf(0x6aa)](lf(0x28 + ro * 0xc8, 0x50, 0x3c * ro));
    }
    var lh = [uf(0x151), uf(0x875)],
      li = lh[0x0],
      lj = [uf(0xc06), uf(0x8fe), uf(0x805), uf(0xda8)];
    function lk(rp = uf(0x2e4)) {
      const x3 = uf,
        rq = [];
      for (let rr = 0x0; rr < 0x5; rr++) {
        rq[x3(0x6aa)](pJ(rp, 0.8 - (rr / 0x5) * 0.25));
      }
      return rq;
    }
    var ll = {
        pet: {
          body: li,
          wing: pJ(li, 0.7),
          tail_outline: pJ(li, 0.4),
          bone_outline: pJ(li, 0.4),
          bone: pJ(li, 0.6),
          tail: lk(pJ(li, 0.8)),
        },
        main: {
          body: uf(0x2e4),
          wing: uf(0x8ae),
          tail_outline: uf(0xe4),
          bone_outline: uf(0xca5),
          bone: uf(0xe4),
          tail: lk(),
        },
      },
      lm = new Path2D(uf(0x929)),
      ln = new Path2D(uf(0x46c)),
      lo = [];
    for (let rp = 0x0; rp < 0x3; rp++) {
      lo[uf(0x6aa)](pJ(lh[0x0], 0x1 - (rp / 0x3) * 0.2));
    }
    function lp(rq = Math[uf(0xb03)]()) {
      return function () {
        return (rq = (rq * 0x2455 + 0xc091) % 0x38f40), rq / 0x38f40;
      };
    }
    const lq = {
      [cS[uf(0x413)]]: [uf(0xb71), uf(0xd7b)],
      [cS[uf(0x531)]]: [uf(0x2e4), uf(0x932)],
      [cS[uf(0x503)]]: [uf(0x152), uf(0x662)],
    };
    var lr = lq;
    const ls = {};
    (ls[uf(0x135)] = !![]),
      (ls[uf(0x2ec)] = !![]),
      (ls[uf(0x184)] = !![]),
      (ls[uf(0x8e2)] = !![]),
      (ls[uf(0xbf7)] = !![]),
      (ls[uf(0x1d5)] = !![]),
      (ls[uf(0x197)] = !![]);
    var lt = ls;
    const lu = {};
    (lu[uf(0x55e)] = !![]),
      (lu[uf(0xc24)] = !![]),
      (lu[uf(0x3a0)] = !![]),
      (lu[uf(0x730)] = !![]),
      (lu[uf(0x1f9)] = !![]),
      (lu[uf(0x17a)] = !![]),
      (lu[uf(0x7b6)] = !![]);
    var lv = lu;
    const lw = {};
    (lw[uf(0x3a0)] = !![]),
      (lw[uf(0x730)] = !![]),
      (lw[uf(0x1f9)] = !![]),
      (lw[uf(0x17a)] = !![]);
    var lx = lw;
    const ly = {};
    (ly[uf(0xc24)] = !![]), (ly[uf(0x268)] = !![]), (ly[uf(0x8e2)] = !![]);
    var lz = ly;
    const lA = {};
    (lA[uf(0x4a0)] = !![]), (lA[uf(0x15f)] = !![]), (lA[uf(0xbb2)] = !![]);
    var lB = lA;
    const lC = {};
    (lC[uf(0xcf8)] = !![]),
      (lC[uf(0x201)] = !![]),
      (lC[uf(0x7b3)] = !![]),
      (lC[uf(0x241)] = !![]),
      (lC[uf(0x176)] = !![]);
    var lD = lC;
    function lE(rq, rr) {
      const x4 = uf;
      rq[x4(0x787)](), rq[x4(0x92d)](rr, 0x0);
      for (let rs = 0x0; rs < 0x6; rs++) {
        const rt = (rs / 0x6) * Math["PI"] * 0x2;
        rq[x4(0xbe4)](Math[x4(0xa87)](rt) * rr, Math[x4(0x7f1)](rt) * rr);
      }
      rq[x4(0x8ef)]();
    }
    function lF(rq, rr, rs, rt, ru) {
      const x5 = uf;
      rq[x5(0x787)](),
        rq[x5(0x92d)](0x9, -0x5),
        rq[x5(0x9f1)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rq[x5(0x2d2)](0xd, 0x0, 0x9, -0x5),
        rq[x5(0x8ef)](),
        (rq[x5(0x70b)] = rq[x5(0x625)] = x5(0xac6)),
        (rq[x5(0xfb)] = rt),
        (rq[x5(0x6b1)] = rr),
        rq[x5(0x6f2)](),
        (rq[x5(0x6b1)] -= ru),
        (rq[x5(0x716)] = rq[x5(0xfb)] = rs),
        rq[x5(0x190)](),
        rq[x5(0x6f2)]();
    }
    var lG = class {
        constructor(rq = -0x1, rr, rs, rt, ru, rv = 0x7, rw = -0x1) {
          const x6 = uf;
          (this["id"] = rq),
            (this[x6(0x511)] = rr),
            (this[x6(0x85a)] = hM[rr]),
            (this[x6(0xd19)] = this[x6(0x85a)][x6(0xb93)](x6(0xbca))),
            (this["x"] = this["nx"] = this["ox"] = rs),
            (this["y"] = this["ny"] = this["oy"] = rt),
            (this[x6(0x903)] = this[x6(0x91c)] = this[x6(0xb3d)] = ru),
            (this[x6(0x187)] =
              this[x6(0x238)] =
              this[x6(0xc14)] =
              this[x6(0x734)] =
                rw),
            (this[x6(0x5d2)] = 0x0),
            (this[x6(0x58f)] = this[x6(0x9bf)] = this[x6(0x18e)] = rv),
            (this[x6(0xc3b)] = 0x0),
            (this[x6(0x3d9)] = ![]),
            (this[x6(0xd72)] = 0x0),
            (this[x6(0x828)] = 0x0),
            (this[x6(0x36a)] = this[x6(0x85a)][x6(0xbf1)](x6(0xd9b)) > -0x1),
            (this[x6(0x185)] = this[x6(0x36a)] ? this[x6(0x238)] < 0x1 : 0x1),
            (this[x6(0x2e3)] = ![]),
            (this[x6(0x1db)] = 0x0),
            (this[x6(0xca8)] = 0x0),
            (this[x6(0x68e)] = 0x0),
            (this[x6(0xc30)] = 0x1),
            (this[x6(0x5e7)] = 0x0),
            (this[x6(0x5e8)] = [cS[x6(0x721)], cS[x6(0x181)], cS[x6(0xa9e)]][
              x6(0x20a)
            ](this[x6(0x511)])),
            (this[x6(0x660)] = lv[this[x6(0x85a)]]),
            (this[x6(0x44f)] = lx[this[x6(0x85a)]] ? 0x32 / 0xc8 : 0x0),
            (this[x6(0xb9d)] = lt[this[x6(0x85a)]]),
            (this[x6(0x260)] = 0x0),
            (this[x6(0x748)] = 0x0),
            (this[x6(0x257)] = ![]),
            (this[x6(0x9e3)] = 0x0),
            (this[x6(0xbff)] = !![]),
            (this[x6(0xdd3)] = 0x2),
            (this[x6(0xae3)] = 0x0),
            (this[x6(0xd5a)] = lD[this[x6(0x85a)]]),
            (this[x6(0xd94)] = lz[this[x6(0x85a)]]),
            (this[x6(0xd2d)] = lB[this[x6(0x85a)]]);
        }
        [uf(0x8ee)]() {
          const x7 = uf;
          this[x7(0x3d9)] && (this[x7(0xd72)] += pA / 0xc8);
          (this[x7(0x748)] += ((this[x7(0x257)] ? 0x1 : -0x1) * pA) / 0xc8),
            (this[x7(0x748)] = Math[x7(0xc0c)](
              0x1,
              Math[x7(0x411)](0x0, this[x7(0x748)])
            )),
            (this[x7(0x68e)] = pg(
              this[x7(0x68e)],
              this[x7(0xca8)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[x7(0xca8)] = pg(this[x7(0xca8)], this[x7(0x1db)], 0x64));
          this[x7(0x828)] > 0x0 &&
            ((this[x7(0x828)] -= pA / 0x96),
            this[x7(0x828)] < 0x0 && (this[x7(0x828)] = 0x0));
          (this[x7(0xc3b)] += pA / 0x64),
            (this["t"] = Math[x7(0xc0c)](0x1, this[x7(0xc3b)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[x7(0x238)] =
              this[x7(0x734)] +
              (this[x7(0xc14)] - this[x7(0x734)]) * this["t"]),
            (this[x7(0x58f)] =
              this[x7(0x18e)] +
              (this[x7(0x9bf)] - this[x7(0x18e)]) * this["t"]);
          if (this[x7(0x5e8)]) {
            const rq = Math[x7(0xc0c)](0x1, pA / 0x64);
            (this[x7(0xc30)] +=
              (Math[x7(0xa87)](this[x7(0x91c)]) - this[x7(0xc30)]) * rq),
              (this[x7(0x5e7)] +=
                (Math[x7(0x7f1)](this[x7(0x91c)]) - this[x7(0x5e7)]) * rq);
          }
          (this[x7(0x903)] = f8(this[x7(0xb3d)], this[x7(0x91c)], this["t"])),
            (this[x7(0x9e3)] +=
              ((Math[x7(0x4b2)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pA) /
              0x12),
            this[x7(0x5d2)] > 0x0 &&
              ((this[x7(0x5d2)] -= pA / 0x258),
              this[x7(0x5d2)] < 0x0 && (this[x7(0x5d2)] = 0x0)),
            this[x7(0xd2d)] &&
              ((this[x7(0xdd3)] += pA / 0x5dc),
              this[x7(0xdd3)] > 0x1 && (this[x7(0xdd3)] = 0x1),
              (this[x7(0xbff)] = this[x7(0xdd3)] < 0x1)),
            this[x7(0x238)] < 0x1 &&
              (this[x7(0x185)] = pg(this[x7(0x185)], 0x1, 0xc8)),
            this[x7(0x5d2)] === 0x0 &&
              (this[x7(0x187)] +=
                (this[x7(0x238)] - this[x7(0x187)]) *
                Math[x7(0xc0c)](0x1, pA / 0xc8));
        }
        [uf(0x69d)](rq, rr = ![]) {
          const x8 = uf,
            rs = this[x8(0x58f)] / 0x19;
          rq[x8(0x5b0)](rs),
            rq[x8(0xb25)](0x5, 0x0),
            (rq[x8(0x6b1)] = 0x5),
            (rq[x8(0x625)] = rq[x8(0x70b)] = x8(0xac6)),
            (rq[x8(0xfb)] = rq[x8(0x716)] = this[x8(0x683)](x8(0x7ca)));
          rr &&
            (rq[x8(0xa26)](),
            rq[x8(0xb25)](0x3, 0x0),
            rq[x8(0x787)](),
            rq[x8(0x92d)](-0xa, 0x0),
            rq[x8(0xbe4)](-0x28, -0xf),
            rq[x8(0x2d2)](-0x21, 0x0, -0x28, 0xf),
            rq[x8(0x8ef)](),
            rq[x8(0x20f)](),
            rq[x8(0x6f2)](),
            rq[x8(0x190)]());
          rq[x8(0x787)](), rq[x8(0x92d)](0x0, 0x1e);
          const rt = 0x1c,
            ru = 0x24,
            rv = 0x5;
          rq[x8(0x92d)](0x0, rt);
          for (let rw = 0x0; rw < rv; rw++) {
            const rx = ((((rw + 0.5) / rv) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              ry = ((((rw + 0x1) / rv) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rq[x8(0x2d2)](
              Math[x8(0xa87)](rx) * ru * 0.85,
              -Math[x8(0x7f1)](rx) * ru,
              Math[x8(0xa87)](ry) * rt * 0.7,
              -Math[x8(0x7f1)](ry) * rt
            );
          }
          rq[x8(0xbe4)](-0x1c, -0x9),
            rq[x8(0x2d2)](-0x26, 0x0, -0x1c, 0x9),
            rq[x8(0xbe4)](0x0, rt),
            rq[x8(0x8ef)](),
            (rq[x8(0x716)] = this[x8(0x683)](x8(0x9e2))),
            rq[x8(0x190)](),
            rq[x8(0x6f2)](),
            rq[x8(0x787)]();
          for (let rz = 0x0; rz < 0x4; rz++) {
            const rA = (((rz / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rB = -0x1e + Math[x8(0xa87)](rA) * 0xd,
              rC = Math[x8(0x7f1)](rA) * 0xb;
            rq[x8(0x92d)](rB, rC),
              rq[x8(0xbe4)](
                rB + Math[x8(0xa87)](rA) * 0x1b,
                rC + Math[x8(0x7f1)](rA) * 0x1b
              );
          }
          (rq[x8(0x6b1)] = 0x4), rq[x8(0x6f2)]();
        }
        [uf(0x8a8)](rq, rr = uf(0x647), rs = 0x0) {
          const x9 = uf;
          for (let rt = 0x0; rt < l1[x9(0xbc8)]; rt++) {
            const ru = l1[rt];
            rq[x9(0xa26)](),
              rq[x9(0x710)](
                ru[x9(0x1b4)] * Math[x9(0x7f1)](this[x9(0x9e3)] + rt) * 0.15 +
                  rs * ru[x9(0xa65)]
              ),
              rq[x9(0x787)](),
              rq[x9(0x92d)](...ru[x9(0x589)]),
              rq[x9(0x2d2)](...ru[x9(0x8c2)]),
              (rq[x9(0xfb)] = this[x9(0x683)](rr)),
              (rq[x9(0x6b1)] = 0x8),
              (rq[x9(0x625)] = x9(0xac6)),
              rq[x9(0x6f2)](),
              rq[x9(0x20f)]();
          }
        }
        [uf(0xbd2)](rq) {
          const xa = uf;
          rq[xa(0x787)]();
          let rr = 0x0,
            rs = 0x0,
            rt,
            ru;
          const rv = 0x14;
          for (let rw = 0x0; rw < rv; rw++) {
            const rx = (rw / rv) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              ry = ((rw + 0x1) / rv) * 0x28;
            (rt = Math[xa(0xa87)](rx) * ry), (ru = Math[xa(0x7f1)](rx) * ry);
            const rz = rr + rt,
              rA = rs + ru;
            rq[xa(0x2d2)](
              (rr + rz) * 0.5 + ru * 0.15,
              (rs + rA) * 0.5 - rt * 0.15,
              rz,
              rA
            ),
              (rr = rz),
              (rs = rA);
          }
          rq[xa(0x2d2)](
            rr - ru * 0.42 + rt * 0.4,
            rs + rt * 0.42 + ru * 0.4,
            rr - ru * 0.84,
            rs + rt * 0.84
          ),
            (rq[xa(0x716)] = this[xa(0x683)](xa(0x3cb))),
            rq[xa(0x190)](),
            (rq[xa(0x6b1)] = 0x8),
            (rq[xa(0xfb)] = this[xa(0x683)](xa(0xbc7))),
            rq[xa(0x6f2)]();
        }
        [uf(0x8e2)](rq) {
          const xb = uf;
          rq[xb(0x5b0)](this[xb(0x58f)] / 0xd),
            rq[xb(0x710)](-Math["PI"] / 0x6),
            (rq[xb(0x625)] = rq[xb(0x70b)] = xb(0xac6)),
            rq[xb(0x787)](),
            rq[xb(0x92d)](0x0, -0xe),
            rq[xb(0xbe4)](0x6, -0x14),
            (rq[xb(0x716)] = rq[xb(0xfb)] = this[xb(0x683)](xb(0x534))),
            (rq[xb(0x6b1)] = 0x7),
            rq[xb(0x6f2)](),
            (rq[xb(0x716)] = rq[xb(0xfb)] = this[xb(0x683)](xb(0x9ff))),
            (rq[xb(0x6b1)] = 0x2),
            rq[xb(0x6f2)](),
            rq[xb(0x787)](),
            rq[xb(0x92d)](0x0, -0xc),
            rq[xb(0x2d2)](-0x6, 0x0, 0x4, 0xe),
            rq[xb(0x9f1)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rq[xb(0x6b1)] = 0xc),
            (rq[xb(0x716)] = rq[xb(0xfb)] = this[xb(0x683)](xb(0x5ed))),
            rq[xb(0x190)](),
            rq[xb(0x6f2)](),
            (rq[xb(0x6b1)] = 0x6),
            (rq[xb(0x716)] = rq[xb(0xfb)] = this[xb(0x683)](xb(0x5f1))),
            rq[xb(0x6f2)](),
            rq[xb(0x190)]();
        }
        [uf(0x184)](rq) {
          const xc = uf;
          rq[xc(0x5b0)](this[xc(0x58f)] / 0x2d),
            rq[xc(0xb25)](-0x14, 0x0),
            (rq[xc(0x625)] = rq[xc(0x70b)] = xc(0xac6)),
            rq[xc(0x787)]();
          const rr = 0x6,
            rs = Math["PI"] * 0.45,
            rt = 0x3c,
            ru = 0x46;
          rq[xc(0x92d)](0x0, 0x0);
          for (let rv = 0x0; rv < rr; rv++) {
            const rw = ((rv / rr) * 0x2 - 0x1) * rs,
              rx = (((rv + 0x1) / rr) * 0x2 - 0x1) * rs;
            rv === 0x0 &&
              rq[xc(0x2d2)](
                -0xa,
                -0x32,
                Math[xc(0xa87)](rw) * rt,
                Math[xc(0x7f1)](rw) * rt
              );
            const ry = (rw + rx) / 0x2;
            rq[xc(0x2d2)](
              Math[xc(0xa87)](ry) * ru,
              Math[xc(0x7f1)](ry) * ru,
              Math[xc(0xa87)](rx) * rt,
              Math[xc(0x7f1)](rx) * rt
            );
          }
          rq[xc(0x2d2)](-0xa, 0x32, 0x0, 0x0),
            (rq[xc(0x716)] = this[xc(0x683)](xc(0x664))),
            (rq[xc(0xfb)] = this[xc(0x683)](xc(0x1e0))),
            (rq[xc(0x6b1)] = 0xa),
            rq[xc(0x6f2)](),
            rq[xc(0x190)](),
            rq[xc(0x787)](),
            rq[xc(0x769)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rq[xc(0x8ef)](),
            (rq[xc(0xfb)] = this[xc(0x683)](xc(0x984))),
            (rq[xc(0x6b1)] = 0x1e),
            rq[xc(0x6f2)](),
            (rq[xc(0x6b1)] = 0xa),
            (rq[xc(0xfb)] = rq[xc(0x716)] = this[xc(0x683)](xc(0x3f8))),
            rq[xc(0x190)](),
            rq[xc(0x6f2)]();
        }
        [uf(0x162)](rq, rr = ![]) {
          const xd = uf;
          rq[xd(0x5b0)](this[xd(0x58f)] / 0x64);
          let rs = this[xd(0x6b5)]
            ? 0.75
            : Math[xd(0x7f1)](Date[xd(0x603)]() / 0x96 + this[xd(0x9e3)]);
          (rs = rs * 0.5 + 0.5),
            (rs *= 0.7),
            rq[xd(0x787)](),
            rq[xd(0x92d)](0x0, 0x0),
            rq[xd(0x769)](0x0, 0x0, 0x64, rs, Math["PI"] * 0x2 - rs),
            rq[xd(0x8ef)](),
            (rq[xd(0x716)] = this[xd(0x683)](xd(0xa1f))),
            rq[xd(0x190)](),
            rq[xd(0x63f)](),
            (rq[xd(0xfb)] = xd(0x322)),
            (rq[xd(0x6b1)] = rr ? 0x28 : 0x1e),
            (rq[xd(0x70b)] = xd(0xac6)),
            rq[xd(0x6f2)](),
            !rr &&
              (rq[xd(0x787)](),
              rq[xd(0x769)](
                0x0 - rs * 0x8,
                -0x32 - rs * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rq[xd(0x716)] = xd(0xd1d)),
              rq[xd(0x190)]());
        }
        [uf(0x296)](rq) {
          const xe = uf;
          rq[xe(0x5b0)](this[xe(0x58f)] / 0x50),
            rq[xe(0x710)](-this[xe(0x903)]),
            rq[xe(0xb25)](0x0, 0x50);
          const rr = Date[xe(0x603)]() / 0x12c + this[xe(0x9e3)];
          rq[xe(0x787)]();
          const rs = 0x3;
          let rt;
          for (let rw = 0x0; rw < rs; rw++) {
            const rx = ((rw / rs) * 0x2 - 0x1) * 0x64,
              ry = (((rw + 0x1) / rs) * 0x2 - 0x1) * 0x64;
            (rt =
              0x14 +
              (Math[xe(0x7f1)]((rw / rs) * Math["PI"] * 0x8 + rr) * 0.5 + 0.5) *
                0x1e),
              rw === 0x0 && rq[xe(0x92d)](rx, -rt),
              rq[xe(0x9f1)](rx, rt, ry, rt, ry, -rt);
          }
          rq[xe(0x9f1)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rt),
            rq[xe(0x8ef)](),
            (rq[xe(0x74e)] *= 0.7);
          const ru = this[xe(0x2e3)]
            ? lh[0x0]
            : this["id"] < 0x0
            ? lj[0x0]
            : lj[this["id"] % lj[xe(0xbc8)]];
          (rq[xe(0x716)] = this[xe(0x683)](ru)),
            rq[xe(0x190)](),
            rq[xe(0x63f)](),
            (rq[xe(0x70b)] = xe(0xac6)),
            (rq[xe(0xfb)] = xe(0x322)),
            xe(0xdce),
            (rq[xe(0x6b1)] = 0x1e),
            rq[xe(0x6f2)]();
          let rv = Math[xe(0x7f1)](rr * 0x1);
          (rv = rv * 0.5 + 0.5),
            (rv *= 0x3),
            rq[xe(0x787)](),
            rq[xe(0xadb)](
              0x0,
              -0x82 - rv * 0x2,
              0x28 - rv,
              0x14 - rv * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xe(0x716)] = rq[xe(0xfb)]),
            rq[xe(0x190)]();
        }
        [uf(0x243)](rq, rr) {
          const xf = uf;
          rq[xf(0x5b0)](this[xf(0x58f)] / 0x14);
          const rs = rq[xf(0x74e)];
          (rq[xf(0xfb)] = rq[xf(0x716)] = this[xf(0x683)](xf(0x3a1))),
            (rq[xf(0x74e)] = 0.4 * rs),
            rq[xf(0xa26)](),
            rq[xf(0x787)](),
            rq[xf(0x710)](Math["PI"] * 0.16),
            rq[xf(0xb25)](rr ? -0x6 : -0x9, 0x0),
            rq[xf(0x92d)](0x0, -0x4),
            rq[xf(0x2d2)](-0x2, 0x0, 0x0, 0x4),
            (rq[xf(0x6b1)] = 0x8),
            (rq[xf(0x70b)] = rq[xf(0x625)] = xf(0xac6)),
            rq[xf(0x6f2)](),
            rq[xf(0x20f)](),
            rq[xf(0x787)](),
            rq[xf(0x769)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rq[xf(0x190)](),
            rq[xf(0x63f)](),
            (rq[xf(0x74e)] = 0.5 * rs),
            (rq[xf(0x6b1)] = rr ? 0x8 : 0x3),
            rq[xf(0x6f2)]();
        }
        [uf(0x241)](rq) {
          const xg = uf;
          rq[xg(0x5b0)](this[xg(0x58f)] / 0x64);
          const rr = this[xg(0x683)](xg(0x2e0)),
            rs = this[xg(0x683)](xg(0x590)),
            rt = 0x4;
          rq[xg(0x70b)] = rq[xg(0x625)] = xg(0xac6);
          const ru = 0x64 - rq[xg(0x6b1)] * 0.5;
          for (let rv = 0x0; rv <= rt; rv++) {
            const rw = (0x1 - rv / rt) * ru;
            lE(rq, rw),
              (rq[xg(0x6b1)] =
                0x1e +
                rv *
                  (Math[xg(0x7f1)](Date[xg(0x603)]() / 0x320 + rv) * 0.5 +
                    0.5) *
                  0x5),
              (rq[xg(0x716)] = rq[xg(0xfb)] = rv % 0x2 === 0x0 ? rr : rs),
              rv === rt - 0x1 && rq[xg(0x190)](),
              rq[xg(0x6f2)]();
          }
        }
        [uf(0xd17)](rq, rr) {
          const xh = uf;
          rq[xh(0x787)](),
            rq[xh(0x769)](0x0, 0x0, this[xh(0x58f)], 0x0, l0),
            (rq[xh(0x716)] = this[xh(0x683)](rr)),
            rq[xh(0x190)](),
            (rq[xh(0x716)] = xh(0xd1d));
          for (let rs = 0x1; rs < 0x4; rs++) {
            rq[xh(0x787)](),
              rq[xh(0x769)](
                0x0,
                0x0,
                this[xh(0x58f)] * (0x1 - rs / 0x4),
                0x0,
                l0
              ),
              rq[xh(0x190)]();
          }
        }
        [uf(0x10e)](rq, rr) {
          const xi = uf;
          rq[xi(0xb25)](-this[xi(0x58f)], 0x0), (rq[xi(0xda1)] = xi(0xa3a));
          const rs = 0x32;
          let rt = ![];
          !this[xi(0xcd7)] && ((rt = !![]), (this[xi(0xcd7)] = []));
          while (this[xi(0xcd7)][xi(0xbc8)] < rs) {
            this[xi(0xcd7)][xi(0x6aa)]({
              x: rt ? Math[xi(0xb03)]() : 0x0,
              y: Math[xi(0xb03)]() * 0x2 - 0x1,
              vx: Math[xi(0xb03)]() * 0.03 + 0.02,
              size: Math[xi(0xb03)]() * 0.2 + 0.2,
            });
          }
          const ru = this[xi(0x58f)] * 0x2,
            rv = Math[xi(0x411)](this[xi(0x58f)] * 0.1, 0x4),
            rw = rq[xi(0x74e)];
          (rq[xi(0x716)] = rr), rq[xi(0x787)]();
          for (let rx = rs - 0x1; rx >= 0x0; rx--) {
            const ry = this[xi(0xcd7)][rx];
            ry["x"] += ry["vx"];
            const rz = ry["x"] * ru,
              rA = this[xi(0x44f)] * rz,
              rB = ry["y"] * rA,
              rC =
                Math[xi(0xbee)](0x1 - Math[xi(0x71b)](rB) / rA, 0.2) *
                Math[xi(0xbee)](0x1 - rz / ru, 0.2);
            if (ry["x"] >= 0x1 || rC < 0.001) {
              this[xi(0xcd7)][xi(0xb41)](rx, 0x1);
              continue;
            }
            (rq[xi(0x74e)] = rC * rw * 0.5),
              rq[xi(0x787)](),
              rq[xi(0x769)](
                rz,
                rB,
                ry[xi(0x58f)] * rA + rv,
                0x0,
                Math["PI"] * 0x2
              ),
              rq[xi(0x190)]();
          }
        }
        [uf(0x754)](rq) {
          const xj = uf;
          rq[xj(0x5b0)](this[xj(0x58f)] / 0x46),
            rq[xj(0x710)](-Math["PI"] / 0x2);
          const rr = pz / 0xc8;
          (rq[xj(0x6b1)] = 0x14),
            (rq[xj(0xfb)] = xj(0x396)),
            (rq[xj(0x625)] = rq[xj(0x70b)] = xj(0xac6)),
            (rq[xj(0x716)] = this[xj(0x683)](xj(0x12e)));
          if (!![]) {
            this[xj(0x8a9)](rq);
            return;
          }
          const rs = 0x2;
          for (let rt = 0x1; rt <= rs; rt++) {
            rq[xj(0xa26)]();
            let ru = 0x1 - rt / rs;
            (ru *= 0x1 + Math[xj(0x7f1)](rr + rt) * 0.5),
              (ru = 0x1 + ru * 0.5),
              (rq[xj(0x74e)] *= Math[xj(0xbee)](rt / rs, 0x2)),
              rq[xj(0x6ff)](ru, ru),
              rt !== rs &&
                ((rq[xj(0x74e)] *= 0.7),
                (rq[xj(0xda1)] = xj(0xa3a)),
                (rq[xj(0x21a)] = xj(0xb1b))),
              this[xj(0x8a9)](rq),
              rq[xj(0x20f)]();
          }
        }
        [uf(0x12b)](rq, rr = 0xbe) {
          const xk = uf;
          rq[xk(0xa26)](),
            rq[xk(0x787)](),
            rq[xk(0x92d)](0x0, -0x46 + rr + 0x1e),
            rq[xk(0xbe4)](0x1a, -0x46 + rr),
            rq[xk(0xbe4)](0xd, -0x46),
            rq[xk(0xbe4)](-0xd, -0x46),
            rq[xk(0xbe4)](-0x1a, -0x46 + rr),
            rq[xk(0xbe4)](0x0, -0x46 + rr + 0x1e),
            rq[xk(0x63f)](),
            rq[xk(0x190)](),
            rq[xk(0x6f2)](),
            rq[xk(0x20f)](),
            rq[xk(0xa26)](),
            rq[xk(0x787)](),
            rq[xk(0x92d)](-0x12, -0x46),
            rq[xk(0x2d2)](-0x5, -0x50, -0xa, -0x69),
            rq[xk(0x9f1)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rq[xk(0x2d2)](0x5, -0x50, 0x12, -0x46),
            rq[xk(0x2d2)](0x0, -0x3c, -0x12, -0x46),
            rq[xk(0x8ef)](),
            this[xk(0xd19)]
              ? ((rq[xk(0x716)] = this[xk(0x683)](xk(0xcc0))),
                (rq[xk(0xfb)] = this[xk(0x683)](xk(0xba0))))
              : (rq[xk(0xfb)] = this[xk(0x683)](xk(0x558))),
            rq[xk(0x190)](),
            (rq[xk(0x6b1)] = 0xa),
            rq[xk(0x6f2)](),
            rq[xk(0x20f)]();
        }
        [uf(0x8a9)](rq) {
          const xl = uf;
          rq[xl(0xa26)](), rq[xl(0x787)]();
          for (let rr = 0x0; rr < 0x2; rr++) {
            rq[xl(0x92d)](0x14, -0x1e),
              rq[xl(0x2d2)](0x5a, -0xa, 0x32, -0x32),
              rq[xl(0xbe4)](0xa0, -0x32),
              rq[xl(0x2d2)](0x8c, 0x3c, 0x14, 0x0),
              rq[xl(0x6ff)](-0x1, 0x1);
          }
          rq[xl(0x63f)](),
            rq[xl(0x190)](),
            rq[xl(0x6f2)](),
            rq[xl(0x20f)](),
            this[xl(0x12b)](rq),
            rq[xl(0xa26)](),
            rq[xl(0x787)](),
            rq[xl(0x769)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rq[xl(0xbe4)](-0x32, 0x1e),
            rq[xl(0xbe4)](-0x1e, 0x1e),
            rq[xl(0xbe4)](-0x1f, 0x32),
            rq[xl(0xbe4)](0x1f, 0x32),
            rq[xl(0xbe4)](0x1e, 0x1e),
            rq[xl(0xbe4)](0x32, 0x1e),
            rq[xl(0xbe4)](0x32, 0x0),
            rq[xl(0x190)](),
            rq[xl(0x63f)](),
            rq[xl(0x6f2)](),
            rq[xl(0x787)](),
            rq[xl(0xadb)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rq[xl(0xadb)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rq[xl(0x716)] = rq[xl(0xfb)]),
            rq[xl(0x190)](),
            rq[xl(0x20f)]();
        }
        [uf(0x4a0)](rq) {
          const xm = uf;
          rq[xm(0x5b0)](this[xm(0x58f)] / 0x64), (rq[xm(0xfb)] = xm(0xd1d));
          const rr = this[xm(0x683)](xm(0x51f)),
            rs = this[xm(0x683)](xm(0x78d));
          (this[xm(0xae3)] += (pA / 0x12c) * (this[xm(0xbff)] ? 0x1 : -0x1)),
            (this[xm(0xae3)] = Math[xm(0xc0c)](
              0x1,
              Math[xm(0x411)](0x0, this[xm(0xae3)])
            ));
          const rt = this[xm(0x6b5)] ? 0x1 : this[xm(0xae3)],
            ru = 0x1 - rt;
          rq[xm(0xa26)](),
            rq[xm(0x787)](),
            rq[xm(0xb25)](
              (0x30 +
                (Math[xm(0x7f1)](this[xm(0x9e3)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rt +
                (0x1 - rt) * -0x14,
              0x0
            ),
            rq[xm(0x6ff)](1.1, 1.1),
            rq[xm(0x92d)](0x0, -0xa),
            rq[xm(0x9f1)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rq[xm(0x716)] = rs),
            rq[xm(0x190)](),
            (rq[xm(0x70b)] = xm(0xac6)),
            (rq[xm(0x6b1)] = 0x1c),
            rq[xm(0x63f)](),
            rq[xm(0x6f2)](),
            rq[xm(0x20f)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            const rw = Math[xm(0x7f1)](this[xm(0x9e3)] * 0x1);
            rq[xm(0xa26)]();
            const rx = rv * 0x2 - 0x1;
            rq[xm(0x6ff)](0x1, rx),
              rq[xm(0xb25)](0x32 * rt - ru * 0xa, 0x50 * rt),
              rq[xm(0x710)](rw * 0.2 + 0.3 - ru * 0x1),
              rq[xm(0x787)](),
              rq[xm(0x92d)](0xa, -0xa),
              rq[xm(0x2d2)](0x1e, 0x28, -0x14, 0x50),
              rq[xm(0x2d2)](0xa, 0x1e, -0xf, 0x0),
              (rq[xm(0xfb)] = rr),
              (rq[xm(0x6b1)] = 0x2c),
              (rq[xm(0x625)] = rq[xm(0x70b)] = xm(0xac6)),
              rq[xm(0x6f2)](),
              (rq[xm(0x6b1)] -= 0x1c),
              (rq[xm(0x716)] = rq[xm(0xfb)] = rs),
              rq[xm(0x190)](),
              rq[xm(0x6f2)](),
              rq[xm(0x20f)]();
          }
          for (let ry = 0x0; ry < 0x2; ry++) {
            const rz = Math[xm(0x7f1)](this[xm(0x9e3)] * 0x1 + 0x1);
            rq[xm(0xa26)]();
            const rA = ry * 0x2 - 0x1;
            rq[xm(0x6ff)](0x1, rA),
              rq[xm(0xb25)](-0x41 * rt, 0x32 * rt),
              rq[xm(0x710)](rz * 0.3 + 1.3),
              rq[xm(0x787)](),
              rq[xm(0x92d)](0xc, -0x5),
              rq[xm(0x2d2)](0x28, 0x1e, 0x0, 0x3c),
              rq[xm(0x2d2)](0x14, 0x1e, 0x0, 0x0),
              (rq[xm(0xfb)] = rr),
              (rq[xm(0x6b1)] = 0x2c),
              (rq[xm(0x625)] = rq[xm(0x70b)] = xm(0xac6)),
              rq[xm(0x6f2)](),
              (rq[xm(0x6b1)] -= 0x1c),
              (rq[xm(0x716)] = rq[xm(0xfb)] = rs),
              rq[xm(0x6f2)](),
              rq[xm(0x190)](),
              rq[xm(0x20f)]();
          }
          this[xm(0xb10)](rq);
        }
        [uf(0xb10)](rq, rr = 0x1) {
          const xn = uf;
          rq[xn(0x787)](),
            rq[xn(0x769)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xn(0xfb)] = xn(0xd1d)),
            (rq[xn(0x716)] = this[xn(0x683)](xn(0x2ea))),
            rq[xn(0x190)](),
            (rq[xn(0x6b1)] = 0x1e * rr),
            rq[xn(0xa26)](),
            rq[xn(0x63f)](),
            rq[xn(0x6f2)](),
            rq[xn(0x20f)](),
            rq[xn(0xa26)](),
            rq[xn(0x787)](),
            rq[xn(0x769)](
              0x0,
              0x0,
              0x64 - rq[xn(0x6b1)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rq[xn(0x63f)](),
            rq[xn(0x787)]();
          for (let rs = 0x0; rs < 0x6; rs++) {
            const rt = (rs / 0x6) * Math["PI"] * 0x2;
            rq[xn(0xbe4)](
              Math[xn(0xa87)](rt) * 0x28,
              Math[xn(0x7f1)](rt) * 0x28
            );
          }
          rq[xn(0x8ef)]();
          for (let ru = 0x0; ru < 0x6; ru++) {
            const rv = (ru / 0x6) * Math["PI"] * 0x2,
              rw = Math[xn(0xa87)](rv) * 0x28,
              rx = Math[xn(0x7f1)](rv) * 0x28;
            rq[xn(0x92d)](rw, rx), rq[xn(0xbe4)](rw * 0x3, rx * 0x3);
          }
          (rq[xn(0x6b1)] = 0x10 * rr),
            (rq[xn(0x625)] = rq[xn(0x70b)] = xn(0xac6)),
            rq[xn(0x6f2)](),
            rq[xn(0x20f)]();
        }
        [uf(0xa11)](rq) {
          const xo = uf;
          rq[xo(0x5b0)](this[xo(0x58f)] / 0x82);
          let rr, rs;
          const rt = 0x2d,
            ru = lp(
              this[xo(0x3d7)] ||
                (this[xo(0x3d7)] = this[xo(0x6b5)]
                  ? 0x28
                  : Math[xo(0xb03)]() * 0x3e8)
            );
          let rv = ru() * 6.28;
          const rw = Date[xo(0x603)]() / 0xc8,
            rx = [xo(0x100), xo(0x97d)][xo(0x2f3)]((ry) => this[xo(0x683)](ry));
          for (let ry = 0x0; ry <= rt; ry++) {
            (ry % 0x5 === 0x0 || ry === rt) &&
              (ry > 0x0 &&
                ((rq[xo(0x6b1)] = 0x19),
                (rq[xo(0x70b)] = rq[xo(0x625)] = xo(0xac6)),
                (rq[xo(0xfb)] = rx[0x1]),
                rq[xo(0x6f2)](),
                (rq[xo(0x6b1)] = 0xc),
                (rq[xo(0xfb)] = rx[0x0]),
                rq[xo(0x6f2)]()),
              ry !== rt && (rq[xo(0x787)](), rq[xo(0x92d)](rr, rs)));
            let rz = ry / 0x32;
            (rz *= rz), (rv += (0.3 + ru() * 0.8) * 0x3);
            const rA = 0x14 + Math[xo(0x7f1)](rz * 3.14) * 0x6e,
              rB = Math[xo(0x7f1)](ry + rw) * 0.5,
              rC = Math[xo(0xa87)](rv + rB) * rA,
              rD = Math[xo(0x7f1)](rv + rB) * rA,
              rE = rC - rr,
              rF = rD - rs;
            rq[xo(0x2d2)]((rr + rC) / 0x2 + rF, (rs + rD) / 0x2 - rE, rC, rD),
              (rr = rC),
              (rs = rD);
          }
        }
        [uf(0x176)](rq) {
          const xp = uf;
          rq[xp(0x5b0)](this[xp(0x58f)] / 0x6e),
            (rq[xp(0xfb)] = xp(0xd1d)),
            (rq[xp(0x6b1)] = 0x1c),
            rq[xp(0x787)](),
            rq[xp(0x769)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rq[xp(0x716)] = this[xp(0x683)](xp(0x8bd))),
            rq[xp(0x190)](),
            rq[xp(0xa26)](),
            rq[xp(0x63f)](),
            rq[xp(0x6f2)](),
            rq[xp(0x20f)](),
            rq[xp(0x787)](),
            rq[xp(0x769)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rq[xp(0x716)] = xp(0x398)),
            rq[xp(0x190)](),
            rq[xp(0xa26)](),
            rq[xp(0x63f)](),
            rq[xp(0x6f2)](),
            rq[xp(0x20f)]();
          const rr = lp(
              this[xp(0x16c)] ||
                (this[xp(0x16c)] = this[xp(0x6b5)]
                  ? 0x1e
                  : Math[xp(0xb03)]() * 0x3e8)
            ),
            rs = this[xp(0x683)](xp(0x4cc)),
            rt = this[xp(0x683)](xp(0xa9c));
          for (let rw = 0x0; rw < 0x3; rw++) {
            rq[xp(0x787)]();
            const rx = 0xc;
            for (let ry = 0x0; ry < rx; ry++) {
              const rz = (Math["PI"] * 0x2 * ry) / rx;
              rq[xp(0xa26)](),
                rq[xp(0x710)](rz + rr() * 0.4),
                rq[xp(0xb25)](0x3c + rr() * 0xa, 0x0),
                rq[xp(0x92d)](rr() * 0x5, rr() * 0x5),
                rq[xp(0x9f1)](
                  0x14 + rr() * 0xa,
                  rr() * 0x14,
                  0x28 + rr() * 0x14,
                  rr() * 0x1e + 0xa,
                  0x3c + rr() * 0xa,
                  rr() * 0xa + 0xa
                ),
                rq[xp(0x20f)]();
            }
            (rq[xp(0x625)] = rq[xp(0x70b)] = xp(0xac6)),
              (rq[xp(0x6b1)] = 0x12 - rw * 0x2),
              (rq[xp(0xfb)] = rs),
              rq[xp(0x6f2)](),
              (rq[xp(0x6b1)] -= 0x8),
              (rq[xp(0xfb)] = rt),
              rq[xp(0x6f2)]();
          }
          const ru = 0x28;
          rq[xp(0x710)](-this[xp(0x903)]),
            (rq[xp(0x716)] = this[xp(0x683)](xp(0x4f0))),
            (rq[xp(0xfb)] = this[xp(0x683)](xp(0x941))),
            (rq[xp(0x6b1)] = 0x9);
          const rv = this[xp(0x238)] * 0x6;
          for (let rA = 0x0; rA < rv; rA++) {
            const rB = ((rA - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rq[xp(0x787)](),
              rq[xp(0xadb)](
                Math[xp(0xa87)](rB) * ru,
                Math[xp(0x7f1)](rB) * ru * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rq[xp(0x190)](),
              rq[xp(0x6f2)]();
          }
        }
        [uf(0xb84)](rq) {
          const xq = uf;
          rq[xq(0x710)](-this[xq(0x903)]),
            rq[xq(0x5b0)](this[xq(0x58f)] / 0x3c),
            (rq[xq(0x625)] = rq[xq(0x70b)] = xq(0xac6));
          let rr =
            Math[xq(0x7f1)](Date[xq(0x603)]() / 0x12c + this[xq(0x9e3)] * 0.5) *
              0.5 +
            0.5;
          (rr *= 1.5),
            rq[xq(0x787)](),
            rq[xq(0x92d)](-0x32, -0x32 - rr * 0x3),
            rq[xq(0x2d2)](0x0, -0x3c, 0x32, -0x32 - rr * 0x3),
            rq[xq(0x2d2)](0x50 - rr * 0x3, -0xa, 0x50, 0x32),
            rq[xq(0x2d2)](0x46, 0x4b, 0x28, 0x4e + rr * 0x5),
            rq[xq(0xbe4)](0x1e, 0x3c + rr * 0x5),
            rq[xq(0x2d2)](0x2d, 0x37, 0x32, 0x2d),
            rq[xq(0x2d2)](0x0, 0x41, -0x32, 0x32),
            rq[xq(0x2d2)](-0x2d, 0x37, -0x1e, 0x3c + rr * 0x3),
            rq[xq(0xbe4)](-0x28, 0x4e + rr * 0x5),
            rq[xq(0x2d2)](-0x46, 0x4b, -0x50, 0x32),
            rq[xq(0x2d2)](-0x50 + rr * 0x3, -0xa, -0x32, -0x32 - rr * 0x3),
            (rq[xq(0x716)] = this[xq(0x683)](xq(0x576))),
            rq[xq(0x190)](),
            (rq[xq(0xfb)] = xq(0xd1d)),
            rq[xq(0xa26)](),
            rq[xq(0x63f)](),
            (rq[xq(0x6b1)] = 0xe),
            rq[xq(0x6f2)](),
            rq[xq(0x20f)]();
          for (let rs = 0x0; rs < 0x2; rs++) {
            rq[xq(0xa26)](),
              rq[xq(0x6ff)](rs * 0x2 - 0x1, 0x1),
              rq[xq(0xb25)](-0x22, -0x18 - rr * 0x3),
              rq[xq(0x710)](-0.6),
              rq[xq(0x6ff)](1.3, 1.3),
              rq[xq(0x787)](),
              rq[xq(0x92d)](-0x14, 0x0),
              rq[xq(0x2d2)](-0x14, -0x19, 0x0, -0x28),
              rq[xq(0x2d2)](0x14, -0x19, 0x14, 0x0),
              rq[xq(0x190)](),
              rq[xq(0x63f)](),
              (rq[xq(0x6b1)] = 0xd),
              rq[xq(0x6f2)](),
              rq[xq(0x20f)]();
          }
          rq[xq(0xa26)](),
            rq[xq(0x787)](),
            rq[xq(0xadb)](
              0x0,
              0x1e,
              0x24 - rr * 0x2,
              0x8 - rr,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xq(0x716)] = this[xq(0x683)](xq(0x1c6))),
            (rq[xq(0x74e)] *= 0.2),
            rq[xq(0x190)](),
            rq[xq(0x20f)](),
            (rq[xq(0x716)] = rq[xq(0xfb)] = this[xq(0x683)](xq(0xaef)));
          for (let rt = 0x0; rt < 0x2; rt++) {
            rq[xq(0xa26)](),
              rq[xq(0x6ff)](rt * 0x2 - 0x1, 0x1),
              rq[xq(0xb25)](0x19 - rr * 0x1, 0xf - rr * 0x3),
              rq[xq(0x710)](-0.3),
              rq[xq(0x787)](),
              rq[xq(0x769)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rq[xq(0x190)](),
              rq[xq(0x20f)]();
          }
          rq[xq(0xa26)](),
            (rq[xq(0x6b1)] = 0x5),
            rq[xq(0xb25)](0x0, 0x21 - rr * 0x1),
            rq[xq(0x787)](),
            rq[xq(0x92d)](-0xc, 0x0),
            rq[xq(0x9f1)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rq[xq(0x9f1)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rq[xq(0x6f2)](),
            rq[xq(0x20f)]();
        }
        [uf(0x23c)](rq) {
          const xr = uf;
          rq[xr(0x5b0)](this[xr(0x58f)] / 0x3c),
            rq[xr(0x710)](-Math["PI"] / 0x2),
            rq[xr(0x787)](),
            rq[xr(0x92d)](0x32, 0x50),
            rq[xr(0x2d2)](0x1e, 0x1e, 0x32, -0x14),
            rq[xr(0x2d2)](0x5a, -0x64, 0x0, -0x64),
            rq[xr(0x2d2)](-0x5a, -0x64, -0x32, -0x14),
            rq[xr(0x2d2)](-0x1e, 0x1e, -0x32, 0x50),
            (rq[xr(0x716)] = this[xr(0x683)](xr(0x5d6))),
            rq[xr(0x190)](),
            (rq[xr(0x70b)] = rq[xr(0x625)] = xr(0xac6)),
            (rq[xr(0x6b1)] = 0x14),
            rq[xr(0x63f)](),
            (rq[xr(0xfb)] = xr(0xd1d)),
            rq[xr(0x6f2)](),
            (rq[xr(0x716)] = this[xr(0x683)](xr(0x378)));
          const rr = 0x6;
          rq[xr(0x787)](), rq[xr(0x92d)](-0x32, 0x50);
          for (let rs = 0x0; rs < rr; rs++) {
            const rt = (((rs + 0.5) / rr) * 0x2 - 0x1) * 0x32,
              ru = (((rs + 0x1) / rr) * 0x2 - 0x1) * 0x32;
            rq[xr(0x2d2)](rt, 0x1e, ru, 0x50);
          }
          (rq[xr(0x6b1)] = 0x8),
            rq[xr(0x190)](),
            rq[xr(0x6f2)](),
            (rq[xr(0xfb)] = rq[xr(0x716)] = xr(0xd1d)),
            rq[xr(0xa26)](),
            rq[xr(0xb25)](0x0, -0x5),
            rq[xr(0x787)](),
            rq[xr(0x92d)](0x0, 0x0),
            rq[xr(0x9f1)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rq[xr(0x6f2)](),
            rq[xr(0x20f)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            rq[xr(0xa26)](),
              rq[xr(0x6ff)](rv * 0x2 - 0x1, 0x1),
              rq[xr(0xb25)](0x19, -0x38),
              rq[xr(0x787)](),
              rq[xr(0x769)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rq[xr(0x63f)](),
              (rq[xr(0x6b1)] = 0xf),
              rq[xr(0x6f2)](),
              rq[xr(0x190)](),
              rq[xr(0x20f)]();
          }
        }
        [uf(0x841)](rq) {
          const xs = uf;
          rq[xs(0x5b0)](this[xs(0x58f)] / 0x32),
            (rq[xs(0xfb)] = xs(0xd1d)),
            (rq[xs(0x6b1)] = 0x10);
          const rr = 0x7;
          rq[xs(0x787)]();
          const rs = 0x12;
          rq[xs(0x716)] = this[xs(0x683)](xs(0xb3e));
          const rt = Math[xs(0x7f1)](pz / 0x258);
          for (let ru = 0x0; ru < 0x2; ru++) {
            const rv = 1.2 - ru * 0.2;
            for (let rw = 0x0; rw < rr; rw++) {
              rq[xs(0xa26)](),
                rq[xs(0x710)](
                  (rw / rr) * Math["PI"] * 0x2 + (ru / rr) * Math["PI"]
                ),
                rq[xs(0xb25)](0x2e, 0x0),
                rq[xs(0x6ff)](rv, rv);
              const rx = Math[xs(0x7f1)](rt + rw * 0.05 * (0x1 - ru * 0.5));
              rq[xs(0x787)](),
                rq[xs(0x92d)](0x0, rs),
                rq[xs(0x2d2)](0x14, rs, 0x28 + rx, 0x0 + rx * 0x5),
                rq[xs(0x2d2)](0x14, -rs, 0x0, -rs),
                rq[xs(0x190)](),
                rq[xs(0x63f)](),
                rq[xs(0x6f2)](),
                rq[xs(0x20f)]();
            }
          }
          rq[xs(0x787)](),
            rq[xs(0x769)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rq[xs(0x716)] = this[xs(0x683)](xs(0x772))),
            rq[xs(0x190)](),
            rq[xs(0x63f)](),
            (rq[xs(0x6b1)] = 0x19),
            rq[xs(0x6f2)]();
        }
        [uf(0xbb2)](rq) {
          const xt = uf;
          rq[xt(0x5b0)](this[xt(0x58f)] / 0x28);
          let rr = this[xt(0x9e3)];
          const rs = this[xt(0x6b5)] ? 0x0 : Math[xt(0x7f1)](pz / 0x64) * 0xf;
          (rq[xt(0x625)] = rq[xt(0x70b)] = xt(0xac6)),
            rq[xt(0x787)](),
            rq[xt(0xa26)]();
          const rt = 0x3;
          for (let ru = 0x0; ru < 0x2; ru++) {
            const rv = ru === 0x0 ? 0x1 : -0x1;
            for (let rw = 0x0; rw <= rt; rw++) {
              rq[xt(0xa26)](), rq[xt(0x92d)](0x0, 0x0);
              const rx = Math[xt(0x7f1)](rr + rw + ru);
              rq[xt(0x710)](((rw / rt) * 0x2 - 0x1) * 0.6 + 1.4 + rx * 0.15),
                rq[xt(0xbe4)](0x2d + rv * rs, 0x0),
                rq[xt(0x710)](0.2 + (rx * 0.5 + 0.5) * 0.1),
                rq[xt(0xbe4)](0x4b, 0x0),
                rq[xt(0x20f)]();
            }
            rq[xt(0x6ff)](0x1, -0x1);
          }
          rq[xt(0x20f)](),
            (rq[xt(0x6b1)] = 0x8),
            (rq[xt(0xfb)] = this[xt(0x683)](xt(0x9fb))),
            rq[xt(0x6f2)](),
            rq[xt(0xa26)](),
            rq[xt(0xb25)](0x0, rs),
            this[xt(0x6da)](rq),
            rq[xt(0x20f)]();
        }
        [uf(0x6da)](rq, rr = ![]) {
          const xu = uf;
          (rq[xu(0x625)] = rq[xu(0x70b)] = xu(0xac6)),
            rq[xu(0x710)](-0.15),
            rq[xu(0x787)](),
            rq[xu(0x92d)](-0x32, 0x0),
            rq[xu(0xbe4)](0x28, 0x0),
            rq[xu(0x92d)](0xf, 0x0),
            rq[xu(0xbe4)](-0x5, 0x19),
            rq[xu(0x92d)](-0x3, 0x0),
            rq[xu(0xbe4)](0xc, -0x14),
            rq[xu(0x92d)](-0xe, -0x5),
            rq[xu(0xbe4)](-0x2e, -0x17),
            (rq[xu(0x6b1)] = 0x1c),
            (rq[xu(0xfb)] = this[xu(0x683)](xu(0x64d))),
            rq[xu(0x6f2)](),
            (rq[xu(0xfb)] = this[xu(0x683)](xu(0x8da))),
            (rq[xu(0x6b1)] -= rr ? 0xf : 0xa),
            rq[xu(0x6f2)]();
        }
        [uf(0x5b5)](rq) {
          const xv = uf;
          rq[xv(0x5b0)](this[xv(0x58f)] / 0x64),
            rq[xv(0x787)](),
            rq[xv(0x769)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xv(0x716)] = this[xv(0x683)](xv(0xa8d))),
            rq[xv(0x190)](),
            rq[xv(0x63f)](),
            (rq[xv(0x6b1)] = this[xv(0xd19)] ? 0x32 : 0x1e),
            (rq[xv(0xfb)] = xv(0xd1d)),
            rq[xv(0x6f2)]();
          if (!this[xv(0x6e2)]) {
            const rr = new Path2D(),
              rs = this[xv(0xd19)] ? 0x2 : 0x3;
            for (let rt = 0x0; rt <= rs; rt++) {
              for (let ru = 0x0; ru <= rs; ru++) {
                const rv =
                    ((ru / rs + Math[xv(0xb03)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rt % 0x2 === 0x0 ? -0x14 : 0x0),
                  rw = ((rt / rs + Math[xv(0xb03)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rx = Math[xv(0xb03)]() * 0xd + (this[xv(0xd19)] ? 0xe : 0x7);
                rr[xv(0x92d)](rv, rw),
                  rr[xv(0x769)](rv, rw, rx, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xv(0x6e2)] = rr;
          }
          rq[xv(0x787)](),
            rq[xv(0x769)](
              0x0,
              0x0,
              0x64 - rq[xv(0x6b1)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rq[xv(0x63f)](),
            (rq[xv(0x716)] = xv(0x1fd)),
            rq[xv(0x190)](this[xv(0x6e2)]);
        }
        [uf(0x500)](rq) {
          const xw = uf;
          rq[xw(0x5b0)](this[xw(0x58f)] / 0x64),
            rq[xw(0xa26)](),
            rq[xw(0xb25)](-0xf5, -0xdc),
            (rq[xw(0xfb)] = this[xw(0x683)](xw(0x557))),
            (rq[xw(0x716)] = this[xw(0x683)](xw(0x466))),
            (rq[xw(0x6b1)] = 0xf),
            (rq[xw(0x70b)] = rq[xw(0x625)] = xw(0xac6));
          const rr = !this[xw(0xd19)];
          if (rr) {
            rq[xw(0xa26)](),
              rq[xw(0xb25)](0x10e, 0xde),
              rq[xw(0xa26)](),
              rq[xw(0x710)](-0.1);
            for (let rs = 0x0; rs < 0x3; rs++) {
              rq[xw(0x787)](),
                rq[xw(0x92d)](-0x5, 0x0),
                rq[xw(0x2d2)](0x0, 0x28, 0x5, 0x0),
                rq[xw(0x6f2)](),
                rq[xw(0x190)](),
                rq[xw(0xb25)](0x28, 0x0);
            }
            rq[xw(0x20f)](), rq[xw(0xb25)](0x17, 0x32), rq[xw(0x710)](0.05);
            for (let rt = 0x0; rt < 0x2; rt++) {
              rq[xw(0x787)](),
                rq[xw(0x92d)](-0x5, 0x0),
                rq[xw(0x2d2)](0x0, -0x28, 0x5, 0x0),
                rq[xw(0x6f2)](),
                rq[xw(0x190)](),
                rq[xw(0xb25)](0x28, 0x0);
            }
            rq[xw(0x20f)]();
          }
          rq[xw(0x190)](lm),
            rq[xw(0x6f2)](lm),
            rq[xw(0x190)](ln),
            rq[xw(0x6f2)](ln),
            rq[xw(0x20f)](),
            rr &&
              (rq[xw(0x787)](),
              rq[xw(0x769)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rq[xw(0x769)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rq[xw(0x716)] = xw(0xd1d)),
              rq[xw(0x190)]());
        }
        [uf(0x6ce)](rq) {
          const xx = uf;
          rq[xx(0x5b0)](this[xx(0x58f)] / 0x46), rq[xx(0xa26)]();
          !this[xx(0xd19)] && rq[xx(0x710)](Math["PI"] / 0x2);
          rq[xx(0xb25)](0x0, 0x2d),
            rq[xx(0x787)](),
            rq[xx(0x92d)](0x0, -0x64),
            rq[xx(0x9f1)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rq[xx(0x9f1)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rq[xx(0x625)] = rq[xx(0x70b)] = xx(0xac6)),
            (rq[xx(0x6b1)] = 0x3c),
            (rq[xx(0xfb)] = this[xx(0x683)](xx(0x283))),
            rq[xx(0x6f2)](),
            (rq[xx(0x6b1)] -= this[xx(0xd19)] ? 0x23 : 0x14),
            (rq[xx(0x716)] = rq[xx(0xfb)] = this[xx(0x683)](xx(0x388))),
            rq[xx(0x6f2)](),
            (rq[xx(0x6b1)] -= this[xx(0xd19)] ? 0x16 : 0xf),
            (rq[xx(0x716)] = rq[xx(0xfb)] = this[xx(0x683)](xx(0xd7d))),
            rq[xx(0x6f2)](),
            rq[xx(0x190)](),
            rq[xx(0xb25)](0x0, -0x24);
          if (this[xx(0xd19)]) rq[xx(0x5b0)](0.9);
          rq[xx(0x787)](),
            rq[xx(0xadb)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rq[xx(0x716)] = this[xx(0x683)](xx(0xb9f))),
            rq[xx(0x190)](),
            rq[xx(0x63f)](),
            (rq[xx(0x6b1)] = 0xd),
            (rq[xx(0xfb)] = xx(0xd1d)),
            rq[xx(0x6f2)](),
            rq[xx(0x787)](),
            rq[xx(0xadb)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rq[xx(0x716)] = xx(0x1ba)),
            rq[xx(0x190)](),
            rq[xx(0x20f)]();
        }
        [uf(0xba9)](rq) {
          const xy = uf;
          rq[xy(0x5b0)](this[xy(0x58f)] / 0x19);
          !this[xy(0x6b5)] &&
            this[xy(0xd19)] &&
            rq[xy(0x710)](Math[xy(0x7f1)](pz / 0x64 + this["id"]) * 0.15);
          rq[xy(0x787)](),
            rq[xy(0xcae)](-0x16, -0x16, 0x2c, 0x2c),
            (rq[xy(0x716)] = this[xy(0x683)](xy(0x3a1))),
            rq[xy(0x190)](),
            (rq[xy(0x6b1)] = 0x6),
            (rq[xy(0x70b)] = xy(0xac6)),
            (rq[xy(0xfb)] = this[xy(0x683)](xy(0x466))),
            rq[xy(0x6f2)](),
            rq[xy(0x787)]();
          const rr = this[xy(0x6b5)] ? 0x1 : 0x1 - Math[xy(0x7f1)](pz / 0x1f4),
            rs = rw(0x0, 0.25),
            rt = 0x1 - rw(0.25, 0.25),
            ru = rw(0.5, 0.25),
            rv = rw(0.75, 0.25);
          function rw(rx, ry) {
            const xz = xy;
            return Math[xz(0xc0c)](0x1, Math[xz(0x411)](0x0, (rr - rx) / ry));
          }
          rq[xy(0x710)]((rt * Math["PI"]) / 0x4);
          for (let rx = 0x0; rx < 0x2; rx++) {
            const ry = (rx * 0x2 - 0x1) * 0x7 * rv;
            for (let rz = 0x0; rz < 0x3; rz++) {
              let rA = rs * (-0xb + rz * 0xb);
              rq[xy(0x92d)](rA, ry),
                rq[xy(0x769)](rA, ry, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rq[xy(0x716)] = this[xy(0x683)](xy(0xb0e))), rq[xy(0x190)]();
        }
        [uf(0x7e5)](rq) {
          const xA = uf;
          rq[xA(0xa26)](),
            rq[xA(0xb25)](this["x"], this["y"]),
            this[xA(0x727)](rq),
            rq[xA(0x710)](this[xA(0x903)]),
            (rq[xA(0x6b1)] = 0x8);
          const rr = (rw, rx) => {
              const xB = xA;
              (rt = this[xB(0x58f)] / 0x14),
                rq[xB(0x6ff)](rt, rt),
                rq[xB(0x787)](),
                rq[xB(0x769)](0x0, 0x0, 0x14, 0x0, l0),
                (rq[xB(0x716)] = this[xB(0x683)](rw)),
                rq[xB(0x190)](),
                (rq[xB(0xfb)] = this[xB(0x683)](rx)),
                rq[xB(0x6f2)]();
            },
            rs = (rw, rx, ry) => {
              const xC = xA;
              (rw = l8[rw]),
                rq[xC(0x6ff)](this[xC(0x58f)], this[xC(0x58f)]),
                (rq[xC(0x6b1)] /= this[xC(0x58f)]),
                (rq[xC(0xfb)] = this[xC(0x683)](ry)),
                rq[xC(0x6f2)](rw),
                (rq[xC(0x716)] = this[xC(0x683)](rx)),
                rq[xC(0x190)](rw);
            };
          let rt, ru, rv;
          switch (this[xA(0x511)]) {
            case cS[xA(0xba9)]:
            case cS[xA(0xa78)]:
              this[xA(0xba9)](rq);
              break;
            case cS[xA(0x6ce)]:
            case cS[xA(0xa79)]:
              this[xA(0x6ce)](rq);
              break;
            case cS[xA(0x7b6)]:
              (rq[xA(0xfb)] = xA(0xd1d)),
                (rq[xA(0x6b1)] = 0x14),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x12e))),
                rq[xA(0xb25)](-this[xA(0x58f)], 0x0),
                rq[xA(0x710)](-Math["PI"] / 0x2),
                rq[xA(0x5b0)](0.5),
                rq[xA(0xb25)](0x0, 0x46),
                this[xA(0x12b)](rq, this[xA(0x58f)] * 0x4);
              break;
            case cS[xA(0x754)]:
              this[xA(0x754)](rq);
              break;
            case cS[xA(0xd77)]:
              this[xA(0x500)](rq);
              break;
            case cS[xA(0x500)]:
              this[xA(0x500)](rq);
              break;
            case cS[xA(0x5b5)]:
            case cS[xA(0xb05)]:
              this[xA(0x5b5)](rq);
              break;
            case cS[xA(0xaee)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x1e), this[xA(0x6da)](rq, !![]);
              break;
            case cS[xA(0xbb2)]:
              this[xA(0xbb2)](rq);
              break;
            case cS[xA(0xa32)]:
              (rq[xA(0x6b1)] *= 0.7),
                rs(xA(0x9e0), xA(0xb3e), xA(0xd14)),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0.6, 0x0, l0),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x772))),
                rq[xA(0x190)](),
                rq[xA(0x63f)](),
                (rq[xA(0xfb)] = xA(0xccd)),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x841)]:
              this[xA(0x841)](rq);
              break;
            case cS[xA(0x72c)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x16),
                rq[xA(0x710)](Math["PI"] / 0x2),
                rq[xA(0x787)]();
              for (let si = 0x0; si < 0x2; si++) {
                rq[xA(0x92d)](-0xa, -0x1e),
                  rq[xA(0x9f1)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rq[xA(0x6ff)](0x1, -0x1);
              }
              (rq[xA(0x6b1)] = 0x10),
                (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x493))),
                rq[xA(0x6f2)](),
                (rq[xA(0x6b1)] -= 0x7),
                (rq[xA(0xfb)] = xA(0x39e)),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0xa46)]:
              this[xA(0x23c)](rq);
              break;
            case cS[xA(0x459)]:
              this[xA(0xb84)](rq);
              break;
            case cS[xA(0x176)]:
              this[xA(0x176)](rq);
              break;
            case cS[xA(0xa11)]:
              this[xA(0xa11)](rq);
              break;
            case cS[xA(0xb37)]:
              !this[xA(0x64f)] &&
                ((this[xA(0x64f)] = new lT(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cY[xA(0x4b0)],
                  0x19
                )),
                (this[xA(0x64f)][xA(0x3d9)] = !![]),
                (this[xA(0x64f)][xA(0xa1c)] = !![]),
                (this[xA(0x64f)][xA(0xba6)] = 0x1),
                (this[xA(0x64f)][xA(0xaa2)] = !![]),
                (this[xA(0x64f)][xA(0x2ab)] = xA(0x986)),
                (this[xA(0x64f)][xA(0x26e)] = this[xA(0x26e)]));
              rq[xA(0x710)](Math["PI"] / 0x2),
                (this[xA(0x64f)][xA(0x828)] = this[xA(0x828)]),
                (this[xA(0x64f)][xA(0x58f)] = this[xA(0x58f)]),
                this[xA(0x64f)][xA(0x7e5)](rq);
              break;
            case cS[xA(0x4a0)]:
              this[xA(0x4a0)](rq);
              break;
            case cS[xA(0x60a)]:
              rq[xA(0xa26)](),
                rq[xA(0x5b0)](this[xA(0x58f)] / 0x64),
                rq[xA(0x710)]((Date[xA(0x603)]() / 0x190) % 6.28),
                this[xA(0xb10)](rq, 1.5),
                rq[xA(0x20f)]();
              break;
            case cS[xA(0x1d5)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x14),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x0, -0x5),
                rq[xA(0xbe4)](-0x8, 0x0),
                rq[xA(0xbe4)](0x0, 0x5),
                rq[xA(0xbe4)](0x8, 0x0),
                rq[xA(0x8ef)](),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x20),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x879))),
                rq[xA(0x6f2)](),
                (rq[xA(0x6b1)] = 0x14),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x363))),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0xbf7)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x14),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x5, -0x5),
                rq[xA(0xbe4)](-0x5, 0x5),
                rq[xA(0xbe4)](0x5, 0x0),
                rq[xA(0x8ef)](),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x20),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x387))),
                rq[xA(0x6f2)](),
                (rq[xA(0x6b1)] = 0x14),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x2a3))),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x3a0)]:
              this[xA(0x10e)](rq, xA(0xbc1));
              break;
            case cS[xA(0x730)]:
              this[xA(0x10e)](rq, xA(0x39a));
              break;
            case cS[xA(0x17a)]:
              this[xA(0x10e)](rq, xA(0x609));
              break;
            case cS[xA(0x241)]:
              this[xA(0x241)](rq);
              break;
            case cS[xA(0x296)]:
              this[xA(0x296)](rq);
              break;
            case cS[xA(0x162)]:
              this[xA(0x162)](rq);
              break;
            case cS[xA(0x3a6)]:
              this[xA(0x162)](rq, !![]);
              break;
            case cS[xA(0x8e2)]:
              this[xA(0x8e2)](rq);
              break;
            case cS[xA(0x184)]:
              this[xA(0x184)](rq);
              break;
            case cS[xA(0x9fc)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x19),
                lE(rq, 0x19),
                (rq[xA(0x70b)] = xA(0xac6)),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x29c))),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x8c9))),
                rq[xA(0x190)](),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x1f9)]:
              rq[xA(0xb25)](-this[xA(0x58f)], 0x0);
              const rw = Date[xA(0x603)]() / 0x32,
                rx = this[xA(0x58f)] * 0x2;
              rq[xA(0x787)]();
              const ry = 0x32;
              for (let sj = 0x0; sj < ry; sj++) {
                const sk = sj / ry,
                  sl = sk * Math["PI"] * (this[xA(0x6b5)] ? 7.75 : 0xa) - rw,
                  sm = sk * rx,
                  sn = sm * this[xA(0x44f)];
                rq[xA(0xbe4)](sm, Math[xA(0x7f1)](sl) * sn);
              }
              (rq[xA(0xfb)] = xA(0xb5c)),
                (rq[xA(0x70b)] = rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x4),
                (rq[xA(0x2f4)] = xA(0x572)),
                (rq[xA(0x161)] = this[xA(0x6b5)] ? 0xa : 0x14),
                rq[xA(0x6f2)](),
                rq[xA(0x6f2)](),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x4f2)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x37), this[xA(0xbd2)](rq);
              break;
            case cS[xA(0x96d)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x14), rq[xA(0x787)]();
              for (let so = 0x0; so < 0x2; so++) {
                rq[xA(0x92d)](-0x17, -0x5),
                  rq[xA(0x2d2)](0x0, 5.5, 0x17, -0x5),
                  rq[xA(0x6ff)](0x1, -0x1);
              }
              (rq[xA(0x6b1)] = 0xf),
                (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x466))),
                rq[xA(0x6f2)](),
                (rq[xA(0x6b1)] -= 0x6),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x3a1))),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x2ec)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x23),
                rq[xA(0x787)](),
                rq[xA(0xadb)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x6eb))),
                rq[xA(0x190)](),
                rq[xA(0x63f)](),
                (rq[xA(0xfb)] = xA(0x398)),
                (rq[xA(0x6b1)] = 0x12),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x1e, 0x0),
                rq[xA(0x9f1)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rq[xA(0x9f1)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rq[xA(0x6b1)] = 0x3),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                (rq[xA(0xfb)] = rq[xA(0x716)] = xA(0xa21)),
                rq[xA(0x190)](),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x38a)]:
              if (this[xA(0xa50)] !== this[xA(0x9bf)]) {
                this[xA(0xa50)] = this[xA(0x9bf)];
                const sp = new Path2D(),
                  sq = Math[xA(0xac6)](
                    this[xA(0x9bf)] * (this[xA(0x9bf)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sr = (Math["PI"] * 0x2) / sq,
                  ss = this[xA(0x9bf)] < 0x64 ? 0.3 : 0.1;
                for (let st = 0x0; st < sq; st++) {
                  const su = st * sr,
                    sv = su + Math[xA(0xb03)]() * sr,
                    sw = 0x1 - Math[xA(0xb03)]() * ss;
                  sp[xA(0xbe4)](
                    Math[xA(0xa87)](sv) * this[xA(0x9bf)] * sw,
                    Math[xA(0x7f1)](sv) * this[xA(0x9bf)] * sw
                  );
                }
                sp[xA(0x8ef)](), (this[xA(0x6e8)] = sp);
              }
              (rt = this[xA(0x58f)] / this[xA(0x9bf)]), rq[xA(0x6ff)](rt, rt);
              const rz = this[xA(0x2e3)] ? lh : [xA(0x152), xA(0x662)];
              (rq[xA(0xfb)] = this[xA(0x683)](rz[0x1])),
                rq[xA(0x6f2)](this[xA(0x6e8)]),
                (rq[xA(0x716)] = this[xA(0x683)](rz[0x0])),
                rq[xA(0x190)](this[xA(0x6e8)]);
              break;
            case cS[xA(0x186)]:
              if (this[xA(0xa50)] !== this[xA(0x9bf)]) {
                this[xA(0xa50)] = this[xA(0x9bf)];
                const sx = Math[xA(0xac6)](
                    this[xA(0x9bf)] > 0xc8
                      ? this[xA(0x9bf)] * 0.18
                      : this[xA(0x9bf)] * 0.25
                  ),
                  sy = 0.5,
                  sz = 0.85;
                this[xA(0x6e8)] = la(sx, this[xA(0x9bf)], sy, sz);
                if (this[xA(0x9bf)] < 0x12c) {
                  const sA = new Path2D(),
                    sB = sx * 0x2;
                  for (let sC = 0x0; sC < sB; sC++) {
                    const sD = ((sC + 0x1) / sB) * Math["PI"] * 0x2;
                    let sE = (sC % 0x2 === 0x0 ? 0.7 : 1.2) * this[xA(0x9bf)];
                    sA[xA(0xbe4)](
                      Math[xA(0xa87)](sD) * sE,
                      Math[xA(0x7f1)](sD) * sE
                    );
                  }
                  sA[xA(0x8ef)](), (this[xA(0xbd0)] = sA);
                } else this[xA(0xbd0)] = null;
              }
              (rt = this[xA(0x58f)] / this[xA(0x9bf)]), rq[xA(0x6ff)](rt, rt);
              this[xA(0xbd0)] &&
                ((rq[xA(0x716)] = this[xA(0x683)](xA(0xaf3))),
                rq[xA(0x190)](this[xA(0xbd0)]));
              (rq[xA(0xfb)] = this[xA(0x683)](xA(0x245))),
                rq[xA(0x6f2)](this[xA(0x6e8)]),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x7ff))),
                rq[xA(0x190)](this[xA(0x6e8)]);
              break;
            case cS[xA(0x2bf)]:
              rq[xA(0xa26)](),
                (rt = this[xA(0x58f)] / 0x28),
                rq[xA(0x6ff)](rt, rt),
                (rq[xA(0x716)] = rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6));
              for (let sF = 0x0; sF < 0x2; sF++) {
                const sG = sF === 0x0 ? 0x1 : -0x1;
                rq[xA(0xa26)](),
                  rq[xA(0xb25)](0x1c, sG * 0xd),
                  rq[xA(0x710)](
                    Math[xA(0x7f1)](this[xA(0x9e3)] * 1.24) * 0.1 * sG
                  ),
                  rq[xA(0x787)](),
                  rq[xA(0x92d)](0x0, sG * 0x6),
                  rq[xA(0xbe4)](0x14, sG * 0xb),
                  rq[xA(0xbe4)](0x28, 0x0),
                  rq[xA(0x2d2)](0x14, sG * 0x5, 0x0, 0x0),
                  rq[xA(0x8ef)](),
                  rq[xA(0x190)](),
                  rq[xA(0x6f2)](),
                  rq[xA(0x20f)]();
              }
              (ru = this[xA(0x2e3)] ? lh : [xA(0x1a0), xA(0x8b3)]),
                (rq[xA(0x716)] = this[xA(0x683)](ru[0x0])),
                rq[xA(0x190)](l5),
                (rq[xA(0x6b1)] = 0x6),
                (rq[xA(0x716)] = rq[xA(0xfb)] = this[xA(0x683)](ru[0x1])),
                rq[xA(0x6f2)](l5),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x15, 0x0),
                rq[xA(0x2d2)](0x0, -0x3, 0x15, 0x0),
                (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x7),
                rq[xA(0x6f2)]();
              const rA = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rq[xA(0x787)]();
              for (let sH = 0x0; sH < 0x2; sH++) {
                const sI = sH === 0x1 ? 0x1 : -0x1;
                for (let sJ = 0x0; sJ < rA[xA(0xbc8)]; sJ++) {
                  let [sK, sL] = rA[sJ];
                  (sL *= sI),
                    rq[xA(0x92d)](sK, sL),
                    rq[xA(0x769)](sK, sL, 0x5, 0x0, l0);
                }
              }
              rq[xA(0x190)](), rq[xA(0x190)](), rq[xA(0x20f)]();
              break;
            case cS[xA(0x729)]:
            case cS[xA(0x5dd)]:
              rq[xA(0xa26)](),
                (rt = this[xA(0x58f)] / 0x28),
                rq[xA(0x6ff)](rt, rt);
              const rB = this[xA(0x511)] === cS[xA(0x729)];
              rB &&
                (rq[xA(0xa26)](),
                rq[xA(0xb25)](-0x2d, 0x0),
                rq[xA(0x710)](Math["PI"]),
                this[xA(0x5af)](rq, 0xf / 1.1),
                rq[xA(0x20f)]());
              (ru = this[xA(0x2e3)]
                ? lh
                : rB
                ? [xA(0x2b3), xA(0x88f)]
                : [xA(0xd4a), xA(0x9ba)]),
                rq[xA(0x787)](),
                rq[xA(0xadb)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, l0),
                (rq[xA(0x6b1)] = 0xa),
                (rq[xA(0xfb)] = this[xA(0x683)](ru[0x1])),
                rq[xA(0x6f2)](),
                (rq[xA(0x716)] = this[xA(0x683)](ru[0x0])),
                rq[xA(0x190)](),
                rq[xA(0xa26)](),
                rq[xA(0x63f)](),
                rq[xA(0x787)]();
              const rC = [-0x1e, -0x5, 0x16];
              for (let sM = 0x0; sM < rC[xA(0xbc8)]; sM++) {
                const sN = rC[sM];
                rq[xA(0x92d)](sN, -0x32),
                  rq[xA(0x2d2)](sN - 0x14, 0x0, sN, 0x32);
              }
              (rq[xA(0x6b1)] = 0xe),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                rq[xA(0x6f2)](),
                rq[xA(0x20f)]();
              rB ? this[xA(0xcf9)](rq) : this[xA(0xa82)](rq);
              rq[xA(0x20f)]();
              break;
            case cS[xA(0x47a)]:
              (rt = this[xA(0x58f)] / 0x32), rq[xA(0x6ff)](rt, rt);
              const rD = 0x2f;
              rq[xA(0x787)]();
              for (let sO = 0x0; sO < 0x8; sO++) {
                let sP =
                  (0.25 + ((sO % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xA(0x7f1)](sO + this[xA(0x9e3)] * 1.3) * 0.2;
                sO >= 0x4 && (sP *= -0x1),
                  rq[xA(0x92d)](0x0, 0x0),
                  rq[xA(0xbe4)](
                    Math[xA(0xa87)](sP) * rD,
                    Math[xA(0x7f1)](sP) * rD
                  );
              }
              (rq[xA(0x6b1)] = 0x7),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                (rq[xA(0x625)] = xA(0xac6)),
                rq[xA(0x6f2)](),
                (rq[xA(0x716)] = rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x6);
              for (let sQ = 0x0; sQ < 0x2; sQ++) {
                const sR = sQ === 0x0 ? 0x1 : -0x1;
                rq[xA(0xa26)](),
                  rq[xA(0xb25)](0x16, sR * 0xa),
                  rq[xA(0x710)](
                    -(Math[xA(0x7f1)](this[xA(0x9e3)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      sR
                  ),
                  rq[xA(0x787)](),
                  rq[xA(0x92d)](0x0, sR * 0x6),
                  rq[xA(0x2d2)](0x14, sR * 0xf, 0x28, 0x0),
                  rq[xA(0x2d2)](0x14, sR * 0x5, 0x0, 0x0),
                  rq[xA(0x8ef)](),
                  rq[xA(0x190)](),
                  rq[xA(0x6f2)](),
                  rq[xA(0x20f)]();
              }
              (rq[xA(0x6b1)] = 0x8),
                l9(
                  rq,
                  0x1,
                  0x8,
                  this[xA(0x683)](xA(0x2e4)),
                  this[xA(0x683)](xA(0xd45))
                );
              let rE;
              (rE = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rq[xA(0x787)]();
              for (let sS = 0x0; sS < rE[xA(0xbc8)]; sS++) {
                const [sT, sU] = rE[sS];
                rq[xA(0x92d)](sT, -sU),
                  rq[xA(0x2d2)](sT + Math[xA(0xadd)](sT) * 4.2, 0x0, sT, sU);
              }
              (rq[xA(0x625)] = xA(0xac6)),
                rq[xA(0x6f2)](),
                rq[xA(0xb25)](-0x21, 0x0),
                l9(
                  rq,
                  0.45,
                  0x8,
                  this[xA(0x683)](xA(0x1a9)),
                  this[xA(0x683)](xA(0xce2))
                ),
                rq[xA(0x787)](),
                (rE = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let sV = 0x0; sV < rE[xA(0xbc8)]; sV++) {
                const [sW, sX] = rE[sV];
                rq[xA(0x92d)](sW, -sX), rq[xA(0x2d2)](sW - 0x3, 0x0, sW, sX);
              }
              (rq[xA(0x6b1)] = 0x5),
                (rq[xA(0x625)] = xA(0xac6)),
                rq[xA(0x6f2)](),
                rq[xA(0xb25)](0x11, 0x0),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x0, -0x9),
                rq[xA(0xbe4)](0x0, 0x9),
                rq[xA(0xbe4)](0xb, 0x0),
                rq[xA(0x8ef)](),
                (rq[xA(0x70b)] = rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x6),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x997))),
                rq[xA(0x190)](),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x172)]:
              this[xA(0x9fd)](rq, xA(0x20e), xA(0x884), xA(0xdb0));
              break;
            case cS[xA(0xc6e)]:
              this[xA(0x9fd)](rq, xA(0x669), xA(0xbdb), xA(0x88d));
              break;
            case cS[xA(0xad0)]:
              this[xA(0x9fd)](rq, xA(0xd84), xA(0x256), xA(0xdb0));
              break;
            case cS[xA(0x642)]:
              (rt = this[xA(0x58f)] / 0x46),
                rq[xA(0x5b0)](rt),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x958))),
                rq[xA(0x190)](lc),
                rq[xA(0x63f)](lc),
                (rq[xA(0x6b1)] = 0xf),
                (rq[xA(0xfb)] = xA(0x76a)),
                rq[xA(0x6f2)](lc),
                (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x7),
                (rq[xA(0xfb)] = xA(0xb15)),
                rq[xA(0x6f2)](ld);
              break;
            case cS[xA(0x1da)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x28),
                this[xA(0x38c)](rq, 0x32, 0x1e, 0x7);
              break;
            case cS[xA(0x226)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x64),
                this[xA(0x38c)](rq),
                (rq[xA(0x716)] = rq[xA(0xfb)]);
              const rF = 0x6,
                rG = 0x3;
              rq[xA(0x787)]();
              for (let sY = 0x0; sY < rF; sY++) {
                const sZ = (sY / rF) * Math["PI"] * 0x2;
                rq[xA(0xa26)](), rq[xA(0x710)](sZ);
                for (let t0 = 0x0; t0 < rG; t0++) {
                  const t1 = t0 / rG,
                    t2 = 0x12 + t1 * 0x44,
                    t3 = 0x7 + t1 * 0x6;
                  rq[xA(0x92d)](t2, 0x0),
                    rq[xA(0x769)](t2, 0x0, t3, 0x0, Math["PI"] * 0x2);
                }
                rq[xA(0x20f)]();
              }
              rq[xA(0x190)]();
              break;
            case cS[xA(0xd0d)]:
              (rt = this[xA(0x58f)] / 0x31),
                rq[xA(0x5b0)](rt),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                (rv = this[xA(0x9e3)] * 0x15e);
              const rH = (Math[xA(0x7f1)](rv * 0.01) * 0.5 + 0.5) * 0.1;
              (rq[xA(0xfb)] = rq[xA(0x716)] = this[xA(0x683)](xA(0xaf3))),
                (rq[xA(0x6b1)] = 0x3);
              for (let t4 = 0x0; t4 < 0x2; t4++) {
                rq[xA(0xa26)]();
                const t5 = t4 * 0x2 - 0x1;
                rq[xA(0x6ff)](0x1, t5),
                  rq[xA(0xb25)](0x1c, -0x27),
                  rq[xA(0x6ff)](1.5, 1.5),
                  rq[xA(0x710)](rH),
                  rq[xA(0x787)](),
                  rq[xA(0x92d)](0x0, 0x0),
                  rq[xA(0x2d2)](0xc, -0x8, 0x14, 0x3),
                  rq[xA(0xbe4)](0xb, 0x1),
                  rq[xA(0xbe4)](0x11, 0x9),
                  rq[xA(0x2d2)](0xc, 0x5, 0x0, 0x6),
                  rq[xA(0x8ef)](),
                  rq[xA(0x6f2)](),
                  rq[xA(0x190)](),
                  rq[xA(0x20f)]();
              }
              rq[xA(0x787)]();
              for (let t6 = 0x0; t6 < 0x2; t6++) {
                for (let t7 = 0x0; t7 < 0x4; t7++) {
                  const t8 = t6 * 0x2 - 0x1,
                    t9 =
                      (Math[xA(0x7f1)](rv * 0.005 + t6 + t7 * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rq[xA(0xa26)](),
                    rq[xA(0x6ff)](0x1, t8),
                    rq[xA(0xb25)]((t7 / 0x3) * 0x1e - 0xf, 0x28);
                  const ta = t7 < 0x2 ? 0x1 : -0x1;
                  rq[xA(0x710)](t9 * ta),
                    rq[xA(0x92d)](0x0, 0x0),
                    rq[xA(0xb25)](0x0, 0x19),
                    rq[xA(0xbe4)](0x0, 0x0),
                    rq[xA(0x710)](ta * 0.7 * (t9 + 0.3)),
                    rq[xA(0xbe4)](0x0, 0xa),
                    rq[xA(0x20f)]();
                }
              }
              (rq[xA(0x6b1)] = 0xa),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x2, 0x17),
                rq[xA(0x2d2)](0x17, 0x0, 0x2, -0x17),
                rq[xA(0xbe4)](-0xa, -0xf),
                rq[xA(0xbe4)](-0xa, 0xf),
                rq[xA(0x8ef)](),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x890))),
                (rq[xA(0x6b1)] = 0x44),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                rq[xA(0x6f2)](),
                (rq[xA(0x6b1)] -= 0x12),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x3f5))),
                rq[xA(0x6f2)](),
                (rq[xA(0xfb)] = xA(0xd1d)),
                rq[xA(0x787)]();
              const rI = 0x12;
              for (let tb = 0x0; tb < 0x2; tb++) {
                rq[xA(0x92d)](-0x12, rI),
                  rq[xA(0x2d2)](0x0, -0x7 + rI, 0x12, rI),
                  rq[xA(0x6ff)](0x1, -0x1);
              }
              (rq[xA(0x6b1)] = 0x9), rq[xA(0x6f2)]();
              break;
            case cS[xA(0x1cd)]:
              (rt = this[xA(0x58f)] / 0x50),
                rq[xA(0x5b0)](rt),
                rq[xA(0x710)](
                  ((Date[xA(0x603)]() / 0x7d0) % l0) + this[xA(0x9e3)] * 0.4
                );
              const rJ = 0x5;
              !this[xA(0xc97)] &&
                (this[xA(0xc97)] = Array(rJ)[xA(0x190)](0x64));
              const rK = this[xA(0xc97)],
                rL = this[xA(0x3d9)]
                  ? 0x0
                  : Math[xA(0xa9a)](this[xA(0xc14)] * (rJ - 0x1));
              rq[xA(0x787)]();
              for (let tc = 0x0; tc < rJ; tc++) {
                const td = ((tc + 0.5) / rJ) * Math["PI"] * 0x2,
                  te = ((tc + 0x1) / rJ) * Math["PI"] * 0x2;
                rK[tc] += ((tc < rL ? 0x64 : 0x3c) - rK[tc]) * 0.2;
                const tf = rK[tc];
                if (tc === 0x0) rq[xA(0x92d)](tf, 0x0);
                rq[xA(0x2d2)](
                  Math[xA(0xa87)](td) * 0x5,
                  Math[xA(0x7f1)](td) * 0x5,
                  Math[xA(0xa87)](te) * tf,
                  Math[xA(0x7f1)](te) * tf
                );
              }
              rq[xA(0x8ef)](),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x1c + 0xa),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x99a))),
                rq[xA(0x6f2)](),
                (rq[xA(0x6b1)] = 0x10 + 0xa),
                (rq[xA(0xfb)] = rq[xA(0x716)] = this[xA(0x683)](xA(0x6a4))),
                rq[xA(0x190)](),
                rq[xA(0x6f2)](),
                rq[xA(0x787)]();
              for (let tg = 0x0; tg < rJ; tg++) {
                const th = (tg / rJ) * Math["PI"] * 0x2;
                rq[xA(0xa26)](), rq[xA(0x710)](th);
                const ti = rK[tg] / 0x64;
                let tj = 0x1a;
                const tk = 0x4;
                for (let tl = 0x0; tl < tk; tl++) {
                  const tm = (0x1 - (tl / tk) * 0.7) * 0xc * ti;
                  rq[xA(0x92d)](tj, 0x0),
                    rq[xA(0x769)](tj, 0x0, tm, 0x0, Math["PI"] * 0x2),
                    (tj += tm * 0x2 + 3.5 * ti);
                }
                rq[xA(0x20f)]();
              }
              (rq[xA(0x716)] = xA(0x78a)), rq[xA(0x190)]();
              break;
            case cS[xA(0x52b)]:
              (rt = this[xA(0x58f)] / 0x1e),
                rq[xA(0x5b0)](rt),
                rq[xA(0xb25)](-0x22, 0x0),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x0, -0x8),
                rq[xA(0x2d2)](0x9b, 0x0, 0x0, 0x8),
                rq[xA(0x8ef)](),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x1a),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x99a))),
                rq[xA(0x6f2)](),
                (rq[xA(0x6b1)] = 0x10),
                (rq[xA(0xfb)] = rq[xA(0x716)] = this[xA(0x683)](xA(0x6a4))),
                rq[xA(0x190)](),
                rq[xA(0x6f2)](),
                rq[xA(0x787)]();
              let rM = 0xd;
              for (let tn = 0x0; tn < 0x4; tn++) {
                const to = (0x1 - (tn / 0x4) * 0.7) * 0xa;
                rq[xA(0x92d)](rM, 0x0),
                  rq[xA(0x769)](rM, 0x0, to, 0x0, Math["PI"] * 0x2),
                  (rM += to * 0x2 + 0x4);
              }
              (rq[xA(0x716)] = xA(0x78a)), rq[xA(0x190)]();
              break;
            case cS[xA(0xc70)]:
              (rt = this[xA(0x58f)] / 0x64),
                rq[xA(0x6ff)](rt, rt),
                (rq[xA(0x70b)] = rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0xfb)] = xA(0x782)),
                (rq[xA(0x6b1)] = 0x14);
              const rN = [0x1, 0.63, 0.28],
                rO = this[xA(0x2e3)] ? lo : [xA(0x48c), xA(0xd12), xA(0x612)],
                rP = (pz * 0.005) % l0;
              for (let tp = 0x0; tp < 0x3; tp++) {
                const tq = rN[tp],
                  tr = rO[tp];
                rq[xA(0xa26)](),
                  rq[xA(0x710)](rP * (tp % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rq[xA(0x787)]();
                const ts = 0x7 - tp;
                for (let tu = 0x0; tu < ts; tu++) {
                  const tv = (Math["PI"] * 0x2 * tu) / ts;
                  rq[xA(0xbe4)](
                    Math[xA(0xa87)](tv) * tq * 0x64,
                    Math[xA(0x7f1)](tv) * tq * 0x64
                  );
                }
                rq[xA(0x8ef)](),
                  (rq[xA(0xfb)] = rq[xA(0x716)] = this[xA(0x683)](tr)),
                  rq[xA(0x190)](),
                  rq[xA(0x6f2)](),
                  rq[xA(0x20f)]();
              }
              break;
            case cS[xA(0x15f)]:
              (rt = this[xA(0x58f)] / 0x41),
                rq[xA(0x6ff)](rt, rt),
                (rv = this[xA(0x9e3)] * 0x2),
                rq[xA(0x710)](Math["PI"] / 0x2);
              if (this[xA(0xbff)]) {
                const tw = 0x3;
                rq[xA(0x787)]();
                for (let tA = 0x0; tA < 0x2; tA++) {
                  for (let tB = 0x0; tB <= tw; tB++) {
                    const tC = (tB / tw) * 0x50 - 0x28;
                    rq[xA(0xa26)]();
                    const tD = tA * 0x2 - 0x1;
                    rq[xA(0xb25)](tD * -0x2d, tC);
                    const tE =
                      1.1 + Math[xA(0x7f1)]((tB / tw) * Math["PI"]) * 0.5;
                    rq[xA(0x6ff)](tE * tD, tE),
                      rq[xA(0x710)](Math[xA(0x7f1)](rv + tB + tD) * 0.3 + 0.3),
                      rq[xA(0x92d)](0x0, 0x0),
                      rq[xA(0x2d2)](-0xf, -0x5, -0x14, 0xa),
                      rq[xA(0x20f)]();
                  }
                }
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                  (rq[xA(0x6b1)] = 0x8),
                  (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                  rq[xA(0x6f2)](),
                  (rq[xA(0x6b1)] = 0xc);
                const tx = Date[xA(0x603)]() * 0.01,
                  ty = Math[xA(0x7f1)](tx * 0.5) * 0.5 + 0.5,
                  tz = ty * 0.1 + 0x1;
                rq[xA(0x787)](),
                  rq[xA(0x769)](-0xf * tz, 0x2b - ty, 0x10, 0x0, Math["PI"]),
                  rq[xA(0x769)](0xf * tz, 0x2b - ty, 0x10, 0x0, Math["PI"]),
                  rq[xA(0x92d)](-0x16, -0x2b),
                  rq[xA(0x769)](0x0, -0x2b - ty, 0x16, 0x0, Math["PI"], !![]),
                  (rq[xA(0xfb)] = this[xA(0x683)](xA(0x412))),
                  rq[xA(0x6f2)](),
                  (rq[xA(0x716)] = this[xA(0x683)](xA(0x1a0))),
                  rq[xA(0x190)](),
                  rq[xA(0xa26)](),
                  rq[xA(0x710)]((Math["PI"] * 0x3) / 0x2),
                  this[xA(0xa82)](rq, 0x1a - ty, 0x0),
                  rq[xA(0x20f)]();
              }
              if (!this[xA(0x156)]) {
                const tF = dI[d9[xA(0xcd9)]],
                  tG = Math[xA(0x411)](this["id"] % tF[xA(0xbc8)], 0x0),
                  tH = new lN(-0x1, 0x0, 0x0, tF[tG]["id"]);
                (tH[xA(0xc18)] = 0x1),
                  (tH[xA(0x903)] = 0x0),
                  (this[xA(0x156)] = tH);
              }
              rq[xA(0x5b0)](1.3), this[xA(0x156)][xA(0x7e5)](rq);
              break;
            case cS[xA(0x24a)]:
              (rt = this[xA(0x58f)] / 0x14),
                rq[xA(0x6ff)](rt, rt),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x11, 0x0),
                rq[xA(0xbe4)](0x0, 0x0),
                rq[xA(0xbe4)](0x11, 0x6),
                rq[xA(0x92d)](0x0, 0x0),
                rq[xA(0xbe4)](0xb, -0x7),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x236))),
                (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0xc),
                rq[xA(0x6f2)](),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xc42))),
                (rq[xA(0x6b1)] = 0x6),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x105)]:
              (rt = this[xA(0x58f)] / 0x80),
                rq[xA(0x5b0)](rt),
                rq[xA(0xb25)](-0x80, -0x78),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x1c4))),
                rq[xA(0x190)](f9[xA(0x319)]),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xb55))),
                (rq[xA(0x6b1)] = 0x14),
                rq[xA(0x6f2)](f9[xA(0x319)]);
              break;
            case cS[xA(0x61b)]:
              (rt = this[xA(0x58f)] / 0x19),
                rq[xA(0x6ff)](rt, rt),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x19, 0x0),
                rq[xA(0xbe4)](-0x2d, 0x0),
                (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x14),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x3a1))),
                rq[xA(0x190)](),
                (rq[xA(0x6b1)] = 0x7),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x10f))),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x14e)]:
              rq[xA(0x710)](-this[xA(0x903)]),
                rq[xA(0x5b0)](this[xA(0x58f)] / 0x14),
                this[xA(0x3fe)](rq),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x3a1))),
                rq[xA(0x190)](),
                rq[xA(0x63f)](),
                (rq[xA(0x6b1)] = 0xc),
                (rq[xA(0xfb)] = xA(0xd1d)),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0xc4a)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x64), this[xA(0xd96)](rq);
              break;
            case cS[xA(0xd3)]:
              this[xA(0x69d)](rq, !![]);
              break;
            case cS[xA(0x197)]:
              this[xA(0x69d)](rq, ![]);
              break;
            case cS[xA(0xa47)]:
              (rt = this[xA(0x58f)] / 0xa),
                rq[xA(0x5b0)](rt),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x0, 0x8),
                rq[xA(0x2d2)](2.5, 0x0, 0x0, -0x8),
                (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0xa),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x10f))),
                rq[xA(0x6f2)](),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x3a1))),
                (rq[xA(0x6b1)] = 0x6),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x731)]:
              (rt = this[xA(0x58f)] / 0xa),
                rq[xA(0x5b0)](rt),
                rq[xA(0xb25)](0x7, 0x0),
                (rq[xA(0x625)] = xA(0xac6)),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x5, -0x5),
                rq[xA(0x9f1)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rq[xA(0x9f1)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0xaf3))),
                rq[xA(0x190)](),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xd5c))),
                (rq[xA(0x6b1)] = 0x3),
                (rq[xA(0x70b)] = xA(0xac6)),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x92e)]:
              (rt = this[xA(0x58f)] / 0x32), rq[xA(0x5b0)](rt), rq[xA(0x787)]();
              for (let tI = 0x0; tI < 0x9; tI++) {
                const tJ = (tI / 0x9) * Math["PI"] * 0x2,
                  tK =
                    0x3c *
                    (0x1 +
                      Math[xA(0xa87)]((tI / 0x9) * Math["PI"] * 3.5) * 0.07);
                rq[xA(0x92d)](0x0, 0x0),
                  rq[xA(0xbe4)](
                    Math[xA(0xa87)](tJ) * tK,
                    Math[xA(0x7f1)](tJ) * tK
                  );
              }
              (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x10),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x3a1))),
                rq[xA(0x190)](),
                (rq[xA(0x6b1)] = 0x6),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x10f))),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x881)]:
              rq[xA(0xa26)](),
                (rt = this[xA(0x58f)] / 0x28),
                rq[xA(0x6ff)](rt, rt),
                this[xA(0x8a8)](rq),
                (rq[xA(0x716)] = this[xA(0x683)](
                  this[xA(0x2e3)] ? lh[0x0] : xA(0xc3e)
                )),
                (rq[xA(0xfb)] = xA(0x322)),
                (rq[xA(0x6b1)] = 0x10),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rq[xA(0x190)](),
                rq[xA(0xa26)](),
                rq[xA(0x63f)](),
                rq[xA(0x6f2)](),
                rq[xA(0x20f)](),
                rq[xA(0x20f)]();
              break;
            case cS[xA(0xa1b)]:
            case cS[xA(0x350)]:
            case cS[xA(0x88a)]:
            case cS[xA(0x917)]:
            case cS[xA(0xd00)]:
            case cS[xA(0x22a)]:
            case cS[xA(0x8d0)]:
            case cS[xA(0x369)]:
              (rt = this[xA(0x58f)] / 0x14), rq[xA(0x6ff)](rt, rt);
              const rQ = Math[xA(0x7f1)](this[xA(0x9e3)] * 1.6),
                rR = this[xA(0x85a)][xA(0xb93)](xA(0xa1b)),
                rS = this[xA(0x85a)][xA(0xb93)](xA(0x178)),
                rT = this[xA(0x85a)][xA(0xb93)](xA(0x88a)),
                rU = this[xA(0x85a)][xA(0xb93)](xA(0x88a)) ? -0x4 : 0x0;
              (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x6);
              rS && rq[xA(0xb25)](0x8, 0x0);
              for (let tL = 0x0; tL < 0x2; tL++) {
                const tM = tL === 0x0 ? -0x1 : 0x1;
                rq[xA(0xa26)](), rq[xA(0x710)](tM * (rQ * 0.5 + 0.6) * 0.08);
                const tN = tM * 0x4;
                rq[xA(0x787)](),
                  rq[xA(0x92d)](0x0, tN),
                  rq[xA(0x2d2)](0xc, 0x6 * tM + tN, 0x18, tN),
                  rq[xA(0x6f2)](),
                  rq[xA(0x20f)]();
              }
              if (this[xA(0x2e3)])
                (rq[xA(0x716)] = this[xA(0x683)](lh[0x0])),
                  (rq[xA(0xfb)] = this[xA(0x683)](lh[0x1]));
              else
                this[xA(0x85a)][xA(0x5ff)](xA(0x979))
                  ? ((rq[xA(0x716)] = this[xA(0x683)](xA(0xca4))),
                    (rq[xA(0xfb)] = this[xA(0x683)](xA(0xdd4))))
                  : ((rq[xA(0x716)] = this[xA(0x683)](xA(0x690))),
                    (rq[xA(0xfb)] = this[xA(0x683)](xA(0x8cb))));
              rq[xA(0x6b1)] = rS ? 0x9 : 0xc;
              rS &&
                (rq[xA(0xa26)](),
                rq[xA(0xb25)](-0x18, 0x0),
                rq[xA(0x6ff)](-0x1, 0x1),
                lF(rq, 0x15, rq[xA(0x716)], rq[xA(0xfb)], rq[xA(0x6b1)]),
                rq[xA(0x20f)]());
              !rT &&
                (rq[xA(0xa26)](),
                rq[xA(0x787)](),
                rq[xA(0x769)](-0xa, 0x0, rS ? 0x12 : 0xc, 0x0, l0),
                rq[xA(0x190)](),
                rq[xA(0x63f)](),
                rq[xA(0x6f2)](),
                rq[xA(0x20f)]());
              if (rR || rS) {
                rq[xA(0xa26)](),
                  (rq[xA(0x716)] = this[xA(0x683)](xA(0x12e))),
                  (rq[xA(0x74e)] *= 0.5);
                const tO = (Math["PI"] / 0x7) * (rS ? 0.85 : 0x1) + rQ * 0.08;
                for (let tP = 0x0; tP < 0x2; tP++) {
                  const tQ = tP === 0x0 ? -0x1 : 0x1;
                  rq[xA(0xa26)](),
                    rq[xA(0x710)](tQ * tO),
                    rq[xA(0xb25)](
                      rS ? -0x13 : -0x9,
                      tQ * -0x3 * (rS ? 1.3 : 0x1)
                    ),
                    rq[xA(0x787)](),
                    rq[xA(0xadb)](
                      0x0,
                      0x0,
                      rS ? 0x14 : 0xe,
                      rS ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      l0
                    ),
                    rq[xA(0x190)](),
                    rq[xA(0x20f)]();
                }
                rq[xA(0x20f)]();
              }
              rq[xA(0xa26)](),
                rq[xA(0xb25)](0x4 + rU, 0x0),
                lF(
                  rq,
                  rT ? 0x14 : 12.1,
                  rq[xA(0x716)],
                  rq[xA(0xfb)],
                  rq[xA(0x6b1)]
                ),
                rq[xA(0x20f)]();
              break;
            case cS[xA(0xcf8)]:
              this[xA(0xd17)](rq, xA(0x49f));
              break;
            case cS[xA(0x201)]:
              this[xA(0xd17)](rq, xA(0xbbe));
              break;
            case cS[xA(0x7b3)]:
              this[xA(0xd17)](rq, xA(0x997)),
                (rq[xA(0x74e)] *= 0.2),
                lJ(rq, this[xA(0x58f)] * 1.3, 0x4);
              break;
            case cS[xA(0x62b)]:
            case cS[xA(0x2fe)]:
            case cS[xA(0x854)]:
            case cS[xA(0x224)]:
            case cS[xA(0x1a2)]:
            case cS[xA(0x657)]:
              rq[xA(0xa26)](),
                (rt = this[xA(0x58f)] / 0x28),
                rq[xA(0x6ff)](rt, rt),
                rq[xA(0x787)]();
              for (let tR = 0x0; tR < 0x2; tR++) {
                rq[xA(0xa26)](),
                  rq[xA(0x6ff)](0x1, tR * 0x2 - 0x1),
                  rq[xA(0xb25)](0x0, 0x23),
                  rq[xA(0x92d)](0x9, 0x0),
                  rq[xA(0xbe4)](0x5, 0xa),
                  rq[xA(0xbe4)](-0x5, 0xa),
                  rq[xA(0xbe4)](-0x9, 0x0),
                  rq[xA(0xbe4)](0x9, 0x0),
                  rq[xA(0x20f)]();
              }
              (rq[xA(0x6b1)] = 0x12),
                (rq[xA(0x70b)] = rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0xfb)] = rq[xA(0x716)] = this[xA(0x683)](xA(0xdae))),
                rq[xA(0x190)](),
                rq[xA(0x6f2)]();
              let rV;
              if (this[xA(0x85a)][xA(0xbf1)](xA(0x422)) > -0x1)
                rV = [xA(0x507), xA(0x9ab)];
              else
                this[xA(0x85a)][xA(0xbf1)](xA(0xbc3)) > -0x1
                  ? (rV = [xA(0x1a0), xA(0xaa9)])
                  : (rV = [xA(0xb9e), xA(0x123)]);
              rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0x28, 0x0, l0),
                (rq[xA(0x716)] = this[xA(0x683)](rV[0x0])),
                rq[xA(0x190)](),
                (rq[xA(0x6b1)] = 0x8),
                (rq[xA(0xfb)] = this[xA(0x683)](rV[0x1])),
                rq[xA(0x6f2)]();
              this[xA(0x85a)][xA(0xbf1)](xA(0x57b)) > -0x1 &&
                this[xA(0xa82)](rq, -0xf, 0x0, 1.25, 0x4);
              rq[xA(0x20f)]();
              break;
            case cS[xA(0x181)]:
            case cS[xA(0x721)]:
              (rv =
                Math[xA(0x7f1)](
                  Date[xA(0x603)]() / 0x3e8 + this[xA(0x9e3)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rt = this[xA(0x58f)] / 0x50),
                rq[xA(0x6ff)](rt, rt);
              const rW = this[xA(0x511)] === cS[xA(0x721)];
              rW &&
                (rq[xA(0xa26)](),
                rq[xA(0x6ff)](0x2, 0x2),
                this[xA(0x8a8)](rq),
                rq[xA(0x20f)]());
              rq[xA(0x710)](-this[xA(0x903)]),
                (rq[xA(0x6b1)] = 0xa),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (ru = this[xA(0x2e3)]
                  ? lh
                  : rW
                  ? [xA(0x51c), xA(0xcc2)]
                  : [xA(0xb71), xA(0xd7b)]),
                (rq[xA(0x716)] = this[xA(0x683)](ru[0x0])),
                rq[xA(0x190)](),
                rq[xA(0x63f)](),
                (rq[xA(0xfb)] = this[xA(0x683)](ru[0x1])),
                rq[xA(0x6f2)]();
              const rX = this[xA(0x683)](xA(0x3a1)),
                rY = this[xA(0x683)](xA(0xdb0)),
                rZ = (tS = 0x1) => {
                  const xD = xA;
                  rq[xD(0xa26)](),
                    rq[xD(0x6ff)](tS, 0x1),
                    rq[xD(0xb25)](0x13 - rv * 0x4, -0x1d + rv * 0x5),
                    rq[xD(0x787)](),
                    rq[xD(0x92d)](0x0, 0x0),
                    rq[xD(0x9f1)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rq[xD(0x2d2)](0x19, 0x5 + rv * 0x2, 0x0, 0x0),
                    rq[xD(0x8ef)](),
                    (rq[xD(0x6b1)] = 0x3),
                    rq[xD(0x6f2)](),
                    (rq[xD(0x716)] = rX),
                    rq[xD(0x190)](),
                    rq[xD(0x63f)](),
                    rq[xD(0x787)](),
                    rq[xD(0x769)](
                      0x16 + tS * this[xD(0xc30)] * 0x10,
                      -0x4 + this[xD(0x5e7)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rq[xD(0x716)] = rY),
                    rq[xD(0x190)](),
                    rq[xD(0x20f)]();
                };
              rZ(0x1),
                rZ(-0x1),
                rq[xA(0xa26)](),
                rq[xA(0xb25)](0x0, 0xa),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x28 + rv * 0xa, -0xe + rv * 0x5),
                rq[xA(0x2d2)](0x0, +rv * 0x5, 0x2c - rv * 0xf, -0xe + rv * 0x5),
                rq[xA(0x9f1)](
                  0x14,
                  0x28 - rv * 0x14,
                  -0x14,
                  0x28 - rv * 0x14,
                  -0x28 + rv * 0xa,
                  -0xe + rv * 0x5
                ),
                rq[xA(0x8ef)](),
                (rq[xA(0x6b1)] = 0x5),
                rq[xA(0x6f2)](),
                (rq[xA(0x716)] = rY),
                rq[xA(0x190)](),
                rq[xA(0x63f)]();
              const s0 = rv * 0x2,
                s1 = rv * -0xa;
              rq[xA(0xa26)](),
                rq[xA(0xb25)](0x0, s1),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x37, -0x8),
                rq[xA(0x9f1)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rq[xA(0xfb)] = rX),
                (rq[xA(0x6b1)] = 0xd),
                rq[xA(0x6f2)](),
                (rq[xA(0x6b1)] = 0x4),
                (rq[xA(0xfb)] = rY),
                rq[xA(0x787)]();
              for (let tS = 0x0; tS < 0x6; tS++) {
                const tT = (((tS + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rq[xA(0x92d)](tT, 0xa), rq[xA(0xbe4)](tT, 0x46);
              }
              rq[xA(0x6f2)](),
                rq[xA(0x20f)](),
                rq[xA(0xa26)](),
                rq[xA(0xb25)](0x0, s0),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x32, -0x14),
                rq[xA(0x2d2)](0x0, 0x8, 0x32, -0x12),
                (rq[xA(0xfb)] = rX),
                (rq[xA(0x6b1)] = 0xd),
                rq[xA(0x6f2)](),
                (rq[xA(0x6b1)] = 0x5),
                (rq[xA(0xfb)] = rY),
                rq[xA(0x787)]();
              for (let tU = 0x0; tU < 0x6; tU++) {
                let tV = (((tU + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rq[xA(0x92d)](tV, -0x14), rq[xA(0xbe4)](tV, 0x2);
              }
              rq[xA(0x6f2)](), rq[xA(0x20f)](), rq[xA(0x20f)]();
              const s3 = 0x1 - rv;
              (rq[xA(0x74e)] *= Math[xA(0x411)](0x0, (s3 - 0.3) / 0.7)),
                rq[xA(0x787)]();
              for (let tW = 0x0; tW < 0x2; tW++) {
                rq[xA(0xa26)](),
                  tW === 0x1 && rq[xA(0x6ff)](-0x1, 0x1),
                  rq[xA(0xb25)](
                    -0x33 + rv * (0xa + tW * 3.4) - tW * 3.4,
                    -0xf + rv * (0x5 - tW * 0x1)
                  ),
                  rq[xA(0x92d)](0xa, 0x0),
                  rq[xA(0x769)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rq[xA(0x20f)]();
              }
              rq[xA(0xb25)](0x0, 0x28),
                rq[xA(0x92d)](0x28 - rv * 0xa, -0xe + rv * 0x5),
                rq[xA(0x9f1)](
                  0x14,
                  0x14 - rv * 0xa,
                  -0x14,
                  0x14 - rv * 0xa,
                  -0x28 + rv * 0xa,
                  -0xe + rv * 0x5
                ),
                (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x2),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0xa7b)]:
              (rt = this[xA(0x58f)] / 0x14), rq[xA(0x6ff)](rt, rt);
              const s4 = rq[xA(0x74e)];
              (rq[xA(0xfb)] = rq[xA(0x716)] = this[xA(0x683)](xA(0x3a1))),
                (rq[xA(0x74e)] = 0.6 * s4),
                rq[xA(0x787)]();
              for (let tX = 0x0; tX < 0xa; tX++) {
                const tY = (tX / 0xa) * Math["PI"] * 0x2;
                rq[xA(0xa26)](),
                  rq[xA(0x710)](tY),
                  rq[xA(0xb25)](17.5, 0x0),
                  rq[xA(0x92d)](0x0, 0x0);
                const tZ = Math[xA(0x7f1)](tY + Date[xA(0x603)]() / 0x1f4);
                rq[xA(0x710)](tZ * 0.5),
                  rq[xA(0x2d2)](0x4, -0x2 * tZ, 0xe, 0x0),
                  rq[xA(0x20f)]();
              }
              (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 2.3),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x74e)] = 0.5 * s4),
                rq[xA(0x190)](),
                rq[xA(0x63f)](),
                (rq[xA(0x6b1)] = 0x3),
                rq[xA(0x6f2)](),
                (rq[xA(0x6b1)] = 1.2),
                (rq[xA(0x74e)] = 0.6 * s4),
                rq[xA(0x787)](),
                (rq[xA(0x625)] = xA(0xac6));
              for (let u0 = 0x0; u0 < 0x4; u0++) {
                rq[xA(0xa26)](),
                  rq[xA(0x710)]((u0 / 0x4) * Math["PI"] * 0x2),
                  rq[xA(0xb25)](0x4, 0x0),
                  rq[xA(0x92d)](0x0, -0x2),
                  rq[xA(0x9f1)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rq[xA(0x20f)]();
              }
              rq[xA(0x6f2)]();
              break;
            case cS[xA(0x243)]:
              this[xA(0x243)](rq);
              break;
            case cS[xA(0x956)]:
              this[xA(0x243)](rq, !![]);
              break;
            case cS[xA(0xbc6)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x32),
                (rq[xA(0x6b1)] = 0x19),
                (rq[xA(0x70b)] = xA(0xac6));
              const s5 = this[xA(0x6b5)]
                ? 0.6
                : (Date[xA(0x603)]() / 0x4b0) % 6.28;
              for (let u1 = 0x0; u1 < 0xa; u1++) {
                const u2 = 0x1 - u1 / 0xa,
                  u3 =
                    u2 *
                    0x50 *
                    (0x1 +
                      (Math[xA(0x7f1)](s5 * 0x3 + u1 * 0.5 + this[xA(0x9e3)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rq[xA(0x710)](s5),
                  (rq[xA(0xfb)] = this[xA(0x683)](lg[u1])),
                  rq[xA(0x77f)](-u3 / 0x2, -u3 / 0x2, u3, u3);
              }
              break;
            case cS[xA(0x352)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x12),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x19, -0xa),
                rq[xA(0x2d2)](0x0, -0x2, 0x19, -0xa),
                rq[xA(0x2d2)](0x1e, 0x0, 0x19, 0xa),
                rq[xA(0x2d2)](0x0, 0x2, -0x19, 0xa),
                rq[xA(0x2d2)](-0x1e, 0x0, -0x19, -0xa),
                rq[xA(0x8ef)](),
                (rq[xA(0x70b)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0x4),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x4c2))),
                rq[xA(0x6f2)](),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x7af))),
                rq[xA(0x190)](),
                rq[xA(0x63f)](),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x19, -0xa),
                rq[xA(0x2d2)](0x14, 0x0, 0x19, 0xa),
                rq[xA(0xbe4)](0x28, 0xa),
                rq[xA(0xbe4)](0x28, -0xa),
                (rq[xA(0x716)] = xA(0x322)),
                rq[xA(0x190)](),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x0, -0xa),
                rq[xA(0x2d2)](-0x5, 0x0, 0x0, 0xa),
                (rq[xA(0x6b1)] = 0xa),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x386))),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x49d)]:
              (rt = this[xA(0x58f)] / 0xc),
                rq[xA(0x6ff)](rt, rt),
                rq[xA(0x710)](-Math["PI"] / 0x6),
                rq[xA(0xb25)](-0xc, 0x0),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x5, 0x0),
                rq[xA(0xbe4)](0x0, 0x0),
                (rq[xA(0x6b1)] = 0x4),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x372))),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x0, 0x0),
                rq[xA(0x2d2)](0xa, -0x14, 0x1e, 0x0),
                rq[xA(0x2d2)](0xa, 0x14, 0x0, 0x0),
                (rq[xA(0x6b1)] = 0x6),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x367))),
                rq[xA(0x6f2)](),
                rq[xA(0x190)](),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x6, 0x0),
                rq[xA(0x2d2)](0xe, -0x2, 0x16, 0x0),
                (rq[xA(0x6b1)] = 3.5),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x7f3)]:
              rs(xA(0x7f3), xA(0x152), xA(0x662));
              break;
            case cS[xA(0x3e1)]:
              rs(xA(0x3e1), xA(0xc7e), xA(0x334));
              break;
            case cS[xA(0x65f)]:
              rs(xA(0x65f), xA(0x3a1), xA(0x10f));
              break;
            case cS[xA(0x2c5)]:
              rs(xA(0x2c5), xA(0x3a1), xA(0x10f));
              break;
            case cS[xA(0xfa)]:
              rs(xA(0x2c5), xA(0x15a), xA(0xdd0));
              break;
            case cS[xA(0xc24)]:
              const s6 = this[xA(0x6b5)] ? 0x3c : this[xA(0x58f)] * 0x2;
              rq[xA(0xb25)](-this[xA(0x58f)] - 0xa, 0x0),
                (rq[xA(0x70b)] = rq[xA(0x625)] = xA(0xac6)),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x0, 0x0),
                rq[xA(0xbe4)](s6, 0x0),
                (rq[xA(0x6b1)] = 0x6),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x769)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0xd5c))),
                rq[xA(0x190)](),
                rq[xA(0xb25)](s6, 0x0),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0xd, 0x0),
                rq[xA(0xbe4)](0x0, -3.5),
                rq[xA(0xbe4)](0x0, 3.5),
                rq[xA(0x8ef)](),
                (rq[xA(0xfb)] = rq[xA(0x716)]),
                rq[xA(0x190)](),
                (rq[xA(0x6b1)] = 0x3),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x55e)]:
              const s7 = this[xA(0x58f)] * 0x2,
                s8 = 0xa;
              rq[xA(0xb25)](-this[xA(0x58f)], 0x0),
                (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x2f4)] = xA(0x572)),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x0, 0x0),
                rq[xA(0xbe4)](-s8 * 1.8, 0x0),
                (rq[xA(0xfb)] = xA(0xa90)),
                (rq[xA(0x6b1)] = s8 * 1.4),
                rq[xA(0x6f2)](),
                (rq[xA(0xfb)] = xA(0xc10)),
                (rq[xA(0x6b1)] *= 0.7),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x0, 0x0),
                rq[xA(0xbe4)](-s8 * 0.45, 0x0),
                (rq[xA(0xfb)] = xA(0xa90)),
                (rq[xA(0x6b1)] = s8 * 0x2 + 3.5),
                rq[xA(0x6f2)](),
                (rq[xA(0xfb)] = xA(0x725)),
                (rq[xA(0x6b1)] = s8 * 0x2),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, s8, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x716)] = xA(0x9d9)),
                rq[xA(0x190)](),
                (rq[xA(0xfb)] = xA(0xb5c)),
                rq[xA(0x787)]();
              const s9 = (Date[xA(0x603)]() * 0.001) % 0x1,
                sa = s9 * s7,
                sb = s7 * 0.2;
              rq[xA(0x92d)](Math[xA(0x411)](sa - sb, 0x0), 0x0),
                rq[xA(0xbe4)](Math[xA(0xc0c)](sa + sb, s7), 0x0);
              const sc = Math[xA(0x7f1)](s9 * Math["PI"]);
              (rq[xA(0x161)] = s8 * 0x3 * sc),
                (rq[xA(0x6b1)] = s8),
                rq[xA(0x6f2)](),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x0, 0x0),
                rq[xA(0xbe4)](s7, 0x0),
                (rq[xA(0x6b1)] = s8),
                (rq[xA(0x161)] = s8),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0xd9d)]:
            case cS[xA(0x551)]:
            case cS[xA(0x413)]:
            case cS[xA(0x531)]:
            case cS[xA(0x453)]:
            case cS[xA(0x503)]:
              (rt = this[xA(0x58f)] / 0x23), rq[xA(0x5b0)](rt), rq[xA(0x787)]();
              this[xA(0x511)] !== cS[xA(0x551)] &&
              this[xA(0x511)] !== cS[xA(0x453)]
                ? rq[xA(0xadb)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, l0)
                : rq[xA(0x769)](0x0, 0x0, 0x23, 0x0, l0);
              (ru = lr[this[xA(0x511)]] || [xA(0x4f0), xA(0x941)]),
                (rq[xA(0x716)] = this[xA(0x683)](ru[0x0])),
                rq[xA(0x190)](),
                (rq[xA(0xfb)] = this[xA(0x683)](ru[0x1])),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x645)]:
              (rq[xA(0x6b1)] = 0x4),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xb12)),
                rs(xA(0x645), xA(0x989), xA(0x663));
              break;
            case cS[xA(0x659)]:
              rs(xA(0x659), xA(0x3a1), xA(0x10f));
              break;
            case cS[xA(0x63e)]:
              (rt = this[xA(0x58f)] / 0x14), rq[xA(0x6ff)](rt, rt);
              !this[xA(0x6b5)] && rq[xA(0x710)]((pz / 0x64) % 6.28);
              rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rq[xA(0x2d2)](0x0, 0xc, 0x14, 0x0),
                rq[xA(0x8ef)](),
                (rq[xA(0x70b)] = rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] *= 0.7),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x3a1))),
                rq[xA(0x190)](),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x10f))),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x9e0)]:
              (rq[xA(0x6b1)] *= 0.7),
                rs(xA(0x9e0), xA(0xb99), xA(0xc85)),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0.6, 0x0, l0),
                (rq[xA(0x716)] = xA(0x5a2)),
                rq[xA(0x190)]();
              break;
            case cS[xA(0x2d5)]:
              (rq[xA(0x6b1)] *= 0.8), rs(xA(0x2d5), xA(0xd12), xA(0x2b4));
              break;
            case cS[xA(0x3ba)]:
              (rt = this[xA(0x58f)] / 0xa), rq[xA(0x6ff)](rt, rt);
              if (!this[xA(0x722)] || pz - this[xA(0x253)] > 0x14) {
                this[xA(0x253)] = pz;
                const u4 = new Path2D();
                for (let u5 = 0x0; u5 < 0xa; u5++) {
                  const u6 = (Math[xA(0xb03)]() * 0x2 - 0x1) * 0x7,
                    u7 = (Math[xA(0xb03)]() * 0x2 - 0x1) * 0x7;
                  u4[xA(0x92d)](u6, u7), u4[xA(0x769)](u6, u7, 0x5, 0x0, l0);
                }
                this[xA(0x722)] = u4;
              }
              (rq[xA(0x716)] = this[xA(0x683)](xA(0x12e))),
                rq[xA(0x190)](this[xA(0x722)]);
              break;
            case cS[xA(0x70e)]:
            case cS[xA(0x2aa)]:
              (rt = this[xA(0x58f)] / 0x1e),
                rq[xA(0x6ff)](rt, rt),
                rq[xA(0x787)]();
              const sd = 0x1 / 0x3;
              for (let u8 = 0x0; u8 < 0x3; u8++) {
                const u9 = (u8 / 0x3) * Math["PI"] * 0x2;
                rq[xA(0x92d)](0x0, 0x0),
                  rq[xA(0x769)](0x0, 0x0, 0x1e, u9, u9 + Math["PI"] / 0x3);
              }
              (rq[xA(0x625)] = xA(0xac6)),
                (rq[xA(0x6b1)] = 0xa),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x716)] = this[xA(0x683)](
                  this[xA(0x511)] === cS[xA(0x70e)] ? xA(0x910) : xA(0xbf4)
                )),
                rq[xA(0x190)](),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0xc73)]:
              rr(xA(0xd4a), xA(0xc0a));
              break;
            case cS[xA(0x1ac)]:
              rr(xA(0x281), xA(0xf2));
              break;
            case cS[xA(0xc41)]:
            case cS[xA(0x874)]:
              rr(xA(0x3a1), xA(0x10f));
              break;
            case cS[xA(0x8ed)]:
              (rt = this[xA(0x58f)] / 0x14),
                rq[xA(0x6ff)](rt, rt),
                rq[xA(0x710)](-Math["PI"] / 0x4);
              const se = rq[xA(0x6b1)];
              (rq[xA(0x6b1)] *= 1.5),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x14, -0x14 - se),
                rq[xA(0xbe4)](-0x14, 0x0),
                rq[xA(0xbe4)](0x14, 0x0),
                rq[xA(0xbe4)](0x14, 0x14 + se),
                rq[xA(0x710)](Math["PI"] / 0x2),
                rq[xA(0x92d)](-0x14, -0x14 - se),
                rq[xA(0xbe4)](-0x14, 0x0),
                rq[xA(0xbe4)](0x14, 0x0),
                rq[xA(0xbe4)](0x14, 0x14 + se),
                (rq[xA(0x625)] = rq[xA(0x625)] = xA(0xb12)),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0xaec)]:
              rr(xA(0x583), xA(0x27c));
              break;
            case cS[xA(0x135)]:
              rr(xA(0xcba), xA(0x49e));
              break;
            case cS[xA(0x85d)]:
              rr(xA(0x25d), xA(0x346));
              break;
            case cS[xA(0xa62)]:
              (rt = this[xA(0x58f)] / 0x14),
                rq[xA(0x6ff)](rt, rt),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0x14, 0x0, l0),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0xaf3))),
                rq[xA(0x190)](),
                rq[xA(0x63f)](),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xd5c))),
                rq[xA(0x6f2)](),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x466))),
                rq[xA(0x190)]();
              break;
            case cS[xA(0x621)]:
              (rt = this[xA(0x58f)] / 0x14), rq[xA(0x6ff)](rt, rt);
              const sf = (ua, ub, uc = ![]) => {
                  const xE = xA;
                  (rq[xE(0x625)] = xE(0xac6)),
                    (rq[xE(0xfb)] = this[xE(0x683)](ub)),
                    (rq[xE(0x716)] = this[xE(0x683)](ua)),
                    rq[xE(0x787)](),
                    rq[xE(0x769)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rq[xE(0x6f2)](),
                    rq[xE(0x190)]();
                },
                sg = (ua, ub) => {
                  const xF = xA;
                  rq[xF(0xa26)](),
                    rq[xF(0x63f)](),
                    (rq[xF(0x625)] = xF(0xac6)),
                    (rq[xF(0x716)] = this[xF(0x683)](ua)),
                    (rq[xF(0xfb)] = this[xF(0x683)](ub)),
                    rq[xF(0x190)](),
                    rq[xF(0x6f2)](),
                    rq[xF(0x20f)]();
                };
              (rq[xA(0x625)] = xA(0xac6)),
                rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                sg(xA(0xaf3), xA(0xd5c)),
                rq[xA(0x710)](Math["PI"]),
                rq[xA(0x787)](),
                rq[xA(0x769)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rq[xA(0x769)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rq[xA(0x769)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                sg(xA(0x3a1), xA(0x10f)),
                rq[xA(0x710)](-Math["PI"]),
                rq[xA(0x787)](),
                rq[xA(0x769)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                sg(xA(0xaf3), xA(0xd5c));
              break;
            case cS[xA(0x50b)]:
              this[xA(0x5af)](rq, this[xA(0x58f)]);
              break;
            case cS[xA(0x268)]:
              (rt = this[xA(0x58f)] / 0x28),
                rq[xA(0x6ff)](rt, rt),
                rq[xA(0x787)](),
                rq[xA(0x92d)](-0x1e, -0x1e),
                rq[xA(0xbe4)](0x14, 0x0),
                rq[xA(0xbe4)](-0x1e, 0x1e),
                rq[xA(0x8ef)](),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xaf3))),
                (rq[xA(0x716)] = this[xA(0x683)](xA(0x997))),
                rq[xA(0x190)](),
                (rq[xA(0x6b1)] = 0x16),
                (rq[xA(0x625)] = rq[xA(0x70b)] = xA(0xac6)),
                rq[xA(0x6f2)]();
              break;
            case cS[xA(0x7e1)]:
              rq[xA(0x5b0)](this[xA(0x58f)] / 0x41),
                rq[xA(0xb25)](-0xa, 0xa),
                (rq[xA(0x70b)] = rq[xA(0x625)] = xA(0xac6)),
                rq[xA(0xa26)](),
                rq[xA(0x787)](),
                rq[xA(0x92d)](0x1e, 0x0),
                rq[xA(0xb25)](
                  0x46 -
                    (Math[xA(0x7f1)](
                      Date[xA(0x603)]() / 0x190 + 0.8 * this[xA(0x9e3)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rq[xA(0xbe4)](0x0, 0x0),
                (rq[xA(0x6b1)] = 0x2a),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0xb78))),
                rq[xA(0x6f2)](),
                (rq[xA(0xfb)] = this[xA(0x683)](xA(0x97f))),
                (rq[xA(0x6b1)] -= 0xc),
                rq[xA(0x6f2)](),
                rq[xA(0x787)]();
              for (let ua = 0x0; ua < 0x2; ua++) {
                rq[xA(0x92d)](0x9, 0x7),
                  rq[xA(0xbe4)](0x28, 0x14),
                  rq[xA(0xbe4)](0x7, 0x9),
                  rq[xA(0xbe4)](0x9, 0x7),
                  rq[xA(0x6ff)](0x1, -0x1);
              }
              (rq[xA(0x6b1)] = 0x3),
                (rq[xA(0x716)] = rq[xA(0xfb)] = xA(0x69c)),
                rq[xA(0x6f2)](),
                rq[xA(0x190)](),
                rq[xA(0x20f)](),
                this[xA(0xbd2)](rq);
              break;
            case cS[xA(0xc15)]:
              (rt = this[xA(0x58f)] / 0x14), rq[xA(0x6ff)](rt, rt);
              const sh = (ub = 0x1, uc, ud) => {
                const xG = xA;
                rq[xG(0xa26)](),
                  rq[xG(0x6ff)](0x1, ub),
                  rq[xG(0x787)](),
                  rq[xG(0xcae)](-0x64, 0x0, 0x12c, -0x12c),
                  rq[xG(0x63f)](),
                  rq[xG(0x787)](),
                  rq[xG(0x92d)](-0x14, 0x0),
                  rq[xG(0x2d2)](-0x12, -0x19, 0x11, -0xf),
                  (rq[xG(0x625)] = xG(0xac6)),
                  (rq[xG(0x6b1)] = 0x16),
                  (rq[xG(0xfb)] = this[xG(0x683)](ud)),
                  rq[xG(0x6f2)](),
                  (rq[xG(0x6b1)] = 0xe),
                  (rq[xG(0xfb)] = this[xG(0x683)](uc)),
                  rq[xG(0x6f2)](),
                  rq[xG(0x20f)]();
              };
              sh(0x1, xA(0x1f5), xA(0x913)), sh(-0x1, xA(0xbcf), xA(0x13c));
              break;
            default:
              rq[xA(0x787)](),
                rq[xA(0x769)](0x0, 0x0, this[xA(0x58f)], 0x0, Math["PI"] * 0x2),
                (rq[xA(0x716)] = xA(0x79a)),
                rq[xA(0x190)](),
                pt(rq, this[xA(0x85a)], 0x14, xA(0xb5c), 0x3);
          }
          rq[xA(0x20f)](), (this[xA(0x3ef)] = null);
        }
        [uf(0x3fe)](rq, rr) {
          const xH = uf;
          rr = rr || pz / 0x12c + this[xH(0x9e3)] * 0.3;
          const rs = Math[xH(0x7f1)](rr) * 0.5 + 0.5;
          rq[xH(0x625)] = xH(0xac6);
          const rt = 0x4;
          for (let ru = 0x0; ru < 0x2; ru++) {
            rq[xH(0xa26)]();
            if (ru === 0x0) rq[xH(0x787)]();
            for (let rv = 0x0; rv < 0x2; rv++) {
              for (let rw = 0x0; rw < rt; rw++) {
                rq[xH(0xa26)](), ru > 0x0 && rq[xH(0x787)]();
                const rx = -0.19 - (rw / rt) * Math["PI"] * 0.25;
                rq[xH(0x710)](rx + rs * 0.05), rq[xH(0x92d)](0x0, 0x0);
                const ry = Math[xH(0x7f1)](rr + rw);
                rq[xH(0xb25)](0x1c - (ry * 0.5 + 0.5), 0x0),
                  rq[xH(0x710)](ry * 0.08),
                  rq[xH(0xbe4)](0x0, 0x0),
                  rq[xH(0x2d2)](0x0, 0x7, 5.5, 0xe),
                  ru > 0x0 &&
                    ((rq[xH(0x6b1)] = 6.5),
                    (rq[xH(0xfb)] =
                      xH(0x6ab) + (0x2f + (rw / rt) * 0x14) + "%)"),
                    rq[xH(0x6f2)]()),
                  rq[xH(0x20f)]();
              }
              rq[xH(0x6ff)](-0x1, 0x1);
            }
            ru === 0x0 &&
              ((rq[xH(0x6b1)] = 0x9),
              (rq[xH(0xfb)] = xH(0x313)),
              rq[xH(0x6f2)]()),
              rq[xH(0x20f)]();
          }
          rq[xH(0x787)](),
            rq[xH(0xadb)](
              0x0,
              -0x1e + Math[xH(0x7f1)](rr * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xH(0xfb)] = xH(0x313)),
            (rq[xH(0x6b1)] = 5.5),
            rq[xH(0x6f2)](),
            (rq[xH(0x161)] = 0x5 + rs * 0x8),
            (rq[xH(0x2f4)] = xH(0x128)),
            (rq[xH(0xfb)] = rq[xH(0x2f4)]),
            (rq[xH(0x6b1)] = 3.5),
            rq[xH(0x6f2)](),
            (rq[xH(0x161)] = 0x0);
        }
        [uf(0xd96)](rq) {
          const xI = uf,
            rr = this[xI(0x2e3)] ? ll[xI(0x7b0)] : ll[xI(0x2ac)],
            rs = Date[xI(0x603)]() / 0x1f4 + this[xI(0x9e3)],
            rt = Math[xI(0x7f1)](rs) - 0.5;
          rq[xI(0x625)] = rq[xI(0x70b)] = xI(0xac6);
          const ru = 0x46;
          rq[xI(0xa26)](), rq[xI(0x787)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            rq[xI(0xa26)]();
            const rw = rv * 0x2 - 0x1;
            rq[xI(0x6ff)](0x1, rw),
              rq[xI(0xb25)](0x14, ru),
              rq[xI(0x710)](rt * 0.1),
              rq[xI(0x92d)](0x0, 0x0),
              rq[xI(0xbe4)](-0xa, 0x32),
              rq[xI(0x2d2)](0x32, 0x32, 0x64, 0x1e),
              rq[xI(0x2d2)](0x32, 0x32, 0x64, 0x1e),
              rq[xI(0x2d2)](0x1e, 0x8c, -0x50, 0x78 - rt * 0x14),
              rq[xI(0x2d2)](
                -0xa + rt * 0xf,
                0x6e - rt * 0xa,
                -0x28,
                0x50 - rt * 0xa
              ),
              rq[xI(0x2d2)](
                -0xa + rt * 0xa,
                0x3c + rt * 0x5,
                -0x3c,
                0x32 - Math[xI(0x411)](0x0, rt) * 0xa
              ),
              rq[xI(0x2d2)](-0xa, 0x14 - rt * 0xa, -0x46, rt * 0xa),
              rq[xI(0x20f)]();
          }
          (rq[xI(0x716)] = this[xI(0x683)](rr[xI(0xa49)])),
            rq[xI(0x190)](),
            (rq[xI(0x6b1)] = 0x12),
            (rq[xI(0xfb)] = xI(0xd1d)),
            rq[xI(0x63f)](),
            rq[xI(0x6f2)](),
            rq[xI(0x20f)](),
            rq[xI(0xa26)](),
            rq[xI(0xb25)](0x50, 0x0),
            rq[xI(0x6ff)](0x2, 0x2),
            rq[xI(0x787)]();
          for (let rx = 0x0; rx < 0x2; rx++) {
            rq[xI(0x6ff)](0x1, -0x1),
              rq[xI(0xa26)](),
              rq[xI(0xb25)](0x0, 0xf),
              rq[xI(0x710)]((Math[xI(0x7f1)](rs * 0x2) * 0.5 + 0.5) * 0.08),
              rq[xI(0x92d)](0x0, -0x4),
              rq[xI(0x2d2)](0xa, 0x0, 0x14, -0x6),
              rq[xI(0x2d2)](0xf, 0x3, 0x0, 0x5),
              rq[xI(0x20f)]();
          }
          (rq[xI(0x716)] = rq[xI(0xfb)] = xI(0x69c)),
            rq[xI(0x190)](),
            (rq[xI(0x6b1)] = 0x6),
            rq[xI(0x6f2)](),
            rq[xI(0x20f)]();
          for (let ry = 0x0; ry < 0x2; ry++) {
            const rz = ry === 0x0;
            rz && rq[xI(0x787)]();
            for (let rA = 0x4; rA >= 0x0; rA--) {
              const rB = rA / 0x5,
                rC = 0x32 - 0x2d * rB;
              !rz && rq[xI(0x787)](),
                rq[xI(0xcae)](
                  -0x50 - rB * 0x50 - rC / 0x2,
                  -rC / 0x2 +
                    Math[xI(0x7f1)](rB * Math["PI"] * 0x2 + rs * 0x3) *
                      0x8 *
                      rB,
                  rC,
                  rC
                ),
                !rz &&
                  ((rq[xI(0x6b1)] = 0x14),
                  (rq[xI(0x716)] = rq[xI(0xfb)] =
                    this[xI(0x683)](rr[xI(0x1bc)][rA])),
                  rq[xI(0x6f2)](),
                  rq[xI(0x190)]());
            }
            rz &&
              ((rq[xI(0x6b1)] = 0x22),
              (rq[xI(0xfb)] = this[xI(0x683)](rr[xI(0xc6d)])),
              rq[xI(0x6f2)]());
          }
          rq[xI(0x787)](),
            rq[xI(0x769)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xI(0x716)] = this[xI(0x683)](rr[xI(0x53e)])),
            rq[xI(0x190)](),
            (rq[xI(0x6b1)] = 0x24),
            (rq[xI(0xfb)] = xI(0x398)),
            rq[xI(0xa26)](),
            rq[xI(0x63f)](),
            rq[xI(0x6f2)](),
            rq[xI(0x20f)](),
            rq[xI(0xa26)]();
          for (let rD = 0x0; rD < 0x2; rD++) {
            rq[xI(0x787)]();
            for (let rE = 0x0; rE < 0x2; rE++) {
              rq[xI(0xa26)]();
              const rF = rE * 0x2 - 0x1;
              rq[xI(0x6ff)](0x1, rF),
                rq[xI(0xb25)](0x14, ru),
                rq[xI(0x710)](rt * 0.1),
                rq[xI(0x92d)](0x0, 0xa),
                rq[xI(0xbe4)](-0xa, 0x32),
                rq[xI(0x2d2)](0x32, 0x32, 0x64, 0x1e),
                rq[xI(0x2d2)](0x32, 0x32, 0x64, 0x1e),
                rq[xI(0x2d2)](0x1e, 0x8c, -0x50, 0x78 - rt * 0x14),
                rq[xI(0x92d)](0x64, 0x1e),
                rq[xI(0x2d2)](0x23, 0x5a, -0x28, 0x50 - rt * 0xa),
                rq[xI(0x92d)](-0xa, 0x32),
                rq[xI(0x2d2)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[xI(0x411)](0x0, rt) * 0xa
                ),
                rq[xI(0x20f)]();
            }
            rD === 0x0
              ? ((rq[xI(0x6b1)] = 0x10),
                (rq[xI(0xfb)] = this[xI(0x683)](rr[xI(0xceb)])))
              : ((rq[xI(0x6b1)] = 0xa),
                (rq[xI(0xfb)] = this[xI(0x683)](rr[xI(0x13b)]))),
              rq[xI(0x6f2)]();
          }
          rq[xI(0x20f)]();
        }
        [uf(0x9fd)](rq, rr, rs, rt) {
          const xJ = uf;
          rq[xJ(0xa26)]();
          const ru = this[xJ(0x58f)] / 0x28;
          rq[xJ(0x6ff)](ru, ru),
            (rr = this[xJ(0x683)](rr)),
            (rs = this[xJ(0x683)](rs)),
            (rt = this[xJ(0x683)](rt));
          const rv = Math["PI"] / 0x5;
          rq[xJ(0x625)] = rq[xJ(0x70b)] = xJ(0xac6);
          const rw = Math[xJ(0x7f1)](
              Date[xJ(0x603)]() / 0x12c + this[xJ(0x9e3)] * 0.2
            ),
            rx = rw * 0.3 + 0.7;
          rq[xJ(0x787)](),
            rq[xJ(0x769)](0x16, 0x0, 0x17, 0x0, l0),
            rq[xJ(0x92d)](0x0, 0x0),
            rq[xJ(0x769)](-0x5, 0x0, 0x21, 0x0, l0),
            (rq[xJ(0x716)] = this[xJ(0x683)](xJ(0xdb0))),
            rq[xJ(0x190)](),
            rq[xJ(0xa26)](),
            rq[xJ(0xb25)](0x12, 0x0);
          for (let rA = 0x0; rA < 0x2; rA++) {
            rq[xJ(0xa26)](),
              rq[xJ(0x6ff)](0x1, rA * 0x2 - 0x1),
              rq[xJ(0x710)](Math["PI"] * 0.08 * rx),
              rq[xJ(0xb25)](-0x12, 0x0),
              rq[xJ(0x787)](),
              rq[xJ(0x769)](0x0, 0x0, 0x28, Math["PI"], -rv),
              rq[xJ(0x2d2)](0x14 - rx * 0x3, -0xf, 0x14, 0x0),
              rq[xJ(0x8ef)](),
              (rq[xJ(0x716)] = rr),
              rq[xJ(0x190)]();
            const rB = xJ(0x848) + rA;
            if (!this[rB]) {
              const rC = new Path2D();
              for (let rD = 0x0; rD < 0x2; rD++) {
                const rE = (Math[xJ(0xb03)]() * 0x2 - 0x1) * 0x28,
                  rF = Math[xJ(0xb03)]() * -0x28,
                  rG = Math[xJ(0xb03)]() * 0x9 + 0x8;
                rC[xJ(0x92d)](rE, rF), rC[xJ(0x769)](rE, rF, rG, 0x0, l0);
              }
              this[rB] = rC;
            }
            rq[xJ(0x63f)](),
              (rq[xJ(0x716)] = rt),
              rq[xJ(0x190)](this[rB]),
              rq[xJ(0x20f)](),
              (rq[xJ(0x6b1)] = 0x7),
              (rq[xJ(0xfb)] = rs),
              rq[xJ(0x6f2)]();
          }
          rq[xJ(0x20f)](), rq[xJ(0xa26)]();
          let ry = 0x9;
          rq[xJ(0xb25)](0x2a, 0x0);
          const rz = Math["PI"] * 0x3 - rw;
          rq[xJ(0x787)]();
          for (let rH = 0x0; rH < 0x2; rH++) {
            let rI = 0x0,
              rJ = 0x8;
            rq[xJ(0x92d)](rI, rJ);
            for (let rK = 0x0; rK < ry; rK++) {
              const rL = rK / ry,
                rM = rL * rz,
                rN = 0xf * (0x1 - rL),
                rO = Math[xJ(0xa87)](rM) * rN,
                rP = Math[xJ(0x7f1)](rM) * rN,
                rQ = rI + rO,
                rR = rJ + rP;
              rq[xJ(0x2d2)](
                rI + rO * 0.5 + rP * 0.25,
                rJ + rP * 0.5 - rO * 0.25,
                rQ,
                rR
              ),
                (rI = rQ),
                (rJ = rR);
            }
            rq[xJ(0x6ff)](0x1, -0x1);
          }
          (rq[xJ(0x625)] = rq[xJ(0x70b)] = xJ(0xac6)),
            (rq[xJ(0x6b1)] = 0x2),
            (rq[xJ(0xfb)] = rq[xJ(0x716)]),
            rq[xJ(0x6f2)](),
            rq[xJ(0x20f)](),
            rq[xJ(0x20f)]();
        }
        [uf(0x38c)](rq, rr = 0x64, rs = 0x50, rt = 0x12, ru = 0x8) {
          const xK = uf;
          rq[xK(0x787)]();
          const rv = (0x1 / rt) * Math["PI"] * 0x2;
          rq[xK(0x92d)](rs, 0x0);
          for (let rw = 0x0; rw < rt; rw++) {
            const rx = rw * rv,
              ry = (rw + 0x1) * rv;
            rq[xK(0x9f1)](
              Math[xK(0xa87)](rx) * rr,
              Math[xK(0x7f1)](rx) * rr,
              Math[xK(0xa87)](ry) * rr,
              Math[xK(0x7f1)](ry) * rr,
              Math[xK(0xa87)](ry) * rs,
              Math[xK(0x7f1)](ry) * rs
            );
          }
          (rq[xK(0x716)] = this[xK(0x683)](xK(0x5a1))),
            rq[xK(0x190)](),
            (rq[xK(0x6b1)] = ru),
            (rq[xK(0x625)] = rq[xK(0x70b)] = xK(0xac6)),
            (rq[xK(0xfb)] = this[xK(0x683)](xK(0x667))),
            rq[xK(0x6f2)]();
        }
        [uf(0x683)](rq) {
          const xL = uf,
            rr = 0x1 - this[xL(0x828)];
          if (
            rr >= 0x1 &&
            this[xL(0x748)] === 0x0 &&
            !this[xL(0x4a9)] &&
            !this[xL(0x26e)]
          )
            return rq;
          rq = hA(rq);
          this[xL(0x4a9)] &&
            (rq = hy(
              rq,
              [0xff, 0xff, 0xff],
              0.85 + Math[xL(0x7f1)](pz / 0x32) * 0.15
            ));
          this[xL(0x748)] > 0x0 &&
            (rq = hy(rq, [0x8f, 0x5d, 0xb0], 0x1 - this[xL(0x748)] * 0.75));
          rq = hy(rq, [0xff, 0x0, 0x0], rr * 0.25 + 0.75);
          if (this[xL(0x26e)]) {
            if (!this[xL(0x3ef)]) {
              let rs = pz / 0x4;
              if (!isNaN(this["id"])) rs += this["id"];
              this[xL(0x3ef)] = lH(rs % 0x168, 0x64, 0x32);
            }
            rq = hy(rq, this[xL(0x3ef)], 0.75);
          }
          return pL(rq);
        }
        [uf(0x727)](rq) {
          const xM = uf;
          this[xM(0x3ef)] = null;
          if (this[xM(0x3d9)]) {
            const rr = Math[xM(0x7f1)]((this[xM(0xd72)] * Math["PI"]) / 0x2);
            if (!this[xM(0x44f)]) {
              const rs = 0x1 + rr * 0x1;
              rq[xM(0x6ff)](rs, rs);
            }
            rq[xM(0x74e)] *= 0x1 - rr;
          }
        }
        [uf(0xcf9)](rq, rr = !![], rs = 0x1) {
          const xN = uf;
          rq[xN(0x787)](),
            (rs = 0x8 * rs),
            rq[xN(0x92d)](0x23, -rs),
            rq[xN(0x2d2)](0x33, -0x2 - rs, 0x3c, -0xc - rs),
            rq[xN(0xbe4)](0x23, -rs),
            rq[xN(0x92d)](0x23, rs),
            rq[xN(0x2d2)](0x33, 0x2 + rs, 0x3c, 0xc + rs),
            rq[xN(0xbe4)](0x23, rs);
          const rt = xN(0xaf3);
          (rq[xN(0x716)] = rq[xN(0xfb)] = rr ? this[xN(0x683)](rt) : xN(0xaf3)),
            rq[xN(0x190)](),
            (rq[xN(0x625)] = rq[xN(0x70b)] = xN(0xac6)),
            (rq[xN(0x6b1)] = 0x4),
            rq[xN(0x6f2)]();
        }
        [uf(0x5af)](rq, rr, rs = 0x1) {
          const xO = uf,
            rt = (rr / 0x1e) * 1.1;
          rq[xO(0x6ff)](rt, rt),
            rq[xO(0x787)](),
            rq[xO(0x92d)](-0x1e, -0x11),
            rq[xO(0xbe4)](0x1e, 0x0),
            rq[xO(0xbe4)](-0x1e, 0x11),
            rq[xO(0x8ef)](),
            (rq[xO(0x716)] = rq[xO(0xfb)] = this[xO(0x683)](xO(0xaf3))),
            rq[xO(0x190)](),
            (rq[xO(0x6b1)] = 0x14 * rs),
            (rq[xO(0x625)] = rq[xO(0x70b)] = xO(0xac6)),
            rq[xO(0x6f2)]();
        }
        [uf(0xa82)](rq, rr = 0x0, rs = 0x0, rt = 0x1, ru = 0x5) {
          const xP = uf;
          rq[xP(0xa26)](),
            rq[xP(0xb25)](rr, rs),
            rq[xP(0x6ff)](rt, rt),
            rq[xP(0x787)](),
            rq[xP(0x92d)](0x23, -0x8),
            rq[xP(0x2d2)](0x34, -5.5, 0x3c, -0x14),
            rq[xP(0x92d)](0x23, 0x8),
            rq[xP(0x2d2)](0x34, 5.5, 0x3c, 0x14),
            (rq[xP(0x716)] = rq[xP(0xfb)] = this[xP(0x683)](xP(0xaf3))),
            (rq[xP(0x625)] = rq[xP(0x70b)] = xP(0xac6)),
            (rq[xP(0x6b1)] = ru),
            rq[xP(0x6f2)](),
            rq[xP(0x787)]();
          const rv = Math["PI"] * 0.165;
          rq[xP(0xadb)](0x3c, -0x14, 0x7, 0x9, rv, 0x0, l0),
            rq[xP(0xadb)](0x3c, 0x14, 0x7, 0x9, -rv, 0x0, l0),
            rq[xP(0x190)](),
            rq[xP(0x20f)]();
        }
      },
      lH = (rq, rr, rs) => {
        const xQ = uf;
        (rr /= 0x64), (rs /= 0x64);
        const rt = (rw) => (rw + rq / 0x1e) % 0xc,
          ru = rr * Math[xQ(0xc0c)](rs, 0x1 - rs),
          rv = (rw) =>
            rs -
            ru *
              Math[xQ(0x411)](
                -0x1,
                Math[xQ(0xc0c)](
                  rt(rw) - 0x3,
                  Math[xQ(0xc0c)](0x9 - rt(rw), 0x1)
                )
              );
        return [0xff * rv(0x0), 0xff * rv(0x8), 0xff * rv(0x4)];
      };
    function lI(rq) {
      const xR = uf;
      return -(Math[xR(0xa87)](Math["PI"] * rq) - 0x1) / 0x2;
    }
    function lJ(rq, rr, rs = 0x6, rt = uf(0xb5c)) {
      const xS = uf,
        ru = rr / 0x64;
      rq[xS(0x6ff)](ru, ru), rq[xS(0x787)]();
      for (let rv = 0x0; rv < 0xc; rv++) {
        rq[xS(0x92d)](0x0, 0x0);
        const rw = (rv / 0xc) * Math["PI"] * 0x2;
        rq[xS(0xbe4)](Math[xS(0xa87)](rw) * 0x64, Math[xS(0x7f1)](rw) * 0x64);
      }
      (rq[xS(0x6b1)] = rs),
        (rq[xS(0x716)] = rq[xS(0xfb)] = rt),
        (rq[xS(0x625)] = rq[xS(0x70b)] = xS(0xac6));
      for (let rx = 0x0; rx < 0x5; rx++) {
        const ry = (rx / 0x5) * 0x64 + 0xa;
        lb(rq, 0xc, ry, 0.5, 0.85);
      }
      rq[xS(0x6f2)]();
    }
    var lK = class {
        constructor(rq, rr, rs, rt, ru) {
          const xT = uf;
          (this[xT(0x511)] = rq),
            (this["id"] = rr),
            (this["x"] = rs),
            (this["y"] = rt),
            (this[xT(0x58f)] = ru),
            (this[xT(0x903)] = Math[xT(0xb03)]() * l0),
            (this[xT(0x924)] = -0x1),
            (this[xT(0x3d9)] = ![]),
            (this[xT(0xc18)] = 0x0),
            (this[xT(0xd72)] = 0x0),
            (this[xT(0xd5a)] = !![]),
            (this[xT(0x2f6)] = 0x0),
            (this[xT(0xd19)] = !![]);
        }
        [uf(0x8ee)]() {
          const xU = uf;
          if (this[xU(0xc18)] < 0x1) {
            this[xU(0xc18)] += pA / 0xc8;
            if (this[xU(0xc18)] > 0x1) this[xU(0xc18)] = 0x1;
          }
          this[xU(0x3d9)] && (this[xU(0xd72)] += pA / 0xc8);
        }
        [uf(0x7e5)](rq) {
          const xV = uf;
          rq[xV(0xa26)](), rq[xV(0xb25)](this["x"], this["y"]);
          if (this[xV(0x511)] === cS[xV(0xcf0)]) {
            rq[xV(0x710)](this[xV(0x903)]);
            const rr = this[xV(0x58f)],
              rs = pq(
                rq,
                xV(0x41d) + this[xV(0x58f)],
                rr * 2.2,
                rr * 2.2,
                (ru) => {
                  const xW = xV;
                  ru[xW(0xb25)](rr * 1.1, rr * 1.1), lJ(ru, rr);
                },
                !![]
              ),
              rt = this[xV(0xc18)] + this[xV(0xd72)] * 0.5;
            (rq[xV(0x74e)] = (0x1 - this[xV(0xd72)]) * 0.3),
              rq[xV(0x6ff)](rt, rt),
              rq[xV(0x6c0)](
                rs,
                -rs[xV(0xa98)] / 0x2,
                -rs[xV(0xd3c)] / 0x2,
                rs[xV(0xa98)],
                rs[xV(0xd3c)]
              );
          } else {
            if (this[xV(0x511)] === cS[xV(0x86c)]) {
              let ru = this[xV(0xc18)] + this[xV(0xd72)] * 0.5;
              (rq[xV(0x74e)] = 0x1 - this[xV(0xd72)]), (rq[xV(0x74e)] *= 0.9);
              const rv =
                0.93 +
                0.07 *
                  (Math[xV(0x7f1)](
                    Date[xV(0x603)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              ru *= rv;
              const rw = this[xV(0x58f)],
                rx = pq(
                  rq,
                  xV(0x610) + this[xV(0x58f)],
                  rw * 2.2,
                  rw * 2.2,
                  (ry) => {
                    const xX = xV;
                    ry[xX(0xb25)](rw * 1.1, rw * 1.1);
                    const rz = rw / 0x64;
                    ry[xX(0x6ff)](rz, rz),
                      lE(ry, 0x5c),
                      (ry[xX(0x70b)] = ry[xX(0x625)] = xX(0xac6)),
                      (ry[xX(0x6b1)] = 0x28),
                      (ry[xX(0xfb)] = xX(0x396)),
                      ry[xX(0x6f2)](),
                      (ry[xX(0x716)] = xX(0x2e0)),
                      (ry[xX(0xfb)] = xX(0x590)),
                      (ry[xX(0x6b1)] = 0xe),
                      ry[xX(0x190)](),
                      ry[xX(0x6f2)]();
                  },
                  !![]
                );
              rq[xV(0x6ff)](ru, ru),
                rq[xV(0x6c0)](
                  rx,
                  -rx[xV(0xa98)] / 0x2,
                  -rx[xV(0xd3c)] / 0x2,
                  rx[xV(0xa98)],
                  rx[xV(0xd3c)]
                );
            } else {
              if (this[xV(0x511)] === cS[xV(0x790)]) {
                rq[xV(0x5b0)](this[xV(0x58f)] / 0x32),
                  (rq[xV(0x70b)] = xV(0xac6)),
                  rq[xV(0xa26)](),
                  (this[xV(0x2f6)] +=
                    ((this[xV(0x924)] >= 0x0 ? 0x1 : -0x1) * pA) / 0x12c),
                  (this[xV(0x2f6)] = Math[xV(0xc0c)](
                    0x1,
                    Math[xV(0x411)](0x0, this[xV(0x2f6)])
                  ));
                if (this[xV(0x2f6)] > 0x0) {
                  rq[xV(0x5b0)](this[xV(0x2f6)]),
                    (rq[xV(0x74e)] *= this[xV(0x2f6)]),
                    (rq[xV(0x6b1)] = 0.1),
                    (rq[xV(0xfb)] = rq[xV(0x716)] = xV(0x39e)),
                    (rq[xV(0x1d9)] = xV(0x89a)),
                    (rq[xV(0x433)] = xV(0x717) + iA);
                  const rz = xV(0xb5d) + (this[xV(0x924)] + 0x1);
                  lR(
                    rq,
                    rz,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rz[xV(0xbc8)] * 0.09),
                    !![]
                  );
                }
                rq[xV(0x20f)]();
                const ry = this[xV(0x6b5)]
                  ? 0.6
                  : ((this["id"] + Date[xV(0x603)]()) / 0x4b0) % 6.28;
                rq[xV(0xa26)]();
                for (let rA = 0x0; rA < 0x8; rA++) {
                  const rB = 0x1 - rA / 0x8,
                    rC = rB * 0x50;
                  rq[xV(0x710)](ry),
                    (rq[xV(0xfb)] = xV(0xdce)),
                    rq[xV(0x787)](),
                    rq[xV(0xcae)](-rC / 0x2, -rC / 0x2, rC, rC),
                    rq[xV(0x8ef)](),
                    (rq[xV(0x6b1)] = 0x28),
                    rq[xV(0x6f2)](),
                    (rq[xV(0x6b1)] = 0x14),
                    rq[xV(0x6f2)]();
                }
                rq[xV(0x20f)]();
                if (!this[xV(0x299)]) {
                  this[xV(0x299)] = [];
                  for (let rD = 0x0; rD < 0x1e; rD++) {
                    this[xV(0x299)][xV(0x6aa)]({
                      x: Math[xV(0xb03)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rE = 0x0; rE < this[xV(0x299)][xV(0xbc8)]; rE++) {
                  const rF = this[xV(0x299)][rE];
                  (rF["x"] += rF["v"]),
                    rF["x"] > 0x1 &&
                      ((rF["x"] %= 0x1),
                      (rF[xV(0x903)] = Math[xV(0xb03)]() * 6.28),
                      (rF["v"] = Math[xV(0xb03)]() * 0.005 + 0.008),
                      (rF["s"] = Math[xV(0xb03)]() * 0.025 + 0.008)),
                    rq[xV(0xa26)](),
                    (rq[xV(0x74e)] =
                      rF["x"] < 0.2
                        ? rF["x"] / 0.2
                        : rF["x"] > 0.8
                        ? 0x1 - (rF["x"] - 0.8) / 0.2
                        : 0x1),
                    rq[xV(0x6ff)](0x5a, 0x5a),
                    rq[xV(0x710)](rF[xV(0x903)]),
                    rq[xV(0xb25)](rF["x"], 0x0),
                    rq[xV(0x787)](),
                    rq[xV(0x769)](0x0, 0x0, rF["s"], 0x0, Math["PI"] * 0x2),
                    (rq[xV(0x716)] = xV(0x39e)),
                    rq[xV(0x190)](),
                    rq[xV(0x20f)]();
                }
              }
            }
          }
          rq[xV(0x20f)]();
        }
      },
      lL = 0x0,
      lM = 0x0,
      lN = class extends lK {
        constructor(rq, rr, rs, rt) {
          const xY = uf;
          super(cS[xY(0xb2d)], rq, rr, rs, 0x46),
            (this[xY(0x903)] = (Math[xY(0xb03)]() * 0x2 - 0x1) * 0.2),
            (this[xY(0xbca)] = dC[rt]);
        }
        [uf(0x8ee)]() {
          const xZ = uf;
          if (this[xZ(0xc18)] < 0x2 || pz - lL < 0x9c4) {
            this[xZ(0xc18)] += pA / 0x12c;
            return;
          }
          this[xZ(0x3d9)] && (this[xZ(0xd72)] += pA / 0xc8),
            this[xZ(0x10b)] &&
              ((this["x"] = pg(this["x"], this[xZ(0x10b)]["x"], 0xc8)),
              (this["y"] = pg(this["y"], this[xZ(0x10b)]["y"], 0xc8)));
        }
        [uf(0x7e5)](rq) {
          const y0 = uf;
          if (this[y0(0xc18)] === 0x0) return;
          rq[y0(0xa26)](), rq[y0(0xb25)](this["x"], this["y"]);
          const rr = y0(0xdd) + this[y0(0xbca)]["id"];
          let rs =
            (this[y0(0xb6a)] || lM < 0x3) &&
            pq(
              rq,
              rr,
              0x78,
              0x78,
              (rv) => {
                const y1 = y0;
                (this[y1(0xb6a)] = !![]),
                  lM++,
                  rv[y1(0xb25)](0x3c, 0x3c),
                  (rv[y1(0x625)] = rv[y1(0x70b)] = y1(0xac6)),
                  rv[y1(0x787)](),
                  rv[y1(0xcae)](-0x32, -0x32, 0x64, 0x64),
                  (rv[y1(0x6b1)] = 0x12),
                  (rv[y1(0xfb)] = y1(0x7eb)),
                  rv[y1(0x6f2)](),
                  (rv[y1(0x6b1)] = 0x8),
                  (rv[y1(0x716)] = hQ[this[y1(0xbca)][y1(0xcce)]]),
                  rv[y1(0x190)](),
                  (rv[y1(0xfb)] = hR[this[y1(0xbca)][y1(0xcce)]]),
                  rv[y1(0x6f2)]();
                const rw = pt(
                  rv,
                  this[y1(0xbca)][y1(0xaba)],
                  0x12,
                  y1(0xb5c),
                  0x3,
                  !![]
                );
                rv[y1(0x6c0)](
                  rw,
                  -rw[y1(0xa98)] / 0x2,
                  0x32 - 0xd / 0x2 - rw[y1(0xd3c)],
                  rw[y1(0xa98)],
                  rw[y1(0xd3c)]
                ),
                  rv[y1(0xa26)](),
                  rv[y1(0xb25)](
                    0x0 + this[y1(0xbca)][y1(0xda5)],
                    -0x5 + this[y1(0xbca)][y1(0x1ed)]
                  ),
                  this[y1(0xbca)][y1(0xd89)](rv),
                  rv[y1(0x20f)]();
              },
              !![]
            );
          if (!rs) rs = pp[rr];
          rq[y0(0x710)](this[y0(0x903)]);
          const rt = Math[y0(0xc0c)](this[y0(0xc18)], 0x1),
            ru =
              (this[y0(0x58f)] / 0x64) *
              (0x1 +
                Math[y0(0x7f1)](Date[y0(0x603)]() / 0xfa + this["id"]) * 0.05) *
              rt *
              (0x1 - this[y0(0xd72)]);
          rq[y0(0x6ff)](ru, ru),
            rq[y0(0x710)](Math["PI"] * lI(0x1 - rt)),
            rs
              ? rq[y0(0x6c0)](
                  rs,
                  -rs[y0(0xa98)] / 0x2,
                  -rs[y0(0xd3c)] / 0x2,
                  rs[y0(0xa98)],
                  rs[y0(0xd3c)]
                )
              : (rq[y0(0x787)](),
                rq[y0(0xcae)](-0x3c, -0x3c, 0x78, 0x78),
                (rq[y0(0x716)] = hQ[this[y0(0xbca)][y0(0xcce)]]),
                rq[y0(0x190)]()),
            rq[y0(0x20f)]();
        }
      };
    function lO(rq) {
      const y2 = uf;
      rq[y2(0x787)](),
        rq[y2(0x92d)](0x0, 4.5),
        rq[y2(0x2d2)](3.75, 0x0, 0x0, -4.5),
        rq[y2(0x2d2)](-3.75, 0x0, 0x0, 4.5),
        rq[y2(0x8ef)](),
        (rq[y2(0x625)] = rq[y2(0x70b)] = y2(0xac6)),
        (rq[y2(0x716)] = rq[y2(0xfb)] = y2(0x69c)),
        (rq[y2(0x6b1)] = 0x1),
        rq[y2(0x6f2)](),
        rq[y2(0x190)](),
        rq[y2(0x63f)](),
        rq[y2(0x787)](),
        rq[y2(0x769)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, l0),
        (rq[y2(0x716)] = y2(0x9d9)),
        rq[y2(0x190)]();
    }
    function lP(rq, rr = ![]) {
      const y3 = uf;
      lQ(rq, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lQ(rq, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rr) {
        const rs = Math["PI"] / 0x7;
        rq[y3(0x787)](),
          rq[y3(0x769)](0x0, 0x0, 23.5, Math["PI"] + rs, Math["PI"] * 0x2 - rs),
          (rq[y3(0xfb)] = y3(0x782)),
          (rq[y3(0x6b1)] = 0x4),
          (rq[y3(0x625)] = y3(0xac6)),
          rq[y3(0x6f2)]();
      }
    }
    function lQ(rq, rr, rs) {
      const y4 = uf;
      rq[y4(0xa26)](),
        rq[y4(0x710)](rr),
        rq[y4(0xb25)](0x0, -23.6),
        rq[y4(0x710)](rs),
        rq[y4(0x787)](),
        rq[y4(0x92d)](-6.5, 0x1),
        rq[y4(0xbe4)](0x0, -0xf),
        rq[y4(0xbe4)](6.5, 0x1),
        (rq[y4(0x716)] = y4(0xd35)),
        (rq[y4(0x6b1)] = 3.5),
        rq[y4(0x190)](),
        (rq[y4(0x70b)] = y4(0xac6)),
        (rq[y4(0xfb)] = y4(0x782)),
        rq[y4(0x6f2)](),
        rq[y4(0x20f)]();
    }
    function lR(rq, rr, rs, rt, ru, rv, rw = ![]) {
      const y5 = uf;
      var rx = rr[y5(0xbc8)],
        ry;
      rq[y5(0xa26)](),
        rq[y5(0xb25)](rs, rt),
        rq[y5(0x710)]((0x1 * rv) / 0x2),
        rq[y5(0x710)]((0x1 * (rv / rx)) / 0x2),
        (rq[y5(0x266)] = y5(0x765));
      for (var rz = 0x0; rz < rx; rz++) {
        rq[y5(0x710)](-rv / rx),
          rq[y5(0xa26)](),
          rq[y5(0xb25)](0x0, ru),
          (ry = rr[rz]),
          rw && rq[y5(0x10a)](ry, 0x0, 0x0),
          rq[y5(0x940)](ry, 0x0, 0x0),
          rq[y5(0x20f)]();
      }
      rq[y5(0x20f)]();
    }
    function lS(rq, rr = 0x1) {
      const y6 = uf,
        rs = 0xf;
      rq[y6(0x787)]();
      const rt = 0x6;
      for (let ry = 0x0; ry < rt; ry++) {
        const rz = (ry / rt) * Math["PI"] * 0x2;
        rq[y6(0xbe4)](Math[y6(0xa87)](rz) * rs, Math[y6(0x7f1)](rz) * rs);
      }
      rq[y6(0x8ef)](),
        (rq[y6(0x6b1)] = 0x4),
        (rq[y6(0xfb)] = y6(0x7c4)),
        rq[y6(0x6f2)](),
        (rq[y6(0x716)] = y6(0x648)),
        rq[y6(0x190)]();
      const ru = (Math["PI"] * 0x2) / rt,
        rv = Math[y6(0xa87)](ru) * rs,
        rw = Math[y6(0x7f1)](ru) * rs;
      for (let rA = 0x0; rA < rt; rA++) {
        rq[y6(0x787)](),
          rq[y6(0x92d)](0x0, 0x0),
          rq[y6(0xbe4)](rs, 0x0),
          rq[y6(0xbe4)](rv, rw),
          rq[y6(0x8ef)](),
          (rq[y6(0x716)] =
            y6(0x40c) + (0.2 + (((rA + 0x4) % rt) / rt) * 0.35) + ")"),
          rq[y6(0x190)](),
          rq[y6(0x710)](ru);
      }
      rq[y6(0x787)]();
      const rx = rs * 0.65;
      for (let rB = 0x0; rB < rt; rB++) {
        const rC = (rB / rt) * Math["PI"] * 0x2;
        rq[y6(0xbe4)](Math[y6(0xa87)](rC) * rx, Math[y6(0x7f1)](rC) * rx);
      }
      (rq[y6(0x161)] = 0x23 + rr * 0xf),
        (rq[y6(0x2f4)] = rq[y6(0x716)] = y6(0xa16)),
        rq[y6(0x190)](),
        rq[y6(0x190)](),
        rq[y6(0x190)]();
    }
    var lT = class extends lG {
        constructor(rq, rr, rs, rt, ru, rv, rw) {
          const y7 = uf;
          super(rq, cS[y7(0xa9e)], rr, rs, rt, rw, ru),
            (this[y7(0x210)] = rv),
            (this[y7(0x5b7)] = 0x0),
            (this[y7(0xba6)] = 0x0),
            (this[y7(0xc30)] = 0x0),
            (this[y7(0x5e7)] = 0x0),
            (this[y7(0x2ab)] = ""),
            (this[y7(0xb14)] = 0x0),
            (this[y7(0x5e8)] = !![]),
            (this[y7(0x257)] = ![]),
            (this[y7(0xa07)] = ![]),
            (this[y7(0xd53)] = ![]),
            (this[y7(0x50d)] = ![]),
            (this[y7(0x9b1)] = ![]),
            (this[y7(0x5e5)] = !![]),
            (this[y7(0xc2b)] = 0x0),
            (this[y7(0x618)] = 0x0);
        }
        [uf(0x8ee)]() {
          const y8 = uf;
          super[y8(0x8ee)]();
          if (this[y8(0x3d9)]) (this[y8(0xba6)] = 0x1), (this[y8(0x5b7)] = 0x0);
          else {
            const rq = pA / 0xc8;
            let rr = this[y8(0x210)];
            if (this[y8(0x257)] && rr === cY[y8(0x4b0)]) rr = cY[y8(0x48b)];
            (this[y8(0x5b7)] = Math[y8(0xc0c)](
              0x1,
              Math[y8(0x411)](
                0x0,
                this[y8(0x5b7)] + (rr === cY[y8(0x28d)] ? rq : -rq)
              )
            )),
              (this[y8(0xba6)] = Math[y8(0xc0c)](
                0x1,
                Math[y8(0x411)](
                  0x0,
                  this[y8(0xba6)] + (rr === cY[y8(0x48b)] ? rq : -rq)
                )
              )),
              (this[y8(0xc2b)] = pg(this[y8(0xc2b)], this[y8(0x618)], 0x64));
          }
        }
        [uf(0x7e5)](rq) {
          const y9 = uf;
          rq[y9(0xa26)](), rq[y9(0xb25)](this["x"], this["y"]);
          let rr = this[y9(0x58f)] / kZ;
          this[y9(0x3d9)] &&
            rq[y9(0x710)]((this[y9(0xd72)] * Math["PI"]) / 0x4);
          rq[y9(0x6ff)](rr, rr), this[y9(0x727)](rq);
          this[y9(0x595)] &&
            (rq[y9(0xa26)](),
            rq[y9(0x710)](this[y9(0x903)]),
            rq[y9(0x5b0)](this[y9(0x58f)] / 0x28 / rr),
            this[y9(0x8a8)](rq),
            rq[y9(0x20f)]());
          this[y9(0xbe0)] &&
            (rq[y9(0xa26)](),
            rq[y9(0x5b0)](kZ / 0x12),
            this[y9(0x3fe)](rq, pz / 0x12c),
            rq[y9(0x20f)]());
          const rs = y9(0x782);
          if (this[y9(0xcdf)]) {
            const rC = Date[y9(0x603)](),
              rD = (Math[y9(0x7f1)](rC / 0x12c) * 0.5 + 0.5) * 0x2;
            rq[y9(0x787)](),
              rq[y9(0x92d)](0x5, -0x22),
              rq[y9(0x9f1)](0x2f, -0x19, 0x14, 0x5, 0x2b - rD, 0x19),
              rq[y9(0x2d2)](0x0, 0x28 + rD * 0.6, -0x2b + rD, 0x19),
              rq[y9(0x9f1)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rq[y9(0x2d2)](0x0, -0x23, 0x5, -0x22),
              (rq[y9(0x716)] = rs),
              rq[y9(0x190)]();
          }
          this[y9(0x9b1)] && lP(rq);
          const rt = this[y9(0x50d)]
            ? [y9(0xdb0), y9(0xaf3)]
            : this[y9(0xa1c)]
            ? [y9(0x95e), y9(0x19f)]
            : [y9(0xd4a), y9(0xc0a)];
          (rt[0x0] = this[y9(0x683)](rt[0x0])),
            (rt[0x1] = this[y9(0x683)](rt[0x1]));
          let ru = 2.75;
          !this[y9(0xa1c)] && (ru /= rr);
          (rq[y9(0x716)] = rt[0x0]),
            (rq[y9(0x6b1)] = ru),
            (rq[y9(0xfb)] = rt[0x1]);
          this[y9(0xa1c)] &&
            (rq[y9(0x787)](),
            rq[y9(0x92d)](0x0, 0x0),
            rq[y9(0x2d2)](-0x1e, 0xf, -0x1e, 0x1e),
            rq[y9(0x2d2)](0x0, 0x37, 0x1e, 0x1e),
            rq[y9(0x2d2)](0x1e, 0xf, 0x0, 0x0),
            rq[y9(0x190)](),
            rq[y9(0x6f2)](),
            rq[y9(0xa26)](),
            (rq[y9(0x716)] = rq[y9(0xfb)]),
            (rq[y9(0x1d9)] = y9(0x89a)),
            (rq[y9(0x433)] = y9(0xb2f) + iA),
            lR(rq, y9(0x5fa), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rq[y9(0x20f)]());
          rq[y9(0x787)]();
          this[y9(0xb57)]
            ? !this[y9(0xcdf)]
              ? rq[y9(0xcae)](-0x19, -0x19, 0x32, 0x32)
              : (rq[y9(0x92d)](0x19, 0x19),
                rq[y9(0xbe4)](-0x19, 0x19),
                rq[y9(0xbe4)](-0x19, -0xa),
                rq[y9(0xbe4)](-0xa, -0x19),
                rq[y9(0xbe4)](0xa, -0x19),
                rq[y9(0xbe4)](0x19, -0xa),
                rq[y9(0x8ef)]())
            : rq[y9(0x769)](0x0, 0x0, kZ, 0x0, l0);
          rq[y9(0x190)](), rq[y9(0x6f2)]();
          this[y9(0x46f)] &&
            (rq[y9(0xa26)](),
            rq[y9(0x63f)](),
            rq[y9(0x787)](),
            !this[y9(0xcdf)] &&
              (rq[y9(0x92d)](-0x8, -0x1e),
              rq[y9(0xbe4)](0xf, -0x7),
              rq[y9(0xbe4)](0x1e, -0x14),
              rq[y9(0xbe4)](0x1e, -0x32)),
            rq[y9(0xb25)](
              0x0,
              0x2 * (0x1 - (this[y9(0xba6)] + this[y9(0x5b7)]))
            ),
            rq[y9(0x92d)](-0x2, 0x0),
            rq[y9(0xbe4)](-0x3, 4.5),
            rq[y9(0xbe4)](0x3, 4.5),
            rq[y9(0xbe4)](0x2, 0x0),
            (rq[y9(0x716)] = y9(0x69c)),
            rq[y9(0x190)](),
            rq[y9(0x20f)]());
          this[y9(0xcdf)] &&
            (rq[y9(0x787)](),
            rq[y9(0x92d)](0x0, -0x17),
            rq[y9(0x2d2)](0x4, -0xd, 0x1b, -0x8),
            rq[y9(0xbe4)](0x14, -0x1c),
            rq[y9(0xbe4)](-0x14, -0x1c),
            rq[y9(0xbe4)](-0x1b, -0x8),
            rq[y9(0x2d2)](-0x4, -0xd, 0x0, -0x17),
            (rq[y9(0x716)] = rs),
            rq[y9(0x190)]());
          if (this[y9(0xa63)]) {
            (rq[y9(0xfb)] = y9(0xc4)),
              (rq[y9(0x6b1)] = 1.4),
              rq[y9(0x787)](),
              (rq[y9(0x625)] = y9(0xac6));
            const rE = 4.5;
            for (let rF = 0x0; rF < 0x2; rF++) {
              const rG = -0x12 + rF * 0x1d;
              for (let rH = 0x0; rH < 0x3; rH++) {
                const rI = rG + rH * 0x3;
                rq[y9(0x92d)](rI, rE + -1.5), rq[y9(0xbe4)](rI + 1.6, rE + 1.6);
              }
            }
            rq[y9(0x6f2)]();
          }
          if (this[y9(0xacb)]) {
            rq[y9(0x787)](),
              rq[y9(0x769)](0x0, 2.5, 3.3, 0x0, l0),
              (rq[y9(0x716)] = y9(0x53b)),
              rq[y9(0x190)](),
              rq[y9(0x787)](),
              rq[y9(0x769)](0xd, 2.8, 5.5, 0x0, l0),
              rq[y9(0x769)](-0xd, 2.8, 5.5, 0x0, l0),
              (rq[y9(0x716)] = y9(0xb2a)),
              rq[y9(0x190)](),
              rq[y9(0xa26)](),
              rq[y9(0x710)](-Math["PI"] / 0x4),
              rq[y9(0x787)]();
            const rJ = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[y9(0xb57)] &&
              rJ[y9(0x4a2)]((rK) => {
                (rK[0x0] *= 1.1), (rK[0x1] *= 1.1);
              });
            for (let rK = 0x0; rK < 0x2; rK++) {
              for (let rL = 0x0; rL < rJ[y9(0xbc8)]; rL++) {
                const rM = rJ[rL];
                rq[y9(0x92d)](rM[0x0], rM[0x1]), rq[y9(0x769)](...rM, 0x0, l0);
              }
              rq[y9(0x710)](-Math["PI"] / 0x2);
            }
            (rq[y9(0x716)] = y9(0x8e6)), rq[y9(0x190)](), rq[y9(0x20f)]();
          }
          const rv = this[y9(0x5b7)],
            rw = this[y9(0xba6)],
            rx = 0x6 * rv,
            ry = 0x4 * rw;
          function rz(rN, rO) {
            const ya = y9;
            rq[ya(0x787)]();
            const rP = 3.25;
            rq[ya(0x92d)](rN - rP, rO - rP),
              rq[ya(0xbe4)](rN + rP, rO + rP),
              rq[ya(0x92d)](rN + rP, rO - rP),
              rq[ya(0xbe4)](rN - rP, rO + rP),
              (rq[ya(0x6b1)] = 0x2),
              (rq[ya(0x625)] = ya(0xac6)),
              (rq[ya(0xfb)] = ya(0x69c)),
              rq[ya(0x6f2)](),
              rq[ya(0x8ef)]();
          }
          function rA(rN, rO) {
            const yb = y9;
            rq[yb(0xa26)](),
              rq[yb(0xb25)](rN, rO),
              rq[yb(0x787)](),
              rq[yb(0x92d)](-0x4, 0x0),
              rq[yb(0x2d2)](0x0, 0x6, 0x4, 0x0),
              (rq[yb(0x6b1)] = 0x2),
              (rq[yb(0x625)] = yb(0xac6)),
              (rq[yb(0xfb)] = yb(0x69c)),
              rq[yb(0x6f2)](),
              rq[yb(0x20f)]();
          }
          if (this[y9(0x3d9)]) rz(0x7, -0x5), rz(-0x7, -0x5);
          else {
            if (this[y9(0x300)]) rA(0x7, -0x5), rA(-0x7, -0x5);
            else {
              let rN = function (rP, rQ, rR, rS, rT = 0x0) {
                  const yc = y9,
                    rU = rT ^ 0x1;
                  rq[yc(0x92d)](rP - rR, rQ - rS + rT * rx + rU * ry),
                    rq[yc(0xbe4)](rP + rR, rQ - rS + rU * rx + rT * ry),
                    rq[yc(0xbe4)](rP + rR, rQ + rS),
                    rq[yc(0xbe4)](rP - rR, rQ + rS),
                    rq[yc(0xbe4)](rP - rR, rQ - rS);
                },
                rO = function (rP = 0x0) {
                  const yd = y9;
                  rq[yd(0x787)](),
                    rq[yd(0xadb)](0x7, -0x5, 2.5 + rP, 0x6 + rP, 0x0, 0x0, l0),
                    rq[yd(0x92d)](-0x7, -0x5),
                    rq[yd(0xadb)](-0x7, -0x5, 2.5 + rP, 0x6 + rP, 0x0, 0x0, l0),
                    (rq[yd(0xfb)] = rq[yd(0x716)] = yd(0x69c)),
                    rq[yd(0x190)]();
                };
              rq[y9(0xa26)](),
                rq[y9(0x787)](),
                rN(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                rN(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rq[y9(0x63f)](),
                rO(0.7),
                rO(0x0),
                rq[y9(0x63f)](),
                rq[y9(0x787)](),
                rq[y9(0x769)](
                  0x7 + this[y9(0xc30)] * 0x2,
                  -0x5 + this[y9(0x5e7)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                rq[y9(0x92d)](-0x7, -0x5),
                rq[y9(0x769)](
                  -0x7 + this[y9(0xc30)] * 0x2,
                  -0x5 + this[y9(0x5e7)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                (rq[y9(0x716)] = y9(0x9d9)),
                rq[y9(0x190)](),
                rq[y9(0x20f)]();
            }
          }
          if (this[y9(0xd53)]) {
            rq[y9(0xa26)](), rq[y9(0xb25)](0x0, -0xc);
            if (this[y9(0x3d9)]) rq[y9(0x6ff)](0.7, 0.7), rz(0x0, -0x3);
            else
              this[y9(0x300)]
                ? (rq[y9(0x6ff)](0.7, 0.7), rA(0x0, -0x3))
                : lO(rq);
            rq[y9(0x20f)]();
          }
          this[y9(0xa07)] &&
            (rq[y9(0xa26)](),
            rq[y9(0xb25)](0x0, 0xa),
            rq[y9(0x710)](-Math["PI"] / 0x2),
            rq[y9(0x6ff)](0.82, 0.82),
            this[y9(0xcf9)](rq, ![], 0.85),
            rq[y9(0x20f)]());
          const rB = rv * (-0x5 - 5.5) + rw * (-0x5 - 0x4);
          rq[y9(0xa26)](),
            rq[y9(0x787)](),
            rq[y9(0xb25)](0x0, 9.5),
            rq[y9(0x92d)](-5.6, 0x0),
            rq[y9(0x2d2)](0x0, 0x5 + rB, 5.6, 0x0),
            (rq[y9(0x625)] = y9(0xac6));
          this[y9(0xacb)]
            ? ((rq[y9(0x6b1)] = 0x7),
              (rq[y9(0xfb)] = y9(0x53b)),
              rq[y9(0x6f2)](),
              (rq[y9(0xfb)] = y9(0xd97)))
            : (rq[y9(0xfb)] = y9(0x69c));
          (rq[y9(0x6b1)] = 1.75), rq[y9(0x6f2)](), rq[y9(0x20f)]();
          if (this[y9(0xaa2)]) {
            const rP = this[y9(0x5b7)],
              rQ = 0x28,
              rR = Date[y9(0x603)]() / 0x12c,
              rS = this[y9(0xa1c)] ? 0x0 : Math[y9(0x7f1)](rR) * 0.5 + 0.5,
              rT = rS * 0x4,
              rU = 0x28 - rS * 0x4,
              rV = rU - (this[y9(0xa1c)] ? 0x1 : jf(rP)) * 0x50,
              rW = this[y9(0x46f)];
            (rq[y9(0x6b1)] = 0x9 + ru * 0x2),
              (rq[y9(0x70b)] = y9(0xac6)),
              (rq[y9(0x625)] = y9(0xac6));
            for (let rX = 0x0; rX < 0x2; rX++) {
              rq[y9(0x787)](), rq[y9(0xa26)]();
              for (let rY = 0x0; rY < 0x2; rY++) {
                rq[y9(0x92d)](0x19, 0x0);
                let rZ = rV;
                rW && rY === 0x0 && (rZ = rU),
                  rq[y9(0x2d2)](0x2d + rT, rZ * 0.5, 0xb, rZ),
                  rq[y9(0x6ff)](-0x1, 0x1);
              }
              rq[y9(0x20f)](),
                (rq[y9(0xfb)] = rt[0x1 - rX]),
                rq[y9(0x6f2)](),
                (rq[y9(0x6b1)] = 0x9);
            }
            rq[y9(0xa26)](),
              rq[y9(0xb25)](0x0, rV),
              lS(rq, rS),
              rq[y9(0x20f)]();
          }
          rq[y9(0x20f)]();
        }
        [uf(0x2d8)](rq, rr) {}
        [uf(0x999)](rq, rr = 0x1) {
          const ye = uf,
            rs = n4[this["id"]];
          if (!rs) return;
          for (let rt = 0x0; rt < rs[ye(0xbc8)]; rt++) {
            const ru = rs[rt];
            if (ru["t"] > lV + lW) continue;
            !ru["x"] &&
              ((ru["x"] = this["x"]),
              (ru["y"] = this["y"] - this[ye(0x58f)] - 0x44),
              (ru[ye(0xa74)] = this["x"]),
              (ru[ye(0xc6)] = this["y"]));
            const rv = ru["t"] > lV ? 0x1 - (ru["t"] - lV) / lW : 0x1,
              rw = rv * rv * rv;
            (ru["x"] += (this["x"] - ru[ye(0xa74)]) * rw),
              (ru["y"] += (this["y"] - ru[ye(0xc6)]) * rw),
              (ru[ye(0xa74)] = this["x"]),
              (ru[ye(0xc6)] = this["y"]);
            const rx = Math[ye(0xc0c)](0x1, ru["t"] / 0x64);
            rq[ye(0xa26)](),
              (rq[ye(0x74e)] = (rv < 0.7 ? rv / 0.7 : 0x1) * rx * 0.9),
              rq[ye(0xb25)](ru["x"], ru["y"] - (ru["t"] / lV) * 0x14),
              rq[ye(0x5b0)](rr);
            const ry = pt(rq, ru[ye(0x1c8)], 0x10, ye(0xc54), 0x0, !![], ![]);
            rq[ye(0x5b0)](rx), rq[ye(0x787)]();
            const rz = ry[ye(0xa98)] + 0xa,
              rA = ry[ye(0xd3c)] + 0xf;
            rq[ye(0x622)]
              ? rq[ye(0x622)](-rz / 0x2, -rA / 0x2, rz, rA, 0x5)
              : rq[ye(0xcae)](-rz / 0x2, -rA / 0x2, rz, rA),
              (rq[ye(0x716)] = ru[ye(0xd85)]),
              rq[ye(0x190)](),
              (rq[ye(0xfb)] = ye(0xc54)),
              (rq[ye(0x6b1)] = 1.5),
              rq[ye(0x6f2)](),
              rq[ye(0x6c0)](
                ry,
                -ry[ye(0xa98)] / 0x2,
                -ry[ye(0xd3c)] / 0x2,
                ry[ye(0xa98)],
                ry[ye(0xd3c)]
              ),
              rq[ye(0x20f)]();
          }
        }
      },
      lU = 0x4e20,
      lV = 0xfa0,
      lW = 0xbb8,
      lX = lV + lW;
    function lY(rq, rr, rs = 0x1) {
      const yf = uf;
      if (rq[yf(0x3d9)]) return;
      rr[yf(0xa26)](),
        rr[yf(0xb25)](rq["x"], rq["y"]),
        lZ(rq, rr),
        rr[yf(0xb25)](0x0, -rq[yf(0x58f)] - 0x19),
        rr[yf(0xa26)](),
        rr[yf(0x5b0)](rs),
        rq[yf(0x7cf)] &&
          (pt(rr, "@" + rq[yf(0x7cf)], 0xb, yf(0x35b), 0x3),
          rr[yf(0xb25)](0x0, -0x10)),
        rq[yf(0x2ab)] &&
          (pt(rr, rq[yf(0x2ab)], 0x12, yf(0xb5c), 0x3),
          rr[yf(0xb25)](0x0, -0x5)),
        rr[yf(0x20f)](),
        !rq[yf(0x5e5)] &&
          rq[yf(0x68e)] > 0.001 &&
          ((rr[yf(0x74e)] = rq[yf(0x68e)]),
          rr[yf(0x6ff)](rq[yf(0x68e)] * 0x3, rq[yf(0x68e)] * 0x3),
          rr[yf(0x787)](),
          rr[yf(0x769)](0x0, 0x0, 0x14, 0x0, l0),
          (rr[yf(0x716)] = yf(0x69c)),
          rr[yf(0x190)](),
          nm(rr, 0.8),
          rr[yf(0x787)](),
          rr[yf(0x769)](0x0, 0x0, 0x14, 0x0, l0),
          (rr[yf(0x716)] = yf(0x9de)),
          rr[yf(0x190)](),
          rr[yf(0x787)](),
          rr[yf(0x92d)](0x0, 0x0),
          rr[yf(0x769)](0x0, 0x0, 0x10, 0x0, l0 * rq[yf(0xca8)]),
          rr[yf(0xbe4)](0x0, 0x0),
          rr[yf(0x63f)](),
          nm(rr, 0.8)),
        rr[yf(0x20f)]();
    }
    function lZ(rq, rr, rs = ![]) {
      const yg = uf;
      if (rq[yg(0x185)] <= 0x0) return;
      rr[yg(0xa26)](),
        (rr[yg(0x74e)] = rq[yg(0x185)]),
        (rr[yg(0xfb)] = yg(0x782)),
        rr[yg(0x787)]();
      const rt = rs ? 0x8c : rq[yg(0x5e5)] ? 0x4b : 0x64,
        ru = rs ? 0x1a : 0x9;
      if (rs) rr[yg(0xb25)](rq[yg(0x58f)] + 0x11, 0x0);
      else {
        const rw = Math[yg(0x411)](0x1, rq[yg(0x58f)] / 0x64);
        rr[yg(0x6ff)](rw, rw),
          rr[yg(0xb25)](-rt / 0x2, rq[yg(0x58f)] / rw + 0x1b);
      }
      rr[yg(0x787)](),
        rr[yg(0x92d)](rs ? -0x14 : 0x0, 0x0),
        rr[yg(0xbe4)](rt, 0x0),
        (rr[yg(0x625)] = yg(0xac6)),
        (rr[yg(0x6b1)] = ru),
        (rr[yg(0xfb)] = yg(0x782)),
        rr[yg(0x6f2)]();
      function rv(rx) {
        const yh = yg;
        rr[yh(0x74e)] = rx < 0.05 ? rx / 0.05 : 0x1;
      }
      rq[yg(0x187)] > 0x0 &&
        (rv(rq[yg(0x187)]),
        rr[yg(0x787)](),
        rr[yg(0x92d)](0x0, 0x0),
        rr[yg(0xbe4)](rq[yg(0x187)] * rt, 0x0),
        (rr[yg(0x6b1)] = ru * (rs ? 0.55 : 0.44)),
        (rr[yg(0xfb)] = yg(0x7a2)),
        rr[yg(0x6f2)]());
      rq[yg(0x238)] > 0x0 &&
        (rv(rq[yg(0x238)]),
        rr[yg(0x787)](),
        rr[yg(0x92d)](0x0, 0x0),
        rr[yg(0xbe4)](rq[yg(0x238)] * rt, 0x0),
        (rr[yg(0x6b1)] = ru * (rs ? 0.7 : 0.66)),
        (rr[yg(0xfb)] = yg(0x3bd)),
        rr[yg(0x6f2)]());
      rq[yg(0xc2b)] &&
        (rv(rq[yg(0xc2b)]),
        rr[yg(0x787)](),
        rr[yg(0x92d)](0x0, 0x0),
        rr[yg(0xbe4)](rq[yg(0xc2b)] * rt, 0x0),
        (rr[yg(0x6b1)] = ru * (rs ? 0.45 : 0.35)),
        (rr[yg(0xfb)] = yg(0x3a1)),
        rr[yg(0x6f2)]());
      if (rq[yg(0x5e5)]) {
        rr[yg(0x74e)] = 0x1;
        var hp = Math.round(rq.health * hack.hp);
        var shield = Math.round(rq.shield * hack.hp);
        const rx = pt(
          rr,
          `HP ${hp}${shield ? " + " + shield : ""} ` + yg(0xc81) + (rq[yg(0xb14)] + 0x1),
          rs ? 0xc : 0xe,
          yg(0xb5c),
          0x3,
          !![]
        );
        if(rq.username == hack.player.name) hack.player.entity = rq;
        rr[yg(0x6c0)](
          rx,
          rt + ru / 0x2 - rx[yg(0xa98)],
          ru / 0x2,
          rx[yg(0xa98)],
          rx[yg(0xd3c)]
        );
        if (rs) {
          const ry = pt(rr, "@" + rq[yg(0x7cf)], 0xc, yg(0x35b), 0x3, !![]);
          rr[yg(0x6c0)](
            ry,
            -ru / 0x2,
            -ru / 0x2 - ry[yg(0xd3c)],
            ry[yg(0xa98)],
            ry[yg(0xd3c)]
          );
        }
      } else {
        rr[yg(0x74e)] = 0x1;
        const rz = kc[rq[yg(0x511)]],
          rA = pt(rr, rz, 0xe, yg(0xb5c), 0x3, !![], rq[yg(0x518)]);
        rr[yg(0xa26)](), rr[yg(0xb25)](0x0, -ru / 0x2 - rA[yg(0xd3c)]);
        rA[yg(0xa98)] > rt + ru
          ? rr[yg(0x6c0)](
              rA,
              rt / 0x2 - rA[yg(0xa98)] / 0x2,
              0x0,
              rA[yg(0xa98)],
              rA[yg(0xd3c)]
            )
          : rr[yg(0x6c0)](rA, -ru / 0x2, 0x0, rA[yg(0xa98)], rA[yg(0xd3c)]);
        rr[yg(0x20f)]();
        const rB = pt(rr, rq[yg(0x518)], 0xe, hP[rq[yg(0x518)]], 0x3, !![]);
        rr[yg(0x6c0)](
          rB,
          rt + ru / 0x2 - rB[yg(0xa98)],
          ru / 0x2,
          rB[yg(0xa98)],
          rB[yg(0xd3c)]
        );
        var genCanvas = pt;
        const health = genCanvas(
          rr,
          `${Math.floor(rq['health'] * getHP(rq, hack.moblst))} (${Math.floor(rq['health'] * 100)}%)`,
          30,
          hack.getColor(rq),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) rr.drawImage(
          health,
          -60,
          -150,
          health.worldW,
          health.worldH
        );
        const health2 = genCanvas(
          rr,
          `/ ${getHP(rq, hack.moblst)} `,
          30,
          hack.getColor(rq),
          3,
          true
        );
        if(hack.isEnabled('healthDisplay')) rr.drawImage(
          health2,
          -60,
          -120,
          health2.worldW,
          health2.worldH
        );
      }
      rs &&
        rq[yg(0x2ab)] &&
        ((rr[yg(0x74e)] = 0x1),
        rr[yg(0xb25)](rt / 0x2, 0x0),
        pt(rr, rq[yg(0x2ab)], 0x11, yg(0xb5c), 0x3)),
        rr[yg(0x20f)]();
    }
    function m0(rq) {
      const yi = uf;
      for (let rr in op) {
        op[rr][yi(0x4b8)](rq);
      }
      oI();
    }
    var m1 = {},
      m2 = document[uf(0xa10)](uf(0x809));
    mr(uf(0xa3d), uf(0x987), uf(0x482)),
      mr(uf(0x10d), uf(0x809), uf(0x9f9)),
      mr(uf(0xabd), uf(0xc4f), uf(0x9f5), () => {
        const yj = uf;
        (hv = ![]), (hD[yj(0x9f5)] = fc);
      }),
      mr(uf(0x273), uf(0x2a9), uf(0xa34)),
      mr(uf(0xa4f), uf(0xafe), uf(0xc80)),
      mr(uf(0x4d6), uf(0xbb5), uf(0x5a8)),
      mr(uf(0xcea), uf(0x13d), uf(0x915)),
      mr(uf(0x383), uf(0xd0b), uf(0x6ef)),
      mr(uf(0x835), uf(0x2cc), uf(0xbf6)),
      mr(uf(0x379), uf(0x436), "lb"),
      mr(uf(0x9d8), uf(0x3ae), uf(0xb17)),
      mr(uf(0x2dd), uf(0x4c9), uf(0xc1b), () => {
        const yk = uf;
        (m4[yk(0x397)][yk(0x373)] = yk(0x972)), (hD[yk(0xc1b)] = m3);
      }),
      mr(uf(0x732), uf(0x83c), uf(0xc5), () => {
        const yl = uf;
        if (!hW) return;
        il(new Uint8Array([cI[yl(0xc3c)]]));
      });
    var m3 = 0xb,
      m4 = document[uf(0xa10)](uf(0xa61));
    hD[uf(0xc1b)] == m3 && (m4[uf(0x397)][uf(0x373)] = uf(0x972));
    var m5 = document[uf(0xa10)](uf(0x1ad));
    m5[uf(0x397)][uf(0x373)] = uf(0x972);
    var m6 = document[uf(0xa10)](uf(0xbe3)),
      m7 = document[uf(0xa10)](uf(0x635)),
      m8 = document[uf(0xa10)](uf(0x1cb));
    m8[uf(0xc3)] = function () {
      const ym = uf;
      m5[ym(0x397)][ym(0x373)] = ym(0x972);
    };
    var m9 = ![];
    m7[uf(0xc3)] = ng(function (rq) {
      const yn = uf;
      if (!hW || m9 || jy) return;
      const rr = m6[yn(0x94c)][yn(0x11a)]();
      if (!rr || !eV(rr)) {
        m6[yn(0x474)][yn(0xa5a)](yn(0x9db)),
          void m6[yn(0xcb4)],
          m6[yn(0x474)][yn(0x1b0)](yn(0x9db));
        return;
      }
      (m5[yn(0x397)][yn(0x373)] = ""),
        (m5[yn(0xd6e)] = yn(0x27d)),
        il(
          new Uint8Array([cI[yn(0xc95)], ...new TextEncoder()[yn(0x6a7)](rr)])
        ),
        (m9 = !![]);
    });
    function ma(rq, rr) {
      const yo = uf;
      if (rq === yo(0x46d)) {
        const rs = {};
        (rs[yo(0xdc3)] = yo(0xa4c)),
          (rs[yo(0x5a9)] = yo(0xd7)),
          (rs[yo(0xae8)] = yo(0xd7)),
          (rr = new Date(
            rr === 0x0 ? Date[yo(0x603)]() : rr * 0x3e8 * 0x3c * 0x3c
          )[yo(0x4dc)]("en", rs));
      } else
        rq === yo(0x3ca) || rq === yo(0xd41)
          ? (rr = ka(rr * 0x3e8 * 0x3c, !![]))
          : (rr = k9(rr));
      return rr;
    }
    var mb = f2(),
      mc = {},
      md = document[uf(0xa10)](uf(0x9ea));
    md[uf(0xd6e)] = "";
    for (let rq in mb) {
      const rr = me(rq);
      rr[uf(0x9b4)](0x0), md[uf(0xd58)](rr), (mc[rq] = rr);
    }
    function me(rs) {
      const yp = uf,
        rt = nA(yp(0xcc7) + kd(rs) + yp(0x8fd)),
        ru = rt[yp(0xa10)](yp(0x743));
      return (
        (rt[yp(0x9b4)] = function (rv) {
          k8(ru, ma(rs, rv));
        }),
        rt
      );
    }
    var mf;
    function mg(rs, rt, ru, rv, rw, rx, ry) {
      const yq = uf;
      mf && (mf[yq(0x41b)](), (mf = null));
      const rz = rx[yq(0xbc8)] / 0x2,
        rA = yq(0x417)[yq(0x462)](rz),
        rB = nA(
          yq(0xce8) +
            rs +
            yq(0xd8a) +
            rA +
            yq(0xccb) +
            rA +
            yq(0x9ee) +
            yq(0x4e4)[yq(0x462)](eL * dH) +
            yq(0x1eb) +
            (ru[yq(0xbc8)] === 0x0 ? yq(0xb23) : "") +
            yq(0x2a2)
        );
      ry && rB[yq(0xd58)](nA(yq(0x46b)));
      mf = rB;
      const rC = rB[yq(0xa10)](yq(0x75f)),
        rD = rB[yq(0xa10)](yq(0x960));
      for (let rP = 0x0; rP < rx[yq(0xbc8)]; rP++) {
        const rQ = rx[rP];
        if (!rQ) continue;
        const rR = nZ(rQ);
        rR[yq(0x474)][yq(0xa5a)](yq(0x429)),
          (rR[yq(0x633)] = !![]),
          rR[yq(0x7cd)][yq(0xa5a)](),
          (rR[yq(0x7cd)] = null),
          rP < rz
            ? rC[yq(0x8c1)][rP][yq(0xd58)](rR)
            : rD[yq(0x8c1)][rP - rz][yq(0xd58)](rR);
      }
      (rB[yq(0x41b)] = function () {
        const yr = yq;
        (rB[yr(0x397)][yr(0x17b)] = yr(0xa31)),
          (rB[yr(0x397)][yr(0x373)] = yr(0x972)),
          void rB[yr(0xcb4)],
          (rB[yr(0x397)][yr(0x373)] = ""),
          setTimeout(function () {
            const ys = yr;
            rB[ys(0xa5a)]();
          }, 0x3e8);
      }),
        (rB[yq(0xa10)](yq(0x99d))[yq(0xc3)] = function () {
          const yt = yq;
          rB[yt(0x41b)]();
        });
      const rE = d4(rw),
        rF = rE[0x0],
        rG = rE[0x1],
        rH = d2(rF + 0x1),
        rI = rw - rG,
        rJ = rB[yq(0xa10)](yq(0x5fe));
      k8(
        rJ,
        yq(0xbbc) + (rF + 0x1) + yq(0xdaf) + iJ(rI) + "/" + iJ(rH) + yq(0x71d)
      );
      const rK = Math[yq(0xc0c)](0x1, rI / rH),
        rL = rB[yq(0xa10)](yq(0xcf7));
      rL[yq(0x397)][yq(0x766)] = rK * 0x64 + "%";
      const rM = rB[yq(0xa10)](yq(0x9ea));
      for (let rS in mb) {
        const rT = me(rS);
        rT[yq(0x9b4)](rt[rS]), rM[yq(0xd58)](rT);
      }
      const rN = rB[yq(0xa10)](yq(0x7ad));
      ru[yq(0x1d0)]((rU, rV) => nY(rU[0x0], rV[0x0]));
      for (let rU = 0x0; rU < ru[yq(0xbc8)]; rU++) {
        const [rV, rW] = ru[rU],
          rX = nZ(rV);
        jY(rX),
          rX[yq(0x474)][yq(0xa5a)](yq(0x429)),
          (rX[yq(0x633)] = !![]),
          oP(rX[yq(0x7cd)], rW),
          rN[yq(0xd58)](rX);
      }
      if (ru[yq(0xbc8)] > 0x0) {
        const rY = nA(yq(0x316)),
          rZ = {};
        for (let s0 = 0x0; s0 < ru[yq(0xbc8)]; s0++) {
          const [s1, s2] = ru[s0];
          rZ[s1[yq(0xcce)]] = (rZ[s1[yq(0xcce)]] || 0x0) + s2;
        }
        oo(rY, rZ), rB[yq(0xa10)](yq(0xbb5))[yq(0xd58)](rY);
      }
      const rO = rB[yq(0xa10)](yq(0x816));
      for (let s3 = 0x0; s3 < rv[yq(0xbc8)]; s3++) {
        const s4 = rv[s3],
          s5 = nF(s4, !![]);
        s5[yq(0x474)][yq(0xa5a)](yq(0x429)), (s5[yq(0x633)] = !![]);
        const s6 = rO[yq(0x8c1)][s4[yq(0x72f)] * dH + s4[yq(0xcce)]];
        rO[yq(0x393)](s5, s6), s6[yq(0xa5a)]();
      }
      rB[yq(0x474)][yq(0x1b0)](yq(0xa72)),
        setTimeout(function () {
          const yu = yq;
          rB[yu(0x474)][yu(0xa5a)](yu(0xa72));
        }, 0x0),
        kl[yq(0xd58)](rB);
    }
    var mh = document[uf(0xa10)](uf(0xd75));
    document[uf(0xa10)](uf(0x34e))[uf(0xc3)] = ng(function (rs) {
      const yv = uf,
        rt = mh[yv(0x94c)][yv(0x11a)]();
      nf(rt);
    });
    function mi(rs) {
      const yw = uf,
        rt = new Uint8Array([
          cI[yw(0x64a)],
          ...new TextEncoder()[yw(0x6a7)](rs),
        ]);
      il(rt);
    }
    var mj = document[uf(0xa10)](uf(0xd0b)),
      mk = document[uf(0xa10)](uf(0x436)),
      ml = mk[uf(0xa10)](uf(0x109)),
      mm = 0x0,
      mn = 0x0;
    setInterval(function () {
      const yx = uf;
      hW &&
        (pz - mn > 0x7530 &&
          mj[yx(0x474)][yx(0xdb3)](yx(0x9b3)) &&
          (il(new Uint8Array([cI[yx(0x70a)]])), (mn = pz)),
        pz - mm > 0xea60 &&
          mk[yx(0x474)][yx(0xdb3)](yx(0x9b3)) &&
          (il(new Uint8Array([cI[yx(0xaaa)]])), (mm = pz)));
    }, 0x3e8);
    var mo = ![];
    function mp(rs) {
      const yy = uf;
      for (let rt in m1) {
        if (rs === rt) continue;
        m1[rt][yy(0x41b)]();
      }
      mo = ![];
    }
    window[uf(0xc3)] = function (rs) {
      const yz = uf;
      if ([kk, kn, ki][yz(0x20a)](rs[yz(0x10b)])) mp();
    };
    function mq() {
      const yA = uf;
      iy && !oV[yA(0xd32)] && im(0x0, 0x0);
    }
    function mr(rs, rt, ru, rv) {
      const yB = uf,
        rw = document[yB(0xa10)](rt),
        rx = rw[yB(0xa10)](yB(0x109)),
        ry = document[yB(0xa10)](rs);
      let rz = null,
        rA = rw[yB(0xa10)](yB(0xad9));
      rA &&
        (rA[yB(0xc3)] = function () {
          const yC = yB;
          rw[yC(0x474)][yC(0x410)](yC(0x824));
        });
      (rx[yB(0x397)][yB(0x373)] = yB(0x972)),
        rw[yB(0x474)][yB(0xa5a)](yB(0x9b3)),
        (ry[yB(0xc3)] = function () {
          const yD = yB;
          rB[yD(0x410)]();
        }),
        (rw[yB(0xa10)](yB(0x99d))[yB(0xc3)] = function () {
          mp();
        });
      const rB = [ry, rw];
      (rB[yB(0x41b)] = function () {
        const yE = yB;
        ry[yE(0x474)][yE(0xa5a)](yE(0x359)),
          rw[yE(0x474)][yE(0xa5a)](yE(0x9b3)),
          !rz &&
            (rz = setTimeout(function () {
              const yF = yE;
              (rx[yF(0x397)][yF(0x373)] = yF(0x972)), (rz = null);
            }, 0x3e8));
      }),
        (rB[yB(0x410)] = function () {
          const yG = yB;
          mp(ru),
            rw[yG(0x474)][yG(0xdb3)](yG(0x9b3))
              ? rB[yG(0x41b)]()
              : rB[yG(0x9b3)]();
        }),
        (rB[yB(0x9b3)] = function () {
          const yH = yB;
          rv && rv(),
            clearTimeout(rz),
            (rz = null),
            (rx[yH(0x397)][yH(0x373)] = ""),
            ry[yH(0x474)][yH(0x1b0)](yH(0x359)),
            rw[yH(0x474)][yH(0x1b0)](yH(0x9b3)),
            (mo = !![]),
            mq();
        }),
        (m1[ru] = rB);
    }
    var ms = [],
      mt,
      mu = 0x0,
      mv = ![],
      mw = document[uf(0xa10)](uf(0x4d6)),
      mz = {
        tagName: uf(0x7b7),
        getBoundingClientRect() {
          const yI = uf,
            rs = mw[yI(0x7fc)](),
            rt = {};
          return (
            (rt["x"] = rs["x"] + rs[yI(0x766)] / 0x2),
            (rt["y"] = rs["y"] + rs[yI(0x3bb)] / 0x2),
            rt
          );
        },
        appendChild(rs) {
          const yJ = uf;
          rs[yJ(0xa5a)]();
        },
      };
    function mA(rs) {
      const yK = uf;
      if (!hW) return;
      const rt = rs[yK(0x10b)];
      if (rt[yK(0x864)]) mt = mU(rt, rs);
      else {
        if (rt[yK(0xd66)]) {
          mp();
          const ru = rt[yK(0xcc9)]();
          (ru[yK(0xbca)] = rt[yK(0xbca)]),
            nz(ru, rt[yK(0xbca)]),
            (ru[yK(0xa0c)] = 0x1),
            (ru[yK(0xd66)] = !![]),
            (ru[yK(0x908)] = mz),
            ru[yK(0x474)][yK(0x1b0)](yK(0xc43));
          const rv = rt[yK(0x7fc)]();
          (ru[yK(0x397)][yK(0x502)] = rv["x"] / kR + "px"),
            (ru[yK(0x397)][yK(0x765)] = rv["y"] / kR + "px"),
            kH[yK(0xd58)](ru),
            (mt = mU(ru, rs)),
            (mu = 0x0),
            (mo = !![]);
        } else return ![];
      }
      return (mu = Date[yK(0x603)]()), (mv = !![]), !![];
    }
    function mB(rs) {
      const yL = uf;
      for (let rt = 0x0; rt < rs[yL(0x8c1)][yL(0xbc8)]; rt++) {
        const ru = rs[yL(0x8c1)][rt];
        if (ru[yL(0x474)][yL(0xdb3)](yL(0xbca)) && !mT(ru)) return ru;
      }
    }
    function mC() {
      const yM = uf;
      if (mt) {
        if (mv && Date[yM(0x603)]() - mu < 0x1f4) {
          if (mt[yM(0x864)]) {
            const rs = mt[yM(0xa12)][yM(0xd36)];
            mt[yM(0x314)](
              rs >= iN ? nk[yM(0x8c1)][rs - iN + 0x1] : nl[yM(0x8c1)][rs]
            );
          } else {
            if (mt[yM(0xd66)]) {
              let rt = mB(nk) || mB(nl);
              rt && mt[yM(0x314)](rt);
            }
          }
        }
        mt[yM(0x90a)]();
        if (mt[yM(0xd66)]) {
          (mt[yM(0xd66)] = ![]),
            (mt[yM(0x864)] = !![]),
            m1[yM(0x5a8)][yM(0x9b3)]();
          if (mt[yM(0x908)] !== mz) {
            const ru = mt[yM(0x4dd)];
            ru
              ? ((mt[yM(0x5d1)] = ru[yM(0x5d1)]), mQ(ru[yM(0xbca)]["id"], 0x1))
              : (mt[yM(0x5d1)] = iR[yM(0x565)]());
            (iQ[mt[yM(0x5d1)]] = mt), mQ(mt[yM(0xbca)]["id"], -0x1);
            const rv = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rv[yM(0x227)](0x0, cI[yM(0x691)]),
              rv[yM(0x4b7)](0x1, mt[yM(0xbca)]["id"]),
              rv[yM(0x227)](0x3, mt[yM(0x908)][yM(0xd36)]),
              il(rv);
          }
        } else
          mt[yM(0x908)] === mz
            ? (iR[yM(0x6aa)](mt[yM(0x5d1)]),
              mQ(mt[yM(0xbca)]["id"], 0x1),
              il(new Uint8Array([cI[yM(0x9c7)], mt[yM(0xa12)][yM(0xd36)]])))
            : mS(mt[yM(0xa12)][yM(0xd36)], mt[yM(0x908)][yM(0xd36)]);
        mt = null;
      }
    }
    function mD(rs) {
      const yN = uf;
      mt && (mt[yN(0x384)](rs), (mv = ![]));
    }
    var mE = document[uf(0xa10)](uf(0x7a6));
    function mF() {
      const yO = uf;
      mE[yO(0x397)][yO(0x373)] = yO(0x972);
      const rs = mE[yO(0xa10)](yO(0x751));
      let rt,
        ru,
        rv = null;
      (mE[yO(0xcb2)] = function (rx) {
        const yP = yO;
        rv === null &&
          ((rs[yP(0x397)][yP(0x766)] = rs[yP(0x397)][yP(0x99f)] = "0"),
          (mE[yP(0x397)][yP(0x373)] = ""),
          ([rt, ru] = mG(rx)),
          rw(),
          (rv = rx[yP(0x2fd)]));
      }),
        (mE[yO(0x8ca)] = function (rx) {
          const yQ = yO;
          if (rx[yQ(0x2fd)] === rv) {
            const [ry, rz] = mG(rx),
              rA = ry - rt,
              rB = rz - ru,
              rC = mE[yQ(0x7fc)]();
            let rD = Math[yQ(0x4b2)](rA, rB);
            const rE = rC[yQ(0x766)] / 0x2 / kR;
            rD > rE && (rD = rE);
            const rF = Math[yQ(0xbaa)](rB, rA);
            return (
              (rs[yQ(0x397)][yQ(0x99f)] = yQ(0x714) + rF + yQ(0x935)),
              (rs[yQ(0x397)][yQ(0x766)] = rD + "px"),
              im(rF, rD / rE),
              !![]
            );
          }
        }),
        (mE[yO(0x7d4)] = function (rx) {
          const yR = yO;
          rx[yR(0x2fd)] === rv &&
            ((mE[yR(0x397)][yR(0x373)] = yR(0x972)), (rv = null), im(0x0, 0x0));
        });
      function rw() {
        const yS = yO;
        (mE[yS(0x397)][yS(0x502)] = rt + "px"),
          (mE[yS(0x397)][yS(0x765)] = ru + "px");
      }
    }
    mF();
    function mG(rs) {
      const yT = uf;
      return [rs[yT(0x4c1)] / kR, rs[yT(0x8a1)] / kR];
    }
    var mH = document[uf(0xa10)](uf(0xb94)),
      mI = document[uf(0xa10)](uf(0x23f)),
      mJ = document[uf(0xa10)](uf(0x469)),
      mK = {},
      mL = {};
    if (kL) {
      document[uf(0x53e)][uf(0x474)][uf(0x1b0)](uf(0x134)),
        (window[uf(0x78b)] = function (rt) {
          const yU = uf;
          for (let ru = 0x0; ru < rt[yU(0x771)][yU(0xbc8)]; ru++) {
            const rv = rt[yU(0x771)][ru],
              rw = rv[yU(0x10b)];
            if (rw === ki) {
              mE[yU(0xcb2)](rv);
              continue;
            } else {
              if (rw === mI)
                pa(yU(0x6f6), !![]),
                  (mK[rv[yU(0x2fd)]] = function () {
                    const yV = yU;
                    pa(yV(0x6f6), ![]);
                  });
              else {
                if (rw === mH)
                  pa(yU(0x3bc), !![]),
                    (mK[rv[yU(0x2fd)]] = function () {
                      const yW = yU;
                      pa(yW(0x3bc), ![]);
                    });
                else
                  rw === mJ &&
                    (pa(yU(0x94b), !![]),
                    (mK[rv[yU(0x2fd)]] = function () {
                      const yX = yU;
                      pa(yX(0x94b), ![]);
                    }));
              }
            }
            if (mt) continue;
            if (rw[yU(0xbca)]) {
              const rx = mO(rw);
              mA(rv),
                mt && (mL[rv[yU(0x2fd)]] = mD),
                (mK[rv[yU(0x2fd)]] = function () {
                  const yY = yU;
                  mt && mC(), (rx[yY(0xe6)] = ![]);
                });
            }
          }
        });
      const rs = {};
      (rs[uf(0x112)] = ![]),
        document[uf(0x114)](
          uf(0x6b9),
          function (rt) {
            const yZ = uf;
            for (let ru = 0x0; ru < rt[yZ(0x771)][yZ(0xbc8)]; ru++) {
              const rv = rt[yZ(0x771)][ru];
              mE[yZ(0x8ca)](rv) && rt[yZ(0x15b)]();
              if (mL[rv[yZ(0x2fd)]]) mL[rv[yZ(0x2fd)]](rv), rt[yZ(0x15b)]();
              else mt && rt[yZ(0x15b)]();
            }
          },
          rs
        ),
        (window[uf(0xac5)] = function (rt) {
          const z0 = uf;
          for (let ru = 0x0; ru < rt[z0(0x771)][z0(0xbc8)]; ru++) {
            const rv = rt[z0(0x771)][ru];
            mE[z0(0x7d4)](rv),
              mK[rv[z0(0x2fd)]] &&
                (mK[rv[z0(0x2fd)]](),
                delete mK[rv[z0(0x2fd)]],
                delete mL[rv[z0(0x2fd)]]);
          }
        });
    } else {
      document[uf(0x53e)][uf(0x474)][uf(0x1b0)](uf(0x84b));
      let rt = ![];
      (window[uf(0xdad)] = function (ru) {
        const z1 = uf;
        ru[z1(0xb65)] === 0x0 && ((rt = !![]), mA(ru));
      }),
        (document[uf(0x8fc)] = function (ru) {
          const z2 = uf;
          mD(ru);
          const rv = ru[z2(0x10b)];
          if (rv[z2(0xbca)] && !rt) {
            const rw = mO(rv);
            rv[z2(0x149)] = rv[z2(0xdad)] = function () {
              const z3 = z2;
              rw[z3(0xe6)] = ![];
            };
          }
        }),
        (document[uf(0x847)] = function (ru) {
          const z4 = uf;
          ru[z4(0xb65)] === 0x0 && ((rt = ![]), mC());
        }),
        (km[uf(0x8fc)] = ki[uf(0x8fc)] =
          function (ru) {
            const z5 = uf;
            (mY = ru[z5(0x4c1)] - kU() / 0x2),
              (mZ = ru[z5(0x8a1)] - kV() / 0x2);
            if (!oV[z5(0xd32)] && iy && !mo) {
              const rv = Math[z5(0x4b2)](mY, mZ),
                rw = Math[z5(0xbaa)](mZ, mY);
              im(rw, rv < 0x32 ? rv / 0x64 : 0x1);
            }
          });
    }
    function mM(ru, rv, rw) {
      const z6 = uf;
      return Math[z6(0x411)](rv, Math[z6(0xc0c)](ru, rw));
    }
    var mN = [];
    function mO(ru) {
      const z7 = uf;
      let rv = mN[z7(0xd16)]((rw) => rw["el"] === ru);
      if (rv) return (rv[z7(0xe6)] = !![]), rv;
      (rv =
        typeof ru[z7(0xbca)] === z7(0xaf4)
          ? ru[z7(0xbca)]()
          : nu(ru[z7(0xbca)], ru[z7(0xdc2)])),
        (rv[z7(0xe6)] = !![]),
        (rv[z7(0x98c)] = 0x0),
        (rv[z7(0x397)][z7(0x895)] = z7(0xce5)),
        (rv[z7(0x397)][z7(0x99f)] = z7(0x972)),
        kH[z7(0xd58)](rv);
      if (kL)
        (rv[z7(0x397)][z7(0xcc)] = z7(0xb21)),
          (rv[z7(0x397)][z7(0x765)] = z7(0xb21)),
          (rv[z7(0x397)][z7(0x3f3)] = z7(0xd81)),
          (rv[z7(0x397)][z7(0x502)] = z7(0xd81));
      else {
        const rw = ru[z7(0x7fc)](),
          rx = rv[z7(0x7fc)]();
        (rv[z7(0x397)][z7(0x765)] =
          mM(
            ru[z7(0xc6b)]
              ? (rw[z7(0x765)] + rw[z7(0x3bb)]) / kR + 0xa
              : (rw[z7(0x765)] - rx[z7(0x3bb)]) / kR - 0xa,
            0xa,
            window[z7(0x35a)] / kR - 0xa
          ) + "px"),
          (rv[z7(0x397)][z7(0x502)] =
            mM(
              (rw[z7(0x502)] + rw[z7(0x766)] / 0x2 - rx[z7(0x766)] / 0x2) / kR,
              0xa,
              window[z7(0x492)] / kR - 0xa - rx[z7(0x766)] / kR
            ) + "px"),
          (rv[z7(0x397)][z7(0x3f3)] = z7(0xd81)),
          (rv[z7(0x397)][z7(0xcc)] = z7(0xd81));
      }
      return (
        (rv[z7(0x397)][z7(0xc74)] = z7(0x972)),
        (rv[z7(0x397)][z7(0x894)] = 0x0),
        (rv["el"] = ru),
        mN[z7(0x6aa)](rv),
        rv
      );
    }
    var mP = document[uf(0xa10)](uf(0x9b0));
    function mQ(ru, rv = 0x1) {
      const z8 = uf;
      !iS[ru] && ((iS[ru] = 0x0), oU(ru), nW()),
        (iS[ru] += rv),
        nU[ru][z8(0xfe)](iS[ru]),
        iS[ru] <= 0x0 && (delete iS[ru], nU[ru][z8(0x4b8)](), nW()),
        mR();
    }
    function mR() {
      const z9 = uf;
      mP[z9(0xd6e)] = "";
      Object[z9(0x8d3)](iS)[z9(0xbc8)] === 0x0
        ? (mP[z9(0x397)][z9(0x373)] = z9(0x972))
        : (mP[z9(0x397)][z9(0x373)] = "");
      const ru = {};
      for (const rv in iS) {
        const rw = dC[rv],
          rx = iS[rv];
        ru[rw[z9(0xcce)]] = (ru[rw[z9(0xcce)]] || 0x0) + rx;
      }
      oo(mP, ru);
      for (const ry in oa) {
        const rz = oa[ry];
        rz[z9(0x474)][ru[ry] ? z9(0xa5a) : z9(0x1b0)](z9(0x9af));
      }
    }
    function mS(ru, rv) {
      const za = uf;
      if (ru === rv) return;
      il(new Uint8Array([cI[za(0x40d)], ru, rv]));
    }
    function mT(ru) {
      const zb = uf;
      return ru[zb(0x826)] || ru[zb(0xa10)](zb(0x679));
    }
    function mU(ru, rv, rw = !![]) {
      const zc = uf,
        rx = ms[zc(0xd16)]((rH) => rH === ru);
      if (rx) return rx[zc(0x9cf)](rv), rx;
      let ry,
        rz,
        rA,
        rB,
        rC = 0x0,
        rD = 0x0,
        rE = 0x0,
        rF;
      (ru[zc(0x9cf)] = function (rH, rI) {
        const zd = zc;
        (rF = ru[zd(0x908)] || ru[zd(0x773)]),
          (rF[zd(0x826)] = ru),
          (ru[zd(0xa12)] = rF),
          (ru[zd(0x87f)] = ![]),
          (ru[zd(0x52c)] = ![]);
        const rJ = ru[zd(0x7fc)]();
        rH[zd(0x8d6)] === void 0x0
          ? ((rC = rH[zd(0x4c1)] - rJ["x"]),
            (rD = rH[zd(0x8a1)] - rJ["y"]),
            ru[zd(0x384)](rH),
            (ry = rA),
            (rz = rB))
          : ((ry = rJ["x"]),
            (rz = rJ["y"]),
            ru[zd(0x314)](rH),
            ru[zd(0x90a)](rI)),
          rG();
      }),
        (ru[zc(0x90a)] = function (rH = !![]) {
          const ze = zc;
          ru[ze(0x52c)] = !![];
          rF[ze(0x826)] === ru && (rF[ze(0x826)] = null);
          if (!ru[ze(0x908)])
            ru[ze(0x314)](rF),
              Math[ze(0x4b2)](rA - ry, rB - rz) > 0x32 * kR &&
                ru[ze(0x314)](mz);
          else {
            if (rH) {
              const rI = mT(ru[ze(0x908)]);
              (ru[ze(0x4dd)] = rI), rI && mU(rI, rF, ![]);
            }
          }
          ru[ze(0x908)] !== rF && (ru[ze(0xa0c)] = 0x0),
            (ru[ze(0x908)][ze(0x826)] = ru);
        }),
        (ru[zc(0x314)] = function (rH) {
          const zf = zc;
          ru[zf(0x908)] = rH;
          const rI = rH[zf(0x7fc)]();
          (rA = rI["x"]),
            (rB = rI["y"]),
            (ru[zf(0x397)][zf(0xa75)] =
              rH === mz ? zf(0x424) : getComputedStyle(rH)[zf(0xa75)]);
        }),
        (ru[zc(0x384)] = function (rH) {
          const zg = zc;
          (rA = rH[zg(0x4c1)] - rC),
            (rB = rH[zg(0x8a1)] - rD),
            (ru[zg(0x908)] = null);
          let rI = Infinity,
            rJ = null;
          const rK = ko[zg(0x5fc)](zg(0x819));
          for (let rL = 0x0; rL < rK[zg(0xbc8)]; rL++) {
            const rM = rK[rL],
              rN = rM[zg(0x7fc)](),
              rO = Math[zg(0x4b2)](
                rN["x"] + rN[zg(0x766)] / 0x2 - rH[zg(0x4c1)],
                rN["y"] + rN[zg(0x3bb)] / 0x2 - rH[zg(0x8a1)]
              );
            rO < 0x1e * kR && rO < rI && ((rJ = rM), (rI = rO));
          }
          rJ && rJ !== rF && ru[zg(0x314)](rJ);
        }),
        ru[zc(0x9cf)](rv, rw),
        ru[zc(0x474)][zc(0x1b0)](zc(0xc43)),
        kH[zc(0xd58)](ru);
      function rG() {
        const zh = zc;
        (ru[zh(0x397)][zh(0x502)] = ry / kR + "px"),
          (ru[zh(0x397)][zh(0x765)] = rz / kR + "px");
      }
      return (
        (ru[zc(0xb86)] = function () {
          const zi = zc;
          ru[zi(0x908)] && ru[zi(0x314)](ru[zi(0x908)]);
        }),
        (ru[zc(0x8ee)] = function () {
          const zj = zc;
          (ry = pg(ry, rA, 0x64)), (rz = pg(rz, rB, 0x64)), rG();
          let rH = 0x0,
            rI = Infinity;
          ru[zj(0x908)]
            ? ((rI = Math[zj(0x4b2)](rA - ry, rB - rz)),
              (rH = rI > 0x5 ? 0x1 : 0x0))
            : (rH = 0x1),
            (rE = pg(rE, rH, 0x64)),
            (ru[zj(0x397)][zj(0x99f)] =
              zj(0xb06) +
              (0x1 + 0.3 * rE) +
              zj(0x1f6) +
              rE * Math[zj(0x7f1)](Date[zj(0x603)]() / 0x96) * 0xa +
              zj(0xf5)),
            ru[zj(0x52c)] &&
              rE < 0.05 &&
              rI < 0x5 &&
              (ru[zj(0x474)][zj(0xa5a)](zj(0xc43)),
              (ru[zj(0x397)][zj(0x502)] =
                ru[zj(0x397)][zj(0x765)] =
                ru[zj(0x397)][zj(0x99f)] =
                ru[zj(0x397)][zj(0xa75)] =
                ru[zj(0x397)][zj(0x67a)] =
                  ""),
              (ru[zj(0x87f)] = !![]),
              ru[zj(0x908)][zj(0xd58)](ru),
              (ru[zj(0x908)][zj(0x826)] = null),
              (ru[zj(0x908)] = null));
        }),
        ms[zc(0x6aa)](ru),
        ru
      );
    }
    var mV = cY[uf(0x4b0)];
    document[uf(0x9dd)] = function () {
      return ![];
    };
    var mW = 0x0,
      mX = 0x0,
      mY = 0x0,
      mZ = 0x0,
      n0 = 0x1,
      n1 = 0x1;
    document[uf(0x865)] = function (ru) {
      const zk = uf;
      ru[zk(0x10b)] === ki &&
        ((n0 *= ru[zk(0x7f2)] < 0x0 ? 1.1 : 0.9),
        (n0 = Math[zk(0xc0c)](0x3, Math[zk(0x411)](0x1, n0))));
    };
    const n2 = {};
    (n2[uf(0xcd4)] = uf(0x8a6)),
      (n2["me"] = uf(0x89b)),
      (n2[uf(0x126)] = uf(0x84c));
    var n3 = n2,
      n4 = {};
    function n5(ru, rv) {
      n6(ru, null, null, null, jx(rv));
    }
    function n6(ru, rv, rw, rx = n3[uf(0xcd4)], ry) {
      const zl = uf,
        rz = nA(zl(0x6f0));
      if (!ry) {
        if (rv) {
          const rB = nA(zl(0xb60));
          k8(rB, rv + ":"), rz[zl(0xd58)](rB);
        }
        const rA = nA(zl(0x3ad));
        k8(rA, rw),
          rz[zl(0xd58)](rA),
          (rz[zl(0x8c1)][0x0][zl(0x397)][zl(0x9da)] = rx),
          rv && rz[zl(0x215)](nA(zl(0x8ab)));
      } else rz[zl(0xd6e)] = ry;
      p3[zl(0xd58)](rz);
      while (p3[zl(0x8c1)][zl(0xbc8)] > 0x3c) {
        p3[zl(0x8c1)][0x0][zl(0xa5a)]();
      }
      return (
        (p3[zl(0xba8)] = p3[zl(0x73b)]),
        (rz[zl(0x1c8)] = rw),
        (rz[zl(0xd85)] = rx),
        n7(ru, rz),
        rz
      );
    }
    function n7(ru, rv) {
      const zm = uf;
      (rv["t"] = 0x0), (rv[zm(0xc18)] = 0x0);
      if (!n4[ru]) n4[ru] = [];
      n4[ru][zm(0x6aa)](rv);
    }
    var n8 = {};
    ki[uf(0xdad)] = window[uf(0x847)] = ng(function (ru) {
      const zn = uf,
        rv = zn(0x888) + ru[zn(0xb65)];
      pa(rv, ru[zn(0x511)] === zn(0xd7a));
    });
    var n9 = 0x0;
    function na(ru) {
      const zo = uf,
        rv = 0x200,
        rw = rv / 0x64,
        rx = document[zo(0x966)](zo(0x606));
      rx[zo(0x766)] = rx[zo(0x3bb)] = rv;
      const ry = rx[zo(0xb87)]("2d");
      ry[zo(0xb25)](rv / 0x2, rv / 0x2), ry[zo(0x5b0)](rw), ru[zo(0xd89)](ry);
      const rz = (ru[zo(0xd19)] ? zo(0xd6a) : zo(0x321)) + ru[zo(0xaba)];
      nb(rx, rz);
    }
    function nb(ru, rv) {
      const zp = uf,
        rw = document[zp(0x966)]("a");
      (rw[zp(0x2cb)] = rv),
        (rw[zp(0xa08)] = typeof ru === zp(0x4b9) ? ru : ru[zp(0x11e)]()),
        rw[zp(0x6ad)](),
        hK(rv + zp(0xd74), hP[zp(0x970)]);
    }
    var nc = 0x0;
    setInterval(function () {
      nc = 0x0;
    }, 0x1770),
      setInterval(function () {
        const zq = uf;
        nh[zq(0xbc8)] = 0x0;
      }, 0x2710);
    var nd = ![],
      ne = ![];
    function nf(ru) {
      const zr = uf;
      ru = ru[zr(0x11a)]();
      if (!ru) hK(zr(0x5f5)), hc(zr(0x5f5));
      else
        ru[zr(0xbc8)] < cN || ru[zr(0xbc8)] > cM
          ? (hK(zr(0x6ee)), hc(zr(0x6ee)))
          : (hK(zr(0xc52) + ru + zr(0x165), hP[zr(0x409)]),
            hc(zr(0xc52) + ru + zr(0x165)),
            mi(ru));
    }
    document[uf(0xcdc)] = document[uf(0x157)] = ng(function (ru) {
      const zs = uf;
      ru[zs(0x272)] && ru[zs(0x15b)]();
      (nd = ru[zs(0x272)]), (ne = ru[zs(0x1c3)]);
      if (ru[zs(0x7ee)] === 0x9) {
        ru[zs(0x15b)]();
        return;
      }
      if (document[zs(0xcd)] && document[zs(0xcd)][zs(0x8d6)] === zs(0xd46)) {
        if (ru[zs(0x511)] === zs(0x9e7) && ru[zs(0x7ee)] === 0xd) {
          if (document[zs(0xcd)] === hF) hG[zs(0x6ad)]();
          else {
            if (document[zs(0xcd)] === p2) {
              let rv = p2[zs(0x94c)][zs(0x11a)]()[zs(0x4e2)](0x0, cL);
              if (rv && hW) {
                if (pz - n9 > 0x3e8) {
                  const rw = rv[zs(0xb93)](zs(0x597));
                  if (rw || rv[zs(0xb93)](zs(0x308))) {
                    const rx = rv[zs(0x4e2)](rw ? 0x7 : 0x9);
                    if (!rx) hK(zs(0x718));
                    else {
                      if (rw) {
                        const ry = eM[rx];
                        !ry ? hK(zs(0xd11) + rx + "!") : na(ry);
                      } else {
                        const rz = dF[rx];
                        !rz ? hK(zs(0x3de) + rx + "!") : na(rz);
                      }
                    }
                  } else {
                    if (rv[zs(0xb93)](zs(0x2bd))) nb(qh, zs(0x2d6));
                    else {
                        var inputChat = rv;
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
                        }else if (rv[zs(0xb93)](zs(0xc9e))) {
                        const rA = rv[zs(0x4e2)](0x9);
                        nf(rA);
                      } else {
                        hack.speak = (txt) => {
                          let rB = 0x0;
                          for (let rC = 0x0; rC < nh[zs(0xbc8)]; rC++) {
                            ni(txt, nh[rC]) > 0.95 && rB++;
                          }
                          rB >= 0x3 && (nc += 0xa);
                          nc++;
                          if (nc > 0x3) hK(zs(0x9b9)), (n9 = pz + 0xea60);
                          else {
                            nh[zs(0x6aa)](txt);
                            if (nh[zs(0xbc8)] > 0xa) nh[zs(0x6f7)]();
                            (txt = decodeURIComponent(
                              encodeURIComponent(txt)
                                [zs(0x516)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                                [zs(0x516)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                            )),
                              il(
                                new Uint8Array([
                                  cI[zs(0x480)],
                                  ...new TextEncoder()[zs(0x6a7)](txt),
                                ])
                              ),
                              (n9 = pz);
                          }
                        };
                        hack.speak(inputChat)
                      }
                    }
                  }
                } else n6(-0x1, null, zs(0x251), n3[zs(0x126)]);
              }
              (p2[zs(0x94c)] = ""), p2[zs(0xda9)]();
            }
          }
        }
        return;
      }
      pa(ru[zs(0x699)], ru[zs(0x511)] === zs(0x616));
    });
    function ng(ru) {
      return function (rv) {
        const zt = b;
        rv instanceof Event && rv[zt(0x475)] && !rv[zt(0x462)] && ru(rv);
      };
    }
    var nh = [];
    function ni(ru, rv) {
      const zu = uf;
      var rw = ru,
        rx = rv;
      ru[zu(0xbc8)] < rv[zu(0xbc8)] && ((rw = rv), (rx = ru));
      var ry = rw[zu(0xbc8)];
      if (ry == 0x0) return 0x1;
      return (ry - nj(rw, rx)) / parseFloat(ry);
    }
    function nj(ru, rv) {
      const zv = uf;
      (ru = ru[zv(0x682)]()), (rv = rv[zv(0x682)]());
      var rw = new Array();
      for (var rx = 0x0; rx <= ru[zv(0xbc8)]; rx++) {
        var ry = rx;
        for (var rz = 0x0; rz <= rv[zv(0xbc8)]; rz++) {
          if (rx == 0x0) rw[rz] = rz;
          else {
            if (rz > 0x0) {
              var rA = rw[rz - 0x1];
              if (ru[zv(0xc13)](rx - 0x1) != rv[zv(0xc13)](rz - 0x1))
                rA = Math[zv(0xc0c)](Math[zv(0xc0c)](rA, ry), rw[rz]) + 0x1;
              (rw[rz - 0x1] = ry), (ry = rA);
            }
          }
        }
        if (rx > 0x0) rw[rv[zv(0xbc8)]] = ry;
      }
      return rw[rv[zv(0xbc8)]];
    }
    var nk = document[uf(0xa10)](uf(0x75f)),
      nl = document[uf(0xa10)](uf(0x960));
    function nm(ru, rv = 0x1) {
      const zw = uf;
      ru[zw(0xa26)](),
        ru[zw(0x6ff)](0.25 * rv, 0.25 * rv),
        ru[zw(0xb25)](-0x4b, -0x4b),
        ru[zw(0x787)](),
        ru[zw(0x92d)](0x4b, 0x28),
        ru[zw(0x9f1)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        ru[zw(0x9f1)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        ru[zw(0x9f1)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        ru[zw(0x9f1)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        ru[zw(0x9f1)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        ru[zw(0x9f1)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (ru[zw(0x716)] = zw(0xc4)),
        ru[zw(0x190)](),
        (ru[zw(0x70b)] = ru[zw(0x625)] = zw(0xac6)),
        (ru[zw(0xfb)] = zw(0x19a)),
        (ru[zw(0x6b1)] = 0xc),
        ru[zw(0x6f2)](),
        ru[zw(0x20f)]();
    }
    for (let ru = 0x0; ru < dC[uf(0xbc8)]; ru++) {
      const rv = dC[ru];
      if (rv[uf(0x81d)] !== void 0x0)
        switch (rv[uf(0x81d)]) {
          case df[uf(0x56c)]:
            rv[uf(0xd89)] = function (rw) {
              const zx = uf;
              rw[zx(0x6ff)](2.5, 2.5), lO(rw);
            };
            break;
          case df[uf(0xc2a)]:
            rv[uf(0xd89)] = function (rw) {
              const zy = uf;
              rw[zy(0x5b0)](0.9);
              const rx = pF();
              (rx[zy(0xcdf)] = !![]), rx[zy(0x7e5)](rw);
            };
            break;
          case df[uf(0x61f)]:
            rv[uf(0xd89)] = function (rw) {
              const zz = uf;
              rw[zz(0x710)](-Math["PI"] / 0x2),
                rw[zz(0xb25)](-0x30, 0x0),
                pE[zz(0xcf9)](rw, ![]);
            };
            break;
          case df[uf(0x3ee)]:
            rv[uf(0xd89)] = function (rw) {
              const zA = uf;
              rw[zA(0x710)](Math["PI"] / 0xa),
                rw[zA(0xb25)](0x3, 0x15),
                lP(rw, !![]);
            };
            break;
          case df[uf(0xbdf)]:
            rv[uf(0xd89)] = function (rw) {
              nm(rw);
            };
            break;
          case df[uf(0x838)]:
            rv[uf(0xd89)] = function (rw) {
              const zB = uf;
              rw[zB(0xb25)](0x0, 0x3),
                rw[zB(0x710)](-Math["PI"] / 0x4),
                rw[zB(0x5b0)](0.4),
                pE[zB(0x8a8)](rw),
                rw[zB(0x787)](),
                rw[zB(0x769)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rw[zB(0x6b1)] = 0x8),
                (rw[zB(0xfb)] = zB(0x69c)),
                rw[zB(0x6f2)]();
            };
            break;
          case df[uf(0x5c7)]:
            rv[uf(0xd89)] = function (rw) {
              const zC = uf;
              rw[zC(0xb25)](0x0, 0x7),
                rw[zC(0x5b0)](0.8),
                pE[zC(0x3fe)](rw, 0.5);
            };
            break;
          case df[uf(0xb3a)]:
            rv[uf(0xd89)] = function (rw) {
              const zD = uf;
              rw[zD(0x5b0)](1.3), lS(rw);
            };
            break;
          default:
            rv[uf(0xd89)] = function (rw) {};
        }
      else {
        const rw = new lG(
          -0x1,
          rv[uf(0x511)],
          0x0,
          0x0,
          rv[uf(0x88e)],
          rv[uf(0xb20)] ? 0x10 : rv[uf(0x58f)] * 1.1,
          0x0
        );
        (rw[uf(0x6b5)] = !![]),
          rv[uf(0xcca)] === 0x1
            ? (rv[uf(0xd89)] = function (rx) {
                const zE = uf;
                rw[zE(0x7e5)](rx);
              })
            : (rv[uf(0xd89)] = function (rx) {
                const zF = uf;
                for (let ry = 0x0; ry < rv[zF(0xcca)]; ry++) {
                  rx[zF(0xa26)]();
                  const rz = (ry / rv[zF(0xcca)]) * Math["PI"] * 0x2;
                  rv[zF(0xc21)]
                    ? rx[zF(0xb25)](...le(rv[zF(0x232)], 0x0, rz))
                    : (rx[zF(0x710)](rz), rx[zF(0xb25)](rv[zF(0x232)], 0x0)),
                    rx[zF(0x710)](rv[zF(0x4a5)]),
                    rw[zF(0x7e5)](rx),
                    rx[zF(0x20f)]();
                }
              });
      }
    }
    const nn = {};
    (nn[uf(0x79a)] = uf(0x797)),
      (nn[uf(0x99b)] = uf(0x823)),
      (nn[uf(0x6b0)] = uf(0x604)),
      (nn[uf(0xb0d)] = uf(0x5ca)),
      (nn[uf(0x229)] = uf(0x107)),
      (nn[uf(0x9d7)] = uf(0xcc8)),
      (nn[uf(0xc1)] = uf(0x21d));
    var no = nn;
    function np() {
      const zG = uf,
        rx = document[zG(0xa10)](zG(0x33d));
      let ry = zG(0x43b);
      for (let rz = 0x0; rz < 0xc8; rz++) {
        const rA = d6(rz),
          rB = 0xc8 * rA,
          rC = 0x19 * rA,
          rD = d5(rz);
        ry +=
          zG(0xf4) +
          (rz + 0x1) +
          zG(0x695) +
          k9(Math[zG(0xac6)](rB)) +
          zG(0x695) +
          k9(Math[zG(0xac6)](rC)) +
          zG(0x695) +
          rD +
          zG(0xa6c);
      }
      (ry += zG(0x56e)), (ry += zG(0x61a)), (rx[zG(0xd6e)] = ry);
    }
    np();
    function nq(rx, ry) {
      const zH = uf,
        rz = eM[rx],
        rA = rz[zH(0xaba)],
        rB = rz[zH(0xcce)];
      return (
        "x" +
        ry[zH(0xcca)] * ry[zH(0x7b1)] +
        ("\x20" + rA + zH(0x148) + hQ[rB] + zH(0x3fc) + hN[rB] + ")")
      );
    }
    function nr(rx) {
      const zI = uf;
      return rx[zI(0xac4)](0x2)[zI(0x516)](/\.?0+$/, "");
    }
    var ns = [
        [uf(0x1d8), uf(0xa6d), no[uf(0x79a)]],
        [uf(0x238), uf(0x246), no[uf(0x99b)]],
        [uf(0xbfd), uf(0xd5d), no[uf(0x6b0)]],
        [uf(0x3b1), uf(0xbc3), no[uf(0xb0d)]],
        [uf(0x7e9), uf(0x4a3), no[uf(0x9d7)]],
        [uf(0xb29), uf(0xa92), no[uf(0x229)]],
        [uf(0x801), uf(0x580), no[uf(0xc1)]],
        [uf(0x8bb), uf(0x439), no[uf(0xc1)], (rx) => "+" + k9(rx)],
        [uf(0xcd5), uf(0x529), no[uf(0xc1)], (rx) => "+" + k9(rx)],
        [uf(0x1f3), uf(0x430), no[uf(0xc1)]],
        [
          uf(0xdac),
          uf(0x570),
          no[uf(0xc1)],
          (rx) => Math[uf(0xac6)](rx * 0x64) + "%",
        ],
        [uf(0xb75), uf(0x4b5), no[uf(0xc1)], (rx) => "+" + nr(rx) + uf(0x3ce)],
        [uf(0x78c), uf(0xa66), no[uf(0x6b0)], (rx) => k9(rx) + "/s"],
        [uf(0x98d), uf(0xa66), no[uf(0x6b0)], (rx) => k9(rx) + uf(0xd51)],
        [
          uf(0x339),
          uf(0xa91),
          no[uf(0xc1)],
          (rx) => (rx > 0x0 ? "+" : "") + rx,
        ],
        [uf(0x16a), uf(0xaff), no[uf(0x229)], (rx) => "+" + rx + "%"],
        [
          uf(0xd1c),
          uf(0x671),
          no[uf(0x229)],
          (rx) => "+" + parseInt(rx * 0x64) + "%",
        ],
        [uf(0x863), uf(0xa24), no[uf(0xc1)], (rx) => "-" + rx + "%"],
        [uf(0x510), uf(0x3dd), no[uf(0xc1)], nq],
        [uf(0x50f), uf(0xc60), no[uf(0x229)], (rx) => rx / 0x3e8 + "s"],
        [uf(0x6e3), uf(0x746), no[uf(0x229)], (rx) => rx + "s"],
        [uf(0xc2b), uf(0x61d), no[uf(0x229)], (rx) => k9(rx) + uf(0x563)],
        [uf(0x8e0), uf(0x2c6), no[uf(0x229)], (rx) => rx + "s"],
        [uf(0x739), uf(0xa9f), no[uf(0x229)], (rx) => rx / 0x3e8 + "s"],
        [uf(0x1e2), uf(0xa8e), no[uf(0x229)]],
        [uf(0xed), uf(0x5cd), no[uf(0x229)]],
        [uf(0x2f2), uf(0x742), no[uf(0x229)], (rx) => rx + uf(0x651)],
        [uf(0x30f), uf(0xcdd), no[uf(0x229)], (rx) => rx + uf(0x651)],
        [uf(0x2a5), uf(0xa3e), no[uf(0x229)]],
        [uf(0x1c7), uf(0x6fa), no[uf(0xc1)]],
        [uf(0x48a), uf(0xd71), no[uf(0x229)], (rx) => rx / 0x3e8 + "s"],
        [uf(0x8c7), uf(0xa38), no[uf(0x6b0)], (rx) => k9(rx) + "/s"],
        [uf(0xcd0), uf(0xdb1), no[uf(0x229)]],
        [uf(0xd31), uf(0x25a), no[uf(0xc1)]],
        [
          uf(0x4c6),
          uf(0x547),
          no[uf(0x229)],
          (rx, ry) => nr(rx * ry[uf(0x58f)]),
        ],
        [uf(0x5d3), uf(0xcad), no[uf(0x229)]],
        [uf(0xcb7), uf(0x868), no[uf(0xc1)]],
        [uf(0x78e), uf(0x937), no[uf(0x229)]],
        [uf(0x6d1), uf(0x29d), no[uf(0x229)]],
        [uf(0xad5), uf(0x753), no[uf(0x229)]],
        [
          uf(0xa1d),
          uf(0x66a),
          no[uf(0x229)],
          (rx) => "+" + nr(rx * 0x64) + "%",
        ],
        [uf(0xa01), uf(0x2d9), no[uf(0x9d7)]],
        [uf(0x4c8), uf(0x5b9), no[uf(0x229)]],
        [uf(0x1e3), uf(0x6e1), no[uf(0x6b0)]],
        [uf(0x8e7), uf(0x746), no[uf(0x229)], (rx) => rx + "s"],
        [uf(0x719), uf(0x963), no[uf(0x229)]],
        [uf(0x692), uf(0x8f0), no[uf(0xc1)], (rx) => rx / 0x3e8 + "s"],
      ],
      nt = [
        [uf(0xbd4), uf(0x342), no[uf(0x229)]],
        [uf(0x1b7), uf(0x843), no[uf(0xc1)], (rx) => k9(rx * 0x64) + "%"],
        [uf(0x370), uf(0x94d), no[uf(0xc1)]],
        [uf(0x32c), uf(0x817), no[uf(0x229)]],
        [uf(0x323), uf(0x6b4), no[uf(0xc1)]],
        [uf(0x16a), uf(0xaff), no[uf(0x229)], (rx) => "+" + rx + "%"],
        [uf(0x673), uf(0x182), no[uf(0x229)], (rx) => k9(rx) + "/s"],
        [uf(0x2a8), uf(0x159), no[uf(0x79a)], (rx) => rx * 0x64 + uf(0x49c)],
        [uf(0xdb), uf(0x7e6), no[uf(0x229)], (rx) => rx + "s"],
        [
          uf(0x141),
          uf(0x7a8),
          no[uf(0xc1)],
          (rx) => "-" + parseInt((0x1 - rx) * 0x64) + "%",
        ],
      ];
    function nu(rx, ry = !![]) {
      const zJ = uf;
      let rz = "",
        rA = "",
        rB;
      rx[zJ(0x81d)] === void 0x0
        ? ((rB = ns),
          rx[zJ(0x65e)] &&
            (rA =
              zJ(0x535) +
              (rx[zJ(0x65e)] / 0x3e8 +
                "s" +
                (rx[zJ(0xa27)] > 0x0
                  ? zJ(0x4ac) + rx[zJ(0xa27)] / 0x3e8 + "s"
                  : "")) +
              zJ(0xc17)))
        : (rB = nt);
      for (let rD = 0x0; rD < rB[zJ(0xbc8)]; rD++) {
        const [rE, rF, rG, rH] = rB[rD],
          rI = rx[rE];
        rI &&
          rI !== 0x0 &&
          (rz +=
            zJ(0xd22) +
            rG +
            zJ(0x90b) +
            rF +
            zJ(0xaad) +
            (rH ? rH(rI, rx) : k9(rI)) +
            zJ(0x675));
      }
      const rC = nA(
        zJ(0x291) +
          rx[zJ(0xaba)] +
          zJ(0x5a0) +
          hN[rx[zJ(0xcce)]] +
          zJ(0xb80) +
          hQ[rx[zJ(0xcce)]] +
          zJ(0x31c) +
          rA +
          zJ(0x478) +
          rx[zJ(0x902)] +
          zJ(0x31c) +
          rz +
          zJ(0x4f8)
      );
      if (rx[zJ(0x40e)] && ry) {
        rC[zJ(0xd5e)][zJ(0x397)][zJ(0xc37)] = zJ(0xb21);
        for (let rJ = 0x0; rJ < rx[zJ(0x40e)][zJ(0xbc8)]; rJ++) {
          const [rK, rL] = rx[zJ(0x40e)][rJ],
            rM = nA(zJ(0xcfe));
          rC[zJ(0xd58)](rM);
          const rN = f5[rL][rx[zJ(0xcce)]];
          for (let rO = 0x0; rO < rN[zJ(0xbc8)]; rO++) {
            const [rP, rQ] = rN[rO],
              rR = eW(rK, rQ),
              rS = nA(
                zJ(0x18d) +
                  rR[zJ(0xcce)] +
                  "\x22\x20" +
                  qk(rR) +
                  zJ(0xc2e) +
                  rP +
                  zJ(0x6fd)
              );
            rM[zJ(0xd58)](rS);
          }
        }
      }
      return rC;
    }
    function nv() {
      const zK = uf;
      mt && (mt[zK(0xa5a)](), (mt = null));
      const rx = ko[zK(0x5fc)](zK(0x679));
      for (let ry = 0x0; ry < rx[zK(0xbc8)]; ry++) {
        const rz = rx[ry];
        rz[zK(0xa5a)]();
      }
      for (let rA = 0x0; rA < iO; rA++) {
        const rB = nA(zK(0x417));
        rB[zK(0xd36)] = rA;
        const rC = iP[rA];
        if (rC) {
          const rD = nA(
            zK(0x6b2) + rC[zK(0xcce)] + "\x22\x20" + qk(rC) + zK(0x697)
          );
          (rD[zK(0xbca)] = rC),
            (rD[zK(0x864)] = !![]),
            (rD[zK(0x5d1)] = iR[zK(0x565)]()),
            nz(rD, rC),
            rB[zK(0xd58)](rD),
            (iQ[rD[zK(0x5d1)]] = rD);
        }
        rA >= iN
          ? (rB[zK(0xd58)](nA(zK(0x792) + ((rA - iN + 0x1) % 0xa) + zK(0x548))),
            nl[zK(0xd58)](rB))
          : nk[zK(0xd58)](rB);
      }
    }
    function nw(rx) {
      const zL = uf;
      return rx < 0.5
        ? 0x4 * rx * rx * rx
        : 0x1 - Math[zL(0xbee)](-0x2 * rx + 0x2, 0x3) / 0x2;
    }
    var nx = [];
    function ny(rx, ry) {
      const zM = uf;
      (rx[zM(0xa0c)] = 0x0), (rx[zM(0xd86)] = 0x1);
      let rz = 0x1,
        rA = 0x0,
        rB = -0x1;
      rx[zM(0x474)][zM(0x1b0)](zM(0x6d3)), rx[zM(0x491)](zM(0x397), "");
      const rC = nA(zM(0xcbf));
      rx[zM(0xd58)](rC), nx[zM(0x6aa)](rC);
      const rD = qc;
      rC[zM(0x766)] = rC[zM(0x3bb)] = rD;
      const rE = rC[zM(0xb87)]("2d");
      (rC[zM(0x13a)] = function () {
        const zN = zM;
        rE[zN(0xa13)](0x0, 0x0, rD, rD);
        rA < 0.99 &&
          ((rE[zN(0x74e)] = 0x1 - rA),
          (rE[zN(0x716)] = zN(0xd1d)),
          rE[zN(0x193)](0x0, 0x0, rD, (0x1 - rz) * rD));
        if (rA < 0.01) return;
        (rE[zN(0x74e)] = rA),
          rE[zN(0xa26)](),
          rE[zN(0x5b0)](rD / 0x64),
          rE[zN(0xb25)](0x32, 0x2d);
        let rF = rx[zN(0xa0c)];
        rF = nw(rF);
        const rG = Math["PI"] * 0x2 * rF;
        rE[zN(0x710)](rG * 0x4),
          rE[zN(0x787)](),
          rE[zN(0x92d)](0x0, 0x0),
          rE[zN(0x769)](0x0, 0x0, 0x64, 0x0, rG),
          rE[zN(0x92d)](0x0, 0x0),
          rE[zN(0x769)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rE[zN(0x716)] = zN(0xc4e)),
          rE[zN(0x190)](zN(0x8e9)),
          rE[zN(0x20f)]();
      }),
        (rC[zM(0x8ee)] = function () {
          const zO = zM;
          rx[zO(0xa0c)] += pA / (ry[zO(0x65e)] + 0xc8);
          let rF = 0x1,
            rG = rx[zO(0xd86)];
          rx[zO(0xa0c)] >= 0x1 && (rF = 0x0);
          const rH = rx[zO(0x908)] || rx[zO(0x773)];
          ((rH && rH[zO(0x773)] === nl) || !iy) && ((rG = 0x1), (rF = 0x0));
          (rA = pg(rA, rF, 0x64)), (rz = pg(rz, rG, 0x64));
          const rI = Math[zO(0xac6)]((0x1 - rz) * 0x64),
            rJ = Math[zO(0xac6)](rA * 0x64) / 0x64;
          rJ == 0x0 && rI <= 0x0
            ? ((rC[zO(0x32a)] = ![]), (rC[zO(0x397)][zO(0x373)] = zO(0x972)))
            : ((rC[zO(0x32a)] = !![]), (rC[zO(0x397)][zO(0x373)] = "")),
            (rB = rI);
        }),
        rx[zM(0xd58)](nA(zM(0x8d9) + qk(ry) + zM(0x697)));
    }
    function nz(rx, ry, rz = !![]) {
      const zP = uf;
      rz && ry[zP(0x81d)] === void 0x0 && ny(rx, ry);
    }
    function nA(rx) {
      const zQ = uf;
      return (hB[zQ(0xd6e)] = rx), hB[zQ(0x8c1)][0x0];
    }
    var nB = document[uf(0xa10)](uf(0x816)),
      nC = [];
    function nD() {
      const zR = uf;
      (nB[zR(0xd6e)] = zR(0x4e4)[zR(0x462)](eL * dH)),
        (nC = Array[zR(0x371)](nB[zR(0x8c1)]));
    }
    nD();
    var nE = {};
    for (let rx = 0x0; rx < eK[uf(0xbc8)]; rx++) {
      const ry = eK[rx];
      !nE[ry[uf(0x511)]] &&
        ((nE[ry[uf(0x511)]] = new lG(
          -0x1,
          ry[uf(0x511)],
          0x0,
          0x0,
          ry[uf(0x5ab)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          ry[uf(0xad8)],
          0x1
        )),
        (nE[ry[uf(0x511)]][uf(0x6b5)] = !![]));
      const rz = nE[ry[uf(0x511)]];
      let rA = null;
      ry[uf(0xdbe)] !== void 0x0 &&
        (rA = new lG(-0x1, ry[uf(0xdbe)], 0x0, 0x0, 0x0, ry[uf(0xad8)], 0x1)),
        (ry[uf(0xd89)] = function (rB) {
          const zS = uf;
          rB[zS(0x6ff)](0.5, 0.5),
            rz[zS(0x7e5)](rB),
            rA &&
              (rB[zS(0x710)](rz[zS(0x903)]),
              rB[zS(0xb25)](-ry[zS(0xad8)] * 0x2, 0x0),
              rA[zS(0x7e5)](rB));
        });
    }
    function nF(rB, rC = ![]) {
      const zT = uf,
        rD = nA(zT(0x6b2) + rB[zT(0xcce)] + "\x22\x20" + qk(rB) + zT(0x697));
      jY(rD), (rD[zT(0xbca)] = rB);
      if (rC) return rD;
      const rE = dH * rB[zT(0x72f)] + rB[zT(0xcce)],
        rF = nC[rE];
      return nB[zT(0x393)](rD, rF), rF[zT(0xa5a)](), (nC[rE] = rD), rD;
    }
    var nG = document[uf(0xa10)](uf(0xc66)),
      nH = document[uf(0xa10)](uf(0x768)),
      nI = document[uf(0xa10)](uf(0xdb8)),
      nJ = document[uf(0xa10)](uf(0x650)),
      nK = document[uf(0xa10)](uf(0x33c)),
      nL = nK[uf(0xa10)](uf(0xcf7)),
      nM = nK[uf(0xa10)](uf(0x735)),
      nN = document[uf(0xa10)](uf(0xd8b)),
      nO = document[uf(0xa10)](uf(0x5fe)),
      nP = ![],
      nQ = 0x0,
      nR = ![];
    (nH[uf(0xc3)] = function () {
      (nP = !![]), (nQ = 0x0), (nR = ![]);
    }),
      (nJ[uf(0xc3)] = function () {
        const zU = uf;
        if (this[zU(0x474)][zU(0xdb3)](zU(0x8df)) || jy) return;
        kI(zU(0x28a), (rB) => {
          rB && ((nP = !![]), (nQ = 0x0), (nR = !![]));
        });
      }),
      (nG[uf(0xd6e)] = uf(0x4e4)[uf(0x462)](dG * dH));
    var nS = Array[uf(0x371)](nG[uf(0x8c1)]),
      nT = document[uf(0xa10)](uf(0x6f4)),
      nU = {};
    function nV() {
      const zV = uf;
      for (let rB in nU) {
        nU[rB][zV(0x4b8)]();
      }
      nU = {};
      for (let rC in iS) {
        oU(rC);
      }
      nW();
    }
    function nW() {
      nX(nT);
    }
    function nX(rB) {
      const zW = uf,
        rC = Array[zW(0x371)](rB[zW(0x5fc)](zW(0x679)));
      rC[zW(0x1d0)]((rD, rE) => {
        const zX = zW,
          rF = rE[zX(0xbca)][zX(0xcce)] - rD[zX(0xbca)][zX(0xcce)];
        return rF === 0x0 ? rE[zX(0xbca)]["id"] - rD[zX(0xbca)]["id"] : rF;
      });
      for (let rD = 0x0; rD < rC[zW(0xbc8)]; rD++) {
        const rE = rC[rD];
        rB[zW(0xd58)](rE);
      }
    }
    function nY(rB, rC) {
      const zY = uf,
        rD = rC[zY(0xcce)] - rB[zY(0xcce)];
      return rD === 0x0 ? rC["id"] - rB["id"] : rD;
    }
    function nZ(rB, rC = !![]) {
      const zZ = uf,
        rD = nA(zZ(0x74c) + rB[zZ(0xcce)] + "\x22\x20" + qk(rB) + zZ(0xc28));
      setTimeout(function () {
        const A0 = zZ;
        rD[A0(0x474)][A0(0xa5a)](A0(0x429));
      }, 0x1f4),
        (rD[zZ(0xbca)] = rB);
      if (rC) {
      }
      return (rD[zZ(0x7cd)] = rD[zZ(0xa10)](zZ(0x7ba))), rD;
    }
    var o0 = nA(uf(0x571)),
      o1 = o0[uf(0xa10)](uf(0xb33)),
      o2 = o0[uf(0xa10)](uf(0x1f1)),
      o3 = o0[uf(0xa10)](uf(0xbf8)),
      o4 = [];
    for (let rB = 0x0; rB < 0x5; rB++) {
      const rC = nA(uf(0x4e4));
      (rC[uf(0x389)] = function (rD = 0x0) {
        const A1 = uf,
          rE =
            (rB / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rD * Math["PI"] * 0x6,
          rF =
            0x32 +
            (rD > 0x0
              ? Math[A1(0x71b)](Math[A1(0x7f1)](rD * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[A1(0x397)][A1(0x502)] = Math[A1(0xa87)](rE) * rF + 0x32 + "%"),
          (this[A1(0x397)][A1(0x765)] = Math[A1(0x7f1)](rE) * rF + 0x32 + "%");
      }),
        rC[uf(0x389)](),
        (rC[uf(0xcca)] = 0x0),
        (rC["el"] = null),
        (rC[uf(0x9cf)] = function () {
          const A2 = uf;
          (rC[A2(0xcca)] = 0x0), (rC["el"] = null), (rC[A2(0xd6e)] = "");
        }),
        (rC[uf(0x183)] = function (rD) {
          const A3 = uf;
          if (!rC["el"]) {
            const rE = nZ(oJ, ![]);
            (rE[A3(0xc3)] = function () {
              if (oL || oN) return;
              oR(null);
            }),
              rC[A3(0xd58)](rE),
              (rC["el"] = rE);
          }
          (rC[A3(0xcca)] += rD), oP(rC["el"][A3(0x7cd)], rC[A3(0xcca)]);
        }),
        o1[uf(0xd58)](rC),
        o4[uf(0x6aa)](rC);
    }
    var o5,
      o6 = document[uf(0xa10)](uf(0x13d)),
      o7 = document[uf(0xa10)](uf(0x4d0)),
      o8 = document[uf(0xa10)](uf(0x9d5)),
      o9 = document[uf(0xa10)](uf(0xec)),
      oa = {};
    function ob() {
      const A4 = uf,
        rD = document[A4(0xa10)](A4(0x3c7));
      for (let rE = 0x0; rE < dH; rE++) {
        const rF = nA(A4(0x443) + rE + A4(0xc96));
        (rF[A4(0xc3)] = function () {
          const A5 = A4;
          let rG = p9;
          p9 = !![];
          for (const rH in nU) {
            const rI = dC[rH];
            if (rI[A5(0xcce)] !== rE) continue;
            const rJ = nU[rH];
            rJ[A5(0x111)][A5(0x6ad)]();
          }
          p9 = rG;
        }),
          (oa[rE] = rF),
          rD[A4(0xd58)](rF);
      }
    }
    ob();
    var oc = ![],
      od = document[uf(0xa10)](uf(0x6fb));
    od[uf(0xc3)] = function () {
      const A6 = uf;
      document[A6(0x53e)][A6(0x474)][A6(0x410)](A6(0x4fe)),
        (oc = document[A6(0x53e)][A6(0x474)][A6(0xdb3)](A6(0x4fe)));
      const rD = oc ? A6(0xad7) : A6(0x327);
      k8(o7, rD),
        k8(o9, rD),
        oc
          ? (o6[A6(0xd58)](o0), o0[A6(0xd58)](nG), o8[A6(0xa5a)]())
          : (o6[A6(0xd58)](o8),
            o8[A6(0x393)](nG, o8[A6(0xd5e)]),
            o0[A6(0xa5a)]());
    };
    var oe = document[uf(0xa10)](uf(0xaf5)),
      of = oi(uf(0x439), no[uf(0x99b)]),
      og = oi(uf(0xb59), no[uf(0x79a)]),
      oh = oi(uf(0x556), no[uf(0x9d7)]);
    function oi(rD, rE) {
      const A7 = uf,
        rF = nA(A7(0x2c8) + rE + A7(0xd43) + rD + A7(0x3be));
      return (
        (rF[A7(0x9b4)] = function (rG) {
          const A8 = A7;
          k8(rF[A8(0x8c1)][0x1], k9(Math[A8(0xac6)](rG)));
        }),
        oe[A7(0xd58)](rF),
        rF
      );
    }
    var oj = document[uf(0xa10)](uf(0x3c0)),
      ok = document[uf(0xa10)](uf(0x204));
    ok[uf(0xd6e)] = "";
    var ol = document[uf(0xa10)](uf(0x938)),
      om = {};
    function on() {
      const A9 = uf;
      (ok[A9(0xd6e)] = ""), (ol[A9(0xd6e)] = "");
      const rD = {},
        rE = [];
      for (let rF in om) {
        const rG = dC[rF],
          rH = om[rF];
        (rD[rG[A9(0xcce)]] = (rD[rG[A9(0xcce)]] || 0x0) + rH),
          rE[A9(0x6aa)]([rG, rH]);
      }
      if (rE[A9(0xbc8)] === 0x0) {
        oj[A9(0x397)][A9(0x373)] = A9(0x972);
        return;
      }
      (oj[A9(0x397)][A9(0x373)] = ""),
        rE[A9(0x1d0)]((rI, rJ) => {
          return nY(rI[0x0], rJ[0x0]);
        })[A9(0x4a2)](([rI, rJ]) => {
          const Aa = A9,
            rK = nZ(rI);
          jY(rK), oP(rK[Aa(0x7cd)], rJ), ok[Aa(0xd58)](rK);
        }),
        oo(ol, rD);
    }
    function oo(rD, rE) {
      const Ab = uf;
      let rF = 0x0;
      for (let rG in d9) {
        const rH = rE[d9[rG]];
        if (rH !== void 0x0) {
          rF++;
          const rI = nA(
            Ab(0x8db) + k9(rH) + "\x20" + rG + Ab(0xb80) + hP[rG] + Ab(0xc02)
          );
          rD[Ab(0x215)](rI);
        }
      }
      rF % 0x2 === 0x1 &&
        (rD[Ab(0x8c1)][0x0][Ab(0x397)][Ab(0xa88)] = Ab(0x47b));
    }
    var op = {},
      oq = 0x0,
      or,
      os,
      ot,
      ou,
      ov = 0x0,
      ow = 0x0,
      ox = 0x0,
      oy = 0x0,
      oz = 0x0;
    function oA() {
      const Ac = uf,
        rD = d4(oq);
      (or = rD[0x0]),
        (os = rD[0x1]),
        (ou = d2(or + 0x1)),
        (ot = oq - os),
        k8(
          nO,
          !hack.isEnabled('betterXP') ? (Ac(0xbbc) + (or + 0x1) + Ac(0xdaf) + iJ(ot) + "/" + iJ(ou) + Ac(0x71d)) : (Ac(0xbbc) + (or + 0x1) + Ac(0xdaf) + ot + "/" + ou + Ac(0x71d))
        );
      const rE = d6(or);
      of[Ac(0x9b4)](0xc8 * rE),
        og[Ac(0x9b4)](0x19 * rE),
        oh[Ac(0x9b4)](d5(or)),
        hack.hp = 0xc8 * rE,
        (ow = Math[Ac(0xc0c)](0x1, ot / ou)),
        (oy = 0x0),
        (nJ[Ac(0xa10)](Ac(0xa29))[Ac(0xd6e)] =
          or >= cH ? Ac(0xbf9) : Ac(0x745) + (cH + 0x1) + Ac(0x395));
    }
    var oB = 0x0,
      oC = document[uf(0xa10)](uf(0x46e));
    for (let rD = 0x0; rD < cZ[uf(0xbc8)]; rD++) {
      const [rE, rF] = cZ[rD],
        rG = j7[rE],
        rH = nA(
          uf(0x954) +
            hP[rG] +
            uf(0x7f5) +
            rG +
            uf(0xb82) +
            (rF + 0x1) +
            uf(0x505)
        );
      (rH[uf(0xc3)] = function () {
        const Ad = uf;
        if (or >= rF) {
          const rI = oC[Ad(0xa10)](Ad(0x271));
          rI && rI[Ad(0x474)][Ad(0xa5a)](Ad(0x359)),
            (oB = rD),
            (hD[Ad(0x849)] = rD),
            this[Ad(0x474)][Ad(0x1b0)](Ad(0x359));
        }
      }),
        (cZ[rD][uf(0x5ea)] = rH),
        oC[uf(0xd58)](rH);
    }
    function oD() {
      const Ae = uf,
        rI = parseInt(hD[Ae(0x849)]) || 0x0;
      cZ[0x0][Ae(0x5ea)][Ae(0x6ad)](),
        cZ[Ae(0x4a2)]((rJ, rK) => {
          const Af = Ae,
            rL = rJ[0x1];
          if (or >= rL) {
            rJ[Af(0x5ea)][Af(0x474)][Af(0xa5a)](Af(0x8df));
            if (rI === rK) rJ[Af(0x5ea)][Af(0x6ad)]();
          } else rJ[Af(0x5ea)][Af(0x474)][Af(0x1b0)](Af(0x8df));
        });
    }
    var oE = document[uf(0xa10)](uf(0x7ab));
    setInterval(() => {
      const Ag = uf;
      if (!o6[Ag(0x474)][Ag(0xdb3)](Ag(0x9b3))) return;
      oF();
    }, 0x3e8);
    function oF() {
      const Ah = uf;
      if (jZ) {
        let rI = 0x0;
        for (const rK in jZ) {
          rI += oG(rK, jZ[rK]);
        }
        let rJ = 0x0;
        for (const rL in op) {
          const rM = oG(rL, op[rL][Ah(0xcca)]);
          (rJ += rM), (rI += rM);
        }
        if (rJ > 0x0) {
          const rN = Math[Ah(0xc0c)](0x19, (rJ / rI) * 0x64),
            rO = rN > 0x1 ? rN[Ah(0xac4)](0x2) : rN[Ah(0xac4)](0x5);
          k8(oE, "+" + rO + "%");
        }
      }
    }
    function oG(rI, rJ) {
      const Ai = uf,
        rK = dC[rI];
      if (!rK) return 0x0;
      const rL = rK[Ai(0xcce)];
      return Math[Ai(0xbee)](rL * 0xa, rL) * rJ;
    }
    var oH = document[uf(0xa10)](uf(0x8fa));
    (oH[uf(0xc3)] = function () {
      const Aj = uf;
      for (const rI in op) {
        const rJ = op[rI];
        rJ[Aj(0x4b8)]();
      }
      oI();
    }),
      oI(),
      oA();
    function oI() {
      const Ak = uf,
        rI = Object[Ak(0x1be)](op);
      nI[Ak(0x474)][Ak(0xa5a)](Ak(0x824));
      const rJ = rI[Ak(0xbc8)] === 0x0;
      (oH[Ak(0x397)][Ak(0x373)] = rJ ? Ak(0x972) : ""), (oz = 0x0);
      let rK = 0x0;
      const rL = rI[Ak(0xbc8)] > 0x1 ? 0x32 : 0x0;
      for (let rN = 0x0, rO = rI[Ak(0xbc8)]; rN < rO; rN++) {
        const rP = rI[rN],
          rQ = (rN / rO) * Math["PI"] * 0x2;
        rP[Ak(0x6d4)](
          Math[Ak(0xa87)](rQ) * rL + 0x32,
          Math[Ak(0x7f1)](rQ) * rL + 0x32
        ),
          (oz += d3[rP["el"][Ak(0xbca)][Ak(0xcce)]] * rP[Ak(0xcca)]);
      }
      nI[Ak(0x474)][rL ? Ak(0x1b0) : Ak(0xa5a)](Ak(0x824)),
        nH[Ak(0x474)][rI[Ak(0xbc8)] > 0x0 ? Ak(0xa5a) : Ak(0x1b0)](Ak(0x9af));
      const rM = or >= cH;
      nJ[Ak(0x474)][rI[Ak(0xbc8)] > 0x0 && rM ? Ak(0xa5a) : Ak(0x1b0)](
        Ak(0x8df)
      ),
        oF(),
        (nI[Ak(0x397)][Ak(0x99f)] = ""),
        (nP = ![]),
        (nR = ![]),
        (nQ = 0x0),
        (ov = Math[Ak(0xc0c)](0x1, (ot + oz) / ou) || 0x0),
        k8(nN, oz > 0x0 ? "+" + iJ(oz) + Ak(0x71d) : "");
    }
    var oJ,
      oK = 0x0,
      oL = ![],
      oM = 0x0,
      oN = null;
    function oO() {
      const Al = uf;
      o2[Al(0x474)][oK < 0x5 ? Al(0x1b0) : Al(0xa5a)](Al(0x9af));
    }
    o2[uf(0xc3)] = function () {
      const Am = uf;
      if (oL || !oJ || oK < 0x5 || !ik() || oN) return;
      (oL = !![]), (oM = 0x0), (oN = null), o2[Am(0x474)][Am(0x1b0)](Am(0x9af));
      const rI = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      rI[Am(0x227)](0x0, cI[Am(0xac1)]),
        rI[Am(0x4b7)](0x1, oJ["id"]),
        rI[Am(0xbad)](0x3, oK),
        il(rI);
    };
    function oP(rI, rJ) {
      k8(rI, "x" + iJ(rJ));
    }
    function oQ(rI) {
      const An = uf;
      typeof rI === An(0x454) && (rI = nr(rI)), k8(o3, rI + An(0x1f2));
    }
    function oR(rI) {
      const Ao = uf;
      oJ && mQ(oJ["id"], oK);
      o5 && o5[Ao(0x6ad)]();
      (oJ = rI), (oK = 0x0), oO();
      for (let rJ = 0x0; rJ < o4[Ao(0xbc8)]; rJ++) {
        o4[rJ][Ao(0x9cf)]();
      }
      oJ
        ? (oQ(dE[oJ[Ao(0xcce)]] * (jy ? 0x2 : 0x1) * (he ? 0.9 : 0x1)),
          (o2[Ao(0x397)][Ao(0xad1)] = hQ[oJ[Ao(0xcce)] + 0x1]))
        : oQ("?");
    }
    var oS = 0x0,
      oT = 0x1;
    function oU(rI) {
      const Ap = uf,
        rJ = dC[rI],
        rK = nZ(rJ);
      (rK[Ap(0xa0e)] = pc), jY(rK), (rK[Ap(0xd66)] = !![]), nT[Ap(0xd58)](rK);
      const rL = nZ(rJ);
      jY(rL), (rL[Ap(0xa0e)] = o6);
      rJ[Ap(0xcce)] >= dc && rL[Ap(0x474)][Ap(0x1b0)](Ap(0xb4b));
      rL[Ap(0xc3)] = function () {
        const Aq = Ap;
        pz - oS < 0x1f4 ? oT++ : (oT = 0x1);
        oS = pz;
        if (oc) {
          if (oL || rJ[Aq(0xcce)] >= dc) return;
          const rP = iS[rJ["id"]];
          if (!rP) return;
          oJ !== rJ && oR(rJ);
          const rQ = o4[Aq(0xbc8)];
          let rR = p9 ? rP : Math[Aq(0xc0c)](rQ * oT, rP);
          mQ(rJ["id"], -rR), (oK += rR), oO();
          let rS = rR % rQ,
            rT = (rR - rS) / rQ;
          const rU = [...o4][Aq(0x1d0)](
            (rW, rX) => rW[Aq(0xcca)] - rX[Aq(0xcca)]
          );
          rT > 0x0 && rU[Aq(0x4a2)]((rW) => rW[Aq(0x183)](rT));
          let rV = 0x0;
          while (rS--) {
            const rW = rU[rV];
            (rV = (rV + 0x1) % rQ), rW[Aq(0x183)](0x1);
          }
          return;
        }
        if (!op[rJ["id"]]) {
          const rX = nZ(rJ, ![]);
          k8(rX[Aq(0x7cd)], "x1"),
            (rX[Aq(0xc3)] = function (rZ) {
              const Ar = Aq;
              rY[Ar(0x4b8)](), oI();
            }),
            nI[Aq(0xd58)](rX);
          const rY = {
            petal: rJ,
            count: 0x0,
            el: rX,
            setPos(rZ, s0) {
              const As = Aq;
              (rX[As(0x397)][As(0x502)] = rZ + "%"),
                (rX[As(0x397)][As(0x765)] = s0 + "%"),
                (rX[As(0x397)][As(0x895)] = As(0x364));
            },
            dispose(rZ = !![]) {
              const At = Aq;
              rX[At(0xa5a)](),
                rZ && mQ(rJ["id"], this[At(0xcca)]),
                delete op[rJ["id"]];
            },
          };
          (op[rJ["id"]] = rY), oI();
        }
        const rO = op[rJ["id"]];
        if (iS[rJ["id"]]) {
          const rZ = iS[rJ["id"]],
            s0 = p9 ? rZ : Math[Aq(0xc0c)](0x1 * oT, rZ);
          (rO[Aq(0xcca)] += s0),
            mQ(rJ["id"], -s0),
            oP(rO["el"][Aq(0x7cd)], rO[Aq(0xcca)]);
        }
        oI();
      };
      const rM = dH * rJ[Ap(0x72f)] + rJ[Ap(0xfc)],
        rN = nS[rM];
      return (
        nG[Ap(0x393)](rL, rN),
        rN[Ap(0xa5a)](),
        (nS[rM] = rL),
        (rK[Ap(0xfe)] = function (rO) {
          const Au = Ap;
          oP(rK[Au(0x7cd)], rO), oP(rL[Au(0x7cd)], rO);
        }),
        (rK[Ap(0x111)] = rL),
        (nU[rI] = rK),
        (rK[Ap(0x4b8)] = function () {
          const Av = Ap;
          rK[Av(0xa5a)](), delete nU[rI];
          const rO = nA(Av(0x4e4));
          (nS[rM] = rO), nG[Av(0x393)](rO, rL), rL[Av(0xa5a)]();
        }),
        rK[Ap(0xfe)](iS[rI]),
        rK
      );
    }
    var oV = {},
      oW = {};
    function oX(rI, rJ, rK, rL) {
      const Aw = uf,
        rM = document[Aw(0xa10)](rK);
      (rM[Aw(0x7c8)] = function () {
        const Ax = Aw;
        (oV[rI] = this[Ax(0xb85)]),
          (hD[rI] = this[Ax(0xb85)] ? "1" : "0"),
          rL && rL(this[Ax(0xb85)]);
      }),
        (oW[rI] = function () {
          const Ay = Aw;
          rM[Ay(0x6ad)]();
        }),
        (rM[Aw(0xb85)] = hD[rI] === void 0x0 ? rJ : hD[rI] === "1"),
        rM[Aw(0x7c8)]();
    }
    var oY = document[uf(0xa10)](uf(0x1ca));
    (oY[uf(0xbca)] = function () {
      const Az = uf;
      return nA(
        Az(0xb64) + hP[Az(0x970)] + Az(0x564) + hP[Az(0x409)] + Az(0x7e0)
      );
    }),
      oX(uf(0xd32), ![], uf(0x5f3), mq),
      oX(uf(0x286), !![], uf(0x30d)),
      oX(uf(0x1a5), !![], uf(0xa3c)),
      oX(
        uf(0xbd7),
        !![],
        uf(0x6d0),
        (rI) => (kK[uf(0x397)][uf(0x373)] = rI ? "" : uf(0x972))
      ),
      oX(uf(0x499), ![], uf(0xbfa)),
      oX(uf(0xd4c), ![], uf(0x858)),
      oX(uf(0xc25), ![], uf(0xb4c)),
      oX(uf(0x6d8), !![], uf(0x3b7)),
      oX(
        uf(0xd54),
        !![],
        uf(0x254),
        (rI) => (oY[uf(0x397)][uf(0x373)] = rI ? "" : uf(0x972))
      ),
      oX(uf(0xb8e), ![], uf(0x175), kT),
      oX(uf(0x1e4), ![], uf(0x79c), kX),
      oX(uf(0x42d), ![], uf(0x37c), (rI) => oZ(ko, uf(0xcc), rI)),
      oX(uf(0x30e), !![], uf(0x733), (rI) =>
        oZ(document[uf(0x53e)], uf(0x150), !rI)
      ),
      oX(uf(0x9a1), !![], uf(0xb22), (rI) =>
        oZ(document[uf(0x53e)], uf(0x12c), !rI)
      ),
      oX(uf(0xa4a), !![], uf(0x137));
    function oZ(rI, rJ, rK) {
      const AA = uf;
      rI[AA(0x474)][rK ? AA(0x1b0) : AA(0xa5a)](rJ);
    }
    function p0() {
      const AB = uf,
        rI = document[AB(0xa10)](AB(0x759)),
        rJ = [];
      for (let rL = 0x0; rL <= 0xa; rL++) {
        rJ[AB(0x6aa)](0x1 - rL * 0.05);
      }
      for (const rM of rJ) {
        const rN = nA(AB(0x4ee) + rM + "\x22>" + nr(rM * 0x64) + AB(0x89e));
        rI[AB(0xd58)](rN);
      }
      let rK = parseFloat(hD[AB(0x953)]);
      (isNaN(rK) || !rJ[AB(0x20a)](rK)) && (rK = rJ[0x0]),
        (rI[AB(0x94c)] = rK),
        (kP = rK),
        (rI[AB(0x7c8)] = function () {
          const AC = AB;
          (kP = parseFloat(this[AC(0x94c)])),
            (hD[AC(0x953)] = this[AC(0x94c)]),
            kX();
        });
    }
    p0();
    var p1 = document[uf(0xa10)](uf(0x8eb)),
      p2 = document[uf(0xa10)](uf(0xc9));
    p2[uf(0x672)] = cL;
    var p3 = document[uf(0xa10)](uf(0x5c0));
    function p4(rI) {
      const AD = uf,
        rJ = nA(AD(0xa6b));
      kl[AD(0xd58)](rJ);
      const rK = rJ[AD(0xa10)](AD(0x223));
      rK[AD(0x94c)] = rI;
      const rL = rJ[AD(0xa10)](AD(0x20c));
      (rL[AD(0x7c8)] = function () {
        const AE = AD;
        rK[AE(0x511)] = this[AE(0xb85)] ? AE(0x1c8) : AE(0x3a2);
      }),
        (rJ[AD(0xa10)](AD(0x288))[AD(0xc3)] = function () {
          const AF = AD;
          jp(rI), hc(AF(0x95f));
        }),
        (rJ[AD(0xa10)](AD(0xd40))[AD(0xc3)] = function () {
          const AG = AD,
            rM = {};
          rM[AG(0x511)] = AG(0x97e);
          const rN = new Blob([rI], rM),
            rO = document[AG(0x966)]("a");
          (rO[AG(0xa08)] = URL[AG(0x853)](rN)),
            (rO[AG(0x2cb)] = (jv ? jv : AG(0xc03)) + AG(0x92c)),
            rO[AG(0x6ad)](),
            hc(AG(0x870));
        }),
        (rJ[AD(0xa10)](AD(0x99d))[AD(0xc3)] = function () {
          const AH = AD;
          rJ[AH(0xa5a)]();
        });
    }
    function p5() {
      const AI = uf,
        rI = nA(AI(0xaa8));
      kl[AI(0xd58)](rI);
      const rJ = rI[AI(0xa10)](AI(0x223)),
        rK = rI[AI(0xa10)](AI(0x20c));
      (rK[AI(0x7c8)] = function () {
        const AJ = AI;
        rJ[AJ(0x511)] = this[AJ(0xb85)] ? AJ(0x1c8) : AJ(0x3a2);
      }),
        (rI[AI(0xa10)](AI(0x99d))[AI(0xc3)] = function () {
          const AK = AI;
          rI[AK(0xa5a)]();
        }),
        (rI[AI(0xa10)](AI(0x635))[AI(0xc3)] = function () {
          const AL = AI,
            rL = rJ[AL(0x94c)][AL(0x11a)]();
          if (eV(rL)) {
            delete hD[AL(0x9ec)], (hD[AL(0xb19)] = rL);
            if (hU)
              try {
                hU[AL(0xc1c)]();
              } catch (rM) {}
            hc(AL(0xcb3));
          } else hc(AL(0xd44));
        });
    }
    (document[uf(0xa10)](uf(0x1ef))[uf(0xc3)] = function () {
      const AM = uf;
      if (i5) {
        p4(i5);
        return;
        const rI = prompt(AM(0x93c), i5);
        if (rI !== null) {
          const rJ = {};
          rJ[AM(0x511)] = AM(0x97e);
          const rK = new Blob([i5], rJ),
            rL = document[AM(0x966)]("a");
          (rL[AM(0xa08)] = URL[AM(0x853)](rK)),
            (rL[AM(0x2cb)] = jv + AM(0xdc9)),
            rL[AM(0x6ad)](),
            alert(AM(0xca2));
        }
      }
    }),
      (document[uf(0xa10)](uf(0x3ea))[uf(0xc3)] = function () {
        const AN = uf;
        p5();
        return;
        const rI = prompt(AN(0x255));
        if (rI !== null) {
          if (eV(rI)) {
            let rJ = AN(0x2b9);
            i6 && (rJ += AN(0x5b3));
            if (confirm(rJ)) {
              delete hD[AN(0x9ec)], (hD[AN(0xb19)] = rI);
              if (hU)
                try {
                  hU[AN(0xc1c)]();
                } catch (rK) {}
            }
          } else alert(AN(0xd44));
        }
      }),
      oX(uf(0x122), ![], uf(0x4f7), (rI) =>
        p2[uf(0x474)][rI ? uf(0x1b0) : uf(0xa5a)](uf(0x918))
      ),
      oX(uf(0x7ea), !![], uf(0x400));
    var p6 = 0x0,
      p7 = 0x0,
      p8 = 0x0,
      p9 = ![];
    function pa(rI, rJ) {
      const AO = uf;
      (rI === AO(0x343) || rI === AO(0x951)) && (p9 = rJ);
      if (rJ) {
        switch (rI) {
          case AO(0x630):
            m1[AO(0x9f9)][AO(0x410)]();
            break;
          case AO(0xd26):
            m1[AO(0x915)][AO(0x410)]();
            break;
          case AO(0x17d):
            m1[AO(0x5a8)][AO(0x410)]();
            break;
          case AO(0xa3f):
            pM[AO(0x474)][AO(0x410)](AO(0x359));
            break;
          case AO(0x431):
            oW[AO(0x499)](), hc(AO(0x560) + (oV[AO(0x499)] ? "ON" : AO(0x857)));
            break;
          case AO(0x98e):
            oW[AO(0xd4c)](), hc(AO(0x2ba) + (oV[AO(0xd4c)] ? "ON" : AO(0x857)));
            break;
          case AO(0x4e6):
            oW[AO(0xbd7)](), hc(AO(0x652) + (oV[AO(0xbd7)] ? "ON" : AO(0x857)));
            break;
          case AO(0x8b9):
            oW[AO(0xc25)](), hc(AO(0x97b) + (oV[AO(0xc25)] ? "ON" : AO(0x857)));
            break;
          case AO(0x94b):
            if (!mt && hW) {
              const rK = nk[AO(0x5fc)](AO(0xb44)),
                rL = nl[AO(0x5fc)](AO(0xb44));
              for (let rM = 0x0; rM < rK[AO(0xbc8)]; rM++) {
                const rN = rK[rM],
                  rO = rL[rM],
                  rP = mT(rN),
                  rQ = mT(rO);
                if (rP) mU(rP, rO);
                else rQ && mU(rQ, rN);
              }
              il(new Uint8Array([cI[AO(0xd9)]]));
            }
            break;
          default:
            if (!mt && hW && rI[AO(0xb93)](AO(0xc38)))
              rY: {
                let rR = parseInt(rI[AO(0x4e2)](0x5));
                if (n8[AO(0x4e6)]) {
                  p9 ? ku(rR) : kx(rR);
                  break rY;
                }
                rR === 0x0 && (rR = 0xa);
                iN > 0xa && p9 && (rR += 0xa);
                rR--;
                if (rR >= 0x0) {
                  const rS = nk[AO(0x5fc)](AO(0xb44))[rR],
                    rT = nl[AO(0x5fc)](AO(0xb44))[rR];
                  if (rS && rT) {
                    const rU = mT(rS),
                      rV = mT(rT);
                    if (rU) mU(rU, rT);
                    else rV && mU(rV, rS);
                  }
                }
                mS(rR, rR + iN);
              }
        }
        n8[rI] = !![];
      } else
        rI === AO(0x307) &&
          (kk[AO(0x397)][AO(0x373)] === "" &&
          p2[AO(0x397)][AO(0x373)] === AO(0x972)
            ? kD[AO(0x6ad)]()
            : p2[AO(0x880)]()),
          delete n8[rI];
      if (iy) {
        if (oV[AO(0xd32)]) {
          let rW = 0x0,
            rX = 0x0;
          if (n8[AO(0xcbb)] || n8[AO(0x598)]) rX = -0x1;
          else (n8[AO(0xd20)] || n8[AO(0x108)]) && (rX = 0x1);
          if (n8[AO(0x90e)] || n8[AO(0x893)]) rW = -0x1;
          else (n8[AO(0x98b)] || n8[AO(0x7b2)]) && (rW = 0x1);
          if (rW !== 0x0 || rX !== 0x0)
            (p6 = Math[AO(0xbaa)](rX, rW)), im(p6, 0x1);
          else (p7 !== 0x0 || p8 !== 0x0) && im(p6, 0x0);
          (p7 = rW), (p8 = rX);
        }
        pb();
      }
    }
    function pb() {
      const AP = uf,
        rI = n8[AP(0x6f6)] || n8[AP(0x951)] || n8[AP(0x343)],
        rJ = n8[AP(0x3bc)] || n8[AP(0x3f2)],
        rK = (rI << 0x1) | rJ;
      mV !== rK && ((mV = rK), il(new Uint8Array([cI[AP(0x233)], rK])));
    }
    var pc = document[uf(0xa10)](uf(0xbb5)),
      pd = 0x0,
      pe = 0x0,
      pf = 0x0;
    function pg(rI, rJ, rK) {
      const AQ = uf;
      return rI + (rJ - rI) * Math[AQ(0xc0c)](0x1, pA / rK);
    }
    var ph = 0x1,
      pi = [];
    for (let rI in cS) {
      if (
        [uf(0xa9e), uf(0xd7e), uf(0xb2d), uf(0xcf0), uf(0x86c), uf(0x790)][
          uf(0x20a)
        ](rI)
      )
        continue;
      pi[uf(0x6aa)](cS[rI]);
    }
    var pj = [];
    for (let rJ = 0x0; rJ < 0x1e; rJ++) {
      pk();
    }
    function pk(rK = !![]) {
      const AR = uf,
        rL = new lG(
          -0x1,
          pi[Math[AR(0xa9a)](Math[AR(0xb03)]() * pi[AR(0xbc8)])],
          0x0,
          Math[AR(0xb03)]() * d1,
          Math[AR(0xb03)]() * 6.28
        );
      if (!rL[AR(0xd19)] && Math[AR(0xb03)]() < 0.01) rL[AR(0x26e)] = !![];
      rL[AR(0xd19)]
        ? (rL[AR(0x9bf)] = rL[AR(0x58f)] = Math[AR(0xb03)]() * 0x8 + 0xc)
        : (rL[AR(0x9bf)] = rL[AR(0x58f)] = Math[AR(0xb03)]() * 0x1e + 0x19),
        rK
          ? (rL["x"] = Math[AR(0xb03)]() * d0)
          : (rL["x"] = -rL[AR(0x58f)] * 0x2),
        (rL[AR(0xa0f)] =
          (Math[AR(0xb03)]() * 0x3 + 0x4) * rL[AR(0x9bf)] * 0.02),
        (rL[AR(0x86f)] = (Math[AR(0xb03)]() * 0x2 - 0x1) * 0.05),
        pj[AR(0x6aa)](rL);
    }
    var pl = 0x0,
      pm = 0x0,
      pn = 0x0,
      po = 0x0;
    setInterval(function () {
      const AS = uf,
        rK = [ki, qe, ...Object[AS(0x1be)](pp), ...nx],
        rL = rK[AS(0xbc8)];
      let rM = 0x0;
      for (let rN = 0x0; rN < rL; rN++) {
        const rO = rK[rN];
        rM += rO[AS(0x766)] * rO[AS(0x3bb)];
      }
      kK[AS(0x491)](
        AS(0x6f2),
        Math[AS(0xac6)](0x3e8 / pA) +
          AS(0xd7f) +
          iw[AS(0xbc8)] +
          AS(0xd0) +
          rL +
          AS(0x2ed) +
          iJ(rM) +
          AS(0x455) +
          (po / 0x3e8)[AS(0xac4)](0x2) +
          AS(0x6a9)
      ),
        (po = 0x0);
    }, 0x3e8);
    var pp = {};
    function pq(rK, rL, rM, rN, rO, rP = ![]) {
      const AT = uf;
      if (!pp[rL]) {
        const rS = hx
          ? new OffscreenCanvas(0x1, 0x1)
          : document[AT(0x966)](AT(0x606));
        (rS[AT(0xc0b)] = rS[AT(0xb87)]("2d")),
          (rS[AT(0xa56)] = 0x0),
          (rS[AT(0xa98)] = rM),
          (rS[AT(0xd3c)] = rN),
          (pp[rL] = rS);
      }
      const rQ = pp[rL],
        rR = rQ[AT(0xc0b)];
      if (pz - rQ[AT(0xa56)] > 0x1f4) {
        rQ[AT(0xa56)] = pz;
        const rT = rK[AT(0x8a2)](),
          rU = Math[AT(0x4b2)](rT["a"], rT["b"]) * 1.5,
          rV = kW * rU,
          rW = Math[AT(0x435)](rQ[AT(0xa98)] * rV) || 0x1;
        rW !== rQ["w"] &&
          ((rQ["w"] = rW),
          (rQ[AT(0x766)] = rW),
          (rQ[AT(0x3bb)] = Math[AT(0x435)](rQ[AT(0xd3c)] * rV) || 0x1),
          rR[AT(0xa26)](),
          rR[AT(0x6ff)](rV, rV),
          rO(rR),
          rR[AT(0x20f)]());
      }
      rQ[AT(0x5ec)] = !![];
      if (rP) return rQ;
      rK[AT(0x6c0)](
        rQ,
        -rQ[AT(0xa98)] / 0x2,
        -rQ[AT(0xd3c)] / 0x2,
        rQ[AT(0xa98)],
        rQ[AT(0xd3c)]
      );
    }
    var pr = /^((?!chrome|android).)*safari/i[uf(0x7a5)](navigator[uf(0x4f6)]),
      ps = pr ? 0.25 : 0x0;
    function pt(rK, rL, rM = 0x14, rN = uf(0xb5c), rO = 0x4, rP, rQ = "") {
      const AU = uf,
        rR = AU(0xadc) + rM + AU(0x6ed) + iA;
      let rS, rT;
      const rU = rL + "_" + rR + "_" + rN + "_" + rO + "_" + rQ,
        rV = pp[rU];
      if (!rV) {
        rK[AU(0x433)] = rR;
        const rW = rK[AU(0xc78)](rL);
        (rS = rW[AU(0x766)] + rO), (rT = rM + rO);
      } else (rS = rV[AU(0xa98)]), (rT = rV[AU(0xd3c)]);
      return pq(
        rK,
        rU,
        rS,
        rT,
        function (rX) {
          const AV = AU;
          rX[AV(0xb25)](rO / 0x2, rO / 0x2 - rT * ps),
            (rX[AV(0x433)] = rR),
            (rX[AV(0x266)] = AV(0x765)),
            (rX[AV(0x1d9)] = AV(0x502)),
            (rX[AV(0x6b1)] = rO),
            (rX[AV(0xfb)] = AV(0x782)),
            (rX[AV(0x716)] = rN),
            rO > 0x0 && rX[AV(0x10a)](rL, 0x0, 0x0),
            rX[AV(0x940)](rL, 0x0, 0x0);
        },
        rP
      );
    }
    var pu = 0x1;
    function pv(rK = cI[uf(0xfd)]) {
      const AW = uf,
        rL = Object[AW(0x1be)](op),
        rM = new DataView(
          new ArrayBuffer(0x1 + 0x2 + rL[AW(0xbc8)] * (0x2 + 0x4))
        );
      let rN = 0x0;
      rM[AW(0x227)](rN++, rK), rM[AW(0x4b7)](rN, rL[AW(0xbc8)]), (rN += 0x2);
      for (let rO = 0x0; rO < rL[AW(0xbc8)]; rO++) {
        const rP = rL[rO];
        rM[AW(0x4b7)](rN, rP[AW(0xbca)]["id"]),
          (rN += 0x2),
          rM[AW(0xbad)](rN, rP[AW(0xcca)]),
          (rN += 0x4);
      }
      il(rM);
    }
    function pw() {
      const AX = uf;
      o5[AX(0xa5a)](), o1[AX(0x474)][AX(0xa5a)](AX(0x6d6)), (o5 = null);
    }
    var px = [];
    function py() {
      const AY = uf;
      for (let rK = 0x0; rK < px[AY(0xbc8)]; rK++) {
        const rL = px[rK],
          rM = rL[AY(0xc11)],
          rN = rM && !rM[AY(0x3d9)];
        rN
          ? ((rL[AY(0x3d9)] = ![]),
            (rL[AY(0x5b7)] = rM[AY(0x5b7)]),
            (rL[AY(0xba6)] = rM[AY(0xba6)]),
            (rL[AY(0x257)] = rM[AY(0x257)]),
            (rL[AY(0x748)] = rM[AY(0x748)]),
            (rL[AY(0x828)] = rM[AY(0x828)]),
            (rL[AY(0x238)] = rM[AY(0x238)]),
            (rL[AY(0x187)] = rM[AY(0x187)]),
            (rL[AY(0x2ab)] = rM[AY(0x2ab)]),
            (rL[AY(0x7cf)] = rM[AY(0x7cf)]),
            (rL[AY(0xc30)] = rM[AY(0xc30)]),
            (rL[AY(0x5e7)] = rM[AY(0x5e7)]),
            (rL[AY(0xb14)] = rM[AY(0xb14)]),
            (rL[AY(0x9e3)] = rM[AY(0x9e3)]),
            (rL[AY(0x903)] = rM[AY(0x903)]),
            (rL[AY(0xc2b)] = rM[AY(0xc2b)]),
            j0(rL, rM))
          : ((rL[AY(0x3d9)] = !![]),
            (rL[AY(0xd72)] = 0x0),
            (rL[AY(0xba6)] = 0x1),
            (rL[AY(0x5b7)] = 0x0),
            (rL[AY(0x257)] = ![]),
            (rL[AY(0x748)] = 0x0),
            (rL[AY(0x828)] = 0x0),
            (rL[AY(0x187)] = pg(rL[AY(0x187)], 0x0, 0xc8)),
            (rL[AY(0x238)] = pg(rL[AY(0x238)], 0x0, 0xc8)),
            (rL[AY(0xc2b)] = pg(rL[AY(0xc2b)], 0x0, 0xc8)));
        if (rK > 0x0) {
          if (rM) {
            const rO = Math[AY(0xbaa)](rM["y"] - pe, rM["x"] - pd);
            rL[AY(0x542)] === void 0x0
              ? (rL[AY(0x542)] = rO)
              : (rL[AY(0x542)] = f8(rL[AY(0x542)], rO, 0.1));
          }
          rL[AY(0x936)] += ((rN ? -0x1 : 0x1) * pA) / 0x320;
          if (rL[AY(0x936)] < 0x0) rL[AY(0x936)] = 0x0;
          rL[AY(0x936)] > 0x1 && px[AY(0xb41)](rK, 0x1);
        }
      }
    }
    var pz = Date[uf(0x603)](),
      pA = 0x0,
      pB = 0x0,
      pC = pz;
    function pD() {
      const AZ = uf;
      (pz = Date[AZ(0x603)]()),
        (pA = pz - pC),
        (pC = pz),
        (pB = pA / 0x21),
        hd();
      let rK = 0x0;
      for (let rM = jX[AZ(0xbc8)] - 0x1; rM >= 0x0; rM--) {
        const rN = jX[rM];
        if (!rN[AZ(0xc9a)]) jX[AZ(0xb41)](rM, 0x1);
        else {
          if (
            (rN[AZ(0xa0e)] &&
              !rN[AZ(0xa0e)][AZ(0x474)][AZ(0xdb3)](AZ(0x9b3))) ||
            rN[AZ(0x773)][AZ(0x397)][AZ(0x373)] === AZ(0x972)
          )
            continue;
          else {
            jX[AZ(0xb41)](rM, 0x1), rN[AZ(0x474)][AZ(0xa5a)](AZ(0x6d3)), rK++;
            if (rK >= 0x14) break;
          }
        }
      }
      (pE[AZ(0xc11)] = iy), py();
      kC[AZ(0x474)][AZ(0xdb3)](AZ(0x9b3)) && (lL = pz);
      if (hv) {
        const rO = pz / 0x50,
          rP = Math[AZ(0x7f1)](rO) * 0x7,
          rQ = Math[AZ(0x71b)](Math[AZ(0x7f1)](rO / 0x4)) * 0.15 + 0.85;
        hu[AZ(0x397)][AZ(0x99f)] = AZ(0x714) + rP + AZ(0x752) + rQ + ")";
      } else hu[AZ(0x397)][AZ(0x99f)] = AZ(0x972);
      for (let rR = jc[AZ(0xbc8)] - 0x1; rR >= 0x0; rR--) {
        const rS = jc[rR];
        if (rS[AZ(0x2c3)]) {
          jc[AZ(0xb41)](rR, 0x1);
          continue;
        }
        rS[AZ(0x2f8)]();
      }
      for (let rT = nx[AZ(0xbc8)] - 0x1; rT >= 0x0; rT--) {
        const rU = nx[rT];
        if (!rU[AZ(0xc9a)]) {
          nx[AZ(0xb41)](rT, 0x1);
          continue;
        }
        rU[AZ(0x8ee)]();
      }
      for (let rV = jb[AZ(0xbc8)] - 0x1; rV >= 0x0; rV--) {
        const rW = jb[rV];
        rW[AZ(0x2c3)] &&
          rW["t"] <= 0x0 &&
          (rW[AZ(0xa5a)](), jb[AZ(0xb41)](rV, 0x1)),
          (rW["t"] += ((rW[AZ(0x2c3)] ? -0x1 : 0x1) * pA) / rW[AZ(0x9c5)]),
          (rW["t"] = Math[AZ(0xc0c)](0x1, Math[AZ(0x411)](0x0, rW["t"]))),
          rW[AZ(0x8ee)]();
      }
      for (let rX = mN[AZ(0xbc8)] - 0x1; rX >= 0x0; rX--) {
        const rY = mN[rX];
        if (!rY["el"][AZ(0xc9a)]) rY[AZ(0xe6)] = ![];
        (rY[AZ(0x98c)] += ((rY[AZ(0xe6)] ? 0x1 : -0x1) * pA) / 0xc8),
          (rY[AZ(0x98c)] = Math[AZ(0xc0c)](
            0x1,
            Math[AZ(0x411)](rY[AZ(0x98c)])
          ));
        if (!rY[AZ(0xe6)] && rY[AZ(0x98c)] <= 0x0) {
          mN[AZ(0xb41)](rX, 0x1), rY[AZ(0xa5a)]();
          continue;
        }
        rY[AZ(0x397)][AZ(0x894)] = rY[AZ(0x98c)];
      }
      if (oL) {
        oM += pA / 0x7d0;
        if (oM > 0x1) {
          oM = 0x0;
          if (oN) {
            oL = ![];
            const rZ = oJ[AZ(0xa20)],
              s0 = oN[AZ(0x6df)];
            if (oN[AZ(0x74a)] > 0x0)
              o4[AZ(0x4a2)]((s1) => s1[AZ(0x9cf)]()),
                mQ(oJ["id"], s0),
                (oK = 0x0),
                oQ("?"),
                o1[AZ(0x474)][AZ(0x1b0)](AZ(0x6d6)),
                (o5 = nZ(rZ)),
                o1[AZ(0xd58)](o5),
                oP(o5[AZ(0x7cd)], oN[AZ(0x74a)]),
                (o5[AZ(0xc3)] = function () {
                  const B0 = AZ;
                  mQ(rZ["id"], oN[B0(0x74a)]), pw(), (oN = null);
                });
            else {
              oK = s0;
              const s1 = [...o4][AZ(0x1d0)](() => Math[AZ(0xb03)]() - 0.5);
              for (let s2 = 0x0, s3 = s1[AZ(0xbc8)]; s2 < s3; s2++) {
                const s4 = s1[s2];
                s2 >= s0 ? s4[AZ(0x9cf)]() : s4[AZ(0x183)](0x1 - s4[AZ(0xcca)]);
              }
              oN = null;
            }
            oO();
          }
        }
      }
      for (let s5 = 0x0; s5 < o4[AZ(0xbc8)]; s5++) {
        o4[s5][AZ(0x389)](oM);
      }
      for (let s6 in n4) {
        const s7 = n4[s6];
        if (!s7) {
          delete n4[s6];
          continue;
        }
        for (let s8 = s7[AZ(0xbc8)] - 0x1; s8 >= 0x0; s8--) {
          const s9 = s7[s8];
          s9["t"] += pA;
          if (s9[AZ(0x76b)]) s9["t"] > lX && s7[AZ(0xb41)](s8, 0x1);
          else {
            if (s9["t"] > lU) {
              const sa = 0x1 - Math[AZ(0xc0c)](0x1, (s9["t"] - lU) / 0x7d0);
              (s9[AZ(0x397)][AZ(0x894)] = sa),
                sa <= 0x0 && s7[AZ(0xb41)](s8, 0x1);
            }
          }
        }
        s7[AZ(0xbc8)] === 0x0 && delete n4[s6];
      }
      if (nP)
        su: {
          if (ik()) {
            (nQ += pA),
              (nI[AZ(0x397)][AZ(0x99f)] =
                AZ(0xb06) +
                (Math[AZ(0x7f1)](Date[AZ(0x603)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (nQ > 0x3e8) {
              if (nR) {
                pv(cI[AZ(0x48f)]), m0(![]);
                break su;
              }
              (nP = ![]),
                (nR = ![]),
                (nQ = 0x0),
                pv(),
                (oq += oz),
                oA(),
                oD(),
                m0(![]);
              const sb = d5(or);
              if (sb !== iN) {
                const sc = sb - iN;
                for (let se = 0x0; se < iN; se++) {
                  const sf = nl[AZ(0x8c1)][se];
                  sf[AZ(0xd36)] += sc;
                }
                const sd = nl[AZ(0xd5e)][AZ(0xd36)] + 0x1;
                for (let sg = 0x0; sg < sc; sg++) {
                  const sh = nA(AZ(0x417));
                  (sh[AZ(0xd36)] = iN + sg), nk[AZ(0xd58)](sh);
                  const si = nA(AZ(0x417));
                  (si[AZ(0xd36)] = sd + sg),
                    si[AZ(0xd58)](
                      nA(AZ(0x792) + ((sh[AZ(0xd36)] + 0x1) % 0xa) + AZ(0x548))
                    ),
                    nl[AZ(0xd58)](si);
                }
                (iN = sb), (iO = iN * 0x2);
              }
            }
          } else (nP = ![]), (nR = ![]), (nQ = 0x0);
        }
      (oy = pg(oy, ow, 0x64)),
        (ox = pg(ox, ov, 0x64)),
        (nL[AZ(0x397)][AZ(0x766)] = oy * 0x64 + "%"),
        (nM[AZ(0x397)][AZ(0x766)] = ox * 0x64 + "%");
      for (let sj in pp) {
        !pp[sj][AZ(0x5ec)] ? delete pp[sj] : (pp[sj][AZ(0x5ec)] = ![]);
      }
      (mW = pg(mW, mY, 0x32)), (mX = pg(mX, mZ, 0x32));
      const rL = Math[AZ(0xc0c)](0x64, pA) / 0x3c;
      pG -= 0x3 * rL;
      for (let sk = pj[AZ(0xbc8)] - 0x1; sk >= 0x0; sk--) {
        const sl = pj[sk];
        (sl["x"] += sl[AZ(0xa0f)] * rL),
          (sl["y"] += Math[AZ(0x7f1)](sl[AZ(0x903)] * 0x2) * 0.8 * rL),
          (sl[AZ(0x903)] += sl[AZ(0x86f)] * rL),
          (sl[AZ(0x9e3)] += 0.002 * pA),
          (sl[AZ(0xbff)] = !![]);
        const sm = sl[AZ(0x58f)] * 0x2;
        (sl["x"] >= d0 + sm || sl["y"] < -sm || sl["y"] >= d1 + sm) &&
          (pj[AZ(0xb41)](sk, 0x1), pk(![]));
      }
      for (let sn = 0x0; sn < iG[AZ(0xbc8)]; sn++) {
        iG[sn][AZ(0x8ee)]();
      }
      pf = Math[AZ(0x411)](0x0, pf - pA / 0x12c);
      if (oV[AZ(0x286)] && pf > 0x0) {
        const so = Math[AZ(0xb03)]() * 0x2 * Math["PI"],
          sp = pf * 0x3;
        (qu = Math[AZ(0xa87)](so) * sp), (qv = Math[AZ(0x7f1)](so) * sp);
      } else (qu = 0x0), (qv = 0x0);
      (ph = pg(ph, pu, 0xc8)), (n1 = pg(n1, n0, 0x64));
      for (let sq = ms[AZ(0xbc8)] - 0x1; sq >= 0x0; sq--) {
        const sr = ms[sq];
        sr[AZ(0x8ee)](), sr[AZ(0x87f)] && ms[AZ(0xb41)](sq, 0x1);
      }
      for (let ss = iw[AZ(0xbc8)] - 0x1; ss >= 0x0; ss--) {
        const st = iw[ss];
        st[AZ(0x8ee)](),
          st[AZ(0x3d9)] && st[AZ(0xd72)] > 0x1 && iw[AZ(0xb41)](ss, 0x1);
      }
      iy && ((pd = iy["x"]), (pe = iy["y"])), qs(), window[AZ(0xa48)](pD);
    }
    var pE = pF();
    function pF() {
      const B1 = uf,
        rK = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[B1(0x4b0)], 0x19);
      return (rK[B1(0x936)] = 0x1), rK;
    }
    var pG = 0x0,
      pH = [uf(0x4ce), uf(0x353), uf(0xc19)],
      pI = [];
    for (let rK = 0x0; rK < 0x3; rK++) {
      for (let rL = 0x0; rL < 0x3; rL++) {
        const rM = pJ(pH[rK], 0x1 - 0.05 * rL);
        pI[uf(0x6aa)](rM);
      }
    }
    function pJ(rN, rO) {
      const B2 = uf;
      return pK(hA(rN)[B2(0x2f3)]((rP) => rP * rO));
    }
    function pK(rN) {
      const B3 = uf;
      return rN[B3(0x1bd)](
        (rO, rP) => rO + parseInt(rP)[B3(0x12a)](0x10)[B3(0x5d8)](0x2, "0"),
        "#"
      );
    }
    function pL(rN) {
      const B4 = uf;
      return B4(0x5c9) + rN[B4(0x4c4)](",") + ")";
    }
    var pM = document[uf(0xa10)](uf(0x55b));
    function pN() {
      const B5 = uf,
        rN = document[B5(0x966)](B5(0x606));
      rN[B5(0x766)] = rN[B5(0x3bb)] = 0x3;
      const rO = rN[B5(0xb87)]("2d");
      for (let rP = 0x0; rP < pI[B5(0xbc8)]; rP++) {
        const rQ = rP % 0x3,
          rR = (rP - rQ) / 0x3;
        (rO[B5(0x716)] = pI[rP]), rO[B5(0x193)](rQ, rR, 0x1, 0x1);
        const rS = j7[rP],
          rT = j8[rP],
          rU = nA(
            B5(0xbd6) +
              rT +
              B5(0xda7) +
              ((rR + 0.5) / 0x3) * 0x64 +
              B5(0x2c2) +
              ((rQ + 0.5) / 0x3) * 0x64 +
              B5(0x404) +
              rS +
              B5(0x395)
          );
        pM[B5(0x393)](rU, pM[B5(0x8c1)][0x0]);
      }
      pM[B5(0x397)][B5(0x632)] = B5(0xc99) + rN[B5(0x11e)]() + ")";
    }
    pN();
    var pO = document[uf(0xa10)](uf(0x76d)),
      pP = document[uf(0xa10)](uf(0x40b));
    function pQ(rN, rO, rP) {
      const B6 = uf;
      (rN[B6(0x397)][B6(0x502)] = (rO / j2) * 0x64 + "%"),
        (rN[B6(0x397)][B6(0x765)] = (rP / j2) * 0x64 + "%");
    }
    function pR() {
      const B7 = uf,
        rN = qx(),
        rO = d0 / 0x2 / rN,
        rP = d1 / 0x2 / rN,
        rQ = j4,
        rR = Math[B7(0x411)](0x0, Math[B7(0xa9a)]((pd - rO) / rQ) - 0x1),
        rS = Math[B7(0x411)](0x0, Math[B7(0xa9a)]((pe - rP) / rQ) - 0x1),
        rT = Math[B7(0xc0c)](j5 - 0x1, Math[B7(0x435)]((pd + rO) / rQ)),
        rU = Math[B7(0xc0c)](j5 - 0x1, Math[B7(0x435)]((pe + rP) / rQ));
      kj[B7(0xa26)](), kj[B7(0x6ff)](rQ, rQ), kj[B7(0x787)]();
      for (let rV = rR; rV <= rT + 0x1; rV++) {
        kj[B7(0x92d)](rV, rS), kj[B7(0xbe4)](rV, rU + 0x1);
      }
      for (let rW = rS; rW <= rU + 0x1; rW++) {
        kj[B7(0x92d)](rR, rW), kj[B7(0xbe4)](rT + 0x1, rW);
      }
      kj[B7(0x20f)]();
      for (let rX = rR; rX <= rT; rX++) {
        for (let rY = rS; rY <= rU; rY++) {
          kj[B7(0xa26)](),
            kj[B7(0xb25)]((rX + 0.5) * rQ, (rY + 0.5) * rQ),
            pt(kj, rX + "," + rY, 0x28, B7(0xb5c), 0x6),
            kj[B7(0x20f)]();
        }
      }
      (kj[B7(0xfb)] = B7(0xd1d)),
        (kj[B7(0x6b1)] = 0xa),
        (kj[B7(0x625)] = B7(0xac6)),
        kj[B7(0x6f2)]();
    }
    function pS(rN, rO) {
      const B8 = uf,
        rP = nA(B8(0xa1a) + rN + B8(0x4e8) + rO + B8(0xd48)),
        rQ = rP[B8(0xa10)](B8(0xc8e));
      return (
        km[B8(0xd58)](rP),
        (rP[B8(0x9b4)] = function (rR) {
          const B9 = B8;
          rR > 0x0 && rR !== 0x1
            ? (rQ[B9(0x491)](B9(0x397), B9(0x506) + rR * 0x168 + B9(0x66e)),
              rP[B9(0x474)][B9(0x1b0)](B9(0x9b3)))
            : rP[B9(0x474)][B9(0xa5a)](B9(0x9b3));
        }),
        km[B8(0x393)](rP, pM),
        rP
      );
    }
    var pT = pS(uf(0x72d), uf(0x95d));
    pT[uf(0x474)][uf(0x1b0)](uf(0x765));
    var pU = nA(uf(0x4b3) + hP[uf(0x25e)] + uf(0x32e));
    pT[uf(0x8c1)][0x0][uf(0xd58)](pU);
    var pV = pS(uf(0x661), uf(0xbfe)),
      pW = pS(uf(0xf9), uf(0x1d2));
    pW[uf(0x474)][uf(0x1b0)](uf(0x89a));
    var pX = uf(0x322),
      pY = 0x2bc,
      pZ = new lT("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cY[uf(0x4b0)], 0x19);
    pZ[uf(0x5b7)] = 0x0;
    var q0 = [
      [uf(0xb18), uf(0x9f6)],
      [uf(0x8f3), uf(0x1b2)],
      [uf(0x644), uf(0xab8)],
      [uf(0xa22), uf(0x9a8), uf(0x882)],
      [uf(0x44d), uf(0x1ec)],
      [uf(0x51d), uf(0xb4a)],
      [uf(0x98f), uf(0xb68)],
    ];
    function q1() {
      const Ba = uf;
      let rN = "";
      const rO = q0[Ba(0xbc8)] - 0x1;
      for (let rP = 0x0; rP < rO; rP++) {
        const rQ = q0[rP][0x0];
        (rN += rQ),
          rP === rO - 0x1
            ? (rN += Ba(0x347) + q0[rP + 0x1][0x0] + ".")
            : (rN += ",\x20");
      }
      return rN;
    }
    var q2 = q1(),
      q3 = document[uf(0xa10)](uf(0x4d3));
    (q3[uf(0xbca)] = function () {
      const Bb = uf;
      return nA(
        Bb(0xbb7) +
          hP[Bb(0xcd9)] +
          Bb(0x1d4) +
          hP[Bb(0x409)] +
          Bb(0x5cc) +
          hP[Bb(0x970)] +
          Bb(0x457) +
          q2 +
          Bb(0x38b)
      );
    }),
      (q3[uf(0xc6b)] = !![]);
    var q4 =
      Date[uf(0x603)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[uf(0xa9a)](Math[uf(0xb03)]() * q0[uf(0xbc8)]);
    function q5() {
      const Bc = uf,
        rN = q0[q4];
      (pZ[Bc(0x2ab)] = rN[0x0]), (pZ[Bc(0x461)] = rN[0x1]);
      for (let rO of iZ) {
        pZ[rO] = Math[Bc(0xb03)]() > 0.5;
      }
      q4 = (q4 + 0x1) % q0[Bc(0xbc8)];
    }
    q5(),
      (q3[uf(0xc3)] = function () {
        const Bd = uf;
        window[Bd(0x996)](pZ[Bd(0x461)], Bd(0x1e9)), q5();
      });
    var q6 = new lT(uf(0x9e1), 0x0, -0x19, 0x0, 0x1, cY[uf(0x4b0)], 0x19);
    (q6[uf(0x5b7)] = 0x0), (q6[uf(0xacb)] = !![]);
    var q7 = [
        uf(0x39f),
        uf(0x85b),
        uf(0x7c6),
        uf(0x3b2),
        uf(0xf0),
        uf(0x4a8),
        uf(0x2b6),
      ],
      q8 = [
        uf(0x1ee),
        uf(0x569),
        uf(0x93d),
        uf(0x8bc),
        uf(0x778),
        uf(0x7e2),
        uf(0xbbd),
        uf(0x7ef),
      ],
      q9 = 0x0;
    function qa() {
      const Be = uf,
        rN = {};
      (rN[Be(0x1c8)] = q7[q9 % q7[Be(0xbc8)]]),
        (rN[Be(0x76b)] = !![]),
        (rN[Be(0xd85)] = n3["me"]),
        n7(Be(0x9e1), rN),
        n7("yt", {
          text: q8[q9 % q8[Be(0xbc8)]][Be(0x516)](
            Be(0xa2e),
            kE[Be(0x94c)][Be(0x11a)]() || Be(0xa64)
          ),
          isFakeChat: !![],
          col: n3["me"],
        }),
        q9++;
    }
    qa(), setInterval(qa, 0xfa0);
    var qb = 0x0,
      qc = Math[uf(0x435)](
        (Math[uf(0x411)](screen[uf(0x766)], screen[uf(0x3bb)], kU(), kV()) *
          window[uf(0x536)]) /
          0xc
      ),
      qd = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[uf(0x48b)], 0x19);
    (qd[uf(0x3d9)] = !![]), (qd[uf(0xba6)] = 0x1), (qd[uf(0x6ff)] = 0.6);
    var qe = (function () {
        const Bf = uf,
          rN = document[Bf(0x966)](Bf(0x606)),
          rO = qc * 0x2;
        (rN[Bf(0x766)] = rN[Bf(0x3bb)] = rO),
          (rN[Bf(0x397)][Bf(0x766)] = rN[Bf(0x397)][Bf(0x3bb)] = Bf(0xccc));
        const rP = document[Bf(0xa10)](Bf(0x12d));
        rP[Bf(0xd58)](rN);
        const rQ = rN[Bf(0xb87)]("2d");
        return (
          (rN[Bf(0x13a)] = function () {
            const Bg = Bf;
            (qd[Bg(0x26e)] = ![]),
              rQ[Bg(0xa13)](0x0, 0x0, rO, rO),
              rQ[Bg(0xa26)](),
              rQ[Bg(0x5b0)](rO / 0x64),
              rQ[Bg(0xb25)](0x32, 0x32),
              rQ[Bg(0x5b0)](0.8),
              rQ[Bg(0x710)](-Math["PI"] / 0x8),
              qd[Bg(0x7e5)](rQ),
              rQ[Bg(0x20f)]();
          }),
          rN
        );
      })(),
      qf,
      qg,
      qh,
      qi = ![];
    function qj() {
      const Bh = uf;
      if (qi) return;
      (qi = !![]), iB();
      const rN = qn(qc);
      qh = rN[Bh(0x11e)](Bh(0x92b));
      const rO = qf * 0x64 + "%\x20" + qg * 0x64 + Bh(0x47e),
        rP = nA(
          Bh(0x2a7) +
            hQ[Bh(0x2f3)](
              (rQ, rR) => Bh(0x87b) + rR + Bh(0x317) + rQ + Bh(0x7b5)
            )[Bh(0x4c4)]("\x0a") +
            Bh(0x9d2) +
            no[Bh(0x99b)] +
            Bh(0x336) +
            no[Bh(0x79a)] +
            Bh(0x688) +
            no[Bh(0x9d7)] +
            Bh(0x45f) +
            dH +
            Bh(0xaf2) +
            qh +
            Bh(0xa18) +
            rO +
            Bh(0x3b3) +
            rO +
            Bh(0x86b) +
            rO +
            Bh(0x6c9) +
            rO +
            Bh(0x45a)
        );
      document[Bh(0x53e)][Bh(0xd58)](rP);
    }
    function qk(rN) {
      const Bi = uf,
        rO =
          -rN[Bi(0x146)]["x"] * 0x64 +
          "%\x20" +
          -rN[Bi(0x146)]["y"] * 0x64 +
          "%";
      return (
        Bi(0x60f) +
        rO +
        Bi(0xb52) +
        rO +
        Bi(0xbae) +
        rO +
        Bi(0xd92) +
        rO +
        ";\x22"
      );
    }
    if (document[uf(0xc53)] && document[uf(0xc53)][uf(0x552)]) {
      const rN = setTimeout(qj, 0x1f40);
      document[uf(0xc53)][uf(0x552)][uf(0xb51)](() => {
        const Bj = uf;
        console[Bj(0xabc)](Bj(0xd15)), clearTimeout(rN), qj();
      });
    } else qj();
    var ql = [];
    qm();
    function qm() {
      const Bk = uf,
        rO = {};
      (qf = 0xf), (ql = []);
      let rP = 0x0;
      for (let rR = 0x0; rR < dC[Bk(0xbc8)]; rR++) {
        const rS = dC[rR],
          rT = Bk(0x65c) + rS[Bk(0xaba)] + "_" + (rS[Bk(0xcca)] || 0x1),
          rU = rO[rT];
        if (rU === void 0x0) (rS[Bk(0x146)] = rO[rT] = rQ()), ql[Bk(0x6aa)](rS);
        else {
          rS[Bk(0x146)] = rU;
          continue;
        }
      }
      for (let rV = 0x0; rV < eK[Bk(0xbc8)]; rV++) {
        const rW = eK[rV],
          rX = Bk(0xb36) + rW[Bk(0xaba)],
          rY = rO[rX];
        if (rY === void 0x0) rW[Bk(0x146)] = rO[rX] = rQ();
        else {
          rW[Bk(0x146)] = rY;
          continue;
        }
      }
      function rQ() {
        const Bl = Bk;
        return { x: rP % qf, y: Math[Bl(0xa9a)](rP / qf), index: rP++ };
      }
    }
    function qn(rO) {
      const Bm = uf,
        rP = ql[Bm(0xbc8)] + eL;
      qg = Math[Bm(0x435)](rP / qf);
      const rQ = document[Bm(0x966)](Bm(0x606));
      (rQ[Bm(0x766)] = rO * qf), (rQ[Bm(0x3bb)] = rO * qg);
      const rR = rQ[Bm(0xb87)]("2d"),
        rS = 0x5a,
        rT = rS / 0x2,
        rU = rO / rS;
      rR[Bm(0x6ff)](rU, rU), rR[Bm(0xb25)](rT, rT);
      for (let rV = 0x0; rV < ql[Bm(0xbc8)]; rV++) {
        const rW = ql[rV];
        rR[Bm(0xa26)](),
          rR[Bm(0xb25)](rW[Bm(0x146)]["x"] * rS, rW[Bm(0x146)]["y"] * rS),
          rR[Bm(0xa26)](),
          rR[Bm(0xb25)](0x0 + rW[Bm(0xda5)], -0x5 + rW[Bm(0x1ed)]),
          rW[Bm(0xd89)](rR),
          rR[Bm(0x20f)](),
          (rR[Bm(0x716)] = Bm(0xb5c)),
          (rR[Bm(0x1d9)] = Bm(0x89a)),
          (rR[Bm(0x266)] = Bm(0x3f3)),
          (rR[Bm(0x433)] = Bm(0xb1a) + iA),
          (rR[Bm(0x6b1)] = h5 ? 0x5 : 0x3),
          (rR[Bm(0xfb)] = Bm(0xcfd)),
          (rR[Bm(0x625)] = rR[Bm(0x70b)] = Bm(0xac6)),
          rR[Bm(0xb25)](0x0, rT - 0x8 - rR[Bm(0x6b1)]);
        let rX = rW[Bm(0xaba)];
        h5 && (rX = h7(rX));
        const rY = rR[Bm(0xc78)](rX)[Bm(0x766)] + rR[Bm(0x6b1)],
          rZ = Math[Bm(0xc0c)](0x4c / rY, 0x1);
        rR[Bm(0x6ff)](rZ, rZ),
          rR[Bm(0x10a)](rX, 0x0, 0x0),
          rR[Bm(0x940)](rX, 0x0, 0x0),
          rR[Bm(0x20f)]();
      }
      for (let s0 = 0x0; s0 < eL; s0++) {
        const s1 = eK[s0];
        rR[Bm(0xa26)](),
          rR[Bm(0xb25)](s1[Bm(0x146)]["x"] * rS, s1[Bm(0x146)]["y"] * rS),
          s1[Bm(0xdbe)] !== void 0x0 &&
            (rR[Bm(0x787)](), rR[Bm(0xcae)](-rT, -rT, rS, rS), rR[Bm(0x63f)]()),
          rR[Bm(0xb25)](s1[Bm(0xda5)], s1[Bm(0x1ed)]),
          s1[Bm(0xd89)](rR),
          rR[Bm(0x20f)]();
      }
      return rQ;
    }
    var qo = new lG(-0x1, cS[uf(0xbc6)], 0x0, 0x0, Math[uf(0xb03)]() * 6.28);
    qo[uf(0x58f)] = 0x32;
    function qp() {
      const Bn = uf;
      kj[Bn(0x769)](j2 / 0x2, j2 / 0x2, j2 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qq(rO) {
      const Bo = uf,
        rP = rO[Bo(0xbc8)],
        rQ = document[Bo(0x966)](Bo(0x606));
      rQ[Bo(0x766)] = rQ[Bo(0x3bb)] = rP;
      const rR = rQ[Bo(0xb87)]("2d"),
        rS = rR[Bo(0x41f)](rP, rP);
      for (let rT = 0x0; rT < rP; rT++) {
        for (let rU = 0x0; rU < rP; rU++) {
          const rV = rO[rT][rU];
          if (!rV) continue;
          const rW = (rT * rP + rU) * 0x4;
          rS[Bo(0x813)][rW + 0x3] = 0xff;
        }
      }
      return rR[Bo(0x4ca)](rS, 0x0, 0x0), rQ;
    }
    function qr() {
      const Bp = uf;
      if (!jK) return;
      kj[Bp(0xa26)](),
        kj[Bp(0x787)](),
        qp(),
        kj[Bp(0x63f)](),
        !jK[Bp(0x606)] && (jK[Bp(0x606)] = qq(jK)),
        (kj[Bp(0x76c)] = ![]),
        (kj[Bp(0x74e)] = 0.08),
        kj[Bp(0x6c0)](jK[Bp(0x606)], 0x0, 0x0, j2, j2),
        kj[Bp(0x20f)]();
    }
    function qs() {
      const Bq = uf;
      lM = 0x0;
      const rO = kR * kW;
      qb = 0x0;
      for (let rT = 0x0; rT < nx[Bq(0xbc8)]; rT++) {
        const rU = nx[rT];
        rU[Bq(0x32a)] && rU[Bq(0x13a)]();
      }
      if (
        kk[Bq(0x397)][Bq(0x373)] === "" ||
        document[Bq(0x53e)][Bq(0x474)][Bq(0xdb3)](Bq(0x2b1))
      ) {
        (kj[Bq(0x716)] = Bq(0x4ce)),
          kj[Bq(0x193)](0x0, 0x0, ki[Bq(0x766)], ki[Bq(0x3bb)]),
          kj[Bq(0xa26)]();
        let rV = Math[Bq(0x411)](ki[Bq(0x766)] / d0, ki[Bq(0x3bb)] / d1);
        kj[Bq(0x6ff)](rV, rV),
          kj[Bq(0xcae)](0x0, 0x0, d0, d1),
          kj[Bq(0xa26)](),
          kj[Bq(0xb25)](pG, -pG),
          kj[Bq(0x6ff)](1.25, 1.25),
          (kj[Bq(0x716)] = kY),
          kj[Bq(0x190)](),
          kj[Bq(0x20f)]();
        for (let rW = 0x0; rW < pj[Bq(0xbc8)]; rW++) {
          pj[rW][Bq(0x7e5)](kj);
        }
        kj[Bq(0x20f)]();
        if (oV[Bq(0xd54)] && oY[Bq(0xcb4)] > 0x0) {
          const rX = oY[Bq(0x7fc)]();
          kj[Bq(0xa26)]();
          let rY = kW;
          kj[Bq(0x6ff)](rY, rY),
            kj[Bq(0xb25)](
              rX["x"] + rX[Bq(0x766)] / 0x2,
              rX["y"] + rX[Bq(0x3bb)]
            ),
            kj[Bq(0x5b0)](kR * 0.8),
            q6[Bq(0x7e5)](kj),
            kj[Bq(0x6ff)](0.7, 0.7),
            q6[Bq(0x999)](kj),
            kj[Bq(0x20f)]();
        }
        if (q3[Bq(0xcb4)] > 0x0) {
          const rZ = q3[Bq(0x7fc)]();
          kj[Bq(0xa26)]();
          let s0 = kW;
          kj[Bq(0x6ff)](s0, s0),
            kj[Bq(0xb25)](
              rZ["x"] + rZ[Bq(0x766)] / 0x2,
              rZ["y"] + rZ[Bq(0x3bb)] * 0.6
            ),
            kj[Bq(0x5b0)](kR * 0.8),
            pZ[Bq(0x7e5)](kj),
            kj[Bq(0x5b0)](0.7),
            kj[Bq(0xa26)](),
            kj[Bq(0xb25)](0x0, -pZ[Bq(0x58f)] - 0x23),
            pt(kj, pZ[Bq(0x2ab)], 0x12, Bq(0xb5c), 0x3),
            kj[Bq(0x20f)](),
            pZ[Bq(0x999)](kj),
            kj[Bq(0x20f)]();
        }
        if (hm[Bq(0xcb4)] > 0x0) {
          const s1 = hm[Bq(0x7fc)]();
          kj[Bq(0xa26)]();
          let s3 = kW;
          kj[Bq(0x6ff)](s3, s3),
            kj[Bq(0xb25)](
              s1["x"] + s1[Bq(0x766)] / 0x2,
              s1["y"] + s1[Bq(0x3bb)] * 0.5
            ),
            kj[Bq(0x5b0)](kR),
            qo[Bq(0x7e5)](kj),
            kj[Bq(0x20f)]();
        }
        return;
      }
      if (jy)
        (kj[Bq(0x716)] = pI[0x0]),
          kj[Bq(0x193)](0x0, 0x0, ki[Bq(0x766)], ki[Bq(0x3bb)]);
      else {
        kj[Bq(0xa26)](), qw();
        for (let s4 = -0x1; s4 < 0x4; s4++) {
          for (let s5 = -0x1; s5 < 0x4; s5++) {
            const s6 = Math[Bq(0x411)](0x0, Math[Bq(0xc0c)](s5, 0x2)),
              s7 = Math[Bq(0x411)](0x0, Math[Bq(0xc0c)](s4, 0x2));
            (kj[Bq(0x716)] = pI[s7 * 0x3 + s6]),
              kj[Bq(0x193)](s5 * j3, s4 * j3, j3, j3);
          }
        }
        kj[Bq(0x787)](),
          kj[Bq(0xcae)](0x0, 0x0, j2, j2),
          kj[Bq(0x63f)](),
          kj[Bq(0x787)](),
          kj[Bq(0x92d)](-0xa, j3),
          kj[Bq(0xbe4)](j3 * 0x2, j3),
          kj[Bq(0x92d)](j3 * 0x2, j3 * 0.5),
          kj[Bq(0xbe4)](j3 * 0x2, j3 * 1.5),
          kj[Bq(0x92d)](j3 * 0x1, j3 * 0x2),
          kj[Bq(0xbe4)](j2 + 0xa, j3 * 0x2),
          kj[Bq(0x92d)](j3, j3 * 1.5),
          kj[Bq(0xbe4)](j3, j3 * 2.5),
          (kj[Bq(0x6b1)] = pY * 0x2),
          (kj[Bq(0x625)] = Bq(0xac6)),
          (kj[Bq(0xfb)] = pX),
          kj[Bq(0x6f2)](),
          kj[Bq(0x20f)]();
      }
      kj[Bq(0xa26)](),
        kj[Bq(0x787)](),
        kj[Bq(0xcae)](0x0, 0x0, ki[Bq(0x766)], ki[Bq(0x3bb)]),
        qw();
      oV[Bq(0xa4a)] && ((kj[Bq(0x716)] = kY), kj[Bq(0x190)]());
      kj[Bq(0x787)]();
      jy ? qp() : kj[Bq(0xcae)](0x0, 0x0, j2, j2);
      kj[Bq(0x20f)](),
        kj[Bq(0xcae)](0x0, 0x0, ki[Bq(0x766)], ki[Bq(0x3bb)]),
        (kj[Bq(0x716)] = pX),
        kj[Bq(0x190)](Bq(0x8e9)),
        kj[Bq(0xa26)](),
        qw();
      oV[Bq(0xd4c)] && pR();
      qr();
      const rP = [];
      let rQ = [];
      for (let s8 = 0x0; s8 < iw[Bq(0xbc8)]; s8++) {
        const s9 = iw[s8];
        if (s9[Bq(0xb9d)]) {
          if (iy) {
            if (
              pz - s9[Bq(0x260)] < 0x3e8 ||
              Math[Bq(0x4b2)](s9["nx"] - iy["x"], s9["ny"] - iy["y"]) <
                Math[Bq(0x4b2)](s9["ox"] - iy["x"], s9["oy"] - iy["y"])
            ) {
              rP[Bq(0x6aa)](s9), (s9[Bq(0x260)] = pz);
              continue;
            }
          }
        }
        s9 !== iy && rQ[Bq(0x6aa)](s9);
      }
      (rQ = qt(rQ, (sa) => sa[Bq(0x511)] === cS[Bq(0x86c)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x511)] === cS[Bq(0xcf0)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x511)] === cS[Bq(0x790)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0xd5a)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x2e3)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0xd19)] && !sa[Bq(0xd94)])),
        (rQ = qt(rQ, (sa) => !sa[Bq(0xd94)])),
        qt(rQ, (sa) => !![]);
      iy && iy[Bq(0x7e5)](kj);
      for (let sa = 0x0; sa < rP[Bq(0xbc8)]; sa++) {
        rP[sa][Bq(0x7e5)](kj);
      }
      if (oV[Bq(0x499)]) {
        kj[Bq(0x787)]();
        for (let sb = 0x0; sb < iw[Bq(0xbc8)]; sb++) {
          const sc = iw[sb];
          if (sc[Bq(0x3d9)]) continue;
          if (sc[Bq(0x660)]) {
            kj[Bq(0xa26)](),
              kj[Bq(0xb25)](sc["x"], sc["y"]),
              kj[Bq(0x710)](sc[Bq(0x903)]);
            if (!sc[Bq(0x44f)])
              kj[Bq(0xcae)](-sc[Bq(0x58f)], -0xa, sc[Bq(0x58f)] * 0x2, 0x14);
            else {
              kj[Bq(0x92d)](-sc[Bq(0x58f)], -0xa),
                kj[Bq(0xbe4)](-sc[Bq(0x58f)], 0xa);
              const sd = 0xa + sc[Bq(0x44f)] * sc[Bq(0x58f)] * 0x2;
              kj[Bq(0xbe4)](sc[Bq(0x58f)], sd),
                kj[Bq(0xbe4)](sc[Bq(0x58f)], -sd),
                kj[Bq(0xbe4)](-sc[Bq(0x58f)], -0xa);
            }
            kj[Bq(0x20f)]();
          } else
            kj[Bq(0x92d)](sc["x"] + sc[Bq(0x58f)], sc["y"]),
              kj[Bq(0x769)](sc["x"], sc["y"], sc[Bq(0x58f)], 0x0, l0);
        }
        (kj[Bq(0x6b1)] = 0x2), (kj[Bq(0xfb)] = Bq(0x9d7)), kj[Bq(0x6f2)]();
      }
      const rR = oV[Bq(0xc25)] ? 0x1 / qy() : 0x1;
      for (let se = 0x0; se < iw[Bq(0xbc8)]; se++) {
        const sf = iw[se];
        !sf[Bq(0xd19)] && sf[Bq(0xbff)] && lY(sf, kj, rR);
      }
      for (let sg = 0x0; sg < iw[Bq(0xbc8)]; sg++) {
        const sh = iw[sg];
        sh[Bq(0x5e5)] && sh[Bq(0x999)](kj, rR);
      }
      const rS = pA / 0x12;
      kj[Bq(0xa26)](),
        (kj[Bq(0x6b1)] = 0x7),
        (kj[Bq(0xfb)] = Bq(0xb5c)),
        (kj[Bq(0x625)] = kj[Bq(0x70b)] = Bq(0xb12));
      for (let si = iF[Bq(0xbc8)] - 0x1; si >= 0x0; si--) {
        const sj = iF[si];
        sj["a"] -= pA / 0x1f4;
        if (sj["a"] <= 0x0) {
          iF[Bq(0xb41)](si, 0x1);
          continue;
        }
        (kj[Bq(0x74e)] = sj["a"]), kj[Bq(0x6f2)](sj[Bq(0x6e8)]);
      }
      kj[Bq(0x20f)]();
      if (oV[Bq(0x1a5)])
        for (let sk = iz[Bq(0xbc8)] - 0x1; sk >= 0x0; sk--) {
          const sl = iz[sk];
          (sl["x"] += sl["vx"] * rS),
            (sl["y"] += sl["vy"] * rS),
            (sl["vy"] += 0.35 * rS);
          if (sl["vy"] > 0xa) {
            iz[Bq(0xb41)](sk, 0x1);
            continue;
          }
          kj[Bq(0xa26)](),
            kj[Bq(0xb25)](sl["x"], sl["y"]),
            (kj[Bq(0x74e)] = 0x1 - Math[Bq(0x411)](0x0, sl["vy"] / 0xa)),
            kj[Bq(0x6ff)](sl[Bq(0x58f)], sl[Bq(0x58f)]),
            sl[Bq(0x1c8)] !== void 0x0
              ? pt(kj, sl[Bq(0x1c8)], 0x15, Bq(0xab5), 0x2, ![], sl[Bq(0x58f)])
              : (kj[Bq(0x710)](sl[Bq(0x903)]),
                pq(kj, Bq(0x532) + sl[Bq(0x58f)], 0x1e, 0x1e, function (sm) {
                  const Br = Bq;
                  sm[Br(0xb25)](0xf, 0xf), nm(sm);
                })),
            kj[Bq(0x20f)]();
        }
      kj[Bq(0x20f)]();
      if (iy && oV[Bq(0x6d8)] && !oV[Bq(0xd32)]) {
        kj[Bq(0xa26)](),
          kj[Bq(0xb25)](ki[Bq(0x766)] / 0x2, ki[Bq(0x3bb)] / 0x2),
          kj[Bq(0x710)](Math[Bq(0xbaa)](mX, mW)),
          kj[Bq(0x6ff)](rO, rO);
        const sm = 0x28;
        let sn = Math[Bq(0x4b2)](mW, mX) / kR;
        kj[Bq(0x787)](),
          kj[Bq(0x92d)](sm, 0x0),
          kj[Bq(0xbe4)](sn, 0x0),
          kj[Bq(0xbe4)](sn + -0x14, -0x14),
          kj[Bq(0x92d)](sn, 0x0),
          kj[Bq(0xbe4)](sn + -0x14, 0x14),
          (kj[Bq(0x6b1)] = 0xc),
          (kj[Bq(0x625)] = Bq(0xac6)),
          (kj[Bq(0x70b)] = Bq(0xac6)),
          (kj[Bq(0x74e)] =
            sn < 0x64 ? Math[Bq(0x411)](sn - 0x32, 0x0) / 0x32 : 0x1),
          (kj[Bq(0xfb)] = Bq(0xd1d)),
          kj[Bq(0x6f2)](),
          kj[Bq(0x20f)]();
      }
      kj[Bq(0xa26)](),
        kj[Bq(0x6ff)](rO, rO),
        kj[Bq(0xb25)](0x28, 0x1e + 0x32),
        kj[Bq(0x5b0)](0.85);
      for (let so = 0x0; so < px[Bq(0xbc8)]; so++) {
        const sp = px[so];
        if (so > 0x0) {
          const sq = lI(Math[Bq(0x411)](sp[Bq(0x936)] - 0.5, 0x0) / 0.5);
          kj[Bq(0xb25)](0x0, (so === 0x0 ? 0x46 : 0x41) * (0x1 - sq));
        }
        kj[Bq(0xa26)](),
          so > 0x0 &&
            (kj[Bq(0xb25)](lI(sp[Bq(0x936)]) * -0x190, 0x0),
            kj[Bq(0x5b0)](0.85)),
          kj[Bq(0xa26)](),
          lZ(sp, kj, !![]),
          (sp["id"] = (sp[Bq(0xc11)] && sp[Bq(0xc11)]["id"]) || -0x1),
          sp[Bq(0x7e5)](kj),
          (sp["id"] = -0x1),
          kj[Bq(0x20f)](),
          sp[Bq(0x542)] !== void 0x0 &&
            (kj[Bq(0xa26)](),
            kj[Bq(0x710)](sp[Bq(0x542)]),
            kj[Bq(0xb25)](0x20, 0x0),
            kj[Bq(0x787)](),
            kj[Bq(0x92d)](0x0, 0x6),
            kj[Bq(0xbe4)](0x0, -0x6),
            kj[Bq(0xbe4)](0x6, 0x0),
            kj[Bq(0x8ef)](),
            (kj[Bq(0x6b1)] = 0x4),
            (kj[Bq(0x625)] = kj[Bq(0x70b)] = Bq(0xac6)),
            (kj[Bq(0xfb)] = Bq(0x69c)),
            kj[Bq(0x6f2)](),
            (kj[Bq(0x716)] = Bq(0xb5c)),
            kj[Bq(0x190)](),
            kj[Bq(0x20f)]()),
          kj[Bq(0x20f)]();
      }
      kj[Bq(0x20f)]();
    }
    function qt(rO, rP) {
      const Bs = uf,
        rQ = [];
      for (let rR = 0x0; rR < rO[Bs(0xbc8)]; rR++) {
        const rS = rO[rR];
        if (rP[Bs(0x9ed)] !== void 0x0 ? rP(rS) : rS[rP]) rS[Bs(0x7e5)](kj);
        else rQ[Bs(0x6aa)](rS);
      }
      return rQ;
    }
    var qu = 0x0,
      qv = 0x0;
    function qw() {
      const Bt = uf;
      kj[Bt(0xb25)](ki[Bt(0x766)] / 0x2, ki[Bt(0x3bb)] / 0x2);
      let rO = qx();
      kj[Bt(0x6ff)](rO, rO),
        kj[Bt(0xb25)](-pd, -pe),
        oV[Bt(0x286)] && kj[Bt(0xb25)](qu, qv);
    }
    function qx() {
      const Bu = uf;
      return Math[Bu(0x411)](ki[Bu(0x766)] / d0, ki[Bu(0x3bb)] / d1) * qy();
    }
    function qy() {
      return n1 / ph;
    }
    kX(), pD();
    const qz = {};
    (qz[uf(0x9ed)] = uf(0xab0)),
      (qz[uf(0x461)] = uf(0xb81)),
      (qz[uf(0x9da)] = uf(0x524));
    const qA = {};
    (qA[uf(0x9ed)] = uf(0x877)),
      (qA[uf(0x461)] = uf(0xa51)),
      (qA[uf(0x9da)] = uf(0x5c2));
    const qB = {};
    (qB[uf(0x9ed)] = uf(0xa5f)),
      (qB[uf(0x461)] = uf(0x28c)),
      (qB[uf(0x9da)] = uf(0xb2b));
    const qC = {};
    (qC[uf(0x9ed)] = uf(0x9f2)),
      (qC[uf(0x461)] = uf(0xa77)),
      (qC[uf(0x9da)] = uf(0x56a));
    const qD = {};
    (qD[uf(0x9ed)] = uf(0x3f1)),
      (qD[uf(0x461)] = uf(0x58a)),
      (qD[uf(0x9da)] = uf(0x4c0));
    const qE = {};
    (qE[uf(0x9ed)] = uf(0xa52)),
      (qE[uf(0x461)] = uf(0x9e9)),
      (qE[uf(0x9da)] = uf(0x4e1));
    const qF = {};
    (qF[uf(0x7f8)] = qz),
      (qF[uf(0xd57)] = qA),
      (qF[uf(0xcbd)] = qB),
      (qF[uf(0xd08)] = qC),
      (qF[uf(0xce6)] = qD),
      (qF[uf(0x365)] = qE);
    var qG = qF;
    if (window[uf(0x3c5)][uf(0x8b6)] !== uf(0x808))
      for (let rO in qG) {
        const rP = qG[rO];
        rP[uf(0x461)] = rP[uf(0x461)]
          [uf(0x516)](uf(0x808), uf(0x737))
          [uf(0x516)](uf(0x24e), uf(0x13e));
      }
    var qH = document[uf(0xa10)](uf(0x904)),
      qI = document[uf(0xa10)](uf(0xc88)),
      qJ = 0x0;
    for (let rQ in qG) {
      const rR = qG[rQ],
        rS = document[uf(0x966)](uf(0x5e9));
      rS[uf(0xa25)] = uf(0x5ea);
      const rT = document[uf(0x966)](uf(0x1b9));
      rT[uf(0x491)](uf(0x6f2), rR[uf(0x9ed)]), rS[uf(0xd58)](rT);
      const rU = document[uf(0x966)](uf(0x1b9));
      (rU[uf(0xa25)] = uf(0x43a)),
        (rR[uf(0xb98)] = 0x0),
        (rR[uf(0x26f)] = function (rV) {
          const Bv = uf;
          (qJ -= rR[Bv(0xb98)]),
            (rR[Bv(0xb98)] = rV),
            (qJ += rV),
            k8(rU, kh(rV, Bv(0x7c5))),
            rS[Bv(0xd58)](rU);
          const rW = Bv(0x762) + kh(qJ, Bv(0x7c5)) + Bv(0x30b);
          k8(qK, rW), k8(qI, rW);
        }),
        (rR[uf(0xb56)] = function () {
          const Bw = uf;
          rR[Bw(0x26f)](0x0), rU[Bw(0xa5a)]();
        }),
        (rS[uf(0x397)][uf(0x770)] = rR[uf(0x9da)]),
        qH[uf(0xd58)](rS),
        (rS[uf(0xc3)] = function () {
          const Bx = uf,
            rV = qH[Bx(0xa10)](Bx(0x271));
          if (rV === rS) return;
          rV && rV[Bx(0x474)][Bx(0xa5a)](Bx(0x359)),
            this[Bx(0x474)][Bx(0x1b0)](Bx(0x359)),
            qN(rR[Bx(0x461)]),
            (hD[Bx(0xbf0)] = rQ);
        }),
        (rR["el"] = rS);
    }
    var qK = document[uf(0x966)](uf(0x1b9));
    (qK[uf(0xa25)] = uf(0x6c3)), qH[uf(0xd58)](qK);
    if (!![]) {
      qL();
      let rV = Date[uf(0x603)]();
      setInterval(function () {
        pz - rV > 0x2710 && (qL(), (rV = pz));
      }, 0x3e8);
    }
    function qL() {
      const By = uf;
      fetch(By(0x131))
        [By(0xb51)]((rW) => rW[By(0x646)]())
        [By(0xb51)]((rW) => {
          const Bz = By;
          for (let rX in rW) {
            const rY = qG[rX];
            rY && rY[Bz(0x26f)](rW[rX]);
          }
        })
        [By(0xbc9)]((rW) => {
          const BA = By;
          console[BA(0x126)](BA(0xa80), rW);
        });
    }
    var qM = window[uf(0x99c)] || window[uf(0x3c5)][uf(0xa54)] === uf(0x408);
    if (qM) hV(window[uf(0x3c5)][uf(0x5e4)][uf(0x516)](uf(0x4e5), "ws"));
    else {
      const rW = qG[hD[uf(0xbf0)]];
      if (rW) rW["el"][uf(0x6ad)]();
      else {
        let rX = "EU";
        fetch(uf(0xa43))
          [uf(0xb51)]((rY) => rY[uf(0x646)]())
          [uf(0xb51)]((rY) => {
            const BB = uf;
            if (["NA", "SA"][BB(0x20a)](rY[BB(0x3f9)])) rX = "US";
            else ["AS", "OC"][BB(0x20a)](rY[BB(0x3f9)]) && (rX = "AS");
          })
          [uf(0xbc9)]((rY) => {
            const BC = uf;
            console[BC(0xabc)](BC(0xd93));
          })
          [uf(0x837)](function () {
            const BD = uf,
              rY = [];
            for (let s0 in qG) {
              const s1 = qG[s0];
              s1[BD(0x9ed)][BD(0xb93)](rX) && rY[BD(0x6aa)](s1);
            }
            const rZ =
              rY[Math[BD(0xa9a)](Math[BD(0xb03)]() * rY[BD(0xbc8)])] ||
              qG[BD(0xdc8)];
            console[BD(0xabc)](BD(0x2e2) + rX + BD(0x82e) + rZ[BD(0x9ed)]),
              rZ["el"][BD(0x6ad)]();
          });
      }
    }
    (document[uf(0xa10)](uf(0x90c))[uf(0x397)][uf(0x373)] = uf(0x972)),
      kA[uf(0x474)][uf(0x1b0)](uf(0x9b3)),
      kB[uf(0x474)][uf(0xa5a)](uf(0x9b3)),
      (window[uf(0xabe)] = function () {
        il(new Uint8Array([0xff]));
      });
    function qN(rY) {
      const BE = uf;
      clearTimeout(kF), iu();
      const rZ = {};
      (rZ[BE(0x461)] = rY), (hU = rZ), kg(!![]);
    }
    window[uf(0xc7a)] = qN;
    var qO = null;
    function qP(rY) {
      const BF = uf;
      if (!rY || typeof rY !== BF(0x900)) {
        console[BF(0xabc)](BF(0x69a));
        return;
      }
      if (qO) qO[BF(0x4b8)]();
      const rZ = rY[BF(0xd6d)] || {},
        s0 = {};
      (s0[BF(0xcb5)] = BF(0x8d7)),
        (s0[BF(0xc5d)] = BF(0xb6e)),
        (s0[BF(0x902)] = BF(0x28f)),
        (s0[BF(0x320)] = BF(0x409)),
        (s0[BF(0xb8c)] = !![]),
        (s0[BF(0x707)] = !![]),
        (s0[BF(0xa93)] = ""),
        (s0[BF(0x899)] = ""),
        (s0[BF(0x715)] = !![]),
        (s0[BF(0x3b9)] = !![]);
      const s1 = s0;
      for (let s7 in s1) {
        (rZ[s7] === void 0x0 || rZ[s7] === null) && (rZ[s7] = s1[s7]);
      }
      const s2 = [];
      for (let s8 in rZ) {
        s1[s8] === void 0x0 && s2[BF(0x6aa)](s8);
      }
      s2[BF(0xbc8)] > 0x0 &&
        console[BF(0xabc)](BF(0xa33) + s2[BF(0x4c4)](",\x20"));
      rZ[BF(0xa93)] === "" && rZ[BF(0x899)] === "" && (rZ[BF(0xa93)] = "x");
      (rZ[BF(0xc5d)] = hP[rZ[BF(0xc5d)]] || rZ[BF(0xc5d)]),
        (rZ[BF(0x320)] = hP[rZ[BF(0x320)]] || rZ[BF(0x320)]);
      const s3 = nA(
        BF(0x220) +
          rZ[BF(0xcb5)] +
          BF(0xb80) +
          rZ[BF(0xc5d)] +
          BF(0x764) +
          (rZ[BF(0x902)]
            ? BF(0x75b) +
              rZ[BF(0x902)] +
              "\x22\x20" +
              (rZ[BF(0x320)] ? BF(0x4df) + rZ[BF(0x320)] + "\x22" : "") +
              BF(0x697)
            : "") +
          BF(0x3da)
      );
      (qO = s3),
        (s3[BF(0x4b8)] = function () {
          const BG = BF;
          document[BG(0x53e)][BG(0x474)][BG(0xa5a)](BG(0x2b1)),
            s3[BG(0xa5a)](),
            (qO = null);
        }),
        (s3[BF(0xa10)](BF(0x99d))[BF(0xc3)] = s3[BF(0x4b8)]);
      const s4 = s3[BF(0xa10)](BF(0x109)),
        s5 = [],
        s6 = [];
      for (let s9 in rY) {
        if (s9 === BF(0xd6d)) continue;
        const sa = rY[s9];
        let sb = [];
        const sc = Array[BF(0x9fe)](sa);
        let sd = 0x0;
        if (sc)
          for (let se = 0x0; se < sa[BF(0xbc8)]; se++) {
            const sf = sa[se],
              sg = dF[sf];
            if (!sg) {
              s5[BF(0x6aa)](sf);
              continue;
            }
            sd++, sb[BF(0x6aa)]([sf, void 0x0]);
          }
        else
          for (let sh in sa) {
            const si = dF[sh];
            if (!si) {
              s5[BF(0x6aa)](sh);
              continue;
            }
            const sj = sa[sh];
            (sd += sj), sb[BF(0x6aa)]([sh, sj]);
          }
        if (sb[BF(0xbc8)] === 0x0) continue;
        s6[BF(0x6aa)]([sd, s9, sb, sc]);
      }
      rZ[BF(0x3b9)] && s6[BF(0x1d0)]((sk, sl) => sl[0x0] - sk[0x0]);
      for (let sk = 0x0; sk < s6[BF(0xbc8)]; sk++) {
        const [sl, sm, sn, so] = s6[sk];
        rZ[BF(0x715)] && !so && sn[BF(0x1d0)]((ss, st) => st[0x1] - ss[0x1]);
        let sp = "";
        rZ[BF(0xb8c)] && (sp += sk + 0x1 + ".\x20");
        sp += sm;
        const sq = nA(BF(0x8db) + sp + BF(0xc02));
        s4[BF(0xd58)](sq);
        const sr = nA(BF(0xb9b));
        for (let ss = 0x0; ss < sn[BF(0xbc8)]; ss++) {
          const [st, su] = sn[ss],
            sv = dF[st],
            sw = nA(
              BF(0x6b2) + sv[BF(0xcce)] + "\x22\x20" + qk(sv) + BF(0x697)
            );
          if (!so && rZ[BF(0x707)]) {
            const sx = rZ[BF(0xa93)] + k9(su) + rZ[BF(0x899)],
              sy = nA(BF(0x290) + sx + BF(0xc02));
            sx[BF(0xbc8)] > 0x6 && sy[BF(0x474)][BF(0x1b0)](BF(0x43a)),
              sw[BF(0xd58)](sy);
          }
          (sw[BF(0xbca)] = sv), sr[BF(0xd58)](sw);
        }
        s4[BF(0xd58)](sr);
      }
      kl[BF(0xd58)](s3),
        s5[BF(0xbc8)] > 0x0 &&
          console[BF(0xabc)](BF(0xdd8) + s5[BF(0x4c4)](",\x20")),
        document[BF(0x53e)][BF(0x474)][BF(0x1b0)](BF(0x2b1));
    }
    (window[uf(0x207)] = qP),
      (document[uf(0x53e)][uf(0x14b)] = function (rY) {
        const BH = uf;
        rY[BH(0x15b)]();
        const rZ = rY[BH(0x84d)][BH(0x188)][0x0];
        if (rZ && rZ[BH(0x511)] === BH(0x7d8)) {
          console[BH(0xabc)](BH(0xdc7) + rZ[BH(0x9ed)] + BH(0x8ea));
          const s0 = new FileReader();
          (s0[BH(0x37d)] = function (s1) {
            const BI = BH,
              s2 = s1[BI(0x10b)][BI(0xc49)];
            try {
              const s3 = JSON[BI(0x681)](s2);
              qP(s3);
            } catch (s4) {
              console[BI(0x126)](BI(0x83e), s4);
            }
          }),
            s0[BH(0x4ef)](rZ);
        }
      }),
      (document[uf(0x53e)][uf(0xb08)] = function (rY) {
        const BJ = uf;
        rY[BJ(0x15b)]();
      }),
      Object[uf(0x9eb)](window, uf(0xaa3), {
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
      f = f - 0xc1;
      let h = e[f];
      return h;
    }),
    b(c, d)
  );
}
function a() {
  const BK = [
    "iPing",
    "Hornet_1",
    "hideAfterInactivity",
    "Cement",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "progressEl",
    "honeyRange",
    "enable_kb_movement",
    "*Cotton\x20health:\x209\x20→\x2010",
    "Removed\x20EU\x20#3.",
    "#fe98a2",
    "index",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    "Your\x20Profile",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "prog",
    "<div\x20",
    "worldH",
    "qCkBW5pcR8kD",
    "Preroll\x20state:\x20",
    "layin",
    ".download-btn",
    "maxTimeAlive",
    "It\x20burns.",
    ";\x22\x20stroke=\x22",
    "Invalid\x20account!",
    "#9e7d24",
    "INPUT",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    "101636gyvtEF",
    "#ffe763",
    "Beetle",
    "show_grid",
    "bar",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "Increased\x20shiny\x20mob\x20size.",
    "/s\x20if\x20H<50%",
    "localStorage\x20denied.",
    "hasEye",
    "show_clown",
    "bqpdUNe",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    "eu_ffa2",
    "appendChild",
    "6th\x20September\x202023",
    "renderBelowEverything",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    "#222222",
    "Heal",
    "lastElementChild",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "\x20Ultra",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "affectMobHeal",
    ".death-info",
    "isInventoryPetal",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    "pro",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "Petal\x20",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    "Boomerang.",
    "metaData",
    "innerHTML",
    "WP4dWPa7qCklWPtcLq",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "Retardation\x20Duration",
    "deadT",
    "\x22></span>\x20",
    "\x20downloaded!",
    ".find-user-input",
    "rgb(222,\x2031,\x2031)",
    "petalSkull",
    "sq8Ig3e",
    "*Snail\x20damage:\x2015\x20→\x2020",
    "mousedown",
    "#5ec13a",
    "WP3dRYddTJC",
    "#d3d14f",
    "lightning",
    "\x20FPS\x20/\x20",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "unset",
    "0@x9",
    "Mushroom",
    "#ebeb34",
    "col",
    "uiHealth",
    ".id-group",
    "Worker\x20Ant",
    "drawIcon",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    ".xp",
    "Dragon_1",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    "Baby\x20Ant",
    "*Peas\x20damage:\x208\x20→\x2010",
    "*Snail\x20Health:\x20180\x20→\x20120",
    ";\x20-o-background-position:",
    "Failed\x20to\x20find\x20region.",
    "renderOverEverything",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    "drawDragon",
    "#400",
    "Unknown\x20message\x20id:\x20",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    "Body",
    "Ghost_5",
    "petalEgg",
    "Wig",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "<div>",
    "globalCompositeOperation",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    "uiX",
    "2090768fiNzSa",
    ";position:absolute;top:",
    "#fc5c5c",
    "blur",
    "OFFIC",
    "motionKind",
    "reflect",
    "onmousedown",
    "#353331",
    "\x20-\x20",
    "#000000",
    "Honey\x20Damage",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    "contains",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "oProg",
    ".box",
    "unsuccessful",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    ".hyper-buy",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    "\x20You\x20",
    "chain",
    "#406150",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    "hostn",
    "canShowDrops",
    "year",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "kicked",
    "rgb(31,\x20219,\x20222)",
    "Importing\x20data\x20file:\x20",
    "eu_ffa",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "%!Ew",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    "bqpdSW",
    "#f009e5",
    "hsla(0,0%,100%,0.15)",
    "Sandstorm_3",
    "#A8A7A4",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "hideTimer",
    "#882200",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    "<div><span\x20stroke=\x22",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "yellow",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    "onclick",
    "#ff7380",
    "lottery",
    "oPlayerY",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    ".chat-input",
    "Sponge",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    "right",
    "activeElement",
    "shootLightning",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    "\x20in\x20view\x20/\x20",
    "New\x20mob:\x20Statue.",
    "e\x20bee",
    "shell",
    "Cotton\x20bush.",
    "orb\x20a",
    ".tv-prev",
    "2-digit",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "iSwapPetalRow",
    ".build-save-btn",
    "shieldReload",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    "petalDrop_",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "ll\x20yo",
    "Honey\x20factory.",
    "\x20Blue",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "getUint16",
    "#6f5514",
    "*Snail\x20health:\x2040\x20→\x2045",
    "doShow",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    "stayIdle",
    "More\x20wave\x20changes:",
    "WRGBrCo9W6y",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    ".absorb-btn\x20.tooltip\x20span",
    "flowerPoison",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    ".lottery-timer",
    "#cecfa3",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "deg)",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    "Has\x20fungal\x20infection\x20gg",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "ENTERING!!",
    "petalCement",
    "strokeStyle",
    "childIndex",
    "iAbsorb",
    "setCount",
    "Sandstorm_1",
    "#ab7544",
    ".total-kills",
    "been\x20",
    "crafted\x20nothing\x20from",
    "Beetle_5",
    "petalPoo",
    "11th\x20August\x202023",
    "#38ecd9",
    "ArrowDown",
    ".dialog-content",
    "strokeText",
    "target",
    "Server\x20side\x20performance\x20improvements.",
    ".mobs-btn",
    "makeFire",
    "#cfcfcf",
    "WRS8bSkQW4RcSLDU",
    "absorbPetalEl",
    "passive",
    "slayed",
    "addEventListener",
    "28th\x20June\x202023",
    "Fixed\x20number\x20rounding\x20issue.",
    "pickupRangeTiers",
    "14th\x20August\x202023",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "trim",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    "toDataURL",
    "damageF",
    "sk.",
    "Scorpion",
    "hide_chat",
    "#709e45",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    "boostStrength",
    "error",
    "url(https://i.ytimg.com/vi/",
    "hsl(60,60%,60%)",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "toString",
    "sword",
    "hide-scoreboard",
    ".my-player",
    "#eeeeee",
    "sameTypeColResolveOnly",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "https://stats.hornex.pro/api/userCount",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    "mobile",
    "petalRose",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    ".show-bg-grid-cb",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    "Bone",
    "render",
    "bone",
    "#363685",
    ".absorb",
    "wss://hornex-",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "Sunflower",
    "misReflectDmgFactor",
    "Nigerian\x20Ladybug.",
    "Dragon",
    "OQM)",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "sprite",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "\x22></div>\x20<div\x20style=\x22color:",
    "onmouseleave",
    ".lottery\x20.inventory-petals",
    "ondrop",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "guardian",
    "Shrinker",
    "hide-zone-mobs",
    "#ffe667",
    "#735d5f",
    ".killer",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "https",
    "petalerDrop",
    "onkeyup",
    "*Peas\x20damage:\x2010\x20→\x2012",
    "Health\x20Depletion",
    "#D2D1CD",
    "preventDefault",
    "hit.p",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "mobPetaler",
    "getAttribute",
    "shadowBlur",
    "pacman",
    "Rare",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    "\x27s\x20profile...",
    "toLocaleString",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    "leaders",
    "extraSpeed",
    "absorbDamage",
    "seed",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "Balancing:",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "13th\x20August\x202023",
    "Beetle\x20Egg",
    "ladybug",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "sizeIncreaseF",
    ".scale-cb",
    "dragonNest",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    "queen",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    "petalNitro",
    "animationDirection",
    "*Powder\x20health:\x2010\x20→\x2015",
    "KeyX",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    "dontExpand",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "yoba",
    "Pet\x20Heal",
    "addCount",
    "petalTaco",
    "hpAlpha",
    "cactus",
    "redHealth",
    "files",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    "Fixed\x20another\x20craft\x20exploit.",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    ".discord-btn",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    "oSize",
    "Added\x20video\x20ad.",
    "fill",
    "Dragon\x20Egg",
    "lobbyClosing",
    "fillRect",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "isBooster",
    "petalShell",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    "\x5c$1",
    "#d43a47",
    "Air",
    "4\x20yummy\x20poisonous\x20balls.",
    "class=\x22chat-cap\x22",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    "#328379",
    "#8f5db0",
    "WR7dPdZdQXS",
    "centipedeBodyDesert",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    "show_damage",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    "*Snail\x20damage:\x2010\x20→\x2015",
    "#dbab2e",
    "cmd",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "petalFaster",
    ".shop-overlay",
    "Soldier\x20Ant_5",
    "Spider_5",
    "add",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "Beetle_3",
    "dir",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "fovFactor",
    "M28",
    "span",
    "hsla(0,0%,100%,0.1)",
    "Yoba\x20Egg",
    "tail",
    "reduce",
    "values",
    ".privacy-btn",
    ".discord-avatar",
    "3rd\x20July\x202023",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    "shiftKey",
    "#634002",
    "└─\x20",
    "#eb4755",
    "consumeProjHealth",
    "text",
    "Wave\x20Ending...",
    ".clown",
    ".dismiss-btn",
    "Hornet_6",
    "starfish",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    "split",
    "sort",
    "23rd\x20August\x202023",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "petalSuspill",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "oninput",
    "damage",
    "textAlign",
    "petalSponge",
    "breedTimer",
    "Added\x20Shop.",
    "Heart",
    "Sandstorm_6",
    "3m^(",
    "#368316",
    "\x20no-icon\x22\x20",
    "armor",
    "projPoisonDamage",
    "low_quality",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "val",
    "outlineCount",
    "Ghost_1",
    "_blank",
    "Peas",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "https://www.youtube.com/@IAmLavaWater",
    "uiY",
    "i\x20make\x20cool\x20videos",
    ".export-btn",
    "Nitro",
    ".craft-btn",
    "%\x20success\x20rate",
    "webSize",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "#a44343",
    ")\x20rotate(",
    "running...",
    "cuYF",
    "petalWave",
    "OPEN",
    "air",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    "hsla(0,0%,100%,0.5)",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "Added\x20banner\x20ads.",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "antHoleFire",
    "WQxdVSkKW5VcJq",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    ".collected-petals",
    "0\x200",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "displayData",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "mobDespawned",
    "includes",
    "oiynC",
    ".checkbox",
    "New\x20mob:\x20Sunflower.",
    "#e94034",
    "restore",
    "mood",
    "FSoixsnA",
    "adplayer-not-found",
    "Sword",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "prepend",
    "18th\x20July\x202023",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "1Jge",
    "├─\x20",
    "filter",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    "#ceea33",
    "𐐿𐐘𐐫𐑀𐐃",
    "*Hyper:\x20175+",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    "20th\x20July\x202023",
    "cmk+c0aoqSoLWQrQW6Tx",
    ".textbox",
    "centipedeBodyPoison",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    "sponge",
    "setUint8",
    "iClaimUsername",
    "lightblue",
    "babyAntFire",
    "\x20accounts",
    "dev",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    "WRbjb8oX",
    "8th\x20July\x202023",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "uiCountGap",
    "iMood",
    "Sandstorm",
    "projPoisonDamageF",
    "#654a19",
    "Hornet\x20Egg",
    "health",
    "consumeProjHealthF",
    "content",
    "projSize",
    "nig",
    "Reduced\x20Wave\x20duration.",
    ".scores",
    ".sad-btn",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    "beehive",
    "*Reduced\x20mob\x20count.",
    "bubble",
    "waveStarting",
    "#288842",
    "Health",
    "Yourself",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "petalStick",
    "Beetle_2",
    "execCommand",
    ".login-btn",
    "wss://",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    "powderTime",
    ".clown-cb",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    "#bebe2a",
    "isPoison",
    "*Super:\x20150+",
    "Passively\x20regenerates\x20shield.",
    "Honey\x20Range",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "#8ac255",
    "Mythic",
    "Yellow\x20Ladybug",
    "consumeTime",
    "projHealthF",
    "getElementById",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "Q2mA",
    "textBaseline",
    "ANKUAsHKW5LZmq",
    "petalStinger",
    "points",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "*Light\x20damage:\x2013\x20→\x2012",
    "New\x20mob:\x20Fossil.",
    "isShiny",
    "setUserCount",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    ".active",
    "altKey",
    ".settings-btn",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "WOpcHSkuCtriW7/dJG",
    "*Reduced\x20drops\x20by\x2050%.",
    "Dahlia",
    "Luxurious\x20mansion\x20of\x20ants.",
    "*Light\x20damage:\x2012\x20→\x2010",
    "#a760b1",
    "<div\x20class=\x22spinner\x22></div>",
    ".bar",
    ".play-btn",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "#feffc9",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    "#416d1e",
    "Legendary",
    "Former\x20student\x20of\x20Yoda.",
    "enable_shake",
    "userChat",
    ".copy-btn",
    "Yoba",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    "affectMobHealDur",
    "wss://as1.hornex.pro",
    "angry",
    "%zY4",
    "Very\x20sussy\x20data!",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "\x27s\x20Profile",
    "ghost",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    "Server-side\x20optimizations.",
    "portalPoints",
    "have\x20",
    "Ghost_3",
    "#ffd941",
    "Petal\x20Weight",
    "flowerPoisonF",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "petSizeChangeFactor",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    "#a2eb62",
    "1317660DLKPGD",
    "consumeProjDamage",
    "19th\x20July\x202023",
    "<style>\x0a\x09\x09",
    "shieldHpLosePerSec",
    ".settings",
    "petalExpander",
    "nick",
    "main",
    "Lobby\x20Closing...",
    "18691288vhNmac",
    "W6rnWPrGWPfdbxmAWOHa",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "hide-all",
    "gblcVXldOG",
    "#ffd363",
    "#b5a24b",
    "curePoisonF",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    "usernameTaken",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    "[G]\x20Show\x20Grid:\x20",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "/dlSprite",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "beetle",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "210ZoZRjI",
    "%;left:",
    "doRemove",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    "petalSalt",
    "Soak\x20Duration",
    "hornex-pro_300x600",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "%\x20-\x200.8em*",
    "Added\x202\x20US\x20lobbies.",
    "download",
    ".player-list",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "*Fire\x20health:\x2070\x20→\x2080",
    "New\x20mob:\x20Mushroom.",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "quadraticCurveTo",
    "data-icon",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "petalSand",
    "Sprite",
    "j[zf",
    "drawArmAndGem",
    "Missile\x20Damage",
    "Iris",
    "Much\x20heavier\x20than\x20your\x20mom.",
    "Centipede",
    ".shop-btn",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "gambleList",
    "#fdda40",
    ".discord-user",
    "Region:\x20",
    "isPet",
    "#c69a2c",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "New\x20petal:\x20Sponge",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "New\x20mob:\x20M28.",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "#8f5f34",
    "u\x20are",
    "petalCoffee",
    "\x20ctxs\x20(",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    "avatar",
    "[2tB",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "twirl",
    "map",
    "shadowColor",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "waveShowTimer",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    "updateProg",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "barEl",
    "Added\x20Waves.",
    "identifier",
    "centipedeHead",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "isSleeping",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    "iLeaveGame",
    "Dragon_6",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "*Halo\x20now\x20stacks.",
    "\x20won\x20and\x20got\x20extra",
    "Enter",
    "/dlPetal",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "teal\x20",
    "\x20online)",
    ".reload-btn",
    ".shake-cb",
    "show_population",
    "entRot",
    ".waveroom-info",
    "*Gas\x20health:\x20250\x20→\x20200",
    ".discord-area",
    "hsl(60,60%,30%)",
    "setTargetEl",
    "*Turtle\x20health\x20500\x20→\x20600",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    "{background-color:",
    "score",
    "poopPath",
    "Added\x20another\x20AS\x20lobby.",
    "started!",
    "\x22></div>\x0a\x09\x09",
    "GsP9",
    "New\x20mob:\x20Dice.",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "descColor",
    "Mob\x20",
    "rgba(0,0,0,0.15)",
    "breedRange",
    "shieldRegenPerSecF",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    "Absorb",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "canRender",
    "STOP!",
    "breedPower",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    "New\x20petal:\x20Wig.",
    "sizeIncrease",
    "executed",
    "WPfQmmoXFW",
    "Added\x20Shiny\x20mobs:",
    "#554213",
    ".lottery-rarities",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "1868180XWylcs",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "mobSizeChange",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "24th\x20June\x202023",
    ".level-progress",
    ".rewards\x20.dialog-content",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
    "*2%\x20craft\x20success\x20rate.",
    "5th\x20January\x202024",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "Range",
    "ShiftLeft",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "#709d45",
    "\x20&\x20",
    "Basic",
    "reqFailed",
    "3YHM",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    ".find-user-btn",
    "healthF",
    "workerAnt",
    "Press\x20G\x20to\x20toggle\x20grid.",
    "petalDmca",
    "#af6656",
    "rgb(77,\x2082,\x20227)",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    ".time-alive",
    "active",
    "innerHeight",
    "#8ecc51",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "opera",
    "translate(-50%,\x20",
    "Arrow",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    "Added\x20Leave\x20Game\x20button.",
    "#6265eb",
    "absolute",
    "as_ffa2",
    "choked",
    "#39b54a",
    "16th\x20June\x202023",
    "queenAntFire",
    "isCentiBody",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "getFloat32",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "changeLobby",
    "extraRange",
    "from",
    "#2e933c",
    "display",
    "*Health:\x20100\x20→\x20120",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    "Game\x20released\x20to\x20public!",
    "12OVuKwi",
    "#cdbb48",
    ".lb-btn",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    "*Gas\x20poison:\x2030\x20→\x2040",
    ".right-align-petals-cb",
    "onload",
    "cDHZ",
    "BrnPE",
    ".terms-btn",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    ".stats-btn",
    "setTargetByEvent",
    "*Hyper:\x20240",
    "#b0473b",
    "#76ad45",
    "#9fab2d",
    "updatePos",
    "rock",
    "\x22></div>\x0a\x09</div>",
    "makeSponge",
    "Game",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Kicked!\x20(reason:\x20",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    "hoq5",
    "insertBefore",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "\x22></span>",
    "rgba(0,0,0,0.1)",
    "style",
    "rgba(0,0,0,0.3)",
    "Avacado",
    "#38c125",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "New\x20score\x20formula.",
    "15th\x20June\x202023",
    "hsla(0,0%,100%,0.4)",
    "they\x20copied\x20florr\x20code\x20omg!!",
    "petalFire",
    "#ffffff",
    "password",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "petalPacman",
    "keyInvalid",
    "2772301LQYLdH",
    "e8oQW7VdPKa",
    "Grapes",
    "</div><div\x20class=\x22log-line\x22></div>",
    "an\x20UN",
    "<div\x20class=\x22chat-text\x22></div>",
    ".rewards",
    "unknown",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    "poisonDamage",
    "dmca\x20it\x20m28!",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "Added\x201\x20more\x20EU\x20lobby.",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    ".helper-cb",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "sortGroups",
    "petalPowder",
    "height",
    "mouse0",
    "#75dd34",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    "flors",
    ".collected",
    "Magnet",
    "14th\x20July\x202023",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    "z8kgrX3dSq",
    "location",
    "Fire\x20Ant\x20Hole",
    ".absorb-rarity-btns",
    "Regenerates\x20health\x20when\x20consumed.",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "timePlayed",
    "#8b533f",
    "buffer",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "\x20rad/s",
    "readyState",
    "Rose",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    "deleted",
    ".no-btn",
    "des",
    "ICIAL",
    "weedSeed",
    "Dragon\x20Nest",
    "isDead",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    "accountNotFound",
    "*Arrow\x20damage:\x204\x20→\x205",
    "Spawns",
    "Invalid\x20petal\x20name:\x20",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "petalSoil",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    ".ad-blocker",
    "Coffee",
    "updateTime",
    "W77cISkNWONdQa",
    "25th\x20July\x202023",
    "Breaths\x20fire.",
    "*Cotton\x20health:\x2010\x20→\x2012",
    ".import-btn",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    "UNOFF",
    "inclu",
    "ears",
    "shinyCol",
    "\x20from\x20",
    "US\x20#2",
    "Space",
    "bottom",
    "Rock_4",
    "#dc704b",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "Stick",
    "#e6a44d",
    "continent_code",
    "scorp",
    "8Dlstin",
    "\x22\x20stroke=\x22(",
    "24th\x20July\x202023",
    "drawWingAndHalo",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    ".anti-spam-cb",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "invalid\x20uuid",
    "Dice",
    "%;\x22\x20stroke=\x22",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    "n8oKoxnarXHzeIzdmW",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "?dev",
    "Unusual",
    "beaten\x20to\x20death",
    ".minimap-cross",
    "rgba(0,0,0,",
    "iSwapPetal",
    "drops",
    "Sussy\x20Discord\x20uwu",
    "toggle",
    "max",
    "#7d5098",
    "petalYobaEgg",
    "Increases",
    "loading",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    "vFKOVD",
    "getUint8",
    "Red\x20ball.",
    "hide",
    "3L$0",
    "web_",
    "Halo",
    "createImageData",
    "Rock",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    "Desert",
    "textEl",
    "1px",
    "angleOffset",
    "substr",
    "1rrAouN",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "spin",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    "bruh",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "right_align_petals",
    "useTimeTiers",
    "petHealthFactor",
    "Web\x20Radius",
    "KeyF",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "font",
    "25th\x20June\x202023",
    "ceil",
    ".lb",
    "Beetle_1",
    "Pincer",
    "Flower\x20Health",
    "small",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    "ffa\x20sandbox",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "Ghost_2",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    "runSpeed",
    "<div\x20class=\x22btn\x20tier-",
    "WPPnavtdUq",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    "Gem",
    "18th\x20September\x202023",
    "New\x20mob:\x20Spider\x20Cave.",
    "kWicW5FdMW",
    "Increased\x20Ultra\x20key\x20price.",
    "cookie",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "LavaWater",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "rectAscend",
    "consumeProjDamageF",
    "bg-rainbow",
    "wave",
    "petalSpiderEgg",
    "number",
    "\x20pxls)\x20/\x20",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    "undefined",
    "furry",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "Hornet_5",
    "https://auth.hornex.pro/discord",
    "oceed",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "aip_complete",
    "url",
    "repeat",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    "usernameClaimed",
    "Leaf",
    "#cccccc",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    "els",
    ".swap-btn",
    "ad\x20refresh",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "timeJoined",
    ".spawn-zones",
    "hasSwastika",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "User\x20not\x20found.",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "classList",
    "isTrusted",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    "scorpion",
    "span\x202",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "%\x20!important",
    "projType",
    "iChat",
    "consumeProj",
    "builds",
    "A\x20default\x20petal.",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    "*Powder\x20damage:\x2015\x20→\x2020",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    "6th\x20July\x202023",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "4th\x20September\x202023",
    "retardDuration",
    "sad",
    "#ebda8d",
    "cantChat",
    "acker",
    "iGamble",
    "rgb(255,\x2043,\x20117)",
    "setAttribute",
    "innerWidth",
    "#bb3bc2",
    "\x20at\x20y",
    "*Bone\x20armor:\x209\x20→\x2010",
    ".petal-rows",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    "show_hitbox",
    "fire",
    "Removed\x20disclaimer\x20from\x20menu.",
    "%/s",
    "petalLeaf",
    "#ce79a2",
    "#b58500",
    "turtle",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    "forEach",
    "Duration",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "countAngleOffset",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    "goofy\x20ahh\x20insect\x20robbery",
    "hasSpawnImmunity",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "Fixed\x20Gem\x20glitch.",
    "\x20+\x20",
    "Dragon_5",
    "WRZdV8kNW5FcHq",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "neutral",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "hypot",
    "<div\x20style=\x22color:\x20",
    "e=\x22Yo",
    "Extra\x20Spin\x20Speed",
    "*Damage:\x204\x20→\x206",
    "setUint16",
    "dispose",
    "string",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "WOziW7b9bq",
    "Username\x20too\x20big!",
    "*Ultra:\x201-5",
    "21st\x20July\x202023",
    "cmk/auqmq8o8WOngW79c",
    "rgb(237\x20236\x2061)",
    "clientX",
    "#a17c4c",
    "local",
    "join",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "passiveBoost",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "projHealth",
    ".shop",
    "putImageData",
    "*Arrow\x20health:\x20180\x20→\x20220",
    "#543d37",
    "nt.\x20H",
    "#1ea761",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    ".absorb\x20.dialog-header\x20span",
    "13th\x20July\x202023",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    ".featured",
    "*Turtle\x20health:\x20600\x20→\x20900",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    ".inventory-btn",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "Pill",
    "Fixed\x20players\x20pushing\x20eachother.",
    "KCsdZ",
    "*Epic:\x2075\x20→\x2065",
    "toLocaleDateString",
    "swapped",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "style=\x22color:",
    "fireDamageF",
    "#3db3cb",
    "slice",
    "offsetHeight",
    "<div\x20class=\x22slot\x22></div>",
    "http",
    "KeyL",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    ".menu",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    "isTanky",
    "projSpeed",
    "Stickbug",
    "<option\x20value=\x22",
    "readAsText",
    "#fff0b8",
    "insert\x20something\x20here...",
    "petalSnail",
    "22nd\x20June\x202023",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    "regenAfterHp",
    "userAgent",
    ".hide-chat-cb",
    "\x0a\x09</div>",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    ".tv-next",
    "switched",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "fossil",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "left",
    "petalRockEgg",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    "\x22></span></div>\x0a\x09</div>",
    "--angle:",
    "#d3c66d",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "15th\x20July\x202023",
    "\x0a\x0a\x09\x09\x09",
    "petalMissile",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "hasAbsorbers",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "slowDuration",
    "spawn",
    "type",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    "Queen\x20Ant",
    "*Cotton\x20health:\x207\x20→\x208",
    "replace",
    "Statue\x20of\x20RuinedLiberty.",
    "tierStr",
    "select",
    "Wave\x20Starting...",
    "135249DkEsVO",
    "#f54ce7",
    "Fussy\x20Sucker",
    "dontPushTeam",
    "#82b11e",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    "rgb(166\x2056\x20237)",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    "are\x20p",
    "New\x20settings:\x20Low\x20quality.",
    "Extra\x20Pickup\x20Range",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "petalStarfish",
    "released",
    "13th\x20February\x202024",
    "ion",
    "\x20$1",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    "petalDragonEgg",
    "particle_heart_",
    "copy",
    "#347918",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "devicePixelRatio",
    "Rice",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "4th\x20April\x202024",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    "#db4437",
    "our\x20o",
    "Ancester\x20of\x20flowers.",
    "body",
    "destroyed",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "\x22></div><div\x20class=\x22log-content\x22>",
    "posAngle",
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "[censored]",
    "Rock_6",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "Nitro\x20Boost",
    "]\x22></div>",
    "Pill\x20affects\x20Arrow\x20now.",
    "uiScale",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    "respawnTimeTiers",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "petalAntEgg",
    "ready",
    "CCofC2RcTG",
    "finalMsg",
    "iPercent",
    "Petal\x20Slots",
    "#aaaaaa",
    "#dddddd",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    ".minimap",
    "VLa2",
    "ame",
    "petalLightsaber",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    "[F]\x20Show\x20Hitbox:\x20",
    "*Rock\x20health:\x2045\x20→\x2050",
    "xgMol",
    "\x20HP",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "pop",
    "keyClaimed",
    ".continue-btn",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    "rgb(219\x20130\x2041)",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "thirdEye",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "Damage\x20Reflection",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    "#34f6ff",
    "p41E",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    "#b0c0ff",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "Yin\x20Yang",
    "assualted",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    "Head",
    ".censor-cb",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "Cactus",
    "Bounces",
    ".video",
    "connectionIdle",
    "#ce76db",
    "has\x20ended.",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    ".leave-btn",
    "📜\x20",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "start",
    "wss://us2.hornex.pro",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "19th\x20June\x202023",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    "23rd\x20July\x202023",
    "size",
    "#fbb257",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    "3336680ZmjFAG",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    "hasSpiderLeg",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "/dlMob",
    "ArrowUp",
    "Spawn\x20zone\x20changes:",
    "*Fire\x20health:\x2080\x20→\x20120",
    ".lottery-winner",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "encod",
    "29th\x20June\x202023",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    "#efc99b",
    "hsla(0,0%,100%,0.3)",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    "6th\x20October\x202023",
    "isBoomerang",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    "inventory",
    "day",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "dontUiRotate",
    "horne",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "makeMissile",
    "scale2",
    "Redesigned\x20some\x20mobs.",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    "Reduced\x20mobile\x20UI\x20scale.",
    "mushroom",
    "nameEl",
    "angryT",
    "3rd\x20August\x202023",
    "Missile\x20Health",
    "6th\x20August\x202023",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    "arraybuffer",
    ".chat-content",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "rgb(81\x20121\x20251)",
    "*Increased\x20drop\x20rates.",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    "halo",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "rgb(",
    "#c76cd1",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    "Flower\x20Poison",
    "Salt",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    "WR7cQCkf",
    "localId",
    "redHealthTimer",
    "elongation",
    "30th\x20June\x202023",
    "22nd\x20July\x202023",
    "#7d893e",
    ".common",
    "padStart",
    "17th\x20June\x202023",
    "(?:^|;\x5cs*)",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "WPJcKmoVc8o/",
    "bee",
    ".tabs",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "progress",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "Soldier\x20Ant_4",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "origin",
    "isPlayer",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    "eyeY",
    "doLerpEye",
    "div",
    "btn",
    "*Rock\x20health:\x2060\x20→\x20120",
    "wasDrawn",
    "#c1ab00",
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "Error\x20refreshing\x20ad.",
    "binaryType",
    "#ffe200",
    "extraRangeTiers",
    ".keyboard-cb",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "No\x20username\x20provided.",
    "qmklWO4",
    ".reload-timer",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    "rando",
    "Ruined",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "querySelectorAll",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    ".level",
    "endsWith",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "Hyper",
    "now",
    "#ff63eb",
    "Sandstorm_5",
    "canvas",
    "terms.txt",
    "(reloading...)",
    "#15cee5",
    "petalTurtle",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    "27th\x20June\x202023",
    "W5OTW6uDWPScW5eZ",
    "style=\x22background-position:\x20",
    "tile_",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    "#d6b936",
    "&response_type=code&scope=identify&state=",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    "14dafFDX",
    "keydown",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "nShield",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "petalDandelion",
    "d8k3BqDKF8o0WPu",
    "Shield",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    "antennae",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "petalYinYang",
    "roundRect",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "decode",
    "lineCap",
    ".claimer",
    "Yoba_2",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    "Increases\x20flower\x27s\x20health\x20power.",
    "81106PUOiSj",
    "centipedeBody",
    "writeText",
    "23rd\x20January\x202024",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    "Client-side\x20performance\x20improvements.",
    "KeyV",
    "*Rock\x20health:\x20150\x20→\x20200",
    "backgroundImage",
    "canSkipRen",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    ".submit-btn",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "Spider",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    ".insta-btn",
    "Spider_1",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    "Rock\x20Egg",
    "Faster",
    "petalWing",
    "clip",
    "2nd\x20October\x202023",
    "8th\x20August\x202023",
    "bush",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    "Neowm",
    "petalLightning",
    "json",
    "#323032",
    "hsl(110,100%,50%)",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    "iReqUserProfile",
    "*Taco\x20healing:\x208\x20→\x209",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    "#775d3e",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "statuePlayer",
    ".gamble-petals-btn",
    "\x20radians",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "*Arrow\x20damage:\x203\x20→\x204",
    "*Peas\x20damage:\x2012\x20→\x2015",
    "24th\x20August\x202023",
    "isRetard",
    "centipedeHeadDesert",
    "Spider_4",
    "petalCotton",
    "Beetle_4",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    "petal_",
    "\x20domain=.hornex.pro",
    "respawnTime",
    "petalWeb",
    "isRectHitbox",
    "MOVE\x20AWAY!!",
    "#4e3f40",
    "#21c4b9",
    "#4eae26",
    "nickname",
    ".builds\x20.dialog-content",
    "#c1a37d",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "#962921",
    "Pet\x20Size\x20Increase",
    "55078DZMiSD",
    "Increased\x20map\x20size\x20by\x2030%.",
    "Summons\x20the\x20power\x20of\x20wind.",
    "deg",
    "Soaks\x20damage\x20over\x20time.",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "Temporary\x20Extra\x20Speed",
    "maxLength",
    "petHeal",
    "1st\x20July\x202023",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "\x20Wave\x20",
    "NSlTg",
    ".petal",
    "transformOrigin",
    "Ghost_6",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    "warn",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    "Passively\x20regenerates\x20your\x20health.",
    "exp",
    "parse",
    "toLowerCase",
    "getHurtColor",
    "stepPerSecMotion",
    "removeChild",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    "Makes\x20you\x20poisonous.",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    "Furry",
    "Ghost",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "15807WcQReK",
    "breedTimerAlpha",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "#555555",
    "iWithdrawPetal",
    "fireTime",
    "25th\x20August\x202023",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    "Account\x20import/export\x20UI\x20redesigned.",
    "></div>",
    "1841224gIAuLW",
    "code",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    "Scorpion\x20redesign.",
    "#333",
    "drawShell",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "ount\x20",
    "Tiers",
    "#d9511f",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "\x20stroke=\x22",
    "encode",
    "IAL\x20c",
    "kbps",
    "push",
    "hsl(60,60%,",
    "Increases\x20petal\x20spin\x20speed.",
    "click",
    ".lottery-users",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "pink",
    "lineWidth",
    "<div\x20class=\x22petal\x20tier-",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    "Breed\x20Range",
    "isIcon",
    "New\x20mob:\x20Sponge",
    "mobId",
    "*Peas\x20health:\x2020\x20→\x2025",
    "touchmove",
    "nProg",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "l\x20you",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "stopWhileMoving",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "drawImage",
    "translate(calc(",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    "small\x20full",
    "21st\x20January\x202024",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    ".grid",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    ".stats\x20.dialog-header\x20span",
    ".build-load-btn",
    "*Banana\x20health:\x20170\x20→\x20400",
    "4th\x20July\x202023",
    "avacado",
    "addToInventory",
    ".debug-cb",
    "weight",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    "no-icon",
    "setPos",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "show-petal",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    "show_helper",
    "KICKED!",
    "stickbugBody",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    "User\x20not\x20found!",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "petalsLeft",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    "Missile\x20Poison",
    "mushroomPath",
    "affectHealDur",
    "16th\x20September\x202023",
    ".username-input",
    "*Rose\x20heal:\x2013\x20→\x2011",
    "Dragon_2",
    "path",
    "*Bone\x20armor:\x205\x20→\x206",
    "1998256OxsvrH",
    "#924614",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "px\x20",
    "Invalid\x20username.",
    "stats",
    "<div\x20class=\x22chat-item\x22></div>",
    "New\x20mob:\x20Pedox",
    "stroke",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    ".inventory\x20.inventory-petals",
    "20th\x20June\x202023",
    "mouse2",
    "shift",
    "isStatic",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "Poop\x20Health",
    ".switch-btn",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "scale",
    "Ant\x20Hole",
    "reload",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "Statue",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    "Added\x20level\x20up\x20reward\x20table.",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    "showItemLabel",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "isSpecialWave",
    "iReqAccountData",
    "lineJoin",
    "*Pincer\x20damage:\x205\x20→\x206",
    "?v=",
    "petalShrinker",
    "Nerfs:",
    "rotate",
    "W5T8c2BdUs/cJHBcR8o4uG",
    "(81*",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "rotate(",
    "sortGroupItems",
    "fillStyle",
    "bolder\x2025px\x20",
    "Provide\x20a\x20name\x20dummy.",
    "fireDamage",
    "Added\x20Global\x20Leaderboard.",
    "abs",
    "8URl",
    "\x20XP",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "spiderYoba",
    "powderPath",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "*They\x20give\x2010x\x20score.",
    "#999",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    "deadPreDraw",
    "Evil\x20Centipede",
    "hornet",
    "3rd\x20February\x202024",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    "petalChromosome",
    "LEAVE\x20ZONE!!",
    ".scoreboard-title",
    "uniqueIndex",
    "petalGas",
    "petalPincer",
    ".lottery-btn",
    ".show-population-cb",
    "oHealth",
    ".prediction",
    "It\x20likes\x20to\x20dance.",
    "zert.pro",
    "6fCH",
    "despawnTime",
    "*Bone\x20armor:\x208\x20→\x209",
    "scrollHeight",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Bee",
    "arrested\x20for\x20plagerism",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "Some\x20anti\x20lag\x20measures:",
    "Orbit\x20Twirl",
    ".stat-value",
    "Swastika",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "Heal\x20Affect\x20Duration",
    "Spider\x20Egg",
    "poisonT",
    "Buffs:",
    "successCount",
    "Removed\x20Centipedes\x20from\x20waves.",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "globalAlpha",
    "fontFamily",
    "Minor\x20physics\x20change.",
    ".joystick-knob",
    "deg)\x20scale(",
    "Poison\x20Reduction",
    "pedox",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Hyper:\x2015-25",
    "*Yoba\x20Egg\x20buff.",
    "26th\x20July\x202023",
    ".ui-scale\x20select",
    "Lightning\x20damage:\x2012\x20→\x208",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "*Opening\x20Lottery",
    ".petals",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    ".progress",
    "(total\x20",
    "Gives\x20you\x20a\x20shield.",
    "\x22></div>\x0a\x09\x09\x09",
    "top",
    "width",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    ".absorb-petals-btn",
    "arc",
    "rgba(0,\x200,\x200,\x200.2)",
    "isFakeChat",
    "imageSmoothingEnabled",
    ".minimap-dot",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    "backgroundColor",
    "changedTouches",
    "#a52a2a",
    "parentNode",
    "\x20all\x20",
    "your\x20",
    ".player-count",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "Snail",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    "\x20by",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "strokeRect",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    "Dark\x20Ladybug",
    "#222",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    "2nd\x20March\x202024",
    "7th\x20July\x202023",
    "beginPath",
    "Epic",
    "occupySlot",
    "hsla(0,0%,100%,0.25)",
    "ontouchstart",
    "hpRegenPerSec",
    "#a2dd26",
    "orbitDance",
    "Stick\x20does\x20not\x20expand\x20now.",
    "portal",
    "Added\x20Lottery.",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    "Third\x20Eye",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "12th\x20November\x202023",
    "#e05748",
    "Powder",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    "red",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    ".low-quality-cb",
    "marginLeft",
    "rnex.",
    "http://localhost:8001/discord",
    "26th\x20June\x202023",
    "Guardian",
    "#f22",
    "Soldier\x20Ant_1",
    "accou",
    "test",
    ".joystick",
    "2nd\x20August\x202023",
    "Reflected\x20Missile\x20Damage",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    "dSk+d0afnmo5WODJW6zQxW",
    ".gamble-prediction",
    "mobKilled",
    ".inventory-petals",
    "=([^;]*)",
    "#f2b971",
    "pet",
    "petCount",
    "ArrowRight",
    "spiderCave",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    "\x20!important;}",
    "petalSword",
    "fake",
    "Rock_2",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    ".petal-count",
    "Sandbox",
    "WP4hW755jCokWRdcKchdT3ui",
    "warne",
    "Decreases",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "Turtle",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "krBw",
    "(auto\x20reloading\x20in\x20",
    "hsl(110,100%,10%)",
    "user",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "<div\x20class=\x22petal-count\x22></div>",
    "onchange",
    "Rock_5",
    "#c9b46e",
    "*Rice\x20damage:\x205\x20→\x204",
    "Bubble",
    "countEl",
    "honeyDmgF",
    "username",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "moveFactor",
    "13th\x20September\x202023",
    "Antidote",
    "onEnd",
    "WP10rSoRnG",
    "<div\x20class=\x22dialog\x20tier-",
    "*Swastika\x20health:\x2030\x20→\x2035",
    "application/json",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    "fromCharCode",
    "*Cement\x20health:\x2080\x20→\x20100",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    "append",
    "loggedIn",
    "\x20(Lvl\x20",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "snail",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "Username\x20is\x20already\x20taken.",
    "draw",
    "Shield\x20Reuse\x20Cooldown",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    ".total-accounts",
    "duration",
    "anti_spam",
    "rgba(0,0,0,0.08)",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "keyCode",
    "ignore\x20if\x20u\x20already\x20subbed",
    "Stinger",
    "sin",
    "deltaY",
    "petalRock",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    ".build-petals",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    "eu_ffa1",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    ".max-score",
    "privacy.txt",
    "getBoundingClientRect",
    "W7/cOmkwW4lcU3dcHKS",
    "Added\x20Discord\x20login.",
    "#32a852",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "lightningBounces",
    "sqrt",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "*Heavy\x20health:\x20450\x20→\x20500",
    "#4040fc",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    "hornex.pro",
    ".mob-gallery",
    "Comes\x20to\x20avenge\x20mobs.",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "Ghost_7",
    "WARNING!",
    "Fixed\x20duplicate\x20drops.",
    "lightningDmgF",
    "*Snail\x20damage:\x2020\x20→\x2025",
    "data",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    "Spider\x20Yoba",
    ".mob-gallery\x20.dialog-content",
    "Breed\x20Strength",
    "Flower\x20#",
    ".petal.empty",
    "toLow",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "ability",
    "&#Uz",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    "s.\x20Yo",
    "W7dcP8k2W7ZcLxtcHv0",
    "#5ef64f",
    "expand",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    "pickedEl",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "hurtT",
    "keyAlreadyUsed",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    "*Super:\x201%\x20→\x201.5%",
    "Pacman",
    "\x0aServer:\x20",
    "New\x20mob:\x20Nigersaurus.",
    "onclose",
    "flipDir",
    "15584076IAHWRs",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    ".player-list-btn",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    "finally",
    "spiderLeg",
    "waveEnding",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "Increases\x20your\x20vision.",
    ".lottery",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    ".pro",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    "sunflower",
    "static",
    "Extra\x20Vision",
    "15th\x20August\x202023",
    "DMCA",
    "webSizeTiers",
    "onmouseup",
    "spotPath_",
    "spawn_zone",
    "2YEahym",
    "desktop",
    "#ff4f4f",
    "dataTransfer",
    "iAngle",
    ".clear-build-btn",
    "10QIdaPR",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "Soldier\x20Ant_3",
    "createObjectURL",
    "centipedeHeadPoison",
    "*Peas\x20damage:\x2015\x20→\x2020",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "OFF",
    ".grid-cb",
    "clientHeight",
    "typeStr",
    "nice\x20stolen\x20florr\x20assets",
    "Spider\x20Legs",
    "petalPea",
    "Sandstorm_4",
    "Yoba_3",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    "6zvZrde",
    "Kills\x20Needed",
    "agroRangeDec",
    "isHudPetal",
    "onwheel",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "rgb(43,\x20255,\x20163)",
    "Orbit\x20Shlongation",
    "16th\x20July\x202023",
    "Created\x20changelog.",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    "honeyTile",
    "Sand",
    "Poop\x20colored\x20Ladybug.",
    "angleSpeed",
    "Downloaded!",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "11th\x20July\x202023",
    "petalLight",
    "#d0bb55",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "EU\x20#2",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    "#393cb3",
    "/hqdefault.jpg)",
    ".tier-",
    "7th\x20February\x202024",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    "canRemove",
    "focus",
    "spider",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    "XCN6",
    "#b53229",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "Disconnected.",
    "state",
    "mouse",
    "*Reduced\x20Shield\x20regen\x20time.",
    "babyAnt",
    "10th\x20August\x202023",
    ".zone-mobs",
    "#be342a",
    "uiAngle",
    "#d3ad46",
    "#b05a3c",
    "keyCheckFailed",
    "WRyiwZv5x3eIdtzgdgC",
    "ArrowLeft",
    "opacity",
    "position",
    ".ads",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "labelSuffix",
    "center",
    "#fbdf26",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "%</option>",
    "s...)",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "clientY",
    "getTransform",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    "Expander",
    "#b9baba",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    "makeSpiderLegs",
    "pedoxMain",
    "Wave",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "Wave\x20changes:",
    "joinedGame",
    "#97782b",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    "n\x20war",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    ".hud",
    "#754a8f",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "Changes\x20to\x20anti-lag\x20system:",
    "hostname",
    ".screen",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "KeyU",
    "Added\x20Waveroom:",
    "healthIncrease",
    "subscribe\x20for\x20999\x20super\x20petals",
    "#a58368",
    "Connecting\x20to\x20",
    "userProfile",
    "getRandomValues",
    "children",
    "curve",
    "WP/dQbddHH0",
    ".petals-picked",
    "Dandelion",
    "Wave\x20",
    "shieldRegenPerSec",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    "#c8a826",
    "onMove",
    "#454545",
    ".changelog\x20.dialog-content",
    "cantPerformAction",
    "3220DFvaar",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    "queenAnt",
    ".super-buy",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "keys",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    "tagName",
    "Some\x20Data",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    "<div\x20class=\x22petal-icon\x22\x20",
    "#a07f53",
    "<div\x20stroke=\x22",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "Checking\x20username\x20availability...",
    "TC0B",
    "off",
    "soakTime",
    "Lightsaber",
    "petalBanana",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "armorF",
    "rkJNdF",
    "#bb1a34",
    "projAffectHealDur",
    "video-ad-skipped",
    "evenodd",
    "...",
    ".chat",
    ".username-area",
    "petalSwastika",
    "update",
    "closePath",
    "Fire\x20Duration",
    "Skull",
    "1st\x20April\x202024",
    "2357",
    "textarea",
    "Craft\x20rate\x20change:",
    "4297764wTrlJs",
    "Even\x20more\x20wave\x20changes:",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    "isPortal",
    ".absorb-clear-btn",
    "KGw#",
    "onmousemove",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "#bc0000",
    "29th\x20January\x202024",
    "object",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "desc",
    "angle",
    ".server-area",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "targetEl",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    "release",
    "\x22\x20stroke=\x22",
    ".loader",
    "Ants\x20redesign.",
    "KeyA",
    "23rd\x20June\x202023",
    "#ff3333",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "31st\x20July\x202023",
    "#853636",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    "absorb",
    "countTiers",
    "soldierAntFire",
    "hide-chat",
    "Dragon_3",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "nAngle",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    ".lottery\x20.dialog-content",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    "Extremely\x20slow\x20sussy\x20mob.",
    "wrecked",
    "New\x20mob:\x20Dragon\x20Nest.",
    ".debug-info",
    "waveNumber",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "*Reduced\x20HP\x20depletion.",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    "5th\x20September\x202023",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "image/png",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    "moveTo",
    "dandelion",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    "Light",
    "#8a6b1f",
    "Spider_6",
    "c)H[",
    "rad)",
    "removeT",
    "Orbit\x20Dance",
    ".collected-rarities",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    "i\x20need\x20999\x20billion\x20subs",
    "28th\x20December\x202023",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "fillText",
    "#cfc295",
    "clipboard",
    ".ultra-buy",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "Hornet_2",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "253906KWTZJW",
    "Ant\x20Fire",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "isSwastika",
    "KeyR",
    "value",
    "Extra\x20Range",
    "Heavy",
    "*Rice\x20damage:\x204\x20→\x205",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "ShiftRight",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    "ui_scale",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "Favourite\x20object\x20of\x20a\x20woman.",
    "petalBubble",
    "5204055bNbPkY",
    "#33a853",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "Saved\x20Build\x20#",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    "petRoamFactor",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "#5ab6ab",
    "Copied!",
    ".petals.small",
    "Beehive",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "Fire\x20Damage",
    "Buffed\x20Lightsaber:",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "createElement",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    ".dc-group",
    "[data-icon]",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    "Jellyfish",
    "isAggressive",
    "petalBone",
    "send",
    "charCodeAt",
    "Common",
    "lient",
    "none",
    "ing\x20o",
    "Connected!",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    "Fossil",
    "loginFailed",
    "3WRI",
    "Fire",
    "isPassiveAggressive",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    "#724c2a",
    "text/plain;charset=utf-8;",
    "#f7904b",
    "rgb(134,\x2031,\x20222)",
    "*Cotton\x20health:\x208\x20→\x209",
    "hpRegenPerSecF",
    "wn\x20ri",
    "#bb771e",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    "RuinedLiberty",
    ".builds",
    "9iYdxUh",
    "#29f2e5",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "KeyD",
    "alpha",
    "hpRegen75PerSec",
    "KeyG",
    "Fleepoint",
    "Tumbleweed",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    "Soldier\x20Ant",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "WRzmW4bPaa",
    "\x20and\x20",
    "open",
    "#444444",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "drawChats",
    "#a33b15",
    "green",
    "isDevelopmentMode",
    ".close-btn",
    "Ladybug",
    "transform",
    "1st\x20February\x202024",
    "show_scoreboard",
    "Web",
    "Dragon_4",
    "getUint32",
    "asdfadsf",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "21st\x20June\x202023",
    "https://discord.gg/zZsUUg8rbu",
    "tals.",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    "#ada25b",
    "lightningBouncesTiers",
    "9117647EzAoQT",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    "disabled",
    ".inventory-rarities",
    "hasEars",
    "killsNeeded",
    "show",
    "setValue",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "#d3bd46",
    "rgb(126,\x20239,\x20109)",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "Rock_1",
    "Shell",
    "nSize",
    "accountId",
    "WP5YoSoxvq",
    ".max-wave",
    "20th\x20January\x202024",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    "dur",
    "Yoba_6",
    "iDepositPetal",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "/weborama.js",
    "*Iris\x20poison:\x2045\x20→\x2050",
    "Removed\x20Waves.",
    "Poisonous\x20gas.",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    "reset",
    "*Banana\x20damage:\x201\x20→\x202",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    "iJoin",
    "iScore",
    ".absorb\x20.dialog-content",
    "26th\x20August\x202023",
    "blue",
    ".rewards-btn",
    "#eee",
    "color",
    "invalid",
    "*Removed\x20Ultra\x20wave.",
    "oncontextmenu",
    "rgba(0,0,0,0.4)",
    "*Snail\x20health:\x2045\x20→\x2050",
    "petalCactus",
    "nerd",
    "#fcdd86",
    "moveCounter",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "\x20play",
    "keyup",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "wss://as2.hornex.pro",
    ".stats\x20.dialog-content",
    "defineProperty",
    "discord_data",
    "name",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "*Recuded\x20mob\x20count.",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    "bezierCurveTo",
    "US\x20#1",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "changelog",
    "https://www.youtube.com/@KePiKgamer",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    "27th\x20July\x202023",
    "mobGallery",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    "#5b4d3c",
    "petalHoney",
    "makeLadybug",
    "isArray",
    "#7dad0c",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    "projDamage",
    "://ho",
    "Rock_3",
    "translate(-50%,",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "projDamageF",
    "hasAntenna",
    "href",
    ".\x22></span></div>",
    "nLrqsbisiv0SrmoD",
    "Starfish",
    "reloadT",
    "mobsEl",
    "containerDialog",
    "moveSpeed",
    "querySelector",
    "tumbleweed",
    "startEl",
    "clearRect",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    "killed",
    "hsl(110,100%,60%)",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    "soldierAnt",
    "isStatue",
    "petSizeIncrease",
    "5th\x20July\x202023",
    "#fcfe04",
    "next",
    "#3f1803",
    "Zert",
    "spawnOnHurt",
    "Mob\x20Agro\x20Range",
    "className",
    "save",
    "useTime",
    ".grid\x20.title",
    ".tooltip",
    "Antennae",
    "New\x20mob:\x20Furry.",
    "spawnOnDie",
    "Ugly\x20&\x20stinky.",
    "%nick%",
    "&quot;",
    "isLightning",
    "reverse",
    "petalSunflower",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "settings",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    "Waveroom",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    "Passive\x20Shield",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    "lighter",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    ".damage-cb",
    ".builds-btn",
    "Poop\x20Damage",
    "KeyM",
    "*Ultra:\x20120",
    "accountData",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "https://ipapi.co/json/",
    "Gas",
    "total",
    "nigersaurus",
    "petalRice",
    "requestAnimationFrame",
    "wing",
    "show_bg_grid",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "numeric",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "*Rare:\x2050\x20→\x2035",
    ".credits-btn",
    "pathSize",
    "wss://eu2.hornex.pro",
    "AS\x20#2",
    "45DmVhZk",
    "search",
    "pZWkWOJdLW",
    "lastResizeTime",
    "icBdNmoEta",
    "*Super:\x20180",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    "remove",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    ".circle",
    "AS\x20#1",
    "r\x20acc",
    ".shop-info",
    "petalHeavy",
    "hasHearts",
    "unnamed",
    "side",
    "Passive\x20Heal",
    "lieOnGroundTime",
    "zmkhtdVdSq",
    "Congratulations!",
    "Crab",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "\x22></span></div>",
    "Damage",
    "2nd\x20July\x202023",
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "W43cOSoOW4lcKG",
    "Continue",
    "hide-icons",
    "It\x20has\x20sussy\x20movement.",
    "oPlayerX",
    "fontSize",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "wss://us1.hornex.pro",
    "petalDice",
    "petalAvacado",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "jellyfish",
    "iWatchAd",
    "Poo",
    "s\x20can",
    "27th\x20February\x202024",
    "Failed\x20to\x20get\x20userCount!",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    "makeBallAntenna",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "Spider_3",
    "cos",
    "gridColumn",
    "Added\x201\x20AS\x20lobby.",
    "6th\x20November\x202023",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "25th\x20January\x202024",
    "#d54324",
    "Armor",
    "DMCA-ed",
    "#555",
    "Mob\x20Size\x20Change",
    "Lightning",
    "labelPrefix",
    "match",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "cde9W5NdTq",
    "g\x20on\x20",
    "worldW",
    "stringify",
    "floor",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    "#735b49",
    "Banana",
    "player",
    "Take\x20Down\x20Time",
    "Username\x20too\x20short!",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "hasGem",
    "msgpack",
    "poisonDamageF",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    "12th\x20August\x202023",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "#764b90",
    "iReqGlb",
    "abeQW7FdIW",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "EU\x20#1",
    "Claiming\x20secret\x20skin...",
    "Hornet_4",
    "*Gas\x20health:\x20140\x20→\x20250",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "#f55",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "https://www.youtube.com/@NeowmHornex",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    "uiName",
    "22nd\x20January\x202024",
    "log",
    ".changelog-btn",
    "sendBadMsg",
    "successful",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    "iCraft",
    "bsorb",
    "flower",
    "toFixed",
    "ontouchend",
    "round",
    "petDamageFactor",
    "px)",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    "outdatedVersion",
    "isClown",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    "attachPetal",
    "yellowLadybug",
    "background",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "Chromosome",
    "curePoison",
    "*Heavy\x20damage:\x209\x20→\x2010",
    "Craft",
    "baseSize",
    ".expand-btn",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "ellipse",
    "bolder\x20",
    "sign",
    "\x20was\x20",
    "\x0a5th\x20May\x202024\x0aHeavy\x20now\x20slows\x20down\x20your\x20petal\x20orbit\x20speed.\x20More\x20slowness\x20for\x20higher\x20rarity.\x20\x0aCotton\x20doesn\x27t\x20expand\x20like\x20Rose\x20when\x20you\x20are\x20angry.\x0aPowder\x20now\x20adds\x20turbulence\x20to\x20your\x20petals\x20when\x20you\x20are\x20angry.\x0aFixed\x20more\x20player\x20dupe\x20bugs.\x0a",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    "Fixed\x20Rice.",
    "discord\x20err:",
    "turtleF",
    "Loading\x20video\x20ad...",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "NHkBqi",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "month",
    "\x20Pym\x20Particle.",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    ".claim-btn",
    "petalIris",
    "Need\x20to\x20be\x20Lvl\x20",
    "petalStickbug",
    "#8d9acc",
    "petHealF",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    "#333333",
    "function",
    ".flower-stats",
    "*Heavy\x20health:\x20500\x20→\x20600",
    "Goofy\x20little\x20wanderer.",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "Nigersaurus",
    "New\x20mob:\x20Snail.",
    "Crab\x20redesign.",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    ".credits",
    "Extra\x20Speed",
    "Petals",
    "\x20clie",
    "Sandstorm_2",
    "random",
    "tCkxW5FcNmkQ",
    "petalMushroom",
    "scale(",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "ondragover",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "purple",
    "#bbbbbb",
    "24th\x20January\x202024",
    "drawTurtleShell",
    "10th\x20July\x202023",
    "miter",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "level",
    "rgba(0,\x200,\x200,\x200.15)",
    "rainbow-text",
    "rewards",
    "KePiKgamer",
    "player_id",
    "bolder\x2017px\x20",
    "blur(10px)",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    "hornex-pro_970x250",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "isLightsaber",
    "10px",
    ".show-scoreboard-cb",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "translate",
    "719574lHbJUW",
    "n\x20an\x20",
    "*Swastika\x20health:\x2020\x20→\x2025",
    "lightningDmg",
    "#ff7892",
    "rgb(237\x2061\x20234)",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "petalDrop",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "bolder\x2012px\x20",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "*Arrow\x20damage:\x201\x20→\x203",
    ".container",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    "ages.",
    "mob_",
    "statue",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "gem",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "petals!",
    "oAngle",
    "#ffd800",
    "Pollen",
    "isProj",
    "splice",
    "Increases\x20petal\x20pickup\x20range.",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    ":scope\x20>\x20.petal",
    "5th\x20August\x202023",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    "onmessage",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "https://www.youtube.com/@FussySucker",
    "craft-disable",
    ".fixed-name-cb",
    "Heavier\x20than\x20your\x20mom.",
    "nSkOW4GRtW",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "d\x20abs",
    "then",
    ";-webkit-background-position:\x20",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "#503402",
    "hideUserCount",
    "isSupporter",
    "regenF",
    "Flower\x20Damage",
    "Bush",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    "#fff",
    "WAVE",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "*Rock\x20health:\x20120\x20→\x20150",
    "<div\x20class=\x22chat-name\x22></div>",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "PedoX",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    "button",
    "crafted",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "https://www.youtube.com/@gowcaw97",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "cacheRendered",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    "7th\x20August\x202023",
    "Super",
    "Hnphe",
    ".nickname",
    "#7af54c",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    "\x20stea",
    "B4@J",
    "spinSpeed",
    "Ghost_4",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    "#cf7030",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    "WRRdT8kPWO7cMG",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "hornex",
    "murdered",
    "\x22\x20style=\x22color:",
    "wss://eu1.hornex.pro",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    "clientWidth",
    "uwu",
    "checked",
    "resize",
    "getContext",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    "\x0a4th\x20May\x202024\x0aFixed\x20a\x20player\x20dupe\x20bug.\x20\x0aBalances:\x0a*Taco\x20healing:\x209\x20→\x2010\x0a*Sunflower\x20shield:\x201\x20→\x202.5\x0a*Shell\x20shield:\x208\x20→\x2012\x0a*Buffed\x20Yoba\x20Egg\x20by\x2050%\x0a",
    "complete",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "addGroupNumbers",
    "W6HBdwO0",
    "enable_min_scaling",
    "locat",
    "Video\x20AD\x20success!",
    "*Missile\x20damage:\x2050\x20→\x2055",
    "can\x20s",
    "startsWith",
    ".angry-btn",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    "rgb(92,\x20116,\x20176)",
    "userCount",
    "#38c75f",
    "\x20at\x20least!",
    "<div\x20class=\x22petal-container\x22></div>",
    "></di",
    "isConsumable",
    "#8ac355",
    "#634418",
    "#854608",
    "New\x20mob:\x20Beehive.",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    "gcldSq",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    "Wing",
    "sadT",
    "dontResolveCol",
    "scrollTop",
    "dice",
    "atan2",
    "reason:\x20",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "setUint32",
    ";-moz-background-position:\x20",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    "d.\x20Pr",
    "stickbug",
    "numAccounts",
    "New\x20rarity:\x20Hyper.",
    ".inventory",
    "^F[@",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "19th\x20January\x202024",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "https://www.instagram.com/zertalious",
    "Level\x20",
    "no\x20sub,\x20no\x20gg",
    "#b52d00",
    "Yoba_5",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    "rgb(222,111,44)",
    "projAngle",
    "Poison",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "Hornet",
    "m28",
    "#69371d",
    "length",
    "catch",
    "petal",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "projD",
    "#4343a4",
    "spikePath",
    ".\x20Hac",
    "drawSnailShell",
    "4oL8",
    "orbitRange",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "<span\x20style=\x22color:",
    "show_debug_info",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "*Hyper:\x202%\x20→\x201%",
    "#79211b",
    "hpRegen75PerSecF",
    "ned.\x22",
    "*Bone\x20armor:\x204\x20→\x205",
    "heart",
    "hasHalo",
    "Soldier\x20Ant_6",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    ".key-input",
    "lineTo",
    "Can\x27t\x20perform\x20that\x20action.",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "4th\x20August\x202023",
    "12th\x20July\x202023",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "pow",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "server",
    "indexOf",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    "<div\x20class=\x22chat-text\x22>",
    "#7777ff",
    "Buffed\x20Gem.",
    "playerList",
    "petalAntidote",
    ".craft-rate",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    ".hitbox-cb",
    "Spider_2",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    "hpRegen",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    "visible",
    "Kills",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    "\x22></div>",
    "User",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "advanced\x20to\x20number\x20",
    "#fc9840",
    "Nerfed\x20Spider\x20Yoba.",
    "onopen",
    "nt\x20an",
    "#cfbb50",
    "ctx",
    "min",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    "*Rock\x20health:\x2050\x20→\x2060",
    "#888",
    "targetPlayer",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "charAt",
    "nHealth",
    "petalMagnet",
    "Spider\x20Cave",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    "spawnT",
    "#4d5e56",
    "Leave",
    "shop",
    "close",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    "New\x20setting:\x20UI\x20Scale.",
    "admin_pass",
    "Fire\x20Ant",
    "fixAngle",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "1167390UrVkfV",
    "petalArrow",
    "fixed_name_size",
    ".player-list\x20.dialog-content",
    "kers\x20",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "assassinated",
    "wig",
    "shield",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    ".yes-btn",
    "eyeX",
    "9th\x20August\x202023",
    "New\x20mob:\x20Tumbleweed.",
    "*Yoba\x20health:\x20500\x20→\x20350",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "vendor",
    "documentElement",
    "marginBottom",
    "Digit",
    "9th\x20July\x202023",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    "updateT",
    "iReqGambleList",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "#4f412e",
    "Soil",
    "28th\x20August\x202023",
    "petalBasic",
    "#7d5b1f",
    "picked",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    "saved_builds",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    "Beetle_6",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "result",
    "dragon",
    "Fixed\x20another\x20crafting\x20exploit.",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    "*Unsual:\x2025\x20→\x2010",
    "rgba(0,0,0,0.35)",
    ".changelog",
    "***",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    "Getting\x20",
    "fonts",
    "#111",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    "erCas",
    "percent",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    "randomUUID",
    "titleColor",
    "WQ7dTmk3W6FcIG",
    "Missile",
    "Slowness\x20Duration",
    "en-US",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "*Bone\x20armor:\x207\x20→\x208",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    ".absorb-petals",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    "*Fire\x20damage:\x209\x20→\x2015",
    "tooltipDown",
    "Yoba_1",
    "tail_outline",
    "darkLadybug",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    "sandstorm",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    "petalPollen",
    "transition",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "W6RcRmo0WR/cQSo1W4PifG",
    "measureText",
    "7th\x20October\x202023",
    "connect",
    "Loaded\x20Build\x20#",
    ".score-overlay",
    "copyright\x20striked",
    "#695118",
    "*Legendary:\x20125\x20→\x20100",
    "credits",
    "Lvl\x20",
    "Ant\x20Egg",
    "Soldier\x20Ant_2",
    "Re-added\x20Waves.",
    "#2da14d",
    "and\x20a",
    "ur\x20pe",
    ".global-user-count",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "Ears",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    ".timer",
    "*Ultra:\x20125+",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "*Cotton\x20health:\x2012\x20→\x2015",
    "byteLength",
    "fire\x20ant",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "iCheckKey",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "legD",
    ".zone-name",
    "url(",
    "isConnected",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    "onresize",
    "Desert\x20Centipede",
    "/profile",
    "26th\x20January\x202024",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    "Password\x20downloaded!",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    "#a82a00",
    "#493911",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "craftResult",
    "iBreedTimer",
    "cEca",
    "GBip",
    "Nerfed\x20Ant\x20Holes:",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "Elongation",
    "rect",
    "glbData",
    "marginTop",
    ".logout-btn",
    "onStart",
    "Account\x20imported!",
    "offsetWidth",
    "title",
    ".watch-ad",
    "shlong",
    "1st\x20August\x202023",
    "createPattern",
    "#ff94c9",
    "KeyW",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "as_ffa1",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "#ab5705",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    "#cb37bf",
    "host",
    "New\x20mob:\x20Turtle",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "Added\x20maze\x20in\x20Waveroom:",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "#5849f5",
    "cloneNode",
    "count",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "100%",
    "rgba(0,0,0,0.2",
    "tier",
    "Honey",
    "honeyDmg",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "x.pro",
    "other",
    "pickupRange",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "parts",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "Ultra",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "onkeydown",
    "Mob\x20Rotation",
    "Username\x20claimed!",
    "isBae",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "Could\x20not\x20claim\x20secret\x20skin.",
    "#b28b29",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "strok",
    "fixed",
    "us_ffa2",
    "prototype",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "WQpcUmojoSo6",
    ".absorb-btn",
    "bone_outline",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "Yoba_4",
    "web",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    "26th\x20September\x202023",
    ".tooltips",
    "),0)",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    ".main",
    "antHole",
    "makeAntenna",
    "Petaler",
    "Increased\x20Wave\x20mob\x20count.",
    "Taco",
    "#000",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "workerAntFire",
    "Hornet_3",
    "Cotton",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    "getBigUint64",
    "u\x20hav",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    "us_ffa1",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    ".stats",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    "crab",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "arial",
    "*Super:\x205-15",
    "Invalid\x20mob\x20name:\x20",
    "#e0c85c",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "#ccad00",
    "Fonts\x20loaded!",
    "find",
    "makeHole",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    "isPetal",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "adplayer",
    "extraSpeedTemp",
    "rgba(0,0,0,0.2)",
    "toUpperCase",
    ".connecting",
    "KeyS",
    "rgb(255,\x20230,\x2093)",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    "W5bKgSkSW78",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    "zvNu",
    "KeyC",
    "healthIncreaseF",
    "fixedSize",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    "startPreRoll",
  ];
  a = function () {
    return BK;
  };
  return a();
}
