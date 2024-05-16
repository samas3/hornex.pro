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
function b(c, d) {
  const e = a();
  return (
    (b = function (f, g) {
      f = f - 0x6c;
      let h = e[f];
      return h;
    }),
    b(c, d)
  );
}
function a() {
  const Ce = [
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "gambleList",
    "Scorpion\x20redesign.",
    "WR7cQCkf",
    "Cotton",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    "NSlTg",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    "petalSponge",
    "iReqAccountData",
    "particle_heart_",
    "#d3bd46",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    "sameTypeColResolveOnly",
    "workerAntFire",
    "isPoison",
    "#cfc295",
    "anti_spam",
    "result",
    "our\x20o",
    ".player-count",
    "945310uVugmy",
    "23rd\x20August\x202023",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    "Spider\x20Egg",
    "petalAntEgg",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    ".collected-petals",
    "uiX",
    "isTrusted",
    "\x0a4th\x20May\x202024\x0aFixed\x20a\x20player\x20dupe\x20bug.\x20\x0aBalances:\x0a*Taco\x20healing:\x209\x20→\x2010\x0a*Sunflower\x20shield:\x201\x20→\x202.5\x0a*Shell\x20shield:\x208\x20→\x2012\x0a*Buffed\x20Yoba\x20Egg\x20by\x2050%\x0a",
    "has\x20ended.",
    "Provide\x20a\x20name\x20dummy.",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "r\x20acc",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "Disconnected.",
    "/hqdefault.jpg)",
    ".global-user-count",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "picked",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    "*Hyper:\x202%\x20→\x201%",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "petalGas",
    "cde9W5NdTq",
    "></div>",
    "pickupRange",
    "body",
    "#dddddd",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "shinyCol",
    "*Cotton\x20health:\x2012\x20→\x2015",
    "petalPollen",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    "Account\x20imported!",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    "26th\x20January\x202024",
    "oPlayerY",
    "petalSword",
    "*Swastika\x20health:\x2020\x20→\x2025",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    "*Arrow\x20health:\x20180\x20→\x20220",
    "#695118",
    "*Ultra:\x20125+",
    "#a17c4c",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    "angry",
    "\x20by",
    "24th\x20June\x202023",
    "Copied!",
    "#cfbb50",
    "Game",
    "putImageData",
    "petalAvacado",
    "Faster",
    ".petal-count",
    "curve",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    "Extra\x20Pickup\x20Range",
    "W6RcRmo0WR/cQSo1W4PifG",
    "All\x20Petals",
    "Fixed\x20another\x20crafting\x20exploit.",
    "#ffe763",
    "Shell",
    "12OVuKwi",
    "sk.",
    "rgb(126,\x20239,\x20109)",
    "rgba(0,0,0,0.2)",
    "15th\x20June\x202023",
    "Magnet",
    "TC0B",
    ".shake-cb",
    "Yoba_1",
    "bush",
    "total",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    "oSize",
    "makeBallAntenna",
    "invalid",
    "localId",
    "Added\x201\x20AS\x20lobby.",
    "transform",
    "#79211b",
    "Coffee",
    "\x22></span>\x0a\x09\x09\x09</div>",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "#c1ab00",
    "KeyV",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "Zert",
    "14th\x20August\x202023",
    "keyAlreadyUsed",
    "size",
    "#15cee5",
    "beehive",
    "Rock_6",
    "%!Ew",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "setAttribute",
    "isPortal",
    "Invalid\x20mob\x20name:\x20",
    "statuePlayer",
    "Dice",
    "adplayer-not-found",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    "#775d3e",
    "wss://",
    "worldW",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "#39b54a",
    "sqrt",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    "EU\x20#1",
    "#333",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    "opera",
    "\x22></span>\x20<span\x20stroke=\x22•\x20",
    "preventDefault",
    "^F[@",
    "#fff0b8",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    ".export-btn",
    "4th\x20September\x202023",
    "*Banana\x20damage:\x201\x20→\x202",
    "health",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "28th\x20June\x202023",
    "numeric",
    "nHealth",
    ".box",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    "createdAt",
    "petalMushroom",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "#543d37",
    "pedox",
    "oiynC",
    "powderPath",
    "iLeaveGame",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    "Region:\x20",
    "wrecked",
    "fire",
    "\x20at\x20y",
    "*They\x20give\x2010x\x20score.",
    "Crab",
    "100%",
    "isRetard",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    "spiderCave",
    "#ab5705",
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "Bush",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    ".textbox",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    "*Rice\x20damage:\x205\x20→\x204",
    "WPfQmmoXFW",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    "6th\x20September\x202023",
    "ready",
    "send",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    "localStorage\x20denied.",
    "position",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "Hornet_1",
    "prepend",
    "mushroom",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    "#4343a4",
    "22nd\x20July\x202023",
    "match",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "btn",
    "hsl(110,100%,10%)",
    "binaryType",
    "arrested\x20for\x20plagerism",
    "fixedSize",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "petalMissile",
    "Bubble",
    "no\x20sub,\x20no\x20gg",
    "Mob\x20Agro\x20Range",
    "finalMsg",
    "replace",
    "addCount",
    ".censor-cb",
    "4th\x20April\x202024",
    ";-moz-background-position:\x20",
    "main",
    "vendor",
    ".clown-cb",
    "*Rock\x20health:\x20120\x20→\x20150",
    "absorbDamage",
    "portalPoints",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    "changelog",
    "webSize",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "#be342a",
    "Honey\x20factory.",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "Passive\x20Heal",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "gem",
    "Dragon_6",
    "\x20+\x20",
    "alpha",
    "poisonT",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    "setUint32",
    "ICIAL",
    "Luxurious\x20mansion\x20of\x20ants.",
    "regenAfterHp",
    "clip",
    "identifier",
    "object",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "*Iris\x20poison:\x2045\x20→\x2050",
    "3m^(",
    "entRot",
    "#709d45",
    "ad\x20refresh",
    "dontPushTeam",
    "u\x20hav",
    "as_ffa1",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    "drawChats",
    "*Peas\x20damage:\x2010\x20→\x2012",
    "oceed",
    "23rd\x20July\x202023",
    "superPlayers",
    "20th\x20June\x202023",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    "textBaseline",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "%\x20-\x200.8em*",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    "barEl",
    "Poison\x20Reduction",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "Reduced\x20Wave\x20duration.",
    "12th\x20July\x202023",
    "#b0473b",
    ".score-overlay",
    "min",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "Space",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "petal_",
    "jellyfish",
    ".dismiss-btn",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "hypot",
    "fillStyle",
    "projAngle",
    "slayed",
    "drawShell",
    "usernameClaimed",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "Yoba_3",
    "📜\x20",
    "Hornet_6",
    "Importing\x20data\x20file:\x20",
    "OQM)",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    "canSkipRen",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    "scale",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    "lightningDmgF",
    "petalPowder",
    "inclu",
    "*Heavy\x20health:\x20450\x20→\x20500",
    "cmd",
    "mobKilled",
    ".lottery-timer",
    "altKey",
    ".ad-blocker",
    "17th\x20June\x202023",
    "isHudPetal",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    "rotate",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "isConnected",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "*Hyper:\x2015-25",
    "e8oQW7VdPKa",
    "1st\x20August\x202023",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    "background",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    "isPetal",
    "petalDandelion",
    "Beetle_2",
    "uiScale",
    "twirl",
    ".switch-btn",
    "#fe98a2",
    "Cotton\x20bush.",
    "#fbdf26",
    "percent",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "abeQW7FdIW",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "yellowLadybug",
    ".changelog",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "state",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "countEl",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    "sort",
    "#8b533f",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    "tals.",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    "hsla(0,0%,100%,0.5)",
    "20th\x20January\x202024",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "enable_shake",
    "STOP!",
    "count",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "redHealthTimer",
    "spawnT",
    "Poisonous\x20gas.",
    ".download-btn",
    "shop",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    ".xp",
    "#8f5db0",
    "renderOverEverything",
    "ui_scale",
    "\x0a\x09</div>",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    "Invalid\x20username.",
    "It\x20likes\x20to\x20dance.",
    "outdatedVersion",
    "Powder",
    "honeyDmg",
    "mouse2",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "14riTpLs",
    "eyeY",
    "sponge",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "*Snail\x20damage:\x2015\x20→\x2020",
    "data-icon",
    "map",
    "centipedeBodyDesert",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    ".lottery\x20.inventory-petals",
    "ion",
    "petalSoil",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    "31st\x20July\x202023",
    ".screen",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "Beetle_6",
    "ArrowUp",
    "#32a852",
    "hide_chat",
    "Rock_5",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    ".lottery",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "red",
    "96245QXjVGD",
    "endsWith",
    "Kills",
    "Cactus",
    "Stick\x20does\x20not\x20expand\x20now.",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "├─\x20",
    "petSizeIncrease",
    "Arrow",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    "darkLadybug",
    "antHoleFire",
    "OFFIC",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "sendBadMsg",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "*Hyper:\x20175+",
    "*Heavy\x20damage:\x209\x20→\x2010",
    "Health\x20Depletion",
    "WRRdT8kPWO7cMG",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    "blur",
    "petalSuspill",
    "hasSpawnImmunity",
    "(81*",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "fossil",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "dragonNest",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "getRandomValues",
    "dice",
    "copyright\x20striked",
    "onmouseleave",
    "NHkBqi",
    "ArrowLeft",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    "index",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    "ShiftRight",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    ".\x22></span></div>",
    ".absorb-clear-btn",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    "iBreedTimer",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    "drawWingAndHalo",
    "readAsText",
    "<div\x20stroke=\x22",
    ".loader",
    "Level\x20",
    ".discord-area",
    "typeStr",
    "mobsEl",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    "WRyiwZv5x3eIdtzgdgC",
    "kicked",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "hostname",
    "iReqGlb",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    "10px",
    "%;\x22\x20stroke=\x22",
    "%/s",
    "Claiming\x20secret\x20skin...",
    "can\x20s",
    ":scope\x20>\x20.petal",
    "1st\x20February\x202024",
    "#ce79a2",
    "Rock_1",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    "canRender",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "petalCotton",
    "Reflected\x20Missile\x20Damage",
    "Added\x20Discord\x20login.",
    "Invalid\x20account!",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    "KGw#",
    "Soaks\x20damage\x20over\x20time.",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    "doShow",
    "#b53229",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    "weight",
    "makeSponge",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "#654a19",
    "title",
    "#353331",
    ".logout-btn",
    "updateTime",
    "ur\x20pe",
    "teal\x20",
    "#d3ad46",
    "mood",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "getContext",
    "#eb4755",
    "55078DZMiSD",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    "Username\x20too\x20big!",
    "Statue\x20of\x20RuinedLiberty.",
    ".import-btn",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    ".helper-cb",
    "translate(-50%,",
    "Balancing:",
    "#c76cd1",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "#cdbb48",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    "Sandstorm_6",
    ".credits-btn",
    "\x20domain=.hornex.pro",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    "6fCH",
    "scale(",
    "*Opening\x20Lottery",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "\x27s\x20profile...",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "orb\x20a",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    "i\x20make\x20cool\x20videos",
    "projSize",
    "elongation",
    "#fdda40",
    "unnamed",
    "oHealth",
    "Beetle\x20Egg",
    "iSwapPetal",
    "userAgent",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    "s...)",
    "successCount",
    "dir",
    "projPoisonDamageF",
    ".builds\x20.dialog-content",
    "<div\x20class=\x22spinner\x22></div>",
    "*Rock\x20health:\x20150\x20→\x20200",
    "your\x20",
    "hsl(110,100%,60%)",
    "#4eae26",
    "rock",
    "bolder\x2017px\x20",
    "Ant\x20Egg",
    "hasGem",
    "#5ef64f",
    "fovFactor",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "kers\x20",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "nSize",
    "210ZoZRjI",
    "Desert\x20Centipede",
    "Sunflower",
    ".shop-btn",
    "sad",
    "crafted",
    "Spider_6",
    ".yes-btn",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "\x27s\x20Profile",
    "projAffectHealDur",
    "#dbab2e",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    "Yellow\x20Ladybug",
    "bolder\x20",
    "key",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "healthIncreaseF",
    "\x20from\x20",
    "search",
    "https://www.youtube.com/@KePiKgamer",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    "KeyD",
    "Yoba\x20Egg",
    "Duration",
    "n8oKoxnarXHzeIzdmW",
    "Continue",
    "23rd\x20January\x202024",
    "Gas",
    "27th\x20July\x202023",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    "Ghost_1",
    "Digit",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    "W6HBdwO0",
    "#222",
    "sword",
    "an\x20UN",
    "extraSpeedTemp",
    "max",
    "hasEars",
    "font",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "armor",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    "accountId",
    "countAngleOffset",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "iReqGambleList",
    "WRzmW4bPaa",
    "duration",
    "clientHeight",
    ".tv-next",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    "*Swastika\x20health:\x2030\x20→\x2035",
    ".shop",
    "*Fire\x20damage:\x209\x20→\x2015",
    "Dragon\x20Egg",
    "W5OTW6uDWPScW5eZ",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    "*Gas\x20health:\x20250\x20→\x20200",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "New\x20mob:\x20Sunflower.",
    "Could\x20not\x20claim\x20secret\x20skin.",
    ".progress",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "#76ad45",
    "#fff",
    "#735d5f",
    "28th\x20August\x202023",
    "Rock_4",
    "decode",
    "*Peas\x20damage:\x208\x20→\x2010",
    "rkJNdF",
    "Sponge",
    "clipboard",
    ".builds-btn",
    ".insta-btn",
    "Ancester\x20of\x20flowers.",
    "http://localhost:6767/",
    "#b28b29",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "sandstorm",
    ".featured",
    "wing",
    ".common",
    "Increases",
    "killed",
    "isAggressive",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    "Temporary\x20Extra\x20Speed",
    "Sandstorm_2",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "#ff4f4f",
    "\x20HP",
    "Increases\x20petal\x20spin\x20speed.",
    "s\x20can",
    "moveCounter",
    "Craft",
    "bone",
    "atan2",
    "LavaWater",
    "dur",
    "progress",
    "petRoamFactor",
    "hpRegenPerSec",
    "\x20stea",
    "hsl(60,60%,30%)",
    "\x0aServer:\x20",
    "save",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "rgb(237\x20236\x2061)",
    "occupySlot",
    "fontFamily",
    "#8a6b1f",
    "appendChild",
    "Spawns",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    ".stats",
    "backgroundColor",
    "orbitRange",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    "25th\x20July\x202023",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "getBigUint64",
    ".stat-value",
    "WRZdV8kNW5FcHq",
    "Soldier\x20Ant_2",
    "queenAnt",
    "#bc0000",
    "#d43a47",
    "rgb(166\x2056\x20237)",
    "petalAntidote",
    ".lb",
    "Downloaded!",
    "Extra\x20Spin\x20Speed",
    "/dlPetal",
    "rgb(134,\x2031,\x20222)",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    ".my-player",
    "makeMissile",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "nLrqsbisiv0SrmoD",
    "Added\x20another\x20AS\x20lobby.",
    "#323032",
    "Damage",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "mobGallery",
    "#b5a24b",
    "off",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    "fireTime",
    "catch",
    ".shop-overlay",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "It\x20has\x20sussy\x20movement.",
    "Nitro\x20Boost",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    ".container",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "hsla(0,0%,100%,0.25)",
    "\x20won\x20and\x20got\x20extra",
    "globalCompositeOperation",
    "#a2dd26",
    "AS\x20#2",
    "]\x22></div>",
    "Flower\x20Poison",
    "New\x20mob:\x20Beehive.",
    "(auto\x20reloading\x20in\x20",
    "nt\x20an",
    "#554213",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "find",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    "MOVE\x20AWAY!!",
    "backgroundImage",
    "respawnTimeTiers",
    "iPercent",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    "Super\x20Players",
    "uniqueIndex",
    ".debug-cb",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "Very\x20sussy\x20data!",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    "randomUUID",
    "show_hitbox",
    "sunflower",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Your\x20Profile",
    "bezierCurveTo",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    ".privacy-btn",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "New\x20mob:\x20Dragon\x20Nest.",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "WPJcKmoVc8o/",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    "rgb(92,\x20116,\x20176)",
    "soldierAnt",
    "kWicW5FdMW",
    "ellipse",
    "Yoba_2",
    "deadPreDraw",
    "<span\x20style=\x22color:",
    "statue",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    ".minimap-cross",
    "{background-color:",
    "stopWhileMoving",
    "updateProg",
    "253906KWTZJW",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    "\x20FPS\x20/\x20",
    "toLocaleDateString",
    ".grid",
    "purple",
    "#33a853",
    ".collected-rarities",
    "are\x20p",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    "documentElement",
    "n\x20an\x20",
    "drawArmAndGem",
    "scorp",
    "doLerpEye",
    "qCkBW5pcR8kD",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    "*Taco\x20healing:\x208\x20→\x209",
    "glbData",
    "ignore\x20if\x20u\x20already\x20subbed",
    ".clear-build-btn",
    ".find-user-btn",
    "top",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    "petals!",
    "continent_code",
    "snail",
    "\x22></div>\x0a\x09</div>",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "Stick",
    "show_clown",
    "now",
    "Hornet_4",
    "Soil",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    "Removed\x20Waves.",
    "3WRI",
    "enable_min_scaling",
    "petHealF",
    "Elongation",
    "onclick",
    ".login-btn",
    "*Super:\x201%\x20→\x201.5%",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "WPPnavtdUq",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "wave",
    "rainbow-text",
    "\x20downloaded!",
    "WQpcUmojoSo6",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    "14th\x20July\x202023",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    "wss://us2.hornex.pro",
    ".dialog-content",
    "Fire\x20Duration",
    "renderBelowEverything",
    "isRectHitbox",
    "Fonts\x20loaded!",
    "824543MnoesV",
    "fixed",
    "#ceea33",
    "#9e7d24",
    "[G]\x20Show\x20Grid:\x20",
    "#fcfe04",
    ".\x22>\x20<span\x20class=\x22username-link\x22\x20stroke=\x22",
    "#bbbbbb",
    "render",
    "\x20petal",
    "Yourself",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "Wave\x20Ending...",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    "onkeydown",
    "15584076IAHWRs",
    "4th\x20July\x202023",
    "locat",
    "restore",
    "ctx",
    "Ants\x20redesign.",
    "*Arrow\x20damage:\x203\x20→\x204",
    "iMood",
    "iGamble",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    "21st\x20June\x202023",
    "keys",
    ".checkbox",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "Evil\x20Centipede",
    "successful",
    "fillRect",
    "Tiers",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    "en-US",
    "player",
    "show",
    ";-webkit-background-position:\x20",
    "remove",
    "ladybug",
    ".lottery-btn",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    "3336680ZmjFAG",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    "baseSize",
    "*Bone\x20armor:\x208\x20→\x209",
    "ceil",
    "bolder\x2012px\x20",
    "Worker\x20Ant",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    "Enter",
    "unset",
    "\x20Wave\x20",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    "expand",
    "deltaY",
    "WARNING!",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    "Wave",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    ".key-input",
    "petalNitro",
    "stayIdle",
    "Beetle",
    "hsla(0,0%,100%,0.15)",
    "lightningBounces",
    "Fire\x20Damage",
    "release",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "iScore",
    "_blank",
    "https://ipapi.co/json/",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "spiderLeg",
    "setValue",
    "Added\x20maze\x20in\x20Waveroom:",
    "\x20and\x20",
    "setUserCount",
    "\x5c$1",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    "Ultra",
    "scrollHeight",
    "ing\x20o",
    "Poop\x20colored\x20Ladybug.",
    "petalerDrop",
    "targetEl",
    "Sandstorm_3",
    ".server-area",
    "hostn",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "lineWidth",
    "tile_",
    "Spider_4",
    "(reloading...)",
    "BrnPE",
    "/weborama.js",
    "mousedown",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    "hornex-pro_970x250",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    "Gem",
    "ghost",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    "#000",
    "Fixed\x20number\x20rounding\x20issue.",
    "#d54324",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    "clientX",
    "New\x20mob:\x20Tumbleweed.",
    "div",
    "rgba(0,0,0,0.35)",
    "rgba(0,\x200,\x200,\x200.15)",
    "isDevelopmentMode",
    "*2%\x20craft\x20success\x20rate.",
    "Basic",
    "nigersaurus",
    "isBooster",
    "encod",
    "12th\x20August\x202023",
    "petalStickbug",
    "#ffe667",
    "Centipede",
    "#cb37bf",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    "petalRose",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    "keyCheckFailed",
    "projSpeed",
    "makeLadybug",
    "\x0a5th\x20May\x202024\x0aHeavy\x20now\x20slows\x20down\x20your\x20petal\x20orbit\x20speed.\x20More\x20slowness\x20for\x20higher\x20rarity.\x20\x0aCotton\x20doesn\x27t\x20expand\x20like\x20Rose\x20when\x20you\x20are\x20angry.\x0aPowder\x20now\x20adds\x20turbulence\x20to\x20your\x20petals\x20when\x20you\x20are\x20angry.\x0aFixed\x20more\x20player\x20dupe\x20bugs.\x0a",
    "*Cotton\x20health:\x208\x20→\x209",
    "pathSize",
    ".main",
    "finally",
    "rgb(",
    "20th\x20July\x202023",
    "Petal\x20Weight",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    "sadT",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "asdfadsf",
    "us_ffa2",
    "userChat",
    "yoba",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    "CCofC2RcTG",
    ".\x20Hac",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    "clearRect",
    "Former\x20student\x20of\x20Yoda.",
    "19th\x20January\x202024",
    "KCsdZ",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "invalid\x20uuid",
    "Starfish",
    "petalSwastika",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    "lastElementChild",
    "center",
    "stroke",
    "href",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    "visible",
    "lient",
    "waveNumber",
    "User",
    "petalShell",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "murdered",
    "execCommand",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    ".prediction",
    "target",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "Lvl\x20",
    "\x22>Page\x20#",
    "neutral",
    "isBoomerang",
    "Yoba_5",
    ".sad-btn",
    "Increases\x20petal\x20pickup\x20range.",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    "Lightsaber",
    "*Turtle\x20health:\x20600\x20→\x20900",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "vFKOVD",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "3rd\x20July\x202023",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    "Loaded\x20Build\x20#",
    ".absorb-btn",
    "canvas",
    "15th\x20August\x202023",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    "iWatchAd",
    "pZWkWOJdLW",
    "toFixed",
    "https://www.instagram.com/zertalious",
    "msgpack",
    "Sword",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "Nigerian\x20Ladybug.",
    "\x22></span></div>\x0a\x09</div>",
    "onclose",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    "hornex",
    "*Damage:\x204\x20→\x206",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "insertBefore",
    "Summons\x20the\x20power\x20of\x20wind.",
    "\x0a16th\x20May\x202024\x0aAdded\x20Game\x20Statistics:\x0a*Super\x20Players\x0a*Hyper\x20Players\x0a*All\x20Petals\x0a*Data\x20is\x20updated\x20every\x20hour.\x0a",
    ".scale-cb",
    "toLocaleString",
    "absorbPetalEl",
    "[F]\x20Show\x20Hitbox:\x20",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "cantChat",
    "Beetle_5",
    "mobDespawned",
    "petalRockEgg",
    "10th\x20August\x202023",
    "long",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "text/plain;charset=utf-8;",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "#a760b1",
    "Yoba",
    "\x22></span>\x20",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "IAL\x20c",
    "24th\x20August\x202023",
    "B4@J",
    ".build-petals",
    "centipedeHeadPoison",
    "https://www.youtube.com/@FussySucker",
    "clientY",
    "projPoisonDamage",
    "executed",
    ".id-group",
    "disabled",
    "labelSuffix",
    "Increased\x20shiny\x20mob\x20size.",
    "#b58500",
    "petCount",
    "select",
    "<div\x20class=\x22dialog\x20tier-",
    "https://stats.hornex.pro/",
    "└─\x20",
    "#f2b971",
    "petalLeaf",
    "28th\x20December\x202023",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    "#416d1e",
    "\x20stroke=\x22",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
    "2nd\x20October\x202023",
    "More\x20wave\x20changes:",
    "WR7dPdZdQXS",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "RuinedLiberty",
    "innerHeight",
    "%;left:",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "Added\x20video\x20ad.",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "https://stats.hornex.pro/api/userCount",
    "16th\x20July\x202023",
    "petalDragonEgg",
    "#924614",
    ".no-btn",
    ".username-input",
    "beaten\x20to\x20death",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    ".lottery-users",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    "Honey\x20Damage",
    "WP3dRYddTJC",
    "floor",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    "petalSunflower",
    "doRemove",
    "Neowm",
    "els",
    "static",
    "Ghost_2",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    "Baby\x20Ant",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    "#7d893e",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    ".player-list-btn",
    "video-ad-skipped",
    "respawnTime",
    ".submit-btn",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "rgba(0,0,0,0.1)",
    "keydown",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "deadT",
    "rgb(222,\x2031,\x2031)",
    "wss://us1.hornex.pro",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "canShowDrops",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "progressEl",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "Pill",
    "KeyF",
    "tierStr",
    "isArray",
    "[data-icon]",
    "flower",
    "</div><div\x20class=\x22log-line\x22></div>",
    "9th\x20July\x202023",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "\x20Ultra",
    "6th\x20July\x202023",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "halo",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "9iYdxUh",
    "show_scoreboard",
    "#4f412e",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    "accountNotFound",
    "Red\x20ball.",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    "drawImage",
    "getAttribute",
    "isSpecialWave",
    ".flower-stats",
    "Kills\x20Needed",
    "projDamage",
    "Ant\x20Hole",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "bubble",
    "extraRange",
    ".chat-content",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "Super",
    "beetle",
    "#ff7892",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "ShiftLeft",
    "#8f5f34",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "iPing",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Heavy\x20health:\x20500\x20→\x20600",
    "toDataURL",
    "tier",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    "WAVE",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    "ontouchend",
    "lobbyClosing",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "avacado",
    "rgb(81\x20121\x20251)",
    "insert\x20something\x20here...",
    "\x20radians",
    ".inventory\x20.inventory-petals",
    "dispose",
    "Spider",
    "fixAngle",
    "18th\x20September\x202023",
    "Yoba_4",
    "Poison",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "#406150",
    "\x20play",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    "#555",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "#7d5b1f",
    "<div\x20class=\x22petal-count\x22></div>",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    "15807WcQReK",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    "icBdNmoEta",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    "*Arrow\x20damage:\x204\x20→\x205",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    "fixed_name_size",
    "nameEl",
    "Absorb",
    "#ff63eb",
    "Congratulations!",
    "hasSpiderLeg",
    "removeChild",
    "*Missile\x20damage:\x2050\x20→\x2055",
    "Yoba_6",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "p41E",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    "Pet\x20Size\x20Increase",
    ";\x22\x20stroke=\x22",
    "lineCap",
    "petalCement",
    "*Reduced\x20mob\x20count.",
    ".expand-btn",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "terms.txt",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "isProj",
    "assassinated",
    "FSoixsnA",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    "ears",
    "eyeX",
    "zert.pro",
    ".lottery\x20.dialog-content",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "https",
    "stickbugBody",
    "#d3c66d",
    "https://www.youtube.com/@gowcaw97",
    "Breaths\x20fire.",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    "Increases\x20your\x20vision.",
    "uiHealth",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    ".joystick",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "#222222",
    "m28",
    "7th\x20August\x202023",
    "Connected!",
    "show-petal",
    "mushroomPath",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "retardDuration",
    "score",
    "*Banana\x20health:\x20170\x20→\x20400",
    "#a52a2a",
    "fireDamageF",
    "Beetle_3",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "button",
    "showItemLabel",
    "iClaimUsername",
    "consumeProj",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    "green",
    "#d9511f",
    "3rd\x20August\x202023",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "Soldier\x20Ant_3",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "KeyC",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "server",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "fake",
    "#333333",
    "5499920HnRuGv",
    "containerDialog",
    ")\x20rotate(",
    "show_bg_grid",
    "petHealthFactor",
    "updatePos",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    "hide-scoreboard",
    "l\x20you",
    "GsP9",
    "url",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    "span",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "consumeProjHealth",
    "pacman",
    "petalStarfish",
    "angleSpeed",
    "2357",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    "#634002",
    ".stats-btn",
    "changedTouches",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "<div\x20class=\x22chat-text\x22></div>",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    "25th\x20August\x202023",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    "Nerfs:",
    "ondragover",
    "shift",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    "pink",
    "Password\x20downloaded!",
    "getUint32",
    "W7/cOmkwW4lcU3dcHKS",
    "#454545",
    "#735b49",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    "absolute",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "strokeStyle",
    "/dlMob",
    "other",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    "pop",
    "color",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    ".total-kills",
    "Beetle_1",
    "Poop\x20Damage",
    "uiName",
    "prototype",
    "Epic",
    "26th\x20September\x202023",
    "honeyRange",
    "sortGroups",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    "#bebe2a",
    ".scoreboard-title",
    "pow",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "drawIcon",
    "antHole",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "cEca",
    "WQxdVSkKW5VcJq",
    "<div\x20class=\x22slot\x22></div>",
    "resize",
    "\x20$1",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    "push",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    "month",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "rgb(77,\x2082,\x20227)",
    "textarea",
    "Extra\x20Speed",
    "petalMagnet",
    "#A8A7A4",
    "complete",
    "right_align_petals",
    "scale2",
    "Makes\x20you\x20poisonous.",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    "petalChromosome",
    "nSkOW4GRtW",
    "they\x20copied\x20florr\x20code\x20omg!!",
    "1841224gIAuLW",
    ".petals-picked",
    ".right-align-petals-cb",
    "breedPower",
    "parts",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "countTiers",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    ".hitbox-cb",
    "no-icon",
    "hsla(0,0%,100%,0.3)",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    "Statue",
    "#2da14d",
    "#29f2e5",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "onwheel",
    "<style>\x0a\x09\x09",
    ".low-quality-cb",
    "27th\x20June\x202023",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    ".petals.small",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "u\x20are",
    ".total-accounts",
    "#b05a3c",
    "lighter",
    "23rd\x20June\x202023",
    "shootLightning",
    ".waveroom-info",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "makeSpiderLegs",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "requestAnimationFrame",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    "wasDrawn",
    "#f55",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "Turtle",
    "addToInventory",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    "groups",
    "*Legendary:\x20125\x20→\x20100",
    "e\x20bee",
    "New\x20score\x20formula.",
    "*Increased\x20drop\x20rates.",
    "s.\x20Yo",
    "Nitro",
    "#347918",
    "Grapes",
    "Honey",
    "Petaler",
    "show_grid",
    "e=\x22Yo",
    "desktop",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "\x22></span></div>",
    "rgb(222,111,44)",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "animationDirection",
    "password",
    "Taco",
    "Extremely\x20slow\x20sussy\x20mob.",
    "outlineCount",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    "touchmove",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    ".craft-btn",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "#8ac355",
    "New\x20mob:\x20Fossil.",
    "height",
    "Leaf",
    ".absorb-petals-btn",
    "yellow",
    "Boomerang.",
    "Increased\x20Ultra\x20key\x20price.",
    "Pollen",
    "angleOffset",
    "*Bone\x20armor:\x209\x20→\x2010",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "toString",
    "hsla(0,0%,100%,0.1)",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "WP10rSoRnG",
    "translate(calc(",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    "6th\x20August\x202023",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    "\x20(Lvl\x20",
    "focus",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "hide-icons",
    "Fixed\x20Gem\x20glitch.",
    "New\x20mob:\x20Furry.",
    "useTimeTiers",
    "New\x20mob:\x20Dice.",
    "maxLength",
    "#34f6ff",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    "Added\x20Waves.",
    "centipedeBodyPoison",
    "Soldier\x20Ant",
    "none",
    "oAngle",
    "#3db3cb",
    ".minimap",
    "number",
    "Pet\x20Heal",
    "Dragon_4",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "reloadT",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    "Removed\x20disclaimer\x20from\x20menu.",
    "#cccccc",
    "27th\x20February\x202024",
    "damage",
    "flowerPoison",
    "breedTimerAlpha",
    "tCkxW5FcNmkQ",
    "New\x20mob:\x20Sponge",
    "reset",
    "Pill\x20affects\x20Arrow\x20now.",
    "keyCode",
    "Take\x20Down\x20Time",
    "#21c4b9",
    ".discord-btn",
    "right",
    "isSupporter",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "leaders",
    "\x22\x20stroke=\x22",
    "New\x20mob:\x20Nigersaurus.",
    "queen",
    "wn\x20ri",
    "n\x20war",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "Bounces",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    "Ghost_3",
    "innerHTML",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    "hornex-pro_300x600",
    "start",
    "agroRangeDec",
    "setUint8",
    "25th\x20June\x202023",
    "petalSand",
    "orbitDance",
    "Antennae",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    "stepPerSecMotion",
    ".rewards-btn",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "hasHearts",
    "small\x20full",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "useTime",
    "startEl",
    "babyAntFire",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "rgba(0,0,0,0.08)",
    ".damage-cb",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    ".swap-btn",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    "Last\x20Updated:\x20",
    "flipDir",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "#38c75f",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    "<div>\x0a\x09\x09<span\x20stroke=\x22",
    ".nickname",
    "Ugly\x20&\x20stinky.",
    "isInventoryPetal",
    "petalCactus",
    "projD",
    "bruh",
    "#6f5514",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "readyState",
    "*Health:\x20100\x20→\x20120",
    ".settings-btn",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    "#feffc9",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    ".zone-mobs",
    "day",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "waveShowTimer",
    "&response_type=code&scope=identify&state=",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    "135249DkEsVO",
    "#fc9840",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    "slowDuration",
    "16th\x20June\x202023",
    "Checking\x20username\x20availability...",
    "21st\x20July\x202023",
    "shield",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "petalSalt",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    "honeyTile",
    "privacy.txt",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "strok",
    ".stats\x20.dialog-content",
    ".gamble-petals-btn",
    "pickupRangeTiers",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "2090768fiNzSa",
    "Spider_2",
    "Some\x20Data",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "uiY",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "Peas",
    "swapped",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    "test",
    ".reload-timer",
    "Goofy\x20little\x20wanderer.",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    "Petal\x20Slots",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "#ffd800",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "hasEye",
    "GBip",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "credits",
    "Invalid\x20petal\x20name:\x20",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "blue",
    ".super-buy",
    "poisonDamage",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    "Yin\x20Yang",
    ".claimer",
    "spikePath",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "\x22></div>",
    "?dev",
    "hsl(110,100%,50%)",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    ".username-area",
    "Halo",
    "shell",
    "Press\x20G\x20to\x20toggle\x20grid.",
    "<div\x20stroke=\x22Last\x20Updated:\x2010s\x20ago\x22></div>",
    "3YHM",
    ".username-link",
    "tagName",
    "*Peas\x20damage:\x2012\x20→\x2015",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "\x0a\x0a\x09\x09\x09",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "spiderYoba",
    "Light",
    "*Light\x20damage:\x2012\x20→\x2010",
    "\x20no-icon\x22\x20",
    "Stickbug",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "Increased\x20map\x20size\x20by\x2030%.",
    "W43cOSoOW4lcKG",
    "location",
    "Mob\x20Rotation",
    "affectHealDur",
    "Flower\x20#",
    "hurtT",
    "0@x9",
    "--angle:",
    "Hornet_3",
    ".mobs-btn",
    "petalPacman",
    "Dragon_5",
    "fill",
    ".tier-",
    "petalDmca",
    "W5bKgSkSW78",
    "#288842",
    "10th\x20July\x202023",
    "xgMol",
    "blur(10px)",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    ".changelog-btn",
    "onEnd",
    "then",
    "wss://as1.hornex.pro",
    "unknown",
    "data",
    "KeyM",
    "joinedGame",
    "AS\x20#1",
    "29th\x20June\x202023",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "Fussy\x20Sucker",
    "kbps",
    "bsorb",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    ".connecting",
    "ArrowRight",
    "centipedeBody",
    "#555555",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "21st\x20January\x202024",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "Need\x20to\x20be\x20Lvl\x20",
    ".show-bg-grid-cb",
    "&#Uz",
    "spotPath_",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "col",
    "Redesigned\x20some\x20mobs.",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "userProfile",
    "zmkhtdVdSq",
    "<div\x20class=\x22chat-name\x22></div>",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "motionKind",
    "onkeyup",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "bone_outline",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    "cDHZ",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "%\x20success\x20rate",
    "*Rare:\x2050\x20→\x2035",
    "getUint16",
    "rgb(31,\x20219,\x20222)",
    "Expander",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    "Passive\x20Shield",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "rad)",
    "...",
    "7th\x20July\x202023",
    "deg",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    "#e0c85c",
    "path",
    "moveSpeed",
    "Saved\x20Build\x20#",
    "Fixed\x20Rice.",
    "Furry",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    "admin_pass",
    "px)",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "text",
    "#eee",
    "adplayer",
    "ondrop",
    "lastResizeTime",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    ".craft-rate",
    "have\x20",
    "Hornet_5",
    "discord_data",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    "#999",
    "style=\x22color:",
    "Health",
    "stickbug",
    "wig",
    "Head",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    "Added\x202\x20US\x20lobbies.",
    "updateT",
    "z8kgrX3dSq",
    "<div>",
    "<div\x20class=\x22btn\x22>\x0a\x09\x09\x09\x09<span\x20stroke=\x22",
    "fire\x20ant",
    "translate",
    "makeFire",
    "iChat",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    "Chromosome",
    "*Turtle\x20health\x20500\x20→\x20600",
    "#82b11e",
    "centipedeHead",
    "petalYinYang",
    "hideTimer",
    "moveFactor",
    "></di",
    "Spider_5",
    "lightning",
    "24th\x20January\x202024",
    "petalStinger",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    ".grid\x20.title",
    "totalPetals",
    "#ebda8d",
    "Added\x20Lottery.",
    "imageSmoothingEnabled",
    "Heavier\x20than\x20your\x20mom.",
    "*Super:\x205-15",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "Swastika",
    "className",
    ".fixed-name-cb",
    ".inventory-rarities",
    "#5ab6ab",
    "petalBanana",
    ".absorb-btn\x20.tooltip\x20span",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "#4040fc",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    "https://www.youtube.com/@IAmLavaWater",
    "petSizeChangeFactor",
    "petalExpander",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    "1Jge",
    ".discord-avatar",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "Shrinker",
    "code",
    "<div><span\x20stroke=\x22",
    "flors",
    "Username\x20is\x20already\x20taken.",
    "isSleeping",
    "sizeIncrease",
    "8th\x20July\x202023",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "angle",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "runSpeed",
    "tooltipDown",
    ".absorb-rarity-btns",
    "#ffd941",
    "stringify",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "tumbleweed",
    "roundRect",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "worldH",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    "4oL8",
    "#5849f5",
    "getFloat32",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "New\x20mob:\x20Statue.",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    ";position:absolute;top:",
    "horne",
    "WP5YoSoxvq",
    "29th\x20January\x202024",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "seed",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    "Guardian",
    "%zY4",
    "petalRock",
    "WP/dQbddHH0",
    "Unknown\x20message\x20id:\x20",
    "weedSeed",
    "arc",
    "rectAscend",
    "<div\x20style=\x22color:\x20",
    "Lightning\x20damage:\x2012\x20→\x208",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    "\x20&\x20",
    "includes",
    ".ui-scale\x20select",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "petalArrow",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "rgba(0,0,0,0.2",
    ".player-list\x20.dialog-content",
    ".inventory",
    "#4e3f40",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    ".timer",
    "#97782b",
    "KeyW",
    "Hyper",
    "wss://eu2.hornex.pro",
    "*Pincer\x20damage:\x205\x20→\x206",
    "getHurtColor",
    "Missile\x20Damage",
    ".builds",
    "*Bone\x20armor:\x205\x20→\x206",
    "petalShrinker",
    "strokeText",
    "length",
    "parse",
    "i\x20need\x20999\x20billion\x20subs",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "/dlSprite",
    "rotate(",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    "Added\x20Global\x20Leaderboard.",
    "?v=",
    "craftResult",
    "mobId",
    "#5b4d3c",
    "Avacado",
    "workerAnt",
    "labelPrefix",
    "air",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    "toggle",
    "New\x20mob:\x20M28.",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "petalsLeft",
    "\x20•\x20",
    "Sandbox",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "pickedEl",
    "#bb1a34",
    "\x20ago",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "image/png",
    "iJoin",
    ".show-population-cb",
    "thirdEye",
    "New\x20mob:\x20Mushroom.",
    "Error\x20refreshing\x20ad.",
    "Has\x20fungal\x20infection\x20gg",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    ".player-list",
    "2004360cpJRKO",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "<div\x20class=\x22btn\x20tier-",
    "petalWeb",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    "sin",
    "onmouseup",
    "Buffed\x20Lightsaber:",
    "https://discord.gg/zZsUUg8rbu",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "Ruined",
    "rewards",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "addEventListener",
    "honeyDmgF",
    "getElementById",
    "15th\x20July\x202023",
    "KICKED!",
    "Bone",
    "petalDrop",
    "mouse0",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "\x20ctxs\x20(",
    "*Cotton\x20health:\x209\x20→\x2010",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "1rrAouN",
    "Ghost_6",
    "#3f1803",
    "opacity",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "Pincer",
    "Soldier\x20Ant_1",
    "petalSkull",
    "*Cotton\x20health:\x207\x20→\x208",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    "cuYF",
    "uiAngle",
    "Orbit\x20Twirl",
    "builds",
    "crafted\x20nothing\x20from",
    "W5T8c2BdUs/cJHBcR8o4uG",
    "posAngle",
    "Wave\x20Starting...",
    ".show-scoreboard-cb",
    "Changes\x20to\x20anti-lag\x20system:",
    "Re-added\x20Waves.",
    "querySelectorAll",
    "antennae",
    "hide",
    "Much\x20heavier\x20than\x20your\x20mom.",
    "petalCoffee",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    "iSwapPetalRow",
    "lineTo",
    "*Rock\x20health:\x2050\x20→\x2060",
    "*Snail\x20Health:\x20180\x20→\x20120",
    "New\x20petal:\x20Sponge",
    "\x20all\x20",
    "legD",
    "petalLight",
    "#853636",
    "spinSpeed",
    ".lottery-winner",
    "Decreases",
    "left",
    "consumeProjHealthF",
    "d\x20abs",
    "Snail",
    "Legendary",
    "#cf7030",
    "measureText",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "\x20players\x20•\x20",
    "WRGBrCo9W6y",
    "#e05748",
    "petal",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    "bar",
    "lottery",
    "regenF",
    "style",
    "13th\x20February\x202024",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "and\x20a",
    "isPlayer",
    "playerList",
    ".video",
    "oninput",
    "http://localhost:8001/discord",
    "1px",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    "VLa2",
    "Spawn\x20zone\x20changes:",
    "Stinger",
    "petalStick",
    "children",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    ".minimap-dot",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "saved_builds",
    "Iris",
    "KeyU",
    "Wave\x20",
    "setTargetEl",
    "dmca\x20it\x20m28!",
    "#882200",
    "rando",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    "*Super:\x20150+",
    "string",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "petalDrop_",
    "Server\x20side\x20performance\x20improvements.",
    "maxTimeAlive",
    "%</option>",
    "4084viEwdt",
    ".death-info",
    "petalIris",
    "reload",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    "Added\x20Waveroom:",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    "*Ultra:\x20120",
    ".inventory-petals",
    "Mob\x20",
    "arial",
    "origin",
    "\x22></div>\x0a\x09\x09",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    "desc",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "toLowerCase",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "rgb(43,\x20255,\x20163)",
    "inventory",
    "closePath",
    "des",
    "hsl(60,60%,",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    ".zone-name",
    "hyperPlayers",
    "level",
    "*Snail\x20damage:\x2010\x20→\x2015",
    "Reduced\x20mobile\x20UI\x20scale.",
    "undefined",
    "onmessage",
    "armorF",
    "*Rock\x20health:\x2045\x20→\x2050",
    "\x20at\x20least!",
    "spawnOnDie",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    ".gamble-prediction",
    "Increased\x20Wave\x20mob\x20count.",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    ".hyper-buy",
    "<div\x20class=\x22petal-icon\x22\x20",
    "Extra\x20Vision",
    "Added\x20Shiny\x20mobs:",
    "1st\x20April\x202024",
    "*Ultra:\x201-5",
    "petalRice",
    "titleColor",
    "Can\x27t\x20perform\x20that\x20action.",
    "#e94034",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "<div\x20class=\x22petal\x20tier-",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "ability",
    "hideUserCount",
    "Comes\x20to\x20avenge\x20mobs.",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    "keyup",
    "nAngle",
    "Mushroom",
    "charAt",
    "New\x20mob:\x20Pedox",
    "class=\x22chat-cap\x22",
    "slice",
    "#db4437",
    ".rewards",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    "tail",
    "points",
    "web",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "Removed\x20Centipedes\x20from\x20waves.",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    "chain",
    "rgba(0,0,0,",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "mob_",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "erCas",
    "shadowBlur",
    "petDamageFactor",
    "rect",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "#328379",
    "Mob\x20Size\x20Change",
    "Range",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    "value",
    "\x20rad/s",
    "healthIncrease",
    "101636gyvtEF",
    "*Bone\x20armor:\x207\x20→\x208",
    "poopPath",
    "click",
    "Spider_3",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    "petalPea",
    "\x20petals",
    "poisonDamageF",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    "centipedeHeadDesert",
    "Even\x20more\x20wave\x20changes:",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "forEach",
    "*Rock\x20health:\x2060\x20→\x20120",
    "*Powder\x20health:\x2010\x20→\x2015",
    "Loading\x20video\x20ad...",
    "hasSwastika",
    "connectionIdle",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "Breed\x20Strength",
    ".joystick-knob",
    "KeyX",
    "#d3d14f",
    "Skull",
    ".play-btn",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    ".petal-rows",
    "indexOf",
    "Hyper\x20Players",
    "petalTurtle",
    "contains",
    ".petal",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    "petalBasic",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "toUpperCase",
    "petalSpiderEgg",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    ".absorb-petals",
    "*Reduced\x20HP\x20depletion.",
    "Pacman",
    "damageF",
    "2nd\x20August\x202023",
    "OPEN",
    ".tv-prev",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    "enable_kb_movement",
    "open",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    "loginFailed",
    "isIcon",
    "isPet",
    "Q2mA",
    "2nd\x20March\x202024",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    ".collected",
    "nt.\x20H",
    "rgba(0,\x200,\x200,\x200.2)",
    "#363685",
    "Some\x20anti\x20lag\x20measures:",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    "<option\x20value=\x22",
    ".mob-gallery\x20.dialog-content",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "advanced\x20to\x20number\x20",
    "US\x20#1",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "wss://eu1.hornex.pro",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "startsWith",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "Sandstorm_5",
    "Spider\x20Legs",
    "\x22></div>\x0a\x09\x09\x09",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "startPreRoll",
    "24th\x20July\x202023",
    "scrollTop",
    "d.\x20Pr",
    "error",
    "classList",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    "US\x20#2",
    "join",
    "petalHeavy",
    "Video\x20AD\x20success!",
    "show_damage",
    "Dahlia",
    "W6rnWPrGWPfdbxmAWOHa",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "shiftKey",
    "connect",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "\x22\x20stroke=\x22(",
    ".time-alive",
    "No\x20username\x20provided.",
    "/s\x20if\x20H<50%",
    "as_ffa2",
    "Poo",
    "wss://as2.hornex.pro",
    "KePiKgamer",
    ".hide-chat-cb",
    "numAccounts",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "oProg",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "Armor",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "Getting\x20",
    "bqpdUNe",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    "#75dd34",
    "Added\x20Shop.",
    ".lottery-rarities",
    "WOpcHSkuCtriW7/dJG",
    "<label\x20class=\x22pages\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Current\x20Page:\x22></span>\x0a\x09\x09\x09<select\x20tabindex=\x22-1\x22></select>\x0a\x09\x09</label>",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "cos",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "sq8Ig3e",
    ".max-score",
    "strokeRect",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    ".hud",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "user",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "getTitleEl",
    "#D2D1CD",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "url(",
    "rgb(255,\x2043,\x20117)",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    "projHealthF",
    "#dc704b",
    "</option>",
    "Rock\x20Egg",
    "11th\x20July\x202023",
    "Craft\x20rate\x20change:",
    "dataTransfer",
    "5th\x20September\x202023",
    "uwu",
    "#f009e5",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    "Retardation\x20Duration",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "oPlayerX",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "onMove",
    "3L$0",
    "append",
    ".build-save-btn",
    "pet",
    "spider",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "User\x20not\x20found!",
    ".inventory-btn",
    "New\x20mob:\x20Spider\x20Cave.",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "#a2eb62",
    ".active",
    ".game-stats\x20.dialog-content",
    "hpRegenPerSecF",
    "\x0a13th\x20May\x202024\x0aFixed\x20a\x20bug\x20that\x20didn\x27t\x20let\x20flowers\x20enter\x20portals.\x0aBalances:\x0a*Sword\x20damage:\x2017\x20→\x2021\x0a*Yin\x20yang\x20damage:\x2010\x20→\x2020\x0a*Yin\x20yang\x20reload:\x202s\x20→\x201.5s\x0a",
    ".clown",
    "Ears",
    ".grid-cb",
    "heart",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    ".level-progress",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    "Failed\x20to\x20load\x20game\x20stats!",
    "*Peas\x20health:\x2020\x20→\x2025",
    "petalBone",
    "OFF",
    "#8ac255",
    "30th\x20June\x202023",
    "extraRangeTiers",
    "isBae",
    "dev",
    "timeJoined",
    "sortGroupItems",
    "Minor\x20physics\x20change.",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "isConsumable",
    "#493911",
    "Regenerates\x20health\x20when\x20consumed.",
    "drawSnailShell",
    "7th\x20February\x202024",
    "9434304dAOEGy",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    ".debug-info",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    "petalBubble",
    "Sprite",
    "been\x20",
    "qmklWO4",
    "#bb3bc2",
    "1167390UrVkfV",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "13th\x20July\x202023",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "lightningDmg",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "1398mHDbKS",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "webSizeTiers",
    "small",
    "#ffd363",
    "hpRegen75PerSecF",
    "c)H[",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "#000000",
    "Connecting\x20to\x20",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    "starfish",
    "oncontextmenu",
    "Waveroom",
    "*Cotton\x20health:\x2010\x20→\x2012",
    "eu_ffa1",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    "setUint16",
    "5th\x20July\x202023",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "\x20online)",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "Dragon_1",
    "𐐿𐐘𐐫𐑀𐐃",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "Rock_3",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    "#ffffff",
    "values",
    "Added\x201\x20more\x20EU\x20lobby.",
    "*Fire\x20health:\x2080\x20→\x20120",
    "waveEnding",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "onmousedown",
    "KeyL",
    "#7d5098",
    "#bb771e",
    "#2e933c",
    "loading",
    "Antidote",
    "#ff94c9",
    "Damage\x20Reflection",
    "Account\x20import/export\x20UI\x20redesigned.",
    ".chat",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "isStatic",
    "petalSnail",
    ".terms-btn",
    ".max-wave",
    "writeText",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    "Heavy",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    ".find-user-input",
    "W7dcP8k2W7ZcLxtcHv0",
    "Soldier\x20Ant_5",
    "Beehive",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "Passively\x20regenerates\x20your\x20health.",
    "hornet",
    "#503402",
    "ANKUAsHKW5LZmq",
    "reverse",
    "*Reduced\x20drops\x20by\x2050%.",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "#764b90",
    "Extra\x20Range",
    "Ghost_4",
    "It\x20burns.",
    "show_debug_info",
    "New\x20mob:\x20Turtle",
    ".tooltips",
    "deg)\x20scale(",
    "Rare",
    "M28",
    "ENTERING!!",
    "22nd\x20June\x202023",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    "healthF",
    "#9fab2d",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "username",
    "New\x20mob:\x20Snail.",
    "5th\x20January\x202024",
    "querySelector",
    "*Cement\x20health:\x2080\x20→\x20100",
    "waveStarting",
    "flowerPoisonF",
    "unsuccessful",
    "acker",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "parentNode",
    "*Super:\x20180",
    "isStatue",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    "spin",
    "DMCA-ed",
    "#444444",
    "dSk+d0afnmo5WODJW6zQxW",
    ".reload-btn",
    "subscribe\x20for\x20999\x20super\x20petals",
    "shieldHpLosePerSec",
    "Rice",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    ".credits",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    ".keyboard-cb",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "\x20Blue",
    "719574lHbJUW",
    "shlong",
    "#ccad00",
    "#fc5c5c",
    "rgba(0,0,0,0.4)",
    "hideAfterInactivity",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    "deleted",
    ".bar",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "reduce",
    "eu_ffa",
    "rgb(219\x20130\x2041)",
    "*Yoba\x20Egg\x20buff.",
    "isDead",
    "#400",
    "*Fire\x20health:\x2070\x20→\x2080",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "Tumbleweed",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    "us_ffa1",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "lineJoin",
    "hasHalo",
    "displayData",
    "prog",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    "isSwastika",
    "[2tB",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    "11th\x20August\x202023",
    "#ff3333",
    "warn",
    "#ab7544",
    "Rock",
    "#c8a826",
    "angryT",
    "Soak\x20Duration",
    "#7dad0c",
    ".leave-btn",
    "Air",
    "curePoison",
    "petalFire",
    "(?:^|;\x5cs*)",
    "#69371d",
    "#a33b15",
    "application/json",
    "web_",
    "WP4hW755jCokWRdcKchdT3ui",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "Failed\x20to\x20get\x20userCount!",
    "Desert",
    "globalAlpha",
    "Ant\x20Fire",
    "queenAntFire",
    "misReflectDmgFactor",
    "#4d5e56",
    "#111",
    "player_id",
    "bolder\x2025px\x20",
    "#f7904b",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    ".menu",
    "offsetHeight",
    "#854608",
    "transformOrigin",
    "passive",
    "shadowColor",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "WP4dWPa7qCklWPtcLq",
    ".continue-btn",
    "reqFailed",
    "bottom",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "encode",
    "Client-side\x20performance\x20improvements.",
    "Buffed\x20Gem.",
    "(total\x20",
    "Buffs:",
    "New\x20setting:\x20UI\x20Scale.",
    "#ada25b",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    "Removed\x20EU\x20#3.",
    "breedRange",
    "layin",
    "\x22></div>\x20<div\x20style=\x22color:",
    "dandelion",
    "Hornet\x20Egg",
    "26th\x20June\x202023",
    "devicePixelRatio",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "8th\x20August\x202023",
    "UNOFF",
    "Flower\x20Health",
    "*Gas\x20poison:\x2030\x20→\x2040",
    ".mob-gallery",
    "petalPoo",
    "metaData",
    "Rock_2",
    "dontExpand",
    "onresize",
    ".absorb\x20.dialog-header\x20span",
    "content",
    "DMCA",
    "=([^;]*)",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "nice\x20stolen\x20florr\x20assets",
    ".level",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    "petalWave",
    "createPattern",
    "Fleepoint",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "iCheckKey",
    "show_population",
    "Queen\x20Ant",
    "Sussy\x20Discord\x20uwu",
    "petalLightning",
    "marginLeft",
    "x.pro",
    "5th\x20August\x202023",
    "cantPerformAction",
    "consumeProjDamage",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    "choked",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "Spider_1",
    "guardian",
    "Preroll\x20state:\x20",
    "petalYobaEgg",
    "6th\x20October\x202023",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "Gives\x20you\x20a\x20shield.",
    "#cecfa3",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "#aaaaaa",
    "crab",
    "Fossil",
    "Game\x20released\x20to\x20public!",
    "innerWidth",
    "iDepositPetal",
    "Nigersaurus",
    "activeElement",
    "XCN6",
    "discord\x20err:",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "rgb(255,\x20230,\x2093)",
    "files",
    "width",
    "&quot;",
    "year",
    "fonts",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x20no-hide\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    "Scorpion",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "lightningBouncesTiers",
    "#754a8f",
    "Nerfed\x20Ant\x20Holes:",
    "iAngle",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "Leave",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "clientWidth",
    "#962921",
    "Hornet_2",
    "Web\x20Radius",
    "Wig",
    "descColor",
    "New\x20rarity:\x20Hyper.",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    "),0)",
    "petalHoney",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    ".circle",
    "lightblue",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    "#a07f53",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    ".ads",
    "nickname",
    "babyAnt",
    "#f22",
    "childIndex",
    "#fbb257",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "hpRegen",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "filter",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    "#5ec13a",
    "fromCharCode",
    "display",
    "14dafFDX",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    "hide-all",
    "shieldRegenPerSecF",
    "9th\x20August\x202023",
    "iWithdrawPetal",
    "#724c2a",
    "function",
    "ll\x20yo",
    "reason:\x20",
    "cmk+c0aoqSoLWQrQW6Tx",
    "keyInvalid",
    "Breed\x20Range",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "2772301LQYLdH",
    "buffer",
    "tail_outline",
    "WRbjb8oX",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    "released",
    "curePoisonF",
    "*Halo\x20now\x20stacks.",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    ".killer",
    "https://auth.hornex.pro/discord",
    "mobile",
    "nick",
    "rgb(237\x2061\x20234)",
    "1998256OxsvrH",
    "fillText",
    "marginBottom",
    "Lightning",
    "onchange",
    "canRemove",
    "isCentiBody",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    "download",
    "breedTimer",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "#d6b936",
    "affectMobHealDur",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    "Ghost",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "eu_ffa2",
    "Added\x20Leave\x20Game\x20button.",
    "transition",
    "nerd",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    ".scores",
    "#8ecc51",
    "#fcdd86",
    "ontouchstart",
    "%nick%",
    "\x20in\x20view\x20/\x20",
    "Username\x20too\x20short!",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    "g\x20on\x20",
    "#a58368",
    "Created\x20changelog.",
    "Spider\x20Cave",
    "destroyed",
    "rnex.",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    "turtle",
    "#d0bb55",
    "Fire",
    "sign",
    "gridColumn",
    "\x22\x20style=\x22color:",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "cmk/auqmq8o8WOngW79c",
    "beginPath",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "projDamageF",
    "*Yoba\x20health:\x20500\x20→\x20350",
    "soakTime",
    "aip_complete",
    "deg)",
    "hsla(0,0%,100%,0.4)",
    "#ebeb34",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    "sprite",
    "px\x20",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "cactus",
    "mobPetaler",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "\x20pxls)\x20/\x20",
    "#a44343",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    "krBw",
    "%\x20!important",
    "*Recuded\x20mob\x20count.",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "#eeeeee",
    "targetPlayer",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    "onStart",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "2nd\x20July\x202023",
    "petalPincer",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    "passiveBoost",
    "isLightning",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "createElement",
    "hide-zone-mobs",
    "*Reduced\x20Shield\x20regen\x20time.",
    "switched",
    "fireDamage",
    "getTransform",
    "addGroupNumbers",
    "Unusual",
    ".settings",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "Wave\x20changes:",
    "User\x20not\x20found.",
    "hsl(60,60%,60%)",
    "turtleF",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    "KeyA",
    "Beetle_4",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    "petHeal",
    "evenodd",
    "consumeTime",
    "extraSpeed",
    "mouse",
    "started!",
    "*Snail\x20health:\x2040\x20→\x2045",
    "#af6656",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "running...",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2048\x2048\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x20\x20<title>data-source-solid</title>\x0a\x20\x20<g\x20id=\x22Layer_2\x22\x20data-name=\x22Layer\x202\x22>\x0a\x20\x20\x20\x20<g\x20id=\x22invisible_box\x22\x20data-name=\x22invisible\x20box\x22>\x0a\x20\x20\x20\x20\x20\x20<rect\x20width=\x2248\x22\x20height=\x2248\x22\x20fill=\x22none\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20\x20\x20<g\x20id=\x22icons_Q2\x22\x20data-name=\x22icons\x20Q2\x22>\x0a\x20\x20\x20\x20\x20\x20<path\x20d=\x22M46,9c0-6.8-19.8-7-22-7S2,2.2,2,9v7c0,.3,1.1,1.8,5.2,3.4h.3a40.3,40.3,0,0,0,8.6,2A65.6,65.6,0,0,0,24,22a65.6,65.6,0,0,0,7.9-.5,40.3,40.3,0,0,0,8.6-2h.3C44.9,17.8,46,16.3,46,16V9.3h0ZM2,31.3V39c0,6.8,19.8,7,22,7s22-.2,22-7V31.3C41.4,34.1,33.3,36,24,36S6.6,34.1,2,31.3Zm43.7-9.8a22.5,22.5,0,0,1-4.9,2.1A54.8,54.8,0,0,1,24,26,54.8,54.8,0,0,1,7.2,23.6a22.5,22.5,0,0,1-4.9-2.1L2,21.3V26c0,.3,1.2,1.9,5.5,3.5A50.2,50.2,0,0,0,24,32a50.2,50.2,0,0,0,16.5-2.5C44.8,27.9,46,26.3,46,26V21.3Z\x22/>\x0a\x20\x20\x20\x20</g>\x0a\x20\x20</g>\x0a</svg>",
    "#e6a44d",
    "despawnTime",
    ".watch-ad",
    "shieldRegenPerSec",
    "#b0c0ff",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "absorb",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    "draw",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "petalEgg",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "Missile",
    "lieOnGroundTime",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    "keyClaimed",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    "WQ7dTmk3W6FcIG",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "Sandstorm",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "19th\x20June\x202023",
    "ArrowDown",
    "setTargetByEvent",
    "Dandelion",
    ".build-load-btn",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    "Orbit\x20Shlongation",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "usernameTaken",
    "cookie",
    "gameStats",
    "bee",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    "projHealth",
    "25th\x20January\x202024",
    ".tooltip",
    "iReqUserProfile",
    "Missile\x20Health",
    ".anti-spam-cb",
    "#368316",
    "/profile",
    "show_helper",
    ".pro",
    "bqpdSW",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "iCraft",
    ".claim-btn",
    "loggedIn",
    "Petal\x20",
    "dontResolveCol",
    "*Arrow\x20damage:\x201\x20→\x203",
    "Heart",
    "next",
    "arraybuffer",
    "\x22></span>\x0a\x09</div>",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    "\x20petals\x22></div>",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "Sandstorm_4",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    "Server-side\x20optimizations.",
    "portal",
    "removeT",
    "New\x20petal:\x20Wig.",
    "hpAlpha",
    "padStart",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "zvNu",
    "isFakeChat",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    ".lb-btn",
    "Fixed\x20players\x20pushing\x20eachother.",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "*Peas\x20damage:\x2015\x20→\x2020",
    "onload",
    "gameStats.json",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    "***",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "Fixed\x20duplicate\x20drops.",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    "Added\x20banner\x20ads.",
    "http",
    "#ce76db",
    "#8d9acc",
    "<div\x20",
    "Failed\x20to\x20find\x20region.",
    "accountData",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    "affectMobHeal",
    "fontSize",
    "*Snail\x20health:\x2045\x20→\x2050",
    "Username\x20claimed!",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    "pro",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    "#c9b46e",
    "WOziW7b9bq",
    "offsetWidth",
    "mobSizeChange",
    "*Rose\x20heal:\x2013\x20→\x2011",
    "Sandstorm_1",
    "isLightsaber",
    "bg-rainbow",
    "hpRegen75PerSec",
    "Hornet",
    "style=\x22background-position:\x20",
    "12th\x20November\x202023",
    "iAbsorb",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    "Favourite\x20object\x20of\x20a\x20woman.",
    "Sand",
    "KeyS",
    "hide-chat",
    "redHealth",
    "add",
    "nig",
    "7th\x20October\x202023",
    "Dragon_3",
    "makeAntenna",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "#f54ce7",
    "*Rice\x20damage:\x204\x20→\x205",
    "miter",
    "#709e45",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "Third\x20Eye",
    "Nerfed\x20Spider\x20Yoba.",
    "#888",
    "petalFaster",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    "petalTaco",
    "cacheRendered",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    "KeyG",
    "Ghost_5",
    "boostStrength",
    "LEAVE\x20ZONE!!",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "\x20was\x20",
    "Dragon_2",
    "Lobby\x20Closing...",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    "Added\x20level\x20up\x20reward\x20table.",
    "ame",
    "trim",
    ".changelog\x20.dialog-content",
    "defineProperty",
    "Web",
    "*Light\x20damage:\x2013\x20→\x2012",
    "uiCountGap",
    "26th\x20August\x202023",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "\x20XP",
    "https://www.youtube.com/@NeowmHornex",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "pedoxMain",
    "6th\x20November\x202023",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    ".game-stats-btn",
    "rgba(0,0,0,0.15)",
    "isPassiveAggressive",
    "onmousemove",
    ".angry-btn",
    "Wing",
    ".game-stats",
    "isShiny",
    "10QIdaPR",
    ".absorb",
    "low_quality",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    "attachPetal",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "#ffe200",
    "<div\x20class=\x22petal-container\x22></div>",
    "ffa\x20sandbox",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    "craft-disable",
    "drawTurtleShell",
    "Honey\x20Range",
    "Cement",
    "spawn_zone",
    ".petals",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "#b52d00",
    "scorpion",
    "#efc99b",
    "*Removed\x20Ultra\x20wave.",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    "Failed\x20to\x20get\x20game\x20stats.\x20Retrying\x20in\x205s...",
    "hoq5",
    "ount\x20",
    "Mythic",
    "splice",
    "KeyR",
    "#38c125",
    ".copy-btn",
    "Body",
    "log",
    "://ho",
    "16th\x20September\x202023",
    "timePlayed",
    "substr",
    "\x22></span>",
    "156sTWlkN",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    "json",
    "Kicked!\x20(reason:\x20",
    "gblcVXldOG",
    "hasAntenna",
    "4th\x20August\x202023",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    "active",
    "3rd\x20February\x202024",
    "charCodeAt",
    "#a82a00",
    "Heal\x20Affect\x20Duration",
    "from",
    "spawn",
    "reflect",
    "Dragon\x20Nest",
    "hornex.pro",
    "translate(-50%,\x20",
    ".close-btn",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    "[censored]",
    "*Epic:\x2075\x20→\x2065",
    "setPos",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    ".stats\x20.dialog-header\x20span",
    "Rose",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    "EU\x20#2",
    "exp",
    "18th\x20July\x202023",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "drops",
    "warne",
    "nShield",
    "286YDNmcL",
    ".chat-input",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "isTanky",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    "8URl",
    "petalDice",
    "projType",
    "3220DFvaar",
    "A\x20default\x20petal.",
    "petals",
    "\x20-\x20",
    "Salt",
    ".ultra-buy",
    "WRS8bSkQW4RcSLDU",
    "setCount",
    "Common",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "*Unsual:\x2025\x20→\x2010",
    "update",
    "Spider\x20Yoba",
    "ages.",
    "dragon",
    "checked",
    "Missile\x20Poison",
    "host",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    "abs",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "settings",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "marginTop",
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "*Hyper:\x20240",
    "*Gas\x20health:\x20140\x20→\x20250",
    "#6265eb",
    "userCount",
    "#cfcfcf",
    "Passively\x20regenerates\x20shield.",
    "name",
    "span\x202",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    "Flower\x20Damage",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    "Bee",
    "\x20accounts",
    "Hnphe",
    ";\x20-o-background-position:",
    "Fire\x20Ant",
    "killsNeeded",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "powderTime",
    ".dc-group",
    "stats",
    "#b9baba",
    "#c1a37d",
    "textEl",
    "shieldReload",
    "sizeIncreaseF",
    "Crab\x20redesign.",
    "getUint8",
    "*Powder\x20damage:\x2015\x20→\x2020",
    "consumeProjDamageF",
    "#ff7380",
    "Ladybug",
    ".tabs",
    "changeLobby",
    "Slowness\x20Duration",
    "13th\x20August\x202023",
    "createObjectURL",
    "22nd\x20January\x202024",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    "Poop\x20Health",
    "#38ecd9",
    "type",
    "soldierAntFire",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "copy",
    "repeat",
    "furry",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    "Dark\x20Ladybug",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    "goofy\x20ahh\x20insect\x20robbery",
    "Soldier\x20Ant_4",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    "side",
    "Ghost_7",
    "textAlign",
    "19th\x20July\x202023",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    "Shield\x20Reuse\x20Cooldown",
    "<div\x20class=\x22chat-item\x22></div>",
    "url(https://i.ytimg.com/vi/",
    "random",
    ".petal.empty",
    "#634418",
    "Soldier\x20Ant_6",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "*Snail\x20damage:\x2020\x20→\x2025",
    "#c69a2c",
    "W77cISkNWONdQa",
    ".shop-info",
    ".discord-user",
    "Increases\x20flower\x27s\x20health\x20power.",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "close",
    "Dragon",
    ".spawn-zones",
    "\x20clie",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "Jellyfish",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "makeHole",
    "Heal",
    "petalLightsaber",
    "round",
    "1st\x20July\x202023",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    "\x20Pym\x20Particle.",
    "Fixed\x20another\x20craft\x20exploit.",
    "Orbit\x20Dance",
    "PedoX",
    "#7777ff",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    "quadraticCurveTo",
    "drawDragon",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    ".absorb\x20.dialog-content",
    "byteLength",
    "cloneNode",
    "Banana",
    "<div\x20class=\x22chat-text\x22>",
    "petalWing",
    "INPUT",
    "\x22></div><div\x20class=\x22log-content\x22>",
    ".rewards\x20.dialog-content",
    "\x20You\x20",
    "New\x20settings:\x20Low\x20quality.",
    "0\x200",
    "26th\x20July\x202023",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    "moveTo",
    "#393cb3",
    "*Bone\x20armor:\x204\x20→\x205",
    "createImageData",
    "Petals",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    "dontUiRotate",
    "wss://hornex-",
    "accou",
    "split",
    "onopen",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "spawnOnHurt",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "avatar",
    "j[zf",
    "rgba(0,0,0,0.3)",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "\x20!important;}",
    "getBoundingClientRect",
    "assualted",
    "gcldSq",
    "toLow",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    "13th\x20September\x202023",
    "ned.\x22",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "#1ea761",
    "Shield",
    "Fire\x20Ant\x20Hole",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "2-digit",
    "nProg",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "#7af54c",
    "local",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    "val",
    "d8k3BqDKF8o0WPu",
    "hit.p",
    "4\x20yummy\x20poisonous\x20balls.",
    "isClown",
    "hasAbsorbers",
  ];
  a = function () {
    return Ce;
  };
  return a();
}
(function (c, d) {
  const ur = b,
    e = c();
  while (!![]) {
    try {
      const f =
        parseInt(ur(0x230)) / 0x1 +
        (-parseInt(ur(0x71f)) / 0x2) * (parseInt(ur(0x861)) / 0x3) +
        (parseInt(ur(0xb18)) / 0x4) * (parseInt(ur(0xda7)) / 0x5) +
        (-parseInt(ur(0x6a6)) / 0x6) * (-parseInt(ur(0xd8b)) / 0x7) +
        parseInt(ur(0x41e)) / 0x8 +
        parseInt(ur(0x850)) / 0x9 +
        (parseInt(ur(0xc1c)) / 0xa) * (-parseInt(ur(0xb3c)) / 0xb);
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0x8b18e),
  (() => {
    const us = b;
    var cG = 0x2710,
      cH = 0x1e - 0x1,
      cI = { ...cV(us(0x5fb)), ...cV(us(0x1b1)) },
      cJ = 0x93b,
      cK = 0x10,
      cL = 0x3c,
      cM = 0x10,
      cN = 0x3,
      cO = /^[a-zA-Z0-9_]+$/,
      cP = /[^a-zA-Z0-9_]/g,
      cQ = cV(us(0x5ec)),
      cR = cV(us(0x7f8)),
      cS = cV(us(0x50c)),
      cT = cV(us(0xbc1)),
      cU = cV(us(0xaf7));
    function cV(r3) {
      const ut = us,
        r4 = r3[ut(0xbde)]("\x20"),
        r5 = {};
      for (let r6 = 0x0; r6 < r4[ut(0x680)]; r6++) {
        r5[r4[r6]] = r6;
      }
      return r5;
    }
    var cW = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cX = {};
    (cX[us(0x2ee)] = 0x0), (cX[us(0x110)] = 0x1), (cX[us(0xc4d)] = 0x2);
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
      return 0x14 * Math[uu(0x35d)](r3 * 1.05 ** (r3 - 0x1));
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
        r4++, (r5 += Math[uv(0xd23)](0x1e, r5));
      }
      return r4;
    }
    function d6(r3) {
      const uw = us;
      return Math[uw(0x45f)](0xf3, Math[uw(0xd23)](r3, 0xc7) / 0xc8);
    }
    function d7() {
      return d8(0x100);
    }
    function d8(r3) {
      const r4 = Array(r3);
      while (r3--) r4[r3] = r3;
      return r4;
    }
    var d9 = cV(us(0x6ac)),
      da = Object[us(0x24a)](d9),
      db = da[us(0x680)] - 0x1,
      dc = db;
    function dd(r3) {
      const ux = us,
        r4 = [];
      for (let r5 = 0x1; r5 <= dc; r5++) {
        r4[ux(0x46a)](r3(r5));
      }
      return r4;
    }
    const de = {};
    (de[us(0x69f)] = 0x0),
      (de[us(0x6db)] = 0x1),
      (de[us(0x3ee)] = 0x2),
      (de[us(0x838)] = 0x3),
      (de[us(0x27f)] = 0x4),
      (de[us(0x388)] = 0x5),
      (de[us(0xcf8)] = 0x6),
      (de[us(0x68f)] = 0x7),
      (de[us(0x600)] = 0x8);
    var df = de;
    function dg(r3, r4) {
      const uy = us;
      return Math[uy(0x45f)](0x3, r3) * r4;
    }
    const dh = {};
    (dh[us(0xb8a)] = cS[us(0x7a4)]),
      (dh[us(0x72e)] = us(0x3b8)),
      (dh[us(0xc80)] = 0xa),
      (dh[us(0x3ac)] = 0x0),
      (dh[us(0x8ba)] = 0x1),
      (dh[us(0x7ad)] = 0x1),
      (dh[us(0x36d)] = 0x3e8),
      (dh[us(0x525)] = 0x0),
      (dh[us(0xc16)] = ![]),
      (dh[us(0x789)] = 0x1),
      (dh[us(0x3ea)] = ![]),
      (dh[us(0x6fb)] = 0x0),
      (dh[us(0x6d0)] = 0x0),
      (dh[us(0xa1c)] = ![]),
      (dh[us(0x275)] = 0x0),
      (dh[us(0xd3d)] = 0x0),
      (dh[us(0xb79)] = 0x0),
      (dh[us(0x120)] = 0x0),
      (dh[us(0x107)] = 0x0),
      (dh[us(0x39c)] = 0x0),
      (dh[us(0xd76)] = 0x1),
      (dh[us(0xadd)] = 0xc),
      (dh[us(0x13f)] = 0x0),
      (dh[us(0x185)] = ![]),
      (dh[us(0x757)] = void 0x0),
      (dh[us(0xceb)] = ![]),
      (dh[us(0xc38)] = 0x0),
      (dh[us(0x2ab)] = ![]),
      (dh[us(0xacd)] = 0x0),
      (dh[us(0x480)] = 0x0),
      (dh[us(0x530)] = ![]),
      (dh[us(0xcef)] = 0x0),
      (dh[us(0xb28)] = 0x0),
      (dh[us(0x6e9)] = 0x0),
      (dh[us(0x946)] = ![]),
      (dh[us(0xa4b)] = 0x0),
      (dh[us(0x2ef)] = ![]),
      (dh[us(0x8fc)] = ![]),
      (dh[us(0x17d)] = 0x0),
      (dh[us(0xaa7)] = 0x0),
      (dh[us(0xa35)] = 0x0),
      (dh[us(0x3bd)] = ![]),
      (dh[us(0x336)] = 0x1),
      (dh[us(0xc23)] = 0x0),
      (dh[us(0x562)] = 0x0),
      (dh[us(0x8c4)] = 0x0),
      (dh[us(0x4f9)] = 0x0),
      (dh[us(0x90a)] = 0x0),
      (dh[us(0x9c1)] = 0x0),
      (dh[us(0xa32)] = 0x0),
      (dh[us(0x21a)] = 0x0),
      (dh[us(0x833)] = 0x0),
      (dh[us(0x9ab)] = 0x0),
      (dh[us(0xa40)] = 0x0),
      (dh[us(0x866)] = 0x0),
      (dh[us(0x4d0)] = 0x0),
      (dh[us(0x9d9)] = 0x0),
      (dh[us(0xa9d)] = ![]),
      (dh[us(0x54c)] = 0x0),
      (dh[us(0x4f8)] = 0x0),
      (dh[us(0x740)] = 0x0);
    var di = dh;
    const dj = {};
    (dj[us(0xb65)] = us(0x2a9)),
      (dj[us(0x72e)] = us(0xb46)),
      (dj[us(0xb8a)] = cS[us(0x7a4)]),
      (dj[us(0xc80)] = 0x9),
      (dj[us(0x8ba)] = 0xa),
      (dj[us(0x7ad)] = 0xa),
      (dj[us(0x36d)] = 0x9c4);
    const dk = {};
    (dk[us(0xb65)] = us(0xa4a)),
      (dk[us(0x72e)] = us(0xb01)),
      (dk[us(0xb8a)] = cS[us(0xcdd)]),
      (dk[us(0xc80)] = 0xd / 1.1),
      (dk[us(0x8ba)] = 0x2),
      (dk[us(0x7ad)] = 0x37),
      (dk[us(0x36d)] = 0x9c4),
      (dk[us(0x525)] = 0x1f4),
      (dk[us(0x3ea)] = !![]),
      (dk[us(0x2b6)] = 0x28),
      (dk[us(0x6d0)] = Math["PI"] / 0x4);
    const dl = {};
    (dl[us(0xb65)] = us(0xb33)),
      (dl[us(0x72e)] = us(0x84d)),
      (dl[us(0xb8a)] = cS[us(0x2b3)]),
      (dl[us(0xc80)] = 0x8),
      (dl[us(0x8ba)] = 0x5),
      (dl[us(0x7ad)] = 0x5),
      (dl[us(0x36d)] = 0xdac),
      (dl[us(0x525)] = 0x3e8),
      (dl[us(0x6fb)] = 0xb),
      (dl[us(0x946)] = !![]);
    const dm = {};
    (dm[us(0xb65)] = us(0x710)),
      (dm[us(0x72e)] = us(0x46b)),
      (dm[us(0xb8a)] = cS[us(0x721)]),
      (dm[us(0xc80)] = 0x6),
      (dm[us(0x8ba)] = 0x5),
      (dm[us(0x7ad)] = 0x5),
      (dm[us(0x36d)] = 0xfa0),
      (dm[us(0xc16)] = !![]),
      (dm[us(0x789)] = 0x32);
    const dn = {};
    (dn[us(0xb65)] = us(0x903)),
      (dn[us(0x72e)] = us(0x61f)),
      (dn[us(0xb8a)] = cS[us(0x65f)]),
      (dn[us(0xc80)] = 0xb),
      (dn[us(0x8ba)] = 0xc8),
      (dn[us(0x7ad)] = 0x1e),
      (dn[us(0x36d)] = 0x1388);
    const dp = {};
    (dp[us(0xb65)] = us(0x709)),
      (dp[us(0x72e)] = us(0x405)),
      (dp[us(0xb8a)] = cS[us(0x618)]),
      (dp[us(0xc80)] = 0x8),
      (dp[us(0x8ba)] = 0x2),
      (dp[us(0x7ad)] = 0xa0),
      (dp[us(0x36d)] = 0x2710),
      (dp[us(0xadd)] = 0xb),
      (dp[us(0x13f)] = Math["PI"]),
      (dp[us(0x483)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dq = {};
    (dq[us(0xb65)] = us(0xac2)),
      (dq[us(0x72e)] = us(0x87e)),
      (dq[us(0x757)] = df[us(0x69f)]),
      (dq[us(0x39c)] = 0x1e),
      (dq[us(0x844)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dr = {};
    (dr[us(0xb65)] = us(0x51c)),
      (dr[us(0x72e)] = us(0x3fa)),
      (dr[us(0x757)] = df[us(0x6db)]);
    const ds = {};
    (ds[us(0xb65)] = us(0x9cf)),
      (ds[us(0x72e)] = us(0x744)),
      (ds[us(0xb8a)] = cS[us(0x958)]),
      (ds[us(0xc80)] = 0xb),
      (ds[us(0x36d)] = 0x9c4),
      (ds[us(0x8ba)] = 0x14),
      (ds[us(0x7ad)] = 0x8),
      (ds[us(0xa1c)] = !![]),
      (ds[us(0x275)] = 0x2),
      (ds[us(0x97f)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (ds[us(0xd3d)] = 0x14);
    const du = {};
    (du[us(0xb65)] = us(0x215)),
      (du[us(0x72e)] = us(0x9f8)),
      (du[us(0xb8a)] = cS[us(0xd96)]),
      (du[us(0xc80)] = 0xb),
      (du[us(0x8ba)] = 0x14),
      (du[us(0x7ad)] = 0x14),
      (du[us(0x36d)] = 0x5dc),
      (du[us(0x120)] = 0x64),
      (du[us(0x63d)] = 0x1);
    const dv = {};
    (dv[us(0xb65)] = us(0x591)),
      (dv[us(0x72e)] = us(0xa7a)),
      (dv[us(0xb8a)] = cS[us(0x6e7)]),
      (dv[us(0xc80)] = 0x7),
      (dv[us(0x8ba)] = 0x5),
      (dv[us(0x7ad)] = 0xa),
      (dv[us(0x36d)] = 0x258),
      (dv[us(0xd76)] = 0x1),
      (dv[us(0x185)] = !![]),
      (dv[us(0x483)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dw = {};
    (dw[us(0xb65)] = us(0xc08)),
      (dw[us(0x72e)] = us(0x13d)),
      (dw[us(0xb8a)] = cS[us(0xb3)]),
      (dw[us(0xc80)] = 0xb),
      (dw[us(0x8ba)] = 0xf),
      (dw[us(0x7ad)] = 0x1),
      (dw[us(0x36d)] = 0x3e8),
      (dw[us(0xceb)] = !![]),
      (dw[us(0x946)] = !![]);
    const dx = {};
    (dx[us(0xb65)] = us(0xc64)),
      (dx[us(0x72e)] = us(0x2f2)),
      (dx[us(0xb8a)] = cS[us(0x473)]),
      (dx[us(0xc80)] = 0xb),
      (dx[us(0x8ba)] = 0xf),
      (dx[us(0x7ad)] = 0x5),
      (dx[us(0x36d)] = 0x5dc),
      (dx[us(0xc38)] = 0x32),
      (dx[us(0x55b)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dy = {};
    (dy[us(0xb65)] = us(0x564)),
      (dy[us(0x72e)] = us(0xa17)),
      (dy[us(0xb8a)] = cS[us(0x787)]),
      (dy[us(0xc80)] = 0x7),
      (dy[us(0x8ba)] = 0x19),
      (dy[us(0x7ad)] = 0x19),
      (dy[us(0xd76)] = 0x4),
      (dy[us(0x36d)] = 0x3e8),
      (dy[us(0x525)] = 0x1f4),
      (dy[us(0xadd)] = 0x9),
      (dy[us(0x6d0)] = Math["PI"] / 0x8),
      (dy[us(0x3ea)] = !![]),
      (dy[us(0x2b6)] = 0x28);
    const dz = {};
    (dz[us(0xb65)] = us(0xcde)),
      (dz[us(0x72e)] = us(0x82f)),
      (dz[us(0xb8a)] = cS[us(0x855)]),
      (dz[us(0xc80)] = 0x10),
      (dz[us(0x8ba)] = 0x0),
      (dz[us(0xca2)] = 0x1),
      (dz[us(0x7ad)] = 0x0),
      (dz[us(0x36d)] = 0x157c),
      (dz[us(0x525)] = 0x1f4),
      (dz[us(0x1ca)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dz[us(0x4e3)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dz[us(0xacd)] = 0x3c),
      (dz[us(0x2ab)] = !![]),
      (dz[us(0x946)] = !![]);
    const dA = {};
    (dA[us(0xb65)] = us(0x57b)),
      (dA[us(0x72e)] = us(0x821)),
      (dA[us(0xb8a)] = cS[us(0x611)]),
      (dA[us(0x36d)] = 0x5dc),
      (dA[us(0x530)] = !![]),
      (dA[us(0x8ba)] = 0xa),
      (dA[us(0x7ad)] = 0x14),
      (dA[us(0xc80)] = 0xd);
    const dB = {};
    (dB[us(0xb65)] = us(0xadb)),
      (dB[us(0x72e)] = us(0xa50)),
      (dB[us(0xb8a)] = cS[us(0x6ab)]),
      (dB[us(0x36d)] = 0xdac),
      (dB[us(0x525)] = 0x1f4),
      (dB[us(0x8ba)] = 0x5),
      (dB[us(0x7ad)] = 0x5),
      (dB[us(0xc80)] = 0xa),
      (dB[us(0xcef)] = 0x46),
      (dB[us(0x863)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
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
        name: us(0x836),
        desc: us(0xaf9),
        ability: df[us(0x3ee)],
        orbitRange: 0x32,
        orbitRangeTiers: dd((r3) => 0x32 + r3 * 0x46),
      },
      {
        name: us(0xa74),
        desc: us(0x9d3),
        ability: df[us(0x838)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dA,
      dB,
      {
        name: us(0xb49),
        desc: us(0xa06),
        type: cS[us(0x552)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][us(0xd91)](
          (r3) => r3 * 0.8
        ),
      },
      {
        name: us(0x4b3),
        desc: us(0xc01),
        type: cS[us(0x721)],
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
        name: us(0x89b),
        desc: us(0x6dd),
        type: cS[us(0x7dc)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
        orbitSpeedFactor: 0.95,
        orbitSpeedFactorTiers: [0.94, 0.93, 0.92, 0.91, 0.9, 0.8, 0.7, 0.1],
      },
      {
        name: us(0xc55),
        desc: us(0x173),
        type: cS[us(0xac5)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][us(0xd91)](
          (r3) => r3 - 0.2
        ),
      },
      {
        name: us(0x4cf),
        desc: us(0x64b),
        type: cS[us(0xc3e)],
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
        name: us(0xaec),
        desc: us(0x4cd),
        type: cS[us(0xbcc)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: us(0x622),
        desc: us(0xd1e),
        type: cS[us(0x2d7)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: us(0xdaa),
        desc: us(0xbab),
        type: cS[us(0x538)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: us(0x4ca),
        desc: us(0x8a4),
        type: cS[us(0x33c)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dD(![]),
      dD(!![]),
      {
        name: us(0xab3),
        desc: us(0x3b2),
        type: cS[us(0x51a)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: us(0xd87),
        desc: us(0xbc0),
        type: cS[us(0xd3e)],
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
        name: us(0x7df),
        desc: us(0xb58),
        type: cS[us(0x2b3)],
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
        name: us(0xf4),
        desc: us(0x6b4),
        type: cS[us(0xa48)],
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
        spawn: us(0x273),
        spawnTiers: [
          us(0x454),
          us(0xd59),
          us(0x40b),
          us(0x40b),
          us(0xa2f),
          us(0x318),
          us(0x318),
          us(0xd9d),
        ],
      },
      {
        name: us(0x104),
        desc: us(0x146),
        type: cS[us(0xc20)],
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
        spawn: us(0x4ea),
        spawnTiers: [
          us(0x6cb),
          us(0x6cb),
          us(0x194),
          us(0x416),
          us(0xb95),
          us(0x8a1),
          us(0x8a1),
          us(0xba4),
        ],
      },
      {
        name: us(0x938),
        desc: us(0xc8d),
        type: cS[us(0xa48)],
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
        spawn: us(0xaad),
        spawnTiers: [
          us(0xcce),
          us(0xcce),
          us(0x989),
          us(0x5a0),
          us(0x214),
          us(0x5f9),
          us(0x5f9),
          us(0xd35),
        ],
      },
      {
        name: us(0x126),
        desc: us(0xbb),
        type: cS[us(0x964)],
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
        spawn: us(0x325),
        spawnTiers: [
          us(0x325),
          us(0xc67),
          us(0x1e7),
          us(0xd33),
          us(0x3bf),
          us(0x2f0),
          us(0x2f0),
          us(0x3dd),
        ],
      },
      {
        name: us(0x211),
        desc: us(0x310),
        type: cS[us(0x70a)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: us(0xa51),
        spawnTiers: [
          us(0xaa9),
          us(0x16d),
          us(0x16d),
          us(0x28c),
          us(0xa7b),
          us(0x7cf),
          us(0x7cf),
          us(0xde),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: us(0x2f4),
        desc: us(0xb87),
        type: cS[us(0xbb7)],
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
        name: us(0x7ea),
        desc: us(0x5de),
        type: cS[us(0x943)],
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
        name: us(0x2d6),
        desc: us(0x542),
        type: cS[us(0x430)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: us(0xa56),
        desc: us(0x83a),
        type: cS[us(0xd58)],
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
        name: us(0xc5e),
        desc: us(0x967),
        type: cS[us(0x2e3)],
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
        name: us(0x8d5),
        desc: us(0x77d),
        type: cS[us(0x750)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: us(0x6ca),
        desc: us(0x3cb),
        type: cS[us(0xa19)],
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
        name: us(0x7d0),
        desc: us(0xb3e),
        ability: df[us(0x27f)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: us(0x15c),
        desc: us(0xb9),
        type: cS[us(0xc0e)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: us(0x94a),
        desc: us(0x69b),
        type: cS[us(0x5a6)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: us(0x585),
        desc: us(0xa1d),
        ability: df[us(0x388)],
        petHealF: 0x28,
      },
      {
        name: us(0x29a),
        desc: us(0xcf),
        ability: df[us(0xcf8)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: us(0x6d),
        type: cS[us(0x66d)],
        desc: us(0x9ba),
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
        name: us(0x14a),
        desc: us(0x809),
        type: cS[us(0x351)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: us(0xbae),
        spawnTiers: [
          us(0x878),
          us(0xad2),
          us(0xad2),
          us(0xaba),
          us(0x4f1),
          us(0x5a3),
          us(0x5a3),
          us(0xcf9),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: us(0xc76),
        desc: us(0x5e5),
        type: cS[us(0x6de)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          us(0xd91)
        ]((r3) => r3 / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: us(0x6ba),
        desc: us(0x84a),
        type: cS[us(0x840)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: us(0x9f4),
        desc: us(0x8af),
        type: cS[us(0x90b)],
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
        name: us(0x12b),
        desc: us(0xd7a),
        type: cS[us(0xc35)],
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
        name: us(0x6ef),
        desc: us(0x24c),
        type: cS[us(0x896)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: us(0x26e),
        desc: us(0x528),
        type: cS[us(0x950)],
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
        name: us(0x4bf),
        desc: us(0x9da),
        type: cS[us(0xac7)],
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
        consumeProjType: cS[us(0x943)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: us(0xbca),
        desc: us(0xe8),
        type: cS[us(0x627)],
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
        name: us(0x7ac),
        desc: us(0x9e1),
        type: cS[us(0x5a2)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: us(0x9db),
        spawnTiers: [
          us(0x12f),
          us(0x365),
          us(0x365),
          us(0x510),
          us(0x8ae),
          us(0xacc),
          us(0x6c5),
          us(0xb9a),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: us(0x909), desc: us(0x12e), ability: df[us(0x68f)] },
      {
        name: us(0x4b4),
        desc: us(0xa49),
        type: cS[us(0x990)],
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
        name: us(0x4b1),
        desc: us(0x23d),
        type: cS[us(0x271)],
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
        name: us(0x88b),
        desc: us(0x3e7),
        type: cS[us(0x199)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: us(0x37b),
        desc: us(0xb06),
        type: cS[us(0x7c)],
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
        name: us(0x4a7),
        desc: us(0x1f2),
        type: cS[us(0x7a0)],
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
        name: us(0xc1f),
        desc: us(0x520),
        type: cS[us(0x7a7)],
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
        spawn: us(0x3bc),
        spawnTiers: [
          us(0x961),
          us(0x55f),
          us(0x55f),
          us(0x785),
          us(0x292),
          us(0x615),
          us(0x615),
          us(0x112),
        ],
      },
      {
        name: us(0xafe),
        desc: us(0x26d),
        type: cS[us(0x3e4)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: us(0x60d),
        desc: us(0xa7c),
        type: cS[us(0x47a)],
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
        name: us(0x10e),
        desc: us(0xb64),
        type: cS[us(0x360)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 2.5,
      },
      {
        name: us(0x594),
        desc: us(0x851),
        type: cS[us(0x2ae)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dd((r3) => 0xa + r3 * 0x28),
      },
      {
        name: us(0x75d),
        desc: us(0x478),
        type: cS[us(0xcac)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: us(0x79a),
        desc: us(0x8b9),
        type: cS[us(0x6cc)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dd((r3) => 0x2 + Math[us(0xbb8)](1.7 ** r3)),
      },
      {
        name: us(0x306),
        desc: us(0x387),
        type: cS[us(0xc44)],
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
        name: us(0x68c),
        desc: us(0x7bc),
        type: cS[us(0xc54)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dd((r3) => 0.02 + r3 * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: us(0x816),
        desc: us(0xb9d),
        type: cS[us(0x31a)],
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
        spawn: us(0x903),
        spawnTiers: [
          us(0x903),
          us(0xaf),
          us(0x945),
          us(0x87b),
          us(0x158),
          us(0xda1),
          us(0xda1),
          us(0xc83),
        ],
      },
      { name: us(0x98b), desc: us(0x7a8), ability: df[us(0x600)] },
      {
        name: us(0xc8a),
        desc: us(0x51d),
        type: cS[us(0xb43)],
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
        r5 = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][uz(0xd91)](
          (r6) => r6 * r4
        );
      return {
        name: r3 ? uz(0x5dd) : uz(0x637),
        desc:
          (r3 ? uz(0x168) : uz(0x6eb)) +
          uz(0x221) +
          (r3 ? uz(0x8df) : "") +
          uz(0xbbb),
        type: cS[r3 ? uz(0x630) : uz(0x67e)],
        size: 0x10,
        healthF: r3 ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: r5[0x0],
        mobSizeChangeTiers: r5[uz(0x761)](0x1),
      };
    }
    var dE = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dF = {},
      dG = dC[us(0x680)],
      dH = da[us(0x680)],
      dI = eP();
    for (let r3 = 0x0, r4 = dC[us(0x680)]; r3 < r4; r3++) {
      const r5 = dC[r3];
      (r5[us(0xd57)] = !![]), (r5["id"] = r3);
      if (!r5[us(0x456)]) r5[us(0x456)] = r5[us(0xb65)];
      dK(r5), (r5[us(0x99b)] = 0x0), (r5[us(0x1ce)] = r3);
      let r6 = r5;
      for (let r7 = 0x1; r7 < dH; r7++) {
        const r8 = dO(r5);
        (r8[us(0x3ac)] = r5[us(0x3ac)] + r7),
          (r8[us(0xb65)] = r5[us(0xb65)] + "_" + r8[us(0x3ac)]),
          (r8[us(0x99b)] = r7),
          (r6[us(0xa75)] = r8),
          (r6 = r8),
          dJ(r5, r8),
          dK(r8),
          (r8["id"] = dC[us(0x680)]),
          (dC[r8["id"]] = r8);
      }
    }
    function dJ(r9, ra) {
      const uA = us,
        rb = ra[uA(0x3ac)] - r9[uA(0x3ac)] - 0x1;
      for (let rc in r9) {
        const rd = r9[rc + uA(0x250)];
        Array[uA(0x37e)](rd) && (ra[rc] = rd[rb]);
      }
    }
    function dK(r9) {
      const uB = us;
      dF[r9[uB(0xb65)]] = r9;
      for (let ra in di) {
        r9[ra] === void 0x0 && (r9[ra] = di[ra]);
      }
      r9[uB(0x757)] === df[uB(0x6db)] &&
        (r9[uB(0x107)] = cW[r9[uB(0x3ac)] + 0x1] / 0x64),
        (r9[uB(0xca2)] =
          r9[uB(0x8ba)] > 0x0
            ? dg(r9[uB(0x3ac)], r9[uB(0x8ba)])
            : r9[uB(0xca2)]),
        (r9[uB(0x4f8)] =
          r9[uB(0x7ad)] > 0x0
            ? dg(r9[uB(0x3ac)], r9[uB(0x7ad)])
            : r9[uB(0x4f8)]),
        (r9[uB(0x17d)] = dg(r9[uB(0x3ac)], r9[uB(0x833)])),
        (r9[uB(0xa40)] = dg(r9[uB(0x3ac)], r9[uB(0x9ab)])),
        (r9[uB(0xaac)] = dg(r9[uB(0x3ac)], r9[uB(0x866)])),
        (r9[uB(0xa32)] = dg(r9[uB(0x3ac)], r9[uB(0x21a)])),
        (r9[uB(0x13c)] = dg(r9[uB(0x3ac)], r9[uB(0x740)])),
        (r9[uB(0xd88)] = dg(r9[uB(0x3ac)], r9[uB(0x6b6)])),
        (r9[uB(0x4f9)] = dg(r9[uB(0x3ac)], r9[uB(0x8c4)])),
        (r9[uB(0x90a)] = dg(r9[uB(0x3ac)], r9[uB(0x9c1)])),
        r9[uB(0x410)] &&
          ((r9[uB(0x42e)] = dg(r9[uB(0x3ac)], r9[uB(0x6ed)])),
          (r9[uB(0x95d)] = dg(r9[uB(0x3ac)], r9[uB(0xb7d)]))),
        r9[uB(0x6fb)] > 0x0
          ? (r9[uB(0x99e)] = dg(r9[uB(0x3ac)], r9[uB(0x6fb)]))
          : (r9[uB(0x99e)] = 0x0),
        (r9[uB(0x579)] = r9[uB(0xc16)]
          ? dg(r9[uB(0x3ac)], r9[uB(0x789)])
          : 0x0),
        (r9[uB(0x85f)] = r9[uB(0xa1c)]
          ? dg(r9[uB(0x3ac)], r9[uB(0xd3d)])
          : 0x0),
        (r9[uB(0x780)] = dg(r9[uB(0x3ac)], r9[uB(0x120)])),
        dI[r9[uB(0x3ac)]][uB(0x46a)](r9);
    }
    var dL = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dM = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dN = cV(us(0x285));
    function dO(r9) {
      const uC = us;
      return JSON[uC(0x681)](JSON[uC(0x646)](r9));
    }
    const dP = {};
    (dP[us(0xb65)] = us(0x53a)),
      (dP[us(0x72e)] = us(0x2c8)),
      (dP[us(0xb8a)] = us(0x3a0)),
      (dP[us(0x3ac)] = 0x0),
      (dP[us(0x8ba)] = 0x64),
      (dP[us(0x7ad)] = 0x1e),
      (dP[us(0x25e)] = 0x32),
      (dP[us(0x5d0)] = dN[us(0x364)]),
      (dP[us(0x16a)] = ![]),
      (dP[us(0xae9)] = !![]),
      (dP[us(0xc16)] = ![]),
      (dP[us(0x789)] = 0x0),
      (dP[us(0x579)] = 0x0),
      (dP[us(0x895)] = ![]),
      (dP[us(0xd0b)] = ![]),
      (dP[us(0x613)] = 0x1),
      (dP[us(0xb44)] = cS[us(0x7a4)]),
      (dP[us(0x813)] = 0x0),
      (dP[us(0x9fc)] = 0x0),
      (dP[us(0xef)] = 0.5),
      (dP[us(0x539)] = 0x0),
      (dP[us(0x2b6)] = 0x1e),
      (dP[us(0xfb)] = 0x0),
      (dP[us(0x49a)] = ![]),
      (dP[us(0xd3d)] = 0x0),
      (dP[us(0x275)] = 0x0),
      (dP[us(0x642)] = 11.5),
      (dP[us(0x5e8)] = 0x4),
      (dP[us(0x1ee)] = !![]),
      (dP[us(0xc23)] = 0x0),
      (dP[us(0x562)] = 0x0),
      (dP[us(0x17c)] = 0x1),
      (dP[us(0xd2e)] = 0x0),
      (dP[us(0xd01)] = 0x0),
      (dP[us(0x4c1)] = 0x0),
      (dP[us(0x117)] = 0x0),
      (dP[us(0x62f)] = 0x1);
    var dQ = dP;
    const dR = {};
    (dR[us(0xb65)] = us(0x398)),
      (dR[us(0x72e)] = us(0xd00)),
      (dR[us(0xb8a)] = us(0x462)),
      (dR[us(0x8ba)] = 0x2ee),
      (dR[us(0x7ad)] = 0xa),
      (dR[us(0x25e)] = 0x32),
      (dR[us(0x895)] = !![]),
      (dR[us(0xd0b)] = !![]),
      (dR[us(0x613)] = 0.05),
      (dR[us(0x642)] = 0x5),
      (dR[us(0xb3f)] = !![]),
      (dR[us(0xbe1)] = [[us(0x4ea), 0x3]]),
      (dR[us(0x743)] = [
        [us(0x956), 0x1],
        [us(0x4ea), 0x2],
        [us(0x262), 0x2],
        [us(0x367), 0x1],
      ]),
      (dR[us(0xb39)] = [[us(0x215), "f"]]);
    const dS = {};
    (dS[us(0xb65)] = us(0x956)),
      (dS[us(0x72e)] = us(0x21f)),
      (dS[us(0xb8a)] = us(0x195)),
      (dS[us(0x8ba)] = 0x1f4),
      (dS[us(0x7ad)] = 0xa),
      (dS[us(0x25e)] = 0x28),
      (dS[us(0xb3f)] = !![]),
      (dS[us(0x16a)] = !![]),
      (dS[us(0xb39)] = [
        [us(0xaec), "E"],
        [us(0x5dd), "G"],
        [us(0x104), "A"],
      ]);
    const dT = {};
    (dT[us(0xb65)] = us(0x4ea)),
      (dT[us(0x72e)] = us(0xda4)),
      (dT[us(0xb8a)] = us(0x1e4)),
      (dT[us(0x8ba)] = 0x64),
      (dT[us(0x7ad)] = 0xa),
      (dT[us(0x25e)] = 0x1c),
      (dT[us(0x16a)] = !![]),
      (dT[us(0xb39)] = [[us(0xaec), "I"]]);
    const dU = {};
    (dU[us(0xb65)] = us(0x262)),
      (dU[us(0x72e)] = us(0xcca)),
      (dU[us(0xb8a)] = us(0x68d)),
      (dU[us(0x8ba)] = 62.5),
      (dU[us(0x7ad)] = 0xa),
      (dU[us(0x25e)] = 0x1c),
      (dU[us(0xb39)] = [[us(0x4ca), "H"]]);
    const dV = {};
    (dV[us(0xb65)] = us(0x367)),
      (dV[us(0x72e)] = us(0x7b3)),
      (dV[us(0xb8a)] = us(0x999)),
      (dV[us(0x8ba)] = 0x19),
      (dV[us(0x7ad)] = 0xa),
      (dV[us(0x25e)] = 0x19),
      (dV[us(0x16a)] = ![]),
      (dV[us(0xae9)] = ![]),
      (dV[us(0xb39)] = [
        [us(0x591), "F"],
        [us(0x4ca), "F"],
        [us(0x637), "G"],
        [us(0x8d5), "F"],
      ]);
    var dW = [dR, dS, dT, dU, dV];
    function dX() {
      const uD = us,
        r9 = dO(dW);
      for (let ra = 0x0; ra < r9[uD(0x680)]; ra++) {
        const rb = r9[ra];
        (rb[uD(0xb8a)] += uD(0x9f4)),
          rb[uD(0xb65)] === uD(0x398) &&
            (rb[uD(0xb39)] = [
              [uD(0xc64), "D"],
              [uD(0x2f4), "E"],
            ]),
          (rb[uD(0xb65)] = dY(rb[uD(0xb65)])),
          (rb[uD(0x72e)] = dY(rb[uD(0x72e)])),
          (rb[uD(0x7ad)] *= 0x2),
          rb[uD(0xbe1)] &&
            rb[uD(0xbe1)][uD(0x78e)]((rc) => {
              return (rc[0x0] = dY(rc[0x0])), rc;
            }),
          rb[uD(0x743)] &&
            rb[uD(0x743)][uD(0x78e)]((rc) => {
              return (rc[0x0] = dY(rc[0x0])), rc;
            });
      }
      return r9;
    }
    function dY(r9) {
      const uE = us;
      return r9[uE(0xce2)](/Ant/g, uE(0xb6e))[uE(0xce2)](/ant/g, uE(0x608));
    }
    const dZ = {};
    (dZ[us(0xb65)] = us(0xb6a)),
      (dZ[us(0x72e)] = us(0x2cc)),
      (dZ[us(0xb8a)] = us(0xa60)),
      (dZ[us(0x8ba)] = 37.5),
      (dZ[us(0x7ad)] = 0x32),
      (dZ[us(0x25e)] = 0x28),
      (dZ[us(0xb39)] = [
        [us(0x709), "F"],
        [us(0x4cf), "I"],
      ]),
      (dZ[us(0xc23)] = 0x4),
      (dZ[us(0x562)] = 0x4);
    const e0 = {};
    (e0[us(0xb65)] = us(0xdaa)),
      (e0[us(0x72e)] = us(0x575)),
      (e0[us(0xb8a)] = us(0xa07)),
      (e0[us(0x8ba)] = 0x5e),
      (e0[us(0x7ad)] = 0x5),
      (e0[us(0x613)] = 0.05),
      (e0[us(0x25e)] = 0x3c),
      (e0[us(0x895)] = !![]),
      (e0[us(0xb39)] = [[us(0xdaa), "h"]]);
    const e1 = {};
    (e1[us(0xb65)] = us(0x903)),
      (e1[us(0x72e)] = us(0xa42)),
      (e1[us(0xb8a)] = us(0x102)),
      (e1[us(0x8ba)] = 0x4b),
      (e1[us(0x7ad)] = 0xa),
      (e1[us(0x613)] = 0.05),
      (e1[us(0x895)] = !![]),
      (e1[us(0x422)] = 1.25),
      (e1[us(0xb39)] = [
        [us(0x903), "h"],
        [us(0x89b), "J"],
        [us(0x816), "K"],
      ]);
    const e2 = {};
    (e2[us(0xb65)] = us(0xaad)),
      (e2[us(0x72e)] = us(0x512)),
      (e2[us(0xb8a)] = us(0x8a5)),
      (e2[us(0x8ba)] = 62.5),
      (e2[us(0x7ad)] = 0x32),
      (e2[us(0x16a)] = !![]),
      (e2[us(0x25e)] = 0x28),
      (e2[us(0xb39)] = [
        [us(0xa4a), "f"],
        [us(0x51c), "I"],
        [us(0x938), "K"],
      ]),
      (e2[us(0xb44)] = cS[us(0xcdd)]),
      (e2[us(0x9fc)] = 0xa),
      (e2[us(0x813)] = 0x5),
      (e2[us(0x2b6)] = 0x26),
      (e2[us(0xef)] = 0.375 / 1.1),
      (e2[us(0x539)] = 0.75),
      (e2[us(0x5d0)] = dN[us(0x8a5)]);
    const e3 = {};
    (e3[us(0xb65)] = us(0xb7f)),
      (e3[us(0x72e)] = us(0x390)),
      (e3[us(0xb8a)] = us(0x257)),
      (e3[us(0x8ba)] = 87.5),
      (e3[us(0x7ad)] = 0xa),
      (e3[us(0xb39)] = [
        [us(0x591), "f"],
        [us(0xb33), "f"],
      ]),
      (e3[us(0xc23)] = 0x5),
      (e3[us(0x562)] = 0x5);
    const e4 = {};
    (e4[us(0xb65)] = us(0x273)),
      (e4[us(0x72e)] = us(0x536)),
      (e4[us(0xb8a)] = us(0x3a0)),
      (e4[us(0x8ba)] = 0x64),
      (e4[us(0x7ad)] = 0x1e),
      (e4[us(0x16a)] = !![]),
      (e4[us(0xb39)] = [[us(0xf4), "F"]]),
      (e4[us(0xc23)] = 0x5),
      (e4[us(0x562)] = 0x5);
    const e5 = {};
    (e5[us(0xb65)] = us(0x3bc)),
      (e5[us(0x72e)] = us(0xca3)),
      (e5[us(0xb8a)] = us(0x829)),
      (e5[us(0x8ba)] = 62.5),
      (e5[us(0x7ad)] = 0xf),
      (e5[us(0xc16)] = !![]),
      (e5[us(0x789)] = 0xf),
      (e5[us(0x25e)] = 0x23),
      (e5[us(0x16a)] = !![]),
      (e5[us(0xb39)] = [
        [us(0xc55), "F"],
        [us(0xadb), "F"],
        [us(0xac2), "L"],
        [us(0x7d0), "G"],
      ]);
    const e6 = {};
    (e6[us(0xb65)] = us(0x97d)),
      (e6[us(0x72e)] = us(0xa10)),
      (e6[us(0xb8a)] = us(0xb03)),
      (e6[us(0x8ba)] = 0x64),
      (e6[us(0x7ad)] = 0xf),
      (e6[us(0xc16)] = !![]),
      (e6[us(0x789)] = 0xa),
      (e6[us(0x25e)] = 0x2f),
      (e6[us(0x16a)] = !![]),
      (e6[us(0xb39)] = [
        [us(0x710), "F"],
        [us(0x6ca), "F"],
      ]),
      (e6[us(0xb44)] = cS[us(0x618)]),
      (e6[us(0x9fc)] = 0x3),
      (e6[us(0x813)] = 0x5),
      (e6[us(0xfb)] = 0x7),
      (e6[us(0x2b6)] = 0x2b),
      (e6[us(0xef)] = 0.21),
      (e6[us(0x539)] = -0.31),
      (e6[us(0x5d0)] = dN[us(0x200)]);
    const e7 = {};
    (e7[us(0xb65)] = us(0x325)),
      (e7[us(0x72e)] = us(0x4a9)),
      (e7[us(0xb8a)] = us(0x2cb)),
      (e7[us(0x8ba)] = 0x15e),
      (e7[us(0x7ad)] = 0x28),
      (e7[us(0x25e)] = 0x2d),
      (e7[us(0x16a)] = !![]),
      (e7[us(0xb3f)] = !![]),
      (e7[us(0xb39)] = [
        [us(0xa74), "F"],
        [us(0x836), "G"],
        [us(0x622), "H"],
        [us(0x126), "J"],
      ]);
    const e8 = {};
    (e8[us(0xb65)] = us(0xbb3)),
      (e8[us(0x72e)] = us(0x279)),
      (e8[us(0xb8a)] = us(0xd29)),
      (e8[us(0x8ba)] = 0x7d),
      (e8[us(0x7ad)] = 0x19),
      (e8[us(0x16a)] = !![]),
      (e8[us(0x49a)] = !![]),
      (e8[us(0xd3d)] = 0x5),
      (e8[us(0x275)] = 0x2),
      (e8[us(0x97f)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e8[us(0x5e8)] = 0x4),
      (e8[us(0x642)] = 0x6),
      (e8[us(0xb39)] = [[us(0x9cf), "F"]]);
    const e9 = {};
    (e9[us(0xb65)] = us(0xcde)),
      (e9[us(0x72e)] = us(0xa0)),
      (e9[us(0xb8a)] = us(0x39b)),
      (e9[us(0x8ba)] = 0.5),
      (e9[us(0x7ad)] = 0x5),
      (e9[us(0x16a)] = ![]),
      (e9[us(0xae9)] = ![]),
      (e9[us(0x5e8)] = 0x1),
      (e9[us(0xb39)] = [[us(0xcde), "F"]]);
    const ea = {};
    (ea[us(0xb65)] = us(0x2b0)),
      (ea[us(0x72e)] = us(0x7ff)),
      (ea[us(0xb8a)] = us(0x610)),
      (ea[us(0x8ba)] = 0x19),
      (ea[us(0x7ad)] = 0xa),
      (ea[us(0x25e)] = 0x28),
      (ea[us(0x770)] = cS[us(0x5be)]),
      (ea[us(0xb39)] = [
        [us(0x4ca), "J"],
        [us(0x564), "J"],
      ]);
    const eb = {};
    (eb[us(0xb65)] = us(0x24d)),
      (eb[us(0x72e)] = us(0xc41)),
      (eb[us(0xb8a)] = us(0x32c)),
      (eb[us(0x8ba)] = 0x19),
      (eb[us(0x7ad)] = 0xa),
      (eb[us(0x25e)] = 0x28),
      (eb[us(0x770)] = cS[us(0x4e9)]),
      (eb[us(0x16a)] = !![]),
      (eb[us(0xb39)] = [
        [us(0x710), "J"],
        [us(0x4b3), "J"],
      ]);
    const ec = {};
    (ec[us(0xb65)] = us(0x10d)),
      (ec[us(0x72e)] = us(0xcfd)),
      (ec[us(0xb8a)] = us(0x78b)),
      (ec[us(0x8ba)] = 0x19),
      (ec[us(0x7ad)] = 0xa),
      (ec[us(0x25e)] = 0x28),
      (ec[us(0x770)] = cS[us(0xd92)]),
      (ec[us(0xae9)] = ![]),
      (ec[us(0xb39)] = [
        [us(0xab3), "J"],
        [us(0xb49), "H"],
        [us(0xd87), "J"],
      ]),
      (ec[us(0x5e8)] = 0x17),
      (ec[us(0x642)] = 0x17 * 0.75);
    const ed = {};
    (ed[us(0xb65)] = us(0xb92)),
      (ed[us(0x72e)] = us(0x308)),
      (ed[us(0xb8a)] = us(0x70)),
      (ed[us(0x8ba)] = 87.5),
      (ed[us(0x7ad)] = 0xa),
      (ed[us(0xb39)] = [
        [us(0x7df), "F"],
        [us(0x57b), "I"],
      ]),
      (ed[us(0xc23)] = 0x5),
      (ed[us(0x562)] = 0x5);
    const ee = {};
    (ee[us(0xb65)] = us(0x11b)),
      (ee[us(0x72e)] = us(0x289)),
      (ee[us(0xb8a)] = us(0xd64)),
      (ee[us(0x8ba)] = 87.5),
      (ee[us(0x7ad)] = 0xa),
      (ee[us(0xb39)] = [
        [us(0xb33), "A"],
        [us(0x7df), "A"],
      ]),
      (ee[us(0xc23)] = 0x5),
      (ee[us(0x562)] = 0x5);
    const ef = {};
    (ef[us(0xb65)] = us(0xcc0)),
      (ef[us(0x72e)] = us(0xd5e)),
      (ef[us(0xb8a)] = us(0xc68)),
      (ef[us(0x8ba)] = 0x32),
      (ef[us(0x7ad)] = 0xa),
      (ef[us(0x613)] = 0.05),
      (ef[us(0x25e)] = 0x3c),
      (ef[us(0x895)] = !![]),
      (ef[us(0xb39)] = [
        [us(0xc08), "E"],
        [us(0xc76), "F"],
        [us(0xbca), "F"],
      ]);
    const eg = {};
    (eg[us(0xb65)] = us(0xa51)),
      (eg[us(0x72e)] = us(0x748)),
      (eg[us(0xb8a)] = us(0x164)),
      (eg[us(0x8ba)] = 0x7d),
      (eg[us(0x7ad)] = 0x28),
      (eg[us(0x25e)] = 0x32),
      (eg[us(0x16a)] = ![]),
      (eg[us(0xae9)] = ![]),
      (eg[us(0x5d0)] = dN[us(0x164)]),
      (eg[us(0x5e8)] = 0xe),
      (eg[us(0x642)] = 0xb),
      (eg[us(0x17c)] = 2.2),
      (eg[us(0xb39)] = [
        [us(0x211), "J"],
        [us(0xab3), "H"],
      ]);
    const eh = {};
    (eh[us(0xb65)] = us(0x4b5)),
      (eh[us(0x72e)] = us(0x8f1)),
      (eh[us(0xb8a)] = us(0xa08)),
      (eh[us(0x8ba)] = 0x7d),
      (eh[us(0x7ad)] = 0x28),
      (eh[us(0x25e)] = null),
      (eh[us(0x16a)] = !![]),
      (eh[us(0x272)] = !![]),
      (eh[us(0xb39)] = [
        [us(0x2a9), "D"],
        [us(0x7ea), "E"],
        [us(0x4bf), "E"],
      ]),
      (eh[us(0x25e)] = 0x32),
      (eh[us(0xc80)] = 0x32),
      (eh[us(0xcdb)] = !![]),
      (eh[us(0xd2e)] = -Math["PI"] / 0x2),
      (eh[us(0xb44)] = cS[us(0x943)]),
      (eh[us(0x9fc)] = 0x3),
      (eh[us(0x813)] = 0x3),
      (eh[us(0x2b6)] = 0x21),
      (eh[us(0xef)] = 0.32),
      (eh[us(0x539)] = 0.4),
      (eh[us(0x5d0)] = dN[us(0x8a5)]);
    const ei = {};
    (ei[us(0xb65)] = us(0x2d6)),
      (ei[us(0x72e)] = us(0xbe7)),
      (ei[us(0xb8a)] = us(0x86d)),
      (ei[us(0x8ba)] = 0x96),
      (ei[us(0x7ad)] = 0x14),
      (ei[us(0x16a)] = !![]),
      (ei[us(0xd01)] = 0.5),
      (ei[us(0xb39)] = [
        [us(0x2d6), "D"],
        [us(0xb49), "J"],
        [us(0xab3), "J"],
      ]);
    const ej = {};
    (ej[us(0xb65)] = us(0xa56)),
      (ej[us(0x72e)] = us(0x8db)),
      (ej[us(0xb8a)] = us(0x937)),
      (ej[us(0x8ba)] = 0x19),
      (ej[us(0x7ad)] = 0xf),
      (ej[us(0x613)] = 0.05),
      (ej[us(0x25e)] = 0x37),
      (ej[us(0x895)] = !![]),
      (ej[us(0xb39)] = [[us(0xa56), "h"]]),
      (ej[us(0xb44)] = cS[us(0xd58)]),
      (ej[us(0x4c1)] = 0x9),
      (ej[us(0x2b6)] = 0x28),
      (ej[us(0x9fc)] = 0xf),
      (ej[us(0x813)] = 2.5),
      (ej[us(0x2b6)] = 0x21),
      (ej[us(0xef)] = 0.32),
      (ej[us(0x539)] = 1.8),
      (ej[us(0x117)] = 0x14);
    const ek = {};
    (ek[us(0xb65)] = us(0xc5e)),
      (ek[us(0x72e)] = us(0x1b2)),
      (ek[us(0xb8a)] = us(0x586)),
      (ek[us(0x8ba)] = 0xe1),
      (ek[us(0x7ad)] = 0xa),
      (ek[us(0x25e)] = 0x32),
      (ek[us(0xb39)] = [
        [us(0xc5e), "H"],
        [us(0xc64), "L"],
      ]),
      (ek[us(0x272)] = !![]),
      (ek[us(0x51e)] = !![]),
      (ek[us(0x642)] = 0x23);
    const em = {};
    (em[us(0xb65)] = us(0xcb9)),
      (em[us(0x72e)] = us(0x765)),
      (em[us(0xb8a)] = us(0x96b)),
      (em[us(0x8ba)] = 0x96),
      (em[us(0x7ad)] = 0x19),
      (em[us(0x25e)] = 0x2f),
      (em[us(0x16a)] = !![]),
      (em[us(0xb39)] = [[us(0xab3), "J"]]),
      (em[us(0xb44)] = null),
      (em[us(0x5d0)] = dN[us(0x200)]);
    const en = {};
    (en[us(0xb65)] = us(0xb51)),
      (en[us(0x72e)] = us(0x2d1)),
      (en[us(0xb8a)] = us(0x590)),
      (en[us(0x8ba)] = 0x64),
      (en[us(0x7ad)] = 0x1e),
      (en[us(0x25e)] = 0x1e),
      (en[us(0x16a)] = !![]),
      (en[us(0xaf3)] = us(0x2f4)),
      (en[us(0xb39)] = [
        [us(0x2f4), "F"],
        [us(0x7d0), "E"],
        [us(0x6d), "D"],
        [us(0x98b), "E"],
      ]);
    const eo = {};
    (eo[us(0xb65)] = us(0x15c)),
      (eo[us(0x72e)] = us(0xab2)),
      (eo[us(0xb8a)] = us(0xd8d)),
      (eo[us(0x8ba)] = 0x64),
      (eo[us(0x7ad)] = 0xa),
      (eo[us(0x25e)] = 0x3c),
      (eo[us(0x895)] = !![]),
      (eo[us(0x613)] = 0.05),
      (eo[us(0xb39)] = [[us(0x15c), "D"]]);
    const ep = {};
    (ep[us(0xb65)] = us(0x8b5)),
      (ep[us(0x72e)] = us(0xc3f)),
      (ep[us(0xb8a)] = us(0x400)),
      (ep[us(0x8ba)] = 0x64),
      (ep[us(0x7ad)] = 0x23),
      (ep[us(0x16a)] = !![]),
      (ep[us(0xb39)] = [
        [us(0x94a), "E"],
        [us(0x37b), "D"],
      ]);
    const eq = {};
    (eq[us(0xb65)] = us(0x65d)),
      (eq[us(0x72e)] = us(0x759)),
      (eq[us(0xb8a)] = us(0x962)),
      (eq[us(0x8ba)] = 0xc8),
      (eq[us(0x7ad)] = 0x23),
      (eq[us(0x25e)] = 0x23),
      (eq[us(0x16a)] = !![]),
      (eq[us(0x562)] = 0x5),
      (eq[us(0xb39)] = [
        [us(0x585), "F"],
        [us(0x29a), "D"],
        [us(0x88b), "E"],
      ]);
    const er = {};
    (er[us(0xb65)] = us(0xbae)),
      (er[us(0x72e)] = us(0x3f8)),
      (er[us(0xb8a)] = us(0xb53)),
      (er[us(0x8ba)] = 0xc8),
      (er[us(0x7ad)] = 0x14),
      (er[us(0x25e)] = 0x28),
      (er[us(0x16a)] = !![]),
      (er[us(0xb39)] = [
        [us(0x14a), "E"],
        [us(0x6ba), "D"],
        [us(0x9f4), "F"],
        [us(0x12b), "F"],
      ]),
      (er[us(0xcb6)] = !![]),
      (er[us(0x1ae)] = 0xbb8),
      (er[us(0x40a)] = 0.3);
    const es = {};
    (es[us(0xb65)] = us(0x6ef)),
      (es[us(0x72e)] = us(0x4c0)),
      (es[us(0xb8a)] = us(0x20d)),
      (es[us(0x8ba)] = 0x78),
      (es[us(0x7ad)] = 0x1e),
      (es[us(0x51e)] = !![]),
      (es[us(0x642)] = 0xf),
      (es[us(0x5e8)] = 0x5),
      (es[us(0xb39)] = [
        [us(0x6ef), "F"],
        [us(0x26e), "E"],
        [us(0x4b1), "D"],
      ]),
      (es[us(0x562)] = 0x3);
    const et = {};
    (et[us(0xb65)] = us(0x7ac)),
      (et[us(0x72e)] = us(0x114)),
      (et[us(0xb8a)] = us(0x42f)),
      (et[us(0x8ba)] = 0x78),
      (et[us(0x7ad)] = 0x23),
      (et[us(0x25e)] = 0x32),
      (et[us(0x16a)] = !![]),
      (et[us(0xbdb)] = !![]),
      (et[us(0xb39)] = [
        [us(0x7ac), "E"],
        [us(0xbca), "F"],
      ]),
      (et[us(0xbe1)] = [[us(0x9db), 0x1]]),
      (et[us(0x743)] = [[us(0x9db), 0x2]]),
      (et[us(0xa72)] = !![]);
    const eu = {};
    (eu[us(0xb65)] = us(0x9db)),
      (eu[us(0x72e)] = us(0x1eb)),
      (eu[us(0xb8a)] = us(0x29b)),
      (eu[us(0x8ba)] = 0x96),
      (eu[us(0x7ad)] = 0.1),
      (eu[us(0x25e)] = 0x28),
      (eu[us(0x5e8)] = 0xe),
      (eu[us(0x642)] = 11.6),
      (eu[us(0x16a)] = !![]),
      (eu[us(0xbdb)] = !![]),
      (eu[us(0xc14)] = !![]),
      (eu[us(0x5d0)] = dN[us(0x164)]),
      (eu[us(0x777)] = 0xa),
      (eu[us(0xb39)] = [[us(0x909), "G"]]),
      (eu[us(0x62f)] = 0.5);
    const ev = {};
    (ev[us(0xb65)] = us(0x8a2)),
      (ev[us(0x72e)] = us(0xcf3)),
      (ev[us(0xb8a)] = us(0xc82)),
      (ev[us(0x8ba)] = 0x1f4),
      (ev[us(0x7ad)] = 0x28),
      (ev[us(0x613)] = 0.05),
      (ev[us(0x25e)] = 0x32),
      (ev[us(0x895)] = !![]),
      (ev[us(0x642)] = 0x5),
      (ev[us(0xd0b)] = !![]),
      (ev[us(0xb3f)] = !![]),
      (ev[us(0xb39)] = [
        [us(0x4b4), "F"],
        [us(0x938), "C"],
      ]),
      (ev[us(0xbe1)] = [
        [us(0xb6a), 0x2],
        [us(0xaad), 0x1],
      ]),
      (ev[us(0x743)] = [
        [us(0xb6a), 0x4],
        [us(0xaad), 0x2],
      ]);
    const ew = {};
    (ew[us(0xb65)] = us(0x4a7)),
      (ew[us(0x72e)] = us(0xa9c)),
      (ew[us(0xb8a)] = us(0x9f2)),
      (ew[us(0x8ba)] = 0x50),
      (ew[us(0x7ad)] = 0x28),
      (ew[us(0x5e8)] = 0x2),
      (ew[us(0x642)] = 0x6),
      (ew[us(0x272)] = !![]),
      (ew[us(0xb39)] = [[us(0x4a7), "F"]]);
    const ex = {};
    (ex[us(0xb65)] = us(0x9ee)),
      (ex[us(0x72e)] = us(0x4dc)),
      (ex[us(0xb8a)] = us(0xcbd)),
      (ex[us(0x8ba)] = 0x1f4),
      (ex[us(0x7ad)] = 0x28),
      (ex[us(0x613)] = 0.05),
      (ex[us(0x25e)] = 0x46),
      (ex[us(0x642)] = 0x5),
      (ex[us(0x895)] = !![]),
      (ex[us(0xd0b)] = !![]),
      (ex[us(0xb3f)] = !![]),
      (ex[us(0xb39)] = [
        [us(0xc1f), "A"],
        [us(0xadb), "E"],
      ]),
      (ex[us(0xbe1)] = [[us(0x3bc), 0x2]]),
      (ex[us(0x743)] = [
        [us(0x3bc), 0x3],
        [us(0xb51), 0x2],
      ]);
    const ey = {};
    (ey[us(0xb65)] = us(0x48a)),
      (ey[us(0x72e)] = us(0xd2)),
      (ey[us(0xb8a)] = us(0x1ea)),
      (ey[us(0x25e)] = 0x28),
      (ey[us(0x8ba)] = 0x64),
      (ey[us(0x7ad)] = 0xa),
      (ey[us(0x613)] = 0.05),
      (ey[us(0x895)] = !![]),
      (ey[us(0xc23)] = 0x1),
      (ey[us(0x562)] = 0x1),
      (ey[us(0xb39)] = [
        [us(0x29a), "G"],
        [us(0xb49), "F"],
        [us(0xafe), "F"],
      ]);
    const ez = {};
    (ez[us(0xb65)] = us(0x8f2)),
      (ez[us(0x72e)] = us(0x569)),
      (ez[us(0xb8a)] = us(0x649)),
      (ez[us(0x8ba)] = 0x3c),
      (ez[us(0x7ad)] = 0x28),
      (ez[us(0x25e)] = 0x32),
      (ez[us(0x16a)] = ![]),
      (ez[us(0xae9)] = ![]),
      (ez[us(0x5d0)] = dN[us(0x164)]),
      (ez[us(0x5e8)] = 0xe),
      (ez[us(0x642)] = 0xb),
      (ez[us(0x17c)] = 2.2),
      (ez[us(0xb39)] = [
        [us(0x37b), "E"],
        [us(0xab3), "J"],
      ]);
    const eA = {};
    (eA[us(0xb65)] = us(0xb29)),
      (eA[us(0x72e)] = us(0x11a)),
      (eA[us(0xb8a)] = us(0x82)),
      (eA[us(0x8ba)] = 0x258),
      (eA[us(0x7ad)] = 0x32),
      (eA[us(0x613)] = 0.05),
      (eA[us(0x25e)] = 0x3c),
      (eA[us(0x642)] = 0x7),
      (eA[us(0xb3f)] = !![]),
      (eA[us(0x895)] = !![]),
      (eA[us(0xd0b)] = !![]),
      (eA[us(0xb39)] = [
        [us(0x14a), "A"],
        [us(0x211), "G"],
      ]),
      (eA[us(0xbe1)] = [[us(0xbae), 0x1]]),
      (eA[us(0x743)] = [[us(0xbae), 0x1]]);
    const eB = {};
    (eB[us(0xb65)] = us(0x5eb)),
      (eB[us(0x72e)] = us(0x957)),
      (eB[us(0xb8a)] = us(0xb90)),
      (eB[us(0x8ba)] = 0xc8),
      (eB[us(0x7ad)] = 0x1e),
      (eB[us(0x25e)] = 0x2d),
      (eB[us(0x16a)] = !![]),
      (eB[us(0xb39)] = [
        [us(0xa74), "G"],
        [us(0x836), "H"],
        [us(0x4b1), "E"],
      ]);
    const eC = {};
    (eC[us(0xb65)] = us(0x970)),
      (eC[us(0x72e)] = us(0xced)),
      (eC[us(0xb8a)] = us(0x2aa)),
      (eC[us(0x8ba)] = 0x3c),
      (eC[us(0x7ad)] = 0x64),
      (eC[us(0x25e)] = 0x28),
      (eC[us(0xcbb)] = !![]),
      (eC[us(0x1ee)] = ![]),
      (eC[us(0x16a)] = !![]),
      (eC[us(0xb39)] = [
        [us(0x6ba), "F"],
        [us(0x4ca), "D"],
        [us(0x60d), "G"],
      ]);
    const eD = {};
    (eD[us(0xb65)] = us(0x10e)),
      (eD[us(0x72e)] = us(0x160)),
      (eD[us(0xb8a)] = us(0x1d8)),
      (eD[us(0x25e)] = 0x28),
      (eD[us(0x8ba)] = 0x5a),
      (eD[us(0x7ad)] = 0x5),
      (eD[us(0x613)] = 0.05),
      (eD[us(0x895)] = !![]),
      (eD[us(0xb39)] = [[us(0x10e), "h"]]);
    const eE = {};
    (eE[us(0xb65)] = us(0x594)),
      (eE[us(0x72e)] = us(0xd85)),
      (eE[us(0xb8a)] = us(0x5ff)),
      (eE[us(0x8ba)] = 0x32),
      (eE[us(0x7ad)] = 0x14),
      (eE[us(0x25e)] = 0x28),
      (eE[us(0x272)] = !![]),
      (eE[us(0xb39)] = [[us(0x594), "F"]]);
    const eF = {};
    (eF[us(0xb65)] = us(0x75d)),
      (eF[us(0x72e)] = us(0x6a2)),
      (eF[us(0xb8a)] = us(0xcd0)),
      (eF[us(0x8ba)] = 0x32),
      (eF[us(0x7ad)] = 0x14),
      (eF[us(0x613)] = 0.05),
      (eF[us(0x895)] = !![]),
      (eF[us(0xb39)] = [[us(0x75d), "J"]]);
    const eG = {};
    (eG[us(0xb65)] = us(0x96c)),
      (eG[us(0x72e)] = us(0x494)),
      (eG[us(0xb8a)] = us(0x80)),
      (eG[us(0x8ba)] = 0x64),
      (eG[us(0x7ad)] = 0x1e),
      (eG[us(0x613)] = 0.05),
      (eG[us(0x25e)] = 0x32),
      (eG[us(0x895)] = !![]),
      (eG[us(0xb39)] = [
        [us(0x6ba), "D"],
        [us(0x79a), "E"],
      ]);
    const eH = {};
    (eH[us(0xb65)] = us(0xbbe)),
      (eH[us(0x72e)] = us(0xb5e)),
      (eH[us(0xb8a)] = us(0xcaf)),
      (eH[us(0x8ba)] = 0x96),
      (eH[us(0x7ad)] = 0x14),
      (eH[us(0x25e)] = 0x28),
      (eH[us(0xb39)] = [
        [us(0x306), "D"],
        [us(0x26e), "F"],
      ]),
      (eH[us(0x743)] = [[us(0x367), 0x1, 0.3]]);
    const eI = {};
    (eI[us(0xb65)] = us(0x68c)),
      (eI[us(0x72e)] = us(0x58f)),
      (eI[us(0xb8a)] = us(0x3b6)),
      (eI[us(0x8ba)] = 0x32),
      (eI[us(0x7ad)] = 0x5),
      (eI[us(0x613)] = 0.05),
      (eI[us(0x895)] = !![]),
      (eI[us(0xb39)] = [
        [us(0x68c), "h"],
        [us(0x4ca), "J"],
      ]);
    const eJ = {};
    (eJ[us(0xb65)] = us(0xc8a)),
      (eJ[us(0x72e)] = us(0x619)),
      (eJ[us(0xb8a)] = us(0x85)),
      (eJ[us(0x8ba)] = 0x64),
      (eJ[us(0x7ad)] = 0x5),
      (eJ[us(0x613)] = 0.05),
      (eJ[us(0x895)] = !![]),
      (eJ[us(0xb39)] = [[us(0xc8a), "h"]]);
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
      eL = eK[us(0x680)],
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
      (eN[r9] = [ra]), (ra[us(0xb8a)] = cS[ra[us(0xb8a)]]), eR(ra);
      ra[us(0xb39)] &&
        ra[us(0xb39)][us(0x78e)]((rc) => {
          const uF = us;
          rc[0x1] = rc[0x1][uF(0x7a6)]()[uF(0xb23)](0x0) - 0x41;
        });
      (ra["id"] = r9), (ra[us(0x1ce)] = r9);
      if (!ra[us(0x456)]) ra[us(0x456)] = ra[us(0xb65)];
      for (let rc = 0x1; rc <= db; rc++) {
        const rd = JSON[us(0x681)](JSON[us(0x646)](ra));
        (rd[us(0xb65)] = ra[us(0xb65)] + "_" + rc),
          (rd[us(0x3ac)] = rc),
          (eN[r9][rc] = rd),
          dJ(ra, rd),
          eR(rd),
          (rd["id"] = eK[us(0x680)]),
          eK[us(0x46a)](rd);
      }
    }
    for (let re = 0x0; re < eK[us(0x680)]; re++) {
      const rf = eK[re];
      rf[us(0xbe1)] && eQ(rf, rf[us(0xbe1)]),
        rf[us(0x743)] && eQ(rf, rf[us(0x743)]);
    }
    function eQ(rg, rh) {
      const uG = us;
      rh[uG(0x78e)]((ri) => {
        const uH = uG,
          rj = ri[0x0] + (rg[uH(0x3ac)] > 0x0 ? "_" + rg[uH(0x3ac)] : "");
        ri[0x0] = eM[rj];
      });
    }
    function eR(rg) {
      const uI = us;
      (rg[uI(0xca2)] = dg(rg[uI(0x3ac)], rg[uI(0x8ba)]) * dL[rg[uI(0x3ac)]]),
        (rg[uI(0x4f8)] = dg(rg[uI(0x3ac)], rg[uI(0x7ad)])),
        rg[uI(0xcdb)]
          ? (rg[uI(0xc80)] = rg[uI(0x25e)])
          : (rg[uI(0xc80)] = rg[uI(0x25e)] * dM[rg[uI(0x3ac)]]),
        (rg[uI(0x579)] = dg(rg[uI(0x3ac)], rg[uI(0x789)])),
        (rg[uI(0x397)] = dg(rg[uI(0x3ac)], rg[uI(0x9fc)])),
        (rg[uI(0xa62)] = dg(rg[uI(0x3ac)], rg[uI(0x813)]) * dL[rg[uI(0x3ac)]]),
        (rg[uI(0x32f)] = dg(rg[uI(0x3ac)], rg[uI(0xfb)])),
        rg[uI(0x40a)] && (rg[uI(0xa23)] = dg(rg[uI(0x3ac)], rg[uI(0x40a)])),
        (rg[uI(0x85f)] = dg(rg[uI(0x3ac)], rg[uI(0xd3d)])),
        (eM[rg[uI(0xb65)]] = rg),
        eO[rg[uI(0x3ac)]][uI(0x46a)](rg);
    }
    function eS(rg) {
      return (rg / 0xff) * Math["PI"] * 0x2;
    }
    var eT = Math["PI"] * 0x2;
    function eU(rg) {
      const uJ = us;
      return (
        (rg %= eT), rg < 0x0 && (rg += eT), Math[uJ(0xbb8)]((rg / eT) * 0xff)
      );
    }
    function eV(rg) {
      const uK = us;
      if (!rg || rg[uK(0x680)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        uK(0x567)
      ](rg);
    }
    function eW(rg, rh) {
      return dF[rg + (rh > 0x0 ? "_" + rh : "")];
    }
    var eX = da[us(0xd91)]((rg) => rg[us(0x731)]() + us(0xda9)),
      eY = da[us(0xd91)]((rg) => us(0xc69) + rg + us(0xbd9)),
      eZ = {};
    eX[us(0x78e)]((rg) => {
      eZ[rg] = 0x0;
    });
    var f0 = {};
    eY[us(0x78e)]((rg) => {
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
        timeJoined: Date[uL(0x213)]() * f1,
      };
    }
    var f3 = us(0xd4)[us(0xbde)]("\x20");
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
    for (let rg = 0x0; rg < f5[us(0x680)]; rg++) {
      const rh = f5[rg],
        ri = rh[rh[us(0x680)] - 0x1],
        rj = dO(ri);
      for (let rk = 0x0; rk < rj[us(0x680)]; rk++) {
        const rl = rj[rk];
        if (rl[0x0] < 0x1e) {
          let rm = rl[0x0];
          (rm *= 1.5),
            rm < 1.5 && (rm *= 0xa),
            (rm = parseFloat(rm[us(0x303)](0x3))),
            (rl[0x0] = rm);
        }
        rl[0x1] = d9[us(0x286)];
      }
      rj[us(0x46a)]([0.01, d9[us(0x39f)]]), rh[us(0x46a)](rj);
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
      instagram: us(0x489),
      discord: us(0xac6),
      paw: us(0x514),
      gear: us(0xae2),
      scroll: us(0x80f),
      bag: us(0x2d8),
      food: us(0xa8e),
      graph: us(0xbc2),
      resize: us(0xd66),
      users: us(0x8d7),
      trophy: us(0xb41),
      shop: us(0xb70),
      dice: us(0xda),
      data: us(0xa3c),
      poopPath: new Path2D(us(0x1fc)),
    };
    function fa(rn) {
      const uM = us;
      return rn[uM(0xce2)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fb(rn) {
      const uN = us;
      if(hack.isEnabled('disableChatCheck')) return rn;
      return (
        (rn = fa(rn)),
        (rn = rn[uN(0xce2)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uN(0xce2)](/(.)\1{2,}/gi, "$1")
          [uN(0xce2)](/\u200B|\u200C|\u200D/g, "")
          [uN(0xad8)]()),
        !rn && (rn = uN(0xb2e)),
        rn
      );
    }
    var fc = 0x107;
    function fd(rn) {
      const uO = us,
        ro = rn[uO(0xbde)]("\x0a")[uO(0x9a1)](
          (rp) => rp[uO(0xad8)]()[uO(0x680)] > 0x0
        );
      return { title: ro[uO(0x43f)](), content: ro };
    }
    const fe = {};
    (fe[us(0xc3)] = us(0xce5)),
      (fe[us(0x949)] = [
        us(0x419),
        us(0xad5),
        us(0x747),
        us(0x2c2),
        us(0xcf5),
        us(0x18a),
        us(0x88e),
        us(0xdac),
      ]);
    const ff = {};
    (ff[us(0xc3)] = us(0x74e)), (ff[us(0x949)] = [us(0x879)]);
    const fg = {};
    (fg[us(0xc3)] = us(0x7bb)),
      (fg[us(0x949)] = [us(0x3b1), us(0xda2), us(0x2d9), us(0xa1a)]);
    const fh = {};
    (fh[us(0xc3)] = us(0x4f7)),
      (fh[us(0x949)] = [
        us(0x4e4),
        us(0x629),
        us(0xba5),
        us(0x58d),
        us(0xaca),
        us(0xa45),
        us(0x566),
        us(0x87a),
        us(0xd18),
      ]);
    const fi = {};
    (fi[us(0xc3)] = us(0x6fd)),
      (fi[us(0x949)] = [us(0xaa3), us(0xcb), us(0x1fb), us(0x27e)]);
    const fj = {};
    (fj[us(0xc3)] = us(0x84f)), (fj[us(0x949)] = [us(0x8fe)]);
    const fk = {};
    (fk[us(0xc3)] = us(0xb22)), (fk[us(0x949)] = [us(0x697), us(0xcd2)]);
    const fl = {};
    (fl[us(0xc3)] = us(0xad)),
      (fl[us(0x949)] = [
        us(0xa80),
        us(0x7d2),
        us(0xa1e),
        us(0x4a1),
        us(0x29d),
        us(0xa11),
        us(0x6a7),
        us(0x89e),
      ]);
    const fm = {};
    (fm[us(0xc3)] = us(0x659)),
      (fm[us(0x949)] = [
        us(0xa83),
        us(0xbb1),
        us(0x930),
        us(0x764),
        us(0x75),
        us(0x7b6),
        us(0x485),
        us(0xbe2),
      ]);
    const fn = {};
    (fn[us(0xc3)] = us(0xc42)), (fn[us(0x949)] = [us(0x635)]);
    const fo = {};
    (fo[us(0xc3)] = us(0xa63)),
      (fo[us(0x949)] = [
        us(0x463),
        us(0x12d),
        us(0x316),
        us(0x8f5),
        us(0x7f),
        us(0x6c3),
        us(0xd97),
      ]);
    const fp = {};
    (fp[us(0xc3)] = us(0x617)), (fp[us(0x949)] = [us(0x8a3)]);
    const fq = {};
    (fq[us(0xc3)] = us(0x12a)),
      (fq[us(0x949)] = [us(0xcd1), us(0x1b9), us(0xae5), us(0x3c1)]);
    const fr = {};
    (fr[us(0xc3)] = us(0xb85)), (fr[us(0x949)] = [us(0xbf6), us(0xafa)]);
    const fs = {};
    (fs[us(0xc3)] = us(0x5c1)),
      (fs[us(0x949)] = [us(0xe4), us(0x991), us(0x66c), us(0xe7)]);
    const ft = {};
    (ft[us(0xc3)] = us(0xd72)),
      (ft[us(0x949)] = [us(0x7f3), us(0x9fb), us(0x1b7), us(0x2c5)]);
    const fu = {};
    (fu[us(0xc3)] = us(0x2d2)),
      (fu[us(0x949)] = [
        us(0x61d),
        us(0x9a0),
        us(0x9d6),
        us(0x78a),
        us(0xb7),
        us(0xa5b),
      ]);
    const fv = {};
    (fv[us(0xc3)] = us(0x8c0)), (fv[us(0x949)] = [us(0x64c)]);
    const fw = {};
    (fw[us(0xc3)] = us(0x33d)), (fw[us(0x949)] = [us(0x4e1), us(0xed)]);
    const fx = {};
    (fx[us(0xc3)] = us(0xaaf)),
      (fx[us(0x949)] = [us(0x6d8), us(0xadf), us(0x43c)]);
    const fy = {};
    (fy[us(0xc3)] = us(0xae4)),
      (fy[us(0x949)] = [us(0x7c2), us(0x557), us(0x76f), us(0xc21), us(0x666)]);
    const fz = {};
    (fz[us(0xc3)] = us(0xab9)), (fz[us(0x949)] = [us(0x4aa), us(0x2c0)]);
    const fA = {};
    (fA[us(0xc3)] = us(0x965)),
      (fA[us(0x949)] = [us(0x7c6), us(0x7e1), us(0xb2d)]);
    const fB = {};
    (fB[us(0xc3)] = us(0x343)), (fB[us(0x949)] = [us(0xbd1)]);
    const fC = {};
    (fC[us(0xc3)] = us(0x459)), (fC[us(0x949)] = [us(0x4f2)]);
    const fD = {};
    (fD[us(0xc3)] = us(0x3be)), (fD[us(0x949)] = [us(0xa87)]);
    const fE = {};
    (fE[us(0xc3)] = us(0xb14)),
      (fE[us(0x949)] = [us(0x469), us(0x4ce), us(0xd52)]);
    const fF = {};
    (fF[us(0xc3)] = us(0xbf0)),
      (fF[us(0x949)] = [
        us(0x281),
        us(0x521),
        us(0x2c6),
        us(0x415),
        us(0x5ac),
        us(0x690),
        us(0x583),
        us(0xcc6),
        us(0x3ed),
        us(0x492),
        us(0xec),
        us(0xc6a),
        us(0x391),
        us(0x854),
      ]);
    const fG = {};
    (fG[us(0xc3)] = us(0xcc7)),
      (fG[us(0x949)] = [
        us(0x411),
        us(0x57e),
        us(0x140),
        us(0x334),
        us(0x60c),
        us(0x81f),
        us(0x8e6),
        us(0x2ea),
      ]);
    const fH = {};
    (fH[us(0xc3)] = us(0x81a)),
      (fH[us(0x949)] = [
        us(0xbc6),
        us(0x3a9),
        us(0x62b),
        us(0x268),
        us(0x14f),
        us(0x44b),
        us(0x6a3),
        us(0xa5a),
        us(0x9d7),
        us(0xb38),
        us(0x767),
        us(0x732),
        us(0xd8e),
        us(0x693),
      ]);
    const fI = {};
    (fI[us(0xc3)] = us(0xca0)),
      (fI[us(0x949)] = [
        us(0x75f),
        us(0x34e),
        us(0x932),
        us(0xbd4),
        us(0x52e),
        us(0x5bb),
        us(0x754),
      ]);
    const fJ = {};
    (fJ[us(0xc3)] = us(0x157)),
      (fJ[us(0x949)] = [
        us(0x4c8),
        us(0x2f8),
        us(0x74d),
        us(0x376),
        us(0xcb8),
        us(0xea),
        us(0x9c3),
        us(0xacf),
        us(0x513),
        us(0x9c4),
        us(0x94f),
        us(0x7d9),
        us(0xa58),
        us(0xb5c),
      ]);
    const fK = {};
    (fK[us(0xc3)] = us(0xade)),
      (fK[us(0x949)] = [
        us(0x358),
        us(0x9f1),
        us(0x7a9),
        us(0x96),
        us(0x647),
        us(0x533),
        us(0xd7),
        us(0x2f5),
        us(0x3aa),
        us(0x1d4),
        us(0x2c3),
        us(0x417),
        us(0x14d),
        us(0x882),
        us(0x3d4),
      ]);
    const fL = {};
    (fL[us(0xc3)] = us(0x43b)),
      (fL[us(0x949)] = [
        us(0x632),
        us(0xb97),
        us(0x576),
        us(0x654),
        us(0x9a3),
        us(0xc34),
        us(0x868),
        us(0x86b),
        us(0x1f1),
        us(0x862),
        us(0x83),
        us(0x8bc),
        us(0xc04),
      ]);
    const fM = {};
    (fM[us(0xc3)] = us(0x329)),
      (fM[us(0x949)] = [
        us(0x893),
        us(0x9b5),
        us(0x872),
        us(0x641),
        us(0x13b),
        us(0xbb2),
      ]);
    const fN = {};
    (fN[us(0xc3)] = us(0xc1d)),
      (fN[us(0x949)] = [
        us(0xd6b),
        us(0x820),
        us(0xd1a),
        us(0x1b8),
        us(0xa31),
        us(0x44a),
        us(0x30e),
        us(0x8e9),
        us(0x452),
      ]);
    const fO = {};
    (fO[us(0xc3)] = us(0xc1d)),
      (fO[us(0x949)] = [
        us(0x724),
        us(0x3a2),
        us(0xd17),
        us(0xb20),
        us(0x875),
        us(0x6be),
        us(0x7f5),
        us(0xa2d),
        us(0x1fa),
        us(0xd2b),
        us(0x1c7),
        us(0xd24),
        us(0xb71),
        us(0x62a),
        us(0x2cf),
        us(0x786),
        us(0xa43),
      ]);
    const fP = {};
    (fP[us(0xc3)] = us(0x2ff)), (fP[us(0x949)] = [us(0x7f9), us(0x7e4)]);
    const fQ = {};
    (fQ[us(0xc3)] = us(0xc7e)),
      (fQ[us(0x949)] = [us(0xb57), us(0x8cc), us(0xb98)]);
    const fR = {};
    (fR[us(0xc3)] = us(0xb83)),
      (fR[us(0x949)] = [us(0x986), us(0x210), us(0xa6d), us(0xa3a)]);
    const fS = {};
    (fS[us(0xc3)] = us(0x2ad)),
      (fS[us(0x949)] = [
        us(0x6a0),
        us(0xbe),
        us(0xa90),
        us(0xc85),
        us(0x3f3),
        us(0x18e),
      ]);
    const fT = {};
    (fT[us(0xc3)] = us(0x8ff)), (fT[us(0x949)] = [us(0x1dc)]);
    const fU = {};
    (fU[us(0xc3)] = us(0x31b)),
      (fU[us(0x949)] = [
        us(0xc32),
        us(0xc29),
        us(0x85c),
        us(0x5e0),
        us(0x969),
        us(0x35e),
        us(0x34b),
        us(0xcf4),
      ]);
    const fV = {};
    (fV[us(0xc3)] = us(0x9ac)), (fV[us(0x949)] = [us(0xb8c), us(0x34d)]);
    const fW = {};
    (fW[us(0xc3)] = us(0x93e)),
      (fW[us(0x949)] = [us(0x4df), us(0xd3a), us(0x3c5), us(0x4f5), us(0xa94)]);
    const fX = {};
    (fX[us(0xc3)] = us(0x401)),
      (fX[us(0x949)] = [
        us(0x508),
        us(0x551),
        us(0x150),
        us(0x9b8),
        us(0xa78),
        us(0xcdc),
        us(0x55d),
        us(0xba),
        us(0x28f),
      ]);
    const fY = {};
    (fY[us(0xc3)] = us(0x4db)),
      (fY[us(0x949)] = [
        us(0x4e2),
        us(0x372),
        us(0x368),
        us(0xc8c),
        us(0x9a2),
        us(0x892),
        us(0x966),
        us(0x20f),
      ]);
    const fZ = {};
    (fZ[us(0xc3)] = us(0x95b)),
      (fZ[us(0x949)] = [
        us(0x3c8),
        us(0x726),
        us(0x8c9),
        us(0xb5f),
        us(0xd99),
        us(0x341),
        us(0xb67),
        us(0xb5a),
        us(0xad4),
      ]);
    const g0 = {};
    (g0[us(0xc3)] = us(0xb1e)),
      (g0[us(0x949)] = [
        us(0xcbc),
        us(0x72c),
        us(0x38a),
        us(0x341),
        us(0xa8a),
        us(0x3d2),
        us(0xd4e),
        us(0xbb4),
        us(0x163),
        us(0x31d),
        us(0x2a1),
      ]);
    const g1 = {};
    (g1[us(0xc3)] = us(0xb1e)),
      (g1[us(0x949)] = [us(0xa29), us(0x327), us(0x2c4), us(0x3f2), us(0x6c9)]);
    const g2 = {};
    (g2[us(0xc3)] = us(0x414)), (g2[us(0x949)] = [us(0x89a), us(0xd32)]);
    const g3 = {};
    (g3[us(0xc3)] = us(0x7ae)), (g3[us(0x949)] = [us(0x356)]);
    const g4 = {};
    (g4[us(0xc3)] = us(0xd51)),
      (g4[us(0x949)] = [us(0x8da), us(0xbf2), us(0x73d), us(0x97e)]);
    const g5 = {};
    (g5[us(0xc3)] = us(0xd9a)),
      (g5[us(0x949)] = [us(0x54b), us(0x76d), us(0xd27), us(0xbbc)]);
    const g6 = {};
    (g6[us(0xc3)] = us(0xd9a)),
      (g6[us(0x949)] = [
        us(0x7fb),
        us(0xd7),
        us(0x60e),
        us(0x706),
        us(0xd40),
        us(0x679),
        us(0x984),
        us(0xd06),
        us(0x82b),
        us(0x4d1),
        us(0x3dc),
        us(0x83f),
        us(0xc3d),
        us(0x3d3),
        us(0xfe),
        us(0x790),
        us(0x71a),
        us(0x8c2),
        us(0x531),
        us(0x2f6),
      ]);
    const g7 = {};
    (g7[us(0xc3)] = us(0x12c)),
      (g7[us(0x949)] = [us(0x1df), us(0x2fb), us(0xa84), us(0x226)]);
    const g8 = {};
    (g8[us(0xc3)] = us(0xbd3)),
      (g8[us(0x949)] = [us(0x2a3), us(0xd77), us(0x1d9)]);
    const g9 = {};
    (g9[us(0xc3)] = us(0x18f)),
      (g9[us(0x949)] = [
        us(0x653),
        us(0xaf8),
        us(0xcc1),
        us(0x92f),
        us(0x8fa),
        us(0x13a),
        us(0xac1),
        us(0x359),
        us(0x548),
        us(0xb1f),
        us(0x25f),
        us(0x870),
        us(0x147),
        us(0xcea),
        us(0xc31),
      ]);
    const ga = {};
    (ga[us(0xc3)] = us(0x7d4)), (ga[us(0x949)] = [us(0xcf1), us(0x6b1)]);
    const gb = {};
    (gb[us(0xc3)] = us(0xd12)),
      (gb[us(0x949)] = [us(0x82e), us(0x83c), us(0x94c)]);
    const gc = {};
    (gc[us(0xc3)] = us(0xcd4)),
      (gc[us(0x949)] = [us(0x14c), us(0x56a), us(0x3fc)]);
    const gd = {};
    (gd[us(0xc3)] = us(0x54f)),
      (gd[us(0x949)] = [us(0x182), us(0x56e), us(0x90), us(0x347)]);
    const ge = {};
    (ge[us(0xc3)] = us(0x2be)),
      (ge[us(0x949)] = [us(0x244), us(0x6a9), us(0xd70)]);
    const gf = {};
    (gf[us(0xc3)] = us(0xb9c)),
      (gf[us(0x949)] = [
        us(0xd7),
        us(0x8ed),
        us(0xcbf),
        us(0xd15),
        us(0x592),
        us(0x320),
        us(0xbac),
        us(0xaf4),
        us(0x3a4),
        us(0x524),
        us(0x6f3),
        us(0x7cb),
        us(0x81d),
        us(0x41b),
        us(0xa8b),
        us(0x561),
        us(0x553),
        us(0x6a8),
        us(0xbe6),
        us(0x782),
        us(0xb4e),
        us(0xa9f),
        us(0xb7c),
        us(0x7cd),
      ]);
    const gg = {};
    (gg[us(0xc3)] = us(0xb37)),
      (gg[us(0x949)] = [us(0x8b1), us(0xd05), us(0x322), us(0x4fe)]);
    const gh = {};
    (gh[us(0xc3)] = us(0x350)),
      (gh[us(0x949)] = [
        us(0x1d0),
        us(0xd0e),
        us(0x7ef),
        us(0xd7),
        us(0x42d),
        us(0x8f0),
        us(0x78f),
        us(0x23b),
      ]);
    const gi = {};
    (gi[us(0xc3)] = us(0x6b8)),
      (gi[us(0x949)] = [
        us(0x1d1),
        us(0x860),
        us(0x92f),
        us(0x2e7),
        us(0x58c),
        us(0x482),
        us(0x6c1),
        us(0x8a),
        us(0x72f),
        us(0x6c0),
        us(0x183),
        us(0x4a2),
        us(0xd63),
        us(0xa38),
        us(0x86c),
        us(0x6e2),
        us(0xaa1),
      ]);
    const gj = {};
    (gj[us(0xc3)] = us(0x227)),
      (gj[us(0x949)] = [
        us(0xb7a),
        us(0xc5c),
        us(0x7a3),
        us(0xa03),
        us(0xd38),
        us(0xc0b),
        us(0xc49),
        us(0x718),
        us(0x76),
        us(0x2f3),
        us(0x424),
      ]);
    const gk = {};
    (gk[us(0xc3)] = us(0x85d)),
      (gk[us(0x949)] = [
        us(0x5cf),
        us(0x3f9),
        us(0x5c0),
        us(0x34c),
        us(0x667),
        us(0x42a),
        us(0x505),
        us(0x74f),
        us(0x620),
        us(0xd4f),
      ]);
    const gl = {};
    (gl[us(0xc3)] = us(0x85d)),
      (gl[us(0x949)] = [
        us(0x78c),
        us(0xc78),
        us(0xa15),
        us(0x429),
        us(0x556),
        us(0xcd6),
        us(0x8cd),
        us(0x2de),
        us(0xa7d),
        us(0x597),
      ]);
    const gm = {};
    (gm[us(0xc3)] = us(0xd20)),
      (gm[us(0x949)] = [
        us(0x344),
        us(0xb05),
        us(0xa91),
        us(0x97c),
        us(0x3ad),
        us(0x251),
        us(0xc09),
        us(0xa0f),
        us(0x62d),
        us(0x16b),
      ]);
    const gn = {};
    (gn[us(0xc3)] = us(0xd20)),
      (gn[us(0x949)] = [
        us(0xa29),
        us(0x7f2),
        us(0x323),
        us(0x342),
        us(0x2eb),
        us(0x8a9),
        us(0x89d),
        us(0x7c9),
        us(0x4f4),
        us(0x27d),
        us(0x93),
      ]);
    const go = {};
    (go[us(0xc3)] = us(0x817)),
      (go[us(0x949)] = [us(0x52b), us(0x1c5), us(0x738)]);
    const gp = {};
    (gp[us(0xc3)] = us(0x817)),
      (gp[us(0x949)] = [
        us(0x6d9),
        us(0x3e5),
        us(0x800),
        us(0x4af),
        us(0x46c),
        us(0x248),
        us(0x3de),
        us(0x686),
      ]);
    const gq = {};
    (gq[us(0xc3)] = us(0x5a9)),
      (gq[us(0x949)] = [us(0x217), us(0x8b8), us(0x1d5)]);
    const gr = {};
    (gr[us(0xc3)] = us(0x5a9)),
      (gr[us(0x949)] = [
        us(0x1a5),
        us(0x452),
        us(0xc79),
        us(0xa47),
        us(0x76e),
        us(0xbda),
      ]);
    const gs = {};
    (gs[us(0xc3)] = us(0x5a9)),
      (gs[us(0x949)] = [us(0x746), us(0xd1f), us(0xe2), us(0x3ae)]);
    const gt = {};
    (gt[us(0xc3)] = us(0x5a9)),
      (gt[us(0x949)] = [
        us(0x4e8),
        us(0x278),
        us(0x30b),
        us(0x582),
        us(0x8e),
        us(0x25a),
        us(0x99f),
        us(0xd93),
        us(0x399),
        us(0x190),
        us(0x479),
      ]);
    const gu = {};
    (gu[us(0xc3)] = us(0x382)),
      (gu[us(0x949)] = [us(0x7ce), us(0x636), us(0xc2b)]);
    const gv = {};
    (gv[us(0xc3)] = us(0x63e)),
      (gv[us(0x949)] = [
        us(0x83d),
        us(0xb86),
        us(0x452),
        us(0x43a),
        us(0x683),
        us(0x87c),
        us(0x366),
        us(0x8cb),
        us(0x95e),
        us(0x818),
        us(0xc33),
        us(0x21e),
        us(0x92f),
        us(0x8d6),
        us(0x741),
        us(0x795),
        us(0x70c),
        us(0x228),
        us(0x2b9),
        us(0xd25),
        us(0x67d),
        us(0xba6),
        us(0x48d),
        us(0xd10),
        us(0x9b6),
        us(0x1d3),
        us(0x245),
        us(0xd83),
        us(0xc45),
        us(0xc28),
        us(0x4c4),
        us(0x43d),
        us(0xb31),
        us(0x115),
      ]);
    const gw = {};
    (gw[us(0xc3)] = us(0x5e3)), (gw[us(0x949)] = [us(0xc06)]);
    const gx = {};
    (gx[us(0xc3)] = us(0x385)),
      (gx[us(0x949)] = [
        us(0x768),
        us(0x602),
        us(0xd73),
        us(0xd9),
        us(0xb8d),
        us(0x5ca),
        us(0x774),
        us(0x92f),
        us(0xdb),
        us(0x45c),
        us(0x1a8),
        us(0xccd),
        us(0x77),
        us(0xd68),
        us(0x6cd),
        us(0xb34),
        us(0x15a),
        us(0x6f8),
        us(0xd8f),
        us(0xd98),
        us(0x39e),
        us(0xb60),
        us(0x3cd),
        us(0x3b0),
        us(0x823),
        us(0x204),
        us(0x216),
        us(0x7a5),
        us(0x93d),
        us(0xd48),
        us(0x43d),
        us(0x1de),
        us(0x269),
        us(0xcc4),
        us(0x9fd),
      ]);
    const gy = {};
    (gy[us(0xc3)] = us(0x874)),
      (gy[us(0x949)] = [
        us(0x1c1),
        us(0x5f6),
        us(0x66e),
        us(0x9e9),
        us(0x6c8),
        us(0xd4a),
        us(0x92f),
        us(0xa73),
        us(0x9b7),
        us(0xca1),
        us(0x408),
        us(0x794),
        us(0x9c6),
        us(0x772),
        us(0x7bd),
        us(0x9c2),
        us(0xabe),
        us(0x26f),
        us(0x63f),
        us(0x941),
        us(0x73c),
        us(0x15a),
        us(0xbd7),
        us(0x621),
        us(0x93c),
        us(0x631),
        us(0x595),
        us(0x321),
        us(0x39a),
        us(0x9dc),
        us(0xbed),
        us(0x149),
        us(0x3a3),
        us(0x3cc),
        us(0x43d),
        us(0x1e0),
        us(0x4e7),
        us(0x1ad),
        us(0xaa8),
      ]);
    const gz = {};
    (gz[us(0xc3)] = us(0x240)),
      (gz[us(0x949)] = [
        us(0x9b9),
        us(0x16f),
        us(0x43d),
        us(0x6ce),
        us(0x78d),
        us(0xc91),
        us(0x6e3),
        us(0x42c),
        us(0xb07),
        us(0x92f),
        us(0x307),
        us(0xc3b),
        us(0x8de),
        us(0x1a9),
      ]);
    const gA = {};
    (gA[us(0xc3)] = us(0x2fa)),
      (gA[us(0x949)] = [us(0x2c7), us(0x8fb), us(0x131), us(0x8dc), us(0x91e)]);
    const gB = {};
    (gB[us(0xc3)] = us(0xa18)),
      (gB[us(0x949)] = [us(0xcf7), us(0x4a3), us(0x3b5), us(0xb0)]);
    const gC = {};
    (gC[us(0xc3)] = us(0xa18)),
      (gC[us(0x949)] = [us(0x452), us(0xc4c), us(0x79c)]);
    const gD = {};
    (gD[us(0xc3)] = us(0xbb9)),
      (gD[us(0x949)] = [us(0x10a), us(0x596), us(0xc1e), us(0x297), us(0xd6e)]);
    const gE = {};
    (gE[us(0xc3)] = us(0xbb9)),
      (gE[us(0x949)] = [us(0x98e), us(0x437), us(0xc7c), us(0xc4b)]);
    const gF = {};
    (gF[us(0xc3)] = us(0xbb9)), (gF[us(0x949)] = [us(0x3c4), us(0x571)]);
    const gG = {};
    (gG[us(0xc3)] = us(0x843)),
      (gG[us(0x949)] = [
        us(0x98d),
        us(0x7b1),
        us(0x53c),
        us(0x2a8),
        us(0xcc3),
        us(0x92c),
        us(0x25b),
        us(0x65c),
        us(0x933),
      ]);
    const gH = {};
    (gH[us(0xc3)] = us(0x5b6)),
      (gH[us(0x949)] = [
        us(0x1b6),
        us(0x484),
        us(0x264),
        us(0x124),
        us(0x981),
        us(0x652),
        us(0x386),
      ]);
    const gI = {};
    (gI[us(0xc3)] = us(0xca4)),
      (gI[us(0x949)] = [
        us(0x4a6),
        us(0x40c),
        us(0x35f),
        us(0x29f),
        us(0x8c7),
        us(0x7f0),
        us(0x708),
        us(0xb4f),
        us(0x5da),
        us(0xb2f),
        us(0x4ac),
        us(0x447),
      ]);
    const gJ = {};
    (gJ[us(0xc3)] = us(0x491)),
      (gJ[us(0x949)] = [
        us(0x8bf),
        us(0x655),
        us(0x572),
        us(0x839),
        us(0xd61),
        us(0x6af),
        us(0x30d),
        us(0x53e),
        us(0x29c),
        us(0x4d5),
      ]);
    const gK = {};
    (gK[us(0xc3)] = us(0x491)),
      (gK[us(0x949)] = [
        us(0xc73),
        us(0x383),
        us(0x299),
        us(0xd56),
        us(0x8aa),
        us(0xa4e),
      ]);
    const gL = {};
    (gL[us(0xc3)] = us(0x939)),
      (gL[us(0x949)] = [us(0x82a), us(0xa6), us(0x563)]);
    const gM = {};
    (gM[us(0xc3)] = us(0x939)),
      (gM[us(0x949)] = [us(0x452), us(0x50e), us(0x92d), us(0xa21), us(0x7ab)]);
    const gN = {};
    (gN[us(0xc3)] = us(0x519)),
      (gN[us(0x949)] = [
        us(0x4a0),
        us(0x50f),
        us(0xabc),
        us(0xca9),
        us(0x4ae),
        us(0xd6a),
        us(0x43d),
        us(0xadc),
        us(0xc94),
        us(0x66b),
        us(0x20a),
        us(0x2b4),
        us(0x92f),
        us(0x92a),
        us(0x9a4),
        us(0x5d2),
        us(0x4da),
        us(0xc47),
        us(0x960),
      ]);
    const gO = {};
    (gO[us(0xc3)] = us(0xc4f)),
      (gO[us(0x949)] = [
        us(0xc46),
        us(0xe3),
        us(0xad6),
        us(0xa5c),
        us(0x983),
        us(0x5d7),
        us(0x587),
        us(0x99d),
      ]);
    const gP = {};
    (gP[us(0xc3)] = us(0xc4f)), (gP[us(0x949)] = [us(0xa92), us(0x8d8)]);
    const gQ = {};
    (gQ[us(0xc3)] = us(0x499)), (gQ[us(0x949)] = [us(0x5ea), us(0xa89)]);
    const gR = {};
    (gR[us(0xc3)] = us(0x499)),
      (gR[us(0x949)] = [
        us(0x108),
        us(0xae6),
        us(0x9de),
        us(0xac3),
        us(0x71c),
        us(0x76c),
        us(0x389),
        us(0x203),
        us(0xdab),
      ]);
    const gS = {};
    (gS[us(0xc3)] = us(0x8b7)), (gS[us(0x949)] = [us(0x749), us(0x1e2)]);
    const gT = {};
    (gT[us(0xc3)] = us(0x8b7)),
      (gT[us(0x949)] = [
        us(0xf7),
        us(0xa52),
        us(0x6bd),
        us(0x996),
        us(0x730),
        us(0x849),
        us(0x14e),
        us(0x452),
        us(0x881),
      ]);
    const gU = {};
    (gU[us(0xc3)] = us(0x249)), (gU[us(0x949)] = [us(0x9c5)]);
    const gV = {};
    (gV[us(0xc3)] = us(0x249)),
      (gV[us(0x949)] = [
        us(0x692),
        us(0x891),
        us(0xd8a),
        us(0x884),
        us(0x452),
        us(0xc0c),
        us(0x801),
      ]);
    const gW = {};
    (gW[us(0xc3)] = us(0x249)),
      (gW[us(0x949)] = [us(0xbee), us(0xab1), us(0xb5)]);
    const gX = {};
    (gX[us(0xc3)] = us(0xd14)),
      (gX[us(0x949)] = [us(0x881), us(0x603), us(0x64e), us(0x2b2)]);
    const gY = {};
    (gY[us(0xc3)] = us(0xd14)), (gY[us(0x949)] = [us(0x96d)]);
    const gZ = {};
    (gZ[us(0xc3)] = us(0xd14)),
      (gZ[us(0x949)] = [us(0x5d5), us(0xa4c), us(0x87d), us(0xb40), us(0x439)]);
    const h0 = {};
    (h0[us(0xc3)] = us(0xa53)),
      (h0[us(0x949)] = [us(0x687), us(0x5c2), us(0x36a)]);
    const h1 = {};
    (h1[us(0xc3)] = us(0xd46)), (h1[us(0x949)] = [us(0x4fc), us(0x6e4)]);
    const h2 = {};
    (h2[us(0xc3)] = us(0x54d)), (h2[us(0x949)] = [us(0x953), us(0x4c2)]);
    const h3 = {};
    (h3[us(0xc3)] = us(0xc63)), (h3[us(0x949)] = [us(0x9ed)]);
    var h4 = [
      fd(us(0x311)),
      fd(us(0x834)),
      fd(us(0x2b8)),
      fd(us(0xc25)),
      fd(us(0x912)),
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
    console[us(0xb12)](us(0xa3b));
    var h5 = Date[us(0x213)]() < 0x18e9c4b6482,
      h6 = Math[us(0x35d)](Math[us(0xba1)]() * 0xa);
    function h7(rn) {
      const uP = us,
        ro = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let rp = "";
      for (const rq of rn) {
        rq === "\x20"
          ? (rp += "\x20")
          : (rp += ro[(h6 + rq[uP(0xb23)](0x0)) % ro[uP(0x680)]]);
      }
      return rp;
    }
    h5 &&
      document[us(0x8c1)](us(0x61a))[us(0xc86)](
        us(0x2dc),
        h7(us(0x30c)) + us(0xa6b)
      );
    function h8(rn, ro, rp) {
      const uQ = us,
        rq = ro - rn;
      if (Math[uQ(0xb59)](rq) < 0.01) return ro;
      return rn + rq * (0x1 - Math[uQ(0xb36)](-rp * pO));
    }
    var h9 = [],
      ha = 0x0;
    function hb(rn, ro = 0x1388) {
      const uR = us,
        rp = nN(uR(0x974) + jw(rn) + uR(0x20e));
      kH[uR(0x188)](rp);
      let rq = 0x0;
      rr();
      function rr() {
        const uS = uR;
        (rp[uS(0x6fc)][uS(0xc74)] = uS(0xb2b) + ha + uS(0x5ee)),
          (rp[uS(0x6fc)][uS(0x6c7)] = rq);
      }
      (this[uR(0x8ee)] = ![]),
        (this[uR(0xb50)] = () => {
          const uT = uR;
          ro -= pN;
          const rs = ro > 0x0 ? 0x1 : 0x0;
          (rq = h8(rq, rs, 0.3)),
            rr(),
            ro < 0x0 &&
              rq <= 0x0 &&
              (rp[uT(0x256)](), (this[uT(0x8ee)] = !![])),
            (ha += rq * (rp[uT(0x920)] + 0x5));
        }),
        h9[uR(0x46a)](this);
    }
    function hc(rn) {
      new hb(rn, 0x1388);
    }
    function hd() {
      const uU = us;
      ha = 0x0;
      for (let rn = h9[uU(0x680)] - 0x1; rn >= 0x0; rn--) {
        const ro = h9[rn];
        ro[uU(0xb50)](), ro[uU(0x8ee)] && h9[uU(0xb0d)](rn, 0x1);
      }
    }
    var he = !![],
      hf = document[us(0x8c1)](us(0xd45));
    fetch(us(0x295))
      [us(0x5af)]((rn) => {
        const uV = us;
        (hf[uV(0x6fc)][uV(0x9a7)] = uV(0x4eb)), (he = ![]);
      })
      [us(0x1af)]((rn) => {
        const uW = us;
        hf[uW(0x6fc)][uW(0x9a7)] = "";
      });
    var hg = document[us(0x8c1)](us(0x997)),
      hh = Date[us(0x213)]();
    function hi() {
      const uX = us;
      console[uX(0xb12)](uX(0xd0a)),
        (hh = Date[uX(0x213)]()),
        (hg[uX(0x6fc)][uX(0x9a7)] = "");
      try {
        aiptag[uX(0xd41)][uX(0x9a7)][uX(0x46a)](function () {
          const uY = uX;
          aipDisplayTag[uY(0x9a7)](uY(0x298));
        }),
          aiptag[uX(0xd41)][uX(0x9a7)][uX(0x46a)](function () {
            const uZ = uX;
            aipDisplayTag[uZ(0x9a7)](uZ(0x515));
          });
      } catch (rn) {
        console[uX(0xb12)](uX(0x6a1));
      }
    }
    setInterval(function () {
      const v0 = us;
      hg[v0(0x6fc)][v0(0x9a7)] === "" &&
        Date[v0(0x213)]() - hh > 0x7530 &&
        hi();
    }, 0x2710);
    var hj = null,
      hk = 0x0;
    function hl() {
      const v1 = us;
      console[v1(0xb12)](v1(0x791)),
        typeof aiptag[v1(0x5f2)] !== v1(0x73e)
          ? ((hj = 0x45),
            (hk = Date[v1(0x213)]()),
            aiptag[v1(0xd41)][v1(0x253)][v1(0x46a)](function () {
              const v2 = v1;
              aiptag[v2(0x5f2)][v2(0x7d3)]();
            }))
          : window[v1(0x9ff)](v1(0xc8b));
    }
    window[us(0x9ff)] = function (rn) {
      const v3 = us;
      console[v3(0xb12)](v3(0x963) + rn);
      if (rn === v3(0x36c) || rn[v3(0x79e)](v3(0x475)) > -0x1) {
        if (hj !== null && Date[v3(0x213)]() - hk > 0xbb8) {
          console[v3(0xb12)](v3(0x7dd));
          if (hW) {
            const ro = {};
            (ro[v3(0xc3)] = v3(0x3d9)),
              (ro[v3(0xce1)] = ![]),
              kI(
                v3(0x2f9),
                (rp) => {
                  const v4 = v3;
                  rp &&
                    hW &&
                    (il(new Uint8Array([cI[v4(0x301)]])), hK(v4(0xaa)));
                },
                ro
              );
          }
        } else hK(v3(0x151));
      } else alert(v3(0xc2f) + rn);
      hm[v3(0x7d8)][v3(0x256)](v3(0x88a)), (hj = null);
    };
    var hm = document[us(0x8c1)](us(0xa3f));
    (hm[us(0x21c)] = function () {
      const v5 = us;
      hm[v5(0x7d8)][v5(0xab7)](v5(0x88a)), hl();
    }),
      (hm[us(0x6f7)] = function () {
        const v6 = us;
        return nN(
          v6(0x170) + hP[v6(0x286)] + v6(0x153) + hP[v6(0xb0c)] + v6(0x346)
        );
      }),
      (hm[us(0x643)] = !![]);
    var hn = [
        us(0xcaa),
        us(0x5b7),
        us(0x756),
        us(0xc9e),
        us(0x803),
        us(0xd4c),
        us(0x9f),
        us(0x8ab),
        us(0xd49),
        us(0xa0c),
        us(0x57a),
        us(0x3d0),
      ],
      ho = document[us(0x8c1)](us(0xd9b)),
      hp =
        Date[us(0x213)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[us(0x35d)](Math[us(0xba1)]() * hn[us(0x680)]);
    hr();
    function hq(rn) {
      const v7 = us;
      (hp += rn),
        hp < 0x0 ? (hp = hn[v7(0x680)] - 0x1) : (hp %= hn[v7(0x680)]),
        hr();
    }
    function hr() {
      const v8 = us,
        rn = hn[hp];
      (ho[v8(0x6fc)][v8(0x1c9)] =
        v8(0xba0) + rn[v8(0xbde)](v8(0x688))[0x1] + v8(0xc2d)),
        (ho[v8(0x21c)] = function () {
          const v9 = v8;
          window[v9(0x7b5)](rn, v9(0x27b)), hq(0x1);
        });
    }
    (document[us(0x8c1)](us(0x7b0))[us(0x21c)] = function () {
      hq(-0x1);
    }),
      (document[us(0x8c1)](us(0x145))[us(0x21c)] = function () {
        hq(0x1);
      });
    var hs = document[us(0x8c1)](us(0x702));
    hs[us(0x6f7)] = function () {
      const va = us;
      return nN(
        va(0x170) + hP[va(0x286)] + va(0xb2) + hP[va(0xa26)] + va(0x6c2)
      );
    };
    var ht = document[us(0x8c1)](us(0xad9)),
      hu = document[us(0x8c1)](us(0x5ad)),
      hv = ![];
    function hw() {
      const vb = us;
      let rn = "";
      for (let rp = 0x0; rp < h4[vb(0x680)]; rp++) {
        const { title: rq, content: rr } = h4[rp];
        (rn += vb(0x89c) + rq + vb(0xbce)),
          rr[vb(0x78e)]((rs, rt) => {
            const vc = vb;
            let ru = "-\x20";
            if (rs[0x0] === "*") {
              const rv = rs[rt + 0x1];
              if (rv && rv[0x0] === "*") ru = vc(0xdad);
              else ru = vc(0x33a);
              rs = rs[vc(0x761)](0x1);
            }
            (rs = ru + rs), (rn += vc(0x99) + rs + vc(0x57f));
          }),
          (rn += vb(0x381));
      }
      const ro = hD[vb(0xcee)];
      (hv = ro !== void 0x0 && parseInt(ro) < fc), (ht[vb(0x511)] = rn);
    }
    CanvasRenderingContext2D[us(0x457)][us(0x477)] = function (rn) {
      const vd = us;
      this[vd(0xd3b)](rn, rn);
    };
    var hx = ![];
    hx &&
      (OffscreenCanvasRenderingContext2D[us(0x457)][us(0x477)] = function (rn) {
        const ve = us;
        this[ve(0xd3b)](rn, rn);
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
            parseInt(rn[vf(0x761)](0x1, 0x3), 0x10),
            parseInt(rn[vf(0x761)](0x3, 0x5), 0x10),
            parseInt(rn[vf(0x761)](0x5, 0x7), 0x10),
          ]),
        hz[rn]
      );
    }
    var hB = document[us(0xa1f)](us(0x2a4)),
      hC = document[us(0x6da)](us(0x37f));
    for (let rn = 0x0; rn < hC[us(0x680)]; rn++) {
      const ro = hC[rn],
        rp = f9[ro[us(0x393)](us(0xd90))];
      rp && ro[us(0x30f)](nN(rp), ro[us(0x70b)][0x0]);
    }
    var hD;
    try {
      hD = localStorage;
    } catch (rq) {
      console[us(0x901)](us(0xccb), rq), (hD = {});
    }
    var hE = document[us(0x8c1)](us(0x584)),
      hF = document[us(0x8c1)](us(0x354)),
      hG = document[us(0x8c1)](us(0xa6f));
    (hE[us(0x6f7)] = function () {
      const vg = us;
      return nN(
        vg(0xa14) + hP[vg(0xb4d)] + vg(0xb93) + cN + vg(0x282) + cM + vg(0x807)
      );
    }),
      (hF[us(0x4e5)] = cM),
      (hF[us(0x703)] = function () {
        const vh = us;
        !cO[vh(0x567)](this[vh(0x77e)]) &&
          (this[vh(0x77e)] = this[vh(0x77e)][vh(0xce2)](cP, ""));
      });
    var hH,
      hI = document[us(0x8c1)](us(0xb32));
    function hJ(rr) {
      const vi = us;
      rr ? k8(hI, rr + vi(0x116)) : k8(hI, vi(0x1da)),
        (hE[vi(0x6fc)][vi(0x9a7)] =
          rr && rr[vi(0x79e)]("\x20") === -0x1 ? vi(0x4eb) : "");
    }
    hG[us(0x21c)] = nt(function () {
      const vj = us;
      if (!hW || jy) return;
      const rr = hF[vj(0x77e)],
        rs = rr[vj(0x680)];
      if (rs < cN) hc(vj(0x9e8));
      else {
        if (rs > cM) hc(vj(0xd1));
        else {
          if (!cO[vj(0x567)](rr)) hc(vj(0x6e));
          else {
            hc(vj(0x54e), hP[vj(0xa26)]), (hH = rr);
            const rt = new Uint8Array([
              cI[vj(0x40f)],
              ...new TextEncoder()[vj(0x92b)](rr),
            ]);
            il(rt);
          }
        }
      }
    });
    function hK(rr, rs = ng[us(0x7d7)]) {
      nj(-0x1, null, rr, rs);
    }
    hw();
    var hL = f4(cR),
      hM = f4(cS),
      hN = f4(d9);
    const hO = {};
    (hO[us(0xb4d)] = us(0xc61)),
      (hO[us(0xa26)] = us(0x975)),
      (hO[us(0x8b4)] = us(0x470)),
      (hO[us(0x458)] = us(0x19e)),
      (hO[us(0x6f0)] = us(0x374)),
      (hO[us(0xb0c)] = us(0x5dc)),
      (hO[us(0x286)] = us(0x811)),
      (hO[us(0x39f)] = us(0x733)),
      (hO[us(0x677)] = us(0x1e3));
    var hP = hO,
      hQ = Object[us(0x880)](hP),
      hR = [];
    for (let rr = 0x0; rr < hQ[us(0x680)]; rr++) {
      const rs = hQ[rr],
        rt = rs[us(0x761)](0x4, rs[us(0x79e)](")"))
          [us(0xbde)](",\x20")
          [us(0xd91)]((ru) => parseInt(ru) * 0.8);
      hR[us(0x46a)](pY(rt));
    }
    hS(us(0x1dd), us(0x555)),
      hS(us(0x897), us(0x3e8)),
      hS(us(0x502), us(0x6b0)),
      hS(us(0x15f), us(0x304)),
      hS(us(0x74a), us(0xd0)),
      hS(us(0x578), us(0x44f)),
      hS(us(0xb4a), us(0xc6c));
    function hS(ru, rv) {
      const vk = us;
      document[vk(0x8c1)](ru)[vk(0x21c)] = function () {
        const vl = vk;
        window[vl(0x7b5)](rv, vl(0x27b));
      };
    }
    setInterval(function () {
      const vm = us;
      hW && il(new Uint8Array([cI[vm(0x3a8)]]));
    }, 0x3e8);
    function hT() {
      const vn = us;
      (pK = [pR]),
        (j6[vn(0x361)] = !![]),
        (j6 = {}),
        (jG = 0x0),
        (jH[vn(0x680)] = 0x0),
        (iw = []),
        (iG[vn(0x680)] = 0x0),
        (iC[vn(0x511)] = ""),
        (iv = {}),
        (iH = ![]),
        (iy = null),
        (ix = null),
        (pA = 0x0),
        (hW = ![]),
        (mC = 0x0),
        (mB = 0x0),
        (mm = ![]),
        (mi[vn(0x6fc)][vn(0x9a7)] = vn(0x4eb)),
        (q2[vn(0x6fc)][vn(0x9a7)] = q1[vn(0x6fc)][vn(0x9a7)] = vn(0x4eb)),
        (py = 0x0),
        (pz = 0x0);
    }
    var hU;
    function hV(ru) {
      const vo = us;
      (jh[vo(0x6fc)][vo(0x9a7)] = vo(0x4eb)),
        (pf[vo(0x6fc)][vo(0x9a7)] = vo(0x4eb)),
        hZ(),
        kA[vo(0x7d8)][vo(0xab7)](vo(0x254)),
        kB[vo(0x7d8)][vo(0x256)](vo(0x254)),
        hT(),
        console[vo(0xb12)](vo(0x86a) + ru + vo(0x5e2)),
        iu(),
        (hU = new WebSocket(ru)),
        (hU[vo(0xcd9)] = vo(0xa76)),
        (hU[vo(0xbdf)] = hX),
        (hU[vo(0x73f)] = k1),
        (hU[vo(0x30a)] = kg);
    }
    crypto[us(0x1d6)] =
      crypto[us(0x1d6)] ||
      function ru() {
        const vp = us;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vp(0xce2)
        ](/[018]/g, (rv) =>
          (rv ^
            (crypto[vp(0x84)](new Uint8Array(0x1))[0x0] & (0xf >> (rv / 0x4))))[
            vp(0x4d3)
          ](0x10)
        );
      };
    var hW = ![];
    function hX() {
      const vq = us;
      console[vq(0xb12)](vq(0x402)), ie();
      hack.preload();
    }
    var hY = document[us(0x8c1)](us(0xb73));
    function hZ() {
      const vr = us;
      hY[vr(0x6fc)][vr(0x9a7)] = vr(0x4eb);
    }
    var i0 = document[us(0x8c1)](us(0x9c)),
      i1 = document[us(0x8c1)](us(0xbaa)),
      i2 = document[us(0x8c1)](us(0x634)),
      i3 = document[us(0x8c1)](us(0x21d));
    i3[us(0x21c)] = function () {
      const vs = us;
      !i6 &&
        (window[vs(0x599)][vs(0x2dd)] =
          vs(0x3cf) +
          encodeURIComponent(!window[vs(0x2a7)] ? vs(0x9c8) : vs(0x704)) +
          vs(0x547) +
          encodeURIComponent(btoa(i5)));
    };
    var i4 = document[us(0x8c1)](us(0xc5));
    (i4[us(0x21c)] = function () {
      const vt = us;
      i5 == hD[vt(0x91b)] && delete hD[vt(0x91b)];
      delete hD[vt(0x5fa)];
      if (hU)
        try {
          hU[vt(0xbad)]();
        } catch (rv) {}
    }),
      hZ();
    var i5, i6;
    function i7(rv) {
      const vv = us;
      try {
        let rx = function (ry) {
          const vu = b;
          return ry[vu(0xce2)](/([.*+?\^$(){}|\[\]\/\\])/g, vu(0x284));
        };
        var rw = document[vv(0xa5e)][vv(0xcd5)](
          RegExp(vv(0x90c) + rx(rv) + vv(0x94b))
        );
        return rw ? rw[0x1] : null;
      } catch (ry) {
        return "";
      }
    }
    var i8 = !window[us(0x2a7)];
    function i9(rv) {
      const vw = us;
      try {
        document[vw(0xa5e)] = rv + vw(0x72d) + (i8 ? vw(0xe0) : "");
      } catch (rw) {}
    }
    var ia = 0x0,
      ib;
    function ic() {
      const vx = us;
      (ia = 0x0), (hW = ![]);
      !eV(hD[vx(0x91b)]) && (hD[vx(0x91b)] = crypto[vx(0x1d6)]());
      (i5 = hD[vx(0x91b)]), (i6 = hD[vx(0x5fa)]);
      !i6 &&
        ((i6 = i7(vx(0x5fa))),
        i6 && (i6 = decodeURIComponent(i6)),
        i9(vx(0x5fa)));
      if (i6)
        try {
          const rv = i6;
          i6 = JSON[vx(0x681)](decodeURIComponent(escape(atob(rv))));
          if (eV(i6[vx(0x13e)]))
            (i5 = i6[vx(0x13e)]),
              i1[vx(0xc86)](vx(0x2dc), i6[vx(0xb65)]),
              i6[vx(0xbe3)] &&
                (i2[vx(0x6fc)][vx(0x1c9)] = vx(0x810) + i6[vx(0xbe3)] + ")"),
              (hD[vx(0x5fa)] = rv);
          else throw new Error(vx(0x2d5));
        } catch (rw) {
          (i6 = null), delete hD[vx(0x5fa)], console[vx(0x7d7)](vx(0x973) + rw);
        }
      ib = hD[vx(0x5ed)] || "";
    }
    function ie() {
      ic(), ii();
    }
    function ig() {
      const vy = us,
        rv = [
          vy(0x302),
          vy(0x926),
          vy(0x660),
          vy(0x5a7),
          vy(0x128),
          vy(0x7f7),
          vy(0xa6c),
          vy(0xd62),
          vy(0x35c),
          vy(0x3d1),
          vy(0x4fb),
          vy(0xd50),
          vy(0x3ec),
          vy(0xbff),
          vy(0x142),
          vy(0x804),
          vy(0x9be),
          vy(0x9b2),
          vy(0xc07),
          vy(0x47b),
          vy(0x7e0),
          vy(0x7fd),
          vy(0x858),
          vy(0xba8),
          vy(0xa4f),
          vy(0xa1),
          vy(0x1e1),
          vy(0x8a7),
          vy(0x444),
          vy(0x345),
          vy(0x220),
          vy(0x598),
          vy(0xbeb),
          vy(0x911),
          vy(0x658),
          vy(0xbef),
          vy(0x5cd),
          vy(0x2cd),
          vy(0x11f),
          vy(0x229),
          vy(0x193),
          vy(0x8d1),
          vy(0x6f5),
          vy(0x4d8),
          vy(0xcc5),
          vy(0x14b),
          vy(0xaa5),
          vy(0x79),
          vy(0xb1c),
          vy(0x5d3),
          vy(0x8a0),
          vy(0x1a4),
          vy(0xc5a),
          vy(0x440),
          vy(0x465),
          vy(0x132),
          vy(0x1e5),
          vy(0x202),
          vy(0xb4b),
          vy(0x6d4),
          vy(0x9f9),
          vy(0x605),
          vy(0xc36),
          vy(0x225),
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
          if (ih[vz(0x2f7)] === void 0x0) {
            var rB = function (rG) {
              const vA = vz,
                rH = vA(0x37a);
              let rI = "",
                rJ = "";
              for (
                let rK = 0xc6a + -0x161c + -0x22 * -0x49,
                  rL,
                  rM,
                  rN = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rM = rG[vA(0x75e)](rN++));
                ~rM &&
                ((rL =
                  rK % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? rL * (0x2422 + -0x5 * 0x38b + -0x122b) + rM
                    : rM),
                rK++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rI += String[vA(0x9a6)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (rL >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rK) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rM = rH[vA(0x79e)](rM);
              }
              for (
                let rO = 0x23d0 + 0x13 * -0xdf + -0x1343, rP = rI[vA(0x680)];
                rO < rP;
                rO++
              ) {
                rJ +=
                  "%" +
                  ("00" +
                    rI[vA(0xb23)](rO)[vA(0x4d3)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vA(0x761)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
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
                  (rJ + rI[rM] + rH[vB(0xb23)](rM % rH[vB(0x680)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rK = rI[rM]),
                  (rI[rM] = rI[rJ]),
                  (rI[rJ] = rK);
              }
              (rM = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rJ = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rN = -0x1d30 + -0x23c8 + 0x40f8;
                rN < rG[vB(0x680)];
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
                  (rL += String[vB(0x9a6)](
                    rG[vB(0xb23)](rN) ^
                      rI[(rI[rM] + rI[rJ]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return rL;
            };
            (ih[vz(0x15b)] = rF), (rv = arguments), (ih[vz(0x2f7)] = !![]);
          }
          const rC = rx[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rD = ry + rC,
            rE = rv[rD];
          return (
            !rE
              ? (ih[vz(0x88)] === void 0x0 && (ih[vz(0x88)] = !![]),
                (rA = ih[vz(0x15b)](rA, rz)),
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
            (parseInt(rx(0x1a1, 0x1b2, 0x1a9, 0x1b7, vC(0x5d6))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rz(-0x105, -0x12e, -0x131, vC(0x5d6), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(rx(0x1b5, 0x1c9, 0x1b1, 0x1cb, vC(0x464))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rz(-0x128, -0x132, -0x134, vC(0x32a), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rz(-0x131, -0x155, -0x130, vC(0x972), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rA(0x9a, 0xb1, 0xb2, vC(0x464), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(rx(0x1b5, 0x1d3, 0x1bc, 0x1d1, vC(0x7ba))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rA(0xb2, 0xbe, 0xb9, vC(0x633), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(rx(0x183, 0x1ae, 0x197, 0x19e, vC(0x825))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rC(-0x244, -0x216, -0x232, -0x217, vC(0x5c5))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rz(-0x126, -0x10f, -0x13a, vC(0xb42), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rC(-0x203, -0x209, -0x200, -0x1e1, vC(0x7e))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rD === rw) break;
          else rB[vC(0x46a)](rB[vC(0x43f)]());
        } catch (rE) {
          rB[vC(0x46a)](rB[vC(0x43f)]());
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
            ry(vD(0x32a), -0x130, -0x106, -0x11f, -0x11d) +
            ry(vD(0x3df), -0x11a, -0x142, -0x138, -0x135),
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
        rv[rx(-0x27e, -0x274, -0x265, vD(0xc9b), -0x274)](
          typeof window,
          rv[rz(vD(0xc65), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        rv[rB(-0x17d, -0x171, -0x181, vD(0x570), -0x16a)](
          typeof ki,
          rv[rx(-0x25a, -0x263, -0x26c, vD(0x3df), -0x270)]
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
      const rA = rw[rz(vD(0x633), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function rB(rH, rI, rJ, rK, rL) {
        return ih(rH - -0x20a, rK);
      }
      const rC = rv[rE(0x43a, vD(0x218), 0x40e, 0x428, 0x430)](
        ij,
        rv[rx(-0x28e, -0x27f, -0x272, vD(0x570), -0x281)](
          rv[ry(vD(0x867), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rA
          ),
          ib[ry(vD(0xa85), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rD = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rC[
        ry(vD(0x64f), -0x11e, -0x149, -0x131, -0x13c) +
          rB(-0x172, -0x16e, -0x175, vD(0xc65), -0x166)
      ](rD++, cI[rB(-0x18e, -0x16e, -0x17a, vD(0x32a), -0x1a6)]),
        rC[
          rE(0x415, vD(0x8fd), 0x44c, 0x433, 0x422) +
            rz(vD(0x427), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rD, cJ),
        (rD += -0x3dd + -0x6b5 + 0xa94);
      function rE(rH, rI, rJ, rK, rL) {
        return ih(rK - 0x3a2, rI);
      }
      const rF = rv[rE(0x43c, vD(0x65e), 0x43b, 0x446, 0x459)](
        rv[rx(-0x283, -0x272, -0x298, vD(0xb8), -0x26e)](
          cJ,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let rH = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        rv[rz(vD(0xd07), 0x200, 0x1fc, 0x1fc, 0x1e5)](rH, rA);
        rH++
      ) {
        rC[
          rx(-0x287, -0x273, -0x27d, vD(0xc65), -0x27c) +
            rz(vD(0xe5), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rD++,
          rv[rz(vD(0xc84), 0x201, 0x215, 0x21c, 0x1fc)](
            rw[
              ry(vD(0x589), -0x11c, -0x130, -0x128, -0x13b) +
                rx(-0x289, -0x29c, -0x26a, vD(0xa85), -0x290)
            ](
              rv[ry(vD(0xbe4), -0x13a, -0x124, -0x111, -0x120)](
                rv[ry(vD(0xc9b), -0x10d, -0x119, -0x108, -0x128)](rA, rH),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rF
          )
        );
      }
      if (ib) {
        const rI = ib[rz(vD(0x570), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rJ = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          rv[rz(vD(0xd37), 0x21f, 0x216, 0x204, 0x200)](rJ, rI);
          rJ++
        ) {
          rC[
            rz(vD(0x427), 0x207, 0x20e, 0x209, 0x202) +
              rz(vD(0x589), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rD++,
            rv[rx(-0x25b, -0x256, -0x24f, vD(0xa0d), -0x261)](
              ib[
                rx(-0x267, -0x256, -0x25e, vD(0x59e), -0x271) +
                  rE(0x412, vD(0x589), 0x411, 0x421, 0x425)
              ](
                rv[rE(0x435, vD(0x5d6), 0x427, 0x434, 0x41a)](
                  rv[ry(vD(0xb0a), -0x143, -0x134, -0x133, -0x137)](rI, rJ),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rF
            )
          );
        }
      }
      const rG = rC[
        rE(0x423, vD(0x32a), 0x44b, 0x440, 0x45a) +
          rx(-0x280, -0x27d, -0x26e, vD(0x427), -0x288)
      ](
        rv[rB(-0x162, -0x164, -0x161, vD(0x3df), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          rv[rE(0x429, vD(0x6cf), 0x43d, 0x437, 0x44b)](
            rv[ry(vD(0x825), -0x10d, -0x127, -0x124, -0x116)](
              cJ,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rA
          )
        )
      );
      rv[rE(0x435, vD(0x707), 0x43b, 0x42a, 0x448)](il, rC), (ia = rG);
    }
    function ij(rv) {
      return new DataView(new ArrayBuffer(rv));
    }
    function ik() {
      const vE = us;
      return hU && hU[vE(0x53d)] === WebSocket[vE(0x7af)];
    }
    function il(rv) {
      const vF = us;
      if (ik()) {
        pB += rv[vF(0xbc8)];
        if (hW) {
          const rw = new Uint8Array(rv[vF(0x9bc)]);
          for (let rz = 0x0; rz < rw[vF(0x680)]; rz++) {
            rw[rz] ^= ia;
          }
          const rx = cJ % rw[vF(0x680)],
            ry = rw[0x0];
          (rw[0x0] = rw[rx]), (rw[rx] = ry);
        }
        hU[vF(0xcc9)](rv);
      }
    }
    function im(rv, rw = 0x1) {
      const vG = us;
      let rx = eU(rv);
      const ry = new Uint8Array([
        cI[vG(0x982)],
        rx,
        Math[vG(0xbb8)](rw * 0xff),
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
          vH(0x781),
          vH(0x55e),
          vH(0xc0a),
          vH(0xc52),
          vH(0x716),
          vH(0x1f0),
          vH(0x85a),
          vH(0x294),
          vH(0x35d),
          vH(0x549),
          vH(0x2d3),
          vH(0x9a8),
          vH(0xb45),
          vH(0x2ac),
          vH(0x38b),
          vH(0x5aa),
          vH(0x8e0),
          vH(0x69d),
          vH(0xcb0),
          vH(0x6c4),
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
          else ry[vI(0x46a)](ry[vI(0x43f)]());
        } catch (rE) {
          ry[vI(0x46a)](ry[vI(0x43f)]());
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
        (kk[vJ(0x511)] = vJ(0x31f) + rv + vJ(0x55c) + rw + vJ(0xad0)),
        kk[vJ(0x188)](hY),
        (hY[vJ(0x6fc)][vJ(0x9a7)] = ""),
        (i3[vJ(0x6fc)][vJ(0x9a7)] = vJ(0x4eb)),
        (i0[vJ(0x6fc)][vJ(0x9a7)] = vJ(0x4eb)),
        (hY[vJ(0x8c1)](vJ(0x331))[vJ(0x6fc)][vJ(0xb5d)] = "0"),
        document[vJ(0xc39)][vJ(0x7d8)][vJ(0x256)](vJ(0x9aa)),
        (kk[vJ(0x6fc)][vJ(0x9a7)] = ""),
        (kl[vJ(0x6fc)][vJ(0x9a7)] =
          kn[vJ(0x6fc)][vJ(0x9a7)] =
          km[vJ(0x6fc)][vJ(0x9a7)] =
          kC[vJ(0x6fc)][vJ(0x9a7)] =
            vJ(0x4eb));
      const ry = document[vJ(0x8c1)](vJ(0x568));
      document[vJ(0x8c1)](vJ(0x8d2))[vJ(0x21c)] = function () {
        rB();
      };
      let rz = rx;
      k8(ry, vJ(0x1c2) + rz + vJ(0xf8));
      const rA = setInterval(() => {
        const vK = vJ;
        rz--, rz <= 0x0 ? rB() : k8(ry, vK(0x1c2) + rz + vK(0xf8));
      }, 0x3e8);
      function rB() {
        const vL = vJ;
        clearInterval(rA), k8(ry, vL(0x293)), location[vL(0x722)]();
      }
    }
    function iu() {
      const vM = us;
      if (hU) {
        hU[vM(0xbdf)] = hU[vM(0x73f)] = hU[vM(0x30a)] = null;
        try {
          hU[vM(0xbad)]();
        } catch (rv) {}
        hU = null;
      }
    }
    var iv = {},
      iw = [],
      ix,
      iy,
      iz = [],
      iA = us(0x729);
    function iB() {
      const vN = us;
      iA = getComputedStyle(document[vN(0xc39)])[vN(0x186)];
    }
    var iC = document[us(0x8c1)](us(0x9e2)),
      iD = document[us(0x8c1)](us(0x45e)),
      iE = document[us(0x8c1)](us(0xc1b)),
      iF = [],
      iG = [],
      iH = ![],
      iI = 0x0;
    function iJ(rv) {
      const vO = us;
      if (rv < 0.01) return "0";
      rv = Math[vO(0xbb8)](rv);
      if (rv >= 0x3b9aca00)
        return parseFloat((rv / 0x3b9aca00)[vO(0x303)](0x2)) + "b";
      else {
        if (rv >= 0xf4240)
          return parseFloat((rv / 0xf4240)[vO(0x303)](0x2)) + "m";
        else {
          if (rv >= 0x3e8)
            return parseFloat((rv / 0x3e8)[vO(0x303)](0x1)) + "k";
        }
      }
      return rv;
    }
    function iK(rv, rw) {
      const vP = us,
        rx = document[vP(0xa1f)](vP(0x2a4));
      rx[vP(0x623)] = vP(0x17b);
      const ry = document[vP(0xa1f)](vP(0x2a4));
      (ry[vP(0x623)] = vP(0x6f9)), rx[vP(0x188)](ry);
      const rz = document[vP(0xa1f)](vP(0x42b));
      rx[vP(0x188)](rz), iC[vP(0x188)](rx);
      const rA = {};
      (rA[vP(0x9ca)] = rv),
        (rA[vP(0x407)] = rw),
        (rA[vP(0x27a)] = 0x0),
        (rA[vP(0xd60)] = 0x0),
        (rA[vP(0x1cb)] = 0x0),
        (rA["el"] = rx),
        (rA[vP(0xd1c)] = ry),
        (rA[vP(0x3d6)] = rz);
      const rB = rA;
      (rB[vP(0x8b)] = iG[vP(0x680)]),
        (rB[vP(0xb50)] = function () {
          const vQ = vP;
          (this[vQ(0x27a)] = pt(this[vQ(0x27a)], this[vQ(0x407)], 0x64)),
            (this[vQ(0x1cb)] = pt(this[vQ(0x1cb)], this[vQ(0xd60)], 0x64)),
            this[vQ(0x3d6)][vQ(0xc86)](
              vQ(0x2dc),
              (this[vQ(0x9ca)] ? this[vQ(0x9ca)] + vQ(0xb48) : "") +
                iJ(this[vQ(0x27a)])
            ),
            (this[vQ(0xd1c)][vQ(0x6fc)][vQ(0x977)] = this[vQ(0x1cb)] + "%");
        }),
        rB[vP(0xb50)](),
        iG[vP(0x46a)](rB);
    }
    function iL(rv) {
      const vR = us;
      if (iG[vR(0x680)] === 0x0) return;
      const rw = iG[0x0];
      rw[vR(0xd60)] = rw[vR(0x1cb)] = 0x64;
      for (let rx = 0x1; rx < iG[vR(0x680)]; rx++) {
        const ry = iG[rx];
        (ry[vR(0xd60)] =
          Math[vR(0xd23)](
            0x1,
            rw[vR(0x407)] === 0x0 ? 0x1 : ry[vR(0x407)] / rw[vR(0x407)]
          ) * 0x64),
          rv && (ry[vR(0x1cb)] = ry[vR(0xd60)]),
          iC[vR(0x188)](ry["el"]);
      }
    }
    function iM(rv) {
      const vS = us,
        rw = new Path2D();
      rw[vS(0xbd5)](...rv[vS(0x76a)][0x0]);
      for (let rx = 0x0; rx < rv[vS(0x76a)][vS(0x680)] - 0x1; rx++) {
        const ry = rv[vS(0x76a)][rx],
          rz = rv[vS(0x76a)][rx + 0x1];
        let rA = 0x0;
        const rB = rz[0x0] - ry[0x0],
          rC = rz[0x1] - ry[0x1],
          rD = Math[vS(0xd2c)](rB, rC);
        while (rA < rD) {
          rw[vS(0x6e1)](
            ry[0x0] + (rA / rD) * rB + (Math[vS(0xba1)]() * 0x2 - 0x1) * 0x32,
            ry[0x1] + (rA / rD) * rC + (Math[vS(0xba1)]() * 0x2 - 0x1) * 0x32
          ),
            (rA += Math[vS(0xba1)]() * 0x28 + 0x1e);
        }
        rw[vS(0x6e1)](...rz);
      }
      rv[vS(0x5e7)] = rw;
    }
    var iN = 0x0,
      iO = 0x0,
      iP = [],
      iQ = {},
      iR = [],
      iS = {};
    function iT(rv, rw) {
      const vT = us;
      if (!p8[vT(0x7de)]) return;
      var baseHP = getHP(rv, hack.moblst);
      var decDmg = rv['nHealth'] - rw;
      var dmg = Math.floor(decDmg * 10000) / 100 + '%';
      if(baseHP && hack.isEnabled('DDenableNumber')) var dmg = Math.floor(decDmg * baseHP);
      let rx;
      const ry = rw === void 0x0;
      !ry && (rx = Math[vT(0x260)]((rv[vT(0xca6)] - rw) * 0x64) || 0x1),
        iz[vT(0x46a)]({
          text: hack.isEnabled('damageDisplay') ? dmg : rx,
          x: rv["x"] + (Math[vT(0xba1)]() * 0x2 - 0x1) * rv[vT(0xc80)] * 0.6,
          y: rv["y"] + (Math[vT(0xba1)]() * 0x2 - 0x1) * rv[vT(0xc80)] * 0.6,
          vx: (Math[vT(0xba1)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[vT(0xba1)]() * 0x3,
          angle: (Math[vT(0xba1)]() * 0x2 - 0x1) * (ry ? 0x1 : 0.1),
          size: Math[vT(0x137)](0x1, (rv[vT(0xc80)] * 0.2) / 0x14),
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
        rw[vU(0x8ee)] = !![];
        if (
          Math[vU(0xb59)](rw["nx"] - iU) > iW + rw[vU(0x10b)] ||
          Math[vU(0xb59)](rw["ny"] - iV) > iX + rw[vU(0x10b)]
        )
          rw[vU(0x373)] = 0xa;
        else !rw[vU(0xd57)] && iT(rw, 0x0);
        delete iv[rv];
      }
    }
    var iZ = [
      us(0xb1d),
      us(0x56f),
      us(0xc03),
      us(0x138),
      us(0x522),
      us(0x792),
      us(0xc02),
      us(0x3da),
      us(0x8f7),
      us(0x105),
      us(0x504),
      us(0xaee),
      us(0x845),
    ];
    function j0(rv, rw = iy) {
      const vV = us;
      (rv[vV(0xb1d)] = rw[vV(0xb1d)]),
        (rv[vV(0x56f)] = rw[vV(0x56f)]),
        (rv[vV(0xc03)] = rw[vV(0xc03)]),
        (rv[vV(0x138)] = rw[vV(0x138)]),
        (rv[vV(0x522)] = rw[vV(0x522)]),
        (rv[vV(0x792)] = rw[vV(0x792)]),
        (rv[vV(0xc02)] = rw[vV(0xc02)]),
        (rv[vV(0x3da)] = rw[vV(0x3da)]),
        (rv[vV(0x8f7)] = rw[vV(0x8f7)]),
        (rv[vV(0x105)] = rw[vV(0x105)]),
        (rv[vV(0x7d)] = rw[vV(0x7d)]),
        (rv[vV(0x504)] = rw[vV(0x504)]),
        (rv[vV(0x63c)] = rw[vV(0x63c)]),
        (rv[vV(0xaee)] = rw[vV(0xaee)]),
        (rv[vV(0x845)] = rw[vV(0x845)]);
    }
    function j1() {
      (oW = null), p4(null), (p0 = null), (oY = ![]), (oZ = 0x0), oi && pJ();
    }
    var j2 = 0x64,
      j3 = 0x1,
      j4 = 0x64,
      j5 = 0x1,
      j6 = {},
      j7 = [...Object[us(0x24a)](d9)],
      j8 = [...hQ];
    ja(j7),
      ja(j8),
      j7[us(0x46a)](us(0x86f)),
      j8[us(0x46a)](hP[us(0xb4d)] || us(0x81c)),
      j7[us(0x46a)](us(0x696)),
      j8[us(0x46a)](us(0x3c2));
    var j9 = [];
    for (let rv = 0x0; rv < j7[us(0x680)]; rv++) {
      const rw = d9[j7[rv]] || 0x0;
      j9[rv] = 0x78 + (rw - d9[us(0x286)]) * 0x3c - 0x1 + 0x1;
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
          vW(0x6fe) + j7[rx] + vW(0x9f7) + ry + vW(0x38e) + ry + vW(0xc13)
        ),
        rA = rz[vW(0x8c1)](vW(0x152));
      (j6 = {
        id: rx,
        el: rz,
        state: cT[vW(0x4eb)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rz[vW(0x8c1)](vW(0x543)),
        progressEl: rA,
        barEl: rA[vW(0x8c1)](vW(0x8e8)),
        textEl: rA[vW(0x8c1)](vW(0x42b)),
        nameEl: rz[vW(0x8c1)](vW(0x739)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const vX = vW,
            rB = Math[vX(0xd23)](0x1, (pM - this[vX(0xc6)]) / 0x64);
          this[vX(0x8f9)] =
            this[vX(0x7f1)] + (this[vX(0xbf8)] - this[vX(0x7f1)]) * rB;
          const rC = this[vX(0x8f9)] - 0x1;
          this[vX(0xd1c)][vX(0x6fc)][vX(0xc74)] =
            vX(0x4d9) + rC * 0x64 + vX(0xd19) + rC + vX(0x98f);
        },
        update() {
          const vY = vW,
            rB = je(this["t"]),
            rC = 0x1 - rB;
          (this["el"][vY(0x6fc)][vY(0xb5d)] = -0xc8 * rC + "px"),
            (this["el"][vY(0x6fc)][vY(0xc74)] = vY(0xd6) + -0x64 * rC + "%)");
        },
        remove() {
          const vZ = vW;
          rz[vZ(0x256)]();
        },
      }),
        (j6[vW(0x379)][vW(0x6fc)][vW(0x9a7)] = vW(0x4eb)),
        jc[vW(0x46a)](j6),
        j6[vW(0xb50)](),
        jb[vW(0x46a)](j6),
        km[vW(0x30f)](rz, pZ);
    }
    function je(rx) {
      return 0x1 - (0x1 - rx) * (0x1 - rx);
    }
    function jf(rx) {
      const w0 = us;
      return rx < 0.5
        ? (0x1 - Math[w0(0xc93)](0x1 - Math[w0(0x45f)](0x2 * rx, 0x2))) / 0x2
        : (Math[w0(0xc93)](0x1 - Math[w0(0x45f)](-0x2 * rx + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jg() {
      const w1 = us;
      (ox[w1(0x511)] = ""), (oz = {});
    }
    var jh = document[us(0x8c1)](us(0x36b));
    jh[us(0x6fc)][us(0x9a7)] = us(0x4eb);
    var ji = document[us(0x8c1)](us(0x670)),
      jj = [],
      jk = document[us(0x8c1)](us(0xce4));
    jk[us(0x9d0)] = function () {
      jl();
    };
    function jl() {
      const w2 = us;
      for (let rx = 0x0; rx < jj[w2(0x680)]; rx++) {
        const ry = jj[rx];
        k8(ry[w2(0x70b)][0x0], jk[w2(0xb54)] ? w2(0xa8f) : ry[w2(0xbfe)]);
      }
    }
    function jm(rx) {
      const w3 = us;
      (jh[w3(0x6fc)][w3(0x9a7)] = ""), (ji[w3(0x511)] = w3(0x1b4));
      const ry = rx[w3(0x680)];
      jj = [];
      for (let rz = 0x0; rz < ry; rz++) {
        const rA = rx[rz];
        ji[w3(0x188)](nN(w3(0x639) + (rz + 0x1) + w3(0x91))), jn(rA);
      }
      m1[w3(0x701)][w3(0x254)]();
    }
    function jn(rx) {
      const w4 = us;
      for (let ry = 0x0; ry < rx[w4(0x680)]; ry++) {
        const rz = rx[ry],
          rA = nN(w4(0x648) + rz + w4(0x4ba));
        (rA[w4(0xbfe)] = rz),
          ry > 0x0 && jj[w4(0x46a)](rA),
          (rA[w4(0x21c)] = function () {
            jp(rz);
          }),
          ji[w4(0x188)](rA);
      }
      jl();
    }
    function jo(rx) {
      const w5 = us;
      var ry = document[w5(0xa1f)](w5(0x471));
      (ry[w5(0x77e)] = rx),
        (ry[w5(0x6fc)][w5(0x209)] = "0"),
        (ry[w5(0x6fc)][w5(0x6ec)] = "0"),
        (ry[w5(0x6fc)][w5(0xccc)] = w5(0x231)),
        document[w5(0xc39)][w5(0x188)](ry),
        ry[w5(0x4de)](),
        ry[w5(0x337)]();
      try {
        var rz = document[w5(0x2e6)](w5(0xb8e)),
          rA = rz ? w5(0x24e) : w5(0x8c5);
      } catch (rB) {}
      document[w5(0xc39)][w5(0x3db)](ry);
    }
    function jp(rx) {
      const w6 = us;
      if (!navigator[w6(0x15d)]) {
        jo(rx);
        return;
      }
      navigator[w6(0x15d)][w6(0x899)](rx)[w6(0x5af)](
        function () {},
        function (ry) {}
      );
    }
    var jq = [
        us(0x169),
        us(0x9ef),
        us(0xd2f),
        us(0x95f),
        us(0x2e5),
        us(0xcb5),
        us(0x330),
        us(0x355),
        us(0x8e7),
        us(0xbea),
        us(0x3eb),
      ],
      jr = [us(0x8cf), us(0x86), us(0xcda)];
    function js(rx) {
      const w7 = us,
        ry = rx ? jr : jq;
      return ry[Math[w7(0x35d)](Math[w7(0xba1)]() * ry[w7(0x680)])];
    }
    function jt(rx) {
      const w8 = us;
      return rx[w8(0xcd5)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var ju = document[us(0x8c1)](us(0x908));
    ju[us(0x21c)] = nt(function (rx) {
      const w9 = us;
      iy && il(new Uint8Array([cI[w9(0xcb2)]]));
    });
    var jv = "";
    function jw(rx) {
      const wa = us;
      return rx[wa(0xce2)](/"/g, wa(0x978));
    }
    function jx(rx) {
      const wb = us;
      let ry = "";
      for (let rz = 0x0; rz < rx[wb(0x680)]; rz++) {
        const [rA, rB, rC] = rx[rz];
        ry +=
          wb(0x1e9) +
          rA +
          "\x22\x20" +
          (rC ? wb(0x760) : "") +
          wb(0x340) +
          jw(rB) +
          wb(0x326);
      }
      return wb(0xbcb) + ry + wb(0x606);
    }
    var jy = ![];
    function jz() {
      const wc = us;
      return nN(wc(0x170) + hP[wc(0x286)] + wc(0x35a));
    }
    var jA = document[us(0x8c1)](us(0x49b));
    function jB() {
      const wd = us;
      (oP[wd(0x6fc)][wd(0x9a7)] = pZ[wd(0x6fc)][wd(0x9a7)] =
        jy ? wd(0x4eb) : ""),
        (jA[wd(0x6fc)][wd(0x9a7)] = ky[wd(0x6fc)][wd(0x9a7)] =
          jy ? "" : wd(0x4eb));
      jy
        ? (kz[wd(0x7d8)][wd(0xab7)](wd(0xda6)),
          k8(kz[wd(0x70b)][0x0], wd(0x985)))
        : (kz[wd(0x7d8)][wd(0x256)](wd(0xda6)),
          k8(kz[wd(0x70b)][0x0], wd(0x129)));
      const rx = [hG, mk];
      for (let ry = 0x0; ry < rx[wd(0x680)]; ry++) {
        const rz = rx[ry];
        rz[wd(0x7d8)][jy ? wd(0xab7) : wd(0x256)](wd(0x1ac)),
          (rz[wd(0x6f7)] = jy ? jz : null),
          (rz[wd(0x643)] = !![]);
      }
      jC[wd(0x6fc)][wd(0x9a7)] = nW[wd(0x6fc)][wd(0x9a7)] = jy ? wd(0x4eb) : "";
    }
    var jC = document[us(0x8c1)](us(0x258)),
      jD = document[us(0x8c1)](us(0x496)),
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
      for (let rA = jL[we(0x680)] - 0x1; rA >= 0x0; rA--) {
        const rB = jL[rA];
        if (nv(rx, rB) > 0.7) {
          rz++;
          if (rz >= 0x5) return ![];
        }
      }
      return jL[we(0x46a)](rx), !![];
    }
    var jO = document[us(0x8c1)](us(0xd94)),
      jP = document[us(0x8c1)](us(0x357)),
      jQ = document[us(0x8c1)](us(0x6ea)),
      jR = document[us(0x8c1)](us(0xd43)),
      jS;
    k8(jQ, "-"),
      (jQ[us(0x21c)] = function () {
        if (jS) mv(jS);
      });
    var jT = 0x0,
      jU = document[us(0x8c1)](us(0xda3));
    setInterval(() => {
      const wf = us;
      jT--;
      if (jT < 0x0) {
        jU[wf(0x7d8)][wf(0x7a1)](wf(0x254)) &&
          hW &&
          il(new Uint8Array([cI[wf(0x141)]]));
        return;
      }
      jV();
    }, 0x3e8);
    function jV() {
      k8(jR, ka(jT * 0x3e8));
    }
    function jW() {
      const wg = us,
        rx = document[wg(0x8c1)](wg(0xb80))[wg(0x70b)],
        ry = document[wg(0x8c1)](wg(0x3f1))[wg(0x70b)];
      for (let rz = 0x0; rz < rx[wg(0x680)]; rz++) {
        const rA = rx[rz],
          rB = ry[rz];
        rA[wg(0x21c)] = function () {
          const wh = wg;
          for (let rC = 0x0; rC < ry[wh(0x680)]; rC++) {
            const rD = rz === rC;
            (ry[rC][wh(0x6fc)][wh(0x9a7)] = rD ? "" : wh(0x4eb)),
              rx[rC][wh(0x7d8)][rD ? wh(0xab7) : wh(0x256)](wh(0xb21));
          }
        };
      }
      rx[0x0][wg(0x21c)]();
    }
    jW();
    var jX = [];
    function jY(rx) {
      const wi = us;
      rx[wi(0x7d8)][wi(0xab7)](wi(0x487)), jX[wi(0x46a)](rx);
    }
    var jZ,
      k0 = document[us(0x8c1)](us(0x7fc));
    function k1(rx, ry = !![]) {
      const wj = us;
      if (ry) {
        if (pM < jG) {
          jH[wj(0x46a)](rx);
          return;
        } else {
          if (jH[wj(0x680)] > 0x0)
            while (jH[wj(0x680)] > 0x0) {
              k1(jH[wj(0x43f)](), ![]);
            }
        }
      }
      function rz() {
        const wk = wj,
          rL = rI[wk(0xb7b)](rJ++),
          rM = new Uint8Array(rL);
        for (let rN = 0x0; rN < rL; rN++) {
          rM[rN] = rI[wk(0xb7b)](rJ++);
        }
        return new TextDecoder()[wk(0x159)](rM);
      }
      function rA() {
        const wl = wj;
        return rI[wl(0xb7b)](rJ++) / 0xff;
      }
      function rB(rL) {
        const wm = wj,
          rM = rI[wm(0x5db)](rJ);
        (rJ += 0x2),
          (rL[wm(0xc16)] = rM & 0x1),
          (rL[wm(0xb1d)] = rM & 0x2),
          (rL[wm(0x56f)] = rM & 0x4),
          (rL[wm(0xc03)] = rM & 0x8),
          (rL[wm(0x138)] = rM & 0x10),
          (rL[wm(0x522)] = rM & 0x20),
          (rL[wm(0x792)] = rM & 0x40),
          (rL[wm(0xc02)] = rM & 0x80),
          (rL[wm(0x3da)] = rM & 0x100),
          (rL[wm(0x8f7)] = rM & (0x1 << 0x9)),
          (rL[wm(0x105)] = rM & (0x1 << 0xa)),
          (rL[wm(0x7d)] = rM & (0x1 << 0xb)),
          (rL[wm(0x504)] = rM & (0x1 << 0xc)),
          (rL[wm(0x63c)] = rM & (0x1 << 0xd)),
          (rL[wm(0xaee)] = rM & (0x1 << 0xe)),
          (rL[wm(0x845)] = rM & (0x1 << 0xf));
      }
      function rC() {
        const wn = wj,
          rL = rI[wn(0x443)](rJ);
        rJ += 0x4;
        const rM = rz();
        iK(rM, rL);
      }
      function rD() {
        const wo = wj,
          rL = rI[wo(0x5db)](rJ) - cG;
        return (rJ += 0x2), rL;
      }
      function rE() {
        const wp = wj,
          rL = {};
        for (let rW in mo) {
          (rL[rW] = rI[wp(0x443)](rJ)), (rJ += 0x4);
        }
        const rM = rz(),
          rN = Number(rI[wp(0x191)](rJ));
        rJ += 0x8;
        const rO = d5(d4(rN)[0x0]),
          rP = rO * 0x2,
          rQ = Array(rP);
        for (let rX = 0x0; rX < rP; rX++) {
          const rY = rI[wp(0x5db)](rJ) - 0x1;
          rJ += 0x2;
          if (rY < 0x0) continue;
          rQ[rX] = dC[rY];
        }
        const rR = [],
          rS = rI[wp(0x5db)](rJ);
        rJ += 0x2;
        for (let rZ = 0x0; rZ < rS; rZ++) {
          const s0 = rI[wp(0x5db)](rJ);
          rJ += 0x2;
          const s1 = rI[wp(0x443)](rJ);
          (rJ += 0x4), rR[wp(0x46a)]([dC[s0], s1]);
        }
        const rT = [],
          rU = rI[wp(0x5db)](rJ);
        rJ += 0x2;
        for (let s2 = 0x0; s2 < rU; s2++) {
          const s3 = rI[wp(0x5db)](rJ);
          (rJ += 0x2), !eK[s3] && console[wp(0xb12)](s3), rT[wp(0x46a)](eK[s3]);
        }
        const rV = rI[wp(0xb7b)](rJ++);
        mt(rM, rL, rR, rT, rN, rQ, rV);
      }
      function rF() {
        const wq = wj,
          rL = Number(rI[wq(0x191)](rJ));
        return (rJ += 0x8), rL;
      }
      function rG() {
        const wr = wj,
          rL = rI[wr(0x443)](rJ);
        rJ += 0x4;
        const rM = rI[wr(0xb7b)](rJ++),
          rN = {};
        (rN[wr(0x7ee)] = rL), (rN[wr(0x506)] = {});
        const rO = rN;
        f3[wr(0x78e)]((rQ, rR) => {
          const ws = wr;
          rO[ws(0x506)][rQ] = [];
          for (let rS = 0x0; rS < rM; rS++) {
            const rT = rz();
            let rU;
            rQ === "xp" ? (rU = rF()) : ((rU = rI[ws(0x443)](rJ)), (rJ += 0x4)),
              rO[ws(0x506)][rQ][ws(0x46a)]([rT, rU]);
          }
        }),
          k8(jD, k9(rO[wr(0x7ee)]) + wr(0xb6b)),
          (mA[wr(0x511)] = "");
        let rP = 0x0;
        for (let rQ in rO[wr(0x506)]) {
          const rR = kd(rQ),
            rS = rO[wr(0x506)][rQ],
            rT = nN(wr(0x338) + rP + wr(0x3fe) + rR + wr(0x9bf)),
            rU = rT[wr(0x8c1)](wr(0x22b));
          for (let rV = 0x0; rV < rS[wr(0x680)]; rV++) {
            const [rW, rX] = rS[rV];
            let rY = mn(rQ, rX);
            rQ === "xp" && (rY += wr(0x4dd) + (d4(rX)[0x0] + 0x1) + ")");
            const rZ = nN(
              wr(0x925) + (rV + 0x1) + ".\x20" + rW + wr(0x853) + rY + wr(0x2d4)
            );
            (rZ[wr(0x21c)] = function () {
              mv(rW);
            }),
              rU[wr(0x826)](rZ);
          }
          mA[wr(0x826)](rT), rP++;
        }
      }
      function rH() {
        const wt = wj;
        (jS = rz()), k8(jQ, jS || "-");
        const rL = Number(rI[wt(0x191)](rJ));
        (rJ += 0x8),
          (jT = Math[wt(0xbb8)]((rL - Date[wt(0x213)]()) / 0x3e8)),
          jV();
        const rM = rI[wt(0x5db)](rJ);
        rJ += 0x2;
        if (rM === 0x0) jP[wt(0x511)] = wt(0x4d2);
        else {
          jP[wt(0x511)] = "";
          for (let rO = 0x0; rO < rM; rO++) {
            const rP = rz(),
              rQ = rI[wt(0x651)](rJ);
            rJ += 0x4;
            const rR = rQ * 0x64,
              rS = rR >= 0x1 ? rR[wt(0x303)](0x2) : rR[wt(0x303)](0x5),
              rT = nN(
                wt(0x4d7) +
                  (rO + 0x1) +
                  ".\x20" +
                  rP +
                  wt(0x5c7) +
                  rS +
                  wt(0xdd)
              );
            rP === jv && rT[wt(0x7d8)][wt(0xab7)]("me"),
              (rT[wt(0x21c)] = function () {
                mv(rP);
              }),
              jP[wt(0x188)](rT);
          }
        }
        k0[wt(0x511)] = "";
        const rN = rI[wt(0x5db)](rJ);
        (rJ += 0x2), (jZ = {});
        if (rN === 0x0)
          (jO[wt(0x511)] = wt(0x4d6)), (k0[wt(0x6fc)][wt(0x9a7)] = wt(0x4eb));
        else {
          const rU = {};
          jO[wt(0x511)] = "";
          for (let rV = 0x0; rV < rN; rV++) {
            const rW = rI[wt(0x5db)](rJ);
            rJ += 0x2;
            const rX = rI[wt(0x443)](rJ);
            (rJ += 0x4), (jZ[rW] = rX);
            const rY = dC[rW],
              rZ = nN(
                wt(0x755) +
                  rY[wt(0x3ac)] +
                  wt(0x593) +
                  qx(rY) +
                  wt(0x75a) +
                  rX +
                  wt(0x460)
              );
            (rZ[wt(0x41f)] = jU),
              jY(rZ),
              (rZ[wt(0x6f7)] = rY),
              jO[wt(0x188)](rZ),
              (rU[rY[wt(0x3ac)]] = (rU[rY[wt(0x3ac)]] || 0x0) + rX);
          }
          oa(jO), (k0[wt(0x6fc)][wt(0x9a7)] = ""), oB(k0, rU);
        }
      }
      const rI = new DataView(rx[wj(0x5b2)]);
      pB += rI[wj(0xbc8)];
      let rJ = 0x0;
      const rK = rI[wj(0xb7b)](rJ++);
      switch (rK) {
        case cI[wj(0x4a8)]:
          {
            const s6 = rI[wj(0x5db)](rJ);
            rJ += 0x2;
            for (let s7 = 0x0; s7 < s6; s7++) {
              const s8 = rI[wj(0x5db)](rJ);
              rJ += 0x2;
              const s9 = rI[wj(0x443)](rJ);
              (rJ += 0x4), n3(s8, s9);
            }
          }
          break;
        case cI[wj(0xc05)]:
          rH();
          break;
        case cI[wj(0xb81)]:
          kC[wj(0x7d8)][wj(0xab7)](wj(0x254)), hT(), (jG = pM + 0x1f4);
          break;
        case cI[wj(0x9b3)]:
          (mi[wj(0x511)] = wj(0x3c7)), mi[wj(0x188)](ml), (mm = ![]);
          break;
        case cI[wj(0xa4d)]: {
          const sa = dC[rI[wj(0x5db)](rJ)];
          rJ += 0x2;
          const sb = rI[wj(0x443)](rJ);
          (rJ += 0x4),
            (mi[wj(0x511)] =
              wj(0xcf0) +
              sa[wj(0x3ac)] +
              "\x22\x20" +
              qx(sa) +
              wj(0x75a) +
              k9(sb) +
              wj(0x80e));
          const sc = mi[wj(0x8c1)](wj(0x7a2));
          (sc[wj(0x6f7)] = sa),
            (sc[wj(0x21c)] = function () {
              const wu = wj;
              n3(sa["id"], sb), (this[wu(0x21c)] = null), ml[wu(0x21c)]();
            }),
            (mm = ![]);
          break;
        }
        case cI[wj(0xc7f)]: {
          const sd = rI[wj(0xb7b)](rJ++),
            se = rI[wj(0x443)](rJ);
          rJ += 0x4;
          const sf = rz();
          (mi[wj(0x511)] =
            wj(0xbf9) +
            sf +
            wj(0x9f7) +
            hP[wj(0xa26)] +
            wj(0x877) +
            k9(se) +
            "\x20" +
            hN[sd] +
            wj(0x9f7) +
            hQ[sd] +
            wj(0x56c)),
            (mi[wj(0x8c1)](wj(0x57c))[wj(0x21c)] = function () {
              mv(sf);
            }),
            mi[wj(0x188)](ml),
            (mm = ![]);
          break;
        }
        case cI[wj(0x2b5)]:
          (mi[wj(0x511)] = wj(0xc58)), mi[wj(0x188)](ml), (mm = ![]);
          break;
        case cI[wj(0x317)]:
          hK(wj(0x5cb));
          break;
        case cI[wj(0x205)]:
          rG();
          break;
        case cI[wj(0x95c)]:
          hK(wj(0x752)), hc(wj(0x752));
          break;
        case cI[wj(0x38f)]:
          hK(wj(0xa2a)), hc(wj(0x82c));
          break;
        case cI[wj(0x928)]:
          hK(wj(0x9a9));
          break;
        case cI[wj(0x5cc)]:
          rE();
          break;
        case cI[wj(0xa5d)]:
          hc(wj(0x63b));
          break;
        case cI[wj(0xd31)]:
          hc(wj(0xaa0), hP[wj(0xb4d)]), hJ(hH);
          break;
        case cI[wj(0x701)]:
          const rL = rI[wj(0x5db)](rJ);
          rJ += 0x2;
          const rM = [];
          for (let sg = 0x0; sg < rL; sg++) {
            const sh = rI[wj(0x443)](rJ);
            rJ += 0x4;
            const si = rz(),
              sj = rz(),
              sk = rz();
            rM[wj(0x46a)]([si || wj(0x59c) + sh, sj, sk]);
          }
          jm(rM);
          break;
        case cI[wj(0xa9a)]:
          for (let sl in mo) {
            const sm = rI[wj(0x443)](rJ);
            (rJ += 0x4), mp[sl][wj(0x280)](sm);
          }
          break;
        case cI[wj(0x689)]:
          const rN = rI[wj(0xb7b)](rJ++),
            rO = rI[wj(0x443)](rJ++),
            rP = {};
          (rP[wj(0x694)] = rN), (rP[wj(0xf9)] = rO), (p0 = rP);
          break;
        case cI[wj(0xa70)]:
          (i0[wj(0x6fc)][wj(0x9a7)] = i6 ? "" : wj(0x4eb)),
            (i3[wj(0x6fc)][wj(0x9a7)] = !i6 ? "" : wj(0x4eb)),
            (hY[wj(0x6fc)][wj(0x9a7)] = ""),
            (kn[wj(0x6fc)][wj(0x9a7)] = wj(0x4eb)),
            (hW = !![]),
            kB[wj(0x7d8)][wj(0xab7)](wj(0x254)),
            kA[wj(0x7d8)][wj(0x256)](wj(0x254)),
            j1(),
            m0(![]),
            (ix = rI[wj(0x443)](rJ)),
            (rJ += 0x4),
            (jv = rz()),
            hack.player.name = jv,
            hJ(jv),
            (jy = rI[wj(0xb7b)](rJ++)),
            jB(),
            (j2 = rI[wj(0x5db)](rJ)),
            (rJ += 0x2),
            (j5 = rI[wj(0xb7b)](rJ++)),
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
            const so = rI[wj(0x5db)](rJ) - 0x1;
            rJ += 0x2;
            if (so < 0x0) continue;
            iP[sn] = dC[so];
          }
          nI(), nQ();
          const rQ = rI[wj(0x5db)](rJ);
          rJ += 0x2;
          for (let sp = 0x0; sp < rQ; sp++) {
            const sq = rI[wj(0x5db)](rJ);
            rJ += 0x2;
            const sr = nS(eK[sq]);
            sr[wj(0x41f)] = m2;
          }
          iS = {};
          while (rJ < rI[wj(0xbc8)]) {
            const ss = rI[wj(0x5db)](rJ);
            rJ += 0x2;
            const st = rI[wj(0x443)](rJ);
            (rJ += 0x4), (iS[ss] = st);
          }
          o8(), n4();
          break;
        case cI[wj(0xa2)]:
          const rR = rI[wj(0xb7b)](rJ++),
            rS = hL[rR] || wj(0x5b1);
          console[wj(0xb12)](wj(0xb1b) + rS + ")"),
            (kf = rR === cR[wj(0x793)] || rR === cR[wj(0x7b7)]);
          !kf &&
            it(wj(0x6b9), wj(0x9b1) + rS, rR === cR[wj(0xd86)] ? 0xa : 0x3c);
          break;
        case cI[wj(0x5b4)]:
          (hg[wj(0x6fc)][wj(0x9a7)] = kn[wj(0x6fc)][wj(0x9a7)] = wj(0x4eb)),
            kG(!![]),
            ju[wj(0x7d8)][wj(0xab7)](wj(0x254)),
            jg(),
            (pf[wj(0x6fc)][wj(0x9a7)] = "");
          for (let su in iQ) {
            iQ[su][wj(0x4f3)] = 0x0;
          }
          (jI = pM),
            (nl = {}),
            (nd = 0x1),
            (ne = 0x1),
            (nb = 0x0),
            (nc = 0x0),
            mE(),
            (n8 = cY[wj(0x2ee)]),
            (jE = pM);
          break;
        case cI[wj(0xb50)]:
          (pA = pM - jE), (jE = pM), q6[wj(0x280)](rA()), q8[wj(0x280)](rA());
          if (jy) {
            const sv = rI[wj(0xb7b)](rJ++);
            (jJ = sv & 0x80), (jK = f6[sv & 0x7f]);
          } else (jJ = ![]), (jK = null), q9[wj(0x280)](rA());
          (pH = 0x1 + cW[rI[wj(0xb7b)](rJ++)] / 0x64),
            (iW = (d0 / 0x2) * pH),
            (iX = (d1 / 0x2) * pH);
          const rT = rI[wj(0x5db)](rJ);
          rJ += 0x2;
          for (let sw = 0x0; sw < rT; sw++) {
            const sx = rI[wj(0x443)](rJ);
            rJ += 0x4;
            let sy = iv[sx];
            if (sy) {
              if (sy[wj(0xc87)]) {
                sy[wj(0x2e1)] = rI[wj(0xb7b)](rJ++) - 0x1;
                continue;
              }
              const sz = rI[wj(0xb7b)](rJ++);
              sz & 0x1 &&
                ((sy["nx"] = rD()), (sy["ny"] = rD()), (sy[wj(0x612)] = 0x0));
              sz & 0x2 &&
                ((sy[wj(0x75c)] = eS(rI[wj(0xb7b)](rJ++))),
                (sy[wj(0x612)] = 0x0));
              if (sz & 0x4) {
                const sA = rA();
                if (sA < sy[wj(0xca6)]) iT(sy, sA), (sy[wj(0xd78)] = 0x1);
                else sA > sy[wj(0xca6)] && (sy[wj(0xd78)] = 0x0);
                (sy[wj(0xca6)] = sA), (sy[wj(0x612)] = 0x0);
              }
              sz & 0x8 &&
                ((sy[wj(0x59d)] = 0x1),
                (sy[wj(0x612)] = 0x0),
                sy === iy && (ps = 0x1));
              sz & 0x10 && ((sy[wj(0x10b)] = rI[wj(0x5db)](rJ)), (rJ += 0x2));
              sz & 0x20 && (sy[wj(0xca)] = rI[wj(0xb7b)](rJ++));
              sz & 0x40 && rB(sy);
              if (sz & 0x80) {
                if (sy[wj(0x700)])
                  (sy[wj(0x73b)] = rI[wj(0x5db)](rJ)), (rJ += 0x2);
                else {
                  const sB = rA();
                  sB > sy[wj(0x9d5)] && iT(sy), (sy[wj(0x9d5)] = sB);
                }
              }
              sy[wj(0x700)] && sz & 0x4 && (sy[wj(0xb3b)] = rA()),
                (sy["ox"] = sy["x"]),
                (sy["oy"] = sy["y"]),
                (sy[wj(0x4ec)] = sy[wj(0x640)]),
                (sy[wj(0xf3)] = sy[wj(0xca2)]),
                (sy[wj(0xc6f)] = sy[wj(0xc80)]),
                (sy[wj(0x604)] = 0x0);
            } else {
              const sC = rI[wj(0xb7b)](rJ++);
              if (sC === cS[wj(0x616)]) {
                let sH = rI[wj(0xb7b)](rJ++);
                const sI = {};
                (sI[wj(0x76a)] = []), (sI["a"] = 0x1);
                const sJ = sI;
                while (sH--) {
                  const sK = rD(),
                    sL = rD();
                  sJ[wj(0x76a)][wj(0x46a)]([sK, sL]);
                }
                iM(sJ), (ps = 0x1), iF[wj(0x46a)](sJ);
                continue;
              }
              const sD = hM[sC],
                sE = rD(),
                sF = rD(),
                sG = sC === cS[wj(0xa7e)];
              if (sC === cS[wj(0x76b)] || sC === cS[wj(0x554)] || sG) {
                const sM = rI[wj(0x5db)](rJ);
                (rJ += 0x2),
                  (sy = new lK(sC, sx, sE, sF, sM)),
                  sG &&
                    ((sy[wj(0xc87)] = !![]),
                    (sy[wj(0x2e1)] = rI[wj(0xb7b)](rJ++) - 0x1));
              } else {
                if (sC === cS[wj(0x6bb)]) {
                  const sN = rI[wj(0x5db)](rJ);
                  (rJ += 0x2), (sy = new lN(sx, sE, sF, sN));
                } else {
                  const sO = eS(rI[wj(0xb7b)](rJ++)),
                    sP = rI[wj(0x5db)](rJ);
                  rJ += 0x2;
                  if (sC === cS[wj(0x253)]) {
                    const sQ = rA(),
                      sR = rI[wj(0xb7b)](rJ++);
                    (sy = new lT(sx, sE, sF, sO, sQ, sR, sP)),
                      rB(sy),
                      (sy[wj(0x73b)] = rI[wj(0x5db)](rJ)),
                      (rJ += 0x2),
                      (sy[wj(0x9ca)] = rz()),
                      (sy[wj(0x8be)] = rz()),
                      (sy[wj(0xb3b)] = rA());
                    if (ix === sx) iy = sy;
                    else {
                      if (jy) {
                        const sS = pS();
                        (sS[wj(0xa13)] = sy), pK[wj(0x46a)](sS);
                      }
                    }
                  } else {
                    if (sD[wj(0x7cc)](wj(0x6f7)))
                      sy = new lG(sx, sC, sE, sF, sO, sP);
                    else {
                      const sT = rA(),
                        sU = rI[wj(0xb7b)](rJ++),
                        sV = sU >> 0x4,
                        sW = sU & 0x1,
                        sX = sU & 0x2,
                        sY = rA();
                      (sy = new lG(sx, sC, sE, sF, sO, sP, sT)),
                        (sy[wj(0x3ac)] = sV),
                        (sy[wj(0x7b9)] = sW),
                        (sy[wj(0xaee)] = sX),
                        (sy[wj(0x9d5)] = sY),
                        (sy[wj(0x37d)] = hN[sV]);
                    }
                  }
                }
              }
              (iv[sx] = sy), iw[wj(0x46a)](sy);
            }
          }
          iy &&
            ((iU = iy["nx"]),
            (iV = iy["ny"]),
            (q1[wj(0x6fc)][wj(0x9a7)] = ""),
            q3(q1, iy["nx"], iy["ny"]));
          const rU = rI[wj(0x5db)](rJ);
          rJ += 0x2;
          for (let sZ = 0x0; sZ < rU; sZ++) {
            const t0 = rI[wj(0x443)](rJ);
            (rJ += 0x4), iY(t0);
          }
          const rV = rI[wj(0xb7b)](rJ++);
          for (let t1 = 0x0; t1 < rV; t1++) {
            const t2 = rI[wj(0x443)](rJ);
            rJ += 0x4;
            const t3 = iv[t2];
            if (t3) {
              (t3[wj(0x2e9)] = iy), n3(t3[wj(0x6f7)]["id"], 0x1), iY(t2);
              if (!oz[t3[wj(0x6f7)]["id"]]) oz[t3[wj(0x6f7)]["id"]] = 0x0;
              oz[t3[wj(0x6f7)]["id"]]++;
            }
          }
          const rW = rI[wj(0xb7b)](rJ++);
          for (let t4 = 0x0; t4 < rW; t4++) {
            const t5 = rI[wj(0xb7b)](rJ++),
              t6 = rA(),
              t7 = iQ[t5];
            (t7[wj(0x3fb)] = t6), t6 === 0x0 && (t7[wj(0x4f3)] = 0x0);
          }
          (iI = rI[wj(0x5db)](rJ)), (rJ += 0x2);
          const rX = rI[wj(0x5db)](rJ);
          (rJ += 0x2),
            iE[wj(0xc86)](
              wj(0x2dc),
              kh(iI, wj(0x380)) + ",\x20" + kh(rX, wj(0x80a))
            );
          const rY = Math[wj(0xd23)](0xa, iI);
          if (iH) {
            const t8 = rI[wj(0xb7b)](rJ++),
              t9 = t8 >> 0x4,
              ta = t8 & 0xf,
              tb = rI[wj(0xb7b)](rJ++);
            for (let td = 0x0; td < ta; td++) {
              const te = rI[wj(0xb7b)](rJ++);
              (iG[te][wj(0x407)] = rI[wj(0x443)](rJ)), (rJ += 0x4);
            }
            const tc = [];
            for (let tf = 0x0; tf < tb; tf++) {
              tc[wj(0x46a)](rI[wj(0xb7b)](rJ++));
            }
            tc[wj(0xd6c)](function (tg, th) {
              return th - tg;
            });
            for (let tg = 0x0; tg < tb; tg++) {
              const th = tc[tg];
              iG[th]["el"][wj(0x256)](), iG[wj(0xb0d)](th, 0x1);
            }
            for (let ti = 0x0; ti < t9; ti++) {
              rC();
            }
            iG[wj(0xd6c)](function (tj, tk) {
              const wv = wj;
              return tk[wv(0x407)] - tj[wv(0x407)];
            });
          } else {
            iG[wj(0x680)] = 0x0;
            for (let tj = 0x0; tj < rY; tj++) {
              rC();
            }
            iH = !![];
          }
          iL();
          const rZ = rI[wj(0xb7b)](rJ++);
          for (let tk = 0x0; tk < rZ; tk++) {
            const tl = rI[wj(0x5db)](rJ);
            (rJ += 0x2), nS(eK[tl]);
          }
          const s0 = rI[wj(0x5db)](rJ);
          rJ += 0x2;
          for (let tm = 0x0; tm < s0; tm++) {
            const tn = rI[wj(0xb7b)](rJ++),
              to = tn >> 0x7,
              tp = tn & 0x7f;
            if (tp === cQ[wj(0x222)]) {
              const tt = rI[wj(0xb7b)](rJ++),
                tu = rI[wj(0xb7b)](rJ++) - 0x1;
              let tv = null,
                tw = 0x0;
              if (to) {
                const ty = rI[wj(0x443)](rJ);
                rJ += 0x4;
                const tz = rz();
                (tv = tz || wj(0x59c) + ty), (tw = rI[wj(0xb7b)](rJ++));
              }
              const tx = j8[tt];
              nj(
                wj(0x222),
                null,
                "⚡\x20" +
                  j7[tt] +
                  wj(0x267) +
                  (tu < 0x0
                    ? wj(0xc26)
                    : tu === 0x0
                    ? wj(0xa37)
                    : wj(0x7c7) + (tu + 0x1) + "!"),
                tx
              );
              tv &&
                ni(wj(0x222), [
                  [wj(0x155), "🏆"],
                  [tx, tv + wj(0x1bb)],
                  [hP[wj(0x286)], tw + wj(0x384)],
                  [tx, wj(0x20b)],
                ]);
              continue;
            }
            const tq = rI[wj(0x443)](rJ);
            rJ += 0x4;
            const tr = rz(),
              ts = tr || wj(0x59c) + tq;
            if (tp === cQ[wj(0x2ca)]) {
              let tA = rz();
              p8[wj(0xc18)] && (tA = fb(tA));
              if (jN(tA, tq)) nj(tq, ts, tA, tq === ix ? ng["me"] : void 0x0);
              else tq === ix && nj(-0x1, null, wj(0xbfd), ng[wj(0x7d7)]);
            } else {
              if (tp === cQ[wj(0x689)]) {
                const tB = rI[wj(0x5db)](rJ);
                rJ += 0x2;
                const tC = rI[wj(0x443)](rJ);
                rJ += 0x4;
                const tD = rI[wj(0x443)](rJ);
                rJ += 0x4;
                const tE = dC[tB],
                  tF = hN[tE[wj(0x3ac)]],
                  tG = hN[tE[wj(0xa75)][wj(0x3ac)]],
                  tH = tD === 0x0;
                if (tH)
                  ni(wj(0x689), [
                    [ng[wj(0x44e)], ts, !![]],
                    [ng[wj(0x44e)], wj(0x6d3)],
                    [
                      hQ[tE[wj(0x3ac)]],
                      k9(tC) + "\x20" + tF + "\x20" + tE[wj(0x456)],
                    ],
                  ]);
                else {
                  const tI = hQ[tE[wj(0xa75)][wj(0x3ac)]];
                  ni(wj(0x689), [
                    [tI, "⭐"],
                    [tI, ts, !![]],
                    [tI, wj(0x111)],
                    [
                      tI,
                      k9(tD) +
                        "\x20" +
                        tG +
                        "\x20" +
                        tE[wj(0x456)] +
                        wj(0x121) +
                        k9(tC) +
                        "\x20" +
                        tF +
                        "\x20" +
                        tE[wj(0x456)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tJ = rI[wj(0x5db)](rJ);
                rJ += 0x2;
                const tK = eK[tJ],
                  tL = hN[tK[wj(0x3ac)]],
                  tM = tp === cQ[wj(0x319)],
                  tN = hQ[tK[wj(0x3ac)]];
                ni(wj(0xd42), [
                  [
                    tN,
                    "" +
                      (tM ? wj(0xd34) : "") +
                      jt(tL) +
                      "\x20" +
                      tL +
                      "\x20" +
                      tK[wj(0x456)] +
                      wj(0xad1) +
                      js(tM) +
                      wj(0xc4e),
                  ],
                  [tN, ts + "!", !![]],
                ]);
              }
            }
          }
          const s1 = rI[wj(0xb7b)](rJ++),
            s2 = s1 & 0xf,
            s3 = s1 >> 0x4;
          let s4 = ![];
          s2 !== j6["id"] &&
            (j6 && (j6[wj(0x361)] = !![]),
            (s4 = !![]),
            jd(s2),
            k8(q7, wj(0x5c3) + j9[s2] + wj(0x742)));
          const s5 = rI[wj(0xb7b)](rJ++);
          if (s5 > 0x0) {
            let tO = ![];
            for (let tP = 0x0; tP < s5; tP++) {
              const tQ = rI[wj(0x5db)](rJ);
              rJ += 0x2;
              const tR = rI[wj(0x5db)](rJ);
              (rJ += 0x2), (j6[tQ] = tR);
              if (tR > 0x0) {
                if (!j6[wj(0x363)][tQ]) {
                  tO = !![];
                  const tS = nS(eK[tQ], !![]);
                  (tS[wj(0x643)] = !![]),
                    (tS[wj(0x377)] = ![]),
                    tS[wj(0x7d8)][wj(0x256)](wj(0x8ce)),
                    (tS[wj(0xd69)] = nN(wj(0x3ca))),
                    tS[wj(0x188)](tS[wj(0xd69)]),
                    (tS[wj(0x68a)] = tQ);
                  let tT = -0x1;
                  (tS["t"] = s4 ? 0x1 : 0x0),
                    (tS[wj(0x361)] = ![]),
                    (tS[wj(0x17a)] = 0x3e8),
                    (tS[wj(0xb50)] = function () {
                      const ww = wj,
                        tU = tS["t"];
                      if (tU === tT) return;
                      tT = tU;
                      const tV = jf(Math[ww(0xd23)](0x1, tU / 0.5)),
                        tW = jf(
                          Math[ww(0x137)](
                            0x0,
                            Math[ww(0xd23)]((tU - 0.5) / 0.5)
                          )
                        );
                      (tS[ww(0x6fc)][ww(0xc74)] =
                        ww(0x685) + -0x168 * (0x1 - tW) + ww(0x8b3) + tW + ")"),
                        (tS[ww(0x6fc)][ww(0x959)] = -1.12 * (0x1 - tV) + "em");
                    }),
                    jb[wj(0x46a)](tS),
                    j6[wj(0x9e)][wj(0x188)](tS),
                    (j6[wj(0x363)][tQ] = tS);
                }
                p2(j6[wj(0x363)][tQ][wj(0xd69)], tR);
              } else {
                const tU = j6[wj(0x363)][tQ];
                tU && ((tU[wj(0x361)] = !![]), delete j6[wj(0x363)][tQ]),
                  delete j6[tQ];
              }
            }
            tO &&
              [...j6[wj(0x9e)][wj(0x70b)]]
                [wj(0xd6c)]((tV, tW) => {
                  const wx = wj;
                  return -ob(eK[tV[wx(0x68a)]], eK[tW[wx(0x68a)]]);
                })
                [wj(0x78e)]((tV) => {
                  const wy = wj;
                  j6[wy(0x9e)][wy(0x188)](tV);
                });
          }
          (j6[wj(0xc6)] = pM), (j6[wj(0xd67)] = s3);
          if (s3 !== cT[wj(0x4eb)]) {
            (j6[wj(0x379)][wj(0x6fc)][wj(0x9a7)] = ""),
              (j6[wj(0x7f1)] = j6[wj(0x8f9)]),
              (j6[wj(0xbf8)] = rA());
            if (j6[wj(0x394)] !== jJ) {
              const tV = jJ ? wj(0xab7) : wj(0x256);
              j6[wj(0xd1c)][wj(0x7d8)][tV](wj(0xaab)),
                j6[wj(0xd1c)][wj(0x7d8)][tV](wj(0x8a8)),
                j6[wj(0x3d6)][wj(0x7d8)][tV](wj(0x223)),
                (j6[wj(0x394)] = jJ);
            }
            switch (s3) {
              case cT[wj(0xb6f)]:
                k8(j6[wj(0xb77)], wj(0x396));
                break;
              case cT[wj(0x222)]:
                const tW = rI[wj(0xb7b)](rJ++) + 0x1;
                k8(j6[wj(0xb77)], wj(0x712) + tW);
                break;
              case cT[wj(0x883)]:
                k8(j6[wj(0xb77)], wj(0x23c));
                break;
              case cT[wj(0x8c3)]:
                k8(j6[wj(0xb77)], wj(0x6d6));
                break;
              case cT[wj(0x3b4)]:
                k8(j6[wj(0xb77)], wj(0xad3));
                break;
            }
          } else j6[wj(0x379)][wj(0x6fc)][wj(0x9a7)] = wj(0x4eb);
          if (rI[wj(0xbc8)] - rJ > 0x0) {
            iy &&
              (j0(qq),
              (qq[wj(0x7d)] = ![]),
              (q2[wj(0x6fc)][wj(0x9a7)] = ""),
              (q1[wj(0x6fc)][wj(0x9a7)] = wj(0x4eb)),
              q3(q2, iy["nx"], iy["ny"]));
            qr[wj(0x238)](), (iy = null), ju[wj(0x7d8)][wj(0x256)](wj(0x254));
            const tX = rI[wj(0x5db)](rJ) - 0x1;
            rJ += 0x2;
            const tY = rI[wj(0x443)](rJ);
            rJ += 0x4;
            const tZ = rI[wj(0x443)](rJ);
            rJ += 0x4;
            const u0 = rI[wj(0x443)](rJ);
            rJ += 0x4;
            const u1 = rI[wj(0x443)](rJ);
            (rJ += 0x4),
              k8(k3, ka(tZ)),
              k8(k2, k9(tY)),
              k8(k4, k9(u0)),
              k8(k6, k9(u1));
            let u2 = null;
            rI[wj(0xbc8)] - rJ > 0x0 && ((u2 = rI[wj(0x443)](rJ)), (rJ += 0x4));
            u2 !== null
              ? (k8(k7, k9(u2)), (k7[wj(0x8c8)][wj(0x6fc)][wj(0x9a7)] = ""))
              : (k7[wj(0x8c8)][wj(0x6fc)][wj(0x9a7)] = wj(0x4eb));
            if (tX === -0x1) k8(k5, wj(0x23a));
            else {
              const u3 = eK[tX];
              k8(k5, hN[u3[wj(0x3ac)]] + "\x20" + u3[wj(0x456)]);
            }
            oA(), (oz = {}), (kn[wj(0x6fc)][wj(0x9a7)] = ""), hi();
          }
          break;
        default:
          console[wj(0xb12)](wj(0x661) + rK);
      }
    }
    var k2 = document[us(0x8c1)](us(0x805)),
      k3 = document[us(0x8c1)](us(0x7e6)),
      k4 = document[us(0x8c1)](us(0x453)),
      k5 = document[us(0x8c1)](us(0x9c7)),
      k6 = document[us(0x8c1)](us(0x47e)),
      k7 = document[us(0x8c1)](us(0x898));
    function k8(rx, ry) {
      const wz = us;
      rx[wz(0xc86)](wz(0x2dc), ry);
    }
    function k9(rx) {
      const wA = us;
      return rx[wA(0x313)](wA(0x252));
    }
    function ka(rx, ry) {
      const wB = us,
        rz = [
          Math[wB(0x35d)](rx / (0x3e8 * 0x3c * 0x3c)),
          Math[wB(0x35d)]((rx % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wB(0x35d)]((rx % (0x3e8 * 0x3c)) / 0x3e8),
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
      [cS[us(0xcaf)]]: us(0xbbe),
      [cS[us(0x610)]]: us(0x2b0),
      [cS[us(0x5be)]]: us(0x2b0),
      [cS[us(0x32c)]]: us(0x24d),
      [cS[us(0x4e9)]]: us(0x24d),
      [cS[us(0x78b)]]: us(0x10d),
      [cS[us(0xd92)]]: us(0x10d),
      [cS[us(0x71)]]: us(0xbf5),
      [cS[us(0xa08)]]: us(0x4b5),
    };
    kb["0"] = us(0x23a);
    var kc = kb;
    for (let rx in cS) {
      const ry = cS[rx];
      if (kc[ry]) continue;
      const rz = kd(rx);
      kc[ry] = rz[us(0xce2)](us(0x916), us(0xb6e));
    }
    function kd(rA) {
      const wC = us,
        rB = rA[wC(0xce2)](/([A-Z])/g, wC(0x468)),
        rC = rB[wC(0x75e)](0x0)[wC(0x7a6)]() + rB[wC(0x761)](0x1);
      return rC;
    }
    var ke = null,
      kf = !![];
    function kg() {
      const wD = us;
      console[wD(0xb12)](wD(0xc2c)),
        hT(),
        ju[wD(0x7d8)][wD(0x256)](wD(0x254)),
        kf &&
          (kk[wD(0x6fc)][wD(0x9a7)] === wD(0x4eb)
            ? (clearTimeout(ke),
              kC[wD(0x7d8)][wD(0xab7)](wD(0x254)),
              (ke = setTimeout(function () {
                const wE = wD;
                kC[wE(0x7d8)][wE(0x256)](wE(0x254)),
                  (kk[wE(0x6fc)][wE(0x9a7)] = ""),
                  kB[wE(0xccf)](ko),
                  (kn[wE(0x6fc)][wE(0x9a7)] = km[wE(0x6fc)][wE(0x9a7)] =
                    wE(0x4eb)),
                  hi(),
                  hV(hU[wE(0x428)]);
              }, 0x1f4)))
            : (kC[wD(0x7d8)][wD(0x256)](wD(0x254)), hV(hU[wD(0x428)])));
    }
    function kh(rA, rB) {
      return rA + "\x20" + rB + (rA === 0x1 ? "" : "s");
    }
    var ki = document[us(0x6b7)](us(0x2fe)),
      kj = ki[us(0xcc)]("2d"),
      kk = document[us(0x8c1)](us(0x91f)),
      kl = document[us(0x8c1)](us(0x167)),
      km = document[us(0x8c1)](us(0x808));
    km[us(0x6fc)][us(0x9a7)] = us(0x4eb);
    var kn = document[us(0x8c1)](us(0xd22));
    kn[us(0x6fc)][us(0x9a7)] = us(0x4eb);
    var ko = document[us(0x8c1)](us(0x79d)),
      kp = document[us(0x8c1)](us(0x67c)),
      kq = document[us(0x8c1)](us(0xfc));
    function kr() {
      const wF = us;
      kq[wF(0x511)] = "";
      for (let rA = 0x0; rA < 0x32; rA++) {
        const rB = ks[rA],
          rC = nN(wF(0x80b) + rA + wF(0x46d)),
          rD = rC[wF(0x8c1)](wF(0x32b));
        if (rB)
          for (let rE = 0x0; rE < rB[wF(0x680)]; rE++) {
            const rF = rB[rE],
              rG = dF[rF];
            if (!rG) rD[wF(0x188)](nN(wF(0x6df)));
            else {
              const rH = nN(
                wF(0x755) + rG[wF(0x3ac)] + "\x22\x20" + qx(rG) + wF(0xc37)
              );
              (rH[wF(0x6f7)] = rG),
                (rH[wF(0x41f)] = kp),
                jY(rH),
                rD[wF(0x188)](rH);
            }
          }
        else rD[wF(0x511)] = wF(0x6df)[wF(0xb8f)](0x5);
        (rC[wF(0x8c1)](wF(0x827))[wF(0x21c)] = function () {
          ku(rA);
        }),
          (rC[wF(0x8c1)](wF(0xa57))[wF(0x21c)] = function () {
            kx(rA);
          }),
          kq[wF(0x188)](rC);
      }
    }
    var ks = kt();
    function kt() {
      const wG = us;
      try {
        const rA = JSON[wG(0x681)](hD[wG(0x70f)]);
        for (const rB in rA) {
          !Array[wG(0x37e)](rA[rB]) && delete rA[rB];
        }
        return rA;
      } catch {
        return {};
      }
    }
    function ku(rA) {
      const wH = us,
        rB = [],
        rC = nx[wH(0x6da)](wH(0xac));
      for (let rD = 0x0; rD < rC[wH(0x680)]; rD++) {
        const rE = rC[rD],
          rF = rE[wH(0x70b)][0x0];
        !rF ? (rB[rD] = null) : (rB[rD] = rF[wH(0x6f7)][wH(0xb65)]);
      }
      (ks[rA] = rB),
        (hD[wH(0x70f)] = JSON[wH(0x646)](ks)),
        kr(),
        hc(wH(0x5e9) + rA + "!");
    }
    function kv() {
      const wI = us;
      return nx[wI(0x6da)](wI(0xac));
    }
    document[us(0x8c1)](us(0x207))[us(0x21c)] = function () {
      kw();
    };
    function kw() {
      const wJ = us,
        rA = kv();
      for (const rB of rA) {
        const rC = rB[wJ(0x70b)][0x0];
        if (!rC) continue;
        rC[wJ(0x256)](),
          iR[wJ(0x46a)](rC[wJ(0xc72)]),
          n3(rC[wJ(0x6f7)]["id"], 0x1),
          il(new Uint8Array([cI[wJ(0x96f)], rB[wJ(0x8b)]]));
      }
    }
    function kx(rA) {
      const wK = us;
      if (mI || mH[wK(0x680)] > 0x0) return;
      const rB = ks[rA];
      if (!rB) return;
      kw();
      const rC = kv(),
        rD = Math[wK(0xd23)](rC[wK(0x680)], rB[wK(0x680)]);
      for (let rE = 0x0; rE < rD; rE++) {
        const rF = rB[rE],
          rG = dF[rF];
        if (!rG || !iS[rG["id"]]) continue;
        const rH = nN(
          wK(0x755) + rG[wK(0x3ac)] + "\x22\x20" + qx(rG) + wK(0xc37)
        );
        (rH[wK(0x6f7)] = rG),
          (rH[wK(0xd47)] = !![]),
          (rH[wK(0xc72)] = iR[wK(0x450)]()),
          nM(rH, rG),
          (iQ[rH[wK(0xc72)]] = rH),
          rC[rE][wK(0x188)](rH),
          n3(rH[wK(0x6f7)]["id"], -0x1);
        const rI = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rI[wK(0x518)](0x0, cI[wK(0x9ad)]),
          rI[wK(0x873)](0x1, rH[wK(0x6f7)]["id"]),
          rI[wK(0x518)](0x3, rE),
          il(rI);
      }
      hc(wK(0x2fc) + rA + "!");
    }
    var ky = document[us(0x8c1)](us(0x720)),
      kz = document[us(0x8c1)](us(0x927));
    kz[us(0x21c)] = function () {
      const wL = us;
      kC[wL(0x7d8)][wL(0xab7)](wL(0x254)),
        jy
          ? (ke = setTimeout(function () {
              const wM = wL;
              il(new Uint8Array([cI[wM(0xcb2)]]));
            }, 0x1f4))
          : (ke = setTimeout(function () {
              const wN = wL;
              kC[wN(0x7d8)][wN(0x256)](wN(0x254)),
                (km[wN(0x6fc)][wN(0x9a7)] = kn[wN(0x6fc)][wN(0x9a7)] =
                  wN(0x4eb)),
                (kk[wN(0x6fc)][wN(0x9a7)] = ""),
                kB[wN(0xccf)](ko),
                kB[wN(0x7d8)][wN(0xab7)](wN(0x254)),
                jg();
            }, 0x1f4));
    };
    var kA = document[us(0x8c1)](us(0x5bc)),
      kB = document[us(0x8c1)](us(0x1f5));
    kB[us(0x7d8)][us(0xab7)](us(0x254));
    var kC = document[us(0x8c1)](us(0x992)),
      kD = document[us(0x8c1)](us(0x79b)),
      kE = document[us(0x8c1)](us(0x535));
    (kE[us(0x77e)] = hD[us(0x998)] || ""),
      (kE[us(0x4e5)] = cK),
      (kE[us(0x703)] = function () {
        const wO = us;
        hD[wO(0x998)] = this[wO(0x77e)];
      });
    var kF;
    kD[us(0x21c)] = function () {
      if (!hW) return;
      kG();
    };
    function kG(rA = ![]) {
      const wP = us;
      hack.chatFunc = hK;
      hack.toastFunc = hc;
      if(rA) hack.onload();
      hack.moblst = eO;
      if (kk[wP(0x6fc)][wP(0x9a7)] === wP(0x4eb)) {
        kC[wP(0x7d8)][wP(0x256)](wP(0x254));
        return;
      }
      clearTimeout(kF),
        kB[wP(0x7d8)][wP(0x256)](wP(0x254)),
        (kF = setTimeout(() => {
          const wQ = wP;
          kC[wQ(0x7d8)][wQ(0xab7)](wQ(0x254)),
            (kF = setTimeout(() => {
              const wR = wQ;
              rA && kC[wR(0x7d8)][wR(0x256)](wR(0x254)),
                (kk[wR(0x6fc)][wR(0x9a7)] = wR(0x4eb)),
                (hg[wR(0x6fc)][wR(0x9a7)] = wR(0x4eb)),
                (km[wR(0x6fc)][wR(0x9a7)] = ""),
                km[wR(0x188)](ko),
                iq(kE[wR(0x77e)][wR(0x761)](0x0, cK));
            }, 0x1f4));
        }, 0x64));
    }
    var kH = document[us(0x8c1)](us(0x8b2));
    function kI(rA, rB, rC) {
      const wS = us,
        rD = {};
      (rD[wS(0xc3)] = wS(0x26c)), (rD[wS(0xce1)] = !![]), (rC = rC || rD);
      const rE = nN(
        wS(0x85b) +
          rC[wS(0xc3)] +
          wS(0xc1) +
          rA +
          wS(0x58e) +
          (rC[wS(0xce1)] ? wS(0x46f) : "") +
          wS(0x8bd)
      );
      return (
        (rE[wS(0x8c1)](wS(0x113))[wS(0x21c)] = function () {
          const wT = wS;
          rB(!![]), rE[wT(0x256)]();
        }),
        (rE[wS(0x8c1)](wS(0x353))[wS(0x21c)] = function () {
          const wU = wS;
          rE[wU(0x256)](), rB(![]);
        }),
        kH[wS(0x188)](rE),
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
            wV(0x2dd),
            wV(0xbdd),
            wV(0xb52),
            wV(0xb0b),
            wV(0xb56),
            wV(0x935),
            wV(0xd11),
            wV(0x93f),
            wV(0xc2a),
            wV(0x288),
            wV(0xc5f),
            wV(0xcb7),
            wV(0x1c3),
            wV(0x7d6),
            wV(0xaa2),
            wV(0x50a),
            wV(0x2ce),
            wV(0x775),
            wV(0xc1a),
            wV(0x3c3),
            wV(0x109),
            wV(0x328),
            wV(0xff),
            wV(0x4b7),
            wV(0xaef),
            wV(0x6f7),
            wV(0x17e),
            wV(0xb3a),
            wV(0x8c6),
            wV(0x7bf),
            wV(0xd6f),
            wV(0xab),
            wV(0xd75),
            wV(0x3ce),
            wV(0x4b0),
            wV(0x6e5),
            wV(0x63a),
            wV(0x25c),
            wV(0x614),
            wV(0x72),
            wV(0xbfb),
            wV(0xc8),
            wV(0x495),
            wV(0x1fe),
            wV(0x95a),
            wV(0xc7),
            wV(0x6ee),
            wV(0x241),
            wV(0xeb),
            wV(0x174),
            wV(0x6ff),
            wV(0x50b),
            wV(0x47d),
            wV(0x558),
            wV(0x23f),
            wV(0xd3f),
            wV(0xad7),
            wV(0x3f4),
            wV(0x9bb),
            wV(0x1f9),
            wV(0x135),
            wV(0xce),
            wV(0x657),
            wV(0xbb0),
            wV(0x9f0),
            wV(0x9eb),
            wV(0xb13),
            wV(0xcff),
            wV(0xd0c),
            wV(0xd95),
            wV(0xb6c),
            wV(0x736),
            wV(0x10c),
            wV(0xbec),
            wV(0xc60),
            wV(0xc00),
            wV(0x5ba),
            wV(0x28e),
            wV(0x426),
            wV(0x9b0),
            wV(0x5f8),
            wV(0xa98),
            wV(0x846),
            wV(0xbd0),
            wV(0x9cc),
            wV(0x857),
            wV(0x2e0),
            wV(0xbf1),
            wV(0x4ad),
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
            else rM[wW(0x46a)](rM[wW(0x43f)]());
          } catch (rR) {
            rM[wW(0x46a)](rM[wW(0x43f)]());
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
    var kK = document[us(0x8c1)](us(0x852)),
      kL = (function () {
        const wY = us;
        let rA = ![];
        return (
          (function (rB) {
            const wX = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                wX(0x567)
              ](rB) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                wX(0x567)
              ](rB[wX(0xb16)](0x0, 0x4))
            )
              rA = !![];
          })(navigator[wY(0xf6)] || navigator[wY(0xce8)] || window[wY(0xc98)]),
          rA
        );
      })(),
      kM =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          us(0x567)
        ](navigator[us(0xf6)][us(0x731)]()),
      kN = 0x514,
      kO = 0x28a,
      kP = 0x1,
      kQ = [km, kk, kn, kl, kH, hg],
      kR = 0x1,
      kS = 0x1;
    function kT() {
      const wZ = us;
      (kS = Math[wZ(0x137)](ki[wZ(0x977)] / d0, ki[wZ(0x4c9)] / d1)),
        (kR =
          Math[p8[wZ(0x219)] ? wZ(0xd23) : wZ(0x137)](kU() / kN, kV() / kO) *
          (kL && !kM ? 1.1 : 0x1)),
        (kR *= kP);
      for (let rA = 0x0; rA < kQ[wZ(0x680)]; rA++) {
        const rB = kQ[rA];
        let rC = kR * (rB[wZ(0xd5a)] || 0x1);
        (rB[wZ(0x6fc)][wZ(0xc74)] = wZ(0xe6) + rC + ")"),
          (rB[wZ(0x6fc)][wZ(0x922)] = wZ(0xbd2)),
          (rB[wZ(0x6fc)][wZ(0x977)] = kU() / rC + "px"),
          (rB[wZ(0x6fc)][wZ(0x4c9)] = kV() / rC + "px");
      }
    }
    function kU() {
      const x0 = us;
      return document[x0(0x1fd)][x0(0x987)];
    }
    function kV() {
      const x1 = us;
      return document[x1(0x1fd)][x1(0x144)];
    }
    var kW = 0x1;
    function kX() {
      const x2 = us;
      (kW = p8[x2(0xaf1)] ? 0.65 : window[x2(0x93a)]),
        (ki[x2(0x977)] = kU() * kW),
        (ki[x2(0x4c9)] = kV() * kW),
        kT();
      for (let rA = 0x0; rA < mH[x2(0x680)]; rA++) {
        mH[rA][x2(0x467)]();
      }
    }
    window[us(0x947)] = function () {
      kX(), qF();
    };
    var kY = (function () {
        const x3 = us,
          rA = 0x23,
          rB = rA / 0x2,
          rC = document[x3(0xa1f)](x3(0x2fe));
        rC[x3(0x977)] = rC[x3(0x4c9)] = rA;
        const rD = rC[x3(0xcc)]("2d");
        return (
          (rD[x3(0x44c)] = x3(0x370)),
          rD[x3(0x9fa)](),
          rD[x3(0xbd5)](0x0, rB),
          rD[x3(0x6e1)](rA, rB),
          rD[x3(0xbd5)](rB, 0x0),
          rD[x3(0x6e1)](rB, rA),
          rD[x3(0x2dc)](),
          rD[x3(0x951)](rC, x3(0xb8f))
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
      const rD = Math[x4(0x802)](rA),
        rE = Math[x4(0x6ad)](rA),
        rF = rD * 0x28,
        rG = rE * 0x28;
      l1[x4(0x46a)]({
        dir: rB,
        start: [rF, rG],
        curve: [
          rF + rD * 0x17 + -rE * rB * rC,
          rG + rE * 0x17 + rD * rB * rC,
          rF + rD * 0x2e,
          rG + rE * 0x2e,
        ],
        side: Math[x4(0x9f5)](rA),
      });
    }
    var l3 = l4();
    function l4() {
      const x5 = us,
        rA = new Path2D(),
        rB = Math["PI"] / 0x5;
      return (
        rA[x5(0x663)](0x0, 0x0, 0x28, rB, l0 - rB),
        rA[x5(0xbc4)](
          0x12,
          0x0,
          Math[x5(0x802)](rB) * 0x28,
          Math[x5(0x6ad)](rB) * 0x28
        ),
        rA[x5(0x735)](),
        rA
      );
    }
    var l5 = l6();
    function l6() {
      const x6 = us,
        rA = new Path2D();
      return (
        rA[x6(0xbd5)](-0x28, 0x5),
        rA[x6(0x1db)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rA[x6(0x6e1)](0x28, -0x5),
        rA[x6(0x1db)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rA[x6(0x735)](),
        rA
      );
    }
    function l7(rA, rB = 0x1, rC = 0x0) {
      const x7 = us,
        rD = new Path2D();
      for (let rE = 0x0; rE < rA; rE++) {
        const rF = (Math["PI"] * 0x2 * rE) / rA + rC;
        rD[x7(0x6e1)](
          Math[x7(0x802)](rF) - Math[x7(0x6ad)](rF) * 0.1 * rB,
          Math[x7(0x6ad)](rF)
        );
      }
      return rD[x7(0x735)](), rD;
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
          rA[x8(0x6e1)](Math[x8(0x802)](rC) * rD, Math[x8(0x6ad)](rC) * rD);
        }
        return rA[x8(0x735)](), rA;
      })(),
      petalCotton: la(0x9, 0x1, 0.5, 1.6),
      petalWeb: la(0x5, 0x1, 0.5, 0.7),
      petalCactus: la(0x8, 0x1, 0.5, 0.7),
      petalSand: l7(0x6, 0x0, 0.2),
    };
    function l9(rA, rB, rC, rD, rE) {
      const x9 = us;
      (rA[x9(0x44c)] = rE),
        (rA[x9(0x290)] = rC),
        rA[x9(0x181)](),
        (rB *= 0.45),
        rA[x9(0x477)](rB),
        rA[x9(0x609)](-0x14, 0x0),
        rA[x9(0x9fa)](),
        rA[x9(0xbd5)](0x0, 0x26),
        rA[x9(0x6e1)](0x50, 0x7),
        rA[x9(0x6e1)](0x50, -0x7),
        rA[x9(0x6e1)](0x0, -0x26),
        rA[x9(0x6e1)](-0x14, -0x1e),
        rA[x9(0x6e1)](-0x14, 0x1e),
        rA[x9(0x735)](),
        (rC = rC / rB),
        (rA[x9(0x290)] = 0x64 + rC),
        (rA[x9(0x44c)] = rE),
        rA[x9(0x2dc)](),
        (rA[x9(0x44c)] = rA[x9(0xd2d)] = rD),
        (rA[x9(0x290)] -= rC * 0x2),
        rA[x9(0x2dc)](),
        rA[x9(0x5a4)](),
        rA[x9(0x242)]();
    }
    function la(rA, rB, rC, rD) {
      const xa = us,
        rE = new Path2D();
      return lb(rE, rA, rB, rC, rD), rE[xa(0x735)](), rE;
    }
    function lb(rA, rB, rC, rD, rE) {
      const xb = us;
      rA[xb(0xbd5)](rC, 0x0);
      for (let rF = 0x1; rF <= rB; rF++) {
        const rG = (Math["PI"] * 0x2 * (rF - rD)) / rB,
          rH = (Math["PI"] * 0x2 * rF) / rB;
        rA[xb(0xbc4)](
          Math[xb(0x802)](rG) * rC * rE,
          Math[xb(0x6ad)](rG) * rC * rE,
          Math[xb(0x802)](rH) * rC,
          Math[xb(0x6ad)](rH) * rC
        );
      }
    }
    var lc = (function () {
        const xc = us,
          rA = new Path2D();
        rA[xc(0xbd5)](0x3c, 0x0);
        const rB = 0x6;
        for (let rC = 0x0; rC < rB; rC++) {
          const rD = ((rC + 0.5) / rB) * Math["PI"] * 0x2,
            rE = ((rC + 0x1) / rB) * Math["PI"] * 0x2;
          rA[xc(0xbc4)](
            Math[xc(0x802)](rD) * 0x78,
            Math[xc(0x6ad)](rD) * 0x78,
            Math[xc(0x802)](rE) * 0x3c,
            Math[xc(0x6ad)](rE) * 0x3c
          );
        }
        return rA[xc(0x735)](), rA;
      })(),
      ld = (function () {
        const xd = us,
          rA = new Path2D(),
          rB = 0x6;
        for (let rC = 0x0; rC < rB; rC++) {
          const rD = ((rC + 0.5) / rB) * Math["PI"] * 0x2;
          rA[xd(0xbd5)](0x0, 0x0), rA[xd(0x6e1)](...le(0x37, 0x0, rD));
          for (let rE = 0x0; rE < 0x2; rE++) {
            const rF = (rE / 0x2) * 0x1e + 0x14,
              rG = 0xa - rE * 0x2;
            rA[xd(0xbd5)](...le(rF + rG, -rG, rD)),
              rA[xd(0x6e1)](...le(rF, 0x0, rD)),
              rA[xd(0x6e1)](...le(rF + rG, rG, rD));
          }
        }
        return rA;
      })();
    function le(rA, rB, rC) {
      const xe = us,
        rD = Math[xe(0x6ad)](rC),
        rE = Math[xe(0x802)](rC);
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
          rL = Math[xf(0xbb8)](rK * 0xff)[xf(0x4d3)](0x10);
        return rL[xf(0x680)] === 0x1 ? "0" + rL : rL;
      };
      return "#" + rG(rD) + rG(rE) + rG(rF);
    }
    var lg = [];
    for (let rA = 0x0; rA < 0xa; rA++) {
      const rB = 0x1 - rA / 0xa;
      lg[us(0x46a)](lf(0x28 + rB * 0xc8, 0x50, 0x3c * rB));
    }
    var lh = [us(0x2af), us(0x9f3)],
      li = lh[0x0],
      lj = [us(0x54a), us(0x196), us(0x62c), us(0x8e3)];
    function lk(rC = us(0xba7)) {
      const xg = us,
        rD = [];
      for (let rE = 0x0; rE < 0x5; rE++) {
        rD[xg(0x46a)](pW(rC, 0.8 - (rE / 0x5) * 0.25));
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
          body: us(0xba7),
          wing: us(0x675),
          tail_outline: us(0x53b),
          bone_outline: us(0x84c),
          bone: us(0x53b),
          tail: lk(),
        },
      },
      lm = new Path2D(us(0x540)),
      ln = new Path2D(us(0x16e)),
      lo = [];
    for (let rC = 0x0; rC < 0x3; rC++) {
      lo[us(0x46a)](pW(lh[0x0], 0x1 - (rC / 0x3) * 0.2));
    }
    function lp(rD = Math[us(0xba1)]()) {
      return function () {
        return (rD = (rD * 0x2455 + 0xc091) % 0x38f40), rD / 0x38f40;
      };
    }
    const lq = {
      [cS[us(0x964)]]: [us(0xbfa), us(0x9a5)],
      [cS[us(0x351)]]: [us(0xba7), us(0x187)],
      [cS[us(0x31a)]]: [us(0x156), us(0x672)],
    };
    var lr = lq;
    const ls = {};
    (ls[us(0x2b3)] = !![]),
      (ls[us(0x6de)] = !![]),
      (ls[us(0xac7)] = !![]),
      (ls[us(0x627)] = !![]),
      (ls[us(0x199)] = !![]),
      (ls[us(0x7c)] = !![]),
      (ls[us(0x2e3)] = !![]);
    var lt = ls;
    const lu = {};
    (lu[us(0xbb7)] = !![]),
      (lu[us(0x66d)] = !![]),
      (lu[us(0x90b)] = !![]),
      (lu[us(0xc35)] = !![]),
      (lu[us(0x950)] = !![]),
      (lu[us(0x271)] = !![]),
      (lu[us(0xc44)] = !![]);
    var lv = lu;
    const lw = {};
    (lw[us(0x90b)] = !![]),
      (lw[us(0xc35)] = !![]),
      (lw[us(0x950)] = !![]),
      (lw[us(0x271)] = !![]);
    var lx = lw;
    const ly = {};
    (ly[us(0x66d)] = !![]), (ly[us(0x618)] = !![]), (ly[us(0x627)] = !![]);
    var lz = ly;
    const lA = {};
    (lA[us(0x9f2)] = !![]), (lA[us(0xa08)] = !![]), (lA[us(0x5ff)] = !![]);
    var lB = lA;
    const lC = {};
    (lC[us(0x462)] = !![]),
      (lC[us(0x71)] = !![]),
      (lC[us(0xcbd)] = !![]),
      (lC[us(0xc82)] = !![]),
      (lC[us(0x82)] = !![]);
    var lD = lC;
    function lE(rD, rE) {
      const xh = us;
      rD[xh(0x9fa)](), rD[xh(0xbd5)](rE, 0x0);
      for (let rF = 0x0; rF < 0x6; rF++) {
        const rG = (rF / 0x6) * Math["PI"] * 0x2;
        rD[xh(0x6e1)](Math[xh(0x802)](rG) * rE, Math[xh(0x6ad)](rG) * rE);
      }
      rD[xh(0x735)]();
    }
    function lF(rD, rE, rF, rG, rH) {
      const xi = us;
      rD[xi(0x9fa)](),
        rD[xi(0xbd5)](0x9, -0x5),
        rD[xi(0x1db)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rD[xi(0xbc4)](0xd, 0x0, 0x9, -0x5),
        rD[xi(0x735)](),
        (rD[xi(0x8f6)] = rD[xi(0x3e3)] = xi(0xbb8)),
        (rD[xi(0x44c)] = rG),
        (rD[xi(0x290)] = rE),
        rD[xi(0x2dc)](),
        (rD[xi(0x290)] -= rH),
        (rD[xi(0xd2d)] = rD[xi(0x44c)] = rF),
        rD[xi(0x5a4)](),
        rD[xi(0x2dc)]();
    }
    var lG = class {
        constructor(rD = -0x1, rE, rF, rG, rH, rI = 0x7, rJ = -0x1) {
          const xj = us;
          (this["id"] = rD),
            (this[xj(0xb8a)] = rE),
            (this[xj(0x9d)] = hM[rE]),
            (this[xj(0xd57)] = this[xj(0x9d)][xj(0x7cc)](xj(0x6f7))),
            (this["x"] = this["nx"] = this["ox"] = rF),
            (this["y"] = this["ny"] = this["oy"] = rG),
            (this[xj(0x640)] = this[xj(0x75c)] = this[xj(0x4ec)] = rH),
            (this[xj(0xab6)] =
              this[xj(0xca2)] =
              this[xj(0xca6)] =
              this[xj(0xf3)] =
                rJ),
            (this[xj(0xd78)] = 0x0),
            (this[xj(0xc80)] = this[xj(0x10b)] = this[xj(0xc6f)] = rI),
            (this[xj(0x604)] = 0x0),
            (this[xj(0x8ee)] = ![]),
            (this[xj(0x373)] = 0x0),
            (this[xj(0x59d)] = 0x0),
            (this[xj(0x9d2)] = this[xj(0x9d)][xj(0x79e)](xj(0xb11)) > -0x1),
            (this[xj(0xa81)] = this[xj(0x9d2)] ? this[xj(0xca2)] < 0x1 : 0x1),
            (this[xj(0x7b9)] = ![]),
            (this[xj(0x9d5)] = 0x0),
            (this[xj(0x94)] = 0x0),
            (this[xj(0x4fa)] = 0x0),
            (this[xj(0x3ef)] = 0x1),
            (this[xj(0xd8c)] = 0x0),
            (this[xj(0x201)] = [cS[xj(0x590)], cS[xj(0x2cb)], cS[xj(0x253)]][
              xj(0x669)
            ](this[xj(0xb8a)])),
            (this[xj(0x22e)] = lv[this[xj(0x9d)]]),
            (this[xj(0x664)] = lx[this[xj(0x9d)]] ? 0x32 / 0xc8 : 0x0),
            (this[xj(0x84b)] = lt[this[xj(0x9d)]]),
            (this[xj(0xa34)] = 0x0),
            (this[xj(0xcfc)] = 0x0),
            (this[xj(0xc16)] = ![]),
            (this[xj(0x175)] = 0x0),
            (this[xj(0x2df)] = !![]),
            (this[xj(0x612)] = 0x2),
            (this[xj(0xa2c)] = 0x0),
            (this[xj(0x22d)] = lD[this[xj(0x9d)]]),
            (this[xj(0xd80)] = lz[this[xj(0x9d)]]),
            (this[xj(0x8e5)] = lB[this[xj(0x9d)]]);
        }
        [us(0xb50)]() {
          const xk = us;
          this[xk(0x8ee)] && (this[xk(0x373)] += pN / 0xc8);
          (this[xk(0xcfc)] += ((this[xk(0xc16)] ? 0x1 : -0x1) * pN) / 0xc8),
            (this[xk(0xcfc)] = Math[xk(0xd23)](
              0x1,
              Math[xk(0x137)](0x0, this[xk(0xcfc)])
            )),
            (this[xk(0x4fa)] = pt(
              this[xk(0x4fa)],
              this[xk(0x94)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[xk(0x94)] = pt(this[xk(0x94)], this[xk(0x9d5)], 0x64));
          this[xk(0x59d)] > 0x0 &&
            ((this[xk(0x59d)] -= pN / 0x96),
            this[xk(0x59d)] < 0x0 && (this[xk(0x59d)] = 0x0));
          (this[xk(0x604)] += pN / 0x64),
            (this["t"] = Math[xk(0xd23)](0x1, this[xk(0x604)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[xk(0xca2)] =
              this[xk(0xf3)] + (this[xk(0xca6)] - this[xk(0xf3)]) * this["t"]),
            (this[xk(0xc80)] =
              this[xk(0xc6f)] +
              (this[xk(0x10b)] - this[xk(0xc6f)]) * this["t"]);
          if (this[xk(0x201)]) {
            const rD = Math[xk(0xd23)](0x1, pN / 0x64);
            (this[xk(0x3ef)] +=
              (Math[xk(0x802)](this[xk(0x75c)]) - this[xk(0x3ef)]) * rD),
              (this[xk(0xd8c)] +=
                (Math[xk(0x6ad)](this[xk(0x75c)]) - this[xk(0xd8c)]) * rD);
          }
          (this[xk(0x640)] = f8(this[xk(0x4ec)], this[xk(0x75c)], this["t"])),
            (this[xk(0x175)] +=
              ((Math[xk(0xd2c)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pN) /
              0x12),
            this[xk(0xd78)] > 0x0 &&
              ((this[xk(0xd78)] -= pN / 0x258),
              this[xk(0xd78)] < 0x0 && (this[xk(0xd78)] = 0x0)),
            this[xk(0x8e5)] &&
              ((this[xk(0x612)] += pN / 0x5dc),
              this[xk(0x612)] > 0x1 && (this[xk(0x612)] = 0x1),
              (this[xk(0x2df)] = this[xk(0x612)] < 0x1)),
            this[xk(0xca2)] < 0x1 &&
              (this[xk(0xa81)] = pt(this[xk(0xa81)], 0x1, 0xc8)),
            this[xk(0xd78)] === 0x0 &&
              (this[xk(0xab6)] +=
                (this[xk(0xca2)] - this[xk(0xab6)]) *
                Math[xk(0xd23)](0x1, pN / 0xc8));
        }
        [us(0xd30)](rD, rE = ![]) {
          const xl = us,
            rF = this[xl(0xc80)] / 0x19;
          rD[xl(0x477)](rF),
            rD[xl(0x609)](0x5, 0x0),
            (rD[xl(0x290)] = 0x5),
            (rD[xl(0x3e3)] = rD[xl(0x8f6)] = xl(0xbb8)),
            (rD[xl(0x44c)] = rD[xl(0xd2d)] = this[xl(0x67a)](xl(0xaa4)));
          rE &&
            (rD[xl(0x181)](),
            rD[xl(0x609)](0x3, 0x0),
            rD[xl(0x9fa)](),
            rD[xl(0xbd5)](-0xa, 0x0),
            rD[xl(0x6e1)](-0x28, -0xf),
            rD[xl(0xbc4)](-0x21, 0x0, -0x28, 0xf),
            rD[xl(0x735)](),
            rD[xl(0x242)](),
            rD[xl(0x2dc)](),
            rD[xl(0x5a4)]());
          rD[xl(0x9fa)](), rD[xl(0xbd5)](0x0, 0x1e);
          const rG = 0x1c,
            rH = 0x24,
            rI = 0x5;
          rD[xl(0xbd5)](0x0, rG);
          for (let rJ = 0x0; rJ < rI; rJ++) {
            const rK = ((((rJ + 0.5) / rI) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              rL = ((((rJ + 0x1) / rI) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rD[xl(0xbc4)](
              Math[xl(0x802)](rK) * rH * 0.85,
              -Math[xl(0x6ad)](rK) * rH,
              Math[xl(0x802)](rL) * rG * 0.7,
              -Math[xl(0x6ad)](rL) * rG
            );
          }
          rD[xl(0x6e1)](-0x1c, -0x9),
            rD[xl(0xbc4)](-0x26, 0x0, -0x1c, 0x9),
            rD[xl(0x6e1)](0x0, rG),
            rD[xl(0x735)](),
            (rD[xl(0xd2d)] = this[xl(0x67a)](xl(0x9e4))),
            rD[xl(0x5a4)](),
            rD[xl(0x2dc)](),
            rD[xl(0x9fa)]();
          for (let rM = 0x0; rM < 0x4; rM++) {
            const rN = (((rM / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rO = -0x1e + Math[xl(0x802)](rN) * 0xd,
              rP = Math[xl(0x6ad)](rN) * 0xb;
            rD[xl(0xbd5)](rO, rP),
              rD[xl(0x6e1)](
                rO + Math[xl(0x802)](rN) * 0x1b,
                rP + Math[xl(0x6ad)](rN) * 0x1b
              );
          }
          (rD[xl(0x290)] = 0x4), rD[xl(0x2dc)]();
        }
        [us(0x49d)](rD, rE = us(0x1a6), rF = 0x0) {
          const xm = us;
          for (let rG = 0x0; rG < l1[xm(0x680)]; rG++) {
            const rH = l1[rG];
            rD[xm(0x181)](),
              rD[xm(0xd4b)](
                rH[xm(0xfa)] * Math[xm(0x6ad)](this[xm(0x175)] + rG) * 0.15 +
                  rF * rH[xm(0xb99)]
              ),
              rD[xm(0x9fa)](),
              rD[xm(0xbd5)](...rH[xm(0x516)]),
              rD[xm(0xbc4)](...rH[xm(0xc57)]),
              (rD[xm(0x44c)] = this[xm(0x67a)](rE)),
              (rD[xm(0x290)] = 0x8),
              (rD[xm(0x3e3)] = xm(0xbb8)),
              rD[xm(0x2dc)](),
              rD[xm(0x242)]();
          }
        }
        [us(0x84e)](rD) {
          const xn = us;
          rD[xn(0x9fa)]();
          let rE = 0x0,
            rF = 0x0,
            rG,
            rH;
          const rI = 0x14;
          for (let rJ = 0x0; rJ < rI; rJ++) {
            const rK = (rJ / rI) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              rL = ((rJ + 0x1) / rI) * 0x28;
            (rG = Math[xn(0x802)](rK) * rL), (rH = Math[xn(0x6ad)](rK) * rL);
            const rM = rE + rG,
              rN = rF + rH;
            rD[xn(0xbc4)](
              (rE + rM) * 0.5 + rH * 0.15,
              (rF + rN) * 0.5 - rG * 0.15,
              rM,
              rN
            ),
              (rE = rM),
              (rF = rN);
          }
          rD[xn(0xbc4)](
            rE - rH * 0.42 + rG * 0.4,
            rF + rG * 0.42 + rH * 0.4,
            rE - rH * 0.84,
            rF + rG * 0.84
          ),
            (rD[xn(0xd2d)] = this[xn(0x67a)](xn(0xd6d))),
            rD[xn(0x5a4)](),
            (rD[xn(0x290)] = 0x8),
            (rD[xn(0x44c)] = this[xn(0x67a)](xn(0x90d))),
            rD[xn(0x2dc)]();
        }
        [us(0x627)](rD) {
          const xo = us;
          rD[xo(0x477)](this[xo(0xc80)] / 0xd),
            rD[xo(0xd4b)](-Math["PI"] / 0x6),
            (rD[xo(0x3e3)] = rD[xo(0x8f6)] = xo(0xbb8)),
            rD[xo(0x9fa)](),
            rD[xo(0xbd5)](0x0, -0xe),
            rD[xo(0x6e1)](0x6, -0x14),
            (rD[xo(0xd2d)] = rD[xo(0x44c)] = this[xo(0x67a)](xo(0x4b2))),
            (rD[xo(0x290)] = 0x7),
            rD[xo(0x2dc)](),
            (rD[xo(0xd2d)] = rD[xo(0x44c)] = this[xo(0x67a)](xo(0x907))),
            (rD[xo(0x290)] = 0x2),
            rD[xo(0x2dc)](),
            rD[xo(0x9fa)](),
            rD[xo(0xbd5)](0x0, -0xc),
            rD[xo(0xbc4)](-0x6, 0x0, 0x4, 0xe),
            rD[xo(0x1db)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rD[xo(0x290)] = 0xc),
            (rD[xo(0xd2d)] = rD[xo(0x44c)] = this[xo(0x67a)](xo(0xc7a))),
            rD[xo(0x5a4)](),
            rD[xo(0x2dc)](),
            (rD[xo(0x290)] = 0x6),
            (rD[xo(0xd2d)] = rD[xo(0x44c)] = this[xo(0x67a)](xo(0xaf5))),
            rD[xo(0x2dc)](),
            rD[xo(0x5a4)]();
        }
        [us(0xac7)](rD) {
          const xp = us;
          rD[xp(0x477)](this[xp(0xc80)] / 0x2d),
            rD[xp(0x609)](-0x14, 0x0),
            (rD[xp(0x3e3)] = rD[xp(0x8f6)] = xp(0xbb8)),
            rD[xp(0x9fa)]();
          const rE = 0x6,
            rF = Math["PI"] * 0.45,
            rG = 0x3c,
            rH = 0x46;
          rD[xp(0xbd5)](0x0, 0x0);
          for (let rI = 0x0; rI < rE; rI++) {
            const rJ = ((rI / rE) * 0x2 - 0x1) * rF,
              rK = (((rI + 0x1) / rE) * 0x2 - 0x1) * rF;
            rI === 0x0 &&
              rD[xp(0xbc4)](
                -0xa,
                -0x32,
                Math[xp(0x802)](rJ) * rG,
                Math[xp(0x6ad)](rJ) * rG
              );
            const rL = (rJ + rK) / 0x2;
            rD[xp(0xbc4)](
              Math[xp(0x802)](rL) * rH,
              Math[xp(0x6ad)](rL) * rH,
              Math[xp(0x802)](rK) * rG,
              Math[xp(0x6ad)](rK) * rG
            );
          }
          rD[xp(0xbc4)](-0xa, 0x32, 0x0, 0x0),
            (rD[xp(0xd2d)] = this[xp(0x67a)](xp(0x101))),
            (rD[xp(0x44c)] = this[xp(0x67a)](xp(0xa68))),
            (rD[xp(0x290)] = 0xa),
            rD[xp(0x2dc)](),
            rD[xp(0x5a4)](),
            rD[xp(0x9fa)](),
            rD[xp(0x663)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rD[xp(0x735)](),
            (rD[xp(0x44c)] = this[xp(0x67a)](xp(0x888))),
            (rD[xp(0x290)] = 0x1e),
            rD[xp(0x2dc)](),
            (rD[xp(0x290)] = 0xa),
            (rD[xp(0x44c)] = rD[xp(0xd2d)] = this[xp(0x67a)](xp(0xa3d))),
            rD[xp(0x5a4)](),
            rD[xp(0x2dc)]();
        }
        [us(0x42f)](rD, rE = ![]) {
          const xq = us;
          rD[xq(0x477)](this[xq(0xc80)] / 0x64);
          let rF = this[xq(0x7b8)]
            ? 0.75
            : Math[xq(0x6ad)](Date[xq(0x213)]() / 0x96 + this[xq(0x175)]);
          (rF = rF * 0.5 + 0.5),
            (rF *= 0.7),
            rD[xq(0x9fa)](),
            rD[xq(0xbd5)](0x0, 0x0),
            rD[xq(0x663)](0x0, 0x0, 0x64, rF, Math["PI"] * 0x2 - rF),
            rD[xq(0x735)](),
            (rD[xq(0xd2d)] = this[xq(0x67a)](xq(0x235))),
            rD[xq(0x5a4)](),
            rD[xq(0xd02)](),
            (rD[xq(0x44c)] = xq(0xae8)),
            (rD[xq(0x290)] = rE ? 0x28 : 0x1e),
            (rD[xq(0x8f6)] = xq(0xbb8)),
            rD[xq(0x2dc)](),
            !rE &&
              (rD[xq(0x9fa)](),
              rD[xq(0x663)](
                0x0 - rF * 0x8,
                -0x32 - rF * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rD[xq(0xd2d)] = xq(0xc62)),
              rD[xq(0x5a4)]());
        }
        [us(0x29b)](rD) {
          const xr = us;
          rD[xr(0x477)](this[xr(0xc80)] / 0x50),
            rD[xr(0xd4b)](-this[xr(0x640)]),
            rD[xr(0x609)](0x0, 0x50);
          const rE = Date[xr(0x213)]() / 0x12c + this[xr(0x175)];
          rD[xr(0x9fa)]();
          const rF = 0x3;
          let rG;
          for (let rJ = 0x0; rJ < rF; rJ++) {
            const rK = ((rJ / rF) * 0x2 - 0x1) * 0x64,
              rL = (((rJ + 0x1) / rF) * 0x2 - 0x1) * 0x64;
            (rG =
              0x14 +
              (Math[xr(0x6ad)]((rJ / rF) * Math["PI"] * 0x8 + rE) * 0.5 + 0.5) *
                0x1e),
              rJ === 0x0 && rD[xr(0xbd5)](rK, -rG),
              rD[xr(0x1db)](rK, rG, rL, rG, rL, -rG);
          }
          rD[xr(0x1db)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rG),
            rD[xr(0x735)](),
            (rD[xr(0x915)] *= 0.7);
          const rH = this[xr(0x7b9)]
            ? lh[0x0]
            : this["id"] < 0x0
            ? lj[0x0]
            : lj[this["id"] % lj[xr(0x680)]];
          (rD[xr(0xd2d)] = this[xr(0x67a)](rH)),
            rD[xr(0x5a4)](),
            rD[xr(0xd02)](),
            (rD[xr(0x8f6)] = xr(0xbb8)),
            (rD[xr(0x44c)] = xr(0xae8)),
            xr(0x274),
            (rD[xr(0x290)] = 0x1e),
            rD[xr(0x2dc)]();
          let rI = Math[xr(0x6ad)](rE * 0x1);
          (rI = rI * 0.5 + 0.5),
            (rI *= 0x3),
            rD[xr(0x9fa)](),
            rD[xr(0x1e6)](
              0x0,
              -0x82 - rI * 0x2,
              0x28 - rI,
              0x14 - rI * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rD[xr(0xd2d)] = rD[xr(0x44c)]),
            rD[xr(0x5a4)]();
        }
        [us(0x39b)](rD, rE) {
          const xs = us;
          rD[xs(0x477)](this[xs(0xc80)] / 0x14);
          const rF = rD[xs(0x915)];
          (rD[xs(0x44c)] = rD[xs(0xd2d)] = this[xs(0x67a)](xs(0x87f))),
            (rD[xs(0x915)] = 0.4 * rF),
            rD[xs(0x181)](),
            rD[xs(0x9fa)](),
            rD[xs(0xd4b)](Math["PI"] * 0.16),
            rD[xs(0x609)](rE ? -0x6 : -0x9, 0x0),
            rD[xs(0xbd5)](0x0, -0x4),
            rD[xs(0xbc4)](-0x2, 0x0, 0x0, 0x4),
            (rD[xs(0x290)] = 0x8),
            (rD[xs(0x8f6)] = rD[xs(0x3e3)] = xs(0xbb8)),
            rD[xs(0x2dc)](),
            rD[xs(0x242)](),
            rD[xs(0x9fa)](),
            rD[xs(0x663)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rD[xs(0x5a4)](),
            rD[xs(0xd02)](),
            (rD[xs(0x915)] = 0.5 * rF),
            (rD[xs(0x290)] = rE ? 0x8 : 0x3),
            rD[xs(0x2dc)]();
        }
        [us(0xc82)](rD) {
          const xt = us;
          rD[xt(0x477)](this[xt(0xc80)] / 0x64);
          const rE = this[xt(0x67a)](xt(0xf1)),
            rF = this[xt(0x67a)](xt(0x99c)),
            rG = 0x4;
          rD[xt(0x8f6)] = rD[xt(0x3e3)] = xt(0xbb8);
          const rH = 0x64 - rD[xt(0x290)] * 0.5;
          for (let rI = 0x0; rI <= rG; rI++) {
            const rJ = (0x1 - rI / rG) * rH;
            lE(rD, rJ),
              (rD[xt(0x290)] =
                0x1e +
                rI *
                  (Math[xt(0x6ad)](Date[xt(0x213)]() / 0x320 + rI) * 0.5 +
                    0.5) *
                  0x5),
              (rD[xt(0xd2d)] = rD[xt(0x44c)] = rI % 0x2 === 0x0 ? rE : rF),
              rI === rG - 0x1 && rD[xt(0x5a4)](),
              rD[xt(0x2dc)]();
          }
        }
        [us(0xbb5)](rD, rE) {
          const xu = us;
          rD[xu(0x9fa)](),
            rD[xu(0x663)](0x0, 0x0, this[xu(0xc80)], 0x0, l0),
            (rD[xu(0xd2d)] = this[xu(0x67a)](rE)),
            rD[xu(0x5a4)](),
            (rD[xu(0xd2d)] = xu(0xc62));
          for (let rF = 0x1; rF < 0x4; rF++) {
            rD[xu(0x9fa)](),
              rD[xu(0x663)](
                0x0,
                0x0,
                this[xu(0xc80)] * (0x1 - rF / 0x4),
                0x0,
                l0
              ),
              rD[xu(0x5a4)]();
          }
        }
        [us(0x60a)](rD, rE) {
          const xv = us;
          rD[xv(0x609)](-this[xv(0xc80)], 0x0), (rD[xv(0x1bc)] = xv(0x498));
          const rF = 0x32;
          let rG = ![];
          !this[xv(0x481)] && ((rG = !![]), (this[xv(0x481)] = []));
          while (this[xv(0x481)][xv(0x680)] < rF) {
            this[xv(0x481)][xv(0x46a)]({
              x: rG ? Math[xv(0xba1)]() : 0x0,
              y: Math[xv(0xba1)]() * 0x2 - 0x1,
              vx: Math[xv(0xba1)]() * 0.03 + 0.02,
              size: Math[xv(0xba1)]() * 0.2 + 0.2,
            });
          }
          const rH = this[xv(0xc80)] * 0x2,
            rI = Math[xv(0x137)](this[xv(0xc80)] * 0.1, 0x4),
            rJ = rD[xv(0x915)];
          (rD[xv(0xd2d)] = rE), rD[xv(0x9fa)]();
          for (let rK = rF - 0x1; rK >= 0x0; rK--) {
            const rL = this[xv(0x481)][rK];
            rL["x"] += rL["vx"];
            const rM = rL["x"] * rH,
              rN = this[xv(0x664)] * rM,
              rO = rL["y"] * rN,
              rP =
                Math[xv(0x45f)](0x1 - Math[xv(0xb59)](rO) / rN, 0.2) *
                Math[xv(0x45f)](0x1 - rM / rH, 0.2);
            if (rL["x"] >= 0x1 || rP < 0.001) {
              this[xv(0x481)][xv(0xb0d)](rK, 0x1);
              continue;
            }
            (rD[xv(0x915)] = rP * rJ * 0.5),
              rD[xv(0x9fa)](),
              rD[xv(0x663)](
                rM,
                rO,
                rL[xv(0xc80)] * rN + rI,
                0x0,
                Math["PI"] * 0x2
              ),
              rD[xv(0x5a4)]();
          }
        }
        [us(0xcaf)](rD) {
          const xw = us;
          rD[xw(0x477)](this[xw(0xc80)] / 0x46),
            rD[xw(0xd4b)](-Math["PI"] / 0x2);
          const rE = pM / 0xc8;
          (rD[xw(0x290)] = 0x14),
            (rD[xw(0x44c)] = xw(0x370)),
            (rD[xw(0x3e3)] = rD[xw(0x8f6)] = xw(0xbb8)),
            (rD[xw(0xd2d)] = this[xw(0x67a)](xw(0xa12)));
          if (!![]) {
            this[xw(0xae3)](rD);
            return;
          }
          const rF = 0x2;
          for (let rG = 0x1; rG <= rF; rG++) {
            rD[xw(0x181)]();
            let rH = 0x1 - rG / rF;
            (rH *= 0x1 + Math[xw(0x6ad)](rE + rG) * 0.5),
              (rH = 0x1 + rH * 0.5),
              (rD[xw(0x915)] *= Math[xw(0x45f)](rG / rF, 0x2)),
              rD[xw(0xd3b)](rH, rH),
              rG !== rF &&
                ((rD[xw(0x915)] *= 0.7),
                (rD[xw(0x1bc)] = xw(0x498)),
                (rD[xw(0x9a1)] = xw(0x5ab))),
              this[xw(0xae3)](rD),
              rD[xw(0x242)]();
          }
        }
        [us(0x134)](rD, rE = 0xbe) {
          const xx = us;
          rD[xx(0x181)](),
            rD[xx(0x9fa)](),
            rD[xx(0xbd5)](0x0, -0x46 + rE + 0x1e),
            rD[xx(0x6e1)](0x1a, -0x46 + rE),
            rD[xx(0x6e1)](0xd, -0x46),
            rD[xx(0x6e1)](-0xd, -0x46),
            rD[xx(0x6e1)](-0x1a, -0x46 + rE),
            rD[xx(0x6e1)](0x0, -0x46 + rE + 0x1e),
            rD[xx(0xd02)](),
            rD[xx(0x5a4)](),
            rD[xx(0x2dc)](),
            rD[xx(0x242)](),
            rD[xx(0x181)](),
            rD[xx(0x9fa)](),
            rD[xx(0xbd5)](-0x12, -0x46),
            rD[xx(0xbc4)](-0x5, -0x50, -0xa, -0x69),
            rD[xx(0x1db)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rD[xx(0xbc4)](0x5, -0x50, 0x12, -0x46),
            rD[xx(0xbc4)](0x0, -0x3c, -0x12, -0x46),
            rD[xx(0x735)](),
            this[xx(0xd57)]
              ? ((rD[xx(0xd2d)] = this[xx(0x67a)](xx(0xcbe))),
                (rD[xx(0x44c)] = this[xx(0x67a)](xx(0x921))))
              : (rD[xx(0x44c)] = this[xx(0x67a)](xx(0xc3a))),
            rD[xx(0x5a4)](),
            (rD[xx(0x290)] = 0xa),
            rD[xx(0x2dc)](),
            rD[xx(0x242)]();
        }
        [us(0xae3)](rD) {
          const xy = us;
          rD[xy(0x181)](), rD[xy(0x9fa)]();
          for (let rE = 0x0; rE < 0x2; rE++) {
            rD[xy(0xbd5)](0x14, -0x1e),
              rD[xy(0xbc4)](0x5a, -0xa, 0x32, -0x32),
              rD[xy(0x6e1)](0xa0, -0x32),
              rD[xy(0xbc4)](0x8c, 0x3c, 0x14, 0x0),
              rD[xy(0xd3b)](-0x1, 0x1);
          }
          rD[xy(0xd02)](),
            rD[xy(0x5a4)](),
            rD[xy(0x2dc)](),
            rD[xy(0x242)](),
            this[xy(0x134)](rD),
            rD[xy(0x181)](),
            rD[xy(0x9fa)](),
            rD[xy(0x663)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rD[xy(0x6e1)](-0x32, 0x1e),
            rD[xy(0x6e1)](-0x1e, 0x1e),
            rD[xy(0x6e1)](-0x1f, 0x32),
            rD[xy(0x6e1)](0x1f, 0x32),
            rD[xy(0x6e1)](0x1e, 0x1e),
            rD[xy(0x6e1)](0x32, 0x1e),
            rD[xy(0x6e1)](0x32, 0x0),
            rD[xy(0x5a4)](),
            rD[xy(0xd02)](),
            rD[xy(0x2dc)](),
            rD[xy(0x9fa)](),
            rD[xy(0x1e6)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rD[xy(0x1e6)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rD[xy(0xd2d)] = rD[xy(0x44c)]),
            rD[xy(0x5a4)](),
            rD[xy(0x242)]();
        }
        [us(0x9f2)](rD) {
          const xz = us;
          rD[xz(0x477)](this[xz(0xc80)] / 0x64), (rD[xz(0x44c)] = xz(0xc62));
          const rE = this[xz(0x67a)](xz(0x60f)),
            rF = this[xz(0x67a)](xz(0x1bd));
          (this[xz(0xa2c)] += (pN / 0x12c) * (this[xz(0x2df)] ? 0x1 : -0x1)),
            (this[xz(0xa2c)] = Math[xz(0xd23)](
              0x1,
              Math[xz(0x137)](0x0, this[xz(0xa2c)])
            ));
          const rG = this[xz(0x7b8)] ? 0x1 : this[xz(0xa2c)],
            rH = 0x1 - rG;
          rD[xz(0x181)](),
            rD[xz(0x9fa)](),
            rD[xz(0x609)](
              (0x30 +
                (Math[xz(0x6ad)](this[xz(0x175)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rG +
                (0x1 - rG) * -0x14,
              0x0
            ),
            rD[xz(0xd3b)](1.1, 1.1),
            rD[xz(0xbd5)](0x0, -0xa),
            rD[xz(0x1db)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rD[xz(0xd2d)] = rF),
            rD[xz(0x5a4)](),
            (rD[xz(0x8f6)] = xz(0xbb8)),
            (rD[xz(0x290)] = 0x1c),
            rD[xz(0xd02)](),
            rD[xz(0x2dc)](),
            rD[xz(0x242)]();
          for (let rI = 0x0; rI < 0x2; rI++) {
            const rJ = Math[xz(0x6ad)](this[xz(0x175)] * 0x1);
            rD[xz(0x181)]();
            const rK = rI * 0x2 - 0x1;
            rD[xz(0xd3b)](0x1, rK),
              rD[xz(0x609)](0x32 * rG - rH * 0xa, 0x50 * rG),
              rD[xz(0xd4b)](rJ * 0.2 + 0.3 - rH * 0x1),
              rD[xz(0x9fa)](),
              rD[xz(0xbd5)](0xa, -0xa),
              rD[xz(0xbc4)](0x1e, 0x28, -0x14, 0x50),
              rD[xz(0xbc4)](0xa, 0x1e, -0xf, 0x0),
              (rD[xz(0x44c)] = rE),
              (rD[xz(0x290)] = 0x2c),
              (rD[xz(0x3e3)] = rD[xz(0x8f6)] = xz(0xbb8)),
              rD[xz(0x2dc)](),
              (rD[xz(0x290)] -= 0x1c),
              (rD[xz(0xd2d)] = rD[xz(0x44c)] = rF),
              rD[xz(0x5a4)](),
              rD[xz(0x2dc)](),
              rD[xz(0x242)]();
          }
          for (let rL = 0x0; rL < 0x2; rL++) {
            const rM = Math[xz(0x6ad)](this[xz(0x175)] * 0x1 + 0x1);
            rD[xz(0x181)]();
            const rN = rL * 0x2 - 0x1;
            rD[xz(0xd3b)](0x1, rN),
              rD[xz(0x609)](-0x41 * rG, 0x32 * rG),
              rD[xz(0xd4b)](rM * 0.3 + 1.3),
              rD[xz(0x9fa)](),
              rD[xz(0xbd5)](0xc, -0x5),
              rD[xz(0xbc4)](0x28, 0x1e, 0x0, 0x3c),
              rD[xz(0xbc4)](0x14, 0x1e, 0x0, 0x0),
              (rD[xz(0x44c)] = rE),
              (rD[xz(0x290)] = 0x2c),
              (rD[xz(0x3e3)] = rD[xz(0x8f6)] = xz(0xbb8)),
              rD[xz(0x2dc)](),
              (rD[xz(0x290)] -= 0x1c),
              (rD[xz(0xd2d)] = rD[xz(0x44c)] = rF),
              rD[xz(0x2dc)](),
              rD[xz(0x5a4)](),
              rD[xz(0x242)]();
          }
          this[xz(0xafc)](rD);
        }
        [us(0xafc)](rD, rE = 0x1) {
          const xA = us;
          rD[xA(0x9fa)](),
            rD[xA(0x663)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rD[xA(0x44c)] = xA(0xc62)),
            (rD[xA(0xd2d)] = this[xA(0x67a)](xA(0x3a6))),
            rD[xA(0x5a4)](),
            (rD[xA(0x290)] = 0x1e * rE),
            rD[xA(0x181)](),
            rD[xA(0xd02)](),
            rD[xA(0x2dc)](),
            rD[xA(0x242)](),
            rD[xA(0x181)](),
            rD[xA(0x9fa)](),
            rD[xA(0x663)](
              0x0,
              0x0,
              0x64 - rD[xA(0x290)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rD[xA(0xd02)](),
            rD[xA(0x9fa)]();
          for (let rF = 0x0; rF < 0x6; rF++) {
            const rG = (rF / 0x6) * Math["PI"] * 0x2;
            rD[xA(0x6e1)](
              Math[xA(0x802)](rG) * 0x28,
              Math[xA(0x6ad)](rG) * 0x28
            );
          }
          rD[xA(0x735)]();
          for (let rH = 0x0; rH < 0x6; rH++) {
            const rI = (rH / 0x6) * Math["PI"] * 0x2,
              rJ = Math[xA(0x802)](rI) * 0x28,
              rK = Math[xA(0x6ad)](rI) * 0x28;
            rD[xA(0xbd5)](rJ, rK), rD[xA(0x6e1)](rJ * 0x3, rK * 0x3);
          }
          (rD[xA(0x290)] = 0x10 * rE),
            (rD[xA(0x3e3)] = rD[xA(0x8f6)] = xA(0xbb8)),
            rD[xA(0x2dc)](),
            rD[xA(0x242)]();
        }
        [us(0x649)](rD) {
          const xB = us;
          rD[xB(0x477)](this[xB(0xc80)] / 0x82);
          let rE, rF;
          const rG = 0x2d,
            rH = lp(
              this[xB(0x662)] ||
                (this[xB(0x662)] = this[xB(0x7b8)]
                  ? 0x28
                  : Math[xB(0xba1)]() * 0x3e8)
            );
          let rI = rH() * 6.28;
          const rJ = Date[xB(0x213)]() / 0xc8,
            rK = [xB(0x902), xB(0x9ae)][xB(0xd91)]((rL) => this[xB(0x67a)](rL));
          for (let rL = 0x0; rL <= rG; rL++) {
            (rL % 0x5 === 0x0 || rL === rG) &&
              (rL > 0x0 &&
                ((rD[xB(0x290)] = 0x19),
                (rD[xB(0x8f6)] = rD[xB(0x3e3)] = xB(0xbb8)),
                (rD[xB(0x44c)] = rK[0x1]),
                rD[xB(0x2dc)](),
                (rD[xB(0x290)] = 0xc),
                (rD[xB(0x44c)] = rK[0x0]),
                rD[xB(0x2dc)]()),
              rL !== rG && (rD[xB(0x9fa)](), rD[xB(0xbd5)](rE, rF)));
            let rM = rL / 0x32;
            (rM *= rM), (rI += (0.3 + rH() * 0.8) * 0x3);
            const rN = 0x14 + Math[xB(0x6ad)](rM * 3.14) * 0x6e,
              rO = Math[xB(0x6ad)](rL + rJ) * 0.5,
              rP = Math[xB(0x802)](rI + rO) * rN,
              rQ = Math[xB(0x6ad)](rI + rO) * rN,
              rR = rP - rE,
              rS = rQ - rF;
            rD[xB(0xbc4)]((rE + rP) / 0x2 + rS, (rF + rQ) / 0x2 - rR, rP, rQ),
              (rE = rP),
              (rF = rQ);
          }
        }
        [us(0x82)](rD) {
          const xC = us;
          rD[xC(0x477)](this[xC(0xc80)] / 0x6e),
            (rD[xC(0x44c)] = xC(0xc62)),
            (rD[xC(0x290)] = 0x1c),
            rD[xC(0x9fa)](),
            rD[xC(0x663)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rD[xC(0xd2d)] = this[xC(0x67a)](xC(0x9ec))),
            rD[xC(0x5a4)](),
            rD[xC(0x181)](),
            rD[xC(0xd02)](),
            rD[xC(0x2dc)](),
            rD[xC(0x242)](),
            rD[xC(0x9fa)](),
            rD[xC(0x663)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rD[xC(0xd2d)] = xC(0xbe5)),
            rD[xC(0x5a4)](),
            rD[xC(0x181)](),
            rD[xC(0xd02)](),
            rD[xC(0x2dc)](),
            rD[xC(0x242)]();
          const rE = lp(
              this[xC(0x65b)] ||
                (this[xC(0x65b)] = this[xC(0x7b8)]
                  ? 0x1e
                  : Math[xC(0xba1)]() * 0x3e8)
            ),
            rF = this[xC(0x67a)](xC(0xcae)),
            rG = this[xC(0x67a)](xC(0x446));
          for (let rJ = 0x0; rJ < 0x3; rJ++) {
            rD[xC(0x9fa)]();
            const rK = 0xc;
            for (let rL = 0x0; rL < rK; rL++) {
              const rM = (Math["PI"] * 0x2 * rL) / rK;
              rD[xC(0x181)](),
                rD[xC(0xd4b)](rM + rE() * 0.4),
                rD[xC(0x609)](0x3c + rE() * 0xa, 0x0),
                rD[xC(0xbd5)](rE() * 0x5, rE() * 0x5),
                rD[xC(0x1db)](
                  0x14 + rE() * 0xa,
                  rE() * 0x14,
                  0x28 + rE() * 0x14,
                  rE() * 0x1e + 0xa,
                  0x3c + rE() * 0xa,
                  rE() * 0xa + 0xa
                ),
                rD[xC(0x242)]();
            }
            (rD[xC(0x3e3)] = rD[xC(0x8f6)] = xC(0xbb8)),
              (rD[xC(0x290)] = 0x12 - rJ * 0x2),
              (rD[xC(0x44c)] = rF),
              rD[xC(0x2dc)](),
              (rD[xC(0x290)] -= 0x8),
              (rD[xC(0x44c)] = rG),
              rD[xC(0x2dc)]();
          }
          const rH = 0x28;
          rD[xC(0xd4b)](-this[xC(0x640)]),
            (rD[xC(0xd2d)] = this[xC(0x67a)](xC(0xc9c))),
            (rD[xC(0x44c)] = this[xC(0x67a)](xC(0xc17))),
            (rD[xC(0x290)] = 0x9);
          const rI = this[xC(0xca2)] * 0x6;
          for (let rN = 0x0; rN < rI; rN++) {
            const rO = ((rN - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rD[xC(0x9fa)](),
              rD[xC(0x1e6)](
                Math[xC(0x802)](rO) * rH,
                Math[xC(0x6ad)](rO) * rH * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rD[xC(0x5a4)](),
              rD[xC(0x2dc)]();
          }
        }
        [us(0x81b)](rD) {
          const xD = us;
          rD[xD(0xd4b)](-this[xD(0x640)]),
            rD[xD(0x477)](this[xD(0xc80)] / 0x3c),
            (rD[xD(0x3e3)] = rD[xD(0x8f6)] = xD(0xbb8));
          let rE =
            Math[xD(0x6ad)](Date[xD(0x213)]() / 0x12c + this[xD(0x175)] * 0.5) *
              0.5 +
            0.5;
          (rE *= 1.5),
            rD[xD(0x9fa)](),
            rD[xD(0xbd5)](-0x32, -0x32 - rE * 0x3),
            rD[xD(0xbc4)](0x0, -0x3c, 0x32, -0x32 - rE * 0x3),
            rD[xD(0xbc4)](0x50 - rE * 0x3, -0xa, 0x50, 0x32),
            rD[xD(0xbc4)](0x46, 0x4b, 0x28, 0x4e + rE * 0x5),
            rD[xD(0x6e1)](0x1e, 0x3c + rE * 0x5),
            rD[xD(0xbc4)](0x2d, 0x37, 0x32, 0x2d),
            rD[xD(0xbc4)](0x0, 0x41, -0x32, 0x32),
            rD[xD(0xbc4)](-0x2d, 0x37, -0x1e, 0x3c + rE * 0x3),
            rD[xD(0x6e1)](-0x28, 0x4e + rE * 0x5),
            rD[xD(0xbc4)](-0x46, 0x4b, -0x50, 0x32),
            rD[xD(0xbc4)](-0x50 + rE * 0x3, -0xa, -0x32, -0x32 - rE * 0x3),
            (rD[xD(0xd2d)] = this[xD(0x67a)](xD(0xa41))),
            rD[xD(0x5a4)](),
            (rD[xD(0x44c)] = xD(0xc62)),
            rD[xD(0x181)](),
            rD[xD(0xd02)](),
            (rD[xD(0x290)] = 0xe),
            rD[xD(0x2dc)](),
            rD[xD(0x242)]();
          for (let rF = 0x0; rF < 0x2; rF++) {
            rD[xD(0x181)](),
              rD[xD(0xd3b)](rF * 0x2 - 0x1, 0x1),
              rD[xD(0x609)](-0x22, -0x18 - rE * 0x3),
              rD[xD(0xd4b)](-0.6),
              rD[xD(0xd3b)](1.3, 1.3),
              rD[xD(0x9fa)](),
              rD[xD(0xbd5)](-0x14, 0x0),
              rD[xD(0xbc4)](-0x14, -0x19, 0x0, -0x28),
              rD[xD(0xbc4)](0x14, -0x19, 0x14, 0x0),
              rD[xD(0x5a4)](),
              rD[xD(0xd02)](),
              (rD[xD(0x290)] = 0xd),
              rD[xD(0x2dc)](),
              rD[xD(0x242)]();
          }
          rD[xD(0x181)](),
            rD[xD(0x9fa)](),
            rD[xD(0x1e6)](
              0x0,
              0x1e,
              0x24 - rE * 0x2,
              0x8 - rE,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rD[xD(0xd2d)] = this[xD(0x67a)](xD(0xcd))),
            (rD[xD(0x915)] *= 0.2),
            rD[xD(0x5a4)](),
            rD[xD(0x242)](),
            (rD[xD(0xd2d)] = rD[xD(0x44c)] = this[xD(0x67a)](xD(0xa97)));
          for (let rG = 0x0; rG < 0x2; rG++) {
            rD[xD(0x181)](),
              rD[xD(0xd3b)](rG * 0x2 - 0x1, 0x1),
              rD[xD(0x609)](0x19 - rE * 0x1, 0xf - rE * 0x3),
              rD[xD(0xd4b)](-0.3),
              rD[xD(0x9fa)](),
              rD[xD(0x663)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rD[xD(0x5a4)](),
              rD[xD(0x242)]();
          }
          rD[xD(0x181)](),
            (rD[xD(0x290)] = 0x5),
            rD[xD(0x609)](0x0, 0x21 - rE * 0x1),
            rD[xD(0x9fa)](),
            rD[xD(0xbd5)](-0xc, 0x0),
            rD[xD(0x1db)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rD[xD(0x1db)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rD[xD(0x2dc)](),
            rD[xD(0x242)]();
        }
        [us(0xab8)](rD) {
          const xE = us;
          rD[xE(0x477)](this[xE(0xc80)] / 0x3c),
            rD[xE(0xd4b)](-Math["PI"] / 0x2),
            rD[xE(0x9fa)](),
            rD[xE(0xbd5)](0x32, 0x50),
            rD[xE(0xbc4)](0x1e, 0x1e, 0x32, -0x14),
            rD[xE(0xbc4)](0x5a, -0x64, 0x0, -0x64),
            rD[xE(0xbc4)](-0x5a, -0x64, -0x32, -0x14),
            rD[xE(0xbc4)](-0x1e, 0x1e, -0x32, 0x50),
            (rD[xE(0xd2d)] = this[xE(0x67a)](xE(0x369))),
            rD[xE(0x5a4)](),
            (rD[xE(0x8f6)] = rD[xE(0x3e3)] = xE(0xbb8)),
            (rD[xE(0x290)] = 0x14),
            rD[xE(0xd02)](),
            (rD[xE(0x44c)] = xE(0xc62)),
            rD[xE(0x2dc)](),
            (rD[xE(0xd2d)] = this[xE(0x67a)](xE(0xdc)));
          const rE = 0x6;
          rD[xE(0x9fa)](), rD[xE(0xbd5)](-0x32, 0x50);
          for (let rF = 0x0; rF < rE; rF++) {
            const rG = (((rF + 0.5) / rE) * 0x2 - 0x1) * 0x32,
              rH = (((rF + 0x1) / rE) * 0x2 - 0x1) * 0x32;
            rD[xE(0xbc4)](rG, 0x1e, rH, 0x50);
          }
          (rD[xE(0x290)] = 0x8),
            rD[xE(0x5a4)](),
            rD[xE(0x2dc)](),
            (rD[xE(0x44c)] = rD[xE(0xd2d)] = xE(0xc62)),
            rD[xE(0x181)](),
            rD[xE(0x609)](0x0, -0x5),
            rD[xE(0x9fa)](),
            rD[xE(0xbd5)](0x0, 0x0),
            rD[xE(0x1db)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rD[xE(0x2dc)](),
            rD[xE(0x242)]();
          for (let rI = 0x0; rI < 0x2; rI++) {
            rD[xE(0x181)](),
              rD[xE(0xd3b)](rI * 0x2 - 0x1, 0x1),
              rD[xE(0x609)](0x19, -0x38),
              rD[xE(0x9fa)](),
              rD[xE(0x663)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rD[xE(0xd02)](),
              (rD[xE(0x290)] = 0xf),
              rD[xE(0x2dc)](),
              rD[xE(0x5a4)](),
              rD[xE(0x242)]();
          }
        }
        [us(0x1d8)](rD) {
          const xF = us;
          rD[xF(0x477)](this[xF(0xc80)] / 0x32),
            (rD[xF(0x44c)] = xF(0xc62)),
            (rD[xF(0x290)] = 0x10);
          const rE = 0x7;
          rD[xF(0x9fa)]();
          const rF = 0x12;
          rD[xF(0xd2d)] = this[xF(0x67a)](xF(0x56d));
          const rG = Math[xF(0x6ad)](pM / 0x258);
          for (let rH = 0x0; rH < 0x2; rH++) {
            const rI = 1.2 - rH * 0.2;
            for (let rJ = 0x0; rJ < rE; rJ++) {
              rD[xF(0x181)](),
                rD[xF(0xd4b)](
                  (rJ / rE) * Math["PI"] * 0x2 + (rH / rE) * Math["PI"]
                ),
                rD[xF(0x609)](0x2e, 0x0),
                rD[xF(0xd3b)](rI, rI);
              const rK = Math[xF(0x6ad)](rG + rJ * 0.05 * (0x1 - rH * 0.5));
              rD[xF(0x9fa)](),
                rD[xF(0xbd5)](0x0, rF),
                rD[xF(0xbc4)](0x14, rF, 0x28 + rK, 0x0 + rK * 0x5),
                rD[xF(0xbc4)](0x14, -rF, 0x0, -rF),
                rD[xF(0x5a4)](),
                rD[xF(0xd02)](),
                rD[xF(0x2dc)](),
                rD[xF(0x242)]();
            }
          }
          rD[xF(0x9fa)](),
            rD[xF(0x663)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rD[xF(0xd2d)] = this[xF(0x67a)](xF(0x409))),
            rD[xF(0x5a4)](),
            rD[xF(0xd02)](),
            (rD[xF(0x290)] = 0x19),
            rD[xF(0x2dc)]();
        }
        [us(0x5ff)](rD) {
          const xG = us;
          rD[xG(0x477)](this[xG(0xc80)] / 0x28);
          let rE = this[xG(0x175)];
          const rF = this[xG(0x7b8)] ? 0x0 : Math[xG(0x6ad)](pM / 0x64) * 0xf;
          (rD[xG(0x3e3)] = rD[xG(0x8f6)] = xG(0xbb8)),
            rD[xG(0x9fa)](),
            rD[xG(0x181)]();
          const rG = 0x3;
          for (let rH = 0x0; rH < 0x2; rH++) {
            const rI = rH === 0x0 ? 0x1 : -0x1;
            for (let rJ = 0x0; rJ <= rG; rJ++) {
              rD[xG(0x181)](), rD[xG(0xbd5)](0x0, 0x0);
              const rK = Math[xG(0x6ad)](rE + rJ + rH);
              rD[xG(0xd4b)](((rJ / rG) * 0x2 - 0x1) * 0.6 + 1.4 + rK * 0.15),
                rD[xG(0x6e1)](0x2d + rI * rF, 0x0),
                rD[xG(0xd4b)](0.2 + (rK * 0.5 + 0.5) * 0.1),
                rD[xG(0x6e1)](0x4b, 0x0),
                rD[xG(0x242)]();
            }
            rD[xG(0xd3b)](0x1, -0x1);
          }
          rD[xG(0x242)](),
            (rD[xG(0x290)] = 0x8),
            (rD[xG(0x44c)] = this[xG(0x67a)](xG(0x68b))),
            rD[xG(0x2dc)](),
            rD[xG(0x181)](),
            rD[xG(0x609)](0x0, rF),
            this[xG(0x3f5)](rD),
            rD[xG(0x242)]();
        }
        [us(0x3f5)](rD, rE = ![]) {
          const xH = us;
          (rD[xH(0x3e3)] = rD[xH(0x8f6)] = xH(0xbb8)),
            rD[xH(0xd4b)](-0.15),
            rD[xH(0x9fa)](),
            rD[xH(0xbd5)](-0x32, 0x0),
            rD[xH(0x6e1)](0x28, 0x0),
            rD[xH(0xbd5)](0xf, 0x0),
            rD[xH(0x6e1)](-0x5, 0x19),
            rD[xH(0xbd5)](-0x3, 0x0),
            rD[xH(0x6e1)](0xc, -0x14),
            rD[xH(0xbd5)](-0xe, -0x5),
            rD[xH(0x6e1)](-0x2e, -0x17),
            (rD[xH(0x290)] = 0x1c),
            (rD[xH(0x44c)] = this[xH(0x67a)](xH(0xc8e))),
            rD[xH(0x2dc)](),
            (rD[xH(0x44c)] = this[xH(0x67a)](xH(0x995))),
            (rD[xH(0x290)] -= rE ? 0xf : 0xa),
            rD[xH(0x2dc)]();
        }
        [us(0xcd0)](rD) {
          const xI = us;
          rD[xI(0x477)](this[xI(0xc80)] / 0x64),
            rD[xI(0x9fa)](),
            rD[xI(0x663)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rD[xI(0xd2d)] = this[xI(0x67a)](xI(0x2a0))),
            rD[xI(0x5a4)](),
            rD[xI(0xd02)](),
            (rD[xI(0x290)] = this[xI(0xd57)] ? 0x32 : 0x1e),
            (rD[xI(0x44c)] = xI(0xc62)),
            rD[xI(0x2dc)]();
          if (!this[xI(0x404)]) {
            const rE = new Path2D(),
              rF = this[xI(0xd57)] ? 0x2 : 0x3;
            for (let rG = 0x0; rG <= rF; rG++) {
              for (let rH = 0x0; rH <= rF; rH++) {
                const rI =
                    ((rH / rF + Math[xI(0xba1)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rG % 0x2 === 0x0 ? -0x14 : 0x0),
                  rJ = ((rG / rF + Math[xI(0xba1)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rK = Math[xI(0xba1)]() * 0xd + (this[xI(0xd57)] ? 0xe : 0x7);
                rE[xI(0xbd5)](rI, rJ),
                  rE[xI(0x663)](rI, rJ, rK, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xI(0x404)] = rE;
          }
          rD[xI(0x9fa)](),
            rD[xI(0x663)](
              0x0,
              0x0,
              0x64 - rD[xI(0x290)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rD[xI(0xd02)](),
            (rD[xI(0xd2d)] = xI(0xd71)),
            rD[xI(0x5a4)](this[xI(0x404)]);
        }
        [us(0x80)](rD) {
          const xJ = us;
          rD[xJ(0x477)](this[xJ(0xc80)] / 0x64),
            rD[xJ(0x181)](),
            rD[xJ(0x609)](-0xf5, -0xdc),
            (rD[xJ(0x44c)] = this[xJ(0x67a)](xJ(0x96a))),
            (rD[xJ(0xd2d)] = this[xJ(0x67a)](xJ(0x4f6))),
            (rD[xJ(0x290)] = 0xf),
            (rD[xJ(0x8f6)] = rD[xJ(0x3e3)] = xJ(0xbb8));
          const rE = !this[xJ(0xd57)];
          if (rE) {
            rD[xJ(0x181)](),
              rD[xJ(0x609)](0x10e, 0xde),
              rD[xJ(0x181)](),
              rD[xJ(0xd4b)](-0.1);
            for (let rF = 0x0; rF < 0x3; rF++) {
              rD[xJ(0x9fa)](),
                rD[xJ(0xbd5)](-0x5, 0x0),
                rD[xJ(0xbc4)](0x0, 0x28, 0x5, 0x0),
                rD[xJ(0x2dc)](),
                rD[xJ(0x5a4)](),
                rD[xJ(0x609)](0x28, 0x0);
            }
            rD[xJ(0x242)](), rD[xJ(0x609)](0x17, 0x32), rD[xJ(0xd4b)](0.05);
            for (let rG = 0x0; rG < 0x2; rG++) {
              rD[xJ(0x9fa)](),
                rD[xJ(0xbd5)](-0x5, 0x0),
                rD[xJ(0xbc4)](0x0, -0x28, 0x5, 0x0),
                rD[xJ(0x2dc)](),
                rD[xJ(0x5a4)](),
                rD[xJ(0x609)](0x28, 0x0);
            }
            rD[xJ(0x242)]();
          }
          rD[xJ(0x5a4)](lm),
            rD[xJ(0x2dc)](lm),
            rD[xJ(0x5a4)](ln),
            rD[xJ(0x2dc)](ln),
            rD[xJ(0x242)](),
            rE &&
              (rD[xJ(0x9fa)](),
              rD[xJ(0x663)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rD[xJ(0x663)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rD[xJ(0xd2d)] = xJ(0xc62)),
              rD[xJ(0x5a4)]());
        }
        [us(0x3b6)](rD) {
          const xK = us;
          rD[xK(0x477)](this[xK(0xc80)] / 0x46), rD[xK(0x181)]();
          !this[xK(0xd57)] && rD[xK(0xd4b)](Math["PI"] / 0x2);
          rD[xK(0x609)](0x0, 0x2d),
            rD[xK(0x9fa)](),
            rD[xK(0xbd5)](0x0, -0x64),
            rD[xK(0x1db)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rD[xK(0x1db)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rD[xK(0x3e3)] = rD[xK(0x8f6)] = xK(0xbb8)),
            (rD[xK(0x290)] = 0x3c),
            (rD[xK(0x44c)] = this[xK(0x67a)](xK(0x33f))),
            rD[xK(0x2dc)](),
            (rD[xK(0x290)] -= this[xK(0xd57)] ? 0x23 : 0x14),
            (rD[xK(0xd2d)] = rD[xK(0x44c)] = this[xK(0x67a)](xK(0x8bb))),
            rD[xK(0x2dc)](),
            (rD[xK(0x290)] -= this[xK(0xd57)] ? 0x16 : 0xf),
            (rD[xK(0xd2d)] = rD[xK(0x44c)] = this[xK(0x67a)](xK(0x799))),
            rD[xK(0x2dc)](),
            rD[xK(0x5a4)](),
            rD[xK(0x609)](0x0, -0x24);
          if (this[xK(0xd57)]) rD[xK(0x477)](0.9);
          rD[xK(0x9fa)](),
            rD[xK(0x1e6)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rD[xK(0xd2d)] = this[xK(0x67a)](xK(0xba3))),
            rD[xK(0x5a4)](),
            rD[xK(0xd02)](),
            (rD[xK(0x290)] = 0xd),
            (rD[xK(0x44c)] = xK(0xc62)),
            rD[xK(0x2dc)](),
            rD[xK(0x9fa)](),
            rD[xK(0x1e6)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rD[xK(0xd2d)] = xK(0x4d4)),
            rD[xK(0x5a4)](),
            rD[xK(0x242)]();
        }
        [us(0x85)](rD) {
          const xL = us;
          rD[xL(0x477)](this[xL(0xc80)] / 0x19);
          !this[xL(0x7b8)] &&
            this[xL(0xd57)] &&
            rD[xL(0xd4b)](Math[xL(0x6ad)](pM / 0x64 + this["id"]) * 0.15);
          rD[xL(0x9fa)](),
            rD[xL(0x778)](-0x16, -0x16, 0x2c, 0x2c),
            (rD[xL(0xd2d)] = this[xL(0x67a)](xL(0x87f))),
            rD[xL(0x5a4)](),
            (rD[xL(0x290)] = 0x6),
            (rD[xL(0x8f6)] = xL(0xbb8)),
            (rD[xL(0x44c)] = this[xL(0x67a)](xL(0x4f6))),
            rD[xL(0x2dc)](),
            rD[xL(0x9fa)]();
          const rE = this[xL(0x7b8)] ? 0x1 : 0x1 - Math[xL(0x6ad)](pM / 0x1f4),
            rF = rJ(0x0, 0.25),
            rG = 0x1 - rJ(0.25, 0.25),
            rH = rJ(0.5, 0.25),
            rI = rJ(0.75, 0.25);
          function rJ(rK, rL) {
            const xM = xL;
            return Math[xM(0xd23)](0x1, Math[xM(0x137)](0x0, (rE - rK) / rL));
          }
          rD[xL(0xd4b)]((rG * Math["PI"]) / 0x4);
          for (let rK = 0x0; rK < 0x2; rK++) {
            const rL = (rK * 0x2 - 0x1) * 0x7 * rI;
            for (let rM = 0x0; rM < 0x3; rM++) {
              let rN = rF * (-0xb + rM * 0xb);
              rD[xL(0xbd5)](rN, rL),
                rD[xL(0x663)](rN, rL, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rD[xL(0xd2d)] = this[xL(0x67a)](xL(0x237))), rD[xL(0x5a4)]();
        }
        [us(0xa46)](rD) {
          const xN = us;
          rD[xN(0x181)](),
            rD[xN(0x609)](this["x"], this["y"]),
            this[xN(0x1e8)](rD),
            rD[xN(0xd4b)](this[xN(0x640)]),
            (rD[xN(0x290)] = 0x8);
          const rE = (rJ, rK) => {
              const xO = xN;
              (rG = this[xO(0xc80)] / 0x14),
                rD[xO(0xd3b)](rG, rG),
                rD[xO(0x9fa)](),
                rD[xO(0x663)](0x0, 0x0, 0x14, 0x0, l0),
                (rD[xO(0xd2d)] = this[xO(0x67a)](rJ)),
                rD[xO(0x5a4)](),
                (rD[xO(0x44c)] = this[xO(0x67a)](rK)),
                rD[xO(0x2dc)]();
            },
            rF = (rJ, rK, rL) => {
              const xP = xN;
              (rJ = l8[rJ]),
                rD[xP(0xd3b)](this[xP(0xc80)], this[xP(0xc80)]),
                (rD[xP(0x290)] /= this[xP(0xc80)]),
                (rD[xP(0x44c)] = this[xP(0x67a)](rL)),
                rD[xP(0x2dc)](rJ),
                (rD[xP(0xd2d)] = this[xP(0x67a)](rK)),
                rD[xP(0x5a4)](rJ);
            };
          let rG, rH, rI;
          switch (this[xN(0xb8a)]) {
            case cS[xN(0x85)]:
            case cS[xN(0xb43)]:
              this[xN(0x85)](rD);
              break;
            case cS[xN(0x3b6)]:
            case cS[xN(0xc54)]:
              this[xN(0x3b6)](rD);
              break;
            case cS[xN(0xc44)]:
              (rD[xN(0x44c)] = xN(0xc62)),
                (rD[xN(0x290)] = 0x14),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0xa12))),
                rD[xN(0x609)](-this[xN(0xc80)], 0x0),
                rD[xN(0xd4b)](-Math["PI"] / 0x2),
                rD[xN(0x477)](0.5),
                rD[xN(0x609)](0x0, 0x46),
                this[xN(0x134)](rD, this[xN(0xc80)] * 0x4);
              break;
            case cS[xN(0xcaf)]:
              this[xN(0xcaf)](rD);
              break;
            case cS[xN(0x6cc)]:
              this[xN(0x80)](rD);
              break;
            case cS[xN(0x80)]:
              this[xN(0x80)](rD);
              break;
            case cS[xN(0xcd0)]:
            case cS[xN(0xcac)]:
              this[xN(0xcd0)](rD);
              break;
            case cS[xN(0x2ae)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x1e), this[xN(0x3f5)](rD, !![]);
              break;
            case cS[xN(0x5ff)]:
              this[xN(0x5ff)](rD);
              break;
            case cS[xN(0x360)]:
              (rD[xN(0x290)] *= 0.7),
                rF(xN(0x538), xN(0x56d), xN(0x8e2)),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0.6, 0x0, l0),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x409))),
                rD[xN(0x5a4)](),
                rD[xN(0xd02)](),
                (rD[xN(0x44c)] = xN(0x66f)),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x1d8)]:
              this[xN(0x1d8)](rD);
              break;
            case cS[xN(0x47a)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x16),
                rD[xN(0xd4b)](Math["PI"] / 0x2),
                rD[xN(0x9fa)]();
              for (let sv = 0x0; sv < 0x2; sv++) {
                rD[xN(0xbd5)](-0xa, -0x1e),
                  rD[xN(0x1db)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rD[xN(0xd3b)](0x1, -0x1);
              }
              (rD[xN(0x290)] = 0x10),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x859))),
                rD[xN(0x2dc)](),
                (rD[xN(0x290)] -= 0x7),
                (rD[xN(0x44c)] = xN(0xa01)),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x2aa)]:
              this[xN(0xab8)](rD);
              break;
            case cS[xN(0xb90)]:
              this[xN(0x81b)](rD);
              break;
            case cS[xN(0x82)]:
              this[xN(0x82)](rD);
              break;
            case cS[xN(0x649)]:
              this[xN(0x649)](rD);
              break;
            case cS[xN(0x1ea)]:
              !this[xN(0xc89)] &&
                ((this[xN(0xc89)] = new lT(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cY[xN(0x2ee)],
                  0x19
                )),
                (this[xN(0xc89)][xN(0x8ee)] = !![]),
                (this[xN(0xc89)][xN(0x8ca)] = !![]),
                (this[xN(0xc89)][xN(0x2c1)] = 0x1),
                (this[xN(0xc89)][xN(0x105)] = !![]),
                (this[xN(0xc89)][xN(0x9ca)] = xN(0x348)),
                (this[xN(0xc89)][xN(0xaee)] = this[xN(0xaee)]));
              rD[xN(0xd4b)](Math["PI"] / 0x2),
                (this[xN(0xc89)][xN(0x59d)] = this[xN(0x59d)]),
                (this[xN(0xc89)][xN(0xc80)] = this[xN(0xc80)]),
                this[xN(0xc89)][xN(0xa46)](rD);
              break;
            case cS[xN(0x9f2)]:
              this[xN(0x9f2)](rD);
              break;
            case cS[xN(0x7a0)]:
              rD[xN(0x181)](),
                rD[xN(0x477)](this[xN(0xc80)] / 0x64),
                rD[xN(0xd4b)]((Date[xN(0x213)]() / 0x190) % 6.28),
                this[xN(0xafc)](rD, 1.5),
                rD[xN(0x242)]();
              break;
            case cS[xN(0x7c)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x14),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x0, -0x5),
                rD[xN(0x6e1)](-0x8, 0x0),
                rD[xN(0x6e1)](0x0, 0x5),
                rD[xN(0x6e1)](0x8, 0x0),
                rD[xN(0x735)](),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x20),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0xbd6))),
                rD[xN(0x2dc)](),
                (rD[xN(0x290)] = 0x14),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0xb61))),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x199)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x14),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x5, -0x5),
                rD[xN(0x6e1)](-0x5, 0x5),
                rD[xN(0x6e1)](0x5, 0x0),
                rD[xN(0x735)](),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x20),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x154))),
                rD[xN(0x2dc)](),
                (rD[xN(0x290)] = 0x14),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x830))),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x90b)]:
              this[xN(0x60a)](rD, xN(0x4bb));
              break;
            case cS[xN(0xc35)]:
              this[xN(0x60a)](rD, xN(0xb0f));
              break;
            case cS[xN(0x271)]:
              this[xN(0x60a)](rD, xN(0xc81));
              break;
            case cS[xN(0xc82)]:
              this[xN(0xc82)](rD);
              break;
            case cS[xN(0x29b)]:
              this[xN(0x29b)](rD);
              break;
            case cS[xN(0x42f)]:
              this[xN(0x42f)](rD);
              break;
            case cS[xN(0x5a2)]:
              this[xN(0x42f)](rD, !![]);
              break;
            case cS[xN(0x627)]:
              this[xN(0x627)](rD);
              break;
            case cS[xN(0xac7)]:
              this[xN(0xac7)](rD);
              break;
            case cS[xN(0x990)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x19),
                lE(rD, 0x19),
                (rD[xN(0x8f6)] = xN(0xbb8)),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x645))),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x904))),
                rD[xN(0x5a4)](),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x950)]:
              rD[xN(0x609)](-this[xN(0xc80)], 0x0);
              const rJ = Date[xN(0x213)]() / 0x32,
                rK = this[xN(0xc80)] * 0x2;
              rD[xN(0x9fa)]();
              const rL = 0x32;
              for (let sw = 0x0; sw < rL; sw++) {
                const sx = sw / rL,
                  sy = sx * Math["PI"] * (this[xN(0x7b8)] ? 7.75 : 0xa) - rJ,
                  sz = sx * rK,
                  sA = sz * this[xN(0x664)];
                rD[xN(0x6e1)](sz, Math[xN(0x6ad)](sy) * sA);
              }
              (rD[xN(0x44c)] = xN(0x155)),
                (rD[xN(0x8f6)] = rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x4),
                (rD[xN(0x924)] = xN(0x4e6)),
                (rD[xN(0x776)] = this[xN(0x7b8)] ? 0xa : 0x14),
                rD[xN(0x2dc)](),
                rD[xN(0x2dc)](),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x896)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x37), this[xN(0x84e)](rD);
              break;
            case cS[xN(0x840)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x14), rD[xN(0x9fa)]();
              for (let sB = 0x0; sB < 0x2; sB++) {
                rD[xN(0xbd5)](-0x17, -0x5),
                  rD[xN(0xbc4)](0x0, 5.5, 0x17, -0x5),
                  rD[xN(0xd3b)](0x1, -0x1);
              }
              (rD[xN(0x290)] = 0xf),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x4f6))),
                rD[xN(0x2dc)](),
                (rD[xN(0x290)] -= 0x6),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x87f))),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x6de)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x23),
                rD[xN(0x9fa)](),
                rD[xN(0x1e6)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x352))),
                rD[xN(0x5a4)](),
                rD[xN(0xd02)](),
                (rD[xN(0x44c)] = xN(0xbe5)),
                (rD[xN(0x290)] = 0x12),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x1e, 0x0),
                rD[xN(0x1db)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rD[xN(0x1db)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rD[xN(0x290)] = 0x3),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                (rD[xN(0x44c)] = rD[xN(0xd2d)] = xN(0x6c6)),
                rD[xN(0x5a4)](),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x102)]:
              if (this[xN(0x2ba)] !== this[xN(0x10b)]) {
                this[xN(0x2ba)] = this[xN(0x10b)];
                const sC = new Path2D(),
                  sD = Math[xN(0xbb8)](
                    this[xN(0x10b)] * (this[xN(0x10b)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sE = (Math["PI"] * 0x2) / sD,
                  sF = this[xN(0x10b)] < 0x64 ? 0.3 : 0.1;
                for (let sG = 0x0; sG < sD; sG++) {
                  const sH = sG * sE,
                    sI = sH + Math[xN(0xba1)]() * sE,
                    sJ = 0x1 - Math[xN(0xba1)]() * sF;
                  sC[xN(0x6e1)](
                    Math[xN(0x802)](sI) * this[xN(0x10b)] * sJ,
                    Math[xN(0x6ad)](sI) * this[xN(0x10b)] * sJ
                  );
                }
                sC[xN(0x735)](), (this[xN(0x5e7)] = sC);
              }
              (rG = this[xN(0xc80)] / this[xN(0x10b)]), rD[xN(0xd3b)](rG, rG);
              const rM = this[xN(0x7b9)] ? lh : [xN(0x156), xN(0x672)];
              (rD[xN(0x44c)] = this[xN(0x67a)](rM[0x1])),
                rD[xN(0x2dc)](this[xN(0x5e7)]),
                (rD[xN(0xd2d)] = this[xN(0x67a)](rM[0x0])),
                rD[xN(0x5a4)](this[xN(0x5e7)]);
              break;
            case cS[xN(0xa07)]:
              if (this[xN(0x2ba)] !== this[xN(0x10b)]) {
                this[xN(0x2ba)] = this[xN(0x10b)];
                const sK = Math[xN(0xbb8)](
                    this[xN(0x10b)] > 0xc8
                      ? this[xN(0x10b)] * 0.18
                      : this[xN(0x10b)] * 0.25
                  ),
                  sL = 0.5,
                  sM = 0.85;
                this[xN(0x5e7)] = la(sK, this[xN(0x10b)], sL, sM);
                if (this[xN(0x10b)] < 0x12c) {
                  const sN = new Path2D(),
                    sO = sK * 0x2;
                  for (let sP = 0x0; sP < sO; sP++) {
                    const sQ = ((sP + 0x1) / sO) * Math["PI"] * 0x2;
                    let sR = (sP % 0x2 === 0x0 ? 0.7 : 1.2) * this[xN(0x10b)];
                    sN[xN(0x6e1)](
                      Math[xN(0x802)](sQ) * sR,
                      Math[xN(0x6ad)](sQ) * sR
                    );
                  }
                  sN[xN(0x735)](), (this[xN(0x57d)] = sN);
                } else this[xN(0x57d)] = null;
              }
              (rG = this[xN(0xc80)] / this[xN(0x10b)]), rD[xN(0xd3b)](rG, rG);
              this[xN(0x57d)] &&
                ((rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x41d))),
                rD[xN(0x5a4)](this[xN(0x57d)]));
              (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x5a8))),
                rD[xN(0x2dc)](this[xN(0x5e7)]),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0xd9f))),
                rD[xN(0x5a4)](this[xN(0x5e7)]);
              break;
            case cS[xN(0x3a0)]:
              rD[xN(0x181)](),
                (rG = this[xN(0xc80)] / 0x28),
                rD[xN(0xd3b)](rG, rG),
                (rD[xN(0xd2d)] = rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8));
              for (let sS = 0x0; sS < 0x2; sS++) {
                const sT = sS === 0x0 ? 0x1 : -0x1;
                rD[xN(0x181)](),
                  rD[xN(0x609)](0x1c, sT * 0xd),
                  rD[xN(0xd4b)](
                    Math[xN(0x6ad)](this[xN(0x175)] * 1.24) * 0.1 * sT
                  ),
                  rD[xN(0x9fa)](),
                  rD[xN(0xbd5)](0x0, sT * 0x6),
                  rD[xN(0x6e1)](0x14, sT * 0xb),
                  rD[xN(0x6e1)](0x28, 0x0),
                  rD[xN(0xbc4)](0x14, sT * 0x5, 0x0, 0x0),
                  rD[xN(0x735)](),
                  rD[xN(0x5a4)](),
                  rD[xN(0x2dc)](),
                  rD[xN(0x242)]();
              }
              (rH = this[xN(0x7b9)] ? lh : [xN(0xd7f), xN(0x980)]),
                (rD[xN(0xd2d)] = this[xN(0x67a)](rH[0x0])),
                rD[xN(0x5a4)](l5),
                (rD[xN(0x290)] = 0x6),
                (rD[xN(0xd2d)] = rD[xN(0x44c)] = this[xN(0x67a)](rH[0x1])),
                rD[xN(0x2dc)](l5),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x15, 0x0),
                rD[xN(0xbc4)](0x0, -0x3, 0x15, 0x0),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x7),
                rD[xN(0x2dc)]();
              const rN = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rD[xN(0x9fa)]();
              for (let sU = 0x0; sU < 0x2; sU++) {
                const sV = sU === 0x1 ? 0x1 : -0x1;
                for (let sW = 0x0; sW < rN[xN(0x680)]; sW++) {
                  let [sX, sY] = rN[sW];
                  (sY *= sV),
                    rD[xN(0xbd5)](sX, sY),
                    rD[xN(0x663)](sX, sY, 0x5, 0x0, l0);
                }
              }
              rD[xN(0x5a4)](), rD[xN(0x5a4)](), rD[xN(0x242)]();
              break;
            case cS[xN(0x8a5)]:
            case cS[xN(0xa60)]:
              rD[xN(0x181)](),
                (rG = this[xN(0xc80)] / 0x28),
                rD[xN(0xd3b)](rG, rG);
              const rO = this[xN(0xb8a)] === cS[xN(0x8a5)];
              rO &&
                (rD[xN(0x181)](),
                rD[xN(0x609)](-0x2d, 0x0),
                rD[xN(0xd4b)](Math["PI"]),
                this[xN(0x1a2)](rD, 0xf / 1.1),
                rD[xN(0x242)]());
              (rH = this[xN(0x7b9)]
                ? lh
                : rO
                ? [xN(0x865), xN(0xc9)]
                : [xN(0xc5d), xN(0xc11)]),
                rD[xN(0x9fa)](),
                rD[xN(0x1e6)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, l0),
                (rD[xN(0x290)] = 0xa),
                (rD[xN(0x44c)] = this[xN(0x67a)](rH[0x1])),
                rD[xN(0x2dc)](),
                (rD[xN(0xd2d)] = this[xN(0x67a)](rH[0x0])),
                rD[xN(0x5a4)](),
                rD[xN(0x181)](),
                rD[xN(0xd02)](),
                rD[xN(0x9fa)]();
              const rP = [-0x1e, -0x5, 0x16];
              for (let sZ = 0x0; sZ < rP[xN(0x680)]; sZ++) {
                const t0 = rP[sZ];
                rD[xN(0xbd5)](t0, -0x32),
                  rD[xN(0xbc4)](t0 - 0x14, 0x0, t0, 0x32);
              }
              (rD[xN(0x290)] = 0xe),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                rD[xN(0x2dc)](),
                rD[xN(0x242)]();
              rO ? this[xN(0xabb)](rD) : this[xN(0xc70)](rD);
              rD[xN(0x242)]();
              break;
            case cS[xN(0xb03)]:
              (rG = this[xN(0xc80)] / 0x32), rD[xN(0xd3b)](rG, rG);
              const rQ = 0x2f;
              rD[xN(0x9fa)]();
              for (let t1 = 0x0; t1 < 0x8; t1++) {
                let t2 =
                  (0.25 + ((t1 % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xN(0x6ad)](t1 + this[xN(0x175)] * 1.3) * 0.2;
                t1 >= 0x4 && (t2 *= -0x1),
                  rD[xN(0xbd5)](0x0, 0x0),
                  rD[xN(0x6e1)](
                    Math[xN(0x802)](t2) * rQ,
                    Math[xN(0x6ad)](t2) * rQ
                  );
              }
              (rD[xN(0x290)] = 0x7),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                rD[xN(0x2dc)](),
                (rD[xN(0xd2d)] = rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x6);
              for (let t3 = 0x0; t3 < 0x2; t3++) {
                const t4 = t3 === 0x0 ? 0x1 : -0x1;
                rD[xN(0x181)](),
                  rD[xN(0x609)](0x16, t4 * 0xa),
                  rD[xN(0xd4b)](
                    -(Math[xN(0x6ad)](this[xN(0x175)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      t4
                  ),
                  rD[xN(0x9fa)](),
                  rD[xN(0xbd5)](0x0, t4 * 0x6),
                  rD[xN(0xbc4)](0x14, t4 * 0xf, 0x28, 0x0),
                  rD[xN(0xbc4)](0x14, t4 * 0x5, 0x0, 0x0),
                  rD[xN(0x735)](),
                  rD[xN(0x5a4)](),
                  rD[xN(0x2dc)](),
                  rD[xN(0x242)]();
              }
              (rD[xN(0x290)] = 0x8),
                l9(
                  rD,
                  0x1,
                  0x8,
                  this[xN(0x67a)](xN(0xba7)),
                  this[xN(0x67a)](xN(0x233))
                );
              let rR;
              (rR = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rD[xN(0x9fa)]();
              for (let t5 = 0x0; t5 < rR[xN(0x680)]; t5++) {
                const [t6, t7] = rR[t5];
                rD[xN(0xbd5)](t6, -t7),
                  rD[xN(0xbc4)](t6 + Math[xN(0x9f5)](t6) * 4.2, 0x0, t6, t7);
              }
              (rD[xN(0x3e3)] = xN(0xbb8)),
                rD[xN(0x2dc)](),
                rD[xN(0x609)](-0x21, 0x0),
                l9(
                  rD,
                  0.45,
                  0x8,
                  this[xN(0x67a)](xN(0x118)),
                  this[xN(0x67a)](xN(0x162))
                ),
                rD[xN(0x9fa)](),
                (rR = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let t8 = 0x0; t8 < rR[xN(0x680)]; t8++) {
                const [t9, ta] = rR[t8];
                rD[xN(0xbd5)](t9, -ta), rD[xN(0xbc4)](t9 - 0x3, 0x0, t9, ta);
              }
              (rD[xN(0x290)] = 0x5),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                rD[xN(0x2dc)](),
                rD[xN(0x609)](0x11, 0x0),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x0, -0x9),
                rD[xN(0x6e1)](0x0, 0x9),
                rD[xN(0x6e1)](0xb, 0x0),
                rD[xN(0x735)](),
                (rD[xN(0x8f6)] = rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x6),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x8d0))),
                rD[xN(0x5a4)](),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x257)]:
              this[xN(0x2b7)](rD, xN(0x753), xN(0xbd), xN(0x869));
              break;
            case cS[xN(0x70)]:
              this[xN(0x2b7)](rD, xN(0x988), xN(0xc75), xN(0xcf2));
              break;
            case cS[xN(0xd64)]:
              this[xN(0x2b7)](rD, xN(0xa02), xN(0x45d), xN(0x869));
              break;
            case cS[xN(0xc68)]:
              (rG = this[xN(0xc80)] / 0x46),
                rD[xN(0x477)](rG),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x1f7))),
                rD[xN(0x5a4)](lc),
                rD[xN(0xd02)](lc),
                (rD[xN(0x290)] = 0xf),
                (rD[xN(0x44c)] = xN(0x7c0)),
                rD[xN(0x2dc)](lc),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x7),
                (rD[xN(0x44c)] = xN(0x2a6)),
                rD[xN(0x2dc)](ld);
              break;
            case cS[xN(0xc0e)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x28),
                this[xN(0xc0)](rD, 0x32, 0x1e, 0x7);
              break;
            case cS[xN(0xd8d)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x64),
                this[xN(0xc0)](rD),
                (rD[xN(0xd2d)] = rD[xN(0x44c)]);
              const rS = 0x6,
                rT = 0x3;
              rD[xN(0x9fa)]();
              for (let tb = 0x0; tb < rS; tb++) {
                const tc = (tb / rS) * Math["PI"] * 0x2;
                rD[xN(0x181)](), rD[xN(0xd4b)](tc);
                for (let td = 0x0; td < rT; td++) {
                  const te = td / rT,
                    tf = 0x12 + te * 0x44,
                    tg = 0x7 + te * 0x6;
                  rD[xN(0xbd5)](tf, 0x0),
                    rD[xN(0x663)](tf, 0x0, tg, 0x0, Math["PI"] * 0x2);
                }
                rD[xN(0x242)]();
              }
              rD[xN(0x5a4)]();
              break;
            case cS[xN(0x96b)]:
              (rG = this[xN(0xc80)] / 0x31),
                rD[xN(0x477)](rG),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                (rI = this[xN(0x175)] * 0x15e);
              const rU = (Math[xN(0x6ad)](rI * 0.01) * 0.5 + 0.5) * 0.1;
              (rD[xN(0x44c)] = rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x41d))),
                (rD[xN(0x290)] = 0x3);
              for (let th = 0x0; th < 0x2; th++) {
                rD[xN(0x181)]();
                const ti = th * 0x2 - 0x1;
                rD[xN(0xd3b)](0x1, ti),
                  rD[xN(0x609)](0x1c, -0x27),
                  rD[xN(0xd3b)](1.5, 1.5),
                  rD[xN(0xd4b)](rU),
                  rD[xN(0x9fa)](),
                  rD[xN(0xbd5)](0x0, 0x0),
                  rD[xN(0xbc4)](0xc, -0x8, 0x14, 0x3),
                  rD[xN(0x6e1)](0xb, 0x1),
                  rD[xN(0x6e1)](0x11, 0x9),
                  rD[xN(0xbc4)](0xc, 0x5, 0x0, 0x6),
                  rD[xN(0x735)](),
                  rD[xN(0x2dc)](),
                  rD[xN(0x5a4)](),
                  rD[xN(0x242)]();
              }
              rD[xN(0x9fa)]();
              for (let tj = 0x0; tj < 0x2; tj++) {
                for (let tk = 0x0; tk < 0x4; tk++) {
                  const tl = tj * 0x2 - 0x1,
                    tm =
                      (Math[xN(0x6ad)](rI * 0.005 + tj + tk * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rD[xN(0x181)](),
                    rD[xN(0xd3b)](0x1, tl),
                    rD[xN(0x609)]((tk / 0x3) * 0x1e - 0xf, 0x28);
                  const tn = tk < 0x2 ? 0x1 : -0x1;
                  rD[xN(0xd4b)](tm * tn),
                    rD[xN(0xbd5)](0x0, 0x0),
                    rD[xN(0x609)](0x0, 0x19),
                    rD[xN(0x6e1)](0x0, 0x0),
                    rD[xN(0xd4b)](tn * 0.7 * (tm + 0.3)),
                    rD[xN(0x6e1)](0x0, 0xa),
                    rD[xN(0x242)]();
                }
              }
              (rD[xN(0x290)] = 0xa),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x2, 0x17),
                rD[xN(0xbc4)](0x17, 0x0, 0x2, -0x17),
                rD[xN(0x6e1)](-0xa, -0xf),
                rD[xN(0x6e1)](-0xa, 0xf),
                rD[xN(0x735)](),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x497))),
                (rD[xN(0x290)] = 0x44),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                rD[xN(0x2dc)](),
                (rD[xN(0x290)] -= 0x12),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x814))),
                rD[xN(0x2dc)](),
                (rD[xN(0x44c)] = xN(0xc62)),
                rD[xN(0x9fa)]();
              const rV = 0x12;
              for (let to = 0x0; to < 0x2; to++) {
                rD[xN(0xbd5)](-0x12, rV),
                  rD[xN(0xbc4)](0x0, -0x7 + rV, 0x12, rV),
                  rD[xN(0xd3b)](0x1, -0x1);
              }
              (rD[xN(0x290)] = 0x9), rD[xN(0x2dc)]();
              break;
            case cS[xN(0x86d)]:
              (rG = this[xN(0xc80)] / 0x50),
                rD[xN(0x477)](rG),
                rD[xN(0xd4b)](
                  ((Date[xN(0x213)]() / 0x7d0) % l0) + this[xN(0x175)] * 0.4
                );
              const rW = 0x5;
              !this[xN(0x6e6)] &&
                (this[xN(0x6e6)] = Array(rW)[xN(0x5a4)](0x64));
              const rX = this[xN(0x6e6)],
                rY = this[xN(0x8ee)]
                  ? 0x0
                  : Math[xN(0x35d)](this[xN(0xca6)] * (rW - 0x1));
              rD[xN(0x9fa)]();
              for (let tp = 0x0; tp < rW; tp++) {
                const tq = ((tp + 0.5) / rW) * Math["PI"] * 0x2,
                  tr = ((tp + 0x1) / rW) * Math["PI"] * 0x2;
                rX[tp] += ((tp < rY ? 0x64 : 0x3c) - rX[tp]) * 0.2;
                const ts = rX[tp];
                if (tp === 0x0) rD[xN(0xbd5)](ts, 0x0);
                rD[xN(0xbc4)](
                  Math[xN(0x802)](tq) * 0x5,
                  Math[xN(0x6ad)](tq) * 0x5,
                  Math[xN(0x802)](tr) * ts,
                  Math[xN(0x6ad)](tr) * ts
                );
              }
              rD[xN(0x735)](),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x1c + 0xa),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x90e))),
                rD[xN(0x2dc)](),
                (rD[xN(0x290)] = 0x10 + 0xa),
                (rD[xN(0x44c)] = rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x413))),
                rD[xN(0x5a4)](),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)]();
              for (let tu = 0x0; tu < rW; tu++) {
                const tv = (tu / rW) * Math["PI"] * 0x2;
                rD[xN(0x181)](), rD[xN(0xd4b)](tv);
                const tw = rX[tu] / 0x64;
                let tx = 0x1a;
                const ty = 0x4;
                for (let tz = 0x0; tz < ty; tz++) {
                  const tA = (0x1 - (tz / ty) * 0.7) * 0xc * tw;
                  rD[xN(0xbd5)](tx, 0x0),
                    rD[xN(0x663)](tx, 0x0, tA, 0x0, Math["PI"] * 0x2),
                    (tx += tA * 0x2 + 3.5 * tw);
                }
                rD[xN(0x242)]();
              }
              (rD[xN(0xd2d)] = xN(0x1ba)), rD[xN(0x5a4)]();
              break;
            case cS[xN(0x430)]:
              (rG = this[xN(0xc80)] / 0x1e),
                rD[xN(0x477)](rG),
                rD[xN(0x609)](-0x22, 0x0),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x0, -0x8),
                rD[xN(0xbc4)](0x9b, 0x0, 0x0, 0x8),
                rD[xN(0x735)](),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x1a),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x90e))),
                rD[xN(0x2dc)](),
                (rD[xN(0x290)] = 0x10),
                (rD[xN(0x44c)] = rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x413))),
                rD[xN(0x5a4)](),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)]();
              let rZ = 0xd;
              for (let tB = 0x0; tB < 0x4; tB++) {
                const tC = (0x1 - (tB / 0x4) * 0.7) * 0xa;
                rD[xN(0xbd5)](rZ, 0x0),
                  rD[xN(0x663)](rZ, 0x0, tC, 0x0, Math["PI"] * 0x2),
                  (rZ += tC * 0x2 + 0x4);
              }
              (rD[xN(0xd2d)] = xN(0x1ba)), rD[xN(0x5a4)]();
              break;
            case cS[xN(0x164)]:
              (rG = this[xN(0xc80)] / 0x64),
                rD[xN(0xd3b)](rG, rG),
                (rD[xN(0x8f6)] = rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x44c)] = xN(0x133)),
                (rD[xN(0x290)] = 0x14);
              const s0 = [0x1, 0.63, 0.28],
                s1 = this[xN(0x7b9)] ? lo : [xN(0x61c), xN(0x5e6), xN(0x9d8)],
                s3 = (pM * 0.005) % l0;
              for (let tD = 0x0; tD < 0x3; tD++) {
                const tE = s0[tD],
                  tF = s1[tD];
                rD[xN(0x181)](),
                  rD[xN(0xd4b)](s3 * (tD % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rD[xN(0x9fa)]();
                const tG = 0x7 - tD;
                for (let tH = 0x0; tH < tG; tH++) {
                  const tI = (Math["PI"] * 0x2 * tH) / tG;
                  rD[xN(0x6e1)](
                    Math[xN(0x802)](tI) * tE * 0x64,
                    Math[xN(0x6ad)](tI) * tE * 0x64
                  );
                }
                rD[xN(0x735)](),
                  (rD[xN(0x44c)] = rD[xN(0xd2d)] = this[xN(0x67a)](tF)),
                  rD[xN(0x5a4)](),
                  rD[xN(0x2dc)](),
                  rD[xN(0x242)]();
              }
              break;
            case cS[xN(0xa08)]:
              (rG = this[xN(0xc80)] / 0x41),
                rD[xN(0xd3b)](rG, rG),
                (rI = this[xN(0x175)] * 0x2),
                rD[xN(0xd4b)](Math["PI"] / 0x2);
              if (this[xN(0x2df)]) {
                const tJ = 0x3;
                rD[xN(0x9fa)]();
                for (let tN = 0x0; tN < 0x2; tN++) {
                  for (let tO = 0x0; tO <= tJ; tO++) {
                    const tP = (tO / tJ) * 0x50 - 0x28;
                    rD[xN(0x181)]();
                    const tQ = tN * 0x2 - 0x1;
                    rD[xN(0x609)](tQ * -0x2d, tP);
                    const tR =
                      1.1 + Math[xN(0x6ad)]((tO / tJ) * Math["PI"]) * 0.5;
                    rD[xN(0xd3b)](tR * tQ, tR),
                      rD[xN(0xd4b)](Math[xN(0x6ad)](rI + tO + tQ) * 0.3 + 0.3),
                      rD[xN(0xbd5)](0x0, 0x0),
                      rD[xN(0xbc4)](-0xf, -0x5, -0x14, 0xa),
                      rD[xN(0x242)]();
                  }
                }
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                  (rD[xN(0x290)] = 0x8),
                  (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                  rD[xN(0x2dc)](),
                  (rD[xN(0x290)] = 0xc);
                const tK = Date[xN(0x213)]() * 0.01,
                  tL = Math[xN(0x6ad)](tK * 0.5) * 0.5 + 0.5,
                  tM = tL * 0.1 + 0x1;
                rD[xN(0x9fa)](),
                  rD[xN(0x663)](-0xf * tM, 0x2b - tL, 0x10, 0x0, Math["PI"]),
                  rD[xN(0x663)](0xf * tM, 0x2b - tL, 0x10, 0x0, Math["PI"]),
                  rD[xN(0xbd5)](-0x16, -0x2b),
                  rD[xN(0x663)](0x0, -0x2b - tL, 0x16, 0x0, Math["PI"], !![]),
                  (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x887))),
                  rD[xN(0x2dc)](),
                  (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0xd7f))),
                  rD[xN(0x5a4)](),
                  rD[xN(0x181)](),
                  rD[xN(0xd4b)]((Math["PI"] * 0x3) / 0x2),
                  this[xN(0xc70)](rD, 0x1a - tL, 0x0),
                  rD[xN(0x242)]();
              }
              if (!this[xN(0x28a)]) {
                const tS = dI[d9[xN(0x286)]],
                  tT = Math[xN(0x137)](this["id"] % tS[xN(0x680)], 0x0),
                  tU = new lN(-0x1, 0x0, 0x0, tS[tT]["id"]);
                (tU[xN(0xd79)] = 0x1),
                  (tU[xN(0x640)] = 0x0),
                  (this[xN(0x28a)] = tU);
              }
              rD[xN(0x477)](1.3), this[xN(0x28a)][xN(0xa46)](rD);
              break;
            case cS[xN(0x70a)]:
              (rG = this[xN(0xc80)] / 0x14),
                rD[xN(0xd3b)](rG, rG),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x11, 0x0),
                rD[xN(0x6e1)](0x0, 0x0),
                rD[xN(0x6e1)](0x11, 0x6),
                rD[xN(0xbd5)](0x0, 0x0),
                rD[xN(0x6e1)](0xb, -0x7),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0xc2))),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0xc),
                rD[xN(0x2dc)](),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x3c9))),
                (rD[xN(0x290)] = 0x6),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x943)]:
              (rG = this[xN(0xc80)] / 0x80),
                rD[xN(0x477)](rG),
                rD[xN(0x609)](-0x80, -0x78),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x434))),
                rD[xN(0x5a4)](f9[xN(0x783)]),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x8a6))),
                (rD[xN(0x290)] = 0x14),
                rD[xN(0x2dc)](f9[xN(0x783)]);
              break;
            case cS[xN(0xd58)]:
              (rG = this[xN(0xc80)] / 0x19),
                rD[xN(0xd3b)](rG, rG),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x19, 0x0),
                rD[xN(0x6e1)](-0x2d, 0x0),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x14),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x87f))),
                rD[xN(0x5a4)](),
                (rD[xN(0x290)] = 0x7),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0xb63))),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x962)]:
              rD[xN(0xd4b)](-this[xN(0x640)]),
                rD[xN(0x477)](this[xN(0xc80)] / 0x14),
                this[xN(0x97)](rD),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x87f))),
                rD[xN(0x5a4)](),
                rD[xN(0xd02)](),
                (rD[xN(0x290)] = 0xc),
                (rD[xN(0x44c)] = xN(0xc62)),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0xb53)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x64), this[xN(0xbc5)](rD);
              break;
            case cS[xN(0x586)]:
              this[xN(0xd30)](rD, !![]);
              break;
            case cS[xN(0x2e3)]:
              this[xN(0xd30)](rD, ![]);
              break;
            case cS[xN(0x750)]:
              (rG = this[xN(0xc80)] / 0xa),
                rD[xN(0x477)](rG),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x0, 0x8),
                rD[xN(0xbc4)](2.5, 0x0, 0x0, -0x8),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0xa),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0xb63))),
                rD[xN(0x2dc)](),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x87f))),
                (rD[xN(0x290)] = 0x6),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0xa19)]:
              (rG = this[xN(0xc80)] / 0xa),
                rD[xN(0x477)](rG),
                rD[xN(0x609)](0x7, 0x0),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x5, -0x5),
                rD[xN(0x1db)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rD[xN(0x1db)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x41d))),
                rD[xN(0x5a4)](),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x3ff))),
                (rD[xN(0x290)] = 0x3),
                (rD[xN(0x8f6)] = xN(0xbb8)),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x937)]:
              (rG = this[xN(0xc80)] / 0x32), rD[xN(0x477)](rG), rD[xN(0x9fa)]();
              for (let tV = 0x0; tV < 0x9; tV++) {
                const tW = (tV / 0x9) * Math["PI"] * 0x2,
                  tX =
                    0x3c *
                    (0x1 +
                      Math[xN(0x802)]((tV / 0x9) * Math["PI"] * 3.5) * 0.07);
                rD[xN(0xbd5)](0x0, 0x0),
                  rD[xN(0x6e1)](
                    Math[xN(0x802)](tW) * tX,
                    Math[xN(0x6ad)](tW) * tX
                  );
              }
              (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x10),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x87f))),
                rD[xN(0x5a4)](),
                (rD[xN(0x290)] = 0x6),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0xb63))),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x829)]:
              rD[xN(0x181)](),
                (rG = this[xN(0xc80)] / 0x28),
                rD[xN(0xd3b)](rG, rG),
                this[xN(0x49d)](rD),
                (rD[xN(0xd2d)] = this[xN(0x67a)](
                  this[xN(0x7b9)] ? lh[0x0] : xN(0x38d)
                )),
                (rD[xN(0x44c)] = xN(0xae8)),
                (rD[xN(0x290)] = 0x10),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rD[xN(0x5a4)](),
                rD[xN(0x181)](),
                rD[xN(0xd02)](),
                rD[xN(0x2dc)](),
                rD[xN(0x242)](),
                rD[xN(0x242)]();
              break;
            case cS[xN(0x1e4)]:
            case cS[xN(0x68d)]:
            case cS[xN(0x999)]:
            case cS[xN(0xb8b)]:
            case cS[xN(0xc15)]:
            case cS[xN(0x527)]:
            case cS[xN(0x195)]:
            case cS[xN(0x917)]:
              (rG = this[xN(0xc80)] / 0x14), rD[xN(0xd3b)](rG, rG);
              const s4 = Math[xN(0x6ad)](this[xN(0x175)] * 1.6),
                s5 = this[xN(0x9d)][xN(0x7cc)](xN(0x1e4)),
                s6 = this[xN(0x9d)][xN(0x7cc)](xN(0x509)),
                s7 = this[xN(0x9d)][xN(0x7cc)](xN(0x999)),
                s8 = this[xN(0x9d)][xN(0x7cc)](xN(0x999)) ? -0x4 : 0x0;
              (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x6);
              s6 && rD[xN(0x609)](0x8, 0x0);
              for (let tY = 0x0; tY < 0x2; tY++) {
                const tZ = tY === 0x0 ? -0x1 : 0x1;
                rD[xN(0x181)](), rD[xN(0xd4b)](tZ * (s4 * 0.5 + 0.6) * 0.08);
                const u0 = tZ * 0x4;
                rD[xN(0x9fa)](),
                  rD[xN(0xbd5)](0x0, u0),
                  rD[xN(0xbc4)](0xc, 0x6 * tZ + u0, 0x18, u0),
                  rD[xN(0x2dc)](),
                  rD[xN(0x242)]();
              }
              if (this[xN(0x7b9)])
                (rD[xN(0xd2d)] = this[xN(0x67a)](lh[0x0])),
                  (rD[xN(0x44c)] = this[xN(0x67a)](lh[0x1]));
              else
                this[xN(0x9d)][xN(0xda8)](xN(0x9f4))
                  ? ((rD[xN(0xd2d)] = this[xN(0x67a)](xN(0xb24))),
                    (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x715))))
                  : ((rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x5bf))),
                    (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x445))));
              rD[xN(0x290)] = s6 ? 0x9 : 0xc;
              s6 &&
                (rD[xN(0x181)](),
                rD[xN(0x609)](-0x18, 0x0),
                rD[xN(0xd3b)](-0x1, 0x1),
                lF(rD, 0x15, rD[xN(0xd2d)], rD[xN(0x44c)], rD[xN(0x290)]),
                rD[xN(0x242)]());
              !s7 &&
                (rD[xN(0x181)](),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](-0xa, 0x0, s6 ? 0x12 : 0xc, 0x0, l0),
                rD[xN(0x5a4)](),
                rD[xN(0xd02)](),
                rD[xN(0x2dc)](),
                rD[xN(0x242)]());
              if (s5 || s6) {
                rD[xN(0x181)](),
                  (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0xa12))),
                  (rD[xN(0x915)] *= 0.5);
                const u1 = (Math["PI"] / 0x7) * (s6 ? 0.85 : 0x1) + s4 * 0.08;
                for (let u2 = 0x0; u2 < 0x2; u2++) {
                  const u3 = u2 === 0x0 ? -0x1 : 0x1;
                  rD[xN(0x181)](),
                    rD[xN(0xd4b)](u3 * u1),
                    rD[xN(0x609)](
                      s6 ? -0x13 : -0x9,
                      u3 * -0x3 * (s6 ? 1.3 : 0x1)
                    ),
                    rD[xN(0x9fa)](),
                    rD[xN(0x1e6)](
                      0x0,
                      0x0,
                      s6 ? 0x14 : 0xe,
                      s6 ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      l0
                    ),
                    rD[xN(0x5a4)](),
                    rD[xN(0x242)]();
                }
                rD[xN(0x242)]();
              }
              rD[xN(0x181)](),
                rD[xN(0x609)](0x4 + s8, 0x0),
                lF(
                  rD,
                  s7 ? 0x14 : 12.1,
                  rD[xN(0xd2d)],
                  rD[xN(0x44c)],
                  rD[xN(0x290)]
                ),
                rD[xN(0x242)]();
              break;
            case cS[xN(0x462)]:
              this[xN(0xbb5)](rD, xN(0x335));
              break;
            case cS[xN(0x71)]:
              this[xN(0xbb5)](rD, xN(0xb02));
              break;
            case cS[xN(0xcbd)]:
              this[xN(0xbb5)](rD, xN(0x8d0)),
                (rD[xN(0x915)] *= 0.2),
                lJ(rD, this[xN(0xc80)] * 1.3, 0x4);
              break;
            case cS[xN(0x5be)]:
            case cS[xN(0x610)]:
            case cS[xN(0x32c)]:
            case cS[xN(0x4e9)]:
            case cS[xN(0xd92)]:
            case cS[xN(0x78b)]:
              rD[xN(0x181)](),
                (rG = this[xN(0xc80)] / 0x28),
                rD[xN(0xd3b)](rG, rG),
                rD[xN(0x9fa)]();
              for (let u4 = 0x0; u4 < 0x2; u4++) {
                rD[xN(0x181)](),
                  rD[xN(0xd3b)](0x1, u4 * 0x2 - 0x1),
                  rD[xN(0x609)](0x0, 0x23),
                  rD[xN(0xbd5)](0x9, 0x0),
                  rD[xN(0x6e1)](0x5, 0xa),
                  rD[xN(0x6e1)](-0x5, 0xa),
                  rD[xN(0x6e1)](-0x9, 0x0),
                  rD[xN(0x6e1)](0x9, 0x0),
                  rD[xN(0x242)]();
              }
              (rD[xN(0x290)] = 0x12),
                (rD[xN(0x8f6)] = rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x44c)] = rD[xN(0xd2d)] = this[xN(0x67a)](xN(0xc4))),
                rD[xN(0x5a4)](),
                rD[xN(0x2dc)]();
              let s9;
              if (this[xN(0x9d)][xN(0x79e)](xN(0x914)) > -0x1)
                s9 = [xN(0x3f6), xN(0x931)];
              else
                this[xN(0x9d)][xN(0x79e)](xN(0x3c0)) > -0x1
                  ? (s9 = [xN(0xd7f), xN(0x8ac)])
                  : (s9 = [xN(0x4c7), xN(0xac0)]);
              rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0x28, 0x0, l0),
                (rD[xN(0xd2d)] = this[xN(0x67a)](s9[0x0])),
                rD[xN(0x5a4)](),
                (rD[xN(0x290)] = 0x8),
                (rD[xN(0x44c)] = this[xN(0x67a)](s9[0x1])),
                rD[xN(0x2dc)]();
              this[xN(0x9d)][xN(0x79e)](xN(0x601)) > -0x1 &&
                this[xN(0xc70)](rD, -0xf, 0x0, 1.25, 0x4);
              rD[xN(0x242)]();
              break;
            case cS[xN(0x2cb)]:
            case cS[xN(0x590)]:
              (rI =
                Math[xN(0x6ad)](
                  Date[xN(0x213)]() / 0x3e8 + this[xN(0x175)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rG = this[xN(0xc80)] / 0x50),
                rD[xN(0xd3b)](rG, rG);
              const sa = this[xN(0xb8a)] === cS[xN(0x590)];
              sa &&
                (rD[xN(0x181)](),
                rD[xN(0xd3b)](0x2, 0x2),
                this[xN(0x49d)](rD),
                rD[xN(0x242)]());
              rD[xN(0xd4b)](-this[xN(0x640)]),
                (rD[xN(0x290)] = 0xa),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (rH = this[xN(0x7b9)]
                  ? lh
                  : sa
                  ? [xN(0xabd), xN(0x2b1)]
                  : [xN(0xbfa), xN(0x9a5)]),
                (rD[xN(0xd2d)] = this[xN(0x67a)](rH[0x0])),
                rD[xN(0x5a4)](),
                rD[xN(0xd02)](),
                (rD[xN(0x44c)] = this[xN(0x67a)](rH[0x1])),
                rD[xN(0x2dc)]();
              const sb = this[xN(0x67a)](xN(0x87f)),
                sc = this[xN(0x67a)](xN(0x869)),
                sd = (u5 = 0x1) => {
                  const xQ = xN;
                  rD[xQ(0x181)](),
                    rD[xQ(0xd3b)](u5, 0x1),
                    rD[xQ(0x609)](0x13 - rI * 0x4, -0x1d + rI * 0x5),
                    rD[xQ(0x9fa)](),
                    rD[xQ(0xbd5)](0x0, 0x0),
                    rD[xQ(0x1db)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rD[xQ(0xbc4)](0x19, 0x5 + rI * 0x2, 0x0, 0x0),
                    rD[xQ(0x735)](),
                    (rD[xQ(0x290)] = 0x3),
                    rD[xQ(0x2dc)](),
                    (rD[xQ(0xd2d)] = sb),
                    rD[xQ(0x5a4)](),
                    rD[xQ(0xd02)](),
                    rD[xQ(0x9fa)](),
                    rD[xQ(0x663)](
                      0x16 + u5 * this[xQ(0x3ef)] * 0x10,
                      -0x4 + this[xQ(0xd8c)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rD[xQ(0xd2d)] = sc),
                    rD[xQ(0x5a4)](),
                    rD[xQ(0x242)]();
                };
              sd(0x1),
                sd(-0x1),
                rD[xN(0x181)](),
                rD[xN(0x609)](0x0, 0xa),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x28 + rI * 0xa, -0xe + rI * 0x5),
                rD[xN(0xbc4)](0x0, +rI * 0x5, 0x2c - rI * 0xf, -0xe + rI * 0x5),
                rD[xN(0x1db)](
                  0x14,
                  0x28 - rI * 0x14,
                  -0x14,
                  0x28 - rI * 0x14,
                  -0x28 + rI * 0xa,
                  -0xe + rI * 0x5
                ),
                rD[xN(0x735)](),
                (rD[xN(0x290)] = 0x5),
                rD[xN(0x2dc)](),
                (rD[xN(0xd2d)] = sc),
                rD[xN(0x5a4)](),
                rD[xN(0xd02)]();
              const se = rI * 0x2,
                sf = rI * -0xa;
              rD[xN(0x181)](),
                rD[xN(0x609)](0x0, sf),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x37, -0x8),
                rD[xN(0x1db)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rD[xN(0x44c)] = sb),
                (rD[xN(0x290)] = 0xd),
                rD[xN(0x2dc)](),
                (rD[xN(0x290)] = 0x4),
                (rD[xN(0x44c)] = sc),
                rD[xN(0x9fa)]();
              for (let u5 = 0x0; u5 < 0x6; u5++) {
                const u6 = (((u5 + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rD[xN(0xbd5)](u6, 0xa), rD[xN(0x6e1)](u6, 0x46);
              }
              rD[xN(0x2dc)](),
                rD[xN(0x242)](),
                rD[xN(0x181)](),
                rD[xN(0x609)](0x0, se),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x32, -0x14),
                rD[xN(0xbc4)](0x0, 0x8, 0x32, -0x12),
                (rD[xN(0x44c)] = sb),
                (rD[xN(0x290)] = 0xd),
                rD[xN(0x2dc)](),
                (rD[xN(0x290)] = 0x5),
                (rD[xN(0x44c)] = sc),
                rD[xN(0x9fa)]();
              for (let u7 = 0x0; u7 < 0x6; u7++) {
                let u8 = (((u7 + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rD[xN(0xbd5)](u8, -0x14), rD[xN(0x6e1)](u8, 0x2);
              }
              rD[xN(0x2dc)](), rD[xN(0x242)](), rD[xN(0x242)]();
              const sg = 0x1 - rI;
              (rD[xN(0x915)] *= Math[xN(0x137)](0x0, (sg - 0.3) / 0.7)),
                rD[xN(0x9fa)]();
              for (let u9 = 0x0; u9 < 0x2; u9++) {
                rD[xN(0x181)](),
                  u9 === 0x1 && rD[xN(0xd3b)](-0x1, 0x1),
                  rD[xN(0x609)](
                    -0x33 + rI * (0xa + u9 * 3.4) - u9 * 3.4,
                    -0xf + rI * (0x5 - u9 * 0x1)
                  ),
                  rD[xN(0xbd5)](0xa, 0x0),
                  rD[xN(0x663)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rD[xN(0x242)]();
              }
              rD[xN(0x609)](0x0, 0x28),
                rD[xN(0xbd5)](0x28 - rI * 0xa, -0xe + rI * 0x5),
                rD[xN(0x1db)](
                  0x14,
                  0x14 - rI * 0xa,
                  -0x14,
                  0x14 - rI * 0xa,
                  -0x28 + rI * 0xa,
                  -0xe + rI * 0x5
                ),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x2),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0xd29)]:
              (rG = this[xN(0xc80)] / 0x14), rD[xN(0xd3b)](rG, rG);
              const sh = rD[xN(0x915)];
              (rD[xN(0x44c)] = rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x87f))),
                (rD[xN(0x915)] = 0.6 * sh),
                rD[xN(0x9fa)]();
              for (let ua = 0x0; ua < 0xa; ua++) {
                const ub = (ua / 0xa) * Math["PI"] * 0x2;
                rD[xN(0x181)](),
                  rD[xN(0xd4b)](ub),
                  rD[xN(0x609)](17.5, 0x0),
                  rD[xN(0xbd5)](0x0, 0x0);
                const uc = Math[xN(0x6ad)](ub + Date[xN(0x213)]() / 0x1f4);
                rD[xN(0xd4b)](uc * 0.5),
                  rD[xN(0xbc4)](0x4, -0x2 * uc, 0xe, 0x0),
                  rD[xN(0x242)]();
              }
              (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 2.3),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rD[xN(0x915)] = 0.5 * sh),
                rD[xN(0x5a4)](),
                rD[xN(0xd02)](),
                (rD[xN(0x290)] = 0x3),
                rD[xN(0x2dc)](),
                (rD[xN(0x290)] = 1.2),
                (rD[xN(0x915)] = 0.6 * sh),
                rD[xN(0x9fa)](),
                (rD[xN(0x3e3)] = xN(0xbb8));
              for (let ud = 0x0; ud < 0x4; ud++) {
                rD[xN(0x181)](),
                  rD[xN(0xd4b)]((ud / 0x4) * Math["PI"] * 0x2),
                  rD[xN(0x609)](0x4, 0x0),
                  rD[xN(0xbd5)](0x0, -0x2),
                  rD[xN(0x1db)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rD[xN(0x242)]();
              }
              rD[xN(0x2dc)]();
              break;
            case cS[xN(0x39b)]:
              this[xN(0x39b)](rD);
              break;
            case cS[xN(0x855)]:
              this[xN(0x39b)](rD, !![]);
              break;
            case cS[xN(0x400)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x32),
                (rD[xN(0x290)] = 0x19),
                (rD[xN(0x8f6)] = xN(0xbb8));
              const si = this[xN(0x7b8)]
                ? 0.6
                : (Date[xN(0x213)]() / 0x4b0) % 6.28;
              for (let ue = 0x0; ue < 0xa; ue++) {
                const uf = 0x1 - ue / 0xa,
                  ug =
                    uf *
                    0x50 *
                    (0x1 +
                      (Math[xN(0x6ad)](si * 0x3 + ue * 0.5 + this[xN(0x175)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rD[xN(0xd4b)](si),
                  (rD[xN(0x44c)] = this[xN(0x67a)](lg[ue])),
                  rD[xN(0x806)](-ug / 0x2, -ug / 0x2, ug, ug);
              }
              break;
            case cS[xN(0x5a6)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x12),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x19, -0xa),
                rD[xN(0xbc4)](0x0, -0x2, 0x19, -0xa),
                rD[xN(0xbc4)](0x1e, 0x0, 0x19, 0xa),
                rD[xN(0xbc4)](0x0, 0x2, -0x19, 0xa),
                rD[xN(0xbc4)](-0x1e, 0x0, -0x19, -0xa),
                rD[xN(0x735)](),
                (rD[xN(0x8f6)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0x4),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0xc4a))),
                rD[xN(0x2dc)](),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x33b))),
                rD[xN(0x5a4)](),
                rD[xN(0xd02)](),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x19, -0xa),
                rD[xN(0xbc4)](0x14, 0x0, 0x19, 0xa),
                rD[xN(0x6e1)](0x28, 0xa),
                rD[xN(0x6e1)](0x28, -0xa),
                (rD[xN(0xd2d)] = xN(0xae8)),
                rD[xN(0x5a4)](),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x0, -0xa),
                rD[xN(0xbc4)](-0x5, 0x0, 0x0, 0xa),
                (rD[xN(0x290)] = 0xa),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0xd21))),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x33c)]:
              (rG = this[xN(0xc80)] / 0xc),
                rD[xN(0xd3b)](rG, rG),
                rD[xN(0xd4b)](-Math["PI"] / 0x6),
                rD[xN(0x609)](-0xc, 0x0),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x5, 0x0),
                rD[xN(0x6e1)](0x0, 0x0),
                (rD[xN(0x290)] = 0x4),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x889))),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x0, 0x0),
                rD[xN(0xbc4)](0xa, -0x14, 0x1e, 0x0),
                rD[xN(0xbc4)](0xa, 0x14, 0x0, 0x0),
                (rD[xN(0x290)] = 0x6),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0xc92))),
                rD[xN(0x2dc)](),
                rD[xN(0x5a4)](),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x6, 0x0),
                rD[xN(0xbc4)](0xe, -0x2, 0x16, 0x0),
                (rD[xN(0x290)] = 3.5),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x65f)]:
              rF(xN(0x65f), xN(0x156), xN(0x672));
              break;
            case cS[xN(0xd96)]:
              rF(xN(0xd96), xN(0xc48), xN(0x1c4));
              break;
            case cS[xN(0x6ab)]:
              rF(xN(0x6ab), xN(0x87f), xN(0xb63));
              break;
            case cS[xN(0x552)]:
              rF(xN(0x552), xN(0x87f), xN(0xb63));
              break;
            case cS[xN(0x3e4)]:
              rF(xN(0x552), xN(0x80d), xN(0x474));
              break;
            case cS[xN(0x66d)]:
              const sj = this[xN(0x7b8)] ? 0x3c : this[xN(0xc80)] * 0x2;
              rD[xN(0x609)](-this[xN(0xc80)] - 0xa, 0x0),
                (rD[xN(0x8f6)] = rD[xN(0x3e3)] = xN(0xbb8)),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x0, 0x0),
                rD[xN(0x6e1)](sj, 0x0),
                (rD[xN(0x290)] = 0x6),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x3ff))),
                rD[xN(0x5a4)](),
                rD[xN(0x609)](sj, 0x0),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0xd, 0x0),
                rD[xN(0x6e1)](0x0, -3.5),
                rD[xN(0x6e1)](0x0, 3.5),
                rD[xN(0x735)](),
                (rD[xN(0x44c)] = rD[xN(0xd2d)]),
                rD[xN(0x5a4)](),
                (rD[xN(0x290)] = 0x3),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0xbb7)]:
              const sk = this[xN(0xc80)] * 0x2,
                sl = 0xa;
              rD[xN(0x609)](-this[xN(0xc80)], 0x0),
                (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x924)] = xN(0x4e6)),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x0, 0x0),
                rD[xN(0x6e1)](-sl * 1.8, 0x0),
                (rD[xN(0x44c)] = xN(0x3c6)),
                (rD[xN(0x290)] = sl * 1.4),
                rD[xN(0x2dc)](),
                (rD[xN(0x44c)] = xN(0xac4)),
                (rD[xN(0x290)] *= 0.7),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x0, 0x0),
                rD[xN(0x6e1)](-sl * 0.45, 0x0),
                (rD[xN(0x44c)] = xN(0x3c6)),
                (rD[xN(0x290)] = sl * 0x2 + 3.5),
                rD[xN(0x2dc)](),
                (rD[xN(0x44c)] = xN(0x5fc)),
                (rD[xN(0x290)] = sl * 0x2),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, sl, 0x0, Math["PI"] * 0x2),
                (rD[xN(0xd2d)] = xN(0x5f1)),
                rD[xN(0x5a4)](),
                (rD[xN(0x44c)] = xN(0x155)),
                rD[xN(0x9fa)]();
              const sm = (Date[xN(0x213)]() * 0.001) % 0x1,
                sn = sm * sk,
                so = sk * 0.2;
              rD[xN(0xbd5)](Math[xN(0x137)](sn - so, 0x0), 0x0),
                rD[xN(0x6e1)](Math[xN(0xd23)](sn + so, sk), 0x0);
              const sp = Math[xN(0x6ad)](sm * Math["PI"]);
              (rD[xN(0x776)] = sl * 0x3 * sp),
                (rD[xN(0x290)] = sl),
                rD[xN(0x2dc)](),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x0, 0x0),
                rD[xN(0x6e1)](sk, 0x0),
                (rD[xN(0x290)] = sl),
                (rD[xN(0x776)] = sl),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0xa48)]:
            case cS[xN(0xc20)]:
            case cS[xN(0x964)]:
            case cS[xN(0x351)]:
            case cS[xN(0x7a7)]:
            case cS[xN(0x31a)]:
              (rG = this[xN(0xc80)] / 0x23), rD[xN(0x477)](rG), rD[xN(0x9fa)]();
              this[xN(0xb8a)] !== cS[xN(0xc20)] &&
              this[xN(0xb8a)] !== cS[xN(0x7a7)]
                ? rD[xN(0x1e6)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, l0)
                : rD[xN(0x663)](0x0, 0x0, 0x23, 0x0, l0);
              (rH = lr[this[xN(0xb8a)]] || [xN(0xc9c), xN(0xc17)]),
                (rD[xN(0xd2d)] = this[xN(0x67a)](rH[0x0])),
                rD[xN(0x5a4)](),
                (rD[xN(0x44c)] = this[xN(0x67a)](rH[0x1])),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x958)]:
              (rD[xN(0x290)] = 0x4),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xabf)),
                rF(xN(0x958), xN(0x48c), xN(0x501));
              break;
            case cS[xN(0xb3)]:
              rF(xN(0xb3), xN(0x87f), xN(0xb63));
              break;
            case cS[xN(0xbcc)]:
              (rG = this[xN(0xc80)] / 0x14), rD[xN(0xd3b)](rG, rG);
              !this[xN(0x7b8)] && rD[xN(0xd4b)]((pM / 0x64) % 6.28);
              rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rD[xN(0xbc4)](0x0, 0xc, 0x14, 0x0),
                rD[xN(0x735)](),
                (rD[xN(0x8f6)] = rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] *= 0.7),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x87f))),
                rD[xN(0x5a4)](),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0xb63))),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x538)]:
              (rD[xN(0x290)] *= 0.7),
                rF(xN(0x538), xN(0x532), xN(0x48b)),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0.6, 0x0, l0),
                (rD[xN(0xd2d)] = xN(0x488)),
                rD[xN(0x5a4)]();
              break;
            case cS[xN(0x51a)]:
              (rD[xN(0x290)] *= 0.8), rF(xN(0x51a), xN(0x5e6), xN(0x1ab));
              break;
            case cS[xN(0xd3e)]:
              (rG = this[xN(0xc80)] / 0xa), rD[xN(0xd3b)](rG, rG);
              if (!this[xN(0xcb1)] || pM - this[xN(0xb72)] > 0x14) {
                this[xN(0xb72)] = pM;
                const uh = new Path2D();
                for (let ui = 0x0; ui < 0xa; ui++) {
                  const uj = (Math[xN(0xba1)]() * 0x2 - 0x1) * 0x7,
                    uk = (Math[xN(0xba1)]() * 0x2 - 0x1) * 0x7;
                  uh[xN(0xbd5)](uj, uk), uh[xN(0x663)](uj, uk, 0x5, 0x0, l0);
                }
                this[xN(0xcb1)] = uh;
              }
              (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0xa12))),
                rD[xN(0x5a4)](this[xN(0xcb1)]);
              break;
            case cS[xN(0x67e)]:
            case cS[xN(0x630)]:
              (rG = this[xN(0xc80)] / 0x1e),
                rD[xN(0xd3b)](rG, rG),
                rD[xN(0x9fa)]();
              const sq = 0x1 / 0x3;
              for (let ul = 0x0; ul < 0x3; ul++) {
                const um = (ul / 0x3) * Math["PI"] * 0x2;
                rD[xN(0xbd5)](0x0, 0x0),
                  rD[xN(0x663)](0x0, 0x0, 0x1e, um, um + Math["PI"] / 0x3);
              }
              (rD[xN(0x3e3)] = xN(0xbb8)),
                (rD[xN(0x290)] = 0xa),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rD[xN(0xd2d)] = this[xN(0x67a)](
                  this[xN(0xb8a)] === cS[xN(0x67e)] ? xN(0x900) : xN(0xbbf)
                )),
                rD[xN(0x5a4)](),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0xc3e)]:
              rE(xN(0xc5d), xN(0xc51));
              break;
            case cS[xN(0xac5)]:
              rE(xN(0x541), xN(0x968));
              break;
            case cS[xN(0x7a4)]:
            case cS[xN(0x6e7)]:
              rE(xN(0x87f), xN(0xb63));
              break;
            case cS[xN(0x2d7)]:
              (rG = this[xN(0xc80)] / 0x14),
                rD[xN(0xd3b)](rG, rG),
                rD[xN(0xd4b)](-Math["PI"] / 0x4);
              const sr = rD[xN(0x290)];
              (rD[xN(0x290)] *= 1.5),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x14, -0x14 - sr),
                rD[xN(0x6e1)](-0x14, 0x0),
                rD[xN(0x6e1)](0x14, 0x0),
                rD[xN(0x6e1)](0x14, 0x14 + sr),
                rD[xN(0xd4b)](Math["PI"] / 0x2),
                rD[xN(0xbd5)](-0x14, -0x14 - sr),
                rD[xN(0x6e1)](-0x14, 0x0),
                rD[xN(0x6e1)](0x14, 0x0),
                rD[xN(0x6e1)](0x14, 0x14 + sr),
                (rD[xN(0x3e3)] = rD[xN(0x3e3)] = xN(0xabf)),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x721)]:
              rE(xN(0xa96), xN(0x324));
              break;
            case cS[xN(0x2b3)]:
              rE(xN(0x88c), xN(0xae));
              break;
            case cS[xN(0x787)]:
              rE(xN(0x842), xN(0xd09));
              break;
            case cS[xN(0x7dc)]:
              (rG = this[xN(0xc80)] / 0x14),
                rD[xN(0xd3b)](rG, rG),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0x14, 0x0, l0),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x41d))),
                rD[xN(0x5a4)](),
                rD[xN(0xd02)](),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x3ff))),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x4f6))),
                rD[xN(0x5a4)]();
              break;
            case cS[xN(0x611)]:
              (rG = this[xN(0xc80)] / 0x14), rD[xN(0xd3b)](rG, rG);
              const ss = (un, uo, up = ![]) => {
                  const xR = xN;
                  (rD[xR(0x3e3)] = xR(0xbb8)),
                    (rD[xR(0x44c)] = this[xR(0x67a)](uo)),
                    (rD[xR(0xd2d)] = this[xR(0x67a)](un)),
                    rD[xR(0x9fa)](),
                    rD[xR(0x663)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rD[xR(0x2dc)](),
                    rD[xR(0x5a4)]();
                },
                st = (un, uo) => {
                  const xS = xN;
                  rD[xS(0x181)](),
                    rD[xS(0xd02)](),
                    (rD[xS(0x3e3)] = xS(0xbb8)),
                    (rD[xS(0xd2d)] = this[xS(0x67a)](un)),
                    (rD[xS(0x44c)] = this[xS(0x67a)](uo)),
                    rD[xS(0x5a4)](),
                    rD[xS(0x2dc)](),
                    rD[xS(0x242)]();
                };
              (rD[xN(0x3e3)] = xN(0xbb8)),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                st(xN(0x41d), xN(0x3ff)),
                rD[xN(0xd4b)](Math["PI"]),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rD[xN(0x663)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rD[xN(0x663)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                st(xN(0x87f), xN(0xb63)),
                rD[xN(0xd4b)](-Math["PI"]),
                rD[xN(0x9fa)](),
                rD[xN(0x663)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                st(xN(0x41d), xN(0x3ff));
              break;
            case cS[xN(0xcdd)]:
              this[xN(0x1a2)](rD, this[xN(0xc80)]);
              break;
            case cS[xN(0x618)]:
              (rG = this[xN(0xc80)] / 0x28),
                rD[xN(0xd3b)](rG, rG),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](-0x1e, -0x1e),
                rD[xN(0x6e1)](0x14, 0x0),
                rD[xN(0x6e1)](-0x1e, 0x1e),
                rD[xN(0x735)](),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x41d))),
                (rD[xN(0xd2d)] = this[xN(0x67a)](xN(0x8d0))),
                rD[xN(0x5a4)](),
                (rD[xN(0x290)] = 0x16),
                (rD[xN(0x3e3)] = rD[xN(0x8f6)] = xN(0xbb8)),
                rD[xN(0x2dc)]();
              break;
            case cS[xN(0x20d)]:
              rD[xN(0x477)](this[xN(0xc80)] / 0x41),
                rD[xN(0x609)](-0xa, 0xa),
                (rD[xN(0x8f6)] = rD[xN(0x3e3)] = xN(0xbb8)),
                rD[xN(0x181)](),
                rD[xN(0x9fa)](),
                rD[xN(0xbd5)](0x1e, 0x0),
                rD[xN(0x609)](
                  0x46 -
                    (Math[xN(0x6ad)](
                      Date[xN(0x213)]() / 0x190 + 0.8 * this[xN(0x175)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rD[xN(0x6e1)](0x0, 0x0),
                (rD[xN(0x290)] = 0x2a),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x6f1))),
                rD[xN(0x2dc)](),
                (rD[xN(0x44c)] = this[xN(0x67a)](xN(0x91d))),
                (rD[xN(0x290)] -= 0xc),
                rD[xN(0x2dc)](),
                rD[xN(0x9fa)]();
              for (let un = 0x0; un < 0x2; un++) {
                rD[xN(0xbd5)](0x9, 0x7),
                  rD[xN(0x6e1)](0x28, 0x14),
                  rD[xN(0x6e1)](0x7, 0x9),
                  rD[xN(0x6e1)](0x9, 0x7),
                  rD[xN(0xd3b)](0x1, -0x1);
              }
              (rD[xN(0x290)] = 0x3),
                (rD[xN(0xd2d)] = rD[xN(0x44c)] = xN(0xc96)),
                rD[xN(0x2dc)](),
                rD[xN(0x5a4)](),
                rD[xN(0x242)](),
                this[xN(0x84e)](rD);
              break;
            case cS[xN(0x473)]:
              (rG = this[xN(0xc80)] / 0x14), rD[xN(0xd3b)](rG, rG);
              const su = (uo = 0x1, up, uq) => {
                const xT = xN;
                rD[xT(0x181)](),
                  rD[xT(0xd3b)](0x1, uo),
                  rD[xT(0x9fa)](),
                  rD[xT(0x778)](-0x64, 0x0, 0x12c, -0x12c),
                  rD[xT(0xd02)](),
                  rD[xT(0x9fa)](),
                  rD[xT(0xbd5)](-0x14, 0x0),
                  rD[xT(0xbc4)](-0x12, -0x19, 0x11, -0xf),
                  (rD[xT(0x3e3)] = xT(0xbb8)),
                  (rD[xT(0x290)] = 0x16),
                  (rD[xT(0x44c)] = this[xT(0x67a)](uq)),
                  rD[xT(0x2dc)](),
                  (rD[xT(0x290)] = 0xe),
                  (rD[xT(0x44c)] = this[xT(0x67a)](up)),
                  rD[xT(0x2dc)](),
                  rD[xT(0x242)]();
              };
              su(0x1, xN(0xa0b), xN(0x6e8)), su(-0x1, xN(0xcd3), xN(0x7c1));
              break;
            default:
              rD[xN(0x9fa)](),
                rD[xN(0x663)](0x0, 0x0, this[xN(0xc80)], 0x0, Math["PI"] * 0x2),
                (rD[xN(0xd2d)] = xN(0xda6)),
                rD[xN(0x5a4)](),
                pG(rD, this[xN(0x9d)], 0x14, xN(0x155), 0x3);
          }
          rD[xN(0x242)](), (this[xN(0xc3c)] = null);
        }
        [us(0x97)](rD, rE) {
          const xU = us;
          rE = rE || pM / 0x12c + this[xU(0x175)] * 0.3;
          const rF = Math[xU(0x6ad)](rE) * 0.5 + 0.5;
          rD[xU(0x3e3)] = xU(0xbb8);
          const rG = 0x4;
          for (let rH = 0x0; rH < 0x2; rH++) {
            rD[xU(0x181)]();
            if (rH === 0x0) rD[xU(0x9fa)]();
            for (let rI = 0x0; rI < 0x2; rI++) {
              for (let rJ = 0x0; rJ < rG; rJ++) {
                rD[xU(0x181)](), rH > 0x0 && rD[xU(0x9fa)]();
                const rK = -0.19 - (rJ / rG) * Math["PI"] * 0.25;
                rD[xU(0xd4b)](rK + rF * 0.05), rD[xU(0xbd5)](0x0, 0x0);
                const rL = Math[xU(0x6ad)](rE + rJ);
                rD[xU(0x609)](0x1c - (rL * 0.5 + 0.5), 0x0),
                  rD[xU(0xd4b)](rL * 0.08),
                  rD[xU(0x6e1)](0x0, 0x0),
                  rD[xU(0xbc4)](0x0, 0x7, 5.5, 0xe),
                  rH > 0x0 &&
                    ((rD[xU(0x290)] = 6.5),
                    (rD[xU(0x44c)] =
                      xU(0x737) + (0x2f + (rJ / rG) * 0x14) + "%)"),
                    rD[xU(0x2dc)]()),
                  rD[xU(0x242)]();
              }
              rD[xU(0xd3b)](-0x1, 0x1);
            }
            rH === 0x0 &&
              ((rD[xU(0x290)] = 0x9),
              (rD[xU(0x44c)] = xU(0x17f)),
              rD[xU(0x2dc)]()),
              rD[xU(0x242)]();
          }
          rD[xU(0x9fa)](),
            rD[xU(0x1e6)](
              0x0,
              -0x1e + Math[xU(0x6ad)](rE * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rD[xU(0x44c)] = xU(0x17f)),
            (rD[xU(0x290)] = 5.5),
            rD[xU(0x2dc)](),
            (rD[xU(0x776)] = 0x5 + rF * 0x8),
            (rD[xU(0x924)] = xU(0xa2b)),
            (rD[xU(0x44c)] = rD[xU(0x924)]),
            (rD[xU(0x290)] = 3.5),
            rD[xU(0x2dc)](),
            (rD[xU(0x776)] = 0x0);
        }
        [us(0xbc5)](rD) {
          const xV = us,
            rE = this[xV(0x7b9)] ? ll[xV(0x828)] : ll[xV(0xce7)],
            rF = Date[xV(0x213)]() / 0x1f4 + this[xV(0x175)],
            rG = Math[xV(0x6ad)](rF) - 0.5;
          rD[xV(0x3e3)] = rD[xV(0x8f6)] = xV(0xbb8);
          const rH = 0x46;
          rD[xV(0x181)](), rD[xV(0x9fa)]();
          for (let rI = 0x0; rI < 0x2; rI++) {
            rD[xV(0x181)]();
            const rJ = rI * 0x2 - 0x1;
            rD[xV(0xd3b)](0x1, rJ),
              rD[xV(0x609)](0x14, rH),
              rD[xV(0xd4b)](rG * 0.1),
              rD[xV(0xbd5)](0x0, 0x0),
              rD[xV(0x6e1)](-0xa, 0x32),
              rD[xV(0xbc4)](0x32, 0x32, 0x64, 0x1e),
              rD[xV(0xbc4)](0x32, 0x32, 0x64, 0x1e),
              rD[xV(0xbc4)](0x1e, 0x8c, -0x50, 0x78 - rG * 0x14),
              rD[xV(0xbc4)](
                -0xa + rG * 0xf,
                0x6e - rG * 0xa,
                -0x28,
                0x50 - rG * 0xa
              ),
              rD[xV(0xbc4)](
                -0xa + rG * 0xa,
                0x3c + rG * 0x5,
                -0x3c,
                0x32 - Math[xV(0x137)](0x0, rG) * 0xa
              ),
              rD[xV(0xbc4)](-0xa, 0x14 - rG * 0xa, -0x46, rG * 0xa),
              rD[xV(0x242)]();
          }
          (rD[xV(0xd2d)] = this[xV(0x67a)](rE[xV(0x166)])),
            rD[xV(0x5a4)](),
            (rD[xV(0x290)] = 0x12),
            (rD[xV(0x44c)] = xV(0xc62)),
            rD[xV(0xd02)](),
            rD[xV(0x2dc)](),
            rD[xV(0x242)](),
            rD[xV(0x181)](),
            rD[xV(0x609)](0x50, 0x0),
            rD[xV(0xd3b)](0x2, 0x2),
            rD[xV(0x9fa)]();
          for (let rK = 0x0; rK < 0x2; rK++) {
            rD[xV(0xd3b)](0x1, -0x1),
              rD[xV(0x181)](),
              rD[xV(0x609)](0x0, 0xf),
              rD[xV(0xd4b)]((Math[xV(0x6ad)](rF * 0x2) * 0.5 + 0.5) * 0.08),
              rD[xV(0xbd5)](0x0, -0x4),
              rD[xV(0xbc4)](0xa, 0x0, 0x14, -0x6),
              rD[xV(0xbc4)](0xf, 0x3, 0x0, 0x5),
              rD[xV(0x242)]();
          }
          (rD[xV(0xd2d)] = rD[xV(0x44c)] = xV(0xc96)),
            rD[xV(0x5a4)](),
            (rD[xV(0x290)] = 0x6),
            rD[xV(0x2dc)](),
            rD[xV(0x242)]();
          for (let rL = 0x0; rL < 0x2; rL++) {
            const rM = rL === 0x0;
            rM && rD[xV(0x9fa)]();
            for (let rN = 0x4; rN >= 0x0; rN--) {
              const rO = rN / 0x5,
                rP = 0x32 - 0x2d * rO;
              !rM && rD[xV(0x9fa)](),
                rD[xV(0x778)](
                  -0x50 - rO * 0x50 - rP / 0x2,
                  -rP / 0x2 +
                    Math[xV(0x6ad)](rO * Math["PI"] * 0x2 + rF * 0x3) *
                      0x8 *
                      rO,
                  rP,
                  rP
                ),
                !rM &&
                  ((rD[xV(0x290)] = 0x14),
                  (rD[xV(0xd2d)] = rD[xV(0x44c)] =
                    this[xV(0x67a)](rE[xV(0x769)][rN])),
                  rD[xV(0x2dc)](),
                  rD[xV(0x5a4)]());
            }
            rM &&
              ((rD[xV(0x290)] = 0x22),
              (rD[xV(0x44c)] = this[xV(0x67a)](rE[xV(0x9bd)])),
              rD[xV(0x2dc)]());
          }
          rD[xV(0x9fa)](),
            rD[xV(0x663)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rD[xV(0xd2d)] = this[xV(0x67a)](rE[xV(0xc39)])),
            rD[xV(0x5a4)](),
            (rD[xV(0x290)] = 0x24),
            (rD[xV(0x44c)] = xV(0xbe5)),
            rD[xV(0x181)](),
            rD[xV(0xd02)](),
            rD[xV(0x2dc)](),
            rD[xV(0x242)](),
            rD[xV(0x181)]();
          for (let rQ = 0x0; rQ < 0x2; rQ++) {
            rD[xV(0x9fa)]();
            for (let rR = 0x0; rR < 0x2; rR++) {
              rD[xV(0x181)]();
              const rS = rR * 0x2 - 0x1;
              rD[xV(0xd3b)](0x1, rS),
                rD[xV(0x609)](0x14, rH),
                rD[xV(0xd4b)](rG * 0.1),
                rD[xV(0xbd5)](0x0, 0xa),
                rD[xV(0x6e1)](-0xa, 0x32),
                rD[xV(0xbc4)](0x32, 0x32, 0x64, 0x1e),
                rD[xV(0xbc4)](0x32, 0x32, 0x64, 0x1e),
                rD[xV(0xbc4)](0x1e, 0x8c, -0x50, 0x78 - rG * 0x14),
                rD[xV(0xbd5)](0x64, 0x1e),
                rD[xV(0xbc4)](0x23, 0x5a, -0x28, 0x50 - rG * 0xa),
                rD[xV(0xbd5)](-0xa, 0x32),
                rD[xV(0xbc4)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[xV(0x137)](0x0, rG) * 0xa
                ),
                rD[xV(0x242)]();
            }
            rQ === 0x0
              ? ((rD[xV(0x290)] = 0x10),
                (rD[xV(0x44c)] = this[xV(0x67a)](rE[xV(0x5d4)])))
              : ((rD[xV(0x290)] = 0xa),
                (rD[xV(0x44c)] = this[xV(0x67a)](rE[xV(0x177)]))),
              rD[xV(0x2dc)]();
          }
          rD[xV(0x242)]();
        }
        [us(0x2b7)](rD, rE, rF, rG) {
          const xW = us;
          rD[xW(0x181)]();
          const rH = this[xW(0xc80)] / 0x28;
          rD[xW(0xd3b)](rH, rH),
            (rE = this[xW(0x67a)](rE)),
            (rF = this[xW(0x67a)](rF)),
            (rG = this[xW(0x67a)](rG));
          const rI = Math["PI"] / 0x5;
          rD[xW(0x3e3)] = rD[xW(0x8f6)] = xW(0xbb8);
          const rJ = Math[xW(0x6ad)](
              Date[xW(0x213)]() / 0x12c + this[xW(0x175)] * 0.2
            ),
            rK = rJ * 0.3 + 0.7;
          rD[xW(0x9fa)](),
            rD[xW(0x663)](0x16, 0x0, 0x17, 0x0, l0),
            rD[xW(0xbd5)](0x0, 0x0),
            rD[xW(0x663)](-0x5, 0x0, 0x21, 0x0, l0),
            (rD[xW(0xd2d)] = this[xW(0x67a)](xW(0x869))),
            rD[xW(0x5a4)](),
            rD[xW(0x181)](),
            rD[xW(0x609)](0x12, 0x0);
          for (let rN = 0x0; rN < 0x2; rN++) {
            rD[xW(0x181)](),
              rD[xW(0xd3b)](0x1, rN * 0x2 - 0x1),
              rD[xW(0xd4b)](Math["PI"] * 0.08 * rK),
              rD[xW(0x609)](-0x12, 0x0),
              rD[xW(0x9fa)](),
              rD[xW(0x663)](0x0, 0x0, 0x28, Math["PI"], -rI),
              rD[xW(0xbc4)](0x14 - rK * 0x3, -0xf, 0x14, 0x0),
              rD[xW(0x735)](),
              (rD[xW(0xd2d)] = rE),
              rD[xW(0x5a4)]();
            const rO = xW(0x5c6) + rN;
            if (!this[rO]) {
              const rP = new Path2D();
              for (let rQ = 0x0; rQ < 0x2; rQ++) {
                const rR = (Math[xW(0xba1)]() * 0x2 - 0x1) * 0x28,
                  rS = Math[xW(0xba1)]() * -0x28,
                  rT = Math[xW(0xba1)]() * 0x9 + 0x8;
                rP[xW(0xbd5)](rR, rS), rP[xW(0x663)](rR, rS, rT, 0x0, l0);
              }
              this[rO] = rP;
            }
            rD[xW(0xd02)](),
              (rD[xW(0xd2d)] = rG),
              rD[xW(0x5a4)](this[rO]),
              rD[xW(0x242)](),
              (rD[xW(0x290)] = 0x7),
              (rD[xW(0x44c)] = rF),
              rD[xW(0x2dc)]();
          }
          rD[xW(0x242)](), rD[xW(0x181)]();
          let rL = 0x9;
          rD[xW(0x609)](0x2a, 0x0);
          const rM = Math["PI"] * 0x3 - rJ;
          rD[xW(0x9fa)]();
          for (let rU = 0x0; rU < 0x2; rU++) {
            let rV = 0x0,
              rW = 0x8;
            rD[xW(0xbd5)](rV, rW);
            for (let rX = 0x0; rX < rL; rX++) {
              const rY = rX / rL,
                rZ = rY * rM,
                s0 = 0xf * (0x1 - rY),
                s1 = Math[xW(0x802)](rZ) * s0,
                s2 = Math[xW(0x6ad)](rZ) * s0,
                s3 = rV + s1,
                s4 = rW + s2;
              rD[xW(0xbc4)](
                rV + s1 * 0.5 + s2 * 0.25,
                rW + s2 * 0.5 - s1 * 0.25,
                s3,
                s4
              ),
                (rV = s3),
                (rW = s4);
            }
            rD[xW(0xd3b)](0x1, -0x1);
          }
          (rD[xW(0x3e3)] = rD[xW(0x8f6)] = xW(0xbb8)),
            (rD[xW(0x290)] = 0x2),
            (rD[xW(0x44c)] = rD[xW(0xd2d)]),
            rD[xW(0x2dc)](),
            rD[xW(0x242)](),
            rD[xW(0x242)]();
        }
        [us(0xc0)](rD, rE = 0x64, rF = 0x50, rG = 0x12, rH = 0x8) {
          const xX = us;
          rD[xX(0x9fa)]();
          const rI = (0x1 / rG) * Math["PI"] * 0x2;
          rD[xX(0xbd5)](rF, 0x0);
          for (let rJ = 0x0; rJ < rG; rJ++) {
            const rK = rJ * rI,
              rL = (rJ + 0x1) * rI;
            rD[xX(0x1db)](
              Math[xX(0x802)](rK) * rE,
              Math[xX(0x6ad)](rK) * rE,
              Math[xX(0x802)](rL) * rE,
              Math[xX(0x6ad)](rL) * rE,
              Math[xX(0x802)](rL) * rF,
              Math[xX(0x6ad)](rL) * rF
            );
          }
          (rD[xX(0xd2d)] = this[xX(0x67a)](xX(0xb04))),
            rD[xX(0x5a4)](),
            (rD[xX(0x290)] = rH),
            (rD[xX(0x3e3)] = rD[xX(0x8f6)] = xX(0xbb8)),
            (rD[xX(0x44c)] = this[xX(0x67a)](xX(0xb76))),
            rD[xX(0x2dc)]();
        }
        [us(0x67a)](rD) {
          const xY = us,
            rE = 0x1 - this[xY(0x59d)];
          if (
            rE >= 0x1 &&
            this[xY(0xcfc)] === 0x0 &&
            !this[xY(0x7d)] &&
            !this[xY(0xaee)]
          )
            return rD;
          rD = hA(rD);
          this[xY(0x7d)] &&
            (rD = hy(
              rD,
              [0xff, 0xff, 0xff],
              0.85 + Math[xY(0x6ad)](pM / 0x32) * 0.15
            ));
          this[xY(0xcfc)] > 0x0 &&
            (rD = hy(rD, [0x8f, 0x5d, 0xb0], 0x1 - this[xY(0xcfc)] * 0.75));
          rD = hy(rD, [0xff, 0x0, 0x0], rE * 0.25 + 0.75);
          if (this[xY(0xaee)]) {
            if (!this[xY(0xc3c)]) {
              let rF = pM / 0x4;
              if (!isNaN(this["id"])) rF += this["id"];
              this[xY(0xc3c)] = lH(rF % 0x168, 0x64, 0x32);
            }
            rD = hy(rD, this[xY(0xc3c)], 0.75);
          }
          return pY(rD);
        }
        [us(0x1e8)](rD) {
          const xZ = us;
          this[xZ(0xc3c)] = null;
          if (this[xZ(0x8ee)]) {
            const rE = Math[xZ(0x6ad)]((this[xZ(0x373)] * Math["PI"]) / 0x2);
            if (!this[xZ(0x664)]) {
              const rF = 0x1 + rE * 0x1;
              rD[xZ(0xd3b)](rF, rF);
            }
            rD[xZ(0x915)] *= 0x1 - rE;
          }
        }
        [us(0xabb)](rD, rE = !![], rF = 0x1) {
          const y0 = us;
          rD[y0(0x9fa)](),
            (rF = 0x8 * rF),
            rD[y0(0xbd5)](0x23, -rF),
            rD[y0(0xbc4)](0x33, -0x2 - rF, 0x3c, -0xc - rF),
            rD[y0(0x6e1)](0x23, -rF),
            rD[y0(0xbd5)](0x23, rF),
            rD[y0(0xbc4)](0x33, 0x2 + rF, 0x3c, 0xc + rF),
            rD[y0(0x6e1)](0x23, rF);
          const rG = y0(0x41d);
          (rD[y0(0xd2d)] = rD[y0(0x44c)] =
            rE ? this[y0(0x67a)](rG) : y0(0x41d)),
            rD[y0(0x5a4)](),
            (rD[y0(0x3e3)] = rD[y0(0x8f6)] = y0(0xbb8)),
            (rD[y0(0x290)] = 0x4),
            rD[y0(0x2dc)]();
        }
        [us(0x1a2)](rD, rE, rF = 0x1) {
          const y1 = us,
            rG = (rE / 0x1e) * 1.1;
          rD[y1(0xd3b)](rG, rG),
            rD[y1(0x9fa)](),
            rD[y1(0xbd5)](-0x1e, -0x11),
            rD[y1(0x6e1)](0x1e, 0x0),
            rD[y1(0x6e1)](-0x1e, 0x11),
            rD[y1(0x735)](),
            (rD[y1(0xd2d)] = rD[y1(0x44c)] = this[y1(0x67a)](y1(0x41d))),
            rD[y1(0x5a4)](),
            (rD[y1(0x290)] = 0x14 * rF),
            (rD[y1(0x3e3)] = rD[y1(0x8f6)] = y1(0xbb8)),
            rD[y1(0x2dc)]();
        }
        [us(0xc70)](rD, rE = 0x0, rF = 0x0, rG = 0x1, rH = 0x5) {
          const y2 = us;
          rD[y2(0x181)](),
            rD[y2(0x609)](rE, rF),
            rD[y2(0xd3b)](rG, rG),
            rD[y2(0x9fa)](),
            rD[y2(0xbd5)](0x23, -0x8),
            rD[y2(0xbc4)](0x34, -5.5, 0x3c, -0x14),
            rD[y2(0xbd5)](0x23, 0x8),
            rD[y2(0xbc4)](0x34, 5.5, 0x3c, 0x14),
            (rD[y2(0xd2d)] = rD[y2(0x44c)] = this[y2(0x67a)](y2(0x41d))),
            (rD[y2(0x3e3)] = rD[y2(0x8f6)] = y2(0xbb8)),
            (rD[y2(0x290)] = rH),
            rD[y2(0x2dc)](),
            rD[y2(0x9fa)]();
          const rI = Math["PI"] * 0.165;
          rD[y2(0x1e6)](0x3c, -0x14, 0x7, 0x9, rI, 0x0, l0),
            rD[y2(0x1e6)](0x3c, 0x14, 0x7, 0x9, -rI, 0x0, l0),
            rD[y2(0x5a4)](),
            rD[y2(0x242)]();
        }
      },
      lH = (rD, rE, rF) => {
        const y3 = us;
        (rE /= 0x64), (rF /= 0x64);
        const rG = (rJ) => (rJ + rD / 0x1e) % 0xc,
          rH = rE * Math[y3(0xd23)](rF, 0x1 - rF),
          rI = (rJ) =>
            rF -
            rH *
              Math[y3(0x137)](
                -0x1,
                Math[y3(0xd23)](
                  rG(rJ) - 0x3,
                  Math[y3(0xd23)](0x9 - rG(rJ), 0x1)
                )
              );
        return [0xff * rI(0x0), 0xff * rI(0x8), 0xff * rI(0x4)];
      };
    function lI(rD) {
      const y4 = us;
      return -(Math[y4(0x802)](Math["PI"] * rD) - 0x1) / 0x2;
    }
    function lJ(rD, rE, rF = 0x6, rG = us(0x155)) {
      const y5 = us,
        rH = rE / 0x64;
      rD[y5(0xd3b)](rH, rH), rD[y5(0x9fa)]();
      for (let rI = 0x0; rI < 0xc; rI++) {
        rD[y5(0xbd5)](0x0, 0x0);
        const rJ = (rI / 0xc) * Math["PI"] * 0x2;
        rD[y5(0x6e1)](Math[y5(0x802)](rJ) * 0x64, Math[y5(0x6ad)](rJ) * 0x64);
      }
      (rD[y5(0x290)] = rF),
        (rD[y5(0xd2d)] = rD[y5(0x44c)] = rG),
        (rD[y5(0x3e3)] = rD[y5(0x8f6)] = y5(0xbb8));
      for (let rK = 0x0; rK < 0x5; rK++) {
        const rL = (rK / 0x5) * 0x64 + 0xa;
        lb(rD, 0xc, rL, 0.5, 0.85);
      }
      rD[y5(0x2dc)]();
    }
    var lK = class {
        constructor(rD, rE, rF, rG, rH) {
          const y6 = us;
          (this[y6(0xb8a)] = rD),
            (this["id"] = rE),
            (this["x"] = rF),
            (this["y"] = rG),
            (this[y6(0xc80)] = rH),
            (this[y6(0x640)] = Math[y6(0xba1)]() * l0),
            (this[y6(0x2e1)] = -0x1),
            (this[y6(0x8ee)] = ![]),
            (this[y6(0xd79)] = 0x0),
            (this[y6(0x373)] = 0x0),
            (this[y6(0x22d)] = !![]),
            (this[y6(0x546)] = 0x0),
            (this[y6(0xd57)] = !![]);
        }
        [us(0xb50)]() {
          const y7 = us;
          if (this[y7(0xd79)] < 0x1) {
            this[y7(0xd79)] += pN / 0xc8;
            if (this[y7(0xd79)] > 0x1) this[y7(0xd79)] = 0x1;
          }
          this[y7(0x8ee)] && (this[y7(0x373)] += pN / 0xc8);
        }
        [us(0xa46)](rD) {
          const y8 = us;
          rD[y8(0x181)](), rD[y8(0x609)](this["x"], this["y"]);
          if (this[y8(0xb8a)] === cS[y8(0x76b)]) {
            rD[y8(0xd4b)](this[y8(0x640)]);
            const rE = this[y8(0xc80)],
              rF = pD(
                rD,
                y8(0x910) + this[y8(0xc80)],
                rE * 2.2,
                rE * 2.2,
                (rH) => {
                  const y9 = y8;
                  rH[y9(0x609)](rE * 1.1, rE * 1.1), lJ(rH, rE);
                },
                !![]
              ),
              rG = this[y8(0xd79)] + this[y8(0x373)] * 0.5;
            (rD[y8(0x915)] = (0x1 - this[y8(0x373)]) * 0.3),
              rD[y8(0xd3b)](rG, rG),
              rD[y8(0x392)](
                rF,
                -rF[y8(0xc90)] / 0x2,
                -rF[y8(0x64d)] / 0x2,
                rF[y8(0xc90)],
                rF[y8(0x64d)]
              );
          } else {
            if (this[y8(0xb8a)] === cS[y8(0x554)]) {
              let rH = this[y8(0xd79)] + this[y8(0x373)] * 0.5;
              (rD[y8(0x915)] = 0x1 - this[y8(0x373)]), (rD[y8(0x915)] *= 0.9);
              const rI =
                0.93 +
                0.07 *
                  (Math[y8(0x6ad)](
                    Date[y8(0x213)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              rH *= rI;
              const rJ = this[y8(0xc80)],
                rK = pD(
                  rD,
                  y8(0x291) + this[y8(0xc80)],
                  rJ * 2.2,
                  rJ * 2.2,
                  (rL) => {
                    const ya = y8;
                    rL[ya(0x609)](rJ * 1.1, rJ * 1.1);
                    const rM = rJ / 0x64;
                    rL[ya(0xd3b)](rM, rM),
                      lE(rL, 0x5c),
                      (rL[ya(0x8f6)] = rL[ya(0x3e3)] = ya(0xbb8)),
                      (rL[ya(0x290)] = 0x28),
                      (rL[ya(0x44c)] = ya(0x370)),
                      rL[ya(0x2dc)](),
                      (rL[ya(0xd2d)] = ya(0xf1)),
                      (rL[ya(0x44c)] = ya(0x99c)),
                      (rL[ya(0x290)] = 0xe),
                      rL[ya(0x5a4)](),
                      rL[ya(0x2dc)]();
                  },
                  !![]
                );
              rD[y8(0xd3b)](rH, rH),
                rD[y8(0x392)](
                  rK,
                  -rK[y8(0xc90)] / 0x2,
                  -rK[y8(0x64d)] / 0x2,
                  rK[y8(0xc90)],
                  rK[y8(0x64d)]
                );
            } else {
              if (this[y8(0xb8a)] === cS[y8(0xa7e)]) {
                rD[y8(0x477)](this[y8(0xc80)] / 0x32),
                  (rD[y8(0x8f6)] = y8(0xbb8)),
                  rD[y8(0x181)](),
                  (this[y8(0x546)] +=
                    ((this[y8(0x2e1)] >= 0x0 ? 0x1 : -0x1) * pN) / 0x12c),
                  (this[y8(0x546)] = Math[y8(0xd23)](
                    0x1,
                    Math[y8(0x137)](0x0, this[y8(0x546)])
                  ));
                if (this[y8(0x546)] > 0x0) {
                  rD[y8(0x477)](this[y8(0x546)]),
                    (rD[y8(0x915)] *= this[y8(0x546)]),
                    (rD[y8(0x290)] = 0.1),
                    (rD[y8(0x44c)] = rD[y8(0xd2d)] = y8(0xa01)),
                    (rD[y8(0xb9b)] = y8(0x2db)),
                    (rD[y8(0x139)] = y8(0x91c) + iA);
                  const rM = y8(0x3af) + (this[y8(0x2e1)] + 0x1);
                  lR(
                    rD,
                    rM,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rM[y8(0x680)] * 0.09),
                    !![]
                  );
                }
                rD[y8(0x242)]();
                const rL = this[y8(0x7b8)]
                  ? 0.6
                  : ((this["id"] + Date[y8(0x213)]()) / 0x4b0) % 6.28;
                rD[y8(0x181)]();
                for (let rN = 0x0; rN < 0x8; rN++) {
                  const rO = 0x1 - rN / 0x8,
                    rP = rO * 0x50;
                  rD[y8(0xd4b)](rL),
                    (rD[y8(0x44c)] = y8(0x274)),
                    rD[y8(0x9fa)](),
                    rD[y8(0x778)](-rP / 0x2, -rP / 0x2, rP, rP),
                    rD[y8(0x735)](),
                    (rD[y8(0x290)] = 0x28),
                    rD[y8(0x2dc)](),
                    (rD[y8(0x290)] = 0x14),
                    rD[y8(0x2dc)]();
                }
                rD[y8(0x242)]();
                if (!this[y8(0xcec)]) {
                  this[y8(0xcec)] = [];
                  for (let rQ = 0x0; rQ < 0x1e; rQ++) {
                    this[y8(0xcec)][y8(0x46a)]({
                      x: Math[y8(0xba1)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rR = 0x0; rR < this[y8(0xcec)][y8(0x680)]; rR++) {
                  const rS = this[y8(0xcec)][rR];
                  (rS["x"] += rS["v"]),
                    rS["x"] > 0x1 &&
                      ((rS["x"] %= 0x1),
                      (rS[y8(0x640)] = Math[y8(0xba1)]() * 6.28),
                      (rS["v"] = Math[y8(0xba1)]() * 0.005 + 0.008),
                      (rS["s"] = Math[y8(0xba1)]() * 0.025 + 0.008)),
                    rD[y8(0x181)](),
                    (rD[y8(0x915)] =
                      rS["x"] < 0.2
                        ? rS["x"] / 0.2
                        : rS["x"] > 0.8
                        ? 0x1 - (rS["x"] - 0.8) / 0.2
                        : 0x1),
                    rD[y8(0xd3b)](0x5a, 0x5a),
                    rD[y8(0xd4b)](rS[y8(0x640)]),
                    rD[y8(0x609)](rS["x"], 0x0),
                    rD[y8(0x9fa)](),
                    rD[y8(0x663)](0x0, 0x0, rS["s"], 0x0, Math["PI"] * 0x2),
                    (rD[y8(0xd2d)] = y8(0xa01)),
                    rD[y8(0x5a4)](),
                    rD[y8(0x242)]();
                }
              }
            }
          }
          rD[y8(0x242)]();
        }
      },
      lL = 0x0,
      lM = 0x0,
      lN = class extends lK {
        constructor(rD, rE, rF, rG) {
          const yb = us;
          super(cS[yb(0x6bb)], rD, rE, rF, 0x46),
            (this[yb(0x640)] = (Math[yb(0xba1)]() * 0x2 - 0x1) * 0.2),
            (this[yb(0x6f7)] = dC[rG]);
        }
        [us(0xb50)]() {
          const yc = us;
          if (this[yc(0xd79)] < 0x2 || pM - lL < 0x9c4) {
            this[yc(0xd79)] += pN / 0x12c;
            return;
          }
          this[yc(0x8ee)] && (this[yc(0x373)] += pN / 0xc8),
            this[yc(0x2e9)] &&
              ((this["x"] = pt(this["x"], this[yc(0x2e9)]["x"], 0xc8)),
              (this["y"] = pt(this["y"], this[yc(0x2e9)]["y"], 0xc8)));
        }
        [us(0xa46)](rD) {
          const yd = us;
          if (this[yd(0xd79)] === 0x0) return;
          rD[yd(0x181)](), rD[yd(0x609)](this["x"], this["y"]);
          const rE = yd(0x71b) + this[yd(0x6f7)]["id"];
          let rF =
            (this[yd(0xac8)] || lM < 0x3) &&
            pD(
              rD,
              rE,
              0x78,
              0x78,
              (rI) => {
                const ye = yd;
                (this[ye(0xac8)] = !![]),
                  lM++,
                  rI[ye(0x609)](0x3c, 0x3c),
                  (rI[ye(0x3e3)] = rI[ye(0x8f6)] = ye(0xbb8)),
                  rI[ye(0x9fa)](),
                  rI[ye(0x778)](-0x32, -0x32, 0x64, 0x64),
                  (rI[ye(0x290)] = 0x12),
                  (rI[ye(0x44c)] = ye(0x529)),
                  rI[ye(0x2dc)](),
                  (rI[ye(0x290)] = 0x8),
                  (rI[ye(0xd2d)] = hQ[this[ye(0x6f7)][ye(0x3ac)]]),
                  rI[ye(0x5a4)](),
                  (rI[ye(0x44c)] = hR[this[ye(0x6f7)][ye(0x3ac)]]),
                  rI[ye(0x2dc)]();
                const rJ = pG(
                  rI,
                  this[ye(0x6f7)][ye(0x456)],
                  0x12,
                  ye(0x155),
                  0x3,
                  !![]
                );
                rI[ye(0x392)](
                  rJ,
                  -rJ[ye(0xc90)] / 0x2,
                  0x32 - 0xd / 0x2 - rJ[ye(0x64d)],
                  rJ[ye(0xc90)],
                  rJ[ye(0x64d)]
                ),
                  rI[ye(0x181)](),
                  rI[ye(0x609)](
                    0x0 + this[ye(0x6f7)][ye(0xc23)],
                    -0x5 + this[ye(0x6f7)][ye(0x562)]
                  ),
                  this[ye(0x6f7)][ye(0x461)](rI),
                  rI[ye(0x242)]();
              },
              !![]
            );
          if (!rF) rF = pC[rE];
          rD[yd(0xd4b)](this[yd(0x640)]);
          const rG = Math[yd(0xd23)](this[yd(0xd79)], 0x1),
            rH =
              (this[yd(0xc80)] / 0x64) *
              (0x1 +
                Math[yd(0x6ad)](Date[yd(0x213)]() / 0xfa + this["id"]) * 0.05) *
              rG *
              (0x1 - this[yd(0x373)]);
          rD[yd(0xd3b)](rH, rH),
            rD[yd(0xd4b)](Math["PI"] * lI(0x1 - rG)),
            rF
              ? rD[yd(0x392)](
                  rF,
                  -rF[yd(0xc90)] / 0x2,
                  -rF[yd(0x64d)] / 0x2,
                  rF[yd(0xc90)],
                  rF[yd(0x64d)]
                )
              : (rD[yd(0x9fa)](),
                rD[yd(0x778)](-0x3c, -0x3c, 0x78, 0x78),
                (rD[yd(0xd2d)] = hQ[this[yd(0x6f7)][yd(0x3ac)]]),
                rD[yd(0x5a4)]()),
            rD[yd(0x242)]();
        }
      };
    function lO(rD) {
      const yf = us;
      rD[yf(0x9fa)](),
        rD[yf(0xbd5)](0x0, 4.5),
        rD[yf(0xbc4)](3.75, 0x0, 0x0, -4.5),
        rD[yf(0xbc4)](-3.75, 0x0, 0x0, 4.5),
        rD[yf(0x735)](),
        (rD[yf(0x3e3)] = rD[yf(0x8f6)] = yf(0xbb8)),
        (rD[yf(0xd2d)] = rD[yf(0x44c)] = yf(0xc96)),
        (rD[yf(0x290)] = 0x1),
        rD[yf(0x2dc)](),
        rD[yf(0x5a4)](),
        rD[yf(0xd02)](),
        rD[yf(0x9fa)](),
        rD[yf(0x663)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, l0),
        (rD[yf(0xd2d)] = yf(0x5f1)),
        rD[yf(0x5a4)]();
    }
    function lP(rD, rE = ![]) {
      const yg = us;
      lQ(rD, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lQ(rD, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rE) {
        const rF = Math["PI"] / 0x7;
        rD[yg(0x9fa)](),
          rD[yg(0x663)](0x0, 0x0, 23.5, Math["PI"] + rF, Math["PI"] * 0x2 - rF),
          (rD[yg(0x44c)] = yg(0x133)),
          (rD[yg(0x290)] = 0x4),
          (rD[yg(0x3e3)] = yg(0xbb8)),
          rD[yg(0x2dc)]();
      }
    }
    function lQ(rD, rE, rF) {
      const yh = us;
      rD[yh(0x181)](),
        rD[yh(0xd4b)](rE),
        rD[yh(0x609)](0x0, -23.6),
        rD[yh(0xd4b)](rF),
        rD[yh(0x9fa)](),
        rD[yh(0xbd5)](-6.5, 0x1),
        rD[yh(0x6e1)](0x0, -0xf),
        rD[yh(0x6e1)](6.5, 0x1),
        (rD[yh(0xd2d)] = yh(0xd5d)),
        (rD[yh(0x290)] = 3.5),
        rD[yh(0x5a4)](),
        (rD[yh(0x8f6)] = yh(0xbb8)),
        (rD[yh(0x44c)] = yh(0x133)),
        rD[yh(0x2dc)](),
        rD[yh(0x242)]();
    }
    function lR(rD, rE, rF, rG, rH, rI, rJ = ![]) {
      const yi = us;
      var rK = rE[yi(0x680)],
        rL;
      rD[yi(0x181)](),
        rD[yi(0x609)](rF, rG),
        rD[yi(0xd4b)]((0x1 * rI) / 0x2),
        rD[yi(0xd4b)]((0x1 * (rI / rK)) / 0x2),
        (rD[yi(0xd16)] = yi(0x209));
      for (var rM = 0x0; rM < rK; rM++) {
        rD[yi(0xd4b)](-rI / rK),
          rD[yi(0x181)](),
          rD[yi(0x609)](0x0, rH),
          (rL = rE[rM]),
          rJ && rD[yi(0x67f)](rL, 0x0, 0x0),
          rD[yi(0x9cd)](rL, 0x0, 0x0),
          rD[yi(0x242)]();
      }
      rD[yi(0x242)]();
    }
    function lS(rD, rE = 0x1) {
      const yj = us,
        rF = 0xf;
      rD[yj(0x9fa)]();
      const rG = 0x6;
      for (let rL = 0x0; rL < rG; rL++) {
        const rM = (rL / rG) * Math["PI"] * 0x2;
        rD[yj(0x6e1)](Math[yj(0x802)](rM) * rF, Math[yj(0x6ad)](rM) * rF);
      }
      rD[yj(0x735)](),
        (rD[yj(0x290)] = 0x4),
        (rD[yj(0x44c)] = yj(0xcd8)),
        rD[yj(0x2dc)](),
        (rD[yj(0xd2d)] = yj(0x581)),
        rD[yj(0x5a4)]();
      const rH = (Math["PI"] * 0x2) / rG,
        rI = Math[yj(0x802)](rH) * rF,
        rJ = Math[yj(0x6ad)](rH) * rF;
      for (let rN = 0x0; rN < rG; rN++) {
        rD[yj(0x9fa)](),
          rD[yj(0xbd5)](0x0, 0x0),
          rD[yj(0x6e1)](rF, 0x0),
          rD[yj(0x6e1)](rI, rJ),
          rD[yj(0x735)](),
          (rD[yj(0xd2d)] =
            yj(0x771) + (0.2 + (((rN + 0x4) % rG) / rG) * 0.35) + ")"),
          rD[yj(0x5a4)](),
          rD[yj(0xd4b)](rH);
      }
      rD[yj(0x9fa)]();
      const rK = rF * 0.65;
      for (let rO = 0x0; rO < rG; rO++) {
        const rP = (rO / rG) * Math["PI"] * 0x2;
        rD[yj(0x6e1)](Math[yj(0x802)](rP) * rK, Math[yj(0x6ad)](rP) * rK);
      }
      (rD[yj(0x776)] = 0x23 + rE * 0xf),
        (rD[yj(0x924)] = rD[yj(0xd2d)] = yj(0x100)),
        rD[yj(0x5a4)](),
        rD[yj(0x5a4)](),
        rD[yj(0x5a4)]();
    }
    var lT = class extends lG {
        constructor(rD, rE, rF, rG, rH, rI, rJ) {
          const yk = us;
          super(rD, cS[yk(0x253)], rE, rF, rG, rJ, rH),
            (this[yk(0xca)] = rI),
            (this[yk(0x905)] = 0x0),
            (this[yk(0x2c1)] = 0x0),
            (this[yk(0x3ef)] = 0x0),
            (this[yk(0xd8c)] = 0x0),
            (this[yk(0x9ca)] = ""),
            (this[yk(0x73b)] = 0x0),
            (this[yk(0x201)] = !![]),
            (this[yk(0xc16)] = ![]),
            (this[yk(0xb1d)] = ![]),
            (this[yk(0x56f)] = ![]),
            (this[yk(0xc03)] = ![]),
            (this[yk(0x138)] = ![]),
            (this[yk(0x700)] = !![]),
            (this[yk(0x550)] = 0x0),
            (this[yk(0xb3b)] = 0x0);
        }
        [us(0xb50)]() {
          const yl = us;
          super[yl(0xb50)]();
          if (this[yl(0x8ee)]) (this[yl(0x2c1)] = 0x1), (this[yl(0x905)] = 0x0);
          else {
            const rD = pN / 0xc8;
            let rE = this[yl(0xca)];
            if (this[yl(0xc16)] && rE === cY[yl(0x2ee)]) rE = cY[yl(0x110)];
            (this[yl(0x905)] = Math[yl(0xd23)](
              0x1,
              Math[yl(0x137)](
                0x0,
                this[yl(0x905)] + (rE === cY[yl(0xc4d)] ? rD : -rD)
              )
            )),
              (this[yl(0x2c1)] = Math[yl(0xd23)](
                0x1,
                Math[yl(0x137)](
                  0x0,
                  this[yl(0x2c1)] + (rE === cY[yl(0x110)] ? rD : -rD)
                )
              )),
              (this[yl(0x550)] = pt(this[yl(0x550)], this[yl(0xb3b)], 0x64));
          }
        }
        [us(0xa46)](rD) {
          const ym = us;
          rD[ym(0x181)](), rD[ym(0x609)](this["x"], this["y"]);
          let rE = this[ym(0xc80)] / kZ;
          this[ym(0x8ee)] &&
            rD[ym(0xd4b)]((this[ym(0x373)] * Math["PI"]) / 0x4);
          rD[ym(0xd3b)](rE, rE), this[ym(0x1e8)](rD);
          this[ym(0x3da)] &&
            (rD[ym(0x181)](),
            rD[ym(0xd4b)](this[ym(0x640)]),
            rD[ym(0x477)](this[ym(0xc80)] / 0x28 / rE),
            this[ym(0x49d)](rD),
            rD[ym(0x242)]());
          this[ym(0x8f7)] &&
            (rD[ym(0x181)](),
            rD[ym(0x477)](kZ / 0x12),
            this[ym(0x97)](rD, pM / 0x12c),
            rD[ym(0x242)]());
          const rF = ym(0x133);
          if (this[ym(0x845)]) {
            const rP = Date[ym(0x213)](),
              rQ = (Math[ym(0x6ad)](rP / 0x12c) * 0.5 + 0.5) * 0x2;
            rD[ym(0x9fa)](),
              rD[ym(0xbd5)](0x5, -0x22),
              rD[ym(0x1db)](0x2f, -0x19, 0x14, 0x5, 0x2b - rQ, 0x19),
              rD[ym(0xbc4)](0x0, 0x28 + rQ * 0.6, -0x2b + rQ, 0x19),
              rD[ym(0x1db)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rD[ym(0xbc4)](0x0, -0x23, 0x5, -0x22),
              (rD[ym(0xd2d)] = rF),
              rD[ym(0x5a4)]();
          }
          this[ym(0x138)] && lP(rD);
          const rG = this[ym(0xc03)]
            ? [ym(0x869), ym(0x41d)]
            : this[ym(0x8ca)]
            ? [ym(0x626), ym(0x77a)]
            : [ym(0xc5d), ym(0xc51)];
          (rG[0x0] = this[ym(0x67a)](rG[0x0])),
            (rG[0x1] = this[ym(0x67a)](rG[0x1]));
          let rH = 2.75;
          !this[ym(0x8ca)] && (rH /= rE);
          (rD[ym(0xd2d)] = rG[0x0]),
            (rD[ym(0x290)] = rH),
            (rD[ym(0x44c)] = rG[0x1]);
          this[ym(0x8ca)] &&
            (rD[ym(0x9fa)](),
            rD[ym(0xbd5)](0x0, 0x0),
            rD[ym(0xbc4)](-0x1e, 0xf, -0x1e, 0x1e),
            rD[ym(0xbc4)](0x0, 0x37, 0x1e, 0x1e),
            rD[ym(0xbc4)](0x1e, 0xf, 0x0, 0x0),
            rD[ym(0x5a4)](),
            rD[ym(0x2dc)](),
            rD[ym(0x181)](),
            (rD[ym(0xd2d)] = rD[ym(0x44c)]),
            (rD[ym(0xb9b)] = ym(0x2db)),
            (rD[ym(0x139)] = ym(0x261) + iA),
            lR(rD, ym(0x6b2), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rD[ym(0x242)]());
          rD[ym(0x9fa)]();
          this[ym(0x504)]
            ? !this[ym(0x845)]
              ? rD[ym(0x778)](-0x19, -0x19, 0x32, 0x32)
              : (rD[ym(0xbd5)](0x19, 0x19),
                rD[ym(0x6e1)](-0x19, 0x19),
                rD[ym(0x6e1)](-0x19, -0xa),
                rD[ym(0x6e1)](-0xa, -0x19),
                rD[ym(0x6e1)](0xa, -0x19),
                rD[ym(0x6e1)](0x19, -0xa),
                rD[ym(0x735)]())
            : rD[ym(0x663)](0x0, 0x0, kZ, 0x0, l0);
          rD[ym(0x5a4)](), rD[ym(0x2dc)]();
          this[ym(0x792)] &&
            (rD[ym(0x181)](),
            rD[ym(0xd02)](),
            rD[ym(0x9fa)](),
            !this[ym(0x845)] &&
              (rD[ym(0xbd5)](-0x8, -0x1e),
              rD[ym(0x6e1)](0xf, -0x7),
              rD[ym(0x6e1)](0x1e, -0x14),
              rD[ym(0x6e1)](0x1e, -0x32)),
            rD[ym(0x609)](
              0x0,
              0x2 * (0x1 - (this[ym(0x2c1)] + this[ym(0x905)]))
            ),
            rD[ym(0xbd5)](-0x2, 0x0),
            rD[ym(0x6e1)](-0x3, 4.5),
            rD[ym(0x6e1)](0x3, 4.5),
            rD[ym(0x6e1)](0x2, 0x0),
            (rD[ym(0xd2d)] = ym(0xc96)),
            rD[ym(0x5a4)](),
            rD[ym(0x242)]());
          this[ym(0x845)] &&
            (rD[ym(0x9fa)](),
            rD[ym(0xbd5)](0x0, -0x17),
            rD[ym(0xbc4)](0x4, -0xd, 0x1b, -0x8),
            rD[ym(0x6e1)](0x14, -0x1c),
            rD[ym(0x6e1)](-0x14, -0x1c),
            rD[ym(0x6e1)](-0x1b, -0x8),
            rD[ym(0xbc4)](-0x4, -0xd, 0x0, -0x17),
            (rD[ym(0xd2d)] = rF),
            rD[ym(0x5a4)]());
          if (this[ym(0x522)]) {
            (rD[ym(0x44c)] = ym(0xb7e)),
              (rD[ym(0x290)] = 1.4),
              rD[ym(0x9fa)](),
              (rD[ym(0x3e3)] = ym(0xbb8));
            const rR = 4.5;
            for (let rS = 0x0; rS < 0x2; rS++) {
              const rT = -0x12 + rS * 0x1d;
              for (let rU = 0x0; rU < 0x3; rU++) {
                const rV = rT + rU * 0x3;
                rD[ym(0xbd5)](rV, rR + -1.5), rD[ym(0x6e1)](rV + 1.6, rR + 1.6);
              }
            }
            rD[ym(0x2dc)]();
          }
          if (this[ym(0xc02)]) {
            rD[ym(0x9fa)](),
              rD[ym(0x663)](0x0, 2.5, 3.3, 0x0, l0),
              (rD[ym(0xd2d)] = ym(0x762)),
              rD[ym(0x5a4)](),
              rD[ym(0x9fa)](),
              rD[ym(0x663)](0xd, 2.8, 5.5, 0x0, l0),
              rD[ym(0x663)](-0xd, 2.8, 5.5, 0x0, l0),
              (rD[ym(0xd2d)] = ym(0x3a1)),
              rD[ym(0x5a4)](),
              rD[ym(0x181)](),
              rD[ym(0xd4b)](-Math["PI"] / 0x4),
              rD[ym(0x9fa)]();
            const rW = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[ym(0x504)] &&
              rW[ym(0x78e)]((rX) => {
                (rX[0x0] *= 1.1), (rX[0x1] *= 1.1);
              });
            for (let rX = 0x0; rX < 0x2; rX++) {
              for (let rY = 0x0; rY < rW[ym(0x680)]; rY++) {
                const rZ = rW[rY];
                rD[ym(0xbd5)](rZ[0x0], rZ[0x1]), rD[ym(0x663)](...rZ, 0x0, l0);
              }
              rD[ym(0xd4b)](-Math["PI"] / 0x2);
            }
            (rD[ym(0xd2d)] = ym(0x699)), rD[ym(0x5a4)](), rD[ym(0x242)]();
          }
          const rI = this[ym(0x905)],
            rJ = this[ym(0x2c1)],
            rK = 0x6 * rI,
            rL = 0x4 * rJ;
          function rM(s0, s1) {
            const yn = ym;
            rD[yn(0x9fa)]();
            const s3 = 3.25;
            rD[yn(0xbd5)](s0 - s3, s1 - s3),
              rD[yn(0x6e1)](s0 + s3, s1 + s3),
              rD[yn(0xbd5)](s0 + s3, s1 - s3),
              rD[yn(0x6e1)](s0 - s3, s1 + s3),
              (rD[yn(0x290)] = 0x2),
              (rD[yn(0x3e3)] = yn(0xbb8)),
              (rD[yn(0x44c)] = yn(0xc96)),
              rD[yn(0x2dc)](),
              rD[yn(0x735)]();
          }
          function rN(s0, s1) {
            const yo = ym;
            rD[yo(0x181)](),
              rD[yo(0x609)](s0, s1),
              rD[yo(0x9fa)](),
              rD[yo(0xbd5)](-0x4, 0x0),
              rD[yo(0xbc4)](0x0, 0x6, 0x4, 0x0),
              (rD[yo(0x290)] = 0x2),
              (rD[yo(0x3e3)] = yo(0xbb8)),
              (rD[yo(0x44c)] = yo(0xc96)),
              rD[yo(0x2dc)](),
              rD[yo(0x242)]();
          }
          if (this[ym(0x8ee)]) rM(0x7, -0x5), rM(-0x7, -0x5);
          else {
            if (this[ym(0x63c)]) rN(0x7, -0x5), rN(-0x7, -0x5);
            else {
              let s0 = function (s2, s3, s4, s5, s6 = 0x0) {
                  const yp = ym,
                    s7 = s6 ^ 0x1;
                  rD[yp(0xbd5)](s2 - s4, s3 - s5 + s6 * rK + s7 * rL),
                    rD[yp(0x6e1)](s2 + s4, s3 - s5 + s7 * rK + s6 * rL),
                    rD[yp(0x6e1)](s2 + s4, s3 + s5),
                    rD[yp(0x6e1)](s2 - s4, s3 + s5),
                    rD[yp(0x6e1)](s2 - s4, s3 - s5);
                },
                s1 = function (s3 = 0x0) {
                  const yq = ym;
                  rD[yq(0x9fa)](),
                    rD[yq(0x1e6)](0x7, -0x5, 2.5 + s3, 0x6 + s3, 0x0, 0x0, l0),
                    rD[yq(0xbd5)](-0x7, -0x5),
                    rD[yq(0x1e6)](-0x7, -0x5, 2.5 + s3, 0x6 + s3, 0x0, 0x0, l0),
                    (rD[yq(0x44c)] = rD[yq(0xd2d)] = yq(0xc96)),
                    rD[yq(0x5a4)]();
                };
              rD[ym(0x181)](),
                rD[ym(0x9fa)](),
                s0(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                s0(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rD[ym(0xd02)](),
                s1(0.7),
                s1(0x0),
                rD[ym(0xd02)](),
                rD[ym(0x9fa)](),
                rD[ym(0x663)](
                  0x7 + this[ym(0x3ef)] * 0x2,
                  -0x5 + this[ym(0xd8c)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                rD[ym(0xbd5)](-0x7, -0x5),
                rD[ym(0x663)](
                  -0x7 + this[ym(0x3ef)] * 0x2,
                  -0x5 + this[ym(0xd8c)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                (rD[ym(0xd2d)] = ym(0x5f1)),
                rD[ym(0x5a4)](),
                rD[ym(0x242)]();
            }
          }
          if (this[ym(0x56f)]) {
            rD[ym(0x181)](), rD[ym(0x609)](0x0, -0xc);
            if (this[ym(0x8ee)]) rD[ym(0xd3b)](0.7, 0.7), rM(0x0, -0x3);
            else
              this[ym(0x63c)]
                ? (rD[ym(0xd3b)](0.7, 0.7), rN(0x0, -0x3))
                : lO(rD);
            rD[ym(0x242)]();
          }
          this[ym(0xb1d)] &&
            (rD[ym(0x181)](),
            rD[ym(0x609)](0x0, 0xa),
            rD[ym(0xd4b)](-Math["PI"] / 0x2),
            rD[ym(0xd3b)](0.82, 0.82),
            this[ym(0xabb)](rD, ![], 0.85),
            rD[ym(0x242)]());
          const rO = rI * (-0x5 - 5.5) + rJ * (-0x5 - 0x4);
          rD[ym(0x181)](),
            rD[ym(0x9fa)](),
            rD[ym(0x609)](0x0, 9.5),
            rD[ym(0xbd5)](-5.6, 0x0),
            rD[ym(0xbc4)](0x0, 0x5 + rO, 5.6, 0x0),
            (rD[ym(0x3e3)] = ym(0xbb8));
          this[ym(0xc02)]
            ? ((rD[ym(0x290)] = 0x7),
              (rD[ym(0x44c)] = ym(0x762)),
              rD[ym(0x2dc)](),
              (rD[ym(0x44c)] = ym(0x8ef)))
            : (rD[ym(0x44c)] = ym(0xc96));
          (rD[ym(0x290)] = 1.75), rD[ym(0x2dc)](), rD[ym(0x242)]();
          if (this[ym(0x105)]) {
            const s2 = this[ym(0x905)],
              s3 = 0x28,
              s4 = Date[ym(0x213)]() / 0x12c,
              s5 = this[ym(0x8ca)] ? 0x0 : Math[ym(0x6ad)](s4) * 0.5 + 0.5,
              s6 = s5 * 0x4,
              s7 = 0x28 - s5 * 0x4,
              s8 = s7 - (this[ym(0x8ca)] ? 0x1 : jf(s2)) * 0x50,
              s9 = this[ym(0x792)];
            (rD[ym(0x290)] = 0x9 + rH * 0x2),
              (rD[ym(0x8f6)] = ym(0xbb8)),
              (rD[ym(0x3e3)] = ym(0xbb8));
            for (let sa = 0x0; sa < 0x2; sa++) {
              rD[ym(0x9fa)](), rD[ym(0x181)]();
              for (let sb = 0x0; sb < 0x2; sb++) {
                rD[ym(0xbd5)](0x19, 0x0);
                let sc = s8;
                s9 && sb === 0x0 && (sc = s7),
                  rD[ym(0xbc4)](0x2d + s6, sc * 0.5, 0xb, sc),
                  rD[ym(0xd3b)](-0x1, 0x1);
              }
              rD[ym(0x242)](),
                (rD[ym(0x44c)] = rG[0x1 - sa]),
                rD[ym(0x2dc)](),
                (rD[ym(0x290)] = 0x9);
            }
            rD[ym(0x181)](),
              rD[ym(0x609)](0x0, s8),
              lS(rD, s5),
              rD[ym(0x242)]();
          }
          rD[ym(0x242)]();
        }
        [us(0x1ff)](rD, rE) {}
        [us(0xd0f)](rD, rE = 0x1) {
          const yr = us,
            rF = nh[this["id"]];
          if (!rF) return;
          for (let rG = 0x0; rG < rF[yr(0x680)]; rG++) {
            const rH = rF[rG];
            if (rH["t"] > lV + lW) continue;
            !rH["x"] &&
              ((rH["x"] = this["x"]),
              (rH["y"] = this["y"] - this[yr(0xc80)] - 0x44),
              (rH[yr(0x822)] = this["x"]),
              (rH[yr(0xc43)] = this["y"]));
            const rI = rH["t"] > lV ? 0x1 - (rH["t"] - lV) / lW : 0x1,
              rJ = rI * rI * rI;
            (rH["x"] += (this["x"] - rH[yr(0x822)]) * rJ),
              (rH["y"] += (this["y"] - rH[yr(0xc43)]) * rJ),
              (rH[yr(0x822)] = this["x"]),
              (rH[yr(0xc43)] = this["y"]);
            const rK = Math[yr(0xd23)](0x1, rH["t"] / 0x64);
            rD[yr(0x181)](),
              (rD[yr(0x915)] = (rI < 0.7 ? rI / 0.7 : 0x1) * rK * 0.9),
              rD[yr(0x609)](rH["x"], rH["y"] - (rH["t"] / lV) * 0x14),
              rD[yr(0x477)](rE);
            const rL = pG(rD, rH[yr(0x5f0)], 0x10, yr(0x91a), 0x0, !![], ![]);
            rD[yr(0x477)](rK), rD[yr(0x9fa)]();
            const rM = rL[yr(0xc90)] + 0xa,
              rN = rL[yr(0x64d)] + 0xf;
            rD[yr(0x64a)]
              ? rD[yr(0x64a)](-rM / 0x2, -rN / 0x2, rM, rN, 0x5)
              : rD[yr(0x778)](-rM / 0x2, -rN / 0x2, rM, rN),
              (rD[yr(0xd2d)] = rH[yr(0x5c9)]),
              rD[yr(0x5a4)](),
              (rD[yr(0x44c)] = yr(0x91a)),
              (rD[yr(0x290)] = 1.5),
              rD[yr(0x2dc)](),
              rD[yr(0x392)](
                rL,
                -rL[yr(0xc90)] / 0x2,
                -rL[yr(0x64d)] / 0x2,
                rL[yr(0xc90)],
                rL[yr(0x64d)]
              ),
              rD[yr(0x242)]();
          }
        }
      },
      lU = 0x4e20,
      lV = 0xfa0,
      lW = 0xbb8,
      lX = lV + lW;
    function lY(rD, rE, rF = 0x1) {
      const ys = us;
      if (rD[ys(0x8ee)]) return;
      rE[ys(0x181)](),
        rE[ys(0x609)](rD["x"], rD["y"]),
        lZ(rD, rE),
        rE[ys(0x609)](0x0, -rD[ys(0xc80)] - 0x19),
        rE[ys(0x181)](),
        rE[ys(0x477)](rF),
        rD[ys(0x8be)] &&
          (pG(rE, "@" + rD[ys(0x8be)], 0xb, ys(0x9e3), 0x3),
          rE[ys(0x609)](0x0, -0x10)),
        rD[ys(0x9ca)] &&
          (pG(rE, rD[ys(0x9ca)], 0x12, ys(0x155), 0x3),
          rE[ys(0x609)](0x0, -0x5)),
        rE[ys(0x242)](),
        !rD[ys(0x700)] &&
          rD[ys(0x4fa)] > 0.001 &&
          ((rE[ys(0x915)] = rD[ys(0x4fa)]),
          rE[ys(0xd3b)](rD[ys(0x4fa)] * 0x3, rD[ys(0x4fa)] * 0x3),
          rE[ys(0x9fa)](),
          rE[ys(0x663)](0x0, 0x0, 0x14, 0x0, l0),
          (rE[ys(0xd2d)] = ys(0xc96)),
          rE[ys(0x5a4)](),
          nz(rE, 0.8),
          rE[ys(0x9fa)](),
          rE[ys(0x663)](0x0, 0x0, 0x14, 0x0, l0),
          (rE[ys(0xd2d)] = ys(0x8e4)),
          rE[ys(0x5a4)](),
          rE[ys(0x9fa)](),
          rE[ys(0xbd5)](0x0, 0x0),
          rE[ys(0x663)](0x0, 0x0, 0x10, 0x0, l0 * rD[ys(0x94)]),
          rE[ys(0x6e1)](0x0, 0x0),
          rE[ys(0xd02)](),
          nz(rE, 0.8)),
        rE[ys(0x242)]();
    }
    function lZ(rD, rE, rF = ![]) {
      const yt = us;
      if (rD[yt(0xa81)] <= 0x0) return;
      rE[yt(0x181)](),
        (rE[yt(0x915)] = rD[yt(0xa81)]),
        (rE[yt(0x44c)] = yt(0x133)),
        rE[yt(0x9fa)]();
      const rG = rF ? 0x8c : rD[yt(0x700)] ? 0x4b : 0x64,
        rH = rF ? 0x1a : 0x9;
      if (rF) rE[yt(0x609)](rD[yt(0xc80)] + 0x11, 0x0);
      else {
        const rJ = Math[yt(0x137)](0x1, rD[yt(0xc80)] / 0x64);
        rE[yt(0xd3b)](rJ, rJ),
          rE[yt(0x609)](-rG / 0x2, rD[yt(0xc80)] / rJ + 0x1b);
      }
      rE[yt(0x9fa)](),
        rE[yt(0xbd5)](rF ? -0x14 : 0x0, 0x0),
        rE[yt(0x6e1)](rG, 0x0),
        (rE[yt(0x3e3)] = yt(0xbb8)),
        (rE[yt(0x290)] = rH),
        (rE[yt(0x44c)] = yt(0x133)),
        rE[yt(0x2dc)]();
      function rI(rK) {
        const yu = yt;
        rE[yu(0x915)] = rK < 0.05 ? rK / 0.05 : 0x1;
      }
      rD[yt(0xab6)] > 0x0 &&
        (rI(rD[yt(0xab6)]),
        rE[yt(0x9fa)](),
        rE[yt(0xbd5)](0x0, 0x0),
        rE[yt(0x6e1)](rD[yt(0xab6)] * rG, 0x0),
        (rE[yt(0x290)] = rH * (rF ? 0.55 : 0.44)),
        (rE[yt(0x44c)] = yt(0x99a)),
        rE[yt(0x2dc)]());
      rD[yt(0xca2)] > 0x0 &&
        (rI(rD[yt(0xca2)]),
        rE[yt(0x9fa)](),
        rE[yt(0xbd5)](0x0, 0x0),
        rE[yt(0x6e1)](rD[yt(0xca2)] * rG, 0x0),
        (rE[yt(0x290)] = rH * (rF ? 0.7 : 0.66)),
        (rE[yt(0x44c)] = yt(0x7fa)),
        rE[yt(0x2dc)]());
      rD[yt(0x550)] &&
        (rI(rD[yt(0x550)]),
        rE[yt(0x9fa)](),
        rE[yt(0xbd5)](0x0, 0x0),
        rE[yt(0x6e1)](rD[yt(0x550)] * rG, 0x0),
        (rE[yt(0x290)] = rH * (rF ? 0.45 : 0.35)),
        (rE[yt(0x44c)] = yt(0x87f)),
        rE[yt(0x2dc)]());
      if (rD[yt(0x700)]) {
        rE[yt(0x915)] = 0x1;
        var hp = Math.round(rD.health * hack.hp);
        var shield = Math.round(rD.shield * hack.hp);
        const rK = pG(
          rE,
          `HP ${hp}${shield ? " + " + shield : ""} ` + yt(0x2ec) + (rD[yt(0x73b)] + 0x1),
          rF ? 0xc : 0xe,
          yt(0x155),
          0x3,
          !![]
        );
        if(rD.username == hack.player.name) hack.player.entity = rD;
        rE[yt(0x392)](
          rK,
          rG + rH / 0x2 - rK[yt(0xc90)],
          rH / 0x2,
          rK[yt(0xc90)],
          rK[yt(0x64d)]
        );
        if (rF) {
          const rL = pG(rE, "@" + rD[yt(0x8be)], 0xc, yt(0x9e3), 0x3, !![]);
          rE[yt(0x392)](
            rL,
            -rH / 0x2,
            -rH / 0x2 - rL[yt(0x64d)],
            rL[yt(0xc90)],
            rL[yt(0x64d)]
          );
        }
      } else {
        rE[yt(0x915)] = 0x1;
        const rM = kc[rD[yt(0xb8a)]],
          rN = pG(rE, rM, 0xe, yt(0x155), 0x3, !![], rD[yt(0x37d)]);
        rE[yt(0x181)](), rE[yt(0x609)](0x0, -rH / 0x2 - rN[yt(0x64d)]);
        rN[yt(0xc90)] > rG + rH
          ? rE[yt(0x392)](
              rN,
              rG / 0x2 - rN[yt(0xc90)] / 0x2,
              0x0,
              rN[yt(0xc90)],
              rN[yt(0x64d)]
            )
          : rE[yt(0x392)](rN, -rH / 0x2, 0x0, rN[yt(0xc90)], rN[yt(0x64d)]);
        rE[yt(0x242)]();
        const rO = pG(rE, rD[yt(0x37d)], 0xe, hP[rD[yt(0x37d)]], 0x3, !![]);
        rE[yt(0x392)](
          rO,
          rG + rH / 0x2 - rO[yt(0xc90)],
          rH / 0x2,
          rO[yt(0xc90)],
          rO[yt(0x64d)]
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
        rD[yt(0x9ca)] &&
        ((rE[yt(0x915)] = 0x1),
        rE[yt(0x609)](rG / 0x2, 0x0),
        pG(rE, rD[yt(0x9ca)], 0x11, yt(0x155), 0x3)),
        rE[yt(0x242)]();
    }
    function m0(rD) {
      const yv = us;
      for (let rE in oC) {
        oC[rE][yv(0x3bb)](rD);
      }
      oV();
    }
    var m1 = {},
      m2 = document[us(0x8c1)](us(0x942));
    mG(us(0x15e), us(0x67c), us(0x6d2)),
      mG(us(0x5a1), us(0x942), us(0x1aa)),
      mG(us(0x5ad), us(0xd65), us(0xcee), () => {
        const yw = us;
        (hv = ![]), (hD[yw(0xcee)] = fc);
      }),
      mG(us(0x53f), us(0xa27), us(0xb5b)),
      mG(us(0xdf), us(0x8d9), us(0x573)),
      mG(us(0x82d), us(0x671), us(0x734)),
      mG(us(0x2fd), us(0xaf0), us(0xa44)),
      mG(us(0x435), us(0x18b), us(0xb74)),
      mG(us(0x36b), us(0x6a5), us(0x701)),
      mG(us(0xa88), us(0x19a), "lb"),
      mG(us(0x51f), us(0x763), us(0x6b3)),
      mG(us(0x10f), us(0x148), us(0xd7c), () => {
        const yx = us;
        (mh[yx(0x6fc)][yx(0x9a7)] = yx(0x4eb)), (hD[yx(0xd7c)] = mg);
      }),
      mG(us(0x258), us(0xda3), us(0x6fa), () => {
        const yy = us;
        if (!hW) return;
        il(new Uint8Array([cI[yy(0x141)]]));
      });
    var m3 = document[us(0x8c1)](us(0x832)),
      m4 = ![],
      m5 = null,
      m6 = nN(us(0x588));
    setInterval(() => {
      m5 && m7();
    }, 0x3e8);
    function m7() {
      const yz = us;
      k8(m6, yz(0x52f) + ka(Date[yz(0x213)]() - m5[yz(0xcab)]) + yz(0x69a));
    }
    function m8(rD) {
      const yA = us;
      document[yA(0xc39)][yA(0x7d8)][yA(0xab7)](yA(0x9aa));
      const rE = nN(
        yA(0xbc3) +
          rD[yA(0xc3)] +
          yA(0x9f7) +
          rD[yA(0x751)] +
          yA(0x7d1) +
          (rD[yA(0x72e)]
            ? yA(0x263) +
              rD[yA(0x72e)] +
              "\x22\x20" +
              (rD[yA(0x98c)] ? yA(0x5fd) + rD[yA(0x98c)] + "\x22" : "") +
              yA(0xc37)
            : "") +
          yA(0xc6d)
      );
      (r1 = rE),
        (rE[yA(0x3bb)] = function () {
          const yB = yA;
          document[yB(0xc39)][yB(0x7d8)][yB(0x256)](yB(0x9aa)),
            rE[yB(0x256)](),
            (r1 = null);
        }),
        (rE[yA(0x8c1)](yA(0xb2c))[yA(0x21c)] = rE[yA(0x3bb)]);
      const rF = rE[yA(0x8c1)](yA(0x22b)),
        rG = 0xa;
      rH(0x0);
      if (rD[yA(0x4ab)][yA(0x680)] > rG) {
        const rI = nN(yA(0x7fe));
        rE[yA(0x188)](rI);
        const rJ = rI[yA(0x8c1)](yA(0x337)),
          rK = Math[yA(0x260)](rD[yA(0x4ab)][yA(0x680)] / rG);
        for (let rL = 0x0; rL < rK; rL++) {
          const rM = nN(yA(0x7c4) + rL + yA(0x2ed) + (rL + 0x1) + yA(0x815));
          rJ[yA(0x188)](rM);
        }
        rJ[yA(0x703)] = function () {
          const yC = yA;
          rH(this[yC(0x77e)]);
        };
      }
      function rH(rN = 0x0) {
        const yD = yA,
          rO = rN * rG,
          rP = Math[yD(0xd23)](rD[yD(0x4ab)][yD(0x680)], rO + rG);
        rF[yD(0x511)] = "";
        for (let rQ = rO; rQ < rP; rQ++) {
          const rR = rD[yD(0x4ab)][rQ];
          rF[yD(0x188)](rD[yD(0x80c)](rR, rQ));
          const rS = nN(yD(0xaf6));
          for (let rT = 0x0; rT < rR[yD(0xb47)][yD(0x680)]; rT++) {
            const [rU, rV] = rR[yD(0xb47)][rT],
              rW = dF[rU],
              rX = nN(
                yD(0x755) + rW[yD(0x3ac)] + "\x22\x20" + qx(rW) + yD(0xc37)
              );
            jY(rX);
            const rY = "x" + k9(rV),
              rZ = nN(yD(0x3a7) + rY + yD(0x57f));
            rY[yD(0x680)] > 0x6 && rZ[yD(0x7d8)][yD(0xab7)](yD(0x864)),
              rX[yD(0x188)](rZ),
              (rX[yD(0x6f7)] = rW),
              rS[yD(0x188)](rX);
          }
          rF[yD(0x188)](rS);
        }
      }
      kl[yA(0x188)](rE);
    }
    function m9(rD, rE = ![]) {
      const yE = us;
      let rF = [],
        rG = 0x0;
      for (const rI in rD) {
        const rJ = rD[rI];
        let rK = 0x0,
          rL = [];
        for (const rN in rJ) {
          const rO = rJ[rN];
          rL[yE(0x46a)]([rN, rO]), (rK += rO), (rG += rO);
        }
        rL = rL[yE(0xd6c)]((rP, rQ) => rQ[0x1] - rP[0x1]);
        const rM = {};
        (rM[yE(0x11d)] = rI),
          (rM[yE(0xb47)] = rL),
          (rM[yE(0x61b)] = rK),
          rF[yE(0x46a)](rM);
      }
      if (rE) rF = rF[yE(0xd6c)]((rP, rQ) => rQ[yE(0x61b)] - rP[yE(0x61b)]);
      const rH = {};
      return (rH[yE(0x61b)] = rG), (rH[yE(0x4ab)] = rF), rH;
    }
    function ma() {
      return mb(new Date());
    }
    function mb(rD) {
      const yF = us,
        rE = {};
      rE[yF(0x544)] = yF(0xca5);
      const rF = rD[yF(0x1f4)]("en", rE),
        rG = {};
      rG[yF(0x46e)] = yF(0x31c);
      const rH = rD[yF(0x1f4)]("en", rG),
        rI = {};
      rI[yF(0x979)] = yF(0xca5);
      const rJ = rD[yF(0x1f4)]("en", rI);
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
      const yG = us,
        rF = nN(
          yG(0x534) +
            (rE + 0x1) +
            yG(0x236) +
            rD[yG(0x11d)] +
            yG(0xc99) +
            k9(rD[yG(0x61b)]) +
            yG(0x239) +
            (rD[yG(0x61b)] == 0x1 ? "" : "s") +
            yG(0xa77)
        );
      return (
        (rF[yG(0x8c1)](yG(0x58a))[yG(0x21c)] = function () {
          const yH = yG;
          mv(rD[yH(0x11d)]);
        }),
        rF
      );
    }
    var me = {
      superPlayers: {
        title: us(0x1cd),
        parse(rD) {
          const yI = us,
            rE = m9(rD[yI(0xd13)], !![]);
          return {
            title: this[yI(0xc3)],
            titleColor: hP[yI(0x39f)],
            desc:
              ma() +
              yI(0x695) +
              k9(rE[yI(0x4ab)][yI(0x680)]) +
              yI(0x6f4) +
              k9(rE[yI(0x61b)]) +
              yI(0x788),
            getTitleEl: md,
            groups: rE[yI(0x4ab)],
          };
        },
      },
      hyperPlayers: {
        title: us(0x79f),
        parse(rD) {
          const yJ = us,
            rE = m9(rD[yJ(0x73a)], !![]);
          return {
            title: this[yJ(0xc3)],
            titleColor: hP[yJ(0x677)],
            desc:
              ma() +
              yJ(0x695) +
              k9(rE[yJ(0x4ab)][yJ(0x680)]) +
              yJ(0x6f4) +
              k9(rE[yJ(0x61b)]) +
              yJ(0x788),
            getTitleEl: md,
            groups: rE[yJ(0x4ab)],
          };
        },
      },
      petals: {
        title: us(0xc5b),
        parse(rD) {
          const yK = us,
            rE = m9(rD[yK(0xb47)], ![]),
            rF = rE[yK(0x4ab)][yK(0xd6c)](
              (rG, rH) => rH[yK(0x11d)] - rG[yK(0x11d)]
            );
          return {
            title: this[yK(0xc3)],
            titleColor: hP[yK(0xb4d)],
            desc: ma() + yK(0x695) + k9(rE[yK(0x61b)]) + yK(0x788),
            getTitleEl(rG, rH) {
              const yL = yK;
              return nN(
                yL(0x99) +
                  hN[rG[yL(0x11d)]] +
                  yL(0x695) +
                  k9(rG[yL(0x61b)]) +
                  yL(0xa79)
              );
            },
            groups: rF,
          };
        },
      },
    };
    function mf() {
      const yM = us;
      if (m4) return;
      if (m5 && Date[yM(0x213)]() - m5[yM(0xcab)] < 0x3c * 0xea60) return;
      (m4 = !![]),
        fetch((i8 ? yM(0x339) : yM(0x161)) + yM(0xa8d))
          [yM(0x5af)]((rD) => rD[yM(0xb1a)]())
          [yM(0x5af)]((rD) => {
            const yN = yM;
            (m4 = ![]), (m5 = rD), m7(), (m3[yN(0x511)] = "");
            for (const rE in me) {
              if (!(rE in rD)) continue;
              const rF = me[rE],
                rG = nN(yN(0x607) + rF[yN(0xc3)] + yN(0xc77));
              (rG[yN(0x21c)] = function () {
                const yO = yN;
                m8(rF[yO(0x681)](rD));
              }),
                m3[yN(0x188)](rG);
            }
            m3[yN(0x188)](m6);
          })
          [yM(0x1af)]((rD) => {
            const yP = yM;
            (m4 = ![]),
              hc(yP(0xb09)),
              console[yP(0x7d7)](yP(0x83e), rD),
              setTimeout(mf, 0x1388);
          });
    }
    mG(us(0xae7), us(0xaed), us(0xa5f), mf);
    var mg = 0xb,
      mh = document[us(0x8c1)](us(0xba9));
    hD[us(0xd7c)] == mg && (mh[us(0x6fc)][us(0x9a7)] = us(0x4eb));
    var mi = document[us(0x8c1)](us(0x1b0));
    mi[us(0x6fc)][us(0x9a7)] = us(0x4eb);
    var mj = document[us(0x8c1)](us(0x270)),
      mk = document[us(0x8c1)](us(0x36e)),
      ml = document[us(0x8c1)](us(0xd2a));
    ml[us(0x21c)] = function () {
      const yQ = us;
      mi[yQ(0x6fc)][yQ(0x9a7)] = yQ(0x4eb);
    };
    var mm = ![];
    mk[us(0x21c)] = nt(function (rD) {
      const yR = us;
      if (!hW || mm || jy) return;
      const rE = mj[yR(0x77e)][yR(0xad8)]();
      if (!rE || !eV(rE)) {
        mj[yR(0x7d8)][yR(0x256)](yR(0xc71)),
          void mj[yR(0xaa6)],
          mj[yR(0x7d8)][yR(0xab7)](yR(0xc71));
        return;
      }
      (mi[yR(0x6fc)][yR(0x9a7)] = ""),
        (mi[yR(0x511)] = yR(0xfd)),
        il(
          new Uint8Array([cI[yR(0x954)], ...new TextEncoder()[yR(0x92b)](rE)])
        ),
        (mm = !![]);
    });
    function mn(rD, rE) {
      const yS = us;
      if (rD === yS(0x847)) {
        const rF = {};
        (rF[yS(0x979)] = yS(0xca5)),
          (rF[yS(0x544)] = yS(0xbf7)),
          (rF[yS(0x46e)] = yS(0xbf7)),
          (rE = new Date(
            rE === 0x0 ? Date[yS(0x213)]() : rE * 0x3e8 * 0x3c * 0x3c
          )[yS(0x1f4)]("en", rF));
      } else
        rD === yS(0xb15) || rD === yS(0x71d)
          ? (rE = ka(rE * 0x3e8 * 0x3c, !![]))
          : (rE = k9(rE));
      return rE;
    }
    var mo = f2(),
      mp = {},
      mq = document[us(0x8c1)](us(0x559));
    mq[us(0x511)] = "";
    for (let rD in mo) {
      const rE = mr(rD);
      rE[us(0x280)](0x0), mq[us(0x188)](rE), (mp[rD] = rE);
    }
    function mr(rF) {
      const yT = us,
        rG = nN(yT(0xd9c) + kd(rF) + yT(0x5ef)),
        rH = rG[yT(0x8c1)](yT(0x192));
      return (
        (rG[yT(0x280)] = function (rI) {
          k8(rH, mn(rF, rI));
        }),
        rG
      );
    }
    var ms;
    function mt(rF, rG, rH, rI, rJ, rK, rL) {
      const yU = us;
      ms && (ms[yU(0x6dc)](), (ms = null));
      const rM = rK[yU(0x680)] / 0x2,
        rN = yU(0x6df)[yU(0xb8f)](rM),
        rO = nN(
          yU(0x97b) +
            rF +
            yU(0x6f) +
            rN +
            yU(0x545) +
            rN +
            yU(0x1a0) +
            yU(0x466)[yU(0xb8f)](eL * dH) +
            yU(0xbe0) +
            (rH[yU(0x680)] === 0x0 ? yU(0x7a) : "") +
            yU(0x33e)
        );
      rL && rO[yU(0x188)](nN(yU(0xc6e)));
      ms = rO;
      const rP = rO[yU(0x8c1)](yU(0xb00)),
        rQ = rO[yU(0x8c1)](yU(0x493));
      for (let s2 = 0x0; s2 < rK[yU(0x680)]; s2++) {
        const s3 = rK[s2];
        if (!s3) continue;
        const s4 = oc(s3);
        s4[yU(0x7d8)][yU(0x256)](yU(0x8ce)),
          (s4[yU(0xd39)] = !![]),
          s4[yU(0xd69)][yU(0x256)](),
          (s4[yU(0xd69)] = null),
          s2 < rM
            ? rP[yU(0x70b)][s2][yU(0x188)](s4)
            : rQ[yU(0x70b)][s2 - rM][yU(0x188)](s4);
      }
      (rO[yU(0x6dc)] = function () {
        const yV = yU;
        (rO[yV(0x6fc)][yV(0x4bd)] = yV(0x8a8)),
          (rO[yV(0x6fc)][yV(0x9a7)] = yV(0x4eb)),
          void rO[yV(0xaa6)],
          (rO[yV(0x6fc)][yV(0x9a7)] = ""),
          setTimeout(function () {
            const yW = yV;
            rO[yW(0x256)]();
          }, 0x3e8);
      }),
        (rO[yU(0x8c1)](yU(0xb2c))[yU(0x21c)] = function () {
          const yX = yU;
          rO[yX(0x6dc)]();
        });
      const rR = d4(rJ),
        rS = rR[0x0],
        rT = rR[0x1],
        rU = d2(rS + 0x1),
        rV = rJ - rT,
        rW = rO[yU(0x8c1)](yU(0x94e));
      k8(
        rW,
        yU(0x9b) + (rS + 0x1) + yU(0xb48) + iJ(rV) + "/" + iJ(rU) + yU(0xae0)
      );
      const rX = Math[yU(0xd23)](0x1, rV / rU),
        rY = rO[yU(0x8c1)](yU(0x2bb));
      rY[yU(0x6fc)][yU(0x977)] = rX * 0x64 + "%";
      const rZ = rO[yU(0x8c1)](yU(0x559));
      for (let s5 in mo) {
        const s6 = mr(s5);
        s6[yU(0x280)](rG[s5]), rZ[yU(0x188)](s6);
      }
      const s0 = rO[yU(0x8c1)](yU(0x727));
      rH[yU(0xd6c)]((s7, s8) => ob(s7[0x0], s8[0x0]));
      for (let s7 = 0x0; s7 < rH[yU(0x680)]; s7++) {
        const [s8, s9] = rH[s7],
          sa = oc(s8);
        jY(sa),
          sa[yU(0x7d8)][yU(0x256)](yU(0x8ce)),
          (sa[yU(0xd39)] = !![]),
          p2(sa[yU(0xd69)], s9),
          s0[yU(0x188)](sa);
      }
      if (rH[yU(0x680)] > 0x0) {
        const sb = nN(yU(0xd3c)),
          sc = {};
        for (let sd = 0x0; sd < rH[yU(0x680)]; sd++) {
          const [se, sf] = rH[sd];
          sc[se[yU(0x3ac)]] = (sc[se[yU(0x3ac)]] || 0x0) + sf;
        }
        oB(sb, sc), rO[yU(0x8c1)](yU(0x671))[yU(0x188)](sb);
      }
      const s1 = rO[yU(0x8c1)](yU(0x7c5));
      for (let sg = 0x0; sg < rI[yU(0x680)]; sg++) {
        const sh = rI[sg],
          si = nS(sh, !![]);
        si[yU(0x7d8)][yU(0x256)](yU(0x8ce)), (si[yU(0xd39)] = !![]);
        const sj = s1[yU(0x70b)][sh[yU(0x1ce)] * dH + sh[yU(0x3ac)]];
        s1[yU(0x30f)](si, sj), sj[yU(0x256)]();
      }
      rO[yU(0x7d8)][yU(0xab7)](yU(0x4e0)),
        setTimeout(function () {
          const yY = yU;
          rO[yY(0x7d8)][yY(0x256)](yY(0x4e0));
        }, 0x0),
        kl[yU(0x188)](rO);
    }
    var mu = document[us(0x8c1)](us(0x89f));
    document[us(0x8c1)](us(0x208))[us(0x21c)] = nt(function (rF) {
      const yZ = us,
        rG = mu[yZ(0x77e)][yZ(0xad8)]();
      ns(rG);
    });
    function mv(rF) {
      const z0 = us,
        rG = new Uint8Array([
          cI[z0(0xa65)],
          ...new TextEncoder()[z0(0x92b)](rF),
        ]);
      il(rG);
    }
    var mw = document[us(0x8c1)](us(0x18b)),
      mz = document[us(0x8c1)](us(0x19a)),
      mA = mz[us(0x8c1)](us(0x22b)),
      mB = 0x0,
      mC = 0x0;
    setInterval(function () {
      const z1 = us;
      hW &&
        (pM - mC > 0x7530 &&
          mw[z1(0x7d8)][z1(0x7a1)](z1(0x254)) &&
          (il(new Uint8Array([cI[z1(0xc0f)]])), (mC = pM)),
        pM - mB > 0xea60 &&
          mz[z1(0x7d8)][z1(0x7a1)](z1(0x254)) &&
          (il(new Uint8Array([cI[z1(0xa5)]])), (mB = pM)));
    }, 0x3e8);
    var mD = ![];
    function mE(rF) {
      const z2 = us;
      for (let rG in m1) {
        if (rF === rG) continue;
        m1[rG][z2(0x6dc)]();
      }
      mD = ![];
    }
    window[us(0x21c)] = function (rF) {
      const z3 = us;
      if ([kk, kn, ki][z3(0x669)](rF[z3(0x2e9)])) mE();
    };
    function mF() {
      const z4 = us;
      iy && !p8[z4(0x7b4)] && im(0x0, 0x0);
    }
    function mG(rF, rG, rH, rI) {
      const z5 = us,
        rJ = document[z5(0x8c1)](rG),
        rK = rJ[z5(0x8c1)](z5(0x22b)),
        rL = document[z5(0x8c1)](rF);
      let rM = null,
        rN = rJ[z5(0x8c1)](z5(0x3e6));
      rN &&
        (rN[z5(0x21c)] = function () {
          const z6 = z5;
          rJ[z6(0x7d8)][z6(0x691)](z6(0x26a));
        });
      (rK[z5(0x6fc)][z5(0x9a7)] = z5(0x4eb)),
        rJ[z5(0x7d8)][z5(0x256)](z5(0x254)),
        (rL[z5(0x21c)] = function () {
          const z7 = z5;
          rO[z7(0x691)]();
        }),
        (rJ[z5(0x8c1)](z5(0xb2c))[z5(0x21c)] = function () {
          mE();
        });
      const rO = [rL, rJ];
      (rO[z5(0x6dc)] = function () {
        const z8 = z5;
        rL[z8(0x7d8)][z8(0x256)](z8(0xb21)),
          rJ[z8(0x7d8)][z8(0x256)](z8(0x254)),
          !rM &&
            (rM = setTimeout(function () {
              const z9 = z8;
              (rK[z9(0x6fc)][z9(0x9a7)] = z9(0x4eb)), (rM = null);
            }, 0x3e8));
      }),
        (rO[z5(0x691)] = function () {
          const za = z5;
          mE(rH),
            rJ[za(0x7d8)][za(0x7a1)](za(0x254))
              ? rO[za(0x6dc)]()
              : rO[za(0x254)]();
        }),
        (rO[z5(0x254)] = function () {
          const zb = z5;
          rI && rI(),
            clearTimeout(rM),
            (rM = null),
            (rK[zb(0x6fc)][zb(0x9a7)] = ""),
            rL[zb(0x7d8)][zb(0xab7)](zb(0xb21)),
            rJ[zb(0x7d8)][zb(0xab7)](zb(0x254)),
            (mD = !![]),
            mF();
        }),
        (m1[rH] = rO);
    }
    var mH = [],
      mI,
      mJ = 0x0,
      mK = ![],
      mL = document[us(0x8c1)](us(0x82d)),
      mM = {
        tagName: us(0x41c),
        getBoundingClientRect() {
          const zc = us,
            rF = mL[zc(0xbe9)](),
            rG = {};
          return (
            (rG["x"] = rF["x"] + rF[zc(0x977)] / 0x2),
            (rG["y"] = rF["y"] + rF[zc(0x4c9)] / 0x2),
            rG
          );
        },
        appendChild(rF) {
          const zd = us;
          rF[zd(0x256)]();
        },
      };
    function mN(rF) {
      const ze = us;
      if (!hW) return;
      const rG = rF[ze(0x2e9)];
      if (rG[ze(0xd47)]) mI = n7(rG, rF);
      else {
        if (rG[ze(0x537)]) {
          mE();
          const rH = rG[ze(0xbc9)]();
          (rH[ze(0x6f7)] = rG[ze(0x6f7)]),
            nM(rH, rG[ze(0x6f7)]),
            (rH[ze(0x4f3)] = 0x1),
            (rH[ze(0x537)] = !![]),
            (rH[ze(0x28b)] = mM),
            rH[ze(0x7d8)][ze(0xab7)](ze(0xc30));
          const rI = rG[ze(0xbe9)]();
          (rH[ze(0x6fc)][ze(0x6ec)] = rI["x"] / kR + "px"),
            (rH[ze(0x6fc)][ze(0x209)] = rI["y"] / kR + "px"),
            kH[ze(0x188)](rH),
            (mI = n7(rH, rF)),
            (mJ = 0x0),
            (mD = !![]);
        } else return ![];
      }
      return (mJ = Date[ze(0x213)]()), (mK = !![]), !![];
    }
    function mO(rF) {
      const zf = us;
      for (let rG = 0x0; rG < rF[zf(0x70b)][zf(0x680)]; rG++) {
        const rH = rF[zf(0x70b)][rG];
        if (rH[zf(0x7d8)][zf(0x7a1)](zf(0x6f7)) && !n6(rH)) return rH;
      }
    }
    function mP() {
      const zg = us;
      if (mI) {
        if (mK && Date[zg(0x213)]() - mJ < 0x1f4) {
          if (mI[zg(0xd47)]) {
            const rF = mI[zg(0x526)][zg(0x8b)];
            mI[zg(0x713)](
              rF >= iN ? nx[zg(0x70b)][rF - iN + 0x1] : ny[zg(0x70b)][rF]
            );
          } else {
            if (mI[zg(0x537)]) {
              let rG = mO(nx) || mO(ny);
              rG && mI[zg(0x713)](rG);
            }
          }
        }
        mI[zg(0x277)]();
        if (mI[zg(0x537)]) {
          (mI[zg(0x537)] = ![]),
            (mI[zg(0xd47)] = !![]),
            m1[zg(0x734)][zg(0x254)]();
          if (mI[zg(0x28b)] !== mM) {
            const rH = mI[zg(0x565)];
            rH
              ? ((mI[zg(0xc72)] = rH[zg(0xc72)]), n3(rH[zg(0x6f7)]["id"], 0x1))
              : (mI[zg(0xc72)] = iR[zg(0x450)]());
            (iQ[mI[zg(0xc72)]] = mI), n3(mI[zg(0x6f7)]["id"], -0x1);
            const rI = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rI[zg(0x518)](0x0, cI[zg(0x9ad)]),
              rI[zg(0x873)](0x1, mI[zg(0x6f7)]["id"]),
              rI[zg(0x518)](0x3, mI[zg(0x28b)][zg(0x8b)]),
              il(rI);
          }
        } else
          mI[zg(0x28b)] === mM
            ? (iR[zg(0x46a)](mI[zg(0xc72)]),
              n3(mI[zg(0x6f7)]["id"], 0x1),
              il(new Uint8Array([cI[zg(0x96f)], mI[zg(0x526)][zg(0x8b)]])))
            : n5(mI[zg(0x526)][zg(0x8b)], mI[zg(0x28b)][zg(0x8b)]);
        mI = null;
      }
    }
    function mQ(rF) {
      const zh = us;
      mI && (mI[zh(0xa55)](rF), (mK = ![]));
    }
    var mR = document[us(0x8c1)](us(0x3fd));
    function mS() {
      const zi = us;
      mR[zi(0x6fc)][zi(0x9a7)] = zi(0x4eb);
      const rF = mR[zi(0x8c1)](zi(0x797));
      let rG,
        rH,
        rI = null;
      (mR[zi(0xa16)] = function (rK) {
        const zj = zi;
        rI === null &&
          ((rF[zj(0x6fc)][zj(0x977)] = rF[zj(0x6fc)][zj(0xc74)] = "0"),
          (mR[zj(0x6fc)][zj(0x9a7)] = ""),
          ([rG, rH] = mT(rK)),
          rJ(),
          (rI = rK[zj(0xd03)]));
      }),
        (mR[zi(0x824)] = function (rK) {
          const zk = zi;
          if (rK[zk(0xd03)] === rI) {
            const [rL, rM] = mT(rK),
              rN = rL - rG,
              rO = rM - rH,
              rP = mR[zk(0xbe9)]();
            let rQ = Math[zk(0xd2c)](rN, rO);
            const rR = rP[zk(0x977)] / 0x2 / kR;
            rQ > rR && (rQ = rR);
            const rS = Math[zk(0x178)](rO, rN);
            return (
              (rF[zk(0x6fc)][zk(0xc74)] = zk(0x685) + rS + zk(0x5e1)),
              (rF[zk(0x6fc)][zk(0x977)] = rQ + "px"),
              im(rS, rQ / rR),
              !![]
            );
          }
        }),
        (mR[zi(0x5ae)] = function (rK) {
          const zl = zi;
          rK[zl(0xd03)] === rI &&
            ((mR[zl(0x6fc)][zl(0x9a7)] = zl(0x4eb)), (rI = null), im(0x0, 0x0));
        });
      function rJ() {
        const zm = zi;
        (mR[zm(0x6fc)][zm(0x6ec)] = rG + "px"),
          (mR[zm(0x6fc)][zm(0x209)] = rH + "px");
      }
    }
    mS();
    function mT(rF) {
      const zn = us;
      return [rF[zn(0x2a2)] / kR, rF[zn(0x32e)] / kR];
    }
    var mU = document[us(0x8c1)](us(0xaeb)),
      mV = document[us(0x8c1)](us(0x2f1)),
      mW = document[us(0x8c1)](us(0x52c)),
      mX = {},
      mY = {};
    if (kL) {
      document[us(0xc39)][us(0x7d8)][us(0xab7)](us(0x9c9)),
        (window[us(0x9e5)] = function (rG) {
          const zo = us;
          for (let rH = 0x0; rH < rG[zo(0x436)][zo(0x680)]; rH++) {
            const rI = rG[zo(0x436)][rH],
              rJ = rI[zo(0x2e9)];
            if (rJ === ki) {
              mR[zo(0xa16)](rI);
              continue;
            } else {
              if (rJ === mV)
                pn(zo(0xd89), !![]),
                  (mX[rI[zo(0xd03)]] = function () {
                    const zp = zo;
                    pn(zp(0xd89), ![]);
                  });
              else {
                if (rJ === mU)
                  pn(zo(0x6bc), !![]),
                    (mX[rI[zo(0xd03)]] = function () {
                      const zq = zo;
                      pn(zq(0x6bc), ![]);
                    });
                else
                  rJ === mW &&
                    (pn(zo(0xb0e), !![]),
                    (mX[rI[zo(0xd03)]] = function () {
                      const zr = zo;
                      pn(zr(0xb0e), ![]);
                    }));
              }
            }
            if (mI) continue;
            if (rJ[zo(0x6f7)]) {
              const rK = n1(rJ);
              mN(rI),
                mI && (mY[rI[zo(0xd03)]] = mQ),
                (mX[rI[zo(0xd03)]] = function () {
                  const zs = zo;
                  mI && mP(), (rK[zs(0xbc)] = ![]);
                });
            }
          }
        });
      const rF = {};
      (rF[us(0x923)] = ![]),
        document[us(0x6b5)](
          us(0x4c3),
          function (rG) {
            const zt = us;
            for (let rH = 0x0; rH < rG[zt(0x436)][zt(0x680)]; rH++) {
              const rI = rG[zt(0x436)][rH];
              mR[zt(0x824)](rI) && rG[zt(0xc9a)]();
              if (mY[rI[zt(0xd03)]]) mY[rI[zt(0xd03)]](rI), rG[zt(0xc9a)]();
              else mI && rG[zt(0xc9a)]();
            }
          },
          rF
        ),
        (window[us(0x3b3)] = function (rG) {
          const zu = us;
          for (let rH = 0x0; rH < rG[zu(0x436)][zu(0x680)]; rH++) {
            const rI = rG[zu(0x436)][rH];
            mR[zu(0x5ae)](rI),
              mX[rI[zu(0xd03)]] &&
                (mX[rI[zu(0xd03)]](),
                delete mX[rI[zu(0xd03)]],
                delete mY[rI[zu(0xd03)]]);
          }
        });
    } else {
      document[us(0xc39)][us(0x7d8)][us(0xab7)](us(0x4b8));
      let rG = ![];
      (window[us(0x885)] = function (rH) {
        const zv = us;
        rH[zv(0x40d)] === 0x0 && ((rG = !![]), mN(rH));
      }),
        (document[us(0xaea)] = function (rH) {
          const zw = us;
          mQ(rH);
          const rI = rH[zw(0x2e9)];
          if (rI[zw(0x6f7)] && !rG) {
            const rJ = n1(rI);
            rI[zw(0x87)] = rI[zw(0x885)] = function () {
              const zx = zw;
              rJ[zx(0xbc)] = ![];
            };
          }
        }),
        (document[us(0x6ae)] = function (rH) {
          const zy = us;
          rH[zy(0x40d)] === 0x0 && ((rG = ![]), mP());
        }),
        (km[us(0xaea)] = ki[us(0xaea)] =
          function (rH) {
            const zz = us;
            (nb = rH[zz(0x2a2)] - kU() / 0x2),
              (nc = rH[zz(0x32e)] - kV() / 0x2);
            if (!p8[zz(0x7b4)] && iy && !mD) {
              const rI = Math[zz(0xd2c)](nb, nc),
                rJ = Math[zz(0x178)](nc, nb);
              im(rJ, rI < 0x32 ? rI / 0x64 : 0x1);
            }
          });
    }
    function mZ(rH, rI, rJ) {
      const zA = us;
      return Math[zA(0x137)](rI, Math[zA(0xd23)](rH, rJ));
    }
    var n0 = [];
    function n1(rH) {
      const zB = us;
      let rI = n0[zB(0x1c6)]((rJ) => rJ["el"] === rH);
      if (rI) return (rI[zB(0xbc)] = !![]), rI;
      (rI =
        typeof rH[zB(0x6f7)] === zB(0x9af)
          ? rH[zB(0x6f7)]()
          : nH(rH[zB(0x6f7)], rH[zB(0x377)])),
        (rI[zB(0xbc)] = !![]),
        (rI[zB(0xcfb)] = 0x0),
        (rI[zB(0x6fc)][zB(0xccc)] = zB(0x231)),
        (rI[zB(0x6fc)][zB(0xc74)] = zB(0x4eb)),
        kH[zB(0x188)](rI);
      if (kL)
        (rI[zB(0x6fc)][zB(0x503)] = zB(0xa7)),
          (rI[zB(0x6fc)][zB(0x209)] = zB(0xa7)),
          (rI[zB(0x6fc)][zB(0x929)] = zB(0x266)),
          (rI[zB(0x6fc)][zB(0x6ec)] = zB(0x266));
      else {
        const rJ = rH[zB(0xbe9)](),
          rK = rI[zB(0xbe9)]();
        (rI[zB(0x6fc)][zB(0x209)] =
          mZ(
            rH[zB(0x643)]
              ? (rJ[zB(0x209)] + rJ[zB(0x4c9)]) / kR + 0xa
              : (rJ[zB(0x209)] - rK[zB(0x4c9)]) / kR - 0xa,
            0xa,
            window[zB(0x349)] / kR - 0xa
          ) + "px"),
          (rI[zB(0x6fc)][zB(0x6ec)] =
            mZ(
              (rJ[zB(0x6ec)] + rJ[zB(0x977)] / 0x2 - rK[zB(0x977)] / 0x2) / kR,
              0xa,
              window[zB(0x96e)] / kR - 0xa - rK[zB(0x977)] / kR
            ) + "px"),
          (rI[zB(0x6fc)][zB(0x929)] = zB(0x266)),
          (rI[zB(0x6fc)][zB(0x503)] = zB(0x266));
      }
      return (
        (rI[zB(0x6fc)][zB(0x9df)] = zB(0x4eb)),
        (rI[zB(0x6fc)][zB(0x6c7)] = 0x0),
        (rI["el"] = rH),
        n0[zB(0x46a)](rI),
        rI
      );
    }
    var n2 = document[us(0x8c1)](us(0x625));
    function n3(rH, rI = 0x1) {
      const zC = us;
      !iS[rH] && ((iS[rH] = 0x0), p7(rH), o9()),
        (iS[rH] += rI),
        o7[rH][zC(0xb4c)](iS[rH]),
        iS[rH] <= 0x0 && (delete iS[rH], o7[rH][zC(0x3bb)](), o9()),
        n4();
    }
    function n4() {
      const zD = us;
      n2[zD(0x511)] = "";
      Object[zD(0x24a)](iS)[zD(0x680)] === 0x0
        ? (n2[zD(0x6fc)][zD(0x9a7)] = zD(0x4eb))
        : (n2[zD(0x6fc)][zD(0x9a7)] = "");
      const rH = {};
      for (const rI in iS) {
        const rJ = dC[rI],
          rK = iS[rI];
        rH[rJ[zD(0x3ac)]] = (rH[rJ[zD(0x3ac)]] || 0x0) + rK;
      }
      oB(n2, rH);
      for (const rL in on) {
        const rM = on[rL];
        rM[zD(0x7d8)][rH[rL] ? zD(0x256) : zD(0xab7)](zD(0x332));
      }
    }
    function n5(rH, rI) {
      const zE = us;
      if (rH === rI) return;
      il(new Uint8Array([cI[zE(0xf5)], rH, rI]));
    }
    function n6(rH) {
      const zF = us;
      return rH[zF(0x698)] || rH[zF(0x8c1)](zF(0x7a2));
    }
    function n7(rH, rI, rJ = !![]) {
      const zG = us,
        rK = mH[zG(0x1c6)]((rU) => rU === rH);
      if (rK) return rK[zG(0x4fd)](rI), rK;
      let rL,
        rM,
        rN,
        rO,
        rP = 0x0,
        rQ = 0x0,
        rR = 0x0,
        rS;
      (rH[zG(0x4fd)] = function (rU, rV) {
        const zH = zG;
        (rS = rH[zH(0x28b)] || rH[zH(0x8c8)]),
          (rS[zH(0x698)] = rH),
          (rH[zH(0x526)] = rS),
          (rH[zH(0x9d1)] = ![]),
          (rH[zH(0x9c0)] = ![]);
        const rW = rH[zH(0xbe9)]();
        rU[zH(0x58b)] === void 0x0
          ? ((rP = rU[zH(0x2a2)] - rW["x"]),
            (rQ = rU[zH(0x32e)] - rW["y"]),
            rH[zH(0xa55)](rU),
            (rL = rN),
            (rM = rO))
          : ((rL = rW["x"]),
            (rM = rW["y"]),
            rH[zH(0x713)](rU),
            rH[zH(0x277)](rV)),
          rT();
      }),
        (rH[zG(0x277)] = function (rU = !![]) {
          const zI = zG;
          rH[zI(0x9c0)] = !![];
          rS[zI(0x698)] === rH && (rS[zI(0x698)] = null);
          if (!rH[zI(0x28b)])
            rH[zI(0x713)](rS),
              Math[zI(0xd2c)](rN - rL, rO - rM) > 0x32 * kR &&
                rH[zI(0x713)](mM);
          else {
            if (rU) {
              const rV = n6(rH[zI(0x28b)]);
              (rH[zI(0x565)] = rV), rV && n7(rV, rS, ![]);
            }
          }
          rH[zI(0x28b)] !== rS && (rH[zI(0x4f3)] = 0x0),
            (rH[zI(0x28b)][zI(0x698)] = rH);
        }),
        (rH[zG(0x713)] = function (rU) {
          const zJ = zG;
          rH[zJ(0x28b)] = rU;
          const rV = rU[zJ(0xbe9)]();
          (rN = rV["x"]),
            (rO = rV["y"]),
            (rH[zJ(0x6fc)][zJ(0xa9e)] =
              rU === mM ? zJ(0x705) : getComputedStyle(rU)[zJ(0xa9e)]);
        }),
        (rH[zG(0xa55)] = function (rU) {
          const zK = zG;
          (rN = rU[zK(0x2a2)] - rP),
            (rO = rU[zK(0x32e)] - rQ),
            (rH[zK(0x28b)] = null);
          let rV = Infinity,
            rW = null;
          const rX = ko[zK(0x6da)](zK(0xba2));
          for (let rY = 0x0; rY < rX[zK(0x680)]; rY++) {
            const rZ = rX[rY],
              s0 = rZ[zK(0xbe9)](),
              s1 = Math[zK(0xd2c)](
                s0["x"] + s0[zK(0x977)] / 0x2 - rU[zK(0x2a2)],
                s0["y"] + s0[zK(0x4c9)] / 0x2 - rU[zK(0x32e)]
              );
            s1 < 0x1e * kR && s1 < rV && ((rW = rZ), (rV = s1));
          }
          rW && rW !== rS && rH[zK(0x713)](rW);
        }),
        rH[zG(0x4fd)](rI, rJ),
        rH[zG(0x7d8)][zG(0xab7)](zG(0xc30)),
        kH[zG(0x188)](rH);
      function rT() {
        const zL = zG;
        (rH[zL(0x6fc)][zL(0x6ec)] = rL / kR + "px"),
          (rH[zL(0x6fc)][zL(0x209)] = rM / kR + "px");
      }
      return (
        (rH[zG(0x467)] = function () {
          const zM = zG;
          rH[zM(0x28b)] && rH[zM(0x713)](rH[zM(0x28b)]);
        }),
        (rH[zG(0xb50)] = function () {
          const zN = zG;
          (rL = pt(rL, rN, 0x64)), (rM = pt(rM, rO, 0x64)), rT();
          let rU = 0x0,
            rV = Infinity;
          rH[zN(0x28b)]
            ? ((rV = Math[zN(0xd2c)](rN - rL, rO - rM)),
              (rU = rV > 0x5 ? 0x1 : 0x0))
            : (rU = 0x1),
            (rR = pt(rR, rU, 0x64)),
            (rH[zN(0x6fc)][zN(0xc74)] =
              zN(0xe6) +
              (0x1 + 0.3 * rR) +
              zN(0x420) +
              rR * Math[zN(0x6ad)](Date[zN(0x213)]() / 0x96) * 0xa +
              zN(0xa00)),
            rH[zN(0x9c0)] &&
              rR < 0.05 &&
              rV < 0x5 &&
              (rH[zN(0x7d8)][zN(0x256)](zN(0xc30)),
              (rH[zN(0x6fc)][zN(0x6ec)] =
                rH[zN(0x6fc)][zN(0x209)] =
                rH[zN(0x6fc)][zN(0xc74)] =
                rH[zN(0x6fc)][zN(0xa9e)] =
                rH[zN(0x6fc)][zN(0x922)] =
                  ""),
              (rH[zN(0x9d1)] = !![]),
              rH[zN(0x28b)][zN(0x188)](rH),
              (rH[zN(0x28b)][zN(0x698)] = null),
              (rH[zN(0x28b)] = null));
        }),
        mH[zG(0x46a)](rH),
        rH
      );
    }
    var n8 = cY[us(0x2ee)];
    document[us(0x86e)] = function () {
      return ![];
    };
    var n9 = 0x0,
      na = 0x0,
      nb = 0x0,
      nc = 0x0,
      nd = 0x1,
      ne = 0x1;
    document[us(0x48e)] = function (rH) {
      const zO = us;
      rH[zO(0x2e9)] === ki &&
        ((nd *= rH[zO(0x26b)] < 0x0 ? 1.1 : 0.9),
        (nd = Math[zO(0xd23)](0x3, Math[zO(0x137)](0x1, nd))));
    };
    const nf = {};
    (nf[us(0x44e)] = us(0xb75)),
      (nf["me"] = us(0xd5f)),
      (nf[us(0x7d7)] = us(0x171));
    var ng = nf,
      nh = {};
    function ni(rH, rI) {
      nj(rH, null, null, null, jx(rI));
    }
    function nj(rH, rI, rJ, rK = ng[us(0x44e)], rL) {
      const zP = us,
        rM = nN(zP(0xb9f));
      if (!rL) {
        if (rI) {
          const rO = nN(zP(0x5ce));
          k8(rO, rI + ":"), rM[zP(0x188)](rO);
        }
        const rN = nN(zP(0x438));
        k8(rN, rJ),
          rM[zP(0x188)](rN),
          (rM[zP(0x70b)][0x0][zP(0x6fc)][zP(0x451)] = rK),
          rI && rM[zP(0xccf)](nN(zP(0xca8)));
      } else rM[zP(0x511)] = rL;
      pg[zP(0x188)](rM);
      while (pg[zP(0x70b)][zP(0x680)] > 0x3c) {
        pg[zP(0x70b)][0x0][zP(0x256)]();
      }
      return (
        (pg[zP(0x7d5)] = pg[zP(0x287)]),
        (rM[zP(0x5f0)] = rJ),
        (rM[zP(0x5c9)] = rK),
        nk(rH, rM),
        rM
      );
    }
    function nk(rH, rI) {
      const zQ = us;
      (rI["t"] = 0x0), (rI[zQ(0xd79)] = 0x0);
      if (!nh[rH]) nh[rH] = [];
      nh[rH][zQ(0x46a)](rI);
    }
    var nl = {};
    ki[us(0x885)] = window[us(0x6ae)] = nt(function (rH) {
      const zR = us,
        rI = zR(0xa36) + rH[zR(0x40d)];
      pn(rI, rH[zR(0xb8a)] === zR(0x296));
    });
    var nm = 0x0;
    function nn(rH) {
      const zS = us,
        rI = 0x200,
        rJ = rI / 0x64,
        rK = document[zS(0xa1f)](zS(0x2fe));
      rK[zS(0x977)] = rK[zS(0x4c9)] = rI;
      const rL = rK[zS(0xcc)]("2d");
      rL[zS(0x609)](rI / 0x2, rI / 0x2), rL[zS(0x477)](rJ), rH[zS(0x461)](rL);
      const rM = (rH[zS(0xd57)] ? zS(0xa71) : zS(0x728)) + rH[zS(0x456)];
      no(rK, rM);
    }
    function no(rH, rI) {
      const zT = us,
        rJ = document[zT(0xa1f)]("a");
      (rJ[zT(0x9d4)] = rI),
        (rJ[zT(0x2dd)] = typeof rH === zT(0x719) ? rH : rH[zT(0x3ab)]()),
        rJ[zT(0x784)](),
        hK(rI + zT(0x224), hP[zT(0xb4d)]);
    }
    var np = 0x0;
    setInterval(function () {
      np = 0x0;
    }, 0x1770),
      setInterval(function () {
        const zU = us;
        nu[zU(0x680)] = 0x0;
      }, 0x2710);
    var nq = ![],
      nr = ![];
    function ns(rH) {
      const zV = us;
      rH = rH[zV(0xad8)]();
      if (!rH) hK(zV(0x7e7)), hc(zV(0x7e7));
      else
        rH[zV(0x680)] < cN || rH[zV(0x680)] > cM
          ? (hK(zV(0xd84)), hc(zV(0xd84)))
          : (hK(zV(0x7f6) + rH + zV(0xe9), hP[zV(0xa26)]),
            hc(zV(0x7f6) + rH + zV(0xe9)),
            mv(rH));
    }
    document[us(0x23e)] = document[us(0x5d1)] = nt(function (rH) {
      const zW = us;
      rH[zW(0xd44)] && rH[zW(0xc9a)]();
      (nq = rH[zW(0xd44)]), (nr = rH[zW(0x7e2)]);
      if (rH[zW(0x4ff)] === 0x9) {
        rH[zW(0xc9a)]();
        return;
      }
      if (document[zW(0x971)] && document[zW(0x971)][zW(0x58b)] === zW(0xbcd)) {
        if (rH[zW(0xb8a)] === zW(0x75b) && rH[zW(0x4ff)] === 0xd) {
          if (document[zW(0x971)] === hF) hG[zW(0x784)]();
          else {
            if (document[zW(0x971)] === pf) {
              let rI = pf[zW(0x77e)][zW(0xad8)]()[zW(0x761)](0x0, cL);
              if (rI && hW) {
                if (pM - nm > 0x3e8) {
                  const rJ = rI[zW(0x7cc)](zW(0x44d));
                  if (rJ || rI[zW(0x7cc)](zW(0x19d))) {
                    const rK = rI[zW(0x761)](rJ ? 0x7 : 0x9);
                    if (!rK) hK(zW(0xc27));
                    else {
                      if (rJ) {
                        const rL = eM[rK];
                        !rL ? hK(zW(0xc88) + rK + "!") : nn(rL);
                      } else {
                        const rM = dF[rK];
                        !rM ? hK(zW(0x574) + rK + "!") : nn(rM);
                      }
                    }
                  } else {
                    if (rI[zW(0x7cc)](zW(0x684))) no(qu, zW(0x856));
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
                      if (rI[zW(0x7cc)](zW(0xa69))) {
                        const rN = rI[zW(0x761)](0x9);
                        ns(rN);
                      } else {
                        hack.speak = (txt) => {
                        let rO = 0x0;
                        for (let rP = 0x0; rP < nu[zW(0x680)]; rP++) {
                          nv(txt, nu[rP]) > 0.95 && rO++;
                        }
                        rO >= 0x3 && (np += 0xa);
                        np++;
                        if (np > 0x3) hK(zW(0x1a3)), (nm = pM + 0xea60);
                        else {
                          nu[zW(0x46a)](txt);
                          if (nu[zW(0x680)] > 0xa) nu[zW(0x43f)]();
                          (txt = decodeURIComponent(
                            encodeURIComponent(txt)
                              [zW(0xce2)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                              [zW(0xce2)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                          )),
                            il(
                              new Uint8Array([
                                cI[zW(0x60b)],
                                ...new TextEncoder()[zW(0x92b)](txt),
                              ])
                            ),
                            (nm = pM);
                        }
                      }};
                      hack.speak(inputChat);
                    }
                  }
                } else nj(-0x1, null, zW(0x5d8), ng[zW(0x7d7)]);
              }
              (pf[zW(0x77e)] = ""), pf[zW(0x7b)]();
            }
          }
        }
        return;
      }
      pn(rH[zW(0x638)], rH[zW(0xb8a)] === zW(0x371));
    });
    function nt(rH) {
      return function (rI) {
        const zX = b;
        rI instanceof Event && rI[zX(0xc24)] && !rI[zX(0xb8f)] && rH(rI);
      };
    }
    var nu = [];
    function nv(rH, rI) {
      const zY = us;
      var rJ = rH,
        rK = rI;
      rH[zY(0x680)] < rI[zY(0x680)] && ((rJ = rI), (rK = rH));
      var rL = rJ[zY(0x680)];
      if (rL == 0x0) return 0x1;
      return (rL - nw(rJ, rK)) / parseFloat(rL);
    }
    function nw(rH, rI) {
      const zZ = us;
      (rH = rH[zZ(0x731)]()), (rI = rI[zZ(0x731)]());
      var rJ = new Array();
      for (var rK = 0x0; rK <= rH[zZ(0x680)]; rK++) {
        var rL = rK;
        for (var rM = 0x0; rM <= rI[zZ(0x680)]; rM++) {
          if (rK == 0x0) rJ[rM] = rM;
          else {
            if (rM > 0x0) {
              var rN = rJ[rM - 0x1];
              if (rH[zZ(0x75e)](rK - 0x1) != rI[zZ(0x75e)](rM - 0x1))
                rN = Math[zZ(0xd23)](Math[zZ(0xd23)](rN, rL), rJ[rM]) + 0x1;
              (rJ[rM - 0x1] = rL), (rL = rN);
            }
          }
        }
        if (rK > 0x0) rJ[rI[zZ(0x680)]] = rL;
      }
      return rJ[rI[zZ(0x680)]];
    }
    var nx = document[us(0x8c1)](us(0xb00)),
      ny = document[us(0x8c1)](us(0x493));
    function nz(rH, rI = 0x1) {
      const A0 = us;
      rH[A0(0x181)](),
        rH[A0(0xd3b)](0.25 * rI, 0.25 * rI),
        rH[A0(0x609)](-0x4b, -0x4b),
        rH[A0(0x9fa)](),
        rH[A0(0xbd5)](0x4b, 0x28),
        rH[A0(0x1db)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        rH[A0(0x1db)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        rH[A0(0x1db)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        rH[A0(0x1db)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        rH[A0(0x1db)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        rH[A0(0x1db)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (rH[A0(0xd2d)] = A0(0xb7e)),
        rH[A0(0x5a4)](),
        (rH[A0(0x8f6)] = rH[A0(0x3e3)] = A0(0xbb8)),
        (rH[A0(0x44c)] = A0(0x197)),
        (rH[A0(0x290)] = 0xc),
        rH[A0(0x2dc)](),
        rH[A0(0x242)]();
    }
    for (let rH = 0x0; rH < dC[us(0x680)]; rH++) {
      const rI = dC[rH];
      if (rI[us(0x757)] !== void 0x0)
        switch (rI[us(0x757)]) {
          case df[us(0x69f)]:
            rI[us(0x461)] = function (rJ) {
              const A1 = us;
              rJ[A1(0xd3b)](2.5, 2.5), lO(rJ);
            };
            break;
          case df[us(0x600)]:
            rI[us(0x461)] = function (rJ) {
              const A2 = us;
              rJ[A2(0x477)](0.9);
              const rK = pS();
              (rK[A2(0x845)] = !![]), rK[A2(0xa46)](rJ);
            };
            break;
          case df[us(0x6db)]:
            rI[us(0x461)] = function (rJ) {
              const A3 = us;
              rJ[A3(0xd4b)](-Math["PI"] / 0x2),
                rJ[A3(0x609)](-0x30, 0x0),
                pR[A3(0xabb)](rJ, ![]);
            };
            break;
          case df[us(0x3ee)]:
            rI[us(0x461)] = function (rJ) {
              const A4 = us;
              rJ[A4(0xd4b)](Math["PI"] / 0xa),
                rJ[A4(0x609)](0x3, 0x15),
                lP(rJ, !![]);
            };
            break;
          case df[us(0x838)]:
            rI[us(0x461)] = function (rJ) {
              nz(rJ);
            };
            break;
          case df[us(0x27f)]:
            rI[us(0x461)] = function (rJ) {
              const A5 = us;
              rJ[A5(0x609)](0x0, 0x3),
                rJ[A5(0xd4b)](-Math["PI"] / 0x4),
                rJ[A5(0x477)](0.4),
                pR[A5(0x49d)](rJ),
                rJ[A5(0x9fa)](),
                rJ[A5(0x663)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rJ[A5(0x290)] = 0x8),
                (rJ[A5(0x44c)] = A5(0xc96)),
                rJ[A5(0x2dc)]();
            };
            break;
          case df[us(0x388)]:
            rI[us(0x461)] = function (rJ) {
              const A6 = us;
              rJ[A6(0x609)](0x0, 0x7),
                rJ[A6(0x477)](0.8),
                pR[A6(0x97)](rJ, 0.5);
            };
            break;
          case df[us(0xcf8)]:
            rI[us(0x461)] = function (rJ) {
              const A7 = us;
              rJ[A7(0x477)](1.3), lS(rJ);
            };
            break;
          default:
            rI[us(0x461)] = function (rJ) {};
        }
      else {
        const rJ = new lG(
          -0x1,
          rI[us(0xb8a)],
          0x0,
          0x0,
          rI[us(0x6d0)],
          rI[us(0xaaa)] ? 0x10 : rI[us(0xc80)] * 1.1,
          0x0
        );
        (rJ[us(0x7b8)] = !![]),
          rI[us(0xd76)] === 0x1
            ? (rI[us(0x461)] = function (rK) {
                const A8 = us;
                rJ[A8(0xa46)](rK);
              })
            : (rI[us(0x461)] = function (rK) {
                const A9 = us;
                for (let rL = 0x0; rL < rI[A9(0xd76)]; rL++) {
                  rK[A9(0x181)]();
                  const rM = (rL / rI[A9(0xd76)]) * Math["PI"] * 0x2;
                  rI[A9(0x3bd)]
                    ? rK[A9(0x609)](...le(rI[A9(0xadd)], 0x0, rM))
                    : (rK[A9(0xd4b)](rM), rK[A9(0x609)](rI[A9(0xadd)], 0x0)),
                    rK[A9(0xd4b)](rI[A9(0x13f)]),
                    rJ[A9(0xa46)](rK),
                    rK[A9(0x242)]();
                }
              });
      }
    }
    const nA = {};
    (nA[us(0xda6)] = us(0x6f6)),
      (nA[us(0x412)] = us(0x106)),
      (nA[us(0x441)] = us(0x3d8)),
      (nA[us(0x1f6)] = us(0xd8)),
      (nA[us(0x993)] = us(0xb89)),
      (nA[us(0x577)] = us(0x650)),
      (nA[us(0x4cc)] = us(0x232));
    var nB = nA;
    function nC() {
      const Aa = us,
        rK = document[Aa(0x8c1)](Aa(0xbcf));
      let rL = Aa(0x725);
      for (let rM = 0x0; rM < 0xc8; rM++) {
        const rN = d6(rM),
          rO = 0xc8 * rN,
          rP = 0x19 * rN,
          rQ = d5(rM);
        rL +=
          Aa(0xa09) +
          (rM + 0x1) +
          Aa(0xc9d) +
          k9(Math[Aa(0xbb8)](rO)) +
          Aa(0xc9d) +
          k9(Math[Aa(0xbb8)](rP)) +
          Aa(0xc9d) +
          rQ +
          Aa(0x4ba);
      }
      (rL += Aa(0xb69)), (rL += Aa(0x52d)), (rK[Aa(0x511)] = rL);
    }
    nC();
    function nD(rK, rL) {
      const Ab = us,
        rM = eM[rK],
        rN = rM[Ab(0x456)],
        rO = rM[Ab(0x3ac)];
      return (
        "x" +
        rL[Ab(0xd76)] * rL[Ab(0x336)] +
        ("\x20" + rN + Ab(0x936) + hQ[rO] + Ab(0x7e5) + hN[rO] + ")")
      );
    }
    function nE(rK) {
      const Ac = us;
      return rK[Ac(0x303)](0x2)[Ac(0xce2)](/\.?0+$/, "");
    }
    var nF = [
        [us(0x4f8), us(0x1a7), nB[us(0xda6)]],
        [us(0xca2), us(0x5fe), nB[us(0x412)]],
        [us(0x99e), us(0xbb6), nB[us(0x441)]],
        [us(0x579), us(0x3c0), nB[us(0x1f6)]],
        [us(0x143), us(0x127), nB[us(0x577)]],
        [us(0x85f), us(0x9cf), nB[us(0x993)]],
        [us(0x275), us(0x50d), nB[us(0x4cc)]],
        [us(0x780), us(0x940), nB[us(0x4cc)], (rK) => "+" + k9(rK)],
        [us(0xc38), us(0xc59), nB[us(0x4cc)], (rK) => "+" + k9(rK)],
        [us(0xcef), us(0x98a), nB[us(0x4cc)]],
        [
          us(0xb28),
          us(0x88d),
          nB[us(0x4cc)],
          (rK) => Math[us(0xbb8)](rK * 0x64) + "%",
        ],
        [us(0x6e9), us(0x19c), nB[us(0x4cc)], (rK) => "+" + nE(rK) + us(0x77f)],
        [us(0x17d), us(0xcf6), nB[us(0x441)], (rK) => k9(rK) + "/s"],
        [us(0xaac), us(0xcf6), nB[us(0x441)], (rK) => k9(rK) + us(0x7e8)],
        [
          us(0xaa7),
          us(0x77b),
          nB[us(0x4cc)],
          (rK) => (rK > 0x0 ? "+" : "") + rK,
        ],
        [us(0xa35), us(0x472), nB[us(0x993)], (rK) => "+" + rK + "%"],
        [
          us(0x136),
          us(0x16c),
          nB[us(0x993)],
          (rK) => "+" + parseInt(rK * 0x64) + "%",
        ],
        [us(0x517), us(0xce0), nB[us(0x4cc)], (rK) => "-" + rK + "%"],
        [us(0xb27), us(0x189), nB[us(0x4cc)], nD],
        [us(0x54c), us(0xb82), nB[us(0x993)], (rK) => rK / 0x3e8 + "s"],
        [us(0x59b), us(0xb25), nB[us(0x993)], (rK) => rK + "s"],
        [us(0x550), us(0xbf4), nB[us(0x993)], (rK) => k9(rK) + us(0x172)],
        [us(0x9fe), us(0x906), nB[us(0x993)], (rK) => rK + "s"],
        [us(0xa3e), us(0x500), nB[us(0x993)], (rK) => rK / 0x3e8 + "s"],
        [us(0x13c), us(0x7f4), nB[us(0x993)]],
        [us(0x4f9), us(0x1c0), nB[us(0x993)]],
        [us(0xd5b), us(0x6d1), nB[us(0x993)], (rK) => rK + us(0x3b9)],
        [us(0xd08), us(0x59a), nB[us(0x993)], (rK) => rK + us(0x3b9)],
        [us(0x95d), us(0x455), nB[us(0x993)]],
        [us(0x42e), us(0xb88), nB[us(0x4cc)]],
        [us(0x406), us(0x81e), nB[us(0x993)], (rK) => rK / 0x3e8 + "s"],
        [us(0xa40), us(0x5df), nB[us(0x441)], (rK) => k9(rK) + "/s"],
        [us(0xd88), us(0x35b), nB[us(0x993)]],
        [us(0x45a), us(0xafd), nB[us(0x4cc)]],
        [
          us(0xa1b),
          us(0x1b3),
          nB[us(0x993)],
          (rK, rL) => nE(rK * rL[us(0xc80)]),
        ],
        [us(0xf0), us(0x21b), nB[us(0x993)]],
        [us(0x8e1), us(0xa59), nB[us(0x4cc)]],
        [us(0x51b), us(0xbbd), nB[us(0x993)]],
        [us(0xbf), us(0x2bf), nB[us(0x993)]],
        [us(0x90a), us(0xd1d), nB[us(0x993)]],
        [us(0x6c), us(0x3e1), nB[us(0x993)], (rK) => "+" + nE(rK * 0x64) + "%"],
        [us(0x397), us(0x67b), nB[us(0x577)]],
        [us(0xa62), us(0xa66), nB[us(0x993)]],
        [us(0x32f), us(0xb55), nB[us(0x441)]],
        [us(0x117), us(0xb25), nB[us(0x993)], (rK) => rK + "s"],
        [us(0xa23), us(0x276), nB[us(0x993)]],
        [us(0x1ae), us(0x22c), nB[us(0x4cc)], (rK) => rK / 0x3e8 + "s"],
      ],
      nG = [
        [us(0x18d), us(0x77c), nB[us(0x993)]],
        [us(0x107), us(0x74c), nB[us(0x4cc)], (rK) => k9(rK * 0x64) + "%"],
        [us(0x39c), us(0x8ad), nB[us(0x4cc)]],
        [us(0x480), us(0x796), nB[us(0x993)]],
        [us(0x934), us(0x9b4), nB[us(0x4cc)]],
        [us(0xa35), us(0x472), nB[us(0x993)], (rK) => "+" + rK + "%"],
        [us(0xa32), us(0x4f0), nB[us(0x993)], (rK) => k9(rK) + "/s"],
        [us(0x8d4), us(0x78), nB[us(0xda6)], (rK) => rK * 0x64 + us(0xa9)],
        [us(0xb78), us(0xb9e), nB[us(0x993)], (rK) => rK + "s"],
        [
          us(0x918),
          us(0xb4),
          nB[us(0x4cc)],
          (rK) => "-" + parseInt((0x1 - rK) * 0x64) + "%",
        ],
      ];
    function nH(rK, rL = !![]) {
      const Ad = us;
      let rM = "",
        rN = "",
        rO;
      rK[Ad(0x757)] === void 0x0
        ? ((rO = nF),
          rK[Ad(0x36d)] &&
            (rN =
              Ad(0xc12) +
              (rK[Ad(0x36d)] / 0x3e8 +
                "s" +
                (rK[Ad(0x525)] > 0x0
                  ? Ad(0xcfa) + rK[Ad(0x525)] / 0x3e8 + "s"
                  : "")) +
              Ad(0xc0d)))
        : (rO = nG);
      for (let rQ = 0x0; rQ < rO[Ad(0x680)]; rQ++) {
        const [rR, rS, rT, rU] = rO[rQ],
          rV = rK[rR];
        rV &&
          rV !== 0x0 &&
          (rM +=
            Ad(0xa30) +
            rT +
            Ad(0x507) +
            rS +
            Ad(0xda5) +
            (rU ? rU(rV, rK) : k9(rV)) +
            Ad(0x36f));
      }
      const rP = nN(
        Ad(0x49c) +
          rK[Ad(0x456)] +
          Ad(0x717) +
          hN[rK[Ad(0x3ac)]] +
          Ad(0x9f7) +
          hQ[rK[Ad(0x3ac)]] +
          Ad(0x72b) +
          rN +
          Ad(0x994) +
          rK[Ad(0x72e)] +
          Ad(0x72b) +
          rM +
          Ad(0xd82)
      );
      if (rK[Ad(0xb39)] && rL) {
        rP[Ad(0x2da)][Ad(0x6fc)][Ad(0x9ce)] = Ad(0xa7);
        for (let rW = 0x0; rW < rK[Ad(0xb39)][Ad(0x680)]; rW++) {
          const [rX, rY] = rK[Ad(0xb39)][rW],
            rZ = nN(Ad(0x119));
          rP[Ad(0x188)](rZ);
          const s0 = f5[rY][rK[Ad(0x3ac)]];
          for (let s1 = 0x0; s1 < s0[Ad(0x680)]; s1++) {
            const [s2, s3] = s0[s1],
              s4 = eW(rX, s3),
              s5 = nN(
                Ad(0xaf2) +
                  s4[Ad(0x3ac)] +
                  "\x22\x20" +
                  qx(s4) +
                  Ad(0x93b) +
                  s2 +
                  Ad(0xdd)
              );
            rZ[Ad(0x188)](s5);
          }
        }
      }
      return rP;
    }
    function nI() {
      const Ae = us;
      mI && (mI[Ae(0x256)](), (mI = null));
      const rK = ko[Ae(0x6da)](Ae(0x7a2));
      for (let rL = 0x0; rL < rK[Ae(0x680)]; rL++) {
        const rM = rK[rL];
        rM[Ae(0x256)]();
      }
      for (let rN = 0x0; rN < iO; rN++) {
        const rO = nN(Ae(0x6df));
        rO[Ae(0x8b)] = rN;
        const rP = iP[rN];
        if (rP) {
          const rQ = nN(
            Ae(0x755) + rP[Ae(0x3ac)] + "\x22\x20" + qx(rP) + Ae(0xc37)
          );
          (rQ[Ae(0x6f7)] = rP),
            (rQ[Ae(0xd47)] = !![]),
            (rQ[Ae(0xc72)] = iR[Ae(0x450)]()),
            nM(rQ, rP),
            rO[Ae(0x188)](rQ),
            (iQ[rQ[Ae(0xc72)]] = rQ);
        }
        rN >= iN
          ? (rO[Ae(0x188)](nN(Ae(0x449) + ((rN - iN + 0x1) % 0xa) + Ae(0x1bf))),
            ny[Ae(0x188)](rO))
          : nx[Ae(0x188)](rO);
      }
    }
    function nJ(rK) {
      const Af = us;
      return rK < 0.5
        ? 0x4 * rK * rK * rK
        : 0x1 - Math[Af(0x45f)](-0x2 * rK + 0x2, 0x3) / 0x2;
    }
    var nK = [];
    function nL(rK, rL) {
      const Ag = us;
      (rK[Ag(0x4f3)] = 0x0), (rK[Ag(0x3fb)] = 0x1);
      let rM = 0x1,
        rN = 0x0,
        rO = -0x1;
      rK[Ag(0x7d8)][Ag(0xab7)](Ag(0x487)), rK[Ag(0xc86)](Ag(0x6fc), "");
      const rP = nN(Ag(0x378));
      rK[Ag(0x188)](rP), nK[Ag(0x46a)](rP);
      const rQ = qp;
      rP[Ag(0x977)] = rP[Ag(0x4c9)] = rQ;
      const rR = rP[Ag(0xcc)]("2d");
      (rP[Ag(0x238)] = function () {
        const Ah = Ag;
        rR[Ah(0x2d0)](0x0, 0x0, rQ, rQ);
        rN < 0.99 &&
          ((rR[Ah(0x915)] = 0x1 - rN),
          (rR[Ah(0xd2d)] = Ah(0xc62)),
          rR[Ah(0x24f)](0x0, 0x0, rQ, (0x1 - rM) * rQ));
        if (rN < 0.01) return;
        (rR[Ah(0x915)] = rN),
          rR[Ah(0x181)](),
          rR[Ah(0x477)](rQ / 0x64),
          rR[Ah(0x609)](0x32, 0x2d);
        let rS = rK[Ah(0x4f3)];
        rS = nJ(rS);
        const rT = Math["PI"] * 0x2 * rS;
        rR[Ah(0xd4b)](rT * 0x4),
          rR[Ah(0x9fa)](),
          rR[Ah(0xbd5)](0x0, 0x0),
          rR[Ah(0x663)](0x0, 0x0, 0x64, 0x0, rT),
          rR[Ah(0xbd5)](0x0, 0x0),
          rR[Ah(0x663)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rR[Ah(0xd2d)] = Ah(0x2a5)),
          rR[Ah(0x5a4)](Ah(0xa33)),
          rR[Ah(0x242)]();
      }),
        (rP[Ag(0xb50)] = function () {
          const Ai = Ag;
          rK[Ai(0x4f3)] += pN / (rL[Ai(0x36d)] + 0xc8);
          let rS = 0x1,
            rT = rK[Ai(0x3fb)];
          rK[Ai(0x4f3)] >= 0x1 && (rS = 0x0);
          const rU = rK[Ai(0x28b)] || rK[Ai(0x8c8)];
          ((rU && rU[Ai(0x8c8)] === ny) || !iy) && ((rT = 0x1), (rS = 0x0));
          (rN = pt(rN, rS, 0x64)), (rM = pt(rM, rT, 0x64));
          const rV = Math[Ai(0xbb8)]((0x1 - rM) * 0x64),
            rW = Math[Ai(0xbb8)](rN * 0x64) / 0x64;
          rW == 0x0 && rV <= 0x0
            ? ((rP[Ai(0xb1)] = ![]), (rP[Ai(0x6fc)][Ai(0x9a7)] = Ai(0x4eb)))
            : ((rP[Ai(0xb1)] = !![]), (rP[Ai(0x6fc)][Ai(0x9a7)] = "")),
            (rO = rV);
        }),
        rK[Ag(0x188)](nN(Ag(0x74b) + qx(rL) + Ag(0xc37)));
    }
    function nM(rK, rL, rM = !![]) {
      const Aj = us;
      rM && rL[Aj(0x757)] === void 0x0 && nL(rK, rL);
    }
    function nN(rK) {
      const Ak = us;
      return (hB[Ak(0x511)] = rK), hB[Ak(0x70b)][0x0];
    }
    var nO = document[us(0x8c1)](us(0x7c5)),
      nP = [];
    function nQ() {
      const Al = us;
      (nO[Al(0x511)] = Al(0x466)[Al(0xb8f)](eL * dH)),
        (nP = Array[Al(0xb26)](nO[Al(0x70b)]));
    }
    nQ();
    var nR = {};
    for (let rK = 0x0; rK < eK[us(0x680)]; rK++) {
      const rL = eK[rK];
      !nR[rL[us(0xb8a)]] &&
        ((nR[rL[us(0xb8a)]] = new lG(
          -0x1,
          rL[us(0xb8a)],
          0x0,
          0x0,
          rL[us(0xbdb)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          rL[us(0x25e)],
          0x1
        )),
        (nR[rL[us(0xb8a)]][us(0x7b8)] = !![]));
      const rM = nR[rL[us(0xb8a)]];
      let rN = null;
      rL[us(0x770)] !== void 0x0 &&
        (rN = new lG(-0x1, rL[us(0x770)], 0x0, 0x0, 0x0, rL[us(0x25e)], 0x1)),
        (rL[us(0x461)] = function (rO) {
          const Am = us;
          rO[Am(0xd3b)](0.5, 0.5),
            rM[Am(0xa46)](rO),
            rN &&
              (rO[Am(0xd4b)](rM[Am(0x640)]),
              rO[Am(0x609)](-rL[Am(0x25e)] * 0x2, 0x0),
              rN[Am(0xa46)](rO));
        });
    }
    function nS(rO, rP = ![]) {
      const An = us,
        rQ = nN(An(0x755) + rO[An(0x3ac)] + "\x22\x20" + qx(rO) + An(0xc37));
      jY(rQ), (rQ[An(0x6f7)] = rO);
      if (rP) return rQ;
      const rR = dH * rO[An(0x1ce)] + rO[An(0x3ac)],
        rS = nP[rR];
      return nO[An(0x30f)](rQ, rS), rS[An(0x256)](), (nP[rR] = rQ), rQ;
    }
    var nT = document[us(0x8c1)](us(0x7aa)),
      nU = document[us(0x8c1)](us(0x4cb)),
      nV = document[us(0x8c1)](us(0xca7)),
      nW = document[us(0x8c1)](us(0x55a)),
      nX = document[us(0x8c1)](us(0x83b)),
      nY = nX[us(0x8c1)](us(0x2bb)),
      nZ = nX[us(0x8c1)](us(0x2e8)),
      o0 = document[us(0x8c1)](us(0xd7e)),
      o1 = document[us(0x8c1)](us(0x94e)),
      o2 = ![],
      o3 = 0x0,
      o4 = ![];
    (nU[us(0x21c)] = function () {
      (o2 = !![]), (o3 = 0x0), (o4 = ![]);
    }),
      (nW[us(0x21c)] = function () {
        const Ao = us;
        if (this[Ao(0x7d8)][Ao(0x7a1)](Ao(0x1ac)) || jy) return;
        kI(Ao(0x8f3), (rO) => {
          rO && ((o2 = !![]), (o3 = 0x0), (o4 = !![]));
        });
      }),
      (nT[us(0x511)] = us(0x466)[us(0xb8f)](dG * dH));
    var o5 = Array[us(0xb26)](nT[us(0x70b)]),
      o6 = document[us(0x8c1)](us(0x3ba)),
      o7 = {};
    function o8() {
      const Ap = us;
      for (let rO in o7) {
        o7[rO][Ap(0x3bb)]();
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
      const Aq = us,
        rP = Array[Aq(0xb26)](rO[Aq(0x6da)](Aq(0x7a2)));
      rP[Aq(0xd6c)]((rQ, rR) => {
        const Ar = Aq,
          rS = rR[Ar(0x6f7)][Ar(0x3ac)] - rQ[Ar(0x6f7)][Ar(0x3ac)];
        return rS === 0x0 ? rR[Ar(0x6f7)]["id"] - rQ[Ar(0x6f7)]["id"] : rS;
      });
      for (let rQ = 0x0; rQ < rP[Aq(0x680)]; rQ++) {
        const rR = rP[rQ];
        rO[Aq(0x188)](rR);
      }
    }
    function ob(rO, rP) {
      const As = us,
        rQ = rP[As(0x3ac)] - rO[As(0x3ac)];
      return rQ === 0x0 ? rP["id"] - rO["id"] : rQ;
    }
    function oc(rO, rP = !![]) {
      const At = us,
        rQ = nN(At(0xbfc) + rO[At(0x3ac)] + "\x22\x20" + qx(rO) + At(0x49e));
      setTimeout(function () {
        const Au = At;
        rQ[Au(0x7d8)][Au(0x256)](Au(0x8ce));
      }, 0x1f4),
        (rQ[At(0x6f7)] = rO);
      if (rP) {
      }
      return (rQ[At(0xd69)] = rQ[At(0x8c1)](At(0xc56))), rQ;
    }
    var od = nN(us(0x7c3)),
      oe = od[us(0x8c1)](us(0x1b5)),
      of = od[us(0x8c1)](us(0x4c5)),
      og = od[us(0x8c1)](us(0x5f7)),
      oh = [];
    for (let rO = 0x0; rO < 0x5; rO++) {
      const rP = nN(us(0x466));
      (rP[us(0x423)] = function (rQ = 0x0) {
        const Av = us,
          rR =
            (rO / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rQ * Math["PI"] * 0x6,
          rS =
            0x32 +
            (rQ > 0x0
              ? Math[Av(0xb59)](Math[Av(0x6ad)](rQ * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[Av(0x6fc)][Av(0x6ec)] = Math[Av(0x802)](rR) * rS + 0x32 + "%"),
          (this[Av(0x6fc)][Av(0x209)] = Math[Av(0x6ad)](rR) * rS + 0x32 + "%");
      }),
        rP[us(0x423)](),
        (rP[us(0xd76)] = 0x0),
        (rP["el"] = null),
        (rP[us(0x4fd)] = function () {
          const Aw = us;
          (rP[Aw(0xd76)] = 0x0), (rP["el"] = null), (rP[Aw(0x511)] = "");
        }),
        (rP[us(0xce3)] = function (rQ) {
          const Ax = us;
          if (!rP["el"]) {
            const rR = oc(oW, ![]);
            (rR[Ax(0x21c)] = function () {
              if (oY || p0) return;
              p4(null);
            }),
              rP[Ax(0x188)](rR),
              (rP["el"] = rR);
          }
          (rP[Ax(0xd76)] += rQ), p2(rP["el"][Ax(0xd69)], rP[Ax(0xd76)]);
        }),
        oe[us(0x188)](rP),
        oh[us(0x46a)](rP);
    }
    var oi,
      oj = document[us(0x8c1)](us(0xaf0)),
      ok = document[us(0x8c1)](us(0x948)),
      ol = document[us(0x8c1)](us(0xbc7)),
      om = document[us(0x8c1)](us(0x628)),
      on = {};
    function oo() {
      const Ay = us,
        rQ = document[Ay(0x8c1)](Ay(0x644));
      for (let rR = 0x0; rR < dH; rR++) {
        const rS = nN(Ay(0x6aa) + rR + Ay(0x4c6));
        (rS[Ay(0x21c)] = function () {
          const Az = Ay;
          let rT = pm;
          pm = !![];
          for (const rU in o7) {
            const rV = dC[rU];
            if (rV[Az(0x3ac)] !== rR) continue;
            const rW = o7[rU];
            rW[Az(0x314)][Az(0x784)]();
          }
          pm = rT;
        }),
          (on[rR] = rS),
          rQ[Ay(0x188)](rS);
      }
    }
    oo();
    var op = ![],
      oq = document[us(0x8c1)](us(0xd5c));
    oq[us(0x21c)] = function () {
      const AA = us;
      document[AA(0xc39)][AA(0x7d8)][AA(0x691)](AA(0xa22)),
        (op = document[AA(0xc39)][AA(0x7d8)][AA(0x7a1)](AA(0xa22)));
      const rQ = op ? AA(0x176) : AA(0x3d7);
      k8(ok, rQ),
        k8(om, rQ),
        op
          ? (oj[AA(0x188)](od), od[AA(0x188)](nT), ol[AA(0x256)]())
          : (oj[AA(0x188)](ol),
            ol[AA(0x30f)](nT, ol[AA(0x2da)]),
            od[AA(0x256)]());
    };
    var or = document[us(0x8c1)](us(0x395)),
      os = ov(us(0x940), nB[us(0x412)]),
      ot = ov(us(0xb68), nB[us(0xda6)]),
      ou = ov(us(0x56b), nB[us(0x577)]);
    function ov(rQ, rR) {
      const AB = us,
        rS = nN(AB(0x779) + rR + AB(0x3e2) + rQ + AB(0x433));
      return (
        (rS[AB(0x280)] = function (rT) {
          const AC = AB;
          k8(rS[AC(0x70b)][0x1], k9(Math[AC(0xbb8)](rT)));
        }),
        or[AB(0x188)](rS),
        rS
      );
    }
    var ow = document[us(0x8c1)](us(0x7be)),
      ox = document[us(0x8c1)](us(0xc22));
    ox[us(0x511)] = "";
    var oy = document[us(0x8c1)](us(0x1f8)),
      oz = {};
    function oA() {
      const AD = us;
      (ox[AD(0x511)] = ""), (oy[AD(0x511)] = "");
      const rQ = {},
        rR = [];
      for (let rS in oz) {
        const rT = dC[rS],
          rU = oz[rS];
        (rQ[rT[AD(0x3ac)]] = (rQ[rT[AD(0x3ac)]] || 0x0) + rU),
          rR[AD(0x46a)]([rT, rU]);
      }
      if (rR[AD(0x680)] === 0x0) {
        ow[AD(0x6fc)][AD(0x9a7)] = AD(0x4eb);
        return;
      }
      (ow[AD(0x6fc)][AD(0x9a7)] = ""),
        rR[AD(0xd6c)]((rV, rW) => {
          return ob(rV[0x0], rW[0x0]);
        })[AD(0x78e)](([rV, rW]) => {
          const AE = AD,
            rX = oc(rV);
          jY(rX), p2(rX[AE(0xd69)], rW), ox[AE(0x188)](rX);
        }),
        oB(oy, rQ);
    }
    function oB(rQ, rR) {
      const AF = us;
      let rS = 0x0;
      for (let rT in d9) {
        const rU = rR[d9[rT]];
        if (rU !== void 0x0) {
          rS++;
          const rV = nN(
            AF(0x99) + k9(rU) + "\x20" + rT + AF(0x9f7) + hP[rT] + AF(0x57f)
          );
          rQ[AF(0xccf)](rV);
        }
      }
      rS % 0x2 === 0x1 &&
        (rQ[AF(0x70b)][0x0][AF(0x6fc)][AF(0x9f6)] = AF(0xb66));
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
      const AG = us,
        rQ = d4(oD);
      (oE = rQ[0x0]),
        (oF = rQ[0x1]),
        (oH = d2(oE + 0x1)),
        (oG = oD - oF),
        k8(
          o1,
          !hack.isEnabled('betterXP') ? AG(0x9b) + (oE + 0x1) + AG(0xb48) + iJ(oG) + "/" + iJ(oH) + AG(0xae0) : AG(0x9b) + (oE + 0x1) + AG(0xb48) + oG + "/" + oH + AG(0xae0)
        );
      const rR = d6(oE);
      os[AG(0x280)](0xc8 * rR),
        ot[AG(0x280)](0x19 * rR),
        ou[AG(0x280)](d5(oE)),
        hack.hp = 0xc8 * rR,
        (oJ = Math[AG(0xd23)](0x1, oG / oH)),
        (oL = 0x0),
        (nW[AG(0x8c1)](AG(0xa64))[AG(0x511)] =
          oE >= cH ? AG(0x766) : AG(0x73) + (cH + 0x1) + AG(0xb17));
    }
    var oO = 0x0,
      oP = document[us(0x8c1)](us(0xbaf));
    for (let rQ = 0x0; rQ < cZ[us(0x680)]; rQ++) {
      const [rR, rS] = cZ[rQ],
        rT = j7[rR],
        rU = nN(
          us(0x65a) +
            hP[rT] +
            us(0xe1) +
            rT +
            us(0xa61) +
            (rS + 0x1) +
            us(0x309)
        );
      (rU[us(0x21c)] = function () {
        const AH = us;
        if (oE >= rS) {
          const rV = oP[AH(0x8c1)](AH(0x831));
          rV && rV[AH(0x7d8)][AH(0x256)](AH(0xb21)),
            (oO = rQ),
            (hD[AH(0xaff)] = rQ),
            this[AH(0x7d8)][AH(0xab7)](AH(0xb21));
        }
      }),
        (cZ[rQ][us(0xcd7)] = rU),
        oP[us(0x188)](rU);
    }
    function oQ() {
      const AI = us,
        rV = parseInt(hD[AI(0xaff)]) || 0x0;
      cZ[0x0][AI(0xcd7)][AI(0x784)](),
        cZ[AI(0x78e)]((rW, rX) => {
          const AJ = AI,
            rY = rW[0x1];
          if (oE >= rY) {
            rW[AJ(0xcd7)][AJ(0x7d8)][AJ(0x256)](AJ(0x1ac));
            if (rV === rX) rW[AJ(0xcd7)][AJ(0x784)]();
          } else rW[AJ(0xcd7)][AJ(0x7d8)][AJ(0xab7)](AJ(0x1ac));
        });
    }
    var oR = document[us(0x8c1)](us(0x745));
    setInterval(() => {
      const AK = us;
      if (!oj[AK(0x7d8)][AK(0x7a1)](AK(0x254))) return;
      oS();
    }, 0x3e8);
    function oS() {
      const AL = us;
      if (jZ) {
        let rV = 0x0;
        for (const rX in jZ) {
          rV += oT(rX, jZ[rX]);
        }
        let rW = 0x0;
        for (const rY in oC) {
          const rZ = oT(rY, oC[rY][AL(0xd76)]);
          (rW += rZ), (rV += rZ);
        }
        if (rW > 0x0) {
          const s0 = Math[AL(0xd23)](0x19, (rW / rV) * 0x64),
            s1 = s0 > 0x1 ? s0[AL(0x303)](0x2) : s0[AL(0x303)](0x5);
          k8(oR, "+" + s1 + "%");
        }
      }
    }
    function oT(rV, rW) {
      const AM = us,
        rX = dC[rV];
      if (!rX) return 0x0;
      const rY = rX[AM(0x3ac)];
      return Math[AM(0x45f)](rY * 0xa, rY) * rW;
    }
    var oU = document[us(0x8c1)](us(0x92));
    (oU[us(0x21c)] = function () {
      const AN = us;
      for (const rV in oC) {
        const rW = oC[rV];
        rW[AN(0x3bb)]();
      }
      oV();
    }),
      oV(),
      oN();
    function oV() {
      const AO = us,
        rV = Object[AO(0x880)](oC);
      nV[AO(0x7d8)][AO(0x256)](AO(0x26a));
      const rW = rV[AO(0x680)] === 0x0;
      (oU[AO(0x6fc)][AO(0x9a7)] = rW ? AO(0x4eb) : ""), (oM = 0x0);
      let rX = 0x0;
      const rY = rV[AO(0x680)] > 0x1 ? 0x32 : 0x0;
      for (let s0 = 0x0, s1 = rV[AO(0x680)]; s0 < s1; s0++) {
        const s2 = rV[s0],
          s3 = (s0 / s1) * Math["PI"] * 0x2;
        s2[AO(0xb30)](
          Math[AO(0x802)](s3) * rY + 0x32,
          Math[AO(0x6ad)](s3) * rY + 0x32
        ),
          (oM += d3[s2["el"][AO(0x6f7)][AO(0x3ac)]] * s2[AO(0xd76)]);
      }
      nV[AO(0x7d8)][rY ? AO(0xab7) : AO(0x256)](AO(0x26a)),
        nU[AO(0x7d8)][rV[AO(0x680)] > 0x0 ? AO(0x256) : AO(0xab7)](AO(0x332));
      const rZ = oE >= cH;
      nW[AO(0x7d8)][rV[AO(0x680)] > 0x0 && rZ ? AO(0x256) : AO(0xab7)](
        AO(0x1ac)
      ),
        oS(),
        (nV[AO(0x6fc)][AO(0xc74)] = ""),
        (o2 = ![]),
        (o4 = ![]),
        (o3 = 0x0),
        (oI = Math[AO(0xd23)](0x1, (oG + oM) / oH) || 0x0),
        k8(o0, oM > 0x0 ? (!hack.isEnabled('betterXP') ? "+" + iJ(oM) + AO(0xae0) : "+" + oM + AO(0xae0)) : "");
    }
    var oW,
      oX = 0x0,
      oY = ![],
      oZ = 0x0,
      p0 = null;
    function p1() {
      const AP = us;
      of[AP(0x7d8)][oX < 0x5 ? AP(0xab7) : AP(0x256)](AP(0x332));
    }
    of[us(0x21c)] = function () {
      const AQ = us;
      if (oY || !oW || oX < 0x5 || !ik() || p0) return;
      (oY = !![]), (oZ = 0x0), (p0 = null), of[AQ(0x7d8)][AQ(0xab7)](AQ(0x332));
      const rV = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      rV[AQ(0x518)](0x0, cI[AQ(0xa6e)]),
        rV[AQ(0x873)](0x1, oW["id"]),
        rV[AQ(0xcfe)](0x3, oX),
        il(rV);
    };
    function p2(rV, rW) {
      k8(rV, "x" + iJ(rW));
    }
    function p3(rV) {
      const AR = us;
      typeof rV === AR(0x4ef) && (rV = nE(rV)), k8(og, rV + AR(0x5d9));
    }
    function p4(rV) {
      const AS = us;
      oW && n3(oW["id"], oX);
      oi && oi[AS(0x784)]();
      (oW = rV), (oX = 0x0), p1();
      for (let rW = 0x0; rW < oh[AS(0x680)]; rW++) {
        oh[rW][AS(0x4fd)]();
      }
      oW
        ? (p3(dE[oW[AS(0x3ac)]] * (jy ? 0x2 : 0x1) * (he ? 0.9 : 0x1)),
          (of[AS(0x6fc)][AS(0xd54)] = hQ[oW[AS(0x3ac)] + 0x1]))
        : p3("?");
    }
    var p5 = 0x0,
      p6 = 0x1;
    function p7(rV) {
      const AT = us,
        rW = dC[rV],
        rX = oc(rW);
      (rX[AT(0x41f)] = pp), jY(rX), (rX[AT(0x537)] = !![]), o6[AT(0x188)](rX);
      const rY = oc(rW);
      jY(rY), (rY[AT(0x41f)] = oj);
      rW[AT(0x3ac)] >= dc && rY[AT(0x7d8)][AT(0xab7)](AT(0xafb));
      rY[AT(0x21c)] = function () {
        const AU = AT;
        pM - p5 < 0x1f4 ? p6++ : (p6 = 0x1);
        p5 = pM;
        if (op) {
          if (oY || rW[AU(0x3ac)] >= dc) return;
          const s2 = iS[rW["id"]];
          if (!s2) return;
          oW !== rW && p4(rW);
          const s3 = oh[AU(0x680)];
          let s4 = pm ? s2 : Math[AU(0xd23)](s3 * p6, s2);
          n3(rW["id"], -s4), (oX += s4), p1();
          let s5 = s4 % s3,
            s6 = (s4 - s5) / s3;
          const s7 = [...oh][AU(0xd6c)](
            (s9, sa) => s9[AU(0xd76)] - sa[AU(0xd76)]
          );
          s6 > 0x0 && s7[AU(0x78e)]((s9) => s9[AU(0xce3)](s6));
          let s8 = 0x0;
          while (s5--) {
            const s9 = s7[s8];
            (s8 = (s8 + 0x1) % s3), s9[AU(0xce3)](0x1);
          }
          return;
        }
        if (!oC[rW["id"]]) {
          const sa = oc(rW, ![]);
          k8(sa[AU(0xd69)], "x1"),
            (sa[AU(0x21c)] = function (sc) {
              const AV = AU;
              sb[AV(0x3bb)](), oV();
            }),
            nV[AU(0x188)](sa);
          const sb = {
            petal: rW,
            count: 0x0,
            el: sa,
            setPos(sc, sd) {
              const AW = AU;
              (sa[AW(0x6fc)][AW(0x6ec)] = sc + "%"),
                (sa[AW(0x6fc)][AW(0x209)] = sd + "%"),
                (sa[AW(0x6fc)][AW(0xccc)] = AW(0x448));
            },
            dispose(sc = !![]) {
              const AX = AU;
              sa[AX(0x256)](),
                sc && n3(rW["id"], this[AX(0xd76)]),
                delete oC[rW["id"]];
            },
          };
          (oC[rW["id"]] = sb), oV();
        }
        const s1 = oC[rW["id"]];
        if (iS[rW["id"]]) {
          const sc = iS[rW["id"]],
            sd = pm ? sc : Math[AU(0xd23)](0x1 * p6, sc);
          (s1[AU(0xd76)] += sd),
            n3(rW["id"], -sd),
            p2(s1["el"][AU(0xd69)], s1[AU(0xd76)]);
        }
        oV();
      };
      const rZ = dH * rW[AT(0x1ce)] + rW[AT(0x99b)],
        s0 = o5[rZ];
      return (
        nT[AT(0x30f)](rY, s0),
        s0[AT(0x256)](),
        (o5[rZ] = rY),
        (rX[AT(0xb4c)] = function (s1) {
          const AY = AT;
          p2(rX[AY(0xd69)], s1), p2(rY[AY(0xd69)], s1);
        }),
        (rX[AT(0x314)] = rY),
        (o7[rV] = rX),
        (rX[AT(0x3bb)] = function () {
          const AZ = AT;
          rX[AZ(0x256)](), delete o7[rV];
          const s1 = nN(AZ(0x466));
          (o5[rZ] = s1), nT[AZ(0x30f)](s1, rY), rY[AZ(0x256)]();
        }),
        rX[AT(0xb4c)](iS[rV]),
        rX
      );
    }
    var p8 = {},
      p9 = {};
    function pa(rV, rW, rX, rY) {
      const B0 = us,
        rZ = document[B0(0x8c1)](rX);
      (rZ[B0(0x9d0)] = function () {
        const B1 = B0;
        (p8[rV] = this[B1(0xb54)]),
          (hD[rV] = this[B1(0xb54)] ? "1" : "0"),
          rY && rY(this[B1(0xb54)]);
      }),
        (p9[rV] = function () {
          const B2 = B0;
          rZ[B2(0x784)]();
        }),
        (rZ[B0(0xb54)] = hD[rV] === void 0x0 ? rW : hD[rV] === "1"),
        rZ[B0(0x9d0)]();
    }
    var pb = document[us(0x8c1)](us(0x835));
    (pb[us(0x6f7)] = function () {
      const B3 = us;
      return nN(
        B3(0x3e0) + hP[B3(0xb4d)] + B3(0xa3) + hP[B3(0xa26)] + B3(0x3e9)
      );
    }),
      pa(us(0x7b4), ![], us(0x8dd), mF),
      pa(us(0xd74), !![], us(0xc66)),
      pa(us(0x7de), !![], us(0x52a)),
      pa(
        us(0x8b0),
        !![],
        us(0x1cf),
        (rV) => (kK[us(0x6fc)][us(0x9a7)] = rV ? "" : us(0x4eb))
      ),
      pa(us(0x1d7), ![], us(0x486)),
      pa(us(0x4b6), ![], us(0x837)),
      pa(us(0x3d5), ![], us(0x624)),
      pa(us(0xa6a), !![], us(0xd5)),
      pa(
        us(0x212),
        !![],
        us(0xce9),
        (rV) => (pb[us(0x6fc)][us(0x9a7)] = rV ? "" : us(0x4eb))
      ),
      pa(us(0x219), ![], us(0x312), kT),
      pa(us(0xaf1), ![], us(0x490), kX),
      pa(us(0x476), ![], us(0x47f), (rV) => pc(ko, us(0x503), rV)),
      pa(us(0x955), !![], us(0x69e), (rV) =>
        pc(document[us(0xc39)], us(0xa20), !rV)
      ),
      pa(us(0x38c), !![], us(0x6d7), (rV) =>
        pc(document[us(0xc39)], us(0x425), !rV)
      ),
      pa(us(0x421), !![], us(0x5c4));
    function pc(rV, rW, rX) {
      const B4 = us;
      rV[B4(0x7d8)][rX ? B4(0xab7) : B4(0x256)](rW);
    }
    function pd() {
      const B5 = us,
        rV = document[B5(0x8c1)](B5(0x66a)),
        rW = [];
      for (let rY = 0x0; rY <= 0xa; rY++) {
        rW[B5(0x46a)](0x1 - rY * 0.05);
      }
      for (const rZ of rW) {
        const s0 = nN(B5(0x7c4) + rZ + "\x22>" + nE(rZ * 0x64) + B5(0x71e));
        rV[B5(0x188)](s0);
      }
      let rX = parseFloat(hD[B5(0xd81)]);
      (isNaN(rX) || !rW[B5(0x669)](rX)) && (rX = rW[0x0]),
        (rV[B5(0x77e)] = rX),
        (kP = rX),
        (rV[B5(0x9d0)] = function () {
          const B6 = B5;
          (kP = parseFloat(this[B6(0x77e)])),
            (hD[B6(0xd81)] = this[B6(0x77e)]),
            kX();
        });
    }
    pd();
    var pe = document[us(0x8c1)](us(0x88f)),
      pf = document[us(0x8c1)](us(0xb3d));
    pf[us(0x4e5)] = cL;
    var pg = document[us(0x8c1)](us(0x39d));
    function ph(rV) {
      const B7 = us,
        rW = nN(B7(0xb96));
      kl[B7(0x188)](rW);
      const rX = rW[B7(0x8c1)](B7(0xcc2));
      rX[B7(0x77e)] = rV;
      const rY = rW[B7(0x8c1)](B7(0x24b));
      (rY[B7(0x9d0)] = function () {
        const B8 = B7;
        rX[B8(0xb8a)] = this[B8(0xb54)] ? B8(0x5f0) : B8(0x4be);
      }),
        (rW[B7(0x8c1)](B7(0xb10))[B7(0x21c)] = function () {
          const B9 = B7;
          jp(rV), hc(B9(0xc50));
        }),
        (rW[B7(0x8c1)](B7(0xd7b))[B7(0x21c)] = function () {
          const Ba = B7,
            rZ = {};
          rZ[Ba(0xb8a)] = Ba(0x31e);
          const s0 = new Blob([rV], rZ),
            s1 = document[Ba(0xa1f)]("a");
          (s1[Ba(0x2dd)] = URL[Ba(0xb84)](s0)),
            (s1[Ba(0x9d4)] = (jv ? jv : Ba(0x2e2)) + Ba(0xb91)),
            s1[Ba(0x784)](),
            hc(Ba(0x19b));
        }),
        (rW[B7(0x8c1)](B7(0xb2c))[B7(0x21c)] = function () {
          const Bb = B7;
          rW[Bb(0x256)]();
        });
    }
    function pi() {
      const Bc = us,
        rV = nN(Bc(0xd55));
      kl[Bc(0x188)](rV);
      const rW = rV[Bc(0x8c1)](Bc(0xcc2)),
        rX = rV[Bc(0x8c1)](Bc(0x24b));
      (rX[Bc(0x9d0)] = function () {
        const Bd = Bc;
        rW[Bd(0xb8a)] = this[Bd(0xb54)] ? Bd(0x5f0) : Bd(0x4be);
      }),
        (rV[Bc(0x8c1)](Bc(0xb2c))[Bc(0x21c)] = function () {
          const Be = Bc;
          rV[Be(0x256)]();
        }),
        (rV[Bc(0x8c1)](Bc(0x36e))[Bc(0x21c)] = function () {
          const Bf = Bc,
            rY = rW[Bf(0x77e)][Bf(0xad8)]();
          if (eV(rY)) {
            delete hD[Bf(0x5fa)], (hD[Bf(0x91b)] = rY);
            if (hU)
              try {
                hU[Bf(0xbad)]();
              } catch (rZ) {}
            hc(Bf(0xc40));
          } else hc(Bf(0xb6));
        });
    }
    (document[us(0x8c1)](us(0xc9f))[us(0x21c)] = function () {
      const Bg = us;
      if (i5) {
        ph(i5);
        return;
        const rV = prompt(Bg(0xa93), i5);
        if (rV !== null) {
          const rW = {};
          rW[Bg(0xb8a)] = Bg(0x31e);
          const rX = new Blob([i5], rW),
            rY = document[Bg(0xa1f)]("a");
          (rY[Bg(0x2dd)] = URL[Bg(0xb84)](rX)),
            (rY[Bg(0x9d4)] = jv + Bg(0x4bc)),
            rY[Bg(0x784)](),
            alert(Bg(0x442));
        }
      }
    }),
      (document[us(0x8c1)](us(0xd3))[us(0x21c)] = function () {
        const Bh = us;
        pi();
        return;
        const rV = prompt(Bh(0xc97));
        if (rV !== null) {
          if (eV(rV)) {
            let rW = Bh(0x25d);
            i6 && (rW += Bh(0x300));
            if (confirm(rW)) {
              delete hD[Bh(0x5fa)], (hD[Bh(0x91b)] = rV);
              if (hU)
                try {
                  hU[Bh(0xbad)]();
                } catch (rX) {}
            }
          } else alert(Bh(0xb6));
        }
      }),
      pa(us(0xda0), ![], us(0x7ed), (rV) =>
        pf[us(0x7d8)][rV ? us(0xab7) : us(0x256)](us(0xab5))
      ),
      pa(us(0xc18), !![], us(0xa67));
    var pj = 0x0,
      pk = 0x0,
      pl = 0x0,
      pm = ![];
    function pn(rV, rW) {
      const Bi = us;
      (rV === Bi(0x3a5) || rV === Bi(0x8d)) && (pm = rW);
      if (rW) {
        switch (rV) {
          case Bi(0xc7b):
            m1[Bi(0x1aa)][Bi(0x691)]();
            break;
          case Bi(0x418):
            m1[Bi(0xa44)][Bi(0x691)]();
            break;
          case Bi(0x798):
            m1[Bi(0x734)][Bi(0x691)]();
            break;
          case Bi(0x5b3):
            pZ[Bi(0x7d8)][Bi(0x691)](Bi(0xb21));
            break;
          case Bi(0x37c):
            p9[Bi(0x1d7)](), hc(Bi(0x315) + (p8[Bi(0x1d7)] ? "ON" : Bi(0x841)));
            break;
          case Bi(0xacb):
            p9[Bi(0x4b6)](), hc(Bi(0x234) + (p8[Bi(0x4b6)] ? "ON" : Bi(0x841)));
            break;
          case Bi(0x886):
            p9[Bi(0x8b0)](), hc(Bi(0x5c8) + (p8[Bi(0x8b0)] ? "ON" : Bi(0x841)));
            break;
          case Bi(0x711):
            p9[Bi(0x3d5)](), hc(Bi(0xcad) + (p8[Bi(0x3d5)] ? "ON" : Bi(0x841)));
            break;
          case Bi(0xb0e):
            if (!mI && hW) {
              const rX = nx[Bi(0x6da)](Bi(0xac)),
                rY = ny[Bi(0x6da)](Bi(0xac));
              for (let rZ = 0x0; rZ < rX[Bi(0x680)]; rZ++) {
                const s0 = rX[rZ],
                  s1 = rY[rZ],
                  s2 = n6(s0),
                  s3 = n6(s1);
                if (s2) n7(s2, s1);
                else s3 && n7(s3, s0);
              }
              il(new Uint8Array([cI[Bi(0x6e0)]]));
            }
            break;
          default:
            if (!mI && hW && rV[Bi(0x7cc)](Bi(0x130)))
              sb: {
                let s4 = parseInt(rV[Bi(0x761)](0x5));
                if (nl[Bi(0x886)]) {
                  pm ? ku(s4) : kx(s4);
                  break sb;
                }
                s4 === 0x0 && (s4 = 0xa);
                iN > 0xa && pm && (s4 += 0xa);
                s4--;
                if (s4 >= 0x0) {
                  const s5 = nx[Bi(0x6da)](Bi(0xac))[s4],
                    s6 = ny[Bi(0x6da)](Bi(0xac))[s4];
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
        rV === Bi(0x265) &&
          (kk[Bi(0x6fc)][Bi(0x9a7)] === "" &&
          pf[Bi(0x6fc)][Bi(0x9a7)] === Bi(0x4eb)
            ? kD[Bi(0x784)]()
            : pf[Bi(0x4de)]()),
          delete nl[rV];
      if (iy) {
        if (p8[Bi(0x7b4)]) {
          let s9 = 0x0,
            sa = 0x0;
          if (nl[Bi(0x676)] || nl[Bi(0xd9e)]) sa = -0x1;
          else (nl[Bi(0xab4)] || nl[Bi(0xa54)]) && (sa = 0x1);
          if (nl[Bi(0xa2e)] || nl[Bi(0x89)]) s9 = -0x1;
          else (nl[Bi(0x125)] || nl[Bi(0x5bd)]) && (s9 = 0x1);
          if (s9 !== 0x0 || sa !== 0x0)
            (pj = Math[Bi(0x178)](sa, s9)), im(pj, 0x1);
          else (pk !== 0x0 || pl !== 0x0) && im(pj, 0x0);
          (pk = s9), (pl = sa);
        }
        po();
      }
    }
    function po() {
      const Bj = us,
        rV = nl[Bj(0xd89)] || nl[Bj(0x8d)] || nl[Bj(0x3a5)],
        rW = nl[Bj(0x6bc)] || nl[Bj(0xd26)],
        rX = (rV << 0x1) | rW;
      n8 !== rX && ((n8 = rX), il(new Uint8Array([cI[Bj(0x246)], rX])));
    }
    var pp = document[us(0x8c1)](us(0x671)),
      pq = 0x0,
      pr = 0x0,
      ps = 0x0;
    function pt(rV, rW, rX) {
      const Bk = us;
      return rV + (rW - rV) * Math[Bk(0xd23)](0x1, pN / rX);
    }
    var pu = 0x1,
      pv = [];
    for (let rV in cS) {
      if (
        [us(0x253), us(0x616), us(0x6bb), us(0x76b), us(0x554), us(0xa7e)][
          us(0x669)
        ](rV)
      )
        continue;
      pv[us(0x46a)](cS[rV]);
    }
    var pw = [];
    for (let rW = 0x0; rW < 0x1e; rW++) {
      px();
    }
    function px(rX = !![]) {
      const Bl = us,
        rY = new lG(
          -0x1,
          pv[Math[Bl(0x35d)](Math[Bl(0xba1)]() * pv[Bl(0x680)])],
          0x0,
          Math[Bl(0xba1)]() * d1,
          Math[Bl(0xba1)]() * 6.28
        );
      if (!rY[Bl(0xd57)] && Math[Bl(0xba1)]() < 0.01) rY[Bl(0xaee)] = !![];
      rY[Bl(0xd57)]
        ? (rY[Bl(0x10b)] = rY[Bl(0xc80)] = Math[Bl(0xba1)]() * 0x8 + 0xc)
        : (rY[Bl(0x10b)] = rY[Bl(0xc80)] = Math[Bl(0xba1)]() * 0x1e + 0x19),
        rX
          ? (rY["x"] = Math[Bl(0xba1)]() * d0)
          : (rY["x"] = -rY[Bl(0xc80)] * 0x2),
        (rY[Bl(0x5e8)] =
          (Math[Bl(0xba1)]() * 0x3 + 0x4) * rY[Bl(0x10b)] * 0.02),
        (rY[Bl(0x431)] = (Math[Bl(0xba1)]() * 0x2 - 0x1) * 0.05),
        pw[Bl(0x46a)](rY);
    }
    var py = 0x0,
      pz = 0x0,
      pA = 0x0,
      pB = 0x0;
    setInterval(function () {
      const Bm = us,
        rX = [ki, qr, ...Object[Bm(0x880)](pC), ...nK],
        rY = rX[Bm(0x680)];
      let rZ = 0x0;
      for (let s0 = 0x0; s0 < rY; s0++) {
        const s1 = rX[s0];
        rZ += s1[Bm(0x977)] * s1[Bm(0x4c9)];
      }
      kK[Bm(0xc86)](
        Bm(0x2dc),
        Math[Bm(0xbb8)](0x3e8 / pN) +
          Bm(0x1f3) +
          iw[Bm(0x680)] +
          Bm(0x9e7) +
          rY +
          Bm(0x6bf) +
          iJ(rZ) +
          Bm(0xa0a) +
          (pB / 0x3e8)[Bm(0x303)](0x2) +
          Bm(0x5b9)
      ),
        (pB = 0x0);
    }, 0x3e8);
    var pC = {};
    function pD(rX, rY, rZ, s0, s1, s2 = ![]) {
      const Bn = us;
      if (!pC[rY]) {
        const s5 = hx
          ? new OffscreenCanvas(0x1, 0x1)
          : document[Bn(0xa1f)](Bn(0x2fe));
        (s5[Bn(0x243)] = s5[Bn(0xcc)]("2d")),
          (s5[Bn(0x5f4)] = 0x0),
          (s5[Bn(0xc90)] = rZ),
          (s5[Bn(0x64d)] = s0),
          (pC[rY] = s5);
      }
      const s3 = pC[rY],
        s4 = s3[Bn(0x243)];
      if (pM - s3[Bn(0x5f4)] > 0x1f4) {
        s3[Bn(0x5f4)] = pM;
        const s6 = rX[Bn(0xa24)](),
          s7 = Math[Bn(0xd2c)](s6["a"], s6["b"]) * 1.5,
          s8 = kW * s7,
          s9 = Math[Bn(0x260)](s3[Bn(0xc90)] * s8) || 0x1;
        s9 !== s3["w"] &&
          ((s3["w"] = s9),
          (s3[Bn(0x977)] = s9),
          (s3[Bn(0x4c9)] = Math[Bn(0x260)](s3[Bn(0x64d)] * s8) || 0x1),
          s4[Bn(0x181)](),
          s4[Bn(0xd3b)](s8, s8),
          s1(s4),
          s4[Bn(0x242)]());
      }
      s3[Bn(0x4a4)] = !![];
      if (s2) return s3;
      rX[Bn(0x392)](
        s3,
        -s3[Bn(0xc90)] / 0x2,
        -s3[Bn(0x64d)] / 0x2,
        s3[Bn(0xc90)],
        s3[Bn(0x64d)]
      );
    }
    var pE = /^((?!chrome|android).)*safari/i[us(0x567)](navigator[us(0xf6)]),
      pF = pE ? 0.25 : 0x0;
    function pG(rX, rY, rZ = 0x14, s0 = us(0x155), s1 = 0x4, s2, s3 = "") {
      const Bo = us,
        s4 = Bo(0x11c) + rZ + Bo(0xa05) + iA;
      let s5, s6;
      const s7 = rY + "_" + s4 + "_" + s0 + "_" + s1 + "_" + s3,
        s8 = pC[s7];
      if (!s8) {
        rX[Bo(0x139)] = s4;
        const s9 = rX[Bo(0x6f2)](rY);
        (s5 = s9[Bo(0x977)] + s1), (s6 = rZ + s1);
      } else (s5 = s8[Bo(0xc90)]), (s6 = s8[Bo(0x64d)]);
      return pD(
        rX,
        s7,
        s5,
        s6,
        function (sa) {
          const Bp = Bo;
          sa[Bp(0x609)](s1 / 0x2, s1 / 0x2 - s6 * pF),
            (sa[Bp(0x139)] = s4),
            (sa[Bp(0xd16)] = Bp(0x209)),
            (sa[Bp(0xb9b)] = Bp(0x6ec)),
            (sa[Bp(0x290)] = s1),
            (sa[Bp(0x44c)] = Bp(0x133)),
            (sa[Bp(0xd2d)] = s0),
            s1 > 0x0 && sa[Bp(0x67f)](rY, 0x0, 0x0),
            sa[Bp(0x9cd)](rY, 0x0, 0x0);
        },
        s2
      );
    }
    var pH = 0x1;
    function pI(rX = cI[us(0xab0)]) {
      const Bq = us,
        rY = Object[Bq(0x880)](oC),
        rZ = new DataView(
          new ArrayBuffer(0x1 + 0x2 + rY[Bq(0x680)] * (0x2 + 0x4))
        );
      let s0 = 0x0;
      rZ[Bq(0x518)](s0++, rX), rZ[Bq(0x873)](s0, rY[Bq(0x680)]), (s0 += 0x2);
      for (let s1 = 0x0; s1 < rY[Bq(0x680)]; s1++) {
        const s2 = rY[s1];
        rZ[Bq(0x873)](s0, s2[Bq(0x6f7)]["id"]),
          (s0 += 0x2),
          rZ[Bq(0xcfe)](s0, s2[Bq(0xd76)]),
          (s0 += 0x4);
      }
      il(rZ);
    }
    function pJ() {
      const Br = us;
      oi[Br(0x256)](), oe[Br(0x7d8)][Br(0x256)](Br(0x403)), (oi = null);
    }
    var pK = [];
    function pL() {
      const Bs = us;
      for (let rX = 0x0; rX < pK[Bs(0x680)]; rX++) {
        const rY = pK[rX],
          rZ = rY[Bs(0xa13)],
          s0 = rZ && !rZ[Bs(0x8ee)];
        s0
          ? ((rY[Bs(0x8ee)] = ![]),
            (rY[Bs(0x905)] = rZ[Bs(0x905)]),
            (rY[Bs(0x2c1)] = rZ[Bs(0x2c1)]),
            (rY[Bs(0xc16)] = rZ[Bs(0xc16)]),
            (rY[Bs(0xcfc)] = rZ[Bs(0xcfc)]),
            (rY[Bs(0x59d)] = rZ[Bs(0x59d)]),
            (rY[Bs(0xca2)] = rZ[Bs(0xca2)]),
            (rY[Bs(0xab6)] = rZ[Bs(0xab6)]),
            (rY[Bs(0x9ca)] = rZ[Bs(0x9ca)]),
            (rY[Bs(0x8be)] = rZ[Bs(0x8be)]),
            (rY[Bs(0x3ef)] = rZ[Bs(0x3ef)]),
            (rY[Bs(0xd8c)] = rZ[Bs(0xd8c)]),
            (rY[Bs(0x73b)] = rZ[Bs(0x73b)]),
            (rY[Bs(0x175)] = rZ[Bs(0x175)]),
            (rY[Bs(0x640)] = rZ[Bs(0x640)]),
            (rY[Bs(0x550)] = rZ[Bs(0x550)]),
            j0(rY, rZ))
          : ((rY[Bs(0x8ee)] = !![]),
            (rY[Bs(0x373)] = 0x0),
            (rY[Bs(0x2c1)] = 0x1),
            (rY[Bs(0x905)] = 0x0),
            (rY[Bs(0xc16)] = ![]),
            (rY[Bs(0xcfc)] = 0x0),
            (rY[Bs(0x59d)] = 0x0),
            (rY[Bs(0xab6)] = pt(rY[Bs(0xab6)], 0x0, 0xc8)),
            (rY[Bs(0xca2)] = pt(rY[Bs(0xca2)], 0x0, 0xc8)),
            (rY[Bs(0x550)] = pt(rY[Bs(0x550)], 0x0, 0xc8)));
        if (rX > 0x0) {
          if (rZ) {
            const s1 = Math[Bs(0x178)](rZ["y"] - pr, rZ["x"] - pq);
            rY[Bs(0x6d5)] === void 0x0
              ? (rY[Bs(0x6d5)] = s1)
              : (rY[Bs(0x6d5)] = f8(rY[Bs(0x6d5)], s1, 0.1));
          }
          rY[Bs(0xa7f)] += ((s0 ? -0x1 : 0x1) * pN) / 0x320;
          if (rY[Bs(0xa7f)] < 0x0) rY[Bs(0xa7f)] = 0x0;
          rY[Bs(0xa7f)] > 0x1 && pK[Bs(0xb0d)](rX, 0x1);
        }
      }
    }
    var pM = Date[us(0x213)](),
      pN = 0x0,
      pO = 0x0,
      pP = pM;
    function pQ() {
      const Bt = us;
      (pM = Date[Bt(0x213)]()),
        (pN = pM - pP),
        (pP = pM),
        (pO = pN / 0x21),
        hd();
      let rX = 0x0;
      for (let rZ = 0x0; rZ < jX[Bt(0x680)]; rZ++) {
        const s0 = jX[rZ];
        if (!s0[Bt(0xd4d)]) jX[Bt(0xb0d)](rZ, 0x1), rZ--;
        else {
          if (
            (s0[Bt(0x41f)] &&
              !s0[Bt(0x41f)][Bt(0x7d8)][Bt(0x7a1)](Bt(0x254))) ||
            s0[Bt(0x8c8)][Bt(0x6fc)][Bt(0x9a7)] === Bt(0x4eb)
          )
            continue;
          else {
            jX[Bt(0xb0d)](rZ, 0x1),
              rZ--,
              s0[Bt(0x7d8)][Bt(0x256)](Bt(0x487)),
              rX++;
            if (rX >= 0x14) break;
          }
        }
      }
      (pR[Bt(0xa13)] = iy), pL();
      kC[Bt(0x7d8)][Bt(0x7a1)](Bt(0x254)) && (lL = pM);
      if (hv) {
        const s1 = pM / 0x50,
          s2 = Math[Bt(0x6ad)](s1) * 0x7,
          s3 = Math[Bt(0xb59)](Math[Bt(0x6ad)](s1 / 0x4)) * 0.15 + 0.85;
        hu[Bt(0x6fc)][Bt(0xc74)] = Bt(0x685) + s2 + Bt(0x8b3) + s3 + ")";
      } else hu[Bt(0x6fc)][Bt(0xc74)] = Bt(0x4eb);
      for (let s4 = jc[Bt(0x680)] - 0x1; s4 >= 0x0; s4--) {
        const s5 = jc[s4];
        if (s5[Bt(0x361)]) {
          jc[Bt(0xb0d)](s4, 0x1);
          continue;
        }
        s5[Bt(0x1ef)]();
      }
      for (let s6 = nK[Bt(0x680)] - 0x1; s6 >= 0x0; s6--) {
        const s7 = nK[s6];
        if (!s7[Bt(0xd4d)]) {
          nK[Bt(0xb0d)](s6, 0x1);
          continue;
        }
        s7[Bt(0xb50)]();
      }
      for (let s8 = jb[Bt(0x680)] - 0x1; s8 >= 0x0; s8--) {
        const s9 = jb[s8];
        s9[Bt(0x361)] &&
          s9["t"] <= 0x0 &&
          (s9[Bt(0x256)](), jb[Bt(0xb0d)](s8, 0x1)),
          (s9["t"] += ((s9[Bt(0x361)] ? -0x1 : 0x1) * pN) / s9[Bt(0x17a)]),
          (s9["t"] = Math[Bt(0xd23)](0x1, Math[Bt(0x137)](0x0, s9["t"]))),
          s9[Bt(0xb50)]();
      }
      for (let sa = n0[Bt(0x680)] - 0x1; sa >= 0x0; sa--) {
        const sb = n0[sa];
        if (!sb["el"][Bt(0xd4d)]) sb[Bt(0xbc)] = ![];
        (sb[Bt(0xcfb)] += ((sb[Bt(0xbc)] ? 0x1 : -0x1) * pN) / 0xc8),
          (sb[Bt(0xcfb)] = Math[Bt(0xd23)](
            0x1,
            Math[Bt(0x137)](sb[Bt(0xcfb)])
          ));
        if (!sb[Bt(0xbc)] && sb[Bt(0xcfb)] <= 0x0) {
          n0[Bt(0xb0d)](sa, 0x1), sb[Bt(0x256)]();
          continue;
        }
        sb[Bt(0x6fc)][Bt(0x6c7)] = sb[Bt(0xcfb)];
      }
      if (oY) {
        oZ += pN / 0x7d0;
        if (oZ > 0x1) {
          oZ = 0x0;
          if (p0) {
            oY = ![];
            const sc = oW[Bt(0xa75)],
              sd = p0[Bt(0x694)];
            if (p0[Bt(0xf9)] > 0x0)
              oh[Bt(0x78e)]((se) => se[Bt(0x4fd)]()),
                n3(oW["id"], sd),
                (oX = 0x0),
                p3("?"),
                oe[Bt(0x7d8)][Bt(0xab7)](Bt(0x403)),
                (oi = oc(sc)),
                oe[Bt(0x188)](oi),
                p2(oi[Bt(0xd69)], p0[Bt(0xf9)]),
                (oi[Bt(0x21c)] = function () {
                  const Bu = Bt;
                  n3(sc["id"], p0[Bu(0xf9)]), pJ(), (p0 = null);
                });
            else {
              oX = sd;
              const se = [...oh][Bt(0xd6c)](() => Math[Bt(0xba1)]() - 0.5);
              for (let sf = 0x0, sg = se[Bt(0x680)]; sf < sg; sf++) {
                const sh = se[sf];
                sf >= sd ? sh[Bt(0x4fd)]() : sh[Bt(0xce3)](0x1 - sh[Bt(0xd76)]);
              }
              p0 = null;
            }
            p1();
          }
        }
      }
      for (let si = 0x0; si < oh[Bt(0x680)]; si++) {
        oh[si][Bt(0x423)](oZ);
      }
      for (let sj in nh) {
        const sk = nh[sj];
        if (!sk) {
          delete nh[sj];
          continue;
        }
        for (let sl = sk[Bt(0x680)] - 0x1; sl >= 0x0; sl--) {
          const sm = sk[sl];
          sm["t"] += pN;
          if (sm[Bt(0xa86)]) sm["t"] > lX && sk[Bt(0xb0d)](sl, 0x1);
          else {
            if (sm["t"] > lU) {
              const sn = 0x1 - Math[Bt(0xd23)](0x1, (sm["t"] - lU) / 0x7d0);
              (sm[Bt(0x6fc)][Bt(0x6c7)] = sn),
                sn <= 0x0 && sk[Bt(0xb0d)](sl, 0x1);
            }
          }
        }
        sk[Bt(0x680)] === 0x0 && delete nh[sj];
      }
      if (o2)
        sH: {
          if (ik()) {
            (o3 += pN),
              (nV[Bt(0x6fc)][Bt(0xc74)] =
                Bt(0xe6) +
                (Math[Bt(0x6ad)](Date[Bt(0x213)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (o3 > 0x3e8) {
              if (o4) {
                pI(cI[Bt(0x247)]), m0(![]);
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
                  const ss = ny[Bt(0x70b)][sr];
                  ss[Bt(0x8b)] += sp;
                }
                const sq = ny[Bt(0x2da)][Bt(0x8b)] + 0x1;
                for (let st = 0x0; st < sp; st++) {
                  const su = nN(Bt(0x6df));
                  (su[Bt(0x8b)] = iN + st), nx[Bt(0x188)](su);
                  const sv = nN(Bt(0x6df));
                  (sv[Bt(0x8b)] = sq + st),
                    sv[Bt(0x188)](
                      nN(Bt(0x449) + ((su[Bt(0x8b)] + 0x1) % 0xa) + Bt(0x1bf))
                    ),
                    ny[Bt(0x188)](sv);
                }
                (iN = so), (iO = iN * 0x2);
              }
            }
          } else (o2 = ![]), (o4 = ![]), (o3 = 0x0);
        }
      (oL = pt(oL, oJ, 0x64)),
        (oK = pt(oK, oI, 0x64)),
        (nY[Bt(0x6fc)][Bt(0x977)] = oL * 0x64 + "%"),
        (nZ[Bt(0x6fc)][Bt(0x977)] = oK * 0x64 + "%");
      for (let sw in pC) {
        !pC[sw][Bt(0x4a4)] ? delete pC[sw] : (pC[sw][Bt(0x4a4)] = ![]);
      }
      (n9 = pt(n9, nb, 0x32)), (na = pt(na, nc, 0x32));
      const rY = Math[Bt(0xd23)](0x64, pN) / 0x3c;
      pT -= 0x3 * rY;
      for (let sx = pw[Bt(0x680)] - 0x1; sx >= 0x0; sx--) {
        const sy = pw[sx];
        (sy["x"] += sy[Bt(0x5e8)] * rY),
          (sy["y"] += Math[Bt(0x6ad)](sy[Bt(0x640)] * 0x2) * 0.8 * rY),
          (sy[Bt(0x640)] += sy[Bt(0x431)] * rY),
          (sy[Bt(0x175)] += 0.002 * pN),
          (sy[Bt(0x2df)] = !![]);
        const sz = sy[Bt(0xc80)] * 0x2;
        (sy["x"] >= d0 + sz || sy["y"] < -sz || sy["y"] >= d1 + sz) &&
          (pw[Bt(0xb0d)](sx, 0x1), px(![]));
      }
      for (let sA = 0x0; sA < iG[Bt(0x680)]; sA++) {
        iG[sA][Bt(0xb50)]();
      }
      ps = Math[Bt(0x137)](0x0, ps - pN / 0x12c);
      if (p8[Bt(0xd74)] && ps > 0x0) {
        const sB = Math[Bt(0xba1)]() * 0x2 * Math["PI"],
          sC = ps * 0x3;
        (qH = Math[Bt(0x802)](sB) * sC), (qI = Math[Bt(0x6ad)](sB) * sC);
      } else (qH = 0x0), (qI = 0x0);
      (pu = pt(pu, pH, 0xc8)), (ne = pt(ne, nd, 0x64));
      for (let sD = mH[Bt(0x680)] - 0x1; sD >= 0x0; sD--) {
        const sE = mH[sD];
        sE[Bt(0xb50)](), sE[Bt(0x9d1)] && mH[Bt(0xb0d)](sD, 0x1);
      }
      for (let sF = iw[Bt(0x680)] - 0x1; sF >= 0x0; sF--) {
        const sG = iw[sF];
        sG[Bt(0xb50)](),
          sG[Bt(0x8ee)] && sG[Bt(0x373)] > 0x1 && iw[Bt(0xb0d)](sF, 0x1);
      }
      iy && ((pq = iy["x"]), (pr = iy["y"])), qF(), window[Bt(0x49f)](pQ);
    }
    var pR = pS();
    function pS() {
      const Bv = us,
        rX = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[Bv(0x2ee)], 0x19);
      return (rX[Bv(0xa7f)] = 0x1), rX;
    }
    var pT = 0x0,
      pU = [us(0xbf3), us(0xa39), us(0x919)],
      pV = [];
    for (let rX = 0x0; rX < 0x3; rX++) {
      for (let rY = 0x0; rY < 0x3; rY++) {
        const rZ = pW(pU[rX], 0x1 - 0.05 * rY);
        pV[us(0x46a)](rZ);
      }
    }
    function pW(s0, s1) {
      const Bw = us;
      return pX(hA(s0)[Bw(0xd91)]((s2) => s2 * s1));
    }
    function pX(s0) {
      const Bx = us;
      return s0[Bx(0x8ea)](
        (s1, s2) => s1 + parseInt(s2)[Bx(0x4d3)](0x10)[Bx(0xa82)](0x2, "0"),
        "#"
      );
    }
    function pY(s0) {
      const By = us;
      return By(0x2bd) + s0[By(0x7db)](",") + ")";
    }
    var pZ = document[us(0x8c1)](us(0x4ee));
    function q0() {
      const Bz = us,
        s0 = document[Bz(0xa1f)](Bz(0x2fe));
      s0[Bz(0x977)] = s0[Bz(0x4c9)] = 0x3;
      const s1 = s0[Bz(0xcc)]("2d");
      for (let s2 = 0x0; s2 < pV[Bz(0x680)]; s2++) {
        const s3 = s2 % 0x3,
          s4 = (s2 - s3) / 0x3;
        (s1[Bz(0xd2d)] = pV[s2]), s1[Bz(0x24f)](s3, s4, 0x1, 0x1);
        const s5 = j7[s2],
          s6 = j8[s2],
          s7 = nN(
            Bz(0x1e9) +
              s6 +
              Bz(0x656) +
              ((s4 + 0.5) / 0x3) * 0x64 +
              Bz(0x34a) +
              ((s3 + 0.5) / 0x3) * 0x64 +
              Bz(0xa8) +
              s5 +
              Bz(0xb17)
          );
        pZ[Bz(0x30f)](s7, pZ[Bz(0x70b)][0x0]);
      }
      pZ[Bz(0x6fc)][Bz(0x1c9)] = Bz(0x810) + s0[Bz(0x3ab)]() + ")";
    }
    q0();
    var q1 = document[us(0x8c1)](us(0x70d)),
      q2 = document[us(0x8c1)](us(0x1ec));
    function q3(s0, s1, s2) {
      const BA = us;
      (s0[BA(0x6fc)][BA(0x6ec)] = (s1 / j2) * 0x64 + "%"),
        (s0[BA(0x6fc)][BA(0x209)] = (s2 / j2) * 0x64 + "%");
    }
    function q4() {
      const BB = us,
        s0 = qK(),
        s1 = d0 / 0x2 / s0,
        s2 = d1 / 0x2 / s0,
        s3 = j4,
        s4 = Math[BB(0x137)](0x0, Math[BB(0x35d)]((pq - s1) / s3) - 0x1),
        s5 = Math[BB(0x137)](0x0, Math[BB(0x35d)]((pr - s2) / s3) - 0x1),
        s6 = Math[BB(0xd23)](j5 - 0x1, Math[BB(0x260)]((pq + s1) / s3)),
        s7 = Math[BB(0xd23)](j5 - 0x1, Math[BB(0x260)]((pr + s2) / s3));
      kj[BB(0x181)](), kj[BB(0xd3b)](s3, s3), kj[BB(0x9fa)]();
      for (let s8 = s4; s8 <= s6 + 0x1; s8++) {
        kj[BB(0xbd5)](s8, s5), kj[BB(0x6e1)](s8, s7 + 0x1);
      }
      for (let s9 = s5; s9 <= s7 + 0x1; s9++) {
        kj[BB(0xbd5)](s4, s9), kj[BB(0x6e1)](s6 + 0x1, s9);
      }
      kj[BB(0x242)]();
      for (let sa = s4; sa <= s6; sa++) {
        for (let sb = s5; sb <= s7; sb++) {
          kj[BB(0x181)](),
            kj[BB(0x609)]((sa + 0.5) * s3, (sb + 0.5) * s3),
            pG(kj, sa + "," + sb, 0x28, BB(0x155), 0x6),
            kj[BB(0x242)]();
        }
      }
      (kj[BB(0x44c)] = BB(0xc62)),
        (kj[BB(0x290)] = 0xa),
        (kj[BB(0x3e3)] = BB(0xbb8)),
        kj[BB(0x2dc)]();
    }
    function q5(s0, s1) {
      const BC = us,
        s2 = nN(BC(0x259) + s0 + BC(0x19f) + s1 + BC(0x8c)),
        s3 = s2[BC(0x8c1)](BC(0x674));
      return (
        km[BC(0x188)](s2),
        (s2[BC(0x280)] = function (s4) {
          const BD = BC;
          s4 > 0x0 && s4 !== 0x1
            ? (s3[BD(0xc86)](BD(0x6fc), BD(0x59f) + s4 * 0x168 + BD(0x5e4)),
              s2[BD(0x7d8)][BD(0xab7)](BD(0x254)))
            : s2[BD(0x7d8)][BD(0x256)](BD(0x254));
        }),
        km[BC(0x30f)](s2, pZ),
        s2
      );
    }
    var q6 = q5(us(0xace), us(0x894));
    q6[us(0x7d8)][us(0xab7)](us(0x209));
    var q7 = nN(us(0x665) + hP[us(0xb0c)] + us(0xb08));
    q6[us(0x70b)][0x0][us(0x188)](q7);
    var q8 = q5(us(0x1c8), us(0x1cc)),
      q9 = q5(us(0x8b6), us(0x85e));
    q9[us(0x7d8)][us(0xab7)](us(0x2db));
    var qa = us(0xae8),
      qb = 0x2bc,
      qc = new lT("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cY[us(0x2ee)], 0x19);
    qc[us(0x905)] = 0x0;
    var qd = [
      [us(0x7ec), us(0x123)],
      [us(0x432), us(0xa28)],
      [us(0x362), us(0xae1)],
      [us(0xc7d), us(0x6b0), us(0x673)],
      [us(0x179), us(0x62e)],
      [us(0x5b8), us(0x32d)],
      [us(0x952), us(0x3f7)],
    ];
    function qe() {
      const BE = us;
      let s0 = "";
      const s1 = qd[BE(0x680)] - 0x1;
      for (let s2 = 0x0; s2 < s1; s2++) {
        const s3 = qd[s2][0x0];
        (s0 += s3),
          s2 === s1 - 0x1
            ? (s0 += BE(0x668) + qd[s2 + 0x1][0x0] + ".")
            : (s0 += ",\x20");
      }
      return s0;
    }
    var qf = qe(),
      qg = document[us(0x8c1)](us(0x165));
    (qg[us(0x6f7)] = function () {
      const BF = us;
      return nN(
        BF(0x170) +
          hP[BF(0x286)] +
          BF(0x2e4) +
          hP[BF(0xa26)] +
          BF(0x9ea) +
          hP[BF(0xb4d)] +
          BF(0x812) +
          qf +
          BF(0x20e)
      );
    }),
      (qg[us(0x643)] = !![]);
    var qh =
      Date[us(0x213)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[us(0x35d)](Math[us(0xba1)]() * qd[us(0x680)]);
    function qi() {
      const BG = us,
        s0 = qd[qh];
      (qc[BG(0x9ca)] = s0[0x0]), (qc[BG(0x428)] = s0[0x1]);
      for (let s1 of iZ) {
        qc[s1] = Math[BG(0xba1)]() > 0.5;
      }
      qh = (qh + 0x1) % qd[BG(0x680)];
    }
    qi(),
      (qg[us(0x21c)] = function () {
        const BH = us;
        window[BH(0x7b5)](qc[BH(0x428)], BH(0x27b)), qi();
      });
    var qj = new lT(us(0x9e0), 0x0, -0x19, 0x0, 0x1, cY[us(0x2ee)], 0x19);
    (qj[us(0x905)] = 0x0), (qj[us(0xc02)] = !![]);
    var qk = [
        us(0x47c),
        us(0x94d),
        us(0xc6b),
        us(0x714),
        us(0xd7d),
        us(0xb94),
        us(0x95),
      ],
      ql = [
        us(0xee),
        us(0xd1b),
        us(0x682),
        us(0x8d3),
        us(0x5f5),
        us(0x723),
        us(0xcdf),
        us(0x206),
      ],
      qm = 0x0;
    function qn() {
      const BI = us,
        s0 = {};
      (s0[BI(0x5f0)] = qk[qm % qk[BI(0x680)]]),
        (s0[BI(0xa86)] = !![]),
        (s0[BI(0x5c9)] = ng["me"]),
        nk(BI(0x9e0), s0),
        nk("yt", {
          text: ql[qm % ql[BI(0x680)]][BI(0xce2)](
            BI(0x9e6),
            kE[BI(0x77e)][BI(0xad8)]() || BI(0xf2)
          ),
          isFakeChat: !![],
          col: ng["me"],
        }),
        qm++;
    }
    qn(), setInterval(qn, 0xfa0);
    var qo = 0x0,
      qp = Math[us(0x260)](
        (Math[us(0x137)](screen[us(0x977)], screen[us(0x4c9)], kU(), kV()) *
          window[us(0x93a)]) /
          0xc
      ),
      qq = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[us(0x110)], 0x19);
    (qq[us(0x8ee)] = !![]), (qq[us(0x2c1)] = 0x1), (qq[us(0xd3b)] = 0.6);
    var qr = (function () {
        const BJ = us,
          s0 = document[BJ(0xa1f)](BJ(0x2fe)),
          s1 = qp * 0x2;
        (s0[BJ(0x977)] = s0[BJ(0x4c9)] = s1),
          (s0[BJ(0x6fc)][BJ(0x977)] = s0[BJ(0x6fc)][BJ(0x4c9)] = BJ(0xcba));
        const s2 = document[BJ(0x8c1)](BJ(0x1a1));
        s2[BJ(0x188)](s0);
        const s3 = s0[BJ(0xcc)]("2d");
        return (
          (s0[BJ(0x238)] = function () {
            const BK = BJ;
            (qq[BK(0xaee)] = ![]),
              s3[BK(0x2d0)](0x0, 0x0, s1, s1),
              s3[BK(0x181)](),
              s3[BK(0x477)](s1 / 0x64),
              s3[BK(0x609)](0x32, 0x32),
              s3[BK(0x477)](0.8),
              s3[BK(0xd4b)](-Math["PI"] / 0x8),
              qq[BK(0xa46)](s3),
              s3[BK(0x242)]();
          }),
          s0
        );
      })(),
      qs,
      qt,
      qu,
      qv = ![];
    function qw() {
      const BL = us;
      if (qv) return;
      (qv = !![]), iB();
      const s0 = qA(qp);
      qu = s0[BL(0x3ab)](BL(0x69c));
      const s1 = qs * 0x64 + "%\x20" + qt * 0x64 + BL(0xa0e),
        s2 = nN(
          BL(0x48f) +
            hQ[BL(0xd91)](
              (s3, s4) => BL(0x5a5) + s4 + BL(0x1ed) + s3 + BL(0xbe8)
            )[BL(0x7db)]("\x0a") +
            BL(0xcb3) +
            nB[BL(0x412)] +
            BL(0x8f) +
            nB[BL(0xda6)] +
            BL(0x81) +
            nB[BL(0x577)] +
            BL(0x4b9) +
            dH +
            BL(0x11e) +
            qu +
            BL(0x890) +
            s1 +
            BL(0xbba) +
            s1 +
            BL(0xd53) +
            s1 +
            BL(0x7b2) +
            s1 +
            BL(0x70e)
        );
      document[BL(0xc39)][BL(0x188)](s2);
    }
    function qx(s0) {
      const BM = us,
        s1 =
          -s0[BM(0xa04)]["x"] * 0x64 +
          "%\x20" +
          -s0[BM(0xa04)]["y"] * 0x64 +
          "%";
      return (
        BM(0xaae) +
        s1 +
        BM(0x255) +
        s1 +
        BM(0xce6) +
        s1 +
        BM(0xb6d) +
        s1 +
        ";\x22"
      );
    }
    if (document[us(0x97a)] && document[us(0x97a)][us(0xcc8)]) {
      const s0 = setTimeout(qw, 0x1f40);
      document[us(0x97a)][us(0xcc8)][us(0x5af)](() => {
        const BN = us;
        console[BN(0xb12)](BN(0x22f)), clearTimeout(s0), qw();
      });
    } else qw();
    var qy = [];
    qz();
    function qz() {
      const BO = us,
        s1 = {};
      (qs = 0xf), (qy = []);
      let s2 = 0x0;
      for (let s4 = 0x0; s4 < dC[BO(0x680)]; s4++) {
        const s5 = dC[s4],
          s6 = BO(0xd28) + s5[BO(0x456)] + "_" + (s5[BO(0xd76)] || 0x1),
          s7 = s1[s6];
        if (s7 === void 0x0) (s5[BO(0xa04)] = s1[s6] = s3()), qy[BO(0x46a)](s5);
        else {
          s5[BO(0xa04)] = s7;
          continue;
        }
      }
      for (let s8 = 0x0; s8 < eK[BO(0x680)]; s8++) {
        const s9 = eK[s8],
          sa = BO(0x773) + s9[BO(0x456)],
          sb = s1[sa];
        if (sb === void 0x0) s9[BO(0xa04)] = s1[sa] = s3();
        else {
          s9[BO(0xa04)] = sb;
          continue;
        }
      }
      function s3() {
        const BP = BO;
        return { x: s2 % qs, y: Math[BP(0x35d)](s2 / qs), index: s2++ };
      }
    }
    function qA(s1) {
      const BQ = us,
        s2 = qy[BQ(0x680)] + eL;
      qt = Math[BQ(0x260)](s2 / qs);
      const s3 = document[BQ(0xa1f)](BQ(0x2fe));
      (s3[BQ(0x977)] = s1 * qs), (s3[BQ(0x4c9)] = s1 * qt);
      const s4 = s3[BQ(0xcc)]("2d"),
        s5 = 0x5a,
        s6 = s5 / 0x2,
        s7 = s1 / s5;
      s4[BQ(0xd3b)](s7, s7), s4[BQ(0x609)](s6, s6);
      for (let s8 = 0x0; s8 < qy[BQ(0x680)]; s8++) {
        const s9 = qy[s8];
        s4[BQ(0x181)](),
          s4[BQ(0x609)](s9[BQ(0xa04)]["x"] * s5, s9[BQ(0xa04)]["y"] * s5),
          s4[BQ(0x181)](),
          s4[BQ(0x609)](0x0 + s9[BQ(0xc23)], -0x5 + s9[BQ(0x562)]),
          s9[BQ(0x461)](s4),
          s4[BQ(0x242)](),
          (s4[BQ(0xd2d)] = BQ(0x155)),
          (s4[BQ(0xb9b)] = BQ(0x2db)),
          (s4[BQ(0xd16)] = BQ(0x929)),
          (s4[BQ(0x139)] = BQ(0x103) + iA),
          (s4[BQ(0x290)] = h5 ? 0x5 : 0x3),
          (s4[BQ(0x44c)] = BQ(0x29e)),
          (s4[BQ(0x3e3)] = s4[BQ(0x8f6)] = BQ(0xbb8)),
          s4[BQ(0x609)](0x0, s6 - 0x8 - s4[BQ(0x290)]);
        let sa = s9[BQ(0x456)];
        h5 && (sa = h7(sa));
        const sb = s4[BQ(0x6f2)](sa)[BQ(0x977)] + s4[BQ(0x290)],
          sc = Math[BQ(0xd23)](0x4c / sb, 0x1);
        s4[BQ(0xd3b)](sc, sc),
          s4[BQ(0x67f)](sa, 0x0, 0x0),
          s4[BQ(0x9cd)](sa, 0x0, 0x0),
          s4[BQ(0x242)]();
      }
      for (let sd = 0x0; sd < eL; sd++) {
        const se = eK[sd];
        s4[BQ(0x181)](),
          s4[BQ(0x609)](se[BQ(0xa04)]["x"] * s5, se[BQ(0xa04)]["y"] * s5),
          se[BQ(0x770)] !== void 0x0 &&
            (s4[BQ(0x9fa)](), s4[BQ(0x778)](-s6, -s6, s5, s5), s4[BQ(0xd02)]()),
          s4[BQ(0x609)](se[BQ(0xc23)], se[BQ(0x562)]),
          se[BQ(0x461)](s4),
          s4[BQ(0x242)]();
      }
      return s3;
    }
    var qB = new lG(-0x1, cS[us(0x400)], 0x0, 0x0, Math[us(0xba1)]() * 6.28);
    qB[us(0xc80)] = 0x32;
    function qC() {
      const BR = us;
      kj[BR(0x663)](j2 / 0x2, j2 / 0x2, j2 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qD(s1) {
      const BS = us,
        s2 = s1[BS(0x680)],
        s3 = document[BS(0xa1f)](BS(0x2fe));
      s3[BS(0x977)] = s3[BS(0x4c9)] = s2;
      const s4 = s3[BS(0xcc)]("2d"),
        s5 = s4[BS(0xbd8)](s2, s2);
      for (let s6 = 0x0; s6 < s2; s6++) {
        for (let s7 = 0x0; s7 < s2; s7++) {
          const s8 = s1[s6][s7];
          if (!s8) continue;
          const s9 = (s6 * s2 + s7) * 0x4;
          s5[BS(0x5b2)][s9 + 0x3] = 0xff;
        }
      }
      return s4[BS(0xc53)](s5, 0x0, 0x0), s3;
    }
    function qE() {
      const BT = us;
      if (!jK) return;
      kj[BT(0x181)](),
        kj[BT(0x9fa)](),
        qC(),
        kj[BT(0xd02)](),
        !jK[BT(0x2fe)] && (jK[BT(0x2fe)] = qD(jK)),
        (kj[BT(0x61e)] = ![]),
        (kj[BT(0x915)] = 0.08),
        kj[BT(0x392)](jK[BT(0x2fe)], 0x0, 0x0, j2, j2),
        kj[BT(0x242)]();
    }
    function qF() {
      const BU = us;
      lM = 0x0;
      const s1 = kR * kW;
      qo = 0x0;
      for (let s7 = 0x0; s7 < nK[BU(0x680)]; s7++) {
        const s8 = nK[s7];
        s8[BU(0xb1)] && s8[BU(0x238)]();
      }
      if (
        kk[BU(0x6fc)][BU(0x9a7)] === "" ||
        document[BU(0xc39)][BU(0x7d8)][BU(0x7a1)](BU(0x9aa))
      ) {
        (kj[BU(0xd2d)] = BU(0xbf3)),
          kj[BU(0x24f)](0x0, 0x0, ki[BU(0x977)], ki[BU(0x4c9)]),
          kj[BU(0x181)]();
        let s9 = Math[BU(0x137)](ki[BU(0x977)] / d0, ki[BU(0x4c9)] / d1);
        kj[BU(0xd3b)](s9, s9),
          kj[BU(0x778)](0x0, 0x0, d0, d1),
          kj[BU(0x181)](),
          kj[BU(0x609)](pT, -pT),
          kj[BU(0xd3b)](1.25, 1.25),
          (kj[BU(0xd2d)] = kY),
          kj[BU(0x5a4)](),
          kj[BU(0x242)]();
        for (let sa = 0x0; sa < pw[BU(0x680)]; sa++) {
          pw[sa][BU(0xa46)](kj);
        }
        kj[BU(0x242)]();
        if (p8[BU(0x212)] && pb[BU(0xaa6)] > 0x0) {
          const sb = pb[BU(0xbe9)]();
          kj[BU(0x181)]();
          let sc = kW;
          kj[BU(0xd3b)](sc, sc),
            kj[BU(0x609)](
              sb["x"] + sb[BU(0x977)] / 0x2,
              sb["y"] + sb[BU(0x4c9)]
            ),
            kj[BU(0x477)](kR * 0.8),
            qj[BU(0xa46)](kj),
            kj[BU(0xd3b)](0.7, 0.7),
            qj[BU(0xd0f)](kj),
            kj[BU(0x242)]();
        }
        if (qg[BU(0xaa6)] > 0x0) {
          const sd = qg[BU(0xbe9)]();
          kj[BU(0x181)]();
          let se = kW;
          kj[BU(0xd3b)](se, se),
            kj[BU(0x609)](
              sd["x"] + sd[BU(0x977)] / 0x2,
              sd["y"] + sd[BU(0x4c9)] * 0.6
            ),
            kj[BU(0x477)](kR * 0.8),
            qc[BU(0xa46)](kj),
            kj[BU(0x477)](0.7),
            kj[BU(0x181)](),
            kj[BU(0x609)](0x0, -qc[BU(0xc80)] - 0x23),
            pG(kj, qc[BU(0x9ca)], 0x12, BU(0x155), 0x3),
            kj[BU(0x242)](),
            qc[BU(0xd0f)](kj),
            kj[BU(0x242)]();
        }
        if (hm[BU(0xaa6)] > 0x0) {
          const sf = hm[BU(0xbe9)]();
          kj[BU(0x181)]();
          let sg = kW;
          kj[BU(0xd3b)](sg, sg),
            kj[BU(0x609)](
              sf["x"] + sf[BU(0x977)] / 0x2,
              sf["y"] + sf[BU(0x4c9)] * 0.5
            ),
            kj[BU(0x477)](kR),
            qB[BU(0xa46)](kj),
            kj[BU(0x242)]();
        }
        return;
      }
      if (jy)
        (kj[BU(0xd2d)] = pV[0x0]),
          kj[BU(0x24f)](0x0, 0x0, ki[BU(0x977)], ki[BU(0x4c9)]);
      else {
        kj[BU(0x181)](), qJ();
        for (let sh = -0x1; sh < 0x4; sh++) {
          for (let si = -0x1; si < 0x4; si++) {
            const sj = Math[BU(0x137)](0x0, Math[BU(0xd23)](si, 0x2)),
              sk = Math[BU(0x137)](0x0, Math[BU(0xd23)](sh, 0x2));
            (kj[BU(0xd2d)] = pV[sk * 0x3 + sj]),
              kj[BU(0x24f)](si * j3, sh * j3, j3, j3);
          }
        }
        kj[BU(0x9fa)](),
          kj[BU(0x778)](0x0, 0x0, j2, j2),
          kj[BU(0xd02)](),
          kj[BU(0x9fa)](),
          kj[BU(0xbd5)](-0xa, j3),
          kj[BU(0x6e1)](j3 * 0x2, j3),
          kj[BU(0xbd5)](j3 * 0x2, j3 * 0.5),
          kj[BU(0x6e1)](j3 * 0x2, j3 * 1.5),
          kj[BU(0xbd5)](j3 * 0x1, j3 * 0x2),
          kj[BU(0x6e1)](j2 + 0xa, j3 * 0x2),
          kj[BU(0xbd5)](j3, j3 * 1.5),
          kj[BU(0x6e1)](j3, j3 * 2.5),
          (kj[BU(0x290)] = qb * 0x2),
          (kj[BU(0x3e3)] = BU(0xbb8)),
          (kj[BU(0x44c)] = qa),
          kj[BU(0x2dc)](),
          kj[BU(0x242)]();
      }
      kj[BU(0x181)](),
        kj[BU(0x9fa)](),
        kj[BU(0x778)](0x0, 0x0, ki[BU(0x977)], ki[BU(0x4c9)]),
        qJ();
      p8[BU(0x421)] && ((kj[BU(0xd2d)] = kY), kj[BU(0x5a4)]());
      kj[BU(0x9fa)]();
      jy ? qC() : kj[BU(0x778)](0x0, 0x0, j2, j2);
      kj[BU(0x242)](),
        kj[BU(0x778)](0x0, 0x0, ki[BU(0x977)], ki[BU(0x4c9)]),
        (kj[BU(0xd2d)] = qa),
        kj[BU(0x5a4)](BU(0xa33)),
        kj[BU(0x181)](),
        qJ();
      p8[BU(0x4b6)] && q4();
      qE();
      const s3 = [];
      let s4 = [];
      for (let sl = 0x0; sl < iw[BU(0x680)]; sl++) {
        const sm = iw[sl];
        if (sm[BU(0x84b)]) {
          if (iy) {
            if (
              pM - sm[BU(0xa34)] < 0x3e8 ||
              Math[BU(0xd2c)](sm["nx"] - iy["x"], sm["ny"] - iy["y"]) <
                Math[BU(0xd2c)](sm["ox"] - iy["x"], sm["oy"] - iy["y"])
            ) {
              s3[BU(0x46a)](sm), (sm[BU(0xa34)] = pM);
              continue;
            }
          }
        }
        sm !== iy && s4[BU(0x46a)](sm);
      }
      (s4 = qG(s4, (sn) => sn[BU(0xb8a)] === cS[BU(0x554)])),
        (s4 = qG(s4, (sn) => sn[BU(0xb8a)] === cS[BU(0x76b)])),
        (s4 = qG(s4, (sn) => sn[BU(0xb8a)] === cS[BU(0xa7e)])),
        (s4 = qG(s4, (sn) => sn[BU(0x22d)])),
        (s4 = qG(s4, (sn) => sn[BU(0x7b9)])),
        (s4 = qG(s4, (sn) => sn[BU(0xd57)] && !sn[BU(0xd80)])),
        (s4 = qG(s4, (sn) => !sn[BU(0xd80)])),
        qG(s4, (sn) => !![]);
      iy && iy[BU(0xa46)](kj);
      for (let sn = 0x0; sn < s3[BU(0x680)]; sn++) {
        s3[sn][BU(0xa46)](kj);
      }
      if (p8[BU(0x1d7)]) {
        kj[BU(0x9fa)]();
        for (let so = 0x0; so < iw[BU(0x680)]; so++) {
          const sp = iw[so];
          if (sp[BU(0x8ee)]) continue;
          if (sp[BU(0x22e)]) {
            kj[BU(0x181)](),
              kj[BU(0x609)](sp["x"], sp["y"]),
              kj[BU(0xd4b)](sp[BU(0x640)]);
            if (!sp[BU(0x664)])
              kj[BU(0x778)](-sp[BU(0xc80)], -0xa, sp[BU(0xc80)] * 0x2, 0x14);
            else {
              kj[BU(0xbd5)](-sp[BU(0xc80)], -0xa),
                kj[BU(0x6e1)](-sp[BU(0xc80)], 0xa);
              const sq = 0xa + sp[BU(0x664)] * sp[BU(0xc80)] * 0x2;
              kj[BU(0x6e1)](sp[BU(0xc80)], sq),
                kj[BU(0x6e1)](sp[BU(0xc80)], -sq),
                kj[BU(0x6e1)](-sp[BU(0xc80)], -0xa);
            }
            kj[BU(0x242)]();
          } else
            kj[BU(0xbd5)](sp["x"] + sp[BU(0xc80)], sp["y"]),
              kj[BU(0x663)](sp["x"], sp["y"], sp[BU(0xc80)], 0x0, l0);
        }
        (kj[BU(0x290)] = 0x2), (kj[BU(0x44c)] = BU(0x577)), kj[BU(0x2dc)]();
      }
      const s5 = p8[BU(0x3d5)] ? 0x1 / qL() : 0x1;
      for (let sr = 0x0; sr < iw[BU(0x680)]; sr++) {
        const ss = iw[sr];
        !ss[BU(0xd57)] && ss[BU(0x2df)] && lY(ss, kj, s5);
      }
      for (let st = 0x0; st < iw[BU(0x680)]; st++) {
        const su = iw[st];
        su[BU(0x700)] && su[BU(0xd0f)](kj, s5);
      }
      const s6 = pN / 0x12;
      kj[BU(0x181)](),
        (kj[BU(0x290)] = 0x7),
        (kj[BU(0x44c)] = BU(0x155)),
        (kj[BU(0x3e3)] = kj[BU(0x8f6)] = BU(0xabf));
      for (let sv = iF[BU(0x680)] - 0x1; sv >= 0x0; sv--) {
        const sw = iF[sv];
        sw["a"] -= pN / 0x1f4;
        if (sw["a"] <= 0x0) {
          iF[BU(0xb0d)](sv, 0x1);
          continue;
        }
        (kj[BU(0x915)] = sw["a"]), kj[BU(0x2dc)](sw[BU(0x5e7)]);
      }
      kj[BU(0x242)]();
      if (p8[BU(0x7de)])
        for (let sx = iz[BU(0x680)] - 0x1; sx >= 0x0; sx--) {
          const sy = iz[sx];
          (sy["x"] += sy["vx"] * s6),
            (sy["y"] += sy["vy"] * s6),
            (sy["vy"] += 0.35 * s6);
          if (sy["vy"] > 0xa) {
            iz[BU(0xb0d)](sx, 0x1);
            continue;
          }
          kj[BU(0x181)](),
            kj[BU(0x609)](sy["x"], sy["y"]),
            (kj[BU(0x915)] = 0x1 - Math[BU(0x137)](0x0, sy["vy"] / 0xa)),
            kj[BU(0xd3b)](sy[BU(0xc80)], sy[BU(0xc80)]),
            sy[BU(0x5f0)] !== void 0x0
              ? pG(kj, sy[BU(0x5f0)], 0x15, BU(0x4a5), 0x2, ![], sy[BU(0xc80)])
              : (kj[BU(0xd4b)](sy[BU(0x640)]),
                pD(kj, BU(0xc10) + sy[BU(0xc80)], 0x1e, 0x1e, function (sz) {
                  const BV = BU;
                  sz[BV(0x609)](0xf, 0xf), nz(sz);
                })),
            kj[BU(0x242)]();
        }
      kj[BU(0x242)]();
      if (iy && p8[BU(0xa6a)] && !p8[BU(0x7b4)]) {
        kj[BU(0x181)](),
          kj[BU(0x609)](ki[BU(0x977)] / 0x2, ki[BU(0x4c9)] / 0x2),
          kj[BU(0xd4b)](Math[BU(0x178)](na, n9)),
          kj[BU(0xd3b)](s1, s1);
        const sz = 0x28;
        let sA = Math[BU(0xd2c)](n9, na) / kR;
        kj[BU(0x9fa)](),
          kj[BU(0xbd5)](sz, 0x0),
          kj[BU(0x6e1)](sA, 0x0),
          kj[BU(0x6e1)](sA + -0x14, -0x14),
          kj[BU(0xbd5)](sA, 0x0),
          kj[BU(0x6e1)](sA + -0x14, 0x14),
          (kj[BU(0x290)] = 0xc),
          (kj[BU(0x3e3)] = BU(0xbb8)),
          (kj[BU(0x8f6)] = BU(0xbb8)),
          (kj[BU(0x915)] =
            sA < 0x64 ? Math[BU(0x137)](sA - 0x32, 0x0) / 0x32 : 0x1),
          (kj[BU(0x44c)] = BU(0xc62)),
          kj[BU(0x2dc)](),
          kj[BU(0x242)]();
      }
      kj[BU(0x181)](),
        kj[BU(0xd3b)](s1, s1),
        kj[BU(0x609)](0x28, 0x1e + 0x32),
        kj[BU(0x477)](0.85);
      for (let sB = 0x0; sB < pK[BU(0x680)]; sB++) {
        const sC = pK[sB];
        if (sB > 0x0) {
          const sD = lI(Math[BU(0x137)](sC[BU(0xa7f)] - 0.5, 0x0) / 0.5);
          kj[BU(0x609)](0x0, (sB === 0x0 ? 0x46 : 0x41) * (0x1 - sD));
        }
        kj[BU(0x181)](),
          sB > 0x0 &&
            (kj[BU(0x609)](lI(sC[BU(0xa7f)]) * -0x190, 0x0),
            kj[BU(0x477)](0.85)),
          kj[BU(0x181)](),
          lZ(sC, kj, !![]),
          (sC["id"] = (sC[BU(0xa13)] && sC[BU(0xa13)]["id"]) || -0x1),
          sC[BU(0xa46)](kj),
          (sC["id"] = -0x1),
          kj[BU(0x242)](),
          sC[BU(0x6d5)] !== void 0x0 &&
            (kj[BU(0x181)](),
            kj[BU(0xd4b)](sC[BU(0x6d5)]),
            kj[BU(0x609)](0x20, 0x0),
            kj[BU(0x9fa)](),
            kj[BU(0xbd5)](0x0, 0x6),
            kj[BU(0x6e1)](0x0, -0x6),
            kj[BU(0x6e1)](0x6, 0x0),
            kj[BU(0x735)](),
            (kj[BU(0x290)] = 0x4),
            (kj[BU(0x3e3)] = kj[BU(0x8f6)] = BU(0xbb8)),
            (kj[BU(0x44c)] = BU(0xc96)),
            kj[BU(0x2dc)](),
            (kj[BU(0xd2d)] = BU(0x155)),
            kj[BU(0x5a4)](),
            kj[BU(0x242)]()),
          kj[BU(0x242)]();
      }
      kj[BU(0x242)]();
    }
    function qG(s1, s2) {
      const BW = us,
        s3 = [];
      for (let s4 = 0x0; s4 < s1[BW(0x680)]; s4++) {
        const s5 = s1[s4];
        if (s2[BW(0xb65)] !== void 0x0 ? s2(s5) : s5[s2]) s5[BW(0xa46)](kj);
        else s3[BW(0x46a)](s5);
      }
      return s3;
    }
    var qH = 0x0,
      qI = 0x0;
    function qJ() {
      const BX = us;
      kj[BX(0x609)](ki[BX(0x977)] / 0x2, ki[BX(0x4c9)] / 0x2);
      let s1 = qK();
      kj[BX(0xd3b)](s1, s1),
        kj[BX(0x609)](-pq, -pr),
        p8[BX(0xd74)] && kj[BX(0x609)](qH, qI);
    }
    function qK() {
      const BY = us;
      return Math[BY(0x137)](ki[BY(0x977)] / d0, ki[BY(0x4c9)] / d1) * qL();
    }
    function qL() {
      return ne / pu;
    }
    kX(), pQ();
    const qM = {};
    (qM[us(0xb65)] = us(0xc95)),
      (qM[us(0x428)] = us(0x7ca)),
      (qM[us(0x451)] = us(0x198));
    const qN = {};
    (qN[us(0xb65)] = us(0xb35)),
      (qN[us(0x428)] = us(0x678)),
      (qN[us(0x451)] = us(0x3b7));
    const qO = {};
    (qO[us(0xb65)] = us(0x5b5)),
      (qO[us(0x428)] = us(0x5b0)),
      (qO[us(0x451)] = us(0x9cb));
    const qP = {};
    (qP[us(0xb65)] = us(0x7c8)),
      (qP[us(0x428)] = us(0x375)),
      (qP[us(0x451)] = us(0x8ec));
    const qQ = {};
    (qQ[us(0xb65)] = us(0x7da)),
      (qQ[us(0x428)] = us(0x22a)),
      (qQ[us(0x451)] = us(0x184));
    const qR = {};
    (qR[us(0xb65)] = us(0x1be)),
      (qR[us(0x428)] = us(0x7eb)),
      (qR[us(0x451)] = us(0x4ed));
    const qS = {};
    (qS[us(0x871)] = qM),
      (qS[us(0x9dd)] = qN),
      (qS[us(0xd0d)] = qO),
      (qS[us(0x8f4)] = qP),
      (qS[us(0x2c9)] = qQ),
      (qS[us(0x7e9)] = qR);
    var qT = qS;
    if (window[us(0x599)][us(0xa4)] !== us(0xb2a))
      for (let s1 in qT) {
        const s2 = qT[s1];
        s2[us(0x428)] = s2[us(0x428)]
          [us(0xce2)](us(0xb2a), us(0x3f0))
          [us(0xce2)](us(0xc8f), us(0xbdc));
      }
    var qU = document[us(0x8c1)](us(0x28d)),
      qV = document[us(0x8c1)](us(0xc2e)),
      qW = 0x0;
    for (let s3 in qT) {
      const s4 = qT[s3],
        s5 = document[us(0xa1f)](us(0x2a4));
      s5[us(0x623)] = us(0xcd7);
      const s6 = document[us(0xa1f)](us(0x42b));
      s6[us(0xc86)](us(0x2dc), s4[us(0xb65)]), s5[us(0x188)](s6);
      const s7 = document[us(0xa1f)](us(0x42b));
      (s7[us(0x623)] = us(0x864)),
        (s4[us(0xb62)] = 0x0),
        (s4[us(0x283)] = function (s8) {
          const BZ = us;
          (qW -= s4[BZ(0xb62)]),
            (s4[BZ(0xb62)] = s8),
            (qW += s8),
            k8(s7, kh(s8, BZ(0x80a))),
            s5[BZ(0x188)](s7);
          const s9 = BZ(0x92e) + kh(qW, BZ(0x80a)) + BZ(0x876);
          k8(qX, s9), k8(qV, s9);
        }),
        (s4[us(0x758)] = function () {
          const C0 = us;
          s4[C0(0x283)](0x0), s7[C0(0x256)]();
        }),
        (s5[us(0x6fc)][us(0x18c)] = s4[us(0x451)]),
        qU[us(0x188)](s5),
        (s5[us(0x21c)] = function () {
          const C1 = us,
            s8 = qU[C1(0x8c1)](C1(0x831));
          if (s8 === s5) return;
          s8 && s8[C1(0x7d8)][C1(0x256)](C1(0xb21)),
            this[C1(0x7d8)][C1(0xab7)](C1(0xb21)),
            r0(s4[C1(0x428)]),
            (hD[C1(0x41a)] = s3);
        }),
        (s4["el"] = s5);
    }
    var qX = document[us(0xa1f)](us(0x42b));
    (qX[us(0x623)] = us(0x523)), qU[us(0x188)](qX);
    if (!![]) {
      qY();
      let s8 = Date[us(0x213)]();
      setInterval(function () {
        pM - s8 > 0x2710 && (qY(), (s8 = pM));
      }, 0x3e8);
    }
    function qY() {
      const C2 = us;
      fetch(C2(0x34f))
        [C2(0x5af)]((s9) => s9[C2(0xb1a)]())
        [C2(0x5af)]((s9) => {
          const C3 = C2;
          for (let sa in s9) {
            const sb = qT[sa];
            sb && sb[C3(0x283)](s9[sa]);
          }
        })
        [C2(0x1af)]((s9) => {
          const C4 = C2;
          console[C4(0x7d7)](C4(0x913), s9);
        });
    }
    var qZ = window[us(0x2a7)] || window[us(0x599)][us(0x122)] === us(0x580);
    if (qZ) hV(window[us(0x599)][us(0x72a)][us(0xce2)](us(0xa95), "ws"));
    else {
      const s9 = qT[hD[us(0x41a)]];
      if (s9) s9["el"][us(0x784)]();
      else {
        let sa = "EU";
        fetch(us(0x27c))
          [us(0x5af)]((sb) => sb[us(0xb1a)]())
          [us(0x5af)]((sb) => {
            const C5 = us;
            if (["NA", "SA"][C5(0x669)](sb[C5(0x20c)])) sa = "US";
            else ["AS", "OC"][C5(0x669)](sb[C5(0x20c)]) && (sa = "AS");
          })
          [us(0x1af)]((sb) => {
            const C6 = us;
            console[C6(0xb12)](C6(0xa99));
          })
          [us(0x2bc)](function () {
            const C7 = us,
              sb = [];
            for (let sd in qT) {
              const se = qT[sd];
              se[C7(0xb65)][C7(0x7cc)](sa) && sb[C7(0x46a)](se);
            }
            const sc =
              sb[Math[C7(0x35d)](Math[C7(0xba1)]() * sb[C7(0x680)])] ||
              qT[C7(0x8eb)];
            console[C7(0xb12)](C7(0xcb4) + sa + C7(0x180) + sc[C7(0xb65)]),
              sc["el"][C7(0x784)]();
          });
      }
    }
    (document[us(0x8c1)](us(0x9a))[us(0x6fc)][us(0x9a7)] = us(0x4eb)),
      kA[us(0x7d8)][us(0xab7)](us(0x254)),
      kB[us(0x7d8)][us(0x256)](us(0x254)),
      (window[us(0x74)] = function () {
        il(new Uint8Array([0xff]));
      });
    function r0(sb) {
      const C8 = us;
      clearTimeout(kF), iu();
      const sc = {};
      (sc[C8(0x428)] = sb), (hU = sc), kg(!![]);
    }
    window[us(0x7e3)] = r0;
    var r1 = null;
    function r2(sb) {
      const C9 = us;
      if (!sb || typeof sb !== C9(0xd04)) {
        console[C9(0xb12)](C9(0xb19));
        return;
      }
      if (r1) r1[C9(0x3bb)]();
      const sc = sb[C9(0x944)] || {},
        sd = {};
      (sd[C9(0xc3)] = C9(0x560)),
        (sd[C9(0x751)] = C9(0x39f)),
        (sd[C9(0x72e)] = C9(0x1d2)),
        (sd[C9(0x98c)] = C9(0xa26)),
        (sd[C9(0xa25)] = !![]),
        (sd[C9(0x40e)] = !![]),
        (sd[C9(0x68e)] = ""),
        (sd[C9(0x333)] = ""),
        (sd[C9(0x848)] = !![]),
        (sd[C9(0x45b)] = !![]);
      const se = sd;
      for (let sk in se) {
        (sc[sk] === void 0x0 || sc[sk] === null) && (sc[sk] = se[sk]);
      }
      const sf = [];
      for (let sl in sc) {
        se[sl] === void 0x0 && sf[C9(0x46a)](sl);
      }
      sf[C9(0x680)] > 0x0 &&
        console[C9(0xb12)](C9(0xa9b) + sf[C9(0x7db)](",\x20"));
      sc[C9(0x68e)] === "" && sc[C9(0x333)] === "" && (sc[C9(0x68e)] = "x");
      (sc[C9(0x751)] = hP[sc[C9(0x751)]] || sc[C9(0x751)]),
        (sc[C9(0x98c)] = hP[sc[C9(0x98c)]] || sc[C9(0x98c)]);
      const sg = nN(
        C9(0xbc3) +
          sc[C9(0xc3)] +
          C9(0x9f7) +
          sc[C9(0x751)] +
          C9(0x7d1) +
          (sc[C9(0x72e)]
            ? C9(0x263) +
              sc[C9(0x72e)] +
              "\x22\x20" +
              (sc[C9(0x98c)] ? C9(0x5fd) + sc[C9(0x98c)] + "\x22" : "") +
              C9(0xc37)
            : "") +
          C9(0xc6d)
      );
      (r1 = sg),
        (sg[C9(0x3bb)] = function () {
          const Ca = C9;
          document[Ca(0xc39)][Ca(0x7d8)][Ca(0x256)](Ca(0x9aa)),
            sg[Ca(0x256)](),
            (r1 = null);
        }),
        (sg[C9(0x8c1)](C9(0xb2c))[C9(0x21c)] = sg[C9(0x3bb)]);
      const sh = sg[C9(0x8c1)](C9(0x22b)),
        si = [],
        sj = [];
      for (let sm in sb) {
        if (sm === C9(0x944)) continue;
        const sn = sb[sm];
        let so = [];
        const sp = Array[C9(0x37e)](sn);
        let sq = 0x0;
        if (sp)
          for (let sr = 0x0; sr < sn[C9(0x680)]; sr++) {
            const ss = sn[sr],
              st = dF[ss];
            if (!st) {
              si[C9(0x46a)](ss);
              continue;
            }
            sq++, so[C9(0x46a)]([ss, void 0x0]);
          }
        else
          for (let su in sn) {
            const sv = dF[su];
            if (!sv) {
              si[C9(0x46a)](su);
              continue;
            }
            const sw = sn[su];
            (sq += sw), so[C9(0x46a)]([su, sw]);
          }
        if (so[C9(0x680)] === 0x0) continue;
        sj[C9(0x46a)]([sq, sm, so, sp]);
      }
      sc[C9(0x45b)] && sj[C9(0xd6c)]((sx, sy) => sy[0x0] - sx[0x0]);
      for (let sx = 0x0; sx < sj[C9(0x680)]; sx++) {
        const [sy, sz, sA, sB] = sj[sx];
        sc[C9(0x848)] && !sB && sA[C9(0xd6c)]((sF, sG) => sG[0x1] - sF[0x1]);
        let sC = "";
        sc[C9(0xa25)] && (sC += sx + 0x1 + ".\x20");
        sC += sz;
        const sD = nN(C9(0x99) + sC + C9(0x57f));
        sh[C9(0x188)](sD);
        const sE = nN(C9(0xaf6));
        for (let sF = 0x0; sF < sA[C9(0x680)]; sF++) {
          const [sG, sH] = sA[sF],
            sI = dF[sG],
            sJ = nN(
              C9(0x755) + sI[C9(0x3ac)] + "\x22\x20" + qx(sI) + C9(0xc37)
            );
          if (!sB && sc[C9(0x40e)]) {
            const sK = sc[C9(0x68e)] + k9(sH) + sc[C9(0x333)],
              sL = nN(C9(0x3a7) + sK + C9(0x57f));
            sK[C9(0x680)] > 0x6 && sL[C9(0x7d8)][C9(0xab7)](C9(0x864)),
              sJ[C9(0x188)](sL);
          }
          (sJ[C9(0x6f7)] = sI), sE[C9(0x188)](sJ);
        }
        sh[C9(0x188)](sE);
      }
      kl[C9(0x188)](sg),
        si[C9(0x680)] > 0x0 &&
          console[C9(0xb12)](C9(0xac9) + si[C9(0x7db)](",\x20")),
        document[C9(0xc39)][C9(0x7d8)][C9(0xab7)](C9(0x9aa));
    }
    (window[us(0x8f8)] = r2),
      (document[us(0xc39)][us(0x5f3)] = function (sb) {
        const Cb = us;
        sb[Cb(0xc9a)]();
        const sc = sb[Cb(0x819)][Cb(0x976)][0x0];
        if (sc && sc[Cb(0xb8a)] === Cb(0x90f)) {
          console[Cb(0xb12)](Cb(0xd36) + sc[Cb(0xb65)] + Cb(0x5e2));
          const sd = new FileReader();
          (sd[Cb(0xa8c)] = function (se) {
            const Cc = Cb,
              sf = se[Cc(0x2e9)][Cc(0xc19)];
            try {
              const sg = JSON[Cc(0x681)](sf);
              r2(sg);
            } catch (sh) {
              console[Cc(0x7d7)](Cc(0x6a4), sh);
            }
          }),
            sd[Cb(0x98)](sc);
        }
      }),
      (document[us(0xc39)][us(0x43e)] = function (sb) {
        const Cd = us;
        sb[Cd(0xc9a)]();
      }),
      Object[us(0xada)](window, us(0x305), {
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
