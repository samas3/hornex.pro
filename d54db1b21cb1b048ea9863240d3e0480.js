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
function a() {
  const BK = [
    "iReqGambleList",
    "AS\x20#1",
    "Shoots\x20outward\x20when\x20you\x20get\x20angry.",
    "\x20Wave\x20",
    "25th\x20January\x202024",
    ".shop-btn",
    "*Chromosome\x20reload:\x205s\x20→\x202s",
    "className",
    "Fixed\x20mobs\x20dropping\x20petals\x20on\x20suicide.",
    "Increased\x20final\x20wave:\x2030\x20→\x2040.",
    "powderPath",
    "14TrKUQU",
    "Breeding\x20now\x20also\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "By-product\x20of\x20ant\x27s\x20sexy\x20time.",
    "*Increased\x20zone\x20kick\x20time\x20to\x20120s.",
    "Increased\x20Shrinker\x20health:\x2010\x20→\x20150",
    "Unknown\x20message\x20id:\x20",
    "#8b533f",
    "0\x200",
    "userChat\x20mobKilled\x20mobDespawned\x20craftResult\x20wave",
    "object",
    "Stickbug\x20now\x20makes\x20your\x20petal\x20orbit\x20dance\x20back\x20&\x20forth\x20instead\x20of\x20left\x20&\x20right.",
    ".inventory-rarities",
    "onwheel",
    "bolder\x2017px\x20",
    "*Lightsaber\x20damage:\x206\x20→\x207",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M48\x200C21.53\x200\x200\x2021.53\x200\x2048v64c0\x208.84\x207.16\x2016\x2016\x2016h80V48C96\x2021.53\x2074.47\x200\x2048\x200zm208\x20412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74\x2013.41\x20128\x2029.92\x20128\x2048v368c0\x2038.87\x2034.65\x2069.65\x2074.75\x2063.12C234.22\x20474\x20256\x20444.46\x20256\x20412.57zM288\x20384v32c0\x2052.93-43.06\x2096-96\x2096h336c61.86\x200\x20112-50.14\x20112-112\x200-8.84-7.16-16-16-16H288z\x22/></svg>",
    "Rice",
    "Slowness\x20Duration",
    "opera",
    "Petal\x20Weight",
    "*Mob\x20power\x20and\x20droprate\x20increases\x20increases\x20as\x20wave\x20number\x20advances.",
    "*Dropped\x20by\x20Spider\x20Yoba.",
    ".inventory\x20.inventory-petals",
    "*Snail\x20health:\x2045\x20→\x2050",
    "BrnPE",
    "Some\x20Data",
    "unknown",
    "gcldSq",
    "cookie",
    "Fossil",
    "petalCoffee",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2050%\x20→\x2025%",
    "#7af54c",
    "pickedEl",
    "Purchased\x20from\x20a\x20pregnant\x20Queen\x20Ant\x20lol",
    ".download-btn",
    "devicePixelRatio",
    "Increases\x20your\x20petal\x20orbit\x20radius.",
    "layin",
    "<option\x20value=\x22",
    "*Mobs\x20are\x20smart\x20enough\x20to\x20move\x20through\x20maze.",
    "6fCH",
    "ount\x20",
    ".fixed-name-cb",
    "\x20[DONT\x20SHARE]\x20[HORNEX.PRO].txt",
    "*Fire\x20damage:\x20\x2020\x20→\x2025",
    "<div\x20class=\x22petal\x20spin\x20tier-",
    "Spider\x20Yoba\x27s\x20Lightsaber\x20now\x20scales\x20with\x20size.",
    "*Heavy\x20damage:\x209\x20→\x2010",
    "onchange",
    "avacado",
    "KGw#",
    ".scoreboard-title",
    "code",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x20rainbow-text\x22\x20stroke=\x22CONGRATULATIONS!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22You\x20have\x20won\x20a\x20sussy\x20loot!\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22petal\x20spin\x20tier-",
    "5th\x20July\x202023",
    "*Reduced\x20Hornet\x20Egg\x20reload\x20by\x20roughly\x2050%.",
    "Spider_1",
    "reload",
    "Elongation",
    "Much\x20much\x20lighter\x20than\x20your\x20mom.",
    "Increased\x20DMCA\x20reload\x20to\x2020s.",
    "𐐿𐐘𐐫𐑀𐐃",
    "Reduces\x20poison\x20effect\x20when\x20consumed.",
    "onload",
    ".claimer",
    "bee",
    "\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20inventory\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Inventory\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "left",
    "2357",
    "hpRegenPerSec",
    "*Kills\x20needed\x20for\x20Super\x20wave:\x2050\x20→\x20500",
    "Reduced\x20Shrinker\x20&\x20Expander\x20strength\x20by\x2020%",
    "Disconnected.",
    "toLocaleDateString",
    "local",
    "<div\x20class=\x22zone\x22>\x0a\x09\x09<div\x20stroke=\x22You\x20are\x20in\x22></div>\x0a\x09\x09<div\x20class=\x22zone-name\x22\x20stroke=\x22",
    "#754a8f",
    "startEl",
    "Statue",
    ".submit-btn",
    "makeMissile",
    "WOddQSocW5hcHmkeCCk+oCk7FrW",
    "player",
    "Beetle_1",
    "changedTouches",
    "#735b49",
    "*There\x20are\x2018\x20different\x20maze\x20maps.",
    "Extra\x20Range",
    "Bone",
    "Waveroom",
    "fill",
    ">\x0a\x09\x09\x09\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x",
    "Yin\x20Yang",
    "5th\x20January\x202024",
    "Username\x20too\x20big!",
    "rgb(43,\x20255,\x20163)",
    "Increases\x20your\x20health\x20and\x20body\x20size.",
    "#5849f5",
    "pathSize",
    "numeric",
    "23rd\x20August\x202023",
    "#fbb257",
    "countTiers",
    "localStorage\x20denied.",
    "WQxdVSkKW5VcJq",
    ".changelog-btn",
    "#cf7030",
    "*Wing\x20reload:\x202.5s\x20→\x202s",
    "*Heavy\x20health:\x20200\x20→\x20250",
    "Reduced\x20petal\x20knockback\x20on\x20mobs.",
    "Arrow",
    "getContext",
    "<div\x20class=\x22petal-info\x22>\x0a\x09\x09\x09\x09<div\x20style=\x22color:\x20",
    "Pretends\x20to\x20be\x20a\x20petal\x20to\x20bait\x20players.\x20Former\x20worker\x20of\x20an\x20Indian\x20call\x20center.",
    "loading",
    ".hitbox-cb",
    "open",
    "New\x20petal:\x20Snail.\x20Twirls\x20your\x20petal\x20orbit.",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when\x20you\x20die\x20collecting\x20a\x20lot\x20of\x20petals.",
    ".stats\x20.dialog-content",
    "\x20all\x20",
    "W6rnWPrGWPfdbxmAWOHa",
    "cde9W5NdTq",
    "Death\x20screen\x20now\x20also\x20shows\x20total\x20rarity\x20collected.",
    "Mob\x20Size\x20Change",
    "mob_",
    "M\x20152.826\x20143.111\x20C\x20121.535\x20159.092\x20120.433\x20160.864\x20121.908\x20197.88\x20C\x20121.908\x20197.88\x20123.675\x20213.781\x20146.643\x20226.148\x20C\x20169.611\x20238.515\x20364.84\x20213.782\x20364.84\x20213.782\x20C\x20364.84\x20213.782\x20374.834\x20202.63\x20351.59\x20180.213\x20C\x20328.346\x20157.796\x20273.282\x20161.162\x20250.883\x20146.643\x20C\x20228.484\x20132.124\x20197.731\x20120.178\x20152.826\x20143.111\x20Z",
    ".minimap",
    "Pets\x20do\x20not\x20spawn\x20during\x20waves\x20now.",
    "3YHM",
    "Low\x20IQ\x20mob\x20that\x20moves\x20like\x20a\x20retard.",
    ".stats",
    "Loaded\x20Build\x20#",
    "data",
    ".checkbox",
    "Importing\x20data\x20file:\x20",
    "hasAntenna",
    ".joystick-knob",
    "extraRangeTiers",
    "Fixed\x20users\x20sometimes\x20continuously\x20getting\x20kicked.",
    "dev",
    "/dlMob",
    "setCount",
    "rgb(92,\x20116,\x20176)",
    "\x22\x20stroke=\x22(",
    "Soldier\x20Ant_4",
    "petalLeaf",
    "checked",
    "Ears",
    "WOziW7b9bq",
    "drawWingAndHalo",
    "Increased\x20start\x20wave\x20to\x20upto\x2075.",
    "agroRangeDec",
    "orbitRange",
    "Gem\x20now\x20reflects\x20missiles\x20but\x20with\x20their\x20damage\x20reduced.",
    "\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22(click\x20to\x20take\x20in\x20inventory)\x22></div>\x0a\x09\x09\x09",
    "Increased\x20Shrinker\x20&\x20Expander\x20reload\x20time:\x205s\x20→\x206s",
    "\x0a\x09<div><span\x20stroke=\x22Level\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Health\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Damage\x22></span></div>\x0a\x09<div><span\x20stroke=\x22Petal\x20Slots\x22></span></div>",
    "petalFire",
    "25th\x20June\x202023",
    "100%",
    "All\x20mobs\x20now\x20spawn\x20in\x20waves.",
    "Downloaded!",
    "Fixed\x20Pincer\x20not\x20slowing\x20down\x20mobs.",
    "Bush",
    "Flips\x20your\x20petal\x20orbit\x20direction.",
    "Dark\x20Ladybug",
    ".featured",
    "Very\x20beautiful\x20and\x20wholesome\x20creature.\x20Best\x20pet\x20to\x20have!",
    "getUint8",
    "Ultra",
    "ing\x20o",
    ".bar",
    "Taco",
    "angleOffset",
    "1841224gIAuLW",
    "New\x20mob:\x20Beehive.",
    "*Snail\x20damage:\x2015\x20→\x2020",
    ".petals-picked",
    "map",
    "passiveBoost",
    "Dahlia",
    "blue",
    "Ancester\x20of\x20flowers.",
    "23rd\x20July\x202023",
    "Fixed\x20Gem\x20glitch.",
    "focus",
    "#493911",
    "8th\x20August\x202023",
    "Increased\x20final\x20wave:\x2040\x20→\x2050",
    "halo",
    "KeyR",
    "Pedox\x20does\x20not\x20drop\x20Skull\x20now.",
    "remove",
    "#b0c0ff",
    ".lottery\x20.inventory-petals",
    "antHoleFire",
    ";\x20margin-top:\x205px;\x22\x20stroke=\x22Need\x20to\x20be\x20Lvl\x20125\x20at\x20least!\x22></div>",
    "*You\x20can\x20save\x20upto\x2020\x20builds.",
    "occupySlot",
    "*Soil\x20health\x20increase:\x2050\x20→\x2075",
    "Heal",
    "<div\x20class=\x22gamble-user\x22>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "Fixed\x20duplicate\x20drops.",
    "WPfQmmoXFW",
    "wrecked",
    "Don\x27t\x20ask\x20us\x20how\x20it\x20laid\x20an\x20egg.",
    "LavaWater",
    "*Taco\x20healing:\x208\x20→\x209",
    "petalPacman",
    "Fixed\x20crafting\x20infinite\x20spin\x20glitch.",
    "Mobs\x20have\x20extremely\x20low\x20chance\x20of\x20spawning\x20on\x20players\x20in\x20Waveroom\x20now.",
    "*More\x20number\x20of\x20petals\x20collected\x20equals\x20higher\x20chance\x20of\x20keeping\x20it\x20in\x20the\x20final\x20loot.",
    "#f2b971",
    "nice\x20stolen\x20florr\x20assets",
    "tierStr",
    "oSize",
    "start",
    "isConsumable",
    "Low\x20health\x20regeneration\x20but\x20faster\x20reload.",
    "active",
    "desktop",
    "Sandstorm_2",
    "toUpperCase",
    "Swastika",
    "Fire\x20Ant\x20Hole",
    "Youtubers\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "redHealthTimer",
    "\x20(Lvl\x20",
    "our\x20o",
    "Fixed\x20Ultra\x20Stick\x20spawn.",
    "endsWith",
    ".petal-rows",
    "Starfish\x20can\x20only\x20regenerate\x20for\x205s\x20now.",
    "nameEl",
    "Renamed\x20Yoba\x20mob\x20name\x20&\x20changed\x20its\x20description.",
    ";font-size:16px;\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Loot\x20they\x20got:\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22x",
    "sendBadMsg",
    "It\x20shoots\x20a\x20poisonous\x20triangle\x20from\x20its\x20sussy\x20structure.",
    "\x20You\x20will\x20be\x20logged\x20out\x20of\x20your\x20current\x20Discord\x20linked\x20account.",
    "M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419\x20\x20c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006\x20\x20c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148\x20\x20c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59\x20\x20C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0\x20\x20C254,156.266,242.618,141.337,226.816,136.022z",
    "*Before\x20importing\x20any\x20account,\x20make\x20sure\x20to\x20export\x20your\x20current\x20account\x20to\x20not\x20lose\x20it.",
    "outlineCount",
    "US\x20#1",
    "render",
    "moveSpeed",
    "*Dandelion\x20heal\x20reduce:\x2020%\x20→\x2030%",
    "#775d3e",
    "https://www.youtube.com/@NeowmHornex",
    "pickupRangeTiers",
    ".timer",
    "Fixed\x20tooltips\x20sometimes\x20not\x20hiding\x20on\x20Firefox.",
    "%</option>",
    "reset",
    "wss://eu2.hornex.pro",
    "origin",
    "gblcVXldOG",
    "projPoisonDamageF",
    ".lottery-rarities",
    "Buffed\x20Waveroom\x20final\x20loot\x20keeping\x20chance:\x2070%\x20→\x2085%",
    "addCount",
    "Fixed\x20Waveroom\x20actually\x20giving\x20you\x20less\x20petals\x20if\x20you\x20collected\x20more\x20petals.\x20This\x20bug\x20had\x20been\x20in\x20the\x20game\x20since\x2025th\x20August\x20💀.\x20It\x20also\x20sometimes\x20gave\x20players\x20more\x20loot.",
    "*Heavy\x20health:\x20250\x20→\x20300",
    "*Missile\x20damage:\x2030\x20→\x2035",
    "craftResult",
    "Pill",
    "spawnT",
    "Poo",
    "*Clarification:\x20A\x20Hyper\x20mob\x20can\x20drop\x20the\x20same\x20Ultra\x20petal\x20upto\x203\x20times.\x20It\x20isn\x27t\x20limited\x20to\x20dropping\x203\x20petals\x20only.\x20If\x20a\x20mob\x20has\x204\x20unique\x20petal\x20drops,\x20a\x20Hyper\x20mob\x20can\x20drop\x20upto\x2012\x20Ultra\x20petals.",
    "scale2",
    "*If\x20there\x20are\x20more\x20than\x2015\x20players\x20in\x20a\x20zone\x20during\x20waves,\x20they\x20are\x20teleported\x20to\x20other\x20zones\x20based\x20on\x20the\x20time\x20they\x20have\x20spend\x20in\x20the\x20zone.",
    "childIndex",
    "bsorb",
    "Sponge",
    "n\x20war",
    "*Lightning\x20damage:\x2018\x20→\x2020",
    "1st\x20August\x202023",
    "Reduced\x20wave\x20duration\x20by\x2050%.",
    "22nd\x20January\x202024",
    "petalStarfish",
    "#fbdf26",
    "binaryType",
    "Rock\x20Egg",
    "Infamous\x20minor\x20enjoyer\x20with\x20a\x20YouTube\x20channel.",
    "Increased\x20mob\x20species\x20count\x20during\x20waves:\x205\x20→\x206",
    "Connected!",
    "hasSwastika",
    "*Rose\x20heal:\x2013\x20→\x2011",
    "#a33b15",
    "You\x20need\x20to\x20have\x20at\x20least\x2010\x20kills\x20during\x20waves\x20to\x20get\x20wave\x20rewards\x20now.",
    "Beetle_3",
    "mobId",
    "WQ7dTmk3W6FcIG",
    "Reduced\x20Desert\x20Centipede\x20speed\x20in\x20waves\x20by\x2025%",
    "Heavy",
    "#764b90",
    "When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has\x2010%\x20chance\x20of\x20duplicating\x20it,\x2020%\x20chance\x20of\x20deleting\x20your\x20drop\x20&\x2070%\x20chance\x20of\x20doing\x20nothing.\x20Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20petal.",
    "Web",
    "New\x20score\x20formula.",
    "Powder\x20cooldown:\x202.5s\x20→\x201.5s",
    "sizeIncrease",
    "Re-added\x20portals\x20in\x20Unusual\x20zone.",
    "*Reduced\x20Spider\x20Yoba\x27s\x20Lightsaber\x20damage\x20by\x2090%",
    "offsetWidth",
    "#ff4f4f",
    "oceed",
    "*Light\x20reload:\x200.8s\x20→\x200.7s",
    "Fixed\x20Wig\x20not\x20working\x20correctly.",
    "globalAlpha",
    "Pill\x20affects\x20Arrow\x20now.",
    "keys",
    "hasSpawnImmunity",
    "eyeY",
    "*Swastika\x20health:\x2020\x20→\x2025",
    "hsla(0,0%,100%,0.5)",
    "KeyW",
    "No\x20username\x20provided.",
    "petalBanana",
    "Increased\x20Ultra\x20key\x20price.",
    "scale(",
    "angle",
    "Reduced\x20Ant\x20Hole,\x20Spider\x20Cave\x20&\x20Beehive\x20move\x20speed\x20in\x20waves\x20by\x2030%.",
    "<span\x20style=\x22color:",
    "*Ultra:\x20120",
    "air",
    "getElementById",
    "Avacado",
    "GBip",
    "files",
    ".import-btn",
    "<div\x20class=\x22petal-key\x22\x20stroke=\x22[",
    "*21\x20Rare\x20(3.33%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Invalid\x20petal\x20name:\x20",
    "Mob\x20Rotation",
    "3m^(",
    "accou",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09<path\x20d=\x22M20.992\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.050\x200.005\x200.109\x200.005\x200.168\x200\x201.523-1.191\x202.768-2.693\x202.854l-0.008\x200zM11.026\x2020.163c-1.511-0.099-2.699-1.349-2.699-2.877\x200-0.051\x200.001-0.102\x200.004-0.153l-0\x200.007c-0.003-0.048-0.005-0.104-0.005-0.161\x200-1.525\x201.19-2.771\x202.692-2.862l0.008-0c1.509\x200.082\x202.701\x201.325\x202.701\x202.847\x200\x200.062-0.002\x200.123-0.006\x200.184l0-0.008c0.003\x200.048\x200.005\x200.104\x200.005\x200.161\x200\x201.525-1.19\x202.771-2.692\x202.862l-0.008\x200zM26.393\x206.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035\x200-0.065\x200.019-0.081\x200.047l-0\x200c-0.234\x200.411-0.488\x200.924-0.717\x201.45l-0.043\x200.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398\x200.094-3.557\x200.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041\x200.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005\x200-0.011\x200-0.016\x200.001l0.001-0c-2.293\x200.403-4.342\x201.060-6.256\x201.957l0.151-0.064c-0.017\x200.007-0.031\x200.019-0.040\x200.034l-0\x200c-2.854\x204.041-4.562\x209.069-4.562\x2014.496\x200\x200.907\x200.048\x201.802\x200.141\x202.684l-0.009-0.11c0.003\x200.029\x200.018\x200.053\x200.039\x200.070l0\x200c2.14\x201.601\x204.628\x202.891\x207.313\x203.738l0.176\x200.048c0.008\x200.003\x200.018\x200.004\x200.028\x200.004\x200.032\x200\x200.060-0.015\x200.077-0.038l0-0c0.535-0.72\x201.044-1.536\x201.485-2.392l0.047-0.1c0.006-0.012\x200.010-0.027\x200.010-0.043\x200-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077\x200.042c-0.029-0.017-0.048-0.048-0.048-0.083\x200-0.031\x200.015-0.059\x200.038-0.076l0-0c0.157-0.118\x200.315-0.24\x200.465-0.364\x200.016-0.013\x200.037-0.021\x200.059-0.021\x200.014\x200\x200.027\x200.003\x200.038\x200.008l-0.001-0c2.208\x201.061\x204.8\x201.681\x207.536\x201.681s5.329-0.62\x207.643-1.727l-0.107\x200.046c0.012-0.006\x200.025-0.009\x200.040-0.009\x200.022\x200\x200.043\x200.008\x200.059\x200.021l-0-0c0.15\x200.124\x200.307\x200.248\x200.466\x200.365\x200.023\x200.018\x200.038\x200.046\x200.038\x200.077\x200\x200.035-0.019\x200.065-0.046\x200.082l-0\x200c-0.661\x200.395-1.432\x200.769-2.235\x201.078l-0.105\x200.036c-0.036\x200.014-0.062\x200.049-0.062\x200.089\x200\x200.016\x200.004\x200.031\x200.011\x200.044l-0-0.001c0.501\x200.96\x201.009\x201.775\x201.571\x202.548l-0.040-0.057c0.017\x200.024\x200.046\x200.040\x200.077\x200.040\x200.010\x200\x200.020-0.002\x200.029-0.004l-0.001\x200c2.865-0.892\x205.358-2.182\x207.566-3.832l-0.065\x200.047c0.022-0.016\x200.036-0.041\x200.039-0.069l0-0c0.087-0.784\x200.136-1.694\x200.136-2.615\x200-5.415-1.712-10.43-4.623-14.534l0.052\x200.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\x22></path>\x0a\x09</svg>",
    "chain",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22FAILURE!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Failed\x20to\x20check\x20validity.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Try\x20again\x20later.\x22></div>\x0a\x09\x09\x09",
    "nLrqsbisiv0SrmoD",
    ".absorb\x20.dialog-content",
    "petalSkull",
    "cDHZ",
    "classList",
    "Nerfed\x20mob\x20health\x20&\x20damage\x20in\x20early\x20waves\x20by\x2075%",
    ".zone-name",
    "petalBone",
    "evenodd",
    "shell",
    "Mobs\x20do\x20not\x20spawn\x20around\x20you\x20if\x20you\x20have\x20spawn\x20immunity\x20in\x20Waveroom\x20now.",
    "*Super:\x201%\x20→\x201.5%",
    "Spider",
    "#7d5098",
    "shieldRegenPerSecF",
    "2nd\x20October\x202023",
    "29th\x20June\x202023",
    "Hyper\x20mobs\x20can\x20now\x20go\x20into\x20Ultra\x20zone.",
    "Added\x20special\x20waves\x20in\x20Waveroom:",
    "New\x20mob:\x20Sunflower.",
    "builds",
    "Dragon\x20Nest",
    "moveCounter",
    "stroke",
    "Poison",
    "*97\x20Ultra\x20(0.72%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    ".hud",
    "Reduces\x20enemy\x20movement\x20speed\x20temporarily.",
    "then",
    "*Reduced\x20Ghost\x20move\x20speed:\x2012.2\x20→\x2011.6",
    ".mobs-btn",
    "#3db3cb",
    "Yoba\x20Egg",
    "Soldier\x20Ant_2",
    "spin",
    "span\x202",
    "Fixed\x20sometimes\x20players\x20randomly\x20getting\x20kicked\x20for\x20invalidProtocal\x20while\x20switching\x20lobbies.",
    "hasHearts",
    ".container",
    "makeLadybug",
    "Nitro\x20Boost",
    "shieldHpLosePerSec",
    "fillStyle",
    "Wave\x20",
    "e8oQW7VdPKa",
    "health",
    "round",
    "\x20&\x20",
    "KCsdZ",
    "We\x20are\x20not\x20sure\x20how\x20it\x20laid\x20an\x20egg.",
    "type",
    "keydown",
    "transformOrigin",
    "*Killing\x20a\x20shiny\x20mob\x20gives\x20you\x20shiny\x20skin.",
    "#f54ce7",
    "*Recuded\x20mob\x20count.",
    "shift",
    "23rd\x20June\x202023",
    "Ghost_4",
    "New\x20petal:\x20Gas.\x20Dropped\x20by\x20Dragon.",
    "maxLength",
    "show-petal",
    "cmk/auqmq8o8WOngW79c",
    "Hornet\x20Egg",
    "animationDirection",
    "isDevelopmentMode",
    "clientY",
    "<div\x20class=\x22chat-text\x22></div>",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22EXPIRED!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Key\x20was\x20already\x20used\x20by:\x22\x20style=\x22margin-top:\x205px;\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22claimer\x20link\x22\x20stroke=\x22",
    "#353331",
    "#be342a",
    "invalid\x20uuid",
    "}\x0a\x0a\x09\x09body\x20{\x0a\x09\x09\x09--num-tiers:\x20",
    "background",
    "show_debug_info",
    "Halo",
    "3rd\x20August\x202023",
    "WARNING:\x20Export\x20your\x20current\x20account\x20before\x20proceeding\x20to\x20import\x20another\x20account.\x20You\x20will\x20lose\x20your\x20current\x20account\x20otherwise.\x0a\x0aEnter\x20account\x20password:",
    "krBw",
    "pedox",
    "WRbjb8oX",
    "Extremely\x20slow\x20sussy\x20mob\x20with\x20a\x20shell.",
    "*Pooped\x20Soldier\x20Ant\x20count:\x204\x20→\x203",
    "repeat",
    "#400",
    ".time-alive",
    "petalRock",
    "Cultivated\x20in\x20Africa.\x20Aborbs\x20damage\x20&\x20turns\x20you\x20into\x20a\x20nigerian.",
    "#4d5e56",
    "\x0a\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+2)\x20span\x20{color:",
    "isProj",
    "Furry",
    "#503402",
    "#2da14d",
    "<div\x20",
    "Wave",
    "Yoba_1",
    "update",
    "<div\x20stroke=\x22Such\x20empty,\x20much\x20space\x22></div>",
    "*Waveroom\x20is\x20a\x20wave\x20lobby\x20of\x204\x20players\x20with\x20final\x20wave\x20set\x20to\x20250.",
    "renderOverEverything",
    "arial",
    "bar",
    "#32a852",
    "Increased\x20level\x20needed\x20for\x20Hyper\x20wave:\x20175\x20→\x20225",
    "Beehive",
    "pedoxMain",
    "pop",
    "2090768fiNzSa",
    "petalHoney",
    "*Do\x20not\x20share\x20your\x20account\x27s\x20password\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20can\x20have\x20access\x20to\x20your\x20account.",
    "18th\x20July\x202023",
    "W7/cOmkwW4lcU3dcHKS",
    "*Your\x20account\x20is\x20not\x20saved\x20in\x20Waveroom.\x20You\x20can\x20craft\x20or\x20absorb\x20all\x20your\x20petals\x20and\x20then\x20get\x20them\x20all\x20back\x20when\x20you\x20leave\x20the\x20Waveroom.",
    "/dlSprite",
    "lightning",
    "Ghost_7",
    "nShield",
    "New\x20petal:\x20Skull.\x20Very\x20heavy\x20petal\x20that\x20can\x20move\x20mobs\x20around.\x20Dropped\x20by\x20Fossil.",
    "Fixed\x20issues\x20with\x20Pacman\x27s\x20summons\x20in\x20waves.",
    "<div\x20class=\x22stat\x22>\x0a\x09\x09<div\x20class=\x22stat-name\x22\x20stroke=\x22",
    "\x20FPS\x20/\x20",
    "boostStrength",
    "hsl(60,60%,60%)",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M27.299\x202.246h-22.65c-1.327\x200-2.402\x201.076-2.402\x202.402v22.65c0\x201.327\x201.076\x202.402\x202.402\x202.402h22.65c1.327\x200\x202.402-1.076\x202.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM7.613\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM15.974\x2019.093c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12-1.397\x203.12-3.12\x203.12zM24.335\x2027.455c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12zM24.335\x2010.732c-1.723\x200-3.12-1.397-3.12-3.12s1.397-3.12\x203.12-3.12\x203.12\x201.397\x203.12\x203.12c-0\x201.723-1.397\x203.12-3.12\x203.12z\x22></path>\x0a</svg>",
    "warne",
    "center",
    "Heart",
    "Spider\x20Legs",
    "6th\x20August\x202023",
    "#ceea33",
    "Fixed\x20another\x20server\x20crash\x20bug.",
    "split",
    "*The\x20leftover\x20loot\x20is\x20put\x20back\x20into\x20next\x20lottery\x20cycle.",
    "antHole",
    "A\x20caveman\x20used\x20to\x20live\x20here,\x20but\x20soon\x20the\x20spiders\x20came\x20and\x20ate\x20him.",
    "Buffed\x20Arrow\x20health\x20from\x20200\x20to\x20250.",
    "ceil",
    "#38ecd9",
    "Extra\x20Pickup\x20Range",
    "New\x20setting:\x20Fixed\x20Name\x20Size.\x20Makes\x20your\x20names\x20&\x20chats\x20not\x20get\x20affected\x20by\x20zoom.\x20Disabled\x20by\x20default.\x20Press\x20U\x20to\x20toggle.",
    ".pro",
    "moveFactor",
    "petalShell",
    "petalCotton",
    "Bounces",
    "hostn",
    "]\x22></div>",
    ".player-list",
    "c)H[",
    "hornex-pro_300x600",
    "<div\x20style=\x22color:\x20",
    "You\x20now\x20have\x20to\x20be\x20at\x20least\x2015s\x20in\x20the\x20zone\x20to\x20get\x20wave\x20mob\x20spawns.",
    "Fixed\x20Shrinker\x20sometimes\x20growing\x20spawned\x20mobs\x20from\x20shrinked\x20spawners.",
    "ladybug",
    "You\x20are\x20doing\x20too\x20much,\x20try\x20again\x20later.",
    "Some\x20mobs\x20were\x20reworked\x20and\x20minor\x20extra\x20details\x20were\x20added\x20to\x20them.",
    "#393cb3",
    "*Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive\x20mob.",
    "Wave\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20from\x20their\x20target\x20or\x20if\x20their\x20target\x20has\x20been\x20neutralized.",
    "1st\x20July\x202023",
    ".\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Can\x20only\x20contain\x20English\x20letters,\x20numbers,\x20and\x20underscore.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Username\x20can\x20only\x20be\x20set\x20once!\x22></div>\x0a\x09</div>",
    "consumeProj",
    ".scale-cb",
    "Saved\x20Build\x20#",
    "Bee",
    "Removed\x20no\x20spawn\x20damage\x20rule\x20from\x20pets.",
    "index",
    ".right-align-petals-cb",
    "player_id",
    "*2%\x20craft\x20success\x20rate.",
    "131750eBDpoV",
    ".level-progress",
    "Fixed\x20some\x20mob\x20icons\x20looking\x20sussy.",
    "inventory",
    "*Pacman\x20health:\x20100\x20→\x20120.",
    "style",
    "Passively\x20regenerates\x20shield.",
    "Damage",
    "\x0a\x09<svg\x20height=\x22800px\x22\x20width=\x22800px\x22\x20version=\x221.1\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x09\x20viewBox=\x22-271\x20273\x20256\x20256\x22\x20xml:space=\x22preserve\x22>\x0a\x09<path\x20d=\x22M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\x0a\x09\x09v-52.3C-15.1,295.2-37.3,273-64.5,273z\x20M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z\x20M-179.6,374.7\x0a\x09\x09c8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\x0a\x09\x09C-188.1,391.2-184.9,382.1-179.6,374.7z\x20M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\x0a\x09\x09c-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\x22/>\x0a\x09</svg>",
    "_blank",
    "*158\x20Hyper\x20(0.44%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "\x20ctxs\x20(",
    "24th\x20June\x202023",
    "Stick\x20does\x20not\x20expand\x20now.",
    "petalPowder",
    "video-ad-skipped",
    "advanced\x20to\x20number\x20",
    ".find-user-input",
    "pow",
    ".rewards\x20.dialog-content",
    "210ZoZRjI",
    "Spider_4",
    "icBdNmoEta",
    "min",
    "makeSpiderLegs",
    "Shrinker\x20now\x20does\x20not\x20die\x20when\x20it\x20is\x20used\x20on\x20a\x20mob\x20that\x20is\x20already\x20at\x20its\x20minimum\x20size.",
    ".inventory-petals",
    "#ffe200",
    "Fixed\x20mobs\x20spawned\x20from\x20shiny\x20spawners\x20having\x20extremely\x20high\x20drop\x20rate\x20in\x20Asian\x20servers\x20since\x20AS\x20was\x20migrated\x20from\x20China\x20to\x20Singapore.\x20The\x20drop\x20rates\x20were\x20around\x20100x\x20to\x2010000x.",
    "tumbleweed",
    "wss://as1.hornex.pro",
    "#eee",
    "#454545",
    ".shop-info",
    "*Starfish\x20healing:\x202.5/s\x20→\x203/s",
    "https://www.youtube.com/watch?v=qNYVwTuGRBQ",
    "Cotton\x20bush.",
    "ages.",
    "Game",
    "Boomerang.",
    "px\x20",
    ".screen",
    "runSpeed",
    "Fixed\x20Ghost\x20not\x20showing\x20in\x20mob\x20gallery.",
    "*There\x20is\x20a\x205%\x20chance\x20of\x20getting\x20a\x20special\x20wave.",
    "Pill\x20does\x20not\x20affect\x20Nitro\x20now.",
    "#fcfe04",
    "Reduced\x20Hyper\x20craft\x20rate:\x201%\x20→\x200.5%",
    "A\x20coffee\x20bean\x20that\x20gives\x20you\x20some\x20extra\x20speed\x20boost\x20for\x201.5s.\x20Stacks\x20with\x20duration\x20&\x20other\x20petals.",
    "#222",
    "#9e7d24",
    "New\x20mob:\x20Stickbug.\x20Credits\x20to\x20Dwajl.",
    "%nick%",
    ".petals.small",
    "<div\x20class=\x22petal\x20empty\x22></div>",
    "*Snail\x20Health:\x20180\x20→\x20120",
    "9th\x20August\x202023",
    "lineWidth",
    "Baby\x20Ant",
    "n8oIFhpcGSk0W7JdT8kUWRJcOq",
    "*Pet\x20Ghost\x20damage\x20is\x20now\x2010x\x20of\x20mob\x20damage\x20(1).",
    "https://www.youtube.com/@gowcaw97",
    "New\x20petal:\x20Arrow.\x20Locks\x20onto\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.\x20Dropped\x20by\x20Spider\x20Yoba",
    "*5\x20Common\x20(14%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "right_align_petals",
    "Summons\x20the\x20power\x20of\x20wind.",
    "Petal\x20Slots",
    "Fixed\x20petal/mob\x20icons\x20not\x20showing\x20up\x20on\x20some\x20devices.",
    "#a82a00",
    "Evil\x20Centipede",
    "Fixed\x20petal\x20arrangement\x20glitching\x20when\x20you\x20gained\x20a\x20new\x20petal\x20slot.",
    "*Nearby\x20players\x20for\x20move\x20away\x20warning:\x206\x20→\x204",
    "Salt",
    "petalWave",
    "*Lightning\x20reload:\x202s\x20→\x202.5s",
    "petalSword",
    "*Arrow\x20damage:\x201\x20→\x203",
    "*Swastika\x20damage:\x2025\x20→\x2030",
    "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg",
    "https://auth.hornex.pro/discord",
    "*Soil\x20health\x20increase:\x2075\x20→\x20100",
    "Hornet_5",
    "New\x20settings:\x20Low\x20quality.",
    "2nd\x20August\x202023",
    "reqFailed",
    "honeyTile",
    "drawTurtleShell",
    ".ads",
    "are\x20p",
    "#8a6b1f",
    "\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22timer\x22></div>\x0a\x09</div>",
    "13th\x20July\x202023",
    "Health\x20Depletion",
    "iPercent",
    "Decreases",
    "rando",
    ".chat-content",
    "*Peas\x20health:\x2020\x20→\x2025",
    "rock",
    "AS\x20#2",
    "Spawn\x20zone\x20changes:",
    "ICIAL",
    "extraSpeed",
    "dSk+d0afnmo5WODJW6zQxW",
    "Dragon_5",
    ".grid-cb",
    "Gem",
    ".discord-area",
    "Balancing:",
    "damageF",
    "New\x20petal:\x20Rock\x20Egg.\x20Dropped\x20by\x20Rock.\x20Spawns\x20a\x20pet\x20rock.",
    "Minor\x20changes\x20to\x20Hyper\x20drop\x20rates.",
    "Added\x20Clear\x20button\x20in\x20absorb\x20menu.",
    "Pollen\x20now\x20smoothly\x20falls\x20on\x20the\x20ground.",
    "3WRI",
    "RuinedLiberty",
    "kbps",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22Disclaimer:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22(if\x20you\x20say\x20so)\x22\x20style=\x22color:",
    "\x0a\x09\x09\x09\x09\x09<div\x20class=\x22inventory-petals\x22></div>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09</div>\x0a\x09</div>",
    "Added\x20a\x20warning\x20message\x20when\x20you\x20try\x20to\x20participate\x20in\x20Lottery.",
    "rgb(237\x2061\x20234)",
    "Buffed\x20Hyper\x20craft\x20rate:\x200.5%\x20→\x200.51%",
    "*Lightning\x20reload:\x202.5s\x20→\x202s",
    ".loader",
    "WRyiwZv5x3eIdtzgdgC",
    "textarea",
    "Increased\x20kills\x20needed\x20to\x20start\x20waves\x20by\x20roughly\x205x.",
    "*Basic\x20reload:\x203s\x20→\x202.5s",
    "*Coffee\x20reload:\x202s\x20+\x201s\x20→\x202s\x20+\x200.5s",
    "Salt\x20reflection\x20reduction\x20with\x20Sponge:\x2080%\x20→\x2090%",
    "*Light\x20damage:\x2012\x20→\x2010",
    "have\x20",
    "Fixed\x20crafting\x20failure\x20&\x20wave\x20winner\x20chat\x20message\x20sometimes\x20showing\x20up\x20late.",
    "countEl",
    "New\x20petal:\x20Sunflower.\x20Passively\x20regenerates\x20shield.",
    "button",
    "globalCompositeOperation",
    "loginFailed",
    "shlong",
    "queenAnt",
    "ready",
    "New\x20petal:\x20Coffee.\x20Gives\x20you\x20temporary\x20speed\x20boost.\x20Dropped\x20by\x20Bush.",
    "offsetHeight",
    "iDepositPetal",
    "Borrowed\x20from\x20Darth\x20Vader\x20himself.",
    ".inventory",
    "PedoX",
    "ellipse",
    "encode",
    ">\x0a\x09\x09\x0a\x09\x09<div\x20class=\x22petal-count\x22\x20stroke=\x22x99\x22></div>\x0a\x09</div>",
    "petalCement",
    "Fixed\x20Arrow\x20&\x20Banana\x20glitch.",
    "Level\x20",
    "\x22></div>\x0a\x09\x09\x09",
    "*Peas\x20damage:\x208\x20→\x2010",
    "New\x20petal:\x20Bone.\x20Dropped\x20by\x20Dragon.",
    "Buffed\x20Sword\x20damage:\x2016\x20→\x2017",
    "number",
    "B4@J",
    "11th\x20August\x202023",
    "other",
    "image/png",
    "setUint32",
    "\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22close-btn\x20btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09</div>",
    "Soldier\x20Ant_5",
    "string",
    "4gMXBME",
    "Error\x20refreshing\x20ad.",
    "Youtube\x20videos\x20are\x20now\x20featured\x20on\x20the\x20game.",
    "onkeydown",
    "#ff7892",
    "seed",
    "*Light\x20reload:\x200.7s\x20→\x200.6s",
    "Sandstorm_6",
    "url(https://i.ytimg.com/vi/",
    "<div\x20class=\x22petal-reload\x20petal-info\x22>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "Reduced\x20Ears\x20range\x20by\x2030%",
    "dice",
    "Increased\x20mob\x20count\x20in\x20waveroom\x20duo\x20(by\x20around\x202x).",
    "waveNumber",
    "petalExpander",
    "=([^;]*)",
    ".global-user-count",
    "getHurtColor",
    "projSize",
    "*Lightsaber\x20health:\x20200\x20→\x20300",
    ".gamble-petals-btn",
    "sponge",
    "New\x20lottery\x20win\x20loot\x20distribution:",
    "Added\x20spawn\x20zones.\x20Zones\x20unlock\x20with\x20level.",
    "Added\x201\x20AS\x20lobby.",
    "hsla(0,0%,100%,0.25)",
    "10px",
    "\x20HP",
    "<div\x20class=\x22glb-item\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "You\x20can\x20now\x20hurt\x20mobs\x20while\x20having\x20immunity.",
    "KeyG",
    ";position:absolute;top:",
    "petalChromosome",
    "Added\x20R\x20button\x20on\x20mobile\x20devices.",
    "assualted",
    "#db4437",
    "prog",
    "Looks\x20like\x20the\x20dinosaurs\x20got\x20extinct\x20again.",
    "healthIncreaseF",
    "Epic",
    "Fixed\x20Dandelions\x20from\x20mob\x20firing\x20at\x20wrong\x20angle\x20sometimes.",
    "bottom",
    "Global\x20Leaderboard\x20now\x20shows\x20top\x2050\x20players.",
    "Leave",
    "class=\x22chat-cap\x22",
    "New\x20petal:\x20Wave.\x20Dropped\x20by\x20Snail.\x20Rotates\x20passive\x20mobs.",
    "Buffed\x20Hyper\x20droprates\x20slightly.",
    "WP4dWPa7qCklWPtcLq",
    "*Spider\x20Yoba\x20Lightsaber\x20ignition\x20time:\x202s\x20→\x205s",
    "*Look\x20in\x20Absorb\x20menu\x20to\x20find\x20Gamble\x20button.",
    "Does\x20damage\x20based\x20on\x20enemy\x27s\x20health\x20percentage.\x20Damage\x20is\x20max\x20when\x20mob\x20has\x20health>75%.",
    "Shrinker\x20now\x20affects\x20size\x2050x\x20more\x20in\x20Waveroom.",
    ".reload-timer",
    "#af6656",
    "Increased\x20map\x20size\x20by\x2030%.",
    "Soldier\x20Ant_6",
    "hsl(110,100%,50%)",
    "Soil",
    "Wig",
    "*Pollen\x20damage:\x2015\x20→\x2020",
    ".lottery-timer",
    "*Fixed\x20mobs\x20spawning\x20out\x20of\x20world/zone.",
    "spawnOnDie",
    "toLowerCase",
    "iPing",
    "#bb771e",
    "fixed_name_size",
    "#000",
    "19th\x20January\x202024",
    "show_bg_grid",
    "<svg\x20fill=\x22#ffffff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x20-64\x20640\x20640\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22><path\x20d=\x22M96\x20224c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm448\x200c35.3\x200\x2064-28.7\x2064-64s-28.7-64-64-64-64\x2028.7-64\x2064\x2028.7\x2064\x2064\x2064zm32\x2032h-64c-17.6\x200-33.5\x207.1-45.1\x2018.6\x2040.3\x2022.1\x2068.9\x2062\x2075.1\x20109.4h66c17.7\x200\x2032-14.3\x2032-32v-32c0-35.3-28.7-64-64-64zm-256\x200c61.9\x200\x20112-50.1\x20112-112S381.9\x2032\x20320\x2032\x20208\x2082.1\x20208\x20144s50.1\x20112\x20112\x20112zm76.8\x2032h-8.3c-20.8\x2010-43.9\x2016-68.5\x2016s-47.6-6-68.5-16h-8.3C179.6\x20288\x20128\x20339.6\x20128\x20403.2V432c0\x2026.5\x2021.5\x2048\x2048\x2048h288c26.5\x200\x2048-21.5\x2048-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5\x20263.1\x20145.6\x20256\x20128\x20256H64c-35.3\x200-64\x2028.7-64\x2064v32c0\x2017.7\x2014.3\x2032\x2032\x2032h65.9c6.3-47.4\x2034.9-87.3\x2075.2-109.4z\x22/></svg>",
    "Fixed\x20sometimes\x20client\x20crashing\x20out\x20while\x20being\x20in\x20wave\x20lobby.",
    "W6RcRmo0WR/cQSo1W4PifG",
    "<div\x20class=\x22msg-footer\x22\x20stroke=\x22Are\x20you\x20sure\x20you\x20want\x20to\x20continue?\x22></div>",
    "Slightly\x20increased\x20waveroom\x20drops.",
    "cloneNode",
    "wave",
    "Mythic+\x20crafting\x20result\x20is\x20now\x20broadcasted\x20in\x20chat.",
    "New\x20mob:\x20Turtle",
    "Snail",
    "*Super:\x20180",
    "1st\x20February\x202024",
    "removeT",
    "children",
    "*Arrow\x20health:\x20250\x20→\x20400",
    "extraRange",
    "All\x20Hyper\x20mobs\x20now\x20have\x200.002%\x20chance\x20of\x20dropping\x20a\x20Super\x20petal.",
    "Ghost_2",
    "substr",
    "log",
    "Increases\x20flower\x27s\x20health\x20power.",
    "#634418",
    "count",
    "*20%\x20chance\x20of\x20deleting\x20it.",
    "Soldier\x20Ant_3",
    "discord_data",
    "Fixed\x20multi\x20count\x20petals\x20like\x20Stinger\x20&\x20Sand\x20spawning\x20out\x20of\x20air\x20instead\x20of\x20the\x20flower.",
    "Petals",
    "petal",
    "\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22Your\x20petal\x20damage\x20has\x20been\x20increased\x20by\x205%\x20till\x20you\x20are\x20on\x20this\x20server.\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20class=\x22msg-footer\x22\x20stroke=\x22Do\x20you\x20also\x20want\x20to\x20claim\x20your\x20free\x20Square\x20skin?\x20Your\x20flower\x20will\x20be\x20turned\x20into\x20a\x20box.\x22></div>\x0a\x09\x09\x09\x09",
    "Shrinker",
    "Nerfed\x20Skull\x20weight\x20by\x20roughly\x2090%.",
    "drawIcon",
    "btn",
    "retardDuration",
    "\x22></div>\x0a\x09\x09\x09</div>",
    "particle_heart_",
    "static\x20basic\x20scorp\x20hornet\x20sandstorm\x20shell",
    "startPreRoll",
    "petalMushroom",
    "and\x20a",
    "W6HBdwO0",
    "sin",
    "dontResolveCol",
    "ontouchstart",
    "├─\x20",
    ".rewards-btn",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x203\x20to\x20chat.",
    "red",
    "Makes\x20you\x20poisonous.",
    "petalDrop_",
    "#82b11e",
    "soldierAntFire",
    "#e94034",
    "\x20at\x20least!",
    "Top-left\x20avatar\x20now\x20also\x20shows\x20username.",
    "*Leaf\x20damage:\x2013\x20→\x2012",
    "Another\x20plant\x20that\x20is\x20termed\x20as\x20a\x20mob\x20gg",
    "New\x20mob:\x20Ghost.\x20Fast\x20but\x20low\x20damage.\x20Does\x20not\x20drop\x20anything.\x20Can\x20move\x20through\x20objects.",
    "└─\x20",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20stroke=\x22Rules:\x22\x20style=\x22color:",
    "*Stand\x20over\x20a\x20Portal\x20to\x20enter\x20a\x20Waveroom.",
    "Ghost_3",
    "#bebe2a",
    "destroyed",
    "unnamed",
    "Buffed\x20pet\x20Rock\x20health\x20by\x2025%.",
    "#a2dd26",
    "mushroom",
    "projDamage",
    "New\x20petal:\x20Fire.\x20Dropped\x20by\x20Dragon.",
    "imageSmoothingEnabled",
    "petDamageFactor",
    "removeChild",
    "*If\x20server\x20is\x20possibly\x20experiencing\x20lags,\x20server\x20goes\x20in\x2010s\x20cooldown\x20period\x20&\x20lightnings\x20are\x20auto\x20disabled\x20for\x20some\x20time.",
    "Gives\x20you\x20mild\x20constant\x20boost\x20like\x20a\x20jetpack.",
    "Wave\x20now\x20ends\x20if\x20the\x20players\x20who\x20were\x20inside\x20the\x20zone\x20when\x20waves\x20started,\x20die.\x20Players\x20who\x20enter\x20the\x20waves\x20later\x20on\x20can\x20not\x20keep\x20the\x20waves\x20going\x20on.",
    "24th\x20July\x202023",
    "*Grapes\x20reload:\x203s\x20→\x202s",
    "#fdda40",
    "lightningBounces",
    "\x22></span>\x20",
    "onmousemove",
    "30dFIlwD",
    "Added\x20Mythic\x20spawn.\x20Needs\x20level\x20200.",
    "*Stinger\x20reload:\x207.5s\x20→\x207s",
    "\x22></span>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22",
    "*If\x20your\x20level\x20is\x20lower\x20than\x20100\x20and\x20you\x20hit\x20any\x20wave\x20mob\x20anywhere,\x20you\x20are\x20teleported\x20immediately.",
    "Legendary",
    "lieOnGroundTime",
    "stopWhileMoving",
    "rgba(0,0,0,0.35)",
    "*Rock\x20health:\x20150\x20→\x20200",
    "#406150",
    "complete",
    "https://www.youtube.com/@IAmLavaWater",
    "rotate(",
    "from",
    "petRoamFactor",
    "zvNu",
    "All\x20portals\x20at\x20bottom-right\x20corner\x20of\x20zones\x20now\x20have\x205\x20player\x20cap.\x20They\x20are\x20also\x20slightly\x20bigger.",
    "OFFIC",
    "*10%\x20chance\x20of\x20duplicating\x20it.",
    "cantPerformAction",
    "Super",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20reload-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Reload\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22reload-timer\x22></div>\x0a\x09</div>",
    "cmk+c0aoqSoLWQrQW6Tx",
    "\x5c$1",
    "d8k3BqDKF8o0WPu",
    "#2e933c",
    "Tweaked\x20level\x20needed\x20to\x20participate\x20in\x20waves:",
    "Server\x20side\x20performance\x20improvements.",
    "fire\x20ant",
    "adplayer",
    "isPoison",
    "Gives\x20you\x20telepathic\x20powers\x20that\x20makes\x20your\x20petals\x20orbit\x20far\x20from\x20the\x20flower.",
    "iGamble",
    "*Static\x20mobs\x20like\x20Cactus\x20do\x20not\x20spawn\x20during\x20waves.",
    "\x20Blue",
    "px)",
    ".lottery-users",
    "privacy.txt",
    "\x0a5th\x20May\x202024\x0aHeavy\x20now\x20slows\x20down\x20your\x20petal\x20orbit\x20speed.\x20More\x20slowness\x20for\x20higher\x20rarity.\x20\x0aCotton\x20doesn\x27t\x20expand\x20like\x20Rose\x20when\x20you\x20are\x20angry.\x0aPowder\x20now\x20adds\x20turbulence\x20to\x20your\x20petals\x20when\x20you\x20are\x20angry.\x0aFixed\x20more\x20player\x20dupe\x20bugs.\x0a",
    "avatar",
    "Salt\x20doesn\x27t\x20work\x20on\x20Hypers\x20now.",
    "VLa2",
    "22nd\x20June\x202023",
    "petalDrop",
    "#b5a24b",
    "Hornet",
    "[F]\x20Show\x20Hitbox:\x20",
    "*Number\x20of\x20mobs\x20in\x20Waveroom\x20depends\x20on\x20player\x20count.\x20But\x20to\x20make\x20it\x20not\x20too\x20easy\x20for\x20solo\x20players,\x20mob\x20count\x20is\x202x\x20for\x20solo\x20players.",
    "*Halo\x20pet\x20heal:\x209\x20→\x2010",
    "deltaY",
    "\x22></div>\x0a\x09\x09\x09<div\x20class=\x22build-petals\x22>\x0a\x09\x09\x09\x09\x0a\x09\x09\x09</div>\x0a\x09\x09\x09<div\x20class=\x22build-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-save-btn\x22><span\x20stroke=\x22Save\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20build-load-btn\x22><span\x20stroke=\x22Load\x22></span></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>",
    "Ghost",
    "petalSuspill",
    "hideUserCount",
    ";\x22\x20stroke=\x22",
    "#bc0000",
    "*Grapes\x20poison:\x2035\x20→\x2040",
    "Reduced\x20spawner\x20speed\x20in\x20waves:\x2011.5\x20→\x207",
    "length",
    "*Pacman\x20spawns\x201\x20ghost\x20on\x20hurt\x20and\x202\x20ghosts\x20on\x20death\x20now.",
    "*Grapes\x20poison:\x2015\x20→\x2020",
    "zert.pro",
    "https://www.youtube.com/@KePiKgamer",
    "Shield",
    ".play-btn",
    "#555555",
    "New\x20petal:\x20Pacman.\x20Spawns\x20pet\x20Ghosts\x20extremely\x20fast.\x20Dropped\x20by\x20Pacman.",
    "Fixed\x20zone\x20waves\x20lasting\x20till\x20wave\x2070\x20instead\x20of\x2050.",
    "New\x20petal:\x20Spider\x20Egg.\x20Spawns\x20pet\x20spiders.\x20Dropped\x20by\x20Spider\x20Cave.",
    "dispose",
    "Removed\x2030%\x20Lightning\x20damage\x20nerf\x20from\x20Waveroom.",
    "readAsText",
    "setUserCount",
    "How\x20did\x20it\x20come\x20here\x20and\x20why\x20did\x20his\x20foes\x20turn\x20into\x20his\x20allies?\x20Too\x20sus.",
    "fonts",
    "direct\x20copy\x20of\x20florr\x20bruh",
    "Hornet_6",
    "#8ac355",
    "Lobby\x20Closing...",
    "*Arrow\x20health:\x20450\x20→\x20500",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20few\x20seconds\x20when:",
    "Where\x20the\x20Dragons\x20finally\x20get\x20laid.",
    "inclu",
    "drawImage",
    "petSizeIncrease",
    "#cdbb48",
    "hide-zone-mobs",
    "makeFire",
    "*Rock\x20reload:\x202.5s\x20→\x205s",
    "Waves\x20can\x20randomly\x20start\x20anytime\x20now\x20even\x20if\x20kills\x20aren\x27t\x20fulfilled.",
    "useTime",
    "i\x20make\x20cool\x20videos",
    "Nerfed\x20Waveroom\x20final\x20loot.\x20You\x20get\x20upto\x2070%\x20chance\x20of\x20keeping\x20a\x20petal\x20if\x20you\x20collect:",
    "portalPoints",
    "sadT",
    "<div\x20class=\x22petal-count\x22\x20stroke=\x22",
    "petalAvacado",
    "22nd\x20July\x202023",
    "You\x20can\x20not\x20DMCA\x20mobs\x20with\x20health\x20lower\x20than\x2040%\x20now.",
    "tile_",
    "identifier",
    "e=\x22Yo",
    "Petaler\x20size\x20is\x20now\x20fixed\x20in\x20waves.",
    "Reduced\x20lottery\x20win\x20rate\x20cap:\x2085%\x20→\x2050%",
    "Increased\x20Pedox\x20health:\x20100\x20→\x20150",
    "onclick",
    "Nitro",
    "Regenerates\x20health\x20when\x20it\x20is\x20lower\x20than\x2050%",
    "Makes\x20you\x20the\x20commander\x20of\x20the\x20third\x20reich.",
    "New\x20useless\x20command:\x20/dlSprite.\x20Downalods\x20sprite\x20sheet\x20of\x20petal/mob\x20icons.",
    "honeyDmgF",
    "tail",
    "*52\x20Legendary\x20(1.35%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "#543d37",
    "Could\x20not\x20claim\x20secret\x20skin.",
    "Enter",
    "Increased\x20Hyper\x20wave\x20mob\x20count.",
    "running...",
    "Scorpion",
    "charCodeAt",
    "\x22></div><div\x20class=\x22log-content\x22>",
    "measureText",
    "New\x20mob:\x20Pacman.\x20Spawns\x20Ghosts.",
    "strok",
    "targetPlayer",
    "fillText",
    "ui_scale",
    "New\x20petal:\x20Pill.\x20Elongates\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Dropped\x20by\x20M28.",
    "translate(-50%,\x20",
    "Added\x20Waveroom:",
    "trim",
    "Bubble",
    "Soaks\x20damage\x20over\x20time.",
    "#cfcfcf",
    "Loading\x20video\x20ad...",
    "Tumbleweed",
    "\x20domain=.hornex.pro",
    "#323032",
    "ShiftRight",
    "[G]\x20Show\x20Grid:\x20",
    "#c9b46e",
    "makeBallAntenna",
    "querySelectorAll",
    "Beetle\x20Egg",
    "max",
    "Yourself",
    "execCommand",
    ".player-list\x20.dialog-content",
    "queen",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
    "#ffe763",
    "\x22\x20stroke=\x22Featured\x20Youtuber:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Subscribe\x20and\x20show\x20them\x20some\x20love\x20<3\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "release",
    "#39b54a",
    "textAlign",
    "damage",
    "pickupRange",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Import:\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22Enter\x20your\x20account\x20password\x20below\x20to\x20import\x20it.\x20Don\x27t\x20forget\x20to\x20export\x20your\x20current\x20account\x20before\x20importing\x20or\x20else\x20you\x20will\x20lose\x20your\x20current\x20account.\x22></div>\x0a\x09\x09\x09<br>\x0a\x09\x09\x09<div\x20stroke=\x22You\x20will\x20also\x20be\x20logged\x20out\x20of\x20Discord\x20if\x20you\x20are\x20logged\x20in.\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20placeholder=\x22Enter\x20password...\x22\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20submit-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Import\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "sameTypeColResolveOnly",
    "Wave\x20mobs\x20can\x20not\x20be\x20bred\x20now.",
    "spiderYoba",
    "lottery",
    "getRandomValues",
    "#634002",
    "We\x20now\x20record\x20petal\x20usage\x20data\x20for\x20balancing\x20petals.",
    "?v=",
    "Very\x20sussy\x20data!",
    "honeyDmg",
    "#cfc295",
    "*Arrow\x20health:\x20180\x20→\x20220",
    "transform",
    "#ebda8d",
    ".tabs",
    "x.pro",
    "Size\x20of\x20summoned\x20ants\x20is\x20now\x20based\x20on\x20size\x20of\x20the\x20Ant\x20Hole.",
    "healthF",
    "New\x20petal:\x20Gem.\x20Dropped\x20by\x20Gaurdian.\x20When\x20you\x20rage,\x20it\x20depletes\x20your\x20hp\x20and\x20creates\x20an\x20invisible\x20shield\x20which\x20enemies\x20can\x20not\x20cross.",
    "#b52d00",
    "#bb1a34",
    "\x22\x20stroke=\x22Not\x20allowed!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Can\x27t\x20perform\x20this\x20action\x20in\x20Waveroom.\x22>\x0a\x09</div>",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22We\x20are\x20ready\x20to\x20share\x20the\x20full\x20client-side\x20rendering\x20code\x20of\x20our\x20game\x20with\x20M28\x20if\x20they\x20wants\x20us\x20to\x20do\x20so.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22—\x20Zert\x22\x20style=\x22float:\x20right;\x22></div>\x0a\x09</div>",
    "projSpeed",
    "arc",
    "*For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.",
    "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key",
    "enable_min_scaling",
    "<div\x20class=\x22slot\x22></div>",
    "petalIris",
    "6th\x20November\x202023",
    "7th\x20August\x202023",
    "i\x20need\x20999\x20billion\x20subs",
    "Lightning\x20damage:\x2012\x20→\x208",
    "*Mobs\x20do\x20not\x20spawn\x20near\x20you\x20if\x20you\x20have\x20timer.",
    "*They\x20have\x201%\x20chance\x20of\x20spawning.",
    "New\x20profile\x20stat:\x20Max\x20Wave.",
    "dragon",
    ".clear-build-btn",
    "New\x20petal:\x20Halo.\x20Dropped\x20by\x20Guardian.\x20Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "murdered",
    "parse",
    "motionKind",
    ".logout-btn",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20",
    "New\x20petal:\x20Air.\x20Dropped\x20by\x20Ghost",
    "*Weaker\x20mobs\x20with\x20lower\x20droprates\x20summon\x20at\x20start.",
    "jellyfish",
    "W77cISkNWONdQa",
    "centipedeHeadPoison",
    "\x20online)",
    "Salt\x20only\x20reflects\x20damage\x20if\x20victim\x27s\x20health\x20is\x20more\x20than\x2015%\x20now.",
    "Soak\x20Duration",
    "#eeeeee",
    "DMCA-ing\x20Ant\x20Hole\x20does\x20not\x20release\x20ants\x20now.",
    "toFixed",
    "preventDefault",
    "rainbow-text",
    "marginBottom",
    "stickbugBody",
    "<style>\x0a\x09\x09",
    "\x22\x20style=\x22color:",
    "Reduced\x20Sword\x20damage:\x2020\x20→\x2016",
    "*Rock\x20health:\x2060\x20→\x20120",
    "petalFaster",
    "Spirit\x20of\x20a\x20sussy\x20astronaut\x20that\x20was\x20sucked\x20into\x20a\x20black\x20hole.\x20It\x20will\x20always\x20be\x20remembered.",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.hide-icons\x20.petal\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal.empty,\x20.petal.no-icon\x20{\x0a\x09\x09\x09background-image:\x20none\x20!important;\x0a\x09\x09}\x0a\x0a\x09\x09.petal-icon\x20{\x0a\x09\x09\x09position:\x20absolute;\x0a\x09\x09\x09width:\x20100%;\x0a\x09\x09\x09height:\x20100%;\x0a\x09\x09}\x0a\x09</style>",
    "bone_outline",
    "New\x20mob:\x20Snail.",
    "Dragon_1",
    "doShow",
    "#d0bb55",
    "petalAntidote",
    "UNOFF",
    "shadowBlur",
    "https://www.youtube.com/watch?v=5fhM-rUfgYo",
    ".chat",
    "petalGas",
    "mobsEl",
    "(total\x20",
    "innerHeight",
    "Removed\x20disclaimer\x20from\x20menu.",
    "Reduced\x20chat\x20censorship.\x20If\x20you\x20are\x20caught\x20spamming,\x20your\x20account\x20will\x20be\x20banned.",
    "*Wing\x20damage:\x2020\x20→\x2025",
    "14dafFDX",
    "portal",
    "*Pets\x20are\x20allowed\x20in\x20Waveroom.",
    "Turns\x20aggressive\x20mobs\x20into\x20passive\x20aggressive.\x20They\x20will\x20not\x20attack\x20you\x20unless\x20you\x20attack\x20them.\x20Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "Invalid\x20data.\x20Data\x20must\x20be\x20an\x20object.",
    "\x20rad/s",
    "isLightning",
    "1157250eLMzAN",
    "localId",
    "onmousedown",
    "*Cotton\x20health:\x2010\x20→\x2012",
    "Crab\x20redesign.",
    "Shoots\x20away\x20when\x20your\x20flower\x20goes\x20>:(",
    "*Nitro\x20base\x20boost:\x200.13\x20→\x200.10",
    "reason:\x20",
    "Nerfed\x20Common,\x20Unsual\x20&\x20Rare\x20Gem.",
    "\x22></div>\x0a\x09\x09\x09\x09<div\x20class=\x22reload\x22\x20stroke=\x22↻\x22></div>\x0a\x09\x09\x09</div>",
    "bg-rainbow",
    "*Banana\x20damage:\x201\x20→\x202",
    "Kicked!\x20(reason:\x20",
    "displayData",
    "#ccad00",
    "Honey\x20Range",
    "isArray",
    "nigersaurus",
    "*Coffee\x20reload:\x203.5s\x20→\x202s",
    "#dbab2e",
    "*Lightsaber\x20ignition\x20time:\x202s\x20→\x201.5s",
    "centipedeBodyDesert",
    "4th\x20July\x202023",
    "labelSuffix",
    ".changelog",
    "petalNitro",
    "New\x20petal:\x20Cement.\x20Dropped\x20by\x20Statue.\x20Its\x20damage\x20is\x20based\x20on\x20enemy\x27s\x20health\x20percentage.",
    "<div\x20class=\x22banned\x22>\x0a\x09\x09\x09<span\x20stroke=\x22BANNED!\x22></span>\x0a\x09\x09</div>",
    "wss://eu1.hornex.pro",
    ";\x0a\x09\x09\x09-moz-background-size:\x20",
    ".scores",
    "Slightly\x20increased\x20Waveroom\x20final\x20loot.",
    "hasGem",
    "7th\x20February\x202024",
    "Fixed\x20seemingly\x20invisible\x20walls\x20appearing\x20in\x20game\x20after\x20shrinking\x20a\x20large\x20mob.",
    "strokeRect",
    "\x22></span></div>",
    "Rock_2",
    "s...)",
    "17th\x20June\x202023",
    "#A8A7A4",
    "projAffectHealDur",
    "KeyV",
    "uiCountGap",
    "scorp",
    "d\x20abs",
    "Yoba_2",
    "\x22>\x0a\x09\x09<span\x20stroke=\x22",
    "Fixed\x20Avacado\x20rotation\x20being\x20wrong\x20in\x20waveroom.",
    "petalLightsaber",
    "rgba(0,\x200,\x200,\x200.15)",
    "crafted",
    "Fixed\x20mobs\x20kissing\x20eachother\x20at\x20border.\x20Big\x20mobs\x20can\x20now\x20go\x2025%\x20into\x20each\x20other.",
    "[ERROR]\x20Failed\x20to\x20parse\x20json.",
    "Cactus",
    "Luxurious\x20mansion\x20of\x20ants.",
    "dandelion",
    "\x22></div>",
    "Rock_1",
    "***",
    "useTimeTiers",
    "12th\x20November\x202023",
    "bqpdUNe",
    "Worker\x20Ant",
    "#38c75f",
    "petalSponge",
    "none",
    "</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20stats\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Stats\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22dialog\x20mob-gallery\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22Mob\x20Gallery\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09\x09\x09",
    "WAVE",
    "clientWidth",
    "21st\x20July\x202023",
    "isSleeping",
    "Newly\x20spawned\x20mobs\x20can\x20not\x20hurt\x20anyone\x20for\x202s\x20now.",
    "els",
    "breedRange",
    "Honey",
    "toDataURL",
    "parts",
    "rgba(0,0,0,0.2",
    ".hyper-buy",
    "#d3c66d",
    "reloadT",
    "Square\x20skin\x20can\x20now\x20be\x20taken\x20into\x20the\x20Waveroom.",
    "ArrowRight",
    "*Yoba\x20Egg\x20buff.",
    ".debug-info",
    "strokeText",
    "Fixed\x20Rice.",
    "Honey\x20Damage",
    "discord\x20err:",
    "Fixed\x20mobs\x20spawning\x20and\x20instantly\x20despawning\x20around\x20sleeping\x20players\x20in\x20Zonewaves.",
    ".sad-btn",
    "nig",
    "append",
    "Spider_5",
    "Nerfs:",
    "host",
    "*Sand\x20reload:\x201.25s\x20→\x201.4s",
    "#bb3bc2",
    "25th\x20August\x202023",
    "click",
    ".discord-avatar",
    "color",
    "*Swastika\x20reload:\x202s\x20→\x202.5s",
    "#b28b29",
    "l\x20you",
    "#a44343",
    "4596400erxidb",
    ".username-input",
    "closePath",
    "20th\x20January\x202024",
    "fixedSize",
    "Nerfed\x20Ant\x20Holes:",
    "usernameClaimed",
    "Spidey\x20legs\x20that\x20increase\x20movement\x20speed.",
    "path",
    "Server-side\x20optimizations.",
    "uiY",
    "lightningDmg",
    "petalMissile",
    "craft-disable",
    "*Stinger\x20reload:\x207s\x20→\x2010s",
    ".petal.empty",
    "reduce",
    "encod",
    "login\x20iAngle\x20iMood\x20iJoinGame\x20iSwapPetal\x20iSwapPetalRow\x20iDepositPetal\x20iWithdrawPetal\x20iReqGambleList\x20iGamble\x20iAbsorb\x20iLeaveGame\x20iPing\x20iChat\x20iCraft\x20iReqAccountData\x20iClaimUsername\x20iReqUserProfile\x20iReqGlb\x20iCheckKey\x20iWatchAd",
    "padStart",
    "\x0a4th\x20May\x202024\x0aFixed\x20a\x20player\x20dupe\x20bug.\x20\x0aBalances:\x0a*Taco\x20healing:\x209\x20→\x2010\x0a*Sunflower\x20shield:\x201\x20→\x202.5\x0a*Shell\x20shield:\x208\x20→\x2012\x0a*Buffed\x20Yoba\x20Egg\x20by\x2050%\x0a",
    "petalAntEgg",
    "Missile\x20Poison",
    "8th\x20July\x202023",
    "petHealF",
    "*Reduced\x20Ghost\x20damage:\x200.6\x20→\x200.1.",
    "isDead",
    "admin_pass",
    "Locks\x20to\x20a\x20target\x20and\x20randomly\x20through\x20it\x20while\x20slowly\x20damaging\x20it.\x20Big\x20health,\x20low\x20damage.",
    "petalEgg",
    "Buffed\x20Gem.",
    "Leaf",
    ".minimap-cross",
    "WR7cQCkf",
    ".super-buy",
    "Rare",
    "#ffd941",
    "green",
    "\x22></div>\x0a\x09\x09",
    "nt\x20an",
    "starfish",
    "toggle",
    "*Opening\x20user\x20profiles\x20with\x20a\x20lot\x20of\x20petals",
    "New\x20mob:\x20Nigersaurus.",
    "Increased\x20shiny\x20mob\x20size.",
    ".\x22></span></div>",
    "Added\x20video\x20ad.",
    "28th\x20August\x202023",
    "show_scoreboard",
    "wn\x20ri",
    "You\x20can\x20now\x20join\x20Waverooms\x20upto\x20wave\x2080\x20(if\x20they\x20are\x20not\x20full.)",
    "petalYinYang",
    "Added\x20Global\x20Leaderboard.",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20Shiny\x20mobs.",
    "#cb37bf",
    "mobile",
    "Centipede",
    "Score\x20is\x20now\x20given\x20based\x20on\x20the\x20damage\x20casted.",
    "*Pincer\x20slow\x20duration:\x201.5s\x20→\x202.5s",
    "Pets\x20now\x20have\x202x\x20health\x20in\x20Waveroom.",
    "unset",
    ".id-group",
    "includes",
    "petal_",
    "Beehive\x20now\x20drops\x20Hornet\x20Egg.",
    "#ffd363",
    "Mother\x20Hornet\x20accidentally\x20fired\x20her\x20egg\x20instead\x20of\x20her\x20missile\x20and\x20we\x20caught\x20it.\x20GG.",
    "Minor\x20physics\x20change.",
    "Fixed\x20game\x20random\x20lag\x20spikes\x20on\x20mobile\x20devices.",
    "It\x20burns.",
    "It\x20has\x20sussy\x20movement.",
    "petSizeChangeFactor",
    "flower",
    "31st\x20July\x202023",
    "Banned\x20users\x20now\x20have\x20banned\x20label\x20on\x20their\x20profile.",
    "Re-added\x20Ultra\x20wave.\x20Needs\x203000\x20kills\x20to\x20start.",
    "Increased\x20minimum\x20kills\x20needed\x20to\x20win\x20wave:\x2010\x20→\x2050",
    "Removed\x20Petals\x20Destroyed\x20leaderboard.",
    ":\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22",
    "#ab7544",
    "projPoisonDamage",
    "OFF",
    "hostname",
    "<svg\x20version=\x221.1\x22\x20id=\x22Uploaded\x20to\x20svgrepo.com\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20style=\x22font-size:\x200.9em\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20d=\x22M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\x0a\x09c0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z\x20M29,12c0-3.756-2.961-6.812-6.675-6.984\x0a\x09C21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\x22/>\x0a</svg>",
    "#76ad45",
    "iWithdrawPetal",
    "wss://hornex-",
    "hsla(0,0%,100%,0.4)",
    "clearRect",
    "*Cotton\x20health:\x208\x20→\x209",
    "#b05a3c",
    "https://www.youtube.com/watch?v=AvD4vf54yaM",
    "*Pincer\x20damage:\x205\x20→\x206",
    "*If\x20more\x20than\x206\x20players\x20are\x20too\x20close\x20to\x20eachother,\x20some\x20of\x20them\x20get\x20teleported\x20around\x20the\x20zone\x20based\x20on\x20the\x20time\x20they\x20were\x20alive.\x20Too\x20many\x20players\x20closeby\x20causes\x20the\x20server\x20to\x20lag.",
    "Only\x20player\x20who\x20deals\x20the\x20most\x20damage\x20gets\x20the\x20killer\x20mob\x20in\x20their\x20mob\x20gallery\x20now.",
    ".absorb-clear-btn",
    "Sussy\x20waves\x20that\x20rotate\x20passive\x20mobs.",
    "petalDandelion",
    "Poop\x20Health",
    "Fixed\x20same\x20account\x20being\x20able\x20to\x20login\x20on\x20the\x20same\x20server\x20multiple\x20times\x20(to\x20patch\x20another\x20craft\x20exploit).",
    "<div\x20class=\x22warning\x22>\x0a\x09\x09<div>\x0a\x09\x09\x09<div\x20class=\x22warning-title\x22\x20stroke=\x22",
    "4th\x20August\x202023",
    "saved_builds",
    "\x0a<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20version=\x221.1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M17.891\x209.805h-3.79c0\x200-6.17\x204.831-6.17\x2012.108s6.486\x207.347\x206.486\x207.347\x201.688\x200.125\x203.125\x200c0\x200.062\x206.525-0.865\x206.525-7.353\x200.001-6.486-6.176-12.102-6.176-12.102zM14.101\x209.33h3.797v-1.424h-3.797v1.424zM17.84\x207.432l1.928-4.747c0\x200-1.217\x201.009-1.928\x201.009-0.713\x200-1.84-0.979-1.84-0.979s-1.216\x200.979-1.928\x200.979-1.869-0.949-1.869-0.949l1.958\x204.688h3.679z\x22></path>\x0a</svg>",
    "Press\x20G\x20to\x20toggle\x20grid.",
    "#8ac255",
    "petalYobaEgg",
    "petalPea",
    "outdatedVersion",
    "r\x20acc",
    "Guardian\x20does\x20not\x20spawn\x20when\x20Baby\x20Ant\x20is\x20killed\x20now.",
    "135249DkEsVO",
    "legD",
    "#3f1803",
    "*Increased\x20player\x20cap:\x2015\x20→\x2025",
    "/hqdefault.jpg)",
    "#444444",
    "href",
    "#d6b936",
    "#d43a47",
    "New\x20petal:\x20Sponge",
    "antennae",
    ".menu",
    ".stats-btn",
    "\x20won\x20and\x20got\x20extra",
    "Chromosome",
    "Goofy\x20little\x20wanderer.",
    "slowDuration",
    ".insta-btn",
    "%\x20success\x20rate",
    "NHkBqi",
    "redHealth",
    "Lottery\x20now\x20also\x20shows\x20petal\x20rarity\x20count.",
    "beehive",
    ".absorb",
    "<div\x20class=\x22build\x22>\x0a\x09\x09\x09<div\x20stroke=\x22Build\x20#",
    "petalBasic",
    "Flower\x20#",
    ".absorb-btn",
    "\x20clie",
    "\x22>\x0a\x09\x09\x09<div\x20class=\x22bar\x22></div>\x0a\x09\x09\x09<span\x20stroke=\x22Kills\x20Needed\x22></span>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22zone-mobs\x22></div>\x0a\x09</div>",
    "Added\x20some\x20info\x20about\x20Waverooms\x20in\x20death\x20screen\x20cos\x20some\x20people\x20were\x20getting\x20confused\x20about\x20drops\x20&\x20were\x20too\x20lazy\x20to\x20read\x20changelog.",
    "spikePath",
    "A\x20borderline\x20simp\x20of\x20Queen\x20Ant.",
    "#a07f53",
    "US\x20#2",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22Export:\x22></div>\x0a\x09\x09\x09<div\x20class=\x22msg-warning\x22\x20stroke=\x22DO\x20NOT\x20SHARE!\x22></div>\x20\x0a\x09\x09\x09<div\x20stroke=\x22Below\x20is\x20your\x20account\x20password.\x20It\x20shouldn\x27t\x20be\x20shared\x20with\x20anyone.\x20Anyone\x20with\x20access\x20to\x20it\x20has\x20access\x20to\x20your\x20account\x20and\x20all\x20your\x20petals.\x20They\x20can\x20absorb\x20or\x20gamble\x20all\x20your\x20petals.\x20You\x20have\x20been\x20warned!\x22></div>\x0a\x0a\x09\x09\x09<div\x20class=\x22export-row\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22password\x22\x20class=\x22textbox\x22\x20readonly\x20tabindex=\x22-1\x22>\x0a\x09\x09\x09\x09<input\x20type=\x22checkbox\x22\x20class=\x22checkbox\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20green\x20copy-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Copy\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20orange\x20download-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Download\x20TXT\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20style=\x22color:",
    "You\x20have\x20been\x20muted\x20for\x2060s\x20for\x20spamming.",
    "iCraft",
    "qCkBW5pcR8kD",
    "oncontextmenu",
    "1Jge",
    "month",
    "*Due\x20to\x20waves\x20being\x20unbalanced\x20and\x20melting\x20our\x20servers,\x20we\x20have\x20temporarily\x20removed\x20waves\x20from\x20the\x20game.\x20It\x20might\x20come\x20back\x20again\x20when\x20it\x20is\x20balanced\x20enough.",
    "hornet",
    "1st\x20April\x202024",
    "ears",
    "snail",
    "match",
    "ignore\x20if\x20u\x20already\x20subbed",
    "deadT",
    "Reflects\x20back\x20some\x20of\x20the\x20damage\x20received.",
    "absorbDamage",
    "Account\x20imported!",
    "acker",
    "hide-icons",
    "rgba(0,0,0,",
    "Hovering\x20over\x20mob\x20icons\x20in\x20zone\x20overview\x20now\x20shows\x20their\x20stats.",
    "Newly\x20spawned\x20mobs\x20do\x20not\x20hurt\x20anyone\x20for\x201s\x20now.",
    "A\x20normie\x20slave\x20among\x20the\x20ants.\x20A\x20disgrace\x20to\x20their\x20race.",
    "onStart",
    "petalSalt",
    "accountId",
    "New\x20petal:\x20Dice.\x20When\x20you\x20hit\x20a\x20petal\x20drop\x20with\x20it,\x20it\x20has:",
    ".my-player",
    "Pollen",
    "scrollTop",
    "12th\x20July\x202023",
    "Added\x20Build\x20Saver.\x20Use\x20the\x20UI\x20or\x20use\x20these\x20shortcuts:",
    "*Peas\x20damage:\x2010\x20→\x2012",
    "marginLeft",
    "#fc5c5c",
    "glbData",
    "add",
    "Ears\x20now\x20give\x20you\x20telepathic\x20powers.",
    "petalTaco",
    "Account\x20import/export\x20UI\x20redesigned.",
    "undefined",
    ".tier-",
    "<div>\x0a\x09\x09<span\x20style=\x22margin-right:2px;color:",
    "blur(10px)",
    "onMove",
    "wss://us1.hornex.pro",
    "petalBubble",
    "Press\x20L\x20to\x20toggle\x20debug\x20info.",
    "#333333",
    "KePiKgamer",
    "\x20XP",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key",
    "extraSpeedTemp",
    "petals!",
    "bolder\x2025px\x20",
    "Your\x20level\x20is\x20too\x20low\x20to\x20play\x20waves.\x20Leave\x20this\x20zone\x20or\x20you\x20will\x20be\x20teleported.",
    "*Cotton\x20reload:\x201.5s\x20→\x201s",
    "charAt",
    "Using\x20Salt\x20with\x20Sponge\x20now\x20decreases\x20damage\x20reflection\x20by\x2080%",
    "clientHeight",
    "*Banana\x20count\x20now\x20increases\x20with\x20rarity.\x20Super:\x204,\x20Hyper:\x206.",
    "unsuccessful",
    "\x22></div>\x0a\x09\x09\x09<div\x20stroke=\x22",
    "Fonts\x20loaded!",
    "27th\x20February\x202024",
    "#f7904b",
    "mouse2",
    "Getting\x20",
    "WRzmW4bPaa",
    "replace",
    "rgba(0,0,0,0.15)",
    "projD",
    "Spider\x20Yoba",
    "Mob\x20Agro\x20Range",
    "wing",
    "n\x20an\x20",
    "<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20fill=\x22#ffffff\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20d=\x22M4.62127\x204.51493C4.80316\x203.78737\x204.8941\x203.42359\x205.16536\x203.21179C5.43663\x203\x205.8116\x203\x206.56155\x203H17.4384C18.1884\x203\x2018.5634\x203\x2018.8346\x203.21179C19.1059\x203.42359\x2019.1968\x203.78737\x2019.3787\x204.51493L20.5823\x209.32938C20.6792\x209.71675\x2020.7276\x209.91044\x2020.7169\x2010.0678C20.6892\x2010.4757\x2020.416\x2010.8257\x2020.0269\x2010.9515C19.8769\x2011\x2019.6726\x2011\x2019.2641\x2011C18.7309\x2011\x2018.4644\x2011\x2018.2405\x2010.9478C17.6133\x2010.8017\x2017.0948\x2010.3625\x2016.8475\x209.76782C16.7593\x209.55555\x2016.7164\x209.29856\x2016.6308\x208.78457C16.6068\x208.64076\x2016.5948\x208.56886\x2016.5812\x208.54994C16.5413\x208.49439\x2016.4587\x208.49439\x2016.4188\x208.54994C16.4052\x208.56886\x2016.3932\x208.64076\x2016.3692\x208.78457L16.2877\x209.27381C16.2791\x209.32568\x2016.2747\x209.35161\x2016.2704\x209.37433C16.0939\x2010.3005\x2015.2946\x2010.9777\x2014.352\x2010.9995C14.3289\x2011\x2014.3026\x2011\x2014.25\x2011C14.1974\x2011\x2014.1711\x2011\x2014.148\x2010.9995C13.2054\x2010.9777\x2012.4061\x2010.3005\x2012.2296\x209.37433C12.2253\x209.35161\x2012.2209\x209.32568\x2012.2123\x209.27381L12.1308\x208.78457C12.1068\x208.64076\x2012.0948\x208.56886\x2012.0812\x208.54994C12.0413\x208.49439\x2011.9587\x208.49439\x2011.9188\x208.54994C11.9052\x208.56886\x2011.8932\x208.64076\x2011.8692\x208.78457L11.7877\x209.27381C11.7791\x209.32568\x2011.7747\x209.35161\x2011.7704\x209.37433C11.5939\x2010.3005\x2010.7946\x2010.9777\x209.85199\x2010.9995C9.82887\x2011\x209.80258\x2011\x209.75\x2011C9.69742\x2011\x209.67113\x2011\x209.64801\x2010.9995C8.70541\x2010.9777\x207.90606\x2010.3005\x207.7296\x209.37433C7.72527\x209.35161\x207.72095\x209.32568\x207.7123\x209.27381L7.63076\x208.78457C7.60679\x208.64076\x207.59481\x208.56886\x207.58122\x208.54994C7.54132\x208.49439\x207.45868\x208.49439\x207.41878\x208.54994C7.40519\x208.56886\x207.39321\x208.64076\x207.36924\x208.78457C7.28357\x209.29856\x207.24074\x209.55555\x207.15249\x209.76782C6.90524\x2010.3625\x206.38675\x2010.8017\x205.75951\x2010.9478C5.53563\x2011\x205.26905\x2011\x204.73591\x2011C4.32737\x2011\x204.12309\x2011\x203.97306\x2010.9515C3.58403\x2010.8257\x203.31078\x2010.4757\x203.28307\x2010.0678C3.27239\x209.91044\x203.32081\x209.71675\x203.41765\x209.32938L4.62127\x204.51493Z\x22/>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M5.01747\x2012.5002C5\x2012.9211\x205\x2013.4152\x205\x2014V20C5\x2020.9428\x205\x2021.4142\x205.29289\x2021.7071C5.58579\x2022\x206.05719\x2022\x207\x2022H10V18C10\x2017.4477\x2010.4477\x2017\x2011\x2017H13C13.5523\x2017\x2014\x2017.4477\x2014\x2018V22H17C17.9428\x2022\x2018.4142\x2022\x2018.7071\x2021.7071C19\x2021.4142\x2019\x2020.9428\x2019\x2020V14C19\x2013.4152\x2019\x2012.9211\x2018.9825\x2012.5002C18.6177\x2012.4993\x2018.2446\x2012.4889\x2017.9002\x2012.4087C17.3808\x2012.2877\x2016.904\x2012.0519\x2016.5\x2011.7267C15.9159\x2012.1969\x2015.1803\x2012.4807\x2014.3867\x2012.499C14.3456\x2012.5\x2014.3022\x2012.5\x2014.2609\x2012.5H14.2608L14.25\x2012.5L14.2392\x2012.5H14.2391C14.1978\x2012.5\x2014.1544\x2012.5\x2014.1133\x2012.499C13.3197\x2012.4807\x2012.5841\x2012.1969\x2012\x2011.7267C11.4159\x2012.1969\x2010.6803\x2012.4807\x209.88668\x2012.499C9.84555\x2012.5\x209.80225\x2012.5\x209.76086\x2012.5H9.76077L9.75\x2012.5L9.73923\x2012.5H9.73914C9.69775\x2012.5\x209.65445\x2012.5\x209.61332\x2012.499C8.8197\x2012.4807\x208.08409\x2012.1969\x207.5\x2011.7267C7.09596\x2012.0519\x206.6192\x2012.2877\x206.09984\x2012.4087C5.75542\x2012.4889\x205.38227\x2012.4993\x205.01747\x2012.5002Z\x22/>\x0a</svg>",
    "wss://",
    ")\x20!important;\x0a\x09\x09\x09background-size:\x20",
    "leaders",
    "mouse0",
    "getBoundingClientRect",
    "719574lHbJUW",
    "rgba(0,0,0,0.4)",
    "*Grapes\x20poison:\x20\x2020\x20→\x2025",
    "killsNeeded",
    "[data-icon]",
    "*Lightning\x20damage:\x2015\x20→\x2018",
    "none\x20killsNeeded\x20wave\x20waveEnding\x20waveStarting\x20lobbyClosing",
    "userAgent",
    "Duration",
    "#4343a4",
    "nProg",
    "projType",
    "*Gas\x20health:\x20140\x20→\x20250",
    "duration",
    "https://www.youtube.com/watch?v=yNDgWdvuIHs",
    "</div>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x20small\x22>",
    "KICKED!",
    "stayIdle",
    ".builds-btn",
    "projDamageF",
    "\x0a\x09\x09<div\x20stroke=\x22Gambling\x20will\x20put\x20your\x20petals\x20in\x20lottery.\x20This\x20is\x20very\x20risky\x20and\x20you\x20can\x20very\x20well\x20lose\x20your\x20petals.\x20A\x20random\x20winner\x20is\x20selected\x20from\x20lottery\x20every\x203h\x20and\x20gets\x20all\x20petals\x20polled\x20in\x20lottery.\x20Win\x20rate\x20is\x20more\x20if\x20you\x20gamble\x20higher\x20rarity\x20petals.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Players\x20like\x20fleepoint,\x20CricketCai\x20&\x20Hani\x20have\x20lost\x20their\x20entire\x20inventory\x20by\x20going\x20all\x20in.\x20Be\x20careful\x20and\x20don\x27t\x20be\x20greedy.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22Win\x20rate\x20is\x20also\x20capped\x20to\x2025%\x20to\x20prevent\x20domination.\x20If\x20you\x20already\x20have\x20win\x20rate\x20closer\x20to\x20that,\x20gambling\x20more\x20petals\x20won\x27t\x20affect\x20your\x20win\x20rate.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22You\x20can\x20only\x20win\x20petals\x20of\x20rarity\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.\x20For\x20example,\x20if\x20you\x20gamble\x20a\x20common\x20&\x20an\x20ultra,\x20you\x20will\x20be\x20allowed\x20to\x20win\x20upto\x20super\x20petals.\x22></div>\x0a\x09",
    "values",
    "consumeProjHealth",
    "New\x20petal:\x20Mushroom.\x20Makes\x20you\x20poisonous.\x20Effect\x20stacks.",
    "target",
    "value",
    "Added\x20Lottery.",
    "Gas",
    "Ghost_5",
    "Comes\x20to\x20avenge\x20mobs.",
    "12OVuKwi",
    "buffer",
    ".mob-gallery",
    "*Missile\x20damage:\x2035\x20→\x2040",
    "#e05748",
    "#695118",
    "Added\x20maze\x20in\x20Waveroom:",
    "year",
    "Nerfed\x20Spider\x20Yoba.",
    "*Reduced\x20zone\x20kick\x20time:\x20120s\x20→\x2060s.",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+3)\x20span\x20{color:",
    "splice",
    "WP4hW755jCokWRdcKchdT3ui",
    "Mobs\x20only\x20go\x20inside\x20eachother\x2035%\x20if\x20they\x20are\x20chasing\x20something\x20&\x20touching\x20the\x20walls.",
    "barEl",
    ".continue-btn",
    "W5bKgSkSW78",
    "Desert\x20Centipede",
    "petalLightning",
    "iScore",
    "#b53229",
    "projHealth",
    "Lightsaber",
    "<div\x20class=\x22petal\x20petal-drop\x20tier-",
    ".copy-btn",
    "roundRect",
    "as_ffa2",
    "#c1ab00",
    "descColor",
    "renderBelowEverything",
    "getUint16",
    "mobSizeChange",
    "u\x20sub\x20=\x20me\x20happy\x20:>",
    "s\x20can",
    "rgb(134,\x2031,\x20222)",
    "Fixed\x20Dandelion\x20not\x20affecting\x20mob\x20healing.",
    ".claim-btn",
    "twirl",
    ".settings",
    "isRetard",
    "Fixed\x20zooming\x20not\x20working\x20on\x20Firefox.",
    "Fixed\x20another\x20craft\x20exploit.",
    "*Fire\x20health:\x2080\x20→\x20120",
    "Yoba_3",
    ".shop-overlay",
    "usernameTaken",
    "Fixed\x20game\x20freezing\x20for\x201s\x20while\x20opening\x20a\x20profile\x20with\x20many\x20petals.",
    "translate(-50%,",
    "Takes\x20down\x20a\x20mob.\x20Only\x20works\x20on\x20mobs\x20of\x20the\x20same\x20or\x20lower\x20tier.\x20Despawned\x20mobs\x20don\x27t\x20drop\x20any\x20petal.",
    "hurtT",
    "13th\x20February\x202024",
    "\x20play",
    "curve",
    "Why\x20does\x20it\x20look\x20like\x20a\x20beehive?",
    "hsl(110,100%,60%)",
    "Salt\x20now\x20works\x20on\x20Hyper\x20mobs.",
    "weight",
    "*Bone\x20armor:\x208\x20→\x209",
    "Sandstorm",
    "consumeProjHealthF",
    "*Iris\x20poison:\x2045\x20→\x2050",
    "Added\x202\x20US\x20lobbies.",
    "Fire\x20Damage",
    "#288842",
    "20th\x20June\x202023",
    "uiX",
    "shinyCol",
    "altKey",
    "scorpion",
    "WRGBrCo9W6y",
    "3rd\x20February\x202024",
    "webSizeTiers",
    "Petal\x20",
    "rgba(0,\x200,\x200,\x200.2)",
    "Starfish",
    "Sword",
    "*New\x20system\x20for\x20determining\x20wave\x20starters.",
    "activeElement",
    "></div>",
    "#9fab2d",
    "Flower\x20Damage",
    "Spider_3",
    "titleColor",
    "Crab",
    "petalSunflower",
    ".hide-chat-cb",
    ".leave-btn",
    "hsla(0,0%,100%,0.15)",
    "rgb(77,\x2082,\x20227)",
    "fillRect",
    "mousedown",
    "player\x20dice\x20petalDice\x20petalRockEgg\x20petalAvacado\x20avacado\x20pedox\x20fossil\x20dragonNest\x20rock\x20cactus\x20hornet\x20bee\x20spider\x20centipedeHead\x20centipedeBody\x20centipedeHeadPoison\x20centipedeBodyPoison\x20centipedeHeadDesert\x20centipedeBodyDesert\x20ladybug\x20babyAnt\x20workerAnt\x20soldierAnt\x20queenAnt\x20babyAntFire\x20workerAntFire\x20soldierAntFire\x20queenAntFire\x20antHole\x20antHoleFire\x20beetle\x20scorpion\x20yoba\x20jellyfish\x20bubble\x20darkLadybug\x20bush\x20sandstorm\x20mobPetaler\x20yellowLadybug\x20starfish\x20dandelion\x20shell\x20crab\x20spiderYoba\x20sponge\x20m28\x20guardian\x20dragon\x20snail\x20pacman\x20ghost\x20beehive\x20turtle\x20spiderCave\x20statue\x20tumbleweed\x20furry\x20nigersaurus\x20sunflower\x20stickbug\x20mushroom\x20petalBasic\x20petalRock\x20petalIris\x20petalMissile\x20petalRose\x20petalStinger\x20petalLightning\x20petalSoil\x20petalLight\x20petalCotton\x20petalMagnet\x20petalPea\x20petalBubble\x20petalYinYang\x20petalWeb\x20petalSalt\x20petalHeavy\x20petalFaster\x20petalPollen\x20petalWing\x20petalSwastika\x20petalCactus\x20petalLeaf\x20petalShrinker\x20petalExpander\x20petalSand\x20petalPowder\x20petalEgg\x20petalAntEgg\x20petalYobaEgg\x20petalStick\x20petalLightsaber\x20petalPoo\x20petalStarfish\x20petalDandelion\x20petalShell\x20petalRice\x20petalPincer\x20petalSponge\x20petalDmca\x20petalArrow\x20petalDragonEgg\x20petalFire\x20petalCoffee\x20petalBone\x20petalGas\x20petalSnail\x20petalWave\x20petalTaco\x20petalBanana\x20petalPacman\x20petalHoney\x20petalNitro\x20petalAntidote\x20petalSuspill\x20petalTurtle\x20petalCement\x20petalSpiderEgg\x20petalChromosome\x20petalSunflower\x20petalStickbug\x20petalMushroom\x20petalSkull\x20petalSword\x20web\x20lightning\x20petalDrop\x20honeyTile\x20portal",
    "dir",
    "Yoba_4",
    "doRemove",
    "Copied!",
    "Fixed\x20despawning\x20holes\x20spawning\x20ants.",
    "setUint8",
    "ENTERING!!",
    "mobDespawned",
    ".death-info",
    "rgba(0,0,0,0.3)",
    "20th\x20July\x202023",
    "getUint32",
    "#8d9acc",
    "Nerfed\x20Lightning\x20damage\x20in\x20Waveroom\x20by\x2030%.",
    "Fixed\x20mobs\x20like\x20Ant\x20Hole\x20rendering\x20below\x20Honey\x20tiles.",
    "Reduced\x20Pincer\x20slowness\x20duration\x20&\x20made\x20it\x20depend\x20on\x20petal\x20rarity.",
    "Mythic",
    "join",
    "ctx",
    "*Hyper\x20mobs\x20do\x20not\x20drop\x20Super\x20petals.",
    "lastResizeTime",
    "sort",
    "*Coffee\x20speed:\x20rarity\x20*\x204%\x20→\x20rarity\x20*\x205%",
    "resize",
    "Breed\x20Range",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20push\x20mobs\x20now.",
    "isAggressive",
    "#000000",
    "rectAscend",
    "Fire\x20Ant",
    "Nerfed\x20droprates\x20during\x20early\x20waves.",
    "User",
    "24th\x20January\x202024",
    "New\x20petal:\x20Banana.\x20A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.\x20Dropped\x20by\x20Bush.",
    "*Bone\x20armor:\x209\x20→\x2010",
    "Hnphe",
    "loggedIn",
    "23rd\x20January\x202024",
    "New\x20petal:\x20Starfish\x20&\x20Shell.",
    "(reloading...)",
    "Waves\x20do\x20not\x20auto\x20end\x20now\x20if\x20wave\x20number\x20is\x20lower\x20than\x203.",
    "petHeal",
    "*They\x20do\x20not\x20spawn\x20in\x20any\x20waves.",
    "Wing",
    "253906KWTZJW",
    "uiName",
    "hsl(60,60%,30%)",
    "You\x20can\x20now\x20chat\x20at\x20Level\x203.",
    "*Arrow\x20health:\x20400\x20→\x20450",
    "*Snail\x20health:\x2040\x20→\x2045",
    "hypot",
    "Wave\x20Kills,\x20Score\x20&\x20Time\x20Alive\x20does\x20not\x20reset\x20on\x20game\x20update\x20now.",
    "Sand",
    "plis\x20plis\x20sub\x202\x20me\x20%nick%\x20uwu",
    "petalsLeft",
    "#ab5705",
    "#368316",
    "New\x20mob:\x20Starfish\x20&\x20Shell",
    "uniqueIndex",
    "%/s",
    "></di",
    "now",
    "Hornet_1",
    "Antennae",
    "Removed\x20too\x20many\x20players\x20nearby\x20warning\x20from\x20Waveroom.",
    ".discord-user",
    "*Grapes\x20poison:\x2011\x20→\x2015",
    "setTargetEl",
    "startsWith",
    "connectionIdle",
    "*Pincer\x20slowness\x20duration:\x202.5s\x20→\x203s",
    "A\x20cutie\x20that\x20stings\x20too\x20hard.",
    "New\x20petal:\x20Honey.\x20Dropped\x20by\x20Beehive.\x20Summons\x20honeycomb\x20around\x20you.",
    ".shake-cb",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Length\x20should\x20be\x20between\x20",
    "dontExpand",
    "http",
    "changeLobby",
    "Former\x20student\x20of\x20Yoda.",
    "://ho",
    "WRRdT8kPWO7cMG",
    "69th\x20chromosome\x20that\x20turns\x20mobs\x20of\x20the\x20same\x20rarity\x20into\x20retards.",
    ".terms-btn",
    "*Reduced\x20move\x20away\x20timer:\x208s\x20→\x205s",
    "petalSnail",
    "Soldier\x20Ant_1",
    "10th\x20August\x202023",
    "bone",
    "4\x20yummy\x20poisonous\x20balls.",
    "crafted\x20nothing\x20from",
    "randomUUID",
    "Shell",
    "rad)",
    "1998256OxsvrH",
    "*Removed\x20player\x20limit\x20from\x20waves.",
    "#a2eb62",
    "15th\x20July\x202023",
    "keyAlreadyUsed",
    "Damage\x20Reflection",
    "10th\x20July\x202023",
    "Kills",
    "Fixed\x20game\x20not\x20loading\x20on\x20some\x20IOS\x20devices.",
    "*Wave\x20is\x20reset\x20if\x20all\x20players\x20are\x20killed\x20in\x20the\x20zone.",
    "Added\x20Instagram\x20link.\x20Follow\x20me\x20for\x20better\x20luck.",
    "*Reduced\x20mob\x20health\x20by\x2050%.",
    "4th\x20April\x202024",
    "EU\x20#1",
    "*Faster\x20rotation\x20speed:\x20-0.2\x20rad/s\x20for\x20all\x20rarities",
    ".lb",
    "24th\x20August\x202023",
    "Jellyfish",
    "#6265eb",
    "New\x20setting:\x20UI\x20Scale.",
    "weedSeed",
    "guardian",
    "New\x20petal:\x20Stickbug.\x20Makes\x20your\x20petal\x20orbit\x20dance.",
    "textBaseline",
    "shield",
    "Wave\x20changes:",
    "an\x20UN",
    "Pedox\x20now\x20spawns\x20Baby\x20Ant\x20when\x20it\x20dies.",
    "21st\x20January\x202024",
    "has\x20ended.",
    "hasAbsorbers",
    "Zert",
    "*11\x20Unusual\x20(6.36%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "Statue\x20of\x20RuinedLiberty.",
    "Grapes",
    "\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22",
    "#fff",
    "New\x20petal:\x20Dragon\x20Egg.\x20Spawns\x20a\x20pet\x20Dragon.",
    "New\x20mob:\x20Sponge",
    "hit.p",
    "Pincer\x20poison:\x2015\x20→\x2020",
    "isSpecialWave",
    "containerDialog",
    "#d9511f",
    "Petaler",
    "credits",
    ".absorb-petals",
    "\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22...\x22></span></div>",
    "Can\x27t\x20perform\x20that\x20action.",
    "Honey\x20factory.",
    "petalPoo",
    "Shield\x20Reuse\x20Cooldown",
    "#853636",
    "*Mobs\x20do\x20not\x20change\x20their\x20target\x20player\x20now.",
    "isSwastika",
    "day",
    "furry",
    "%zY4",
    "nHealth",
    "cEca",
    "\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22",
    "Stickbug",
    "\x0a\x09\x09\x09\x09<div\x20class=\x22overlay-title\x22\x20stroke=\x22INVALID\x20KEY!\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22The\x20key\x20you\x20entered\x20is\x20invalid.\x22></div>\x0a\x09\x09\x09\x09<div\x20stroke=\x22Maybe\x20try\x20buying\x20a\x20key\x20instead\x20of\x20trying\x20random\x20ones.\x22></div>\x0a\x09\x09\x09",
    "Sunflower",
    "Yoba_6",
    "15th\x20August\x202023",
    "Minor\x20changes\x20to\x20settings\x20UI.",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22",
    "armorF",
    "<span\x20stroke=\x22Proceed\x20with\x20caution.\x20Very\x20risky!\x22></span>",
    "poisonDamageF",
    "*70%\x20chance\x20of\x20doing\x20nothing.",
    "Patched\x20a\x20small\x20inspect\x20element\x20trick\x20that\x20gave\x20users\x20a\x20bigger\x20field\x20of\x20view.",
    "DMCA",
    ".ad-blocker",
    "shieldReload",
    ".petals",
    "cmd",
    "statue",
    "hide-chat",
    "byteLength",
    "ability",
    "}\x0a\x09\x09.rewards\x20.dialog-content\x20>\x20*:nth-child(4n+4)\x20span\x20{color:",
    "rgba(0,0,0,0.1)",
    "your\x20",
    "NikocadoAvacado\x27s\x20super\x20yummy\x20avacado.",
    "*34\x20Epic\x20(2.06%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    ".dc-group",
    "\x0a\x0a\x09\x09\x09",
    "petalMagnet",
    "\x27s\x20Profile",
    "petalDice",
    "*Cement\x20damage:\x2040\x20→\x2050",
    "rnex.",
    ".watch-ad",
    ".player-list-btn",
    "iLeaveGame",
    "WOdcGSo2oL8aWONdRSkAWRFdTtOi",
    "z8kgrX3dSq",
    "27th\x20July\x202023",
    ".ui-scale\x20select",
    "*You\x20now\x20only\x20win\x20upto\x20max\x20rarity\x20you\x20have\x20gambled\x20plus\x201.",
    "\x22\x20stroke=\x22",
    "alpha",
    "#eb4755",
    "#ffffff",
    "Checking\x20username\x20availability...",
    "*They\x20have\x2010x\x20drop\x20rates.",
    "A\x20healing\x20petal\x20with\x20the\x20mechanics\x20of\x20Arrow.",
    "Super\x20Pacman\x20now\x20spawns\x20Ultra\x20Ghosts.",
    "Rock",
    "cacheRendered",
    ".reload-btn",
    "accountNotFound",
    "7th\x20July\x202023",
    "Fast\x20reload\x20but\x20weaker\x20than\x20a\x20fetus.\x20Known\x20as\x20Chawal\x20in\x20Indian.",
    "Fixed\x20newly\x20spawned\x20mob\x27s\x20missile\x20hurting\x20players.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Every\x20asset\x20is\x20recreated\x20manually.\x20None\x20of\x20it\x20is\x20directly\x20taken\x20from\x20florr.\x20Not\x20a\x20single\x20line\x20of\x20code\x20is\x20stolen\x20from\x20florr\x27s\x20source\x20code.\x20In\x20fact,\x20florr\x27s\x20source\x20code\x20wasn\x27t\x20even\x20looked\x20once\x20during\x20the\x20entire\x20development\x20process.\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Prove\x20us\x20wrong,\x20and\x20we\x20shut\x20down\x20the\x20game\x20immediately.\x20But\x20if\x20you\x20fail,\x20you\x20have\x20to\x20give\x20us\x20your\x20first\x20child\x20to\x20immolate\x20it\x20to\x20the\x20devil\x20when\x20the\x20summer\x20solstice\x20has\x20a\x20full\x20moon.\x22></div>\x0a\x09\x09<div\x20stroke=\x22Special\x20privilege\x20for\x20M28:\x22\x20style=\x22color:",
    "Server\x20encountered\x20an\x20error\x20while\x20getting\x20the\x20response.",
    "\x22\x20stroke=\x22Featured\x20Video:\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Very\x20good\x20videos\x20that\x20you\x20should\x20definitely\x20watch!\x22></div>\x0a\x09\x09<div\x20stroke=\x22How\x20to\x20get\x20featured?\x22\x20style=\x22color:",
    "#5ef64f",
    "Increases\x20petal\x20spin\x20speed.",
    "*Rice\x20damage:\x204\x20→\x205",
    "kers\x20",
    "*Health:\x20100\x20→\x20120",
    "#709d45",
    "connect",
    ".connecting",
    "*Rare:\x2050\x20→\x2035",
    "flors",
    "kWicW5FdMW",
    "petalerDrop",
    "Poop\x20colored\x20Ladybug.",
    "touchmove",
    "Fixed\x20missiles\x20from\x20mobs\x20not\x20getting\x20hurt\x20by\x20petals.",
    "choked",
    "To\x20fix\x20crafting\x20exploit,\x20same\x20account\x20can\x20not\x20be\x20online\x20on\x20different\x20servers\x20now.",
    "M\x20128.975\x20219.082\x20C\x20109.777\x20227.556\x20115.272\x20259.447\x20122.792\x20271.202\x20C\x20122.792\x20271.202\x20133.393\x20288.869\x20160.778\x20297.703\x20C\x20188.163\x20306.537\x20333.922\x20316.254\x20348.94\x20298.586\x20C\x20363.958\x20280.918\x20365.856\x20273.601\x20348.055\x20271.201\x20C\x20330.254\x20268.801\x20245.518\x20268.115\x20235.866\x20255.3\x20C\x20226.214\x20242.485\x20208.18\x20200.322\x20128.975\x20219.082\x20Z",
    "WPJcKmoVc8o/",
    "statuePlayer",
    ".lottery-btn",
    "#6f5514",
    "catch",
    "sandstorm",
    "hpRegen",
    "keyClaimed",
    ".lottery-winner",
    "*Reduced\x20kills\x20needed\x20to\x20start\x20Hyper\x20wave:\x2020\x20→\x2015",
    "abeQW7FdIW",
    "defineProperty",
    "*Pincer\x20reload:\x202s\x20→\x201.5s",
    "onEnd",
    "Neowm",
    "atan2",
    "*All\x20mobs\x20are\x20aggressive\x20during\x20waves.",
    "*Increased\x20mob\x20health\x20&\x20damage.",
    "Third\x20Eye",
    "ondrop",
    "ArrowDown",
    "Common",
    "KeyA",
    "Reduced\x20Wave\x20duration.",
    ".credits",
    "worldH",
    "New\x20petal:\x20Avacado.\x20Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "Extra\x20Vision",
    "eu_ffa2",
    "Peas",
    "Removed\x20Pedox\x20glow\x20effect\x20as\x20it\x20was\x20making\x20the\x20client\x20laggy\x20for\x20some\x20users.",
    "*Heavy\x20health:\x20400\x20→\x20450",
    "Armor",
    "It\x20is\x20very\x20long\x20and\x20blue.",
    ".low-quality-cb",
    "petHealthFactor",
    "Removed\x20Waves.",
    "Ant\x20Fire",
    "#a760b1",
    "expand",
    "Created\x20changelog.",
    "they\x20copied\x20florr\x20code\x20omg!!",
    "showItemLabel",
    ".chat-input",
    "Ladybug",
    "Fixed\x20petals\x20like\x20Stinger\x20&\x20Wing\x20not\x20twirling\x20by\x20Snail.",
    "*Halo\x20pet\x20healing:\x2020\x20→\x2025",
    ".waveroom-info",
    "isTrusted",
    "petalSand",
    "#555",
    "\x20stroke=\x22",
    ":scope\x20>\x20.petal",
    "14th\x20July\x202023",
    "isSupporter",
    "Yoba_5",
    "stats",
    "total",
    "\x20no-icon\x22\x20",
    "hideAfterInactivity",
    "Fixed\x20Beehive\x20not\x20showing\x20damage\x20effect.",
    "\x22></div>\x0a\x09\x09\x09\x09\x09<div\x20stroke=\x22",
    "Hypers\x20now\x20have\x200.02%\x20chance\x20of\x20dropping\x20Super\x20petal.",
    ".textbox",
    "gridColumn",
    "Desert",
    "angry",
    "*Taco\x20poop\x20damage:\x2015\x20→\x2025",
    "Removed\x20Centipedes\x20from\x20waves.",
    "Added\x20banner\x20ads.",
    "executed",
    "<div\x20class=\x22petal-icon\x22\x20",
    "hide-all",
    "Passively\x20heals\x20your\x20pets\x20through\x20air.",
    "Soldier\x20Ant",
    "petalArrow",
    "*Salt\x20reflection\x20damage:\x20-20%\x20for\x20all\x20rarities",
    "Reduced\x20Spider\x20Legs\x20drop\x20rate\x20from\x20Spider.",
    "<svg\x20fill=\x22#000000\x22\x20style=\x22opacity:0.6\x22\x20version=\x221.1\x22\x20id=\x22Capa_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2049.554\x2049.554\x22\x0a\x09\x20xml:space=\x22preserve\x22>\x0a<g>\x0a\x09<g>\x0a\x09\x09<polygon\x20points=\x228.454,29.07\x200,20.614\x200.005,49.549\x2028.942,49.554\x2020.485,41.105\x2041.105,20.487\x2049.554,28.942\x2049.55,0.004\x20\x0a\x09\x09\x0920.612,0\x2029.065,8.454\x20\x09\x09\x22/>\x0a\x09</g>\x0a</g>\x0a</svg>",
    "error",
    "Petals\x20failed\x20in\x20crafting\x20now\x20get\x20in\x20Lottery.\x20But\x20this\x20will\x20NOT\x20increase\x20your\x20win\x20rate.",
    "Fire\x20Duration",
    "Rock_5",
    "rgb(31,\x20219,\x20222)",
    "2772301LQYLdH",
    "soakTime",
    "Pincer",
    "#cecfa3",
    "#bbbbbb",
    "#29f2e5",
    "*NOTE:\x20Waves\x20are\x20at\x20early\x20stage\x20and\x20subject\x20to\x20major\x20changes\x20in\x20the\x20future.",
    "Reduced\x20mobile\x20UI\x20scale\x20by\x20around\x2020%.",
    "clientX",
    "sortGroups",
    "ShiftLeft",
    "Waveroom\x20death\x20screen\x20now\x20shows\x20Max\x20Wave.",
    "Lightning",
    "rgb(255,\x20230,\x2093)",
    ".debug-cb",
    "<div\x20class=\x22tooltip\x22>\x0a\x09\x09<div\x20class=\x22tooltip-title\x22\x20stroke=\x22",
    "*Mushroom\x20flower\x20poison:\x2010\x20→\x2030",
    "backgroundColor",
    "Reduced\x20Sandstorm\x20chase\x20speed.",
    "Too\x20many\x20players\x20nearby.\x20Move\x20away\x20from\x20here\x20or\x20you\x20will\x20be\x20teleported\x20automatically.",
    "literally\x20ctrl+c\x20and\x20ctrl+v",
    "New\x20petal:\x20Wig.",
    "(81*",
    "Like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.",
    "deadPreDraw",
    "9iYdxUh",
    "*Rock\x20reload:\x203s\x20→\x202.5s",
    "#882200",
    "iWatchAd",
    "addEventListener",
    "\x20by",
    "application/json",
    "TC0B",
    "*Kills\x20needed\x20for\x20Hyper\x20wave:\x2015\x20→\x2050",
    "Ruined",
    "Username\x20can\x20not\x20contain\x20special\x20characters!",
    "Fixed\x20Expander\x20&\x20Shrinker\x20not\x20working\x20on\x20Missiles\x20and\x20making\x20them\x20disappear.",
    "copyright\x20striked",
    "Added\x20level\x20up\x20reward\x20table.",
    "New\x20mob:\x20Guardian.\x20Spawns\x20when\x20a\x20Baby\x20Ant\x20is\x20murdered.",
    "<svg\x20style=\x22transform:scale(0.9)\x22\x20version=\x221.0\x22\x20id=\x22Layer_1\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22\x20\x0a\x09\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2064\x2064\x22\x20enable-background=\x22new\x200\x200\x2064\x2064\x22\x20xml:space=\x22preserve\x22>\x0a<path\x20fill=\x22#ffffff\x22\x20d=\x22M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\x0a\x09c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\x0a\x09V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\x0a\x09\x20M8,16v-4h8v12C11.582,24,8,20.414,8,16z\x20M56,16c0,4.414-3.582,8-8,8V12h8V16z\x22/>\x0a</svg>",
    "hpAlpha",
    "[WARNING]\x20Unknown\x20meta\x20data\x20parameters:\x20",
    "Your\x20Profile",
    "spiderCave",
    "ffa\x20sandbox",
    "New\x20petal:\x20DMCA.\x20Dropped\x20by\x20M28.",
    "[censored]",
    "turtle",
    "dur",
    "gambleList",
    "Added\x20/profile\x20command.\x20Use\x20it\x20to\x20view\x20profile\x20of\x20an\x20user.",
    "assassinated",
    "baseSize",
    "Even\x20more\x20wave\x20changes:",
    "*Fire\x20damage:\x2015\x20→\x2020",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22stat-value\x22\x20stroke=\x220\x22></div>\x0a\x09</div>",
    "show_hitbox",
    "Dragon_3",
    "*Damage:\x204\x20→\x206",
    "Q2mA",
    "#69371d",
    "innerWidth",
    "Client-side\x20performance\x20improvements.",
    "pacman",
    "<div\x20class=\x22alert\x22>\x0a\x09\x09<div\x20class=\x22alert-title\x22\x20stroke=\x22",
    "flipDir",
    "26th\x20August\x202023",
    "\x20$1",
    "Added\x20Leave\x20Game\x20button.",
    "?dev",
    "4th\x20September\x202023",
    "Scorpion\x20redesign.",
    "ondragover",
    "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=",
    "width",
    "#5ab6ab",
    "innerHTML",
    "If\x20population\x20of\x20a\x20speices\x20in\x20a\x20zone\x20below\x20Legendary\x20remains\x20below\x204\x20for\x2030s,\x20it\x20is\x20replaced\x20by\x20a\x20new\x20species.",
    "*Hyper:\x20240",
    "Craft",
    "\x27s\x20profile...",
    "Added\x20some\x20extra\x20details\x20to\x20Jellyfish.",
    "Shell\x20petal\x20doesn\x27t\x20expand\x20now\x20like\x20Rose.",
    "Fixed\x20font\x20being\x20sus\x20on\x20petal\x20icons.",
    "iClaimUsername",
    "curePoisonF",
    "isConnected",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-subtitle\x22\x20stroke=\x22",
    ".player-count",
    "hide_chat",
    "erCas",
    "\x0a5th\x20April\x202024\x0aTo\x20fix\x20pet\x20laggers,\x20pets\x20below\x20Mythic\x20rarity\x20now\x20die\x20when\x20they\x20touch\x20wall.\x20Pet\x20Rock\x20of\x20any\x20rarity\x20also\x20dies\x20when\x20it\x20touches\x20wall.\x0aRemoved\x20Hyper\x20bottom\x20portal.\x0aBalances:\x0a*Mushroom\x20flower\x20poison:\x2030\x20→\x2060\x0a*Swastika\x20damage:\x2040\x20→\x2050\x0a*Swastika\x20health:\x2035\x20→\x2040\x0a*Halo\x20pet\x20healing:\x2025\x20→\x2040\x0a*Heavy\x20damage:\x2010\x20→\x2020\x0a*Cactus\x20damage:\x205\x20→\x2010\x0a*Rock\x20damage:\x2015\x20→\x2030\x0a*Soil\x20damage:\x2010\x20→\x2020\x0a*Soil\x20health:\x2010\x20→\x2020\x0a*Soil\x20reload:\x202.5s\x20→\x201.5s\x0a*Snail\x20reload:\x201s\x20→\x201.5s\x0a*Skull\x20health:\x20250\x20→\x20500\x0a*Stickbug\x20damage:\x2010\x20→\x2018\x0a*Turtle\x20health:\x20900\x20→\x201600\x0a*Stinger\x20damage:\x20140\x20→\x20160\x0a*Sunflower\x20damage:\x208\x20→\x2010\x0a*Sunflower\x20health:\x208\x20→\x2010\x0a*Leaf\x20damage:\x2012\x20→\x2010\x0a*Leaf\x20health:\x2012\x20→\x2010\x0a*Leaf\x20reload:\x201.2s\x20→\x201s\x0a",
    "#962921",
    "Air",
    ".absorb-btn\x20.tooltip\x20span",
    "DMCA\x20now\x20does\x20not\x20work\x20on\x20mobs\x20with\x20HP\x20over\x2075%.",
    "onresize",
    "user",
    "onopen",
    "{background-color:",
    "15807WcQReK",
    "Added\x20Clear\x20Build\x20button\x20build\x20saver.",
    "bush",
    ".key-input",
    "Beetle_4",
    "#724c2a",
    "MOVE\x20AWAY!!",
    "deg)\x20scale(",
    "Buffed\x20droprates\x20during\x20late\x20waves.",
    "prototype",
    "turtleF",
    "fake",
    "*Leaf\x20reload:\x201s\x20→\x201.2s",
    "babyAnt",
    ".lottery",
    "Added\x20key\x20binds\x20for\x20opening\x20inventory\x20and\x20shit.",
    "<div\x20class=\x22log-title\x22\x20stroke=\x22",
    ".censor-cb",
    "#38c125",
    "setTargetByEvent",
    ".petal",
    "Expander",
    "Pincer\x20reload:\x201s\x20→\x201.5s",
    "*Bone\x20reload:\x202.5s\x20→\x202s",
    "petalRose",
    "*Snail\x20damage:\x2010\x20→\x2015",
    "sk.",
    "#cfbb50",
    "#cccccc",
    "download",
    "oPlayerY",
    "fireDamage",
    "isIcon",
    "*Jellyfish\x20lightning\x20damage:\x207\x20→\x205",
    "translate(calc(",
    "Generates\x20a\x20shield\x20when\x20you\x20rage\x20that\x20enemies\x20can\x27t\x20enter\x20but\x20depletes\x20your\x20health\x20and\x20prevents\x20you\x20from\x20healing.\x20Shield\x20also\x20reflect\x20missiles.",
    "16th\x20July\x202023",
    "keyup",
    "Fixed\x20game\x20getting\x20stuck\x20for\x20a\x20while\x20when\x20you\x20exited\x20Waveroom\x20with\x20a\x20lot\x20of\x20final\x20loot.",
    "The\x20quicker\x20your\x20clicks\x20on\x20the\x20petals,\x20the\x20greater\x20the\x20number\x20of\x20petals\x20added\x20to\x20the\x20crafting/absorbing\x20board.\x20Useful\x20for\x20mobile\x20users\x20mostly.",
    "reflect",
    "LEAVE\x20ZONE!!",
    "petalTurtle",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22progress\x22\x20style=\x22--color:",
    "deleted",
    "isStatic",
    ".box",
    "top",
    "dontPushTeam",
    "#347918",
    "3336680ZmjFAG",
    "lineJoin",
    "rgba(0,0,0,0.2)",
    "Increased\x20UI\x20icons\x20resolution\x20cos\x20they\x20were\x20blurry\x20for\x20some\x20users.",
    "body",
    "We\x20are\x20trying\x20to\x20add\x20more\x20payment\x20methods\x20in\x20the\x20shop.\x20Ultra\x20keys\x20might\x20also\x20come\x20once\x20we\x20get\x20that\x20done.\x20Stay\x20tuned!",
    "Region:\x20",
    "It\x20is\x20very\x20long\x20and\x20fast.",
    "Craft\x20rate\x20change:",
    "Spider_2",
    ".clown-cb",
    "hasHalo",
    "eu_ffa",
    "*Heavy\x20health:\x20500\x20→\x20600",
    "Cement",
    "It\x20likes\x20to\x20dance.",
    "petalCactus",
    "Sandstorm_3",
    "<div><span\x20stroke=\x22#\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Nickname\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22IP\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Account\x20ID\x22></span></div>",
    "Breaths\x20fire.",
    "sortGroupItems",
    "WOpcHSkuCtriW7/dJG",
    "\x22></div>\x0a\x09\x09\x09\x09</div>",
    "rect",
    "*Banana\x20health:\x20170\x20→\x20400",
    ">\x0a\x09\x09\x09\x09\x09\x0a\x09\x09\x09\x09\x09<div\x20class=\x22drop-rate\x22\x20stroke=\x22",
    "*Hyper\x20mobs\x20can\x20drop\x20upto\x203\x20Ultra\x20petals.",
    "keyCheckFailed",
    "Only\x201\x20kind\x20of\x20tanky\x20mob\x20species\x20can\x20spawn\x20in\x20waves\x20now.",
    "workerAnt",
    "Pacman",
    "\x22></span>\x0a\x09\x09<div\x20class=\x22tooltip\x22><span\x20stroke=\x22Unlocks\x20at\x20Level\x20",
    "Stick",
    "clip",
    "*Starfish\x20healing:\x202.25/s\x20→\x202.5/s",
    "hide-scoreboard",
    "filter",
    "*Cotton\x20health:\x207\x20→\x208",
    "subscribe\x20for\x20999\x20super\x20petals",
    "Reduced\x20Antidote\x20health:\x20200\x20→\x2030",
    "#c76cd1",
    "exp",
    "You\x20can\x20now\x20spawn\x2010th\x20petal\x20with\x20Key\x200.",
    "#d54324",
    "3220DFvaar",
    "goofy\x20ahh\x20insect\x20robbery",
    "spinSpeed",
    "Continue",
    "lightblue",
    "metaData",
    "Poisonous\x20gas.",
    "Beetle_6",
    "score",
    "progressEl",
    "Increased\x20drop\x20rate\x20of\x20Lightsaber\x20by\x20Spider\x20Yoba.",
    "appendChild",
    "spider",
    "*They\x20give\x2010x\x20score.",
    "Rock_4",
    "Rock_3",
    "Passive\x20Heal",
    "#854608",
    "tagName",
    "*Fire\x20damage:\x209\x20→\x2015",
    "spawnOnHurt",
    "p41E",
    "\x0a13th\x20May\x202024\x0aFixed\x20a\x20bug\x20that\x20didn\x27t\x20let\x20flowers\x20enter\x20portals.\x0aBalances:\x0a*Sword\x20damage:\x2017\x20→\x2021\x0a*Yin\x20yang\x20damage:\x2010\x20→\x2020\x0a*Yin\x20yang\x20reload:\x202s\x20→\x201.5s\x0a",
    "addToInventory",
    "hide",
    "You\x20get\x20teleported\x20immediately\x20if\x20you\x20hit\x20any\x20wave\x20mob\x20while\x20being\x20low\x20level.",
    ".absorb-rarity-btns",
    "iAngle",
    "If\x208\x20mobs\x20are\x20already\x20chasing\x20you\x20in\x20waves,\x20more\x20mobs\x20do\x20not\x20spawn\x20around\x20you.",
    "textEl",
    "Buffed\x20Skull\x20weight\x20by\x2010-20x\x20for\x20higher\x20rarity\x20petals.",
    "#a52a2a",
    "Allows\x20you\x20to\x20breed\x20mobs.",
    "wig",
    "hpRegen75PerSecF",
    "OQM)",
    "<div\x20class=\x22chat-text\x22>",
    "Tiers",
    "affectMobHeal",
    "petalWing",
    "<div\x20class=\x22btn\x20tier-",
    ";\x20-o-background-position:",
    "projHealthF",
    "petalSpiderEgg",
    "#4e3f40",
    "\x22></span></div>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-content\x22></div>\x0a\x09\x09\x09</div>",
    "You\x20can\x20join\x20Waverooms\x20upto\x20wave\x2075\x20(if\x20it\x20is\x20not\x20full).",
    ".show-scoreboard-cb",
    "Fleepoint",
    "#4eae26",
    "#111",
    "#ebeb34",
    "font",
    "hsla(0,0%,100%,0.3)",
    ".clown",
    "Take\x20Down\x20Time",
    "Buffed\x20Lightsaber:",
    "Redesigned\x20some\x20mobs.",
    "*Only\x20for\x20Ultra,\x20Super\x20&\x20Hyper\x20zones.",
    "querySelector",
    "iSwapPetalRow",
    "Fixed\x20players\x20pushing\x20eachother.",
    "requestAnimationFrame",
    ".export-btn",
    "miter",
    "slayed",
    "*Despawned\x20mobs\x20are\x20not\x20counted\x20in\x20kills\x20now.",
    "#f22",
    "iReqGlb",
    "setAttribute",
    "typeStr",
    "*Increased\x20wave\x20duration.\x20Longer\x20for\x20higher\x20rarity\x20zones.",
    "Extremely\x20slow\x20sussy\x20mob.",
    ".inventory-btn",
    "petalStinger",
    ".tooltips",
    "Fixed\x20shield\x20showing\x20up\x20on\x20avatar\x20even\x20after\x20you\x20are\x20dead.",
    "Fixed\x20flowers\x20not\x20being\x20able\x20to\x20consume\x20while\x20having\x20nitro.\x20(We\x20care\x20about\x20flowers\x20appetite.)",
    "msgpack",
    ".max-wave",
    "strokeStyle",
    "Poop\x20Damage",
    "Summons\x20a\x20lightning\x20strike\x20on\x20nearby\x20enemies",
    "#1ea761",
    "Extremely\x20heavy\x20petal\x20that\x20can\x20push\x20mobs.",
    "*72\x20Mythic\x20(0.97%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "isRectHitbox",
    "*Lightsaber\x20damage:\x209\x20→\x2010",
    "#7d893e",
    "kicked",
    "https://ipapi.co/json/",
    "Basic",
    "Fixed\x20Sponge\x20petal\x20hurting\x20you\x20on\x20respawn.",
    "Nerfed\x20Honey\x20tile\x20damage\x20in\x20Waveroom\x20by\x2030%",
    "*Lightsaber\x20health:\x20120\x20→\x20200",
    "absorbPetalEl",
    "W7dcP8k2W7ZcLxtcHv0",
    ".changelog\x20.dialog-content",
    "*Halo\x20pet\x20heal:\x203\x20→\x207",
    "Master\x20female\x20ant\x20that\x20enslaves\x20other\x20ants.",
    "#4040fc",
    "isShiny",
    "Claiming\x20secret\x20skin...",
    "#c8a826",
    "*Hyper:\x20175+",
    "Watching\x20video\x20ad\x20now\x20increases\x20your\x20petal\x20damage\x20by\x205%",
    "writeText",
    ".craft-btn",
    ".server-area",
    "Alerts\x20are\x20shown\x20now\x20when\x20you\x20toggle\x20a\x20setting\x20using\x20shortcut.",
    "2nd\x20July\x202023",
    "rgb(166\x2056\x20237)",
    "getFloat32",
    "show_damage",
    "Light",
    "ontouchend",
    ".craft-rate",
    ".absorb\x20.dialog-header\x20span",
    "*Stinger\x20reload:\x2010s\x20→\x207.5s",
    "wasDrawn",
    "drawDragon",
    "*Heavy\x20health:\x20450\x20→\x20500",
    ".angry-btn",
    "16th\x20September\x202023",
    "#222222",
    "toLocaleString",
    "KeyX",
    "2-digit",
    "*Mob\x20health\x20&\x20damage\x20increases\x20more\x20over\x20the\x20waves\x20now.",
    "WP5YoSoxvq",
    "</div><div\x20class=\x22log-line\x22></div>",
    "adplayer-not-found",
    "hsla(0,0%,100%,0.1)",
    "\x20+\x20",
    "https://www.youtube.com/watch?v=nO5bxb-1T7Y",
    "Nearby\x20players\x20for\x20move\x20away\x20warning:\x204\x20→\x203",
    "*Snail\x20reload:\x202s\x20→\x201.5s",
    "Regenerates\x20health\x20when\x20consumed.",
    "Buffed\x20late\x20wave\x20mobs\x20&\x20their\x20drop\x20rate.",
    "hoq5",
    "Need\x20to\x20be\x20Lvl\x20",
    "*A\x20player\x20has\x20to\x20be\x20at\x20least\x20in\x20the\x20zone\x20for\x2060s\x20to\x20get\x20mob\x20attacks.",
    "pZWkWOJdLW",
    "XCN6",
    "joinedGame",
    "Fixed\x20Shop\x20key\x20validation\x20not\x20working.",
    "Yoba",
    "*Hyper:\x2015-25",
    "Makes\x20your\x20pets\x20fat\x20like\x20NikocadoAvacado.",
    "Added\x20Hyper\x20key\x20in\x20Shop.",
    "tooltipDown",
    "push",
    "Body",
    "ned.\x22",
    "isCentiBody",
    "Positional\x20arrow\x20is\x20now\x20shown\x20on\x20squad\x20member.",
    "cactus",
    ".mob-gallery\x20.dialog-content",
    "*Cotton\x20health:\x209\x20→\x2010",
    "Upto\x208\x20people\x20can\x20get\x20loot\x20from\x20Hypers\x20now.",
    "https://www.youtube.com/watch?v=XnXjiiqqON8",
    "*Final\x20loot\x20you\x20get\x20to\x20save\x20is\x20a\x20fraction\x20of\x20all\x20your\x20loot.\x20It\x20is\x20calculated\x20when\x20you\x20leave\x20Waveroom.",
    "scrollHeight",
    "despawnTime",
    "affectMobHealDur",
    "/weborama.js",
    "isLightsaber",
    "makeSponge",
    "#f55",
    "rgb(219\x20130\x2041)",
    "Copy\x20and\x20store\x20it\x20safely.\x0a\x0aDO\x20NOT\x20SHARE\x20WITH\x20ANYONE!\x20Anyone\x20with\x20access\x20to\x20this\x20code\x20will\x20have\x20access\x20to\x20your\x20account.\x0a\x0aPress\x20OK\x20to\x20download\x20code.",
    "next",
    "lient",
    "Fixed\x20players\x20spawning\x20in\x20the\x20wrong\x20zone\x20sometimes.",
    "https://www.instagram.com/zertalious",
    "worldW",
    "#dddddd",
    "<div\x20class=\x22petal-count\x22></div>",
    "Stinger",
    "rgb(126,\x20239,\x20109)",
    "#363685",
    "6th\x20September\x202023",
    "Ant\x20Egg",
    "Fixed\x20collisions\x20sometimes\x20not\x20registering.",
    "*Missile\x20damage:\x2050\x20→\x2055",
    "restore",
    "246086tZCBZD",
    "\x20in\x20view\x20/\x20",
    "12th\x20August\x202023",
    "Featured\x20in\x20Crab\x20Rave\x20by\x20Noisestorm.",
    "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key",
    "Shrinker\x20&\x20Expander\x20does\x20not\x20die\x20after\x20a\x20single\x20use\x20in\x20Waveroom\x20now.",
    "dontUiRotate",
    "Fixed\x20too\x20many\x20pets\x20spawning\x20from\x201\x20egg.",
    ".collected-petals",
    "https://www.youtube.com/@FussySucker",
    "#D2D1CD",
    "as_ffa1",
    "Sandbox",
    "KeyS",
    "%\x20!important",
    "fixAngle",
    "angleSpeed",
    "warn",
    "Fixed\x20another\x20bug\x20that\x20allowed\x20ghost\x20players\x20to\x20exist\x20in\x20Waveroom.",
    "position",
    "Video\x20AD\x20success!",
    "W5OTW6uDWPScW5eZ",
    "Increases",
    "Wave\x20mobs\x20can\x20now\x20drop\x20lower\x20tier\x20petals\x20too.",
    "An\x20illegally\x20smuggled\x20green\x20creature\x20from\x20Russia\x20that\x20is\x20very\x20fond\x20of\x20IO\x20games.",
    "Fixed\x20infinite\x20Gem\x20shield\x20glitch\x20caused\x20by\x20Shell.",
    "11th\x20July\x202023",
    "Failed\x20to\x20get\x20userCount!",
    "Breed\x20Strength",
    "petalSoil",
    "Elongates\x20conic/rectangular\x20petals\x20like\x20Lightsaber\x20&\x20Fire.\x20Also\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "data-icon",
    "#c69a2c",
    "isHudPetal",
    "wss://as2.hornex.pro",
    "readyState",
    "Pollen\x20&\x20Web\x20stop\x20falling\x20on\x20ground\x20if\x20the\x20server\x20is\x20experiencing\x20lag.",
    "Username\x20too\x20short!",
    "*If\x20you\x20attack\x20mobs\x20while\x20having\x20timer,\x201s\x20is\x20depleted.",
    "rotate",
    "WQpcUmojoSo6",
    "Added\x20/dlMob\x20and\x20/dlPetal\x20commands.\x20Use\x20them\x20to\x20download\x20icons\x20from\x20the\x20game\x20by\x20providing\x20a\x20name.",
    "hpRegen75PerSec",
    "*A\x20wave\x20starter\x20who\x20died\x20has\x20to\x20return\x20and\x20stay\x20in\x20the\x20zone\x20for\x20at\x20least\x2060s\x20to\x20keep\x20the\x20waves\x20running.",
    "Added\x20username\x20search\x20in\x20Global\x20Leaderboard.",
    "Dice",
    "petalPollen",
    "IAL\x20c",
    "putImageData",
    "continent_code",
    "killed",
    "uiScale",
    ".progress",
    "*Pincer\x20reload:\x201.5s\x20→\x201s",
    "*Warning\x20only\x20shows\x20during\x20waves.",
    "*Lightsaber\x20damage:\x207\x20→\x208",
    "\x0a\x09<svg\x20fill=\x22#fff\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x20256\x20256\x22\x20id=\x22Flat\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a\x09\x20\x20<path\x20d=\x22M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\x22/>\x0a\x09</svg>",
    ".helper-cb",
    "iAbsorb",
    "Increased\x20Wave\x20mob\x20count.",
    "Fixed\x20arabic\x20zalgo\x20chat\x20spam\x20caused\x20by\x20DMCA-ing\x20&\x20crafting.",
    "\x22></div>\x0a\x09\x09<div\x20class=\x22alert-info\x22\x20stroke=\x22",
    "yoba",
    "#735d5f",
    "WARNING!",
    ".active",
    ".grid",
    "mouse",
    "onmessage",
    "#79211b",
    "4oL8",
    "setValue",
    "onmouseleave",
    "sq8Ig3e",
    "userProfile",
    "Fixed\x20death\x20screen\x20avatar\x20with\x20wings\x20getting\x20clipped.",
    "Head",
    "#e0c85c",
    "NSlTg",
    "misReflectDmgFactor",
    "Falls\x20on\x20the\x20ground\x20for\x205s\x20when\x20you\x20aren\x27t\x20neutral.",
    "drawSnailShell",
    "Spider\x20Egg",
    "bolder\x20",
    "consumeProjDamage",
    "You\x20need\x20to\x20be\x20at\x20least\x20Level\x204\x20to\x20chat\x20now.",
    "petalLight",
    "*Hyper\x20petals\x20give\x201\x20trillion\x20XP.",
    "random",
    ")\x20rotate(",
    "*Heavy\x20health:\x20350\x20→\x20400",
    "sign",
    "Flower\x20Health",
    "Reduced\x20Super\x20craft\x20rate:\x201.5%\x20→\x201%",
    "bqpdSW",
    "*Halo\x20healing:\x208/s\x20→\x209/s",
    "*Increased\x20drop\x20rates.",
    "poisonDamage",
    "*Taco\x20poop\x20damage:\x208\x20→\x2010",
    "*Each\x20zone\x20has\x202\x20portals\x20at\x20top-left\x20&\x20bottom-right\x20corners.",
    "Connecting\x20to\x20",
    "\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "crab",
    "Ghost_1",
    ".keyboard-cb",
    "us_ffa1",
    "Temporary\x20Extra\x20Speed",
    "M28",
    "show",
    "*Reduced\x20drops\x20by\x2050%.",
    "*Reduced\x20Shield\x20regen\x20time.",
    "%;left:",
    "*Legendary:\x20125\x20→\x20100",
    "drops",
    "title",
    "e\x20bee",
    "sprite",
    "*Halo\x20pet\x20healing:\x2010\x20→\x2015",
    "Fixed\x20font\x20not\x20loading\x20on\x20menu\x20sometimes.",
    "*Honeycomb\x20damage:\x200.65\x20→\x200.33",
    "Ugly\x20&\x20stinky.",
    "Re-added\x20Waves.",
    "Player\x20with\x20most\x20kills\x20during\x20waves\x20get\x20extra\x20petals:",
    "\x20pxls)\x20/\x20",
    "show_grid",
    "gem",
    "show_population",
    "progress",
    "<div\x20class=\x22dialog\x20tier-",
    "<div>",
    "Spider\x20Cave",
    ".discord-btn",
    "KeyC",
    "uiAngle",
    "WRS8bSkQW4RcSLDU",
    "*Halo\x20pet\x20healing:\x2015\x20→\x2020",
    "Removed\x20Portals\x20from\x20Common\x20&\x20Unusual\x20zones.",
    "*Fire\x20health:\x2070\x20→\x2080",
    "Dandelion",
    "Reduced\x20mobile\x20UI\x20scale.",
    "You\x20can\x20not\x20hurt\x20newly\x20spawned\x20mobs\x20for\x202s\x20now.",
    "[WARNING]\x20Unknown\x20petals:\x20",
    "*Damage\x20needed\x20to\x20poop\x20ants:\x205%\x20→\x2015%",
    "poopPath",
    "can\x20s",
    "28th\x20December\x202023",
    "honeyRange",
    "visible",
    "Leaf\x20does\x20not\x20heal\x20pets\x20anymore.",
    "eu_ffa1",
    "*Opening\x20Inventory/Absorb\x20with\x20a\x20lot\x20of\x20petals",
    "0@x9",
    "beaten\x20to\x20death",
    ".dismiss-btn",
    "*Players\x20can\x20poll\x20their\x20petals.\x20Higher\x20rarity\x20petals\x20give\x20you\x20better\x20chance\x20of\x20winning.",
    "*During\x20cooldown,\x20if\x20a\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20all\x20petals\x20in\x20it\x20are\x20auto\x20killed\x20and\x20players\x20&\x20mobs\x20are\x20auto\x20teleported\x20around\x20the\x20zone.",
    "Hornet_2",
    "Bursts\x20too\x20quickly\x20(like\x20me)",
    ".ultra-buy",
    "New\x20mob:\x20Fossil.",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20needs\x20to\x20be\x20well-edited.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Video\x20should\x20have\x20a\x20good\x20thumbnail.\x22></div>\x0a\x09\x09<div\x20stroke=\x22-\x20Commentary\x20or\x20music\x20in\x20the\x20background.\x22></div>\x0a\x09</div>",
    "username",
    "<div\x20class=\x22inventory-rarities\x22></div>",
    "hasEars",
    "You\x20need\x20to\x20cast\x20at\x20least\x2010%\x20damage\x20to\x20get\x20loot\x20from\x20wave\x20mobs\x20now.",
    "Increased\x20level\x20needed\x20for\x20Super\x20wave:\x20150\x20→\x20175",
    "Heal\x20Affect\x20Duration",
    "stringify",
    "asdfadsf",
    "19th\x20July\x202023",
    "You\x20can\x20now\x20hide\x20chat\x20from\x20settings.",
    "*Very\x20early\x20stuff\x20so\x20maps\x20which\x20will\x20make\x20the\x20waves\x20too\x20hard\x20will\x20be\x20removed\x20in\x20the\x20future.",
    "Increased\x20Hyper\x20mobs\x20drop\x20rate.",
    "level",
    ".minimap-dot",
    "*Coffee\x20speed:\x205%\x20*\x20rarity\x20→\x206%\x20*\x20rarity",
    "📜\x20",
    "Spider_6",
    "Retardation\x20Duration",
    "Passively\x20regenerates\x20your\x20health.",
    "GsP9",
    "petalShrinker",
    "INPUT",
    "disabled",
    "oAngle",
    "*Final\x20wave:\x20250\x20→\x2030.",
    "*Super:\x205-15",
    "Your\x20name\x20in\x20Lottery\x20is\x20now\x20shown\x20goldish.",
    "waveEnding",
    "xgMol",
    "26th\x20September\x202023",
    "26th\x20January\x202024",
    "Avacado\x20affects\x20pet\x20ghost\x2050%\x20less\x20now.",
    "Sandstorm_4",
    "search",
    "oninput",
    "queenAntFire",
    "vFKOVD",
    "#924614",
    "Some\x20anti\x20lag\x20measures:",
    "#7d5b1f",
    "*Turtle\x20health\x20500\x20→\x20600",
    "dataTransfer",
    "petalRockEgg",
    "isStatue",
    "14th\x20August\x202023",
    "getAttribute",
    "uwu",
    ".gamble-prediction",
    "small\x20full",
    "Dragon\x20Egg",
    ".tooltip",
    "canRender",
    "isBooster",
    "released",
    "tals.",
    "*Arrow\x20damage:\x204\x20→\x205",
    "1px",
    "petalSwastika",
    "*Snail\x20reload:\x201.5s\x20→\x201s",
    "stickbug",
    "KeyF",
    "*Peas\x20damage:\x2020\x20→\x2025",
    "poisonT",
    "rgb(81\x20121\x20251)",
    "19th\x20June\x202023",
    "<span\x20stroke=\x22Unlocks\x20at\x20level\x20",
    "KeyD",
    "#e6a44d",
    "*Works\x20on\x20petal\x20drops\x20with\x20rarity\x20lower\x20or\x20same\x20as\x20your\x20Dice\x20petal.",
    "#b58500",
    "KeyL",
    "m28",
    "Passive\x20Shield",
    "\x20-\x20",
    "Fixed\x20chat\x20not\x20working\x20on\x20phone.",
    "*Press\x20L+NumberKey\x20to\x20load\x20a\x20build.",
    "#33a853",
    "*Missile\x20damage:\x2025\x20→\x2030",
    "getTransform",
    "Added\x20new\x20payment\x20methods\x20in\x20Shop!",
    "floor",
    "backgroundImage",
    "Hornet_3",
    "*Zone\x20leave\x20timer\x20is\x20only\x20reducted\x20on\x20hitting\x20mobs\x20if\x20time\x20left\x20is\x20more\x20than\x2010s.",
    "Flower\x20Poison",
    "*Rice\x20damage:\x205\x20→\x204",
    "updatePos",
    "),0)",
    "29th\x20January\x202024",
    "Hyper",
    "style=\x22background-position:\x20",
    "#fc9840",
    "User\x20not\x20found.",
    "send",
    "*Missile\x20reload:\x202.5s\x20+\x200.5s\x20→\x202s\x20+\x200.5s",
    "right",
    "uiHealth",
    "#4f412e",
    "Added\x20Ultra\x20keys\x20in\x20Shop.",
    ".main",
    "\x20at\x20y",
    "zmkhtdVdSq",
    "<div\x20class=\x22btn\x20off\x22\x20style=\x22background:",
    "Honey\x20now\x20disables\x20if\x20you\x20are\x20over\x20a\x20Portal.",
    "*Missile\x20reload:\x202s\x20+\x200.5s\x20→\x202.5s+\x200.5s",
    "pls\x20sub\x20to\x20me,\x20%nick%",
    "New\x20petal:\x20Nitro.\x20Gives\x20you\x20mild\x20constant\x20boost.\x20Dropped\x20by\x20Snail.",
    "Fixed\x20Sunflower\x20regenerating\x20shield\x20while\x20Gem\x20is\x20on.",
    "/s\x20if\x20H<50%",
    "=;\x20Path=/;\x20Expires=Thu,\x2001\x20Jan\x201970\x2000:00:01\x20GMT;",
    "WPPnavtdUq",
    "isPetal",
    "https://www.youtube.com/watch?v=8tbvq_gUC4Y",
    "Added\x20account\x20import/export\x20option\x20for\x20countries\x20where\x20Discord\x20is\x20blocked.",
    "Deals\x20heavy\x20damage\x20but\x20is\x20very\x20weak.",
    "d.\x20Pr",
    "slice",
    "lobbyClosing",
    "sad",
    "*Wing\x20reload:\x202s\x20→\x202.5s",
    "\x22></div>\x0a\x09\x09<div\x20stroke=\x22Simply\x20make\x20good\x20videos\x20on\x20the\x20game\x20and\x20let\x20us\x20know\x20about\x20you\x20in\x20our\x20Discord\x20server.\x22></div>\x0a\x09\x09<br>\x0a\x09\x09<div\x20stroke=\x22All\x20features:\x22\x20style=\x22color:",
    "find",
    "clipboard",
    "Loot\x20for\x20Legendary+\x20mobs\x20now\x20drop\x20even\x20if\x20they\x20are\x20not\x20in\x20your\x20view.",
    "\x22></span>\x0a\x09\x09\x09\x09</div>",
    "mobPetaler",
    "Invalid\x20account!",
    "25th\x20July\x202023",
    "nSkOW4GRtW",
    "#b0473b",
    "*Mob\x20count\x20now\x20depends\x20on\x20the\x20number\x20of\x20players\x20in\x20the\x20zone\x20now.",
    ".zone-mobs",
    "Ad\x20failed\x20to\x20load.\x20Try\x20again\x20later.\x20Disable\x20your\x20ad\x20blocker\x20if\x20you\x20have\x20any.\x0aMessage:\x20",
    "Added\x20Shiny\x20mobs:",
    ".expand-btn",
    "It\x20is\x20very\x20long\x20(like\x20my\x20pp).",
    "&#Uz",
    "26th\x20July\x202023",
    "...",
    "*Super:\x20150+",
    "\x20radians",
    "Fire",
    "WP/dQbddHH0",
    "Extra\x20Spin\x20Speed",
    "*Powder\x20damage:\x2015\x20→\x2020",
    "Reduces\x20enemy\x27s\x20ability\x20to\x20heal\x20by\x2020%.",
    "It\x20can\x20grow\x20its\x20arms\x20back.\x20Some\x20real\x20biology\x20going\x20on\x20there.",
    "rgb(237\x20236\x2061)",
    "isPet",
    "5th\x20September\x202023",
    "<svg\x20fill=\x22#000000\x22\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2032\x2032\x22\x20style=\x22fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\x22\x20version=\x221.1\x22\x20xml:space=\x22preserve\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20xmlns:serif=\x22http://www.serif.com/\x22\x20xmlns:xlink=\x22http://www.w3.org/1999/xlink\x22><path\x20d=\x22M29,10c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,18c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-18Zm-20,6c-0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,12c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-12Zm10,-12c0,-0.552\x20-0.448,-1\x20-1,-1l-4,0c-0.552,0\x20-1,0.448\x20-1,1l-0,24c0,0.552\x200.448,1\x201,1l4,0c0.552,0\x201,-0.448\x201,-1l-0,-24Z\x22/><g\x20id=\x22Icon\x22/></svg>",
    "Invalid\x20mob\x20name:\x20",
    "Increased\x20Mushroom\x20poison:\x207\x20→\x2010",
    "sqrt",
    "successful",
    "*Powder\x20health:\x2010\x20→\x2015",
    "iBreedTimer",
    "numAccounts",
    "#5b4d3c",
    "*There\x20is\x20a\x2030%\x20chance\x20of\x20the\x20next\x20map\x20not\x20being\x20maze.\x20Other\x2070%\x20is\x20distributed\x20among\x20the\x20maze\x20maps.",
    "ame",
    "Faster",
    "lighter",
    ".lottery\x20.dialog-content",
    ".killer",
    "breedTimer",
    "text/plain;charset=utf-8;",
    "*Unsual:\x2025\x20→\x2010",
    "rewards",
    "5th\x20August\x202023",
    "*Waves\x20start\x20once\x20a\x20certain\x20number\x20of\x20kills\x20are\x20reached\x20in\x20a\x20zone.",
    "*Scorpion\x20missile\x20poison\x20damage:\x2015\x20→\x207",
    "https://www.youtube.com/watch?v=Ls63jHIkA5A",
    "*Arrow\x20damage:\x203\x20→\x204",
    "Is\x20that\x20called\x20a\x20Sword\x20or\x20a\x20Super\x20Word?\x20Hmmmm",
    "span",
    "*All\x20mobs\x20during\x20special\x20waves\x20are\x20shiny.",
    "fontSize",
    "hsl(110,100%,10%)",
    "*Spider\x20Yoba\x20health:\x20150\x20→\x20100",
    "desc",
    ".nickname",
    "<center><span\x20stroke=\x22No\x20lottery\x20participants\x20yet.\x22></span><center>",
    "lastElementChild",
    "Imported\x20from\x20Dubai\x20just\x20for\x20you.",
    "Missile",
    "off",
    "*Opening\x20Lottery",
    ".username-area",
    "Heavier\x20than\x20your\x20mom.",
    "\x20You\x20",
    "*Credit/Debit\x20cards,\x20Google\x20Pay,\x20crypto\x20&\x20many\x20more\x20local\x20payment\x20methods.\x20Check\x20it\x20out!",
    "Looks\x20like\x20your\x20flower\x20is\x20going\x20to\x20sleep\x20and\x20off\x20to\x20a\x20mysterious\x20place.",
    "spotPath_",
    ".spawn-zones",
    "\x22></span>",
    "json",
    ".build-petals",
    "teal\x20",
    "Fixed\x20number\x20rounding\x20issue.",
    "Minimum\x20damage\x20needed\x20to\x20get\x20drops\x20from\x20wave\x20mobs:\x2010%\x20→\x2020%",
    "1167390UrVkfV",
    "dragonNest",
    "drawChats",
    "Fixed\x20Waveroom\x20sometimes\x20having\x20disconnected\x20ghost\x20player.",
    "height",
    "armor",
    "#ada25b",
    "nick",
    "Sandstorm_1",
    "Fixed\x20client\x20bugging\x20out\x20during\x20game\x20startup\x20sometimes.",
    "Wave\x20Ending...",
    "Nerfed\x20mob\x20health\x20in\x20waves\x20by\x208%",
    "Mob\x20",
    "85%\x20of\x20the\x20craft\x20fails\x20are\x20now\x20burned\x20instead\x20of\x20going\x20in\x20lottery.",
    "Cotton",
    "flowerPoisonF",
    "\x20from\x20",
    "contains",
    "#34f6ff",
    "WP3dRYddTJC",
    "dSkzW6qGWOGDW5GLemoMWOLSW4S",
    "arrested\x20for\x20plagerism",
    "*Taco\x20poop\x20damage:\x2010\x20→\x2012",
    "wss://us2.hornex.pro",
    "KeyU",
    "#ffe667",
    "col",
    "<div\x20class=\x22petal-container\x22></div>",
    "Preroll\x20state:\x20",
    ".total-accounts",
    "isPassiveAggressive",
    "canSkipRen",
    "xp\x20timePlayed\x20maxScore\x20totalKills\x20maxKills\x20maxTimeAlive",
    "tier",
    "n8oKoxnarXHzeIzdmW",
    "finally",
    "#ff94c9",
    "#c1a37d",
    "password",
    "STOP!",
    "hsl(60,60%,",
    "settings",
    "*Swastika\x20reload:\x203s\x20→\x202.5s",
    "Dragon_4",
    "(?:^|;\x5cs*)",
    "*Yoba\x20health:\x20500\x20→\x20350",
    "u\x20are",
    "Increased\x20mob\x20count\x20per\x20speices\x20of\x20Epic\x20&\x20Rare:\x205\x20→\x206",
    "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m",
    "affectHealDur",
    ".\x20Hac",
    "us_ffa2",
    "webSize",
    "Nigerian\x20Ladybug.",
    "Queen\x20Ant",
    "Twirls\x20your\x20petal\x20orbit\x20like\x20a\x20snail\x20shell\x20\x20looks\x20like.",
    "test",
    "\x0a\x09</div>",
    "stepPerSecMotion",
    "quadraticCurveTo",
    "canvas",
    "isTanky",
    "accountData",
    ".common",
    ";font-size:16px\x22></div>\x0a\x09\x09\x09",
    "web_",
    "\x20!important;}",
    "style=\x22color:",
    "*Swastika\x20health:\x2030\x20→\x2035",
    "low_quality",
    "result",
    "(auto\x20reloading\x20in\x20",
    "keyCode",
    "Poisons\x20the\x20enemy\x20that\x20touches\x20it.",
    "drawShell",
    "Nigersaurus",
    "toLow",
    "aip_complete",
    "lineTo",
    "iMood",
    "\x0a<svg\x20width=\x22800px\x22\x20height=\x22800px\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22>\x0a<path\x20fill-rule=\x22evenodd\x22\x20clip-rule=\x22evenodd\x22\x20d=\x22M12.7848\x200.449982C13.8239\x200.449982\x2014.7167\x201.16546\x2014.9122\x202.15495L14.9991\x202.59495C15.3408\x204.32442\x2017.1859\x205.35722\x2018.9016\x204.7794L19.3383\x204.63233C20.3199\x204.30175\x2021.4054\x204.69358\x2021.9249\x205.56605L22.7097\x206.88386C23.2293\x207.75636\x2023.0365\x208.86366\x2022.2504\x209.52253L21.9008\x209.81555C20.5267\x2010.9672\x2020.5267\x2013.0328\x2021.9008\x2014.1844L22.2504\x2014.4774C23.0365\x2015.1363\x2023.2293\x2016.2436\x2022.7097\x2017.1161L21.925\x2018.4339C21.4054\x2019.3064\x2020.3199\x2019.6982\x2019.3382\x2019.3676L18.9017\x2019.2205C17.1859\x2018.6426\x2015.3408\x2019.6754\x2014.9991\x2021.405L14.9122\x2021.845C14.7167\x2022.8345\x2013.8239\x2023.55\x2012.7848\x2023.55H11.2152C10.1761\x2023.55\x209.28331\x2022.8345\x209.08781\x2021.8451L9.00082\x2021.4048C8.65909\x2019.6754\x206.81395\x2018.6426\x205.09822\x2019.2205L4.66179\x2019.3675C3.68016\x2019.6982\x202.59465\x2019.3063\x202.07505\x2018.4338L1.2903\x2017.1161C0.770719\x2016.2436\x200.963446\x2015.1363\x201.74956\x2014.4774L2.09922\x2014.1844C3.47324\x2013.0327\x203.47324\x2010.9672\x202.09922\x209.8156L1.74956\x209.52254C0.963446\x208.86366\x200.77072\x207.75638\x201.2903\x206.8839L2.07508\x205.56608C2.59466\x204.69359\x203.68014\x204.30176\x204.66176\x204.63236L5.09831\x204.77939C6.81401\x205.35722\x208.65909\x204.32449\x209.00082\x202.59506L9.0878\x202.15487C9.28331\x201.16542\x2010.176\x200.449982\x2011.2152\x200.449982H12.7848ZM12\x2015.3C13.8225\x2015.3\x2015.3\x2013.8225\x2015.3\x2012C15.3\x2010.1774\x2013.8225\x208.69998\x2012\x208.69998C10.1774\x208.69998\x208.69997\x2010.1774\x208.69997\x2012C8.69997\x2013.8225\x2010.1774\x2015.3\x2012\x2015.3Z\x22/>\x0a</svg>",
    "u\x20hav",
    "shootLightning",
    "Increases\x20your\x20vision.",
    "15th\x20June\x202023",
    "invalidProtocol\x20tooManyConnections\x20outdatedVersion\x20connectionIdle\x20adminAction\x20loginFailed\x20ipBanned\x20accountBanned",
    "isFakeChat",
    "*Ultra:\x201-5",
    "deg)",
    "https://www.youtube.com/watch?v=aL7GQJt858E",
    "iChat",
    "purple",
    "\x22\x20stroke=\x22GET\x205%\x20MORE\x20DAMAGE!!\x22></div>\x0a\x09\x09<div\x20class=\x22tooltip-desc\x22\x20stroke=\x22Ads\x20help\x20us\x20keep\x20the\x20game\x20running\x20and\x20motivated\x20to\x20push\x20more\x20updates.\x20Watch\x20a\x20video\x20ad\x20to\x20support\x20us\x20and\x20get\x205%\x20more\x20petal\x20damage\x20as\x20a\x20reward!\x22></div>\x0a\x09\x09<div\x20style=\x22color:",
    "#75dd34",
    "Sussy\x20Discord\x20uwu",
    "New\x20mob:\x20Furry.",
    "fovFactor",
    "onclose",
    "Web\x20Radius",
    "Aggressive\x20mobs\x20now\x20despawn\x20if\x20they\x20are\x20too\x20far\x20their\x20zone.\x20Passive\x20mobs\x20like\x20Baby\x20Ant\x20get\x20teleported\x20back\x20to\x20their\x20zone.",
    "Mother\x20Spider\x20sold\x20her\x20eggs\x20to\x20us\x20for\x20a\x20makeup\x20kit\x20gg",
    "Username\x20is\x20already\x20taken.",
    "New\x20mob:\x20M28.",
    "EU\x20#2",
    "changelog",
    "switched",
    "display",
    "Ants\x20redesign.",
    "oiynC",
    "Pet\x20Size\x20Increase",
    ".stat-value",
    "blur",
    "*Taco\x20poop\x20damage:\x2012\x20→\x2015",
    "https://www.youtube.com/watch?v=J4dfnmixf98",
    "forEach",
    "sizeIncreaseF",
    "\x20was\x20",
    ";\x0a\x09\x09\x09-webkit-background-size:\x20",
    "*Rock\x20health:\x20120\x20→\x20150",
    "Blocking\x20ads\x20now\x20reduces\x20your\x20craft\x20success\x20rate\x20by\x2010%",
    "isBoomerang",
    "enable_shake",
    "flowerPoison",
    "petalDmca",
    "&response_type=code&scope=identify&state=",
    "attachPetal",
    "#ce76db",
    "fossil",
    ".shop",
    "*You\x20can\x20not\x20enter\x20a\x20Waveroom\x20after\x20it\x20has\x20reached\x20wave\x2035.",
    "*Bone\x20armor:\x204\x20→\x205",
    "successCount",
    "j[zf",
    "Comes\x20with\x20the\x20power\x20of\x20summoning\x20lightning.",
    "*Missile\x20damage:\x2040\x20→\x2050",
    "Pedox\x20only\x20has\x2030%\x20chance\x20of\x20spawning\x20Baby\x20Ant\x20now.",
    "opacity",
    "centipedeBodyPoison",
    "Reduced\x20time\x20you\x20have\x20to\x20wait\x20to\x20get\x20mob\x20attacks\x20in\x20wave:\x2030s\x20→\x2015s",
    "<div\x20stroke=\x22",
    "WR7dPdZdQXS",
    "onmouseup",
    "Orbit\x20Twirl",
    "rgb(222,\x2031,\x2031)",
    ".anti-spam-cb",
    "arraybuffer",
    "*Wave\x20mobs\x20now\x20chase\x20players\x20for\x20100x\x20longer\x20than\x20normal\x20mobs.",
    "https://www.youtube.com/watch?v=U9n1nRs9M3k",
    "Dragon_2",
    "*Every\x203\x20hours,\x20a\x20lucky\x20winner\x20is\x20selected\x20and\x20gets\x20all\x20the\x20polled\x20petals.",
    ";\x0a\x09\x09}\x0a\x0a\x09\x09.petal,\x20.petal-icon\x20{\x0a\x09\x09\x09background-image:\x20url(",
    "createObjectURL",
    "*Grapes\x20poison:\x2040\x20→\x2045",
    "Lvl\x20",
    "oPlayerX",
    "*Lightning\x20damage:\x2012\x20→\x2015",
    "close",
    "respawnTimeTiers",
    "Summons\x20spirits\x20of\x20sussy\x20astronauts.",
    "<div\x20class=\x22data-desc\x22\x20stroke=\x22",
    "iCheckKey",
    "DMCA-ed",
    "lightningBouncesTiers",
    "static",
    "pink",
    "Skull",
    "#ffd800",
    "url",
    "percent",
    "sunflower",
    "name",
    "Digit",
    "New\x20petal:\x20Antidote.\x20Cures\x20poison.\x20Dropped\x20by\x20Guardian.",
    "New\x20setting:\x20Show\x20Population.\x20Toggles\x20zone\x20population\x20visibility.",
    "User\x20not\x20found!",
    "countAngleOffset",
    "bubble",
    "darkLadybug",
    "\x22></div>\x0a\x09\x09\x09\x0a\x09\x09\x09",
    "\x0a\x09\x09<div><span\x20stroke=\x22Level\x20191\x20+\x2030n\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x22Same\x22></span></div>\x0a\x09\x09<div><span\x20stroke=\x2214\x20+\x201n\x22></span></div>",
    "updateTime",
    "val",
    "Added\x20another\x20AS\x20lobby.",
    ".settings-btn",
    "breedPower",
    "draw",
    "Waves\x20now\x20require\x20minimum\x20level:",
    "pro",
    "Guardian",
    "babyAntFire",
    "size",
    "beginPath",
    "orbitDance",
    "*Peas\x20damage:\x2015\x20→\x2020",
    "*Heavy\x20health:\x20150\x20→\x20200",
    "\x22></span></div>\x0a\x09</div>",
    "\x20accounts",
    "*Pincer\x20reload:\x202.5s\x20→\x202s",
    "Level\x20required\x20is\x20now\x20shown\x20in\x20zone\x20leave\x20warning.",
    "*Reduced\x20mob\x20count.",
    "bezierCurveTo",
    "#21c4b9",
    "Fixed\x20Centipedes\x20body\x20spawning\x20out\x20of\x20border\x20in\x20Waveroom.",
    ".collected-rarities",
    "#feffc9",
    "*Reduced\x20HP\x20depletion.",
    "yellow",
    "CCofC2RcTG",
    "s.\x20Yo",
    "Fixed\x20neutral\x20mobs\x20still\x20kissing\x20eachother\x20on\x20border.",
    "\x20stea",
    "KeyM",
    "#ff63eb",
    "ghost",
    ";-webkit-background-position:\x20",
    "*These\x20changes\x20don\x27t\x20apply\x20in\x20waverooms.",
    "#fcdd86",
    ".switch-btn",
    "%;\x22\x20stroke=\x22",
    "Congratulations!",
    "#a58368",
    "\x20and\x20",
    "#7777ff",
    "location",
    "\x22></div>\x20<div\x20style=\x22color:",
    "ArrowLeft",
    "15584076IAHWRs",
    "text",
    "Yellow\x20Ladybug",
    "nSize",
    "save",
    "*Crafted\x20petals\x20do\x20not\x20affect\x20the\x20final\x20loot\x20in\x20any\x20way.\x20You\x20can\x20craft\x20petals\x20&\x20use\x20them\x20in\x20the\x20Waveroom.",
    "#dc704b",
    "^F[@",
    "absorb",
    "Username\x20claimed!",
    "bolder\x2012px\x20",
    "keyInvalid",
    "isInventoryPetal",
    "New\x20mob:\x20Mushroom.",
    "createPattern",
    "Magnet",
    "curePoison",
    ".xp",
    "[2tB",
    "*Increased\x20mob\x20species:\x204\x20→\x205",
    "Dragon",
    "ll\x20yo",
    "ANKUAsHKW5LZmq",
    "sword",
    "Beetle",
    "Reflected\x20Missile\x20Damage",
    "centipedeHeadDesert",
    "rgb(222,111,44)",
    "consumeTime",
    "\x22\x20stroke=\x22You\x20also\x20get\x20a\x20funny\x20square\x20skin\x20as\x20reward!\x22></div>\x0a\x09</div>",
    "insertBefore",
    "shop",
    "*Sand\x20reload:\x201.5s\x20→\x201.25s",
    "1092680fJSxDK",
    "New\x20mob:\x20Tumbleweed.",
    "show_helper",
    ".flower-stats",
    "centipedeBody",
    "Son\x20of\x20Dwayne\x20\x27The\x20Rock\x27\x20Johnson.",
    "bruh",
    "<div\x20class=\x22petal-drop-row\x22></div>",
    "targetEl",
    "isPlayer",
    "oProg",
    "A\x20human\x20bone.\x20If\x20damage\x20received\x20is\x20lower\x20than\x20its\x20armor,\x20its\x20health\x20isn\x27t\x20affected.",
    "reverse",
    "abs",
    "function",
    "documentElement",
    "<div\x20class=\x22dialog\x20show\x20expand\x20no-hide\x20data\x22>\x0a\x09\x09<div\x20class=\x22dialog-header\x22>\x0a\x09\x09\x09<div\x20class=\x22data-title\x22\x20stroke=\x22",
    "Lottery\x20win\x20rate\x20is\x20now\x20capped\x20to\x2085%.\x20This\x20is\x20to\x20prevent\x20domination\x20from\x20extremely\x20wealthy\x20players.",
    "26th\x20June\x202023",
    "*Yoba\x20damage:\x2030\x20→\x2040",
    "Minor\x20mobile\x20UI\x20bug\x20fixes.",
    ".tv-next",
    "thirdEye",
    "Missile\x20Health",
    "started!",
    "*Wing\x20damage:\x2025\x20→\x2035",
    "<div\x20class=\x22toast\x22>\x0a\x09\x09<div\x20stroke=\x22",
    "3L$0",
    "yellowLadybug",
    "#d3bd46",
    "16th\x20June\x202023",
    "Mobs\x20can\x20only\x20be\x20bred\x20once\x20now.",
    "https://stats.hornex.pro/api/userCount",
    "ur\x20pe",
    ".grid\x20.title",
    "\x0aServer:\x20",
    "getBigUint64",
    "Added\x20usernames.\x20Claim\x20it\x20from\x20Stats\x20page.",
    "Reduced\x20Super\x20&\x20Hyper\x20Centipede\x20length:\x20(10,\x2040)\x20→\x20(5,\x2010)",
    "Pill\x20now\x20makes\x20your\x20petal\x20orbit\x20sus.",
    "Increased\x20level\x20needed\x20for\x20participating\x20in\x20lottery:\x2010\x20→\x2030",
    "shieldRegenPerSec",
    "#aaaaaa",
    ".find-user-btn",
    "terms.txt",
    "\x20mob\x20size\x20when\x20they\x20are\x20hit\x20with\x20it.\x20Also\x20known\x20as",
    "*Swastika\x20damage:\x2030\x20→\x2040",
    "*The\x20more\x20higher\x20rarity\x20petals\x20you\x20poll,\x20the\x20higher\x20win\x20chance\x20you\x20get.",
    "Shell\x20petal\x20now\x20actually\x20gives\x20you\x20a\x20shield.",
    "https",
    "petalRice",
    "Sandstorm_5",
    "oHealth",
    "Range",
    "hornex",
    "Mushroom",
    "shadowColor",
    "Fixed\x20level\x20text\x20disappearing\x20sometimes.",
    "ad\x20refresh",
    "drawArmAndGem",
    "\x22>\x0a\x09\x09\x09<span\x20stroke=\x22ALL\x22></div>\x0a\x09\x09</div>",
    "#ff3333",
    "<canvas\x20class=\x22petal-bg\x22></canvas>",
    "parentNode",
    "\x0a\x0a\x09\x09\x09<div\x20class=\x22msg-btn-row\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20yes-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22Yes\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09\x09<div\x20class=\x22btn\x20no-btn\x22>\x0a\x09\x09\x09\x09\x09<span\x20stroke=\x22No\x22></span>\x0a\x09\x09\x09\x09</div>\x0a\x09\x09\x09</div>\x0a\x09\x09</div>\x0a\x09</div>",
    "All\x20mobs\x20excluding\x20spawners\x20(like\x20Ant\x20Hole)\x20now\x20spawn\x20in\x20waves.",
    "Shiny\x20mobs\x20now\x20only\x20spawn\x20in\x20Mythic+\x20zones.",
    "userCount",
    "anti_spam",
    "timePlayed",
    "iSwapPetal",
    "g\x20on\x20",
    "rgb(",
    "Added\x20petal\x20counter\x20in\x20inventory\x20&\x20user\x20profile.",
    "elongation",
    "consumeProjDamageF",
    "9991836ZIutLH",
    "*Coffee\x20duration:\x201s\x20→\x201.5s",
    "Common\x20Unusual\x20Rare\x20Epic\x20Legendary\x20Mythic\x20Ultra\x20Super\x20Hyper",
    "Iris",
    "WP10rSoRnG",
    "You\x20get\x20muted\x20for\x2060s\x20if\x20you\x20send\x20chats\x20too\x20frequently.",
    "Hornet_4",
    "transition",
    "Why\x20is\x20this\x20a\x20mob?\x20It\x20is\x20clearly\x20a\x20plant.",
    "onkeyup",
    "3rd\x20July\x202023",
    "OPEN",
    "waveStarting",
    "Health",
    "#fff0b8",
    "maxTimeAlive",
    "small",
    "neutral",
    "Coffee",
    "#8f5db0",
    "Missile\x20Damage",
    "Minimum\x20mob\x20size\x20size\x20now\x20depends\x20on\x20rarity.",
    "petalStickbug",
    "Increases\x20petal\x20pickup\x20range.",
    "nerd",
    "decode",
    "main",
    "It\x20likes\x20to\x20drop\x20DMCA.",
    "petalStick",
    "Press\x20F\x20to\x20toggle\x20hitbox.",
    "New\x20setting:\x20Show\x20Background\x20Grid.\x20Toggles\x20background\x20grid\x20visibility.",
    ".joystick",
    "Waves\x20do\x20not\x20close\x20if\x20any\x20player\x20has\x20been\x20inside\x20the\x20zone\x20for\x20more\x20than\x2060s.",
    "\x27s\x20Profile\x22></span></div>\x0a\x09\x09<div\x20class=\x22dialog-content\x22>\x0a\x09\x09\x09<div\x20class=\x22progress\x20level-progress\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22bar\x20main\x22></div>\x0a\x09\x09\x09\x09<span\x20class=\x22level\x22\x20stroke=\x22Level\x20100\x20-\x2020/10000\x20XP\x22></span>\x0a\x09\x09\x09</div>\x0a\x0a\x09\x09\x09<div\x20class=\x22petal-rows\x22>\x0a\x09\x09\x09\x09<div\x20class=\x22petals\x22>",
    "show_clown",
    "spawn",
    "Turtle",
    "21st\x20June\x202023",
    "\x20Pym\x20Particle.",
    "Increased\x20final\x20wave:\x2030\x20→\x2040",
    ".dialog-content",
    ".damage-cb",
    "iJoin",
    ".yes-btn",
    "Ghost_6",
    "select",
    "*Wave\x20at\x20which\x20you\x20will\x20start\x20depends\x20on\x20both\x20your\x20level\x20&\x20the\x20max\x20wave\x20you\x20have\x20reached.",
    "swapped",
    "enable_kb_movement",
    "Game\x20released\x20to\x20public!",
    "#f009e5",
    "Fixed\x20mob\x20count\x20not\x20increasing\x20much\x20after\x20wave\x20120\x20in\x20Waveroom.",
    "soldierAnt",
    "ion",
    "*Rock\x20health:\x2045\x20→\x2050",
    "isClown",
    "fontFamily",
    "Fixed\x20Dragon\x27s\x20Fire\x20rotating\x20by\x20Wave.",
    "eyeX",
    "Antidote\x20has\x20been\x20reworked.\x20It\x20now\x20reduces\x20poison\x20effect\x20when\x20consumed.",
    "Mother\x20Dragon\x20was\x20out\x20looking\x20for\x20dinner\x20for\x20her\x20babies\x20and\x20we\x20stole\x20her\x20egg.\x20GG",
    "scale",
    "FSoixsnA",
    "Fixed\x20a\x20server\x20crash\x20bug.",
    "<div\x20class=\x22dialog-content\x20craft\x22>\x0a\x09<div\x20class=\x22absorb-row\x22>\x0a\x09\x09<div\x20class=\x22container\x22></div>\x0a\x09\x09<div\x20class=\x22btn\x20craft-btn\x22>\x0a\x09\x09\x09<span\x20stroke=\x22Craft\x22></span>\x0a\x09\x09\x09<div\x20class=\x22craft-rate\x22\x20stroke=\x22?%\x20success\x20rate\x22></div>\x0a\x09\x09</div>\x0a\x09</div>\x0a\x09<div\x20stroke=\x22Combine\x205\x20of\x20the\x20same\x20petal\x20to\x20craft\x20an\x20upgrade\x22></div>\x0a\x09<div\x20stroke=\x22Failure\x20will\x20destroy\x201-4\x20petals\x20and\x20put\x20them\x20in\x20lottery\x22></div>\x0a</div>",
    "W43cOSoOW4lcKG",
    "*Light\x20damage:\x2013\x20→\x2012",
    "Watching\x20video\x20ad\x20now\x20gives\x20you\x20a\x20secret\x20skin.",
    "server",
    "*Gas\x20poison:\x2030\x20→\x2040",
    "#a17c4c",
    "rkJNdF",
    "Increased\x20kills\x20needed\x20for\x20Hyper\x20wave:\x2050\x20→\x20100",
    "6th\x20October\x202023",
    "https://www.youtube.com/watch?v=yOnyW6iNB1g",
    "translate",
    "ArrowUp",
    ".builds\x20.dialog-content",
    "Reduced\x20Hyper\x20petal\x20price:\x20$1000\x20→\x20$500",
    "Pet\x20Heal",
    ";\x0a\x09\x09\x09-o-background-size:\x20",
    "Reduced\x20Spider\x20Cave\x20spawns:\x20[3,\x206]\x20→\x20[2,\x205]",
    ".tv-prev",
    "en-US",
    "pet",
    "*Snail\x20damage:\x2020\x20→\x2025",
    "projAngle",
    "*Heavy\x20health:\x20300\x20→\x20350",
    "9th\x20July\x202023",
    ".builds",
    "Heals\x20but\x20also\x20makes\x20you\x20poop.",
    "New\x20petal:\x20Sword.\x20Dropped\x20by\x20Pedox.",
    "Fixed\x20Honey\x20damaging\x20newly\x20spawned\x20mobs\x20instantly.",
    "#709e45",
    "hornex.pro",
    "loggedIn\x20kicked\x20update\x20addToInventory\x20joinedGame\x20craftResult\x20accountData\x20gambleList\x20playerList\x20usernameTaken\x20usernameClaimed\x20userProfile\x20accountNotFound\x20reqFailed\x20cantPerformAction\x20glbData\x20cantChat\x20keyAlreadyUsed\x20keyInvalid\x20keyCheckFailed\x20keyClaimed\x20changeLobby",
    ".show-population-cb",
    "<div\x20class=\x22chat-item\x22></div>",
    "Beetle_5",
    ".rewards",
    "*If\x20your\x20level\x20is\x20too\x20low,\x20you\x20are\x20teleported\x20in\x2010s.",
    "*Bone\x20armor:\x207\x20→\x208",
    "*Cotton\x20health:\x2012\x20→\x2015",
    "hasSpiderLeg",
    ".video",
    "*126\x20Super\x20(0.56%\x20chance\x20if\x20you\x20collect\x201\x20petal)",
    "petalDragonEgg",
    "#b9baba",
    "--angle:",
    "*You\x20have\x20to\x20be\x20at\x20least\x20level\x2010\x20to\x20participate.",
    "Bone\x20only\x20receives\x20FinalDamage=max(0,IncomingDamage-Armor)\x20now.",
    "Provide\x20a\x20name\x20dummy.",
    ".build-save-btn",
    "Added\x20a\x20setting\x20to\x20censor\x20special\x20characters\x20from\x20chat.\x20Enabled\x20by\x20default.",
    "Fixed\x20another\x20crafting\x20exploit.",
    "cos",
    "Red\x20ball.",
    "petalPincer",
    "Failed\x20to\x20find\x20region.",
    "*Works\x20on\x20mobs\x20of\x20rarity\x20upto\x20PetalRarity+1.",
    "*Halo\x20now\x20stacks.",
    "#8f5f34",
    "petCount",
    "Space",
    "Favourite\x20object\x20of\x20a\x20woman.",
    "Are\x20you\x20sure\x20you\x20want\x20to\x20import\x20this\x20account?",
    "#d3ad46",
    "\x22></div>\x0a\x09</div>",
    ".close-btn",
    "Pincer\x20can\x20not\x20decrease\x20mob\x20speed\x20below\x2030%\x20now.",
    "finalMsg",
    "tCkxW5FcNmkQ",
    "%!Ew",
    ".level",
    "Absorb",
    "Reworked\x20DMCA\x20in\x20Waveroom.\x20It\x20now\x20has\x20120\x20health\x20&\x20instantly\x20despawns\x20a\x20mob\x20in\x20Waveroom.",
    "lightningDmgF",
    "New\x20rarity:\x20Hyper.",
    "New\x20petal:\x20Taco.\x20Heals\x20and\x20makes\x20you\x20shoot\x20poop\x20in\x20the\x20opposite\x20direction\x20of\x20motion.\x20Dropped\x20by\x20Petaler.",
    "no\x20sub,\x20no\x20gg",
    "*Lightsaber\x20damage:\x208\x20→\x209",
    "13th\x20September\x202023",
    "#efc99b",
    "*Rock\x20health:\x2050\x20→\x2060",
    "points",
    "Fixed\x20low\x20level\x20player\x20getting\x20ejected\x20from\x20zone\x20waves\x20while\x20being\x20inside\x20a\x20Waveroom.",
    "cantChat",
    "playerList",
    "Added\x20Waves.",
    "10QIdaPR",
    "30th\x20June\x202023",
    "no-icon",
    "healthIncrease",
    "hpRegenPerSecF",
    "Banana",
    ".no-btn",
    "Added\x20win\x20rate\x20preview\x20for\x20gambling.\x20Note\x20that\x20the\x20preview\x20isn\x27t\x20real-time.\x20You\x20have\x20to\x20open\x20lottery\x20to\x20sync\x20it\x20with\x20the\x20current\x20state.\x20You\x20also\x20have\x20to\x20open\x20lottery\x20once\x20for\x20the\x20previews\x20to\x20show\x20up.",
    "%\x20-\x200.8em*",
    "WRZdV8kNW5FcHq",
    "updateT",
    "Removed\x20EU\x20#3.",
    ".total-kills",
    "Sprite",
    "#416d1e",
    "copy",
    "A\x20default\x20petal.",
    "*Swastika\x20reload:\x202.5s\x20→\x202s",
    "If\x20grid\x20cell\x20exceeds\x20150\x20objects,\x20players\x20&\x20mobs\x20are\x20no\x20longer\x20teleported.\x20Pets\x20are\x20now\x20insta\x20killed.",
    "updateProg",
    "Mobs\x20now\x20get\x20teleported\x20back\x20to\x20their\x20zone\x20if\x20they\x20are\x20too\x20far\x20instead\x20of\x20despawning.",
    "Fixed\x20an\x20exploit\x20that\x20let\x20you\x20clone\x20your\x20petals.",
    ".swap-btn",
    "*Peas\x20damage:\x2012\x20→\x2015",
    "dmca\x20it\x20m28!",
    "*Bone\x20armor:\x205\x20→\x206",
    "Reduced\x20Hornet\x20missile\x20knockback.",
    "*Turtle\x20health:\x20600\x20→\x20900",
    "*Wave\x20population\x20gets\x20reset\x20every\x205th\x20wave.",
    "moveTo",
    "qmklWO4",
    "doLerpEye",
    "*Gas\x20health:\x20250\x20→\x20200",
    "More\x20wave\x20changes:",
    "content",
    "nt.\x20H",
    "userChat",
    "nickname",
    ".prediction",
    "Honey\x20does\x20not\x20stack\x20with\x20other\x20player\x27s\x20Honey\x20now.",
    "spawn_zone",
    "*Their\x20size\x20is\x20comparatively\x20smaller\x20with\x20a\x20colorful\x20appearance.",
    "Shiny\x20mobs\x20can\x20not\x20be\x20breeded\x20now.",
    "6th\x20July\x202023",
    "respawnTime",
    "Fixed\x20a\x20bug\x20with\x20scoring\x20system.",
    "\x20Ultra",
    "#328379",
    "Fixed\x20player\x20not\x20moving\x20perfectly\x20straight\x20left\x20using\x20keyboard\x20controls.\x20Very\x20minor\x20issue.",
    "*Press\x20L+Shift+NumberKey\x20to\x20save\x20a\x20build.",
    "*Ultra:\x20125+",
    "tail_outline",
    "*Cement\x20health:\x2080\x20→\x20100",
    "prepend",
    "<div\x20class=\x22chat-name\x22></div>",
    ".show-bg-grid-cb",
    "Tanky\x20mobs\x20now\x20have\x20lower\x20spawn\x20rate\x20in\x20waves:\x20Dragon\x20Nest,\x20Ant\x20Holes,\x20Beehive,\x20Spider\x20Cave,\x20Yoba\x20&\x20Queen\x20Ant",
    "New\x20mob:\x20Avacado.\x20Drops\x20Leaf\x20&\x20Avacado.",
    "locat",
    "453750vmVcyG",
    "rgb(255,\x2043,\x20117)",
    "powderTime",
    "*Hyper:\x202%\x20→\x201%",
    "canShowDrops",
    "[U]\x20Fixed\x20Name\x20Size:\x20",
    "Slow\x20it\x20down\x20sussy\x20baka!",
    "*Swastika\x20health:\x2025\x20→\x2030",
    "Salt\x20doesn\x27t\x20work\x20while\x20sleeping\x20now.",
    "*Fire\x20damage:\x2025\x20→\x2020",
    "Kills\x20Needed",
    "#5ec13a",
    "#654a19",
    "entRot",
    "Fixed\x20game\x20getting\x20laggy\x20after\x20playing\x20for\x20some\x20time.",
    "addGroupNumbers",
    "*Removed\x20Ultra\x20wave.",
    "picked",
    "setPos",
    "<div><span\x20stroke=\x22",
    "Belle\x20Delphine\x27s\x20tummy\x20air.",
    "New\x20setting:\x20Right\x20Align\x20Petals.\x20Places\x20the\x20petals\x20row\x20at\x20the\x20right\x20side\x20of\x20screen\x20instead\x20of\x20center.\x20Not\x20for\x20mobile\x20users.",
    "New\x20petal:\x20Chromosome.\x20Dropped\x20by\x20Nigersaurus.\x20Ruins\x20mob\x20movement.",
    "<span\x20stroke=\x22No\x20petals\x20in\x20here\x20yet.\x22></span>",
    "horne",
    "Added\x20some\x20buttons\x20to\x20instant\x20absorb/gamble\x20a\x20rarity.",
    "web",
    "posAngle",
    "New\x20mob:\x20Statue.",
    "W5T8c2BdUs/cJHBcR8o4uG",
    "101636gyvtEF",
    "<div\x20class=\x22petal\x20tier-",
    "Added\x20Shop.",
    "Spawns",
    "Added\x201\x20more\x20EU\x20lobby.",
    "hasEye",
    "cuYF",
    "Rock_6",
    "Gives\x20you\x20a\x20shield.",
    "1rrAouN",
    "*Map\x20changes\x20every\x205th\x20wave.\x20Map\x20can\x20sometimes\x20be\x20maze\x20and\x20sometimes\x20not.",
    "Much\x20heavier\x20than\x20your\x20mom.",
    "fromCharCode",
    "passive",
    "Fixed\x20Hyper\x20mobs\x20not\x20dropping\x20upto\x203\x20petals.",
    "Increased\x20wave\x20mob\x20count\x20even\x20more.",
    "insert\x20something\x20here...",
    "\x27PLAY\x20POOPOO.PRO\x20AND\x20WE\x20STOP\x20BOTTING!!\x27\x20—\x20Anonymous\x20Skid",
    "createImageData",
    "18th\x20September\x202023",
    "regenF",
    "New\x20mob:\x20Spider\x20Cave.",
    "shiftKey",
    "27th\x20June\x202023",
    "*Epic:\x2075\x20→\x2065",
    "fireDamageF",
    "canRemove",
    "mobKilled",
    "Dragon_6",
    "Summons\x20sharp\x20hexagonal\x20tiles\x20around\x20you.",
    "13th\x20August\x202023",
    "Lays\x20spider\x20poop\x20that\x20slows\x20enemies\x20down.",
    "#ce79a2",
    "Bursts\x20&\x20boosts\x20you\x20when\x20your\x20mood\x20swings",
    "absolute",
    "deg",
    "invalid",
    "labelPrefix",
    "Players\x20have\x203s\x20spawn\x20immunity\x20now.",
    "breedTimerAlpha",
    "8URl",
    "makeAntenna",
    "Fussy\x20Sucker",
    "Settings\x20now\x20also\x20shows\x20shortcut\x20keys.",
    "mushroomPath",
    "rgba(0,0,0,0.08)",
    "2nd\x20March\x202024",
    "createElement",
    "<div\x20class=\x22spinner\x22></div>",
    "#8ecc51",
    "Orbit\x20Dance",
    "Reduced\x20Super\x20drop\x20rate:\x200.02%\x20→\x200.01%",
    "iReqUserProfile",
    ".credits-btn",
    "#d3d14f",
    "Changes\x20to\x20anti-lag\x20system:",
    "fireTime",
    "New\x20mob:\x20Dice.",
    "url(",
    ".build-load-btn",
    "*Turtle\x20reload:\x202s\x20+\x200.5s\x20→\x201.5s\x20+\x200.5s",
    "vendor",
    ".stats\x20.dialog-header\x20span",
    "spiderLeg",
    "Invalid\x20username.",
    "petalWeb",
    "Beetle_2",
    "isBae",
    "workerAntFire",
    "Makes\x20your\x20petal\x20orbit\x20dance.",
    "beetle",
    "#ff7380",
    "indexOf",
    "[L]\x20Show\x20Debug\x20Info:\x20",
    "centipedeHead",
    "Favourite\x20object\x20of\x20an\x20average\x20casino\x20enjoyer.",
    "div",
    "fixed",
    ".circle",
    "isPortal",
    "Ant\x20Hole",
    "fire",
    "\x20[Do\x20Not\x20Share]\x20[Hornex.Pro].txt",
    ".score-overlay",
    "<div\x20stroke=\x22[GLOBAL]\x20\x22></div>",
    "Extra\x20Speed",
    "Buffs:",
    ".max-score",
    "regenAfterHp",
    ".lb-btn",
    "/profile",
    "/dlPetal",
    ":\x22></span>\x0a\x09\x09<span\x20stroke=\x220\x22></span>\x0a\x09</div>",
    "hornex-pro_970x250",
    "<div\x20class=\x22copy\x22><span\x20stroke=\x22",
    "hideTimer",
    "des",
    ".collected",
    "<div\x20class=\x22dialog\x20expand\x20big-dialog\x20show\x20profile\x22>\x0a\x09\x09<div\x20class=\x22btn\x20close-btn\x22>\x0a\x09\x09\x09<div\x20class=\x22close\x22></div>\x0a\x09\x09</div>\x0a\x09\x09<div\x20class=\x22dialog-header\x22><span\x20stroke=\x22",
    "Salt\x20does\x20not\x20work\x20on\x20Hyper\x20mobs\x20now.",
    "Poison\x20Reduction",
    "Increased\x20build\x20saver\x20limit\x20from\x2020\x20to\x2050.",
    "marginTop",
    "Wave\x20Starting...",
    "*Web\x20reload:\x203s\x20+\x200.5s\x20→\x203.5s\x20+\x200.5s",
    "#7dad0c",
    "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw",
    "makeHole",
    "#888",
    "state",
    "#333",
    "petalHeavy",
    "Added\x20Discord\x20login.",
    "been\x20",
    ".login-btn",
    "55078DZMiSD",
    "side",
    "Rose",
    "Orbit\x20Shlongation",
    "nAngle",
    "#fe98a2",
    ".petal-count",
    ";-moz-background-position:\x20",
    "New\x20petal:\x20Turtle.\x20Its\x20like\x20Missile\x20but\x20increases\x20its\x20size\x20over\x20time.\x20Might\x20be\x20useful\x20for\x20pushing\x20mobs\x20away.",
    "Stolen\x20from\x20a\x20female\x20Beetle\x27s\x20womb.\x20GG",
    "*Halo\x20pet\x20heal:\x207/s\x20→\x208/s",
    "https://discord.gg/zZsUUg8rbu",
    "Powder",
    "*Grapes\x20poison:\x2025\x20→\x2030",
    "#999",
    ".privacy-btn",
    "Unusual",
    "angryT",
    ".absorb-petals-btn",
    "Craft\x20rate\x20in\x20Waveroom\x20is\x20now\x202x.",
    "Hold\x20shift\x20and\x20press\x20number\x20key\x20to\x20swap\x20petal\x20at\x20slot>10.",
    "mobGallery",
    "#15cee5",
    "mood",
    "#554213",
    "New\x20mob:\x20Pedox",
    "Reduced\x20DMCA\x20reload:\x2020s\x20→\x2010s",
    "setUint16",
    "*Stinger\x20damage:\x20100\x20→\x20140",
    "Spider\x20Cave\x20now\x20spawns\x202\x20Spider\x20Yoba\x27s\x20on\x20death.",
    "Increases\x20movement\x20speed.\x20Definitely\x20not\x20cocaine.",
    "Reduced\x20kills\x20needed\x20for\x20Ultra\x20wave:\x203000\x20→\x202000",
    "Has\x20fungal\x20infection\x20gg",
    "New\x20mob:\x20Dragon\x20Nest.",
    "Removed\x20tick\x20time\x20&\x20object\x20count\x20from\x20debug\x20info.",
    "%\x22></div>\x0a\x09\x09\x09\x09</div>",
    "waveShowTimer",
    "orb\x20a",
    "toString",
    "http://localhost:8001/discord",
    "timeJoined",
    "New\x20mob:\x20Dragon.\x20Breathes\x20Fire.",
    "iReqAccountData",
    "<div\x20class=\x22msg-overlay\x22>\x0a\x09\x09<div\x20class=\x22msg\x22>\x0a\x09\x09\x09<div\x20class=\x22msg-title\x22\x20stroke=\x22",
    "Password\x20downloaded!",
    "#97782b",
    "&quot;",
    "*Grapes\x20poison:\x2030\x20→\x2035",
    "heart",
    "hello\x20911,\x20i\x20would\x20like\x20to\x20report\x20a\x20garden\x20robbery",
    "28th\x20June\x202023",
    "lineCap",
    "7th\x20October\x202023",
    "Weirdos\x20that\x20shoot\x20missiles\x20from\x20a\x20region\x20we\x20generally\x20use\x20to\x20poop.",
    "Antidote",
    "\x20downloaded!",
  ];
  a = function () {
    return BK;
  };
  return a();
}
function b(c, d) {
  const e = a();
  return (
    (b = function (f, g) {
      f = f - 0x1c5;
      let h = e[f];
      return h;
    }),
    b(c, d)
  );
}
(function (c, d) {
  const ue = b,
    e = c();
  while (!![]) {
    try {
      const f =
        (-parseInt(ue(0x3fb)) / 0x1) * (-parseInt(ue(0xa11)) / 0x2) +
        parseInt(ue(0x58e)) / 0x3 +
        -parseInt(ue(0x5f9)) / 0x4 +
        (-parseInt(ue(0x494)) / 0x5) * (parseInt(ue(0xd9a)) / 0x6) +
        (parseInt(ue(0xe6e)) / 0x7) * (parseInt(ue(0xc7e)) / 0x8) +
        parseInt(ue(0xcca)) / 0x9 +
        parseInt(ue(0x355)) / 0xa;
      if (f === d) break;
      else e["push"](e["shift"]());
    } catch (g) {
      e["push"](e["shift"]());
    }
  }
})(a, 0xa3f85),
  (() => {
    const uf = b;
    var cG = 0x2710,
      cH = 0x1e - 0x1,
      cI = { ...cV(uf(0xd29)), ...cV(uf(0x60b)) },
      cJ = 0x93b,
      cK = 0x10,
      cL = 0x3c,
      cM = 0x10,
      cN = 0x3,
      cO = /^[a-zA-Z0-9_]+$/,
      cP = /[^a-zA-Z0-9_]/g,
      cQ = cV(uf(0xe76)),
      cR = cV(uf(0xbd0)),
      cS = cV(uf(0x758)),
      cT = cV(uf(0x6e5)),
      cU = cV(uf(0x8c1));
    function cV(qQ) {
      const ug = uf,
        qR = qQ[ug(0x32e)]("\x20"),
        qS = {};
      for (let qT = 0x0; qT < qR[ug(0x4cf)]; qT++) {
        qS[qR[qT]] = qT;
      }
      return qS;
    }
    var cW = [0x0, 11.1, 17.6, 0x19, 33.3, 42.9, 0x64, 185.7, 0x12c, 0x258];
    const cX = {};
    (cX[uf(0xcdb)] = 0x0), (cX[uf(0xb28)] = 0x1), (cX[uf(0x882)] = 0x2);
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
      return 0x14 * Math[uh(0xb02)](qQ * 1.05 ** (qQ - 0x1));
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
        qR++, (qS += Math[ui(0x36c)](0x1e, qS));
      }
      return qR;
    }
    function d6(qQ) {
      const uj = uf;
      return Math[uj(0x367)](0xf3, Math[uj(0x36c)](qQ, 0xc7) / 0xc8);
    }
    function d7() {
      return d8(0x100);
    }
    function d8(qQ) {
      const qR = Array(qQ);
      while (qQ--) qR[qQ] = qQ;
      return qR;
    }
    var d9 = cV(uf(0xccc)),
      da = Object[uf(0x28d)](d9),
      db = da[uf(0x4cf)] - 0x1,
      dc = db;
    function dd(qQ) {
      const uk = uf,
        qR = [];
      for (let qS = 0x1; qS <= dc; qS++) {
        qR[uk(0x9ee)](qQ(qS));
      }
      return qR;
    }
    const de = {};
    (de[uf(0xc94)] = 0x0),
      (de[uf(0x672)] = 0x1),
      (de[uf(0x696)] = 0x2),
      (de[uf(0xe5b)] = 0x3),
      (de[uf(0xdf7)] = 0x4),
      (de[uf(0x215)] = 0x5),
      (de[uf(0xa8e)] = 0x6),
      (de[uf(0x29b)] = 0x7),
      (de[uf(0x978)] = 0x8);
    var df = de;
    function dg(qQ, qR) {
      const ul = uf;
      return Math[ul(0x367)](0x3, qQ) * qR;
    }
    const dh = {};
    (dh[uf(0x2dc)] = cS[uf(0x681)]),
      (dh[uf(0xb66)] = uf(0xdc8)),
      (dh[uf(0xc39)] = 0xa),
      (dh[uf(0xb9c)] = 0x0),
      (dh[uf(0x544)] = 0x1),
      (dh[uf(0x3c2)] = 0x1),
      (dh[uf(0xd8b)] = 0x3e8),
      (dh[uf(0x4ef)] = 0x0),
      (dh[uf(0x4b3)] = ![]),
      (dh[uf(0x7fc)] = 0x1),
      (dh[uf(0x304)] = ![]),
      (dh[uf(0xdcc)] = 0x0),
      (dh[uf(0xa96)] = 0x0),
      (dh[uf(0x58d)] = ![]),
      (dh[uf(0x491)] = 0x0),
      (dh[uf(0xd52)] = 0x0),
      (dh[uf(0xbee)] = 0x0),
      (dh[uf(0x421)] = 0x0),
      (dh[uf(0xbdb)] = 0x0),
      (dh[uf(0x450)] = 0x0),
      (dh[uf(0x457)] = 0x1),
      (dh[uf(0x5b9)] = 0xc),
      (dh[uf(0xc2a)] = 0x0),
      (dh[uf(0x21e)] = ![]),
      (dh[uf(0x807)] = void 0x0),
      (dh[uf(0x69c)] = ![]),
      (dh[uf(0x531)] = 0x0),
      (dh[uf(0xae6)] = ![]),
      (dh[uf(0x324)] = 0x0),
      (dh[uf(0xc33)] = 0x0),
      (dh[uf(0x8d6)] = ![]),
      (dh[uf(0xbaf)] = 0x0),
      (dh[uf(0x921)] = 0x0),
      (dh[uf(0x959)] = 0x0),
      (dh[uf(0x7a4)] = ![]),
      (dh[uf(0x49a)] = 0x0),
      (dh[uf(0xbf3)] = ![]),
      (dh[uf(0x7ec)] = ![]),
      (dh[uf(0xeb4)] = 0x0),
      (dh[uf(0x71c)] = 0x0),
      (dh[uf(0x3bb)] = 0x0),
      (dh[uf(0xa20)] = ![]),
      (dh[uf(0xd44)] = 0x1),
      (dh[uf(0x73e)] = 0x0),
      (dh[uf(0x603)] = 0x0),
      (dh[uf(0xb8a)] = 0x0),
      (dh[uf(0xbf5)] = 0x0),
      (dh[uf(0xc6d)] = 0x0),
      (dh[uf(0x8ea)] = 0x0),
      (dh[uf(0x782)] = 0x0),
      (dh[uf(0x611)] = 0x0),
      (dh[uf(0xd63)] = 0x0),
      (dh[uf(0x2b8)] = 0x0),
      (dh[uf(0xca7)] = 0x0),
      (dh[uf(0x979)] = 0x0),
      (dh[uf(0x205)] = 0x0),
      (dh[uf(0x9fb)] = 0x0),
      (dh[uf(0x97d)] = ![]),
      (dh[uf(0x678)] = 0x0),
      (dh[uf(0x530)] = 0x0),
      (dh[uf(0x7fa)] = 0x0);
    var di = dh;
    const dj = {};
    (dj[uf(0xc25)] = uf(0x9b2)),
      (dj[uf(0xb66)] = uf(0xd6f)),
      (dj[uf(0x2dc)] = cS[uf(0x681)]),
      (dj[uf(0xc39)] = 0x9),
      (dj[uf(0x544)] = 0xa),
      (dj[uf(0x3c2)] = 0xa),
      (dj[uf(0xd8b)] = 0x9c4);
    const dk = {};
    (dk[uf(0xc25)] = uf(0xb6b)),
      (dk[uf(0xb66)] = uf(0xe65)),
      (dk[uf(0x2dc)] = cS[uf(0x605)]),
      (dk[uf(0xc39)] = 0xd / 1.1),
      (dk[uf(0x544)] = 0x2),
      (dk[uf(0x3c2)] = 0x37),
      (dk[uf(0xd8b)] = 0x9c4),
      (dk[uf(0x4ef)] = 0x1f4),
      (dk[uf(0x304)] = !![]),
      (dk[uf(0x54a)] = 0x28),
      (dk[uf(0xa96)] = Math["PI"] / 0x4);
    const dl = {};
    (dl[uf(0xc25)] = uf(0xe2d)),
      (dl[uf(0xb66)] = uf(0x9e0)),
      (dl[uf(0x2dc)] = cS[uf(0x911)]),
      (dl[uf(0xc39)] = 0x8),
      (dl[uf(0x544)] = 0x5),
      (dl[uf(0x3c2)] = 0x5),
      (dl[uf(0xd8b)] = 0xdac),
      (dl[uf(0x4ef)] = 0x3e8),
      (dl[uf(0xdcc)] = 0xb),
      (dl[uf(0x7a4)] = !![]);
    const dm = {};
    (dm[uf(0xc25)] = uf(0xccd)),
      (dm[uf(0xb66)] = uf(0xbc4)),
      (dm[uf(0x2dc)] = cS[uf(0x550)]),
      (dm[uf(0xc39)] = 0x6),
      (dm[uf(0x544)] = 0x5),
      (dm[uf(0x3c2)] = 0x5),
      (dm[uf(0xd8b)] = 0xfa0),
      (dm[uf(0x4b3)] = !![]),
      (dm[uf(0x7fc)] = 0x32);
    const dn = {};
    (dn[uf(0xc25)] = uf(0x824)),
      (dn[uf(0xb66)] = uf(0xb6f)),
      (dn[uf(0x2dc)] = cS[uf(0x300)]),
      (dn[uf(0xc39)] = 0xb),
      (dn[uf(0x544)] = 0xc8),
      (dn[uf(0x3c2)] = 0x1e),
      (dn[uf(0xd8b)] = 0x1388);
    const dp = {};
    (dp[uf(0xc25)] = uf(0xa09)),
      (dp[uf(0xb66)] = uf(0xb24)),
      (dp[uf(0x2dc)] = cS[uf(0x9a1)]),
      (dp[uf(0xc39)] = 0x8),
      (dp[uf(0x544)] = 0x2),
      (dp[uf(0x3c2)] = 0xa0),
      (dp[uf(0xd8b)] = 0x2710),
      (dp[uf(0x5b9)] = 0xb),
      (dp[uf(0xc2a)] = Math["PI"]),
      (dp[uf(0xed5)] = [0x1, 0x1, 0x1, 0x3, 0x3, 0x5, 0x5, 0x7]);
    const dq = {};
    (dq[uf(0xc25)] = uf(0x852)),
      (dq[uf(0xb66)] = uf(0xe93)),
      (dq[uf(0x807)] = df[uf(0xc94)]),
      (dq[uf(0x450)] = 0x1e),
      (dq[uf(0x1e1)] = [0x32, 0x46, 0x5a, 0x78, 0xb4, 0x168, 0x21c, 0x2d0]);
    const dr = {};
    (dr[uf(0xc25)] = uf(0x798)),
      (dr[uf(0xb66)] = uf(0xbce)),
      (dr[uf(0x807)] = df[uf(0x672)]);
    const ds = {};
    (ds[uf(0xc25)] = uf(0x8a0)),
      (ds[uf(0xb66)] = uf(0x9a9)),
      (ds[uf(0x2dc)] = cS[uf(0x70f)]),
      (ds[uf(0xc39)] = 0xb),
      (ds[uf(0xd8b)] = 0x9c4),
      (ds[uf(0x544)] = 0x14),
      (ds[uf(0x3c2)] = 0x8),
      (ds[uf(0x58d)] = !![]),
      (ds[uf(0x491)] = 0x2),
      (ds[uf(0xc1d)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xe]),
      (ds[uf(0xd52)] = 0x14);
    const du = {};
    (du[uf(0xc25)] = uf(0x434)),
      (du[uf(0xb66)] = uf(0xecf)),
      (du[uf(0x2dc)] = cS[uf(0xa2e)]),
      (du[uf(0xc39)] = 0xb),
      (du[uf(0x544)] = 0x14),
      (du[uf(0x3c2)] = 0x14),
      (du[uf(0xd8b)] = 0x5dc),
      (du[uf(0x421)] = 0x64),
      (du[uf(0x283)] = 0x1);
    const dv = {};
    (dv[uf(0xc25)] = uf(0x9c9)),
      (dv[uf(0xb66)] = uf(0xeaa)),
      (dv[uf(0x2dc)] = cS[uf(0xa67)]),
      (dv[uf(0xc39)] = 0x7),
      (dv[uf(0x544)] = 0x5),
      (dv[uf(0x3c2)] = 0xa),
      (dv[uf(0xd8b)] = 0x258),
      (dv[uf(0x457)] = 0x1),
      (dv[uf(0x21e)] = !![]),
      (dv[uf(0xed5)] = [0x2, 0x2, 0x3, 0x3, 0x5, 0x5, 0x5, 0x8]);
    const dw = {};
    (dw[uf(0xc25)] = uf(0xb89)),
      (dw[uf(0xb66)] = uf(0x301)),
      (dw[uf(0x2dc)] = cS[uf(0x33a)]),
      (dw[uf(0xc39)] = 0xb),
      (dw[uf(0x544)] = 0xf),
      (dw[uf(0x3c2)] = 0x1),
      (dw[uf(0xd8b)] = 0x3e8),
      (dw[uf(0x69c)] = !![]),
      (dw[uf(0x7a4)] = !![]);
    const dx = {};
    (dx[uf(0xc25)] = uf(0xc6c)),
      (dx[uf(0xb66)] = uf(0xce1)),
      (dx[uf(0x2dc)] = cS[uf(0x80f)]),
      (dx[uf(0xc39)] = 0xb),
      (dx[uf(0x544)] = 0xf),
      (dx[uf(0x3c2)] = 0x5),
      (dx[uf(0xd8b)] = 0x5dc),
      (dx[uf(0x531)] = 0x32),
      (dx[uf(0x250)] = [0x96, 0xfa, 0x15e, 0x1c2, 0x226, 0x28a, 0x2ee, 0x3e8]);
    const dy = {};
    (dy[uf(0xc25)] = uf(0x85d)),
      (dy[uf(0xb66)] = uf(0x593)),
      (dy[uf(0x2dc)] = cS[uf(0x664)]),
      (dy[uf(0xc39)] = 0x7),
      (dy[uf(0x544)] = 0x19),
      (dy[uf(0x3c2)] = 0x19),
      (dy[uf(0x457)] = 0x4),
      (dy[uf(0xd8b)] = 0x3e8),
      (dy[uf(0x4ef)] = 0x1f4),
      (dy[uf(0x5b9)] = 0x9),
      (dy[uf(0xa96)] = Math["PI"] / 0x8),
      (dy[uf(0x304)] = !![]),
      (dy[uf(0x54a)] = 0x28);
    const dz = {};
    (dz[uf(0xc25)] = uf(0x518)),
      (dz[uf(0xb66)] = uf(0xdd9)),
      (dz[uf(0x2dc)] = cS[uf(0x6bb)]),
      (dz[uf(0xc39)] = 0x10),
      (dz[uf(0x544)] = 0x0),
      (dz[uf(0x2d7)] = 0x1),
      (dz[uf(0x3c2)] = 0x0),
      (dz[uf(0xd8b)] = 0x157c),
      (dz[uf(0x4ef)] = 0x1f4),
      (dz[uf(0xc18)] = [0x1194, 0xdac, 0x9c4, 0x5dc, 0x320, 0x1f4, 0xc8, 0x64]),
      (dz[uf(0x5ca)] = [0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x1f4, 0x64, 0x64, 0x32]),
      (dz[uf(0x324)] = 0x3c),
      (dz[uf(0xae6)] = !![]),
      (dz[uf(0x7a4)] = !![]);
    const dA = {};
    (dA[uf(0xc25)] = uf(0xecb)),
      (dA[uf(0xb66)] = uf(0x1fc)),
      (dA[uf(0x2dc)] = cS[uf(0x62c)]),
      (dA[uf(0xd8b)] = 0x5dc),
      (dA[uf(0x8d6)] = !![]),
      (dA[uf(0x544)] = 0xa),
      (dA[uf(0x3c2)] = 0x14),
      (dA[uf(0xc39)] = 0xd);
    const dB = {};
    (dB[uf(0xc25)] = uf(0x280)),
      (dB[uf(0xb66)] = uf(0xdd7)),
      (dB[uf(0x2dc)] = cS[uf(0xdf9)]),
      (dB[uf(0xd8b)] = 0xdac),
      (dB[uf(0x4ef)] = 0x1f4),
      (dB[uf(0x544)] = 0x5),
      (dB[uf(0x3c2)] = 0x5),
      (dB[uf(0xc39)] = 0xa),
      (dB[uf(0xbaf)] = 0x46),
      (dB[uf(0x744)] = [0x50, 0x5a, 0x64, 0x7d, 0x96, 0xb4, 0xfa, 0x190]);
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
        name: uf(0x1eb),
        desc: uf(0x4b4),
        ability: df[uf(0x696)],
        orbitRange: 0x32,
        orbitRangeTiers: dd((qQ) => 0x32 + qQ * 0x46),
      },
      {
        name: uf(0x329),
        desc: uf(0x977),
        ability: df[uf(0xe5b)],
        breedPower: 0x1,
        breedPowerTiers: [1.5, 0x2, 2.5, 0x3, 0x3, 0x3, 0x3, 0x6],
        breedRange: 0x64,
        breedRangeTiers: [0x96, 0xc8, 0xfa, 0x12c, 0x15e, 0x190, 0x1f4, 0x2bc],
      },
      dA,
      dB,
      {
        name: uf(0x39d),
        desc: uf(0x69b),
        type: cS[uf(0x6a5)],
        respawnTime: 0x9c4,
        size: 0xa,
        healthF: 0xa,
        damageF: 0xa,
        reflect: 0.9 * 0.8,
        reflectTiers: [0.95, 0x1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7][uf(0x20a)](
          (qQ) => qQ * 0.8
        ),
      },
      {
        name: uf(0x7d8),
        desc: uf(0x7b1),
        type: cS[uf(0x550)],
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
        name: uf(0x27d),
        desc: uf(0xdc3),
        type: cS[uf(0xe27)],
        size: 0x11,
        healthF: 0x258,
        damageF: 0x14,
        respawnTime: 0x2710,
        orbitSpeedFactor: 0.95,
        orbitSpeedFactorTiers: [0.94, 0.93, 0.92, 0.91, 0.9, 0.8, 0.7, 0.1],
      },
      {
        name: uf(0xb53),
        desc: uf(0x82f),
        type: cS[uf(0x573)],
        size: 0x9,
        healthF: 0x5,
        damageF: 0x8,
        respawnTime: 0x9c4,
        spinSpeed: 0.5 - 0.2,
        spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4][uf(0x20a)](
          (qQ) => qQ - 0.2
        ),
      },
      {
        name: uf(0x6a9),
        desc: uf(0xa61),
        type: cS[uf(0xa3f)],
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
        name: uf(0x784),
        desc: uf(0x37c),
        type: cS[uf(0x97e)],
        size: 0x10,
        healthF: 0xa,
        damageF: 0x23,
        respawnTime: 0x9c4,
        uiAngle: -Math["PI"] / 0x6,
        countTiers: [0x1, 0x1, 0x1, 0x1, 0x3, 0x3, 0x4, 0x6],
        isBoomerang: !![],
      },
      {
        name: uf(0x237),
        desc: uf(0x501),
        type: cS[uf(0xaeb)],
        size: 0xc,
        healthF: 0x28,
        damageF: 0x32,
        respawnTime: 0x9c4,
        isSwastika: !![],
      },
      {
        name: uf(0x5c4),
        desc: uf(0x455),
        type: cS[uf(0x93b)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0xa,
        respawnTime: 0x3e8,
        healthIncreaseF: 0x19,
      },
      {
        name: uf(0x618),
        desc: uf(0xac4),
        type: cS[uf(0x1e9)],
        size: 0xc,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        hpRegenPerSecF: 0x1,
      },
      dD(![]),
      dD(!![]),
      {
        name: uf(0x78d),
        desc: uf(0xb6a),
        type: cS[uf(0x871)],
        size: 0x6,
        healthF: 0x5,
        damageF: 0x14,
        respawnTime: 0x578,
        count: 0x4,
      },
      {
        name: uf(0xe37),
        desc: uf(0xe49),
        type: cS[uf(0x363)],
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
        name: uf(0x20c),
        desc: uf(0x232),
        type: cS[uf(0x911)],
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
        name: uf(0x524),
        desc: uf(0xe34),
        type: cS[uf(0x616)],
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
        spawn: uf(0xc75),
        spawnTiers: [
          uf(0xec2),
          uf(0xdfa),
          uf(0x279),
          uf(0x279),
          uf(0x8fd),
          uf(0xd2c),
          uf(0xd2c),
          uf(0x95e),
        ],
      },
      {
        name: uf(0xa0d),
        desc: uf(0xe90),
        type: cS[uf(0x60e)],
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
        spawn: uf(0x88a),
        spawnTiers: [
          uf(0x7ae),
          uf(0x7ae),
          uf(0x2cb),
          uf(0x459),
          uf(0x1e8),
          uf(0x3f9),
          uf(0x3f9),
          uf(0x432),
        ],
      },
      {
        name: uf(0x2e9),
        desc: uf(0x63b),
        type: cS[uf(0x616)],
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
        spawn: uf(0x4c2),
        spawnTiers: [
          uf(0x797),
          uf(0x797),
          uf(0xaad),
          uf(0xb04),
          uf(0xcd0),
          uf(0x3a6),
          uf(0x3a6),
          uf(0x4e1),
        ],
      },
      {
        name: uf(0x2ca),
        desc: uf(0x2db),
        type: cS[uf(0x663)],
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
        spawn: uf(0x9e9),
        spawnTiers: [
          uf(0x9e9),
          uf(0x30a),
          uf(0x5bc),
          uf(0x728),
          uf(0x75a),
          uf(0x877),
          uf(0x877),
          uf(0x7f6),
        ],
      },
      {
        name: uf(0x94b),
        desc: uf(0x396),
        type: cS[uf(0xce6)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0x1,
        respawnTime: 0xc80,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6270, 0x7530, 0x9c4, 0xe74, 0x29cc, 0x571c, 0x640, 0x320,
        ],
        spawn: uf(0x737),
        spawnTiers: [
          uf(0xb83),
          uf(0x235),
          uf(0x235),
          uf(0x93c),
          uf(0xad2),
          uf(0xcb1),
          uf(0xcb1),
          uf(0x402),
        ],
        dontDieOnSpawn: !![],
        uiAngle: -Math["PI"] / 0x6,
        petCount: 0x2,
        dontExpand: !![],
      },
      {
        name: uf(0x713),
        desc: uf(0x3e5),
        type: cS[uf(0x5bf)],
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
        name: uf(0x262),
        desc: uf(0xdc9),
        type: cS[uf(0x7e8)],
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
        name: uf(0x747),
        desc: uf(0x500),
        type: cS[uf(0x26e)],
        size: 0xe,
        healthF: 0x7,
        damageF: 0xa,
        respawnTime: 0x5dc,
        hpRegen75PerSecF: 0x3,
      },
      {
        name: uf(0xa9b),
        desc: uf(0xb43),
        type: cS[uf(0x65a)],
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
        name: uf(0x7b4),
        desc: uf(0xdc0),
        type: cS[uf(0x339)],
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
        name: uf(0xe7e),
        desc: uf(0x829),
        type: cS[uf(0xcb0)],
        size: 0xa,
        healthF: 0x1,
        damageF: 0x4,
        respawnTime: 0x32,
        uiAngle: -Math["PI"] / 0x4,
      },
      {
        name: uf(0x896),
        desc: uf(0x2c5),
        type: cS[uf(0xd3f)],
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
        name: uf(0x32a),
        desc: uf(0x600),
        ability: df[uf(0xdf7)],
        extraSpeed: 0x3,
        extraSpeedTiers: [0x6, 0x9, 0xc, 0xf, 0x12, 0x15, 0x18, 0x22],
      },
      {
        name: uf(0x268),
        desc: uf(0x519),
        type: cS[uf(0x5cf)],
        size: 0xf,
        healthF: 0x1f4,
        damageF: 0x1,
        respawnTime: 0x9c4,
        soakTime: 0x1,
        soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 0xf, 0x1e, 0x3c, 0x64],
      },
      {
        name: uf(0x7ff),
        desc: uf(0x72d),
        type: cS[uf(0xbf6)],
        size: 0xf,
        healthF: 0x78,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x2710,
        despawnTime: 0x7d0,
        fixAngle: !![],
      },
      {
        name: uf(0x2f5),
        desc: uf(0x889),
        ability: df[uf(0x215)],
        petHealF: 0x28,
      },
      {
        name: uf(0x3bf),
        desc: uf(0x91c),
        ability: df[uf(0xa8e)],
        shieldReload: 0x1,
        shieldReloadTiers: [1.5, 1.5, 0x2, 0x2, 2.5, 2.5, 2.5, 0x2],
        shieldHpLosePerSec: 0.5,
        shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
        misReflectDmgFactor: 0.05,
        misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6],
      },
      {
        name: uf(0x1c5),
        type: cS[uf(0x88b)],
        desc: uf(0x615),
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
        name: uf(0xae3),
        desc: uf(0xd06),
        type: cS[uf(0xd34)],
        size: 0x14,
        healthF: 0x1e,
        damageF: 0x0,
        respawnTime: 0x3e8,
        useTime: 0x4e20,
        useTimeTiers: [
          0x6590, 0x7d00, 0xa8c, 0xa8c, 0x27d8, 0x571c, 0x1f4, 0x1f4,
        ],
        spawn: uf(0xc71),
        spawnTiers: [
          uf(0x578),
          uf(0xc0f),
          uf(0xc0f),
          uf(0x8ce),
          uf(0xba6),
          uf(0x3bd),
          uf(0x3bd),
          uf(0xdd4),
        ],
        fixAngle: !![],
        dontExpand: !![],
      },
      {
        name: uf(0xcdc),
        desc: uf(0x385),
        type: cS[uf(0xe8c)],
        size: 0xa,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x7d0,
        useTime: 0x1f4,
        dontExpand: !![],
        extraSpeedTemp: 0x6 / 0x64,
        extraSpeedTempTiers: [0xc, 0x12, 0x18, 0x1e, 0x24, 0x2a, 0x30, 0x3c][
          uf(0x20a)
        ]((qQ) => qQ / 0x64),
        uiAngle: -Math["PI"] / 0x6,
      },
      {
        name: uf(0xec7),
        desc: uf(0xc89),
        type: cS[uf(0x2b1)],
        size: 0xf,
        healthF: 0xa,
        damageF: 0xf,
        respawnTime: 0x7d0,
        fixAngle: !![],
        uiAngle: -Math["PI"] / 0x6,
        armorF: 0xa,
      },
      {
        name: uf(0xb3f),
        desc: uf(0x63e),
        type: cS[uf(0x1f5)],
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
        name: uf(0x6fa),
        desc: uf(0x95d),
        type: cS[uf(0x580)],
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
        name: uf(0x44a),
        desc: uf(0xbb2),
        type: cS[uf(0x7ad)],
        healthF: 0x32,
        damageF: 0x19,
        size: 0xf,
        respawnTime: 0x5dc,
        twirl: 0x1,
        twirlTiers: [1.5, 0x2, 2.5, 0x3, 0x4, 0x5, 0x6, 0xa],
      },
      {
        name: uf(0x309),
        desc: uf(0x659),
        type: cS[uf(0x39e)],
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
        name: uf(0x204),
        desc: uf(0xd24),
        type: cS[uf(0x6b3)],
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
        consumeProjType: cS[uf(0x7e8)],
        consumeProjAngle: -Math["PI"] / 0x2,
        consumeProjHealthF: 0x2,
        consumeProjDamageF: 0x19,
      },
      {
        name: uf(0xd64),
        desc: uf(0x822),
        type: cS[uf(0x294)],
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
        name: uf(0x949),
        desc: uf(0xc19),
        type: cS[uf(0x228)],
        size: 0xf,
        healthF: 0xf,
        damageF: 0x2,
        respawnTime: 0x3e8,
        useTime: 0xbb8,
        useTimeTiers: [
          0xc80, 0xf3c, 0x11f8, 0x1644, 0xa8c, 0xa28, 0x1068, 0x4b0,
        ],
        spawn: uf(0x4c8),
        spawnTiers: [
          uf(0xa78),
          uf(0x452),
          uf(0x452),
          uf(0x47f),
          uf(0x2e4),
          uf(0x6fb),
          uf(0xcf6),
          uf(0x31e),
        ],
        dontDieOnSpawn: !![],
        petCount: 0x4,
        dontExpand: !![],
      },
      { name: uf(0x8f2), desc: uf(0xdae), ability: df[uf(0x29b)] },
      {
        name: uf(0x5d9),
        desc: uf(0xdd5),
        type: cS[uf(0x317)],
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
        name: uf(0x4ff),
        desc: uf(0x48c),
        type: cS[uf(0x5a7)],
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
        name: uf(0xe61),
        desc: uf(0xead),
        type: cS[uf(0x57b)],
        healthF: 0x1e,
        damageF: 0x0,
        damage: 0x0,
        size: 0xc,
        respawnTime: 0x3e8,
        useTime: 0x3e8,
        curePoisonF: 0x3,
      },
      {
        name: uf(0x260),
        desc: uf(0xa2f),
        type: cS[uf(0x4c9)],
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
        name: uf(0xcee),
        desc: uf(0x8ab),
        type: cS[uf(0x923)],
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
        name: uf(0xa63),
        desc: uf(0xbdf),
        type: cS[uf(0x982)],
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
        spawn: uf(0x2b6),
        spawnTiers: [
          uf(0xea7),
          uf(0x934),
          uf(0x934),
          uf(0x74e),
          uf(0x36a),
          uf(0x5ec),
          uf(0x5ec),
          uf(0xac2),
        ],
      },
      {
        name: uf(0x939),
        desc: uf(0x42d),
        type: cS[uf(0x3eb)],
        healthF: 0x64,
        damageF: 0x32,
        size: 0xc,
        respawnTime: 0x9c4,
        hpBasedDamage: !![],
      },
      {
        name: uf(0x676),
        desc: uf(0x7aa),
        type: cS[uf(0x41b)],
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
        name: uf(0x7f5),
        desc: uf(0x35b),
        type: cS[uf(0x751)],
        size: 0xe,
        healthF: 0xa,
        damageF: 0xa,
        respawnTime: 0x3e8,
        shieldRegenPerSecF: 2.5,
      },
      {
        name: uf(0x7f3),
        desc: uf(0xdfd),
        type: cS[uf(0xce0)],
        healthF: 0xa,
        damageF: 0x12,
        size: 0xc,
        respawnTime: 0x3e8,
        orbitDance: 0xa,
        orbitDanceTiers: dd((qQ) => 0xa + qQ * 0x28),
      },
      {
        name: uf(0xcb5),
        desc: uf(0x472),
        type: cS[uf(0x468)],
        size: 0x12,
        healthF: 0x5,
        damageF: 0x5,
        respawnTime: 0x320,
        flowerPoisonF: 0x3c,
      },
      {
        name: uf(0xc20),
        desc: uf(0x9ab),
        type: cS[uf(0x2ac)],
        size: 0x17,
        healthF: 0x1f4,
        damageF: 0x0,
        damage: 0x0,
        respawnTime: 0x1388,
        weight: 0x2,
        weightTiers: dd((qQ) => 0x2 + Math[uf(0x2d8)](1.7 ** qQ)),
      },
      {
        name: uf(0x748),
        desc: uf(0xb60),
        type: cS[uf(0x3a0)],
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
        name: uf(0x29d),
        desc: uf(0x9eb),
        type: cS[uf(0x4f5)],
        size: 0x12,
        healthF: 0x46,
        damageF: 0x1,
        fixAngle: !![],
        petSizeIncrease: 0.02,
        petSizeIncreaseTiers: dd((qQ) => 0.02 + qQ * 0.02),
        respawnTime: 0x7d0,
      },
      {
        name: uf(0x271),
        desc: uf(0x225),
        type: cS[uf(0xadc)],
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
        spawn: uf(0x824),
        spawnTiers: [
          uf(0x824),
          uf(0x5c8),
          uf(0x5b3),
          uf(0x966),
          uf(0x965),
          uf(0x892),
          uf(0x892),
          uf(0xdbf),
        ],
      },
      { name: uf(0x435), desc: uf(0x58a), ability: df[uf(0x978)] },
      {
        name: uf(0xa3e),
        desc: uf(0x27f),
        type: cS[uf(0x811)],
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
        qS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6][um(0x20a)](
          (qT) => qT * qR
        );
      return {
        name: qQ ? um(0x90e) : um(0x45f),
        desc:
          (qQ ? um(0xa27) : um(0x3b3)) +
          um(0xcab) +
          (qQ ? um(0x4b7) : "") +
          um(0xcf0),
        type: cS[qQ ? um(0x409) : um(0xac6)],
        size: 0x10,
        healthF: qQ ? 0xa : 0x96,
        damageF: 0x0,
        respawnTime: 0x1770,
        mobSizeChange: qS[0x0],
        mobSizeChangeTiers: qS[um(0xb26)](0x1),
      };
    }
    var dE = [0x28, 0x1e, 0x14, 0xa, 0x3, 0x2, 0x1, 0.51],
      dF = {},
      dG = dC[uf(0x4cf)],
      dH = da[uf(0x4cf)],
      dI = eP();
    for (let qQ = 0x0, qR = dC[uf(0x4cf)]; qQ < qR; qQ++) {
      const qS = dC[qQ];
      (qS[uf(0xb21)] = !![]), (qS["id"] = qQ);
      if (!qS[uf(0x786)]) qS[uf(0x786)] = qS[uf(0xc25)];
      dK(qS), (qS[uf(0x266)] = 0x0), (qS[uf(0x793)] = qQ);
      let qT = qS;
      for (let qU = 0x1; qU < dH; qU++) {
        const qV = dO(qS);
        (qV[uf(0xb9c)] = qS[uf(0xb9c)] + qU),
          (qV[uf(0xc25)] = qS[uf(0xc25)] + "_" + qV[uf(0xb9c)]),
          (qV[uf(0x266)] = qU),
          (qT[uf(0xa02)] = qV),
          (qT = qV),
          dJ(qS, qV),
          dK(qV),
          (qV["id"] = dC[uf(0x4cf)]),
          (dC[qV["id"]] = qV);
      }
    }
    function dJ(qW, qX) {
      const un = uf,
        qY = qX[un(0xb9c)] - qW[un(0xb9c)] - 0x1;
      for (let qZ in qW) {
        const r0 = qW[qZ + un(0x97c)];
        Array[un(0x59e)](r0) && (qX[qZ] = r0[qY]);
      }
    }
    function dK(qW) {
      const uo = uf;
      dF[qW[uo(0xc25)]] = qW;
      for (let qX in di) {
        qW[qX] === void 0x0 && (qW[qX] = di[qX]);
      }
      qW[uo(0x807)] === df[uo(0x672)] &&
        (qW[uo(0xbdb)] = cW[qW[uo(0xb9c)] + 0x1] / 0x64),
        (qW[uo(0x2d7)] =
          qW[uo(0x544)] > 0x0
            ? dg(qW[uo(0xb9c)], qW[uo(0x544)])
            : qW[uo(0x2d7)]),
        (qW[uo(0x530)] =
          qW[uo(0x3c2)] > 0x0
            ? dg(qW[uo(0xb9c)], qW[uo(0x3c2)])
            : qW[uo(0x530)]),
        (qW[uo(0xeb4)] = dg(qW[uo(0xb9c)], qW[uo(0xd63)])),
        (qW[uo(0xca7)] = dg(qW[uo(0xb9c)], qW[uo(0x2b8)])),
        (qW[uo(0xa3b)] = dg(qW[uo(0xb9c)], qW[uo(0x979)])),
        (qW[uo(0x782)] = dg(qW[uo(0xb9c)], qW[uo(0x611)])),
        (qW[uo(0xb80)] = dg(qW[uo(0xb9c)], qW[uo(0x7fa)])),
        (qW[uo(0x53c)] = dg(qW[uo(0xb9c)], qW[uo(0x503)])),
        (qW[uo(0xbf5)] = dg(qW[uo(0xb9c)], qW[uo(0xb8a)])),
        (qW[uo(0xc6d)] = dg(qW[uo(0xb9c)], qW[uo(0x8ea)])),
        qW[uo(0x34c)] &&
          ((qW[uo(0x6f5)] = dg(qW[uo(0xb9c)], qW[uo(0x738)])),
          (qW[uo(0xa65)] = dg(qW[uo(0xb9c)], qW[uo(0xcc9)]))),
        qW[uo(0xdcc)] > 0x0
          ? (qW[uo(0x846)] = dg(qW[uo(0xb9c)], qW[uo(0xdcc)]))
          : (qW[uo(0x846)] = 0x0),
        (qW[uo(0xa72)] = qW[uo(0x4b3)]
          ? dg(qW[uo(0xb9c)], qW[uo(0x7fc)])
          : 0x0),
        (qW[uo(0x604)] = qW[uo(0x58d)]
          ? dg(qW[uo(0xb9c)], qW[uo(0xd52)])
          : 0x0),
        (qW[uo(0xd62)] = dg(qW[uo(0xb9c)], qW[uo(0x421)])),
        dI[qW[uo(0xb9c)]][uo(0x9ee)](qW);
    }
    var dL = [0x1, 1.25, 1.5, 0x2, 0x5, 0xa, 0x32, 0xc8, 0x3e8],
      dM = [0x1, 1.2, 1.5, 1.9, 0x3, 0x5, 0x8, 0xc, 0x11],
      dN = cV(uf(0x466));
    function dO(qW) {
      const up = uf;
      return JSON[up(0x55c)](JSON[up(0xab8)](qW));
    }
    const dP = {};
    (dP[uf(0xc25)] = uf(0xc84)),
      (dP[uf(0xb66)] = uf(0xab9)),
      (dP[uf(0x2dc)] = uf(0xdfe)),
      (dP[uf(0xb9c)] = 0x0),
      (dP[uf(0x544)] = 0x64),
      (dP[uf(0x3c2)] = 0x1e),
      (dP[uf(0x8c9)] = 0x32),
      (dP[uf(0x55d)] = dN[uf(0xc1e)]),
      (dP[uf(0x773)] = ![]),
      (dP[uf(0xb99)] = !![]),
      (dP[uf(0x4b3)] = ![]),
      (dP[uf(0x7fc)] = 0x0),
      (dP[uf(0xa72)] = 0x0),
      (dP[uf(0x926)] = ![]),
      (dP[uf(0x929)] = ![]),
      (dP[uf(0x338)] = 0x1),
      (dP[uf(0x6ea)] = cS[uf(0x681)]),
      (dP[uf(0x981)] = 0x0),
      (dP[uf(0x6f2)] = 0x0),
      (dP[uf(0x40d)] = 0.5),
      (dP[uf(0x6d4)] = 0x0),
      (dP[uf(0x54a)] = 0x1e),
      (dP[uf(0x258)] = 0x0),
      (dP[uf(0xbcd)] = ![]),
      (dP[uf(0xd52)] = 0x0),
      (dP[uf(0x491)] = 0x0),
      (dP[uf(0x37f)] = 11.5),
      (dP[uf(0x24c)] = 0x4),
      (dP[uf(0x49b)] = !![]),
      (dP[uf(0x73e)] = 0x0),
      (dP[uf(0x603)] = 0x0),
      (dP[uf(0x4a3)] = 0x1),
      (dP[uf(0xd20)] = 0x0),
      (dP[uf(0xe10)] = 0x0),
      (dP[uf(0x249)] = 0x0),
      (dP[uf(0x5b7)] = 0x0),
      (dP[uf(0x640)] = 0x1);
    var dQ = dP;
    const dR = {};
    (dR[uf(0xc25)] = uf(0xe08)),
      (dR[uf(0xb66)] = uf(0x5c5)),
      (dR[uf(0x2dc)] = uf(0x330)),
      (dR[uf(0x544)] = 0x2ee),
      (dR[uf(0x3c2)] = 0xa),
      (dR[uf(0x8c9)] = 0x32),
      (dR[uf(0x926)] = !![]),
      (dR[uf(0x929)] = !![]),
      (dR[uf(0x338)] = 0.05),
      (dR[uf(0x37f)] = 0x5),
      (dR[uf(0xbb8)] = !![]),
      (dR[uf(0x96b)] = [[uf(0x88a), 0x3]]),
      (dR[uf(0x439)] = [
        [uf(0xbb1), 0x1],
        [uf(0x88a), 0x2],
        [uf(0x5cd), 0x2],
        [uf(0x38f), 0x1],
      ]),
      (dR[uf(0xa82)] = [[uf(0x434), "f"]]);
    const dS = {};
    (dS[uf(0xc25)] = uf(0xbb1)),
      (dS[uf(0xb66)] = uf(0x9ba)),
      (dS[uf(0x2dc)] = uf(0x3e0)),
      (dS[uf(0x544)] = 0x1f4),
      (dS[uf(0x3c2)] = 0xa),
      (dS[uf(0x8c9)] = 0x28),
      (dS[uf(0xbb8)] = !![]),
      (dS[uf(0x773)] = !![]),
      (dS[uf(0xa82)] = [
        [uf(0x784), "E"],
        [uf(0x90e), "G"],
        [uf(0xa0d), "A"],
      ]);
    const dT = {};
    (dT[uf(0xc25)] = uf(0x88a)),
      (dT[uf(0xb66)] = uf(0x688)),
      (dT[uf(0x2dc)] = uf(0xcfe)),
      (dT[uf(0x544)] = 0x64),
      (dT[uf(0x3c2)] = 0xa),
      (dT[uf(0x8c9)] = 0x1c),
      (dT[uf(0x773)] = !![]),
      (dT[uf(0xa82)] = [[uf(0x784), "I"]]);
    const dU = {};
    (dU[uf(0xc25)] = uf(0x5cd)),
      (dU[uf(0xb66)] = uf(0x6a3)),
      (dU[uf(0x2dc)] = uf(0x948)),
      (dU[uf(0x544)] = 62.5),
      (dU[uf(0x3c2)] = 0xa),
      (dU[uf(0x8c9)] = 0x1c),
      (dU[uf(0xa82)] = [[uf(0x618), "H"]]);
    const dV = {};
    (dV[uf(0xc25)] = uf(0x38f)),
      (dV[uf(0xb66)] = uf(0xe70)),
      (dV[uf(0x2dc)] = uf(0x906)),
      (dV[uf(0x544)] = 0x19),
      (dV[uf(0x3c2)] = 0xa),
      (dV[uf(0x8c9)] = 0x19),
      (dV[uf(0x773)] = ![]),
      (dV[uf(0xb99)] = ![]),
      (dV[uf(0xa82)] = [
        [uf(0x9c9), "F"],
        [uf(0x618), "F"],
        [uf(0x45f), "G"],
        [uf(0xe7e), "F"],
      ]);
    var dW = [dR, dS, dT, dU, dV];
    function dX() {
      const uq = uf,
        qW = dO(dW);
      for (let qX = 0x0; qX < qW[uq(0x4cf)]; qX++) {
        const qY = qW[qX];
        (qY[uq(0x2dc)] += uq(0xb3f)),
          qY[uq(0xc25)] === uq(0xe08) &&
            (qY[uq(0xa82)] = [
              [uq(0xc6c), "D"],
              [uq(0x713), "E"],
            ]),
          (qY[uq(0xc25)] = dY(qY[uq(0xc25)])),
          (qY[uq(0xb66)] = dY(qY[uq(0xb66)])),
          (qY[uq(0x3c2)] *= 0x2),
          qY[uq(0x96b)] &&
            qY[uq(0x96b)][uq(0xbed)]((qZ) => {
              return (qZ[0x0] = dY(qZ[0x0])), qZ;
            }),
          qY[uq(0x439)] &&
            qY[uq(0x439)][uq(0xbed)]((qZ) => {
              return (qZ[0x0] = dY(qZ[0x0])), qZ;
            });
      }
      return qW;
    }
    function dY(qW) {
      const ur = uf;
      return qW[ur(0x6d2)](/Ant/g, ur(0x776))[ur(0x6d2)](/ant/g, ur(0x4b1));
    }
    const dZ = {};
    (dZ[uf(0xc25)] = uf(0x34f)),
      (dZ[uf(0xb66)] = uf(0x7a0)),
      (dZ[uf(0x2dc)] = uf(0xeb0)),
      (dZ[uf(0x544)] = 37.5),
      (dZ[uf(0x3c2)] = 0x32),
      (dZ[uf(0x8c9)] = 0x28),
      (dZ[uf(0xa82)] = [
        [uf(0xa09), "F"],
        [uf(0x6a9), "I"],
      ]),
      (dZ[uf(0x73e)] = 0x4),
      (dZ[uf(0x603)] = 0x4);
    const e0 = {};
    (e0[uf(0xc25)] = uf(0x5c4)),
      (e0[uf(0xb66)] = uf(0xcd2)),
      (e0[uf(0x2dc)] = uf(0x9f3)),
      (e0[uf(0x544)] = 0x5e),
      (e0[uf(0x3c2)] = 0x5),
      (e0[uf(0x338)] = 0.05),
      (e0[uf(0x8c9)] = 0x3c),
      (e0[uf(0x926)] = !![]),
      (e0[uf(0xa82)] = [[uf(0x5c4), "h"]]);
    const e1 = {};
    (e1[uf(0xc25)] = uf(0x824)),
      (e1[uf(0xb66)] = uf(0xc83)),
      (e1[uf(0x2dc)] = uf(0x3b7)),
      (e1[uf(0x544)] = 0x4b),
      (e1[uf(0x3c2)] = 0xa),
      (e1[uf(0x338)] = 0.05),
      (e1[uf(0x926)] = !![]),
      (e1[uf(0x863)] = 1.25),
      (e1[uf(0xa82)] = [
        [uf(0x824), "h"],
        [uf(0x27d), "J"],
        [uf(0x271), "K"],
      ]);
    const e2 = {};
    (e2[uf(0xc25)] = uf(0x4c2)),
      (e2[uf(0xb66)] = uf(0xe60)),
      (e2[uf(0x2dc)] = uf(0x694)),
      (e2[uf(0x544)] = 62.5),
      (e2[uf(0x3c2)] = 0x32),
      (e2[uf(0x773)] = !![]),
      (e2[uf(0x8c9)] = 0x28),
      (e2[uf(0xa82)] = [
        [uf(0xb6b), "f"],
        [uf(0x798), "I"],
        [uf(0x2e9), "K"],
      ]),
      (e2[uf(0x6ea)] = cS[uf(0x605)]),
      (e2[uf(0x6f2)] = 0xa),
      (e2[uf(0x981)] = 0x5),
      (e2[uf(0x54a)] = 0x26),
      (e2[uf(0x40d)] = 0.375 / 1.1),
      (e2[uf(0x6d4)] = 0.75),
      (e2[uf(0x55d)] = dN[uf(0x694)]);
    const e3 = {};
    (e3[uf(0xc25)] = uf(0x86c)),
      (e3[uf(0xb66)] = uf(0xd3e)),
      (e3[uf(0x2dc)] = uf(0x344)),
      (e3[uf(0x544)] = 87.5),
      (e3[uf(0x3c2)] = 0xa),
      (e3[uf(0xa82)] = [
        [uf(0x9c9), "f"],
        [uf(0xe2d), "f"],
      ]),
      (e3[uf(0x73e)] = 0x5),
      (e3[uf(0x603)] = 0x5);
    const e4 = {};
    (e4[uf(0xc25)] = uf(0xc75)),
      (e4[uf(0xb66)] = uf(0xa89)),
      (e4[uf(0x2dc)] = uf(0xdfe)),
      (e4[uf(0x544)] = 0x64),
      (e4[uf(0x3c2)] = 0x1e),
      (e4[uf(0x773)] = !![]),
      (e4[uf(0xa82)] = [[uf(0x524), "F"]]),
      (e4[uf(0x73e)] = 0x5),
      (e4[uf(0x603)] = 0x5);
    const e5 = {};
    (e5[uf(0xc25)] = uf(0x2b6)),
      (e5[uf(0xb66)] = uf(0x1ff)),
      (e5[uf(0x2dc)] = uf(0x963)),
      (e5[uf(0x544)] = 62.5),
      (e5[uf(0x3c2)] = 0xf),
      (e5[uf(0x4b3)] = !![]),
      (e5[uf(0x7fc)] = 0xf),
      (e5[uf(0x8c9)] = 0x23),
      (e5[uf(0x773)] = !![]),
      (e5[uf(0xa82)] = [
        [uf(0xb53), "F"],
        [uf(0x280), "F"],
        [uf(0x852), "L"],
        [uf(0x32a), "G"],
      ]);
    const e6 = {};
    (e6[uf(0xc25)] = uf(0x50b)),
      (e6[uf(0xb66)] = uf(0x245)),
      (e6[uf(0x2dc)] = uf(0x741)),
      (e6[uf(0x544)] = 0x64),
      (e6[uf(0x3c2)] = 0xf),
      (e6[uf(0x4b3)] = !![]),
      (e6[uf(0x7fc)] = 0xa),
      (e6[uf(0x8c9)] = 0x2f),
      (e6[uf(0x773)] = !![]),
      (e6[uf(0xa82)] = [
        [uf(0xccd), "F"],
        [uf(0x896), "F"],
      ]),
      (e6[uf(0x6ea)] = cS[uf(0x9a1)]),
      (e6[uf(0x6f2)] = 0x3),
      (e6[uf(0x981)] = 0x5),
      (e6[uf(0x258)] = 0x7),
      (e6[uf(0x54a)] = 0x2b),
      (e6[uf(0x40d)] = 0.21),
      (e6[uf(0x6d4)] = -0.31),
      (e6[uf(0x55d)] = dN[uf(0x5ba)]);
    const e7 = {};
    (e7[uf(0xc25)] = uf(0x9e9)),
      (e7[uf(0xb66)] = uf(0xa29)),
      (e7[uf(0x2dc)] = uf(0xa4f)),
      (e7[uf(0x544)] = 0x15e),
      (e7[uf(0x3c2)] = 0x28),
      (e7[uf(0x8c9)] = 0x2d),
      (e7[uf(0x773)] = !![]),
      (e7[uf(0xbb8)] = !![]),
      (e7[uf(0xa82)] = [
        [uf(0x329), "F"],
        [uf(0x1eb), "G"],
        [uf(0x237), "H"],
        [uf(0x2ca), "J"],
      ]);
    const e8 = {};
    (e8[uf(0xc25)] = uf(0x7c7)),
      (e8[uf(0xb66)] = uf(0xc00)),
      (e8[uf(0x2dc)] = uf(0x562)),
      (e8[uf(0x544)] = 0x7d),
      (e8[uf(0x3c2)] = 0x19),
      (e8[uf(0x773)] = !![]),
      (e8[uf(0xbcd)] = !![]),
      (e8[uf(0xd52)] = 0x5),
      (e8[uf(0x491)] = 0x2),
      (e8[uf(0xc1d)] = [0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa]),
      (e8[uf(0x24c)] = 0x4),
      (e8[uf(0x37f)] = 0x6),
      (e8[uf(0xa82)] = [[uf(0x8a0), "F"]]);
    const e9 = {};
    (e9[uf(0xc25)] = uf(0x518)),
      (e9[uf(0xb66)] = uf(0xaae)),
      (e9[uf(0x2dc)] = uf(0xc2b)),
      (e9[uf(0x544)] = 0.5),
      (e9[uf(0x3c2)] = 0x5),
      (e9[uf(0x773)] = ![]),
      (e9[uf(0xb99)] = ![]),
      (e9[uf(0x24c)] = 0x1),
      (e9[uf(0xa82)] = [[uf(0x518), "F"]]);
    const ea = {};
    (ea[uf(0xc25)] = uf(0x631)),
      (ea[uf(0xb66)] = uf(0xb39)),
      (ea[uf(0x2dc)] = uf(0xe02)),
      (ea[uf(0x544)] = 0x19),
      (ea[uf(0x3c2)] = 0xa),
      (ea[uf(0x8c9)] = 0x28),
      (ea[uf(0x2a8)] = cS[uf(0xc82)]),
      (ea[uf(0xa82)] = [
        [uf(0x618), "J"],
        [uf(0x85d), "J"],
      ]);
    const eb = {};
    (eb[uf(0xc25)] = uf(0x39a)),
      (eb[uf(0xb66)] = uf(0x861)),
      (eb[uf(0x2dc)] = uf(0x564)),
      (eb[uf(0x544)] = 0x19),
      (eb[uf(0x3c2)] = 0xa),
      (eb[uf(0x8c9)] = 0x28),
      (eb[uf(0x2a8)] = cS[uf(0xc04)]),
      (eb[uf(0x773)] = !![]),
      (eb[uf(0xa82)] = [
        [uf(0xccd), "J"],
        [uf(0x7d8), "J"],
      ]);
    const ec = {};
    (ec[uf(0xc25)] = uf(0x70e)),
      (ec[uf(0xb66)] = uf(0x932)),
      (ec[uf(0x2dc)] = uf(0xc77)),
      (ec[uf(0x544)] = 0x19),
      (ec[uf(0x3c2)] = 0xa),
      (ec[uf(0x8c9)] = 0x28),
      (ec[uf(0x2a8)] = cS[uf(0x5a3)]),
      (ec[uf(0xb99)] = ![]),
      (ec[uf(0xa82)] = [
        [uf(0x78d), "J"],
        [uf(0x39d), "H"],
        [uf(0xe37), "J"],
      ]),
      (ec[uf(0x24c)] = 0x17),
      (ec[uf(0x37f)] = 0x17 * 0.75);
    const ed = {};
    (ed[uf(0xc25)] = uf(0x1fd)),
      (ed[uf(0xb66)] = uf(0xbb0)),
      (ed[uf(0x2dc)] = uf(0xc2c)),
      (ed[uf(0x544)] = 87.5),
      (ed[uf(0x3c2)] = 0xa),
      (ed[uf(0xa82)] = [
        [uf(0x20c), "F"],
        [uf(0xecb), "I"],
      ]),
      (ed[uf(0x73e)] = 0x5),
      (ed[uf(0x603)] = 0x5);
    const ee = {};
    (ee[uf(0xc25)] = uf(0xc5f)),
      (ee[uf(0xb66)] = uf(0x83a)),
      (ee[uf(0x2dc)] = uf(0xc9a)),
      (ee[uf(0x544)] = 87.5),
      (ee[uf(0x3c2)] = 0xa),
      (ee[uf(0xa82)] = [
        [uf(0xe2d), "A"],
        [uf(0x20c), "A"],
      ]),
      (ee[uf(0x73e)] = 0x5),
      (ee[uf(0x603)] = 0x5);
    const ef = {};
    (ef[uf(0xc25)] = uf(0x1fb)),
      (ef[uf(0xb66)] = uf(0x379)),
      (ef[uf(0x2dc)] = uf(0x8fb)),
      (ef[uf(0x544)] = 0x32),
      (ef[uf(0x3c2)] = 0xa),
      (ef[uf(0x338)] = 0.05),
      (ef[uf(0x8c9)] = 0x3c),
      (ef[uf(0x926)] = !![]),
      (ef[uf(0xa82)] = [
        [uf(0xb89), "E"],
        [uf(0xcdc), "F"],
        [uf(0xd64), "F"],
      ]);
    const eg = {};
    (eg[uf(0xc25)] = uf(0x737)),
      (eg[uf(0xb66)] = uf(0x732)),
      (eg[uf(0x2dc)] = uf(0x845)),
      (eg[uf(0x544)] = 0x7d),
      (eg[uf(0x3c2)] = 0x28),
      (eg[uf(0x8c9)] = 0x32),
      (eg[uf(0x773)] = ![]),
      (eg[uf(0xb99)] = ![]),
      (eg[uf(0x55d)] = dN[uf(0x845)]),
      (eg[uf(0x24c)] = 0xe),
      (eg[uf(0x37f)] = 0xb),
      (eg[uf(0x4a3)] = 2.2),
      (eg[uf(0xa82)] = [
        [uf(0x94b), "J"],
        [uf(0x78d), "H"],
      ]);
    const eh = {};
    (eh[uf(0xc25)] = uf(0x7e2)),
      (eh[uf(0xb66)] = uf(0x1c8)),
      (eh[uf(0x2dc)] = uf(0xb2f)),
      (eh[uf(0x544)] = 0x7d),
      (eh[uf(0x3c2)] = 0x28),
      (eh[uf(0x8c9)] = null),
      (eh[uf(0x773)] = !![]),
      (eh[uf(0x6f0)] = !![]),
      (eh[uf(0xa82)] = [
        [uf(0x9b2), "D"],
        [uf(0x262), "E"],
        [uf(0x204), "E"],
      ]),
      (eh[uf(0x8c9)] = 0x32),
      (eh[uf(0xc39)] = 0x32),
      (eh[uf(0x5fd)] = !![]),
      (eh[uf(0xd20)] = -Math["PI"] / 0x2),
      (eh[uf(0x6ea)] = cS[uf(0x7e8)]),
      (eh[uf(0x6f2)] = 0x3),
      (eh[uf(0x981)] = 0x3),
      (eh[uf(0x54a)] = 0x21),
      (eh[uf(0x40d)] = 0.32),
      (eh[uf(0x6d4)] = 0.4),
      (eh[uf(0x55d)] = dN[uf(0x694)]);
    const ei = {};
    (ei[uf(0xc25)] = uf(0x747)),
      (ei[uf(0xb66)] = uf(0xb44)),
      (ei[uf(0x2dc)] = uf(0x621)),
      (ei[uf(0x544)] = 0x96),
      (ei[uf(0x3c2)] = 0x14),
      (ei[uf(0x773)] = !![]),
      (ei[uf(0xe10)] = 0.5),
      (ei[uf(0xa82)] = [
        [uf(0x747), "D"],
        [uf(0x39d), "J"],
        [uf(0x78d), "J"],
      ]);
    const ej = {};
    (ej[uf(0xc25)] = uf(0xa9b)),
      (ej[uf(0xb66)] = uf(0x47a)),
      (ej[uf(0x2dc)] = uf(0x5c6)),
      (ej[uf(0x544)] = 0x19),
      (ej[uf(0x3c2)] = 0xf),
      (ej[uf(0x338)] = 0.05),
      (ej[uf(0x8c9)] = 0x37),
      (ej[uf(0x926)] = !![]),
      (ej[uf(0xa82)] = [[uf(0xa9b), "h"]]),
      (ej[uf(0x6ea)] = cS[uf(0x65a)]),
      (ej[uf(0x249)] = 0x9),
      (ej[uf(0x54a)] = 0x28),
      (ej[uf(0x6f2)] = 0xf),
      (ej[uf(0x981)] = 2.5),
      (ej[uf(0x54a)] = 0x21),
      (ej[uf(0x40d)] = 0.32),
      (ej[uf(0x6d4)] = 1.8),
      (ej[uf(0x5b7)] = 0x14);
    const ek = {};
    (ek[uf(0xc25)] = uf(0x7b4)),
      (ek[uf(0xb66)] = uf(0x63f)),
      (ek[uf(0x2dc)] = uf(0x2b3)),
      (ek[uf(0x544)] = 0xe1),
      (ek[uf(0x3c2)] = 0xa),
      (ek[uf(0x8c9)] = 0x32),
      (ek[uf(0xa82)] = [
        [uf(0x7b4), "H"],
        [uf(0xc6c), "L"],
      ]),
      (ek[uf(0x6f0)] = !![]),
      (ek[uf(0xbb5)] = !![]),
      (ek[uf(0x37f)] = 0x23);
    const em = {};
    (em[uf(0xc25)] = uf(0x750)),
      (em[uf(0xb66)] = uf(0xa14)),
      (em[uf(0x2dc)] = uf(0xa77)),
      (em[uf(0x544)] = 0x96),
      (em[uf(0x3c2)] = 0x19),
      (em[uf(0x8c9)] = 0x2f),
      (em[uf(0x773)] = !![]),
      (em[uf(0xa82)] = [[uf(0x78d), "J"]]),
      (em[uf(0x6ea)] = null),
      (em[uf(0x55d)] = dN[uf(0x5ba)]);
    const en = {};
    (en[uf(0xc25)] = uf(0x6d5)),
      (en[uf(0xb66)] = uf(0x7a7)),
      (en[uf(0x2dc)] = uf(0x535)),
      (en[uf(0x544)] = 0x64),
      (en[uf(0x3c2)] = 0x1e),
      (en[uf(0x8c9)] = 0x1e),
      (en[uf(0x773)] = !![]),
      (en[uf(0xbf8)] = uf(0x713)),
      (en[uf(0xa82)] = [
        [uf(0x713), "F"],
        [uf(0x32a), "E"],
        [uf(0x1c5), "D"],
        [uf(0x435), "E"],
      ]);
    const eo = {};
    (eo[uf(0xc25)] = uf(0x268)),
      (eo[uf(0xb66)] = uf(0xd46)),
      (eo[uf(0x2dc)] = uf(0x410)),
      (eo[uf(0x544)] = 0x64),
      (eo[uf(0x3c2)] = 0xa),
      (eo[uf(0x8c9)] = 0x3c),
      (eo[uf(0x926)] = !![]),
      (eo[uf(0x338)] = 0.05),
      (eo[uf(0xa82)] = [[uf(0x268), "D"]]);
    const ep = {};
    (ep[uf(0xc25)] = uf(0xa7c)),
      (ep[uf(0xb66)] = uf(0xce5)),
      (ep[uf(0x2dc)] = uf(0xaf9)),
      (ep[uf(0x544)] = 0x64),
      (ep[uf(0x3c2)] = 0x23),
      (ep[uf(0x773)] = !![]),
      (ep[uf(0xa82)] = [
        [uf(0x7ff), "E"],
        [uf(0x260), "D"],
      ]);
    const eq = {};
    (eq[uf(0xc25)] = uf(0xc37)),
      (eq[uf(0xb66)] = uf(0x6fc)),
      (eq[uf(0x2dc)] = uf(0x7cb)),
      (eq[uf(0x544)] = 0xc8),
      (eq[uf(0x3c2)] = 0x23),
      (eq[uf(0x8c9)] = 0x23),
      (eq[uf(0x773)] = !![]),
      (eq[uf(0x603)] = 0x5),
      (eq[uf(0xa82)] = [
        [uf(0x2f5), "F"],
        [uf(0x3bf), "D"],
        [uf(0xe61), "E"],
      ]);
    const er = {};
    (er[uf(0xc25)] = uf(0xc71)),
      (er[uf(0xb66)] = uf(0x93e)),
      (er[uf(0x2dc)] = uf(0x558)),
      (er[uf(0x544)] = 0xc8),
      (er[uf(0x3c2)] = 0x14),
      (er[uf(0x8c9)] = 0x28),
      (er[uf(0x773)] = !![]),
      (er[uf(0xa82)] = [
        [uf(0xae3), "E"],
        [uf(0xec7), "D"],
        [uf(0xb3f), "F"],
        [uf(0x6fa), "F"],
      ]),
      (er[uf(0xe09)] = !![]),
      (er[uf(0xdf0)] = 0xbb8),
      (er[uf(0xdd1)] = 0.3);
    const es = {};
    (es[uf(0xc25)] = uf(0x44a)),
      (es[uf(0xb66)] = uf(0x99f)),
      (es[uf(0x2dc)] = uf(0x697)),
      (es[uf(0x544)] = 0x78),
      (es[uf(0x3c2)] = 0x1e),
      (es[uf(0xbb5)] = !![]),
      (es[uf(0x37f)] = 0xf),
      (es[uf(0x24c)] = 0x5),
      (es[uf(0xa82)] = [
        [uf(0x44a), "F"],
        [uf(0x309), "E"],
        [uf(0x4ff), "D"],
      ]),
      (es[uf(0x603)] = 0x3);
    const et = {};
    (et[uf(0xc25)] = uf(0x949)),
      (et[uf(0xb66)] = uf(0x4de)),
      (et[uf(0x2dc)] = uf(0x8d4)),
      (et[uf(0x544)] = 0x78),
      (et[uf(0x3c2)] = 0x23),
      (et[uf(0x8c9)] = 0x32),
      (et[uf(0x773)] = !![]),
      (et[uf(0xa17)] = !![]),
      (et[uf(0xa82)] = [
        [uf(0x949), "E"],
        [uf(0xd64), "F"],
      ]),
      (et[uf(0x96b)] = [[uf(0x4c8), 0x1]]),
      (et[uf(0x439)] = [[uf(0x4c8), 0x2]]),
      (et[uf(0x46c)] = !![]);
    const eu = {};
    (eu[uf(0xc25)] = uf(0x4c8)),
      (eu[uf(0xb66)] = uf(0x574)),
      (eu[uf(0x2dc)] = uf(0xc50)),
      (eu[uf(0x544)] = 0x96),
      (eu[uf(0x3c2)] = 0.1),
      (eu[uf(0x8c9)] = 0x28),
      (eu[uf(0x24c)] = 0xe),
      (eu[uf(0x37f)] = 11.6),
      (eu[uf(0x773)] = !![]),
      (eu[uf(0xa17)] = !![]),
      (eu[uf(0x533)] = !![]),
      (eu[uf(0x55d)] = dN[uf(0x845)]),
      (eu[uf(0x489)] = 0xa),
      (eu[uf(0xa82)] = [[uf(0x8f2), "G"]]),
      (eu[uf(0x640)] = 0.5);
    const ev = {};
    (ev[uf(0xc25)] = uf(0x313)),
      (ev[uf(0xb66)] = uf(0x7e7)),
      (ev[uf(0x2dc)] = uf(0x67e)),
      (ev[uf(0x544)] = 0x1f4),
      (ev[uf(0x3c2)] = 0x28),
      (ev[uf(0x338)] = 0.05),
      (ev[uf(0x8c9)] = 0x32),
      (ev[uf(0x926)] = !![]),
      (ev[uf(0x37f)] = 0x5),
      (ev[uf(0x929)] = !![]),
      (ev[uf(0xbb8)] = !![]),
      (ev[uf(0xa82)] = [
        [uf(0x5d9), "F"],
        [uf(0x2e9), "C"],
      ]),
      (ev[uf(0x96b)] = [
        [uf(0x34f), 0x2],
        [uf(0x4c2), 0x1],
      ]),
      (ev[uf(0x439)] = [
        [uf(0x34f), 0x4],
        [uf(0x4c2), 0x2],
      ]);
    const ew = {};
    (ew[uf(0xc25)] = uf(0xcee)),
      (ew[uf(0xb66)] = uf(0x2fb)),
      (ew[uf(0x2dc)] = uf(0x8c4)),
      (ew[uf(0x544)] = 0x50),
      (ew[uf(0x3c2)] = 0x28),
      (ew[uf(0x24c)] = 0x2),
      (ew[uf(0x37f)] = 0x6),
      (ew[uf(0x6f0)] = !![]),
      (ew[uf(0xa82)] = [[uf(0xcee), "F"]]);
    const ex = {};
    (ex[uf(0xc25)] = uf(0xa93)),
      (ex[uf(0xb66)] = uf(0x331)),
      (ex[uf(0x2dc)] = uf(0x8c0)),
      (ex[uf(0x544)] = 0x1f4),
      (ex[uf(0x3c2)] = 0x28),
      (ex[uf(0x338)] = 0.05),
      (ex[uf(0x8c9)] = 0x46),
      (ex[uf(0x37f)] = 0x5),
      (ex[uf(0x926)] = !![]),
      (ex[uf(0x929)] = !![]),
      (ex[uf(0xbb8)] = !![]),
      (ex[uf(0xa82)] = [
        [uf(0xa63), "A"],
        [uf(0x280), "E"],
      ]),
      (ex[uf(0x96b)] = [[uf(0x2b6), 0x2]]),
      (ex[uf(0x439)] = [
        [uf(0x2b6), 0x3],
        [uf(0x6d5), 0x2],
      ]);
    const ey = {};
    (ey[uf(0xc25)] = uf(0xebd)),
      (ey[uf(0xb66)] = uf(0x7d7)),
      (ey[uf(0x2dc)] = uf(0x804)),
      (ey[uf(0x8c9)] = 0x28),
      (ey[uf(0x544)] = 0x64),
      (ey[uf(0x3c2)] = 0xa),
      (ey[uf(0x338)] = 0.05),
      (ey[uf(0x926)] = !![]),
      (ey[uf(0x73e)] = 0x1),
      (ey[uf(0x603)] = 0x1),
      (ey[uf(0xa82)] = [
        [uf(0x3bf), "G"],
        [uf(0x39d), "F"],
        [uf(0x939), "F"],
      ]);
    const ez = {};
    (ez[uf(0xc25)] = uf(0x51c)),
      (ez[uf(0xb66)] = uf(0x677)),
      (ez[uf(0x2dc)] = uf(0x372)),
      (ez[uf(0x544)] = 0x3c),
      (ez[uf(0x3c2)] = 0x28),
      (ez[uf(0x8c9)] = 0x32),
      (ez[uf(0x773)] = ![]),
      (ez[uf(0xb99)] = ![]),
      (ez[uf(0x55d)] = dN[uf(0x845)]),
      (ez[uf(0x24c)] = 0xe),
      (ez[uf(0x37f)] = 0xb),
      (ez[uf(0x4a3)] = 2.2),
      (ez[uf(0xa82)] = [
        [uf(0x260), "E"],
        [uf(0x78d), "J"],
      ]);
    const eA = {};
    (eA[uf(0xc25)] = uf(0x2bf)),
      (eA[uf(0xb66)] = uf(0x4e6)),
      (eA[uf(0x2dc)] = uf(0xb7c)),
      (eA[uf(0x544)] = 0x258),
      (eA[uf(0x3c2)] = 0x32),
      (eA[uf(0x338)] = 0.05),
      (eA[uf(0x8c9)] = 0x3c),
      (eA[uf(0x37f)] = 0x7),
      (eA[uf(0xbb8)] = !![]),
      (eA[uf(0x926)] = !![]),
      (eA[uf(0x929)] = !![]),
      (eA[uf(0xa82)] = [
        [uf(0xae3), "A"],
        [uf(0x94b), "G"],
      ]),
      (eA[uf(0x96b)] = [[uf(0xc71), 0x1]]),
      (eA[uf(0x439)] = [[uf(0xc71), 0x1]]);
    const eB = {};
    (eB[uf(0xc25)] = uf(0x305)),
      (eB[uf(0xb66)] = uf(0xbd9)),
      (eB[uf(0x2dc)] = uf(0x7ee)),
      (eB[uf(0x544)] = 0xc8),
      (eB[uf(0x3c2)] = 0x1e),
      (eB[uf(0x8c9)] = 0x2d),
      (eB[uf(0x773)] = !![]),
      (eB[uf(0xa82)] = [
        [uf(0x329), "G"],
        [uf(0x1eb), "H"],
        [uf(0x4ff), "E"],
      ]);
    const eC = {};
    (eC[uf(0xc25)] = uf(0xbc6)),
      (eC[uf(0xb66)] = uf(0x1d9)),
      (eC[uf(0x2dc)] = uf(0x59f)),
      (eC[uf(0x544)] = 0x3c),
      (eC[uf(0x3c2)] = 0x64),
      (eC[uf(0x8c9)] = 0x28),
      (eC[uf(0x724)] = !![]),
      (eC[uf(0x49b)] = ![]),
      (eC[uf(0x773)] = !![]),
      (eC[uf(0xa82)] = [
        [uf(0xec7), "F"],
        [uf(0x618), "D"],
        [uf(0x676), "G"],
      ]);
    const eD = {};
    (eD[uf(0xc25)] = uf(0x7f5)),
      (eD[uf(0xb66)] = uf(0x20e)),
      (eD[uf(0x2dc)] = uf(0xc24)),
      (eD[uf(0x8c9)] = 0x28),
      (eD[uf(0x544)] = 0x5a),
      (eD[uf(0x3c2)] = 0x5),
      (eD[uf(0x338)] = 0.05),
      (eD[uf(0x926)] = !![]),
      (eD[uf(0xa82)] = [[uf(0x7f5), "h"]]);
    const eE = {};
    (eE[uf(0xc25)] = uf(0x7f3)),
      (eE[uf(0xb66)] = uf(0x93a)),
      (eE[uf(0x2dc)] = uf(0xaed)),
      (eE[uf(0x544)] = 0x32),
      (eE[uf(0x3c2)] = 0x14),
      (eE[uf(0x8c9)] = 0x28),
      (eE[uf(0x6f0)] = !![]),
      (eE[uf(0xa82)] = [[uf(0x7f3), "F"]]);
    const eF = {};
    (eF[uf(0xc25)] = uf(0xcb5)),
      (eF[uf(0xb66)] = uf(0xe4b)),
      (eF[uf(0x2dc)] = uf(0x485)),
      (eF[uf(0x544)] = 0x32),
      (eF[uf(0x3c2)] = 0x14),
      (eF[uf(0x338)] = 0.05),
      (eF[uf(0x926)] = !![]),
      (eF[uf(0xa82)] = [[uf(0xcb5), "J"]]);
    const eG = {};
    (eG[uf(0xc25)] = uf(0xe8b)),
      (eG[uf(0xb66)] = uf(0x420)),
      (eG[uf(0x2dc)] = uf(0xbfa)),
      (eG[uf(0x544)] = 0x64),
      (eG[uf(0x3c2)] = 0x1e),
      (eG[uf(0x338)] = 0.05),
      (eG[uf(0x8c9)] = 0x32),
      (eG[uf(0x926)] = !![]),
      (eG[uf(0xa82)] = [
        [uf(0xec7), "D"],
        [uf(0xc20), "E"],
      ]);
    const eH = {};
    (eH[uf(0xc25)] = uf(0x3e7)),
      (eH[uf(0xb66)] = uf(0x272)),
      (eH[uf(0x2dc)] = uf(0x2f9)),
      (eH[uf(0x544)] = 0x96),
      (eH[uf(0x3c2)] = 0x14),
      (eH[uf(0x8c9)] = 0x28),
      (eH[uf(0xa82)] = [
        [uf(0x748), "D"],
        [uf(0x309), "F"],
      ]),
      (eH[uf(0x439)] = [[uf(0x38f), 0x1, 0.3]]);
    const eI = {};
    (eI[uf(0xc25)] = uf(0x29d)),
      (eI[uf(0xb66)] = uf(0x80b)),
      (eI[uf(0x2dc)] = uf(0xea0)),
      (eI[uf(0x544)] = 0x32),
      (eI[uf(0x3c2)] = 0x5),
      (eI[uf(0x338)] = 0.05),
      (eI[uf(0x926)] = !![]),
      (eI[uf(0xa82)] = [
        [uf(0x29d), "h"],
        [uf(0x618), "J"],
      ]);
    const eJ = {};
    (eJ[uf(0xc25)] = uf(0xa3e)),
      (eJ[uf(0xb66)] = uf(0xe03)),
      (eJ[uf(0x2dc)] = uf(0x406)),
      (eJ[uf(0x544)] = 0x64),
      (eJ[uf(0x3c2)] = 0x5),
      (eJ[uf(0x338)] = 0.05),
      (eJ[uf(0x926)] = !![]),
      (eJ[uf(0xa82)] = [[uf(0xa3e), "h"]]);
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
      eL = eK[uf(0x4cf)],
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
      (eN[qW] = [qX]), (qX[uf(0x2dc)] = cS[qX[uf(0x2dc)]]), eR(qX);
      qX[uf(0xa82)] &&
        qX[uf(0xa82)][uf(0xbed)]((qZ) => {
          const us = uf;
          qZ[0x1] = qZ[0x1][us(0x236)]()[us(0x50c)](0x0) - 0x41;
        });
      (qX["id"] = qW), (qX[uf(0x793)] = qW);
      if (!qX[uf(0x786)]) qX[uf(0x786)] = qX[uf(0xc25)];
      for (let qZ = 0x1; qZ <= db; qZ++) {
        const r0 = JSON[uf(0x55c)](JSON[uf(0xab8)](qX));
        (r0[uf(0xc25)] = qX[uf(0xc25)] + "_" + qZ),
          (r0[uf(0xb9c)] = qZ),
          (eN[qW][qZ] = r0),
          dJ(qX, r0),
          eR(r0),
          (r0["id"] = eK[uf(0x4cf)]),
          eK[uf(0x9ee)](r0);
      }
    }
    for (let r1 = 0x0; r1 < eK[uf(0x4cf)]; r1++) {
      const r2 = eK[r1];
      r2[uf(0x96b)] && eQ(r2, r2[uf(0x96b)]),
        r2[uf(0x439)] && eQ(r2, r2[uf(0x439)]);
    }
    function eQ(r3, r4) {
      const ut = uf;
      r4[ut(0xbed)]((r5) => {
        const uu = ut,
          r6 = r5[0x0] + (r3[uu(0xb9c)] > 0x0 ? "_" + r3[uu(0xb9c)] : "");
        r5[0x0] = eM[r6];
      });
    }
    function eR(r3) {
      const uv = uf;
      (r3[uv(0x2d7)] = dg(r3[uv(0xb9c)], r3[uv(0x544)]) * dL[r3[uv(0xb9c)]]),
        (r3[uv(0x530)] = dg(r3[uv(0xb9c)], r3[uv(0x3c2)])),
        r3[uv(0x5fd)]
          ? (r3[uv(0xc39)] = r3[uv(0x8c9)])
          : (r3[uv(0xc39)] = r3[uv(0x8c9)] * dM[r3[uv(0xb9c)]]),
        (r3[uv(0xa72)] = dg(r3[uv(0xb9c)], r3[uv(0x7fc)])),
        (r3[uv(0x486)] = dg(r3[uv(0xb9c)], r3[uv(0x6f2)])),
        (r3[uv(0x712)] = dg(r3[uv(0xb9c)], r3[uv(0x981)]) * dL[r3[uv(0xb9c)]]),
        (r3[uv(0x649)] = dg(r3[uv(0xb9c)], r3[uv(0x258)])),
        r3[uv(0xdd1)] && (r3[uv(0x918)] = dg(r3[uv(0xb9c)], r3[uv(0xdd1)])),
        (r3[uv(0x604)] = dg(r3[uv(0xb9c)], r3[uv(0xd52)])),
        (eM[r3[uv(0xc25)]] = r3),
        eO[r3[uv(0xb9c)]][uv(0x9ee)](r3);
    }
    function eS(r3) {
      return (r3 / 0xff) * Math["PI"] * 0x2;
    }
    var eT = Math["PI"] * 0x2;
    function eU(r3) {
      const uw = uf;
      return (
        (r3 %= eT), r3 < 0x0 && (r3 += eT), Math[uw(0x2d8)]((r3 / eT) * 0xff)
      );
    }
    function eV(r3) {
      const ux = uf;
      if (!r3 || r3[ux(0x4cf)] !== 0x24) return ![];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i[
        ux(0xbb3)
      ](r3);
    }
    function eW(r3, r4) {
      return dF[r3 + (r4 > 0x0 ? "_" + r4 : "")];
    }
    var eX = da[uf(0x20a)]((r3) => r3[uf(0x43a)]() + uf(0x7bd)),
      eY = da[uf(0x20a)]((r3) => uf(0x879) + r3 + uf(0x45c)),
      eZ = {};
    eX[uf(0xbed)]((r3) => {
      eZ[r3] = 0x0;
    });
    var f0 = {};
    eY[uf(0xbed)]((r3) => {
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
        timeJoined: Date[uy(0x796)]() * f1,
      };
    }
    var f3 = uf(0xb9b)[uf(0x32e)]("\x20");
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
    for (let r3 = 0x0; r3 < f5[uf(0x4cf)]; r3++) {
      const r4 = f5[r3],
        r5 = r4[r4[uf(0x4cf)] - 0x1],
        r6 = dO(r5);
      for (let r7 = 0x0; r7 < r6[uf(0x4cf)]; r7++) {
        const r8 = r6[r7];
        if (r8[0x0] < 0x1e) {
          let r9 = r8[0x0];
          (r9 *= 1.5),
            r9 < 1.5 && (r9 *= 0xa),
            (r9 = parseFloat(r9[uf(0x56a)](0x3))),
            (r8[0x0] = r9);
        }
        r8[0x1] = d9[uf(0x201)];
      }
      r6[uf(0x9ee)]([0.01, d9[uf(0x4a9)]]), r4[uf(0x9ee)](r6);
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
      instagram: uf(0x35d),
      discord: uf(0x2a7),
      paw: uf(0xa49),
      gear: uf(0xbcb),
      scroll: uf(0xe7d),
      bag: uf(0x660),
      food: uf(0x64c),
      graph: uf(0xb48),
      resize: uf(0x88e),
      users: uf(0x441),
      trophy: uf(0x8bc),
      shop: uf(0x6d9),
      dice: uf(0x326),
      poopPath: new Path2D(uf(0x247)),
    };
    function fa(ra) {
      const uz = uf;
      return ra[uz(0x6d2)](
        /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g,
        ""
      );
    }
    function fb(ra) {
      const uA = uf;
      if(hack.isEnabled('disableChatCheck')) return ra;
      return (
        (ra = fa(ra)),
        (ra = ra[uA(0x6d2)](
          /[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu,
          ""
        )
          [uA(0x6d2)](/(.)\1{2,}/gi, "$1")
          [uA(0x6d2)](/\u200B|\u200C|\u200D/g, "")
          [uA(0x517)]()),
        !ra && (ra = uA(0x8c3)),
        ra
      );
    }
    var fc = 0x106;
    function fd(ra) {
      const uB = uf,
        rb = ra[uB(0x32e)]("\x0a")[uB(0x94f)](
          (rc) => rc[uB(0x517)]()[uB(0x4cf)] > 0x0
        );
      return { title: rb[uB(0x2e2)](), content: rb };
    }
    const fe = {};
    (fe[uf(0xa83)] = uf(0x7c2)),
      (fe[uf(0xd81)] = [
        uf(0xe1d),
        uf(0xdaf),
        uf(0xc28),
        uf(0xce8),
        uf(0x7f8),
        uf(0x9c4),
        uf(0x6b4),
        uf(0xa3d),
      ]);
    const ff = {};
    (ff[uf(0xa83)] = uf(0x695)), (ff[uf(0xd81)] = [uf(0xeac)]);
    const fg = {};
    (fg[uf(0xa83)] = uf(0xde6)),
      (fg[uf(0xd81)] = [uf(0x336), uf(0xcc7), uf(0xdb3), uf(0x3c5)]);
    const fh = {};
    (fh[uf(0xa83)] = uf(0x6cd)),
      (fh[uf(0xd81)] = [
        uf(0xdf1),
        uf(0x6a7),
        uf(0x4a7),
        uf(0x458),
        uf(0x7fd),
        uf(0xaf6),
        uf(0x483),
        uf(0x28a),
        uf(0xa4d),
      ]);
    const fi = {};
    (fi[uf(0xa83)] = uf(0x72f)),
      (fi[uf(0xd81)] = [uf(0x411), uf(0x81b), uf(0x54c), uf(0x32f)]);
    const fj = {};
    (fj[uf(0xa83)] = uf(0x5af)), (fj[uf(0xd81)] = [uf(0x8fa)]);
    const fk = {};
    (fk[uf(0xa83)] = uf(0x743)), (fk[uf(0xd81)] = [uf(0xb88), uf(0xe8d)]);
    const fl = {};
    (fl[uf(0xa83)] = uf(0x44c)),
      (fl[uf(0xd81)] = [
        uf(0x8a9),
        uf(0x348),
        uf(0xd41),
        uf(0xe83),
        uf(0xbf2),
        uf(0x9c0),
        uf(0xca6),
        uf(0xd18),
      ]);
    const fm = {};
    (fm[uf(0xa83)] = uf(0xb0a)),
      (fm[uf(0xd81)] = [
        uf(0x3c3),
        uf(0xd51),
        uf(0x7c9),
        uf(0x407),
        uf(0xad1),
        uf(0xde3),
        uf(0x5be),
        uf(0x7c0),
      ]);
    const fn = {};
    (fn[uf(0xa83)] = uf(0xad0)), (fn[uf(0xd81)] = [uf(0x4fc)]);
    const fo = {};
    (fo[uf(0xa83)] = uf(0xe67)),
      (fo[uf(0xd81)] = [
        uf(0xd98),
        uf(0x85a),
        uf(0xc8f),
        uf(0x62e),
        uf(0x8f4),
        uf(0x460),
        uf(0x25a),
      ]);
    const fp = {};
    (fp[uf(0xa83)] = uf(0x779)), (fp[uf(0xd81)] = [uf(0xd66)]);
    const fq = {};
    (fq[uf(0xa83)] = uf(0x77e)),
      (fq[uf(0xd81)] = [uf(0x6ac), uf(0xafd), uf(0xd90), uf(0x21d)]);
    const fr = {};
    (fr[uf(0xa83)] = uf(0x26d)), (fr[uf(0xd81)] = [uf(0x91f), uf(0x1cd)]);
    const fs = {};
    (fs[uf(0xa83)] = uf(0x7d2)),
      (fs[uf(0xd81)] = [uf(0x4e5), uf(0x623), uf(0xaa7), uf(0xb6d)]);
    const ft = {};
    (ft[uf(0xa83)] = uf(0x5fc)),
      (ft[uf(0xd81)] = [uf(0x890), uf(0x3cc), uf(0xacc), uf(0x67d)]);
    const fu = {};
    (fu[uf(0xa83)] = uf(0x43f)),
      (fu[uf(0xd81)] = [
        uf(0x6f9),
        uf(0xaab),
        uf(0xcad),
        uf(0xc10),
        uf(0xd37),
        uf(0x42c),
      ]);
    const fv = {};
    (fv[uf(0xa83)] = uf(0xecc)), (fv[uf(0xd81)] = [uf(0x3ce)]);
    const fw = {};
    (fw[uf(0xa83)] = uf(0xaa2)), (fw[uf(0xd81)] = [uf(0x210), uf(0x3ec)]);
    const fx = {};
    (fx[uf(0xa83)] = uf(0x5cb)),
      (fx[uf(0xd81)] = [uf(0xdef), uf(0xd71), uf(0xa35)]);
    const fy = {};
    (fy[uf(0xa83)] = uf(0x551)),
      (fy[uf(0xd81)] = [uf(0xad8), uf(0x48b), uf(0xaac), uf(0xc52), uf(0x554)]);
    const fz = {};
    (fz[uf(0xa83)] = uf(0xe5f)), (fz[uf(0xd81)] = [uf(0x3f1), uf(0xd74)]);
    const fA = {};
    (fA[uf(0xa83)] = uf(0xd13)),
      (fA[uf(0xd81)] = [uf(0xda2), uf(0x4bd), uf(0x3d6)]);
    const fB = {};
    (fB[uf(0xa83)] = uf(0x2b9)), (fB[uf(0xd81)] = [uf(0x3a7)]);
    const fC = {};
    (fC[uf(0xa83)] = uf(0xacf)), (fC[uf(0xd81)] = [uf(0x371)]);
    const fD = {};
    (fD[uf(0xa83)] = uf(0xdcb)), (fD[uf(0xd81)] = [uf(0x920)]);
    const fE = {};
    (fE[uf(0xa83)] = uf(0x9d2)),
      (fE[uf(0xd81)] = [uf(0x9ec), uf(0x295), uf(0x3d9)]);
    const fF = {};
    (fF[uf(0xa83)] = uf(0xd57)),
      (fF[uf(0xd81)] = [
        uf(0x703),
        uf(0xdc2),
        uf(0xec5),
        uf(0xb51),
        uf(0xe96),
        uf(0xabc),
        uf(0xcfd),
        uf(0x22a),
        uf(0x9b4),
        uf(0x217),
        uf(0xc02),
        uf(0xd8f),
        uf(0x418),
        uf(0x2b4),
      ]);
    const fG = {};
    (fG[uf(0xa83)] = uf(0xa0c)),
      (fG[uf(0xd81)] = [
        uf(0x2bc),
        uf(0xb62),
        uf(0x381),
        uf(0x625),
        uf(0xd89),
        uf(0xd05),
        uf(0x571),
        uf(0x952),
      ]);
    const fH = {};
    (fH[uf(0xa83)] = uf(0xb47)),
      (fH[uf(0xd81)] = [
        uf(0x4f1),
        uf(0x394),
        uf(0x7d6),
        uf(0x2a2),
        uf(0x80c),
        uf(0x505),
        uf(0x9ac),
        uf(0x2c3),
        uf(0xd33),
        uf(0x35f),
        uf(0x85e),
        uf(0x229),
        uf(0x7d1),
        uf(0x4fd),
      ]);
    const fI = {};
    (fI[uf(0xa83)] = uf(0x8db)),
      (fI[uf(0xd81)] = [
        uf(0xe44),
        uf(0xd25),
        uf(0xcc0),
        uf(0x975),
        uf(0x4db),
        uf(0x25c),
        uf(0x445),
      ]);
    const fJ = {};
    (fJ[uf(0xa83)] = uf(0x628)),
      (fJ[uf(0xd81)] = [
        uf(0xab0),
        uf(0x320),
        uf(0xb37),
        uf(0x556),
        uf(0x964),
        uf(0x821),
        uf(0xd88),
        uf(0x783),
        uf(0x2df),
        uf(0x557),
        uf(0x5e0),
        uf(0xa16),
        uf(0xe72),
        uf(0x7fe),
      ]);
    const fK = {};
    (fK[uf(0xa83)] = uf(0x8d7)),
      (fK[uf(0xd81)] = [
        uf(0x42e),
        uf(0x634),
        uf(0x343),
        uf(0x36e),
        uf(0x772),
        uf(0x423),
        uf(0x3c1),
        uf(0xd7a),
        uf(0x938),
        uf(0x8a4),
        uf(0xe69),
        uf(0x48f),
        uf(0xd7f),
        uf(0x727),
        uf(0x883),
      ]);
    const fL = {};
    (fL[uf(0xa83)] = uf(0x5f1)),
      (fL[uf(0xd81)] = [
        uf(0x284),
        uf(0xe3e),
        uf(0x4a5),
        uf(0x1ee),
        uf(0x62b),
        uf(0x5ad),
        uf(0x686),
        uf(0x2ce),
        uf(0x442),
        uf(0xa23),
        uf(0xd5b),
        uf(0x5e8),
        uf(0x4d8),
      ]);
    const fM = {};
    (fM[uf(0xa83)] = uf(0x7c6)),
      (fM[uf(0xd81)] = [
        uf(0xd97),
        uf(0x947),
        uf(0xc45),
        uf(0xb7e),
        uf(0x1e2),
        uf(0x32d),
      ]);
    const fN = {};
    (fN[uf(0xa83)] = uf(0xed3)),
      (fN[uf(0xd81)] = [
        uf(0x799),
        uf(0xa99),
        uf(0x9f2),
        uf(0x985),
        uf(0x89f),
        uf(0xb19),
        uf(0xe6f),
        uf(0x766),
        uf(0xd09),
      ]);
    const fO = {};
    (fO[uf(0xa83)] = uf(0xed3)),
      (fO[uf(0xd81)] = [
        uf(0x516),
        uf(0xa74),
        uf(0x47e),
        uf(0x30d),
        uf(0xcf8),
        uf(0x31b),
        uf(0x9f8),
        uf(0x22b),
        uf(0xc62),
        uf(0x4c4),
        uf(0xbfc),
        uf(0x589),
        uf(0x298),
        uf(0x6a1),
        uf(0x321),
        uf(0x734),
        uf(0x725),
      ]);
    const fP = {};
    (fP[uf(0xa83)] = uf(0x7f7)), (fP[uf(0xd81)] = [uf(0xb14), uf(0x9e8)]);
    const fQ = {};
    (fQ[uf(0xa83)] = uf(0xade)),
      (fQ[uf(0xd81)] = [uf(0xb01), uf(0xb71), uf(0x242)]);
    const fR = {};
    (fR[uf(0xa83)] = uf(0xdd6)),
      (fR[uf(0xd81)] = [uf(0x252), uf(0xb4a), uf(0x282), uf(0x7de)]);
    const fS = {};
    (fS[uf(0xa83)] = uf(0xa13)),
      (fS[uf(0xd81)] = [
        uf(0xc6a),
        uf(0x6f6),
        uf(0xe78),
        uf(0x27c),
        uf(0x478),
        uf(0x1d2),
      ]);
    const fT = {};
    (fT[uf(0xa83)] = uf(0x3f4)), (fT[uf(0xd81)] = [uf(0x3fd)]);
    const fU = {};
    (fU[uf(0xa83)] = uf(0x7af)),
      (fU[uf(0xd81)] = [
        uf(0x388),
        uf(0x7cc),
        uf(0xb7a),
        uf(0xdeb),
        uf(0x3c4),
        uf(0x645),
        uf(0xb1d),
        uf(0xd0d),
      ]);
    const fV = {};
    (fV[uf(0xa83)] = uf(0x38d)), (fV[uf(0xd81)] = [uf(0xbde), uf(0x627)]);
    const fW = {};
    (fW[uf(0xa83)] = uf(0x213)),
      (fW[uf(0xd81)] = [uf(0xb23), uf(0x248), uf(0x318), uf(0x584), uf(0x885)]);
    const fX = {};
    (fX[uf(0xa83)] = uf(0x552)),
      (fX[uf(0xd81)] = [
        uf(0x624),
        uf(0xdb0),
        uf(0x2bd),
        uf(0x3db),
        uf(0x495),
        uf(0x90f),
        uf(0xd4b),
        uf(0x6c7),
        uf(0x214),
      ]);
    const fY = {};
    (fY[uf(0xa83)] = uf(0x32b)),
      (fY[uf(0xd81)] = [
        uf(0xbda),
        uf(0xb86),
        uf(0x2af),
        uf(0x9e1),
        uf(0x973),
        uf(0x4ce),
        uf(0xa28),
        uf(0x767),
      ]);
    const fZ = {};
    (fZ[uf(0xa83)] = uf(0xb5b)),
      (fZ[uf(0xd81)] = [
        uf(0x4af),
        uf(0x29a),
        uf(0x44b),
        uf(0x8e3),
        uf(0x1f8),
        uf(0x509),
        uf(0x901),
        uf(0x777),
        uf(0xab5),
      ]);
    const g0 = {};
    (g0[uf(0xa83)] = uf(0x65e)),
      (g0[uf(0xd81)] = [
        uf(0xcbf),
        uf(0x534),
        uf(0x273),
        uf(0x509),
        uf(0x639),
        uf(0xa04),
        uf(0xcdf),
        uf(0x1f3),
        uf(0xeb6),
        uf(0x405),
        uf(0xe48),
      ]);
    const g1 = {};
    (g1[uf(0xa83)] = uf(0x65e)),
      (g1[uf(0xd81)] = [uf(0x7cf), uf(0x9d7), uf(0x7eb), uf(0x6b2), uf(0x9a4)]);
    const g2 = {};
    (g2[uf(0xa83)] = uf(0x2f6)), (g2[uf(0xd81)] = [uf(0x384), uf(0xe45)]);
    const g3 = {};
    (g3[uf(0xa83)] = uf(0x3a8)), (g3[uf(0xd81)] = [uf(0x768)]);
    const g4 = {};
    (g4[uf(0xa83)] = uf(0x26b)),
      (g4[uf(0xd81)] = [uf(0x1fa), uf(0xa87), uf(0xa9c), uf(0x930)]);
    const g5 = {};
    (g5[uf(0xa83)] = uf(0x642)),
      (g5[uf(0xd81)] = [uf(0xd73), uf(0x78c), uf(0xd8c), uf(0x726)]);
    const g6 = {};
    (g6[uf(0xa83)] = uf(0x642)),
      (g6[uf(0xd81)] = [
        uf(0xdba),
        uf(0x3c1),
        uf(0xada),
        uf(0x86e),
        uf(0x9d0),
        uf(0x655),
        uf(0xaec),
        uf(0x739),
        uf(0xc13),
        uf(0x77b),
        uf(0xa0f),
        uf(0x3b6),
        uf(0xd30),
        uf(0xae9),
        uf(0x49d),
        uf(0xb4d),
        uf(0x812),
        uf(0xd93),
        uf(0x26a),
        uf(0x39f),
      ]);
    const g7 = {};
    (g7[uf(0xa83)] = uf(0x819)),
      (g7[uf(0xd81)] = [uf(0xe4c), uf(0xd03), uf(0xd79), uf(0xe9d)]);
    const g8 = {};
    (g8[uf(0xa83)] = uf(0xb3b)),
      (g8[uf(0xd81)] = [uf(0xc7f), uf(0x5a8), uf(0xca5)]);
    const g9 = {};
    (g9[uf(0xa83)] = uf(0xb31)),
      (g9[uf(0xd81)] = [
        uf(0xdb6),
        uf(0xa6e),
        uf(0xd1b),
        uf(0xe0e),
        uf(0xdf4),
        uf(0xa98),
        uf(0x85f),
        uf(0xaef),
        uf(0x4cd),
        uf(0x9df),
        uf(0x736),
        uf(0x591),
        uf(0xbbf),
        uf(0xbf1),
        uf(0x9ae),
      ]);
    const ga = {};
    (ga[uf(0xa83)] = uf(0x48e)), (ga[uf(0xd81)] = [uf(0x955), uf(0xe3f)]);
    const gb = {};
    (gb[uf(0xa83)] = uf(0x20f)),
      (gb[uf(0xd81)] = [uf(0xdcd), uf(0x4d9), uf(0x88d)]);
    const gc = {};
    (gc[uf(0xa83)] = uf(0x4f6)),
      (gc[uf(0xd81)] = [uf(0xc41), uf(0x970), uf(0xcb7)]);
    const gd = {};
    (gd[uf(0xa83)] = uf(0x5d4)),
      (gd[uf(0xd81)] = [uf(0xc05), uf(0x781), uf(0xe6c), uf(0xd12)]);
    const ge = {};
    (ge[uf(0xa83)] = uf(0x763)),
      (ge[uf(0xd81)] = [uf(0xbe6), uf(0x41c), uf(0x89b)]);
    const gf = {};
    (gf[uf(0xa83)] = uf(0xaba)),
      (gf[uf(0xd81)] = [
        uf(0x3c1),
        uf(0x5e2),
        uf(0xe47),
        uf(0x607),
        uf(0x3d7),
        uf(0x401),
        uf(0xcac),
        uf(0x5f5),
        uf(0xc01),
        uf(0xb1a),
        uf(0xc97),
        uf(0xb29),
        uf(0xa86),
        uf(0x3d4),
        uf(0xc3c),
        uf(0xe5a),
        uf(0xa46),
        uf(0xa6b),
        uf(0xbeb),
        uf(0xd2f),
        uf(0x4e4),
        uf(0xe85),
        uf(0xb42),
        uf(0xd56),
      ]);
    const gg = {};
    (gg[uf(0xa83)] = uf(0x319)),
      (gg[uf(0xd81)] = [uf(0x449), uf(0xe33), uf(0x382), uf(0x28c)]);
    const gh = {};
    (gh[uf(0xa83)] = uf(0x91d)),
      (gh[uf(0xd81)] = [
        uf(0xab6),
        uf(0x312),
        uf(0x278),
        uf(0x3c1),
        uf(0xda3),
        uf(0xa9a),
        uf(0x572),
        uf(0x4ed),
      ]);
    const gi = {};
    (gi[uf(0xa83)] = uf(0x7b9)),
      (gi[uf(0xd81)] = [
        uf(0x239),
        uf(0xc4c),
        uf(0xe0e),
        uf(0x4c5),
        uf(0xd76),
        uf(0x700),
        uf(0x84c),
        uf(0xe38),
        uf(0xd21),
        uf(0x9f5),
        uf(0xb91),
        uf(0xda1),
        uf(0x789),
        uf(0x78a),
        uf(0x3a5),
        uf(0xd59),
        uf(0xa48),
      ]);
    const gj = {};
    (gj[uf(0xa83)] = uf(0x875)),
      (gj[uf(0xd81)] = [
        uf(0x592),
        uf(0xd3c),
        uf(0xe4a),
        uf(0x26c),
        uf(0xcf1),
        uf(0xc35),
        uf(0xd91),
        uf(0xb3d),
        uf(0x9bf),
        uf(0xd2e),
        uf(0x498),
      ]);
    const gk = {};
    (gk[uf(0xa83)] = uf(0x3b0)),
      (gk[uf(0xd81)] = [
        uf(0x644),
        uf(0x4ee),
        uf(0xcea),
        uf(0x823),
        uf(0x632),
        uf(0x9de),
        uf(0xa8b),
        uf(0xbd2),
        uf(0xacb),
        uf(0x9ea),
      ]);
    const gl = {};
    (gl[uf(0xa83)] = uf(0x3b0)),
      (gl[uf(0xd81)] = [
        uf(0x8ca),
        uf(0xeb5),
        uf(0x8b5),
        uf(0xaca),
        uf(0x999),
        uf(0x7b7),
        uf(0x39c),
        uf(0xa47),
        uf(0x602),
        uf(0x431),
      ]);
    const gm = {};
    (gm[uf(0xa83)] = uf(0x6ab)),
      (gm[uf(0xd81)] = [
        uf(0xd80),
        uf(0xdaa),
        uf(0x656),
        uf(0xb05),
        uf(0x9e4),
        uf(0xa3c),
        uf(0x706),
        uf(0x2e1),
        uf(0x7ac),
        uf(0x749),
      ]);
    const gn = {};
    (gn[uf(0xa83)] = uf(0x6ab)),
      (gn[uf(0xd81)] = [
        uf(0x7cf),
        uf(0xe71),
        uf(0xa37),
        uf(0x66b),
        uf(0x99e),
        uf(0xa7e),
        uf(0x7c1),
        uf(0xc70),
        uf(0x438),
        uf(0x555),
        uf(0xd86),
      ]);
    const go = {};
    (go[uf(0xa83)] = uf(0xa2b)),
      (go[uf(0xd81)] = [uf(0x349), uf(0x342), uf(0x8a6)]);
    const gp = {};
    (gp[uf(0xa83)] = uf(0xa2b)),
      (gp[uf(0xd81)] = [
        uf(0xa8a),
        uf(0xc42),
        uf(0x851),
        uf(0xa71),
        uf(0xb34),
        uf(0x849),
        uf(0x265),
        uf(0xc0d),
      ]);
    const gq = {};
    (gq[uf(0xa83)] = uf(0x7bc)),
      (gq[uf(0xd81)] = [uf(0x864), uf(0x693), uf(0x75d)]);
    const gr = {};
    (gr[uf(0xa83)] = uf(0x7bc)),
      (gr[uf(0xd81)] = [
        uf(0xc31),
        uf(0xd09),
        uf(0x3d3),
        uf(0xdc7),
        uf(0x884),
        uf(0x4fb),
      ]);
    const gs = {};
    (gs[uf(0xa83)] = uf(0x7bc)),
      (gs[uf(0xd81)] = [uf(0xa4c), uf(0x857), uf(0x1d7), uf(0x48d)]);
    const gt = {};
    (gt[uf(0xa83)] = uf(0x7bc)),
      (gt[uf(0xd81)] = [
        uf(0xd5e),
        uf(0x991),
        uf(0xb5c),
        uf(0x561),
        uf(0xe82),
        uf(0x7bf),
        uf(0x850),
        uf(0x4b6),
        uf(0xd7b),
        uf(0x89a),
        uf(0x543),
      ]);
    const gu = {};
    (gu[uf(0xa83)] = uf(0xd22)),
      (gu[uf(0xd81)] = [uf(0x429), uf(0x9f6), uf(0x70a)]);
    const gv = {};
    (gv[uf(0xa83)] = uf(0x610)),
      (gv[uf(0xd81)] = [
        uf(0xc27),
        uf(0x514),
        uf(0xd09),
        uf(0x5c2),
        uf(0xd38),
        uf(0x3c6),
        uf(0x643),
        uf(0x8e6),
        uf(0x87e),
        uf(0x933),
        uf(0xd9d),
        uf(0x2b5),
        uf(0xe0e),
        uf(0xac0),
        uf(0xd00),
        uf(0x586),
        uf(0x377),
        uf(0x6e1),
        uf(0x652),
        uf(0x25d),
        uf(0xd78),
        uf(0xd1f),
        uf(0x25e),
        uf(0x6ad),
        uf(0xe9b),
        uf(0x6e4),
        uf(0xb5f),
        uf(0xa70),
        uf(0x290),
        uf(0x40e),
        uf(0xc40),
        uf(0x5ed),
        uf(0xe20),
        uf(0x594),
      ]);
    const gw = {};
    (gw[uf(0xa83)] = uf(0x828)), (gw[uf(0xd81)] = [uf(0x8dc)]);
    const gx = {};
    (gx[uf(0xa83)] = uf(0xd8a)),
      (gx[uf(0xd81)] = [
        uf(0xb1c),
        uf(0x87c),
        uf(0xd26),
        uf(0xb84),
        uf(0x82a),
        uf(0x990),
        uf(0x83c),
        uf(0xe0e),
        uf(0x76f),
        uf(0xeda),
        uf(0x21f),
        uf(0x94d),
        uf(0xe9e),
        uf(0xedb),
        uf(0x950),
        uf(0x4d1),
        uf(0x3ef),
        uf(0x3cf),
        uf(0x208),
        uf(0xd70),
        uf(0x910),
        uf(0x6eb),
        uf(0xe35),
        uf(0xaff),
        uf(0x8cb),
        uf(0x227),
        uf(0x79f),
        uf(0x9b5),
        uf(0xc91),
        uf(0xea6),
        uf(0x5ed),
        uf(0xa88),
        uf(0x905),
        uf(0xb07),
        uf(0xba8),
      ]);
    const gy = {};
    (gy[uf(0xa83)] = uf(0xea5)),
      (gy[uf(0xd81)] = [
        uf(0x207),
        uf(0x7a1),
        uf(0x502),
        uf(0x346),
        uf(0x45b),
        uf(0x539),
        uf(0xe0e),
        uf(0x3a1),
        uf(0x44f),
        uf(0x599),
        uf(0x943),
        uf(0x6c9),
        uf(0x289),
        uf(0x496),
        uf(0x9b9),
        uf(0xd42),
        uf(0x830),
        uf(0x3d5),
        uf(0xc3d),
        uf(0xd0f),
        uf(0x912),
        uf(0x3ef),
        uf(0xbfd),
        uf(0x6c5),
        uf(0x79b),
        uf(0xa73),
        uf(0x24d),
        uf(0x436),
        uf(0xe7c),
        uf(0x3a2),
        uf(0xb10),
        uf(0x96a),
        uf(0xc16),
        uf(0x633),
        uf(0x5ed),
        uf(0x5ef),
        uf(0xb5d),
        uf(0x91a),
        uf(0x276),
      ]);
    const gz = {};
    (gz[uf(0xa83)] = uf(0x5a4)),
      (gz[uf(0xd81)] = [
        uf(0x560),
        uf(0x380),
        uf(0x5ed),
        uf(0x2c7),
        uf(0x4d0),
        uf(0x285),
        uf(0x38c),
        uf(0xb65),
        uf(0x612),
        uf(0xe0e),
        uf(0x5a0),
        uf(0xccb),
        uf(0x391),
        uf(0x359),
      ]);
    const gA = {};
    (gA[uf(0xa83)] = uf(0xcd4)),
      (gA[uf(0xd81)] = [uf(0x50f), uf(0x47b), uf(0x4d7), uf(0xca4), uf(0xafc)]);
    const gB = {};
    (gB[uf(0xa83)] = uf(0x9c5)),
      (gB[uf(0xd81)] = [uf(0xd54), uf(0x77a), uf(0x2bb), uf(0x448)]);
    const gC = {};
    (gC[uf(0xa83)] = uf(0x9c5)),
      (gC[uf(0xd81)] = [uf(0xd09), uf(0x65c), uf(0x585)]);
    const gD = {};
    (gD[uf(0xa83)] = uf(0x34a)),
      (gD[uf(0xd81)] = [uf(0xabd), uf(0x451), uf(0x263), uf(0x398), uf(0x83e)]);
    const gE = {};
    (gE[uf(0xa83)] = uf(0x34a)),
      (gE[uf(0xd81)] = [uf(0x63d), uf(0x8e8), uf(0x357), uf(0x92e)]);
    const gF = {};
    (gF[uf(0xa83)] = uf(0x34a)), (gF[uf(0xd81)] = [uf(0xdc6), uf(0xe1b)]);
    const gG = {};
    (gG[uf(0xa83)] = uf(0xd60)),
      (gG[uf(0xd81)] = [
        uf(0xd53),
        uf(0x76c),
        uf(0x945),
        uf(0x354),
        uf(0xa68),
        uf(0x8d3),
        uf(0x86d),
        uf(0xa5c),
        uf(0xd6a),
      ]);
    const gH = {};
    (gH[uf(0xa83)] = uf(0x2ba)),
      (gH[uf(0xd81)] = [
        uf(0xdde),
        uf(0x240),
        uf(0x720),
        uf(0xe6b),
        uf(0x5fe),
        uf(0xa9f),
        uf(0x2fc),
      ]);
    const gI = {};
    (gI[uf(0xa83)] = uf(0xe5d)),
      (gI[uf(0xd81)] = [
        uf(0x428),
        uf(0xa2a),
        uf(0x596),
        uf(0xb79),
        uf(0x8e2),
        uf(0xbaa),
        uf(0x3b9),
        uf(0xb59),
        uf(0x836),
        uf(0xdd0),
        uf(0xa81),
        uf(0xb2d),
      ]);
    const gJ = {};
    (gJ[uf(0xa83)] = uf(0xdcf)),
      (gJ[uf(0xd81)] = [
        uf(0x577),
        uf(0x1cc),
        uf(0x487),
        uf(0x2e5),
        uf(0xa9d),
        uf(0x98f),
        uf(0x8cf),
        uf(0x832),
        uf(0x908),
        uf(0x788),
      ]);
    const gK = {};
    (gK[uf(0xa83)] = uf(0xdcf)),
      (gK[uf(0xd81)] = [
        uf(0x413),
        uf(0x350),
        uf(0x5d6),
        uf(0x332),
        uf(0x425),
        uf(0x646),
      ]);
    const gL = {};
    (gL[uf(0xa83)] = uf(0xc90)),
      (gL[uf(0xd81)] = [uf(0x3e2), uf(0x3f0), uf(0x1f1)]);
    const gM = {};
    (gM[uf(0xa83)] = uf(0xc90)),
      (gM[uf(0xd81)] = [uf(0xd09), uf(0x566), uf(0x617), uf(0xa7f), uf(0xc48)]);
    const gN = {};
    (gN[uf(0xa83)] = uf(0x1f6)),
      (gN[uf(0xd81)] = [
        uf(0xe54),
        uf(0x7db),
        uf(0x5b0),
        uf(0x23d),
        uf(0x281),
        uf(0x4f7),
        uf(0x5ed),
        uf(0xd0c),
        uf(0x479),
        uf(0x7c4),
        uf(0x88c),
        uf(0x42b),
        uf(0xe0e),
        uf(0x9cd),
        uf(0xba5),
        uf(0xc7d),
        uf(0x8ae),
        uf(0x53e),
        uf(0x5a2),
      ]);
    const gO = {};
    (gO[uf(0xa83)] = uf(0x361)),
      (gO[uf(0xd81)] = [
        uf(0x393),
        uf(0x412),
        uf(0x8ba),
        uf(0x961),
        uf(0x657),
        uf(0xce7),
        uf(0x661),
        uf(0x6bc),
      ]);
    const gP = {};
    (gP[uf(0xa83)] = uf(0x361)), (gP[uf(0xd81)] = [uf(0x222), uf(0xa18)]);
    const gQ = {};
    (gQ[uf(0xa83)] = uf(0x2e3)), (gQ[uf(0xd81)] = [uf(0x5e5), uf(0x994)]);
    const gR = {};
    (gR[uf(0xa83)] = uf(0x2e3)),
      (gR[uf(0xd81)] = [
        uf(0x545),
        uf(0xeab),
        uf(0x8d9),
        uf(0x705),
        uf(0x4b0),
        uf(0xa0e),
        uf(0x8b8),
        uf(0x569),
        uf(0x362),
      ]);
    const gS = {};
    (gS[uf(0xa83)] = uf(0x4bf)), (gS[uf(0xd81)] = [uf(0x667), uf(0xa66)]);
    const gT = {};
    (gT[uf(0xa83)] = uf(0x4bf)),
      (gT[uf(0xd81)] = [
        uf(0x8bb),
        uf(0x55a),
        uf(0xaa5),
        uf(0xc9d),
        uf(0xedc),
        uf(0x63c),
        uf(0x8e7),
        uf(0xd09),
        uf(0xdbc),
      ]);
    const gU = {};
    (gU[uf(0xa83)] = uf(0xcef)), (gU[uf(0xd81)] = [uf(0x39b)]);
    const gV = {};
    (gV[uf(0xa83)] = uf(0xcef)),
      (gV[uf(0xd81)] = [
        uf(0xbe1),
        uf(0x8c2),
        uf(0x6a2),
        uf(0xd3b),
        uf(0xd09),
        uf(0x9b3),
        uf(0x9a3),
      ]);
    const gW = {};
    (gW[uf(0xa83)] = uf(0xcef)),
      (gW[uf(0xd81)] = [uf(0xabb), uf(0xccf), uf(0xe28)]);
    const gX = {};
    (gX[uf(0xa83)] = uf(0x73d)),
      (gX[uf(0xd81)] = [uf(0xdbc), uf(0x73a), uf(0x7be), uf(0xda8)]);
    const gY = {};
    (gY[uf(0xa83)] = uf(0x73d)), (gY[uf(0xd81)] = [uf(0xcfb)]);
    const gZ = {};
    (gZ[uf(0xa83)] = uf(0x73d)),
      (gZ[uf(0xd81)] = [uf(0xcae), uf(0xa3a), uf(0x72b), uf(0xc92), uf(0xe4d)]);
    const h0 = {};
    (h0[uf(0xa83)] = uf(0xaf2)),
      (h0[uf(0xd81)] = [uf(0x62d), uf(0xca3), uf(0x8c7)]);
    const h1 = {};
    (h1[uf(0xa83)] = uf(0x5b5)), (h1[uf(0xd81)] = [uf(0x7dc), uf(0x671)]);
    const h2 = {};
    (h2[uf(0xa83)] = uf(0xc9c)), (h2[uf(0xd81)] = [uf(0x792), uf(0x77f)]);
    const h3 = {};
    (h3[uf(0xa83)] = uf(0xbcf)), (h3[uf(0xd81)] = [uf(0x868)]);
    var h4 = [
      fd(uf(0x96d)),
      fd(uf(0x4bb)),
      fd(uf(0x60d)),
      fd(uf(0x8f0)),
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
    console[uf(0x454)](uf(0x50a));
    var h5 = Date[uf(0x796)]() < 0x18e9c4b6482,
      h6 = Math[uf(0xb02)](Math[uf(0xa69)]() * 0xa);
    function h7(ra) {
      const uC = uf,
        rb = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
      let rc = "";
      for (const rd of ra) {
        rd === "\x20"
          ? (rc += "\x20")
          : (rc += rb[(h6 + rd[uC(0x50c)](0x0)) % rb[uC(0x4cf)]]);
      }
      return rc;
    }
    h5 &&
      document[uf(0x992)](uf(0xca0))[uf(0x99c)](
        uf(0x2c1),
        h7(uf(0xcb4)) + uf(0x337)
      );
    function h8(ra, rb, rc) {
      const uD = uf,
        rd = rb - ra;
      if (Math[uD(0xc8b)](rd) < 0.01) return rb;
      return ra + rd * (0x1 - Math[uD(0x954)](-rc * pB));
    }
    var h9 = [],
      ha = 0x0;
    function hb(ra, rb = 0x1388) {
      const uE = uf,
        rc = nA(uE(0xc98) + jw(ra) + uE(0xd49));
      kH[uE(0x962)](rc);
      let rd = 0x0;
      re();
      function re() {
        const uF = uE;
        (rc[uF(0x35a)][uF(0x53f)] = uF(0x515) + ha + uF(0x4b8)),
          (rc[uF(0x35a)][uF(0xc03)] = rd);
      }
      (this[uE(0x613)] = ![]),
        (this[uE(0x30b)] = () => {
          const uG = uE;
          rb -= pA;
          const rf = rb > 0x0 ? 0x1 : 0x0;
          (rd = h8(rd, rf, 0.3)),
            re(),
            rb < 0x0 &&
              rd <= 0x0 &&
              (rc[uG(0x218)](), (this[uG(0x613)] = !![])),
            (ha += rd * (rc[uG(0x3e3)] + 0x5));
        }),
        h9[uE(0x9ee)](this);
    }
    function hc(ra) {
      new hb(ra, 0x1388);
    }
    function hd() {
      const uH = uf;
      ha = 0x0;
      for (let ra = h9[uH(0x4cf)] - 0x1; ra >= 0x0; ra--) {
        const rb = h9[ra];
        rb[uH(0x30b)](), rb[uH(0x613)] && h9[uH(0x708)](ra, 0x1);
      }
    }
    var he = !![],
      hf = document[uf(0x992)](uf(0x800));
    fetch(uf(0x9fc))
      [uf(0x2c6)]((ra) => {
        const uI = uf;
        (hf[uI(0x35a)][uI(0xbe5)] = uI(0x5d0)), (he = ![]);
      })
      [uf(0x844)]((ra) => {
        const uJ = uf;
        hf[uJ(0x35a)][uJ(0xbe5)] = "";
      });
    var hg = document[uf(0x992)](uf(0x3ac)),
      hh = Date[uf(0x796)]();
    function hi() {
      const uK = uf;
      console[uK(0x454)](uK(0xcb8)),
        (hh = Date[uK(0x796)]()),
        (hg[uK(0x35a)][uK(0xbe5)] = "");
      try {
        aiptag[uK(0x803)][uK(0xbe5)][uK(0x9ee)](function () {
          const uL = uK;
          aipDisplayTag[uL(0xbe5)](uL(0xe15));
        }),
          aiptag[uK(0x803)][uK(0xbe5)][uK(0x9ee)](function () {
            const uM = uK;
            aipDisplayTag[uM(0xbe5)](uM(0x340));
          });
      } catch (ra) {
        console[uK(0x454)](uK(0x3fc));
      }
    }
    setInterval(function () {
      const uN = uf;
      hg[uN(0x35a)][uN(0xbe5)] === "" &&
        Date[uN(0x796)]() - hh > 0x7530 &&
        hi();
    }, 0x2710);
    var hj = null,
      hk = 0x0;
    function hl() {
      const uO = uf;
      console[uO(0x454)](uO(0x51b)),
        typeof aiptag[uO(0x4b2)] !== uO(0x6b5)
          ? ((hj = 0x45),
            (hk = Date[uO(0x796)]()),
            aiptag[uO(0x803)][uO(0xec1)][uO(0x9ee)](function () {
              const uP = uO;
              aiptag[uP(0x4b2)][uP(0x467)]();
            }))
          : window[uO(0xbc8)](uO(0x9da));
    }
    window[uf(0xbc8)] = function (ra) {
      const uQ = uf;
      console[uQ(0x454)](uQ(0xb97) + ra);
      if (ra === uQ(0x364) || ra[uQ(0xe00)](uQ(0x49f)) > -0x1) {
        if (hj !== null && Date[uQ(0x796)]() - hk > 0xbb8) {
          console[uQ(0x454)](uQ(0xa25));
          if (hW) {
            const rb = {};
            (rb[uQ(0xa83)] = uQ(0xc56)),
              (rb[uQ(0xd4c)] = ![]),
              kI(
                uQ(0x45e),
                (rc) => {
                  const uR = uQ;
                  rc &&
                    hW &&
                    (il(new Uint8Array([cI[uR(0x8b0)]])), hK(uR(0x9bd)));
                },
                rb
              );
          }
        } else hK(uQ(0x507));
      } else alert(uQ(0xb36) + ra);
      hm[uQ(0x2ae)][uQ(0x218)](uQ(0x1c9)), (hj = null);
    };
    var hm = document[uf(0x992)](uf(0x814));
    (hm[uf(0x4fe)] = function () {
      const uS = uf;
      hm[uS(0x2ae)][uS(0x6b1)](uS(0x1c9)), hl();
    }),
      (hm[uf(0x45d)] = function () {
        const uT = uf;
        return nA(
          uT(0x68c) + hP[uT(0x201)] + uT(0xbd7) + hP[uT(0x769)] + uT(0xc7a)
        );
      }),
      (hm[uf(0x9ed)] = !![]);
    var hn = [
        uf(0x57e),
        uf(0xb5e),
        uf(0xbec),
        uf(0xd14),
        uf(0xb22),
        uf(0xc0e),
        uf(0x9dd),
        uf(0x378),
        uf(0xbd4),
        uf(0x654),
        uf(0x6ed),
        uf(0x9f7),
      ],
      ho = document[uf(0x992)](uf(0x37e)),
      hp =
        Date[uf(0x796)]() < 0x18e09b7a68d + 0x5 * 0x18 * 0x3c * 0xea60
          ? 0x0
          : Math[uf(0xb02)](Math[uf(0xa69)]() * hn[uf(0x4cf)]);
    hr();
    function hq(ra) {
      const uU = uf;
      (hp += ra),
        hp < 0x0 ? (hp = hn[uU(0x4cf)] - 0x1) : (hp %= hn[uU(0x4cf)]),
        hr();
    }
    function hr() {
      const uV = uf,
        ra = hn[hp];
      (ho[uV(0x35a)][uV(0xb03)] =
        uV(0x403) + ra[uV(0x32e)](uV(0x53a))[0x1] + uV(0x66c)),
        (ho[uV(0x4fe)] = function () {
          const uW = uV;
          window[uW(0x1cb)](ra, uW(0x35e)), hq(0x1);
        });
    }
    (document[uf(0x992)](uf(0xd1c))[uf(0x4fe)] = function () {
      hq(-0x1);
    }),
      (document[uf(0x992)](uf(0xc93))[uf(0x4fe)] = function () {
        hq(0x1);
      });
    var hs = document[uf(0x992)](uf(0xd32));
    hs[uf(0x45d)] = function () {
      const uX = uf;
      return nA(
        uX(0x68c) + hP[uX(0x201)] + uX(0x82d) + hP[uX(0xe3b)] + uX(0xab1)
      );
    };
    var ht = document[uf(0x992)](uf(0x9b8)),
      hu = document[uf(0x992)](uf(0xed8)),
      hv = ![];
    function hw() {
      const uY = uf;
      let ra = "";
      for (let rc = 0x0; rc < h4[uY(0x4cf)]; rc++) {
        const { title: rd, content: re } = h4[rc];
        (ra += uY(0x909) + rd + uY(0x50d)),
          re[uY(0xbed)]((rf, rg) => {
            const uZ = uY;
            let rh = "-\x20";
            if (rf[0x0] === "*") {
              const ri = rf[rg + 0x1];
              if (ri && ri[0x0] === "*") rh = uZ(0x46e);
              else rh = uZ(0x47c);
              rf = rf[uZ(0xb26)](0x1);
            }
            (rf = rh + rf), (ra += uZ(0xc06) + rf + uZ(0x5c7));
          }),
          (ra += uY(0x9d9));
      }
      const rb = hD[uY(0xbe3)];
      (hv = rb !== void 0x0 && parseInt(rb) < fc), (ht[uY(0x8e1)] = ra);
    }
    CanvasRenderingContext2D[uf(0x902)][uf(0x264)] = function (ra) {
      const v0 = uf;
      this[v0(0xd07)](ra, ra);
    };
    var hx = ![];
    hx &&
      (OffscreenCanvasRenderingContext2D[uf(0x902)][uf(0x264)] = function (ra) {
        const v1 = uf;
        this[v1(0xd07)](ra, ra);
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
            parseInt(ra[v2(0xb26)](0x1, 0x3), 0x10),
            parseInt(ra[v2(0xb26)](0x3, 0x5), 0x10),
            parseInt(ra[v2(0xb26)](0x5, 0x7), 0x10),
          ]),
        hz[ra]
      );
    }
    var hB = document[uf(0xde7)](uf(0xe04)),
      hC = document[uf(0x523)](uf(0x6e3));
    for (let ra = 0x0; ra < hC[uf(0x4cf)]; ra++) {
      const rb = hC[ra],
        rc = f9[rb[uf(0xadf)](uf(0xa30))];
      rc && rb[uf(0xc7b)](nA(rc), rb[uf(0x44e)][0x0]);
    }
    var hD;
    try {
      hD = localStorage;
    } catch (rd) {
      console[uf(0xa22)](uf(0xed6), rd), (hD = {});
    }
    var hE = document[uf(0x992)](uf(0xb6e)),
      hF = document[uf(0x992)](uf(0x5fa)),
      hG = document[uf(0x992)](uf(0x721));
    (hE[uf(0x45d)] = function () {
      const v3 = uf;
      return nA(
        v3(0x47d) + hP[v3(0x855)] + v3(0x7a3) + cN + v3(0xc58) + cM + v3(0x34b)
      );
    }),
      (hF[uf(0x2e6)] = cM),
      (hF[uf(0xad4)] = function () {
        const v4 = uf;
        !cO[v4(0xbb3)](this[v4(0x6f8)]) &&
          (this[v4(0x6f8)] = this[v4(0x6f8)][v4(0x6d2)](cP, ""));
      });
    var hH,
      hI = document[uf(0x992)](uf(0xdf6));
    function hJ(re) {
      const v5 = uf;
      re ? k8(hI, re + v5(0x810)) : k8(hI, v5(0x8bf)),
        (hE[v5(0x35a)][v5(0xbe5)] =
          re && re[v5(0xe00)]("\x20") === -0x1 ? v5(0x5d0) : "");
    }
    hG[uf(0x4fe)] = ng(function () {
      const v6 = uf;
      if (!hW || jy) return;
      const re = hF[v6(0x6f8)],
        rf = re[v6(0x4cf)];
      if (rf < cN) hc(v6(0xa36));
      else {
        if (rf > cM) hc(v6(0xecd));
        else {
          if (!cO[v6(0xbb3)](re)) hc(v6(0x8b7));
          else {
            hc(v6(0x820), hP[v6(0xe3b)]), (hH = re);
            const rg = new Uint8Array([
              cI[v6(0x8e9)],
              ...new TextEncoder()[v6(0x3e9)](re),
            ]);
            il(rg);
          }
        }
      }
    });
    function hK(re, rf = n3[uf(0x88f)]) {
      n6(-0x1, null, re, rf);
    }
    hw();
    var hL = f4(cR),
      hM = f4(cS),
      hN = f4(d9);
    const hO = {};
    (hO[uf(0x855)] = uf(0xa0a)),
      (hO[uf(0xe3b)] = uf(0x8a1)),
      (hO[uf(0x61c)] = uf(0x755)),
      (hO[uf(0x422)] = uf(0x71f)),
      (hO[uf(0x499)] = uf(0xc0a)),
      (hO[uf(0x769)] = uf(0x893)),
      (hO[uf(0x201)] = uf(0xd9b)),
      (hO[uf(0x4a9)] = uf(0xece)),
      (hO[uf(0xb0b)] = uf(0x1e6));
    var hP = hO,
      hQ = Object[uf(0x6f4)](hP),
      hR = [];
    for (let re = 0x0; re < hQ[uf(0x4cf)]; re++) {
      const rf = hQ[re],
        rg = rf[uf(0xb26)](0x4, rf[uf(0xe00)](")"))
          [uf(0x32e)](",\x20")
          [uf(0x20a)]((rh) => parseInt(rh) * 0.8);
      hR[uf(0x9ee)](pL(rg));
    }
    hS(uf(0xe3a), uf(0x4ba)),
      hS(uf(0x7ab), uf(0xcaa)),
      hS(uf(0xa94), uf(0xe36)),
      hS(uf(0x679), uf(0xa05)),
      hS(uf(0x5dd), uf(0xa15)),
      hS(uf(0x61b), uf(0x6c0)),
      hS(uf(0xaaf), uf(0x54d));
    function hS(rh, ri) {
      const v7 = uf;
      document[v7(0x992)](rh)[v7(0x4fe)] = function () {
        const v8 = v7;
        window[v8(0x1cb)](ri, v8(0x35e));
      };
    }
    setInterval(function () {
      const v9 = uf;
      hW && il(new Uint8Array([cI[v9(0x43b)]]));
    }, 0x3e8);
    function hT() {
      const va = uf;
      (px = [pE]),
        (j6[va(0x75b)] = !![]),
        (j6 = {}),
        (jG = 0x0),
        (jH[va(0x4cf)] = 0x0),
        (iw = []),
        (iG[va(0x4cf)] = 0x0),
        (iC[va(0x8e1)] = ""),
        (iv = {}),
        (iH = ![]),
        (iy = null),
        (ix = null),
        (pn = 0x0),
        (hW = ![]),
        (mn = 0x0),
        (mm = 0x0),
        (m9 = ![]),
        (m5[va(0x35a)][va(0xbe5)] = va(0x5d0)),
        (pP[va(0x35a)][va(0xbe5)] = pO[va(0x35a)][va(0xbe5)] = va(0x5d0)),
        (pl = 0x0),
        (pm = 0x0);
    }
    var hU;
    function hV(rh) {
      const vb = uf;
      (jh[vb(0x35a)][vb(0xbe5)] = vb(0x5d0)),
        (p2[vb(0x35a)][vb(0xbe5)] = vb(0x5d0)),
        hZ(),
        kA[vb(0x2ae)][vb(0x6b1)](vb(0xa7d)),
        kB[vb(0x2ae)][vb(0x218)](vb(0xa7d)),
        hT(),
        console[vb(0x454)](vb(0xa75) + rh + vb(0xb3c)),
        iu(),
        (hU = new WebSocket(rh)),
        (hU[vb(0x270)] = vb(0xc0c)),
        (hU[vb(0x8f7)] = hX),
        (hU[vb(0xa55)] = k1),
        (hU[vb(0xbdc)] = kg);
    }
    crypto[uf(0x7b3)] =
      crypto[uf(0x7b3)] ||
      function rh() {
        const vc = uf;
        return ([0x989680] + -0x3e8 + -0xfa0 + -0x1f40 + -0x174876e800)[
          vc(0x6d2)
        ](/[018]/g, (ri) =>
          (ri ^
            (crypto[vc(0x537)](new Uint8Array(0x1))[0x0] &
              (0xf >> (ri / 0x4))))[vc(0xe51)](0x10)
        );
      };
    var hW = ![];
    function hX() {
      const vd = uf;
      console[vd(0x454)](vd(0x274)), ie();
      hack.preload();
    }
    var hY = document[uf(0x992)](uf(0x80d));
    function hZ() {
      const ve = uf;
      hY[ve(0x35a)][ve(0xbe5)] = ve(0x5d0);
    }
    var i0 = document[uf(0x992)](uf(0x3c0)),
      i1 = document[uf(0x992)](uf(0x79a)),
      i2 = document[uf(0x992)](uf(0x5f3)),
      i3 = document[uf(0x992)](uf(0xe2a));
    i3[uf(0x4fe)] = function () {
      const vf = uf;
      !i6 &&
        (window[vf(0xc5a)][vf(0x66e)] =
          vf(0x8de) +
          encodeURIComponent(!window[vf(0x2eb)] ? vf(0x3a4) : vf(0xe52)) +
          vf(0xbf7) +
          encodeURIComponent(btoa(i5)));
    };
    var i4 = document[uf(0x992)](uf(0x55e));
    (i4[uf(0x4fe)] = function () {
      const vg = uf;
      i5 == hD[vg(0x353)] && delete hD[vg(0x353)];
      delete hD[vg(0x45a)];
      if (hU)
        try {
          hU[vg(0xc17)]();
        } catch (ri) {}
    }),
      hZ();
    var i5, i6;
    function i7(ri) {
      const vi = uf;
      try {
        let rk = function (rl) {
          const vh = b;
          return rl[vh(0x6d2)](/([.*+?\^$(){}|\[\]\/\\])/g, vh(0x4ac));
        };
        var rj = document[vi(0xe8a)][vi(0x698)](
          RegExp(vi(0xba7) + rk(ri) + vi(0x40a))
        );
        return rj ? rj[0x1] : null;
      } catch (rl) {
        return "";
      }
    }
    var i8 = !window[uf(0x2eb)];
    function i9(ri) {
      const vj = uf;
      try {
        document[vj(0xe8a)] = ri + vj(0xb1f) + (i8 ? vj(0x51d) : "");
      } catch (rj) {}
    }
    var ia = 0x0,
      ib;
    function ic() {
      const vk = uf;
      (ia = 0x0), (hW = ![]);
      !eV(hD[vk(0x353)]) && (hD[vk(0x353)] = crypto[vk(0x7b3)]());
      (i5 = hD[vk(0x353)]), (i6 = hD[vk(0x45a)]);
      !i6 &&
        ((i6 = i7(vk(0x45a))),
        i6 && (i6 = decodeURIComponent(i6)),
        i9(vk(0x45a)));
      if (i6)
        try {
          const ri = i6;
          i6 = JSON[vk(0x55c)](decodeURIComponent(escape(atob(ri))));
          if (eV(i6[vk(0x6a6)]))
            (i5 = i6[vk(0x6a6)]),
              i1[vk(0x99c)](vk(0x2c1), i6[vk(0xc25)]),
              i6[vk(0x4bc)] &&
                (i2[vk(0x35a)][vk(0xb03)] = vk(0xdf2) + i6[vk(0x4bc)] + ")"),
              (hD[vk(0x45a)] = ri);
          else throw new Error(vk(0x2f1));
        } catch (rj) {
          (i6 = null), delete hD[vk(0x45a)], console[vk(0x88f)](vk(0x5e7) + rj);
        }
      ib = hD[vk(0x614)] || "";
    }
    function ie() {
      ic(), ii();
    }
    function ig() {
      const vl = uf,
        ri = [
          vl(0x9e5),
          vl(0x42a),
          vl(0xb40),
          vl(0x70d),
          vl(0xb9d),
          vl(0x5cc),
          vl(0xa6f),
          vl(0x84a),
          vl(0xb8e),
          vl(0x36b),
          vl(0xd4d),
          vl(0x2d6),
          vl(0xd08),
          vl(0x4ad),
          vl(0x6d1),
          vl(0xa5a),
          vl(0x2fa),
          vl(0x4ab),
          vl(0x61a),
          vl(0xb32),
          vl(0x1d0),
          vl(0x940),
          vl(0xd7d),
          vl(0x563),
          vl(0x27b),
          vl(0x3d1),
          vl(0x840),
          vl(0xc73),
          vl(0x31a),
          vl(0xc07),
          vl(0xb20),
          vl(0xd0b),
          vl(0xe89),
          vl(0x709),
          vl(0x9d8),
          vl(0xbab),
          vl(0xb17),
          vl(0xc4a),
          vl(0x817),
          vl(0xb8f),
          vl(0xd68),
          vl(0x3bc),
          vl(0x742),
          vl(0xcce),
          vl(0x223),
          vl(0xa26),
          vl(0x1ec),
          vl(0x7a9),
          vl(0x257),
          vl(0xec0),
          vl(0x9b7),
          vl(0x2aa),
          vl(0x443),
          vl(0x390),
          vl(0xed7),
          vl(0x46a),
          vl(0x838),
          vl(0x68f),
          vl(0xa97),
          vl(0xdb7),
          vl(0x2e8),
          vl(0x818),
          vl(0x1d1),
          vl(0xa39),
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
          if (ih[vm(0xad6)] === void 0x0) {
            var ro = function (rt) {
              const vn = vm,
                ru = vn(0x52a);
              let rv = "",
                rw = "";
              for (
                let rx = 0xc6a + -0x161c + -0x22 * -0x49,
                  ry,
                  rz,
                  rA = 0x1 * -0x206f + -0x17 * 0xc1 + 0x31c6;
                (rz = rt[vn(0x6c6)](rA++));
                ~rz &&
                ((ry =
                  rx % (0xc * -0xfa + -0x2157 + 0x2d13)
                    ? ry * (0x2422 + -0x5 * 0x38b + -0x122b) + rz
                    : rz),
                rx++ % (0x189 + 0xd6 + -0x1 * 0x25b))
                  ? (rv += String[vn(0xdc4)](
                      (-0x13 * 0x1ff + 0x3bd + 0x232f) &
                        (ry >>
                          ((-(0x1 * -0x203 + 0x11 * 0x157 + -0x14c2) * rx) &
                            (0x1a25 + -0x10bb + 0x259 * -0x4)))
                    ))
                  : 0x26da + 0x2 * 0x80f + -0x1 * 0x36f8
              ) {
                rz = ru[vn(0xe00)](rz);
              }
              for (
                let rB = 0x23d0 + 0x13 * -0xdf + -0x1343, rC = rv[vn(0x4cf)];
                rB < rC;
                rB++
              ) {
                rw +=
                  "%" +
                  ("00" +
                    rv[vn(0x50c)](rB)[vn(0xe51)](
                      -0x2 * -0x66d + -0x1 * -0x1e49 + -0x2b13
                    ))[vn(0xb26)](-(0x22ea + 0x2391 + 0x4679 * -0x1));
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
                  (rw + rv[rz] + ru[vo(0x50c)](rz % ru[vo(0x4cf)])) %
                  (-0x15a6 + 0x5 * 0x4f7 + 0x22d * -0x1)),
                  (rx = rv[rz]),
                  (rv[rz] = rv[rw]),
                  (rv[rw] = rx);
              }
              (rz = 0x1 * -0x1435 + -0x88b * 0x1 + 0x1cc0),
                (rw = 0x236 * 0x1 + -0x595 * -0x3 + -0xd3 * 0x17);
              for (
                let rA = -0x1d30 + -0x23c8 + 0x40f8;
                rA < rt[vo(0x4cf)];
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
                  (ry += String[vo(0xdc4)](
                    rt[vo(0x50c)](rA) ^
                      rv[(rv[rz] + rv[rw]) % (0xfab + 0x388 * 0x6 + -0x23db)]
                  ));
              }
              return ry;
            };
            (ih[vm(0xd11)] = rs), (ri = arguments), (ih[vm(0xad6)] = !![]);
          }
          const rp = rk[-0xacc + 0x17a5 * -0x1 + 0x2271],
            rq = rl + rp,
            rr = ri[rq];
          return (
            !rr
              ? (ih[vm(0x67b)] === void 0x0 && (ih[vm(0x67b)] = !![]),
                (rn = ih[vm(0xd11)](rn, rm)),
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
            (parseInt(rk(0x1a1, 0x1b2, 0x1a9, 0x1b7, vp(0x2ad))) /
              (0xad * 0x13 + 0x1 * -0x6cd + 0x67 * -0xf)) *
              (parseInt(rm(-0x105, -0x12e, -0x131, vp(0x2ad), -0x11d)) /
                (-0x19aa + 0x595 + -0x1 * -0x1417)) +
            parseInt(rk(0x1b5, 0x1c9, 0x1b1, 0x1cb, vp(0x7f1))) /
              (-0x269a + -0x1c99 + 0x4336 * 0x1) +
            (-parseInt(rm(-0x128, -0x132, -0x134, vp(0x3f3), -0x13c)) /
              (-0x342 + -0x2 * -0x77b + -0xbb0)) *
              (-parseInt(rm(-0x131, -0x155, -0x130, vp(0x9e6), -0x139)) /
                (-0x1509 + -0x2e2 * 0x2 + 0x1ad2)) +
            (parseInt(rn(0x9a, 0xb1, 0xb2, vp(0x7f1), 0x85)) /
              (-0x1 * -0x13ff + -0x6 * 0x30a + -0x1bd)) *
              (-parseInt(rk(0x1b5, 0x1d3, 0x1bc, 0x1d1, vp(0x8d0))) /
                (0x1 * 0x9dd + -0x5d * 0x23 + 0x2e1 * 0x1)) +
            -parseInt(rn(0xb2, 0xbe, 0xb9, vp(0x691), 0xbb)) /
              (-0x216b + 0xb6f * -0x2 + -0xd * -0x455) +
            (parseInt(rk(0x183, 0x1ae, 0x197, 0x19e, vp(0xc99))) /
              (0x85e + 0x112d + 0xcc1 * -0x2)) *
              (-parseInt(rp(-0x244, -0x216, -0x232, -0x217, vp(0xb3a))) /
                (-0x12f9 * 0x1 + -0x5c * 0x42 + 0x2abb)) +
            (parseInt(rm(-0x126, -0x10f, -0x13a, vp(0xde0), -0x12a)) /
              (-0x59d + -0x2 * -0x8ed + -0x1be * 0x7)) *
              (parseInt(rp(-0x203, -0x209, -0x200, -0x1e1, vp(0x8aa))) /
                (0x1590 + 0xb94 + -0x2118));
          if (rq === rj) break;
          else ro[vp(0x9ee)](ro[vp(0x2e2)]());
        } catch (rr) {
          ro[vp(0x9ee)](ro[vp(0x2e2)]());
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
            rl(vq(0x3f3), -0x130, -0x106, -0x11f, -0x11d) +
            rl(vq(0x96c), -0x11a, -0x142, -0x138, -0x135),
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
        ri[rk(-0x27e, -0x274, -0x265, vq(0xc64), -0x274)](
          typeof window,
          ri[rm(vq(0x8b4), 0x1fc, 0x1ed, 0x202, 0x1ec)]
        ) ||
        ri[ro(-0x17d, -0x171, -0x181, vq(0x29e), -0x16a)](
          typeof ki,
          ri[rk(-0x25a, -0x263, -0x26c, vq(0x96c), -0x270)]
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
      const rn = rj[rm(vq(0x691), 0x1c0, 0x1c3, 0x1bc, 0x1c9) + "h"];
      function ro(ru, rv, rw, rx, ry) {
        return ih(ru - -0x20a, rx);
      }
      const rp = ri[rr(0x43a, vq(0x3c7), 0x40e, 0x428, 0x430)](
        ij,
        ri[rk(-0x28e, -0x27f, -0x272, vq(0x29e), -0x281)](
          ri[rl(vq(0x33f), -0x12c, -0x141, -0x13e, -0x12e)](
            -0x1a32 + 0x1b21 * 0x1 + -0xec,
            rn
          ),
          ib[rl(vq(0x4a4), -0x120, -0x111, -0x12e, -0x121) + "h"]
        )
      );
      let rq = 0x1d * -0xa3 + -0x11cd + 0x2444;
      rp[
        rl(vq(0xa57), -0x11e, -0x149, -0x131, -0x13c) +
          ro(-0x172, -0x16e, -0x175, vq(0x8b4), -0x166)
      ](rq++, cI[ro(-0x18e, -0x16e, -0x17a, vq(0x3f3), -0x1a6)]),
        rp[
          rr(0x415, vq(0xc6f), 0x44c, 0x433, 0x422) +
            rm(vq(0xac5), 0x1e4, 0x1bc, 0x1bf, 0x1d7)
        ](rq, cJ),
        (rq += -0x3dd + -0x6b5 + 0xa94);
      function rr(ru, rv, rw, rx, ry) {
        return ih(rx - 0x3a2, rv);
      }
      const rs = ri[rr(0x43c, vq(0x7ef), 0x43b, 0x446, 0x459)](
        ri[rk(-0x283, -0x272, -0x298, vq(0xea1), -0x26e)](
          cJ,
          0x7 * -0x19b + -0x12cf + -0x1e1d * -0x1
        ),
        -0xd * 0x81 + 0x61 * 0x4 + -0x2 * -0x304
      );
      for (
        let ru = 0x303 * -0xc + 0x133c + -0x21d * -0x8;
        ri[rm(vq(0x2a5), 0x200, 0x1fc, 0x1fc, 0x1e5)](ru, rn);
        ru++
      ) {
        rp[
          rk(-0x287, -0x273, -0x27d, vq(0x8b4), -0x27c) +
            rm(vq(0xe97), 0x1e7, 0x20b, 0x20f, 0x1f2)
        ](
          rq++,
          ri[rm(vq(0xd4e), 0x201, 0x215, 0x21c, 0x1fc)](
            rj[
              rl(vq(0x1d8), -0x11c, -0x130, -0x128, -0x13b) +
                rk(-0x289, -0x29c, -0x26a, vq(0x4a4), -0x290)
            ](
              ri[rl(vq(0xbff), -0x13a, -0x124, -0x111, -0x120)](
                ri[rl(vq(0xc64), -0x10d, -0x119, -0x108, -0x128)](rn, ru),
                -0xfd5 + -0x277 * -0x7 + -0x16b
              )
            ),
            rs
          )
        );
      }
      if (ib) {
        const rv = ib[rm(vq(0x29e), 0x1e6, 0x1b2, 0x1d3, 0x1d0) + "h"];
        for (
          let rw = 0x1 * -0x1a49 + 0x22cd * -0x1 + 0x45d * 0xe;
          ri[rm(vq(0x97a), 0x21f, 0x216, 0x204, 0x200)](rw, rv);
          rw++
        ) {
          rp[
            rm(vq(0xac5), 0x207, 0x20e, 0x209, 0x202) +
              rm(vq(0x1d8), 0x1ec, 0x1cb, 0x200, 0x1e8)
          ](
            rq++,
            ri[rk(-0x25b, -0x256, -0x24f, vq(0x2f8), -0x261)](
              ib[
                rk(-0x267, -0x256, -0x25e, vq(0xaa8), -0x271) +
                  rr(0x412, vq(0x1d8), 0x411, 0x421, 0x425)
              ](
                ri[rr(0x435, vq(0x2ad), 0x427, 0x434, 0x41a)](
                  ri[rl(vq(0x9e2), -0x143, -0x134, -0x133, -0x137)](rv, rw),
                  -0x18d * 0x3 + -0x5 * 0x139 + -0x397 * -0x3
                )
              ),
              rs
            )
          );
        }
      }
      const rt = rp[
        rr(0x423, vq(0x3f3), 0x44b, 0x440, 0x45a) +
          rk(-0x280, -0x27d, -0x26e, vq(0xac5), -0x288)
      ](
        ri[ro(-0x162, -0x164, -0x161, vq(0x96c), -0x164)](
          0x21f * -0x1 + 0xbbf * 0x3 + -0x211b,
          ri[rr(0x429, vq(0xdbe), 0x43d, 0x437, 0x44b)](
            ri[rl(vq(0xc99), -0x10d, -0x127, -0x124, -0x116)](
              cJ,
              0x1 * 0x15fb + 0x2 * -0x774 + -0x52
            ),
            rn
          )
        )
      );
      ri[rr(0x435, vq(0x4be), 0x43b, 0x42a, 0x448)](il, rp), (ia = rt);
    }
    function ij(ri) {
      return new DataView(new ArrayBuffer(ri));
    }
    function ik() {
      const vr = uf;
      return hU && hU[vr(0xa34)] === WebSocket[vr(0xcd5)];
    }
    function il(ri) {
      const vs = uf;
      if (ik()) {
        po += ri[vs(0x806)];
        if (hW) {
          const rj = new Uint8Array(ri[vs(0x6fe)]);
          for (let rm = 0x0; rm < rj[vs(0x4cf)]; rm++) {
            rj[rm] ^= ia;
          }
          const rk = cJ % rj[vs(0x4cf)],
            rl = rj[0x0];
          (rj[0x0] = rj[rk]), (rj[rk] = rl);
        }
        hU[vs(0xb0f)](ri);
      }
    }
    function im(ri, rj = 0x1) {
      const vt = uf;
      let rk = eU(ri);
      const rl = new Uint8Array([
        cI[vt(0x972)],
        rk,
        Math[vt(0x2d8)](rj * 0xff),
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
          vu(0xdb8),
          vu(0x316),
          vu(0xa5f),
          vu(0x37b),
          vu(0x3b4),
          vu(0x785),
          vu(0xb7b),
          vu(0xe86),
          vu(0xb02),
          vu(0x668),
          vu(0x2da),
          vu(0x587),
          vu(0x957),
          vu(0x60a),
          vu(0x8ad),
          vu(0xace),
          vu(0x6df),
          vu(0xcf4),
          vu(0xbe7),
          vu(0xdc1),
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
          else rl[vv(0x9ee)](rl[vv(0x2e2)]());
        } catch (rr) {
          rl[vv(0x9ee)](rl[vv(0x2e2)]());
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
        (kk[vw(0x8e1)] = vw(0x8d5) + ri + vw(0xa4e) + rj + vw(0x4aa)),
        kk[vw(0x962)](hY),
        (hY[vw(0x35a)][vw(0xbe5)] = ""),
        (i3[vw(0x35a)][vw(0xbe5)] = vw(0x5d0)),
        (i0[vw(0x35a)][vw(0xbe5)] = vw(0x5d0)),
        (hY[vw(0x992)](vw(0x636))[vw(0x35a)][vw(0xe1e)] = "0"),
        document[vw(0x92f)][vw(0x2ae)][vw(0x218)](vw(0x888)),
        (kk[vw(0x35a)][vw(0xbe5)] = ""),
        (kl[vw(0x35a)][vw(0xbe5)] =
          kn[vw(0x35a)][vw(0xbe5)] =
          km[vw(0x35a)][vw(0xbe5)] =
          kC[vw(0x35a)][vw(0xbe5)] =
            vw(0x5d0));
      const rl = document[vw(0x992)](vw(0x42f));
      document[vw(0x992)](vw(0x826))[vw(0x4fe)] = function () {
        ro();
      };
      let rm = rk;
      k8(rl, vw(0xbc2) + rm + vw(0x5b4));
      const rn = setInterval(() => {
        const vx = vw;
        rm--, rm <= 0x0 ? ro() : k8(rl, vx(0xbc2) + rm + vx(0x5b4));
      }, 0x3e8);
      function ro() {
        const vy = vw;
        clearInterval(rn), k8(rl, vy(0x780)), location[vy(0xea8)]();
      }
    }
    function iu() {
      const vz = uf;
      if (hU) {
        hU[vz(0x8f7)] = hU[vz(0xa55)] = hU[vz(0xbdc)] = null;
        try {
          hU[vz(0xc17)]();
        } catch (ri) {}
        hU = null;
      }
    }
    var iv = {},
      iw = [],
      ix,
      iy,
      iz = [],
      iA = uf(0x30f);
    function iB() {
      const vA = uf;
      iA = getComputedStyle(document[vA(0x92f)])[vA(0xd02)];
    }
    var iC = document[uf(0x992)](uf(0x5ac)),
      iD = document[uf(0x992)](uf(0xea2)),
      iE = document[uf(0x992)](uf(0x8ed)),
      iF = [],
      iG = [],
      iH = ![],
      iI = 0x0;
    function iJ(ri) {
      const vB = uf;
      if (ri < 0.01) return "0";
      ri = Math[vB(0x2d8)](ri);
      if (ri >= 0x3b9aca00)
        return parseFloat((ri / 0x3b9aca00)[vB(0x56a)](0x2)) + "b";
      else {
        if (ri >= 0xf4240)
          return parseFloat((ri / 0xf4240)[vB(0x56a)](0x2)) + "m";
        else {
          if (ri >= 0x3e8)
            return parseFloat((ri / 0x3e8)[vB(0x56a)](0x1)) + "k";
        }
      }
      return ri;
    }
    function iK(ri, rj) {
      const vC = uf,
        rk = document[vC(0xde7)](vC(0xe04));
      rk[vC(0xe6a)] = vC(0xa90);
      const rl = document[vC(0xde7)](vC(0xe04));
      (rl[vC(0xe6a)] = vC(0x310)), rk[vC(0x962)](rl);
      const rm = document[vC(0xde7)](vC(0xb61));
      rk[vC(0x962)](rm), iC[vC(0x962)](rk);
      const rn = {};
      (rn[vC(0xb82)] = ri),
        (rn[vC(0x95f)] = rj),
        (rn[vC(0x710)] = 0x0),
        (rn[vC(0xc23)] = 0x0),
        (rn[vC(0x3b2)] = 0x0),
        (rn["el"] = rk),
        (rn[vC(0x70b)] = rl),
        (rn[vC(0x241)] = rm);
      const ro = rn;
      (ro[vC(0x351)] = iG[vC(0x4cf)]),
        (ro[vC(0x30b)] = function () {
          const vD = vC;
          (this[vD(0x710)] = pg(this[vD(0x710)], this[vD(0x95f)], 0x64)),
            (this[vD(0x3b2)] = pg(this[vD(0x3b2)], this[vD(0xc23)], 0x64)),
            this[vD(0x241)][vD(0x99c)](
              vD(0x2c1),
              (this[vD(0xb82)] ? this[vD(0xb82)] + vD(0xafb) : "") +
                iJ(this[vD(0x710)])
            ),
            (this[vD(0x70b)][vD(0x35a)][vD(0x8df)] = this[vD(0x3b2)] + "%");
        }),
        ro[vC(0x30b)](),
        iG[vC(0x9ee)](ro);
    }
    function iL(ri) {
      const vE = uf;
      if (iG[vE(0x4cf)] === 0x0) return;
      const rj = iG[0x0];
      rj[vE(0xc23)] = rj[vE(0x3b2)] = 0x64;
      for (let rk = 0x1; rk < iG[vE(0x4cf)]; rk++) {
        const rl = iG[rk];
        (rl[vE(0xc23)] =
          Math[vE(0x36c)](
            0x1,
            rj[vE(0x95f)] === 0x0 ? 0x1 : rl[vE(0x95f)] / rj[vE(0x95f)]
          ) * 0x64),
          ri && (rl[vE(0x3b2)] = rl[vE(0xc23)]),
          iC[vE(0x962)](rl["el"]);
      }
    }
    function iM(ri) {
      const vF = uf,
        rj = new Path2D();
      rj[vF(0xd7c)](...ri[vF(0xd5a)][0x0]);
      for (let rk = 0x0; rk < ri[vF(0xd5a)][vF(0x4cf)] - 0x1; rk++) {
        const rl = ri[vF(0xd5a)][rk],
          rm = ri[vF(0xd5a)][rk + 0x1];
        let rn = 0x0;
        const ro = rm[0x0] - rl[0x0],
          rp = rm[0x1] - rl[0x1],
          rq = Math[vF(0x78b)](ro, rp);
        while (rn < rq) {
          rj[vF(0xbc9)](
            rl[0x0] + (rn / rq) * ro + (Math[vF(0xa69)]() * 0x2 - 0x1) * 0x32,
            rl[0x1] + (rn / rq) * rp + (Math[vF(0xa69)]() * 0x2 - 0x1) * 0x32
          ),
            (rn += Math[vF(0xa69)]() * 0x28 + 0x1e);
        }
        rj[vF(0xbc9)](...rm);
      }
      ri[vF(0x601)] = rj;
    }
    var iN = 0x0,
      iO = 0x0,
      iP = [],
      iQ = {},
      iR = [],
      iS = {};
    function iT(ri, rj) {
      const vG = uf;
      if (!oV[vG(0x9c8)]) return;
      var baseHP = getHP(ri, hack.moblst);
      var decDmg = ri['nHealth'] - rj;
      var dmg = Math.floor(decDmg * 10000) / 100 + '%';
      if(baseHP && hack.isEnabled('DDenableNumber')) var dmg = Math.floor(decDmg * baseHP);
      let rk;
      const rl = rj === void 0x0;
      !rl && (rk = Math[vG(0x333)]((ri[vG(0x7f0)] - rj) * 0x64) || 0x1),
        iz[vG(0x9ee)]({
            text: hack.isEnabled('damageDisplay') ? dmg : rk,
          x: ri["x"] + (Math[vG(0xa69)]() * 0x2 - 0x1) * ri[vG(0xc39)] * 0.6,
          y: ri["y"] + (Math[vG(0xa69)]() * 0x2 - 0x1) * ri[vG(0xc39)] * 0.6,
          vx: (Math[vG(0xa69)]() * 0x2 - 0x1) * 0x2,
          vy: -0x5 - Math[vG(0xa69)]() * 0x3,
          angle: (Math[vG(0xa69)]() * 0x2 - 0x1) * (rl ? 0x1 : 0.1),
          size: Math[vG(0x525)](0x1, (ri[vG(0xc39)] * 0.2) / 0x14),
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
        rj[vH(0x613)] = !![];
        if (
          Math[vH(0xc8b)](rj["nx"] - iU) > iW + rj[vH(0xc60)] ||
          Math[vH(0xc8b)](rj["ny"] - iV) > iX + rj[vH(0xc60)]
        )
          rj[vH(0x69a)] = 0xa;
        else !rj[vH(0xb21)] && iT(rj, 0x0);
        delete iv[ri];
      }
    }
    var iZ = [
      uf(0x1df),
      uf(0xdbd),
      uf(0x7d4),
      uf(0xab4),
      uf(0x2cf),
      uf(0x275),
      uf(0xd01),
      uf(0xd31),
      uf(0x936),
      uf(0x5ae),
      uf(0x876),
      uf(0x9bc),
      uf(0xdfb),
    ];
    function j0(ri, rj = iy) {
      const vI = uf;
      (ri[vI(0x1df)] = rj[vI(0x1df)]),
        (ri[vI(0xdbd)] = rj[vI(0xdbd)]),
        (ri[vI(0x7d4)] = rj[vI(0x7d4)]),
        (ri[vI(0xab4)] = rj[vI(0xab4)]),
        (ri[vI(0x2cf)] = rj[vI(0x2cf)]),
        (ri[vI(0x275)] = rj[vI(0x275)]),
        (ri[vI(0xd01)] = rj[vI(0xd01)]),
        (ri[vI(0xd31)] = rj[vI(0xd31)]),
        (ri[vI(0x936)] = rj[vI(0x936)]),
        (ri[vI(0x5ae)] = rj[vI(0x5ae)]),
        (ri[vI(0x28e)] = rj[vI(0x28e)]),
        (ri[vI(0x876)] = rj[vI(0x876)]),
        (ri[vI(0x5d5)] = rj[vI(0x5d5)]),
        (ri[vI(0x9bc)] = rj[vI(0x9bc)]),
        (ri[vI(0xdfb)] = rj[vI(0xdfb)]);
    }
    function j1() {
      (oJ = null), oR(null), (oN = null), (oL = ![]), (oM = 0x0), o5 && pw();
    }
    var j2 = 0x64,
      j3 = 0x1,
      j4 = 0x64,
      j5 = 0x1,
      j6 = {},
      j7 = [...Object[uf(0x28d)](d9)],
      j8 = [...hQ];
    ja(j7),
      ja(j8),
      j7[uf(0x9ee)](uf(0xec8)),
      j8[uf(0x9ee)](hP[uf(0x855)] || uf(0xcfc)),
      j7[uf(0x9ee)](uf(0xa1d)),
      j8[uf(0x9ee)](uf(0x49e));
    var j9 = [];
    for (let ri = 0x0; ri < j7[uf(0x4cf)]; ri++) {
      const rj = d9[j7[ri]] || 0x0;
      j9[ri] = 0x78 + (rj - d9[uf(0x201)]) * 0x3c - 0x1 + 0x1;
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
          vJ(0xeba) + j7[rk] + vJ(0x570) + rl + vJ(0x924) + rl + vJ(0x685)
        ),
        rn = rm[vJ(0x992)](vJ(0xa45));
      (j6 = {
        id: rk,
        el: rm,
        state: cT[vJ(0x5d0)],
        t: 0x0,
        dur: 0x1f4,
        doRemove: ![],
        els: {},
        mobsEl: rm[vJ(0x992)](vJ(0xb35)),
        progressEl: rn,
        barEl: rn[vJ(0x992)](vJ(0x203)),
        textEl: rn[vJ(0x992)](vJ(0xb61)),
        nameEl: rm[vJ(0x992)](vJ(0x2b0)),
        nProg: 0x0,
        oProg: 0x0,
        prog: 0x0,
        updateTime: 0x0,
        updateProg() {
          const vK = vJ,
            ro = Math[vK(0x36c)](0x1, (pz - this[vK(0xc2f)]) / 0x64);
          this[vK(0x41f)] =
            this[vK(0xc88)] + (this[vK(0x6e9)] - this[vK(0xc88)]) * ro;
          const rp = this[vK(0x41f)] - 0x1;
          this[vK(0x70b)][vK(0x35a)][vK(0x53f)] =
            vK(0x91b) + rp * 0x64 + vK(0xd67) + rp + vK(0xb09);
        },
        update() {
          const vL = vJ,
            ro = je(this["t"]),
            rp = 0x1 - ro;
          (this["el"][vL(0x35a)][vL(0xe1e)] = -0xc8 * rp + "px"),
            (this["el"][vL(0x35a)][vL(0x53f)] = vL(0x72c) + -0x64 * rp + "%)");
        },
        remove() {
          const vM = vJ;
          rm[vM(0x218)]();
        },
      }),
        (j6[vJ(0x960)][vJ(0x35a)][vJ(0xbe5)] = vJ(0x5d0)),
        jc[vJ(0x9ee)](j6),
        j6[vJ(0x30b)](),
        jb[vJ(0x9ee)](j6),
        km[vJ(0xc7b)](rm, pM);
    }
    function je(rk) {
      return 0x1 - (0x1 - rk) * (0x1 - rk);
    }
    function jf(rk) {
      const vN = uf;
      return rk < 0.5
        ? (0x1 - Math[vN(0xb4b)](0x1 - Math[vN(0x367)](0x2 * rk, 0x2))) / 0x2
        : (Math[vN(0xb4b)](0x1 - Math[vN(0x367)](-0x2 * rk + 0x2, 0x2)) + 0x1) /
            0x2;
    }
    function jg() {
      const vO = uf;
      (ok[vO(0x8e1)] = ""), (om = {});
    }
    var jh = document[uf(0x992)](uf(0x815));
    jh[uf(0x35a)][uf(0xbe5)] = uf(0x5d0);
    var ji = document[uf(0x992)](uf(0x528)),
      jj = [],
      jk = document[uf(0x992)](uf(0x90a));
    jk[uf(0xe9f)] = function () {
      jl();
    };
    function jl() {
      const vP = uf;
      for (let rk = 0x0; rk < jj[vP(0x4cf)]; rk++) {
        const rl = jj[rk];
        k8(rl[vP(0x44e)][0x0], jk[vP(0x1ea)] ? vP(0x5c9) : rl[vP(0xc30)]);
      }
    }
    function jm(rk) {
      const vQ = uf;
      (jh[vQ(0x35a)][vQ(0xbe5)] = ""), (ji[vQ(0x8e1)] = vQ(0x93d));
      const rl = rk[vQ(0x4cf)];
      jj = [];
      for (let rm = 0x0; rm < rl; rm++) {
        const rn = rk[rm];
        ji[vQ(0x962)](nA(vQ(0xdad) + (rm + 0x1) + vQ(0x626))), jn(rn);
      }
      m1[vQ(0xd5d)][vQ(0xa7d)]();
    }
    function jn(rk) {
      const vR = uf;
      for (let rl = 0x0; rl < rk[vR(0x4cf)]; rl++) {
        const rm = rk[rl],
          rn = nA(vR(0xe16) + rm + vR(0x5b2));
        (rn[vR(0xc30)] = rm),
          rl > 0x0 && jj[vR(0x9ee)](rn),
          (rn[vR(0x4fe)] = function () {
            jp(rm);
          }),
          ji[vR(0x962)](rn);
      }
      jl();
    }
    function jo(rk) {
      const vS = uf;
      var rl = document[vS(0xde7)](vS(0x3d2));
      (rl[vS(0x6f8)] = rk),
        (rl[vS(0x35a)][vS(0x928)] = "0"),
        (rl[vS(0x35a)][vS(0xeb2)] = "0"),
        (rl[vS(0x35a)][vS(0xa24)] = vS(0xe05)),
        document[vS(0x92f)][vS(0x962)](rl),
        rl[vS(0x211)](),
        rl[vS(0xcf7)]();
      try {
        var rm = document[vS(0x527)](vS(0xd6e)),
          rn = rm ? vS(0xb4c) : vS(0x6ca);
      } catch (ro) {}
      document[vS(0x92f)][vS(0x48a)](rl);
    }
    function jp(rk) {
      const vT = uf;
      if (!navigator[vT(0xb2c)]) {
        jo(rk);
        return;
      }
      navigator[vT(0xb2c)][vT(0x9c1)](rk)[vT(0x2c6)](
        function () {},
        function (rl) {}
      );
    }
    var jq = [
        uf(0xa43),
        uf(0x481),
        uf(0x998),
        uf(0x83d),
        uf(0x55b),
        uf(0x224),
        uf(0x886),
        uf(0xaa9),
        uf(0x925),
        uf(0x41d),
        uf(0x8c8),
      ],
      jr = [uf(0xc1c), uf(0x8b9), uf(0xb90)];
    function js(rk) {
      const vU = uf,
        rl = rk ? jr : jq;
      return rl[Math[vU(0xb02)](Math[vU(0xa69)]() * rl[vU(0x4cf)])];
    }
    function jt(rk) {
      const vV = uf;
      return rk[vV(0x698)](/^(a|e|i|o|u)/i) ? "An" : "A";
    }
    var ju = document[uf(0x992)](uf(0x753));
    ju[uf(0x4fe)] = ng(function (rk) {
      const vW = uf;
      iy && il(new Uint8Array([cI[vW(0x816)]]));
    });
    var jv = "";
    function jw(rk) {
      const vX = uf;
      return rk[vX(0x6d2)](/"/g, vX(0xe59));
    }
    function jx(rk) {
      const vY = uf;
      let rl = "";
      for (let rm = 0x0; rm < rk[vY(0x4cf)]; rm++) {
        const [rn, ro, rp] = rk[rm];
        rl +=
          vY(0x299) +
          rn +
          "\x22\x20" +
          (rp ? vY(0x427) : "") +
          vY(0x873) +
          jw(ro) +
          vY(0x492);
      }
      return vY(0x97b) + rl + vY(0xa92);
    }
    var jy = ![];
    function jz() {
      const vZ = uf;
      return nA(vZ(0x68c) + hP[vZ(0x201)] + vZ(0x548));
    }
    var jA = document[uf(0x992)](uf(0x86f));
    function jB() {
      const w0 = uf;
      (oC[w0(0x35a)][w0(0xbe5)] = pM[w0(0x35a)][w0(0xbe5)] =
        jy ? w0(0x5d0) : ""),
        (jA[w0(0x35a)][w0(0xbe5)] = ky[w0(0x35a)][w0(0xbe5)] =
          jy ? "" : w0(0x5d0));
      jy
        ? (kz[w0(0x2ae)][w0(0x6b1)](w0(0x471)),
          k8(kz[w0(0x44e)][0x0], w0(0x426)))
        : (kz[w0(0x2ae)][w0(0x218)](w0(0x471)),
          k8(kz[w0(0x44e)][0x0], w0(0x95a)));
      const rk = [hG, m7];
      for (let rl = 0x0; rl < rk[w0(0x4cf)]; rl++) {
        const rm = rk[rl];
        rm[w0(0x2ae)][jy ? w0(0x6b1) : w0(0x218)](w0(0xb6c)),
          (rm[w0(0x45d)] = jy ? jz : null),
          (rm[w0(0x9ed)] = !![]);
      }
      jC[w0(0x35a)][w0(0xbe5)] = nJ[w0(0x35a)][w0(0xbe5)] = jy ? w0(0x5d0) : "";
    }
    var jC = document[uf(0x992)](uf(0x842)),
      jD = document[uf(0x992)](uf(0xb98)),
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
      for (let rn = jL[w1(0x4cf)] - 0x1; rn >= 0x0; rn--) {
        const ro = jL[rn];
        if (ni(rk, ro) > 0.7) {
          rm++;
          if (rm >= 0x5) return ![];
        }
      }
      return jL[w1(0x9ee)](rk), !![];
    }
    var jO = document[uf(0x992)](uf(0x21a)),
      jP = document[uf(0x992)](uf(0x4b9)),
      jQ = document[uf(0x992)](uf(0x848)),
      jR = document[uf(0x992)](uf(0x437)),
      jS;
    k8(jQ, "-"),
      (jQ[uf(0x4fe)] = function () {
        if (jS) mi(jS);
      });
    var jT = 0x0,
      jU = document[uf(0x992)](uf(0x907));
    setInterval(() => {
      const w2 = uf;
      jT--;
      if (jT < 0x0) {
        jU[w2(0x2ae)][w2(0xb8c)](w2(0xa7d)) &&
          hW &&
          il(new Uint8Array([cI[w2(0xe63)]]));
        return;
      }
      jV();
    }, 0x3e8);
    function jV() {
      k8(jR, ka(jT * 0x3e8));
    }
    function jW() {
      const w3 = uf,
        rk = document[w3(0x992)](w3(0x541))[w3(0x44e)],
        rl = document[w3(0x992)](w3(0xb55))[w3(0x44e)];
      for (let rm = 0x0; rm < rk[w3(0x4cf)]; rm++) {
        const rn = rk[rm],
          ro = rl[rm];
        rn[w3(0x4fe)] = function () {
          const w4 = w3;
          for (let rp = 0x0; rp < rl[w4(0x4cf)]; rp++) {
            const rq = rm === rp;
            (rl[rp][w4(0x35a)][w4(0xbe5)] = rq ? "" : w4(0x5d0)),
              rk[rp][w4(0x2ae)][rq ? w4(0x6b1) : w4(0x218)](w4(0x233));
          }
        };
      }
      rk[0x0][w3(0x4fe)]();
    }
    jW();
    var jX = [];
    function jY(rk) {
      const w5 = uf;
      rk[w5(0x2ae)][w5(0x6b1)](w5(0xd61)), jX[w5(0x9ee)](rk);
    }
    var jZ,
      k0 = document[uf(0x992)](uf(0x259));
    function k1(rk, rl = !![]) {
      const w6 = uf;
      if (rl) {
        if (pz < jG) {
          jH[w6(0x9ee)](rk);
          return;
        } else {
          if (jH[w6(0x4cf)] > 0x0)
            while (jH[w6(0x4cf)] > 0x0) {
              k1(jH[w6(0x2e2)](), ![]);
            }
        }
      }
      function rm() {
        const w7 = w6,
          ry = rv[w7(0x200)](rw++),
          rz = new Uint8Array(ry);
        for (let rA = 0x0; rA < ry; rA++) {
          rz[rA] = rv[w7(0x200)](rw++);
        }
        return new TextDecoder()[w7(0xce3)](rz);
      }
      function rn() {
        const w8 = w6;
        return rv[w8(0x200)](rw++) / 0xff;
      }
      function ro(ry) {
        const w9 = w6,
          rz = rv[w9(0x71b)](rw);
        (rw += 0x2),
          (ry[w9(0x4b3)] = rz & 0x1),
          (ry[w9(0x1df)] = rz & 0x2),
          (ry[w9(0xdbd)] = rz & 0x4),
          (ry[w9(0x7d4)] = rz & 0x8),
          (ry[w9(0xab4)] = rz & 0x10),
          (ry[w9(0x2cf)] = rz & 0x20),
          (ry[w9(0x275)] = rz & 0x40),
          (ry[w9(0xd01)] = rz & 0x80),
          (ry[w9(0xd31)] = rz & 0x100),
          (ry[w9(0x936)] = rz & (0x1 << 0x9)),
          (ry[w9(0x5ae)] = rz & (0x1 << 0xa)),
          (ry[w9(0x28e)] = rz & (0x1 << 0xb)),
          (ry[w9(0x876)] = rz & (0x1 << 0xc)),
          (ry[w9(0x5d5)] = rz & (0x1 << 0xd)),
          (ry[w9(0x9bc)] = rz & (0x1 << 0xe)),
          (ry[w9(0xdfb)] = rz & (0x1 << 0xf));
      }
      function rp() {
        const wa = w6,
          ry = rv[wa(0x764)](rw);
        rw += 0x4;
        const rz = rm();
        iK(rz, ry);
      }
      function rq() {
        const wb = w6,
          ry = rv[wb(0x71b)](rw) - cG;
        return (rw += 0x2), ry;
      }
      function rr() {
        const wc = w6,
          ry = {};
        for (let rJ in mb) {
          (ry[rJ] = rv[wc(0x764)](rw)), (rw += 0x4);
        }
        const rz = rm(),
          rA = Number(rv[wc(0xca2)](rw));
        rw += 0x8;
        const rB = d5(d4(rA)[0x0]),
          rC = rB * 0x2,
          rD = Array(rC);
        for (let rK = 0x0; rK < rC; rK++) {
          const rL = rv[wc(0x71b)](rw) - 0x1;
          rw += 0x2;
          if (rL < 0x0) continue;
          rD[rK] = dC[rL];
        }
        const rE = [],
          rF = rv[wc(0x71b)](rw);
        rw += 0x2;
        for (let rM = 0x0; rM < rF; rM++) {
          const rN = rv[wc(0x71b)](rw);
          rw += 0x2;
          const rO = rv[wc(0x764)](rw);
          (rw += 0x4), rE[wc(0x9ee)]([dC[rN], rO]);
        }
        const rG = [],
          rH = rv[wc(0x71b)](rw);
        rw += 0x2;
        for (let rP = 0x0; rP < rH; rP++) {
          const rQ = rv[wc(0x71b)](rw);
          (rw += 0x2), !eK[rQ] && console[wc(0x454)](rQ), rG[wc(0x9ee)](eK[rQ]);
        }
        const rI = rv[wc(0x200)](rw++);
        mg(rz, ry, rE, rG, rA, rD, rI);
      }
      function rs() {
        const wd = w6,
          ry = Number(rv[wd(0xca2)](rw));
        return (rw += 0x8), ry;
      }
      function rt() {
        const we = w6,
          ry = rv[we(0x764)](rw);
        rw += 0x4;
        const rz = rv[we(0x200)](rw++),
          rA = {};
        (rA[we(0xb4f)] = ry), (rA[we(0x6dc)] = {});
        const rB = rA;
        f3[we(0xbed)]((rD, rE) => {
          const wf = we;
          rB[wf(0x6dc)][rD] = [];
          for (let rF = 0x0; rF < rz; rF++) {
            const rG = rm();
            let rH;
            rD === "xp" ? (rH = rs()) : ((rH = rv[wf(0x764)](rw)), (rw += 0x4)),
              rB[wf(0x6dc)][rD][wf(0x9ee)]([rG, rH]);
          }
        }),
          k8(jD, k9(rB[we(0xb4f)]) + we(0xc3f)),
          (ml[we(0x8e1)] = "");
        let rC = 0x0;
        for (let rD in rB[we(0x6dc)]) {
          const rE = kd(rD),
            rF = rB[we(0x6dc)][rD],
            rG = nA(we(0xa91) + rC + we(0xa76) + rE + we(0x984)),
            rH = rG[we(0x992)](we(0xcf2));
          for (let rI = 0x0; rI < rF[we(0x4cf)]; rI++) {
            const [rJ, rK] = rF[rI];
            let rL = ma(rD, rK);
            rD === "xp" && (rL += we(0x23b) + (d4(rK)[0x0] + 0x1) + ")");
            const rM = nA(
              we(0x417) + (rI + 0x1) + ".\x20" + rJ + we(0x497) + rL + we(0xb2e)
            );
            (rM[we(0x4fe)] = function () {
              mi(rJ);
            }),
              rH[we(0x5eb)](rM);
          }
          ml[we(0x5eb)](rG), rC++;
        }
      }
      function ru() {
        const wg = w6;
        (jS = rm()), k8(jQ, jS || "-");
        const ry = Number(rv[wg(0xca2)](rw));
        (rw += 0x8),
          (jT = Math[wg(0x2d8)]((ry - Date[wg(0x796)]()) / 0x3e8)),
          jV();
        const rz = rv[wg(0x71b)](rw);
        rw += 0x2;
        if (rz === 0x0) jP[wg(0x8e1)] = wg(0xb68);
        else {
          jP[wg(0x8e1)] = "";
          for (let rB = 0x0; rB < rz; rB++) {
            const rC = rm(),
              rD = rv[wg(0x9c7)](rw);
            rw += 0x4;
            const rE = rD * 0x64,
              rF = rE >= 0x1 ? rE[wg(0x56a)](0x2) : rE[wg(0x56a)](0x5),
              rG = nA(
                wg(0x221) +
                  (rB + 0x1) +
                  ".\x20" +
                  rC +
                  wg(0x87d) +
                  rF +
                  wg(0xe4e)
              );
            rC === jv && rG[wg(0x2ae)][wg(0x6b1)]("me"),
              (rG[wg(0x4fe)] = function () {
                mi(rC);
              }),
              jP[wg(0x962)](rG);
          }
        }
        k0[wg(0x8e1)] = "";
        const rA = rv[wg(0x71b)](rw);
        (rw += 0x2), (jZ = {});
        if (rA === 0x0)
          (jO[wg(0x8e1)] = wg(0xdb1)), (k0[wg(0x35a)][wg(0xbe5)] = wg(0x5d0));
        else {
          const rH = {};
          jO[wg(0x8e1)] = "";
          for (let rI = 0x0; rI < rA; rI++) {
            const rJ = rv[wg(0x71b)](rw);
            rw += 0x2;
            const rK = rv[wg(0x764)](rw);
            (rw += 0x4), (jZ[rJ] = rK);
            const rL = dC[rJ],
              rM = nA(
                wg(0xdb9) +
                  rL[wg(0xb9c)] +
                  wg(0x87a) +
                  qk(rL) +
                  wg(0xeca) +
                  rK +
                  wg(0x941)
              );
            (rM[wg(0x7e0)] = jU),
              jY(rM),
              (rM[wg(0x45d)] = rL),
              jO[wg(0x962)](rM),
              (rH[rL[wg(0xb9c)]] = (rH[rL[wg(0xb9c)]] || 0x0) + rK);
          }
          nX(jO), (k0[wg(0x35a)][wg(0xbe5)] = ""), oo(k0, rH);
        }
      }
      const rv = new DataView(rk[w6(0x1dc)]);
      po += rv[w6(0x806)];
      let rw = 0x0;
      const rx = rv[w6(0x200)](rw++);
      switch (rx) {
        case cI[w6(0x96e)]:
          {
            const rT = rv[w6(0x71b)](rw);
            rw += 0x2;
            for (let rU = 0x0; rU < rT; rU++) {
              const rV = rv[w6(0x71b)](rw);
              rw += 0x2;
              const rW = rv[w6(0x764)](rw);
              (rw += 0x4), mQ(rV, rW);
            }
          }
          break;
        case cI[w6(0x8c6)]:
          ru();
          break;
        case cI[w6(0x7a6)]:
          kC[w6(0x2ae)][w6(0x6b1)](w6(0xa7d)), hT(), (jG = pz + 0x1f4);
          break;
        case cI[w6(0xc68)]:
          (m5[w6(0x8e1)] = w6(0x7f4)), m5[w6(0x962)](m8), (m9 = ![]);
          break;
        case cI[w6(0x847)]: {
          const rX = dC[rv[w6(0x71b)](rw)];
          rw += 0x2;
          const rY = rv[w6(0x764)](rw);
          (rw += 0x4),
            (m5[w6(0x8e1)] =
              w6(0xea4) +
              rX[w6(0xb9c)] +
              "\x22\x20" +
              qk(rX) +
              w6(0xeca) +
              k9(rY) +
              w6(0x1f2));
          const rZ = m5[w6(0x992)](w6(0x90d));
          (rZ[w6(0x45d)] = rX),
            (rZ[w6(0x4fe)] = function () {
              const wh = w6;
              mQ(rX["id"], rY), (this[wh(0x4fe)] = null), m8[wh(0x4fe)]();
            }),
            (m9 = ![]);
          break;
        }
        case cI[w6(0x7ba)]: {
          const s0 = rv[w6(0x200)](rw++),
            s1 = rv[w6(0x764)](rw);
          rw += 0x4;
          const s2 = rm();
          (m5[w6(0x8e1)] =
            w6(0x2ee) +
            s2 +
            w6(0x570) +
            hP[w6(0xe3b)] +
            w6(0x243) +
            k9(s1) +
            "\x20" +
            hN[s0] +
            w6(0x570) +
            hQ[s0] +
            w6(0xbbb)),
            (m5[w6(0x992)](w6(0xeaf))[w6(0x4fe)] = function () {
              mi(s2);
            }),
            m5[w6(0x962)](m8),
            (m9 = ![]);
          break;
        }
        case cI[w6(0x946)]:
          (m5[w6(0x8e1)] = w6(0x2a9)), m5[w6(0x962)](m8), (m9 = ![]);
          break;
        case cI[w6(0xd5c)]:
          hK(w6(0x470));
          break;
        case cI[w6(0x6b0)]:
          rt();
          break;
        case cI[w6(0x4a8)]:
          hK(w6(0x7e6)), hc(w6(0x7e6));
          break;
        case cI[w6(0x827)]:
          hK(w6(0xb0e)), hc(w6(0xc29));
          break;
        case cI[w6(0x3a9)]:
          hK(w6(0x82c));
          break;
        case cI[w6(0xa5b)]:
          rr();
          break;
        case cI[w6(0x72a)]:
          hc(w6(0xbe0));
          break;
        case cI[w6(0x5ff)]:
          hc(w6(0xc66), hP[w6(0x855)]), hJ(hH);
          break;
        case cI[w6(0xd5d)]:
          const ry = rv[w6(0x71b)](rw);
          rw += 0x2;
          const rz = [];
          for (let s3 = 0x0; s3 < ry; s3++) {
            const s4 = rv[w6(0x764)](rw);
            rw += 0x4;
            const s5 = rm(),
              s6 = rm(),
              s7 = rm();
            rz[w6(0x9ee)]([s5 || w6(0x682) + s4, s6, s7]);
          }
          jm(rz);
          break;
        case cI[w6(0xbb9)]:
          for (let s8 in mb) {
            const s9 = rv[w6(0x764)](rw);
            (rw += 0x4), mc[s8][w6(0xa58)](s9);
          }
          break;
        case cI[w6(0x25f)]:
          const rA = rv[w6(0x200)](rw++),
            rB = rv[w6(0x764)](rw++),
            rC = {};
          (rC[w6(0x78f)] = rA), (rC[w6(0xbfe)] = rB), (oN = rC);
          break;
        case cI[w6(0x77d)]:
          (i0[w6(0x35a)][w6(0xbe5)] = i6 ? "" : w6(0x5d0)),
            (i3[w6(0x35a)][w6(0xbe5)] = !i6 ? "" : w6(0x5d0)),
            (hY[w6(0x35a)][w6(0xbe5)] = ""),
            (kn[w6(0x35a)][w6(0xbe5)] = w6(0x5d0)),
            (hW = !![]),
            kB[w6(0x2ae)][w6(0x6b1)](w6(0xa7d)),
            kA[w6(0x2ae)][w6(0x218)](w6(0xa7d)),
            j1(),
            m0(![]),
            (ix = rv[w6(0x764)](rw)),
            (rw += 0x4),
            (jv = rm()),
            hack.player.name = jv,
            hJ(jv),
            (jy = rv[w6(0x200)](rw++)),
            jB(),
            (j2 = rv[w6(0x71b)](rw)),
            (rw += 0x2),
            (j5 = rv[w6(0x200)](rw++)),
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
            const sb = rv[w6(0x71b)](rw) - 0x1;
            rw += 0x2;
            if (sb < 0x0) continue;
            iP[sa] = dC[sb];
          }
          nv(), nD();
          const rD = rv[w6(0x71b)](rw);
          rw += 0x2;
          for (let sc = 0x0; sc < rD; sc++) {
            const sd = rv[w6(0x71b)](rw);
            rw += 0x2;
            const se = nF(eK[sd]);
            se[w6(0x7e0)] = m2;
          }
          iS = {};
          while (rw < rv[w6(0x806)]) {
            const sf = rv[w6(0x71b)](rw);
            rw += 0x2;
            const sg = rv[w6(0x764)](rw);
            (rw += 0x4), (iS[sf] = sg);
          }
          nV(), mR();
          break;
        case cI[w6(0x9b0)]:
          const rE = rv[w6(0x200)](rw++),
            rF = hL[rE] || w6(0xe88);
          console[w6(0x454)](w6(0x59a) + rF + ")"),
            (kf = rE === cR[w6(0x79e)] || rE === cR[w6(0x3de)]);
          !kf &&
            it(w6(0x6ef), w6(0x595) + rF, rE === cR[w6(0x665)] ? 0xa : 0x3c);
          break;
        case cI[w6(0x9e7)]:
          (hg[w6(0x35a)][w6(0xbe5)] = kn[w6(0x35a)][w6(0xbe5)] = w6(0x5d0)),
            kG(!![]),
            ju[w6(0x2ae)][w6(0x6b1)](w6(0xa7d)),
            jg(),
            (p2[w6(0x35a)][w6(0xbe5)] = "");
          for (let sh in iQ) {
            iQ[sh][w6(0x5df)] = 0x0;
          }
          (jI = pz),
            (n8 = {}),
            (n0 = 0x1),
            (n1 = 0x1),
            (mY = 0x0),
            (mZ = 0x0),
            mp(),
            (mV = cY[w6(0xcdb)]),
            (jE = pz);
          break;
        case cI[w6(0x30b)]:
          (pn = pz - jE), (jE = pz), pT[w6(0xa58)](rn()), pV[w6(0xa58)](rn());
          if (jy) {
            const si = rv[w6(0x200)](rw++);
            (jJ = si & 0x80), (jK = f6[si & 0x7f]);
          } else (jJ = ![]), (jK = null), pW[w6(0xa58)](rn());
          (pu = 0x1 + cW[rv[w6(0x200)](rw++)] / 0x64),
            (iW = (d0 / 0x2) * pu),
            (iX = (d1 / 0x2) * pu);
          const rG = rv[w6(0x71b)](rw);
          rw += 0x2;
          for (let sj = 0x0; sj < rG; sj++) {
            const sk = rv[w6(0x764)](rw);
            rw += 0x4;
            let sl = iv[sk];
            if (sl) {
              if (sl[w6(0xe07)]) {
                sl[w6(0x408)] = rv[w6(0x200)](rw++) - 0x1;
                continue;
              }
              const sm = rv[w6(0x200)](rw++);
              sm & 0x1 &&
                ((sl["nx"] = rq()), (sl["ny"] = rq()), (sl[w6(0xe17)] = 0x0));
              sm & 0x2 &&
                ((sl[w6(0xe2f)] = eS(rv[w6(0x200)](rw++))),
                (sl[w6(0xe17)] = 0x0));
              if (sm & 0x4) {
                const sn = rn();
                if (sn < sl[w6(0x7f0)]) iT(sl, sn), (sl[w6(0x23a)] = 0x1);
                else sn > sl[w6(0x7f0)] && (sl[w6(0x23a)] = 0x0);
                (sl[w6(0x7f0)] = sn), (sl[w6(0xe17)] = 0x0);
              }
              sm & 0x8 &&
                ((sl[w6(0x72e)] = 0x1),
                (sl[w6(0xe17)] = 0x0),
                sl === iy && (pf = 0x1));
              sm & 0x10 && ((sl[w6(0xc60)] = rv[w6(0x71b)](rw)), (rw += 0x2));
              sm & 0x20 && (sl[w6(0xe42)] = rv[w6(0x200)](rw++));
              sm & 0x40 && ro(sl);
              if (sm & 0x80) {
                if (sl[w6(0xc87)])
                  (sl[w6(0xabe)] = rv[w6(0x71b)](rw)), (rw += 0x2);
                else {
                  const so = rn();
                  so > sl[w6(0xb57)] && iT(sl), (sl[w6(0xb57)] = so);
                }
              }
              sl[w6(0xc87)] && sm & 0x4 && (sl[w6(0x31f)] = rn()),
                (sl["ox"] = sl["x"]),
                (sl["oy"] = sl["y"]),
                (sl[w6(0xac9)] = sl[w6(0x297)]),
                (sl[w6(0xcb2)] = sl[w6(0x2d7)]),
                (sl[w6(0x22f)] = sl[w6(0xc39)]),
                (sl[w6(0xd69)] = 0x0);
            } else {
              const sp = rv[w6(0x200)](rw++);
              if (sp === cS[w6(0x31d)]) {
                let su = rv[w6(0x200)](rw++);
                const sv = {};
                (sv[w6(0xd5a)] = []), (sv["a"] = 0x1);
                const sw = sv;
                while (su--) {
                  const sx = rq(),
                    sy = rq();
                  sw[w6(0xd5a)][w6(0x9ee)]([sx, sy]);
                }
                iM(sw), (pf = 0x1), iF[w6(0x9ee)](sw);
                continue;
              }
              const sq = hM[sp],
                sr = rq(),
                ss = rq(),
                st = sp === cS[w6(0x588)];
              if (sp === cS[w6(0xdb4)] || sp === cS[w6(0x3aa)] || st) {
                const sz = rv[w6(0x71b)](rw);
                (rw += 0x2),
                  (sl = new lK(sp, sk, sr, ss, sz)),
                  st &&
                    ((sl[w6(0xe07)] = !![]),
                    (sl[w6(0x408)] = rv[w6(0x200)](rw++) - 0x1));
              } else {
                if (sp === cS[w6(0x4c0)]) {
                  const sA = rv[w6(0x71b)](rw);
                  (rw += 0x2), (sl = new lN(sk, sr, ss, sA));
                } else {
                  const sB = eS(rv[w6(0x200)](rw++)),
                    sC = rv[w6(0x71b)](rw);
                  rw += 0x2;
                  if (sp === cS[w6(0xec1)]) {
                    const sD = rn(),
                      sE = rv[w6(0x200)](rw++);
                    (sl = new lT(sk, sr, ss, sB, sD, sE, sC)),
                      ro(sl),
                      (sl[w6(0xabe)] = rv[w6(0x71b)](rw)),
                      (rw += 0x2),
                      (sl[w6(0xb82)] = rm()),
                      (sl[w6(0xab2)] = rm()),
                      (sl[w6(0x31f)] = rn());
                    if (ix === sk) iy = sl;
                    else {
                      if (jy) {
                        const sF = pF();
                        (sF[w6(0x511)] = sl), px[w6(0x9ee)](sF);
                      }
                    }
                  } else {
                    if (sq[w6(0x79d)](w6(0x45d)))
                      sl = new lG(sk, sp, sr, ss, sB, sC);
                    else {
                      const sG = rn(),
                        sH = rv[w6(0x200)](rw++),
                        sI = sH >> 0x4,
                        sJ = sH & 0x1,
                        sK = sH & 0x2,
                        sL = rn();
                      (sl = new lG(sk, sp, sr, ss, sB, sC, sG)),
                        (sl[w6(0xb9c)] = sI),
                        (sl[w6(0xb46)] = sJ),
                        (sl[w6(0x9bc)] = sK),
                        (sl[w6(0xb57)] = sL),
                        (sl[w6(0x22e)] = hN[sI]);
                    }
                  }
                }
              }
              (iv[sk] = sl), iw[w6(0x9ee)](sl);
            }
          }
          iy &&
            ((iU = iy["nx"]),
            (iV = iy["ny"]),
            (pO[w6(0x35a)][w6(0xbe5)] = ""),
            pQ(pO, iy["nx"], iy["ny"]));
          const rH = rv[w6(0x71b)](rw);
          rw += 0x2;
          for (let sM = 0x0; sM < rH; sM++) {
            const sN = rv[w6(0x764)](rw);
            (rw += 0x4), iY(sN);
          }
          const rI = rv[w6(0x200)](rw++);
          for (let sO = 0x0; sO < rI; sO++) {
            const sP = rv[w6(0x764)](rw);
            rw += 0x4;
            const sQ = iv[sP];
            if (sQ) {
              (sQ[w6(0x6f7)] = iy), mQ(sQ[w6(0x45d)]["id"], 0x1), iY(sP);
              if (!om[sQ[w6(0x45d)]["id"]]) om[sQ[w6(0x45d)]["id"]] = 0x0;
              om[sQ[w6(0x45d)]["id"]]++;
            }
          }
          const rJ = rv[w6(0x200)](rw++);
          for (let sR = 0x0; sR < rJ; sR++) {
            const sS = rv[w6(0x200)](rw++),
              sT = rn(),
              sU = iQ[sS];
            (sU[w6(0xb12)] = sT), sT === 0x0 && (sU[w6(0x5df)] = 0x0);
          }
          (iI = rv[w6(0x71b)](rw)), (rw += 0x2);
          const rK = rv[w6(0x71b)](rw);
          (rw += 0x2),
            iE[w6(0x99c)](
              w6(0x2c1),
              kh(iI, w6(0x641)) + ",\x20" + kh(rK, w6(0x8f6))
            );
          const rL = Math[w6(0x36c)](0xa, iI);
          if (iH) {
            const sV = rv[w6(0x200)](rw++),
              sW = sV >> 0x4,
              sX = sV & 0xf,
              sY = rv[w6(0x200)](rw++);
            for (let t0 = 0x0; t0 < sX; t0++) {
              const t1 = rv[w6(0x200)](rw++);
              (iG[t1][w6(0x95f)] = rv[w6(0x764)](rw)), (rw += 0x4);
            }
            const sZ = [];
            for (let t2 = 0x0; t2 < sY; t2++) {
              sZ[w6(0x9ee)](rv[w6(0x200)](rw++));
            }
            sZ[w6(0x76e)](function (t3, t4) {
              return t4 - t3;
            });
            for (let t3 = 0x0; t3 < sY; t3++) {
              const t4 = sZ[t3];
              iG[t4]["el"][w6(0x218)](), iG[w6(0x708)](t4, 0x1);
            }
            for (let t5 = 0x0; t5 < sW; t5++) {
              rp();
            }
            iG[w6(0x76e)](function (t6, t7) {
              const wi = w6;
              return t7[wi(0x95f)] - t6[wi(0x95f)];
            });
          } else {
            iG[w6(0x4cf)] = 0x0;
            for (let t6 = 0x0; t6 < rL; t6++) {
              rp();
            }
            iH = !![];
          }
          iL();
          const rM = rv[w6(0x200)](rw++);
          for (let t7 = 0x0; t7 < rM; t7++) {
            const t8 = rv[w6(0x71b)](rw);
            (rw += 0x2), nF(eK[t8]);
          }
          const rN = rv[w6(0x71b)](rw);
          rw += 0x2;
          for (let t9 = 0x0; t9 < rN; t9++) {
            const ta = rv[w6(0x200)](rw++),
              tb = ta >> 0x7,
              tc = ta & 0x7f;
            if (tc === cQ[w6(0x447)]) {
              const tg = rv[w6(0x200)](rw++),
                th = rv[w6(0x200)](rw++) - 0x1;
              let ti = null,
                tj = 0x0;
              if (tb) {
                const tl = rv[w6(0x764)](rw);
                rw += 0x4;
                const tm = rm();
                (ti = tm || w6(0x682) + tl), (tj = rv[w6(0x200)](rw++));
              }
              const tk = j8[tg];
              n6(
                w6(0x447),
                null,
                "⚡\x20" +
                  j7[tg] +
                  w6(0xe66) +
                  (th < 0x0
                    ? w6(0x7d3)
                    : th === 0x0
                    ? w6(0xc96)
                    : w6(0x365) + (th + 0x1) + "!"),
                tk
              );
              ti &&
                n5(w6(0x447), [
                  [w6(0x7da), "🏆"],
                  [tk, ti + w6(0x675)],
                  [hP[w6(0x201)], tj + w6(0xd8d)],
                  [tk, w6(0x6c2)],
                ]);
              continue;
            }
            const td = rv[w6(0x764)](rw);
            rw += 0x4;
            const te = rm(),
              tf = te || w6(0x682) + td;
            if (tc === cQ[w6(0xd83)]) {
              let tn = rm();
              oV[w6(0xcc2)] && (tn = fb(tn));
              if (jN(tn, td)) n6(td, tf, tn, td === ix ? n3["me"] : void 0x0);
              else td === ix && n6(-0x1, null, w6(0x345), n3[w6(0x88f)]);
            } else {
              if (tc === cQ[w6(0x25f)]) {
                const to = rv[w6(0x71b)](rw);
                rw += 0x2;
                const tp = rv[w6(0x764)](rw);
                rw += 0x4;
                const tq = rv[w6(0x764)](rw);
                rw += 0x4;
                const tr = dC[to],
                  ts = hN[tr[w6(0xb9c)]],
                  tt = hN[tr[w6(0xa02)][w6(0xb9c)]],
                  tu = tq === 0x0;
                if (tu)
                  n5(w6(0x25f), [
                    [n3[w6(0x3f5)], tf, !![]],
                    [n3[w6(0x3f5)], w6(0x7b2)],
                    [
                      hQ[tr[w6(0xb9c)]],
                      k9(tp) + "\x20" + ts + "\x20" + tr[w6(0x786)],
                    ],
                  ]);
                else {
                  const tv = hQ[tr[w6(0xa02)][w6(0xb9c)]];
                  n5(w6(0x25f), [
                    [tv, "⭐"],
                    [tv, tf, !![]],
                    [tv, w6(0x5c1)],
                    [
                      tv,
                      k9(tq) +
                        "\x20" +
                        tt +
                        "\x20" +
                        tr[w6(0x786)] +
                        w6(0xb8b) +
                        k9(tp) +
                        "\x20" +
                        ts +
                        "\x20" +
                        tr[w6(0x786)] +
                        "!",
                    ],
                  ]);
                }
              } else {
                const tw = rv[w6(0x71b)](rw);
                rw += 0x2;
                const tx = eK[tw],
                  ty = hN[tx[w6(0xb9c)]],
                  tz = tc === cQ[w6(0x760)],
                  tA = hQ[tx[w6(0xb9c)]];
                n5(w6(0xdd3), [
                  [
                    tA,
                    "" +
                      (tz ? w6(0xac1) : "") +
                      jt(ty) +
                      "\x20" +
                      ty +
                      "\x20" +
                      tx[w6(0x786)] +
                      w6(0xbef) +
                      js(tz) +
                      w6(0x8b2),
                  ],
                  [tA, tf + "!", !![]],
                ]);
              }
            }
          }
          const rO = rv[w6(0x200)](rw++),
            rP = rO & 0xf,
            rQ = rO >> 0x4;
          let rR = ![];
          rP !== j6["id"] &&
            (j6 && (j6[w6(0x75b)] = !![]),
            (rR = !![]),
            jd(rP),
            k8(pU, w6(0x9e3) + j9[rP] + w6(0x477)));
          const rS = rv[w6(0x200)](rw++);
          if (rS > 0x0) {
            let tB = ![];
            for (let tC = 0x0; tC < rS; tC++) {
              const tD = rv[w6(0x71b)](rw);
              rw += 0x2;
              const tE = rv[w6(0x71b)](rw);
              (rw += 0x2), (j6[tD] = tE);
              if (tE > 0x0) {
                if (!j6[w6(0x5d7)][tD]) {
                  tB = !![];
                  const tF = nF(eK[tD], !![]);
                  (tF[w6(0x9ed)] = !![]),
                    (tF[w6(0xd9e)] = ![]),
                    tF[w6(0x2ae)][w6(0x218)](w6(0x2cc)),
                    (tF[w6(0x3da)] = nA(w6(0xa08))),
                    tF[w6(0x962)](tF[w6(0x3da)]),
                    (tF[w6(0x27a)] = tD);
                  let tG = -0x1;
                  (tF["t"] = rR ? 0x1 : 0x0),
                    (tF[w6(0x75b)] = ![]),
                    (tF[w6(0x8c5)] = 0x3e8),
                    (tF[w6(0x30b)] = function () {
                      const wj = w6,
                        tH = tF["t"];
                      if (tH === tG) return;
                      tG = tH;
                      const tI = jf(Math[wj(0x36c)](0x1, tH / 0.5)),
                        tJ = jf(
                          Math[wj(0x525)](
                            0x0,
                            Math[wj(0x36c)]((tH - 0.5) / 0.5)
                          )
                        );
                      (tF[wj(0x35a)][wj(0x53f)] =
                        wj(0x4a1) + -0x168 * (0x1 - tJ) + wj(0x900) + tJ + ")"),
                        (tF[wj(0x35a)][wj(0x6ae)] = -1.12 * (0x1 - tI) + "em");
                    }),
                    jb[w6(0x9ee)](tF),
                    j6[w6(0x581)][w6(0x962)](tF),
                    (j6[w6(0x5d7)][tD] = tF);
                }
                oP(j6[w6(0x5d7)][tD][w6(0x3da)], tE);
              } else {
                const tH = j6[w6(0x5d7)][tD];
                tH && ((tH[w6(0x75b)] = !![]), delete j6[w6(0x5d7)][tD]),
                  delete j6[tD];
              }
            }
            tB &&
              [...j6[w6(0x581)][w6(0x44e)]]
                [w6(0x76e)]((tI, tJ) => {
                  const wk = w6;
                  return -nY(eK[tI[wk(0x27a)]], eK[tJ[wk(0x27a)]]);
                })
                [w6(0xbed)]((tI) => {
                  const wl = w6;
                  j6[wl(0x581)][wl(0x962)](tI);
                });
          }
          (j6[w6(0xc2f)] = pz), (j6[w6(0xe25)] = rQ);
          if (rQ !== cT[w6(0x5d0)]) {
            (j6[w6(0x960)][w6(0x35a)][w6(0xbe5)] = ""),
              (j6[w6(0xc88)] = j6[w6(0x41f)]),
              (j6[w6(0x6e9)] = rn());
            if (j6[w6(0x7df)] !== jJ) {
              const tI = jJ ? w6(0x6b1) : w6(0x218);
              j6[w6(0x70b)][w6(0x2ae)][tI](w6(0x598)),
                j6[w6(0x70b)][w6(0x2ae)][tI](w6(0xc8a)),
                j6[w6(0x241)][w6(0x2ae)][tI](w6(0x56c)),
                (j6[w6(0x7df)] = jJ);
            }
            switch (rQ) {
              case cT[w6(0x6e2)]:
                k8(j6[w6(0x974)], w6(0xda4));
                break;
              case cT[w6(0x447)]:
                const tJ = rv[w6(0x200)](rw++) + 0x1;
                k8(j6[w6(0x974)], w6(0x2d5) + tJ);
                break;
              case cT[w6(0xacd)]:
                k8(j6[w6(0x974)], w6(0xb85));
                break;
              case cT[w6(0xcd6)]:
                k8(j6[w6(0x974)], w6(0xe1f));
                break;
              case cT[w6(0xb27)]:
                k8(j6[w6(0x974)], w6(0x4e3));
                break;
            }
          } else j6[w6(0x960)][w6(0x35a)][w6(0xbe5)] = w6(0x5d0);
          if (rv[w6(0x806)] - rw > 0x0) {
            iy &&
              (j0(qd),
              (qd[w6(0x28e)] = ![]),
              (pP[w6(0x35a)][w6(0xbe5)] = ""),
              (pO[w6(0x35a)][w6(0xbe5)] = w6(0x5d0)),
              pQ(pP, iy["nx"], iy["ny"]));
            qe[w6(0x24b)](), (iy = null), ju[w6(0x2ae)][w6(0x218)](w6(0xa7d));
            const tK = rv[w6(0x71b)](rw) - 0x1;
            rw += 0x2;
            const tL = rv[w6(0x764)](rw);
            rw += 0x4;
            const tM = rv[w6(0x764)](rw);
            rw += 0x4;
            const tN = rv[w6(0x764)](rw);
            rw += 0x4;
            const tO = rv[w6(0x764)](rw);
            (rw += 0x4),
              k8(k3, ka(tM)),
              k8(k2, k9(tL)),
              k8(k4, k9(tN)),
              k8(k6, k9(tO));
            let tP = null;
            rv[w6(0x806)] - rw > 0x0 && ((tP = rv[w6(0x764)](rw)), (rw += 0x4));
            tP !== null
              ? (k8(k7, k9(tP)), (k7[w6(0xcbd)][w6(0x35a)][w6(0xbe5)] = ""))
              : (k7[w6(0xcbd)][w6(0x35a)][w6(0xbe5)] = w6(0x5d0));
            if (tK === -0x1) k8(k5, w6(0x526));
            else {
              const tQ = eK[tK];
              k8(k5, hN[tQ[w6(0xb9c)]] + "\x20" + tQ[w6(0x786)]);
            }
            on(), (om = {}), (kn[w6(0x35a)][w6(0xbe5)] = ""), hi();
          }
          break;
        default:
          console[w6(0x454)](w6(0xe73) + rx);
      }
    }
    var k2 = document[uf(0x992)](uf(0xe0f)),
      k3 = document[uf(0x992)](uf(0x2ff)),
      k4 = document[uf(0x992)](uf(0xd6b)),
      k5 = document[uf(0x992)](uf(0xb56)),
      k6 = document[uf(0x992)](uf(0x209)),
      k7 = document[uf(0x992)](uf(0x9a6));
    function k8(rk, rl) {
      const wm = uf;
      rk[wm(0x99c)](wm(0x2c1), rl);
    }
    function k9(rk) {
      const wn = uf;
      return rk[wn(0x9d4)](wn(0xd1d));
    }
    function ka(rk, rl) {
      const wo = uf,
        rm = [
          Math[wo(0xb02)](rk / (0x3e8 * 0x3c * 0x3c)),
          Math[wo(0xb02)]((rk % (0x3e8 * 0x3c * 0x3c)) / (0x3e8 * 0x3c)),
          Math[wo(0xb02)]((rk % (0x3e8 * 0x3c)) / 0x3e8),
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
      [cS[uf(0x2f9)]]: uf(0x3e7),
      [cS[uf(0xe02)]]: uf(0x631),
      [cS[uf(0xc82)]]: uf(0x631),
      [cS[uf(0x564)]]: uf(0x39a),
      [cS[uf(0xc04)]]: uf(0x39a),
      [cS[uf(0xc77)]]: uf(0x70e),
      [cS[uf(0x5a3)]]: uf(0x70e),
      [cS[uf(0x21b)]]: uf(0x238),
      [cS[uf(0xb2f)]]: uf(0x7e2),
    };
    kb["0"] = uf(0x526);
    var kc = kb;
    for (let rk in cS) {
      const rl = cS[rk];
      if (kc[rl]) continue;
      const rm = kd(rk);
      kc[rl] = rm[uf(0x6d2)](uf(0x865), uf(0x776));
    }
    function kd(rn) {
      const wp = uf,
        ro = rn[wp(0x6d2)](/([A-Z])/g, wp(0x8d8)),
        rp = ro[wp(0x6c6)](0x0)[wp(0x236)]() + ro[wp(0xb26)](0x1);
      return rp;
    }
    var ke = null,
      kf = !![];
    function kg() {
      const wq = uf;
      console[wq(0x454)](wq(0xeb7)),
        hT(),
        ju[wq(0x2ae)][wq(0x218)](wq(0xa7d)),
        kf &&
          (kk[wq(0x35a)][wq(0xbe5)] === wq(0x5d0)
            ? (clearTimeout(ke),
              kC[wq(0x2ae)][wq(0x6b1)](wq(0xa7d)),
              (ke = setTimeout(function () {
                const wr = wq;
                kC[wr(0x2ae)][wr(0x218)](wr(0xa7d)),
                  (kk[wr(0x35a)][wr(0xbe5)] = ""),
                  kB[wr(0xd94)](ko),
                  (kn[wr(0x35a)][wr(0xbe5)] = km[wr(0x35a)][wr(0xbe5)] =
                    wr(0x5d0)),
                  hi(),
                  hV(hU[wr(0xc22)]);
              }, 0x1f4)))
            : (kC[wq(0x2ae)][wq(0x218)](wq(0xa7d)), hV(hU[wq(0xc22)])));
    }
    function kh(rn, ro) {
      return rn + "\x20" + ro + (rn === 0x1 ? "" : "s");
    }
    var ki = document[uf(0x29c)](uf(0xbb7)),
      kj = ki[uf(0x1c6)]("2d"),
      kk = document[uf(0x992)](uf(0x673)),
      kl = document[uf(0x992)](uf(0xbba)),
      km = document[uf(0x992)](uf(0x2c4));
    km[uf(0x35a)][uf(0xbe5)] = uf(0x5d0);
    var kn = document[uf(0x992)](uf(0xe0b));
    kn[uf(0x35a)][uf(0xbe5)] = uf(0x5d0);
    var ko = document[uf(0x992)](uf(0x23f)),
      kp = document[uf(0x992)](uf(0xd23)),
      kq = document[uf(0x992)](uf(0xd17));
    function kr() {
      const ws = uf;
      kq[ws(0x8e1)] = "";
      for (let rn = 0x0; rn < 0x32; rn++) {
        const ro = ks[rn],
          rp = nA(ws(0x680) + rn + ws(0x4c7)),
          rq = rp[ws(0x992)](ws(0xb77));
        if (ro)
          for (let rr = 0x0; rr < ro[ws(0x4cf)]; rr++) {
            const rs = ro[rr],
              rt = dF[rs];
            if (!rt) rq[ws(0x962)](nA(ws(0x38b)));
            else {
              const ru = nA(
                ws(0xdb9) + rt[ws(0xb9c)] + "\x22\x20" + qk(rt) + ws(0x74b)
              );
              (ru[ws(0x45d)] = rt),
                (ru[ws(0x7e0)] = kp),
                jY(ru),
                rq[ws(0x962)](ru);
            }
          }
        else rq[ws(0x8e1)] = ws(0x38b)[ws(0x2fd)](0x5);
        (rp[ws(0x992)](ws(0xd3a))[ws(0x4fe)] = function () {
          ku(rn);
        }),
          (rp[ws(0x992)](ws(0xdf3))[ws(0x4fe)] = function () {
            kx(rn);
          }),
          kq[ws(0x962)](rp);
      }
    }
    var ks = kt();
    function kt() {
      const wt = uf;
      try {
        const rn = JSON[wt(0x55c)](hD[wt(0x65f)]);
        for (const ro in rn) {
          !Array[wt(0x59e)](rn[ro]) && delete rn[ro];
        }
        return rn;
      } catch {
        return {};
      }
    }
    function ku(rn) {
      const wu = uf,
        ro = [],
        rp = nk[wu(0x523)](wu(0x874));
      for (let rq = 0x0; rq < rp[wu(0x4cf)]; rq++) {
        const rr = rp[rq],
          rs = rr[wu(0x44e)][0x0];
        !rs ? (ro[rq] = null) : (ro[rq] = rs[wu(0x45d)][wu(0xc25)]);
      }
      (ks[rn] = ro),
        (hD[wu(0x65f)] = JSON[wu(0xab8)](ks)),
        kr(),
        hc(wu(0x34e) + rn + "!");
    }
    function kv() {
      const wv = uf;
      return nk[wv(0x523)](wv(0x874));
    }
    document[uf(0x992)](uf(0x559))[uf(0x4fe)] = function () {
      kw();
    };
    function kw() {
      const ww = uf,
        rn = kv();
      for (const ro of rn) {
        const rp = ro[ww(0x44e)][0x0];
        if (!rp) continue;
        rp[ww(0x218)](),
          iR[ww(0x9ee)](rp[ww(0x58f)]),
          mQ(rp[ww(0x45d)]["id"], 0x1),
          il(new Uint8Array([cI[ww(0x3e4)], ro[ww(0x351)]]));
      }
    }
    function kx(rn) {
      const wx = uf;
      if (mt || ms[wx(0x4cf)] > 0x0) return;
      const ro = ks[rn];
      if (!ro) return;
      kw();
      const rp = kv(),
        rq = Math[wx(0x36c)](rp[wx(0x4cf)], ro[wx(0x4cf)]);
      for (let rr = 0x0; rr < rq; rr++) {
        const rs = ro[rr],
          rt = dF[rs];
        if (!rt || !iS[rt["id"]]) continue;
        const ru = nA(
          wx(0xdb9) + rt[wx(0xb9c)] + "\x22\x20" + qk(rt) + wx(0x74b)
        );
        (ru[wx(0x45d)] = rt),
          (ru[wx(0xa32)] = !![]),
          (ru[wx(0x58f)] = iR[wx(0x315)]()),
          nz(ru, rt),
          (iQ[ru[wx(0x58f)]] = ru),
          rp[rr][wx(0x962)](ru),
          mQ(ru[wx(0x45d)]["id"], -0x1);
        const rv = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
        rv[wx(0x75e)](0x0, cI[wx(0x64e)]),
          rv[wx(0xe46)](0x1, ru[wx(0x45d)]["id"]),
          rv[wx(0x75e)](0x3, rr),
          il(rv);
      }
      hc(wx(0x1db) + rn + "!");
    }
    var ky = document[uf(0x992)](uf(0x761)),
      kz = document[uf(0x992)](uf(0x70c));
    kz[uf(0x4fe)] = function () {
      const wy = uf;
      kC[wy(0x2ae)][wy(0x6b1)](wy(0xa7d)),
        jy
          ? (ke = setTimeout(function () {
              const wz = wy;
              il(new Uint8Array([cI[wz(0x816)]]));
            }, 0x1f4))
          : (ke = setTimeout(function () {
              const wA = wy;
              kC[wA(0x2ae)][wA(0x218)](wA(0xa7d)),
                (km[wA(0x35a)][wA(0xbe5)] = kn[wA(0x35a)][wA(0xbe5)] =
                  wA(0x5d0)),
                (kk[wA(0x35a)][wA(0xbe5)] = ""),
                kB[wA(0xd94)](ko),
                kB[wA(0x2ae)][wA(0x6b1)](wA(0xa7d)),
                jg();
            }, 0x1f4));
    };
    var kA = document[uf(0x992)](uf(0x835)),
      kB = document[uf(0x992)](uf(0xa53));
    kB[uf(0x2ae)][uf(0x6b1)](uf(0xa7d));
    var kC = document[uf(0x992)](uf(0xe06)),
      kD = document[uf(0x992)](uf(0x4d5)),
      kE = document[uf(0x992)](uf(0xb67));
    (kE[uf(0x6f8)] = hD[uf(0xd84)] || ""),
      (kE[uf(0x2e6)] = cK),
      (kE[uf(0xad4)] = function () {
        const wB = uf;
        hD[wB(0xd84)] = this[wB(0x6f8)];
      });
    var kF;
    kD[uf(0x4fe)] = function () {
      if (!hW) return;
      kG();
    };
    function kG(rn = ![]) {
      const wC = uf;
      hack.chatFunc = hK;
      hack.toastFunc = hc;
      if(rn) hack.onload();
      hack.moblst = eO;
      if (kk[wC(0x35a)][wC(0xbe5)] === wC(0x5d0)) {
        kC[wC(0x2ae)][wC(0x218)](wC(0xa7d));
        return;
      }
      clearTimeout(kF),
        kB[wC(0x2ae)][wC(0x218)](wC(0xa7d)),
        (kF = setTimeout(() => {
          const wD = wC;
          kC[wD(0x2ae)][wD(0x6b1)](wD(0xa7d)),
            (kF = setTimeout(() => {
              const wE = wD;
              rn && kC[wE(0x2ae)][wE(0x218)](wE(0xa7d)),
                (kk[wE(0x35a)][wE(0xbe5)] = wE(0x5d0)),
                (hg[wE(0x35a)][wE(0xbe5)] = wE(0x5d0)),
                (km[wE(0x35a)][wE(0xbe5)] = ""),
                km[wE(0x962)](ko),
                iq(kE[wE(0x6f8)][wE(0xb26)](0x0, cK));
            }, 0x1f4));
        }, 0x64));
    }
    var kH = document[uf(0x992)](uf(0x9a2));
    function kI(rn, ro, rp) {
      const wF = uf,
        rq = {};
      (rq[wF(0xa83)] = wF(0xa51)), (rq[wF(0xd4c)] = !![]), (rp = rp || rq);
      const rr = nA(
        wF(0xe56) +
          rp[wF(0xa83)] +
          wF(0xc2d) +
          rn +
          wF(0x80e) +
          (rp[wF(0xd4c)] ? wF(0x444) : "") +
          wF(0xcbe)
      );
      return (
        (rr[wF(0x992)](wF(0xcf5))[wF(0x4fe)] = function () {
          const wG = wF;
          ro(!![]), rr[wG(0x218)]();
        }),
        (rr[wF(0x992)](wF(0xd65))[wF(0x4fe)] = function () {
          const wH = wF;
          rr[wH(0x218)](), ro(![]);
        }),
        kH[wF(0x962)](rr),
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
            wI(0x66e),
            wI(0x2a6),
            wI(0x37a),
            wI(0xe98),
            wI(0x5ee),
            wI(0xe94),
            wI(0x288),
            wI(0x57c),
            wI(0x666),
            wI(0x202),
            wI(0x6fd),
            wI(0xb16),
            wI(0x620),
            wI(0xb25),
            wI(0xc36),
            wI(0x62a),
            wI(0xbad),
            wI(0x8ef),
            wI(0x23c),
            wI(0x730),
            wI(0x831),
            wI(0xa40),
            wI(0x80a),
            wI(0x4fa),
            wI(0xd5f),
            wI(0x45d),
            wI(0xc4d),
            wI(0x327),
            wI(0x69e),
            wI(0xd82),
            wI(0xae8),
            wI(0xaa1),
            wI(0xba2),
            wI(0x8f9),
            wI(0xc4b),
            wI(0x1cf),
            wI(0x837),
            wI(0x92b),
            wI(0x795),
            wI(0x4a6),
            wI(0xeb9),
            wI(0xb78),
            wI(0xba9),
            wI(0x6d8),
            wI(0x542),
            wI(0xc9f),
            wI(0x5bb),
            wI(0xd99),
            wI(0xe50),
            wI(0x71e),
            wI(0x469),
            wI(0x269),
            wI(0x206),
            wI(0x510),
            wI(0xc5d),
            wI(0x4e7),
            wI(0xb52),
            wI(0xcaf),
            wI(0x894),
            wI(0x3ad),
            wI(0x7d0),
            wI(0xe2b),
            wI(0xdb2),
            wI(0x684),
            wI(0x813),
            wI(0xcc5),
            wI(0x7a8),
            wI(0x3ba),
            wI(0xbcc),
            wI(0xcff),
            wI(0x77c),
            wI(0xe18),
            wI(0x369),
            wI(0xbc7),
            wI(0x913),
            wI(0x7dd),
            wI(0x267),
            wI(0x33c),
            wI(0x5f7),
            wI(0xc72),
            wI(0x3d8),
            wI(0x308),
            wI(0x1e3),
            wI(0xb70),
            wI(0x7b6),
            wI(0xe29),
            wI(0xa03),
            wI(0x9f0),
            wI(0xa84),
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
            else rz[wJ(0x9ee)](rz[wJ(0x2e2)]());
          } catch (rE) {
            rz[wJ(0x9ee)](rz[wJ(0x2e2)]());
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
    var kK = document[uf(0x992)](uf(0x5e3)),
      kL = (function () {
        const wL = uf;
        let rn = ![];
        return (
          (function (ro) {
            const wK = b;
            if (
              /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i[
                wK(0xbb3)
              ](ro) ||
              /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[
                wK(0xbb3)
              ](ro[wK(0x453)](0x0, 0x4))
            )
              rn = !![];
          })(navigator[wL(0x6e6)] || navigator[wL(0xdf5)] || window[wL(0xe80)]),
          rn
        );
      })(),
      kM =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/[
          uf(0xbb3)
        ](navigator[uf(0x6e6)][uf(0x43a)]()),
      kN = 0x514,
      kO = 0x28a,
      kP = 0x1,
      kQ = [km, kk, kn, kl, kH, hg],
      kR = 0x1,
      kS = 0x1;
    function kT() {
      const wM = uf;
      (kS = Math[wM(0x525)](ki[wM(0x8df)] / d0, ki[wM(0xb7f)] / d1)),
        (kR =
          Math[oV[wM(0x54e)] ? wM(0x36c) : wM(0x525)](kU() / kN, kV() / kO) *
          (kL && !kM ? 1.1 : 0x1)),
        (kR *= kP);
      for (let rn = 0x0; rn < kQ[wM(0x4cf)]; rn++) {
        const ro = kQ[rn];
        let rp = kR * (ro[wM(0xa44)] || 0x1);
        (ro[wM(0x35a)][wM(0x53f)] = wM(0x296) + rp + ")"),
          (ro[wM(0x35a)][wM(0x2de)] = wM(0xe75)),
          (ro[wM(0x35a)][wM(0x8df)] = kU() / rp + "px"),
          (ro[wM(0x35a)][wM(0xb7f)] = kV() / rp + "px");
      }
    }
    function kU() {
      const wN = uf;
      return document[wN(0xc8d)][wN(0x5d3)];
    }
    function kV() {
      const wO = uf;
      return document[wO(0xc8d)][wO(0x6c8)];
    }
    var kW = 0x1;
    function kX() {
      const wP = uf;
      (kW = oV[wP(0xbc0)] ? 0.65 : window[wP(0xe92)]),
        (ki[wP(0x8df)] = kU() * kW),
        (ki[wP(0xb7f)] = kV() * kW),
        kT();
      for (let rn = 0x0; rn < ms[wP(0x4cf)]; rn++) {
        ms[rn][wP(0x770)]();
      }
    }
    window[uf(0x8f5)] = function () {
      kX(), qs();
    };
    var kY = (function () {
        const wQ = uf,
          rn = 0x23,
          ro = rn / 0x2,
          rp = document[wQ(0xde7)](wQ(0xbb7));
        rp[wQ(0x8df)] = rp[wQ(0xb7f)] = rn;
        const rq = rp[wQ(0x1c6)]("2d");
        return (
          (rq[wQ(0x9a7)] = wQ(0x809)),
          rq[wQ(0xc3a)](),
          rq[wQ(0xd7c)](0x0, ro),
          rq[wQ(0xbc9)](rn, ro),
          rq[wQ(0xd7c)](ro, 0x0),
          rq[wQ(0xbc9)](ro, rn),
          rq[wQ(0x2c1)](),
          rq[wQ(0xc6b)](rp, wQ(0x2fd))
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
      const rq = Math[wR(0xd3d)](rn),
        rr = Math[wR(0x46b)](rn),
        rs = rq * 0x28,
        rt = rr * 0x28;
      l1[wR(0x9ee)]({
        dir: ro,
        start: [rs, rt],
        curve: [
          rs + rq * 0x17 + -rr * ro * rp,
          rt + rr * 0x17 + rq * ro * rp,
          rs + rq * 0x2e,
          rt + rr * 0x2e,
        ],
        side: Math[wR(0xa6c)](rn),
      });
    }
    var l3 = l4();
    function l4() {
      const wS = uf,
        rn = new Path2D(),
        ro = Math["PI"] / 0x5;
      return (
        rn[wS(0x54b)](0x0, 0x0, 0x28, ro, l0 - ro),
        rn[wS(0xbb6)](
          0x12,
          0x0,
          Math[wS(0xd3d)](ro) * 0x28,
          Math[wS(0x46b)](ro) * 0x28
        ),
        rn[wS(0x5fb)](),
        rn
      );
    }
    var l5 = l6();
    function l6() {
      const wT = uf,
        rn = new Path2D();
      return (
        rn[wT(0xd7c)](-0x28, 0x5),
        rn[wT(0xc43)](-0x28, 0x28, 0x28, 0x28, 0x28, 0x5),
        rn[wT(0xbc9)](0x28, -0x5),
        rn[wT(0xc43)](0x28, -0x28, -0x28, -0x28, -0x28, -0x5),
        rn[wT(0x5fb)](),
        rn
      );
    }
    function l7(rn, ro = 0x1, rp = 0x0) {
      const wU = uf,
        rq = new Path2D();
      for (let rr = 0x0; rr < rn; rr++) {
        const rs = (Math["PI"] * 0x2 * rr) / rn + rp;
        rq[wU(0xbc9)](
          Math[wU(0xd3d)](rs) - Math[wU(0x46b)](rs) * 0.1 * ro,
          Math[wU(0x46b)](rs)
        );
      }
      return rq[wU(0x5fb)](), rq;
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
          rn[wV(0xbc9)](Math[wV(0xd3d)](rp) * rq, Math[wV(0x46b)](rp) * rq);
        }
        return rn[wV(0x5fb)](), rn;
      })(),
      petalCotton: la(0x9, 0x1, 0.5, 1.6),
      petalWeb: la(0x5, 0x1, 0.5, 0.7),
      petalCactus: la(0x8, 0x1, 0.5, 0.7),
      petalSand: l7(0x6, 0x0, 0.2),
    };
    function l9(rn, ro, rp, rq, rr) {
      const wW = uf;
      (rn[wW(0x9a7)] = rr),
        (rn[wW(0x38e)] = rp),
        rn[wW(0xc61)](),
        (ro *= 0.45),
        rn[wW(0x264)](ro),
        rn[wW(0xd15)](-0x14, 0x0),
        rn[wW(0xc3a)](),
        rn[wW(0xd7c)](0x0, 0x26),
        rn[wW(0xbc9)](0x50, 0x7),
        rn[wW(0xbc9)](0x50, -0x7),
        rn[wW(0xbc9)](0x0, -0x26),
        rn[wW(0xbc9)](-0x14, -0x1e),
        rn[wW(0xbc9)](-0x14, 0x1e),
        rn[wW(0x5fb)](),
        (rp = rp / ro),
        (rn[wW(0x38e)] = 0x64 + rp),
        (rn[wW(0x9a7)] = rr),
        rn[wW(0x2c1)](),
        (rn[wW(0x9a7)] = rn[wW(0x2d4)] = rq),
        (rn[wW(0x38e)] -= rp * 0x2),
        rn[wW(0x2c1)](),
        rn[wW(0xec9)](),
        rn[wW(0xa10)]();
    }
    function la(rn, ro, rp, rq) {
      const wX = uf,
        rr = new Path2D();
      return lb(rr, rn, ro, rp, rq), rr[wX(0x5fb)](), rr;
    }
    function lb(rn, ro, rp, rq, rr) {
      const wY = uf;
      rn[wY(0xd7c)](rp, 0x0);
      for (let rs = 0x1; rs <= ro; rs++) {
        const rt = (Math["PI"] * 0x2 * (rs - rq)) / ro,
          ru = (Math["PI"] * 0x2 * rs) / ro;
        rn[wY(0xbb6)](
          Math[wY(0xd3d)](rt) * rp * rr,
          Math[wY(0x46b)](rt) * rp * rr,
          Math[wY(0xd3d)](ru) * rp,
          Math[wY(0x46b)](ru) * rp
        );
      }
    }
    var lc = (function () {
        const wZ = uf,
          rn = new Path2D();
        rn[wZ(0xd7c)](0x3c, 0x0);
        const ro = 0x6;
        for (let rp = 0x0; rp < ro; rp++) {
          const rq = ((rp + 0.5) / ro) * Math["PI"] * 0x2,
            rr = ((rp + 0x1) / ro) * Math["PI"] * 0x2;
          rn[wZ(0xbb6)](
            Math[wZ(0xd3d)](rq) * 0x78,
            Math[wZ(0x46b)](rq) * 0x78,
            Math[wZ(0xd3d)](rr) * 0x3c,
            Math[wZ(0x46b)](rr) * 0x3c
          );
        }
        return rn[wZ(0x5fb)](), rn;
      })(),
      ld = (function () {
        const x0 = uf,
          rn = new Path2D(),
          ro = 0x6;
        for (let rp = 0x0; rp < ro; rp++) {
          const rq = ((rp + 0.5) / ro) * Math["PI"] * 0x2;
          rn[x0(0xd7c)](0x0, 0x0), rn[x0(0xbc9)](...le(0x37, 0x0, rq));
          for (let rr = 0x0; rr < 0x2; rr++) {
            const rs = (rr / 0x2) * 0x1e + 0x14,
              rt = 0xa - rr * 0x2;
            rn[x0(0xd7c)](...le(rs + rt, -rt, rq)),
              rn[x0(0xbc9)](...le(rs, 0x0, rq)),
              rn[x0(0xbc9)](...le(rs + rt, rt, rq));
          }
        }
        return rn;
      })();
    function le(rn, ro, rp) {
      const x1 = uf,
        rq = Math[x1(0x46b)](rp),
        rr = Math[x1(0xd3d)](rp);
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
          ry = Math[x2(0x2d8)](rx * 0xff)[x2(0xe51)](0x10);
        return ry[x2(0x4cf)] === 0x1 ? "0" + ry : ry;
      };
      return "#" + rt(rq) + rt(rr) + rt(rs);
    }
    var lg = [];
    for (let rn = 0x0; rn < 0xa; rn++) {
      const ro = 0x1 - rn / 0xa;
      lg[uf(0x9ee)](lf(0x28 + ro * 0xc8, 0x50, 0x3c * ro));
    }
    var lh = [uf(0xb94), uf(0x57a)],
      li = lh[0x0],
      lj = [uf(0xb0d), uf(0x4cc), uf(0x9bb), uf(0x6af)];
    function lk(rp = uf(0xa31)) {
      const x3 = uf,
        rq = [];
      for (let rr = 0x0; rr < 0x5; rr++) {
        rq[x3(0x9ee)](pJ(rp, 0.8 - (rr / 0x5) * 0.25));
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
          body: uf(0xa31),
          wing: uf(0xe58),
          tail_outline: uf(0x843),
          bone_outline: uf(0x212),
          bone: uf(0x843),
          tail: lk(),
        },
      },
      lm = new Path2D(uf(0x1d5)),
      ln = new Path2D(uf(0x83f)),
      lo = [];
    for (let rp = 0x0; rp < 0x3; rp++) {
      lo[uf(0x9ee)](pJ(lh[0x0], 0x1 - (rp / 0x3) * 0.2));
    }
    function lp(rq = Math[uf(0xa69)]()) {
      return function () {
        return (rq = (rq * 0x2455 + 0xc091) % 0x38f40), rq / 0x38f40;
      };
    }
    const lq = {
      [cS[uf(0x663)]]: [uf(0xe8e), uf(0xda5)],
      [cS[uf(0xd34)]]: [uf(0xa31), uf(0x3ae)],
      [cS[uf(0xadc)]]: [uf(0xa50), uf(0x983)],
    };
    var lr = lq;
    const ls = {};
    (ls[uf(0x911)] = !![]),
      (ls[uf(0xe8c)] = !![]),
      (ls[uf(0x6b3)] = !![]),
      (ls[uf(0x294)] = !![]),
      (ls[uf(0x57b)] = !![]),
      (ls[uf(0x4c9)] = !![]),
      (ls[uf(0x339)] = !![]);
    var lt = ls;
    const lu = {};
    (lu[uf(0x5bf)] = !![]),
      (lu[uf(0x88b)] = !![]),
      (lu[uf(0x1f5)] = !![]),
      (lu[uf(0x580)] = !![]),
      (lu[uf(0x39e)] = !![]),
      (lu[uf(0x5a7)] = !![]),
      (lu[uf(0x3a0)] = !![]);
    var lv = lu;
    const lw = {};
    (lw[uf(0x1f5)] = !![]),
      (lw[uf(0x580)] = !![]),
      (lw[uf(0x39e)] = !![]),
      (lw[uf(0x5a7)] = !![]);
    var lx = lw;
    const ly = {};
    (ly[uf(0x88b)] = !![]), (ly[uf(0x9a1)] = !![]), (ly[uf(0x294)] = !![]);
    var lz = ly;
    const lA = {};
    (lA[uf(0x8c4)] = !![]), (lA[uf(0xb2f)] = !![]), (lA[uf(0xaed)] = !![]);
    var lB = lA;
    const lC = {};
    (lC[uf(0x330)] = !![]),
      (lC[uf(0x21b)] = !![]),
      (lC[uf(0x8c0)] = !![]),
      (lC[uf(0x67e)] = !![]),
      (lC[uf(0xb7c)] = !![]);
    var lD = lC;
    function lE(rq, rr) {
      const x4 = uf;
      rq[x4(0xc3a)](), rq[x4(0xd7c)](rr, 0x0);
      for (let rs = 0x0; rs < 0x6; rs++) {
        const rt = (rs / 0x6) * Math["PI"] * 0x2;
        rq[x4(0xbc9)](Math[x4(0xd3d)](rt) * rr, Math[x4(0x46b)](rt) * rr);
      }
      rq[x4(0x5fb)]();
    }
    function lF(rq, rr, rs, rt, ru) {
      const x5 = uf;
      rq[x5(0xc3a)](),
        rq[x5(0xd7c)](0x9, -0x5),
        rq[x5(0xc43)](-0xf, -0x19, -0xf, 0x19, 0x9, 0x5),
        rq[x5(0xbb6)](0xd, 0x0, 0x9, -0x5),
        rq[x5(0x5fb)](),
        (rq[x5(0x92c)] = rq[x5(0xe5e)] = x5(0x2d8)),
        (rq[x5(0x9a7)] = rt),
        (rq[x5(0x38e)] = rr),
        rq[x5(0x2c1)](),
        (rq[x5(0x38e)] -= ru),
        (rq[x5(0x2d4)] = rq[x5(0x9a7)] = rs),
        rq[x5(0xec9)](),
        rq[x5(0x2c1)]();
    }
    var lG = class {
        constructor(rq = -0x1, rr, rs, rt, ru, rv = 0x7, rw = -0x1) {
          const x6 = uf;
          (this["id"] = rq),
            (this[x6(0x2dc)] = rr),
            (this[x6(0x99d)] = hM[rr]),
            (this[x6(0xb21)] = this[x6(0x99d)][x6(0x79d)](x6(0x45d))),
            (this["x"] = this["nx"] = this["ox"] = rs),
            (this["y"] = this["ny"] = this["oy"] = rt),
            (this[x6(0x297)] = this[x6(0xe2f)] = this[x6(0xac9)] = ru),
            (this[x6(0x67c)] =
              this[x6(0x2d7)] =
              this[x6(0x7f0)] =
              this[x6(0xcb2)] =
                rw),
            (this[x6(0x23a)] = 0x0),
            (this[x6(0xc39)] = this[x6(0xc60)] = this[x6(0x22f)] = rv),
            (this[x6(0xd69)] = 0x0),
            (this[x6(0x613)] = ![]),
            (this[x6(0x69a)] = 0x0),
            (this[x6(0x72e)] = 0x0),
            (this[x6(0x9f1)] = this[x6(0x99d)][x6(0xe00)](x6(0x9ef)) > -0x1),
            (this[x6(0x8bd)] = this[x6(0x9f1)] ? this[x6(0x2d7)] < 0x1 : 0x1),
            (this[x6(0xb46)] = ![]),
            (this[x6(0xb57)] = 0x0),
            (this[x6(0xb4e)] = 0x0),
            (this[x6(0xddf)] = 0x0),
            (this[x6(0xd04)] = 0x1),
            (this[x6(0x28f)] = 0x0),
            (this[x6(0xd7e)] = [cS[x6(0x535)], cS[x6(0xa4f)], cS[x6(0xec1)]][
              x6(0x637)
            ](this[x6(0x2dc)])),
            (this[x6(0x9ad)] = lv[this[x6(0x99d)]]),
            (this[x6(0x775)] = lx[this[x6(0x99d)]] ? 0x32 / 0xc8 : 0x0),
            (this[x6(0x231)] = lt[this[x6(0x99d)]]),
            (this[x6(0xc79)] = 0x0),
            (this[x6(0xaf0)] = 0x0),
            (this[x6(0x4b3)] = ![]),
            (this[x6(0x2c0)] = 0x0),
            (this[x6(0xaa4)] = !![]),
            (this[x6(0xe17)] = 0x2),
            (this[x6(0x903)] = 0x0),
            (this[x6(0x71a)] = lD[this[x6(0x99d)]]),
            (this[x6(0x30e)] = lz[this[x6(0x99d)]]),
            (this[x6(0x87b)] = lB[this[x6(0x99d)]]);
        }
        [uf(0x30b)]() {
          const x7 = uf;
          this[x7(0x613)] && (this[x7(0x69a)] += pA / 0xc8);
          (this[x7(0xaf0)] += ((this[x7(0x4b3)] ? 0x1 : -0x1) * pA) / 0xc8),
            (this[x7(0xaf0)] = Math[x7(0x36c)](
              0x1,
              Math[x7(0x525)](0x0, this[x7(0xaf0)])
            )),
            (this[x7(0xddf)] = pg(
              this[x7(0xddf)],
              this[x7(0xb4e)] > 0.01 ? 0x1 : 0x0,
              0x64
            )),
            (this[x7(0xb4e)] = pg(this[x7(0xb4e)], this[x7(0xb57)], 0x64));
          this[x7(0x72e)] > 0x0 &&
            ((this[x7(0x72e)] -= pA / 0x96),
            this[x7(0x72e)] < 0x0 && (this[x7(0x72e)] = 0x0));
          (this[x7(0xd69)] += pA / 0x64),
            (this["t"] = Math[x7(0x36c)](0x1, this[x7(0xd69)])),
            (this["x"] = this["ox"] + (this["nx"] - this["ox"]) * this["t"]),
            (this["y"] = this["oy"] + (this["ny"] - this["oy"]) * this["t"]),
            (this[x7(0x2d7)] =
              this[x7(0xcb2)] +
              (this[x7(0x7f0)] - this[x7(0xcb2)]) * this["t"]),
            (this[x7(0xc39)] =
              this[x7(0x22f)] +
              (this[x7(0xc60)] - this[x7(0x22f)]) * this["t"]);
          if (this[x7(0xd7e)]) {
            const rq = Math[x7(0x36c)](0x1, pA / 0x64);
            (this[x7(0xd04)] +=
              (Math[x7(0xd3d)](this[x7(0xe2f)]) - this[x7(0xd04)]) * rq),
              (this[x7(0x28f)] +=
                (Math[x7(0x46b)](this[x7(0xe2f)]) - this[x7(0x28f)]) * rq);
          }
          (this[x7(0x297)] = f8(this[x7(0xac9)], this[x7(0xe2f)], this["t"])),
            (this[x7(0x2c0)] +=
              ((Math[x7(0x78b)](
                this["x"] - this["nx"],
                this["y"] - this["ny"]
              ) /
                0x32) *
                pA) /
              0x12),
            this[x7(0x23a)] > 0x0 &&
              ((this[x7(0x23a)] -= pA / 0x258),
              this[x7(0x23a)] < 0x0 && (this[x7(0x23a)] = 0x0)),
            this[x7(0x87b)] &&
              ((this[x7(0xe17)] += pA / 0x5dc),
              this[x7(0xe17)] > 0x1 && (this[x7(0xe17)] = 0x1),
              (this[x7(0xaa4)] = this[x7(0xe17)] < 0x1)),
            this[x7(0x2d7)] < 0x1 &&
              (this[x7(0x8bd)] = pg(this[x7(0x8bd)], 0x1, 0xc8)),
            this[x7(0x23a)] === 0x0 &&
              (this[x7(0x67c)] +=
                (this[x7(0x2d7)] - this[x7(0x67c)]) *
                Math[x7(0x36c)](0x1, pA / 0xc8));
        }
        [uf(0xbc5)](rq, rr = ![]) {
          const x8 = uf,
            rs = this[x8(0xc39)] / 0x19;
          rq[x8(0x264)](rs),
            rq[x8(0xd15)](0x5, 0x0),
            (rq[x8(0x38e)] = 0x5),
            (rq[x8(0xe5e)] = rq[x8(0x92c)] = x8(0x2d8)),
            (rq[x8(0x9a7)] = rq[x8(0x2d4)] = this[x8(0x40c)](x8(0x521)));
          rr &&
            (rq[x8(0xc61)](),
            rq[x8(0xd15)](0x3, 0x0),
            rq[x8(0xc3a)](),
            rq[x8(0xd7c)](-0xa, 0x0),
            rq[x8(0xbc9)](-0x28, -0xf),
            rq[x8(0xbb6)](-0x21, 0x0, -0x28, 0xf),
            rq[x8(0x5fb)](),
            rq[x8(0xa10)](),
            rq[x8(0x2c1)](),
            rq[x8(0xec9)]());
          rq[x8(0xc3a)](), rq[x8(0xd7c)](0x0, 0x1e);
          const rt = 0x1c,
            ru = 0x24,
            rv = 0x5;
          rq[x8(0xd7c)](0x0, rt);
          for (let rw = 0x0; rw < rv; rw++) {
            const rx = ((((rw + 0.5) / rv) * 0x2 - 0x1) * Math["PI"]) / 0x2,
              ry = ((((rw + 0x1) / rv) * 0x2 - 0x1) * Math["PI"]) / 0x2;
            rq[x8(0xbb6)](
              Math[x8(0xd3d)](rx) * ru * 0.85,
              -Math[x8(0x46b)](rx) * ru,
              Math[x8(0xd3d)](ry) * rt * 0.7,
              -Math[x8(0x46b)](ry) * rt
            );
          }
          rq[x8(0xbc9)](-0x1c, -0x9),
            rq[x8(0xbb6)](-0x26, 0x0, -0x1c, 0x9),
            rq[x8(0xbc9)](0x0, rt),
            rq[x8(0x5fb)](),
            (rq[x8(0x2d4)] = this[x8(0x40c)](x8(0xc53))),
            rq[x8(0xec9)](),
            rq[x8(0x2c1)](),
            rq[x8(0xc3a)]();
          for (let rz = 0x0; rz < 0x4; rz++) {
            const rA = (((rz / 0x3) * 0x2 - 0x1) * Math["PI"]) / 0x7,
              rB = -0x1e + Math[x8(0xd3d)](rA) * 0xd,
              rC = Math[x8(0x46b)](rA) * 0xb;
            rq[x8(0xd7c)](rB, rC),
              rq[x8(0xbc9)](
                rB + Math[x8(0xd3d)](rA) * 0x1b,
                rC + Math[x8(0x46b)](rA) * 0x1b
              );
          }
          (rq[x8(0x38e)] = 0x4), rq[x8(0x2c1)]();
        }
        [uf(0x36d)](rq, rr = uf(0x51e), rs = 0x0) {
          const x9 = uf;
          for (let rt = 0x0; rt < l1[x9(0x4cf)]; rt++) {
            const ru = l1[rt];
            rq[x9(0xc61)](),
              rq[x9(0xa38)](
                ru[x9(0x759)] * Math[x9(0x46b)](this[x9(0x2c0)] + rt) * 0.15 +
                  rs * ru[x9(0xe2c)]
              ),
              rq[x9(0xc3a)](),
              rq[x9(0xd7c)](...ru[x9(0x230)]),
              rq[x9(0xbb6)](...ru[x9(0x731)]),
              (rq[x9(0x9a7)] = this[x9(0x40c)](rr)),
              (rq[x9(0x38e)] = 0x8),
              (rq[x9(0xe5e)] = x9(0x2d8)),
              rq[x9(0x2c1)](),
              rq[x9(0xa10)]();
          }
        }
        [uf(0xa62)](rq) {
          const xa = uf;
          rq[xa(0xc3a)]();
          let rr = 0x0,
            rs = 0x0,
            rt,
            ru;
          const rv = 0x14;
          for (let rw = 0x0; rw < rv; rw++) {
            const rx = (rw / rv) * Math["PI"] * 0x4 + Math["PI"] / 0x2,
              ry = ((rw + 0x1) / rv) * 0x28;
            (rt = Math[xa(0xd3d)](rx) * ry), (ru = Math[xa(0x46b)](rx) * ry);
            const rz = rr + rt,
              rA = rs + ru;
            rq[xa(0xbb6)](
              (rr + rz) * 0.5 + ru * 0.15,
              (rs + rA) * 0.5 - rt * 0.15,
              rz,
              rA
            ),
              (rr = rz),
              (rs = rA);
          }
          rq[xa(0xbb6)](
            rr - ru * 0.42 + rt * 0.4,
            rs + rt * 0.42 + ru * 0.4,
            rr - ru * 0.84,
            rs + rt * 0.84
          ),
            (rq[xa(0x2d4)] = this[xa(0x40c)](xa(0xe74))),
            rq[xa(0xec9)](),
            (rq[xa(0x38e)] = 0x8),
            (rq[xa(0x9a7)] = this[xa(0x40c)](xa(0x8d1))),
            rq[xa(0x2c1)]();
        }
        [uf(0x294)](rq) {
          const xb = uf;
          rq[xb(0x264)](this[xb(0xc39)] / 0xd),
            rq[xb(0xa38)](-Math["PI"] / 0x6),
            (rq[xb(0xe5e)] = rq[xb(0x92c)] = xb(0x2d8)),
            rq[xb(0xc3a)](),
            rq[xb(0xd7c)](0x0, -0xe),
            rq[xb(0xbc9)](0x6, -0x14),
            (rq[xb(0x2d4)] = rq[xb(0x9a7)] = this[xb(0x40c)](xb(0x92a))),
            (rq[xb(0x38e)] = 0x7),
            rq[xb(0x2c1)](),
            (rq[xb(0x2d4)] = rq[xb(0x9a7)] = this[xb(0x40c)](xb(0xe21))),
            (rq[xb(0x38e)] = 0x2),
            rq[xb(0x2c1)](),
            rq[xb(0xc3a)](),
            rq[xb(0xd7c)](0x0, -0xc),
            rq[xb(0xbb6)](-0x6, 0x0, 0x4, 0xe),
            rq[xb(0xc43)](-0x9, 0xa, -0x9, -0xa, 0x0, -0xe),
            (rq[xb(0x38e)] = 0xc),
            (rq[xb(0x2d4)] = rq[xb(0x9a7)] = this[xb(0x40c)](xb(0x718))),
            rq[xb(0xec9)](),
            rq[xb(0x2c1)](),
            (rq[xb(0x38e)] = 0x6),
            (rq[xb(0x2d4)] = rq[xb(0x9a7)] = this[xb(0x40c)](xb(0x370))),
            rq[xb(0x2c1)](),
            rq[xb(0xec9)]();
        }
        [uf(0x6b3)](rq) {
          const xc = uf;
          rq[xc(0x264)](this[xc(0xc39)] / 0x2d),
            rq[xc(0xd15)](-0x14, 0x0),
            (rq[xc(0xe5e)] = rq[xc(0x92c)] = xc(0x2d8)),
            rq[xc(0xc3a)]();
          const rr = 0x6,
            rs = Math["PI"] * 0.45,
            rt = 0x3c,
            ru = 0x46;
          rq[xc(0xd7c)](0x0, 0x0);
          for (let rv = 0x0; rv < rr; rv++) {
            const rw = ((rv / rr) * 0x2 - 0x1) * rs,
              rx = (((rv + 0x1) / rr) * 0x2 - 0x1) * rs;
            rv === 0x0 &&
              rq[xc(0xbb6)](
                -0xa,
                -0x32,
                Math[xc(0xd3d)](rw) * rt,
                Math[xc(0x46b)](rw) * rt
              );
            const ry = (rw + rx) / 0x2;
            rq[xc(0xbb6)](
              Math[xc(0xd3d)](ry) * ru,
              Math[xc(0x46b)](ry) * ru,
              Math[xc(0xd3d)](rx) * rt,
              Math[xc(0x46b)](rx) * rt
            );
          }
          rq[xc(0xbb6)](-0xa, 0x32, 0x0, 0x0),
            (rq[xc(0x2d4)] = this[xc(0x40c)](xc(0x988))),
            (rq[xc(0x9a7)] = this[xc(0x40c)](xc(0x791))),
            (rq[xc(0x38e)] = 0xa),
            rq[xc(0x2c1)](),
            rq[xc(0xec9)](),
            rq[xc(0xc3a)](),
            rq[xc(0x54b)](0x0, 0x0, 0x28, -Math["PI"] / 0x2, Math["PI"] / 0x2),
            rq[xc(0x5fb)](),
            (rq[xc(0x9a7)] = this[xc(0x40c)](xc(0x43c))),
            (rq[xc(0x38e)] = 0x1e),
            rq[xc(0x2c1)](),
            (rq[xc(0x38e)] = 0xa),
            (rq[xc(0x9a7)] = rq[xc(0x2d4)] = this[xc(0x40c)](xc(0xaf5))),
            rq[xc(0xec9)](),
            rq[xc(0x2c1)]();
        }
        [uf(0x8d4)](rq, rr = ![]) {
          const xd = uf;
          rq[xd(0x264)](this[xd(0xc39)] / 0x64);
          let rs = this[xd(0x919)]
            ? 0.75
            : Math[xd(0x46b)](Date[xd(0x796)]() / 0x96 + this[xd(0x2c0)]);
          (rs = rs * 0.5 + 0.5),
            (rs *= 0.7),
            rq[xd(0xc3a)](),
            rq[xd(0xd7c)](0x0, 0x0),
            rq[xd(0x54b)](0x0, 0x0, 0x64, rs, Math["PI"] * 0x2 - rs),
            rq[xd(0x5fb)](),
            (rq[xd(0x2d4)] = this[xd(0x40c)](xd(0x383))),
            rq[xd(0xec9)](),
            rq[xd(0x94c)](),
            (rq[xd(0x9a7)] = xd(0x6d3)),
            (rq[xd(0x38e)] = rr ? 0x28 : 0x1e),
            (rq[xd(0x92c)] = xd(0x2d8)),
            rq[xd(0x2c1)](),
            !rr &&
              (rq[xd(0xc3a)](),
              rq[xd(0x54b)](
                0x0 - rs * 0x8,
                -0x32 - rs * 0x3,
                0x10,
                0x0,
                Math["PI"] * 0x2
              ),
              (rq[xd(0x2d4)] = xd(0x92d)),
              rq[xd(0xec9)]());
        }
        [uf(0xc50)](rq) {
          const xe = uf;
          rq[xe(0x264)](this[xe(0xc39)] / 0x50),
            rq[xe(0xa38)](-this[xe(0x297)]),
            rq[xe(0xd15)](0x0, 0x50);
          const rr = Date[xe(0x796)]() / 0x12c + this[xe(0x2c0)];
          rq[xe(0xc3a)]();
          const rs = 0x3;
          let rt;
          for (let rw = 0x0; rw < rs; rw++) {
            const rx = ((rw / rs) * 0x2 - 0x1) * 0x64,
              ry = (((rw + 0x1) / rs) * 0x2 - 0x1) * 0x64;
            (rt =
              0x14 +
              (Math[xe(0x46b)]((rw / rs) * Math["PI"] * 0x8 + rr) * 0.5 + 0.5) *
                0x1e),
              rw === 0x0 && rq[xe(0xd7c)](rx, -rt),
              rq[xe(0xc43)](rx, rt, ry, rt, ry, -rt);
          }
          rq[xe(0xc43)](0x64, -0xfa, -0x64, -0xfa, -0x64, -rt),
            rq[xe(0x5fb)](),
            (rq[xe(0x28b)] *= 0.7);
          const ru = this[xe(0xb46)]
            ? lh[0x0]
            : this["id"] < 0x0
            ? lj[0x0]
            : lj[this["id"] % lj[xe(0x4cf)]];
          (rq[xe(0x2d4)] = this[xe(0x40c)](ru)),
            rq[xe(0xec9)](),
            rq[xe(0x94c)](),
            (rq[xe(0x92c)] = xe(0x2d8)),
            (rq[xe(0x9a7)] = xe(0x6d3)),
            xe(0x754),
            (rq[xe(0x38e)] = 0x1e),
            rq[xe(0x2c1)]();
          let rv = Math[xe(0x46b)](rr * 0x1);
          (rv = rv * 0.5 + 0.5),
            (rv *= 0x3),
            rq[xe(0xc3a)](),
            rq[xe(0x3e8)](
              0x0,
              -0x82 - rv * 0x2,
              0x28 - rv,
              0x14 - rv * 1.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xe(0x2d4)] = rq[xe(0x9a7)]),
            rq[xe(0xec9)]();
        }
        [uf(0xc2b)](rq, rr) {
          const xf = uf;
          rq[xf(0x264)](this[xf(0xc39)] / 0x14);
          const rs = rq[xf(0x28b)];
          (rq[xf(0x9a7)] = rq[xf(0x2d4)] = this[xf(0x40c)](xf(0x81f))),
            (rq[xf(0x28b)] = 0.4 * rs),
            rq[xf(0xc61)](),
            rq[xf(0xc3a)](),
            rq[xf(0xa38)](Math["PI"] * 0.16),
            rq[xf(0xd15)](rr ? -0x6 : -0x9, 0x0),
            rq[xf(0xd7c)](0x0, -0x4),
            rq[xf(0xbb6)](-0x2, 0x0, 0x0, 0x4),
            (rq[xf(0x38e)] = 0x8),
            (rq[xf(0x92c)] = rq[xf(0xe5e)] = xf(0x2d8)),
            rq[xf(0x2c1)](),
            rq[xf(0xa10)](),
            rq[xf(0xc3a)](),
            rq[xf(0x54b)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
            rq[xf(0xec9)](),
            rq[xf(0x94c)](),
            (rq[xf(0x28b)] = 0.5 * rs),
            (rq[xf(0x38e)] = rr ? 0x8 : 0x3),
            rq[xf(0x2c1)]();
        }
        [uf(0x67e)](rq) {
          const xg = uf;
          rq[xg(0x264)](this[xg(0xc39)] / 0x64);
          const rr = this[xg(0x40c)](xg(0x490)),
            rs = this[xg(0x40c)](xg(0xed4)),
            rt = 0x4;
          rq[xg(0x92c)] = rq[xg(0xe5e)] = xg(0x2d8);
          const ru = 0x64 - rq[xg(0x38e)] * 0.5;
          for (let rv = 0x0; rv <= rt; rv++) {
            const rw = (0x1 - rv / rt) * ru;
            lE(rq, rw),
              (rq[xg(0x38e)] =
                0x1e +
                rv *
                  (Math[xg(0x46b)](Date[xg(0x796)]() / 0x320 + rv) * 0.5 +
                    0.5) *
                  0x5),
              (rq[xg(0x2d4)] = rq[xg(0x9a7)] = rv % 0x2 === 0x0 ? rr : rs),
              rv === rt - 0x1 && rq[xg(0xec9)](),
              rq[xg(0x2c1)]();
          }
        }
        [uf(0xe23)](rq, rr) {
          const xh = uf;
          rq[xh(0xc3a)](),
            rq[xh(0x54b)](0x0, 0x0, this[xh(0xc39)], 0x0, l0),
            (rq[xh(0x2d4)] = this[xh(0x40c)](rr)),
            rq[xh(0xec9)](),
            (rq[xh(0x2d4)] = xh(0x92d));
          for (let rs = 0x1; rs < 0x4; rs++) {
            rq[xh(0xc3a)](),
              rq[xh(0x54b)](
                0x0,
                0x0,
                this[xh(0xc39)] * (0x1 - rs / 0x4),
                0x0,
                l0
              ),
              rq[xh(0xec9)]();
          }
        }
        [uf(0x4ec)](rq, rr) {
          const xi = uf;
          rq[xi(0xd15)](-this[xi(0xc39)], 0x0), (rq[xi(0x3dd)] = xi(0xb54));
          const rs = 0x32;
          let rt = ![];
          !this[xi(0x5db)] && ((rt = !![]), (this[xi(0x5db)] = []));
          while (this[xi(0x5db)][xi(0x4cf)] < rs) {
            this[xi(0x5db)][xi(0x9ee)]({
              x: rt ? Math[xi(0xa69)]() : 0x0,
              y: Math[xi(0xa69)]() * 0x2 - 0x1,
              vx: Math[xi(0xa69)]() * 0.03 + 0.02,
              size: Math[xi(0xa69)]() * 0.2 + 0.2,
            });
          }
          const ru = this[xi(0xc39)] * 0x2,
            rv = Math[xi(0x525)](this[xi(0xc39)] * 0.1, 0x4),
            rw = rq[xi(0x28b)];
          (rq[xi(0x2d4)] = rr), rq[xi(0xc3a)]();
          for (let rx = rs - 0x1; rx >= 0x0; rx--) {
            const ry = this[xi(0x5db)][rx];
            ry["x"] += ry["vx"];
            const rz = ry["x"] * ru,
              rA = this[xi(0x775)] * rz,
              rB = ry["y"] * rA,
              rC =
                Math[xi(0x367)](0x1 - Math[xi(0xc8b)](rB) / rA, 0.2) *
                Math[xi(0x367)](0x1 - rz / ru, 0.2);
            if (ry["x"] >= 0x1 || rC < 0.001) {
              this[xi(0x5db)][xi(0x708)](rx, 0x1);
              continue;
            }
            (rq[xi(0x28b)] = rC * rw * 0.5),
              rq[xi(0xc3a)](),
              rq[xi(0x54b)](
                rz,
                rB,
                ry[xi(0xc39)] * rA + rv,
                0x0,
                Math["PI"] * 0x2
              ),
              rq[xi(0xec9)]();
          }
        }
        [uf(0x2f9)](rq) {
          const xj = uf;
          rq[xj(0x264)](this[xj(0xc39)] / 0x46),
            rq[xj(0xa38)](-Math["PI"] / 0x2);
          const rr = pz / 0xc8;
          (rq[xj(0x38e)] = 0x14),
            (rq[xj(0x9a7)] = xj(0x809)),
            (rq[xj(0xe5e)] = rq[xj(0x92c)] = xj(0x2d8)),
            (rq[xj(0x2d4)] = this[xj(0x40c)](xj(0x568)));
          if (!![]) {
            this[xj(0x314)](rq);
            return;
          }
          const rs = 0x2;
          for (let rt = 0x1; rt <= rs; rt++) {
            rq[xj(0xc61)]();
            let ru = 0x1 - rt / rs;
            (ru *= 0x1 + Math[xj(0x46b)](rr + rt) * 0.5),
              (ru = 0x1 + ru * 0.5),
              (rq[xj(0x28b)] *= Math[xj(0x367)](rt / rs, 0x2)),
              rq[xj(0xd07)](ru, ru),
              rt !== rs &&
                ((rq[xj(0x28b)] *= 0.7),
                (rq[xj(0x3dd)] = xj(0xb54)),
                (rq[xj(0x94f)] = xj(0x6b8))),
              this[xj(0x314)](rq),
              rq[xj(0xa10)]();
          }
        }
        [uf(0xc74)](rq, rr = 0xbe) {
          const xk = uf;
          rq[xk(0xc61)](),
            rq[xk(0xc3a)](),
            rq[xk(0xd7c)](0x0, -0x46 + rr + 0x1e),
            rq[xk(0xbc9)](0x1a, -0x46 + rr),
            rq[xk(0xbc9)](0xd, -0x46),
            rq[xk(0xbc9)](-0xd, -0x46),
            rq[xk(0xbc9)](-0x1a, -0x46 + rr),
            rq[xk(0xbc9)](0x0, -0x46 + rr + 0x1e),
            rq[xk(0x94c)](),
            rq[xk(0xec9)](),
            rq[xk(0x2c1)](),
            rq[xk(0xa10)](),
            rq[xk(0xc61)](),
            rq[xk(0xc3a)](),
            rq[xk(0xd7c)](-0x12, -0x46),
            rq[xk(0xbb6)](-0x5, -0x50, -0xa, -0x69),
            rq[xk(0xc43)](-0xa, -0x73, 0xa, -0x73, 0xa, -0x69),
            rq[xk(0xbb6)](0x5, -0x50, 0x12, -0x46),
            rq[xk(0xbb6)](0x0, -0x3c, -0x12, -0x46),
            rq[xk(0x5fb)](),
            this[xk(0xb21)]
              ? ((rq[xk(0x2d4)] = this[xk(0x40c)](xk(0x790))),
                (rq[xk(0x9a7)] = this[xk(0x40c)](xk(0x968))))
              : (rq[xk(0x9a7)] = this[xk(0x40c)](xk(0xa07))),
            rq[xk(0xec9)](),
            (rq[xk(0x38e)] = 0xa),
            rq[xk(0x2c1)](),
            rq[xk(0xa10)]();
        }
        [uf(0x314)](rq) {
          const xl = uf;
          rq[xl(0xc61)](), rq[xl(0xc3a)]();
          for (let rr = 0x0; rr < 0x2; rr++) {
            rq[xl(0xd7c)](0x14, -0x1e),
              rq[xl(0xbb6)](0x5a, -0xa, 0x32, -0x32),
              rq[xl(0xbc9)](0xa0, -0x32),
              rq[xl(0xbb6)](0x8c, 0x3c, 0x14, 0x0),
              rq[xl(0xd07)](-0x1, 0x1);
          }
          rq[xl(0x94c)](),
            rq[xl(0xec9)](),
            rq[xl(0x2c1)](),
            rq[xl(0xa10)](),
            this[xl(0xc74)](rq),
            rq[xl(0xc61)](),
            rq[xl(0xc3a)](),
            rq[xl(0x54b)](0x0, 0x0, 0x32, 0x0, Math["PI"], !![]),
            rq[xl(0xbc9)](-0x32, 0x1e),
            rq[xl(0xbc9)](-0x1e, 0x1e),
            rq[xl(0xbc9)](-0x1f, 0x32),
            rq[xl(0xbc9)](0x1f, 0x32),
            rq[xl(0xbc9)](0x1e, 0x1e),
            rq[xl(0xbc9)](0x32, 0x1e),
            rq[xl(0xbc9)](0x32, 0x0),
            rq[xl(0xec9)](),
            rq[xl(0x94c)](),
            rq[xl(0x2c1)](),
            rq[xl(0xc3a)](),
            rq[xl(0x3e8)](-0x12, -0x2, 0xf, 0xb, -0.4, 0x0, Math["PI"] * 0x2),
            rq[xl(0x3e8)](0x12, -0x2, 0xf, 0xb, 0.4, 0x0, Math["PI"] * 0x2),
            (rq[xl(0x2d4)] = rq[xl(0x9a7)]),
            rq[xl(0xec9)](),
            rq[xl(0xa10)]();
        }
        [uf(0x8c4)](rq) {
          const xm = uf;
          rq[xm(0x264)](this[xm(0xc39)] / 0x64), (rq[xm(0x9a7)] = xm(0x92d));
          const rr = this[xm(0x40c)](xm(0x474)),
            rs = this[xm(0x40c)](xm(0x484));
          (this[xm(0x903)] += (pA / 0x12c) * (this[xm(0xaa4)] ? 0x1 : -0x1)),
            (this[xm(0x903)] = Math[xm(0x36c)](
              0x1,
              Math[xm(0x525)](0x0, this[xm(0x903)])
            ));
          const rt = this[xm(0x919)] ? 0x1 : this[xm(0x903)],
            ru = 0x1 - rt;
          rq[xm(0xc61)](),
            rq[xm(0xc3a)](),
            rq[xm(0xd15)](
              (0x30 +
                (Math[xm(0x46b)](this[xm(0x2c0)] * 0x1) * 0.5 + 0.5) * 0x8) *
                rt +
                (0x1 - rt) * -0x14,
              0x0
            ),
            rq[xm(0xd07)](1.1, 1.1),
            rq[xm(0xd7c)](0x0, -0xa),
            rq[xm(0xc43)](0x8c, -0x82, 0x8c, 0x82, 0x0, 0xa),
            (rq[xm(0x2d4)] = rs),
            rq[xm(0xec9)](),
            (rq[xm(0x92c)] = xm(0x2d8)),
            (rq[xm(0x38e)] = 0x1c),
            rq[xm(0x94c)](),
            rq[xm(0x2c1)](),
            rq[xm(0xa10)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            const rw = Math[xm(0x46b)](this[xm(0x2c0)] * 0x1);
            rq[xm(0xc61)]();
            const rx = rv * 0x2 - 0x1;
            rq[xm(0xd07)](0x1, rx),
              rq[xm(0xd15)](0x32 * rt - ru * 0xa, 0x50 * rt),
              rq[xm(0xa38)](rw * 0.2 + 0.3 - ru * 0x1),
              rq[xm(0xc3a)](),
              rq[xm(0xd7c)](0xa, -0xa),
              rq[xm(0xbb6)](0x1e, 0x28, -0x14, 0x50),
              rq[xm(0xbb6)](0xa, 0x1e, -0xf, 0x0),
              (rq[xm(0x9a7)] = rr),
              (rq[xm(0x38e)] = 0x2c),
              (rq[xm(0xe5e)] = rq[xm(0x92c)] = xm(0x2d8)),
              rq[xm(0x2c1)](),
              (rq[xm(0x38e)] -= 0x1c),
              (rq[xm(0x2d4)] = rq[xm(0x9a7)] = rs),
              rq[xm(0xec9)](),
              rq[xm(0x2c1)](),
              rq[xm(0xa10)]();
          }
          for (let ry = 0x0; ry < 0x2; ry++) {
            const rz = Math[xm(0x46b)](this[xm(0x2c0)] * 0x1 + 0x1);
            rq[xm(0xc61)]();
            const rA = ry * 0x2 - 0x1;
            rq[xm(0xd07)](0x1, rA),
              rq[xm(0xd15)](-0x41 * rt, 0x32 * rt),
              rq[xm(0xa38)](rz * 0.3 + 1.3),
              rq[xm(0xc3a)](),
              rq[xm(0xd7c)](0xc, -0x5),
              rq[xm(0xbb6)](0x28, 0x1e, 0x0, 0x3c),
              rq[xm(0xbb6)](0x14, 0x1e, 0x0, 0x0),
              (rq[xm(0x9a7)] = rr),
              (rq[xm(0x38e)] = 0x2c),
              (rq[xm(0xe5e)] = rq[xm(0x92c)] = xm(0x2d8)),
              rq[xm(0x2c1)](),
              (rq[xm(0x38e)] -= 0x1c),
              (rq[xm(0x2d4)] = rq[xm(0x9a7)] = rs),
              rq[xm(0x2c1)](),
              rq[xm(0xec9)](),
              rq[xm(0xa10)]();
          }
          this[xm(0x3ab)](rq);
        }
        [uf(0x3ab)](rq, rr = 0x1) {
          const xn = uf;
          rq[xn(0xc3a)](),
            rq[xn(0x54b)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xn(0x9a7)] = xn(0x92d)),
            (rq[xn(0x2d4)] = this[xn(0x40c)](xn(0xd43))),
            rq[xn(0xec9)](),
            (rq[xn(0x38e)] = 0x1e * rr),
            rq[xn(0xc61)](),
            rq[xn(0x94c)](),
            rq[xn(0x2c1)](),
            rq[xn(0xa10)](),
            rq[xn(0xc61)](),
            rq[xn(0xc3a)](),
            rq[xn(0x54b)](
              0x0,
              0x0,
              0x64 - rq[xn(0x38e)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rq[xn(0x94c)](),
            rq[xn(0xc3a)]();
          for (let rs = 0x0; rs < 0x6; rs++) {
            const rt = (rs / 0x6) * Math["PI"] * 0x2;
            rq[xn(0xbc9)](
              Math[xn(0xd3d)](rt) * 0x28,
              Math[xn(0x46b)](rt) * 0x28
            );
          }
          rq[xn(0x5fb)]();
          for (let ru = 0x0; ru < 0x6; ru++) {
            const rv = (ru / 0x6) * Math["PI"] * 0x2,
              rw = Math[xn(0xd3d)](rv) * 0x28,
              rx = Math[xn(0x46b)](rv) * 0x28;
            rq[xn(0xd7c)](rw, rx), rq[xn(0xbc9)](rw * 0x3, rx * 0x3);
          }
          (rq[xn(0x38e)] = 0x10 * rr),
            (rq[xn(0xe5e)] = rq[xn(0x92c)] = xn(0x2d8)),
            rq[xn(0x2c1)](),
            rq[xn(0xa10)]();
        }
        [uf(0x372)](rq) {
          const xo = uf;
          rq[xo(0x264)](this[xo(0xc39)] / 0x82);
          let rr, rs;
          const rt = 0x2d,
            ru = lp(
              this[xo(0x7ca)] ||
                (this[xo(0x7ca)] = this[xo(0x919)]
                  ? 0x28
                  : Math[xo(0xa69)]() * 0x3e8)
            );
          let rv = ru() * 6.28;
          const rw = Date[xo(0x796)]() / 0xc8,
            rx = [xo(0x648), xo(0x8fe)][xo(0x20a)]((ry) => this[xo(0x40c)](ry));
          for (let ry = 0x0; ry <= rt; ry++) {
            (ry % 0x5 === 0x0 || ry === rt) &&
              (ry > 0x0 &&
                ((rq[xo(0x38e)] = 0x19),
                (rq[xo(0x92c)] = rq[xo(0xe5e)] = xo(0x2d8)),
                (rq[xo(0x9a7)] = rx[0x1]),
                rq[xo(0x2c1)](),
                (rq[xo(0x38e)] = 0xc),
                (rq[xo(0x9a7)] = rx[0x0]),
                rq[xo(0x2c1)]()),
              ry !== rt && (rq[xo(0xc3a)](), rq[xo(0xd7c)](rr, rs)));
            let rz = ry / 0x32;
            (rz *= rz), (rv += (0.3 + ru() * 0.8) * 0x3);
            const rA = 0x14 + Math[xo(0x46b)](rz * 3.14) * 0x6e,
              rB = Math[xo(0x46b)](ry + rw) * 0.5,
              rC = Math[xo(0xd3d)](rv + rB) * rA,
              rD = Math[xo(0x46b)](rv + rB) * rA,
              rE = rC - rr,
              rF = rD - rs;
            rq[xo(0xbb6)]((rr + rC) / 0x2 + rF, (rs + rD) / 0x2 - rE, rC, rD),
              (rr = rC),
              (rs = rD);
          }
        }
        [uf(0xb7c)](rq) {
          const xp = uf;
          rq[xp(0x264)](this[xp(0xc39)] / 0x6e),
            (rq[xp(0x9a7)] = xp(0x92d)),
            (rq[xp(0x38e)] = 0x1c),
            rq[xp(0xc3a)](),
            rq[xp(0x54b)](0x0, 0x0, 0x6e, 0x0, Math["PI"] * 0x2),
            (rq[xp(0x2d4)] = this[xp(0x40c)](xp(0xc57))),
            rq[xp(0xec9)](),
            rq[xp(0xc61)](),
            rq[xp(0x94c)](),
            rq[xp(0x2c1)](),
            rq[xp(0xa10)](),
            rq[xp(0xc3a)](),
            rq[xp(0x54b)](0x0, 0x0, 0x46, 0x0, Math["PI"] * 0x2),
            (rq[xp(0x2d4)] = xp(0x762)),
            rq[xp(0xec9)](),
            rq[xp(0xc61)](),
            rq[xp(0x94c)](),
            rq[xp(0x2c1)](),
            rq[xp(0xa10)]();
          const rr = lp(
              this[xp(0x400)] ||
                (this[xp(0x400)] = this[xp(0x919)]
                  ? 0x1e
                  : Math[xp(0xa69)]() * 0x3e8)
            ),
            rs = this[xp(0x40c)](xp(0x506)),
            rt = this[xp(0x40c)](xp(0xec4));
          for (let rw = 0x0; rw < 0x3; rw++) {
            rq[xp(0xc3a)]();
            const rx = 0xc;
            for (let ry = 0x0; ry < rx; ry++) {
              const rz = (Math["PI"] * 0x2 * ry) / rx;
              rq[xp(0xc61)](),
                rq[xp(0xa38)](rz + rr() * 0.4),
                rq[xp(0xd15)](0x3c + rr() * 0xa, 0x0),
                rq[xp(0xd7c)](rr() * 0x5, rr() * 0x5),
                rq[xp(0xc43)](
                  0x14 + rr() * 0xa,
                  rr() * 0x14,
                  0x28 + rr() * 0x14,
                  rr() * 0x1e + 0xa,
                  0x3c + rr() * 0xa,
                  rr() * 0xa + 0xa
                ),
                rq[xp(0xa10)]();
            }
            (rq[xp(0xe5e)] = rq[xp(0x92c)] = xp(0x2d8)),
              (rq[xp(0x38e)] = 0x12 - rw * 0x2),
              (rq[xp(0x9a7)] = rs),
              rq[xp(0x2c1)](),
              (rq[xp(0x38e)] -= 0x8),
              (rq[xp(0x9a7)] = rt),
              rq[xp(0x2c1)]();
          }
          const ru = 0x28;
          rq[xp(0xa38)](-this[xp(0x297)]),
            (rq[xp(0x2d4)] = this[xp(0x40c)](xp(0xcd8))),
            (rq[xp(0x9a7)] = this[xp(0x40c)](xp(0x53d))),
            (rq[xp(0x38e)] = 0x9);
          const rv = this[xp(0x2d7)] * 0x6;
          for (let rA = 0x0; rA < rv; rA++) {
            const rB = ((rA - 0x1) / 0x6) * Math["PI"] * 0x2 - Math["PI"] / 0x2;
            rq[xp(0xc3a)](),
              rq[xp(0x3e8)](
                Math[xp(0xd3d)](rB) * ru,
                Math[xp(0x46b)](rB) * ru * 0.7,
                0x19,
                0x23,
                0x0,
                0x0,
                Math["PI"] * 0x2
              ),
              rq[xp(0xec9)](),
              rq[xp(0x2c1)]();
          }
        }
        [uf(0xae0)](rq) {
          const xq = uf;
          rq[xq(0xa38)](-this[xq(0x297)]),
            rq[xq(0x264)](this[xq(0xc39)] / 0x3c),
            (rq[xq(0xe5e)] = rq[xq(0x92c)] = xq(0x2d8));
          let rr =
            Math[xq(0x46b)](Date[xq(0x796)]() / 0x12c + this[xq(0x2c0)] * 0.5) *
              0.5 +
            0.5;
          (rr *= 1.5),
            rq[xq(0xc3a)](),
            rq[xq(0xd7c)](-0x32, -0x32 - rr * 0x3),
            rq[xq(0xbb6)](0x0, -0x3c, 0x32, -0x32 - rr * 0x3),
            rq[xq(0xbb6)](0x50 - rr * 0x3, -0xa, 0x50, 0x32),
            rq[xq(0xbb6)](0x46, 0x4b, 0x28, 0x4e + rr * 0x5),
            rq[xq(0xbc9)](0x1e, 0x3c + rr * 0x5),
            rq[xq(0xbb6)](0x2d, 0x37, 0x32, 0x2d),
            rq[xq(0xbb6)](0x0, 0x41, -0x32, 0x32),
            rq[xq(0xbb6)](-0x2d, 0x37, -0x1e, 0x3c + rr * 0x3),
            rq[xq(0xbc9)](-0x28, 0x4e + rr * 0x5),
            rq[xq(0xbb6)](-0x46, 0x4b, -0x50, 0x32),
            rq[xq(0xbb6)](-0x50 + rr * 0x3, -0xa, -0x32, -0x32 - rr * 0x3),
            (rq[xq(0x2d4)] = this[xq(0x40c)](xq(0x219))),
            rq[xq(0xec9)](),
            (rq[xq(0x9a7)] = xq(0x92d)),
            rq[xq(0xc61)](),
            rq[xq(0x94c)](),
            (rq[xq(0x38e)] = 0xe),
            rq[xq(0x2c1)](),
            rq[xq(0xa10)]();
          for (let rs = 0x0; rs < 0x2; rs++) {
            rq[xq(0xc61)](),
              rq[xq(0xd07)](rs * 0x2 - 0x1, 0x1),
              rq[xq(0xd15)](-0x22, -0x18 - rr * 0x3),
              rq[xq(0xa38)](-0.6),
              rq[xq(0xd07)](1.3, 1.3),
              rq[xq(0xc3a)](),
              rq[xq(0xd7c)](-0x14, 0x0),
              rq[xq(0xbb6)](-0x14, -0x19, 0x0, -0x28),
              rq[xq(0xbb6)](0x14, -0x19, 0x14, 0x0),
              rq[xq(0xec9)](),
              rq[xq(0x94c)](),
              (rq[xq(0x38e)] = 0xd),
              rq[xq(0x2c1)](),
              rq[xq(0xa10)]();
          }
          rq[xq(0xc61)](),
            rq[xq(0xc3a)](),
            rq[xq(0x3e8)](
              0x0,
              0x1e,
              0x24 - rr * 0x2,
              0x8 - rr,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xq(0x2d4)] = this[xq(0x40c)](xq(0x81e))),
            (rq[xq(0x28b)] *= 0.2),
            rq[xq(0xec9)](),
            rq[xq(0xa10)](),
            (rq[xq(0x2d4)] = rq[xq(0x9a7)] = this[xq(0x40c)](xq(0x765)));
          for (let rt = 0x0; rt < 0x2; rt++) {
            rq[xq(0xc61)](),
              rq[xq(0xd07)](rt * 0x2 - 0x1, 0x1),
              rq[xq(0xd15)](0x19 - rr * 0x1, 0xf - rr * 0x3),
              rq[xq(0xa38)](-0.3),
              rq[xq(0xc3a)](),
              rq[xq(0x54b)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2 * 0.72),
              rq[xq(0xec9)](),
              rq[xq(0xa10)]();
          }
          rq[xq(0xc61)](),
            (rq[xq(0x38e)] = 0x5),
            rq[xq(0xd15)](0x0, 0x21 - rr * 0x1),
            rq[xq(0xc3a)](),
            rq[xq(0xd7c)](-0xc, 0x0),
            rq[xq(0xc43)](-0xc, 0x8, 0x0, 0x8, 0x0, 0x0),
            rq[xq(0xc43)](0x0, 0x8, 0xc, 0x8, 0xc, 0x0),
            rq[xq(0x2c1)](),
            rq[xq(0xa10)]();
        }
        [uf(0x5ea)](rq) {
          const xr = uf;
          rq[xr(0x264)](this[xr(0xc39)] / 0x3c),
            rq[xr(0xa38)](-Math["PI"] / 0x2),
            rq[xr(0xc3a)](),
            rq[xr(0xd7c)](0x32, 0x50),
            rq[xr(0xbb6)](0x1e, 0x1e, 0x32, -0x14),
            rq[xr(0xbb6)](0x5a, -0x64, 0x0, -0x64),
            rq[xr(0xbb6)](-0x5a, -0x64, -0x32, -0x14),
            rq[xr(0xbb6)](-0x1e, 0x1e, -0x32, 0x50),
            (rq[xr(0x2d4)] = this[xr(0x40c)](xr(0x9af))),
            rq[xr(0xec9)](),
            (rq[xr(0x92c)] = rq[xr(0xe5e)] = xr(0x2d8)),
            (rq[xr(0x38e)] = 0x14),
            rq[xr(0x94c)](),
            (rq[xr(0x9a7)] = xr(0x92d)),
            rq[xr(0x2c1)](),
            (rq[xr(0x2d4)] = this[xr(0x40c)](xr(0x4ea)));
          const rr = 0x6;
          rq[xr(0xc3a)](), rq[xr(0xd7c)](-0x32, 0x50);
          for (let rs = 0x0; rs < rr; rs++) {
            const rt = (((rs + 0.5) / rr) * 0x2 - 0x1) * 0x32,
              ru = (((rs + 0x1) / rr) * 0x2 - 0x1) * 0x32;
            rq[xr(0xbb6)](rt, 0x1e, ru, 0x50);
          }
          (rq[xr(0x38e)] = 0x8),
            rq[xr(0xec9)](),
            rq[xr(0x2c1)](),
            (rq[xr(0x9a7)] = rq[xr(0x2d4)] = xr(0x92d)),
            rq[xr(0xc61)](),
            rq[xr(0xd15)](0x0, -0x5),
            rq[xr(0xc3a)](),
            rq[xr(0xd7c)](0x0, 0x0),
            rq[xr(0xc43)](-0xa, 0x19, 0xa, 0x19, 0x0, 0x0),
            rq[xr(0x2c1)](),
            rq[xr(0xa10)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            rq[xr(0xc61)](),
              rq[xr(0xd07)](rv * 0x2 - 0x1, 0x1),
              rq[xr(0xd15)](0x19, -0x38),
              rq[xr(0xc3a)](),
              rq[xr(0x54b)](0x0, 0x0, 0x12, 0x0, Math["PI"] * 0x2),
              rq[xr(0x94c)](),
              (rq[xr(0x38e)] = 0xf),
              rq[xr(0x2c1)](),
              rq[xr(0xec9)](),
              rq[xr(0xa10)]();
          }
        }
        [uf(0xc24)](rq) {
          const xs = uf;
          rq[xs(0x264)](this[xs(0xc39)] / 0x32),
            (rq[xs(0x9a7)] = xs(0x92d)),
            (rq[xs(0x38e)] = 0x10);
          const rr = 0x7;
          rq[xs(0xc3a)]();
          const rs = 0x12;
          rq[xs(0x2d4)] = this[xs(0x40c)](xs(0xc21));
          const rt = Math[xs(0x46b)](pz / 0x258);
          for (let ru = 0x0; ru < 0x2; ru++) {
            const rv = 1.2 - ru * 0.2;
            for (let rw = 0x0; rw < rr; rw++) {
              rq[xs(0xc61)](),
                rq[xs(0xa38)](
                  (rw / rr) * Math["PI"] * 0x2 + (ru / rr) * Math["PI"]
                ),
                rq[xs(0xd15)](0x2e, 0x0),
                rq[xs(0xd07)](rv, rv);
              const rx = Math[xs(0x46b)](rt + rw * 0.05 * (0x1 - ru * 0.5));
              rq[xs(0xc3a)](),
                rq[xs(0xd7c)](0x0, rs),
                rq[xs(0xbb6)](0x14, rs, 0x28 + rx, 0x0 + rx * 0x5),
                rq[xs(0xbb6)](0x14, -rs, 0x0, -rs),
                rq[xs(0xec9)](),
                rq[xs(0x94c)](),
                rq[xs(0x2c1)](),
                rq[xs(0xa10)]();
            }
          }
          rq[xs(0xc3a)](),
            rq[xs(0x54b)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
            (rq[xs(0x2d4)] = this[xs(0x40c)](xs(0x976))),
            rq[xs(0xec9)](),
            rq[xs(0x94c)](),
            (rq[xs(0x38e)] = 0x19),
            rq[xs(0x2c1)]();
        }
        [uf(0xaed)](rq) {
          const xt = uf;
          rq[xt(0x264)](this[xt(0xc39)] / 0x28);
          let rr = this[xt(0x2c0)];
          const rs = this[xt(0x919)] ? 0x0 : Math[xt(0x46b)](pz / 0x64) * 0xf;
          (rq[xt(0xe5e)] = rq[xt(0x92c)] = xt(0x2d8)),
            rq[xt(0xc3a)](),
            rq[xt(0xc61)]();
          const rt = 0x3;
          for (let ru = 0x0; ru < 0x2; ru++) {
            const rv = ru === 0x0 ? 0x1 : -0x1;
            for (let rw = 0x0; rw <= rt; rw++) {
              rq[xt(0xc61)](), rq[xt(0xd7c)](0x0, 0x0);
              const rx = Math[xt(0x46b)](rr + rw + ru);
              rq[xt(0xa38)](((rw / rt) * 0x2 - 0x1) * 0.6 + 1.4 + rx * 0.15),
                rq[xt(0xbc9)](0x2d + rv * rs, 0x0),
                rq[xt(0xa38)](0.2 + (rx * 0.5 + 0.5) * 0.1),
                rq[xt(0xbc9)](0x4b, 0x0),
                rq[xt(0xa10)]();
            }
            rq[xt(0xd07)](0x1, -0x1);
          }
          rq[xt(0xa10)](),
            (rq[xt(0x38e)] = 0x8),
            (rq[xt(0x9a7)] = this[xt(0x40c)](xt(0xb50))),
            rq[xt(0x2c1)](),
            rq[xt(0xc61)](),
            rq[xt(0xd15)](0x0, rs),
            this[xt(0x56e)](rq),
            rq[xt(0xa10)]();
        }
        [uf(0x56e)](rq, rr = ![]) {
          const xu = uf;
          (rq[xu(0xe5e)] = rq[xu(0x92c)] = xu(0x2d8)),
            rq[xu(0xa38)](-0.15),
            rq[xu(0xc3a)](),
            rq[xu(0xd7c)](-0x32, 0x0),
            rq[xu(0xbc9)](0x28, 0x0),
            rq[xu(0xd7c)](0xf, 0x0),
            rq[xu(0xbc9)](-0x5, 0x19),
            rq[xu(0xd7c)](-0x3, 0x0),
            rq[xu(0xbc9)](0xc, -0x14),
            rq[xu(0xd7c)](-0xe, -0x5),
            rq[xu(0xbc9)](-0x2e, -0x17),
            (rq[xu(0x38e)] = 0x1c),
            (rq[xu(0x9a7)] = this[xu(0x40c)](xu(0x24e))),
            rq[xu(0x2c1)](),
            (rq[xu(0x9a7)] = this[xu(0x40c)](xu(0x689))),
            (rq[xu(0x38e)] -= rr ? 0xf : 0xa),
            rq[xu(0x2c1)]();
        }
        [uf(0x485)](rq) {
          const xv = uf;
          rq[xv(0x264)](this[xv(0xc39)] / 0x64),
            rq[xv(0xc3a)](),
            rq[xv(0x54b)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xv(0x2d4)] = this[xv(0x40c)](xv(0x956))),
            rq[xv(0xec9)](),
            rq[xv(0x94c)](),
            (rq[xv(0x38e)] = this[xv(0xb21)] ? 0x32 : 0x1e),
            (rq[xv(0x9a7)] = xv(0x92d)),
            rq[xv(0x2c1)]();
          if (!this[xv(0xde4)]) {
            const rr = new Path2D(),
              rs = this[xv(0xb21)] ? 0x2 : 0x3;
            for (let rt = 0x0; rt <= rs; rt++) {
              for (let ru = 0x0; ru <= rs; ru++) {
                const rv =
                    ((ru / rs + Math[xv(0xa69)]() * 0.1) * 0x2 - 0x1) * 0x46 +
                    (rt % 0x2 === 0x0 ? -0x14 : 0x0),
                  rw = ((rt / rs + Math[xv(0xa69)]() * 0.1) * 0x2 - 0x1) * 0x46,
                  rx = Math[xv(0xa69)]() * 0xd + (this[xv(0xb21)] ? 0xe : 0x7);
                rr[xv(0xd7c)](rv, rw),
                  rr[xv(0x54b)](rv, rw, rx, 0x0, Math["PI"] * 0x2);
              }
            }
            this[xv(0xde4)] = rr;
          }
          rq[xv(0xc3a)](),
            rq[xv(0x54b)](
              0x0,
              0x0,
              0x64 - rq[xv(0x38e)] / 0x2,
              0x0,
              Math["PI"] * 0x2
            ),
            rq[xv(0x94c)](),
            (rq[xv(0x2d4)] = xv(0x291)),
            rq[xv(0xec9)](this[xv(0xde4)]);
        }
        [uf(0xbfa)](rq) {
          const xw = uf;
          rq[xw(0x264)](this[xw(0xc39)] / 0x64),
            rq[xw(0xc61)](),
            rq[xw(0xd15)](-0xf5, -0xdc),
            (rq[xw(0x9a7)] = this[xw(0x40c)](xw(0xca8))),
            (rq[xw(0x2d4)] = this[xw(0x40c)](xw(0x915))),
            (rq[xw(0x38e)] = 0xf),
            (rq[xw(0x92c)] = rq[xw(0xe5e)] = xw(0x2d8));
          const rr = !this[xw(0xb21)];
          if (rr) {
            rq[xw(0xc61)](),
              rq[xw(0xd15)](0x10e, 0xde),
              rq[xw(0xc61)](),
              rq[xw(0xa38)](-0.1);
            for (let rs = 0x0; rs < 0x3; rs++) {
              rq[xw(0xc3a)](),
                rq[xw(0xd7c)](-0x5, 0x0),
                rq[xw(0xbb6)](0x0, 0x28, 0x5, 0x0),
                rq[xw(0x2c1)](),
                rq[xw(0xec9)](),
                rq[xw(0xd15)](0x28, 0x0);
            }
            rq[xw(0xa10)](), rq[xw(0xd15)](0x17, 0x32), rq[xw(0xa38)](0.05);
            for (let rt = 0x0; rt < 0x2; rt++) {
              rq[xw(0xc3a)](),
                rq[xw(0xd7c)](-0x5, 0x0),
                rq[xw(0xbb6)](0x0, -0x28, 0x5, 0x0),
                rq[xw(0x2c1)](),
                rq[xw(0xec9)](),
                rq[xw(0xd15)](0x28, 0x0);
            }
            rq[xw(0xa10)]();
          }
          rq[xw(0xec9)](lm),
            rq[xw(0x2c1)](lm),
            rq[xw(0xec9)](ln),
            rq[xw(0x2c1)](ln),
            rq[xw(0xa10)](),
            rr &&
              (rq[xw(0xc3a)](),
              rq[xw(0x54b)](-0x32, -0x2c, 0x1e, 0x0, Math["PI"] * 0x2),
              rq[xw(0x54b)](0x46, -0x1c, 0xe, 0x0, Math["PI"] * 0x2),
              (rq[xw(0x2d4)] = xw(0x92d)),
              rq[xw(0xec9)]());
        }
        [uf(0xea0)](rq) {
          const xx = uf;
          rq[xx(0x264)](this[xx(0xc39)] / 0x46), rq[xx(0xc61)]();
          !this[xx(0xb21)] && rq[xx(0xa38)](Math["PI"] / 0x2);
          rq[xx(0xd15)](0x0, 0x2d),
            rq[xx(0xc3a)](),
            rq[xx(0xd7c)](0x0, -0x64),
            rq[xx(0xc43)](0x1e, -0x64, 0x3c, 0x0, 0x0, 0x0),
            rq[xx(0xc43)](-0x3c, 0x0, -0x1e, -0x64, 0x0, -0x64),
            (rq[xx(0xe5e)] = rq[xx(0x92c)] = xx(0x2d8)),
            (rq[xx(0x38e)] = 0x3c),
            (rq[xx(0x9a7)] = this[xx(0x40c)](xx(0xd6d))),
            rq[xx(0x2c1)](),
            (rq[xx(0x38e)] -= this[xx(0xb21)] ? 0x23 : 0x14),
            (rq[xx(0x2d4)] = rq[xx(0x9a7)] = this[xx(0x40c)](xx(0x74c))),
            rq[xx(0x2c1)](),
            (rq[xx(0x38e)] -= this[xx(0xb21)] ? 0x16 : 0xf),
            (rq[xx(0x2d4)] = rq[xx(0x9a7)] = this[xx(0x40c)](xx(0xdee))),
            rq[xx(0x2c1)](),
            rq[xx(0xec9)](),
            rq[xx(0xd15)](0x0, -0x24);
          if (this[xx(0xb21)]) rq[xx(0x264)](0.9);
          rq[xx(0xc3a)](),
            rq[xx(0x3e8)](0x0, 0x0, 0x1d, 0x20, 0x0, 0x0, Math["PI"] * 0x2),
            (rq[xx(0x2d4)] = this[xx(0x40c)](xx(0x456))),
            rq[xx(0xec9)](),
            rq[xx(0x94c)](),
            (rq[xx(0x38e)] = 0xd),
            (rq[xx(0x9a7)] = xx(0x92d)),
            rq[xx(0x2c1)](),
            rq[xx(0xc3a)](),
            rq[xx(0x3e8)](0xb, -0x6, 0x6, 0xa, -0.3, 0x0, Math["PI"] * 0x2),
            (rq[xx(0x2d4)] = xx(0x9db)),
            rq[xx(0xec9)](),
            rq[xx(0xa10)]();
        }
        [uf(0x406)](rq) {
          const xy = uf;
          rq[xy(0x264)](this[xy(0xc39)] / 0x19);
          !this[xy(0x919)] &&
            this[xy(0xb21)] &&
            rq[xy(0xa38)](Math[xy(0x46b)](pz / 0x64 + this["id"]) * 0.15);
          rq[xy(0xc3a)](),
            rq[xy(0x942)](-0x16, -0x16, 0x2c, 0x2c),
            (rq[xy(0x2d4)] = this[xy(0x40c)](xy(0x81f))),
            rq[xy(0xec9)](),
            (rq[xy(0x38e)] = 0x6),
            (rq[xy(0x92c)] = xy(0x2d8)),
            (rq[xy(0x9a7)] = this[xy(0x40c)](xy(0x915))),
            rq[xy(0x2c1)](),
            rq[xy(0xc3a)]();
          const rr = this[xy(0x919)] ? 0x1 : 0x1 - Math[xy(0x46b)](pz / 0x1f4),
            rs = rw(0x0, 0.25),
            rt = 0x1 - rw(0.25, 0.25),
            ru = rw(0.5, 0.25),
            rv = rw(0.75, 0.25);
          function rw(rx, ry) {
            const xz = xy;
            return Math[xz(0x36c)](0x1, Math[xz(0x525)](0x0, (rr - rx) / ry));
          }
          rq[xy(0xa38)]((rt * Math["PI"]) / 0x4);
          for (let rx = 0x0; rx < 0x2; rx++) {
            const ry = (rx * 0x2 - 0x1) * 0x7 * rv;
            for (let rz = 0x0; rz < 0x3; rz++) {
              let rA = rs * (-0xb + rz * 0xb);
              rq[xy(0xd7c)](rA, ry),
                rq[xy(0x54b)](rA, ry, 4.7, 0x0, Math["PI"] * 0x2);
            }
          }
          (rq[xy(0x2d4)] = this[xy(0x40c)](xy(0x898))), rq[xy(0xec9)]();
        }
        [uf(0xc34)](rq) {
          const xA = uf;
          rq[xA(0xc61)](),
            rq[xA(0xd15)](this["x"], this["y"]),
            this[xA(0x8ac)](rq),
            rq[xA(0xa38)](this[xA(0x297)]),
            (rq[xA(0x38e)] = 0x8);
          const rr = (rw, rx) => {
              const xB = xA;
              (rt = this[xB(0xc39)] / 0x14),
                rq[xB(0xd07)](rt, rt),
                rq[xB(0xc3a)](),
                rq[xB(0x54b)](0x0, 0x0, 0x14, 0x0, l0),
                (rq[xB(0x2d4)] = this[xB(0x40c)](rw)),
                rq[xB(0xec9)](),
                (rq[xB(0x9a7)] = this[xB(0x40c)](rx)),
                rq[xB(0x2c1)]();
            },
            rs = (rw, rx, ry) => {
              const xC = xA;
              (rw = l8[rw]),
                rq[xC(0xd07)](this[xC(0xc39)], this[xC(0xc39)]),
                (rq[xC(0x38e)] /= this[xC(0xc39)]),
                (rq[xC(0x9a7)] = this[xC(0x40c)](ry)),
                rq[xC(0x2c1)](rw),
                (rq[xC(0x2d4)] = this[xC(0x40c)](rx)),
                rq[xC(0xec9)](rw);
            };
          let rt, ru, rv;
          switch (this[xA(0x2dc)]) {
            case cS[xA(0x406)]:
            case cS[xA(0x811)]:
              this[xA(0x406)](rq);
              break;
            case cS[xA(0xea0)]:
            case cS[xA(0x4f5)]:
              this[xA(0xea0)](rq);
              break;
            case cS[xA(0x3a0)]:
              (rq[xA(0x9a7)] = xA(0x92d)),
                (rq[xA(0x38e)] = 0x14),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x568))),
                rq[xA(0xd15)](-this[xA(0xc39)], 0x0),
                rq[xA(0xa38)](-Math["PI"] / 0x2),
                rq[xA(0x264)](0.5),
                rq[xA(0xd15)](0x0, 0x46),
                this[xA(0xc74)](rq, this[xA(0xc39)] * 0x4);
              break;
            case cS[xA(0x2f9)]:
              this[xA(0x2f9)](rq);
              break;
            case cS[xA(0x2ac)]:
              this[xA(0xbfa)](rq);
              break;
            case cS[xA(0xbfa)]:
              this[xA(0xbfa)](rq);
              break;
            case cS[xA(0x485)]:
            case cS[xA(0x468)]:
              this[xA(0x485)](rq);
              break;
            case cS[xA(0xce0)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x1e), this[xA(0x56e)](rq, !![]);
              break;
            case cS[xA(0xaed)]:
              this[xA(0xaed)](rq);
              break;
            case cS[xA(0x751)]:
              (rq[xA(0x38e)] *= 0.7),
                rs(xA(0x93b), xA(0xc21), xA(0x59c)),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0.6, 0x0, l0),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x976))),
                rq[xA(0xec9)](),
                rq[xA(0x94c)](),
                (rq[xA(0x9a7)] = xA(0x5dc)),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0xc24)]:
              this[xA(0xc24)](rq);
              break;
            case cS[xA(0x41b)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x16),
                rq[xA(0xa38)](Math["PI"] / 0x2),
                rq[xA(0xc3a)]();
              for (let si = 0x0; si < 0x2; si++) {
                rq[xA(0xd7c)](-0xa, -0x1e),
                  rq[xA(0xc43)](-0xa, 0x6, 0xa, 0x6, 0xa, -0x1e),
                  rq[xA(0xd07)](0x1, -0x1);
              }
              (rq[xA(0x38e)] = 0x10),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x5f0))),
                rq[xA(0x2c1)](),
                (rq[xA(0x38e)] -= 0x7),
                (rq[xA(0x9a7)] = xA(0x650)),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x59f)]:
              this[xA(0x5ea)](rq);
              break;
            case cS[xA(0x7ee)]:
              this[xA(0xae0)](rq);
              break;
            case cS[xA(0xb7c)]:
              this[xA(0xb7c)](rq);
              break;
            case cS[xA(0x372)]:
              this[xA(0x372)](rq);
              break;
            case cS[xA(0x804)]:
              !this[xA(0x841)] &&
                ((this[xA(0x841)] = new lT(
                  -0x1,
                  0x0,
                  0x0,
                  0x0,
                  0x1,
                  cY[xA(0xcdb)],
                  0x19
                )),
                (this[xA(0x841)][xA(0x613)] = !![]),
                (this[xA(0x841)][xA(0xadd)] = !![]),
                (this[xA(0x841)][xA(0x4f3)] = 0x1),
                (this[xA(0x841)][xA(0x5ae)] = !![]),
                (this[xA(0x841)][xA(0xb82)] = xA(0x3c8)),
                (this[xA(0x841)][xA(0x9bc)] = this[xA(0x9bc)]));
              rq[xA(0xa38)](Math["PI"] / 0x2),
                (this[xA(0x841)][xA(0x72e)] = this[xA(0x72e)]),
                (this[xA(0x841)][xA(0xc39)] = this[xA(0xc39)]),
                this[xA(0x841)][xA(0xc34)](rq);
              break;
            case cS[xA(0x8c4)]:
              this[xA(0x8c4)](rq);
              break;
            case cS[xA(0x923)]:
              rq[xA(0xc61)](),
                rq[xA(0x264)](this[xA(0xc39)] / 0x64),
                rq[xA(0xa38)]((Date[xA(0x796)]() / 0x190) % 6.28),
                this[xA(0x3ab)](rq, 1.5),
                rq[xA(0xa10)]();
              break;
            case cS[xA(0x4c9)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x14),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x0, -0x5),
                rq[xA(0xbc9)](-0x8, 0x0),
                rq[xA(0xbc9)](0x0, 0x5),
                rq[xA(0xbc9)](0x8, 0x0),
                rq[xA(0x5fb)](),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x20),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x347))),
                rq[xA(0x2c1)](),
                (rq[xA(0x38e)] = 0x14),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x7c8))),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x57b)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x14),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x5, -0x5),
                rq[xA(0xbc9)](-0x5, 0x5),
                rq[xA(0xbc9)](0x5, 0x0),
                rq[xA(0x5fb)](),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x20),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x64d))),
                rq[xA(0x2c1)](),
                (rq[xA(0x38e)] = 0x14),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x7b8))),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x1f5)]:
              this[xA(0x4ec)](rq, xA(0xc78));
              break;
            case cS[xA(0x580)]:
              this[xA(0x4ec)](rq, xA(0x90b));
              break;
            case cS[xA(0x5a7)]:
              this[xA(0x4ec)](rq, xA(0xe41));
              break;
            case cS[xA(0x67e)]:
              this[xA(0x67e)](rq);
              break;
            case cS[xA(0xc50)]:
              this[xA(0xc50)](rq);
              break;
            case cS[xA(0x8d4)]:
              this[xA(0x8d4)](rq);
              break;
            case cS[xA(0x228)]:
              this[xA(0x8d4)](rq, !![]);
              break;
            case cS[xA(0x294)]:
              this[xA(0x294)](rq);
              break;
            case cS[xA(0x6b3)]:
              this[xA(0x6b3)](rq);
              break;
            case cS[xA(0x317)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x19),
                lE(rq, 0x19),
                (rq[xA(0x92c)] = xA(0x2d8)),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x61d))),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x9be))),
                rq[xA(0xec9)](),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x39e)]:
              rq[xA(0xd15)](-this[xA(0xc39)], 0x0);
              const rw = Date[xA(0x796)]() / 0x32,
                rx = this[xA(0xc39)] * 0x2;
              rq[xA(0xc3a)]();
              const ry = 0x32;
              for (let sj = 0x0; sj < ry; sj++) {
                const sk = sj / ry,
                  sl = sk * Math["PI"] * (this[xA(0x919)] ? 7.75 : 0xa) - rw,
                  sm = sk * rx,
                  sn = sm * this[xA(0x775)];
                rq[xA(0xbc9)](sm, Math[xA(0x46b)](sl) * sn);
              }
              (rq[xA(0x9a7)] = xA(0x7da)),
                (rq[xA(0x92c)] = rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x4),
                (rq[xA(0xcb6)] = xA(0xb8d)),
                (rq[xA(0x57d)] = this[xA(0x919)] ? 0xa : 0x14),
                rq[xA(0x2c1)](),
                rq[xA(0x2c1)](),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x7ad)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x37), this[xA(0xa62)](rq);
              break;
            case cS[xA(0x2b1)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x14), rq[xA(0xc3a)]();
              for (let so = 0x0; so < 0x2; so++) {
                rq[xA(0xd7c)](-0x17, -0x5),
                  rq[xA(0xbb6)](0x0, 5.5, 0x17, -0x5),
                  rq[xA(0xd07)](0x1, -0x1);
              }
              (rq[xA(0x38e)] = 0xf),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x915))),
                rq[xA(0x2c1)](),
                (rq[xA(0x38e)] -= 0x6),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x81f))),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0xe8c)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x23),
                rq[xA(0xc3a)](),
                rq[xA(0x3e8)](0x0, 0x0, 0x28, 0x1d, 0x0, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0xad7))),
                rq[xA(0xec9)](),
                rq[xA(0x94c)](),
                (rq[xA(0x9a7)] = xA(0x762)),
                (rq[xA(0x38e)] = 0x12),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x1e, 0x0),
                rq[xA(0xc43)](-0xf, -0x14, 0xf, 0xa, 0x1e, 0x0),
                rq[xA(0xc43)](0xf, 0x14, -0xf, -0xa, -0x1e, 0x0),
                (rq[xA(0x38e)] = 0x3),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                (rq[xA(0x9a7)] = rq[xA(0x2d4)] = xA(0x66a)),
                rq[xA(0xec9)](),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x3b7)]:
              if (this[xA(0xed1)] !== this[xA(0xc60)]) {
                this[xA(0xed1)] = this[xA(0xc60)];
                const sp = new Path2D(),
                  sq = Math[xA(0x2d8)](
                    this[xA(0xc60)] * (this[xA(0xc60)] < 0xc8 ? 0.2 : 0.15)
                  ),
                  sr = (Math["PI"] * 0x2) / sq,
                  ss = this[xA(0xc60)] < 0x64 ? 0.3 : 0.1;
                for (let st = 0x0; st < sq; st++) {
                  const su = st * sr,
                    sv = su + Math[xA(0xa69)]() * sr,
                    sw = 0x1 - Math[xA(0xa69)]() * ss;
                  sp[xA(0xbc9)](
                    Math[xA(0xd3d)](sv) * this[xA(0xc60)] * sw,
                    Math[xA(0x46b)](sv) * this[xA(0xc60)] * sw
                  );
                }
                sp[xA(0x5fb)](), (this[xA(0x601)] = sp);
              }
              (rt = this[xA(0xc39)] / this[xA(0xc60)]), rq[xA(0xd07)](rt, rt);
              const rz = this[xA(0xb46)] ? lh : [xA(0xa50), xA(0x983)];
              (rq[xA(0x9a7)] = this[xA(0x40c)](rz[0x1])),
                rq[xA(0x2c1)](this[xA(0x601)]),
                (rq[xA(0x2d4)] = this[xA(0x40c)](rz[0x0])),
                rq[xA(0xec9)](this[xA(0x601)]);
              break;
            case cS[xA(0x9f3)]:
              if (this[xA(0xed1)] !== this[xA(0xc60)]) {
                this[xA(0xed1)] = this[xA(0xc60)];
                const sx = Math[xA(0x2d8)](
                    this[xA(0xc60)] > 0xc8
                      ? this[xA(0xc60)] * 0.18
                      : this[xA(0xc60)] * 0.25
                  ),
                  sy = 0.5,
                  sz = 0.85;
                this[xA(0x601)] = la(sx, this[xA(0xc60)], sy, sz);
                if (this[xA(0xc60)] < 0x12c) {
                  const sA = new Path2D(),
                    sB = sx * 0x2;
                  for (let sC = 0x0; sC < sB; sC++) {
                    const sD = ((sC + 0x1) / sB) * Math["PI"] * 0x2;
                    let sE = (sC % 0x2 === 0x0 ? 0.7 : 1.2) * this[xA(0xc60)];
                    sA[xA(0xbc9)](
                      Math[xA(0xd3d)](sD) * sE,
                      Math[xA(0x46b)](sD) * sE
                    );
                  }
                  sA[xA(0x5fb)](), (this[xA(0x687)] = sA);
                } else this[xA(0x687)] = null;
              }
              (rt = this[xA(0xc39)] / this[xA(0xc60)]), rq[xA(0xd07)](rt, rt);
              this[xA(0x687)] &&
                ((rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x6bd))),
                rq[xA(0xec9)](this[xA(0x687)]));
              (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x73c))),
                rq[xA(0x2c1)](this[xA(0x601)]),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x311))),
                rq[xA(0xec9)](this[xA(0x601)]);
              break;
            case cS[xA(0xdfe)]:
              rq[xA(0xc61)](),
                (rt = this[xA(0xc39)] / 0x28),
                rq[xA(0xd07)](rt, rt),
                (rq[xA(0x2d4)] = rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8));
              for (let sF = 0x0; sF < 0x2; sF++) {
                const sG = sF === 0x0 ? 0x1 : -0x1;
                rq[xA(0xc61)](),
                  rq[xA(0xd15)](0x1c, sG * 0xd),
                  rq[xA(0xa38)](
                    Math[xA(0x46b)](this[xA(0x2c0)] * 1.24) * 0.1 * sG
                  ),
                  rq[xA(0xc3a)](),
                  rq[xA(0xd7c)](0x0, sG * 0x6),
                  rq[xA(0xbc9)](0x14, sG * 0xb),
                  rq[xA(0xbc9)](0x28, 0x0),
                  rq[xA(0xbb6)](0x14, sG * 0x5, 0x0, 0x0),
                  rq[xA(0x5fb)](),
                  rq[xA(0xec9)](),
                  rq[xA(0x2c1)](),
                  rq[xA(0xa10)]();
              }
              (ru = this[xA(0xb46)] ? lh : [xA(0xcdd), xA(0xebb)]),
                (rq[xA(0x2d4)] = this[xA(0x40c)](ru[0x0])),
                rq[xA(0xec9)](l5),
                (rq[xA(0x38e)] = 0x6),
                (rq[xA(0x2d4)] = rq[xA(0x9a7)] = this[xA(0x40c)](ru[0x1])),
                rq[xA(0x2c1)](l5),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x15, 0x0),
                rq[xA(0xbb6)](0x0, -0x3, 0x15, 0x0),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x7),
                rq[xA(0x2c1)]();
              const rA = [
                [-0x11, -0xd],
                [0x11, -0xd],
                [0x0, -0x11],
              ];
              rq[xA(0xc3a)]();
              for (let sH = 0x0; sH < 0x2; sH++) {
                const sI = sH === 0x1 ? 0x1 : -0x1;
                for (let sJ = 0x0; sJ < rA[xA(0x4cf)]; sJ++) {
                  let [sK, sL] = rA[sJ];
                  (sL *= sI),
                    rq[xA(0xd7c)](sK, sL),
                    rq[xA(0x54b)](sK, sL, 0x5, 0x0, l0);
                }
              }
              rq[xA(0xec9)](), rq[xA(0xec9)](), rq[xA(0xa10)]();
              break;
            case cS[xA(0x694)]:
            case cS[xA(0xeb0)]:
              rq[xA(0xc61)](),
                (rt = this[xA(0xc39)] / 0x28),
                rq[xA(0xd07)](rt, rt);
              const rB = this[xA(0x2dc)] === cS[xA(0x694)];
              rB &&
                (rq[xA(0xc61)](),
                rq[xA(0xd15)](-0x2d, 0x0),
                rq[xA(0xa38)](Math["PI"]),
                this[xA(0xebf)](rq, 0xf / 1.1),
                rq[xA(0xa10)]());
              (ru = this[xA(0xb46)]
                ? lh
                : rB
                ? [xA(0x63a), xA(0xd48)]
                : [xA(0x52b), xA(0xc9b)]),
                rq[xA(0xc3a)](),
                rq[xA(0x3e8)](0x0, 0x0, 0x28, 0x19, 0x0, 0x0, l0),
                (rq[xA(0x38e)] = 0xa),
                (rq[xA(0x9a7)] = this[xA(0x40c)](ru[0x1])),
                rq[xA(0x2c1)](),
                (rq[xA(0x2d4)] = this[xA(0x40c)](ru[0x0])),
                rq[xA(0xec9)](),
                rq[xA(0xc61)](),
                rq[xA(0x94c)](),
                rq[xA(0xc3a)]();
              const rC = [-0x1e, -0x5, 0x16];
              for (let sM = 0x0; sM < rC[xA(0x4cf)]; sM++) {
                const sN = rC[sM];
                rq[xA(0xd7c)](sN, -0x32),
                  rq[xA(0xbb6)](sN - 0x14, 0x0, sN, 0x32);
              }
              (rq[xA(0x38e)] = 0xe),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                rq[xA(0x2c1)](),
                rq[xA(0xa10)]();
              rB ? this[xA(0xde1)](rq) : this[xA(0x522)](rq);
              rq[xA(0xa10)]();
              break;
            case cS[xA(0x741)]:
              (rt = this[xA(0xc39)] / 0x32), rq[xA(0xd07)](rt, rt);
              const rD = 0x2f;
              rq[xA(0xc3a)]();
              for (let sO = 0x0; sO < 0x8; sO++) {
                let sP =
                  (0.25 + ((sO % 0x4) / 0x3) * 0.4) * Math["PI"] +
                  Math[xA(0x46b)](sO + this[xA(0x2c0)] * 1.3) * 0.2;
                sO >= 0x4 && (sP *= -0x1),
                  rq[xA(0xd7c)](0x0, 0x0),
                  rq[xA(0xbc9)](
                    Math[xA(0xd3d)](sP) * rD,
                    Math[xA(0x46b)](sP) * rD
                  );
              }
              (rq[xA(0x38e)] = 0x7),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                rq[xA(0x2c1)](),
                (rq[xA(0x2d4)] = rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x6);
              for (let sQ = 0x0; sQ < 0x2; sQ++) {
                const sR = sQ === 0x0 ? 0x1 : -0x1;
                rq[xA(0xc61)](),
                  rq[xA(0xd15)](0x16, sR * 0xa),
                  rq[xA(0xa38)](
                    -(Math[xA(0x46b)](this[xA(0x2c0)] * 1.6) * 0.5 + 0.5) *
                      0.07 *
                      sR
                  ),
                  rq[xA(0xc3a)](),
                  rq[xA(0xd7c)](0x0, sR * 0x6),
                  rq[xA(0xbb6)](0x14, sR * 0xf, 0x28, 0x0),
                  rq[xA(0xbb6)](0x14, sR * 0x5, 0x0, 0x0),
                  rq[xA(0x5fb)](),
                  rq[xA(0xec9)](),
                  rq[xA(0x2c1)](),
                  rq[xA(0xa10)]();
              }
              (rq[xA(0x38e)] = 0x8),
                l9(
                  rq,
                  0x1,
                  0x8,
                  this[xA(0x40c)](xA(0xa31)),
                  this[xA(0x40c)](xA(0x387))
                );
              let rE;
              (rE = [
                [0xb, 0x14],
                [-0x5, 0x15],
                [-0x17, 0x13],
                [0x1c, 0xb],
              ]),
                rq[xA(0xc3a)]();
              for (let sS = 0x0; sS < rE[xA(0x4cf)]; sS++) {
                const [sT, sU] = rE[sS];
                rq[xA(0xd7c)](sT, -sU),
                  rq[xA(0xbb6)](sT + Math[xA(0xa6c)](sT) * 4.2, 0x0, sT, sU);
              }
              (rq[xA(0xe5e)] = xA(0x2d8)),
                rq[xA(0x2c1)](),
                rq[xA(0xd15)](-0x21, 0x0),
                l9(
                  rq,
                  0.45,
                  0x8,
                  this[xA(0x40c)](xA(0x5a1)),
                  this[xA(0x40c)](xA(0x5f6))
                ),
                rq[xA(0xc3a)](),
                (rE = [
                  [-0x5, 0x5],
                  [0x6, 0x4],
                ]);
              for (let sV = 0x0; sV < rE[xA(0x4cf)]; sV++) {
                const [sW, sX] = rE[sV];
                rq[xA(0xd7c)](sW, -sX), rq[xA(0xbb6)](sW - 0x3, 0x0, sW, sX);
              }
              (rq[xA(0x38e)] = 0x5),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                rq[xA(0x2c1)](),
                rq[xA(0xd15)](0x11, 0x0),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x0, -0x9),
                rq[xA(0xbc9)](0x0, 0x9),
                rq[xA(0xbc9)](0xb, 0x0),
                rq[xA(0x5fb)](),
                (rq[xA(0x92c)] = rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x6),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x66d))),
                rq[xA(0xec9)](),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x344)]:
              this[xA(0x2d1)](rq, xA(0x476), xA(0x711), xA(0x774));
              break;
            case cS[xA(0xc2c)]:
              this[xA(0x2d1)](rq, xA(0x8f1), xA(0xa56), xA(0x2f0));
              break;
            case cS[xA(0xc9a)]:
              this[xA(0x2d1)](rq, xA(0x98a), xA(0x480), xA(0x774));
              break;
            case cS[xA(0x8fb)]:
              (rt = this[xA(0xc39)] / 0x46),
                rq[xA(0x264)](rt),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0xafe))),
                rq[xA(0xec9)](lc),
                rq[xA(0x94c)](lc),
                (rq[xA(0x38e)] = 0xf),
                (rq[xA(0x9a7)] = xA(0x746)),
                rq[xA(0x2c1)](lc),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x7),
                (rq[xA(0x9a7)] = xA(0x5c0)),
                rq[xA(0x2c1)](ld);
              break;
            case cS[xA(0x5cf)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x28),
                this[xA(0x9fe)](rq, 0x32, 0x1e, 0x7);
              break;
            case cS[xA(0x410)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x64),
                this[xA(0x9fe)](rq),
                (rq[xA(0x2d4)] = rq[xA(0x9a7)]);
              const rF = 0x6,
                rG = 0x3;
              rq[xA(0xc3a)]();
              for (let sY = 0x0; sY < rF; sY++) {
                const sZ = (sY / rF) * Math["PI"] * 0x2;
                rq[xA(0xc61)](), rq[xA(0xa38)](sZ);
                for (let t0 = 0x0; t0 < rG; t0++) {
                  const t1 = t0 / rG,
                    t2 = 0x12 + t1 * 0x44,
                    t3 = 0x7 + t1 * 0x6;
                  rq[xA(0xd7c)](t2, 0x0),
                    rq[xA(0x54b)](t2, 0x0, t3, 0x0, Math["PI"] * 0x2);
                }
                rq[xA(0xa10)]();
              }
              rq[xA(0xec9)]();
              break;
            case cS[xA(0xa77)]:
              (rt = this[xA(0xc39)] / 0x31),
                rq[xA(0x264)](rt),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                (rv = this[xA(0x2c0)] * 0x15e);
              const rH = (Math[xA(0x46b)](rv * 0.01) * 0.5 + 0.5) * 0.1;
              (rq[xA(0x9a7)] = rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x6bd))),
                (rq[xA(0x38e)] = 0x3);
              for (let t4 = 0x0; t4 < 0x2; t4++) {
                rq[xA(0xc61)]();
                const t5 = t4 * 0x2 - 0x1;
                rq[xA(0xd07)](0x1, t5),
                  rq[xA(0xd15)](0x1c, -0x27),
                  rq[xA(0xd07)](1.5, 1.5),
                  rq[xA(0xa38)](rH),
                  rq[xA(0xc3a)](),
                  rq[xA(0xd7c)](0x0, 0x0),
                  rq[xA(0xbb6)](0xc, -0x8, 0x14, 0x3),
                  rq[xA(0xbc9)](0xb, 0x1),
                  rq[xA(0xbc9)](0x11, 0x9),
                  rq[xA(0xbb6)](0xc, 0x5, 0x0, 0x6),
                  rq[xA(0x5fb)](),
                  rq[xA(0x2c1)](),
                  rq[xA(0xec9)](),
                  rq[xA(0xa10)]();
              }
              rq[xA(0xc3a)]();
              for (let t6 = 0x0; t6 < 0x2; t6++) {
                for (let t7 = 0x0; t7 < 0x4; t7++) {
                  const t8 = t6 * 0x2 - 0x1,
                    t9 =
                      (Math[xA(0x46b)](rv * 0.005 + t6 + t7 * 0x2) * 0.5 +
                        0.5) *
                      0.5;
                  rq[xA(0xc61)](),
                    rq[xA(0xd07)](0x1, t8),
                    rq[xA(0xd15)]((t7 / 0x3) * 0x1e - 0xf, 0x28);
                  const ta = t7 < 0x2 ? 0x1 : -0x1;
                  rq[xA(0xa38)](t9 * ta),
                    rq[xA(0xd7c)](0x0, 0x0),
                    rq[xA(0xd15)](0x0, 0x19),
                    rq[xA(0xbc9)](0x0, 0x0),
                    rq[xA(0xa38)](ta * 0.7 * (t9 + 0.3)),
                    rq[xA(0xbc9)](0x0, 0xa),
                    rq[xA(0xa10)]();
                }
              }
              (rq[xA(0x38e)] = 0xa),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x2, 0x17),
                rq[xA(0xbb6)](0x17, 0x0, 0x2, -0x17),
                rq[xA(0xbc9)](-0xa, -0xf),
                rq[xA(0xbc9)](-0xa, 0xf),
                rq[xA(0x5fb)](),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x653))),
                (rq[xA(0x38e)] = 0x44),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                rq[xA(0x2c1)](),
                (rq[xA(0x38e)] -= 0x12),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0xc63))),
                rq[xA(0x2c1)](),
                (rq[xA(0x9a7)] = xA(0x92d)),
                rq[xA(0xc3a)]();
              const rI = 0x12;
              for (let tb = 0x0; tb < 0x2; tb++) {
                rq[xA(0xd7c)](-0x12, rI),
                  rq[xA(0xbb6)](0x0, -0x7 + rI, 0x12, rI),
                  rq[xA(0xd07)](0x1, -0x1);
              }
              (rq[xA(0x38e)] = 0x9), rq[xA(0x2c1)]();
              break;
            case cS[xA(0x621)]:
              (rt = this[xA(0xc39)] / 0x50),
                rq[xA(0x264)](rt),
                rq[xA(0xa38)](
                  ((Date[xA(0x796)]() / 0x7d0) % l0) + this[xA(0x2c0)] * 0.4
                );
              const rJ = 0x5;
              !this[xA(0x669)] &&
                (this[xA(0x669)] = Array(rJ)[xA(0xec9)](0x64));
              const rK = this[xA(0x669)],
                rL = this[xA(0x613)]
                  ? 0x0
                  : Math[xA(0xb02)](this[xA(0x7f0)] * (rJ - 0x1));
              rq[xA(0xc3a)]();
              for (let tc = 0x0; tc < rJ; tc++) {
                const td = ((tc + 0.5) / rJ) * Math["PI"] * 0x2,
                  te = ((tc + 0x1) / rJ) * Math["PI"] * 0x2;
                rK[tc] += ((tc < rL ? 0x64 : 0x3c) - rK[tc]) * 0.2;
                const tf = rK[tc];
                if (tc === 0x0) rq[xA(0xd7c)](tf, 0x0);
                rq[xA(0xbb6)](
                  Math[xA(0xd3d)](td) * 0x5,
                  Math[xA(0x46b)](td) * 0x5,
                  Math[xA(0xd3d)](te) * tf,
                  Math[xA(0x46b)](te) * tf
                );
              }
              rq[xA(0x5fb)](),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x1c + 0xa),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x277))),
                rq[xA(0x2c1)](),
                (rq[xA(0x38e)] = 0x10 + 0xa),
                (rq[xA(0x9a7)] = rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x7e1))),
                rq[xA(0xec9)](),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)]();
              for (let tg = 0x0; tg < rJ; tg++) {
                const th = (tg / rJ) * Math["PI"] * 0x2;
                rq[xA(0xc61)](), rq[xA(0xa38)](th);
                const ti = rK[tg] / 0x64;
                let tj = 0x1a;
                const tk = 0x4;
                for (let tl = 0x0; tl < tk; tl++) {
                  const tm = (0x1 - (tl / tk) * 0.7) * 0xc * ti;
                  rq[xA(0xd7c)](tj, 0x0),
                    rq[xA(0x54b)](tj, 0x0, tm, 0x0, Math["PI"] * 0x2),
                    (tj += tm * 0x2 + 3.5 * ti);
                }
                rq[xA(0xa10)]();
              }
              (rq[xA(0x2d4)] = xA(0x414)), rq[xA(0xec9)]();
              break;
            case cS[xA(0x26e)]:
              (rt = this[xA(0xc39)] / 0x1e),
                rq[xA(0x264)](rt),
                rq[xA(0xd15)](-0x22, 0x0),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x0, -0x8),
                rq[xA(0xbb6)](0x9b, 0x0, 0x0, 0x8),
                rq[xA(0x5fb)](),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x1a),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x277))),
                rq[xA(0x2c1)](),
                (rq[xA(0x38e)] = 0x10),
                (rq[xA(0x9a7)] = rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x7e1))),
                rq[xA(0xec9)](),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)]();
              let rM = 0xd;
              for (let tn = 0x0; tn < 0x4; tn++) {
                const to = (0x1 - (tn / 0x4) * 0.7) * 0xa;
                rq[xA(0xd7c)](rM, 0x0),
                  rq[xA(0x54b)](rM, 0x0, to, 0x0, Math["PI"] * 0x2),
                  (rM += to * 0x2 + 0x4);
              }
              (rq[xA(0x2d4)] = xA(0x414)), rq[xA(0xec9)]();
              break;
            case cS[xA(0x845)]:
              (rt = this[xA(0xc39)] / 0x64),
                rq[xA(0xd07)](rt, rt),
                (rq[xA(0x92c)] = rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x9a7)] = xA(0x386)),
                (rq[xA(0x38e)] = 0x14);
              const rN = [0x1, 0.63, 0.28],
                rO = this[xA(0xb46)] ? lo : [xA(0x540), xA(0xa5e), xA(0x66f)],
                rP = (pz * 0.005) % l0;
              for (let tp = 0x0; tp < 0x3; tp++) {
                const tq = rN[tp],
                  tr = rO[tp];
                rq[xA(0xc61)](),
                  rq[xA(0xa38)](rP * (tp % 0x2 === 0x0 ? -0x1 : 0x1)),
                  rq[xA(0xc3a)]();
                const ts = 0x7 - tp;
                for (let tu = 0x0; tu < ts; tu++) {
                  const tv = (Math["PI"] * 0x2 * tu) / ts;
                  rq[xA(0xbc9)](
                    Math[xA(0xd3d)](tv) * tq * 0x64,
                    Math[xA(0x46b)](tv) * tq * 0x64
                  );
                }
                rq[xA(0x5fb)](),
                  (rq[xA(0x9a7)] = rq[xA(0x2d4)] = this[xA(0x40c)](tr)),
                  rq[xA(0xec9)](),
                  rq[xA(0x2c1)](),
                  rq[xA(0xa10)]();
              }
              break;
            case cS[xA(0xb2f)]:
              (rt = this[xA(0xc39)] / 0x41),
                rq[xA(0xd07)](rt, rt),
                (rv = this[xA(0x2c0)] * 0x2),
                rq[xA(0xa38)](Math["PI"] / 0x2);
              if (this[xA(0xaa4)]) {
                const tw = 0x3;
                rq[xA(0xc3a)]();
                for (let tA = 0x0; tA < 0x2; tA++) {
                  for (let tB = 0x0; tB <= tw; tB++) {
                    const tC = (tB / tw) * 0x50 - 0x28;
                    rq[xA(0xc61)]();
                    const tD = tA * 0x2 - 0x1;
                    rq[xA(0xd15)](tD * -0x2d, tC);
                    const tE =
                      1.1 + Math[xA(0x46b)]((tB / tw) * Math["PI"]) * 0.5;
                    rq[xA(0xd07)](tE * tD, tE),
                      rq[xA(0xa38)](Math[xA(0x46b)](rv + tB + tD) * 0.3 + 0.3),
                      rq[xA(0xd7c)](0x0, 0x0),
                      rq[xA(0xbb6)](-0xf, -0x5, -0x14, 0xa),
                      rq[xA(0xa10)]();
                  }
                }
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                  (rq[xA(0x38e)] = 0x8),
                  (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                  rq[xA(0x2c1)](),
                  (rq[xA(0x38e)] = 0xc);
                const tx = Date[xA(0x796)]() * 0.01,
                  ty = Math[xA(0x46b)](tx * 0.5) * 0.5 + 0.5,
                  tz = ty * 0.1 + 0x1;
                rq[xA(0xc3a)](),
                  rq[xA(0x54b)](-0xf * tz, 0x2b - ty, 0x10, 0x0, Math["PI"]),
                  rq[xA(0x54b)](0xf * tz, 0x2b - ty, 0x10, 0x0, Math["PI"]),
                  rq[xA(0xd7c)](-0x16, -0x2b),
                  rq[xA(0x54b)](0x0, -0x2b - ty, 0x16, 0x0, Math["PI"], !![]),
                  (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x2b7))),
                  rq[xA(0x2c1)](),
                  (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0xcdd))),
                  rq[xA(0xec9)](),
                  rq[xA(0xc61)](),
                  rq[xA(0xa38)]((Math["PI"] * 0x3) / 0x2),
                  this[xA(0x522)](rq, 0x1a - ty, 0x0),
                  rq[xA(0xa10)]();
              }
              if (!this[xA(0x839)]) {
                const tF = dI[d9[xA(0x201)]],
                  tG = Math[xA(0x525)](this["id"] % tF[xA(0x4cf)], 0x0),
                  tH = new lN(-0x1, 0x0, 0x0, tF[tG]["id"]);
                (tH[xA(0x261)] = 0x1),
                  (tH[xA(0x297)] = 0x0),
                  (this[xA(0x839)] = tH);
              }
              rq[xA(0x264)](1.3), this[xA(0x839)][xA(0xc34)](rq);
              break;
            case cS[xA(0xce6)]:
              (rt = this[xA(0xc39)] / 0x14),
                rq[xA(0xd07)](rt, rt),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x11, 0x0),
                rq[xA(0xbc9)](0x0, 0x0),
                rq[xA(0xbc9)](0x11, 0x6),
                rq[xA(0xd7c)](0x0, 0x0),
                rq[xA(0xbc9)](0xb, -0x7),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0xda6))),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0xc),
                rq[xA(0x2c1)](),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0xad9))),
                (rq[xA(0x38e)] = 0x6),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x7e8)]:
              (rt = this[xA(0xc39)] / 0x80),
                rq[xA(0x264)](rt),
                rq[xA(0xd15)](-0x80, -0x78),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x538))),
                rq[xA(0xec9)](f9[xA(0xaa0)]),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x306))),
                (rq[xA(0x38e)] = 0x14),
                rq[xA(0x2c1)](f9[xA(0xaa0)]);
              break;
            case cS[xA(0x65a)]:
              (rt = this[xA(0xc39)] / 0x19),
                rq[xA(0xd07)](rt, rt),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x19, 0x0),
                rq[xA(0xbc9)](-0x2d, 0x0),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x14),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0x19, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x81f))),
                rq[xA(0xec9)](),
                (rq[xA(0x38e)] = 0x7),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x51a))),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x7cb)]:
              rq[xA(0xa38)](-this[xA(0x297)]),
                rq[xA(0x264)](this[xA(0xc39)] / 0x14),
                this[xA(0x1ed)](rq),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x81f))),
                rq[xA(0xec9)](),
                rq[xA(0x94c)](),
                (rq[xA(0x38e)] = 0xc),
                (rq[xA(0x9a7)] = xA(0x92d)),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x558)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x64), this[xA(0x9cf)](rq);
              break;
            case cS[xA(0x2b3)]:
              this[xA(0xbc5)](rq, !![]);
              break;
            case cS[xA(0x339)]:
              this[xA(0xbc5)](rq, ![]);
              break;
            case cS[xA(0xcb0)]:
              (rt = this[xA(0xc39)] / 0xa),
                rq[xA(0x264)](rt),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x0, 0x8),
                rq[xA(0xbb6)](2.5, 0x0, 0x0, -0x8),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0xa),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x51a))),
                rq[xA(0x2c1)](),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x81f))),
                (rq[xA(0x38e)] = 0x6),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0xd3f)]:
              (rt = this[xA(0xc39)] / 0xa),
                rq[xA(0x264)](rt),
                rq[xA(0xd15)](0x7, 0x0),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x5, -0x5),
                rq[xA(0xc43)](-0x14, -0x5, -0x14, 0x7, 0x0, 0x5),
                rq[xA(0xc43)](-0xa, 0x3, -0xa, -0x3, -0x5, -0x5),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x6bd))),
                rq[xA(0xec9)](),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x9d3))),
                (rq[xA(0x38e)] = 0x3),
                (rq[xA(0x92c)] = xA(0x2d8)),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x5c6)]:
              (rt = this[xA(0xc39)] / 0x32), rq[xA(0x264)](rt), rq[xA(0xc3a)]();
              for (let tI = 0x0; tI < 0x9; tI++) {
                const tJ = (tI / 0x9) * Math["PI"] * 0x2,
                  tK =
                    0x3c *
                    (0x1 +
                      Math[xA(0xd3d)]((tI / 0x9) * Math["PI"] * 3.5) * 0.07);
                rq[xA(0xd7c)](0x0, 0x0),
                  rq[xA(0xbc9)](
                    Math[xA(0xd3d)](tJ) * tK,
                    Math[xA(0x46b)](tJ) * tK
                  );
              }
              (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x10),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0x32, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x81f))),
                rq[xA(0xec9)](),
                (rq[xA(0x38e)] = 0x6),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x51a))),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x963)]:
              rq[xA(0xc61)](),
                (rt = this[xA(0xc39)] / 0x28),
                rq[xA(0xd07)](rt, rt),
                this[xA(0x36d)](rq),
                (rq[xA(0x2d4)] = this[xA(0x40c)](
                  this[xA(0xb46)] ? lh[0x0] : xA(0xb13)
                )),
                (rq[xA(0x9a7)] = xA(0x6d3)),
                (rq[xA(0x38e)] = 0x10),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0x2c, 0x0, Math["PI"] * 0x2),
                rq[xA(0xec9)](),
                rq[xA(0xc61)](),
                rq[xA(0x94c)](),
                rq[xA(0x2c1)](),
                rq[xA(0xa10)](),
                rq[xA(0xa10)]();
              break;
            case cS[xA(0xcfe)]:
            case cS[xA(0x948)]:
            case cS[xA(0x906)]:
            case cS[xA(0x475)]:
            case cS[xA(0xdfc)]:
            case cS[xA(0xc38)]:
            case cS[xA(0x3e0)]:
            case cS[xA(0xad5)]:
              (rt = this[xA(0xc39)] / 0x14), rq[xA(0xd07)](rt, rt);
              const rQ = Math[xA(0x46b)](this[xA(0x2c0)] * 1.6),
                rR = this[xA(0x99d)][xA(0x79d)](xA(0xcfe)),
                rS = this[xA(0x99d)][xA(0x79d)](xA(0x529)),
                rT = this[xA(0x99d)][xA(0x79d)](xA(0x906)),
                rU = this[xA(0x99d)][xA(0x79d)](xA(0x906)) ? -0x4 : 0x0;
              (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x6);
              rS && rq[xA(0xd15)](0x8, 0x0);
              for (let tL = 0x0; tL < 0x2; tL++) {
                const tM = tL === 0x0 ? -0x1 : 0x1;
                rq[xA(0xc61)](), rq[xA(0xa38)](tM * (rQ * 0.5 + 0.6) * 0.08);
                const tN = tM * 0x4;
                rq[xA(0xc3a)](),
                  rq[xA(0xd7c)](0x0, tN),
                  rq[xA(0xbb6)](0xc, 0x6 * tM + tN, 0x18, tN),
                  rq[xA(0x2c1)](),
                  rq[xA(0xa10)]();
              }
              if (this[xA(0xb46)])
                (rq[xA(0x2d4)] = this[xA(0x40c)](lh[0x0])),
                  (rq[xA(0x9a7)] = this[xA(0x40c)](lh[0x1]));
              else
                this[xA(0x99d)][xA(0x23e)](xA(0xb3f))
                  ? ((rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x399))),
                    (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x8af))))
                  : ((rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x4d6))),
                    (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x375))));
              rq[xA(0x38e)] = rS ? 0x9 : 0xc;
              rS &&
                (rq[xA(0xc61)](),
                rq[xA(0xd15)](-0x18, 0x0),
                rq[xA(0xd07)](-0x1, 0x1),
                lF(rq, 0x15, rq[xA(0x2d4)], rq[xA(0x9a7)], rq[xA(0x38e)]),
                rq[xA(0xa10)]());
              !rT &&
                (rq[xA(0xc61)](),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](-0xa, 0x0, rS ? 0x12 : 0xc, 0x0, l0),
                rq[xA(0xec9)](),
                rq[xA(0x94c)](),
                rq[xA(0x2c1)](),
                rq[xA(0xa10)]());
              if (rR || rS) {
                rq[xA(0xc61)](),
                  (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x568))),
                  (rq[xA(0x28b)] *= 0.5);
                const tO = (Math["PI"] / 0x7) * (rS ? 0.85 : 0x1) + rQ * 0.08;
                for (let tP = 0x0; tP < 0x2; tP++) {
                  const tQ = tP === 0x0 ? -0x1 : 0x1;
                  rq[xA(0xc61)](),
                    rq[xA(0xa38)](tQ * tO),
                    rq[xA(0xd15)](
                      rS ? -0x13 : -0x9,
                      tQ * -0x3 * (rS ? 1.3 : 0x1)
                    ),
                    rq[xA(0xc3a)](),
                    rq[xA(0x3e8)](
                      0x0,
                      0x0,
                      rS ? 0x14 : 0xe,
                      rS ? 8.5 : 0x6,
                      0x0,
                      0x0,
                      l0
                    ),
                    rq[xA(0xec9)](),
                    rq[xA(0xa10)]();
                }
                rq[xA(0xa10)]();
              }
              rq[xA(0xc61)](),
                rq[xA(0xd15)](0x4 + rU, 0x0),
                lF(
                  rq,
                  rT ? 0x14 : 12.1,
                  rq[xA(0x2d4)],
                  rq[xA(0x9a7)],
                  rq[xA(0x38e)]
                ),
                rq[xA(0xa10)]();
              break;
            case cS[xA(0x330)]:
              this[xA(0xe23)](rq, xA(0xaf7));
              break;
            case cS[xA(0x21b)]:
              this[xA(0xe23)](rq, xA(0x546));
              break;
            case cS[xA(0x8c0)]:
              this[xA(0xe23)](rq, xA(0x66d)),
                (rq[xA(0x28b)] *= 0.2),
                lJ(rq, this[xA(0xc39)] * 1.3, 0x4);
              break;
            case cS[xA(0xc82)]:
            case cS[xA(0xe02)]:
            case cS[xA(0x564)]:
            case cS[xA(0xc04)]:
            case cS[xA(0x5a3)]:
            case cS[xA(0xc77)]:
              rq[xA(0xc61)](),
                (rt = this[xA(0xc39)] / 0x28),
                rq[xA(0xd07)](rt, rt),
                rq[xA(0xc3a)]();
              for (let tR = 0x0; tR < 0x2; tR++) {
                rq[xA(0xc61)](),
                  rq[xA(0xd07)](0x1, tR * 0x2 - 0x1),
                  rq[xA(0xd15)](0x0, 0x23),
                  rq[xA(0xd7c)](0x9, 0x0),
                  rq[xA(0xbc9)](0x5, 0xa),
                  rq[xA(0xbc9)](-0x5, 0xa),
                  rq[xA(0xbc9)](-0x9, 0x0),
                  rq[xA(0xbc9)](0x9, 0x0),
                  rq[xA(0xa10)]();
              }
              (rq[xA(0x38e)] = 0x12),
                (rq[xA(0x92c)] = rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x9a7)] = rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x2ef))),
                rq[xA(0xec9)](),
                rq[xA(0x2c1)]();
              let rV;
              if (this[xA(0x99d)][xA(0xe00)](xA(0x881)) > -0x1)
                rV = [xA(0x5de), xA(0xb81)];
              else
                this[xA(0x99d)][xA(0xe00)](xA(0x2c2)) > -0x1
                  ? (rV = [xA(0xcdd), xA(0x27e)])
                  : (rV = [xA(0x4e2), xA(0xd27)]);
              rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0x28, 0x0, l0),
                (rq[xA(0x2d4)] = this[xA(0x40c)](rV[0x0])),
                rq[xA(0xec9)](),
                (rq[xA(0x38e)] = 0x8),
                (rq[xA(0x9a7)] = this[xA(0x40c)](rV[0x1])),
                rq[xA(0x2c1)]();
              this[xA(0x99d)][xA(0xe00)](xA(0xa5d)) > -0x1 &&
                this[xA(0x522)](rq, -0xf, 0x0, 1.25, 0x4);
              rq[xA(0xa10)]();
              break;
            case cS[xA(0xa4f)]:
            case cS[xA(0x535)]:
              (rv =
                Math[xA(0x46b)](
                  Date[xA(0x796)]() / 0x3e8 + this[xA(0x2c0)] * 0.7
                ) *
                  0.5 +
                0.5),
                (rt = this[xA(0xc39)] / 0x50),
                rq[xA(0xd07)](rt, rt);
              const rW = this[xA(0x2dc)] === cS[xA(0x535)];
              rW &&
                (rq[xA(0xc61)](),
                rq[xA(0xd07)](0x2, 0x2),
                this[xA(0x36d)](rq),
                rq[xA(0xa10)]());
              rq[xA(0xa38)](-this[xA(0x297)]),
                (rq[xA(0x38e)] = 0xa),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0x50, 0x0, Math["PI"] * 0x2),
                (ru = this[xA(0xb46)]
                  ? lh
                  : rW
                  ? [xA(0x2e0), xA(0x62f)]
                  : [xA(0xe8e), xA(0xda5)]),
                (rq[xA(0x2d4)] = this[xA(0x40c)](ru[0x0])),
                rq[xA(0xec9)](),
                rq[xA(0x94c)](),
                (rq[xA(0x9a7)] = this[xA(0x40c)](ru[0x1])),
                rq[xA(0x2c1)]();
              const rX = this[xA(0x40c)](xA(0x81f)),
                rY = this[xA(0x40c)](xA(0x774)),
                rZ = (tS = 0x1) => {
                  const xD = xA;
                  rq[xD(0xc61)](),
                    rq[xD(0xd07)](tS, 0x1),
                    rq[xD(0xd15)](0x13 - rv * 0x4, -0x1d + rv * 0x5),
                    rq[xD(0xc3a)](),
                    rq[xD(0xd7c)](0x0, 0x0),
                    rq[xD(0xc43)](0x6, -0xa, 0x1e, -0xa, 0x2d, -0x2),
                    rq[xD(0xbb6)](0x19, 0x5 + rv * 0x2, 0x0, 0x0),
                    rq[xD(0x5fb)](),
                    (rq[xD(0x38e)] = 0x3),
                    rq[xD(0x2c1)](),
                    (rq[xD(0x2d4)] = rX),
                    rq[xD(0xec9)](),
                    rq[xD(0x94c)](),
                    rq[xD(0xc3a)](),
                    rq[xD(0x54b)](
                      0x16 + tS * this[xD(0xd04)] * 0x10,
                      -0x4 + this[xD(0x28f)] * 0x4,
                      0x6,
                      0x0,
                      Math["PI"] * 0x2
                    ),
                    (rq[xD(0x2d4)] = rY),
                    rq[xD(0xec9)](),
                    rq[xD(0xa10)]();
                };
              rZ(0x1),
                rZ(-0x1),
                rq[xA(0xc61)](),
                rq[xA(0xd15)](0x0, 0xa),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x28 + rv * 0xa, -0xe + rv * 0x5),
                rq[xA(0xbb6)](0x0, +rv * 0x5, 0x2c - rv * 0xf, -0xe + rv * 0x5),
                rq[xA(0xc43)](
                  0x14,
                  0x28 - rv * 0x14,
                  -0x14,
                  0x28 - rv * 0x14,
                  -0x28 + rv * 0xa,
                  -0xe + rv * 0x5
                ),
                rq[xA(0x5fb)](),
                (rq[xA(0x38e)] = 0x5),
                rq[xA(0x2c1)](),
                (rq[xA(0x2d4)] = rY),
                rq[xA(0xec9)](),
                rq[xA(0x94c)]();
              const s0 = rv * 0x2,
                s1 = rv * -0xa;
              rq[xA(0xc61)](),
                rq[xA(0xd15)](0x0, s1),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x37, -0x8),
                rq[xA(0xc43)](0x14, 0x26, -0x14, 0x26, -0x32, -0x8),
                (rq[xA(0x9a7)] = rX),
                (rq[xA(0x38e)] = 0xd),
                rq[xA(0x2c1)](),
                (rq[xA(0x38e)] = 0x4),
                (rq[xA(0x9a7)] = rY),
                rq[xA(0xc3a)]();
              for (let tS = 0x0; tS < 0x6; tS++) {
                const tT = (((tS + 0x1) / 0x6) * 0x2 - 0x1) * 0x23;
                rq[xA(0xd7c)](tT, 0xa), rq[xA(0xbc9)](tT, 0x46);
              }
              rq[xA(0x2c1)](),
                rq[xA(0xa10)](),
                rq[xA(0xc61)](),
                rq[xA(0xd15)](0x0, s0),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x32, -0x14),
                rq[xA(0xbb6)](0x0, 0x8, 0x32, -0x12),
                (rq[xA(0x9a7)] = rX),
                (rq[xA(0x38e)] = 0xd),
                rq[xA(0x2c1)](),
                (rq[xA(0x38e)] = 0x5),
                (rq[xA(0x9a7)] = rY),
                rq[xA(0xc3a)]();
              for (let tU = 0x0; tU < 0x6; tU++) {
                let tV = (((tU + 0x1) / 0x7) * 0x2 - 0x1) * 0x32;
                rq[xA(0xd7c)](tV, -0x14), rq[xA(0xbc9)](tV, 0x2);
              }
              rq[xA(0x2c1)](), rq[xA(0xa10)](), rq[xA(0xa10)]();
              const s3 = 0x1 - rv;
              (rq[xA(0x28b)] *= Math[xA(0x525)](0x0, (s3 - 0.3) / 0.7)),
                rq[xA(0xc3a)]();
              for (let tW = 0x0; tW < 0x2; tW++) {
                rq[xA(0xc61)](),
                  tW === 0x1 && rq[xA(0xd07)](-0x1, 0x1),
                  rq[xA(0xd15)](
                    -0x33 + rv * (0xa + tW * 3.4) - tW * 3.4,
                    -0xf + rv * (0x5 - tW * 0x1)
                  ),
                  rq[xA(0xd7c)](0xa, 0x0),
                  rq[xA(0x54b)](0x0, 0x0, 0xa, 0x0, Math["PI"] / 0x2),
                  rq[xA(0xa10)]();
              }
              rq[xA(0xd15)](0x0, 0x28),
                rq[xA(0xd7c)](0x28 - rv * 0xa, -0xe + rv * 0x5),
                rq[xA(0xc43)](
                  0x14,
                  0x14 - rv * 0xa,
                  -0x14,
                  0x14 - rv * 0xa,
                  -0x28 + rv * 0xa,
                  -0xe + rv * 0x5
                ),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x2),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x562)]:
              (rt = this[xA(0xc39)] / 0x14), rq[xA(0xd07)](rt, rt);
              const s4 = rq[xA(0x28b)];
              (rq[xA(0x9a7)] = rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x81f))),
                (rq[xA(0x28b)] = 0.6 * s4),
                rq[xA(0xc3a)]();
              for (let tX = 0x0; tX < 0xa; tX++) {
                const tY = (tX / 0xa) * Math["PI"] * 0x2;
                rq[xA(0xc61)](),
                  rq[xA(0xa38)](tY),
                  rq[xA(0xd15)](17.5, 0x0),
                  rq[xA(0xd7c)](0x0, 0x0);
                const tZ = Math[xA(0x46b)](tY + Date[xA(0x796)]() / 0x1f4);
                rq[xA(0xa38)](tZ * 0.5),
                  rq[xA(0xbb6)](0x4, -0x2 * tZ, 0xe, 0x0),
                  rq[xA(0xa10)]();
              }
              (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 2.3),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x28b)] = 0.5 * s4),
                rq[xA(0xec9)](),
                rq[xA(0x94c)](),
                (rq[xA(0x38e)] = 0x3),
                rq[xA(0x2c1)](),
                (rq[xA(0x38e)] = 1.2),
                (rq[xA(0x28b)] = 0.6 * s4),
                rq[xA(0xc3a)](),
                (rq[xA(0xe5e)] = xA(0x2d8));
              for (let u0 = 0x0; u0 < 0x4; u0++) {
                rq[xA(0xc61)](),
                  rq[xA(0xa38)]((u0 / 0x4) * Math["PI"] * 0x2),
                  rq[xA(0xd15)](0x4, 0x0),
                  rq[xA(0xd7c)](0x0, -0x2),
                  rq[xA(0xc43)](6.5, -0x8, 6.5, 0x8, 0x0, 0x2),
                  rq[xA(0xa10)]();
              }
              rq[xA(0x2c1)]();
              break;
            case cS[xA(0xc2b)]:
              this[xA(0xc2b)](rq);
              break;
            case cS[xA(0x6bb)]:
              this[xA(0xc2b)](rq, !![]);
              break;
            case cS[xA(0xaf9)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x32),
                (rq[xA(0x38e)] = 0x19),
                (rq[xA(0x92c)] = xA(0x2d8));
              const s5 = this[xA(0x919)]
                ? 0.6
                : (Date[xA(0x796)]() / 0x4b0) % 6.28;
              for (let u1 = 0x0; u1 < 0xa; u1++) {
                const u2 = 0x1 - u1 / 0xa,
                  u3 =
                    u2 *
                    0x50 *
                    (0x1 +
                      (Math[xA(0x46b)](s5 * 0x3 + u1 * 0.5 + this[xA(0x2c0)]) *
                        0.6 +
                        0.4) *
                        0.2);
                rq[xA(0xa38)](s5),
                  (rq[xA(0x9a7)] = this[xA(0x40c)](lg[u1])),
                  rq[xA(0x5b1)](-u3 / 0x2, -u3 / 0x2, u3, u3);
              }
              break;
            case cS[xA(0xbf6)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x12),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x19, -0xa),
                rq[xA(0xbb6)](0x0, -0x2, 0x19, -0xa),
                rq[xA(0xbb6)](0x1e, 0x0, 0x19, 0xa),
                rq[xA(0xbb6)](0x0, 0x2, -0x19, 0xa),
                rq[xA(0xbb6)](-0x1e, 0x0, -0x19, -0xa),
                rq[xA(0x5fb)](),
                (rq[xA(0x92c)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0x4),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0xd10))),
                rq[xA(0x2c1)](),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x22c))),
                rq[xA(0xec9)](),
                rq[xA(0x94c)](),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x19, -0xa),
                rq[xA(0xbb6)](0x14, 0x0, 0x19, 0xa),
                rq[xA(0xbc9)](0x28, 0xa),
                rq[xA(0xbc9)](0x28, -0xa),
                (rq[xA(0x2d4)] = xA(0x6d3)),
                rq[xA(0xec9)](),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x0, -0xa),
                rq[xA(0xbb6)](-0x5, 0x0, 0x0, 0xa),
                (rq[xA(0x38e)] = 0xa),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0xb33))),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x1e9)]:
              (rt = this[xA(0xc39)] / 0xc),
                rq[xA(0xd07)](rt, rt),
                rq[xA(0xa38)](-Math["PI"] / 0x6),
                rq[xA(0xd15)](-0xc, 0x0),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x5, 0x0),
                rq[xA(0xbc9)](0x0, 0x0),
                (rq[xA(0x38e)] = 0x4),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x4ae))),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x0, 0x0),
                rq[xA(0xbb6)](0xa, -0x14, 0x1e, 0x0),
                rq[xA(0xbb6)](0xa, 0x14, 0x0, 0x0),
                (rq[xA(0x38e)] = 0x6),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x52e))),
                rq[xA(0x2c1)](),
                rq[xA(0xec9)](),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x6, 0x0),
                rq[xA(0xbb6)](0xe, -0x2, 0x16, 0x0),
                (rq[xA(0x38e)] = 3.5),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x300)]:
              rs(xA(0x300), xA(0xa50), xA(0x983));
              break;
            case cS[xA(0xa2e)]:
              rs(xA(0xa2e), xA(0x702), xA(0xe43));
              break;
            case cS[xA(0xdf9)]:
              rs(xA(0xdf9), xA(0x81f), xA(0x51a));
              break;
            case cS[xA(0x6a5)]:
              rs(xA(0x6a5), xA(0x81f), xA(0x51a));
              break;
            case cS[xA(0x3eb)]:
              rs(xA(0x6a5), xA(0xa1b), xA(0x5b6));
              break;
            case cS[xA(0x88b)]:
              const s6 = this[xA(0x919)] ? 0x3c : this[xA(0xc39)] * 0x2;
              rq[xA(0xd15)](-this[xA(0xc39)] - 0xa, 0x0),
                (rq[xA(0x92c)] = rq[xA(0xe5e)] = xA(0x2d8)),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x0, 0x0),
                rq[xA(0xbc9)](s6, 0x0),
                (rq[xA(0x38e)] = 0x6),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0xa, 0x0, 0x5, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x9d3))),
                rq[xA(0xec9)](),
                rq[xA(0xd15)](s6, 0x0),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0xd, 0x0),
                rq[xA(0xbc9)](0x0, -3.5),
                rq[xA(0xbc9)](0x0, 3.5),
                rq[xA(0x5fb)](),
                (rq[xA(0x9a7)] = rq[xA(0x2d4)]),
                rq[xA(0xec9)](),
                (rq[xA(0x38e)] = 0x3),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x5bf)]:
              const s7 = this[xA(0xc39)] * 0x2,
                s8 = 0xa;
              rq[xA(0xd15)](-this[xA(0xc39)], 0x0),
                (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0xcb6)] = xA(0xb8d)),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x0, 0x0),
                rq[xA(0xbc9)](-s8 * 1.8, 0x0),
                (rq[xA(0x9a7)] = xA(0x872)),
                (rq[xA(0x38e)] = s8 * 1.4),
                rq[xA(0x2c1)](),
                (rq[xA(0x9a7)] = xA(0xe24)),
                (rq[xA(0x38e)] *= 0.7),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x0, 0x0),
                rq[xA(0xbc9)](-s8 * 0.45, 0x0),
                (rq[xA(0x9a7)] = xA(0x872)),
                (rq[xA(0x38e)] = s8 * 0x2 + 3.5),
                rq[xA(0x2c1)](),
                (rq[xA(0x9a7)] = xA(0xe39)),
                (rq[xA(0x38e)] = s8 * 0x2),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, s8, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x2d4)] = xA(0x374)),
                rq[xA(0xec9)](),
                (rq[xA(0x9a7)] = xA(0x7da)),
                rq[xA(0xc3a)]();
              const s9 = (Date[xA(0x796)]() * 0.001) % 0x1,
                sa = s9 * s7,
                sb = s7 * 0.2;
              rq[xA(0xd7c)](Math[xA(0x525)](sa - sb, 0x0), 0x0),
                rq[xA(0xbc9)](Math[xA(0x36c)](sa + sb, s7), 0x0);
              const sc = Math[xA(0x46b)](s9 * Math["PI"]);
              (rq[xA(0x57d)] = s8 * 0x3 * sc),
                (rq[xA(0x38e)] = s8),
                rq[xA(0x2c1)](),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x0, 0x0),
                rq[xA(0xbc9)](s7, 0x0),
                (rq[xA(0x38e)] = s8),
                (rq[xA(0x57d)] = s8),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x616)]:
            case cS[xA(0x60e)]:
            case cS[xA(0x663)]:
            case cS[xA(0xd34)]:
            case cS[xA(0x982)]:
            case cS[xA(0xadc)]:
              (rt = this[xA(0xc39)] / 0x23), rq[xA(0x264)](rt), rq[xA(0xc3a)]();
              this[xA(0x2dc)] !== cS[xA(0x60e)] &&
              this[xA(0x2dc)] !== cS[xA(0x982)]
                ? rq[xA(0x3e8)](0x0, 0x0, 0x1e, 0x28, 0x0, 0x0, l0)
                : rq[xA(0x54b)](0x0, 0x0, 0x23, 0x0, l0);
              (ru = lr[this[xA(0x2dc)]] || [xA(0xcd8), xA(0x53d)]),
                (rq[xA(0x2d4)] = this[xA(0x40c)](ru[0x0])),
                rq[xA(0xec9)](),
                (rq[xA(0x9a7)] = this[xA(0x40c)](ru[0x1])),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x70f)]:
              (rq[xA(0x38e)] = 0x4),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x997)),
                rs(xA(0x70f), xA(0x899), xA(0xc44));
              break;
            case cS[xA(0x33a)]:
              rs(xA(0x33a), xA(0x81f), xA(0x51a));
              break;
            case cS[xA(0x97e)]:
              (rt = this[xA(0xc39)] / 0x14), rq[xA(0xd07)](rt, rt);
              !this[xA(0x919)] && rq[xA(0xa38)]((pz / 0x64) % 6.28);
              rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0x14, 0x0, Math["PI"]),
                rq[xA(0xbb6)](0x0, 0xc, 0x14, 0x0),
                rq[xA(0x5fb)](),
                (rq[xA(0x92c)] = rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] *= 0.7),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x81f))),
                rq[xA(0xec9)](),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x51a))),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x93b)]:
              (rq[xA(0x38e)] *= 0.7),
                rs(xA(0x93b), xA(0x5ce), xA(0x307)),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0.6, 0x0, l0),
                (rq[xA(0x2d4)] = xA(0x98c)),
                rq[xA(0xec9)]();
              break;
            case cS[xA(0x871)]:
              (rq[xA(0x38e)] *= 0.8), rs(xA(0x871), xA(0xa5e), xA(0x4c1));
              break;
            case cS[xA(0x363)]:
              (rt = this[xA(0xc39)] / 0xa), rq[xA(0xd07)](rt, rt);
              if (!this[xA(0xe6d)] || pz - this[xA(0xd9c)] > 0x14) {
                this[xA(0xd9c)] = pz;
                const u4 = new Path2D();
                for (let u5 = 0x0; u5 < 0xa; u5++) {
                  const u6 = (Math[xA(0xa69)]() * 0x2 - 0x1) * 0x7,
                    u7 = (Math[xA(0xa69)]() * 0x2 - 0x1) * 0x7;
                  u4[xA(0xd7c)](u6, u7), u4[xA(0x54b)](u6, u7, 0x5, 0x0, l0);
                }
                this[xA(0xe6d)] = u4;
              }
              (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x568))),
                rq[xA(0xec9)](this[xA(0xe6d)]);
              break;
            case cS[xA(0xac6)]:
            case cS[xA(0x409)]:
              (rt = this[xA(0xc39)] / 0x1e),
                rq[xA(0xd07)](rt, rt),
                rq[xA(0xc3a)]();
              const sd = 0x1 / 0x3;
              for (let u8 = 0x0; u8 < 0x3; u8++) {
                const u9 = (u8 / 0x3) * Math["PI"] * 0x2;
                rq[xA(0xd7c)](0x0, 0x0),
                  rq[xA(0x54b)](0x0, 0x0, 0x1e, u9, u9 + Math["PI"] / 0x3);
              }
              (rq[xA(0xe5e)] = xA(0x2d8)),
                (rq[xA(0x38e)] = 0xa),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0xf, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x2d4)] = this[xA(0x40c)](
                  this[xA(0x2dc)] === cS[xA(0xac6)] ? xA(0xcbb) : xA(0xc59)
                )),
                rq[xA(0xec9)](),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0xa3f)]:
              rr(xA(0x52b), xA(0x914));
              break;
            case cS[xA(0x573)]:
              rr(xA(0xc47), xA(0x897));
              break;
            case cS[xA(0x681)]:
            case cS[xA(0xa67)]:
              rr(xA(0x81f), xA(0x51a));
              break;
            case cS[xA(0xaeb)]:
              (rt = this[xA(0xc39)] / 0x14),
                rq[xA(0xd07)](rt, rt),
                rq[xA(0xa38)](-Math["PI"] / 0x4);
              const se = rq[xA(0x38e)];
              (rq[xA(0x38e)] *= 1.5),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x14, -0x14 - se),
                rq[xA(0xbc9)](-0x14, 0x0),
                rq[xA(0xbc9)](0x14, 0x0),
                rq[xA(0xbc9)](0x14, 0x14 + se),
                rq[xA(0xa38)](Math["PI"] / 0x2),
                rq[xA(0xd7c)](-0x14, -0x14 - se),
                rq[xA(0xbc9)](-0x14, 0x0),
                rq[xA(0xbc9)](0x14, 0x0),
                rq[xA(0xbc9)](0x14, 0x14 + se),
                (rq[xA(0xe5e)] = rq[xA(0xe5e)] = xA(0x997)),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x550)]:
              rr(xA(0xbf9), xA(0x866));
              break;
            case cS[xA(0x911)]:
              rr(xA(0xb9f), xA(0xdd8));
              break;
            case cS[xA(0x664)]:
              rr(xA(0x662), xA(0x833));
              break;
            case cS[xA(0xe27)]:
              (rt = this[xA(0xc39)] / 0x14),
                rq[xA(0xd07)](rt, rt),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0x14, 0x0, l0),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x6bd))),
                rq[xA(0xec9)](),
                rq[xA(0x94c)](),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x9d3))),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x5, -0x5, 0x5, 0x0, Math["PI"] * 0x2),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x915))),
                rq[xA(0xec9)]();
              break;
            case cS[xA(0x62c)]:
              (rt = this[xA(0xc39)] / 0x14), rq[xA(0xd07)](rt, rt);
              const sf = (ua, ub, uc = ![]) => {
                  const xE = xA;
                  (rq[xE(0xe5e)] = xE(0x2d8)),
                    (rq[xE(0x9a7)] = this[xE(0x40c)](ub)),
                    (rq[xE(0x2d4)] = this[xE(0x40c)](ua)),
                    rq[xE(0xc3a)](),
                    rq[xE(0x54b)](
                      0x0,
                      0xa,
                      0xa,
                      Math["PI"] / 0x2,
                      (Math["PI"] * 0x3) / 0x2
                    ),
                    rq[xE(0x2c1)](),
                    rq[xE(0xec9)]();
                },
                sg = (ua, ub) => {
                  const xF = xA;
                  rq[xF(0xc61)](),
                    rq[xF(0x94c)](),
                    (rq[xF(0xe5e)] = xF(0x2d8)),
                    (rq[xF(0x2d4)] = this[xF(0x40c)](ua)),
                    (rq[xF(0x9a7)] = this[xF(0x40c)](ub)),
                    rq[xF(0xec9)](),
                    rq[xF(0x2c1)](),
                    rq[xF(0xa10)]();
                };
              (rq[xA(0xe5e)] = xA(0x2d8)),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, 0x14, 0x0, Math["PI"] * 0x2),
                sg(xA(0x6bd), xA(0x9d3)),
                rq[xA(0xa38)](Math["PI"]),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](
                  0x0,
                  0x0,
                  0x14,
                  -Math["PI"] / 0x2,
                  Math["PI"] / 0x2
                ),
                rq[xA(0x54b)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                rq[xA(0x54b)](
                  0x0,
                  -0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2,
                  !![]
                ),
                sg(xA(0x81f), xA(0x51a)),
                rq[xA(0xa38)](-Math["PI"]),
                rq[xA(0xc3a)](),
                rq[xA(0x54b)](
                  0x0,
                  0xa,
                  0xa,
                  Math["PI"] / 0x2,
                  (Math["PI"] * 0x3) / 0x2
                ),
                sg(xA(0x6bd), xA(0x9d3));
              break;
            case cS[xA(0x605)]:
              this[xA(0xebf)](rq, this[xA(0xc39)]);
              break;
            case cS[xA(0x9a1)]:
              (rt = this[xA(0xc39)] / 0x28),
                rq[xA(0xd07)](rt, rt),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](-0x1e, -0x1e),
                rq[xA(0xbc9)](0x14, 0x0),
                rq[xA(0xbc9)](-0x1e, 0x1e),
                rq[xA(0x5fb)](),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6bd))),
                (rq[xA(0x2d4)] = this[xA(0x40c)](xA(0x66d))),
                rq[xA(0xec9)](),
                (rq[xA(0x38e)] = 0x16),
                (rq[xA(0xe5e)] = rq[xA(0x92c)] = xA(0x2d8)),
                rq[xA(0x2c1)]();
              break;
            case cS[xA(0x697)]:
              rq[xA(0x264)](this[xA(0xc39)] / 0x41),
                rq[xA(0xd15)](-0xa, 0xa),
                (rq[xA(0x92c)] = rq[xA(0xe5e)] = xA(0x2d8)),
                rq[xA(0xc61)](),
                rq[xA(0xc3a)](),
                rq[xA(0xd7c)](0x1e, 0x0),
                rq[xA(0xd15)](
                  0x46 -
                    (Math[xA(0x46b)](
                      Date[xA(0x796)]() / 0x190 + 0.8 * this[xA(0x2c0)]
                    ) *
                      0.5 +
                      0.5) *
                      0x4,
                  0x0
                ),
                rq[xA(0xbc9)](0x0, 0x0),
                (rq[xA(0x38e)] = 0x2a),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0xed9))),
                rq[xA(0x2c1)](),
                (rq[xA(0x9a7)] = this[xA(0x40c)](xA(0x6ce))),
                (rq[xA(0x38e)] -= 0xc),
                rq[xA(0x2c1)](),
                rq[xA(0xc3a)]();
              for (let ua = 0x0; ua < 0x2; ua++) {
                rq[xA(0xd7c)](0x9, 0x7),
                  rq[xA(0xbc9)](0x28, 0x14),
                  rq[xA(0xbc9)](0x7, 0x9),
                  rq[xA(0xbc9)](0x9, 0x7),
                  rq[xA(0xd07)](0x1, -0x1);
              }
              (rq[xA(0x38e)] = 0x3),
                (rq[xA(0x2d4)] = rq[xA(0x9a7)] = xA(0xe26)),
                rq[xA(0x2c1)](),
                rq[xA(0xec9)](),
                rq[xA(0xa10)](),
                this[xA(0xa62)](rq);
              break;
            case cS[xA(0x80f)]:
              (rt = this[xA(0xc39)] / 0x14), rq[xA(0xd07)](rt, rt);
              const sh = (ub = 0x1, uc, ud) => {
                const xG = xA;
                rq[xG(0xc61)](),
                  rq[xG(0xd07)](0x1, ub),
                  rq[xG(0xc3a)](),
                  rq[xG(0x942)](-0x64, 0x0, 0x12c, -0x12c),
                  rq[xG(0x94c)](),
                  rq[xG(0xc3a)](),
                  rq[xG(0xd7c)](-0x14, 0x0),
                  rq[xG(0xbb6)](-0x12, -0x19, 0x11, -0xf),
                  (rq[xG(0xe5e)] = xG(0x2d8)),
                  (rq[xG(0x38e)] = 0x16),
                  (rq[xG(0x9a7)] = this[xG(0x40c)](ud)),
                  rq[xG(0x2c1)](),
                  (rq[xG(0x38e)] = 0xe),
                  (rq[xG(0x9a7)] = this[xG(0x40c)](uc)),
                  rq[xG(0x2c1)](),
                  rq[xG(0xa10)]();
              };
              sh(0x1, xA(0x5f8), xA(0x7ea)), sh(-0x1, xA(0x6e8), xA(0xa0b));
              break;
            default:
              rq[xA(0xc3a)](),
                rq[xA(0x54b)](0x0, 0x0, this[xA(0xc39)], 0x0, Math["PI"] * 0x2),
                (rq[xA(0x2d4)] = xA(0x471)),
                rq[xA(0xec9)](),
                pt(rq, this[xA(0x99d)], 0x14, xA(0x7da), 0x3);
          }
          rq[xA(0xa10)](), (this[xA(0x73f)] = null);
        }
        [uf(0x1ed)](rq, rr) {
          const xH = uf;
          rr = rr || pz / 0x12c + this[xH(0x2c0)] * 0.3;
          const rs = Math[xH(0x46b)](rr) * 0.5 + 0.5;
          rq[xH(0xe5e)] = xH(0x2d8);
          const rt = 0x4;
          for (let ru = 0x0; ru < 0x2; ru++) {
            rq[xH(0xc61)]();
            if (ru === 0x0) rq[xH(0xc3a)]();
            for (let rv = 0x0; rv < 0x2; rv++) {
              for (let rw = 0x0; rw < rt; rw++) {
                rq[xH(0xc61)](), ru > 0x0 && rq[xH(0xc3a)]();
                const rx = -0.19 - (rw / rt) * Math["PI"] * 0.25;
                rq[xH(0xa38)](rx + rs * 0.05), rq[xH(0xd7c)](0x0, 0x0);
                const ry = Math[xH(0x46b)](rr + rw);
                rq[xH(0xd15)](0x1c - (ry * 0.5 + 0.5), 0x0),
                  rq[xH(0xa38)](ry * 0.08),
                  rq[xH(0xbc9)](0x0, 0x0),
                  rq[xH(0xbb6)](0x0, 0x7, 5.5, 0xe),
                  ru > 0x0 &&
                    ((rq[xH(0x38e)] = 6.5),
                    (rq[xH(0x9a7)] =
                      xH(0xba3) + (0x2f + (rw / rt) * 0x14) + "%)"),
                    rq[xH(0x2c1)]()),
                  rq[xH(0xa10)]();
              }
              rq[xH(0xd07)](-0x1, 0x1);
            }
            ru === 0x0 &&
              ((rq[xH(0x38e)] = 0x9),
              (rq[xH(0x9a7)] = xH(0x787)),
              rq[xH(0x2c1)]()),
              rq[xH(0xa10)]();
          }
          rq[xH(0xc3a)](),
            rq[xH(0x3e8)](
              0x0,
              -0x1e + Math[xH(0x46b)](rr * 0.6) * 0.5,
              0xb,
              4.5,
              0x0,
              0x0,
              Math["PI"] * 0x2
            ),
            (rq[xH(0x9a7)] = xH(0x787)),
            (rq[xH(0x38e)] = 5.5),
            rq[xH(0x2c1)](),
            (rq[xH(0x57d)] = 0x5 + rs * 0x8),
            (rq[xH(0xcb6)] = xH(0x325)),
            (rq[xH(0x9a7)] = rq[xH(0xcb6)]),
            (rq[xH(0x38e)] = 3.5),
            rq[xH(0x2c1)](),
            (rq[xH(0x57d)] = 0x0);
        }
        [uf(0x9cf)](rq) {
          const xI = uf,
            rr = this[xI(0xb46)] ? ll[xI(0xd1e)] : ll[xI(0xce4)],
            rs = Date[xI(0x796)]() / 0x1f4 + this[xI(0x2c0)],
            rt = Math[xI(0x46b)](rs) - 0.5;
          rq[xI(0xe5e)] = rq[xI(0x92c)] = xI(0x2d8);
          const ru = 0x46;
          rq[xI(0xc61)](), rq[xI(0xc3a)]();
          for (let rv = 0x0; rv < 0x2; rv++) {
            rq[xI(0xc61)]();
            const rw = rv * 0x2 - 0x1;
            rq[xI(0xd07)](0x1, rw),
              rq[xI(0xd15)](0x14, ru),
              rq[xI(0xa38)](rt * 0.1),
              rq[xI(0xd7c)](0x0, 0x0),
              rq[xI(0xbc9)](-0xa, 0x32),
              rq[xI(0xbb6)](0x32, 0x32, 0x64, 0x1e),
              rq[xI(0xbb6)](0x32, 0x32, 0x64, 0x1e),
              rq[xI(0xbb6)](0x1e, 0x8c, -0x50, 0x78 - rt * 0x14),
              rq[xI(0xbb6)](
                -0xa + rt * 0xf,
                0x6e - rt * 0xa,
                -0x28,
                0x50 - rt * 0xa
              ),
              rq[xI(0xbb6)](
                -0xa + rt * 0xa,
                0x3c + rt * 0x5,
                -0x3c,
                0x32 - Math[xI(0x525)](0x0, rt) * 0xa
              ),
              rq[xI(0xbb6)](-0xa, 0x14 - rt * 0xa, -0x46, rt * 0xa),
              rq[xI(0xa10)]();
          }
          (rq[xI(0x2d4)] = this[xI(0x40c)](rr[xI(0x6d7)])),
            rq[xI(0xec9)](),
            (rq[xI(0x38e)] = 0x12),
            (rq[xI(0x9a7)] = xI(0x92d)),
            rq[xI(0x94c)](),
            rq[xI(0x2c1)](),
            rq[xI(0xa10)](),
            rq[xI(0xc61)](),
            rq[xI(0xd15)](0x50, 0x0),
            rq[xI(0xd07)](0x2, 0x2),
            rq[xI(0xc3a)]();
          for (let rx = 0x0; rx < 0x2; rx++) {
            rq[xI(0xd07)](0x1, -0x1),
              rq[xI(0xc61)](),
              rq[xI(0xd15)](0x0, 0xf),
              rq[xI(0xa38)]((Math[xI(0x46b)](rs * 0x2) * 0.5 + 0.5) * 0.08),
              rq[xI(0xd7c)](0x0, -0x4),
              rq[xI(0xbb6)](0xa, 0x0, 0x14, -0x6),
              rq[xI(0xbb6)](0xf, 0x3, 0x0, 0x5),
              rq[xI(0xa10)]();
          }
          (rq[xI(0x2d4)] = rq[xI(0x9a7)] = xI(0xe26)),
            rq[xI(0xec9)](),
            (rq[xI(0x38e)] = 0x6),
            rq[xI(0x2c1)](),
            rq[xI(0xa10)]();
          for (let ry = 0x0; ry < 0x2; ry++) {
            const rz = ry === 0x0;
            rz && rq[xI(0xc3a)]();
            for (let rA = 0x4; rA >= 0x0; rA--) {
              const rB = rA / 0x5,
                rC = 0x32 - 0x2d * rB;
              !rz && rq[xI(0xc3a)](),
                rq[xI(0x942)](
                  -0x50 - rB * 0x50 - rC / 0x2,
                  -rC / 0x2 +
                    Math[xI(0x46b)](rB * Math["PI"] * 0x2 + rs * 0x3) *
                      0x8 *
                      rB,
                  rC,
                  rC
                ),
                !rz &&
                  ((rq[xI(0x38e)] = 0x14),
                  (rq[xI(0x2d4)] = rq[xI(0x9a7)] =
                    this[xI(0x40c)](rr[xI(0x504)][rA])),
                  rq[xI(0x2c1)](),
                  rq[xI(0xec9)]());
            }
            rz &&
              ((rq[xI(0x38e)] = 0x22),
              (rq[xI(0x9a7)] = this[xI(0x40c)](rr[xI(0xd92)])),
              rq[xI(0x2c1)]());
          }
          rq[xI(0xc3a)](),
            rq[xI(0x54b)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2),
            (rq[xI(0x2d4)] = this[xI(0x40c)](rr[xI(0x92f)])),
            rq[xI(0xec9)](),
            (rq[xI(0x38e)] = 0x24),
            (rq[xI(0x9a7)] = xI(0x762)),
            rq[xI(0xc61)](),
            rq[xI(0x94c)](),
            rq[xI(0x2c1)](),
            rq[xI(0xa10)](),
            rq[xI(0xc61)]();
          for (let rD = 0x0; rD < 0x2; rD++) {
            rq[xI(0xc3a)]();
            for (let rE = 0x0; rE < 0x2; rE++) {
              rq[xI(0xc61)]();
              const rF = rE * 0x2 - 0x1;
              rq[xI(0xd07)](0x1, rF),
                rq[xI(0xd15)](0x14, ru),
                rq[xI(0xa38)](rt * 0.1),
                rq[xI(0xd7c)](0x0, 0xa),
                rq[xI(0xbc9)](-0xa, 0x32),
                rq[xI(0xbb6)](0x32, 0x32, 0x64, 0x1e),
                rq[xI(0xbb6)](0x32, 0x32, 0x64, 0x1e),
                rq[xI(0xbb6)](0x1e, 0x8c, -0x50, 0x78 - rt * 0x14),
                rq[xI(0xd7c)](0x64, 0x1e),
                rq[xI(0xbb6)](0x23, 0x5a, -0x28, 0x50 - rt * 0xa),
                rq[xI(0xd7c)](-0xa, 0x32),
                rq[xI(0xbb6)](
                  -0x28,
                  0x32,
                  -0x3c,
                  0x32 - Math[xI(0x525)](0x0, rt) * 0xa
                ),
                rq[xI(0xa10)]();
            }
            rD === 0x0
              ? ((rq[xI(0x38e)] = 0x10),
                (rq[xI(0x9a7)] = this[xI(0x40c)](rr[xI(0x576)])))
              : ((rq[xI(0x38e)] = 0xa),
                (rq[xI(0x9a7)] = this[xI(0x40c)](rr[xI(0x7b0)]))),
              rq[xI(0x2c1)]();
          }
          rq[xI(0xa10)]();
        }
        [uf(0x2d1)](rq, rr, rs, rt) {
          const xJ = uf;
          rq[xJ(0xc61)]();
          const ru = this[xJ(0xc39)] / 0x28;
          rq[xJ(0xd07)](ru, ru),
            (rr = this[xJ(0x40c)](rr)),
            (rs = this[xJ(0x40c)](rs)),
            (rt = this[xJ(0x40c)](rt));
          const rv = Math["PI"] / 0x5;
          rq[xJ(0xe5e)] = rq[xJ(0x92c)] = xJ(0x2d8);
          const rw = Math[xJ(0x46b)](
              Date[xJ(0x796)]() / 0x12c + this[xJ(0x2c0)] * 0.2
            ),
            rx = rw * 0.3 + 0.7;
          rq[xJ(0xc3a)](),
            rq[xJ(0x54b)](0x16, 0x0, 0x17, 0x0, l0),
            rq[xJ(0xd7c)](0x0, 0x0),
            rq[xJ(0x54b)](-0x5, 0x0, 0x21, 0x0, l0),
            (rq[xJ(0x2d4)] = this[xJ(0x40c)](xJ(0x774))),
            rq[xJ(0xec9)](),
            rq[xJ(0xc61)](),
            rq[xJ(0xd15)](0x12, 0x0);
          for (let rA = 0x0; rA < 0x2; rA++) {
            rq[xJ(0xc61)](),
              rq[xJ(0xd07)](0x1, rA * 0x2 - 0x1),
              rq[xJ(0xa38)](Math["PI"] * 0.08 * rx),
              rq[xJ(0xd15)](-0x12, 0x0),
              rq[xJ(0xc3a)](),
              rq[xJ(0x54b)](0x0, 0x0, 0x28, Math["PI"], -rv),
              rq[xJ(0xbb6)](0x14 - rx * 0x3, -0xf, 0x14, 0x0),
              rq[xJ(0x5fb)](),
              (rq[xJ(0x2d4)] = rr),
              rq[xJ(0xec9)]();
            const rB = xJ(0xb73) + rA;
            if (!this[rB]) {
              const rC = new Path2D();
              for (let rD = 0x0; rD < 0x2; rD++) {
                const rE = (Math[xJ(0xa69)]() * 0x2 - 0x1) * 0x28,
                  rF = Math[xJ(0xa69)]() * -0x28,
                  rG = Math[xJ(0xa69)]() * 0x9 + 0x8;
                rC[xJ(0xd7c)](rE, rF), rC[xJ(0x54b)](rE, rF, rG, 0x0, l0);
              }
              this[rB] = rC;
            }
            rq[xJ(0x94c)](),
              (rq[xJ(0x2d4)] = rt),
              rq[xJ(0xec9)](this[rB]),
              rq[xJ(0xa10)](),
              (rq[xJ(0x38e)] = 0x7),
              (rq[xJ(0x9a7)] = rs),
              rq[xJ(0x2c1)]();
          }
          rq[xJ(0xa10)](), rq[xJ(0xc61)]();
          let ry = 0x9;
          rq[xJ(0xd15)](0x2a, 0x0);
          const rz = Math["PI"] * 0x3 - rw;
          rq[xJ(0xc3a)]();
          for (let rH = 0x0; rH < 0x2; rH++) {
            let rI = 0x0,
              rJ = 0x8;
            rq[xJ(0xd7c)](rI, rJ);
            for (let rK = 0x0; rK < ry; rK++) {
              const rL = rK / ry,
                rM = rL * rz,
                rN = 0xf * (0x1 - rL),
                rO = Math[xJ(0xd3d)](rM) * rN,
                rP = Math[xJ(0x46b)](rM) * rN,
                rQ = rI + rO,
                rR = rJ + rP;
              rq[xJ(0xbb6)](
                rI + rO * 0.5 + rP * 0.25,
                rJ + rP * 0.5 - rO * 0.25,
                rQ,
                rR
              ),
                (rI = rQ),
                (rJ = rR);
            }
            rq[xJ(0xd07)](0x1, -0x1);
          }
          (rq[xJ(0xe5e)] = rq[xJ(0x92c)] = xJ(0x2d8)),
            (rq[xJ(0x38e)] = 0x2),
            (rq[xJ(0x9a7)] = rq[xJ(0x2d4)]),
            rq[xJ(0x2c1)](),
            rq[xJ(0xa10)](),
            rq[xJ(0xa10)]();
        }
        [uf(0x9fe)](rq, rr = 0x64, rs = 0x50, rt = 0x12, ru = 0x8) {
          const xK = uf;
          rq[xK(0xc3a)]();
          const rv = (0x1 / rt) * Math["PI"] * 0x2;
          rq[xK(0xd7c)](rs, 0x0);
          for (let rw = 0x0; rw < rt; rw++) {
            const rx = rw * rv,
              ry = (rw + 0x1) * rv;
            rq[xK(0xc43)](
              Math[xK(0xd3d)](rx) * rr,
              Math[xK(0x46b)](rx) * rr,
              Math[xK(0xd3d)](ry) * rr,
              Math[xK(0x46b)](ry) * rr,
              Math[xK(0xd3d)](ry) * rs,
              Math[xK(0x46b)](ry) * rs
            );
          }
          (rq[xK(0x2d4)] = this[xK(0x40c)](xK(0xd58))),
            rq[xK(0xec9)](),
            (rq[xK(0x38e)] = ru),
            (rq[xK(0xe5e)] = rq[xK(0x92c)] = xK(0x2d8)),
            (rq[xK(0x9a7)] = this[xK(0x40c)](xK(0xba0))),
            rq[xK(0x2c1)]();
        }
        [uf(0x40c)](rq) {
          const xL = uf,
            rr = 0x1 - this[xL(0x72e)];
          if (
            rr >= 0x1 &&
            this[xL(0xaf0)] === 0x0 &&
            !this[xL(0x28e)] &&
            !this[xL(0x9bc)]
          )
            return rq;
          rq = hA(rq);
          this[xL(0x28e)] &&
            (rq = hy(
              rq,
              [0xff, 0xff, 0xff],
              0.85 + Math[xL(0x46b)](pz / 0x32) * 0.15
            ));
          this[xL(0xaf0)] > 0x0 &&
            (rq = hy(rq, [0x8f, 0x5d, 0xb0], 0x1 - this[xL(0xaf0)] * 0.75));
          rq = hy(rq, [0xff, 0x0, 0x0], rr * 0.25 + 0.75);
          if (this[xL(0x9bc)]) {
            if (!this[xL(0x73f)]) {
              let rs = pz / 0x4;
              if (!isNaN(this["id"])) rs += this["id"];
              this[xL(0x73f)] = lH(rs % 0x168, 0x64, 0x32);
            }
            rq = hy(rq, this[xL(0x73f)], 0.75);
          }
          return pL(rq);
        }
        [uf(0x8ac)](rq) {
          const xM = uf;
          this[xM(0x73f)] = null;
          if (this[xM(0x613)]) {
            const rr = Math[xM(0x46b)]((this[xM(0x69a)] * Math["PI"]) / 0x2);
            if (!this[xM(0x775)]) {
              const rs = 0x1 + rr * 0x1;
              rq[xM(0xd07)](rs, rs);
            }
            rq[xM(0x28b)] *= 0x1 - rr;
          }
        }
        [uf(0xde1)](rq, rr = !![], rs = 0x1) {
          const xN = uf;
          rq[xN(0xc3a)](),
            (rs = 0x8 * rs),
            rq[xN(0xd7c)](0x23, -rs),
            rq[xN(0xbb6)](0x33, -0x2 - rs, 0x3c, -0xc - rs),
            rq[xN(0xbc9)](0x23, -rs),
            rq[xN(0xd7c)](0x23, rs),
            rq[xN(0xbb6)](0x33, 0x2 + rs, 0x3c, 0xc + rs),
            rq[xN(0xbc9)](0x23, rs);
          const rt = xN(0x6bd);
          (rq[xN(0x2d4)] = rq[xN(0x9a7)] =
            rr ? this[xN(0x40c)](rt) : xN(0x6bd)),
            rq[xN(0xec9)](),
            (rq[xN(0xe5e)] = rq[xN(0x92c)] = xN(0x2d8)),
            (rq[xN(0x38e)] = 0x4),
            rq[xN(0x2c1)]();
        }
        [uf(0xebf)](rq, rr, rs = 0x1) {
          const xO = uf,
            rt = (rr / 0x1e) * 1.1;
          rq[xO(0xd07)](rt, rt),
            rq[xO(0xc3a)](),
            rq[xO(0xd7c)](-0x1e, -0x11),
            rq[xO(0xbc9)](0x1e, 0x0),
            rq[xO(0xbc9)](-0x1e, 0x11),
            rq[xO(0x5fb)](),
            (rq[xO(0x2d4)] = rq[xO(0x9a7)] = this[xO(0x40c)](xO(0x6bd))),
            rq[xO(0xec9)](),
            (rq[xO(0x38e)] = 0x14 * rs),
            (rq[xO(0xe5e)] = rq[xO(0x92c)] = xO(0x2d8)),
            rq[xO(0x2c1)]();
        }
        [uf(0x522)](rq, rr = 0x0, rs = 0x0, rt = 0x1, ru = 0x5) {
          const xP = uf;
          rq[xP(0xc61)](),
            rq[xP(0xd15)](rr, rs),
            rq[xP(0xd07)](rt, rt),
            rq[xP(0xc3a)](),
            rq[xP(0xd7c)](0x23, -0x8),
            rq[xP(0xbb6)](0x34, -5.5, 0x3c, -0x14),
            rq[xP(0xd7c)](0x23, 0x8),
            rq[xP(0xbb6)](0x34, 5.5, 0x3c, 0x14),
            (rq[xP(0x2d4)] = rq[xP(0x9a7)] = this[xP(0x40c)](xP(0x6bd))),
            (rq[xP(0xe5e)] = rq[xP(0x92c)] = xP(0x2d8)),
            (rq[xP(0x38e)] = ru),
            rq[xP(0x2c1)](),
            rq[xP(0xc3a)]();
          const rv = Math["PI"] * 0.165;
          rq[xP(0x3e8)](0x3c, -0x14, 0x7, 0x9, rv, 0x0, l0),
            rq[xP(0x3e8)](0x3c, 0x14, 0x7, 0x9, -rv, 0x0, l0),
            rq[xP(0xec9)](),
            rq[xP(0xa10)]();
        }
      },
      lH = (rq, rr, rs) => {
        const xQ = uf;
        (rr /= 0x64), (rs /= 0x64);
        const rt = (rw) => (rw + rq / 0x1e) % 0xc,
          ru = rr * Math[xQ(0x36c)](rs, 0x1 - rs),
          rv = (rw) =>
            rs -
            ru *
              Math[xQ(0x525)](
                -0x1,
                Math[xQ(0x36c)](
                  rt(rw) - 0x3,
                  Math[xQ(0x36c)](0x9 - rt(rw), 0x1)
                )
              );
        return [0xff * rv(0x0), 0xff * rv(0x8), 0xff * rv(0x4)];
      };
    function lI(rq) {
      const xR = uf;
      return -(Math[xR(0xd3d)](Math["PI"] * rq) - 0x1) / 0x2;
    }
    function lJ(rq, rr, rs = 0x6, rt = uf(0x7da)) {
      const xS = uf,
        ru = rr / 0x64;
      rq[xS(0xd07)](ru, ru), rq[xS(0xc3a)]();
      for (let rv = 0x0; rv < 0xc; rv++) {
        rq[xS(0xd7c)](0x0, 0x0);
        const rw = (rv / 0xc) * Math["PI"] * 0x2;
        rq[xS(0xbc9)](Math[xS(0xd3d)](rw) * 0x64, Math[xS(0x46b)](rw) * 0x64);
      }
      (rq[xS(0x38e)] = rs),
        (rq[xS(0x2d4)] = rq[xS(0x9a7)] = rt),
        (rq[xS(0xe5e)] = rq[xS(0x92c)] = xS(0x2d8));
      for (let rx = 0x0; rx < 0x5; rx++) {
        const ry = (rx / 0x5) * 0x64 + 0xa;
        lb(rq, 0xc, ry, 0.5, 0.85);
      }
      rq[xS(0x2c1)]();
    }
    var lK = class {
        constructor(rq, rr, rs, rt, ru) {
          const xT = uf;
          (this[xT(0x2dc)] = rq),
            (this["id"] = rr),
            (this["x"] = rs),
            (this["y"] = rt),
            (this[xT(0xc39)] = ru),
            (this[xT(0x297)] = Math[xT(0xa69)]() * l0),
            (this[xT(0x408)] = -0x1),
            (this[xT(0x613)] = ![]),
            (this[xT(0x261)] = 0x0),
            (this[xT(0x69a)] = 0x0),
            (this[xT(0x71a)] = !![]),
            (this[xT(0xe4f)] = 0x0),
            (this[xT(0xb21)] = !![]);
        }
        [uf(0x30b)]() {
          const xU = uf;
          if (this[xU(0x261)] < 0x1) {
            this[xU(0x261)] += pA / 0xc8;
            if (this[xU(0x261)] > 0x1) this[xU(0x261)] = 0x1;
          }
          this[xU(0x613)] && (this[xU(0x69a)] += pA / 0xc8);
        }
        [uf(0xc34)](rq) {
          const xV = uf;
          rq[xV(0xc61)](), rq[xV(0xd15)](this["x"], this["y"]);
          if (this[xV(0x2dc)] === cS[xV(0xdb4)]) {
            rq[xV(0xa38)](this[xV(0x297)]);
            const rr = this[xV(0xc39)],
              rs = pq(
                rq,
                xV(0xbbc) + this[xV(0xc39)],
                rr * 2.2,
                rr * 2.2,
                (ru) => {
                  const xW = xV;
                  ru[xW(0xd15)](rr * 1.1, rr * 1.1), lJ(ru, rr);
                },
                !![]
              ),
              rt = this[xV(0x261)] + this[xV(0x69a)] * 0.5;
            (rq[xV(0x28b)] = (0x1 - this[xV(0x69a)]) * 0.3),
              rq[xV(0xd07)](rt, rt),
              rq[xV(0x4e8)](
                rs,
                -rs[xV(0xa06)] / 0x2,
                -rs[xV(0x859)] / 0x2,
                rs[xV(0xa06)],
                rs[xV(0x859)]
              );
          } else {
            if (this[xV(0x2dc)] === cS[xV(0x3aa)]) {
              let ru = this[xV(0x261)] + this[xV(0x69a)] * 0.5;
              (rq[xV(0x28b)] = 0x1 - this[xV(0x69a)]), (rq[xV(0x28b)] *= 0.9);
              const rv =
                0.93 +
                0.07 *
                  (Math[xV(0x46b)](
                    Date[xV(0x796)]() / 0x190 + this["x"] + this["y"]
                  ) *
                    0.5 +
                    0.5);
              ru *= rv;
              const rw = this[xV(0xc39)],
                rx = pq(
                  rq,
                  xV(0x4f8) + this[xV(0xc39)],
                  rw * 2.2,
                  rw * 2.2,
                  (ry) => {
                    const xX = xV;
                    ry[xX(0xd15)](rw * 1.1, rw * 1.1);
                    const rz = rw / 0x64;
                    ry[xX(0xd07)](rz, rz),
                      lE(ry, 0x5c),
                      (ry[xX(0x92c)] = ry[xX(0xe5e)] = xX(0x2d8)),
                      (ry[xX(0x38e)] = 0x28),
                      (ry[xX(0x9a7)] = xX(0x809)),
                      ry[xX(0x2c1)](),
                      (ry[xX(0x2d4)] = xX(0x490)),
                      (ry[xX(0x9a7)] = xX(0xed4)),
                      (ry[xX(0x38e)] = 0xe),
                      ry[xX(0xec9)](),
                      ry[xX(0x2c1)]();
                  },
                  !![]
                );
              rq[xV(0xd07)](ru, ru),
                rq[xV(0x4e8)](
                  rx,
                  -rx[xV(0xa06)] / 0x2,
                  -rx[xV(0x859)] / 0x2,
                  rx[xV(0xa06)],
                  rx[xV(0x859)]
                );
            } else {
              if (this[xV(0x2dc)] === cS[xV(0x588)]) {
                rq[xV(0x264)](this[xV(0xc39)] / 0x32),
                  (rq[xV(0x92c)] = xV(0x2d8)),
                  rq[xV(0xc61)](),
                  (this[xV(0xe4f)] +=
                    ((this[xV(0x408)] >= 0x0 ? 0x1 : -0x1) * pA) / 0x12c),
                  (this[xV(0xe4f)] = Math[xV(0x36c)](
                    0x1,
                    Math[xV(0x525)](0x0, this[xV(0xe4f)])
                  ));
                if (this[xV(0xe4f)] > 0x0) {
                  rq[xV(0x264)](this[xV(0xe4f)]),
                    (rq[xV(0x28b)] *= this[xV(0xe4f)]),
                    (rq[xV(0x38e)] = 0.1),
                    (rq[xV(0x9a7)] = rq[xV(0x2d4)] = xV(0x650)),
                    (rq[xV(0x52f)] = xV(0x328)),
                    (rq[xV(0x98b)] = xV(0x6c3) + iA);
                  const rz = xV(0x5d2) + (this[xV(0x408)] + 0x1);
                  lR(
                    rq,
                    rz,
                    0x0,
                    0x0,
                    0x50,
                    Math["PI"] * (rz[xV(0x4cf)] * 0.09),
                    !![]
                  );
                }
                rq[xV(0xa10)]();
                const ry = this[xV(0x919)]
                  ? 0.6
                  : ((this["id"] + Date[xV(0x796)]()) / 0x4b0) % 6.28;
                rq[xV(0xc61)]();
                for (let rA = 0x0; rA < 0x8; rA++) {
                  const rB = 0x1 - rA / 0x8,
                    rC = rB * 0x50;
                  rq[xV(0xa38)](ry),
                    (rq[xV(0x9a7)] = xV(0x754)),
                    rq[xV(0xc3a)](),
                    rq[xV(0x942)](-rC / 0x2, -rC / 0x2, rC, rC),
                    rq[xV(0x5fb)](),
                    (rq[xV(0x38e)] = 0x28),
                    rq[xV(0x2c1)](),
                    (rq[xV(0x38e)] = 0x14),
                    rq[xV(0x2c1)]();
                }
                rq[xV(0xa10)]();
                if (!this[xV(0x4f2)]) {
                  this[xV(0x4f2)] = [];
                  for (let rD = 0x0; rD < 0x1e; rD++) {
                    this[xV(0x4f2)][xV(0x9ee)]({
                      x: Math[xV(0xa69)]() + 0x1,
                      v: 0x0,
                    });
                  }
                }
                for (let rE = 0x0; rE < this[xV(0x4f2)][xV(0x4cf)]; rE++) {
                  const rF = this[xV(0x4f2)][rE];
                  (rF["x"] += rF["v"]),
                    rF["x"] > 0x1 &&
                      ((rF["x"] %= 0x1),
                      (rF[xV(0x297)] = Math[xV(0xa69)]() * 6.28),
                      (rF["v"] = Math[xV(0xa69)]() * 0.005 + 0.008),
                      (rF["s"] = Math[xV(0xa69)]() * 0.025 + 0.008)),
                    rq[xV(0xc61)](),
                    (rq[xV(0x28b)] =
                      rF["x"] < 0.2
                        ? rF["x"] / 0.2
                        : rF["x"] > 0.8
                        ? 0x1 - (rF["x"] - 0.8) / 0.2
                        : 0x1),
                    rq[xV(0xd07)](0x5a, 0x5a),
                    rq[xV(0xa38)](rF[xV(0x297)]),
                    rq[xV(0xd15)](rF["x"], 0x0),
                    rq[xV(0xc3a)](),
                    rq[xV(0x54b)](0x0, 0x0, rF["s"], 0x0, Math["PI"] * 0x2),
                    (rq[xV(0x2d4)] = xV(0x650)),
                    rq[xV(0xec9)](),
                    rq[xV(0xa10)]();
                }
              }
            }
          }
          rq[xV(0xa10)]();
        }
      },
      lL = 0x0,
      lM = 0x0,
      lN = class extends lK {
        constructor(rq, rr, rs, rt) {
          const xY = uf;
          super(cS[xY(0x4c0)], rq, rr, rs, 0x46),
            (this[xY(0x297)] = (Math[xY(0xa69)]() * 0x2 - 0x1) * 0.2),
            (this[xY(0x45d)] = dC[rt]);
        }
        [uf(0x30b)]() {
          const xZ = uf;
          if (this[xZ(0x261)] < 0x2 || pz - lL < 0x9c4) {
            this[xZ(0x261)] += pA / 0x12c;
            return;
          }
          this[xZ(0x613)] && (this[xZ(0x69a)] += pA / 0xc8),
            this[xZ(0x6f7)] &&
              ((this["x"] = pg(this["x"], this[xZ(0x6f7)]["x"], 0xc8)),
              (this["y"] = pg(this["y"], this[xZ(0x6f7)]["y"], 0xc8)));
        }
        [uf(0xc34)](rq) {
          const y0 = uf;
          if (this[y0(0x261)] === 0x0) return;
          rq[y0(0xc61)](), rq[y0(0xd15)](this["x"], this["y"]);
          const rr = y0(0x473) + this[y0(0x45d)]["id"];
          let rs =
            (this[y0(0x825)] || lM < 0x3) &&
            pq(
              rq,
              rr,
              0x78,
              0x78,
              (rv) => {
                const y1 = y0;
                (this[y1(0x825)] = !![]),
                  lM++,
                  rv[y1(0xd15)](0x3c, 0x3c),
                  (rv[y1(0xe5e)] = rv[y1(0x92c)] = y1(0x2d8)),
                  rv[y1(0xc3a)](),
                  rv[y1(0x942)](-0x32, -0x32, 0x64, 0x64),
                  (rv[y1(0x38e)] = 0x12),
                  (rv[y1(0x9a7)] = y1(0xde5)),
                  rv[y1(0x2c1)](),
                  (rv[y1(0x38e)] = 0x8),
                  (rv[y1(0x2d4)] = hQ[this[y1(0x45d)][y1(0xb9c)]]),
                  rv[y1(0xec9)](),
                  (rv[y1(0x9a7)] = hR[this[y1(0x45d)][y1(0xb9c)]]),
                  rv[y1(0x2c1)]();
                const rw = pt(
                  rv,
                  this[y1(0x45d)][y1(0x786)],
                  0x12,
                  y1(0x7da),
                  0x3,
                  !![]
                );
                rv[y1(0x4e8)](
                  rw,
                  -rw[y1(0xa06)] / 0x2,
                  0x32 - 0xd / 0x2 - rw[y1(0x859)],
                  rw[y1(0xa06)],
                  rw[y1(0x859)]
                ),
                  rv[y1(0xc61)](),
                  rv[y1(0xd15)](
                    0x0 + this[y1(0x45d)][y1(0x73e)],
                    -0x5 + this[y1(0x45d)][y1(0x603)]
                  ),
                  this[y1(0x45d)][y1(0x461)](rv),
                  rv[y1(0xa10)]();
              },
              !![]
            );
          if (!rs) rs = pp[rr];
          rq[y0(0xa38)](this[y0(0x297)]);
          const rt = Math[y0(0x36c)](this[y0(0x261)], 0x1),
            ru =
              (this[y0(0xc39)] / 0x64) *
              (0x1 +
                Math[y0(0x46b)](Date[y0(0x796)]() / 0xfa + this["id"]) * 0.05) *
              rt *
              (0x1 - this[y0(0x69a)]);
          rq[y0(0xd07)](ru, ru),
            rq[y0(0xa38)](Math["PI"] * lI(0x1 - rt)),
            rs
              ? rq[y0(0x4e8)](
                  rs,
                  -rs[y0(0xa06)] / 0x2,
                  -rs[y0(0x859)] / 0x2,
                  rs[y0(0xa06)],
                  rs[y0(0x859)]
                )
              : (rq[y0(0xc3a)](),
                rq[y0(0x942)](-0x3c, -0x3c, 0x78, 0x78),
                (rq[y0(0x2d4)] = hQ[this[y0(0x45d)][y0(0xb9c)]]),
                rq[y0(0xec9)]()),
            rq[y0(0xa10)]();
        }
      };
    function lO(rq) {
      const y2 = uf;
      rq[y2(0xc3a)](),
        rq[y2(0xd7c)](0x0, 4.5),
        rq[y2(0xbb6)](3.75, 0x0, 0x0, -4.5),
        rq[y2(0xbb6)](-3.75, 0x0, 0x0, 4.5),
        rq[y2(0x5fb)](),
        (rq[y2(0xe5e)] = rq[y2(0x92c)] = y2(0x2d8)),
        (rq[y2(0x2d4)] = rq[y2(0x9a7)] = y2(0xe26)),
        (rq[y2(0x38e)] = 0x1),
        rq[y2(0x2c1)](),
        rq[y2(0xec9)](),
        rq[y2(0x94c)](),
        rq[y2(0xc3a)](),
        rq[y2(0x54b)](0x0 * 1.7, 0x0 * 0x3, 0x2, 0x0, l0),
        (rq[y2(0x2d4)] = y2(0x374)),
        rq[y2(0xec9)]();
    }
    function lP(rq, rr = ![]) {
      const y3 = uf;
      lQ(rq, -Math["PI"] / 0x5, Math["PI"] / 0x16),
        lQ(rq, Math["PI"] / 0x5, -Math["PI"] / 0x16);
      if (rr) {
        const rs = Math["PI"] / 0x7;
        rq[y3(0xc3a)](),
          rq[y3(0x54b)](0x0, 0x0, 23.5, Math["PI"] + rs, Math["PI"] * 0x2 - rs),
          (rq[y3(0x9a7)] = y3(0x386)),
          (rq[y3(0x38e)] = 0x4),
          (rq[y3(0xe5e)] = y3(0x2d8)),
          rq[y3(0x2c1)]();
      }
    }
    function lQ(rq, rr, rs) {
      const y4 = uf;
      rq[y4(0xc61)](),
        rq[y4(0xa38)](rr),
        rq[y4(0xd15)](0x0, -23.6),
        rq[y4(0xa38)](rs),
        rq[y4(0xc3a)](),
        rq[y4(0xd7c)](-6.5, 0x1),
        rq[y4(0xbc9)](0x0, -0xf),
        rq[y4(0xbc9)](6.5, 0x1),
        (rq[y4(0x2d4)] = y4(0xe30)),
        (rq[y4(0x38e)] = 3.5),
        rq[y4(0xec9)](),
        (rq[y4(0x92c)] = y4(0x2d8)),
        (rq[y4(0x9a7)] = y4(0x386)),
        rq[y4(0x2c1)](),
        rq[y4(0xa10)]();
    }
    function lR(rq, rr, rs, rt, ru, rv, rw = ![]) {
      const y5 = uf;
      var rx = rr[y5(0x4cf)],
        ry;
      rq[y5(0xc61)](),
        rq[y5(0xd15)](rs, rt),
        rq[y5(0xa38)]((0x1 * rv) / 0x2),
        rq[y5(0xa38)]((0x1 * (rv / rx)) / 0x2),
        (rq[y5(0x7cd)] = y5(0x928));
      for (var rz = 0x0; rz < rx; rz++) {
        rq[y5(0xa38)](-rv / rx),
          rq[y5(0xc61)](),
          rq[y5(0xd15)](0x0, ru),
          (ry = rr[rz]),
          rw && rq[y5(0x5e4)](ry, 0x0, 0x0),
          rq[y5(0x512)](ry, 0x0, 0x0),
          rq[y5(0xa10)]();
      }
      rq[y5(0xa10)]();
    }
    function lS(rq, rr = 0x1) {
      const y6 = uf,
        rs = 0xf;
      rq[y6(0xc3a)]();
      const rt = 0x6;
      for (let ry = 0x0; ry < rt; ry++) {
        const rz = (ry / rt) * Math["PI"] * 0x2;
        rq[y6(0xbc9)](Math[y6(0xd3d)](rz) * rs, Math[y6(0x46b)](rz) * rs);
      }
      rq[y6(0x5fb)](),
        (rq[y6(0x38e)] = 0x4),
        (rq[y6(0x9a7)] = y6(0xb64)),
        rq[y6(0x2c1)](),
        (rq[y6(0x2d4)] = y6(0x433)),
        rq[y6(0xec9)]();
      const ru = (Math["PI"] * 0x2) / rt,
        rv = Math[y6(0xd3d)](ru) * rs,
        rw = Math[y6(0x46b)](ru) * rs;
      for (let rA = 0x0; rA < rt; rA++) {
        rq[y6(0xc3a)](),
          rq[y6(0xd7c)](0x0, 0x0),
          rq[y6(0xbc9)](rs, 0x0),
          rq[y6(0xbc9)](rv, rw),
          rq[y6(0x5fb)](),
          (rq[y6(0x2d4)] =
            y6(0x6a0) + (0.2 + (((rA + 0x4) % rt) / rt) * 0.35) + ")"),
          rq[y6(0xec9)](),
          rq[y6(0xa38)](ru);
      }
      rq[y6(0xc3a)]();
      const rx = rs * 0.65;
      for (let rB = 0x0; rB < rt; rB++) {
        const rC = (rB / rt) * Math["PI"] * 0x2;
        rq[y6(0xbc9)](Math[y6(0xd3d)](rC) * rx, Math[y6(0x46b)](rC) * rx);
      }
      (rq[y6(0x57d)] = 0x23 + rr * 0xf),
        (rq[y6(0xcb6)] = rq[y6(0x2d4)] = y6(0x733)),
        rq[y6(0xec9)](),
        rq[y6(0xec9)](),
        rq[y6(0xec9)]();
    }
    var lT = class extends lG {
        constructor(rq, rr, rs, rt, ru, rv, rw) {
          const y7 = uf;
          super(rq, cS[y7(0xec1)], rr, rs, rt, rw, ru),
            (this[y7(0xe42)] = rv),
            (this[y7(0xe3c)] = 0x0),
            (this[y7(0x4f3)] = 0x0),
            (this[y7(0xd04)] = 0x0),
            (this[y7(0x28f)] = 0x0),
            (this[y7(0xb82)] = ""),
            (this[y7(0xabe)] = 0x0),
            (this[y7(0xd7e)] = !![]),
            (this[y7(0x4b3)] = ![]),
            (this[y7(0x1df)] = ![]),
            (this[y7(0xdbd)] = ![]),
            (this[y7(0x7d4)] = ![]),
            (this[y7(0xab4)] = ![]),
            (this[y7(0xc87)] = !![]),
            (this[y7(0x7ce)] = 0x0),
            (this[y7(0x31f)] = 0x0);
        }
        [uf(0x30b)]() {
          const y8 = uf;
          super[y8(0x30b)]();
          if (this[y8(0x613)]) (this[y8(0x4f3)] = 0x1), (this[y8(0xe3c)] = 0x0);
          else {
            const rq = pA / 0xc8;
            let rr = this[y8(0xe42)];
            if (this[y8(0x4b3)] && rr === cY[y8(0xcdb)]) rr = cY[y8(0xb28)];
            (this[y8(0xe3c)] = Math[y8(0x36c)](
              0x1,
              Math[y8(0x525)](
                0x0,
                this[y8(0xe3c)] + (rr === cY[y8(0x882)] ? rq : -rq)
              )
            )),
              (this[y8(0x4f3)] = Math[y8(0x36c)](
                0x1,
                Math[y8(0x525)](
                  0x0,
                  this[y8(0x4f3)] + (rr === cY[y8(0xb28)] ? rq : -rq)
                )
              )),
              (this[y8(0x7ce)] = pg(this[y8(0x7ce)], this[y8(0x31f)], 0x64));
          }
        }
        [uf(0xc34)](rq) {
          const y9 = uf;
          rq[y9(0xc61)](), rq[y9(0xd15)](this["x"], this["y"]);
          let rr = this[y9(0xc39)] / kZ;
          this[y9(0x613)] &&
            rq[y9(0xa38)]((this[y9(0x69a)] * Math["PI"]) / 0x4);
          rq[y9(0xd07)](rr, rr), this[y9(0x8ac)](rq);
          this[y9(0xd31)] &&
            (rq[y9(0xc61)](),
            rq[y9(0xa38)](this[y9(0x297)]),
            rq[y9(0x264)](this[y9(0xc39)] / 0x28 / rr),
            this[y9(0x36d)](rq),
            rq[y9(0xa10)]());
          this[y9(0x936)] &&
            (rq[y9(0xc61)](),
            rq[y9(0x264)](kZ / 0x12),
            this[y9(0x1ed)](rq, pz / 0x12c),
            rq[y9(0xa10)]());
          const rs = y9(0x386);
          if (this[y9(0xdfb)]) {
            const rC = Date[y9(0x796)](),
              rD = (Math[y9(0x46b)](rC / 0x12c) * 0.5 + 0.5) * 0x2;
            rq[y9(0xc3a)](),
              rq[y9(0xd7c)](0x5, -0x22),
              rq[y9(0xc43)](0x2f, -0x19, 0x14, 0x5, 0x2b - rD, 0x19),
              rq[y9(0xbb6)](0x0, 0x28 + rD * 0.6, -0x2b + rD, 0x19),
              rq[y9(0xc43)](-0x14, 0x5, -0x2f, -0x19, -0x5, -0x22),
              rq[y9(0xbb6)](0x0, -0x23, 0x5, -0x22),
              (rq[y9(0x2d4)] = rs),
              rq[y9(0xec9)]();
          }
          this[y9(0xab4)] && lP(rq);
          const rt = this[y9(0x7d4)]
            ? [y9(0x774), y9(0x6bd)]
            : this[y9(0xadd)]
            ? [y9(0x8e0), y9(0xd8e)]
            : [y9(0x52b), y9(0x914)];
          (rt[0x0] = this[y9(0x40c)](rt[0x0])),
            (rt[0x1] = this[y9(0x40c)](rt[0x1]));
          let ru = 2.75;
          !this[y9(0xadd)] && (ru /= rr);
          (rq[y9(0x2d4)] = rt[0x0]),
            (rq[y9(0x38e)] = ru),
            (rq[y9(0x9a7)] = rt[0x1]);
          this[y9(0xadd)] &&
            (rq[y9(0xc3a)](),
            rq[y9(0xd7c)](0x0, 0x0),
            rq[y9(0xbb6)](-0x1e, 0xf, -0x1e, 0x1e),
            rq[y9(0xbb6)](0x0, 0x37, 0x1e, 0x1e),
            rq[y9(0xbb6)](0x1e, 0xf, 0x0, 0x0),
            rq[y9(0xec9)](),
            rq[y9(0x2c1)](),
            rq[y9(0xc61)](),
            (rq[y9(0x2d4)] = rq[y9(0x9a7)]),
            (rq[y9(0x52f)] = y9(0x328)),
            (rq[y9(0x98b)] = y9(0xc67) + iA),
            lR(rq, y9(0x8b6), 0x0, 0x0, 0x1c, Math["PI"] * 0.5),
            rq[y9(0xa10)]());
          rq[y9(0xc3a)]();
          this[y9(0x876)]
            ? !this[y9(0xdfb)]
              ? rq[y9(0x942)](-0x19, -0x19, 0x32, 0x32)
              : (rq[y9(0xd7c)](0x19, 0x19),
                rq[y9(0xbc9)](-0x19, 0x19),
                rq[y9(0xbc9)](-0x19, -0xa),
                rq[y9(0xbc9)](-0xa, -0x19),
                rq[y9(0xbc9)](0xa, -0x19),
                rq[y9(0xbc9)](0x19, -0xa),
                rq[y9(0x5fb)]())
            : rq[y9(0x54b)](0x0, 0x0, kZ, 0x0, l0);
          rq[y9(0xec9)](), rq[y9(0x2c1)]();
          this[y9(0x275)] &&
            (rq[y9(0xc61)](),
            rq[y9(0x94c)](),
            rq[y9(0xc3a)](),
            !this[y9(0xdfb)] &&
              (rq[y9(0xd7c)](-0x8, -0x1e),
              rq[y9(0xbc9)](0xf, -0x7),
              rq[y9(0xbc9)](0x1e, -0x14),
              rq[y9(0xbc9)](0x1e, -0x32)),
            rq[y9(0xd15)](
              0x0,
              0x2 * (0x1 - (this[y9(0x4f3)] + this[y9(0xe3c)]))
            ),
            rq[y9(0xd7c)](-0x2, 0x0),
            rq[y9(0xbc9)](-0x3, 4.5),
            rq[y9(0xbc9)](0x3, 4.5),
            rq[y9(0xbc9)](0x2, 0x0),
            (rq[y9(0x2d4)] = y9(0xe26)),
            rq[y9(0xec9)](),
            rq[y9(0xa10)]());
          this[y9(0xdfb)] &&
            (rq[y9(0xc3a)](),
            rq[y9(0xd7c)](0x0, -0x17),
            rq[y9(0xbb6)](0x4, -0xd, 0x1b, -0x8),
            rq[y9(0xbc9)](0x14, -0x1c),
            rq[y9(0xbc9)](-0x14, -0x1c),
            rq[y9(0xbc9)](-0x1b, -0x8),
            rq[y9(0xbb6)](-0x4, -0xd, 0x0, -0x17),
            (rq[y9(0x2d4)] = rs),
            rq[y9(0xec9)]());
          if (this[y9(0x2cf)]) {
            (rq[y9(0x9a7)] = y9(0xdff)),
              (rq[y9(0x38e)] = 1.4),
              rq[y9(0xc3a)](),
              (rq[y9(0xe5e)] = y9(0x2d8));
            const rE = 4.5;
            for (let rF = 0x0; rF < 0x2; rF++) {
              const rG = -0x12 + rF * 0x1d;
              for (let rH = 0x0; rH < 0x3; rH++) {
                const rI = rG + rH * 0x3;
                rq[y9(0xd7c)](rI, rE + -1.5), rq[y9(0xbc9)](rI + 1.6, rE + 1.6);
              }
            }
            rq[y9(0x2c1)]();
          }
          if (this[y9(0xd01)]) {
            rq[y9(0xc3a)](),
              rq[y9(0x54b)](0x0, 2.5, 3.3, 0x0, l0),
              (rq[y9(0x2d4)] = y9(0x41e)),
              rq[y9(0xec9)](),
              rq[y9(0xc3a)](),
              rq[y9(0x54b)](0xd, 2.8, 5.5, 0x0, l0),
              rq[y9(0x54b)](-0xd, 2.8, 5.5, 0x0, l0),
              (rq[y9(0x2d4)] = y9(0x3ff)),
              rq[y9(0xec9)](),
              rq[y9(0xc61)](),
              rq[y9(0xa38)](-Math["PI"] / 0x4),
              rq[y9(0xc3a)]();
            const rJ = [
              [0x19, -0x4, 0x5],
              [0x19, 0x4, 0x5],
              [0x1e, 0x0, 4.5],
            ];
            this[y9(0x876)] &&
              rJ[y9(0xbed)]((rK) => {
                (rK[0x0] *= 1.1), (rK[0x1] *= 1.1);
              });
            for (let rK = 0x0; rK < 0x2; rK++) {
              for (let rL = 0x0; rL < rJ[y9(0x4cf)]; rL++) {
                const rM = rJ[rL];
                rq[y9(0xd7c)](rM[0x0], rM[0x1]), rq[y9(0x54b)](...rM, 0x0, l0);
              }
              rq[y9(0xa38)](-Math["PI"] / 0x2);
            }
            (rq[y9(0x2d4)] = y9(0x547)), rq[y9(0xec9)](), rq[y9(0xa10)]();
          }
          const rv = this[y9(0xe3c)],
            rw = this[y9(0x4f3)],
            rx = 0x6 * rv,
            ry = 0x4 * rw;
          function rz(rN, rO) {
            const ya = y9;
            rq[ya(0xc3a)]();
            const rP = 3.25;
            rq[ya(0xd7c)](rN - rP, rO - rP),
              rq[ya(0xbc9)](rN + rP, rO + rP),
              rq[ya(0xd7c)](rN + rP, rO - rP),
              rq[ya(0xbc9)](rN - rP, rO + rP),
              (rq[ya(0x38e)] = 0x2),
              (rq[ya(0xe5e)] = ya(0x2d8)),
              (rq[ya(0x9a7)] = ya(0xe26)),
              rq[ya(0x2c1)](),
              rq[ya(0x5fb)]();
          }
          function rA(rN, rO) {
            const yb = y9;
            rq[yb(0xc61)](),
              rq[yb(0xd15)](rN, rO),
              rq[yb(0xc3a)](),
              rq[yb(0xd7c)](-0x4, 0x0),
              rq[yb(0xbb6)](0x0, 0x6, 0x4, 0x0),
              (rq[yb(0x38e)] = 0x2),
              (rq[yb(0xe5e)] = yb(0x2d8)),
              (rq[yb(0x9a7)] = yb(0xe26)),
              rq[yb(0x2c1)](),
              rq[yb(0xa10)]();
          }
          if (this[y9(0x613)]) rz(0x7, -0x5), rz(-0x7, -0x5);
          else {
            if (this[y9(0x5d5)]) rA(0x7, -0x5), rA(-0x7, -0x5);
            else {
              let rN = function (rP, rQ, rR, rS, rT = 0x0) {
                  const yc = y9,
                    rU = rT ^ 0x1;
                  rq[yc(0xd7c)](rP - rR, rQ - rS + rT * rx + rU * ry),
                    rq[yc(0xbc9)](rP + rR, rQ - rS + rU * rx + rT * ry),
                    rq[yc(0xbc9)](rP + rR, rQ + rS),
                    rq[yc(0xbc9)](rP - rR, rQ + rS),
                    rq[yc(0xbc9)](rP - rR, rQ - rS);
                },
                rO = function (rP = 0x0) {
                  const yd = y9;
                  rq[yd(0xc3a)](),
                    rq[yd(0x3e8)](0x7, -0x5, 2.5 + rP, 0x6 + rP, 0x0, 0x0, l0),
                    rq[yd(0xd7c)](-0x7, -0x5),
                    rq[yd(0x3e8)](-0x7, -0x5, 2.5 + rP, 0x6 + rP, 0x0, 0x0, l0),
                    (rq[yd(0x9a7)] = rq[yd(0x2d4)] = yd(0xe26)),
                    rq[yd(0xec9)]();
                };
              rq[y9(0xc61)](),
                rq[y9(0xc3a)](),
                rN(0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x1),
                rN(-0x7, -0x5, 2.4 + 1.2, 6.1 + 1.2, 0x0),
                rq[y9(0x94c)](),
                rO(0.7),
                rO(0x0),
                rq[y9(0x94c)](),
                rq[y9(0xc3a)](),
                rq[y9(0x54b)](
                  0x7 + this[y9(0xd04)] * 0x2,
                  -0x5 + this[y9(0x28f)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                rq[y9(0xd7c)](-0x7, -0x5),
                rq[y9(0x54b)](
                  -0x7 + this[y9(0xd04)] * 0x2,
                  -0x5 + this[y9(0x28f)] * 3.5,
                  3.1,
                  0x0,
                  l0
                ),
                (rq[y9(0x2d4)] = y9(0x374)),
                rq[y9(0xec9)](),
                rq[y9(0xa10)]();
            }
          }
          if (this[y9(0xdbd)]) {
            rq[y9(0xc61)](), rq[y9(0xd15)](0x0, -0xc);
            if (this[y9(0x613)]) rq[y9(0xd07)](0.7, 0.7), rz(0x0, -0x3);
            else
              this[y9(0x5d5)]
                ? (rq[y9(0xd07)](0.7, 0.7), rA(0x0, -0x3))
                : lO(rq);
            rq[y9(0xa10)]();
          }
          this[y9(0x1df)] &&
            (rq[y9(0xc61)](),
            rq[y9(0xd15)](0x0, 0xa),
            rq[y9(0xa38)](-Math["PI"] / 0x2),
            rq[y9(0xd07)](0.82, 0.82),
            this[y9(0xde1)](rq, ![], 0.85),
            rq[y9(0xa10)]());
          const rB = rv * (-0x5 - 5.5) + rw * (-0x5 - 0x4);
          rq[y9(0xc61)](),
            rq[y9(0xc3a)](),
            rq[y9(0xd15)](0x0, 9.5),
            rq[y9(0xd7c)](-5.6, 0x0),
            rq[y9(0xbb6)](0x0, 0x5 + rB, 5.6, 0x0),
            (rq[y9(0xe5e)] = y9(0x2d8));
          this[y9(0xd01)]
            ? ((rq[y9(0x38e)] = 0x7),
              (rq[y9(0x9a7)] = y9(0x41e)),
              rq[y9(0x2c1)](),
              (rq[y9(0x9a7)] = y9(0x2fe)))
            : (rq[y9(0x9a7)] = y9(0xe26));
          (rq[y9(0x38e)] = 1.75), rq[y9(0x2c1)](), rq[y9(0xa10)]();
          if (this[y9(0x5ae)]) {
            const rP = this[y9(0xe3c)],
              rQ = 0x28,
              rR = Date[y9(0x796)]() / 0x12c,
              rS = this[y9(0xadd)] ? 0x0 : Math[y9(0x46b)](rR) * 0.5 + 0.5,
              rT = rS * 0x4,
              rU = 0x28 - rS * 0x4,
              rV = rU - (this[y9(0xadd)] ? 0x1 : jf(rP)) * 0x50,
              rW = this[y9(0x275)];
            (rq[y9(0x38e)] = 0x9 + ru * 0x2),
              (rq[y9(0x92c)] = y9(0x2d8)),
              (rq[y9(0xe5e)] = y9(0x2d8));
            for (let rX = 0x0; rX < 0x2; rX++) {
              rq[y9(0xc3a)](), rq[y9(0xc61)]();
              for (let rY = 0x0; rY < 0x2; rY++) {
                rq[y9(0xd7c)](0x19, 0x0);
                let rZ = rV;
                rW && rY === 0x0 && (rZ = rU),
                  rq[y9(0xbb6)](0x2d + rT, rZ * 0.5, 0xb, rZ),
                  rq[y9(0xd07)](-0x1, 0x1);
              }
              rq[y9(0xa10)](),
                (rq[y9(0x9a7)] = rt[0x1 - rX]),
                rq[y9(0x2c1)](),
                (rq[y9(0x38e)] = 0x9);
            }
            rq[y9(0xc61)](),
              rq[y9(0xd15)](0x0, rV),
              lS(rq, rS),
              rq[y9(0xa10)]();
          }
          rq[y9(0xa10)]();
        }
        [uf(0xcb9)](rq, rr) {}
        [uf(0xb7d)](rq, rr = 0x1) {
          const ye = uf,
            rs = n4[this["id"]];
          if (!rs) return;
          for (let rt = 0x0; rt < rs[ye(0x4cf)]; rt++) {
            const ru = rs[rt];
            if (ru["t"] > lV + lW) continue;
            !ru["x"] &&
              ((ru["x"] = this["x"]),
              (ru["y"] = this["y"] - this[ye(0xc39)] - 0x44),
              (ru[ye(0xc15)] = this["x"]),
              (ru[ye(0x917)] = this["y"]));
            const rv = ru["t"] > lV ? 0x1 - (ru["t"] - lV) / lW : 0x1,
              rw = rv * rv * rv;
            (ru["x"] += (this["x"] - ru[ye(0xc15)]) * rw),
              (ru["y"] += (this["y"] - ru[ye(0x917)]) * rw),
              (ru[ye(0xc15)] = this["x"]),
              (ru[ye(0x917)] = this["y"]);
            const rx = Math[ye(0x36c)](0x1, ru["t"] / 0x64);
            rq[ye(0xc61)](),
              (rq[ye(0x28b)] = (rv < 0.7 ? rv / 0.7 : 0x1) * rx * 0.9),
              rq[ye(0xd15)](ru["x"], ru["y"] - (ru["t"] / lV) * 0x14),
              rq[ye(0x264)](rr);
            const ry = pt(rq, ru[ye(0xc5e)], 0x10, ye(0x989), 0x0, !![], ![]);
            rq[ye(0x264)](rx), rq[ye(0xc3a)]();
            const rz = ry[ye(0xa06)] + 0xa,
              rA = ry[ye(0x859)] + 0xf;
            rq[ye(0x716)]
              ? rq[ye(0x716)](-rz / 0x2, -rA / 0x2, rz, rA, 0x5)
              : rq[ye(0x942)](-rz / 0x2, -rA / 0x2, rz, rA),
              (rq[ye(0x2d4)] = ru[ye(0xb95)]),
              rq[ye(0xec9)](),
              (rq[ye(0x9a7)] = ye(0x989)),
              (rq[ye(0x38e)] = 1.5),
              rq[ye(0x2c1)](),
              rq[ye(0x4e8)](
                ry,
                -ry[ye(0xa06)] / 0x2,
                -ry[ye(0x859)] / 0x2,
                ry[ye(0xa06)],
                ry[ye(0x859)]
              ),
              rq[ye(0xa10)]();
          }
        }
      },
      lU = 0x4e20,
      lV = 0xfa0,
      lW = 0xbb8,
      lX = lV + lW;
    function lY(rq, rr, rs = 0x1) {
      const yf = uf;
      if (rq[yf(0x613)]) return;
      rr[yf(0xc61)](),
        rr[yf(0xd15)](rq["x"], rq["y"]),
        lZ(rq, rr),
        rr[yf(0xd15)](0x0, -rq[yf(0xc39)] - 0x19),
        rr[yf(0xc61)](),
        rr[yf(0x264)](rs),
        rq[yf(0xab2)] &&
          (pt(rr, "@" + rq[yf(0xab2)], 0xb, yf(0xde9), 0x3),
          rr[yf(0xd15)](0x0, -0x10)),
        rq[yf(0xb82)] &&
          (pt(rr, rq[yf(0xb82)], 0x12, yf(0x7da), 0x3),
          rr[yf(0xd15)](0x0, -0x5)),
        rr[yf(0xa10)](),
        !rq[yf(0xc87)] &&
          rq[yf(0xddf)] > 0.001 &&
          ((rr[yf(0x28b)] = rq[yf(0xddf)]),
          rr[yf(0xd07)](rq[yf(0xddf)] * 0x3, rq[yf(0xddf)] * 0x3),
          rr[yf(0xc3a)](),
          rr[yf(0x54b)](0x0, 0x0, 0x14, 0x0, l0),
          (rr[yf(0x2d4)] = yf(0xe26)),
          rr[yf(0xec9)](),
          nm(rr, 0.8),
          rr[yf(0xc3a)](),
          rr[yf(0x54b)](0x0, 0x0, 0x14, 0x0, l0),
          (rr[yf(0x2d4)] = yf(0x6e0)),
          rr[yf(0xec9)](),
          rr[yf(0xc3a)](),
          rr[yf(0xd7c)](0x0, 0x0),
          rr[yf(0x54b)](0x0, 0x0, 0x10, 0x0, l0 * rq[yf(0xb4e)]),
          rr[yf(0xbc9)](0x0, 0x0),
          rr[yf(0x94c)](),
          nm(rr, 0.8)),
        rr[yf(0xa10)]();
    }
    function lZ(rq, rr, rs = ![]) {
      const yg = uf;
      if (rq[yg(0x8bd)] <= 0x0) return;
      rr[yg(0xc61)](),
        (rr[yg(0x28b)] = rq[yg(0x8bd)]),
        (rr[yg(0x9a7)] = yg(0x386)),
        rr[yg(0xc3a)]();
      const rt = rs ? 0x8c : rq[yg(0xc87)] ? 0x4b : 0x64,
        ru = rs ? 0x1a : 0x9;
      if (rs) rr[yg(0xd15)](rq[yg(0xc39)] + 0x11, 0x0);
      else {
        const rw = Math[yg(0x525)](0x1, rq[yg(0xc39)] / 0x64);
        rr[yg(0xd07)](rw, rw),
          rr[yg(0xd15)](-rt / 0x2, rq[yg(0xc39)] / rw + 0x1b);
      }
      rr[yg(0xc3a)](),
        rr[yg(0xd7c)](rs ? -0x14 : 0x0, 0x0),
        rr[yg(0xbc9)](rt, 0x0),
        (rr[yg(0xe5e)] = yg(0x2d8)),
        (rr[yg(0x38e)] = ru),
        (rr[yg(0x9a7)] = yg(0x386)),
        rr[yg(0x2c1)]();
      function rv(rx) {
        const yh = yg;
        rr[yh(0x28b)] = rx < 0.05 ? rx / 0.05 : 0x1;
      }
      rq[yg(0x67c)] > 0x0 &&
        (rv(rq[yg(0x67c)]),
        rr[yg(0xc3a)](),
        rr[yg(0xd7c)](0x0, 0x0),
        rr[yg(0xbc9)](rq[yg(0x67c)] * rt, 0x0),
        (rr[yg(0x38e)] = ru * (rs ? 0.55 : 0.44)),
        (rr[yg(0x9a7)] = yg(0x99a)),
        rr[yg(0x2c1)]());
      rq[yg(0x2d7)] > 0x0 &&
        (rv(rq[yg(0x2d7)]),
        rr[yg(0xc3a)](),
        rr[yg(0xd7c)](0x0, 0x0),
        rr[yg(0xbc9)](rq[yg(0x2d7)] * rt, 0x0),
        (rr[yg(0x38e)] = ru * (rs ? 0.7 : 0.66)),
        (rr[yg(0x9a7)] = yg(0xbd8)),
        rr[yg(0x2c1)]());
      rq[yg(0x7ce)] &&
        (rv(rq[yg(0x7ce)]),
        rr[yg(0xc3a)](),
        rr[yg(0xd7c)](0x0, 0x0),
        rr[yg(0xbc9)](rq[yg(0x7ce)] * rt, 0x0),
        (rr[yg(0x38e)] = ru * (rs ? 0.45 : 0.35)),
        (rr[yg(0x9a7)] = yg(0x81f)),
        rr[yg(0x2c1)]());
      if (rq[yg(0xc87)]) {
        rr[yg(0x28b)] = 0x1;
        var hp = Math.round(rq.health * hack.hp);
        var shield = Math.round(rq.shield * hack.hp);
        const rx = pt(
          rr,
          `HP ${hp}${shield ? " + " + shield : ""} ` + yg(0xc14) + (rq[yg(0xabe)] + 0x1),
          rs ? 0xc : 0xe,
          yg(0x7da),
          0x3,
          !![]
        );
        if(rq.username == hack.player.name) hack.player.entity = rq;
        rr[yg(0x4e8)](
          rx,
          rt + ru / 0x2 - rx[yg(0xa06)],
          ru / 0x2,
          rx[yg(0xa06)],
          rx[yg(0x859)]
        );
        if (rs) {
          const ry = pt(rr, "@" + rq[yg(0xab2)], 0xc, yg(0xde9), 0x3, !![]);
          rr[yg(0x4e8)](
            ry,
            -ru / 0x2,
            -ru / 0x2 - ry[yg(0x859)],
            ry[yg(0xa06)],
            ry[yg(0x859)]
          );
        }
      } else {
        rr[yg(0x28b)] = 0x1;
        const rz = kc[rq[yg(0x2dc)]],
          rA = pt(rr, rz, 0xe, yg(0x7da), 0x3, !![], rq[yg(0x22e)]);
        rr[yg(0xc61)](), rr[yg(0xd15)](0x0, -ru / 0x2 - rA[yg(0x859)]);
        rA[yg(0xa06)] > rt + ru
          ? rr[yg(0x4e8)](
              rA,
              rt / 0x2 - rA[yg(0xa06)] / 0x2,
              0x0,
              rA[yg(0xa06)],
              rA[yg(0x859)]
            )
          : rr[yg(0x4e8)](rA, -ru / 0x2, 0x0, rA[yg(0xa06)], rA[yg(0x859)]);
        rr[yg(0xa10)]();
        const rB = pt(rr, rq[yg(0x22e)], 0xe, hP[rq[yg(0x22e)]], 0x3, !![]);
        rr[yg(0x4e8)](
          rB,
          rt + ru / 0x2 - rB[yg(0xa06)],
          ru / 0x2,
          rB[yg(0xa06)],
          rB[yg(0x859)]
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
        rq[yg(0xb82)] &&
        ((rr[yg(0x28b)] = 0x1),
        rr[yg(0xd15)](rt / 0x2, 0x0),
        pt(rr, rq[yg(0xb82)], 0x11, yg(0x7da), 0x3)),
        rr[yg(0xa10)]();
    }
    function m0(rq) {
      const yi = uf;
      for (let rr in op) {
        op[rr][yi(0x4da)](rq);
      }
      oI();
    }
    var m1 = {},
      m2 = document[uf(0x992)](uf(0x6ff));
    mr(uf(0x6f1), uf(0xd23), uf(0x2be)),
      mr(uf(0x2c8), uf(0x6ff), uf(0xe40)),
      mr(uf(0xed8), uf(0x5a6), uf(0xbe3), () => {
        const yj = uf;
        (hv = ![]), (hD[yj(0xbe3)] = fc);
      }),
      mr(uf(0xc32), uf(0x723), uf(0xba4)),
      mr(uf(0xded), uf(0x858), uf(0x7e3)),
      mr(uf(0x9a0), uf(0x3e6), uf(0x358)),
      mr(uf(0x683), uf(0x67f), uf(0xc65)),
      mr(uf(0x674), uf(0x1da), uf(0x878)),
      mr(uf(0x815), uf(0x33e), uf(0xd5d)),
      mr(uf(0xe11), uf(0x7c5), "lb"),
      mr(uf(0x46f), uf(0xd2d), uf(0xb5a)),
      mr(uf(0xe68), uf(0xbfb), uf(0xc7c), () => {
        const yk = uf;
        (m4[yk(0x35a)][yk(0xbe5)] = yk(0x5d0)), (hD[yk(0xc7c)] = m3);
      }),
      mr(uf(0x842), uf(0x907), uf(0x536), () => {
        const yl = uf;
        if (!hW) return;
        il(new Uint8Array([cI[yl(0xe63)]]));
      });
    var m3 = 0xb,
      m4 = document[uf(0x992)](uf(0x376));
    hD[uf(0xc7c)] == m3 && (m4[uf(0x35a)][uf(0xbe5)] = uf(0x5d0));
    var m5 = document[uf(0x992)](uf(0x729));
    m5[uf(0x35a)][uf(0xbe5)] = uf(0x5d0);
    var m6 = document[uf(0x992)](uf(0x8fc)),
      m7 = document[uf(0x992)](uf(0xebe)),
      m8 = document[uf(0x992)](uf(0xaaa));
    m8[uf(0x4fe)] = function () {
      const ym = uf;
      m5[ym(0x35a)][ym(0xbe5)] = ym(0x5d0);
    };
    var m9 = ![];
    m7[uf(0x4fe)] = ng(function (rq) {
      const yn = uf;
      if (!hW || m9 || jy) return;
      const rr = m6[yn(0x6f8)][yn(0x517)]();
      if (!rr || !eV(rr)) {
        m6[yn(0x2ae)][yn(0x218)](yn(0xddc)),
          void m6[yn(0x286)],
          m6[yn(0x2ae)][yn(0x6b1)](yn(0xddc));
        return;
      }
      (m5[yn(0x35a)][yn(0xbe5)] = ""),
        (m5[yn(0x8e1)] = yn(0xde8)),
        il(
          new Uint8Array([cI[yn(0xc1b)], ...new TextEncoder()[yn(0x3e9)](rr)])
        ),
        (m9 = !![]);
    });
    function ma(rq, rr) {
      const yo = uf;
      if (rq === yo(0xe53)) {
        const rs = {};
        (rs[yo(0x704)] = yo(0xed2)),
          (rs[yo(0x7ed)] = yo(0x9d6)),
          (rs[yo(0x692)] = yo(0x9d6)),
          (rr = new Date(
            rr === 0x0 ? Date[yo(0x796)]() : rr * 0x3e8 * 0x3c * 0x3c
          )[yo(0xeb8)]("en", rs));
      } else
        rq === yo(0xcc3) || rq === yo(0xcd9)
          ? (rr = ka(rr * 0x3e8 * 0x3c, !![]))
          : (rr = k9(rr));
      return rr;
    }
    var mb = f2(),
      mc = {},
      md = document[uf(0x992)](uf(0x1ce));
    md[uf(0x8e1)] = "";
    for (let rq in mb) {
      const rr = me(rq);
      rr[uf(0xa58)](0x0), md[uf(0x962)](rr), (mc[rq] = rr);
    }
    function me(rs) {
      const yp = uf,
        rt = nA(yp(0x322) + kd(rs) + yp(0x8cc)),
        ru = rt[yp(0x992)](yp(0xbe9));
      return (
        (rt[yp(0xa58)] = function (rv) {
          k8(ru, ma(rs, rv));
        }),
        rt
      );
    }
    var mf;
    function mg(rs, rt, ru, rv, rw, rx, ry) {
      const yq = uf;
      mf && (mf[yq(0x96f)](), (mf = null));
      const rz = rx[yq(0x4cf)] / 0x2,
        rA = yq(0x38b)[yq(0x2fd)](rz),
        rB = nA(
          yq(0xe1a) +
            rs +
            yq(0xceb) +
            rA +
            yq(0x6ee) +
            rA +
            yq(0x5d1) +
            yq(0x54f)[yq(0x2fd)](eL * dH) +
            yq(0xeb1) +
            (ru[yq(0x4cf)] === 0x0 ? yq(0x30c) : "") +
            yq(0x3cb)
        );
      ry && rB[yq(0x962)](nA(yq(0x5a9)));
      mf = rB;
      const rC = rB[yq(0x992)](yq(0x802)),
        rD = rB[yq(0x992)](yq(0x38a));
      for (let rP = 0x0; rP < rx[yq(0x4cf)]; rP++) {
        const rQ = rx[rP];
        if (!rQ) continue;
        const rR = nZ(rQ);
        rR[yq(0x2ae)][yq(0x218)](yq(0x2cc)),
          (rR[yq(0xb9a)] = !![]),
          rR[yq(0x3da)][yq(0x218)](),
          (rR[yq(0x3da)] = null),
          rP < rz
            ? rC[yq(0x44e)][rP][yq(0x962)](rR)
            : rD[yq(0x44e)][rP - rz][yq(0x962)](rR);
      }
      (rB[yq(0x96f)] = function () {
        const yr = yq;
        (rB[yr(0x35a)][yr(0x2ea)] = yr(0xc8a)),
          (rB[yr(0x35a)][yr(0xbe5)] = yr(0x5d0)),
          void rB[yr(0x286)],
          (rB[yr(0x35a)][yr(0xbe5)] = ""),
          setTimeout(function () {
            const ys = yr;
            rB[ys(0x218)]();
          }, 0x3e8);
      }),
        (rB[yq(0x992)](yq(0xd4a))[yq(0x4fe)] = function () {
          const yt = yq;
          rB[yt(0x96f)]();
        });
      const rE = d4(rw),
        rF = rE[0x0],
        rG = rE[0x1],
        rH = d2(rF + 0x1),
        rI = rw - rG,
        rJ = rB[yq(0x992)](yq(0xd4f));
      k8(
        rJ,
        yq(0x3ed) + (rF + 0x1) + yq(0xafb) + iJ(rI) + "/" + iJ(rH) + yq(0x6bf)
      );
      const rK = Math[yq(0x36c)](0x1, rI / rH),
        rL = rB[yq(0x992)](yq(0xb15));
      rL[yq(0x35a)][yq(0x8df)] = rK * 0x64 + "%";
      const rM = rB[yq(0x992)](yq(0x1ce));
      for (let rS in mb) {
        const rT = me(rS);
        rT[yq(0xa58)](rt[rS]), rM[yq(0x962)](rT);
      }
      const rN = rB[yq(0x992)](yq(0x36f));
      ru[yq(0x76e)]((rU, rV) => nY(rU[0x0], rV[0x0]));
      for (let rU = 0x0; rU < ru[yq(0x4cf)]; rU++) {
        const [rV, rW] = ru[rU],
          rX = nZ(rV);
        jY(rX),
          rX[yq(0x2ae)][yq(0x218)](yq(0x2cc)),
          (rX[yq(0xb9a)] = !![]),
          oP(rX[yq(0x3da)], rW),
          rN[yq(0x962)](rX);
      }
      if (ru[yq(0x4cf)] > 0x0) {
        const rY = nA(yq(0xab3)),
          rZ = {};
        for (let s0 = 0x0; s0 < ru[yq(0x4cf)]; s0++) {
          const [s1, s2] = ru[s0];
          rZ[s1[yq(0xb9c)]] = (rZ[s1[yq(0xb9c)]] || 0x0) + s2;
        }
        oo(rY, rZ), rB[yq(0x992)](yq(0x3e6))[yq(0x962)](rY);
      }
      const rO = rB[yq(0x992)](yq(0x9f4));
      for (let s3 = 0x0; s3 < rv[yq(0x4cf)]; s3++) {
        const s4 = rv[s3],
          s5 = nF(s4, !![]);
        s5[yq(0x2ae)][yq(0x218)](yq(0x2cc)), (s5[yq(0xb9a)] = !![]);
        const s6 = rO[yq(0x44e)][s4[yq(0x793)] * dH + s4[yq(0xb9c)]];
        rO[yq(0xc7b)](s5, s6), s6[yq(0x218)]();
      }
      rB[yq(0x2ae)][yq(0x6b1)](yq(0x69f)),
        setTimeout(function () {
          const yu = yq;
          rB[yu(0x2ae)][yu(0x218)](yu(0x69f));
        }, 0x0),
        kl[yq(0x962)](rB);
    }
    var mh = document[uf(0x992)](uf(0x366));
    document[uf(0x992)](uf(0xca9))[uf(0x4fe)] = ng(function (rs) {
      const yv = uf,
        rt = mh[yv(0x6f8)][yv(0x517)]();
      nf(rt);
    });
    function mi(rs) {
      const yw = uf,
        rt = new Uint8Array([
          cI[yw(0xdec)],
          ...new TextEncoder()[yw(0x3e9)](rs),
        ]);
      il(rt);
    }
    var mj = document[uf(0x992)](uf(0x1da)),
      mk = document[uf(0x992)](uf(0x7c5)),
      ml = mk[uf(0x992)](uf(0xcf2)),
      mm = 0x0,
      mn = 0x0;
    setInterval(function () {
      const yx = uf;
      hW &&
        (pz - mn > 0x7530 &&
          mj[yx(0x2ae)][yx(0xb8c)](yx(0xa7d)) &&
          (il(new Uint8Array([cI[yx(0xe55)]])), (mn = pz)),
        pz - mm > 0xea60 &&
          mk[yx(0x2ae)][yx(0xb8c)](yx(0xa7d)) &&
          (il(new Uint8Array([cI[yx(0x99b)]])), (mm = pz)));
    }, 0x3e8);
    var mo = ![];
    function mp(rs) {
      const yy = uf;
      for (let rt in m1) {
        if (rs === rt) continue;
        m1[rt][yy(0x96f)]();
      }
      mo = ![];
    }
    window[uf(0x4fe)] = function (rs) {
      const yz = uf;
      if ([kk, kn, ki][yz(0x637)](rs[yz(0x6f7)])) mp();
    };
    function mq() {
      const yA = uf;
      iy && !oV[yA(0xcfa)] && im(0x0, 0x0);
    }
    function mr(rs, rt, ru, rv) {
      const yB = uf,
        rw = document[yB(0x992)](rt),
        rx = rw[yB(0x992)](yB(0xcf2)),
        ry = document[yB(0x992)](rs);
      let rz = null,
        rA = rw[yB(0x992)](yB(0xb38));
      rA &&
        (rA[yB(0x4fe)] = function () {
          const yC = yB;
          rw[yC(0x2ae)][yC(0x622)](yC(0x867));
        });
      (rx[yB(0x35a)][yB(0xbe5)] = yB(0x5d0)),
        rw[yB(0x2ae)][yB(0x218)](yB(0xa7d)),
        (ry[yB(0x4fe)] = function () {
          const yD = yB;
          rB[yD(0x622)]();
        }),
        (rw[yB(0x992)](yB(0xd4a))[yB(0x4fe)] = function () {
          mp();
        });
      const rB = [ry, rw];
      (rB[yB(0x96f)] = function () {
        const yE = yB;
        ry[yE(0x2ae)][yE(0x218)](yE(0x233)),
          rw[yE(0x2ae)][yE(0x218)](yE(0xa7d)),
          !rz &&
            (rz = setTimeout(function () {
              const yF = yE;
              (rx[yF(0x35a)][yF(0xbe5)] = yF(0x5d0)), (rz = null);
            }, 0x3e8));
      }),
        (rB[yB(0x622)] = function () {
          const yG = yB;
          mp(ru),
            rw[yG(0x2ae)][yG(0xb8c)](yG(0xa7d))
              ? rB[yG(0x96f)]()
              : rB[yG(0xa7d)]();
        }),
        (rB[yB(0xa7d)] = function () {
          const yH = yB;
          rv && rv(),
            clearTimeout(rz),
            (rz = null),
            (rx[yH(0x35a)][yH(0xbe5)] = ""),
            ry[yH(0x2ae)][yH(0x6b1)](yH(0x233)),
            rw[yH(0x2ae)][yH(0x6b1)](yH(0xa7d)),
            (mo = !![]),
            mq();
        }),
        (m1[ru] = rB);
    }
    var ms = [],
      mt,
      mu = 0x0,
      mv = ![],
      mw = document[uf(0x992)](uf(0x9a0)),
      mz = {
        tagName: uf(0x904),
        getBoundingClientRect() {
          const yI = uf,
            rs = mw[yI(0x6de)](),
            rt = {};
          return (
            (rt["x"] = rs["x"] + rs[yI(0x8df)] / 0x2),
            (rt["y"] = rs["y"] + rs[yI(0xb7f)] / 0x2),
            rt
          );
        },
        appendChild(rs) {
          const yJ = uf;
          rs[yJ(0x218)]();
        },
      };
    function mA(rs) {
      const yK = uf;
      if (!hW) return;
      const rt = rs[yK(0x6f7)];
      if (rt[yK(0xa32)]) mt = mU(rt, rs);
      else {
        if (rt[yK(0xc69)]) {
          mp();
          const ru = rt[yK(0x446)]();
          (ru[yK(0x45d)] = rt[yK(0x45d)]),
            nz(ru, rt[yK(0x45d)]),
            (ru[yK(0x5df)] = 0x1),
            (ru[yK(0xc69)] = !![]),
            (ru[yK(0xc86)] = mz),
            ru[yK(0x2ae)][yK(0x6b1)](yK(0xdab));
          const rv = rt[yK(0x6de)]();
          (ru[yK(0x35a)][yK(0xeb2)] = rv["x"] / kR + "px"),
            (ru[yK(0x35a)][yK(0x928)] = rv["y"] / kR + "px"),
            kH[yK(0x962)](ru),
            (mt = mU(ru, rs)),
            (mu = 0x0),
            (mo = !![]);
        } else return ![];
      }
      return (mu = Date[yK(0x796)]()), (mv = !![]), !![];
    }
    function mB(rs) {
      const yL = uf;
      for (let rt = 0x0; rt < rs[yL(0x44e)][yL(0x4cf)]; rt++) {
        const ru = rs[yL(0x44e)][rt];
        if (ru[yL(0x2ae)][yL(0xb8c)](yL(0x45d)) && !mT(ru)) return ru;
      }
    }
    function mC() {
      const yM = uf;
      if (mt) {
        if (mv && Date[yM(0x796)]() - mu < 0x1f4) {
          if (mt[yM(0xa32)]) {
            const rs = mt[yM(0xebc)][yM(0x351)];
            mt[yM(0x79c)](
              rs >= iN ? nk[yM(0x44e)][rs - iN + 0x1] : nl[yM(0x44e)][rs]
            );
          } else {
            if (mt[yM(0xc69)]) {
              let rt = mB(nk) || mB(nl);
              rt && mt[yM(0x79c)](rt);
            }
          }
        }
        mt[yM(0x52d)]();
        if (mt[yM(0xc69)]) {
          (mt[yM(0xc69)] = ![]),
            (mt[yM(0xa32)] = !![]),
            m1[yM(0x358)][yM(0xa7d)]();
          if (mt[yM(0xc86)] !== mz) {
            const ru = mt[yM(0xcf9)];
            ru
              ? ((mt[yM(0x58f)] = ru[yM(0x58f)]), mQ(ru[yM(0x45d)]["id"], 0x1))
              : (mt[yM(0x58f)] = iR[yM(0x315)]());
            (iQ[mt[yM(0x58f)]] = mt), mQ(mt[yM(0x45d)]["id"], -0x1);
            const rv = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x1));
            rv[yM(0x75e)](0x0, cI[yM(0x64e)]),
              rv[yM(0xe46)](0x1, mt[yM(0x45d)]["id"]),
              rv[yM(0x75e)](0x3, mt[yM(0xc86)][yM(0x351)]),
              il(rv);
          }
        } else
          mt[yM(0xc86)] === mz
            ? (iR[yM(0x9ee)](mt[yM(0x58f)]),
              mQ(mt[yM(0x45d)]["id"], 0x1),
              il(new Uint8Array([cI[yM(0x3e4)], mt[yM(0xebc)][yM(0x351)]])))
            : mS(mt[yM(0xebc)][yM(0x351)], mt[yM(0xc86)][yM(0x351)]);
        mt = null;
      }
    }
    function mD(rs) {
      const yN = uf;
      mt && (mt[yN(0x90c)](rs), (mv = ![]));
    }
    var mE = document[uf(0x992)](uf(0xce9));
    function mF() {
      const yO = uf;
      mE[yO(0x35a)][yO(0xbe5)] = yO(0x5d0);
      const rs = mE[yO(0x992)](yO(0x1e0));
      let rt,
        ru,
        rv = null;
      (mE[yO(0x6a4)] = function (rx) {
        const yP = yO;
        rv === null &&
          ((rs[yP(0x35a)][yP(0x8df)] = rs[yP(0x35a)][yP(0x53f)] = "0"),
          (mE[yP(0x35a)][yP(0xbe5)] = ""),
          ([rt, ru] = mG(rx)),
          rw(),
          (rv = rx[yP(0x4f9)]));
      }),
        (mE[yO(0x6b9)] = function (rx) {
          const yQ = yO;
          if (rx[yQ(0x4f9)] === rv) {
            const [ry, rz] = mG(rx),
              rA = ry - rt,
              rB = rz - ru,
              rC = mE[yQ(0x6de)]();
            let rD = Math[yQ(0x78b)](rA, rB);
            const rE = rC[yQ(0x8df)] / 0x2 / kR;
            rD > rE && (rD = rE);
            const rF = Math[yQ(0x84f)](rB, rA);
            return (
              (rs[yQ(0x35a)][yQ(0x53f)] = yQ(0x4a1) + rF + yQ(0x7b5)),
              (rs[yQ(0x35a)][yQ(0x8df)] = rD + "px"),
              im(rF, rD / rE),
              !![]
            );
          }
        }),
        (mE[yO(0x84d)] = function (rx) {
          const yR = yO;
          rx[yR(0x4f9)] === rv &&
            ((mE[yR(0x35a)][yR(0xbe5)] = yR(0x5d0)), (rv = null), im(0x0, 0x0));
        });
      function rw() {
        const yS = yO;
        (mE[yS(0x35a)][yS(0xeb2)] = rt + "px"),
          (mE[yS(0x35a)][yS(0x928)] = ru + "px");
      }
    }
    mF();
    function mG(rs) {
      const yT = uf;
      return [rs[yT(0x89c)] / kR, rs[yT(0x2ec)] / kR];
    }
    var mH = document[uf(0x992)](uf(0x9d1)),
      mI = document[uf(0x992)](uf(0x5e9)),
      mJ = document[uf(0x992)](uf(0xd75)),
      mK = {},
      mL = {};
    if (kL) {
      document[uf(0x92f)][uf(0x2ae)][uf(0x6b1)](uf(0x630)),
        (window[uf(0x46d)] = function (rt) {
          const yU = uf;
          for (let ru = 0x0; ru < rt[yU(0xec3)][yU(0x4cf)]; ru++) {
            const rv = rt[yU(0xec3)][ru],
              rw = rv[yU(0x6f7)];
            if (rw === ki) {
              mE[yU(0x6a4)](rv);
              continue;
            } else {
              if (rw === mI)
                pa(yU(0x6cf), !![]),
                  (mK[rv[yU(0x4f9)]] = function () {
                    const yV = yU;
                    pa(yV(0x6cf), ![]);
                  });
              else {
                if (rw === mH)
                  pa(yU(0x6dd), !![]),
                    (mK[rv[yU(0x4f9)]] = function () {
                      const yW = yU;
                      pa(yW(0x6dd), ![]);
                    });
                else
                  rw === mJ &&
                    (pa(yU(0x216), !![]),
                    (mK[rv[yU(0x4f9)]] = function () {
                      const yX = yU;
                      pa(yX(0x216), ![]);
                    }));
              }
            }
            if (mt) continue;
            if (rw[yU(0x45d)]) {
              const rx = mO(rw);
              mA(rv),
                mt && (mL[rv[yU(0x4f9)]] = mD),
                (mK[rv[yU(0x4f9)]] = function () {
                  const yY = yU;
                  mt && mC(), (rx[yY(0x579)] = ![]);
                });
            }
          }
        });
      const rs = {};
      (rs[uf(0xdc5)] = ![]),
        document[uf(0x8b1)](
          uf(0x83b),
          function (rt) {
            const yZ = uf;
            for (let ru = 0x0; ru < rt[yZ(0xec3)][yZ(0x4cf)]; ru++) {
              const rv = rt[yZ(0xec3)][ru];
              mE[yZ(0x6b9)](rv) && rt[yZ(0x56b)]();
              if (mL[rv[yZ(0x4f9)]]) mL[rv[yZ(0x4f9)]](rv), rt[yZ(0x56b)]();
              else mt && rt[yZ(0x56b)]();
            }
          },
          rs
        ),
        (window[uf(0x9ca)] = function (rt) {
          const z0 = uf;
          for (let ru = 0x0; ru < rt[z0(0xec3)][z0(0x4cf)]; ru++) {
            const rv = rt[z0(0xec3)][ru];
            mE[z0(0x84d)](rv),
              mK[rv[z0(0x4f9)]] &&
                (mK[rv[z0(0x4f9)]](),
                delete mK[rv[z0(0x4f9)]],
                delete mL[rv[z0(0x4f9)]]);
          }
        });
    } else {
      document[uf(0x92f)][uf(0x2ae)][uf(0x6b1)](uf(0x234));
      let rt = ![];
      (window[uf(0x590)] = function (ru) {
        const z1 = uf;
        ru[z1(0x3dc)] === 0x0 && ((rt = !![]), mA(ru));
      }),
        (document[uf(0x493)] = function (ru) {
          const z2 = uf;
          mD(ru);
          const rv = ru[z2(0x6f7)];
          if (rv[z2(0x45d)] && !rt) {
            const rw = mO(rv);
            rv[z2(0xa59)] = rv[z2(0x590)] = function () {
              const z3 = z2;
              rw[z3(0x579)] = ![];
            };
          }
        }),
        (document[uf(0xc08)] = function (ru) {
          const z4 = uf;
          ru[z4(0x3dc)] === 0x0 && ((rt = ![]), mC());
        }),
        (km[uf(0x493)] = ki[uf(0x493)] =
          function (ru) {
            const z5 = uf;
            (mY = ru[z5(0x89c)] - kU() / 0x2),
              (mZ = ru[z5(0x2ec)] - kV() / 0x2);
            if (!oV[z5(0xcfa)] && iy && !mo) {
              const rv = Math[z5(0x78b)](mY, mZ),
                rw = Math[z5(0x84f)](mZ, mY);
              im(rw, rv < 0x32 ? rv / 0x64 : 0x1);
            }
          });
    }
    function mM(ru, rv, rw) {
      const z6 = uf;
      return Math[z6(0x525)](rv, Math[z6(0x36c)](ru, rw));
    }
    var mN = [];
    function mO(ru) {
      const z7 = uf;
      let rv = mN[z7(0xb2b)]((rw) => rw["el"] === ru);
      if (rv) return (rv[z7(0x579)] = !![]), rv;
      (rv =
        typeof ru[z7(0x45d)] === z7(0xc8c)
          ? ru[z7(0x45d)]()
          : nu(ru[z7(0x45d)], ru[z7(0xd9e)])),
        (rv[z7(0x579)] = !![]),
        (rv[z7(0x81d)] = 0x0),
        (rv[z7(0x35a)][z7(0xa24)] = z7(0xe05)),
        (rv[z7(0x35a)][z7(0x53f)] = z7(0x5d0)),
        kH[z7(0x962)](rv);
      if (kL)
        (rv[z7(0x35a)][z7(0xb11)] = z7(0x415)),
          (rv[z7(0x35a)][z7(0x928)] = z7(0x415)),
          (rv[z7(0x35a)][z7(0x424)] = z7(0x635)),
          (rv[z7(0x35a)][z7(0xeb2)] = z7(0x635));
      else {
        const rw = ru[z7(0x6de)](),
          rx = rv[z7(0x6de)]();
        (rv[z7(0x35a)][z7(0x928)] =
          mM(
            ru[z7(0x9ed)]
              ? (rw[z7(0x928)] + rw[z7(0xb7f)]) / kR + 0xa
              : (rw[z7(0x928)] - rx[z7(0xb7f)]) / kR - 0xa,
            0xa,
            window[z7(0x583)] / kR - 0xa
          ) + "px"),
          (rv[z7(0x35a)][z7(0xeb2)] =
            mM(
              (rw[z7(0xeb2)] + rw[z7(0x8df)] / 0x2 - rx[z7(0x8df)] / 0x2) / kR,
              0xa,
              window[z7(0x8d2)] / kR - 0xa - rx[z7(0x8df)] / kR
            ) + "px"),
          (rv[z7(0x35a)][z7(0x424)] = z7(0x635)),
          (rv[z7(0x35a)][z7(0xb11)] = z7(0x635));
      }
      return (
        (rv[z7(0x35a)][z7(0xcd1)] = z7(0x5d0)),
        (rv[z7(0x35a)][z7(0xc03)] = 0x0),
        (rv["el"] = ru),
        mN[z7(0x9ee)](rv),
        rv
      );
    }
    var mP = document[uf(0x992)](uf(0xe79));
    function mQ(ru, rv = 0x1) {
      const z8 = uf;
      !iS[ru] && ((iS[ru] = 0x0), oU(ru), nW()),
        (iS[ru] += rv),
        nU[ru][z8(0x1e5)](iS[ru]),
        iS[ru] <= 0x0 && (delete iS[ru], nU[ru][z8(0x4da)](), nW()),
        mR();
    }
    function mR() {
      const z9 = uf;
      mP[z9(0x8e1)] = "";
      Object[z9(0x28d)](iS)[z9(0x4cf)] === 0x0
        ? (mP[z9(0x35a)][z9(0xbe5)] = z9(0x5d0))
        : (mP[z9(0x35a)][z9(0xbe5)] = "");
      const ru = {};
      for (const rv in iS) {
        const rw = dC[rv],
          rx = iS[rv];
        ru[rw[z9(0xb9c)]] = (ru[rw[z9(0xb9c)]] || 0x0) + rx;
      }
      oo(mP, ru);
      for (const ry in oa) {
        const rz = oa[ry];
        rz[z9(0x2ae)][ru[ry] ? z9(0x218) : z9(0x6b1)](z9(0xac8));
      }
    }
    function mS(ru, rv) {
      const za = uf;
      if (ru === rv) return;
      il(new Uint8Array([cI[za(0xcc4)], ru, rv]));
    }
    function mT(ru) {
      const zb = uf;
      return ru[zb(0xe8f)] || ru[zb(0x992)](zb(0x90d));
    }
    function mU(ru, rv, rw = !![]) {
      const zc = uf,
        rx = ms[zc(0xb2b)]((rH) => rH === ru);
      if (rx) return rx[zc(0x254)](rv), rx;
      let ry,
        rz,
        rA,
        rB,
        rC = 0x0,
        rD = 0x0,
        rE = 0x0,
        rF;
      (ru[zc(0x254)] = function (rH, rI) {
        const zd = zc;
        (rF = ru[zd(0xc86)] || ru[zd(0xcbd)]),
          (rF[zd(0xe8f)] = ru),
          (ru[zd(0xebc)] = rF),
          (ru[zd(0xdd2)] = ![]),
          (ru[zd(0xae7)] = ![]);
        const rJ = ru[zd(0x6de)]();
        rH[zd(0x969)] === void 0x0
          ? ((rC = rH[zd(0x89c)] - rJ["x"]),
            (rD = rH[zd(0x2ec)] - rJ["y"]),
            ru[zd(0x90c)](rH),
            (ry = rA),
            (rz = rB))
          : ((ry = rJ["x"]),
            (rz = rJ["y"]),
            ru[zd(0x79c)](rH),
            ru[zd(0x52d)](rI)),
          rG();
      }),
        (ru[zc(0x52d)] = function (rH = !![]) {
          const ze = zc;
          ru[ze(0xae7)] = !![];
          rF[ze(0xe8f)] === ru && (rF[ze(0xe8f)] = null);
          if (!ru[ze(0xc86)])
            ru[ze(0x79c)](rF),
              Math[ze(0x78b)](rA - ry, rB - rz) > 0x32 * kR &&
                ru[ze(0x79c)](mz);
          else {
            if (rH) {
              const rI = mT(ru[ze(0xc86)]);
              (ru[ze(0xcf9)] = rI), rI && mU(rI, rF, ![]);
            }
          }
          ru[ze(0xc86)] !== rF && (ru[ze(0x5df)] = 0x0),
            (ru[ze(0xc86)][ze(0xe8f)] = ru);
        }),
        (ru[zc(0x79c)] = function (rH) {
          const zf = zc;
          ru[zf(0xc86)] = rH;
          const rI = rH[zf(0x6de)]();
          (rA = rI["x"]),
            (rB = rI["y"]),
            (ru[zf(0x35a)][zf(0xb63)] =
              rH === mz ? zf(0xaea) : getComputedStyle(rH)[zf(0xb63)]);
        }),
        (ru[zc(0x90c)] = function (rH) {
          const zg = zc;
          (rA = rH[zg(0x89c)] - rC),
            (rB = rH[zg(0x2ec)] - rD),
            (ru[zg(0xc86)] = null);
          let rI = Infinity,
            rJ = null;
          const rK = ko[zg(0x523)](zg(0x608));
          for (let rL = 0x0; rL < rK[zg(0x4cf)]; rL++) {
            const rM = rK[rL],
              rN = rM[zg(0x6de)](),
              rO = Math[zg(0x78b)](
                rN["x"] + rN[zg(0x8df)] / 0x2 - rH[zg(0x89c)],
                rN["y"] + rN[zg(0xb7f)] / 0x2 - rH[zg(0x2ec)]
              );
            rO < 0x1e * kR && rO < rI && ((rJ = rM), (rI = rO));
          }
          rJ && rJ !== rF && ru[zg(0x79c)](rJ);
        }),
        ru[zc(0x254)](rv, rw),
        ru[zc(0x2ae)][zc(0x6b1)](zc(0xdab)),
        kH[zc(0x962)](ru);
      function rG() {
        const zh = zc;
        (ru[zh(0x35a)][zh(0xeb2)] = ry / kR + "px"),
          (ru[zh(0x35a)][zh(0x928)] = rz / kR + "px");
      }
      return (
        (ru[zc(0x770)] = function () {
          const zi = zc;
          ru[zi(0xc86)] && ru[zi(0x79c)](ru[zi(0xc86)]);
        }),
        (ru[zc(0x30b)] = function () {
          const zj = zc;
          (ry = pg(ry, rA, 0x64)), (rz = pg(rz, rB, 0x64)), rG();
          let rH = 0x0,
            rI = Infinity;
          ru[zj(0xc86)]
            ? ((rI = Math[zj(0x78b)](rA - ry, rB - rz)),
              (rH = rI > 0x5 ? 0x1 : 0x0))
            : (rH = 0x1),
            (rE = pg(rE, rH, 0x64)),
            (ru[zj(0x35a)][zj(0x53f)] =
              zj(0x296) +
              (0x1 + 0.3 * rE) +
              zj(0xa6a) +
              rE * Math[zj(0x46b)](Date[zj(0x796)]() / 0x96) * 0xa +
              zj(0xbd3)),
            ru[zj(0xae7)] &&
              rE < 0.05 &&
              rI < 0x5 &&
              (ru[zj(0x2ae)][zj(0x218)](zj(0xdab)),
              (ru[zj(0x35a)][zj(0xeb2)] =
                ru[zj(0x35a)][zj(0x928)] =
                ru[zj(0x35a)][zj(0x53f)] =
                ru[zj(0x35a)][zj(0xb63)] =
                ru[zj(0x35a)][zj(0x2de)] =
                  ""),
              (ru[zj(0xdd2)] = !![]),
              ru[zj(0xc86)][zj(0x962)](ru),
              (ru[zj(0xc86)][zj(0xe8f)] = null),
              (ru[zj(0xc86)] = null));
        }),
        ms[zc(0x9ee)](ru),
        ru
      );
    }
    var mV = cY[uf(0xcdb)];
    document[uf(0x690)] = function () {
      return ![];
    };
    var mW = 0x0,
      mX = 0x0,
      mY = 0x0,
      mZ = 0x0,
      n0 = 0x1,
      n1 = 0x1;
    document[uf(0xe7a)] = function (ru) {
      const zk = uf;
      ru[zk(0x6f7)] === ki &&
        ((n0 *= ru[zk(0x4c6)] < 0x0 ? 1.1 : 0.9),
        (n0 = Math[zk(0x36c)](0x3, Math[zk(0x525)](0x1, n0))));
    };
    const n2 = {};
    (n2[uf(0x3f5)] = uf(0xd35)),
      (n2["me"] = uf(0x26f)),
      (n2[uf(0x88f)] = uf(0x287));
    var n3 = n2,
      n4 = {};
    function n5(ru, rv) {
      n6(ru, null, null, null, jx(rv));
    }
    function n6(ru, rv, rw, rx = n3[uf(0x3f5)], ry) {
      const zl = uf,
        rz = nA(zl(0xd2b));
      if (!ry) {
        if (rv) {
          const rB = nA(zl(0xd95));
          k8(rB, rv + ":"), rz[zl(0x962)](rB);
        }
        const rA = nA(zl(0x2ed));
        k8(rA, rw),
          rz[zl(0x962)](rA),
          (rz[zl(0x44e)][0x0][zl(0x35a)][zl(0x5f4)] = rx),
          rv && rz[zl(0xd94)](nA(zl(0xe0c)));
      } else rz[zl(0x8e1)] = ry;
      p3[zl(0x962)](rz);
      while (p3[zl(0x44e)][zl(0x4cf)] > 0x3c) {
        p3[zl(0x44e)][0x0][zl(0x218)]();
      }
      return (
        (p3[zl(0x6aa)] = p3[zl(0x9f9)]),
        (rz[zl(0xc5e)] = rw),
        (rz[zl(0xb95)] = rx),
        n7(ru, rz),
        rz
      );
    }
    function n7(ru, rv) {
      const zm = uf;
      (rv["t"] = 0x0), (rv[zm(0x261)] = 0x0);
      if (!n4[ru]) n4[ru] = [];
      n4[ru][zm(0x9ee)](rv);
    }
    var n8 = {};
    ki[uf(0x590)] = window[uf(0xc08)] = ng(function (ru) {
      const zn = uf,
        rv = zn(0xa54) + ru[zn(0x3dc)];
      pa(rv, ru[zn(0x2dc)] === zn(0x757));
    });
    var n9 = 0x0;
    function na(ru) {
      const zo = uf,
        rv = 0x200,
        rw = rv / 0x64,
        rx = document[zo(0xde7)](zo(0xbb7));
      rx[zo(0x8df)] = rx[zo(0xb7f)] = rv;
      const ry = rx[zo(0x1c6)]("2d");
      ry[zo(0xd15)](rv / 0x2, rv / 0x2), ry[zo(0x264)](rw), ru[zo(0x461)](ry);
      const rz = (ru[zo(0xb21)] ? zo(0x745) : zo(0xb87)) + ru[zo(0x786)];
      nb(rx, rz);
    }
    function nb(ru, rv) {
      const zp = uf,
        rw = document[zp(0xde7)]("a");
      (rw[zp(0x916)] = rv),
        (rw[zp(0x66e)] = typeof ru === zp(0x3fa) ? ru : ru[zp(0x5da)]()),
        rw[zp(0x5f2)](),
        hK(rv + zp(0xe62), hP[zp(0x855)]);
    }
    var nc = 0x0;
    setInterval(function () {
      nc = 0x0;
    }, 0x1770),
      setInterval(function () {
        const zq = uf;
        nh[zq(0x4cf)] = 0x0;
      }, 0x2710);
    var nd = ![],
      ne = ![];
    function nf(ru) {
      const zr = uf;
      ru = ru[zr(0x517)]();
      if (!ru) hK(zr(0x293)), hc(zr(0x293));
      else
        ru[zr(0x4cf)] < cN || ru[zr(0x4cf)] > cM
          ? (hK(zr(0xdf8)), hc(zr(0xdf8)))
          : (hK(zr(0x6d0) + ru + zr(0x8e5), hP[zr(0xe3b)]),
            hc(zr(0x6d0) + ru + zr(0x8e5)),
            mi(ru));
    }
    document[uf(0x3fe)] = document[uf(0xcd3)] = ng(function (ru) {
      const zs = uf;
      ru[zs(0x740)] && ru[zs(0x56b)]();
      (nd = ru[zs(0x740)]), (ne = ru[zs(0xdce)]);
      if (ru[zs(0xbc3)] === 0x9) {
        ru[zs(0x56b)]();
        return;
      }
      if (document[zs(0x74a)] && document[zs(0x74a)][zs(0x969)] === zs(0xac7)) {
        if (ru[zs(0x2dc)] === zs(0x91e) && ru[zs(0xbc3)] === 0xd) {
          if (document[zs(0x74a)] === hF) hG[zs(0x5f2)]();
          else {
            if (document[zs(0x74a)] === p2) {
              let rv = p2[zs(0x6f8)][zs(0x517)]()[zs(0xb26)](0x0, cL);
              if (rv && hW) {
                if (pz - n9 > 0x3e8) {
                  const rw = rv[zs(0x79d)](zs(0x1e4));
                  if (rw || rv[zs(0x79d)](zs(0xe13))) {
                    const rx = rv[zs(0xb26)](rw ? 0x7 : 0x9);
                    if (!rx) hK(zs(0xd39));
                    else {
                      if (rw) {
                        const ry = eM[rx];
                        !ry ? hK(zs(0xb49) + rx + "!") : na(ry);
                      } else {
                        const rz = dF[rx];
                        !rz ? hK(zs(0x2a3) + rx + "!") : na(rz);
                      }
                    }
                  } else {
                    if (rv[zs(0x79d)](zs(0x31c))) nb(qh, zs(0xd6c));
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
                        }else if (rv[zs(0x79d)](zs(0xe12))) {
                        const rA = rv[zs(0xb26)](0x9);
                        nf(rA);
                      } else {
                        hack.speak = (txt) => {
                        let rB = 0x0;
                        for (let rC = 0x0; rC < nh[zs(0x4cf)]; rC++) {
                          ni(txt, nh[rC]) > 0.95 && rB++;
                        }
                        rB >= 0x3 && (nc += 0xa);
                        nc++;
                        if (nc > 0x3) hK(zs(0x68d)), (n9 = pz + 0xea60);
                        else {
                          nh[zs(0x9ee)](txt);
                          if (nh[zs(0x4cf)] > 0xa) nh[zs(0x2e2)]();
                          (txt = decodeURIComponent(
                            encodeURIComponent(txt)
                              [zs(0x6d2)](/%CC(%[A-Z0-9]{2})+%20/g, "\x20")
                              [zs(0x6d2)](/%CC(%[A-Z0-9]{2})+(\w)/g, "$2")
                          )),
                            il(
                              new Uint8Array([
                                cI[zs(0xbd5)],
                                ...new TextEncoder()[zs(0x3e9)](txt),
                              ])
                            ),
                            (n9 = pz);
                        }
                    };
                    hack.speak(inputChat);
                      }
                    }
                  }
                } else n6(-0x1, null, zs(0xda0), n3[zs(0x88f)]);
              }
              (p2[zs(0x6f8)] = ""), p2[zs(0xbea)]();
            }
          }
        }
        return;
      }
      pa(ru[zs(0xea3)], ru[zs(0x2dc)] === zs(0x2dd));
    });
    function ng(ru) {
      return function (rv) {
        const zt = b;
        rv instanceof Event && rv[zt(0x870)] && !rv[zt(0x2fd)] && ru(rv);
      };
    }
    var nh = [];
    function ni(ru, rv) {
      const zu = uf;
      var rw = ru,
        rx = rv;
      ru[zu(0x4cf)] < rv[zu(0x4cf)] && ((rw = rv), (rx = ru));
      var ry = rw[zu(0x4cf)];
      if (ry == 0x0) return 0x1;
      return (ry - nj(rw, rx)) / parseFloat(ry);
    }
    function nj(ru, rv) {
      const zv = uf;
      (ru = ru[zv(0x43a)]()), (rv = rv[zv(0x43a)]());
      var rw = new Array();
      for (var rx = 0x0; rx <= ru[zv(0x4cf)]; rx++) {
        var ry = rx;
        for (var rz = 0x0; rz <= rv[zv(0x4cf)]; rz++) {
          if (rx == 0x0) rw[rz] = rz;
          else {
            if (rz > 0x0) {
              var rA = rw[rz - 0x1];
              if (ru[zv(0x6c6)](rx - 0x1) != rv[zv(0x6c6)](rz - 0x1))
                rA = Math[zv(0x36c)](Math[zv(0x36c)](rA, ry), rw[rz]) + 0x1;
              (rw[rz - 0x1] = ry), (ry = rA);
            }
          }
        }
        if (rx > 0x0) rw[rv[zv(0x4cf)]] = ry;
      }
      return rw[rv[zv(0x4cf)]];
    }
    var nk = document[uf(0x992)](uf(0x802)),
      nl = document[uf(0x992)](uf(0x38a));
    function nm(ru, rv = 0x1) {
      const zw = uf;
      ru[zw(0xc61)](),
        ru[zw(0xd07)](0.25 * rv, 0.25 * rv),
        ru[zw(0xd15)](-0x4b, -0x4b),
        ru[zw(0xc3a)](),
        ru[zw(0xd7c)](0x4b, 0x28),
        ru[zw(0xc43)](0x4b, 0x25, 0x46, 0x19, 0x32, 0x19),
        ru[zw(0xc43)](0x14, 0x19, 0x14, 62.5, 0x14, 62.5),
        ru[zw(0xc43)](0x14, 0x50, 0x28, 0x66, 0x4b, 0x78),
        ru[zw(0xc43)](0x6e, 0x66, 0x82, 0x50, 0x82, 62.5),
        ru[zw(0xc43)](0x82, 62.5, 0x82, 0x19, 0x64, 0x19),
        ru[zw(0xc43)](0x55, 0x19, 0x4b, 0x25, 0x4b, 0x28),
        (ru[zw(0x2d4)] = zw(0xdff)),
        ru[zw(0xec9)](),
        (ru[zw(0x92c)] = ru[zw(0xe5e)] = zw(0x2d8)),
        (ru[zw(0x9a7)] = zw(0x670)),
        (ru[zw(0x38e)] = 0xc),
        ru[zw(0x2c1)](),
        ru[zw(0xa10)]();
    }
    for (let ru = 0x0; ru < dC[uf(0x4cf)]; ru++) {
      const rv = dC[ru];
      if (rv[uf(0x807)] !== void 0x0)
        switch (rv[uf(0x807)]) {
          case df[uf(0xc94)]:
            rv[uf(0x461)] = function (rw) {
              const zx = uf;
              rw[zx(0xd07)](2.5, 2.5), lO(rw);
            };
            break;
          case df[uf(0x978)]:
            rv[uf(0x461)] = function (rw) {
              const zy = uf;
              rw[zy(0x264)](0.9);
              const rx = pF();
              (rx[zy(0xdfb)] = !![]), rx[zy(0xc34)](rw);
            };
            break;
          case df[uf(0x672)]:
            rv[uf(0x461)] = function (rw) {
              const zz = uf;
              rw[zz(0xa38)](-Math["PI"] / 0x2),
                rw[zz(0xd15)](-0x30, 0x0),
                pE[zz(0xde1)](rw, ![]);
            };
            break;
          case df[uf(0x696)]:
            rv[uf(0x461)] = function (rw) {
              const zA = uf;
              rw[zA(0xa38)](Math["PI"] / 0xa),
                rw[zA(0xd15)](0x3, 0x15),
                lP(rw, !![]);
            };
            break;
          case df[uf(0xe5b)]:
            rv[uf(0x461)] = function (rw) {
              nm(rw);
            };
            break;
          case df[uf(0xdf7)]:
            rv[uf(0x461)] = function (rw) {
              const zB = uf;
              rw[zB(0xd15)](0x0, 0x3),
                rw[zB(0xa38)](-Math["PI"] / 0x4),
                rw[zB(0x264)](0.4),
                pE[zB(0x36d)](rw),
                rw[zB(0xc3a)](),
                rw[zB(0x54b)](0x0, 0x0, 0x21, 0x0, Math["PI"] * 0x2),
                (rw[zB(0x38e)] = 0x8),
                (rw[zB(0x9a7)] = zB(0xe26)),
                rw[zB(0x2c1)]();
            };
            break;
          case df[uf(0x215)]:
            rv[uf(0x461)] = function (rw) {
              const zC = uf;
              rw[zC(0xd15)](0x0, 0x7),
                rw[zC(0x264)](0.8),
                pE[zC(0x1ed)](rw, 0.5);
            };
            break;
          case df[uf(0xa8e)]:
            rv[uf(0x461)] = function (rw) {
              const zD = uf;
              rw[zD(0x264)](1.3), lS(rw);
            };
            break;
          default:
            rv[uf(0x461)] = function (rw) {};
        }
      else {
        const rw = new lG(
          -0x1,
          rv[uf(0x2dc)],
          0x0,
          0x0,
          rv[uf(0xa96)],
          rv[uf(0x9fd)] ? 0x10 : rv[uf(0xc39)] * 1.1,
          0x0
        );
        (rw[uf(0x919)] = !![]),
          rv[uf(0x457)] === 0x1
            ? (rv[uf(0x461)] = function (rx) {
                const zE = uf;
                rw[zE(0xc34)](rx);
              })
            : (rv[uf(0x461)] = function (rx) {
                const zF = uf;
                for (let ry = 0x0; ry < rv[zF(0x457)]; ry++) {
                  rx[zF(0xc61)]();
                  const rz = (ry / rv[zF(0x457)]) * Math["PI"] * 0x2;
                  rv[zF(0xa20)]
                    ? rx[zF(0xd15)](...le(rv[zF(0x5b9)], 0x0, rz))
                    : (rx[zF(0xa38)](rz), rx[zF(0xd15)](rv[zF(0x5b9)], 0x0)),
                    rx[zF(0xa38)](rv[zF(0xc2a)]),
                    rw[zF(0xc34)](rx),
                    rx[zF(0xa10)]();
                }
              });
      }
    }
    const nn = {};
    (nn[uf(0x471)] = uf(0x701)),
      (nn[uf(0x61e)] = uf(0x82e)),
      (nn[uf(0xc1f)] = uf(0xc4f)),
      (nn[uf(0xbd6)] = uf(0x953)),
      (nn[uf(0x95b)] = uf(0x334)),
      (nn[uf(0x20d)] = uf(0xed0)),
      (nn[uf(0xc49)] = uf(0x32c));
    var no = nn;
    function np() {
      const zG = uf,
        rx = document[zG(0x992)](zG(0x368));
      let ry = zG(0x1f4);
      for (let rz = 0x0; rz < 0xc8; rz++) {
        const rA = d6(rz),
          rB = 0xc8 * rA,
          rC = 0x19 * rA,
          rD = d5(rz);
        ry +=
          zG(0x55f) +
          (rz + 0x1) +
          zG(0x7d9) +
          k9(Math[zG(0x2d8)](rB)) +
          zG(0x7d9) +
          k9(Math[zG(0x2d8)](rC)) +
          zG(0x7d9) +
          rD +
          zG(0x5b2);
      }
      (ry += zG(0x7e5)), (ry += zG(0xc2e)), (rx[zG(0x8e1)] = ry);
    }
    np();
    function nq(rx, ry) {
      const zH = uf,
        rz = eM[rx],
        rA = rz[zH(0x786)],
        rB = rz[zH(0xb9c)];
      return (
        "x" +
        ry[zH(0x457)] * ry[zH(0xd44)] +
        ("\x20" + rA + zH(0xc5b) + hQ[rB] + zH(0x1e7) + hN[rB] + ")")
      );
    }
    function nr(rx) {
      const zI = uf;
      return rx[zI(0x56a)](0x2)[zI(0x6d2)](/\.?0+$/, "");
    }
    var ns = [
        [uf(0x530), uf(0x35c), no[uf(0x471)]],
        [uf(0x2d7), uf(0xcd7), no[uf(0x61e)]],
        [uf(0x846), uf(0x220), no[uf(0xc1f)]],
        [uf(0xa72), uf(0x2c2), no[uf(0xbd6)]],
        [uf(0x6ec), uf(0x6e7), no[uf(0x20d)]],
        [uf(0x604), uf(0x8a0), no[uf(0x95b)]],
        [uf(0x491), uf(0x33b), no[uf(0xc49)]],
        [uf(0xd62), uf(0xa6d), no[uf(0xc49)], (rx) => "+" + k9(rx)],
        [uf(0x531), uf(0x335), no[uf(0xc49)], (rx) => "+" + k9(rx)],
        [uf(0xbaf), uf(0xbdd), no[uf(0xc49)]],
        [
          uf(0x921),
          uf(0x7bb),
          no[uf(0xc49)],
          (rx) => Math[uf(0x2d8)](rx * 0x64) + "%",
        ],
        [uf(0x959), uf(0xb41), no[uf(0xc49)], (rx) => "+" + nr(rx) + uf(0x58c)],
        [uf(0xeb4), uf(0x967), no[uf(0xc1f)], (rx) => k9(rx) + "/s"],
        [uf(0xa3b), uf(0x967), no[uf(0xc1f)], (rx) => k9(rx) + uf(0xb1e)],
        [
          uf(0x71c),
          uf(0x1d3),
          no[uf(0xc49)],
          (rx) => (rx > 0x0 ? "+" : "") + rx,
        ],
        [uf(0x3bb), uf(0xe0d), no[uf(0x95b)], (rx) => "+" + rx + "%"],
        [
          uf(0x6c1),
          uf(0xa7b),
          no[uf(0x95b)],
          (rx) => "+" + parseInt(rx * 0x64) + "%",
        ],
        [uf(0x1ef), uf(0x6d6), no[uf(0xc49)], (rx) => "-" + rx + "%"],
        [uf(0xced), uf(0xdbb), no[uf(0xc49)], nq],
        [uf(0x678), uf(0xe7f), no[uf(0x95b)], (rx) => rx / 0x3e8 + "s"],
        [uf(0xbac), uf(0xab7), no[uf(0x95b)], (rx) => rx + "s"],
        [uf(0x7ce), uf(0x4d4), no[uf(0x95b)], (rx) => k9(rx) + uf(0x416)],
        [uf(0x895), uf(0x567), no[uf(0x95b)], (rx) => rx + "s"],
        [uf(0x9fa), uf(0x98e), no[uf(0x95b)], (rx) => rx / 0x3e8 + "s"],
        [uf(0xb80), uf(0x860), no[uf(0x95b)]],
        [uf(0xbf5), uf(0xb06), no[uf(0x95b)]],
        [uf(0x722), uf(0xc09), no[uf(0x95b)], (rx) => rx + uf(0xb3e)],
        [uf(0xda7), uf(0x2a4), no[uf(0x95b)], (rx) => rx + uf(0xb3e)],
        [uf(0xa65), uf(0x9a8), no[uf(0x95b)]],
        [uf(0x6f5), uf(0x65b), no[uf(0xc49)]],
        [uf(0x463), uf(0xac3), no[uf(0x95b)], (rx) => rx / 0x3e8 + "s"],
        [uf(0xca7), uf(0xafa), no[uf(0xc1f)], (rx) => k9(rx) + "/s"],
        [uf(0x53c), uf(0x5e6), no[uf(0x95b)]],
        [uf(0xaa3), uf(0x59d), no[uf(0xc49)]],
        [
          uf(0x20b),
          uf(0x2d2),
          no[uf(0x95b)],
          (rx, ry) => nr(rx * ry[uf(0xc39)]),
        ],
        [uf(0xcc8), uf(0xea9), no[uf(0x95b)]],
        [uf(0x3df), uf(0xe2e), no[uf(0xc49)]],
        [uf(0xc3b), uf(0xdea), no[uf(0x95b)]],
        [uf(0x735), uf(0xe81), no[uf(0x95b)]],
        [uf(0xc6d), uf(0xe1c), no[uf(0x95b)]],
        [
          uf(0x4e9),
          uf(0xbe8),
          no[uf(0x95b)],
          (rx) => "+" + nr(rx * 0x64) + "%",
        ],
        [uf(0x486), uf(0xcde), no[uf(0x20d)]],
        [uf(0x712), uf(0xc95), no[uf(0x95b)]],
        [uf(0x649), uf(0x60f), no[uf(0xc1f)]],
        [uf(0x5b7), uf(0xab7), no[uf(0x95b)], (rx) => rx + "s"],
        [uf(0x918), uf(0x73b), no[uf(0x95b)]],
        [uf(0xdf0), uf(0x891), no[uf(0xc49)], (rx) => rx / 0x3e8 + "s"],
      ],
      nt = [
        [uf(0x1f0), uf(0xcb3), no[uf(0x95b)]],
        [uf(0xbdb), uf(0x85b), no[uf(0xc49)], (rx) => k9(rx * 0x64) + "%"],
        [uf(0x450), uf(0xec6), no[uf(0xc49)]],
        [uf(0xc33), uf(0xa2d), no[uf(0x95b)]],
        [uf(0x5d8), uf(0x771), no[uf(0xc49)]],
        [uf(0x3bb), uf(0xe0d), no[uf(0x95b)], (rx) => "+" + rx + "%"],
        [uf(0x782), uf(0xd19), no[uf(0x95b)], (rx) => k9(rx) + "/s"],
        [uf(0x2d3), uf(0x3b1), no[uf(0x471)], (rx) => rx * 0x64 + uf(0x794)],
        [uf(0x801), uf(0x7e9), no[uf(0x95b)], (rx) => rx + "s"],
        [
          uf(0xa60),
          uf(0xc76),
          no[uf(0xc49)],
          (rx) => "-" + parseInt((0x1 - rx) * 0x64) + "%",
        ],
      ];
    function nu(rx, ry = !![]) {
      const zJ = uf;
      let rz = "",
        rA = "",
        rB;
      rx[zJ(0x807)] === void 0x0
        ? ((rB = ns),
          rx[zJ(0xd8b)] &&
            (rA =
              zJ(0x404) +
              (rx[zJ(0xd8b)] / 0x3e8 +
                "s" +
                (rx[zJ(0x4ef)] > 0x0
                  ? zJ(0x9dc) + rx[zJ(0x4ef)] / 0x3e8 + "s"
                  : "")) +
              zJ(0x597)))
        : (rB = nt);
      for (let rD = 0x0; rD < rB[zJ(0x4cf)]; rD++) {
        const [rE, rF, rG, rH] = rB[rD],
          rI = rx[rE];
        rI &&
          rI !== 0x0 &&
          (rz +=
            zJ(0x1c7) +
            rG +
            zJ(0x81c) +
            rF +
            zJ(0x647) +
            (rH ? rH(rI, rx) : k9(rI)) +
            zJ(0x464));
      }
      const rC = nA(
        zJ(0x8a3) +
          rx[zJ(0x786)] +
          zJ(0x8ec) +
          hN[rx[zJ(0xb9c)]] +
          zJ(0x570) +
          hQ[rx[zJ(0xb9c)]] +
          zJ(0x61f) +
          rA +
          zJ(0x7f2) +
          rx[zJ(0xb66)] +
          zJ(0x61f) +
          rz +
          zJ(0xbb4)
      );
      if (rx[zJ(0xa82)] && ry) {
        rC[zJ(0xb69)][zJ(0x35a)][zJ(0x56d)] = zJ(0x415);
        for (let rJ = 0x0; rJ < rx[zJ(0xa82)][zJ(0x4cf)]; rJ++) {
          const [rK, rL] = rx[zJ(0xa82)][rJ],
            rM = nA(zJ(0xc85));
          rC[zJ(0x962)](rM);
          const rN = f5[rL][rx[zJ(0xb9c)]];
          for (let rO = 0x0; rO < rN[zJ(0x4cf)]; rO++) {
            const [rP, rQ] = rN[rO],
              rR = eW(rK, rQ),
              rS = nA(
                zJ(0x714) +
                  rR[zJ(0xb9c)] +
                  "\x22\x20" +
                  qk(rR) +
                  zJ(0x944) +
                  rP +
                  zJ(0xe4e)
              );
            rM[zJ(0x962)](rS);
          }
        }
      }
      return rC;
    }
    function nv() {
      const zK = uf;
      mt && (mt[zK(0x218)](), (mt = null));
      const rx = ko[zK(0x523)](zK(0x90d));
      for (let ry = 0x0; ry < rx[zK(0x4cf)]; ry++) {
        const rz = rx[ry];
        rz[zK(0x218)]();
      }
      for (let rA = 0x0; rA < iO; rA++) {
        const rB = nA(zK(0x38b));
        rB[zK(0x351)] = rA;
        const rC = iP[rA];
        if (rC) {
          const rD = nA(
            zK(0xdb9) + rC[zK(0xb9c)] + "\x22\x20" + qk(rC) + zK(0x74b)
          );
          (rD[zK(0x45d)] = rC),
            (rD[zK(0xa32)] = !![]),
            (rD[zK(0x58f)] = iR[zK(0x315)]()),
            nz(rD, rC),
            rB[zK(0x962)](rD),
            (iQ[rD[zK(0x58f)]] = rD);
        }
        rA >= iN
          ? (rB[zK(0x962)](nA(zK(0x2a1) + ((rA - iN + 0x1) % 0xa) + zK(0x33d))),
            nl[zK(0x962)](rB))
          : nk[zK(0x962)](rB);
      }
    }
    function nw(rx) {
      const zL = uf;
      return rx < 0.5
        ? 0x4 * rx * rx * rx
        : 0x1 - Math[zL(0x367)](-0x2 * rx + 0x2, 0x3) / 0x2;
    }
    var nx = [];
    function ny(rx, ry) {
      const zM = uf;
      (rx[zM(0x5df)] = 0x0), (rx[zM(0xb12)] = 0x1);
      let rz = 0x1,
        rA = 0x0,
        rB = -0x1;
      rx[zM(0x2ae)][zM(0x6b1)](zM(0xd61)), rx[zM(0x99c)](zM(0x35a), "");
      const rC = nA(zM(0xcbc));
      rx[zM(0x962)](rC), nx[zM(0x9ee)](rC);
      const rD = qc;
      rC[zM(0x8df)] = rC[zM(0xb7f)] = rD;
      const rE = rC[zM(0x1c6)]("2d");
      (rC[zM(0x24b)] = function () {
        const zN = zM;
        rE[zN(0x651)](0x0, 0x0, rD, rD);
        rA < 0.99 &&
          ((rE[zN(0x28b)] = 0x1 - rA),
          (rE[zN(0x2d4)] = zN(0x92d)),
          rE[zN(0x756)](0x0, 0x0, rD, (0x1 - rz) * rD));
        if (rA < 0.01) return;
        (rE[zN(0x28b)] = rA),
          rE[zN(0xc61)](),
          rE[zN(0x264)](rD / 0x64),
          rE[zN(0xd15)](0x32, 0x2d);
        let rF = rx[zN(0x5df)];
        rF = nw(rF);
        const rG = Math["PI"] * 0x2 * rF;
        rE[zN(0xa38)](rG * 0x4),
          rE[zN(0xc3a)](),
          rE[zN(0xd7c)](0x0, 0x0),
          rE[zN(0x54b)](0x0, 0x0, 0x64, 0x0, rG),
          rE[zN(0xd7c)](0x0, 0x0),
          rE[zN(0x54b)](0x0, 0x0, 0x64, 0x0, Math["PI"] * 0x2, !![]),
          (rE[zN(0x2d4)] = zN(0x49c)),
          rE[zN(0xec9)](zN(0x2b2)),
          rE[zN(0xa10)]();
      }),
        (rC[zM(0x30b)] = function () {
          const zO = zM;
          rx[zO(0x5df)] += pA / (ry[zO(0xd8b)] + 0xc8);
          let rF = 0x1,
            rG = rx[zO(0xb12)];
          rx[zO(0x5df)] >= 0x1 && (rF = 0x0);
          const rH = rx[zO(0xc86)] || rx[zO(0xcbd)];
          ((rH && rH[zO(0xcbd)] === nl) || !iy) && ((rG = 0x1), (rF = 0x0));
          (rA = pg(rA, rF, 0x64)), (rz = pg(rz, rG, 0x64));
          const rI = Math[zO(0x2d8)]((0x1 - rz) * 0x64),
            rJ = Math[zO(0x2d8)](rA * 0x64) / 0x64;
          rJ == 0x0 && rI <= 0x0
            ? ((rC[zO(0xae5)] = ![]), (rC[zO(0x35a)][zO(0xbe5)] = zO(0x5d0)))
            : ((rC[zO(0xae5)] = !![]), (rC[zO(0x35a)][zO(0xbe5)] = "")),
            (rB = rI);
        }),
        rx[zM(0x962)](nA(zM(0x887) + qk(ry) + zM(0x74b)));
    }
    function nz(rx, ry, rz = !![]) {
      const zP = uf;
      rz && ry[zP(0x807)] === void 0x0 && ny(rx, ry);
    }
    function nA(rx) {
      const zQ = uf;
      return (hB[zQ(0x8e1)] = rx), hB[zQ(0x44e)][0x0];
    }
    var nB = document[uf(0x992)](uf(0x9f4)),
      nC = [];
    function nD() {
      const zR = uf;
      (nB[zR(0x8e1)] = zR(0x54f)[zR(0x2fd)](eL * dH)),
        (nC = Array[zR(0x4a2)](nB[zR(0x44e)]));
    }
    nD();
    var nE = {};
    for (let rx = 0x0; rx < eK[uf(0x4cf)]; rx++) {
      const ry = eK[rx];
      !nE[ry[uf(0x2dc)]] &&
        ((nE[ry[uf(0x2dc)]] = new lG(
          -0x1,
          ry[uf(0x2dc)],
          0x0,
          0x0,
          ry[uf(0xa17)] ? 0x0 : (-Math["PI"] * 0x3) / 0x4,
          ry[uf(0x8c9)],
          0x1
        )),
        (nE[ry[uf(0x2dc)]][uf(0x919)] = !![]));
      const rz = nE[ry[uf(0x2dc)]];
      let rA = null;
      ry[uf(0x2a8)] !== void 0x0 &&
        (rA = new lG(-0x1, ry[uf(0x2a8)], 0x0, 0x0, 0x0, ry[uf(0x8c9)], 0x1)),
        (ry[uf(0x461)] = function (rB) {
          const zS = uf;
          rB[zS(0xd07)](0.5, 0.5),
            rz[zS(0xc34)](rB),
            rA &&
              (rB[zS(0xa38)](rz[zS(0x297)]),
              rB[zS(0xd15)](-ry[zS(0x8c9)] * 0x2, 0x0),
              rA[zS(0xc34)](rB));
        });
    }
    function nF(rB, rC = ![]) {
      const zT = uf,
        rD = nA(zT(0xdb9) + rB[zT(0xb9c)] + "\x22\x20" + qk(rB) + zT(0x74b));
      jY(rD), (rD[zT(0x45d)] = rB);
      if (rC) return rD;
      const rE = dH * rB[zT(0x793)] + rB[zT(0xb9c)],
        rF = nC[rE];
      return nB[zT(0xc7b)](rD, rF), rF[zT(0x218)](), (nC[rE] = rD), rD;
    }
    var nG = document[uf(0x992)](uf(0x7e4)),
      nH = document[uf(0x992)](uf(0xe3d)),
      nI = document[uf(0x992)](uf(0x927)),
      nJ = document[uf(0x992)](uf(0x40f)),
      nK = document[uf(0x992)](uf(0x356)),
      nL = nK[uf(0x992)](uf(0xb15)),
      nM = nK[uf(0x992)](uf(0xd85)),
      nN = document[uf(0x992)](uf(0xc6e)),
      nO = document[uf(0x992)](uf(0xd4f)),
      nP = ![],
      nQ = 0x0,
      nR = ![];
    (nH[uf(0x4fe)] = function () {
      (nP = !![]), (nQ = 0x0), (nR = ![]);
    }),
      (nJ[uf(0x4fe)] = function () {
        const zU = uf;
        if (this[zU(0x2ae)][zU(0xb8c)](zU(0xb6c)) || jy) return;
        kI(zU(0x6f3), (rB) => {
          rB && ((nP = !![]), (nQ = 0x0), (nR = !![]));
        });
      }),
      (nG[uf(0x8e1)] = uf(0x54f)[uf(0x2fd)](dG * dH));
    var nS = Array[uf(0x4a2)](nG[uf(0x44e)]),
      nT = document[uf(0x992)](uf(0xe84)),
      nU = {};
    function nV() {
      const zV = uf;
      for (let rB in nU) {
        nU[rB][zV(0x4da)]();
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
        rC = Array[zW(0x4a2)](rB[zW(0x523)](zW(0x90d)));
      rC[zW(0x76e)]((rD, rE) => {
        const zX = zW,
          rF = rE[zX(0x45d)][zX(0xb9c)] - rD[zX(0x45d)][zX(0xb9c)];
        return rF === 0x0 ? rE[zX(0x45d)]["id"] - rD[zX(0x45d)]["id"] : rF;
      });
      for (let rD = 0x0; rD < rC[zW(0x4cf)]; rD++) {
        const rE = rC[rD];
        rB[zW(0x962)](rE);
      }
    }
    function nY(rB, rC) {
      const zY = uf,
        rD = rC[zY(0xb9c)] - rB[zY(0xb9c)];
      return rD === 0x0 ? rC["id"] - rB["id"] : rD;
    }
    function nZ(rB, rC = !![]) {
      const zZ = uf,
        rD = nA(zZ(0xe9c) + rB[zZ(0xb9c)] + "\x22\x20" + qk(rB) + zZ(0x3ea));
      setTimeout(function () {
        const A0 = zZ;
        rD[A0(0x2ae)][A0(0x218)](A0(0x2cc));
      }, 0x1f4),
        (rD[zZ(0x45d)] = rB);
      if (rC) {
      }
      return (rD[zZ(0x3da)] = rD[zZ(0x992)](zZ(0xe31))), rD;
    }
    var o0 = nA(uf(0xd0a)),
      o1 = o0[uf(0x992)](uf(0x2d0)),
      o2 = o0[uf(0x992)](uf(0x9c2)),
      o3 = o0[uf(0x992)](uf(0x9cb)),
      o4 = [];
    for (let rB = 0x0; rB < 0x5; rB++) {
      const rC = nA(uf(0x54f));
      (rC[uf(0xb08)] = function (rD = 0x0) {
        const A1 = uf,
          rE =
            (rB / 0x5) * Math["PI"] * 0x2 -
            Math["PI"] / 0x2 +
            rD * Math["PI"] * 0x6,
          rF =
            0x32 +
            (rD > 0x0
              ? Math[A1(0xc8b)](Math[A1(0x46b)](rD * Math["PI"] * 0x6)) * -0xf
              : 0x0);
        (this[A1(0x35a)][A1(0xeb2)] = Math[A1(0xd3d)](rE) * rF + 0x32 + "%"),
          (this[A1(0x35a)][A1(0x928)] = Math[A1(0x46b)](rE) * rF + 0x32 + "%");
      }),
        rC[uf(0xb08)](),
        (rC[uf(0x457)] = 0x0),
        (rC["el"] = null),
        (rC[uf(0x254)] = function () {
          const A2 = uf;
          (rC[A2(0x457)] = 0x0), (rC["el"] = null), (rC[A2(0x8e1)] = "");
        }),
        (rC[uf(0x25b)] = function (rD) {
          const A3 = uf;
          if (!rC["el"]) {
            const rE = nZ(oJ, ![]);
            (rE[A3(0x4fe)] = function () {
              if (oL || oN) return;
              oR(null);
            }),
              rC[A3(0x962)](rE),
              (rC["el"] = rE);
          }
          (rC[A3(0x457)] += rD), oP(rC["el"][A3(0x3da)], rC[A3(0x457)]);
        }),
        o1[uf(0x962)](rC),
        o4[uf(0x9ee)](rC);
    }
    var o5,
      o6 = document[uf(0x992)](uf(0x67f)),
      o7 = document[uf(0x992)](uf(0x9cc)),
      o8 = document[uf(0x992)](uf(0x2ab)),
      o9 = document[uf(0x992)](uf(0x8f3)),
      oa = {};
    function ob() {
      const A4 = uf,
        rD = document[A4(0x992)](A4(0x971));
      for (let rE = 0x0; rE < dH; rE++) {
        const rF = nA(A4(0x97f) + rE + A4(0xcba));
        (rF[A4(0x4fe)] = function () {
          const A5 = A4;
          let rG = p9;
          p9 = !![];
          for (const rH in nU) {
            const rI = dC[rH];
            if (rI[A5(0xb9c)] !== rE) continue;
            const rJ = nU[rH];
            rJ[A5(0x9b6)][A5(0x5f2)]();
          }
          p9 = rG;
        }),
          (oa[rE] = rF),
          rD[A4(0x962)](rF);
      }
    }
    ob();
    var oc = ![],
      od = document[uf(0x992)](uf(0xc54));
    od[uf(0x4fe)] = function () {
      const A6 = uf;
      document[A6(0x92f)][A6(0x2ae)][A6(0x622)](A6(0xbe4)),
        (oc = document[A6(0x92f)][A6(0x2ae)][A6(0xb8c)](A6(0xbe4)));
      const rD = oc ? A6(0x8e4) : A6(0xd50);
      k8(o7, rD),
        k8(o9, rD),
        oc
          ? (o6[A6(0x962)](o0), o0[A6(0x962)](nG), o8[A6(0x218)]())
          : (o6[A6(0x962)](o8),
            o8[A6(0xc7b)](nG, o8[A6(0xb69)]),
            o0[A6(0x218)]());
    };
    var oe = document[uf(0x992)](uf(0xc81)),
      of = oi(uf(0xa6d), no[uf(0x61e)]),
      og = oi(uf(0x74d), no[uf(0x471)]),
      oh = oi(uf(0x397), no[uf(0x20d)]);
    function oi(rD, rE) {
      const A7 = uf,
        rF = nA(A7(0x6b7) + rE + A7(0x4cb) + rD + A7(0xe14));
      return (
        (rF[A7(0xa58)] = function (rG) {
          const A8 = A7;
          k8(rF[A8(0x44e)][0x1], k9(Math[A8(0x2d8)](rG)));
        }),
        oe[A7(0x962)](rF),
        rF
      );
    }
    var oj = document[uf(0x992)](uf(0xe19)),
      ok = document[uf(0x992)](uf(0xa19));
    ok[uf(0x8e1)] = "";
    var ol = document[uf(0x992)](uf(0xc46)),
      om = {};
    function on() {
      const A9 = uf;
      (ok[A9(0x8e1)] = ""), (ol[A9(0x8e1)] = "");
      const rD = {},
        rE = [];
      for (let rF in om) {
        const rG = dC[rF],
          rH = om[rF];
        (rD[rG[A9(0xb9c)]] = (rD[rG[A9(0xb9c)]] || 0x0) + rH),
          rE[A9(0x9ee)]([rG, rH]);
      }
      if (rE[A9(0x4cf)] === 0x0) {
        oj[A9(0x35a)][A9(0xbe5)] = A9(0x5d0);
        return;
      }
      (oj[A9(0x35a)][A9(0xbe5)] = ""),
        rE[A9(0x76e)]((rI, rJ) => {
          return nY(rI[0x0], rJ[0x0]);
        })[A9(0xbed)](([rI, rJ]) => {
          const Aa = A9,
            rK = nZ(rI);
          jY(rK), oP(rK[Aa(0x3da)], rJ), ok[Aa(0x962)](rK);
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
            Ab(0xc06) + k9(rH) + "\x20" + rG + Ab(0x570) + hP[rG] + Ab(0x5c7)
          );
          rD[Ab(0xd94)](rI);
        }
      }
      rF % 0x2 === 0x1 &&
        (rD[Ab(0x44e)][0x0][Ab(0x35a)][Ab(0x880)] = Ab(0x2cd));
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
          !hack.isEnabled('betterXP') ? Ac(0x3ed) + (or + 0x1) + Ac(0xafb) + iJ(ot) + "/" + iJ(ou) + Ac(0x6bf) : Ac(0x3ed) + (or + 0x1) + Ac(0xafb) + ot + "/" + ou + Ac(0x6bf)
        );
      const rE = d6(or);
      of[Ac(0xa58)](0xc8 * rE),
        og[Ac(0xa58)](0x19 * rE),
        oh[Ac(0xa58)](d5(or)),
        hack.hp = 0xc8 * rE,
        (ow = Math[Ac(0x36c)](0x1, ot / ou)),
        (oy = 0x0),
        (nJ[Ac(0x992)](Ac(0xae4))[Ac(0x8e1)] =
          or >= cH ? Ac(0x7fb) : Ac(0xaf3) + (cH + 0x1) + Ac(0xb75));
    }
    var oB = 0x0,
      oC = document[uf(0x992)](uf(0xb74));
    for (let rD = 0x0; rD < cZ[uf(0x4cf)]; rD++) {
      const [rE, rF] = cZ[rD],
        rG = j7[rE],
        rH = nA(
          uf(0xb18) +
            hP[rG] +
            uf(0x5bd) +
            rG +
            uf(0x94a) +
            (rF + 0x1) +
            uf(0xc3e)
        );
      (rH[uf(0x4fe)] = function () {
        const Ad = uf;
        if (or >= rF) {
          const rI = oC[Ad(0x992)](Ad(0xa52));
          rI && rI[Ad(0x2ae)][Ad(0x218)](Ad(0x233)),
            (oB = rD),
            (hD[Ad(0xd87)] = rD),
            this[Ad(0x2ae)][Ad(0x6b1)](Ad(0x233));
        }
      }),
        (cZ[rD][uf(0x462)] = rH),
        oC[uf(0x962)](rH);
    }
    function oD() {
      const Ae = uf,
        rI = parseInt(hD[Ae(0xd87)]) || 0x0;
      cZ[0x0][Ae(0x462)][Ae(0x5f2)](),
        cZ[Ae(0xbed)]((rJ, rK) => {
          const Af = Ae,
            rL = rJ[0x1];
          if (or >= rL) {
            rJ[Af(0x462)][Af(0x2ae)][Af(0x218)](Af(0xb6c));
            if (rI === rK) rJ[Af(0x462)][Af(0x5f2)]();
          } else rJ[Af(0x462)][Af(0x2ae)][Af(0x6b1)](Af(0xb6c));
        });
    }
    var oE = document[uf(0x992)](uf(0xae1));
    setInterval(() => {
      const Ag = uf;
      if (!o6[Ag(0x2ae)][Ag(0xb8c)](Ag(0xa7d))) return;
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
          const rM = oG(rL, op[rL][Ah(0x457)]);
          (rJ += rM), (rI += rM);
        }
        if (rJ > 0x0) {
          const rN = Math[Ah(0x36c)](0x19, (rJ / rI) * 0x64),
            rO = rN > 0x1 ? rN[Ah(0x56a)](0x2) : rN[Ah(0x56a)](0x5);
          k8(oE, "+" + rO + "%");
        }
      }
    }
    function oG(rI, rJ) {
      const Ai = uf,
        rK = dC[rI];
      if (!rK) return 0x0;
      const rL = rK[Ai(0xb9c)];
      return Math[Ai(0x367)](rL * 0xa, rL) * rJ;
    }
    var oH = document[uf(0x992)](uf(0x658));
    (oH[uf(0x4fe)] = function () {
      const Aj = uf;
      for (const rI in op) {
        const rJ = op[rI];
        rJ[Aj(0x4da)]();
      }
      oI();
    }),
      oI(),
      oA();
    function oI() {
      const Ak = uf,
        rI = Object[Ak(0x6f4)](op);
      nI[Ak(0x2ae)][Ak(0x218)](Ak(0x867));
      const rJ = rI[Ak(0x4cf)] === 0x0;
      (oH[Ak(0x35a)][Ak(0xbe5)] = rJ ? Ak(0x5d0) : ""), (oz = 0x0);
      let rK = 0x0;
      const rL = rI[Ak(0x4cf)] > 0x1 ? 0x32 : 0x0;
      for (let rN = 0x0, rO = rI[Ak(0x4cf)]; rN < rO; rN++) {
        const rP = rI[rN],
          rQ = (rN / rO) * Math["PI"] * 0x2;
        rP[Ak(0xdac)](
          Math[Ak(0xd3d)](rQ) * rL + 0x32,
          Math[Ak(0x46b)](rQ) * rL + 0x32
        ),
          (oz += d3[rP["el"][Ak(0x45d)][Ak(0xb9c)]] * rP[Ak(0x457)]);
      }
      nI[Ak(0x2ae)][rL ? Ak(0x6b1) : Ak(0x218)](Ak(0x867)),
        nH[Ak(0x2ae)][rI[Ak(0x4cf)] > 0x0 ? Ak(0x218) : Ak(0x6b1)](Ak(0xac8));
      const rM = or >= cH;
      nJ[Ak(0x2ae)][rI[Ak(0x4cf)] > 0x0 && rM ? Ak(0x218) : Ak(0x6b1)](
        Ak(0xb6c)
      ),
        oF(),
        (nI[Ak(0x35a)][Ak(0x53f)] = ""),
        (nP = ![]),
        (nR = ![]),
        (nQ = 0x0),
        (ov = Math[Ak(0x36c)](0x1, (ot + oz) / ou) || 0x0),
        k8(nN, oz > 0x0 ? (!hack.isEnabled('betterXP') ? "+" + iJ(oz) + Ak(0x6bf) : "+" + oz + Ak(0x6bf)) : "");
    }
    var oJ,
      oK = 0x0,
      oL = ![],
      oM = 0x0,
      oN = null;
    function oO() {
      const Al = uf;
      o2[Al(0x2ae)][oK < 0x5 ? Al(0x6b1) : Al(0x218)](Al(0xac8));
    }
    o2[uf(0x4fe)] = function () {
      const Am = uf;
      if (oL || !oJ || oK < 0x5 || !ik() || oN) return;
      (oL = !![]), (oM = 0x0), (oN = null), o2[Am(0x2ae)][Am(0x6b1)](Am(0xac8));
      const rI = new DataView(new ArrayBuffer(0x1 + 0x2 + 0x4));
      rI[Am(0x75e)](0x0, cI[Am(0x68e)]),
        rI[Am(0xe46)](0x1, oJ["id"]),
        rI[Am(0x3f7)](0x3, oK),
        il(rI);
    };
    function oP(rI, rJ) {
      k8(rI, "x" + iJ(rJ));
    }
    function oQ(rI) {
      const An = uf;
      typeof rI === An(0x3f2) && (rI = nr(rI)), k8(o3, rI + An(0x67a));
    }
    function oR(rI) {
      const Ao = uf;
      oJ && mQ(oJ["id"], oK);
      o5 && o5[Ao(0x5f2)]();
      (oJ = rI), (oK = 0x0), oO();
      for (let rJ = 0x0; rJ < o4[Ao(0x4cf)]; rJ++) {
        o4[rJ][Ao(0x254)]();
      }
      oJ
        ? (oQ(dE[oJ[Ao(0xb9c)]] * (jy ? 0x2 : 0x1) * (he ? 0.9 : 0x1)),
          (o2[Ao(0x35a)][Ao(0x2f3)] = hQ[oJ[Ao(0xb9c)] + 0x1]))
        : oQ("?");
    }
    var oS = 0x0,
      oT = 0x1;
    function oU(rI) {
      const Ap = uf,
        rJ = dC[rI],
        rK = nZ(rJ);
      (rK[Ap(0x7e0)] = pc), jY(rK), (rK[Ap(0xc69)] = !![]), nT[Ap(0x962)](rK);
      const rL = nZ(rJ);
      jY(rL), (rL[Ap(0x7e0)] = o6);
      rJ[Ap(0xb9c)] >= dc && rL[Ap(0x2ae)][Ap(0x6b1)](Ap(0x606));
      rL[Ap(0x4fe)] = function () {
        const Aq = Ap;
        pz - oS < 0x1f4 ? oT++ : (oT = 0x1);
        oS = pz;
        if (oc) {
          if (oL || rJ[Aq(0xb9c)] >= dc) return;
          const rP = iS[rJ["id"]];
          if (!rP) return;
          oJ !== rJ && oR(rJ);
          const rQ = o4[Aq(0x4cf)];
          let rR = p9 ? rP : Math[Aq(0x36c)](rQ * oT, rP);
          mQ(rJ["id"], -rR), (oK += rR), oO();
          let rS = rR % rQ,
            rT = (rR - rS) / rQ;
          const rU = [...o4][Aq(0x76e)](
            (rW, rX) => rW[Aq(0x457)] - rX[Aq(0x457)]
          );
          rT > 0x0 && rU[Aq(0xbed)]((rW) => rW[Aq(0x25b)](rT));
          let rV = 0x0;
          while (rS--) {
            const rW = rU[rV];
            (rV = (rV + 0x1) % rQ), rW[Aq(0x25b)](0x1);
          }
          return;
        }
        if (!op[rJ["id"]]) {
          const rX = nZ(rJ, ![]);
          k8(rX[Aq(0x3da)], "x1"),
            (rX[Aq(0x4fe)] = function (rZ) {
              const Ar = Aq;
              rY[Ar(0x4da)](), oI();
            }),
            nI[Aq(0x962)](rX);
          const rY = {
            petal: rJ,
            count: 0x0,
            el: rX,
            setPos(rZ, s0) {
              const As = Aq;
              (rX[As(0x35a)][As(0xeb2)] = rZ + "%"),
                (rX[As(0x35a)][As(0x928)] = s0 + "%"),
                (rX[As(0x35a)][As(0xa24)] = As(0xdda));
            },
            dispose(rZ = !![]) {
              const At = Aq;
              rX[At(0x218)](),
                rZ && mQ(rJ["id"], this[At(0x457)]),
                delete op[rJ["id"]];
            },
          };
          (op[rJ["id"]] = rY), oI();
        }
        const rO = op[rJ["id"]];
        if (iS[rJ["id"]]) {
          const rZ = iS[rJ["id"]],
            s0 = p9 ? rZ : Math[Aq(0x36c)](0x1 * oT, rZ);
          (rO[Aq(0x457)] += s0),
            mQ(rJ["id"], -s0),
            oP(rO["el"][Aq(0x3da)], rO[Aq(0x457)]);
        }
        oI();
      };
      const rM = dH * rJ[Ap(0x793)] + rJ[Ap(0x266)],
        rN = nS[rM];
      return (
        nG[Ap(0xc7b)](rL, rN),
        rN[Ap(0x218)](),
        (nS[rM] = rL),
        (rK[Ap(0x1e5)] = function (rO) {
          const Au = Ap;
          oP(rK[Au(0x3da)], rO), oP(rL[Au(0x3da)], rO);
        }),
        (rK[Ap(0x9b6)] = rL),
        (nU[rI] = rK),
        (rK[Ap(0x4da)] = function () {
          const Av = Ap;
          rK[Av(0x218)](), delete nU[rI];
          const rO = nA(Av(0x54f));
          (nS[rM] = rO), nG[Av(0xc7b)](rO, rL), rL[Av(0x218)]();
        }),
        rK[Ap(0x1e5)](iS[rI]),
        rK
      );
    }
    var oV = {},
      oW = {};
    function oX(rI, rJ, rK, rL) {
      const Aw = uf,
        rM = document[Aw(0x992)](rK);
      (rM[Aw(0xe9f)] = function () {
        const Ax = Aw;
        (oV[rI] = this[Ax(0x1ea)]),
          (hD[rI] = this[Ax(0x1ea)] ? "1" : "0"),
          rL && rL(this[Ax(0x1ea)]);
      }),
        (oW[rI] = function () {
          const Ay = Aw;
          rM[Ay(0x5f2)]();
        }),
        (rM[Aw(0x1ea)] = hD[rI] === void 0x0 ? rJ : hD[rI] === "1"),
        rM[Aw(0xe9f)]();
    }
    var oY = document[uf(0x992)](uf(0x98d));
    (oY[uf(0x45d)] = function () {
      const Az = uf;
      return nA(
        Az(0x3ca) + hP[Az(0x855)] + Az(0x82b) + hP[Az(0xe3b)] + Az(0x549)
      );
    }),
      oX(uf(0xcfa), ![], uf(0xa79), mq),
      oX(uf(0xbf4), !![], uf(0x7a2)),
      oX(uf(0x9c8), !![], uf(0xcf3)),
      oX(
        uf(0x2f4),
        !![],
        uf(0x8a2),
        (rI) => (kK[uf(0x35a)][uf(0xbe5)] = rI ? "" : uf(0x5d0))
      ),
      oX(uf(0x8cd), ![], uf(0x1ca)),
      oX(uf(0xa8d), ![], uf(0x3be)),
      oX(uf(0x43d), ![], uf(0xe99)),
      oX(uf(0xc80), !![], uf(0xa4a)),
      oX(
        uf(0xcec),
        !![],
        uf(0x935),
        (rI) => (oY[uf(0x35a)][uf(0xbe5)] = rI ? "" : uf(0x5d0))
      ),
      oX(uf(0x54e), ![], uf(0x34d), kT),
      oX(uf(0xbc0), ![], uf(0x862), kX),
      oX(uf(0x395), ![], uf(0x352), (rI) => oZ(ko, uf(0xb11), rI)),
      oX(uf(0xa8f), !![], uf(0xd2a), (rI) =>
        oZ(document[uf(0x92f)], uf(0x4eb), !rI)
      ),
      oX(uf(0x629), !![], uf(0x986), (rI) =>
        oZ(document[uf(0x92f)], uf(0x94e), !rI)
      ),
      oX(uf(0x440), !![], uf(0xd96));
    function oZ(rI, rJ, rK) {
      const AA = uf;
      rI[AA(0x2ae)][rK ? AA(0x6b1) : AA(0x218)](rJ);
    }
    function p0() {
      const AB = uf,
        rI = document[AB(0x992)](AB(0x81a)),
        rJ = [];
      for (let rL = 0x0; rL <= 0xa; rL++) {
        rJ[AB(0x9ee)](0x1 - rL * 0.05);
      }
      for (const rM of rJ) {
        const rN = nA(AB(0xe95) + rM + "\x22>" + nr(rM * 0x64) + AB(0x253));
        rI[AB(0x962)](rN);
      }
      let rK = parseFloat(hD[AB(0x513)]);
      (isNaN(rK) || !rJ[AB(0x637)](rK)) && (rK = rJ[0x0]),
        (rI[AB(0x6f8)] = rK),
        (kP = rK),
        (rI[AB(0xe9f)] = function () {
          const AC = AB;
          (kP = parseFloat(this[AC(0x6f8)])),
            (hD[AC(0x513)] = this[AC(0x6f8)]),
            kX();
        });
    }
    p0();
    var p1 = document[uf(0x992)](uf(0x57f)),
      p2 = document[uf(0x992)](uf(0x86b));
    p2[uf(0x2e6)] = cL;
    var p3 = document[uf(0x992)](uf(0x3b5));
    function p4(rI) {
      const AD = uf,
        rJ = nA(AD(0x68b));
      kl[AD(0x962)](rJ);
      const rK = rJ[AD(0x992)](AD(0x87f));
      rK[AD(0x6f8)] = rI;
      const rL = rJ[AD(0x992)](AD(0x1dd));
      (rL[AD(0xe9f)] = function () {
        const AE = AD;
        rK[AE(0x2dc)] = this[AE(0x1ea)] ? AE(0xc5e) : AE(0xba1);
      }),
        (rJ[AD(0x992)](AD(0x715))[AD(0x4fe)] = function () {
          const AF = AD;
          jp(rI), hc(AF(0x75c));
        }),
        (rJ[AD(0x992)](AD(0xe91))[AD(0x4fe)] = function () {
          const AG = AD,
            rM = {};
          rM[AG(0x2dc)] = AG(0xb58);
          const rN = new Blob([rI], rM),
            rO = document[AG(0xde7)]("a");
          (rO[AG(0x66e)] = URL[AG(0xc12)](rN)),
            (rO[AG(0x916)] = (jv ? jv : AG(0x778)) + AG(0xe0a)),
            rO[AG(0x5f2)](),
            hc(AG(0x1f9));
        }),
        (rJ[AD(0x992)](AD(0xd4a))[AD(0x4fe)] = function () {
          const AH = AD;
          rJ[AH(0x218)]();
        });
    }
    function p5() {
      const AI = uf,
        rI = nA(AI(0x532));
      kl[AI(0x962)](rI);
      const rJ = rI[AI(0x992)](AI(0x87f)),
        rK = rI[AI(0x992)](AI(0x1dd));
      (rK[AI(0xe9f)] = function () {
        const AJ = AI;
        rJ[AJ(0x2dc)] = this[AJ(0x1ea)] ? AJ(0xc5e) : AJ(0xba1);
      }),
        (rI[AI(0x992)](AI(0xd4a))[AI(0x4fe)] = function () {
          const AK = AI;
          rI[AK(0x218)]();
        }),
        (rI[AI(0x992)](AI(0xebe))[AI(0x4fe)] = function () {
          const AL = AI,
            rL = rJ[AL(0x6f8)][AL(0x517)]();
          if (eV(rL)) {
            delete hD[AL(0x45a)], (hD[AL(0x353)] = rL);
            if (hU)
              try {
                hU[AL(0xc17)]();
              } catch (rM) {}
            hc(AL(0x69d));
          } else hc(AL(0xb30));
        });
    }
    (document[uf(0x992)](uf(0x996))[uf(0x4fe)] = function () {
      const AM = uf;
      if (i5) {
        p4(i5);
        return;
        const rI = prompt(AM(0xa01), i5);
        if (rI !== null) {
          const rJ = {};
          rJ[AM(0x2dc)] = AM(0xb58);
          const rK = new Blob([i5], rJ),
            rL = document[AM(0xde7)]("a");
          (rL[AM(0x66e)] = URL[AM(0xc12)](rK)),
            (rL[AM(0x916)] = jv + AM(0xe9a)),
            rL[AM(0x5f2)](),
            alert(AM(0xe57));
        }
      }
    }),
      (document[uf(0x992)](uf(0x2a0))[uf(0x4fe)] = function () {
        const AN = uf;
        p5();
        return;
        const rI = prompt(AN(0x2f7));
        if (rI !== null) {
          if (eV(rI)) {
            let rJ = AN(0xd47);
            i6 && (rJ += AN(0x246));
            if (confirm(rJ)) {
              delete hD[AN(0x45a)], (hD[AN(0x353)] = rI);
              if (hU)
                try {
                  hU[AN(0xc17)]();
                } catch (rK) {}
            }
          } else alert(AN(0xb30));
        }
      }),
      oX(uf(0x8ee), ![], uf(0x752), (rI) =>
        p2[uf(0x2ae)][rI ? uf(0x6b1) : uf(0x218)](uf(0x805))
      ),
      oX(uf(0xcc2), !![], uf(0xc0b));
    var p6 = 0x0,
      p7 = 0x0,
      p8 = 0x0,
      p9 = ![];
    function pa(rI, rJ) {
      const AO = uf;
      (rI === AO(0x89e) || rI === AO(0x51f)) && (p9 = rJ);
      if (rJ) {
        switch (rI) {
          case AO(0x5b8):
            m1[AO(0xe40)][AO(0x622)]();
            break;
          case AO(0xa95):
            m1[AO(0xc65)][AO(0x622)]();
            break;
          case AO(0x9d5):
            m1[AO(0x358)][AO(0x622)]();
            break;
          case AO(0xc4e):
            pM[AO(0x2ae)][AO(0x622)](AO(0x233));
            break;
          case AO(0xaee):
            oW[AO(0x8cd)](), hc(AO(0x4c3) + (oV[AO(0x8cd)] ? "ON" : AO(0x64a)));
            break;
          case AO(0x419):
            oW[AO(0xa8d)](), hc(AO(0x520) + (oV[AO(0xa8d)] ? "ON" : AO(0x64a)));
            break;
          case AO(0xaf8):
            oW[AO(0x2f4)](), hc(AO(0xe01) + (oV[AO(0x2f4)] ? "ON" : AO(0x64a)));
            break;
          case AO(0xb93):
            oW[AO(0x43d)](), hc(AO(0xd9f) + (oV[AO(0x43d)] ? "ON" : AO(0x64a)));
            break;
          case AO(0x216):
            if (!mt && hW) {
              const rK = nk[AO(0x523)](AO(0x874)),
                rL = nl[AO(0x523)](AO(0x874));
              for (let rM = 0x0; rM < rK[AO(0x4cf)]; rM++) {
                const rN = rK[rM],
                  rO = rL[rM],
                  rP = mT(rN),
                  rQ = mT(rO);
                if (rP) mU(rP, rO);
                else rQ && mU(rQ, rN);
              }
              il(new Uint8Array([cI[AO(0x993)]]));
            }
            break;
          default:
            if (!mt && hW && rI[AO(0x79d)](AO(0xc26)))
              rY: {
                let rR = parseInt(rI[AO(0xb26)](0x5));
                if (n8[AO(0xaf8)]) {
                  p9 ? ku(rR) : kx(rR);
                  break rY;
                }
                rR === 0x0 && (rR = 0xa);
                iN > 0xa && p9 && (rR += 0xa);
                rR--;
                if (rR >= 0x0) {
                  const rS = nk[AO(0x523)](AO(0x874))[rR],
                    rT = nl[AO(0x523)](AO(0x874))[rR];
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
        rI === AO(0x508) &&
          (kk[AO(0x35a)][AO(0xbe5)] === "" &&
          p2[AO(0x35a)][AO(0xbe5)] === AO(0x5d0)
            ? kD[AO(0x5f2)]()
            : p2[AO(0x211)]()),
          delete n8[rI];
      if (iy) {
        if (oV[AO(0xcfa)]) {
          let rW = 0x0,
            rX = 0x0;
          if (n8[AO(0x292)] || n8[AO(0xd16)]) rX = -0x1;
          else (n8[AO(0xa1e)] || n8[AO(0x854)]) && (rX = 0x1);
          if (n8[AO(0x856)] || n8[AO(0xc5c)]) rW = -0x1;
          else (n8[AO(0xaf4)] || n8[AO(0x5e1)]) && (rW = 0x1);
          if (rW !== 0x0 || rX !== 0x0)
            (p6 = Math[AO(0x84f)](rX, rW)), im(p6, 0x1);
          else (p7 !== 0x0 || p8 !== 0x0) && im(p6, 0x0);
          (p7 = rW), (p8 = rX);
        }
        pb();
      }
    }
    function pb() {
      const AP = uf,
        rI = n8[AP(0x6cf)] || n8[AP(0x51f)] || n8[AP(0x89e)],
        rJ = n8[AP(0x6dd)] || n8[AP(0xd45)],
        rK = (rI << 0x1) | rJ;
      mV !== rK && ((mV = rK), il(new Uint8Array([cI[AP(0xbca)], rK])));
    }
    var pc = document[uf(0x992)](uf(0x3e6)),
      pd = 0x0,
      pe = 0x0,
      pf = 0x0;
    function pg(rI, rJ, rK) {
      const AQ = uf;
      return rI + (rJ - rI) * Math[AQ(0x36c)](0x1, pA / rK);
    }
    var ph = 0x1,
      pi = [];
    for (let rI in cS) {
      if (
        [uf(0xec1), uf(0x31d), uf(0x4c0), uf(0xdb4), uf(0x3aa), uf(0x588)][
          uf(0x637)
        ](rI)
      )
        continue;
      pi[uf(0x9ee)](cS[rI]);
    }
    var pj = [];
    for (let rJ = 0x0; rJ < 0x1e; rJ++) {
      pk();
    }
    function pk(rK = !![]) {
      const AR = uf,
        rL = new lG(
          -0x1,
          pi[Math[AR(0xb02)](Math[AR(0xa69)]() * pi[AR(0x4cf)])],
          0x0,
          Math[AR(0xa69)]() * d1,
          Math[AR(0xa69)]() * 6.28
        );
      if (!rL[AR(0xb21)] && Math[AR(0xa69)]() < 0.01) rL[AR(0x9bc)] = !![];
      rL[AR(0xb21)]
        ? (rL[AR(0xc60)] = rL[AR(0xc39)] = Math[AR(0xa69)]() * 0x8 + 0xc)
        : (rL[AR(0xc60)] = rL[AR(0xc39)] = Math[AR(0xa69)]() * 0x1e + 0x19),
        rK
          ? (rL["x"] = Math[AR(0xa69)]() * d0)
          : (rL["x"] = -rL[AR(0xc39)] * 0x2),
        (rL[AR(0x24c)] =
          (Math[AR(0xa69)]() * 0x3 + 0x4) * rL[AR(0xc60)] * 0.02),
        (rL[AR(0xa21)] = (Math[AR(0xa69)]() * 0x2 - 0x1) * 0.05),
        pj[AR(0x9ee)](rL);
    }
    var pl = 0x0,
      pm = 0x0,
      pn = 0x0,
      po = 0x0;
    setInterval(function () {
      const AS = uf,
        rK = [ki, qe, ...Object[AS(0x6f4)](pp), ...nx],
        rL = rK[AS(0x4cf)];
      let rM = 0x0;
      for (let rN = 0x0; rN < rL; rN++) {
        const rO = rK[rN];
        rM += rO[AS(0x8df)] * rO[AS(0xb7f)];
      }
      kK[AS(0x99c)](
        AS(0x2c1),
        Math[AS(0x2d8)](0x3e8 / pA) +
          AS(0x323) +
          iw[AS(0x4cf)] +
          AS(0xa12) +
          rL +
          AS(0x360) +
          iJ(rM) +
          AS(0xa8c) +
          (po / 0x3e8)[AS(0x56a)](0x2) +
          AS(0x3c9)
      ),
        (po = 0x0);
    }, 0x3e8);
    var pp = {};
    function pq(rK, rL, rM, rN, rO, rP = ![]) {
      const AT = uf;
      if (!pp[rL]) {
        const rS = hx
          ? new OffscreenCanvas(0x1, 0x1)
          : document[AT(0xde7)](AT(0xbb7));
        (rS[AT(0x76b)] = rS[AT(0x1c6)]("2d")),
          (rS[AT(0x76d)] = 0x0),
          (rS[AT(0xa06)] = rM),
          (rS[AT(0x859)] = rN),
          (pp[rL] = rS);
      }
      const rQ = pp[rL],
        rR = rQ[AT(0x76b)];
      if (pz - rQ[AT(0x76d)] > 0x1f4) {
        rQ[AT(0x76d)] = pz;
        const rT = rK[AT(0xb00)](),
          rU = Math[AT(0x78b)](rT["a"], rT["b"]) * 1.5,
          rV = kW * rU,
          rW = Math[AT(0x333)](rQ[AT(0xa06)] * rV) || 0x1;
        rW !== rQ["w"] &&
          ((rQ["w"] = rW),
          (rQ[AT(0x8df)] = rW),
          (rQ[AT(0xb7f)] = Math[AT(0x333)](rQ[AT(0x859)] * rV) || 0x1),
          rR[AT(0xc61)](),
          rR[AT(0xd07)](rV, rV),
          rO(rR),
          rR[AT(0xa10)]());
      }
      rQ[AT(0x9ce)] = !![];
      if (rP) return rQ;
      rK[AT(0x4e8)](
        rQ,
        -rQ[AT(0xa06)] / 0x2,
        -rQ[AT(0x859)] / 0x2,
        rQ[AT(0xa06)],
        rQ[AT(0x859)]
      );
    }
    var pr = /^((?!chrome|android).)*safari/i[uf(0xbb3)](navigator[uf(0x6e6)]),
      ps = pr ? 0.25 : 0x0;
    function pt(rK, rL, rM = 0x14, rN = uf(0x7da), rO = 0x4, rP, rQ = "") {
      const AU = uf,
        rR = AU(0xa64) + rM + AU(0x37d) + iA;
      let rS, rT;
      const rU = rL + "_" + rR + "_" + rN + "_" + rO + "_" + rQ,
        rV = pp[rU];
      if (!rV) {
        rK[AU(0x98b)] = rR;
        const rW = rK[AU(0x50e)](rL);
        (rS = rW[AU(0x8df)] + rO), (rT = rM + rO);
      } else (rS = rV[AU(0xa06)]), (rT = rV[AU(0x859)]);
      return pq(
        rK,
        rU,
        rS,
        rT,
        function (rX) {
          const AV = AU;
          rX[AV(0xd15)](rO / 0x2, rO / 0x2 - rT * ps),
            (rX[AV(0x98b)] = rR),
            (rX[AV(0x7cd)] = AV(0x928)),
            (rX[AV(0x52f)] = AV(0xeb2)),
            (rX[AV(0x38e)] = rO),
            (rX[AV(0x9a7)] = AV(0x386)),
            (rX[AV(0x2d4)] = rN),
            rO > 0x0 && rX[AV(0x5e4)](rL, 0x0, 0x0),
            rX[AV(0x512)](rL, 0x0, 0x0);
        },
        rP
      );
    }
    var pu = 0x1;
    function pv(rK = cI[uf(0xa4b)]) {
      const AW = uf,
        rL = Object[AW(0x6f4)](op),
        rM = new DataView(
          new ArrayBuffer(0x1 + 0x2 + rL[AW(0x4cf)] * (0x2 + 0x4))
        );
      let rN = 0x0;
      rM[AW(0x75e)](rN++, rK), rM[AW(0xe46)](rN, rL[AW(0x4cf)]), (rN += 0x2);
      for (let rO = 0x0; rO < rL[AW(0x4cf)]; rO++) {
        const rP = rL[rO];
        rM[AW(0xe46)](rN, rP[AW(0x45d)]["id"]),
          (rN += 0x2),
          rM[AW(0x3f7)](rN, rP[AW(0x457)]),
          (rN += 0x4);
      }
      il(rM);
    }
    function pw() {
      const AX = uf;
      o5[AX(0x218)](), o1[AX(0x2ae)][AX(0x218)](AX(0x2e7)), (o5 = null);
    }
    var px = [];
    function py() {
      const AY = uf;
      for (let rK = 0x0; rK < px[AY(0x4cf)]; rK++) {
        const rL = px[rK],
          rM = rL[AY(0x511)],
          rN = rM && !rM[AY(0x613)];
        rN
          ? ((rL[AY(0x613)] = ![]),
            (rL[AY(0xe3c)] = rM[AY(0xe3c)]),
            (rL[AY(0x4f3)] = rM[AY(0x4f3)]),
            (rL[AY(0x4b3)] = rM[AY(0x4b3)]),
            (rL[AY(0xaf0)] = rM[AY(0xaf0)]),
            (rL[AY(0x72e)] = rM[AY(0x72e)]),
            (rL[AY(0x2d7)] = rM[AY(0x2d7)]),
            (rL[AY(0x67c)] = rM[AY(0x67c)]),
            (rL[AY(0xb82)] = rM[AY(0xb82)]),
            (rL[AY(0xab2)] = rM[AY(0xab2)]),
            (rL[AY(0xd04)] = rM[AY(0xd04)]),
            (rL[AY(0x28f)] = rM[AY(0x28f)]),
            (rL[AY(0xabe)] = rM[AY(0xabe)]),
            (rL[AY(0x2c0)] = rM[AY(0x2c0)]),
            (rL[AY(0x297)] = rM[AY(0x297)]),
            (rL[AY(0x7ce)] = rM[AY(0x7ce)]),
            j0(rL, rM))
          : ((rL[AY(0x613)] = !![]),
            (rL[AY(0x69a)] = 0x0),
            (rL[AY(0x4f3)] = 0x1),
            (rL[AY(0xe3c)] = 0x0),
            (rL[AY(0x4b3)] = ![]),
            (rL[AY(0xaf0)] = 0x0),
            (rL[AY(0x72e)] = 0x0),
            (rL[AY(0x67c)] = pg(rL[AY(0x67c)], 0x0, 0xc8)),
            (rL[AY(0x2d7)] = pg(rL[AY(0x2d7)], 0x0, 0xc8)),
            (rL[AY(0x7ce)] = pg(rL[AY(0x7ce)], 0x0, 0xc8)));
        if (rK > 0x0) {
          if (rM) {
            const rO = Math[AY(0x84f)](rM["y"] - pe, rM["x"] - pd);
            rL[AY(0xdb5)] === void 0x0
              ? (rL[AY(0xdb5)] = rO)
              : (rL[AY(0xdb5)] = f8(rL[AY(0xdb5)], rO, 0.1));
          }
          rL[AY(0x44d)] += ((rN ? -0x1 : 0x1) * pA) / 0x320;
          if (rL[AY(0x44d)] < 0x0) rL[AY(0x44d)] = 0x0;
          rL[AY(0x44d)] > 0x1 && px[AY(0x708)](rK, 0x1);
        }
      }
    }
    var pz = Date[uf(0x796)](),
      pA = 0x0,
      pB = 0x0,
      pC = pz;
    function pD() {
      const AZ = uf;
      (pz = Date[AZ(0x796)]()),
        (pA = pz - pC),
        (pC = pz),
        (pB = pA / 0x21),
        hd();
      let rK = 0x0;
      for (let rM = jX[AZ(0x4cf)] - 0x1; rM >= 0x0; rM--) {
        const rN = jX[rM];
        if (!rN[AZ(0x8eb)]) jX[AZ(0x708)](rM, 0x1);
        else {
          if (
            (rN[AZ(0x7e0)] &&
              !rN[AZ(0x7e0)][AZ(0x2ae)][AZ(0xb8c)](AZ(0xa7d))) ||
            rN[AZ(0xcbd)][AZ(0x35a)][AZ(0xbe5)] === AZ(0x5d0)
          )
            continue;
          else {
            jX[AZ(0x708)](rM, 0x1), rN[AZ(0x2ae)][AZ(0x218)](AZ(0xd61)), rK++;
            if (rK >= 0x14) break;
          }
        }
      }
      (pE[AZ(0x511)] = iy), py();
      kC[AZ(0x2ae)][AZ(0xb8c)](AZ(0xa7d)) && (lL = pz);
      if (hv) {
        const rO = pz / 0x50,
          rP = Math[AZ(0x46b)](rO) * 0x7,
          rQ = Math[AZ(0xc8b)](Math[AZ(0x46b)](rO / 0x4)) * 0.15 + 0.85;
        hu[AZ(0x35a)][AZ(0x53f)] = AZ(0x4a1) + rP + AZ(0x900) + rQ + ")";
      } else hu[AZ(0x35a)][AZ(0x53f)] = AZ(0x5d0);
      for (let rR = jc[AZ(0x4cf)] - 0x1; rR >= 0x0; rR--) {
        const rS = jc[rR];
        if (rS[AZ(0x75b)]) {
          jc[AZ(0x708)](rR, 0x1);
          continue;
        }
        rS[AZ(0xd72)]();
      }
      for (let rT = nx[AZ(0x4cf)] - 0x1; rT >= 0x0; rT--) {
        const rU = nx[rT];
        if (!rU[AZ(0x8eb)]) {
          nx[AZ(0x708)](rT, 0x1);
          continue;
        }
        rU[AZ(0x30b)]();
      }
      for (let rV = jb[AZ(0x4cf)] - 0x1; rV >= 0x0; rV--) {
        const rW = jb[rV];
        rW[AZ(0x75b)] &&
          rW["t"] <= 0x0 &&
          (rW[AZ(0x218)](), jb[AZ(0x708)](rV, 0x1)),
          (rW["t"] += ((rW[AZ(0x75b)] ? -0x1 : 0x1) * pA) / rW[AZ(0x8c5)]),
          (rW["t"] = Math[AZ(0x36c)](0x1, Math[AZ(0x525)](0x0, rW["t"]))),
          rW[AZ(0x30b)]();
      }
      for (let rX = mN[AZ(0x4cf)] - 0x1; rX >= 0x0; rX--) {
        const rY = mN[rX];
        if (!rY["el"][AZ(0x8eb)]) rY[AZ(0x579)] = ![];
        (rY[AZ(0x81d)] += ((rY[AZ(0x579)] ? 0x1 : -0x1) * pA) / 0xc8),
          (rY[AZ(0x81d)] = Math[AZ(0x36c)](
            0x1,
            Math[AZ(0x525)](rY[AZ(0x81d)])
          ));
        if (!rY[AZ(0x579)] && rY[AZ(0x81d)] <= 0x0) {
          mN[AZ(0x708)](rX, 0x1), rY[AZ(0x218)]();
          continue;
        }
        rY[AZ(0x35a)][AZ(0xc03)] = rY[AZ(0x81d)];
      }
      if (oL) {
        oM += pA / 0x7d0;
        if (oM > 0x1) {
          oM = 0x0;
          if (oN) {
            oL = ![];
            const rZ = oJ[AZ(0xa02)],
              s0 = oN[AZ(0x78f)];
            if (oN[AZ(0xbfe)] > 0x0)
              o4[AZ(0xbed)]((s1) => s1[AZ(0x254)]()),
                mQ(oJ["id"], s0),
                (oK = 0x0),
                oQ("?"),
                o1[AZ(0x2ae)][AZ(0x6b1)](AZ(0x2e7)),
                (o5 = nZ(rZ)),
                o1[AZ(0x962)](o5),
                oP(o5[AZ(0x3da)], oN[AZ(0xbfe)]),
                (o5[AZ(0x4fe)] = function () {
                  const B0 = AZ;
                  mQ(rZ["id"], oN[B0(0xbfe)]), pw(), (oN = null);
                });
            else {
              oK = s0;
              const s1 = [...o4][AZ(0x76e)](() => Math[AZ(0xa69)]() - 0.5);
              for (let s2 = 0x0, s3 = s1[AZ(0x4cf)]; s2 < s3; s2++) {
                const s4 = s1[s2];
                s2 >= s0 ? s4[AZ(0x254)]() : s4[AZ(0x25b)](0x1 - s4[AZ(0x457)]);
              }
              oN = null;
            }
            oO();
          }
        }
      }
      for (let s5 = 0x0; s5 < o4[AZ(0x4cf)]; s5++) {
        o4[s5][AZ(0xb08)](oM);
      }
      for (let s6 in n4) {
        const s7 = n4[s6];
        if (!s7) {
          delete n4[s6];
          continue;
        }
        for (let s8 = s7[AZ(0x4cf)] - 0x1; s8 >= 0x0; s8--) {
          const s9 = s7[s8];
          s9["t"] += pA;
          if (s9[AZ(0xbd1)]) s9["t"] > lX && s7[AZ(0x708)](s8, 0x1);
          else {
            if (s9["t"] > lU) {
              const sa = 0x1 - Math[AZ(0x36c)](0x1, (s9["t"] - lU) / 0x7d0);
              (s9[AZ(0x35a)][AZ(0xc03)] = sa),
                sa <= 0x0 && s7[AZ(0x708)](s8, 0x1);
            }
          }
        }
        s7[AZ(0x4cf)] === 0x0 && delete n4[s6];
      }
      if (nP)
        su: {
          if (ik()) {
            (nQ += pA),
              (nI[AZ(0x35a)][AZ(0x53f)] =
                AZ(0x296) +
                (Math[AZ(0x46b)](Date[AZ(0x796)]() / 0x32) * 0.1 + 0x1) +
                ")");
            if (nQ > 0x3e8) {
              if (nR) {
                pv(cI[AZ(0x4b5)]), m0(![]);
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
                  const sf = nl[AZ(0x44e)][se];
                  sf[AZ(0x351)] += sc;
                }
                const sd = nl[AZ(0xb69)][AZ(0x351)] + 0x1;
                for (let sg = 0x0; sg < sc; sg++) {
                  const sh = nA(AZ(0x38b));
                  (sh[AZ(0x351)] = iN + sg), nk[AZ(0x962)](sh);
                  const si = nA(AZ(0x38b));
                  (si[AZ(0x351)] = sd + sg),
                    si[AZ(0x962)](
                      nA(AZ(0x2a1) + ((sh[AZ(0x351)] + 0x1) % 0xa) + AZ(0x33d))
                    ),
                    nl[AZ(0x962)](si);
                }
                (iN = sb), (iO = iN * 0x2);
              }
            }
          } else (nP = ![]), (nR = ![]), (nQ = 0x0);
        }
      (oy = pg(oy, ow, 0x64)),
        (ox = pg(ox, ov, 0x64)),
        (nL[AZ(0x35a)][AZ(0x8df)] = oy * 0x64 + "%"),
        (nM[AZ(0x35a)][AZ(0x8df)] = ox * 0x64 + "%");
      for (let sj in pp) {
        !pp[sj][AZ(0x9ce)] ? delete pp[sj] : (pp[sj][AZ(0x9ce)] = ![]);
      }
      (mW = pg(mW, mY, 0x32)), (mX = pg(mX, mZ, 0x32));
      const rL = Math[AZ(0x36c)](0x64, pA) / 0x3c;
      pG -= 0x3 * rL;
      for (let sk = pj[AZ(0x4cf)] - 0x1; sk >= 0x0; sk--) {
        const sl = pj[sk];
        (sl["x"] += sl[AZ(0x24c)] * rL),
          (sl["y"] += Math[AZ(0x46b)](sl[AZ(0x297)] * 0x2) * 0.8 * rL),
          (sl[AZ(0x297)] += sl[AZ(0xa21)] * rL),
          (sl[AZ(0x2c0)] += 0.002 * pA),
          (sl[AZ(0xaa4)] = !![]);
        const sm = sl[AZ(0xc39)] * 0x2;
        (sl["x"] >= d0 + sm || sl["y"] < -sm || sl["y"] >= d1 + sm) &&
          (pj[AZ(0x708)](sk, 0x1), pk(![]));
      }
      for (let sn = 0x0; sn < iG[AZ(0x4cf)]; sn++) {
        iG[sn][AZ(0x30b)]();
      }
      pf = Math[AZ(0x525)](0x0, pf - pA / 0x12c);
      if (oV[AZ(0xbf4)] && pf > 0x0) {
        const so = Math[AZ(0xa69)]() * 0x2 * Math["PI"],
          sp = pf * 0x3;
        (qu = Math[AZ(0xd3d)](so) * sp), (qv = Math[AZ(0x46b)](so) * sp);
      } else (qu = 0x0), (qv = 0x0);
      (ph = pg(ph, pu, 0xc8)), (n1 = pg(n1, n0, 0x64));
      for (let sq = ms[AZ(0x4cf)] - 0x1; sq >= 0x0; sq--) {
        const sr = ms[sq];
        sr[AZ(0x30b)](), sr[AZ(0xdd2)] && ms[AZ(0x708)](sq, 0x1);
      }
      for (let ss = iw[AZ(0x4cf)] - 0x1; ss >= 0x0; ss--) {
        const st = iw[ss];
        st[AZ(0x30b)](),
          st[AZ(0x613)] && st[AZ(0x69a)] > 0x1 && iw[AZ(0x708)](ss, 0x1);
      }
      iy && ((pd = iy["x"]), (pe = iy["y"])), qs(), window[AZ(0x995)](pD);
    }
    var pE = pF();
    function pF() {
      const B1 = uf,
        rK = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[B1(0xcdb)], 0x19);
      return (rK[B1(0x44d)] = 0x1), rK;
    }
    var pG = 0x0,
      pH = [uf(0x9aa), uf(0x430), uf(0x302)],
      pI = [];
    for (let rK = 0x0; rK < 0x3; rK++) {
      for (let rL = 0x0; rL < 0x3; rL++) {
        const rM = pJ(pH[rK], 0x1 - 0.05 * rL);
        pI[uf(0x9ee)](rM);
      }
    }
    function pJ(rN, rO) {
      const B2 = uf;
      return pK(hA(rN)[B2(0x20a)]((rP) => rP * rO));
    }
    function pK(rN) {
      const B3 = uf;
      return rN[B3(0x609)](
        (rO, rP) => rO + parseInt(rP)[B3(0xe51)](0x10)[B3(0x60c)](0x2, "0"),
        "#"
      );
    }
    function pL(rN) {
      const B4 = uf;
      return B4(0xcc6) + rN[B4(0x76a)](",") + ")";
    }
    var pM = document[uf(0x992)](uf(0x1d6));
    function pN() {
      const B5 = uf,
        rN = document[B5(0xde7)](B5(0xbb7));
      rN[B5(0x8df)] = rN[B5(0xb7f)] = 0x3;
      const rO = rN[B5(0x1c6)]("2d");
      for (let rP = 0x0; rP < pI[B5(0x4cf)]; rP++) {
        const rQ = rP % 0x3,
          rR = (rP - rQ) / 0x3;
        (rO[B5(0x2d4)] = pI[rP]), rO[B5(0x756)](rQ, rR, 0x1, 0x1);
        const rS = j7[rP],
          rT = j8[rP],
          rU = nA(
            B5(0x299) +
              rT +
              B5(0x41a) +
              ((rR + 0.5) / 0x3) * 0x64 +
              B5(0xa80) +
              ((rQ + 0.5) / 0x3) * 0x64 +
              B5(0xc55) +
              rS +
              B5(0xb75)
          );
        pM[B5(0xc7b)](rU, pM[B5(0x44e)][0x0]);
      }
      pM[B5(0x35a)][B5(0xb03)] = B5(0xdf2) + rN[B5(0x5da)]() + ")";
    }
    pN();
    var pO = document[uf(0x992)](uf(0xabf)),
      pP = document[uf(0x992)](uf(0x619));
    function pQ(rN, rO, rP) {
      const B6 = uf;
      (rN[B6(0x35a)][B6(0xeb2)] = (rO / j2) * 0x64 + "%"),
        (rN[B6(0x35a)][B6(0x928)] = (rP / j2) * 0x64 + "%");
    }
    function pR() {
      const B7 = uf,
        rN = qx(),
        rO = d0 / 0x2 / rN,
        rP = d1 / 0x2 / rN,
        rQ = j4,
        rR = Math[B7(0x525)](0x0, Math[B7(0xb02)]((pd - rO) / rQ) - 0x1),
        rS = Math[B7(0x525)](0x0, Math[B7(0xb02)]((pe - rP) / rQ) - 0x1),
        rT = Math[B7(0x36c)](j5 - 0x1, Math[B7(0x333)]((pd + rO) / rQ)),
        rU = Math[B7(0x36c)](j5 - 0x1, Math[B7(0x333)]((pe + rP) / rQ));
      kj[B7(0xc61)](), kj[B7(0xd07)](rQ, rQ), kj[B7(0xc3a)]();
      for (let rV = rR; rV <= rT + 0x1; rV++) {
        kj[B7(0xd7c)](rV, rS), kj[B7(0xbc9)](rV, rU + 0x1);
      }
      for (let rW = rS; rW <= rU + 0x1; rW++) {
        kj[B7(0xd7c)](rR, rW), kj[B7(0xbc9)](rT + 0x1, rW);
      }
      kj[B7(0xa10)]();
      for (let rX = rR; rX <= rT; rX++) {
        for (let rY = rS; rY <= rU; rY++) {
          kj[B7(0xc61)](),
            kj[B7(0xd15)]((rX + 0.5) * rQ, (rY + 0.5) * rQ),
            pt(kj, rX + "," + rY, 0x28, B7(0x7da), 0x6),
            kj[B7(0xa10)]();
        }
      }
      (kj[B7(0x9a7)] = B7(0x92d)),
        (kj[B7(0x38e)] = 0xa),
        (kj[B7(0xe5e)] = B7(0x2d8)),
        kj[B7(0x2c1)]();
    }
    function pS(rN, rO) {
      const B8 = uf,
        rP = nA(B8(0x65d) + rN + B8(0x6cb) + rO + B8(0x3af)),
        rQ = rP[B8(0x992)](B8(0x251));
      return (
        km[B8(0x962)](rP),
        (rP[B8(0xa58)] = function (rR) {
          const B9 = B8;
          rR > 0x0 && rR !== 0x1
            ? (rQ[B9(0x99c)](B9(0x35a), B9(0xd36) + rR * 0x168 + B9(0xddb)),
              rP[B9(0x2ae)][B9(0x6b1)](B9(0xa7d)))
            : rP[B9(0x2ae)][B9(0x218)](B9(0xa7d));
        }),
        km[B8(0xc7b)](rP, pM),
        rP
      );
    }
    var pT = pS(uf(0x922), uf(0x6c4));
    pT[uf(0x2ae)][uf(0x6b1)](uf(0x928));
    var pU = nA(uf(0x341) + hP[uf(0x769)] + uf(0x21c));
    pT[uf(0x44e)][0x0][uf(0x962)](pU);
    var pV = pS(uf(0x8ff), uf(0x8a7)),
      pW = pS(uf(0x75f), uf(0xb72));
    pW[uf(0x2ae)][uf(0x6b1)](uf(0x328));
    var pX = uf(0x6d3),
      pY = 0x2bc,
      pZ = new lT("yt", 0x0, 0x0, Math["PI"] / 0x2, 0x1, cY[uf(0xcdb)], 0x19);
    pZ[uf(0xe3c)] = 0x0;
    var q0 = [
      [uf(0x6be), uf(0x4d3)],
      [uf(0xeb3), uf(0xe22)],
      [uf(0x84e), uf(0x24f)],
      [uf(0x7d5), uf(0xe36), uf(0x3a3)],
      [uf(0x226), uf(0x4a0)],
      [uf(0xde2), uf(0xa1a)],
      [uf(0x987), uf(0x392)],
    ];
    function q1() {
      const Ba = uf;
      let rN = "";
      const rO = q0[Ba(0x4cf)] - 0x1;
      for (let rP = 0x0; rP < rO; rP++) {
        const rQ = q0[rP][0x0];
        (rN += rQ),
          rP === rO - 0x1
            ? (rN += Ba(0x2d9) + q0[rP + 0x1][0x0] + ".")
            : (rN += ",\x20");
      }
      return rN;
    }
    var q2 = q1(),
      q3 = document[uf(0x992)](uf(0x1fe));
    (q3[uf(0x45d)] = function () {
      const Bb = uf;
      return nA(
        Bb(0x68c) +
          hP[Bb(0x201)] +
          Bb(0x52c) +
          hP[Bb(0xe3b)] +
          Bb(0xb2a) +
          hP[Bb(0x855)] +
          Bb(0x7f9) +
          q2 +
          Bb(0xd49)
      );
    }),
      (q3[uf(0x9ed)] = !![]);
    var q4 =
      Date[uf(0x796)]() < 0x18d932e3ffb + 0x3 * 0x18 * 0x3c * 0xea60
        ? 0x0
        : Math[uf(0xb02)](Math[uf(0xa69)]() * q0[uf(0x4cf)]);
    function q5() {
      const Bc = uf,
        rN = q0[q4];
      (pZ[Bc(0xb82)] = rN[0x0]), (pZ[Bc(0xc22)] = rN[0x1]);
      for (let rO of iZ) {
        pZ[rO] = Math[Bc(0xa69)]() > 0.5;
      }
      q4 = (q4 + 0x1) % q0[Bc(0x4cf)];
    }
    q5(),
      (q3[uf(0x4fe)] = function () {
        const Bd = uf;
        window[Bd(0x1cb)](pZ[Bd(0xc22)], Bd(0x35e)), q5();
      });
    var q6 = new lT(uf(0xce2), 0x0, -0x19, 0x0, 0x1, cY[uf(0xcdb)], 0x19);
    (q6[uf(0xe3c)] = 0x0), (q6[uf(0xd01)] = !![]);
    var q7 = [
        uf(0x869),
        uf(0x22d),
        uf(0x4e0),
        uf(0xd77),
        uf(0x8a8),
        uf(0x958),
        uf(0xe5c),
      ],
      q8 = [
        uf(0x4f0),
        uf(0xb1b),
        uf(0x553),
        uf(0x951),
        uf(0x71d),
        uf(0x78e),
        uf(0xd55),
        uf(0x699),
      ],
      q9 = 0x0;
    function qa() {
      const Be = uf,
        rN = {};
      (rN[Be(0xc5e)] = q7[q9 % q7[Be(0x4cf)]]),
        (rN[Be(0xbd1)] = !![]),
        (rN[Be(0xb95)] = n3["me"]),
        n7(Be(0xce2), rN),
        n7("yt", {
          text: q8[q9 % q8[Be(0x4cf)]][Be(0x6d2)](
            Be(0x389),
            kE[Be(0x6f8)][Be(0x517)]() || Be(0x482)
          ),
          isFakeChat: !![],
          col: n3["me"],
        }),
        q9++;
    }
    qa(), setInterval(qa, 0xfa0);
    var qb = 0x0,
      qc = Math[uf(0x333)](
        (Math[uf(0x525)](screen[uf(0x8df)], screen[uf(0xb7f)], kU(), kV()) *
          window[uf(0xe92)]) /
          0xc
      ),
      qd = new lT(-0x1, 0x0, 0x0, 0x0, 0x1, cY[uf(0xb28)], 0x19);
    (qd[uf(0x613)] = !![]), (qd[uf(0x4f3)] = 0x1), (qd[uf(0xd07)] = 0.6);
    var qe = (function () {
        const Bf = uf,
          rN = document[Bf(0xde7)](Bf(0xbb7)),
          rO = qc * 0x2;
        (rN[Bf(0x8df)] = rN[Bf(0xb7f)] = rO),
          (rN[Bf(0x35a)][Bf(0x8df)] = rN[Bf(0x35a)][Bf(0xb7f)] = Bf(0x1f7));
        const rP = document[Bf(0x992)](Bf(0x6a8));
        rP[Bf(0x962)](rN);
        const rQ = rN[Bf(0x1c6)]("2d");
        return (
          (rN[Bf(0x24b)] = function () {
            const Bg = Bf;
            (qd[Bg(0x9bc)] = ![]),
              rQ[Bg(0x651)](0x0, 0x0, rO, rO),
              rQ[Bg(0xc61)](),
              rQ[Bg(0x264)](rO / 0x64),
              rQ[Bg(0xd15)](0x32, 0x32),
              rQ[Bg(0x264)](0.8),
              rQ[Bg(0xa38)](-Math["PI"] / 0x8),
              qd[Bg(0xc34)](rQ),
              rQ[Bg(0xa10)]();
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
      qh = rN[Bh(0x5da)](Bh(0x3f6));
      const rO = qf * 0x64 + "%\x20" + qg * 0x64 + Bh(0xa1f),
        rP = nA(
          Bh(0x56f) +
            hQ[Bh(0x20a)](
              (rQ, rR) => Bh(0x6b6) + rR + Bh(0x8f8) + rQ + Bh(0xbbd)
            )[Bh(0x76a)]("\x0a") +
            Bh(0x303) +
            no[Bh(0x61e)] +
            Bh(0x707) +
            no[Bh(0x471)] +
            Bh(0x808) +
            no[Bh(0x20d)] +
            Bh(0x2f2) +
            dH +
            Bh(0xc11) +
            qh +
            Bh(0x6db) +
            rO +
            Bh(0xbf0) +
            rO +
            Bh(0x5ab) +
            rO +
            Bh(0xd1a) +
            rO +
            Bh(0x575)
        );
      document[Bh(0x92f)][Bh(0x962)](rP);
    }
    function qk(rN) {
      const Bi = uf,
        rO =
          -rN[Bi(0xa85)]["x"] * 0x64 +
          "%\x20" +
          -rN[Bi(0xa85)]["y"] * 0x64 +
          "%";
      return (
        Bi(0xb0c) +
        rO +
        Bi(0xc51) +
        rO +
        Bi(0xe32) +
        rO +
        Bi(0x980) +
        rO +
        ";\x22"
      );
    }
    if (document[uf(0x4df)] && document[uf(0x4df)][uf(0x3e1)]) {
      const rN = setTimeout(qj, 0x1f40);
      document[uf(0x4df)][uf(0x3e1)][uf(0x2c6)](() => {
        const Bj = uf;
        console[Bj(0x454)](Bj(0x6cc)), clearTimeout(rN), qj();
      });
    } else qj();
    var ql = [];
    qm();
    function qm() {
      const Bk = uf,
        rO = {};
      (qf = 0xf), (ql = []);
      let rP = 0x0;
      for (let rR = 0x0; rR < dC[Bk(0x4cf)]; rR++) {
        const rS = dC[rR],
          rT = Bk(0x638) + rS[Bk(0x786)] + "_" + (rS[Bk(0x457)] || 0x1),
          rU = rO[rT];
        if (rU === void 0x0) (rS[Bk(0xa85)] = rO[rT] = rQ()), ql[Bk(0x9ee)](rS);
        else {
          rS[Bk(0xa85)] = rU;
          continue;
        }
      }
      for (let rV = 0x0; rV < eK[Bk(0x4cf)]; rV++) {
        const rW = eK[rV],
          rX = Bk(0x1d4) + rW[Bk(0x786)],
          rY = rO[rX];
        if (rY === void 0x0) rW[Bk(0xa85)] = rO[rX] = rQ();
        else {
          rW[Bk(0xa85)] = rY;
          continue;
        }
      }
      function rQ() {
        const Bl = Bk;
        return { x: rP % qf, y: Math[Bl(0xb02)](rP / qf), index: rP++ };
      }
    }
    function qn(rO) {
      const Bm = uf,
        rP = ql[Bm(0x4cf)] + eL;
      qg = Math[Bm(0x333)](rP / qf);
      const rQ = document[Bm(0xde7)](Bm(0xbb7));
      (rQ[Bm(0x8df)] = rO * qf), (rQ[Bm(0xb7f)] = rO * qg);
      const rR = rQ[Bm(0x1c6)]("2d"),
        rS = 0x5a,
        rT = rS / 0x2,
        rU = rO / rS;
      rR[Bm(0xd07)](rU, rU), rR[Bm(0xd15)](rT, rT);
      for (let rV = 0x0; rV < ql[Bm(0x4cf)]; rV++) {
        const rW = ql[rV];
        rR[Bm(0xc61)](),
          rR[Bm(0xd15)](rW[Bm(0xa85)]["x"] * rS, rW[Bm(0xa85)]["y"] * rS),
          rR[Bm(0xc61)](),
          rR[Bm(0xd15)](0x0 + rW[Bm(0x73e)], -0x5 + rW[Bm(0x603)]),
          rW[Bm(0x461)](rR),
          rR[Bm(0xa10)](),
          (rR[Bm(0x2d4)] = Bm(0x7da)),
          (rR[Bm(0x52f)] = Bm(0x328)),
          (rR[Bm(0x7cd)] = Bm(0x424)),
          (rR[Bm(0x98b)] = Bm(0xe7b) + iA),
          (rR[Bm(0x38e)] = h5 ? 0x5 : 0x3),
          (rR[Bm(0x9a7)] = Bm(0x43e)),
          (rR[Bm(0xe5e)] = rR[Bm(0x92c)] = Bm(0x2d8)),
          rR[Bm(0xd15)](0x0, rT - 0x8 - rR[Bm(0x38e)]);
        let rX = rW[Bm(0x786)];
        h5 && (rX = h7(rX));
        const rY = rR[Bm(0x50e)](rX)[Bm(0x8df)] + rR[Bm(0x38e)],
          rZ = Math[Bm(0x36c)](0x4c / rY, 0x1);
        rR[Bm(0xd07)](rZ, rZ),
          rR[Bm(0x5e4)](rX, 0x0, 0x0),
          rR[Bm(0x512)](rX, 0x0, 0x0),
          rR[Bm(0xa10)]();
      }
      for (let s0 = 0x0; s0 < eL; s0++) {
        const s1 = eK[s0];
        rR[Bm(0xc61)](),
          rR[Bm(0xd15)](s1[Bm(0xa85)]["x"] * rS, s1[Bm(0xa85)]["y"] * rS),
          s1[Bm(0x2a8)] !== void 0x0 &&
            (rR[Bm(0xc3a)](), rR[Bm(0x942)](-rT, -rT, rS, rS), rR[Bm(0x94c)]()),
          rR[Bm(0xd15)](s1[Bm(0x73e)], s1[Bm(0x603)]),
          s1[Bm(0x461)](rR),
          rR[Bm(0xa10)]();
      }
      return rQ;
    }
    var qo = new lG(-0x1, cS[uf(0xaf9)], 0x0, 0x0, Math[uf(0xa69)]() * 6.28);
    qo[uf(0xc39)] = 0x32;
    function qp() {
      const Bn = uf;
      kj[Bn(0x54b)](j2 / 0x2, j2 / 0x2, j2 / 0x2, 0x0, Math["PI"] * 0x2);
    }
    function qq(rO) {
      const Bo = uf,
        rP = rO[Bo(0x4cf)],
        rQ = document[Bo(0xde7)](Bo(0xbb7));
      rQ[Bo(0x8df)] = rQ[Bo(0xb7f)] = rP;
      const rR = rQ[Bo(0x1c6)]("2d"),
        rS = rR[Bo(0xdca)](rP, rP);
      for (let rT = 0x0; rT < rP; rT++) {
        for (let rU = 0x0; rU < rP; rU++) {
          const rV = rO[rT][rU];
          if (!rV) continue;
          const rW = (rT * rP + rU) * 0x4;
          rS[Bo(0x1dc)][rW + 0x3] = 0xff;
        }
      }
      return rR[Bo(0xa41)](rS, 0x0, 0x0), rQ;
    }
    function qr() {
      const Bp = uf;
      if (!jK) return;
      kj[Bp(0xc61)](),
        kj[Bp(0xc3a)](),
        qp(),
        kj[Bp(0x94c)](),
        !jK[Bp(0xbb7)] && (jK[Bp(0xbb7)] = qq(jK)),
        (kj[Bp(0x488)] = ![]),
        (kj[Bp(0x28b)] = 0.08),
        kj[Bp(0x4e8)](jK[Bp(0xbb7)], 0x0, 0x0, j2, j2),
        kj[Bp(0xa10)]();
    }
    function qs() {
      const Bq = uf;
      lM = 0x0;
      const rO = kR * kW;
      qb = 0x0;
      for (let rT = 0x0; rT < nx[Bq(0x4cf)]; rT++) {
        const rU = nx[rT];
        rU[Bq(0xae5)] && rU[Bq(0x24b)]();
      }
      if (
        kk[Bq(0x35a)][Bq(0xbe5)] === "" ||
        document[Bq(0x92f)][Bq(0x2ae)][Bq(0xb8c)](Bq(0x888))
      ) {
        (kj[Bq(0x2d4)] = Bq(0x9aa)),
          kj[Bq(0x756)](0x0, 0x0, ki[Bq(0x8df)], ki[Bq(0xb7f)]),
          kj[Bq(0xc61)]();
        let rV = Math[Bq(0x525)](ki[Bq(0x8df)] / d0, ki[Bq(0xb7f)] / d1);
        kj[Bq(0xd07)](rV, rV),
          kj[Bq(0x942)](0x0, 0x0, d0, d1),
          kj[Bq(0xc61)](),
          kj[Bq(0xd15)](pG, -pG),
          kj[Bq(0xd07)](1.25, 1.25),
          (kj[Bq(0x2d4)] = kY),
          kj[Bq(0xec9)](),
          kj[Bq(0xa10)]();
        for (let rW = 0x0; rW < pj[Bq(0x4cf)]; rW++) {
          pj[rW][Bq(0xc34)](kj);
        }
        kj[Bq(0xa10)]();
        if (oV[Bq(0xcec)] && oY[Bq(0x286)] > 0x0) {
          const rX = oY[Bq(0x6de)]();
          kj[Bq(0xc61)]();
          let rY = kW;
          kj[Bq(0xd07)](rY, rY),
            kj[Bq(0xd15)](
              rX["x"] + rX[Bq(0x8df)] / 0x2,
              rX["y"] + rX[Bq(0xb7f)]
            ),
            kj[Bq(0x264)](kR * 0.8),
            q6[Bq(0xc34)](kj),
            kj[Bq(0xd07)](0.7, 0.7),
            q6[Bq(0xb7d)](kj),
            kj[Bq(0xa10)]();
        }
        if (q3[Bq(0x286)] > 0x0) {
          const rZ = q3[Bq(0x6de)]();
          kj[Bq(0xc61)]();
          let s0 = kW;
          kj[Bq(0xd07)](s0, s0),
            kj[Bq(0xd15)](
              rZ["x"] + rZ[Bq(0x8df)] / 0x2,
              rZ["y"] + rZ[Bq(0xb7f)] * 0.6
            ),
            kj[Bq(0x264)](kR * 0.8),
            pZ[Bq(0xc34)](kj),
            kj[Bq(0x264)](0.7),
            kj[Bq(0xc61)](),
            kj[Bq(0xd15)](0x0, -pZ[Bq(0xc39)] - 0x23),
            pt(kj, pZ[Bq(0xb82)], 0x12, Bq(0x7da), 0x3),
            kj[Bq(0xa10)](),
            pZ[Bq(0xb7d)](kj),
            kj[Bq(0xa10)]();
        }
        if (hm[Bq(0x286)] > 0x0) {
          const s1 = hm[Bq(0x6de)]();
          kj[Bq(0xc61)]();
          let s3 = kW;
          kj[Bq(0xd07)](s3, s3),
            kj[Bq(0xd15)](
              s1["x"] + s1[Bq(0x8df)] / 0x2,
              s1["y"] + s1[Bq(0xb7f)] * 0.5
            ),
            kj[Bq(0x264)](kR),
            qo[Bq(0xc34)](kj),
            kj[Bq(0xa10)]();
        }
        return;
      }
      if (jy)
        (kj[Bq(0x2d4)] = pI[0x0]),
          kj[Bq(0x756)](0x0, 0x0, ki[Bq(0x8df)], ki[Bq(0xb7f)]);
      else {
        kj[Bq(0xc61)](), qw();
        for (let s4 = -0x1; s4 < 0x4; s4++) {
          for (let s5 = -0x1; s5 < 0x4; s5++) {
            const s6 = Math[Bq(0x525)](0x0, Math[Bq(0x36c)](s5, 0x2)),
              s7 = Math[Bq(0x525)](0x0, Math[Bq(0x36c)](s4, 0x2));
            (kj[Bq(0x2d4)] = pI[s7 * 0x3 + s6]),
              kj[Bq(0x756)](s5 * j3, s4 * j3, j3, j3);
          }
        }
        kj[Bq(0xc3a)](),
          kj[Bq(0x942)](0x0, 0x0, j2, j2),
          kj[Bq(0x94c)](),
          kj[Bq(0xc3a)](),
          kj[Bq(0xd7c)](-0xa, j3),
          kj[Bq(0xbc9)](j3 * 0x2, j3),
          kj[Bq(0xd7c)](j3 * 0x2, j3 * 0.5),
          kj[Bq(0xbc9)](j3 * 0x2, j3 * 1.5),
          kj[Bq(0xd7c)](j3 * 0x1, j3 * 0x2),
          kj[Bq(0xbc9)](j2 + 0xa, j3 * 0x2),
          kj[Bq(0xd7c)](j3, j3 * 1.5),
          kj[Bq(0xbc9)](j3, j3 * 2.5),
          (kj[Bq(0x38e)] = pY * 0x2),
          (kj[Bq(0xe5e)] = Bq(0x2d8)),
          (kj[Bq(0x9a7)] = pX),
          kj[Bq(0x2c1)](),
          kj[Bq(0xa10)]();
      }
      kj[Bq(0xc61)](),
        kj[Bq(0xc3a)](),
        kj[Bq(0x942)](0x0, 0x0, ki[Bq(0x8df)], ki[Bq(0xb7f)]),
        qw();
      oV[Bq(0x440)] && ((kj[Bq(0x2d4)] = kY), kj[Bq(0xec9)]());
      kj[Bq(0xc3a)]();
      jy ? qp() : kj[Bq(0x942)](0x0, 0x0, j2, j2);
      kj[Bq(0xa10)](),
        kj[Bq(0x942)](0x0, 0x0, ki[Bq(0x8df)], ki[Bq(0xb7f)]),
        (kj[Bq(0x2d4)] = pX),
        kj[Bq(0xec9)](Bq(0x2b2)),
        kj[Bq(0xc61)](),
        qw();
      oV[Bq(0xa8d)] && pR();
      qr();
      const rP = [];
      let rQ = [];
      for (let s8 = 0x0; s8 < iw[Bq(0x4cf)]; s8++) {
        const s9 = iw[s8];
        if (s9[Bq(0x231)]) {
          if (iy) {
            if (
              pz - s9[Bq(0xc79)] < 0x3e8 ||
              Math[Bq(0x78b)](s9["nx"] - iy["x"], s9["ny"] - iy["y"]) <
                Math[Bq(0x78b)](s9["ox"] - iy["x"], s9["oy"] - iy["y"])
            ) {
              rP[Bq(0x9ee)](s9), (s9[Bq(0xc79)] = pz);
              continue;
            }
          }
        }
        s9 !== iy && rQ[Bq(0x9ee)](s9);
      }
      (rQ = qt(rQ, (sa) => sa[Bq(0x2dc)] === cS[Bq(0x3aa)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x2dc)] === cS[Bq(0xdb4)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x2dc)] === cS[Bq(0x588)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0x71a)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0xb46)])),
        (rQ = qt(rQ, (sa) => sa[Bq(0xb21)] && !sa[Bq(0x30e)])),
        (rQ = qt(rQ, (sa) => !sa[Bq(0x30e)])),
        qt(rQ, (sa) => !![]);
      iy && iy[Bq(0xc34)](kj);
      for (let sa = 0x0; sa < rP[Bq(0x4cf)]; sa++) {
        rP[sa][Bq(0xc34)](kj);
      }
      if (oV[Bq(0x8cd)]) {
        kj[Bq(0xc3a)]();
        for (let sb = 0x0; sb < iw[Bq(0x4cf)]; sb++) {
          const sc = iw[sb];
          if (sc[Bq(0x613)]) continue;
          if (sc[Bq(0x9ad)]) {
            kj[Bq(0xc61)](),
              kj[Bq(0xd15)](sc["x"], sc["y"]),
              kj[Bq(0xa38)](sc[Bq(0x297)]);
            if (!sc[Bq(0x775)])
              kj[Bq(0x942)](-sc[Bq(0xc39)], -0xa, sc[Bq(0xc39)] * 0x2, 0x14);
            else {
              kj[Bq(0xd7c)](-sc[Bq(0xc39)], -0xa),
                kj[Bq(0xbc9)](-sc[Bq(0xc39)], 0xa);
              const sd = 0xa + sc[Bq(0x775)] * sc[Bq(0xc39)] * 0x2;
              kj[Bq(0xbc9)](sc[Bq(0xc39)], sd),
                kj[Bq(0xbc9)](sc[Bq(0xc39)], -sd),
                kj[Bq(0xbc9)](-sc[Bq(0xc39)], -0xa);
            }
            kj[Bq(0xa10)]();
          } else
            kj[Bq(0xd7c)](sc["x"] + sc[Bq(0xc39)], sc["y"]),
              kj[Bq(0x54b)](sc["x"], sc["y"], sc[Bq(0xc39)], 0x0, l0);
        }
        (kj[Bq(0x38e)] = 0x2), (kj[Bq(0x9a7)] = Bq(0x20d)), kj[Bq(0x2c1)]();
      }
      const rR = oV[Bq(0x43d)] ? 0x1 / qy() : 0x1;
      for (let se = 0x0; se < iw[Bq(0x4cf)]; se++) {
        const sf = iw[se];
        !sf[Bq(0xb21)] && sf[Bq(0xaa4)] && lY(sf, kj, rR);
      }
      for (let sg = 0x0; sg < iw[Bq(0x4cf)]; sg++) {
        const sh = iw[sg];
        sh[Bq(0xc87)] && sh[Bq(0xb7d)](kj, rR);
      }
      const rS = pA / 0x12;
      kj[Bq(0xc61)](),
        (kj[Bq(0x38e)] = 0x7),
        (kj[Bq(0x9a7)] = Bq(0x7da)),
        (kj[Bq(0xe5e)] = kj[Bq(0x92c)] = Bq(0x997));
      for (let si = iF[Bq(0x4cf)] - 0x1; si >= 0x0; si--) {
        const sj = iF[si];
        sj["a"] -= pA / 0x1f4;
        if (sj["a"] <= 0x0) {
          iF[Bq(0x708)](si, 0x1);
          continue;
        }
        (kj[Bq(0x28b)] = sj["a"]), kj[Bq(0x2c1)](sj[Bq(0x601)]);
      }
      kj[Bq(0xa10)]();
      if (oV[Bq(0x9c8)])
        for (let sk = iz[Bq(0x4cf)] - 0x1; sk >= 0x0; sk--) {
          const sl = iz[sk];
          (sl["x"] += sl["vx"] * rS),
            (sl["y"] += sl["vy"] * rS),
            (sl["vy"] += 0.35 * rS);
          if (sl["vy"] > 0xa) {
            iz[Bq(0x708)](sk, 0x1);
            continue;
          }
          kj[Bq(0xc61)](),
            kj[Bq(0xd15)](sl["x"], sl["y"]),
            (kj[Bq(0x28b)] = 0x1 - Math[Bq(0x525)](0x0, sl["vy"] / 0xa)),
            kj[Bq(0xd07)](sl[Bq(0xc39)], sl[Bq(0xc39)]),
            sl[Bq(0xc5e)] !== void 0x0
              ? pt(kj, sl[Bq(0xc5e)], 0x15, Bq(0x9ff), 0x2, ![], sl[Bq(0xc39)])
              : (kj[Bq(0xa38)](sl[Bq(0x297)]),
                pq(kj, Bq(0x465) + sl[Bq(0xc39)], 0x1e, 0x1e, function (sm) {
                  const Br = Bq;
                  sm[Br(0xd15)](0xf, 0xf), nm(sm);
                })),
            kj[Bq(0xa10)]();
        }
      kj[Bq(0xa10)]();
      if (iy && oV[Bq(0xc80)] && !oV[Bq(0xcfa)]) {
        kj[Bq(0xc61)](),
          kj[Bq(0xd15)](ki[Bq(0x8df)] / 0x2, ki[Bq(0xb7f)] / 0x2),
          kj[Bq(0xa38)](Math[Bq(0x84f)](mX, mW)),
          kj[Bq(0xd07)](rO, rO);
        const sm = 0x28;
        let sn = Math[Bq(0x78b)](mW, mX) / kR;
        kj[Bq(0xc3a)](),
          kj[Bq(0xd7c)](sm, 0x0),
          kj[Bq(0xbc9)](sn, 0x0),
          kj[Bq(0xbc9)](sn + -0x14, -0x14),
          kj[Bq(0xd7c)](sn, 0x0),
          kj[Bq(0xbc9)](sn + -0x14, 0x14),
          (kj[Bq(0x38e)] = 0xc),
          (kj[Bq(0xe5e)] = Bq(0x2d8)),
          (kj[Bq(0x92c)] = Bq(0x2d8)),
          (kj[Bq(0x28b)] =
            sn < 0x64 ? Math[Bq(0x525)](sn - 0x32, 0x0) / 0x32 : 0x1),
          (kj[Bq(0x9a7)] = Bq(0x92d)),
          kj[Bq(0x2c1)](),
          kj[Bq(0xa10)]();
      }
      kj[Bq(0xc61)](),
        kj[Bq(0xd07)](rO, rO),
        kj[Bq(0xd15)](0x28, 0x1e + 0x32),
        kj[Bq(0x264)](0.85);
      for (let so = 0x0; so < px[Bq(0x4cf)]; so++) {
        const sp = px[so];
        if (so > 0x0) {
          const sq = lI(Math[Bq(0x525)](sp[Bq(0x44d)] - 0.5, 0x0) / 0.5);
          kj[Bq(0xd15)](0x0, (so === 0x0 ? 0x46 : 0x41) * (0x1 - sq));
        }
        kj[Bq(0xc61)](),
          so > 0x0 &&
            (kj[Bq(0xd15)](lI(sp[Bq(0x44d)]) * -0x190, 0x0),
            kj[Bq(0x264)](0.85)),
          kj[Bq(0xc61)](),
          lZ(sp, kj, !![]),
          (sp["id"] = (sp[Bq(0x511)] && sp[Bq(0x511)]["id"]) || -0x1),
          sp[Bq(0xc34)](kj),
          (sp["id"] = -0x1),
          kj[Bq(0xa10)](),
          sp[Bq(0xdb5)] !== void 0x0 &&
            (kj[Bq(0xc61)](),
            kj[Bq(0xa38)](sp[Bq(0xdb5)]),
            kj[Bq(0xd15)](0x20, 0x0),
            kj[Bq(0xc3a)](),
            kj[Bq(0xd7c)](0x0, 0x6),
            kj[Bq(0xbc9)](0x0, -0x6),
            kj[Bq(0xbc9)](0x6, 0x0),
            kj[Bq(0x5fb)](),
            (kj[Bq(0x38e)] = 0x4),
            (kj[Bq(0xe5e)] = kj[Bq(0x92c)] = Bq(0x2d8)),
            (kj[Bq(0x9a7)] = Bq(0xe26)),
            kj[Bq(0x2c1)](),
            (kj[Bq(0x2d4)] = Bq(0x7da)),
            kj[Bq(0xec9)](),
            kj[Bq(0xa10)]()),
          kj[Bq(0xa10)]();
      }
      kj[Bq(0xa10)]();
    }
    function qt(rO, rP) {
      const Bs = uf,
        rQ = [];
      for (let rR = 0x0; rR < rO[Bs(0x4cf)]; rR++) {
        const rS = rO[rR];
        if (rP[Bs(0xc25)] !== void 0x0 ? rP(rS) : rS[rP]) rS[Bs(0xc34)](kj);
        else rQ[Bs(0x9ee)](rS);
      }
      return rQ;
    }
    var qu = 0x0,
      qv = 0x0;
    function qw() {
      const Bt = uf;
      kj[Bt(0xd15)](ki[Bt(0x8df)] / 0x2, ki[Bt(0xb7f)] / 0x2);
      let rO = qx();
      kj[Bt(0xd07)](rO, rO),
        kj[Bt(0xd15)](-pd, -pe),
        oV[Bt(0xbf4)] && kj[Bt(0xd15)](qu, qv);
    }
    function qx() {
      const Bu = uf;
      return Math[Bu(0x525)](ki[Bu(0x8df)] / d0, ki[Bu(0xb7f)] / d1) * qy();
    }
    function qy() {
      return n1 / ph;
    }
    kX(), pD();
    const qz = {};
    (qz[uf(0xc25)] = uf(0x7c3)),
      (qz[uf(0xc22)] = uf(0x5aa)),
      (qz[uf(0x5f4)] = uf(0x9c6));
    const qA = {};
    (qA[uf(0xc25)] = uf(0xbe2)),
      (qA[uf(0xc22)] = uf(0x255)),
      (qA[uf(0x5f4)] = uf(0xaf1));
    const qB = {};
    (qB[uf(0xc25)] = uf(0xe64)),
      (qB[uf(0xc22)] = uf(0x373)),
      (qB[uf(0x5f4)] = uf(0x3cd));
    const qC = {};
    (qC[uf(0xc25)] = uf(0x24a)),
      (qC[uf(0xc22)] = uf(0x6ba)),
      (qC[uf(0x5f4)] = uf(0xa00));
    const qD = {};
    (qD[uf(0xc25)] = uf(0x68a)),
      (qD[uf(0xc22)] = uf(0xb92)),
      (qD[uf(0x5f4)] = uf(0xb45));
    const qE = {};
    (qE[uf(0xc25)] = uf(0x3b8)),
      (qE[uf(0xc22)] = uf(0xa33)),
      (qE[uf(0x5f4)] = uf(0x2c9));
    const qF = {};
    (qF[uf(0xaa6)] = qz),
      (qF[uf(0x85c)] = qA),
      (qF[uf(0xa1c)] = qB),
      (qF[uf(0xa7a)] = qC),
      (qF[uf(0xbae)] = qD),
      (qF[uf(0x717)] = qE);
    var qG = qF;
    if (window[uf(0xc5a)][uf(0x64b)] !== uf(0xd28))
      for (let rO in qG) {
        const rP = qG[rO];
        rP[uf(0xc22)] = rP[uf(0xc22)]
          [uf(0x6d2)](uf(0xd28), uf(0x4d2))
          [uf(0x6d2)](uf(0x6da), uf(0x64f));
      }
    var qH = document[uf(0x992)](uf(0x9c3)),
      qI = document[uf(0x992)](uf(0x40b)),
      qJ = 0x0;
    for (let rQ in qG) {
      const rR = qG[rQ],
        rS = document[uf(0xde7)](uf(0xe04));
      rS[uf(0xe6a)] = uf(0x462);
      const rT = document[uf(0xde7)](uf(0xb61));
      rT[uf(0x99c)](uf(0x2c1), rR[uf(0xc25)]), rS[uf(0x962)](rT);
      const rU = document[uf(0xde7)](uf(0xb61));
      (rU[uf(0xe6a)] = uf(0xcda)),
        (rR[uf(0xcc1)] = 0x0),
        (rR[uf(0x4dd)] = function (rV) {
          const Bv = uf;
          (qJ -= rR[Bv(0xcc1)]),
            (rR[Bv(0xcc1)] = rV),
            (qJ += rV),
            k8(rU, kh(rV, Bv(0x8f6))),
            rS[Bv(0x962)](rU);
          const rW = Bv(0x582) + kh(qJ, Bv(0x8f6)) + Bv(0x565);
          k8(qK, rW), k8(qI, rW);
        }),
        (rR[uf(0x4ca)] = function () {
          const Bw = uf;
          rR[Bw(0x4dd)](0x0), rU[Bw(0x218)]();
        }),
        (rS[uf(0x35a)][uf(0x8a5)] = rR[uf(0x5f4)]),
        qH[uf(0x962)](rS),
        (rS[uf(0x4fe)] = function () {
          const Bx = uf,
            rV = qH[Bx(0x992)](Bx(0xa52));
          if (rV === rS) return;
          rV && rV[Bx(0x2ae)][Bx(0x218)](Bx(0x233)),
            this[Bx(0x2ae)][Bx(0x6b1)](Bx(0x233)),
            qN(rR[Bx(0xc22)]),
            (hD[Bx(0xd0e)] = rQ);
        }),
        (rR["el"] = rS);
    }
    var qK = document[uf(0xde7)](uf(0xb61));
    (qK[uf(0xe6a)] = uf(0xae2)), qH[uf(0x962)](qK);
    if (!![]) {
      qL();
      let rV = Date[uf(0x796)]();
      setInterval(function () {
        pz - rV > 0x2710 && (qL(), (rV = pz));
      }, 0x3e8);
    }
    function qL() {
      const By = uf;
      fetch(By(0xc9e))
        [By(0x2c6)]((rW) => rW[By(0xb76)]())
        [By(0x2c6)]((rW) => {
          const Bz = By;
          for (let rX in rW) {
            const rY = qG[rX];
            rY && rY[Bz(0x4dd)](rW[rX]);
          }
        })
        [By(0x844)]((rW) => {
          const BA = By;
          console[BA(0x88f)](BA(0xa2c), rW);
        });
    }
    var qM = window[uf(0x2eb)] || window[uf(0xc5a)][uf(0xad3)] === uf(0x8da);
    if (qM) hV(window[uf(0xc5a)][uf(0x256)][uf(0x6d2)](uf(0x7a5), "ws"));
    else {
      const rW = qG[hD[uf(0xd0e)]];
      if (rW) rW["el"][uf(0x5f2)]();
      else {
        let rX = "EU";
        fetch(uf(0x9b1))
          [uf(0x2c6)]((rY) => rY[uf(0xb76)]())
          [uf(0x2c6)]((rY) => {
            const BB = uf;
            if (["NA", "SA"][BB(0x637)](rY[BB(0xa42)])) rX = "US";
            else ["AS", "OC"][BB(0x637)](rY[BB(0xa42)]) && (rX = "AS");
          })
          [uf(0x844)]((rY) => {
            const BC = uf;
            console[BC(0x454)](BC(0xd40));
          })
          [uf(0xb9e)](function () {
            const BD = uf,
              rY = [];
            for (let s0 in qG) {
              const s1 = qG[s0];
              s1[BD(0xc25)][BD(0x79d)](rX) && rY[BD(0x9ee)](s1);
            }
            const rZ =
              rY[Math[BD(0xb02)](Math[BD(0xa69)]() * rY[BD(0x4cf)])] ||
              qG[BD(0x937)];
            console[BD(0x454)](BD(0x931) + rX + BD(0xca1) + rZ[BD(0xc25)]),
              rZ["el"][BD(0x5f2)]();
          });
      }
    }
    (document[uf(0x992)](uf(0x3d0))[uf(0x35a)][uf(0xbe5)] = uf(0x5d0)),
      kA[uf(0x2ae)][uf(0x6b1)](uf(0xa7d)),
      kB[uf(0x2ae)][uf(0x218)](uf(0xa7d)),
      (window[uf(0x244)] = function () {
        il(new Uint8Array([0xff]));
      });
    function qN(rY) {
      const BE = uf;
      clearTimeout(kF), iu();
      const rZ = {};
      (rZ[BE(0xc22)] = rY), (hU = rZ), kg(!![]);
    }
    window[uf(0x834)] = qN;
    var qO = null;
    function qP(rY) {
      const BF = uf;
      if (!rY || typeof rY !== BF(0xe77)) {
        console[BF(0x454)](BF(0x58b));
        return;
      }
      if (qO) qO[BF(0x4da)]();
      const rZ = rY[BF(0x95c)] || {},
        s0 = {};
      (s0[BF(0xa83)] = BF(0xe87)),
        (s0[BF(0x74f)] = BF(0x4a9)),
        (s0[BF(0xb66)] = BF(0x53b)),
        (s0[BF(0x719)] = BF(0xe3b)),
        (s0[BF(0xda9)] = !![]),
        (s0[BF(0x86a)] = !![]),
        (s0[BF(0xddd)] = ""),
        (s0[BF(0x5a5)] = ""),
        (s0[BF(0x93f)] = !![]),
        (s0[BF(0x89d)] = !![]);
      const s1 = s0;
      for (let s7 in s1) {
        (rZ[s7] === void 0x0 || rZ[s7] === null) && (rZ[s7] = s1[s7]);
      }
      const s2 = [];
      for (let s8 in rZ) {
        s1[s8] === void 0x0 && s2[BF(0x9ee)](s8);
      }
      s2[BF(0x4cf)] > 0x0 &&
        console[BF(0x454)](BF(0x8be) + s2[BF(0x76a)](",\x20"));
      rZ[BF(0xddd)] === "" && rZ[BF(0x5a5)] === "" && (rZ[BF(0xddd)] = "x");
      (rZ[BF(0x74f)] = hP[rZ[BF(0x74f)]] || rZ[BF(0x74f)]),
        (rZ[BF(0x719)] = hP[rZ[BF(0x719)]] || rZ[BF(0x719)]);
      const s3 = nA(
        BF(0xc8e) +
          rZ[BF(0xa83)] +
          BF(0x570) +
          rZ[BF(0x74f)] +
          BF(0x3ee) +
          (rZ[BF(0xb66)]
            ? BF(0xc1a) +
              rZ[BF(0xb66)] +
              "\x22\x20" +
              (rZ[BF(0x719)] ? BF(0xbbe) + rZ[BF(0x719)] + "\x22" : "") +
              BF(0x74b)
            : "") +
          BF(0x3f8)
      );
      (qO = s3),
        (s3[BF(0x4da)] = function () {
          const BG = BF;
          document[BG(0x92f)][BG(0x2ae)][BG(0x218)](BG(0x888)),
            s3[BG(0x218)](),
            (qO = null);
        }),
        (s3[BF(0x992)](BF(0xd4a))[BF(0x4fe)] = s3[BF(0x4da)]);
      const s4 = s3[BF(0x992)](BF(0xcf2)),
        s5 = [],
        s6 = [];
      for (let s9 in rY) {
        if (s9 === BF(0x95c)) continue;
        const sa = rY[s9];
        let sb = [];
        const sc = Array[BF(0x59e)](sa);
        let sd = 0x0;
        if (sc)
          for (let se = 0x0; se < sa[BF(0x4cf)]; se++) {
            const sf = sa[se],
              sg = dF[sf];
            if (!sg) {
              s5[BF(0x9ee)](sf);
              continue;
            }
            sd++, sb[BF(0x9ee)]([sf, void 0x0]);
          }
        else
          for (let sh in sa) {
            const si = dF[sh];
            if (!si) {
              s5[BF(0x9ee)](sh);
              continue;
            }
            const sj = sa[sh];
            (sd += sj), sb[BF(0x9ee)]([sh, sj]);
          }
        if (sb[BF(0x4cf)] === 0x0) continue;
        s6[BF(0x9ee)]([sd, s9, sb, sc]);
      }
      rZ[BF(0x89d)] && s6[BF(0x76e)]((sk, sl) => sl[0x0] - sk[0x0]);
      for (let sk = 0x0; sk < s6[BF(0x4cf)]; sk++) {
        const [sl, sm, sn, so] = s6[sk];
        rZ[BF(0x93f)] && !so && sn[BF(0x76e)]((ss, st) => st[0x1] - ss[0x1]);
        let sp = "";
        rZ[BF(0xda9)] && (sp += sk + 0x1 + ".\x20");
        sp += sm;
        const sq = nA(BF(0xc06) + sp + BF(0x5c7));
        s4[BF(0x962)](sq);
        const sr = nA(BF(0xb96));
        for (let ss = 0x0; ss < sn[BF(0x4cf)]; ss++) {
          const [st, su] = sn[ss],
            sv = dF[st],
            sw = nA(
              BF(0xdb9) + sv[BF(0xb9c)] + "\x22\x20" + qk(sv) + BF(0x74b)
            );
          if (!so && rZ[BF(0x86a)]) {
            const sx = rZ[BF(0xddd)] + k9(su) + rZ[BF(0x5a5)],
              sy = nA(BF(0x4f4) + sx + BF(0x5c7));
            sx[BF(0x4cf)] > 0x6 && sy[BF(0x2ae)][BF(0x6b1)](BF(0xcda)),
              sw[BF(0x962)](sy);
          }
          (sw[BF(0x45d)] = sv), sr[BF(0x962)](sw);
        }
        s4[BF(0x962)](sr);
      }
      kl[BF(0x962)](s3),
        s5[BF(0x4cf)] > 0x0 &&
          console[BF(0x454)](BF(0xa9e) + s5[BF(0x76a)](",\x20")),
        document[BF(0x92f)][BF(0x2ae)][BF(0x6b1)](BF(0x888));
    }
    (window[uf(0x59b)] = qP),
      (document[uf(0x92f)][uf(0x853)] = function (rY) {
        const BH = uf;
        rY[BH(0x56b)]();
        const rZ = rY[BH(0xadb)][BH(0x29f)][0x0];
        if (rZ && rZ[BH(0x2dc)] === BH(0x8b3)) {
          console[BH(0x454)](BH(0x1de) + rZ[BH(0xc25)] + BH(0xb3c));
          const s0 = new FileReader();
          (s0[BH(0xeae)] = function (s1) {
            const BI = BH,
              s2 = s1[BI(0x6f7)][BI(0xbc1)];
            try {
              const s3 = JSON[BI(0x55c)](s2);
              qP(s3);
            } catch (s4) {
              console[BI(0x88f)](BI(0x5c3), s4);
            }
          }),
            s0[BH(0x4dc)](rZ);
        }
      }),
      (document[uf(0x92f)][uf(0x8dd)] = function (rY) {
        const BJ = uf;
        rY[BJ(0x56b)]();
      }),
      Object[uf(0x84b)](window, uf(0x9a5), {
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
