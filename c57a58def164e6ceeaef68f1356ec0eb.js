const $ = (i) => document.getElementById(i);
const $_ = (i) => document.querySelector(i);
class HornexHack{
  constructor(){
    this.version = '1.7';
    this.config = {};
    this.default = {
      damageDisplay: true, // 是否启用伤害显示修改
      DDenableNumber: true, // 是否显示伤害数值而不是百分比（若可用）
      healthDisplay: true, // 是否启用血量显示
      disableChatCheck: true, // 是否禁用聊天内容检查
      autoRespawn: true, // 是否启用自动重生
      colorText: false, // 是否启用公告彩字
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
    this.save();
  }
  list(){
    for(var i = 0; i < this.configKeys.length; i++){
      var item = this.configKeys[i];
      this.addChat(`${item}: ${this.isEnabled(item)} (defaults to ${this.default[item]})`, '#ffffff');
    }
  }
  save(){
    for(var i = 0; i < this.configKeys.length; i++){
      var item = this.configKeys[i];
      localStorage.setItem(`hh${item}`, this.isEnabled(item));
    }
  }
  load(){
    for(var i = 0; i < this.configKeys.length; i++){
      var item = this.configKeys[i];
      this.setEnabled(item, localStorage.getItem(`hh${item}`));
      if(!localStorage.getItem(`hh${item}`)){
        this.config[item] = this.default[item];
        this.setEnabled(item, this.default[item]);
      }
    }
  }
  // ----- Command -----
  onload(){
    this.load();
    this.addChat(`${this.name} enabled!`);
    this.addChat('Type /help in chat box to get help');
    this.register();
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
        if(!status.includes('Kills Needed')){
          return `${name} Wave: ${status}`;
        }else{
          return `${name} Wave: ${Math.round((100 + parseFloat(prog)) * 100) / 100}%`;
        }
      default:
        return 'Not in Ultra/Super/Hyper zone';
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
              if(style.display != 'none' && that.isEnabled('autoRespawn')){
                that.respawn();
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
    $_('body > div.score-overlay > div.score-area > div.btn.continue-btn').onclick();
  }
  registerWave(){
    setInterval(() => {
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
              console.log(name + ' ' + content);
            }
          }
        });
    });
    this.chatObserver.observe(div, {
      childList: true
    });
  }
  register(){
    this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    this.registerWave();
    if(!this.chatObserver) this.registerChat();
    if(!this.dieObserver) this.registerDie();
  }
}
var hack = new HornexHack();
hack.loadStatus();
function getHP(mob, lst) {
  var tier = mob['tier'],
    type = mob['type'];
  if(mob['typeStr'].includes('centipedeBody')) type--;
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
      f = f - 0x101;
      let h = e[f];
      return h;
    }),
    b(c, d)
  );
}
function a() {
  const BK = [
    "web",
    "textAlign",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "WP4hW755jCokWRdcKchdT3ui",
    "*Gas\x20health:\x20250\x20→\x20200",
    ".changelog-btn",
    "#5ec13a",
    "toLow",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    "<div\x20class=\x22petal-count\x22></div>",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    ".ui-scale\x20select",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "fireDamageF",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "A\x20default\x20petal.",
    "ShiftLeft",
    "projDamage",
    "#634002",
    "Nitro",
    "bolder\x2012px\x20",
    "#962921",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    "15th\x20August\x202023",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    "px)",
    "#8b533f",
    "Fussy\x20Sucker",
    "Yoba_1",
    "centipedeHead",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    "horne",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "#368316",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "shadowColor",
    "Extra\x20Range",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    "remove",
    "Hornet_3",
    "scorp",
    "kicked",
    "onmousedown",
    ".minimap-dot",
    "petalRockEgg",
    "petalSuspill",
    ".xp",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    ".absorb-rarity-btns",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    "onStart",
    "documentElement",
    ";-webkit-background-position:\x20",
    ".stats",
    "*Yoba\x20health:\x20500\x20→\x20350",
    ".stats\x20.dialog-header\x20span",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    "keyAlreadyUsed",
    "#8f5f34",
    "projHealth",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    ".discord-user",
    "#ff7892",
    "nig",
    "sword",
    "\x20accounts",
    "253906KWTZJW",
    "iAbsorb",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "NSlTg",
    "FSoixsnA",
    "WP/dQbddHH0",
    "3rd\x20February\x202024",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    "credits",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "petalWing",
    "our\x20o",
    "petalCement",
    "Beetle",
    "cuYF",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "#c1a37d",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    "\x20no-icon\x22\x20",
    "drawDragon",
    "href",
    "rock",
    "bolder\x2017px\x20",
    "#a52a2a",
    "#ffe200",
    "tier",
    "green",
    "Beetle_1",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    "state",
    "W77cISkNWONdQa",
    "petalSkull",
    "ladybug",
    ".craft-rate",
    "open",
    "Favourite\x20object\x20of\x20a\x20woman.",
    "petalStickbug",
    "hide_chat",
    "),0)",
    "2772301LQYLdH",
    "KICKED!",
    "Light",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "z8kgrX3dSq",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    "Missile\x20Poison",
    "<div\x20stroke=\x22",
    "portalPoints",
    "Re-added\x20Waves.",
    "uniqueIndex",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    "hasHearts",
    "<span\x20style=\x22color:",
    "*Cotton\x20health:\x209\x20→\x2010",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "rgba(0,0,0,0.2",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "poisonT",
    "Fixed\x20Gem\x20glitch.",
    "Rock_1",
    "onclose",
    ".main",
    "vendor",
    "3220DFvaar",
    "show_bg_grid",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "targetPlayer",
    "rnex.",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "Connecting\x20to\x20",
    "Spider",
    "setValue",
    "%\x20success\x20rate",
    "starfish",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "contains",
    "Hornet\x20Egg",
    "Fire\x20Damage",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    ".copy-btn",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    ".time-alive",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "Stick",
    "hasAntenna",
    "passiveBoost",
    "iJoin",
    "nameEl",
    "snail",
    "randomUUID",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "trim",
    "Fixed\x20number\x20rounding\x20issue.",
    "tals.",
    "ondragover",
    "XCN6",
    "removeChild",
    "<div\x20class=\x22chat-item\x22></div>",
    "hpRegen",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "display",
    "Yoba\x20Egg",
    "Increases",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    "aip_complete",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "forEach",
    "isPet",
    "babyAnt",
    "worldW",
    "rgb(255,\x2043,\x20117)",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    "onmouseleave",
    "petalPowder",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "petalRice",
    "Connected!",
    ".hyper-buy",
    "(auto\x20reloading\x20in\x20",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    "right_align_petals",
    "side",
    "*Gas\x20poison:\x2030\x20→\x2040",
    ".discord-btn",
    "#9fab2d",
    "Spider_2",
    "rainbow-text",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "hide-zone-mobs",
    "Heal",
    "#406150",
    "1998256OxsvrH",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "rkJNdF",
    "values",
    "cDHZ",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    "petalSwastika",
    "eyeY",
    "rgba(0,\x200,\x200,\x200.2)",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "getUint16",
    "Hornet_5",
    "*Super:\x20150+",
    "petalDrop",
    "wig",
    "iAngle",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    "drawImage",
    "els",
    "makeSponge",
    "Rice",
    "mouse",
    "iReqUserProfile",
    "updatePos",
    "files",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    "<div\x20",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    ".stats-btn",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    "copy",
    "#c9b46e",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    "#1ea761",
    "New\x20mob:\x20Turtle",
    "Redesigned\x20some\x20mobs.",
    "isArray",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    "location",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "server",
    "\x20Pym\x20Particle.",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    "zmkhtdVdSq",
    "iSwapPetalRow",
    "\x27s\x20profile...",
    "KeyM",
    ".common",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "absolute",
    "backgroundImage",
    "\x22\x20stroke=\x22(",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "iMood",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    "code",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    "\x22></span></div>",
    "decode",
    "fillRect",
    "containerDialog",
    "15th\x20July\x202023",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "shlong",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    "mousedown",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "n\x20war",
    ".absorb-btn",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    "wave",
    "\x22></div>\x0a\x09\x09\x09",
    "Soak\x20Duration",
    "centipedeBodyPoison",
    "thirdEye",
    "***",
    "tumbleweed",
    "pickupRangeTiers",
    "moveSpeed",
    "flipDir",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    ".lb-btn",
    "show_population",
    "splice",
    "KeyU",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "moveFactor",
    "eu_ffa1",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    "Hornet_1",
    "i\x20need\x20999\x20billion\x20subs",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    ";\x20-o-background-position:",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    ".bar",
    "#82b11e",
    "hpRegenPerSecF",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    "*Ultra:\x201-5",
    "Wave",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    "split",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "ArrowUp",
    "now",
    "W43cOSoOW4lcKG",
    ".rewards-btn",
    "#be342a",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    ".dialog-content",
    "Summons\x20the\x20power\x20of\x20wind.",
    "Shell",
    "gambleList",
    "(81*",
    "26th\x20June\x202023",
    "1684529uqEdir",
    "image/png",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "\x20radians",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "weight",
    "Gives\x20you\x20a\x20shield.",
    "#754a8f",
    "\x22></div>",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    "Yourself",
    "deadT",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "onclick",
    ".lottery\x20.dialog-content",
    ".username-input",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    "Password\x20downloaded!",
    "Range",
    "\x20XP",
    "STOP!",
    "petalChromosome",
    "lightningBouncesTiers",
    "Dragon_1",
    "📜\x20",
    "des",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    ".inventory-rarities",
    "s...)",
    "setTargetEl",
    ";-moz-background-position:\x20",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "*Rock\x20health:\x20120\x20→\x20150",
    "#eb4755",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "Ghost",
    "onkeyup",
    "petalCoffee",
    "New\x20petal:\x20Wig.",
    ".username-area",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "#af6656",
    "zert.pro",
    "31st\x20July\x202023",
    "progressEl",
    "tail",
    "\x20!important;}",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "Mob\x20Size\x20Change",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    "orbitRange",
    "*Removed\x20Ultra\x20wave.",
    "\x20You\x20",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "#735d5f",
    "Leaf",
    "discord\x20err:",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "New\x20score\x20formula.",
    "Breed\x20Range",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    "<div\x20class=\x22chat-name\x22></div>",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    "#5849f5",
    "Added\x20Leave\x20Game\x20button.",
    "Shield",
    "hsl(60,60%,60%)",
    "\x20clie",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "hpRegenPerSec",
    "crab",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    ";position:absolute;top:",
    "Pet\x20Heal",
    ".absorb\x20.dialog-header\x20span",
    "#fbb257",
    "#a44343",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "data-icon",
    "Rock_4",
    "rgba(0,0,0,0.35)",
    "Health\x20Depletion",
    "{background-color:",
    "#328379",
    "dir",
    "*Peas\x20damage:\x2012\x20→\x2015",
    "petalBubble",
    "Fixed\x20duplicate\x20drops.",
    "soakTime",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    "KeyA",
    "numeric",
    "6fCH",
    "#ff94c9",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "2nd\x20July\x202023",
    "isTrusted",
    "offsetHeight",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "#6265eb",
    ".build-load-btn",
    "#4343a4",
    "killed",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    "Game",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "Invalid\x20username.",
    "keyup",
    ".privacy-btn",
    "20th\x20January\x202024",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "tooltipDown",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    "User\x20not\x20found!",
    "tail_outline",
    "shift",
    "rotate",
    ".grid-cb",
    "Bee",
    "#a2dd26",
    "User",
    "substr",
    "style=\x22background-position:\x20",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    "4\x20yummy\x20poisonous\x20balls.",
    "└─\x20",
    "Beetle_4",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    "petalSword",
    "projSpeed",
    "iLeaveGame",
    "#e94034",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "7th\x20July\x202023",
    "isStatic",
    "show_debug_info",
    "repeat",
    "us_ffa1",
    "copyright\x20striked",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "No\x20username\x20provided.",
    "1st\x20April\x202024",
    ".lottery-users",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "shop",
    "\x20Blue",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "getFloat32",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "execCommand",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "Waveroom",
    ".tv-prev",
    "#34f6ff",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "fonts",
    "col",
    "hideTimer",
    "rgb(77,\x2082,\x20227)",
    "#D2D1CD",
    "Rock",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    "&quot;",
    "isSupporter",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    "W5OTW6uDWPScW5eZ",
    "username",
    "as_ffa2",
    "#000000",
    "25th\x20January\x202024",
    ".petals",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    "*Cotton\x20health:\x2012\x20→\x2015",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "100%",
    "oiynC",
    "Dragon_3",
    "start",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    "petalExpander",
    "9iYdxUh",
    ".download-btn",
    "update",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "18th\x20July\x202023",
    "Nerfed\x20Spider\x20Yoba.",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "#222",
    "isPortal",
    "#853636",
    "Video\x20AD\x20success!",
    ".id-group",
    "rad)",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "#7af54c",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    "Spawn\x20zone\x20changes:",
    "#d0bb55",
    "Added\x20Global\x20Leaderboard.",
    ".ultra-buy",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "strokeRect",
    ".discord-area",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "22nd\x20July\x202023",
    "ing\x20o",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "petalsLeft",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    "rgb(222,\x2031,\x2031)",
    "<style>\x0a\x09\x09",
    "Jellyfish",
    "accountId",
    "spin",
    "fake",
    "10th\x20August\x202023",
    "hsl(60,60%,",
    "static",
    ".inventory-petals",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    "Soldier\x20Ant_3",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    "clip",
    "petalWeb",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "%nick%",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    "reloadT",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "<div\x20class=\x22chat-text\x22>",
    ".collected-petals",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "regenAfterHp",
    "W5T8c2BdUs/cJHBcR8o4uG",
    "bush",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    "drawShell",
    "\x0a\x09</div>",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    "scale(",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    "#ff7380",
    "Expander",
    ".minimap-cross",
    "transformOrigin",
    "show_scoreboard",
    "Legendary",
    "petalShrinker",
    "#333333",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "Peas",
    "sendBadMsg",
    "/profile",
    "W7/cOmkwW4lcU3dcHKS",
    "poisonDamage",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "MOVE\x20AWAY!!",
    "*Light\x20damage:\x2012\x20→\x2010",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "*Legendary:\x20125\x20→\x20100",
    "accountNotFound",
    "i\x20make\x20cool\x20videos",
    "byteLength",
    "player_id",
    "nAngle",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "sunflower",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    "download",
    "getHurtColor",
    "ondrop",
    ".connecting",
    "misReflectDmgFactor",
    "adplayer",
    "parse",
    "connect",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    ":scope\x20>\x20.petal",
    "addToInventory",
    "hide-all",
    "#ff3333",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    "petHeal",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "Has\x20fungal\x20infection\x20gg",
    "3336680ZmjFAG",
    "\x22></div>\x0a\x09\x09",
    ".level-progress",
    "mobile",
    "Increased\x20Ultra\x20key\x20price.",
    "<div\x20class=\x22petal-container\x22></div>",
    "0@x9",
    "506968DNWsdN",
    "titleColor",
    "unset",
    "\x20and\x20",
    "index",
    "prog",
    "rgb(126,\x20239,\x20109)",
    "Mob\x20Rotation",
    "*Super:\x20180",
    "bg-rainbow",
    "Failed\x20to\x20find\x20region.",
    "show_damage",
    "Nerfed\x20Ant\x20Holes:",
    "makeSpiderLegs",
    ".spawn-zones",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "4th\x20September\x202023",
    "*Missile\x20damage:\x2050\x20→\x2055",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "13th\x20July\x202023",
    "cEca",
    ".login-btn",
    "Beetle_3",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "#695118",
    "\x20(Lvl\x20",
    "bone_outline",
    "Space",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    "#69371d",
    "queenAnt",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    "ll\x20yo",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "*Snail\x20health:\x2040\x20→\x2045",
    "blue",
    "Queen\x20Ant",
    "Ears",
    "readyState",
    "18th\x20September\x202023",
    "has\x20ended.",
    "#fdda40",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    "719574lHbJUW",
    "wss://us1.hornex.pro",
    "17th\x20June\x202023",
    "Rare",
    "released",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "fixAngle",
    "sort",
    "dontExpand",
    "wss://as1.hornex.pro",
    "moveTo",
    "result",
    "release",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "It\x20burns.",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    "no\x20sub,\x20no\x20gg",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "sortGroups",
    "Fleepoint",
    "*Swastika\x20health:\x2020\x20→\x2025",
    ".damage-cb",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    "2-digit",
    "rgb(166\x2056\x20237)",
    "cantPerformAction",
    "</div><div\x20class=\x22log-line\x22></div>",
    "Hornet_2",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "devicePixelRatio",
    "https://www.instagram.com/zertalious",
    "entRot",
    "lightningDmgF",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    ".circle",
    "ANKUAsHKW5LZmq",
    "%;\x22\x20stroke=\x22",
    "\x20$1",
    "New\x20mob:\x20Fossil.",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    ".reload-timer",
    "sponge",
    "WAVE",
    "hsla(0,0%,100%,0.5)",
    "useTimeTiers",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "&#Uz",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "petalPollen",
    "reqFailed",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "#222222",
    "Arrow",
    ".hide-chat-cb",
    "show_grid",
    ".ads",
    "26th\x20August\x202023",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "c)H[",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "arrested\x20for\x20plagerism",
    "#b58500",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "#d3d14f",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    "Poo",
    "timeJoined",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "acker",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    "Ghost_5",
    "#c69a2c",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    "tierStr",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "Buffed\x20Gem.",
    "5th\x20January\x202024",
    "11th\x20July\x202023",
    "armor",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "toString",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    "318596CJWdQw",
    "button",
    "Ghost_7",
    "nigersaurus",
    "petCount",
    "WRS8bSkQW4RcSLDU",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "hurtT",
    "12th\x20July\x202023",
    "petRoamFactor",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "bee",
    "lobbyClosing",
    "changeLobby",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "Soldier\x20Ant_2",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "%/s",
    "*Heavy\x20damage:\x209\x20→\x2010",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "ArrowDown",
    "22nd\x20January\x202024",
    "color",
    "g\x20on\x20",
    "*Bone\x20armor:\x204\x20→\x205",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    "innerHTML",
    "*Turtle\x20health\x20500\x20→\x20600",
    "More\x20wave\x20changes:",
    "running...",
    "INPUT",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    ".builds\x20.dialog-content",
    "match",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    ".timer",
    "an\x20UN",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "petHealF",
    "your\x20",
    "4th\x20July\x202023",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    "Loaded\x20Build\x20#",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    "New\x20mob:\x20Tumbleweed.",
    "27th\x20July\x202023",
    "toDataURL",
    "KCsdZ",
    "right",
    "Crab",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    "Statue",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "setUint16",
    "affectMobHeal",
    ".find-user-input",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "#ff63eb",
    "isRectHitbox",
    "Crab\x20redesign.",
    "NHkBqi",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    "search",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "petalPea",
    "Wave\x20Ending...",
    "deg)\x20scale(",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    "<div\x20class=\x22slot\x22></div>",
    "getContext",
    "#8ac355",
    "Sandstorm_4",
    "classList",
    "petalLightsaber",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "\x20all\x20",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    ".debug-info",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "center",
    "startsWith",
    ".claimer",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    "#000",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "doLerpEye",
    "#854608",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "despawnTime",
    "textarea",
    "Stinger",
    "atan2",
    "WP3dRYddTJC",
    "iDepositPetal",
    "endsWith",
    "stopWhileMoving",
    "Saved\x20Build\x20#",
    "userProfile",
    "ArrowRight",
    "closePath",
    "mobKilled",
    "\x20stroke=\x22",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "W6rnWPrGWPfdbxmAWOHa",
    "New\x20petal:\x20Sponge",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "Stick\x20does\x20not\x20expand\x20now.",
    "hsl(60,60%,30%)",
    "buffer",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "error",
    ".credits",
    "?dev",
    "M28",
    "Ant\x20Egg",
    "KeyF",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "wss://hornex-",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    "loginFailed",
    ".show-scoreboard-cb",
    "*Pincer\x20damage:\x205\x20→\x206",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "Spider_3",
    ".scores",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "#aaaaaa",
    "parentNode",
    "json",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    "subscribe\x20for\x20999\x20super\x20petals",
    ".loader",
    "bezierCurveTo",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    "fontSize",
    "timePlayed",
    "Reduced\x20Wave\x20duration.",
    "petal",
    "#d3bd46",
    "indexOf",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "uiScale",
    "Damage",
    "Dragon\x20Egg",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "Added\x20Waves.",
    "Rock_6",
    "isTanky",
    "Increases\x20flower\x27s\x20health\x20power.",
    "bone",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    "Nerfs:",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    "hpAlpha",
    "<div\x20class=\x22petal-icon\x22\x20",
    "clientWidth",
    "isDevelopmentMode",
    "*Powder\x20health:\x2010\x20→\x2015",
    ".menu",
    "kbps",
    ".discord-avatar",
    "#a58368",
    "*Reduced\x20mob\x20count.",
    "lient",
    "Ghost_6",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    "runSpeed",
    "hasSwastika",
    "#400",
    ".low-quality-cb",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "cactus",
    ".video",
    ".builds",
    "Sandstorm_5",
    "count",
    "#654a19",
    "W6RcRmo0WR/cQSo1W4PifG",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "moveCounter",
    "chain",
    ".credits-btn",
    "*Snail\x20damage:\x2010\x20→\x2015",
    "Centipede",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "consumeProjDamageF",
    "Kicked!\x20(reason:\x20",
    "Ghost_1",
    "waveShowTimer",
    "hide-icons",
    "u\x20hav",
    ".inventory",
    "onmouseup",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    "playerList",
    "*Peas\x20damage:\x2010\x20→\x2012",
    "Gas",
    "Mythic",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    "soldierAntFire",
    "Take\x20Down\x20Time",
    "background",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "canSkipRen",
    "30th\x20June\x202023",
    "petalArrow",
    "#15cee5",
    "#f22",
    "petalStick",
    "ontouchend",
    "gridColumn",
    "WOziW7b9bq",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    "Health",
    "antHoleFire",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "\x20Ultra",
    "28th\x20December\x202023",
    "cos",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "powderPath",
    "petalRose",
    "isSwastika",
    "7th\x20October\x202023",
    "projAngle",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    "eyeX",
    "Antennae",
    ".waveroom-info",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    "New\x20mob:\x20Nigersaurus.",
    "#cccccc",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "petalSnail",
    "renderBelowEverything",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "[data-icon]",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "oncontextmenu",
    "Balancing:",
    "Honey\x20factory.",
    "lieOnGroundTime",
    "\x20at\x20y",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    "Preroll\x20state:\x20",
    "oHealth",
    "Sandstorm_6",
    "clientY",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "#a17c4c",
    "div",
    "Yoba",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    "Dragon\x20Nest",
    "Flower\x20Health",
    "strokeText",
    "Orbit\x20Shlongation",
    "fillText",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "append",
    "Salt",
    "lastElementChild",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    "Super",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "Chromosome",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    "petalSpiderEgg",
    "WRbjb8oX",
    "7th\x20August\x202023",
    "text",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "*Reduced\x20drops\x20by\x2050%.",
    "Halo",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "#c76cd1",
    "></div>",
    "0\x200",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    ".clear-build-btn",
    "Yoba_5",
    "url(",
    "Grapes",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "Ant\x20Fire",
    "day",
    "uiName",
    "New\x20setting:\x20UI\x20Scale.",
    "Soaks\x20damage\x20over\x20time.",
    "turtleF",
    "Hornet",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "ctx",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "particle_heart_",
    "querySelectorAll",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    ".flower-stats",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    "26th\x20July\x202023",
    "clientHeight",
    "outlineCount",
    ".killer",
    "Added\x20maze\x20in\x20Waveroom:",
    "OFF",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    "rando",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    ".find-user-btn",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    "offsetWidth",
    "63582dPtFms",
    "#543d37",
    "clearRect",
    "defineProperty",
    "rgba(0,0,0,",
    "toFixed",
    "fixed",
    "babyAntFire",
    "Beehive",
    "#ebeb34",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "#555",
    ".inventory\x20.inventory-petals",
    "host",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "rgba(0,\x200,\x200,\x200.15)",
    "/dlPetal",
    "poopPath",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "getBoundingClientRect",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    "Snail",
    "https://www.youtube.com/@NeowmHornex",
    "labelSuffix",
    "petalRock",
    "Buffs:",
    "Added\x20banner\x20ads.",
    ".show-population-cb",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    "avacado",
    "charAt",
    "isDead",
    "Tumbleweed",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    "New\x20mob:\x20Beehive.",
    "3L$0",
    "total",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    "sadT",
    ".container",
    "createImageData",
    "Rose",
    "Lobby\x20Closing...",
    "10th\x20July\x202023",
    "bqpdSW",
    "#e6a44d",
    "#efc99b",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    "rect",
    "position",
    "28th\x20August\x202023",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    "Kills",
    "#cdbb48",
    "length",
    "𐐿𐐘𐐫𐑀𐐃",
    "dontUiRotate",
    "progress",
    "style=\x22color:",
    "ceil",
    "transition",
    "\x5c$1",
    "shieldReload",
    ".changelog",
    "*Cement\x20health:\x2080\x20→\x20100",
    "mouse2",
    "#b53229",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "Sussy\x20Discord\x20uwu",
    "labelPrefix",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    "Leave",
    "switched",
    "dandelion",
    "#fbdf26",
    "Wing",
    "breedPower",
    ".petals-picked",
    "Invalid\x20mob\x20name:\x20",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "redHealthTimer",
    "arial",
    "Yoba_4",
    "ghost",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    "ur\x20pe",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "isFakeChat",
    "ears",
    "Magnet",
    "gblcVXldOG",
    "e\x20bee",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    "#555555",
    "\x20+\x20",
    "#924614",
    "]\x22></div>",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    "#d6b936",
    "extraRangeTiers",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "14th\x20July\x202023",
    "iWithdrawPetal",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    "ArrowLeft",
    "\x20rad/s",
    "Spider\x20Cave",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "#5b4d3c",
    "fromCharCode",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    "localStorage\x20denied.",
    ".clown",
    "13th\x20August\x202023",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "dSk+d0afnmo5WODJW6zQxW",
    "d8k3BqDKF8o0WPu",
    "hasGem",
    "deadPreDraw",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "pacman",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "deleted",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    ".settings-btn",
    "successCount",
    "shieldHpLosePerSec",
    "iPercent",
    "height",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "22nd\x20June\x202023",
    "petalYinYang",
    "displayData",
    "Yoba_2",
    "month",
    "Fire\x20Ant",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    "Importing\x20data\x20file:\x20",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "*Bone\x20armor:\x208\x20→\x209",
    "WRzmW4bPaa",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "^F[@",
    "password",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    ".collected",
    "span\x202",
    "Cotton\x20bush.",
    "Web",
    "#97782b",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "Cement",
    "#c1ab00",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "B4@J",
    "lightningBounces",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    "petalShell",
    "queenAntFire",
    ".pro",
    "advanced\x20to\x20number\x20",
    "1rrAouN",
    "setCount",
    "reverse",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    "dragon",
    "stroke",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    "EU\x20#2",
    "#b28b29",
    "%!Ew",
    "strokeStyle",
    "#b5a24b",
    "ame",
    "Invalid\x20petal\x20name:\x20",
    "*Epic:\x2075\x20→\x2065",
    "healthF",
    "Boomerang.",
    "#7d5098",
    "#a82a00",
    "krBw",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    "Ancester\x20of\x20flowers.",
    "ready",
    "WARNING!",
    ".chat-input",
    "2nd\x20August\x202023",
    "Unknown\x20message\x20id:\x20",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "sameTypeColResolveOnly",
    "hsl(110,100%,10%)",
    "*Rice\x20damage:\x204\x20→\x205",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "spikePath",
    "honeyDmg",
    "PedoX",
    "dev",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    ".petal.empty",
    "http://localhost:8001/discord",
    "Basic",
    "projDamageF",
    "removeT",
    "Armor",
    "rgba(0,0,0,0.15)",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    "Gem",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "baseSize",
    "KeyL",
    "26th\x20September\x202023",
    "GBip",
    "New\x20mob:\x20Sponge",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    "Dice",
    "waveNumber",
    "turtle",
    ".build-petals",
    "setAttribute",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "scrollHeight",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "hornex-pro_300x600",
    "#29f2e5",
    ".import-btn",
    "New\x20mob:\x20Spider\x20Cave.",
    "\x20by",
    "petalAvacado",
    ".\x20Hac",
    "body",
    "Reduced\x20mobile\x20UI\x20scale.",
    "Enter",
    "orbitDance",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    "hide",
    "honeyTile",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    "warne",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    "animationDirection",
    "*Hyper:\x202%\x20→\x201%",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    "KeyG",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "flower",
    "floor",
    "avatar",
    "Passively\x20regenerates\x20your\x20health.",
    "altKey",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    "#e05748",
    "Mob\x20",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    ".craft-btn",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "hornet",
    "20th\x20July\x202023",
    ".absorb\x20.dialog-content",
    "anti_spam",
    "wn\x20ri",
    "enable_kb_movement",
    "goofy\x20ahh\x20insect\x20robbery",
    "arraybuffer",
    "RuinedLiberty",
    "Damage\x20Reflection",
    "29th\x20January\x202024",
    "*Fire\x20health:\x2070\x20→\x2080",
    "#bb3bc2",
    "boostStrength",
    "*Snail\x20health:\x2045\x20→\x2050",
    "hsl(110,100%,60%)",
    "nickname",
    "Extremely\x20slow\x20sussy\x20mob.",
    ".screen",
    "\x20downloaded!",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "14th\x20August\x202023",
    "Loading\x20video\x20ad...",
    "#fff0b8",
    "Faster",
    "Desert\x20Centipede",
    "Shield\x20Reuse\x20Cooldown",
    ".switch-btn",
    ".lottery",
    "isConnected",
    "barEl",
    "isLightning",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "unnamed",
    "#feffc9",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "\x0a4th\x20May\x202024\x0aFixed\x20a\x20player\x20dupe\x20bug.\x20\x0aBalances:\x0a*Taco\x20healing:\x209\x20→\x2010\x0a*Sunflower\x20shield:\x201\x20→\x202.5\x0a*Shell\x20shield:\x208\x20→\x2012\x0a*Buffed\x20Yoba\x20Egg\x20by\x2050%\x0a",
    "25th\x20July\x202023",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    "ount\x20",
    "Kills\x20Needed",
    "Powder",
    "uiX",
    "petalStinger",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "Soldier\x20Ant_6",
    "24th\x20August\x202023",
    "W7dcP8k2W7ZcLxtcHv0",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    "isSpecialWave",
    "top",
    "getElementById",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "isPassiveAggressive",
    "#ffe667",
    "*Iris\x20poison:\x2045\x20→\x2050",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "target",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "joinedGame",
    "Bush",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    "24th\x20January\x202024",
    "CCofC2RcTG",
    "guardian",
    ".zone-name",
    "targetEl",
    "flowerPoison",
    "Spider_5",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    "Added\x20video\x20ad.",
    "Missile\x20Damage",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    "#ffd363",
    "isRetard",
    "#493911",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    "Soldier\x20Ant_1",
    "petalDandelion",
    "centipedeHeadDesert",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "*Rose\x20heal:\x2013\x20→\x2011",
    "textEl",
    "*Heavy\x20health:\x20450\x20→\x20500",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "23rd\x20January\x202024",
    "have\x20",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    "Increases\x20petal\x20pickup\x20range.",
    ".tooltips",
    "name",
    "invalid",
    "#a07f53",
    "<div\x20class=\x22petal\x20tier-",
    "isHudPetal",
    "reason:\x20",
    "data",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "5th\x20August\x202023",
    "*Gas\x20health:\x20140\x20→\x20250",
    "Beetle_6",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "doShow",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    "wasDrawn",
    "*Arrow\x20damage:\x203\x20→\x204",
    "├─\x20",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    "[2tB",
    "#3f1803",
    "asdfadsf",
    "Poison",
    "<option\x20value=\x22",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "shieldRegenPerSec",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "#eeeeee",
    "Petal\x20",
    "#634418",
    "*Reduced\x20Shield\x20regen\x20time.",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    ".fixed-name-cb",
    "d\x20abs",
    "></di",
    "e=\x22Yo",
    "startEl",
    "3rd\x20August\x202023",
    "*Snail\x20Health:\x20180\x20→\x20120",
    "Body",
    "W5bKgSkSW78",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "fireDamage",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "insert\x20something\x20here...",
    "petalSalt",
    "type",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "US\x20#2",
    "nLrqsbisiv0SrmoD",
    "can\x20s",
    "#f54ce7",
    "orb\x20a",
    "#999",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    ".player-list-btn",
    "Absorb",
    "setPos",
    "petalCactus",
    "Common",
    "arc",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    "onkeydown",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "#fc5c5c",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    "tile_",
    "iReqGlb",
    "shootLightning",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "#709e45",
    "discord_data",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    "*Heavy\x20health:\x20500\x20→\x20600",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    ".tooltip",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "webSizeTiers",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "#f55",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    "keys",
    "shieldRegenPerSecF",
    "*Unsual:\x2025\x20→\x2010",
    "identifier",
    "test",
    "bottom",
    "angryT",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "dice",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    "add",
    "hypot",
    "Added\x20level\x20up\x20reward\x20table.",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    "*Damage:\x204\x20→\x206",
    "enable_min_scaling",
    "8th\x20August\x202023",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    ".server-area",
    "lineCap",
    "isInventoryPetal",
    "#764b90",
    "worldH",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "clientX",
    "l\x20you",
    ".rewards\x20.dialog-content",
    "url",
    "Sandstorm_1",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    "outdatedVersion",
    "#d43a47",
    "petalGas",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "centipedeBody",
    "Luxurious\x20mansion\x20of\x20ants.",
    "Epic",
    "uiHealth",
    "absorb",
    "324654xyaLDw",
    "spotPath_",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    "hideUserCount",
    "*Banana\x20damage:\x201\x20→\x202",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "checked",
    "user",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    "Shrinker",
    "Poison\x20Reduction",
    "#21c4b9",
    "3YHM",
    "antHole",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "\x20domain=.hornex.pro",
    "23rd\x20August\x202023",
    "regenF",
    "max",
    "queen",
    "shell",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "includes",
    "Antidote",
    "#4f412e",
    "11th\x20August\x202023",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "lineJoin",
    "Cotton",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    "29th\x20June\x202023",
    "Nigerian\x20Ladybug.",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    "heart",
    "iWatchAd",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    "accou",
    "stats",
    "addCount",
    "childIndex",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "New\x20mob:\x20Statue.",
    "oceed",
    "motionKind",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    "readAsText",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "101636gyvtEF",
    "getAttribute",
    "Soldier\x20Ant",
    "Worker\x20Ant",
    "Pill\x20affects\x20Arrow\x20now.",
    "tCkxW5FcNmkQ",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    "hsla(0,0%,100%,0.25)",
    "cmd",
    ".\x22></span></div>",
    "*Bone\x20armor:\x205\x20→\x206",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    ".dismiss-btn",
    "reload",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "exp",
    "#775d3e",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "hasSpiderLeg",
    "m28",
    "keyClaimed",
    ".petals.small",
    "&response_type=code&scope=identify&state=",
    "beehive",
    "*Increased\x20drop\x20rates.",
    "4th\x20April\x202024",
    "Orbit\x20Dance",
    "n8oKoxnarXHzeIzdmW",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "petalBasic",
    "jellyfish",
    ".reload-btn",
    "Dark\x20Ladybug",
    "connectionIdle",
    "wing",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "Spider_1",
    "save",
    "cantChat",
    "hasEye",
    "petalAntEgg",
    "Increases\x20your\x20vision.",
    "petalDragonEgg",
    "addEventListener",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    "petalTaco",
    ".absorb-petals-btn",
    "scale",
    "number",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "lineWidth",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "Petals",
    "twirl",
    "\x20stea",
    "deltaY",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    "Petal\x20Weight",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    "render",
    "Goofy\x20little\x20wanderer.",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    "projHealthF",
    "respawnTime",
    "portal",
    "10px",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "#503402",
    "#6f5514",
    "Lvl\x20",
    "countTiers",
    "antennae",
    "New\x20settings:\x20Low\x20quality.",
    "qCkBW5pcR8kD",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "27th\x20February\x202024",
    "querySelector",
    ".changelog\x20.dialog-content",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "*Reduced\x20HP\x20depletion.",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    ".scoreboard-title",
    "bubble",
    "setTargetByEvent",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "Digit",
    "#75dd34",
    "saved_builds",
    ".lottery\x20.inventory-petals",
    "WQxdVSkKW5VcJq",
    "air",
    "beaten\x20to\x20death",
    "ellipse",
    "projPoisonDamage",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "spiderCave",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    "petalPincer",
    "104949KgtRvo",
    "#353331",
    "New\x20mob:\x20M28.",
    "Ladybug",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "#416d1e",
    "angle",
    "Pincer",
    "hoq5",
    "wrecked",
    ".tabs",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    "\x20at\x20least!",
    "#cfbb50",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "Downloaded!",
    "*Bone\x20armor:\x207\x20→\x208",
    "9th\x20August\x202023",
    "27th\x20June\x202023",
    "marginLeft",
    "spawn",
    "createElement",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    "Orbit\x20Twirl",
    "*Swastika\x20health:\x2030\x20→\x2035",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    "Could\x20not\x20claim\x20secret\x20skin.",
    "Unusual",
    "userChat",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "petalLightning",
    "expand",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    "loggedIn",
    "curve",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    "Spider\x20Legs",
    "iSwapPetal",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "petalMissile",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "Sponge",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    "elongation",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "powderTime",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    ".petal-count",
    "val",
    "New\x20mob:\x20Pedox",
    "Ruined",
    "restore",
    "#3db3cb",
    "spiderYoba",
    ".clown-cb",
    "Yin\x20Yang",
    "Sunflower",
    "cookie",
    "Craft",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    "posAngle",
    "fixedSize",
    "stayIdle",
    "#d54324",
    "focus",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "oPlayerX",
    "getUint8",
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    "assassinated",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "21st\x20July\x202023",
    "bsorb",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "US\x20#1",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    "#d3ad46",
    "active",
    "disabled",
    "#288842",
    ".show-bg-grid-cb",
    "qmklWO4",
    "Sandstorm_3",
    ".logout-btn",
    "ned.\x22",
    "*Rock\x20health:\x2050\x20→\x2060",
    "petalTurtle",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "isPetal",
    "hsla(0,0%,100%,0.3)",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    "Even\x20more\x20wave\x20changes:",
    "--angle:",
    "14dafFDX",
    "Beetle_2",
    "textBaseline",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "miter",
    "WPJcKmoVc8o/",
    "keydown",
    "Fixed\x20another\x20craft\x20exploit.",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "3WRI",
    "hasEars",
    "Soldier\x20Ant_5",
    "isProj",
    "*Light\x20damage:\x2013\x20→\x2012",
    "petalAntidote",
    "cacheRendered",
    "makeBallAntenna",
    "extraSpeedTemp",
    "\x0aServer:\x20",
    "click",
    ".gamble-petals-btn",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    "Account\x20import/export\x20UI\x20redesigned.",
    "16th\x20July\x202023",
    "breedRange",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    "userCount",
    "petalWave",
    "Increased\x20shiny\x20mob\x20size.",
    "measureText",
    "kers\x20",
    "23rd\x20June\x202023",
    "(?:^|;\x5cs*)",
    "ability",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    "drawSnailShell",
    "Pollen",
    "layin",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    "Regenerates\x20health\x20when\x20consumed.",
    "KGw#",
    "Fixed\x20another\x20crafting\x20exploit.",
    "Extra\x20Speed",
    "Sand",
    "Comes\x20to\x20avenge\x20mobs.",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "nSkOW4GRtW",
    "iGamble",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    "path",
    "petalPoo",
    "hpRegen75PerSecF",
    "Missile\x20Health",
    "appendChild",
    "#d9511f",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "from",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "<div\x20class=\x22btn\x20tier-",
    "pZWkWOJdLW",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "*Super:\x201%\x20→\x201.5%",
    "keyCode",
    "gem",
    "#9e7d24",
    "#fff",
    "19th\x20January\x202024",
    "Sword",
    "hostn",
    "Changes\x20to\x20anti-lag\x20system:",
    "drops",
    "petalSponge",
    "#38ecd9",
    "yellow",
    "Server-side\x20optimizations.",
    "eu_ffa2",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "charCodeAt",
    "locat",
    "Heavy",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    ".absorb-btn\x20.tooltip\x20span",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    "origin",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "rgb(134,\x2031,\x20222)",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    "isLightsaber",
    "Username\x20too\x20short!",
    "fontFamily",
    "absorbPetalEl",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    ".lb",
    "mobId",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    "3rd\x20July\x202023",
    "https://auth.hornex.pro/discord",
    "rgb(255,\x20230,\x2093)",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "\x20FPS\x20/\x20",
    "Beetle_5",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    "centipedeBodyDesert",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    "crafted",
    "affectHealDur",
    "Pet\x20Size\x20Increase",
    "player",
    ".stat-value",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    ".settings",
    "btn",
    "*Snail\x20damage:\x2015\x20→\x2020",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    "nProg",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "finalMsg",
    "#888",
    "sk.",
    "Turtle",
    "#db4437",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "Breed\x20Strength",
    "main",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    "*Hyper:\x20240",
    "curePoisonF",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "Fixed\x20Rice.",
    "Can\x27t\x20perform\x20that\x20action.",
    "mobDespawned",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "no-icon",
    "oPlayerY",
    "absorbDamage",
    "12th\x20November\x202023",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    "#363685",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    "uiCountGap",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "*Peas\x20health:\x2020\x20→\x2025",
    "damageF",
    "petalFire",
    "sprite",
    "shield",
    "#111",
    "mood",
    "flors",
    "Rock_3",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    ".helper-cb",
    "canRemove",
    "mouse0",
    "span",
    "*Opening\x20Lottery",
    "local",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    ".super-buy",
    "nice\x20stolen\x20florr\x20assets",
    "#ffe763",
    "privacy.txt",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "?v=",
    "Region:\x20",
    "KePiKgamer",
    "\x22></span>\x20",
    "<div\x20style=\x22color:\x20",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "makeFire",
    "#b05a3c",
    "useTime",
    "Fire\x20Duration",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    "fossil",
    "deg)",
    "numAccounts",
    ".swap-btn",
    "ion",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "petalBone",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "Passively\x20regenerates\x20shield.",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    "Added\x20Lottery.",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    "abeQW7FdIW",
    "consumeProjHealth",
    "spiderLeg",
    "Rock_2",
    "Need\x20to\x20be\x20Lvl\x20",
    "lottery",
    "\x20HP",
    "Lightsaber",
    "bruh",
    "#ffd800",
    "pickupRange",
    "percent",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "icBdNmoEta",
    "Error\x20refreshing\x20ad.",
    "Swastika",
    "Much\x20heavier\x20than\x20your\x20mom.",
    "maxLength",
    "25th\x20June\x202023",
    "hsla(0,0%,100%,0.4)",
    "spinSpeed",
    ".play-btn",
    "poisonDamageF",
    "vFKOVD",
    "*Rock\x20health:\x2060\x20→\x20120",
    "onmessage",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    "alpha",
    "WPfQmmoXFW",
    "(reloading...)",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "Reflected\x20Missile\x20Damage",
    "uwu",
    "21st\x20June\x202023",
    "Ants\x20redesign.",
    "onopen",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    ".global-user-count",
    "show_helper",
    "crafted\x20nothing\x20from",
    "unsuccessful",
    "evenodd",
    "Red\x20ball.",
    "extraRange",
    "Pill",
    "#4d5e56",
    "s\x20can",
    "\x22></div>\x20<div\x20style=\x22color:",
    "showItemLabel",
    "isSleeping",
    ".continue-btn",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "Honey\x20Range",
    "object",
    ".box",
    "%</option>",
    "video-ad-skipped",
    "Pacman",
    ".angry-btn",
    "ignore\x20if\x20u\x20already\x20subbed",
    "beginPath",
    "*Super:\x205-15",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "Continue",
    "legD",
    ".absorb-clear-btn",
    "Some\x20anti\x20lag\x20measures:",
    "filter",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "enable_shake",
    "*Cotton\x20health:\x2010\x20→\x2012",
    "pro",
    "...",
    "16th\x20June\x202023",
    "#347918",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "fire\x20ant",
    "children",
    "Dragon_2",
    "#393cb3",
    "isShiny",
    "workerAnt",
    "Coffee",
    "Hyper",
    "#ada25b",
    "15584076IAHWRs",
    "http",
    "\x20in\x20view\x20/\x20",
    "mushroomPath",
    "honeyDmgF",
    "oAngle",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "retardDuration",
    "20th\x20June\x202023",
    "Ghost_2",
    "curePoison",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    "New\x20mob:\x20Furry.",
    "teal\x20",
    "stickbugBody",
    ".terms-btn",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    "rgb(92,\x20116,\x20176)",
    "WRRdT8kPWO7cMG",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    ".ad-blocker",
    "makeLadybug",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    "Wave\x20Starting...",
    "isBooster",
    "j[zf",
    "WR7cQCkf",
    "#5ef64f",
    "lightningDmg",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    "petalDice",
    "Bounces",
    "%\x20!important",
    ".grid",
    "angry",
    "Heavier\x20than\x20your\x20mom.",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "hsla(0,0%,100%,0.1)",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    "terms.txt",
    "isIcon",
    "as_ffa1",
    "\x20from\x20",
    "Increases\x20petal\x20spin\x20speed.",
    "*Powder\x20damage:\x2015\x20→\x2020",
    "[censored]",
    "text/plain;charset=utf-8;",
    "marginBottom",
    "lineTo",
    "preventDefault",
    "show",
    "#bb1a34",
    "accountData",
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "Added\x20Shop.",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "Craft\x20rate\x20change:",
    "KeyX",
    "petHealthFactor",
    "admin_pass",
    "binaryType",
    ".death-info",
    "pow",
    "*Halo\x20now\x20stacks.",
    "Extra\x20Pickup\x20Range",
    "parts",
    "6th\x20August\x202023",
    ".lottery-timer",
    "Banana",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "*Fire\x20damage:\x209\x20→\x2015",
    "#f7904b",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "hornex-pro_970x250",
    "angleOffset",
    "13th\x20September\x202023",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "function",
    "msgpack",
    ".watch-ad",
    "TC0B",
    "sizeIncrease",
    ".mob-gallery",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    "Nitro\x20Boost",
    "Breaths\x20fire.",
    "warn",
    "blur",
    "#2da14d",
    "UNOFF",
    "scorpion",
    "DMCA",
    "reset",
    "#b0473b",
    "activeElement",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    "Iris",
    ".anti-spam-cb",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    "complete",
    "#79211b",
    "#8f5db0",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "9th\x20July\x202023",
    "bolder\x2025px\x20",
    "changedTouches",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "<div\x20class=\x22spinner\x22></div>",
    "Flower\x20Poison",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "purple",
    "descColor",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "petalDrop_",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    "iBreedTimer",
    "AS\x20#2",
    "ages.",
    "/dlSprite",
    "Added\x202\x20US\x20lobbies.",
    "rgb(81\x20121\x20251)",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    "startPreRoll",
    "Furry",
    "1167390UrVkfV",
    "hsla(0,0%,100%,0.15)",
    "#cb37bf",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "*Cotton\x20health:\x208\x20→\x209",
    "1px",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "yoba",
    "rgba(0,0,0,0.3)",
    "Spider\x20Yoba",
    "pathSize",
    "globalAlpha",
    "Skull",
    "deg",
    "\x22></span>",
    "ICIAL",
    "#ff4f4f",
    "other",
    "#d3c66d",
    "Checking\x20username\x20availability...",
    "title",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "6aVeygJ",
    "12th\x20August\x202023",
    "[G]\x20Show\x20Grid:\x20",
    "fill",
    ".key-input",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    ".hud",
    "picked",
    ".sad-btn",
    "Lightning",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "4th\x20August\x202023",
    ".shop",
    "#bbbbbb",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    ".lottery-rarities",
    ".featured",
    "Removed\x20Waves.",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    "#ffd941",
    "petalMagnet",
    "select",
    "en-US",
    "encode",
    "Ultra",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    "glbData",
    "affectMobHealDur",
    "*Arrow\x20damage:\x204\x20→\x205",
    "Mob\x20Agro\x20Range",
    "#A8A7A4",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    "writeText",
    "Spider_4",
    "ffa\x20sandbox",
    ".shop-btn",
    "Heart",
    "updateProg",
    "ad\x20refresh",
    "spawnT",
    "94678ZhZiRd",
    "Starfish",
    "Fixed\x20players\x20pushing\x20eachother.",
    "s.\x20Yo",
    "Fire",
    "hostname",
    "bolder\x20",
    "\x20play",
    "then",
    ".max-wave",
    "toLocaleDateString",
    "KeyV",
    "DMCA-ed",
    "Temporary\x20Extra\x20Speed",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    "5th\x20September\x202023",
    ".max-score",
    "\x22\x20stroke=\x22",
    "#709d45",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "small\x20full",
    "translate",
    "mobsEl",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "loading",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "\x20Wave\x20",
    "Extra\x20Spin\x20Speed",
    ".export-btn",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    "getBigUint64",
    "Heal\x20Affect\x20Duration",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    "flowerPoisonF",
    "occupySlot",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "#ce76db",
    "globalCompositeOperation",
    ".gamble-prediction",
    "Increased\x20map\x20size\x20by\x2030%.",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "localId",
    "Zert",
    "ENTERING!!",
    "unknown",
    ".petal",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "points",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "130XqsRWK",
    "centipedeHeadPoison",
    "hit.p",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "drawArmAndGem",
    "roundRect",
    "scale2",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    ".submit-btn",
    "*Arrow\x20health:\x20180\x20→\x20220",
    "addGroupNumbers",
    "Flower\x20#",
    "string",
    "*Rice\x20damage:\x205\x20→\x204",
    "*Turtle\x20health:\x20600\x20→\x20900",
    "waveEnding",
    ".collected-rarities",
    "petalHeavy",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "VLa2",
    "d.\x20Pr",
    "hasAbsorbers",
    "onchange",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "yellowLadybug",
    "https://www.youtube.com/@FussySucker",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    "#724c2a",
    "#f2b971",
    "slice",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    "#38c125",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    "Fossil",
    "WRyiwZv5x3eIdtzgdgC",
    ".nickname",
    ".builds-btn",
    ".active",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    "Extra\x20Vision",
    "mushroom",
    "rgb(",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    "projAffectHealDur",
    "petalDmca",
    ".grid\x20.title",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "#2e933c",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "destroyed",
    "marginTop",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "#a2eb62",
    "url(https://i.ytimg.com/vi/",
    "shiftKey",
    "Bubble",
    "Hnphe",
    "usernameClaimed",
    "Web\x20Radius",
    ".total-kills",
    "sq8Ig3e",
    "isCentiBody",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "stickbug",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "WP5YoSoxvq",
    "waveStarting",
    "rgb(222,111,44)",
    "prepend",
    "lightblue",
    "#ccad00",
    "darkLadybug",
    "1st\x20August\x202023",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    "putImageData",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "6th\x20July\x202023",
    "hasHalo",
    "sizeIncreaseF",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    "GsP9",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    "Scorpion\x20redesign.",
    "Getting\x20",
    "Fonts\x20loaded!",
    "wss://us2.hornex.pro",
    "Dragon_6",
    "Passive\x20Shield",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "reduce",
    "cde9W5NdTq",
    "setUint8",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "WOpcHSkuCtriW7/dJG",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "New\x20mob:\x20Snail.",
    "Invalid\x20account!",
    "canRender",
    "rewards",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    "web_",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    ".tv-next",
    "*Banana\x20health:\x20170\x20→\x20400",
    "p41E",
    ".zone-mobs",
    ".right-align-petals-cb",
    ".stats\x20.dialog-content",
    "#cfcfcf",
    "#8d9acc",
    "#ab7544",
    "bqpdUNe",
    "consumeProj",
    "assualted",
    "Added\x20Discord\x20login.",
    "#7777ff",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    ".expand-btn",
    "https://www.youtube.com/@IAmLavaWater",
    "adplayer-not-found",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "WP4dWPa7qCklWPtcLq",
    "inclu",
    "setUint32",
    "ui_scale",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    ".player-list\x20.dialog-content",
    "neutral",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    "\x20-\x20",
    "*Peas\x20damage:\x208\x20→\x2010",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "application/json",
    "beetle",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "<div\x20class=\x22dialog\x20tier-",
    "Game\x20released\x20to\x20public!",
    ".chat",
    "iScore",
    "innerWidth",
    "6th\x20October\x202023",
    "Username\x20claimed!",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    ".shop-overlay",
    "rgba(0,0,0,0.1)",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "://ho",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    ".progress",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "Yoba_6",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "onresize",
    "Copied!",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "px\x20",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    "log",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "onmousemove",
    "Fire\x20Ant\x20Hole",
    "#e0c85c",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    "1841224gIAuLW",
    "they\x20copied\x20florr\x20code\x20omg!!",
    "OFFIC",
    "fireTime",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "sandstorm",
    "5GhITWv",
    "pedoxMain",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    "Duration",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    "19th\x20June\x202023",
    "uiAngle",
    "Sandstorm",
    "KeyW",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    "eu_ffa",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "scrollTop",
    "Yoba_3",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "LEAVE\x20ZONE!!",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    "28th\x20June\x202023",
    "ShiftRight",
    "rgba(0,0,0,0.4)",
    "#4e3f40",
    "Level\x20",
    "sad",
    "/hqdefault.jpg)",
    "Q2mA",
    "quadraticCurveTo",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "dataTransfer",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "4oL8",
    "Removed\x20Centipedes\x20from\x20waves.",
    "Added\x201\x20more\x20EU\x20lobby.",
    ".checkbox",
    "random",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    "#33a853",
    "backgroundColor",
    "drawChats",
    "\x20was\x20",
    "armorF",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    "choked",
    "petalLight",
    ".rewards",
    ".keyboard-cb",
    ".minimap",
    "fixed_name_size",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "fillStyle",
    ".petal-rows",
    "#ab5705",
    "craftResult",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "WRZdV8kNW5FcHq",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "e8oQW7VdPKa",
    "#32a852",
    "petalerDrop",
    "petSizeChangeFactor",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "tagName",
    "https://ipapi.co/json/",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    "6th\x20September\x202023",
    "hornex",
    "*Rare:\x2050\x20→\x2035",
    "21st\x20January\x202024",
    "murdered",
    "=([^;]*)",
    "#dddddd",
    "hpRegen75PerSec",
    "Honey\x20Damage",
    "oSize",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    "isStatue",
    "Your\x20Profile",
    "Poisonous\x20gas.",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "petDamageFactor",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    "consumeProjHealthF",
    ".total-accounts",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "rgb(237\x2061\x20234)",
    "WP10rSoRnG",
    "OPEN",
    "nSize",
    "join",
    "Former\x20student\x20of\x20Yoda.",
    "toUpperCase",
    "Retardation\x20Duration",
    "#5ab6ab",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "year",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    "It\x20likes\x20to\x20dance.",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "userAgent",
    "uiY",
    "Sandbox",
    "replace",
    "#b0c0ff",
    ".censor-cb",
    ".tier-",
    "<div><span\x20stroke=\x22",
    "2nd\x20October\x202023",
    "*Cotton\x20health:\x207\x20→\x208",
    "WQpcUmojoSo6",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    ".absorb",
    "setUserCount",
    "Wave\x20changes:",
    "7th\x20February\x202024",
    "strok",
    "sign",
    "26th\x20January\x202024",
    "WQ7dTmk3W6FcIG",
    "LavaWater",
    "continent_code",
    "#8ac255",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "\x20won\x20and\x20got\x20extra",
    "font",
    "#ce79a2",
    "hasSpawnImmunity",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "Dragon_4",
    "left",
    "opera",
    "\x22\x20style=\x22color:",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    "hide-scoreboard",
    ".prediction",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    "onwheel",
    "isAggressive",
    "#444444",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    "nHealth",
    "fovFactor",
    "*2%\x20craft\x20success\x20rate.",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "Ant\x20Hole",
    "*Yoba\x20Egg\x20buff.",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "consumeProjDamage",
    "sortGroupItems",
    "petalIris",
    "zvNu",
    "draw",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    "It\x20has\x20sussy\x20movement.",
    "honeyRange",
    "erCas",
    "dragonNest",
    "show_clown",
    "#7d5b1f",
    "webSize",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    "hideAfterInactivity",
    "*Ultra:\x20120",
    "getUint32",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    "AS\x20#1",
    "\x20&\x20",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "petalLeaf",
    "drawIcon",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "petal_",
    "are\x20p",
    "Hornet_4",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "onload",
    "New\x20rarity:\x20Hyper.",
    "/s\x20if\x20H<50%",
    "isPlayer",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    ".chat-content",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    "#bebe2a",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    "IAL\x20c",
    "started!",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    ".build-save-btn",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    "Ugly\x20&\x20stinky.",
    "stringify",
    "map",
    "next",
    "r\x20acc",
    "Passive\x20Heal",
    "Scorpion",
    "\x22></div><div\x20class=\x22log-content\x22>",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    "wss://eu2.hornex.pro",
    "2090768fiNzSa",
    "#cf7030",
    "#bc0000",
    "breedTimer",
    "small",
    "#7d893e",
    "transform",
    "consumeTime",
    "Removed\x20disclaimer\x20from\x20menu.",
    "statue",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    "isClown",
    "nt\x20an",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    "petalSunflower",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    ".lottery-winner",
    "petSizeIncrease",
    "Avacado",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    "Created\x20changelog.",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "u\x20are",
    "pickedEl",
    "nt.\x20H",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    "spider",
    "send",
    "className",
    "W6HBdwO0",
    "#c8a826",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "metaData",
    "Added\x201\x20AS\x20lobby.",
    "#b9baba",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "push",
    "19th\x20July\x202023",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "BrnPE",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "gcldSq",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "1st\x20July\x202023",
    "blur(10px)",
    "13th\x20February\x202024",
    "been\x20",
    "iCraft",
    "Added\x20Shiny\x20mobs:",
    "catch",
    "%zY4",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "Stickbug",
    "%\x20-\x200.8em*",
    "Lightning\x20damage:\x2012\x20→\x208",
    "Statue\x20of\x20RuinedLiberty.",
    ".joystick-knob",
    "1Jge",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "#eee",
    "210ZoZRjI",
    "createPattern",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    ".claim-btn",
    "touchmove",
    "duration",
    "spawn_zone",
    "damage",
    "#f009e5",
    "hornex.pro",
    "innerHeight",
    "New\x20mob:\x20Dragon\x20Nest.",
    "*Hyper:\x20175+",
    "none",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "Wave\x20",
    "ontouchstart",
    "#a760b1",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "KeyS",
    "isConsumable",
    "extraSpeed",
    "WRGBrCo9W6y",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "#b52d00",
    "#fe98a2",
    "breedTimerAlpha",
    "onMove",
    "petalPacman",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "mobSizeChange",
    "style",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    "updateTime",
    ".shop-info",
    "https://www.youtube.com/@gowcaw97",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    ".mob-gallery\x20.dialog-content",
    "https://www.youtube.com/@KePiKgamer",
    ".close-btn",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "Flower\x20Damage",
    "6th\x20November\x202023",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "Neowm",
    "Desert",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    "Third\x20Eye",
    "furry",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    ".level",
    "makeMissile",
    "nick",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    "and\x20a",
    "#dc704b",
    "lastResizeTime",
    "find",
    "Minor\x20physics\x20change.",
    ".hitbox-cb",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "oProg",
    "Provide\x20a\x20name\x20dummy.",
    "*Ultra:\x20125+",
    "petalStarfish",
    "healthIncrease",
    "135249DkEsVO",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "petalBanana",
    ".no-btn",
    "sin",
    "Some\x20Data",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "KeyC",
    "16th\x20September\x202023",
    "passive",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    "petalSand",
    "iReqAccountData",
    "petalSoil",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    "#323032",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    "isPoison",
    "#cecfa3",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "encod",
    "close",
    "iChat",
    "#ffffff",
    "drawWingAndHalo",
    "#8ecc51",
    "New\x20mob:\x20Sunflower.",
    ".scale-cb",
    "\x22></span></div>\x0a\x09</div>",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "OQM)",
    ".dc-group",
    ".debug-cb",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    "agroRangeDec",
    "slayed",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    "*Health:\x20100\x20→\x20120",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    "#4040fc",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    "statuePlayer",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    "angleSpeed",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "#fcfe04",
    "petalNitro",
    "/weborama.js",
    ".lottery-btn",
    "rgba(0,0,0,0.08)",
    "Poop\x20Health",
    "\x0a\x0a\x09\x09\x09",
    "weedSeed",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    ".score-overlay",
    ".mobs-btn",
    "*Arrow\x20damage:\x201\x20→\x203",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    "isBoomerang",
    "leaders",
    "petalEgg",
    "keyInvalid",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    "petalYobaEgg",
    "toggle",
    "Dahlia",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    "rotate(",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "dontResolveCol",
    "Account\x20imported!",
    "Dragon",
    "invalid\x20uuid",
    "typeStr",
    "kWicW5FdMW",
    ".absorb-petals",
    "Soil",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    "#39b54a",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "Tiers",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    "Missile",
    "Poop\x20Damage",
    "isBae",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    "dmca\x20it\x20m28!",
    "lighter",
    "55078DZMiSD",
    "#4eae26",
    "User\x20not\x20found.",
    "projD",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "*Fire\x20health:\x2080\x20→\x20120",
    "maxTimeAlive",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    "wss://eu1.hornex.pro",
    "low_quality",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Buffed\x20Lightsaber:",
    "inventory",
    "Rock_5",
    "canShowDrops",
    "Slowness\x20Duration",
    "imageSmoothingEnabled",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "25th\x20August\x202023",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "translate(-50%,",
    "shinyCol",
    "projPoisonDamageF",
    "petalMushroom",
    "#fc9840",
    "*Rock\x20health:\x2045\x20→\x2050",
    "Sprite",
    "wss://",
    "health",
    "12OVuKwi",
    "/dlMob",
    "slowDuration",
    "Sandstorm_2",
    "15807WcQReK",
    "mob_",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    "off",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "spawnOnDie",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "New\x20mob:\x20Mushroom.",
    "padStart",
    "#ceea33",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "settings",
    "Spawns",
    "size",
    "iPing",
    "cloneNode",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "petalCotton",
    "translate(-50%,\x20",
    "Poop\x20colored\x20Ladybug.",
    "WR7dPdZdQXS",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    "KeyR",
    "#fcdd86",
    "WPPnavtdUq",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "halo",
    "Congratulations!",
    "red",
    "<div>",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "swapped",
    "show_hitbox",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    "#dbab2e",
    "Added\x20Waveroom:",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    "Air",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    "\x20pxls)\x20/\x20",
    "iClaimUsername",
    "Decreases",
    "\x20online)",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "Evil\x20Centipede",
    "killsNeeded",
    "xgMol",
    "#554213",
    "%;left:",
    "visible",
    "updateT",
    "Yellow\x20Ladybug",
    "min",
    "attachPetal",
    "15th\x20June\x202023",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    ".player-list",
    ".joystick",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "Dragon_5",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "makeHole",
    "keyCheckFailed",
    "Soldier\x20Ant_4",
    "Mushroom",
    "iReqGambleList",
    "https://discord.gg/zZsUUg8rbu",
    "toLowerCase",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    "countEl",
    "\x20ctxs\x20(",
    "Elongation",
    "Username\x20is\x20already\x20taken.",
    "nerd",
    ".my-player",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "getRandomValues",
    "soldierAnt",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "spawnOnHurt",
    "pedox",
    "Ghost_3",
    "Dandelion",
    "stepPerSecMotion",
    ".inventory-btn",
    "rgba(0,0,0,0.2)",
    "#333",
    "petalHoney",
    "2nd\x20March\x202024",
    "hsl(110,100%,50%)",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "redHealth",
    "10QIdaPR",
    "resize",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    "\x27s\x20Profile",
    "bar",
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "onEnd",
    "Added\x20another\x20AS\x20lobby.",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    "executed",
    "show-petal",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "(total\x20",
    "Baby\x20Ant",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "[F]\x20Show\x20Hitbox:\x20",
    "Ghost_4",
    ")\x20rotate(",
    "dontPushTeam",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "Disconnected.",
    "Increased\x20Wave\x20mob\x20count.",
    "8th\x20July\x202023",
    "Spider_6",
    "cmk/auqmq8o8WOngW79c",
    "pop",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    "shadowBlur",
    "rectAscend",
    "<div\x20class=\x22chat-text\x22></div>",
    "Cactus",
    "Press\x20G\x20to\x20toggle\x20grid.",
    "opacity",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    "builds",
    "insertBefore",
    "*Snail\x20damage:\x2020\x20→\x2025",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "successful",
    "oninput",
    "round",
    ".leave-btn",
    ".shake-cb",
    "wss://as2.hornex.pro",
    ".textbox",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    "respawnTimeTiers",
    "iCheckKey",
    "Hornet_6",
    "content",
    "x.pro",
    "23rd\x20July\x202023",
    "3m^(",
    "Username\x20too\x20big!",
    "dur",
    "rgb(219\x20130\x2041)",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "cmk+c0aoqSoLWQrQW6Tx",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "pet",
    "_blank",
    "#7dad0c",
    "undefined",
    ".player-count",
    "5th\x20July\x202023",
    "KeyD",
    "us_ffa2",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    "prototype",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    "dispose",
    "requestAnimationFrame",
    "*Hyper:\x2015-25",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    ";\x22\x20stroke=\x22",
    "reflect",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    "doRemove",
    "nShield",
    "Claiming\x20secret\x20skin...",
    "petals!",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "Very\x20sussy\x20data!",
    "#cfc295",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "*They\x20give\x2010x\x20score.",
    "craft-disable",
    "*Recuded\x20mob\x20count.",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    "EU\x20#1",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    "Honey",
    "translate(calc(",
    "seed",
    "Spider\x20Egg",
    "workerAntFire",
    "usernameTaken",
    "https://stats.hornex.pro/api/userCount",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "24th\x20July\x202023",
    "Guardian",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    "fire",
    "Beetle\x20Egg",
    "24th\x20June\x202023",
    "#a33b15",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "*Peas\x20damage:\x2015\x20→\x2020",
    "#735b49",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    "*Taco\x20healing:\x208\x20→\x209",
    "lightning",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "changelog",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "Makes\x20you\x20poisonous.",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "rgb(237\x20236\x2061)",
    ".insta-btn",
    "Client-side\x20performance\x20improvements.",
    "countAngleOffset",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    "level",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "toLocaleString",
    "Petaler",
    "#882200",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "Taco",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    "class=\x22chat-cap\x22",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "Head",
    "mobGallery",
    "width",
    "mobPetaler",
    "desc",
    "clipboard",
    "Nigersaurus",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    "*Rock\x20health:\x20150\x20→\x20200",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "projSize",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    "Failed\x20to\x20get\x20userCount!",
    "2357",
    "canvas",
    "#8a6b1f",
    "getTransform",
    ".yes-btn",
    "1st\x20February\x202024",
    "petalFaster",
    "score",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    "desktop",
    "#38c75f",
    "projType",
    "Server\x20side\x20performance\x20improvements.",
    "renderOverEverything",
    "pink",
    "createObjectURL",
    "#454545",
    "#bb771e",
    "makeAntenna",
    "Bone",
    "rgb(31,\x20219,\x20222)",
    "8URl",
    "rgb(43,\x20255,\x20163)",
    "n\x20an\x20",
    "https",
    "Rock\x20Egg",
    "abs",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    "drawTurtleShell",
    "\x22></div>\x0a\x09</div>",
    "#76ad45",
    "sqrt",
    "value",
    "Petal\x20Slots",
    "hide-chat",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "Wig",
    "#ebda8d",
    "*Bone\x20armor:\x209\x20→\x2010",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    "finally",
    "Removed\x20EU\x20#3.",
    "New\x20mob:\x20Dice.",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    "healthIncreaseF",
  ];
  a = function () {
    return BK;
  };
  return a();
}
(function (c, d) {
  const ue = b,
    e = c();
  while (!![]) {
    try {
      const f =
        (parseInt(ue(0x8a8)) / 0x1) * (parseInt(ue(0x8d2)) / 0x2) +
        parseInt(ue(0x5f4)) / 0x3 +
        (parseInt(ue(0x2bc)) / 0x4) * (-parseInt(ue(0x9be)) / 0x5) +
        -parseInt(ue(0x408)) / 0x6 +
        parseInt(ue(0xe11)) / 0x7 +
        -parseInt(ue(0x231)) / 0x8 +
        (-parseInt(ue(0x68e)) / 0x9) * (parseInt(ue(0x904)) / 0xa);
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0x50009),
  (() => {
    const uf = b;
    var cG = 0x2710,
      cH = 0x1e - 0x1,
      cI = { ...cV(uf(0x1e3)), ...cV(uf(0xbfd)) },
      cJ = 0x93b,
      cK = 0x10,
      cL = 0x3c,
      cM = 0x10,
      cN = 0x3,
      cO = /^[a-zA-Z0-9_]+$/,
      cP = /[^a-zA-Z0-9_]/g,
      cQ = cV(uf(0xdce)),
      cR = cV(uf(0x32a)),
      cS = cV(uf(0x358)),
      cT = cV(uf(0xb64)),
      cU = cV(uf(0x8cc));
    function cV(qQ) {
      const ug = uf,
        qR = qQ[ug(0xe00)]("\x20"),
        qS = {};
      for (let qT = 0x0; qT < qR[ug(0x441)]; qT++) {
        qS[qR[qT]] = qT;
      }
      return qS;
    }
    var cW = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cX = {};
    (cX[uf(0x98e)] = 0x0), (cX[uf(0x9d6)] = 0x1), (cX[uf(0x830)] = 0x2);
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
      return 0x14 * Math[uh(0x508)](qQ * 1.05 ** (qQ - 0x1));
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
        qR++, (qS += Math[ui(0xbd3)](0x1e, qS));
      }
      return qR;
    }
    function d6(qQ) {
      const uj = uf;
      return Math[uj(0x84e)](0xf3, Math[uj(0xbd3)](qQ, 0xc7) / 0xc8);
    }
    function d7() {
      return d8(0x100);
    }
    function d8(qQ) {
      const qR = Array(qQ);
      while (qQ--) qR[qQ] = qQ;
      return qR;
    }
    var d9 = cV(uf(0x717)),
      da = Object[uf(0x5cc)](d9),
      db = da[uf(0x441)] - 0x1,
      dc = db;
    function dd(qQ) {
      const uk = uf,
        qR = [];
      for (let qS = 0x1; qS <= dc; qS++) {
        qR[uk(0xaba)](qQ(qS));
      }
      return qR;
    }
    const de = {};
    (de[uf(0xde0)] = 0x0),
      (de[uf(0x673)] = 0x1),
      (de[uf(0x463)] = 0x2),
      (de[uf(0x617)] = 0x3),
      (de[uf(0x7bb)] = 0x4),
      (de[uf(0xbb8)] = 0x5),
      (de[uf(0x735)] = 0x6),
      (de[uf(0x686)] = 0x7),
      (de[uf(0xda1)] = 0x8);
    var df = de;
    function dg(qQ, qR) {
      const ul = uf;
      return Math[ul(0x84e)](0x3, qQ) * qR;
    }
    const dh = {};
    (dh[uf(0x5a0)] = cS[uf(0x644)]),
      (dh[uf(0xc8d)] = uf(0x59e)),
      (dh[uf(0xbab)] = 0xa),
      (dh[uf(0xd26)] = 0x0),
      (dh[uf(0x4be)] = 0x1),
      (dh[uf(0x789)] = 0x1),
      (dh[uf(0x66a)] = 0x3e8),
      (dh[uf(0x7a9)] = 0x0),
      (dh[uf(0xb32)] = ![]),
      (dh[uf(0x7cf)] = 0x1),
      (dh[uf(0x701)] = ![]),
      (dh[uf(0x605)] = 0x0),
      (dh[uf(0x9c5)] = 0x0),
      (dh[uf(0x531)] = ![]),
      (dh[uf(0x4a9)] = 0x0),
      (dh[uf(0x280)] = 0x0),
      (dh[uf(0x95b)] = 0x0),
      (dh[uf(0xcc4)] = 0x0),
      (dh[uf(0xa50)] = 0x0),
      (dh[uf(0x7e4)] = 0x0),
      (dh[uf(0x37b)] = 0x1),
      (dh[uf(0x786)] = 0xc),
      (dh[uf(0xc7c)] = 0x0),
      (dh[uf(0x8f5)] = ![]),
      (dh[uf(0x716)] = void 0x0),
      (dh[uf(0x780)] = ![]),
      (dh[uf(0x7c3)] = 0x0),
      (dh[uf(0x826)] = ![]),
      (dh[uf(0x51f)] = 0x0),
      (dh[uf(0x457)] = 0x0),
      (dh[uf(0xde5)] = ![]),
      (dh[uf(0xa68)] = 0x0),
      (dh[uf(0xc4d)] = 0x0),
      (dh[uf(0x7cd)] = 0x0),
      (dh[uf(0x267)] = ![]),
      (dh[uf(0x3c0)] = 0x0),
      (dh[uf(0xb5c)] = ![]),
      (dh[uf(0x3ac)] = ![]),
      (dh[uf(0x142)] = 0x0),
      (dh[uf(0xaf4)] = 0x0),
      (dh[uf(0xaeb)] = 0x0),
      (dh[uf(0x265)] = ![]),
      (dh[uf(0x2c0)] = 0x1),
      (dh[uf(0x53c)] = 0x0),
      (dh[uf(0xa25)] = 0x0),
      (dh[uf(0x8f4)] = 0x0),
      (dh[uf(0x557)] = 0x0),
      (dh[uf(0x818)] = 0x0),
      (dh[uf(0x778)] = 0x0),
      (dh[uf(0x226)] = 0x0),
      (dh[uf(0x2e4)] = 0x0),
      (dh[uf(0xdf9)] = 0x0),
      (dh[uf(0x5cd)] = 0x0),
      (dh[uf(0x589)] = 0x0),
      (dh[uf(0x729)] = 0x0),
      (dh[uf(0x85b)] = 0x0),
      (dh[uf(0x8c5)] = 0x0),
      (dh[uf(0x2f8)] = ![]),
      (dh[uf(0xb9b)] = 0x0),
      (dh[uf(0xadd)] = 0x0),
      (dh[uf(0x9e7)] = 0x0);
    var di = dh;
    const dj = {};
    (dj[uf(0x56f)] = uf(0x4d7)),
      (dj[uf(0xc8d)] = uf(0xcd6)),
      (dj[uf(0x5a0)] = cS[uf(0x644)]),
      (dj[uf(0xbab)] = 0x9),
      (dj[uf(0x4be)] = 0xa),
      (dj[uf(0x789)] = 0xa),
      (dj[uf(0x66a)] = 0x9c4);
    const dk = {};
    (dk[uf(0x56f)] = uf(0xb74)),
      (dk[uf(0xc8d)] = uf(0x1f8)),
      (dk[uf(0x5a0)] = cS[uf(0x6b8)]),
      (dk[uf(0xbab)] = 0xd / 1.1),
      (dk[uf(0x4be)] = 0x2),
      (dk[uf(0x789)] = 0x37),
      (dk[uf(0x66a)] = 0x9c4),
      (dk[uf(0x7a9)] = 0x1f4),
      (dk[uf(0x701)] = !![]),
      (dk[uf(0x181)] = 0x28),
      (dk[uf(0x9c5)] = Math["PI"] / 0x4);
    const dl = {};
    (dl[uf(0x56f)] = uf(0x432)),
      (dl[uf(0xc8d)] = uf(0x71c)),
      (dl[uf(0x5a0)] = cS[uf(0x3ab)]),
      (dl[uf(0xbab)] = 0x8),
      (dl[uf(0x4be)] = 0x5),
      (dl[uf(0x789)] = 0x5),
      (dl[uf(0x66a)] = 0xdac),
      (dl[uf(0x7a9)] = 0x3e8),
      (dl[uf(0x605)] = 0xb),
      (dl[uf(0x267)] = !![]);
    const dm = {};
    (dm[uf(0x56f)] = uf(0x872)),
      (dm[uf(0xc8d)] = uf(0xe15)),
      (dm[uf(0x5a0)] = cS[uf(0xa58)]),
      (dm[uf(0xbab)] = 0x6),
      (dm[uf(0x4be)] = 0x5),
      (dm[uf(0x789)] = 0x5),
      (dm[uf(0x66a)] = 0xfa0),
      (dm[uf(0xb32)] = !![]),
      (dm[uf(0x7cf)] = 0x32);
    const dn = {};
    (dn[uf(0x56f)] = uf(0x1a0)),
      (dn[uf(0xc8d)] = uf(0x831)),
      (dn[uf(0x5a0)] = cS[uf(0x420)]),
      (dn[uf(0xbab)] = 0xb),
      (dn[uf(0x4be)] = 0xc8),
      (dn[uf(0x789)] = 0x1e),
      (dn[uf(0x66a)] = 0x1388);
    const dp = {};
    (dp[uf(0x56f)] = uf(0x31d)),
      (dp[uf(0xc8d)] = uf(0x1cf)),
      (dp[uf(0x5a0)] = cS[uf(0x53d)]),
      (dp[uf(0xbab)] = 0x8),
      (dp[uf(0x4be)] = 0x2),
      (dp[uf(0x789)] = 0xa0),
      (dp[uf(0x66a)] = 0x2710),
      (dp[uf(0x786)] = 0xb),
      (dp[uf(0xc7c)] = Math["PI"]),
      (dp[uf(0x672)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dq = {};
    (dq[uf(0x56f)] = uf(0xb06)),
      (dq[uf(0xc8d)] = uf(0xa88)),
      (dq[uf(0x716)] = df[uf(0xde0)]),
      (dq[uf(0x7e4)] = 0x1e),
      (dq[uf(0x46e)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dr = {};
    (dr[uf(0x56f)] = uf(0x3b2)),
      (dr[uf(0xc8d)] = uf(0x650)),
      (dr[uf(0x716)] = df[uf(0x673)]);
    const ds = {};
    (ds[uf(0x56f)] = uf(0x8b2)),
      (ds[uf(0xc8d)] = uf(0xa9d)),
      (ds[uf(0x5a0)] = cS[uf(0x6ae)]),
      (ds[uf(0xbab)] = 0xb),
      (ds[uf(0x66a)] = 0x9c4),
      (ds[uf(0x4be)] = 0x14),
      (ds[uf(0x789)] = 0x8),
      (ds[uf(0x531)] = !![]),
      (ds[uf(0x4a9)] = 0x2),
      (ds[uf(0x111)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (ds[uf(0x280)] = 0x14);
    const du = {};
    (du[uf(0x56f)] = uf(0xb6e)),
      (du[uf(0xc8d)] = uf(0x3de)),
      (du[uf(0x5a0)] = cS[uf(0xb2d)]),
      (du[uf(0xbab)] = 0xb),
      (du[uf(0x4be)] = 0x14),
      (du[uf(0x789)] = 0x14),
      (du[uf(0x66a)] = 0x5dc),
      (du[uf(0xcc4)] = 0x64),
      (du[uf(0x862)] = 0x1);
    const dv = {};
    (dv[uf(0x56f)] = uf(0xd36)),
      (dv[uf(0xc8d)] = uf(0x302)),
      (dv[uf(0x5a0)] = cS[uf(0x9ea)]),
      (dv[uf(0xbab)] = 0x7),
      (dv[uf(0x4be)] = 0x5),
      (dv[uf(0x789)] = 0xa),
      (dv[uf(0x66a)] = 0x258),
      (dv[uf(0x37b)] = 0x1),
      (dv[uf(0x8f5)] = !![]),
      (dv[uf(0x672)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dw = {};
    (dw[uf(0x56f)] = uf(0x610)),
      (dw[uf(0xc8d)] = uf(0x5b6)),
      (dw[uf(0x5a0)] = cS[uf(0xbaf)]),
      (dw[uf(0xbab)] = 0xb),
      (dw[uf(0x4be)] = 0xf),
      (dw[uf(0x789)] = 0x1),
      (dw[uf(0x66a)] = 0x3e8),
      (dw[uf(0x780)] = !![]);
    const dx = {};
    (dx[uf(0x56f)] = uf(0x464)),
      (dx[uf(0xc8d)] = uf(0x56d)),
      (dx[uf(0x5a0)] = cS[uf(0x8be)]),
      (dx[uf(0xbab)] = 0xb),
      (dx[uf(0x4be)] = 0xf),
      (dx[uf(0x789)] = 0x5),
      (dx[uf(0x66a)] = 0x5dc),
      (dx[uf(0x7c3)] = 0x32),
      (dx[uf(0xde3)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dy = {};
    (dy[uf(0x56f)] = uf(0x206)),
      (dy[uf(0xc8d)] = uf(0x4cf)),
      (dy[uf(0x5a0)] = cS[uf(0x303)]),
      (dy[uf(0xbab)] = 0x7),
      (dy[uf(0x4be)] = 0x19),
      (dy[uf(0x789)] = 0x19),
      (dy[uf(0x37b)] = 0x4),
      (dy[uf(0x66a)] = 0x3e8),
      (dy[uf(0x7a9)] = 0x1f4),
      (dy[uf(0x786)] = 0x9),
      (dy[uf(0x9c5)] = Math["PI"] / 0x8),
      (dy[uf(0x701)] = !![]),
      (dy[uf(0x181)] = 0x28);
    const dz = {};
    (dz[uf(0x56f)] = uf(0x93f)),
      (dz[uf(0xc8d)] = uf(0x380)),
      (dz[uf(0x5a0)] = cS[uf(0x154)]),
      (dz[uf(0xbab)] = 0x10),
      (dz[uf(0x4be)] = 0x0),
      (dz[uf(0xb98)] = 0x1),
      (dz[uf(0x789)] = 0x0),
      (dz[uf(0x66a)] = 0x157c),
      (dz[uf(0x7a9)] = 0x1f4),
      (dz[uf(0xc2e)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dz[uf(0x28c)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dz[uf(0x51f)] = 0x3c),
      (dz[uf(0x826)] = !![]),
      (dz[uf(0x267)] = !![]);
    const dA = {};
    (dA[uf(0x56f)] = uf(0x6cb)),
      (dA[uf(0xc8d)] = uf(0x2fa)),
      (dA[uf(0x5a0)] = cS[uf(0x490)]),
      (dA[uf(0x66a)] = 0x7d0),
      (dA[uf(0xde5)] = !![]),
      (dA[uf(0x4be)] = 0xa),
      (dA[uf(0x789)] = 0xa),
      (dA[uf(0xbab)] = 0xd);
    const dB = {};
    (dB[uf(0x56f)] = uf(0x4a1)),
      (dB[uf(0xc8d)] = uf(0xb02)),
      (dB[uf(0x5a0)] = cS[uf(0x1e8)]),
      (dB[uf(0x66a)] = 0xdac),
      (dB[uf(0x7a9)] = 0x1f4),
      (dB[uf(0x4be)] = 0x5),
      (dB[uf(0x789)] = 0x5),
      (dB[uf(0xbab)] = 0xa),
      (dB[uf(0xa68)] = 0x46),
      (dB[uf(0x5c8)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
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
        name: uf(0x259),
        desc: uf(0x630),
        ability: df[uf(0x463)],
        orbitRange: 0x32,
        orbitRangeTiers: dd((qQ) => 0x32 + qQ * 0x46),
      },
      {
        name: uf(0x8ce),
        desc: uf(0x5fc),
        ability: df[uf(0x617)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dA,
      dB,
      {
        name: uf(0x3d3),
        desc: uf(0x3ba),
        type: cS[uf(0x59f)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][uf(0xa8b)](
          (qQ) => qQ * 0.8
        ),
      },
      {
        name: uf(0x3e9),
        desc: uf(0x17c),
        type: cS[uf(0xa58)],
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
        name: uf(0x745),
        desc: uf(0x7c9),
        type: cS[uf(0x917)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
      },
      {
        name: uf(0x52a),
        desc: uf(0x83a),
        type: cS[uf(0xc9d)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][uf(0xa8b)](
          (qQ) => qQ - 0.2
        ),
      },
      {
        name: uf(0x719),
        desc: uf(0x2a0),
        type: cS[uf(0x292)],
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
        name: uf(0x456),
        desc: uf(0x4bf),
        type: cS[uf(0xd16)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: uf(0x7c8),
        desc: uf(0x74a),
        type: cS[uf(0xd99)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: uf(0xc1e),
        desc: uf(0x360),
        type: cS[uf(0x5b1)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: uf(0x133),
        desc: uf(0x50a),
        type: cS[uf(0xa71)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dD(![]),
      dD(!![]),
      {
        name: uf(0x720),
        desc: uf(0x5ad),
        type: cS[uf(0xb2b)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: uf(0x53b),
        desc: uf(0x784),
        type: cS[uf(0xd7f)],
        size: 0xa,
        healthF: 0xf,
        damageF: 0x14,
        respawnTime: 0x5dc,
        extraSpeed: 0x2,
        extraSpeedTiers: [0x4, 0x6, 0x8, 0xa, 0xc, 0xe, 0x10, 0x18],
      },
      {
        name: uf(0xb63),
        desc: uf(0x550),
        type: cS[uf(0x3ab)],
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
        name: uf(0xc6b),
        desc: uf(0xdc8),
        type: cS[uf(0xb5e)],
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
        spawn: uf(0xd19),
        spawnTiers: [
          uf(0xd28),
          uf(0x6f6),
          uf(0x247),
          uf(0x247),
          uf(0x17e),
          uf(0x75d),
          uf(0x75d),
          uf(0x579),
        ],
      },
      {
        name: uf(0x338),
        desc: uf(0xa0a),
        type: cS[uf(0x64f)],
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
        spawn: uf(0x627),
        spawnTiers: [
          uf(0x561),
          uf(0x561),
          uf(0x2cc),
          uf(0x1e4),
          uf(0xbde),
          uf(0x700),
          uf(0x700),
          uf(0x53f),
        ],
      },
      {
        name: uf(0xd5a),
        desc: uf(0x17f),
        type: cS[uf(0xb5e)],
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
        spawn: uf(0x3f1),
        spawnTiers: [
          uf(0xdf0),
          uf(0xdf0),
          uf(0x27b),
          uf(0xcf0),
          uf(0xa76),
          uf(0xd9e),
          uf(0xd9e),
          uf(0xc30),
        ],
      },
      {
        name: uf(0xd73),
        desc: uf(0x6a5),
        type: cS[uf(0xb61)],
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
        spawn: uf(0x3ca),
        spawnTiers: [
          uf(0x3ca),
          uf(0xce4),
          uf(0x492),
          uf(0x9cd),
          uf(0x45d),
          uf(0x3e7),
          uf(0x3e7),
          uf(0x9aa),
        ],
      },
      {
        name: uf(0xd61),
        desc: uf(0xe0c),
        type: cS[uf(0x39e)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: uf(0x9c6),
        spawnTiers: [
          uf(0x5e9),
          uf(0xb9c),
          uf(0xb9c),
          uf(0x6e7),
          uf(0x30a),
          uf(0x37a),
          uf(0x37a),
          uf(0x3c5),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: uf(0x7c0),
        desc: uf(0x504),
        type: cS[uf(0x30c)],
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
        name: uf(0x2a7),
        desc: uf(0x983),
        type: cS[uf(0x728)],
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
        name: uf(0x8d3),
        desc: uf(0x281),
        type: cS[uf(0xb19)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: uf(0xbf1),
        desc: uf(0xa86),
        type: cS[uf(0x562)],
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
        name: uf(0xe0d),
        desc: uf(0x101),
        type: cS[uf(0x4ab)],
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
        name: uf(0xda7),
        desc: uf(0x451),
        type: cS[uf(0xd81)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: uf(0x695),
        desc: uf(0xa52),
        type: cS[uf(0x68d)],
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
        name: uf(0x6b5),
        desc: uf(0x847),
        ability: df[uf(0x7bb)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: uf(0x6bb),
        desc: uf(0x3ef),
        type: cS[uf(0x73d)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: uf(0x86d),
        desc: uf(0xb26),
        type: cS[uf(0x932)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: uf(0x3e0),
        desc: uf(0x609),
        ability: df[uf(0xbb8)],
        petHealF: 0x28,
      },
      {
        name: uf(0x4de),
        desc: uf(0x821),
        ability: df[uf(0x735)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: uf(0x296),
        type: cS[uf(0x39b)],
        desc: uf(0x833),
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
        name: uf(0x35b),
        desc: uf(0xc39),
        type: cS[uf(0x651)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: uf(0xb69),
        spawnTiers: [
          uf(0x112),
          uf(0x807),
          uf(0x807),
          uf(0x1b1),
          uf(0xa43),
          uf(0xbda),
          uf(0xbda),
          uf(0x963),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: uf(0x80b),
        desc: uf(0x4e6),
        type: cS[uf(0x120)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          uf(0xa8b)
        ]((qQ) => qQ / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: uf(0xcaa),
        desc: uf(0x85d),
        type: cS[uf(0x7b2)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: uf(0x8d6),
        desc: uf(0x26d),
        type: cS[uf(0x78a)],
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
        name: uf(0x392),
        desc: uf(0xa0d),
        type: cS[uf(0x5ed)],
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
        name: uf(0x41d),
        desc: uf(0xc12),
        type: cS[uf(0x3b8)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: uf(0xdfc),
        desc: uf(0x412),
        type: cS[uf(0x710)],
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
        name: uf(0xc85),
        desc: uf(0xcdd),
        type: cS[uf(0x654)],
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
        consumeProjType: cS[uf(0x728)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: uf(0x854),
        desc: uf(0x787),
        type: cS[uf(0xb1d)],
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
        name: uf(0x7f2),
        desc: uf(0x2bb),
        type: cS[uf(0xaf2)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: uf(0x11e),
        spawnTiers: [
          uf(0x389),
          uf(0x817),
          uf(0x817),
          uf(0xbf0),
          uf(0xc0e),
          uf(0x2ad),
          uf(0x370),
          uf(0x2be),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: uf(0xbc4), desc: uf(0xb31), ability: df[uf(0x686)] },
      {
        name: uf(0xc5e),
        desc: uf(0xc25),
        type: cS[uf(0xbf6)],
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
        name: uf(0xcda),
        desc: uf(0xa2f),
        type: cS[uf(0xb4f)],
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
        name: uf(0x60b),
        desc: uf(0x5c3),
        type: cS[uf(0x703)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: uf(0x7e5),
        desc: uf(0x2ba),
        type: cS[uf(0xcf6)],
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
        name: uf(0x771),
        desc: uf(0xb4b),
        type: cS[uf(0x6eb)],
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
        name: uf(0xc61),
        desc: uf(0xba4),
        type: cS[uf(0x3da)],
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
        spawn: uf(0xd54),
        spawnTiers: [
          uf(0x64b),
          uf(0xd8c),
          uf(0xd8c),
          uf(0x341),
          uf(0x8cb),
          uf(0x558),
          uf(0x558),
          uf(0xc17),
        ],
      },
      {
        name: uf(0x4a4),
        desc: uf(0xdfa),
        type: cS[uf(0xd18)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: uf(0x3d8),
        desc: uf(0xa5f),
        type: cS[uf(0x110)],
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
        name: uf(0x6cc),
        desc: uf(0x7b5),
        type: cS[uf(0xaa1)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 2.5,
      },
      {
        name: uf(0xacd),
        desc: uf(0xccd),
        type: cS[uf(0xd31)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dd((qQ) => 0xa + qQ * 0x28),
      },
      {
        name: uf(0xbdf),
        desc: uf(0xc77),
        type: cS[uf(0xb93)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: uf(0x89d),
        desc: uf(0x753),
        type: cS[uf(0xd2c)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dd((qQ) => 0x2 + Math[uf(0xc28)](1.7 ** qQ)),
      },
      {
        name: uf(0x739),
        desc: uf(0x386),
        type: cS[uf(0x180)],
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
        name: uf(0xaa5),
        desc: uf(0xd15),
        type: cS[uf(0x4f4)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dd((qQ) => 0.02 + qQ * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: uf(0xcb0),
        desc: uf(0xb30),
        type: cS[uf(0xcf5)],
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
        spawn: uf(0x1a0),
        spawnTiers: [
          uf(0x1a0),
          uf(0xd48),
          uf(0x7bc),
          uf(0x790),
          uf(0x14d),
          uf(0xb89),
          uf(0xb89),
          uf(0x35e),
        ],
      },
      { name: uf(0xcbb), desc: uf(0x6b0), ability: df[uf(0xda1)] },
      {
        name: uf(0x4e7),
        desc: uf(0x5b4),
        type: cS[uf(0x82c)],
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
        qS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][um(0xa8b)](
          (qT) => qT * qR
        );
      return {
        name: qQ ? um(0x1fe) : um(0x5fd),
        desc:
          (qQ ? um(0xd74) : um(0xbc8)) +
          um(0x135) +
          (qQ ? um(0x191) : "") +
          um(0xdbd),
        type: cS[qQ ? um(0x1b6) : um(0x203)],
        size: 0x10,
        healthF: qQ ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: qS[0x0],
        mobSizeChangeTiers: qS[um(0x923)](0x1),
      };
    }
    var dE = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dF = {},
      dG = dC[uf(0x441)],
      dH = da[uf(0x441)],
      dI = eP();
    for (let qQ = 0x0, qR = dC[uf(0x441)]; qQ < qR; qQ++) {
      const qS = dC[qQ];
      (qS[uf(0x6ed)] = !![]), (qS["id"] = qQ);
      if (!qS[uf(0x3ed)]) qS[uf(0x3ed)] = qS[uf(0x56f)];
      dK(qS), (qS[uf(0x61d)] = 0x0), (qS[uf(0xd3e)] = qQ);
      let qT = qS;
      for (let qU = 0x1; qU < dH; qU++) {
        const qV = dO(qS);
        (qV[uf(0xd26)] = qS[uf(0xd26)] + qU),
          (qV[uf(0x56f)] = qS[uf(0x56f)] + "_" + qV[uf(0xd26)]),
          (qV[uf(0x61d)] = qU),
          (qT[uf(0xa8c)] = qV),
          (qT = qV),
          dJ(qS, qV),
          dK(qV),
          (qV["id"] = dC[uf(0x441)]),
          (dC[qV["id"]] = qV);
      }
    }
    function dJ(qW, qX) {
      const un = uf,
        qY = qX[un(0xd26)] - qW[un(0xd26)] - 0x1;
      for (let qZ in qW) {
        const r0 = qW[qZ + un(0xb72)];
        Array[un(0xdb8)](r0) && (qX[qZ] = r0[qY]);
      }
    }
    function dK(qW) {
      const uo = uf;
      dF[qW[uo(0x56f)]] = qW;
      for (let qX in di) {
        qW[qX] === void 0x0 && (qW[qX] = di[qX]);
      }
      qW[uo(0x716)] === df[uo(0x673)] &&
        (qW[uo(0xa50)] = cW[qW[uo(0xd26)] + 0x1] / 0x64),
        (qW[uo(0xb98)] =
          qW[uo(0x4be)] > 0x0
            ? dg(qW[uo(0xd26)], qW[uo(0x4be)])
            : qW[uo(0xb98)]),
        (qW[uo(0xadd)] =
          qW[uo(0x789)] > 0x0
            ? dg(qW[uo(0xd26)], qW[uo(0x789)])
            : qW[uo(0xadd)]),
        (qW[uo(0x142)] = dg(qW[uo(0xd26)], qW[uo(0xdf9)])),
        (qW[uo(0x589)] = dg(qW[uo(0xd26)], qW[uo(0x5cd)])),
        (qW[uo(0xa07)] = dg(qW[uo(0xd26)], qW[uo(0x729)])),
        (qW[uo(0x226)] = dg(qW[uo(0xd26)], qW[uo(0x2e4)])),
        (qW[uo(0x2b5)] = dg(qW[uo(0xd26)], qW[uo(0x9e7)])),
        (qW[uo(0x4d1)] = dg(qW[uo(0xd26)], qW[uo(0x812)])),
        (qW[uo(0x557)] = dg(qW[uo(0xd26)], qW[uo(0x8f4)])),
        (qW[uo(0x818)] = dg(qW[uo(0xd26)], qW[uo(0x778)])),
        qW[uo(0x97f)] &&
          ((qW[uo(0x7ba)] = dg(qW[uo(0xd26)], qW[uo(0xa11)])),
          (qW[uo(0xa56)] = dg(qW[uo(0xd26)], qW[uo(0x387)]))),
        qW[uo(0x605)] > 0x0
          ? (qW[uo(0xd70)] = dg(qW[uo(0xd26)], qW[uo(0x605)]))
          : (qW[uo(0xd70)] = 0x0),
        (qW[uo(0x20a)] = qW[uo(0xb32)]
          ? dg(qW[uo(0xd26)], qW[uo(0x7cf)])
          : 0x0),
        (qW[uo(0x82a)] = qW[uo(0x531)]
          ? dg(qW[uo(0xd26)], qW[uo(0x280)])
          : 0x0),
        (qW[uo(0xb1a)] = dg(qW[uo(0xd26)], qW[uo(0xcc4)])),
        dI[qW[uo(0xd26)]][uo(0xaba)](qW);
    }
    var dL = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dM = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dN = cV(uf(0x622));
    function dO(qW) {
      const up = uf;
      return JSON[up(0x21e)](JSON[up(0xa8a)](qW));
    }
    const dP = {};
    (dP[uf(0x56f)] = uf(0x7c1)),
      (dP[uf(0xc8d)] = uf(0x584)),
      (dP[uf(0x5a0)] = uf(0x995)),
      (dP[uf(0xd26)] = 0x0),
      (dP[uf(0x4be)] = 0x64),
      (dP[uf(0x789)] = 0x1e),
      (dP[uf(0x4e1)] = 0x32),
      (dP[uf(0x621)] = dN[uf(0x1df)]),
      (dP[uf(0xa4c)] = ![]),
      (dP[uf(0x548)] = !![]),
      (dP[uf(0xb32)] = ![]),
      (dP[uf(0x7cf)] = 0x0),
      (dP[uf(0x20a)] = 0x0),
      (dP[uf(0x186)] = ![]),
      (dP[uf(0xc10)] = ![]),
      (dP[uf(0xdec)] = 0x1),
      (dP[uf(0xca2)] = cS[uf(0x644)]),
      (dP[uf(0x669)] = 0x0),
      (dP[uf(0x4d8)] = 0x0),
      (dP[uf(0xc93)] = 0.5),
      (dP[uf(0xb7d)] = 0x0),
      (dP[uf(0x181)] = 0x1e),
      (dP[uf(0xb92)] = 0x0),
      (dP[uf(0x5bd)] = ![]),
      (dP[uf(0x280)] = 0x0),
      (dP[uf(0x4a9)] = 0x0),
      (dP[uf(0x372)] = 11.5),
      (dP[uf(0xde4)] = 0x4),
      (dP[uf(0x322)] = !![]),
      (dP[uf(0x53c)] = 0x0),
      (dP[uf(0xa25)] = 0x0),
      (dP[uf(0x2c6)] = 0x1),
      (dP[uf(0x3ae)] = 0x0),
      (dP[uf(0x1f1)] = 0x0),
      (dP[uf(0x3fd)] = 0x0),
      (dP[uf(0x931)] = 0x0),
      (dP[uf(0x9fb)] = 0x1);
    var dQ = dP;
    const dR = {};
    (dR[uf(0x56f)] = uf(0xa53)),
      (dR[uf(0xc8d)] = uf(0x5f0)),
      (dR[uf(0x5a0)] = uf(0x601)),
      (dR[uf(0x4be)] = 0x2ee),
      (dR[uf(0x789)] = 0xa),
      (dR[uf(0x4e1)] = 0x32),
      (dR[uf(0x186)] = !![]),
      (dR[uf(0xc10)] = !![]),
      (dR[uf(0xdec)] = 0.05),
      (dR[uf(0x372)] = 0x5),
      (dR[uf(0x35f)] = !![]),
      (dR[uf(0xbee)] = [[uf(0x627), 0x3]]),
      (dR[uf(0xba3)] = [
        [uf(0x258), 0x1],
        [uf(0x627), 0x2],
        [uf(0x628), 0x2],
        [uf(0xc0b), 0x1],
      ]),
      (dR[uf(0x73c)] = [[uf(0xb6e), "f"]]);
    const dS = {};
    (dS[uf(0x56f)] = uf(0x258)),
      (dS[uf(0xc8d)] = uf(0xae4)),
      (dS[uf(0x5a0)] = uf(0x252)),
      (dS[uf(0x4be)] = 0x1f4),
      (dS[uf(0x789)] = 0xa),
      (dS[uf(0x4e1)] = 0x28),
      (dS[uf(0x35f)] = !![]),
      (dS[uf(0xa4c)] = !![]),
      (dS[uf(0x73c)] = [
        [uf(0x456), "E"],
        [uf(0x1fe), "G"],
        [uf(0x338), "A"],
      ]);
    const dT = {};
    (dT[uf(0x56f)] = uf(0x627)),
      (dT[uf(0xc8d)] = uf(0x542)),
      (dT[uf(0x5a0)] = uf(0xbec)),
      (dT[uf(0x4be)] = 0x64),
      (dT[uf(0x789)] = 0xa),
      (dT[uf(0x4e1)] = 0x1c),
      (dT[uf(0xa4c)] = !![]),
      (dT[uf(0x73c)] = [[uf(0x456), "I"]]);
    const dU = {};
    (dU[uf(0x56f)] = uf(0x628)),
      (dU[uf(0xc8d)] = uf(0x1e6)),
      (dU[uf(0x5a0)] = uf(0x80a)),
      (dU[uf(0x4be)] = 62.5),
      (dU[uf(0x789)] = 0xa),
      (dU[uf(0x4e1)] = 0x1c),
      (dU[uf(0x73c)] = [[uf(0x133), "H"]]);
    const dV = {};
    (dV[uf(0x56f)] = uf(0xc0b)),
      (dV[uf(0xc8d)] = uf(0xb60)),
      (dV[uf(0x5a0)] = uf(0xd7a)),
      (dV[uf(0x4be)] = 0x19),
      (dV[uf(0x789)] = 0xa),
      (dV[uf(0x4e1)] = 0x19),
      (dV[uf(0xa4c)] = ![]),
      (dV[uf(0x548)] = ![]),
      (dV[uf(0x73c)] = [
        [uf(0xd36), "F"],
        [uf(0x133), "F"],
        [uf(0x5fd), "G"],
        [uf(0xda7), "F"],
      ]);
    var dW = [dR, dS, dT, dU, dV];
    function dX() {
      const uq = uf,
        qW = dO(dW);
      for (let qX = 0x0; qX < qW[uq(0x441)]; qX++) {
        const qY = qW[qX];
        (qY[uq(0x5a0)] += uq(0x8d6)),
          qY[uq(0x56f)] === uq(0xa53) &&
            (qY[uq(0x73c)] = [
              [uq(0x464), "D"],
              [uq(0x7c0), "E"],
            ]),
          (qY[uq(0x56f)] = dY(qY[uq(0x56f)])),
          (qY[uq(0xc8d)] = dY(qY[uq(0xc8d)])),
          (qY[uq(0x789)] *= 0x2),
          qY[uq(0xbee)] &&
            qY[uq(0xbee)][uq(0xd78)]((qZ) => {
              return (qZ[0x0] = dY(qZ[0x0])), qZ;
            }),
          qY[uq(0xba3)] &&
            qY[uq(0xba3)][uq(0xd78)]((qZ) => {
              return (qZ[0x0] = dY(qZ[0x0])), qZ;
            });
      }
      return qW;
    }
    function dY(qW) {
      const ur = uf;
      return qW[ur(0xa27)](/Ant/g, ur(0x494))[ur(0xa27)](/ant/g, ur(0x805));
    }
    const dZ = {};
    (dZ[uf(0x56f)] = uf(0x176)),
      (dZ[uf(0xc8d)] = uf(0x356)),
      (dZ[uf(0x5a0)] = uf(0x2c8)),
      (dZ[uf(0x4be)] = 37.5),
      (dZ[uf(0x789)] = 0x32),
      (dZ[uf(0x4e1)] = 0x28),
      (dZ[uf(0x73c)] = [
        [uf(0x31d), "F"],
        [uf(0x719), "I"],
      ]),
      (dZ[uf(0x53c)] = 0x4),
      (dZ[uf(0xa25)] = 0x4);
    const e0 = {};
    (e0[uf(0x56f)] = uf(0xc1e)),
      (e0[uf(0xc8d)] = uf(0x58a)),
      (e0[uf(0x5a0)] = uf(0x377)),
      (e0[uf(0x4be)] = 0x5e),
      (e0[uf(0x789)] = 0x5),
      (e0[uf(0xdec)] = 0.05),
      (e0[uf(0x4e1)] = 0x3c),
      (e0[uf(0x186)] = !![]),
      (e0[uf(0x73c)] = [[uf(0xc1e), "h"]]);
    const e1 = {};
    (e1[uf(0x56f)] = uf(0x1a0)),
      (e1[uf(0xc8d)] = uf(0xb15)),
      (e1[uf(0x5a0)] = uf(0xd22)),
      (e1[uf(0x4be)] = 0x4b),
      (e1[uf(0x789)] = 0xa),
      (e1[uf(0xdec)] = 0.05),
      (e1[uf(0x186)] = !![]),
      (e1[uf(0x84a)] = 1.25),
      (e1[uf(0x73c)] = [
        [uf(0x1a0), "h"],
        [uf(0x745), "J"],
        [uf(0xcb0), "K"],
      ]);
    const e2 = {};
    (e2[uf(0x56f)] = uf(0x3f1)),
      (e2[uf(0xc8d)] = uf(0x2e7)),
      (e2[uf(0x5a0)] = uf(0x512)),
      (e2[uf(0x4be)] = 62.5),
      (e2[uf(0x789)] = 0x32),
      (e2[uf(0xa4c)] = !![]),
      (e2[uf(0x4e1)] = 0x28),
      (e2[uf(0x73c)] = [
        [uf(0xb74), "f"],
        [uf(0x3b2), "I"],
        [uf(0xd5a), "K"],
      ]),
      (e2[uf(0xca2)] = cS[uf(0x6b8)]),
      (e2[uf(0x4d8)] = 0xa),
      (e2[uf(0x669)] = 0x5),
      (e2[uf(0x181)] = 0x26),
      (e2[uf(0xc93)] = 0.375 / 1.1),
      (e2[uf(0xb7d)] = 0.75),
      (e2[uf(0x621)] = dN[uf(0x512)]);
    const e3 = {};
    (e3[uf(0x56f)] = uf(0x691)),
      (e3[uf(0xc8d)] = uf(0x7e3)),
      (e3[uf(0x5a0)] = uf(0xd2d)),
      (e3[uf(0x4be)] = 87.5),
      (e3[uf(0x789)] = 0xa),
      (e3[uf(0x73c)] = [
        [uf(0xd36), "f"],
        [uf(0x432), "f"],
      ]),
      (e3[uf(0x53c)] = 0x5),
      (e3[uf(0xa25)] = 0x5);
    const e4 = {};
    (e4[uf(0x56f)] = uf(0xd19)),
      (e4[uf(0xc8d)] = uf(0xa89)),
      (e4[uf(0x5a0)] = uf(0x995)),
      (e4[uf(0x4be)] = 0x64),
      (e4[uf(0x789)] = 0x1e),
      (e4[uf(0xa4c)] = !![]),
      (e4[uf(0x73c)] = [[uf(0xc6b), "F"]]),
      (e4[uf(0x53c)] = 0x5),
      (e4[uf(0xa25)] = 0x5);
    const e5 = {};
    (e5[uf(0x56f)] = uf(0xd54)),
      (e5[uf(0xc8d)] = uf(0xaa9)),
      (e5[uf(0x5a0)] = uf(0xaaf)),
      (e5[uf(0x4be)] = 62.5),
      (e5[uf(0x789)] = 0xf),
      (e5[uf(0xb32)] = !![]),
      (e5[uf(0x7cf)] = 0xf),
      (e5[uf(0x4e1)] = 0x23),
      (e5[uf(0xa4c)] = !![]),
      (e5[uf(0x73c)] = [
        [uf(0x52a), "F"],
        [uf(0x4a1), "F"],
        [uf(0xb06), "L"],
        [uf(0x6b5), "G"],
      ]);
    const e6 = {};
    (e6[uf(0x56f)] = uf(0xa8f)),
      (e6[uf(0xc8d)] = uf(0x996)),
      (e6[uf(0x5a0)] = uf(0x86c)),
      (e6[uf(0x4be)] = 0x64),
      (e6[uf(0x789)] = 0xf),
      (e6[uf(0xb32)] = !![]),
      (e6[uf(0x7cf)] = 0xa),
      (e6[uf(0x4e1)] = 0x2f),
      (e6[uf(0xa4c)] = !![]),
      (e6[uf(0x73c)] = [
        [uf(0x872), "F"],
        [uf(0x695), "F"],
      ]),
      (e6[uf(0xca2)] = cS[uf(0x53d)]),
      (e6[uf(0x4d8)] = 0x3),
      (e6[uf(0x669)] = 0x5),
      (e6[uf(0xb92)] = 0x7),
      (e6[uf(0x181)] = 0x2b),
      (e6[uf(0xc93)] = 0.21),
      (e6[uf(0xb7d)] = -0.31),
      (e6[uf(0x621)] = dN[uf(0xcf1)]);
    const e7 = {};
    (e7[uf(0x56f)] = uf(0x3ca)),
      (e7[uf(0xc8d)] = uf(0xc92)),
      (e7[uf(0x5a0)] = uf(0x898)),
      (e7[uf(0x4be)] = 0x15e),
      (e7[uf(0x789)] = 0x28),
      (e7[uf(0x4e1)] = 0x2d),
      (e7[uf(0xa4c)] = !![]),
      (e7[uf(0x35f)] = !![]),
      (e7[uf(0x73c)] = [
        [uf(0x8ce), "F"],
        [uf(0x259), "G"],
        [uf(0x7c8), "H"],
        [uf(0xd73), "J"],
      ]);
    const e8 = {};
    (e8[uf(0x56f)] = uf(0x1d9)),
      (e8[uf(0xc8d)] = uf(0xb25)),
      (e8[uf(0x5a0)] = uf(0x645)),
      (e8[uf(0x4be)] = 0x7d),
      (e8[uf(0x789)] = 0x19),
      (e8[uf(0xa4c)] = !![]),
      (e8[uf(0x5bd)] = !![]),
      (e8[uf(0x280)] = 0x5),
      (e8[uf(0x4a9)] = 0x2),
      (e8[uf(0x111)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e8[uf(0xde4)] = 0x4),
      (e8[uf(0x372)] = 0x6),
      (e8[uf(0x73c)] = [[uf(0x8b2), "F"]]);
    const e9 = {};
    (e9[uf(0x56f)] = uf(0x93f)),
      (e9[uf(0xc8d)] = uf(0xd7d)),
      (e9[uf(0x5a0)] = uf(0x67e)),
      (e9[uf(0x4be)] = 0.5),
      (e9[uf(0x789)] = 0x5),
      (e9[uf(0xa4c)] = ![]),
      (e9[uf(0x548)] = ![]),
      (e9[uf(0xde4)] = 0x1),
      (e9[uf(0x73c)] = [[uf(0x93f), "F"]]);
    const ea = {};
    (ea[uf(0x56f)] = uf(0x385)),
      (ea[uf(0xc8d)] = uf(0xa5c)),
      (ea[uf(0x5a0)] = uf(0xce5)),
      (ea[uf(0x4be)] = 0x19),
      (ea[uf(0x789)] = 0xa),
      (ea[uf(0x4e1)] = 0x28),
      (ea[uf(0x382)] = cS[uf(0x5ef)]),
      (ea[uf(0x73c)] = [
        [uf(0x133), "J"],
        [uf(0x206), "J"],
      ]);
    const eb = {};
    (eb[uf(0x56f)] = uf(0xbcb)),
      (eb[uf(0xc8d)] = uf(0x9c2)),
      (eb[uf(0x5a0)] = uf(0x905)),
      (eb[uf(0x4be)] = 0x19),
      (eb[uf(0x789)] = 0xa),
      (eb[uf(0x4e1)] = 0x28),
      (eb[uf(0x382)] = cS[uf(0xddf)]),
      (eb[uf(0xa4c)] = !![]),
      (eb[uf(0x73c)] = [
        [uf(0x872), "J"],
        [uf(0x3e9), "J"],
      ]);
    const ec = {};
    (ec[uf(0x56f)] = uf(0x52b)),
      (ec[uf(0xc8d)] = uf(0x699)),
      (ec[uf(0x5a0)] = uf(0x563)),
      (ec[uf(0x4be)] = 0x19),
      (ec[uf(0x789)] = 0xa),
      (ec[uf(0x4e1)] = 0x28),
      (ec[uf(0x382)] = cS[uf(0x75f)]),
      (ec[uf(0x548)] = ![]),
      (ec[uf(0x73c)] = [
        [uf(0x720), "J"],
        [uf(0x3d3), "H"],
        [uf(0x53b), "J"],
      ]),
      (ec[uf(0xde4)] = 0x17),
      (ec[uf(0x372)] = 0x17 * 0.75);
    const ed = {};
    (ed[uf(0x56f)] = uf(0x647)),
      (ed[uf(0xc8d)] = uf(0x614)),
      (ed[uf(0x5a0)] = uf(0x951)),
      (ed[uf(0x4be)] = 87.5),
      (ed[uf(0x789)] = 0xa),
      (ed[uf(0x73c)] = [
        [uf(0xb63), "F"],
        [uf(0x6cb), "I"],
      ]),
      (ed[uf(0x53c)] = 0x5),
      (ed[uf(0xa25)] = 0x5);
    const ee = {};
    (ee[uf(0x56f)] = uf(0xbd2)),
      (ee[uf(0xc8d)] = uf(0xbb1)),
      (ee[uf(0x5a0)] = uf(0x91e)),
      (ee[uf(0x4be)] = 87.5),
      (ee[uf(0x789)] = 0xa),
      (ee[uf(0x73c)] = [
        [uf(0x432), "A"],
        [uf(0xb63), "A"],
      ]),
      (ee[uf(0x53c)] = 0x5),
      (ee[uf(0xa25)] = 0x5);
    const ef = {};
    (ef[uf(0x56f)] = uf(0x54f)),
      (ef[uf(0xc8d)] = uf(0x4a0)),
      (ef[uf(0x5a0)] = uf(0x1f3)),
      (ef[uf(0x4be)] = 0x32),
      (ef[uf(0x789)] = 0xa),
      (ef[uf(0xdec)] = 0.05),
      (ef[uf(0x4e1)] = 0x3c),
      (ef[uf(0x186)] = !![]),
      (ef[uf(0x73c)] = [
        [uf(0x610), "E"],
        [uf(0x80b), "F"],
        [uf(0x854), "F"],
      ]);
    const eg = {};
    (eg[uf(0x56f)] = uf(0x9c6)),
      (eg[uf(0xc8d)] = uf(0xc6e)),
      (eg[uf(0x5a0)] = uf(0x9bd)),
      (eg[uf(0x4be)] = 0x7d),
      (eg[uf(0x789)] = 0x28),
      (eg[uf(0x4e1)] = 0x32),
      (eg[uf(0xa4c)] = ![]),
      (eg[uf(0x548)] = ![]),
      (eg[uf(0x621)] = dN[uf(0x9bd)]),
      (eg[uf(0xde4)] = 0xe),
      (eg[uf(0x372)] = 0xb),
      (eg[uf(0x2c6)] = 2.2),
      (eg[uf(0x73c)] = [
        [uf(0xd61), "J"],
        [uf(0x720), "H"],
      ]);
    const eh = {};
    (eh[uf(0x56f)] = uf(0xc82)),
      (eh[uf(0xc8d)] = uf(0x166)),
      (eh[uf(0x5a0)] = uf(0xc8c)),
      (eh[uf(0x4be)] = 0x7d),
      (eh[uf(0x789)] = 0x28),
      (eh[uf(0x4e1)] = null),
      (eh[uf(0xa4c)] = !![]),
      (eh[uf(0x6d2)] = !![]),
      (eh[uf(0x73c)] = [
        [uf(0x4d7), "D"],
        [uf(0x2a7), "E"],
        [uf(0xc85), "E"],
      ]),
      (eh[uf(0x4e1)] = 0x32),
      (eh[uf(0xbab)] = 0x32),
      (eh[uf(0x6d1)] = !![]),
      (eh[uf(0x3ae)] = -Math["PI"] / 0x2),
      (eh[uf(0xca2)] = cS[uf(0x728)]),
      (eh[uf(0x4d8)] = 0x3),
      (eh[uf(0x669)] = 0x3),
      (eh[uf(0x181)] = 0x21),
      (eh[uf(0xc93)] = 0.32),
      (eh[uf(0xb7d)] = 0.4),
      (eh[uf(0x621)] = dN[uf(0x512)]);
    const ei = {};
    (ei[uf(0x56f)] = uf(0x8d3)),
      (ei[uf(0xc8d)] = uf(0xc54)),
      (ei[uf(0x5a0)] = uf(0xd57)),
      (ei[uf(0x4be)] = 0x96),
      (ei[uf(0x789)] = 0x14),
      (ei[uf(0xa4c)] = !![]),
      (ei[uf(0x1f1)] = 0.5),
      (ei[uf(0x73c)] = [
        [uf(0x8d3), "D"],
        [uf(0x3d3), "J"],
        [uf(0x720), "J"],
      ]);
    const ej = {};
    (ej[uf(0x56f)] = uf(0xbf1)),
      (ej[uf(0xc8d)] = uf(0xdd8)),
      (ej[uf(0x5a0)] = uf(0x454)),
      (ej[uf(0x4be)] = 0x19),
      (ej[uf(0x789)] = 0xf),
      (ej[uf(0xdec)] = 0.05),
      (ej[uf(0x4e1)] = 0x37),
      (ej[uf(0x186)] = !![]),
      (ej[uf(0x73c)] = [[uf(0xbf1), "h"]]),
      (ej[uf(0xca2)] = cS[uf(0x562)]),
      (ej[uf(0x3fd)] = 0x9),
      (ej[uf(0x181)] = 0x28),
      (ej[uf(0x4d8)] = 0xf),
      (ej[uf(0x669)] = 2.5),
      (ej[uf(0x181)] = 0x21),
      (ej[uf(0xc93)] = 0.32),
      (ej[uf(0xb7d)] = 1.8),
      (ej[uf(0x931)] = 0x14);
    const ek = {};
    (ek[uf(0x56f)] = uf(0xe0d)),
      (ek[uf(0xc8d)] = uf(0xa62)),
      (ek[uf(0x5a0)] = uf(0x608)),
      (ek[uf(0x4be)] = 0xe1),
      (ek[uf(0x789)] = 0xa),
      (ek[uf(0x4e1)] = 0x32),
      (ek[uf(0x73c)] = [
        [uf(0xe0d), "H"],
        [uf(0x464), "L"],
      ]),
      (ek[uf(0x6d2)] = !![]),
      (ek[uf(0xbf2)] = !![]),
      (ek[uf(0x372)] = 0x23);
    const em = {};
    (em[uf(0x56f)] = uf(0x2f3)),
      (em[uf(0xc8d)] = uf(0xcb2)),
      (em[uf(0x5a0)] = uf(0x143)),
      (em[uf(0x4be)] = 0x96),
      (em[uf(0x789)] = 0x19),
      (em[uf(0x4e1)] = 0x2f),
      (em[uf(0xa4c)] = !![]),
      (em[uf(0x73c)] = [[uf(0x720), "J"]]),
      (em[uf(0xca2)] = null),
      (em[uf(0x621)] = dN[uf(0xcf1)]);
    const en = {};
    (en[uf(0x56f)] = uf(0x89a)),
      (en[uf(0xc8d)] = uf(0xa19)),
      (en[uf(0x5a0)] = uf(0x6c9)),
      (en[uf(0x4be)] = 0x64),
      (en[uf(0x789)] = 0x1e),
      (en[uf(0x4e1)] = 0x1e),
      (en[uf(0xa4c)] = !![]),
      (en[uf(0xbd4)] = uf(0x7c0)),
      (en[uf(0x73c)] = [
        [uf(0x7c0), "F"],
        [uf(0x6b5), "E"],
        [uf(0x296), "D"],
        [uf(0xcbb), "E"],
      ]);
    const eo = {};
    (eo[uf(0x56f)] = uf(0x6bb)),
      (eo[uf(0xc8d)] = uf(0xd30)),
      (eo[uf(0x5a0)] = uf(0x289)),
      (eo[uf(0x4be)] = 0x64),
      (eo[uf(0x789)] = 0xa),
      (eo[uf(0x4e1)] = 0x3c),
      (eo[uf(0x186)] = !![]),
      (eo[uf(0xdec)] = 0.05),
      (eo[uf(0x73c)] = [[uf(0x6bb), "D"]]);
    const ep = {};
    (ep[uf(0x56f)] = uf(0x337)),
      (ep[uf(0xc8d)] = uf(0xc38)),
      (ep[uf(0x5a0)] = uf(0x63a)),
      (ep[uf(0x4be)] = 0x64),
      (ep[uf(0x789)] = 0x23),
      (ep[uf(0xa4c)] = !![]),
      (ep[uf(0x73c)] = [
        [uf(0x86d), "E"],
        [uf(0x7e5), "D"],
      ]);
    const eq = {};
    (eq[uf(0x56f)] = uf(0xc67)),
      (eq[uf(0xc8d)] = uf(0x721)),
      (eq[uf(0x5a0)] = uf(0x554)),
      (eq[uf(0x4be)] = 0xc8),
      (eq[uf(0x789)] = 0x23),
      (eq[uf(0x4e1)] = 0x23),
      (eq[uf(0xa4c)] = !![]),
      (eq[uf(0xa25)] = 0x5),
      (eq[uf(0x73c)] = [
        [uf(0x3e0), "F"],
        [uf(0x4de), "D"],
        [uf(0x60b), "E"],
      ]);
    const er = {};
    (er[uf(0x56f)] = uf(0xb69)),
      (er[uf(0xc8d)] = uf(0x867)),
      (er[uf(0x5a0)] = uf(0x4b3)),
      (er[uf(0x4be)] = 0xc8),
      (er[uf(0x789)] = 0x14),
      (er[uf(0x4e1)] = 0x28),
      (er[uf(0xa4c)] = !![]),
      (er[uf(0x73c)] = [
        [uf(0x35b), "E"],
        [uf(0xcaa), "D"],
        [uf(0x8d6), "F"],
        [uf(0x392), "F"],
      ]),
      (er[uf(0xc6a)] = !![]),
      (er[uf(0x9bb)] = 0xbb8),
      (er[uf(0xcd3)] = 0.3);
    const es = {};
    (es[uf(0x56f)] = uf(0x41d)),
      (es[uf(0xc8d)] = uf(0x523)),
      (es[uf(0x5a0)] = uf(0xd66)),
      (es[uf(0x4be)] = 0x78),
      (es[uf(0x789)] = 0x1e),
      (es[uf(0xbf2)] = !![]),
      (es[uf(0x372)] = 0xf),
      (es[uf(0xde4)] = 0x5),
      (es[uf(0x73c)] = [
        [uf(0x41d), "F"],
        [uf(0xdfc), "E"],
        [uf(0xcda), "D"],
      ]),
      (es[uf(0xa25)] = 0x3);
    const et = {};
    (et[uf(0x56f)] = uf(0x7f2)),
      (et[uf(0xc8d)] = uf(0x619)),
      (et[uf(0x5a0)] = uf(0x485)),
      (et[uf(0x4be)] = 0x78),
      (et[uf(0x789)] = 0x23),
      (et[uf(0x4e1)] = 0x32),
      (et[uf(0xa4c)] = !![]),
      (et[uf(0x443)] = !![]),
      (et[uf(0x73c)] = [
        [uf(0x7f2), "E"],
        [uf(0x854), "F"],
      ]),
      (et[uf(0xbee)] = [[uf(0x11e), 0x1]]),
      (et[uf(0xba3)] = [[uf(0x11e), 0x2]]),
      (et[uf(0xb67)] = !![]);
    const eu = {};
    (eu[uf(0x56f)] = uf(0x11e)),
      (eu[uf(0xc8d)] = uf(0x668)),
      (eu[uf(0x5a0)] = uf(0x45e)),
      (eu[uf(0x4be)] = 0x96),
      (eu[uf(0x789)] = 0.1),
      (eu[uf(0x4e1)] = 0x28),
      (eu[uf(0xde4)] = 0xe),
      (eu[uf(0x372)] = 11.6),
      (eu[uf(0xa4c)] = !![]),
      (eu[uf(0x443)] = !![]),
      (eu[uf(0x4cc)] = !![]),
      (eu[uf(0x621)] = dN[uf(0x9bd)]),
      (eu[uf(0xa0f)] = 0xa),
      (eu[uf(0x73c)] = [[uf(0xbc4), "G"]]),
      (eu[uf(0x9fb)] = 0.5);
    const ev = {};
    (ev[uf(0x56f)] = uf(0x410)),
      (ev[uf(0xc8d)] = uf(0x3bf)),
      (ev[uf(0x5a0)] = uf(0x63e)),
      (ev[uf(0x4be)] = 0x1f4),
      (ev[uf(0x789)] = 0x28),
      (ev[uf(0xdec)] = 0.05),
      (ev[uf(0x4e1)] = 0x32),
      (ev[uf(0x186)] = !![]),
      (ev[uf(0x372)] = 0x5),
      (ev[uf(0xc10)] = !![]),
      (ev[uf(0x35f)] = !![]),
      (ev[uf(0x73c)] = [
        [uf(0xc5e), "F"],
        [uf(0xd5a), "C"],
      ]),
      (ev[uf(0xbee)] = [
        [uf(0x176), 0x2],
        [uf(0x3f1), 0x1],
      ]),
      (ev[uf(0xba3)] = [
        [uf(0x176), 0x4],
        [uf(0x3f1), 0x2],
      ]);
    const ew = {};
    (ew[uf(0x56f)] = uf(0x771)),
      (ew[uf(0xc8d)] = uf(0xd75)),
      (ew[uf(0x5a0)] = uf(0x4e9)),
      (ew[uf(0x4be)] = 0x50),
      (ew[uf(0x789)] = 0x28),
      (ew[uf(0xde4)] = 0x2),
      (ew[uf(0x372)] = 0x6),
      (ew[uf(0x6d2)] = !![]),
      (ew[uf(0x73c)] = [[uf(0x771), "F"]]);
    const ex = {};
    (ex[uf(0x56f)] = uf(0x475)),
      (ex[uf(0xc8d)] = uf(0xdf6)),
      (ex[uf(0x5a0)] = uf(0x68b)),
      (ex[uf(0x4be)] = 0x1f4),
      (ex[uf(0x789)] = 0x28),
      (ex[uf(0xdec)] = 0.05),
      (ex[uf(0x4e1)] = 0x46),
      (ex[uf(0x372)] = 0x5),
      (ex[uf(0x186)] = !![]),
      (ex[uf(0xc10)] = !![]),
      (ex[uf(0x35f)] = !![]),
      (ex[uf(0x73c)] = [
        [uf(0xc61), "A"],
        [uf(0x4a1), "E"],
      ]),
      (ex[uf(0xbee)] = [[uf(0xd54), 0x2]]),
      (ex[uf(0xba3)] = [
        [uf(0xd54), 0x3],
        [uf(0x89a), 0x2],
      ]);
    const ey = {};
    (ey[uf(0x56f)] = uf(0x2f5)),
      (ey[uf(0xc8d)] = uf(0xad0)),
      (ey[uf(0x5a0)] = uf(0xa9c)),
      (ey[uf(0x4e1)] = 0x28),
      (ey[uf(0x4be)] = 0x64),
      (ey[uf(0x789)] = 0xa),
      (ey[uf(0xdec)] = 0.05),
      (ey[uf(0x186)] = !![]),
      (ey[uf(0x53c)] = 0x1),
      (ey[uf(0xa25)] = 0x1),
      (ey[uf(0x73c)] = [
        [uf(0x4de), "G"],
        [uf(0x3d3), "F"],
        [uf(0x4a4), "F"],
      ]);
    const ez = {};
    (ez[uf(0x56f)] = uf(0x428)),
      (ez[uf(0xc8d)] = uf(0x665)),
      (ez[uf(0x5a0)] = uf(0xde2)),
      (ez[uf(0x4be)] = 0x3c),
      (ez[uf(0x789)] = 0x28),
      (ez[uf(0x4e1)] = 0x32),
      (ez[uf(0xa4c)] = ![]),
      (ez[uf(0x548)] = ![]),
      (ez[uf(0x621)] = dN[uf(0x9bd)]),
      (ez[uf(0xde4)] = 0xe),
      (ez[uf(0x372)] = 0xb),
      (ez[uf(0x2c6)] = 2.2),
      (ez[uf(0x73c)] = [
        [uf(0x7e5), "E"],
        [uf(0x720), "J"],
      ]);
    const eA = {};
    (eA[uf(0x56f)] = uf(0x3cc)),
      (eA[uf(0xc8d)] = uf(0x220)),
      (eA[uf(0x5a0)] = uf(0xa65)),
      (eA[uf(0x4be)] = 0x258),
      (eA[uf(0x789)] = 0x32),
      (eA[uf(0xdec)] = 0.05),
      (eA[uf(0x4e1)] = 0x3c),
      (eA[uf(0x372)] = 0x7),
      (eA[uf(0x35f)] = !![]),
      (eA[uf(0x186)] = !![]),
      (eA[uf(0xc10)] = !![]),
      (eA[uf(0x73c)] = [
        [uf(0x35b), "A"],
        [uf(0xd61), "G"],
      ]),
      (eA[uf(0xbee)] = [[uf(0xb69), 0x1]]),
      (eA[uf(0xba3)] = [[uf(0xb69), 0x1]]);
    const eB = {};
    (eB[uf(0x56f)] = uf(0x88f)),
      (eB[uf(0xc8d)] = uf(0x44f)),
      (eB[uf(0x5a0)] = uf(0xb07)),
      (eB[uf(0x4be)] = 0xc8),
      (eB[uf(0x789)] = 0x1e),
      (eB[uf(0x4e1)] = 0x2d),
      (eB[uf(0xa4c)] = !![]),
      (eB[uf(0x73c)] = [
        [uf(0x8ce), "G"],
        [uf(0x259), "H"],
        [uf(0xcda), "E"],
      ]);
    const eC = {};
    (eC[uf(0x56f)] = uf(0xc8f)),
      (eC[uf(0xc8d)] = uf(0x871)),
      (eC[uf(0x5a0)] = uf(0x2bf)),
      (eC[uf(0x4be)] = 0x3c),
      (eC[uf(0x789)] = 0x64),
      (eC[uf(0x4e1)] = 0x28),
      (eC[uf(0x55e)] = !![]),
      (eC[uf(0x322)] = ![]),
      (eC[uf(0xa4c)] = !![]),
      (eC[uf(0x73c)] = [
        [uf(0xcaa), "F"],
        [uf(0x133), "D"],
        [uf(0x3d8), "G"],
      ]);
    const eD = {};
    (eD[uf(0x56f)] = uf(0x6cc)),
      (eD[uf(0xc8d)] = uf(0x4c4)),
      (eD[uf(0x5a0)] = uf(0x216)),
      (eD[uf(0x4e1)] = 0x28),
      (eD[uf(0x4be)] = 0x5a),
      (eD[uf(0x789)] = 0x5),
      (eD[uf(0xdec)] = 0.05),
      (eD[uf(0x186)] = !![]),
      (eD[uf(0x73c)] = [[uf(0x6cc), "h"]]);
    const eE = {};
    (eE[uf(0x56f)] = uf(0xacd)),
      (eE[uf(0xc8d)] = uf(0xa22)),
      (eE[uf(0x5a0)] = uf(0x948)),
      (eE[uf(0x4be)] = 0x32),
      (eE[uf(0x789)] = 0x14),
      (eE[uf(0x4e1)] = 0x28),
      (eE[uf(0x6d2)] = !![]),
      (eE[uf(0x73c)] = [[uf(0xacd), "F"]]);
    const eF = {};
    (eF[uf(0x56f)] = uf(0xbdf)),
      (eF[uf(0xc8d)] = uf(0x229)),
      (eF[uf(0x5a0)] = uf(0x92e)),
      (eF[uf(0x4be)] = 0x32),
      (eF[uf(0x789)] = 0x14),
      (eF[uf(0xdec)] = 0.05),
      (eF[uf(0x186)] = !![]),
      (eF[uf(0x73c)] = [[uf(0xbdf), "J"]]);
    const eG = {};
    (eG[uf(0x56f)] = uf(0x927)),
      (eG[uf(0xc8d)] = uf(0x28e)),
      (eG[uf(0x5a0)] = uf(0x7ac)),
      (eG[uf(0x4be)] = 0x64),
      (eG[uf(0x789)] = 0x1e),
      (eG[uf(0xdec)] = 0.05),
      (eG[uf(0x4e1)] = 0x32),
      (eG[uf(0x186)] = !![]),
      (eG[uf(0x73c)] = [
        [uf(0xcaa), "D"],
        [uf(0x89d), "E"],
      ]);
    const eH = {};
    (eH[uf(0x56f)] = uf(0x4d2)),
      (eH[uf(0xc8d)] = uf(0x844)),
      (eH[uf(0x5a0)] = uf(0xbef)),
      (eH[uf(0x4be)] = 0x96),
      (eH[uf(0x789)] = 0x14),
      (eH[uf(0x4e1)] = 0x28),
      (eH[uf(0x73c)] = [
        [uf(0x739), "D"],
        [uf(0xdfc), "F"],
      ]),
      (eH[uf(0xba3)] = [[uf(0xc0b), 0x1, 0.3]]);
    const eI = {};
    (eI[uf(0x56f)] = uf(0xaa5)),
      (eI[uf(0xc8d)] = uf(0x169)),
      (eI[uf(0x5a0)] = uf(0x425)),
      (eI[uf(0x4be)] = 0x32),
      (eI[uf(0x789)] = 0x5),
      (eI[uf(0xdec)] = 0.05),
      (eI[uf(0x186)] = !![]),
      (eI[uf(0x73c)] = [
        [uf(0xaa5), "h"],
        [uf(0x133), "J"],
      ]);
    const eJ = {};
    (eJ[uf(0x56f)] = uf(0x4e7)),
      (eJ[uf(0xc8d)] = uf(0x865)),
      (eJ[uf(0x5a0)] = uf(0x5d4)),
      (eJ[uf(0x4be)] = 0x64),
      (eJ[uf(0x789)] = 0x5),
      (eJ[uf(0xdec)] = 0.05),
      (eJ[uf(0x186)] = !![]),
      (eJ[uf(0x73c)] = [[uf(0x4e7), "h"]]);
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
      eL = eK[uf(0x441)],
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
      (eN[qW] = [qX]), (qX[uf(0x5a0)] = cS[qX[uf(0x5a0)]]), eR(qX);
      qX[uf(0x73c)] &&
        qX[uf(0x73c)][uf(0xd78)]((qZ) => {
          const us = uf;
          qZ[0x1] = qZ[0x1][us(0xa1a)]()[us(0x743)](0x0) - 0x41;
        });
      (qX["id"] = qW), (qX[uf(0xd3e)] = qW);
      if (!qX[uf(0x3ed)]) qX[uf(0x3ed)] = qX[uf(0x56f)];
      for (let qZ = 0x1; qZ <= db; qZ++) {
        const r0 = JSON[uf(0x21e)](JSON[uf(0xa8a)](qX));
        (r0[uf(0x56f)] = qX[uf(0x56f)] + "_" + qZ),
          (r0[uf(0xd26)] = qZ),
          (eN[qW][qZ] = r0),
          dJ(qX, r0),
          eR(r0),
          (r0["id"] = eK[uf(0x441)]),
          eK[uf(0xaba)](r0);
      }
    }
    for (let r1 = 0x0; r1 < eK[uf(0x441)]; r1++) {
      const r2 = eK[r1];
      r2[uf(0xbee)] && eQ(r2, r2[uf(0xbee)]),
        r2[uf(0xba3)] && eQ(r2, r2[uf(0xba3)]);
    }
    function eQ(r3, r4) {
      const ut = uf;
      r4[ut(0xd78)]((r5) => {
        const uu = ut,
          r6 = r5[0x0] + (r3[uu(0xd26)] > 0x0 ? "_" + r3[uu(0xd26)] : "");
        r5[0x0] = eM[r6];
      });
    }
    function eR(r3) {
      const uv = uf;
      (r3[uv(0xb98)] = dg(r3[uv(0xd26)], r3[uv(0x4be)]) * dL[r3[uv(0xd26)]]),
        (r3[uv(0xadd)] = dg(r3[uv(0xd26)], r3[uv(0x789)])),
        r3[uv(0x6d1)]
          ? (r3[uv(0xbab)] = r3[uv(0x4e1)])
          : (r3[uv(0xbab)] = r3[uv(0x4e1)] * dM[r3[uv(0xd26)]]),
        (r3[uv(0x20a)] = dg(r3[uv(0xd26)], r3[uv(0x7cf)])),
        (r3[uv(0xcd8)] = dg(r3[uv(0xd26)], r3[uv(0x4d8)])),
        (r3[uv(0xd04)] = dg(r3[uv(0xd26)], r3[uv(0x669)]) * dL[r3[uv(0xd26)]]),
        (r3[uv(0x689)] = dg(r3[uv(0xd26)], r3[uv(0xb92)])),
        r3[uv(0xcd3)] && (r3[uv(0x59b)] = dg(r3[uv(0xd26)], r3[uv(0xcd3)])),
        (r3[uv(0x82a)] = dg(r3[uv(0xd26)], r3[uv(0x280)])),
        (eM[r3[uv(0x56f)]] = r3),
        eO[r3[uv(0xd26)]][uv(0xaba)](r3);
    }
    function eS(r3) {
      return (r3 / 0xff) * Math["PI"] * 0x2;
    }
    var eT = Math["PI"] * 0x2;
    function eU(r3) {
      const uw = uf;
      return (
        (r3 %= eT), r3 < 0x0 && (r3 += eT), Math[uw(0xc28)]((r3 / eT) * 0xff)
      );
    }
    function eV(r3) {
      const ux = uf;
      if (!r3 || r3[ux(0x441)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        ux(0x5d0)
      ](r3);
    }
    function eW(r3, r4) {
      return dF[r3 + (r4 > 0x0 ? "_" + r4 : "")];
    }
    var eX = da[uf(0xa8b)]((r3) => r3[uf(0xbe2)]() + uf(0x43f)),
      eY = da[uf(0xa8b)]((r3) => uf(0x42d) + r3 + uf(0x65b)),
      eZ = {};
    eX[uf(0xd78)]((r3) => {
      eZ[r3] = 0x0;
    });
    var f0 = {};
    eY[uf(0xd78)]((r3) => {
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
        timeJoined: Date[uy(0xe04)]() * f1,
      };
    }
    var f3 = uf(0xc7e)[uf(0xe00)]("\x20");
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
    for (let r3 = 0x0; r3 < f5[uf(0x441)]; r3++) {
      const r4 = f5[r3],
        r5 = r4[r4[uf(0x441)] - 0x1],
        r6 = dO(r5);
      for (let r7 = 0x0; r7 < r6[uf(0x441)]; r7++) {
        const r8 = r6[r7];
        if (r8[0x0] < 0x1e) {
          let r9 = r8[0x0];
          (r9 *= 1.5),
            r9 < 1.5 && (r9 *= 0xa),
            (r9 = parseFloat(r9[uf(0x40d)](0x3))),
            (r8[0x0] = r9);
        }
        r8[0x1] = d9[uf(0x8c2)];
      }
      r6[uf(0xaba)]([0.01, d9[uf(0x3d6)]]), r4[uf(0xaba)](r6);
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
      instagram: uf(0x13b),
      discord: uf(0x92c),
      paw: uf(0x25e),
      gear: uf(0x526),
      scroll: uf(0x343),
      bag: uf(0x776),
      food: uf(0xbb3),
      graph: uf(0x6be),
      resize: uf(0xabc),
      users: uf(0x2e8),
      trophy: uf(0x37e),
      shop: uf(0x1a1),
      dice: uf(0xa1e),
      poopPath: new Path2D(uf(0xde6)),
    };
    function fa(ra) {
      const uz = uf;
      return ra[uz(0xa27)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fb(ra) {
      const uA = uf;
      if(hack.isEnabled('disableChatCheck')) return ra;
      return (
        (ra = fa(ra)),
        (ra = ra[uA(0xa27)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uA(0xa27)](/(.)\1{2,}/gi, "$1")
          [uA(0xa27)](/\u200B|\u200C|\u200D/g, "")
          [uA(0xd69)]()),
        !ra && (ra = uA(0x83c)),
        ra
      );
    }
    var fc = 0x104;
    function fd(ra) {
      const uB = uf,
        rb = ra[uB(0xe00)]("\x0a")[uB(0x7fc)](
          (rc) => rc[uB(0xd69)]()[uB(0x441)] > 0x0
        );
      return { title: rb[uB(0x173)](), content: rb };
    }
    const fe = {};
    (fe[uf(0x8a5)] = uf(0x640)),
      (fe[uf(0xc31)] = [
        uf(0x75b),
        uf(0x2ed),
        uf(0x79e),
        uf(0xc21),
        uf(0x9b2),
        uf(0x8f0),
        uf(0x70b),
        uf(0xb34),
      ]);
    const ff = {};
    (ff[uf(0x8a5)] = uf(0x18d)), (ff[uf(0xc31)] = [uf(0x442)]);
    const fg = {};
    (fg[uf(0x8a5)] = uf(0xbf7)),
      (fg[uf(0xc31)] = [uf(0xd85), uf(0x5ab), uf(0x663), uf(0xb27)]);
    const fh = {};
    (fh[uf(0x8a5)] = uf(0x677)),
      (fh[uf(0xc31)] = [
        uf(0xcc1),
        uf(0x5c1),
        uf(0xce8),
        uf(0x4ee),
        uf(0x766),
        uf(0xc4b),
        uf(0x332),
        uf(0x196),
        uf(0x354),
      ]);
    const fi = {};
    (fi[uf(0x8a5)] = uf(0xac6)),
      (fi[uf(0xc31)] = [uf(0xb73), uf(0x2a1), uf(0x98f), uf(0x31a)]);
    const fj = {};
    (fj[uf(0x8a5)] = uf(0xa33)), (fj[uf(0xc31)] = [uf(0x394)]);
    const fk = {};
    (fk[uf(0x8a5)] = uf(0xd11)), (fk[uf(0xc31)] = [uf(0x2d0), uf(0x2e9)]);
    const fl = {};
    (fl[uf(0x8a5)] = uf(0xc9c)),
      (fl[uf(0xc31)] = [
        uf(0x121),
        uf(0x18b),
        uf(0x311),
        uf(0xb47),
        uf(0x70e),
        uf(0xbbc),
        uf(0x814),
        uf(0x306),
      ]);
    const fm = {};
    (fm[uf(0x8a5)] = uf(0x51c)),
      (fm[uf(0xc31)] = [
        uf(0x1cc),
        uf(0x972),
        uf(0x3ee),
        uf(0x949),
        uf(0x1d1),
        uf(0x4b2),
        uf(0x57c),
        uf(0xdeb),
      ]);
    const fn = {};
    (fn[uf(0x8a5)] = uf(0xa36)), (fn[uf(0xc31)] = [uf(0xbbf)]);
    const fo = {};
    (fo[uf(0x8a5)] = uf(0x1a9)),
      (fo[uf(0xc31)] = [
        uf(0x69d),
        uf(0xbea),
        uf(0x2f6),
        uf(0x59c),
        uf(0x355),
        uf(0xcd2),
        uf(0x161),
      ]);
    const fp = {};
    (fp[uf(0x8a5)] = uf(0x552)), (fp[uf(0xc31)] = [uf(0x357)]);
    const fq = {};
    (fq[uf(0x8a5)] = uf(0x569)),
      (fq[uf(0xc31)] = [uf(0x883), uf(0x9a5), uf(0x7ab), uf(0x6d6)]);
    const fr = {};
    (fr[uf(0x8a5)] = uf(0x2d2)), (fr[uf(0xc31)] = [uf(0x855), uf(0x488)]);
    const fs = {};
    (fs[uf(0x8a5)] = uf(0xa03)),
      (fs[uf(0xc31)] = [uf(0x955), uf(0x5ba), uf(0x47a), uf(0x796)]);
    const ft = {};
    (ft[uf(0x8a5)] = uf(0x16d)),
      (ft[uf(0xc31)] = [uf(0x240), uf(0x484), uf(0xdbe), uf(0x96d)]);
    const fu = {};
    (fu[uf(0x8a5)] = uf(0x738)),
      (fu[uf(0xc31)] = [
        uf(0x7b7),
        uf(0x9a0),
        uf(0x602),
        uf(0x2dc),
        uf(0x4fa),
        uf(0x82b),
      ]);
    const fv = {};
    (fv[uf(0x8a5)] = uf(0x2b3)), (fv[uf(0xc31)] = [uf(0xa7f)]);
    const fw = {};
    (fw[uf(0x8a5)] = uf(0x3a7)), (fw[uf(0xc31)] = [uf(0xd47), uf(0x472)]);
    const fx = {};
    (fx[uf(0x8a5)] = uf(0x781)),
      (fx[uf(0xc31)] = [uf(0x73b), uf(0x692), uf(0x37f)]);
    const fy = {};
    (fy[uf(0x8a5)] = uf(0xb00)),
      (fy[uf(0xc31)] = [uf(0x7fb), uf(0x752), uf(0x5ea), uf(0xa6d), uf(0xacf)]);
    const fz = {};
    (fz[uf(0x8a5)] = uf(0x3ad)), (fz[uf(0xc31)] = [uf(0x9c3), uf(0x1c7)]);
    const fA = {};
    (fA[uf(0x8a5)] = uf(0x99e)),
      (fA[uf(0xc31)] = [uf(0x2c2), uf(0xc57), uf(0xe01)]);
    const fB = {};
    (fB[uf(0x8a5)] = uf(0xa2c)), (fB[uf(0xc31)] = [uf(0x674)]);
    const fC = {};
    (fC[uf(0x8a5)] = uf(0x4e3)), (fC[uf(0xc31)] = [uf(0xc80)]);
    const fD = {};
    (fD[uf(0x8a5)] = uf(0x25b)), (fD[uf(0xc31)] = [uf(0x974)]);
    const fE = {};
    (fE[uf(0x8a5)] = uf(0xb23)),
      (fE[uf(0xc31)] = [uf(0x250), uf(0x22e), uf(0x6e0)]);
    const fF = {};
    (fF[uf(0x8a5)] = uf(0x85c)),
      (fF[uf(0xc31)] = [
        uf(0x3ff),
        uf(0x160),
        uf(0x6d9),
        uf(0x46f),
        uf(0xa69),
        uf(0x438),
        uf(0xc47),
        uf(0x6bc),
        uf(0xdca),
        uf(0xb77),
        uf(0x353),
        uf(0xa4a),
        uf(0x798),
        uf(0xad8),
      ]);
    const fG = {};
    (fG[uf(0x8a5)] = uf(0xa00)),
      (fG[uf(0xc31)] = [
        uf(0xdcc),
        uf(0x291),
        uf(0x3d1),
        uf(0x711),
        uf(0x3cb),
        uf(0xa5d),
        uf(0x9d0),
        uf(0x8b3),
      ]);
    const fH = {};
    (fH[uf(0x8a5)] = uf(0x8e2)),
      (fH[uf(0xc31)] = [
        uf(0x42a),
        uf(0x5c5),
        uf(0x59a),
        uf(0xd71),
        uf(0x6ad),
        uf(0xd8e),
        uf(0x461),
        uf(0x7fd),
        uf(0x215),
        uf(0xb86),
        uf(0x4fd),
        uf(0xa80),
        uf(0x5b7),
        uf(0xa23),
      ]);
    const fI = {};
    (fI[uf(0x8a5)] = uf(0x241)),
      (fI[uf(0xc31)] = [
        uf(0x6c5),
        uf(0x2c7),
        uf(0x1f5),
        uf(0x56c),
        uf(0x3f8),
        uf(0x3d5),
        uf(0x9ab),
      ]);
    const fJ = {};
    (fJ[uf(0x8a5)] = uf(0x43b)),
      (fJ[uf(0xc31)] = [
        uf(0x286),
        uf(0x2b1),
        uf(0xac9),
        uf(0xdd4),
        uf(0xc58),
        uf(0x637),
        uf(0x666),
        uf(0x564),
        uf(0x742),
        uf(0x42e),
        uf(0x9b6),
        uf(0x8bc),
        uf(0x287),
        uf(0xbc2),
      ]);
    const fK = {};
    (fK[uf(0x8a5)] = uf(0x29a)),
      (fK[uf(0xc31)] = [
        uf(0xe0a),
        uf(0xb5b),
        uf(0x965),
        uf(0x7d3),
        uf(0x7c5),
        uf(0x7a5),
        uf(0x3be),
        uf(0x914),
        uf(0x5c2),
        uf(0x6b4),
        uf(0x634),
        uf(0x5a1),
        uf(0xcc9),
        uf(0xb80),
        uf(0x81e),
      ]);
    const fL = {};
    (fL[uf(0x8a5)] = uf(0xb8e)),
      (fL[uf(0xc31)] = [
        uf(0xc69),
        uf(0x248),
        uf(0x96a),
        uf(0x997),
        uf(0x8c9),
        uf(0x5c9),
        uf(0x680),
        uf(0x497),
        uf(0xba2),
        uf(0x947),
        uf(0x859),
        uf(0x926),
        uf(0xc01),
      ]);
    const fM = {};
    (fM[uf(0x8a5)] = uf(0x540)),
      (fM[uf(0xc31)] = [
        uf(0x987),
        uf(0x416),
        uf(0x748),
        uf(0x5a2),
        uf(0x1fb),
        uf(0x901),
      ]);
    const fN = {};
    (fN[uf(0x8a5)] = uf(0x604)),
      (fN[uf(0xc31)] = [
        uf(0xc95),
        uf(0xcbe),
        uf(0x624),
        uf(0xd12),
        uf(0x9a1),
        uf(0xe13),
        uf(0xbae),
        uf(0xafe),
        uf(0xbc3),
      ]);
    const fO = {};
    (fO[uf(0x8a5)] = uf(0x604)),
      (fO[uf(0xc31)] = [
        uf(0xbc1),
        uf(0x8ec),
        uf(0x16e),
        uf(0x551),
        uf(0xd58),
        uf(0x4e0),
        uf(0xb28),
        uf(0x14a),
        uf(0x141),
        uf(0x8f6),
        uf(0x2d6),
        uf(0xb57),
        uf(0x1ae),
        uf(0x782),
        uf(0xd5e),
        uf(0xdfd),
        uf(0x270),
      ]);
    const fP = {};
    (fP[uf(0x8a5)] = uf(0xcde)), (fP[uf(0xc31)] = [uf(0x10b), uf(0xd80)]);
    const fQ = {};
    (fQ[uf(0x8a5)] = uf(0x527)),
      (fQ[uf(0xc31)] = [uf(0x878), uf(0x28d), uf(0x9e2)]);
    const fR = {};
    (fR[uf(0x8a5)] = uf(0x47e)),
      (fR[uf(0xc31)] = [uf(0xc88), uf(0x124), uf(0x3f2), uf(0xab4)]);
    const fS = {};
    (fS[uf(0x8a5)] = uf(0x8a9)),
      (fS[uf(0xc31)] = [
        uf(0xba5),
        uf(0x45f),
        uf(0x115),
        uf(0x3a9),
        uf(0xc4e),
        uf(0x495),
      ]);
    const fT = {};
    (fT[uf(0x8a5)] = uf(0x60d)), (fT[uf(0xc31)] = [uf(0x5aa)]);
    const fU = {};
    (fU[uf(0x8a5)] = uf(0x1dd)),
      (fU[uf(0xc31)] = [
        uf(0xc45),
        uf(0x9f5),
        uf(0x993),
        uf(0x29d),
        uf(0xad3),
        uf(0x96c),
        uf(0xcd1),
        uf(0x9c8),
      ]);
    const fV = {};
    (fV[uf(0x8a5)] = uf(0x6a0)), (fV[uf(0xc31)] = [uf(0x676), uf(0x55a)]);
    const fW = {};
    (fW[uf(0x8a5)] = uf(0x5dc)),
      (fW[uf(0xc31)] = [uf(0xb3e), uf(0x3e5), uf(0x300), uf(0xa9b), uf(0x422)]);
    const fX = {};
    (fX[uf(0x8a5)] = uf(0x3dc)),
      (fX[uf(0xc31)] = [
        uf(0x3b5),
        uf(0xba8),
        uf(0xb3b),
        uf(0x32e),
        uf(0xb85),
        uf(0x61e),
        uf(0x5ee),
        uf(0x8e0),
        uf(0xaf3),
      ]);
    const fY = {};
    (fY[uf(0x8a5)] = uf(0x852)),
      (fY[uf(0xc31)] = [
        uf(0x81a),
        uf(0x7b4),
        uf(0xa81),
        uf(0xa73),
        uf(0x874),
        uf(0x347),
        uf(0xbd9),
        uf(0x9dc),
      ]);
    const fZ = {};
    (fZ[uf(0x8a5)] = uf(0x577)),
      (fZ[uf(0xc31)] = [
        uf(0x227),
        uf(0xa6b),
        uf(0x239),
        uf(0x777),
        uf(0xd98),
        uf(0xa10),
        uf(0x3c2),
        uf(0x7f7),
        uf(0xac0),
      ]);
    const g0 = {};
    (g0[uf(0x8a5)] = uf(0x8b5)),
      (g0[uf(0xc31)] = [
        uf(0x5f6),
        uf(0x903),
        uf(0x1ba),
        uf(0xa10),
        uf(0x7b1),
        uf(0x88c),
        uf(0x205),
        uf(0x7d7),
        uf(0x8ea),
        uf(0xc68),
        uf(0x725),
      ]);
    const g1 = {};
    (g1[uf(0x8a5)] = uf(0x8b5)),
      (g1[uf(0xc31)] = [uf(0xa32), uf(0x6b7), uf(0x726), uf(0x543), uf(0xbed)]);
    const g2 = {};
    (g2[uf(0x8a5)] = uf(0x595)), (g2[uf(0xc31)] = [uf(0xb6f), uf(0x2b8)]);
    const g3 = {};
    (g3[uf(0x8a5)] = uf(0x4c8)), (g3[uf(0xc31)] = [uf(0xd3f)]);
    const g4 = {};
    (g4[uf(0x8a5)] = uf(0x952)),
      (g4[uf(0xc31)] = [uf(0x34b), uf(0xcdf), uf(0x4f7), uf(0xa5e)]);
    const g5 = {};
    (g5[uf(0x8a5)] = uf(0x127)),
      (g5[uf(0xc31)] = [uf(0xcc3), uf(0xdf4), uf(0xabe), uf(0x6fc)]);
    const g6 = {};
    (g6[uf(0x8a5)] = uf(0x127)),
      (g6[uf(0xc31)] = [
        uf(0x845),
        uf(0x3be),
        uf(0x2d8),
        uf(0x8c3),
        uf(0x567),
        uf(0x33f),
        uf(0xa1d),
        uf(0x54a),
        uf(0xac1),
        uf(0xcbd),
        uf(0x242),
        uf(0x788),
        uf(0x1ac),
        uf(0x8c6),
        uf(0xc91),
        uf(0x369),
        uf(0x1f4),
        uf(0x44b),
        uf(0x60e),
        uf(0xd45),
      ]);
    const g7 = {};
    (g7[uf(0x8a5)] = uf(0x2ef)),
      (g7[uf(0xc31)] = [uf(0xae1), uf(0xad7), uf(0x1e1), uf(0x615)]);
    const g8 = {};
    (g8[uf(0x8a5)] = uf(0x3fb)),
      (g8[uf(0xc31)] = [uf(0x2ee), uf(0xe02), uf(0x3c7)]);
    const g9 = {};
    (g9[uf(0x8a5)] = uf(0x537)),
      (g9[uf(0xc31)] = [
        uf(0x61f),
        uf(0xc5d),
        uf(0x68c),
        uf(0x421),
        uf(0x67a),
        uf(0x66d),
        uf(0x756),
        uf(0x107),
        uf(0xc05),
        uf(0x958),
        uf(0x498),
        uf(0x7ff),
        uf(0x6a7),
        uf(0x11b),
        uf(0x38f),
      ]);
    const ga = {};
    (ga[uf(0x8a5)] = uf(0xc66)), (ga[uf(0xc31)] = [uf(0x953), uf(0x587)]);
    const gb = {};
    (gb[uf(0x8a5)] = uf(0xc33)),
      (gb[uf(0xc31)] = [uf(0x4f2), uf(0x253), uf(0x8a6)]);
    const gc = {};
    (gc[uf(0x8a5)] = uf(0x1d2)),
      (gc[uf(0xc31)] = [uf(0x2a6), uf(0x4aa), uf(0x429)]);
    const gd = {};
    (gd[uf(0x8a5)] = uf(0x6dc)),
      (gd[uf(0xc31)] = [uf(0xac3), uf(0x8fb), uf(0x88d), uf(0x9f7)]);
    const ge = {};
    (ge[uf(0x8a5)] = uf(0x513)),
      (ge[uf(0xc31)] = [uf(0x7db), uf(0x638), uf(0x24e)]);
    const gf = {};
    (gf[uf(0x8a5)] = uf(0xabb)),
      (gf[uf(0xc31)] = [
        uf(0x3be),
        uf(0xa54),
        uf(0xdf5),
        uf(0xa7e),
        uf(0x20d),
        uf(0x59d),
        uf(0x194),
        uf(0xc09),
        uf(0xbdb),
        uf(0x317),
        uf(0x918),
        uf(0x2c3),
        uf(0xa83),
        uf(0x15c),
        uf(0xc6f),
        uf(0x20e),
        uf(0xaa2),
        uf(0xe09),
        uf(0x26e),
        uf(0x69f),
        uf(0x1b3),
        uf(0x520),
        uf(0x83b),
        uf(0x170),
      ]);
    const gg = {};
    (gg[uf(0x8a5)] = uf(0x1bb)),
      (gg[uf(0xc31)] = [uf(0xdb6), uf(0x8a7), uf(0x275), uf(0x629)]);
    const gh = {};
    (gh[uf(0x8a5)] = uf(0x70c)),
      (gh[uf(0xc31)] = [
        uf(0xdb1),
        uf(0x2a5),
        uf(0xd13),
        uf(0x3be),
        uf(0x9cb),
        uf(0x51d),
        uf(0x7d1),
        uf(0x398),
      ]);
    const gi = {};
    (gi[uf(0x8a5)] = uf(0xdd3)),
      (gi[uf(0xc31)] = [
        uf(0xd43),
        uf(0xbf9),
        uf(0x421),
        uf(0x661),
        uf(0x153),
        uf(0x65f),
        uf(0x767),
        uf(0xce6),
        uf(0x3bc),
        uf(0xd42),
        uf(0x732),
        uf(0x580),
        uf(0x4a3),
        uf(0x256),
        uf(0xb0e),
        uf(0x6ea),
        uf(0x9a7),
      ]);
    const gj = {};
    (gj[uf(0x8a5)] = uf(0x470)),
      (gj[uf(0xc31)] = [
        uf(0x2fe),
        uf(0x71e),
        uf(0xb2a),
        uf(0x4c3),
        uf(0x936),
        uf(0x2a4),
        uf(0xb18),
        uf(0xd9f),
        uf(0xae2),
        uf(0x937),
        uf(0x58f),
      ]);
    const gk = {};
    (gk[uf(0x8a5)] = uf(0x244)),
      (gk[uf(0xc31)] = [
        uf(0x6f1),
        uf(0x2f4),
        uf(0x1d0),
        uf(0x6ba),
        uf(0xc5b),
        uf(0x8f3),
        uf(0x477),
        uf(0xdfb),
        uf(0x7f6),
        uf(0xc4a),
      ]);
    const gl = {};
    (gl[uf(0x8a5)] = uf(0x244)),
      (gl[uf(0xc31)] = [
        uf(0x6f3),
        uf(0x7ec),
        uf(0xdb9),
        uf(0xcd4),
        uf(0x3f5),
        uf(0xacc),
        uf(0xccf),
        uf(0xab8),
        uf(0x740),
        uf(0x8fa),
      ]);
    const gm = {};
    (gm[uf(0x8a5)] = uf(0x2c5)),
      (gm[uf(0xc31)] = [
        uf(0x2d9),
        uf(0x12f),
        uf(0x667),
        uf(0xaad),
        uf(0x746),
        uf(0x32d),
        uf(0x930),
        uf(0xc5a),
        uf(0x90c),
        uf(0xa3b),
      ]);
    const gn = {};
    (gn[uf(0x8a5)] = uf(0x2c5)),
      (gn[uf(0xc31)] = [
        uf(0xa32),
        uf(0x12b),
        uf(0xcba),
        uf(0x2ea),
        uf(0x1c5),
        uf(0x3df),
        uf(0x885),
        uf(0x45a),
        uf(0xafa),
        uf(0x243),
        uf(0x6a9),
      ]);
    const go = {};
    (go[uf(0x8a5)] = uf(0x2b4)),
      (go[uf(0xc31)] = [uf(0xaa6), uf(0x5e4), uf(0xb56)]);
    const gp = {};
    (gp[uf(0x8a5)] = uf(0x2b4)),
      (gp[uf(0xc31)] = [
        uf(0xd3d),
        uf(0x36e),
        uf(0x41a),
        uf(0x63f),
        uf(0x5c4),
        uf(0xddb),
        uf(0x264),
        uf(0x581),
      ]);
    const gq = {};
    (gq[uf(0x8a5)] = uf(0x434)),
      (gq[uf(0xc31)] = [uf(0x8bb), uf(0x6d5), uf(0xdef)]);
    const gr = {};
    (gr[uf(0x8a5)] = uf(0x434)),
      (gr[uf(0xc31)] = [
        uf(0xc03),
        uf(0xbc3),
        uf(0x29b),
        uf(0x588),
        uf(0x9de),
        uf(0xc86),
      ]);
    const gs = {};
    (gs[uf(0x8a5)] = uf(0x434)),
      (gs[uf(0xc31)] = [uf(0xc15), uf(0x34e), uf(0x71b), uf(0x104)]);
    const gt = {};
    (gt[uf(0x8a5)] = uf(0x434)),
      (gt[uf(0xc31)] = [
        uf(0x35d),
        uf(0x87c),
        uf(0xaa0),
        uf(0x6a8),
        uf(0x535),
        uf(0x4a6),
        uf(0xa3d),
        uf(0x2ac),
        uf(0xa42),
        uf(0xc3c),
        uf(0x824),
      ]);
    const gu = {};
    (gu[uf(0x8a5)] = uf(0x879)),
      (gu[uf(0xc31)] = [uf(0x3f4), uf(0xb21), uf(0x35c)]);
    const gv = {};
    (gv[uf(0x8a5)] = uf(0xc16)),
      (gv[uf(0xc31)] = [
        uf(0xc4f),
        uf(0xb1c),
        uf(0xbc3),
        uf(0x5b9),
        uf(0x966),
        uf(0xc94),
        uf(0x631),
        uf(0x611),
        uf(0x1a4),
        uf(0x848),
        uf(0x501),
        uf(0x733),
        uf(0x421),
        uf(0x2dd),
        uf(0xb95),
        uf(0x27c),
        uf(0x7b8),
        uf(0x1e2),
        uf(0x894),
        uf(0x8b4),
        uf(0x62f),
        uf(0xc24),
        uf(0x5d3),
        uf(0x391),
        uf(0xb05),
        uf(0x62b),
        uf(0x57e),
        uf(0x401),
        uf(0x273),
        uf(0x352),
        uf(0x907),
        uf(0x363),
        uf(0xc7d),
        uf(0x6b9),
      ]);
    const gw = {};
    (gw[uf(0x8a5)] = uf(0x185)), (gw[uf(0xc31)] = [uf(0x95f)]);
    const gx = {};
    (gx[uf(0x8a5)] = uf(0x959)),
      (gx[uf(0xc31)] = [
        uf(0xcee),
        uf(0x538),
        uf(0x2a9),
        uf(0x54b),
        uf(0x33a),
        uf(0xdb7),
        uf(0xcc7),
        uf(0x421),
        uf(0x576),
        uf(0xa4e),
        uf(0x157),
        uf(0x6ef),
        uf(0x2cf),
        uf(0x57a),
        uf(0xa2d),
        uf(0x1eb),
        uf(0x992),
        uf(0x217),
        uf(0x76a),
        uf(0x8e1),
        uf(0x6fd),
        uf(0x578),
        uf(0xbfe),
        uf(0x7a4),
        uf(0x880),
        uf(0xc72),
        uf(0xcfa),
        uf(0xb29),
        uf(0x77d),
        uf(0x4df),
        uf(0x363),
        uf(0xc78),
        uf(0x956),
        uf(0x913),
        uf(0xcff),
      ]);
    const gy = {};
    (gy[uf(0x8a5)] = uf(0xc42)),
      (gy[uf(0xc31)] = [
        uf(0x42b),
        uf(0x225),
        uf(0xc08),
        uf(0x20b),
        uf(0x2e3),
        uf(0xc71),
        uf(0x421),
        uf(0xb5a),
        uf(0xd9c),
        uf(0x5f8),
        uf(0x976),
        uf(0xb49),
        uf(0x403),
        uf(0x6ec),
        uf(0x7b6),
        uf(0x84f),
        uf(0x4ce),
        uf(0xaae),
        uf(0xd4e),
        uf(0xd89),
        uf(0x384),
        uf(0x992),
        uf(0x2d5),
        uf(0xc74),
        uf(0xa5b),
        uf(0x9fc),
        uf(0xb8d),
        uf(0x4dc),
        uf(0xd1d),
        uf(0x79d),
        uf(0xa3c),
        uf(0x856),
        uf(0x5ac),
        uf(0x192),
        uf(0x363),
        uf(0xa1f),
        uf(0x362),
        uf(0xc2d),
        uf(0x565),
      ]);
    const gz = {};
    (gz[uf(0x8a5)] = uf(0x2e6)),
      (gz[uf(0xc31)] = [
        uf(0x779),
        uf(0x511),
        uf(0x363),
        uf(0x2eb),
        uf(0x7a6),
        uf(0x1bd),
        uf(0x596),
        uf(0x123),
        uf(0x406),
        uf(0x421),
        uf(0x1e9),
        uf(0x131),
        uf(0x6f8),
        uf(0x893),
      ]);
    const gA = {};
    (gA[uf(0x8a5)] = uf(0x758)),
      (gA[uf(0xc31)] = [uf(0x3ea), uf(0x3d9), uf(0x6f2), uf(0x12d), uf(0x785)]);
    const gB = {};
    (gB[uf(0x8a5)] = uf(0x15d)),
      (gB[uf(0xc31)] = [uf(0x138), uf(0x8ae), uf(0x19a), uf(0x9b0)]);
    const gC = {};
    (gC[uf(0x8a5)] = uf(0x15d)),
      (gC[uf(0xc31)] = [uf(0xbc3), uf(0xc1a), uf(0xc9f)]);
    const gD = {};
    (gD[uf(0x8a5)] = uf(0xac4)),
      (gD[uf(0xc31)] = [uf(0xc84), uf(0x1ed), uf(0x3b0), uf(0xc04), uf(0x290)]);
    const gE = {};
    (gE[uf(0x8a5)] = uf(0xac4)),
      (gE[uf(0xc31)] = [uf(0xa60), uf(0x9f4), uf(0x48e), uf(0x5be)]);
    const gF = {};
    (gF[uf(0x8a5)] = uf(0xac4)), (gF[uf(0xc31)] = [uf(0x819), uf(0xb45)]);
    const gG = {};
    (gG[uf(0x8a5)] = uf(0x39a)),
      (gG[uf(0xc31)] = [
        uf(0xa79),
        uf(0x924),
        uf(0x568),
        uf(0xa51),
        uf(0xa7c),
        uf(0xc7b),
        uf(0x95c),
        uf(0x55c),
        uf(0xcc0),
      ]);
    const gH = {};
    (gH[uf(0x8a5)] = uf(0x613)),
      (gH[uf(0xc31)] = [
        uf(0x4ec),
        uf(0x6c2),
        uf(0xe08),
        uf(0x864),
        uf(0x23d),
        uf(0x1b4),
        uf(0x5de),
      ]);
    const gI = {};
    (gI[uf(0x8a5)] = uf(0x9d1)),
      (gI[uf(0xc31)] = [
        uf(0x934),
        uf(0x804),
        uf(0xdf2),
        uf(0xd6a),
        uf(0x896),
        uf(0xb71),
        uf(0x1c8),
        uf(0x5ce),
        uf(0xa02),
        uf(0x4bd),
        uf(0x20f),
        uf(0x43d),
      ]);
    const gJ = {};
    (gJ[uf(0x8a5)] = uf(0x6a1)),
      (gJ[uf(0xc31)] = [
        uf(0x96e),
        uf(0xb0d),
        uf(0x773),
        uf(0xa55),
        uf(0xb7f),
        uf(0xb87),
        uf(0x5da),
        uf(0xb46),
        uf(0x998),
        uf(0xab9),
      ]);
    const gK = {};
    (gK[uf(0x8a5)] = uf(0x6a1)),
      (gK[uf(0xc31)] = [
        uf(0xab6),
        uf(0xb7e),
        uf(0x2af),
        uf(0x7dd),
        uf(0x47f),
        uf(0x24d),
      ]);
    const gL = {};
    (gL[uf(0x8a5)] = uf(0xe10)),
      (gL[uf(0xc31)] = [uf(0x1ad), uf(0xd05), uf(0xa0e)]);
    const gM = {};
    (gM[uf(0x8a5)] = uf(0xe10)),
      (gM[uf(0xc31)] = [uf(0xbc3), uf(0x3b7), uf(0x2b2), uf(0x58e), uf(0x67b)]);
    const gN = {};
    (gN[uf(0x8a5)] = uf(0x7cb)),
      (gN[uf(0xc31)] = [
        uf(0xce0),
        uf(0xdfe),
        uf(0x9a9),
        uf(0x846),
        uf(0x136),
        uf(0x329),
        uf(0x363),
        uf(0x702),
        uf(0x17b),
        uf(0x364),
        uf(0x139),
        uf(0xa21),
        uf(0x421),
        uf(0xaed),
        uf(0xb9f),
        uf(0x2cd),
        uf(0x6b1),
        uf(0x90f),
        uf(0x405),
      ]);
    const gO = {};
    (gO[uf(0x8a5)] = uf(0xc6c)),
      (gO[uf(0xc31)] = [
        uf(0xdd6),
        uf(0x1b5),
        uf(0x5d8),
        uf(0xd0d),
        uf(0x76b),
        uf(0x333),
        uf(0xc1f),
        uf(0x8ad),
      ]);
    const gP = {};
    (gP[uf(0x8a5)] = uf(0xc6c)), (gP[uf(0xc31)] = [uf(0x155), uf(0x599)]);
    const gQ = {};
    (gQ[uf(0x8a5)] = uf(0x714)), (gQ[uf(0xc31)] = [uf(0x77a), uf(0x8d4)]);
    const gR = {};
    (gR[uf(0x8a5)] = uf(0x714)),
      (gR[uf(0xc31)] = [
        uf(0x3d7),
        uf(0xdad),
        uf(0x13d),
        uf(0x1bc),
        uf(0xca3),
        uf(0x9da),
        uf(0x908),
        uf(0x4ca),
        uf(0x32f),
      ]);
    const gS = {};
    (gS[uf(0x8a5)] = uf(0x48f)), (gS[uf(0xc31)] = [uf(0x467), uf(0x1c4)]);
    const gT = {};
    (gT[uf(0x8a5)] = uf(0x48f)),
      (gT[uf(0xc31)] = [
        uf(0x46c),
        uf(0x6de),
        uf(0x54d),
        uf(0x47b),
        uf(0xdc4),
        uf(0xb13),
        uf(0x87d),
        uf(0xbc3),
        uf(0x9df),
      ]);
    const gU = {};
    (gU[uf(0x8a5)] = uf(0x7da)), (gU[uf(0xc31)] = [uf(0x486)]);
    const gV = {};
    (gV[uf(0x8a5)] = uf(0x7da)),
      (gV[uf(0xc31)] = [
        uf(0x690),
        uf(0x1d6),
        uf(0xb66),
        uf(0x228),
        uf(0xbc3),
        uf(0x2fb),
        uf(0x3a5),
      ]);
    const gW = {};
    (gW[uf(0x8a5)] = uf(0x7da)),
      (gW[uf(0xc31)] = [uf(0x9e8), uf(0x660), uf(0x981)]);
    const gX = {};
    (gX[uf(0x8a5)] = uf(0x816)),
      (gX[uf(0xc31)] = [uf(0x9df), uf(0x88a), uf(0xd1e), uf(0x95e)]);
    const gY = {};
    (gY[uf(0x8a5)] = uf(0x816)), (gY[uf(0xc31)] = [uf(0x99a)]);
    const gZ = {};
    (gZ[uf(0x8a5)] = uf(0x816)),
      (gZ[uf(0xc31)] = [uf(0x1fc), uf(0x920), uf(0xd93), uf(0x653), uf(0x65a)]);
    const h0 = {};
    (h0[uf(0x8a5)] = uf(0x9c4)),
      (h0[uf(0xc31)] = [uf(0x1ca), uf(0x2aa), uf(0x954)]);
    const h1 = {};
    (h1[uf(0x8a5)] = uf(0x261)), (h1[uf(0xc31)] = [uf(0x4e5), uf(0x32c)]);
    const h2 = {};
    (h2[uf(0x8a5)] = uf(0x802)), (h2[uf(0xc31)] = [uf(0x53e), uf(0x6bf)]);
    const h3 = {};
    (h3[uf(0x8a5)] = uf(0xbd5)), (h3[uf(0xc31)] = [uf(0xaa7)]);
    var h4 = [
      fd(uf(0x536)),
      fd(uf(0x8e6)),
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
    console[uf(0x9b1)](uf(0x2da));
    var h5 = Date[uf(0xe04)]() < 0x18e9c4b6482,
      h6 = Math[uf(0x508)](Math[uf(0x9e1)]() * 0xa);
    function h7(ra) {
      const uC = uf,
        rb = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let rc = "";
      for (const rd of ra) {
        rd === "\x20"
          ? (rc += "\x20")
          : (rc += rb[(h6 + rd[uC(0x743)](0x0)) % rb[uC(0x441)]]);
      }
      return rc;
    }
    h5 &&
      document[uf(0x678)](uf(0x933))[uf(0x4eb)](
        uf(0x4b4),
        h7(uf(0xa01)) + uf(0x4ad)
      );
    function h8(ra, rb, rc) {
      const uD = uf,
        rd = rb - ra;
      if (Math[uD(0xcb1)](rd) < 0.01) return rb;
      return ra + rd * (0x1 - Math[uD(0x635)](-rc * pB));
    }
    var h9 = [],
      ha = 0x0;
    function hb(ra, rb = 0x1388) {
      const uE = uf,
        rc = nA(uE(0x76d) + jw(ra) + uE(0xcb4));
      kH[uE(0x72b)](rc);
      let rd = 0x0;
      re();
      function re() {
        const uF = uE;
        (rc[uF(0xaf5)][uF(0xa99)] = uF(0xbb0) + ha + uF(0xce1)),
          (rc[uF(0xaf5)][uF(0xc20)] = rd);
      }
      (this[uE(0x427)] = ![]),
        (this[uE(0x1b9)] = () => {
          const uG = uE;
          rb -= pA;
          const rf = rb > 0x0 ? 0x1 : 0x0;
          (rd = h8(rd, rf, 0.3)),
            re(),
            rb < 0x0 &&
              rd <= 0x0 &&
              (rc[uG(0xcef)](), (this[uG(0x427)] = !![])),
            (ha += rd * (rc[uG(0x15f)] + 0x5));
        }),
        h9[uE(0xaba)](this);
    }
    function hc(ra) {
      new hb(ra, 0x1388);
    }
    function hd() {
      const uH = uf;
      ha = 0x0;
      for (let ra = h9[uH(0x441)] - 0x1; ra >= 0x0; ra--) {
        const rb = h9[ra];
        rb[uH(0x1b9)](), rb[uH(0x427)] && h9[uH(0xde9)](ra, 0x1);
      }
    }
    var he = !![],
      hf = document[uf(0x678)](uf(0x822));
    fetch(uf(0xb50))
      [uf(0x8da)]((ra) => {
        const uI = uf;
        (hf[uI(0xaf5)][uI(0xd72)] = uI(0xae3)), (he = ![]);
      })
      [uf(0xaca)]((ra) => {
        const uJ = uf;
        hf[uJ(0xaf5)][uJ(0xd72)] = "";
      });
    var hg = document[uf(0x678)](uf(0x299)),
      hh = Date[uf(0xe04)]();
    function hi() {
      const uK = uf;
      console[uK(0x9b1)](uK(0x8d0)),
        (hh = Date[uK(0xe04)]()),
        (hg[uK(0xaf5)][uK(0xd72)] = "");
      try {
        aiptag[uK(0x62d)][uK(0xd72)][uK(0xaba)](function () {
          const uL = uK;
          aipDisplayTag[uL(0xd72)](uL(0x85a));
        }),
          aiptag[uK(0x62d)][uK(0xd72)][uK(0xaba)](function () {
            const uM = uK;
            aipDisplayTag[uM(0xd72)](uM(0x4ef));
          });
      } catch (ra) {
        console[uK(0x9b1)](uK(0x7c7));
      }
    }
    setInterval(function () {
      const uN = uf;
      hg[uN(0xaf5)][uN(0xd72)] === "" &&
        Date[uN(0xe04)]() - hh > 0x7530 &&
        hi();
    }, 0x2710);
    var hj = null,
      hk = 0x0;
    function hl() {
      const uO = uf;
      console[uO(0x9b1)](uO(0x528)),
        typeof aiptag[uO(0x21d)] !== uO(0xc40)
          ? ((hj = 0x45),
            (hk = Date[uO(0xe04)]()),
            aiptag[uO(0x62d)][uO(0x764)][uO(0xaba)](function () {
              const uP = uO;
              aiptag[uP(0x21d)][uP(0x88e)]();
            }))
          : window[uO(0xd76)](uO(0x986));
    }
    window[uf(0xd76)] = function (ra) {
      const uQ = uf;
      console[uQ(0x9b1)](uQ(0x3c3) + ra);
      if (ra === uQ(0x7f1) || ra[uQ(0x351)](uQ(0x875)) > -0x1) {
        if (hj !== null && Date[uQ(0xe04)]() - hk > 0xbb8) {
          console[uQ(0x9b1)](uQ(0x1c1));
          if (hW) {
            const rb = {};
            (rb[uQ(0x8a5)] = uQ(0xbb9)),
              (rb[uQ(0x76e)] = ![]),
              kI(
                uQ(0x66e),
                (rc) => {
                  const uR = uQ;
                  rc &&
                    hW &&
                    (il(new Uint8Array([cI[uR(0x618)]])), hK(uR(0xc52)));
                },
                rb
              );
          }
        } else hK(uQ(0x6aa));
      } else alert(uQ(0x26c) + ra);
      hm[uQ(0x30b)][uQ(0xcef)](uQ(0x8eb)), (hj = null);
    };
    var hm = document[uf(0x678)](uf(0x860));
    (hm[uf(0x108)] = function () {
      const uS = uf;
      hm[uS(0x30b)][uS(0x5d6)](uS(0x8eb)), hl();
    }),
      (hm[uf(0x34f)] = function () {
        const uT = uf;
        return nA(
          uT(0xb4d) + hP[uT(0x8c2)] + uT(0x94a) + hP[uT(0x393)] + uT(0x7b3)
        );
      }),
      (hm[uf(0x16f)] = !![]);
    var hn = [
        uf(0xa91),
        uf(0x1d4),
        uf(0x2cb),
        uf(0x858),
        uf(0x91d),
        uf(0xdac),
        uf(0x2a3),
        uf(0x6db),
        uf(0x1e5),
        uf(0x476),
        uf(0x9ff),
        uf(0x98c),
      ],
      ho = document[uf(0x678)](uf(0x524)),
      hp =
        Date[uf(0xe04)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[uf(0x508)](Math[uf(0x9e1)]() * hn[uf(0x441)]);
    hr();
    function hq(ra) {
      const uU = uf;
      (hp += ra),
        hp < 0x0 ? (hp = hn[uU(0x441)] - 0x1) : (hp %= hn[uU(0x441)]),
        hr();
    }
    function hr() {
      const uV = uf,
        ra = hn[hp];
      (ho[uV(0xaf5)][uV(0xdc6)] =
        uV(0x93d) + ra[uV(0xe00)](uV(0x79f))[0x1] + uV(0x9d7)),
        (ho[uV(0x108)] = function () {
          const uW = uV;
          window[uW(0xd2f)](ra, uW(0xc3e)), hq(0x1);
        });
    }
    (document[uf(0x678)](uf(0x198))[uf(0x108)] = function () {
      hq(-0x1);
    }),
      (document[uf(0x678)](uf(0x975))[uf(0x108)] = function () {
        hq(0x1);
      });
    var hs = document[uf(0x678)](uf(0x378));
    hs[uf(0x34f)] = function () {
      const uX = uf;
      return nA(
        uX(0xb4d) + hP[uX(0x8c2)] + uX(0x18f) + hP[uX(0x6ab)] + uX(0x8b8)
      );
    };
    var ht = document[uf(0x678)](uf(0x679)),
      hu = document[uf(0x678)](uf(0xcca)),
      hv = ![];
    function hw() {
      const uY = uf;
      let ra = "";
      for (let rc = 0x0; rc < h4[uY(0x441)]; rc++) {
        const { title: rd, content: re } = h4[rc];
        (ra += uY(0x50f) + rd + uY(0xa90)),
          re[uY(0xd78)]((rf, rg) => {
            const uZ = uY;
            let rh = "-\x20";
            if (rf[0x0] === "*") {
              const ri = rf[rg + 0x1];
              if (ri && ri[0x0] === "*") rh = uZ(0x57f);
              else rh = uZ(0x17d);
              rf = rf[uZ(0x923)](0x1);
            }
            (rf = rh + rf), (ra += uZ(0xd3b) + rf + uZ(0x103));
          }),
          (ra += uY(0x27a));
      }
      const rb = hD[uY(0xc75)];
      (hv = rb !== void 0x0 && parseInt(rb) < fc), (ht[uY(0x2d7)] = ra);
    }
    CanvasRenderingContext2D[uf(0xc46)][uf(0x90b)] = function (ra) {
      const v0 = uf;
      this[v0(0x656)](ra, ra);
    };
    var hx = ![];
    hx &&
      (OffscreenCanvasRenderingContext2D[uf(0xc46)][uf(0x90b)] = function (ra) {
        const v1 = uf;
        this[v1(0x656)](ra, ra);
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
            parseInt(ra[v2(0x923)](0x1, 0x3), 0x10),
            parseInt(ra[v2(0x923)](0x3, 0x5), 0x10),
            parseInt(ra[v2(0x923)](0x5, 0x7), 0x10),
          ]),
        hz[ra]
      );
    }
    var hB = document[uf(0x6a4)](uf(0x3c9)),
      hC = document[uf(0x3f7)](uf(0x3bb));
    for (let ra = 0x0; ra < hC[uf(0x441)]; ra++) {
      const rb = hC[ra],
        rc = f9[rb[uf(0x626)](uf(0x14c))];
      rc && rb[uf(0xc23)](nA(rc), rb[uf(0x806)][0x0]);
    }
    var hD;
    try {
      hD = localStorage;
    } catch (rd) {
      console[uf(0x868)](uf(0x47c), rd), (hD = {});
    }
    var hE = document[uf(0x678)](uf(0x122)),
      hF = document[uf(0x678)](uf(0x10a)),
      hG = document[uf(0x678)](uf(0xad9));
    (hE[uf(0x34f)] = function () {
      const v3 = uf;
      return nA(
        v3(0xced) + hP[v3(0x5b2)] + v3(0x3a2) + cN + v3(0x234) + cM + v3(0xdee)
      );
    }),
      (hF[uf(0x7ca)] = cM),
      (hF[uf(0xc27)] = function () {
        const v4 = uf;
        !cO[v4(0x5d0)](this[v4(0xcb7)]) &&
          (this[v4(0xcb7)] = this[v4(0xcb7)][v4(0xa27)](cP, ""));
      });
    var hH,
      hI = document[uf(0x678)](uf(0xd00));
    function hJ(re) {
      const v5 = uf;
      re ? k8(hI, re + v5(0xbff)) : k8(hI, v5(0xa0c)),
        (hE[v5(0xaf5)][v5(0xd72)] =
          re && re[v5(0x351)]("\x20") === -0x1 ? v5(0xae3) : "");
    }
    hG[uf(0x108)] = ng(function () {
      const v6 = uf;
      if (!hW || jy) return;
      const re = hF[v6(0xcb7)],
        rf = re[v6(0x441)];
      if (rf < cN) hc(v6(0x74f));
      else {
        if (rf > cM) hc(v6(0xc35));
        else {
          if (!cO[v6(0x5d0)](re)) hc(v6(0x559));
          else {
            hc(v6(0x8a4), hP[v6(0x6ab)]), (hH = re);
            const rg = new Uint8Array([
              cI[v6(0xbc7)],
              ...new TextEncoder()[v6(0x8c1)](re),
            ]);
            il(rg);
          }
        }
      }
    });
    function hK(re, rf = n3[uf(0x334)]) {
      n6(-0x1, null, re, rf);
    }
    hw();
    var hL = f4(cR),
      hM = f4(cS),
      hN = f4(d9);
    const hO = {};
    (hO[uf(0x5b2)] = uf(0x237)),
      (hO[uf(0x6ab)] = uf(0x75a)),
      (hO[uf(0x262)] = uf(0x19e)),
      (hO[uf(0x5f1)] = uf(0x74b)),
      (hO[uf(0x202)] = uf(0x1d7)),
      (hO[uf(0x393)] = uf(0xcab)),
      (hO[uf(0x8c2)] = uf(0xd7c)),
      (hO[uf(0x3d6)] = uf(0xcad)),
      (hO[uf(0x80c)] = uf(0x81f));
    var hP = hO,
      hQ = Object[uf(0xd96)](hP),
      hR = [];
    for (let re = 0x0; re < hQ[uf(0x441)]; re++) {
      const rf = hQ[re],
        rg = rf[uf(0x923)](0x4, rf[uf(0x351)](")"))
          [uf(0xe00)](",\x20")
          [uf(0xa8b)]((rh) => parseInt(rh) * 0.8);
      hR[uf(0xaba)](pL(rg));
    }
    hS(uf(0x16c), uf(0x79c)),
      hS(uf(0x81d), uf(0x836)),
      hS(uf(0xd8a), uf(0xbe1)),
      hS(uf(0xc7a), uf(0x27e)),
      hS(uf(0xd83), uf(0x616)),
      hS(uf(0x799), uf(0x75e)),
      hS(uf(0x1cb), uf(0x424));
    function hS(rh, ri) {
      const v7 = uf;
      document[v7(0x678)](rh)[v7(0x108)] = function () {
        const v8 = v7;
        window[v8(0xd2f)](ri, v8(0xc3e));
      };
    }
    setInterval(function () {
      const v9 = uf;
      hW && il(new Uint8Array([cI[v9(0xbac)]]));
    }, 0x3e8);
    function hT() {
      const va = uf;
      (px = [pE]),
        (j6[va(0xc50)] = !![]),
        (j6 = {}),
        (jG = 0x0),
        (jH[va(0x441)] = 0x0),
        (iw = []),
        (iG[va(0x441)] = 0x0),
        (iC[va(0x2d7)] = ""),
        (iv = {}),
        (iH = ![]),
        (iy = null),
        (ix = null),
        (pn = 0x0),
        (hW = ![]),
        (mn = 0x0),
        (mm = 0x0),
        (m9 = ![]),
        (m5[va(0xaf5)][va(0xd72)] = va(0xae3)),
        (pP[va(0xaf5)][va(0xd72)] = pO[va(0xaf5)][va(0xd72)] = va(0xae3)),
        (pl = 0x0),
        (pm = 0x0);
    }
    var hU;
    function hV(rh) {
      const vb = uf;
      (jh[vb(0xaf5)][vb(0xd72)] = vb(0xae3)),
        (p2[vb(0xaf5)][vb(0xd72)] = vb(0xae3)),
        hZ(),
        kA[vb(0x30b)][vb(0x5d6)](vb(0x841)),
        kB[vb(0x30b)][vb(0xcef)](vb(0x841)),
        hT(),
        console[vb(0x9b1)](vb(0xd53) + rh + vb(0x801)),
        iu(),
        (hU = new WebSocket(rh)),
        (hU[vb(0x84c)] = vb(0x519)),
        (hU[vb(0x7dc)] = hX),
        (hU[vb(0x7d2)] = k1),
        (hU[vb(0xd49)] = kg);
    }
    crypto[uf(0xd67)] =
      crypto[uf(0xd67)] ||
      function rh() {
        const vc = uf;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vc(0xa27)
        ](/[018]/g, (ri) =>
          (ri ^
            (crypto[vc(0xbeb)](new Uint8Array(0x1))[0x0] &
              (0xf >> (ri / 0x4))))[vc(0x2b9)](0x10)
        );
      };
    var hW = ![];
    function hX() {
      const vd = uf;
      console[vd(0x9b1)](vd(0xd82)), ie();
    }
    var hY = document[uf(0x678)](uf(0xb40));
    function hZ() {
      const ve = uf;
      hY[ve(0xaf5)][ve(0xd72)] = ve(0xae3);
    }
    var i0 = document[uf(0x678)](uf(0x1ce)),
      i1 = document[uf(0x678)](uf(0xd06)),
      i2 = document[uf(0x678)](uf(0x36c)),
      i3 = document[uf(0x678)](uf(0x246));
    i3[uf(0x108)] = function () {
      const vf = uf;
      !i6 &&
        (window[vf(0xdba)][vf(0xd21)] =
          vf(0x67c) +
          encodeURIComponent(!window[vf(0x368)] ? vf(0x759) : vf(0x4d6)) +
          vf(0x63d) +
          encodeURIComponent(btoa(i5)));
    };
    var i4 = document[uf(0x678)](uf(0x6e8));
    (i4[uf(0x108)] = function () {
      const vg = uf;
      i5 == hD[vg(0x213)] && delete hD[vg(0x213)];
      delete hD[vg(0x5c0)];
      if (hU)
        try {
          hU[vg(0xb36)]();
        } catch (ri) {}
    }),
      hZ();
    var i5, i6;
    function i7(ri) {
      const vi = uf;
      try {
        let rk = function (rl) {
          const vh = b;
          return rl[vh(0xa27)](/([.*+?\^$(){}|\[\]\/\\])/g, vh(0x448));
        };
        var rj = document[vi(0x6cd)][vi(0x2df)](
          RegExp(vi(0x715) + rk(ri) + vi(0xa05))
        );
        return rj ? rj[0x1] : null;
      } catch (rl) {
        return "";
      }
    }
    var i8 = !window[uf(0x368)];
    function i9(ri) {
      const vj = uf;
      try {
        document[vj(0x6cd)] = ri + vj(0x1f9) + (i8 ? vj(0x603) : "");
      } catch (rj) {}
    }
    var ia = 0x0,
      ib;
    function ic() {
      const vk = uf;
      (ia = 0x0), (hW = ![]);
      !eV(hD[vk(0x213)]) && (hD[vk(0x213)] = crypto[vk(0xd67)]());
      (i5 = hD[vk(0x213)]), (i6 = hD[vk(0x5c0)]);
      !i6 &&
        ((i6 = i7(vk(0x5c0))),
        i6 && (i6 = decodeURIComponent(i6)),
        i9(vk(0x5c0)));
      if (i6)
        try {
          const ri = i6;
          i6 = JSON[vk(0x21e)](decodeURIComponent(escape(atob(ri))));
          if (eV(i6[vk(0x1da)]))
            (i5 = i6[vk(0x1da)]),
              i1[vk(0x4eb)](vk(0x4b4), i6[vk(0x56f)]),
              i6[vk(0x509)] &&
                (i2[vk(0xaf5)][vk(0xdc6)] = vk(0x3e8) + i6[vk(0x509)] + ")"),
              (hD[vk(0x5c0)] = ri);
          else throw new Error(vk(0xb6a));
        } catch (rj) {
          (i6 = null), delete hD[vk(0x5c0)], console[vk(0x334)](vk(0x134) + rj);
        }
      ib = hD[vk(0x84b)] || "";
    }
    function ie() {
      ic(), ii();
    }
    function ig() {
      const vl = uf,
        ri = [
          vl(0x731),
          vl(0x988),
          vl(0xd10),
          vl(0x598),
          vl(0x642),
          vl(0x97e),
          vl(0x435),
          vl(0x7b9),
          vl(0x31f),
          vl(0x7c6),
          vl(0x62a),
          vl(0x9f8),
          vl(0xd0f),
          vl(0x481),
          vl(0x499),
          vl(0x944),
          vl(0x3db),
          vl(0xc3a),
          vl(0x828),
          vl(0x723),
          vl(0x32b),
          vl(0x96b),
          vl(0x6e6),
          vl(0xd2b),
          vl(0xa37),
          vl(0x928),
          vl(0x6fa),
          vl(0x283),
          vl(0x209),
          vl(0xbb2),
          vl(0xbb6),
          vl(0xe05),
          vl(0xac2),
          vl(0xcc8),
          vl(0x94b),
          vl(0x2b6),
          vl(0xdbf),
          vl(0x553),
          vl(0xa13),
          vl(0x74c),
          vl(0x9f6),
          vl(0x480),
          vl(0xaec),
          vl(0xa15),
          vl(0x7d5),
          vl(0x1a5),
          vl(0x3a1),
          vl(0x820),
          vl(0x465),
          vl(0x502),
          vl(0x541),
          vl(0x5a4),
          vl(0x37d),
          vl(0xbd6),
          vl(0x685),
          vl(0xab2),
          vl(0xb6c),
          vl(0x675),
          vl(0x2c1),
          vl(0x1f2),
          vl(0xc18),
          vl(0xd38),
          vl(0x968),
          vl(0xa2e),
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
          if (ih[vm(0x7d0)] === void 0x0) {
            var ro = function (rt) {
              const vn = vm,
                ru = vn(0x5f9);
              let rv = "",
                rw = "";
              for (
                let rx = 0xc6a + -0x161c + -0x22 * -0x49,
                  ry,
                  rz,
                  rA = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rz = rt[vn(0x426)](rA++));
                ~rz &&
                ((ry =
                  rx % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? ry * (0x2422 + -0x5 * 0x38b + -0x122b) + rz
                    : rz),
                rx++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rv += String[vn(0x479)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (ry >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rx) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rz = ru[vn(0x351)](rz);
              }
              for (
                let rB = 0x23d0 + 0x13 * -0xdf + -0x1343, rC = rv[vn(0x441)];
                rB < rC;
                rB++
              ) {
                rw +=
                  "%" +
                  ("00" +
                    rv[vn(0x743)](rB)[vn(0x2b9)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vn(0x923)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
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
                  (rw + rv[rz] + ru[vo(0x743)](rz % ru[vo(0x441)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rx = rv[rz]),
                  (rv[rz] = rv[rw]),
                  (rv[rw] = rx);
              }
              (rz = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rw = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rA = -0x1d30 + -0x23c8 + 0x40f8;
                rA < rt[vo(0x441)];
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
                  (ry += String[vo(0x479)](
                    rt[vo(0x743)](rA) ^
                      rv[(rv[rz] + rv[rw]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return ry;
            };
            (ih[vm(0xd95)] = rs), (ri = arguments), (ih[vm(0x7d0)] = !![]);
          }
          const rp = rk[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rq = rl + rp,
            rr = ri[rq];
          return (
            !rr
              ? (ih[vm(0x2ff)] === void 0x0 && (ih[vm(0x2ff)] = !![]),
                (rn = ih[vm(0xd95)](rn, rm)),
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
            (parseInt(rk(0x1a1, 0x1b2, 0x1a9, 0x1b7, vp(0xd97))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rm(-0x105, -0x12e, -0x131, vp(0xd97), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(rk(0x1b5, 0x1c9, 0x1b1, 0x1cb, vp(0x245))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rm(-0x128, -0x132, -0x134, vp(0x4a8), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rm(-0x131, -0x155, -0x130, vp(0xd6d), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rn(0x9a, 0xb1, 0xb2, vp(0x245), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(rk(0x1b5, 0x1d3, 0x1bc, 0x1d1, vp(0x9d8))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rn(0xb2, 0xbe, 0xb9, vp(0xad2), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(rk(0x183, 0x1ae, 0x197, 0x19e, vp(0x42c))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rp(-0x244, -0x216, -0x232, -0x217, vp(0x28f))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rm(-0x126, -0x10f, -0x13a, vp(0xcac), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rp(-0x203, -0x209, -0x200, -0x1e1, vp(0xe0f))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rq === rj) break;
          else ro[vp(0xaba)](ro[vp(0x173)]());
        } catch (rr) {
          ro[vp(0xaba)](ro[vp(0x173)]());
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
            rl(vq(0x4a8), -0x130, -0x106, -0x11f, -0x11d) +
            rl(vq(0x977), -0x11a, -0x142, -0x138, -0x135),
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
        ri[rk(-0x27e, -0x274, -0x265, vq(0x49b), -0x274)](
          typeof window,
          ri[rm(vq(0x861), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        ri[ro(-0x17d, -0x171, -0x181, vq(0x4e4), -0x16a)](
          typeof ki,
          ri[rk(-0x25a, -0x263, -0x26c, vq(0x977), -0x270)]
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
      const rn = rj[rm(vq(0xad2), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function ro(ru, rv, rw, rx, ry) {
        return ih(ru - -0x20a, rx);
      }
      const rp = ri[rr(0x43a, vq(0x6fe), 0x40e, 0x428, 0x430)](
        ij,
        ri[rk(-0x28e, -0x27f, -0x272, vq(0x4e4), -0x281)](
          ri[rl(vq(0x29c), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rn
          ),
          ib[rl(vq(0xa59), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rq = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rp[
        rl(vq(0x9dd), -0x11e, -0x149, -0x131, -0x13c) +
          ro(-0x172, -0x16e, -0x175, vq(0x861), -0x166)
      ](rq++, cI[ro(-0x18e, -0x16e, -0x17a, vq(0x4a8), -0x1a6)]),
        rp[
          rr(0x415, vq(0x582), 0x44c, 0x433, 0x422) +
            rm(vq(0x95d), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rq, cJ),
        (rq += -0x3dd + -0x6b5 + 0xa94);
      function rr(ru, rv, rw, rx, ry) {
        return ih(rx - 0x3a2, rv);
      }
      const rs = ri[rr(0x43c, vq(0xacb), 0x43b, 0x446, 0x459)](
        ri[rk(-0x283, -0x272, -0x298, vq(0x71d), -0x26e)](
          cJ,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let ru = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        ri[rm(vq(0xc34), 0x200, 0x1fc, 0x1fc, 0x1e5)](ru, rn);
        ru++
      ) {
        rp[
          rk(-0x287, -0x273, -0x27d, vq(0x861), -0x27c) +
            rm(vq(0x15a), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rq++,
          ri[rm(vq(0x4b8), 0x201, 0x215, 0x21c, 0x1fc)](
            rj[
              rl(vq(0x600), -0x11c, -0x130, -0x128, -0x13b) +
                rk(-0x289, -0x29c, -0x26a, vq(0xa59), -0x290)
            ](
              ri[rl(vq(0x827), -0x13a, -0x124, -0x111, -0x120)](
                ri[rl(vq(0x49b), -0x10d, -0x119, -0x108, -0x128)](rn, ru),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rs
          )
        );
      }
      if (ib) {
        const rv = ib[rm(vq(0x4e4), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rw = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          ri[rm(vq(0xb3f), 0x21f, 0x216, 0x204, 0x200)](rw, rv);
          rw++
        ) {
          rp[
            rm(vq(0x95d), 0x207, 0x20e, 0x209, 0x202) +
              rm(vq(0x600), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rq++,
            ri[rk(-0x25b, -0x256, -0x24f, vq(0x4c2), -0x261)](
              ib[
                rk(-0x267, -0x256, -0x25e, vq(0x230), -0x271) +
                  rr(0x412, vq(0x600), 0x411, 0x421, 0x425)
              ](
                ri[rr(0x435, vq(0xd97), 0x427, 0x434, 0x41a)](
                  ri[rl(vq(0x696), -0x143, -0x134, -0x133, -0x137)](rv, rw),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rs
            )
          );
        }
      }
      const rt = rp[
        rr(0x423, vq(0x4a8), 0x44b, 0x440, 0x45a) +
          rk(-0x280, -0x27d, -0x26e, vq(0x95d), -0x288)
      ](
        ri[ro(-0x162, -0x164, -0x161, vq(0x977), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          ri[rr(0x429, vq(0xd1a), 0x43d, 0x437, 0x44b)](
            ri[rl(vq(0x42c), -0x10d, -0x127, -0x124, -0x116)](
              cJ,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rn
          )
        )
      );
      ri[rr(0x435, vq(0x919), 0x43b, 0x42a, 0x448)](il, rp), (ia = rt);
    }
    function ij(ri) {
      return new DataView(new ArrayBuffer(ri));
    }
    function ik() {
      const vr = uf;
      return hU && hU[vr(0x25a)] === WebSocket[vr(0xa16)];
    }
    function il(ri) {
      const vs = uf;
      if (ik()) {
        po += ri[vs(0x212)];
        if (hW) {
          const rj = new Uint8Array(ri[vs(0x331)]);
          for (let rm = 0x0; rm < rj[vs(0x441)]; rm++) {
            rj[rm] ^= ia;
          }
          const rk = cJ % rj[vs(0x441)],
            rl = rj[0x0];
          (rj[0x0] = rj[rk]), (rj[rk] = rl);
        }
        hU[vs(0xab0)](ri);
      }
    }
    function im(ri, rj = 0x1) {
      const vt = uf;
      let rk = eU(ri);
      const rl = new Uint8Array([
        cI[vt(0xda2)],
        rk,
        Math[vt(0xc28)](rj * 0xff),
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
          vu(0x625),
          vu(0xa93),
          vu(0xd0e),
          vu(0x168),
          vu(0x402),
          vu(0xd0b),
          vu(0x890),
          vu(0xabd),
          vu(0x508),
          vu(0xb1b),
          vu(0x2f1),
          vu(0x6f5),
          vu(0xd4c),
          vu(0xb35),
          vu(0x1b7),
          vu(0xbcd),
          vu(0x25f),
          vu(0xd64),
          vu(0x1b0),
          vu(0x4af),
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
          else rl[vv(0xaba)](rl[vv(0x173)]());
        } catch (rr) {
          rl[vv(0xaba)](rl[vv(0x173)]());
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
        (kk[vw(0x2d7)] = vw(0x4b5) + ri + vw(0xc65) + rj + vw(0x11d)),
        kk[vw(0x72b)](hY),
        (hY[vw(0xaf5)][vw(0xd72)] = ""),
        (i3[vw(0xaf5)][vw(0xd72)] = vw(0xae3)),
        (i0[vw(0xaf5)][vw(0xd72)] = vw(0xae3)),
        (hY[vw(0x678)](vw(0x1c2))[vw(0xaf5)][vw(0x93a)] = "0"),
        document[vw(0x4f6)][vw(0x30b)][vw(0xcef)](vw(0x223)),
        (kk[vw(0xaf5)][vw(0xd72)] = ""),
        (kl[vw(0xaf5)][vw(0xd72)] =
          kn[vw(0xaf5)][vw(0xd72)] =
          km[vw(0xaf5)][vw(0xd72)] =
          kC[vw(0xaf5)][vw(0xd72)] =
            vw(0xae3));
      const rl = document[vw(0x678)](vw(0x288));
      document[vw(0x678)](vw(0x646))[vw(0x108)] = function () {
        ro();
      };
      let rm = rk;
      k8(rl, vw(0xd84) + rm + vw(0x117));
      const rn = setInterval(() => {
        const vx = vw;
        rm--, rm <= 0x0 ? ro() : k8(rl, vx(0xd84) + rm + vx(0x117));
      }, 0x3e8);
      function ro() {
        const vy = vw;
        clearInterval(rn), k8(rl, vy(0x7d6)), location[vy(0x633)]();
      }
    }
    function iu() {
      const vz = uf;
      if (hU) {
        hU[vz(0x7dc)] = hU[vz(0x7d2)] = hU[vz(0xd49)] = null;
        try {
          hU[vz(0xb36)]();
        } catch (ri) {}
        hU = null;
      }
    }
    var iv = {},
      iw = [],
      ix,
      iy,
      iz = [],
      iA = uf(0x45c);
    function iB() {
      const vA = uf;
      iA = getComputedStyle(document[vA(0x4f6)])[vA(0x750)];
    }
    var iC = document[uf(0x678)](uf(0x342)),
      iD = document[uf(0x678)](uf(0x67d)),
      iE = document[uf(0x678)](uf(0xc41)),
      iF = [],
      iG = [],
      iH = ![],
      iI = 0x0;
    function iJ(ri) {
      const vB = uf;
      if (ri < 0.01) return "0";
      ri = Math[vB(0xc28)](ri);
      if (ri >= 0x3b9aca00)
        return parseFloat((ri / 0x3b9aca00)[vB(0x40d)](0x2)) + "b";
      else {
        if (ri >= 0xf4240)
          return parseFloat((ri / 0xf4240)[vB(0x40d)](0x2)) + "m";
        else {
          if (ri >= 0x3e8)
            return parseFloat((ri / 0x3e8)[vB(0x40d)](0x1)) + "k";
        }
      }
      return ri;
    }
    function iK(ri, rj) {
      const vC = uf,
        rk = document[vC(0x6a4)](vC(0x3c9));
      rk[vC(0xab1)] = vC(0x444);
      const rl = document[vC(0x6a4)](vC(0x3c9));
      (rl[vC(0xab1)] = vC(0xc00)), rk[vC(0x72b)](rl);
      const rm = document[vC(0x6a4)](vC(0x795));
      rk[vC(0x72b)](rm), iC[vC(0x72b)](rk);
      const rn = {};
      (rn[vC(0xb0b)] = ri),
        (rn[vC(0xc9e)] = rj),
        (rn[vC(0x99c)] = 0x0),
        (rn[vC(0x7c4)] = 0x0),
        (rn[vC(0x48c)] = 0x0),
        (rn["el"] = rk),
        (rn[vC(0x530)] = rl),
        (rn[vC(0xd65)] = rm);
      const ro = rn;
      (ro[vC(0x235)] = iG[vC(0x441)]),
        (ro[vC(0x1b9)] = function () {
          const vD = vC;
          (this[vD(0x99c)] = pg(this[vD(0x99c)], this[vD(0xc9e)], 0x64)),
            (this[vD(0x48c)] = pg(this[vD(0x48c)], this[vD(0x7c4)], 0x64)),
            this[vD(0xd65)][vD(0x4eb)](
              vD(0x4b4),
              (this[vD(0xb0b)] ? this[vD(0xb0b)] + vD(0x991) : "") +
                iJ(this[vD(0x99c)])
            ),
            (this[vD(0x530)][vD(0xaf5)][vD(0xc8b)] = this[vD(0x48c)] + "%");
        }),
        ro[vC(0x1b9)](),
        iG[vC(0xaba)](ro);
    }
    function iL(ri) {
      const vE = uf;
      if (iG[vE(0x441)] === 0x0) return;
      const rj = iG[0x0];
      rj[vE(0x7c4)] = rj[vE(0x48c)] = 0x64;
      for (let rk = 0x1; rk < iG[vE(0x441)]; rk++) {
        const rl = iG[rk];
        (rl[vE(0x7c4)] =
          Math[vE(0xbd3)](
            0x1,
            rj[vE(0xc9e)] === 0x0 ? 0x1 : rl[vE(0xc9e)] / rj[vE(0xc9e)]
          ) * 0x64),
          ri && (rl[vE(0x48c)] = rl[vE(0x7c4)]),
          iC[vE(0x72b)](rl["el"]);
      }
    }
    function iM(ri) {
      const vF = uf,
        rj = new Path2D();
      rj[vF(0x269)](...ri[vF(0x902)][0x0]);
      for (let rk = 0x0; rk < ri[vF(0x902)][vF(0x441)] - 0x1; rk++) {
        const rl = ri[vF(0x902)][rk],
          rm = ri[vF(0x902)][rk + 0x1];
        let rn = 0x0;
        const ro = rm[0x0] - rl[0x0],
          rp = rm[0x1] - rl[0x1],
          rq = Math[vF(0x5d7)](ro, rp);
        while (rn < rq) {
          rj[vF(0x83f)](
            rl[0x0] + (rn / rq) * ro + (Math[vF(0x9e1)]() * 0x2 - 0x1) * 0x32,
            rl[0x1] + (rn / rq) * rp + (Math[vF(0x9e1)]() * 0x2 - 0x1) * 0x32
          ),
            (rn += Math[vF(0x9e1)]() * 0x28 + 0x1e);
        }
        rj[vF(0x83f)](...rm);
      }
      ri[vF(0x727)] = rj;
    }
    var iN = 0x0,
      iO = 0x0,
      iP = [],
      iQ = {},
      iR = [],
      iS = {};
    function iT(ri, rj) {
      const vG = uf;
      if (!oV[vG(0x23c)]) return;
      let rk;
      var baseHP = getHP(ri, hack.moblst);
      var decDmg = ri['nHealth'] - rj;
      var dmg = Math.floor(decDmg * 10000) / 100 + '%';
      if (baseHP && hack.isEnabled('DDenableNumber')) var dmg = Math.floor(decDmg * baseHP);
      const rl = rj === void 0x0;
      !rl && (rk = Math[vG(0x446)]((ri[vG(0xa4f)] - rj) * 0x64) || 0x1),
        iz[vG(0xaba)]({
          text: hack.isEnabled('damageDisplay') ? dmg : rk,
          x: ri["x"] + (Math[vG(0x9e1)]() * 0x2 - 0x1) * ri[vG(0xbab)] * 0.6,
          y: ri["y"] + (Math[vG(0x9e1)]() * 0x2 - 0x1) * ri[vG(0xbab)] * 0.6,
          vx: (Math[vG(0x9e1)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[vG(0x9e1)]() * 0x3,
          angle: (Math[vG(0x9e1)]() * 0x2 - 0x1) * (rl ? 0x1 : 0.1),
          size: Math[vG(0x606)](0x1, (ri[vG(0xbab)] * 0.2) / 0x14),
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
        rj[vH(0x427)] = !![];
        if (
          Math[vH(0xcb1)](rj["nx"] - iU) > iW + rj[vH(0xa17)] ||
          Math[vH(0xcb1)](rj["ny"] - iV) > iX + rj[vH(0xa17)]
        )
          rj[vH(0x106)] = 0xa;
        else !rj[vH(0x6ed)] && iT(rj, 0x0);
        delete iv[ri];
      }
    }
    var iZ = [
      uf(0xd62),
      uf(0x64e),
      uf(0x91b),
      uf(0x6ff),
      uf(0xd40),
      uf(0x373),
      uf(0xa9e),
      uf(0x639),
      uf(0x95a),
      uf(0x482),
      uf(0x1a3),
      uf(0x809),
      uf(0xb76),
    ];
    function j0(ri, rj = iy) {
      const vI = uf;
      (ri[vI(0xd62)] = rj[vI(0xd62)]),
        (ri[vI(0x64e)] = rj[vI(0x64e)]),
        (ri[vI(0x91b)] = rj[vI(0x91b)]),
        (ri[vI(0x6ff)] = rj[vI(0x6ff)]),
        (ri[vI(0xd40)] = rj[vI(0xd40)]),
        (ri[vI(0x373)] = rj[vI(0x373)]),
        (ri[vI(0xa9e)] = rj[vI(0xa9e)]),
        (ri[vI(0x639)] = rj[vI(0x639)]),
        (ri[vI(0x95a)] = rj[vI(0x95a)]),
        (ri[vI(0x482)] = rj[vI(0x482)]),
        (ri[vI(0xa41)] = rj[vI(0xa41)]),
        (ri[vI(0x1a3)] = rj[vI(0x1a3)]),
        (ri[vI(0x7ea)] = rj[vI(0x7ea)]),
        (ri[vI(0x809)] = rj[vI(0x809)]),
        (ri[vI(0xb76)] = rj[vI(0xb76)]);
    }
    function j1() {
      (oJ = null), oR(null), (oN = null), (oL = ![]), (oM = 0x0), o5 && pw();
    }
    var j2 = 0x64,
      j3 = 0x1,
      j4 = 0x64,
      j5 = 0x1,
      j6 = {},
      j7 = [...Object[uf(0x5cc)](d9)],
      j8 = [...hQ];
    ja(j7),
      ja(j8),
      j7[uf(0xaba)](uf(0x197)),
      j8[uf(0xaba)](hP[uf(0x5b2)] || uf(0xade)),
      j7[uf(0xaba)](uf(0xa26)),
      j8[uf(0xaba)](uf(0xd91));
    var j9 = [];
    for (let ri = 0x0; ri < j7[uf(0x441)]; ri++) {
      const rj = d9[j7[ri]] || 0x0;
      j9[ri] = 0x78 + (rj - d9[uf(0x8c2)]) * 0x3c - 0x1 + 0x1;
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
          vJ(0xc0c) + j7[rk] + vJ(0xa46) + rl + vJ(0x3b4) + rl + vJ(0x41c)
        ),
        rn = rm[vJ(0x678)](vJ(0x9a8));
      (j6 = {
        id: rk,
        el: rm,
        state: cT[vJ(0xae3)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rm[vJ(0x678)](vJ(0x978)),
        progressEl: rn,
        barEl: rn[vJ(0x678)](vJ(0xdf7)),
        textEl: rn[vJ(0x678)](vJ(0x795)),
        nameEl: rm[vJ(0x678)](vJ(0x555)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const vK = vJ,
            ro = Math[vK(0xbd3)](0x1, (pz - this[vK(0xaf7)]) / 0x64);
          this[vK(0x236)] =
            this[vK(0xb16)] + (this[vK(0x76c)] - this[vK(0xb16)]) * ro;
          const rp = this[vK(0x236)] - 0x1;
          this[vK(0x530)][vK(0xaf5)][vK(0xa99)] =
            vK(0xc5f) + rp * 0x64 + vK(0xace) + rp + vK(0xd33);
        },
        update() {
          const vL = vJ,
            ro = je(this["t"]),
            rp = 0x1 - ro;
          (this["el"][vL(0xaf5)][vL(0x93a)] = -0xc8 * rp + "px"),
            (this["el"][vL(0xaf5)][vL(0xa99)] = vL(0xb90) + -0x64 * rp + "%)");
        },
        remove() {
          const vM = vJ;
          rm[vM(0xcef)]();
        },
      }),
        (j6[vJ(0x128)][vJ(0xaf5)][vJ(0xd72)] = vJ(0xae3)),
        jc[vJ(0xaba)](j6),
        j6[vJ(0x1b9)](),
        jb[vJ(0xaba)](j6),
        km[vJ(0xc23)](rm, pM);
    }
    function je(rk) {
      return 0x1 - (0x1 - rk) * (0x1 - rk);
    }
    function jf(rk) {
      const vN = uf;
      return rk < 0.5
        ? (0x1 - Math[vN(0xcb6)](0x1 - Math[vN(0x84e)](0x2 * rk, 0x2))) / 0x2
        : (Math[vN(0xcb6)](0x1 - Math[vN(0x84e)](-0x2 * rk + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jg() {
      const vO = uf;
      (ok[vO(0x2d7)] = ""), (om = {});
    }
    var jh = document[uf(0x678)](uf(0x5ae));
    jh[uf(0xaf5)][uf(0xd72)] = uf(0xae3);
    var ji = document[uf(0x678)](uf(0x98d)),
      jj = [],
      jk = document[uf(0x678)](uf(0xa29));
    jk[uf(0x91c)] = function () {
      jl();
    };
    function jl() {
      const vP = uf;
      for (let rk = 0x0; rk < jj[vP(0x441)]; rk++) {
        const rl = jj[rk];
        k8(rl[vP(0x806)][0x0], jk[vP(0x5fa)] ? vP(0xde1) : rl[vP(0x6c4)]);
      }
    }
    function jm(rk) {
      const vQ = uf;
      (jh[vQ(0xaf5)][vQ(0xd72)] = ""), (ji[vQ(0x2d7)] = vQ(0x70a));
      const rl = rk[vQ(0x441)];
      jj = [];
      for (let rm = 0x0; rm < rl; rm++) {
        const rn = rk[rm];
        ji[vQ(0x72b)](nA(vQ(0xa2b) + (rm + 0x1) + vQ(0x62e))), jn(rn);
      }
      m1[vQ(0x390)][vQ(0x841)]();
    }
    function jn(rk) {
      const vR = uf;
      for (let rl = 0x0; rl < rk[vR(0x441)]; rl++) {
        const rm = rk[rl],
          rn = nA(vR(0xbca) + rm + vR(0xdcf));
        (rn[vR(0x6c4)] = rm),
          rl > 0x0 && jj[vR(0xaba)](rn),
          (rn[vR(0x108)] = function () {
            jp(rm);
          }),
          ji[vR(0x72b)](rn);
      }
      jl();
    }
    function jo(rk) {
      const vS = uf;
      var rl = document[vS(0x6a4)](vS(0x31c));
      (rl[vS(0xcb7)] = rk),
        (rl[vS(0xaf5)][vS(0x545)] = "0"),
        (rl[vS(0xaf5)][vS(0xa44)] = "0"),
        (rl[vS(0xaf5)][vS(0x43a)] = vS(0x40e)),
        document[vS(0x4f6)][vS(0x72b)](rl),
        rl[vS(0x6d4)](),
        rl[vS(0x8bf)]();
      try {
        var rm = document[vS(0x195)](vS(0xdb2)),
          rn = rm ? vS(0xc26) : vS(0x7e1);
      } catch (ro) {}
      document[vS(0x4f6)][vS(0xd6e)](rl);
    }
    function jp(rk) {
      const vT = uf;
      if (!navigator[vT(0xc8e)]) {
        jo(rk);
        return;
      }
      navigator[vT(0xc8e)][vT(0x8ca)](rk)[vT(0x8da)](
        function () {},
        function (rl) {}
      );
    }
    var jq = [
        uf(0x165),
        uf(0x939),
        uf(0xb44),
        uf(0x9e9),
        uf(0xa04),
        uf(0x697),
        uf(0xc06),
        uf(0x687),
        uf(0x487),
        uf(0x980),
        uf(0x6da),
      ],
      jr = [uf(0x8de), uf(0x18a), uf(0x29e)];
    function js(rk) {
      const vU = uf,
        rl = rk ? jr : jq;
      return rl[Math[vU(0x508)](Math[vU(0x9e1)]() * rl[vU(0x441)])];
    }
    function jt(rk) {
      const vV = uf;
      return rk[vV(0x2df)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var ju = document[uf(0x678)](uf(0xc29));
    ju[uf(0x108)] = ng(function (rk) {
      const vW = uf;
      iy && il(new Uint8Array([cI[vW(0x182)]]));
    });
    var jv = "";
    function jw(rk) {
      const vX = uf;
      return rk[vX(0xa27)](/"/g, vX(0x1a2));
    }
    function jx(rk) {
      const vY = uf;
      let rl = "";
      for (let rm = 0x0; rm < rk[vY(0x441)]; rm++) {
        const [rn, ro, rp] = rk[rm];
        rl +=
          vY(0xd41) +
          rn +
          "\x22\x20" +
          (rp ? vY(0xc87) : "") +
          vY(0x328) +
          jw(ro) +
          vY(0x7a2);
      }
      return vY(0x1ee) + rl + vY(0xbbb);
    }
    var jy = ![];
    function jz() {
      const vZ = uf;
      return nA(vZ(0xb4d) + hP[vZ(0x8c2)] + vZ(0x69a));
    }
    var jA = document[uf(0x678)](uf(0x3b3));
    function jB() {
      const w0 = uf;
      (oC[w0(0xaf5)][w0(0xd72)] = pM[w0(0xaf5)][w0(0xd72)] =
        jy ? w0(0xae3) : ""),
        (jA[w0(0xaf5)][w0(0xd72)] = ky[w0(0xaf5)][w0(0xd72)] =
          jy ? "" : w0(0xae3));
      jy
        ? (kz[w0(0x30b)][w0(0x5d6)](w0(0xbba)),
          k8(kz[w0(0x806)][0x0], w0(0x452)))
        : (kz[w0(0x30b)][w0(0xcef)](w0(0xbba)),
          k8(kz[w0(0x806)][0x0], w0(0x7f8)));
      const rk = [hG, m7];
      for (let rl = 0x0; rl < rk[w0(0x441)]; rl++) {
        const rm = rk[rl];
        rm[w0(0x30b)][jy ? w0(0x5d6) : w0(0xcef)](w0(0xba0)),
          (rm[w0(0x34f)] = jy ? jz : null),
          (rm[w0(0x16f)] = !![]);
      }
      jC[w0(0xaf5)][w0(0xd72)] = nJ[w0(0xaf5)][w0(0xd72)] = jy ? w0(0xae3) : "";
    }
    var jC = document[uf(0x678)](uf(0xb51)),
      jD = document[uf(0x678)](uf(0xa12)),
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
      for (let rn = jL[w1(0x441)] - 0x1; rn >= 0x0; rn--) {
        const ro = jL[rn];
        if (ni(rk, ro) > 0.7) {
          rm++;
          if (rm >= 0x5) return ![];
        }
      }
      return jL[w1(0xaba)](rk), !![];
    }
    var jO = document[uf(0x678)](uf(0x684)),
      jP = document[uf(0x678)](uf(0x18e)),
      jQ = document[uf(0x678)](uf(0xaa3)),
      jR = document[uf(0x678)](uf(0x853)),
      jS;
    k8(jQ, "-"),
      (jQ[uf(0x108)] = function () {
        if (jS) mi(jS);
      });
    var jT = 0x0,
      jU = document[uf(0x678)](uf(0x52e));
    setInterval(() => {
      const w2 = uf;
      jT--;
      if (jT < 0x0) {
        jU[w2(0x30b)][w2(0xd59)](w2(0x841)) &&
          hW &&
          il(new Uint8Array([cI[w2(0xbe0)]]));
        return;
      }
      jV();
    }, 0x3e8);
    function jV() {
      k8(jR, ka(jT * 0x3e8));
    }
    function jW() {
      const w3 = uf,
        rk = document[w3(0x678)](w3(0x698))[w3(0x806)],
        rl = document[w3(0x678)](w3(0x109))[w3(0x806)];
      for (let rm = 0x0; rm < rk[w3(0x441)]; rm++) {
        const rn = rk[rm],
          ro = rl[rm];
        rn[w3(0x108)] = function () {
          const w4 = w3;
          for (let rp = 0x0; rp < rl[w4(0x441)]; rp++) {
            const rq = rm === rp;
            (rl[rp][w4(0xaf5)][w4(0xd72)] = rq ? "" : w4(0xae3)),
              rk[rp][w4(0x30b)][rq ? w4(0x5d6) : w4(0xcef)](w4(0x6e2));
          }
        };
      }
      rk[0x0][w3(0x108)]();
    }
    jW();
    var jX = [];
    function jY(rk) {
      const w5 = uf;
      rk[w5(0x30b)][w5(0x5d6)](w5(0x77e)), jX[w5(0xaba)](rk);
    }
    var jZ,
      k0 = document[uf(0x678)](uf(0x8b9));
    function k1(rk, rl = !![]) {
      const w6 = uf;
      if (rl) {
        if (pz < jG) {
          jH[w6(0xaba)](rk);
          return;
        } else {
          if (jH[w6(0x441)] > 0x0)
            while (jH[w6(0x441)] > 0x0) {
              k1(jH[w6(0x173)](), ![]);
            }
        }
      }
      function rm() {
        const w7 = w6,
          ry = rv[w7(0x6d8)](rw++),
          rz = new Uint8Array(ry);
        for (let rA = 0x0; rA < ry; rA++) {
          rz[rA] = rv[w7(0x6d8)](rw++);
        }
        return new TextDecoder()[w7(0xdd0)](rz);
      }
      function rn() {
        const w8 = w6;
        return rv[w8(0x6d8)](rw++) / 0xff;
      }
      function ro(ry) {
        const w9 = w6,
          rz = rv[w9(0xd9d)](rw);
        (rw += 0x2),
          (ry[w9(0xb32)] = rz & 0x1),
          (ry[w9(0xd62)] = rz & 0x2),
          (ry[w9(0x64e)] = rz & 0x4),
          (ry[w9(0x91b)] = rz & 0x8),
          (ry[w9(0x6ff)] = rz & 0x10),
          (ry[w9(0xd40)] = rz & 0x20),
          (ry[w9(0x373)] = rz & 0x40),
          (ry[w9(0xa9e)] = rz & 0x80),
          (ry[w9(0x639)] = rz & 0x100),
          (ry[w9(0x95a)] = rz & (0x1 << 0x9)),
          (ry[w9(0x482)] = rz & (0x1 << 0xa)),
          (ry[w9(0xa41)] = rz & (0x1 << 0xb)),
          (ry[w9(0x1a3)] = rz & (0x1 << 0xc)),
          (ry[w9(0x7ea)] = rz & (0x1 << 0xd)),
          (ry[w9(0x809)] = rz & (0x1 << 0xe)),
          (ry[w9(0xb76)] = rz & (0x1 << 0xf));
      }
      function rp() {
        const wa = w6,
          ry = rv[wa(0xa6c)](rw);
        rw += 0x4;
        const rz = rm();
        iK(rz, ry);
      }
      function rq() {
        const wb = w6,
          ry = rv[wb(0xd9d)](rw) - cG;
        return (rw += 0x2), ry;
      }
      function rr() {
        const wc = w6,
          ry = {};
        for (let rJ in mb) {
          (ry[rJ] = rv[wc(0xa6c)](rw)), (rw += 0x4);
        }
        const rz = rm(),
          rA = Number(rv[wc(0x8f1)](rw));
        rw += 0x8;
        const rB = d5(d4(rA)[0x0]),
          rC = rB * 0x2,
          rD = Array(rC);
        for (let rK = 0x0; rK < rC; rK++) {
          const rL = rv[wc(0xd9d)](rw) - 0x1;
          rw += 0x2;
          if (rL < 0x0) continue;
          rD[rK] = dC[rL];
        }
        const rE = [],
          rF = rv[wc(0xd9d)](rw);
        rw += 0x2;
        for (let rM = 0x0; rM < rF; rM++) {
          const rN = rv[wc(0xd9d)](rw);
          rw += 0x2;
          const rO = rv[wc(0xa6c)](rw);
          (rw += 0x4), rE[wc(0xaba)]([dC[rN], rO]);
        }
        const rG = [],
          rH = rv[wc(0xd9d)](rw);
        rw += 0x2;
        for (let rP = 0x0; rP < rH; rP++) {
          const rQ = rv[wc(0xd9d)](rw);
          (rw += 0x2), !eK[rQ] && console[wc(0x9b1)](rQ), rG[wc(0xaba)](eK[rQ]);
        }
        const rI = rv[wc(0x6d8)](rw++);
        mg(rz, ry, rE, rG, rA, rD, rI);
      }
      function rs() {
        const wd = w6,
          ry = Number(rv[wd(0x8f1)](rw));
        return (rw += 0x8), ry;
      }
      function rt() {
        const we = w6,
          ry = rv[we(0xa6c)](rw);
        rw += 0x4;
        const rz = rv[we(0x6d8)](rw++),
          rA = {};
        (rA[we(0x7ae)] = ry), (rA[we(0xb5d)] = {});
        const rB = rA;
        f3[we(0xd78)]((rD, rE) => {
          const wf = we;
          rB[wf(0xb5d)][rD] = [];
          for (let rF = 0x0; rF < rz; rF++) {
            const rG = rm();
            let rH;
            rD === "xp" ? (rH = rs()) : ((rH = rv[wf(0xa6c)](rw)), (rw += 0x4)),
              rB[wf(0xb5d)][rD][wf(0xaba)]([rG, rH]);
          }
        }),
          k8(jD, k9(rB[we(0x7ae)]) + we(0xd0a)),
          (ml[we(0x2d7)] = "");
        let rC = 0x0;
        for (let rD in rB[we(0xb5d)]) {
          const rE = kd(rD),
            rF = rB[we(0xb5d)][rD],
            rG = nA(we(0x999) + rC + we(0x24f) + rE + we(0x5d9)),
            rH = rG[we(0x678)](we(0xe0b));
          for (let rI = 0x0; rI < rF[we(0x441)]; rI++) {
            const [rJ, rK] = rF[rI];
            let rL = ma(rD, rK);
            rD === "xp" && (rL += we(0x24a) + (d4(rK)[0x0] + 0x1) + ")");
            const rM = nA(
              we(0x3af) + (rI + 0x1) + ".\x20" + rJ + we(0x72f) + rL + we(0x547)
            );
            (rM[we(0x108)] = function () {
              mi(rJ);
            }),
              rH[we(0x3d2)](rM);
          }
          ml[we(0x3d2)](rG), rC++;
        }
      }
      function ru() {
        const wg = w6;
        (jS = rm()), k8(jQ, jS || "-");
        const ry = Number(rv[wg(0x8f1)](rw));
        (rw += 0x8),
          (jT = Math[wg(0xc28)]((ry - Date[wg(0xe04)]()) / 0x3e8)),
          jV();
        const rz = rv[wg(0xd9d)](rw);
        rw += 0x2;
        if (rz === 0x0) jP[wg(0x2d7)] = wg(0x340);
        else {
          jP[wg(0x2d7)] = "";
          for (let rB = 0x0; rB < rz; rB++) {
            const rC = rm(),
              rD = rv[wg(0x193)](rw);
            rw += 0x4;
            const rE = rD * 0x64,
              rF = rE >= 0x1 ? rE[wg(0x40d)](0x2) : rE[wg(0x40d)](0x5),
              rG = nA(
                wg(0x4cb) +
                  (rB + 0x1) +
                  ".\x20" +
                  rC +
                  wg(0x44e) +
                  rF +
                  wg(0x49d)
              );
            rC === jv && rG[wg(0x30b)][wg(0x5d6)]("me"),
              (rG[wg(0x108)] = function () {
                mi(rC);
              }),
              jP[wg(0x72b)](rG);
          }
        }
        k0[wg(0x2d7)] = "";
        const rA = rv[wg(0xd9d)](rw);
        (rw += 0x2), (jZ = {});
        if (rA === 0x0)
          (jO[wg(0x2d7)] = wg(0x643)), (k0[wg(0xaf5)][wg(0xd72)] = wg(0xae3));
        else {
          const rH = {};
          jO[wg(0x2d7)] = "";
          for (let rI = 0x0; rI < rA; rI++) {
            const rJ = rv[wg(0xd9d)](rw);
            rw += 0x2;
            const rK = rv[wg(0xa6c)](rw);
            (rw += 0x4), (jZ[rJ] = rK);
            const rL = dC[rJ],
              rM = nA(
                wg(0x572) +
                  rL[wg(0xd26)] +
                  wg(0xd1f) +
                  qk(rL) +
                  wg(0xb2e) +
                  rK +
                  wg(0x93b)
              );
            (rM[wg(0xdd2)] = jU),
              jY(rM),
              (rM[wg(0x34f)] = rL),
              jO[wg(0x72b)](rM),
              (rH[rL[wg(0xd26)]] = (rH[rL[wg(0xd26)]] || 0x0) + rK);
          }
          nX(jO), (k0[wg(0xaf5)][wg(0xd72)] = ""), oo(k0, rH);
        }
      }
      const rv = new DataView(rk[w6(0x575)]);
      po += rv[w6(0x212)];
      let rw = 0x0;
      const rx = rv[w6(0x6d8)](rw++);
      switch (rx) {
        case cI[w6(0x222)]:
          {
            const rT = rv[w6(0xd9d)](rw);
            rw += 0x2;
            for (let rU = 0x0; rU < rT; rU++) {
              const rV = rv[w6(0xd9d)](rw);
              rw += 0x2;
              const rW = rv[w6(0xa6c)](rw);
              (rw += 0x4), mQ(rV, rW);
            }
          }
          break;
        case cI[w6(0xe0e)]:
          ru();
          break;
        case cI[w6(0x2ca)]:
          kC[w6(0x30b)][w6(0x5d6)](w6(0x841)), hT(), (jG = pz + 0x1f4);
          break;
        case cI[w6(0xb5f)]:
          (m5[w6(0x2d7)] = w6(0x4d4)), m5[w6(0x72b)](m8), (m9 = ![]);
          break;
        case cI[w6(0x63b)]: {
          const rX = dC[rv[w6(0xd9d)](rw)];
          rw += 0x2;
          const rY = rv[w6(0xa6c)](rw);
          (rw += 0x4),
            (m5[w6(0x2d7)] =
              w6(0x167) +
              rX[w6(0xd26)] +
              "\x22\x20" +
              qk(rX) +
              w6(0xb2e) +
              k9(rY) +
              w6(0x6f0));
          const rZ = m5[w6(0x678)](w6(0x900));
          (rZ[w6(0x34f)] = rX),
            (rZ[w6(0x108)] = function () {
              const wh = w6;
              mQ(rX["id"], rY), (this[wh(0x108)] = null), m8[wh(0x108)]();
            }),
            (m9 = ![]);
          break;
        }
        case cI[w6(0xd02)]: {
          const s0 = rv[w6(0x6d8)](rw++),
            s1 = rv[w6(0xa6c)](rw);
          rw += 0x4;
          const s2 = rm();
          (m5[w6(0x2d7)] =
            w6(0x9bc) +
            s2 +
            w6(0xa46) +
            hP[w6(0x6ab)] +
            w6(0xcea) +
            k9(s1) +
            "\x20" +
            hN[s0] +
            w6(0xa46) +
            hQ[s0] +
            w6(0x9ae)),
            (m5[w6(0x678)](w6(0x314))[w6(0x108)] = function () {
              mi(s2);
            }),
            m5[w6(0x72b)](m8),
            (m9 = ![]);
          break;
        }
        case cI[w6(0xbdd)]:
          (m5[w6(0x2d7)] = w6(0x74d)), m5[w6(0x72b)](m8), (m9 = ![]);
          break;
        case cI[w6(0x64d)]:
          hK(w6(0x938));
          break;
        case cI[w6(0x8c4)]:
          rt();
          break;
        case cI[w6(0x279)]:
          hK(w6(0x77b)), hc(w6(0x77b));
          break;
        case cI[w6(0x210)]:
          hK(w6(0xb7c)), hc(w6(0x171));
          break;
        case cI[w6(0x293)]:
          hK(w6(0x5d5));
          break;
        case cI[w6(0x324)]:
          rr();
          break;
        case cI[w6(0xc63)]:
          hc(w6(0xbe7));
          break;
        case cI[w6(0x941)]:
          hc(w6(0x99f), hP[w6(0x5b2)]), hJ(hH);
          break;
        case cI[w6(0x390)]:
          const ry = rv[w6(0xd9d)](rw);
          rw += 0x2;
          const rz = [];
          for (let s3 = 0x0; s3 < ry; s3++) {
            const s4 = rv[w6(0xa6c)](rw);
            rw += 0x4;
            const s5 = rm(),
              s6 = rm(),
              s7 = rm();
            rz[w6(0xaba)]([s5 || w6(0x911) + s4, s6, s7]);
          }
          jm(rz);
          break;
        case cI[w6(0x843)]:
          for (let s8 in mb) {
            const s9 = rv[w6(0xa6c)](rw);
            (rw += 0x4), mc[s8][w6(0xd55)](s9);
          }
          break;
        case cI[w6(0x9f3)]:
          const rA = rv[w6(0x6d8)](rw++),
            rB = rv[w6(0xa6c)](rw++),
            rC = {};
          (rC[w6(0x1d5)] = rA), (rC[w6(0x48a)] = rB), (oN = rC);
          break;
        case cI[w6(0x6b2)]:
          (i0[w6(0xaf5)][w6(0xd72)] = i6 ? "" : w6(0xae3)),
            (i3[w6(0xaf5)][w6(0xd72)] = !i6 ? "" : w6(0xae3)),
            (hY[w6(0xaf5)][w6(0xd72)] = ""),
            (kn[w6(0xaf5)][w6(0xd72)] = w6(0xae3)),
            (hW = !![]),
            kB[w6(0x30b)][w6(0x5d6)](w6(0x841)),
            kA[w6(0x30b)][w6(0xcef)](w6(0x841)),
            j1(),
            m0(![]),
            (ix = rv[w6(0xa6c)](rw)),
            (rw += 0x4),
            (jv = rm()),
            hJ(jv),
            (jy = rv[w6(0x6d8)](rw++)),
            jB(),
            (j2 = rv[w6(0xd9d)](rw)),
            (rw += 0x2),
            (j5 = rv[w6(0x6d8)](rw++)),
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
            const sb = rv[w6(0xd9d)](rw) - 0x1;
            rw += 0x2;
            if (sb < 0x0) continue;
            iP[sa] = dC[sb];
          }
          nv(), nD();
          const rD = rv[w6(0xd9d)](rw);
          rw += 0x2;
          for (let sc = 0x0; sc < rD; sc++) {
            const sd = rv[w6(0xd9d)](rw);
            rw += 0x2;
            const se = nF(eK[sd]);
            se[w6(0xdd2)] = m2;
          }
          iS = {};
          while (rw < rv[w6(0x212)]) {
            const sf = rv[w6(0xd9d)](rw);
            rw += 0x2;
            const sg = rv[w6(0xa6c)](rw);
            (rw += 0x4), (iS[sf] = sg);
          }
          nV(), mR();
          break;
        case cI[w6(0xcf2)]:
          const rE = rv[w6(0x6d8)](rw++),
            rF = hL[rE] || w6(0x8ff);
          console[w6(0x9b1)](w6(0x388) + rF + ")"),
            (kf = rE === cR[w6(0x648)] || rE === cR[w6(0x33d)]);
          !kf &&
            it(w6(0xd35), w6(0x574) + rF, rE === cR[w6(0x5eb)] ? 0xa : 0x3c);
          break;
        case cI[w6(0x54e)]:
          (hg[w6(0xaf5)][w6(0xd72)] = kn[w6(0xaf5)][w6(0xd72)] = w6(0xae3)),
            kG(!![]),
            ju[w6(0x30b)][w6(0x5d6)](w6(0x841)),
            jg(),
            (p2[w6(0xaf5)][w6(0xd72)] = "");
          for (let sh in iQ) {
            iQ[sh][w6(0x1ec)] = 0x0;
          }
          (jI = pz),
            (n8 = {}),
            (n0 = 0x1),
            (n1 = 0x1),
            (mY = 0x0),
            (mZ = 0x0),
            mp(),
            (mV = cY[w6(0x98e)]),
            (jE = pz);
          break;
        case cI[w6(0x1b9)]:
          (pn = pz - jE), (jE = pz), pT[w6(0xd55)](rn()), pV[w6(0xd55)](rn());
          if (jy) {
            const si = rv[w6(0x6d8)](rw++);
            (jJ = si & 0x80), (jK = f6[si & 0x7f]);
          } else (jJ = ![]), (jK = null), pW[w6(0xd55)](rn());
          (pu = 0x1 + cW[rv[w6(0x6d8)](rw++)] / 0x64),
            (iW = (d0 / 0x2) * pu),
            (iX = (d1 / 0x2) * pu);
          const rG = rv[w6(0xd9d)](rw);
          rw += 0x2;
          for (let sj = 0x0; sj < rG; sj++) {
            const sk = rv[w6(0xa6c)](rw);
            rw += 0x4;
            let sl = iv[sk];
            if (sl) {
              if (sl[w6(0x1bf)]) {
                sl[w6(0x4e8)] = rv[w6(0x6d8)](rw++) - 0x1;
                continue;
              }
              const sm = rv[w6(0x6d8)](rw++);
              sm & 0x1 &&
                ((sl["nx"] = rq()), (sl["ny"] = rq()), (sl[w6(0x19d)] = 0x0));
              sm & 0x2 &&
                ((sl[w6(0x214)] = eS(rv[w6(0x6d8)](rw++))),
                (sl[w6(0x19d)] = 0x0));
              if (sm & 0x4) {
                const sn = rn();
                if (sn < sl[w6(0xa4f)]) iT(sl, sn), (sl[w6(0x45b)] = 0x1);
                else sn > sl[w6(0xa4f)] && (sl[w6(0x45b)] = 0x0);
                (sl[w6(0xa4f)] = sn), (sl[w6(0x19d)] = 0x0);
              }
              sm & 0x8 &&
                ((sl[w6(0x2c4)] = 0x1),
                (sl[w6(0x19d)] = 0x0),
                sl === iy && (pf = 0x1));
              sm & 0x10 && ((sl[w6(0xa17)] = rv[w6(0xd9d)](rw)), (rw += 0x2));
              sm & 0x20 && (sl[w6(0x78e)] = rv[w6(0x6d8)](rw++));
              sm & 0x40 && ro(sl);
              if (sm & 0x80) {
                if (sl[w6(0xa7b)])
                  (sl[w6(0xc7f)] = rv[w6(0xd9d)](rw)), (rw += 0x2);
                else {
                  const so = rn();
                  so > sl[w6(0xa96)] && iT(sl), (sl[w6(0xa96)] = so);
                }
              }
              sl[w6(0xa7b)] && sm & 0x4 && (sl[w6(0xc51)] = rn()),
                (sl["ox"] = sl["x"]),
                (sl["oy"] = sl["y"]),
                (sl[w6(0x813)] = sl[w6(0x694)]),
                (sl[w6(0x3c4)] = sl[w6(0xb98)]),
                (sl[w6(0xa09)] = sl[w6(0xbab)]),
                (sl[w6(0xbd1)] = 0x0);
            } else {
              const sp = rv[w6(0x6d8)](rw++);
              if (sp === cS[w6(0xc73)]) {
                let su = rv[w6(0x6d8)](rw++);
                const sv = {};
                (sv[w6(0x902)] = []), (sv["a"] = 0x1);
                const sw = sv;
                while (su--) {
                  const sx = rq(),
                    sy = rq();
                  sw[w6(0x902)][w6(0xaba)]([sx, sy]);
                }
                iM(sw), (pf = 0x1), iF[w6(0xaba)](sw);
                continue;
              }
              const sq = hM[sp],
                sr = rq(),
                ss = rq(),
                st = sp === cS[w6(0x66b)];
              if (sp === cS[w6(0xcc5)] || sp === cS[w6(0x4fc)] || st) {
                const sz = rv[w6(0xd9d)](rw);
                (rw += 0x2),
                  (sl = new lK(sp, sk, sr, ss, sz)),
                  st &&
                    ((sl[w6(0x1bf)] = !![]),
                    (sl[w6(0x4e8)] = rv[w6(0x6d8)](rw++) - 0x1));
              } else {
                if (sp === cS[w6(0xda0)]) {
                  const sA = rv[w6(0xd9d)](rw);
                  (rw += 0x2), (sl = new lN(sk, sr, ss, sA));
                } else {
                  const sB = eS(rv[w6(0x6d8)](rw++)),
                    sC = rv[w6(0xd9d)](rw);
                  rw += 0x2;
                  if (sp === cS[w6(0x764)]) {
                    const sD = rn(),
                      sE = rv[w6(0x6d8)](rw++);
                    (sl = new lT(sk, sr, ss, sB, sD, sE, sC)),
                      ro(sl),
                      (sl[w6(0xc7f)] = rv[w6(0xd9d)](rw)),
                      (rw += 0x2),
                      (sl[w6(0xb0b)] = rm()),
                      (sl[w6(0x1a6)] = rm()),
                      (sl[w6(0xc51)] = rn());
                    if (ix === sk) iy = sl;
                    else {
                      if (jy) {
                        const sF = pF();
                        (sF[w6(0xd4f)] = sl), px[w6(0xaba)](sF);
                      }
                    }
                  } else {
                    if (sq[w6(0x313)](w6(0x34f)))
                      sl = new lG(sk, sp, sr, ss, sB, sC);
                    else {
                      const sG = rn(),
                        sH = rv[w6(0x6d8)](rw++),
                        sI = sH >> 0x4,
                        sJ = sH & 0x1,
                        sK = sH & 0x2,
                        sL = rn();
                      (sl = new lG(sk, sp, sr, ss, sB, sC, sG)),
                        (sl[w6(0xd26)] = sI),
                        (sl[w6(0xd79)] = sJ),
                        (sl[w6(0x809)] = sK),
                        (sl[w6(0xa96)] = sL),
                        (sl[w6(0x2b0)] = hN[sI]);
                    }
                  }
                }
              }
              (iv[sk] = sl), iw[w6(0xaba)](sl);
            }
          }
          iy &&
            ((iU = iy["nx"]),
            (iV = iy["ny"]),
            (pO[w6(0xaf5)][w6(0xd72)] = ""),
            pQ(pO, iy["nx"], iy["ny"]));
          const rH = rv[w6(0xd9d)](rw);
          rw += 0x2;
          for (let sM = 0x0; sM < rH; sM++) {
            const sN = rv[w6(0xa6c)](rw);
            (rw += 0x4), iY(sN);
          }
          const rI = rv[w6(0x6d8)](rw++);
          for (let sO = 0x0; sO < rI; sO++) {
            const sP = rv[w6(0xa6c)](rw);
            rw += 0x4;
            const sQ = iv[sP];
            if (sQ) {
              (sQ[w6(0x54c)] = iy), mQ(sQ[w6(0x34f)]["id"], 0x1), iY(sP);
              if (!om[sQ[w6(0x34f)]["id"]]) om[sQ[w6(0x34f)]["id"]] = 0x0;
              om[sQ[w6(0x34f)]["id"]]++;
            }
          }
          const rJ = rv[w6(0x6d8)](rw++);
          for (let sR = 0x0; sR < rJ; sR++) {
            const sS = rv[w6(0x6d8)](rw++),
              sT = rn(),
              sU = iQ[sS];
            (sU[w6(0x5f2)] = sT), sT === 0x0 && (sU[w6(0x1ec)] = 0x0);
          }
          (iI = rv[w6(0xd9d)](rw)), (rw += 0x2);
          const rK = rv[w6(0xd9d)](rw);
          (rw += 0x2),
            iE[w6(0x4eb)](
              w6(0x4b4),
              kh(iI, w6(0x507)) + ",\x20" + kh(rK, w6(0x5fb))
            );
          const rL = Math[w6(0xbd3)](0xa, iI);
          if (iH) {
            const sV = rv[w6(0x6d8)](rw++),
              sW = sV >> 0x4,
              sX = sV & 0xf,
              sY = rv[w6(0x6d8)](rw++);
            for (let t0 = 0x0; t0 < sX; t0++) {
              const t1 = rv[w6(0x6d8)](rw++);
              (iG[t1][w6(0xc9e)] = rv[w6(0xa6c)](rw)), (rw += 0x4);
            }
            const sZ = [];
            for (let t2 = 0x0; t2 < sY; t2++) {
              sZ[w6(0xaba)](rv[w6(0x6d8)](rw++));
            }
            sZ[w6(0x266)](function (t3, t4) {
              return t4 - t3;
            });
            for (let t3 = 0x0; t3 < sY; t3++) {
              const t4 = sZ[t3];
              iG[t4]["el"][w6(0xcef)](), iG[w6(0xde9)](t4, 0x1);
            }
            for (let t5 = 0x0; t5 < sW; t5++) {
              rp();
            }
            iG[w6(0x266)](function (t6, t7) {
              const wi = w6;
              return t7[wi(0xc9e)] - t6[wi(0xc9e)];
            });
          } else {
            iG[w6(0x441)] = 0x0;
            for (let t6 = 0x0; t6 < rL; t6++) {
              rp();
            }
            iH = !![];
          }
          iL();
          const rM = rv[w6(0x6d8)](rw++);
          for (let t7 = 0x0; t7 < rM; t7++) {
            const t8 = rv[w6(0xd9d)](rw);
            (rw += 0x2), nF(eK[t8]);
          }
          const rN = rv[w6(0xd9d)](rw);
          rw += 0x2;
          for (let t9 = 0x0; t9 < rN; t9++) {
            const ta = rv[w6(0x6d8)](rw++),
              tb = ta >> 0x7,
              tc = ta & 0x7f;
            if (tc === cQ[w6(0xddc)]) {
              const tg = rv[w6(0x6d8)](rw++),
                th = rv[w6(0x6d8)](rw++) - 0x1;
              let ti = null,
                tj = 0x0;
              if (tb) {
                const tl = rv[w6(0xa6c)](rw);
                rw += 0x4;
                const tm = rm();
                (ti = tm || w6(0x911) + tl), (tj = rv[w6(0x6d8)](rw++));
              }
              const tk = j8[tg];
              n6(
                w6(0xddc),
                null,
                "⚡\x20" +
                  j7[tg] +
                  w6(0x8ed) +
                  (th < 0x0
                    ? w6(0x25c)
                    : th === 0x0
                    ? w6(0xa85)
                    : w6(0x4ae) + (th + 0x1) + "!"),
                tk
              );
              ti &&
                n5(w6(0xddc), [
                  [w6(0x737), "🏆"],
                  [tk, ti + w6(0xa3e)],
                  [hP[w6(0x8c2)], tj + w6(0x3a6)],
                  [tk, w6(0xc53)],
                ]);
              continue;
            }
            const td = rv[w6(0xa6c)](rw);
            rw += 0x4;
            const te = rm(),
              tf = te || w6(0x911) + td;
            if (tc === cQ[w6(0x6ac)]) {
              let tn = rm();
              oV[w6(0x515)] && (tn = fb(tn));
              if (jN(tn, td)) n6(td, tf, tn, td === ix ? n3["me"] : void 0x0);
              else td === ix && n6(-0x1, null, w6(0x9b7), n3[w6(0x334)]);
            } else {
              if (tc === cQ[w6(0x9f3)]) {
                const to = rv[w6(0xd9d)](rw);
                rw += 0x2;
                const tp = rv[w6(0xa6c)](rw);
                rw += 0x4;
                const tq = rv[w6(0xa6c)](rw);
                rw += 0x4;
                const tr = dC[to],
                  ts = hN[tr[w6(0xd26)]],
                  tt = hN[tr[w6(0xa8c)][w6(0xd26)]],
                  tu = tq === 0x0;
                if (tu)
                  n5(w6(0x9f3), [
                    [n3[w6(0x8a2)], tf, !![]],
                    [n3[w6(0x8a2)], w6(0x7e0)],
                    [
                      hQ[tr[w6(0xd26)]],
                      k9(tp) + "\x20" + ts + "\x20" + tr[w6(0x3ed)],
                    ],
                  ]);
                else {
                  const tv = hQ[tr[w6(0xa8c)][w6(0xd26)]];
                  n5(w6(0x9f3), [
                    [tv, "⭐"],
                    [tv, tf, !![]],
                    [tv, w6(0x761)],
                    [
                      tv,
                      k9(tq) +
                        "\x20" +
                        tt +
                        "\x20" +
                        tr[w6(0x3ed)] +
                        w6(0x839) +
                        k9(tp) +
                        "\x20" +
                        ts +
                        "\x20" +
                        tr[w6(0x3ed)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tw = rv[w6(0xd9d)](rw);
                rw += 0x2;
                const tx = eK[tw],
                  ty = hN[tx[w6(0xd26)]],
                  tz = tc === cQ[w6(0x77c)],
                  tA = hQ[tx[w6(0xd26)]];
                n5(w6(0x327), [
                  [
                    tA,
                    "" +
                      (tz ? w6(0x113) : "") +
                      jt(ty) +
                      "\x20" +
                      ty +
                      "\x20" +
                      tx[w6(0x3ed)] +
                      w6(0x9e6) +
                      js(tz) +
                      w6(0x4f3),
                  ],
                  [tA, tf + "!", !![]],
                ]);
              }
            }
          }
          const rO = rv[w6(0x6d8)](rw++),
            rP = rO & 0xf,
            rQ = rO >> 0x4;
          let rR = ![];
          rP !== j6["id"] &&
            (j6 && (j6[w6(0xc50)] = !![]),
            (rR = !![]),
            jd(rP),
            k8(pU, w6(0x7bd) + j9[rP] + w6(0x69b)));
          const rS = rv[w6(0x6d8)](rw++);
          if (rS > 0x0) {
            let tB = ![];
            for (let tC = 0x0; tC < rS; tC++) {
              const tD = rv[w6(0xd9d)](rw);
              rw += 0x2;
              const tE = rv[w6(0xd9d)](rw);
              (rw += 0x2), (j6[tD] = tE);
              if (tE > 0x0) {
                if (!j6[w6(0xda5)][tD]) {
                  tB = !![];
                  const tF = nF(eK[tD], !![]);
                  (tF[w6(0x16f)] = !![]),
                    (tF[w6(0xb8a)] = ![]),
                    tF[w6(0x30b)][w6(0xcef)](w6(0x1db)),
                    (tF[w6(0xbe4)] = nA(w6(0xcce))),
                    tF[w6(0x72b)](tF[w6(0xbe4)]),
                    (tF[w6(0x755)] = tD);
                  let tG = -0x1;
                  (tF["t"] = rR ? 0x1 : 0x0),
                    (tF[w6(0xc50)] = ![]),
                    (tF[w6(0xc36)] = 0x3e8),
                    (tF[w6(0x1b9)] = function () {
                      const wj = w6,
                        tH = tF["t"];
                      if (tH === tG) return;
                      tG = tH;
                      const tI = jf(Math[wj(0xbd3)](0x1, tH / 0.5)),
                        tJ = jf(
                          Math[wj(0x606)](
                            0x0,
                            Math[wj(0xbd3)]((tH - 0.5) / 0.5)
                          )
                        );
                      (tF[wj(0xaf5)][wj(0xa99)] =
                        wj(0xb65) + -0x168 * (0x1 - tJ) + wj(0x305) + tJ + ")"),
                        (tF[wj(0xaf5)][wj(0x6a2)] = -1.12 * (0x1 - tI) + "em");
                    }),
                    jb[w6(0xaba)](tF),
                    j6[w6(0x8e9)][w6(0x72b)](tF),
                    (j6[w6(0xda5)][tD] = tF);
                }
                oP(j6[w6(0xda5)][tD][w6(0xbe4)], tE);
              } else {
                const tH = j6[w6(0xda5)][tD];
                tH && ((tH[w6(0xc50)] = !![]), delete j6[w6(0xda5)][tD]),
                  delete j6[tD];
              }
            }
            tB &&
              [...j6[w6(0x8e9)][w6(0x806)]]
                [w6(0x266)]((tI, tJ) => {
                  const wk = w6;
                  return -nY(eK[tI[wk(0x755)]], eK[tJ[wk(0x755)]]);
                })
                [w6(0xd78)]((tI) => {
                  const wl = w6;
                  j6[wl(0x8e9)][wl(0x72b)](tI);
                });
          }
          (j6[w6(0xaf7)] = pz), (j6[w6(0xd2a)] = rQ);
          if (rQ !== cT[w6(0xae3)]) {
            (j6[w6(0x128)][w6(0xaf5)][w6(0xd72)] = ""),
              (j6[w6(0xb16)] = j6[w6(0x236)]),
              (j6[w6(0x76c)] = rn());
            if (j6[w6(0x544)] !== jJ) {
              const tI = jJ ? w6(0x5d6) : w6(0xcef);
              j6[w6(0x530)][w6(0x30b)][tI](w6(0x23a)),
                j6[w6(0x530)][w6(0x30b)][tI](w6(0x4b1)),
                j6[w6(0xd65)][w6(0x30b)][tI](w6(0xd8d)),
                (j6[w6(0x544)] = jJ);
            }
            switch (rQ) {
              case cT[w6(0xbcc)]:
                k8(j6[w6(0x566)], w6(0x53a));
                break;
              case cT[w6(0xddc)]:
                const tJ = rv[w6(0x6d8)](rw++) + 0x1;
                k8(j6[w6(0x566)], w6(0xae5) + tJ);
                break;
              case cT[w6(0x915)]:
                k8(j6[w6(0x566)], w6(0x304));
                break;
              case cT[w6(0x94c)]:
                k8(j6[w6(0x566)], w6(0x825));
                break;
              case cT[w6(0x2c9)]:
                k8(j6[w6(0x566)], w6(0x433));
                break;
            }
          } else j6[w6(0x128)][w6(0xaf5)][w6(0xd72)] = w6(0xae3);
          if (rv[w6(0x212)] - rw > 0x0) {
            iy &&
              (j0(qd),
              (qd[w6(0xa41)] = ![]),
              (pP[w6(0xaf5)][w6(0xd72)] = ""),
              (pO[w6(0xaf5)][w6(0xd72)] = w6(0xae3)),
              pQ(pP, iy["nx"], iy["ny"]));
            qe[w6(0x664)](), (iy = null), ju[w6(0x30b)][w6(0xcef)](w6(0x841));
            const tK = rv[w6(0xd9d)](rw) - 0x1;
            rw += 0x2;
            const tL = rv[w6(0xa6c)](rw);
            rw += 0x4;
            const tM = rv[w6(0xa6c)](rw);
            rw += 0x4;
            const tN = rv[w6(0xa6c)](rw);
            rw += 0x4;
            const tO = rv[w6(0xa6c)](rw);
            (rw += 0x4),
              k8(k3, ka(tM)),
              k8(k2, k9(tL)),
              k8(k4, k9(tN)),
              k8(k6, k9(tO));
            let tP = null;
            rv[w6(0x212)] - rw > 0x0 && ((tP = rv[w6(0xa6c)](rw)), (rw += 0x4));
            tP !== null
              ? (k8(k7, k9(tP)), (k7[w6(0x345)][w6(0xaf5)][w6(0xd72)] = ""))
              : (k7[w6(0x345)][w6(0xaf5)][w6(0xd72)] = w6(0xae3));
            if (tK === -0x1) k8(k5, w6(0x105));
            else {
              const tQ = eK[tK];
              k8(k5, hN[tQ[w6(0xd26)]] + "\x20" + tQ[w6(0x3ed)]);
            }
            on(), (om = {}), (kn[w6(0xaf5)][w6(0xd72)] = ""), hi();
          }
          break;
        default:
          console[w6(0x9b1)](w6(0x4c9) + rx);
      }
    }
    var k2 = document[uf(0x678)](uf(0x8e3)),
      k3 = document[uf(0x678)](uf(0xd5f)),
      k4 = document[uf(0x678)](uf(0x943)),
      k5 = document[uf(0x678)](uf(0x3fe)),
      k6 = document[uf(0x678)](uf(0x458)),
      k7 = document[uf(0x678)](uf(0x8db));
    function k8(rk, rl) {
      const wm = uf;
      rk[wm(0x4eb)](wm(0x4b4), rl);
    }
    function k9(rk) {
      const wn = uf;
      return rk[wn(0xc81)](wn(0x8c0));
    }
    function ka(rk, rl) {
      const wo = uf,
        rm = [
          Math[wo(0x508)](rk / (0x3e8 * 0x3c * 0x3c)),
          Math[wo(0x508)]((rk % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wo(0x508)]((rk % (0x3e8 * 0x3c)) / 0x3e8),
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
      [cS[uf(0xbef)]]: uf(0x4d2),
      [cS[uf(0xce5)]]: uf(0x385),
      [cS[uf(0x5ef)]]: uf(0x385),
      [cS[uf(0x905)]]: uf(0xbcb),
      [cS[uf(0xddf)]]: uf(0xbcb),
      [cS[uf(0x563)]]: uf(0x52b),
      [cS[uf(0x75f)]]: uf(0x52b),
      [cS[uf(0x3a4)]]: uf(0x9b4),
      [cS[uf(0xc8c)]]: uf(0xc82),
    };
    kb["0"] = uf(0x105);
    var kc = kb;
    for (let rk in cS) {
      const rl = cS[rk];
      if (kc[rl]) continue;
      const rm = kd(rk);
      kc[rl] = rm[uf(0xa27)](uf(0x3eb), uf(0x494));
    }
    function kd(rn) {
      const wp = uf,
        ro = rn[wp(0xa27)](/([A-Z])/g, wp(0x285)),
        rp = ro[wp(0x426)](0x0)[wp(0xa1a)]() + ro[wp(0x923)](0x1);
      return rp;
    }
    var ke = null,
      kf = !![];
    function kg() {
      const wq = uf;
      console[wq(0x9b1)](wq(0xc14)),
        hT(),
        ju[wq(0x30b)][wq(0xcef)](wq(0x841)),
        kf &&
          (kk[wq(0xaf5)][wq(0xd72)] === wq(0xae3)
            ? (clearTimeout(ke),
              kC[wq(0x30b)][wq(0x5d6)](wq(0x841)),
              (ke = setTimeout(function () {
                const wr = wq;
                kC[wr(0x30b)][wr(0xcef)](wr(0x841)),
                  (kk[wr(0xaf5)][wr(0xd72)] = ""),
                  kB[wr(0x94e)](ko),
                  (kn[wr(0xaf5)][wr(0xd72)] = km[wr(0xaf5)][wr(0xd72)] =
                    wr(0xae3)),
                  hi(),
                  hV(hU[wr(0x5e8)]);
              }, 0x1f4)))
            : (kC[wq(0x30b)][wq(0xcef)](wq(0x841)), hV(hU[wq(0x5e8)])));
    }
    function kh(rn, ro) {
      return rn + "\x20" + ro + (rn === 0x1 ? "" : "s");
    }
    var ki = document[uf(0x546)](uf(0xc98)),
      kj = ki[uf(0x308)]("2d"),
      kk = document[uf(0x678)](uf(0x36a)),
      kl = document[uf(0x678)](uf(0xdc3)),
      km = document[uf(0x678)](uf(0x8af));
    km[uf(0xaf5)][uf(0xd72)] = uf(0xae3);
    var kn = document[uf(0x678)](uf(0xb58));
    kn[uf(0xaf5)][uf(0xd72)] = uf(0xae3);
    var ko = document[uf(0x678)](uf(0x9f1)),
      kp = document[uf(0x678)](uf(0x379)),
      kq = document[uf(0x678)](uf(0x2de));
    function kr() {
      const ws = uf;
      kq[ws(0x2d7)] = "";
      for (let rn = 0x0; rn < 0x32; rn++) {
        const ro = ks[rn],
          rp = nA(ws(0x1f0) + rn + ws(0x5cb)),
          rq = rp[ws(0x678)](ws(0x4ea));
        if (ro)
          for (let rr = 0x0; rr < ro[ws(0x441)]; rr++) {
            const rs = ro[rr],
              rt = dF[rs];
            if (!rt) rq[ws(0x72b)](nA(ws(0xd01)));
            else {
              const ru = nA(
                ws(0x572) + rt[ws(0xd26)] + "\x22\x20" + qk(rt) + ws(0x3e3)
              );
              (ru[ws(0x34f)] = rt),
                (ru[ws(0xdd2)] = kp),
                jY(ru),
                rq[ws(0x72b)](ru);
            }
          }
        else rq[ws(0x2d7)] = ws(0xd01)[ws(0x188)](0x5);
        (rp[ws(0x678)](ws(0xa87))[ws(0x108)] = function () {
          ku(rn);
        }),
          (rp[ws(0x678)](ws(0x163))[ws(0x108)] = function () {
            kx(rn);
          }),
          kq[ws(0x72b)](rp);
      }
    }
    var ks = kt();
    function kt() {
      const wt = uf;
      try {
        const rn = JSON[wt(0x21e)](hD[wt(0x683)]);
        for (const ro in rn) {
          !Array[wt(0xdb8)](rn[ro]) && delete rn[ro];
        }
        return rn;
      } catch {
        return {};
      }
    }
    function ku(rn) {
      const wu = uf,
        ro = [],
        rp = nk[wu(0x3f7)](wu(0x221));
      for (let rq = 0x0; rq < rp[wu(0x441)]; rq++) {
        const rr = rp[rq],
          rs = rr[wu(0x806)][0x0];
        !rs ? (ro[rq] = null) : (ro[rq] = rs[wu(0x34f)][wu(0x56f)]);
      }
      (ks[rn] = ro),
        (hD[wu(0x683)] = JSON[wu(0xa8a)](ks)),
        kr(),
        hc(wu(0x323) + rn + "!");
    }
    function kv() {
      const wv = uf;
      return nk[wv(0x3f7)](wv(0x221));
    }
    document[uf(0x678)](uf(0x3e6))[uf(0x108)] = function () {
      kw();
    };
    function kw() {
      const ww = uf,
        rn = kv();
      for (const ro of rn) {
        const rp = ro[ww(0x806)][0x0];
        if (!rp) continue;
        rp[ww(0xcef)](),
          iR[ww(0xaba)](rp[ww(0x8fc)]),
          mQ(rp[ww(0x34f)]["id"], 0x1),
          il(new Uint8Array([cI[ww(0x320)], ro[ww(0x235)]]));
      }
    }
    function kx(rn) {
      const wx = uf;
      if (mt || ms[wx(0x441)] > 0x0) return;
      const ro = ks[rn];
      if (!ro) return;
      kw();
      const rp = kv(),
        rq = Math[wx(0xbd3)](rp[wx(0x441)], ro[wx(0x441)]);
      for (let rr = 0x0; rr < rq; rr++) {
        const rs = ro[rr],
          rt = dF[rs];
        if (!rt || !iS[rt["id"]]) continue;
        const ru = nA(
          wx(0x572) + rt[wx(0xd26)] + "\x22\x20" + qk(rt) + wx(0x3e3)
        );
        (ru[wx(0x34f)] = rt),
          (ru[wx(0x573)] = !![]),
          (ru[wx(0x8fc)] = iR[wx(0xc19)]()),
          nz(ru, rt),
          (iQ[ru[wx(0x8fc)]] = ru),
          rp[rr][wx(0x72b)](ru),
          mQ(ru[wx(0x34f)]["id"], -0x1);
        const rv = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rv[wx(0x969)](0x0, cI[wx(0x471)]),
          rv[wx(0x2f7)](0x1, ru[wx(0x34f)]["id"]),
          rv[wx(0x969)](0x3, rr),
          il(rv);
      }
      hc(wx(0x2ec) + rn + "!");
    }
    var ky = document[uf(0x678)](uf(0x84d)),
      kz = document[uf(0x678)](uf(0x7eb));
    kz[uf(0x108)] = function () {
      const wy = uf;
      kC[wy(0x30b)][wy(0x5d6)](wy(0x841)),
        jy
          ? (ke = setTimeout(function () {
              const wz = wy;
              il(new Uint8Array([cI[wz(0x182)]]));
            }, 0x1f4))
          : (ke = setTimeout(function () {
              const wA = wy;
              kC[wA(0x30b)][wA(0xcef)](wA(0x841)),
                (km[wA(0xaf5)][wA(0xd72)] = kn[wA(0xaf5)][wA(0xd72)] =
                  wA(0xae3)),
                (kk[wA(0xaf5)][wA(0xd72)] = ""),
                kB[wA(0x94e)](ko),
                kB[wA(0x30b)][wA(0x5d6)](wA(0x841)),
                jg();
            }, 0x1f4));
    };
    var kA = document[uf(0x678)](uf(0x21b)),
      kB = document[uf(0x678)](uf(0x82f));
    kB[uf(0x30b)][uf(0x5d6)](uf(0x841));
    var kC = document[uf(0x678)](uf(0x282)),
      kD = document[uf(0x678)](uf(0x7ce)),
      kE = document[uf(0x678)](uf(0x929));
    (kE[uf(0xcb7)] = hD[uf(0x522)] || ""),
      (kE[uf(0x7ca)] = cK),
      (kE[uf(0xc27)] = function () {
        const wB = uf;
        hD[wB(0x522)] = this[wB(0xcb7)];
      });
    var kF;
    kD[uf(0x108)] = function () {
      if (!hW) return;
      kG();
    };
    function kG(rn = ![]) {
      const wC = uf;
      hack.chatFunc = hK;
      hack.toastFunc = hc;
      hack.onload();
      hack.moblst = eO;
      if (kk[wC(0xaf5)][wC(0xd72)] === wC(0xae3)) {
        kC[wC(0x30b)][wC(0xcef)](wC(0x841));
        return;
      }
      clearTimeout(kF),
        kB[wC(0x30b)][wC(0xcef)](wC(0x841)),
        (kF = setTimeout(() => {
          const wD = wC;
          kC[wD(0x30b)][wD(0x5d6)](wD(0x841)),
            (kF = setTimeout(() => {
              const wE = wD;
              rn && kC[wE(0x30b)][wE(0xcef)](wE(0x841)),
                (kk[wE(0xaf5)][wE(0xd72)] = wE(0xae3)),
                (hg[wE(0xaf5)][wE(0xd72)] = wE(0xae3)),
                (km[wE(0xaf5)][wE(0xd72)] = ""),
                km[wE(0x72b)](ko),
                iq(kE[wE(0xcb7)][wE(0x923)](0x0, cK));
            }, 0x1f4));
        }, 0x64));
    }
    var kH = document[uf(0x678)](uf(0x56e));
    function kI(rn, ro, rp) {
      const wF = uf,
        rq = {};
      (rq[wF(0x8a5)] = wF(0x4c6)), (rq[wF(0x76e)] = !![]), (rp = rp || rq);
      const rr = nA(
        wF(0xaa8) +
          rp[wF(0x8a5)] +
          wF(0x506) +
          rn +
          wF(0xb54) +
          (rp[wF(0x76e)] ? wF(0xa70) : "") +
          wF(0x897)
      );
      return (
        (rr[wF(0x678)](wF(0xc9b))[wF(0x108)] = function () {
          const wG = wF;
          ro(!![]), rr[wG(0xcef)]();
        }),
        (rr[wF(0x678)](wF(0xb1e))[wF(0x108)] = function () {
          const wH = wF;
          rr[wH(0xcef)](), ro(![]);
        }),
        kH[wF(0x72b)](rr),
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
            wI(0xd21),
            wI(0x61a),
            wI(0x888),
            wI(0x539),
            wI(0x415),
            wI(0x71a),
            wI(0x620),
            wI(0x86b),
            wI(0xa8d),
            wI(0x1d3),
            wI(0xb99),
            wI(0x3c1),
            wI(0xa9f),
            wI(0x91a),
            wI(0x800),
            wI(0x516),
            wI(0x4f5),
            wI(0xa64),
            wI(0xd17),
            wI(0x8d9),
            wI(0x713),
            wI(0xa84),
            wI(0x2e5),
            wI(0x593),
            wI(0xbfb),
            wI(0x34f),
            wI(0x65d),
            wI(0x4fe),
            wI(0x2ab),
            wI(0xaac),
            wI(0xd6b),
            wI(0x5a5),
            wI(0x10f),
            wI(0xb9d),
            wI(0x8d5),
            wI(0x30e),
            wI(0x78f),
            wI(0x22a),
            wI(0x592),
            wI(0x9ba),
            wI(0x797),
            wI(0x81b),
            wI(0xaaa),
            wI(0xcae),
            wI(0xc32),
            wI(0x460),
            wI(0x591),
            wI(0x744),
            wI(0x5a7),
            wI(0x7e7),
            wI(0xb0f),
            wI(0xdd9),
            wI(0x9b8),
            wI(0xa34),
            wI(0x80e),
            wI(0x989),
            wI(0x4bb),
            wI(0xcaf),
            wI(0xd34),
            wI(0xa75),
            wI(0x2e2),
            wI(0xb7a),
            wI(0xce7),
            wI(0x140),
            wI(0xd50),
            wI(0x2d4),
            wI(0x9a6),
            wI(0x8a0),
            wI(0x38c),
            wI(0x7b0),
            wI(0x940),
            wI(0x114),
            wI(0xad5),
            wI(0xccc),
            wI(0x770),
            wI(0x906),
            wI(0x6dd),
            wI(0x73a),
            wI(0x5e6),
            wI(0x254),
            wI(0x56a),
            wI(0xdae),
            wI(0x4d3),
            wI(0x130),
            wI(0xd92),
            wI(0xac7),
            wI(0x36f),
            wI(0x6e9),
            wI(0x466),
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
            else rz[wJ(0xaba)](rz[wJ(0x173)]());
          } catch (rE) {
            rz[wJ(0xaba)](rz[wJ(0x173)]());
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
    var kK = document[uf(0x678)](uf(0x310)),
      kL = (function () {
        const wL = uf;
        let rn = ![];
        return (
          (function (ro) {
            const wK = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                wK(0x5d0)
              ](ro) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                wK(0x5d0)
              ](ro[wK(0x179)](0x0, 0x4))
            )
              rn = !![];
          })(navigator[wL(0xa24)] || navigator[wL(0xd4b)] || window[wL(0xa45)]),
          rn
        );
      })(),
      kM =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          uf(0x5d0)
        ](navigator[uf(0xa24)][uf(0xbe2)]()),
      kN = 0x514,
      kO = 0x28a,
      kP = 0x1,
      kQ = [km, kk, kn, kl, kH, hg],
      kR = 0x1,
      kS = 0x1;
    function kT() {
      const wM = uf;
      (kS = Math[wM(0x606)](ki[wM(0xc8b)] / d0, ki[wM(0x48d)] / d1)),
        (kR =
          Math[oV[wM(0x5db)] ? wM(0xbd3) : wM(0x606)](kU() / kN, kV() / kO) *
          (kL && !kM ? 1.1 : 0x1)),
        (kR *= kP);
      for (let rn = 0x0; rn < kQ[wM(0x441)]; rn++) {
        const ro = kQ[rn];
        let rp = kR * (ro[wM(0x359)] || 0x1);
        (ro[wM(0xaf5)][wM(0xa99)] = wM(0x1fa) + rp + ")"),
          (ro[wM(0xaf5)][wM(0x200)] = wM(0x3e4)),
          (ro[wM(0xaf5)][wM(0xc8b)] = kU() / rp + "px"),
          (ro[wM(0xaf5)][wM(0x48d)] = kV() / rp + "px");
      }
    }
    function kU() {
      const wN = uf;
      return document[wN(0xcfc)][wN(0x367)];
    }
    function kV() {
      const wO = uf;
      return document[wO(0xcfc)][wO(0x3fc)];
    }
    var kW = 0x1;
    function kX() {
      const wP = uf;
      (kW = oV[wP(0xb84)] ? 0.65 : window[wP(0x27d)]),
        (ki[wP(0xc8b)] = kU() * kW),
        (ki[wP(0x48d)] = kV() * kW),
        kT();
      for (let rn = 0x0; rn < ms[wP(0x441)]; rn++) {
        ms[rn][wP(0xbfc)]();
      }
    }
    window[uf(0x9ac)] = function () {
      kX(), qs();
    };
    var kY = (function () {
        const wQ = uf,
          rn = 0x23,
          ro = rn / 0x2,
          rp = document[wQ(0x6a4)](wQ(0xc98));
        rp[wQ(0xc8b)] = rp[wQ(0x48d)] = rn;
        const rq = rp[wQ(0x308)]("2d");
        return (
          (rq[wQ(0x4b9)] = wQ(0x9a3)),
          rq[wQ(0x7f5)](),
          rq[wQ(0x269)](0x0, ro),
          rq[wQ(0x83f)](rn, ro),
          rq[wQ(0x269)](ro, 0x0),
          rq[wQ(0x83f)](ro, rn),
          rq[wQ(0x4b4)](),
          rq[wQ(0xad6)](rp, wQ(0x188))
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
      const rq = Math[wR(0x3a8)](rn),
        rr = Math[wR(0xb1f)](rn),
        rs = rq * 0x28,
        rt = rr * 0x28;
      l1[wR(0xaba)]({
        dir: ro,
        start: [rs, rt],
        curve: [
          rs + rq * 0x17 + -rr * ro * rp,
          rt + rr * 0x17 + rq * ro * rp,
          rs + rq * 0x2e,
          rt + rr * 0x2e,
        ],
        side: Math[wR(0xa35)](rn),
      });
    }
    var l3 = l4();
    function l4() {
      const wS = uf,
        rn = new Path2D(),
        ro = Math["PI"] / 0x5;
      return (
        rn[wS(0x5b3)](0x0, 0x0, 0x28, ro, l0 - ro),
        rn[wS(0x9d9)](
          0x12,
          0x0,
          Math[wS(0x3a8)](ro) * 0x28,
          Math[wS(0xb1f)](ro) * 0x28
        ),
        rn[wS(0x326)](),
        rn
      );
    }
    var l5 = l6();
    function l6() {
      const wT = uf,
        rn = new Path2D();
      return (
        rn[wT(0x269)](-0x28, 0x5),
        rn[wT(0x34a)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rn[wT(0x83f)](0x28, -0x5),
        rn[wT(0x34a)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rn[wT(0x326)](),
        rn
      );
    }
    function l7(rn, ro = 0x1, rp = 0x0) {
      const wU = uf,
        rq = new Path2D();
      for (let rr = 0x0; rr < rn; rr++) {
        const rs = (Math["PI"] * 0x2 * rr) / rn + rp;
        rq[wU(0x83f)](
          Math[wU(0x3a8)](rs) - Math[wU(0xb1f)](rs) * 0.1 * ro,
          Math[wU(0xb1f)](rs)
        );
      }
      return rq[wU(0x326)](), rq;
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
          rn[wV(0x83f)](Math[wV(0x3a8)](rp) * rq, Math[wV(0xb1f)](rp) * rq);
        }
        return rn[wV(0x326)](), rn;
      })(),
      petalCotton: la(0x9, 0x1, 0.5, 1.6),
      petalWeb: la(0x5, 0x1, 0.5, 0.7),
      petalCactus: la(0x8, 0x1, 0.5, 0.7),
      petalSand: l7(0x6, 0x0, 0.2),
    };
    function l9(rn, ro, rp, rq, rr) {
      const wW = uf;
      (rn[wW(0x4b9)] = rr),
        (rn[wW(0x659)] = rp),
        rn[wW(0x64c)](),
        (ro *= 0.45),
        rn[wW(0x90b)](ro),
        rn[wW(0x8e8)](-0x14, 0x0),
        rn[wW(0x7f5)](),
        rn[wW(0x269)](0x0, 0x26),
        rn[wW(0x83f)](0x50, 0x7),
        rn[wW(0x83f)](0x50, -0x7),
        rn[wW(0x83f)](0x0, -0x26),
        rn[wW(0x83f)](-0x14, -0x1e),
        rn[wW(0x83f)](-0x14, 0x1e),
        rn[wW(0x326)](),
        (rp = rp / ro),
        (rn[wW(0x659)] = 0x64 + rp),
        (rn[wW(0x4b9)] = rr),
        rn[wW(0x4b4)](),
        (rn[wW(0x4b9)] = rn[wW(0x9f0)] = rq),
        (rn[wW(0x659)] -= rp * 0x2),
        rn[wW(0x4b4)](),
        rn[wW(0x8ab)](),
        rn[wW(0x6c7)]();
    }
    function la(rn, ro, rp, rq) {
      const wX = uf,
        rr = new Path2D();
      return lb(rr, rn, ro, rp, rq), rr[wX(0x326)](), rr;
    }
    function lb(rn, ro, rp, rq, rr) {
      const wY = uf;
      rn[wY(0x269)](rp, 0x0);
      for (let rs = 0x1; rs <= ro; rs++) {
        const rt = (Math["PI"] * 0x2 * (rs - rq)) / ro,
          ru = (Math["PI"] * 0x2 * rs) / ro;
        rn[wY(0x9d9)](
          Math[wY(0x3a8)](rt) * rp * rr,
          Math[wY(0xb1f)](rt) * rp * rr,
          Math[wY(0x3a8)](ru) * rp,
          Math[wY(0xb1f)](ru) * rp
        );
      }
    }
    var lc = (function () {
        const wZ = uf,
          rn = new Path2D();
        rn[wZ(0x269)](0x3c, 0x0);
        const ro = 0x6;
        for (let rp = 0x0; rp < ro; rp++) {
          const rq = ((rp + 0.5) / ro) * Math["PI"] * 0x2,
            rr = ((rp + 0x1) / ro) * Math["PI"] * 0x2;
          rn[wZ(0x9d9)](
            Math[wZ(0x3a8)](rq) * 0x78,
            Math[wZ(0xb1f)](rq) * 0x78,
            Math[wZ(0x3a8)](rr) * 0x3c,
            Math[wZ(0xb1f)](rr) * 0x3c
          );
        }
        return rn[wZ(0x326)](), rn;
      })(),
      ld = (function () {
        const x0 = uf,
          rn = new Path2D(),
          ro = 0x6;
        for (let rp = 0x0; rp < ro; rp++) {
          const rq = ((rp + 0.5) / ro) * Math["PI"] * 0x2;
          rn[x0(0x269)](0x0, 0x0), rn[x0(0x83f)](...le(0x37, 0x0, rq));
          for (let rr = 0x0; rr < 0x2; rr++) {
            const rs = (rr / 0x2) * 0x1e + 0x14,
              rt = 0xa - rr * 0x2;
            rn[x0(0x269)](...le(rs + rt, -rt, rq)),
              rn[x0(0x83f)](...le(rs, 0x0, rq)),
              rn[x0(0x83f)](...le(rs + rt, rt, rq));
          }
        }
        return rn;
      })();
    function le(rn, ro, rp) {
      const x1 = uf,
        rq = Math[x1(0xb1f)](rp),
        rr = Math[x1(0x3a8)](rp);
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
          ry = Math[x2(0xc28)](rx * 0xff)[x2(0x2b9)](0x10);
        return ry[x2(0x441)] === 0x1 ? "0" + ry : ry;
      };
      return "#" + rt(rq) + rt(rr) + rt(rs);
    }
    var lg = [];
    for (let rn = 0x0; rn < 0xa; rn++) {
      const ro = 0x1 - rn / 0xa;
      lg[uf(0xaba)](lf(0x28 + ro * 0xc8, 0x50, 0x3c * ro));
    }
    var lh = [uf(0x549), uf(0x1c9)],
      li = lh[0x0],
      lj = [uf(0xb94), uf(0xa95), uf(0xb48), uf(0x5b8)];
    function lk(rp = uf(0x2ae)) {
      const x3 = uf,
        rq = [];
      for (let rr = 0x0; rr < 0x5; rr++) {
        rq[x3(0xaba)](pJ(rp, 0.8 - (rr / 0x5) * 0.25));
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
          body: uf(0x2ae),
          wing: uf(0x4a2),
          tail_outline: uf(0x670),
          bone_outline: uf(0x55f),
          bone: uf(0x670),
          tail: lk(),
        },
      },
      lm = new Path2D(uf(0xd29)),
      ln = new Path2D(uf(0x9ef)),
      lo = [];
    for (let rp = 0x0; rp < 0x3; rp++) {
      lo[uf(0xaba)](pJ(lh[0x0], 0x1 - (rp / 0x3) * 0.2));
    }
    function lp(rq = Math[uf(0x9e1)]()) {
      return function () {
        return (rq = (rq * 0x2455 + 0xc091) % 0x38f40), rq / 0x38f40;
      };
    }
    const lq = {
      [cS[uf(0xb61)]]: [uf(0x1c6), uf(0xccb)],
      [cS[uf(0x651)]]: [uf(0x2ae), uf(0xc99)],
      [cS[uf(0xcf5)]]: [uf(0x132), uf(0x9d4)],
    };
    var lr = lq;
    const ls = {};
    (ls[uf(0x3ab)] = !![]),
      (ls[uf(0x120)] = !![]),
      (ls[uf(0x654)] = !![]),
      (ls[uf(0xb1d)] = !![]),
      (ls[uf(0x703)] = !![]),
      (ls[uf(0xcf6)] = !![]),
      (ls[uf(0x4ab)] = !![]);
    var lt = ls;
    const lu = {};
    (lu[uf(0x30c)] = !![]),
      (lu[uf(0x39b)] = !![]),
      (lu[uf(0x78a)] = !![]),
      (lu[uf(0x5ed)] = !![]),
      (lu[uf(0x710)] = !![]),
      (lu[uf(0xb4f)] = !![]),
      (lu[uf(0x180)] = !![]);
    var lv = lu;
    const lw = {};
    (lw[uf(0x78a)] = !![]),
      (lw[uf(0x5ed)] = !![]),
      (lw[uf(0x710)] = !![]),
      (lw[uf(0xb4f)] = !![]);
    var lx = lw;
    const ly = {};
    (ly[uf(0x39b)] = !![]), (ly[uf(0x53d)] = !![]), (ly[uf(0xb1d)] = !![]);
    var lz = ly;
    const lA = {};
    (lA[uf(0x4e9)] = !![]), (lA[uf(0xc8c)] = !![]), (lA[uf(0x948)] = !![]);
    var lB = lA;
    const lC = {};
    (lC[uf(0x601)] = !![]),
      (lC[uf(0x3a4)] = !![]),
      (lC[uf(0x68b)] = !![]),
      (lC[uf(0x63e)] = !![]),
      (lC[uf(0xa65)] = !![]);
    var lD = lC;
    function lE(rq, rr) {
      const x4 = uf;
      rq[x4(0x7f5)](), rq[x4(0x269)](rr, 0x0);
      for (let rs = 0x0; rs < 0x6; rs++) {
        const rt = (rs / 0x6) * Math["PI"] * 0x2;
        rq[x4(0x83f)](Math[x4(0x3a8)](rt) * rr, Math[x4(0xb1f)](rt) * rr);
      }
      rq[x4(0x326)]();
    }
    function lF(rq, rr, rs, rt, ru) {
      const x5 = uf;
      rq[x5(0x7f5)](),
        rq[x5(0x269)](0x9, -0x5),
        rq[x5(0x34a)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rq[x5(0x9d9)](0xd, 0x0, 0x9, -0x5),
        rq[x5(0x326)](),
        (rq[x5(0x60f)] = rq[x5(0x5e0)] = x5(0xc28)),
        (rq[x5(0x4b9)] = rt),
        (rq[x5(0x659)] = rr),
        rq[x5(0x4b4)](),
        (rq[x5(0x659)] -= ru),
        (rq[x5(0x9f0)] = rq[x5(0x4b9)] = rs),
        rq[x5(0x8ab)](),
        rq[x5(0x4b4)]();
    }
    var lG = class {
        constructor(rq = -0x1, rr, rs, rt, ru, rv = 0x7, rw = -0x1) {
          const x6 = uf;
          (this["id"] = rq),
            (this[x6(0x5a0)] = rr),
            (this[x6(0xb6b)] = hM[rr]),
            (this[x6(0x6ed)] = this[x6(0xb6b)][x6(0x313)](x6(0x34f))),
            (this["x"] = this["nx"] = this["ox"] = rs),
            (this["y"] = this["ny"] = this["oy"] = rt),
            (this[x6(0x694)] = this[x6(0x214)] = this[x6(0x813)] = ru),
            (this[x6(0xbfa)] =
              this[x6(0xb98)] =
              this[x6(0xa4f)] =
              this[x6(0x3c4)] =
                rw),
            (this[x6(0x45b)] = 0x0),
            (this[x6(0xbab)] = this[x6(0xa17)] = this[x6(0xa09)] = rv),
            (this[x6(0xbd1)] = 0x0),
            (this[x6(0x427)] = ![]),
            (this[x6(0x106)] = 0x0),
            (this[x6(0x2c4)] = 0x0),
            (this[x6(0x945)] = this[x6(0xb6b)][x6(0x351)](x6(0x597)) > -0x1),
            (this[x6(0x365)] = this[x6(0x945)] ? this[x6(0xb98)] < 0x1 : 0x1),
            (this[x6(0xd79)] = ![]),
            (this[x6(0xa96)] = 0x0),
            (this[x6(0x886)] = 0x0),
            (this[x6(0xaf0)] = 0x0),
            (this[x6(0x3b1)] = 0x1),
            (this[x6(0xd9a)] = 0x0),
            (this[x6(0x318)] = [cS[x6(0x6c9)], cS[x6(0x898)], cS[x6(0x764)]][
              x6(0x60a)
            ](this[x6(0x5a0)])),
            (this[x6(0x2fd)] = lv[this[x6(0xb6b)]]),
            (this[x6(0xc1c)] = lx[this[x6(0xb6b)]] ? 0x32 / 0xc8 : 0x0),
            (this[x6(0xaea)] = lt[this[x6(0xb6b)]]),
            (this[x6(0xa9a)] = 0x0),
            (this[x6(0xd46)] = 0x0),
            (this[x6(0xb32)] = ![]),
            (this[x6(0x381)] = 0x0),
            (this[x6(0xbd0)] = !![]),
            (this[x6(0x19d)] = 0x2),
            (this[x6(0x3f0)] = 0x0),
            (this[x6(0x3b9)] = lD[this[x6(0xb6b)]]),
            (this[x6(0xca4)] = lz[this[x6(0xb6b)]]),
            (this[x6(0xa6a)] = lB[this[x6(0xb6b)]]);
        }
        [uf(0x1b9)]() {
          const x7 = uf;
          this[x7(0x427)] && (this[x7(0x106)] += pA / 0xc8);
          (this[x7(0xd46)] += ((this[x7(0xb32)] ? 0x1 : -0x1) * pA) / 0xc8),
            (this[x7(0xd46)] = Math[x7(0xbd3)](
              0x1,
              Math[x7(0x606)](0x0, this[x7(0xd46)])
            )),
            (this[x7(0xaf0)] = pg(
              this[x7(0xaf0)],
              this[x7(0x886)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[x7(0x886)] = pg(this[x7(0x886)], this[x7(0xa96)], 0x64));
          this[x7(0x2c4)] > 0x0 &&
            ((this[x7(0x2c4)] -= pA / 0x96),
            this[x7(0x2c4)] < 0x0 && (this[x7(0x2c4)] = 0x0));
          (this[x7(0xbd1)] += pA / 0x64),
            (this["t"] = Math[x7(0xbd3)](0x1, this[x7(0xbd1)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[x7(0xb98)] =
              this[x7(0x3c4)] +
              (this[x7(0xa4f)] - this[x7(0x3c4)]) * this["t"]),
            (this[x7(0xbab)] =
              this[x7(0xa09)] +
              (this[x7(0xa17)] - this[x7(0xa09)]) * this["t"]);
          if (this[x7(0x318)]) {
            const rq = Math[x7(0xbd3)](0x1, pA / 0x64);
            (this[x7(0x3b1)] +=
              (Math[x7(0x3a8)](this[x7(0x214)]) - this[x7(0x3b1)]) * rq),
              (this[x7(0xd9a)] +=
                (Math[x7(0xb1f)](this[x7(0x214)]) - this[x7(0xd9a)]) * rq);
          }
          (this[x7(0x694)] = f8(this[x7(0x813)], this[x7(0x214)], this["t"])),
            (this[x7(0x381)] +=
              ((Math[x7(0x5d7)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pA) /
              0x12),
            this[x7(0x45b)] > 0x0 &&
              ((this[x7(0x45b)] -= pA / 0x258),
              this[x7(0x45b)] < 0x0 && (this[x7(0x45b)] = 0x0)),
            this[x7(0xa6a)] &&
              ((this[x7(0x19d)] += pA / 0x5dc),
              this[x7(0x19d)] > 0x1 && (this[x7(0x19d)] = 0x1),
              (this[x7(0xbd0)] = this[x7(0x19d)] < 0x1)),
            this[x7(0xb98)] < 0x1 &&
              (this[x7(0x365)] = pg(this[x7(0x365)], 0x1, 0xc8)),
            this[x7(0x45b)] === 0x0 &&
              (this[x7(0xbfa)] +=
                (this[x7(0xb98)] - this[x7(0xbfa)]) *
                Math[x7(0xbd3)](0x1, pA / 0xc8));
        }
        [uf(0x1f6)](rq, rr = ![]) {
          const x8 = uf,
            rs = this[x8(0xbab)] / 0x19;
          rq[x8(0x90b)](rs),
            rq[x8(0x8e8)](0x5, 0x0),
            (rq[x8(0x659)] = 0x5),
            (rq[x8(0x5e0)] = rq[x8(0x60f)] = x8(0xc28)),
            (rq[x8(0x4b9)] = rq[x8(0x9f0)] = this[x8(0x219)](x8(0xdb3)));
          rr &&
            (rq[x8(0x64c)](),
            rq[x8(0x8e8)](0x3, 0x0),
            rq[x8(0x7f5)](),
            rq[x8(0x269)](-0xa, 0x0),
            rq[x8(0x83f)](-0x28, -0xf),
            rq[x8(0x9d9)](-0x21, 0x0, -0x28, 0xf),
            rq[x8(0x326)](),
            rq[x8(0x6c7)](),
            rq[x8(0x4b4)](),
            rq[x8(0x8ab)]());
          rq[x8(0x7f5)](), rq[x8(0x269)](0x0, 0x1e);
          const rt = 0x1c,
            ru = 0x24,
            rv = 0x5;
          rq[x8(0x269)](0x0, rt);
          for (let rw = 0x0; rw < rv; rw++) {
            const rx = ((((rw + 0.5) / rv) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              ry = ((((rw + 0x1) / rv) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rq[x8(0x9d9)](
              Math[x8(0x3a8)](rx) * ru * 0.85,
              -Math[x8(0xb1f)](rx) * ru,
              Math[x8(0x3a8)](ry) * rt * 0.7,
              -Math[x8(0xb1f)](ry) * rt
            );
          }
          rq[x8(0x83f)](-0x1c, -0x9),
            rq[x8(0x9d9)](-0x26, 0x0, -0x1c, 0x9),
            rq[x8(0x83f)](0x0, rt),
            rq[x8(0x326)](),
            (rq[x8(0x9f0)] = this[x8(0x219)](x8(0xbb5))),
            rq[x8(0x8ab)](),
            rq[x8(0x4b4)](),
            rq[x8(0x7f5)]();
          for (let rz = 0x0; rz < 0x4; rz++) {
            const rA = (((rz / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rB = -0x1e + Math[x8(0x3a8)](rA) * 0xd,
              rC = Math[x8(0xb1f)](rA) * 0xb;
            rq[x8(0x269)](rB, rC),
              rq[x8(0x83f)](
                rB + Math[x8(0x3a8)](rA) * 0x1b,
                rC + Math[x8(0xb1f)](rA) * 0x1b
              );
          }
          (rq[x8(0x659)] = 0x4), rq[x8(0x4b4)]();
        }
        [uf(0x23e)](rq, rr = uf(0xb2f), rs = 0x0) {
          const x9 = uf;
          for (let rt = 0x0; rt < l1[x9(0x441)]; rt++) {
            const ru = l1[rt];
            rq[x9(0x64c)](),
              rq[x9(0x174)](
                ru[x9(0x152)] * Math[x9(0xb1f)](this[x9(0x381)] + rt) * 0.15 +
                  rs * ru[x9(0xd88)]
              ),
              rq[x9(0x7f5)](),
              rq[x9(0x269)](...ru[x9(0x1b2)]),
              rq[x9(0x9d9)](...ru[x9(0x6b3)]),
              (rq[x9(0x4b9)] = this[x9(0x219)](rr)),
              (rq[x9(0x659)] = 0x8),
              (rq[x9(0x5e0)] = x9(0xc28)),
              rq[x9(0x4b4)](),
              rq[x9(0x6c7)]();
          }
        }
        [uf(0x718)](rq) {
          const xa = uf;
          rq[xa(0x7f5)]();
          let rr = 0x0,
            rs = 0x0,
            rt,
            ru;
          const rv = 0x14;
          for (let rw = 0x0; rw < rv; rw++) {
            const rx = (rw / rv) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              ry = ((rw + 0x1) / rv) * 0x28;
            (rt = Math[xa(0x3a8)](rx) * ry), (ru = Math[xa(0xb1f)](rx) * ry);
            const rz = rr + rt,
              rA = rs + ru;
            rq[xa(0x9d9)](
              (rr + rz) * 0.5 + ru * 0.15,
              (rs + rA) * 0.5 - rt * 0.15,
              rz,
              rA
            ),
              (rr = rz),
              (rs = rA);
          }
          rq[xa(0x9d9)](
            rr - ru * 0.42 + rt * 0.4,
            rs + rt * 0.42 + ru * 0.4,
            rr - ru * 0.84,
            rs + rt * 0.84
          ),
            (rq[xa(0x9f0)] = this[xa(0x219)](xa(0xce2))),
            rq[xa(0x8ab)](),
            (rq[xa(0x659)] = 0x8),
            (rq[xa(0x4b9)] = this[xa(0x219)](xa(0x251))),
            rq[xa(0x4b4)]();
        }
        [uf(0xb1d)](rq) {
          const xb = uf;
          rq[xb(0x90b)](this[xb(0xbab)] / 0xd),
            rq[xb(0x174)](-Math["PI"] / 0x6),
            (rq[xb(0x5e0)] = rq[xb(0x60f)] = xb(0xc28)),
            rq[xb(0x7f5)](),
            rq[xb(0x269)](0x0, -0xe),
            rq[xb(0x83f)](0x6, -0x14),
            (rq[xb(0x9f0)] = rq[xb(0x4b9)] = this[xb(0x219)](xb(0x803))),
            (rq[xb(0x659)] = 0x7),
            rq[xb(0x4b4)](),
            (rq[xb(0x9f0)] = rq[xb(0x4b9)] = this[xb(0x219)](xb(0xc3f))),
            (rq[xb(0x659)] = 0x2),
            rq[xb(0x4b4)](),
            rq[xb(0x7f5)](),
            rq[xb(0x269)](0x0, -0xc),
            rq[xb(0x9d9)](-0x6, 0x0, 0x4, 0xe),
            rq[xb(0x34a)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rq[xb(0x659)] = 0xc),
            (rq[xb(0x9f0)] = rq[xb(0x4b9)] = this[xb(0x219)](xb(0x4a5))),
            rq[xb(0x8ab)](),
            rq[xb(0x4b4)](),
            (rq[xb(0x659)] = 0x6),
            (rq[xb(0x9f0)] = rq[xb(0x4b9)] = this[xb(0x219)](xb(0xd25))),
            rq[xb(0x4b4)](),
            rq[xb(0x8ab)]();
        }
        [uf(0x654)](rq) {
          const xc = uf;
          rq[xc(0x90b)](this[xc(0xbab)] / 0x2d),
            rq[xc(0x8e8)](-0x14, 0x0),
            (rq[xc(0x5e0)] = rq[xc(0x60f)] = xc(0xc28)),
            rq[xc(0x7f5)]();
          const rr = 0x6,
            rs = Math["PI"] * 0.45,
            rt = 0x3c,
            ru = 0x46;
          rq[xc(0x269)](0x0, 0x0);
          for (let rv = 0x0; rv < rr; rv++) {
            const rw = ((rv / rr) * 0x2 - 0x1) * rs,
              rx = (((rv + 0x1) / rr) * 0x2 - 0x1) * rs;
            rv === 0x0 &&
              rq[xc(0x9d9)](
                -0xa,
                -0x32,
                Math[xc(0x3a8)](rw) * rt,
                Math[xc(0xb1f)](rw) * rt
              );
            const ry = (rw + rx) / 0x2;
            rq[xc(0x9d9)](
              Math[xc(0x3a8)](ry) * ru,
              Math[xc(0xb1f)](ry) * ru,
              Math[xc(0x3a8)](rx) * rt,
              Math[xc(0xb1f)](rx) * rt
            );
          }
          rq[xc(0x9d9)](-0xa, 0x32, 0x0, 0x0),
            (rq[xc(0x9f0)] = this[xc(0x219)](xc(0xb7b))),
            (rq[xc(0x4b9)] = this[xc(0x219)](xc(0xce9))),
            (rq[xc(0x659)] = 0xa),
            rq[xc(0x4b4)](),
            rq[xc(0x8ab)](),
            rq[xc(0x7f5)](),
            rq[xc(0x5b3)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rq[xc(0x326)](),
            (rq[xc(0x4b9)] = this[xc(0x219)](xc(0xca8))),
            (rq[xc(0x659)] = 0x1e),
            rq[xc(0x4b4)](),
            (rq[xc(0x659)] = 0xa),
            (rq[xc(0x4b9)] = rq[xc(0x9f0)] = this[xc(0x219)](xc(0x436))),
            rq[xc(0x8ab)](),
            rq[xc(0x4b4)]();
        }
        [uf(0x485)](rq, rr = ![]) {
          const xd = uf;
          rq[xd(0x90b)](this[xd(0xbab)] / 0x64);
          let rs = this[xd(0x837)]
            ? 0.75
            : Math[xd(0xb1f)](Date[xd(0xe04)]() / 0x96 + this[xd(0x381)]);
          (rs = rs * 0.5 + 0.5),
            (rs *= 0.7),
            rq[xd(0x7f5)](),
            rq[xd(0x269)](0x0, 0x0),
            rq[xd(0x5b3)](0x0, 0x0, 0x64, rs, Math["PI"] * 0x2 - rs),
            rq[xd(0x326)](),
            (rq[xd(0x9f0)] = this[xd(0x219)](xd(0xb4e))),
            rq[xd(0x8ab)](),
            rq[xd(0x1e7)](),
            (rq[xd(0x4b9)] = xd(0x4db)),
            (rq[xd(0x659)] = rr ? 0x28 : 0x1e),
            (rq[xd(0x60f)] = xd(0xc28)),
            rq[xd(0x4b4)](),
            !rr &&
              (rq[xd(0x7f5)](),
              rq[xd(0x5b3)](
                0x0 - rs * 0x8,
                -0x32 - rs * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rq[xd(0x9f0)] = xd(0xbf4)),
              rq[xd(0x8ab)]());
        }
        [uf(0x45e)](rq) {
          const xe = uf;
          rq[xe(0x90b)](this[xe(0xbab)] / 0x50),
            rq[xe(0x174)](-this[xe(0x694)]),
            rq[xe(0x8e8)](0x0, 0x50);
          const rr = Date[xe(0xe04)]() / 0x12c + this[xe(0x381)];
          rq[xe(0x7f5)]();
          const rs = 0x3;
          let rt;
          for (let rw = 0x0; rw < rs; rw++) {
            const rx = ((rw / rs) * 0x2 - 0x1) * 0x64,
              ry = (((rw + 0x1) / rs) * 0x2 - 0x1) * 0x64;
            (rt =
              0x14 +
              (Math[xe(0xb1f)]((rw / rs) * Math["PI"] * 0x8 + rr) * 0.5 + 0.5) *
                0x1e),
              rw === 0x0 && rq[xe(0x269)](rx, -rt),
              rq[xe(0x34a)](rx, rt, ry, rt, ry, -rt);
          }
          rq[xe(0x34a)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rt),
            rq[xe(0x326)](),
            (rq[xe(0x89c)] *= 0.7);
          const ru = this[xe(0xd79)]
            ? lh[0x0]
            : this["id"] < 0x0
            ? lj[0x0]
            : lj[this["id"] % lj[xe(0x441)]];
          (rq[xe(0x9f0)] = this[xe(0x219)](ru)),
            rq[xe(0x8ab)](),
            rq[xe(0x1e7)](),
            (rq[xe(0x60f)] = xe(0xc28)),
            (rq[xe(0x4b9)] = xe(0x4db)),
            xe(0x891),
            (rq[xe(0x659)] = 0x1e),
            rq[xe(0x4b4)]();
          let rv = Math[xe(0xb1f)](rr * 0x1);
          (rv = rv * 0.5 + 0.5),
            (rv *= 0x3),
            rq[xe(0x7f5)](),
            rq[xe(0x688)](
              0x0,
              -0x82 - rv * 0x2,
              0x28 - rv,
              0x14 - rv * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xe(0x9f0)] = rq[xe(0x4b9)]),
            rq[xe(0x8ab)]();
        }
        [uf(0x67e)](rq, rr) {
          const xf = uf;
          rq[xf(0x90b)](this[xf(0xbab)] / 0x14);
          const rs = rq[xf(0x89c)];
          (rq[xf(0x4b9)] = rq[xf(0x9f0)] = this[xf(0x219)](xf(0xb38))),
            (rq[xf(0x89c)] = 0.4 * rs),
            rq[xf(0x64c)](),
            rq[xf(0x7f5)](),
            rq[xf(0x174)](Math["PI"] * 0.16),
            rq[xf(0x8e8)](rr ? -0x6 : -0x9, 0x0),
            rq[xf(0x269)](0x0, -0x4),
            rq[xf(0x9d9)](-0x2, 0x0, 0x0, 0x4),
            (rq[xf(0x659)] = 0x8),
            (rq[xf(0x60f)] = rq[xf(0x5e0)] = xf(0xc28)),
            rq[xf(0x4b4)](),
            rq[xf(0x6c7)](),
            rq[xf(0x7f5)](),
            rq[xf(0x5b3)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rq[xf(0x8ab)](),
            rq[xf(0x1e7)](),
            (rq[xf(0x89c)] = 0.5 * rs),
            (rq[xf(0x659)] = rr ? 0x8 : 0x3),
            rq[xf(0x4b4)]();
        }
        [uf(0x63e)](rq) {
          const xg = uf;
          rq[xg(0x90b)](this[xg(0xbab)] / 0x64);
          const rr = this[xg(0x219)](xg(0x25d)),
            rs = this[xg(0x219)](xg(0x148)),
            rt = 0x4;
          rq[xg(0x60f)] = rq[xg(0x5e0)] = xg(0xc28);
          const ru = 0x64 - rq[xg(0x659)] * 0.5;
          for (let rv = 0x0; rv <= rt; rv++) {
            const rw = (0x1 - rv / rt) * ru;
            lE(rq, rw),
              (rq[xg(0x659)] =
                0x1e +
                rv *
                  (Math[xg(0xb1f)](Date[xg(0xe04)]() / 0x320 + rv) * 0.5 +
                    0.5) *
                  0x5),
              (rq[xg(0x9f0)] = rq[xg(0x4b9)] = rv % 0x2 === 0x0 ? rr : rs),
              rv === rt - 0x1 && rq[xg(0x8ab)](),
              rq[xg(0x4b4)]();
          }
        }
        [uf(0xbdc)](rq, rr) {
          const xh = uf;
          rq[xh(0x7f5)](),
            rq[xh(0x5b3)](0x0, 0x0, this[xh(0xbab)], 0x0, l0),
            (rq[xh(0x9f0)] = this[xh(0x219)](rr)),
            rq[xh(0x8ab)](),
            (rq[xh(0x9f0)] = xh(0xbf4));
          for (let rs = 0x1; rs < 0x4; rs++) {
            rq[xh(0x7f5)](),
              rq[xh(0x5b3)](
                0x0,
                0x0,
                this[xh(0xbab)] * (0x1 - rs / 0x4),
                0x0,
                l0
              ),
              rq[xh(0x8ab)]();
          }
        }
        [uf(0x7a7)](rq, rr) {
          const xi = uf;
          rq[xi(0x8e8)](-this[xi(0xbab)], 0x0), (rq[xi(0x8f8)] = xi(0xb79));
          const rs = 0x32;
          let rt = ![];
          !this[xi(0x851)] && ((rt = !![]), (this[xi(0x851)] = []));
          while (this[xi(0x851)][xi(0x441)] < rs) {
            this[xi(0x851)][xi(0xaba)]({
              x: rt ? Math[xi(0x9e1)]() : 0x0,
              y: Math[xi(0x9e1)]() * 0x2 - 0x1,
              vx: Math[xi(0x9e1)]() * 0.03 + 0.02,
              size: Math[xi(0x9e1)]() * 0.2 + 0.2,
            });
          }
          const ru = this[xi(0xbab)] * 0x2,
            rv = Math[xi(0x606)](this[xi(0xbab)] * 0.1, 0x4),
            rw = rq[xi(0x89c)];
          (rq[xi(0x9f0)] = rr), rq[xi(0x7f5)]();
          for (let rx = rs - 0x1; rx >= 0x0; rx--) {
            const ry = this[xi(0x851)][rx];
            ry["x"] += ry["vx"];
            const rz = ry["x"] * ru,
              rA = this[xi(0xc1c)] * rz,
              rB = ry["y"] * rA,
              rC =
                Math[xi(0x84e)](0x1 - Math[xi(0xcb1)](rB) / rA, 0.2) *
                Math[xi(0x84e)](0x1 - rz / ru, 0.2);
            if (ry["x"] >= 0x1 || rC < 0.001) {
              this[xi(0x851)][xi(0xde9)](rx, 0x1);
              continue;
            }
            (rq[xi(0x89c)] = rC * rw * 0.5),
              rq[xi(0x7f5)](),
              rq[xi(0x5b3)](
                rz,
                rB,
                ry[xi(0xbab)] * rA + rv,
                0x0,
                Math["PI"] * 0x2
              ),
              rq[xi(0x8ab)]();
          }
        }
        [uf(0xbef)](rq) {
          const xj = uf;
          rq[xj(0x90b)](this[xj(0xbab)] / 0x46),
            rq[xj(0x174)](-Math["PI"] / 0x2);
          const rr = pz / 0xc8;
          (rq[xj(0x659)] = 0x14),
            (rq[xj(0x4b9)] = xj(0x9a3)),
            (rq[xj(0x5e0)] = rq[xj(0x60f)] = xj(0xc28)),
            (rq[xj(0x9f0)] = this[xj(0x219)](xj(0x58b)));
          if (!![]) {
            this[xj(0x9bf)](rq);
            return;
          }
          const rs = 0x2;
          for (let rt = 0x1; rt <= rs; rt++) {
            rq[xj(0x64c)]();
            let ru = 0x1 - rt / rs;
            (ru *= 0x1 + Math[xj(0xb1f)](rr + rt) * 0.5),
              (ru = 0x1 + ru * 0.5),
              (rq[xj(0x89c)] *= Math[xj(0x84e)](rt / rs, 0x2)),
              rq[xj(0x656)](ru, ru),
              rt !== rs &&
                ((rq[xj(0x89c)] *= 0.7),
                (rq[xj(0x8f8)] = xj(0xb79)),
                (rq[xj(0x7fc)] = xj(0xac5))),
              this[xj(0x9bf)](rq),
              rq[xj(0x6c7)]();
          }
        }
        [uf(0xd09)](rq, rr = 0xbe) {
          const xk = uf;
          rq[xk(0x64c)](),
            rq[xk(0x7f5)](),
            rq[xk(0x269)](0x0, -0x46 + rr + 0x1e),
            rq[xk(0x83f)](0x1a, -0x46 + rr),
            rq[xk(0x83f)](0xd, -0x46),
            rq[xk(0x83f)](-0xd, -0x46),
            rq[xk(0x83f)](-0x1a, -0x46 + rr),
            rq[xk(0x83f)](0x0, -0x46 + rr + 0x1e),
            rq[xk(0x1e7)](),
            rq[xk(0x8ab)](),
            rq[xk(0x4b4)](),
            rq[xk(0x6c7)](),
            rq[xk(0x64c)](),
            rq[xk(0x7f5)](),
            rq[xk(0x269)](-0x12, -0x46),
            rq[xk(0x9d9)](-0x5, -0x50, -0xa, -0x69),
            rq[xk(0x34a)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rq[xk(0x9d9)](0x5, -0x50, 0x12, -0x46),
            rq[xk(0x9d9)](0x0, -0x3c, -0x12, -0x46),
            rq[xk(0x326)](),
            this[xk(0x6ed)]
              ? ((rq[xk(0x9f0)] = this[xk(0x219)](xk(0x9f2))),
                (rq[xk(0x4b9)] = this[xk(0x219)](xk(0x319))))
              : (rq[xk(0x4b9)] = this[xk(0x219)](xk(0xa06))),
            rq[xk(0x8ab)](),
            (rq[xk(0x659)] = 0xa),
            rq[xk(0x4b4)](),
            rq[xk(0x6c7)]();
        }
        [uf(0x9bf)](rq) {
          const xl = uf;
          rq[xl(0x64c)](), rq[xl(0x7f5)]();
          for (let rr = 0x0; rr < 0x2; rr++) {
            rq[xl(0x269)](0x14, -0x1e),
              rq[xl(0x9d9)](0x5a, -0xa, 0x32, -0x32),
              rq[xl(0x83f)](0xa0, -0x32),
              rq[xl(0x9d9)](0x8c, 0x3c, 0x14, 0x0),
              rq[xl(0x656)](-0x1, 0x1);
          }
          rq[xl(0x1e7)](),
            rq[xl(0x8ab)](),
            rq[xl(0x4b4)](),
            rq[xl(0x6c7)](),
            this[xl(0xd09)](rq),
            rq[xl(0x64c)](),
            rq[xl(0x7f5)](),
            rq[xl(0x5b3)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rq[xl(0x83f)](-0x32, 0x1e),
            rq[xl(0x83f)](-0x1e, 0x1e),
            rq[xl(0x83f)](-0x1f, 0x32),
            rq[xl(0x83f)](0x1f, 0x32),
            rq[xl(0x83f)](0x1e, 0x1e),
            rq[xl(0x83f)](0x32, 0x1e),
            rq[xl(0x83f)](0x32, 0x0),
            rq[xl(0x8ab)](),
            rq[xl(0x1e7)](),
            rq[xl(0x4b4)](),
            rq[xl(0x7f5)](),
            rq[xl(0x688)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rq[xl(0x688)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rq[xl(0x9f0)] = rq[xl(0x4b9)]),
            rq[xl(0x8ab)](),
            rq[xl(0x6c7)]();
        }
        [uf(0x4e9)](rq) {
          const xm = uf;
          rq[xm(0x90b)](this[xm(0xbab)] / 0x64), (rq[xm(0x4b9)] = xm(0xbf4));
          const rr = this[xm(0x219)](xm(0xdf8)),
            rs = this[xm(0x219)](xm(0x177));
          (this[xm(0x3f0)] += (pA / 0x12c) * (this[xm(0xbd0)] ? 0x1 : -0x1)),
            (this[xm(0x3f0)] = Math[xm(0xbd3)](
              0x1,
              Math[xm(0x606)](0x0, this[xm(0x3f0)])
            ));
          const rt = this[xm(0x837)] ? 0x1 : this[xm(0x3f0)],
            ru = 0x1 - rt;
          rq[xm(0x64c)](),
            rq[xm(0x7f5)](),
            rq[xm(0x8e8)](
              (0x30 +
                (Math[xm(0xb1f)](this[xm(0x381)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rt +
                (0x1 - rt) * -0x14,
              0x0
            ),
            rq[xm(0x656)](1.1, 1.1),
            rq[xm(0x269)](0x0, -0xa),
            rq[xm(0x34a)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rq[xm(0x9f0)] = rs),
            rq[xm(0x8ab)](),
            (rq[xm(0x60f)] = xm(0xc28)),
            (rq[xm(0x659)] = 0x1c),
            rq[xm(0x1e7)](),
            rq[xm(0x4b4)](),
            rq[xm(0x6c7)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            const rw = Math[xm(0xb1f)](this[xm(0x381)] * 0x1);
            rq[xm(0x64c)]();
            const rx = rv * 0x2 - 0x1;
            rq[xm(0x656)](0x1, rx),
              rq[xm(0x8e8)](0x32 * rt - ru * 0xa, 0x50 * rt),
              rq[xm(0x174)](rw * 0.2 + 0.3 - ru * 0x1),
              rq[xm(0x7f5)](),
              rq[xm(0x269)](0xa, -0xa),
              rq[xm(0x9d9)](0x1e, 0x28, -0x14, 0x50),
              rq[xm(0x9d9)](0xa, 0x1e, -0xf, 0x0),
              (rq[xm(0x4b9)] = rr),
              (rq[xm(0x659)] = 0x2c),
              (rq[xm(0x5e0)] = rq[xm(0x60f)] = xm(0xc28)),
              rq[xm(0x4b4)](),
              (rq[xm(0x659)] -= 0x1c),
              (rq[xm(0x9f0)] = rq[xm(0x4b9)] = rs),
              rq[xm(0x8ab)](),
              rq[xm(0x4b4)](),
              rq[xm(0x6c7)]();
          }
          for (let ry = 0x0; ry < 0x2; ry++) {
            const rz = Math[xm(0xb1f)](this[xm(0x381)] * 0x1 + 0x1);
            rq[xm(0x64c)]();
            const rA = ry * 0x2 - 0x1;
            rq[xm(0x656)](0x1, rA),
              rq[xm(0x8e8)](-0x41 * rt, 0x32 * rt),
              rq[xm(0x174)](rz * 0.3 + 1.3),
              rq[xm(0x7f5)](),
              rq[xm(0x269)](0xc, -0x5),
              rq[xm(0x9d9)](0x28, 0x1e, 0x0, 0x3c),
              rq[xm(0x9d9)](0x14, 0x1e, 0x0, 0x0),
              (rq[xm(0x4b9)] = rr),
              (rq[xm(0x659)] = 0x2c),
              (rq[xm(0x5e0)] = rq[xm(0x60f)] = xm(0xc28)),
              rq[xm(0x4b4)](),
              (rq[xm(0x659)] -= 0x1c),
              (rq[xm(0x9f0)] = rq[xm(0x4b9)] = rs),
              rq[xm(0x4b4)](),
              rq[xm(0x8ab)](),
              rq[xm(0x6c7)]();
          }
          this[xm(0xcb3)](rq);
        }
        [uf(0xcb3)](rq, rr = 0x1) {
          const xn = uf;
          rq[xn(0x7f5)](),
            rq[xn(0x5b3)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xn(0x4b9)] = xn(0xbf4)),
            (rq[xn(0x9f0)] = this[xn(0x219)](xn(0xd03))),
            rq[xn(0x8ab)](),
            (rq[xn(0x659)] = 0x1e * rr),
            rq[xn(0x64c)](),
            rq[xn(0x1e7)](),
            rq[xn(0x4b4)](),
            rq[xn(0x6c7)](),
            rq[xn(0x64c)](),
            rq[xn(0x7f5)](),
            rq[xn(0x5b3)](
              0x0,
              0x0,
              0x64 - rq[xn(0x659)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rq[xn(0x1e7)](),
            rq[xn(0x7f5)]();
          for (let rs = 0x0; rs < 0x6; rs++) {
            const rt = (rs / 0x6) * Math["PI"] * 0x2;
            rq[xn(0x83f)](
              Math[xn(0x3a8)](rt) * 0x28,
              Math[xn(0xb1f)](rt) * 0x28
            );
          }
          rq[xn(0x326)]();
          for (let ru = 0x0; ru < 0x6; ru++) {
            const rv = (ru / 0x6) * Math["PI"] * 0x2,
              rw = Math[xn(0x3a8)](rv) * 0x28,
              rx = Math[xn(0xb1f)](rv) * 0x28;
            rq[xn(0x269)](rw, rx), rq[xn(0x83f)](rw * 0x3, rx * 0x3);
          }
          (rq[xn(0x659)] = 0x10 * rr),
            (rq[xn(0x5e0)] = rq[xn(0x60f)] = xn(0xc28)),
            rq[xn(0x4b4)](),
            rq[xn(0x6c7)]();
        }
        [uf(0xde2)](rq) {
          const xo = uf;
          rq[xo(0x90b)](this[xo(0xbab)] / 0x82);
          let rr, rs;
          const rt = 0x2d,
            ru = lp(
              this[xo(0xb55)] ||
                (this[xo(0xb55)] = this[xo(0x837)]
                  ? 0x28
                  : Math[xo(0x9e1)]() * 0x3e8)
            );
          let rv = ru() * 6.28;
          const rw = Date[xo(0xe04)]() / 0xc8,
            rx = [xo(0x97d), xo(0x921)][xo(0xa8b)]((ry) => this[xo(0x219)](ry));
          for (let ry = 0x0; ry <= rt; ry++) {
            (ry % 0x5 === 0x0 || ry === rt) &&
              (ry > 0x0 &&
                ((rq[xo(0x659)] = 0x19),
                (rq[xo(0x60f)] = rq[xo(0x5e0)] = xo(0xc28)),
                (rq[xo(0x4b9)] = rx[0x1]),
                rq[xo(0x4b4)](),
                (rq[xo(0x659)] = 0xc),
                (rq[xo(0x4b9)] = rx[0x0]),
                rq[xo(0x4b4)]()),
              ry !== rt && (rq[xo(0x7f5)](), rq[xo(0x269)](rr, rs)));
            let rz = ry / 0x32;
            (rz *= rz), (rv += (0.3 + ru() * 0.8) * 0x3);
            const rA = 0x14 + Math[xo(0xb1f)](rz * 3.14) * 0x6e,
              rB = Math[xo(0xb1f)](ry + rw) * 0.5,
              rC = Math[xo(0x3a8)](rv + rB) * rA,
              rD = Math[xo(0xb1f)](rv + rB) * rA,
              rE = rC - rr,
              rF = rD - rs;
            rq[xo(0x9d9)]((rr + rC) / 0x2 + rF, (rs + rD) / 0x2 - rE, rC, rD),
              (rr = rC),
              (rs = rD);
          }
        }
        [uf(0xa65)](rq) {
          const xp = uf;
          rq[xp(0x90b)](this[xp(0xbab)] / 0x6e),
            (rq[xp(0x4b9)] = xp(0xbf4)),
            (rq[xp(0x659)] = 0x1c),
            rq[xp(0x7f5)](),
            rq[xp(0x5b3)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rq[xp(0x9f0)] = this[xp(0x219)](xp(0x36d))),
            rq[xp(0x8ab)](),
            rq[xp(0x64c)](),
            rq[xp(0x1e7)](),
            rq[xp(0x4b4)](),
            rq[xp(0x6c7)](),
            rq[xp(0x7f5)](),
            rq[xp(0x5b3)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rq[xp(0x9f0)] = xp(0x899)),
            rq[xp(0x8ab)](),
            rq[xp(0x64c)](),
            rq[xp(0x1e7)](),
            rq[xp(0x4b4)](),
            rq[xp(0x6c7)]();
          const rr = lp(
              this[xp(0xc60)] ||
                (this[xp(0xc60)] = this[xp(0x837)]
                  ? 0x1e
                  : Math[xp(0x9e1)]() * 0x3e8)
            ),
            rs = this[xp(0x219)](xp(0x409)),
            rt = this[xp(0x219)](xp(0xc70));
          for (let rw = 0x0; rw < 0x3; rw++) {
            rq[xp(0x7f5)]();
            const rx = 0xc;
            for (let ry = 0x0; ry < rx; ry++) {
              const rz = (Math["PI"] * 0x2 * ry) / rx;
              rq[xp(0x64c)](),
                rq[xp(0x174)](rz + rr() * 0.4),
                rq[xp(0x8e8)](0x3c + rr() * 0xa, 0x0),
                rq[xp(0x269)](rr() * 0x5, rr() * 0x5),
                rq[xp(0x34a)](
                  0x14 + rr() * 0xa,
                  rr() * 0x14,
                  0x28 + rr() * 0x14,
                  rr() * 0x1e + 0xa,
                  0x3c + rr() * 0xa,
                  rr() * 0xa + 0xa
                ),
                rq[xp(0x6c7)]();
            }
            (rq[xp(0x5e0)] = rq[xp(0x60f)] = xp(0xc28)),
              (rq[xp(0x659)] = 0x12 - rw * 0x2),
              (rq[xp(0x4b9)] = rs),
              rq[xp(0x4b4)](),
              (rq[xp(0x659)] -= 0x8),
              (rq[xp(0x4b9)] = rt),
              rq[xp(0x4b4)]();
          }
          const ru = 0x28;
          rq[xp(0x174)](-this[xp(0x694)]),
            (rq[xp(0x9f0)] = this[xp(0x219)](xp(0x529))),
            (rq[xp(0x4b9)] = this[xp(0x219)](xp(0xc56))),
            (rq[xp(0x659)] = 0x9);
          const rv = this[xp(0xb98)] * 0x6;
          for (let rA = 0x0; rA < rv; rA++) {
            const rB = ((rA - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rq[xp(0x7f5)](),
              rq[xp(0x688)](
                Math[xp(0x3a8)](rB) * ru,
                Math[xp(0xb1f)](rB) * ru * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rq[xp(0x8ab)](),
              rq[xp(0x4b4)]();
          }
        }
        [uf(0x7d9)](rq) {
          const xq = uf;
          rq[xq(0x174)](-this[xq(0x694)]),
            rq[xq(0x90b)](this[xq(0xbab)] / 0x3c),
            (rq[xq(0x5e0)] = rq[xq(0x60f)] = xq(0xc28));
          let rr =
            Math[xq(0xb1f)](Date[xq(0xe04)]() / 0x12c + this[xq(0x381)] * 0.5) *
              0.5 +
            0.5;
          (rr *= 1.5),
            rq[xq(0x7f5)](),
            rq[xq(0x269)](-0x32, -0x32 - rr * 0x3),
            rq[xq(0x9d9)](0x0, -0x3c, 0x32, -0x32 - rr * 0x3),
            rq[xq(0x9d9)](0x50 - rr * 0x3, -0xa, 0x50, 0x32),
            rq[xq(0x9d9)](0x46, 0x4b, 0x28, 0x4e + rr * 0x5),
            rq[xq(0x83f)](0x1e, 0x3c + rr * 0x5),
            rq[xq(0x9d9)](0x2d, 0x37, 0x32, 0x2d),
            rq[xq(0x9d9)](0x0, 0x41, -0x32, 0x32),
            rq[xq(0x9d9)](-0x2d, 0x37, -0x1e, 0x3c + rr * 0x3),
            rq[xq(0x83f)](-0x28, 0x4e + rr * 0x5),
            rq[xq(0x9d9)](-0x46, 0x4b, -0x50, 0x32),
            rq[xq(0x9d9)](-0x50 + rr * 0x3, -0xa, -0x32, -0x32 - rr * 0x3),
            (rq[xq(0x9f0)] = this[xq(0x219)](xq(0xa28))),
            rq[xq(0x8ab)](),
            (rq[xq(0x4b9)] = xq(0xbf4)),
            rq[xq(0x64c)](),
            rq[xq(0x1e7)](),
            (rq[xq(0x659)] = 0xe),
            rq[xq(0x4b4)](),
            rq[xq(0x6c7)]();
          for (let rs = 0x0; rs < 0x2; rs++) {
            rq[xq(0x64c)](),
              rq[xq(0x656)](rs * 0x2 - 0x1, 0x1),
              rq[xq(0x8e8)](-0x22, -0x18 - rr * 0x3),
              rq[xq(0x174)](-0.6),
              rq[xq(0x656)](1.3, 1.3),
              rq[xq(0x7f5)](),
              rq[xq(0x269)](-0x14, 0x0),
              rq[xq(0x9d9)](-0x14, -0x19, 0x0, -0x28),
              rq[xq(0x9d9)](0x14, -0x19, 0x14, 0x0),
              rq[xq(0x8ab)](),
              rq[xq(0x1e7)](),
              (rq[xq(0x659)] = 0xd),
              rq[xq(0x4b4)](),
              rq[xq(0x6c7)]();
          }
          rq[xq(0x64c)](),
            rq[xq(0x7f5)](),
            rq[xq(0x688)](
              0x0,
              0x1e,
              0x24 - rr * 0x2,
              0x8 - rr,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xq(0x9f0)] = this[xq(0x219)](xq(0x11c))),
            (rq[xq(0x89c)] *= 0.2),
            rq[xq(0x8ab)](),
            rq[xq(0x6c7)](),
            (rq[xq(0x9f0)] = rq[xq(0x4b9)] = this[xq(0x219)](xq(0x97c)));
          for (let rt = 0x0; rt < 0x2; rt++) {
            rq[xq(0x64c)](),
              rq[xq(0x656)](rt * 0x2 - 0x1, 0x1),
              rq[xq(0x8e8)](0x19 - rr * 0x1, 0xf - rr * 0x3),
              rq[xq(0x174)](-0.3),
              rq[xq(0x7f5)](),
              rq[xq(0x5b3)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rq[xq(0x8ab)](),
              rq[xq(0x6c7)]();
          }
          rq[xq(0x64c)](),
            (rq[xq(0x659)] = 0x5),
            rq[xq(0x8e8)](0x0, 0x21 - rr * 0x1),
            rq[xq(0x7f5)](),
            rq[xq(0x269)](-0xc, 0x0),
            rq[xq(0x34a)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rq[xq(0x34a)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rq[xq(0x4b4)](),
            rq[xq(0x6c7)]();
        }
        [uf(0xd08)](rq) {
          const xr = uf;
          rq[xr(0x90b)](this[xr(0xbab)] / 0x3c),
            rq[xr(0x174)](-Math["PI"] / 0x2),
            rq[xr(0x7f5)](),
            rq[xr(0x269)](0x32, 0x50),
            rq[xr(0x9d9)](0x1e, 0x1e, 0x32, -0x14),
            rq[xr(0x9d9)](0x5a, -0x64, 0x0, -0x64),
            rq[xr(0x9d9)](-0x5a, -0x64, -0x32, -0x14),
            rq[xr(0x9d9)](-0x1e, 0x1e, -0x32, 0x50),
            (rq[xr(0x9f0)] = this[xr(0x219)](xr(0xa98))),
            rq[xr(0x8ab)](),
            (rq[xr(0x60f)] = rq[xr(0x5e0)] = xr(0xc28)),
            (rq[xr(0x659)] = 0x14),
            rq[xr(0x1e7)](),
            (rq[xr(0x4b9)] = xr(0xbf4)),
            rq[xr(0x4b4)](),
            (rq[xr(0x9f0)] = this[xr(0x219)](xr(0x440)));
          const rr = 0x6;
          rq[xr(0x7f5)](), rq[xr(0x269)](-0x32, 0x50);
          for (let rs = 0x0; rs < rr; rs++) {
            const rt = (((rs + 0.5) / rr) * 0x2 - 0x1) * 0x32,
              ru = (((rs + 0x1) / rr) * 0x2 - 0x1) * 0x32;
            rq[xr(0x9d9)](rt, 0x1e, ru, 0x50);
          }
          (rq[xr(0x659)] = 0x8),
            rq[xr(0x8ab)](),
            rq[xr(0x4b4)](),
            (rq[xr(0x4b9)] = rq[xr(0x9f0)] = xr(0xbf4)),
            rq[xr(0x64c)](),
            rq[xr(0x8e8)](0x0, -0x5),
            rq[xr(0x7f5)](),
            rq[xr(0x269)](0x0, 0x0),
            rq[xr(0x34a)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rq[xr(0x4b4)](),
            rq[xr(0x6c7)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            rq[xr(0x64c)](),
              rq[xr(0x656)](rv * 0x2 - 0x1, 0x1),
              rq[xr(0x8e8)](0x19, -0x38),
              rq[xr(0x7f5)](),
              rq[xr(0x5b3)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rq[xr(0x1e7)](),
              (rq[xr(0x659)] = 0xf),
              rq[xr(0x4b4)](),
              rq[xr(0x8ab)](),
              rq[xr(0x6c7)]();
          }
        }
        [uf(0x216)](rq) {
          const xs = uf;
          rq[xs(0x90b)](this[xs(0xbab)] / 0x32),
            (rq[xs(0x4b9)] = xs(0xbf4)),
            (rq[xs(0x659)] = 0x10);
          const rr = 0x7;
          rq[xs(0x7f5)]();
          const rs = 0x12;
          rq[xs(0x9f0)] = this[xs(0x219)](xs(0x7c2));
          const rt = Math[xs(0xb1f)](pz / 0x258);
          for (let ru = 0x0; ru < 0x2; ru++) {
            const rv = 1.2 - ru * 0.2;
            for (let rw = 0x0; rw < rr; rw++) {
              rq[xs(0x64c)](),
                rq[xs(0x174)](
                  (rw / rr) * Math["PI"] * 0x2 + (ru / rr) * Math["PI"]
                ),
                rq[xs(0x8e8)](0x2e, 0x0),
                rq[xs(0x656)](rv, rv);
              const rx = Math[xs(0xb1f)](rt + rw * 0.05 * (0x1 - ru * 0.5));
              rq[xs(0x7f5)](),
                rq[xs(0x269)](0x0, rs),
                rq[xs(0x9d9)](0x14, rs, 0x28 + rx, 0x0 + rx * 0x5),
                rq[xs(0x9d9)](0x14, -rs, 0x0, -rs),
                rq[xs(0x8ab)](),
                rq[xs(0x1e7)](),
                rq[xs(0x4b4)](),
                rq[xs(0x6c7)]();
            }
          }
          rq[xs(0x7f5)](),
            rq[xs(0x5b3)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rq[xs(0x9f0)] = this[xs(0x219)](xs(0xd24))),
            rq[xs(0x8ab)](),
            rq[xs(0x1e7)](),
            (rq[xs(0x659)] = 0x19),
            rq[xs(0x4b4)]();
        }
        [uf(0x948)](rq) {
          const xt = uf;
          rq[xt(0x90b)](this[xt(0xbab)] / 0x28);
          let rr = this[xt(0x381)];
          const rs = this[xt(0x837)] ? 0x0 : Math[xt(0xb1f)](pz / 0x64) * 0xf;
          (rq[xt(0x5e0)] = rq[xt(0x60f)] = xt(0xc28)),
            rq[xt(0x7f5)](),
            rq[xt(0x64c)]();
          const rt = 0x3;
          for (let ru = 0x0; ru < 0x2; ru++) {
            const rv = ru === 0x0 ? 0x1 : -0x1;
            for (let rw = 0x0; rw <= rt; rw++) {
              rq[xt(0x64c)](), rq[xt(0x269)](0x0, 0x0);
              const rx = Math[xt(0xb1f)](rr + rw + ru);
              rq[xt(0x174)](((rw / rt) * 0x2 - 0x1) * 0.6 + 1.4 + rx * 0.15),
                rq[xt(0x83f)](0x2d + rv * rs, 0x0),
                rq[xt(0x174)](0.2 + (rx * 0.5 + 0.5) * 0.1),
                rq[xt(0x83f)](0x4b, 0x0),
                rq[xt(0x6c7)]();
            }
            rq[xt(0x656)](0x1, -0x1);
          }
          rq[xt(0x6c7)](),
            (rq[xt(0x659)] = 0x8),
            (rq[xt(0x4b9)] = this[xt(0x219)](xt(0x478))),
            rq[xt(0x4b4)](),
            rq[xt(0x64c)](),
            rq[xt(0x8e8)](0x0, rs),
            this[xt(0x81c)](rq),
            rq[xt(0x6c7)]();
        }
        [uf(0x81c)](rq, rr = ![]) {
          const xu = uf;
          (rq[xu(0x5e0)] = rq[xu(0x60f)] = xu(0xc28)),
            rq[xu(0x174)](-0.15),
            rq[xu(0x7f5)](),
            rq[xu(0x269)](-0x32, 0x0),
            rq[xu(0x83f)](0x28, 0x0),
            rq[xu(0x269)](0xf, 0x0),
            rq[xu(0x83f)](-0x5, 0x19),
            rq[xu(0x269)](-0x3, 0x0),
            rq[xu(0x83f)](0xc, -0x14),
            rq[xu(0x269)](-0xe, -0x5),
            rq[xu(0x83f)](-0x2e, -0x17),
            (rq[xu(0x659)] = 0x1c),
            (rq[xu(0x4b9)] = this[xu(0x219)](xu(0x636))),
            rq[xu(0x4b4)](),
            (rq[xu(0x4b9)] = this[xu(0x219)](xu(0x571))),
            (rq[xu(0x659)] -= rr ? 0xf : 0xa),
            rq[xu(0x4b4)]();
        }
        [uf(0x92e)](rq) {
          const xv = uf;
          rq[xv(0x90b)](this[xv(0xbab)] / 0x64),
            rq[xv(0x7f5)](),
            rq[xv(0x5b3)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xv(0x9f0)] = this[xv(0x219)](xv(0x6d3))),
            rq[xv(0x8ab)](),
            rq[xv(0x1e7)](),
            (rq[xv(0x659)] = this[xv(0x6ed)] ? 0x32 : 0x1e),
            (rq[xv(0x4b9)] = xv(0xbf4)),
            rq[xv(0x4b4)]();
          if (!this[xv(0x811)]) {
            const rr = new Path2D(),
              rs = this[xv(0x6ed)] ? 0x2 : 0x3;
            for (let rt = 0x0; rt <= rs; rt++) {
              for (let ru = 0x0; ru <= rs; ru++) {
                const rv =
                    ((ru / rs + Math[xv(0x9e1)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rt % 0x2 === 0x0 ? -0x14 : 0x0),
                  rw = ((rt / rs + Math[xv(0x9e1)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rx = Math[xv(0x9e1)]() * 0xd + (this[xv(0x6ed)] ? 0xe : 0x7);
                rr[xv(0x269)](rv, rw),
                  rr[xv(0x5b3)](rv, rw, rx, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xv(0x811)] = rr;
          }
          rq[xv(0x7f5)](),
            rq[xv(0x5b3)](
              0x0,
              0x0,
              0x64 - rq[xv(0x659)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rq[xv(0x1e7)](),
            (rq[xv(0x9f0)] = xv(0x28b)),
            rq[xv(0x8ab)](this[xv(0x811)]);
        }
        [uf(0x7ac)](rq) {
          const xw = uf;
          rq[xw(0x90b)](this[xw(0xbab)] / 0x64),
            rq[xw(0x64c)](),
            rq[xw(0x8e8)](-0xf5, -0xdc),
            (rq[xw(0x4b9)] = this[xw(0x219)](xw(0x344))),
            (rq[xw(0x9f0)] = this[xw(0x219)](xw(0x3b6))),
            (rq[xw(0x659)] = 0xf),
            (rq[xw(0x60f)] = rq[xw(0x5e0)] = xw(0xc28));
          const rr = !this[xw(0x6ed)];
          if (rr) {
            rq[xw(0x64c)](),
              rq[xw(0x8e8)](0x10e, 0xde),
              rq[xw(0x64c)](),
              rq[xw(0x174)](-0.1);
            for (let rs = 0x0; rs < 0x3; rs++) {
              rq[xw(0x7f5)](),
                rq[xw(0x269)](-0x5, 0x0),
                rq[xw(0x9d9)](0x0, 0x28, 0x5, 0x0),
                rq[xw(0x4b4)](),
                rq[xw(0x8ab)](),
                rq[xw(0x8e8)](0x28, 0x0);
            }
            rq[xw(0x6c7)](), rq[xw(0x8e8)](0x17, 0x32), rq[xw(0x174)](0.05);
            for (let rt = 0x0; rt < 0x2; rt++) {
              rq[xw(0x7f5)](),
                rq[xw(0x269)](-0x5, 0x0),
                rq[xw(0x9d9)](0x0, -0x28, 0x5, 0x0),
                rq[xw(0x4b4)](),
                rq[xw(0x8ab)](),
                rq[xw(0x8e8)](0x28, 0x0);
            }
            rq[xw(0x6c7)]();
          }
          rq[xw(0x8ab)](lm),
            rq[xw(0x4b4)](lm),
            rq[xw(0x8ab)](ln),
            rq[xw(0x4b4)](ln),
            rq[xw(0x6c7)](),
            rr &&
              (rq[xw(0x7f5)](),
              rq[xw(0x5b3)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rq[xw(0x5b3)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rq[xw(0x9f0)] = xw(0xbf4)),
              rq[xw(0x8ab)]());
        }
        [uf(0x425)](rq) {
          const xx = uf;
          rq[xx(0x90b)](this[xx(0xbab)] / 0x46), rq[xx(0x64c)]();
          !this[xx(0x6ed)] && rq[xx(0x174)](Math["PI"] / 0x2);
          rq[xx(0x8e8)](0x0, 0x2d),
            rq[xx(0x7f5)](),
            rq[xx(0x269)](0x0, -0x64),
            rq[xx(0x34a)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rq[xx(0x34a)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rq[xx(0x5e0)] = rq[xx(0x60f)] = xx(0xc28)),
            (rq[xx(0x659)] = 0x3c),
            (rq[xx(0x4b9)] = this[xx(0x219)](xx(0x693))),
            rq[xx(0x4b4)](),
            (rq[xx(0x659)] -= this[xx(0x6ed)] ? 0x23 : 0x14),
            (rq[xx(0x9f0)] = rq[xx(0x4b9)] = this[xx(0x219)](xx(0xd8b))),
            rq[xx(0x4b4)](),
            (rq[xx(0x659)] -= this[xx(0x6ed)] ? 0x16 : 0xf),
            (rq[xx(0x9f0)] = rq[xx(0x4b9)] = this[xx(0x219)](xx(0x2a2))),
            rq[xx(0x4b4)](),
            rq[xx(0x8ab)](),
            rq[xx(0x8e8)](0x0, -0x24);
          if (this[xx(0x6ed)]) rq[xx(0x90b)](0.9);
          rq[xx(0x7f5)](),
            rq[xx(0x688)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rq[xx(0x9f0)] = this[xx(0x219)](xx(0x58d))),
            rq[xx(0x8ab)](),
            rq[xx(0x1e7)](),
            (rq[xx(0x659)] = 0xd),
            (rq[xx(0x4b9)] = xx(0xbf4)),
            rq[xx(0x4b4)](),
            rq[xx(0x7f5)](),
            rq[xx(0x688)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rq[xx(0x9f0)] = xx(0x834)),
            rq[xx(0x8ab)](),
            rq[xx(0x6c7)]();
        }
        [uf(0x5d4)](rq) {
          const xy = uf;
          rq[xy(0x90b)](this[xy(0xbab)] / 0x19);
          !this[xy(0x837)] &&
            this[xy(0x6ed)] &&
            rq[xy(0x174)](Math[xy(0xb1f)](pz / 0x64 + this["id"]) * 0.15);
          rq[xy(0x7f5)](),
            rq[xy(0x439)](-0x16, -0x16, 0x2c, 0x2c),
            (rq[xy(0x9f0)] = this[xy(0x219)](xy(0xb38))),
            rq[xy(0x8ab)](),
            (rq[xy(0x659)] = 0x6),
            (rq[xy(0x60f)] = xy(0xc28)),
            (rq[xy(0x4b9)] = this[xy(0x219)](xy(0x3b6))),
            rq[xy(0x4b4)](),
            rq[xy(0x7f5)]();
          const rr = this[xy(0x837)] ? 0x1 : 0x1 - Math[xy(0xb1f)](pz / 0x1f4),
            rs = rw(0x0, 0.25),
            rt = 0x1 - rw(0.25, 0.25),
            ru = rw(0.5, 0.25),
            rv = rw(0.75, 0.25);
          function rw(rx, ry) {
            const xz = xy;
            return Math[xz(0xbd3)](0x1, Math[xz(0x606)](0x0, (rr - rx) / ry));
          }
          rq[xy(0x174)]((rt * Math["PI"]) / 0x4);
          for (let rx = 0x0; rx < 0x2; rx++) {
            const ry = (rx * 0x2 - 0x1) * 0x7 * rv;
            for (let rz = 0x0; rz < 0x3; rz++) {
              let rA = rs * (-0xb + rz * 0xb);
              rq[xy(0x269)](rA, ry),
                rq[xy(0x5b3)](rA, ry, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rq[xy(0x9f0)] = this[xy(0x219)](xy(0x8b7))), rq[xy(0x8ab)]();
        }
        [uf(0xa5a)](rq) {
          const xA = uf;
          rq[xA(0x64c)](),
            rq[xA(0x8e8)](this["x"], this["y"]),
            this[xA(0x483)](rq),
            rq[xA(0x174)](this[xA(0x694)]),
            (rq[xA(0x659)] = 0x8);
          const rr = (rw, rx) => {
              const xB = xA;
              (rt = this[xB(0xbab)] / 0x14),
                rq[xB(0x656)](rt, rt),
                rq[xB(0x7f5)](),
                rq[xB(0x5b3)](0x0, 0x0, 0x14, 0x0, l0),
                (rq[xB(0x9f0)] = this[xB(0x219)](rw)),
                rq[xB(0x8ab)](),
                (rq[xB(0x4b9)] = this[xB(0x219)](rx)),
                rq[xB(0x4b4)]();
            },
            rs = (rw, rx, ry) => {
              const xC = xA;
              (rw = l8[rw]),
                rq[xC(0x656)](this[xC(0xbab)], this[xC(0xbab)]),
                (rq[xC(0x659)] /= this[xC(0xbab)]),
                (rq[xC(0x4b9)] = this[xC(0x219)](ry)),
                rq[xC(0x4b4)](rw),
                (rq[xC(0x9f0)] = this[xC(0x219)](rx)),
                rq[xC(0x8ab)](rw);
            };
          let rt, ru, rv;
          switch (this[xA(0x5a0)]) {
            case cS[xA(0x5d4)]:
            case cS[xA(0x82c)]:
              this[xA(0x5d4)](rq);
              break;
            case cS[xA(0x425)]:
            case cS[xA(0x4f4)]:
              this[xA(0x425)](rq);
              break;
            case cS[xA(0x180)]:
              (rq[xA(0x4b9)] = xA(0xbf4)),
                (rq[xA(0x659)] = 0x14),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x58b))),
                rq[xA(0x8e8)](-this[xA(0xbab)], 0x0),
                rq[xA(0x174)](-Math["PI"] / 0x2),
                rq[xA(0x90b)](0.5),
                rq[xA(0x8e8)](0x0, 0x46),
                this[xA(0xd09)](rq, this[xA(0xbab)] * 0x4);
              break;
            case cS[xA(0xbef)]:
              this[xA(0xbef)](rq);
              break;
            case cS[xA(0xd2c)]:
              this[xA(0x7ac)](rq);
              break;
            case cS[xA(0x7ac)]:
              this[xA(0x7ac)](rq);
              break;
            case cS[xA(0x92e)]:
            case cS[xA(0xb93)]:
              this[xA(0x92e)](rq);
              break;
            case cS[xA(0xd31)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x1e), this[xA(0x81c)](rq, !![]);
              break;
            case cS[xA(0x948)]:
              this[xA(0x948)](rq);
              break;
            case cS[xA(0xaa1)]:
              (rq[xA(0x659)] *= 0.7),
                rs(xA(0x5b1), xA(0x7c2), xA(0x950)),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0.6, 0x0, l0),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0xd24))),
                rq[xA(0x8ab)](),
                rq[xA(0x1e7)](),
                (rq[xA(0x4b9)] = xA(0xd44)),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x216)]:
              this[xA(0x216)](rq);
              break;
            case cS[xA(0x110)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x16),
                rq[xA(0x174)](Math["PI"] / 0x2),
                rq[xA(0x7f5)]();
              for (let si = 0x0; si < 0x2; si++) {
                rq[xA(0x269)](-0xa, -0x1e),
                  rq[xA(0x34a)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rq[xA(0x656)](0x1, -0x1);
              }
              (rq[xA(0x659)] = 0x10),
                (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x51e))),
                rq[xA(0x4b4)](),
                (rq[xA(0x659)] -= 0x7),
                (rq[xA(0x4b9)] = xA(0x7cc)),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x2bf)]:
              this[xA(0xd08)](rq);
              break;
            case cS[xA(0xb07)]:
              this[xA(0x7d9)](rq);
              break;
            case cS[xA(0xa65)]:
              this[xA(0xa65)](rq);
              break;
            case cS[xA(0xde2)]:
              this[xA(0xde2)](rq);
              break;
            case cS[xA(0xa9c)]:
              !this[xA(0xb4a)] &&
                ((this[xA(0xb4a)] = new lT(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cY[xA(0x98e)],
                  0x19
                )),
                (this[xA(0xb4a)][xA(0x427)] = !![]),
                (this[xA(0xb4a)][xA(0xa0b)] = !![]),
                (this[xA(0xb4a)][xA(0x42f)] = 0x1),
                (this[xA(0xb4a)][xA(0x482)] = !![]),
                (this[xA(0xb4a)][xA(0xb0b)] = xA(0x51a)),
                (this[xA(0xb4a)][xA(0x809)] = this[xA(0x809)]));
              rq[xA(0x174)](Math["PI"] / 0x2),
                (this[xA(0xb4a)][xA(0x2c4)] = this[xA(0x2c4)]),
                (this[xA(0xb4a)][xA(0xbab)] = this[xA(0xbab)]),
                this[xA(0xb4a)][xA(0xa5a)](rq);
              break;
            case cS[xA(0x4e9)]:
              this[xA(0x4e9)](rq);
              break;
            case cS[xA(0x6eb)]:
              rq[xA(0x64c)](),
                rq[xA(0x90b)](this[xA(0xbab)] / 0x64),
                rq[xA(0x174)]((Date[xA(0xe04)]() / 0x190) % 6.28),
                this[xA(0xcb3)](rq, 1.5),
                rq[xA(0x6c7)]();
              break;
            case cS[xA(0xcf6)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x14),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x0, -0x5),
                rq[xA(0x83f)](-0x8, 0x0),
                rq[xA(0x83f)](0x0, 0x5),
                rq[xA(0x83f)](0x8, 0x0),
                rq[xA(0x326)](),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x20),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x808))),
                rq[xA(0x4b4)](),
                (rq[xA(0x659)] = 0x14),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x162))),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x703)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x14),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x5, -0x5),
                rq[xA(0x83f)](-0x5, 0x5),
                rq[xA(0x83f)](0x5, 0x0),
                rq[xA(0x326)](),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x20),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xcb5))),
                rq[xA(0x4b4)](),
                (rq[xA(0x659)] = 0x14),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x93c))),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x78a)]:
              this[xA(0x7a7)](rq, xA(0x94d));
              break;
            case cS[xA(0x5ed)]:
              this[xA(0x7a7)](rq, xA(0x925));
              break;
            case cS[xA(0xb4f)]:
              this[xA(0x7a7)](rq, xA(0x39c));
              break;
            case cS[xA(0x63e)]:
              this[xA(0x63e)](rq);
              break;
            case cS[xA(0x45e)]:
              this[xA(0x45e)](rq);
              break;
            case cS[xA(0x485)]:
              this[xA(0x485)](rq);
              break;
            case cS[xA(0xaf2)]:
              this[xA(0x485)](rq, !![]);
              break;
            case cS[xA(0xb1d)]:
              this[xA(0xb1d)](rq);
              break;
            case cS[xA(0x654)]:
              this[xA(0x654)](rq);
              break;
            case cS[xA(0xbf6)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x19),
                lE(rq, 0x19),
                (rq[xA(0x60f)] = xA(0xc28)),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x8bd))),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xab3))),
                rq[xA(0x8ab)](),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x710)]:
              rq[xA(0x8e8)](-this[xA(0xbab)], 0x0);
              const rw = Date[xA(0xe04)]() / 0x32,
                rx = this[xA(0xbab)] * 0x2;
              rq[xA(0x7f5)]();
              const ry = 0x32;
              for (let sj = 0x0; sj < ry; sj++) {
                const sk = sj / ry,
                  sl = sk * Math["PI"] * (this[xA(0x837)] ? 7.75 : 0xa) - rw,
                  sm = sk * rx,
                  sn = sm * this[xA(0xc1c)];
                rq[xA(0x83f)](sm, Math[xA(0xb1f)](sl) * sn);
              }
              (rq[xA(0x4b9)] = xA(0x737)),
                (rq[xA(0x60f)] = rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x4),
                (rq[xA(0xceb)] = xA(0x199)),
                (rq[xA(0xc1b)] = this[xA(0x837)] ? 0xa : 0x14),
                rq[xA(0x4b4)](),
                rq[xA(0x4b4)](),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x3b8)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x37), this[xA(0x718)](rq);
              break;
            case cS[xA(0x7b2)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x14), rq[xA(0x7f5)]();
              for (let so = 0x0; so < 0x2; so++) {
                rq[xA(0x269)](-0x17, -0x5),
                  rq[xA(0x9d9)](0x0, 5.5, 0x17, -0x5),
                  rq[xA(0x656)](0x1, -0x1);
              }
              (rq[xA(0x659)] = 0xf),
                (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x3b6))),
                rq[xA(0x4b4)](),
                (rq[xA(0x659)] -= 0x6),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xb38))),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x120)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x23),
                rq[xA(0x7f5)](),
                rq[xA(0x688)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x46a))),
                rq[xA(0x8ab)](),
                rq[xA(0x1e7)](),
                (rq[xA(0x4b9)] = xA(0x899)),
                (rq[xA(0x659)] = 0x12),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x1e, 0x0),
                rq[xA(0x34a)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rq[xA(0x34a)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rq[xA(0x659)] = 0x3),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                (rq[xA(0x4b9)] = rq[xA(0x9f0)] = xA(0x583)),
                rq[xA(0x8ab)](),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0xd22)]:
              if (this[xA(0x89b)] !== this[xA(0xa17)]) {
                this[xA(0x89b)] = this[xA(0xa17)];
                const sp = new Path2D(),
                  sq = Math[xA(0xc28)](
                    this[xA(0xa17)] * (this[xA(0xa17)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sr = (Math["PI"] * 0x2) / sq,
                  ss = this[xA(0xa17)] < 0x64 ? 0.3 : 0.1;
                for (let st = 0x0; st < sq; st++) {
                  const su = st * sr,
                    sv = su + Math[xA(0x9e1)]() * sr,
                    sw = 0x1 - Math[xA(0x9e1)]() * ss;
                  sp[xA(0x83f)](
                    Math[xA(0x3a8)](sv) * this[xA(0xa17)] * sw,
                    Math[xA(0xb1f)](sv) * this[xA(0xa17)] * sw
                  );
                }
                sp[xA(0x326)](), (this[xA(0x727)] = sp);
              }
              (rt = this[xA(0xbab)] / this[xA(0xa17)]), rq[xA(0x656)](rt, rt);
              const rz = this[xA(0xd79)] ? lh : [xA(0x132), xA(0x9d4)];
              (rq[xA(0x4b9)] = this[xA(0x219)](rz[0x1])),
                rq[xA(0x4b4)](this[xA(0x727)]),
                (rq[xA(0x9f0)] = this[xA(0x219)](rz[0x0])),
                rq[xA(0x8ab)](this[xA(0x727)]);
              break;
            case cS[xA(0x377)]:
              if (this[xA(0x89b)] !== this[xA(0xa17)]) {
                this[xA(0x89b)] = this[xA(0xa17)];
                const sx = Math[xA(0xc28)](
                    this[xA(0xa17)] > 0xc8
                      ? this[xA(0xa17)] * 0.18
                      : this[xA(0xa17)] * 0.25
                  ),
                  sy = 0.5,
                  sz = 0.85;
                this[xA(0x727)] = la(sx, this[xA(0xa17)], sy, sz);
                if (this[xA(0xa17)] < 0x12c) {
                  const sA = new Path2D(),
                    sB = sx * 0x2;
                  for (let sC = 0x0; sC < sB; sC++) {
                    const sD = ((sC + 0x1) / sB) * Math["PI"] * 0x2;
                    let sE = (sC % 0x2 === 0x0 ? 0.7 : 1.2) * this[xA(0xa17)];
                    sA[xA(0x83f)](
                      Math[xA(0x3a8)](sD) * sE,
                      Math[xA(0xb1f)](sD) * sE
                    );
                  }
                  sA[xA(0x326)](), (this[xA(0x4d0)] = sA);
                } else this[xA(0x4d0)] = null;
              }
              (rt = this[xA(0xbab)] / this[xA(0xa17)]), rq[xA(0x656)](rt, rt);
              this[xA(0x4d0)] &&
                ((rq[xA(0x9f0)] = this[xA(0x219)](xA(0x204))),
                rq[xA(0x8ab)](this[xA(0x4d0)]));
              (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x6e4))),
                rq[xA(0x4b4)](this[xA(0x727)]),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x9f9))),
                rq[xA(0x8ab)](this[xA(0x727)]);
              break;
            case cS[xA(0x995)]:
              rq[xA(0x64c)](),
                (rt = this[xA(0xbab)] / 0x28),
                rq[xA(0x656)](rt, rt),
                (rq[xA(0x9f0)] = rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28));
              for (let sF = 0x0; sF < 0x2; sF++) {
                const sG = sF === 0x0 ? 0x1 : -0x1;
                rq[xA(0x64c)](),
                  rq[xA(0x8e8)](0x1c, sG * 0xd),
                  rq[xA(0x174)](
                    Math[xA(0xb1f)](this[xA(0x381)] * 1.24) * 0.1 * sG
                  ),
                  rq[xA(0x7f5)](),
                  rq[xA(0x269)](0x0, sG * 0x6),
                  rq[xA(0x83f)](0x14, sG * 0xb),
                  rq[xA(0x83f)](0x28, 0x0),
                  rq[xA(0x9d9)](0x14, sG * 0x5, 0x0, 0x0),
                  rq[xA(0x326)](),
                  rq[xA(0x8ab)](),
                  rq[xA(0x4b4)](),
                  rq[xA(0x6c7)]();
              }
              (ru = this[xA(0xd79)] ? lh : [xA(0x877), xA(0x102)]),
                (rq[xA(0x9f0)] = this[xA(0x219)](ru[0x0])),
                rq[xA(0x8ab)](l5),
                (rq[xA(0x659)] = 0x6),
                (rq[xA(0x9f0)] = rq[xA(0x4b9)] = this[xA(0x219)](ru[0x1])),
                rq[xA(0x4b4)](l5),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x15, 0x0),
                rq[xA(0x9d9)](0x0, -0x3, 0x15, 0x0),
                (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x7),
                rq[xA(0x4b4)]();
              const rA = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rq[xA(0x7f5)]();
              for (let sH = 0x0; sH < 0x2; sH++) {
                const sI = sH === 0x1 ? 0x1 : -0x1;
                for (let sJ = 0x0; sJ < rA[xA(0x441)]; sJ++) {
                  let [sK, sL] = rA[sJ];
                  (sL *= sI),
                    rq[xA(0x269)](sK, sL),
                    rq[xA(0x5b3)](sK, sL, 0x5, 0x0, l0);
                }
              }
              rq[xA(0x8ab)](), rq[xA(0x8ab)](), rq[xA(0x6c7)]();
              break;
            case cS[xA(0x512)]:
            case cS[xA(0x2c8)]:
              rq[xA(0x64c)](),
                (rt = this[xA(0xbab)] / 0x28),
                rq[xA(0x656)](rt, rt);
              const rB = this[xA(0x5a0)] === cS[xA(0x512)];
              rB &&
                (rq[xA(0x64c)](),
                rq[xA(0x8e8)](-0x2d, 0x0),
                rq[xA(0x174)](Math["PI"]),
                this[xA(0xb0a)](rq, 0xf / 1.1),
                rq[xA(0x6c7)]());
              (ru = this[xA(0xd79)]
                ? lh
                : rB
                ? [xA(0x55d), xA(0x6e1)]
                : [xA(0x79b), xA(0x350)]),
                rq[xA(0x7f5)](),
                rq[xA(0x688)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, l0),
                (rq[xA(0x659)] = 0xa),
                (rq[xA(0x4b9)] = this[xA(0x219)](ru[0x1])),
                rq[xA(0x4b4)](),
                (rq[xA(0x9f0)] = this[xA(0x219)](ru[0x0])),
                rq[xA(0x8ab)](),
                rq[xA(0x64c)](),
                rq[xA(0x1e7)](),
                rq[xA(0x7f5)]();
              const rC = [-0x1e, -0x5, 0x16];
              for (let sM = 0x0; sM < rC[xA(0x441)]; sM++) {
                const sN = rC[sM];
                rq[xA(0x269)](sN, -0x32),
                  rq[xA(0x9d9)](sN - 0x14, 0x0, sN, 0x32);
              }
              (rq[xA(0x659)] = 0xe),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                rq[xA(0x4b4)](),
                rq[xA(0x6c7)]();
              rB ? this[xA(0xca9)](rq) : this[xA(0x705)](rq);
              rq[xA(0x6c7)]();
              break;
            case cS[xA(0x86c)]:
              (rt = this[xA(0xbab)] / 0x32), rq[xA(0x656)](rt, rt);
              const rD = 0x2f;
              rq[xA(0x7f5)]();
              for (let sO = 0x0; sO < 0x8; sO++) {
                let sP =
                  (0.25 + ((sO % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xA(0xb1f)](sO + this[xA(0x381)] * 1.3) * 0.2;
                sO >= 0x4 && (sP *= -0x1),
                  rq[xA(0x269)](0x0, 0x0),
                  rq[xA(0x83f)](
                    Math[xA(0x3a8)](sP) * rD,
                    Math[xA(0xb1f)](sP) * rD
                  );
              }
              (rq[xA(0x659)] = 0x7),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                (rq[xA(0x5e0)] = xA(0xc28)),
                rq[xA(0x4b4)](),
                (rq[xA(0x9f0)] = rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x6);
              for (let sQ = 0x0; sQ < 0x2; sQ++) {
                const sR = sQ === 0x0 ? 0x1 : -0x1;
                rq[xA(0x64c)](),
                  rq[xA(0x8e8)](0x16, sR * 0xa),
                  rq[xA(0x174)](
                    -(Math[xA(0xb1f)](this[xA(0x381)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      sR
                  ),
                  rq[xA(0x7f5)](),
                  rq[xA(0x269)](0x0, sR * 0x6),
                  rq[xA(0x9d9)](0x14, sR * 0xf, 0x28, 0x0),
                  rq[xA(0x9d9)](0x14, sR * 0x5, 0x0, 0x0),
                  rq[xA(0x326)](),
                  rq[xA(0x8ab)](),
                  rq[xA(0x4b4)](),
                  rq[xA(0x6c7)]();
              }
              (rq[xA(0x659)] = 0x8),
                l9(
                  rq,
                  0x1,
                  0x8,
                  this[xA(0x219)](xA(0x2ae)),
                  this[xA(0x219)](xA(0x736))
                );
              let rE;
              (rE = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rq[xA(0x7f5)]();
              for (let sS = 0x0; sS < rE[xA(0x441)]; sS++) {
                const [sT, sU] = rE[sS];
                rq[xA(0x269)](sT, -sU),
                  rq[xA(0x9d9)](sT + Math[xA(0xa35)](sT) * 4.2, 0x0, sT, sU);
              }
              (rq[xA(0x5e0)] = xA(0xc28)),
                rq[xA(0x4b4)](),
                rq[xA(0x8e8)](-0x21, 0x0),
                l9(
                  rq,
                  0.45,
                  0x8,
                  this[xA(0x219)](xA(0xbc0)),
                  this[xA(0x219)](xA(0x4b7))
                ),
                rq[xA(0x7f5)](),
                (rE = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let sV = 0x0; sV < rE[xA(0x441)]; sV++) {
                const [sW, sX] = rE[sV];
                rq[xA(0x269)](sW, -sX), rq[xA(0x9d9)](sW - 0x3, 0x0, sW, sX);
              }
              (rq[xA(0x659)] = 0x5),
                (rq[xA(0x5e0)] = xA(0xc28)),
                rq[xA(0x4b4)](),
                rq[xA(0x8e8)](0x11, 0x0),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x0, -0x9),
                rq[xA(0x83f)](0x0, 0x9),
                rq[xA(0x83f)](0xb, 0x0),
                rq[xA(0x326)](),
                (rq[xA(0x60f)] = rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x6),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0xa4d))),
                rq[xA(0x8ab)](),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0xd2d)]:
              this[xA(0x823)](rq, xA(0x183), xA(0x44d), xA(0x1a8));
              break;
            case cS[xA(0x951)]:
              this[xA(0x823)](rq, xA(0xcdc), xA(0x876), xA(0xe07));
              break;
            case cS[xA(0x91e)]:
              this[xA(0x823)](rq, xA(0x411), xA(0xa82), xA(0x1a8));
              break;
            case cS[xA(0x1f3)]:
              (rt = this[xA(0xbab)] / 0x46),
                rq[xA(0x90b)](rt),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x9e3))),
                rq[xA(0x8ab)](lc),
                rq[xA(0x1e7)](lc),
                (rq[xA(0x659)] = 0xf),
                (rq[xA(0x4b9)] = xA(0xd9b)),
                rq[xA(0x4b4)](lc),
                (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x7),
                (rq[xA(0x4b9)] = xA(0x417)),
                rq[xA(0x4b4)](ld);
              break;
            case cS[xA(0x73d)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x28),
                this[xA(0xda6)](rq, 0x32, 0x1e, 0x7);
              break;
            case cS[xA(0x289)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x64),
                this[xA(0xda6)](rq),
                (rq[xA(0x9f0)] = rq[xA(0x4b9)]);
              const rF = 0x6,
                rG = 0x3;
              rq[xA(0x7f5)]();
              for (let sY = 0x0; sY < rF; sY++) {
                const sZ = (sY / rF) * Math["PI"] * 0x2;
                rq[xA(0x64c)](), rq[xA(0x174)](sZ);
                for (let t0 = 0x0; t0 < rG; t0++) {
                  const t1 = t0 / rG,
                    t2 = 0x12 + t1 * 0x44,
                    t3 = 0x7 + t1 * 0x6;
                  rq[xA(0x269)](t2, 0x0),
                    rq[xA(0x5b3)](t2, 0x0, t3, 0x0, Math["PI"] * 0x2);
                }
                rq[xA(0x6c7)]();
              }
              rq[xA(0x8ab)]();
              break;
            case cS[xA(0x143)]:
              (rt = this[xA(0xbab)] / 0x31),
                rq[xA(0x90b)](rt),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                (rv = this[xA(0x381)] * 0x15e);
              const rH = (Math[xA(0xb1f)](rv * 0.01) * 0.5 + 0.5) * 0.1;
              (rq[xA(0x4b9)] = rq[xA(0x9f0)] = this[xA(0x219)](xA(0x204))),
                (rq[xA(0x659)] = 0x3);
              for (let t4 = 0x0; t4 < 0x2; t4++) {
                rq[xA(0x64c)]();
                const t5 = t4 * 0x2 - 0x1;
                rq[xA(0x656)](0x1, t5),
                  rq[xA(0x8e8)](0x1c, -0x27),
                  rq[xA(0x656)](1.5, 1.5),
                  rq[xA(0x174)](rH),
                  rq[xA(0x7f5)](),
                  rq[xA(0x269)](0x0, 0x0),
                  rq[xA(0x9d9)](0xc, -0x8, 0x14, 0x3),
                  rq[xA(0x83f)](0xb, 0x1),
                  rq[xA(0x83f)](0x11, 0x9),
                  rq[xA(0x9d9)](0xc, 0x5, 0x0, 0x6),
                  rq[xA(0x326)](),
                  rq[xA(0x4b4)](),
                  rq[xA(0x8ab)](),
                  rq[xA(0x6c7)]();
              }
              rq[xA(0x7f5)]();
              for (let t6 = 0x0; t6 < 0x2; t6++) {
                for (let t7 = 0x0; t7 < 0x4; t7++) {
                  const t8 = t6 * 0x2 - 0x1,
                    t9 =
                      (Math[xA(0xb1f)](rv * 0.005 + t6 + t7 * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rq[xA(0x64c)](),
                    rq[xA(0x656)](0x1, t8),
                    rq[xA(0x8e8)]((t7 / 0x3) * 0x1e - 0xf, 0x28);
                  const ta = t7 < 0x2 ? 0x1 : -0x1;
                  rq[xA(0x174)](t9 * ta),
                    rq[xA(0x269)](0x0, 0x0),
                    rq[xA(0x8e8)](0x0, 0x19),
                    rq[xA(0x83f)](0x0, 0x0),
                    rq[xA(0x174)](ta * 0.7 * (t9 + 0.3)),
                    rq[xA(0x83f)](0x0, 0xa),
                    rq[xA(0x6c7)]();
                }
              }
              (rq[xA(0x659)] = 0xa),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x2, 0x17),
                rq[xA(0x9d9)](0x17, 0x0, 0x2, -0x17),
                rq[xA(0x83f)](-0xa, -0xf),
                rq[xA(0x83f)](-0xa, 0xf),
                rq[xA(0x326)](),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x7a8))),
                (rq[xA(0x659)] = 0x44),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                rq[xA(0x4b4)](),
                (rq[xA(0x659)] -= 0x12),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xb10))),
                rq[xA(0x4b4)](),
                (rq[xA(0x4b9)] = xA(0xbf4)),
                rq[xA(0x7f5)]();
              const rI = 0x12;
              for (let tb = 0x0; tb < 0x2; tb++) {
                rq[xA(0x269)](-0x12, rI),
                  rq[xA(0x9d9)](0x0, -0x7 + rI, 0x12, rI),
                  rq[xA(0x656)](0x1, -0x1);
              }
              (rq[xA(0x659)] = 0x9), rq[xA(0x4b4)]();
              break;
            case cS[xA(0xd57)]:
              (rt = this[xA(0xbab)] / 0x50),
                rq[xA(0x90b)](rt),
                rq[xA(0x174)](
                  ((Date[xA(0xe04)]() / 0x7d0) % l0) + this[xA(0x381)] * 0.4
                );
              const rJ = 0x5;
              !this[xA(0x7f9)] &&
                (this[xA(0x7f9)] = Array(rJ)[xA(0x8ab)](0x64));
              const rK = this[xA(0x7f9)],
                rL = this[xA(0x427)]
                  ? 0x0
                  : Math[xA(0x508)](this[xA(0xa4f)] * (rJ - 0x1));
              rq[xA(0x7f5)]();
              for (let tc = 0x0; tc < rJ; tc++) {
                const td = ((tc + 0.5) / rJ) * Math["PI"] * 0x2,
                  te = ((tc + 0x1) / rJ) * Math["PI"] * 0x2;
                rK[tc] += ((tc < rL ? 0x64 : 0x3c) - rK[tc]) * 0.2;
                const tf = rK[tc];
                if (tc === 0x0) rq[xA(0x269)](tf, 0x0);
                rq[xA(0x9d9)](
                  Math[xA(0x3a8)](td) * 0x5,
                  Math[xA(0xb1f)](td) * 0x5,
                  Math[xA(0x3a8)](te) * tf,
                  Math[xA(0xb1f)](te) * tf
                );
              }
              rq[xA(0x326)](),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x1c + 0xa),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xc6d))),
                rq[xA(0x4b4)](),
                (rq[xA(0x659)] = 0x10 + 0xa),
                (rq[xA(0x4b9)] = rq[xA(0x9f0)] = this[xA(0x219)](xA(0x72c))),
                rq[xA(0x8ab)](),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)]();
              for (let tg = 0x0; tg < rJ; tg++) {
                const th = (tg / rJ) * Math["PI"] * 0x2;
                rq[xA(0x64c)](), rq[xA(0x174)](th);
                const ti = rK[tg] / 0x64;
                let tj = 0x1a;
                const tk = 0x4;
                for (let tl = 0x0; tl < tk; tl++) {
                  const tm = (0x1 - (tl / tk) * 0.7) * 0xc * ti;
                  rq[xA(0x269)](tj, 0x0),
                    rq[xA(0x5b3)](tj, 0x0, tm, 0x0, Math["PI"] * 0x2),
                    (tj += tm * 0x2 + 3.5 * ti);
                }
                rq[xA(0x6c7)]();
              }
              (rq[xA(0x9f0)] = xA(0x62c)), rq[xA(0x8ab)]();
              break;
            case cS[xA(0xb19)]:
              (rt = this[xA(0xbab)] / 0x1e),
                rq[xA(0x90b)](rt),
                rq[xA(0x8e8)](-0x22, 0x0),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x0, -0x8),
                rq[xA(0x9d9)](0x9b, 0x0, 0x0, 0x8),
                rq[xA(0x326)](),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x1a),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xc6d))),
                rq[xA(0x4b4)](),
                (rq[xA(0x659)] = 0x10),
                (rq[xA(0x4b9)] = rq[xA(0x9f0)] = this[xA(0x219)](xA(0x72c))),
                rq[xA(0x8ab)](),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)]();
              let rM = 0xd;
              for (let tn = 0x0; tn < 0x4; tn++) {
                const to = (0x1 - (tn / 0x4) * 0.7) * 0xa;
                rq[xA(0x269)](rM, 0x0),
                  rq[xA(0x5b3)](rM, 0x0, to, 0x0, Math["PI"] * 0x2),
                  (rM += to * 0x2 + 0x4);
              }
              (rq[xA(0x9f0)] = xA(0x62c)), rq[xA(0x8ab)]();
              break;
            case cS[xA(0x9bd)]:
              (rt = this[xA(0xbab)] / 0x64),
                rq[xA(0x656)](rt, rt),
                (rq[xA(0x60f)] = rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x4b9)] = xA(0x1be)),
                (rq[xA(0x659)] = 0x14);
              const rN = [0x1, 0.63, 0.28],
                rO = this[xA(0xd79)] ? lo : [xA(0xcbc), xA(0x9b5), xA(0x46d)],
                rP = (pz * 0.005) % l0;
              for (let tp = 0x0; tp < 0x3; tp++) {
                const tq = rN[tp],
                  tr = rO[tp];
                rq[xA(0x64c)](),
                  rq[xA(0x174)](rP * (tp % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rq[xA(0x7f5)]();
                const ts = 0x7 - tp;
                for (let tu = 0x0; tu < ts; tu++) {
                  const tv = (Math["PI"] * 0x2 * tu) / ts;
                  rq[xA(0x83f)](
                    Math[xA(0x3a8)](tv) * tq * 0x64,
                    Math[xA(0xb1f)](tv) * tq * 0x64
                  );
                }
                rq[xA(0x326)](),
                  (rq[xA(0x4b9)] = rq[xA(0x9f0)] = this[xA(0x219)](tr)),
                  rq[xA(0x8ab)](),
                  rq[xA(0x4b4)](),
                  rq[xA(0x6c7)]();
              }
              break;
            case cS[xA(0xc8c)]:
              (rt = this[xA(0xbab)] / 0x41),
                rq[xA(0x656)](rt, rt),
                (rv = this[xA(0x381)] * 0x2),
                rq[xA(0x174)](Math["PI"] / 0x2);
              if (this[xA(0xbd0)]) {
                const tw = 0x3;
                rq[xA(0x7f5)]();
                for (let tA = 0x0; tA < 0x2; tA++) {
                  for (let tB = 0x0; tB <= tw; tB++) {
                    const tC = (tB / tw) * 0x50 - 0x28;
                    rq[xA(0x64c)]();
                    const tD = tA * 0x2 - 0x1;
                    rq[xA(0x8e8)](tD * -0x2d, tC);
                    const tE =
                      1.1 + Math[xA(0xb1f)]((tB / tw) * Math["PI"]) * 0.5;
                    rq[xA(0x656)](tE * tD, tE),
                      rq[xA(0x174)](Math[xA(0xb1f)](rv + tB + tD) * 0.3 + 0.3),
                      rq[xA(0x269)](0x0, 0x0),
                      rq[xA(0x9d9)](-0xf, -0x5, -0x14, 0xa),
                      rq[xA(0x6c7)]();
                  }
                }
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                  (rq[xA(0x659)] = 0x8),
                  (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                  rq[xA(0x4b4)](),
                  (rq[xA(0x659)] = 0xc);
                const tx = Date[xA(0xe04)]() * 0.01,
                  ty = Math[xA(0xb1f)](tx * 0.5) * 0.5 + 0.5,
                  tz = ty * 0.1 + 0x1;
                rq[xA(0x7f5)](),
                  rq[xA(0x5b3)](-0xf * tz, 0x2b - ty, 0x10, 0x0, Math["PI"]),
                  rq[xA(0x5b3)](0xf * tz, 0x2b - ty, 0x10, 0x0, Math["PI"]),
                  rq[xA(0x269)](-0x16, -0x2b),
                  rq[xA(0x5b3)](0x0, -0x2b - ty, 0x16, 0x0, Math["PI"], !![]),
                  (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x4c0))),
                  rq[xA(0x4b4)](),
                  (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x877))),
                  rq[xA(0x8ab)](),
                  rq[xA(0x64c)](),
                  rq[xA(0x174)]((Math["PI"] * 0x3) / 0x2),
                  this[xA(0x705)](rq, 0x1a - ty, 0x0),
                  rq[xA(0x6c7)]();
              }
              if (!this[xA(0x9fa)]) {
                const tF = dI[d9[xA(0x8c2)]],
                  tG = Math[xA(0x606)](this["id"] % tF[xA(0x441)], 0x0),
                  tH = new lN(-0x1, 0x0, 0x0, tF[tG]["id"]);
                (tH[xA(0x8d1)] = 0x1),
                  (tH[xA(0x694)] = 0x0),
                  (this[xA(0x9fa)] = tH);
              }
              rq[xA(0x90b)](1.3), this[xA(0x9fa)][xA(0xa5a)](rq);
              break;
            case cS[xA(0x39e)]:
              (rt = this[xA(0xbab)] / 0x14),
                rq[xA(0x656)](rt, rt),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x11, 0x0),
                rq[xA(0x83f)](0x0, 0x0),
                rq[xA(0x83f)](0x11, 0x6),
                rq[xA(0x269)](0x0, 0x0),
                rq[xA(0x83f)](0xb, -0x7),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x37c))),
                (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0xc),
                rq[xA(0x4b4)](),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xa67))),
                (rq[xA(0x659)] = 0x6),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x728)]:
              (rt = this[xA(0xbab)] / 0x80),
                rq[xA(0x90b)](rt),
                rq[xA(0x8e8)](-0x80, -0x78),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0xcd9))),
                rq[xA(0x8ab)](f9[xA(0x419)]),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x66f))),
                (rq[xA(0x659)] = 0x14),
                rq[xA(0x4b4)](f9[xA(0x419)]);
              break;
            case cS[xA(0x562)]:
              (rt = this[xA(0xbab)] / 0x19),
                rq[xA(0x656)](rt, rt),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x19, 0x0),
                rq[xA(0x83f)](-0x2d, 0x0),
                (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x14),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0xb38))),
                rq[xA(0x8ab)](),
                (rq[xA(0x659)] = 0x7),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x97b))),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x554)]:
              rq[xA(0x174)](-this[xA(0x694)]),
                rq[xA(0x90b)](this[xA(0xbab)] / 0x14),
                this[xA(0xb39)](rq),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0xb38))),
                rq[xA(0x8ab)](),
                rq[xA(0x1e7)](),
                (rq[xA(0x659)] = 0xc),
                (rq[xA(0x4b9)] = xA(0xbf4)),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x4b3)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x64), this[xA(0xd20)](rq);
              break;
            case cS[xA(0x608)]:
              this[xA(0x1f6)](rq, !![]);
              break;
            case cS[xA(0x4ab)]:
              this[xA(0x1f6)](rq, ![]);
              break;
            case cS[xA(0xd81)]:
              (rt = this[xA(0xbab)] / 0xa),
                rq[xA(0x90b)](rt),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x0, 0x8),
                rq[xA(0x9d9)](2.5, 0x0, 0x0, -0x8),
                (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0xa),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x97b))),
                rq[xA(0x4b4)](),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xb38))),
                (rq[xA(0x659)] = 0x6),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x68d)]:
              (rt = this[xA(0xbab)] / 0xa),
                rq[xA(0x90b)](rt),
                rq[xA(0x8e8)](0x7, 0x0),
                (rq[xA(0x5e0)] = xA(0xc28)),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x5, -0x5),
                rq[xA(0x34a)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rq[xA(0x34a)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x204))),
                rq[xA(0x8ab)](),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x295))),
                (rq[xA(0x659)] = 0x3),
                (rq[xA(0x60f)] = xA(0xc28)),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x454)]:
              (rt = this[xA(0xbab)] / 0x32), rq[xA(0x90b)](rt), rq[xA(0x7f5)]();
              for (let tI = 0x0; tI < 0x9; tI++) {
                const tJ = (tI / 0x9) * Math["PI"] * 0x2,
                  tK =
                    0x3c *
                    (0x1 +
                      Math[xA(0x3a8)]((tI / 0x9) * Math["PI"] * 3.5) * 0.07);
                rq[xA(0x269)](0x0, 0x0),
                  rq[xA(0x83f)](
                    Math[xA(0x3a8)](tJ) * tK,
                    Math[xA(0xb1f)](tJ) * tK
                  );
              }
              (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x10),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0xb38))),
                rq[xA(0x8ab)](),
                (rq[xA(0x659)] = 0x6),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x97b))),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0xaaf)]:
              rq[xA(0x64c)](),
                (rt = this[xA(0xbab)] / 0x28),
                rq[xA(0x656)](rt, rt),
                this[xA(0x23e)](rq),
                (rq[xA(0x9f0)] = this[xA(0x219)](
                  this[xA(0xd79)] ? lh[0x0] : xA(0x60c)
                )),
                (rq[xA(0x4b9)] = xA(0x4db)),
                (rq[xA(0x659)] = 0x10),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rq[xA(0x8ab)](),
                rq[xA(0x64c)](),
                rq[xA(0x1e7)](),
                rq[xA(0x4b4)](),
                rq[xA(0x6c7)](),
                rq[xA(0x6c7)]();
              break;
            case cS[xA(0xbec)]:
            case cS[xA(0x80a)]:
            case cS[xA(0xd7a)]:
            case cS[xA(0x395)]:
            case cS[xA(0xc62)]:
            case cS[xA(0x40f)]:
            case cS[xA(0x252)]:
            case cS[xA(0x4ac)]:
              (rt = this[xA(0xbab)] / 0x14), rq[xA(0x656)](rt, rt);
              const rQ = Math[xA(0xb1f)](this[xA(0x381)] * 1.6),
                rR = this[xA(0xb6b)][xA(0x313)](xA(0xbec)),
                rS = this[xA(0xb6b)][xA(0x313)](xA(0x607)),
                rT = this[xA(0xb6b)][xA(0x313)](xA(0xd7a)),
                rU = this[xA(0xb6b)][xA(0x313)](xA(0xd7a)) ? -0x4 : 0x0;
              (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x6);
              rS && rq[xA(0x8e8)](0x8, 0x0);
              for (let tL = 0x0; tL < 0x2; tL++) {
                const tM = tL === 0x0 ? -0x1 : 0x1;
                rq[xA(0x64c)](), rq[xA(0x174)](tM * (rQ * 0.5 + 0.6) * 0.08);
                const tN = tM * 0x4;
                rq[xA(0x7f5)](),
                  rq[xA(0x269)](0x0, tN),
                  rq[xA(0x9d9)](0xc, 0x6 * tM + tN, 0x18, tN),
                  rq[xA(0x4b4)](),
                  rq[xA(0x6c7)]();
              }
              if (this[xA(0xd79)])
                (rq[xA(0x9f0)] = this[xA(0x219)](lh[0x0])),
                  (rq[xA(0x4b9)] = this[xA(0x219)](lh[0x1]));
              else
                this[xA(0xb6b)][xA(0x321)](xA(0x8d6))
                  ? ((rq[xA(0x9f0)] = this[xA(0x219)](xA(0x4c1))),
                    (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xc83))))
                  : ((rq[xA(0x9f0)] = this[xA(0x219)](xA(0x468))),
                    (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xca7))));
              rq[xA(0x659)] = rS ? 0x9 : 0xc;
              rS &&
                (rq[xA(0x64c)](),
                rq[xA(0x8e8)](-0x18, 0x0),
                rq[xA(0x656)](-0x1, 0x1),
                lF(rq, 0x15, rq[xA(0x9f0)], rq[xA(0x4b9)], rq[xA(0x659)]),
                rq[xA(0x6c7)]());
              !rT &&
                (rq[xA(0x64c)](),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](-0xa, 0x0, rS ? 0x12 : 0xc, 0x0, l0),
                rq[xA(0x8ab)](),
                rq[xA(0x1e7)](),
                rq[xA(0x4b4)](),
                rq[xA(0x6c7)]());
              if (rR || rS) {
                rq[xA(0x64c)](),
                  (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x58b))),
                  (rq[xA(0x89c)] *= 0.5);
                const tO = (Math["PI"] / 0x7) * (rS ? 0.85 : 0x1) + rQ * 0.08;
                for (let tP = 0x0; tP < 0x2; tP++) {
                  const tQ = tP === 0x0 ? -0x1 : 0x1;
                  rq[xA(0x64c)](),
                    rq[xA(0x174)](tQ * tO),
                    rq[xA(0x8e8)](
                      rS ? -0x13 : -0x9,
                      tQ * -0x3 * (rS ? 1.3 : 0x1)
                    ),
                    rq[xA(0x7f5)](),
                    rq[xA(0x688)](
                      0x0,
                      0x0,
                      rS ? 0x14 : 0xe,
                      rS ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      l0
                    ),
                    rq[xA(0x8ab)](),
                    rq[xA(0x6c7)]();
                }
                rq[xA(0x6c7)]();
              }
              rq[xA(0x64c)](),
                rq[xA(0x8e8)](0x4 + rU, 0x0),
                lF(
                  rq,
                  rT ? 0x14 : 12.1,
                  rq[xA(0x9f0)],
                  rq[xA(0x4b9)],
                  rq[xA(0x659)]
                ),
                rq[xA(0x6c7)]();
              break;
            case cS[xA(0x601)]:
              this[xA(0xbdc)](rq, xA(0x29f));
              break;
            case cS[xA(0x3a4)]:
              this[xA(0xbdc)](rq, xA(0xaee));
              break;
            case cS[xA(0x68b)]:
              this[xA(0xbdc)](rq, xA(0xa4d)),
                (rq[xA(0x89c)] *= 0.2),
                lJ(rq, this[xA(0xbab)] * 1.3, 0x4);
              break;
            case cS[xA(0x5ef)]:
            case cS[xA(0xce5)]:
            case cS[xA(0x905)]:
            case cS[xA(0xddf)]:
            case cS[xA(0x75f)]:
            case cS[xA(0x563)]:
              rq[xA(0x64c)](),
                (rt = this[xA(0xbab)] / 0x28),
                rq[xA(0x656)](rt, rt),
                rq[xA(0x7f5)]();
              for (let tR = 0x0; tR < 0x2; tR++) {
                rq[xA(0x64c)](),
                  rq[xA(0x656)](0x1, tR * 0x2 - 0x1),
                  rq[xA(0x8e8)](0x0, 0x23),
                  rq[xA(0x269)](0x9, 0x0),
                  rq[xA(0x83f)](0x5, 0xa),
                  rq[xA(0x83f)](-0x5, 0xa),
                  rq[xA(0x83f)](-0x9, 0x0),
                  rq[xA(0x83f)](0x9, 0x0),
                  rq[xA(0x6c7)]();
              }
              (rq[xA(0x659)] = 0x12),
                (rq[xA(0x60f)] = rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x4b9)] = rq[xA(0x9f0)] = this[xA(0x219)](xA(0x68f))),
                rq[xA(0x8ab)](),
                rq[xA(0x4b4)]();
              let rV;
              if (this[xA(0xb6b)][xA(0x351)](xA(0xb04)) > -0x1)
                rV = [xA(0x8a3), xA(0x80d)];
              else
                this[xA(0xb6b)][xA(0x351)](xA(0x585)) > -0x1
                  ? (rV = [xA(0x877), xA(0x5e2)])
                  : (rV = [xA(0x309), xA(0x5bf)]);
              rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0x28, 0x0, l0),
                (rq[xA(0x9f0)] = this[xA(0x219)](rV[0x0])),
                rq[xA(0x8ab)](),
                (rq[xA(0x659)] = 0x8),
                (rq[xA(0x4b9)] = this[xA(0x219)](rV[0x1])),
                rq[xA(0x4b4)]();
              this[xA(0xb6b)][xA(0x351)](xA(0xc89)) > -0x1 &&
                this[xA(0x705)](rq, -0xf, 0x0, 1.25, 0x4);
              rq[xA(0x6c7)]();
              break;
            case cS[xA(0x898)]:
            case cS[xA(0x6c9)]:
              (rv =
                Math[xA(0xb1f)](
                  Date[xA(0xe04)]() / 0x3e8 + this[xA(0x381)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rt = this[xA(0xbab)] / 0x50),
                rq[xA(0x656)](rt, rt);
              const rW = this[xA(0x5a0)] === cS[xA(0x6c9)];
              rW &&
                (rq[xA(0x64c)](),
                rq[xA(0x656)](0x2, 0x2),
                this[xA(0x23e)](rq),
                rq[xA(0x6c7)]());
              rq[xA(0x174)](-this[xA(0x694)]),
                (rq[xA(0x659)] = 0xa),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (ru = this[xA(0xd79)]
                  ? lh
                  : rW
                  ? [xA(0x5a6), xA(0x892)]
                  : [xA(0x1c6), xA(0xccb)]),
                (rq[xA(0x9f0)] = this[xA(0x219)](ru[0x0])),
                rq[xA(0x8ab)](),
                rq[xA(0x1e7)](),
                (rq[xA(0x4b9)] = this[xA(0x219)](ru[0x1])),
                rq[xA(0x4b4)]();
              const rX = this[xA(0x219)](xA(0xb38)),
                rY = this[xA(0x219)](xA(0x1a8)),
                rZ = (tS = 0x1) => {
                  const xD = xA;
                  rq[xD(0x64c)](),
                    rq[xD(0x656)](tS, 0x1),
                    rq[xD(0x8e8)](0x13 - rv * 0x4, -0x1d + rv * 0x5),
                    rq[xD(0x7f5)](),
                    rq[xD(0x269)](0x0, 0x0),
                    rq[xD(0x34a)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rq[xD(0x9d9)](0x19, 0x5 + rv * 0x2, 0x0, 0x0),
                    rq[xD(0x326)](),
                    (rq[xD(0x659)] = 0x3),
                    rq[xD(0x4b4)](),
                    (rq[xD(0x9f0)] = rX),
                    rq[xD(0x8ab)](),
                    rq[xD(0x1e7)](),
                    rq[xD(0x7f5)](),
                    rq[xD(0x5b3)](
                      0x16 + tS * this[xD(0x3b1)] * 0x10,
                      -0x4 + this[xD(0xd9a)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rq[xD(0x9f0)] = rY),
                    rq[xD(0x8ab)](),
                    rq[xD(0x6c7)]();
                };
              rZ(0x1),
                rZ(-0x1),
                rq[xA(0x64c)](),
                rq[xA(0x8e8)](0x0, 0xa),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x28 + rv * 0xa, -0xe + rv * 0x5),
                rq[xA(0x9d9)](0x0, +rv * 0x5, 0x2c - rv * 0xf, -0xe + rv * 0x5),
                rq[xA(0x34a)](
                  0x14,
                  0x28 - rv * 0x14,
                  -0x14,
                  0x28 - rv * 0x14,
                  -0x28 + rv * 0xa,
                  -0xe + rv * 0x5
                ),
                rq[xA(0x326)](),
                (rq[xA(0x659)] = 0x5),
                rq[xA(0x4b4)](),
                (rq[xA(0x9f0)] = rY),
                rq[xA(0x8ab)](),
                rq[xA(0x1e7)]();
              const s0 = rv * 0x2,
                s1 = rv * -0xa;
              rq[xA(0x64c)](),
                rq[xA(0x8e8)](0x0, s1),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x37, -0x8),
                rq[xA(0x34a)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rq[xA(0x4b9)] = rX),
                (rq[xA(0x659)] = 0xd),
                rq[xA(0x4b4)](),
                (rq[xA(0x659)] = 0x4),
                (rq[xA(0x4b9)] = rY),
                rq[xA(0x7f5)]();
              for (let tS = 0x0; tS < 0x6; tS++) {
                const tT = (((tS + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rq[xA(0x269)](tT, 0xa), rq[xA(0x83f)](tT, 0x46);
              }
              rq[xA(0x4b4)](),
                rq[xA(0x6c7)](),
                rq[xA(0x64c)](),
                rq[xA(0x8e8)](0x0, s0),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x32, -0x14),
                rq[xA(0x9d9)](0x0, 0x8, 0x32, -0x12),
                (rq[xA(0x4b9)] = rX),
                (rq[xA(0x659)] = 0xd),
                rq[xA(0x4b4)](),
                (rq[xA(0x659)] = 0x5),
                (rq[xA(0x4b9)] = rY),
                rq[xA(0x7f5)]();
              for (let tU = 0x0; tU < 0x6; tU++) {
                let tV = (((tU + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rq[xA(0x269)](tV, -0x14), rq[xA(0x83f)](tV, 0x2);
              }
              rq[xA(0x4b4)](), rq[xA(0x6c7)](), rq[xA(0x6c7)]();
              const s3 = 0x1 - rv;
              (rq[xA(0x89c)] *= Math[xA(0x606)](0x0, (s3 - 0.3) / 0.7)),
                rq[xA(0x7f5)]();
              for (let tW = 0x0; tW < 0x2; tW++) {
                rq[xA(0x64c)](),
                  tW === 0x1 && rq[xA(0x656)](-0x1, 0x1),
                  rq[xA(0x8e8)](
                    -0x33 + rv * (0xa + tW * 3.4) - tW * 3.4,
                    -0xf + rv * (0x5 - tW * 0x1)
                  ),
                  rq[xA(0x269)](0xa, 0x0),
                  rq[xA(0x5b3)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rq[xA(0x6c7)]();
              }
              rq[xA(0x8e8)](0x0, 0x28),
                rq[xA(0x269)](0x28 - rv * 0xa, -0xe + rv * 0x5),
                rq[xA(0x34a)](
                  0x14,
                  0x14 - rv * 0xa,
                  -0x14,
                  0x14 - rv * 0xa,
                  -0x28 + rv * 0xa,
                  -0xe + rv * 0x5
                ),
                (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x2),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x645)]:
              (rt = this[xA(0xbab)] / 0x14), rq[xA(0x656)](rt, rt);
              const s4 = rq[xA(0x89c)];
              (rq[xA(0x4b9)] = rq[xA(0x9f0)] = this[xA(0x219)](xA(0xb38))),
                (rq[xA(0x89c)] = 0.6 * s4),
                rq[xA(0x7f5)]();
              for (let tX = 0x0; tX < 0xa; tX++) {
                const tY = (tX / 0xa) * Math["PI"] * 0x2;
                rq[xA(0x64c)](),
                  rq[xA(0x174)](tY),
                  rq[xA(0x8e8)](17.5, 0x0),
                  rq[xA(0x269)](0x0, 0x0);
                const tZ = Math[xA(0xb1f)](tY + Date[xA(0xe04)]() / 0x1f4);
                rq[xA(0x174)](tZ * 0.5),
                  rq[xA(0x9d9)](0x4, -0x2 * tZ, 0xe, 0x0),
                  rq[xA(0x6c7)]();
              }
              (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 2.3),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x89c)] = 0.5 * s4),
                rq[xA(0x8ab)](),
                rq[xA(0x1e7)](),
                (rq[xA(0x659)] = 0x3),
                rq[xA(0x4b4)](),
                (rq[xA(0x659)] = 1.2),
                (rq[xA(0x89c)] = 0.6 * s4),
                rq[xA(0x7f5)](),
                (rq[xA(0x5e0)] = xA(0xc28));
              for (let u0 = 0x0; u0 < 0x4; u0++) {
                rq[xA(0x64c)](),
                  rq[xA(0x174)]((u0 / 0x4) * Math["PI"] * 0x2),
                  rq[xA(0x8e8)](0x4, 0x0),
                  rq[xA(0x269)](0x0, -0x2),
                  rq[xA(0x34a)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rq[xA(0x6c7)]();
              }
              rq[xA(0x4b4)]();
              break;
            case cS[xA(0x67e)]:
              this[xA(0x67e)](rq);
              break;
            case cS[xA(0x154)]:
              this[xA(0x67e)](rq, !![]);
              break;
            case cS[xA(0x63a)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x32),
                (rq[xA(0x659)] = 0x19),
                (rq[xA(0x60f)] = xA(0xc28));
              const s5 = this[xA(0x837)]
                ? 0.6
                : (Date[xA(0xe04)]() / 0x4b0) % 6.28;
              for (let u1 = 0x0; u1 < 0xa; u1++) {
                const u2 = 0x1 - u1 / 0xa,
                  u3 =
                    u2 *
                    0x50 *
                    (0x1 +
                      (Math[xA(0xb1f)](s5 * 0x3 + u1 * 0.5 + this[xA(0x381)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rq[xA(0x174)](s5),
                  (rq[xA(0x4b9)] = this[xA(0x219)](lg[u1])),
                  rq[xA(0x1cd)](-u3 / 0x2, -u3 / 0x2, u3, u3);
              }
              break;
            case cS[xA(0x932)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x12),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x19, -0xa),
                rq[xA(0x9d9)](0x0, -0x2, 0x19, -0xa),
                rq[xA(0x9d9)](0x1e, 0x0, 0x19, 0xa),
                rq[xA(0x9d9)](0x0, 0x2, -0x19, 0xa),
                rq[xA(0x9d9)](-0x1e, 0x0, -0x19, -0xa),
                rq[xA(0x326)](),
                (rq[xA(0x60f)] = xA(0xc28)),
                (rq[xA(0x659)] = 0x4),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x3c8))),
                rq[xA(0x4b4)](),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x922))),
                rq[xA(0x8ab)](),
                rq[xA(0x1e7)](),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x19, -0xa),
                rq[xA(0x9d9)](0x14, 0x0, 0x19, 0xa),
                rq[xA(0x83f)](0x28, 0xa),
                rq[xA(0x83f)](0x28, -0xa),
                (rq[xA(0x9f0)] = xA(0x4db)),
                rq[xA(0x8ab)](),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x0, -0xa),
                rq[xA(0x9d9)](-0x5, 0x0, 0x0, 0xa),
                (rq[xA(0x659)] = 0xa),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x86f))),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0xa71)]:
              (rt = this[xA(0xbab)] / 0xc),
                rq[xA(0x656)](rt, rt),
                rq[xA(0x174)](-Math["PI"] / 0x6),
                rq[xA(0x8e8)](-0xc, 0x0),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x5, 0x0),
                rq[xA(0x83f)](0x0, 0x0),
                (rq[xA(0x659)] = 0x4),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x935))),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x0, 0x0),
                rq[xA(0x9d9)](0xa, -0x14, 0x1e, 0x0),
                rq[xA(0x9d9)](0xa, 0x14, 0x0, 0x0),
                (rq[xA(0x659)] = 0x6),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0xb70))),
                rq[xA(0x4b4)](),
                rq[xA(0x8ab)](),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x6, 0x0),
                rq[xA(0x9d9)](0xe, -0x2, 0x16, 0x0),
                (rq[xA(0x659)] = 3.5),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x420)]:
              rs(xA(0x420), xA(0x132), xA(0x9d4));
              break;
            case cS[xA(0xb2d)]:
              rs(xA(0xb2d), xA(0x249), xA(0xbce));
              break;
            case cS[xA(0x1e8)]:
              rs(xA(0x1e8), xA(0xb38), xA(0x97b));
              break;
            case cS[xA(0x59f)]:
              rs(xA(0x59f), xA(0xb38), xA(0x97b));
              break;
            case cS[xA(0xd18)]:
              rs(xA(0x59f), xA(0x19f), xA(0x8c8));
              break;
            case cS[xA(0x39b)]:
              const s6 = this[xA(0x837)] ? 0x3c : this[xA(0xbab)] * 0x2;
              rq[xA(0x8e8)](-this[xA(0xbab)] - 0xa, 0x0),
                (rq[xA(0x60f)] = rq[xA(0x5e0)] = xA(0xc28)),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x0, 0x0),
                rq[xA(0x83f)](s6, 0x0),
                (rq[xA(0x659)] = 0x6),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x295))),
                rq[xA(0x8ab)](),
                rq[xA(0x8e8)](s6, 0x0),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0xd, 0x0),
                rq[xA(0x83f)](0x0, -3.5),
                rq[xA(0x83f)](0x0, 3.5),
                rq[xA(0x326)](),
                (rq[xA(0x4b9)] = rq[xA(0x9f0)]),
                rq[xA(0x8ab)](),
                (rq[xA(0x659)] = 0x3),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x30c)]:
              const s7 = this[xA(0xbab)] * 0x2,
                s8 = 0xa;
              rq[xA(0x8e8)](-this[xA(0xbab)], 0x0),
                (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0xceb)] = xA(0x199)),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x0, 0x0),
                rq[xA(0x83f)](-s8 * 1.8, 0x0),
                (rq[xA(0x4b9)] = xA(0x413)),
                (rq[xA(0x659)] = s8 * 1.4),
                rq[xA(0x4b4)](),
                (rq[xA(0x4b9)] = xA(0x76f)),
                (rq[xA(0x659)] *= 0.7),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x0, 0x0),
                rq[xA(0x83f)](-s8 * 0.45, 0x0),
                (rq[xA(0x4b9)] = xA(0x413)),
                (rq[xA(0x659)] = s8 * 0x2 + 3.5),
                rq[xA(0x4b4)](),
                (rq[xA(0x4b9)] = xA(0x5a8)),
                (rq[xA(0x659)] = s8 * 0x2),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, s8, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x9f0)] = xA(0xad4)),
                rq[xA(0x8ab)](),
                (rq[xA(0x4b9)] = xA(0x737)),
                rq[xA(0x7f5)]();
              const s9 = (Date[xA(0xe04)]() * 0.001) % 0x1,
                sa = s9 * s7,
                sb = s7 * 0.2;
              rq[xA(0x269)](Math[xA(0x606)](sa - sb, 0x0), 0x0),
                rq[xA(0x83f)](Math[xA(0xbd3)](sa + sb, s7), 0x0);
              const sc = Math[xA(0xb1f)](s9 * Math["PI"]);
              (rq[xA(0xc1b)] = s8 * 0x3 * sc),
                (rq[xA(0x659)] = s8),
                rq[xA(0x4b4)](),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x0, 0x0),
                rq[xA(0x83f)](s7, 0x0),
                (rq[xA(0x659)] = s8),
                (rq[xA(0xc1b)] = s8),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0xb5e)]:
            case cS[xA(0x64f)]:
            case cS[xA(0xb61)]:
            case cS[xA(0x651)]:
            case cS[xA(0x3da)]:
            case cS[xA(0xcf5)]:
              (rt = this[xA(0xbab)] / 0x23), rq[xA(0x90b)](rt), rq[xA(0x7f5)]();
              this[xA(0x5a0)] !== cS[xA(0x64f)] &&
              this[xA(0x5a0)] !== cS[xA(0x3da)]
                ? rq[xA(0x688)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, l0)
                : rq[xA(0x5b3)](0x0, 0x0, 0x23, 0x0, l0);
              (ru = lr[this[xA(0x5a0)]] || [xA(0x529), xA(0xc56)]),
                (rq[xA(0x9f0)] = this[xA(0x219)](ru[0x0])),
                rq[xA(0x8ab)](),
                (rq[xA(0x4b9)] = this[xA(0x219)](ru[0x1])),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x6ae)]:
              (rq[xA(0x659)] = 0x4),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0x6f9)),
                rs(xA(0x6ae), xA(0x4f0), xA(0x5ff));
              break;
            case cS[xA(0xbaf)]:
              rs(xA(0xbaf), xA(0xb38), xA(0x97b));
              break;
            case cS[xA(0xd16)]:
              (rt = this[xA(0xbab)] / 0x14), rq[xA(0x656)](rt, rt);
              !this[xA(0x837)] && rq[xA(0x174)]((pz / 0x64) % 6.28);
              rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rq[xA(0x9d9)](0x0, 0xc, 0x14, 0x0),
                rq[xA(0x326)](),
                (rq[xA(0x60f)] = rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] *= 0.7),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0xb38))),
                rq[xA(0x8ab)](),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x97b))),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x5b1)]:
              (rq[xA(0x659)] *= 0.7),
                rs(xA(0x5b1), xA(0xca1), xA(0x86a)),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0.6, 0x0, l0),
                (rq[xA(0x9f0)] = xA(0x6ee)),
                rq[xA(0x8ab)]();
              break;
            case cS[xA(0xb2b)]:
              (rq[xA(0x659)] *= 0.8), rs(xA(0xb2b), xA(0x9b5), xA(0x4ba));
              break;
            case cS[xA(0xd7f)]:
              (rt = this[xA(0xbab)] / 0xa), rq[xA(0x656)](rt, rt);
              if (!this[xA(0x3aa)] || pz - this[xA(0x6c1)] > 0x14) {
                this[xA(0x6c1)] = pz;
                const u4 = new Path2D();
                for (let u5 = 0x0; u5 < 0xa; u5++) {
                  const u6 = (Math[xA(0x9e1)]() * 0x2 - 0x1) * 0x7,
                    u7 = (Math[xA(0x9e1)]() * 0x2 - 0x1) * 0x7;
                  u4[xA(0x269)](u6, u7), u4[xA(0x5b3)](u6, u7, 0x5, 0x0, l0);
                }
                this[xA(0x3aa)] = u4;
              }
              (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x58b))),
                rq[xA(0x8ab)](this[xA(0x3aa)]);
              break;
            case cS[xA(0x203)]:
            case cS[xA(0x1b6)]:
              (rt = this[xA(0xbab)] / 0x1e),
                rq[xA(0x656)](rt, rt),
                rq[xA(0x7f5)]();
              const sd = 0x1 / 0x3;
              for (let u8 = 0x0; u8 < 0x3; u8++) {
                const u9 = (u8 / 0x3) * Math["PI"] * 0x2;
                rq[xA(0x269)](0x0, 0x0),
                  rq[xA(0x5b3)](0x0, 0x0, 0x1e, u9, u9 + Math["PI"] / 0x3);
              }
              (rq[xA(0x5e0)] = xA(0xc28)),
                (rq[xA(0x659)] = 0xa),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x9f0)] = this[xA(0x219)](
                  this[xA(0x5a0)] === cS[xA(0x203)] ? xA(0x224) : xA(0x982)
                )),
                rq[xA(0x8ab)](),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0x292)]:
              rr(xA(0x79b), xA(0x69c));
              break;
            case cS[xA(0xc9d)]:
              rr(xA(0x534), xA(0xb33));
              break;
            case cS[xA(0x644)]:
            case cS[xA(0x9ea)]:
              rr(xA(0xb38), xA(0x97b));
              break;
            case cS[xA(0xd99)]:
              (rt = this[xA(0xbab)] / 0x14),
                rq[xA(0x656)](rt, rt),
                rq[xA(0x174)](-Math["PI"] / 0x4);
              const se = rq[xA(0x659)];
              (rq[xA(0x659)] *= 1.5),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x14, -0x14 - se),
                rq[xA(0x83f)](-0x14, 0x0),
                rq[xA(0x83f)](0x14, 0x0),
                rq[xA(0x83f)](0x14, 0x14 + se),
                rq[xA(0x174)](Math["PI"] / 0x2),
                rq[xA(0x269)](-0x14, -0x14 - se),
                rq[xA(0x83f)](-0x14, 0x0),
                rq[xA(0x83f)](0x14, 0x0),
                rq[xA(0x83f)](0x14, 0x14 + se),
                (rq[xA(0x5e0)] = rq[xA(0x5e0)] = xA(0x6f9)),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0xa58)]:
              rr(xA(0x8f7), xA(0xae7));
              break;
            case cS[xA(0x3ab)]:
              rr(xA(0x15b), xA(0xa40));
              break;
            case cS[xA(0x303)]:
              rr(xA(0xa3a), xA(0x8e5));
              break;
            case cS[xA(0x917)]:
              (rt = this[xA(0xbab)] / 0x14),
                rq[xA(0x656)](rt, rt),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0x14, 0x0, l0),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x204))),
                rq[xA(0x8ab)](),
                rq[xA(0x1e7)](),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x295))),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0x3b6))),
                rq[xA(0x8ab)]();
              break;
            case cS[xA(0x490)]:
              (rt = this[xA(0xbab)] / 0x14), rq[xA(0x656)](rt, rt);
              const sf = (ua, ub, uc = ![]) => {
                  const xE = xA;
                  (rq[xE(0x5e0)] = xE(0xc28)),
                    (rq[xE(0x4b9)] = this[xE(0x219)](ub)),
                    (rq[xE(0x9f0)] = this[xE(0x219)](ua)),
                    rq[xE(0x7f5)](),
                    rq[xE(0x5b3)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rq[xE(0x4b4)](),
                    rq[xE(0x8ab)]();
                },
                sg = (ua, ub) => {
                  const xF = xA;
                  rq[xF(0x64c)](),
                    rq[xF(0x1e7)](),
                    (rq[xF(0x5e0)] = xF(0xc28)),
                    (rq[xF(0x9f0)] = this[xF(0x219)](ua)),
                    (rq[xF(0x4b9)] = this[xF(0x219)](ub)),
                    rq[xF(0x8ab)](),
                    rq[xF(0x4b4)](),
                    rq[xF(0x6c7)]();
                };
              (rq[xA(0x5e0)] = xA(0xc28)),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                sg(xA(0x204), xA(0x295)),
                rq[xA(0x174)](Math["PI"]),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rq[xA(0x5b3)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rq[xA(0x5b3)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                sg(xA(0xb38), xA(0x97b)),
                rq[xA(0x174)](-Math["PI"]),
                rq[xA(0x7f5)](),
                rq[xA(0x5b3)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                sg(xA(0x204), xA(0x295));
              break;
            case cS[xA(0x6b8)]:
              this[xA(0xb0a)](rq, this[xA(0xbab)]);
              break;
            case cS[xA(0x53d)]:
              (rt = this[xA(0xbab)] / 0x28),
                rq[xA(0x656)](rt, rt),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](-0x1e, -0x1e),
                rq[xA(0x83f)](0x14, 0x0),
                rq[xA(0x83f)](-0x1e, 0x1e),
                rq[xA(0x326)](),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x204))),
                (rq[xA(0x9f0)] = this[xA(0x219)](xA(0xa4d))),
                rq[xA(0x8ab)](),
                (rq[xA(0x659)] = 0x16),
                (rq[xA(0x5e0)] = rq[xA(0x60f)] = xA(0xc28)),
                rq[xA(0x4b4)]();
              break;
            case cS[xA(0xd66)]:
              rq[xA(0x90b)](this[xA(0xbab)] / 0x41),
                rq[xA(0x8e8)](-0xa, 0xa),
                (rq[xA(0x60f)] = rq[xA(0x5e0)] = xA(0xc28)),
                rq[xA(0x64c)](),
                rq[xA(0x7f5)](),
                rq[xA(0x269)](0x1e, 0x0),
                rq[xA(0x8e8)](
                  0x46 -
                    (Math[xA(0xb1f)](
                      Date[xA(0xe04)]() / 0x190 + 0.8 * this[xA(0x381)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rq[xA(0x83f)](0x0, 0x0),
                (rq[xA(0x659)] = 0x2a),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0xa94))),
                rq[xA(0x4b4)](),
                (rq[xA(0x4b9)] = this[xA(0x219)](xA(0x857))),
                (rq[xA(0x659)] -= 0xc),
                rq[xA(0x4b4)](),
                rq[xA(0x7f5)]();
              for (let ua = 0x0; ua < 0x2; ua++) {
                rq[xA(0x269)](0x9, 0x7),
                  rq[xA(0x83f)](0x28, 0x14),
                  rq[xA(0x83f)](0x7, 0x9),
                  rq[xA(0x83f)](0x9, 0x7),
                  rq[xA(0x656)](0x1, -0x1);
              }
              (rq[xA(0x659)] = 0x3),
                (rq[xA(0x9f0)] = rq[xA(0x4b9)] = xA(0xbf5)),
                rq[xA(0x4b4)](),
                rq[xA(0x8ab)](),
                rq[xA(0x6c7)](),
                this[xA(0x718)](rq);
              break;
            case cS[xA(0x8be)]:
              (rt = this[xA(0xbab)] / 0x14), rq[xA(0x656)](rt, rt);
              const sh = (ub = 0x1, uc, ud) => {
                const xG = xA;
                rq[xG(0x64c)](),
                  rq[xG(0x656)](0x1, ub),
                  rq[xG(0x7f5)](),
                  rq[xG(0x439)](-0x64, 0x0, 0x12c, -0x12c),
                  rq[xG(0x1e7)](),
                  rq[xG(0x7f5)](),
                  rq[xG(0x269)](-0x14, 0x0),
                  rq[xG(0x9d9)](-0x12, -0x19, 0x11, -0xf),
                  (rq[xG(0x5e0)] = xG(0xc28)),
                  (rq[xG(0x659)] = 0x16),
                  (rq[xG(0x4b9)] = this[xG(0x219)](ud)),
                  rq[xG(0x4b4)](),
                  (rq[xG(0x659)] = 0xe),
                  (rq[xG(0x4b9)] = this[xG(0x219)](uc)),
                  rq[xG(0x4b4)](),
                  rq[xG(0x6c7)]();
              };
              sh(0x1, xA(0x149), xA(0x1c0)), sh(-0x1, xA(0x164), xA(0x783));
              break;
            default:
              rq[xA(0x7f5)](),
                rq[xA(0x5b3)](0x0, 0x0, this[xA(0xbab)], 0x0, Math["PI"] * 0x2),
                (rq[xA(0x9f0)] = xA(0xbba)),
                rq[xA(0x8ab)](),
                pt(rq, this[xA(0xb6b)], 0x14, xA(0x737), 0x3);
          }
          rq[xA(0x6c7)](), (this[xA(0xb91)] = null);
        }
        [uf(0xb39)](rq, rr) {
          const xH = uf;
          rr = rr || pz / 0x12c + this[xH(0x381)] * 0.3;
          const rs = Math[xH(0xb1f)](rr) * 0.5 + 0.5;
          rq[xH(0x5e0)] = xH(0xc28);
          const rt = 0x4;
          for (let ru = 0x0; ru < 0x2; ru++) {
            rq[xH(0x64c)]();
            if (ru === 0x0) rq[xH(0x7f5)]();
            for (let rv = 0x0; rv < 0x2; rv++) {
              for (let rw = 0x0; rw < rt; rw++) {
                rq[xH(0x64c)](), ru > 0x0 && rq[xH(0x7f5)]();
                const rx = -0.19 - (rw / rt) * Math["PI"] * 0.25;
                rq[xH(0x174)](rx + rs * 0.05), rq[xH(0x269)](0x0, 0x0);
                const ry = Math[xH(0xb1f)](rr + rw);
                rq[xH(0x8e8)](0x1c - (ry * 0.5 + 0.5), 0x0),
                  rq[xH(0x174)](ry * 0.08),
                  rq[xH(0x83f)](0x0, 0x0),
                  rq[xH(0x9d9)](0x0, 0x7, 5.5, 0xe),
                  ru > 0x0 &&
                    ((rq[xH(0x659)] = 6.5),
                    (rq[xH(0x4b9)] =
                      xH(0x1de) + (0x2f + (rw / rt) * 0x14) + "%)"),
                    rq[xH(0x4b4)]()),
                  rq[xH(0x6c7)]();
              }
              rq[xH(0x656)](-0x1, 0x1);
            }
            ru === 0x0 &&
              ((rq[xH(0x659)] = 0x9),
              (rq[xH(0x4b9)] = xH(0x330)),
              rq[xH(0x4b4)]()),
              rq[xH(0x6c7)]();
          }
          rq[xH(0x7f5)](),
            rq[xH(0x688)](
              0x0,
              -0x1e + Math[xH(0xb1f)](rr * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xH(0x4b9)] = xH(0x330)),
            (rq[xH(0x659)] = 5.5),
            rq[xH(0x4b4)](),
            (rq[xH(0xc1b)] = 0x5 + rs * 0x8),
            (rq[xH(0xceb)] = xH(0x13f)),
            (rq[xH(0x4b9)] = rq[xH(0xceb)]),
            (rq[xH(0x659)] = 3.5),
            rq[xH(0x4b4)](),
            (rq[xH(0xc1b)] = 0x0);
        }
        [uf(0xd20)](rq) {
          const xI = uf,
            rr = this[xI(0xd79)] ? ll[xI(0xc3d)] : ll[xI(0x775)],
            rs = Date[xI(0xe04)]() / 0x1f4 + this[xI(0x381)],
            rt = Math[xI(0xb1f)](rs) - 0.5;
          rq[xI(0x5e0)] = rq[xI(0x60f)] = xI(0xc28);
          const ru = 0x46;
          rq[xI(0x64c)](), rq[xI(0x7f5)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            rq[xI(0x64c)]();
            const rw = rv * 0x2 - 0x1;
            rq[xI(0x656)](0x1, rw),
              rq[xI(0x8e8)](0x14, ru),
              rq[xI(0x174)](rt * 0.1),
              rq[xI(0x269)](0x0, 0x0),
              rq[xI(0x83f)](-0xa, 0x32),
              rq[xI(0x9d9)](0x32, 0x32, 0x64, 0x1e),
              rq[xI(0x9d9)](0x32, 0x32, 0x64, 0x1e),
              rq[xI(0x9d9)](0x1e, 0x8c, -0x50, 0x78 - rt * 0x14),
              rq[xI(0x9d9)](
                -0xa + rt * 0xf,
                0x6e - rt * 0xa,
                -0x28,
                0x50 - rt * 0xa
              ),
              rq[xI(0x9d9)](
                -0xa + rt * 0xa,
                0x3c + rt * 0x5,
                -0x3c,
                0x32 - Math[xI(0x606)](0x0, rt) * 0xa
              ),
              rq[xI(0x9d9)](-0xa, 0x14 - rt * 0xa, -0x46, rt * 0xa),
              rq[xI(0x6c7)]();
          }
          (rq[xI(0x9f0)] = this[xI(0x219)](rr[xI(0x649)])),
            rq[xI(0x8ab)](),
            (rq[xI(0x659)] = 0x12),
            (rq[xI(0x4b9)] = xI(0xbf4)),
            rq[xI(0x1e7)](),
            rq[xI(0x4b4)](),
            rq[xI(0x6c7)](),
            rq[xI(0x64c)](),
            rq[xI(0x8e8)](0x50, 0x0),
            rq[xI(0x656)](0x2, 0x2),
            rq[xI(0x7f5)]();
          for (let rx = 0x0; rx < 0x2; rx++) {
            rq[xI(0x656)](0x1, -0x1),
              rq[xI(0x64c)](),
              rq[xI(0x8e8)](0x0, 0xf),
              rq[xI(0x174)]((Math[xI(0xb1f)](rs * 0x2) * 0.5 + 0.5) * 0.08),
              rq[xI(0x269)](0x0, -0x4),
              rq[xI(0x9d9)](0xa, 0x0, 0x14, -0x6),
              rq[xI(0x9d9)](0xf, 0x3, 0x0, 0x5),
              rq[xI(0x6c7)]();
          }
          (rq[xI(0x9f0)] = rq[xI(0x4b9)] = xI(0xbf5)),
            rq[xI(0x8ab)](),
            (rq[xI(0x659)] = 0x6),
            rq[xI(0x4b4)](),
            rq[xI(0x6c7)]();
          for (let ry = 0x0; ry < 0x2; ry++) {
            const rz = ry === 0x0;
            rz && rq[xI(0x7f5)]();
            for (let rA = 0x4; rA >= 0x0; rA--) {
              const rB = rA / 0x5,
                rC = 0x32 - 0x2d * rB;
              !rz && rq[xI(0x7f5)](),
                rq[xI(0x439)](
                  -0x50 - rB * 0x50 - rC / 0x2,
                  -rC / 0x2 +
                    Math[xI(0xb1f)](rB * Math["PI"] * 0x2 + rs * 0x3) *
                      0x8 *
                      rB,
                  rC,
                  rC
                ),
                !rz &&
                  ((rq[xI(0x659)] = 0x14),
                  (rq[xI(0x9f0)] = rq[xI(0x4b9)] =
                    this[xI(0x219)](rr[xI(0x129)][rA])),
                  rq[xI(0x4b4)](),
                  rq[xI(0x8ab)]());
            }
            rz &&
              ((rq[xI(0x659)] = 0x22),
              (rq[xI(0x4b9)] = this[xI(0x219)](rr[xI(0x172)])),
              rq[xI(0x4b4)]());
          }
          rq[xI(0x7f5)](),
            rq[xI(0x5b3)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xI(0x9f0)] = this[xI(0x219)](rr[xI(0x4f6)])),
            rq[xI(0x8ab)](),
            (rq[xI(0x659)] = 0x24),
            (rq[xI(0x4b9)] = xI(0x899)),
            rq[xI(0x64c)](),
            rq[xI(0x1e7)](),
            rq[xI(0x4b4)](),
            rq[xI(0x6c7)](),
            rq[xI(0x64c)]();
          for (let rD = 0x0; rD < 0x2; rD++) {
            rq[xI(0x7f5)]();
            for (let rE = 0x0; rE < 0x2; rE++) {
              rq[xI(0x64c)]();
              const rF = rE * 0x2 - 0x1;
              rq[xI(0x656)](0x1, rF),
                rq[xI(0x8e8)](0x14, ru),
                rq[xI(0x174)](rt * 0.1),
                rq[xI(0x269)](0x0, 0xa),
                rq[xI(0x83f)](-0xa, 0x32),
                rq[xI(0x9d9)](0x32, 0x32, 0x64, 0x1e),
                rq[xI(0x9d9)](0x32, 0x32, 0x64, 0x1e),
                rq[xI(0x9d9)](0x1e, 0x8c, -0x50, 0x78 - rt * 0x14),
                rq[xI(0x269)](0x64, 0x1e),
                rq[xI(0x9d9)](0x23, 0x5a, -0x28, 0x50 - rt * 0xa),
                rq[xI(0x269)](-0xa, 0x32),
                rq[xI(0x9d9)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[xI(0x606)](0x0, rt) * 0xa
                ),
                rq[xI(0x6c7)]();
            }
            rD === 0x0
              ? ((rq[xI(0x659)] = 0x10),
                (rq[xI(0x4b9)] = this[xI(0x219)](rr[xI(0x24b)])))
              : ((rq[xI(0x659)] = 0xa),
                (rq[xI(0x4b9)] = this[xI(0x219)](rr[xI(0x361)]))),
              rq[xI(0x4b4)]();
          }
          rq[xI(0x6c7)]();
        }
        [uf(0x823)](rq, rr, rs, rt) {
          const xJ = uf;
          rq[xJ(0x64c)]();
          const ru = this[xJ(0xbab)] / 0x28;
          rq[xJ(0x656)](ru, ru),
            (rr = this[xJ(0x219)](rr)),
            (rs = this[xJ(0x219)](rs)),
            (rt = this[xJ(0x219)](rt));
          const rv = Math["PI"] / 0x5;
          rq[xJ(0x5e0)] = rq[xJ(0x60f)] = xJ(0xc28);
          const rw = Math[xJ(0xb1f)](
              Date[xJ(0xe04)]() / 0x12c + this[xJ(0x381)] * 0.2
            ),
            rx = rw * 0.3 + 0.7;
          rq[xJ(0x7f5)](),
            rq[xJ(0x5b3)](0x16, 0x0, 0x17, 0x0, l0),
            rq[xJ(0x269)](0x0, 0x0),
            rq[xJ(0x5b3)](-0x5, 0x0, 0x21, 0x0, l0),
            (rq[xJ(0x9f0)] = this[xJ(0x219)](xJ(0x1a8))),
            rq[xJ(0x8ab)](),
            rq[xJ(0x64c)](),
            rq[xJ(0x8e8)](0x12, 0x0);
          for (let rA = 0x0; rA < 0x2; rA++) {
            rq[xJ(0x64c)](),
              rq[xJ(0x656)](0x1, rA * 0x2 - 0x1),
              rq[xJ(0x174)](Math["PI"] * 0.08 * rx),
              rq[xJ(0x8e8)](-0x12, 0x0),
              rq[xJ(0x7f5)](),
              rq[xJ(0x5b3)](0x0, 0x0, 0x28, Math["PI"], -rv),
              rq[xJ(0x9d9)](0x14 - rx * 0x3, -0xf, 0x14, 0x0),
              rq[xJ(0x326)](),
              (rq[xJ(0x9f0)] = rr),
              rq[xJ(0x8ab)]();
            const rB = xJ(0x5f5) + rA;
            if (!this[rB]) {
              const rC = new Path2D();
              for (let rD = 0x0; rD < 0x2; rD++) {
                const rE = (Math[xJ(0x9e1)]() * 0x2 - 0x1) * 0x28,
                  rF = Math[xJ(0x9e1)]() * -0x28,
                  rG = Math[xJ(0x9e1)]() * 0x9 + 0x8;
                rC[xJ(0x269)](rE, rF), rC[xJ(0x5b3)](rE, rF, rG, 0x0, l0);
              }
              this[rB] = rC;
            }
            rq[xJ(0x1e7)](),
              (rq[xJ(0x9f0)] = rt),
              rq[xJ(0x8ab)](this[rB]),
              rq[xJ(0x6c7)](),
              (rq[xJ(0x659)] = 0x7),
              (rq[xJ(0x4b9)] = rs),
              rq[xJ(0x4b4)]();
          }
          rq[xJ(0x6c7)](), rq[xJ(0x64c)]();
          let ry = 0x9;
          rq[xJ(0x8e8)](0x2a, 0x0);
          const rz = Math["PI"] * 0x3 - rw;
          rq[xJ(0x7f5)]();
          for (let rH = 0x0; rH < 0x2; rH++) {
            let rI = 0x0,
              rJ = 0x8;
            rq[xJ(0x269)](rI, rJ);
            for (let rK = 0x0; rK < ry; rK++) {
              const rL = rK / ry,
                rM = rL * rz,
                rN = 0xf * (0x1 - rL),
                rO = Math[xJ(0x3a8)](rM) * rN,
                rP = Math[xJ(0xb1f)](rM) * rN,
                rQ = rI + rO,
                rR = rJ + rP;
              rq[xJ(0x9d9)](
                rI + rO * 0.5 + rP * 0.25,
                rJ + rP * 0.5 - rO * 0.25,
                rQ,
                rR
              ),
                (rI = rQ),
                (rJ = rR);
            }
            rq[xJ(0x656)](0x1, -0x1);
          }
          (rq[xJ(0x5e0)] = rq[xJ(0x60f)] = xJ(0xc28)),
            (rq[xJ(0x659)] = 0x2),
            (rq[xJ(0x4b9)] = rq[xJ(0x9f0)]),
            rq[xJ(0x4b4)](),
            rq[xJ(0x6c7)](),
            rq[xJ(0x6c7)]();
        }
        [uf(0xda6)](rq, rr = 0x64, rs = 0x50, rt = 0x12, ru = 0x8) {
          const xK = uf;
          rq[xK(0x7f5)]();
          const rv = (0x1 / rt) * Math["PI"] * 0x2;
          rq[xK(0x269)](rs, 0x0);
          for (let rw = 0x0; rw < rt; rw++) {
            const rx = rw * rv,
              ry = (rw + 0x1) * rv;
            rq[xK(0x34a)](
              Math[xK(0x3a8)](rx) * rr,
              Math[xK(0xb1f)](rx) * rr,
              Math[xK(0x3a8)](ry) * rr,
              Math[xK(0xb1f)](ry) * rr,
              Math[xK(0x3a8)](ry) * rs,
              Math[xK(0xb1f)](ry) * rs
            );
          }
          (rq[xK(0x9f0)] = this[xK(0x219)](xK(0x437))),
            rq[xK(0x8ab)](),
            (rq[xK(0x659)] = ru),
            (rq[xK(0x5e0)] = rq[xK(0x60f)] = xK(0xc28)),
            (rq[xK(0x4b9)] = this[xK(0x219)](xK(0xd1c))),
            rq[xK(0x4b4)]();
        }
        [uf(0x219)](rq) {
          const xL = uf,
            rr = 0x1 - this[xL(0x2c4)];
          if (
            rr >= 0x1 &&
            this[xL(0xd46)] === 0x0 &&
            !this[xL(0xa41)] &&
            !this[xL(0x809)]
          )
            return rq;
          rq = hA(rq);
          this[xL(0xa41)] &&
            (rq = hy(
              rq,
              [0xff, 0xff, 0xff],
              0.85 + Math[xL(0xb1f)](pz / 0x32) * 0.15
            ));
          this[xL(0xd46)] > 0x0 &&
            (rq = hy(rq, [0x8f, 0x5d, 0xb0], 0x1 - this[xL(0xd46)] * 0.75));
          rq = hy(rq, [0xff, 0x0, 0x0], rr * 0.25 + 0.75);
          if (this[xL(0x809)]) {
            if (!this[xL(0xb91)]) {
              let rs = pz / 0x4;
              if (!isNaN(this["id"])) rs += this["id"];
              this[xL(0xb91)] = lH(rs % 0x168, 0x64, 0x32);
            }
            rq = hy(rq, this[xL(0xb91)], 0.75);
          }
          return pL(rq);
        }
        [uf(0x483)](rq) {
          const xM = uf;
          this[xM(0xb91)] = null;
          if (this[xM(0x427)]) {
            const rr = Math[xM(0xb1f)]((this[xM(0x106)] * Math["PI"]) / 0x2);
            if (!this[xM(0xc1c)]) {
              const rs = 0x1 + rr * 0x1;
              rq[xM(0x656)](rs, rs);
            }
            rq[xM(0x89c)] *= 0x1 - rr;
          }
        }
        [uf(0xca9)](rq, rr = !![], rs = 0x1) {
          const xN = uf;
          rq[xN(0x7f5)](),
            (rs = 0x8 * rs),
            rq[xN(0x269)](0x23, -rs),
            rq[xN(0x9d9)](0x33, -0x2 - rs, 0x3c, -0xc - rs),
            rq[xN(0x83f)](0x23, -rs),
            rq[xN(0x269)](0x23, rs),
            rq[xN(0x9d9)](0x33, 0x2 + rs, 0x3c, 0xc + rs),
            rq[xN(0x83f)](0x23, rs);
          const rt = xN(0x204);
          (rq[xN(0x9f0)] = rq[xN(0x4b9)] =
            rr ? this[xN(0x219)](rt) : xN(0x204)),
            rq[xN(0x8ab)](),
            (rq[xN(0x5e0)] = rq[xN(0x60f)] = xN(0xc28)),
            (rq[xN(0x659)] = 0x4),
            rq[xN(0x4b4)]();
        }
        [uf(0xb0a)](rq, rr, rs = 0x1) {
          const xO = uf,
            rt = (rr / 0x1e) * 1.1;
          rq[xO(0x656)](rt, rt),
            rq[xO(0x7f5)](),
            rq[xO(0x269)](-0x1e, -0x11),
            rq[xO(0x83f)](0x1e, 0x0),
            rq[xO(0x83f)](-0x1e, 0x11),
            rq[xO(0x326)](),
            (rq[xO(0x9f0)] = rq[xO(0x4b9)] = this[xO(0x219)](xO(0x204))),
            rq[xO(0x8ab)](),
            (rq[xO(0x659)] = 0x14 * rs),
            (rq[xO(0x5e0)] = rq[xO(0x60f)] = xO(0xc28)),
            rq[xO(0x4b4)]();
        }
        [uf(0x705)](rq, rr = 0x0, rs = 0x0, rt = 0x1, ru = 0x5) {
          const xP = uf;
          rq[xP(0x64c)](),
            rq[xP(0x8e8)](rr, rs),
            rq[xP(0x656)](rt, rt),
            rq[xP(0x7f5)](),
            rq[xP(0x269)](0x23, -0x8),
            rq[xP(0x9d9)](0x34, -5.5, 0x3c, -0x14),
            rq[xP(0x269)](0x23, 0x8),
            rq[xP(0x9d9)](0x34, 5.5, 0x3c, 0x14),
            (rq[xP(0x9f0)] = rq[xP(0x4b9)] = this[xP(0x219)](xP(0x204))),
            (rq[xP(0x5e0)] = rq[xP(0x60f)] = xP(0xc28)),
            (rq[xP(0x659)] = ru),
            rq[xP(0x4b4)](),
            rq[xP(0x7f5)]();
          const rv = Math["PI"] * 0.165;
          rq[xP(0x688)](0x3c, -0x14, 0x7, 0x9, rv, 0x0, l0),
            rq[xP(0x688)](0x3c, 0x14, 0x7, 0x9, -rv, 0x0, l0),
            rq[xP(0x8ab)](),
            rq[xP(0x6c7)]();
        }
      },
      lH = (rq, rr, rs) => {
        const xQ = uf;
        (rr /= 0x64), (rs /= 0x64);
        const rt = (rw) => (rw + rq / 0x1e) % 0xc,
          ru = rr * Math[xQ(0xbd3)](rs, 0x1 - rs),
          rv = (rw) =>
            rs -
            ru *
              Math[xQ(0x606)](
                -0x1,
                Math[xQ(0xbd3)](
                  rt(rw) - 0x3,
                  Math[xQ(0xbd3)](0x9 - rt(rw), 0x1)
                )
              );
        return [0xff * rv(0x0), 0xff * rv(0x8), 0xff * rv(0x4)];
      };
    function lI(rq) {
      const xR = uf;
      return -(Math[xR(0x3a8)](Math["PI"] * rq) - 0x1) / 0x2;
    }
    function lJ(rq, rr, rs = 0x6, rt = uf(0x737)) {
      const xS = uf,
        ru = rr / 0x64;
      rq[xS(0x656)](ru, ru), rq[xS(0x7f5)]();
      for (let rv = 0x0; rv < 0xc; rv++) {
        rq[xS(0x269)](0x0, 0x0);
        const rw = (rv / 0xc) * Math["PI"] * 0x2;
        rq[xS(0x83f)](Math[xS(0x3a8)](rw) * 0x64, Math[xS(0xb1f)](rw) * 0x64);
      }
      (rq[xS(0x659)] = rs),
        (rq[xS(0x9f0)] = rq[xS(0x4b9)] = rt),
        (rq[xS(0x5e0)] = rq[xS(0x60f)] = xS(0xc28));
      for (let rx = 0x0; rx < 0x5; rx++) {
        const ry = (rx / 0x5) * 0x64 + 0xa;
        lb(rq, 0xc, ry, 0.5, 0.85);
      }
      rq[xS(0x4b4)]();
    }
    var lK = class {
        constructor(rq, rr, rs, rt, ru) {
          const xT = uf;
          (this[xT(0x5a0)] = rq),
            (this["id"] = rr),
            (this["x"] = rs),
            (this["y"] = rt),
            (this[xT(0xbab)] = ru),
            (this[xT(0x694)] = Math[xT(0x9e1)]() * l0),
            (this[xT(0x4e8)] = -0x1),
            (this[xT(0x427)] = ![]),
            (this[xT(0x8d1)] = 0x0),
            (this[xT(0x106)] = 0x0),
            (this[xT(0x3b9)] = !![]),
            (this[xT(0x38a)] = 0x0),
            (this[xT(0x6ed)] = !![]);
        }
        [uf(0x1b9)]() {
          const xU = uf;
          if (this[xU(0x8d1)] < 0x1) {
            this[xU(0x8d1)] += pA / 0xc8;
            if (this[xU(0x8d1)] > 0x1) this[xU(0x8d1)] = 0x1;
          }
          this[xU(0x427)] && (this[xU(0x106)] += pA / 0xc8);
        }
        [uf(0xa5a)](rq) {
          const xV = uf;
          rq[xV(0x64c)](), rq[xV(0x8e8)](this["x"], this["y"]);
          if (this[xV(0x5a0)] === cS[xV(0xcc5)]) {
            rq[xV(0x174)](this[xV(0x694)]);
            const rr = this[xV(0xbab)],
              rs = pq(
                rq,
                xV(0x973) + this[xV(0xbab)],
                rr * 2.2,
                rr * 2.2,
                (ru) => {
                  const xW = xV;
                  ru[xW(0x8e8)](rr * 1.1, rr * 1.1), lJ(ru, rr);
                },
                !![]
              ),
              rt = this[xV(0x8d1)] + this[xV(0x106)] * 0.5;
            (rq[xV(0x89c)] = (0x1 - this[xV(0x106)]) * 0.3),
              rq[xV(0x656)](rt, rt),
              rq[xV(0xda4)](
                rs,
                -rs[xV(0xd7b)] / 0x2,
                -rs[xV(0x5e3)] / 0x2,
                rs[xV(0xd7b)],
                rs[xV(0x5e3)]
              );
          } else {
            if (this[xV(0x5a0)] === cS[xV(0x4fc)]) {
              let ru = this[xV(0x8d1)] + this[xV(0x106)] * 0.5;
              (rq[xV(0x89c)] = 0x1 - this[xV(0x106)]), (rq[xV(0x89c)] *= 0.9);
              const rv =
                0.93 +
                0.07 *
                  (Math[xV(0xb1f)](
                    Date[xV(0xe04)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              ru *= rv;
              const rw = this[xV(0xbab)],
                rx = pq(
                  rq,
                  xV(0x5bb) + this[xV(0xbab)],
                  rw * 2.2,
                  rw * 2.2,
                  (ry) => {
                    const xX = xV;
                    ry[xX(0x8e8)](rw * 1.1, rw * 1.1);
                    const rz = rw / 0x64;
                    ry[xX(0x656)](rz, rz),
                      lE(ry, 0x5c),
                      (ry[xX(0x60f)] = ry[xX(0x5e0)] = xX(0xc28)),
                      (ry[xX(0x659)] = 0x28),
                      (ry[xX(0x4b9)] = xX(0x9a3)),
                      ry[xX(0x4b4)](),
                      (ry[xX(0x9f0)] = xX(0x25d)),
                      (ry[xX(0x4b9)] = xX(0x148)),
                      (ry[xX(0x659)] = 0xe),
                      ry[xX(0x8ab)](),
                      ry[xX(0x4b4)]();
                  },
                  !![]
                );
              rq[xV(0x656)](ru, ru),
                rq[xV(0xda4)](
                  rx,
                  -rx[xV(0xd7b)] / 0x2,
                  -rx[xV(0x5e3)] / 0x2,
                  rx[xV(0xd7b)],
                  rx[xV(0x5e3)]
                );
            } else {
              if (this[xV(0x5a0)] === cS[xV(0x66b)]) {
                rq[xV(0x90b)](this[xV(0xbab)] / 0x32),
                  (rq[xV(0x60f)] = xV(0xc28)),
                  rq[xV(0x64c)](),
                  (this[xV(0x38a)] +=
                    ((this[xV(0x4e8)] >= 0x0 ? 0x1 : -0x1) * pA) / 0x12c),
                  (this[xV(0x38a)] = Math[xV(0xbd3)](
                    0x1,
                    Math[xV(0x606)](0x0, this[xV(0x38a)])
                  ));
                if (this[xV(0x38a)] > 0x0) {
                  rq[xV(0x90b)](this[xV(0x38a)]),
                    (rq[xV(0x89c)] *= this[xV(0x38a)]),
                    (rq[xV(0x659)] = 0.1),
                    (rq[xV(0x4b9)] = rq[xV(0x9f0)] = xV(0x7cc)),
                    (rq[xV(0xcc6)] = xV(0x312)),
                    (rq[xV(0xa3f)] = xV(0x87a) + iA);
                  const rz = xV(0x28a) + (this[xV(0x4e8)] + 0x1);
                  lR(
                    rq,
                    rz,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rz[xV(0x441)] * 0.09),
                    !![]
                  );
                }
                rq[xV(0x6c7)]();
                const ry = this[xV(0x837)]
                  ? 0.6
                  : ((this["id"] + Date[xV(0xe04)]()) / 0x4b0) % 6.28;
                rq[xV(0x64c)]();
                for (let rA = 0x0; rA < 0x8; rA++) {
                  const rB = 0x1 - rA / 0x8,
                    rC = rB * 0x50;
                  rq[xV(0x174)](ry),
                    (rq[xV(0x4b9)] = xV(0x891)),
                    rq[xV(0x7f5)](),
                    rq[xV(0x439)](-rC / 0x2, -rC / 0x2, rC, rC),
                    rq[xV(0x326)](),
                    (rq[xV(0x659)] = 0x28),
                    rq[xV(0x4b4)](),
                    (rq[xV(0x659)] = 0x14),
                    rq[xV(0x4b4)]();
                }
                rq[xV(0x6c7)]();
                if (!this[xV(0xd3c)]) {
                  this[xV(0xd3c)] = [];
                  for (let rD = 0x0; rD < 0x1e; rD++) {
                    this[xV(0xd3c)][xV(0xaba)]({
                      x: Math[xV(0x9e1)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rE = 0x0; rE < this[xV(0xd3c)][xV(0x441)]; rE++) {
                  const rF = this[xV(0xd3c)][rE];
                  (rF["x"] += rF["v"]),
                    rF["x"] > 0x1 &&
                      ((rF["x"] %= 0x1),
                      (rF[xV(0x694)] = Math[xV(0x9e1)]() * 6.28),
                      (rF["v"] = Math[xV(0x9e1)]() * 0.005 + 0.008),
                      (rF["s"] = Math[xV(0x9e1)]() * 0.025 + 0.008)),
                    rq[xV(0x64c)](),
                    (rq[xV(0x89c)] =
                      rF["x"] < 0.2
                        ? rF["x"] / 0.2
                        : rF["x"] > 0.8
                        ? 0x1 - (rF["x"] - 0.8) / 0.2
                        : 0x1),
                    rq[xV(0x656)](0x5a, 0x5a),
                    rq[xV(0x174)](rF[xV(0x694)]),
                    rq[xV(0x8e8)](rF["x"], 0x0),
                    rq[xV(0x7f5)](),
                    rq[xV(0x5b3)](0x0, 0x0, rF["s"], 0x0, Math["PI"] * 0x2),
                    (rq[xV(0x9f0)] = xV(0x7cc)),
                    rq[xV(0x8ab)](),
                    rq[xV(0x6c7)]();
                }
              }
            }
          }
          rq[xV(0x6c7)]();
        }
      },
      lL = 0x0,
      lM = 0x0,
      lN = class extends lK {
        constructor(rq, rr, rs, rt) {
          const xY = uf;
          super(cS[xY(0xda0)], rq, rr, rs, 0x46),
            (this[xY(0x694)] = (Math[xY(0x9e1)]() * 0x2 - 0x1) * 0.2),
            (this[xY(0x34f)] = dC[rt]);
        }
        [uf(0x1b9)]() {
          const xZ = uf;
          if (this[xZ(0x8d1)] < 0x2 || pz - lL < 0x9c4) {
            this[xZ(0x8d1)] += pA / 0x12c;
            return;
          }
          this[xZ(0x427)] && (this[xZ(0x106)] += pA / 0xc8),
            this[xZ(0x54c)] &&
              ((this["x"] = pg(this["x"], this[xZ(0x54c)]["x"], 0xc8)),
              (this["y"] = pg(this["y"], this[xZ(0x54c)]["y"], 0xc8)));
        }
        [uf(0xa5a)](rq) {
          const y0 = uf;
          if (this[y0(0x8d1)] === 0x0) return;
          rq[y0(0x64c)](), rq[y0(0x8e8)](this["x"], this["y"]);
          const rr = y0(0x884) + this[y0(0x34f)]["id"];
          let rs =
            (this[y0(0x704)] || lM < 0x3) &&
            pq(
              rq,
              rr,
              0x78,
              0x78,
              (rv) => {
                const y1 = y0;
                (this[y1(0x704)] = !![]),
                  lM++,
                  rv[y1(0x8e8)](0x3c, 0x3c),
                  (rv[y1(0x5e0)] = rv[y1(0x60f)] = y1(0xc28)),
                  rv[y1(0x7f5)](),
                  rv[y1(0x439)](-0x32, -0x32, 0x64, 0x64),
                  (rv[y1(0x659)] = 0x12),
                  (rv[y1(0x4b9)] = y1(0xb52)),
                  rv[y1(0x4b4)](),
                  (rv[y1(0x659)] = 0x8),
                  (rv[y1(0x9f0)] = hQ[this[y1(0x34f)][y1(0xd26)]]),
                  rv[y1(0x8ab)](),
                  (rv[y1(0x4b9)] = hR[this[y1(0x34f)][y1(0xd26)]]),
                  rv[y1(0x4b4)]();
                const rw = pt(
                  rv,
                  this[y1(0x34f)][y1(0x3ed)],
                  0x12,
                  y1(0x737),
                  0x3,
                  !![]
                );
                rv[y1(0xda4)](
                  rw,
                  -rw[y1(0xd7b)] / 0x2,
                  0x32 - 0xd / 0x2 - rw[y1(0x5e3)],
                  rw[y1(0xd7b)],
                  rw[y1(0x5e3)]
                ),
                  rv[y1(0x64c)](),
                  rv[y1(0x8e8)](
                    0x0 + this[y1(0x34f)][y1(0x53c)],
                    -0x5 + this[y1(0x34f)][y1(0xa25)]
                  ),
                  this[y1(0x34f)][y1(0xa72)](rv),
                  rv[y1(0x6c7)]();
              },
              !![]
            );
          if (!rs) rs = pp[rr];
          rq[y0(0x174)](this[y0(0x694)]);
          const rt = Math[y0(0xbd3)](this[y0(0x8d1)], 0x1),
            ru =
              (this[y0(0xbab)] / 0x64) *
              (0x1 +
                Math[y0(0xb1f)](Date[y0(0xe04)]() / 0xfa + this["id"]) * 0.05) *
              rt *
              (0x1 - this[y0(0x106)]);
          rq[y0(0x656)](ru, ru),
            rq[y0(0x174)](Math["PI"] * lI(0x1 - rt)),
            rs
              ? rq[y0(0xda4)](
                  rs,
                  -rs[y0(0xd7b)] / 0x2,
                  -rs[y0(0x5e3)] / 0x2,
                  rs[y0(0xd7b)],
                  rs[y0(0x5e3)]
                )
              : (rq[y0(0x7f5)](),
                rq[y0(0x439)](-0x3c, -0x3c, 0x78, 0x78),
                (rq[y0(0x9f0)] = hQ[this[y0(0x34f)][y0(0xd26)]]),
                rq[y0(0x8ab)]()),
            rq[y0(0x6c7)]();
        }
      };
    function lO(rq) {
      const y2 = uf;
      rq[y2(0x7f5)](),
        rq[y2(0x269)](0x0, 4.5),
        rq[y2(0x9d9)](3.75, 0x0, 0x0, -4.5),
        rq[y2(0x9d9)](-3.75, 0x0, 0x0, 4.5),
        rq[y2(0x326)](),
        (rq[y2(0x5e0)] = rq[y2(0x60f)] = y2(0xc28)),
        (rq[y2(0x9f0)] = rq[y2(0x4b9)] = y2(0xbf5)),
        (rq[y2(0x659)] = 0x1),
        rq[y2(0x4b4)](),
        rq[y2(0x8ab)](),
        rq[y2(0x1e7)](),
        rq[y2(0x7f5)](),
        rq[y2(0x5b3)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, l0),
        (rq[y2(0x9f0)] = y2(0xad4)),
        rq[y2(0x8ab)]();
    }
    function lP(rq, rr = ![]) {
      const y3 = uf;
      lQ(rq, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lQ(rq, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rr) {
        const rs = Math["PI"] / 0x7;
        rq[y3(0x7f5)](),
          rq[y3(0x5b3)](0x0, 0x0, 23.5, Math["PI"] + rs, Math["PI"] * 0x2 - rs),
          (rq[y3(0x4b9)] = y3(0x1be)),
          (rq[y3(0x659)] = 0x4),
          (rq[y3(0x5e0)] = y3(0xc28)),
          rq[y3(0x4b4)]();
      }
    }
    function lQ(rq, rr, rs) {
      const y4 = uf;
      rq[y4(0x64c)](),
        rq[y4(0x174)](rr),
        rq[y4(0x8e8)](0x0, -23.6),
        rq[y4(0x174)](rs),
        rq[y4(0x7f5)](),
        rq[y4(0x269)](-6.5, 0x1),
        rq[y4(0x83f)](0x0, -0xf),
        rq[y4(0x83f)](6.5, 0x1),
        (rq[y4(0x9f0)] = y4(0xaef)),
        (rq[y4(0x659)] = 3.5),
        rq[y4(0x8ab)](),
        (rq[y4(0x60f)] = y4(0xc28)),
        (rq[y4(0x4b9)] = y4(0x1be)),
        rq[y4(0x4b4)](),
        rq[y4(0x6c7)]();
    }
    function lR(rq, rr, rs, rt, ru, rv, rw = ![]) {
      const y5 = uf;
      var rx = rr[y5(0x441)],
        ry;
      rq[y5(0x64c)](),
        rq[y5(0x8e8)](rs, rt),
        rq[y5(0x174)]((0x1 * rv) / 0x2),
        rq[y5(0x174)]((0x1 * (rv / rx)) / 0x2),
        (rq[y5(0x6f7)] = y5(0x545));
      for (var rz = 0x0; rz < rx; rz++) {
        rq[y5(0x174)](-rv / rx),
          rq[y5(0x64c)](),
          rq[y5(0x8e8)](0x0, ru),
          (ry = rr[rz]),
          rw && rq[y5(0x3ce)](ry, 0x0, 0x0),
          rq[y5(0x3d0)](ry, 0x0, 0x0),
          rq[y5(0x6c7)]();
      }
      rq[y5(0x6c7)]();
    }
    function lS(rq, rr = 0x1) {
      const y6 = uf,
        rs = 0xf;
      rq[y6(0x7f5)]();
      const rt = 0x6;
      for (let ry = 0x0; ry < rt; ry++) {
        const rz = (ry / rt) * Math["PI"] * 0x2;
        rq[y6(0x83f)](Math[y6(0x3a8)](rz) * rs, Math[y6(0xb1f)](rz) * rs);
      }
      rq[y6(0x326)](),
        (rq[y6(0x659)] = 0x4),
        (rq[y6(0x4b9)] = y6(0x4cd)),
        rq[y6(0x4b4)](),
        (rq[y6(0x9f0)] = y6(0xbf8)),
        rq[y6(0x8ab)]();
      const ru = (Math["PI"] * 0x2) / rt,
        rv = Math[y6(0x3a8)](ru) * rs,
        rw = Math[y6(0xb1f)](ru) * rs;
      for (let rA = 0x0; rA < rt; rA++) {
        rq[y6(0x7f5)](),
          rq[y6(0x269)](0x0, 0x0),
          rq[y6(0x83f)](rs, 0x0),
          rq[y6(0x83f)](rv, rw),
          rq[y6(0x326)](),
          (rq[y6(0x9f0)] =
            y6(0x40c) + (0.2 + (((rA + 0x4) % rt) / rt) * 0.35) + ")"),
          rq[y6(0x8ab)](),
          rq[y6(0x174)](ru);
      }
      rq[y6(0x7f5)]();
      const rx = rs * 0.65;
      for (let rB = 0x0; rB < rt; rB++) {
        const rC = (rB / rt) * Math["PI"] * 0x2;
        rq[y6(0x83f)](Math[y6(0x3a8)](rC) * rx, Math[y6(0xb1f)](rC) * rx);
      }
      (rq[y6(0xc1b)] = 0x23 + rr * 0xf),
        (rq[y6(0xceb)] = rq[y6(0x9f0)] = y6(0x521)),
        rq[y6(0x8ab)](),
        rq[y6(0x8ab)](),
        rq[y6(0x8ab)]();
    }
    var lT = class extends lG {
        constructor(rq, rr, rs, rt, ru, rv, rw) {
          const y7 = uf;
          super(rq, cS[y7(0x764)], rr, rs, rt, rw, ru),
            (this[y7(0x78e)] = rv),
            (this[y7(0x5d2)] = 0x0),
            (this[y7(0x42f)] = 0x0),
            (this[y7(0x3b1)] = 0x0),
            (this[y7(0xd9a)] = 0x0),
            (this[y7(0xb0b)] = ""),
            (this[y7(0xc7f)] = 0x0),
            (this[y7(0x318)] = !![]),
            (this[y7(0xb32)] = ![]),
            (this[y7(0xd62)] = ![]),
            (this[y7(0x64e)] = ![]),
            (this[y7(0x91b)] = ![]),
            (this[y7(0x6ff)] = ![]),
            (this[y7(0xa7b)] = !![]),
            (this[y7(0x78c)] = 0x0),
            (this[y7(0xc51)] = 0x0);
        }
        [uf(0x1b9)]() {
          const y8 = uf;
          super[y8(0x1b9)]();
          if (this[y8(0x427)]) (this[y8(0x42f)] = 0x1), (this[y8(0x5d2)] = 0x0);
          else {
            const rq = pA / 0xc8;
            let rr = this[y8(0x78e)];
            if (this[y8(0xb32)] && rr === cY[y8(0x98e)]) rr = cY[y8(0x9d6)];
            (this[y8(0x5d2)] = Math[y8(0xbd3)](
              0x1,
              Math[y8(0x606)](
                0x0,
                this[y8(0x5d2)] + (rr === cY[y8(0x830)] ? rq : -rq)
              )
            )),
              (this[y8(0x42f)] = Math[y8(0xbd3)](
                0x1,
                Math[y8(0x606)](
                  0x0,
                  this[y8(0x42f)] + (rr === cY[y8(0x9d6)] ? rq : -rq)
                )
              )),
              (this[y8(0x78c)] = pg(this[y8(0x78c)], this[y8(0xc51)], 0x64));
          }
        }
        [uf(0xa5a)](rq) {
          const y9 = uf;
          rq[y9(0x64c)](), rq[y9(0x8e8)](this["x"], this["y"]);
          let rr = this[y9(0xbab)] / kZ;
          this[y9(0x427)] &&
            rq[y9(0x174)]((this[y9(0x106)] * Math["PI"]) / 0x4);
          rq[y9(0x656)](rr, rr), this[y9(0x483)](rq);
          this[y9(0x639)] &&
            (rq[y9(0x64c)](),
            rq[y9(0x174)](this[y9(0x694)]),
            rq[y9(0x90b)](this[y9(0xbab)] / 0x28 / rr),
            this[y9(0x23e)](rq),
            rq[y9(0x6c7)]());
          this[y9(0x95a)] &&
            (rq[y9(0x64c)](),
            rq[y9(0x90b)](kZ / 0x12),
            this[y9(0xb39)](rq, pz / 0x12c),
            rq[y9(0x6c7)]());
          const rs = y9(0x1be);
          if (this[y9(0xb76)]) {
            const rC = Date[y9(0xe04)](),
              rD = (Math[y9(0xb1f)](rC / 0x12c) * 0.5 + 0.5) * 0x2;
            rq[y9(0x7f5)](),
              rq[y9(0x269)](0x5, -0x22),
              rq[y9(0x34a)](0x2f, -0x19, 0x14, 0x5, 0x2b - rD, 0x19),
              rq[y9(0x9d9)](0x0, 0x28 + rD * 0.6, -0x2b + rD, 0x19),
              rq[y9(0x34a)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rq[y9(0x9d9)](0x0, -0x23, 0x5, -0x22),
              (rq[y9(0x9f0)] = rs),
              rq[y9(0x8ab)]();
          }
          this[y9(0x6ff)] && lP(rq);
          const rt = this[y9(0x91b)]
            ? [y9(0x1a8), y9(0x204)]
            : this[y9(0xa0b)]
            ? [y9(0xa1c), y9(0x151)]
            : [y9(0x79b), y9(0x69c)];
          (rt[0x0] = this[y9(0x219)](rt[0x0])),
            (rt[0x1] = this[y9(0x219)](rt[0x1]));
          let ru = 2.75;
          !this[y9(0xa0b)] && (ru /= rr);
          (rq[y9(0x9f0)] = rt[0x0]),
            (rq[y9(0x659)] = ru),
            (rq[y9(0x4b9)] = rt[0x1]);
          this[y9(0xa0b)] &&
            (rq[y9(0x7f5)](),
            rq[y9(0x269)](0x0, 0x0),
            rq[y9(0x9d9)](-0x1e, 0xf, -0x1e, 0x1e),
            rq[y9(0x9d9)](0x0, 0x37, 0x1e, 0x1e),
            rq[y9(0x9d9)](0x1e, 0xf, 0x0, 0x0),
            rq[y9(0x8ab)](),
            rq[y9(0x4b4)](),
            rq[y9(0x64c)](),
            (rq[y9(0x9f0)] = rq[y9(0x4b9)]),
            (rq[y9(0xcc6)] = y9(0x312)),
            (rq[y9(0xa3f)] = y9(0xcdb) + iA),
            lR(rq, y9(0x6c6), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rq[y9(0x6c7)]());
          rq[y9(0x7f5)]();
          this[y9(0x1a3)]
            ? !this[y9(0xb76)]
              ? rq[y9(0x439)](-0x19, -0x19, 0x32, 0x32)
              : (rq[y9(0x269)](0x19, 0x19),
                rq[y9(0x83f)](-0x19, 0x19),
                rq[y9(0x83f)](-0x19, -0xa),
                rq[y9(0x83f)](-0xa, -0x19),
                rq[y9(0x83f)](0xa, -0x19),
                rq[y9(0x83f)](0x19, -0xa),
                rq[y9(0x326)]())
            : rq[y9(0x5b3)](0x0, 0x0, kZ, 0x0, l0);
          rq[y9(0x8ab)](), rq[y9(0x4b4)]();
          this[y9(0x373)] &&
            (rq[y9(0x64c)](),
            rq[y9(0x1e7)](),
            rq[y9(0x7f5)](),
            !this[y9(0xb76)] &&
              (rq[y9(0x269)](-0x8, -0x1e),
              rq[y9(0x83f)](0xf, -0x7),
              rq[y9(0x83f)](0x1e, -0x14),
              rq[y9(0x83f)](0x1e, -0x32)),
            rq[y9(0x8e8)](
              0x0,
              0x2 * (0x1 - (this[y9(0x42f)] + this[y9(0x5d2)]))
            ),
            rq[y9(0x269)](-0x2, 0x0),
            rq[y9(0x83f)](-0x3, 4.5),
            rq[y9(0x83f)](0x3, 4.5),
            rq[y9(0x83f)](0x2, 0x0),
            (rq[y9(0x9f0)] = y9(0xbf5)),
            rq[y9(0x8ab)](),
            rq[y9(0x6c7)]());
          this[y9(0xb76)] &&
            (rq[y9(0x7f5)](),
            rq[y9(0x269)](0x0, -0x17),
            rq[y9(0x9d9)](0x4, -0xd, 0x1b, -0x8),
            rq[y9(0x83f)](0x14, -0x1c),
            rq[y9(0x83f)](-0x14, -0x1c),
            rq[y9(0x83f)](-0x1b, -0x8),
            rq[y9(0x9d9)](-0x4, -0xd, 0x0, -0x17),
            (rq[y9(0x9f0)] = rs),
            rq[y9(0x8ab)]());
          if (this[y9(0xd40)]) {
            (rq[y9(0x4b9)] = y9(0x1fd)),
              (rq[y9(0x659)] = 1.4),
              rq[y9(0x7f5)](),
              (rq[y9(0x5e0)] = y9(0xc28));
            const rE = 4.5;
            for (let rF = 0x0; rF < 0x2; rF++) {
              const rG = -0x12 + rF * 0x1d;
              for (let rH = 0x0; rH < 0x3; rH++) {
                const rI = rG + rH * 0x3;
                rq[y9(0x269)](rI, rE + -1.5), rq[y9(0x83f)](rI + 1.6, rE + 1.6);
              }
            }
            rq[y9(0x4b4)]();
          }
          if (this[y9(0xa9e)]) {
            rq[y9(0x7f5)](),
              rq[y9(0x5b3)](0x0, 2.5, 3.3, 0x0, l0),
              (rq[y9(0x9f0)] = y9(0x772)),
              rq[y9(0x8ab)](),
              rq[y9(0x7f5)](),
              rq[y9(0x5b3)](0xd, 2.8, 5.5, 0x0, l0),
              rq[y9(0x5b3)](-0xd, 2.8, 5.5, 0x0, l0),
              (rq[y9(0x9f0)] = y9(0xd07)),
              rq[y9(0x8ab)](),
              rq[y9(0x64c)](),
              rq[y9(0x174)](-Math["PI"] / 0x4),
              rq[y9(0x7f5)]();
            const rJ = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[y9(0x1a3)] &&
              rJ[y9(0xd78)]((rK) => {
                (rK[0x0] *= 1.1), (rK[0x1] *= 1.1);
              });
            for (let rK = 0x0; rK < 0x2; rK++) {
              for (let rL = 0x0; rL < rJ[y9(0x441)]; rL++) {
                const rM = rJ[rL];
                rq[y9(0x269)](rM[0x0], rM[0x1]), rq[y9(0x5b3)](...rM, 0x0, l0);
              }
              rq[y9(0x174)](-Math["PI"] / 0x2);
            }
            (rq[y9(0x9f0)] = y9(0x842)), rq[y9(0x8ab)](), rq[y9(0x6c7)]();
          }
          const rv = this[y9(0x5d2)],
            rw = this[y9(0x42f)],
            rx = 0x6 * rv,
            ry = 0x4 * rw;
          function rz(rN, rO) {
            const ya = y9;
            rq[ya(0x7f5)]();
            const rP = 3.25;
            rq[ya(0x269)](rN - rP, rO - rP),
              rq[ya(0x83f)](rN + rP, rO + rP),
              rq[ya(0x269)](rN + rP, rO - rP),
              rq[ya(0x83f)](rN - rP, rO + rP),
              (rq[ya(0x659)] = 0x2),
              (rq[ya(0x5e0)] = ya(0xc28)),
              (rq[ya(0x4b9)] = ya(0xbf5)),
              rq[ya(0x4b4)](),
              rq[ya(0x326)]();
          }
          function rA(rN, rO) {
            const yb = y9;
            rq[yb(0x64c)](),
              rq[yb(0x8e8)](rN, rO),
              rq[yb(0x7f5)](),
              rq[yb(0x269)](-0x4, 0x0),
              rq[yb(0x9d9)](0x0, 0x6, 0x4, 0x0),
              (rq[yb(0x659)] = 0x2),
              (rq[yb(0x5e0)] = yb(0xc28)),
              (rq[yb(0x4b9)] = yb(0xbf5)),
              rq[yb(0x4b4)](),
              rq[yb(0x6c7)]();
          }
          if (this[y9(0x427)]) rz(0x7, -0x5), rz(-0x7, -0x5);
          else {
            if (this[y9(0x7ea)]) rA(0x7, -0x5), rA(-0x7, -0x5);
            else {
              let rN = function (rP, rQ, rR, rS, rT = 0x0) {
                  const yc = y9,
                    rU = rT ^ 0x1;
                  rq[yc(0x269)](rP - rR, rQ - rS + rT * rx + rU * ry),
                    rq[yc(0x83f)](rP + rR, rQ - rS + rU * rx + rT * ry),
                    rq[yc(0x83f)](rP + rR, rQ + rS),
                    rq[yc(0x83f)](rP - rR, rQ + rS),
                    rq[yc(0x83f)](rP - rR, rQ - rS);
                },
                rO = function (rP = 0x0) {
                  const yd = y9;
                  rq[yd(0x7f5)](),
                    rq[yd(0x688)](0x7, -0x5, 2.5 + rP, 0x6 + rP, 0x0, 0x0, l0),
                    rq[yd(0x269)](-0x7, -0x5),
                    rq[yd(0x688)](-0x7, -0x5, 2.5 + rP, 0x6 + rP, 0x0, 0x0, l0),
                    (rq[yd(0x4b9)] = rq[yd(0x9f0)] = yd(0xbf5)),
                    rq[yd(0x8ab)]();
                };
              rq[y9(0x64c)](),
                rq[y9(0x7f5)](),
                rN(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                rN(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rq[y9(0x1e7)](),
                rO(0.7),
                rO(0x0),
                rq[y9(0x1e7)](),
                rq[y9(0x7f5)](),
                rq[y9(0x5b3)](
                  0x7 + this[y9(0x3b1)] * 0x2,
                  -0x5 + this[y9(0xd9a)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                rq[y9(0x269)](-0x7, -0x5),
                rq[y9(0x5b3)](
                  -0x7 + this[y9(0x3b1)] * 0x2,
                  -0x5 + this[y9(0xd9a)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                (rq[y9(0x9f0)] = y9(0xad4)),
                rq[y9(0x8ab)](),
                rq[y9(0x6c7)]();
            }
          }
          if (this[y9(0x64e)]) {
            rq[y9(0x64c)](), rq[y9(0x8e8)](0x0, -0xc);
            if (this[y9(0x427)]) rq[y9(0x656)](0.7, 0.7), rz(0x0, -0x3);
            else
              this[y9(0x7ea)]
                ? (rq[y9(0x656)](0.7, 0.7), rA(0x0, -0x3))
                : lO(rq);
            rq[y9(0x6c7)]();
          }
          this[y9(0xd62)] &&
            (rq[y9(0x64c)](),
            rq[y9(0x8e8)](0x0, 0xa),
            rq[y9(0x174)](-Math["PI"] / 0x2),
            rq[y9(0x656)](0.82, 0.82),
            this[y9(0xca9)](rq, ![], 0.85),
            rq[y9(0x6c7)]());
          const rB = rv * (-0x5 - 5.5) + rw * (-0x5 - 0x4);
          rq[y9(0x64c)](),
            rq[y9(0x7f5)](),
            rq[y9(0x8e8)](0x0, 9.5),
            rq[y9(0x269)](-5.6, 0x0),
            rq[y9(0x9d9)](0x0, 0x5 + rB, 5.6, 0x0),
            (rq[y9(0x5e0)] = y9(0xc28));
          this[y9(0xa9e)]
            ? ((rq[y9(0x659)] = 0x7),
              (rq[y9(0x4b9)] = y9(0x772)),
              rq[y9(0x4b4)](),
              (rq[y9(0x4b9)] = y9(0x374)))
            : (rq[y9(0x4b9)] = y9(0xbf5));
          (rq[y9(0x659)] = 1.75), rq[y9(0x4b4)](), rq[y9(0x6c7)]();
          if (this[y9(0x482)]) {
            const rP = this[y9(0x5d2)],
              rQ = 0x28,
              rR = Date[y9(0xe04)]() / 0x12c,
              rS = this[y9(0xa0b)] ? 0x0 : Math[y9(0xb1f)](rR) * 0.5 + 0.5,
              rT = rS * 0x4,
              rU = 0x28 - rS * 0x4,
              rV = rU - (this[y9(0xa0b)] ? 0x1 : jf(rP)) * 0x50,
              rW = this[y9(0x373)];
            (rq[y9(0x659)] = 0x9 + ru * 0x2),
              (rq[y9(0x60f)] = y9(0xc28)),
              (rq[y9(0x5e0)] = y9(0xc28));
            for (let rX = 0x0; rX < 0x2; rX++) {
              rq[y9(0x7f5)](), rq[y9(0x64c)]();
              for (let rY = 0x0; rY < 0x2; rY++) {
                rq[y9(0x269)](0x19, 0x0);
                let rZ = rV;
                rW && rY === 0x0 && (rZ = rU),
                  rq[y9(0x9d9)](0x2d + rT, rZ * 0.5, 0xb, rZ),
                  rq[y9(0x656)](-0x1, 0x1);
              }
              rq[y9(0x6c7)](),
                (rq[y9(0x4b9)] = rt[0x1 - rX]),
                rq[y9(0x4b4)](),
                (rq[y9(0x659)] = 0x9);
            }
            rq[y9(0x64c)](),
              rq[y9(0x8e8)](0x0, rV),
              lS(rq, rS),
              rq[y9(0x6c7)]();
          }
          rq[y9(0x6c7)]();
        }
        [uf(0x909)](rq, rr) {}
        [uf(0x9e5)](rq, rr = 0x1) {
          const ye = uf,
            rs = n4[this["id"]];
          if (!rs) return;
          for (let rt = 0x0; rt < rs[ye(0x441)]; rt++) {
            const ru = rs[rt];
            if (ru["t"] > lV + lW) continue;
            !ru["x"] &&
              ((ru["x"] = this["x"]),
              (ru["y"] = this["y"] - this[ye(0xbab)] - 0x44),
              (ru[ye(0x6d7)] = this["x"]),
              (ru[ye(0x77f)] = this["y"]));
            const rv = ru["t"] > lV ? 0x1 - (ru["t"] - lV) / lW : 0x1,
              rw = rv * rv * rv;
            (ru["x"] += (this["x"] - ru[ye(0x6d7)]) * rw),
              (ru["y"] += (this["y"] - ru[ye(0x77f)]) * rw),
              (ru[ye(0x6d7)] = this["x"]),
              (ru[ye(0x77f)] = this["y"]);
            const rx = Math[ye(0xbd3)](0x1, ru["t"] / 0x64);
            rq[ye(0x64c)](),
              (rq[ye(0x89c)] = (rv < 0.7 ? rv / 0.7 : 0x1) * rx * 0.9),
              rq[ye(0x8e8)](ru["x"], ru["y"] - (ru["t"] / lV) * 0x14),
              rq[ye(0x90b)](rr);
            const ry = pt(rq, ru[ye(0x3dd)], 0x10, ye(0x78d), 0x0, !![], ![]);
            rq[ye(0x90b)](rx), rq[ye(0x7f5)]();
            const rz = ry[ye(0xd7b)] + 0xa,
              rA = ry[ye(0x5e3)] + 0xf;
            rq[ye(0x90a)]
              ? rq[ye(0x90a)](-rz / 0x2, -rA / 0x2, rz, rA, 0x5)
              : rq[ye(0x439)](-rz / 0x2, -rA / 0x2, rz, rA),
              (rq[ye(0x9f0)] = ru[ye(0x19c)]),
              rq[ye(0x8ab)](),
              (rq[ye(0x4b9)] = ye(0x78d)),
              (rq[ye(0x659)] = 1.5),
              rq[ye(0x4b4)](),
              rq[ye(0xda4)](
                ry,
                -ry[ye(0xd7b)] / 0x2,
                -ry[ye(0x5e3)] / 0x2,
                ry[ye(0xd7b)],
                ry[ye(0x5e3)]
              ),
              rq[ye(0x6c7)]();
          }
        }
      },
      lU = 0x4e20,
      lV = 0xfa0,
      lW = 0xbb8,
      lX = lV + lW;
    function lY(rq, rr, rs = 0x1) {
      const yf = uf;
      if (rq[yf(0x427)]) return;
      rr[yf(0x64c)](),
        rr[yf(0x8e8)](rq["x"], rq["y"]),
        lZ(rq, rr),
        rr[yf(0x8e8)](0x0, -rq[yf(0xbab)] - 0x19),
        rr[yf(0x64c)](),
        rr[yf(0x90b)](rs),
        rq[yf(0x1a6)] &&
          (pt(rr, "@" + rq[yf(0x1a6)], 0xb, yf(0xb3a), 0x3),
          rr[yf(0x8e8)](0x0, -0x10)),
        rq[yf(0xb0b)] &&
          (pt(rr, rq[yf(0xb0b)], 0x12, yf(0x737), 0x3),
          rr[yf(0x8e8)](0x0, -0x5)),
        rr[yf(0x6c7)](),
        !rq[yf(0xa7b)] &&
          rq[yf(0xaf0)] > 0.001 &&
          ((rr[yf(0x89c)] = rq[yf(0xaf0)]),
          rr[yf(0x656)](rq[yf(0xaf0)] * 0x3, rq[yf(0xaf0)] * 0x3),
          rr[yf(0x7f5)](),
          rr[yf(0x5b3)](0x0, 0x0, 0x14, 0x0, l0),
          (rr[yf(0x9f0)] = yf(0xbf5)),
          rr[yf(0x8ab)](),
          nm(rr, 0.8),
          rr[yf(0x7f5)](),
          rr[yf(0x5b3)](0x0, 0x0, 0x14, 0x0, l0),
          (rr[yf(0x9f0)] = yf(0x9d3)),
          rr[yf(0x8ab)](),
          rr[yf(0x7f5)](),
          rr[yf(0x269)](0x0, 0x0),
          rr[yf(0x5b3)](0x0, 0x0, 0x10, 0x0, l0 * rq[yf(0x886)]),
          rr[yf(0x83f)](0x0, 0x0),
          rr[yf(0x1e7)](),
          nm(rr, 0.8)),
        rr[yf(0x6c7)]();
    }
    function lZ(rq, rr, rs = ![]) {
      const yg = uf;
      if (rq[yg(0x365)] <= 0x0) return;
      rr[yg(0x64c)](),
        (rr[yg(0x89c)] = rq[yg(0x365)]),
        (rr[yg(0x4b9)] = yg(0x1be)),
        rr[yg(0x7f5)]();
      const rt = rs ? 0x8c : rq[yg(0xa7b)] ? 0x4b : 0x64,
        ru = rs ? 0x1a : 0x9;
      if (rs) rr[yg(0x8e8)](rq[yg(0xbab)] + 0x11, 0x0);
      else {
        const rw = Math[yg(0x606)](0x1, rq[yg(0xbab)] / 0x64);
        rr[yg(0x656)](rw, rw),
          rr[yg(0x8e8)](-rt / 0x2, rq[yg(0xbab)] / rw + 0x1b);
      }
      rr[yg(0x7f5)](),
        rr[yg(0x269)](rs ? -0x14 : 0x0, 0x0),
        rr[yg(0x83f)](rt, 0x0),
        (rr[yg(0x5e0)] = yg(0xc28)),
        (rr[yg(0x659)] = ru),
        (rr[yg(0x4b9)] = yg(0x1be)),
        rr[yg(0x4b4)]();
      function rv(rx) {
        const yh = yg;
        rr[yh(0x89c)] = rx < 0.05 ? rx / 0.05 : 0x1;
      }
      rq[yg(0xbfa)] > 0x0 &&
        (rv(rq[yg(0xbfa)]),
        rr[yg(0x7f5)](),
        rr[yg(0x269)](0x0, 0x0),
        rr[yg(0x83f)](rq[yg(0xbfa)] * rt, 0x0),
        (rr[yg(0x659)] = ru * (rs ? 0.55 : 0.44)),
        (rr[yg(0x4b9)] = yg(0x39d)),
        rr[yg(0x4b4)]());
      rq[yg(0xb98)] > 0x0 &&
        (rv(rq[yg(0xb98)]),
        rr[yg(0x7f5)](),
        rr[yg(0x269)](0x0, 0x0),
        rr[yg(0x83f)](rq[yg(0xb98)] * rt, 0x0),
        (rr[yg(0x659)] = ru * (rs ? 0.7 : 0.66)),
        (rr[yg(0x4b9)] = yg(0x682)),
        rr[yg(0x4b4)]());
      rq[yg(0x78c)] &&
        (rv(rq[yg(0x78c)]),
        rr[yg(0x7f5)](),
        rr[yg(0x269)](0x0, 0x0),
        rr[yg(0x83f)](rq[yg(0x78c)] * rt, 0x0),
        (rr[yg(0x659)] = ru * (rs ? 0.45 : 0.35)),
        (rr[yg(0x4b9)] = yg(0xb38)),
        rr[yg(0x4b4)]());
      if (rq[yg(0xa7b)]) {
        rr[yg(0x89c)] = 0x1;
        const rx = pt(
          rr,
          yg(0x671) + (rq[yg(0xc7f)] + 0x1),
          rs ? 0xc : 0xe,
          yg(0x737),
          0x3,
          !![]
        );
        rr[yg(0xda4)](
          rx,
          rt + ru / 0x2 - rx[yg(0xd7b)],
          ru / 0x2,
          rx[yg(0xd7b)],
          rx[yg(0x5e3)]
        );
        if (rs) {
          const ry = pt(rr, "@" + rq[yg(0x1a6)], 0xc, yg(0xb3a), 0x3, !![]);
          rr[yg(0xda4)](
            ry,
            -ru / 0x2,
            -ru / 0x2 - ry[yg(0x5e3)],
            ry[yg(0xd7b)],
            ry[yg(0x5e3)]
          );
        }
      } else {
        rr[yg(0x89c)] = 0x1;
        const rz = kc[rq[yg(0x5a0)]],
          rA = pt(rr, rz, 0xe, yg(0x737), 0x3, !![], rq[yg(0x2b0)]);
        rr[yg(0x64c)](), rr[yg(0x8e8)](0x0, -ru / 0x2 - rA[yg(0x5e3)]);
        rA[yg(0xd7b)] > rt + ru
          ? rr[yg(0xda4)](
              rA,
              rt / 0x2 - rA[yg(0xd7b)] / 0x2,
              0x0,
              rA[yg(0xd7b)],
              rA[yg(0x5e3)]
            )
          : rr[yg(0xda4)](rA, -ru / 0x2, 0x0, rA[yg(0xd7b)], rA[yg(0x5e3)]);
        rr[yg(0x6c7)]();
        const rB = pt(rr, rq[yg(0x2b0)], 0xe, hP[rq[yg(0x2b0)]], 0x3, !![]);
        rr[yg(0xda4)](
          rB,
          rt + ru / 0x2 - rB[yg(0xd7b)],
          ru / 0x2,
          rB[yg(0xd7b)],
          rB[yg(0x5e3)]
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
        rq[yg(0xb0b)] &&
        ((rr[yg(0x89c)] = 0x1),
        rr[yg(0x8e8)](rt / 0x2, 0x0),
        pt(rr, rq[yg(0xb0b)], 0x11, yg(0x737), 0x3)),
        rr[yg(0x6c7)]();
    }
    function m0(rq) {
      const yi = uf;
      for (let rr in op) {
        op[rr][yi(0xc48)](rq);
      }
      oI();
    }
    var m1 = {},
      m2 = document[uf(0x678)](uf(0x863));
    mr(uf(0x92a), uf(0x379), uf(0xc22)),
      mr(uf(0xb59), uf(0x863), uf(0xc8a)),
      mr(uf(0xcca), uf(0x44a), uf(0xc75), () => {
        const yj = uf;
        (hv = ![]), (hD[yj(0xc75)] = fc);
      }),
      mr(uf(0x489), uf(0x768), uf(0xba9)),
      mr(uf(0x383), uf(0x335), uf(0xd14)),
      mr(uf(0xbf3), uf(0x38d), uf(0xb88)),
      mr(uf(0xdda), uf(0xa30), uf(0x5f3)),
      mr(uf(0xdb0), uf(0xcfe), uf(0x61b)),
      mr(uf(0x5ae), uf(0xbd7), uf(0x390)),
      mr(uf(0xde7), uf(0x754), "lb"),
      mr(uf(0xe06), uf(0x9eb), uf(0x971)),
      mr(uf(0x8cd), uf(0x8b6), uf(0x190), () => {
        const yk = uf;
        (m4[yk(0xaf5)][yk(0xd72)] = yk(0xae3)), (hD[yk(0x190)] = m3);
      }),
      mr(uf(0xb51), uf(0x52e), uf(0x7be), () => {
        const yl = uf;
        if (!hW) return;
        il(new Uint8Array([cI[yl(0xbe0)]]));
      });
    var m3 = 0xb,
      m4 = document[uf(0x678)](uf(0xaf8));
    hD[uf(0x190)] == m3 && (m4[uf(0xaf5)][uf(0xd72)] = uf(0xae3));
    var m5 = document[uf(0x678)](uf(0x9a2));
    m5[uf(0xaf5)][uf(0xd72)] = uf(0xae3);
    var m6 = document[uf(0x678)](uf(0x8ac)),
      m7 = document[uf(0x678)](uf(0x90e)),
      m8 = document[uf(0x678)](uf(0x632));
    m8[uf(0x108)] = function () {
      const ym = uf;
      m5[ym(0xaf5)][ym(0xd72)] = ym(0xae3);
    };
    var m9 = ![];
    m7[uf(0x108)] = ng(function (rq) {
      const yn = uf;
      if (!hW || m9 || jy) return;
      const rr = m6[yn(0xcb7)][yn(0xd69)]();
      if (!rr || !eV(rr)) {
        m6[yn(0x30b)][yn(0xcef)](yn(0x570)),
          void m6[yn(0x407)],
          m6[yn(0x30b)][yn(0x5d6)](yn(0x570));
        return;
      }
      (m5[yn(0xaf5)][yn(0xd72)] = ""),
        (m5[yn(0x2d7)] = yn(0x87e)),
        il(
          new Uint8Array([cI[yn(0xc2f)], ...new TextEncoder()[yn(0x8c1)](rr)])
        ),
        (m9 = !![]);
    });
    function ma(rq, rr) {
      const yo = uf;
      if (rq === yo(0x2a8)) {
        const rs = {};
        (rs[yo(0xa20)] = yo(0x159)),
          (rs[yo(0x3ec)] = yo(0x277)),
          (rs[yo(0x493)] = yo(0x277)),
          (rr = new Date(
            rr === 0x0 ? Date[yo(0xe04)]() : rr * 0x3e8 * 0x3c * 0x3c
          )[yo(0x8dc)]("en", rs));
      } else
        rq === yo(0x34d) || rq === yo(0xb81)
          ? (rr = ka(rr * 0x3e8 * 0x3c, !![]))
          : (rr = k9(rr));
      return rr;
    }
    var mb = f2(),
      mc = {},
      md = document[uf(0x678)](uf(0x97a));
    md[uf(0x2d7)] = "";
    for (let rq in mb) {
      const rr = me(rq);
      rr[uf(0xd55)](0x0), md[uf(0x72b)](rr), (mc[rq] = rr);
    }
    function me(rs) {
      const yp = uf,
        rt = nA(yp(0x4a7) + kd(rs) + yp(0x56b)),
        ru = rt[yp(0x678)](yp(0x765));
      return (
        (rt[yp(0xd55)] = function (rv) {
          k8(ru, ma(rs, rv));
        }),
        rt
      );
    }
    var mf;
    function mg(rs, rt, ru, rv, rw, rx, ry) {
      const yq = uf;
      mf && (mf[yq(0x4fb)](), (mf = null));
      const rz = rx[yq(0x441)] / 0x2,
        rA = yq(0xd01)[yq(0x188)](rz),
        rB = nA(
          yq(0xae8) +
            rs +
            yq(0x33c) +
            rA +
            yq(0xd52) +
            rA +
            yq(0xb08) +
            yq(0x307)[yq(0x188)](eL * dH) +
            yq(0x14b) +
            (ru[yq(0x441)] === 0x0 ? yq(0x3fa) : "") +
            yq(0xd39)
        );
      ry && rB[yq(0x72b)](nA(yq(0x43c)));
      mf = rB;
      const rC = rB[yq(0x678)](yq(0x1aa)),
        rD = rB[yq(0x678)](yq(0x63c));
      for (let rP = 0x0; rP < rx[yq(0x441)]; rP++) {
        const rQ = rx[rP];
        if (!rQ) continue;
        const rR = nZ(rQ);
        rR[yq(0x30b)][yq(0xcef)](yq(0x1db)),
          (rR[yq(0x399)] = !![]),
          rR[yq(0xbe4)][yq(0xcef)](),
          (rR[yq(0xbe4)] = null),
          rP < rz
            ? rC[yq(0x806)][rP][yq(0x72b)](rR)
            : rD[yq(0x806)][rP - rz][yq(0x72b)](rR);
      }
      (rB[yq(0x4fb)] = function () {
        const yr = yq;
        (rB[yr(0xaf5)][yr(0x500)] = yr(0x4b1)),
          (rB[yr(0xaf5)][yr(0xd72)] = yr(0xae3)),
          void rB[yr(0x407)],
          (rB[yr(0xaf5)][yr(0xd72)] = ""),
          setTimeout(function () {
            const ys = yr;
            rB[ys(0xcef)]();
          }, 0x3e8);
      }),
        (rB[yq(0x678)](yq(0xafd))[yq(0x108)] = function () {
          const yt = yq;
          rB[yt(0x4fb)]();
        });
      const rE = d4(rw),
        rF = rE[0x0],
        rG = rE[0x1],
        rH = d2(rF + 0x1),
        rI = rw - rG,
        rJ = rB[yq(0x678)](yq(0xb09));
      k8(
        rJ,
        yq(0x9d5) + (rF + 0x1) + yq(0x991) + iJ(rI) + "/" + iJ(rH) + yq(0x10e)
      );
      const rK = Math[yq(0xbd3)](0x1, rI / rH),
        rL = rB[yq(0x678)](yq(0xd4a));
      rL[yq(0xaf5)][yq(0xc8b)] = rK * 0x64 + "%";
      const rM = rB[yq(0x678)](yq(0x97a));
      for (let rS in mb) {
        const rT = me(rS);
        rT[yq(0xd55)](rt[rS]), rM[yq(0x72b)](rT);
      }
      const rN = rB[yq(0x678)](yq(0x1e0));
      ru[yq(0x266)]((rU, rV) => nY(rU[0x0], rV[0x0]));
      for (let rU = 0x0; rU < ru[yq(0x441)]; rU++) {
        const [rV, rW] = ru[rU],
          rX = nZ(rV);
        jY(rX),
          rX[yq(0x30b)][yq(0xcef)](yq(0x1db)),
          (rX[yq(0x399)] = !![]),
          oP(rX[yq(0xbe4)], rW),
          rN[yq(0x72b)](rX);
      }
      if (ru[yq(0x441)] > 0x0) {
        const rY = nA(yq(0x4dd)),
          rZ = {};
        for (let s0 = 0x0; s0 < ru[yq(0x441)]; s0++) {
          const [s1, s2] = ru[s0];
          rZ[s1[yq(0xd26)]] = (rZ[s1[yq(0xd26)]] || 0x0) + s2;
        }
        oo(rY, rZ), rB[yq(0x678)](yq(0x38d))[yq(0x72b)](rY);
      }
      const rO = rB[yq(0x678)](yq(0xafb));
      for (let s3 = 0x0; s3 < rv[yq(0x441)]; s3++) {
        const s4 = rv[s3],
          s5 = nF(s4, !![]);
        s5[yq(0x30b)][yq(0xcef)](yq(0x1db)), (s5[yq(0x399)] = !![]);
        const s6 = rO[yq(0x806)][s4[yq(0xd3e)] * dH + s4[yq(0xd26)]];
        rO[yq(0xc23)](s5, s6), s6[yq(0xcef)]();
      }
      rB[yq(0x30b)][yq(0x5d6)](yq(0x38b)),
        setTimeout(function () {
          const yu = yq;
          rB[yu(0x30b)][yu(0xcef)](yu(0x38b));
        }, 0x0),
        kl[yq(0x72b)](rB);
    }
    var mh = document[uf(0x678)](uf(0x2f9));
    document[uf(0x678)](uf(0x404))[uf(0x108)] = ng(function (rs) {
      const yv = uf,
        rt = mh[yv(0xcb7)][yv(0xd69)]();
      nf(rt);
    });
    function mi(rs) {
      const yw = uf,
        rt = new Uint8Array([
          cI[yw(0xda9)],
          ...new TextEncoder()[yw(0x8c1)](rs),
        ]);
      il(rt);
    }
    var mj = document[uf(0x678)](uf(0xcfe)),
      mk = document[uf(0x678)](uf(0x754)),
      ml = mk[uf(0x678)](uf(0xe0b)),
      mm = 0x0,
      mn = 0x0;
    setInterval(function () {
      const yx = uf;
      hW &&
        (pz - mn > 0x7530 &&
          mj[yx(0x30b)][yx(0xd59)](yx(0x841)) &&
          (il(new Uint8Array([cI[yx(0xb2c)]])), (mn = pz)),
        pz - mm > 0xea60 &&
          mk[yx(0x30b)][yx(0xd59)](yx(0x841)) &&
          (il(new Uint8Array([cI[yx(0x5bc)]])), (mm = pz)));
    }, 0x3e8);
    var mo = ![];
    function mp(rs) {
      const yy = uf;
      for (let rt in m1) {
        if (rs === rt) continue;
        m1[rt][yy(0x4fb)]();
      }
      mo = ![];
    }
    window[uf(0x108)] = function (rs) {
      const yz = uf;
      if ([kk, kn, ki][yz(0x60a)](rs[yz(0x54c)])) mp();
    };
    function mq() {
      const yA = uf;
      iy && !oV[yA(0x517)] && im(0x0, 0x0);
    }
    function mr(rs, rt, ru, rv) {
      const yB = uf,
        rw = document[yB(0x678)](rt),
        rx = rw[yB(0x678)](yB(0xe0b)),
        ry = document[yB(0x678)](rs);
      let rz = null,
        rA = rw[yB(0x678)](yB(0x984));
      rA &&
        (rA[yB(0x108)] = function () {
          const yC = yB;
          rw[yC(0x30b)][yC(0xb62)](yC(0x6af));
        });
      (rx[yB(0xaf5)][yB(0xd72)] = yB(0xae3)),
        rw[yB(0x30b)][yB(0xcef)](yB(0x841)),
        (ry[yB(0x108)] = function () {
          const yD = yB;
          rB[yD(0xb62)]();
        }),
        (rw[yB(0x678)](yB(0xafd))[yB(0x108)] = function () {
          mp();
        });
      const rB = [ry, rw];
      (rB[yB(0x4fb)] = function () {
        const yE = yB;
        ry[yE(0x30b)][yE(0xcef)](yE(0x6e2)),
          rw[yE(0x30b)][yE(0xcef)](yE(0x841)),
          !rz &&
            (rz = setTimeout(function () {
              const yF = yE;
              (rx[yF(0xaf5)][yF(0xd72)] = yF(0xae3)), (rz = null);
            }, 0x3e8));
      }),
        (rB[yB(0xb62)] = function () {
          const yG = yB;
          mp(ru),
            rw[yG(0x30b)][yG(0xd59)](yG(0x841))
              ? rB[yG(0x4fb)]()
              : rB[yG(0x841)]();
        }),
        (rB[yB(0x841)] = function () {
          const yH = yB;
          rv && rv(),
            clearTimeout(rz),
            (rz = null),
            (rx[yH(0xaf5)][yH(0xd72)] = ""),
            ry[yH(0x30b)][yH(0x5d6)](yH(0x6e2)),
            rw[yH(0x30b)][yH(0x5d6)](yH(0x841)),
            (mo = !![]),
            mq();
        }),
        (m1[ru] = rB);
    }
    var ms = [],
      mt,
      mu = 0x0,
      mv = ![],
      mw = document[uf(0x678)](uf(0xbf3)),
      mz = {
        tagName: uf(0x1dc),
        getBoundingClientRect() {
          const yI = uf,
            rs = mw[yI(0x41b)](),
            rt = {};
          return (
            (rt["x"] = rs["x"] + rs[yI(0xc8b)] / 0x2),
            (rt["y"] = rs["y"] + rs[yI(0x48d)] / 0x2),
            rt
          );
        },
        appendChild(rs) {
          const yJ = uf;
          rs[yJ(0xcef)]();
        },
      };
    function mA(rs) {
      const yK = uf;
      if (!hW) return;
      const rt = rs[yK(0x54c)];
      if (rt[yK(0x573)]) mt = mU(rt, rs);
      else {
        if (rt[yK(0x5e1)]) {
          mp();
          const ru = rt[yK(0xbad)]();
          (ru[yK(0x34f)] = rt[yK(0x34f)]),
            nz(ru, rt[yK(0x34f)]),
            (ru[yK(0x1ec)] = 0x1),
            (ru[yK(0x5e1)] = !![]),
            (ru[yK(0x556)] = mz),
            ru[yK(0x30b)][yK(0x5d6)](yK(0x8b0));
          const rv = rt[yK(0x41b)]();
          (ru[yK(0xaf5)][yK(0xa44)] = rv["x"] / kR + "px"),
            (ru[yK(0xaf5)][yK(0x545)] = rv["y"] / kR + "px"),
            kH[yK(0x72b)](ru),
            (mt = mU(ru, rs)),
            (mu = 0x0),
            (mo = !![]);
        } else return ![];
      }
      return (mu = Date[yK(0xe04)]()), (mv = !![]), !![];
    }
    function mB(rs) {
      const yL = uf;
      for (let rt = 0x0; rt < rs[yL(0x806)][yL(0x441)]; rt++) {
        const ru = rs[yL(0x806)][rt];
        if (ru[yL(0x30b)][yL(0xd59)](yL(0x34f)) && !mT(ru)) return ru;
      }
    }
    function mC() {
      const yM = uf;
      if (mt) {
        if (mv && Date[yM(0xe04)]() - mu < 0x1f4) {
          if (mt[yM(0x573)]) {
            const rs = mt[yM(0x594)][yM(0x235)];
            mt[yM(0x118)](
              rs >= iN ? nk[yM(0x806)][rs - iN + 0x1] : nl[yM(0x806)][rs]
            );
          } else {
            if (mt[yM(0x5e1)]) {
              let rt = mB(nk) || mB(nl);
              rt && mt[yM(0x118)](rt);
            }
          }
        }
        mt[yM(0x26b)]();
        if (mt[yM(0x5e1)]) {
          (mt[yM(0x5e1)] = ![]),
            (mt[yM(0x573)] = !![]),
            m1[yM(0xb88)][yM(0x841)]();
          if (mt[yM(0x556)] !== mz) {
            const ru = mt[yM(0xbbd)];
            ru
              ? ((mt[yM(0x8fc)] = ru[yM(0x8fc)]), mQ(ru[yM(0x34f)]["id"], 0x1))
              : (mt[yM(0x8fc)] = iR[yM(0xc19)]());
            (iQ[mt[yM(0x8fc)]] = mt), mQ(mt[yM(0x34f)]["id"], -0x1);
            const rv = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rv[yM(0x969)](0x0, cI[yM(0x471)]),
              rv[yM(0x2f7)](0x1, mt[yM(0x34f)]["id"]),
              rv[yM(0x969)](0x3, mt[yM(0x556)][yM(0x235)]),
              il(rv);
          }
        } else
          mt[yM(0x556)] === mz
            ? (iR[yM(0xaba)](mt[yM(0x8fc)]),
              mQ(mt[yM(0x34f)]["id"], 0x1),
              il(new Uint8Array([cI[yM(0x320)], mt[yM(0x594)][yM(0x235)]])))
            : mS(mt[yM(0x594)][yM(0x235)], mt[yM(0x556)][yM(0x235)]);
        mt = null;
      }
    }
    function mD(rs) {
      const yN = uf;
      mt && (mt[yN(0x67f)](rs), (mv = ![]));
    }
    var mE = document[uf(0x678)](uf(0xbd8));
    function mF() {
      const yO = uf;
      mE[yO(0xaf5)][yO(0xd72)] = yO(0xae3);
      const rs = mE[yO(0x678)](yO(0xad1));
      let rt,
        ru,
        rv = null;
      (mE[yO(0xcfb)] = function (rx) {
        const yP = yO;
        rv === null &&
          ((rs[yP(0xaf5)][yP(0xc8b)] = rs[yP(0xaf5)][yP(0xa99)] = "0"),
          (mE[yP(0xaf5)][yP(0xd72)] = ""),
          ([rt, ru] = mG(rx)),
          rw(),
          (rv = rx[yP(0x5cf)]));
      }),
        (mE[yO(0xaf1)] = function (rx) {
          const yQ = yO;
          if (rx[yQ(0x5cf)] === rv) {
            const [ry, rz] = mG(rx),
              rA = ry - rt,
              rB = rz - ru,
              rC = mE[yQ(0x41b)]();
            let rD = Math[yQ(0x5d7)](rA, rB);
            const rE = rC[yQ(0xc8b)] / 0x2 / kR;
            rD > rE && (rD = rE);
            const rF = Math[yQ(0x31e)](rB, rA);
            return (
              (rs[yQ(0xaf5)][yQ(0xa99)] = yQ(0xb65) + rF + yQ(0x1c3)),
              (rs[yQ(0xaf5)][yQ(0xc8b)] = rD + "px"),
              im(rF, rD / rE),
              !![]
            );
          }
        }),
        (mE[yO(0xc02)] = function (rx) {
          const yR = yO;
          rx[yR(0x5cf)] === rv &&
            ((mE[yR(0xaf5)][yR(0xd72)] = yR(0xae3)), (rv = null), im(0x0, 0x0));
        });
      function rw() {
        const yS = yO;
        (mE[yS(0xaf5)][yS(0xa44)] = rt + "px"),
          (mE[yS(0xaf5)][yS(0x545)] = ru + "px");
      }
    }
    mF();
    function mG(rs) {
      const yT = uf;
      return [rs[yT(0x5e5)] / kR, rs[yT(0x3c6)] / kR];
    }
    var mH = document[uf(0x678)](uf(0x7f3)),
      mI = document[uf(0x678)](uf(0x8b1)),
      mJ = document[uf(0x678)](uf(0x7af)),
      mK = {},
      mL = {};
    if (kL) {
      document[uf(0x4f6)][uf(0x30b)][uf(0x5d6)](uf(0x22d)),
        (window[uf(0xae6)] = function (rt) {
          const yU = uf;
          for (let ru = 0x0; ru < rt[yU(0x87b)][yU(0x441)]; ru++) {
            const rv = rt[yU(0x87b)][ru],
              rw = rv[yU(0x54c)];
            if (rw === ki) {
              mE[yU(0xcfb)](rv);
              continue;
            } else {
              if (rw === mI)
                pa(yU(0x44c), !![]),
                  (mK[rv[yU(0x5cf)]] = function () {
                    const yV = yU;
                    pa(yV(0x44c), ![]);
                  });
              else {
                if (rw === mH)
                  pa(yU(0x794), !![]),
                    (mK[rv[yU(0x5cf)]] = function () {
                      const yW = yU;
                      pa(yW(0x794), ![]);
                    });
                else
                  rw === mJ &&
                    (pa(yU(0xbb4), !![]),
                    (mK[rv[yU(0x5cf)]] = function () {
                      const yX = yU;
                      pa(yX(0xbb4), ![]);
                    }));
              }
            }
            if (mt) continue;
            if (rw[yU(0x34f)]) {
              const rx = mO(rw);
              mA(rv),
                mt && (mL[rv[yU(0x5cf)]] = mD),
                (mK[rv[yU(0x5cf)]] = function () {
                  const yY = yU;
                  mt && mC(), (rx[yY(0x57b)] = ![]);
                });
            }
          }
        });
      const rs = {};
      (rs[uf(0xb24)] = ![]),
        document[uf(0x652)](
          uf(0xada),
          function (rt) {
            const yZ = uf;
            for (let ru = 0x0; ru < rt[yZ(0x87b)][yZ(0x441)]; ru++) {
              const rv = rt[yZ(0x87b)][ru];
              mE[yZ(0xaf1)](rv) && rt[yZ(0x840)]();
              if (mL[rv[yZ(0x5cf)]]) mL[rv[yZ(0x5cf)]](rv), rt[yZ(0x840)]();
              else mt && rt[yZ(0x840)]();
            }
          },
          rs
        ),
        (window[uf(0x39f)] = function (rt) {
          const z0 = uf;
          for (let ru = 0x0; ru < rt[z0(0x87b)][z0(0x441)]; ru++) {
            const rv = rt[z0(0x87b)][ru];
            mE[z0(0xc02)](rv),
              mK[rv[z0(0x5cf)]] &&
                (mK[rv[z0(0x5cf)]](),
                delete mK[rv[z0(0x5cf)]],
                delete mL[rv[z0(0x5cf)]]);
          }
        });
    } else {
      document[uf(0x4f6)][uf(0x30b)][uf(0x5d6)](uf(0xca0));
      let rt = ![];
      (window[uf(0xcf3)] = function (ru) {
        const z1 = uf;
        ru[z1(0x2bd)] === 0x0 && ((rt = !![]), mA(ru));
      }),
        (document[uf(0x9b3)] = function (ru) {
          const z2 = uf;
          mD(ru);
          const rv = ru[z2(0x54c)];
          if (rv[z2(0x34f)] && !rt) {
            const rw = mO(rv);
            rv[z2(0xd7e)] = rv[z2(0xcf3)] = function () {
              const z3 = z2;
              rw[z3(0x57b)] = ![];
            };
          }
        }),
        (document[uf(0x38e)] = function (ru) {
          const z4 = uf;
          ru[z4(0x2bd)] === 0x0 && ((rt = ![]), mC());
        }),
        (km[uf(0x9b3)] = ki[uf(0x9b3)] =
          function (ru) {
            const z5 = uf;
            (mY = ru[z5(0x5e5)] - kU() / 0x2),
              (mZ = ru[z5(0x3c6)] - kV() / 0x2);
            if (!oV[z5(0x517)] && iy && !mo) {
              const rv = Math[z5(0x5d7)](mY, mZ),
                rw = Math[z5(0x31e)](mZ, mY);
              im(rw, rv < 0x32 ? rv / 0x64 : 0x1);
            }
          });
    }
    function mM(ru, rv, rw) {
      const z6 = uf;
      return Math[z6(0x606)](rv, Math[z6(0xbd3)](ru, rw));
    }
    var mN = [];
    function mO(ru) {
      const z7 = uf;
      let rv = mN[z7(0xb12)]((rw) => rw["el"] === ru);
      if (rv) return (rv[z7(0x57b)] = !![]), rv;
      (rv =
        typeof ru[z7(0x34f)] === z7(0x85e)
          ? ru[z7(0x34f)]()
          : nu(ru[z7(0x34f)], ru[z7(0xb8a)])),
        (rv[z7(0x57b)] = !![]),
        (rv[z7(0x7d4)] = 0x0),
        (rv[z7(0xaf5)][z7(0x43a)] = z7(0x40e)),
        (rv[z7(0xaf5)][z7(0xa99)] = z7(0xae3)),
        kH[z7(0x72b)](rv);
      if (kL)
        (rv[z7(0xaf5)][z7(0x2f2)] = z7(0x66c)),
          (rv[z7(0xaf5)][z7(0x545)] = z7(0x66c)),
          (rv[z7(0xaf5)][z7(0x5d1)] = z7(0x233)),
          (rv[z7(0xaf5)][z7(0xa44)] = z7(0x233));
      else {
        const rw = ru[z7(0x41b)](),
          rx = rv[z7(0x41b)]();
        (rv[z7(0xaf5)][z7(0x545)] =
          mM(
            ru[z7(0x16f)]
              ? (rw[z7(0x545)] + rw[z7(0x48d)]) / kR + 0xa
              : (rw[z7(0x545)] - rx[z7(0x48d)]) / kR - 0xa,
            0xa,
            window[z7(0xae0)] / kR - 0xa
          ) + "px"),
          (rv[z7(0xaf5)][z7(0xa44)] =
            mM(
              (rw[z7(0xa44)] + rw[z7(0xc8b)] / 0x2 - rx[z7(0xc8b)] / 0x2) / kR,
              0xa,
              window[z7(0x99d)] / kR - 0xa - rx[z7(0xc8b)] / kR
            ) + "px"),
          (rv[z7(0xaf5)][z7(0x5d1)] = z7(0x233)),
          (rv[z7(0xaf5)][z7(0x2f2)] = z7(0x233));
      }
      return (
        (rv[z7(0xaf5)][z7(0x447)] = z7(0xae3)),
        (rv[z7(0xaf5)][z7(0xc20)] = 0x0),
        (rv["el"] = ru),
        mN[z7(0xaba)](rv),
        rv
      );
    }
    var mP = document[uf(0x678)](uf(0x116));
    function mQ(ru, rv = 0x1) {
      const z8 = uf;
      !iS[ru] && ((iS[ru] = 0x0), oU(ru), nW()),
        (iS[ru] += rv),
        nU[ru][z8(0x4b0)](iS[ru]),
        iS[ru] <= 0x0 && (delete iS[ru], nU[ru][z8(0xc48)](), nW()),
        mR();
    }
    function mR() {
      const z9 = uf;
      mP[z9(0x2d7)] = "";
      Object[z9(0x5cc)](iS)[z9(0x441)] === 0x0
        ? (mP[z9(0xaf5)][z9(0xd72)] = z9(0xae3))
        : (mP[z9(0xaf5)][z9(0xd72)] = "");
      const ru = {};
      for (const rv in iS) {
        const rw = dC[rv],
          rx = iS[rv];
        ru[rw[z9(0xd26)]] = (ru[rw[z9(0xd26)]] || 0x0) + rx;
      }
      oo(mP, ru);
      for (const ry in oa) {
        const rz = oa[ry];
        rz[z9(0x30b)][ru[ry] ? z9(0xcef) : z9(0x5d6)](z9(0x6e3));
      }
    }
    function mS(ru, rv) {
      const za = uf;
      if (ru === rv) return;
      il(new Uint8Array([cI[za(0x6b6)], ru, rv]));
    }
    function mT(ru) {
      const zb = uf;
      return ru[zb(0xaab)] || ru[zb(0x678)](zb(0x900));
    }
    function mU(ru, rv, rw = !![]) {
      const zc = uf,
        rx = ms[zc(0xb12)]((rH) => rH === ru);
      if (rx) return rx[zc(0x86e)](rv), rx;
      let ry,
        rz,
        rA,
        rB,
        rC = 0x0,
        rD = 0x0,
        rE = 0x0,
        rF;
      (ru[zc(0x86e)] = function (rH, rI) {
        const zd = zc;
        (rF = ru[zd(0x556)] || ru[zd(0x345)]),
          (rF[zd(0xaab)] = ru),
          (ru[zd(0x594)] = rF),
          (ru[zd(0x793)] = ![]),
          (ru[zd(0x263)] = ![]);
        const rJ = ru[zd(0x41b)]();
        rH[zd(0x9fd)] === void 0x0
          ? ((rC = rH[zd(0x5e5)] - rJ["x"]),
            (rD = rH[zd(0x3c6)] - rJ["y"]),
            ru[zd(0x67f)](rH),
            (ry = rA),
            (rz = rB))
          : ((ry = rJ["x"]),
            (rz = rJ["y"]),
            ru[zd(0x118)](rH),
            ru[zd(0x26b)](rI)),
          rG();
      }),
        (ru[zc(0x26b)] = function (rH = !![]) {
          const ze = zc;
          ru[ze(0x263)] = !![];
          rF[ze(0xaab)] === ru && (rF[ze(0xaab)] = null);
          if (!ru[ze(0x556)])
            ru[ze(0x118)](rF),
              Math[ze(0x5d7)](rA - ry, rB - rz) > 0x32 * kR &&
                ru[ze(0x118)](mz);
          else {
            if (rH) {
              const rI = mT(ru[ze(0x556)]);
              (ru[ze(0xbbd)] = rI), rI && mU(rI, rF, ![]);
            }
          }
          ru[ze(0x556)] !== rF && (ru[ze(0x1ec)] = 0x0),
            (ru[ze(0x556)][ze(0xaab)] = ru);
        }),
        (ru[zc(0x118)] = function (rH) {
          const zf = zc;
          ru[zf(0x556)] = rH;
          const rI = rH[zf(0x41b)]();
          (rA = rI["x"]),
            (rB = rI["y"]),
            (ru[zf(0xaf5)][zf(0x34c)] =
              rH === mz ? zf(0x895) : getComputedStyle(rH)[zf(0x34c)]);
        }),
        (ru[zc(0x67f)] = function (rH) {
          const zg = zc;
          (rA = rH[zg(0x5e5)] - rC),
            (rB = rH[zg(0x3c6)] - rD),
            (ru[zg(0x556)] = null);
          let rI = Infinity,
            rJ = null;
          const rK = ko[zg(0x3f7)](zg(0x4d5));
          for (let rL = 0x0; rL < rK[zg(0x441)]; rL++) {
            const rM = rK[rL],
              rN = rM[zg(0x41b)](),
              rO = Math[zg(0x5d7)](
                rN["x"] + rN[zg(0xc8b)] / 0x2 - rH[zg(0x5e5)],
                rN["y"] + rN[zg(0x48d)] / 0x2 - rH[zg(0x3c6)]
              );
            rO < 0x1e * kR && rO < rI && ((rJ = rM), (rI = rO));
          }
          rJ && rJ !== rF && ru[zg(0x118)](rJ);
        }),
        ru[zc(0x86e)](rv, rw),
        ru[zc(0x30b)][zc(0x5d6)](zc(0x8b0)),
        kH[zc(0x72b)](ru);
      function rG() {
        const zh = zc;
        (ru[zh(0xaf5)][zh(0xa44)] = ry / kR + "px"),
          (ru[zh(0xaf5)][zh(0x545)] = rz / kR + "px");
      }
      return (
        (ru[zc(0xbfc)] = function () {
          const zi = zc;
          ru[zi(0x556)] && ru[zi(0x118)](ru[zi(0x556)]);
        }),
        (ru[zc(0x1b9)] = function () {
          const zj = zc;
          (ry = pg(ry, rA, 0x64)), (rz = pg(rz, rB, 0x64)), rG();
          let rH = 0x0,
            rI = Infinity;
          ru[zj(0x556)]
            ? ((rI = Math[zj(0x5d7)](rA - ry, rB - rz)),
              (rH = rI > 0x5 ? 0x1 : 0x0))
            : (rH = 0x1),
            (rE = pg(rE, rH, 0x64)),
            (ru[zj(0xaf5)][zj(0xa99)] =
              zj(0x1fa) +
              (0x1 + 0.3 * rE) +
              zj(0xc0f) +
              rE * Math[zj(0xb1f)](Date[zj(0xe04)]() / 0x96) * 0xa +
              zj(0x7ad)),
            ru[zj(0x263)] &&
              rE < 0.05 &&
              rI < 0x5 &&
              (ru[zj(0x30b)][zj(0xcef)](zj(0x8b0)),
              (ru[zj(0xaf5)][zj(0xa44)] =
                ru[zj(0xaf5)][zj(0x545)] =
                ru[zj(0xaf5)][zj(0xa99)] =
                ru[zj(0xaf5)][zj(0x34c)] =
                ru[zj(0xaf5)][zj(0x200)] =
                  ""),
              (ru[zj(0x793)] = !![]),
              ru[zj(0x556)][zj(0x72b)](ru),
              (ru[zj(0x556)][zj(0xaab)] = null),
              (ru[zj(0x556)] = null));
        }),
        ms[zc(0xaba)](ru),
        ru
      );
    }
    var mV = cY[uf(0x98e)];
    document[uf(0x3bd)] = function () {
      return ![];
    };
    var mW = 0x0,
      mX = 0x0,
      mY = 0x0,
      mZ = 0x0,
      n0 = 0x1,
      n1 = 0x1;
    document[uf(0xa4b)] = function (ru) {
      const zk = uf;
      ru[zk(0x54c)] === ki &&
        ((n0 *= ru[zk(0x65e)] < 0x0 ? 1.1 : 0.9),
        (n0 = Math[zk(0xbd3)](0x3, Math[zk(0x606)](0x1, n0))));
    };
    const n2 = {};
    (n2[uf(0x8a2)] = uf(0xab7)),
      (n2["me"] = uf(0x455)),
      (n2[uf(0x334)] = uf(0x8a1));
    var n3 = n2,
      n4 = {};
    function n5(ru, rv) {
      n6(ru, null, null, null, jx(rv));
    }
    function n6(ru, rv, rw, rx = n3[uf(0x8a2)], ry) {
      const zl = uf,
        rz = nA(zl(0xd6f));
      if (!ry) {
        if (rv) {
          const rB = nA(zl(0x13a));
          k8(rB, rv + ":"), rz[zl(0x72b)](rB);
        }
        const rA = nA(zl(0xc1d));
        k8(rA, rw),
          rz[zl(0x72b)](rA),
          (rz[zl(0x806)][0x0][zl(0xaf5)][zl(0x2d3)] = rx),
          rv && rz[zl(0x94e)](nA(zl(0xbb7)));
      } else rz[zl(0x2d7)] = ry;
      p3[zl(0x72b)](rz);
      while (p3[zl(0x806)][zl(0x441)] > 0x3c) {
        p3[zl(0x806)][0x0][zl(0xcef)]();
      }
      return (
        (p3[zl(0x9cc)] = p3[zl(0x4ed)]),
        (rz[zl(0x3dd)] = rw),
        (rz[zl(0x19c)] = rx),
        n7(ru, rz),
        rz
      );
    }
    function n7(ru, rv) {
      const zm = uf;
      (rv["t"] = 0x0), (rv[zm(0x8d1)] = 0x0);
      if (!n4[ru]) n4[ru] = [];
      n4[ru][zm(0xaba)](rv);
    }
    var n8 = {};
    ki[uf(0xcf3)] = window[uf(0x38e)] = ng(function (ru) {
      const zn = uf,
        rv = zn(0xda8) + ru[zn(0x2bd)];
      pa(rv, ru[zn(0x5a0)] === zn(0xdd7));
    });
    var n9 = 0x0;
    function na(ru) {
      const zo = uf,
        rv = 0x200,
        rw = rv / 0x64,
        rx = document[zo(0x6a4)](zo(0xc98));
      rx[zo(0xc8b)] = rx[zo(0x48d)] = rv;
      const ry = rx[zo(0x308)]("2d");
      ry[zo(0x8e8)](rv / 0x2, rv / 0x2), ry[zo(0x90b)](rw), ru[zo(0xa72)](ry);
      const rz = (ru[zo(0x6ed)] ? zo(0x58c) : zo(0x50e)) + ru[zo(0x3ed)];
      nb(rx, rz);
    }
    function nb(ru, rv) {
      const zp = uf,
        rw = document[zp(0x6a4)]("a");
      (rw[zp(0x218)] = rv),
        (rw[zp(0xd21)] = typeof ru === zp(0x912) ? ru : ru[zp(0x2f0)]()),
        rw[zp(0x708)](),
        hK(rv + zp(0x525), hP[zp(0x5b2)]);
    }
    var nc = 0x0;
    setInterval(function () {
      nc = 0x0;
    }, 0x1770),
      setInterval(function () {
        const zq = uf;
        nh[zq(0x441)] = 0x0;
      }, 0x2710);
    var nd = ![],
      ne = ![];
    function nf(ru) {
      const zr = uf;
      ru = ru[zr(0xd69)]();
      if (!ru) hK(zr(0x18c)), hc(zr(0x18c));
      else
        ru[zr(0x441)] < cN || ru[zr(0x441)] > cM
          ? (hK(zr(0x16a)), hc(zr(0x16a)))
          : (hK(zr(0x960) + ru + zr(0xdc1), hP[zr(0x6ab)]),
            hc(zr(0x960) + ru + zr(0xdc1)),
            mi(ru));
    }
    document[uf(0x5b5)] = document[uf(0x11f)] = ng(function (ru) {
      const zs = uf;
      ru[zs(0x50b)] && ru[zs(0x840)]();
      (nd = ru[zs(0x50b)]), (ne = ru[zs(0x93e)]);
      if (ru[zs(0x734)] === 0x9) {
        ru[zs(0x840)]();
        return;
      }
      if (document[zs(0x870)] && document[zs(0x870)][zs(0x9fd)] === zs(0x2db)) {
        if (ru[zs(0x5a0)] === zs(0x16b) && ru[zs(0x734)] === 0xd) {
          if (document[zs(0x870)] === hF) hG[zs(0x708)]();
          else {
            if (document[zs(0x870)] === p2) {
              let rv = p2[zs(0xcb7)][zs(0xd69)]()[zs(0x923)](0x0, cL);
              if (rv && hW) {
                if (pz - n9 > 0x3e8) {
                  const rw = rv[zs(0x313)](zs(0xb9a));
                  if (rw || rv[zs(0x313)](zs(0x418))) {
                    const rx = rv[zs(0x923)](rw ? 0x7 : 0x9);
                    if (!rx) hK(zs(0xb17));
                    else {
                      if (rw) {
                        const ry = eM[rx];
                        !ry ? hK(zs(0x459) + rx + "!") : na(ry);
                      } else {
                        const rz = dF[rx];
                        !rz ? hK(zs(0x4bc) + rx + "!") : na(rz);
                      }
                    }
                  } else {
                    if (rv[zs(0x313)](zs(0x889))) nb(qh, zs(0xb96));
                    else {var inputChat = rv;
                        if(inputChat.startsWith('/toggle')){
                          hack.command2Arg('toggle', inputChat);
                        }else if(inputChat.startsWith('/list')){
                          hack.addChat('List of module and configs:');
                          hack.list();
                        }else if(inputChat.startsWith('/help')){
                          hack.getHelp();
                        }else if(inputChat.startsWith('/server')){
                          hack.addChat('Current server: ' + hack.getServer());
                        }else if(inputChat.startsWith('/wave')){
                          hack.addChat(hack.getWave());
                        }else if(hack.notCommand(inputChat.split(' ')[0])){
                          hack.addError('Invalid command!');
                        }else
                      if (rv[zs(0x313)](zs(0x208))) {
                        const rA = rv[zs(0x923)](0x9);
                        nf(rA);
                      } else {
                        let rB = 0x0;
                        for (let rC = 0x0; rC < nh[zs(0x441)]; rC++) {
                          ni(rv, nh[rC]) > 0.95 && rB++;
                        }
                        rB >= 0x3 && (nc += 0xa);
                        nc++;
                        if (nc > 0x3) hK(zs(0x184)), (n9 = pz + 0xea60);
                        else {
                          nh[zs(0xaba)](rv);
                          if (nh[zs(0x441)] > 0xa) nh[zs(0x173)]();
                          (rv = decodeURIComponent(
                            encodeURIComponent(rv)
                              [zs(0xa27)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                              [zs(0xa27)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                          )),
                            il(
                              new Uint8Array([
                                cI[zs(0xb37)],
                                ...new TextEncoder()[zs(0x8c1)](rv),
                              ])
                            ),
                            (n9 = pz);
                        }
                      }
                    }
                  }
                } else n6(-0x1, null, zs(0xd60), n3[zs(0x334)]);
              }
              (p2[zs(0xcb7)] = ""), p2[zs(0x869)]();
            }
          }
        }
        return;
      }
      pa(ru[zs(0xdcb)], ru[zs(0x5a0)] === zs(0x6fb));
    });
    function ng(ru) {
      return function (rv) {
        const zt = b;
        rv instanceof Event && rv[zt(0x15e)] && !rv[zt(0x188)] && ru(rv);
      };
    }
    var nh = [];
    function ni(ru, rv) {
      const zu = uf;
      var rw = ru,
        rx = rv;
      ru[zu(0x441)] < rv[zu(0x441)] && ((rw = rv), (rx = ru));
      var ry = rw[zu(0x441)];
      if (ry == 0x0) return 0x1;
      return (ry - nj(rw, rx)) / parseFloat(ry);
    }
    function nj(ru, rv) {
      const zv = uf;
      (ru = ru[zv(0xbe2)]()), (rv = rv[zv(0xbe2)]());
      var rw = new Array();
      for (var rx = 0x0; rx <= ru[zv(0x441)]; rx++) {
        var ry = rx;
        for (var rz = 0x0; rz <= rv[zv(0x441)]; rz++) {
          if (rx == 0x0) rw[rz] = rz;
          else {
            if (rz > 0x0) {
              var rA = rw[rz - 0x1];
              if (ru[zv(0x426)](rx - 0x1) != rv[zv(0x426)](rz - 0x1))
                rA = Math[zv(0xbd3)](Math[zv(0xbd3)](rA, ry), rw[rz]) + 0x1;
              (rw[rz - 0x1] = ry), (ry = rA);
            }
          }
        }
        if (rx > 0x0) rw[rv[zv(0x441)]] = ry;
      }
      return rw[rv[zv(0x441)]];
    }
    var nk = document[uf(0x678)](uf(0x1aa)),
      nl = document[uf(0x678)](uf(0x63c));
    function nm(ru, rv = 0x1) {
      const zw = uf;
      ru[zw(0x64c)](),
        ru[zw(0x656)](0.25 * rv, 0.25 * rv),
        ru[zw(0x8e8)](-0x4b, -0x4b),
        ru[zw(0x7f5)](),
        ru[zw(0x269)](0x4b, 0x28),
        ru[zw(0x34a)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        ru[zw(0x34a)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        ru[zw(0x34a)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        ru[zw(0x34a)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        ru[zw(0x34a)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        ru[zw(0x34a)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (ru[zw(0x9f0)] = zw(0x1fd)),
        ru[zw(0x8ab)](),
        (ru[zw(0x60f)] = ru[zw(0x5e0)] = zw(0xc28)),
        (ru[zw(0x4b9)] = zw(0x5ec)),
        (ru[zw(0x659)] = 0xc),
        ru[zw(0x4b4)](),
        ru[zw(0x6c7)]();
    }
    for (let ru = 0x0; ru < dC[uf(0x441)]; ru++) {
      const rv = dC[ru];
      if (rv[uf(0x716)] !== void 0x0)
        switch (rv[uf(0x716)]) {
          case df[uf(0xde0)]:
            rv[uf(0xa72)] = function (rw) {
              const zx = uf;
              rw[zx(0x656)](2.5, 2.5), lO(rw);
            };
            break;
          case df[uf(0xda1)]:
            rv[uf(0xa72)] = function (rw) {
              const zy = uf;
              rw[zy(0x90b)](0.9);
              const rx = pF();
              (rx[zy(0xb76)] = !![]), rx[zy(0xa5a)](rw);
            };
            break;
          case df[uf(0x673)]:
            rv[uf(0xa72)] = function (rw) {
              const zz = uf;
              rw[zz(0x174)](-Math["PI"] / 0x2),
                rw[zz(0x8e8)](-0x30, 0x0),
                pE[zz(0xca9)](rw, ![]);
            };
            break;
          case df[uf(0x463)]:
            rv[uf(0xa72)] = function (rw) {
              const zA = uf;
              rw[zA(0x174)](Math["PI"] / 0xa),
                rw[zA(0x8e8)](0x3, 0x15),
                lP(rw, !![]);
            };
            break;
          case df[uf(0x617)]:
            rv[uf(0xa72)] = function (rw) {
              nm(rw);
            };
            break;
          case df[uf(0x7bb)]:
            rv[uf(0xa72)] = function (rw) {
              const zB = uf;
              rw[zB(0x8e8)](0x0, 0x3),
                rw[zB(0x174)](-Math["PI"] / 0x4),
                rw[zB(0x90b)](0.4),
                pE[zB(0x23e)](rw),
                rw[zB(0x7f5)](),
                rw[zB(0x5b3)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rw[zB(0x659)] = 0x8),
                (rw[zB(0x4b9)] = zB(0xbf5)),
                rw[zB(0x4b4)]();
            };
            break;
          case df[uf(0xbb8)]:
            rv[uf(0xa72)] = function (rw) {
              const zC = uf;
              rw[zC(0x8e8)](0x0, 0x7),
                rw[zC(0x90b)](0.8),
                pE[zC(0xb39)](rw, 0.5);
            };
            break;
          case df[uf(0x735)]:
            rv[uf(0xa72)] = function (rw) {
              const zD = uf;
              rw[zD(0x90b)](1.3), lS(rw);
            };
            break;
          default:
            rv[uf(0xa72)] = function (rw) {};
        }
      else {
        const rw = new lG(
          -0x1,
          rv[uf(0x5a0)],
          0x0,
          0x0,
          rv[uf(0x9c5)],
          rv[uf(0x74e)] ? 0x10 : rv[uf(0xbab)] * 1.1,
          0x0
        );
        (rw[uf(0x837)] = !![]),
          rv[uf(0x37b)] === 0x1
            ? (rv[uf(0xa72)] = function (rx) {
                const zE = uf;
                rw[zE(0xa5a)](rx);
              })
            : (rv[uf(0xa72)] = function (rx) {
                const zF = uf;
                for (let ry = 0x0; ry < rv[zF(0x37b)]; ry++) {
                  rx[zF(0x64c)]();
                  const rz = (ry / rv[zF(0x37b)]) * Math["PI"] * 0x2;
                  rv[zF(0x265)]
                    ? rx[zF(0x8e8)](...le(rv[zF(0x786)], 0x0, rz))
                    : (rx[zF(0x174)](rz), rx[zF(0x8e8)](rv[zF(0x786)], 0x0)),
                    rx[zF(0x174)](rv[zF(0xc7c)]),
                    rw[zF(0xa5a)](rx),
                    rx[zF(0x6c7)]();
                }
              });
      }
    }
    const nn = {};
    (nn[uf(0xbba)] = uf(0x50d)),
      (nn[uf(0xd27)] = uf(0x829)),
      (nn[uf(0xca5)] = uf(0x2fc)),
      (nn[uf(0x881)] = uf(0x3e2)),
      (nn[uf(0x94f)] = uf(0x73e)),
      (nn[uf(0x257)] = uf(0x13c)),
      (nn[uf(0x73f)] = uf(0xba7));
    var no = nn;
    function np() {
      const zG = uf,
        rx = document[zG(0x678)](zG(0x5e7));
      let ry = zG(0x760);
      for (let rz = 0x0; rz < 0xc8; rz++) {
        const rA = d6(rz),
          rB = 0xc8 * rA,
          rC = 0x19 * rA,
          rD = d5(rz);
        ry +=
          zG(0x658) +
          (rz + 0x1) +
          zG(0x2b7) +
          k9(Math[zG(0xc28)](rB)) +
          zG(0x2b7) +
          k9(Math[zG(0xc28)](rC)) +
          zG(0x2b7) +
          rD +
          zG(0xdcf);
      }
      (ry += zG(0x4ff)), (ry += zG(0xc3b)), (rx[zG(0x2d7)] = ry);
    }
    np();
    function nq(rx, ry) {
      const zH = uf,
        rz = eM[rx],
        rA = rz[zH(0x3ed)],
        rB = rz[zH(0xd26)];
      return (
        "x" +
        ry[zH(0x37b)] * ry[zH(0x2c0)] +
        ("\x20" + rA + zH(0x7e8) + hQ[rB] + zH(0xdc7) + hN[rB] + ")")
      );
    }
    function nr(rx) {
      const zI = uf;
      return rx[zI(0x40d)](0x2)[zI(0xa27)](/\.?0+$/, "");
    }
    var ns = [
        [uf(0xadd), uf(0x35a), no[uf(0xbba)]],
        [uf(0xb98), uf(0x3a3), no[uf(0xd27)]],
        [uf(0xd70), uf(0xd90), no[uf(0xca5)]],
        [uf(0x20a), uf(0x585), no[uf(0x881)]],
        [uf(0xadb), uf(0x9c1), no[uf(0x257)]],
        [uf(0x82a), uf(0x8b2), no[uf(0x94f)]],
        [uf(0x4a9), uf(0x82d), no[uf(0x73f)]],
        [uf(0xb1a), uf(0x3cd), no[uf(0x73f)], (rx) => "+" + k9(rx)],
        [uf(0x7c3), uf(0x850), no[uf(0x73f)], (rx) => "+" + k9(rx)],
        [uf(0xa68), uf(0x942), no[uf(0x73f)]],
        [
          uf(0xc4d),
          uf(0x51b),
          no[uf(0x73f)],
          (rx) => Math[uf(0xc28)](rx * 0x64) + "%",
        ],
        [uf(0x7cd), uf(0x8ee), no[uf(0x73f)], (rx) => "+" + nr(rx) + uf(0x474)],
        [uf(0x142), uf(0xa8e), no[uf(0xca5)], (rx) => k9(rx) + "/s"],
        [uf(0xa07), uf(0xa8e), no[uf(0xca5)], (rx) => k9(rx) + uf(0xa7a)],
        [
          uf(0xaf4),
          uf(0x12c),
          no[uf(0x73f)],
          (rx) => (rx > 0x0 ? "+" : "") + rx,
        ],
        [uf(0xaeb), uf(0x71f), no[uf(0x94f)], (rx) => "+" + rx + "%"],
        [
          uf(0x706),
          uf(0x8df),
          no[uf(0x94f)],
          (rx) => "+" + parseInt(rx * 0x64) + "%",
        ],
        [uf(0xb43), uf(0x8c7), no[uf(0x73f)], (rx) => "-" + rx + "%"],
        [uf(0x6a3), uf(0xbaa), no[uf(0x73f)], nq],
        [uf(0xb9b), uf(0xb8b), no[uf(0x94f)], (rx) => rx / 0x3e8 + "s"],
        [uf(0x762), uf(0x8f2), no[uf(0x94f)], (rx) => rx + "s"],
        [uf(0x78c), uf(0x13e), no[uf(0x94f)], (rx) => k9(rx) + uf(0x7bf)],
        [uf(0x156), uf(0xdde), no[uf(0x94f)], (rx) => rx + "s"],
        [uf(0x31b), uf(0x396), no[uf(0x94f)], (rx) => rx / 0x3e8 + "s"],
        [uf(0x2b5), uf(0x4da), no[uf(0x94f)]],
        [uf(0x557), uf(0x87f), no[uf(0x94f)]],
        [uf(0x65c), uf(0x6a6), no[uf(0x94f)], (rx) => rx + uf(0xe14)],
        [uf(0x27f), uf(0x238), no[uf(0x94f)], (rx) => rx + uf(0xe14)],
        [uf(0xa56), uf(0xb75), no[uf(0x94f)]],
        [uf(0x7ba), uf(0xb53), no[uf(0x73f)]],
        [uf(0x815), uf(0xa1b), no[uf(0x94f)], (rx) => rx / 0x3e8 + "s"],
        [uf(0x589), uf(0x964), no[uf(0xca5)], (rx) => k9(rx) + "/s"],
        [uf(0x4d1), uf(0xa08), no[uf(0x94f)]],
        [uf(0xa63), uf(0x7ed), no[uf(0x73f)]],
        [
          uf(0xd63),
          uf(0x866),
          no[uf(0x94f)],
          (rx, ry) => nr(rx * ry[uf(0xbab)]),
        ],
        [uf(0x6bd), uf(0xbe6), no[uf(0x94f)]],
        [uf(0xdd5), uf(0x3cf), no[uf(0x73f)]],
        [uf(0x4f9), uf(0x641), no[uf(0x94f)]],
        [uf(0xe16), uf(0x662), no[uf(0x94f)]],
        [uf(0x818), uf(0x5fe), no[uf(0x94f)]],
        [
          uf(0xaa4),
          uf(0x763),
          no[uf(0x94f)],
          (rx) => "+" + nr(rx * 0x64) + "%",
        ],
        [uf(0xcd8), uf(0x55b), no[uf(0x257)]],
        [uf(0xd04), uf(0x72a), no[uf(0x94f)]],
        [uf(0x689), uf(0xd3a), no[uf(0xca5)]],
        [uf(0x931), uf(0x8f2), no[uf(0x94f)], (rx) => rx + "s"],
        [uf(0x59b), uf(0xd5b), no[uf(0x94f)]],
        [uf(0x9bb), uf(0x7aa), no[uf(0x73f)], (rx) => rx / 0x3e8 + "s"],
      ],
      nt = [
        [uf(0x12e), uf(0x10d), no[uf(0x94f)]],
        [uf(0xa50), uf(0x92d), no[uf(0x73f)], (rx) => k9(rx * 0x64) + "%"],
        [uf(0x7e4), uf(0xcec), no[uf(0x73f)]],
        [uf(0x457), uf(0x774), no[uf(0x94f)]],
        [uf(0x70d), uf(0x137), no[uf(0x73f)]],
        [uf(0xaeb), uf(0x71f), no[uf(0x94f)], (rx) => "+" + rx + "%"],
        [uf(0x226), uf(0x146), no[uf(0x94f)], (rx) => k9(rx) + "/s"],
        [uf(0x48b), uf(0x14f), no[uf(0xbba)], (rx) => rx * 0x64 + uf(0x2ce)],
        [uf(0x449), uf(0x52c), no[uf(0x94f)], (rx) => rx + "s"],
        [
          uf(0x21c),
          uf(0x7d8),
          no[uf(0x73f)],
          (rx) => "-" + parseInt((0x1 - rx) * 0x64) + "%",
        ],
      ];
    function nu(rx, ry = !![]) {
      const zJ = uf;
      let rz = "",
        rA = "",
        rB;
      rx[zJ(0x716)] === void 0x0
        ? ((rB = ns),
          rx[zJ(0x66a)] &&
            (rA =
              zJ(0x503) +
              (rx[zJ(0x66a)] / 0x3e8 +
                "s" +
                (rx[zJ(0x7a9)] > 0x0
                  ? zJ(0x469) + rx[zJ(0x7a9)] / 0x3e8 + "s"
                  : "")) +
              zJ(0xa61)))
        : (rB = nt);
      for (let rD = 0x0; rD < rB[zJ(0x441)]; rD++) {
        const [rE, rF, rG, rH] = rB[rD],
          rI = rx[rE];
        rI &&
          rI !== 0x0 &&
          (rz +=
            zJ(0xd86) +
            rG +
            zJ(0x8e4) +
            rF +
            zJ(0xb01) +
            (rH ? rH(rI, rx) : k9(rI)) +
            zJ(0x49a));
      }
      const rC = nA(
        zJ(0x72d) +
          rx[zJ(0x3ed)] +
          zJ(0x9a4) +
          hN[rx[zJ(0xd26)]] +
          zJ(0xa46) +
          hQ[rx[zJ(0xd26)]] +
          zJ(0x22b) +
          rA +
          zJ(0x791) +
          rx[zJ(0xc8d)] +
          zJ(0x22b) +
          rz +
          zJ(0x1f7)
      );
      if (rx[zJ(0x73c)] && ry) {
        rC[zJ(0x3d4)][zJ(0xaf5)][zJ(0x83e)] = zJ(0x66c);
        for (let rJ = 0x0; rJ < rx[zJ(0x73c)][zJ(0x441)]; rJ++) {
          const [rK, rL] = rx[zJ(0x73c)][rJ],
            rM = nA(zJ(0xcc2));
          rC[zJ(0x72b)](rM);
          const rN = f5[rL][rx[zJ(0xd26)]];
          for (let rO = 0x0; rO < rN[zJ(0x441)]; rO++) {
            const [rP, rQ] = rN[rO],
              rR = eW(rK, rQ),
              rS = nA(
                zJ(0x1ab) +
                  rR[zJ(0xd26)] +
                  "\x22\x20" +
                  qk(rR) +
                  zJ(0xc90) +
                  rP +
                  zJ(0x49d)
              );
            rM[zJ(0x72b)](rS);
          }
        }
      }
      return rC;
    }
    function nv() {
      const zK = uf;
      mt && (mt[zK(0xcef)](), (mt = null));
      const rx = ko[zK(0x3f7)](zK(0x900));
      for (let ry = 0x0; ry < rx[zK(0x441)]; ry++) {
        const rz = rx[ry];
        rz[zK(0xcef)]();
      }
      for (let rA = 0x0; rA < iO; rA++) {
        const rB = nA(zK(0xd01));
        rB[zK(0x235)] = rA;
        const rC = iP[rA];
        if (rC) {
          const rD = nA(
            zK(0x572) + rC[zK(0xd26)] + "\x22\x20" + qk(rC) + zK(0x3e3)
          );
          (rD[zK(0x34f)] = rC),
            (rD[zK(0x573)] = !![]),
            (rD[zK(0x8fc)] = iR[zK(0xc19)]()),
            nz(rD, rC),
            rB[zK(0x72b)](rD),
            (iQ[rD[zK(0x8fc)]] = rD);
        }
        rA >= iN
          ? (rB[zK(0x72b)](nA(zK(0xdb4) + ((rA - iN + 0x1) % 0xa) + zK(0x46b))),
            nl[zK(0x72b)](rB))
          : nk[zK(0x72b)](rB);
      }
    }
    function nw(rx) {
      const zL = uf;
      return rx < 0.5
        ? 0x4 * rx * rx * rx
        : 0x1 - Math[zL(0x84e)](-0x2 * rx + 0x2, 0x3) / 0x2;
    }
    var nx = [];
    function ny(rx, ry) {
      const zM = uf;
      (rx[zM(0x1ec)] = 0x0), (rx[zM(0x5f2)] = 0x1);
      let rz = 0x1,
        rA = 0x0,
        rB = -0x1;
      rx[zM(0x30b)][zM(0x5d6)](zM(0x77e)), rx[zM(0x4eb)](zM(0xaf5), "");
      const rC = nA(zM(0xb0c));
      rx[zM(0x72b)](rC), nx[zM(0xaba)](rC);
      const rD = qc;
      rC[zM(0xc8b)] = rC[zM(0x48d)] = rD;
      const rE = rC[zM(0x308)]("2d");
      (rC[zM(0x664)] = function () {
        const zN = zM;
        rE[zN(0x40a)](0x0, 0x0, rD, rD);
        rA < 0.99 &&
          ((rE[zN(0x89c)] = 0x1 - rA),
          (rE[zN(0x9f0)] = zN(0xbf4)),
          rE[zN(0xdd1)](0x0, 0x0, rD, (0x1 - rz) * rD));
        if (rA < 0.01) return;
        (rE[zN(0x89c)] = rA),
          rE[zN(0x64c)](),
          rE[zN(0x90b)](rD / 0x64),
          rE[zN(0x8e8)](0x32, 0x2d);
        let rF = rx[zN(0x1ec)];
        rF = nw(rF);
        const rG = Math["PI"] * 0x2 * rF;
        rE[zN(0x174)](rG * 0x4),
          rE[zN(0x7f5)](),
          rE[zN(0x269)](0x0, 0x0),
          rE[zN(0x5b3)](0x0, 0x0, 0x64, 0x0, rG),
          rE[zN(0x269)](0x0, 0x0),
          rE[zN(0x5b3)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rE[zN(0x9f0)] = zN(0x14e)),
          rE[zN(0x8ab)](zN(0x7e2)),
          rE[zN(0x6c7)]();
      }),
        (rC[zM(0x1b9)] = function () {
          const zO = zM;
          rx[zO(0x1ec)] += pA / (ry[zO(0x66a)] + 0xc8);
          let rF = 0x1,
            rG = rx[zO(0x5f2)];
          rx[zO(0x1ec)] >= 0x1 && (rF = 0x0);
          const rH = rx[zO(0x556)] || rx[zO(0x345)];
          ((rH && rH[zO(0x345)] === nl) || !iy) && ((rG = 0x1), (rF = 0x0));
          (rA = pg(rA, rF, 0x64)), (rz = pg(rz, rG, 0x64));
          const rI = Math[zO(0xc28)]((0x1 - rz) * 0x64),
            rJ = Math[zO(0xc28)](rA * 0x64) / 0x64;
          rJ == 0x0 && rI <= 0x0
            ? ((rC[zO(0x970)] = ![]), (rC[zO(0xaf5)][zO(0xd72)] = zO(0xae3)))
            : ((rC[zO(0x970)] = !![]), (rC[zO(0xaf5)][zO(0xd72)] = "")),
            (rB = rI);
        }),
        rx[zM(0x72b)](nA(zM(0x366) + qk(ry) + zM(0x3e3)));
    }
    function nz(rx, ry, rz = !![]) {
      const zP = uf;
      rz && ry[zP(0x716)] === void 0x0 && ny(rx, ry);
    }
    function nA(rx) {
      const zQ = uf;
      return (hB[zQ(0x2d7)] = rx), hB[zQ(0x806)][0x0];
    }
    var nB = document[uf(0x678)](uf(0xafb)),
      nC = [];
    function nD() {
      const zR = uf;
      (nB[zR(0x2d7)] = zR(0x307)[zR(0x188)](eL * dH)),
        (nC = Array[zR(0x72e)](nB[zR(0x806)]));
    }
    nD();
    var nE = {};
    for (let rx = 0x0; rx < eK[uf(0x441)]; rx++) {
      const ry = eK[rx];
      !nE[ry[uf(0x5a0)]] &&
        ((nE[ry[uf(0x5a0)]] = new lG(
          -0x1,
          ry[uf(0x5a0)],
          0x0,
          0x0,
          ry[uf(0x443)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          ry[uf(0x4e1)],
          0x1
        )),
        (nE[ry[uf(0x5a0)]][uf(0x837)] = !![]));
      const rz = nE[ry[uf(0x5a0)]];
      let rA = null;
      ry[uf(0x382)] !== void 0x0 &&
        (rA = new lG(-0x1, ry[uf(0x382)], 0x0, 0x0, 0x0, ry[uf(0x4e1)], 0x1)),
        (ry[uf(0xa72)] = function (rB) {
          const zS = uf;
          rB[zS(0x656)](0.5, 0.5),
            rz[zS(0xa5a)](rB),
            rA &&
              (rB[zS(0x174)](rz[zS(0x694)]),
              rB[zS(0x8e8)](-ry[zS(0x4e1)] * 0x2, 0x0),
              rA[zS(0xa5a)](rB));
        });
    }
    function nF(rB, rC = ![]) {
      const zT = uf,
        rD = nA(zT(0x572) + rB[zT(0xd26)] + "\x22\x20" + qk(rB) + zT(0x3e3));
      jY(rD), (rD[zT(0x34f)] = rB);
      if (rC) return rD;
      const rE = dH * rB[zT(0xd3e)] + rB[zT(0xd26)],
        rF = nC[rE];
      return nB[zT(0xc23)](rD, rF), rF[zT(0xcef)](), (nC[rE] = rD), rD;
    }
    var nG = document[uf(0x678)](uf(0xb6d)),
      nH = document[uf(0x678)](uf(0x655)),
      nI = document[uf(0x678)](uf(0x7ef)),
      nJ = document[uf(0x678)](uf(0x709)),
      nK = document[uf(0x678)](uf(0x22c)),
      nL = nK[uf(0x678)](uf(0xd4a)),
      nM = nK[uf(0x678)](uf(0xa49)),
      nN = document[uf(0x678)](uf(0xcf7)),
      nO = document[uf(0x678)](uf(0xb09)),
      nP = ![],
      nQ = 0x0,
      nR = ![];
    (nH[uf(0x108)] = function () {
      (nP = !![]), (nQ = 0x0), (nR = ![]);
    }),
      (nJ[uf(0x108)] = function () {
        const zU = uf;
        if (this[zU(0x30b)][zU(0xd59)](zU(0xba0)) || jy) return;
        kI(zU(0x276), (rB) => {
          rB && ((nP = !![]), (nQ = 0x0), (nR = !![]));
        });
      }),
      (nG[uf(0x2d7)] = uf(0x307)[uf(0x188)](dG * dH));
    var nS = Array[uf(0x72e)](nG[uf(0x806)]),
      nT = document[uf(0x678)](uf(0x414)),
      nU = {};
    function nV() {
      const zV = uf;
      for (let rB in nU) {
        nU[rB][zV(0xc48)]();
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
        rC = Array[zW(0x72e)](rB[zW(0x3f7)](zW(0x900)));
      rC[zW(0x266)]((rD, rE) => {
        const zX = zW,
          rF = rE[zX(0x34f)][zX(0xd26)] - rD[zX(0x34f)][zX(0xd26)];
        return rF === 0x0 ? rE[zX(0x34f)]["id"] - rD[zX(0x34f)]["id"] : rF;
      });
      for (let rD = 0x0; rD < rC[zW(0x441)]; rD++) {
        const rE = rC[rD];
        rB[zW(0x72b)](rE);
      }
    }
    function nY(rB, rC) {
      const zY = uf,
        rD = rC[zY(0xd26)] - rB[zY(0xd26)];
      return rD === 0x0 ? rC["id"] - rB["id"] : rD;
    }
    function nZ(rB, rC = !![]) {
      const zZ = uf,
        rD = nA(zZ(0x722) + rB[zZ(0xd26)] + "\x22\x20" + qk(rB) + zZ(0x5dd));
      setTimeout(function () {
        const A0 = zZ;
        rD[A0(0x30b)][A0(0xcef)](A0(0x1db));
      }, 0x1f4),
        (rD[zZ(0x34f)] = rB);
      if (rC) {
      }
      return (rD[zZ(0xbe4)] = rD[zZ(0x678)](zZ(0x6c3))), rD;
    }
    var o0 = nA(uf(0x90d)),
      o1 = o0[uf(0x678)](uf(0x430)),
      o2 = o0[uf(0x678)](uf(0x510)),
      o3 = o0[uf(0x678)](uf(0xd2e)),
      o4 = [];
    for (let rB = 0x0; rB < 0x5; rB++) {
      const rC = nA(uf(0x307));
      (rC[uf(0xdaa)] = function (rD = 0x0) {
        const A1 = uf,
          rE =
            (rB / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rD * Math["PI"] * 0x6,
          rF =
            0x32 +
            (rD > 0x0
              ? Math[A1(0xcb1)](Math[A1(0xb1f)](rD * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[A1(0xaf5)][A1(0xa44)] = Math[A1(0x3a8)](rE) * rF + 0x32 + "%"),
          (this[A1(0xaf5)][A1(0x545)] = Math[A1(0xb1f)](rE) * rF + 0x32 + "%");
      }),
        rC[uf(0xdaa)](),
        (rC[uf(0x37b)] = 0x0),
        (rC["el"] = null),
        (rC[uf(0x86e)] = function () {
          const A2 = uf;
          (rC[A2(0x37b)] = 0x0), (rC["el"] = null), (rC[A2(0x2d7)] = "");
        }),
        (rC[uf(0x61c)] = function (rD) {
          const A3 = uf;
          if (!rC["el"]) {
            const rE = nZ(oJ, ![]);
            (rE[A3(0x108)] = function () {
              if (oL || oN) return;
              oR(null);
            }),
              rC[A3(0x72b)](rE),
              (rC["el"] = rE);
          }
          (rC[A3(0x37b)] += rD), oP(rC["el"][A3(0xbe4)], rC[A3(0x37b)]);
        }),
        o1[uf(0x72b)](rC),
        o4[uf(0xaba)](rC);
    }
    var o5,
      o6 = document[uf(0x678)](uf(0xa30)),
      o7 = document[uf(0x678)](uf(0x147)),
      o8 = document[uf(0x678)](uf(0x514)),
      o9 = document[uf(0x678)](uf(0x747)),
      oa = {};
    function ob() {
      const A4 = uf,
        rD = document[A4(0x678)](A4(0xcf9));
      for (let rE = 0x0; rE < dH; rE++) {
        const rF = nA(A4(0x730) + rE + A4(0xa77));
        (rF[A4(0x108)] = function () {
          const A5 = A4;
          let rG = p9;
          p9 = !![];
          for (const rH in nU) {
            const rI = dC[rH];
            if (rI[A5(0xd26)] !== rE) continue;
            const rJ = nU[rH];
            rJ[A5(0x751)][A5(0x708)]();
          }
          p9 = rG;
        }),
          (oa[rE] = rF),
          rD[A4(0x72b)](rF);
      }
    }
    ob();
    var oc = ![],
      od = document[uf(0x678)](uf(0x52d));
    od[uf(0x108)] = function () {
      const A6 = uf;
      document[A6(0x4f6)][A6(0x30b)][A6(0xb62)](A6(0x453)),
        (oc = document[A6(0x4f6)][A6(0x30b)][A6(0xd59)](A6(0x453)));
      const rD = oc ? A6(0x6ce) : A6(0x5af);
      k8(o7, rD),
        k8(o9, rD),
        oc
          ? (o6[A6(0x72b)](o0), o0[A6(0x72b)](nG), o8[A6(0xcef)]())
          : (o6[A6(0x72b)](o8),
            o8[A6(0xc23)](nG, o8[A6(0x3d4)]),
            o0[A6(0xcef)]());
    };
    var oe = document[uf(0x678)](uf(0x3f9)),
      of = oi(uf(0x3cd), no[uf(0xd27)]),
      og = oi(uf(0xaff), no[uf(0xbba)]),
      oh = oi(uf(0xcb8), no[uf(0x257)]);
    function oi(rD, rE) {
      const A7 = uf,
        rF = nA(A7(0x532) + rE + A7(0xc4c) + rD + A7(0xdff));
      return (
        (rF[A7(0xd55)] = function (rG) {
          const A8 = A7;
          k8(rF[A8(0x806)][0x1], k9(Math[A8(0xc28)](rG)));
        }),
        oe[A7(0x72b)](rF),
        rF
      );
    }
    var oj = document[uf(0x678)](uf(0x49e)),
      ok = document[uf(0x678)](uf(0x1ef));
    ok[uf(0x2d7)] = "";
    var ol = document[uf(0x678)](uf(0x916)),
      om = {};
    function on() {
      const A9 = uf;
      (ok[A9(0x2d7)] = ""), (ol[A9(0x2d7)] = "");
      const rD = {},
        rE = [];
      for (let rF in om) {
        const rG = dC[rF],
          rH = om[rF];
        (rD[rG[A9(0xd26)]] = (rD[rG[A9(0xd26)]] || 0x0) + rH),
          rE[A9(0xaba)]([rG, rH]);
      }
      if (rE[A9(0x441)] === 0x0) {
        oj[A9(0xaf5)][A9(0xd72)] = A9(0xae3);
        return;
      }
      (oj[A9(0xaf5)][A9(0xd72)] = ""),
        rE[A9(0x266)]((rI, rJ) => {
          return nY(rI[0x0], rJ[0x0]);
        })[A9(0xd78)](([rI, rJ]) => {
          const Aa = A9,
            rK = nZ(rI);
          jY(rK), oP(rK[Aa(0xbe4)], rJ), ok[Aa(0x72b)](rK);
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
            Ab(0xd3b) + k9(rH) + "\x20" + rG + Ab(0xa46) + hP[rG] + Ab(0x103)
          );
          rD[Ab(0x94e)](rI);
        }
      }
      rF % 0x2 === 0x1 &&
        (rD[Ab(0x806)][0x0][Ab(0xaf5)][Ab(0x3a0)] = Ab(0x49f));
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
          Ac(0x9d5) + (or + 0x1) + Ac(0x991) + iJ(ot) + "/" + iJ(ou) + Ac(0x10e)
        );
      const rE = d6(or);
      of[Ac(0xd55)](0xc8 * rE),
        og[Ac(0xd55)](0x19 * rE),
        oh[Ac(0xd55)](d5(or)),
        (ow = Math[Ac(0xbd3)](0x1, ot / ou)),
        (oy = 0x0),
        (nJ[Ac(0x678)](Ac(0x5c6))[Ac(0x2d7)] =
          or >= cH ? Ac(0x835) : Ac(0x294) + (cH + 0x1) + Ac(0x89f));
    }
    var oB = 0x0,
      oC = document[uf(0x678)](uf(0x23f));
    for (let rD = 0x0; rD < cZ[uf(0x441)]; rD++) {
      const [rE, rF] = cZ[rD],
        rG = j7[rE],
        rH = nA(
          uf(0xd77) +
            hP[rG] +
            uf(0x43e) +
            rG +
            uf(0x371) +
            (rF + 0x1) +
            uf(0xb3d)
        );
      (rH[uf(0x108)] = function () {
        const Ad = uf;
        if (or >= rF) {
          const rI = oC[Ad(0x678)](Ad(0x92b));
          rI && rI[Ad(0x30b)][Ad(0xcef)](Ad(0x6e2)),
            (oB = rD),
            (hD[Ad(0xadc)] = rD),
            this[Ad(0x30b)][Ad(0x5d6)](Ad(0x6e2));
        }
      }),
        (cZ[rD][uf(0x769)] = rH),
        oC[uf(0x72b)](rH);
    }
    function oD() {
      const Ae = uf,
        rI = parseInt(hD[Ae(0xadc)]) || 0x0;
      cZ[0x0][Ae(0x769)][Ae(0x708)](),
        cZ[Ae(0xd78)]((rJ, rK) => {
          const Af = Ae,
            rL = rJ[0x1];
          if (or >= rL) {
            rJ[Af(0x769)][Af(0x30b)][Af(0xcef)](Af(0xba0));
            if (rI === rK) rJ[Af(0x769)][Af(0x708)]();
          } else rJ[Af(0x769)][Af(0x30b)][Af(0x5d6)](Af(0xba0));
        });
    }
    var oE = document[uf(0x678)](uf(0x8f9));
    setInterval(() => {
      const Ag = uf;
      if (!o6[Ag(0x30b)][Ag(0xd59)](Ag(0x841))) return;
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
          const rM = oG(rL, op[rL][Ah(0x37b)]);
          (rJ += rM), (rI += rM);
        }
        if (rJ > 0x0) {
          const rN = Math[Ah(0xbd3)](0x19, (rJ / rI) * 0x64),
            rO = rN > 0x1 ? rN[Ah(0x40d)](0x2) : rN[Ah(0x40d)](0x5);
          k8(oE, "+" + rO + "%");
        }
      }
    }
    function oG(rI, rJ) {
      const Ai = uf,
        rK = dC[rI];
      if (!rK) return 0x0;
      const rL = rK[Ai(0xd26)];
      return Math[Ai(0x84e)](rL * 0xa, rL) * rJ;
    }
    var oH = document[uf(0x678)](uf(0x7fa));
    (oH[uf(0x108)] = function () {
      const Aj = uf;
      for (const rI in op) {
        const rJ = op[rI];
        rJ[Aj(0xc48)]();
      }
      oI();
    }),
      oI(),
      oA();
    function oI() {
      const Ak = uf,
        rI = Object[Ak(0xd96)](op);
      nI[Ak(0x30b)][Ak(0xcef)](Ak(0x6af));
      const rJ = rI[Ak(0x441)] === 0x0;
      (oH[Ak(0xaf5)][Ak(0xd72)] = rJ ? Ak(0xae3) : ""), (oz = 0x0);
      let rK = 0x0;
      const rL = rI[Ak(0x441)] > 0x1 ? 0x32 : 0x0;
      for (let rN = 0x0, rO = rI[Ak(0x441)]; rN < rO; rN++) {
        const rP = rI[rN],
          rQ = (rN / rO) * Math["PI"] * 0x2;
        rP[Ak(0x5b0)](
          Math[Ak(0x3a8)](rQ) * rL + 0x32,
          Math[Ak(0xb1f)](rQ) * rL + 0x32
        ),
          (oz += d3[rP["el"][Ak(0x34f)][Ak(0xd26)]] * rP[Ak(0x37b)]);
      }
      nI[Ak(0x30b)][rL ? Ak(0x5d6) : Ak(0xcef)](Ak(0x6af)),
        nH[Ak(0x30b)][rI[Ak(0x441)] > 0x0 ? Ak(0xcef) : Ak(0x5d6)](Ak(0x6e3));
      const rM = or >= cH;
      nJ[Ak(0x30b)][rI[Ak(0x441)] > 0x0 && rM ? Ak(0xcef) : Ak(0x5d6)](
        Ak(0xba0)
      ),
        oF(),
        (nI[Ak(0xaf5)][Ak(0xa99)] = ""),
        (nP = ![]),
        (nR = ![]),
        (nQ = 0x0),
        (ov = Math[Ak(0xbd3)](0x1, (ot + oz) / ou) || 0x0),
        k8(nN, oz > 0x0 ? "+" + iJ(oz) + Ak(0x10e) : "");
    }
    var oJ,
      oK = 0x0,
      oL = ![],
      oM = 0x0,
      oN = null;
    function oO() {
      const Al = uf;
      o2[Al(0x30b)][oK < 0x5 ? Al(0x5d6) : Al(0xcef)](Al(0x6e3));
    }
    o2[uf(0x108)] = function () {
      const Am = uf;
      if (oL || !oJ || oK < 0x5 || !ik() || oN) return;
      (oL = !![]), (oM = 0x0), (oN = null), o2[Am(0x30b)][Am(0x5d6)](Am(0x6e3));
      const rI = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      rI[Am(0x969)](0x0, cI[Am(0xac8)]),
        rI[Am(0x2f7)](0x1, oJ["id"]),
        rI[Am(0x98a)](0x3, oK),
        il(rI);
    };
    function oP(rI, rJ) {
      k8(rI, "x" + iJ(rJ));
    }
    function oQ(rI) {
      const An = uf;
      typeof rI === An(0x657) && (rI = nr(rI)), k8(o3, rI + An(0xd56));
    }
    function oR(rI) {
      const Ao = uf;
      oJ && mQ(oJ["id"], oK);
      o5 && o5[Ao(0x708)]();
      (oJ = rI), (oK = 0x0), oO();
      for (let rJ = 0x0; rJ < o4[Ao(0x441)]; rJ++) {
        o4[rJ][Ao(0x86e)]();
      }
      oJ
        ? (oQ(dE[oJ[Ao(0xd26)]] * (jy ? 0x2 : 0x1) * (he ? 0.9 : 0x1)),
          (o2[Ao(0xaf5)][Ao(0x397)] = hQ[oJ[Ao(0xd26)] + 0x1]))
        : oQ("?");
    }
    var oS = 0x0,
      oT = 0x1;
    function oU(rI) {
      const Ap = uf,
        rJ = dC[rI],
        rK = nZ(rJ);
      (rK[Ap(0xdd2)] = pc), jY(rK), (rK[Ap(0x5e1)] = !![]), nT[Ap(0x72b)](rK);
      const rL = nZ(rJ);
      jY(rL), (rL[Ap(0xdd2)] = o6);
      rJ[Ap(0xd26)] >= dc && rL[Ap(0x30b)][Ap(0x5d6)](Ap(0xc59));
      rL[Ap(0x108)] = function () {
        const Aq = Ap;
        pz - oS < 0x1f4 ? oT++ : (oT = 0x1);
        oS = pz;
        if (oc) {
          if (oL || rJ[Aq(0xd26)] >= dc) return;
          const rP = iS[rJ["id"]];
          if (!rP) return;
          oJ !== rJ && oR(rJ);
          const rQ = o4[Aq(0x441)];
          let rR = p9 ? rP : Math[Aq(0xbd3)](rQ * oT, rP);
          mQ(rJ["id"], -rR), (oK += rR), oO();
          let rS = rR % rQ,
            rT = (rR - rS) / rQ;
          const rU = [...o4][Aq(0x266)](
            (rW, rX) => rW[Aq(0x37b)] - rX[Aq(0x37b)]
          );
          rT > 0x0 && rU[Aq(0xd78)]((rW) => rW[Aq(0x61c)](rT));
          let rV = 0x0;
          while (rS--) {
            const rW = rU[rV];
            (rV = (rV + 0x1) % rQ), rW[Aq(0x61c)](0x1);
          }
          return;
        }
        if (!op[rJ["id"]]) {
          const rX = nZ(rJ, ![]);
          k8(rX[Aq(0xbe4)], "x1"),
            (rX[Aq(0x108)] = function (rZ) {
              const Ar = Aq;
              rY[Ar(0xc48)](), oI();
            }),
            nI[Aq(0x72b)](rX);
          const rY = {
            petal: rJ,
            count: 0x0,
            el: rX,
            setPos(rZ, s0) {
              const As = Aq;
              (rX[As(0xaf5)][As(0xa44)] = rZ + "%"),
                (rX[As(0xaf5)][As(0x545)] = s0 + "%"),
                (rX[As(0xaf5)][As(0x43a)] = As(0xdc5));
            },
            dispose(rZ = !![]) {
              const At = Aq;
              rX[At(0xcef)](),
                rZ && mQ(rJ["id"], this[At(0x37b)]),
                delete op[rJ["id"]];
            },
          };
          (op[rJ["id"]] = rY), oI();
        }
        const rO = op[rJ["id"]];
        if (iS[rJ["id"]]) {
          const rZ = iS[rJ["id"]],
            s0 = p9 ? rZ : Math[Aq(0xbd3)](0x1 * oT, rZ);
          (rO[Aq(0x37b)] += s0),
            mQ(rJ["id"], -s0),
            oP(rO["el"][Aq(0xbe4)], rO[Aq(0x37b)]);
        }
        oI();
      };
      const rM = dH * rJ[Ap(0xd3e)] + rJ[Ap(0x61d)],
        rN = nS[rM];
      return (
        nG[Ap(0xc23)](rL, rN),
        rN[Ap(0xcef)](),
        (nS[rM] = rL),
        (rK[Ap(0x4b0)] = function (rO) {
          const Au = Ap;
          oP(rK[Au(0xbe4)], rO), oP(rL[Au(0xbe4)], rO);
        }),
        (rK[Ap(0x751)] = rL),
        (nU[rI] = rK),
        (rK[Ap(0xc48)] = function () {
          const Av = Ap;
          rK[Av(0xcef)](), delete nU[rI];
          const rO = nA(Av(0x307));
          (nS[rM] = rO), nG[Av(0xc23)](rO, rL), rL[Av(0xcef)]();
        }),
        rK[Ap(0x4b0)](iS[rI]),
        rK
      );
    }
    var oV = {},
      oW = {};
    function oX(rI, rJ, rK, rL) {
      const Aw = uf,
        rM = document[Aw(0x678)](rK);
      (rM[Aw(0x91c)] = function () {
        const Ax = Aw;
        (oV[rI] = this[Ax(0x5fa)]),
          (hD[rI] = this[Ax(0x5fa)] ? "1" : "0"),
          rL && rL(this[Ax(0x5fa)]);
      }),
        (oW[rI] = function () {
          const Ay = Aw;
          rM[Ay(0x708)]();
        }),
        (rM[Aw(0x5fa)] = hD[rI] === void 0x0 ? rJ : hD[rI] === "1"),
        rM[Aw(0x91c)]();
    }
    var oY = document[uf(0x678)](uf(0x47d));
    (oY[uf(0x34f)] = function () {
      const Az = uf;
      return nA(
        Az(0x9c0) + hP[Az(0x5b2)] + Az(0x11a) + hP[Az(0x6ab)] + Az(0x6c0)
      );
    }),
      oX(uf(0x517), ![], uf(0x9ec), mq),
      oX(uf(0x7fe), !![], uf(0xc2a)),
      oX(uf(0x23c), !![], uf(0x274)),
      oX(
        uf(0x187),
        !![],
        uf(0xb41),
        (rI) => (kK[uf(0xaf5)][uf(0xd72)] = rI ? "" : uf(0xae3))
      ),
      oX(uf(0xbbe), ![], uf(0xb14)),
      oX(uf(0x298), ![], uf(0x175)),
      oX(uf(0x9ee), ![], uf(0x590)),
      oX(uf(0x7df), !![], uf(0x792)),
      oX(
        uf(0xa66),
        !![],
        uf(0x6ca),
        (rI) => (oY[uf(0xaf5)][uf(0xd72)] = rI ? "" : uf(0xae3))
      ),
      oX(uf(0x5db), ![], uf(0xb3c), kT),
      oX(uf(0xb84), ![], uf(0x375), kX),
      oX(uf(0xd87), ![], uf(0x979), (rI) => oZ(ko, uf(0x2f2), rI)),
      oX(uf(0xde8), !![], uf(0x423), (rI) =>
        oZ(document[uf(0x4f6)], uf(0xd8f), !rI)
      ),
      oX(uf(0x201), !![], uf(0x33e), (rI) =>
        oZ(document[uf(0x4f6)], uf(0xa48), !rI)
      ),
      oX(uf(0xd4d), !![], uf(0x6e5));
    function oZ(rI, rJ, rK) {
      const AA = uf;
      rI[AA(0x30b)][rK ? AA(0x5d6) : AA(0xcef)](rJ);
    }
    function p0() {
      const AB = uf,
        rI = document[AB(0x678)](AB(0xcd0)),
        rJ = [];
      for (let rL = 0x0; rL <= 0xa; rL++) {
        rJ[AB(0xaba)](0x1 - rL * 0.05);
      }
      for (const rM of rJ) {
        const rN = nA(AB(0x586) + rM + "\x22>" + nr(rM * 0x64) + AB(0x7f0));
        rI[AB(0x72b)](rN);
      }
      let rK = parseFloat(hD[AB(0x98b)]);
      (isNaN(rK) || !rJ[AB(0x60a)](rK)) && (rK = rJ[0x0]),
        (rI[AB(0xcb7)] = rK),
        (kP = rK),
        (rI[AB(0x91c)] = function () {
          const AC = AB;
          (kP = parseFloat(this[AC(0xcb7)])),
            (hD[AC(0x98b)] = this[AC(0xcb7)]),
            kX();
        });
    }
    p0();
    var p1 = document[uf(0x678)](uf(0x99b)),
      p2 = document[uf(0x678)](uf(0x4c7));
    p2[uf(0x7ca)] = cL;
    var p3 = document[uf(0x678)](uf(0xa7d));
    function p4(rI) {
      const AD = uf,
        rJ = nA(AD(0xd68));
      kl[AD(0x72b)](rJ);
      const rK = rJ[AD(0x678)](AD(0xc2c));
      rK[AD(0xcb7)] = rI;
      const rL = rJ[AD(0x678)](AD(0x9e0));
      (rL[AD(0x91c)] = function () {
        const AE = AD;
        rK[AE(0x5a0)] = this[AE(0x5fa)] ? AE(0x3dd) : AE(0x49c);
      }),
        (rJ[AD(0x678)](AD(0xd5d))[AD(0x108)] = function () {
          const AF = AD;
          jp(rI), hc(AF(0x9ad));
        }),
        (rJ[AD(0x678)](AD(0x1b8))[AD(0x108)] = function () {
          const AG = AD,
            rM = {};
          rM[AG(0x5a0)] = AG(0x83d);
          const rN = new Blob([rI], rM),
            rO = document[AG(0x6a4)]("a");
          (rO[AG(0xd21)] = URL[AG(0xca6)](rN)),
            (rO[AG(0x218)] = (jv ? jv : AG(0x178)) + AG(0x946)),
            rO[AG(0x708)](),
            hc(AG(0x69e));
        }),
        (rJ[AD(0x678)](AD(0xafd))[AD(0x108)] = function () {
          const AH = AD;
          rJ[AH(0xcef)]();
        });
    }
    function p5() {
      const AI = uf,
        rI = nA(AI(0xcd5));
      kl[AI(0x72b)](rI);
      const rJ = rI[AI(0x678)](AI(0xc2c)),
        rK = rI[AI(0x678)](AI(0x9e0));
      (rK[AI(0x91c)] = function () {
        const AJ = AI;
        rJ[AJ(0x5a0)] = this[AJ(0x5fa)] ? AJ(0x3dd) : AJ(0x49c);
      }),
        (rI[AI(0x678)](AI(0xafd))[AI(0x108)] = function () {
          const AK = AI;
          rI[AK(0xcef)]();
        }),
        (rI[AI(0x678)](AI(0x90e))[AI(0x108)] = function () {
          const AL = AI,
            rL = rJ[AL(0xcb7)][AL(0xd69)]();
          if (eV(rL)) {
            delete hD[AL(0x5c0)], (hD[AL(0x213)] = rL);
            if (hU)
              try {
                hU[AL(0xb36)]();
              } catch (rM) {}
            hc(AL(0xb68));
          } else hc(AL(0x96f));
        });
    }
    (document[uf(0x678)](uf(0x8ef))[uf(0x108)] = function () {
      const AM = uf;
      if (i5) {
        p4(i5);
        return;
        const rI = prompt(AM(0xb42), i5);
        if (rI !== null) {
          const rJ = {};
          rJ[AM(0x5a0)] = AM(0x83d);
          const rK = new Blob([i5], rJ),
            rL = document[AM(0x6a4)]("a");
          (rL[AM(0xd21)] = URL[AM(0xca6)](rK)),
            (rL[AM(0x218)] = jv + AM(0xdcd)),
            rL[AM(0x708)](),
            alert(AM(0x10c));
        }
      }
    }),
      (document[uf(0x678)](uf(0x4f1))[uf(0x108)] = function () {
        const AN = uf;
        p5();
        return;
        const rI = prompt(AN(0xc11));
        if (rI !== null) {
          if (eV(rI)) {
            let rJ = AN(0xbe3);
            i6 && (rJ += AN(0x6cf));
            if (confirm(rJ)) {
              delete hD[AN(0x5c0)], (hD[AN(0x213)] = rI);
              if (hU)
                try {
                  hU[AN(0xb36)]();
                } catch (rK) {}
            }
          } else alert(AN(0x96f));
        }
      }),
      oX(uf(0xd32), ![], uf(0x297), (rI) =>
        p2[uf(0x30b)][rI ? uf(0x5d6) : uf(0xcef)](uf(0xcb9))
      ),
      oX(uf(0x515), !![], uf(0x873));
    var p6 = 0x0,
      p7 = 0x0,
      p8 = 0x0,
      p9 = ![];
    function pa(rI, rJ) {
      const AO = uf;
      (rI === AO(0xcd7) || rI === AO(0x9d2)) && (p9 = rJ);
      if (rJ) {
        switch (rI) {
          case AO(0x8dd):
            m1[AO(0xc8a)][AO(0xb62)]();
            break;
          case AO(0xb22):
            m1[AO(0x5f3)][AO(0xb62)]();
            break;
          case AO(0x849):
            m1[AO(0xb88)][AO(0xb62)]();
            break;
          case AO(0xdc2):
            pM[AO(0x30b)][AO(0xb62)](AO(0x6e2));
            break;
          case AO(0x339):
            oW[AO(0xbbe)](), hc(AO(0xc0d) + (oV[AO(0xbbe)] ? "ON" : AO(0x400)));
            break;
          case AO(0x505):
            oW[AO(0x298)](), hc(AO(0x8aa) + (oV[AO(0x298)] ? "ON" : AO(0x400)));
            break;
          case AO(0x4e2):
            oW[AO(0x187)](), hc(AO(0xd94) + (oV[AO(0x187)] ? "ON" : AO(0x400)));
            break;
          case AO(0xdea):
            oW[AO(0x9ee)](), hc(AO(0x376) + (oV[AO(0x9ee)] ? "ON" : AO(0x400)));
            break;
          case AO(0xbb4):
            if (!mt && hW) {
              const rK = nk[AO(0x3f7)](AO(0x221)),
                rL = nl[AO(0x3f7)](AO(0x221));
              for (let rM = 0x0; rM < rK[AO(0x441)]; rM++) {
                const rN = rK[rM],
                  rO = rL[rM],
                  rP = mT(rN),
                  rQ = mT(rO);
                if (rP) mU(rP, rO);
                else rQ && mU(rQ, rN);
              }
              il(new Uint8Array([cI[AO(0xdc0)]]));
            }
            break;
          default:
            if (!mt && hW && rI[AO(0x313)](AO(0x681)))
              rY: {
                let rR = parseInt(rI[AO(0x923)](0x5));
                if (n8[AO(0x4e2)]) {
                  p9 ? ku(rR) : kx(rR);
                  break rY;
                }
                rR === 0x0 && (rR = 0xa);
                iN > 0xa && p9 && (rR += 0xa);
                rR--;
                if (rR >= 0x0) {
                  const rS = nk[AO(0x3f7)](AO(0x221))[rR],
                    rT = nl[AO(0x3f7)](AO(0x221))[rR];
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
        rI === AO(0x4f8) &&
          (kk[AO(0xaf5)][AO(0xd72)] === "" &&
          p2[AO(0xaf5)][AO(0xd72)] === AO(0xae3)
            ? kD[AO(0x708)]()
            : p2[AO(0x6d4)]()),
          delete n8[rI];
      if (iy) {
        if (oV[AO(0x517)]) {
          let rW = 0x0,
            rX = 0x0;
          if (n8[AO(0x9c7)] || n8[AO(0xe03)]) rX = -0x1;
          else (n8[AO(0xae9)] || n8[AO(0x2d1)]) && (rX = 0x1);
          if (n8[AO(0x158)] || n8[AO(0x473)]) rW = -0x1;
          else (n8[AO(0xc43)] || n8[AO(0x325)]) && (rW = 0x1);
          if (rW !== 0x0 || rX !== 0x0)
            (p6 = Math[AO(0x31e)](rX, rW)), im(p6, 0x1);
          else (p7 !== 0x0 || p8 !== 0x0) && im(p6, 0x0);
          (p7 = rW), (p8 = rX);
        }
        pb();
      }
    }
    function pb() {
      const AP = uf,
        rI = n8[AP(0x44c)] || n8[AP(0x9d2)] || n8[AP(0xcd7)],
        rJ = n8[AP(0x794)] || n8[AP(0x24c)],
        rK = (rI << 0x1) | rJ;
      mV !== rK && ((mV = rK), il(new Uint8Array([cI[AP(0xdc9)], rK])));
    }
    var pc = document[uf(0x678)](uf(0x38d)),
      pd = 0x0,
      pe = 0x0,
      pf = 0x0;
    function pg(rI, rJ, rK) {
      const AQ = uf;
      return rI + (rJ - rI) * Math[AQ(0xbd3)](0x1, pA / rK);
    }
    var ph = 0x1,
      pi = [];
    for (let rI in cS) {
      if (
        [uf(0x764), uf(0xc73), uf(0xda0), uf(0xcc5), uf(0x4fc), uf(0x66b)][
          uf(0x60a)
        ](rI)
      )
        continue;
      pi[uf(0xaba)](cS[rI]);
    }
    var pj = [];
    for (let rJ = 0x0; rJ < 0x1e; rJ++) {
      pk();
    }
    function pk(rK = !![]) {
      const AR = uf,
        rL = new lG(
          -0x1,
          pi[Math[AR(0x508)](Math[AR(0x9e1)]() * pi[AR(0x441)])],
          0x0,
          Math[AR(0x9e1)]() * d1,
          Math[AR(0x9e1)]() * 6.28
        );
      if (!rL[AR(0x6ed)] && Math[AR(0x9e1)]() < 0.01) rL[AR(0x809)] = !![];
      rL[AR(0x6ed)]
        ? (rL[AR(0xa17)] = rL[AR(0xbab)] = Math[AR(0x9e1)]() * 0x8 + 0xc)
        : (rL[AR(0xa17)] = rL[AR(0xbab)] = Math[AR(0x9e1)]() * 0x1e + 0x19),
        rK
          ? (rL["x"] = Math[AR(0x9e1)]() * d0)
          : (rL["x"] = -rL[AR(0xbab)] * 0x2),
        (rL[AR(0xde4)] =
          (Math[AR(0x9e1)]() * 0x3 + 0x4) * rL[AR(0xa17)] * 0.02),
        (rL[AR(0xb4c)] = (Math[AR(0x9e1)]() * 0x2 - 0x1) * 0.05),
        pj[AR(0xaba)](rL);
    }
    var pl = 0x0,
      pm = 0x0,
      pn = 0x0,
      po = 0x0;
    setInterval(function () {
      const AS = uf,
        rK = [ki, qe, ...Object[AS(0xd96)](pp), ...nx],
        rL = rK[AS(0x441)];
      let rM = 0x0;
      for (let rN = 0x0; rN < rL; rN++) {
        const rO = rK[rN];
        rM += rO[AS(0xc8b)] * rO[AS(0x48d)];
      }
      kK[AS(0x4eb)](
        AS(0x4b4),
        Math[AS(0xc28)](0x3e8 / pA) +
          AS(0x75c) +
          iw[AS(0x441)] +
          AS(0x810) +
          rL +
          AS(0xbe5) +
          iJ(rM) +
          AS(0xbc6) +
          (po / 0x3e8)[AS(0x40d)](0x2) +
          AS(0x36b)
      ),
        (po = 0x0);
    }, 0x3e8);
    var pp = {};
    function pq(rK, rL, rM, rN, rO, rP = ![]) {
      const AT = uf;
      if (!pp[rL]) {
        const rS = hx
          ? new OffscreenCanvas(0x1, 0x1)
          : document[AT(0x6a4)](AT(0xc98));
        (rS[AT(0x3f3)] = rS[AT(0x308)]("2d")),
          (rS[AT(0xb11)] = 0x0),
          (rS[AT(0xd7b)] = rM),
          (rS[AT(0x5e3)] = rN),
          (pp[rL] = rS);
      }
      const rQ = pp[rL],
        rR = rQ[AT(0x3f3)];
      if (pz - rQ[AT(0xb11)] > 0x1f4) {
        rQ[AT(0xb11)] = pz;
        const rT = rK[AT(0xc9a)](),
          rU = Math[AT(0x5d7)](rT["a"], rT["b"]) * 1.5,
          rV = kW * rU,
          rW = Math[AT(0x446)](rQ[AT(0xd7b)] * rV) || 0x1;
        rW !== rQ["w"] &&
          ((rQ["w"] = rW),
          (rQ[AT(0xc8b)] = rW),
          (rQ[AT(0x48d)] = Math[AT(0x446)](rQ[AT(0x5e3)] * rV) || 0x1),
          rR[AT(0x64c)](),
          rR[AT(0x656)](rV, rV),
          rO(rR),
          rR[AT(0x6c7)]());
      }
      rQ[AT(0x57d)] = !![];
      if (rP) return rQ;
      rK[AT(0xda4)](
        rQ,
        -rQ[AT(0xd7b)] / 0x2,
        -rQ[AT(0x5e3)] / 0x2,
        rQ[AT(0xd7b)],
        rQ[AT(0x5e3)]
      );
    }
    var pr = /^((?!chrome|android).)*safari/i[uf(0x5d0)](navigator[uf(0xa24)]),
      ps = pr ? 0.25 : 0x0;
    function pt(rK, rL, rM = 0x14, rN = uf(0x737), rO = 0x4, rP, rQ = "") {
      const AU = uf,
        rR = AU(0x8d8) + rM + AU(0x9af) + iA;
      let rS, rT;
      const rU = rL + "_" + rR + "_" + rN + "_" + rO + "_" + rQ,
        rV = pp[rU];
      if (!rV) {
        rK[AU(0xa3f)] = rR;
        const rW = rK[AU(0x712)](rL);
        (rS = rW[AU(0xc8b)] + rO), (rT = rM + rO);
      } else (rS = rV[AU(0xd7b)]), (rT = rV[AU(0x5e3)]);
      return pq(
        rK,
        rU,
        rS,
        rT,
        function (rX) {
          const AV = AU;
          rX[AV(0x8e8)](rO / 0x2, rO / 0x2 - rT * ps),
            (rX[AV(0xa3f)] = rR),
            (rX[AV(0x6f7)] = AV(0x545)),
            (rX[AV(0xcc6)] = AV(0xa44)),
            (rX[AV(0x659)] = rO),
            (rX[AV(0x4b9)] = AV(0x1be)),
            (rX[AV(0x9f0)] = rN),
            rO > 0x0 && rX[AV(0x3ce)](rL, 0x0, 0x0),
            rX[AV(0x3d0)](rL, 0x0, 0x0);
        },
        rP
      );
    }
    var pu = 0x1;
    function pv(rK = cI[uf(0xd0c)]) {
      const AW = uf,
        rL = Object[AW(0xd96)](op),
        rM = new DataView(
          new ArrayBuffer(0x1 + 0x2 + rL[AW(0x441)] * (0x2 + 0x4))
        );
      let rN = 0x0;
      rM[AW(0x969)](rN++, rK), rM[AW(0x2f7)](rN, rL[AW(0x441)]), (rN += 0x2);
      for (let rO = 0x0; rO < rL[AW(0x441)]; rO++) {
        const rP = rL[rO];
        rM[AW(0x2f7)](rN, rP[AW(0x34f)]["id"]),
          (rN += 0x2),
          rM[AW(0x98a)](rN, rP[AW(0x37b)]),
          (rN += 0x4);
      }
      il(rM);
    }
    function pw() {
      const AX = uf;
      o5[AX(0xcef)](), o1[AX(0x30b)][AX(0xcef)](AX(0xc07)), (o5 = null);
    }
    var px = [];
    function py() {
      const AY = uf;
      for (let rK = 0x0; rK < px[AY(0x441)]; rK++) {
        const rL = px[rK],
          rM = rL[AY(0xd4f)],
          rN = rM && !rM[AY(0x427)];
        rN
          ? ((rL[AY(0x427)] = ![]),
            (rL[AY(0x5d2)] = rM[AY(0x5d2)]),
            (rL[AY(0x42f)] = rM[AY(0x42f)]),
            (rL[AY(0xb32)] = rM[AY(0xb32)]),
            (rL[AY(0xd46)] = rM[AY(0xd46)]),
            (rL[AY(0x2c4)] = rM[AY(0x2c4)]),
            (rL[AY(0xb98)] = rM[AY(0xb98)]),
            (rL[AY(0xbfa)] = rM[AY(0xbfa)]),
            (rL[AY(0xb0b)] = rM[AY(0xb0b)]),
            (rL[AY(0x1a6)] = rM[AY(0x1a6)]),
            (rL[AY(0x3b1)] = rM[AY(0x3b1)]),
            (rL[AY(0xd9a)] = rM[AY(0xd9a)]),
            (rL[AY(0xc7f)] = rM[AY(0xc7f)]),
            (rL[AY(0x381)] = rM[AY(0x381)]),
            (rL[AY(0x694)] = rM[AY(0x694)]),
            (rL[AY(0x78c)] = rM[AY(0x78c)]),
            j0(rL, rM))
          : ((rL[AY(0x427)] = !![]),
            (rL[AY(0x106)] = 0x0),
            (rL[AY(0x42f)] = 0x1),
            (rL[AY(0x5d2)] = 0x0),
            (rL[AY(0xb32)] = ![]),
            (rL[AY(0xd46)] = 0x0),
            (rL[AY(0x2c4)] = 0x0),
            (rL[AY(0xbfa)] = pg(rL[AY(0xbfa)], 0x0, 0xc8)),
            (rL[AY(0xb98)] = pg(rL[AY(0xb98)], 0x0, 0xc8)),
            (rL[AY(0x78c)] = pg(rL[AY(0x78c)], 0x0, 0xc8)));
        if (rK > 0x0) {
          if (rM) {
            const rO = Math[AY(0x31e)](rM["y"] - pe, rM["x"] - pd);
            rL[AY(0x6d0)] === void 0x0
              ? (rL[AY(0x6d0)] = rO)
              : (rL[AY(0x6d0)] = f8(rL[AY(0x6d0)], rO, 0.1));
          }
          rL[AY(0x4d9)] += ((rN ? -0x1 : 0x1) * pA) / 0x320;
          if (rL[AY(0x4d9)] < 0x0) rL[AY(0x4d9)] = 0x0;
          rL[AY(0x4d9)] > 0x1 && px[AY(0xde9)](rK, 0x1);
        }
      }
    }
    var pz = Date[uf(0xe04)](),
      pA = 0x0,
      pB = 0x0,
      pC = pz;
    function pD() {
      const AZ = uf;
      (pz = Date[AZ(0xe04)]()),
        (pA = pz - pC),
        (pC = pz),
        (pB = pA / 0x21),
        hd();
      let rK = 0x0;
      for (let rM = jX[AZ(0x441)] - 0x1; rM >= 0x0; rM--) {
        const rN = jX[rM];
        if (!rN[AZ(0x52f)]) jX[AZ(0xde9)](rM, 0x1);
        else {
          if (
            (rN[AZ(0xdd2)] &&
              !rN[AZ(0xdd2)][AZ(0x30b)][AZ(0xd59)](AZ(0x841))) ||
            rN[AZ(0x345)][AZ(0xaf5)][AZ(0xd72)] === AZ(0xae3)
          )
            continue;
          else {
            jX[AZ(0xde9)](rM, 0x1), rN[AZ(0x30b)][AZ(0xcef)](AZ(0x77e)), rK++;
            if (rK >= 0x14) break;
          }
        }
      }
      (pE[AZ(0xd4f)] = iy), py();
      kC[AZ(0x30b)][AZ(0xd59)](AZ(0x841)) && (lL = pz);
      if (hv) {
        const rO = pz / 0x50,
          rP = Math[AZ(0xb1f)](rO) * 0x7,
          rQ = Math[AZ(0xcb1)](Math[AZ(0xb1f)](rO / 0x4)) * 0.15 + 0.85;
        hu[AZ(0xaf5)][AZ(0xa99)] = AZ(0xb65) + rP + AZ(0x305) + rQ + ")";
      } else hu[AZ(0xaf5)][AZ(0xa99)] = AZ(0xae3);
      for (let rR = jc[AZ(0x441)] - 0x1; rR >= 0x0; rR--) {
        const rS = jc[rR];
        if (rS[AZ(0xc50)]) {
          jc[AZ(0xde9)](rR, 0x1);
          continue;
        }
        rS[AZ(0x8cf)]();
      }
      for (let rT = nx[AZ(0x441)] - 0x1; rT >= 0x0; rT--) {
        const rU = nx[rT];
        if (!rU[AZ(0x52f)]) {
          nx[AZ(0xde9)](rT, 0x1);
          continue;
        }
        rU[AZ(0x1b9)]();
      }
      for (let rV = jb[AZ(0x441)] - 0x1; rV >= 0x0; rV--) {
        const rW = jb[rV];
        rW[AZ(0xc50)] &&
          rW["t"] <= 0x0 &&
          (rW[AZ(0xcef)](), jb[AZ(0xde9)](rV, 0x1)),
          (rW["t"] += ((rW[AZ(0xc50)] ? -0x1 : 0x1) * pA) / rW[AZ(0xc36)]),
          (rW["t"] = Math[AZ(0xbd3)](0x1, Math[AZ(0x606)](0x0, rW["t"]))),
          rW[AZ(0x1b9)]();
      }
      for (let rX = mN[AZ(0x441)] - 0x1; rX >= 0x0; rX--) {
        const rY = mN[rX];
        if (!rY["el"][AZ(0x52f)]) rY[AZ(0x57b)] = ![];
        (rY[AZ(0x7d4)] += ((rY[AZ(0x57b)] ? 0x1 : -0x1) * pA) / 0xc8),
          (rY[AZ(0x7d4)] = Math[AZ(0xbd3)](
            0x1,
            Math[AZ(0x606)](rY[AZ(0x7d4)])
          ));
        if (!rY[AZ(0x57b)] && rY[AZ(0x7d4)] <= 0x0) {
          mN[AZ(0xde9)](rX, 0x1), rY[AZ(0xcef)]();
          continue;
        }
        rY[AZ(0xaf5)][AZ(0xc20)] = rY[AZ(0x7d4)];
      }
      if (oL) {
        oM += pA / 0x7d0;
        if (oM > 0x1) {
          oM = 0x0;
          if (oN) {
            oL = ![];
            const rZ = oJ[AZ(0xa8c)],
              s0 = oN[AZ(0x1d5)];
            if (oN[AZ(0x48a)] > 0x0)
              o4[AZ(0xd78)]((s1) => s1[AZ(0x86e)]()),
                mQ(oJ["id"], s0),
                (oK = 0x0),
                oQ("?"),
                o1[AZ(0x30b)][AZ(0x5d6)](AZ(0xc07)),
                (o5 = nZ(rZ)),
                o1[AZ(0x72b)](o5),
                oP(o5[AZ(0xbe4)], oN[AZ(0x48a)]),
                (o5[AZ(0x108)] = function () {
                  const B0 = AZ;
                  mQ(rZ["id"], oN[B0(0x48a)]), pw(), (oN = null);
                });
            else {
              oK = s0;
              const s1 = [...o4][AZ(0x266)](() => Math[AZ(0x9e1)]() - 0.5);
              for (let s2 = 0x0, s3 = s1[AZ(0x441)]; s2 < s3; s2++) {
                const s4 = s1[s2];
                s2 >= s0 ? s4[AZ(0x86e)]() : s4[AZ(0x61c)](0x1 - s4[AZ(0x37b)]);
              }
              oN = null;
            }
            oO();
          }
        }
      }
      for (let s5 = 0x0; s5 < o4[AZ(0x441)]; s5++) {
        o4[s5][AZ(0xdaa)](oM);
      }
      for (let s6 in n4) {
        const s7 = n4[s6];
        if (!s7) {
          delete n4[s6];
          continue;
        }
        for (let s8 = s7[AZ(0x441)] - 0x1; s8 >= 0x0; s8--) {
          const s9 = s7[s8];
          s9["t"] += pA;
          if (s9[AZ(0x462)]) s9["t"] > lX && s7[AZ(0xde9)](s8, 0x1);
          else {
            if (s9["t"] > lU) {
              const sa = 0x1 - Math[AZ(0xbd3)](0x1, (s9["t"] - lU) / 0x7d0);
              (s9[AZ(0xaf5)][AZ(0xc20)] = sa),
                sa <= 0x0 && s7[AZ(0xde9)](s8, 0x1);
            }
          }
        }
        s7[AZ(0x441)] === 0x0 && delete n4[s6];
      }
      if (nP)
        su: {
          if (ik()) {
            (nQ += pA),
              (nI[AZ(0xaf5)][AZ(0xa99)] =
                AZ(0x1fa) +
                (Math[AZ(0xb1f)](Date[AZ(0xe04)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (nQ > 0x3e8) {
              if (nR) {
                pv(cI[AZ(0x724)]), m0(![]);
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
                  const sf = nl[AZ(0x806)][se];
                  sf[AZ(0x235)] += sc;
                }
                const sd = nl[AZ(0x3d4)][AZ(0x235)] + 0x1;
                for (let sg = 0x0; sg < sc; sg++) {
                  const sh = nA(AZ(0xd01));
                  (sh[AZ(0x235)] = iN + sg), nk[AZ(0x72b)](sh);
                  const si = nA(AZ(0xd01));
                  (si[AZ(0x235)] = sd + sg),
                    si[AZ(0x72b)](
                      nA(AZ(0xdb4) + ((sh[AZ(0x235)] + 0x1) % 0xa) + AZ(0x46b))
                    ),
                    nl[AZ(0x72b)](si);
                }
                (iN = sb), (iO = iN * 0x2);
              }
            }
          } else (nP = ![]), (nR = ![]), (nQ = 0x0);
        }
      (oy = pg(oy, ow, 0x64)),
        (ox = pg(ox, ov, 0x64)),
        (nL[AZ(0xaf5)][AZ(0xc8b)] = oy * 0x64 + "%"),
        (nM[AZ(0xaf5)][AZ(0xc8b)] = ox * 0x64 + "%");
      for (let sj in pp) {
        !pp[sj][AZ(0x57d)] ? delete pp[sj] : (pp[sj][AZ(0x57d)] = ![]);
      }
      (mW = pg(mW, mY, 0x32)), (mX = pg(mX, mZ, 0x32));
      const rL = Math[AZ(0xbd3)](0x64, pA) / 0x3c;
      pG -= 0x3 * rL;
      for (let sk = pj[AZ(0x441)] - 0x1; sk >= 0x0; sk--) {
        const sl = pj[sk];
        (sl["x"] += sl[AZ(0xde4)] * rL),
          (sl["y"] += Math[AZ(0xb1f)](sl[AZ(0x694)] * 0x2) * 0.8 * rL),
          (sl[AZ(0x694)] += sl[AZ(0xb4c)] * rL),
          (sl[AZ(0x381)] += 0.002 * pA),
          (sl[AZ(0xbd0)] = !![]);
        const sm = sl[AZ(0xbab)] * 0x2;
        (sl["x"] >= d0 + sm || sl["y"] < -sm || sl["y"] >= d1 + sm) &&
          (pj[AZ(0xde9)](sk, 0x1), pk(![]));
      }
      for (let sn = 0x0; sn < iG[AZ(0x441)]; sn++) {
        iG[sn][AZ(0x1b9)]();
      }
      pf = Math[AZ(0x606)](0x0, pf - pA / 0x12c);
      if (oV[AZ(0x7fe)] && pf > 0x0) {
        const so = Math[AZ(0x9e1)]() * 0x2 * Math["PI"],
          sp = pf * 0x3;
        (qu = Math[AZ(0x3a8)](so) * sp), (qv = Math[AZ(0xb1f)](so) * sp);
      } else (qu = 0x0), (qv = 0x0);
      (ph = pg(ph, pu, 0xc8)), (n1 = pg(n1, n0, 0x64));
      for (let sq = ms[AZ(0x441)] - 0x1; sq >= 0x0; sq--) {
        const sr = ms[sq];
        sr[AZ(0x1b9)](), sr[AZ(0x793)] && ms[AZ(0xde9)](sq, 0x1);
      }
      for (let ss = iw[AZ(0x441)] - 0x1; ss >= 0x0; ss--) {
        const st = iw[ss];
        st[AZ(0x1b9)](),
          st[AZ(0x427)] && st[AZ(0x106)] > 0x1 && iw[AZ(0xde9)](ss, 0x1);
      }
      iy && ((pd = iy["x"]), (pe = iy["y"])), qs(), window[AZ(0xc49)](pD);
    }
    var pE = pF();
    function pF() {
      const B1 = uf,
        rK = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[B1(0x98e)], 0x19);
      return (rK[B1(0x4d9)] = 0x1), rK;
    }
    var pG = 0x0,
      pH = [uf(0xdb5), uf(0x125), uf(0x7e6)],
      pI = [];
    for (let rK = 0x0; rK < 0x3; rK++) {
      for (let rL = 0x0; rL < 0x3; rL++) {
        const rM = pJ(pH[rK], 0x1 - 0.05 * rL);
        pI[uf(0xaba)](rM);
      }
    }
    function pJ(rN, rO) {
      const B2 = uf;
      return pK(hA(rN)[B2(0xa8b)]((rP) => rP * rO));
    }
    function pK(rN) {
      const B3 = uf;
      return rN[B3(0x967)](
        (rO, rP) => rO + parseInt(rP)[B3(0x2b9)](0x10)[B3(0xba6)](0x2, "0"),
        "#"
      );
    }
    function pL(rN) {
      const B4 = uf;
      return B4(0x92f) + rN[B4(0xa18)](",") + ")";
    }
    var pM = document[uf(0x678)](uf(0x9ed));
    function pN() {
      const B5 = uf,
        rN = document[B5(0x6a4)](B5(0xc98));
      rN[B5(0xc8b)] = rN[B5(0x48d)] = 0x3;
      const rO = rN[B5(0x308)]("2d");
      for (let rP = 0x0; rP < pI[B5(0x441)]; rP++) {
        const rQ = rP % 0x3,
          rR = (rP - rQ) / 0x3;
        (rO[B5(0x9f0)] = pI[rP]), rO[B5(0xdd1)](rQ, rR, 0x1, 0x1);
        const rS = j7[rP],
          rT = j8[rP],
          rU = nA(
            B5(0xd41) +
              rT +
              B5(0x145) +
              ((rR + 0.5) / 0x3) * 0x64 +
              B5(0xbcf) +
              ((rQ + 0.5) / 0x3) * 0x64 +
              B5(0x284) +
              rS +
              B5(0x89f)
          );
        pM[B5(0xc23)](rU, pM[B5(0x806)][0x0]);
      }
      pM[B5(0xaf5)][B5(0xdc6)] = B5(0x3e8) + rN[B5(0x2f0)]() + ")";
    }
    pN();
    var pO = document[uf(0x678)](uf(0xcf4)),
      pP = document[uf(0x678)](uf(0x1ff));
    function pQ(rN, rO, rP) {
      const B6 = uf;
      (rN[B6(0xaf5)][B6(0xa44)] = (rO / j2) * 0x64 + "%"),
        (rN[B6(0xaf5)][B6(0x545)] = (rP / j2) * 0x64 + "%");
    }
    function pR() {
      const B7 = uf,
        rN = qx(),
        rO = d0 / 0x2 / rN,
        rP = d1 / 0x2 / rN,
        rQ = j4,
        rR = Math[B7(0x606)](0x0, Math[B7(0x508)]((pd - rO) / rQ) - 0x1),
        rS = Math[B7(0x606)](0x0, Math[B7(0x508)]((pe - rP) / rQ) - 0x1),
        rT = Math[B7(0xbd3)](j5 - 0x1, Math[B7(0x446)]((pd + rO) / rQ)),
        rU = Math[B7(0xbd3)](j5 - 0x1, Math[B7(0x446)]((pe + rP) / rQ));
      kj[B7(0x64c)](), kj[B7(0x656)](rQ, rQ), kj[B7(0x7f5)]();
      for (let rV = rR; rV <= rT + 0x1; rV++) {
        kj[B7(0x269)](rV, rS), kj[B7(0x83f)](rV, rU + 0x1);
      }
      for (let rW = rS; rW <= rU + 0x1; rW++) {
        kj[B7(0x269)](rR, rW), kj[B7(0x83f)](rT + 0x1, rW);
      }
      kj[B7(0x6c7)]();
      for (let rX = rR; rX <= rT; rX++) {
        for (let rY = rS; rY <= rU; rY++) {
          kj[B7(0x64c)](),
            kj[B7(0x8e8)]((rX + 0.5) * rQ, (rY + 0.5) * rQ),
            pt(kj, rX + "," + rY, 0x28, B7(0x737), 0x6),
            kj[B7(0x6c7)]();
        }
      }
      (kj[B7(0x4b9)] = B7(0xbf4)),
        (kj[B7(0x659)] = 0xa),
        (kj[B7(0x5e0)] = B7(0xc28)),
        kj[B7(0x4b4)]();
    }
    function pS(rN, rO) {
      const B8 = uf,
        rP = nA(B8(0x315) + rN + B8(0x757) + rO + B8(0x144)),
        rQ = rP[B8(0x678)](B8(0x2e1));
      return (
        km[B8(0x72b)](rP),
        (rP[B8(0xd55)] = function (rR) {
          const B9 = B8;
          rR > 0x0 && rR !== 0x1
            ? (rQ[B9(0x4eb)](B9(0xaf5), B9(0x6f4) + rR * 0x168 + B9(0x89e)),
              rP[B9(0x30b)][B9(0x5d6)](B9(0x841)))
            : rP[B9(0x30b)][B9(0xcef)](B9(0x841));
        }),
        km[B8(0xc23)](rP, pM),
        rP
      );
    }
    var pT = pS(uf(0x9cf), uf(0xdbb));
    pT[uf(0x30b)][uf(0x5d6)](uf(0x545));
    var pU = nA(uf(0x7a3) + hP[uf(0x393)] + uf(0x560));
    pT[uf(0x806)][0x0][uf(0x72b)](pU);
    var pV = pS(uf(0x20c), uf(0x2e0)),
      pW = pS(uf(0x8fe), uf(0x3e1));
    pW[uf(0x30b)][uf(0x5d6)](uf(0x312));
    var pX = uf(0x4db),
      pY = 0x2bc,
      pZ = new lT("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cY[uf(0x98e)], 0x19);
    pZ[uf(0x5d2)] = 0x0;
    var q0 = [
      [uf(0x7a1), uf(0xafc)],
      [uf(0xc97), uf(0x68a)],
      [uf(0xb03), uf(0x41e)],
      [uf(0x8fd), uf(0xbe1), uf(0x9ca)],
      [uf(0xa38), uf(0x985)],
      [uf(0xce3), uf(0x91f)],
      [uf(0x272), uf(0xaf9)],
    ];
    function q1() {
      const Ba = uf;
      let rN = "";
      const rO = q0[Ba(0x441)] - 0x1;
      for (let rP = 0x0; rP < rO; rP++) {
        const rQ = q0[rP][0x0];
        (rN += rQ),
          rP === rO - 0x1
            ? (rN += Ba(0xa6f) + q0[rP + 0x1][0x0] + ".")
            : (rN += ",\x20");
      }
      return rN;
    }
    var q2 = q1(),
      q3 = document[uf(0x678)](uf(0x8ba));
    (q3[uf(0x34f)] = function () {
      const Bb = uf;
      return nA(
        Bb(0xb4d) +
          hP[Bb(0x8c2)] +
          Bb(0xd37) +
          hP[Bb(0x6ab)] +
          Bb(0xda3) +
          hP[Bb(0x5b2)] +
          Bb(0x30f) +
          q2 +
          Bb(0xcb4)
      );
    }),
      (q3[uf(0x16f)] = !![]);
    var q4 =
      Date[uf(0xe04)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[uf(0x508)](Math[uf(0x9e1)]() * q0[uf(0x441)]);
    function q5() {
      const Bc = uf,
        rN = q0[q4];
      (pZ[Bc(0xb0b)] = rN[0x0]), (pZ[Bc(0x5e8)] = rN[0x1]);
      for (let rO of iZ) {
        pZ[rO] = Math[Bc(0x9e1)]() > 0.5;
      }
      q4 = (q4 + 0x1) % q0[Bc(0x441)];
    }
    q5(),
      (q3[uf(0x108)] = function () {
        const Bd = uf;
        window[Bd(0xd2f)](pZ[Bd(0x5e8)], Bd(0xc3e)), q5();
      });
    var q6 = new lT(uf(0xbe8), 0x0, -0x19, 0x0, 0x1, cY[uf(0x98e)], 0x19);
    (q6[uf(0x5d2)] = 0x0), (q6[uf(0xa9e)] = !![]);
    var q7 = [
        uf(0x9b9),
        uf(0x79a),
        uf(0xc13),
        uf(0xb78),
        uf(0x832),
        uf(0x518),
        uf(0xabf),
      ],
      q8 = [
        uf(0x211),
        uf(0x50c),
        uf(0xdf1),
        uf(0x348),
        uf(0x30d),
        uf(0x5a9),
        uf(0x26f),
        uf(0x7f4),
      ],
      q9 = 0x0;
    function qa() {
      const Be = uf,
        rN = {};
      (rN[Be(0x3dd)] = q7[q9 % q7[Be(0x441)]]),
        (rN[Be(0x462)] = !![]),
        (rN[Be(0x19c)] = n3["me"]),
        n7(Be(0xbe8), rN),
        n7("yt", {
          text: q8[q9 % q8[Be(0x441)]][Be(0xa27)](
            Be(0x1ea),
            kE[Be(0xcb7)][Be(0xd69)]() || Be(0x533)
          ),
          isFakeChat: !![],
          col: n3["me"],
        }),
        q9++;
    }
    qa(), setInterval(qa, 0xfa0);
    var qb = 0x0,
      qc = Math[uf(0x446)](
        (Math[uf(0x606)](screen[uf(0xc8b)], screen[uf(0x48d)], kU(), kV()) *
          window[uf(0x27d)]) /
          0xc
      ),
      qd = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[uf(0x9d6)], 0x19);
    (qd[uf(0x427)] = !![]), (qd[uf(0x42f)] = 0x1), (qd[uf(0x656)] = 0.6);
    var qe = (function () {
        const Bf = uf,
          rN = document[Bf(0x6a4)](Bf(0xc98)),
          rO = qc * 0x2;
        (rN[Bf(0xc8b)] = rN[Bf(0x48d)] = rO),
          (rN[Bf(0xaf5)][Bf(0xc8b)] = rN[Bf(0xaf5)][Bf(0x48d)] = Bf(0x1af));
        const rP = document[Bf(0x678)](Bf(0xbe9));
        rP[Bf(0x72b)](rN);
        const rQ = rN[Bf(0x308)]("2d");
        return (
          (rN[Bf(0x664)] = function () {
            const Bg = Bf;
            (qd[Bg(0x809)] = ![]),
              rQ[Bg(0x40a)](0x0, 0x0, rO, rO),
              rQ[Bg(0x64c)](),
              rQ[Bg(0x90b)](rO / 0x64),
              rQ[Bg(0x8e8)](0x32, 0x32),
              rQ[Bg(0x90b)](0.8),
              rQ[Bg(0x174)](-Math["PI"] / 0x8),
              qd[Bg(0xa5a)](rQ),
              rQ[Bg(0x6c7)]();
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
      qh = rN[Bh(0x2f0)](Bh(0xe12));
      const rO = qf * 0x64 + "%\x20" + qg * 0x64 + Bh(0x82e),
        rP = nA(
          Bh(0x1d8) +
            hQ[Bh(0xa8b)](
              (rQ, rR) => Bh(0xa2a) + rR + Bh(0x150) + rQ + Bh(0x12a)
            )[Bh(0xa18)]("\x0a") +
            Bh(0xbc5) +
            no[Bh(0xd27)] +
            Bh(0x255) +
            no[Bh(0xbba)] +
            Bh(0x9ce) +
            no[Bh(0x257)] +
            Bh(0xd1b) +
            dH +
            Bh(0xcf8) +
            qh +
            Bh(0xa47) +
            rO +
            Bh(0x612) +
            rO +
            Bh(0xaf6) +
            rO +
            Bh(0xb82) +
            rO +
            Bh(0x5c7)
        );
      document[Bh(0x4f6)][Bh(0x72b)](rP);
    }
    function qk(rN) {
      const Bi = uf,
        rO =
          -rN[Bi(0x78b)]["x"] * 0x64 +
          "%\x20" +
          -rN[Bi(0x78b)]["y"] * 0x64 +
          "%";
      return (
        Bi(0x17a) +
        rO +
        Bi(0xcfd) +
        rO +
        Bi(0x119) +
        rO +
        Bi(0xdf3) +
        rO +
        ";\x22"
      );
    }
    if (document[uf(0x19b)] && document[uf(0x19b)][uf(0x4c5)]) {
      const rN = setTimeout(qj, 0x1f40);
      document[uf(0x19b)][uf(0x4c5)][uf(0x8da)](() => {
        const Bj = uf;
        console[Bj(0x9b1)](Bj(0x961)), clearTimeout(rN), qj();
      });
    } else qj();
    var ql = [];
    qm();
    function qm() {
      const Bk = uf,
        rO = {};
      (qf = 0xf), (ql = []);
      let rP = 0x0;
      for (let rR = 0x0; rR < dC[Bk(0x441)]; rR++) {
        const rS = dC[rR],
          rT = Bk(0xa74) + rS[Bk(0x3ed)] + "_" + (rS[Bk(0x37b)] || 0x1),
          rU = rO[rT];
        if (rU === void 0x0) (rS[Bk(0x78b)] = rO[rT] = rQ()), ql[Bk(0xaba)](rS);
        else {
          rS[Bk(0x78b)] = rU;
          continue;
        }
      }
      for (let rV = 0x0; rV < eK[Bk(0x441)]; rV++) {
        const rW = eK[rV],
          rX = Bk(0xb9e) + rW[Bk(0x3ed)],
          rY = rO[rX];
        if (rY === void 0x0) rW[Bk(0x78b)] = rO[rX] = rQ();
        else {
          rW[Bk(0x78b)] = rY;
          continue;
        }
      }
      function rQ() {
        const Bl = Bk;
        return { x: rP % qf, y: Math[Bl(0x508)](rP / qf), index: rP++ };
      }
    }
    function qn(rO) {
      const Bm = uf,
        rP = ql[Bm(0x441)] + eL;
      qg = Math[Bm(0x446)](rP / qf);
      const rQ = document[Bm(0x6a4)](Bm(0xc98));
      (rQ[Bm(0xc8b)] = rO * qf), (rQ[Bm(0x48d)] = rO * qg);
      const rR = rQ[Bm(0x308)]("2d"),
        rS = 0x5a,
        rT = rS / 0x2,
        rU = rO / rS;
      rR[Bm(0x656)](rU, rU), rR[Bm(0x8e8)](rT, rT);
      for (let rV = 0x0; rV < ql[Bm(0x441)]; rV++) {
        const rW = ql[rV];
        rR[Bm(0x64c)](),
          rR[Bm(0x8e8)](rW[Bm(0x78b)]["x"] * rS, rW[Bm(0x78b)]["y"] * rS),
          rR[Bm(0x64c)](),
          rR[Bm(0x8e8)](0x0 + rW[Bm(0x53c)], -0x5 + rW[Bm(0xa25)]),
          rW[Bm(0xa72)](rR),
          rR[Bm(0x6c7)](),
          (rR[Bm(0x9f0)] = Bm(0x737)),
          (rR[Bm(0xcc6)] = Bm(0x312)),
          (rR[Bm(0x6f7)] = Bm(0x5d1)),
          (rR[Bm(0xa3f)] = Bm(0xd23) + iA),
          (rR[Bm(0x659)] = h5 ? 0x5 : 0x3),
          (rR[Bm(0x4b9)] = Bm(0x316)),
          (rR[Bm(0x5e0)] = rR[Bm(0x60f)] = Bm(0xc28)),
          rR[Bm(0x8e8)](0x0, rT - 0x8 - rR[Bm(0x659)]);
        let rX = rW[Bm(0x3ed)];
        h5 && (rX = h7(rX));
        const rY = rR[Bm(0x712)](rX)[Bm(0xc8b)] + rR[Bm(0x659)],
          rZ = Math[Bm(0xbd3)](0x4c / rY, 0x1);
        rR[Bm(0x656)](rZ, rZ),
          rR[Bm(0x3ce)](rX, 0x0, 0x0),
          rR[Bm(0x3d0)](rX, 0x0, 0x0),
          rR[Bm(0x6c7)]();
      }
      for (let s0 = 0x0; s0 < eL; s0++) {
        const s1 = eK[s0];
        rR[Bm(0x64c)](),
          rR[Bm(0x8e8)](s1[Bm(0x78b)]["x"] * rS, s1[Bm(0x78b)]["y"] * rS),
          s1[Bm(0x382)] !== void 0x0 &&
            (rR[Bm(0x7f5)](), rR[Bm(0x439)](-rT, -rT, rS, rS), rR[Bm(0x1e7)]()),
          rR[Bm(0x8e8)](s1[Bm(0x53c)], s1[Bm(0xa25)]),
          s1[Bm(0xa72)](rR),
          rR[Bm(0x6c7)]();
      }
      return rQ;
    }
    var qo = new lG(-0x1, cS[uf(0x63a)], 0x0, 0x0, Math[uf(0x9e1)]() * 6.28);
    qo[uf(0xbab)] = 0x32;
    function qp() {
      const Bn = uf;
      kj[Bn(0x5b3)](j2 / 0x2, j2 / 0x2, j2 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qq(rO) {
      const Bo = uf,
        rP = rO[Bo(0x441)],
        rQ = document[Bo(0x6a4)](Bo(0xc98));
      rQ[Bo(0xc8b)] = rQ[Bo(0x48d)] = rP;
      const rR = rQ[Bo(0x308)]("2d"),
        rS = rR[Bo(0x431)](rP, rP);
      for (let rT = 0x0; rT < rP; rT++) {
        for (let rU = 0x0; rU < rP; rU++) {
          const rV = rO[rT][rU];
          if (!rV) continue;
          const rW = (rT * rP + rU) * 0x4;
          rS[Bo(0x575)][rW + 0x3] = 0xff;
        }
      }
      return rR[Bo(0x957)](rS, 0x0, 0x0), rQ;
    }
    function qr() {
      const Bp = uf;
      if (!jK) return;
      kj[Bp(0x64c)](),
        kj[Bp(0x7f5)](),
        qp(),
        kj[Bp(0x1e7)](),
        !jK[Bp(0xc98)] && (jK[Bp(0xc98)] = qq(jK)),
        (kj[Bp(0xb8c)] = ![]),
        (kj[Bp(0x89c)] = 0.08),
        kj[Bp(0xda4)](jK[Bp(0xc98)], 0x0, 0x0, j2, j2),
        kj[Bp(0x6c7)]();
    }
    function qs() {
      const Bq = uf;
      lM = 0x0;
      const rO = kR * kW;
      qb = 0x0;
      for (let rT = 0x0; rT < nx[Bq(0x441)]; rT++) {
        const rU = nx[rT];
        rU[Bq(0x970)] && rU[Bq(0x664)]();
      }
      if (
        kk[Bq(0xaf5)][Bq(0xd72)] === "" ||
        document[Bq(0x4f6)][Bq(0x30b)][Bq(0xd59)](Bq(0x223))
      ) {
        (kj[Bq(0x9f0)] = Bq(0xdb5)),
          kj[Bq(0xdd1)](0x0, 0x0, ki[Bq(0xc8b)], ki[Bq(0x48d)]),
          kj[Bq(0x64c)]();
        let rV = Math[Bq(0x606)](ki[Bq(0xc8b)] / d0, ki[Bq(0x48d)] / d1);
        kj[Bq(0x656)](rV, rV),
          kj[Bq(0x439)](0x0, 0x0, d0, d1),
          kj[Bq(0x64c)](),
          kj[Bq(0x8e8)](pG, -pG),
          kj[Bq(0x656)](1.25, 1.25),
          (kj[Bq(0x9f0)] = kY),
          kj[Bq(0x8ab)](),
          kj[Bq(0x6c7)]();
        for (let rW = 0x0; rW < pj[Bq(0x441)]; rW++) {
          pj[rW][Bq(0xa5a)](kj);
        }
        kj[Bq(0x6c7)]();
        if (oV[Bq(0xa66)] && oY[Bq(0x407)] > 0x0) {
          const rX = oY[Bq(0x41b)]();
          kj[Bq(0x64c)]();
          let rY = kW;
          kj[Bq(0x656)](rY, rY),
            kj[Bq(0x8e8)](
              rX["x"] + rX[Bq(0xc8b)] / 0x2,
              rX["y"] + rX[Bq(0x48d)]
            ),
            kj[Bq(0x90b)](kR * 0.8),
            q6[Bq(0xa5a)](kj),
            kj[Bq(0x656)](0.7, 0.7),
            q6[Bq(0x9e5)](kj),
            kj[Bq(0x6c7)]();
        }
        if (q3[Bq(0x407)] > 0x0) {
          const rZ = q3[Bq(0x41b)]();
          kj[Bq(0x64c)]();
          let s0 = kW;
          kj[Bq(0x656)](s0, s0),
            kj[Bq(0x8e8)](
              rZ["x"] + rZ[Bq(0xc8b)] / 0x2,
              rZ["y"] + rZ[Bq(0x48d)] * 0.6
            ),
            kj[Bq(0x90b)](kR * 0.8),
            pZ[Bq(0xa5a)](kj),
            kj[Bq(0x90b)](0.7),
            kj[Bq(0x64c)](),
            kj[Bq(0x8e8)](0x0, -pZ[Bq(0xbab)] - 0x23),
            pt(kj, pZ[Bq(0xb0b)], 0x12, Bq(0x737), 0x3),
            kj[Bq(0x6c7)](),
            pZ[Bq(0x9e5)](kj),
            kj[Bq(0x6c7)]();
        }
        if (hm[Bq(0x407)] > 0x0) {
          const s1 = hm[Bq(0x41b)]();
          kj[Bq(0x64c)]();
          let s3 = kW;
          kj[Bq(0x656)](s3, s3),
            kj[Bq(0x8e8)](
              s1["x"] + s1[Bq(0xc8b)] / 0x2,
              s1["y"] + s1[Bq(0x48d)] * 0.5
            ),
            kj[Bq(0x90b)](kR),
            qo[Bq(0xa5a)](kj),
            kj[Bq(0x6c7)]();
        }
        return;
      }
      if (jy)
        (kj[Bq(0x9f0)] = pI[0x0]),
          kj[Bq(0xdd1)](0x0, 0x0, ki[Bq(0xc8b)], ki[Bq(0x48d)]);
      else {
        kj[Bq(0x64c)](), qw();
        for (let s4 = -0x1; s4 < 0x4; s4++) {
          for (let s5 = -0x1; s5 < 0x4; s5++) {
            const s6 = Math[Bq(0x606)](0x0, Math[Bq(0xbd3)](s5, 0x2)),
              s7 = Math[Bq(0x606)](0x0, Math[Bq(0xbd3)](s4, 0x2));
            (kj[Bq(0x9f0)] = pI[s7 * 0x3 + s6]),
              kj[Bq(0xdd1)](s5 * j3, s4 * j3, j3, j3);
          }
        }
        kj[Bq(0x7f5)](),
          kj[Bq(0x439)](0x0, 0x0, j2, j2),
          kj[Bq(0x1e7)](),
          kj[Bq(0x7f5)](),
          kj[Bq(0x269)](-0xa, j3),
          kj[Bq(0x83f)](j3 * 0x2, j3),
          kj[Bq(0x269)](j3 * 0x2, j3 * 0.5),
          kj[Bq(0x83f)](j3 * 0x2, j3 * 1.5),
          kj[Bq(0x269)](j3 * 0x1, j3 * 0x2),
          kj[Bq(0x83f)](j2 + 0xa, j3 * 0x2),
          kj[Bq(0x269)](j3, j3 * 1.5),
          kj[Bq(0x83f)](j3, j3 * 2.5),
          (kj[Bq(0x659)] = pY * 0x2),
          (kj[Bq(0x5e0)] = Bq(0xc28)),
          (kj[Bq(0x4b9)] = pX),
          kj[Bq(0x4b4)](),
          kj[Bq(0x6c7)]();
      }
      kj[Bq(0x64c)](),
        kj[Bq(0x7f5)](),
        kj[Bq(0x439)](0x0, 0x0, ki[Bq(0xc8b)], ki[Bq(0x48d)]),
        qw();
      oV[Bq(0xd4d)] && ((kj[Bq(0x9f0)] = kY), kj[Bq(0x8ab)]());
      kj[Bq(0x7f5)]();
      jy ? qp() : kj[Bq(0x439)](0x0, 0x0, j2, j2);
      kj[Bq(0x6c7)](),
        kj[Bq(0x439)](0x0, 0x0, ki[Bq(0xc8b)], ki[Bq(0x48d)]),
        (kj[Bq(0x9f0)] = pX),
        kj[Bq(0x8ab)](Bq(0x7e2)),
        kj[Bq(0x64c)](),
        qw();
      oV[Bq(0x298)] && pR();
      qr();
      const rP = [];
      let rQ = [];
      for (let s8 = 0x0; s8 < iw[Bq(0x441)]; s8++) {
        const s9 = iw[s8];
        if (s9[Bq(0xaea)]) {
          if (iy) {
            if (
              pz - s9[Bq(0xa9a)] < 0x3e8 ||
              Math[Bq(0x5d7)](s9["nx"] - iy["x"], s9["ny"] - iy["y"]) <
                Math[Bq(0x5d7)](s9["ox"] - iy["x"], s9["oy"] - iy["y"])
            ) {
              rP[Bq(0xaba)](s9), (s9[Bq(0xa9a)] = pz);
              continue;
            }
          }
        }
        s9 !== iy && rQ[Bq(0xaba)](s9);
      }
      (rQ = qt(rQ, (sa) => sa[Bq(0x5a0)] === cS[Bq(0x4fc)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x5a0)] === cS[Bq(0xcc5)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x5a0)] === cS[Bq(0x66b)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x3b9)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0xd79)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x6ed)] && !sa[Bq(0xca4)])),
        (rQ = qt(rQ, (sa) => !sa[Bq(0xca4)])),
        qt(rQ, (sa) => !![]);
      iy && iy[Bq(0xa5a)](kj);
      for (let sa = 0x0; sa < rP[Bq(0x441)]; sa++) {
        rP[sa][Bq(0xa5a)](kj);
      }
      if (oV[Bq(0xbbe)]) {
        kj[Bq(0x7f5)]();
        for (let sb = 0x0; sb < iw[Bq(0x441)]; sb++) {
          const sc = iw[sb];
          if (sc[Bq(0x427)]) continue;
          if (sc[Bq(0x2fd)]) {
            kj[Bq(0x64c)](),
              kj[Bq(0x8e8)](sc["x"], sc["y"]),
              kj[Bq(0x174)](sc[Bq(0x694)]);
            if (!sc[Bq(0xc1c)])
              kj[Bq(0x439)](-sc[Bq(0xbab)], -0xa, sc[Bq(0xbab)] * 0x2, 0x14);
            else {
              kj[Bq(0x269)](-sc[Bq(0xbab)], -0xa),
                kj[Bq(0x83f)](-sc[Bq(0xbab)], 0xa);
              const sd = 0xa + sc[Bq(0xc1c)] * sc[Bq(0xbab)] * 0x2;
              kj[Bq(0x83f)](sc[Bq(0xbab)], sd),
                kj[Bq(0x83f)](sc[Bq(0xbab)], -sd),
                kj[Bq(0x83f)](-sc[Bq(0xbab)], -0xa);
            }
            kj[Bq(0x6c7)]();
          } else
            kj[Bq(0x269)](sc["x"] + sc[Bq(0xbab)], sc["y"]),
              kj[Bq(0x5b3)](sc["x"], sc["y"], sc[Bq(0xbab)], 0x0, l0);
        }
        (kj[Bq(0x659)] = 0x2), (kj[Bq(0x4b9)] = Bq(0x257)), kj[Bq(0x4b4)]();
      }
      const rR = oV[Bq(0x9ee)] ? 0x1 / qy() : 0x1;
      for (let se = 0x0; se < iw[Bq(0x441)]; se++) {
        const sf = iw[se];
        !sf[Bq(0x6ed)] && sf[Bq(0xbd0)] && lY(sf, kj, rR);
      }
      for (let sg = 0x0; sg < iw[Bq(0x441)]; sg++) {
        const sh = iw[sg];
        sh[Bq(0xa7b)] && sh[Bq(0x9e5)](kj, rR);
      }
      const rS = pA / 0x12;
      kj[Bq(0x64c)](),
        (kj[Bq(0x659)] = 0x7),
        (kj[Bq(0x4b9)] = Bq(0x737)),
        (kj[Bq(0x5e0)] = kj[Bq(0x60f)] = Bq(0x6f9));
      for (let si = iF[Bq(0x441)] - 0x1; si >= 0x0; si--) {
        const sj = iF[si];
        sj["a"] -= pA / 0x1f4;
        if (sj["a"] <= 0x0) {
          iF[Bq(0xde9)](si, 0x1);
          continue;
        }
        (kj[Bq(0x89c)] = sj["a"]), kj[Bq(0x4b4)](sj[Bq(0x727)]);
      }
      kj[Bq(0x6c7)]();
      if (oV[Bq(0x23c)])
        for (let sk = iz[Bq(0x441)] - 0x1; sk >= 0x0; sk--) {
          const sl = iz[sk];
          (sl["x"] += sl["vx"] * rS),
            (sl["y"] += sl["vy"] * rS),
            (sl["vy"] += 0.35 * rS);
          if (sl["vy"] > 0xa) {
            iz[Bq(0xde9)](sk, 0x1);
            continue;
          }
          kj[Bq(0x64c)](),
            kj[Bq(0x8e8)](sl["x"], sl["y"]),
            (kj[Bq(0x89c)] = 0x1 - Math[Bq(0x606)](0x0, sl["vy"] / 0xa)),
            kj[Bq(0x656)](sl[Bq(0xbab)], sl[Bq(0xbab)]),
            sl[Bq(0x3dd)] !== void 0x0
              ? pt(kj, sl[Bq(0x3dd)], 0x15, Bq(0x5ca), 0x2, ![], sl[Bq(0xbab)])
              : (kj[Bq(0x174)](sl[Bq(0x694)]),
                pq(kj, Bq(0x3f6) + sl[Bq(0xbab)], 0x1e, 0x1e, function (sm) {
                  const Br = Bq;
                  sm[Br(0x8e8)](0xf, 0xf), nm(sm);
                })),
            kj[Bq(0x6c7)]();
        }
      kj[Bq(0x6c7)]();
      if (iy && oV[Bq(0x7df)] && !oV[Bq(0x517)]) {
        kj[Bq(0x64c)](),
          kj[Bq(0x8e8)](ki[Bq(0xc8b)] / 0x2, ki[Bq(0x48d)] / 0x2),
          kj[Bq(0x174)](Math[Bq(0x31e)](mX, mW)),
          kj[Bq(0x656)](rO, rO);
        const sm = 0x28;
        let sn = Math[Bq(0x5d7)](mW, mX) / kR;
        kj[Bq(0x7f5)](),
          kj[Bq(0x269)](sm, 0x0),
          kj[Bq(0x83f)](sn, 0x0),
          kj[Bq(0x83f)](sn + -0x14, -0x14),
          kj[Bq(0x269)](sn, 0x0),
          kj[Bq(0x83f)](sn + -0x14, 0x14),
          (kj[Bq(0x659)] = 0xc),
          (kj[Bq(0x5e0)] = Bq(0xc28)),
          (kj[Bq(0x60f)] = Bq(0xc28)),
          (kj[Bq(0x89c)] =
            sn < 0x64 ? Math[Bq(0x606)](sn - 0x32, 0x0) / 0x32 : 0x1),
          (kj[Bq(0x4b9)] = Bq(0xbf4)),
          kj[Bq(0x4b4)](),
          kj[Bq(0x6c7)]();
      }
      kj[Bq(0x64c)](),
        kj[Bq(0x656)](rO, rO),
        kj[Bq(0x8e8)](0x28, 0x1e + 0x32),
        kj[Bq(0x90b)](0.85);
      for (let so = 0x0; so < px[Bq(0x441)]; so++) {
        const sp = px[so];
        if (so > 0x0) {
          const sq = lI(Math[Bq(0x606)](sp[Bq(0x4d9)] - 0.5, 0x0) / 0.5);
          kj[Bq(0x8e8)](0x0, (so === 0x0 ? 0x46 : 0x41) * (0x1 - sq));
        }
        kj[Bq(0x64c)](),
          so > 0x0 &&
            (kj[Bq(0x8e8)](lI(sp[Bq(0x4d9)]) * -0x190, 0x0),
            kj[Bq(0x90b)](0.85)),
          kj[Bq(0x64c)](),
          lZ(sp, kj, !![]),
          (sp["id"] = (sp[Bq(0xd4f)] && sp[Bq(0xd4f)]["id"]) || -0x1),
          sp[Bq(0xa5a)](kj),
          (sp["id"] = -0x1),
          kj[Bq(0x6c7)](),
          sp[Bq(0x6d0)] !== void 0x0 &&
            (kj[Bq(0x64c)](),
            kj[Bq(0x174)](sp[Bq(0x6d0)]),
            kj[Bq(0x8e8)](0x20, 0x0),
            kj[Bq(0x7f5)](),
            kj[Bq(0x269)](0x0, 0x6),
            kj[Bq(0x83f)](0x0, -0x6),
            kj[Bq(0x83f)](0x6, 0x0),
            kj[Bq(0x326)](),
            (kj[Bq(0x659)] = 0x4),
            (kj[Bq(0x5e0)] = kj[Bq(0x60f)] = Bq(0xc28)),
            (kj[Bq(0x4b9)] = Bq(0xbf5)),
            kj[Bq(0x4b4)](),
            (kj[Bq(0x9f0)] = Bq(0x737)),
            kj[Bq(0x8ab)](),
            kj[Bq(0x6c7)]()),
          kj[Bq(0x6c7)]();
      }
      kj[Bq(0x6c7)]();
    }
    function qt(rO, rP) {
      const Bs = uf,
        rQ = [];
      for (let rR = 0x0; rR < rO[Bs(0x441)]; rR++) {
        const rS = rO[rR];
        if (rP[Bs(0x56f)] !== void 0x0 ? rP(rS) : rS[rP]) rS[Bs(0xa5a)](kj);
        else rQ[Bs(0xaba)](rS);
      }
      return rQ;
    }
    var qu = 0x0,
      qv = 0x0;
    function qw() {
      const Bt = uf;
      kj[Bt(0x8e8)](ki[Bt(0xc8b)] / 0x2, ki[Bt(0x48d)] / 0x2);
      let rO = qx();
      kj[Bt(0x656)](rO, rO),
        kj[Bt(0x8e8)](-pd, -pe),
        oV[Bt(0x7fe)] && kj[Bt(0x8e8)](qu, qv);
    }
    function qx() {
      const Bu = uf;
      return Math[Bu(0x606)](ki[Bu(0xc8b)] / d0, ki[Bu(0x48d)] / d1) * qy();
    }
    function qy() {
      return n1 / ph;
    }
    kX(), pD();
    const qz = {};
    (qz[uf(0x56f)] = uf(0xc5c)),
      (qz[uf(0x5e8)] = uf(0xb83)),
      (qz[uf(0x2d3)] = uf(0x278));
    const qA = {};
    (qA[uf(0x56f)] = uf(0x4b6)),
      (qA[uf(0x5e8)] = uf(0xa92)),
      (qA[uf(0x2d3)] = uf(0x88b));
    const qB = {};
    (qB[uf(0x56f)] = uf(0xa6e)),
      (qB[uf(0x5e8)] = uf(0x268)),
      (qB[uf(0x2d3)] = uf(0xa14));
    const qC = {};
    (qC[uf(0x56f)] = uf(0x6df)),
      (qC[uf(0x5e8)] = uf(0x260)),
      (qC[uf(0x2d3)] = uf(0xc37));
    const qD = {};
    (qD[uf(0x56f)] = uf(0x5a3)),
      (qD[uf(0x5e8)] = uf(0x962)),
      (qD[uf(0x2d3)] = uf(0xc79));
    const qE = {};
    (qE[uf(0x56f)] = uf(0x887)),
      (qE[uf(0x5e8)] = uf(0xc2b)),
      (qE[uf(0x2d3)] = uf(0x6c8));
    const qF = {};
    (qF[uf(0xded)] = qz),
      (qF[uf(0x741)] = qA),
      (qF[uf(0x838)] = qB),
      (qF[uf(0x189)] = qC),
      (qF[uf(0xc44)] = qD),
      (qF[uf(0x1a7)] = qE);
    var qG = qF;
    if (window[uf(0xdba)][uf(0x8d7)] !== uf(0xadf))
      for (let rO in qG) {
        const rP = qG[rO];
        rP[uf(0x5e8)] = rP[uf(0x5e8)]
          [uf(0xa27)](uf(0xadf), uf(0x126))
          [uf(0xa27)](uf(0xb97), uf(0x33b));
      }
    var qH = document[uf(0x678)](uf(0x5df)),
      qI = document[uf(0x678)](uf(0x7de)),
      qJ = 0x0;
    for (let rQ in qG) {
      const rR = qG[rQ],
        rS = document[uf(0x6a4)](uf(0x3c9));
      rS[uf(0xab1)] = uf(0x769);
      const rT = document[uf(0x6a4)](uf(0x795));
      rT[uf(0x4eb)](uf(0x4b4), rR[uf(0x56f)]), rS[uf(0x72b)](rT);
      const rU = document[uf(0x6a4)](uf(0x795));
      (rU[uf(0xab1)] = uf(0xa97)),
        (rR[uf(0x70f)] = 0x0),
        (rR[uf(0xa31)] = function (rV) {
          const Bv = uf;
          (qJ -= rR[Bv(0x70f)]),
            (rR[Bv(0x70f)] = rV),
            (qJ += rV),
            k8(rU, kh(rV, Bv(0x5fb))),
            rS[Bv(0x72b)](rU);
          const rW = Bv(0xc0a) + kh(qJ, Bv(0x5fb)) + Bv(0xbc9);
          k8(qK, rW), k8(qI, rW);
        }),
        (rR[uf(0x5f7)] = function () {
          const Bw = uf;
          rR[Bw(0xa31)](0x0), rU[Bw(0xcef)]();
        }),
        (rS[uf(0xaf5)][uf(0x9e4)] = rR[uf(0x2d3)]),
        qH[uf(0x72b)](rS),
        (rS[uf(0x108)] = function () {
          const Bx = uf,
            rV = qH[Bx(0x678)](Bx(0x92b));
          if (rV === rS) return;
          rV && rV[Bx(0x30b)][Bx(0xcef)](Bx(0x6e2)),
            this[Bx(0x30b)][Bx(0x5d6)](Bx(0x6e2)),
            qN(rR[Bx(0x5e8)]),
            (hD[Bx(0xdbc)] = rQ);
        }),
        (rR["el"] = rS);
    }
    var qK = document[uf(0x6a4)](uf(0x795));
    (qK[uf(0xab1)] = uf(0x8e7)), qH[uf(0x72b)](qK);
    if (!![]) {
      qL();
      let rV = Date[uf(0xe04)]();
      setInterval(function () {
        pz - rV > 0x2710 && (qL(), (rV = pz));
      }, 0x3e8);
    }
    function qL() {
      const By = uf;
      fetch(By(0xc64))
        [By(0x8da)]((rW) => rW[By(0x346)]())
        [By(0x8da)]((rW) => {
          const Bz = By;
          for (let rX in rW) {
            const rY = qG[rX];
            rY && rY[Bz(0xa31)](rW[rX]);
          }
        })
        [By(0xaca)]((rW) => {
          const BA = By;
          console[BA(0x334)](BA(0xc96), rW);
        });
    }
    var qM = window[uf(0x368)] || window[uf(0xdba)][uf(0x301)] === uf(0x336);
    if (qM) hV(window[uf(0xdba)][uf(0x749)][uf(0xa27)](uf(0x80f), "ws"));
    else {
      const rW = qG[hD[uf(0xdbc)]];
      if (rW) rW["el"][uf(0x708)]();
      else {
        let rX = "EU";
        fetch(uf(0x9fe))
          [uf(0x8da)]((rY) => rY[uf(0x346)]())
          [uf(0x8da)]((rY) => {
            const BB = uf;
            if (["NA", "SA"][BB(0x60a)](rY[BB(0xa39)])) rX = "US";
            else ["AS", "OC"][BB(0x60a)](rY[BB(0xa39)]) && (rX = "AS");
          })
          [uf(0xaca)]((rY) => {
            const BC = uf;
            console[BC(0x9b1)](BC(0x23b));
          })
          [uf(0xcbf)](function () {
            const BD = uf,
              rY = [];
            for (let s0 in qG) {
              const s1 = qG[s0];
              s1[BD(0x56f)][BD(0x313)](rX) && rY[BD(0xaba)](s1);
            }
            const rZ =
              rY[Math[BD(0x508)](Math[BD(0x9e1)]() * rY[BD(0x441)])] ||
              qG[BD(0x9c9)];
            console[BD(0x9b1)](BD(0x7a0) + rX + BD(0x707) + rZ[BD(0x56f)]),
              rZ["el"][BD(0x708)]();
          });
      }
    }
    (document[uf(0x678)](uf(0x349))[uf(0xaf5)][uf(0xd72)] = uf(0xae3)),
      kA[uf(0x30b)][uf(0x5d6)](uf(0x841)),
      kB[uf(0x30b)][uf(0xcef)](uf(0x841)),
      (window[uf(0x207)] = function () {
        il(new Uint8Array([0xff]));
      });
    function qN(rY) {
      const BE = uf;
      clearTimeout(kF), iu();
      const rZ = {};
      (rZ[BE(0x5e8)] = rY), (hU = rZ), kg(!![]);
    }
    window[uf(0x21f)] = qN;
    var qO = null;
    function qP(rY) {
      const BF = uf;
      if (!rY || typeof rY !== BF(0x7ee)) {
        console[BF(0x9b1)](BF(0xdaf));
        return;
      }
      if (qO) qO[BF(0xc48)]();
      const rZ = rY[BF(0xab5)] || {},
        s0 = {};
      (s0[BF(0x8a5)] = BF(0xb20)),
        (s0[BF(0x232)] = BF(0x3d6)),
        (s0[BF(0xc8d)] = BF(0xc55)),
        (s0[BF(0x882)] = BF(0x6ab)),
        (s0[BF(0x910)] = !![]),
        (s0[BF(0x7e9)] = !![]),
        (s0[BF(0x450)] = ""),
        (s0[BF(0x41f)] = ""),
        (s0[BF(0xa57)] = !![]),
        (s0[BF(0x271)] = !![]);
      const s1 = s0;
      for (let s7 in s1) {
        (rZ[s7] === void 0x0 || rZ[s7] === null) && (rZ[s7] = s1[s7]);
      }
      const s2 = [];
      for (let s8 in rZ) {
        s1[s8] === void 0x0 && s2[BF(0xaba)](s8);
      }
      s2[BF(0x441)] > 0x0 &&
        console[BF(0x9b1)](BF(0xc76) + s2[BF(0xa18)](",\x20"));
      rZ[BF(0x450)] === "" && rZ[BF(0x41f)] === "" && (rZ[BF(0x450)] = "x");
      (rZ[BF(0x232)] = hP[rZ[BF(0x232)]] || rZ[BF(0x232)]),
        (rZ[BF(0x882)] = hP[rZ[BF(0x882)]] || rZ[BF(0x882)]);
      const s3 = nA(
        BF(0xba1) +
          rZ[BF(0x8a5)] +
          BF(0xa46) +
          rZ[BF(0x232)] +
          BF(0xddd) +
          (rZ[BF(0xc8d)]
            ? BF(0x990) +
              rZ[BF(0xc8d)] +
              "\x22\x20" +
              (rZ[BF(0x882)] ? BF(0x445) + rZ[BF(0x882)] + "\x22" : "") +
              BF(0x3e3)
            : "") +
          BF(0xd5c)
      );
      (qO = s3),
        (s3[BF(0xc48)] = function () {
          const BG = BF;
          document[BG(0x4f6)][BG(0x30b)][BG(0xcef)](BG(0x223)),
            s3[BG(0xcef)](),
            (qO = null);
        }),
        (s3[BF(0x678)](BF(0xafd))[BF(0x108)] = s3[BF(0xc48)]);
      const s4 = s3[BF(0x678)](BF(0xe0b)),
        s5 = [],
        s6 = [];
      for (let s9 in rY) {
        if (s9 === BF(0xab5)) continue;
        const sa = rY[s9];
        let sb = [];
        const sc = Array[BF(0xdb8)](sa);
        let sd = 0x0;
        if (sc)
          for (let se = 0x0; se < sa[BF(0x441)]; se++) {
            const sf = sa[se],
              sg = dF[sf];
            if (!sg) {
              s5[BF(0xaba)](sf);
              continue;
            }
            sd++, sb[BF(0xaba)]([sf, void 0x0]);
          }
        else
          for (let sh in sa) {
            const si = dF[sh];
            if (!si) {
              s5[BF(0xaba)](sh);
              continue;
            }
            const sj = sa[sh];
            (sd += sj), sb[BF(0xaba)]([sh, sj]);
          }
        if (sb[BF(0x441)] === 0x0) continue;
        s6[BF(0xaba)]([sd, s9, sb, sc]);
      }
      rZ[BF(0x271)] && s6[BF(0x266)]((sk, sl) => sl[0x0] - sk[0x0]);
      for (let sk = 0x0; sk < s6[BF(0x441)]; sk++) {
        const [sl, sm, sn, so] = s6[sk];
        rZ[BF(0xa57)] && !so && sn[BF(0x266)]((ss, st) => st[0x1] - ss[0x1]);
        let sp = "";
        rZ[BF(0x910)] && (sp += sk + 0x1 + ".\x20");
        sp += sm;
        const sq = nA(BF(0xd3b) + sp + BF(0x103));
        s4[BF(0x72b)](sq);
        const sr = nA(BF(0x22f));
        for (let ss = 0x0; ss < sn[BF(0x441)]; ss++) {
          const [st, su] = sn[ss],
            sv = dF[st],
            sw = nA(
              BF(0x572) + sv[BF(0xd26)] + "\x22\x20" + qk(sv) + BF(0x3e3)
            );
          if (!so && rZ[BF(0x7e9)]) {
            const sx = rZ[BF(0x450)] + k9(su) + rZ[BF(0x41f)],
              sy = nA(BF(0xb8f) + sx + BF(0x103));
            sx[BF(0x441)] > 0x6 && sy[BF(0x30b)][BF(0x5d6)](BF(0xa97)),
              sw[BF(0x72b)](sy);
          }
          (sw[BF(0x34f)] = sv), sr[BF(0x72b)](sw);
        }
        s4[BF(0x72b)](sr);
      }
      kl[BF(0x72b)](s3),
        s5[BF(0x441)] > 0x0 &&
          console[BF(0x9b1)](BF(0x64a) + s5[BF(0xa18)](",\x20")),
        document[BF(0x4f6)][BF(0x30b)][BF(0x5d6)](BF(0x223));
    }
    (window[uf(0x491)] = qP),
      (document[uf(0x4f6)][uf(0x21a)] = function (rY) {
        const BH = uf;
        rY[BH(0x840)]();
        const rZ = rY[BH(0x9db)][BH(0xdab)][0x0];
        if (rZ && rZ[BH(0x5a0)] === BH(0x994)) {
          console[BH(0x9b1)](BH(0x496) + rZ[BH(0x56f)] + BH(0x801));
          const s0 = new FileReader();
          (s0[BH(0xa78)] = function (s1) {
            const BI = BH,
              s2 = s1[BI(0x54c)][BI(0x26a)];
            try {
              const s3 = JSON[BI(0x21e)](s2);
              qP(s3);
            } catch (s4) {
              console[BI(0x334)](BI(0xd51), s4);
            }
          }),
            s0[BH(0x623)](rZ);
        }
      }),
      (document[uf(0x4f6)][uf(0xd6c)] = function (rY) {
        const BJ = uf;
        rY[BJ(0x840)]();
      }),
      Object[uf(0x40b)](window, uf(0x85f), {
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
